# Design — Site Institucional Búfalo

> Spec de design validada. Base para o plano de implementação.
> Data: 2026-06-24 · Marca: Búfalo (linhas de costura e aviamentos)

---

## 1. Objetivo

Site **institucional / vitrine** (não é loja) que apresenta a marca Búfalo, mostra o portfólio organizado por categoria e converte interesse em **contato via WhatsApp**. Mobile-first, rápido, SEO otimizado. Surpreender no design mantendo rigor com a identidade visual existente.

**Assinatura da marca:** *Força e Qualidade.*

**Fora de escopo (Fase 1):** carrinho, pagamento, preço, frete, login, e-commerce, back-end.

---

## 2. Decisões travadas (brainstorming)

| Decisão | Escolha |
|---|---|
| Stack | **Astro** (estático, mobile-first) |
| Direção de arte | **B · Color Power** — branco + vermelho dominante, tipografia Oswald grande |
| Elemento-assinatura | **Hero com anel de cores** (bolinhas = cones) + selo central **"100+ Cores"** |
| Amplitude do catálogo | Faixa das **8 categorias** logo abaixo do hero (não dentro do anel) |
| Animações | Sutis e performáticas (reveal, anel montando, hover) |
| Imagens | Extraídas do `Catálogo Búfalo 18-06.pdf`, tratadas e otimizadas (WebP) |
| WhatsApp | `+55 81 98342-6557` → `https://wa.me/5581983426557` |
| Entrega | Home + design system + 1 categoria-template primeiro; validar; depois replicar |

---

## 3. Design system

### 3.1 Cores (tokens CSS)
```css
:root{
  --bufalo-vermelho:#B22222;  /* dominante ~60% — CTAs, faixas, destaques */
  --bufalo-bordo:#6B0000;     /* hover, profundidade ~15% */
  --bufalo-cinza:#3D3D3D;     /* texto, fundos escuros ~15% */
  --bufalo-branco:#FFFFFF;    /* base de fundo */
  --bufalo-cinza-claro:#F2F2F2; /* seções alternadas */
  --texto-padrao:#3D3D3D;
}
```
Regras: vermelho nunca alterado; contraste mínimo AA; branco como base, cinza para texto.

### 3.2 Tipografia
- **Títulos/headlines:** Oswald (condensada, peso 600–800, uppercase, `letter-spacing` leve).
- **Corpo:** Open Sans (Roboto fallback).
- **Fichas técnicas/códigos:** monospace.
- Hierarquia: um `<h1>` por página → `h2` seções → corpo → legenda.
- O **logotipo Búfalo nunca é recriado em texto** — sempre arquivo de logo.

### 3.3 Logos por contexto
| Uso | Arquivo (`/Logo`) |
|---|---|
| Header | `LOGO PRINCIPAL - V2@4x.png` (sem animal) |
| Hero/destaques | `LOGO PRINCIPAL@4x.png` (com búfalo) |
| Footer (fundo escuro) | `LOGO SECUNDÁRIA - BRANCO@4x.png` |
| Favicon | símbolo isolado recortado de `BUFALO VERMELHO@4x.png` |

Regras do manual: área de proteção, sem distorção/recolorir/sombra, versão branca em fundo escuro.

### 3.4 Componentes-chave
- **Header fixo:** logo V2 + menu (Início · A Marca · Produtos · Qualidade · Seja um Revendedor · Contato) + botão WhatsApp. Menu hamburguer no mobile.
- **Botão flutuante WhatsApp:** canto inferior direito, todas as páginas, `target="_blank" rel="noopener"`, tooltip "Fale conosco".
- **Card de produto:** foto · nome · composição · metragem/tamanho · embalagem · nº de cores · botão "Saber mais no WhatsApp" (msg pré-preenchida com nome do produto). **Sem preço, sem carrinho.**
- **CTA padrão:** botão vermelho, texto branco, hover bordô, cantos arredondados.
- **Footer:** fundo vermelho/escuro, logo branco, contato, WhatsApp, redes (placeholder), © 2026 Linhas Búfalo.

---

## 4. Elementos-assinatura (o "wow")

1. **Hero anel de cores** — bolinhas coloridas (cones) formando um anel, selo central **"100+ Cores"**. Animação: bolinhas surgem uma a uma ao carregar. Headline **"A linha que não quebra na hora H"** (copy oficial, `03_Conteudo_Copy.md`) + subtítulo "Linhas de costura e aviamentos com a força e a qualidade que o seu trabalho merece. De norte a sul do Brasil." + CTA primário (Ver Produtos) e secundário (Falar no WhatsApp). _Obs.: "Tudo para a sua costura" é o título da página Produtos, não da Home._
2. **Faixa de 8 categorias** — grid logo abaixo do hero; garante amplitude do catálogo.
3. **Seção cartela interativa** — showcase navegável das 100+ cores da Linha 120 (cones do catálogo). Destaque visual principal do site, prova de "variedade".
4. **Motivo de costura** — linha tracejada que "costura" as seções ao rolar (sutil, decorativo, leve).

---

## 5. Arquitetura de páginas (16)

Conforme `Site/02_Mapa_do_Site.md` (já aprovado pelo cliente):

