# Resumo de Portfolio

## Projeto

**Lancador de Notas SIAEP**

## Descricao curta

Extensao para Chrome/Edge que automatiza o preenchimento de notas no SIAEP a partir de planilhas, mantendo conferencia visual e controle manual do salvamento.

## Problema resolvido

Professores precisam transferir notas de planilhas para o sistema escolar manualmente, aluno por aluno. Esse processo e repetitivo, lento e propenso a erros de digitacao.

## Solucao desenvolvida

Foi criada uma extensao local de navegador que le planilhas, identifica colunas de nomes e notas, compara os alunos da planilha com os alunos exibidos na pagina e preenche os campos corretos no SIAEP.

## Destaques tecnicos

- Extensao em Manifest V3.
- Leitura local de `.xlsx`, `.csv` e `.tsv`.
- Parser proprio para planilhas Excel simples, sem dependencia de CDN.
- Correspondencia de nomes com normalizacao de acentos e caixa.
- Tratamento de nomes abreviados por palavras principais.
- Bloqueio de preenchimento em linhas riscadas, `disabled` ou `readonly`.
- Persistencia de estado com `chrome.storage.local`.
- Interface simples para selecionar aba, coluna de nomes e coluna de nota.

## Competencias demonstradas

- Automacao de processos.
- Manipulacao de DOM.
- JavaScript puro.
- Desenvolvimento de extensoes para navegador.
- Tratamento de dados tabulares.
- Cuidado com privacidade e validacao antes de escrita.
