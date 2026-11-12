// Normalização de dados 99Food. Não usa credenciais nem acesso ao banco.
// IDs numéricos da 99Food devem ser preservados como strings (int64).
export const digits = (value) => typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint'
  ? String(value).trim() : '';

// A 99Food devolve dados em envelopes diferentes entre callbacks, Sandbox e
// consulta de detalhes. Procurar apenas em order_info.shop_id confunde campo
// ausente com pedido de outra loja. Nunca inferir um ID vindo do navegador.
const ORDER_WRAPPERS = ['order_info', 'orderInfo', 'order', 'order_detail', 'orderDetail', 'detail'];
const CONTAINER_WRAPPERS = ['data', 'result', 'response'];
const SHOP_WRAPPERS = ['shop_info', 'shopInfo', 'shop', 'store_info', 'storeInfo', 'store'];
const ORDER_ID_KEYS = ['order_id', 'orderId', 'orderID'];
const SHOP_ID_KEYS = ['shop_id', 'shopId', 'shopID', 'store_id', 'storeId'];
const APP_SHOP_ID_KEYS = ['app_shop_id', 'appShopId', 'appShopID', 'APPShopID', 'APPShopId'];

function parsedObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string' && /^\s*\{/.test(value)) {
    try {
      const parsed = parseFood99Json(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    } catch { return null; }
  }
  return null;
}

function findIdentityValue(payload, names, { allowShopObjectId = false } = {}) {
  const root = parsedObject(payload);
  if (!root) return '';
  const visited = new Set();
  const search = (node, depth) => {
    const object = parsedObject(node);
    if (!object || depth > 5 || visited.has(object)) return '';
    visited.add(object);
    // O ID mais próximo dos dados do próprio pedido tem precedência sobre
    // metadados da resposta. Não aceitar um ID arbitrário do corpo da requisição.
    for (const key of ORDER_WRAPPERS) {
      const value = search(object[key], depth + 1);
      if (value) return value;
    }
    for (const key of names) {
      const value = digits(object[key]);
      if (value) return value;
    }
    if (allowShopObjectId) {
      for (const key of SHOP_WRAPPERS) {
        const shop = parsedObject(object[key]);
        if (!shop) continue;
        for (const name of [...names, 'id']) {
          const id = digits(shop[name]);
          if (id) return id;
        }
      }
    }
    for (const key of CONTAINER_WRAPPERS) {
      const value = search(object[key], depth + 1);
      if (value) return value;
    }
    return '';
  };
  return search(root, 0);
}

export const getOrderInfo = (payload) => {
  const root = parsedObject(payload);
  if (!root) return null;
  const scan = (node, depth) => {
    const obj = parsedObject(node);
    if (!obj || depth > 4) return null;
    for (const key of ORDER_WRAPPERS) {
      const order = parsedObject(obj[key]);
      if (order) return order;
    }
    for (const key of CONTAINER_WRAPPERS) {
      const found = scan(obj[key], depth + 1);
      if (found) return found;
    }
    return null;
  };
  return scan(root, 0);
};
export const getOrderId = (payload) => findIdentityValue(payload, ORDER_ID_KEYS);
export const getShopId = (payload) => findIdentityValue(payload, SHOP_ID_KEYS, { allowShopObjectId: true });
export const getAppShopId = (payload) => findIdentityValue(payload, APP_SHOP_ID_KEYS);

// Um pedido com IDs expressamente diferentes deve ser recusado. Quando a API
// omite shop_id, o AppShopID devolvido PELA PRÓPRIA API autenticada precisa
// corresponder à loja. Nunca aceitar ausência de ambos os identificadores.
export function verifyFood99OrderShop(normalized, expectedShopId, expectedAppShopId) {
  const expectedShop = digits(expectedShopId);
  const expectedAppShop = digits(expectedAppShopId);
  const actualShop = digits(normalized?.shopId);
  const actualAppShop = digits(normalized?.appShopId);
  if (!expectedShop || !expectedAppShop) return { ok: false, code: 'MISSING_CONFIG', message: 'Configure o Shop ID e o AppShopID desta loja.' };
  if (actualShop && actualShop !== expectedShop) return {
    ok: false, code: 'SHOP_MISMATCH',
    message: `Shop ID diferente: configurado ${expectedShop}, retornado pela 99Food ${actualShop}. Nenhuma venda foi criada.`,
  };
  if (actualAppShop && actualAppShop !== expectedAppShop) return {
    ok: false, code: 'APP_SHOP_MISMATCH',
    message: `AppShopID diferente: configurado ${expectedAppShop}, retornado pela 99Food ${actualAppShop}. Nenhuma venda foi criada.`,
  };
  if (!actualShop && !actualAppShop) return {
    ok: false, code: 'SHOP_ID_NOT_RETURNED',
    message: 'A 99Food não informou Shop ID nem AppShopID nos detalhes autenticados. Não foi possível confirmar a loja; nenhuma venda foi criada.',
  };
  return { ok: true, code: actualShop ? 'MATCH_SHOP_ID' : 'MATCH_APP_SHOP_ID' };
}
export const getEventType = (payload) => String(payload?.type || payload?.event_type || payload?.eventType || payload?.event || '').trim();
export const isNewOrderEvent = (payload) => /^(ordernew|neworder|ordercreated|ordercreate)$/i.test(getEventType(payload).replace(/[^a-z0-9]/gi, ''));