| # | Página | Slug |
|---|---|---|
| 1 | Início (Home) | `/` |
| 2 | A Marca | `/a-marca` |
| 3 | Produtos (índice) | `/produtos` |
| 4–11 | 8 categorias | `/produtos/{slug}` |
| 12 | Qualidade / Diferenciais | `/qualidade` |
| 13 | Seja um Revendedor | `/revendedor` |
| 14 | Contato | `/contato` |
| 15 | 404 | `/404` |
| 16 | Política de Privacidade | `/privacidade` (se houver formulário) |

**Slugs de categoria** (planilha): `linhas-de-costura`, `fios-overloque`, `ziperes`, `elasticos`, `passamanarias`, `fechos-colchetes`, `tesouras`, `acessorios`.

### Home (seções, ordem)
Hero (anel) → faixa de diferenciais (4 ícones) → 8 categorias → destaques (produtos "Sim" na planilha) → resumo "A Marca" → faixa revendedor → footer.

### Template de categoria (reutilizado 8×)
Cabeçalho (nome + descrição da planilha) → grid de cards (produtos filtrados por categoria) → CTA fim de página. **Linha 120 1.500m:** exibir cartela de cores em vez de listar.

---

## 6. Fonte de dados

- **`Site/Bufalo_Catalogo_Estruturado.xlsx`** — abas Categorias (8) e Produtos (31). Converter para JSON/dados Astro (`src/data/`): categorias e produtos. Campos do produto: ID, categoria, nome, composição, metragem/tamanho, embalagem, nº de cores, destaque (sim/não), observações.
- **Copy:** `Site/03_Conteudo_Copy.md` usada literalmente, no tom da marca.
- **Imagens:** extraídas do PDF (as 68 páginas rasterizadas em `_catalogo_paginas/` são a fonte de imagem), recortadas/tratadas por produto, exportadas em WebP otimizado.
- **Destaques da Home:** a coluna `Destaque (sim/não)` da planilha é autoritativa (não uma lista fixa).

---

## 7. SEO e técnico

- Meta title/description por página (modelos em `Site/04_Especificacao_Tecnica_SEO.md`).
- `alt` descritivo em todas as imagens; um `<h1>` por página.
- URLs amigáveis (slugs acima), `sitemap.xml`, `robots.txt`.
- Open Graph + Twitter Card (logo sobre fundo vermelho).
- Schema.org: `Organization` + `Product` (sem `offers`/preço).
- Performance: WebP, lazy-loading, sem dependências pesadas; alvo < 2s no mobile.
- Acessibilidade: contraste AA, navegação por teclado, foco visível.
- Analytics: GA4 + Search Console; clique no WhatsApp = evento de conversão.

---

## 8. WhatsApp (canal único)

- Link base: `https://wa.me/5581983426557`.
- Mensagens pré-preenchidas por contexto (codificadas com `%20`/acentos):
  - Genérico: "Olá! Vim pelo site da Búfalo e quero saber mais."
  - Produto: "Olá! Quero saber mais sobre {NOME DO PRODUTO}."
  - Revendedor: "Olá! Quero ser revendedor Búfalo."
  - Atacado: "Olá! Tenho interesse em comprar em volume para minha confecção."

---

## 9. Pendências do cliente (placeholders `[CONFIRMAR]`)

- História da empresa (fundação, anos de mercado, localização da fábrica).
- E-mail de contato oficial.
- Fotos profissionais de produto (provisório: catálogo PDF).
- Domínio do site.
- Validação final dos dados técnicos do catálogo antes de publicar.

Esses campos aparecem como placeholder **visível** no site — nada inventado.

---

## 10. Estrutura de pastas (Astro)

```
src/
  data/          categorias.json, produtos.json (do xlsx)
  styles/        tokens.css, global.css
  components/    Header, Footer, WhatsAppFloat, ProductCard, ColorRing,
                 ColorSwatches, CategoryGrid, CTASection, StitchDivider
  layouts/       BaseLayout.astro (head/SEO/header/footer)
  pages/         index, a-marca, produtos/index, produtos/[slug],
                 qualidade, revendedor, contato, 404
public/
  images/        logos, produtos (WebP), favicon
  sitemap.xml, robots.txt
```

---

## 11. Ordem de entrega

1. **Marco 1:** scaffold Astro + design system (tokens, fontes, Header, Footer, WhatsAppFloat) + **Home completa** + **1 página de categoria-template** + dados do xlsx convertidos. → validação visual no navegador.
2. **Marco 2:** replicar as 8 categorias + Produtos índice + A Marca + Qualidade + Revendedor + Contato + 404.
3. **Marco 3:** SEO completo (sitemap, robots, OG, schema), otimização de imagens, acessibilidade, checklist de entrega.

---

## 12. Critérios de sucesso

- Todas as páginas do mapa construídas, responsivas (testado no mobile).
- Paleta e fontes conforme tokens; logos corretos por contexto + favicon.
- Botão WhatsApp flutuante em todas as páginas; CTAs com msg pré-preenchida.
- Cards a partir da planilha, **sem preço**.
- Hero com anel de cores + cartela interativa funcionando.
- SEO aplicado (meta, alt, slugs, sitemap, schema sem preço).
- `[CONFIRMAR]` como placeholder visível, sem dados inventados.
- Carregamento < 2s no mobile.
