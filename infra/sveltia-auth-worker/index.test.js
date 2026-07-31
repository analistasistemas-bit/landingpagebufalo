import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.js';

const env = {
  GITHUB_CLIENT_ID: 'client',
  GITHUB_CLIENT_SECRET: 'client-secret',
  OAUTH_STATE_SECRET: 'test-state-secret-with-at-least-32-bytes',
  CMS_ALLOWED_ORIGINS:
    'https://landingpagebufalo.vercel.app,https://marcabufalo.com.br',
};

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
    'www.marcabufalo.com.br',
    'marcabufalo.com.br.evil.example',
  ]) {
    const response = await worker.fetch(
      new Request(`https://worker.example/auth?provider=github&site_id=${encodeURIComponent(siteId)}&scope=repo`),
      env,
    );
    assert.equal(response.status, 400);
  }
});

test('rejects a tampered signed state cookie before GitHub exchange', async () => {
  const auth = await worker.fetch(
    new Request('https://worker.example/auth?provider=github&site_id=marcabufalo.com.br&scope=repo'),
    env,
  );
  const location = new URL(auth.headers.get('location'));
  const state = location.searchParams.get('state');
  const cookie = auth.headers.get('set-cookie').match(/oauth_state=([^;]+)/)[1];
  const tampered = cookie.slice(0, -1) + (cookie.endsWith('A') ? 'B' : 'A');

  const response = await worker.fetch(
    new Request(`https://worker.example/callback?code=abc&state=${state}`, {
      headers: { Cookie: `oauth_state=${tampered}` },
    }),
    env,
  );
  assert.match(await response.text(), /invalid_state/);
});

test('rejects an expired signed state before calling GitHub and clears the cookie', async () => {
  const originalNow = Date.now;
  const originalFetch = globalThis.fetch;
  const createdAt = 1_700_000_000_000;
  let githubCalled = false;

  Date.now = () => createdAt;
  try {
    const auth = await worker.fetch(
      new Request('https://worker.example/auth?provider=github&site_id=marcabufalo.com.br&scope=repo'),
      env,
    );
    const state = new URL(auth.headers.get('location')).searchParams.get('state');
    const cookie = auth.headers.get('set-cookie').match(/oauth_state=([^;]+)/)[1];

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
    assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
  } finally {
    Date.now = originalNow;
    globalThis.fetch = originalFetch;
  }
});

test('posts a successful token only to the origin bound to state', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ access_token: 'sensitive-token' }), {
      headers: { 'Content-Type': 'application/json' },
  });
  try {
    const auth = await worker.fetch(
      new Request('https://worker.example/auth?provider=github&site_id=marcabufalo.com.br&scope=repo'),
      env,
    );
    const location = new URL(auth.headers.get('location'));
    const state = location.searchParams.get('state');
    const cookie = auth.headers.get('set-cookie').match(/oauth_state=([^;]+)/)[1];

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
