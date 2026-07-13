# Lançador de Notas SIAEP

Extensão local para Chrome/Edge desenvolvida para agilizar o lançamento de notas no SIAEP a partir de planilhas, com conferência por nome do aluno e proteção contra preenchimento indevido em linhas riscadas, bloqueadas ou desativadas.

## Objetivo

O projeto foi criado para reduzir o trabalho repetitivo de copiar notas de uma planilha e digitar manualmente no sistema escolar. A extensão atua somente na página aberta pelo usuário, identifica os alunos exibidos na tabela do SIAEP, compara os nomes com os dados da planilha e preenche apenas os campos válidos.

Ela não clica em salvar automaticamente. O professor ainda confere visualmente o resultado antes de confirmar no sistema.

## Principais Funcionalidades

- Importação de planilhas `.xlsx`, `.csv` e `.tsv`.
- Leitura de arquivos Excel com várias abas.
- Detecção automática da coluna de nomes.
- Detecção de colunas prováveis de nota, prova, avaliação, atividade ou trabalho.
- Preenchimento da página aberta do SIAEP por comparação de nomes.
- Comparação tolerante a acentos, maiúsculas/minúsculas e pequenas diferenças de escrita.
- Tentativa de correspondência por palavras principais quando o nome da planilha está abreviado.
- Identificação e bloqueio de alunos riscados, campos desativados ou campos somente leitura.
- Destaque visual das linhas preenchidas, ignoradas ou duvidosas.
- Modo manual para colar pares `nome + nota`, sem depender de arquivo.

## Por Que Foi Desenvolvido

O lançamento de notas em sistemas escolares pode ser uma tarefa demorada, e como sempre costumo utilizar planilhas para organizar duranto o periodo de aula as notas dos alunos, acaba se tornando repetitiva e suscetível a erros de digitação essa parte de pegar da planilha e colocar no sistema. Esta extensão foi desenvolvida para automatizar a parte operacional, mantendo o controle final com o usuário.

O foco do projeto é apoiar o trabalho docente, economizar tempo e diminuir erros no processo de transferência de notas da planilha para o SIAEP.

## Tecnologias Usadas

- JavaScript.
- HTML e CSS.
- Parser local de planilhas `.xlsx`.

## Segurança e Privacidade

- A extensão roda localmente no navegador.
- Os dados da planilha não são enviados para servidor externo.
- A extensão não salva as notas automaticamente no SIAEP.
- A confirmação final continua sendo feita manualmente pelo usuário.

## Como Instalar

A forma recomendada de instalar é pela página de releases do GitHub:

[Acessar a release mais recente](https://github.com/radoslz/lancador-notas-siaep/releases/latest)

Na release mais recente, abra a área **Assets** e baixe o arquivo:

```text
lancador-notas-siaep-v*.*.*.zip
```

Depois de baixar:

1. Extraia o arquivo `.zip`.
2. Abra a página de extensões do navegador:

```text
chrome://extensions/
```

Ou, se estiver usando Microsoft Edge:

```text
edge://extensions/
```

3. Ative o **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação**.
5. Selecione a pasta extraída da release.

No final, a extensão aparecerá na lista de extensões do navegador como:

```text
Lançador de Notas SIAEP
```

## Instalar Pelo Código-Fonte

Essa opção é indicada para quem deseja estudar ou modificar o projeto.

Clone o repositório:

```bash
git clone https://github.com/radoslz/lancador-notas-siaep.git
cd lancador-notas-siaep
```

Depois abra `chrome://extensions/`, ative o **Modo do desenvolvedor** e carregue a pasta clonada em **Carregar sem compactação**.

## Como Usar

1. Abra o SIAEP na tela de lançamento de notas.
2. Clique no ícone da extensão.
3. Carregue uma planilha `.xlsx`, `.csv` ou `.tsv`.
4. Escolha a aba da planilha.
5. Escolha a coluna dos nomes.
6. Escolha a coluna da nota que será lançada.
7. Clique em **Preencher página**.
8. Confira as cores na tabela antes de salvar no sistema.

## Cores de Conferência

- Verde: nota preenchida.
- Cinza: aluno riscado, campo desativado ou somente leitura.
- Amarelo: linha sem nota correspondente.
- Vermelho: nome duplicado ou correspondência duvidosa.

