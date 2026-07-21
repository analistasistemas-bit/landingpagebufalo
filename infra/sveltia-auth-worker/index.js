// Sveltia CMS — GitHub OAuth handler (Cloudflare Worker)
// Secrets necessários (wrangler secret put):
//   GITHUB_CLIENT_ID
//   GITHUB_CLIENT_SECRET

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
      });
    }

    // Passo 1: redireciona para o GitHub OAuth
    if (pathname === '/auth') {
      const state = crypto.randomUUID();
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        scope: 'repo',
        state,
      });
      const headers = new Headers({
        Location: `https://github.com/login/oauth/authorize?${params}`,
      });
      // Guarda o state num cookie HttpOnly para validar no /callback e evitar CSRF.
      headers.append(
        'Set-Cookie',
        `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`
      );
      return new Response(null, { status: 302, headers });
    }

    // Passo 2: GitHub redireciona de volta com ?code=&state=
    if (pathname === '/callback') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const state = url.searchParams.get('state');
      const savedState = getCookie(request, 'oauth_state');

      if (error || !code) {
        return postToOpener('error', { error: error || 'no_code' });
      }

      if (!state || !savedState || state !== savedState) {
        return postToOpener('error', { error: 'invalid_state' });
      }

      try {
        const res = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
          }),
        });

        const { access_token, error: tokenError } = await res.json();

        if (tokenError || !access_token) {
          return postToOpener('error', { error: tokenError || 'no_token' });
        }

        return postToOpener('success', { token: access_token, provider: 'github' });
      } catch (e) {
        return postToOpener('error', { error: String(e) });
      }
    }

    return new Response('Not found', { status: 404 });
  },
};

function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function postToOpener(status, data) {
  const message = `authorization:github:${status}:${JSON.stringify(data)}`;
  const html = `<!doctype html><html><body><script>
    (function() {
      function cb(e) {
        window.opener.postMessage(${JSON.stringify(message)}, e.origin);
      }
      window.addEventListener('message', cb, false);
      window.opener.postMessage('authorizing:github', '*');
    })();
  <\/script></body></html>`;
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      // Cookie de state só serve para uma tentativa de login — limpa após o uso.
      'Set-Cookie': 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/',
    },
  });
}
