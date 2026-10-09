import { SUPABASE_URL, getSupabaseUser } from './_supabase-public.mjs';

const json = (status, data) => ({ statusCode: status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body: JSON.stringify(data) });
const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const secureHeaders = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const url = (path, params = '') => `${SUPABASE_URL}/${path}${params}`;
const trimmed = value => String(value || '').trim();
async function request(method, path, body) {
  const response = await fetch(url(path), { method, headers: secureHeaders, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || data?.error || `Serviço de usuários: HTTP ${response.status}`);
  return data;
}
const rest = (table, query) => `rest/v1/${table}?${query}`;
const quote = value => encodeURIComponent(String(value || ''));
const parseProfile = phone => {
  try {
    const part = String(phone || '').split('|||SAIACL1:')[1];
    if (!part) return null;
    return JSON.parse(Buffer.from(part, 'base64').toString('utf8'));
  } catch { return null; }
};
const fullAccess = row => !parseProfile(row.phone) || parseProfile(row.phone)?.mode === 'full';

// Only the first established franchise account with full access can administer identities.
// Deliberately does not infer authority from client-provided phone/profile/role values.
export const handler = async event => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método não permitido.' });
  if (!key) return json(503, { error: 'Cadastro de usuários ainda não habilitado neste Netlify: configure SUPABASE_SERVICE_ROLE_KEY apenas nas variáveis de ambiente do Netlify (nunca no frontend). Nenhuma alteração realizada.' });
  const auth = await getSupabaseUser(event).catch(() => null);
  if (!auth) return json(401, { error: 'Sessão expirada; faça login novamente.' });
  try {
    const body = JSON.parse(event.body || '{}');
    const franchiseId = trimmed(body.franchise_id);
    const action = trimmed(body.action);
    if (!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(franchiseId)) return json(400, { error: 'Unidade inválida.' });
    const users = await request('GET', rest('franchise_users', `select=id,franchise_id,auth_user_id,phone,created_at&franchise_id=eq.${quote(franchiseId)}&order=created_at.asc`));
    if (!Array.isArray(users) || !users.length) return json(403, { error: 'Não há um proprietário cadastrado para essa unidade.' });
    const owner = users[0];
    const isOwner = String(owner.auth_user_id || '') === String(auth.user.id) && fullAccess(owner);
    if (!isOwner) return json(403, { error: 'Somente a conta proprietária principal da franquia pode administrar logins por este painel. Caso não seja essa conta, solicite ao Master corrigir o vínculo.' });
    if (!['create', 'update', 'delete', 'reset'].includes(action)) return json(400, { error: 'Operação inválida.' });
    if (action === 'create') {
      const email = trimmed(body.email).toLowerCase();
      const name = trimmed(body.name);
      const password = trimmed(body.password);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || name.length < 2 || password.length < 8) return json(400, { error: 'Informe nome, e-mail válido e senha com pelo menos 8 caracteres.' });
      const existing = await request('GET', rest('franchise_users', `select=id&email=eq.${quote(email)}&limit=1`));
      if (existing?.length) return json(409, { error: 'Este e-mail já está vinculado a um usuário.' });
      const created = await request('POST', 'auth/v1/admin/users', { email, password, email_confirm: true, user_metadata: { role: 'franchisee' } });
      const id = created?.id || created?.user?.id;
      if (!id) return json(502, { error: 'Cadastro não retornou o ID do usuário.' });
      try {
        await request('POST', 'rest/v1/franchise_users', { auth_user_id: id, franchise_id: franchiseId, name, email, phone: trimmed(body.phone) });
      } catch (e) {
        await request('DELETE', `auth/v1/admin/users/${quote(id)}`).catch(() => {});
        throw e;
      }
      return json(200, { success: true, message: 'Usuário criado e vinculado à unidade.' });
    }
    const member = users.find(u => String(u.id) === trimmed(body.user_id));
    if (!member) return json(404, { error: 'Este usuário não pertence à unidade.' });
    if ((action === 'delete' || action === 'reset') && member.id === owner.id) return json(403, { error: 'O proprietário principal não pode ser excluído ou ter a senha redefinida por esta tela.' });
    if (action === 'update') {
      if (member.id === owner.id) return json(403, { error: 'O acesso do proprietário principal é protegido.' });
      const name = trimmed(body.name);
      if (name.length < 2) return json(400, { error: 'Nome inválido.' });
      await request('PATCH', rest('franchise_users', `id=eq.${quote(member.id)}&franchise_id=eq.${quote(franchiseId)}`), { name, phone: trimmed(body.phone) });
      return json(200, { success: true });
    }
    if (!member.auth_user_id) return json(409, { error: 'Cadastro legado sem usuário de autenticação. Solicite a vinculação pelo Master.' });
    if (action === 'reset') {
      const values = new Uint32Array(14);
      crypto.getRandomValues(values);
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
      const password = Array.from(values, n => alphabet[n % alphabet.length]).join('');
      await request('PUT', `auth/v1/admin/users/${quote(member.auth_user_id)}`, { password });
      // Never keep an obsolete plaintext password in the legacy franchise_users field.
      await request('PATCH', rest('franchise_users', `id=eq.${quote(member.id)}&franchise_id=eq.${quote(franchiseId)}`), { password_plain: null });
      return json(200, { success: true, password });
    }
    if (action === 'delete') {
      await request('DELETE', `auth/v1/admin/users/${quote(member.auth_user_id)}`);
      await request('DELETE', rest('franchise_users', `id=eq.${quote(member.id)}&franchise_id=eq.${quote(franchiseId)}`));
      return json(200, { success: true });
    }
    return json(400, { error: 'Operação inválida.' });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : 'Erro interno ao administrar equipe.' });
  }
};
