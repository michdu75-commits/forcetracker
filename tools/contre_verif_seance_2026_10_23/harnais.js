#!/usr/bin/env node
/* CONTRE-VÉRIFICATION DE L'AUDIT CHATGPT DU 23/10/2026 — banc de reproduction (versionné avec docs/CONTRE-VERIF-AUDIT-SEANCE-2026-10-23.md, hors passe) (session-C, Claude Séance).
   Sert la vraie app depuis <arbre> (master ou branche), réseau coupé, données FICTIVES, et exécute le VRAI code par ses
   fonctions globales. Chaque scénario part d'un état neuf (nouveau contexte). Sortie : une ligne JSON par scénario.
   Usage : node harnais.js <arbre> [scénario,…] */
require('../../tests/_garde_reseau.js');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2]);
const SEUL = process.argv[3] ? process.argv[3].split(',') : null;
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.gif':'image/gif'};
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
const BASE = { ft4_bw:'80', ft4_age:'40', ft4_ht:'178', ft4_gender:'H', ft4_goal:'force', ft4_ob2:'1', ft4_name:'Test', ft4_email:'t@t.t',
  ft4_devtoken:'f'.repeat(64), ft4_tester_eq_v1:'1', ft4_ok:'1', ft4_stmig1:'1', ft4_guide_shown:'1', ft4_wn_seen:'999', ft4_sessions:'[]', ft4_prs:'{}' };

