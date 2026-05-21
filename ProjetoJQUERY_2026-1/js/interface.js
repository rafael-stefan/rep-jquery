$(function () {

    carregarTarefas();
    atualizarContadorNav();
    if (tarefas.length > 0) {
        criarSecaoLista();
        for (var i = 0; i < tarefas.length; i++) {
            adicionarLinhaTabela(tarefas[i]);
        }
    }

    $('#btn-observacao').on('click', function () {
        $(this).toggleClass('btn-ativo');
        if ($('#campo-observacao').length === 0) {
            $('#campo-observacao-container').append(
                '<div id="campo-observacao" class="mb-3">' +
                    '<label class="form-label">Observacao</label>' +
                    '<textarea id="observacao" class="form-control" rows="2" placeholder="Digite uma observacao..."></textarea>' +
                '</div>'
            );
        } else {
            $('#campo-observacao').remove();
        }
    });

    $('#form-tarefa').on('submit', function (e) {
        e.preventDefault();

        var titulo = $('#titulo').val().trim();

        if (!titulo) {
            $('#erro-titulo').text('O titulo e obrigatorio!');
            $('#erro-titulo').addClass('visivel');
            $('#titulo').addClass('input-erro');
            return;
        }
        $('#erro-titulo').text('');
        $('#erro-titulo').removeClass('visivel');
        $('#titulo').removeClass('input-erro');

        var observacao = '';
        if ($('#observacao').length > 0) {
            observacao = $('#observacao').val().trim();
        }

        var dados = {
            titulo: titulo,
            descricao: $('#descricao').val().trim(),
            prioridade: $('#prioridade').val(),
            dataLimite: $('#dataLimite').val(),
            status: $('#status').val(),
            observacao: observacao
        };

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

        atualizarContadorNav();
        limparFormulario();
    });

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

    $(document).on('click', '.btn-editar', function () {
        var id = parseInt($(this).data('id'));
        carregarTarefaNoFormulario(id);
    });

    $(document).on('dblclick', '#tabela-tarefas tbody tr', function () {
        var id = parseInt($(this).data('id'));
        carregarTarefaNoFormulario(id);
    });

    $(document).on('click', '#btn-filtrar', function () {
        var statusFiltro = $('#filtro-status').val();
        var prioridadeFiltro = $('#filtro-prioridade').val();

        var resultado = filtrarTarefas(statusFiltro, prioridadeFiltro);

        $('#tabela-tarefas tbody').empty();

        if (resultado.length === 0) {
            $('#tabela-tarefas tbody').html(
                '<tr><td colspan="7" class="sem-resultados">Nenhuma tarefa encontrada com esses filtros.</td></tr>'
            );
        } else {
            for (var i = 0; i < resultado.length; i++) {
                adicionarLinhaTabela(resultado[i]);
            }
        }
    });

    $(document).on('change', '#filtro-status, #filtro-prioridade', function () {
        $('#tabela-tarefas tbody').empty();
        for (var i = 0; i < tarefas.length; i++) {
            adicionarLinhaTabela(tarefas[i]);
        }
    });

    $('#titulo').on('keyup', function () {
        if ($(this).val().trim() !== '') {
            $('#erro-titulo').text('');
            $('#erro-titulo').removeClass('visivel');
            $(this).removeClass('input-erro');
        }
    });

});

function criarSecaoLista() {
    var htmlCard =
        '<div class="card mb-3">' +
            '<div class="card-header">Filtros</div>' +
            '<div class="card-body">' +
                '<div class="row g-2 align-items-end">' +
                    '<div class="col-sm-4">' +
                        '<label class="form-label">Status</label>' +
                        '<select id="filtro-status" class="form-select form-select-sm">' +
                            '<option value="">Todos</option>' +
                            '<option value="Pendente">Pendente</option>' +
                            '<option value="Concluida">Concluida</option>' +
                        '</select>' +
                    '</div>' +
                    '<div class="col-sm-4">' +
                        '<label class="form-label">Prioridade</label>' +
                        '<select id="filtro-prioridade" class="form-select form-select-sm">' +
                            '<option value="">Todas</option>' +
                            '<option value="Baixa">Baixa</option>' +
                            '<option value="Media">Media</option>' +
                            '<option value="Alta">Alta</option>' +
                        '</select>' +
                    '</div>' +
                    '<div class="col-sm-4">' +
                        '<button id="btn-filtrar" class="btn btn-primary btn-sm w-100">Filtrar</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="card">' +
            '<div class="card-body p-0">' +
                '<table id="tabela-tarefas" class="table table-bordered table-hover mb-0">' +
                    '<thead class="table-dark">' +
                        '<tr>' +
                            '<th>Titulo</th>' +
                            '<th>Descricao</th>' +
                            '<th>Prioridade</th>' +
                            '<th>Data Limite</th>' +
                            '<th>Status</th>' +
                            '<th>Observacao</th>' +
                            '<th>Acoes</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody></tbody>' +
                '</table>' +
            '</div>' +
        '</div>';

    $('#secao-lista').html(htmlCard);
}

function montarLinha(tarefa) {
    var badgePrio;
    if (tarefa.prioridade === 'Baixa') {
        badgePrio = 'badge-prio-baixa';
    } else if (tarefa.prioridade === 'Media') {
        badgePrio = 'badge-prio-media';
    } else {
        badgePrio = 'badge-prio-alta';
    }

    var badgeStatus;
    if (tarefa.status === 'Concluida') {
        badgeStatus = 'badge-concluida';
    } else {
        badgeStatus = 'badge-pendente';
    }

    var dataFormatada;
    if (tarefa.dataLimite) {
        dataFormatada = tarefa.dataLimite.split('-').reverse().join('/');
    } else {
        dataFormatada = '-';
    }

    var descricao = tarefa.descricao;
    if (!descricao) {
        descricao = '-';
    }

    var observacao = tarefa.observacao;
    if (!observacao) {
        observacao = '-';
    }

    var html = '<tr data-id="' + tarefa.id + '">';
    html += '<td>' + tarefa.titulo + '</td>';
    html += '<td>' + descricao + '</td>';
    html += '<td><span class="' + badgePrio + '">' + tarefa.prioridade + '</span></td>';
    html += '<td>' + dataFormatada + '</td>';
    html += '<td><span class="' + badgeStatus + '">' + tarefa.status + '</span></td>';
    html += '<td>' + observacao + '</td>';
    html += '<td>';
    html += '<button class="btn btn-warning btn-sm btn-editar" data-id="' + tarefa.id + '">Editar</button> ';
    html += '<button class="btn btn-danger btn-sm btn-excluir" data-id="' + tarefa.id + '">Excluir</button>';
    html += '</td>';
    html += '</tr>';

    return html;
}

function adicionarLinhaTabela(tarefa) {
    var linha = $(montarLinha(tarefa));
    if (tarefa.status === 'Concluida') {
        linha.addClass('linha-concluida');
    }
    $('#tabela-tarefas tbody').append(linha);
}

function atualizarLinhaTabela(tarefa) {
    var linhaAntiga = $('tr[data-id="' + tarefa.id + '"]');
    var novaLinha = $(montarLinha(tarefa));

    if (tarefa.status === 'Concluida') {
        novaLinha.addClass('linha-concluida');
    }

    linhaAntiga.replaceWith(novaLinha);
}

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
            $('#campo-observacao-container').append(
                '<div id="campo-observacao" class="mb-3">' +
                    '<label class="form-label">Observacao</label>' +
                    '<textarea id="observacao" class="form-control" rows="2"></textarea>' +
                '</div>'
            );
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
