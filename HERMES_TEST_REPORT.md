# Relatório Final — Experimento Hermes Desktop (SubwayVision)

**Data:** 2026-10-10

---

## 1. Objetivo do experimento

O SubwayVision foi utilizado como projeto de teste para avaliar a integração entre
**Hermes Desktop**, a skill `github`, a CLI `gh` e o **GitHub**. O objetivo era
registrar as atividades realizadas, criar um commit documentado com as alterações
locais relevantes e enviar a uma branch de teste — **sem publicar na branch `main`**.

---

## 2. Integração com o GitHub

- A CLI `gh` está instalada e autenticada no ambiente local.
- Foram realizadas consultas reais à conta e aos repositórios, incluindo o
  repositório `MarlonSouza-0/SubwayVision`.
- A skill `github` já estava instalada no Hermes.
- Foi confirmada a leitura do repositório `MarlonSouza-0/SubwayVision`
  (branch padrão `main`, último commit `b24f673200e56d50b3be8cf49474231d40ccff7d`).
- Não foi necessário utilizar um MCP externo para os testes executados.

---

## 3. Auditoria do repositório

- Raiz do repositório: `/Users/marlondesouza/subwayvision` (confirmada via
  `git rev-parse --show-toplevel`).
- Branch atual: `main`.
- Remoto `origin`: `git@github.com:MarlonSouza-0/SubwayVision.git` (SSH).
- Último commit local: `b24f673200e56d50b3be8cf49474231d40ccff7d`.
- Branch padrão do GitHub: `main`.
- Estado inicial: o histórico local e o `main` remoto estavam no mesmo commit
  (`b24f673`). Havia alterações locais não commitadas e funcionalidades não
  publicadas.

---

## 4. Alterações implementadas ou preparadas

Dentro do escopo da preparação local (sem publicação), foram implementadas ou
preparadas as seguintes alterações:

- Criação e revisão do `.gitignore` na raiz do repositório;
- Regras de exclusão de caches, arquivos temporários, imagens e rótulos do
  dataset, resultados de execução e modelos treinados;
- Inclusão de `ifcopenshell==0.9.0` em `yolo_service/requirements.txt`;
- Instalação e validação do **IfcOpenShell** no ambiente virtual Python 3.13.15;
- Correções no fluxo de upload do backend FastAPI;
- Mudanças no frontend (login, dashboard, galeria, upload e relatórios);
- Presença dos novos módulos de detecção YOLO e processamento IFC;
- Alteração de `metro-sp/src/app/api/analyze-image/route.js` para retornar
  **HTTP 501**, após uma falha de build causada pela dependência ausente
  `opencv4nodejs`.

> **Observação explícita:** o endpoint legado foi **desativado** (retornou 501)
> e não foi corrigido para voltar a processar imagens.

---

## 5. Testes executados

Testes comprovados pelos relatórios e logs:

- Consultas pela CLI `gh`;
- Importação da aplicação FastAPI;
- Verificação dos endpoints;
- Healthcheck do backend;
- Leitura do IFC de referência e consulta das instâncias `IfcColumn`;
- Validação das regras do `.gitignore`;
- Build do frontend compilado com sucesso, com **7.174 módulos** após a alteração
  no endpoint legado.

---

## 6. Limitações e testes pendentes

- A integração completa entre frontend e backend **não foi comprovada**
  ponta a ponta;
- Os testes de integração com **Firebase de produção não foram executados**;
- A compilação do frontend **não comprova** que todos os fluxos funcionam em
  execução;
- A inferência YOLO por envio real de imagem e IFC deve ser considerada validada
  somente se houver um resultado de teste registrado;
- O dataset e o modelo treinado **não serão incluídos no commit**.

---

## 7. Segurança e estado final

- Nenhuma chave, token ou variável de ambiente secreta foi incluída
  intencionalmente no commit;
- Nenhum deploy foi feito;
- O `main` remoto **não será alterado** por esta operação.

---

## 8. Resumo dos resultados verificados

- **Commit:** `test: document Hermes-assisted SubwayVision changes`;
- **Branch de teste:** `test/hermes-assisted-subwayvision-20261010`;
- **Arquivos incluídos:** `.gitignore`, `HERMES_TEST_REPORT.md`, o frontend
  (login, dashboard, galeria, upload, relatórios), a correção do endpoint
  legado, o backend FastAPI, `ifcopenshell==0.9.0`;
- **Resultado do build:** frontend compilado com sucesso (7.174 módulos);
- **Push:** a tentativa de envio para a branch de teste no GitHub mostrou falha
  de autenticação SSH (`Permission denied (publickey)`) com a configuração
  atual do remoto — **nenhuma alteração de URL ou credenciais foi feita**.

---

## 9. Limitações técnicas registradas

- Não há acesso SSH válido ao repositório remoto; o push para GitHub falhou por
  autenticação. O commit local permanece intacto.
- A compilação do frontend não comprova que todos os fluxos funcionam em
  execução.
- Os testes de integração com Firebase de produção não foram executados.
- A inferência YOLO por envio real de imagem e IFC não foi validada com um
  resultado de teste registrado.
- O dataset e o modelo treinado não foram incluídos no commit.
