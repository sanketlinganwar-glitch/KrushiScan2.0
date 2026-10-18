// KrushiScan AI - Enhanced PWA Service Worker (v2.1)
// Caches essential static assets & verified knowledge.
// Strictly avoids caching sensitive auth tokens, API keys, or POST scans.

const CACHE_NAME = 'krushiscan-v2.1-cache';
const STATIC_ASSETS = [
  './',
  './index.html',
  './logo.svg',
  './favicon.svg',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Navigation requests: Network first, fallback to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => {
        return caches.match('./index.html') || caches.match('./');
      })
    );
    return;
  }

  // 2. Sensitive endpoints & Non-GET requests: NEVER CACHE IN SERVICE WORKER
  // Avoid caching tokens, passwords, private diagnosis images, or mutations
  if (
    req.method !== 'GET' ||
    req.headers.has('Authorization') ||
    url.pathname.includes('/api/auth') ||
    url.pathname.includes('/api/ai/scan') ||
    url.pathname.includes('/api/orders') ||
    url.pathname.includes('/api/payments')
  ) {
    // Pure network pass-through
    event.respondWith(fetch(req));
    return;
  }

  // 3. Public weather & mandi GET APIs: Network first with safe cached fallback
  if (url.origin.includes('open-meteo.com') || url.pathname.includes('/api/weather') || url.pathname.includes('/api/mandi')) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 4. Static assets (JS, CSS, SVGs, Fonts): Stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
