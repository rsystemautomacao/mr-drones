# Configuração do MongoDB Atlas - MR Drones

Este guia explica como configurar o MongoDB Atlas para usar em produção com o sistema MR Drones.

## 🚀 Passo a Passo

### 1. Criar Conta no MongoDB Atlas

1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Clique em "Try Free"
3. Preencha o formulário de cadastro
4. Confirme seu email

### 2. Criar um Cluster

1. Faça login no MongoDB Atlas
2. Clique em "Build a Database"
3. Escolha o plano **FREE** (M0)
4. Selecione uma região próxima ao Brasil (ex: São Paulo)
5. Clique em "Create"

### 3. Configurar Acesso ao Banco

1. Na tela de "Database Access", clique em "Add New Database User"
2. Escolha "Password" como método de autenticação
3. Crie um usuário (ex: `mr_drones_user`)
4. Crie uma senha forte
5. Em "Database User Privileges", selecione "Read and write to any database"
6. Clique em "Add User"

### 4. Configurar Acesso de Rede

1. Na tela de "Network Access", clique em "Add IP Address"
2. Para desenvolvimento, clique em "Allow Access from Anywhere" (0.0.0.0/0)
3. Para produção, adicione apenas os IPs necessários
4. Clique em "Confirm"

### 5. Obter String de Conexão

1. Na tela principal, clique em "Connect"
2. Escolha "Connect your application"
3. Selecione "Node.js" como driver
4. Copie a string de conexão
5. Substitua `<password>` pela senha do usuário criado
6. Substitua `<dbname>` por `mr_drones`

### 6. Configurar no Projeto

1. Abra o arquivo `config.env`
2. Substitua a `MONGODB_URI` pela string obtida:

```env
MONGODB_URI=mongodb+srv://mr_drones_user:SUA_SENHA@cluster0.xxxxx.mongodb.net/mr_drones?retryWrites=true&w=majority
```

### 7. Estrutura do Banco de Dados

O sistema criará automaticamente as seguintes coleções:

#### Coleção: `servicos`
```json
{
  "_id": "ObjectId",
  "tipo": "Pulverização",
  "clienteNome": "João Silva",
  "clienteId": "ObjectId",
  "data": "2024-01-15",
  "tamanhoArea": 50,
  "valor": 1500.00,
  "status": "pendente",
  "formaPagamento": "PIX",
  "observacoes": "Área com declive",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Coleção: `clientes`
```json
{
  "_id": "ObjectId",
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999",
  "endereco": "Rua das Flores, 123",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234-567",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Coleção: `movimentacoes`
```json
{
  "_id": "ObjectId",
  "tipo": "entrada",
  "categoria": "servico",
  "descricao": "Pulverização - João Silva",
  "valor": 1500.00,
  "data": "2024-01-15",
  "servicoId": "ObjectId",
  "clienteId": "ObjectId",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Coleção: `financeiro`
```json
{
  "_id": "saldo",
  "valor": 5000.00,
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 🔧 Configurações Avançadas

### Índices Recomendados

Para melhor performance, crie os seguintes índices:

```javascript
// Índice para serviços por data
db.servicos.createIndex({ "data": 1 })

// Índice para serviços por status
db.servicos.createIndex({ "status": 1 })

// Índice para movimentações por data
db.movimentacoes.createIndex({ "data": 1 })

// Índice para movimentações por tipo
db.movimentacoes.createIndex({ "tipo": 1 })
```

### Backup Automático

O MongoDB Atlas oferece backup automático no plano gratuito:
- Backup contínuo
- Retenção de 2 dias
- Restauração point-in-time

## 🚨 Segurança

### Boas Práticas

1. **Nunca** commite a string de conexão com a senha no Git
2. Use variáveis de ambiente para credenciais
3. Configure IPs específicos em produção
4. Use senhas fortes para usuários do banco
5. Monitore o acesso regularmente

### Configuração de Produção

Para produção, configure:

1. **IP Whitelist**: Apenas IPs necessários
2. **Usuário específico**: Com permissões mínimas necessárias
3. **Criptografia**: Ative a criptografia em trânsito
4. **Monitoramento**: Configure alertas de uso

## 📊 Monitoramento

### Métricas Importantes

- Conexões ativas
- Operações por segundo
- Uso de memória
- Uso de disco
- Latência de consultas

### Alertas Recomendados

1. Uso de memória > 80%
2. Latência > 100ms
3. Erros de conexão
4. Uso de disco > 90%

## 🆘 Solução de Problemas

### Erro de Conexão

1. Verifique se o IP está na whitelist
2. Confirme as credenciais
3. Teste a string de conexão
4. Verifique se o cluster está ativo

### Performance Lenta

1. Verifique os índices
2. Analise as consultas
3. Monitore o uso de recursos
4. Considere otimizar as queries

### Backup e Restauração

1. Acesse "Backups" no MongoDB Atlas
2. Selecione o ponto de restauração
3. Escolha o destino (novo cluster ou existente)
4. Confirme a restauração

## 📞 Suporte

- [Documentação MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Comunidade MongoDB](https://community.mongodb.com/)
- [Suporte Técnico](https://support.mongodb.com/)

## 💰 Custos

### Plano Gratuito (M0)
- 512 MB de RAM
- 5 GB de armazenamento
- Backup de 2 dias
- Ideal para desenvolvimento e pequenos projetos

### Planos Pagos
- M2: $9/mês - 2 GB RAM, 10 GB storage
- M5: $25/mês - 5 GB RAM, 20 GB storage
- M10: $57/mês - 10 GB RAM, 40 GB storage

Para o MR Drones, o plano gratuito deve ser suficiente inicialmente.
