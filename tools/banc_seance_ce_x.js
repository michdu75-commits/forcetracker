#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01 : un nouveau banc se garde lui-même)
/* BANC — SCCX (assemblage des trois lots, 16/11/2026) : l'INTERACTION de D-163 / D-168 / D-171 (historique), D-164 / D-167 (états de charge) et D-170 / D-173 / D-176 (mise à jour, suppression d'une série, en-tête)
   sur UN SEUL fil conducteur — blocs B-SCCX-*. Destiné à la passe complète (tests/parcours/runner.js) ET au contrôle négatif : `python3 tools/mut_seance_ce_x.py`.
   Usage : node tools/banc_seance_ce_x.js [pur|ecran|maj]   (SCCX_SEUL=X ou M ne joue que ce scénario ; depuis la racine du dépôt ou d'un arbre copié)
   Lancer sous le garde réseau : tools/sous_garde.sh node tools/banc_seance_ce_x.js
   `ecran` sert l'arbre en local (X1 feuille de suppression · X2 deux jours, éditeur, séances A et B, enregistrement · X3 en-tête) ; `maj` crée LEURS serveurs (publications simulées, serveur local fictif qui fige le corps de la réponse). Un navigateur à la fois. */
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
  const T = require(path.join(ROOT, 'tests', 'parcours', 'seance_ce_x.js'));
  if (quoi === 'tout' || quoi === 'pur') T.pur(t, ROOT, fs, path);
  const b = (quoi === 'pur') ? null : await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  if (quoi === 'tout' || quoi === 'ecran') { await new Promise((r) => srv.listen(0, r)); await T.ecran(t, b, srv.address().port); srv.close(); }
  if (quoi === 'tout' || quoi === 'maj') await T.maj(t, b);
  if (b) await b.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch((e) => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
