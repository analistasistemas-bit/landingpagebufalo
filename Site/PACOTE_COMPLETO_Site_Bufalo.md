# PACOTE COMPLETO — CONSTRUÇÃO DO SITE DA MARCA BÚFALO

> Documento único com tudo o que o agente de IA precisa. Contém: prompt de instrução, briefing, mapa do site, copy, especificação técnica/SEO e catálogo de produtos.
> Ative junto os logos da pasta `Logo`.

---



---


# Prompt para o Agente de IA — Site Búfalo

Copie o texto abaixo e cole no seu agente de IA (junto com os arquivos da pasta `Site` e a pasta `Logo`).

---

## INSTRUÇÃO

Você vai construir o **site institucional da marca Búfalo** (linhas de costura e aviamentos). Use EXCLUSIVAMENTE os documentos e ativos que estou fornecendo. **Não invente dados, preços ou textos** que não estejam neles.

### Documentos de referência (leia nesta ordem)
1. `01_Briefing_do_Site.md` — objetivo, públicos, jornada, mensagens-chave.
2. `02_Mapa_do_Site.md` — páginas, seções e navegação.
3. `03_Conteudo_Copy.md` — textos prontos de cada página (use-os literalmente).
4. `04_Especificacao_Tecnica_SEO.md` — cores, fontes, logos, SEO, performance.
5. `Bufalo_Catalogo_Estruturado.xlsx` — produtos por categoria (fonte dos cards).
6. Pasta `Logo/` — logos da marca. `Bufalo_Manual_Identidade_Visual.docx` — manual completo.

### O que construir
Um site **institucional / vitrine**, responsivo (mobile-first), com as páginas: Início, A Marca, Produtos (índice + 8 categorias), Qualidade, Seja um Revendedor e Contato. Páginas e seções exatamente como no mapa do site.

### Regras inegociáveis
- **NÃO é loja:** sem carrinho, sem pagamento, sem preço em lugar nenhum.
- **Único canal de conversão: WhatsApp** `https://wa.me/5581983426557`. Botão flutuante fixo em todas as páginas + CTAs nas páginas.
- Cada card de produto tem botão "Saber mais no WhatsApp" com **mensagem pré-preenchida** citando o nome do produto.
- Seguir **rigorosamente** a paleta (vermelho `#B22222` dominante), as fontes (Raleway/Oswald + Open Sans/Roboto) e as regras de uso do logo do arquivo de spec técnica.
- Usar os **textos prontos** do arquivo de copy, no tom da marca. Não reescrever em linguagem corporativa.
- Aplicar SEO conforme a spec (title, description, alt em imagens, sitemap, slugs).
- Campos marcados `[CONFIRMAR]` (história da empresa, e-mail): deixar placeholder visível, não inventar.

### Entrega
Site funcional, responsivo, pronto para publicar em host estático. Ao final, liste o que ficou pendente de dados meus (placeholders `[CONFIRMAR]`).

### Stack
Pode usar HTML/CSS/JS puro ou um framework estático leve (Astro/Next export). Priorize performance e simplicidade — sem back-end nesta fase.


---


# Briefing do Site — Marca Búfalo

> Documento mestre. Orienta todos os demais arquivos desta pasta e a construção do site pelo agente de IA.
> Versão 1.0 · 2026

---

## 1. Visão geral

A Búfalo é uma marca brasileira de **linhas para costura e aviamentos**, reconhecida pela alta resistência ao rompimento e pela ampla variedade de cores. Já existe e é comercializada; o objetivo deste projeto é dar à marca um **site próprio**, que apresente a Búfalo e seus produtos de forma profissional e consistente com a identidade visual já definida.

**Assinatura da marca:** *Força e Qualidade.*

---

## 2. Objetivo do site (Fase 1)

Site **institucional / vitrine**. Não é loja virtual.

- Apresentar a marca Búfalo (quem é, valores, diferenciais).
- Mostrar o portfólio de produtos organizado por categoria.
- Transmitir força, qualidade e confiança em cada página.
- Converter o interesse em **contato via WhatsApp**.

