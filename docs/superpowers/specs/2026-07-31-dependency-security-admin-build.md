# Correção das dependências e do aviso de `/admin`

## Contexto

O projeto apresenta cinco vulnerabilidades de severidade alta reportadas pelo `npm audit`. Elas atingem `astro`, `sharp`, `js-yaml`, `postcss` e `svgo`. O build também emite um aviso porque a configuração do Astro tenta gerar um redirecionamento para `/admin` enquanto `public/admin/index.html` já ocupa o mesmo caminho de saída.

## Objetivos

- Eliminar todas as vulnerabilidades altas sem usar `npm audit fix --force`.
- Preservar a versão principal atual do Astro e o comportamento da landing page.
- Remover o aviso conhecido de `/admin` sem tornar o painel inacessível.
- Manter os testes existentes aprovados.

## Solução

1. Executar a correção compatível indicada pelo npm, atualizando o lockfile e as dependências vulneráveis. A simulação prevê Astro 7.1.6, Sharp 0.35.3, js-yaml 4.3.0, PostCSS 8.5.25 e SVGO 4.0.2, além das respectivas dependências transitivas.
2. Remover de `astro.config.mjs` o redirecionamento redundante de `/admin` para `/admin/index.html`. O arquivo estático em `public/admin/index.html` continuará sendo copiado para o build.
3. Não usar `overrides`, mudanças de versão principal ou `--force`.

## Verificação

- Executar `npm audit` e exigir zero vulnerabilidades altas.
- Executar o build e confirmar que o conflito de `/admin` desapareceu.
- Confirmar que `dist/admin/index.html` existe e contém o painel esperado.
- Executar os testes automatizados existentes e os smoke tests aplicáveis.
- Revisar o diff para garantir que as mudanças se limitam à configuração, aos manifestos de dependências e a esta documentação.

## Riscos e mitigação

- Atualizações transitivas podem alterar o comportamento do build. Mitigação: build completo e testes após a atualização.
- A remoção do redirecionamento pode mudar a resposta exata de `/admin` em alguns hosts. Mitigação: validar o artefato estático e os testes de rota; o caminho canônico do painel permanece `/admin/`.
