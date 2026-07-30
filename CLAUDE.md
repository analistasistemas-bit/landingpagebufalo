# CLAUDE.md — Landing Page Búfalo

Landing page estática da marca Búfalo (linha de costura) construída em Astro 7.
O cliente edita conteúdo via painel `/admin` (Sveltia CMS); o site reconstrói automaticamente na Vercel a cada commit.

---

## Stack

- **Framework:** Astro 7 (SSG, output estático em `dist/`)
- **Conteúdo editável:** Astro Content Collections — `src/content/paginas/*.json`
- **Config global:** `src/data/config.json` (WhatsApp, email, tagline, CTAs)
- **Produtos/Categorias:** `src/data/produtos.json`, `src/data/categorias.json`
- **CMS:** Sveltia CMS em `public/admin/` (Fase B — ✅ implementado; OAuth via Worker Cloudflare)
- **Deploy:** Vercel — ✅ conectada ao GitHub; deploy automático a cada push em `main`
- **Testes:** Playwright smoke (`npm run test:smoke`) — 9 rotas, servidor na porta 4321

## Comandos

```bash
npm run dev          # dev server em http://localhost:4321
npm run build        # build estático → dist/
npm run preview      # serve o dist/ localmente
npm run test:smoke   # smoke test Playwright (requer preview rodando na 4321)
```

Para rodar o smoke test corretamente:
```bash
npm run build && npm run preview &
sleep 3 && npm run test:smoke
pkill -f "astro preview"
```

---

## Arquitetura de conteúdo

### Textos das páginas
Cada página lê seu conteúdo via `getEntry('paginas', '<slug>')`:
- `src/content/paginas/home.json`
- `src/content/paginas/a-marca.json`
- `src/content/paginas/qualidade.json`
- `src/content/paginas/revendedor.json`
- `src/content/paginas/contato.json`

Schema zod centralizado em `src/content.config.ts`. Todos os campos são `.optional()` — o build não quebra se um campo faltar, mas o campo some da página.

### Config global
`src/data/config.json` é a fonte de verdade para WhatsApp, email e CTAs.
`src/data/whatsapp.ts` expõe `WA_NUMBER`, `waLink()`, `waMsg`, `EMAIL` — importar daqui, nunca hardcodar número ou link `wa.me/`.

### Produtos e categorias
- `src/data/produtos.json` — lista completa; `destaque: true` aparece na home
- `src/data/categorias.json` — cada categoria tem `slug`, `nome`, `desc`, `imagem`
- Imagens dos produtos em `public/images/produtos/{id}.webp`
- Uploads do CMS vão para `public/images/uploads/`

---

## Regras invioláveis

1. **Sem preço.** Nenhuma página exibe R$, "preço", "price" ou valor monetário. O smoke test verifica isso em todas as rotas — se quebrar, reverter.
2. **Smoke test sempre verde.** `npm run build` + `npm run test:smoke` devem passar (9/9) antes de qualquer commit. Nunca fazer merge com testes quebrados.
3. **Visual idêntico.** Mudanças de conteúdo não alteram layout. Mudanças de layout são revisadas visualmente antes do commit.
4. **WhatsApp via helper.** Sempre usar `waLink()` de `whatsapp.ts`. O smoke test verifica `wa.me/5581983426557` — se o número mudar no `config.json`, atualizar a asserção do teste também.

---

## Estado atual do CMS

| Fase | Tasks | Status |
|------|-------|--------|
| A — Conteúdo editável | Tasks 1–5 | ✅ completo (merge `d2868ec`) |
| B — Painel Sveltia | Tasks 6–7 | ✅ completo (painel + Worker OAuth ativos) |
| C — Deploy Vercel | Task 8 | ✅ ativo (deploy automático via push em `main`) |
| D — Docs + E2E | Task 9 | ⏳ próximo |

Plano detalhado: `docs/superpowers/plans/2026-06-24-area-manutencao-cms.md`

### Próximas tasks (Fase B)

**Task 6** — `public/admin/index.html` + `public/admin/config.yml` (só código, sem dependências externas).

**Task 7** — `infra/sveltia-auth-worker/` (Worker Cloudflare de OAuth). Requer ação do cliente:
- Criar OAuth App no GitHub (Settings → Developer settings → OAuth Apps)
- Criar conta Cloudflare gratuita e fazer `wrangler deploy`

---

## Itens aguardando confirmação do cliente

| Item | Onde usar |
|------|-----------|
| Domínio final | `astro.config.mjs` → `site`, `public/robots.txt`, `config.json` → `dominio` |
| E-mail de contato | `src/data/config.json` → `email` |
| Instagram / Facebook | `src/data/config.json` → `redes` |
| Fotos profissionais dos produtos | `public/images/produtos/{slug}.webp` |
| Google Analytics / Search Console | `src/layouts/BaseLayout.astro` |

---

## Convenção de commits

```
feat(cms): ...
refactor(cms): ...
chore(cms): ...
docs(cms): ...
```

Co-autor padrão:
```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```
