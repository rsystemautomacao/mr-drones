// Função para aguardar Database estar pronto
async function waitForDatabase() {
    // Aguardar Database existir (caso o script ainda esteja carregando)
    let attempts = 0;
    while (!window.Database && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (!window.Database) {
        throw new Error('Database não foi carregado');
    }

    // Aguardar inicialização completa via Promise
    await window.Database.ready;

    console.log('Home: Database está pronto');
}

document.addEventListener('DOMContentLoaded', async () => {
    // Aguardar Database estar completamente inicializado
    await waitForDatabase();
    
    console.log('Home: Database pronto, iniciando carregamento...');

    // Usa formatarMoeda e formatarData do utils.js (carregado globalmente)

    async function carregarResumoFinanceiro() {
        try {
            const periodo = document.getElementById('periodo').value;
            const hoje = new Date();
            let dataInicio, dataFim;

            // Definir período de datas baseado na seleção
            switch (periodo) {
                case 'mes-atual':
                    dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                    dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
                    break;
                case '30':
                    dataInicio = new Date(hoje);
                    dataInicio.setDate(hoje.getDate() - 30);
                    dataFim = new Date(hoje);
                    break;
                case '60':
                    dataInicio = new Date(hoje);
                    dataInicio.setDate(hoje.getDate() - 60);
                    dataFim = new Date(hoje);
                    break;
                case '90':
                    dataInicio = new Date(hoje);
                    dataInicio.setDate(hoje.getDate() - 90);
                    dataFim = new Date(hoje);
                    break;
                case '365':
                    dataInicio = new Date(hoje);
                    dataInicio.setDate(hoje.getDate() - 365);
                    dataFim = new Date(hoje);
                    break;
                case 'proximo-mes':
                    dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
                    dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 0);
                    break;
                case 'futuros':
                    dataInicio = new Date(hoje);
                    dataFim = new Date(2099, 11, 31);
                    break;
                case 'todos':
                    dataInicio = new Date(2000, 0, 1);
                    dataFim = new Date(2099, 11, 31);
                    break;
            }

            // Formatar datas para string (YYYY-MM-DD)
            const dataInicioStr = dataInicio.toISOString().split('T')[0];
            const dataFimStr = dataFim.toISOString().split('T')[0];

            // Carregar saldo atual via adapter
            const saldoAtual = await window.Database.getSaldoFinanceiro();

            // Buscar entradas do período via adapter
            const entradas = await window.Database.getMovimentacoesPorPeriodo('entrada', dataInicioStr, dataFimStr);

            let totalEntradas = 0;
            let numServicos = 0;
            entradas.forEach(entrada => {
                totalEntradas += parseFloat(entrada.valor) || 0;
                if (entrada.categoria === 'servico') numServicos++;
            });

            // Buscar saídas do período via adapter
            const saidas = await window.Database.getMovimentacoesPorPeriodo('saida', dataInicioStr, dataFimStr);

            let totalSaidas = 0;
            let numDespesas = 0;
            saidas.forEach(saida => {
                totalSaidas += parseFloat(saida.valor) || 0;
                numDespesas++;
            });

            // Buscar valores previstos (pagamentos pendentes de serviços)
            const { totalPrevistos, numPendentes } = await calcularValoresPrevistos();

            // Atualizar interface
            document.getElementById('saldo-caixa').textContent = formatarMoeda(saldoAtual);
            document.getElementById('total-entradas').textContent = formatarMoeda(totalEntradas);
            document.getElementById('total-saidas').textContent = formatarMoeda(totalSaidas);
            document.getElementById('total-previstos').textContent = formatarMoeda(totalPrevistos);
            
            document.getElementById('qtd-servicos').textContent = numServicos;
            document.getElementById('qtd-saidas').textContent = numDespesas;
            document.getElementById('qtd-previstos').textContent = numPendentes;

        } catch (error) {
            console.error('Erro ao carregar resumo:', error);
            showToast('Erro ao carregar resumo financeiro', 'error');
        }
    }

    async function carregarProximosServicos() {
        try {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const dataHoje = hoje.toISOString().split('T')[0];

            const servicos = await window.Database.getServicosPorStatusEData('pendente', dataHoje, 'data', 'asc');

            const container = document.getElementById('proximos-servicos');

            if (servicos.length === 0) {
                container.innerHTML = '<p class="texto-info">Nenhum serviço previsto</p>';
                return;
            }

            container.innerHTML = '';
            servicos.forEach(servico => {
                const div = document.createElement('div');
                div.className = 'servico-item card expansivel';
                div.innerHTML = `
                    <div class="card-header" onclick="toggleExpansivel(this)">
                        <div class="header-content">
                            <h3>${escapeHtml(servico.tipo)} - ${escapeHtml(servico.clienteNome)}</h3>
                            <span>R$ ${formatarMoeda(servico.valor)}</span>
                        </div>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="card-content" style="display: none;">
                        <div class="servico-info">
                            <p><i class="fas fa-calendar"></i> Data Prevista: ${formatarData(servico.data)}</p>
                            <p><i class="fas fa-ruler"></i> Área: ${escapeHtml(servico.tamanhoArea)} hectares</p>
                            <p><i class="fas fa-money-bill-wave"></i> Valor: R$ ${formatarMoeda(servico.valor)}</p>
                            <p><i class="fas fa-credit-card"></i> Forma de Pagamento: ${escapeHtml(servico.formaPagamento)}</p>
                        </div>
                    </div>
                `;
                container.appendChild(div);
            });
        } catch (error) {
            console.error('Erro ao carregar próximos serviços:', error);
            const container = document.getElementById('proximos-servicos');
            container.innerHTML = '<p class="texto-erro">Erro ao carregar serviços</p>';
        }
    }

    // Buscar valores previstos (pagamentos pendentes de serviços)
    async function calcularValoresPrevistos() {
        try {
            let totalPrevistos = 0;
            let numPendentes = 0;
            const hoje = new Date().toISOString().split('T')[0];

            // Buscar serviços pendentes via adapter
            const servicosPendentes = await window.Database.getServicosPorStatusEData('pendente', hoje);

            servicosPendentes.forEach(servico => {
                totalPrevistos += parseFloat(servico.valor) || 0;
                numPendentes++;
            });

            // Buscar serviços realizados com pagamento pendente via adapter
            const servicosRealizados = await window.Database.getServicosPorStatus('realizado');

            servicosRealizados.forEach(servico => {
                if (servico.pagamento) {
                    const { status, valorTotal, valorPago = 0 } = servico.pagamento;
                    if (status === 'pendente' || status === 'parcial') {
                        const valorPendente = parseFloat(valorTotal) - parseFloat(valorPago);
                        if (valorPendente > 0) {
                            totalPrevistos += valorPendente;
                            numPendentes++;
                        }
                    }
                } else {
                    // Se não tem informação de pagamento, considera o valor total como pendente
                    totalPrevistos += parseFloat(servico.valor) || 0;
                    numPendentes++;
                }
            });

            return { totalPrevistos, numPendentes };
        } catch (error) {
            console.error('Erro ao calcular valores previstos:', error);
            throw error;
        }
    }

    // Expor funções globalmente
    window.carregarResumoFinanceiro = carregarResumoFinanceiro;
    window.carregarProximosServicos = carregarProximosServicos;

    // Carregar dados iniciais
    await carregarResumoFinanceiro();
    await carregarProximosServicos();
}); 