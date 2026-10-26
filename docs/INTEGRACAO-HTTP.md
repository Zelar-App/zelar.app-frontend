# Integração HTTP

O adaptador foi alinhado aos DTOs Java de `zelar.app-backend:develop`
(`5e5abf4d8add13f06a1ca034aa567d6b68e89ef8`). Os testes de contrato usam esses
formatos; não substituem o ensaio com backend e banco em execução.

## Ambiente local

Use Node.js 24. Para desenvolvimento com o backend em localhost:8080, coloque em
`.env.local`:

```dotenv
VITE_API_MODE=http
VITE_API_BASE_URL=
API_PROXY_TARGET=http://localhost:8080
```

Execute `npm ci` e `npm run dev`. A base vazia usa caminhos `/api/v1/...` da mesma
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
- Indicadores: o mapeamento é o do PR backend #83 (BE-15), ainda uma dependência
  externa. Um 404 permite calcular os indicadores a partir de todas as páginas;
  outros erros são apresentados, sem mascarar autorização ou indisponibilidade.
- Fotos: a develop conferida aceita JSON e não implementa multipart (BE-13).
  O mock continua demonstrando fotos; o modo HTTP informa essa limitação antes de
  enviar. Um sucesso no mock não comprova upload ou armazenamento real.

## Validação pendente de ambiente

Os testes do adaptador cobrem os formatos reais com respostas simuladas, incluindo
login → consulta → alteração administrativa. O ensaio com Java/Postgres, upload,
GPS/câmera em dispositivos físicos e o workflow CI da INF-08 (#13) continuam sendo
verificações distintas. Não encerrar FE-08 ou tarefas de backend com evidência
apenas do modo mock. SLA_DIAS continua sendo estimativa demonstrativa.