**Fora de escopo nesta fase:** carrinho, pagamento, frete, login, integração com e-commerce. Nada de preços. O site não vende online — encaminha para conversa no WhatsApp.

---

## 3. Canal de conversão único: WhatsApp

Todo CTA de "quero saber mais / comprar / virar revendedor" leva ao WhatsApp:

- **Número:** +55 81 98342-6557
- **Link:** `https://wa.me/5581983426557`
- **Boa prática:** usar mensagem pré-preenchida por contexto. Ex.:
  `https://wa.me/5581983426557?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20quero%20saber%20mais%20sobre%20a%20Linha%20120%20B%C3%BAfalo.`
- Botão flutuante de WhatsApp fixo em todas as páginas (canto inferior direito).

---

## 4. Públicos-alvo

O site fala com quatro públicos simultaneamente. A comunicação deve servir a todos sem se diluir — tom direto e técnico-acessível atende a todos.

| Público | O que procura | Como o site atende |
|---|---|---|
| **Confecções / indústria** | Resistência, ficha técnica, fornecimento em volume | Dados técnicos (composição, metragem, embalagem em caixa), ênfase em "não quebra na hora H" |
| **Lojistas / revendedores (armarinhos)** | Revender a marca, condições de atacado | Seção "Seja um Revendedor" com CTA WhatsApp |
| **Costureiras / ateliês** | Qualidade, cores, confiança | Destaque de variedade de cores e desempenho |
| **Artesãos / consumidor final** | Variedade, inspiração | Passamanarias, pompons, cores, acabamentos |

---

## 5. Mensagens-chave (o que o site precisa comunicar)

1. **Resistência** — "A linha que não quebra na hora H."
2. **Variedade** — centenas de cores e um portfólio completo de aviamentos.
3. **Confiança / tradição** — marca presente em todo o Brasil, do micro empreendedor à grande confecção.
4. **Qualidade técnica** — alto desempenho em alta velocidade, em máquina industrial e doméstica.

---

## 6. Jornada do usuário

```
Entrada (Home) → Reconhece a marca e a promessa "Força e Qualidade"
   → Explora Produtos (por categoria) → vê detalhe e ficha técnica
   → Clica "Saber mais no WhatsApp" → conversa iniciada
        (ou) → "Seja um Revendedor" → WhatsApp
```

Cada página tem pelo menos um CTA para WhatsApp. O usuário nunca fica sem próximo passo.

---

## 7. Identidade visual (resumo — detalhes na Spec Técnica)

- **Cor âncora:** Vermelho `#B22222` (dominante).
- **Apoio:** Bordô `#6B0000`, Cinza `#3D3D3D`, Branco `#FFFFFF`.
- **Fontes:** títulos Raleway/Oswald; corpo Open Sans/Roboto.
- **Logo:** versão V2 (sem animal) para header/avatar; símbolo isolado para favicon; logo principal (com búfalo) em destaques.
- Seguir rigorosamente o **Manual de Identidade Visual** (arquivo na pasta do projeto).

---

## 8. Tom de voz

Direto, confiante, brasileiro, técnico mas acessível. Fala com o profissional como parceiro de trabalho, não como vendedor.

- ✓ "A linha Búfalo é feita para aguentar."
- ✓ "500 cores. Uma força só."
- ✗ "Nossa linha possui excelente desempenho qualitativo."

---

## 9. Requisitos técnicos (resumo — detalhes na Spec Técnica)

- **Responsivo** (mobile-first — a maioria do público acessa pelo celular).
- **Rápido** e leve.
- **SEO** otimizado para termos de costura.
- **Acessível** (contraste, textos alternativos nas imagens).
- Botão de WhatsApp flutuante em todas as páginas.
- Sem back-end complexo nesta fase (site estático ou CMS leve).

---

## 10. Insumos disponíveis

