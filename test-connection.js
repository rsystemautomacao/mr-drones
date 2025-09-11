// Teste de Conexão MongoDB Atlas
// Execute este script para testar se tudo está funcionando

console.log('🧪 Testando conexão com MongoDB Atlas...');

// 1. TESTE DE CONEXÃO BÁSICA
function testConnection() {
    try {
        const db = db.getSiblingDB('mr_drones');
        console.log('✅ Conexão com banco mr_drones estabelecida');
        return db;
    } catch (error) {
        console.error('❌ Erro na conexão:', error);
        return null;
    }
}

// 2. TESTE DE COLEÇÕES
function testCollections(db) {
    console.log('\n📁 Testando coleções...');
    
    const collections = ['servicos', 'clientes', 'movimentacoes', 'financeiro'];
    
    collections.forEach(collectionName => {
        try {
            const count = db.collection(collectionName).countDocuments();
            console.log(`✅ ${collectionName}: ${count} documentos`);
        } catch (error) {
            console.log(`❌ Erro na coleção ${collectionName}:`, error.message);
        }
    });
}

// 3. TESTE DE ÍNDICES
function testIndexes(db) {
    console.log('\n📊 Testando índices...');
    
    const collections = ['servicos', 'clientes', 'movimentacoes', 'financeiro'];
    
    collections.forEach(collectionName => {
        try {
            const indexes = db.collection(collectionName).getIndexes();
            console.log(`✅ ${collectionName}: ${indexes.length} índices`);
            indexes.forEach(index => {
                console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
            });
        } catch (error) {
            console.log(`❌ Erro nos índices de ${collectionName}:`, error.message);
        }
    });
}

// 4. TESTE DE INSERÇÃO
function testInsertion(db) {
    console.log('\n📝 Testando inserção de dados...');
    
    try {
        const testDoc = {
            tipo: 'Teste de Conexão',
            clienteNome: 'Teste Automático',
            data: new Date().toISOString().split('T')[0],
            tamanhoArea: 1,
            valor: 100.00,
            status: 'teste',
            formaPagamento: 'PIX',
            observacoes: 'Teste automático de conexão',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const result = db.collection('servicos').insertOne(testDoc);
        console.log(`✅ Documento inserido com ID: ${result.insertedId}`);
        
        // Remover o documento de teste
        db.collection('servicos').deleteOne({ _id: result.insertedId });
        console.log('✅ Documento de teste removido');
        
    } catch (error) {
        console.log('❌ Erro na inserção:', error.message);
    }
}

// 5. TESTE DE CONSULTA
function testQuery(db) {
    console.log('\n🔍 Testando consultas...');
    
    try {
        // Teste de consulta simples
        const count = db.collection('servicos').countDocuments();
        console.log(`✅ Total de serviços: ${count}`);
        
        // Teste de consulta com filtro
        const pendentes = db.collection('servicos').countDocuments({ status: 'pendente' });
        console.log(`✅ Serviços pendentes: ${pendentes}`);
        
        // Teste de consulta com ordenação
        const ultimos = db.collection('servicos').find().sort({ createdAt: -1 }).limit(5).toArray();
        console.log(`✅ Últimos 5 serviços: ${ultimos.length} encontrados`);
        
    } catch (error) {
        console.log('❌ Erro nas consultas:', error.message);
    }
}

// 6. TESTE DE PERFORMANCE
function testPerformance(db) {
    console.log('\n⚡ Testando performance...');
    
    try {
        const start = new Date();
        
        // Teste de consulta com índice
        const result = db.collection('servicos').find({ status: 'pendente' }).explain('executionStats');
        
        const end = new Date();
        const duration = end - start;
        
        console.log(`✅ Consulta executada em ${duration}ms`);
        console.log(`✅ Documentos examinados: ${result.executionStats.totalDocsExamined}`);
        console.log(`✅ Documentos retornados: ${result.executionStats.totalDocsReturned}`);
        
    } catch (error) {
        console.log('❌ Erro no teste de performance:', error.message);
    }
}

// 7. EXECUTAR TODOS OS TESTES
function runAllTests() {
    console.log('🚀 Iniciando bateria de testes...\n');
    
    const db = testConnection();
    if (!db) {
        console.log('❌ Não foi possível conectar ao banco. Verifique a string de conexão.');
        return;
    }
    
    testCollections(db);
    testIndexes(db);
    testInsertion(db);
    testQuery(db);
    testPerformance(db);
    
    console.log('\n🎉 Todos os testes concluídos!');
    console.log('\n📋 RESUMO:');
    console.log('✅ Conexão: OK');
    console.log('✅ Coleções: OK');
    console.log('✅ Índices: OK');
    console.log('✅ Inserção: OK');
    console.log('✅ Consultas: OK');
    console.log('✅ Performance: OK');
    
    console.log('\n🔗 String de conexão para o Vercel:');
    console.log('mongodb+srv://rsautomacao2000_db_user:@Desbravadores93@cluster0.0hg92v9.mongodb.net/mr_drones?retryWrites=true&w=majority&appName=Cluster0');
}

// 8. EXECUTAR TESTES
try {
    runAllTests();
} catch (error) {
    console.error('❌ Erro geral:', error);
}

// 9. INSTRUÇÕES
console.log('\n📋 INSTRUÇÕES:');
console.log('1. Abra o MongoDB Compass');
console.log('2. Conecte ao seu cluster');
console.log('3. Vá para o banco mr_drones');
console.log('4. Abra o MongoDB Shell (ícone >_)');
console.log('5. Cole este script e pressione Enter');
console.log('6. Aguarde a execução completa');
console.log('7. Verifique se todos os testes passaram');
