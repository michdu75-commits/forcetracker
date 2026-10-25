#!/usr/bin/env node
/* CONTRE-VÉRIFICATION (session-C) — 3ᵉ banc (hors passe) : je rejoue MOI-MÊME les constats décisifs des deux vérifications
   déléguées (calories, et deux effets de bord du détail d'une séance qu'elles ont signalés). Même montage que harnais.js :
   vraie app, réseau coupé, données fictives, un contexte neuf par scénario. `prompt` est remplacé quand la vraie fonction
   le demande (on y répond comme la personne). Usage : node harnais3.js <arbre> [scénario,…] */
require('../../tests/_garde_reseau.js');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2]);
const SEUL = process.argv[3] ? process.argv[3].split(',') : null;
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.gif':'image/gif'};
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
const BASE = { ft4_bw:'82', ft4_age:'40', ft4_ht:'178', ft4_gender:'H', ft4_goal:'force', ft4_act:'1.55', ft4_work:'bureau', ft4_ob2:'1', ft4_name:'Test', ft4_email:'t@t.t',
  ft4_devtoken:'f'.repeat(64), ft4_tester_eq_v1:'1', ft4_ok:'1', ft4_stmig1:'1', ft4_guide_shown:'1', ft4_wn_seen:'999', ft4_sessions:'[]', ft4_prs:'{}', ft4_rest:'130' };

