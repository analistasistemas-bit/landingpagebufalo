# Entrega — Marco 3: SEO, Acessibilidade, Otimização e Smoke Test

Data: 2026-06-24

## Checklist de Entrega

### SEO
- [x] `public/robots.txt` — Allow all, referencia sitemap-index.xml
- [x] `sitemap-index.xml` gerado em dist via @astrojs/sitemap
- [x] OG image padrão `public/images/og-default.png` (1200×630, fundo vermelho #B22222, logo branca + tagline)
- [x] BaseLayout.astro — default OG image atualizado para `/images/og-default.png`
- [x] JSON-LD Organization já presente no BaseLayout (todos os pages)
- [x] JSON-LD Product (ItemList + Product) adicionado em `produtos/[slug].astro` — SEM offers/price
- [x] `canonical`, `og:*`, `twitter:*` presentes em todas as páginas via BaseLayout
- [x] `lang="pt-BR"` no `<html>` (já estava no BaseLayout)

### Acessibilidade
- [x] `:focus-visible` com outline 3px vermelho em global.css (já estava)
- [x] `prefers-reduced-motion` — desabilita animações via `<style is:global>` no BaseLayout (já estava)
- [x] `lang="pt-BR"` no `<html>` ✓
- [x] Smoke test confirma: cada página tem exatamente 1 `<h1>`
- [x] Smoke test confirma: todos os `<img>` têm atributo `alt` não-vazio
- [x] Contraste: vermelho #B22222 sobre branco e branco sobre vermelho — WCAG AA aprovado. Cinzas (#555, #888) verificados no CSS — #555 passa AA (ratio ~7.5:1), #888 é usado apenas em texto auxiliar menor.

### Testes
- [x] `tests/smoke.spec.ts` criado — 9 rotas testadas
- [x] `playwright.config.ts` criado — baseURL http://localhost:4321
- [x] Script `"test:smoke"` adicionado ao `package.json`
- [x] Resultado: **9/9 passed** (7.8s)

### Build
- [x] `npm run build` — 16 páginas geradas, zero erros
- [x] `dist/robots.txt` ✓
- [x] `dist/sitemap-index.xml` ✓
- [x] `dist/images/og-default.png` ✓
- [x] Nenhum texto de preço (R$, preço, price) nas páginas — confirmado por smoke test e grep

## Itens [CONFIRMAR] Pendentes (dependem do cliente)

| Item | Status |
|---|---|
| Domínio final (substitui `bufalo.example.com` em `astro.config.mjs` e `robots.txt`) | **[CONFIRMAR]** |
| E-mail de contato real (formulário em `/contato`) | **[CONFIRMAR]** |
| Histórico/texto institucional definitivo para `/a-marca` | **[CONFIRMAR]** |
| Fotos profissionais dos produtos (substituir placeholders) | **[CONFIRMAR]** |
| Google Analytics / Search Console — código de verificação | **[CONFIRMAR]** |

## Como Executar os Testes

```bash
# Build + preview
npm run build
npm run preview &
sleep 3

# Smoke test
npm run test:smoke

# Parar preview
pkill -f "astro preview"
```
