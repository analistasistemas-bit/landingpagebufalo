# Code Review — Landing Page Búfalo (v2)

**Data:** 2026-07-21 · **Modo:** varredura de codebase completo (`full` — sem diff pendente, `main` sincronizada com `origin/main`) · **Escopo:** `src/` (24 arquivos), `scripts/` (Python), `infra/sveltia-auth-worker/`, `public/admin/`, config raiz
**Stack detectada:** Astro 7 (SSG estático) + TypeScript, Content Collections (zod), Sveltia CMS (GitHub backend), Cloudflare Worker (OAuth), Playwright (smoke), Python 3 + openpyxl (build de dados)
**Camada estática:** completa para Python — `ruff check` + `bandit -r` rodados via pipx (instalação isolada, sem tocar `package.json`/`pyproject.toml`) sobre `scripts/*.py`. Parcial para JS/TS — sem `eslint` configurado no projeto (nenhum devDependency/config); `astro check` não executado (exigiria instalar `@astrojs/check`+`typescript`, fora do escopo de uma revisão). `npm run build` cobre a compilação real do Astro/TS e passou sem erros.
**Regras de projeto:** CLAUDE.md lido (raiz) ✅ · `learnings.md` não existe (nenhum aprendizado prévio registrado — oferta de bootstrap ao final) · `AGENTS.md` não existe

> **Nota:** esta é a re-execução da varredura `full` da [v1](code-review-v1.md) após atualização da skill. Nenhum commit novo entrou no repositório desde então (`git log`/`git status` idênticos, exceto o próprio `code-review-v1.md` agora presente como arquivo não rastreado) — todos os achados da v1 permanecem válidos e não corrigidos. O que muda nesta rodada: a camada estática (Fase 2) agora roda de fato `ruff`+`bandit` sobre os scripts Python (antes não rodava), o que revelou 2 achados novos e menores; e a estrutura do relatório passa a declarar honestamente o status da camada estática no cabeçalho.
>
> **Atualização (2026-07-21, pós-relatório):** os 3 achados ALTA foram corrigidos e validados nesta sessão — ver marcação "✅ CORRIGIDO" em cada um na seção Achados. Score e veredito abaixo já refletem o estado pós-fix.
>
> **Atualização 2 (2026-07-21):** os 2 achados MÉDIA também foram corrigidos e validados nesta sessão — WhatsApp exibido agora vem de `waDisplay()` em `whatsapp.ts`, e o Worker OAuth agora valida `state` via cookie `HttpOnly`. Score e veredito recalculados novamente.
>
> **Atualização 3 (2026-07-21):** o achado BAIXA de `scripts/extract_images.py` também foi corrigido — ver nota de correção na própria entrada do achado (a causa-raiz reportada originalmente estava parcialmente errada; corrigida abaixo).
>
> **Atualização 4 (2026-07-21):** a duplicação de `navLinks`/ícone WhatsApp foi extraída para `src/data/nav.ts` e `src/components/WhatsAppIcon.astro` (validado visualmente no browser — sem regressão). Além disso, para fechar a lacuna real de cobertura de teste (não só "corrigir e confiar"), adicionei: (a) uma asserção no `tests/smoke.spec.ts` que verifica o número de WhatsApp exibido no rodapé em todas as 9 rotas, e (b) `tests/content-resilience.sh` (novo `npm run test:content`), que automatiza exatamente a regressão validada manualmente nas rodadas anteriores — reduz `valores`/`blocos` temporariamente, builda, confirma que não quebra, e restaura o conteúdo original. Score final recalculado: todas as camadas sem achados abertos.

## 🧭 Walkthrough

Sem mudanças no código desde a v1 — o walkthrough arquitetural continua válido: landing page estática em Astro para a marca Búfalo, conteúdo editável via Sveltia CMS (GitHub backend, OAuth via Worker Cloudflare próprio), deploy automático na Vercel. `npm run build` roda limpo (32 páginas) e `npm run test:smoke` passa 9/9 (confirmado na v1 após instalar o Chromium do Playwright). Nenhum preço/valor monetário em nenhuma página, nenhum segredo hardcoded.

