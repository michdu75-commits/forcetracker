const CACHE = 'ft-v9';
const PRECACHE = [
  './', './index.html', './manifest.json', './logo.png', './female-body.png',
  // Muscles SVG
  './muscles/abs.svg','./muscles/arms.svg','./muscles/back.svg','./muscles/calves.svg',
  './muscles/chest.svg','./muscles/glutes.svg','./muscles/legs.svg','./muscles/shoulders.svg',
  // GIFs exercices pectoraux + fessiers
  './exercises/developpe-couche.gif',
  './exercises/developpe-couche-halteres-exercice-musculation.gif',
  './exercises/developpe-couche-smith-machine.gif',
  './exercises/developpe-decline-barre.gif',
  './exercises/developpe-incline-barre.gif',
  './exercises/ecarte-poulie-vis-a-vis-exercice-musculation-pectoraux.gif',
  './exercises/ecartes-decline-avec-halteres.gif',
  './exercises/pec-deck-butterfly-exercice-musculation.gif',
  './exercises/glute-bridge.webp',
  // Images machines press jambes
  './machine/press-jambes-1.png','./machine/press-jambes-2.jpg','./machine/press-jambes-3.jpg',
  './machine/press-jambes-4.jpg','./machine/press-jambes-5.jpg','./machine/press-jambes-6.jpg',
];

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

  // logo.png : réseau d'abord (toujours à jour), cache en fallback offline
  if (url.pathname.endsWith('/logo.png')) {
    e.respondWith(
      fetch(e.request).then(r => {
        if (r && r.status === 200) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Autres assets locaux : cache d'abord, réseau en fallback
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
