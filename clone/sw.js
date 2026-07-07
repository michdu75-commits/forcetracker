// ─── Service Worker du CLONE DE TEST ───────────────────────────────
// Scope = /forcetracker/clone/ uniquement. Objectif : servir TOUJOURS la
// dernière version (réseau natif), sans jamais toucher au cache de l'app
// de production (Cache Storage est partagé par origine → on n'y touche PAS).
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
// Le CODE (js/css/html) est TOUJOURS récupéré frais (cache:'no-store') → on ne teste
// jamais une version périmée par le cache HTTP du navigateur. Les images/polices
// restent servies normalement (cache navigateur OK). Ne touche pas au cache de la prod.
self.addEventListener('fetch', e => {
  try{
    const u = new URL(e.request.url);
    if (e.request.method === 'GET' && u.origin === self.location.origin && /(\.(js|css|html)|\/)$/.test(u.pathname)) {
      e.respondWith(fetch(e.request, {cache:'no-store'}).catch(() => fetch(e.request)));
    }
  }catch(_){}
});