A novidade desta rodada é a camada estática real sobre `scripts/*.py`: `ruff` encontrou um import não usado (`re` em `build_data.py`) e três f-strings sem placeholder em `extract_images.py` (cosmético). `bandit` não encontrou nada novo além de reconfirmar, via regra B101, o mesmo assert-hardcoded já reportado como ALTA na v1 (`build_data.py:79-80`) — nenhuma vulnerabilidade real (sem `eval`, `subprocess` com shell, deserialização insegura ou path traversal nos três scripts). Também notei que `extract_images.py:415` imprime um relatório com "Category images: N/8" — o mesmo "8" hardcoded do catálogo antigo aparece aqui também, mas só num texto de log, não trava a execução (diferente do assert de `build_data.py`).

## 📊 Scorecard

| Camada | Peso | Nota | Justificativa |
|---|---|---|---|
| Segurança | 30% | 100 | ✅ Nenhum achado aberto. O `state` do OAuth (`infra/sveltia-auth-worker/index.js`) agora é gerado em `/auth`, guardado num cookie `HttpOnly; Secure; SameSite=Lax` e validado contra o `state` recebido em `/callback` antes de trocar o `code` por token — CSRF do fluxo de login coberto. |
| Corretude | 30% | 100 | ✅ Nenhum achado aberto. As 2 ALTA (índice fixo em `a-marca.astro`/`qualidade.astro`), a ALTA de `build_data.py` e o BAIXA de `extract_images.py` (número mágico "8" → `len(DIVISORIA_MAP) + 1`) foram corrigidos e validados. |
| Testes | 15% | 100 | ✅ Nenhuma lacuna aberta. Smoke 9/9 (agora com asserção do texto de WhatsApp no rodapé). Novo `tests/content-resilience.sh` (`npm run test:content`) automatiza a regressão de `valores`/`blocos` reduzidos, que antes só tinha sido validada manualmente — os 4 itens da tabela de testes faltantes das rodadas anteriores estão cobertos ou deixaram de se aplicar (o assert obsoleto de `build_data.py` foi removido, não havia mais o que testar ali). |
| Contratos & Migrações | 15% | 100 | ✅ Nenhum achado aberto. Contrato "lista de tamanho livre no CMS" vs. "template com N itens fixos" resolvido e agora com teste de regressão; `build_data.py` e `extract_images.py` derivam os totais da fonte real de dados, sem números mágicos soltos. |
| Performance & Manutenção | 10% | 100 | ✅ Nenhum achado aberto. `navLinks` extraído para `src/data/nav.ts` (usado por Header/Footer) e o ícone do WhatsApp para `src/components/WhatsAppIcon.astro` (usado por Header/Footer/WhatsAppFloat — `contato.astro` mantém seu próprio ícone, que é visualmente distinto de propósito, não duplicado). Validado visualmente no browser sem regressão. |

**Score final: 100/100 → ✅ APROVAR**

**Condições:** nenhuma. Todos os achados desta varredura (CRÍTICA/ALTA/MÉDIA/BAIXA) e a lacuna de cobertura de teste foram corrigidos e validados, com testes automatizados novos travando as regressões.

## 🔍 Achados

### Críticos
Nenhum.

### Altos — todos corrigidos e validados nesta sessão ✅

#### [ALTA] src/pages/a-marca.astro:65,76,88,103,115 — acesso por índice fixo em lista editável pelo CMS quebra o build se o item for removido
**Status: ✅ CORRIGIDO E VALIDADO (2026-07-21).** `c.valores![0..4]` foi trocado por `.map()` sobre `(c.valores ?? [])`, com os 5 SVGs extraídos para um array `VALORES_ICONS` indexado ciclicamente (`ICONES[i % ICONES.length]`). Validação: reduzi temporariamente `a-marca.json.valores` para 3 itens (simulando um editor removendo um item pelo painel), rodei `npm run build` — antes quebrava, agora gera 3 `<li>` corretamente — e restaurei o conteúdo original. `npm run build` (32 páginas) e `npm run test:smoke` (9/9) confirmados depois da restauração.
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
**Status: ✅ CORRIGIDO E VALIDADO (2026-07-21).** `c.blocos![0..3]` foi trocado por `.map()` sobre `(c.blocos ?? [])`, com os 4 SVGs extraídos para `BLOCOS_ICONS`, seguindo o mesmo padrão já usado em `c.aplicacoes`. Validação: reduzi temporariamente `qualidade.json.blocos` para 2 itens, rodei `npm run build` — gerou 2 `<li>` sem erro — e restaurei o conteúdo original. Smoke test 9/9 confirmado depois.
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

