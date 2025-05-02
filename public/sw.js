
const CACHE_NAME = 'deepnote-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico',
  '/assets/index.css',
  '/assets/index.js'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation');
  
  // Forcer l'attente jusqu'à ce que la promesse soit résolue
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Mise en cache des fichiers');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Tous les fichiers sont en cache');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Erreur de mise en cache', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation');
  
  // Supprimer les anciens caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression de l\'ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker: Réclamation des clients');
      return self.clients.claim();
    })
  );
});

// Stratégie de cache: Cache First, falling back to network
self.addEventListener('fetch', (event) => {
  // Ne pas intercepter les requêtes vers des API
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('googleapis.com') || 
      event.request.url.includes('openai.com')) {
    return;
  }
  
  // Ne pas intercepter les requêtes non GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  console.log('Service Worker: Récupération', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Retourner le cache si disponible
        if (cachedResponse) {
          // En arrière-plan, mettre à jour le cache avec la nouvelle version
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                const clonedResponse = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, clonedResponse);
                  });
              }
            })
            .catch(() => {
              // Ne rien faire si la mise à jour échoue
            });
            
          return cachedResponse;
        }
        
        // Sinon, aller sur le réseau
        return fetch(event.request)
          .then((networkResponse) => {
            // Vérifier si la requête a réussi
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Cloner la réponse pour le cache et le client
            const responseToCache = networkResponse.clone();
            
            // Ajouter au cache
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return networkResponse;
          })
          .catch(() => {
            // En cas d'erreur réseau pour une page HTML, retourner la page d'accueil
            if (event.request.headers.get('accept') && 
                event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/');
            }
            
            return new Response('Contenu indisponible hors-ligne', { 
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Gestion des messages pour la mise à jour du Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Notification de mise à jour disponible
self.addEventListener('statechange', () => {
  if (self.state === 'installed' && self.clients) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE'
        });
      });
    });
  }
});
