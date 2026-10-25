#!/usr/bin/env node
/* CONTRE-VÉRIFICATION DE L'AUDIT CHATGPT DU 23/10/2026 — 2ᵉ banc (hors passe) (session-C) : les cas P0 de la matrice qui
   n'étaient pas encore conduits en direct. Même montage que harnais.js : la vraie app servie depuis <arbre>, réseau coupé
   (garde + routes locales seules), données FICTIVES, un contexte neuf par scénario, le VRAI code appelé par ses fonctions.
   Ce qui est remplacé est dit dans chaque scénario (toast enregistré, fetch simulé, quota simulé) — rien d'autre.
   Usage : node harnais2.js <arbre> [scénario,…] */
require('../../tests/_garde_reseau.js');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2]);
const SEUL = process.argv[3] ? process.argv[3].split(',') : null;
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.gif':'image/gif'};
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
const BASE = { ft4_bw:'80', ft4_age:'40', ft4_ht:'178', ft4_gender:'H', ft4_goal:'force', ft4_act:'1.55', ft4_work:'bureau', ft4_ob2:'1', ft4_name:'Test', ft4_email:'t@t.t',
  ft4_devtoken:'f'.repeat(64), ft4_tester_eq_v1:'1', ft4_ok:'1', ft4_stmig1:'1', ft4_guide_shown:'1', ft4_wn_seen:'999', ft4_sessions:'[]', ft4_prs:'{}' };

