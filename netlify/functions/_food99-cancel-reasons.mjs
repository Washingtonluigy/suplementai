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

// Fonte: documentação 99Food > Comida > API de pedidos > Cancelar pedido
// POST /v1/order/order/cancel, tabela "lista Reason_id".
// Estes IDs são publicados pela 99Food e NÃO devem ser substituídos por IDs do iFood.
export const FOOD99_OFFICIAL_CANCELLATION_REASONS = Object.freeze([
  { id: '1010', description: 'Item esgotado', applicableTo: 'all' },
  { id: '1020', description: 'Loja fechada durante o dia', applicableTo: 'all' },
  { id: '1030', description: 'Loja muito ocupada para preparar o pedido', applicableTo: 'all' },
  { id: '1040', description: 'Acidente grave ou interrupção de serviço público', applicableTo: 'all' },
  { id: '1050', description: 'Cancelado devido a problema do cliente', applicableTo: 'all' },
  { id: '1060', description: 'Não há correio disponível', applicableTo: 'self_delivery' },
  { id: '1070', description: 'O menu precisa ser atualizado', applicableTo: 'all' },
  { id: '1071', description: 'O pedido está fora da área de entrega', applicableTo: 'self_delivery' },
  { id: '1072', description: 'O endereço do pedido está em uma área insegura', applicableTo: 'self_delivery' },
  { id: '1073', description: 'Suspeita de fraude ou brincadeira', applicableTo: 'all' },
  { id: '1074', description: 'Dúvidas sobre taxas ou promoções', applicableTo: 'all' },
  { id: '1080', description: 'Outra razão', applicableTo: 'all' },
].map(item => Object.freeze(item)));

export function getFood99OfficialCancellationReasons() {
  return FOOD99_OFFICIAL_CANCELLATION_REASONS.map(item => ({ ...item }));
}