#### [ALTA] scripts/build_data.py:79-80 — asserts hardcoded ficaram obsoletos frente ao catálogo real (peso reduzido: script auxiliar, não roda em build/CI); reconfirmado pelo bandit (B101)
**Status: ✅ CORRIGIDO E VALIDADO (2026-07-21).** Os dois `assert` (8 categorias / 31 produtos) foram removidos, junto com o `import re` não usado (achado BAIXA relacionado, ver abaixo). `ruff check scripts/build_data.py` → "All checks passed!" e `python3 -m py_compile scripts/build_data.py` confirmam que o script compila limpo.
**Problema:** `assert len(categorias) == 8` e `assert len(produtos) == 31` datam de uma versão inicial do catálogo. Hoje `src/data/categorias.json` tem 24 itens e `src/data/produtos.json` tem 74 — o catálogo cresceu (via CMS/edições manuais) sem que o script gerador acompanhasse. `bandit -r scripts/` sinaliza esses mesmos asserts via regra B101 (uso de `assert` em código de produção — asserts são removidos em bytecode otimizado), reforçando que essa trava não é uma checagem confiável de qualquer forma.
**Impacto:** se alguém rodar `python scripts/build_data.py` de novo com uma planilha atualizada do cliente (fluxo documentado no docstring do próprio script), ele crasha nos asserts antes mesmo de avisar que os números mudaram — dando a falsa impressão de que a planilha está errada, quando na verdade é o script que ficou preso a uma contagem antiga. Na prática hoje o script não roda em nenhum pipeline automatizado, então não afeta o site em produção — mas é uma armadilha para a próxima vez que for usado. O mesmo "8" hardcoded também aparece em `scripts/extract_images.py:415` (só num texto de relatório, sem travar a execução — achado à parte, BAIXA, ver abaixo).
**Fix sugerido:**
```diff
-assert len(categorias) == 8, f"Esperado 8 categorias, obtido {len(categorias)}"
-assert len(produtos) == 31,  f"Esperado 31 produtos, obtido {len(produtos)}"
-print("OK 8 31")
+print(f"OK — {len(categorias)} categorias, {len(produtos)} produtos gerados a partir da planilha")
```
Ou, se o objetivo é sinalizar mudança inesperada de volume, comparar contra o `len()` atual dos JSONs existentes em vez de um número fixo no código.

### Médios — ambos corrigidos e validados nesta sessão ✅

#### [MÉDIA] Número de WhatsApp exibido (texto) hardcoded em 4 lugares fora de `whatsapp.ts`
**Status: ✅ CORRIGIDO E VALIDADO (2026-07-21).** Adicionada `waDisplay()` em `src/data/whatsapp.ts`, que formata `WA_NUMBER` a partir de `config.json`. As 4 ocorrências hardcoded foram substituídas: `BaseLayout.astro:35` (`telephone` do JSON-LD), `Footer.astro` (const local `waDisplay` removida, agora importa a função), `contato.astro:41-43` e `privacidade.astro:34`. Validação: `npm run build` (32 páginas) + inspeção do HTML gerado confirmando `+55 81 98342-6557` renderizado nos 4 pontos + `npm run test:smoke` 9/9.
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
**Status: ✅ CORRIGIDO E VALIDADO (2026-07-21).** `/auth` agora guarda o `state` num cookie `oauth_state` (`HttpOnly; Secure; SameSite=Lax; Max-Age=600`) via `Set-Cookie`. `/callback` lê o `state` da query string, lê o cookie via um novo helper `getCookie()`, e rejeita a autenticação (`postToOpener('error', { error: 'invalid_state' })`) se não baterem. O cookie é limpo (`Max-Age=0`) na resposta final. Validação: `node --check` (sintaxe), `npx wrangler deploy --dry-run` (bundle válido no runtime Cloudflare) e um teste isolado em Node simulando `getCookie()`/comparação de `state` com os casos normal, sem cookie, cookie no meio de outros, e mismatch — todos passaram.
**Problema:** o passo `/auth` gera `state: crypto.randomUUID()` e o envia ao GitHub, mas o passo `/callback` (linha 34-40) lê `code` e `error` da query string — nunca lê nem valida `state` contra um valor persistido (cookie, KV, etc.). O parâmetro existe só de fachada; não protege contra CSRF no fluxo de autorização.
**Impacto:** risco prático limitado neste caso (repo único, sem sessão de usuário final além do editor de conteúdo autenticando no GitHub), mas é a proteção padrão de OAuth ausente — um atacante que conseguisse iniciar o fluxo e capturar/injetar o callback poderia, em tese, associar uma sessão de CMS à conta GitHub errada.
**Fix sugerido:** perguntar ao cliente/dev se aceitam o risco atual (fluxo interno, baixo tráfego) ou preferem adicionar validação de `state` via cookie assinado antes do redirect. Como é código de infraestrutura compartilhada e não bloqueia a operação atual, registrar como item MÉDIA — pergunta explícita para decisão, não correção automática.

