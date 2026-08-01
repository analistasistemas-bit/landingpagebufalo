# Home Prototype with Analysis Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated `/prototipo` Astro landing page that demonstrates every approved P1/P2 improvement and lets the reviewer toggle seven on-screen annotations without changing `/`.

**Architecture:** The prototype owns its route, content configuration, shell, header, footer, sections, and annotation UI under a `prototype/` component boundary. It imports existing catalog JSON, logo/image assets, design tokens, WhatsApp helpers, `ColorRing`, `ProductCard`, and `WhatsAppFloat` read-only. Playwright drives the implementation through route isolation, content, interaction, accessibility, and four-viewport tests.

**Tech Stack:** Astro 7, TypeScript, scoped Astro CSS, existing JSON catalog data, vanilla client-side JavaScript, Playwright 1.61.

## Global Constraints

- Do not modify `src/pages/index.astro` or change the rendered output of `/`.
- Do not add `/prototipo` to public navigation, sitemap, robots directives, CMS configuration, or homepage CTAs.
- Use the existing Búfalo identity, `PRODUCT.md`, `DESIGN.md`, logo assets, catalog JSON, and WhatsApp helpers; do not create a second visual system.
- The only general color-count claim is `500 cores`; the prototype must not render `100+`.
- Render exactly eight priority categories: `linhas-de-costura`, `fios-overloque`, `ziperes`, `elasticos`, `passamanarias`, `botoes-de-pressao`, `tesouras`, and `fita-metrica`.
- Never render `[CONFIRMAR]`, `[em breve]`, invented claims, prices, testimonials, certifications, customers, or unsupported technical numbers.
- All normal text must meet WCAG AA 4.5:1 contrast; all interactive targets must be at least 44×44px.
- Use a continuous heading outline: one `h1`, section `h2` elements, and `h3` only beneath the corresponding `h2`.
- The mobile menu and annotation drawer must close with Escape and restore focus to the opener.
- No horizontal overflow at 320×700, 390×844, 768×1024, or 1440×900.
- Analysis mode starts on, persists only for the current browser session, and leaves no layout residue when off.
- Respect `prefers-reduced-motion` by removing displacement/stagger while preserving immediate color, outline, expanded/collapsed, and selected-state feedback.
- Preserve all unrelated dirty/untracked workspace files. Stage only files named by the current task.
- Prefix every shell command with `rtk`, including every segment in command chains.

---

## File Structure

| Path | Responsibility |
|---|---|
| `src/pages/prototipo.astro` | Compose the isolated prototype route and select catalog records. |
| `src/data/prototype-home.ts` | Typed audience paths, exact priority slugs, and seven annotation records. |
| `src/components/prototype/PrototypeShell.astro` | HTML document, metadata, fonts, global prototype chrome, and slots. |
| `src/components/prototype/PrototypeHeader.astro` | Prototype navigation and accessible responsive menu. |
| `src/components/prototype/PrototypeHero.astro` | Corrected 500-color hero and jump/WhatsApp actions. |
| `src/components/prototype/AudiencePaths.astro` | Four audience/use-case gateways. |
| `src/components/prototype/PriorityCategories.astro` | Exact eight-category subset and catalog CTA. |
| `src/components/prototype/TechnicalProof.astro` | Real technical fields from highlighted products. |
| `src/components/prototype/PrototypeConversion.astro` | Separate buyer and reseller conversion paths. |
| `src/components/prototype/PrototypeFooter.astro` | Verified WhatsApp and navigation only. |
| `src/components/prototype/AnalysisNoteList.astro` | Reusable semantic rendering for the seven notes in panel and drawer. |
| `src/components/prototype/AnalysisOverlay.astro` | Toggle, desktop panel, markers, mobile drawer, focus behavior, and session state. |
| `tests/prototype.spec.ts` | Isolation, content, interaction, accessibility, and viewport regression tests. |
| `package.json` | Add a focused `test:prototype` script. |

---

### Task 1: Create the Isolated Route Shell

**Files:**
- Create: `tests/prototype.spec.ts`
- Create: `src/components/prototype/PrototypeShell.astro`
- Create: `src/components/prototype/PrototypeHeader.astro`
- Create: `src/components/prototype/PrototypeFooter.astro`
- Create: `src/pages/prototipo.astro`
- Modify: `package.json`

**Interfaces:**
- Produces: `PrototypeShell` with `title: string`, `description: string`, and a default slot.
- Produces: `.prototype-page[data-prototype="true"]` as the stable test and styling root.
- Produces: `#prototype-nav`, `#prototype-menu-toggle`, and `footer[data-prototype-footer]` selectors for later tasks.
- Consumes: `waLink()`, `waDisplay()`, `WhatsAppIcon`, and `WhatsAppFloat` without modifying them.

- [ ] **Step 1: Add the focused Playwright script**

