#!/usr/bin/env node
/* Banc phase 3.1 — les trois arbitrages IA et le pot Nutrition separe.
 *
 * [!!] BANC A PART parce que le bloc de comportement est ASYNCHRONE. Le runner imprime son
 *      total de facon SYNCHRONE : y greffer un bloc async ferait imprimer le total AVANT la
 *      fin des temoins, c'est-a-dire un total tronque qui ressemble a un total vert
 *      (BUGS.md §61). Le bloc de SOURCE, lui, est branche dans le runner.
 *
 * [*] UN SEUL PROPRIETAIRE (R2) : ce banc et le controle negatif appellent le MEME module,
 *     `tests/parcours/pots_nutrition.js`. Il n'existe pas de version « du banc » et de
 *     version « des mutations » qui pourraient diverger.
 *
 * Usage : node tools/banc_pots_nutrition.js
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = path.dirname(__dirname);
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
  const M = require(path.join(ROOT, 'tests/parcours/pots_nutrition.js'));
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
