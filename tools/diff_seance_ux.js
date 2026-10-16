/* DIFFÉRENTIEL — UX SÉANCE (16/10/2026, session-B) : master ↔ branche, mêmes actions, deux arbres servis côte à côte.
   Le chantier ne change que la PRÉSENTATION : les propriétaires des données (startWorkout, addExercise, upSet, toggleSet,
   startRest / addRT / setRestPreset / skipRest, toggleWktPause, applyDropset / removeDropset, moveExBlock, clearAllEx,
   clearWkt, loadProg, finishWorkout) doivent produire EXACTEMENT les mêmes données sur les deux arbres.
   Ce qu'il CONDUIT : ces propriétaires, appelés directement (les boutons ont changé de place — c'est le banc B-UXS qui
   conduit les boutons). Ce qu'il OBSERVE : S.wkt, S.sessions, S.prs, ft4_wkt, ft4_wkt_draft, ft4_sessions, la
   préférence de repos, les variables du moteur de repos. Ce qu'il NE COUVRE PAS : l'affichage (c'est le sujet du
   chantier), le réseau (bloqué), Milo.
   Déterminisme : horloge FIGÉE, hasard semé et `crypto.randomUUID` remplacé par un compteur (l'identité `runId`), identiques sur les deux arbres (sans ça, `at`, `ts`, `id` divergent
   d'une exécution à l'autre et le différentiel mesurerait l'horloge — BUGS.md §78).
   Usage :
     git worktree add --detach /tmp/ft_master 5a29d149
     ROOT_A=/tmp/ft_master ROOT_B=$PWD node tools/diff_seance_ux.js
     git worktree remove --force /tmp/ft_master */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.wasm': 'application/wasm' };
const serve = root => http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_ok: '1', ft4_stmig1: '1', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_lms: '2026-10' };
const FIGE = `(()=>{const F=new Date('2026-10-16T18:00:00').getTime();const V=Date;
  window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F);}static now(){return F;}};
  let g=12345;Math.random=()=>{g=(g*1103515245+12345)%2147483648;return g/2147483648;};
  let n=0;try{Object.defineProperty(crypto,'randomUUID',{value:()=>'00000000-0000-4000-8000-'+String(++n).padStart(12,'0'),configurable:true});}catch(e){}})();`;

// Chaque scénario : un nom, et une fonction exécutée DANS la page (mêmes appels sur les deux arbres) qui rend un objet.
const SCENARIOS = [
  ['S1 séance libre : 2 exercices, échauffement + travail + échec, fin enregistrée', async () => {
    S.wkt = null; S.sessions = []; S.prs = {}; persist();
    startWorkout(); addExercise('Développé Couché'); addExercise('Squat à la Barre');
    const e0 = S.wkt.exs[0];
    while (e0.sets.length < 3) addSet(0);
    upSet(0, 0, 'kg', '60'); upSet(0, 0, 'reps', '10'); e0.sets[0].type = 'É';
    upSet(0, 1, 'kg', '100'); upSet(0, 1, 'reps', '6');
    upSet(0, 2, 'kg', '100'); upSet(0, 2, 'reps', '5'); e0.sets[2].type = 'X';
    toggleSet(0, 0); toggleSet(0, 1); toggleSet(0, 2);
    upSet(1, 0, 'kg', '120'); upSet(1, 0, 'reps', '5'); toggleSet(1, 0);
    if (typeof stopRest === 'function') stopRest();
    const avant = JSON.parse(JSON.stringify(S.wkt));
    await finishWorkout();
    await new Promise(r => setTimeout(r, 400));
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    return { avant, wkt: S.wkt, sessions: S.sessions, prs: S.prs, ls: localStorage.getItem('ft4_wkt') };
  }],
  ['S2 programme chargé (un jour) : la séance prend ses exercices, ses séries et ses repos', async () => {
    S.wkt = null; S.sessions = [];
    S.programmes = [{ id: 'p1', name: 'Push', exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 8, type: 'É', rest: 60 }, { kg: 100, reps: 5, type: 'N', rest: 180 }, { kg: 0, reps: 0, maxi: true, type: 'N' }] },
      { name: 'Dips', sets: [{ kg: 0, reps: 12, type: 'N' }] }] }];
    persist(); loadProg(0);
    await new Promise(r => setTimeout(r, 200));
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    return { wkt: S.wkt, ouverte: _seanceOuverte() };
  }],
  ['S3 moteur de repos : startRest, −15 / +15, préréglage, passer', async () => {
    S.wkt = { date: today(), startHour: 18, startTs: Date.now() - 600000, exs: [{ name: 'Développé Couché', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }, { kg: 100, reps: 5, done: false, type: 'N' }] }] };
    persist();
    const o = {};
    startRest(90); o.t1 = restTot;
    addRT(15); o.t2 = restTot; addRT(-15); o.t3 = restTot;
    setRestPreset(120); o.t4 = restTot; o.defRest = S.defRest; o.pref = S.exRestPref;
    skipRest(); o.apres = { iv: !!restIv };
    o.wkt = S.wkt;
    return o;
  }],
  ['S4 pause puis reprise : le temps en pause est cumulé, rien d\'autre ne change', async () => {
    S.wkt = { date: today(), startHour: 18, startTs: Date.now() - 600000, exs: [{ name: 'Dips', sets: [{ kg: 0, reps: 12, done: true, type: 'N' }] }] };
    persist();
    toggleWktPause(); const p1 = JSON.parse(JSON.stringify(S.wkt));
    toggleWktPause(); const p2 = JSON.parse(JSON.stringify(S.wkt));
    return { p1, p2, ls: localStorage.getItem('ft4_wkt') };
  }],
  ['S5 dropset : Drop après 2 séries faites, puis Retirer', async () => {
    S.wkt = { date: today(), startHour: 18, startTs: Date.now() - 600000, exs: [{ name: 'Développé Couché', sets: [
      { kg: 100, reps: 8, done: true, type: 'N', rir: 2, note: 'propre' }, { kg: 92.5, reps: 7, done: true, type: 'N' }, { kg: 92.5, reps: 7, done: false, type: 'N' }] }] };
    persist();
    _dropCfgEi = 0; _dropCfgPaliers = 3; _dropCfgPct = 20; _dropCfgDir = 'down'; applyDropset();
    const apresDrop = JSON.parse(JSON.stringify(S.wkt));
    removeDropset(0);
    return { apresDrop, apresRetrait: S.wkt, ls: localStorage.getItem('ft4_wkt') };
  }],
  ['S6 réordonner, vider (confirmé), abandonner (confirmé)', async () => {
    S.wkt = { date: today(), startHour: 18, startTs: Date.now() - 600000, exs: [{ name: 'Dips', sets: [{ kg: 0, reps: 12, done: true, type: 'N' }] },
      { name: 'Développé Couché', sets: [{ kg: 100, reps: 5, done: false, type: 'N' }] }] };
    persist();
    moveExBlock(0, 1); const ordre = S.wkt.exs.map(e => e.name);
    clearAllEx(); document.getElementById('confirm-ok').click(); await new Promise(r => setTimeout(r, 150));
    const vide = JSON.parse(JSON.stringify(S.wkt));
    clearWkt(); document.getElementById('confirm-ok').click(); await new Promise(r => setTimeout(r, 150));
    return { ordre, vide, apres: S.wkt, ls: localStorage.getItem('ft4_wkt'), brouillon: localStorage.getItem('ft4_wkt_draft') };
  }],
  ['S7 cardio seul : la séance s\'enregistre avec son cardio', async () => {
    S.wkt = null; S.sessions = []; persist();
    startWorkout(); S.wkt.cardio = { type: 'tapis', intensity: 'modere', duration: 25 }; persist();
    await finishWorkout(); await new Promise(r => setTimeout(r, 400));
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    return { wkt: S.wkt, sessions: S.sessions };
  }],
];

