import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { SUPABASE_URL, SUPABASE_ANON_KEY, getSupabaseUser } from './_supabase-public.mjs';

const IFOOD_BASE = 'https://merchant-api.ifood.com.br';
const AUTH_BASE = `${IFOOD_BASE}/authentication/v1.0`;
const EVENTS_BASE = `${IFOOD_BASE}/events/v1.0`;
const ORDER_BASE = `${IFOOD_BASE}/order/v1.0`;
const MERCHANT_BASE = `${IFOOD_BASE}/merchant/v1.0`;

// Credenciais públicas do ambiente de teste (D) exibidas no iFood Developer.
// Pedidos gerados em "Pedidos de teste" exigem o header x-request-homologation.
const TEST_D_CLIENT_ID = '7781671b-9fca-494d-bb7a-a08e7d8bd28c';
const TEST_D_MERCHANT_UUID = '1cc635b2-8c62-4b2c-9c01-cff40bdc8c83';

function isHomologationIntegration(integration) {
  return String(integration?.client_id || '').trim() === TEST_D_CLIENT_ID
    || String(integration?.store_id || '').trim() === TEST_D_MERCHANT_UUID;
}

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Content-Type, Authorization',
    'access-control-allow-methods': 'POST, OPTIONS',
    'cache-control': 'no-store',
  },
  body: JSON.stringify(body),
});

const safeText = async (response) => {
  const text = await response.text().catch(() => '');
  if (!text) return '';
  try { return JSON.stringify(JSON.parse(text)); } catch { return text; }
};

function sbHeaders(userToken, extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${userToken}`,
    Accept: 'application/json',
    ...extra,
  };
}

async function sbGet(path, userToken) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: sbHeaders(userToken) });
  const data = await response.json().catch(() => []);
  if (!response.ok) throw new Error(data?.message || data?.error || `Supabase GET ${response.status}`);
  return data;
}

async function sbInsert(table, payload, userToken) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: sbHeaders(userToken, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => []);
  if (!response.ok) throw new Error(data?.message || data?.error || `Supabase INSERT ${response.status}`);
  return Array.isArray(data) ? data[0] : data;
}

async function sbPatch(table, filter, payload, userToken) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: sbHeaders(userToken, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => []);
  if (!response.ok) throw new Error(data?.message || data?.error || `Supabase PATCH ${response.status}`);
  return Array.isArray(data) ? data[0] : data;
}

async function authorizeFranchise(user, userToken, franchiseId) {
  if (user?.user_metadata?.role === 'master') return true;
  const rows = await sbGet(`franchise_users?select=franchise_id&auth_user_id=eq.${encodeURIComponent(user.id)}&limit=1`, userToken);
  return String(rows?.[0]?.franchise_id || '') === String(franchiseId || '');
}

async function loadIntegration(integrationId, auth) {
  const rows = await sbGet(`delivery_integrations?select=*&id=eq.${encodeURIComponent(integrationId)}&limit=1`, auth.token);
  const integration = rows?.[0];
  if (!integration) throw new Error('Integração iFood não encontrada.');
  if (integration.platform !== 'ifood') throw new Error('A integração selecionada não é do iFood.');
  const allowed = await authorizeFranchise(auth.user, auth.token, integration.franchise_id);
  if (!allowed) throw new Error('Você não tem permissão para esta integração.');
  return integration;
}

function deriveKey(secret, integrationId) {
  return createHash('sha256').update(`${secret}:${integrationId}:suplementaai-ifood-oauth-v21`).digest();
}

function encryptState(state, secret, integrationId) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', deriveKey(secret, integrationId), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(state), 'utf8'), cipher.final()]);
  return {
    v: 1,
    iv: iv.toString('base64url'),
    tag: cipher.getAuthTag().toString('base64url'),
    data: encrypted.toString('base64url'),
  };
}

function decryptState(envelope, secret, integrationId) {
  if (!envelope?.iv || !envelope?.tag || !envelope?.data) return null;
  try {
    const decipher = createDecipheriv('aes-256-gcm', deriveKey(secret, integrationId), Buffer.from(envelope.iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64url'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(envelope.data, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

async function insertLog(integration, auth, { status = 'success', message = '', payload = {}, platformOrderId = null, action = 'status_update' }) {
  return sbInsert('delivery_sync_logs', {
    integration_id: integration.id,
    action,
    platform_order_id: platformOrderId,
    payload,
    status,
    message,
  }, auth.token);
}

async function loadOAuthState(integration, auth) {
  // Filtra no próprio PostgREST para que o estado OAuth não desapareça do alcance
  // mesmo que a loja gere centenas de logs de pedido entre uma renovação e outra.
  const contains = encodeURIComponent(JSON.stringify({ kind: 'ifood_oauth_state_v21' }));
  const rows = await sbGet(
    `delivery_sync_logs?select=id,payload,created_at,message&integration_id=eq.${encodeURIComponent(integration.id)}&action=eq.status_update&payload=cs.${contains}&order=created_at.desc&limit=5`,
    auth.token,
  );
  for (const row of rows || []) {
    const state = decryptState(row?.payload?.state, integration.client_secret || '', integration.id);
    if (state) return state;
  }
  return null;
}

async function saveOAuthState(integration, auth, state, message) {
  const envelope = encryptState(state, integration.client_secret || '', integration.id);
  await insertLog(integration, auth, {
    status: 'success',
    message,
    payload: { kind: 'ifood_oauth_state_v21', state: envelope },
  });
}

async function ifoodForm(path, form) {
  const response = await fetch(`${AUTH_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams(form),
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!response.ok) {
    const message = data?.error?.message || data?.message || data?.error_description || text || `HTTP ${response.status}`;
    throw new Error(`iFood: ${message}`);
  }
  return data || {};
}

