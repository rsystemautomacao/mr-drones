// Adaptador de Banco de Dados - MR Drones
class DatabaseAdapter {
    constructor() {
        this.config = window.AppConfig;
        this.database = this.config.getDatabaseConfig();
        this.initialize();
    }

    async initialize() {
        if (this.database === 'firebase') {
            await this.initializeFirebase();
        } else if (this.database === 'mongodb') {
            await this.initializeMongoDB();
        }
    }

    async initializeFirebase() {
        try {
            const firebaseConfig = this.config.getFirebaseConfig();
            
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            console.log('Firebase inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar Firebase:', error);
            throw error;
        }
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
            // Para MongoDB, fazer requisição para API
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
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
            
            // Aplicar filtros
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
            // Para MongoDB via API
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${this.apiBaseUrl}/${collectionName}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
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
            const data = await response.json();
            return data.valor;
        }
    }
}

// Criar instância global
window.Database = new DatabaseAdapter();

// Exportar para compatibilidade
window.db = window.Database;
