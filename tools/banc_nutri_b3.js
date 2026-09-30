#!/usr/bin/env node
/* BANC CIBLÉ — Nutrition lot 1 (B3), blocs B-CDXV (source) → B-CDXVIII (moteur, écran, Milo).
   Il existe pour que le contrôle négatif (`tools/mut_nutri_b3.py`) rejoue ses mutations en
   minutes au lieu d'une passe complète. Usage : node tools/banc_nutri_b3.js (racine ou clone). */
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
  const mod = require(path.join(ROOT, 'tests', 'parcours', 'nutri_b3.js'));
  const nm = require(path.join(ROOT, 'tests', 'parcours', 'nutri_moteur.js'));
  mod.source(t, ROOT, fs, path);
  nm.source(t, ROOT, fs, path);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const quoi = (process.env.BANC_B3 || 'moteur,vue,milo,nut').split(',');
  if (quoi.includes('moteur')) await mod.ecran(t, b, PORT);
  if (quoi.includes('vue')) await mod.ecranVue(t, b, PORT);
  if (quoi.includes('milo')) await mod.ecranMilo(t, b, PORT);
  if (quoi.includes('nut')) await nm.ecran(t, b, PORT);
  await b.close(); srv.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
