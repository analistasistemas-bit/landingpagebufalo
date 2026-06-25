# Como Editar o Site Búfalo

Este guia é para quem vai editar o conteúdo do site sem precisar mexer em código.
Tudo é feito pelo painel `/admin` — basta ter acesso ao GitHub da conta **analistasistemas-bit**.

---

## 1. Acessando o painel

1. Abra no browser: **https://landingpagebufalo.vercel.app/admin**
2. Clique em **Login with GitHub**
3. Autorize o acesso quando o GitHub pedir
4. O painel abre com as coleções à esquerda: Páginas, Produtos, Categorias, Configurações

> Apenas contas com acesso ao repositório `analistasistemas-bit/landingpagebufalo` conseguem salvar alterações.

---

## 2. Editando textos de uma página

**Exemplo: mudar o texto da Home**

1. No menu esquerdo, clique em **Páginas**
2. Clique em **Home**
3. Edite os campos desejados (Headline, Subtítulo, etc.)
4. Clique em **Save** (canto superior direito)
5. O Sveltia faz um commit automático no GitHub
6. A Vercel reconstrói o site em **~1 a 2 minutos**
7. Acesse o site e veja a mudança no ar

---

## 3. Trocando a foto de uma categoria

1. No menu esquerdo, clique em **Categorias**
2. Clique em **Lista de Categorias**
3. Encontre a categoria desejada na lista
4. No campo **Imagem**, clique em **Choose an image** e faça upload da nova foto
5. Clique em **Save**
6. Aguarde ~2 minutos para o rebuild

> Formato recomendado: **WebP ou JPG**, proporção **4:3** (ex: 800×600 px).

---

## 4. Adicionando ou editando um produto

1. No menu esquerdo, clique em **Produtos**
2. Clique em **Lista de Produtos**
3. Para **editar**: localize o produto pelo nome e altere os campos
4. Para **adicionar**: clique em **Add item** no final da lista e preencha:
   - **Código (ID):** ex. `BF-NOVO-001`
   - **Nome:** nome do produto
   - **Categoria / Slug da categoria:** selecione da lista
   - **Destaque na home:** marque se quiser que apareça na home
   - **Foto do produto:** faça upload (800×600 px, WebP)
5. Clique em **Save**

> **Atenção com preços:** o site não exibe preços — não adicione campos de valor.

---

## 5. Alterando configurações globais (WhatsApp, e-mail, redes)

1. No menu esquerdo, clique em **Configurações**
2. Clique em **Configurações Globais**
3. Altere os campos desejados:
   - **Número WhatsApp:** somente números, com DDD e código do país (ex: `5581983426557`)
   - **E-mail de contato**
   - **Instagram / Facebook:** cole a URL completa do perfil
4. Clique em **Save**

> ⚠️ **Se mudar o número de WhatsApp**, avise o desenvolvedor para atualizar o teste automatizado (`tests/smoke.spec.ts`) — caso contrário, o teste de regressão vai falhar no próximo deploy.

---

## 6. O que acontece depois de salvar

| Ação | Tempo |
|---|---|
| Clicou em **Save** | Sveltia cria um commit no GitHub imediatamente |
| GitHub recebe o commit | Vercel inicia o rebuild automaticamente |
| Site atualizado no ar | ~1 a 2 minutos após o Save |

Você pode acompanhar o rebuild em: **https://vercel.com/dashboard**

---

## 7. Como desfazer uma alteração

Toda mudança salva pelo CMS vira um commit no GitHub. Para desfazer:

1. Acesse: **https://github.com/analistasistemas-bit/landingpagebufalo/commits/main**
2. Localize o commit da alteração indesejada (mensagem começa com `chore(cms):` ou `feat(cms):`)
3. Clique nos **três pontos** → **Revert** — o GitHub cria um commit que desfaz a mudança
4. A Vercel reconstrói automaticamente com o conteúdo anterior

---

## 8. Dúvidas frequentes

**O site não atualizou após salvar.**
Aguarde 2 minutos e atualize a página. Se ainda não mudou, verifique o painel da Vercel para erros de build.

**Apareceu erro ao fazer login.**
Confirme que sua conta GitHub tem acesso ao repositório `analistasistemas-bit/landingpagebufalo`.

**Quero adicionar uma foto de produto que ainda não existe.**
Coloque o arquivo WebP na pasta `public/images/produtos/` com o nome `{ID-do-produto}.webp` (ex: `BF-NOVO-001.webp`) via upload no próprio painel ou pedindo ao desenvolvedor.

**Como adicionar o logo da marca no painel CMS?**
Acesse o GitHub → Settings da OAuth App "Bufalo CMS" → faça upload de uma imagem no campo **Application logo**.
