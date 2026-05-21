# Documentacao - Gerenciador de Tarefas

## Estrutura de Arquivos

```
ProjetoJQUERY_2026-1/
├── index.html          -> estrutura HTML da pagina
├── css/
│   └── style.css       -> estilos customizados
└── js/
    ├── app.js          -> logica pura (JavaScript puro, sem jQuery)
    └── interface.js    -> interface e eventos (jQuery)
```

---

## Como os arquivos se conectam

O `index.html` carrega os scripts nessa ordem:

```html
<script src="js/app.js"></script>
<script src="js/interface.js"></script>
```

A ordem importa: `app.js` precisa ser carregado primeiro porque `interface.js` chama funcoes que estao definidas em `app.js`. Se a ordem fosse invertida, o navegador geraria erro de "funcao nao definida".

As variaveis `tarefas`, `editandoId` e `contadorId` declaradas em `app.js` sao globais — ficam disponiveis para `interface.js` automaticamente, pois ambos os arquivos rodam no mesmo escopo do navegador.

---

## app.js — Logica e Estado

### Variaveis globais

```js
var tarefas = [];
var editandoId = null;
var contadorId = 0;
```

**`tarefas`**: array que guarda todos os objetos de tarefa. Cada objeto tem a forma:
```js
{
    id: 1,
    titulo: 'Estudar jQuery',
    descricao: 'Ver documentacao oficial',
    prioridade: 'Alta',
    dataLimite: '2026-05-21',
    status: 'Pendente',
    observacao: ''
}
```

**`editandoId`**: guarda o `id` da tarefa que esta sendo editada no momento. Quando vale `null`, o sistema esta em modo de criacao. Quando tem um numero, esta em modo de edicao. Essa variavel e o que diferencia o comportamento do botao "Concluir" (criar nova tarefa) do botao "Atualizar" (salvar edicao).

**`contadorId`**: numero que so cresce. Cada nova tarefa recebe o valor atual de `contadorId` apos incremento. Isso garante que cada tarefa tenha um ID unico e que IDs nunca se repitam, mesmo apos excluir tarefas.

---

### salvarTarefas()

```js
function salvarTarefas() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
    localStorage.setItem('contadorId', contadorId);
}
```

O `localStorage` e um recurso do navegador que permite salvar dados como texto (string). Ele persiste mesmo apos fechar a aba ou o navegador.

`JSON.stringify(tarefas)` converte o array JavaScript para uma string no formato JSON. Exemplo:
```
'[{"id":1,"titulo":"Estudar","descricao":"","prioridade":"Alta",...}]'
```

Sem essa conversao, o `localStorage` salvaria apenas `"[object Object]"`, que e inutil.

O `contadorId` e salvo separadamente para que, ao recarregar a pagina, o sistema saiba de qual numero continuar ao criar novos IDs.

---

### carregarTarefas()

```js
function carregarTarefas() {
    var dadosSalvos = localStorage.getItem('tarefas');
    var contadorSalvo = localStorage.getItem('contadorId');

    if (dadosSalvos) {
        tarefas = JSON.parse(dadosSalvos);
    }
    if (contadorSalvo) {
        contadorId = parseInt(contadorSalvo);
    }
}
```

`localStorage.getItem` retorna `null` se a chave nao existir (primeira vez que o usuario abre o site). Por isso o `if (dadosSalvos)` verifica antes de tentar converter.

`JSON.parse` faz o inverso do `JSON.stringify`: transforma a string JSON de volta em array JavaScript com objetos reais.

`parseInt` converte a string `"3"` para o numero `3`. O `localStorage` so guarda strings — sem o `parseInt`, operacoes matematicas com `contadorId` nao funcionariam corretamente.

Esta funcao e chamada uma unica vez, no inicio da inicializacao em `interface.js`.

---

### adicionarTarefa(dados)

```js
function adicionarTarefa(dados) {
    contadorId++;
    var novaTarefa = {
        id: contadorId,
        titulo: dados.titulo,
        descricao: dados.descricao,
        prioridade: dados.prioridade,
        dataLimite: dados.dataLimite,
        status: dados.status,
        observacao: dados.observacao
    };
    tarefas.push(novaTarefa);
    salvarTarefas();
    return novaTarefa;
}
```

