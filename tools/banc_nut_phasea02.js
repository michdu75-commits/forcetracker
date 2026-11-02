#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01 : tout nouveau banc se garde lui-même)
/* Banc NUT-SYNC-02 PHASE A — CORRECTIONS DE SÉCURITÉ (02/11/2026) — porte de version PAR COMPTE · suspension du volet Nutrition · ancien ↔ nouveau en séquence ET en concurrence · VRAIS processus serveur · VRAI client courant · VRAI ancien client de production.
 *
 * [!!] UN PLANTAGE N'EST PAS UN VERT : il sort en code 2 avec « 0 OK / 1 rouge ».
 * Usage : node tools/banc_nut_phasea02.js            (tout)
 *         PA02_SEULEMENT=S node tools/banc_nut_phasea02.js   (une ou plusieurs sections : S serveur en mémoire · D vrais processus · C vrais clients)
 *         PA02_BLOCS=PD10,PC20 …                              (certains blocs des sections D et C)
 *
 * LE VRAI ANCIEN CLIENT : les fichiers de la RACINE du dépôt à la révision PUBLIÉE (par défaut `origin/master`, ft-v1263 — `FT_ANCIEN_CLIENT_REF` la surcharge) sont extraits dans un dossier temporaire ; tout le reste (images, polices, données) vient de l'arbre
 * courant, qui ne change pas ce que fait le client. `FT_ANCIEN_CLIENT_DIR` désigne à la place un arbre déjà extrait. Introuvable : le témoin PC20 est ROUGE (une preuve absente n'est pas une preuve verte).
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');
/* Chemins SURCHARGEABLES : FT_PLAYWRIGHT = le module Playwright, FT_CHROMIUM = l'exécutable de Chromium. Par défaut : ceux de l'environnement de travail. */
const { chromium } = process.env.FT_PLAYWRIGHT ? require(process.env.FT_PLAYWRIGHT) : require('../tests/_playwright.js').chargerPlaywright().pw;   // le résolveur COMMUN du dépôt (R2) ; FT_PLAYWRIGHT le surcharge

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
               '.ico': 'image/x-icon', '.gif': 'image/gif' };
/* Un serveur statique : `surcharge` = un dossier dont les fichiers (de la racine) passent avant ceux de l'arbre courant. */
function serveur(surcharge) {
  return http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
    let f = path.join(ROOT, p);
    if (surcharge) { const g = path.join(surcharge, p); if (g.startsWith(surcharge) && fs.existsSync(g) && fs.statSync(g).isFile()) f = g; }
    if (!(f.startsWith(ROOT) || (surcharge && f.startsWith(surcharge))) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      r.writeHead(404); return r.end('404');
    }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(r);
  });
}

/* L'arbre du client PUBLIÉ : les fichiers de la racine du dépôt à la révision donnée (jamais le dépôt entier : 140 Mo). Rend le dossier, ou null. */
function arbreAncien() {
  if (process.env.FT_ANCIEN_CLIENT_DIR) return fs.existsSync(path.join(process.env.FT_ANCIEN_CLIENT_DIR, 'index.html')) ? path.resolve(process.env.FT_ANCIEN_CLIENT_DIR) : null;
  const ref = process.env.FT_ANCIEN_CLIENT_REF || 'origin/master';
  try {
    const liste = execFileSync('git', ['ls-tree', ref], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).split('\n')
      .map((l) => l.match(/^\d+ blob [0-9a-f]+\t(.+)$/)).filter(Boolean).map((m) => m[1]).filter((n) => /\.(html|js|css|json)$/.test(n));
    if (!liste.includes('index.html')) return null;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pa02_ancien_'));
    for (const n of liste) fs.writeFileSync(path.join(dir, n), execFileSync('git', ['show', ref + ':' + n], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }));
    return dir;
  } catch (e) { console.log('  (ancien client : ' + String(e && e.message || e).split('\n')[0].slice(0, 160) + ')'); return null; }
}

const srv = serveur(null);
let srvAncien = null;

(async () => {
  const M = require(path.join(ROOT, 'tests/parcours/nut_phasea02.js'));
  await new Promise((r) => srv.listen(0, r));
  const PORT = srv.address().port;
  let PORT_ANCIEN = 0;
  const veutC = !process.env.PA02_SEULEMENT || process.env.PA02_SEULEMENT.split(',').indexOf('C') >= 0;
  if (veutC) {
    const dirAncien = arbreAncien();
    if (dirAncien) {
      srvAncien = serveur(dirAncien);
      await new Promise((r) => srvAncien.listen(0, r));
      PORT_ANCIEN = srvAncien.address().port;
      const v = (fs.readFileSync(path.join(dirAncien, 'sw.js'), 'utf8').match(/CACHE\s*=\s*'(ft-v\d+)'/) || [])[1];
      console.log('  (ancien client réel : ' + dirAncien + (v ? ' · ' + v : '') + ')');
    }
  }
  const b = await chromium.launch({ executablePath: process.env.FT_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  await M.ecran(t, b, PORT, PORT_ANCIEN);
  await b.close(); srv.close(); if (srvAncien) srvAncien.close();

  console.log('\n' + ok + ' OK / ' + ko.length + ' rouge');
  ko.forEach((k) => console.log('  rouge : ' + k));
  process.exit(ko.length ? 1 : 0);
})().catch((e) => {
  console.error('CRASH : ' + (e && e.stack || e));
  console.log('\n0 OK / 1 rouge');
  try { srv.close(); } catch (x) {}
  try { if (srvAncien) srvAncien.close(); } catch (x) {}
  process.exit(2);
});
