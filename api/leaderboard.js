export default async function handler(request, response) {

  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    let period, scope;
    if (request.query) {
      period = request.query.period;
      scope = request.query.scope;
    }
    if (!period || !scope) {
      try {
        const url = new URL(request.url, 'http://localhost');
        period = period || url.searchParams.get('period');
        scope = scope || url.searchParams.get('scope');
      } catch (_) {}
    }
    period = (period || 'daily').toLowerCase();
    scope = (scope || 'global').toLowerCase();

    const allowedPeriods = new Set(['daily', 'weekly', 'last_7_days']);
    if (!allowedPeriods.has(period)) period = 'daily';
    const allowedScopes = new Set(['global', 'regional']);
    if (!allowedScopes.has(scope)) scope = 'global';

    const upstreamUrl = `https://hackatime.hackclub.com/leaderboards?period_type=${encodeURIComponent(period)}&scope=${encodeURIComponent(scope)}`;
    const upstreamRes = await fetch(upstreamUrl, { headers: { 'User-Agent': 'SlackVR/1.0 (+github.com/arnav-kr)' } });
    if (!upstreamRes.ok) {
      const text = await upstreamRes.text().catch(() => upstreamRes.statusText);
      response.status(upstreamRes.status).send(`<p>Upstream error (${upstreamRes.status}): ${text.substring(0, 300)}</p>`);
      return;
    }
    const html = await upstreamRes.text();
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=60');
    response.status(200).send(html);
  } catch (e) {
    response.status(500).send(`<p>Internal error fetching leaderboard: ${e.message}</p>`);
  }
}