Recebe um objeto `dados` montado por `interface.js` com os valores do formulario.

`contadorId++` incrementa o contador antes de criar a tarefa — garante ID unico.

O objeto `novaTarefa` e criado com todos os campos. Em seguida, `.push()` adiciona esse objeto ao final do array `tarefas`.

`salvarTarefas()` e chamado imediatamente para que o localStorage reflita o novo estado.

A funcao retorna `novaTarefa` para que `interface.js` possa usar o objeto (com o `id` gerado) para montar a linha na tabela.

---

### atualizarTarefa(id, dadosAtualizados)

```js
function atualizarTarefa(id, dadosAtualizados) {
    var index = -1;
    for (var i = 0; i < tarefas.length; i++) {
        if (tarefas[i].id === id) {
            index = i;
        }
    }
    if (index !== -1) {
        tarefas[index].titulo = dadosAtualizados.titulo;
        tarefas[index].descricao = dadosAtualizados.descricao;
        tarefas[index].prioridade = dadosAtualizados.prioridade;
        tarefas[index].dataLimite = dadosAtualizados.dataLimite;
        tarefas[index].status = dadosAtualizados.status;
        tarefas[index].observacao = dadosAtualizados.observacao;
        salvarTarefas();
        return tarefas[index];
    }
    return null;
}
```

**Por que comecar com `index = -1`?**
`-1` e usado como sentinela — significa "nao encontrado". Se o loop terminar sem encontrar o `id`, `index` continua `-1` e o `if (index !== -1)` nao executa. Isso evita erros ao tentar acessar `tarefas[-1]`.

**O loop for:**
Percorre todos os elementos do array. Quando encontra a tarefa com o `id` correto, guarda o indice em `index`. O loop continua ate o fim (nao usa `break`) — comportamento simples e direto.

**Atualizacao campo a campo:**
Cada propriedade e sobrescrita individualmente. O `id` da tarefa nao e tocado — permanece o mesmo durante toda a vida da tarefa.

Retorna a tarefa atualizada para que `interface.js` possa re-renderizar a linha na tabela.

---

### excluirTarefa(id)

```js
function excluirTarefa(id) {
    for (var i = 0; i < tarefas.length; i++) {
        if (tarefas[i].id === id) {
            tarefas.splice(i, 1);
            break;
        }
    }
    salvarTarefas();
}
```

`splice(i, 1)` remove 1 elemento a partir do indice `i` do array. O array e modificado diretamente (mutacao).

O `break` encerra o loop imediatamente apos encontrar e remover — nao faz sentido continuar percorrendo apos ja ter removido.

`salvarTarefas()` e chamado depois para sincronizar o localStorage com o novo estado do array.

---

### filtrarTarefas(status, prioridade)

```js
function filtrarTarefas(status, prioridade) {
    var resultado = [];
    for (var i = 0; i < tarefas.length; i++) {
        var tarefa = tarefas[i];
        var passouStatus = false;
        var passouPrioridade = false;

        if (status === '' || tarefa.status === status) {
            passouStatus = true;
        }
        if (prioridade === '' || tarefa.prioridade === prioridade) {
            passouPrioridade = true;
        }
        if (passouStatus && passouPrioridade) {
            resultado.push(tarefa);
        }
    }
    return resultado;
}
```

Nao modifica o array `tarefas` original — cria e retorna um novo array `resultado`.

**Logica dos filtros:**
Cada filtro tem dois casos para ser considerado "passou":
- O filtro esta vazio (`''`) — usuario nao selecionou nenhum filtro, entao qualquer valor passa
- O valor da tarefa bate com o filtro selecionado

**O operador `||` (OU logico):**
Se a primeira condicao for verdadeira, a segunda nem e avaliada (curto-circuito). Isso significa: "se nao ha filtro, aceita qualquer tarefa".

**Tabela de exemplos:**

