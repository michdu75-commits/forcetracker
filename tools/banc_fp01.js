#!/usr/bin/env node
/* BANC — MILO-SEANCE-FP-01 (session-B) : parler d une séance n est pas en demander une (B-CDVIII + B-CDIX) · cas mixte (B-CDX + B-CDXI)
   · extension (B-CDXII + B-CDXIII) · architecture du 30/09 (B-CDXIV) · K = corpus différentiel master → branche (ici seulement).
   Destiné à la passe complète (tests/parcours/runner.js) après validation du checkpoint.
   Sert aussi au contrôle négatif : `python3 tools/mut_fp01.py`.
   Usage : node tools/banc_fp01.js   (depuis la racine du dépôt ou d'un clone) */
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
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const T = require(path.join(ROOT, 'tests', 'parcours', 'seance_fp01.js'));
  T.source(t, ROOT, fs, path);
  T.sourceMixte(t, ROOT, fs, path);
  T.sourceExt(t, ROOT, fs, path);
  await T.ecran(t, b, srv.address().port);
  await T.ecranMixte(t, b, srv.address().port);
  await T.ecranExt(t, b, srv.address().port);
  await T.ecranArchi(t, b, srv.address().port);
  // ── K · le corpus DIFFÉRENTIEL (master → cet arbre), EXÉCUTÉ ici et pas dans la passe complète : il a
  //    besoin de l'historique git (master 7a71649e), qu'un clone court n'aurait pas toujours.
  console.log('\n═══ K (session-B). MILO-SEANCE-FP-01 — corpus différentiel master → branche, et l\'outil s\'éprouve lui-même ═══');
  const cp = require('child_process');
  const k1 = cp.spawnSync('node', [path.join(ROOT, 'tools', 'corpus_fp01.js')], { cwd: ROOT, encoding: 'utf8', timeout: 300000 });
  const mB = /B · régression non justifiée \.* (\d+)/.exec(k1.stdout || ''), mN = /nouvelles détections\)\s+(\d+)/.exec(k1.stdout || '');
  const mA = /A · veto méta justifié \.* (\d+)/.exec(k1.stdout || '');
  t('K1 ⭐ corpus différentiel (master → cet arbre) : chaque MASTER VRAI → FINAL FAUX est un veto méta justifié (B = 0), aucune nouvelle détection — et le veto rejette bien des méta-discussions que master détectait (A > 0 : un outil qui comparerait la branche à elle-même serait vert en ne mesurant rien)',
    k1.status === 0 && !!mB && mB[1] === '0' && !!mN && mN[1] === '0' && !!mA && +mA[1] > 0, (k1.stdout || '').split('\n').slice(0, 7).join(' / ').slice(0, 400) + ' ' + (k1.stderr || '').slice(0, 200));
  const k2 = cp.spawnSync('node', [path.join(ROOT, 'tools', 'corpus_fp01.js'), '--auto-test'], { cwd: ROOT, encoding: 'utf8', timeout: 300000 });
  t('K2 ⭐ l\'outil n\'est pas aveugle : il voit chaque régression qu\'on lui injecte (« bouton présent = rejet », veto trop large, fenêtre de 40 caractères, versions intermédiaires de la branche)',
    k2.status === 0 && /AUTO-TEST : l'outil voit/.test(k2.stdout || ''), (k2.stdout || '').slice(-400) + ' ' + (k2.stderr || '').slice(0, 200));
  await b.close(); srv.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