function normalizeTokenResponse(data, previousRefreshToken = '') {
  const accessToken = data.accessToken || data.access_token || '';
  const refreshToken = data.refreshToken || data.refresh_token || previousRefreshToken || '';
  const expiresIn = Number(data.expiresIn || data.expires_in || 10800);
  if (!accessToken) throw new Error('O iFood não retornou accessToken.');
  return {
    accessToken,
    refreshToken,
    expiresIn,
    expiresAt: Date.now() + Math.max(60, expiresIn) * 1000,
    tokenType: data.type || data.token_type || 'bearer',
  };
}

async function refreshAccessToken(integration, auth, state) {
  if (!state?.refreshToken) throw new Error('Refresh token do iFood não encontrado. Conecte a loja novamente.');
  const data = await ifoodForm('/oauth/token', {
    grantType: 'refresh_token',
    clientId: integration.client_id,
    clientSecret: integration.client_secret,
    refreshToken: state.refreshToken,
  });
  const nextToken = normalizeTokenResponse(data, state.refreshToken);
  const next = { ...state, ...nextToken, refreshedAt: new Date().toISOString(), disconnected: false };
  await saveOAuthState(integration, auth, next, 'Token iFood renovado automaticamente.');
  return next;
}

async function ensureToken(integration, auth, forceRefresh = false) {
  let state = await loadOAuthState(integration, auth);
  if (!state || state.disconnected) throw new Error('Loja iFood ainda não está conectada.');
  const expiresSoon = !state.accessToken || !state.expiresAt || Number(state.expiresAt) <= Date.now() + 120000;
  if (forceRefresh || expiresSoon) state = await refreshAccessToken(integration, auth, state);
  return state;
}

async function ifoodApiFetch(url, token, options = {}, integration = null) {
  const homologationHeaders = isHomologationIntegration(integration)
    ? { 'x-request-homologation': 'true' }
    : {};

  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...homologationHeaders,
      ...(options.headers || {}),
    },
  });
}

async function withFreshToken(integration, auth, requestFactory) {
  let state = await ensureToken(integration, auth);
  let response = await requestFactory(state.accessToken);
  if (response.status === 401 && state.refreshToken) {
    state = await refreshAccessToken(integration, auth, state);
    response = await requestFactory(state.accessToken);
  }
  return { response, state };
}