const SCEN = {
  /* F01 / B01-B04 + lecteurs : une séance UNILATÉRALE terminée par le VRAI finishWorkout, + une bilatérale, + une ancienne sans uniConv */
  async F01() {
    const U = Object.keys(EX_UNI).map(id => exNom(id)).filter(n => n && estUnilateral(n))[0];
    const B = 'Développé Couché';
    const j = n => today(Date.now() - n * 864e5);
    S.sessions = [{ id: 1001, ts: Date.now() - 3 * 864e5, date: j(3), exs: [{ name: U, sets: [{ kg: 60, reps: 10, done: true, type: 'N' }] }],
      exercises: [{ name: U, sets: [{ kg: 60, reps: 10, done: true, type: 'N' }] }], volume: 600 }];   // ancienne : pas d'uniConv, charge notée EN TOTAL
    S.prs = {}; persist();
    S.wkt = { date: today(), exs: [{ name: U, sets: [{ kg: 30, reps: 10, done: true, type: 'N', at: 60000 }] }, { name: B, sets: [{ kg: 100, reps: 5, done: true, type: 'N', at: 120000 }] }],
      startHour: 10, startTs: Date.now() - 20 * 60000 };
    await finishWorkout();
    const s = S.sessions.find(x => x.date === today());
    const vb = _calVolByDay();
    _calSelDay = today(); const panel = _calDayPanel(vb, new Set());
    const tonnage = (panel.match(/([\d\s  .,]+(?:kg|t))\s*<\/div>\s*<div[^>]*>TONNAGE/) || [])[1] || (panel.replace(/<[^>]+>/g, ' ').match(/(\S+\s*(?:kg|t))\s+TONNAGE/) || [])[1] || null;
    renderSessions(); const carte = [...document.querySelectorAll('.sess-vol2')].map(e => e.textContent.trim());
    const csv = _histoLignes(false).filter(r => r.date === today() && r.exercise === U).reduce((a, r) => a + (+r.volume || 0), 0);
    const vieux = S.sessions.find(x => x.id === 1001);
    return { U, uniLabel: uniLabel(U), sauve: s.volume, uniConv: s.uniConv, workVol: _workVol(s), calSessVol: _calSessVol(s), calJour: vb[today()],
      panneauTonnage: tonnage, cartesHistorique: carte, csvSommeU: csv,
      ancien: { sauve: vieux.volume, workVol: _workVol(vieux), calSessVol: _calSessVol(vieux) } };
  },
  /* F02 / B02 : ouvrir la séance et « 💾 Enregistrer » SANS RIEN CHANGER (le vrai chemin du bouton) */
  async F02() {
    const U = Object.keys(EX_UNI).map(id => exNom(id)).filter(n => n && estUnilateral(n))[0];
    S.sessions = []; S.prs = {}; persist();
    S.wkt = { date: today(), exs: [{ name: U, sets: [{ kg: 30, reps: 10, done: true, type: 'N', at: 60000 }] }], startHour: 10, startTs: Date.now() - 15 * 60000 };
    await finishWorkout();
    const s0 = JSON.parse(JSON.stringify(S.sessions.find(x => x.date === today())));
    openSessDetail(s0.ts || s0.id); saveSessEdits();
    const s1 = S.sessions.find(x => (x.ts || x.id) === (s0.ts || s0.id));
    renderSessions(); const carte = [...document.querySelectorAll('.sess-vol2')].map(e => e.textContent.trim());
    // contre-épreuve : une séance BILATÉRALE seule, même geste
    S.sessions = []; persist();
    S.wkt = { date: today(), exs: [{ name: 'Développé Couché', sets: [{ kg: 100, reps: 5, done: true, type: 'N', at: 60000 }] }], startHour: 10, startTs: Date.now() - 15 * 60000 };
    await finishWorkout();
    const b0 = JSON.parse(JSON.stringify(S.sessions.find(x => x.date === today())));
    openSessDetail(b0.ts || b0.id); saveSessEdits();
    const b1 = S.sessions.find(x => (x.ts || x.id) === (b0.ts || b0.id));
    return { U, avant: s0.volume, apres: s1.volume, uniConvGarde: s1.uniConv, workVolApres: _workVol(s1), caloriesAvant: s0.calories, caloriesApres: s1.calories,
      carteApres: carte, bilateral: { avant: b0.volume, apres: b1.volume } };
  },
  /* F03 / B07 : séries N, N, É, W faites sur le même exercice dans la fenêtre — volume par muscle (Progrès + Milo) */
  async F03() {
    const mk = types => ({ id: 2001, ts: Date.now() - 864e5, date: today(Date.now() - 864e5), uniConv: 1,
      exs: [{ name: 'Développé Couché', sets: types.map(t => ({ kg: 80, reps: 8, done: true, type: t })) }] });
    const pec = () => { const r = _volumeParMuscle(Date.now(), 14); const l = r.liste.find(x => x.code === 'pec'); return { pec: l ? l.series : 0, series: r.series }; };
    S.sessions = [mk(['N', 'N', 'É', 'W'])]; const avecW = pec(); const ctx = (typeof _ctxVolumeMuscles === 'function') ? _ctxVolumeMuscles() : '';
    const wv = _workVol(S.sessions[0]);
    S.sessions = [mk(['N', 'N', 'É'])]; const sansW = pec();
    S.sessions = [mk(['N', 'N'])]; const deuxN = pec();
    return { avecW, sansW, deuxN, workVolAvecW: wv, milo: (ctx.match(/[^\n]*[Pp]ectora[^\n]*/) || [''])[0].slice(0, 160) };
  },
  /* F04 / B13 : un muscle SECONDAIRE sur deux exercices, primaire sur aucun */
  async F04() {
    const noms = [...new Set(Object.values(EXLIB).flat().map(e => typeof e === 'string' ? e : (e && (e.n || e.name))).filter(Boolean))];
    const sec = noms.filter(n => { const m = exMuscles(exNomCatalogue(n)); return m && (m.s || []).includes('triceps') && !(m.p || []).includes('triceps'); });
    const two = sec.slice(0, 2), one = sec.slice(0, 1);
    const lire = exs => { showMuscleMap(exs.map(n => ({ name: n, sets: [{ kg: 50, reps: 8, done: true, type: 'N' }] })));
      const t = document.getElementById('mm-list').textContent; closeMuscleMap();
      const sc = _mscScores(exs.map(n => ({ name: n, sets: [{ done: true }] }))).sc;
      const lab = _MG.triceps.label;
      return { scoreTriceps: sc.triceps || 0, dansPrimaires: (t.split('Secondaires')[0] || '').includes(lab), texte: t.slice(0, 220),
        couleurMini: (_mscSVGmini(_mscScores(exs.map(n => ({ name: n, sets: [{ done: true }] }))), 'face').match(/#FF5555/g) || []).length };
    };
    return { exercices: two, deux: lire(two), un: lire(one), tricepsLabel: _MG.triceps.label };
  },
  /* F05 / B14 : exercice PERSO dont le nom déclenche une règle _MEX, muscles cochés différents */
  async F05() {
    const essai = (nom, p, s) => {
      S.customExercises = [{ n: nom, g: 'Jambes', custom: true, muscles: { p, s } }];
      const fig = _mscScores([{ name: nom, sets: [{ done: true }] }]).sc;
      S.sessions = [{ id: 3001, ts: Date.now() - 864e5, date: today(Date.now() - 864e5), uniConv: 1, exs: [{ name: nom, sets: [{ kg: 40, reps: 10, done: true, type: 'N' }] }] }];
      const vol = _volumeParMuscle(Date.now(), 14).liste.map(x => x.code);
      const regle = (typeof _MEX !== 'undefined') ? (_MEX.find(r => r.re.test(_naz(nom))) || null) : null;
      return { nom, catalogue: !!exMuscles(exNomCatalogue(nom)), regleMEX: regle ? String(regle.re) : null, figurine: Object.keys(fig).filter(k => fig[k] >= 2), volumeProgres: vol };
    };
    return { declenche: essai('Curl Maison Zorglub', ['quads'], ['glutes']), neutre: essai('Zorglub Maison Spécial', ['quads'], ['glutes']) };
  },
  /* F06 / B06 : deux séances aujourd'hui (250 et 350 kcal) — tuile « Séance » de Nutrition */
  async F06() {
    const t = today();
    S.sessions = [{ id: 4001, ts: Date.now() - 6 * 3600e3, date: t, uniConv: 1, calories: 250, exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }] },
                  { id: 4002, ts: Date.now() - 3600e3, date: t, uniConv: 1, calories: 350, exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 5, done: true, type: 'N' }] }] }];
    _trierSeances(S.sessions); persist(); renderNutrition();
    const deux = (document.getElementById('nu-session-cal') || {}).textContent;
    S.sessions = [S.sessions[0]]; persist(); renderNutrition();
    const une = (document.getElementById('nu-session-cal') || {}).textContent;
    return { deuxSeances: deux, uneSeance: une, ordre: 'S.sessions[0] = la plus récente (tri _trierSeances)' };
  },
  /* F07 / B15 : couleur du calendrier après une édition qui garde les mêmes noms */
  async F07() {
    const s = { id: 5001, ts: Date.now() - 864e5, date: today(Date.now() - 864e5), uniConv: 1,
      exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }, { name: 'Développé Couché', sets: [{ kg: 80, reps: 5, done: false, type: 'N' }] }] };
    S.sessions = [s];
    const avant = _calSessMix(s);
    s.exs[0].sets[0].done = false; s.exs[1].sets[0].done = true;     // mêmes noms, autres séries faites
    const apresCache = _calSessMix(s);
    for (const k of Object.keys(_calColorCache)) delete _calColorCache[k];
    const apresFrais = _calSessMix(s);
    return { avant, apresCache, apresFrais };
  },
  /* F08 / B10-B12 : record porté par une séance supprimée, puis par une séance éditée à la baisse */
  async F08() {
    const E = 'Développé Couché', j = n => today(Date.now() - n * 864e5);
    // ⚠️ openSessDetail prend `ts || id` (le ts d'abord) — passer l'id seul n'ouvre RIEN (piège déjà noté au journal, ft-v1189)
    const TA = Date.now() - 5 * 864e5, TB = Date.now() - 2 * 864e5;
    const base = () => {
      S.sessions = [{ id: 6001, ts: TA, date: j(5), uniConv: 1, exs: [{ name: E, sets: [{ kg: 60, reps: 5, done: true, type: 'N' }] }] },
                    { id: 6002, ts: TB, date: j(2), uniConv: 1, exs: [{ name: E, sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }] }];
      S.sessions.forEach(s => s.exercises = s.exs); _trierSeances(S.sessions);
      S.prs = { [E]: { kg: 100, reps: 5, rm1: bz(100, 5), date: j(2) } }; persist(); };
    base(); openSessDetail(TB); const ouvert = _sessId === TB; deleteSessOrConfirm(); deleteSessOrConfirm();
    const apresSuppr = { ouvert, seances: S.sessions.length, pr: S.prs[E], recalc: (() => { const r = _prsDepuisSeances(); return { corriges: r.corriges, horsHistorique: r.horsHistorique }; })() };
    base(); openSessDetail(TB); _sessEdits.exs[0].sets[0].kg = 50; saveSessEdits();
    const apresBaisse = { pr: S.prs[E], seance: S.sessions.find(s => s.id === 6002).exs[0].sets[0].kg };
    base(); openSessDetail(TA); deleteSessOrConfirm(); deleteSessOrConfirm();
    const supprAutre = { pr: S.prs[E] };
    return { rm1_60x5: bz(60, 5), rm1_100x5: bz(100, 5), apresSuppr, apresBaisse, supprAutre };
  },
  /* F19 / B17 : aucune nuit notée, une séance vieille de 20 jours — ce que l'Accueil affirme */
  async F19() {
    const lire = () => { renderHome(); const h = document.getElementById('home-hero') || document.querySelector('[id*="hero"]') || document.body;
      return (h.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 260); };
    S.sleepLog = []; S.sessions = [{ id: 7001, ts: Date.now() - 20 * 864e5, date: today(Date.now() - 20 * 864e5), uniConv: 1, exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }] }];
    persist(); const d1 = calcRecoveryDetail(); const avecSeance = { score: d1.score, info: getRecoveryInfo(d1.score), texte: lire(), conseils: (d1.tips || []).map(t => t.text || t).slice(0, 4) };
    S.age = 25; persist(); const d2 = calcRecoveryDetail(); const jeune = { score: d2.score, info: getRecoveryInfo(d2.score), texte: lire() };
    S.age = 40; S.sessions = []; persist(); const d0 = calcRecoveryDetail(); const rien = { score: d0.score, texte: lire() };
    return { avecSeance, jeune, rien };
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
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); window.toast = () => {}; });
    let res;
    try { res = await pg.evaluate(`(${fn.toString().replace(/^async\s+\w+\s*\(/, 'async function(')})()`); }
    catch (e) { res = { PLANTAGE: String(e.message).slice(0, 300) }; }
    console.log(JSON.stringify({ scenario: nom, res, errs }));
    await cx.close();
  }
  await b.close(); srv.close();
})().catch(e => { console.log('PLANTAGE ' + e.message); process.exit(2); });
