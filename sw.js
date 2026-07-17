const CACHE = 'ft-v445'; // Suppression aussi pour l'Étude du corps (bilan cloud) : bouton corbeille dans l'historique (deleteBodyStudy) — retire du téléphone + cloud.
const PRECACHE = [
  './', './index.html', './style.css', './confidentialite.html',
  './constants.js', './state.js', './screens.js', './log.js',
  './setup.js', './tracking.js', './coach.js', './app.js', './food-health.js',
  './manifest.json', './logo.png', './female-body.png',
  // Librairie PDF (hébergée en local pour marcher hors-ligne — chargée à la demande)
  './lib/jspdf.umd.min.js', './lib/jspdf.plugin.autotable.min.js',
  // Lecteur Excel (SheetJS, local) — import de fichiers balance .xlsx/.xls, chargé à la demande
  './lib/xlsx.full.min.js',
  // Lecteur code-barres (ZXing, local) — scan produit dans le journal alimentaire, chargé à la demande
  './lib/zxing.min.js',
  // Polices (hébergées localement — plus de dépendance Google Fonts)
  './fonts/manrope-variable.woff2', './fonts/spacegrotesk-variable.woff2', './fonts/pacifico-400.woff2',
  './force-tracker-logo-gray.png', './force-tracker-logo-splash.gif', './force-tracker-logo-topbar.gif', './force-tracker-logo-final.png',
  // Captures d'écran du guide-film (Menu → Guide de l'application)
  './guide/home.jpg','./guide/profil.jpg','./guide/seance.jpg',
  './guide/programmes.jpg','./guide/progres.jpg','./guide/bilan.jpg','./guide/coach.jpg',
  // Photos accessoires (Guide de la muscu → Matériel) — les fichiers absents ne sont PAS listés ici (sinon l'install du SW échoue)
  './accessoires/ceinture-souple.jpg','./accessoires/ceinture-cuir-levier.jpg','./accessoires/ceinture-cuir-ardillon.jpg',
  './accessoires/sangles.jpg','./accessoires/genouilleres.jpg','./accessoires/chaussures.jpg',
  './accessoires/wrist-wraps.jpg','./accessoires/magnesie-bloc.jpg','./accessoires/magnesie-liquide.jpg',
  // Muscles SVG + PNG
  './muscles/abs.svg','./muscles/arms.svg','./muscles/back.svg','./muscles/calves.svg',
  './muscles/chest.svg','./muscles/glutes.svg','./muscles/legs.svg','./muscles/shoulders.svg',
  // Icônes muscle réalistes (vignettes programme + picker)
  './muscles/muscle pectoreaux.png','./muscles/muscles dorsaux trapeze.png','./muscles/epaule trapeze.png',
  './muscles/muscle bras.png','./muscles/muscle avant cuisse.png','./muscles/fessiers ischios.png',
  './muscles/muscle abdominaux.png','./muscles/muscle mollet.png',
  // GIFs exercices pectoraux + fessiers
  './exercises/developpe-couche.webp',
  './exercises/developpe-couche-halteres-exercice-musculation.webp',
  './exercises/developpe-couche-smith-machine.webp',
  './exercises/developpe-decline-barre.webp',
  './exercises/developpe-incline-barre.webp',
  './exercises/ecarte-poulie-vis-a-vis-exercice-musculation-pectoraux.webp',
  './exercises/ecartes-decline-avec-halteres.webp',
  './exercises/pec-deck-butterfly-exercice-musculation.webp',
  './exercises/developpe-incline-halteres-exercice-musculation.webp',
  './exercises/ecartes-poulie-vis-a-vis.webp',
  './exercises/developpe-machine-assis-pectoraux.webp',
  './exercises/developpe-incline-machine-convergente-exercice-musculation.webp',
  './exercises/dips-pectoraux.webp',
  './exercises/glute-bridge.webp',
  // Fessiers / Ischios / Jambes / Soulevés de terre
  './exercises/souleve-de-terre.webp','./exercises/souleve-de-terre-sumo.webp','./exercises/rack-pull.webp',
  './exercises/good-morning-exercice.webp','./exercises/extension-lombaire-au-banc-45.webp',
  './exercises/homme-faisant-un-squat-avec-barre.webp','./exercises/front-squat-avec-halteres.webp',
  './exercises/squat-goblet-kettlebell.webp','./exercises/squat-sumo-avec-haltere.webp','./exercises/fente-avant-barre-femme.webp',
  './exercises/leg-curl-allonge.webp','./exercises/leg-curl-assis-machine.webp',
  './exercises/souleve-de-terre-jambes-tendues.webp','./exercises/souleve-de-terre-roumain-kettlebell.webp','./exercises/souleve-de-terre-roumain-landmine.webp',
  './exercises/deadlift-sumo-halteres-exercice-jambes-fessiers.webp','./exercises/souleve-de-terre-sumo-kettlebell.webp','./exercises/souleve-de-terre-sumo-landmine.webp',
  './exercises/souleve-de-terre-a-la-trap-bar.webp','./exercises/souleve-de-terre-avec-deficit.webp','./exercises/souleve-de-terre-avec-machine.webp',
  './exercises/zercher-deadlift.webp','./exercises/reeves-deadlift.webp','./exercises/glute-ham-developer-ghd.webp','./exercises/kettlebell-swing.webp',
  './exercises/squat-pistol.webp','./exercises/kettlebell-back-squat.webp','./exercises/fentes-avant-kettlebell.webp',
  './exercises/leg-curl-avec-elastique-musculation.webp','./exercises/leg-curl-decline-haltere.webp','./exercises/leg-curl-inverse-machine-tirage-vertical.webp','./exercises/leg-curl-unilateral-debout-machine.webp',
  // Dos / Trapèzes / Lombaires
  './exercises/rowing-barre.webp','./exercises/rowing-haltere-un-bras.webp','./exercises/tirage-horizontal-poulie.webp',
  './exercises/rowing-assis-machine-prise-pronation.webp','./exercises/rowing-assis-machine-hammer-strenght.webp','./exercises/rowing-halteres-banc-incline-prise-neutre.webp',
  './exercises/tirage-vertical-poitrine.webp','./exercises/tirage-vertical-prise-serree.webp','./exercises/tirage-horizontal-prise-large.webp',
  './exercises/traction-musculation-dos.webp','./exercises/traction-assistee-machine.webp','./exercises/traction-prise-neutre.webp',
  './exercises/pullover-haltere.webp','./exercises/musculation-pull-over-assis-machine.webp',
  './exercises/shrug-barre.webp','./exercises/shrugs-avec-halteres.webp','./exercises/shrug-poulie-haussement-epaules.webp',
  './exercises/extension-lombaire-a-la-machine.webp',
  './exercises/rowing-smith-machine.webp','./exercises/rowing-t-bar-machine.webp','./exercises/rowing-barre-t-landmine.webp',
  './exercises/bent-over-row-avec-halteres.webp','./exercises/rowing-unilateral-landmine-meadows-row.webp','./exercises/seal-row-halteres.webp','./exercises/renegade-row.webp',
  './exercises/tirage-avant-iso-laterale-hammer-strength.webp','./exercises/tirage-incline-poulie-haute.webp','./exercises/tirage-vertical-prise-inversee.webp',
  './exercises/traction-barre-derriere-rear-oull-up.webp','./exercises/rocky-pull-up.webp','./exercises/sled-pull.webp',
  './exercises/pull-over-barre.webp','./exercises/pull-over-poulie.webp','./exercises/superman.webp','./exercises/overhead-shrug.webp',
  // Cuisses / Quadriceps
  './exercises/squat-bulgare-halteres-exercice-musculation.webp','./exercises/squat-smith-machine-exercice-musculation.webp','./exercises/leg-extension-exercice-musculation.webp',
  './exercises/fentes-marchees-avec-sandbag.webp','./exercises/split-squat-smith-machine.webp','./exercises/hip-thrust-a-la-machine.webp','./exercises/marche-du-fermier-avec-kettlebells.webp',
  './exercises/leg-extension-iso-lateral-unilateral-hammer-strenght.webp','./exercises/hack-squat-inverse.webp','./exercises/pendulum-squat.webp','./exercises/belt-squat.webp','./exercises/safety-bar-squat.webp',
  './exercises/overhead-squat.webp','./exercises/pin-squat.webp','./exercises/sissy-squat.webp','./exercises/cossack-squat.webp','./exercises/squat-bande-elastique.webp',
  './exercises/squat-statique-contre-mur-exercice-chaise.webp','./exercises/presse-cuisse-iso-laterale-hammer-stenght.webp','./exercises/sled-push-hyrox.webp','./exercises/croix-de-fer-halteres.webp',
  './exercises/leg-abduction-machine.webp','./exercises/leg-adduction-machine.webp',
  './exercises/chest-press-machine-declinee.webp','./exercises/dips-triceps-paralleles.webp','./exercises/montees-banc-lateral-halteres.webp',
  './exercises/dips-assiste-machine.webp','./exercises/developpe-nuque-barre-guidee.webp',
  './exercises/dips-assis-machine-avec-poids.webp',
  // Épaules + Trapèzes (lot 2026-07-06)
  './exercises/developpe-arnold-exercice-musculation.webp','./exercises/developpe-epaule-halteres.webp','./exercises/developpe-militaire-exercice-musculation.webp',
  './exercises/elevation-laterale-machine.webp','./exercises/elevations-frontales-exercice-musculation.webp','./exercises/elevations-laterales-exercice-musculation.webp',
  './exercises/elevations-laterales-poulie.webp','./exercises/face-pull.webp','./exercises/pec-deck-inverse.webp',
  './exercises/presse-epaule-exercice-musculation.webp','./exercises/elevation-en-y-a-la-poulie.webp','./exercises/oiseau-assis-sur-banc.webp',
  './exercises/tirage-menton-machine-guidee.webp','./exercises/tirage-menton-avec-kettlebell.webp','./exercises/developpe-epaule-avec-kettlebell.webp',
  './exercises/developpe-landmine.webp','./exercises/ecarte-arriere-elastique.webp','./exercises/elevation-frontale-allongee-a-la-barre.webp',
  './exercises/elevation-laterale-a-la-poulie-en-inclinaison.webp','./exercises/elevation-laterale-landmine-exercice-musculation.webp','./exercises/elevation-laterales-avec-kettlebell.webp',
  './exercises/exercice-rotation-interne-epaule-elastique-renforcement-coiffe-rotateurs-prevention-blessures-musculation.webp','./exercises/face-pull-couche-a-la-poulie.webp','./exercises/oiseau-a-la-poulie-a-45.webp',
  './exercises/passage-depaule-avec-elastique.webp','./exercises/rotation-externe-de-epaule-en-abduction.webp','./exercises/rotation-externe-epaule-exercice-renforcement-elastique.webp',
  './exercises/rotation-interne-a-90-a-la-poulie.webp',
  // Épaules + Trapèzes — 2e partie (lot 2026-07-06)
  './exercises/developpe-epaules-smith-machine.webp','./exercises/elevation-frontale-poulie-basse.webp','./exercises/elevation-frontale-banc-incline.webp',
  './exercises/elevation-laterale-incline-haltere.webp','./exercises/rotation-externe-epaule-haltere.webp','./exercises/tirage-menton-avec-elastique.webp',
  './exercises/thruster.webp','./exercises/thruster-kettlebell.webp','./exercises/russian-twist-avec-developpe-epaule.webp',
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

// Sentinelle de « santé du cache » : un fichier du CORE (précaché à l'install). S'il manque, c'est
// que le cache a été vidé (iOS/manuel) → on réinstalle le CORE (rapide). ⚠️ NE PAS pointer sur
// une figurine (le CORE seul ne les contient pas → fausse « absence »). Fix 2026-07-13.
const PRECACHE_SENTINEL = './style.css';

// ── DEUX TIROIRS SÉPARÉS (fix 2026-07-16, demande Michel) ─────────────────────
// CACHE (versionné, tout en haut) = le CODE (html/js/css/polices/libs/logos) : petit, change à
//   chaque mise à jour → renouvelé à chaque version (garantit qu'on reçoit bien le nouveau code).
// IMG_CACHE (nom STABLE ci-dessous) = les IMAGES (exercices/anatomie/guide/accessoires/muscles) :
//   ~15 Mo, ne changent quasi jamais. Ce tiroir n'est JAMAIS vidé par une mise à jour → les images
//   sont téléchargées UNE SEULE FOIS (1re install) puis CONSERVÉES sur le téléphone. Fini le
//   re-téléchargement des 15 Mo à chaque MAJ (qui mangeait la data et saturait la 4G).
const IMG_CACHE = 'ft-images';
const IMG_RE = /\/(exercises|anatomy|guide|accessoires|muscles)\//;
const IMG_ASSETS = PRECACHE.filter(u => IMG_RE.test(u));

// Fichiers ESSENTIELS (code + polices + libs + logos) — petits → install RAPIDE.
// ⚠️ On ne bloque PAS l'install sur les ~15 Mo d'images : sur iOS/5G ça faisait traîner/échouer
// l'install → skipWaiting jamais atteint → utilisateur COINCÉ sur l'ancienne version (bug 2026-07-13).
const CORE = PRECACHE.filter(u => !IMG_RE.test(u));
async function precacheCore(){
  const cache = await caches.open(CACHE);
  for (const url of CORE){ try { await cache.add(url); } catch (e) {} }
}

// Télécharge SEULEMENT les images MANQUANTES dans le tiroir stable IMG_CACHE, une par une, en
// notifiant la progression (barre « 📦 Installation… X% »). Résumable. La barre n'apparaît donc
// QUE quand il y a vraiment quelque chose à télécharger : 1re installation, ou nouvelles figurines
// ajoutées. Sur une mise à jour normale (images déjà présentes) → rien à faire, AUCUNE barre, 0 data.
async function precacheImages(){
  const cache = await caches.open(IMG_CACHE);
  const missing = [];
  for (const url of IMG_ASSETS){ if (!(await cache.match(url))) missing.push(url); }
  if (!missing.length){                          // tout est déjà là → pas de barre
    const clients = await self.clients.matchAll({includeUncontrolled:true});
    clients.forEach(c => c.postMessage({type:'PRECACHE_DONE', done:1, total:1}));
    return;
  }
  const total = missing.length;
  let done = 0;
  const notify = async (type) => {
    const clients = await self.clients.matchAll({includeUncontrolled:true});
    clients.forEach(c => c.postMessage({type, done, total}));
  };
  for (const url of missing){
    try { await cache.add(url); } catch (err) { /* asset manquant sur le serveur → on continue */ }
    done++;
    if (done === total || done % 4 === 0) await notify('PRECACHE_PROGRESS');
  }
  await notify('PRECACHE_DONE');
}
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    await precacheCore();      // rapide : uniquement le code (+ polices, libs, logos)
    await self.skipWaiting();  // → la nouvelle version s'active immédiatement, sans attendre les images
  })());
});

