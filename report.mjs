export default async () => {
  const key=Netlify.env.get('OPENAI_API_KEY');
  if(!key) return Response.json({report:'The automated report engine is ready. Add OPENAI_API_KEY and ALPHA_VANTAGE_API_KEY in Netlify environment variables to generate current market reports.'});
  try {
    const api=Netlify.env.get('ALPHA_VANTAGE_API_KEY'); let headlines='';
    if(api){ const u=new URL('https://www.alphavantage.co/query'); u.searchParams.set('function','NEWS_SENTIMENT'); u.searchParams.set('topics','financial_markets'); u.searchParams.set('limit','8'); u.searchParams.set('apikey',api); const n=await fetch(u); const nd=await n.json(); headlines=(nd.feed||[]).slice(0,8).map(x=>`${x.title} — ${x.source}`).join('\n'); }
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify({model:Netlify.env.get('OPENAI_MODEL')||'gpt-5.6-luna',instructions:'Write a concise educational financial market brief. Use only the supplied headlines, do not invent prices or events, clearly state that it is informational and not investment advice.',input:`Create a market brief from these headlines:\n${headlines||'No headlines available.'}`})});
    const d=await r.json(); return Response.json({report:d.output_text||'No report returned.'},{status:r.ok?200:r.status});
  } catch { return Response.json({error:'Report generation failed'},{status:500}); }
};
export const config = { path: '/api/report' };
