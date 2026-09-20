#!/usr/bin/env node
/* Banc de la PROVENANCE de `coachMemory` — blocs B-CCCXL (source) et B-CCCXLI (conduit).
 *
 * [!!] BANC A PART parce que le bloc de comportement est ASYNCHRONE. Le runner imprime son
 *      total de facon SYNCHRONE : un total imprime avant la fin des temoins ressemble trait
 *      pour trait a un total vert (BUGS.md §61). Les DEUX blocs restent branches dans le
 *      runner ; ce fichier existe pour que le controle negatif les rejoue en secondes au
 *      lieu de relancer une passe de quarante minutes.
 *
 * [*] UN SEUL PROPRIETAIRE (R2) : ce banc et `tools/mut_coach_memoire.py` appellent le MEME
 *     module, `tests/parcours/coach_memoire.js`. Il n'existe pas de version « du banc » et
 *     de version « des mutations » qui pourraient diverger — c'est exactement ce qui
 *     transformerait un temoin en vert incapable de rougir.
 *
 * Usage : node tools/banc_coach_memoire.js
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = process.argv[2] || path.dirname(__dirname);
let ok = 0;
const ko = [];

function t(nom, cond, detail) {
  if (cond) { ok++; console.log('  OK   ' + nom); }
  else { ko.push(nom); console.log('  !!   ' + nom + '   ' + (detail || '')); }
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
               '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp',
               '.ico': 'image/x-icon' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    r.writeHead(404); return r.end('404');
  }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});

(async () => {
  const M = require(path.join(ROOT, 'tests/parcours/coach_memoire.js'));
  M.source(t, ROOT, fs, path);

  await new Promise((r) => srv.listen(0, r));
  const PORT = srv.address().port;
  const b = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  await M.ecran(t, b, PORT);
  await b.close(); srv.close();

  console.log('\n' + ok + ' OK / ' + ko.length + ' rouge');
  ko.forEach((k) => console.log('  rouge : ' + k));
  process.exit(ko.length ? 1 : 0);
})().catch((e) => {
  // [!!] UN PLANTAGE N'EST PAS UN VERT : une passe interrompue ressemble a une passe verte.
  console.error('CRASH : ' + (e && e.stack || e));
  console.log('\n0 OK / 1 rouge');
  try { srv.close(); } catch (x) {}
  process.exit(2);
});
