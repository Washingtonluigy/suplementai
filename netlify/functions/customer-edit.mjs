// Edição de cliente V52.31. Autoriza sempre no servidor usando o usuário autenticado;
// não depende de um flag informado pelo navegador, nem altera as políticas do Supabase.
import { SUPABASE_URL, getSupabaseUser } from './_supabase-public.mjs';

const json = (status, data) => ({ statusCode: status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body: JSON.stringify(data) });
const UUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const ROLE = () => String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const PROFILE_MARKER = '|||SAIACL1:';
const ALLOWED = new Set(['name','phone','email','cpf_cnpj','address','neighborhood','city','state','customer_type','ie','company_name','partner_name','partner_cpf']);
const trustedMaster = user => user?.app_metadata?.role === 'master' || (Array.isArray(user?.app_metadata?.roles) && user.app_metadata.roles.includes('master'));
const parseProfile = phone => {
  if (!String(phone || '').includes(PROFILE_MARKER)) return null;
  try {
    const part = String(phone).split(PROFILE_MARKER)[1];
    const profile = JSON.parse(Buffer.from(part, 'base64').toString('utf8'));
    if (profile?.mode === 'full' || (profile?.mode === 'limited' && Array.isArray(profile.permissions))) return profile;
    return { mode: 'limited', permissions: [] };
  } catch { return { mode: 'limited', permissions: [] }; }
};
const serviceHeaders = key => ({ apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json', 'Content-Type': 'application/json' });
async function serviceRequest(key, path, method='GET', payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { method, headers: { ...serviceHeaders(key), ...(method === 'PATCH' ? { Prefer: 'return=representation' } : {}) }, ...(payload === undefined ? {} : { body: JSON.stringify(payload) }), signal: AbortSignal.timeout(18000) });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw Object.assign(new Error(data?.message || data?.error || `Falha ao salvar (HTTP ${response.status}).`), { status: response.status });
  return data;
}
export const handler = async event => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método não permitido.' });
  const auth = await getSupabaseUser(event).catch(() => null);
  if (!auth) return json(401, { error: 'Sessão expirada. Faça login novamente.' });
  const key = ROLE();
  if (!key) return json(503, { error: 'Serviço de edição protegido não habilitado no servidor. A edição direta depende das permissões atuais do banco.' });
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Dados inválidos.' }); }
  const franchiseId = String(body.franchise_id || '');
  const customerId = String(body.customer_id || '');
  if (!UUID.test(franchiseId) || !UUID.test(customerId)) return json(400, { error: 'Cadastro ou franquia inválidos.' });
  try {
    if (!trustedMaster(auth.user)) {
      const members = await serviceRequest(key, `franchise_users?select=id,phone,auth_user_id&franchise_id=eq.${franchiseId}&order=created_at.asc`);
      if (!Array.isArray(members) || !members.length) return json(403, { error: 'Franquia sem proprietário cadastrado.' });
      const member = members.find(row => String(row.auth_user_id || '') === String(auth.user.id));
      if (!member) return json(403, { error: 'Sem vínculo com esta franquia.' });
      const owner = members[0]?.id === member.id;
      const profile = parseProfile(member.phone);
      const allowed = profile ? (profile.mode === 'full' || profile.permissions?.includes('edit-records')) : owner;
      if (!allowed) return json(403, { error: 'Acesso de edição desativado para seu usuário.' });
    }
    const current = await serviceRequest(key, `customers?select=id&franchise_id=eq.${franchiseId}&id=eq.${customerId}&limit=1`);
    if (!Array.isArray(current) || !current.length) return json(404, { error: 'Cliente não encontrado nesta unidade.' });
    const input = body.changes;
    if (!input || typeof input !== 'object' || Array.isArray(input)) return json(400, { error: 'Campos inválidos.' });
    const patch = {};
    for (const [field, value] of Object.entries(input)) {
      if (!ALLOWED.has(field)) return json(400, { error: `Campo não permitido: ${field}.` });
      if (value !== null && typeof value !== 'string') return json(400, { error: `Valor inválido: ${field}.` });
      if (value !== null && value.length > 250) return json(400, { error: `Campo muito longo: ${field}.` });
      patch[field] = value === null ? null : value.trim();
    }
    if (!Object.keys(patch).length) return json(400, { error: 'Nenhum dado para atualizar.' });
    if ('name' in patch && !patch.name) return json(400, { error: 'Nome do cliente obrigatório.' });
    if ('customer_type' in patch && !['pf','pj'].includes(patch.customer_type)) return json(400, { error: 'Tipo de cadastro inválido.' });
    const result = await serviceRequest(key, `customers?franchise_id=eq.${franchiseId}&id=eq.${customerId}&select=id`, 'PATCH', patch);
    if (!Array.isArray(result) || !result.length) return json(409, { error: 'O cliente não foi atualizado.' });
    return json(200, { success: true, id: customerId });
  } catch(error) {
    return json(error?.status >= 400 && error.status < 500 ? error.status : 500, { error: error?.message || 'Não foi possível atualizar o cliente.' });
  }
};