(async () => {
  if (!process.env.ROOT_A || !process.env.ROOT_B) { console.error('ROOT_A (master) et ROOT_B (branche) sont requis'); process.exit(2); }
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const jouer = async (root, scen) => {
    const s = serve(root); await new Promise(r => s.listen(0, r));
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    await cx.addInitScript(FIGE);
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_dsu'))return; sessionStorage.setItem('_dsu','1'); localStorage.clear();
      const D=${JSON.stringify(BASE)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
    await pg.goto('http://localhost:' + s.address().port + '/index.html'); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); goScreen('log', document.getElementById('nb-log')); });
    let r;
    try { r = await pg.evaluate('(' + scen.toString() + ')()'); } catch (e) { r = { plantage: String(e.message).slice(0, 160) }; }
    r = JSON.parse(JSON.stringify(r === undefined ? null : r));
    await cx.close(); s.close();
    return { r, errs };
  };
  let identiques = 0;
  for (const [nom, scen] of SCENARIOS) {
    const A = await jouer(process.env.ROOT_A, scen), B = await jouer(process.env.ROOT_B, scen);
    const a = JSON.stringify(A.r), bb = JSON.stringify(B.r);
    const same = a === bb && !(A.r && A.r.plantage) && !(B.r && B.r.plantage);
    if (same) identiques++;
    console.log((same ? '  IDENTIQUE  ' : '  ≠ DIFFÉRENT ') + nom + (A.errs.length || B.errs.length ? '   (erreurs de page : master ' + A.errs.length + ' · branche ' + B.errs.length + ')' : ''));
    if (!same) {
      // premier écart, lisible
      let i = 0; while (i < a.length && a[i] === bb[i]) i++;
      console.log('      master  : …' + a.slice(Math.max(0, i - 80), i + 120));
      console.log('      branche : …' + bb.slice(Math.max(0, i - 80), i + 120));
    }
    if (A.errs.length || B.errs.length) console.log('      erreurs : master ' + JSON.stringify(A.errs.slice(0, 2)) + ' · branche ' + JSON.stringify(B.errs.slice(0, 2)));
  }
  await b.close();
  console.log('\n──── ' + identiques + ' / ' + SCENARIOS.length + ' scénarios identiques ────');
  process.exit(identiques === SCENARIOS.length ? 0 : 1);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
