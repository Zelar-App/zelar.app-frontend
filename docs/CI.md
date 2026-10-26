# CI do frontend — INF-08

O workflow `.github/workflows/frontend-ci.yml` executa em PRs e pushes nas branches
`main`, `develop` e `stage`. Também pode ser disparado manualmente depois de estar
disponível na branch padrão. A integração do workflow depende da revisão do seu PR.

## Verificações

1. Seleciona Node.js 24 a partir de `.node-version`.
2. Instala com `npm ci`, usando `package-lock.json` e cache npm.
3. Executa `npm run lint`, `npm test` (Vitest run) e `npm run build`.

Uma falha interrompe o job e reprova o check. O job tem limite de dez minutos e
execuções anteriores do mesmo ref são canceladas quando substituídas. As actions
oficiais estão fixadas por SHA e recebem somente permissão de leitura do código.

A suíte isolada não precisa de segredos, Java, Postgres ou outros serviços locais.
As respostas HTTP dos testes de contrato são simuladas a partir dos DTOs Java.
Isso não substitui o ensaio frontend/backend vivo nem as verificações físicas de
GPS/câmera/acessibilidade. Consulte [Integração HTTP](INTEGRACAO-HTTP.md).

Para reproduzir localmente com Node.js 24:

```sh
npm ci --no-audit --no-fund
npm run lint
npm test
npm run build
```

O resultado real de cada execução fica na aba Actions e nos checks do PR. A
presença deste arquivo, sozinha, não comprova que o workflow executou com sucesso.