function paymentMethodFromOrder(order) {
  const method = order?.payments?.methods?.[0]?.method;
  const map = {
    PIX: 'pix',
    CREDIT: 'credit_card',
    DEBIT: 'debit_card',
    CASH: 'cash',
    MEAL_VOUCHER: 'meal_voucher',
    FOOD_VOUCHER: 'meal_voucher',
  };
  return map[String(method || '').toUpperCase()] || null;
}

function customerPhone(order) {
  const phone = order?.customer?.phone;
  if (!phone) return null;
  if (typeof phone === 'string') return phone;
  const parts = [phone.countryCode, phone.areaCode, phone.number].filter(Boolean).map(String);
  return parts.length ? parts.join('') : (phone.localizer ? String(phone.localizer) : null);
}

function formatAddress(order) {
  const address = order?.delivery?.deliveryAddress;
  if (!address) return null;
  const line = address.formattedAddress || [address.streetName, address.streetNumber].filter(Boolean).join(', ');
  return [line, address.neighborhood, address.city && address.state ? `${address.city}/${address.state}` : address.city || address.state, address.postalCode ? `CEP ${address.postalCode}` : null]
    .filter(Boolean)
    .join(' - ');
}

function mapItems(order) {
  return (order?.items || []).map((item) => ({
    id: item.id || item.uniqueId || null,
    external_code: item.externalCode || null,
    name: item.name || 'Item iFood',
    quantity: Number(item.quantity || 0),
    price: Number(item.unitPrice ?? item.price ?? 0),
    total_price: Number(item.totalPrice ?? item.price ?? 0),
    notes: item.observations || item.note || null,
    options: (item.options || []).map((option) => ({
      name: option.name,
      quantity: Number(option.quantity || 0),
      price: Number(option.unitPrice ?? option.price ?? 0),
    })),
  }));
}

async function getOrderDetail(integration, auth, orderId) {
  const { response } = await withFreshToken(integration, auth, (token) =>
    ifoodApiFetch(`${ORDER_BASE}/orders/${encodeURIComponent(orderId)}`, token, {}, integration),
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`iFood detalhes do pedido (${response.status}): ${await safeText(response)}`);
  return response.json();
}

async function findLocalOrder(integration, auth, platformOrderId) {
  const rows = await sbGet(
    `customer_orders?select=*&franchise_id=eq.${encodeURIComponent(integration.franchise_id)}&platform_order_id=eq.${encodeURIComponent(platformOrderId)}&limit=1`,
    auth.token,
  );
  return rows?.[0] || null;
}