| Item | Status |
|---|---|
| Manual de Identidade Visual | ✅ Pronto (na pasta do projeto) |
| Logos (todas as variações, PNG 4x) | ✅ Pronto (pasta /Logo) |
| Catálogo de produtos (PDF, 68 págs) | ✅ Pronto |
| Catálogo estruturado para web (planilha) | ✅ Nesta pasta |
| Fotos de produto | ✅ Diego possui (fornecer ao agente) |
| Texto institucional / história da empresa | ⚠️ A confirmar com o Diego (fundação, anos de mercado, fábrica) |
| Domínio | ⚠️ A definir |

---

## 11. Próximos passos

1. Diego revisa este pacote e confirma dados do catálogo.
2. Diego fornece fotos de produto e, se possível, a história da empresa.
3. Agente de IA constrói o site usando: este briefing + mapa do site + copy + spec técnica + planilha de catálogo.
4. Fase 2 (futuro): redes sociais e, se desejado, integração com vendas.


---


# Mapa do Site e Arquitetura de Páginas — Marca Búfalo

> Define as páginas do site, suas seções e a navegação. Base estrutural para o agente de IA.
> Versão 1.0 · 2026

---

## 1. Estrutura de navegação (menu principal)

```
Início  ·  A Marca  ·  Produtos  ·  Qualidade  ·  Seja um Revendedor  ·  Contato
                              │
                              ├── Linhas de Costura
                              ├── Fios para Overloque
                              ├── Zíperes
                              ├── Elásticos
                              ├── Passamanarias e Acabamentos
                              ├── Fechos e Colchetes
                              ├── Tesouras
                              └── Fitas Métricas e Acessórios
```

- **Header (todas as páginas):** logo Búfalo V2 (sem animal) à esquerda + menu + botão "WhatsApp".
- **Footer (todas as páginas):** logo branco sobre fundo vermelho/escuro, contato, WhatsApp, redes sociais (placeholder), aviso de direitos.
- **Botão flutuante de WhatsApp** fixo em todas as páginas.

---

## 2. Páginas e seções

### 2.1 Início (Home)

Página de entrada. Resume a marca e direciona para produtos e WhatsApp.

