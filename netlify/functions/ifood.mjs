import { getStore } from '@netlify/blobs';
import { SUPABASE_URL, SUPABASE_ANON_KEY, getSupabaseUser, authorizeAnalytics } from './_supabase-public.mjs';

const IFOOD_BASE = 'https://merchant-api.ifood.com.br';
const TEST_CLIENT_ID = '7781671b-9fca-494d-bb7a-a08e7d8bd28c';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
};
const json = (statusCode, body) => ({ statusCode, headers: cors, body: JSON.stringify(body) });
const safeString = (value, max = 4000) => String(value ?? '').slice(0, max);
const isTestIntegration = integration => String(integration?.client_id || '') === TEST_CLIENT_ID;

async function readJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

function ifoodError(payload, fallback) {
  return payload?.error?.message || payload?.message || payload?.error_description || payload?.details?.[0]?.message || payload?.raw || fallback;
}

async function getIntegration(event, integrationId) {
  const auth = await getSupabaseUser(event);
  if (!auth) throw Object.assign(new Error('Sessão obrigatória.'), { status: 401 });
  if (!integrationId) throw Object.assign(new Error('Integração obrigatória.'), { status: 400 });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/delivery_integrations?select=*&id=eq.${encodeURIComponent(integrationId)}&limit=1`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, Accept: 'application/json' },
  });
  const rows = await readJsonSafe(response);
  const integration = Array.isArray(rows) ? rows[0] : null;
  if (!response.ok || !integration) throw Object.assign(new Error('Integração não encontrada.'), { status: response.status || 404 });
  if (integration.platform !== 'ifood') throw Object.assign(new Error('Esta integração não é do iFood.'), { status: 400 });
  const allowed = await authorizeAnalytics(event, integration.franchise_id);
  if (!allowed.ok) throw Object.assign(new Error(allowed.error || 'Sem permissão para esta integração.'), { status: allowed.status || 403 });
  return { auth, integration };
}

async function patchIntegration(auth, integrationId, patch) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/delivery_integrations?id=eq.${encodeURIComponent(integrationId)}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) {
    const payload = await readJsonSafe(response);
    throw new Error(ifoodError(payload, 'Não foi possível atualizar a integração.'));
  }
}

async function logSync(auth, integrationId, action, status, message, payload = {}, platformOrderId = null) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/delivery_sync_logs`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ integration_id: integrationId, action, platform_order_id: platformOrderId, payload, status, message }),
    });
  } catch { /* log nunca pode interromper o fluxo principal */ }
}

function authHeaders(token, integration, extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    ...(isTestIntegration(integration) ? { 'x-request-homologation': 'true' } : {}),
    ...extra,
  };
}

function tokenStore() {
  return getStore({ name: 'suplementaai-ifood-oauth', consistency: 'strong' });
}

async function getOAuthState(integrationId) {
  return await tokenStore().get(`integration/${integrationId}`, { type: 'json', consistency: 'strong' }).catch(() => null);
}

async function setOAuthState(integrationId, state) {
  await tokenStore().setJSON(`integration/${integrationId}`, { ...state, updatedAt: new Date().toISOString() });
}

async function requestUserCode(integration) {
  if (!integration.client_id) throw Object.assign(new Error('Preencha e salve o Client ID do iFood.'), { status: 400 });
  const body = new URLSearchParams({ clientId: integration.client_id });
  const response = await fetch(`${IFOOD_BASE}/authentication/v1.0/oauth/userCode`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body,
  });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw Object.assign(new Error(ifoodError(payload, `iFood recusou o código de vínculo (${response.status}).`)), { status: response.status });
  return payload;
}

