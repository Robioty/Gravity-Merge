// ── Supernova: Infinity — Service Worker ──────────────────────────────────────
// Strategy: Cache-first for all listed assets (offline play after first load).
// ★ IMPORTANT: Bump CACHE_NAME every time you deploy a new version of the game.
// The activate event deletes all caches that don't match CACHE_NAME, forcing
// players to get fresh files on their next visit.
const CACHE_NAME = 'supernova-v14';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js'
];

// ── Install: pre-cache all assets ─────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching Supernova assets…');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // activate immediately, don't wait for old SW to die
  );
});

// ── Activate: delete any old cache versions ───────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim()) // take control of open pages immediately
  );
});

// ── Fetch: network-first for HTML, cache-first for everything else ────────────
self.addEventListener('fetch', event => {
  // Only handle GET requests — skip POST etc.
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isHTML = url.pathname.endsWith('.html') || url.pathname.endsWith('/');

  if (isHTML) {
    // Network-first for HTML: always try to get the latest index.html.
    // Falls back to cache only if completely offline.
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const toCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first for all other assets (JS libs, icons, manifest).
    event.respondWith(
      caches.match(event.request)
        .then(cached => {
          if (cached) {
            return cached;
          }
          return fetch(event.request)
            .then(networkResponse => {
              if (
                networkResponse &&
                networkResponse.status === 200 &&
                networkResponse.type !== 'opaque'
              ) {
                const toCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
              }
              return networkResponse;
            })
            .catch(() => {
              console.warn('[SW] Fetch failed, no cache available for:', event.request.url);
            });
        })
    );
  }
});