In `package.json`, add the script after `test:smoke`:

```json
"test:prototype": "playwright test tests/prototype.spec.ts"
```

- [ ] **Step 2: Write the failing route-isolation test**

Create `tests/prototype.spec.ts`:

```ts
import { test, expect } from 'playwright/test';

test.describe('prototype route isolation', () => {
  test('/prototipo owns a prototype shell', async ({ page }) => {
    const response = await page.goto('/prototipo');
    expect(response?.status()).toBe(200);
    await expect(page.locator('[data-prototype="true"]')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('footer[data-prototype-footer]')).toHaveCount(1);
  });

  test('/ remains outside prototype mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-prototype="true"]')).toHaveCount(0);
    await expect(page.locator('[data-analysis-toggle]')).toHaveCount(0);
  });
});
```

- [ ] **Step 3: Run the focused test and confirm RED**

Keep the existing Astro server at `http://localhost:4321` running, then run:

```bash
rtk npm run test:prototype
```

Expected: FAIL because `/prototipo` does not exist or does not contain `[data-prototype="true"]`.

- [ ] **Step 4: Implement the minimal isolated document shell**

Create `PrototypeShell.astro` with a full HTML document so it does not inherit the current production `Header` or `Footer`:

```astro
---
import '../../styles/global.css';
import PrototypeHeader from './PrototypeHeader.astro';
import PrototypeFooter from './PrototypeFooter.astro';
import WhatsAppFloat from '../WhatsAppFloat.astro';

interface Props { title: string; description: string }
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700;800&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div class="prototype-page" data-prototype="true">
      <PrototypeHeader />
      <main id="conteudo-principal"><slot /></main>
      <PrototypeFooter />
      <WhatsAppFloat />
    </div>
  </body>
</html>
```

Create `PrototypeHeader.astro` with the official header logo, links to `#caminhos`, `#categorias`, `#prova`, and `#contato`, and this mobile-control contract:

```astro
<button id="prototype-menu-toggle" type="button" aria-expanded="false" aria-controls="prototype-nav" aria-label="Abrir menu">
  <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
</button>
<nav id="prototype-nav" aria-label="Navegação do protótipo">
  <a href="#caminhos">Para o seu trabalho</a>
  <a href="#categorias">Categorias</a>
  <a href="#prova">Prova técnica</a>
  <a href="#contato">Contato</a>
</nav>
```

Set `min-width: 44px; min-height: 44px`. Use mobile rules through `max-width: 767px` and desktop rules from `min-width: 768px`, never two inclusive rules at 768px.

Create `PrototypeFooter.astro` with only the white logo, `waDisplay()`, a WhatsApp link from `waLink()`, prototype section links, privacy link, and copyright. Do not import or render `EMAIL` or social placeholders.

Create `src/pages/prototipo.astro`:

```astro
---
import PrototypeShell from '../components/prototype/PrototypeShell.astro';
---
<PrototypeShell
  title="Protótipo da Home | Búfalo"
  description="Protótipo anotado da home Búfalo com melhorias de navegação, prova e acessibilidade."
>
  <section aria-labelledby="prototype-title">
    <div class="container">
      <h1 id="prototype-title">Protótipo da Home Búfalo</h1>
    </div>
  </section>
</PrototypeShell>
```

- [ ] **Step 5: Run the focused test and confirm GREEN**

```bash
rtk npm run test:prototype
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit the isolated shell**

```bash
rtk git add package.json tests/prototype.spec.ts src/pages/prototipo.astro src/components/prototype/PrototypeShell.astro src/components/prototype/PrototypeHeader.astro src/components/prototype/PrototypeFooter.astro
rtk git commit -m "feat(prototype): add isolated annotated home shell"
```

---

### Task 2: Add Typed Content, Corrected Hero, and Audience Paths

**Files:**
- Create: `src/data/prototype-home.ts`
- Create: `src/components/prototype/PrototypeHero.astro`
- Create: `src/components/prototype/AudiencePaths.astro`
- Modify: `src/pages/prototipo.astro`
- Modify: `tests/prototype.spec.ts`

**Interfaces:**
- Produces: `type AudiencePath`, `type AnalysisNote`, `priorityCategorySlugs`, `audiencePaths`, and `analysisNotes` from `prototype-home.ts`.
- Produces: `#caminhos`, four `[data-audience-path]` links, and `#categorias` jump target consumed by Task 3.
- Consumes: `ColorRing` with `label="500"`, `sublabel="CORES"`; `waLink()`; existing category slugs only.

- [ ] **Step 1: Extend the test with hero and audience requirements**

Append to `tests/prototype.spec.ts`:

