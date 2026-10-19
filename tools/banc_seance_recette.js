#!/usr/bin/env node
/* BANC — SÉANCE : corrections de la recette iPhone du 19/10/2026 + « Précédent » sur 4 séances (décisions de Michel du 19/10, D-093) :
   le compteur de travail (protégé), le volume total et le travail à part, le sélecteur de réserve Échec | 0 | 1 | 2 | 3 | 4+,
   le RIR dans le détail d'une séance, une colonne « Précédent » qui ne duplique plus, et la feuille « 4 dernières séances ».
   Blocs B-SR-*. Destiné à la passe complète (tests/parcours/runner.js).
   Contrôle négatif : `python3 tools/mut_seance_recette.py`. Usage : node tools/banc_seance_recette.js   (depuis la racine du dépôt ou d'une copie) */
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
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const T = require(path.join(ROOT, 'tests', 'parcours', 'seance_recette.js'));
  await T.ecran(t, b, srv.address().port);
  await b.close(); srv.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
