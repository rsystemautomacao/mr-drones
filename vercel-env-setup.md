# Configuração Automática do Vercel

## 🔧 Variáveis de Ambiente para o Vercel

Configure estas variáveis **EXATAMENTE** como mostrado abaixo no painel do Vercel:

### 📋 **Lista de Variáveis**

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://rsautomacao2000_db_user:@Desbravadores93@cluster0.0hg92v9.mongodb.net/mr_drones?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DATABASE=mr_drones
APP_NAME=MR Drones
APP_VERSION=1.0.0
APP_URL=https://mr-drones.vercel.app
```

## 🚀 **Passo a Passo no Vercel**

### 1. Acessar o Projeto
1. Vá para: https://vercel.com/dashboard
2. Clique no projeto: **mr-drones**

### 2. Configurar Variáveis
1. Clique na aba: **"Settings"**
2. Clique em: **"Environment Variables"**
3. Clique em: **"Add New"**

### 3. Adicionar Cada Variável

**Variável 1:**
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environment**: Marque todas as opções (Production, Preview, Development)

**Variável 2:**
- **Name**: `MONGODB_URI`
- **Value**: `mongodb+srv://rsautomacao2000_db_user:@Desbravadores93@cluster0.0hg92v9.mongodb.net/mr_drones?retryWrites=true&w=majority&appName=Cluster0`
- **Environment**: Marque todas as opções

**Variável 3:**
- **Name**: `MONGODB_DATABASE`
- **Value**: `mr_drones`
- **Environment**: Marque todas as opções

**Variável 4:**
- **Name**: `APP_NAME`
- **Value**: `MR Drones`
- **Environment**: Marque todas as opções

**Variável 5:**
- **Name**: `APP_VERSION`
- **Value**: `1.0.0`
- **Environment**: Marque todas as opções

**Variável 6:**
- **Name**: `APP_URL`
- **Value**: `https://mr-drones.vercel.app`
- **Environment**: Marque todas as opções

### 4. Salvar e Deploy
1. Clique em: **"Save"**
2. Vá para a aba: **"Deployments"**
3. Clique em: **"Redeploy"** no último deployment
4. Aguarde o deploy completar

## ✅ **Verificação**

Após o deploy, acesse:
- **URL**: https://mr-drones.vercel.app
- **Verifique**: Se a página carrega
- **Teste**: Se o PWA funciona
- **Confirme**: Se consegue fazer login

## 🚨 **Se algo der errado**

1. **Verifique os logs** no Vercel
2. **Confirme as variáveis** estão corretas
3. **Teste a conexão** com o MongoDB
4. **Verifique se o IP** está na whitelist

## 📞 **Suporte**

Se precisar de ajuda:
1. Verifique os logs de build no Vercel
2. Confirme se todas as variáveis estão configuradas
3. Teste a conexão MongoDB localmente primeiro