```ts
test('hero uses verified proof and four audience paths', async ({ page }) => {
  await page.goto('/prototipo');
  const main = page.locator('main');
  await expect(main.getByText('500 cores', { exact: false })).toBeVisible();
  await expect(main.getByText('100+', { exact: false })).toHaveCount(0);
  await expect(page.locator('[data-audience-path]')).toHaveCount(4);
  await expect(page.locator('[data-audience-path] img')).toHaveCount(4);
  await expect(page.locator('#caminhos h2')).toHaveText('Escolha pelo seu trabalho');
  await expect(page.locator('a[href="#categorias"]')).toBeVisible();
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

```bash
rtk npm run test:prototype
```

Expected: the new test fails because the hero and audience paths do not exist.

- [ ] **Step 3: Create the typed presentation configuration**

Create `src/data/prototype-home.ts` with these exact exports:

```ts
export type AudiencePath = {
  id: 'industria' | 'atelie' | 'loja' | 'artesanato';
  title: string;
  description: string;
  imageCategorySlug: string;
  categorySlugs: readonly string[];
};

export type AnalysisNote = {
  id: number;
  target: string;
  title: string;
  problem: string;
  change: string;
  benefit: string;
};

export const priorityCategorySlugs = [
  'linhas-de-costura', 'fios-overloque', 'ziperes', 'elasticos',
  'passamanarias', 'botoes-de-pressao', 'tesouras', 'fita-metrica',
] as const;

export const audiencePaths: readonly AudiencePath[] = [
  { id: 'industria', title: 'Produção industrial e confecções', description: 'Resistência, ficha técnica e fornecimento para produção em escala.', imageCategorySlug: 'linhas-de-costura', categorySlugs: ['linhas-de-costura', 'fios-overloque'] },
  { id: 'atelie', title: 'Ateliês e costureiras', description: 'Materiais confiáveis para máquina doméstica, ajustes e peças sob medida.', imageCategorySlug: 'ziperes', categorySlugs: ['ziperes', 'elasticos'] },
  { id: 'loja', title: 'Lojas e armarinhos', description: 'Produtos reconhecidos, variedade e itens de recompra para o balcão.', imageCategorySlug: 'botoes-de-pressao', categorySlugs: ['botoes-de-pressao', 'fita-metrica'] },
  { id: 'artesanato', title: 'Artesanato e consumidor final', description: 'Acabamentos, cores e ferramentas para projetos criativos.', imageCategorySlug: 'passamanarias', categorySlugs: ['passamanarias', 'tesouras'] },
] as const;

export const analysisNotes: readonly AnalysisNote[] = [
  { id: 1, target: 'hero', title: 'Uma prova comercial coerente', problem: 'A página alternava entre “100+” e “500 cores”.', change: 'A mensagem foi unificada em “500 cores”.', benefit: 'Mais confiança nas provas comerciais.' },
  { id: 2, target: 'caminhos', title: 'Orientação desde o início', problem: 'O público não encontrava uma entrada adequada ao seu trabalho.', change: 'Quatro caminhos por público e uso orientam a navegação.', benefit: 'Decisão mais rápida.' },
  { id: 3, target: 'categorias', title: 'Catálogo com prioridade', problem: 'Vinte e quatro categorias tinham o mesmo peso na home.', change: 'Oito categorias prioritárias representam a amplitude do catálogo.', benefit: 'Menor carga cognitiva e menos rolagem.' },
  { id: 4, target: 'prova', title: 'Prova antes da conversão', problem: 'A evidência técnica aparecia tarde na jornada.', change: 'Produtos e dados técnicos reais aparecem antes dos CTAs finais.', benefit: 'Mais segurança para compradores profissionais.' },
  { id: 5, target: 'legibilidade', title: 'Leitura mais confortável', problem: 'Texto auxiliar pequeno e contraste insuficiente dificultavam a leitura.', change: 'Corpo e cor foram ajustados para o nível AA.', benefit: 'Melhor leitura em mobile e para pessoas com baixa visão.' },
  { id: 6, target: 'menu', title: 'Menu móvel acessível', problem: 'O controle era pequeno e incompleto para teclado.', change: 'O alvo agora tem 44px, fecha com Escape e restaura o foco.', benefit: 'Melhor uso com uma mão e teclado.' },
  { id: 7, target: 'rodape', title: 'Fechamento confiável', problem: 'O rodapé publicava canais ainda pendentes.', change: 'Somente canais confirmados são exibidos.', benefit: 'Um fechamento mais confiável.' },
] as const;
```

- [ ] **Step 4: Implement the corrected hero**

Create `PrototypeHero.astro` with:

```astro
---
import ColorRing from '../ColorRing.astro';
import { waLink } from '../../data/whatsapp';
---
<section class="prototype-hero" data-analysis-section="hero" aria-labelledby="prototype-title">
  <div class="container prototype-hero__inner">
    <div class="prototype-hero__copy">
      <p class="prototype-hero__kicker">500 cores · uma força só</p>
      <h1 id="prototype-title">A força que você confia com a qualidade que você precisa.</h1>
      <p>Linhas de costura e aviamentos para indústria, ateliê, loja e artesanato. De norte a sul do Brasil.</p>
      <div class="prototype-hero__actions">
        <a class="btn btn--primary" href="#caminhos">Encontre seu caminho</a>
        <a class="btn btn--ghost" href={waLink()} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
      </div>
    </div>
    <ColorRing label="500" sublabel="CORES" />
  </div>
