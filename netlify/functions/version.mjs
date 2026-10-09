const VERSION = 'V52.19';

export async function handler(event) {
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'access-control-allow-origin': '*' },
      body: JSON.stringify({ ok: true, version: VERSION, service: 'SuplementaAI Netlify Functions' }),
    };
  }
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, OPTIONS' }, body: '' };
  }
  return { statusCode: 405, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'Use GET.' }) };
}
