// ============================================================
// PARTE B - jQuery
// Responsavel por: manipulacao do DOM, eventos, interface visual
// Usa: append, html, remove, addClass, removeClass, toggleClass
// Eventos: submit, click, dblclick, change | Delegacao com on()
// ============================================================

var prioridadeLabel = { Baixa: 'Baixa', Media: 'Media', Alta: 'Alta' };
var prioridadeBadge = {
    Baixa: 'badge-prio-baixa',
    Media: 'badge-prio-media',
    Alta:  'badge-prio-alta'
};
var prioridadeIcone = {
    Baixa: 'bi-arrow-down-circle-fill text-success',
    Media: 'bi-dash-circle-fill text-warning',
    Alta:  'bi-arrow-up-circle-fill text-danger'
};

$(function () {

    // Carrega tarefas salvas (JS puro) e renderiza via jQuery
    carregarTarefas();
    atualizarContadorNav();
    if (tarefas.length > 0) {
        criarSecaoLista();
        $.each(tarefas, function (i, tarefa) {
            adicionarLinhaTabela(tarefa);
        });
    }

    // --- Botao "+ Observacao" - cria campo dinamicamente ---
    $('#btn-observacao').on('click', function () {
        if ($('#campo-observacao').length === 0) {
            var novoCampo = $(
                '<div id="campo-observacao">' +
                    '<label><i class="bi bi-chat-square-text me-1"></i>Observacao</label>' +
                    '<textarea id="observacao" class="form-control" rows="2" placeholder="Digite uma observacao..."></textarea>' +
                '</div>'
            );
            $('#campo-observacao-container').append(novoCampo);
            $(this)
                .html('<i class="bi bi-x-circle me-1"></i>- Observacao')
                .addClass('btn-obs-ativo');
        } else {
            $('#campo-observacao').remove();
            $(this)
                .html('<i class="bi bi-chat-left-text me-1"></i>+ Observacao')
                .removeClass('btn-obs-ativo');
        }
    });

    // --- Submit do formulario ---
    $('#form-tarefa').on('submit', function (e) {
        e.preventDefault();

        var titulo = $('#titulo').val().trim();

        // Validacao sem alert
        if (!titulo) {
            $('#erro-titulo').text('O titulo e obrigatorio!').addClass('visivel');
            $('#titulo').addClass('input-erro');
            return;
        }
        $('#erro-titulo').text('').removeClass('visivel');
        $('#titulo').removeClass('input-erro');

        var dados = {
            titulo:     titulo,
            descricao:  $('#descricao').val().trim(),
            prioridade: $('#prioridade').val(),
            dataLimite: $('#dataLimite').val(),
            status:     $('#status').val(),
            observacao: $('#observacao').length > 0 ? $('#observacao').val().trim() : ''
        };

        if (getEditandoId() !== null) {
            // Atualiza (JS puro) + atualiza linha (jQuery)
            var tarefaAtualizada = atualizarTarefa(getEditandoId(), dados);
            atualizarLinhaTabela(tarefaAtualizada);
            limparEditandoId();
        } else {
            // Adiciona (JS puro) + renderiza (jQuery)
            var novaTarefa = adicionarTarefa(dados);
            if ($('#tabela-tarefas').length === 0) {
                criarSecaoLista();
            }
            adicionarLinhaTabela(novaTarefa);
        }

        atualizarContadorNav();
        limparFormulario();
    });

    // --- Delegacao de eventos para elementos dinamicos ---

    // Excluir
    $(document).on('click', '.btn-excluir', function () {
        var id   = parseInt($(this).data('id'));
        var linha = $(this).closest('tr');

        linha.addClass('removendo');
        setTimeout(function () {
            linha.remove();
            excluirTarefa(id);
            atualizarContadorNav();
            if ($('#tabela-tarefas tbody tr').length === 0) {
                $('#secao-lista').empty();
            }
        }, 350);
    });

    // Editar - botao
    $(document).on('click', '.btn-editar', function () {
        var id = parseInt($(this).data('id'));
        carregarTarefaNoFormulario(id);
    });

    // Editar - duplo clique na linha
    $(document).on('dblclick', '#tabela-tarefas tbody tr', function () {
        var id = parseInt($(this).data('id'));
        carregarTarefaNoFormulario(id);
    });

    // Filtrar
    $(document).on('click', '#btn-filtrar', function () {
        var statusFiltro     = $('#filtro-status').val();
        var prioridadeFiltro = $('#filtro-prioridade').val();

        var resultado = filtrarTarefas(statusFiltro, prioridadeFiltro); // JS puro

        $('#tabela-tarefas tbody').empty();

        if (resultado.length === 0) {
            $('#tabela-tarefas tbody').html(
                '<tr><td colspan="7" class="sem-resultados">' +
                '<i class="bi bi-search me-2"></i>Nenhuma tarefa encontrada com esses filtros.' +
                '</td></tr>'
            );
        } else {
            $.each(resultado, function (i, tarefa) {
                adicionarLinhaTabela(tarefa);
            });
        }
    });

    // Change nos filtros - efeito visual
    $(document).on('change', '#filtro-status, #filtro-prioridade', function () {
        $('#tabela-tarefas').addClass('filtrando');
        setTimeout(function () {
            $('#tabela-tarefas').removeClass('filtrando');
        }, 400);
    });

    // Remove erro ao digitar
    $('#titulo').on('keyup', function () {
        if ($(this).val().trim() !== '') {
            $('#erro-titulo').text('').removeClass('visivel');
            $(this).removeClass('input-erro');
        }
    });

});

