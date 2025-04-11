
const CACHE_NAME = 'notes-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Stratégie de mise en cache "Network first, fallback to cache"
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la requête réussit, mettre en cache la réponse
        if (event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Si la requête échoue, servir depuis le cache
        return caches.match(event.request);
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
  // Récupérer les données en attente de synchronisation
  const dataToSync = await getUnsynedData();
  
  if (dataToSync && dataToSync.length) {
    try {
      // Logique de synchronisation
      const syncPromises = dataToSync.map(item => {
        // Exemple de logique de synchronisation
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
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
    }
  }
};

// Fonction fictive pour obtenir les données non synchronisées
const getUnsynedData = async () => {
  // Dans une implémentation réelle, cela pourrait venir d'IndexedDB
  return [];
};

// Fonction fictive pour marquer les données comme synchronisées
const markAsSynced = async (data) => {
  // Dans une implémentation réelle, mettre à jour IndexedDB
};
