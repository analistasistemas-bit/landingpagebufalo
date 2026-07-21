# Code Review — Landing Page Búfalo (v1)

**Data:** 2026-07-21 · **Modo:** varredura de codebase completo (sem diff pendente — ver nota abaixo) · **Escopo:** `src/` (24 arquivos), `scripts/` (Python), `infra/sveltia-auth-worker/`, `public/admin/`, config raiz
**Stack detectada:** Astro 7 (SSG estático) + TypeScript, Content Collections (zod), Sveltia CMS (GitHub backend), Cloudflare Worker (OAuth), Playwright (smoke), Python 3 + openpyxl (build de dados)
**Regras de projeto:** CLAUDE.md lido (raiz) ✅ · `learnings.md` não existe (nenhum aprendizado prévio registrado) · `AGENTS.md` não existe

> **Nota de escopo:** não havia diff staged/unstaged nem divergência de `main` com `origin/main` no momento da varredura — só arquivos não rastreados (duplicatas tipo `package 2.json`, `astro.config 2.mjs`, logos, PDFs, provavelmente resíduo de cópia de pasta). Por decisão do usuário, a revisão cobriu o **codebase completo como está hoje**, ignorando essas duplicatas "2" como lixo (ver Ruído suprimido).

## 🧭 Walkthrough

O projeto é uma landing page estática em Astro para a marca Búfalo (linhas de costura/aviamentos), com conteúdo editável via Sveltia CMS (painel `/admin`, backend GitHub, OAuth via Worker Cloudflare próprio) e deploy automático na Vercel. Arquitetura é limpa e coerente: páginas lêem texto de `src/content/paginas/*.json` (schema zod 100% opcional, documentado como "o build não quebra se um campo faltar"), dados de produto/categoria vêm de JSONs planos gerados originalmente por um script Python a partir de uma planilha Excel, e todo link de WhatsApp passa por um helper central (`whatsapp.ts`) — bem seguido em praticamente todo o código.

Pontos bem feitos: zero uso de preço/valor monetário em qualquer página (regra inviolável do CLAUDE.md — confirmado por grep e pelo próprio smoke test), `npm run build` roda limpo (32 páginas geradas, sem erros/warnings), fallback de imagem em cascata (`onerror`) para os 53/74 produtos que ainda não têm foto profissional (consistente com a tabela "itens aguardando confirmação do cliente"), acessibilidade cuidada (`prefers-reduced-motion`, `aria-label`, `role="list"`, foco visível), e nenhum segredo hardcoded — o Worker de OAuth só referencia `env.GITHUB_CLIENT_SECRET` via `wrangler secret put`, nunca em texto puro.

O risco principal encontrado é estrutural, não de segurança: duas páginas de conteúdo acessam listas editáveis pelo CMS por **índice fixo** (`c.valores![0]`...`[4]`, `c.blocos![0]`...`[3]`) em vez de iterar o array. Como o CMS permite ao cliente adicionar/remover itens dessas listas livremente, isso contradiz o invariante documentado no próprio CLAUDE.md de que "o build não quebra se um campo faltar" — aqui, quebra. Também achei o script `build_data.py` desatualizado (asserts para 8 categorias/31 produtos, catálogo real já tem 24/74) e um gap de proteção CSRF no fluxo OAuth do Worker.

## 📊 Scorecard

| Camada | Peso | Nota | Justificativa |
|---|---|---|---|
| Segurança | 30% | 70 | Nenhum segredo exposto, sem SQL/command injection, sem preço vazado. 1 achado MÉDIA: `state` do OAuth (`infra/sveltia-auth-worker/index.js:25,34`) é gerado mas nunca validado no callback. |
| Corretude | 30% | 45 | 1 ALTA em código de produção (índice fixo em listas editáveis, `a-marca.astro`/`qualidade.astro`) + 1 ALTA em script auxiliar (`build_data.py`, peso reduzido) + achados MÉDIA de número de WhatsApp hardcoded fora do helper único. |
| Testes | 15% | 65 | Smoke test (`tests/smoke.spec.ts`) rodou e passou 9/9 (confirmado após instalar o browser do Playwright — ver nota). Cobre bem o essencial (h1 único, sem preço, alt em imagens, link WhatsApp), mas não cobre a fragilidade de schema/CMS encontrada nem o texto exibido do número de WhatsApp. |
| Contratos & Migrações | 15% | 55 | `config.yml` do CMS bate com `content.config.ts` campo a campo (verificado). Mas o contrato "lista de tamanho livre no CMS" vs. "template espera N itens fixos" está quebrado, e o script gerador de dados ficou dessincronizado do catálogo atual (24 categorias/74 produtos vs. asserts de 8/31). |
| Performance & Manutenção | 10% | 75 | Duplicação BAIXA: array `navLinks` e SVG do ícone do WhatsApp repetidos em 3 componentes. Sem N+1, sem I/O em loop (tudo é build-time). |

