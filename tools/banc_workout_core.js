#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01 : tout nouveau banc se garde lui-même)
/* BANC — WORKOUT-CORE-01 (Claude N°2, Séance, 30/10/2026) : CHR-03 (un seul métronome de repos, 1 s) et DOM-01/02 (rendu ciblé
 * des séries).
 *
 * [*] UN SEUL PROPRIÉTAIRE PAR TÉMOIN (R2) : ce banc et le contrôle négatif appellent les MÊMES modules,
 *     `tests/parcours/workout_core_chr.js` et `tests/parcours/workout_core_dom.js`.
 * [!!] UN PLANTAGE N'EST PAS UN VERT : il sort en code 2 avec la ligne « PLANTAGE ».
 * [!!] PRÉPARÉ, JAMAIS EXÉCUTÉ À L'ÉCRITURE (GO TESTS non accordé le 30/10) : syntaxe vérifiée seulement.
 *
 * Usage : node tools/banc_workout_core.js [chr|dom|chr,dom]   (sans argument : chaque module présent)
 * Contrôle négatif : python3 tools/mut_workout_core.py
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
const demande = process.argv[2] ? process.argv[2].split(',') : null;
(async () => {
  const modules = (demande || ['chr', 'dom']).map(q => ({ q, f: path.join(ROOT, 'tests', 'parcours', 'workout_core_' + q + '.js') }));
  const absents = modules.filter(m => !fs.existsSync(m.f));
  if (demande && absents.length) throw new Error('module absent : ' + absents.map(m => m.f).join(', '));
  const presents = modules.filter(m => fs.existsSync(m.f));
  if (!presents.length) throw new Error('aucun module WORKOUT-CORE-01 trouvé');
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const m of presents) {
    console.log('\n── WORKOUT-CORE-01 · ' + m.q.toUpperCase() + ' ──');
    const T = require(m.f);
    T.source(t, ROOT, fs, path);
    await T.ecran(t, b, srv.address().port);
  }
  await b.close(); srv.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.stack || e)); process.exit(2); });
