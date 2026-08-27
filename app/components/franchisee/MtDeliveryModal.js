import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bike, CheckCircle2, ExternalLink, Loader2, MapPin, RefreshCw, X } from 'lucide-react';
import { supabase } from '/app/lib/supabase.js';
const MT_TAG = /\n?\[\[MT_ENTREGAS:([^\]]+)\]\]\s*$/s;
export function getMtMeta(notes) {
    const match = String(notes ?? '').match(MT_TAG);
    if (!match)
        return null;
    try {
        return JSON.parse(decodeURIComponent(match[1]));
    }
    catch {
        return null;
    }
}
export function withoutMtMeta(notes) {
    return String(notes ?? '').replace(MT_TAG, '').trim();
}
function withMtMeta(notes, meta) {
    const clean = withoutMtMeta(notes);
    const tag = `[[MT_ENTREGAS:${encodeURIComponent(JSON.stringify(meta))}]]`;
    return clean ? `${clean}\n${tag}` : tag;
}
const PAYMENT_OPTIONS = [
    { value: 'D', label: 'Dinheiro' },
    { value: 'B', label: 'Débito' },
    { value: 'C', label: 'Crédito' },
    { value: 'X', label: 'PIX' },
    { value: 'P', label: 'PicPay' },
    { value: 'H', label: 'WhatsApp' },
    { value: 'F', label: 'Faturado' },
    { value: 'R', label: 'Carteira de créditos' },
];
const PAYMENT_FROM_ORDER = {
    cash: 'D',
    debit_card: 'B',
    credit_card: 'C',
    pix: 'X',
};
function parseCityState(value) {
    const match = value.trim().match(/^(.+?)(?:\s*[-/]\s*)([A-Za-z]{2})$/);
    if (!match)
        return { city: '', state: '' };
    return { city: match[1].trim(), state: match[2].toUpperCase() };
}
function parseAddress(raw, fallbackCity = '', fallbackState = '') {
    const parts = String(raw ?? '').split(',').map(p => p.trim()).filter(Boolean);
    let city = fallbackCity;
    let state = fallbackState;
    let neighborhood = '';
    let address = String(raw ?? '').trim();
    if (parts.length >= 4) {
        const tail = parseCityState(parts[parts.length - 1]);
        if (tail.city) {
            city = tail.city;
            state = tail.state;
            neighborhood = parts[parts.length - 2];
            address = parts.slice(0, -2).join(', ');
        }
        else {
            neighborhood = parts[parts.length - 1];
            address = parts.slice(0, -1).join(', ');
        }
    }
    else if (parts.length >= 3) {
        neighborhood = parts[parts.length - 1];
        address = parts.slice(0, -1).join(', ');
    }
    return { address, neighborhood, city, state };
}
function errorMessage(data, fallback) {
    if (!data)
        return fallback;
    if (typeof data.error === 'string')
        return data.error;
    if (typeof data.message === 'string')
        return data.message;
    if (Array.isArray(data.errors) && data.errors.length)
        return data.errors.join(', ');
    if (Array.isArray(data.mensagens) && data.mensagens.length)
        return data.mensagens.join(', ');
    return fallback;
}
function findDeliveryId(data) {
    const direct = data?.id_mch ?? data?.delivery_id ?? data?.solicitacao_id ?? data?.data?.id_mch ?? data?.data?.delivery_id ?? data?.data?.id;
    if (direct !== undefined && direct !== null && String(direct).trim())
        return String(direct);
    if (data && typeof data === 'object') {
        for (const value of Object.values(data)) {
            if (value && typeof value === 'object') {
                const nested = findDeliveryId(value);
                if (nested)
                    return nested;
            }
        }
    }
    return null;
}
function findTrackingUrl(data) {
    const candidates = [
        data?.tracking_url,
        data?.link_rastreio,
        data?.link,
        data?.url,
        data?.data?.tracking_url,
        data?.data?.link_rastreio,
        data?.data?.link,
        data?.data?.url,
    ];
    for (const value of candidates) {
        if (typeof value === 'string' && /^https?:\/\//i.test(value))
            return value;
    }
    if (data && typeof data === 'object') {
        for (const value of Object.values(data)) {
            if (value && typeof value === 'object') {
                const nested = findTrackingUrl(value);
                if (nested)
                    return nested;
            }
        }
    }
    return null;
}
function quoteDetails(data) {
    const source = data?.data?.estimativa ?? data?.estimativa ?? data?.data ?? data ?? {};
    return {
        price: source?.estimativa_valor ?? source?.valor ?? source?.preco ?? source?.valor_estimado ?? null,
        minutes: source?.estimativa_tempo_minutos ?? source?.tempo_minutos ?? source?.tempo ?? null,
        km: source?.estimativa_km ?? source?.km ?? source?.distancia ?? null,
    };
}
function money(value) {
    const n = Number(String(value ?? '').replace(',', '.'));
    return Number.isFinite(n) ? `R$ ${n.toFixed(2).replace('.', ',')}` : null;
}
export default function MtDeliveryModal({ order, franchiseId, onClose, onSuccess }) {
    const existingMeta = getMtMeta(order.notes);
    const [settings, setSettings] = useState(null);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState(existingMeta?.payment || PAYMENT_FROM_ORDER[order.payment_method ?? ''] || 'X');
    const [showAddress, setShowAddress] = useState(false);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [quote, setQuote] = useState(null);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [location, setLocation] = useState({
        pickupAddress: '',
        pickupNeighborhood: '',
        pickupCity: '',
        pickupState: '',
        deliveryAddress: order.address ?? '',
        deliveryNeighborhood: '',
        deliveryCity: '',
        deliveryState: '',
        deliveryReference: order.customer_reference ?? '',
    });
    const credentialsReady = Boolean(settings?.mt_entregas_username && settings?.mt_entregas_password);
    const addressReady = Boolean(location.pickupAddress &&
        (settings?.latitude != null && settings?.longitude != null ? true : location.pickupNeighborhood) &&
        location.pickupCity && location.pickupState &&
        location.deliveryAddress && location.deliveryNeighborhood && location.deliveryCity && location.deliveryState);
    const callMt = async (action, payload) => {
        if (!settings?.mt_entregas_username || !settings?.mt_entregas_password) {
            throw new Error('As credenciais da MT Entregas não estão preenchidas em Delivery.');
        }
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        const response = await fetch(`${"https://sgvojdgbjvynnoherpqj.supabase.co"}/functions/v1/mt-entregas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndm9qZGdianZ5bm5vaGVycHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDE4ODIsImV4cCI6MjEwMTMxNzg4Mn0.RuAHGD0VCcDxIL4jfSFXjyiC4ZzVgRAZna3j80ovIf4",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                action,
                payload: {
                    ...payload,
                    basic_auth: {
                        username: settings.mt_entregas_username,
                        password: settings.mt_entregas_password,
                    },
                },
            }),
        });
        const data = await response.json().catch(() => ({}));
        return { response, data };
    };
    useEffect(() => {
        let active = true;
        (async () => {
            setLoadingSettings(true);
            setError('');
            const [{ data, error: loadError }, { data: fiscalData }] = await Promise.all([
                supabase.from('delivery_settings').select('*').eq('franchise_id', franchiseId).maybeSingle(),
                supabase.from('fiscal_settings').select('address, city, uf').eq('franchise_id', franchiseId).maybeSingle(),
            ]);
            if (!active)
                return;
            if (loadError || !data) {
                setError(loadError?.message || 'Configurações de delivery não encontradas.');
                setLoadingSettings(false);
                return;
            }
            const s = data;
            setSettings(s);
            const savedRaw = localStorage.getItem(`mt-entregas-location:${franchiseId}`);
            let saved = {};
            try {
                saved = savedRaw ? JSON.parse(savedRaw) : {};
            }
            catch {
                saved = {};
            }
            const fiscal = fiscalData;
            const storeRawAddress = s.address || fiscal?.address || '';
            const storeParsed = parseAddress(storeRawAddress, fiscal?.city || saved.city || '', fiscal?.uf || saved.state || '');
            const inferredCity = storeParsed.city || fiscal?.city || saved.city || '';
            const inferredState = storeParsed.state || fiscal?.uf || saved.state || '';
            const deliveryParsed = parseAddress(order.address, inferredCity, inferredState);
            setLocation({
                pickupAddress: storeParsed.address || storeRawAddress,
                pickupNeighborhood: storeParsed.neighborhood || saved.pickupNeighborhood || '',
                pickupCity: inferredCity,
                pickupState: inferredState,
                deliveryAddress: deliveryParsed.address || order.address || '',
                deliveryNeighborhood: deliveryParsed.neighborhood || '',
                deliveryCity: deliveryParsed.city || inferredCity,
                deliveryState: deliveryParsed.state || inferredState,
                deliveryReference: order.customer_reference ?? '',
            });
            if (!inferredCity || !inferredState || !deliveryParsed.neighborhood)
                setShowAddress(true);
            setLoadingSettings(false);
        })();
        return () => { active = false; };
    }, [franchiseId, order.address, order.customer_reference]);
    const loadQuote = async () => {
        if (!settings)
            return;
        if (!credentialsReady) {
            setError('Ative e preencha o login e a senha da MT Entregas em Delivery.');
            return;
        }
        if (!addressReady) {
            setShowAddress(true);
            setError('Confira os dados de coleta e destino destacados antes de calcular.');
            return;
        }
        setQuoteLoading(true);
        setQuote(null);
        setError('');
        try {
            localStorage.setItem(`mt-entregas-location:${franchiseId}`, JSON.stringify({
                city: location.pickupCity,
                state: location.pickupState,
                pickupNeighborhood: location.pickupNeighborhood,
            }));
            const { response, data } = await callMt('quote', {
                pickup_address: location.pickupAddress,
                pickup_neighborhood: location.pickupNeighborhood,
                pickup_city: location.pickupCity,
                pickup_state: location.pickupState,
                pickup_lat: settings.latitude,
                pickup_lng: settings.longitude,
                delivery_address: location.deliveryAddress,
                delivery_neighborhood: location.deliveryNeighborhood,
                delivery_city: location.deliveryCity,
                delivery_state: location.deliveryState,
                category_id: settings.mt_entregas_category_id ?? undefined,
            });
            if (!response.ok || data?.success === false)
                throw new Error(errorMessage(data, 'A MT Entregas não aceitou os dados para estimativa.'));
            setQuote(data);
        }
        catch (err) {
            setError(err?.message || 'Não foi possível consultar a estimativa da MT Entregas.');
        }
        finally {
            setQuoteLoading(false);
        }
    };
    useEffect(() => {
        if (!loadingSettings && settings && credentialsReady && addressReady && !quote && !quoteLoading) {
            loadQuote();
        }
        // Carrega automaticamente somente quando todos os dados já estão prontos.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadingSettings]);
    const details = useMemo(() => quoteDetails(quote), [quote]);
    const requestDelivery = async () => {
        if (!settings || !quote) {
            setError('Calcule e valide a estimativa antes de solicitar o motoboy.');
            return;
        }
        if (!addressReady) {
            setShowAddress(true);
            setError('Confira o endereço antes de solicitar.');
            return;
        }
        const originalNotes = order.notes;
        const previous = getMtMeta(originalNotes);
        if (previous?.status === 'requesting' || previous?.status === 'ambiguous' || previous?.id) {
            setError('Este pedido já possui uma solicitação MT registrada ou em processamento.');
            return;
        }
        const requestedAt = new Date().toISOString();
        const lockNotes = withMtMeta(originalNotes, { status: 'requesting', requestedAt, payment: paymentMethod });
        setRequesting(true);
        setError('');
        try {
            let lockQuery = supabase.from('customer_orders')
                .update({ notes: lockNotes })
                .eq('id', order.id)
                .eq('franchise_id', franchiseId);
            lockQuery = originalNotes == null ? lockQuery.is('notes', null) : lockQuery.eq('notes', originalNotes);
            const { data: locked, error: lockError } = await lockQuery.select('id').maybeSingle();
            if (lockError)
                throw new Error(`Não foi possível bloquear o pedido para evitar duplicidade: ${lockError.message}`);
            if (!locked)
                throw new Error('O pedido foi alterado em outra tela. Atualize a lista antes de solicitar o motoboy.');
            let response;
            let data;
            try {
                const call = await callMt('create_delivery', {
                    payment_method: paymentMethod,
                    company_id: settings.mt_entregas_company_id ?? undefined,
                    category_id: settings.mt_entregas_category_id ?? undefined,
                    pickup: {
                        address: location.pickupAddress,
                        neighborhood: location.pickupNeighborhood,
                        city: location.pickupCity,
                        state: location.pickupState,
                        reference: 'Coleta SuplemEntaAí',
                        lat: settings.latitude,
                        lng: settings.longitude,
                    },
                    stops: [{
                            address: location.deliveryAddress,
                            neighborhood: location.deliveryNeighborhood,
                            city: location.deliveryCity,
                            state: location.deliveryState,
                            reference: location.deliveryReference,
                            external_id: order.id,
                            notes: `Pedido ${order.id.slice(0, 8).toUpperCase()} - ${Array.isArray(order.items) ? order.items.map((item) => `${item.quantity || 1}x ${item.name}`).join('; ') : ''}`,
                            customer_name: order.customer_name,
                            customer_phone: order.customer_phone || '',
                            amount_to_collect: 0,
                        }],
                    with_return: false,
                });
                response = call.response;
                data = call.data;
            }
            catch (networkError) {
                const ambiguousNotes = withMtMeta(originalNotes, {
                    status: 'ambiguous',
                    requestedAt,
                    payment: paymentMethod,
                    error: 'A conexão caiu antes da confirmação. Verifique a central MT antes de tentar novamente.',
                });
                await supabase.from('customer_orders').update({ notes: ambiguousNotes }).eq('id', order.id).eq('notes', lockNotes);
                throw new Error('A conexão caiu antes de confirmar a resposta da MT. Por segurança, uma nova chamada ficou bloqueada. Confira a central da MT Entregas antes de tentar novamente.');
            }
            if (!response.ok || data?.success === false) {
                const message = errorMessage(data, `A MT Entregas recusou a solicitação (${response.status}).`);
                const failedNotes = withMtMeta(originalNotes, { status: 'failed', requestedAt, payment: paymentMethod, error: message.slice(0, 240) });
                await supabase.from('customer_orders').update({ notes: failedNotes }).eq('id', order.id).eq('notes', lockNotes);
                throw new Error(message);
            }
            const deliveryId = findDeliveryId(data);
            if (!deliveryId) {
                const ambiguousNotes = withMtMeta(originalNotes, {
                    status: 'ambiguous', requestedAt, payment: paymentMethod,
                    error: 'A MT respondeu sem id_mch. Verifique a central antes de reenviar.',
                });
                await supabase.from('customer_orders').update({ notes: ambiguousNotes }).eq('id', order.id).eq('notes', lockNotes);
                throw new Error('A MT confirmou a chamada, mas não retornou o identificador da entrega. Por segurança, não solicite novamente antes de conferir a central MT Entregas.');
            }
            let tracking = findTrackingUrl(data);
            if (!tracking) {
                try {
                    const trackCall = await callMt('tracking_link', { delivery_id: deliveryId });
                    if (trackCall.response.ok)
                        tracking = findTrackingUrl(trackCall.data);
                }
                catch {
                    // O motoboy já foi solicitado; rastreio é complementar.
                }
            }
            const finalNotes = withMtMeta(originalNotes, {
                status: 'created', id: deliveryId, tracking: tracking || undefined,
                requestedAt, payment: paymentMethod,
            });
            const { data: saved, error: saveError } = await supabase.from('customer_orders')
                .update({ notes: finalNotes, status: order.status === 'ready' ? 'delivering' : order.status })
                .eq('id', order.id)
                .eq('notes', lockNotes)
                .select('id')
                .maybeSingle();
            if (saveError || !saved) {
                throw new Error(`A entrega #${deliveryId} foi criada na MT, mas o vínculo não pôde ser salvo no pedido. NÃO SOLICITE NOVAMENTE. Confira a central da MT. ${saveError?.message ?? ''}`.trim());
            }
            setResult({ deliveryId, tracking });
            await onSuccess();
        }
        catch (err) {
            setError(err?.message || 'Não foi possível solicitar o motoboy.');
        }
        finally {
            setRequesting(false);
        }
    };
    if (result) {
        return (_jsx("div", { className: "fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-zinc-900 border border-green-500/30 rounded-2xl w-full max-w-md p-6", onClick: e => e.stopPropagation(), children: [_jsx(CheckCircle2, { size: 46, className: "text-green-400 mx-auto mb-3" }), _jsx("h3", { className: "text-white font-bold text-xl text-center", children: "Motoboy solicitado" }), _jsx("p", { className: "text-zinc-400 text-sm text-center mt-2", children: "A MT Entregas confirmou a solicita\u00E7\u00E3o real." }), _jsxs("div", { className: "bg-zinc-800/70 border border-zinc-700 rounded-xl p-4 mt-4 text-center", children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "ID da entrega MT" }), _jsxs("p", { className: "text-[#FFE500] font-bold text-lg", children: ["#", result.deliveryId] })] }), result.tracking && (_jsxs("a", { href: result.tracking, target: "_blank", rel: "noreferrer", className: "mt-3 w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-2.5 flex items-center justify-center gap-2 text-sm font-bold", children: [_jsx(ExternalLink, { size: 15 }), " Abrir rastreio"] })), _jsx("button", { onClick: onClose, className: "mt-3 w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-2.5", children: "Fechar" })] }) }));
    }
    return (_jsx("div", { className: "fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-white font-bold text-lg flex items-center gap-2", children: [_jsx(Bike, { size: 20, className: "text-[#FFE500]" }), " Solicitar motoboy"] }), _jsxs("p", { className: "text-zinc-500 text-xs", children: ["Pedido #", order.id.slice(0, 8).toUpperCase()] })] }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "p-5 space-y-4", children: [_jsxs("div", { className: "bg-zinc-800/60 border border-zinc-700 rounded-xl p-4", children: [_jsxs("div", { className: "flex justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "Cliente" }), _jsx("p", { className: "text-white font-bold", children: order.customer_name }), _jsx("p", { className: "text-zinc-400 text-xs mt-0.5", children: order.customer_phone || 'Sem telefone' })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "Pedido" }), _jsxs("p", { className: "text-[#FFE500] font-bold", children: ["R$ ", Number(order.total).toFixed(2).replace('.', ',')] })] })] }), _jsxs("div", { className: "mt-3 pt-3 border-t border-zinc-700", children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "Destino preenchido" }), _jsxs("p", { className: "text-white text-sm flex gap-1.5 mt-1", children: [_jsx(MapPin, { size: 14, className: "text-orange-400 shrink-0 mt-0.5" }), " ", location.deliveryAddress || 'Endereço não informado'] }), location.deliveryNeighborhood && _jsxs("p", { className: "text-zinc-400 text-xs ml-5", children: [location.deliveryNeighborhood, location.deliveryCity ? ` — ${location.deliveryCity}/${location.deliveryState}` : ''] })] })] }), loadingSettings ? (_jsxs("div", { className: "text-zinc-400 text-sm flex items-center gap-2", children: [_jsx(Loader2, { size: 16, className: "animate-spin" }), " Carregando integra\u00E7\u00E3o MT..."] })) : !settings?.mt_entregas_enabled ? (_jsx("div", { className: "bg-orange-500/10 border border-orange-500/25 rounded-lg p-3 text-orange-200 text-xs", children: "A integra\u00E7\u00E3o MT Entregas est\u00E1 desativada em Delivery." })) : !credentialsReady ? (_jsx("div", { className: "bg-red-500/10 border border-red-500/25 rounded-lg p-3 text-red-300 text-xs", children: "Preencha login e senha da MT Entregas em Delivery antes de solicitar." })) : (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1.5", children: "Forma de pagamento na MT Entregas" }), _jsx("select", { value: paymentMethod, onChange: e => setPaymentMethod(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FFE500]", children: PAYMENT_OPTIONS.map(option => _jsx("option", { value: option.value, children: option.label }, option.value)) })] }), _jsx("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-4", children: _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-bold", children: "Estimativa MT Entregas" }), quoteLoading ? (_jsxs("p", { className: "text-zinc-500 text-xs mt-1 flex items-center gap-1.5", children: [_jsx(Loader2, { size: 12, className: "animate-spin" }), " Consultando..."] })) : quote ? (_jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-1 mt-1", children: [money(details.price) && _jsx("span", { className: "text-green-400 text-sm font-bold", children: money(details.price) }), details.minutes != null && _jsxs("span", { className: "text-zinc-400 text-xs", children: ["~", details.minutes, " min"] }), details.km != null && _jsxs("span", { className: "text-zinc-400 text-xs", children: [details.km, " km"] }), details.price == null && details.minutes == null && _jsx("span", { className: "text-green-400 text-xs", children: "Dados aceitos pela MT" })] })) : (_jsx("p", { className: "text-zinc-500 text-xs mt-1", children: "Aguardando valida\u00E7\u00E3o." }))] }), _jsx("button", { type: "button", onClick: loadQuote, disabled: quoteLoading || requesting, className: "text-zinc-400 hover:text-[#FFE500] p-2 disabled:opacity-50", title: "Recalcular", children: _jsx(RefreshCw, { size: 16, className: quoteLoading ? 'animate-spin' : '' }) })] }) }), _jsx("button", { type: "button", onClick: () => setShowAddress(value => !value), className: "text-[#FFE500] text-xs font-bold hover:underline", children: showAddress ? 'Ocultar dados de endereço' : 'Conferir/corrigir endereço' }), showAddress && (_jsxs("div", { className: "space-y-3 border border-zinc-800 rounded-xl p-4", children: [_jsx("p", { className: "text-white text-xs font-bold", children: "Coleta (loja)" }), _jsx("input", { value: location.pickupAddress, onChange: e => setLocation({ ...location, pickupAddress: e.target.value }), placeholder: "Endere\u00E7o da loja", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2", children: [_jsx("input", { value: location.pickupNeighborhood, onChange: e => setLocation({ ...location, pickupNeighborhood: e.target.value }), placeholder: "Bairro", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { value: location.pickupCity, onChange: e => setLocation({ ...location, pickupCity: e.target.value, deliveryCity: location.deliveryCity || e.target.value }), placeholder: "Cidade", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { value: location.pickupState, maxLength: 2, onChange: e => { const state = e.target.value.toUpperCase(); setLocation({ ...location, pickupState: state, deliveryState: location.deliveryState || state }); }, placeholder: "UF", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsx("p", { className: "text-white text-xs font-bold pt-2", children: "Destino (cliente)" }), _jsx("input", { value: location.deliveryAddress, onChange: e => setLocation({ ...location, deliveryAddress: e.target.value }), placeholder: "Rua e n\u00FAmero", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2", children: [_jsx("input", { value: location.deliveryNeighborhood, onChange: e => setLocation({ ...location, deliveryNeighborhood: e.target.value }), placeholder: "Bairro", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { value: location.deliveryCity, onChange: e => setLocation({ ...location, deliveryCity: e.target.value }), placeholder: "Cidade", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { value: location.deliveryState, maxLength: 2, onChange: e => setLocation({ ...location, deliveryState: e.target.value.toUpperCase() }), placeholder: "UF", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsx("input", { value: location.deliveryReference, onChange: e => setLocation({ ...location, deliveryReference: e.target.value }), placeholder: "Refer\u00EAncia (opcional)", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsxs("button", { type: "button", onClick: loadQuote, disabled: quoteLoading || !addressReady, className: "w-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-lg py-2 flex items-center justify-center gap-2 disabled:opacity-50", children: [quoteLoading ? _jsx(Loader2, { size: 15, className: "animate-spin" }) : _jsx(RefreshCw, { size: 15 }), " Validar endere\u00E7o e recalcular"] })] })), error && _jsx("div", { className: "bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-xs", children: error }), _jsxs("div", { className: "bg-orange-500/10 border border-orange-500/25 rounded-xl p-3 flex gap-2.5", children: [_jsx(AlertTriangle, { size: 17, className: "text-orange-400 shrink-0 mt-0.5" }), _jsxs("p", { className: "text-orange-200/90 text-xs", children: [_jsx("strong", { children: "Aten\u00E7\u00E3o:" }), " o bot\u00E3o abaixo envia uma solicita\u00E7\u00E3o REAL para a MT Entregas. Um motoboy poder\u00E1 ser acionado e a opera\u00E7\u00E3o poder\u00E1 gerar cobran\u00E7a."] })] }), _jsx("button", { type: "button", onClick: requestDelivery, disabled: requesting || quoteLoading || !quote || !addressReady, className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed", children: requesting ? _jsxs(_Fragment, { children: [_jsx(Loader2, { size: 18, className: "animate-spin" }), " Enviando para a MT..."] }) : _jsxs(_Fragment, { children: [_jsx(Bike, { size: 18 }), " SOLICITAR MOTOBOY AGORA"] }) })] })), error && (loadingSettings || !settings?.mt_entregas_enabled || !credentialsReady) && (_jsx("div", { className: "bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-xs", children: error }))] })] }) }));
}
