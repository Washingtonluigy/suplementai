import { connectLambda, getStore } from '@netlify/blobs';
import { getSupabaseUser, SUPABASE_URL, SUPABASE_ANON_KEY } from './_supabase-public.mjs';

const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const json = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });
const isUUID = value => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
const db = async (auth, franchiseId, extra = '') => {
  const params = new URLSearchParams({ select: 'id,franchise_id,auth_user_id,name,email,phone,created_at', franchise_id: `eq.${franchiseId}`, order: 'created_at.asc', limit: '500' });
  if (extra) params.set('auth_user_id', `eq.${extra}`);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/franchise_users?${params}`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Não foi possível consultar a equipe (HTTP ${response.status}).`);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error('A consulta de equipe retornou dados inválidos.');
  return rows;
};
const markerProfile = phone => {
  try { const encoded = String(phone || '').split('|||SAIACL1:')[1]; return encoded ? JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) : null; }
  catch { return null; }
};
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (!['GET','POST'].includes(event.httpMethod)) return json(405, { error: 'Método não permitido.' });
  try {
    const auth = await getSupabaseUser(event);
    if (!auth) return json(401, { error: 'Sessão expirada. Faça login novamente.' });
    const body = event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : {};
    const franchiseId = event.httpMethod === 'POST' ? body.franchise_id : event.queryStringParameters?.franchise_id;
    if (!isUUID(franchiseId)) return json(400, { error: 'Unidade inválida.' });
    // Classically bundled Netlify Functions need the event to obtain Blob credentials.
    connectLambda(event);
    // O deploy precompilado recebe siteID/token de connectLambda, mas não
    // uncachedEdgeURL. Use consistência padrão/eventual, disponível nesse modo.
    const store = getStore('suplementaai-team-directory');
    const key = `franchise/${franchiseId}`;
    if (event.httpMethod === 'POST') {
      // Match the existing verified Master session model. Never accept a roster
      // sent by the browser: get authoritative records using the caller JWT/RLS.
      if (auth.user?.user_metadata?.role !== 'master') return json(403, { error: 'Somente o Master Geral atualiza a lista compartilhada.' });
      const rows = await db(auth, franchiseId);
      if (!rows.length) return json(404, { error: 'Nenhum colaborador localizado para esta unidade.' });
      const directory = { franchise_id: franchiseId, updated_at: new Date().toISOString(), users: rows };
      await store.setJSON(key, directory);
      return json(200, { success: true, count: rows.length, updated_at: directory.updated_at });
    }
    const linked = await db(auth, franchiseId, auth.user.id);
    if (!linked.length) return json(403, { error: 'Você não está vinculado a esta franquia.' });
    const directory = await store.get(key, { type: 'json' });
    if (!directory || !Array.isArray(directory.users)) return json(200, { success: true, synchronized: false, users: [] });
    // Listing personal information is restricted to the owner or other full managers.
    const member = linked[0];
    const isOwner = String(directory.users[0]?.id) === String(member.id);
    const full = markerProfile(member.phone)?.mode === 'full';
    if (!isOwner && !full) return json(403, { error: 'Seu usuário não possui acesso total à equipe.' });
    return json(200, { success: true, synchronized: true, updated_at: directory.updated_at, users: directory.users });
  } catch (error) {
    return json(503, { error: `Não foi possível sincronizar a equipe: ${error?.message || 'erro de armazenamento'}` });
  }
}
