/**
 * TDD CYCLE 6 - GREEN PHASE
 * Service Worker pour fonctionnalités PWA
 */

const CACHE_NAME = 'dialect-game-v1.0.0'
const STATIC_CACHE = 'dialect-game-static-v1'
const DYNAMIC_CACHE = 'dialect-game-dynamic-v1'

// Ressources à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html'
]

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Skip waiting')
        return self.skipWaiting()
      })
  )
})

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Claiming clients')
        return self.clients.claim()
      })
  )
})

// Stratégie de cache : Cache First pour les assets statiques, Network First pour les données
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return
  }
  
  // Stratégie pour les assets statiques
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(cacheFirst(request))
  }
  // Stratégie pour les APIs
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
  }
  // Stratégie pour les pages
  else {
    event.respondWith(staleWhileRevalidate(request))
  }
})

// Cache First Strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    const cache = await caches.open(DYNAMIC_CACHE)
    cache.put(request, networkResponse.clone())
    
    return networkResponse
  } catch (error) {
    console.log('Cache First failed:', error)
    return new Response('Offline content not available', { status: 503 })
  }
}

// Network First Strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network First fallback to cache:', error)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    return new Response(JSON.stringify({ 
      error: 'Offline - data not available',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    })
    .catch(() => cachedResponse)
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse
  }
  
  // Otherwise wait for network
  return fetchPromise
}

// Background Sync pour les données hors ligne
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync', event.tag)
  
  if (event.tag === 'background-sync-progress') {
    event.waitUntil(syncProgressData())
  }
})

async function syncProgressData() {
  try {
    // Récupérer les données hors ligne
    const offlineData = await getOfflineProgressData()
    
    if (offlineData.length > 0) {
      // Synchroniser avec le serveur
      await fetch('/api/sync-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offlineData)
      })
      
      // Nettoyer les données hors ligne
      await clearOfflineProgressData()
      console.log('Progress data synced successfully')
    }
  } catch (error) {
    console.log('Background sync failed:', error)
  }
}

async function getOfflineProgressData() {
  // Simuler récupération données hors ligne
  const stored = localStorage.getItem('offline-progress')
  return stored ? JSON.parse(stored) : []
}

async function clearOfflineProgressData() {
  localStorage.removeItem('offline-progress')
}

// Push Notifications
self.addEventListener('push', event => {
  console.log('Service Worker: Push received', event)
  
  const options = {
    body: event.data ? event.data.text() : 'New content available!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Dialect Game', options)
  )
})

// Notification Click Handler
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked', event)
  
  event.notification.close()
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    )
  }
})

// Message Handler pour communication avec l'app
self.addEventListener('message', event => {
  console.log('Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

// Gestion des erreurs
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error)
})

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason)
})

console.log('Service Worker: Loaded successfully')