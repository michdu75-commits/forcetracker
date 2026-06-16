const CACHE = 'ft-v3';
const PRECACHE = ['./', './index.html', './manifest.json', './logo.png', './female-body.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Requêtes externes (Apps Script, Google Fonts, etc.) : réseau uniquement
  if (url.origin !== self.location.origin) return;

  // Navigation HTML : réseau d'abord → toujours la dernière version
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          if (r && r.status === 200) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        })
        .catch(() => caches.match(e.request).then(c => c || caches.match('./')))
    );
    return;
  }

  // Assets locaux (images, etc.) : cache d'abord, réseau en fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r && r.status === 200) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        return r;
      });
    })
  );
});
