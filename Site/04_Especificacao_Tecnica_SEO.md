# Especificação Técnica e SEO — Site Búfalo

> Diretrizes técnicas, de design e de SEO para o agente de IA construir o site.
> Versão 1.0 · 2026

---

## 1. Stack recomendada

- **Site estático ou CMS leve** (não precisa de back-end nesta fase — sem loja, sem login).
  - Sugestões: HTML/CSS/JS puro, Astro, Next.js (export estático), ou um CMS simples.
- **Mobile-first.** A maioria do público acessa pelo celular.
- **Hospedagem:** qualquer host estático (Netlify, Vercel, Hostinger, etc.).
- **Sem dependências pesadas.** Performance é prioridade.

---

## 2. Paleta de cores (tokens CSS)

```css
:root {
  --bufalo-vermelho:  #B22222;  /* cor âncora / dominante (~60%) */
  --bufalo-bordo:     #6B0000;  /* apoio, hover, contrastes (~15%) */
  --bufalo-cinza:     #3D3D3D;  /* textos, fundos escuros (~15%) */
  --bufalo-branco:    #FFFFFF;  /* fundo neutro (~10% como cor, mas base de fundo) */

  /* derivados úteis */
  --bufalo-cinza-claro: #F2F2F2; /* fundos de seção alternados */
  --texto-padrao: #3D3D3D;
}
```

**Regras de uso:**
- Vermelho é a cor dominante: header/CTA principais, faixas de destaque.
- Bordô para hover e profundidade.
- Branco como base de fundo; cinza para textos.
- Nunca alterar o vermelho da marca. Contraste sempre alto (acessibilidade).

---

## 3. Tipografia

```css
/* Títulos / headlines */
font-family: 'Raleway', 'Oswald', sans-serif;

/* Corpo de texto, descrições */
font-family: 'Open Sans', 'Roboto', sans-serif;

/* Especificações técnicas / códigos de produto */
font-family: 'Courier New', monospace;
```

- Importar via Google Fonts.
- **Hierarquia:** H1 (capas/hero) → H2 (seções) → corpo → legenda.
- A fonte do **logotipo Búfalo é exclusiva** — nunca recriar o nome em texto; usar sempre o arquivo de logo.

---

## 4. Logos e favicon

| Uso | Arquivo (pasta /Logo) |
|---|---|
| Header / topo | `LOGO PRINCIPAL - V2@4x.png` (V2, sem animal) |
| Hero / destaques | `LOGO PRINCIPAL@4x.png` (com búfalo) |
| Footer (fundo escuro/vermelho) | `LOGO SECUNDÁRIA - BRANCO@4x.png` |
| Favicon (32×32) | símbolo isolado — `BUFALO VERMELHO@4x.png` recortado |

**Regras (do manual):**
- Manter área de proteção ao redor do logo.
- Tamanho mínimo digital: logo completo 240px; horizontal 160px; símbolo 60px.
- Nunca distorcer, recolorir, aplicar sombra/efeitos ou usar sobre fundos com textura.
- Versão branca em fundos escuros/vermelhos; versão colorida em fundo branco/claro.

---

## 5. Componentes-chave

### Botão flutuante de WhatsApp (todas as páginas)
- Fixo no canto inferior direito.
- Link: `https://wa.me/5581983426557`
- Abrir em nova aba (`target="_blank" rel="noopener"`).

### Card de produto
- Foto · Nome · Composição · Metragem/Tamanho · Embalagem · Nº de cores · Botão "Saber mais no WhatsApp".
- **Sem preço, sem carrinho.**
- Mensagem WhatsApp pré-preenchida com o nome do produto.

### CTA padrão
- Botão vermelho (`--bufalo-vermelho`), texto branco, hover bordô.

---

## 6. SEO

### Palavras-chave principais
- linha de costura, linha 120, linha para costura industrial
- linha de overloque / fio de overloque
- aviamentos, zíper, elástico para costura
- linha de costura resistente, linha que não rompe
- marca Búfalo, linhas Búfalo
- aviamentos para confecção / atacado de aviamentos

### Meta tags por página (modelos)

**Home**
- Title: `Búfalo — Linhas de Costura e Aviamentos | Força e Qualidade`
- Description: `Linhas de costura de alta resistência e aviamentos completos. A linha que não quebra na hora H. Centenas de cores, presença em todo o Brasil. Fale no WhatsApp.`

**A Marca**
- Title: `A Marca Búfalo — Força e Qualidade em cada carretel`
- Description: `Conheça a Búfalo: marca brasileira de linhas de costura e aviamentos, reconhecida pela resistência e variedade de cores em todo o Brasil.`

**Produtos**
- Title: `Produtos Búfalo — Linhas, Zíperes, Elásticos e Aviamentos`
- Description: `Conheça o portfólio Búfalo: linhas de costura, fios de overloque, zíperes, elásticos, passamanarias, tesouras e mais.`

**Categoria (modelo)**
- Title: `[Categoria] Búfalo | Aviamentos e Linhas de Costura`
- Description: `[descrição da categoria] — qualidade Búfalo. Saiba mais no WhatsApp.`

### Boas práticas de SEO
- Um `<h1>` por página, hierarquia correta de headings.
- `alt` descritivo em todas as imagens (ex.: "Cone de Linha 120 Búfalo na cor vermelha").
- URLs amigáveis (slugs da planilha: `/produtos/linhas-de-costura`).
- `sitemap.xml` e `robots.txt`.
- Open Graph + Twitter Card (imagem = logo principal sobre fundo vermelho).
- Dados estruturados schema.org: `Organization` (marca) e `Product` (sem `offers`/preço).
- Texto real indexável (não embutir conteúdo só em imagens).

---

## 7. Performance e acessibilidade

- Imagens otimizadas (WebP, lazy-loading).
- Contraste mínimo AA (vermelho sobre branco e branco sobre vermelho atendem; validar cinza).
- Navegação por teclado e foco visível.
- Carregamento alvo: < 2s no mobile.

---

## 8. Integração e analytics

- **WhatsApp** é o único canal de conversão nesta fase. Marcar cliques no botão como evento de conversão.
- Instalar **Google Analytics 4** (ou similar) e **Google Search Console**.
- **Não** integrar e-commerce nesta fase (decisão do Diego).

---

## 9. Checklist de entrega (para o agente)

- [ ] Todas as páginas do mapa do site construídas.
- [ ] Paleta e fontes aplicadas conforme tokens.
- [ ] Logos corretos por contexto + favicon.
- [ ] Botão WhatsApp flutuante em todas as páginas.
- [ ] Cards de produto a partir da planilha, sem preço.
- [ ] Mensagens WhatsApp pré-preenchidas por produto.
- [ ] Meta tags, sitemap, robots, OG.
- [ ] Responsivo testado em mobile.
- [ ] `alt` em todas as imagens.
- [ ] Sem dados inventados — campos `[CONFIRMAR]` validados com o Diego.
