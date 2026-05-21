var tarefas = [];
var editandoId = null;
var contadorId = 0;

function salvarTarefas() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
    localStorage.setItem('contadorId', contadorId);
}

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

function adicionarTarefa(dados) {
    contadorId++;
    var novaTarefa = {
        id: contadorId,
        titulo: dados.titulo,
        descricao: dados.descricao || '',
        prioridade: dados.prioridade,
        dataLimite: dados.dataLimite || '',
        status: dados.status,
        observacao: dados.observacao || ''
    };
    tarefas.push(novaTarefa);
    salvarTarefas();
    return novaTarefa;
}

function atualizarTarefa(id, dadosAtualizados) {
    var index = tarefas.findIndex(function(t) { return t.id === id; });
    if (index !== -1) {
        tarefas[index] = {
            id: tarefas[index].id,
            titulo: dadosAtualizados.titulo,
            descricao: dadosAtualizados.descricao || '',
            prioridade: dadosAtualizados.prioridade,
            dataLimite: dadosAtualizados.dataLimite || '',
            status: dadosAtualizados.status,
            observacao: dadosAtualizados.observacao || ''
        };
        salvarTarefas();
        return tarefas[index];
    }
    return null;
}

function excluirTarefa(id) {
    tarefas = tarefas.filter(function(t) { return t.id !== id; });
    salvarTarefas();
}

function filtrarTarefas(status, prioridade) {
    return tarefas.filter(function(t) {
        var matchStatus = (status === '' || t.status === status);
        var matchPrioridade = (prioridade === '' || t.prioridade === prioridade);
        return matchStatus && matchPrioridade;
    });
}

function getTarefaById(id) {
    return tarefas.find(function(t) { return t.id === id; });
}

function setEditandoId(id) {
    editandoId = id;
}

function getEditandoId() {
    return editandoId;
}

function limparEditandoId() {
    editandoId = null;
}