async function exchangeAuthorizationCode(integration, authorizationCode, verifier) {
  if (!integration.client_id || !integration.client_secret) throw Object.assign(new Error('Preencha e salve Client ID e Client Secret do iFood.'), { status: 400 });
  if (!authorizationCode) throw Object.assign(new Error('Informe o código de autorização mostrado pelo iFood.'), { status: 400 });
  if (!verifier) throw Object.assign(new Error('O código de vínculo expirou ou não foi encontrado. Gere um novo código.'), { status: 400 });
  const body = new URLSearchParams({
    grantType: 'authorization_code', clientId: integration.client_id, clientSecret: integration.client_secret,
    authorizationCode: String(authorizationCode).trim(), authorizationCodeVerifier: verifier,
  });
  const response = await fetch(`${IFOOD_BASE}/authentication/v1.0/oauth/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body,
  });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw Object.assign(new Error(ifoodError(payload, `Falha ao gerar token iFood (${response.status}).`)), { status: response.status });
  return payload;
}

async function refreshAccessToken(integration, state) {
  if (!state?.refreshToken) throw Object.assign(new Error('iFood precisa ser autorizado novamente.'), { status: 401, reconnect: true });
  const body = new URLSearchParams({
    grantType: 'refresh_token', clientId: integration.client_id, clientSecret: integration.client_secret, refreshToken: state.refreshToken,
  });
  const response = await fetch(`${IFOOD_BASE}/authentication/v1.0/oauth/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body,
  });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw Object.assign(new Error(ifoodError(payload, `Não foi possível renovar o token iFood (${response.status}).`)), { status: response.status, reconnect: response.status === 401 });
  const expiresIn = Math.max(60, Number(payload?.expiresIn || 0));
  const next = {
    ...state,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken || state.refreshToken,
    tokenType: payload.type || state.tokenType || 'bearer',
    tokenExpiresAt: Date.now() + expiresIn * 1000,
  };
  return next;
}

async function ensureAccessToken(integration) {
  let state = await getOAuthState(integration.id);
  if (!state?.accessToken) throw Object.assign(new Error('iFood ainda não foi autorizado nesta franquia.'), { status: 401, reconnect: true });
  if (!state.tokenExpiresAt || Number(state.tokenExpiresAt) - Date.now() < 5 * 60 * 1000) {
    state = await refreshAccessToken(integration, state);
    await setOAuthState(integration.id, state);
  }
  return state;
}

async function listMerchants(token, integration) {
  const response = await fetch(`${IFOOD_BASE}/merchant/v1.0/merchants?page=1&size=100`, { headers: authHeaders(token, integration) });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw Object.assign(new Error(ifoodError(payload, `Não foi possível listar lojas iFood (${response.status}).`)), { status: response.status });
  return Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.merchants)
      ? payload.merchants
      : Array.isArray(payload?.elements)
        ? payload.elements
        : Array.isArray(payload?.items)
          ? payload.items
          : [];
}

function mapPayment(order) {
  const methods = Array.isArray(order?.payments?.methods) ? order.payments.methods : [];
  const primary = methods[0] || {};
  const method = String(primary.method || '').toUpperCase();
  if (method === 'PIX') return 'pix';
  if (method === 'CREDIT') return 'credit_card';
  if (method === 'DEBIT') return 'debit_card';
  if (method === 'CASH') return 'cash';
  if (method.includes('VOUCHER')) return 'meal_voucher';
  return null;
}

function mapItems(order) {
  return (Array.isArray(order?.items) ? order.items : []).map(item => ({
    id: item.id || item.uniqueId || null,
    externalCode: item.externalCode || null,
    name: item.name || 'Item iFood',
    quantity: Number(item.quantity || 0),
    price: Number(item.unitPrice != null ? item.unitPrice : (Number(item.price || 0) / Math.max(1, Number(item.quantity || 1)))),
    totalPrice: Number(item.totalPrice ?? item.price ?? 0),
    observations: item.observations || null,
    image_url: item.imageUrl || null,
    addons: (Array.isArray(item.options) ? item.options : []).map(option => ({
      name: option.name || 'Adicional', quantity: Number(option.quantity || 1), price: Number(option.price ?? option.unitPrice ?? 0), group: option.groupName || null,
    })),
  }));
}