async function importOrder(integration, auth, detail, event) {
  const existing = await findLocalOrder(integration, auth, detail.id || event.orderId);
  if (existing) return { order: existing, imported: false };

  const orderType = String(detail.orderType || '').toUpperCase();
  const delivery = orderType === 'DELIVERY';
  const address = detail?.delivery?.deliveryAddress;
  const totals = detail?.total || {};
  const payment = detail?.payments?.methods?.[0] || {};
  const items = mapItems(detail);
  const notes = [
    detail.extraInfo,
    detail?.delivery?.observations,
    detail?.takeout?.observations,
    detail?.displayId ? `iFood #${detail.displayId}` : null,
    detail?.isTest || detail?.test ? 'PEDIDO DE TESTE IFOOD' : null,
  ].filter(Boolean).join('\n');

  const payload = {
    franchise_id: integration.franchise_id,
    customer_name: detail?.customer?.name || 'Cliente iFood',
    customer_phone: customerPhone(detail),
    items,
    total: Number(totals.orderAmount ?? 0),
    status: 'pending',
    order_type: 'public',
    delivery,
    delivery_source: 'ifood',
    delivery_source_detail: detail?.delivery?.deliveredBy ? String(detail.delivery.deliveredBy).toUpperCase() : null,
    address: formatAddress(detail),
    notes: notes || null,
    order_mode: delivery ? 'delivery' : 'pickup',
    customer_reference: address?.reference || null,
    payment_method: paymentMethodFromOrder(detail),
    discount_amount: Number(totals.benefits || 0),
    subtotal: Number(totals.subTotal || 0),
    delivery_fee: Number(totals.deliveryFee || 0),
    delivery_payment_method: String(payment.type || '').toUpperCase() === 'ONLINE' ? 'online' : 'on_delivery',
    delivery_fee_payer: 'customer',
    platform_order_id: detail.id || event.orderId,
    ifood_event_id: event.id || null,
    created_at: detail.createdAt || new Date().toISOString(),
  };

  let inserted;
  try {
    inserted = await sbInsert('customer_orders', payload, auth.token);
  } catch (error) {
    // Duas abas podem consultar o mesmo evento quase ao mesmo tempo. O índice único
    // por platform_order_id é a última barreira contra duplicação.
    const raced = await findLocalOrder(integration, auth, payload.platform_order_id).catch(() => null);
    if (raced) return { order: raced, imported: false };
    throw error;
  }

  try {
    await sbInsert('sales', {
      franchise_id: integration.franchise_id,
      total: Number(totals.orderAmount ?? 0),
      items_count: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      sale_type: 'counter',
      campaign_name: null,
      items,
      delivery_source: 'ifood',
      payment_method: paymentMethodFromOrder(detail),
      discount: Number(totals.benefits || 0),
      discount_type: 'fixed',
      amount_paid: Number(detail?.payments?.prepaid || 0),
      change: payment?.cash?.changeFor ? Math.max(0, Number(payment.cash.changeFor) - Number(payment.value || 0)) : null,
      subtotal: Number(totals.subTotal || 0),
      delivery_fee: Number(totals.deliveryFee || 0),
      delivery_fee_payer: 'customer',
      installments: null,
    }, auth.token);
  } catch {
    // O pedido é a fonte operacional. Falha no espelho de relatório não impede o ACK.
  }

  await insertLog(integration, auth, {
    action: 'order_received',
    platformOrderId: payload.platform_order_id,
    status: 'success',
    message: `Pedido iFood ${detail.displayId || payload.platform_order_id} importado.`,
    payload: { displayId: detail.displayId, total: payload.total, isTest: Boolean(detail.isTest || detail.test) },
  });

  return { order: inserted, imported: true };
}

async function acknowledgeEvents(integration, auth, ids, mode = 'order') {
  if (!ids.length) return;

  const target = mode === 'events'
    ? `${EVENTS_BASE}/events/acknowledgment`
    : `${ORDER_BASE}/orders:acknowledgment`;

  const body = mode === 'events'
    ? ids.map((id) => ({ id }))
    : { acknowledgedEventIds: ids };

  const { response } = await withFreshToken(integration, auth, (token) =>
    ifoodApiFetch(target, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }, integration),
  );
  if (!response.ok) throw new Error(`iFood ACK ${mode} (${response.status}): ${await safeText(response)}`);
}

function localStatusFromEvent(event) {
  const code = String(event.code || '').toUpperCase();
  const full = String(event.fullCode || '').toUpperCase();
  if (code === 'CFM' || full === 'CONFIRMED' || full === 'ORDER_CONFIRMED') return 'accepted';
  if (code === 'SPS' || full === 'PREPARATION_STARTED' || full === 'SEPARATION_STARTED') return 'preparing';
  if (code === 'SPE' || full === 'PREPARATION_ENDED' || full === 'SEPARATION_ENDED' || code === 'RTP' || full === 'READY_TO_PICKUP') return 'ready';
  if (code === 'DSP' || full === 'DISPATCHED') return 'delivering';
  if (code === 'CON' || full === 'CONCLUDED') return 'delivered';
  if (code === 'CAN' || full === 'CANCELLED') return 'cancelled';
  return null;
}