| status passado | prioridade passada | resultado |
|---|---|---|
| `''` | `''` | todas as tarefas |
| `'Pendente'` | `''` | so pendentes |
| `''` | `'Alta'` | so de prioridade alta |
| `'Pendente'` | `'Alta'` | pendentes E de prioridade alta |

---

### getTarefaById(id)

```js
function getTarefaById(id) {
    for (var i = 0; i < tarefas.length; i++) {
        if (tarefas[i].id === id) {
            return tarefas[i];
        }
    }
    return null;
}
```

Percorre o array e retorna o objeto tarefa assim que encontrar o `id`. O `return` dentro do loop encerra a funcao imediatamente — nao continua percorrendo.

Se nenhuma tarefa tiver aquele `id`, retorna `null`. O chamador em `interface.js` verifica isso com `if (!tarefa) return`.

---

### Funcoes de controle de edicao

```js
function setEditandoId(id) { editandoId = id; }
function getEditandoId()    { return editandoId; }
function limparEditandoId() { editandoId = null; }
```

Essas tres funcoes encapsulam o acesso a variavel `editandoId`. Em vez de `interface.js` modificar a variavel global diretamente, ele usa essas funcoes — mantendo a responsabilidade do estado dentro de `app.js`.

---

## interface.js — jQuery e DOM

### O que e jQuery

jQuery e uma biblioteca JavaScript que simplifica a manipulacao do DOM. Em vez de escrever:
```js
document.getElementById('titulo').value
```
Escreve-se:
```js
$('#titulo').val()
```

O `$` e a funcao principal do jQuery. `$('#titulo')` seleciona o elemento com `id="titulo"` e retorna um objeto jQuery com varios metodos prontos.

---

### Inicializacao: $(function() { ... })

```js
$(function () {
    // codigo aqui
});
```

Equivalente a `document.addEventListener('DOMContentLoaded', ...)`. O codigo dentro so executa quando o HTML terminou de ser carregado pelo navegador. Sem isso, o JavaScript tentaria selecionar elementos que ainda nao existem no DOM e falharia silenciosamente.

**Sequencia de inicializacao:**
1. `carregarTarefas()` — restaura o array do localStorage
2. `atualizarContadorNav()` — exibe o total correto na navbar
3. Se o array nao estiver vazio: cria a tabela e renderiza cada tarefa salva

---

### Evento: botao "+ Observacao"

```js
$('#btn-observacao').on('click', function () {
    $(this).toggleClass('btn-ativo');
    if ($('#campo-observacao').length === 0) {
        $('#campo-observacao-container').append(
            '<div id="campo-observacao" class="mb-3">...'
        );
    } else {
        $('#campo-observacao').remove();
    }
});
```

**`$(this)`**: dentro de um evento jQuery, `this` refere-se ao elemento que disparou o evento — neste caso, o botao clicado. `$(this)` o envolve em jQuery para ter acesso aos metodos.

**`toggleClass('btn-ativo')`**: se o botao nao tem a classe `btn-ativo`, adiciona. Se ja tem, remove. Isso alterna a aparencia do botao (fica vermelho quando ativo) sem precisar de `if/else`.

**`$('#campo-observacao').length`**: `.length` retorna quantos elementos foram encontrados pelo seletor. Se retornar `0`, o campo nao existe no DOM. Se retornar `1`, existe. Essa e a forma jQuery de verificar existencia de elemento.

**`.append()`**: insere o HTML como ultimo filho do elemento selecionado. O campo de observacao e criado do zero aqui — nao existe no HTML inicial, atendendo ao requisito de "criacao dinamica via manipulacao DOM".

**`.remove()`**: remove o elemento do DOM completamente, incluindo seus filhos e eventos associados.

---

### Evento: submit do formulario

```js
$('#form-tarefa').on('submit', function (e) {
    e.preventDefault();
    ...
});
```

**`e.preventDefault()`**: o comportamento padrao de um formulario HTML ao ser submetido e recarregar a pagina (ou redirecionar para a URL do atributo `action`). Isso apagaria todos os dados. `preventDefault()` cancela esse comportamento padrao, permitindo que o JavaScript cuide do submit.

