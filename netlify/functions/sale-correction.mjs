import { authorizeAnalytics, SUPABASE_ANON_KEY, SUPABASE_URL } from './_supabase-public.mjs';

const ADMIN_PASSWORD = 'edita10';

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

const safeId = value => /^[0-9a-f-]{30,40}$/i.test(String(value || '')) ? String(value) : null;

async function restRequest(path, token, method, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Supabase retornou ${response.status}`);
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: { Allow: 'POST, OPTIONS' }, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método não permitido.' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'JSON inválido.' }); }

  const franchiseId = safeId(body.franchiseId);
  const orderId = body.orderId ? safeId(body.orderId) : null;
  const saleId = body.saleId ? safeId(body.saleId) : null;
  const action = body.action === 'delete' ? 'delete' : body.action === 'update' ? 'update' : null;

  if (!franchiseId || !action || (!orderId && !saleId)) return json(400, { error: 'Dados da correção incompletos.' });
  if (String(body.password || '') !== ADMIN_PASSWORD) return json(403, { error: 'Senha administrativa incorreta.' });

  const auth = await authorizeAnalytics(event, franchiseId);
  if (!auth.ok) return json(auth.status || 403, { error: auth.error || 'Sem permissão.' });
  const token = auth.token;

  try {
    if (action === 'delete') {
      if (saleId) await restRequest(`sales?id=eq.${encodeURIComponent(saleId)}&franchise_id=eq.${encodeURIComponent(franchiseId)}`, token, 'DELETE');
      if (orderId) {
        await restRequest(`customer_orders?id=eq.${encodeURIComponent(orderId)}&franchise_id=eq.${encodeURIComponent(franchiseId)}`, token, 'PATCH', {
          status: 'cancelled',
          notes: String(body.notes || '').slice(0, 10000) || null,
        });
      }
      return json(200, { ok: true, action: 'delete' });
    }

    const total = Number(body.values?.total || 0);
    const subtotal = Number(body.values?.subtotal || 0);
    const discount = Number(body.values?.discount || 0);
    const deliveryFee = Number(body.values?.delivery_fee || 0);
    const paymentMethod = body.values?.payment_method ? String(body.values.payment_method) : null;
    const campaignName = body.values?.campaign_name ? String(body.values.campaign_name).slice(0, 500) : null;

    if (![total, subtotal, discount, deliveryFee].every(Number.isFinite) || total < 0 || subtotal < 0 || discount < 0 || deliveryFee < 0) {
      return json(400, { error: 'Valores inválidos para a correção.' });
    }

    if (orderId) {
      await restRequest(`customer_orders?id=eq.${encodeURIComponent(orderId)}&franchise_id=eq.${encodeURIComponent(franchiseId)}`, token, 'PATCH', {
        total,
        subtotal,
        discount_amount: discount,
        delivery_fee: deliveryFee,
        payment_method: paymentMethod,
        campaign_name: campaignName,
        notes: String(body.notes || '').slice(0, 10000) || null,
      });
    }
    if (saleId) {
      await restRequest(`sales?id=eq.${encodeURIComponent(saleId)}&franchise_id=eq.${encodeURIComponent(franchiseId)}`, token, 'PATCH', {
        total,
        subtotal,
        discount,
        delivery_fee: deliveryFee,
        payment_method: paymentMethod,
        campaign_name: campaignName,
      });
    }

    return json(200, { ok: true, action: 'update' });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : 'Falha ao corrigir a venda.' });
  }
}
