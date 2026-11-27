# CI do frontend — INF-08

O workflow `.github/workflows/frontend-ci.yml` executa em PRs e pushes nas branches
`main`, `develop` e `stage`. Também pode ser disparado manualmente depois de estar
disponível na branch padrão. A integração do workflow depende da revisão do seu PR.

## Verificações

1. Seleciona Node.js 24 a partir de `.node-version`.
2. Instala com `npm ci`, usando `package-lock.json` e cache npm.
3. Executa `npm run lint`, `npm run test:coverage` (Vitest + V8) e `npm run build`.

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
npm run test:coverage
npm run build
```

O resultado real de cada execução fica na aba Actions e nos checks do PR. A
presença deste arquivo, sozinha, não comprova que o workflow executou com sucesso.

## Cobertura mínima

O `vite.config.ts` exige **90% em linhas, instruções, funções e ramificações
por arquivo**. A medição inclui todos os arquivos `src/**/*.ts` e `src/**/*.tsx`,
inclusive os que nenhum teste importou. Uma média global alta não compensa um
arquivo abaixo do limite. Não há atualização automática dos limites.

As únicas exclusões de produção são `src/main.tsx` (inicialização do React,
sem regras próprias), `src/domain/types.ts` e `src/services/api/contracts.ts`
(somente tipos) e `src/shared/ui/index.ts` (somente reexports). Testes, auxiliares
de teste e declarações `.d.ts` também ficam fora da medição. O componente `App`,
as rotas, a configuração de ambiente, os adaptadores mock/HTTP e os componentes
de mapa continuam sujeitos à meta.

O relatório navegável fica em `coverage/index.html`; `coverage/coverage-summary.json`
contém os totais e as métricas por arquivo. Esses resultados são gerados localmente
e não são versionados. `npm test` continua disponível para uma execução rápida sem
medição; o CI usa obrigatoriamente `npm run test:coverage`.

Os cenários verificam validações e limites, permissões e contratos HTTP, respostas
de erro e recuperação, cancelamento de consultas, localização e navegação,
preparação de fotos e estados da interface. Leaflet, GPS, Canvas e rede são
substituídos nos limites externos dos testes quando dependem de recursos físicos
ou serviços externos. Isso torna a suíte reproduzível, mas a cobertura não mede
sozinha a qualidade das asserções nem substitui testes com a API real e no celular.
