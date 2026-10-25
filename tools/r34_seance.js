// R34 — CE QUE MILO REÇOIT, AVANT / APRÈS LA MISSION SÉANCE DU 24/10/2026, à données ÉGALES (fictives), horloge gelée, 0 appel Milo.
// Usage : tools/sous_garde.sh node tools/r34_seance.js <racine AVANT> <racine APRÈS>   (rapport : docs/SEANCE-CHIFFRES-2026-10-24.md §4)
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png'};
const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_work: 'bureau', ft4_goal: 'force', ft4_ob2: '1', ft4_act: '1.55', ft4_act_src: 'choisi', ft4_name: 'Test', ft4_rest: '130' };
async function contextes(ROOT) {
  const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
    const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const cx = await b.newContext({ serviceWorkers: 'block', timezoneId: 'Europe/Paris' }); await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
  const pg = await cx.newPage();
  await pg.addInitScript(`(()=>{const F=new Date('2026-10-24T12:00:00');const V=Date;
    window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}static now(){return F.getTime();}};})();`);
  await pg.goto('http://localhost:' + srv.address().port + '/index.html'); await pg.waitForTimeout(2200);
  const out = await pg.evaluate(BASE => {
    window._cloudSync = () => {}; window._cloudSyncDebounced = () => {};
    const j = n => today(Date.now() - n * 864e5);
    const U = Object.keys(EX_UNI).map(id => exNom(id)).filter(n => n && estUnilateral(n))[0];
    const noms = [...new Set(Object.values(EXLIB).flat().map(e => typeof e === 'string' ? e : (e && (e.n || e.name))).filter(Boolean))];
    const plein = noms.find(n => / \(/.test(n) && exNomCatalogue(n.split(' (')[0]) === n && exMuscles(n) && (exMuscles(n).p || []).length && (exMuscles(n).p || []).concat(exMuscles(n).s || []).indexOf('calves') < 0);
    const abr = plein.split(' (')[0];
    const sess = (n, ts, exs, extra) => Object.assign({ id: ts, ts, date: j(n), uniConv: 1, duration: 3600, calories: 300, exs: exs.map(e => ({ name: e[0], sets: e[1].map(s => ({ kg: s[0], reps: s[1], done: true, type: s[2] || 'N' })) })) }, extra || {});
    const CAS = {
      'A neutre (catalogue, sommeil noté, volume enregistré comme le fait finishWorkout)': { sessions: [sess(2, Date.now() - 2 * 864e5, [['Développé Couché', [[80, 8], [80, 8], [80, 8]]], ['Squat Barre', [[100, 5], [100, 5]]]], { volume: 2920 })],
        sleep: [{ date: j(1), hours: 7.5, energy: 4 }, { date: j(2), hours: 7, energy: 4 }] },
      'A2 la même séance SANS volume enregistré (import)': { sessions: [sess(2, Date.now() - 2 * 864e5, [['Développé Couché', [[80, 8], [80, 8], [80, 8]]], ['Squat Barre', [[100, 5], [100, 5]]]])],
        sleep: [{ date: j(1), hours: 7.5, energy: 4 }, { date: j(2), hours: 7, energy: 4 }] },
      'B unilatéral + série W + perso coché, sans sommeil': { sessions: [sess(2, Date.now() - 2 * 864e5, [[U, [[30, 10], [30, 10]]], ['Développé Couché', [[40, 10, 'W'], [80, 8], [80, 8]]], [abr, [[60, 10]]]])],
        sleep: [], custom: [{ n: abr, g: 'Jambes', muscles: { p: ['calves'], s: [] } }] },
    };
    return Object.keys(CAS).map(nom => { const c = CAS[nom];
      localStorage.clear(); Object.keys(BASE).forEach(k => localStorage.setItem(k, BASE[k]));
      localStorage.setItem('ft4_sessions', JSON.stringify(c.sessions)); localStorage.setItem('ft4_sleep', JSON.stringify(c.sleep || []));
      if (c.custom) localStorage.setItem('ft4_cuex', JSON.stringify(c.custom));
      load(); if (c.custom) S.customExercises = c.custom; S.sleepLog = c.sleep || [];
      return [nom, String(buildCoachContext())]; });
  }, BASE);
  await b.close(); srv.close(); return out;
}
(async () => {
  const [A, B] = process.argv.slice(2);
  const a = await contextes(A), b = await contextes(B);
  a.forEach(([nom, ca], i) => { const cb = b[i][1];
    const la = ca.split('\n'), lb = cb.split('\n'); const sa = new Set(la), sb = new Set(lb);
    const moins = la.filter(l => !sb.has(l)), plus = lb.filter(l => !sa.has(l));
    console.log('\n=== ' + nom + ' : ' + (ca === cb ? 'IDENTIQUE à l\'octet' : 'DIFFÉRENT') + ' (' + ca.length + ' → ' + cb.length + ' caractères)');
    moins.forEach(l => console.log('  − ' + l.slice(0, 400))); plus.forEach(l => console.log('  + ' + l.slice(0, 400))); });
})().catch(e => { console.error('PLANTAGE ' + e.stack); process.exit(2); });
