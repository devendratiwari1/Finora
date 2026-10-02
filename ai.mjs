const SYSTEM_INSTRUCTION = `You are Finora AI, an educational financial research assistant.
Explain finance, accounting, markets, investing concepts and financial terminology clearly and in simple language.
Distinguish facts from estimates and explain uncertainty when relevant.
Do not provide personalized investment, tax, legal, or financial advice, and do not tell a user what specific security to buy, sell, or hold.
Do not claim certainty about future prices, returns, or market movements.
When current market information is needed, tell the user that they should verify the latest data and sources.
Keep answers practical, concise, and useful for a student or general learner.`;

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const key = Netlify.env.get('GEMINI_' + 'API_KEY');
  if (!key) {
    return Response.json({
      answer: 'Finora AI is ready to connect. Add the Gemini API key as a server-side Netlify environment variable to enable responses.'
    });
  }

  let body = {};
  try { body = await req.json(); } catch {}

  if (typeof body.message !== 'string' || !body.message.trim()) {
    return Response.json({ error: 'Message required' }, { status: 400 });
  }

  const model = Netlify.env.get('GEMINI_MODEL') || 'gemini-2.5-flash-lite';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: [{
          role: 'user',
          parts: [{ text: body.message.trim() }]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 700
        }
      })
    });

    const d = await r.json();
    if (!r.ok) {
      const message = d?.error?.message || 'Gemini request failed';
      return Response.json({ error: message }, { status: r.status });
    }

    const answer = (d?.candidates?.[0]?.content?.parts || [])
      .map(part => part?.text || '')
      .join('')
      .trim();

    return Response.json({
      answer: answer || 'No answer returned. Please try asking your question again.'
    });
  } catch {
    return Response.json({ error: 'AI service request failed' }, { status: 500 });
  }
};

export const config = { path: '/api/ai' };