async function processEvent(integration, auth, event) {
  const code = String(event.code || '').toUpperCase();
  const fullCode = String(event.fullCode || '').toUpperCase();
  const isPlaced = code === 'PLC' || fullCode === 'PLACED' || fullCode === 'ORDER_PLACED';
  const isConfirmed = code === 'CFM' || fullCode === 'CONFIRMED' || fullCode === 'ORDER_CONFIRMED';
  const orderId = event.orderId || event.metadata?.id;

  if (!orderId) return { ack: true, imported: false, updated: false, ignored: true };

  let local = await findLocalOrder(integration, auth, orderId);
  let imported = false;

  if (!local && (isPlaced || isConfirmed)) {
    const detail = await getOrderDetail(integration, auth, orderId);
    if (!detail) return { ack: false, retry: true, imported: false, updated: false };
    const result = await importOrder(integration, auth, detail, event);
    local = result.order;
    imported = result.imported;

    if (integration.auto_accept_orders && isPlaced) {
      try {
        const actionResult = await performOrderAction(integration, auth, orderId, 'confirm');
        if (actionResult.ok && local?.id) {
          await sbPatch('customer_orders', `id=eq.${encodeURIComponent(local.id)}`, { status: 'accepted' }, auth.token);
        }
      } catch {
        // Não bloqueia processamento do pedido. Operador pode aceitar manualmente.
      }
    }
  }

  const mapped = localStatusFromEvent(event);
  let updated = false;
  if (mapped && local?.id && local.status !== mapped) {
    await sbPatch('customer_orders', `id=eq.${encodeURIComponent(local.id)}`, { status: mapped }, auth.token);
    updated = true;
  }

  return { ack: true, imported, updated, ignored: !imported && !updated };
}

async function testIfoodConnection(integration, auth) {
  if (!integration.enabled) throw new Error('A integração iFood ainda não está conectada. Gere o código, autorize no Portal do Parceiro e conecte novamente.');
  if (!integration.store_id) throw new Error('Merchant UUID não preenchido.');

  const homologation = isHomologationIntegration(integration);
  let mode = homologation ? 'events' : 'order';
  let response;

  if (homologation) {
    ({ response } = await withFreshToken(integration, auth, (token) =>
      ifoodApiFetch(`${EVENTS_BASE}/events:polling`, token, {
        headers: { 'x-polling-merchants': integration.store_id },
      }, integration),
    ));

    if ([400, 403, 404, 405].includes(response.status)) {
      mode = 'order';
      ({ response } = await withFreshToken(integration, auth, (token) =>
        ifoodApiFetch(`${ORDER_BASE}/orders:polling?limit=1`, token, {}, integration),
      ));
    }
  } else {
    ({ response } = await withFreshToken(integration, auth, (token) =>
      ifoodApiFetch(`${ORDER_BASE}/orders:polling?limit=1`, token, {}, integration),
    ));

    if ([400, 403, 404, 405].includes(response.status)) {
      mode = 'events';
      ({ response } = await withFreshToken(integration, auth, (token) =>
        ifoodApiFetch(`${EVENTS_BASE}/events:polling`, token, {
          headers: { 'x-polling-merchants': integration.store_id },
        }, integration),
      ));
    }
  }

  if (![200, 204].includes(response.status)) {
    throw new Error(`iFood teste de conexão ${mode}${homologation ? ' (homologação)' : ''} (${response.status}): ${await safeText(response)}`);
  }

  await sbPatch('delivery_integrations', `id=eq.${encodeURIComponent(integration.id)}`, {
    sync_status: 'connected',
    error_message: null,
    updated_at: new Date().toISOString(),
  }, auth.token);

  await insertLog(integration, auth, {
    action: 'status_update',
    status: 'success',
    message: `Conectividade iFood validada (${mode}${homologation ? ' / homologação' : ''}).`,
    payload: { kind: 'ifood_connectivity_test', mode, merchantUuid: integration.store_id, homologation },
  });

  return {
    success: true,
    connected: true,
    mode,
    homologation,
    message: homologation
      ? `Conexão com o iFood validada no ambiente de teste/homologação (${mode}).`
      : `Conexão com o iFood validada (${mode}).`,
  };
}

