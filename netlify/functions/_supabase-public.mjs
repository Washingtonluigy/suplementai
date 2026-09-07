export const SUPABASE_URL = String(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sgvojdgbjvynnoherpqj.supabase.co').replace(/\/$/, '');
export const SUPABASE_ANON_KEY = String(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndm9qZGdianZ5bm5vaGVycHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDE4ODIsImV4cCI6MjEwMTMxNzg4Mn0.RuAHGD0VCcDxIL4jfSFXjyiC4ZzVgRAZna3j80ovIf4');

export async function getSupabaseUser(event) {
  const auth = String(event.headers?.authorization || event.headers?.Authorization || '');
  const token = auth.match(/^Bearer\s+(.+)$/i)?.[1] || '';
  if (!token) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
  if (!response.ok) return null;
  const user = await response.json().catch(() => null);
  return user?.id ? { user, token } : null;
}

export async function authorizeAnalytics(event, franchiseId) {
  const auth = await getSupabaseUser(event);
  if (!auth) return { ok: false, status: 401, error: 'Sessão obrigatória.' };
  if (auth.user?.user_metadata?.role === 'master') return { ok: true, master: true };
  const response = await fetch(`${SUPABASE_URL}/rest/v1/franchise_users?select=franchise_id&auth_user_id=eq.${encodeURIComponent(auth.user.id)}&limit=1`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, Accept: 'application/json' } });
  const rows = await response.json().catch(() => []);
  const ownId = Array.isArray(rows) ? rows[0]?.franchise_id : null;
  if (!ownId || String(ownId) !== String(franchiseId)) return { ok: false, status: 403, error: 'Sem permissão para estas métricas.' };
  return { ok: true, master: false };
}
