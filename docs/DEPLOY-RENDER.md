# Publicação no Render com Supabase

O frontend é um Static Site: Node 24, `npm ci --no-audit --no-fund && npm run build`, diretório `dist`. Configure `VITE_API_MODE=http` e `VITE_API_BASE_URL` vazio no build. Não adicione chaves de banco, JWT ou Storage às variáveis `VITE_*`: elas entram no JavaScript público.

Configure duas rewrites, nesta ordem:

1. `/api/*` → `https://<backend>.onrender.com/api/*` (Rewrite).
2. `/*` → `/index.html` (Rewrite).

A primeira encaminha método, corpo e Bearer ao backend na mesma origem do site; a segunda mantém as rotas React ao atualizar a página. O backend continua aplicando autenticação e autorização. As respostas privadas de API/fotografias não devem ser armazenadas no CDN: configure `Cache-Control: no-store` para `/api/*`.

O backend é um Web Service Docker a partir do repositório `zelar.app-backend`, branch aprovada pela equipe. Configure `SERVER_PORT=10000`, conexão JDBC PostgreSQL com TLS, usuário/senha, `SUPABASE_PUBLISHABLE_KEY` e um `JWT_SECRET` aleatório com pelo menos 32 bytes em Base64. O pooler de sessão do Supabase usa porta 5432 e usuário copiado do painel; não use o modo de transação para contornar erros do Flyway.

O banco existente usa Flyway V1–V5 e Hibernate `validate`. Não habilite `create`, `create-drop` ou `update`. Os acessos de usuários passam pela API Java; as tabelas da aplicação não precisam de grants para `anon`/`authenticated` na Data API do Supabase. RLS e restrição desses grants preservam a conexão JDBC administrativa, que possui bypass de RLS.

## Fotografias

O contrato atual cria o chamado em JSON e envia a foto em `POST /api/v1/ocorrencias/{id}/fotografia`, multipart com parte `foto`. O backend precisa de `FOTOGRAFIAS_HABILITADAS=true`, `SUPABASE_STORAGE_URL`, `SUPABASE_STORAGE_BUCKET` e uma chave moderna `sb_secret_...` em `SUPABASE_STORAGE_SECRET_KEY`. Use bucket privado, JPEG/PNG e limite de 5 MiB. Uma chave `anon` não serve para esse acesso. A chave legada `service_role` ainda é aceita pelo Supabase, mas o adaptador Java atual valida especificamente o formato moderno.

Se a segunda operação falhar, o chamado já existe: a interface navega para ele, informa a falha e permite anexar a foto ao mesmo ID. A consulta da imagem usa Bearer via backend e uma URL temporária revogada ao sair da tela. Nenhuma chave Supabase de servidor chega ao navegador.

## Operação

O plano gratuito do backend suspende após inatividade e pode demorar no primeiro acesso. Não use processos artificiais para impedir essa suspensão. O Static Site pode permanecer gratuito dentro dos limites de uso; upgrades pagos exigem decisão do responsável.

O serviço Redis/Key Value não é necessário para o backend atual. Ele não substitui PostgreSQL nem concede acesso à API do Render.

Quando o serviço usa Public Git Repository, o deploy é manual. Após revisão e merge do PR pela equipe, troque a branch de publicação para `develop`/`stage` conforme a política do projeto, confira o SHA e faça Manual Deploy. Nenhum merge em branch protegida é parte do deploy.
