export default async () => Response.json({supabaseUrl:Netlify.env.get('SUPABASE_URL')||'',supabaseKey:Netlify.env.get('SUPABASE_PUBLISHABLE_KEY')||''},{headers:{'Cache-Control':'no-store'}});
export const config = { path: '/api/config' };