export function parseFood99Json(raw) {
  // JSON.parse arredondaria IDs de 64 bits. Protege os campos de IDs antes de fazer parse.
  return JSON.parse(String(raw || '{}').replace(/("(?:app_id|shop_id|order_id|appShopId|appShopID|shopId|shopID|orderId|orderID|store_id|storeId|taskID|taskId|task_id)"\s*:\s*)(\d{16,})(?=\s*[,}\]])/g, '$1"$2"'));
}

// Alguns provedores e ferramentas Sandbox encapsulam o JSON em PARAM,
// payload ou body. A fila precisa interpretar o evento real, não o envelope.
export function unwrapFood99Webhook(value) {
  let current = value;
  for (let depth = 0; depth < 4; depth++) {
    if (typeof current === 'string') {
      try { current = parseFood99Json(current); } catch { return {}; }
    }
    if (!current || typeof current !== 'object' || Array.isArray(current)) return {};
    const wrapped = ['PARAM', 'param', 'payload', 'body'].find(key => current[key] != null);
    if (wrapped) {
      const inner = current[wrapped];
      try {
        const parsed = typeof inner === 'string' ? parseFood99Json(inner) : inner;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          current = parsed;
          continue;
        }
      } catch { /* payload principal permanece válido */ }
    }
    // Há callbacks com data ou message codificados como JSON string.
    for (const field of ['data', 'message']) {
      if (typeof current[field] === 'string' && /^\s*[\[{]/.test(current[field])) {
        try { current = { ...current, [field]: parseFood99Json(current[field]) }; } catch { /* manter original */ }
      }
    }
    return current;
  }
  return current && typeof current === 'object' ? current : {};
}

const asNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const money = (value) => Math.max(0, asNumber(value) / 100);
export function normalizeFood99Order(info, orderId) {
  const data = getOrderInfo(info) || info?.data?.data || info?.data || info;
  if (!data || typeof data !== 'object') throw new Error('99Food não retornou detalhes do pedido.');
  const id = getOrderId(info) || digits(orderId);
  if (!id || id !== digits(orderId)) throw new Error('99Food retornou um identificador diferente do pedido solicitado.');
  const sourceItems = data.order_items || data.orderItems || data.items;
  if (!Array.isArray(sourceItems) || sourceItems.length === 0) throw new Error('Pedido 99Food ainda não possui itens válidos.');
  const items = sourceItems.map(item => {
    const qty = Math.max(1, asNumber(item.amount ?? item.quantity ?? 1));
    const fullPrice = money(item.total_price ?? item.totalPrice ?? item.sku_price ?? item.skuPrice ?? 0);
    const unit = money(item.sku_price ?? item.skuPrice ?? item.price ?? 0);
    return {
      id: String(item.app_item_id || item.appItemId || item.item_id || ''),
      external_code: String(item.app_item_id || item.appItemId || ''),
      name: String(item.name || item.item_name || 'Item 99Food'),
      quantity: qty,
      price: unit || fullPrice / qty,
      total_price: fullPrice || unit * qty,
      notes: item.remark || item.note || null,
      options: [],
    };
  });
  const total = money(data.price?.order_price ?? data.price?.real_pay_price ?? data.order_price ?? data.real_pay_price ?? data.total_price ?? data.totalPrice ?? 0);
  const recipient = data.recipient || data.receiver || {};
  const addr = data.receive_address || data.receiveAddress || data.address || {};
  const parts = [addr.name || addr.street || addr.street_name, addr.house_number || addr.street_number, addr.poi_address || addr.detail, addr.city, addr.state].filter(Boolean);
  const pay = String(data.pay_type ?? data.payment_type ?? data.paymentType ?? '').toLowerCase();
  const paymentMethod = pay.includes('pix') ? 'pix' : pay.includes('card') || pay === '2' ? 'credit_card' : 'cash';
  const timestamp = asNumber(data.create_time ?? data.created_at ?? data.createdAt);
  const createdAt = timestamp > 1000000000 ? new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000).toISOString() : new Date().toISOString();
  return {
    id, shopId: getShopId(info), appShopId: getAppShopId(info),
    customer: String(recipient.name || recipient.first_name || 'Cliente 99Food'),
    phone: String(recipient.phone || recipient.calling_code || '').slice(0, 50),
    items, total: total || items.reduce((acc, item) => acc + item.total_price, 0),
    status: 'pending', delivery: true,
    address: parts.join(', ') || null,
    paymentMethod, createdAt,
    notes: [`99Food #${id}`, String(data.remark || '').trim()].filter(Boolean).join('\n'),
  };
}
