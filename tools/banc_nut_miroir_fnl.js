#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01 : tout nouveau banc se garde lui-même)
/* Banc FINALISATION NUTRITION (03/11/2026) — le miroir Supabase n'accepte pas un volet Nutrition qu'Apps Script a refusé · suspendu · non confirmé · VRAI client · VRAI Code.js en processus · miroir modélisé.
 *
 * [!!] UN PLANTAGE N'EST PAS UN VERT : il sort en code 2 avec « 0 OK / 1 rouge ».
 * Usage : node tools/banc_nut_miroir_fnl.js            (tout)
 *         FNL01_SEULEMENT=P,S node tools/banc_nut_miroir_fnl.js   (un ou plusieurs scénarios : P la porte seule · S suspension réelle · R reprise · N refus écrits · A sans accusé · H envoi en vol)
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
/* Chemins SURCHARGEABLES (une contre-validation indépendante n'a pas pu lancer les bancs à cause du chemin codé en dur) : FT_PLAYWRIGHT = le module Playwright, FT_CHROMIUM = l'exécutable de Chromium. Par défaut : ceux de l'environnement de travail. */
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
  const M = require(path.join(ROOT, 'tests/parcours/nut_miroir_fnl.js'));
  await new Promise((r) => srv.listen(0, r));
  const PORT = srv.address().port;
  const b = await chromium.launch({ executablePath: process.env.FT_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  await M.ecran(t, b, PORT);
  await b.close(); srv.close();

  console.log('\n' + ok + ' OK / ' + ko.length + ' rouge');
  ko.forEach((k) => console.log('  rouge : ' + k));
  process.exit(ko.length ? 1 : 0);
})().catch((e) => {
  console.error('CRASH : ' + (e && e.stack || e));
  console.log('\n0 OK / 1 rouge');
  try { srv.close(); } catch (x) {}
  process.exit(2);
});