// --- Funcoes de interface (jQuery) ---

function criarSecaoLista() {
    var htmlCard =
        '<div class="card shadow-sm card-filtros mb-3">' +
            '<div class="card-header d-flex align-items-center gap-2">' +
                '<i class="bi bi-funnel-fill"></i> Filtros' +
            '</div>' +
            '<div class="card-body">' +
                '<div class="row g-2 align-items-end">' +
                    '<div class="col-sm-4">' +
                        '<label class="form-label fw-semibold" style="font-size:0.82rem">Status</label>' +
                        '<select id="filtro-status" class="form-select form-select-sm">' +
                            '<option value="">Todos os status</option>' +
                            '<option value="Pendente">Pendente</option>' +
                            '<option value="Concluida">Concluida</option>' +
                        '</select>' +
                    '</div>' +
                    '<div class="col-sm-4">' +
                        '<label class="form-label fw-semibold" style="font-size:0.82rem">Prioridade</label>' +
                        '<select id="filtro-prioridade" class="form-select form-select-sm">' +
                            '<option value="">Todas as prioridades</option>' +
                            '<option value="Baixa">Baixa</option>' +
                            '<option value="Media">Media</option>' +
                            '<option value="Alta">Alta</option>' +
                        '</select>' +
                    '</div>' +
                    '<div class="col-sm-4">' +
                        '<button id="btn-filtrar" class="btn btn-primary btn-sm w-100">' +
                            '<i class="bi bi-search me-1"></i>Filtrar' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="card shadow-sm">' +
            '<div class="tabela-wrapper">' +
                '<table id="tabela-tarefas" class="table table-hover mb-0">' +
                    '<thead>' +
                        '<tr>' +
                            '<th><i class="bi bi-tag me-1"></i>Titulo</th>' +
                            '<th><i class="bi bi-card-text me-1"></i>Descricao</th>' +
                            '<th><i class="bi bi-flag me-1"></i>Prioridade</th>' +
                            '<th><i class="bi bi-calendar me-1"></i>Data Limite</th>' +
                            '<th><i class="bi bi-circle-half me-1"></i>Status</th>' +
                            '<th><i class="bi bi-chat me-1"></i>Observacao</th>' +
                            '<th><i class="bi bi-gear me-1"></i>Acoes</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody></tbody>' +
                '</table>' +
            '</div>' +
        '</div>';

    $('#secao-lista').html(htmlCard);
}

