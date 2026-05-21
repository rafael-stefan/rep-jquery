var prioridadeLabel = { Baixa: 'Baixa', Media: 'Media', Alta: 'Alta' };
var prioridadeBadge = {
    Baixa: 'badge-prio-baixa',
    Media: 'badge-prio-media',
    Alta:  'badge-prio-alta'
};

$(function () {
    carregarTarefas();
    atualizarContadorNav();
    if (tarefas.length > 0) {
        criarSecaoLista();
        $.each(tarefas, function (i, tarefa) {
            adicionarLinhaTabela(tarefa);
        });
    }

    $('#btn-observacao').on('click', function () {
        if ($('#campo-observacao').length === 0) {
            var novoCampo = $(
                '<div id="campo-observacao" class="mb-3">' +
                    '<label class="form-label">Observacao</label>' +
                    '<textarea id="observacao" class="form-control" rows="2" placeholder="Digite uma observacao..."></textarea>' +
                '</div>'
            );
            $('#campo-observacao-container').append(novoCampo);
            $(this).text('- Observacao');
        } else {
            $('#campo-observacao').remove();
            $(this).text('+ Observacao');
        }
    });

    $('#form-tarefa').on('submit', function (e) {
        e.preventDefault();

        var titulo = $('#titulo').val().trim();

        if (!titulo) {
            $('#erro-titulo').text('O titulo e obrigatorio!').addClass('visivel');
            $('#titulo').addClass('input-erro');
            return;
        }
        $('#erro-titulo').text('').removeClass('visivel');
        $('#titulo').removeClass('input-erro');

        var observacao = '';
        if ($('#observacao').length > 0) {
            observacao = $('#observacao').val().trim();
        }

        var dados = {
            titulo:     titulo,
            descricao:  $('#descricao').val().trim(),
            prioridade: $('#prioridade').val(),
            dataLimite: $('#dataLimite').val(),
            status:     $('#status').val(),
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
        var statusFiltro     = $('#filtro-status').val();
        var prioridadeFiltro = $('#filtro-prioridade').val();

        var resultado = filtrarTarefas(statusFiltro, prioridadeFiltro);

        $('#tabela-tarefas tbody').empty();

        if (resultado.length === 0) {
            $('#tabela-tarefas tbody').html(
                '<tr><td colspan="7" class="sem-resultados">Nenhuma tarefa encontrada com esses filtros.</td></tr>'
            );
        } else {
            $.each(resultado, function (i, tarefa) {
                adicionarLinhaTabela(tarefa);
            });
        }
    });

    $('#titulo').on('keyup', function () {
        if ($(this).val().trim() !== '') {
            $('#erro-titulo').text('').removeClass('visivel');
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
    var badgePrio = prioridadeBadge[tarefa.prioridade];
    if (!badgePrio) {
        badgePrio = 'badge-prio-baixa';
    }

    var labelPrio = prioridadeLabel[tarefa.prioridade];
    if (!labelPrio) {
        labelPrio = tarefa.prioridade;
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

    var tituloEsc = $('<span>').text(tarefa.titulo).prop('outerHTML');
    var descEsc   = $('<span>').text(tarefa.descricao || '-').prop('outerHTML');
    var obsEsc    = $('<span>').text(tarefa.observacao || '-').prop('outerHTML');

    return '<tr data-id="' + tarefa.id + '">' +
        '<td>' + tituloEsc + '</td>' +
        '<td>' + descEsc + '</td>' +
        '<td><span class="' + badgePrio + '">' + labelPrio + '</span></td>' +
        '<td>' + dataFormatada + '</td>' +
        '<td><span class="' + badgeStatus + '">' + tarefa.status + '</span></td>' +
        '<td>' + obsEsc + '</td>' +
        '<td>' +
            '<button class="btn btn-warning btn-sm btn-editar" data-id="' + tarefa.id + '">Editar</button> ' +
            '<button class="btn btn-danger btn-sm btn-excluir" data-id="' + tarefa.id + '">Excluir</button>' +
        '</td>' +
    '</tr>';
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
            var novoCampo = $(
                '<div id="campo-observacao" class="mb-3">' +
                    '<label class="form-label">Observacao</label>' +
                    '<textarea id="observacao" class="form-control" rows="2"></textarea>' +
                '</div>'
            );
            $('#campo-observacao-container').append(novoCampo);
            $('#btn-observacao').text('- Observacao');
        }
        $('#observacao').val(tarefa.observacao);
    } else {
        $('#campo-observacao').remove();
        $('#btn-observacao').text('+ Observacao');
    }

    $('#titulo-form').text('Editando Tarefa');
    $('#btn-concluir').text('Atualizar').removeClass('btn-success').addClass('btn-primary');

    $('html, body').animate({ scrollTop: 0 }, 300);
}

function limparFormulario() {
    $('#form-tarefa')[0].reset();
    $('#campo-observacao').remove();
    $('#btn-observacao').text('+ Observacao');
    $('#erro-titulo').text('').removeClass('visivel');
    $('#titulo').removeClass('input-erro');
    $('#titulo-form').text('Nova Tarefa');
    $('#btn-concluir').text('Concluir').removeClass('btn-primary').addClass('btn-success');
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