function formatAddress(order) {
  const a = order?.delivery?.deliveryAddress;
  if (!a) return null;
  const first = a.formattedAddress || [a.streetName, a.streetNumber].filter(Boolean).join(', ');
  return [first, a.neighborhood, a.complement, `${a.city || ''}${a.state ? `/${a.state}` : ''}`, a.postalCode ? `CEP ${a.postalCode}` : ''].filter(Boolean).join(' - ');
}

function buildNotes(order) {
  const parts = [];
  if (order?.extraInfo) parts.push(order.extraInfo);
  if (order?.delivery?.observations) parts.push(`Entrega: ${order.delivery.observations}`);
  if (order?.takeout?.observations) parts.push(`Retirada: ${order.takeout.observations}`);
  const itemNotes = (Array.isArray(order?.items) ? order.items : []).filter(i => i?.observations).map(i => `${i.name}: ${i.observations}`);
  if (itemNotes.length) parts.push(`Observações dos itens: ${itemNotes.join(' | ')}`);
  if (order?.customer?.phone?.localizer) parts.push(`Localizador iFood: ${order.customer.phone.localizer}`);
  if (order?.delivery?.pickupCode) parts.push(`Código de coleta: ${order.delivery.pickupCode}`);

  const methods = Array.isArray(order?.payments?.methods) ? order.payments.methods : [];
  const paymentSummary = methods.map(method => {
    const pieces = [method.method, method.type];
    if (method?.card?.brand) pieces.push(`bandeira ${method.card.brand}`);
    if (method?.cash?.changeFor != null) pieces.push(`troco para R$ ${Number(method.cash.changeFor).toFixed(2)}`);
    return pieces.filter(Boolean).join(' • ');
  }).filter(Boolean);
  if (paymentSummary.length) parts.push(`Pagamento iFood: ${paymentSummary.join(' | ')}`);

  const benefits = Array.isArray(order?.benefits) ? order.benefits : [];
  if (benefits.length) {
    const benefitText = benefits.map(benefit => {
      const sponsors = (Array.isArray(benefit?.sponsorshipValues) ? benefit.sponsorshipValues : [])
        .filter(item => Number(item?.value || 0) > 0)
        .map(item => `${item.name}: R$ ${Number(item.value).toFixed(2)}`)
        .join(', ');
      return `${benefit.target || 'BENEFÍCIO'} R$ ${Number(benefit.value || 0).toFixed(2)}${sponsors ? ` (${sponsors})` : ''}`;
    });
    parts.push(`Benefícios iFood: ${benefitText.join(' | ')}`);
  }
  return parts.join('\n') || null;
}

async function supabaseGet(auth, resource, query) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${resource}?${query}`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, Accept: 'application/json' } });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(ifoodError(payload, `Erro ao consultar ${resource}.`));
  return payload;
}

async function supabaseInsert(auth, resource, data) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${resource}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(ifoodError(payload, `Erro ao gravar ${resource}.`));
  return Array.isArray(payload) ? payload[0] : payload;
}

async function supabasePatch(auth, resource, query, data) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${resource}?${query}`, {
    method: 'PATCH',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const payload = await readJsonSafe(response);
    throw new Error(ifoodError(payload, `Erro ao atualizar ${resource}.`));
  }
}

async function fetchOrderDetails(orderId, token, integration) {
  let last = null;
  for (const delay of [0, 1200, 2500]) {
    if (delay) await new Promise(resolve => setTimeout(resolve, delay));
    const response = await fetch(`${IFOOD_BASE}/order/v1.0/orders/${encodeURIComponent(orderId)}`, { headers: authHeaders(token, integration) });
    const payload = await readJsonSafe(response);
    if (response.ok) return payload;
    last = { response, payload };
    if (response.status !== 404) break;
  }
  throw Object.assign(new Error(ifoodError(last?.payload, `Pedido ${orderId} ainda não está disponível no iFood.`)), { status: last?.response?.status || 502, retryable: last?.response?.status === 404 });
}

async function findLocalOrder(auth, franchiseId, platformOrderId) {
  const rows = await supabaseGet(auth, 'customer_orders', `select=*&franchise_id=eq.${encodeURIComponent(franchiseId)}&platform_order_id=eq.${encodeURIComponent(platformOrderId)}&limit=1`);
  return Array.isArray(rows) ? rows[0] : null;
}

