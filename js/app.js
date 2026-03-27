// Inicializar Service Worker e PWA
document.addEventListener('DOMContentLoaded', () => {
  // Registrar Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registrado com sucesso:', registration.scope);
        
        // Verificar se há atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível
              if (confirm('Nova versão disponível! Deseja atualizar?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch(error => {
        console.log('Falha ao registrar o ServiceWorker:', error);
      });
  }

  // Inicializar PWA Install Manager
  if (window.PWAInstallManager) {
    console.log('PWA Install Manager inicializado');
  }

  // Verificar se está rodando como PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('App rodando como PWA');
    document.body.classList.add('pwa-mode');
  }

  // Adicionar classe para iOS
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    document.body.classList.add('ios');
  }

  // Adicionar classe para Android
  if (/Android/.test(navigator.userAgent)) {
    document.body.classList.add('android');
  }
}); 