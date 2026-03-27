const CACHE_NAME = 'mr-drones-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/home.html',
  '/pages/servicos.html',
  '/pages/clientes.html',
  '/pages/saidas.html',
  '/pages/relatorios.html',
  '/pages/financeiro.html',
  '/pages/calculadora.html',
  '/css/style.css',
  '/js/config.js',
  '/js/database.js',
  '/js/auth.js',
  '/js/menu.js',
  '/js/app.js',
  '/js/servicos.js',
  '/js/clientes.js',
  '/js/saidas.js',
  '/js/relatorios.js',
  '/js/financeiro.js',
  '/js/calculadora.js',
  '/js/home.js',
  '/js/resumo.js',
  '/js/utils.js',
  '/js/pwa-install.js',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  '/images/favicon.ico',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Instalado com sucesso');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Erro na instalação:', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Ativado com sucesso');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  // Estratégia: Cache First para recursos estáticos, Network First para dados dinâmicos
  const { request } = event;
  const url = new URL(request.url);

  // HTML e JSON: Network First (garante atualizações imediatas)
  if (request.method === 'GET' && (
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.json') ||
    url.pathname === '/'
  ) && !url.protocol.includes('chrome-extension')) {
    event.respondWith(
      fetch(request)
        .then(fetchResponse => {
          // Atualizar cache com a versão mais recente
          if (fetchResponse && fetchResponse.status === 200) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return fetchResponse;
        })
        .catch(() => {
          // Offline: usar cache como fallback
          return caches.match(request).then(response => {
            return response || caches.match('/index.html');
          });
        })
    );
  }
  // Assets estáticos (CSS, JS, imagens): Cache First (raramente mudam)
  else if (request.method === 'GET' && (
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.ico')
  ) && !url.protocol.includes('chrome-extension')) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request).then(fetchResponse => {
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
            return fetchResponse;
          });
        })
        .catch(() => {
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        })
    );
  } else {
    // Para outras requisições (APIs, CDNs, etc.), usar Network First
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(request);
        })
    );
  }
});

// Notificações push (para futuras implementações)
self.addEventListener('push', event => {
  console.log('Service Worker: Push recebido');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do MR Drones',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/images/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/images/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MR Drones', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notificação clicada');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 