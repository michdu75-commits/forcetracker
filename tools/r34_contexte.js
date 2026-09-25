#!/usr/bin/env node
/* R34 — CE QUE MILO REÇOIT, AVANT / APRÈS (25/09/2026, D-021). ⛔ 0 APPEL MILO : on compare le
   CONTEXTE construit par `buildCoachContext()` dans deux arbres, horloge gelée, mêmes profils.
   Usage : node tools/r34_contexte.js <racine AVANT> <racine APRÈS>
   Sortie : pour chacun des 5 cas, les lignes qui diffèrent (le reste est identique). */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.wasm':'application/wasm'};
const BASE = { ft4_bw: '85.9', ft4_age: '48', ft4_ht: '180', ft4_gender: 'H', ft4_work: 'bureau', ft4_goal: 'force', ft4_nphase: 'charge', ft4_ob2: '1' };
const CAS = [
  ['A activité absente', {}],
  ['B 1,55 choisi', { ft4_act: '1.55', ft4_act_src: 'choisi' }],
  ['C 1,725 choisi', { ft4_act: '1.725', ft4_act_src: 'choisi' }],
  ['D ancien 1,55 non confirmé', { ft4_act: '1.55' }],
  ['E ancien 1,55 puis Confirmer', { ft4_act: '1.55' }, true],
];
async function contextes(ROOT) {
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r);
  });
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await (await b.newContext({ serviceWorkers: 'block', timezoneId: 'Europe/Paris' })).newPage();
  await pg.addInitScript(`(()=>{const F=new Date('2026-09-20T12:00:00');const V=Date;
    window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}static now(){return F.getTime();}};})();`);
  await pg.goto('http://localhost:' + srv.address().port + '/index.html'); await pg.waitForTimeout(2200);
  const out = await pg.evaluate(({ BASE, CAS }) => {
    window._cloudSync = () => {}; window._cloudSyncDebounced = () => {};
    return CAS.map(([nom, o, confirmer]) => {
      localStorage.clear(); const D = Object.assign({}, BASE, o); Object.keys(D).forEach(k => localStorage.setItem(k, D[k])); load();
      if (confirmer && typeof confirmerActivite === 'function') confirmerActivite();
      return [nom, String(buildCoachContext())];
    });
  }, { BASE, CAS });
  await b.close(); srv.close();
  return out;
}
(async () => {
  const [av, ap] = [await contextes(path.resolve(process.argv[2])), await contextes(path.resolve(process.argv[3]))];
  let total = 0;
  av.forEach(([nom, ca], i) => {
    const la = ca.split('\n'), lb = ap[i][1].split('\n');
    const sa = new Set(la), sb = new Set(lb);
    const moins = la.filter(l => !sb.has(l)), plus = lb.filter(l => !sa.has(l));
    total += moins.length + plus.length;
    console.log(`\n══ ${nom} : ${moins.length} ligne(s) retirée(s), ${plus.length} ajoutée(s) (sur ${la.length} → ${lb.length})`);
    moins.forEach(l => console.log('  − ' + l.slice(0, 230)));
    plus.forEach(l => console.log('  + ' + l.slice(0, 230)));
  });
  console.log(`\n──── ${total} ligne(s) différente(s) au total ────`);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
