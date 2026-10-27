#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01 : tout nouveau banc se garde lui-même)
/* Banc NUTRITION V2 · FIABILITÉ DES DONNÉES (mission P1 de Michel, 24/10/2026) — bloc B-NFIAB.
 *
 * [*] UN SEUL PROPRIÉTAIRE (R2) : ce banc, la passe complète et le contrôle négatif appellent le MÊME module,
 *     `tests/parcours/nut_fiabilite.js` (vraie app ; vrai Code.js en local pour la synchro, données inventées).
 * [*] NUTF_RACINE=<dossier> : servir une COPIE (app ET Code.js) au lieu du dépôt (contrôle négatif).
 * [*] NUTF_PARTIE=ecran|identite|croise : une seule des trois parties (le contrôle négatif ne rejoue que celle que la mutation vise) ;
 *     sans elle, les trois — c'est le banc.
 * [!!] UN PLANTAGE N'EST PAS UN VERT : il sort en code 2 avec « 0 OK / 1 rouge ».
 *
 * Usage : node tools/banc_nut_fiabilite.js
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = process.env.NUTF_RACINE || path.dirname(__dirname);
process.env.NUT2X_RACINE = ROOT;                 // le serveur simulé (outils de B-NIX) lit le Code.js de la MÊME racine
let ok = 0;
const ko = [];
function t(nom, cond, detail) {
  if (cond) { ok++; console.log('  OK   ' + nom); }
  else { ko.push(nom); console.log('  !!   ' + nom + '   ' + (detail || '')); }
}
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
               '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.ico': 'image/x-icon', '.gif': 'image/gif' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
(async () => {
  const M = require(path.join(ROOT, 'tests/parcours/nut_fiabilite.js'));
  await new Promise((r) => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const partie = process.env.NUTF_PARTIE || '';
  if (partie && partie !== 'ecran' && partie !== 'identite' && partie !== 'croise') throw new Error('NUTF_PARTIE inconnue : ' + partie);
  if (!partie || partie === 'ecran') await M.ecran(t, b, srv.address().port);
  if (!partie || partie === 'identite') await M.identite(t, b, srv.address().port);   // NIDT (27/10) : réutiliser un ancien aliment sans perdre ni inventer son identité
  if (!partie || partie === 'croise') await M.croise(t, b, srv.address().port);
  await b.close(); srv.close();
  console.log('\n' + ok + ' OK / ' + ko.length + ' rouge');
  ko.forEach((k) => console.log('  rouge : ' + k));
  process.exit(ko.length ? 1 : 0);
})().catch((e) => {
  console.error('CRASH : ' + (e && e.stack || e));
  console.log('\n0 OK / 1 rouge');
  try { srv.close(); } catch (x) {}
  process.exit(2);
});
