# Lançador de Notas SIAEP

Extensão local para Chrome/Edge desenvolvida para agilizar o lançamento de notas no SIAEP a partir de planilhas, com conferência por nome do aluno e proteção contra preenchimento indevido em linhas riscadas, bloqueadas ou desativadas.

Projeto desenvolvido por **Railson Doglas**.

## Objetivo

O projeto foi criado para reduzir o trabalho repetitivo de copiar notas de uma planilha e digitar manualmente no sistema escolar. A extensão atua somente na página aberta pelo usuário, identifica os alunos exibidos na tabela do SIAEP, compara os nomes com os dados da planilha e preenche apenas os campos válidos.

Ela não clica em salvar automaticamente. O professor ainda confere visualmente o resultado antes de confirmar no sistema.

## Principais Funcionalidades

- Importação de planilhas `.xlsx`, `.csv` e `.tsv`.
- Leitura de arquivos Excel com várias abas.
- Detecção automática da coluna de nomes.
- Detecção de colunas prováveis de nota, prova, avaliação, atividade ou trabalho.
- Seleção manual da aba, coluna de nomes e coluna de nota.
- Preenchimento da página aberta do SIAEP por comparação de nomes.
- Comparação tolerante a acentos, maiúsculas/minúsculas e pequenas diferenças de escrita.
- Tentativa de correspondência por palavras principais quando o nome da planilha está abreviado.
- Identificação e bloqueio de alunos riscados, campos desativados ou campos somente leitura.
- Destaque visual das linhas preenchidas, ignoradas ou duvidosas.
- Persistência local da planilha processada e das escolhas da última utilização.
- Modo manual para colar pares `nome + nota`, sem depender de arquivo.

## Por Que Foi Desenvolvido

O lançamento de notas em sistemas escolares pode ser uma tarefa demorada, repetitiva e suscetível a erros de digitação. Esta extensão foi desenvolvida para automatizar a parte operacional, mantendo o controle final com o usuário.

O foco do projeto é apoiar o trabalho docente, economizar tempo e diminuir erros no processo de transferência de notas da planilha para o SIAEP.

## Tecnologias Usadas

- JavaScript puro.
- HTML e CSS.
- Chrome Extension Manifest V3.
- Automação de DOM no navegador.
- Parser local de planilhas `.xlsx`.
- Armazenamento local com `chrome.storage.local`.

## Segurança e Privacidade

- A extensão roda localmente no navegador.
- Os dados da planilha não são enviados para servidor externo.
- A extensão não salva as notas automaticamente no SIAEP.
- A confirmação final continua sendo feita manualmente pelo usuário.
- Exemplos do projeto usam dados fictícios.

## Instalar Pela Release

Baixe a versão mais recente na página de releases:

[Baixar release mais recente](https://github.com/radoslz/lancador-notas-siaep/releases/latest)

### Instalação rápida no Windows

Copie e cole no PowerShell:

```powershell
$zip = "$env:USERPROFILE\Downloads\lancador-notas-siaep.zip"
$pasta = "$env:USERPROFILE\Downloads\lancador-notas-siaep"

Invoke-WebRequest `
  -Uri "https://github.com/radoslz/lancador-notas-siaep/releases/latest/download/lancador-notas-siaep-v1.2.3.zip" `
  -OutFile $zip

Expand-Archive -Path $zip -DestinationPath $pasta -Force
Start-Process "chrome.exe" "chrome://extensions/"
```

Depois, no Chrome:

1. Ative o **Modo do desenvolvedor**.
2. Clique em **Carregar sem compactação**.
3. Selecione a pasta extraída:

```text
Downloads\lancador-notas-siaep
```

No Edge, abra:

```text
edge://extensions/
```

E siga o mesmo processo: **Modo do desenvolvedor** > **Carregar sem compactação**.

## Instalar Clonando o Repositório

Se preferir usar Git:

```powershell
git clone https://github.com/radoslz/lancador-notas-siaep.git
cd lancador-notas-siaep
Start-Process "chrome.exe" "chrome://extensions/"
```

Depois carregue a pasta do projeto em **Carregar sem compactação**.

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

## Estrutura do Projeto

```text
lancador-notas-siaep/
|-- manifest.json
|-- popup.html
|-- popup.js
|-- styles.css
|-- content.js
|-- xlsx-lite.js
|-- icon16.png
|-- icon32.png
|-- icon48.png
|-- icon128.png
|-- docs/
|   |-- PORTFOLIO.md
|   `-- PRIVACIDADE.md
|-- CHANGELOG.md
`-- README.md
```

## Resumo Para Currículo

Desenvolvi uma extensão para navegador que automatiza o preenchimento de notas no SIAEP a partir de planilhas Excel, com leitura de múltiplas abas, identificação de colunas de nota, correspondência por nome do aluno, persistência local e mecanismos de segurança para evitar preenchimento em registros bloqueados.

## Autor

**Railson Doglas**

Projeto criado para uso educacional e demonstração de automação aplicada a rotinas escolares.
