import { getStore } from '@netlify/blobs';
import { parseFood99Json, getOrderId, getShopId, getAppShopId, getEventType, isNewOrderEvent } from './_food99-orders.mjs';

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Content-Type, X-Request-Id, X-Signature, Signature, X-Timestamp',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'cache-control': 'no-store',
  },
  body: JSON.stringify(body),
});

const str = (value) => (typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '');
const getPath = (input, path) => path.split('.').reduce((acc, key) => acc == null ? undefined : acc[key], input);
function firstString(input, paths) {
  for (const path of paths) {
    const value = str(getPath(input, path));
    if (value) return value;
  }
  return '';
}
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

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  const params = event.queryStringParameters || {};
  const challenge = params.challenge || params.echo || params.echostr;
  if (event.httpMethod === 'GET') {
    if (challenge) return { statusCode: 200, headers: { 'content-type': 'text/plain; charset=utf-8' }, body: String(challenge) };
    return json(200, { ok: true, provider: '99food', endpoint: 'food99-webhook', mode: 'netlify', message: 'Webhook 99Food disponível.' });
  }
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

  try {
    let payload = {};
    try { payload = parseFood99Json(event.body || '{}'); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
    const bodyChallenge = firstString(payload, ['challenge', 'echo', 'echostr', 'data.challenge']);
    if (bodyChallenge && !firstString(payload, ['orderId', 'order.id', 'data.orderId', 'data.order.id', 'eventId', 'event_id'])) {
      return { statusCode: 200, headers: { 'content-type': 'text/plain; charset=utf-8' }, body: bodyChallenge };
    }

    const eventId = firstString(payload, ['eventId','event_id','messageId','message_id','requestId','request_id','id','data.eventId','data.event_id','data.messageId','data.id']) || event.headers?.['x-request-id'] || `${Date.now()}`;
    const eventType = firstString(payload, ['eventType','event_type','type','topic','action','data.eventType','data.event_type','data.type']);
    const taskId = firstString(payload, ['taskID','taskId','task_id','data.taskID','data.taskId','data.task_id']);
    const rawStatus = firstString(payload, ['status','taskStatus','task_status','data.status','data.taskStatus','data.task_status']);
    const storeId = firstString(payload, ['storeId','store_id','shopId','shop_id','merchantId','merchant_id','restaurantId','restaurant_id','data.storeId','data.store_id','data.shopId','data.shop_id','data.merchantId','data.merchant_id','order.storeId','order.shopId','data.order.storeId','data.order.shopId']);
    const appShopId = firstString(payload, ['appShopId','app_shop_id','APPShopID','data.appShopId','data.app_shop_id','data.APPShopID','shop.appShopId','data.shop.appShopId']);

    const store = getStore({ name: 'suplementaai-99food', consistency: 'strong' });
    const safeEventId = String(eventId).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180);
    await store.setJSON(`events/${Date.now()}-${safeEventId}.json`, {
      eventId,
      eventType,
      storeId,
      appShopId,
      taskId,
      status: rawStatus,
      payload,
      receivedAt: new Date().toISOString(),
    });

    // Novo pedido: guardar na fila por loja. O serviço autenticado irá buscar os
    // detalhes diretamente na 99Food antes de gravar no banco. Nunca importar
    // dados recebidos de uma requisição pública sem validação no provedor.
    if (isNewOrderEvent(payload)) {
      const orderId = getOrderId(payload);
      const callbackShop = getShopId(payload);
      const callbackAppShop = getAppShopId(payload);
      if (!orderId || !callbackShop || !callbackAppShop) {
        console.warn('[99Food webhook] callback de pedido incompleto');
        return json(422, { ok: false, error: 'Order ID/shop ID/appShopID missing' });
      }
      const safeShop = callbackShop.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
      const safeId = orderId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
      await store.setJSON(`orders/${safeShop}/${safeId}.json`, {
        orderId, shopId: callbackShop, appShopId: callbackAppShop,
        eventType: getEventType(payload), receivedAt: new Date().toISOString(),
        // Sem PII no registro da fila; detalhes são recuperados do provedor.
      });
    }

    const normalizedType = String(eventType || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedType.includes('uploadmenutaskstatus')) {
      const integrationHint = firstString(payload, ['integrationId','integration_id','data.integrationId','data.integration_id']);
      const statusRecord = {
        eventId,
        eventType,
        taskId: taskId || null,
        status: normalizeTaskStatus(rawStatus),
        rawStatus,
        storeId: storeId || null,
        appShopId: appShopId || null,
        payload,
        receivedAt: new Date().toISOString(),
      };
      if (integrationHint) await store.setJSON(`menu-status/${integrationHint}.json`, statusRecord);
      if (taskId) await store.setJSON(`menu-task/${taskId}.json`, statusRecord);
      if (storeId) await store.setJSON(`menu-shop/${storeId}.json`, statusRecord);
      if (appShopId) await store.setJSON(`menu-appshop/${appShopId}.json`, statusRecord);
    }

    return json(200, { ok: true, success: true, code: 0, errno: 0, message: 'success', received: true, eventId });
  } catch (error) {
    console.error('[99Food webhook]', error);
    // Não confirmar falsamente uma notificação que não foi persistida.
    return json(503, { ok: false, error: 'Webhook temporarily unavailable' });
  }
}
