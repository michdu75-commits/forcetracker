/* 🧪 SERVICE WORKER DU CLONE DE TEST — généré par tools/clone_build.py, ne pas éditer.
   Portée : le dossier du clone seulement. ⛔ AUCUN cache, et il ne supprime JAMAIS un cache :
   ceux de la prod ne sont pas les siens. Les fichiers du clone viennent toujours du réseau
   (une mise à jour du clone se voit tout de suite) ; les ressources de la prod (images,
   données, polices, bibliothèques) sont lues à la racine ; aucune PAGE de la prod n'est
   servie sous /clone/ (elle tournerait sans l'isolement). */
const PROPRES = new Set(["", "index.html", "style.css", "manifest.json", "sw.js", "capacites-ia.js", "constants.js", "state.js", "supabase.js", "screens.js", "log.js", "setup.js", "tracking.js", "coach.js", "food-health.js", "app.js"]);
const BASE = self.location.pathname.replace(/[^\/]*$/, '');
const PARENT = BASE.replace(/[^\/]+\/$/, '');
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  const rel = url.pathname.slice(BASE.length);
  if (PROPRES.has(rel)) { e.respondWith(fetch(e.request, { cache: 'no-store' })); return; }
  if (e.request.mode === 'navigate' || /\.html?$/i.test(rel)) {
    e.respondWith(new Response('Page absente du clone de test.', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));
    return;
  }
  e.respondWith(fetch(url.origin + PARENT + rel + url.search));
});
