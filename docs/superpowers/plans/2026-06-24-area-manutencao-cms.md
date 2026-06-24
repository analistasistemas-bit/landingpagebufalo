# Área de Manutenção (CMS Sveltia) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar uma área de manutenção sem código (`/admin`) ao site Búfalo usando Sveltia CMS, com conteúdo versionado no GitHub, login via GitHub OAuth (Cloudflare Worker) e auto-deploy na Vercel.

**Architecture:** O site continua Astro estático. Os textos saem do código e viram conteúdo editável (Astro Content Collections em `src/content/paginas/*.json` + JSON em `src/data/`). O Sveltia (estático em `public/admin/`) edita esses arquivos via formulários e faz commit no repo; a Vercel reconstrói a cada push. Nenhum backend/banco; o único componente externo é um Cloudflare Worker gratuito que faz a ponte do OAuth do GitHub.

**Tech Stack:** Astro 7, Astro Content Collections (zod), Sveltia CMS, GitHub OAuth, Cloudflare Workers, Vercel. Verificação: `npm run build` + `npm run test:smoke` (Playwright já configurado) + checagem manual do `/admin`.

**Spec de referência:** `docs/superpowers/specs/2026-06-24-area-manutencao-cms-design.md`.

**Regras:** sem mudança visual (só a origem do conteúdo muda); build sempre verde e smoke test do Marco 3 sempre passando; sem preço; copy preservada literalmente ao extrair; commits frequentes com `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

**Convenção de commit (todas as tarefas):**
```bash
git -c user.name="analistasistemas-bit" -c user.email="analistasistemas@gmail.com" commit -m "<msg>

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## File Structure

```
src/
  content/
    config.ts                 # schema (zod) das coleções de conteúdo
    paginas/
      home.json               # textos da Home
      a-marca.json
      qualidade.json
      revendedor.json
      contato.json
  data/
    config.json               # NOVO: whatsapp, email, redes, dominio, tagline, ctas
    whatsapp.ts               # MODIF: lê de config.json, mantém waLink()/waMsg
    produtos.json             # (existente) editável via CMS
    categorias.json           # MODIF: + campo imagem
public/
  admin/
    index.html                # carrega o Sveltia
    config.yml                # define as coleções do CMS
  images/uploads/             # destino dos uploads do CMS (.gitkeep)
infra/
  sveltia-auth-worker/        # NOVO: Cloudflare Worker de OAuth (código + README)
docs/
  COMO-EDITAR-O-SITE.md       # guia do admin leigo
vercel.json                   # config de build (se necessário)
```

> Phases: **A (Tasks 1–5)** conteúdo editável · **B (Tasks 6–7)** CMS + login · **C (Task 8)** deploy · **D (Task 9)** docs + verificação E2E. Tasks 7 e 8 têm passos que **exigem ação sua** (contas/segredos) — marcados com 🔑.

---

## Task 1: Config global + refactor do whatsapp.ts

**Files:**
- Create: `src/data/config.json`
- Modify: `src/data/whatsapp.ts`, `src/components/Footer.astro`, `src/pages/contato.astro`

- [ ] **Step 1: Criar `src/data/config.json`** com os valores atuais:

```json
{
  "whatsapp": "5581983426557",
  "email": "[CONFIRMAR]",
  "redes": { "instagram": "", "facebook": "" },
  "dominio": "https://bufalo.example.com",
  "_nota_dominio": "informativo/CMS; o domínio real do build vem de astro.config.mjs `site`",
  "tagline": "Força e Qualidade",
  "ctas": {
    "revendedorMsg": "Olá! Quero ser revendedor Búfalo.",
    "atacadoMsg": "Olá! Tenho interesse em comprar em volume para minha confecção."
  }
}
```

- [ ] **Step 2: Refatorar `whatsapp.ts`** para ler de config.json, MANTENDO a API (`WA_NUMBER`, `waLink`, `waMsg`):

```ts
import config from './config.json';

export const WA_NUMBER = config.whatsapp;
export function waLink(msg = 'Olá! Vim pelo site da Búfalo e quero saber mais.') {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}
export const waMsg = {
  produto: (n: string) => `Olá! Quero saber mais sobre ${n}.`,
  revendedor: config.ctas.revendedorMsg,
  atacado: config.ctas.atacadoMsg,
};
export const EMAIL = config.email;
```

- [ ] **Step 3: Footer e Contato lerem o e-mail de config** (substituir o `[CONFIRMAR]` hardcoded por `EMAIL` importado; quando vazio/`[CONFIRMAR]`, exibir o placeholder como hoje).

- [ ] **Step 4: Verificar** — `npm run build` (sucesso) e `npm run test:smoke` (9/9). Confirmar que os links de WhatsApp continuam `wa.me/5581983426557`.

- [ ] **Step 5: Commit** — `feat(cms): config global + whatsapp.ts lê de config.json`

---

