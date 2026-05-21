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

function excluirTarefa(id) {
    for (var i = 0; i < tarefas.length; i++) {
        if (tarefas[i].id === id) {
            tarefas.splice(i, 1);
            break;
        }
    }
    salvarTarefas();
}

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

function getTarefaById(id) {
    for (var i = 0; i < tarefas.length; i++) {
        if (tarefas[i].id === id) {
            return tarefas[i];
        }
    }
    return null;
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
