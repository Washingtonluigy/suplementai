import { connectLambda, getStore } from '@netlify/blobs';
import { getSupabaseUser, SUPABASE_URL, SUPABASE_ANON_KEY } from './_supabase-public.mjs';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Cache-Control': 'no-store, max-age=0',
  'Content-Type': 'application/json; charset=utf-8',
};
const json = (statusCode, body) => ({ statusCode, headers: cors, body: JSON.stringify(body) });
const uuid = value => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
const hhmm = value => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(value || ''));
const timezone = 'America/Cuiaba'; // Unidades atuais em MT. Não usa fuso do dispositivo do consumidor.
const defaults = () => ({ enabled: false, manually_closed: false, opening: '08:00', closing: '18:00', days: [0, 1, 2, 3, 4, 5, 6], timezone });
const timeToMinutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
export function evaluateHours(schedule, now = new Date()) {
  const s = { ...defaults(), ...(schedule || {}) };
  if (s.manually_closed) return { is_open: false, reason: 'manual' };
  if (!s.enabled) return { is_open: true, reason: 'unscheduled' };
  const pieces = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
  const part = kind => pieces.find(p => p.type === kind)?.value || '';
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(part('weekday'));
  const minutes = (Number(part('hour')) % 24) * 60 + Number(part('minute'));
  const open = timeToMinutes(s.opening); const close = timeToMinutes(s.closing);
  const days = s.days || [];
  const isOpen = open < close
    ? days.includes(weekday) && minutes >= open && minutes < close
    : (days.includes(weekday) && minutes >= open) || (days.includes((weekday + 6) % 7) && minutes < close);
  return { is_open: Boolean(isOpen), reason: isOpen ? 'within_hours' : 'outside_hours' };
}
function validate(value) {
  const src = value || {};
  if (!hhmm(src.opening) || !hhmm(src.closing) || src.opening === src.closing) throw new Error('Informe horários diferentes e válidos (HH:MM).');
  if (!Array.isArray(src.days) || src.days.some(d => !Number.isInteger(d) || d < 0 || d > 6) || new Set(src.days).size !== src.days.length) throw new Error('Selecione dias de atendimento válidos.');
  if (!src.days.length) throw new Error('Selecione ao menos um dia; para fechar todos, use Fechar cardápio.');
  return { ...defaults(), enabled: src.enabled === true, manually_closed: src.manually_closed === true, opening: src.opening, closing: src.closing, days: src.days.slice().sort((a,b)=>a-b), timezone, updated_at: new Date().toISOString() };
}
async function authorizeUnitManager(event, franchiseId) {
  const auth = await getSupabaseUser(event);
  if (!auth) return false;
  const params = new URLSearchParams({ select: 'id,auth_user_id,phone,created_at', franchise_id: `eq.${franchiseId}`, order: 'created_at.asc', limit: '500' });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/franchise_users?${params.toString()}`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, Accept: 'application/json' } });
  if (!res.ok) return false;
  const rows = await res.json().catch(() => []);
  if (!Array.isArray(rows) || !rows.length) return false;
  const user = rows.find(row => row.auth_user_id === auth.user.id);
  if (!user) return false;
  const marker = String(user.phone || '').split('|||SAIACL1:')[1];
  if (!marker) return rows[0].id === user.id; // proprietário legado, conforme a regra do painel.
  try {
    const profile = JSON.parse(Buffer.from(marker, 'base64').toString('utf8'));
    return profile?.mode === 'full';
  } catch { return false; }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (!['GET', 'POST'].includes(event.httpMethod)) return json(405, { error: 'Método não permitido.' });
  try {
    // Lambda compatibility mode: Netlify does not inject the Blobs environment
    // automatically into classic exports.handler functions.
    connectLambda(event);
    const body = event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : {};
    const id = event.httpMethod === 'GET' ? (event.queryStringParameters?.franchise_id || new URLSearchParams(event.rawQuery || event.rawQueryString || '').get('franchise_id')) : body.franchise_id;
    if (!uuid(id)) return json(400, { error: 'Unidade inválida.' });
    const store = getStore({ name: 'suplementaai-catalog-hours', consistency: 'strong' });
    const key = `franchise/${id}`;
    if (event.httpMethod === 'POST') {
      if (!(await authorizeUnitManager(event, id))) return json(403, { error: 'Somente a gestão da unidade pode alterar o horário do catálogo.' });
      let schedule;
      try { schedule = validate(body.schedule); } catch (error) { return json(400, { error: error.message }); }
      await store.setJSON(key, schedule);
      return json(200, { success: true, schedule, ...evaluateHours(schedule), server_time: new Date().toISOString() });
    }
    const schedule = (await store.get(key, { type: 'json', consistency: 'strong' })) || defaults();
    return json(200, { success: true, schedule, ...evaluateHours(schedule), server_time: new Date().toISOString() });
  } catch (error) {
    return json(500, { error: error?.message || 'Erro ao acessar o horário do catálogo.' });
  }
}
