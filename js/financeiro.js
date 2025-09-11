document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore();
    const modal = document.getElementById('modal-movimentacao');
    const form = document.getElementById('form-movimentacao');
    let movimentacaoEmEdicao = null;

    // Categorias por tipo
    const CATEGORIAS = {
        entrada: [
            'Serviço',
            'Aporte',
            'Investimento',
            'Empréstimo',
            'Outros'
        ],
        saida: [
            'Combustível',
            'Manutenção',
            'Equipamento',
            'Salário',
            'Adiantamento',
            'Outros'
        ]
    };

    // Funções utilitárias
    function formatarData(data) {
        if (!data) return 'Não definida';
        if (typeof data === 'object' && data.toDate) {
            data = data.toDate();
        }
        if (typeof data === 'string') {
            data = new Date(data);
        }
        return data.toLocaleDateString('pt-BR');
    }

    // Função para formatar valores monetários
    function formatarMoeda(valor) {
        if (!valor) return '0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor);
    }

    // Event Listeners
    document.getElementById('tipo').addEventListener('change', function() {
        const tipo = this.value;
        const retiradaCaixaDiv = document.querySelector('.retirada-caixa-group');
        
        if (retiradaCaixaDiv) {
            retiradaCaixaDiv.style.display = tipo === 'saida' ? 'block' : 'none';
            if (tipo !== 'saida') {
                document.getElementById('isRetiradaCaixa').checked = false;
            }
        }
        
        atualizarCategorias();
    });

    // Funções
    function atualizarCategorias() {
        const tipo = document.getElementById('tipo').value;
        const categoriaSelect = document.getElementById('categoria');
        categoriaSelect.innerHTML = '';
        
        CATEGORIAS[tipo].forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.toLowerCase();
            option.textContent = categoria;
            categoriaSelect.appendChild(option);
        });
    }

    window.abrirModalMovimentacao = () => {
        movimentacaoEmEdicao = null;
        form.reset();
        const hoje = new Date().toISOString().split('T')[0];
        form.data.value = hoje;
        atualizarCategorias();
        modal.style.display = 'block';
    };

    window.fecharModal = () => {
        modal.style.display = 'none';
        form.reset();
    };

    window.handleFormaPagamentoChange = () => {
        const formaPagamento = form.formaPagamento.value;
        const isParceladoCheck = document.getElementById('isParcelado');
        
        if (formaPagamento === 'cartao') {
            isParceladoCheck.disabled = false;
        } else {
            isParceladoCheck.disabled = true;
            isParceladoCheck.checked = false;
            document.getElementById('parcelamentoDetails').style.display = 'none';
        }
    };

    window.handleParcelamentoChange = () => {
        const isParcelado = document.getElementById('isParcelado').checked;
        document.getElementById('parcelamentoDetails').style.display = isParcelado ? 'block' : 'none';
    };

    // Carregar movimentações
    async function carregarMovimentacoes() {
        try {
            const periodo = document.getElementById('periodo').value;
            const tipoFiltro = document.getElementById('tipo-filtro').value;
            const hoje = new Date();
            hoje.setHours(23, 59, 59, 999);
            
            let query = db.collection('movimentacoes');
            const isFuturo = periodo === 'futuros';

            if (isFuturo) {
                // Para lançamentos futuros, pega a partir de hoje
                query = query.where('data', '>=', hoje.toISOString().split('T')[0]);
            } else {
                // Para períodos normais
                const dataLimite = new Date();
                dataLimite.setDate(dataLimite.getDate() - parseInt(periodo));
                dataLimite.setHours(0, 0, 0, 0);

                query = query.where('data', '>=', dataLimite.toISOString().split('T')[0])
                            .where('data', '<=', hoje.toISOString().split('T')[0]);
            }

            // Aplicar ordenação
            query = query.orderBy('data', isFuturo ? 'asc' : 'desc');

            // Aplicar filtro de tipo se necessário
            if (tipoFiltro !== 'todos') {
                query = query.where('tipo', '==', tipoFiltro);
            }

            const snapshot = await query.get();
            atualizarListaMovimentacoes(snapshot);
            await atualizarSaldo();

        } catch (error) {
            console.error('Erro ao carregar movimentações:', error);
            alert('Erro ao carregar movimentações: ' + error.message);
        }
    }

    async function atualizarSaldo() {
        try {
            const hoje = new Date();
            hoje.setHours(23, 59, 59, 999);

            // Buscar todas as movimentações
            const snapshot = await db.collection('movimentacoes')
                .where('data', '<=', hoje.toISOString().split('T')[0])
                .orderBy('data')
                .get();

            let saldo = 0;

            snapshot.forEach(doc => {
                const mov = doc.data();
                // Só considera movimentações pagas ou entradas
                if (mov.tipo === 'entrada' || mov.status === 'pago') {
                    const valor = parseFloat(mov.valor) || 0;
                    if (mov.tipo === 'entrada') {
                        saldo += valor;
                    } else {
                        saldo -= valor;
                    }
                }
            });

            // Atualizar o documento de saldo
            await db.collection('financeiro').doc('saldo').set({
                valor: saldo,
                ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Atualizar a exibição do saldo na página
            const saldoElement = document.getElementById('saldo-atual');
            if (saldoElement) {
                saldoElement.textContent = formatarMoeda(saldo);
            }

            return saldo;
        } catch (error) {
            console.error('Erro ao atualizar saldo:', error);
            throw error;
        }
    }

    function atualizarListaMovimentacoes(snapshot) {
        const container = document.getElementById('lista-movimentacoes');
        container.innerHTML = '';

        snapshot.forEach(doc => {
            const mov = doc.data();
            const element = document.createElement('div');
            element.className = `movimentacao-item ${mov.tipo}`;
            
            const valor = mov.tipo === 'entrada' ? mov.valor : -mov.valor;
            const corValor = mov.tipo === 'entrada' ? '#4CAF50' : '#f44336';
            
            // Capitalizar primeira letra da categoria
            const categoria = mov.categoria.charAt(0).toUpperCase() + mov.categoria.slice(1);
            
            // Adicionar informação de valor total se for parcelado
            const valorInfo = mov.parcelado 
                ? `R$ ${formatarMoeda(Math.abs(valor))} (Total: R$ ${formatarMoeda(mov.valorTotal || (mov.valor * mov.totalParcelas))})`
                : `R$ ${formatarMoeda(Math.abs(valor))}`;

            // Adicionar botões de ação específicos para parcelas
            const botoesAcao = `
                <div class="acoes-item">
                    ${mov.parcelado && mov.numParcela ? `
                        <button onclick="editarTodasParcelas('${doc.id}', ${mov.numParcela}, ${mov.totalParcelas})" class="btn-editar-todas" title="Editar Todas as Parcelas">
                            <i class="fas fa-edit"></i> Editar Todas (${mov.numParcela}/${mov.totalParcelas})
                        </button>
                    ` : ''}
                    <button onclick="editarMovimentacao('${doc.id}')" class="btn-editar" title="Editar Esta Parcela">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="excluirMovimentacao('${doc.id}')" class="btn-excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${mov.tipo === 'saida' ? 
                        mov.status === 'pago' ?
                            `<button onclick="reverterPagamento('${doc.id}')" class="btn-reverter-pagamento" title="Reverter Pagamento">
                                <i class="fas fa-undo"></i>
                            </button>` :
                            `<button onclick="confirmarPagamentoConta('${doc.id}')" class="btn-confirmar-pagamento" title="Confirmar Pagamento">
                                <i class="fas fa-check-circle"></i>
                            </button>`
                        : ''}
                </div>
            `;

            element.innerHTML = `
                <div class="card-header" onclick="toggleExpansivel(this)">
                    <div class="header-content">
                        <h3>${categoria} - ${mov.descricao}</h3>
                        <span style="color: ${corValor}">${valorInfo}</span>
                    </div>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="card-content" style="display: none;">
                    <div class="movimentacao-info">
                        <p><i class="fas fa-calendar"></i> ${formatarData(mov.data)}</p>
                        <p><i class="fas fa-credit-card"></i> ${mov.formaPagamento}</p>
                        ${mov.numParcela ? `
                            <p><i class="fas fa-clock"></i> Parcela ${mov.numParcela}/${mov.totalParcelas}</p>
                        ` : ''}
                        ${mov.tipo === 'saida' ? `
                            <p><i class="fas fa-cash-register"></i> ${mov.retiradaCaixa ? 'Retirado do Caixa' : 'Conta a Pagar'}</p>
                        ` : ''}
                    </div>
                    ${botoesAcao}
                </div>
            `;

            container.appendChild(element);
        });
    }

    // Função para adicionar nova movimentação
    async function salvarMovimentacao(movimentacao) {
        try {
            if (movimentacao.parcelado) {
                const numParcelas = parseInt(movimentacao.totalParcelas);
                const valorTotal = parseFloat(movimentacao.valor);
                const valorParcela = valorTotal / numParcelas;
                
                // Criar uma movimentação para cada parcela
                for (let i = 1; i <= numParcelas; i++) {
                    const dataParcela = new Date(movimentacao.data);
                    dataParcela.setMonth(dataParcela.getMonth() + (i - 1));
                    
                    await db.collection('movimentacoes').add({
                        ...movimentacao,
                        valor: valorParcela,
                        valorTotal: valorTotal, // Guardar o valor total para referência
                        numParcela: i,
                        totalParcelas: numParcelas,
                        data: dataParcela.toISOString().split('T')[0]
                    });
                }
            } else {
                // Se não for parcelado, salva normalmente
                await db.collection('movimentacoes').add(movimentacao);
            }

            await atualizarSaldo();
        } catch (error) {
            console.error('Erro ao salvar movimentação:', error);
            throw error;
        }
    }

    // Salvar movimentação
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const movimentacao = {
                tipo: form.tipo.value,
                categoria: form.categoria.value,
                descricao: form.descricao.value,
                valor: parseFloat(form.valor.value),
                data: form.data.value,
                formaPagamento: form.formaPagamento.value,
                parcelado: form.isParcelado.checked,
                retiradaCaixa: form.isRetiradaCaixa?.checked || false,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (movimentacao.parcelado) {
                const numParcelas = parseInt(form.numParcelas.value);
                const valorParcela = movimentacao.valor / numParcelas;

                for (let i = 1; i <= numParcelas; i++) {
                    const dataParcela = new Date(movimentacao.data);
                    dataParcela.setMonth(dataParcela.getMonth() + i - 1);
                    
                    await db.collection('movimentacoes').add({
                        ...movimentacao,
                        valor: valorParcela,
                        numParcela: i,
                        totalParcelas: numParcelas,
                        data: dataParcela.toISOString().split('T')[0]
                    });
                }
            } else {
                if (movimentacaoEmEdicao) {
                    await db.collection('movimentacoes').doc(movimentacaoEmEdicao).update(movimentacao);
                } else {
                    await db.collection('movimentacoes').add(movimentacao);
                }
            }

            // Atualizar saldo em caixa
            if (movimentacao.categoria.toLowerCase() === 'aporte') {
                await atualizarSaldoGeral(movimentacao.valor);
            } else if (movimentacao.tipo === 'saida' && movimentacao.retiradaCaixa) {
                await atualizarSaldoGeral(-movimentacao.valor);
            }

            fecharModal();
            await carregarMovimentacoes();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar: ' + error.message);
        }
    });

    // Funções de edição e exclusão
    window.editarMovimentacao = async (id) => {
        try {
            const doc = await db.collection('movimentacoes').doc(id).get();
            if (!doc.exists) {
                alert('Movimentação não encontrada');
                return;
            }

            const mov = doc.data();
            
            // Se for uma movimentação parcelada, perguntar se quer editar todas as parcelas
            if (mov.parcelado && mov.idParcelamento) {
                const editarTodas = confirm('Esta é uma movimentação parcelada. Deseja editar todas as parcelas?');
                
                if (editarTodas) {
                    // Abrir modal de edição em massa
                    await editarTodasParcelas(mov.idParcelamento, mov.numParcela, mov.totalParcelas);
                    return;
                }
            }

            // Continua com a edição normal de uma única movimentação
            movimentacaoEmEdicao = id;
            const form = document.getElementById('form-movimentacao');
            form.tipo.value = mov.tipo || '';
            await atualizarCategorias(); // Aguardar atualização das categorias
            form.categoria.value = mov.categoria || '';
            form.descricao.value = mov.descricao || '';
            form.valor.value = mov.valor || '';
            form.data.value = mov.data || '';
            form.formaPagamento.value = mov.formaPagamento || '';
            
            // Atualizar checkbox de parcelamento
            const isParceladoCheck = document.getElementById('isParcelado');
            if (isParceladoCheck) {
                isParceladoCheck.checked = mov.parcelado || false;
                handleParcelamentoChange();
            }
            
            // Atualizar checkbox de retirada do caixa
            const isRetiradaCaixaCheck = document.getElementById('isRetiradaCaixa');
            if (isRetiradaCaixaCheck) {
                isRetiradaCaixaCheck.checked = mov.retiradaCaixa || false;
            }

            // Mostrar/esconder grupo de retirada do caixa
            const retiradaCaixaDiv = document.querySelector('.retirada-caixa-group');
            if (retiradaCaixaDiv) {
                retiradaCaixaDiv.style.display = mov.tipo === 'saida' ? 'block' : 'none';
            }
            
            // Exibir o modal
            const modal = document.getElementById('modal-movimentacao');
            if (modal) {
                modal.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro ao editar:', error);
            alert('Erro ao editar: ' + error.message);
        }
    };

    // Adicionar função para edição em massa
    window.editarTodasParcelas = async (docId, numParcela, totalParcelas) => {
        try {
            console.log('Iniciando edição de parcelas:', { docId, numParcela, totalParcelas });

            if (!docId) {
                throw new Error('ID do documento não fornecido');
            }

            // Buscar o documento atual para obter informações do parcelamento
            const docRef = await db.collection('movimentacoes').doc(docId).get();
            if (!docRef.exists) {
                throw new Error('Documento não encontrado');
            }

            const movAtual = docRef.data();
            
            // Buscar todas as parcelas relacionadas
            let snapshot = await db.collection('movimentacoes')
                .where('tipo', '==', movAtual.tipo)
                .where('descricao', '==', movAtual.descricao)
                .where('totalParcelas', '==', totalParcelas)
                .get();

            if (snapshot.empty) {
                throw new Error('Nenhuma parcela encontrada');
            }

            // Filtrar apenas as parcelas do mesmo grupo
            const parcelas = snapshot.docs
                .map(doc => ({...doc.data(), id: doc.id}))
                .filter(mov => mov.totalParcelas === totalParcelas)
                .sort((a, b) => a.numParcela - b.numParcela);

            console.log('Parcelas encontradas:', parcelas.length);

            // Criar o modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';

            modal.innerHTML = `
                <div class="modal-content modal-large">
                    <h2>Editar Todas as Parcelas</h2>
                    <form id="form-edicao-massa">
                        <div class="form-group">
                            <label for="descricaoMassa">Descrição</label>
                            <input type="text" id="descricaoMassa" value="${movAtual.descricao || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="valorMassa">Valor por Parcela</label>
                            <input type="number" id="valorMassa" step="0.01" value="${movAtual.valor || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="formaPagamentoMassa">Forma de Pagamento</label>
                            <select id="formaPagamentoMassa">
                                <option value="dinheiro" ${movAtual.formaPagamento === 'dinheiro' ? 'selected' : ''}>Dinheiro</option>
                                <option value="pix" ${movAtual.formaPagamento === 'pix' ? 'selected' : ''}>PIX</option>
                                <option value="cartao" ${movAtual.formaPagamento === 'cartao' ? 'selected' : ''}>Cartão</option>
                                <option value="transferencia" ${movAtual.formaPagamento === 'transferencia' ? 'selected' : ''}>Transferência</option>
                            </select>
                        </div>
                        <div class="parcelas-lista">
                            <h3>Parcelas</h3>
                            <div class="parcelas-grid">
                                ${parcelas.map(parcela => `
                                    <div class="parcela-item">
                                        <span>Parcela ${parcela.numParcela}/${parcela.totalParcelas}</span>
                                        <input type="date" value="${parcela.data}" 
                                            data-id="${parcela.id}" 
                                            ${parcela.status === 'pago' ? 'disabled' : ''}>
                                        ${parcela.status === 'pago' ? '<span class="badge-pago">Pago</span>' : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="form-buttons">
                            <button type="submit" class="btn-primary">Salvar Alterações</button>
                            <button type="button" onclick="this.closest('.modal').remove()" class="btn-secondary">Cancelar</button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);

            // Adicionar evento de submit ao formulário
            const form = modal.querySelector('#form-edicao-massa');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                if (!confirm('Confirma a alteração em todas as parcelas não pagas?')) {
                    return;
                }

                try {
                    const descricao = document.getElementById('descricaoMassa').value;
                    const valor = parseFloat(document.getElementById('valorMassa').value);
                    const formaPagamento = document.getElementById('formaPagamentoMassa').value;
                    const valorTotal = valor * totalParcelas;

                    const batch = db.batch();
                    
                    parcelas.forEach(parcela => {
                        if (parcela.status !== 'pago') {
                            const parcelaRef = db.collection('movimentacoes').doc(parcela.id);
                            const novaData = modal.querySelector(`input[data-id="${parcela.id}"]`).value;
                            
                            batch.update(parcelaRef, {
                                descricao,
                                valor,
                                formaPagamento,
                                data: novaData,
                                valorTotal
                            });
                        }
                    });

                    await batch.commit();
                    modal.remove();
                    await carregarMovimentacoes();
                    alert('Parcelas atualizadas com sucesso!');

                } catch (error) {
                    console.error('Erro ao atualizar parcelas:', error);
                    alert('Erro ao atualizar parcelas: ' + error.message);
                }
            });

        } catch (error) {
            console.error('Erro ao editar parcelas:', error);
            alert('Erro ao editar parcelas: ' + error.message);
        }
    };

    window.excluirMovimentacao = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta movimentação?')) return;
        
        try {
            await db.collection('movimentacoes').doc(id).delete();
            // Recalcular saldo após excluir movimentação
            await atualizarSaldo();
            await carregarMovimentacoes();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir: ' + error.message);
        }
    };

    // Função para atualizar o saldo geral (incluindo na home)
    async function atualizarSaldoGeral(valorAporte) {
        try {
            // Atualizar o documento de saldo
            const saldoRef = db.collection('financeiro').doc('saldo');
            const saldoDoc = await saldoRef.get();
            
            let saldoAtual = 0;
            if (saldoDoc.exists) {
                saldoAtual = saldoDoc.data().valor || 0;
            }

            const novoSaldo = saldoAtual + valorAporte;
            await saldoRef.set({ valor: novoSaldo });

            // Atualizar a exibição do saldo na página atual
            document.getElementById('saldo-atual').textContent = novoSaldo.toFixed(2);

            console.log('Saldo atualizado com sucesso após aporte');
        } catch (error) {
            console.error('Erro ao atualizar saldo geral:', error);
            alert('Erro ao atualizar saldo: ' + error.message);
        }
    }

    // Atualizar a função de zerar saldo
    window.zerarSaldo = async function() {
        try {
            // Criar um modal personalizado para a senha
            const senhaModal = document.createElement('div');
            senhaModal.className = 'modal';
            senhaModal.style.display = 'block';
            senhaModal.innerHTML = `
                <div class="modal-content" style="max-width: 300px;">
                    <h2>Senha Administrativa</h2>
                    <div class="form-group">
                        <label for="senhaAdmin">Digite a senha:</label>
                        <input type="password" id="senhaAdmin" maxlength="4" pattern="[0-9]*" inputmode="numeric">
                    </div>
                    <div class="form-buttons">
                        <button onclick="confirmarSenha()" class="btn-primary">Confirmar</button>
                        <button onclick="fecharModalSenha()" class="btn-secondary">Cancelar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(senhaModal);

            // Adicionar função para confirmar senha
            window.confirmarSenha = async () => {
                const senha = document.getElementById('senhaAdmin').value;
                if (senha === '0085') {
                    if (confirm('Tem certeza que deseja zerar o saldo? Esta ação não pode ser desfeita.')) {
                        await db.collection('financeiro').doc('saldo').set({ valor: 0 });
                        document.getElementById('saldo-atual').textContent = '0.00';
                        await carregarMovimentacoes();
                        alert('Saldo zerado com sucesso!');
                        fecharModalSenha();
                    }
                } else {
                    alert('Senha incorreta!');
                }
            };

            // Adicionar função para fechar modal
            window.fecharModalSenha = () => {
                document.body.removeChild(senhaModal);
                delete window.confirmarSenha;
                delete window.fecharModalSenha;
            };

            // Adicionar evento de tecla Enter
            document.getElementById('senhaAdmin').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    confirmarSenha();
                }
            });

        } catch (error) {
            console.error('Erro ao zerar saldo:', error);
            alert('Erro ao zerar saldo: ' + error.message);
        }
    };

    // Atualizar a função que adiciona o botão
    window.adicionarBotaoZerar = () => {
        const main = document.querySelector('main');
        if (main) {
            const adminSection = document.createElement('div');
            adminSection.className = 'card admin-section';
            adminSection.style.marginTop = '20px';
            adminSection.innerHTML = `
                <div style="text-align: right;">
                    <button onclick="zerarSaldo()" class="btn-secondary" style="font-size: 0.9em;">
                        <i class="fas fa-sync"></i> Resetar Saldo do Sistema
                    </button>
                </div>
            `;
            main.appendChild(adminSection);
        }
    };

    // Adicionar botão para recalcular saldo
    window.recalcularSaldo = async function() {
        try {
            if (confirm('Deseja recalcular o saldo com base em todas as movimentações?')) {
                await atualizarSaldo();
                alert('Saldo recalculado com sucesso!');
                await carregarMovimentacoes();
            }
        } catch (error) {
            console.error('Erro ao recalcular saldo:', error);
            alert('Erro ao recalcular saldo: ' + error.message);
        }
    }

    // Adicionar botão na interface
    function adicionarBotaoRecalcular() {
        const adminSection = document.querySelector('.admin-section');
        if (adminSection) {
            const btnRecalcular = document.createElement('button');
            btnRecalcular.className = 'btn-secondary';
            btnRecalcular.style.marginRight = '10px';
            btnRecalcular.innerHTML = '<i class="fas fa-calculator"></i> Recalcular Saldo';
            btnRecalcular.onclick = recalcularSaldo;
            
            adminSection.querySelector('div').prepend(btnRecalcular);
        }
    }

    // Inicialização
    window.carregarMovimentacoes = carregarMovimentacoes;
    atualizarCategorias();
    carregarMovimentacoes();

    // Adicionar botão de zerar no final da inicialização
    adicionarBotaoZerar();
    adicionarBotaoRecalcular();

    // Adicionar função para verificar contas próximas ao vencimento
    async function verificarContasProximasVencimento() {
        try {
            const hoje = new Date();
            const doisDiasDepois = new Date();
            doisDiasDepois.setDate(hoje.getDate() + 2);

            // Primeiro, buscar todas as saídas no período
            const query = db.collection('movimentacoes')
                .where('tipo', '==', 'saida')
                .where('data', '>=', hoje.toISOString().split('T')[0])
                .where('data', '<=', doisDiasDepois.toISOString().split('T')[0])
                .orderBy('data');

            const snapshot = await query.get();
            
            if (!snapshot.empty) {
                const contasProximas = [];
                snapshot.forEach(doc => {
                    const conta = doc.data();
                    // Filtrar apenas as não pagas
                    if (conta.status !== 'pago') {
                        contasProximas.push({
                            descricao: conta.descricao,
                            valor: conta.valor,
                            data: conta.data
                        });
                    }
                });

                if (contasProximas.length > 0) {
                    mostrarAlertaContas(contasProximas);
                }
            }
        } catch (error) {
            console.error('Erro ao verificar contas:', error);
        }
    }

    // Função para mostrar alerta de contas
    function mostrarAlertaContas(contas) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        let contasHTML = contas.map(conta => `
            <div class="conta-alerta">
                <p><strong>${conta.descricao}</strong></p>
                <p>Valor: R$ ${formatarMoeda(conta.valor)}</p>
                <p>Vencimento: ${formatarData(conta.data)}</p>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <h2>Contas Próximas ao Vencimento</h2>
                <div class="contas-lista">
                    ${contasHTML}
                </div>
                <div class="form-buttons">
                    <button onclick="document.body.removeChild(this.closest('.modal'))" class="btn-primary">
                        Entendi
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Adicionar função para confirmar pagamento de conta
    window.confirmarPagamentoConta = async (id) => {
        try {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';
            
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <h2>Confirmar Pagamento</h2>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="debitarSaldo" checked>
                            <span class="checkbox-text">Debitar do saldo atual?</span>
                        </label>
                    </div>
                    <div class="form-buttons">
                        <button onclick="finalizarPagamentoConta('${id}')" class="btn-primary">Confirmar</button>
                        <button onclick="this.closest('.modal').remove()" class="btn-secondary">Cancelar</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        } catch (error) {
            console.error('Erro ao abrir confirmação:', error);
            alert('Erro ao abrir confirmação: ' + error.message);
        }
    };

    // Adicionar função para finalizar pagamento de conta
    window.finalizarPagamentoConta = async (id) => {
        try {
            const debitarSaldoCheck = document.getElementById('debitarSaldo');
            if (!debitarSaldoCheck) {
                throw new Error('Elemento de confirmação não encontrado');
            }

            const debitarSaldo = debitarSaldoCheck.checked;
            const movRef = db.collection('movimentacoes').doc(id);
            const movDoc = await movRef.get();
            const movData = movDoc.data();

            if (!movDoc.exists) {
                throw new Error('Movimentação não encontrada');
            }

            await db.runTransaction(async (transaction) => {
                if (debitarSaldo) {
                    const saldoRef = db.collection('financeiro').doc('saldo');
                    const saldoDoc = await transaction.get(saldoRef);
                    const saldoAtual = saldoDoc.exists ? saldoDoc.data().valor || 0 : 0;
                    
                    await transaction.set(saldoRef, {
                        valor: saldoAtual - Number(movData.valor),
                        ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }

                await transaction.update(movRef, {
                    status: 'pago',
                    dataPagamento: new Date().toISOString().split('T')[0],
                    debitadoDoSaldo: debitarSaldo
                });
            });

            // Fechar o modal
            const modalElement = document.querySelector('.modal');
            if (modalElement) {
                modalElement.remove();
            }

            // Atualizar a interface
            await carregarMovimentacoes();
            await atualizarSaldo();

            // Mostrar confirmação
            alert('Pagamento registrado com sucesso!');

        } catch (error) {
            console.error('Erro ao finalizar pagamento:', error);
            alert('Erro ao finalizar pagamento: ' + error.message);
        }
    };

    // Adicionar função para reverter pagamento
    window.reverterPagamento = async (id) => {
        try {
            if (!confirm('Deseja reverter o status de pagamento desta conta?')) {
                return;
            }

            const movRef = db.collection('movimentacoes').doc(id);
            const movDoc = await movRef.get();
            const movData = movDoc.data();

            // Se o valor foi debitado do saldo, perguntar se deve restaurar
            if (movData.debitadoDoSaldo) {
                const deveRestaurarSaldo = confirm('O valor foi debitado do saldo. Deseja restaurar o valor ao saldo?');

                if (deveRestaurarSaldo) {
                    await db.runTransaction(async (transaction) => {
                        const saldoRef = db.collection('financeiro').doc('saldo');
                        const saldoDoc = await transaction.get(saldoRef);
                        const saldoAtual = saldoDoc.data()?.valor || 0;
                        
                        // Restaurar o valor ao saldo
                        transaction.update(saldoRef, {
                            valor: saldoAtual + movData.valor
                        });

                        // Atualizar status da movimentação
                        transaction.update(movRef, {
                            status: 'pendente',
                            dataPagamento: null,
                            debitadoDoSaldo: false
                        });
                    });
                } else {
                    // Apenas reverter o status sem mexer no saldo
                    await movRef.update({
                        status: 'pendente',
                        dataPagamento: null,
                        debitadoDoSaldo: false
                    });
                }
            } else {
                // Se não foi debitado do saldo, apenas reverter o status
                await movRef.update({
                    status: 'pendente',
                    dataPagamento: null
                });
            }

            await carregarMovimentacoes();
            
        } catch (error) {
            console.error('Erro ao reverter pagamento:', error);
            alert('Erro ao reverter pagamento: ' + error.message);
        }
    };

    // Chamar verificação de contas ao carregar a página
    verificarContasProximasVencimento();
}); 