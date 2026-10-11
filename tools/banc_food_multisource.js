#!/usr/bin/env node
/* BANC CIBLÉ — FOOD SEMANTICS V1 / FS-05B (corpus MULTI-SOURCE de la recherche d'aliments), blocs B-CDXLI
   (structure du corpus), B-CDXLII (le corpus conduit par la VRAIE FRAPPE : CIQUAL, fast-food, Open Food Facts
   FIGÉ ; MUST et SHOULD rougissent, limites et observations sont signalées sans rougir) et B-CDXLIII
   (inter-sources : limites nommées, déterminisme, course, débit réseau). Il existe pour que le contrôle négatif
   (`tools/mut_food_multisource.py`) rejoue ses mutations vite. Usage : node tools/banc_food_multisource.js */
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
  const mod = require(path.join(ROOT, 'tests', 'parcours', 'food_multisource.js'));
  mod.source(t);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  await mod.ecran(t, b, PORT);
  await b.close(); srv.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