**Score final: 60/100 → ⚠️ APROVAR COM RESSALVAS**

**Condições:**
1. Corrigir o acesso por índice fixo em `a-marca.astro` e `qualidade.astro` antes que o cliente edite as listas "Valores"/"Blocos" pelo painel (vai quebrar o build/deploy).
2. Atualizar (ou remover) os asserts obsoletos de `scripts/build_data.py` antes de reutilizá-lo com uma planilha nova do cliente.

## 🔍 Achados

### Críticos
Nenhum.

### Altos

#### [ALTA] src/pages/a-marca.astro:65,76,88,103,115 — acesso por índice fixo em lista editável pelo CMS quebra o build se o item for removido
**Problema:** `c.valores` é um `z.array(...).optional()` em `content.config.ts:38-45` e é editado no painel via `widget: list` (`public/admin/config.yml:47-54`), que permite ao cliente adicionar, remover ou reordenar itens livremente. O template assume exatamente 5 itens e acessa `c.valores![0]` até `c.valores![4]` diretamente. Se o cliente apagar um item (ficando com 4), `c.valores![4]` é `undefined` e `.nome`/`.desc` lança `TypeError: Cannot read properties of undefined` — em build estático isso derruba o build inteiro (todas as páginas), não só a página A Marca.
**Impacto:** o cliente edita a lista "Valores" pelo painel achando que é seguro (é um CRUD livre no CMS), o próximo deploy na Vercel falha e o site inteiro para de atualizar, sem aviso óbvio do porquê.
**Fix sugerido:**
```diff
-          <li class="valores__item">
-            ...
-            <strong class="valores__nome">{c.valores![0].nome}</strong>
-            <span class="valores__desc">{c.valores![0].desc}</span>
-          </li>
-          <li class="valores__item">
-            ...
-            <strong class="valores__nome">{c.valores![1].nome}</strong>
-            <span class="valores__desc">{c.valores![1].desc}</span>
-          </li>
-          ... (repetido para [2], [3], [4])
+          {(c.valores ?? []).map((valor, i) => (
+            <li class="valores__item">
+              <span class="valores__icon" aria-hidden="true">{ICONES[i % ICONES.length]}</span>
+              <strong class="valores__nome">{valor.nome}</strong>
+              <span class="valores__desc">{valor.desc}</span>
+            </li>
+          ))}
```
Extrair os 5 SVGs de ícone para um array `ICONES` indexado por posição (com fallback cíclico ou um ícone genérico), e iterar com `.map()` como já é feito em `qualidade.astro` para `aplicacoes`.

#### [ALTA] src/pages/qualidade.astro:39,58,76,93 — mesmo padrão de índice fixo em `c.blocos`
**Problema:** idêntico ao achado acima — `c.blocos` é lista opcional editável (`widget: list`, `public/admin/config.yml:67-74`), acessada via `c.blocos![0]` a `c.blocos![3]`. Note que a mesma página já usa `.map()` corretamente para `c.aplicacoes` (linha 110) — é só `blocos` que ficou com o padrão antigo.
**Impacto:** mesmo risco de quebra de build inteiro se o cliente remover um "bloco de qualidade" pelo painel.
**Fix sugerido:**
```diff
-        <li class="diferenciais__item">...c.blocos![0]...</li>
-        <li class="diferenciais__item">...c.blocos![1]...</li>
-        <li class="diferenciais__item">...c.blocos![2]...</li>
-        <li class="diferenciais__item">...c.blocos![3]...</li>
+        {(c.blocos ?? []).map((bloco, i) => (
+          <li class="diferenciais__item">
+            <span class="diferenciais__icon" aria-hidden="true">{ICONES[i % ICONES.length]}</span>
+            <h2 class="diferenciais__titulo">{bloco.titulo}</h2>
+            <p class="diferenciais__texto">{bloco.texto}</p>
+          </li>
+        ))}
```

