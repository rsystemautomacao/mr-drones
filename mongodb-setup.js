// Script de Configuração Automática do MongoDB Atlas
// Execute este script no MongoDB Compass ou no terminal

console.log('🚀 Iniciando configuração automática do MongoDB Atlas...');

// 1. CONFIGURAÇÃO DO BANCO DE DADOS
const databaseConfig = {
    name: 'mr_drones',
    collections: [
        {
            name: 'servicos',
            indexes: [
                { field: 'data', type: 1, name: 'data_1' },
                { field: 'status', type: 1, name: 'status_1' },
                { field: 'clienteNome', type: 1, name: 'clienteNome_1' },
                { field: 'tipo', type: 1, name: 'tipo_1' },
                { field: 'valor', type: 1, name: 'valor_1' }
            ]
        },
        {
            name: 'clientes',
            indexes: [
                { field: 'nome', type: 1, name: 'nome_1' },
                { field: 'email', type: 1, name: 'email_1' },
                { field: 'telefone', type: 1, name: 'telefone_1' },
                { field: 'cidade', type: 1, name: 'cidade_1' }
            ]
        },
        {
            name: 'movimentacoes',
            indexes: [
                { field: 'data', type: 1, name: 'data_1' },
                { field: 'tipo', type: 1, name: 'tipo_1' },
                { field: 'categoria', type: 1, name: 'categoria_1' },
                { field: 'valor', type: 1, name: 'valor_1' }
            ]
        },
        {
            name: 'financeiro',
            indexes: [
                { field: 'tipo', type: 1, name: 'tipo_1' },
                { field: 'data', type: 1, name: 'data_1' }
            ]
        }
    ]
};

// 2. DADOS INICIAIS PARA TESTE
const initialData = {
    servicos: [
        {
            tipo: 'Pulverização',
            clienteNome: 'Cliente Teste',
            data: '2024-01-15',
            tamanhoArea: 50,
            valor: 1500.00,
            status: 'pendente',
            formaPagamento: 'PIX',
            observacoes: 'Teste de conexão',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ],
    clientes: [
        {
            nome: 'Cliente Teste',
            email: 'teste@email.com',
            telefone: '(11) 99999-9999',
            endereco: 'Rua das Flores, 123',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01234-567',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ],
    movimentacoes: [
        {
            tipo: 'entrada',
            categoria: 'servico',
            descricao: 'Pulverização - Cliente Teste',
            valor: 1500.00,
            data: '2024-01-15',
            createdAt: new Date().toISOString()
        }
    ],
    financeiro: [
        {
            _id: 'saldo',
            valor: 5000.00,
            updatedAt: new Date().toISOString()
        }
    ]
};

// 3. FUNÇÕES DE CONFIGURAÇÃO
function createIndexes(db, collectionName, indexes) {
    console.log(`📊 Criando índices para ${collectionName}...`);
    
    indexes.forEach(index => {
        try {
            db.collection(collectionName).createIndex(
                { [index.field]: index.type },
                { name: index.name }
            );
            console.log(`✅ Índice criado: ${index.name}`);
        } catch (error) {
            console.log(`⚠️ Erro ao criar índice ${index.name}:`, error.message);
        }
    });
}

function insertInitialData(db, collectionName, data) {
    console.log(`📝 Inserindo dados iniciais em ${collectionName}...`);
    
    try {
        if (collectionName === 'financeiro') {
            // Para financeiro, usar upsert
            db.collection(collectionName).replaceOne(
                { _id: data[0]._id },
                data[0],
                { upsert: true }
            );
        } else {
            // Para outras coleções, inserir normalmente
            db.collection(collectionName).insertMany(data);
        }
        console.log(`✅ Dados inseridos em ${collectionName}`);
    } catch (error) {
        console.log(`⚠️ Erro ao inserir dados em ${collectionName}:`, error.message);
    }
}

// 4. SCRIPT PRINCIPAL
function setupDatabase() {
    console.log('🔧 Configurando banco de dados...');
    
    // Conectar ao banco
    const db = db.getSiblingDB('mr_drones');
    
    // Criar coleções e índices
    databaseConfig.collections.forEach(collection => {
        console.log(`\n📁 Configurando coleção: ${collection.name}`);
        
        // Criar índices
        createIndexes(db, collection.name, collection.indexes);
        
        // Inserir dados iniciais
        if (initialData[collection.name]) {
            insertInitialData(db, collection.name, initialData[collection.name]);
        }
    });
    
    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('📊 Resumo:');
    console.log(`- Banco: ${databaseConfig.name}`);
    console.log(`- Coleções: ${databaseConfig.collections.length}`);
    console.log(`- Total de índices: ${databaseConfig.collections.reduce((total, col) => total + col.indexes.length, 0)}`);
}

// 5. EXECUTAR CONFIGURAÇÃO
try {
    setupDatabase();
} catch (error) {
    console.error('❌ Erro na configuração:', error);
}

// 6. INSTRUÇÕES DE USO
console.log('\n📋 INSTRUÇÕES DE USO:');
console.log('1. Abra o MongoDB Compass');
console.log('2. Conecte ao seu cluster');
console.log('3. Vá para o banco mr_drones');
console.log('4. Abra o MongoDB Shell (ícone >_ no canto superior direito)');
console.log('5. Cole este script e pressione Enter');
console.log('6. Aguarde a execução completa');
console.log('\n🔗 String de conexão para usar:');
console.log('mongodb+srv://rsautomacao2000_db_user:@Desbravadores93@cluster0.0hg92v9.mongodb.net/mr_drones?retryWrites=true&w=majority&appName=Cluster0');
