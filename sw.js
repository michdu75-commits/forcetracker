const CACHE = 'ft-v217'; // Figurines Abduction + Adduction Cuisses (les 2 dernières machines manquantes des Jambes)
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
  './exercises/developpe-incline-halteres-exercice-musculation.gif',
  './exercises/ecartes-poulie-vis-a-vis.gif',
  './exercises/developpe-machine-assis-pectoraux.gif',
  './exercises/developpe-incline-machine-convergente-exercice-musculation.gif',
  './exercises/dips-pectoraux.gif',
  './exercises/glute-bridge.webp',
  // Fessiers / Ischios / Jambes / Soulevés de terre
  './exercises/souleve-de-terre.gif','./exercises/souleve-de-terre-sumo.gif','./exercises/rack-pull.gif',
  './exercises/good-morning-exercice.gif','./exercises/extension-lombaire-au-banc-45.gif',
  './exercises/homme-faisant-un-squat-avec-barre.gif','./exercises/front-squat-avec-halteres.gif',
  './exercises/squat-goblet-kettlebell.gif','./exercises/squat-sumo-avec-haltere.gif','./exercises/fente-avant-barre-femme.gif',
  './exercises/leg-curl-allonge.gif','./exercises/leg-curl-assis-machine.gif',
  './exercises/souleve-de-terre-jambes-tendues.gif','./exercises/souleve-de-terre-roumain-kettlebell.gif','./exercises/souleve-de-terre-roumain-landmine.gif',
  './exercises/deadlift-sumo-halteres-exercice-jambes-fessiers.gif','./exercises/souleve-de-terre-sumo-kettlebell.gif','./exercises/souleve-de-terre-sumo-landmine.gif',
  './exercises/souleve-de-terre-a-la-trap-bar.gif','./exercises/souleve-de-terre-avec-deficit.gif','./exercises/souleve-de-terre-avec-machine.gif',
  './exercises/zercher-deadlift.gif','./exercises/reeves-deadlift.gif','./exercises/glute-ham-developer-ghd.gif','./exercises/kettlebell-swing.gif',
  './exercises/squat-pistol.gif','./exercises/kettlebell-back-squat.gif','./exercises/fentes-avant-kettlebell.gif',
  './exercises/leg-curl-avec-elastique-musculation.gif','./exercises/leg-curl-decline-haltere.gif','./exercises/leg-curl-inverse-machine-tirage-vertical.gif','./exercises/leg-curl-unilateral-debout-machine.gif',
  // Dos / Trapèzes / Lombaires
  './exercises/rowing-barre.gif','./exercises/rowing-haltere-un-bras.gif','./exercises/tirage-horizontal-poulie.gif',
  './exercises/rowing-assis-machine-prise-pronation.gif','./exercises/rowing-assis-machine-hammer-strenght.gif','./exercises/rowing-halteres-banc-incline-prise-neutre.gif',
  './exercises/tirage-vertical-poitrine.gif','./exercises/tirage-vertical-prise-serree.gif','./exercises/tirage-horizontal-prise-large.gif',
  './exercises/traction-musculation-dos.gif','./exercises/traction-assistee-machine.gif','./exercises/traction-prise-neutre.gif',
  './exercises/pullover-haltere.gif','./exercises/musculation-pull-over-assis-machine.gif',
  './exercises/shrug-barre.gif','./exercises/shrugs-avec-halteres.gif','./exercises/shrug-poulie-haussement-epaules.gif',
  './exercises/extension-lombaire-a-la-machine.gif',
  './exercises/rowing-smith-machine.gif','./exercises/rowing-t-bar-machine.gif','./exercises/rowing-barre-t-landmine.gif',
  './exercises/bent-over-row-avec-halteres.gif','./exercises/rowing-unilateral-landmine-meadows-row.gif','./exercises/seal-row-halteres.gif','./exercises/renegade-row.gif',
  './exercises/tirage-avant-iso-laterale-hammer-strength.gif','./exercises/tirage-incline-poulie-haute.gif','./exercises/tirage-vertical-prise-inversee.gif',
  './exercises/traction-barre-derriere-rear-oull-up.gif','./exercises/rocky-pull-up.gif','./exercises/sled-pull.gif',
  './exercises/pull-over-barre.gif','./exercises/pull-over-poulie.gif','./exercises/superman.gif','./exercises/overhead-shrug.gif',
  // Cuisses / Quadriceps
  './exercises/squat-bulgare-halteres-exercice-musculation.gif','./exercises/squat-smith-machine-exercice-musculation.gif','./exercises/leg-extension-exercice-musculation.gif',
  './exercises/fentes-marchees-avec-sandbag.gif','./exercises/split-squat-smith-machine.gif','./exercises/hip-thrust-a-la-machine.gif','./exercises/marche-du-fermier-avec-kettlebells.gif',
  './exercises/leg-extension-iso-lateral-unilateral-hammer-strenght.gif','./exercises/hack-squat-inverse.gif','./exercises/pendulum-squat.gif','./exercises/belt-squat.gif','./exercises/safety-bar-squat.gif',
  './exercises/overhead-squat.gif','./exercises/pin-squat.gif','./exercises/sissy-squat.gif','./exercises/cossack-squat.gif','./exercises/squat-bande-elastique.gif',
  './exercises/squat-statique-contre-mur-exercice-chaise.gif','./exercises/presse-cuisse-iso-laterale-hammer-stenght.gif','./exercises/sled-push-hyrox.gif','./exercises/croix-de-fer-halteres.gif',
  './exercises/leg-abduction-machine.gif','./exercises/leg-adduction-machine.gif',
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