**Validacao:**
```js
if (!titulo) {
    $('#erro-titulo').text('O titulo e obrigatorio!');
    $('#erro-titulo').addClass('visivel');
    $('#titulo').addClass('input-erro');
    return;
}
```

`!titulo` e verdadeiro quando `titulo` e uma string vazia `''`. O `return` dentro do `if` encerra a execucao da funcao — o codigo abaixo nao roda, impedindo o cadastro.

`$('#erro-titulo').text(...)` define o texto da mensagem de erro. `.addClass('visivel')` faz o elemento aparecer (o CSS tem `display: none` por padrao e `display: block` quando tem a classe `visivel`).

**Decisao criar vs atualizar:**
```js
if (getEditandoId() !== null) {
    var tarefaAtualizada = atualizarTarefa(getEditandoId(), dados);
    atualizarLinhaTabela(tarefaAtualizada);
    limparEditandoId();
} else {
    var novaTarefa = adicionarTarefa(dados);
    if ($('#tabela-tarefas').length === 0) {
        criarSecaoLista();
    }
    adicionarLinhaTabela(novaTarefa);
}
```

Se `editandoId` nao e `null`, esta em modo edicao: atualiza a tarefa no array e atualiza a linha na tabela. Se e `null`, esta em modo criacao: adiciona nova tarefa e adiciona nova linha.

A verificacao `$('#tabela-tarefas').length === 0` trata o caso da primeira tarefa — a tabela ainda nao existe e precisa ser criada antes de adicionar a linha.

---

### Evento: excluir tarefa

```js
$(document).on('click', '.btn-excluir', function () {
    var id = parseInt($(this).data('id'));
    var linha = $(this).closest('tr');
    linha.remove();
    excluirTarefa(id);
    atualizarContadorNav();
    if ($('#tabela-tarefas tbody tr').length === 0) {
        $('#secao-lista').empty();
    }
});
```

**Por que `$(document).on(...)` e nao `$('.btn-excluir').on(...)`?**
Os botoes de excluir sao criados dinamicamente pelo JavaScript (nao existem no HTML inicial). Quando o jQuery executa `$('.btn-excluir').on(...)` no carregamento da pagina, esses botoes ainda nao existem — o evento nao seria registrado neles.

A delegacao de eventos resolve isso: o evento e registrado no `document` (que sempre existe). Quando qualquer clique ocorre na pagina, o `document` recebe o evento. O jQuery entao verifica se o elemento clicado bate com o seletor `.btn-excluir`. Se sim, executa a funcao.

**`$(this).data('id')`**: le o atributo `data-id="3"` do botao. Cada botao tem o id da sua tarefa embutido no HTML: `data-id="1"`, `data-id="2"`, etc.

**`parseInt`**: `data()` retorna string. O array usa numeros como ID. Sem `parseInt`, a comparacao `tarefas[i].id === id` falharia porque `3 === '3'` e `false` em JavaScript (comparacao estrita).

**`$(this).closest('tr')`**: sobe na arvore HTML a partir do botao ate encontrar o `<tr>` mais proximo. Funciona independente de quantos elementos existam entre o botao e a linha.

**Remover tabela vazia:**
```js
if ($('#tabela-tarefas tbody tr').length === 0) {
    $('#secao-lista').empty();
}
```
Se nao restou nenhuma linha, remove toda a secao (filtros + tabela) do DOM. Deixa a pagina no estado inicial.

---

### Evento: editar (botao e duplo clique)

```js
$(document).on('click', '.btn-editar', function () {
    var id = parseInt($(this).data('id'));
    carregarTarefaNoFormulario(id);
});

$(document).on('dblclick', '#tabela-tarefas tbody tr', function () {
    var id = parseInt($(this).data('id'));
    carregarTarefaNoFormulario(id);
});
```

Ambos usam delegacao pelo mesmo motivo do excluir: elementos dinamicos.

No duplo clique, `$(this)` e o `<tr>`, que tambem tem o atributo `data-id` definido em `montarLinha`.

---

### Evento: filtrar

