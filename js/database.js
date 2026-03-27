// Adaptador de Banco de Dados - MR Drones
class DatabaseAdapter {
    constructor() {
        this.config = null;
        this.database = null;
        // Expor promise de inicialização para consumidores poderem aguardar
        this.ready = this.initialize();
    }

    async initialize() {
        // Aguardar o AppConfig estar disponível
        await this.waitForAppConfig();
        
        if (this.database === 'firebase') {
            await this.initializeFirebase();
        } else if (this.database === 'mongodb') {
            await this.initializeMongoDB();
        }
    }

    async waitForAppConfig() {
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos máximo
        
        while (!window.AppConfig && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.AppConfig) {
            this.config = window.AppConfig;
            this.database = this.config.getDatabaseConfig();
            console.log('Database: AppConfig carregado, ambiente:', this.config.getEnvironment());
        } else {
            console.error('Database: AppConfig não foi carregado após 5 segundos');
            // Fallback para desenvolvimento
            this.database = 'firebase';
        }
    }

    async initializeFirebase() {
        try {
            const firebaseConfig = this.config.getFirebaseConfig();
            console.log('Inicializando Firebase com config:', firebaseConfig);
            
            // Verificar se Firebase está disponível
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase não está carregado');
            }
            
            // Inicializar Firebase se não estiver inicializado
            if (!firebase.apps || firebase.apps.length === 0) {
                firebase.initializeApp(firebaseConfig);
                console.log('Firebase app inicializado');
            } else {
                console.log('Firebase app já estava inicializado');
            }

            // Aguardar Firebase estar disponível
            await this.waitForFirebase();
            
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            console.log('Firebase inicializado com sucesso - db e auth prontos');
        } catch (error) {
            console.error('Erro ao inicializar Firebase:', error);
            throw error;
        }
    }

    async waitForFirebase() {
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos máximo
        
        while (typeof firebase === 'undefined' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase não foi carregado após 5 segundos');
        }
        
        // Aguardar Firebase estar completamente inicializado
        while ((!firebase.apps || firebase.apps.length === 0) && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!firebase.apps || firebase.apps.length === 0) {
            throw new Error('Firebase app não foi inicializado após 5 segundos');
        }
        
        console.log('Firebase está pronto para uso');
    }

    async initializeMongoDB() {
        try {
            // Para MongoDB, vamos usar uma API REST simples
            // Em produção real, você teria um backend Node.js/Express
            this.apiBaseUrl = 'https://api.mrdrones.com'; // Substitua pela sua API
            console.log('MongoDB configurado (via API REST)');
        } catch (error) {
            console.error('Erro ao inicializar MongoDB:', error);
            throw error;
        }
    }

    // Métodos de autenticação
    async signIn(email, password) {
        if (this.database === 'firebase') {
            return await this.auth.signInWithEmailAndPassword(email, password);
        } else {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro de autenticação (${response.status})`);
            }
            return await response.json();
        }
    }

    async signOut() {
        if (this.database === 'firebase') {
            return await this.auth.signOut();
        } else {
            // Para MongoDB, limpar token local
            localStorage.removeItem('authToken');
        }
    }

    async getCurrentUser() {
        if (this.database === 'firebase') {
            return this.auth.currentUser;
        } else {
            const token = localStorage.getItem('authToken');
            if (!token) return null;
            
            // Verificar token com API
            const response = await fetch(`${this.apiBaseUrl}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok ? await response.json() : null;
        }
    }

    // Métodos de dados genéricos
    async getCollection(collectionName, filters = {}) {
        if (this.database === 'firebase') {
            let query = this.db.collection(collectionName);

            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null) {
                    query = query.where(key, '==', filters[key]);
                }
            });

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } else {
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${this.apiBaseUrl}/${collectionName}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            if (!response.ok) {
                throw new Error(`Erro ao buscar ${collectionName} (${response.status})`);
            }
            return await response.json();
        }
    }

    async addDocument(collectionName, data) {
        if (this.database === 'firebase') {
            const docRef = await this.db.collection(collectionName).add(data);
            return { id: docRef.id, ...data };
        } else {
            const response = await fetch(`${this.apiBaseUrl}/${collectionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Erro ao adicionar em ${collectionName} (${response.status})`);
            }
            return await response.json();
        }
    }

    async updateDocument(collectionName, docId, data) {
        if (this.database === 'firebase') {
            await this.db.collection(collectionName).doc(docId).update(data);
            return { id: docId, ...data };
        } else {
            const response = await fetch(`${this.apiBaseUrl}/${collectionName}/${docId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Erro ao atualizar ${collectionName}/${docId} (${response.status})`);
            }
            return await response.json();
        }
    }

    async deleteDocument(collectionName, docId) {
        if (this.database === 'firebase') {
            await this.db.collection(collectionName).doc(docId).delete();
            return true;
        } else {
            const response = await fetch(`${this.apiBaseUrl}/${collectionName}/${docId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            return response.ok;
        }
    }

    // Métodos específicos para o app
    async getServicos(filters = {}) {
        return await this.getCollection('servicos', filters);
    }

    async addServico(servico) {
        return await this.addDocument('servicos', servico);
    }

    async updateServico(servicoId, servico) {
        return await this.updateDocument('servicos', servicoId, servico);
    }

    async deleteServico(servicoId) {
        return await this.deleteDocument('servicos', servicoId);
    }

    async getClientes(filters = {}) {
        return await this.getCollection('clientes', filters);
    }

    async addCliente(cliente) {
        return await this.addDocument('clientes', cliente);
    }

    async updateCliente(clienteId, cliente) {
        return await this.updateDocument('clientes', clienteId, cliente);
    }

    async deleteCliente(clienteId) {
        return await this.deleteDocument('clientes', clienteId);
    }

    async getMovimentacoes(filters = {}) {
        return await this.getCollection('movimentacoes', filters);
    }

    async addMovimentacao(movimentacao) {
        return await this.addDocument('movimentacoes', movimentacao);
    }

    async updateMovimentacao(movimentacaoId, movimentacao) {
        return await this.updateDocument('movimentacoes', movimentacaoId, movimentacao);
    }

    async deleteMovimentacao(movimentacaoId) {
        return await this.deleteDocument('movimentacoes', movimentacaoId);
    }

    // Queries avançadas para o dashboard (home.js)
    async getMovimentacoesPorPeriodo(tipo, dataInicio, dataFim) {
        if (this.database === 'firebase') {
            const snapshot = await this.db.collection('movimentacoes')
                .where('tipo', '==', tipo)
                .where('data', '>=', dataInicio)
                .where('data', '<=', dataFim)
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            const params = new URLSearchParams({ tipo, dataInicio, dataFim });
            const response = await fetch(`${this.apiBaseUrl}/movimentacoes?${params}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            if (!response.ok) throw new Error(`Erro ao buscar movimentações (${response.status})`);
            return await response.json();
        }
    }

    async getServicosPorStatusEData(status, dataMinima, orderBy = 'data', orderDir = 'asc') {
        if (this.database === 'firebase') {
            let query = this.db.collection('servicos')
                .where('status', '==', status);
            if (dataMinima) {
                query = query.where('data', '>=', dataMinima);
            }
            query = query.orderBy(orderBy, orderDir);
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            const params = new URLSearchParams({ status });
            if (dataMinima) params.set('dataMinima', dataMinima);
            params.set('orderBy', orderBy);
            params.set('orderDir', orderDir);
            const response = await fetch(`${this.apiBaseUrl}/servicos?${params}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            if (!response.ok) throw new Error(`Erro ao buscar serviços (${response.status})`);
            return await response.json();
        }
    }

    async getServicosPorStatus(status) {
        if (this.database === 'firebase') {
            const snapshot = await this.db.collection('servicos')
                .where('status', '==', status)
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            const params = new URLSearchParams({ status });
            const response = await fetch(`${this.apiBaseUrl}/servicos?${params}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            if (!response.ok) throw new Error(`Erro ao buscar serviços (${response.status})`);
            return await response.json();
        }
    }

    async getSaldoFinanceiro() {
        if (this.database === 'firebase') {
            const saldoDoc = await this.db.collection('financeiro').doc('saldo').get();
            return saldoDoc.exists ? saldoDoc.data().valor : 0;
        } else {
            const response = await fetch(`${this.apiBaseUrl}/financeiro/saldo`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            if (!response.ok) {
                throw new Error(`Erro ao buscar saldo (${response.status})`);
            }
            const data = await response.json();
            return data.valor || 0;
        }
    }

    async updateSaldoFinanceiro(valor) {
        if (this.database === 'firebase') {
            await this.db.collection('financeiro').doc('saldo').set({ valor });
            return valor;
        } else {
            const response = await fetch(`${this.apiBaseUrl}/financeiro/saldo`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ valor })
            });
            if (!response.ok) {
                throw new Error(`Erro ao atualizar saldo (${response.status})`);
            }
            const data = await response.json();
            return data.valor;
        }
    }
}

// Criar instância global
window.Database = new DatabaseAdapter();

// Exportar para compatibilidade
window.db = window.Database;
