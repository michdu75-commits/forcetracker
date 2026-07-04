const CACHE = 'ft-v208'; // Verrou admin (email + code secours) + Modifier un exercice perso (nom/groupe/muscles sans perte d'historique)
const PRECACHE = [
  './', './index.html', './style.css',
  './constants.js', './state.js', './screens.js', './log.js',
  './setup.js', './tracking.js', './coach.js', './app.js',
  './manifest.json', './logo.png', './female-body.png',
  // Polices (hébergées localement — plus de dépendance Google Fonts)
  './fonts/manrope-variable.woff2', './fonts/spacegrotesk-variable.woff2', './fonts/pacifico-400.woff2',
  './force-tracker-logo-splash.gif', './force-tracker-logo-topbar.gif', './force-tracker-logo-final.png',
  // Muscles SVG + PNG
  './muscles/abs.svg','./muscles/arms.svg','./muscles/back.svg','./muscles/calves.svg',
  './muscles/chest.svg','./muscles/glutes.svg','./muscles/legs.svg','./muscles/shoulders.svg',
  // Icônes muscle réalistes (vignettes programme + picker)
  './muscles/muscle pectoreaux.png','./muscles/muscles dorsaux trapeze.png','./muscles/epaule trapeze.png',
  './muscles/muscle bras.png','./muscles/muscle avant cuisse.png','./muscles/fessiers ischios.png',
  './muscles/muscle abdominaux.png','./muscles/muscle mollet.png',
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
  // Anatomie
  './anatomy/corps entier/schema homme entier face avant arriere et côté.png',
  './anatomy/pectoreaux/schema pectoreaux.png',
  './anatomy/dos_dorsaux/schema dorsaux arriere + trapeze.png',
  './anatomy/epaules/schéma epaule arriere.png',
  './anatomy/bras biceps triceps/schema muscles bras et avant bras.png',
  './anatomy/abdominaux/schema abdominaux.png',
  './anatomy/jambes/jambes avant/jambes face avant.png',
  './anatomy/jambes/jambes arrieres mollets/arriere cuisses mollets.png',
  './anatomy/fessiers lombaires/schema lombaires fessiers.png',
  './anatomy/Vue des Nerfs/vue nerf.png',
  './anatomy/Vue des Os avec nerfs sciatiques/os et nerfs.png',
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
      .then(() => self.clients.matchAll({includeUncontrolled:true}).then(clients =>
        clients.forEach(c => c.postMessage({type:'SW_UPDATED'}))
      ))
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Requêtes externes (Apps Script, Google Fonts, etc.) : réseau uniquement
  if (url.origin !== self.location.origin) return;

  // Navigation HTML : cache d'abord (instantané) + mise à jour silencieuse en fond
  // → ouverture immédiate depuis le cache même sans réseau ou réseau lent
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        // Revalidation en arrière-plan — met à jour le cache pour la prochaine ouverture
        const netFetch = fetch(e.request).then(r => {
          if (r && r.status === 200) {
            const cl = r.clone();
            caches.open(CACHE).then(c => c.put(e.request, cl));
          }
          return r;
        }).catch(() => null);
        // Cache dispo → affiche immédiatement, réseau en fond
        if (cached) { netFetch.catch(() => {}); return cached; }
        // Pas de cache (1re installation) → attend le réseau
        return netFetch.then(r => r || caches.match('./'));
      })
    );
    return;
  }

  // logo.png : réseau d'abord (toujours à jour), cache en fallback offline
  if (url.pathname.endsWith('/logo.png')) {
    e.respondWith(
      fetch(e.request).then(r => {
        if (r && r.status === 200) { const cl=r.clone(); caches.open(CACHE).then(c => c.put(e.request, cl)); }
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
        if (r && r.status === 200) { const cl=r.clone(); caches.open(CACHE).then(c => c.put(e.request, cl)); }
        return r;
      });
    })
  );
});
