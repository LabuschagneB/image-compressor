const CACHE_NAME = 'static-cache-v1.24414';

const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  'custom.min.css',
  'sw.js',
  'script.js',
  'manifest.json',
  'icons512_maskable.png',
  'jszip.min.js',
  'favicon.png',
  '1024.png',
  'mobile-home.png',
  'desktop-home.png',
  'icons512_rounded.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});