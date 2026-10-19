#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01 — migration vérifiée avant/après : tools/migrer_garde.py)
/* BANC CIBLÉ — NUT-LOT-B (13/10/2026) : la requête dit l'aliment, pas la quantité. Blocs B-LB-A (structure), B-LB-E (vraie
   frappe), B-LB-I (instantané de la base : ce qui ne doit pas bouger), B-LB-C (compléments).
   Il existe pour que le contrôle négatif (`tools/mut_nut_lot_b.py`) rejoue ses mutations vite.
   Usage : node tools/banc_food_lot_b.js */
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
const t = (nom, cond, det) => {
  if (cond) { ok++; console.log('   OK  ' + nom); }
  else { ko++; console.log('❌ ROUGE ' + nom + (det ? '  >> ' + det : '')); }
};
(async () => {
  await new Promise(r => srv.listen(0, r));
  const PORT = srv.address().port;
  const mod = require(path.join(ROOT, 'tests', 'parcours', 'food_lot_b.js'));
  mod.source(t);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  await mod.ecran(t, b, PORT);
  await b.close(); srv.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
