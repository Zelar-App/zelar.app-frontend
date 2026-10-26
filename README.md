# Zelar.app — Frontend

> "Conectando pessoas, dados e cidades."

Frontend da plataforma **Zelar.app**, responsável pela interface da aplicação, experiência do usuário e comunicação com a API REST disponibilizada pelo backend.

## O Projeto

O Zelar.app é uma plataforma que conecta cidadãos e responsáveis pela infraestrutura urbana, permitindo o registro, acompanhamento e gerenciamento de ocorrências como:

* Buracos em vias;
* Problemas de iluminação;
* Acúmulo de lixo;
* Alagamentos;
* Problemas em calçadas;
* Sinalização danificada;
* Ocorrências ambientais.

O frontend é responsável pela apresentação dessas informações, interação com os usuários, criação e acompanhamento de ocorrências e comunicação com os serviços disponibilizados pelo backend.

## Stack Tecnológica (MVP)

* **Frontend:** React 19, TypeScript e Vite
* **Estilos:** Tailwind CSS 4 e fonte Inter
* **Gerenciamento de estado:** a integrar nas próximas entregas
* **Comunicação com API:** a integrar nas próximas entregas
* **Testes:** Vitest, Testing Library e jsdom
* **Lint:** Oxlint
* **Ferramentas futuras:** Docker e CI/CD

## Arquitetura e Padrões

* Organização do código baseada na responsabilidade de cada componente.

* Separação entre:

  * Componentes de interface;
  * Páginas e telas;
  * Serviços de comunicação com a API;
  * Gerenciamento de estado;
  * Configurações da aplicação.

* Integração com a API REST disponibilizada pelo backend.

* Separação de responsabilidades para facilitar manutenção e escalabilidade.

## Estratégia de Branches

```text
main      → versão estável
stage     → homologação e QA
develop   → integração

feature/* → novas funcionalidades
fix/*     → correções
```

## Qualidade de Software

O projeto busca seguir práticas de qualidade desde o início:

* Controle de versão com Git;
* Desenvolvimento em branches;
* Pull Requests;
* Revisão de código;
* Padronização do código;
* Testes automatizados;
* Componentização e reutilização;
* Documentação contínua.

## Como Executar

Use Node.js 24 e npm. Na raiz do repositório:

```bash
npm ci
npm run dev
```

Para personalizar o ambiente, copie `.env.example` para `.env.local`. As variáveis
`VITE_*` são públicas no frontend e não devem conter segredos. A leitura do ambiente
aceita os modos `mock` e `http`; os adaptadores serão incluídos em entregas futuras.

Para verificar o projeto:

```bash
npm run build
npm run lint
npm test
```

`npm run preview` serve o build local depois de `npm run build`.

Para testar GPS e câmera em dispositivos da rede local, defina `VITE_HTTPS=true`
em `.env.local` e execute `npm run dev`. O HTTPS local usa certificado autoassinado.

## Entrega incremental

Esta primeira entrega contém configuração, dependências, estilos globais,
inicialização mínima e leitura de ambiente com testes. As páginas e a integração
com os serviços serão adicionadas por PRs separados para `develop`.

A base compartilhada ainda será complementada antes dos PRs paralelos de
funcionalidades. A divisão acordada é:

| V4SP3R | Michele |
| --- | --- |
| Base comum | Cadastro |
| Login | Conta do usuário |
| Página do mapa | Página inicial |
| Abertura e formulário de chamado | Histórico de ocorrências |
| Painel administrativo completo | Detalhes e acompanhamento |
| Integração final das rotas | Testes das respectivas funcionalidades |

Cada funcionalidade usa branch própria e inclui seus testes. Alterações na
integração das rotas serão coordenadas para evitar conflitos.
