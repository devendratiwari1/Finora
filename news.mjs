export default async () => {
  const api = Netlify.env.get('ALPHA_VANTAGE_API_KEY');
  if (!api) return Response.json({articles:[],message:'Financial news is ready to connect. Add ALPHA_VANTAGE_API_KEY in Netlify environment variables.'});
  try {
    const u = new URL('https://www.alphavantage.co/query'); u.searchParams.set('function','NEWS_SENTIMENT'); u.searchParams.set('topics','financial_markets'); u.searchParams.set('limit','12'); u.searchParams.set('apikey',api);
    const r = await fetch(u); const d = await r.json();
    const articles=(d.feed||[]).map(x=>({title:x.title,url:x.url,source:x.source,time:x.time_published}));
    return Response.json({articles,provider:'Alpha Vantage'});
  } catch { return Response.json({error:'News provider request failed'},{status:500}); }
};
export const config = { path: '/api/news' };
