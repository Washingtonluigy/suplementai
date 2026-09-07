import { getStore } from '@netlify/blobs';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Content-Type': 'application/json' };
const json = (statusCode, body) => ({ statusCode, headers: cors, body: JSON.stringify(body) });
const validToken = value => /^[A-Za-z0-9_-]{24,120}$/.test(String(value || ''));

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método não permitido.' });
  try {
    const body = JSON.parse(event.body || '{}');
    const token = String(body.token || '');
    if (!validToken(token)) return json(400, { error: 'Token de acompanhamento inválido.' });
    const store = getStore({ name: 'suplementaai-order-tracking', consistency: 'strong' });
    const key = `orders/${token}`;
    if (body.action === 'put') {
      const snapshot = body.snapshot;
      if (!snapshot?.id || !snapshot?.phone_hash) return json(400, { error: 'Dados do pedido incompletos.' });
      const safe = { ...snapshot, updated_at: new Date().toISOString() };
      await store.setJSON(key, safe);
      return json(200, { success: true });
    }
    if (body.action === 'get') {
      const snapshot = await store.get(key, { type: 'json', consistency: 'strong' });
      return snapshot ? json(200, { success: true, snapshot }) : json(404, { error: 'Acompanhamento ainda não sincronizado.' });
    }
    return json(400, { error: 'Ação desconhecida.' });
  } catch (error) { return json(500, { error: error?.message || 'Erro no acompanhamento.' }); }
}
