// SuplementaAI Focus NFe V52.26 - NF-e/NFC-e e documentos recebidos.
// Recebe apenas ações explicitamente permitidas; nunca serve tokens ao navegador.
import { getSupabaseUser, SUPABASE_URL, SUPABASE_ANON_KEY } from './_supabase-public.mjs';
import { FOCUS_TOKENS_EMBEDDED } from './_focus-credentials.mjs';

const EMITTER_CNPJ = '45325262000164';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DIGITS = v => String(v ?? '').replace(/\D/g, '');
const safe = (v, max = 250) => String(v ?? '').trim().slice(0,max);
const json = (status, data) => ({ statusCode: status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, body: JSON.stringify(data) });
const raised = (status, message) => Object.assign(new Error(message), { status });
const apiOrigin = env => env === 'homologacao' ? 'https://homologacao.focusnfe.com.br' : 'https://api.focusnfe.com.br';
const tokenFor = env => (env === 'homologacao' ? process.env.FOCUS_TOKEN_HOMOLOGACAO : process.env.FOCUS_TOKEN_PRODUCAO) || FOCUS_TOKENS_EMBEDDED[env];

async function authorize(event, franchiseId, action) {
  if (!UUID.test(franchiseId)) throw raised(400, 'Unidade inválida.');
  const auth = await getSupabaseUser(event);
  if (!auth) throw raised(401, 'Sessão expirada. Entre novamente no SuplementaAI.');
  // A autorização não depende de chave administrativa do Supabase nem altera políticas.
  const headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, Accept:'application/json' };
  const userUrl = `${SUPABASE_URL}/rest/v1/franchise_users?select=id,phone&franchise_id=eq.${franchiseId}&auth_user_id=eq.${auth.user.id}&limit=1`;
  const membership = await fetch(userUrl, { headers, signal: AbortSignal.timeout(12000) });
  const members = membership.ok ? await membership.json().catch(() => []) : [];
  // Não confiar em user_metadata.role=master, que pode ser alterado pelo cliente.
  // Somente usuários autenticados vinculados à franquia podem operar a Focus.
  if (!Array.isArray(members) || !members.length) throw raised(403, 'Usuário não pertence à unidade fiscal.');
  const phone=String(members[0]?.phone||'');
  const marker='|||SAIACL1:';
  let profile=null;
  if (phone.includes(marker)) {
    try { profile=JSON.parse(Buffer.from(phone.split(marker)[1]||'', 'base64').toString('utf8')); } catch { throw raised(403, 'Perfil de acesso fiscal inválido.'); }
  }
  if (profile?.mode==='limited' && !(Array.isArray(profile.permissions)&&profile.permissions.includes('fiscal'))) throw raised(403,'Usuário sem acesso à área fiscal.');
  if (['issue','cancel','received_manifest'].includes(action) && profile?.mode==='limited') throw raised(403,'Emissão, cancelamento e manifestação fiscal exigem acesso total da franquia.');
  const settings = await fetch(`${SUPABASE_URL}/rest/v1/fiscal_settings?select=cnpj&franchise_id=eq.${franchiseId}&limit=1`, { headers, signal: AbortSignal.timeout(12000) });
  const rows = settings.ok ? await settings.json().catch(() => []) : [];
  if (!Array.isArray(rows) || DIGITS(rows[0]?.cnpj) !== EMITTER_CNPJ) throw raised(403, 'Cadastre e salve o CNPJ fiscal da Suplementa Aí nesta unidade antes de utilizar a Focus.');
  return auth;
}
async function focus(path, environment, { method='GET', body, accept='application/json', binary=false } = {}) {
  const token = tokenFor(environment);
  if (!token) throw raised(503, `Credencial Focus ${environment} indisponível.`);
  if (!/^\/(?:v2|arquivos|arquivos_development)\/[a-z0-9_./?=&-]+$/i.test(path)) throw raised(400, 'Rota Focus inválida.');
  const response = await fetch(`${apiOrigin(environment)}${path}`, {
    method, headers: { Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}`, Accept: accept, ...(body ? {'Content-Type':'application/json'} : {}) },
    ...(body ? {body:JSON.stringify(body)} : {}), signal:AbortSignal.timeout(28000), redirect:'follow'
  });
  if (binary && response.ok) {
    const data = Buffer.from(await response.arrayBuffer());
    if (data.length > 4 * 1024 * 1024) throw raised(413, 'Documento maior que 4 MB.');
    return { binary: true, contents: data.toString('base64'), contentType: response.headers.get('content-type') || 'application/octet-stream' };
  }
  const text = await response.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = null; }
  if (!response.ok) {
    const detail = typeof parsed?.mensagem === 'string' ? parsed.mensagem :
      typeof parsed?.mensagem_sefaz === 'string' ? parsed.mensagem_sefaz :
      typeof parsed?.message === 'string' ? parsed.message :
      Array.isArray(parsed?.erros) ? parsed.erros.map(e => safe(e?.mensagem || e?.message, 100)).join('; ') :
      `HTTP ${response.status}`;
    throw raised(response.status === 401 || response.status === 403 ? 502 : response.status, `Focus (${response.status}): ${safe(detail, 500)}`);
  }
  return parsed ?? { message:'Resposta inesperada da Focus', status:response.status };
}
function checkDocumentKey(value) {
  const key = DIGITS(value);
  if (key.length !== 44) throw raised(400, 'Informe uma chave NF-e de 44 dígitos.');
  return key;
}
function checkReference(value) {
  const ref = safe(value, 80);
  if (!/^[a-zA-Z0-9_-]{4,80}$/.test(ref)) throw raised(400, 'Referência de nota inválida.');
  return ref;
}
function validateInvoice(data) {
  if (![55,65].includes(Number(data?.modelo))) throw raised(400, 'Modelo NF-e/NFC-e inválido.');
  if (!Array.isArray(data?.items) || !data.items.length || data.items.length > 60) throw raised(400, 'Informe de 1 a 60 produtos.');
  if (DIGITS(data.cnpj_emitente) !== EMITTER_CNPJ) throw raised(403, 'Este token só deve emitir notas da Suplementa Aí.');
  const total = Number(data.valor_total);
  if (!Number.isFinite(total) || total <= 0 || total > 1e7) throw raised(400, 'Total inválido.');
  let sum = 0;
  for (const [i, item] of data.items.entries()) {
    if (!safe(item.descricao,120) || DIGITS(item.codigo_ncm).length !== 8 || DIGITS(item.cfop).length !== 4 ||
        !/^(00|10|20|30|40|41|50|51|60|70|90|101|102|103|201|202|203|300|400|500|900)$/.test(String(item.icms_situacao_tributaria || '')) ||
        !/^[0-8]$/.test(String(item.icms_origem || '')) ||
        !/^[0-9]{2}$/.test(String(item.pis_situacao_tributaria || '')) || !/^[0-9]{2}$/.test(String(item.cofins_situacao_tributaria || '')) ||
        !Number.isFinite(Number(item.quantidade_comercial)) || Number(item.quantidade_comercial) <= 0 ||
        !Number.isFinite(Number(item.valor_unitario_comercial)) || Number(item.valor_unitario_comercial) <= 0) {
      throw raised(400, `Produto ${i+1}: confira descrição, NCM, CFOP, ICMS/CSOSN, origem, PIS, COFINS e valores.`);
    }
    sum += Number(item.valor_bruto);
  }
  if (Math.abs(sum - total) > 0.02) throw raised(400, 'Soma dos itens não coincide com o total. Confira descontos e frete.');
  if (Number(data.modelo) === 55 && !(DIGITS(data.cpf_destinatario).length === 11 || DIGITS(data.cnpj_destinatario).length === 14)) {
    throw raised(400, 'NF-e exige CPF ou CNPJ do destinatário.');
  }
  return total;
}
function statusValue(status) {
  if (['autorizado','autorizada'].includes(status)) return 'authorized';
  if (['cancelado','cancelada'].includes(status)) return 'cancelled';
  if (['erro_autorizacao','denegado','rejeitado'].includes(status)) return 'rejected';
  return 'processing';
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Use POST.' });
  let request;
  try { request = JSON.parse(event.body || '{}'); } catch { return json(400, { error:'JSON inválido.' }); }
  try {
    const id = safe(request.franchiseId);
    const action = safe(request.action, 30);
    await authorize(event, id, action);
    if (action === 'health') {
      // Não envia nada para a SEFAZ. Consulta metadados do serviço de notas recebidas.
      const data = await focus(`/v2/nfes_recebidas?cnpj=${EMITTER_CNPJ}&versao=0`, 'producao');
      return json(200, { success:true, configured:true, environment:'producao', receivedCount: Array.isArray(data) ? data.length : 0, emissionTestEnvironment:'homologacao' });
    }
    if (action === 'received_list') {
      const version = Math.max(0, Math.floor(Number(request.versao) || 0));
      const data = await focus(`/v2/nfes_recebidas?cnpj=${EMITTER_CNPJ}&versao=${version}`, 'producao');
      return json(200, { success:true, notes:Array.isArray(data) ? data : [] });
    }
    if (['received_lookup','received_xml','received_pdf'].includes(action)) {
      const key = checkDocumentKey(request.chave);
      const suffix = action === 'received_xml' ? '.xml' : action === 'received_pdf' ? '.pdf' : '';
      const data = await focus(`/v2/nfes_recebidas/${key}${suffix}${suffix ? '' : '?completa=1&cnpj='+EMITTER_CNPJ}`, 'producao', suffix ? { binary:true, accept: suffix === '.pdf' ? 'application/pdf' : 'application/xml' } : {});
      if (data.binary) return json(200, { success:true, ...data });
      if (data.cnpj_destinatario && DIGITS(data.cnpj_destinatario) !== EMITTER_CNPJ) throw raised(403,'Nota pertence a outro destinatário.');
      return json(200, { success:true, note:data });
    }
    if (action === 'received_manifest') {
      const key = checkDocumentKey(request.chave);
      const type = String(request.tipo || '');
      if (!['ciencia','confirmacao','desconhecimento','nao_realizada'].includes(type)) throw raised(400,'Manifestação inválida.');
      if (request.confirmar !== 'CONFIRMAR MANIFESTACAO') throw raised(400,'Confirme explicitamente o registro da manifestação na SEFAZ.');
      const data = await focus(`/v2/nfes_recebidas/${key}/manifesto`, 'producao', { method:'POST', body:{ tipo:type, ...(type==='nao_realizada'?{justificativa:safe(request.justificativa,255)}:{}) } });
      return json(200, { success:true, manifest:data });
    }
    if (['issue','status','cancel','document'].includes(action)) {
      const environment = request.environment === 'producao' ? 'producao' : 'homologacao';
      const model = String(request.modelo) === '65' ? 'nfce' : 'nfe';
      const ref = checkReference(request.ref);
      if (action === 'issue') {
        if (environment === 'producao' && request.productionConfirmation !== 'EMITIR NOTA REAL') throw raised(403, 'Digite EMITIR NOTA REAL para autorizar a transmissão com validade fiscal.');
        const invoice = request.invoice || {};
        if (Number(invoice.modelo) !== (model === 'nfe' ? 55 : 65)) throw raised(400,'Modelo inconsistente.');
        validateInvoice(invoice);
        const { modelo, ...payload } = invoice;
        const data = await focus(`/v2/${model}?ref=${encodeURIComponent(ref)}`, environment, {method:'POST',body:payload});
        return json(200,{success:true,result:data,environment,model,ref,normalizedStatus:statusValue(data.status)});
      }
      if (action === 'status') {
        const data = await focus(`/v2/${model}/${ref}?completa=1`,environment);
        return json(200,{success:true,result:data,normalizedStatus:statusValue(data.status),environment});
      }
      if (action === 'cancel') {
        const reason = safe(request.justificativa,255);
        if (reason.length < 15) throw raised(400,'Justificativa mínima de 15 caracteres.');
        if (environment === 'producao' && request.productionConfirmation !== 'CANCELAR NOTA REAL') throw raised(403,'Confirme o cancelamento definitivo em produção.');
        const data = await focus(`/v2/${model}/${ref}`,environment,{method:'DELETE',body:{justificativa:reason}});
        return json(200,{success:true,result:data,normalizedStatus:statusValue(data.status)});
      }
      const kind = request.kind === 'xml' ? 'xml' : 'pdf';
      const result = await focus(`/v2/${model}/${ref}?completa=1`,environment);
      const filePath = kind === 'xml' ? result.caminho_xml_nota_fiscal : result.caminho_danfe;
      if (!filePath || !/^\/(?!\/)[\w./-]+$/.test(filePath)) throw raised(404,'Arquivo ainda não está disponível na Focus para esta nota.');
      // Focus retorna links de documentos publicados. Para evitar request para hosts externos não confiáveis,
      // somente rotas relativas de arquivo em nosso domínio Focus autorizado.
      const binary = await focus(filePath, environment, {binary:true,accept: kind==='xml'?'application/xml':'application/pdf'});
      return json(200,{success:true,...binary,kind});
    }
    throw raised(400,'Ação fiscal desconhecida.');
  } catch (error) {
    return json(Number(error?.status) >= 400 && Number(error?.status) <= 599 ? Number(error.status) : 502, { error: safe(error?.message || 'Falha na Focus NFe.',700) });
  }
}