#### [ALTA] scripts/build_data.py:79-80 — asserts hardcoded ficaram obsoletos frente ao catálogo real (peso reduzido: script auxiliar, não roda em build/CI)
**Problema:** `assert len(categorias) == 8` e `assert len(produtos) == 31` datam de uma versão inicial do catálogo. Hoje `src/data/categorias.json` tem 24 itens e `src/data/produtos.json` tem 74 — o catálogo cresceu (via CMS/edições manuais) sem que o script gerador acompanhasse.
**Impacto:** se alguém rodar `python scripts/build_data.py` de novo com uma planilha atualizada do cliente (fluxo documentado no docstring do próprio script), ele crasha nos asserts antes mesmo de avisar que os números mudaram — dando a falsa impressão de que a planilha está errada, quando na verdade é o script que ficou preso a uma contagem antiga. Na prática hoje o script não roda em nenhum pipeline automatizado, então não afeta o site em produção — mas é uma armadilha para a próxima vez que for usado.
**Fix sugerido:**
```diff
-assert len(categorias) == 8, f"Esperado 8 categorias, obtido {len(categorias)}"
-assert len(produtos) == 31,  f"Esperado 31 produtos, obtido {len(produtos)}"
-print("OK 8 31")
+print(f"OK — {len(categorias)} categorias, {len(produtos)} produtos gerados a partir da planilha")
```
Ou, se o objetivo é sinalizar mudança inesperada de volume, comparar contra o `len()` atual dos JSONs existentes em vez de um número fixo no código.

### Médios

#### [MÉDIA] Número de WhatsApp exibido (texto) hardcoded em 4 lugares fora de `whatsapp.ts`
**Problema:** `src/layouts/BaseLayout.astro:35` (`telephone: '+55-81-98342-6557'` no JSON-LD), `src/components/Footer.astro:16` (`waDisplay = '+55 81 98342-6557'`), `src/pages/contato.astro:41,43` e `src/pages/privacidade.astro:34` exibem o número formatado como string literal, em vez de derivar de `WA_NUMBER` (exportado por `src/data/whatsapp.ts:3`, que já lê de `config.json`). Os *links* (`href`) todos usam corretamente `waLink()` — só o texto visível/estruturado que está solto.
**Impacto:** hoje está consistente com `config.json` (`5581983426557`), mas se o número mudar (ex.: cliente troca de linha), só o link `wa.me/` atualiza automaticamente; os 4 textos exibidos (incluindo o `telephone` do schema.org, que é lido por buscadores) ficam com o número antigo até alguém lembrar de caçar cada ocorrência manualmente. Contraria o espírito da regra 4 do CLAUDE.md (fonte única via helper).
**Fix sugerido:**
```diff
+// em whatsapp.ts, adicionar um formatador:
+export function waDisplay(): string {
+  const raw = WA_NUMBER; // "5581983426557"
+  return `+${raw.slice(0,2)} ${raw.slice(2,4)} ${raw.slice(4,9)}-${raw.slice(9)}`;
+}
```
E trocar as 4 ocorrências hardcoded por `waDisplay()`.

#### [MÉDIA] infra/sveltia-auth-worker/index.js:25,34-40 — parâmetro `state` do OAuth é gerado mas nunca validado
**Problema:** o passo `/auth` gera `state: crypto.randomUUID()` e o envia ao GitHub, mas o passo `/callback` (linha 34-40) lê `code` e `error` da query string — nunca lê nem valida `state` contra um valor persistido (cookie, KV, etc.). O parâmetro existe só de fachada; não protege contra CSRF no fluxo de autorização.
**Impacto:** risco prático limitado neste caso (repo único, sem sessão de usuário final além do editor de conteúdo autenticando no GitHub), mas é a proteção padrão de OAuth ausente — um atacante que conseguisse iniciar o fluxo e capturar/injetar o callback poderia, em tese, associar uma sessão de CMS à conta GitHub errada.
**Fix sugerido:** perguntar ao cliente/dev se aceitam o risco atual (fluxo interno, baixo tráfego) ou preferem adicionar validação de `state` via cookie assinado antes do redirect. Como é código de infraestrutura compartilhada e não bloqueia a operação atual, registrar como item MÉDIA — pergunta explícita para decisão, não correção automática.

### Baixos

#### [BAIXA] Duplicação do array `navLinks` (Header.astro:4-11 e Footer.astro:6-13) e do path SVG do ícone WhatsApp (Header.astro:67, WhatsAppFloat.astro:23, Footer.astro:52, contato.astro:30-31)
**Problema:** mesma lista de navegação e mesmo ícone SVG copiados em múltiplos componentes.
**Impacto:** qualquer mudança de rota ou de ícone precisa ser replicada manualmente em 3-4 arquivos; risco de divergência silenciosa (ex.: um `Header` atualizado e o `Footer` esquecido).
**Fix sugerido:** extrair `navLinks` para `src/data/nav.ts` e o SVG do WhatsApp para um componente `WhatsAppIcon.astro` reutilizável. Baixa prioridade — não é urgente.

## 🧪 Testes faltantes

