# Lancador de Notas SIAEP

Extensao local para Chrome/Edge desenvolvida para agilizar o lancamento de notas no SIAEP a partir de planilhas, com conferencia por nome do aluno e protecao contra preenchimento indevido em linhas riscadas, bloqueadas ou desativadas.

Projeto desenvolvido por **Railson Doglas**.

## Objetivo

O projeto foi criado para reduzir o trabalho repetitivo de copiar notas de uma planilha e digitar manualmente no sistema escolar. A extensao atua somente na pagina aberta pelo usuario, identifica os alunos exibidos na tabela do SIAEP, compara os nomes com os dados da planilha e preenche apenas os campos validos.

Ela nao clica em salvar automaticamente. O professor ainda confere visualmente o resultado antes de confirmar no sistema.

## Principais funcionalidades

- Importacao de planilhas `.xlsx`, `.csv` e `.tsv`.
- Leitura de arquivos Excel com varias abas.
- Deteccao automatica da coluna de nomes.
- Deteccao de colunas provaveis de nota, prova, avaliacao, atividade ou trabalho.
- Selecao manual da aba, coluna de nomes e coluna de nota.
- Preenchimento da pagina aberta do SIAEP por comparacao de nomes.
- Comparacao tolerante a acentos, maiusculas/minusculas e pequenas diferencas de escrita.
- Tentativa de correspondencia por palavras principais quando o nome da planilha esta abreviado.
- Identificacao e bloqueio de alunos riscados, campos desativados ou campos somente leitura.
- Destaque visual das linhas preenchidas, ignoradas ou duvidosas.
- Persistencia local da planilha processada e das escolhas da ultima utilizacao.
- Modo manual para colar pares `nome + nota`, sem depender de arquivo.

## Por que foi desenvolvido

O lancamento de notas em sistemas escolares pode ser uma tarefa demorada, repetitiva e suscetivel a erros de digitacao. Esta extensao foi desenvolvida para automatizar a parte operacional, mantendo o controle final com o usuario.

O foco do projeto e apoiar o trabalho docente, economizar tempo e diminuir erros no processo de transferencia de notas da planilha para o SIAEP.

## Tecnologias usadas

- JavaScript puro.
- HTML e CSS.
- Chrome Extension Manifest V3.
- Automacao de DOM no navegador.
- Parser local de planilhas `.xlsx`.
- Armazenamento local com `chrome.storage.local`.

## Seguranca e privacidade

- A extensao roda localmente no navegador.
- Os dados da planilha nao sao enviados para servidor externo.
- A extensao nao salva as notas automaticamente no SIAEP.
- A confirmacao final continua sendo feita manualmente pelo usuario.
- Exemplos do projeto usam dados ficticios.

## Como instalar em modo desenvolvedor

1. Baixe ou clone este repositorio.
2. Abra `chrome://extensions/` ou `edge://extensions/`.
3. Ative o `Modo do desenvolvedor`.
4. Clique em `Carregar sem compactacao`.
5. Selecione a pasta deste projeto.
6. Fixe a extensao na barra do navegador, se desejar.

## Como usar

1. Abra o SIAEP na tela de lancamento de notas.
2. Clique no icone da extensao.
3. Carregue uma planilha `.xlsx`, `.csv` ou `.tsv`.
4. Escolha a aba da planilha.
5. Escolha a coluna dos nomes.
6. Escolha a coluna da nota que sera lancada.
7. Clique em `Preencher pagina`.
8. Confira as cores na tabela antes de salvar no sistema.

## Cores de conferencia

- Verde: nota preenchida.
- Cinza: aluno riscado, campo desativado ou somente leitura.
- Amarelo: linha sem nota correspondente.
- Vermelho: nome duplicado ou correspondencia duvidosa.

## Estrutura do projeto

```text
lancador-notas-siaep/
├── manifest.json
├── popup.html
├── popup.js
├── styles.css
├── content.js
├── xlsx-lite.js
├── icon16.png
├── icon32.png
├── icon48.png
├── icon128.png
└── docs/
```

## Resumo para curriculo

Desenvolvi uma extensao para navegador que automatiza o preenchimento de notas no SIAEP a partir de planilhas Excel, com leitura de multiplas abas, identificacao de colunas de nota, correspondencia por nome do aluno, persistencia local e mecanismos de seguranca para evitar preenchimento em registros bloqueados.

## Autor

**Railson Doglas**

Projeto criado para uso educacional e demonstracao de automacao aplicada a rotinas escolares.
