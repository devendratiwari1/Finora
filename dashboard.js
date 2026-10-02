let chart;
const symbols = { NIFTY: 'NIFTY 50', SENSEX: 'SENSEX' };

async function market(symbol = 'NIFTY') {
  try {
    const r = await fetch('/api/market?symbol=' + encodeURIComponent(symbol), { cache: 'no-store' });
    return await r.json();
  } catch (e) {
    return { error: 'Market API unavailable' };
  }
}

function drawSnapshot(quote) {
  const ctx = document.querySelector('#marketChart');
  if (chart) chart.destroy();

  const current = Number(quote.price);
  const previous = Number(quote.previousClose);
  const hasPrevious = Number.isFinite(previous) && Number.isFinite(current);

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hasPrevious ? ['Previous close', 'Current snapshot'] : ['Current snapshot'],
      datasets: [{
        label: 'Index value',
        data: hasPrevious ? [previous, current] : [current],
        tension: .35,
        fill: true,
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => Number(ctx.parsed.y).toLocaleString('en-IN', { maximumFractionDigits: 2 }) } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#7890a7' } },
        y: { grid: { color: 'rgba(120,160,190,.1)' }, ticks: { color: '#7890a7' } }
      }
    }
  });
}

function setChartUnavailable(message) {
  const ctx = document.querySelector('#marketChart');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: { labels: ['No data'], datasets: [{ label: 'Unavailable', data: [0], borderWidth: 0, pointRadius: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
  });
  const note = document.querySelector('#chartNote');
  if (note) note.textContent = message;
}

async function load() {
  const symbol = document.querySelector('#symbolSelect').value;
  document.querySelector('#chartTitle').textContent = symbols[symbol];

  const d = await market(symbol);
  const note = document.querySelector('#chartNote');

  if (d.price != null) {
    drawSnapshot(d);
    if (note) {
      const stamp = d.timestamp ? ` · ${d.timestamp}` : '';
      note.textContent = `NSE snapshot${stamp}. Hover the points for exact values. Historical series will be added when a licensed historical feed is connected.`;
    }
  } else {
    setChartUnavailable(d.message || d.error || 'NSE market data is unavailable right now.');
  }

  const grid = document.querySelector('#quoteGrid');
  grid.innerHTML = '';
  for (const s of Object.keys(symbols)) {
    const q = await market(s);
    const value = q.price == null ? '—' : Number(q.price).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    const change = q.changePct == null ? 'NSE snapshot' : `${q.changePct >= 0 ? '+' : ''}${Number(q.changePct).toFixed(2)}%`;
    grid.insertAdjacentHTML('beforeend', `<article class="quote-card"><span>${symbols[s]}</span><strong>${value}</strong><small>${change}</small></article>`);
  }

  try {
    const nr = await fetch('/api/news', { cache: 'no-store' });
    const n = await nr.json();
    document.querySelector('#newsList').innerHTML = (n.articles || []).map(a => `<div class="news-item"><a href="${a.url || '#'}" target="_blank" rel="noopener">${a.title}</a><small>${a.source || 'Financial news'} · ${a.time || ''}</small></div>`).join('') || '<p class="muted">No news available. Connect a news provider to enable this feed.</p>';
  } catch (e) {
    document.querySelector('#newsList').innerHTML = '<p class="muted">News provider is not configured yet.</p>';
  }
}

document.querySelector('#symbolSelect').addEventListener('change', load);
document.querySelector('#refreshBtn').addEventListener('click', load);

document.querySelector('#reportBtn').addEventListener('click', async () => {
  const out = document.querySelector('#reportOutput');
  out.classList.remove('hidden');
  out.textContent = 'Generating report…';
  try {
    const r = await fetch('/api/report');
    const d = await r.json();
    out.textContent = d.report || d.error || 'Report service is not configured.';
  } catch (e) {
    out.textContent = 'Report service is not configured yet.';
  }
});

document.querySelector('#chatForm').addEventListener('submit', async e => {
  e.preventDefault();
  const input = document.querySelector('#chatInput');
  const chat = document.querySelector('#chat');
  const q = input.value.trim();
  if (!q) return;
  chat.insertAdjacentHTML('beforeend', `<div class="bubble user">${q.replace(/[<>&]/g, m => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[m]))}</div>`);
  input.value = '';
  const bubble = document.createElement('div');
  bubble.className = 'bubble ai';
  bubble.textContent = 'Thinking…';
  chat.appendChild(bubble);
  try {
    const r = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: q }) });
    const d = await r.json();
    bubble.textContent = d.answer || d.error || 'AI service is not configured.';
  } catch (e) {
    bubble.textContent = 'AI service is not configured yet. Add the server-side AI key in Netlify.';
  }
  chat.scrollTop = chat.scrollHeight;
});

load();