### Baixos

#### [BAIXA] scripts/build_data.py:9 — import `re` não utilizado (achado do `ruff`, regra F401)
**Status: ✅ CORRIGIDO (2026-07-21)** — removido junto com o fix da ALTA acima; `ruff check` confirma zero violações no arquivo.
**Problema:** `import re` no topo do script nunca é referenciado no corpo do código.
**Impacto:** nenhum em runtime — apenas ruído de manutenção (deixa a impressão de que alguma validação por regex existe quando não existe mais).
**Fix sugerido:**
```diff
 import json
 import os
-import re
 import openpyxl
```

#### [BAIXA] scripts/extract_images.py:412,413,418 — f-strings sem placeholder (achado do `ruff`, regra F541) e "8" hardcoded no texto do relatório (linha 415)
**Status: ✅ CORRIGIDO E VALIDADO (2026-07-21).** **Correção à análise original:** ao investigar antes de aplicar o fix sugerido (`len(categorias)`), descobri que a causa-raiz **não** é a mesma do achado de `build_data.py`. Este script não carrega `categorias.json` — o "8" vem de `DIVISORIA_MAP` (linha 233), um dicionário fixo com 7 slugs que têm página de divisória mapeada no PDF (`linhas-de-costura`, `ziperes`, `elasticos`, `passamanarias`, `fechos-colchetes`, `tesouras`, `acessorios`) + 1 caso especial (`fios-overloque`, tratado à parte com duotone) = 8 categorias que **este script específico** sabe processar, não as 24 do catálogo atual. Usar `len(categorias)` como eu havia sugerido teria introduzido um bug novo (a razão exibida ficaria "N/24", implicando que o script deveria cobrir todas as categorias, o que nunca foi o caso). Troquei o "8" hardcoded por `len(DIVISORIA_MAP) + 1`, derivado da própria fonte de verdade do script, e removi os 3 prefixos `f` redundantes.
**Problema:** três chamadas `rpt(f"...")` não tinham nenhum `{}` dentro — o prefixo `f` era redundante. Além disso, a linha 415 imprimia "/8" como número mágico solto no código, sem ligação com a variável que realmente define esse total.
**Impacto:** nenhum funcional; evita que o "8" fique órfão no código (se `DIVISORIA_MAP` ganhar uma nova página no futuro, o denominador do relatório atualiza sozinho).
**Fix aplicado:**
```diff
-    rpt(f"  - Logos produced: 3 (logo-v2.png, logo-principal.png, logo-branca.png)")
-    rpt(f"  - Favicon: favicon.svg + favicon.png")
+    rpt("  - Logos produced: 3 (logo-v2.png, logo-principal.png, logo-branca.png)")
+    rpt("  - Favicon: favicon.svg + favicon.png")
     rpt(f"  - Colors JSON: {color_count} entries")
-    rpt(f"  - Category images: {len(cat_imgs)}/8")
+    total_category_slugs = len(DIVISORIA_MAP) + 1  # + fios-overloque (duotone, sem divisória)
+    rpt(f"  - Category images: {len(cat_imgs)}/{total_category_slugs}")
     rpt(f"  - Product-specific images: {len(prod_imgs)}")
-    rpt(f"  - Placeholder: _placeholder.webp")
+    rpt("  - Placeholder: _placeholder.webp")
```
Validado com `ruff check scripts/extract_images.py` ("No issues found") e `python3 -m py_compile` (compila sem erro). Não rodei o script inteiro (depende de `Catálogo Búfalo 18-06.pdf` + páginas pré-rasterizadas e sobrescreveria arquivos reais em `public/images/`) — fora do risco aceitável para uma correção cosmética.