const SCEN = {
  /* A01 : « Terminer » une séance VIDE (ni exercice ni cardio), par le vrai bouton (terminerSeance) */
  async A01() {
    S.wkt = { date: today(), exs: [], startHour: 10, startTs: Date.now() - 5 * 60000 }; persist();
    const n0 = S.sessions.length; terminerSeance(); await new Promise(r => setTimeout(r, 300));
    return { toasts: window.__T, seancesAvant: n0, seancesApres: S.sessions.length, wktGarde: !!S.wkt, confirmOuvert: document.getElementById('ov-confirm').classList.contains('open') };
  },
  /* A02 : un exercice prévu, AUCUNE série faite — « Terminer », puis « Terminer quand même » */
  async A02() {
    S.wkt = { date: today(), exs: [{ name: 'Squat Barre', sets: [1, 2, 3].map(() => ({ kg: 100, reps: 5, done: false, type: 'N' })) }], startHour: 10, startTs: Date.now() - 5 * 60000 }; persist();
    const draft0 = localStorage.getItem('ft4_wkt_draft');
    const n0 = S.sessions.length; terminerSeance();
    const question = document.getElementById('confirm-title').textContent + ' — ' + document.getElementById('confirm-msg').textContent;
    confirmOk(); await new Promise(r => setTimeout(r, 300));
    return { question, toasts: window.__T, seancesAvant: n0, seancesApres: S.sessions.length, wktGarde: !!(S.wkt && S.wkt.exs && S.wkt.exs.length === 1),
      brouillonAvant: !!draft0, brouillonApres: localStorage.getItem('ft4_wkt_draft') === draft0 };
  },
  /* A09 : DEUX appuis rapprochés sur « Terminer » (séance faite) */
  async A09() {
    S.wkt = { date: today(), exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N', at: 60000 }] }], startHour: 10, startTs: Date.now() - 10 * 60000 }; persist();
    const n0 = S.sessions.length;
    terminerSeance(); terminerSeance(); await new Promise(r => setTimeout(r, 600));
    const viaBouton = S.sessions.length - n0;
    S.wkt = { date: today(), exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 5, done: true, type: 'N', at: 60000 }] }], startHour: 11, startTs: Date.now() - 10 * 60000 }; persist();
    const n1 = S.sessions.length; await Promise.all([finishWorkout(), finishWorkout()]);
    return { viaBouton, viaDoubleAppelDirect: S.sessions.length - n1, stockees: JSON.parse(localStorage.getItem('ft4_sessions')).length };
  },
  /* A11 / A12 : remplacer une presse à 240 kg par un rowing (historique 40×10 puis 50×8), non commencée puis à moitié faite */
  async A11A12() {
    const A = 'Presse à Cuisses Iso-Latérale', B = 'Rowing Hammer Strength';
    S.sessions = [{ id: 8001, ts: Date.now() - 3 * 864e5, date: today(Date.now() - 3 * 864e5), uniConv: 1, exs: [{ name: B, sets: [{ kg: 40, reps: 10, done: true, type: 'N' }, { kg: 50, reps: 8, done: true, type: 'N' }] }] }];
    S.sessions[0].exercises = S.sessions[0].exs; S.prs = { [B]: { kg: 50, reps: 8, rm1: bz(50, 8), date: S.sessions[0].date } }; persist();
    const presse = done => ({ name: A, sets: [0, 1, 2].map(i => ({ kg: 240, reps: 10, done: i < done, type: 'N', at: i < done ? 60000 * (i + 1) : undefined })) });
    // A11 : rien de fait
    S.wkt = { date: today(), exs: [presse(0)], startHour: 10, startTs: Date.now() - 10 * 60000 }; persist();
    _replaceEi = 0; _replaceExInWorkout(B);
    const a11 = S.wkt.exs.map(e => ({ name: e.name, sets: e.sets.map(s => s.kg + '×' + s.reps + (s.done ? '✓' : '')) }));
    // A12 : 2 séries faites sur la presse, puis remplacement, puis fin
    S.wkt = { date: today(), exs: [presse(2)], startHour: 10, startTs: Date.now() - 10 * 60000 }; persist();
    _replaceEi = 0; _replaceExInWorkout(B);
    const a12 = S.wkt.exs.map(e => ({ name: e.name, sets: e.sets.map(s => s.kg + '×' + s.reps + (s.done ? '✓' : '')) }));
    const prB0 = JSON.stringify(S.prs[B]);
    await finishWorkout();
    const s = S.sessions.find(x => x.date === today());
    return { A, B, a11, a12, apresFin: { exercices: s.exs.map(e => e.name + ':' + e.sets.filter(x => x.done).length + ' faites'), volume: s.volume,
      prPresse: S.prs[A] || null, prRowingInchange: JSON.stringify(S.prs[B]) === prB0 } };
  },
  /* B05 : le MÊME exercice en deux blocs dans une séance (5 puis 3 séries) */
  async B05() {
    const E = 'Développé Couché';
    const sets = (n, kg) => Array.from({ length: n }, (_, i) => ({ kg, reps: 5, done: true, type: 'N', at: 60000 * (i + 1) }));
    S.prs = { [E]: { kg: 80, reps: 5, rm1: bz(80, 5), date: today(Date.now() - 9 * 864e5) } }; persist();
    S.wkt = { date: today(), exs: [{ name: E, sets: sets(5, 80) }, { name: 'Squat Barre', sets: sets(2, 100) }, { name: E, sets: sets(3, 90) }], startHour: 10, startTs: Date.now() - 40 * 60000 };
    await finishWorkout();
    const s = S.sessions.find(x => x.date === today());
    const vp = _volumeParMuscle(Date.now(), 14).liste.find(x => x.code === 'pec');
    const vb = _calVolByDay();
    const csv = _histoLignes(false).filter(r => r.date === today() && r.exercise === E);
    return { volumeSauve: s.volume, attendu: 5 * 80 * 5 + 3 * 90 * 5 + 2 * 100 * 5, calendrier: vb[today()], seriesPecProgres: vp ? vp.series : 0,
      pr: S.prs[E], lignesCsv: csv.length, prUnique: Object.keys(S.prs).filter(k => k === E).length };
  },
  /* B09 / B10 : 1ʳᵉ fois sur un exercice (première référence), puis une vraie amélioration (record) */
  async B09B10() {
    const E = 'Rowing Hammer Strength';
    S.prs = {}; persist();
    S.wkt = { date: today(Date.now() - 864e5), exs: [{ name: E, sets: [{ kg: 80, reps: 5, done: true, type: 'N', at: 60000 }] }], startHour: 10, startTs: Date.now() - 20 * 60000 };
    await finishWorkout(); const fin1 = (document.getElementById('ov-session-end') || {}).textContent || '';
    const pr1 = JSON.parse(JSON.stringify(S.prs[E]));
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    S.wkt = { date: today(), exs: [{ name: E, sets: [{ kg: 85, reps: 5, done: true, type: 'N', at: 60000 }] }], startHour: 11, startTs: Date.now() - 20 * 60000 };
    await finishWorkout(); const fin2 = (document.getElementById('ov-session-end') || {}).textContent || '';
    return { pr1, fin1Record: /record/i.test(fin1), fin1Reference: /premi[eè]re|r[ée]f[ée]rence/i.test(fin1), pr2: S.prs[E], fin2Record: /record/i.test(fin2) };
  },
  /* B16 / F13 : la séance du jour (600 kcal muscu + 200 cardio) ne doit pas gonfler la cible ; ce que dit l'aide */
  async B16() {
    S.activityLevel = 1.55; S.sessions = []; persist();
    const t0 = calcTDEE(), k0 = autoKcal();
    S.sessions = [{ id: 9001, ts: Date.now() - 3600e3, date: today(), uniConv: 1, calories: 800, calData: { total: 800, cardio: 200 }, cardio: { type: 'velo', duration: 20, intensity: 'moderee' },
      exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }] }];
    persist(); const t1 = calcTDEE(), k1 = autoKcal();
    renderNutrition();
    const tuile = (document.getElementById('nu-session-cal') || {}).textContent || null;
    const aide = JSON.stringify((_HELP_DATA.nutrition || {}).tips || []).match(/[^"]*cardio[^"]*TDEE[^"]*/i);
    return { tdeeSans: t0, tdeeAvec: t1, cibleSans: k0, cibleAvec: k1, tuile, aideCardioTDEE: aide ? aide[0].slice(0, 160) : null };
  },
  /* E01 : stockage plein au moment de « Terminer ». Le quota est SIMULÉ sur la seule clé ft4_sessions (au-delà de LIM
     caractères, setItem lève QuotaExceededError) ; 60 séances anciennes déjà sur le disque. a = 50 séances tiennent ;
     b = rien ne tient ; c = 50 tiennent mais la petite clé du drapeau ft4_hist_tronque est refusée aussi. */
  async E01() {
    const vieilles = Array.from({ length: 60 }, (_, i) => ({ id: 10000 + i, ts: Date.now() - (i + 2) * 864e5, date: today(Date.now() - (i + 2) * 864e5), uniConv: 1, volume: 500,
      exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }] }));
    const taille50 = JSON.stringify(vieilles.slice(0, 50)).length, taille60 = JSON.stringify(vieilles).length;
    const orig = Storage.prototype.setItem;
    const essai = async (lim, bloqueDrapeau) => {
      Storage.prototype.setItem = orig; localStorage.removeItem('ft4_hist_tronque'); S.histTronque = false;
      S.sessions = JSON.parse(JSON.stringify(vieilles)); S.prs = { 'Squat Barre': { kg: 100, reps: 5, rm1: bz(100, 5), date: vieilles[0].date } }; S.wkt = null; persist();
      S.wkt = { date: today(), exs: [{ name: 'Squat Barre', sets: [{ kg: 110, reps: 5, done: true, type: 'N', at: 60000 }] }], startHour: 10, startTs: Date.now() - 20 * 60000 }; persist();
      const brouillon0 = localStorage.getItem('ft4_wkt_draft');
      window.__T = [];
      Storage.prototype.setItem = function (k, v) {
        if (this === localStorage && ((k === 'ft4_sessions' && String(v).length > lim) || (bloqueDrapeau && k === 'ft4_hist_tronque'))) { const e = new DOMException('quota', 'QuotaExceededError'); throw e; }
        return orig.apply(this, arguments); };
      let err = null; try { await finishWorkout(); } catch (e) { err = String(e.message); }
      Storage.prototype.setItem = orig;
      const disque = JSON.parse(localStorage.getItem('ft4_sessions') || '[]');
      return { erreur: err, toasts: window.__T.slice(0, 4), enMemoire: S.sessions.length, surDisque: disque.length, nouvelleSurDisque: disque.some(s => s.date === today()),
        drapeau: localStorage.getItem('ft4_hist_tronque'), histTronque: !!S.histTronque, seanceFermee: !(S.wkt && S.wkt.exs && S.wkt.exs.length), brouillonGarde: !!brouillon0 && localStorage.getItem('ft4_wkt_draft') === brouillon0,
        prRestaure: S.prs['Squat Barre'] && S.prs['Squat Barre'].kg, ecranErreur: ((document.getElementById('log-finish') || {}).textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90) };
    };
    const lim = Math.round((taille50 + taille60) / 2);   // 50 séances (49 + la nouvelle) tiennent, 61 non
    const a = await essai(lim, false);
    const b = await essai(10, false);
    const c = await essai(lim, true);
    return { taille50, taille60, lim, a, b, c };
  },
  /* E02 : serveur des séances injoignable, puis réponse d'erreur, puis accusé positif (fetch SIMULÉ) */
  async E02() {
    const appels = []; let mode = 'panne';
    window.fetch = async (u, o) => { const body = (o && o.body) ? String(o.body) : ''; let a = ''; try { a = JSON.parse(body).action; } catch (e) {}
      appels.push({ a, mode }); if (a !== 'logSession') return new Response('{"status":"ok"}');
      if (mode === 'panne') throw new TypeError('Failed to fetch');
      if (mode === 'erreur') return new Response('{"status":"error","error":"Sheet locked"}');
      return new Response('{"status":"ok","count":1}'); };
    window._restauAttendue = () => false;
    S.connected = true; S.url = DEFAULT_URL; S.email = 't@t.t'; S.sessions = []; persist();
    S.wkt = { date: today(), exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N', at: 60000 }] }], startHour: 10, startTs: Date.now() - 20 * 60000 };
    window.__T = []; await finishWorkout();
    const s = S.sessions.find(x => x.date === today());
    const r1 = { synced: s.synced, attente: _countUnsyncedSessions(), toast: (window.__T.find(t => /séance/i.test(t)) || '').slice(0, 60) };
    mode = 'erreur'; await _retrySheetQueue(); const r2 = { synced: s.synced, attente: _countUnsyncedSessions() };
    mode = 'ok'; await _retrySheetQueue(); const r3 = { synced: s.synced, attente: _countUnsyncedSessions(), surDisque: JSON.parse(localStorage.getItem('ft4_sessions'))[0].synced };
    const n = appels.filter(x => x.a === 'logSession').length; await _retrySheetQueue();
    return { panne: r1, erreurServeur: r2, accuse: r3, envoisLogSession: n, renvoiApresAccuse: appels.filter(x => x.a === 'logSession').length - n };
  },
  /* E04 : supprimer une séance qui a un débrief, une autre séance le MÊME jour en a un aussi */
  async E04() {
    const t = today();
    const A = { id: 11001, ts: Date.now() - 5 * 3600e3, date: t, uniConv: 1, exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }] };
    const B = { id: 11002, ts: Date.now() - 3600e3, date: t, uniConv: 1, exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 5, done: true, type: 'N' }] }] };
    S.sessions = [B, A]; S.sessions.forEach(s => s.exercises = s.exs); persist();
    const ka = _dbfCle(A), kb = _dbfCle(B);
    _dbfEnregistrer(ka, 'Débrief de la séance A : jambes solides.', 'test'); _dbfEnregistrer(kb, 'Débrief de la séance B : poussée régulière.', 'test');
    openSessDetail(A.ts); deleteSessOrConfirm(); deleteSessOrConfirm();
    return { seancesRestantes: S.sessions.map(s => s.id), debriefA: !!_dbfTexteDe(ka), debriefB: !!_dbfTexteDe(kb), cles: Object.keys(_dbfMagasin().seances) };
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
