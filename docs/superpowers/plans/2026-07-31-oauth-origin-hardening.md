# OAuth Origin Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Impedir que origins externos recebam o token GitHub do Sveltia CMS, mantendo o painel atual e o futuro domínio final autorizados.

**Architecture:** O Worker valida o origin recebido em `/auth?origin=...` contra uma allowlist pública. Ele assina `state`, origin e expiração em cookie HMAC com Web Crypto; no callback, valida assinatura/expiração/state antes da troca com GitHub e gera HTML cujo listener e `targetOrigin` aceitam somente o origin vinculado. Testes Node exercitam o handler real com o fetch externo mockado apenas na fronteira GitHub.

**Tech Stack:** Cloudflare Worker JavaScript ESM, Web Crypto API, Node.js `node:test`, Astro 7, Playwright.

## Global Constraints

- Origins autorizados exatamente: `https://landingpagebufalo.vercel.app` e `https://marcabufalo.com.br`.
- Comparação por origin exato; rejeitar HTTP, subdomínios e hosts parecidos.
- Manter validação de `state`; cookie `HttpOnly; Secure; SameSite=Lax`.
- Usar secret Cloudflare `OAUTH_STATE_SECRET`; nenhum segredo no repositório ou logs.
- Nenhuma dependência nova.
- Nunca enviar token com `targetOrigin="*"` ou origin fornecido por remetente não validado.
- Regra CLAUDE.md: `npm run build` e `npm run test:smoke` devem passar antes de commit.
- Não alterar layout, conteúdo, preço ou helpers de WhatsApp.
- Desenvolvimento em branch `codex/oauth-origin-hardening`, nunca diretamente em main.

## Estrutura de arquivos

- Modify: `infra/sveltia-auth-worker/index.js` — handler OAuth, allowlist, cookie assinado e HTML seguro.
- Modify: `infra/sveltia-auth-worker/wrangler.toml` — variável pública `CMS_ALLOWED_ORIGINS` e documentação de `OAUTH_STATE_SECRET`.
- Create: `infra/sveltia-auth-worker/index.test.js` — regressões de origin, state, cookie e destinatário do token.
- Remove from Git index: `test-results/.last-run.json` — estado efêmero do Playwright; arquivo local preservado.
- Modify: `.gitignore` — mantém `.code-review-fable5/` ignorado, já necessário para os relatórios locais.

---

### Task 1: Proteger o fluxo OAuth por origin e state assinado

**Files:**
- Modify: `infra/sveltia-auth-worker/index.js:1-108`
- Modify: `infra/sveltia-auth-worker/wrangler.toml:1-7`
- Create: `infra/sveltia-auth-worker/index.test.js`

**Interfaces:**
- Consumes: bindings `GITHUB_CLIENT_ID: string`, `GITHUB_CLIENT_SECRET: string`, `OAUTH_STATE_SECRET: string`, `CMS_ALLOWED_ORIGINS: string`.
- Produces: default export `{ fetch(request: Request, env: Env): Promise<Response> }`.
- Produces internamente: `parseAllowedOrigins(value: string): Set<string>`, `normalizeAllowedOrigin(value: string, allowed: Set<string>): string | null`, `createStateCookie(state: string, origin: string, secret: string, now?: number): Promise<string>`, `verifyStateCookie(cookie: string, state: string, secret: string, now?: number): Promise<{origin: string} | null>`, `postToOpener(status: string, data: object, allowedOrigin: string): Response`.
- Cookie payload: JSON `{ "state": string, "origin": string, "exp": number }`, codificado em base64url e acompanhado de assinatura HMAC-SHA-256 base64url como `<payload>.<signature>`.

- [ ] **Step 1: Escrever os testes de regressão que falham**

Criar testes Node com Arrange→Act→Assert:

```js
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
    assert.match(html, /https:\\/\\/marcabufalo\\.com\\.br/);
    assert.doesNotMatch(html, /postMessage\([^)]*,\s*['"]\*['"]\)/);
    assert.doesNotMatch(html, /postMessage\([^)]*,\s*e\.origin\)/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
```

- [ ] **Step 2: Executar RED**

Run: `node --test infra/sveltia-auth-worker/index.test.js`

Expected: FAIL nos testes de `/auth?origin` porque o Worker atual redireciona origins não autorizados e o cookie atual não é assinado/vinculado ao origin.

- [ ] **Step 3: Implementar allowlist e cookie HMAC mínimos**

Em `wrangler.toml`, adicionar:

