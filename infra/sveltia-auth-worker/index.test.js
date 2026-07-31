import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.js';

const env = {
  GITHUB_CLIENT_ID: 'client',
  GITHUB_CLIENT_SECRET: 'client-secret',
  OAUTH_STATE_SECRET: 'test-state-secret-with-at-least-32-bytes',
  CMS_ALLOWED_ORIGINS:
    'https://landingpagebufalo.vercel.app,https://marcabufalo.com.br,https://www.marcabufalo.com.br',
};

async function startAuth(siteId, testEnv = env) {
  const auth = await worker.fetch(
    new Request(`https://worker.example/auth?provider=github&site_id=${siteId}&scope=repo`),
    testEnv,
  );
  return {
    state: new URL(auth.headers.get('location')).searchParams.get('state'),
    cookie: auth.headers.get('set-cookie').match(/oauth_state=([^;]+)/)[1],
  };
}

function assertCookieCleared(response) {
  assert.match(response.headers.get('set-cookie'), /oauth_state=;/);
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
}

test('allows CORS preflight only for every configured CMS origin', async () => {
  for (const origin of [
    'https://landingpagebufalo.vercel.app',
    'https://marcabufalo.com.br',
    'https://www.marcabufalo.com.br',
  ]) {
    const response = await worker.fetch(
      new Request('https://worker.example/auth', {
        method: 'OPTIONS',
        headers: { Origin: origin },
      }),
      env,
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), origin);
    assert.equal(response.headers.get('access-control-allow-methods'), 'GET, OPTIONS');
  }
});

test('rejects CORS preflight for absent, untrusted, HTTP, and unlisted-subdomain origins', async () => {
  for (const origin of [
    null,
    'https://evil.example',
    'http://marcabufalo.com.br',
    'https://admin.marcabufalo.com.br',
  ]) {
    const response = await worker.fetch(
      new Request('https://worker.example/auth', {
        method: 'OPTIONS',
        headers: origin ? { Origin: origin } : {},
      }),
      env,
    );
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('access-control-allow-origin'), null);
  }
});

test('rejects an untrusted Sveltia site_id before redirecting to GitHub', async () => {
  const response = await worker.fetch(
    new Request('https://worker.example/auth?provider=github&site_id=evil.example&scope=repo'),
    env,
  );
  assert.equal(response.status, 400);
  assert.equal(response.headers.get('location'), null);
});

test('accepts the Sveltia auth query and binds each configured site_id to HTTPS', async () => {
  for (const [siteId, origin] of [
    ['landingpagebufalo.vercel.app', 'https://landingpagebufalo.vercel.app'],
    ['marcabufalo.com.br', 'https://marcabufalo.com.br'],
    ['www.marcabufalo.com.br', 'https://www.marcabufalo.com.br'],
  ]) {
    const response = await worker.fetch(
      new Request(`https://worker.example/auth?provider=github&site_id=${siteId}&scope=repo`),
      env,
    );
    assert.equal(response.status, 302);
    assert.match(response.headers.get('set-cookie'), /^oauth_state=/);

    const state = new URL(response.headers.get('location')).searchParams.get('state');
    const cookie = response.headers.get('set-cookie').match(/oauth_state=([^;]+)/)[1];
    assert.ok(state);
    assert.equal(JSON.parse(Buffer.from(cookie.split('.')[0], 'base64url')).origin, origin);
  }
});

test('rejects schemes, paths, userinfo, ports, subdomains, and lookalike site_ids', async () => {
  for (const siteId of [
    'http://marcabufalo.com.br',
    'https://marcabufalo.com.br',
    'marcabufalo.com.br/path',
    'user@marcabufalo.com.br',
    'marcabufalo.com.br:443',
    'marcabufalo.com.br.evil.example',
  ]) {
    const response = await worker.fetch(
      new Request(`https://worker.example/auth?provider=github&site_id=${encodeURIComponent(siteId)}&scope=repo`),
      env,
    );
    assert.equal(response.status, 400);
  }
});

