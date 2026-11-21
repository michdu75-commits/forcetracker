#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01 : un nouveau banc se garde lui-même)
/* BANC — SCCM (CE lot M, 16/11/2026) : D-170 (l'attente réseau SE TERMINE, un verrou ne se lève jamais par un délai, le bandeau sur l'Accueil) · D-173 (supprimer la série choisie dans
   les structures dégressives, le sens PDC en attente suit sa série) · D-176 (l'en-tête global n'existe que sur l'Accueil) — blocs B-SCCM-*.
   Destiné à la passe complète (tests/parcours/runner.js) ET au contrôle négatif : `python3 tools/mut_seance_ce_m.py`.
   Usage : node tools/banc_seance_ce_m.js [pur|ecran|maj]   (SCCM_SEUL=S,H,B,F ou A,B,C,D ne joue que ces scénarios ; depuis la racine du dépôt ou d'un arbre copié)
   Lancer sous le garde réseau : tools/sous_garde.sh node tools/banc_seance_ce_m.js
   Les scénarios « maj » créent LEURS serveurs (publications simulées, serveur local fictif qui fige le corps de la réponse) ; « ecran » sert l'arbre en local. Un navigateur à la fois. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
const M = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.ico': 'image/x-icon', '.wasm': 'application/wasm', '.gif': 'image/gif' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, { 'Content-Type': M[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
let ok = 0, ko = 0;
const t = (nom, cond, det) => { if (cond) { ok++; console.log('   OK  ' + nom); } else { ko++; console.log('❌ ROUGE ' + nom + (det ? '  >> ' + det : '')); } };
(async () => {
  const quoi = process.argv[2] || 'tout';
  const T = require(path.join(ROOT, 'tests', 'parcours', 'seance_ce_m.js'));
  if (quoi === 'tout' || quoi === 'pur') T.pur(t, ROOT, fs, path);
  const b = (quoi === 'pur') ? null : await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  if (quoi === 'tout' || quoi === 'ecran') { await new Promise((r) => srv.listen(0, r)); await T.ecran(t, b, srv.address().port); srv.close(); }
  if (quoi === 'tout' || quoi === 'maj') await T.maj(t, b);
  if (b) await b.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch((e) => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