## Task 2: Content Collections — schema + extração dos textos

**Files:**
- Create: `src/content/config.ts`, `src/content/paginas/{home,a-marca,qualidade,revendedor,contato}.json`

- [ ] **Step 1: `src/content/config.ts`** — definir uma coleção `paginas` do tipo `data` com schema zod cobrindo os campos de cada página (headline, subtítulo, listas de seções/valores/blocos/benefícios). Um schema por página ou um schema união; preferir um schema por arquivo via `z.object` específico.

- [ ] **Step 2: Extrair a copy atual** das páginas para os JSONs em `src/content/paginas/`, **palavra por palavra** (fonte: os `.astro` atuais e `Site/03_Conteudo_Copy.md`). Ex. `home.json`: `{ kicker, headline, subtitulo, ctaPrimario, ctaSecundario, categoriasHeading, categoriasIntro, destaquesHeading, marcaTitulo, marcaTexto, revendedorTitulo, revendedorTexto, revendedorBotao }`.

- [ ] **Step 3: Verificar schema** — `npm run build` deve validar os JSONs (falha proposital se faltar campo). Corrigir até passar.

- [ ] **Step 4: Commit** — `feat(cms): content collections + extração dos textos das páginas`

---

## Task 3: Home lê do conteúdo

**Files:**
- Modify: `src/pages/index.astro` (e componentes que recebem texto fixo, passando via props quando necessário)

- [ ] **Step 1: Trocar os textos fixos da Home** por leitura de `getCollection('paginas')`/`getEntry('paginas','home')`. Passar valores aos componentes via props (ColorRing/FeatureStrip/CategoryGrid/CTASection já aceitam props onde aplicável; CTASection já recebe textos).

- [ ] **Step 2: Verificar** — `npm run build` + comparar visualmente (screenshot da Home igual à versão aprovada) + `npm run test:smoke`.

- [ ] **Step 3: Commit** — `refactor(cms): Home lê textos do conteúdo`

---

## Task 4: Demais páginas leem do conteúdo

**Files:**
- Modify: `src/pages/a-marca.astro`, `qualidade.astro`, `revendedor.astro`, `contato.astro`

- [ ] **Step 1:** Para cada página, substituir texto fixo por leitura da entrada correspondente em `paginas/`. Manter o layout/estilo idêntico.

- [ ] **Step 2: Verificar** — `npm run build` + screenshots das 4 páginas iguais às aprovadas + `npm run test:smoke` (9/9).

- [ ] **Step 3: Commit** — `refactor(cms): páginas institucionais leem do conteúdo`

---

## Task 5: Catálogo pronto para o CMS

**Files:**
- Modify: `src/data/categorias.json` (+`imagem`), `src/components/CategoryGrid.astro` (usar `imagem` se presente, fallback ao slug)

- [ ] **Step 1:** Adicionar campo `imagem` a cada categoria (apontando para `/images/produtos/{slug}.webp` atual). CategoryGrid usa `categoria.imagem` quando houver.

- [ ] **Step 2:** Confirmar que `produtos.json` tem todos os campos que o CMS vai editar (já tem). Garantir que `imagem` por produto é respeitada pelo ProductCard (já é, via `{id}.webp`).

- [ ] **Step 3: Verificar** — `npm run build` + `npm run test:smoke`.

- [ ] **Step 4: Commit** — `feat(cms): categorias com campo imagem`

---

## Task 6: Painel Sveltia (`/admin`)

**Files:**
- Create: `public/admin/index.html`, `public/admin/config.yml`, `public/images/uploads/.gitkeep`

- [ ] **Step 1: `public/admin/index.html`** — página mínima que carrega o Sveltia CMS (script do Sveltia via CDN) e aponta para `config.yml`.

- [ ] **Step 2: `public/admin/config.yml`** — backend `github` (repo `analistasistemas-bit/landingpagebufalo`, branch `main`), `media_folder: public/images/uploads`, `public_folder: /images/uploads`, e coleções:
  - `paginas` (files) — uma entrada por página, campos espelhando o schema da Task 2 (string, text, markdown, list-of-object para valores/blocos/benefícios). Rótulos em PT.
  - `produtos` (file → `src/data/produtos.json`, list widget de objetos) — campos: nome, categoria (select pelas categorias), composicao, medida, embalagem, cores, destaque (boolean), imagem (image), obs. _Nota: `produtos.json` é um array no topo do arquivo; configurar o `list` widget com `root: true` (ou equivalente) para editar o array raiz._
  - `categorias` (file → `src/data/categorias.json`, list widget) — nome, slug, descricao, ordem, imagem.
  - `config` (file → `src/data/config.json`) — whatsapp, email, redes, dominio, tagline, ctas.
  - Mídia: biblioteca apontando `public/images/uploads`.