test('clears the cookie for an invalid state without calling GitHub', async () => {
  const originalFetch = globalThis.fetch;
  let githubCalls = 0;

  globalThis.fetch = async () => {
    githubCalls += 1;
    throw new Error('GitHub exchange must not run for invalid state');
  };
  try {
    const { state, cookie } = await startAuth('marcabufalo.com.br');
    const tampered = `${cookie[0] === 'A' ? 'B' : 'A'}${cookie.slice(1)}`;
    assert.notEqual(tampered, cookie);
    const response = await worker.fetch(
      new Request(`https://worker.example/callback?code=abc&state=${state}`, {
        headers: { Cookie: `oauth_state=${tampered}` },
      }),
      env,
    );

    assert.equal(response.status, 400);
    assert.match(await response.text(), /invalid_state/);
    assert.equal(githubCalls, 0);
    assertCookieCleared(response);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects an expired signed state before calling GitHub and clears the cookie', async () => {
  const originalNow = Date.now;
  const originalFetch = globalThis.fetch;
  const createdAt = 1_700_000_000_000;
  let githubCalled = false;

  Date.now = () => createdAt;
  try {
    const { state, cookie } = await startAuth('marcabufalo.com.br');

    Date.now = () => createdAt + 601_000;
    globalThis.fetch = async () => {
      githubCalled = true;
      throw new Error('GitHub exchange must not run for expired state');
    };
    const response = await worker.fetch(
      new Request(`https://worker.example/callback?code=abc&state=${state}`, {
        headers: { Cookie: `oauth_state=${cookie}` },
      }),
      env,
    );

    assert.equal(response.status, 400);
    assert.match(await response.text(), /invalid_state/);
    assert.equal(githubCalled, false);
    assertCookieCleared(response);
  } finally {
    Date.now = originalNow;
    globalThis.fetch = originalFetch;
  }
});

test('clears the cookie for an access_denied OAuth callback', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('GitHub exchange must not run for an OAuth error');
  };
  try {
    const { state, cookie } = await startAuth('marcabufalo.com.br');
    const response = await worker.fetch(
      new Request(`https://worker.example/callback?error=access_denied&state=${state}`, {
        headers: { Cookie: `oauth_state=${cookie}` },
      }),
      env,
    );

    assert.equal(response.status, 200);
    assert.match(await response.text(), /authorization_denied/);
    assertCookieCleared(response);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('clears the cookie when GitHub rejects the verification code', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: 'bad_verification_code' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  try {
    const { state, cookie } = await startAuth('marcabufalo.com.br');
    const response = await worker.fetch(
      new Request(`https://worker.example/callback?code=abc&state=${state}`, {
        headers: { Cookie: `oauth_state=${cookie}` },
      }),
      env,
    );

    assert.equal(response.status, 200);
    assert.match(await response.text(), /token_exchange_failed/);
    assertCookieCleared(response);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('clears the cookie after GitHub returns an access token', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ access_token: 'sensitive-token' }), {
      headers: { 'Content-Type': 'application/json' },
  });
  try {
    const { state, cookie } = await startAuth('marcabufalo.com.br');

    const callback = await worker.fetch(
      new Request(`https://worker.example/callback?code=abc&state=${state}`, {
        headers: { Cookie: `oauth_state=${cookie}` },
      }),
      env,
    );
    const html = await callback.text();
    assert.match(html, /sensitive-token/);
    assert.match(html, /https:\/\/marcabufalo\.com\.br/);
    assert.doesNotMatch(html, /postMessage\([^)]*,\s*['\"]\*['\"]\)/);
    assert.doesNotMatch(html, /postMessage\([^)]*,\s*e\.origin\)/);
    assertCookieCleared(callback);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('does not interpolate an untrusted OAuth error into the callback script', async () => {
  const auth = await worker.fetch(
    new Request('https://worker.example/auth?provider=github&site_id=marcabufalo.com.br&scope=repo'),
    env,
  );
  const state = new URL(auth.headers.get('location')).searchParams.get('state');
  const cookie = auth.headers.get('set-cookie').match(/oauth_state=([^;]+)/)[1];
  const injectedError = '</script><script>globalThis.pwned=true</script>';

  const callback = await worker.fetch(
    new Request(
      `https://worker.example/callback?error=${encodeURIComponent(injectedError)}&state=${state}`,
      { headers: { Cookie: `oauth_state=${cookie}` } },
    ),
    env,
  );
  const html = await callback.text();

  assert.match(html, /authorization_denied/);
  assert.doesNotMatch(html, /globalThis\.pwned/);
  assert.doesNotMatch(html, /<\/script><script>/);
});

test('fails closed and clears a malformed state cookie', async () => {
  const response = await worker.fetch(
    new Request('https://worker.example/callback?code=abc&state=state', {
      headers: { Cookie: 'oauth_state=%' },
    }),
    env,
  );

  assert.equal(response.status, 400);
  assert.match(await response.text(), /invalid_state/);
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
});