1. **Hero** — logo principal (com búfalo) ou fundo vermelho, headline "A linha que não quebra na hora H", subtítulo + CTA primário (Ver Produtos) e secundário (Falar no WhatsApp).
2. **Faixa de diferenciais** — 3–4 ícones: Resistência · Variedade de cores · Presença nacional · Qualidade técnica.
3. **Categorias de produto** — grid com as 8 categorias, cada uma levando à sua página.
4. **Destaques** — produtos marcados como destaque na planilha (Linha 120, Fio de overloque 300g, Tesoura 7,5").
5. **A Marca (resumo)** — parágrafo curto + link para página "A Marca".
6. **Faixa para revendedores** — "Quer revender Búfalo?" + CTA WhatsApp.
7. **Rodapé.**

---

### 2.2 A Marca

História, missão, visão, valores e posicionamento.

1. **Abertura** — quem é a Búfalo (texto institucional).
2. **Missão · Visão · Valores** — blocos visuais (valores: Força, Qualidade, Tradição, Variedade, Presença Nacional).
3. **Posicionamento** — "Búfalo é a linha que não quebra na hora H..."
4. **Presença nacional** — destaque de alcance ("de norte a sul do Brasil").
5. **CTA** — Conheça os produtos / Fale conosco.

> ⚠️ História detalhada (fundação, anos de mercado, fábrica) depende de dados do Diego. Enquanto não houver, usar a versão baseada no posicionamento do manual (ver arquivo de Copy).

---

### 2.3 Produtos (página índice)

Vitrine geral com as 8 categorias.

1. **Título + intro** — "Tudo para a sua costura, com a força da Búfalo."
2. **Grid de categorias** — card por categoria (imagem + nome + descrição curta + "Ver produtos").
3. **CTA WhatsApp.**

#### Páginas de categoria (8)

Modelo único, reutilizado para cada categoria:

1. **Cabeçalho da categoria** — nome + descrição (da planilha, aba Categorias).
2. **Lista de produtos** — cards a partir da planilha (aba Produtos), filtrando pela categoria.
3. Cada card: foto, nome, composição, metragem/tamanho, embalagem, nº de cores, botão **"Saber mais no WhatsApp"** (mensagem pré-preenchida com o nome do produto).
4. Para a **Linha 120 1.500m:** exibir cartela/amostras de cores (100+ cores) em vez de listar como produtos separados.
5. **CTA de fim de página.**

> Sem preço e sem carrinho em nenhuma página.

---

### 2.4 Qualidade / Diferenciais

Página que sustenta a promessa técnica da marca.

1. **Por que Búfalo** — resistência ao rompimento, desempenho em alta velocidade, máquina industrial e doméstica.
2. **Aplicações** — confecção, ateliê, artesanato, indústria.
3. **Variedade** — centenas de cores, portfólio completo de aviamentos.
4. **CTA WhatsApp.**

---

### 2.5 Seja um Revendedor

Captação de lojistas/distribuidores.

1. **Chamada** — "Leve a força da Búfalo para a sua loja."
2. **Benefícios de revender** — marca conhecida, giro, variedade.
3. **Formulário simples OU CTA direto para WhatsApp** (preferência: WhatsApp com mensagem "Quero ser revendedor Búfalo").

---

### 2.6 Contato

1. **Dados de contato** — WhatsApp +55 81 98342-6557 (destaque), e-mail (a definir), redes sociais (placeholder).
2. **Botão WhatsApp grande.**
3. **Formulário simples** (nome, mensagem) — opcional; se houver, encaminha para e-mail/WhatsApp.
4. (Opcional, fase futura) localização/área de atuação.

---

## 3. Páginas auxiliares

- **404** — página de erro com identidade da marca e link de volta.
- **Política de Privacidade** — placeholder (necessária se houver formulário/coleta de dados).

---

## 4. Resumo de páginas a construir

| # | Página | Prioridade |
|---|---|---|
| 1 | Início (Home) | Alta |
| 2 | A Marca | Alta |
| 3 | Produtos (índice) | Alta |
| 4–11 | 8 páginas de categoria | Alta |
| 12 | Qualidade / Diferenciais | Média |
| 13 | Seja um Revendedor | Média |
| 14 | Contato | Alta |
| 15 | 404 | Baixa |
| 16 | Política de Privacidade | Baixa (se houver formulário) |


---


# Conteúdo / Copy do Site — Marca Búfalo

> Textos prontos para cada página, no tom de voz oficial da marca (direto, confiante, técnico-acessível).
> O agente de IA pode usar este conteúdo diretamente. Trechos marcados `[CONFIRMAR]` dependem de dados do Diego.
> Versão 1.0 · 2026

---

## REGRAS DE COPY (para todo o site)

- Tom: direto, confiante, brasileiro. Frases curtas. Sem rodeios.
- Sempre afirmar, nunca hesitar ("a linha que aguenta", não "que pode aguentar").
- CTA padrão de produto: **"Saber mais no WhatsApp"**.
- Link WhatsApp: `https://wa.me/5581983426557`.
- Evitar linguagem corporativa vazia ("soluções", "excelência qualitativa").

---

## HOME

### Hero
**Headline:** A linha que não quebra na hora H.
**Subtítulo:** Linhas de costura e aviamentos com a força e a qualidade que o seu trabalho merece. De norte a sul do Brasil.
**Botão primário:** Ver Produtos
**Botão secundário:** Falar no WhatsApp

### Faixa de diferenciais
- **Resistência comprovada** — Alta resistência ao rompimento, mesmo em alta velocidade.
- **Centenas de cores** — Uma paleta completa para qualquer projeto.
- **Indústria e ateliê** — Desempenho em máquina industrial e doméstica.
- **Presença nacional** — Búfalo costura o Brasil inteiro.

### Categorias (chamada)
**Título:** Tudo para a sua costura
**Texto:** Das linhas que seguram o ponto aos aviamentos que finalizam a peça — a Búfalo tem o que a sua produção precisa.

### Destaques
**Título:** Os queridinhos da Búfalo

### Faixa institucional (resumo)
**Título:** Força e Qualidade em cada carretel
**Texto:** A Búfalo nasceu para entregar o insumo que não decepciona. Para quem costura com seriedade — do micro empreendedor à grande confecção. [Saiba mais sobre a marca →]

### Faixa revendedor
**Título:** Quer revender Búfalo?
**Texto:** Leve para a sua loja uma marca que o costureiro já conhece e confia.
**Botão:** Quero ser revendedor

---

## A MARCA

### Abertura
**Título:** A força que costura o Brasil

A Búfalo é uma marca brasileira de linhas para costura e aviamentos, reconhecida pela alta resistência ao rompimento e pela versatilidade de uso em máquinas industriais e domésticas. Presente em todo o Brasil, a Búfalo conquistou costureiros, confecções e artesãos com produtos que unem desempenho superior e ampla variedade de cores.

`[CONFIRMAR: incluir aqui ano de fundação, tempo de mercado e localização da fábrica, se o Diego quiser reforçar a credibilidade. Ex.: "Há mais de X anos no mercado..."]`

### Missão
Oferecer linhas de costura de alta qualidade que atendam às necessidades de profissionais e entusiastas da costura em todo o Brasil, entregando força, confiabilidade e beleza a cada ponto.

### Visão
Ser a linha de costura mais reconhecida e confiável do Brasil, presente em cada ateliê, confecção e residência que valoriza o trabalho bem feito.

### Valores
- **Força** — Produtos resistentes e de alta performance.
- **Qualidade** — Padrão rigoroso em cada carretel.
- **Tradição** — Reconhecimento construído ao longo de anos.
- **Variedade** — Cores e espessuras para toda aplicação.
- **Presença Nacional** — Atendimento de ponta a ponta no Brasil.

### Posicionamento
Búfalo é a linha que não quebra na hora H. Para quem costura com seriedade — do micro empreendedor à grande confecção — a Búfalo entrega o insumo que não decepciona. Força e qualidade em cada carretel.

**CTA:** Conheça os produtos · Fale no WhatsApp

---

## PRODUTOS (índice)

**Título:** Nossos Produtos
**Intro:** Tudo para a sua costura, com a força da Búfalo. Escolha uma categoria e veja o que temos para a sua produção.

*(Cards das 8 categorias — descrições na planilha, aba Categorias.)*

---

## TEXTOS DE CATEGORIA
*(Usar como introdução de cada página de categoria. Os produtos vêm da planilha.)*

**Linhas de Costura** — O carro-chefe da Búfalo. Alta resistência ao rompimento, acabamento uniforme e centenas de cores. Da Linha 120 às linhas 36 e 50, é o ponto que aguenta.

**Fios para Overloque** — Acabamento firme e uniforme, com gramaturas para todo tipo de produção. Overloque que finaliza sem decepcionar.

**Zíperes** — De metal a invisível, do nº 3 ao tratorado: o fecho certo para cada peça, com a resistência que a Búfalo entrega.

**Elásticos** — Largura de 20 a 50mm para cós, punhos e ajustes. Firmeza que não cede com o uso.

**Passamanarias e Acabamentos** — Rabo de rato, pompons, rendas e bicos bordados para dar o toque final na peça. Acabamento que valoriza o trabalho.

**Fechos e Colchetes** — Velcro, botões de pressão e colchetes para fechar com segurança. Detalhe que faz a diferença.

**Tesouras** — Corte preciso e durável, em aço inoxidável. De 7,5" a 9,75", a tesoura que acompanha o profissional.

**Fitas Métricas e Acessórios** — O apoio do dia a dia da costura, com a confiança da marca Búfalo.

---

## QUALIDADE / DIFERENCIAIS

**Título:** Por que costurar com Búfalo

**Resistência ao rompimento** — A linha Búfalo é feita para aguentar. Alta velocidade, costura pesada, produção contínua: o ponto não cede.

**Para indústria e para ateliê** — Desempenho comprovado em máquina industrial e doméstica. A mesma força para a grande confecção e para quem costura em casa.

**Variedade que resolve** — Centenas de cores e um portfólio completo de aviamentos. Você encontra tudo num lugar só.

**Confiança nacional** — Búfalo conquistou clientes de norte a sul do Brasil. Marca que o costureiro conhece e indica.

**CTA:** Fale com a gente no WhatsApp

---

## SEJA UM REVENDEDOR

**Título:** Leve a força da Búfalo para a sua loja

A Búfalo é uma marca que o costureiro já conhece e confia. Revender Búfalo é oferecer ao seu cliente o insumo que não decepciona — e garantir giro com uma linha de produtos completa.

**Por que revender:**
- Marca reconhecida em todo o Brasil.
- Portfólio completo: linhas, zíperes, aviamentos e mais.
- Produto que volta a ser comprado.

**CTA:** Fale com nosso time no WhatsApp
*(mensagem pré-preenchida: "Olá! Quero ser revendedor Búfalo.")*

---

## CONTATO

**Título:** Fale com a Búfalo

Tem uma dúvida, quer fazer um pedido ou conhecer melhor nossos produtos? Chama no WhatsApp — atendimento direto, sem rodeios.

- **WhatsApp:** +55 81 98342-6557
- **E-mail:** `[CONFIRMAR]`
- **Redes sociais:** `[em breve]`

**Botão:** Conversar no WhatsApp

---

## TEXTOS DE APOIO

### Botão flutuante WhatsApp
Tooltip: "Fale conosco"

### Footer
**Tagline:** Búfalo · Força e Qualidade
**Linha legal:** © 2026 Linhas Búfalo · Todos os direitos reservados.

### 404
**Título:** Esse ponto se perdeu.
**Texto:** A página que você procura não existe ou foi movida. Volte ao início e continue navegando.
**Botão:** Voltar ao início

---

## MICROCOPY — exemplos de mensagens pré-preenchidas de WhatsApp

| Contexto | Texto sugerido (já codificar com %20 / acentos) |
|---|---|
| Genérico | "Olá! Vim pelo site da Búfalo e quero saber mais." |
| Produto específico | "Olá! Quero saber mais sobre [NOME DO PRODUTO]." |
| Revendedor | "Olá! Quero ser revendedor Búfalo." |
| Atacado/indústria | "Olá! Tenho interesse em comprar em volume para minha confecção." |


---


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


---

# CATÁLOGO DE PRODUTOS (estruturado)

> Fonte dos cards de produto. Sem preço — cada produto vira um card com botão WhatsApp.


## Categorias

| ID Categoria | Categoria | Slug (URL) | Descrição curta (web) | Ordem de exibição |
|---|---|---|---|---|
| CAT-01 | Linhas de Costura | linhas-de-costura | O carro-chefe da Búfalo. Alta resistência ao rompimento em máquinas industriais e domésticas, com centenas de cores. | 1 |
| CAT-02 | Fios para Overloque | fios-overloque | Fios para acabamento de overloque em diferentes gramaturas, força e uniformidade no ponto. | 2 |
| CAT-03 | Zíperes | ziperes | Zíperes de metal, alumínio, nylon, invisíveis, destacáveis e tratorados para todo tipo de peça. | 3 |
| CAT-04 | Elásticos | elasticos | Elásticos em diversas larguras (20mm a 50mm) para confecção e ajustes. | 4 |
| CAT-05 | Passamanarias e Acabamentos | passamanarias | Rabo de rato, pompons, rendas, bicos bordados e fitas para arremate e decoração. | 5 |
| CAT-06 | Fechos e Colchetes | fechos-colchetes | Velcro, botões de pressão, colchetes de pressão e de gancho para fechamento de peças. | 6 |
| CAT-07 | Tesouras | tesouras | Tesouras de costura (7,5" a 9,75") e de arremate, corte preciso e durável. | 7 |
| CAT-08 | Fitas Métricas e Acessórios | acessorios | Fitas métricas e acessórios de apoio para o dia a dia da costura. | 8 |

## Produtos

| ID Produto | Categoria | Produto | Composição | Metragem / Tamanho | Embalagem | Nº de Cores | Destaque (sim/não) | Observações para web |
|---|---|---|---|---|---|---|---|---|
| BF-120-10K | Linhas de Costura | Linha 120 Búfalo 10.000m | 100% Poliéster | Cone 10.000 m | Caixa com 60 cones | 2 (Branca e Preta) | Sim | Cone grande para produção industrial contínua. |
| BF-120-5K | Linhas de Costura | Linha 120 Búfalo 5.000m | 100% Poliéster | Cone 5.000 m | Caixa com 240 cones | 2 (Branca e Preta) | Sim | Volume intermediário para confecções. |
| BF-120-1.5K | Linhas de Costura | Linha 120 Búfalo 1.500m | 100% Poliéster | Cone 1.500 m | Caixa com 240 cones | 100+ cores | Sim | Versão com a paleta completa de cores — destaque visual no site. |
| BF-120-SORT | Linhas de Costura | Sortimento de Linha 120 | 100% Poliéster | 81,4 m com 10 unidades | Caixa com 100 caixas | Sortido | Não | Kit sortido para varejo/armarinho. |
| BF-36 | Linhas de Costura | Linha 36 Búfalo | 100% Poliéster | Cone 2.000 m | — | 20+ cores | Não | Linha mais encorpada para costuras reforçadas. |
| BF-50 | Linhas de Costura | Linha 50 Búfalo | 100% Poliéster | Cone 3.000 m | — | 20+ cores | Não | Equilíbrio entre resistência e acabamento fino. |
| BF-OVL-100 | Fios para Overloque | Fio de Overloque 100g | 80% Nylon / 20% PET | Tubo 100 g | — | Cores | Não | Gramatura leve para acabamento. |
| BF-OVL-300 | Fios para Overloque | Fio de Overloque 300g | 80% Nylon / 20% PET | Tubo 300 g | — | Cores | Sim | Gramatura intermediária, mais vendida. |
| BF-OVL-500 | Fios para Overloque | Fio de Overloque 500g | 80% Nylon / 20% PET | Tubo 500 g | — | Cores | Não | Maior rendimento para produção. |
| BF-ZIP-MET | Zíperes | Zíper de Metal Médio | Metal | Variados | — | Cores | Não | Resistente, para jeans e peças pesadas. |
| BF-ZIP-ALU | Zíperes | Zíper de Alumínio Médio | Alumínio | Variados | — | Cores | Não | Leve e durável. |
| BF-ZIP-DEST | Zíperes | Zíper Destacável | Nylon/Metal | Variados | — | Cores | Não | Para jaquetas e casacos. |
| BF-ZIP-INV | Zíperes | Zíper Invisível | Nylon | Variados | — | Cores | Não | Acabamento discreto em vestidos e saias. |
| BF-ZIP-NY3 | Zíperes | Zíper Nylon nº 3 | Nylon | Variados | — | Cores | Não | Uso geral em roupas leves. |
| BF-ZIP-NY5 | Zíperes | Zíper Nylon nº 5 | Nylon | Variados | — | Cores | Não | Uso geral, dente médio. |
| BF-ZIP-TRA | Zíperes | Zíper Trator / Tratorado | Nylon/Plástico | 15cm, 18cm e outros | — | Cores | Não | Dente tipo trator, alta resistência. |
| BF-ELA | Elásticos | Elásticos (20 a 50mm) | Poliéster/Elastano | 20, 30, 35, 40 e 50mm — rolos de 25 m | Rolo | Cores | Não | Larguras variadas para cós, punhos e ajustes. |
| BF-RABO | Passamanarias e Acabamentos | Rabo de Rato (1mm e 2mm) | 100% Poliéster | 1mm: 100m / 2mm: 50m | Rolo | Várias cores | Não | Cordão fino para acabamento e artesanato. |
| BF-POMP | Passamanarias e Acabamentos | Pompons (10mm e 14mm) | Poliéster | 10mm e 14mm | Cartela/rolo | Várias cores | Não | Decoração de peças e artesanato. |
| BF-REND | Passamanarias e Acabamentos | Rendas | 100% Poliamida | Largura 37mm e outras | Rolo | Cores | Não | Acabamento decorativo. |
| BF-BICO | Passamanarias e Acabamentos | Bico Bordado | Poliéster | Larguras 2,0 a 5,0 cm | Rolo | Branco | Não | Bico bordado para barras e enxoval. |
| BF-FITA-NAT | Passamanarias e Acabamentos | Fitas Natalinas | Poliéster | 6,3cm x 9,14cm | Rolo | Vermelho e cores | Não | Linha sazonal de Natal. |
| BF-VELCRO | Fechos e Colchetes | Velcro / Fecho Adesivo 16mm | 100% Poliéster | Largura 16mm | Rolo | Cores | Não | Fecho de contato. |
| BF-BTN-PRES | Fechos e Colchetes | Botão de Pressão | Metal/Ferro | Variados | Cartela | — | Não | Fechamento prático. |
| BF-COLCH-P | Fechos e Colchetes | Colchete de Pressão p/ Costurar | Aço niquelado | Nº 02 (12mm), 03 (14mm), 04 (16mm) | Cartela com 20 un | Prata | Não | Para costurar. |
| BF-COLCH-G | Fechos e Colchetes | Colchete de Gancho | Aço niquelado | Nº 01, 02, 03 | Cartela 20–24 un | Prata | Não | Fechamento de cós. |
| BF-TES-75 | Tesouras | Tesoura Búfalo 7,5" | Aço inoxidável e resina | 7,5 polegadas | — | — | Sim | Corte preciso para costura. |
| BF-TES-825 | Tesouras | Tesoura Búfalo 8,25" | Aço inoxidável e resina | 8,25 polegadas | — | — | Não | Tamanho intermediário. |
| BF-TES-975 | Tesouras | Tesoura Búfalo 9,75" | Aço inoxidável e resina | 9,75 polegadas | — | — | Não | Para cortes maiores. |
| BF-TES-ARR | Tesouras | Tesoura de Arremate | Aço inoxidável | — | — | — | Não | Para arremate e detalhes. |
| BF-FITAMET | Fitas Métricas e Acessórios | Fita Métrica para Costura | Fibra/PVC | 1,5 m | — | — | Não | Acessório essencial de medição. |

## Notas p_ Agente IA

| Campo | Orientação |
|---|---|
| Objetivo da planilha | Servir de fonte de dados para gerar as páginas/cards de produto do site institucional. NÃO é loja — sem preço, sem carrinho. |
| CTA de cada produto | Botão 'Saber mais no WhatsApp' apontando para https://wa.me/5581983426557 com mensagem pré-preenchida citando o produto. |
| Cores da Linha 120 | A Linha 120 1.500m tem 100+ cores no catálogo (PDF). Exibir como cartela de cores/amostras, não como produtos separados. |
| Imagens | Usar as fotos de produto fornecidas pelo Diego. Onde faltar, usar placeholder com a paleta da marca. |
| Destaques | Produtos marcados 'Sim' em 'Destaque' devem aparecer na Home e no topo da categoria. |
| Composição/medidas | Dados extraídos do catálogo 'Catálogo Búfalo 18-06.pdf'. Confirmar com o Diego antes de publicar. |
| Categorias sazonais | Fitas Natalinas é linha sazonal — pode ficar oculta fora de época. |