- [ ] **Step 3: Verificar localmente** — `npm run build` e abrir `/admin` no preview: a UI do Sveltia carrega e mostra as coleções (o login só funcionará após a Task 7; aqui valida que `config.yml` é válido e as coleções aparecem).

- [ ] **Step 4: Commit** — `feat(cms): painel Sveltia /admin + config.yml`

---

## Task 7: 🔑 Login GitHub (Cloudflare Worker OAuth)

**Files:**
- Create: `infra/sveltia-auth-worker/` (worker `index.js` + `wrangler.toml` + `README.md`)
- Modify: `public/admin/config.yml` (`base_url` do worker)

> Esta tarefa tem passos que **exigem ação sua** (criar contas/segredos). O agente prepara o código e o passo a passo; você executa os passos 🔑.

- [ ] **Step 1: Scaffold do Worker** — adicionar em `infra/sveltia-auth-worker/` o código do `sveltia-cms-auth` (handler OAuth do GitHub) + `wrangler.toml` + `README.md`. O README deve fixar a referência ao repo oficial `sveltia/sveltia-cms-auth` e documentar as chaves que o Sveltia espera no `config.yml` (`backend.base_url` = URL do Worker; `backend.auth_endpoint` se aplicável).

- [ ] **Step 2: 🔑 Criar GitHub OAuth App** — você cria em GitHub → Settings → Developer settings → OAuth Apps: Homepage `https://<seu-dominio-vercel>`, Authorization callback `https://<worker>.workers.dev/callback`. Anotar Client ID/Secret.

- [ ] **Step 3: 🔑 Deploy do Worker** — você cria conta Cloudflare (grátis), `wrangler deploy`, e define os secrets `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` (do passo 2) no Worker.

- [ ] **Step 4: Apontar o CMS ao Worker** — em `config.yml`, setar `backend.base_url` para a URL do Worker.

- [ ] **Step 5: Verificar** — abrir `/admin` no site publicado, clicar em login, autenticar com GitHub, e confirmar que carrega as coleções. Usuário sem escrita no repo NÃO consegue salvar.

- [ ] **Step 6: Commit** — `feat(cms): worker de OAuth do GitHub + base_url`

---

## Task 8: 🔑 Deploy na Vercel + auto-rebuild

**Files:**
- Create: `vercel.json` (se necessário para output estático)

- [ ] **Step 1: 🔑 Conectar repo à Vercel** — você importa o repositório na Vercel (framework Astro detectado, build `npm run build`, output `dist/`).

- [ ] **Step 2: Ajustar `site`/domínio** — atualizar `astro.config.mjs` `site` e `config.json.dominio` para a URL da Vercel (provisória) até o domínio próprio `[CONFIRMAR]`.

- [ ] **Step 3: Verificar auto-rebuild** — fazer um commit qualquer → confirmar que a Vercel reconstrói e publica automaticamente.

- [ ] **Step 4: Commit** — `chore(cms): config de deploy Vercel`

---

## Task 9: Guia do admin + verificação ponta a ponta

**Files:**
- Create: `docs/COMO-EDITAR-O-SITE.md`

- [ ] **Step 1: Guia leigo** — passo a passo com prints/explicações: como entrar no `/admin`, editar um texto, trocar uma foto, adicionar/editar um produto, mudar config, e o que esperar (rebuild ~1 min). Incluir "como desfazer pelo histórico do GitHub". **Aviso explícito:** mudar o número de WhatsApp no `/admin` exige atualizar a asserção em `tests/smoke.spec.ts` (hoje fixa em `wa.me/5581983426557`) — ou afrouxar o teste para aceitar qualquer `wa.me/`. Recomendar afrouxar o teste nesta tarefa.

- [ ] **Step 2: Teste E2E real** — pelo `/admin`: (a) mudar um texto, (b) trocar uma imagem, (c) editar um produto, (d) mudar um campo de config. Confirmar: commit aparece no GitHub → Vercel reconstrói → mudança no ar. Reverter as mudanças de teste.

- [ ] **Step 3: Regressão** — `npm run build` + `npm run test:smoke` (9/9) ainda passam.

- [ ] **Step 4: Commit** — `docs(cms): guia de edição do site + verificação E2E`

---

## Notas de execução

- **Ordem:** Phase A (1–5) pode ser feita e validada inteira antes de tocar no CMS — o site continua idêntico, só fica "orientado a conteúdo". Bom ponto de validação visual com o Diego.
- **Tasks 7 e 8** dependem de você criar contas/segredos (GitHub OAuth App, Cloudflare, Vercel). O agente entrega o código e instruções; pause nesses pontos para os passos 🔑.
- **Segredos** (Client Secret) ficam só no Worker/host — nunca no repositório.
- **Sem regressão visual:** screenshots antes/depois das páginas migradas devem bater; o smoke test do Marco 3 é a rede de segurança.
- **Domínio/e-mail/história** permanecem `[CONFIRMAR]` — agora como campos editáveis no `/admin`.