function montarLinha(tarefa) {
    var badgePrio   = prioridadeBadge[tarefa.prioridade] || 'badge-prio-baixa';
    var icone       = prioridadeIcone[tarefa.prioridade] || '';
    var labelPrio   = prioridadeLabel[tarefa.prioridade]  || tarefa.prioridade;
    var badgeStatus = tarefa.status === 'Concluida' ? 'badge-concluida' : 'badge-pendente';
    var iconeStatus = tarefa.status === 'Concluida'
        ? '<i class="bi bi-check-circle-fill me-1"></i>'
        : '<i class="bi bi-clock me-1"></i>';

    var dataFormatada = tarefa.dataLimite
        ? tarefa.dataLimite.split('-').reverse().join('/')
        : '<span class="text-muted">-</span>';

    // Escapa conteudo do usuario com jQuery
    var tituloEsc = $('<span>').text(tarefa.titulo).prop('outerHTML');
    var descEsc   = $('<span>').text(tarefa.descricao || '-').prop('outerHTML');
    var obsEsc    = $('<span>').text(tarefa.observacao || '-').prop('outerHTML');

    return '<tr data-id="' + tarefa.id + '">' +
        '<td class="fw-semibold">' + tituloEsc + '</td>' +
        '<td class="text-muted">' + descEsc + '</td>' +
        '<td>' +
            '<span class="' + badgePrio + '">' +
                '<i class="bi ' + icone + ' me-1"></i>' + labelPrio +
            '</span>' +
        '</td>' +
        '<td>' + dataFormatada + '</td>' +
        '<td>' +
            '<span class="' + badgeStatus + '">' + iconeStatus + tarefa.status + '</span>' +
        '</td>' +
        '<td class="text-muted">' + obsEsc + '</td>' +
        '<td>' +
            '<div class="d-flex gap-1">' +
                '<button class="btn btn-editar btn-editar-row" data-id="' + tarefa.id + '">' +
                    '<i class="bi bi-pencil me-1"></i>Editar' +
                '</button>' +
                '<button class="btn btn-excluir btn-excluir-row" data-id="' + tarefa.id + '">' +
                    '<i class="bi bi-trash me-1"></i>Excluir' +
                '</button>' +
            '</div>' +
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
    var novaLinha   = $(montarLinha(tarefa));

    if (tarefa.status === 'Concluida') {
        novaLinha.addClass('linha-concluida');
    }

    linhaAntiga.replaceWith(novaLinha);
    novaLinha.addClass('linha-atualizada');
    setTimeout(function () {
        novaLinha.removeClass('linha-atualizada');
    }, 1300);
}

function carregarTarefaNoFormulario(id) {
    var tarefa = getTarefaById(id); // JS puro
    if (!tarefa) return;

    setEditandoId(id); // JS puro controla estado

    // jQuery popula o formulario
    $('#titulo').val(tarefa.titulo);
    $('#descricao').val(tarefa.descricao);
    $('#prioridade').val(tarefa.prioridade);
    $('#dataLimite').val(tarefa.dataLimite);
    $('#status').val(tarefa.status);

    if (tarefa.observacao) {
        if ($('#campo-observacao').length === 0) {
            var novoCampo = $(
                '<div id="campo-observacao">' +
                    '<label><i class="bi bi-chat-square-text me-1"></i>Observacao</label>' +
                    '<textarea id="observacao" class="form-control" rows="2"></textarea>' +
                '</div>'
            );
            $('#campo-observacao-container').append(novoCampo);
            $('#btn-observacao')
                .html('<i class="bi bi-x-circle me-1"></i>- Observacao')
                .addClass('btn-obs-ativo');
        }
        $('#observacao').val(tarefa.observacao);
    } else {
        $('#campo-observacao').remove();
        $('#btn-observacao')
            .html('<i class="bi bi-chat-left-text me-1"></i>+ Observacao')
            .removeClass('btn-obs-ativo');
    }

    // Atualiza cabecalho e botao
    $('#titulo-form')
        .html('<i class="bi bi-pencil-square me-2" style="color:#a5b4fc"></i>Editando Tarefa');
    $('#btn-concluir')
        .html('<i class="bi bi-arrow-repeat me-1"></i>Atualizar')
        .removeClass('btn-success').addClass('btn-primary');

    $('html, body').animate({ scrollTop: 0 }, 300);
}

function limparFormulario() {
    $('#form-tarefa')[0].reset();
    $('#campo-observacao').remove();
    $('#btn-observacao')
        .html('<i class="bi bi-chat-left-text me-1"></i>+ Observacao')
        .removeClass('btn-obs-ativo');
    $('#erro-titulo').text('').removeClass('visivel');
    $('#titulo').removeClass('input-erro');
    $('#titulo-form')
        .html('<i class="bi bi-pencil-square me-2" style="color:#a5b4fc"></i>Nova Tarefa');
    $('#btn-concluir')
        .html('<i class="bi bi-check-circle me-1"></i>Concluir')
        .removeClass('btn-primary').addClass('btn-success');
}

function atualizarContadorNav() {
    var total = tarefas.length;
    var texto = total === 0 ? '0 tarefas' : total + (total === 1 ? ' tarefa cadastrada' : ' tarefas cadastradas');
    $('#contador-nav').text(texto);
}
