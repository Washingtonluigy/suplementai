import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { Bike, MapPin, Phone, Save, Plus, Trash2, Truck, TestTube } from 'lucide-react';
export default function FranchiseeDelivery({ franchiseId }) {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        enabled: false,
        contact_phone: '',
        contact_whatsapp: '',
        address: '',
        latitude: '',
        longitude: '',
        fee_type: 'km',
        fee_value: '',
        fee_store_percent: '0',
        fee_ranges: [],
        neighborhood_fees: [],
        mt_entregas_enabled: false,
        mt_entregas_username: '',
        mt_entregas_password: '',
        mt_entregas_company_id: '',
        mt_entregas_category_id: '',
    });
    const [testingMt, setTestingMt] = useState(false);
    const [mtTestResult, setMtTestResult] = useState(null);
    const load = async () => {
        const { data } = await supabase.from('delivery_settings').select('*').eq('franchise_id', franchiseId).maybeSingle();
        if (data) {
            const s = data;
            setSettings(s);
            setForm({
                enabled: s.enabled,
                contact_phone: s.contact_phone ?? '',
                contact_whatsapp: s.contact_whatsapp ?? '',
                address: s.address ?? '',
                latitude: s.latitude?.toString() ?? '',
                longitude: s.longitude?.toString() ?? '',
                fee_type: s.fee_type,
                fee_value: s.fee_value?.toString() ?? '',
                fee_store_percent: s.fee_store_percent?.toString() ?? '0',
                fee_ranges: s.fee_ranges?.map(r => ({ up_to_km: String(r.up_to_km), fee: String(r.fee) })) ?? [],
                neighborhood_fees: s.neighborhood_fees?.map(n => ({ name: n.name, fee: String(n.fee) })) ?? [],
                mt_entregas_enabled: s.mt_entregas_enabled ?? false,
                mt_entregas_username: s.mt_entregas_username ?? '',
                mt_entregas_password: s.mt_entregas_password ?? '',
                mt_entregas_company_id: s.mt_entregas_company_id?.toString() ?? '',
                mt_entregas_category_id: s.mt_entregas_category_id?.toString() ?? '',
            });
        }
        setLoading(false);
    };
    useEffect(() => { load(); }, [franchiseId]);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            franchise_id: franchiseId,
            enabled: form.enabled,
            contact_phone: form.contact_phone || null,
            contact_whatsapp: form.contact_whatsapp || null,
            address: form.address || null,
            latitude: form.latitude ? parseFloat(form.latitude) : null,
            longitude: form.longitude ? parseFloat(form.longitude) : null,
            fee_type: form.fee_type,
            fee_value: parseFloat(form.fee_value) || 0,
            fee_store_percent: Math.min(100, Math.max(0, parseFloat(form.fee_store_percent) || 0)),
            fee_ranges: form.fee_ranges.filter(r => r.up_to_km && r.fee).map(r => ({ up_to_km: parseFloat(r.up_to_km), fee: parseFloat(r.fee) })),
            neighborhood_fees: form.neighborhood_fees.filter(n => n.name && n.fee).map(n => ({ name: n.name, fee: parseFloat(n.fee) })),
            mt_entregas_enabled: form.mt_entregas_enabled,
            mt_entregas_username: form.mt_entregas_username || null,
            mt_entregas_password: form.mt_entregas_password || null,
            mt_entregas_company_id: form.mt_entregas_company_id ? parseInt(form.mt_entregas_company_id) : null,
            mt_entregas_category_id: form.mt_entregas_category_id ? parseInt(form.mt_entregas_category_id) : null,
        };
        if (settings) {
            await supabase.from('delivery_settings').update(payload).eq('id', settings.id);
        }
        else {
            await supabase.from('delivery_settings').insert(payload);
        }
        setSaving(false);
        load();
    };
    if (loading) {
        return _jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    return (_jsxs("form", { onSubmit: handleSave, className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Delivery" }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: form.enabled, onChange: e => setForm({ ...form, enabled: e.target.checked }), className: "w-5 h-5 accent-[#FFE500]" }), _jsx("span", { className: `text-sm font-bold ${form.enabled ? 'text-green-400' : 'text-zinc-500'}`, children: form.enabled ? 'Ativado' : 'Desativado' })] })] }), _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [_jsxs("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [_jsx(Phone, { size: 16, className: "text-[#FFE500]" }), " Contato"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Telefone" }), _jsx("input", { type: "text", value: form.contact_phone, onChange: e => setForm({ ...form, contact_phone: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "WhatsApp" }), _jsx("input", { type: "text", value: form.contact_whatsapp, onChange: e => setForm({ ...form, contact_whatsapp: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] })] }), _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [_jsxs("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [_jsx(MapPin, { size: 16, className: "text-[#FFE500]" }), " Localiza\u00E7\u00E3o"] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Endere\u00E7o completo da coleta" }), _jsx("input", { type: "text", value: form.address, onChange: e => setForm({ ...form, address: e.target.value }), placeholder: "Rua e n\u00FAmero, bairro, cidade/UF", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Latitude" }), _jsx("input", { type: "number", step: "any", value: form.latitude, onChange: e => setForm({ ...form, latitude: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Longitude" }), _jsx("input", { type: "number", step: "any", value: form.longitude, onChange: e => setForm({ ...form, longitude: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] })] }), _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [_jsxs("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [_jsx(Bike, { size: 16, className: "text-[#FFE500]" }), " Taxas de Entrega"] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Tipo de cobran\u00E7a" }), _jsxs("select", { value: form.fee_type, onChange: e => setForm({ ...form, fee_type: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "km", children: "Por KM" }), _jsx("option", { value: "range", children: "Faixas de dist\u00E2ncia" }), _jsx("option", { value: "neighborhood", children: "Por bairro" })] })] }), form.fee_type === 'km' && (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Valor por KM (R$)" }), _jsx("input", { type: "number", step: "0.01", value: form.fee_value, onChange: e => setForm({ ...form, fee_value: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Ajuda de custo da loja (%)" }), _jsx("input", { type: "number", min: "0", max: "100", step: "1", value: form.fee_store_percent, onChange: e => setForm({ ...form, fee_store_percent: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("p", { className: "text-zinc-500 text-xs mt-1", children: "A loja paga esta % da taxa. O cliente paga o resto." })] })] })), form.fee_type === 'range' && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Ajuda de custo da loja (%)" }), _jsx("input", { type: "number", min: "0", max: "100", step: "1", value: form.fee_store_percent, onChange: e => setForm({ ...form, fee_store_percent: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("p", { className: "text-zinc-500 text-xs mt-1", children: "A loja paga esta % da taxa. O cliente paga o resto." })] }), _jsxs("div", { className: "space-y-2", children: [form.fee_ranges.map((r, i) => (_jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("span", { className: "text-zinc-400 text-xs", children: "At\u00E9" }), _jsx("input", { type: "number", step: "0.1", value: r.up_to_km, onChange: e => { const arr = [...form.fee_ranges]; arr[i] = { ...arr[i], up_to_km: e.target.value }; setForm({ ...form, fee_ranges: arr }); }, placeholder: "KM", className: "w-20 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("span", { className: "text-zinc-400 text-xs", children: "km: R$" }), _jsx("input", { type: "number", step: "0.01", value: r.fee, onChange: e => { const arr = [...form.fee_ranges]; arr[i] = { ...arr[i], fee: e.target.value }; setForm({ ...form, fee_ranges: arr }); }, className: "w-24 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("button", { type: "button", onClick: () => setForm({ ...form, fee_ranges: form.fee_ranges.filter((_, j) => j !== i) }), className: "text-zinc-400 hover:text-red-400 p-1", children: _jsx(Trash2, { size: 14 }) })] }, i))), _jsxs("button", { type: "button", onClick: () => setForm({ ...form, fee_ranges: [...form.fee_ranges, { up_to_km: '', fee: '' }] }), className: "text-[#FFE500] text-xs font-bold flex items-center gap-1", children: [_jsx(Plus, { size: 14 }), " Adicionar faixa"] })] })] })), form.fee_type === 'neighborhood' && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Ajuda de custo da loja (%)" }), _jsx("input", { type: "number", min: "0", max: "100", step: "1", value: form.fee_store_percent, onChange: e => setForm({ ...form, fee_store_percent: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("p", { className: "text-zinc-500 text-xs mt-1", children: "A loja paga esta % da taxa. O cliente paga o resto." })] }), _jsxs("div", { className: "space-y-2", children: [form.neighborhood_fees.map((n, i) => (_jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("input", { type: "text", value: n.name, onChange: e => { const arr = [...form.neighborhood_fees]; arr[i] = { ...arr[i], name: e.target.value }; setForm({ ...form, neighborhood_fees: arr }); }, placeholder: "Nome do bairro", className: "flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "number", step: "0.01", value: n.fee, onChange: e => { const arr = [...form.neighborhood_fees]; arr[i] = { ...arr[i], fee: e.target.value }; setForm({ ...form, neighborhood_fees: arr }); }, placeholder: "R$", className: "w-24 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("button", { type: "button", onClick: () => setForm({ ...form, neighborhood_fees: form.neighborhood_fees.filter((_, j) => j !== i) }), className: "text-zinc-400 hover:text-red-400 p-1", children: _jsx(Trash2, { size: 14 }) })] }, i))), _jsxs("button", { type: "button", onClick: () => setForm({ ...form, neighborhood_fees: [...form.neighborhood_fees, { name: '', fee: '' }] }), className: "text-[#FFE500] text-xs font-bold flex items-center gap-1", children: [_jsx(Plus, { size: 14 }), " Adicionar bairro"] })] })] }))] }), _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [_jsx(Truck, { size: 16, className: "text-[#FFE500]" }), " MT Entregas (Machine)"] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: form.mt_entregas_enabled, onChange: e => setForm({ ...form, mt_entregas_enabled: e.target.checked }), className: "w-5 h-5 accent-[#FFE500]" }), _jsx("span", { className: `text-sm font-bold ${form.mt_entregas_enabled ? 'text-green-400' : 'text-zinc-500'}`, children: form.mt_entregas_enabled ? 'Ativado' : 'Desativado' })] })] }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Integra\u00E7\u00E3o com a API oficial v2 da Machine para cotar a taxa no cat\u00E1logo e solicitar entregadores. A chave da API j\u00E1 est\u00E1 configurada no sistema. Para a cota\u00E7\u00E3o funcionar, mantenha o endere\u00E7o completo da coleta no formato: rua e n\u00FAmero, bairro, cidade/UF." }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Login (usu\u00E1rio)" }), _jsx("input", { type: "text", value: form.mt_entregas_username, onChange: e => setForm({ ...form, mt_entregas_username: e.target.value }), placeholder: "Seu login da Machine", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Senha" }), _jsx("input", { type: "password", value: form.mt_entregas_password, onChange: e => setForm({ ...form, mt_entregas_password: e.target.value }), placeholder: "Sua senha da Machine", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "ID da Empresa" }), _jsx("input", { type: "number", value: form.mt_entregas_company_id, onChange: e => setForm({ ...form, mt_entregas_company_id: e.target.value }), placeholder: "empresa_id", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "ID da Categoria (opcional)" }), _jsx("input", { type: "number", value: form.mt_entregas_category_id, onChange: e => setForm({ ...form, mt_entregas_category_id: e.target.value }), placeholder: "categoria_id", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), _jsxs("button", { type: "button", disabled: testingMt || !form.mt_entregas_username || !form.mt_entregas_password, onClick: async () => {
                            setTestingMt(true);
                            setMtTestResult(null);
                            try {
                                const payload = { franchise_id: franchiseId, enabled: form.enabled, contact_phone: form.contact_phone || null, contact_whatsapp: form.contact_whatsapp || null, address: form.address || null, latitude: form.latitude ? parseFloat(form.latitude) : null, longitude: form.longitude ? parseFloat(form.longitude) : null, fee_type: form.fee_type, fee_value: parseFloat(form.fee_value) || 0, fee_store_percent: Math.min(100, Math.max(0, parseFloat(form.fee_store_percent) || 0)), fee_ranges: form.fee_ranges.filter(r => r.up_to_km && r.fee).map(r => ({ up_to_km: parseFloat(r.up_to_km), fee: parseFloat(r.fee) })), neighborhood_fees: form.neighborhood_fees.filter(n => n.name && n.fee).map(n => ({ name: n.name, fee: parseFloat(n.fee) })), mt_entregas_enabled: form.mt_entregas_enabled, mt_entregas_username: form.mt_entregas_username || null, mt_entregas_password: form.mt_entregas_password || null, mt_entregas_company_id: form.mt_entregas_company_id ? parseInt(form.mt_entregas_company_id) : null, mt_entregas_category_id: form.mt_entregas_category_id ? parseInt(form.mt_entregas_category_id) : null };
                                const save = settings ? await supabase.from('delivery_settings').update(payload).eq('id', settings.id) : await supabase.from('delivery_settings').insert(payload);
                                if (save.error)
                                    throw save.error;
                                const { data: sessionData } = await supabase.auth.getSession();
                                const token = sessionData.session?.access_token;
                                if (!token)
                                    throw new Error('Sua sessão expirou. Entre novamente.');
                                const resp = await fetch('/.netlify/functions/mt-entregas', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: 'test', franchise_id: franchiseId, payload: {} }) });
                                const json = await resp.json().catch(() => ({}));
                                if (resp.ok && json.success !== false)
                                    setMtTestResult({ ok: true, message: 'Conexão real com a API v2 da MT Entregas validada!' });
                                else
                                    setMtTestResult({ ok: false, message: json.error || json.errors?.join?.(', ') || 'Falha na conexão com a MT Entregas.' });
                                await load();
                            }
                            catch (err) {
                                setMtTestResult({ ok: false, message: err.message || 'Falha no teste.' });
                            }
                            setTestingMt(false);
                        }, className: "bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg px-4 py-2 flex items-center gap-2 transition-colors border border-zinc-700 disabled:opacity-50", children: [testingMt ? _jsx("div", { className: "w-4 h-4 border-2 border-zinc-600 border-t-[#FFE500] rounded-full animate-spin" }) : _jsx(TestTube, { size: 14 }), "Testar conex\u00E3o"] }), mtTestResult && (_jsx("div", { className: `rounded-lg p-3 text-sm ${mtTestResult.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`, children: mtTestResult.message }))] }), _jsxs("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg px-6 py-3 flex items-center gap-2 transition-all disabled:opacity-50", children: [saving ? _jsx("div", { className: "w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" }) : _jsx(Save, { size: 18 }), "Salvar configura\u00E7\u00F5es"] })] }));
}
