# Site Búfalo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o site institucional/vitrine da marca Búfalo (linhas de costura e aviamentos) em Astro estático, mobile-first, com hero de anel de cores, 16 páginas e WhatsApp como único canal de conversão.

**Architecture:** Astro estático com componentização. Dados de catálogo (8 categorias, 31 produtos) convertidos do `.xlsx` para JSON e consumidos por páginas dinâmicas (`produtos/[slug]`). Layout base único com SEO, header e footer reaproveitados. Componentes de assinatura (ColorRing, ColorSwatches, StitchDivider). Imagens extraídas do PDF do catálogo, otimizadas em WebP.

**Tech Stack:** Astro 4+, HTML/CSS/JS (sem framework de UI pesado), Google Fonts (Oswald + Open Sans), Python (openpyxl/pymupdf) para conversão de dados/imagens, Playwright para verificação visual.

**Verificação (em vez de TDD unitário):** cada tarefa termina com `npm run build` limpo + checagem no navegador (preview/Playwright). Asserts automáticos leves onde aplicável (links WhatsApp, ausência de preço, contagem de páginas/cards, schema válido). Spec de referência: `docs/superpowers/specs/2026-06-24-site-bufalo-design.md`.

**Fontes de conteúdo (usar literalmente):** `Site/03_Conteudo_Copy.md` (copy), `Site/Bufalo_Catalogo_Estruturado.xlsx` (produtos), `Site/04_Especificacao_Tecnica_SEO.md` (SEO/tokens), `Logo/` (logos), `Catálogo Búfalo 18-06.pdf` (imagens).

**Regras inegociáveis:** sem preço/carrinho em nenhum lugar; WhatsApp `+55 81 98342-6557` (`https://wa.me/5581983426557`) em todos os CTAs + botão flutuante; campos `[CONFIRMAR]` como placeholder visível; nunca recriar o logotipo em texto.

---

## File Structure

```
package.json, astro.config.mjs, tsconfig.json
scripts/
  build_data.py          # xlsx -> src/data/*.json
  extract_images.py       # PDF -> public/images/produtos/*.webp
src/
  data/
    categorias.json        # 8 categorias
    produtos.json          # 31 produtos
    whatsapp.ts            # helper de link + mensagens pré-preenchidas
    seo.ts                 # meta por página
  styles/
    tokens.css             # variáveis de cor/tipografia
    global.css             # reset, base, utilitários
  layouts/
    BaseLayout.astro       # <head>/SEO/header/footer/whatsapp-float
  components/
    Header.astro
    Footer.astro
    WhatsAppFloat.astro
    ColorRing.astro        # hero — anel de cores animado
    ColorSwatches.astro    # cartela 100+ cores (Linha 120)
    CategoryGrid.astro     # grid das 8 categorias
    ProductCard.astro      # card sem preço + CTA WhatsApp
    FeatureStrip.astro     # faixa de diferenciais
    CTASection.astro       # faixa CTA reutilizável
    StitchDivider.astro    # divisor "costura"
  pages/
    index.astro
    a-marca.astro
    produtos/index.astro
    produtos/[slug].astro
    qualidade.astro
    revendedor.astro
    contato.astro
    privacidade.astro
    404.astro
public/
  images/{logos,produtos}/  favicon.svg
  robots.txt
tests/
  smoke.spec.ts            # Playwright: páginas, whatsapp, sem-preço
```

---

## Task 1: Scaffold Astro + estrutura base

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc`
- Modify: `.gitignore` (já ignora `node_modules/`, `dist/`, `.astro/`)

- [ ] **Step 1: Criar projeto Astro mínimo**

Run: `npm create astro@latest -- --template minimal --no-install --no-git --yes .`
(se o diretório não estiver vazio, criar manualmente `package.json` com `astro` em deps e scripts `dev`/`build`/`preview`.)

- [ ] **Step 2: Configurar `astro.config.mjs`** com `site` (placeholder do domínio) e integração de sitemap:

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://bufalo.example.com', // [CONFIRMAR] domínio
  integrations: [sitemap()],
});
```

- [ ] **Step 3: Instalar dependências**

Run: `npm install && npm install @astrojs/sitemap`
Expected: instala sem erros.

- [ ] **Step 4: Verificar dev server**

Run: `npm run build`
Expected: build sucesso (página default). 

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold Astro + sitemap"
```

---

## Task 2: Design tokens, fontes e estilos globais

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`

- [ ] **Step 1: `tokens.css`** com os tokens da spec (§3.1):

```css
:root{
  --bufalo-vermelho:#B22222; --bufalo-bordo:#6B0000;
  --bufalo-cinza:#3D3D3D; --bufalo-branco:#FFFFFF;
  --bufalo-cinza-claro:#F2F2F2; --texto-padrao:#3D3D3D;
  --font-titulo:'Oswald',sans-serif; --font-corpo:'Open Sans',sans-serif;
  --maxw:1200px; --radius:12px;
}
```

