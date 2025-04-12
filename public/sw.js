
const CACHE_NAME = 'deepnote-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
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

// Stratégie de cache: Network First, falling back to cache
self.addEventListener('fetch', (event) => {
  // Ne pas intercepter les requêtes vers des API
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // Ne pas intercepter les requêtes non GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  console.log('Service Worker: Récupération', event.request.url);
  
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cloner la réponse, car elle ne peut être consommée qu'une fois
        const clonedResponse = networkResponse.clone();
        
        // Mettre en cache la nouvelle réponse
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          
        return networkResponse;
      })
      .catch(() => {
        console.log('Service Worker: Utilisation du cache pour', event.request.url);
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            
            // Si la ressource n'est pas dans le cache et que c'est une page HTML
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/');
            }
            
            return new Response('Not found', { status: 404 });
          });
      })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

// Fonction pour synchroniser les notes avec le serveur
const syncNotes = async () => {
  try {
    // Récupérer les données en attente de synchronisation
    const dataToSync = await getUnsynedData();
    
    if (dataToSync && dataToSync.length) {
      // Synchroniser chaque note
      const syncPromises = dataToSync.map(item => {
        return fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(item)
        });
      });
      
      await Promise.all(syncPromises);
      
      // Marquer les données comme synchronisées
      await markAsSynced(dataToSync);
      
      // Notifier les clients
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETED',
          count: dataToSync.length
        });
      });
    }
  } catch (error) {
    console.error('Service Worker: Erreur de synchronisation', error);
  }
};

// Fonction pour obtenir les données non synchronisées
const getUnsynedData = async () => {
  // Dans une implémentation réelle, cela pourrait venir d'IndexedDB
  return [];
};

// Fonction pour marquer les données comme synchronisées
const markAsSynced = async (data) => {
  // Dans une implémentation réelle, mettre à jour IndexedDB
};

// Notification de mise à jour disponible
self.addEventListener('updatefound', () => {
  const newWorker = self.installing;

  newWorker.addEventListener('statechange', () => {
    if (newWorker.state === 'installed' && self.clients) {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'UPDATE_AVAILABLE'
          });
        });
      });
    }
  });
});
