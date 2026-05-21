# Documentacao - Gerenciador de Tarefas

## Estrutura de Arquivos

```
ProjetoJQUERY_2026-1/
├── index.html          -> estrutura HTML da pagina
├── css/
│   └── style.css       -> estilos customizados (complementa Bootstrap)
└── js/
    ├── app.js          -> logica pura (dados, estado, localStorage)
    └── interface.js    -> jQuery (DOM, eventos, renderizacao)
```

---

## Divisao de Responsabilidades

O projeto e dividido em duas camadas de JavaScript intencionalmente:

| Arquivo | Responsabilidade |
|---|---|
| `app.js` | Dados e logica de negocio (JavaScript puro, sem jQuery) |
| `interface.js` | Manipulacao do DOM e eventos (jQuery) |

Essa separacao e o objetivo principal do trabalho: demonstrar jQuery isolado da logica.

---

## app.js — Logica e Estado

### Variaveis globais

```js
var tarefas = [];       // array com todas as tarefas
var editandoId = null;  // id da tarefa sendo editada (null = modo criacao)
var contadorId = 0;     // incrementado a cada nova tarefa (ID unico)
```

Essas tres variaveis sao o "estado" da aplicacao. Todo o resto depende delas.

### Persistencia com localStorage

```js
function salvarTarefas()   // converte o array para JSON e salva
function carregarTarefas() // le o JSON salvo e restaura o array
```

O `localStorage` guarda dados no navegador mesmo apos fechar a aba. Os dados sobrevivem entre sessoes. A chave `'tarefas'` armazena o array completo; a chave `'contadorId'` garante que IDs nunca se repitam mesmo apos recarregar.

### CRUD das tarefas

**Adicionar**
```js
function adicionarTarefa(dados)
```
Incrementa `contadorId`, cria um objeto tarefa com todos os campos, empurra no array `tarefas` e salva. Retorna a tarefa criada para que `interface.js` possa renderiza-la.

**Atualizar**
```js
function atualizarTarefa(id, dadosAtualizados)
```
Encontra a tarefa pelo `id` usando `findIndex`, substitui o objeto inteiro (preservando o `id`), salva. Retorna a tarefa atualizada.

**Excluir**
```js
function excluirTarefa(id)
```
Filtra o array removendo o item com o `id` informado, salva.

**Filtrar**
```js
function filtrarTarefas(status, prioridade)
```
Retorna subconjunto do array. Valores vazios (`''`) significam "todos" — sem filtro aplicado para aquele campo.

**Buscar por ID**
```js
function getTarefaById(id)
```
Retorna objeto tarefa ou `undefined`. Usado para carregar dados no formulario ao editar.

### Controle de edicao

```js
function setEditandoId(id)   // entra em modo edicao
function getEditandoId()     // retorna o id atual (ou null)
function limparEditandoId()  // volta para modo criacao
```

Quando `editandoId` nao e `null`, o submit do formulario sabe que deve atualizar em vez de criar.

---

## interface.js — jQuery e DOM

### Inicializacao (document ready)

```js
$(function () { ... });
```

Tudo dentro desse bloco so executa apos o HTML estar carregado. E o ponto de entrada da interface.

Sequencia de inicializacao:
1. `carregarTarefas()` — restaura dados do localStorage (funcao do `app.js`)
2. `atualizarContadorNav()` — exibe total de tarefas na navbar
3. Se existem tarefas salvas: cria a secao de listagem e renderiza cada linha

### Evento: botao "+ Observacao"

```js
$('#btn-observacao').on('click', function () { ... })
```

Verifica se o campo ja existe com `$('#campo-observacao').length === 0`. Se nao existe, cria o `<div>` com `<textarea>` via jQuery e adiciona ao container. Se ja existe, remove. Demonstra criacao dinamica de elementos com `.append()` e remocao com `.remove()`.

### Evento: submit do formulario

```js
$('#form-tarefa').on('submit', function (e) { ... })
```

1. `e.preventDefault()` — impede recarregamento da pagina
2. Valida o campo titulo (obrigatorio)
3. Monta objeto `dados` com os valores dos campos
4. Verifica `getEditandoId()`:
   - Se nao nulo: chama `atualizarTarefa()` + `atualizarLinhaTabela()`
   - Se nulo: chama `adicionarTarefa()` + `adicionarLinhaTabela()`
5. Atualiza contador e limpa formulario

### Evento: excluir tarefa

```js
$(document).on('click', '.btn-excluir', function () { ... })
```

Usa **delegacao de eventos** com `$(document).on(...)` porque os botoes sao criados dinamicamente — nao existem no HTML inicial. Sem delegacao, o `.on('click')` direto no botao nao funcionaria.

Remove a linha do DOM com `.remove()`, depois chama `excluirTarefa(id)` no `app.js`.

### Evento: editar tarefa (botao e duplo clique)

```js
$(document).on('click', '.btn-editar', function () { ... })
$(document).on('dblclick', '#tabela-tarefas tbody tr', function () { ... })
```

Ambos chamam `carregarTarefaNoFormulario(id)`. Duplo clique na linha inteira funciona como atalho.