const SCEN = {
  /* K1 : corriger la DURÉE d'une séance par ⏱️ (vraie fonction editSessDuree) — que deviennent ses calories ? */
  async K1() {
    const T = Date.now() - 2 * 864e5;
    S.sessions = [{ id: T, ts: T, date: today(T), uniConv: 1, duration: 3600, exs: [{ name: 'Squat Barre', sets: [1, 2, 3, 4, 5, 6].map(i => ({ kg: 100, reps: 5, done: true, type: 'N' })) },
      { name: 'Développé Couché', sets: [1, 2, 3, 4, 5, 6].map(i => ({ kg: 80, reps: 8, done: true, type: 'N' })) }] }];
    S.sessions[0].exercises = S.sessions[0].exs;
    const cd = calcSessionCalories(S.sessions[0]); S.sessions[0].calories = cd.total; S.sessions[0].calData = cd; persist();
    const avant = { duree: S.sessions[0].duration, kcal: S.sessions[0].calories };
    openSessDetail(T); window.prompt = () => '90'; editSessDuree();
    const s1 = S.sessions[0]; const apresDuree = { duree: s1.duration, kcal: s1.calories, recalculAttendu: calcSessionCalories(s1).total };
    renderSessions(); const carte = [...document.querySelectorAll('.sess-card, .sess-c, [onclick*="openSessDetail"]')].map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(t => /kcal|min/.test(t)).slice(0, 1);
    // la personne ferme sans « Enregistrer » (la durée, elle, est déjà « enregistrée ✅ »)
    closeSessDetail();
    const apresFermeture = JSON.parse(localStorage.getItem('ft4_sessions'))[0];
    return { avant, apresDuree, carte, stockeApresFermeture: { duree: apresFermeture.duration, kcal: apresFermeture.calories } };
  },
  /* K2 : une modification NON enregistrée dans le détail (une charge), puis ⏱️ durée — la modification survit-elle ? */
  async K2() {
    const T = Date.now() - 2 * 864e5;
    S.sessions = [{ id: T, ts: T, date: today(T), uniConv: 1, duration: 3600, exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }] }];
    S.sessions[0].exercises = S.sessions[0].exs; persist();
    openSessDetail(T); updateSessSet(0, 0, 'kg', '120');
    const avantDuree = _sessEdits.exs[0].sets[0].kg;
    window.prompt = () => '75'; editSessDuree();
    const apresDuree = _sessEdits ? _sessEdits.exs[0].sets[0].kg : null;
    saveSessEdits();
    return { chargeTapee: avantDuree, chargeDansLeDetailApresDuree: apresDuree, chargeEnregistree: S.sessions[0].exs[0].sets[0].kg, dureeEnregistree: S.sessions[0].duration };
  },
  /* K3 : séance enregistrée à 82 kg ; le poids passe à 95 kg ; on ouvre la séance et on « Enregistre » SANS RIEN CHANGER */
  async K3() {
    S.bw = 82; S.wkt = { date: today(), exs: [{ name: 'Squat Barre', sets: [1, 2, 3].map(i => ({ kg: 100, reps: 5, done: true, type: 'N', at: 60000 * i })) }], startHour: 10, startTs: Date.now() - 30 * 60000 };
    await finishWorkout(); const s0 = JSON.parse(JSON.stringify(S.sessions[0]));
    S.bw = 95; persist();
    openSessDetail(s0.ts || s0.id); saveSessEdits();
    const s1 = S.sessions[0];
    return { kcalA82: s0.calories, kcalApresEnregistrementSansChangement: s1.calories, dureeIdentique: s0.duration === s1.duration };
  },
  /* K4 (F09) : la même séance, repos par défaut 60 / 130 / 240 s, préférence de repos par exercice, types É/X — kcal ? */
  async K4() {
    const sess = (dur) => ({ id: 1, ts: Date.now(), date: today(), uniConv: 1, duration: dur, exs: [{ name: 'Squat Barre', sets: [1, 2, 3, 4, 5, 6].map(() => ({ kg: 100, reps: 5, done: true, type: 'N' })) },
      { name: 'Développé Couché', sets: [1, 2, 3, 4, 5, 6].map(() => ({ kg: 80, reps: 8, done: true, type: 'N' })) }] });
    const lire = (dur) => { const c = calcSessionCalories(sess(dur)); return [c.total, c.restMin, c.transitionMin]; };
    const r = {};
    for (const rep of [60, 130, 240]) { S.defRest = rep; r['repos' + rep] = { '60min': lire(3600), '20min': lire(1200) }; }
    S.defRest = 130; const ref = lire(3600);
    S.exRestPref = { 'Squat Barre': 300, 'Développé Couché': 45 }; const avecPref = lire(3600);
    S.exRestPref = {};
    return { r, prefIgnoree: JSON.stringify(ref) === JSON.stringify(avecPref), ref, avecPref, MET_REST: typeof MET_REST !== 'undefined' ? MET_REST : null, MET_TRANSITION: typeof MET_TRANSITION !== 'undefined' ? MET_TRANSITION : null };
  },
  /* K5 (F12) : MET retenus pour l'Oiseau et ses voisins */
  async K5() {
    const n = ['Oiseau', 'Élévations Latérales', 'Face Pull', 'Curl Haltères', 'Développé Couché'];
    return n.map(x => ({ nom: x, existe: !!exMuscles(exNomCatalogue(x)), muscles: exMuscles(exNomCatalogue(x)), MET: getExerciseMET(x) }));
  },
  /* K6 (F10) : forfait d'échauffement / retour au calme — sans cardio, avec cardio avant, avec durée SAISIE */
  async K6() {
    const base = { id: 1, ts: Date.now(), date: today(), uniConv: 1, duration: 3600, exs: [{ name: 'Squat Barre', sets: [1, 2, 3, 4, 5, 6].map(() => ({ kg: 100, reps: 5, done: true, type: 'N' })) },
      { name: 'Développé Couché', sets: [1, 2, 3, 4, 5, 6].map(() => ({ kg: 80, reps: 8, done: true, type: 'N' })) }] };
    const c0 = calcSessionCalories(base);
    const c1 = calcSessionCalories(Object.assign({}, base, { cardioAvant: { type: 'velo', duration: 10, intensity: 'moderee' } }));
    const c2 = calcSessionCalories(Object.assign({}, base, { cardioAvant: { type: 'velo', duration: 10, intensity: 'moderee' }, cardio: { type: 'velo', duration: 10, intensity: 'moderee' } }));
    const c3 = calcSessionCalories(Object.assign({}, base, { durationDite: true }));
    const k = c => ({ total: c.total, warmupMin: c.warmupMin, transitionMin: c.transitionMin, totalMin: c.totalMin, dureeMin: c.dureeMin });
    return { sansCardio: k(c0), cardioAvant: k(c1), avantEtApres: k(c2), dureeSaisie: k(c3) };
  },
  /* K7 (C09) : bornes atteignables par l'écran — durée 0 / absente / énorme, poids absent, séance cardio seule */
  async K7() {
    const ex = [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }];
    const v = [];
    for (const d of [0, undefined, 36000]) v.push(calcSessionCalories({ id: 1, date: today(), exs: ex, duration: d }).total);
    const bw = S.bw; S.bw = 0; v.push(calcSessionCalories({ id: 1, date: today(), exs: ex, duration: 1800 }).total); S.bw = bw;
    v.push(calcSessionCalories({ id: 1, date: today(), exs: [], cardio: { type: 'velo', duration: 20, intensity: 'moderee' }, duration: 1200 }).total);
    return { valeurs: v, toutesFinies: v.every(x => typeof x === 'number' && isFinite(x)) };
  },
};

(async () => {
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [nom, fn] of Object.entries(SCEN)) {
    if (SEUL && !SEUL.includes(nom)) continue;
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_a'))return; sessionStorage.setItem('_a','1'); localStorage.clear(); const D=${JSON.stringify(BASE)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); }catch(e){} })();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
    await pg.goto('http://localhost:' + srv.address().port + '/index.html'); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); window.__T = []; window.toast = (m) => { window.__T.push(String(m)); }; });
    let res;
    try { res = await pg.evaluate(`(${fn.toString().replace(/^async\s+\w+\s*\(/, 'async function(')})()`); }
    catch (e) { res = { PLANTAGE: String(e.message).slice(0, 300) }; }
    console.log(JSON.stringify({ scenario: nom, res, errs }));
    await cx.close();
  }
  await b.close(); srv.close();
})().catch(e => { console.log('PLANTAGE ' + e.message); process.exit(2); });
