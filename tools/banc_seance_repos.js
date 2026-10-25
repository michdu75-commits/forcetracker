#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01 : tout nouveau banc se garde lui-même)
/* BANC — SEANCE-REPOS-01 (session-C, Claude Séance, 22/10/2026) : le repos en cours survit à la fermeture de l'app.
 *
 * [*] UN SEUL PROPRIÉTAIRE (R2) : ce banc, la passe complète et le contrôle négatif appellent le MÊME module,
 *     `tests/parcours/seance_repos.js`.
 * [!!] UN PLANTAGE N'EST PAS UN VERT : il sort en code 2 avec la ligne « PLANTAGE ».
 *
 * Usage : node tools/banc_seance_repos.js        (depuis la racine du dépôt ou d'un arbre copié)
 * Contrôle négatif : python3 tools/mut_seance_repos.py
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
           '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2',
           '.webp':'image/webp','.ico':'image/x-icon','.wasm':'application/wasm','.gif':'image/gif'};
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'});
  fs.createReadStream(f).pipe(r);
});
let ok = 0, ko = 0;
const t = (nom, cond, det) => { if (cond) { ok++; console.log('   OK  ' + nom); } else { ko++; console.log('❌ ROUGE ' + nom + (det ? '  >> ' + det : '')); } };
(async () => {
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const T = require(path.join(ROOT, 'tests', 'parcours', 'seance_repos.js'));
  T.source(t, ROOT, fs, path);
  await T.ecran(t, b, srv.address().port);
  await b.close(); srv.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.stack || e)); process.exit(2); });