</section>
```

Style mobile as one centered column; switch to a two-column row only at `min-width: 768px`. Use only documented typography sizes or add a deliberate, named step to `DESIGN.md` in a separate approved task; this prototype should use the existing ramp.

- [ ] **Step 5: Implement the four audience gateways**

Create `AudiencePaths.astro` that imports `categorias.json`, resolves each `imageCategorySlug`, and maps `audiencePaths` into a semantic list under one `h2`. Each item must render the resolved real category image with descriptive alt text, use `data-audience-path={path.id}`, and link to `#categorias` with `data-category-filter={path.categorySlugs.join(',')}`. Render title, description, related category names, and the visible action “Ver categorias relacionadas”. If an image record is missing, omit that card so the exact-count test exposes the source-data issue. Use a 1→2→4 grid at 640px and 1024px.

Update `prototipo.astro` to render `<PrototypeHero />` and `<AudiencePaths />` instead of the temporary section.

- [ ] **Step 6: Run the focused test and confirm GREEN**

```bash
rtk npm run test:prototype
```

Expected: all prototype tests pass, including exactly four audience paths and no `100+` text.

- [ ] **Step 7: Commit hero and audience navigation**

```bash
rtk git add src/data/prototype-home.ts src/components/prototype/PrototypeHero.astro src/components/prototype/AudiencePaths.astro src/pages/prototipo.astro tests/prototype.spec.ts
rtk git commit -m "feat(prototype): guide visitors by audience"
```

---

### Task 3: Add Eight Priority Categories, Technical Proof, and Conversion

**Files:**
- Create: `src/components/prototype/PriorityCategories.astro`
- Create: `src/components/prototype/TechnicalProof.astro`
- Create: `src/components/prototype/PrototypeConversion.astro`
- Modify: `src/pages/prototipo.astro`
- Modify: `tests/prototype.spec.ts`

**Interfaces:**
- `PriorityCategories` consumes `categories: readonly Category[]`, where `Category` matches the JSON fields `id`, `nome`, `slug`, `descricao`, `ordem`, and `imagem`.
- `TechnicalProof` consumes `products: readonly Product[]`, matching the current `produtos.json` shape.
- `PrototypeConversion` consumes no props and uses `waMsg.atacado`, `waMsg.revendedor`, and `waLink()`.
- Produces: `#categorias`, `#prova`, `#contato`, eight `[data-priority-category]`, and `[data-proof-product]`.

- [ ] **Step 1: Add failing catalog, proof, and footer-content tests**

Append:

```ts
test('prototype prioritizes eight real categories and keeps the full catalog separate', async ({ page }) => {
  await page.goto('/prototipo');
  await expect(page.locator('[data-priority-category]')).toHaveCount(8);
  const hrefs = await page.locator('[data-priority-category]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(hrefs).toEqual([
    '/produtos/linhas-de-costura', '/produtos/fios-overloque', '/produtos/ziperes', '/produtos/elasticos',
    '/produtos/passamanarias', '/produtos/botoes-de-pressao', '/produtos/tesouras', '/produtos/fita-metrica',
  ]);
  await expect(page.getByRole('link', { name: 'Ver catálogo completo' })).toHaveAttribute('href', '/produtos');
});

test('technical proof and conversion contain only confirmed content', async ({ page }) => {
  await page.goto('/prototipo');
  await expect(page.locator('[data-proof-product]')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Comprar em volume' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Quero ser revendedor' })).toBeVisible();
  const body = await page.locator('body').innerText();
  expect(body).not.toContain('[CONFIRMAR]');
  expect(body).not.toContain('[em breve]');
  expect(body).not.toMatch(/R\$|preço|price/i);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

```bash
rtk npm run test:prototype
```

Expected: category, proof, and conversion selectors are missing.

- [ ] **Step 3: Select catalog records in the page composition**

In `prototipo.astro`, import `categorias.json`, `produtos.json`, and `priorityCategorySlugs`. Resolve records in slug order, not JSON order:

```ts
const priorityCategories = priorityCategorySlugs
  .map((slug) => categorias.find((category) => category.slug === slug))
  .filter((category): category is (typeof categorias)[number] => Boolean(category));

