/**
 * SpendPulse - Modern Offline-First Service Worker
 * Version: 1.0.0
 */

const PRECACHE_NAME = 'spendpulse-precache-v1.0.0';
const RUNTIME_NAME = 'spendpulse-runtime-v1.0.0';

// Core local assets required for the app shell
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './manifest.json',
  './css/custom.css',
  './js/storage.js',
  './js/charts.js',
  './js/ui.js',
  './js/app.js',
  './js/pwa.js',
  './assets/favicon.svg',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-192.png',
  './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon.png',
  './assests/favicon.svg'
];

// Domains eligible for runtime caching (CDNs & Google Fonts)
const CDN_ORIGINS = [
  'cdn.tailwindcss.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME).then((cache) => {
      // Use map to allow individual assets to fail without halting the entire installation
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn(`[SW] Precache item failed: ${url}`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

/**
 * Service Worker Activation & Cache Cleanup
 */
self.addEventListener('activate', (event) => {
  const currentCaches = [PRECACHE_NAME, RUNTIME_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log(`[SW] Purging outdated cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * Service Worker Fetch Interceptor
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET and chrome extension / browser specific requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (HTML document)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(PRECACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          // Fallback to cached index.html or root
          const cached = await caches.match(request);
          if (cached) return cached;
          const rootCached = await caches.match('./index.html') || await caches.match('./');
          if (rootCached) return rootCached;
          return new Response('Offline - SpendPulse app shell unavailable.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
    return;
  }

  // 2. Local Same-Origin Assets (CSS, JS, SVGs, PNGs)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Stale-while-revalidate in background
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(PRECACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {/* Ignore network error when offline */});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(PRECACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. External CDNs (Tailwind, Lucide, Chart.js, Google Fonts)
  if (CDN_ORIGINS.some((origin) => url.hostname.includes(origin))) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          // Opaque responses have status 0, valid CDN responses have 200
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const clone = networkResponse.clone();
            caches.open(RUNTIME_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        }).catch(() => {
          // In case network fails and no cached response
          return cachedResponse;
        });

        // Cache first, fall back to network fetch
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Default strategy for other requests: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(RUNTIME_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || networkFetch;
    })
  );
});

/**
 * Handle incoming messages from the client
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
