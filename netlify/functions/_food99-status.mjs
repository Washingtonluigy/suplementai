// Regras de transição do Suplementaai para pedidos 99Food.
// Não altera as regras de iFood, catálogo ou PDV.
export const FOOD99_ACTION_ENDPOINTS = Object.freeze({
  confirm: '/v1/order/order/confirm',
  ready: '/v1/order/order/ready',
  // Não há chamada de despacho separada validada para este fluxo.
  // O status 'Em entrega' do Suplementaai é uma etapa operacional interna.
  delivered: '/v1/order/order/delivered',
  cancel: '/v1/order/order/cancel',
});

const ALLOWED = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'ready', 'pickup', 'cancelled'],
  preparing: ['ready', 'pickup', 'cancelled'],
  ready: ['delivering', 'delivered', 'cancelled'],
  pickup: ['delivered', 'cancelled'],
  delivering: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export function planFood99StatusChange(previous, target, { delivery = true } = {}) {
  const from = String(previous || '');
  const to = String(target || '');
  if (!Object.hasOwn(ALLOWED, from)) return { ok: false, message: 'Status atual da 99Food não reconhecido. Atualize a tela.' };
  if (from === to) return { ok: false, message: 'O pedido já está neste status.' };
  if (!ALLOWED[from].includes(to)) return { ok: false, message: `Alteração de ${from} para ${to} não permitida. Siga a sequência do pedido.` };
  if (!delivery && to === 'delivering') return { ok: false, message: 'Pedido para retirada não pode ser enviado para entrega.' };
  if (delivery && to === 'pickup') return { ok: false, message: 'Pedido de entrega não pode usar o status Pode retirar.' };
  const remote = {
    accepted: 'confirm',
    preparing: null, // Etapa apenas interna; 99Food não disponibiliza API separada de preparo.
    ready: 'ready',
    pickup: 'ready',
    delivering: null, // Etapa interna após Pronto; evita POST /dispatch (404 na conta Sandbox).
    delivered: 'delivered',
    cancelled: 'cancel',
  }[to];
  return { ok: true, from, to, remote, localOnly: remote === null };
}

export function parseFood99StatusReply(httpStatus, result) {
  const code = result?.errno ?? result?.code;
  const message = String(result?.errmsg || result?.message || '').slice(0, 250);
  // HTTP 200 não equivale a sucesso se errno da 99Food for diferente de zero.
  if (httpStatus < 200 || httpStatus >= 300) return { ok: false, message: message || `99Food HTTP ${httpStatus}` };
  if (code === undefined || code === null || code === '') return { ok: false, message: '99Food respondeu sem código de confirmação. Nenhum status local foi alterado.' };
  if (Number(code) !== 0) return { ok: false, message: message || `A 99Food recusou a alteração (errno ${code}).` };
  return { ok: true };
}
