# OAuth WWW, CORS e Cookie Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Autorizar o CMS nos domínios principal e `www`, fechar a cobertura de CORS e provar que o cookie OAuth é removido em todo callback terminal.

**Architecture:** Ampliar somente a allowlist pública em `wrangler.toml`; o handler existente continua derivando HTTPS exato de `site_id` e usando o origin assinado. A suíte Node recebe tabelas para origins/CORS e helpers de teste locais para criar callback válido sem duplicar preparação.

**Tech Stack:** Cloudflare Worker JavaScript ESM, Node.js `node:test`, Web Crypto, Wrangler.

## Global Constraints

- Origins autorizados exatamente: `https://landingpagebufalo.vercel.app`, `https://marcabufalo.com.br` e `https://www.marcabufalo.com.br`.
- Outros subdomínios, HTTP, paths, userinfo, portas e lookalikes permanecem rejeitados.
- CORS autorizado reflete somente o origin exato; origin ausente ou não autorizado retorna 403 sem `Access-Control-Allow-Origin`.
- Todo callback terminal limpa `oauth_state` com `Max-Age=0`.
- State inválido ou expirado nunca chama o GitHub.
- Nenhuma dependência nova, nenhum segredo no código e nenhuma alteração na landing page.
- Comandos shell devem usar prefixo `rtk`, exceto quando o wrapper impedir deliberadamente o fluxo testado.
- Antes do deploy: Worker tests, sintaxe, build, conteúdo e smoke verdes.

---

### Task 1: Ampliar allowlist e fechar matriz de regressão OAuth

**Files:**
- Modify: `infra/sveltia-auth-worker/wrangler.toml:6`
- Modify: `infra/sveltia-auth-worker/index.test.js`
- Verify only: `infra/sveltia-auth-worker/index.js`

**Interfaces:**
- Consumes: `worker.fetch(request: Request, env: object): Promise<Response>`.
- Produces: `CMS_ALLOWED_ORIGINS` com três origins separados por vírgula.
- Test helper local: `startAuth(siteId: string, testEnv = env): Promise<{ state: string, cookie: string }>`.
- Test helper local: `assertCookieCleared(response: Response): void`.

- [ ] **Step 1: Escrever RED para o domínio www**

Atualizar a fixture `env.CMS_ALLOWED_ORIGINS` para incluir `https://www.marcabufalo.com.br`, adicionar `['www.marcabufalo.com.br', 'https://www.marcabufalo.com.br']` à tabela de origins aceitos e remover `www.marcabufalo.com.br` da tabela rejeitada. Não alterar ainda `wrangler.toml`.

- [ ] **Step 2: Executar RED de configuração**

Run: `rtk node --test infra/sveltia-auth-worker/index.test.js && rtk proxy rg -F 'https://www.marcabufalo.com.br' infra/sveltia-auth-worker/wrangler.toml`

Expected: testes Node passam com a fixture, mas o segundo comando falha por ausência do origin na configuração publicada, provando a divergência.

- [ ] **Step 3: Escrever testes CORS**

Adicionar teste de tabela que chama `OPTIONS /auth` com header `Origin` para os três origins e afirma status 200, ACAO idêntico e métodos `GET, OPTIONS`. Adicionar teste para origin ausente, `https://evil.example`, HTTP e subdomínio não listado, afirmando status 403 e ACAO nulo.

- [ ] **Step 4: Escrever testes de limpeza do cookie**

Extrair apenas nos testes:

```js
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
```

Cobrir separadamente:

1. state inválido;
2. state expirado;
3. `error=access_denied`;
4. GitHub retorna `{ error: 'bad_verification_code' }`;
5. GitHub retorna `{ access_token: 'sensitive-token' }`.

Em state inválido/expirado, afirmar contador GitHub igual a zero. Nos demais, mockar somente `globalThis.fetch` e restaurar em `finally`.

- [ ] **Step 5: Executar testes antes da configuração**

Run: `rtk node --test infra/sveltia-auth-worker/index.test.js`

Expected: todos os testes de comportamento passam; qualquer falha revela lacuna real no handler e deve ser corrigida por teste RED→GREEN mínimo em `index.js` antes de continuar.

- [ ] **Step 6: Atualizar allowlist publicada**

Em `wrangler.toml`:

```toml
CMS_ALLOWED_ORIGINS = "https://landingpagebufalo.vercel.app,https://marcabufalo.com.br,https://www.marcabufalo.com.br"
```

- [ ] **Step 7: Executar GREEN completo**

Run:

```bash
rtk node --test infra/sveltia-auth-worker/index.test.js
rtk node --check infra/sveltia-auth-worker/index.js
rtk npm run build
rtk npm run test:content
rtk git diff --check
```

Expected: todos exit 0; build gera 32 páginas.

- [ ] **Step 8: Executar smoke**

Iniciar `rtk npm run preview -- --host 127.0.0.1`; em outro processo executar `rtk npm run test:smoke`; encerrar o preview.

Expected: 9 passed.

- [ ] **Step 9: Commit**

Run:

```bash
rtk git add infra/sveltia-auth-worker/index.test.js infra/sveltia-auth-worker/wrangler.toml
rtk git commit -m "test(cms): cobrir CORS e limpeza OAuth"
```

Expected: commit contém somente teste e configuração, salvo se um teste RED provar correção mínima necessária no handler.

- [ ] **Step 10: Deploy e validação de produção**

Run: `rtk npx wrangler deploy`.

Validar:

- `site_id=www.marcabufalo.com.br` retorna 302;
- preflight com `Origin: https://www.marcabufalo.com.br` retorna 200 e ACAO exato;
- preflight malicioso retorna 403 sem ACAO;
- callback com cookie malformado retorna 400 e `Set-Cookie: oauth_state=...Max-Age=0`.

Não seguir o redirecionamento GitHub e não imprimir cookies ou tokens.

## Auto-revisão do plano

- **Cobertura da especificação:** www, CORS autorizado/negado, cinco callbacks terminais, não chamada ao GitHub, regressões locais, deploy e produção mapeados à Task 1; lacunas: nenhuma.
- **Placeholder scan:** nenhum marcador pendente ou etapa genérica.
- **Consistência:** os três origins, helpers, cabeçalhos e comandos usam os mesmos nomes em todo o plano.
- **Escopo:** uma única tarefa é adequada porque teste, configuração e deploy formam um estado indivisível e revisável.