#### [BAIXA] Duplicação do array `navLinks` (Header.astro:4-11 e Footer.astro:6-13) e do path SVG do ícone WhatsApp (Header.astro:67, WhatsAppFloat.astro:23, Footer.astro:52)
**Status: ✅ CORRIGIDO E VALIDADO (2026-07-21).** `navLinks` extraído para `src/data/nav.ts`, importado por `Header.astro` e `Footer.astro`. O SVG do WhatsApp extraído para `src/components/WhatsAppIcon.astro` (prop `size`), usado por `Header.astro` (18px), `Footer.astro` (16px) e `WhatsAppFloat.astro` (28px). **Correção ao achado original:** `contato.astro:30-31` **não** era o mesmo ícone duplicado — é um SVG de dois paths, estilo outline, que combina com os demais ícones da página (e-mail, redes sociais); mantive esse arquivo intocado para não introduzir uma mudança visual não pedida. Validação: build limpo, smoke 9/9, e inspeção visual no browser (Header, WhatsAppFloat e Footer renderizando o ícone/links corretamente nos tamanhos originais).
**Problema:** mesma lista de navegação e mesmo ícone SVG copiados em múltiplos componentes.
**Impacto:** qualquer mudança de rota ou de ícone precisava ser replicada manualmente em 2-3 arquivos; risco de divergência silenciosa (ex.: um `Header` atualizado e o `Footer` esquecido).
**Fix aplicado:** extraído `navLinks` para `src/data/nav.ts` e o SVG do WhatsApp para `WhatsAppIcon.astro`.

## 🧪 Testes faltantes

Todos os itens abaixo, listados nas rodadas anteriores, foram fechados nesta sessão:

| # | Teste sugerido | Status |
|---|---|---|
| 1 | `content-schema.valores-length-agnostic` | ✅ Coberto por `tests/content-resilience.sh` (`npm run test:content`) — reduz `valores` para 3 itens, builda, confirma sucesso, restaura. |
| 2 | `content-schema.blocos-length-agnostic` | ✅ Coberto pelo mesmo script, reduzindo `blocos` para 2 itens. |
| 3 | `build_data.assert-matches-current-catalog` | ✅ Deixou de se aplicar — o assert obsoleto foi removido (não substituído por uma versão dinâmica), então não há mais suposição de contagem fixa para testar. |
| 4 | `smoke.whatsapp-display-matches-config` | ✅ Coberto — nova asserção em `tests/smoke.spec.ts` checa o texto do rodapé em todas as 9 rotas. |

Nenhum teste faltante identificado nesta rodada.

## 🔇 Ruído suprimido

- Arquivos duplicados não rastreados na raiz/pastas (`package 2.json`, `astro.config 2.mjs`, `tsconfig 2.json`, `playwright.config 2.ts`, `.nvmrc 2`, `tests/smoke.spec 2.ts`, `scripts/*2.py`, `scripts/IMAGES_REPORT 2.md`, arquivos em `Logo/`, PDFs e `.docx`) — parecem resíduo de cópia de pasta (nomes idênticos com sufixo " 2"), não são código revisável. `bandit` também escaneou `scripts/build_data 2.py` e reportou o mesmo B101 já coberto pelo original — descartado como duplicata. Recomendo apagar ou mover para fora do repo antes do próximo commit.
- `.serena/` (diretório de ferramenta, não código do projeto) — não revisado.
- `ruff check scripts/` também listou as 4 violações acima como "fixable" via `ruff check --fix` — não apliquei automaticamente para não misturar uma correção de estilo com a revisão; ambas são triviais e de baixo risco se o usuário quiser rodar o fix.
- `npm run test:smoke` confirmado 9/9 verde (já validado na v1) e `npm run build` limpo (32 páginas, sem erros).
- `npx astro check` / `eslint` seguem não executados (sem dependência instalada no projeto) — não alterei `package.json` para viabilizar.

## 🤖 Prompt de correção (vibe review)

```text
Nenhuma ação pendente. Todos os achados desta varredura (CRÍTICA/ALTA/MÉDIA/BAIXA) e a lacuna
de cobertura de teste foram corrigidos e validados nesta sessão:

- Build: `npm run build` → 32 páginas, sem erros.
- Smoke: `npm run test:smoke` → 9/9 (inclui nova asserção do WhatsApp no rodapé).
- Regressão de conteúdo: `npm run test:content` → build sobrevive a `valores`/`blocos` reduzidos.
- Python: `ruff check scripts/build_data.py scripts/build_images.py scripts/extract_images.py` → sem violações (rodar `ruff check scripts/` sem filtro também varre os arquivos duplicados "` 2`", que são lixo de cópia fora de escopo — ver Ruído suprimido).
- Worker: `node --check` + `npx wrangler deploy --dry-run` → válido.

Rodar essa mesma bateria (`npm run build`, `npm run test:smoke`, `npm run test:content`,
`ruff check` nos 3 scripts reais) antes de qualquer novo commit é suficiente para confirmar
que nada regrediu.
```