const proofProducts = produtos.filter((product) => product.destaque).slice(0, 3);
```

An absent category is omitted rather than crashing the build. The Playwright count test will catch missing source data.

- [ ] **Step 4: Implement priority-category cards**

Create `PriorityCategories.astro` with one `h2`, short intro, semantic list, and one anchor per category:

```astro
<a
  data-priority-category
  data-category-slug={category.slug}
  href={`/produtos/${category.slug}`}
  class="priority-category"
>
  <img src={category.imagem} alt={`${category.nome} — Búfalo`} width="480" height="320" loading="lazy" />
  <span class="priority-category__body">
    <h3>{category.nome}</h3>
    <span>{category.descricao}</span>
    <strong>Ver produtos →</strong>
  </span>
</a>
```

Use `#666666` or darker for supporting copy, at least `0.9rem` on mobile, 12px radius, and the existing rest/hover shadow vocabulary. End with a centered `<a href="/produtos">Ver catálogo completo</a>`.

- [ ] **Step 5: Implement proof and conversion**

Create `TechnicalProof.astro` with a visible `h2` and exactly three product summaries. Render only non-empty, non-`—` fields from `composicao`, `medida`, `embalagem`, `cores`, and `obs`. Use `<dl>` with text at `1rem` or `0.9rem` minimum and `#666666` or darker; do not use `<code>`.

Create `PrototypeConversion.astro`:

```astro
---
import { waLink, waMsg } from '../../data/whatsapp';
---
<section id="contato" aria-labelledby="conversion-title">
  <div class="container">
    <h2 id="conversion-title">Pronto para trabalhar com a força da Búfalo?</h2>
    <div class="prototype-conversion__actions">
      <a class="btn btn--ghost-white" href={waLink(waMsg.atacado)} target="_blank" rel="noopener noreferrer">Comprar em volume</a>
      <a class="btn btn--ghost-white" href={waLink(waMsg.revendedor)} target="_blank" rel="noopener noreferrer">Quero ser revendedor</a>
    </div>
  </div>
</section>
```

Compose `PriorityCategories`, `TechnicalProof`, and `PrototypeConversion` after `AudiencePaths` in `prototipo.astro`.

- [ ] **Step 6: Run the focused tests and confirm GREEN**

```bash
rtk npm run test:prototype
```

Expected: eight category links in the approved order, three proof products, two conversion paths, and no placeholders/prices.

- [ ] **Step 7: Commit the commercial journey**

```bash
rtk git add src/components/prototype/PriorityCategories.astro src/components/prototype/TechnicalProof.astro src/components/prototype/PrototypeConversion.astro src/pages/prototipo.astro tests/prototype.spec.ts
rtk git commit -m "feat(prototype): prioritize catalog and technical proof"
```

---

### Task 4: Add the Seven-Note Analysis Mode

**Files:**
- Create: `src/components/prototype/AnalysisNoteList.astro`
- Create: `src/components/prototype/AnalysisOverlay.astro`
- Modify: `src/components/prototype/PrototypeShell.astro`
- Modify: prototype section components to add stable `data-analysis-section` targets
- Modify: `tests/prototype.spec.ts`

**Interfaces:**
- `AnalysisOverlay` consumes `notes: readonly AnalysisNote[]`.
- `AnalysisNoteList` consumes `notes: readonly AnalysisNote[]` and renders the shared note markup without duplicating the mapping logic.
- Produces: `[data-analysis-toggle]`, `[data-analysis-panel]`, `[data-analysis-drawer]`, `[data-analysis-marker]`, and `html[data-analysis-mode="on|off"]`.
- Section components expose `data-analysis-section="hero|caminhos|categorias|prova|legibilidade|menu|rodape"`.
- Session key: `bufalo-prototype-analysis-mode`, value `on` or `off`.

- [ ] **Step 1: Add failing analysis-mode tests**

Append:

