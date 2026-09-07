const FRENET_URL = 'https://api.frenet.com.br/shipping/quote';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: corsHeaders });
const digits = (value) => String(value || '').replace(/\D/g, '');
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function readToken() {
  try {
    return String(Netlify.env.get('FRENET_TOKEN') || '').trim();
  } catch {
    return '';
  }
}

function sanitizeInput(input) {
  const sellerCep = digits(input?.SellerCEP);
  const recipientCep = digits(input?.RecipientCEP);
  const sourceItems = Array.isArray(input?.ShippingItemArray) ? input.ShippingItemArray : [];
  if (sellerCep.length !== 8) throw Object.assign(new Error('CEP de origem inválido.'), { statusCode: 400 });
  if (recipientCep.length !== 8) throw Object.assign(new Error('CEP de destino inválido.'), { statusCode: 400 });
  if (!sourceItems.length) throw Object.assign(new Error('Nenhum produto informado para calcular o frete.'), { statusCode: 400 });

  const ShippingItemArray = sourceItems.map((item, index) => ({
    Weight: Math.max(0.01, finite(item?.Weight, 0.5)),
    Length: Math.max(2, finite(item?.Length, 20)),
    Height: Math.max(2, finite(item?.Height, 20)),
    Width: Math.max(2, finite(item?.Width, 16)),
    Diameter: Math.max(0, finite(item?.Diameter, 0)),
    SKU: String(item?.SKU || `item-${index + 1}`).slice(0, 120),
    Category: String(item?.Category || '').slice(0, 120),
    isFragile: Boolean(item?.isFragile),
    Quantity: Math.max(1, Math.floor(finite(item?.Quantity, 1))),
    ProductName: String(item?.ProductName || '').slice(0, 180),
  }));

  return {
    SellerCEP: sellerCep,
    RecipientCEP: recipientCep,
    ShipmentInvoiceValue: Math.max(0, finite(input?.ShipmentInvoiceValue, 0)),
    RecipientCountry: 'BR',
    ShippingServiceCode: String(input?.ShippingServiceCode || '').trim() || null,
    Coupom: String(input?.Coupom || '').trim() || null,
    ShippingItemArray,
  };
}

function responseRows(data) {
  if (Array.isArray(data)) return data;
  return data?.ShippingSevicesArray
    || data?.ShippingServicesArray
    || data?.ShippingServiceAvailableArray
    || data?.ShippingServiceArray
    || [];
}

async function quote(input) {
  const authToken = readToken();
  if (!authToken) {
    return json(503, {
      error: 'Token Frenet não disponível no runtime do Netlify.',
      configured: false,
      provider: 'frenet-edge',
    });
  }

  const payload = sanitizeInput(input);
  const response = await fetch(FRENET_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      token: authToken,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data = {};
  try { data = JSON.parse(text || '{}'); } catch { data = { raw: text }; }

  if (!response.ok) {
    return json(response.status, {
      error: data?.Message || data?.message || data?.error || `Frenet recusou a cotação (HTTP ${response.status}).`,
      details: data,
    });
  }

  const rows = responseRows(data);
  const quotes = rows
    .map((row, index) => {
      const hasError = row?.Error === true || String(row?.Error || '').toLowerCase() === 'true';
      const price = Number(row?.ShippingPrice ?? row?.Price ?? row?.price);
      if (hasError || !Number.isFinite(price) || price < 0) return null;
      const serviceCode = String(row?.ServiceCode ?? row?.ShippingServiceCode ?? index);
      const carrierCode = String(row?.CarrierCode || row?.Carrier || 'FRENET');
      return {
        id: `${carrierCode}-${serviceCode}-${index}`,
        serviceCode,
        name: String(row?.ServiceDescription || row?.ShippingServiceName || row?.Name || serviceCode || 'Frete'),
        company: String(row?.Carrier || row?.CarrierName || ''),
        price,
        rawPrice: row?.OriginalShippingPrice == null ? null : Number(row.OriginalShippingPrice),
        deliveryTime: row?.DeliveryTime == null || row?.DeliveryTime === '' ? null : Number(row.DeliveryTime),
        allowBuyLabel: row?.AllowBuyLabel == null ? null : Boolean(row.AllowBuyLabel),
      };
    })
    .filter(Boolean);

  if (!quotes.length) {
    const messages = rows.map((row) => row?.Msg || row?.Message || row?.message).filter(Boolean);
    return json(422, {
      error: messages[0] || 'A Frenet não retornou opções de frete para este CEP e estes produtos.',
      details: data,
    });
  }

  quotes.sort((a, b) => a.price - b.price || (a.deliveryTime ?? 999) - (b.deliveryTime ?? 999));
  return json(200, { quotes, provider: 'frenet-edge' });
}

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response('', { status: 204, headers: corsHeaders });

  try {
    if (request.method === 'GET') {
      return json(200, {
        configured: Boolean(readToken()),
        provider: 'frenet-edge',
        endpoint: FRENET_URL,
      });
    }

    if (request.method !== 'POST') return json(405, { error: 'Método não permitido.' });
    const input = await request.json().catch(() => ({}));
    const action = String(input?.action || 'quote');
    if (action === 'quote') return await quote(input);
    if (action === 'status') {
      return json(200, {
        configured: Boolean(readToken()),
        provider: 'frenet-edge',
        endpoint: FRENET_URL,
      });
    }
    return json(400, { error: 'Ação desconhecida.' });
  } catch (error) {
    return json(Number(error?.statusCode || 500), { error: error?.message || 'Erro interno na integração Frenet.' });
  }
};
