/* sw.js — Service Worker for offline support
   Strategy:
   - App shell (HTML, CSS, local JS, images) → stale-while-revalidate
   - CDN scripts (React, Supabase, Lucide) → cache-first
   - Supabase REST / Auth API → network-only (user data must be fresh)
   - Supabase Storage images → cache-first (static assets)

   !! WAJIB UPDATE SETIAP DEPLOY !!
   Ganti tanggal di CACHE setiap kali ada perubahan pada js/, css/, atau data.js.
   Format: 'arabiyya-YYYYMMDD'  → contoh deploy besok: 'arabiyya-20260620'
   Jika lupa, pengguna lama akan tetap mendapat file lama dari cache browser.
*/

const CACHE = 'arabiyya-20260620a';

/* Minimum files to pre-cache on install so the app loads offline immediately */
const APP_SHELL = [
  './',
  './css/base.css',
  './css/dark.css',
  './css/tokens.css',
  './dist/js/data.js',
  './assets/images/logo-mark.svg',
];

/* ── Install: pre-cache the app shell ───────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_SHELL))
      .catch(() => { /* non-fatal: some files may not exist yet */ })
  );
  self.skipWaiting();
});

/* ── Activate: delete old cache versions ────────────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ── Fetch: routing logic ────────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  /* Supabase REST + Auth → network only (skip; let it fail offline gracefully) */
  if (
    url.hostname.includes('supabase.co') &&
    (url.pathname.startsWith('/rest/') || url.pathname.startsWith('/auth/'))
  ) return;

  /* CDN scripts and Supabase Storage → cache-first (immutable once cached) */
  if (
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    (url.hostname.includes('supabase.co') && url.pathname.startsWith('/storage/'))
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  /* Same-origin local files → stale-while-revalidate */
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }
});

/* ── Strategies ──────────────────────────────────────────────────────────── */

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache  = await caches.open(CACHE);
  const cached = await cache.match(request);

  /* Always try to refresh in the background */
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  /* Return cached instantly if available; otherwise wait for network */
  return cached || await fetchPromise || new Response('', { status: 503 });
}