```ts
test('analysis mode starts on and can become a clean landing', async ({ page }) => {
  await page.goto('/prototipo');
  await expect(page.locator('html')).toHaveAttribute('data-analysis-mode', 'on');
  await expect(page.locator('[data-analysis-marker]')).toHaveCount(7);
  await expect(page.locator('[data-analysis-panel]')).toBeVisible();

  const toggle = page.locator('[data-analysis-toggle]');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-analysis-mode', 'off');
  await expect(page.locator('[data-analysis-panel]')).toBeHidden();
  await expect(page.locator('[data-analysis-marker]')).toBeHidden();

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-analysis-mode', 'off');
});

test('seven analysis records explain problem, change, and benefit in both views', async ({ page }) => {
  await page.goto('/prototipo');
  await page.evaluate(() => sessionStorage.removeItem('bufalo-prototype-analysis-mode'));
  await page.reload();
  await expect(page.locator('[data-analysis-note]')).toHaveCount(14);
  await expect(page.locator('[data-analysis-note] [data-note-problem]')).toHaveCount(14);
  await expect(page.locator('[data-analysis-note] [data-note-change]')).toHaveCount(14);
  await expect(page.locator('[data-analysis-note] [data-note-benefit]')).toHaveCount(14);
});

test('selecting a desktop note highlights its marker and section', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/prototipo');
  await page.locator('[data-analysis-panel] [data-analysis-note-button="3"]').click();
  await expect(page.locator('[data-analysis-marker="3"]')).toHaveAttribute('data-selected', 'true');
  await expect(page.locator('[data-analysis-section="categorias"]')).toHaveAttribute('data-selected', 'true');
  await expect(page.locator('[data-analysis-panel] [data-analysis-note-button="3"]')).toHaveAttribute('aria-pressed', 'true');
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

```bash
rtk npm run test:prototype
```

Expected: analysis selectors and `data-analysis-mode` are missing.

- [ ] **Step 3: Implement the overlay markup**

Create `AnalysisOverlay.astro`:

```astro
---
import type { AnalysisNote } from '../../data/prototype-home';
import AnalysisNoteList from './AnalysisNoteList.astro';
interface Props { notes: readonly AnalysisNote[] }
const { notes } = Astro.props;
---
<div class="analysis-toolbar" aria-label="Ferramentas do protótipo">
  <span>Protótipo</span>
  <button type="button" data-analysis-toggle aria-pressed="true">Modo análise: ligado</button>
  <button type="button" data-analysis-drawer-open aria-haspopup="dialog">7 melhorias</button>
</div>
<aside data-analysis-panel aria-label="Comentários das melhorias">
  <AnalysisNoteList notes={notes} />
</aside>
<div class="analysis-markers" aria-label="Marcadores das melhorias">
  {notes.map((note) => (
    <button
      type="button"
      data-analysis-marker={note.id}
      data-analysis-target={note.target}
      aria-label={`Selecionar melhoria ${note.id}: ${note.title}`}
    >{note.id}</button>
  ))}
</div>
<div data-analysis-drawer hidden role="dialog" aria-modal="true" aria-labelledby="analysis-drawer-title">
  <div role="document">
    <h2 id="analysis-drawer-title">7 melhorias aplicadas</h2>
    <button type="button" data-analysis-drawer-close aria-label="Fechar comentários">Fechar</button>
    <AnalysisNoteList notes={notes} />
  </div>
</div>
```

Create `AnalysisNoteList.astro` with the shared list markup:

```astro
---
import type { AnalysisNote } from '../../data/prototype-home';
interface Props { notes: readonly AnalysisNote[] }
const { notes } = Astro.props;
---
<ol>{notes.map((note) => (
  <li data-analysis-note data-note-id={note.id}>
    <button type="button" data-analysis-note-button={note.id} aria-pressed="false">
      <strong>{note.id}. {note.title}</strong>
      <span data-note-problem><b>Problema:</b> {note.problem}</span>
      <span data-note-change><b>Mudança:</b> {note.change}</span>
      <span data-note-benefit><b>Benefício:</b> {note.benefit}</span>
    </button>
  </li>
))}</ol>
```

Inside each note, render a button with `data-analysis-note-button={note.id}`, `aria-pressed="false"`, and labeled spans with `data-note-problem`, `data-note-change`, and `data-note-benefit`. Render one numbered button per note with `data-analysis-marker={note.id}` and an accessible label such as `Selecionar melhoria 3: Catálogo com prioridade`. Both the note and marker buttons call the same selection function. Selection sets `data-selected="true"` on the chosen button, marker, and matching `[data-analysis-section]`, removes it from the prior selection, and scrolls the section into view only when it is outside the viewport.

- [ ] **Step 4: Implement state without a UI dependency**

The inline module script must:

```ts
const key = 'bufalo-prototype-analysis-mode';
const root = document.documentElement;
const toggle = document.querySelector<HTMLButtonElement>('[data-analysis-toggle]');
const stored = sessionStorage.getItem(key);
let analysisOn = stored !== 'off';
let selectedNoteId: string | null = null;

function renderAnalysisMode() {
  root.dataset.analysisMode = analysisOn ? 'on' : 'off';
  toggle?.setAttribute('aria-pressed', String(analysisOn));
  if (toggle) toggle.textContent = `Modo análise: ${analysisOn ? 'ligado' : 'desligado'}`;
}

toggle?.addEventListener('click', () => {
  analysisOn = !analysisOn;
  sessionStorage.setItem(key, analysisOn ? 'on' : 'off');
  renderAnalysisMode();
});

