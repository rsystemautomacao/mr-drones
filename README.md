# MR Drones - Sistema de Gestão PWA

Sistema completo de gestão para serviços de drones agrícolas, desenvolvido como Progressive Web App (PWA) com suporte a múltiplos bancos de dados.

## 🚀 Recursos Implementados

### PWA (Progressive Web App)
- ✅ Prompt de instalação automático para Android
- ✅ Instruções de instalação para iOS
- ✅ Service Worker com cache inteligente
- ✅ Manifest.json otimizado
- ✅ Funcionamento offline
- ✅ Atalhos de aplicativo
- ✅ Suporte a notificações push

### Configuração de Ambiente
- ✅ Sistema de configuração com variáveis de ambiente
- ✅ Suporte a Firebase (homologação/desenvolvimento)
- ✅ Suporte a MongoDB Atlas (produção)
- ✅ Adaptador de banco de dados unificado

### Deploy Automático
- ✅ Script de deploy atualizado
- ✅ Integração com GitHub Pages
- ✅ Configuração automática de ambiente

## 📱 Como Instalar no Android

1. Acesse o site: https://richardspanhol.github.io/mr_drones/
2. Aguarde o botão "Instalar App" aparecer no canto inferior direito
3. Toque no botão e confirme a instalação
4. O app será instalado na tela inicial do seu dispositivo

## 🍎 Como Instalar no iOS

1. Acesse o site no Safari
2. Toque no botão "Compartilhar" (ícone de compartilhamento)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Toque em "Adicionar" no canto superior direito

## ⚙️ Configuração

### 1. Configuração de Ambiente

Copie o arquivo de exemplo e configure as variáveis:

```bash
copy config.env.example config.env
```

Edite o arquivo `config.env` com suas configurações:

```env
# Ambiente (development, staging, production)
NODE_ENV=production

# Firebase (para homologação/desenvolvimento)
FIREBASE_API_KEY=sua_api_key_aqui
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
FIREBASE_APP_ID=seu_app_id

# MongoDB Atlas (para produção)
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/mr_drones?retryWrites=true&w=majority
MONGODB_DATABASE=mr_drones
```

### 2. Configuração do MongoDB Atlas

1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie uma conta gratuita
3. Crie um novo cluster
4. Configure um usuário de banco de dados
5. Adicione seu IP à whitelist
6. Obtenha a string de conexão
7. Configure a `MONGODB_URI` no arquivo `config.env`

### 3. Estrutura do Banco de Dados

O sistema usa as seguintes coleções:

- `servicos` - Serviços de drone
- `clientes` - Dados dos clientes
- `movimentacoes` - Entradas e saídas financeiras
- `financeiro` - Saldo e configurações financeiras

## 🚀 Deploy

### Deploy Automático

Execute o script de deploy:

```bash
deploy.bat
```

O script irá:
1. Verificar se o Git está instalado
2. Inicializar o repositório se necessário
3. Criar o arquivo `config.env` se não existir
4. Fazer commit das alterações
5. Fazer push para o GitHub
6. Atualizar o GitHub Pages automaticamente

### Deploy Manual

```bash
git add .
git commit -m "Deploy manual"
git push origin main
```

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
MR Drones/
├── css/
│   └── style.css
├── js/
│   ├── config.js          # Configuração de ambiente
│   ├── database.js        # Adaptador de banco de dados
│   ├── pwa-install.js     # Gerenciador de instalação PWA
│   ├── auth.js            # Autenticação
│   ├── app.js             # Inicialização do app
│   └── ...                # Outros módulos
├── pages/                 # Páginas do sistema
├── images/                # Ícones e imagens
├── manifest.json          # Manifesto PWA
├── service-worker.js      # Service Worker
├── config.env.example     # Exemplo de configuração
└── deploy.bat            # Script de deploy
```

### Ambientes

- **Development**: Usa Firebase local
- **Staging**: Usa Firebase de homologação
- **Production**: Usa MongoDB Atlas

### Adicionando Novos Recursos

1. Crie o arquivo JavaScript na pasta `js/`
2. Adicione a referência no `index.html`
3. Atualize o `service-worker.js` com o novo arquivo
4. Teste em diferentes ambientes

## 📊 Monitoramento

### Logs do Service Worker

Abra o DevTools (F12) e vá para a aba "Application" > "Service Workers" para ver os logs.

### Verificação PWA

Use o Lighthouse (DevTools > Lighthouse) para verificar a pontuação PWA.

### Teste de Instalação

1. Acesse o site em um dispositivo móvel
2. Verifique se o prompt de instalação aparece
3. Teste o funcionamento offline

## 🐛 Solução de Problemas

### PWA não instala

1. Verifique se o `manifest.json` está correto
2. Confirme se o Service Worker está registrado
3. Teste em diferentes navegadores

### Banco de dados não conecta

1. Verifique as credenciais no `config.env`
2. Confirme se o IP está na whitelist do MongoDB
3. Teste a string de conexão

### Deploy falha

1. Verifique sua conexão com a internet
2. Confirme suas credenciais do GitHub
3. Execute `git status` para ver o estado do repositório

## 📞 Suporte

Para suporte técnico ou dúvidas sobre a implementação, consulte a documentação ou entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Este projeto é propriedade da MR Drones e está protegido por direitos autorais.
