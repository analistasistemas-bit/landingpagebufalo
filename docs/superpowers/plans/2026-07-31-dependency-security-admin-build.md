# Dependency Security and Admin Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar as cinco vulnerabilidades altas e o aviso de conflito de `/admin`, preservando o painel e o comportamento público da landing page.

**Architecture:** Atualizar somente a árvore compatível indicada pelo npm, sem `--force` ou troca de versão principal. Remover o redirecionamento que conflita com o arquivo estático do painel e verificar segurança, artefato de build e regressões com os testes existentes.

**Tech Stack:** Node.js, npm, Astro 7, Playwright e Cloudflare Pages/static hosting.

## Global Constraints

- Eliminar todas as vulnerabilidades altas sem usar `npm audit fix --force`.
- Preservar a versão principal atual do Astro e o comportamento da landing page.
- Não usar `overrides`, mudanças de versão principal ou `--force`.
- O caminho canônico do painel permanece `/admin/`.

---

## Estrutura de arquivos

- `package.json`: mantém as faixas declaradas das dependências diretas, pois `^7.0.2` já aceita a versão corrigida do Astro.
- `package-lock.json`: fixa a árvore corrigida de Astro, Sharp, js-yaml, PostCSS, SVGO e dependências transitivas.
- `astro.config.mjs`: deixa de declarar o redirecionamento redundante de `/admin`.
- `public/admin/index.html`: permanece inalterado como origem estática do painel.

### Task 1: Atualizar a árvore de dependências vulnerável

**Files:**
- Verify unchanged: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: registro npm e a faixa direta `astro: ^7.0.2`.
- Produces: instalação compatível com Astro 7.1.6 ou superior dentro da versão principal 7 e zero vulnerabilidades altas.

- [ ] **Step 1: Registrar a falha de segurança atual**

Run: `rtk npm audit`

Expected: FAIL/non-zero com `5 high severity vulnerabilities` e ocorrências de `astro`, `sharp`, `js-yaml`, `postcss` e `svgo`.

- [ ] **Step 2: Aplicar a correção compatível**

Run: `rtk npm audit fix`

Expected: Astro atualizado de 7.0.2 para 7.1.6, Sharp para 0.35.3, js-yaml para 4.3.0, PostCSS para 8.5.25 e SVGO para 4.0.2, sem solicitar `--force`.

- [ ] **Step 3: Verificar a árvore instalada**

Run: `rtk npm ls astro sharp js-yaml postcss svgo`

Expected: comando aprovado, sem `invalid` ou `extraneous`, e nenhuma versão dentro das faixas vulneráveis registradas no diagnóstico.

- [ ] **Step 4: Verificar a correção de segurança**

Run: `rtk npm audit`

Expected: PASS com `found 0 vulnerabilities`.

- [ ] **Step 5: Commit da atualização de segurança**

```bash
rtk git add package-lock.json
rtk git commit -m "fix: atualizar dependencias vulneraveis"
```

### Task 2: Remover o conflito de geração do painel administrativo

**Files:**
- Modify: `astro.config.mjs`
- Verify unchanged: `public/admin/index.html`

**Interfaces:**
- Consumes: `public/admin/index.html` como origem do painel estático.
- Produces: `dist/admin/index.html` sem rota de redirecionamento concorrente.

- [ ] **Step 1: Reproduzir o aviso atual**

Run: `rtk npm run build`

Expected: build aprovado, mas com aviso informando conflito ou impossibilidade de gerar a rota `/admin`.

- [ ] **Step 2: Remover a configuração redundante**

Substituir em `astro.config.mjs`:

```js
  redirects: {
    '/admin': '/admin/index.html',
  },
```

por nenhum bloco `redirects`, mantendo:

```js
export default defineConfig({
  site: 'https://landingpagebufalo.vercel.app',
  integrations: [sitemap()],
  devToolbar: { enabled: false }, // sem a barra de dev (evita confusão no preview local)
});
```

- [ ] **Step 3: Verificar build e ausência do aviso**

Run: `rtk npm run build`

Expected: PASS, 32 páginas geradas e nenhuma mensagem de conflito referente a `/admin`.

- [ ] **Step 4: Verificar o artefato administrativo**

Run: `rtk proxy test -s dist/admin/index.html && rtk grep -n "noindex\|Sveltia\|admin" dist/admin/index.html`

Expected: PASS; o arquivo existe, não está vazio e contém a identificação ou proteção esperada do painel.

- [ ] **Step 5: Executar os testes de regressão**

Run: `rtk npm run test:content`

Expected: PASS com `OK — build não quebrou com listas de tamanho reduzido.`

Run: `rtk npm run test:smoke`

Expected: PASS com 9 testes aprovados.

- [ ] **Step 6: Commit da correção do build**

```bash
rtk git add astro.config.mjs
rtk git commit -m "fix: remover redirecionamento redundante do admin"
```

### Task 3: Verificação final do escopo

**Files:**
- Verify: `package.json`
- Verify: `package-lock.json`
- Verify: `astro.config.mjs`
- Verify: `public/admin/index.html`

**Interfaces:**
- Consumes: entregáveis das Tasks 1 e 2.
- Produces: evidência final de segurança, build e testes sem regressões.

- [ ] **Step 1: Reexecutar os critérios obrigatórios**

Run: `rtk npm audit && rtk npm run build`

Expected: zero vulnerabilidades; build aprovado e sem aviso de `/admin`.

- [ ] **Step 2: Confirmar que o painel-fonte não mudou**

Run: `rtk git diff HEAD~2 -- public/admin/index.html`

Expected: saída vazia.

- [ ] **Step 3: Revisar o escopo do diff**

Run: `rtk git status --short && rtk git diff HEAD~2 --stat`

Expected: worktree limpo; somente `package-lock.json` e `astro.config.mjs` alterados pelos commits de implementação.
