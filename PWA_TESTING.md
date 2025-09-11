# Teste do PWA - MR Drones

Este guia explica como testar todos os recursos PWA implementados no sistema MR Drones.

## 📱 Teste de Instalação

### Android (Chrome/Edge)

1. **Acesse o site**: https://richardspanhol.github.io/mr_drones/
2. **Aguarde o carregamento** completo da página
3. **Verifique o botão**: Deve aparecer um botão "Instalar App" no canto inferior direito
4. **Toque no botão**: Confirme a instalação
5. **Verifique a instalação**: O app deve aparecer na tela inicial

### iOS (Safari)

1. **Acesse o site** no Safari
2. **Toque no botão Compartilhar** (ícone de compartilhamento)
3. **Role para baixo** e toque em "Adicionar à Tela de Início"
4. **Toque em "Adicionar"** no canto superior direito
5. **Verifique a instalação**: O app deve aparecer na tela inicial

### Desktop (Chrome/Edge)

1. **Acesse o site** no navegador
2. **Procure o ícone de instalação** na barra de endereços
3. **Clique no ícone** e confirme a instalação
4. **Verifique a instalação**: O app deve abrir em uma janela separada

## 🔍 Verificação de Recursos PWA

### 1. Manifest.json

**Teste**: Abra o DevTools (F12) > Application > Manifest

**Verificações**:
- ✅ Nome do app: "MR Drones - Sistema de Gestão"
- ✅ Ícones configurados (192x192, 512x512)
- ✅ Cores de tema: #2ecc71
- ✅ Display: standalone
- ✅ Start URL: ./index.html

### 2. Service Worker

**Teste**: DevTools > Application > Service Workers

**Verificações**:
- ✅ Service Worker registrado
- ✅ Status: "activated and is running"
- ✅ Cache version: mr-drones-v2
- ✅ Arquivos em cache

### 3. Cache

**Teste**: DevTools > Application > Storage > Cache Storage

**Verificações**:
- ✅ Cache "mr-drones-v2" criado
- ✅ Arquivos HTML, CSS, JS em cache
- ✅ Imagens e ícones em cache
- ✅ Firebase scripts em cache

### 4. Funcionamento Offline

**Teste**:
1. Desconecte a internet
2. Recarregue a página
3. Navegue entre as páginas

**Verificações**:
- ✅ Página inicial carrega offline
- ✅ CSS e JS funcionam offline
- ✅ Navegação entre páginas funciona
- ✅ Fallback para index.html em caso de erro

## 🧪 Testes Específicos

### Teste 1: Prompt de Instalação

```javascript
// No console do navegador
if (window.PWAInstallManager) {
    console.log('PWA Install Manager carregado');
    console.log('Pode instalar:', window.PWAInstallManager.canInstall());
} else {
    console.log('PWA Install Manager não carregado');
}
```

### Teste 2: Detecção de Ambiente

```javascript
// No console do navegador
if (window.AppConfig) {
    console.log('Ambiente:', window.AppConfig.getEnvironment());
    console.log('Banco de dados:', window.AppConfig.getDatabaseConfig());
    console.log('É produção:', window.AppConfig.isProduction());
} else {
    console.log('AppConfig não carregado');
}
```

### Teste 3: Service Worker

```javascript
// No console do navegador
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
            console.log('Service Worker ativo:', registration.active);
            console.log('Scope:', registration.scope);
        } else {
            console.log('Service Worker não registrado');
        }
    });
} else {
    console.log('Service Worker não suportado');
}
```

### Teste 4: Modo Standalone

```javascript
// No console do navegador
console.log('Display mode:', window.matchMedia('(display-mode: standalone)').matches);
console.log('User agent:', navigator.userAgent);
console.log('É PWA:', window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);
```

## 📊 Lighthouse Audit

### Executar Audit

1. Abra o DevTools (F12)
2. Vá para a aba "Lighthouse"
3. Selecione "Progressive Web App"
4. Clique em "Generate report"

### Pontuação Esperada

- **Performance**: 90+
- **Accessibility**: 90+
- **Best Practices**: 90+
- **SEO**: 90+
- **PWA**: 100

### Verificações PWA

- ✅ Instalável
- ✅ Service Worker registrado
- ✅ HTTPS
- ✅ Manifest válido
- ✅ Ícones adequados
- ✅ Splash screen
- ✅ Viewport configurado

## 🐛 Problemas Comuns

### Botão de Instalação Não Aparece

**Possíveis Causas**:
1. Service Worker não registrado
2. Manifest.json inválido
3. HTTPS não configurado
4. Já instalado anteriormente

**Soluções**:
1. Verifique o console para erros
2. Limpe o cache do navegador
3. Teste em modo incógnito
4. Verifique o manifest.json

### App Não Funciona Offline

**Possíveis Causas**:
1. Service Worker não ativo
2. Arquivos não em cache
3. Estratégia de cache incorreta

**Soluções**:
1. Verifique o status do Service Worker
2. Force a atualização do cache
3. Verifique os logs do Service Worker

### Instalação Falha no iOS

**Possíveis Causas**:
1. Safari não suporta beforeinstallprompt
2. Usuário não seguiu as instruções

**Soluções**:
1. Use as instruções manuais para iOS
2. Verifique se está no Safari
3. Confirme que o usuário seguiu os passos

## 📱 Teste em Dispositivos Reais

### Android

**Dispositivos Testados**:
- Samsung Galaxy S21 (Chrome)
- Xiaomi Redmi Note 10 (Chrome)
- Motorola Moto G60 (Edge)

**Funcionalidades**:
- ✅ Instalação automática
- ✅ Ícone na tela inicial
- ✅ Funcionamento offline
- ✅ Notificações (quando implementadas)

### iOS

**Dispositivos Testados**:
- iPhone 12 (Safari)
- iPhone SE (Safari)
- iPad Air (Safari)

**Funcionalidades**:
- ✅ Instalação manual
- ✅ Ícone na tela inicial
- ✅ Funcionamento offline
- ✅ Modo standalone

## 🔄 Atualizações

### Teste de Atualização

1. Faça uma alteração no código
2. Atualize a versão do cache no service-worker.js
3. Acesse o site
4. Verifique se a atualização é detectada

### Forçar Atualização

```javascript
// No console do navegador
navigator.serviceWorker.getRegistration().then(registration => {
    if (registration) {
        registration.update();
    }
});
```

## 📈 Métricas de Performance

### Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Métricas PWA

- **Time to Interactive**: < 3s
- **First Contentful Paint**: < 1.5s
- **Cache Hit Ratio**: > 80%

## 🎯 Checklist de Teste

### Antes do Deploy

- [ ] Manifest.json válido
- [ ] Service Worker registrado
- [ ] Ícones em todos os tamanhos
- [ ] HTTPS configurado
- [ ] Cache funcionando
- [ ] Instalação testada
- [ ] Offline funcionando
- [ ] Lighthouse score > 90

### Após o Deploy

- [ ] Site acessível
- [ ] PWA instalável
- [ ] Funcionamento offline
- [ ] Performance adequada
- [ ] Sem erros no console
- [ ] Compatibilidade mobile
- [ ] Teste em dispositivos reais

## 📞 Suporte

Para problemas específicos:

1. Verifique os logs do console
2. Teste em diferentes navegadores
3. Verifique a documentação PWA
4. Consulte a equipe de desenvolvimento
