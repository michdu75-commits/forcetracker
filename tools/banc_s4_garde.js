#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01 : tout nouveau banc se garde lui-même ; D031S-VII ①)
/* BANC — S4-GARDE (Claude N°2 Séance, 27/11/2026, ft-v1269) : le double appui ne valide pas l'exercice que le passage vient d'ouvrir (blocs B-S4GARDE-*).
   ✅ Qualifié en ciblé le 27/11/2026 (commit 3899e4f0 : 29 OK / 0 rouge ; contrôle négatif 25/25) ; 28 témoins et 24 mutations depuis le retrait de G19b et M24 (R30, « option A »). Branché dans `tests/parcours/runner.js` (GO de Michel, 27/11) ;
   volontairement absent de `repartition-3.json` : hors répartition, il tourne dans le processus 0 (docs/D031-ACCELEREE.md §7). Les identités de ses témoins
   ne s'écrivent que par la passe de calibrage de la D-031 (tools/temoins.py).
   Sert aussi au contrôle négatif : `python3 tools/mut_s4_garde.py`.
   Usage : node tools/banc_s4_garde.js   (depuis la racine du dépôt ou d'un clone) */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
           '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2',
           '.webp':'image/webp','.ico':'image/x-icon','.wasm':'application/wasm'};
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
  await new Promise(r => srv.listen(0, '127.0.0.1', r));   // isolé sur la machine elle-même : le dépôt n'est pas servi aux autres interfaces (27/11)
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const T = require(path.join(ROOT, 'tests', 'parcours', 's4_garde.js'));
  await T.tout(t, b, srv.address().port);
  await b.close(); srv.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
