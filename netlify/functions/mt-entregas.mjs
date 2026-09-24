import { authorizeAnalytics } from './_supabase-public.mjs';

const MT_API_KEY = String(process.env.MT_API_KEY || 'mch_api_kBDtlwpckBtQgtBsBbgWr25y').trim();
const MT_ENV = String(process.env.MT_ENV || 'production').trim().toLowerCase();
const MT_BASE_URL_V2 = String(process.env.MT_BASE_URL || (
  MT_ENV === 'homologation' || MT_ENV === 'test'
    ? 'https://api-vendas.taximachine.com.br/api/v2/integracao'
    : 'https://api.taximachine.com.br/api/v2/integracao'
)).replace(/\/$/, '');
const MT_BASE_URL_V1 = String(process.env.MT_BASE_URL_V1 || (
  MT_ENV === 'homologation' || MT_ENV === 'test'
    ? 'https://api-vendas.taximachine.com.br/api/integracao'
    : 'https://api.taximachine.com.br/api/integracao'
)).replace(/\/$/, '');

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Content-Type, Authorization',
    'access-control-allow-methods': 'POST, OPTIONS',
    'cache-control': 'no-store',
  },
  body: JSON.stringify(body),
});

function finiteNumber(value) {
  if (value === null || value === undefined || value === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function buildHeaders(basicAuth) {
  const headers = {
    'api-key': MT_API_KEY,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (basicAuth?.username && basicAuth?.password != null) {
    const credentials = Buffer.from(`${String(basicAuth.username).trim()}:${String(basicAuth.password)}`, 'utf8').toString('base64');
    headers.Authorization = `Basic ${credentials}`;
  }
  return headers;
}

function extractErrorText(value, fallback) {
  const seen = new Set();
  const preferred = ['error', 'erro', 'message', 'mensagem', 'detail', 'details', 'errors', 'mensagens', 'raw', 'body'];

  const visit = (current) => {
    if (current == null) return null;
    if (typeof current === 'string') {
      const text = current.trim();
      if (!text || /^\[object object\]$/i.test(text)) return null;
      if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
        try {
          const nested = visit(JSON.parse(text));
          if (nested) return nested;
        } catch {
          // mantém texto abaixo
        }
      }
      return text;
    }
    if (typeof current === 'number' || typeof current === 'boolean') return String(current);
    if (typeof current !== 'object' || seen.has(current)) return null;
    seen.add(current);
    if (Array.isArray(current)) {
      const parts = current.map(visit).filter(Boolean);
      return parts.length ? parts.join('; ') : null;
    }
    for (const key of preferred) {
      if (key in current) {
        const text = visit(current[key]);
        if (text) return text;
      }
    }
    const fields = [];
    for (const [key, child] of Object.entries(current)) {
      if (['success', 'status', 'statusCode', 'code', 'ok'].includes(key)) continue;
      const text = visit(child);
      if (text) fields.push(`${key}: ${text}`);
    }
    return fields.length ? fields.join('; ') : null;
  };

  return visit(value) || fallback;
}

async function readResponse(response) {
  const text = await response.text().catch(() => '');
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { message: text }; }
}

async function machine(path, { method = 'GET', basicAuth, body } = {}) {
  const response = await fetch(path, {
    method,
    headers: buildHeaders(basicAuth),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await readResponse(response);
  return { response, data };
}

function machineResult(result, fallback) {
  const { response, data } = result;
  if (!response.ok || data?.success === false) {
    return json(200, {
      success: false,
      error: extractErrorText(data, fallback || `MT Entregas respondeu HTTP ${response.status}.`),
      status: response.status,
      details: data,
      source: 'machine',
    });
  }
  return json(200, data?.success === undefined ? { success: true, data, source: 'machine' } : { ...data, source: 'machine' });
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  if (event.httpMethod !== 'POST') return json(405, { success: false, error: 'Método não permitido.' });

  try {
    const request = JSON.parse(event.body || '{}');
    const action = String(request?.action || '').trim();
    const payload = request?.payload || {};
    const franchiseId = String(request?.franchise_id || '').trim();

    if (!franchiseId) return json(400, { success: false, error: 'franchise_id não informado.' });

    const auth = await authorizeAnalytics(event, franchiseId);
    if (!auth.ok) return json(auth.status || 403, { success: false, error: auth.error || 'Sessão sem permissão para esta unidade.' });

    const basicAuth = payload?.basic_auth
      ? { username: String(payload.basic_auth.username || '').trim(), password: String(payload.basic_auth.password ?? '') }
      : null;

    if (!basicAuth?.username || !basicAuth?.password) {
      return json(400, { success: false, error: 'Login e senha da MT Entregas são obrigatórios.' });
    }
    if (!MT_API_KEY) return json(500, { success: false, error: 'Chave da API MT Entregas não configurada no servidor.' });

    // Teste e listagem usam a API v2 documentada. Isso valida api-key + Basic Auth
    // sem criar corrida real.
    if (action === 'test_connection' || action === 'list_deliveries') {
      const body = {
        pagina: finiteNumber(payload.page) ?? 1,
        limite: Math.min(100, Math.max(1, finiteNumber(payload.limit) ?? 1)),
      };
      if (payload.status) body.status_solicitacao = String(payload.status);
      if (payload.payment_type) body.tipo_pagamento = String(payload.payment_type);
      if (payload.driver_id) body.condutor_id = finiteNumber(payload.driver_id);

      const result = await machine(`${MT_BASE_URL_V2}/entregas/consultar`, {
        method: 'POST',
        basicAuth,
        body,
      });
      return machineResult(result, 'Não foi possível validar as credenciais da MT Entregas.');
    }

    if (action === 'quote') {
      const body = {
        endereco_partida: payload.pickup_address,
        bairro_partida: payload.pickup_neighborhood,
        cidade_partida: payload.pickup_city,
        estado_partida: payload.pickup_state,
        endereco_desejado: payload.delivery_address,
        bairro_desejado: payload.delivery_neighborhood,
        cidade_desejado: payload.delivery_city,
        estado_desejado: payload.delivery_state,
        com_retorno: payload.with_return ?? false,
      };
      const pickupLat = finiteNumber(payload.pickup_lat);
      const pickupLng = finiteNumber(payload.pickup_lng);
      const deliveryLat = finiteNumber(payload.delivery_lat);
      const deliveryLng = finiteNumber(payload.delivery_lng);
      const categoryId = finiteNumber(payload.category_id);
      if (pickupLat !== undefined) body.lat_partida = pickupLat;
      if (pickupLng !== undefined) body.lng_partida = pickupLng;
      if (deliveryLat !== undefined) body.lat_desejado = deliveryLat;
      if (deliveryLng !== undefined) body.lng_desejado = deliveryLng;
      if (categoryId !== undefined) body.categoria_id = categoryId;
      if (payload.category_name) body.categoria_nome = String(payload.category_name);

      const required = ['endereco_partida', 'bairro_partida', 'cidade_partida', 'estado_partida', 'endereco_desejado', 'bairro_desejado', 'cidade_desejado', 'estado_desejado'];
      const missing = required.filter((key) => !String(body[key] ?? '').trim());
      if (missing.length) return json(200, { success: false, error: `Dados de endereço incompletos para cotação: ${missing.join(', ')}` });

      const result = await machine(`${MT_BASE_URL_V2}/entregas/estimativas`, {
        method: 'POST',
        basicAuth,
        body,
      });
      return machineResult(result, 'A MT Entregas não conseguiu calcular esta rota.');
    }

    if (action === 'create_delivery') {
      const pickup = payload?.pickup || {};
      const stops = Array.isArray(payload?.stops) ? payload.stops : [];
      const requiredPickup = [pickup.address, pickup.neighborhood, pickup.city, pickup.state].every((v) => String(v ?? '').trim());
      const firstStop = stops[0] || {};
      const requiredStop = [firstStop.address, firstStop.neighborhood, firstStop.city, firstStop.state].every((v) => String(v ?? '').trim());
      if (!stops.length || !requiredPickup || !requiredStop) {
        return json(200, { success: false, error: 'Dados incompletos para abrir a entrega. Confira coleta e destino.' });
      }

      const paymentMethod = String(payload.payment_method || 'D').trim().toUpperCase();
      const allowedPayments = new Set(['D', 'B', 'C', 'X', 'P', 'H', 'F', 'R']);
      if (!allowedPayments.has(paymentMethod)) return json(200, { success: false, error: `Forma de pagamento inválida para a MT Entregas: ${paymentMethod}.` });

      const partida = {
        endereco: String(pickup.address).trim(),
        bairro: String(pickup.neighborhood).trim(),
        complemento: String(pickup.complement || '').trim(),
        cidade: String(pickup.city).trim(),
        estado: String(pickup.state).trim().toUpperCase(),
        referencia: String(pickup.reference || '').trim(),
      };
      const pickupLat = finiteNumber(pickup.lat);
      const pickupLng = finiteNumber(pickup.lng);
      if (pickupLat !== undefined) partida.lat = pickupLat;
      if (pickupLng !== undefined) partida.lng = pickupLng;

      const body = {
        forma_pagamento: paymentMethod,
        partida,
        paradas: stops.map((stop) => {
          const parada = {
            endereco_parada: String(stop.address || '').trim(),
            bairro_parada: String(stop.neighborhood || '').trim(),
            complemento_parada: String(stop.complement || '').trim(),
            cidade_parada: String(stop.city || '').trim(),
            estado_parada: String(stop.state || '').trim().toUpperCase(),
            referencia_parada: String(stop.reference || '').trim(),
            id_externo: String(stop.external_id || '').trim(),
            observacao_parada: String(stop.notes || '').trim(),
            nome_cliente_parada: String(stop.customer_name || '').trim(),
            telefone_cliente_parada: String(stop.customer_phone || '').trim(),
          };
          const confirmationCode = String(stop.confirmation_code || '').trim();
          if (confirmationCode) parada.codigo_confirmacao = confirmationCode;
          const amountToCollect = finiteNumber(stop.amount_to_collect);
          if (amountToCollect !== undefined && amountToCollect > 0) parada.valor_cobrar = Math.round(amountToCollect * 100) / 100;
          const lat = finiteNumber(stop.lat);
          const lng = finiteNumber(stop.lng);
          if (lat !== undefined) parada.lat_parada = lat;
          if (lng !== undefined) parada.lng_parada = lng;
          return parada;
        }),
      };
      if (payload.require_confirmation_code === true) body.exigir_codigo_confirmacao = true;

      const result = await machine(`${MT_BASE_URL_V2}/entregas`, {
        method: 'POST',
        basicAuth,
        body,
      });
      return machineResult(result, 'A MT Entregas recusou a solicitação do motoboy.');
    }

    if (action === 'tracking_link') {
      const deliveryId = encodeURIComponent(String(payload.delivery_id || '').trim());
      if (!deliveryId) return json(200, { success: false, error: 'ID da entrega não informado.' });
      const result = await machine(`${MT_BASE_URL_V2}/entregas/${deliveryId}/links-rastreio`, { method: 'GET', basicAuth });
      return machineResult(result, 'Não foi possível obter o rastreio da MT Entregas.');
    }

    // Compatibilidade com ações antigas ainda presentes no projeto.
    if (action === 'track') {
      const params = new URLSearchParams();
      if (payload.delivery_id) params.set('id_mch', String(payload.delivery_id));
      const result = await machine(`${MT_BASE_URL_V1}/solicitacaoStatus?${params}`, { method: 'GET', basicAuth });
      return machineResult(result, 'Não foi possível consultar o status da entrega.');
    }

    if (action === 'cancel') {
      const result = await machine(`${MT_BASE_URL_V1}/cancelar`, {
        method: 'POST', basicAuth,
        body: { id_mch: payload.delivery_id, motivo_id: payload.reason_id ?? 1 },
      });
      return machineResult(result, 'Não foi possível cancelar a entrega.');
    }

    if (action === 'receipt') {
      const params = new URLSearchParams();
      if (payload.delivery_id) params.set('id_mch', String(payload.delivery_id));
      const result = await machine(`${MT_BASE_URL_V1}/reciboEntrega?${params}`, { method: 'GET', basicAuth });
      return machineResult(result, 'Não foi possível obter o recibo da entrega.');
    }

    if (action === 'driver_position') {
      const params = new URLSearchParams();
      if (payload.delivery_id) params.set('id_mch', String(payload.delivery_id));
      const result = await machine(`${MT_BASE_URL_V1}/posicaoCondutor?${params}`, { method: 'GET', basicAuth });
      return machineResult(result, 'Não foi possível obter a posição do entregador.');
    }

    if (action === 'register_webhook') {
      const result = await machine(`${MT_BASE_URL_V1}/cadastrarWebhook`, {
        method: 'POST', basicAuth,
        body: {
          tipo: payload.webhook_type || 'status',
          url: payload.webhook_url,
          responsabilidade: payload.responsabilidade || 'solicitante',
        },
      });
      return machineResult(result, 'Não foi possível cadastrar o webhook da MT Entregas.');
    }

    return json(400, { success: false, error: `Ação MT Entregas não suportada: ${action || '(vazia)'}.` });
  } catch (error) {
    return json(500, {
      success: false,
      error: extractErrorText(error, error?.message || 'Falha interna na integração MT Entregas.'),
    });
  }
};
