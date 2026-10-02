export default async (req) => {
  const url = new URL(req.url);
  const symbol = (url.searchParams.get('symbol') || 'NIFTY').toUpperCase();
  const map = {NIFTY:'NIFTY50', SENSEX:'SENSEX', RELIANCE:'RELIANCE.BSE', TCS:'TCS.BSE', INFY:'INFY.BSE'};
  const api = Netlify.env.get('ALPHA_VANTAGE_API_KEY');
  if (!api) return Response.json({symbol,price:null,change:null,message:'Market data is ready to connect. Add ALPHA_VANTAGE_API_KEY in Netlify environment variables.'});
  const ticker = map[symbol] || symbol;
  try {
    const u = new URL('https://www.alphavantage.co/query');
    u.searchParams.set('function','GLOBAL_QUOTE'); u.searchParams.set('symbol',ticker); u.searchParams.set('apikey',api);
    const q = await fetch(u); const d = await q.json(); const g = d['Global Quote'] || {};
    const price = g['05. price'] || null; const change = g['10. change percent'] || null;
    return Response.json({symbol,price:price?Number(price).toLocaleString('en-IN',{maximumFractionDigits:2}):null,change,history:null,provider:'Alpha Vantage'});
  } catch { return Response.json({error:'Market provider request failed'},{status:500}); }
};
export const config = { path: '/api/market' };