async function importOrder(auth, integration, event, token) {
  const orderId = event.orderId || event.metadata?.id;
  if (!orderId) return { processed: true, imported: false, reason: 'Evento sem orderId.' };
  const existing = await findLocalOrder(auth, integration.franchise_id, orderId);
  if (existing) return { processed: true, imported: false, order: existing };
  const order = await fetchOrderDetails(orderId, token, integration);
  const delivery = String(order.orderType || '').toUpperCase() === 'DELIVERY';
  const deliveredBy = order?.delivery?.deliveredBy || null;
  const total = Number(order?.total?.orderAmount ?? 0);
  const subtotal = Number(order?.total?.subTotal ?? total);
  const fee = Number(order?.total?.deliveryFee ?? 0);
  const discount = Number(order?.total?.benefits ?? 0);
  const row = {
    franchise_id: integration.franchise_id,
    customer_name: safeString(order?.customer?.name || 'Cliente iFood', 180),
    customer_phone: order?.customer?.phone?.number ? safeString(order.customer.phone.number, 80) : null,
    items: mapItems(order),
    total,
    status: 'pending',
    order_type: 'public',
    delivery,
    delivery_source: 'ifood',
    delivery_source_detail: safeString(`iFood #${order.displayId || orderId}${deliveredBy ? ` • Entrega: ${deliveredBy}` : ''}${order.isTest || order.test ? ' • TESTE' : ''}`, 500),
    address: formatAddress(order),
    notes: buildNotes(order),
    order_mode: delivery ? 'delivery' : 'pickup',
    customer_reference: order?.delivery?.deliveryAddress?.reference || null,
    payment_method: mapPayment(order),
    pix_discount_percent: 0,
    discount_amount: discount,
    subtotal,
    delivery_fee: fee,
    delivery_payment_method: Number(order?.payments?.pending || 0) > 0 ? 'on_delivery' : 'online',
    delivery_fee_payer: 'customer',
    payer_cpf: order?.customer?.documentNumber ? safeString(order.customer.documentNumber, 40) : null,
    platform_order_id: orderId,
    ifood_event_id: event.id || null,
  };
  const inserted = await supabaseInsert(auth, 'customer_orders', row);
  await tokenStore().setJSON(`orders/${integration.id}/${orderId}`, order);
  await logSync(auth, integration.id, 'order_received', 'success', `Pedido iFood #${order.displayId || orderId} importado.`, { event, displayId: order.displayId, deliveredBy, isTest: Boolean(order.isTest || order.test) }, orderId);
  return { processed: true, imported: true, order: inserted, details: order };
}

function localStatusForEvent(event, source) {
  const code = String(event?.code || '').toUpperCase();
  const full = String(event?.fullCode || '').toUpperCase();
  if (['CAN', 'CANCELLED'].includes(code) || full.includes('CANCELLED')) return 'cancelled';
  if (['CON', 'CONCLUDED', 'DELIVERED'].includes(code) || full === 'CONCLUDED') return 'delivered';
  if (['DSP', 'DISPATCHED', 'COLLECTED'].includes(code) || full === 'DISPATCHED') return 'delivering';
  if (['RTP', 'SPE', 'READY_TO_PICKUP', 'SEPARATION_ENDED'].includes(code) || ['READY_TO_PICKUP', 'PREPARATION_ENDED'].includes(full)) return 'ready';
  if (['SPS', 'SEPARATION_STARTED', 'PREPARATION_STARTED'].includes(code) || full === 'PREPARATION_STARTED') return 'preparing';
  if (source === 'events_v1' && ['CFM', 'CONFIRMED'].includes(code)) return 'accepted';
  return null;
}