- [ ] **Step 2: `global.css`** — reset leve, base tipográfica, classe `.container`, botões (`.btn`, `.btn--primary` vermelho/hover bordô, `.btn--ghost`), foco visível, `h1/h2` em Oswald uppercase. Importar Google Fonts (Oswald 400/600/700/800 + Open Sans 400/600) via `<link>` no BaseLayout, não `@import`.

- [ ] **Step 3: Verificar** que o CSS não quebra o build.

Run: `npm run build`
Expected: sucesso.

- [ ] **Step 4: Commit** `git commit -am "feat: design tokens e estilos globais"`

---

## Task 3: Camada de dados (xlsx → JSON)

**Files:**
- Create: `scripts/build_data.py`, `src/data/categorias.json`, `src/data/produtos.json`, `src/data/whatsapp.ts`

- [ ] **Step 1: Escrever `scripts/build_data.py`** que lê `Site/Bufalo_Catalogo_Estruturado.xlsx` (abas Categorias e Produtos) e gera os JSONs. Campos categoria: `{id, nome, slug, descricao, ordem}`. Campos produto: `{id, categoria, categoriaSlug, nome, composicao, medida, embalagem, cores, destaque(bool), obs, imagem}`. Resolver `categoriaSlug` cruzando o nome da categoria com a aba Categorias. `imagem` = caminho previsto `/images/produtos/{id}.webp` (preenchido na Task 4).

- [ ] **Step 2: Rodar e validar contagem**

Run: `python3 scripts/build_data.py && node -e "const c=require('./src/data/categorias.json'),p=require('./src/data/produtos.json');console.log('cats',c.length,'prods',p.length);if(c.length!==8||p.length!==31)process.exit(1)"`
Expected: `cats 8 prods 31`, exit 0.

- [ ] **Step 3: `whatsapp.ts`** — helper:

```ts
export const WA_NUMBER='5581983426557';
export function waLink(msg='Olá! Vim pelo site da Búfalo e quero saber mais.'){
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}
export const waMsg={
  produto:(n:string)=>`Olá! Quero saber mais sobre ${n}.`,
  revendedor:'Olá! Quero ser revendedor Búfalo.',
  atacado:'Olá! Tenho interesse em comprar em volume para minha confecção.',
};
```

- [ ] **Step 4: Commit** `git add -A && git commit -m "feat: dados de catálogo (xlsx->json) + helper whatsapp"`

---

## Task 4: Extração e otimização de imagens

**Files:**
- Create: `scripts/extract_images.py`, `public/images/produtos/*.webp`, `public/images/logos/*`, `public/favicon.svg`
- Modify: `src/data/produtos.json` (confirmar campo `imagem`)

- [ ] **Step 1: Copiar logos** para `public/images/logos/` (V2, principal, branca) e gerar `favicon.svg`/png do símbolo (`BUFALO VERMELHO@4x.png`).

- [ ] **Step 2: `extract_images.py`** — usa pymupdf para extrair/recortar as fotos de produto das páginas do catálogo e exporta WebP (largura ~800px, qualidade ~80) em `public/images/produtos/`. Onde não houver foto isolável por produto, usar a foto da página da categoria como fallback e registrar no log. Também recortar amostras de cores da Linha 120 para `public/images/produtos/cores/` (para a cartela).

- [ ] **Step 3: Rodar e conferir** que existe ≥1 imagem por categoria.

Run: `python3 scripts/extract_images.py && ls public/images/produtos | wc -l`
Expected: vários WebP gerados; log lista produtos sem foto dedicada (placeholder).

- [ ] **Step 4: Definir placeholder** elegante (bloco vermelho com símbolo Búfalo) para produtos sem foto.

- [ ] **Step 5: Commit** `git add -A && git commit -m "feat: extração e otimização de imagens do catálogo"`

---

