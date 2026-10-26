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

A stack definitiva do frontend ainda será definida.

* **Frontend:** A definir
* **Gerenciamento de estado:** A definir
* **Comunicação com API:** A definir
* **Testes:** A definir
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

As instruções de instalação das dependências, configuração do ambiente e execução local serão adicionadas após a definição da stack tecnológica do frontend.

## Preparação da base

Use Node.js 24 e `npm ci` para instalar as dependências. Esta etapa prepara
as bibliotecas da aplicação; os comandos de execução serão adicionados com o Vite.

TypeScript, os tipos compartilhados e Oxlint estão instalados. O comando de lint
será disponibilizado junto dos primeiros arquivos de código na próxima etapa.

`npm run dev` inicia a aplicação mínima; `npm run build` verifica os tipos e gera
o build; `npm run preview` serve o build e `npm run lint` verifica o código.
O tema entra na próxima etapa.

O tema global usa Tailwind CSS 4 e a fonte Inter, com a paleta compartilhada do Zelar.
