#!/usr/bin/env node
/* BANC — IMPORT-IA-FIDELITE-01 (session-C, 02/11/2026) : le CORPUS RÉEL de programmes (blocs B-IIC-*).
   Destiné à la passe complète (tests/parcours/runner.js) ET au contrôle négatif : `python3 tools/mut_import_corpus.py`.
   Usage : node tools/banc_import_corpus.js [source|ecran]   (depuis la racine du dépôt ou d'un arbre copié)
   Lancer sous le garde réseau : tools/sous_garde.sh node tools/banc_import_corpus.js */
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
  const quoi = process.argv[2] || 'tout';
  const T = require(path.join(ROOT, 'tests', 'parcours', 'import_corpus.js'));
  if (quoi === 'tout' || quoi === 'source') T.source(t);
  if (quoi === 'tout' || quoi === 'ecran') {
    await new Promise(r => srv.listen(0, r));
    const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
    await T.ecran(t, b, srv.address().port);
    await b.close(); srv.close();
  }
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