```js
$(document).on('click', '#btn-filtrar', function () {
    var statusFiltro = $('#filtro-status').val();
    var prioridadeFiltro = $('#filtro-prioridade').val();
    var resultado = filtrarTarefas(statusFiltro, prioridadeFiltro);
    $('#tabela-tarefas tbody').empty();
    if (resultado.length === 0) {
        $('#tabela-tarefas tbody').html('...');
    } else {
        for (var i = 0; i < resultado.length; i++) {
            adicionarLinhaTabela(resultado[i]);
        }
    }
});
```

`$('#filtro-status').val()` le o valor da opcao selecionada no select. Se o usuario escolheu "Todos", retorna `''`.

`.empty()` limpa o tbody antes de re-renderizar — evita duplicar linhas.

`filtrarTarefas` (de `app.js`) retorna o subconjunto do array. O `for` re-renderiza apenas as tarefas do resultado.

---

### Evento: change nos filtros

```js
$(document).on('change', '#filtro-status, #filtro-prioridade', function () {
    $('#tabela-tarefas tbody').empty();
    for (var i = 0; i < tarefas.length; i++) {
        adicionarLinhaTabela(tarefas[i]);
    }
});
```

Disparado quando o usuario muda o valor de qualquer um dos dois selects. O seletor com virgula `'#filtro-status, #filtro-prioridade'` registra o mesmo handler para os dois elementos.

Ao mudar o filtro, a tabela volta a mostrar todas as tarefas — limpando o resultado de um filtro anterior.

---

### Evento: keyup no titulo

```js
$('#titulo').on('keyup', function () {
    if ($(this).val().trim() !== '') {
        $('#erro-titulo').text('');
        $('#erro-titulo').removeClass('visivel');
        $(this).removeClass('input-erro');
    }
});
```

`keyup` dispara toda vez que o usuario solta uma tecla no campo. Assim que o campo nao esta mais vazio, a mensagem de erro desaparece em tempo real, sem precisar clicar no botao novamente.

---

### criarSecaoLista()

```js
function criarSecaoLista() {
    var htmlCard = '...';
    $('#secao-lista').html(htmlCard);
}
```

Monta uma string HTML gigante com o card de filtros e a tabela, e injeta dentro de `#secao-lista` com `.html()`.

`.html()` substitui todo o conteudo interno do elemento pelo HTML fornecido. Diferente de `.append()`, que adiciona ao final sem apagar o que ja existe.

A tabela comeca com `<tbody></tbody>` vazio — as linhas serao adicionadas depois por `adicionarLinhaTabela`.

---

### montarLinha(tarefa)

```js
function montarLinha(tarefa) {
    var badgePrio;
    if (tarefa.prioridade === 'Baixa') {
        badgePrio = 'badge-prio-baixa';
    } else if (tarefa.prioridade === 'Media') {
        badgePrio = 'badge-prio-media';
    } else {
        badgePrio = 'badge-prio-alta';
    }
    ...
    var html = '<tr data-id="' + tarefa.id + '">';
    html += '<td>' + tarefa.titulo + '</td>';
    ...
    return html;
}
```

Responsavel por montar a string HTML de uma linha da tabela. Nao insere nada no DOM — apenas retorna a string.

**Determinacao da classe do badge:** `if/else if/else` escolhe qual classe CSS aplicar baseado na prioridade da tarefa. Cada classe tem uma cor diferente no CSS.

**`data-id` no `<tr>`:** o atributo `data-id` e embutido na linha para que o duplo clique na linha consiga identificar qual tarefa editar (sem depender do botao).

**Construcao com `+=`:** cada linha do HTML e concatenada na variavel `html`. Mais facil de ler e modificar do que uma unica string longa.

---

### adicionarLinhaTabela(tarefa)

```js
function adicionarLinhaTabela(tarefa) {
    var linha = $(montarLinha(tarefa));
    if (tarefa.status === 'Concluida') {
        linha.addClass('linha-concluida');
    }
    $('#tabela-tarefas tbody').append(linha);
}
```

`$(montarLinha(tarefa))` converte a string HTML em um objeto jQuery. Isso e necessario para poder chamar `.addClass()` antes de inserir no DOM.

Se a tarefa esta concluida, a classe `linha-concluida` e aplicada (CSS aplica riscado e cor cinza).

