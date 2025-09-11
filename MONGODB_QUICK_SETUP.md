# MongoDB Atlas - Setup Rápido

## 🚀 Passos Essenciais

### 1. Criar Cluster
1. Acesse: https://www.mongodb.com/atlas
2. Clique: "Try Free"
3. Crie conta e confirme email
4. Escolha: **FREE (M0)**
5. Região: **São Paulo**
6. Nome: `mr-drones-cluster`

### 2. Configurar Usuário
1. Vá para: "Database Access"
2. Clique: "Add New Database User"
3. Usuário: `mr_drones_user`
4. Senha: `MrDrones2024!` (ou sua escolha)
5. Privilégios: "Read and write to any database"

### 3. Configurar Rede
1. Vá para: "Network Access"
2. Clique: "Add IP Address"
3. Escolha: "Allow Access from Anywhere" (0.0.0.0/0)

### 4. Obter String de Conexão
1. Dashboard → "Connect"
2. Escolha: "Connect your application"
3. Driver: "Node.js"
4. Copie a string

**String final será algo como**:
```
mongodb+srv://mr_drones_user:MrDrones2024!@mr-drones-cluster.xxxxx.mongodb.net/mr_drones?retryWrites=true&w=majority
```

### 5. Criar Banco
1. Vá para: "Browse Collections"
2. Clique: "Create Database"
3. Nome: `mr_drones`
4. Collection: `servicos`

## ⚙️ Variáveis para Vercel

Configure estas variáveis no Vercel:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://mr_drones_user:SUA_SENHA@mr-drones-cluster.xxxxx.mongodb.net/mr_drones?retryWrites=true&w=majority
MONGODB_DATABASE=mr_drones
APP_NAME=MR Drones
APP_VERSION=1.0.0
APP_URL=https://mr-drones.vercel.app
```

## 🎯 Pronto!

Após configurar, o sistema criará automaticamente as coleções:
- `servicos`
- `clientes`
- `movimentacoes`
- `financeiro`
