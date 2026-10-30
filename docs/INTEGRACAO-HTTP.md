# Integração HTTP

O adaptador foi alinhado aos DTOs Java de `zelar.app-backend:develop`
(`e0d47f21e0439437c031d7610de12dd4dbbb1cd2` para fotografias). Os testes de contrato usam esses
formatos; não substituem o ensaio com backend e banco em execução.

## Ambiente local

Use Node.js 24. Para desenvolvimento com o backend em localhost:8080, coloque em
`.env.local`:

```dotenv
VITE_API_MODE=http
VITE_API_BASE_URL=
API_PROXY_TARGET=http://localhost:8080
```

Execute `npm ci` e `npm run dev`. A base vazia é o padrão e usa caminhos `/api/v1/...` da mesma
origem do Vite, que encaminha `/api` ao backend. Isso evita depender de CORS no
ensaio local. O proxy não existe no build de produção: configure um reverse proxy
na mesma origem ou CORS explícito no backend para a origem publicada.

`API_PROXY_TARGET` é configuração do servidor local, não uma variável pública
`VITE_*`. Não coloque segredos nas variáveis do frontend.

## Contratos

- Login: converte `accessToken` para `SessaoAuth.token` e envia Bearer nas chamadas
  seguintes. A restauração da sessão revalida usuário e perfil em `/auth/me`.
- Ocorrências: converte coordenadas e `dataCriacao/dataAtualizacao` para o modelo
  interno. A listagem percorre todas as páginas `conteudo`, usando `pagina` e
  `tamanho`. Categoria/autoria são filtradas no cliente porque o contrato de
  listagem Java só recebe status/prioridade.
- Atualização: prioridade e status usam PATCHs separados, nesta ordem. As duas
  operações não são uma transação. Se a prioridade for salva e o status falhar,
  o erro informa o resultado parcial; o painel deve recarregar os dados também
  quando houver erro, preservando a mensagem e permitindo nova tentativa.
- Indicadores: o mapeamento é o do PR backend #83 (BE-15), já integrado no backend.
  Um 404 permite calcular os indicadores a partir de todas as páginas;
  outros erros são apresentados, sem mascarar autorização ou indisponibilidade.
- Fotos: cria a ocorrência em JSON e envia a foto separadamente em
  `POST /api/v1/ocorrencias/{id}/fotografia`, multipart com parte `foto`.
  Uma falha no segundo passo mantém o chamado criado, informa o resultado parcial
  e permite anexar novamente ao mesmo ID. `possuiFotografia` indica a disponibilidade;
  a leitura dos bytes usa Bearer, com URL temporária revogada ao sair da tela.
  O backend exige bucket privado e chave moderna `sb_secret_...` exclusivamente no
  servidor. Um sucesso no mock não comprova upload ou armazenamento real.

## Validação pendente de ambiente

Os testes do adaptador cobrem os formatos reais com respostas simuladas, incluindo
login → consulta → alteração administrativa. Upload, GPS/câmera em dispositivos
físicos e execução do workflow CI continuam sendo verificações distintas.
Não encerrar tarefas de backend com evidência apenas do modo mock.
SLA_DIAS continua sendo estimativa demonstrativa.

## Conferência integrada em 26/10/2026

As alterações das branches intermediárias foram reunidas com `develop`, mantendo
as correções de HTTP, preparação da foto, prioridade e testes já existentes.
Build, lint e os 145 testes da aplicação reunida passaram localmente com Node 24.

Os próprios adaptadores HTTP também foram executados através do proxy Vite contra
Java/PostgreSQL 17 em ambiente temporário: cadastro, login/Bearer, restauração da
sessão, criação e leitura de 105 ocorrências em múltiplas páginas, visibilidade de
cidadão/administrador, filtros, prioridade/status, indicadores, falha parcial de
atualização e logout. O banco de desenvolvimento não foi utilizado. Essa evidência
não substitui o ensaio visual em navegador ou a validação física de GPS/câmera.
