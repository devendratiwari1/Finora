# Finora — production-ready starter

Finora is a responsive finance platform for Devendra Tiwari, Muskan Jaiswal and Pallavi Jaiswal.

## Included
- Home, About, Services, Insights, Markets, Contact
- Founder branding and contact details
- Market dashboard architecture
- Interactive Chart.js chart
- Financial news feed endpoint
- Automated market-report endpoint
- AI finance assistant endpoint
- Supabase email/password auth UI
- Netlify serverless functions
- Security-conscious server-side API-key handling
- Finance/educational disclaimers

## Production setup
1. Deploy this folder to Netlify.
2. Add environment variables from `.env.example` in Netlify Project configuration → Environment variables.
3. Create a Supabase project and set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. Configure the auth redirect URL to your deployed domain.
4. The NIFTY 50 homepage quote uses a server-side NSE India market-data request; no API key is embedded in the frontend. Confirm NSE terms/permissions before using or redistributing market data in production.
5. Add an Gemini API key for Finora AI and automated reports.
6. For commercial use, confirm market-data licensing/entitlements for the countries, exchanges and data freshness you publish.

The website intentionally does not put secret API keys in frontend JavaScript.

## Free publishing now
The site can be deployed on Netlify Free without adding payment details. The frontend is ready immediately; market data, news, Supabase authentication, AI responses and report generation become active after their respective environment variables are added.


## Gemini AI Assistant
Set the Gemini API key as a server-side Netlify environment variable (use the environment-variable name you already created in Netlify). Optional: `GEMINI_MODEL=gemini-2.5-flash-lite`. The AI assistant is educational and not personalized investment advice.
