#!/usr/bin/env node
/* BANC CIBLÉ — MILO-PDF1 : une réponse coupée par la limite de longueur ne passe plus pour
   complète (B-CCCLXXVIII source, B-CCCLXXIX Worker conduit avec une API simulée, B-CCCLXXX écran).
   ⭐ Il existe pour le contrôle négatif (`tools/mut_milo_pdf1.py`) ET parce que le Worker n'est pas
   déployé depuis cette branche : ce banc est la preuve de COMPORTEMENT du Worker (0 appel réel).
   Usage : node tools/banc_milo_pdf1.js   (depuis la racine du dépôt ou d'un clone) */
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
  const mod = require(path.join(ROOT, 'tests', 'parcours', 'milo_pdf1.js'));
  // MILO-PDF1B : le bloc de correction se joue dans le MÊME banc (le contrôle négatif les éprouve ensemble).
  const modB = require(path.join(ROOT, 'tests', 'parcours', 'milo_pdf1b.js'));
  // PUBLICATION MILO-PDF1 : D-027 (programme) et D-028 (prochaine séance), même banc, même contrôle négatif.
  const modS = require(path.join(ROOT, 'tests', 'parcours', 'milo_suites.js'));
  mod.source(t, ROOT, fs, path); modB.source(t, ROOT, fs, path); modS.source(t, ROOT, fs, path);
  await mod.reel(t, ROOT, fs, path); await modB.reel(t, ROOT, fs, path);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  await mod.ecran(t, b, PORT); await modB.ecran(t, b, PORT); await modS.ecran(t, b, PORT);
  await b.close(); srv.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