function isNewOrderEvent(event, source) {
  const code = String(event?.code || '').toUpperCase();
  const full = String(event?.fullCode || '').toUpperCase();
  if (source === 'events_v1') return ['PLC', 'PLACED'].includes(code) || full === 'PLACED';
  return ['CONFIRMED', 'CFM', 'PLC', 'PLACED'].includes(code) || ['ORDER_CONFIRMED', 'PLACED'].includes(full);
}

async function pollEvents(token, integration) {
  const headers = authHeaders(token, integration, integration.store_id ? { 'x-polling-merchants': integration.store_id } : {});
  let response = await fetch(`${IFOOD_BASE}/events/v1.0/events:polling?categories=FOOD`, { headers });
  if (response.status !== 404 && response.status !== 405) {
    if (response.status === 204) return { source: 'events_v1', events: [] };
    const payload = await readJsonSafe(response);
    if (!response.ok) throw Object.assign(new Error(ifoodError(payload, `Polling iFood falhou (${response.status}).`)), { status: response.status });
    return { source: 'events_v1', events: Array.isArray(payload) ? payload : Array.isArray(payload?.events) ? payload.events : [] };
  }
  response = await fetch(`${IFOOD_BASE}/order/v1.0/orders:polling?limit=100`, { headers });
  if (response.status === 204) return { source: 'order_v1', events: [] };
  const payload = await readJsonSafe(response);
  if (!response.ok) throw Object.assign(new Error(ifoodError(payload, `Polling de pedidos iFood falhou (${response.status}).`)), { status: response.status });
  return { source: 'order_v1', events: Array.isArray(payload) ? payload : Array.isArray(payload?.events) ? payload.events : [] };
}

async function acknowledgeEvents(token, integration, source, ids) {
  if (!ids.length) return;
  if (source === 'events_v1') {
    const response = await fetch(`${IFOOD_BASE}/events/v1.0/events/acknowledgment`, {
      method: 'POST', headers: authHeaders(token, integration, { 'Content-Type': 'application/json' }), body: JSON.stringify(ids.map(id => ({ id }))),
    });
    if (!response.ok) throw new Error(`iFood não confirmou o ACK dos eventos (${response.status}).`);
    return;
  }
  const response = await fetch(`${IFOOD_BASE}/order/v1.0/orders:acknowledgment`, {
    method: 'POST', headers: authHeaders(token, integration, { 'Content-Type': 'application/json' }), body: JSON.stringify({ acknowledgedEventIds: ids }),
  });
  if (!response.ok) throw new Error(`iFood não confirmou o ACK dos pedidos (${response.status}).`);
}

async function processPolling(auth, integration, token) {
  const { source, events } = await pollEvents(token, integration);
  const acknowledged = [];
  let imported = 0, updated = 0, failed = 0;
  for (const event of events) {
    try {
      const orderId = event.orderId || event.metadata?.id;
      if (isNewOrderEvent(event, source)) {
        const result = await importOrder(auth, integration, event, token);
        if (result.imported) {
          imported += 1;
          if (integration.auto_accept_orders && result.order?.id) {
            const confirmResponse = await fetch(`${IFOOD_BASE}/order/v1.0/orders/${encodeURIComponent(orderId)}/confirm`, { method: 'POST', headers: authHeaders(token, integration, { 'Content-Type': 'application/json' }) });
            if (confirmResponse.ok || confirmResponse.status === 202) {
              await supabasePatch(auth, 'customer_orders', `id=eq.${encodeURIComponent(result.order.id)}`, { status: 'accepted' });
              await logSync(auth, integration.id, 'order_accept', 'success', 'Pedido confirmado automaticamente no iFood.', { eventId: event.id }, orderId);
            }
          }
        }
      } else if (orderId) {
        const local = await findLocalOrder(auth, integration.franchise_id, orderId);
        const status = localStatusForEvent(event, source);
        if (local && status && local.status !== status) {
          await supabasePatch(auth, 'customer_orders', `id=eq.${encodeURIComponent(local.id)}`, { status, ifood_event_id: event.id || local.ifood_event_id || null });
          updated += 1;
        }
      }
      if (event.id) acknowledged.push(event.id);
    } catch (error) {
      failed += 1;
      await logSync(auth, integration.id, 'status_update', 'error', error?.message || 'Falha ao processar evento iFood.', { event }, event.orderId || null);
      // Não enviar ACK quando o pedido ainda não pôde ser persistido. O iFood reenviará no próximo polling.
    }
  }
  if (acknowledged.length) await acknowledgeEvents(token, integration, source, acknowledged);
  await patchIntegration(auth, integration.id, { sync_status: 'connected', enabled: true, last_sync_at: new Date().toISOString(), error_message: null });
  return { source, received: events.length, acknowledged: acknowledged.length, imported, updated, failed };
}

