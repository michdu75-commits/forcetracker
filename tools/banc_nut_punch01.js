#!/usr/bin/env node
/* BANC CIBLÉ — NUT-PUNCH-01 (coup de poing Nutrition, 03/10/2026), blocs B-NP01-A → B-NP01-F.
   Il existe pour que le contrôle négatif (`tools/mut_nut_punch01.py`) rejoue ses mutations en
   secondes au lieu d'une passe complète. Usage : node tools/banc_nut_punch01.js [partie …]
   (racine ou clone ; sans argument = toutes les parties). Parties : contrat, cycle, repas, reliquats. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
           '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2',
           '.webp':'image/webp','.ico':'image/x-icon','.wasm':'application/wasm','.gz':'application/gzip'};
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
const PARTIES = process.argv.slice(2);
const veut = p => !PARTIES.length || PARTIES.includes(p);
(async () => {
  await new Promise(r => srv.listen(0, r));
  const PORT = srv.address().port;
  const mod = require(path.join(ROOT, 'tests', 'parcours', 'nut_punch01.js'));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  if (veut('contrat')) { mod.sourceContrat(t, ROOT, fs, path); await mod.contrat(t, b, PORT); }
  if (veut('cycle')) { mod.sourceCycle(t, ROOT, fs, path); await mod.cycle(t, b, PORT); }
  if (veut('repas')) { mod.sourceRepas(t, ROOT, fs, path); await mod.repas(t, b, PORT); }
  if (veut('reliquats')) { mod.sourceReliquats(t, ROOT, fs, path); await mod.reliquats(t, b, PORT); }
  await b.close(); srv.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.stack || e)); process.exit(2); });