// Messages venant de l'app :
//  - REPRECACHE      : réinstalle TOUT de force (bouton « Vider le cache ») → montre la barre.
//                      C'est EXPLICITE : l'utilisateur le déclenche (à faire en wifi de préférence).
//  - ENSURE_PRECACHE : envoyé à chaque ouverture. Répare le CORE (code) si le cache a été vidé, PUIS
//                      lance l'installation COMPLÈTE des images en arrière-plan AVEC la barre
//                      « 📦 Installation… X% » — SEULEMENT si le marqueur FULL_MARKER manque (donc
//                      1 fois par version = à chaque mise à jour). Résumable : reprend là où ça s'est
//                      arrêté, saute ce qui est déjà en cache. (Choix Michel 2026-07-15 : barre auto à
//                      chaque MAJ, compromis assumé vs data mobile — la lecture bilan/import passe
//                      désormais par le serveur Cloudflare, plus par Google, donc moins de contention.)
self.addEventListener('message', e => {
  const t = e.data && e.data.type;
  if (t === 'REPRECACHE') {
    // « Vider le cache » (explicite) → tout réinstaller : code + images (les images ont été vidées).
    e.waitUntil((async () => { await precacheCore(); await precacheImages(); })());
  } else if (t === 'ENSURE_PRECACHE') {
    e.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      const coreOk = await cache.match(PRECACHE_SENTINEL);
      if (!coreOk) { await precacheCore(); }        // cache CODE vidé → répare le code d'abord (rapide)
      await precacheImages();                        // télécharge les images MANQUANTES → barre SI besoin, sinon rien
    })());
  }
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k))))
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

  // Autres assets locaux : cache d'abord (cherche dans les DEUX tiroirs), réseau en fallback.
  // Au téléchargement à la demande : les images vont dans IMG_CACHE (stable), le reste dans CACHE.
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r && r.status === 200) {
          const cl=r.clone();
          const target = IMG_RE.test(url.pathname) ? IMG_CACHE : CACHE;
          caches.open(target).then(c => c.put(e.request, cl));
        }
        return r;
      });
    })
  );
});