renderAnalysisMode();
```

Wrap `sessionStorage` reads/writes in `try/catch`; the in-memory `analysisOn` value remains functional if storage is unavailable.

Implement `selectNote(id: string)` to synchronize `aria-pressed`, `data-selected`, the corresponding marker, and `[data-analysis-section]`. Calling it with the currently selected ID clears the selection. When analysis mode turns off, clear selection and close the drawer before rendering the clean state.

Desktop at `min-width: 1024px`: show the fixed/sticky side panel and reserve its width only when `data-analysis-mode="on"`. Mobile/tablet: hide the side panel, show “7 melhorias”, and render the drawer. When mode is off, hide panel, marker layer, drawer-open button, and all reserved space.

- [ ] **Step 5: Compose the overlay and section targets**

Import `analysisNotes` in `PrototypeShell.astro` and render `<AnalysisOverlay notes={analysisNotes} />` inside `.prototype-page`. Add all seven `data-analysis-section` values to their approved targets. The `legibilidade` note attaches to the technical-proof metadata block, `menu` to the header, and `rodape` to the footer.

- [ ] **Step 6: Run the focused tests and confirm GREEN**

```bash
rtk npm run test:prototype
```

Expected: seven notes/markers render; selecting a note highlights the matching marker and section; toggle hides everything and persists off across reload.

- [ ] **Step 7: Commit analysis mode**

```bash
rtk git add src/components/prototype/AnalysisNoteList.astro src/components/prototype/AnalysisOverlay.astro src/components/prototype/PrototypeShell.astro src/components/prototype/PrototypeHeader.astro src/components/prototype/PrototypeHero.astro src/components/prototype/AudiencePaths.astro src/components/prototype/PriorityCategories.astro src/components/prototype/TechnicalProof.astro src/components/prototype/PrototypeFooter.astro tests/prototype.spec.ts
rtk git commit -m "feat(prototype): explain improvements in analysis mode"
```

---

### Task 5: Harden Keyboard, Mobile Drawer, Headings, and Viewports

**Files:**
- Modify: `src/components/prototype/PrototypeHeader.astro`
- Modify: `src/components/prototype/AnalysisOverlay.astro`
- Modify: prototype section component styles as indicated by failing tests
- Modify: `tests/prototype.spec.ts`

**Interfaces:**
- Header exposes `aria-expanded`, `aria-controls="prototype-nav"`, and restores focus to `#prototype-menu-toggle` after Escape.
- Drawer exposes `[data-analysis-drawer][hidden]`, open/close buttons, `role="dialog"`, `aria-modal="true"`, and returns focus to `[data-analysis-drawer-open]`.
- Viewport tests consume `.prototype-page` scroll metrics and the stable prototype selectors from earlier tasks.

- [ ] **Step 1: Add failing keyboard and responsive tests**

Append:

```ts
test('mobile menu and analysis drawer support Escape and focus restoration', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/prototipo');

  const menu = page.locator('#prototype-menu-toggle');
  await expect(menu).toHaveCSS('min-width', '44px');
  await expect(menu).toHaveCSS('min-height', '44px');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();

  const drawerOpen = page.locator('[data-analysis-drawer-open]');
  await drawerOpen.click();
  await expect(page.locator('[data-analysis-drawer]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-analysis-drawer]')).toBeHidden();
  await expect(drawerOpen).toBeFocused();
});

for (const viewport of [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]) {
  test(`no horizontal overflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/prototipo');
    const metrics = await page.locator('.prototype-page').evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });
}