## Task 5: BaseLayout, Header, Footer, WhatsAppFloat

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/WhatsAppFloat.astro`, `src/data/seo.ts`

- [ ] **Step 1: `seo.ts`** — objeto com `{title, description}` por página (modelos da spec §7 / `04_Especificacao_Tecnica_SEO.md`).

- [ ] **Step 2: `BaseLayout.astro`** — recebe `title`, `description`, `og`. Monta `<head>`: charset, viewport, title, description, canonical, OG/Twitter, Google Fonts `<link>`, import dos CSS, favicon, JSON-LD `Organization`. Renderiza `<Header/>`, `<slot/>`, `<Footer/>`, `<WhatsAppFloat/>`.

- [ ] **Step 3: `Header.astro`** — fixo, logo V2 (link p/ home), menu (Início · A Marca · Produtos · Qualidade · Seja um Revendedor · Contato), botão WhatsApp. Hamburguer no mobile (JS mínimo, acessível: `aria-expanded`).

- [ ] **Step 4: `Footer.astro`** — fundo vermelho/escuro, logo branco, contato (WhatsApp + e-mail `[CONFIRMAR]`), redes (placeholder), tagline "Búfalo · Força e Qualidade", "© 2026 Linhas Búfalo".

- [ ] **Step 5: `WhatsAppFloat.astro`** — botão fixo inferior direito, `waLink()`, `target="_blank" rel="noopener"`, `aria-label="Fale conosco"`, tooltip.

- [ ] **Step 6: Verificar build + visual** (criar `index.astro` temporário usando BaseLayout).

Run: `npm run build`
Expected: sucesso; header/footer/float presentes.

- [ ] **Step 7: Commit** `git add -A && git commit -m "feat: layout base, header, footer, botão flutuante whatsapp"`

---

## Task 6: Componentes de assinatura (ColorRing, StitchDivider, FeatureStrip, CTASection)

**Files:**
- Create: `src/components/ColorRing.astro`, `src/components/StitchDivider.astro`, `src/components/FeatureStrip.astro`, `src/components/CTASection.astro`

- [ ] **Step 1: `ColorRing.astro`** — anel de bolinhas coloridas via JS (24 dots em círculo, paleta representativa), selo central "100+ Cores". Animação `pop` escalonada ao carregar; `prefers-reduced-motion` desativa animação. Sem dependências.

- [ ] **Step 2: `StitchDivider.astro`** — divisor com linha tracejada (motivo costura), opcionalmente animado no scroll (IntersectionObserver, leve).

- [ ] **Step 3: `FeatureStrip.astro`** — 4 diferenciais (Resistência · Centenas de cores · Indústria e ateliê · Presença nacional) com ícone + texto (copy da spec/§Home).

- [ ] **Step 4: `CTASection.astro`** — faixa CTA reutilizável (props: título, texto, label, mensagem WhatsApp).

- [ ] **Step 5: Verificar build** `npm run build` → sucesso.

- [ ] **Step 6: Commit** `git add -A && git commit -m "feat: componentes de assinatura (anel de cores, divisor, faixas)"`

---

## Task 7: Home (`index.astro`)

**Files:**
- Create/replace: `src/pages/index.astro`
- Use: `ColorRing`, `FeatureStrip`, `CategoryGrid`(Task 8), `ProductCard`(Task 8), `CTASection`, `StitchDivider`

- [ ] **Step 1: Montar seções na ordem da spec (§5):** Hero (ColorRing + headline **"A linha que não quebra na hora H"** + subtítulo + 2 CTAs) → FeatureStrip → 8 categorias → destaques (produtos `destaque===true`) → resumo "A Marca" + link → faixa revendedor (CTA `waMsg.revendedor`) → footer (via layout). Copy literal de `03_Conteudo_Copy.md`.

- [ ] **Step 2: Verificar build.** (CategoryGrid/ProductCard podem ser stubs até Task 8; ordenar Task 8 antes se necessário.)

- [ ] **Step 3: Checagem visual no navegador**

Run: `npm run preview` e abrir a Home; conferir hero animado, CTAs com `wa.me`, sem preço.

- [ ] **Step 4: Commit** `git add -A && git commit -m "feat: página Home"`

---

## Task 8: ProductCard, CategoryGrid, ColorSwatches e template de categoria

**Files:**
- Create: `src/components/ProductCard.astro`, `src/components/CategoryGrid.astro`, `src/components/ColorSwatches.astro`, `src/pages/produtos/[slug].astro`

- [ ] **Step 1: `ProductCard.astro`** — props do produto. Renderiza foto (lazy, `alt` descritivo ex.: "Cone de Linha 120 Búfalo"), nome, composição, medida, embalagem, nº de cores, botão "Saber mais no WhatsApp" com `waLink(waMsg.produto(nome))`. **Nunca renderizar preço.**

- [ ] **Step 2: `CategoryGrid.astro`** — grid das 8 categorias (de `categorias.json`), cada card linka `/produtos/{slug}`.

- [ ] **Step 3: `ColorSwatches.astro`** — cartela navegável das 100+ cores da Linha 120 (imagens/recortes da Task 4 ou swatches de cor com código). Usada na categoria Linhas para o produto Linha 120 1.500m em vez de listar como produto.

- [ ] **Step 4: `produtos/[slug].astro`** — `getStaticPaths()` a partir de `categorias.json`. Cabeçalho (nome + descrição) → grid de `ProductCard` (produtos filtrados pela categoria) → `ColorSwatches` quando categoria = linhas → `CTASection`. Meta dinâmica via `seo.ts`/modelo.

- [ ] **Step 5: Verificar 8 páginas geradas**

Run: `npm run build && ls dist/produtos`
Expected: 8 diretórios de categoria + index.

- [ ] **Step 6: Commit** `git add -A && git commit -m "feat: card de produto, grid e template de categoria"`

---

## Task 9: Produtos índice + páginas institucionais (A Marca, Qualidade, Revendedor, Contato, 404, Privacidade)

**Files:**
- Create: `src/pages/produtos/index.astro`, `a-marca.astro`, `qualidade.astro`, `revendedor.astro`, `contato.astro`, `404.astro`, `privacidade.astro`

- [ ] **Step 1: `produtos/index.astro`** — título "Nossos Produtos" + intro + `CategoryGrid` + CTA. (Título "Tudo para a sua costura, com a força da Búfalo" — copy.)

- [ ] **Step 2: `a-marca.astro`** — abertura, Missão/Visão/Valores (blocos), posicionamento, presença nacional, CTA. História com placeholder `[CONFIRMAR]` visível.

- [ ] **Step 3: `qualidade.astro`** — blocos "Por que costurar com Búfalo" (copy), aplicações, variedade, CTA.

- [ ] **Step 4: `revendedor.astro`** — chamada, benefícios, CTA `waMsg.revendedor`.

- [ ] **Step 5: `contato.astro`** — WhatsApp destaque, e-mail `[CONFIRMAR]`, redes placeholder, botão grande. (Sem formulário nesta fase → sem necessidade de Política de Privacidade obrigatória; criar `privacidade.astro` como placeholder simples.)

- [ ] **Step 6: `404.astro`** — "Esse ponto se perdeu." + botão voltar ao início.

- [ ] **Step 7: Verificar build** `npm run build` → todas as páginas geradas.

- [ ] **Step 8: Commit** `git add -A && git commit -m "feat: produtos índice e páginas institucionais"`

---

## Task 10: SEO, sitemap, robots, schema, Open Graph

**Files:**
- Create: `public/robots.txt`, `public/images/og-default.png`
- Modify: `BaseLayout.astro` (OG/Twitter/JSON-LD), `produtos/[slug].astro` (JSON-LD `Product` sem `offers`)

- [ ] **Step 1: `robots.txt`** (permitir tudo + sitemap URL). Sitemap já gerado pela integração (Task 1).

- [ ] **Step 2: OG/Twitter** no BaseLayout com imagem default (logo sobre fundo vermelho). Gerar `og-default.png`.

- [ ] **Step 3: JSON-LD** — `Organization` no layout; `Product` por produto (**sem `offers`/preço**).

- [ ] **Step 4: Validar** que nenhuma página contém preço/`offers`.

Run: `grep -ri "R$\|price\|offers\|preço" dist/ || echo "OK sem preço"`
Expected: `OK sem preço` (ou só ocorrências legítimas de schema sem valor).

- [ ] **Step 5: Commit** `git add -A && git commit -m "feat: SEO completo (sitemap, robots, OG, schema sem preço)"`

---

## Task 11: Verificação final — responsividade, acessibilidade, performance, smoke test

**Files:**
- Create: `tests/smoke.spec.ts`

- [ ] **Step 1: Smoke test Playwright** — para cada rota: status 200, há exatamente um `<h1>`, botão flutuante WhatsApp presente com `wa.me/5581983426557`, nenhuma string de preço, imagens têm `alt`. Usar a skill `webapp-testing`/`run` para servir o preview.

Run: `npm run build && npm run preview & npx playwright test tests/smoke.spec.ts`
Expected: todos passam.

- [ ] **Step 2: Checagem responsiva** — screenshots mobile (375px) e desktop (1280px) da Home e de 1 categoria; validar menu hamburguer e cards.

- [ ] **Step 3: Acessibilidade** — contraste AA, foco visível, navegação por teclado, `prefers-reduced-motion` respeitado no anel.

- [ ] **Step 4: Checklist de entrega** (spec §12 / `04_Especificacao_Tecnica_SEO.md` §9) — marcar item a item; listar pendências `[CONFIRMAR]`.

- [ ] **Step 5: Commit** `git add -A && git commit -m "test: smoke + verificação final de entrega"`

---

## Notas de execução

- **Ordem de marcos (spec §11):** Tasks 1–8 = Marco 1 (Home + system + 1 categoria-template) → **ponto de validação visual com o cliente** antes de prosseguir. Tasks 9 = Marco 2. Tasks 10–11 = Marco 3.
- Após o Marco 1, pausar para o Diego validar o visual real no navegador antes de replicar tudo.
- Domínio, e-mail, história e fotos profissionais permanecem `[CONFIRMAR]` — não inventar.
- Commits frequentes; push para `origin/main` ao fim de cada marco.
