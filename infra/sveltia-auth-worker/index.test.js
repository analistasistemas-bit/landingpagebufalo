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

test('rejects an untrusted origin before redirecting to GitHub', async () => {
  const response = await worker.fetch(
    new Request('https://worker.example/auth?origin=https://evil.example'),
    env,
  );
  assert.equal(response.status, 400);
  assert.equal(response.headers.get('location'), null);
});

test('accepts each configured exact HTTPS origin', async () => {
  for (const origin of [
    'https://landingpagebufalo.vercel.app',
    'https://marcabufalo.com.br',
  ]) {
    const response = await worker.fetch(
      new Request(`https://worker.example/auth?origin=${encodeURIComponent(origin)}`),
      env,
    );
    assert.equal(response.status, 302);
    assert.match(response.headers.get('set-cookie'), /^oauth_state=/);
  }
});

test('rejects HTTP, subdomain, and lookalike origins', async () => {
  for (const origin of [
    'http://marcabufalo.com.br',
    'https://www.marcabufalo.com.br',
    'https://marcabufalo.com.br.evil.example',
  ]) {
    const response = await worker.fetch(
      new Request(`https://worker.example/auth?origin=${encodeURIComponent(origin)}`),
      env,
    );
    assert.equal(response.status, 400);
  }
});

test('rejects a tampered signed state cookie before GitHub exchange', async () => {
  const auth = await worker.fetch(
    new Request('https://worker.example/auth?origin=https%3A%2F%2Fmarcabufalo.com.br'),
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

test('posts a successful token only to the origin bound to state', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ access_token: 'sensitive-token' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  try {
    const origin = 'https://marcabufalo.com.br';
    const auth = await worker.fetch(
      new Request(`https://worker.example/auth?origin=${encodeURIComponent(origin)}`),
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
