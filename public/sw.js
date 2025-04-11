
// Service Worker pour DeepNote PWA
const CACHE_NAME = 'deepnote-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Installation du service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
  // Force l'activation immédiate
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Prendre contrôle immédiatement de toutes les pages
  self.clients.claim();
});

// Intercepter les requêtes réseau
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retourner la réponse du cache
        if (response) {
          return response;
        }
        
        // Cloner la requête
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Vérifier si la réponse est valide
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cloner la réponse
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Ne pas mettre en cache les requêtes avec des paramètres query
                if (!event.request.url.includes('?')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        ).catch(() => {
          // En cas d'erreur réseau, essayer de servir la page d'accueil pour les requêtes de navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Hors ligne, contenu non disponible', {
            status: 503,
            statusText: 'Service indisponible'
          });
        });
      })
  );
});