`.append()` insere a linha como ultimo filho do `tbody`.

---

### atualizarLinhaTabela(tarefa)

```js
function atualizarLinhaTabela(tarefa) {
    var linhaAntiga = $('tr[data-id="' + tarefa.id + '"]');
    var novaLinha = $(montarLinha(tarefa));
    if (tarefa.status === 'Concluida') {
        novaLinha.addClass('linha-concluida');
    }
    linhaAntiga.replaceWith(novaLinha);
}
```

`$('tr[data-id="1"]')` seleciona o `<tr>` cujo atributo `data-id` vale `1`. Seletor de atributo do CSS/jQuery.

`.replaceWith()` substitui o elemento encontrado pelo novo elemento — a linha antiga sai e a nova entra no mesmo lugar na tabela.

---

### carregarTarefaNoFormulario(id)

```js
function carregarTarefaNoFormulario(id) {
    var tarefa = getTarefaById(id);
    if (!tarefa) return;

    setEditandoId(id);

    $('#titulo').val(tarefa.titulo);
    $('#descricao').val(tarefa.descricao);
    $('#prioridade').val(tarefa.prioridade);
    $('#dataLimite').val(tarefa.dataLimite);
    $('#status').val(tarefa.status);

    if (tarefa.observacao) {
        if ($('#campo-observacao').length === 0) {
            $('#campo-observacao-container').append('...');
            $('#btn-observacao').addClass('btn-ativo');
        }
        $('#observacao').val(tarefa.observacao);
    } else {
        $('#campo-observacao').remove();
        $('#btn-observacao').removeClass('btn-ativo');
    }

    $('#titulo-form').text('Editando Tarefa');
    $('#btn-concluir').text('Atualizar');
    $('#btn-concluir').removeClass('btn-success');
    $('#btn-concluir').addClass('btn-primary');

    $('html, body').animate({ scrollTop: 0 }, 300);
}
```

**`if (!tarefa) return`**: seguranca — se por algum motivo o `id` nao existir no array, encerra a funcao sem fazer nada.

**`setEditandoId(id)`**: marca o sistema como "em modo edicao". A partir daqui, o proximo submit do formulario vai atualizar em vez de criar.

**`.val(valor)`**: quando chamado com argumento, define o valor do campo. Usado para preencher o formulario com os dados da tarefa.

**Campo observacao:** se a tarefa tem observacao, o campo e criado (se ainda nao existir) e preenchido. Se nao tem, o campo e removido. O estado do botao (classe `btn-ativo`) acompanha.

**`.text('Editando Tarefa')`**: atualiza o cabecalho do card do formulario visualmente para indicar modo edicao.

**`.animate({ scrollTop: 0 }, 300)`**: rola a pagina suavemente ate o topo em 300 milissegundos para que o usuario veja o formulario preenchido.

---

### limparFormulario()

```js
function limparFormulario() {
    $('#form-tarefa')[0].reset();
    $('#campo-observacao').remove();
    $('#btn-observacao').removeClass('btn-ativo');
    $('#erro-titulo').text('');
    $('#erro-titulo').removeClass('visivel');
    $('#titulo').removeClass('input-erro');
    $('#titulo-form').text('Nova Tarefa');
    $('#btn-concluir').text('Concluir');
    $('#btn-concluir').removeClass('btn-primary');
    $('#btn-concluir').addClass('btn-success');
}
```

**`$('#form-tarefa')[0].reset()`**: `[0]` acessa o elemento DOM nativo (sem jQuery). `.reset()` e um metodo nativo do HTML que limpa todos os campos do formulario para seus valores padrao (definidos no HTML). Mais simples do que limpar campo por campo.

O resto restaura manualmente o estado visual que o `.reset()` nao cobre: remove o campo observacao, limpa mensagens de erro, restaura o cabecalho e o botao para o estado de criacao.

---

### atualizarContadorNav()

```js
function atualizarContadorNav() {
    var total = tarefas.length;
    var texto;
    if (total === 0) {
        texto = '0 tarefas cadastradas';
    } else if (total === 1) {
        texto = '1 tarefa cadastrada';
    } else {
        texto = total + ' tarefas cadastradas';
    }
    $('#contador-nav').text(texto);
}
```