async function pollEvents(integration, auth) {
  if (!integration.enabled) throw new Error('Ative/conecte a integração iFood primeiro.');
  if (!integration.store_id) throw new Error('Merchant UUID não preenchido.');

  const homologation = isHomologationIntegration(integration);
  let pollMode = homologation ? 'events' : 'order';
  let response;

  if (homologation) {
    ({ response } = await withFreshToken(integration, auth, (token) =>
      ifoodApiFetch(`${EVENTS_BASE}/events:polling`, token, {
        headers: { 'x-polling-merchants': integration.store_id },
      }, integration),
    ));

    if ([400, 403, 404, 405].includes(response.status)) {
      pollMode = 'order';
      ({ response } = await withFreshToken(integration, auth, (token) =>
        ifoodApiFetch(`${ORDER_BASE}/orders:polling?limit=100`, token, {}, integration),
      ));
    }
  } else {
    ({ response } = await withFreshToken(integration, auth, (token) =>
      ifoodApiFetch(`${ORDER_BASE}/orders:polling?limit=100`, token, {}, integration),
    ));

    if ([400, 403, 404, 405].includes(response.status)) {
      pollMode = 'events';
      ({ response } = await withFreshToken(integration, auth, (token) =>
        ifoodApiFetch(`${EVENTS_BASE}/events:polling`, token, {
          headers: { 'x-polling-merchants': integration.store_id },
        }, integration),
      ));
    }
  }

  if (response.status === 204) {
    await sbPatch('delivery_integrations', `id=eq.${encodeURIComponent(integration.id)}`, {
      sync_status: 'connected', last_sync_at: new Date().toISOString(), error_message: null, updated_at: new Date().toISOString(),
    }, auth.token);
    return {
      success: true, events: 0, imported: 0, updated: 0, pollMode, homologation,
      message: homologation
        ? `Nenhum evento novo no iFood Teste (${pollMode}, homologação ativa).`
        : 'Nenhum evento novo no iFood.',
    };
  }

  if (!response.ok) throw new Error(`iFood polling ${pollMode}${homologation ? ' (homologação)' : ''} (${response.status}): ${await safeText(response)}`);
  const raw = await response.json().catch(() => []);
  const events = Array.isArray(raw) ? raw : (Array.isArray(raw?.events) ? raw.events : []);
  const ackIds = [];
  let imported = 0;
  let updated = 0;
  let retry = 0;

  for (const event of events) {
    try {
      const result = await processEvent(integration, auth, event);
      if (result.ack && event.id) ackIds.push(event.id);
      if (result.imported) imported += 1;
      if (result.updated) updated += 1;
      if (result.retry) retry += 1;
    } catch (error) {
      await insertLog(integration, auth, {
        action: 'status_update', status: 'error', platformOrderId: event.orderId || null,
        message: `Erro ao processar evento iFood: ${error.message}`,
        payload: { eventId: event.id, code: event.code, fullCode: event.fullCode, pollMode, homologation },
      }).catch(() => undefined);
    }
  }

  if (ackIds.length) await acknowledgeEvents(integration, auth, ackIds, pollMode);

  await sbPatch('delivery_integrations', `id=eq.${encodeURIComponent(integration.id)}`, {
    sync_status: 'connected', last_sync_at: new Date().toISOString(), error_message: null, updated_at: new Date().toISOString(),
  }, auth.token);

  return {
    success: true,
    events: events.length,
    acknowledged: ackIds.length,
    imported,
    updated,
    retry,
    pollMode,
    homologation,
    message: imported
      ? `${imported} pedido(s) novo(s) do iFood importado(s).`
      : `Polling iFood concluído (${events.length} evento(s), ${pollMode}${homologation ? ', homologação' : ''}).`,
  };
}

async function performOrderAction(integration, auth, orderId, action, reason = null) {
  const pathMap = {
    confirm: { path: 'confirm', body: null },
    startPreparation: { path: 'startPreparation', body: null },
    readyToPickup: { path: 'readyToPickup', body: null },
    dispatch: { path: 'dispatch', body: { deliveredBy: 'MERCHANT' } },
    requestCancellation: { path: 'requestCancellation', body: { reason: String(reason || '') } },
  };
  const config = pathMap[action];
  if (!config) throw new Error('Ação iFood inválida.');
  if (action === 'requestCancellation' && !reason) throw new Error('Escolha um motivo de cancelamento válido do iFood.');

  const { response } = await withFreshToken(integration, auth, (token) =>
    ifoodApiFetch(`${ORDER_BASE}/orders/${encodeURIComponent(orderId)}/${config.path}`, token, {
      method: 'POST',
      ...(config.body ? { body: JSON.stringify(config.body) } : {}),
    }, integration),
  );
  if (!response.ok) throw new Error(`iFood ${config.path} (${response.status}): ${await safeText(response)}`);
  await insertLog(integration, auth, {
    action: action === 'requestCancellation' ? 'order_cancel' : 'order_accept',
    platformOrderId: orderId,
    status: 'success',
    message: `Ação ${config.path} enviada ao iFood.`,
    payload: reason ? { reason } : {},
  });
  return { ok: true, status: response.status };
}

