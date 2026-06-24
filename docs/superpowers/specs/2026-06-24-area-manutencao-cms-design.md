# Design — Área de Manutenção (CMS) do Site Búfalo

> Spec de design validada. Base para o plano de implementação.
> Data: 2026-06-24 · Feature: CMS Git-based para edição sem código

---

## 1. Objetivo

Permitir que uma pessoa autorizada **edite o site sem programar** — textos, fotos, catálogo de produtos e configurações — por uma área de manutenção (`/admin`). Custo zero, sem servidor próprio, conteúdo versionado no GitHub.

---

## 2. Decisões travadas (brainstorming)

| Decisão | Escolha |
|---|---|
| Tipo de CMS | **Git-based** (conteúdo = arquivos no repositório) |
| Ferramenta | **Sveltia CMS** (sucessor moderno do Decap) |
| Editável | Textos das páginas · Catálogo (produtos/categorias) · Configurações globais · Imagens |
| Acesso | **1 admin** (login GitHub, colaborador com escrita) — extensível depois |
| Custo/infra | **Grátis, sem servidor** (conteúdo no GitHub, rebuild ao salvar) |
| Hospedagem | **Vercel** (auto-deploy via GitHub) |
| Login do CMS | **GitHub OAuth** via Cloudflare Worker gratuito (`sveltia-cms-auth`) |
| Publicação | **Direta** (salvar = vai ao ar; sem fluxo de rascunho/aprovação por enquanto) |

---

## 3. Arquitetura

```
Admin → seusite.com/admin (Sveltia, estático) → login GitHub (via Cloudflare Worker)
      → edita em formulários → Sveltia faz commit no repo (branch main)
      → Vercel detecta o push → rebuild do site Astro → no ar em ~1 min
```

- **Sem backend e sem banco.** A fonte da verdade do conteúdo são arquivos no repositório.
- **Versionado:** todo save é um commit → histórico e desfazer pelo Git.
- **Único componente externo:** um Cloudflare Worker (grátis) que faz a ponte do OAuth do GitHub — configurado uma vez.

---

## 4. Modelo de conteúdo (refactor central)

Hoje os textos estão "chumbados" nos `.astro`. Serão movidos para conteúdo editável; as páginas passam a **ler** dessas fontes (sem texto fixo).

### 4.1 Textos das páginas — Astro Content Collections
`src/content/paginas/` (um arquivo JSON ou Markdown+frontmatter por página), com campos por seção:
- `home` — kicker, headline, subtítulo, CTAs, títulos de seção, faixa institucional, faixa revendedor.
- `a-marca` — título, abertura, missão, visão, valores[], posicionamento, presença nacional, história `[CONFIRMAR]`.
- `qualidade` — título, blocos[], aplicações[].
- `revendedor` — título, intro, benefícios[].
- `contato` — título, intro.

Schema validado via `src/content/config.ts` (Astro) → edições inválidas não quebram o build.

### 4.2 Catálogo — JSON
- `src/data/produtos.json` — lista de produtos `{id, categoria, categoriaSlug, nome, composicao, medida, embalagem, cores, destaque, obs, imagem}`.
- `src/data/categorias.json` — `{id, nome, slug, descricao, ordem, imagem}`.
- Editável no CMS: adicionar / editar / remover. A planilha `Bufalo_Catalogo_Estruturado.xlsx` + `build_data.py` passam a ser **semente inicial** (não usados no dia a dia).

### 4.3 Configurações globais — JSON
`src/data/config.json`: `{ whatsapp, email, redes{...}, dominio, tagline, ctas{...} }`. Os campos `[CONFIRMAR]` viram campos preenchíveis aqui.

### 4.4 Imagens
Upload pelo CMS para `public/images/uploads/` (mídia geral) e referência nas fichas de produto/categoria/páginas. Fotos profissionais enviadas substituem os recortes do catálogo. `build_images.py` segue como gerador de fallback.

---

## 5. Painel `/admin` (config do Sveltia)

Arquivos estáticos: `public/admin/index.html` (carrega o Sveltia) + `public/admin/config.yml` (define as coleções). Coleções, com rótulos em português:

| Coleção | Tipo | Campos principais |
|---|---|---|
| **Páginas** | files (1 entrada por página) | campos por seção (texto, textarea/markdown, listas) |
| **Produtos** | folder/list | nome, categoria (select), composição, medida, embalagem, nº de cores, destaque (toggle), foto (image), observação |
| **Categorias** | folder/list | nome, slug, descrição, ordem, imagem |
| **Configurações** | file único | WhatsApp, e-mail, redes, domínio, tagline, textos de CTA |
| **Mídia** | media library | `public/images/uploads/` |

Recursos: campos obrigatórios, preview de imagem, ajuda inline. Sem expor IDs/slugs técnicos quando evitável (gerados/automáticos onde fizer sentido).

---

## 6. Login (autenticação)

- **GitHub OAuth.** Fluxo: Sveltia → Cloudflare Worker (`sveltia-cms-auth`, deploy gratuito, set-once) → GitHub → volta autenticado.
- **Autorização:** só usuários com permissão de **escrita** no repositório conseguem salvar. Adicionar editores depois = adicionar colaborador no GitHub (ou migrar para uma org).
- Segredo do OAuth App fica no Worker (não no repositório).

---

## 7. Deploy e rebuild (Vercel)

- Conectar o repositório GitHub ao Vercel (projeto Astro, build `npm run build`, saída `dist/`).
- Todo push para `main` (inclusive os commits do CMS) dispara rebuild automático → site atualizado em ~1 min.
- Domínio: provisório `*.vercel.app` até o domínio próprio `[CONFIRMAR]` ser apontado.

---

## 8. Refactor das páginas

Cada página/área deixa de ter texto fixo e passa a importar das fontes da §4:
- Componentes/páginas leem de `getCollection('paginas')` / `config.json` / `produtos.json`.
- Sem mudança visual — só a origem do conteúdo muda. O build deve continuar verde e o smoke test (Marco 3) passar igual.
- Trabalho página a página: Home, A Marca, Qualidade, Revendedor, Contato, Produtos (índice + categorias usam config/catálogo).

---

## 9. Escopo e não-objetivos

**No escopo:** edição de textos, catálogo, config e imagens; login GitHub (1 admin); publicação direta; deploy Vercel; Worker de OAuth.

**Fora de escopo (fase futura):** papéis/permissões granulares (editor vs admin), fluxo de aprovação/rascunho, multi-idioma, criação livre de páginas novas pelo CMS, e-commerce.

---

## 10. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Edição inválida quebra o build | Schema das Content Collections valida campos; CMS usa os mesmos campos |
| Conflito entre planilha e JSON do CMS | A partir daqui, JSON do CMS é a fonte da verdade; planilha vira semente |
| Setup do Worker de OAuth (única peça "técnica") | Passo único documentado no plano; segredos só no Worker |
| Imagens grandes no repositório | Uploader otimiza/limita; orientação de tamanho no campo |
| Perda de conteúdo | Histórico do Git permite desfazer qualquer commit |

---

## 11. Critérios de sucesso

- `/admin` carrega, login com GitHub funciona, e usuário sem escrita no repo não consegue salvar.
- Editar um texto, um produto, uma config e uma imagem pelo painel → commit no repo → rebuild Vercel → mudança no ar.
- Todas as páginas leem das fontes de conteúdo (nenhum texto fixo remanescente nas áreas migradas).
- Build continua limpo e o smoke test do Marco 3 continua passando.
- Campos `[CONFIRMAR]` viram campos editáveis no painel.
- Documentação curta de "como editar o site" para o admin leigo.