Le o tamanho atual do array e atualiza o texto na navbar. O `if/else if/else` garante concordancia gramatical (singular vs plural).

---

## Fluxo completo: adicionar tarefa

```
1. Usuario preenche o formulario
2. Clica em "Concluir"
3. Evento submit dispara em interface.js
4. e.preventDefault() cancela o recarregamento
5. Valida o titulo — se vazio, exibe erro e para
6. Monta objeto dados com os valores dos campos
7. getEditandoId() retorna null -> modo criacao
8. adicionarTarefa(dados) [app.js]
   - incrementa contadorId
   - cria objeto novaTarefa
   - push no array tarefas
   - salvarTarefas() -> localStorage
   - retorna novaTarefa
9. Se tabela nao existe: criarSecaoLista() [interface.js]
10. adicionarLinhaTabela(novaTarefa)
    - montarLinha() monta string HTML
    - $(html) converte para objeto jQuery
    - .append() insere no tbody
11. atualizarContadorNav()
12. limparFormulario()
```

---

## Fluxo completo: editar tarefa

```
1. Usuario clica em "Editar" (ou duplo clique na linha)
2. Evento click/dblclick dispara em interface.js
3. Le o data-id do botao/linha
4. carregarTarefaNoFormulario(id)
   - getTarefaById(id) [app.js] busca a tarefa
   - setEditandoId(id) marca modo edicao
   - .val() preenche cada campo do formulario
   - cria campo observacao se necessario
   - altera cabecalho para "Editando Tarefa"
   - altera botao para "Atualizar"
   - .animate() rola para o topo
5. Usuario faz alteracoes e clica em "Atualizar"
6. Evento submit dispara
7. getEditandoId() retorna o id (nao e null) -> modo edicao
8. atualizarTarefa(id, dados) [app.js]
   - for loop encontra o indice
   - atualiza cada campo
   - salvarTarefas()
   - retorna tarefa atualizada
9. atualizarLinhaTabela(tarefa)
   - seleciona linha antiga pelo data-id
   - montarLinha() cria nova linha
   - .replaceWith() substitui
10. limparEditandoId() -> editandoId = null
11. limparFormulario() restaura estado inicial
```

---

## Todos os recursos jQuery utilizados

| Recurso | Descricao | Onde aparece |
|---|---|---|
| `$(function(){})` | executa apos DOM pronto | inicializacao |
| `$('#seletor')` | seleciona por id | em todo o codigo |
| `$('.classe')` | seleciona por classe | botoes dinamicos |
| `.on('submit')` | evento de envio de formulario | form-tarefa |
| `.on('click')` | evento de clique | botoes em geral |
| `.on('dblclick')` | evento de duplo clique | linha da tabela |
| `.on('change')` | evento de mudanca de valor | selects de filtro |
| `.on('keyup')` | evento de tecla solta | campo titulo |
| `.on()` com delegacao | eventos em elementos dinamicos | botoes da tabela |
| `.val()` | le ou define valor de input/select | formulario |
| `.text()` | define texto puro | mensagens, cabecalhos |
| `.html()` | define conteudo HTML | secao lista |
| `.append()` | adiciona filho ao final | campo observacao, linhas |
| `.remove()` | remove elemento do DOM | campo observacao, linhas |
| `.replaceWith()` | substitui elemento | atualizar linha |
| `.empty()` | remove todos os filhos | tbody, secao-lista |
| `.addClass()` | adiciona classe CSS | erros, estados |
| `.removeClass()` | remove classe CSS | erros, estados |
| `.toggleClass()` | alterna classe CSS | btn-observacao |
| `.closest('tr')` | ancestral mais proximo | excluir linha |
| `.data('id')` | le atributo data-* | id das tarefas |
| `.length` | quantidade de elementos encontrados | verificar existencia |
| `.animate()` | animacao de propriedade CSS | scroll para o topo |
| `[0]` | acesso ao elemento DOM nativo | form.reset() |
