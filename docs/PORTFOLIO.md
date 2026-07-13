# Resumo de Portfólio

## Projeto

**Lançador de Notas SIAEP**

## Descrição Curta

Extensão para Chrome/Edge que automatiza o preenchimento de notas no SIAEP a partir de planilhas, mantendo conferência visual e controle manual do salvamento.

## Problema Resolvido

Professores precisam transferir notas de planilhas para o sistema escolar manualmente, aluno por aluno. Esse processo é repetitivo, lento e propenso a erros de digitação.

## Solução Desenvolvida

Foi criada uma extensão local de navegador que lê planilhas, identifica colunas de nomes e notas, compara os alunos da planilha com os alunos exibidos na página e preenche os campos corretos no SIAEP.

## Destaques Técnicos

- Extensão em Manifest V3.
- Leitura local de `.xlsx`, `.csv` e `.tsv`.
- Parser próprio para planilhas Excel simples, sem dependência de CDN.
- Correspondência de nomes com normalização de acentos e caixa.
- Tratamento de nomes abreviados por palavras principais.
- Bloqueio de preenchimento em linhas riscadas, `disabled` ou `readonly`.
- Persistência de estado com `chrome.storage.local`.
- Interface simples para selecionar aba, coluna de nomes e coluna de nota.

## Competências Demonstradas

- Automação de processos.
- Manipulação de DOM.
- JavaScript puro.
- Desenvolvimento de extensões para navegador.
- Tratamento de dados tabulares.
- Cuidado com privacidade e validação antes de escrita.
