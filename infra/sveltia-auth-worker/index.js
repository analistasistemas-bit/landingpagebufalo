// Sveltia CMS — GitHub OAuth handler (Cloudflare Worker)
// Secrets necessários (wrangler secret put):
//   GITHUB_CLIENT_ID
//   GITHUB_CLIENT_SECRET
//   OAUTH_STATE_SECRET

const STATE_MAX_AGE_SECONDS = 600;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export default {
  async fetch(request, env) {
    if (!hasRequiredBindings(env)) {
      return new Response('Server configuration error', { status: 500 });
    }

    const allowedOrigins = parseAllowedOrigins(env.CMS_ALLOWED_ORIGINS);
    if (allowedOrigins.size === 0) {
      return new Response('Server configuration error', { status: 500 });
    }

    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === 'OPTIONS') {
      const origin = normalizeAllowedOrigin(request.headers.get('Origin'), allowedOrigins);
      if (!origin) {
        return new Response(null, { status: 403 });
      }

      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
      });
    }

    if (pathname === '/auth') {
      const origin = originFromSiteId(url.searchParams.get('site_id'), allowedOrigins);
      if (!origin) {
        return new Response('Invalid site_id', { status: 400 });
      }

      const state = crypto.randomUUID();
      const stateCookie = await createStateCookie(state, origin, env.OAUTH_STATE_SECRET);
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        scope: 'repo',
        state,
      });
      const headers = new Headers({
        Location: `https://github.com/login/oauth/authorize?${params}`,
      });
      headers.append(
        'Set-Cookie',
        `oauth_state=${stateCookie}; HttpOnly; Secure; SameSite=Lax; Max-Age=${STATE_MAX_AGE_SECONDS}; Path=/`,
      );
      return new Response(null, { status: 302, headers });
    }

    if (pathname === '/callback') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const state = url.searchParams.get('state');
      const savedState = getCookie(request, 'oauth_state');
      const verifiedState = await verifyStateCookie(savedState, state, env.OAUTH_STATE_SECRET);

      if (!verifiedState) {
        return invalidStateResponse();
      }

      if (error || !code) {
        return postToOpener('error', { error: 'authorization_denied' }, verifiedState.origin);
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
          return postToOpener(
            'error',
            { error: 'token_exchange_failed' },
            verifiedState.origin,
          );
        }

        return postToOpener(
          'success',
          { token: access_token, provider: 'github' },
          verifiedState.origin,
        );
      } catch {
        return postToOpener('error', { error: 'token_exchange_failed' }, verifiedState.origin);
      }
    }

    return new Response('Not found', { status: 404 });
  },
};

function hasRequiredBindings(env) {
  return [
    env?.GITHUB_CLIENT_ID,
    env?.GITHUB_CLIENT_SECRET,
    env?.OAUTH_STATE_SECRET,
    env?.CMS_ALLOWED_ORIGINS,
  ].every((value) => typeof value === 'string' && value.length > 0);
}

function parseAllowedOrigins(value) {
  return new Set(
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => {
        try {
          return new URL(origin).protocol === 'https:' && new URL(origin).origin === origin;
        } catch {
          return false;
        }
      }),
  );
}

function normalizeAllowedOrigin(value, allowed) {
  if (!value) {
    return null;
  }

  try {
    const origin = new URL(value).origin;
    if (value !== origin || !origin.startsWith('https://') || !allowed.has(origin)) {
      return null;
    }
    return origin;
  } catch {
    return null;
  }
}

function originFromSiteId(siteId, allowed) {
  if (!siteId) {
    return null;
  }

  try {
    const origin = `https://${siteId}`;
    const url = new URL(origin);
    if (
      url.protocol !== 'https:' ||
      url.hostname !== siteId ||
      url.origin !== origin ||
      !allowed.has(origin)
    ) {
      return null;
    }
    return origin;
  } catch {
    return null;
  }
}

async function createStateCookie(state, origin, secret, now = Date.now()) {
  const payload = base64urlEncode(
    JSON.stringify({ state, origin, exp: Math.floor(now / 1000) + STATE_MAX_AGE_SECONDS }),
  );
  const signature = await signState(payload, secret);
  return `${payload}.${signature}`;
}

async function verifyStateCookie(cookie, state, secret, now = Date.now()) {
  if (!cookie || !state) {
    return null;
  }

  const [payload, signature, extra] = cookie.split('.');
  if (!payload || !signature || extra || !(await verifyStateSignature(payload, signature, secret))) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64urlDecode(payload));
    if (
      parsed.state !== state ||
      typeof parsed.origin !== 'string' ||
      !Number.isInteger(parsed.exp) ||
      parsed.exp < Math.floor(now / 1000)
    ) {
      return null;
    }
    return { origin: parsed.origin };
  } catch {
    return null;
  }
}

async function signState(payload, secret) {
  const key = await stateSigningKey(secret, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(payload));
  return base64urlEncode(new Uint8Array(signature));
}

async function verifyStateSignature(payload, signature, secret) {
  try {
    const key = await stateSigningKey(secret, ['verify']);
    return await crypto.subtle.verify(
      'HMAC',
      key,
      base64urlDecodeBytes(signature),
      textEncoder.encode(payload),
    );
  } catch {
    return false;
  }
}

function stateSigningKey(secret, usages) {
  return crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usages,
  );
}

function base64urlEncode(value) {
  const bytes = typeof value === 'string' ? textEncoder.encode(value) : value;
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function base64urlDecode(value) {
  return textDecoder.decode(base64urlDecodeBytes(value));
}

function base64urlDecodeBytes(value) {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  if (!match) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function invalidStateResponse() {
  return new Response('invalid_state', {
    status: 400,
    headers: { 'Set-Cookie': clearedStateCookie() },
  });
}

function postToOpener(status, data, allowedOrigin) {
  const message = `authorization:github:${status}:${JSON.stringify(data)}`;
  const html = `<!doctype html><html><body><script>
    (function() {
      const allowedOrigin = ${serializeForScript(allowedOrigin)};
      const message = ${serializeForScript(message)};
      function cb(e) {
        if (e.origin !== allowedOrigin) return;
        window.opener.postMessage(message, allowedOrigin);
      }
      window.addEventListener('message', cb, false);
      window.opener.postMessage('authorizing:github', allowedOrigin);
    })();
  <\/script></body></html>`;
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Set-Cookie': clearedStateCookie(),
    },
  });
}

function serializeForScript(value) {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => {
    const escaped = {
      '<': '\\u003C',
      '>': '\\u003E',
      '&': '\\u0026',
      '\u2028': '\\u2028',
      '\u2029': '\\u2029',
    };
    return escaped[character];
  });
}

function clearedStateCookie() {
  return 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/';
}