test('heading outline does not skip levels', async ({ page }) => {
  await page.goto('/prototipo');
  const levels = await page.locator('main h1, main h2, main h3').evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
  expect(levels[0]).toBe(1);
  for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

```bash
rtk npm run test:prototype
```

Expected: at least Escape/focus behavior fails until the handlers are implemented.

- [ ] **Step 3: Implement one close function per disclosure**

In `PrototypeHeader.astro`, define `closeMenu({ restoreFocus = false } = {})`; it removes the open class, sets `aria-expanded="false"`, restores the “Abrir menu” label, and optionally calls `menuToggle.focus()`. Use it from link clicks and document Escape handling.

In `AnalysisOverlay.astro`, define `openDrawer()` and `closeDrawer({ restoreFocus = true } = {})`. `openDrawer()` removes `hidden`, stores the opener, and focuses the close button. `closeDrawer()` sets `hidden`, clears any selected-note state, and restores focus. A single document `keydown` handler closes the topmost open prototype disclosure on Escape.

- [ ] **Step 4: Correct responsive and accessibility CSS**

- Header mobile ends at `767px`; desktop begins at `768px`.
- Menu toggle, drawer buttons, annotation selectors, and all CTA buttons use `min-width`/`min-height: 44px`.
- Supporting copy uses at least `0.9rem` on mobile and `#666666` on white.
- Panel width uses `clamp(17rem, 22vw, 21rem)` only at `min-width: 1024px`.
- Grids use `minmax(0, 1fr)` to prevent long-content overflow.
- Drawer uses `max-height: min(78vh, 44rem); overflow-y: auto;` and `padding-bottom: max(1rem, env(safe-area-inset-bottom));`.
- Under `prefers-reduced-motion: reduce`, remove transforms and staggered animation; keep color, outline, expanded, and visibility state changes immediate.

- [ ] **Step 5: Run focused tests and confirm GREEN**

```bash
rtk npm run test:prototype
```

Expected: keyboard, focus, outline, and all four viewport tests pass.

- [ ] **Step 6: Commit accessibility and responsive hardening**

```bash
rtk git add src/components/prototype/PrototypeHeader.astro src/components/prototype/AnalysisOverlay.astro src/components/prototype/PrototypeHero.astro src/components/prototype/AudiencePaths.astro src/components/prototype/PriorityCategories.astro src/components/prototype/TechnicalProof.astro src/components/prototype/PrototypeConversion.astro tests/prototype.spec.ts
rtk git commit -m "fix(prototype): harden responsive keyboard behavior"
```

---

### Task 6: Run Bounded Visual QA and Final Verification

**Files:**
- Modify only files named by concrete findings from the first visual pass.
- Test: `tests/prototype.spec.ts`

**Interfaces:**
- Consumes the finished `/prototipo` route and all stable selectors.
- Produces no new public API; this task proves the spec and records only necessary fixes.

- [ ] **Step 1: Build from a clean implementation state**

```bash
rtk npm run build
```

Expected: Astro build succeeds and lists `/prototipo/index.html` among generated pages.

- [ ] **Step 2: Run all automated tests**

With the Astro server available at `http://localhost:4321`, run:

```bash
rtk npm run test:prototype
rtk npm run test:smoke
rtk npm run test:content
```

Expected: every command exits 0. The existing smoke suite proves public routes still render; the prototype suite proves isolation and the new behavior.

- [ ] **Step 3: Run the Impeccable detector once**

```bash
rtk node /Users/diego/.agents/skills/impeccable/scripts/detect.mjs --json src/pages/prototipo.astro src/components/prototype
```

Expected: exit 0, or exit 2 only with findings that are individually inspected. Fix verified violations; record intentional advisories in the handoff rather than suppressing them silently.

- [ ] **Step 4: Perform one batched visual pass**

Use fresh browser tabs and inspect `/prototipo` at 1440×900 and 390×844 in the same pass. Capture both analysis-on and analysis-off states, plus the open mobile menu and open annotation drawer. Check:

- hero hierarchy and 500-color consistency;
- exactly four audience gateways and eight category cards;
- technical metadata readability;
- annotation-marker alignment and panel/drawer collisions;
- footer cleanliness and WhatsApp-float clearance.

Write one defect list before editing. Apply all confirmed defects in one patch batch.

- [ ] **Step 5: Run the single confirmation pass**

Repeat only the affected desktop/mobile screenshots once. Stop after confirming the batch; do not start an open-ended polish loop.

- [ ] **Step 6: Re-run final evidence commands**

```bash
rtk npm run build
rtk npm run test:prototype
rtk npm run test:smoke
rtk npm run test:content
rtk git diff --check
```

Expected: all commands exit 0 and `git diff --check` prints no errors.

- [ ] **Step 7: Verify the exact diff scope**

```bash
rtk git status --short
rtk git diff -- src/pages/index.astro
```

Expected: no diff for `src/pages/index.astro`; pre-existing untracked `.codex/`, `.impeccable/`, `PRODUCT.md`, and `DESIGN.md` remain untouched unless the user separately authorized them.

- [ ] **Step 8: Commit final verified fixes**

Stage only files changed by the bounded QA batch:

```bash
rtk git add src/pages/prototipo.astro src/components/prototype src/data/prototype-home.ts tests/prototype.spec.ts package.json
rtk git commit -m "test(prototype): verify annotated landing experience"
```

If Step 4 produced no source changes, skip this empty commit and report that the earlier task commits already contain the verified implementation.

---

## Acceptance Checklist

- [ ] `/prototipo` uses real catalog data and images and renders one `h1`.
- [ ] The hero contains `500 cores` and no `100+` text.
- [ ] Four audience paths and exactly eight approved category links render.
- [ ] Three highlighted products expose real technical fields without `<code>` styling.
- [ ] Buyer and reseller WhatsApp actions use existing contextual messages.
- [ ] The footer contains no pending email/social placeholders.
- [ ] Seven notes each expose problem, change, and benefit.
- [ ] Analysis mode starts on, persists for the session, and leaves no residue when off.
- [ ] Desktop panel and mobile drawer are keyboard-operable and Escape-safe.
- [ ] No overflow exists at 320, 390, 768, or 1440px.
- [ ] All prototype controls meet 44×44px and supporting copy meets AA contrast.
- [ ] Build, prototype tests, smoke tests, content-resilience tests, and `git diff --check` pass.
- [ ] `/` remains outside prototype mode and `src/pages/index.astro` has no diff.