| # | Teste sugerido | O que assertar |
|---|---|---|
| 1 | `content-schema.valores-length-agnostic` | Build (ou teste unitário do template) com `a-marca.json` contendo 3 itens em `valores` (em vez de 5) não deve lançar erro — cobre o achado ALTA de `a-marca.astro`. |
| 2 | `content-schema.blocos-length-agnostic` | Mesmo teste para `qualidade.json` com `blocos` de tamanho 2 em vez de 4 — cobre `qualidade.astro`. |
| 3 | `build_data.assert-matches-current-catalog` | Rodar `build_data.py` (ou uma versão de teste com planilha fixture) e assertar que `len(categorias)`/`len(produtos)` batem com o que a planilha fixture realmente contém, não com números fixos no código. |
| 4 | `smoke.whatsapp-display-matches-config` | Estender `tests/smoke.spec.ts` para também checar que o texto visível do número de WhatsApp (não só o `href`) corresponde a `config.json`, nas páginas Contato/Footer/Privacidade. |

## 🔇 Ruído suprimido

- Arquivos duplicados não rastreados na raiz/pastas (`package 2.json`, `astro.config 2.mjs`, `tsconfig 2.json`, `playwright.config 2.ts`, `.nvmrc 2`, `tests/smoke.spec 2.ts`, `scripts/*2.py`, `scripts/IMAGES_REPORT 2.md`, arquivos em `Logo/`, PDFs e `.docx`) — parecem resíduo de cópia de pasta (nomes idênticos com sufixo " 2"), não são código revisável. Recomendo apagar ou mover para fora do repo antes do próximo commit, para não poluir `git status`.
- `.serena/` (diretório de ferramenta, não código do projeto) — não revisado.
- `npm run test:smoke` confirmado 9/9 verde após instalar o Chromium do Playwright (`npx playwright install chromium`), rodando contra `npm run preview`. `npm run build` também rodou limpo (32 páginas, sem erros).
- `npx astro check` não pôde rodar sem instalar `@astrojs/check` + `typescript` como dependências novas — não instalei para não alterar `package.json` fora do escopo de uma revisão. `npm run build` já cobre a compilação real do Astro e passou sem warnings de tipo visíveis.

## 🤖 Prompt de correção (vibe review)

```text
Contexto: revisão de código apontou 5 problemas no projeto Landing Page Búfalo (Astro + Sveltia CMS).
Arquivos: src/pages/a-marca.astro, src/pages/qualidade.astro, scripts/build_data.py,
src/layouts/BaseLayout.astro, src/components/Footer.astro, src/pages/contato.astro,
src/pages/privacidade.astro, src/data/whatsapp.ts.

1. Em src/pages/a-marca.astro (linhas 65,76,88,103,115): troque o acesso por índice fixo
   `c.valores![0].nome` ... `c.valores![4].nome` por um `.map()` sobre `(c.valores ?? [])`,
   gerando o `<li class="valores__item">` dinamicamente. Extraia os 5 SVGs de ícone atuais
   para um array `ICONES` e indexe por posição com fallback cíclico (`ICONES[i % ICONES.length]`).
   Motivo: `valores` é uma lista editável livremente pelo Sveltia CMS (widget: list) — remover
   um item quebra o build hoje.

2. Em src/pages/qualidade.astro (linhas 39,58,76,93): mesmo fix para `c.blocos![0..3]`,
   seguindo o padrão que a própria página já usa corretamente para `c.aplicacoes` (linha 110,
   `.map()`).

3. Em scripts/build_data.py (linhas 79-80): remova ou corrija os asserts
   `assert len(categorias) == 8` / `assert len(produtos) == 31` — o catálogo real hoje tem
   24 categorias e 74 produtos. Troque por um print informativo do total gerado, sem travar
   a execução com um número fixo.

4. Em src/data/whatsapp.ts: adicione uma função `waDisplay()` que formata `WA_NUMBER` como
   "+55 81 98342-6557". Depois substitua as ocorrências hardcoded desse texto em
   src/layouts/BaseLayout.astro:35 (campo `telephone` do JSON-LD), src/components/Footer.astro:16
   (`waDisplay` local), src/pages/contato.astro:41-43 e src/pages/privacidade.astro:34 pela nova
   função importada de whatsapp.ts. Não mexer nos `href` — já usam `waLink()` corretamente.

Após aplicar, rode `npm run build && npm run preview &` seguido de
`sleep 3 && npm run test:smoke` (e depois `pkill -f "astro preview"`) e confirme que o build
gera as 32 páginas sem erro e o smoke test passa 9/9. Não altere nada fora do escopo listado.
```
