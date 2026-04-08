// ── Supernova: Infinity — Service Worker ──────────────────────────────────────
// Strategy: Cache-first for all listed assets (offline play after first load).
// Bump CACHE_NAME whenever you deploy a new version of the game so players
// get fresh files rather than a stale cached copy.
const CACHE_NAME = 'supernova-v12';

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

// ── Fetch: serve from cache, fall back to network ─────────────────────────────
self.addEventListener('fetch', event => {
  // Only handle GET requests — skip POST etc.
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          return cached; // serve from cache (works offline)
        }
        // Not in cache — fetch from network and cache the response
        return fetch(event.request)
          .then(networkResponse => {
            // Only cache valid responses (not errors, not opaque cross-origin)
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
            // Network failed and nothing in cache — nothing we can do
            console.warn('[SW] Fetch failed, no cache available for:', event.request.url);
          });
      })
  );
});
