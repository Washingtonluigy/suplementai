// Normalização de dados 99Food. Não usa credenciais nem acesso ao banco.
// IDs numéricos da 99Food devem ser preservados como strings (int64).
export const digits = (value) => String(value ?? '').trim();
export const getOrderInfo = (payload) => payload?.data?.order_info || payload?.order_info || payload?.data?.orderInfo || payload?.orderInfo || payload?.data?.order || payload?.order || null;
export const getOrderId = (payload) => digits(getOrderInfo(payload)?.order_id || getOrderInfo(payload)?.orderId || payload?.data?.order_id || payload?.order_id || payload?.orderId);
export const getShopId = (payload) => digits(getOrderInfo(payload)?.shop_id || getOrderInfo(payload)?.shopId || payload?.data?.shop_id || payload?.shop_id || payload?.shopId);
export const getAppShopId = (payload) => digits(getOrderInfo(payload)?.app_shop_id || getOrderInfo(payload)?.appShopId || payload?.data?.app_shop_id || payload?.app_shop_id || payload?.appShopId);
export const getEventType = (payload) => String(payload?.type || payload?.event_type || payload?.eventType || payload?.event || '').trim();
export const isNewOrderEvent = (payload) => /^(ordernew|neworder|ordercreated|ordercreate)$/i.test(getEventType(payload).replace(/[^a-z0-9]/gi, ''));

export function parseFood99Json(raw) {
  // JSON.parse arredondaria IDs de 64 bits. Protege os campos de IDs antes de fazer parse.
  return JSON.parse(String(raw || '{}').replace(/("(?:app_id|shop_id|order_id|appShopId|shopId|orderId|taskID|taskId|task_id)"\s*:\s*)(\d{16,})(?=\s*[,}\]])/g, '$1"$2"'));
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
  const data = info?.order_info || info;
  if (!data || typeof data !== 'object') throw new Error('99Food não retornou detalhes do pedido.');
  const id = digits(data.order_id || data.orderId || orderId);
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
    id, shopId: digits(data.shop_id || data.shopId), appShopId: digits(data.app_shop_id || data.appShopId),
    customer: String(recipient.name || recipient.first_name || 'Cliente 99Food'),
    phone: String(recipient.phone || recipient.calling_code || '').slice(0, 50),
    items, total: total || items.reduce((acc, item) => acc + item.total_price, 0),
    status: 'pending', delivery: true,
    address: parts.join(', ') || null,
    paymentMethod, createdAt,
    notes: [`99Food #${id}`, String(data.remark || '').trim()].filter(Boolean).join('\n'),
  };
}
