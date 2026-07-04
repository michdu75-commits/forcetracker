// ─── Service Worker du CLONE DE TEST ───────────────────────────────
// Scope = /forcetracker/clone/ uniquement. Objectif : servir TOUJOURS la
// dernière version (réseau natif), sans jamais toucher au cache de l'app
// de production (Cache Storage est partagé par origine → on n'y touche PAS).
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
// Pas de respondWith → chaque requête part au réseau normalement.
// Aucun cache créé, aucun cache supprimé (le cache ft-vNN de la prod reste intact).
self.addEventListener('fetch', e => {});
