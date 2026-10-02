const NSE_HOME = 'https://www.nseindia.com/';
const NSE_API = 'https://www.nseindia.com/api/allIndices';

function headers(cookie = '') {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Referer': NSE_HOME,
    ...(cookie ? { Cookie: cookie } : {})
  };
}

function extractCookie(response) {
  try {
    if (typeof response.headers.getSetCookie === 'function') {
      return response.headers.getSetCookie().map(v => v.split(';')[0]).join('; ');
    }
  } catch (_) {}
  const raw = response.headers.get('set-cookie');
  if (!raw) return '';
  return raw.split(/,(?=[^;]+?=)/).map(v => v.split(';')[0]).join('; ');
}

function normalizeIndex(row) {
  const price = Number(row?.last);
  const change = Number(row?.variation);
  const percent = Number(row?.percentChange);
  if (!Number.isFinite(price)) return null;
  return {
    price,
    change: Number.isFinite(change) ? change : null,
    changePct: Number.isFinite(percent) ? percent : null,
    previousClose: Number.isFinite(Number(row?.previousClose)) ? Number(row.previousClose) : null,
    timestamp: row?.timeVal || row?.time || row?.dateTime || new Date().toISOString(),
    source: 'NSE India'
  };
}

exports.handler = async function handler(event) {
  const requested = (event.queryStringParameters?.symbol || 'NIFTY').toUpperCase();
  const symbolMap = {
    NIFTY: 'NIFTY 50',
    'NIFTY 50': 'NIFTY 50',
    SENSEX: 'SENSEX'
  };
  const target = symbolMap[requested] || 'NIFTY 50';

  try {
    const home = await fetch(NSE_HOME, { headers: headers(), redirect: 'follow' });
    const cookie = extractCookie(home);

    const response = await fetch(NSE_API, {
      headers: headers(cookie),
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`NSE returned HTTP ${response.status}`);
    }

    const payload = await response.json();
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    const row = rows.find(item => String(item?.index || '').toUpperCase() === target);
    const quote = normalizeIndex(row);

    if (!quote) throw new Error(`${target} was not found in the NSE response`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=30, s-maxage=30'
      },
      body: JSON.stringify({
        symbol: target,
        ...quote,
        display: quote.changePct == null
          ? 'NSE snapshot'
          : `${quote.changePct >= 0 ? '+' : ''}${quote.changePct.toFixed(2)}%`
      })
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        error: 'NSE market data is temporarily unavailable.',
        detail: error.message
      })
    };
  }
};
