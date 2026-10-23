// VokabelGo Service Worker — bản cơ bản, thận trọng:
// - Điều hướng (HTML): network-first, rớt mạng thì dùng bản cache gần nhất.
// - Tài nguyên tĩnh (CSS/JS/ảnh/font): stale-while-revalidate.
// - Media (mp4/mp3...) và API: luôn qua mạng, không cache (Range/streaming).
const CACHE_NAME = 'vokabelgo-shell-v1';
const PRECACHE = [
  './',
  './index.html',
  './games.html',
  './teach-me.html',
  './app-shell.css',
  './teach-me.css',
  './teach-me.js',
  './deep-links.js',
  './tts-de.js',
  './img/avatars/v2/cat_12.png',
  './img/icons/app-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (/\.(mp4|webm|mp3|m4a|ogg|wav)$/i.test(url.pathname)) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