```toml
[vars]
CMS_ALLOWED_ORIGINS = "https://landingpagebufalo.vercel.app,https://marcabufalo.com.br"

# Secret adicional:
#   OAUTH_STATE_SECRET
```

Em `index.js`:

1. Validar bindings obrigatórios sem expor valores.
2. Em `/auth`, normalizar `url.searchParams.get('origin')` por `new URL(value).origin`, exigir igualdade entre entrada e origin normalizado, HTTPS e presença exata no Set configurado.
3. Gerar payload com expiração de 10 minutos, assinar com `crypto.subtle.importKey` + `crypto.subtle.sign('HMAC', ...)`, e gravar `oauth_state=<payload>.<signature>`.
4. Em `/callback`, verificar HMAC por `crypto.subtle.verify`, expiração e igualdade de state antes de chamar o endpoint GitHub.
5. Passar o origin validado para todas as respostas `postToOpener`.
6. No HTML, ignorar eventos cujo `e.origin !== allowedOrigin` e usar o origin serializado como `targetOrigin`.
7. No OPTIONS, retornar `Access-Control-Allow-Origin` somente quando o header `Origin` estiver na allowlist; para outros origins, retornar 403 sem CORS.
8. Manter mensagens públicas genéricas e limpar o cookie no callback.

- [ ] **Step 4: Executar GREEN e checks locais do Worker**

Run: `node --test infra/sveltia-auth-worker/index.test.js && node --check infra/sveltia-auth-worker/index.js`

Expected: 5 testes PASS; `node --check` exit 0.

- [ ] **Step 5: Commit da tarefa**

Run:
```bash
git add infra/sveltia-auth-worker/index.js infra/sveltia-auth-worker/index.test.js infra/sveltia-auth-worker/wrangler.toml
git commit -m "fix(cms): restringir origin do OAuth"
```

Expected: commit contendo somente os três arquivos da tarefa.

### Task 2: Remover estado efêmero do Playwright do índice

**Files:**
- Remove from Git index: `test-results/.last-run.json`
- Verify: `.gitignore:13`

**Interfaces:**
- Consumes: regra existente `test-results/` em `.gitignore`.
- Produces: nenhum arquivo de runtime; elimina o artefato rastreado sem apagar a cópia local.

- [ ] **Step 1: Provar o estado inicial**

Run: `git ls-files --error-unmatch test-results/.last-run.json`

Expected: exit 0, provando que o arquivo está rastreado.

- [ ] **Step 2: Remover apenas do índice**

Run: `git rm --cached test-results/.last-run.json`

Expected: arquivo marcado como deletado no índice e ainda existente no filesystem.

- [ ] **Step 3: Verificar ignore e preservação local**

Run: `git check-ignore -v test-results/.last-run.json && test -f test-results/.last-run.json`

Expected: a regra `test-results/` é exibida e ambos os comandos retornam exit 0.

- [ ] **Step 4: Commit da tarefa**

Run:
```bash
git add .gitignore
git commit -m "chore: remover estado do Playwright do índice"
```

Expected: commit remove somente `test-results/.last-run.json` do repositório e inclui a regra local `.code-review-fable5/` se ainda não commitada.

## Verificação integrada

- [ ] Run: `node --test infra/sveltia-auth-worker/index.test.js` — Expected: todos PASS.
- [ ] Run: `node --check infra/sveltia-auth-worker/index.js` — Expected: exit 0.
- [ ] Run: `npm run build` — Expected: 32 páginas e exit 0.
- [ ] Run: `npm run test:content` — Expected: mensagem final OK e exit 0.
- [ ] Iniciar `npm run preview -- --host 127.0.0.1`, então run `npm run test:smoke` — Expected: 9 passed.
- [ ] Run: `git diff --check` e `git status --short` — Expected: nenhum erro de whitespace; apenas alterações deliberadas.
- [ ] Secret scan no escopo — Expected: nenhum valor real de token/secret; apenas nomes de bindings e fixtures obviamente falsas.

## Auto-revisão do plano

- **Cobertura da especificação:** origin atual/futuro, comparação exata, HMAC, state, erros, CORS, testes e limpeza do índice mapeados às Tasks 1–2; lacunas encontradas: nenhuma.
- **Varredura de placeholders:** nenhum TBD/TODO, “implementar depois” ou etapa sem comportamento concreto.
- **Consistência de interfaces:** bindings, nomes dos helpers, formato do cookie e assinatura do handler são idênticos em testes e implementação planejada.
- **Estados comitados independentes:** Task 1 entrega a correção testada; Task 2 entrega apenas higiene do repositório.

