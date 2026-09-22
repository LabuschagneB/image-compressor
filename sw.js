const CACHE_NAME = 'static-cache-v1';

// 1. List all the static files you want to work offline
const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  'custom.min.css',
  'sw.js',
  'manifest.json',
  'icons512_maskable.png',
  'jszip.min.js',
  'favicon.png',
  '1024.png',
  'mobile-home.png',
  'desktop-home.png',
  'icons512_rounded.png'
];

// 2. Install Event: Saves your static assets to the browser cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Forces the waiting service worker to become active
});

// 3. Activate Event: Cleans up old caches if you update CACHE_NAME
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 4. Fetch Event: Serves files from cache if offline; falls back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return from cache
      }
      return fetch(event.request); // Fetch from network
    })
  );
});