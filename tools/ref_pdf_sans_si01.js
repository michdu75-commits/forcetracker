#!/usr/bin/env node
/* RÉFÉRENCE HISTORIQUE — export PDF « sans débriefs » (SESSION-INTEGRITY-01, finition du 04/10/2026, session-B).
   Sert l'arbre donné (par défaut : ce dépôt), ouvre l'app avec le jeu de données à DATES FIXES du témoin F4
   (`tests/parcours/session_integrity.js`), conduit la vraie fenêtre d'export (bouton PDF, choix par défaut) et
   imprime les chaînes réellement dessinées dans le PDF, décodées comme un lecteur les affichera.
   ⭐ Lancé sur l'arbre de MASTER c3c830ab (avant le chantier), il produit la référence que F4 compare ; lancé sur
   la branche, il doit produire EXACTEMENT la même liste.
   Usage : node tools/ref_pdf_sans_si01.js [ARBRE]      (ex. un `git archive c3c830ab` décompressé)
   ⛔ Aucun appel réseau réel : Apps Script, Supabase et le Worker sont simulés ou coupés. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const DEPOT = path.dirname(__dirname);
const ROOT = path.resolve(process.argv[2] || DEPOT);
const { PDF } = require(path.join(DEPOT, 'tests', 'parcours', 'session_integrity.js'));
const M = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.ico': 'image/x-icon', '.wasm': 'application/wasm' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, { 'Content-Type': M[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
(async () => {
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
  await cx.route(/supabase\.co|anthropic\.com|workers\.dev/, r => r.abort());
  await cx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"not_found"}' }));
  const pg = await cx.newPage();
  const init = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 't@t.t',
    ft4_ok: '1', ft4_stmig1: '1', ft4_tester_eq_v1: '1', ft4_sessions: JSON.stringify(PDF.SEANCES_PDF()) };
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_ref'))return; sessionStorage.setItem('_ref','1'); localStorage.clear();
    const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + srv.address().port + '/index.html'); await pg.waitForTimeout(1600);
  await pg.evaluate(() => { window.__fichiers = []; window._donnerFichier = async (c, n) => {
    const buf = await c.arrayBuffer(); window.__fichiers.push({ nom: n, bin: Array.from(new Uint8Array(buf)).map(x => String.fromCharCode(x)).join('') }); return 'ok'; }; });
  await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); openHistoExport(); });
  await pg.click('#ov-histo-export button[onclick="exportHistoPdf()"]'); await pg.waitForTimeout(1500);
  const bin = await pg.evaluate(() => (window.__fichiers.find(f => /\.pdf$/.test(f.nom)) || {}).bin || '');
  console.log(JSON.stringify(PDF.normPdf(PDF.lirePdf(bin))));
  await b.close(); srv.close();
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
