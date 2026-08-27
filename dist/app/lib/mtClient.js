import { supabase } from '/app/lib/supabase.js';
const n = (value) => {
    const parsed = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};
export function parseMtQuote(payload) {
    const root = payload?.data ?? payload?.result ?? payload?.resultado ?? payload ?? {};
    const nested = root?.data ?? root?.estimativa ?? root;
    const fee = n(nested?.estimativa_valor ?? nested?.valor_estimativa ?? nested?.valor ?? nested?.preco ??
        root?.estimativa_valor ?? root?.valor_estimativa ?? root?.valor ?? root?.preco);
    const km = n(nested?.estimativa_km ?? nested?.km ?? nested?.distancia_km ?? root?.estimativa_km ?? root?.km);
    const minutes = n(nested?.estimativa_minutos ?? nested?.tempo_minutos ?? nested?.minutos ?? root?.estimativa_minutos ?? root?.minutos);
    if (fee == null || fee < 0)
        throw new Error('A MT Entregas não retornou um valor válido para a entrega.');
    return { fee, km, minutes, raw: payload };
}
export async function callExistingMt(settings, action, payload) {
    if (!settings.mt_entregas_enabled)
        throw new Error('MT Entregas está desativada nesta unidade.');
    if (!settings.mt_entregas_username || !settings.mt_entregas_password)
        throw new Error('Login e senha da MT Entregas não estão configurados nesta unidade.');
    const { data, error } = await supabase.functions.invoke('mt-entregas', {
        body: {
            action,
            payload: {
                ...payload,
                basic_auth: {
                    username: settings.mt_entregas_username,
                    password: settings.mt_entregas_password,
                },
            },
        },
    });
    if (error)
        throw new Error(error.message || 'Falha ao acessar a integração MT Entregas.');
    if (data?.success === false)
        throw new Error(data?.error || data?.errors?.join?.(', ') || 'A MT Entregas recusou a solicitação.');
    return data;
}
export async function quoteExistingMt(settings, destination) {
    const data = await callExistingMt(settings, 'quote', {
        pickup_address: settings.address || undefined,
        pickup_lat: settings.latitude ?? undefined,
        pickup_lng: settings.longitude ?? undefined,
        delivery_address: destination.address,
        delivery_neighborhood: destination.neighborhood || undefined,
        delivery_city: destination.city || undefined,
        delivery_state: destination.state || undefined,
        delivery_lat: destination.lat ?? undefined,
        delivery_lng: destination.lng ?? undefined,
        category_id: settings.mt_entregas_category_id ?? undefined,
    });
    return parseMtQuote(data);
}
export function customerDeliveryPortion(rawFee, storePercent = 0) {
    const pct = Math.min(100, Math.max(0, Number(storePercent) || 0));
    return Math.round(rawFee * (1 - pct / 100) * 100) / 100;
}
export function fallbackDeliveryFee(settings, args) {
    if (!settings?.enabled)
        return 0;
    if (settings.fee_type === 'neighborhood') {
        const target = (args.neighborhood || '').trim().toLocaleLowerCase('pt-BR');
        const rows = Array.isArray(settings.neighborhood_fees) ? settings.neighborhood_fees : [];
        const row = rows.find((item) => String(item?.name || '').trim().toLocaleLowerCase('pt-BR') === target);
        return Number(row?.fee) || 0;
    }
    const distance = args.distanceKm;
    if (distance == null || !Number.isFinite(distance))
        return 0;
    if (settings.fee_type === 'km')
        return Math.round(distance * (Number(settings.fee_value) || 0) * 100) / 100;
    if (settings.fee_type === 'range') {
        const rows = (Array.isArray(settings.fee_ranges) ? settings.fee_ranges : [])
            .map((item) => ({ up: Number(item?.up_to_km), fee: Number(item?.fee) }))
            .filter((item) => Number.isFinite(item.up) && Number.isFinite(item.fee))
            .sort((a, b) => a.up - b.up);
        const row = rows.find((item) => distance <= item.up);
        return row?.fee || 0;
    }
    return 0;
}
export function haversineKm(lat1, lng1, lat2, lng2) {
    if ([lat1, lng1, lat2, lng2].some(v => v == null || !Number.isFinite(Number(v))))
        return null;
    const toRad = (d) => d * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(Number(lat2) - Number(lat1));
    const dLng = toRad(Number(lng2) - Number(lng1));
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(Number(lat1))) * Math.cos(toRad(Number(lat2))) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
