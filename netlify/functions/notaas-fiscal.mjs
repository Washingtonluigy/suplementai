// SuplementaAI — integração fiscal server-side Notaas (NF-e 55 / NFC-e 65).
// Não contém credenciais, certificado ou regra fiscal presumida.
import { randomUUID } from 'node:crypto';
import { SUPABASE_URL, SUPABASE_ANON_KEY, getSupabaseUser } from './_supabase-public.mjs';

const API = 'https://platform.notaas.com.br/api/v1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const json = (status, data) => ({ statusCode: status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body: JSON.stringify(data) });
const digits = value => String(value || '').replace(/\D/g, '');
const field = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const truthy = value => /^(true|1|yes)$/i.test(String(value || ''));
const amount = value => Number.isFinite(Number(value)) ? Math.round(Number(value) * 100) / 100 : NaN;
const num = value => Number(value);
const providerStatus = status => ({ issued: 'authorized', cancelled: 'cancelled', error: 'rejected', inutilized: 'rejected', queued: 'processing', processing: 'processing' })[String(status || '')] || 'processing';
const supaHeaders = auth => ({ apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', Accept: 'application/json' });
const restUrl = (table, query = '') => `${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`;
async function db(auth, table, method = 'GET', query = '', body) {
  const headers = supaHeaders(auth);
  if (method === 'POST' || method === 'PATCH') headers.Prefer = 'return=representation';
  const response = await fetch(restUrl(table, query), { method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw Object.assign(new Error('Falha ao registrar ou consultar dados fiscais. Confira as permissões da unidade.'), { code: 502 });
  return payload;
}
async function requireOwner(event, franchiseId) {
  const auth = await getSupabaseUser(event);
  if (!auth) throw Object.assign(new Error('Faça login novamente para acessar o fiscal.'), { code: 401 });
  const serviceKey = field(process.env.SUPABASE_SERVICE_ROLE_KEY || '', 300);
  if (!serviceKey) throw Object.assign(new Error('Configure SUPABASE_SERVICE_ROLE_KEY somente no servidor Netlify para verificar a conta proprietária. Não é necessário alterar tabelas.'), { code: 503 });
  // A policy atual da franchise_users permite ao colaborador enxergar apenas a PRÓPRIA linha.
  // Usar o JWT do colaborador para descobrir o primeiro registro seria uma falha de autorização.
  // Consultar com credencial PRIVADA do servidor e comparar com a identidade autenticada.
  const response = await fetch(restUrl('franchise_users', `select=auth_user_id&franchise_id=eq.${franchiseId}&order=created_at.asc&limit=1`), {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw Object.assign(new Error('Falha ao confirmar proprietário da franquia.'), { code: 502 });
  const rows = await response.json().catch(() => []);
  if (!Array.isArray(rows) || String(rows[0]?.auth_user_id) !== String(auth.user.id)) {
    throw Object.assign(new Error('Somente o proprietário principal da franquia pode transmitir notas nesta etapa de testes.'), { code: 403 });
  }
  return auth;
}
const config = () => ({ key: field(process.env.NOTAAS_API_KEY || '', 256), environment: String(process.env.NOTAAS_ENVIRONMENT || 'homologacao').toLowerCase(), productionEnabled: truthy(process.env.NOTAAS_ENABLE_PRODUCTION) });
async function provider(path, key, { method = 'GET', body, idem } = {}) {
  const headers = { 'x-api-key': key, Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (idem) headers['Idempotency-Key'] = idem;
  const response = await fetch(`${API}${path}`, { method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(25000) });
  const content = await response.text();
  let payload;
  try { payload = JSON.parse(content); } catch { payload = null; }
  if (!response.ok) {
    const errorMsg = typeof payload?.message === 'string' ? payload.message : (payload?.error?.message || payload?.error || `HTTP ${response.status}`);
    const err = new Error(`Notaas (${response.status}): ${String(errorMsg).slice(0, 350)}`);
    err.code = response.status >= 500 ? 502 : (response.status === 401 || response.status === 403 ? 502 : 422);
    throw err;
  }
  return payload || {};
}
async function invoiceRow(auth, franchiseId, rowId) {
  if (!UUID.test(rowId)) throw Object.assign(new Error('Nota fiscal inválida.'), { code: 400 });
  const rows = await db(auth, 'fiscal_invoices', 'GET', `select=*&id=eq.${rowId}&franchise_id=eq.${franchiseId}&limit=1`);
  const row = rows?.[0];
  if (!row || row.xml_data?.provider !== 'notaas') throw Object.assign(new Error('Nota da Notaas não encontrada nesta franquia.'), { code: 404 });
  return row;
}
function validatedPayload(raw) {
  const model = Number(raw?.modelo);
  if (![55, 65].includes(model)) throw Object.assign(new Error('Selecione NF-e (55) ou NFC-e (65).'), { code: 400 });
  if (!Array.isArray(raw?.items) || !raw.items.length || raw.items.length > 60) throw Object.assign(new Error('Informe de 1 a 60 produtos.'), { code: 400 });
  const nature = field(raw.naturezaOperacao, 60);
  if (nature.length < 4) throw Object.assign(new Error('Informe a natureza da operação conforme orientação fiscal.'), { code: 400 });
  const items = raw.items.map((item, index) => {
    const description = field(item.descricao, 120);
    const ncm = digits(item.ncm);
    const cfop = digits(item.cfop);
    const qty = num(item.quantidade);
    const unit = amount(item.valorUnitario);
    const tax = field(item.csosn || item.cst, 3);
    const cest = digits(item.cest);
    const ean = digits(item.ean);
    if (!description || ncm.length !== 8 || cfop.length !== 4 || qty <= 0 || qty > 100000 || !Number.isFinite(unit) || unit <= 0 || !/^\d{2,3}$/.test(tax)) {
      throw Object.assign(new Error(`Produto ${index + 1}: confira descrição, NCM (8 dígitos), CFOP (4), quantidade, valor e CST/CSOSN.`), { code: 400 });
    }
    if (model === 65 && tax.length === 3 && !['102', '300'].includes(tax)) throw Object.assign(new Error(`Produto ${index + 1}: o contrato NFC-e da Notaas aceita CSOSN 102 ou 300; confirme a tributação do produto e o suporte do provedor.`), { code: 400 });
    if (cest && cest.length !== 7) throw Object.assign(new Error(`Produto ${index + 1}: CEST deve ter 7 dígitos.`), { code: 400 });
    if (ean && ![8,12,13,14].includes(ean.length)) throw Object.assign(new Error(`Produto ${index + 1}: GTIN inválido.`), { code: 400 });
    const mapped = { descricao: description, codigo: field(item.codigo, 50) || `ITEM-${index + 1}`, ncm, cfop, unidade: field(item.unidade, 6) || 'UN', quantidade: qty, valorUnitario: unit, valorTotal: Math.round(qty * unit * 100) / 100, ...(tax.length === 3 ? { csosn: tax } : { cst: tax }) };
    if (cest) mapped.cest = cest;
    if (ean) mapped.ean = ean;
    if (tax === '00' || tax === '10' || tax === '20') {
      const aliquota = num(item.aliquotaIcms);
      if (!Number.isFinite(aliquota) || aliquota < 0 || aliquota > 100) throw Object.assign(new Error(`Produto ${index + 1}: informe alíquota ICMS válida para CST ${tax}.`), { code: 400 });
      mapped.aliquotaIcms = aliquota;
    }
    return mapped;
  });
  const value = Math.round(items.reduce((acc, item) => acc + item.valorTotal, 0) * 100) / 100;
  if (!(value > 0) || value > 9999999) throw Object.assign(new Error('Valor da nota fora do limite permitido.'), { code: 400 });
  const method = String(raw?.tipoPagamento || '');
  if (!['01', '03', '04', '17', '99'].includes(method)) throw Object.assign(new Error('Selecione o meio de pagamento correto.'), { code: 400 });
  const payload = { modelo: model, naturezaOperacao: nature, items, pagamentos: [{ tipoPagamento: method, valor: value, ...(method === '99' ? { descricaoPagamento: field(raw.descricaoPagamento, 40) } : {}) }] };
  if (method === '99' && !payload.pagamentos[0].descricaoPagamento) throw Object.assign(new Error('Descreva o tipo de pagamento Outros.'), { code: 400 });
  const buyer = raw?.dest || {};
  const buyerDoc = digits(buyer.cpfCnpj);
  const buyerName = field(buyer.nome, 60);
  if (model === 55 && ![11, 14].includes(buyerDoc.length)) throw Object.assign(new Error('NF-e modelo 55 exige CPF ou CNPJ do destinatário.'), { code: 400 });
  if (model === 55 || buyerDoc || buyerName) {
    if (!buyerName || ![11,14].includes(buyerDoc.length)) throw Object.assign(new Error('Preencha nome e CPF/CNPJ válido do destinatário.'), { code: 400 });
    const address = buyer.endereco || {};
    const road = field(address.logradouro, 60);
    const neighborhood = field(address.bairro, 60);
    const city = field(address.cidade, 60);
    const uf = field(address.uf, 2).toUpperCase();
    const zip = digits(address.cep);
    const ibge = digits(address.codigoMunicipio);
    if (model === 55 && (!road || !neighborhood || !city || !/^[A-Z]{2}$/.test(uf) || zip.length !== 8 || ibge.length !== 7)) {
      throw Object.assign(new Error('Para NF-e informe logradouro, bairro, cidade, UF, CEP e código IBGE do município do destinatário.'), { code: 400 });
    }
    payload.dest = { nome: buyerName, ...(buyerDoc.length === 11 ? { cpf: buyerDoc } : { cnpj: buyerDoc }), ...(model === 55 ? { endereco: { logradouro: road, numero: field(address.numero, 10) || 'SN', bairro: neighborhood, cidade: city, uf, cep: zip, codigoMunicipio: Number(ibge) } } : {}) };
  }
  return { payload, total: value };
}
function summary(row) {
  return { id: row.id, providerInvoiceId: row.xml_data?.invoiceId || null, status: row.status, number: row.number, series: row.series, model: row.xml_data?.modelo, chaveAcesso: row.xml_data?.chaveAcesso || null, rejectionReason: row.rejection_reason, protocol: row.sefaz_protocol, total: row.total, environment: row.xml_data?.environment };
}
export const handler = async event => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método não permitido.' });
  if (Buffer.byteLength(event.body || '', 'utf8') > 130000) return json(413, { error: 'Dados fiscais excedem o limite permitido.' });
  try {
    const body = JSON.parse(event.body || '{}');
    const franchiseId = field(body.franchise_id, 42);
    if (!UUID.test(franchiseId)) return json(400, { error: 'Unidade inválida.' });
    const auth = await requireOwner(event, franchiseId);
    const action = field(body.action, 30);
    const settings = config();
    if (action === 'health') return json(200, { configured: !!settings.key, environment: settings.environment, productionEnabled: settings.productionEnabled, api: 'notaas', version: 'V52.19' });
    if (!settings.key) return json(503, { error: 'Configure NOTAAS_API_KEY nas variáveis protegidas do Netlify. Nunca use a chave que foi divulgada na conversa.' });
    if (settings.environment !== 'homologacao' && settings.environment !== 'producao') return json(503, { error: 'NOTAAS_ENVIRONMENT deve ser homologacao ou producao.' });
    if (settings.environment === 'producao' && !settings.productionEnabled) return json(403, { error: 'Emissão em produção bloqueada. Ative somente após homologação e validação fiscal.' });
    if (action === 'issue') {
      if (!body.confirmFiscal) return json(400, { error: 'Confirme a revisão dos dados fiscais antes de transmitir.' });
      const parsed = validatedPayload(body.invoice);
      const orderId = field(body.order_id, 42);
      if (orderId) {
        if (!UUID.test(orderId)) return json(400, { error: 'Pedido vinculado inválido.' });
        const orders = await db(auth, 'customer_orders', 'GET', `select=id,status,order_type,mp_payment_status,total&franchise_id=eq.${franchiseId}&id=eq.${orderId}&limit=1`);
        const order = orders?.[0];
        if (!order || order.status === 'cancelled' || ['sponsorship','tasting','gift'].includes(order.order_type)) return json(409, { error: 'Pedido inexistente, cancelado ou não elegível.' });
        if (order.mp_payment_status && !['approved','paid','accredited'].includes(order.mp_payment_status)) return json(409, { error: 'Pagamento online do pedido ainda não está confirmado.' });
        if (Math.abs(Number(order.total || 0) - parsed.total) > 0.02) return json(409, { error: 'O total da nota não coincide com o total do pedido vinculado. Confira descontos e frete antes de emitir.' });
        const existing = await db(auth, 'fiscal_invoices', 'GET', `select=id,status&franchise_id=eq.${franchiseId}&order_id=eq.${orderId}&limit=5`);
        if (existing?.some(row => row.status !== 'rejected')) return json(409, { error: 'Já existe nota em andamento ou emitida para esse pedido; consulte o histórico antes de tentar novamente.' });
      }
      const recordId = randomUUID();
      const initialMeta = { provider: 'notaas', modelo: parsed.payload.modelo, environment: settings.environment, requestCreatedAt: new Date().toISOString(), draft: true };
      const reserved = await db(auth, 'fiscal_invoices', 'POST', '', { id: recordId, franchise_id: franchiseId, order_id: orderId || null, status: 'pending', total: parsed.total, series: '1', xml_data: initialMeta });
      if (!reserved?.length) throw Object.assign(new Error('Não foi possível reservar o registro fiscal. Nenhuma nota foi transmitida.'), { code: 502 });
      let apiResult;
      try {
        apiResult = await provider('/nfe/emitir', settings.key, { method: 'POST', body: parsed.payload, idem: `suplementaai-${recordId}` });
      } catch (error) {
        // Nunca repetimos uma transmissão automaticamente em caso de falha de rede/timeout:
        // o provedor pode ter aceitado a nota. Exigir conciliação manual.
        await db(auth, 'fiscal_invoices', 'PATCH', `id=eq.${recordId}&franchise_id=eq.${franchiseId}`, { rejection_reason: `Transmissão não confirmada: ${error.message}. Consulte Logs & Status da Notaas antes de retransmitir.` }).catch(() => {});
        return json(502, { error: `Transmissão não confirmada. NÃO repita a emissão sem conferir na Notaas. ${error.message}`, recordId });
      }
      const externalId = apiResult.invoiceId || apiResult.id;
      if (!externalId || !UUID.test(String(externalId))) return json(502, { error: 'A Notaas não devolveu um invoiceId válido. Consulte a plataforma antes de tentar novamente.', recordId });
      const meta = { ...initialMeta, draft: false, invoiceId: externalId };
      await db(auth, 'fiscal_invoices', 'PATCH', `id=eq.${recordId}&franchise_id=eq.${franchiseId}`, { status: 'processing', rejection_reason: null, xml_data: meta });
      return json(200, { success: true, recordId, invoiceId: externalId, status: 'processing', environment: settings.environment });
    }
    if (['status', 'document', 'cancel'].includes(action)) {
      const row = await invoiceRow(auth, franchiseId, field(body.record_id, 42));
      const externalId = row.xml_data?.invoiceId;
      if (!UUID.test(String(externalId || ''))) return json(409, { error: 'Nota sem ID da Notaas: confirme no painel Logs & Status antes de continuar.' });
      const statusPath = `/nfe/invoices/${encodeURIComponent(externalId)}/status`;
      if (action === 'status') {
        const latest = await provider(statusPath, settings.key);
        const meta = { ...row.xml_data, chaveAcesso: latest.chaveAcesso || row.xml_data?.chaveAcesso || null, modelo: latest.modelo || row.xml_data?.modelo, environment: settings.environment, lastStatus: latest.status };
        const patch = { status: providerStatus(latest.status), xml_data: meta, number: latest.numero == null ? row.number : String(latest.numero), series: latest.serie == null ? row.series : String(latest.serie), sefaz_protocol: latest.protocolo || latest.nProt || row.sefaz_protocol, rejection_reason: latest.status === 'error' ? field(latest.motivo || latest.errorMessage, 350) : null, issued_at: latest.status === 'issued' ? (latest.dataRecebimento || new Date().toISOString()) : row.issued_at };
        const updated = await db(auth, 'fiscal_invoices', 'PATCH', `id=eq.${row.id}&franchise_id=eq.${franchiseId}`, patch);
        return json(200, { success: true, invoice: summary(updated[0] || { ...row, ...patch }) });
      }
      if (action === 'cancel') {
        if (row.status !== 'authorized') return json(409, { error: 'Somente notas autorizadas podem ter cancelamento solicitado.' });
        const reason = field(body.motivo, 255);
        if (reason.length < 15) return json(400, { error: 'Informe motivo do cancelamento com pelo menos 15 caracteres.' });
        await provider('/nfe/cancelar', settings.key, { method: 'POST', body: { invoiceId: externalId, motivo: reason }, idem: `cancel-${row.id}` });
        await db(auth, 'fiscal_invoices', 'PATCH', `id=eq.${row.id}&franchise_id=eq.${franchiseId}`, { xml_data: { ...row.xml_data, cancelRequestedAt: new Date().toISOString() } });
        return json(200, { success: true, message: 'Cancelamento solicitado. Atualize o status para confirmar a homologação pela SEFAZ.' });
      }
      const documentType = field(body.document_type, 20);
      if (!['danfe', 'xml', 'cancel_xml'].includes(documentType)) return json(400, { error: 'Documento inválido.' });
      if (!['authorized','cancelled'].includes(row.status)) return json(409, { error: 'O documento só fica disponível após a autorização da nota.' });
      const path = documentType === 'danfe' ? `/nfe/invoices/${externalId}/danfe` : `/nfe/invoices/${externalId}/xml${documentType === 'cancel_xml' ? '?type=cancel' : ''}`;
      const res = await fetch(`${API}${path}`, { headers: { 'x-api-key': settings.key }, signal: AbortSignal.timeout(25000) });
      if (!res.ok) return json(502, { error: `Não foi possível baixar o documento na Notaas (HTTP ${res.status}).` });
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 4500000) return json(413, { error: 'Documento maior que o limite de download por função.' });
      const isPdf = documentType === 'danfe';
      return { statusCode: 200, isBase64Encoded: true, headers: { 'Content-Type': isPdf ? 'application/pdf' : 'application/xml', 'Content-Disposition': `attachment; filename="${documentType}-${row.number || row.id}.${isPdf ? 'pdf' : 'xml'}"`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }, body: buffer.toString('base64') };
    }
    return json(400, { error: 'Ação fiscal não reconhecida.' });
  } catch (error) {
    // Não incluir body, credenciais, documentos ou tokens em mensagens/logs.
    return json(error.code >= 400 && error.code < 600 ? error.code : 500, { error: error instanceof Error ? error.message : 'Falha interna fiscal.' });
  }
};