async function getOrderAndIntegration(event, localOrderId) {
  const auth = await getSupabaseUser(event);
  if (!auth) throw Object.assign(new Error('Sessão obrigatória.'), { status: 401 });
  const rows = await supabaseGet(auth, 'customer_orders', `select=*&id=eq.${encodeURIComponent(localOrderId)}&limit=1`);
  const order = Array.isArray(rows) ? rows[0] : null;
  if (!order || order.delivery_source !== 'ifood' || !order.platform_order_id) throw Object.assign(new Error('Pedido iFood não encontrado.'), { status: 404 });
  const allowed = await authorizeAnalytics(event, order.franchise_id);
  if (!allowed.ok) throw Object.assign(new Error(allowed.error || 'Sem permissão.'), { status: allowed.status || 403 });
  const ints = await supabaseGet(auth, 'delivery_integrations', `select=*&franchise_id=eq.${encodeURIComponent(order.franchise_id)}&platform=eq.ifood&limit=1`);
  const integration = Array.isArray(ints) ? ints[0] : null;
  if (!integration) throw Object.assign(new Error('Integração iFood não encontrada para a franquia.'), { status: 404 });
  return { auth, order, integration };
}

async function performOrderAction(event, body) {
  const { auth, order, integration } = await getOrderAndIntegration(event, body.order_id);
  const state = await ensureAccessToken(integration);
  const token = state.accessToken;
  const platformOrderId = order.platform_order_id;
  const operation = body.operation;
  let endpoint = null, payload = undefined, logAction = 'status_update';
  if (operation === 'confirm') { endpoint = 'confirm'; logAction = 'order_accept'; }
  else if (operation === 'start_preparation') endpoint = 'startPreparation';
  else if (operation === 'ready') endpoint = 'readyToPickup';
  else if (operation === 'dispatch') {
    const original = await tokenStore().get(`orders/${integration.id}/${platformOrderId}`, { type: 'json', consistency: 'strong' }).catch(() => null);
    if (original?.delivery?.deliveredBy === 'IFOOD') {
      throw Object.assign(new Error('Este pedido usa entrega do iFood. Marque como PRONTO e aguarde o evento de coleta/despacho do iFood.'), { status: 409 });
    }
    endpoint = 'dispatch'; payload = { deliveredBy: 'MERCHANT' };
  } else if (operation === 'cancel') {
    if (!body.reason) {
      const reasonsResponse = await fetch(`${IFOOD_BASE}/order/v1.0/orders/${encodeURIComponent(platformOrderId)}/cancellationReasons`, { headers: authHeaders(token, integration) });
      const reasonsPayload = await readJsonSafe(reasonsResponse);
      if (!reasonsResponse.ok) throw Object.assign(new Error(ifoodError(reasonsPayload, `Não foi possível obter motivos de cancelamento (${reasonsResponse.status}).`)), { status: reasonsResponse.status });
      const reasons = Array.isArray(reasonsPayload) ? reasonsPayload : reasonsPayload?.reasons || [];
      return { requiresReason: true, reasons };
    }
    endpoint = 'requestCancellation'; payload = { reason: String(body.reason) }; logAction = 'order_cancel';
  } else throw Object.assign(new Error('Ação de pedido inválida.'), { status: 400 });

  const response = await fetch(`${IFOOD_BASE}/order/v1.0/orders/${encodeURIComponent(platformOrderId)}/${endpoint}`, {
    method: 'POST', headers: authHeaders(token, integration, { 'Content-Type': 'application/json' }), body: payload ? JSON.stringify(payload) : undefined,
  });
  const result = await readJsonSafe(response);
  if (!(response.ok || response.status === 202)) {
    await logSync(auth, integration.id, logAction, 'error', ifoodError(result, `iFood recusou a ação (${response.status}).`), result || {}, platformOrderId);
    throw Object.assign(new Error(ifoodError(result, `iFood recusou a ação (${response.status}).`)), { status: response.status });
  }
  await logSync(auth, integration.id, logAction, 'success', `Ação ${operation} enviada ao iFood.`, result || {}, platformOrderId);
  return { success: true, accepted: true, response: result };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método não permitido.' });
  try {
    const body = JSON.parse(event.body || '{}');
    if (body.action === 'order_action') return json(200, await performOrderAction(event, body));

    const { auth, integration } = await getIntegration(event, body.integration_id);
    if (body.action === 'generate_user_code') {
      const code = await requestUserCode(integration);
      const expiresIn = Number(code.expiresIn || 600);
      await setOAuthState(integration.id, {
        ...(await getOAuthState(integration.id) || {}),
        authorizationCodeVerifier: code.authorizationCodeVerifier,
        userCode: code.userCode,
        verificationUrl: code.verificationUrl,
        verificationUrlComplete: code.verificationUrlComplete,
        userCodeExpiresAt: Date.now() + expiresIn * 1000,
      });
      return json(200, { success: true, userCode: code.userCode, verificationUrl: code.verificationUrl, verificationUrlComplete: code.verificationUrlComplete, expiresIn });
    }
    if (body.action === 'authorize') {
      const current = await getOAuthState(integration.id);
      const tokenData = await exchangeAuthorizationCode(integration, body.authorization_code, current?.authorizationCodeVerifier);
      const expiresIn = Math.max(60, Number(tokenData.expiresIn || 0));
      let state = {
        ...current,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenType: tokenData.type || 'bearer',
        tokenExpiresAt: Date.now() + expiresIn * 1000,
        authorizationCodeVerifier: null,
        userCode: null,
        connectedAt: new Date().toISOString(),
      };
      await setOAuthState(integration.id, state);
      const merchants = await listMerchants(state.accessToken, integration);
      let storeId = integration.store_id;
      if ((!storeId || !merchants.some(m => m.id === storeId)) && merchants.length === 1) storeId = merchants[0].id;
      await patchIntegration(auth, integration.id, { enabled: true, sync_status: 'connected', store_id: storeId || integration.store_id || '', last_sync_at: new Date().toISOString(), error_message: null });
      return json(200, { success: true, connected: true, merchants, merchantId: storeId || null, expiresIn });
    }
    if (body.action === 'status' || body.action === 'test') {
      const state = await ensureAccessToken(integration);
      const merchants = await listMerchants(state.accessToken, integration);
      return json(200, { success: true, connected: true, merchants, merchantId: integration.store_id || merchants[0]?.id || null, tokenExpiresAt: state.tokenExpiresAt, testMode: isTestIntegration(integration) });
    }
    if (body.action === 'poll' || body.action === 'sync') {
      const state = await ensureAccessToken(integration);
      const result = await processPolling(auth, integration, state.accessToken);
      return json(200, { success: true, connected: true, ...result, message: `${result.imported} novo(s) pedido(s) iFood importado(s); ${result.updated} status atualizado(s).` });
    }
    if (body.action === 'disconnect') {
      await tokenStore().delete(`integration/${integration.id}`).catch(() => null);
      await patchIntegration(auth, integration.id, { enabled: false, sync_status: 'disconnected', error_message: null });
      return json(200, { success: true, connected: false });
    }
    return json(400, { error: 'Ação iFood desconhecida.' });
  } catch (error) {
    const status = Number(error?.status || 500);
    return json(status, { error: error?.message || 'Erro na integração iFood.', reconnect: Boolean(error?.reconnect), retryable: Boolean(error?.retryable) });
  }
}
