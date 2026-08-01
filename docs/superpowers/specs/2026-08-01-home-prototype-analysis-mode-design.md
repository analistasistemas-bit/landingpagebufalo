# Design — Protótipo da Home Búfalo com Modo de Análise

> Especificação validada com o usuário em 2026-08-01. Este documento define um protótipo isolado; não autoriza substituir a home pública.

## 1. Objetivo

Construir uma landing page funcional em `/prototipo` que demonstre, com conteúdo e imagens reais, como a home Búfalo ficaria após aplicar todas as recomendações prioritárias da crítica de 2026-07-31.

O protótipo deve permitir duas leituras da mesma página:

1. **Modo análise ligado:** marcadores numerados e comentários explicam problema, mudança e benefício.
2. **Modo análise desligado:** a landing aparece limpa, sem marcadores, painel, gaveta ou espaço residual.

A rota `/` e os componentes que ela consome permanecem funcional e visualmente inalterados durante esta entrega.

## 2. Decisões aprovadas

| Decisão | Escolha |
|---|---|
| Entrega | Rota isolada `/prototipo` |
| Identidade | Preservar “Oficina de Confiança”, PRODUCT.md e DESIGN.md |
| Apresentação | Modo análise ligado por padrão e alternável |
| Comentários desktop | Painel lateral fixo + marcadores numerados |
| Comentários mobile | Botão-resumo + gaveta inferior acessível |
| Arquitetura do catálogo | Quatro caminhos por público/uso e oito categorias prioritárias |
| Catálogo completo | Continua disponível em `/produtos` |
| Dados | Reutilizar catálogo, imagens, tokens e WhatsApp atuais |
| Produção | Não modificar `/` nem substituir componentes compartilhados nesta fase |

## 3. Experiência proposta

### 3.1 Barra do protótipo

Uma barra discreta identifica a rota como protótipo e oferece o controle “Modo análise”. Ela não se confunde com a navegação comercial da marca.

- Estado inicial: ligado.
- Estado desligado: remove todas as anotações e o espaço que ocupavam.
- O controle possui rótulo textual, estado acessível e alvo mínimo de 44×44px.
- A preferência dura durante a sessão de navegação, sem criar dependência de backend.

### 3.2 Hero

O hero preserva a composição Búfalo de texto + anel cromático, com as seguintes correções:

- “500 cores” é a única afirmação geral usada no kicker, no anel e no texto acessível.
- A proposta deixa explícito que a marca atende indústria, ateliê, loja e artesanato.
- O CTA primário leva aos caminhos por uso dentro da própria página.
- O CTA secundário abre o WhatsApp com a mensagem existente.

### 3.3 Caminhos por público e uso

Quatro entradas aparecem logo depois do hero:

- Produção industrial e confecções.
- Ateliês e costureiras.
- Lojas e armarinhos.
- Artesanato e consumidor final.

Cada entrada apresenta uma frase curta, uma imagem real pertinente e categorias relacionadas. O clique desloca ou navega para a seleção correspondente sem esconder o acesso ao catálogo completo.

### 3.4 Categorias prioritárias

A home mostra somente estas oito categorias reais, escolhidas para representar a amplitude original do catálogo:

1. Linhas de Costura (`linhas-de-costura`).
2. Fios para Overloque (`fios-overloque`).
3. Zíperes (`ziperes`).
4. Elásticos (`elasticos`).
5. Passamanarias (`passamanarias`).
6. Botões de Pressão (`botoes-de-pressao`).
7. Tesouras (`tesouras`).
8. Fita Métrica (`fita-metrica`).

Todos os itens vêm de `src/data/categorias.json`; o protótipo não inventa categorias, slugs ou alegações.

O bloco termina com um CTA único “Ver catálogo completo”, apontando para `/produtos`. As 24 categorias não são renderizadas integralmente na home protótipo.

### 3.5 Prova técnica e produtos-chave

Antes da conversão final, a página apresenta prova concreta de adequação ao trabalho:

- aplicação industrial e doméstica;
- composição e medida;
- embalagem ou fornecimento em volume quando o dado existir;
- variedade de cores confirmada;
- produtos destacados já definidos no catálogo.

Dados ausentes são omitidos. O protótipo não inventa testes, certificações, números, clientes ou depoimentos.

### 3.6 Conversão e fechamento

O fechamento separa duas intenções:

- comprar ou consultar produtos;
- tornar-se revendedor.

Ambas usam mensagens contextuais existentes do WhatsApp. O rodapé exibe somente canais confirmados; email e redes sociais pendentes não aparecem.

## 4. Sistema de comentários

### 4.1 Conteúdo dos marcadores

| Marcador | Problema explicado | Mudança demonstrada | Benefício |
|---|---|---|---|
| 1 | Contradição “100+” versus “500 cores” | Mensagem unificada | Mais confiança nas provas comerciais |
| 2 | Público sem orientação inicial | Quatro caminhos por uso | Decisão mais rápida |
| 3 | Vinte e quatro categorias com o mesmo peso | Oito categorias prioritárias | Menor carga cognitiva e menos rolagem |
| 4 | Prova técnica aparece tarde | Evidência antes dos CTAs finais | Mais segurança para compradores profissionais |
| 5 | Texto auxiliar pequeno e contraste insuficiente | Corpo e cor ajustados para AA | Melhor leitura em mobile e baixa visão |
| 6 | Menu móvel pequeno e incompleto por teclado | Alvo de 44px, Escape e foco restaurado | Melhor uso com uma mão e teclado |
| 7 | Rodapé publica placeholders | Canais pendentes omitidos | Fechamento mais confiável |

