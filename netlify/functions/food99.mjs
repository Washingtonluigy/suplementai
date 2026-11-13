import { SUPABASE_URL, SUPABASE_ANON_KEY, getSupabaseUser } from './_supabase-public.mjs';
import { connectLambda, getStore } from '@netlify/blobs';
import { normalizeFood99Order, getOrderInfo, getOrderId, getShopId, parseFood99Json, verifyFood99OrderShop } from './_food99-orders.mjs';
import { FOOD99_ACTION_ENDPOINTS, planFood99StatusChange, parseFood99StatusReply } from './_food99-status.mjs';
import { normalizeFood99CancellationReasons } from './_food99-cancel-reasons.mjs';

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

function decodeBase64Url(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function encodeBase64Url(value) {
  return Buffer.from(String(value || ''), 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function encodeFood99Config(config) {
  return '99food:v1:' + encodeBase64Url(JSON.stringify({
    secret: String(config?.secret || '').trim(),
    appShopId: String(config?.appShopId || '').trim(),
    authToken: String(config?.authToken || '').trim(),
  }));
}

function parseFood99Config(raw) {
  const value = String(raw || '');
  if (!value.startsWith('99food:v1:')) return { secret: value, appShopId: '', authToken: '' };
  try {
    const obj = JSON.parse(decodeBase64Url(value.slice('99food:v1:'.length)));
    return {
      secret: String(obj?.secret || ''),
      appShopId: String(obj?.appShopId || ''),
      authToken: String(obj?.authToken || ''),
    };
  } catch {
    return { secret: '', appShopId: '', authToken: '' };
  }
}

async function loadIntegration(integrationId, auth) {
  const rows = await sbGet(`delivery_integrations?select=*&id=eq.${encodeURIComponent(integrationId)}&limit=1`, auth.token);
  const integration = rows?.[0];
  if (!integration) throw new Error('Integração 99Food não encontrada.');
  // Compatibilidade sem migration: 99Food usa o slot legado 99delivery no banco.
  if (integration.platform !== '99delivery') throw new Error('A integração selecionada não é 99Food.');
  const allowed = await authorizeFranchise(auth.user, auth.token, integration.franchise_id);
  if (!allowed) throw new Error('Você não tem permissão para esta integração.');
  return { ...integration, food99: parseFood99Config(integration.client_secret) };
}


function food99AuthUrl(endpoint, integration) {
  const appId = String(integration?.client_id || '').trim();
  const appSecret = String(integration?.food99?.secret || '').trim();
  const appShopId = String(integration?.food99?.appShopId || '').trim();
  if (!appId) throw new Error('Preencha o APP ID da 99Food.');
  if (!appSecret) throw new Error('Preencha o Secret do aplicativo 99Food.');
  if (!appShopId) throw new Error('Preencha o AppShopID da loja 99Food.');
  const params = new URLSearchParams({ app_id: appId, app_secret: appSecret, app_shop_id: appShopId });
  return `https://openapi.99food.com${endpoint}?${params.toString()}`;
}

async function callFood99Auth(endpoint, integration) {
  const response = await fetch(food99AuthUrl(endpoint, integration), {
    method: 'GET',
    headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
  });
  const raw = await response.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { raw }; }
  if (!response.ok) throw new Error(data?.errmsg || data?.message || `99Food Auth HTTP ${response.status}`);
  return data;
}

async function persistFood99Token(integration, auth, token) {
  const nextToken = String(token || '').trim();
  if (!nextToken || nextToken === String(integration?.food99?.authToken || '').trim()) return;
  integration.food99.authToken = nextToken;
  await sbPatch('delivery_integrations', `id=eq.${encodeURIComponent(integration.id)}`, {
    client_secret: encodeFood99Config(integration.food99),
    updated_at: new Date().toISOString(),
    error_message: null,
  }, auth.token).catch(() => null);
}

async function getValidFood99AuthToken(integration, auth, { forceRefresh = false } = {}) {
  const getToken = async () => {
    const result = await callFood99Auth('/v1/auth/authtoken/get', integration);
    const errno = Number(result?.errno ?? -1);
    const token = String(result?.data?.auth_token || '').trim();
    if (errno === 0 && token) {
      await persistFood99Token(integration, auth, token);
      return {
        token,
        expiration: Number(result?.data?.token_expiration_time || 0) || null,
        refreshed: false,
        remote: result,
      };
    }
    return { token: '', errno, remote: result };
  };

  let current = forceRefresh ? { token: '', errno: 10102 } : await getToken();
  if (current.token) return current;

  const expired = current.errno === 10102 || /expired|expirad/i.test(String(current?.remote?.errmsg || current?.remote?.message || ''));
  if (!expired && !forceRefresh) {
    const message = current?.remote?.errmsg || current?.remote?.message || `Não foi possível obter o auth_token da 99Food (errno ${current.errno}).`;
    throw new Error(message);
  }

  const refreshed = await callFood99Auth('/v1/auth/authtoken/refresh', integration);
  const refreshErrno = Number(refreshed?.errno ?? -1);
  if (refreshErrno !== 0 || refreshed?.data !== true) {
    throw new Error(refreshed?.errmsg || refreshed?.message || `Falha ao renovar auth_token da 99Food (errno ${refreshErrno}).`);
  }

  const after = await getToken();
  if (!after.token) {
    throw new Error(after?.remote?.errmsg || after?.remote?.message || 'A 99Food informou que o token foi renovado, mas ainda não devolveu um auth_token válido. Aguarde alguns segundos e tente novamente.');
  }
  return { ...after, refreshed: true, refreshRemote: refreshed };
}

const cleanId = (prefix, value) => {
  const normalized = String(value || '').replace(/[^a-zA-Z0-9_-]/g, '');
  return `${prefix}_${normalized}`.slice(0, 140);
};
const text = (value, max) => String(value || '').trim().slice(0, max);
const cents = (value) => Math.max(0, Math.round(Number(value || 0) * 100));

function normalizeTaskStatus(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === '0' || raw === 'waiting') return 'waiting';
  if (raw === '1' || raw === 'success') return 'success';
  if (raw === '2' || raw === 'failed') return 'failed';
  if (raw === '3' || raw === 'waitretry') return 'waiting';
  if (raw === '4' || raw === 'running') return 'running';
  if (raw === '5' || raw === 'partial success' || raw === 'partial_success') return 'partial_success';
  return 'unknown';
}

// IDs da 99Food (taskID, shopID etc.) são inteiros de 64 bits e podem ultrapassar
// Number.MAX_SAFE_INTEGER. JSON.parse() arredonda esses valores em JavaScript.
// Para taskID, preservamos os dígitos diretamente do JSON bruto antes de converter.
function extractExactIntegerField(rawJson, fieldNames = []) {
  const raw = String(rawJson || '');
  for (const name of fieldNames) {
    const rx = new RegExp('"' + String(name) + '"\\s*:\s*(?:"([0-9]+)"|([0-9]+))');
    const match = raw.match(rx);
    if (match) return String(match[1] || match[2] || '').trim();
  }
  return '';
}

async function latestBlobStatus({ integrationId, taskId, shopId, appShopId }) {
  try {
    const store = getStore('suplementaai-99food');
    const keys = [
      integrationId ? `menu-status/${integrationId}.json` : '',
      taskId ? `menu-task/${taskId}.json` : '',
      shopId ? `menu-shop/${shopId}.json` : '',
      appShopId ? `menu-appshop/${appShopId}.json` : '',
    ].filter(Boolean);
    for (const key of keys) {
      const value = await store.get(key, { type: 'json' }).catch(() => null);
      if (value) return value;
    }
    return null;
  } catch {
    return null;
  }
}

// Eventos de pedidos 99Food persistidos pelo webhook. Somente usuários da
// franquia vinculada à integração podem consultar e importar esses pedidos.
async function getFood99OrderDetail(integration, auth, orderId) {
  const authInfo = await getValidFood99AuthToken(integration, auth);
  const params = new URLSearchParams({ auth_token: authInfo.token, order_id: orderId });
  const remoteResponse = await fetch(`https://openapi.99food.com/v1/order/order/detail?${params.toString()}`, {
    method: 'GET', headers: { Accept: 'application/json', 'Cache-Control': 'no-store' },
  });
  const raw = await remoteResponse.text();
  let data;
  try { data = parseFood99Json(raw); } catch { throw new Error(`99Food retornou detalhes inválidos (HTTP ${remoteResponse.status}).`); }
  if (!remoteResponse.ok || Number(data?.errno ?? -1) !== 0) {
    throw new Error(`Não foi possível confirmar pedido na API da 99Food (HTTP ${remoteResponse.status}): ${String(data?.errmsg || data?.message || `errno ${data?.errno ?? 'desconhecido'}`).slice(0, 180)}`);
  }
  const detail = getOrderInfo(data) || data?.data;
  if (!detail || !getOrderId(data)) throw new Error('A 99Food não retornou os detalhes completos do pedido.');
  // Preservar o envelope autenticado: shop_id/AppShopID podem ficar em data
  // enquanto os produtos ficam em order_info. Ao descartar o envelope, o
  // validador interpretava falsamente a ausência como "pedido de outra loja".
  return data;
}

// Consulta SOMENTE LEITURA; não cancela ao carregar os motivos.
// O detalhe do pedido é o primeiro local onde procuramos motivos com IDs.
// O endpoint adicional é uma tentativa de descoberta, ainda dependente de
// confirmação no Sandbox/contrato oficial da conta 99Food.
async function getFood99CancellationReasons(integration, auth, order) {
  const detail = await getFood99OrderDetail(integration, auth, String(order.platform_order_id));
  const normalized = normalizeFood99Order(detail, String(order.platform_order_id));
  const shopCheck = verifyFood99OrderShop(normalized, String(integration.store_id || ''), String(integration.food99?.appShopId || ''));
  if (!shopCheck.ok) throw new Error(`Não foi possível confirmar a loja do pedido na 99Food: ${shopCheck.message}`);
  let reasons = normalizeFood99CancellationReasons(detail);
  if (reasons.length) return reasons;

  const tokenInfo = await getValidFood99AuthToken(integration, auth);
  const params = new URLSearchParams({ auth_token: tokenInfo.token, order_id: String(order.platform_order_id) });
  // Consulta exploratória sem efeito de alteração de pedido. Se a conta não
  // disponibilizar esta rota, NÃO inventamos códigos nem cancelamos.
  const url = `https://openapi.99food.com/v1/order/order/cancel/reasons?${params.toString()}`;
  try {
    const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json', 'Cache-Control': 'no-store' } });
    if (response.ok) {
      const raw = await response.text();
      const result = raw ? parseFood99Json(raw) : {};
      if (Number(result?.errno ?? result?.code ?? -1) === 0) {
        reasons = normalizeFood99CancellationReasons(result);
        if (reasons.length) return reasons;
      }
    }
  } catch { /* Indisponibilidade de consulta: falhar fechado sem cancelar. */ }
  throw new Error('A 99Food não disponibilizou IDs de motivos de cancelamento para este pedido. Nenhum cancelamento foi enviado. Precisamos confirmar na documentação da 99Food a rota oficial que lista os motivos (reason_id) para sua conta.');
}

async function importFood99Order(integration, auth, normalized) {
  const platformOrderId = normalized.id;
  const filter = `franchise_id=eq.${encodeURIComponent(integration.franchise_id)}&platform_order_id=eq.${encodeURIComponent(platformOrderId)}&limit=1`;
  const existing = await sbGet(`customer_orders?select=id&${filter}`, auth.token);
  if (existing?.length) return false;

  // Exatamente o mesmo modelo de pedidos utilizado pelo iFood. A importação
  // passa pelo JWT da franquia, respeitando as políticas já existentes.
  const payload = {
    franchise_id: integration.franchise_id,
    customer_name: normalized.customer,
    customer_phone: normalized.phone || null,
    items: normalized.items,
    total: normalized.total,
    status: 'pending',
    order_type: 'public',
    delivery: normalized.delivery,
    // O CHECK ja existente no Bolt aceita '99delivery', nao '99food'.
    // O frontend exibe '99delivery' como 99Food (sem migracao).
    delivery_source: '99delivery',
    delivery_source_detail: '99FOOD',
    address: normalized.address,
    notes: normalized.notes,
    order_mode: normalized.delivery ? 'delivery' : 'pickup',
    payment_method: normalized.paymentMethod,
    discount_amount: 0,
    subtotal: normalized.total,
    delivery_fee: 0,
    delivery_payment_method: 'on_delivery',
    delivery_fee_payer: 'customer',
    platform_order_id: platformOrderId,
    created_at: normalized.createdAt,
  };
  try {
    await sbInsert('customer_orders', payload, auth.token);
  } catch (error) {
    // Se outra aba registrou o mesmo pedido, não duplique.
    const concurrent = await sbGet(`customer_orders?select=id&${filter}`, auth.token).catch(() => []);
    if (concurrent?.length) return false;
    throw error;
  }
  try {
    await sbInsert('sales', {
      franchise_id: integration.franchise_id,
      total: normalized.total,
      items_count: normalized.items.reduce((count, item) => count + item.quantity, 0),
      sale_type: 'counter', campaign_name: null,
      items: normalized.items,
      delivery_source: '99delivery', payment_method: normalized.paymentMethod,
      discount: 0, discount_type: 'fixed', amount_paid: 0,
      change: null, subtotal: normalized.total, delivery_fee: 0,
      delivery_fee_payer: 'customer', installments: null,
    }, auth.token);
  } catch (error) {
    console.warn('[99Food] pedido gravado, mas espelho de vendas falhou:', error?.message || String(error));
  }
  return true;
}

// Autorização de cancelamento: colaborador limitado pode operar a fila, mas
// cancelar um pedido externo continua reservado à gestão da unidade.
async function canCancelFood99(auth, franchiseId) {
  if (auth.user?.user_metadata?.role === 'master') return true;
  const rows = await sbGet(`franchise_users?select=id,phone,auth_user_id&franchise_id=eq.${encodeURIComponent(franchiseId)}&order=created_at.asc`, auth.token);
  const requester = (rows || []).find(row => String(row.auth_user_id || '') === String(auth.user.id));
  if (!requester) return false;
  if (rows?.[0]?.id === requester.id) return true;
  const phone = String(requester.phone || '');
  const marker = '|||SAIACL1:';
  const pos = phone.indexOf(marker);
  if (pos < 0) return false;
  try {
    const profile = JSON.parse(Buffer.from(phone.slice(pos + marker.length), 'base64').toString('utf8'));
    return profile?.mode === 'full';
  } catch { return false; }
}

async function changeFood99OrderStatus(integration, auth, { orderId, expected, next, confirmationCode = '', cancelReason = '', cancelReasonId = '' }) {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) throw new Error('Pedido local inválido.');
  const rows = await sbGet(`customer_orders?select=id,franchise_id,status,delivery,delivery_source,platform_order_id&id=eq.${encodeURIComponent(orderId)}&franchise_id=eq.${encodeURIComponent(integration.franchise_id)}&limit=1`, auth.token);
  const order = rows?.[0];
  if (!order || order.delivery_source !== '99delivery' || !/^\d{8,24}$/.test(String(order.platform_order_id || '')))
    throw new Error('Este pedido não pertence à 99Food desta franquia.');
  if (order.status !== expected) throw new Error('O status já mudou em outra sessão. Atualize os pedidos.');
  const plan = planFood99StatusChange(order.status, next, { delivery: order.delivery });
  if (!plan.ok) throw new Error(plan.message);
  if (next === 'cancelled' && !(await canCancelFood99(auth, integration.franchise_id)))
    throw new Error('Somente a gestão pode cancelar pedidos da 99Food.');

  let remoteStatus = 'local_only';
  if (plan.remote) {
    const tokenInfo = await getValidFood99AuthToken(integration, auth);
    const endpoint = FOOD99_ACTION_ENDPOINTS[plan.remote];
    const payload = { auth_token: tokenInfo.token, order_id: String(order.platform_order_id) };
    if (plan.remote === 'cancel') {
      // A 99Food exige reason_id numérico. Validar no servidor que o ID veio
      // da lista retornada pela própria 99Food para ESSE pedido e loja.
      if (!/^\d{1,12}$/.test(cancelReasonId)) throw new Error('Selecione um motivo de cancelamento da própria 99Food.');
      const official = await getFood99CancellationReasons(integration, auth, order);
      const chosen = official.find(item => item.id === cancelReasonId);
      if (!chosen) throw new Error('Motivo de cancelamento não está disponível para este pedido. Atualize a lista da 99Food.');
      payload.reason_id = Number(chosen.id);
      payload.reason = chosen.description.slice(0, 200);
      payload.cancel_reason = chosen.description.slice(0, 200);
    }
    if (plan.remote === 'delivered' && confirmationCode.trim()) {
      if (!/^\d{4,8}$/.test(confirmationCode.trim())) throw new Error('Código de entrega inválido.');
      payload.verify_code = confirmationCode.trim();
    }
    let raw = '';
    let httpStatus = 0;
    try {
      const result = await fetch(`https://openapi.99food.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      httpStatus = result.status;
      raw = await result.text();
    } catch (error) {
      throw new Error(`Não foi possível comunicar com a 99Food: ${error instanceof Error ? error.message : String(error)}. O status local permanece igual.`);
    }
    let remote;
    try {
      remote = raw.trim() ? parseFood99Json(raw) : {};
    } catch {
      // A API pode ter processado a requisição antes de devolver resposta inválida.
      // Não presumir sucesso nem repetir automaticamente uma operação com efeito remoto.
      throw new Error(`A 99Food devolveu uma resposta em formato inesperado (HTTP ${httpStatus}). O status local não foi alterado. Consulte o pedido no Sandbox antes de tentar novamente.`);
    }
    const checked = parseFood99StatusReply(httpStatus, remote);
    if (!checked.ok) throw new Error(`99Food não confirmou ${next}: ${checked.message}. O status no Suplementaai não foi alterado.`);
    remoteStatus = 'confirmed';
  }

  // A alteração local só ocorre após a API remota confirmar (quando aplicável).
  // O filtro pelo status anterior impede sobrescrever alterações de outro operador.
  const saved = await sbPatch('customer_orders',
    `id=eq.${encodeURIComponent(order.id)}&franchise_id=eq.${encodeURIComponent(integration.franchise_id)}&status=eq.${encodeURIComponent(expected)}`,
    { status: next }, auth.token);
  if (!saved?.id) throw new Error('A 99Food aceitou a ação, mas o registro local não pôde ser atualizado. Atualize a página e confira os dois status antes de tentar novamente.');
  const logAction = next === 'cancelled' ? 'order_cancel' : next === 'accepted' ? 'order_accept' : 'status_update';
  await sbInsert('delivery_sync_logs', {
    integration_id: integration.id, action: logAction, platform_order_id: String(order.platform_order_id),
    payload: { provider: '99food', previous: expected, next, remote_status: remoteStatus },
    status: 'success', message: `${expected} -> ${next}`,
  }, auth.token).catch(error => console.warn('[99Food] Log de status não persistido:', error?.message || error));
  return { ok: true, order: saved, remoteStatus, message: remoteStatus === 'local_only'
    ? (next === 'delivering'
      ? 'Em entrega atualizado no Suplementaai. A 99Food não recebeu uma nova chamada de despacho; confira o status no Sandbox.'
      : 'Etapa de preparo atualizada no Suplementaai. A 99Food não possui ação remota separada para este status.')
    : `99Food confirmou a ação e o pedido foi atualizado para ${next}.` };
}

async function pollFood99Orders(integration, auth) {
  const shopId = String(integration.store_id || '').trim();
  const appShopId = String(integration.food99?.appShopId || '').trim();
  if (!shopId || !appShopId) throw new Error('Preencha o Shop ID e AppShopID corretos da loja 99Food.');
  const store = getStore('suplementaai-99food');
  const prefix = `orders/${shopId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80)}/`;
  const listed = await store.list({ prefix });
  const pending = (listed?.blobs || []).slice(0, 20);
  const lastWebhook = await store.get(`diagnostics/${shopId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80)}.json`, { type: 'json' }).catch(() => null);
  let imported = 0;
  let duplicate = 0;
  const errors = [];
  for (const item of pending) {
    const key = item.key;
    try {
      const queued = await store.get(key, { type: 'json' });
      if (!queued || String(queued.shopId) !== shopId || String(queued.appShopId) !== appShopId) {
        throw new Error('Evento pertence a outra loja ou AppShopID.');
      }
      // Segurança: um POST recebido na URL pública NÃO é suficiente para gerar
      // uma venda. Consultamos o pedido na API autenticada da 99Food.
      const detail = await getFood99OrderDetail(integration, auth, queued.orderId);
      const normalized = normalizeFood99Order(detail, queued.orderId);
      const shopVerification = verifyFood99OrderShop(normalized, shopId, appShopId);
      if (!shopVerification.ok) throw new Error(shopVerification.message);
      const created = await importFood99Order(integration, auth, normalized);
      if (created) imported += 1;
      else duplicate += 1;
      await store.delete(key);
    } catch (error) {
      errors.push({ orderId: item.key.split('/').pop()?.replace(/\.json$/, '') || '', message: String(error?.message || error).slice(0, 240) });
    }
  }
  return {
    ok: errors.length === 0, imported, duplicate,
    pending: pending.length, failed: errors.length, errors,
    lastWebhook: lastWebhook?.receivedAt || null,
    message: errors.length
      ? `99Food: ${imported} importado(s), ${errors.length} pendente(s) por erro. ${errors[0].message}`
      : pending.length === 0
        ? `99Food: fila vazia para esta loja. ${lastWebhook?.receivedAt ? `Último evento de pedido: ${lastWebhook.receivedAt}.` : 'Não há evento de novo pedido registrado.'} Consulte pelo ID do pedido para buscar direto na 99Food.`
        : `99Food: ${imported} pedido(s) importado(s), ${duplicate} já existente(s).`,
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

  const auth = await getSupabaseUser(event);
  if (!auth) return json(401, { ok: false, error: 'Sessão obrigatória.' });

  try {
    // Mesma inicialização utilizada pelas outras Functions legadas deste projeto.
    // Evita MissingBlobsEnvironmentError sem variáveis no Netlify.
    connectLambda(event);
    const body = JSON.parse(event.body || '{}');
    const action = String(body?.action || '');
    const integrationId = String(body?.integration_id || '').trim();
    if (!integrationId) return json(400, { ok: false, error: 'integration_id é obrigatório.' });

    const integration = await loadIntegration(integrationId, auth);

    if (action === 'test_config' || action === 'refresh_auth') {
      const authInfo = await getValidFood99AuthToken(integration, auth, { forceRefresh: action === 'refresh_auth' });
      return json(200, {
        ok: true,
        configured: Boolean(integration.client_id && integration.food99?.secret && integration.food99?.appShopId && authInfo.token),
        appId: integration.client_id || '',
        shopId: integration.store_id || '',
        appShopId: integration.food99?.appShopId || '',
        authToken: authInfo.token,
        tokenExpirationTime: authInfo.expiration,
        refreshed: Boolean(authInfo.refreshed),
      });
    }

    if (action === 'storage_health') {
      // Teste real de leitura/escrita na mesma fila que recebe o callback.
      const store = getStore('suplementaai-99food');
      const key = `health/${integration.id}.json`;
      const sample = { timestamp: Date.now(), integrationId: integration.id };
      await store.setJSON(key, sample);
      const recovered = await store.get(key, { type: 'json' });
      await store.delete(key);
      if (recovered?.integrationId !== integration.id) throw new Error('Netlify Blobs não confirmou a leitura/escrita da fila 99Food.');
      return json(200, { ok: true, message: 'Fila 99Food disponível para guardar e recuperar notificações.' });
    }

    if (action === 'cancellation_reasons') {
      const orderId = String(body?.local_order_id || '').trim();
      if (!/^[0-9a-f-]{36}$/i.test(orderId)) return json(400, { ok: false, error: 'Pedido inválido.' });
      if (!(await canCancelFood99(auth, integration.franchise_id)))
        return json(403, { ok: false, error: 'Somente a gestão pode cancelar pedidos da 99Food.' });
      const rows = await sbGet(`customer_orders?select=id,franchise_id,status,delivery,delivery_source,platform_order_id&id=eq.${encodeURIComponent(orderId)}&franchise_id=eq.${encodeURIComponent(integration.franchise_id)}&limit=1`, auth.token);
      const order = rows?.[0];
      if (!order || order.delivery_source !== '99delivery' || !/^\d{8,24}$/.test(String(order.platform_order_id || '')))
        return json(403, { ok: false, error: 'Pedido não pertence à 99Food desta franquia.' });
      if (!planFood99StatusChange(order.status, 'cancelled', { delivery: order.delivery }).ok)
        return json(409, { ok: false, error: 'Este pedido não permite mais cancelamento.' });
      const reasons = await getFood99CancellationReasons(integration, auth, order);
      return json(200, { ok: true, reasons });
    }

    if (action === 'change_order_status') {
      const orderId = String(body?.local_order_id || '').trim();
      const expected = String(body?.expected_status || '').trim();
      const next = String(body?.next_status || '').trim();
      const confirmationCode = String(body?.confirmation_code || '').trim();
      const cancelReason = String(body?.cancel_reason || '').trim();
      const cancelReasonId = String(body?.cancel_reason_id || '').trim();
      const result = await changeFood99OrderStatus(integration, auth, { orderId, expected, next, confirmationCode, cancelReason, cancelReasonId });
      return json(200, result);
    }

    if (action === 'poll_orders') {
      const result = await pollFood99Orders(integration, auth);
      return json(result.failed ? 207 : 200, result);
    }

    if (action === 'import_order_by_id') {
      // Recuperação manual pelo ID exibido no Sandbox. Não depende da fila
      // nem confia nos dados enviados pelo navegador; busca autenticada na 99Food.
      const orderId = String(body?.order_id || '').trim();
      if (!/^\d{8,24}$/.test(orderId)) return json(400, { ok: false, error: 'Informe o ID numérico completo do pedido da 99Food.' });
      const shopId = String(integration.store_id || '').trim();
      const appShopId = String(integration.food99?.appShopId || '').trim();
      if (!shopId || !appShopId) return json(400, { ok: false, error: 'Informe o Shop ID e AppShopID da loja vinculada.' });
      const detail = await getFood99OrderDetail(integration, auth, orderId);
      const normalized = normalizeFood99Order(detail, orderId);
      const shopVerification = verifyFood99OrderShop(normalized, shopId, appShopId);
      if (!shopVerification.ok) return json(shopVerification.code === 'SHOP_ID_NOT_RETURNED' ? 422 : 403, {
        ok: false, code: shopVerification.code, error: shopVerification.message,
      });
      const created = await importFood99Order(integration, auth, normalized);
      const safeShop = shopId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
      const safeId = orderId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
      await getStore('suplementaai-99food').delete(`orders/${safeShop}/${safeId}.json`).catch(() => null);
      return json(200, {
        ok: true, imported: created ? 1 : 0, duplicate: created ? 0 : 1, orderId,
        message: created ? `Pedido 99Food #${orderId} importado. Confira Pedidos online.` : `Pedido 99Food #${orderId} já estava cadastrado.`,
      });
    }

    if (action === 'status') {
      const logs = await sbGet(`delivery_sync_logs?select=*&integration_id=eq.${encodeURIComponent(integrationId)}&action=eq.menu_sync&order=created_at.desc&limit=10`, auth.token);
      const latest = Array.isArray(logs) ? logs.find(row => row?.payload?.provider === '99food') : null;
      const payload = latest?.payload || {};
      const taskId = String(payload.task_id || payload.taskId || '').trim();
      const blob = await latestBlobStatus({
        integrationId,
        taskId,
        shopId: integration.store_id || '',
        appShopId: integration.food99?.appShopId || '',
      });

      // V39: não dependemos mais do callback para descobrir o resultado do upload.
      // Consultamos diretamente a API oficial Get Menu Upload Task Info.
      let remoteTask = null;
      let remoteError = null;
      if (latest && taskId) {
        try {
          const authInfo = await getValidFood99AuthToken(integration, auth);
          // Documentação/integrações públicas usam taskID. Na V40 usamos taskID primeiro e
          // não escondemos a resposta de erro. task_id/taskId ficam apenas como fallback.
          const variants = [
            ['taskID', taskId],
            ['taskId', taskId],
            ['task_id', taskId],
          ];
          const attempts = [];
          for (const [taskKey, taskValue] of variants) {
            const params = new URLSearchParams({ auth_token: authInfo.token });
            params.set(taskKey, taskValue);
            const response = await fetch(`https://openapi.99food.com/v1/item/item/getMenuTaskInfo?${params.toString()}`, {
              method: 'GET',
              headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
            });
            const raw = await response.text();
            let data = {};
            try { data = raw ? JSON.parse(raw) : {}; } catch { data = { raw }; }
            attempts.push({ taskKey, httpStatus: response.status, data, raw });
            if (response.ok && Number(data?.errno ?? -1) === 0) {
              remoteTask = data;
              break;
            }
            remoteError = data?.errmsg || data?.message || `99Food Task HTTP ${response.status}`;
          }
          if (!remoteTask && attempts.length) {
            remoteError = `${remoteError || 'Falha ao consultar tarefa'} | tentativas: ${attempts.map(a => `${a.taskKey}:${a.httpStatus}/errno=${a.data?.errno ?? '?'}/${a.data?.errmsg || a.data?.message || 'sem mensagem'}`).join(' ; ')}`;
          }
        } catch (error) {
          remoteError = error instanceof Error ? error.message : String(error);
        }
      }

      const remoteStatusRaw = remoteTask?.data?.status ?? remoteTask?.data?.taskStatus ?? remoteTask?.data?.task_status;
      const remoteStatus = remoteTask ? normalizeTaskStatus(remoteStatusRaw) : 'unknown';
      const resolvedStatus = remoteStatus !== 'unknown'
        ? remoteStatus
        : (blob?.status || payload.status || (latest?.status === 'success' ? 'waiting' : 'failed'));

      return json(200, {
        ok: true,
        mapping: latest ? {
          app_item_id: payload.app_item_id || payload.appItemId || '',
          task_id: taskId || null,
          sync_status: resolvedStatus,
          callback: blob || null,
          remote_task: remoteTask,
          remote_error: remoteError,
          remote_message: remoteTask?.data?.message || remoteTask?.errmsg || null,
          remote_details: remoteTask?.data || null,
          task_id_safe_integer: taskId ? /^\d+$/.test(taskId) && Number(taskId) <= Number.MAX_SAFE_INTEGER : null,
          direct_query_ok: Boolean(remoteTask),
        } : null,
      });
    }

    if (action !== 'upload_test_item') return json(400, { ok: false, error: 'Ação 99Food não suportada.' });

    // V37: o token da loja não precisa mais ser copiado manualmente.
    // Antes de qualquer operação, consultamos /auth/authtoken/get e, se estiver vencido,
    // executamos /auth/authtoken/refresh e buscamos o novo token automaticamente.
    const authInfo = await getValidFood99AuthToken(integration, auth);
    const authToken = authInfo.token;

    const productId = String(body?.product_id || '').trim();
    if (!productId) return json(400, { ok: false, error: 'Selecione um produto do SuplementaAI.' });

    const products = await sbGet(`franchise_products?select=id,franchise_id,category_id,name,description,price,discount_price,image_url,sort_order,active&id=eq.${encodeURIComponent(productId)}&franchise_id=eq.${encodeURIComponent(integration.franchise_id)}&limit=1`, auth.token);
    const product = products?.[0];
    if (!product) return json(404, { ok: false, error: 'Produto não encontrado nesta franquia.' });
    if (!product.active) return json(400, { ok: false, error: 'O produto selecionado está inativo.' });
    if (!product.category_id) return json(400, { ok: false, error: 'O produto precisa estar vinculado a uma categoria antes de enviar à 99Food.' });

    const categories = await sbGet(`franchise_categories?select=id,name,sort_order&id=eq.${encodeURIComponent(product.category_id)}&franchise_id=eq.${encodeURIComponent(integration.franchise_id)}&limit=1`, auth.token);
    const category = categories?.[0];
    if (!category) return json(404, { ok: false, error: 'Categoria do produto não encontrada.' });

    const appMenuId = cleanId('menu', integration.franchise_id);
    const appCategoryId = cleanId('cat', category.id);
    const appItemId = cleanId('item', product.id);
    const effectivePrice = product.discount_price != null && Number(product.discount_price) > 0 ? Number(product.discount_price) : Number(product.price || 0);
    if (effectivePrice <= 0) return json(400, { ok: false, error: 'O produto selecionado precisa ter preço maior que zero.' });

    const item = {
      item_name: text(product.name, 180),
      short_desc: text(product.description || '', 1500),
      price: cents(effectivePrice),
      status: 1,
      priority: Math.max(1, Number(product.sort_order || 0) + 1),
      app_item_id: appItemId,
      is_sold_separately: true,
    };
    const imageUrl = String(product.image_url || '').trim();
    if (/^https:\/\//i.test(imageUrl)) item.head_img = imageUrl;

    const payload = {
      auth_token: authToken,
      menus: [{ menu_name: 'SuplementaAI', app_menu_id: appMenuId, app_category_ids: [appCategoryId] }],
      categories: [{ app_category_id: appCategoryId, priority: Math.max(1, Number(category.sort_order || 0) + 1), category_name: text(category.name, 100), app_item_ids: [appItemId] }],
      items: [item],
      modifier_groups: [],
    };

    const response = await fetch('https://openapi.99food.com/v3/item/item/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const raw = await response.text();
    let remote = {};
    try { remote = raw ? JSON.parse(raw) : {}; } catch { remote = { raw }; }
    const errno = Number(remote?.errno ?? (response.ok ? 0 : -1));

    if (!response.ok || errno !== 0) {
      await sbInsert('delivery_sync_logs', {
        integration_id: integrationId,
        action: 'menu_sync',
        payload: { provider: '99food', product_id: product.id, app_item_id: appItemId, remote, status: 'failed' },
        status: 'error',
        message: remote?.errmsg || remote?.message || `99Food HTTP ${response.status}`,
      }, auth.token).catch(() => null);
      return json(400, { ok: false, error: remote?.errmsg || remote?.message || `99Food respondeu HTTP ${response.status}.`, remote, appItemId });
    }

    // IMPORTANT: taskID é uint64 e normalmente > Number.MAX_SAFE_INTEGER.
    // Extrair do texto bruto evita arredondamento silencioso do JSON.parse().
    const exactTaskId = extractExactIntegerField(raw, ['taskID', 'taskId', 'task_id']);
    const parsedTaskId = remote?.data?.taskID ?? remote?.data?.taskId ?? remote?.data?.task_id ?? '';
    const taskId = exactTaskId || String(parsedTaskId || '');
    const initialStatus = normalizeTaskStatus(remote?.data?.status ?? 0);
    await sbInsert('delivery_sync_logs', {
      integration_id: integrationId,
      action: 'menu_sync',
      payload: { provider: '99food', product_id: product.id, app_item_id: appItemId, task_id: taskId || null, response: remote, status: initialStatus },
      status: 'success',
      message: `Menu 99Food enviado. APPitemID ${appItemId}${taskId ? `, task ${taskId}` : ''}.`,
    }, auth.token);
    await sbPatch('delivery_integrations', `id=eq.${encodeURIComponent(integrationId)}`, {
      sync_status: 'syncing',
      last_sync_at: new Date().toISOString(),
      error_message: null,
      updated_at: new Date().toISOString(),
    }, auth.token).catch(() => null);

    return json(200, {
      ok: true,
      message: 'Upload do item enviado para a 99Food. Aguarde o callback uploadMenuTaskStatus antes de usar o APPitemID no Sandbox.',
      appItemId,
      taskId: taskId || null,
      productName: product.name,
      status: initialStatus,
      tokenRefreshed: Boolean(authInfo.refreshed),
      tokenExpirationTime: authInfo.expiration,
      remote,
    });
  } catch (error) {
    console.error('[99Food API]', error);
    return json(500, { ok: false, error: error instanceof Error ? error.message : 'Erro inesperado na integração 99Food.' });
  }
}