### Evento: filtrar

```js
$(document).on('click', '#btn-filtrar', function () { ... })
```

Pega os valores dos selects de filtro, chama `filtrarTarefas()` do `app.js`, limpa o tbody com `.empty()` e re-renderiza apenas as tarefas do resultado.

### Evento: validacao em tempo real

```js
$('#titulo').on('keyup', function () { ... })
```

Remove a mensagem de erro enquanto o usuario digita, assim que o campo nao esta mais vazio.

---

## Funcoes de renderizacao

### criarSecaoLista()

Cria toda a secao de filtros + tabela via jQuery e injeta em `#secao-lista` com `.html()`. So e chamada na primeira vez que uma tarefa e adicionada (ou na inicializacao se ja havia tarefas salvas).

### montarLinha(tarefa)

Monta a string HTML de uma linha `<tr>` com os dados da tarefa. Usa `$('<span>').text(valor).prop('outerHTML')` para escapar caracteres especiais do usuario (previne XSS). Retorna a string HTML — nao insere no DOM ainda.

### adicionarLinhaTabela(tarefa)

Converte a string da `montarLinha` em elemento jQuery com `$(html)`, aplica a classe `linha-concluida` se necessario, e adiciona ao `tbody` com `.append()`.

### atualizarLinhaTabela(tarefa)

Encontra a linha existente pelo `data-id`, cria uma nova linha com os dados atualizados e substitui usando `.replaceWith()`.

### carregarTarefaNoFormulario(id)

Busca a tarefa com `getTarefaById(id)` e preenche os campos do formulario com `.val()`. Se a tarefa tem observacao, cria o campo dinamicamente. Atualiza o texto do cabecalho e do botao de submit para indicar modo edicao. Rola a pagina para o topo com `.animate()`.

### limparFormulario()

Reseta o formulario com `[0].reset()` (acesso ao elemento DOM nativo), remove o campo observacao, limpa erros, e restaura os textos do cabecalho e botao para modo criacao.

### atualizarContadorNav()

Le `tarefas.length` e atualiza o texto no navbar com `.text()`.

---

## Fluxo completo: adicionar uma tarefa

```
Usuario preenche formulario
    -> clica em "Concluir"
    -> submit event disparado em interface.js
    -> valida titulo
    -> monta objeto dados
    -> chama adicionarTarefa(dados)  [app.js]
        -> incrementa contadorId
        -> cria objeto tarefa
        -> push no array tarefas
        -> salvarTarefas() -> localStorage
        -> retorna novaTarefa
    -> se tabela nao existe: criarSecaoLista() [interface.js]
    -> adicionarLinhaTabela(novaTarefa) [interface.js]
        -> montarLinha() -> string HTML
        -> $(html) -> elemento jQuery
        -> append no tbody
    -> atualizarContadorNav()
    -> limparFormulario()
```

## Fluxo completo: editar uma tarefa

```
Usuario clica em "Editar" (ou duplo clique na linha)
    -> click event em interface.js (delegado no document)
    -> carregarTarefaNoFormulario(id)
        -> getTarefaById(id) [app.js] -> objeto tarefa
        -> setEditandoId(id) [app.js] -> editandoId = id
        -> preenche campos com .val()
        -> scroll para o topo

Usuario edita e clica em "Atualizar"
    -> submit event
    -> getEditandoId() retorna id (nao e null)
    -> chama atualizarTarefa(id, dados) [app.js]
        -> findIndex no array
        -> substitui objeto
        -> salvarTarefas()
        -> retorna tarefa atualizada
    -> atualizarLinhaTabela(tarefa) [interface.js]
        -> replaceWith nova linha
    -> limparEditandoId() [app.js] -> editandoId = null
    -> limparFormulario()
```

---

## Recursos jQuery utilizados

| Recurso | Onde e usado |
|---|---|
| `$(function(){})` | inicializacao apos DOM pronto |
| `.on('submit')` | captura submit do formulario |
| `.on('click')` | botoes de editar, excluir, filtrar, observacao |
| `.on('dblclick')` | duplo clique na linha da tabela |
| `.on('keyup')` | validacao em tempo real do titulo |
| `.on()` com delegacao | eventos em elementos dinamicos (botoes da tabela) |
| `.val()` | leitura e escrita de inputs e selects |
| `.text()` | escrita de texto simples (sem HTML) |
| `.html()` | escrita de conteudo HTML |
| `.append()` | adiciona elemento filho |
| `.remove()` | remove elemento do DOM |
| `.replaceWith()` | substitui elemento por outro |
| `.empty()` | remove todos os filhos |
| `.addClass()` / `.removeClass()` | manipulacao de classes CSS |
| `.closest('tr')` | navega para ancestral mais proximo |
| `$.each()` | iteracao sobre array de tarefas |
| `.animate()` | scroll suave ao topo ao editar |
| `.length` | verifica se elemento existe no DOM |
| `.prop('outerHTML')` | escape de conteudo do usuario |
| `$('<span>')` | criacao de elemento temporario para escape |