### 4.2 Desktop

- Painel lateral acompanha a viewport sem cobrir a landing.
- Marcadores ficam ancorados à seção correspondente.
- Selecionar um comentário destaca seu marcador e seção.
- Fechar ou desligar o modo análise remove painel, marcadores e compensações de layout.

### 4.3 Mobile

- Um botão “7 melhorias” abre uma gaveta inferior.
- A gaveta possui título, botão de fechar, foco inicial definido e fechamento por Escape.
- Ao fechar, o foco retorna ao botão que a abriu.
- Marcadores não podem cobrir CTAs, texto ou o WhatsApp flutuante.

## 5. Arquitetura de implementação

### 5.1 Arquivos

```text
src/
  pages/
    prototipo.astro
  data/
    prototype-home.ts
  components/
    prototype/
      PrototypeShell.astro
      PrototypeHeader.astro
      PrototypeHero.astro
      AudiencePaths.astro
      PriorityCategories.astro
      TechnicalProof.astro
      PrototypeConversion.astro
      PrototypeFooter.astro
      AnalysisOverlay.astro
```

Os nomes podem ser consolidados durante o plano se isso reduzir código sem misturar responsabilidades. O limite obrigatório é que código experimental não altere a renderização da home pública.

### 5.2 Dados

`prototype-home.ts` contém somente configuração de apresentação:

- quatro caminhos aprovados;
- IDs das categorias prioritárias;
- textos dos sete comentários;
- relações entre marcadores e seções.

Produtos, categorias, imagens, mensagens de WhatsApp e tokens continuam vindo das fontes existentes. Não haverá cópia integral do catálogo.

### 5.3 Estado no cliente

Um script pequeno controla:

- modo análise ligado/desligado;
- comentário selecionado;
- abertura da gaveta mobile;
- fechamento por Escape;
- devolução de foco;
- preferência durante a sessão.

Não será adicionada biblioteca JavaScript de UI. O protótipo permanece compatível com a arquitetura estática do Astro.

## 6. Responsividade e acessibilidade

- Mobile-first, sem overflow em 320, 390, 768 e 1440px.
- Hero empilha abaixo de 768px; os limites de header e conteúdo não se sobrepõem no mesmo pixel.
- Todos os controles interativos têm pelo menos 44×44px.
- Hierarquia semântica contínua: um `h1`, seguido por `h2` de seção e `h3` internos.
- Texto normal mantém contraste mínimo de 4.5:1.
- Informações não dependem somente de cor ou posição.
- Movimento reduzido preserva feedback de estado e remove apenas deslocamentos ou animações dispensáveis.
- A página deve permanecer utilizável com teclado e ampliação de texto.

## 7. Tratamento de falhas e limites

- Imagem ausente usa o fallback já adotado pelo catálogo.
- Categoria ou produto inexistente na configuração é omitido sem quebrar o build.
- Dados técnicos vazios não geram rótulos sem valor.
- Ausência de `sessionStorage` mantém o modo análise ligado e funcional na memória da página.
- O protótipo não implementa checkout, preços, formulário, autenticação ou CMS adicional.

## 8. Validação

### 8.1 Automática

- `npm run build` inclui `/prototipo` sem erros.
- Smoke test confirma status 200, um `h1` e CTAs essenciais.
- Teste verifica que ligar e desligar o modo análise altera visibilidade sem mudar a estrutura comercial.
- Teste abre e fecha menu e gaveta com clique e Escape, verificando estado ARIA e retorno de foco.
- Testes em 320, 390, 768 e 1440px confirmam ausência de overflow.
- Detector Impeccable roda no novo arquivo e os findings são verificados em contexto.

### 8.2 Visual

Uma rodada conjunta de screenshots desktop e mobile verifica:

- hierarquia e ritmo;
- imagens e crops;
- painel, marcadores e gaveta;
- modo limpo;
- colisões com header e WhatsApp flutuante.

Uma segunda rodada é permitida somente para confirmar o lote de correções encontrado na primeira.

### 8.3 Proteção da home atual

- `/` continua respondendo e mantendo seu conteúdo atual.
- O diff não pode incluir mudanças em `src/pages/index.astro` nem nos componentes compartilhados pela home, salvo autorização posterior do usuário.
- O protótipo não será incluído na navegação pública, sitemap ou CTAs da home.

## 9. Critérios de aceite

O protótipo é aceito quando:

1. `/prototipo` apresenta a landing completa com dados e imagens reais.
2. Os sete comentários explicam claramente problema, mudança e benefício.
3. O modo análise pode ser ocultado sem deixar resíduos visuais.
4. Desktop e mobile oferecem comentários adequados ao espaço disponível.
5. Todas as recomendações P1 e P2 acordadas estão visíveis na experiência.
6. Build, smoke tests, teclado, contraste e viewports passam nas verificações previstas.
7. A home pública permanece inalterada.

## 10. Fora de escopo

- Substituir ou editar a rota `/`.
- Publicar o protótipo na navegação ou sitemap.
- Alterar o catálogo mestre ou conteúdo do CMS.
- Inventar prova comercial ou dados institucionais.
- Criar uma segunda identidade visual.
- Implementar e-commerce, preço ou formulário.
