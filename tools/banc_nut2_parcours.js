#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01 : tout nouveau banc se garde lui-même)
/* Banc NUTRITION V2 — les parcours à l'écran, moteur branché (jalon 4, 22/10/2026).
 *
 * [*] UN SEUL PROPRIÉTAIRE (R2) : ce banc, la passe complète et le contrôle négatif appellent le MÊME module,
 *     `tests/parcours/nut2_parcours.js`.
 * [*] NUT2P_RACINE=<dossier> : servir une COPIE de l'app (contrôle négatif) au lieu du dépôt.
 * [!!] UN PLANTAGE N'EST PAS UN VERT : il sort en code 2 avec « 0 OK / 1 rouge ».
 *
 * Usage : node tools/banc_nut2_parcours.js
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = process.env.NUT2P_RACINE || path.dirname(__dirname);
let ok = 0;
const ko = [];

function t(nom, cond, detail) {
  if (cond) { ok++; console.log('  OK   ' + nom); }
  else { ko.push(nom); console.log('  !!   ' + nom + '   ' + (detail || '')); }
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
               '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp',
               '.ico': 'image/x-icon', '.gif': 'image/gif' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    r.writeHead(404); return r.end('404');
  }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});

(async () => {
  const M = require(path.join(path.dirname(__dirname), 'tests/parcours/nut2_parcours.js'));
  await new Promise((r) => srv.listen(0, r));
  const PORT = srv.address().port;
  const b = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  await M.ecran(t, b, PORT);
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
