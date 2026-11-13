// Normaliza APENAS listas de motivos acompanhados de IDs retornadas pela 99Food.
// Não utilizar os códigos do iFood, nem associar IDs hipotéticos a descrições.
const LIST_KEYS = [
  'cancel_reason_list', 'cancel_reasons', 'cancellation_reasons',
  'cancelReasonList', 'cancelReasons', 'cancellationReasons',
  'reason_list', 'reasonList', 'available_cancel_reasons',
  'availableCancelReasons',
];
const INNER_KEYS = ['data', 'order_info', 'orderInfo', 'result', 'order', 'order_detail', 'orderDetail'];

export function normalizeFood99CancellationReasons(value) {
  const found = [];
  const seen = new Set();
  const root = Array.isArray(value) ? { reasons: value } : value;
  const queue = [{ node: root, depth: 0 }];
  const visited = new Set();
  while (queue.length) {
    const { node, depth } = queue.shift();
    if (!node || typeof node !== 'object' || visited.has(node) || depth > 5) continue;
    visited.add(node);
    if (Array.isArray(node)) continue;
    for (const name of LIST_KEYS) {
      const candidate = node[name];
      const entries = Array.isArray(candidate) ? candidate
        : Array.isArray(candidate?.list) ? candidate.list
        : Array.isArray(candidate?.items) ? candidate.items
        : [];
      for (const item of entries) {
        if (!item || typeof item !== 'object') continue;
        const id = String(item.reason_id ?? item.reasonId ?? item.cancel_reason_id ?? item.cancelReasonId ?? item.id ?? '').trim();
        const description = String(item.reason_name ?? item.reasonName ?? item.reason_desc ?? item.reasonDesc ?? item.description ?? item.name ?? item.title ?? item.reason ?? '').trim();
        if (!/^\d{1,12}$/.test(id) || !description || seen.has(id)) continue;
        found.push({ id, description: description.slice(0, 160) });
        seen.add(id);
      }
    }
    if (Array.isArray(node.data)) queue.push({ node: { reasons: node.data }, depth: depth + 1 });
    for (const name of INNER_KEYS) {
      if (node[name] && typeof node[name] === 'object') queue.push({ node: node[name], depth: depth + 1 });
    }
  }
  return found;
}