async function cancellationReasons(integration, auth, orderId) {
  const { response } = await withFreshToken(integration, auth, (token) =>
    ifoodApiFetch(`${ORDER_BASE}/orders/${encodeURIComponent(orderId)}/cancellationReasons`, token, {}, integration),
  );
  if (response.status === 204) return [];
  if (!response.ok) throw new Error(`iFood cancellationReasons (${response.status}): ${await safeText(response)}`);
  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? data : (data?.reasons || []);
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Use POST.' });

  try {
    const auth = await getSupabaseUser(event);
    if (!auth) return json(401, { error: 'Faça login novamente no SuplementaAi.' });

    const body = JSON.parse(event.body || '{}');
    const action = String(body.action || '');
    const integrationId = String(body.integration_id || '');
    if (!integrationId) return json(400, { error: 'integration_id obrigatório.' });

    const integration = await loadIntegration(integrationId, auth);

    if (action === 'generate_user_code') {
      if (!integration.client_id || !integration.client_secret) return json(400, { error: 'Preencha e salve Client ID e Client Secret completos antes de gerar o vínculo.' });
      if (!integration.store_id) return json(400, { error: 'Preencha e salve o Merchant UUID da loja de teste antes de gerar o vínculo.' });
      const data = await ifoodForm('/oauth/userCode', { clientId: integration.client_id });
      const verifier = data.authorizationCodeVerifier;
      if (!data.userCode || !verifier) throw new Error('O iFood não retornou userCode/authorizationCodeVerifier.');
      const previous = await loadOAuthState(integration, auth);
      // O Portal do Parceiro nem sempre preserva a rota de autorização após o login.
      // A documentação oficial do iFood define /apps/code?c=USER_CODE como a URL direta.
      const directVerificationUrl = `https://portal.ifood.com.br/apps/code?c=${encodeURIComponent(data.userCode)}`;
      const next = {
        ...(previous || {}),
        userCode: data.userCode,
        authorizationCodeVerifier: verifier,
        verificationUrl: data.verificationUrl || 'https://portal.ifood.com.br/apps/code',
        verificationUrlComplete: directVerificationUrl,
        userCodeExpiresAt: Date.now() + Number(data.expiresIn || 600) * 1000,
        disconnected: false,
      };
      await saveOAuthState(integration, auth, next, 'Código de vínculo iFood gerado.');
      return json(200, {
        success: true,
        userCode: data.userCode,
        verificationUrl: data.verificationUrl || 'https://portal.ifood.com.br/apps/code',
        verificationUrlComplete: directVerificationUrl,
        expiresIn: Number(data.expiresIn || 600),
      });
    }

    if (action === 'exchange_code') {
      if (!integration.client_id || !integration.client_secret) return json(400, { error: 'Salve Client ID e Client Secret completos antes de conectar.' });
      const authorizationCode = String(body.authorization_code || '').trim();
      if (!authorizationCode) return json(400, { error: 'Cole o código de autorização mostrado pelo iFood.' });
      const state = await loadOAuthState(integration, auth);
      if (!state?.authorizationCodeVerifier) return json(400, { error: 'Gere um novo código de vínculo antes de conectar. O verificador não foi encontrado.' });
      if (state.userCodeExpiresAt && Number(state.userCodeExpiresAt) < Date.now()) return json(400, { error: 'O código de vínculo expirou. Gere outro e autorize novamente.' });

      const tokenData = await ifoodForm('/oauth/token', {
        grantType: 'authorization_code',
        clientId: integration.client_id,
        clientSecret: integration.client_secret,
        authorizationCode,
        authorizationCodeVerifier: state.authorizationCodeVerifier,
      });
      const token = normalizeTokenResponse(tokenData);
      const next = {
        ...state,
        ...token,
        authorizationCodeVerifier: null,
        authorizationCode: null,
        connectedAt: new Date().toISOString(),
        disconnected: false,
      };
      await saveOAuthState(integration, auth, next, 'Loja conectada ao iFood com OAuth distribuído.');
      await sbPatch('delivery_integrations', `id=eq.${encodeURIComponent(integration.id)}`, {
        enabled: true, sync_status: 'connected', error_message: null, updated_at: new Date().toISOString(),
      }, auth.token);
      return json(200, { success: true, connected: true, expiresIn: token.expiresIn, message: 'iFood conectado com sucesso.' });
    }

    if (action === 'status') {
      const state = await loadOAuthState(integration, auth);
      const connected = Boolean(integration.enabled && state?.accessToken && !state?.disconnected);
      return json(200, {
        success: true,
        connected,
        syncStatus: integration.sync_status,
        lastSyncAt: integration.last_sync_at,
        merchantUuid: integration.store_id,
        expiresAt: connected ? state.expiresAt : null,
        hasRefreshToken: Boolean(state?.refreshToken),
      });
    }

    if (action === 'test_connection') {
      try {
        const result = await testIfoodConnection(integration, auth);
        return json(200, result);
      } catch (error) {
        const message = error?.message || 'Falha ao validar a conexão com o iFood.';
        await sbPatch('delivery_integrations', `id=eq.${encodeURIComponent(integration.id)}`, {
          sync_status: 'error', error_message: message, updated_at: new Date().toISOString(),
        }, auth.token).catch(() => undefined);
        await insertLog(integration, auth, {
          action: 'status_update',
          status: 'error',
          message: `Teste de conectividade iFood falhou: ${message}`,
          payload: { kind: 'ifood_connectivity_error' },
        }).catch(() => undefined);
        throw error;
      }
    }

    if (action === 'poll') {
      try {
        const result = await pollEvents(integration, auth);
        return json(200, result);
      } catch (error) {
        const message = error?.message || 'Falha desconhecida no polling do iFood.';
        await sbPatch('delivery_integrations', `id=eq.${encodeURIComponent(integration.id)}`, {
          sync_status: 'error', error_message: message, updated_at: new Date().toISOString(),
        }, auth.token).catch(() => undefined);
        await insertLog(integration, auth, {
          action: 'status_update',
          status: 'error',
          message: `Polling iFood falhou: ${message}`,
          payload: { kind: 'ifood_poll_error' },
        }).catch(() => undefined);
        throw error;
      }
    }

    if (action === 'cancellation_reasons') {
      const orderId = String(body.order_id || '').trim();
      if (!orderId) return json(400, { error: 'order_id obrigatório.' });
      const reasons = await cancellationReasons(integration, auth, orderId);
      return json(200, { success: true, reasons });
    }

    if (action === 'order_action') {
      const orderId = String(body.order_id || '').trim();
      const orderAction = String(body.order_action || '').trim();
      if (!orderId || !orderAction) return json(400, { error: 'order_id e order_action são obrigatórios.' });
      const result = await performOrderAction(integration, auth, orderId, orderAction, body.reason);
      return json(200, { success: true, ...result });
    }

    if (action === 'disconnect') {
      const state = await loadOAuthState(integration, auth);
      await saveOAuthState(integration, auth, { ...(state || {}), accessToken: null, refreshToken: null, disconnected: true, disconnectedAt: new Date().toISOString() }, 'Integração iFood desconectada.');
      await sbPatch('delivery_integrations', `id=eq.${encodeURIComponent(integration.id)}`, {
        enabled: false, sync_status: 'disconnected', error_message: null, updated_at: new Date().toISOString(),
      }, auth.token);
      return json(200, { success: true, connected: false });
    }

    return json(400, { error: 'Ação iFood desconhecida.' });
  } catch (error) {
    return json(500, { error: error?.message || 'Erro inesperado na integração iFood.' });
  }
}
