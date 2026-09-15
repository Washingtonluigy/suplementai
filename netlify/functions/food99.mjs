import { SUPABASE_URL, SUPABASE_ANON_KEY, getSupabaseUser } from './_supabase-public.mjs';
import { getStore } from '@netlify/blobs';

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

async function latestBlobStatus({ integrationId, taskId, shopId, appShopId }) {
  try {
    const store = getStore({ name: 'suplementaai-99food', consistency: 'strong' });
    const keys = [
      integrationId ? `menu-status/${integrationId}.json` : '',
      taskId ? `menu-task/${taskId}.json` : '',
      shopId ? `menu-shop/${shopId}.json` : '',
      appShopId ? `menu-appshop/${appShopId}.json` : '',
    ].filter(Boolean);
    for (const key of keys) {
      const value = await store.get(key, { type: 'json', consistency: 'strong' }).catch(() => null);
      if (value) return value;
    }
    return null;
  } catch {
    return null;
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

  const auth = await getSupabaseUser(event);
  if (!auth) return json(401, { ok: false, error: 'Sessão obrigatória.' });

  try {
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

    if (action === 'status') {
      const logs = await sbGet(`delivery_sync_logs?select=*&integration_id=eq.${encodeURIComponent(integrationId)}&action=eq.menu_sync&order=created_at.desc&limit=10`, auth.token);
      const latest = Array.isArray(logs) ? logs.find(row => row?.payload?.provider === '99food') : null;
      const payload = latest?.payload || {};
      const blob = await latestBlobStatus({
        integrationId,
        taskId: payload.task_id || payload.taskId || '',
        shopId: integration.store_id || '',
        appShopId: integration.food99?.appShopId || '',
      });
      return json(200, {
        ok: true,
        mapping: latest ? {
          app_item_id: payload.app_item_id || payload.appItemId || '',
          task_id: payload.task_id || payload.taskId || null,
          sync_status: blob?.status || payload.status || (latest.status === 'success' ? 'waiting' : 'failed'),
          callback: blob || null,
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

    const taskId = String(remote?.data?.taskID ?? remote?.data?.taskId ?? '');
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
