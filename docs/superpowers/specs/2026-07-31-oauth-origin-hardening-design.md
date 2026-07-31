# Proteção de origin do OAuth do Sveltia CMS

**Data:** 2026-07-31
**Escopo:** `infra/sveltia-auth-worker/`, testes do Worker e limpeza do artefato Playwright rastreado.

## Objetivo

Impedir que uma página externa abra o fluxo OAuth e receba o token GitHub emitido para o CMS. O painel atual na Vercel e o futuro domínio de produção devem continuar funcionando.

## Origins autorizados

- `https://landingpagebufalo.vercel.app`
- `https://marcabufalo.com.br`

A allowlist ficará em `wrangler.toml`, como configuração pública e auditável. Origins devem ser comparados pela origem exata: esquema HTTPS, hostname e porta efetiva. Subdomínios, HTTP, URLs parecidas e origins não listados não serão aceitos.

## Fluxo

1. `/auth` recebe `site_id` do Sveltia CMS, deriva exclusivamente o origin HTTPS correspondente e o rejeita quando não corresponde exatamente à allowlist.
2. O origin validado é associado ao `state` no cookie HttpOnly, Secure e SameSite=Lax, evitando que o callback escolha outro destinatário.
3. `/callback` valida o `state`, recupera o origin associado e só então troca o código pelo token.
4. A página de callback aceita mensagens exclusivamente desse origin e usa o mesmo valor fixo como `targetOrigin` nos dois `postMessage`.
5. O Worker não retorna CORS wildcard. Preflight só recebe cabeçalhos para um origin autorizado.

O cookie guardará um payload autenticado com HMAC usando um novo secret `OAUTH_STATE_SECRET`, contendo `state`, `origin` e expiração. Isso impede alteração manual do origin no navegador sem exigir KV ou Durable Objects.

## Erros

- Origin ausente ou não autorizado: HTTP 400, sem iniciar o OAuth.
- Cookie ausente, adulterado, expirado ou state divergente: resposta OAuth `invalid_state`, sem trocar o código.
- Configuração/secret ausente: HTTP 500 genérico, sem expor detalhes ou credenciais.
- Falha do GitHub: mensagem de erro ao origin autorizado, sem incluir token.

## Testes

Testes unitários em Node cobrirão: os dois origins permitidos; origin malicioso, HTTP e subdomínio rejeitados; associação do origin ao state; cookie adulterado/expirado; state divergente; e HTML final contendo somente o `targetOrigin` autorizado. O teste vulnerável deve falhar antes da correção e passar depois.

Após a implementação: `node --test`, `node --check`, `npm run build`, `npm run test:content` e `npm run test:smoke`.

## Limpeza de repositório

Remover `test-results/.last-run.json` apenas do índice Git, pois `test-results/` já está ignorado. O arquivo local não será apagado.

## Fora do escopo

Publicação do domínio final, deploy do Worker, criação/rotação dos secrets no Cloudflare e alterações visuais da landing page.
