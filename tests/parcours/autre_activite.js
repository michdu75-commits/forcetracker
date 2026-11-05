/* ═══════════════════════════════════════════════════════════════════════════════
   🚶 MISSION « AUTRE ACTIVITÉ » + CALORIES PERSONNALISABLES (05/11/2026) — blocs C-ACT-* — session-C (Claude N°2, Séance), mission de Michel
   (docs/AUTRE-ACTIVITE-CALORIES.md : audit F1-F18, matrice des 24 composants, décisions D-ACT-1..5, tests T01-T50 + scénarios découverts).
   Ce que les témoins CONDUISENT : la vraie app servie en local (réseau coupé, données fictives, horloge fixe), de VRAIS clics et de VRAIES frappes dans le
   formulaire « Autre activité », le vrai `finishWorkout`, le vrai détail d'une séance, le vrai calendrier, les vrais bilans, le vrai contexte de Milo.
   Ce qu'ils OBSERVENT : les enregistrements en mémoire et dans `ft4_sessions`, les agrégats (`_agregatPeriode`), les textes à l'écran, les sorties des lecteurs
   « séance » (Nutrition, récupération, fréquence, badges, registre) AVEC et SANS activités — qui doivent être identiques.
   Ce qu'ils NE COUVRENT PAS : l'iPhone réel, le réseau réel et la synchro serveur (coupés — la reprise est SIMULÉE par une route interceptée, et dite telle), le
   multi-appareils réel (simulé par deux onglets du même navigateur et par les fonctions de fusion), de vraies données de Michel (aucun export des séances n'est
   accessible : T50 reste BLOCKED), le moteur calorique de musculation (gelé : seulement APPELÉ).
   ⛔ Chaque témoin s'éprouve sur code SAIN puis CASSÉ par mutation volontaire : `python3 tools/mut_autre_activite.py` (R17 : un test protège un invariant).
   Matrice : si la variable d'environnement ACT_MATRICE est posée, le module y écrit le JSON de la matrice (ID · scénario · attendu · observé · statut · preuve).
   ═══════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');

const T0 = Date.parse('2026-11-05T18:00:00+01:00');
const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '130', ft4_sessions: '[]', ft4_prs: '{}' };
const J = o => JSON.stringify(o);
const _det = o => { const s = typeof o === 'string' ? o : J(o); return s.length > 380 ? s.slice(0, 380) + '…' : s; };

// ── les scénarios de la mission, mot pour mot (la liste est un PLANCHER : les D-* sont les scénarios découverts pendant l'audit) ──
const SC = {
  T01: 'Cardio avec estimation automatique', T02: 'Cardio avec calories personnalisées', T03: 'Autre activité avec estimation automatique',
  T04: 'Autre activité avec calories personnalisées', T05: 'Modification de calories après enregistrement', T06: 'Modification de durée après enregistrement',
  T07: 'Modification d\'intensité après enregistrement', T08: 'Suppression d\'une activité', T09: 'Plusieurs activités le même jour',
  T10: 'Musculation + cardio le même jour', T11: 'Musculation + autre activité le même jour', T12: 'Cardio + autre activité le même jour',
  T13: 'Musculation + cardio + autre activité', T14: 'Cardio ajouté à une séance de musculation', T15: 'Activité autonome sans musculation',
  T16: 'Consultation de l\'historique', T17: 'Modification d\'une ancienne activité', T18: 'Bilans hebdomadaires', T19: 'Bilans mensuels',
  T20: 'Recalcul rétroactif', T21: 'Cohérence Accueil / Progrès / Agenda', T22: 'Cohérence avec Nutrition', T23: 'Cohérence avec Milo',
  T24: 'Absence de double comptage énergétique', T25: 'Changement de poids utilisateur', T26: 'Redémarrage de l\'application',
  T27: 'Fermeture pendant une sauvegarde', T28: 'Fonctionnement hors connexion', T29: 'Reconnexion et synchronisation',
  T30: 'Gestion des conflits de synchronisation', T31: 'Modification sur plusieurs appareils', T32: 'Gestion des dates et fuseaux horaires',
  T33: 'Passage entre deux semaines', T34: 'Passage entre deux mois', T35: 'Passage entre deux années', T36: 'Gestion des changements d\'heure',
  T37: 'Conservation des anciennes données', T38: 'Absence de régression des séances existantes', T39: 'Absence de régression des programmes',
  T40: 'Absence de régression Nutrition', T41: 'Absence de régression des statistiques', T42: 'Cohérence des exports et rapports concernés',
  T43: 'Création, modification et suppression répétées', T44: 'Valeur manuelle absente, nulle ou invalide', T45: 'Retour de la valeur manuelle à l\'estimation',
  T46: 'Échec de sauvegarde et nouvelle tentative', T47: 'Absence de perte ou de duplication après échec', T48: 'Rafraîchissement de tous les écrans concernés',
  T49: 'Intégrité des identifiants et références', T50: 'Vérification des calculs sur données réelles',
  'T-ref': 'Jeu de référence de la mission (410 / 365 + 379 / 303 → 1 078 + 379 = 1 457 ; +255 → 1 712 ; suppression → 1 457 ; 255 → 200 → 1 657)',
  'D01': 'DÉCOUVERT — l\'import d\'historique « remplacer » ne supprime jamais une activité du même jour (F15)',
  'D02': 'DÉCOUVERT — l\'outil admin de recalage (×1,55) ne réécrit jamais une activité (F14)',
  'D03': 'DÉCOUVERT — un bilan de musculation SEULE garde exactement son ancien texte',
  'D04': 'DÉCOUVERT — la couleur du calendrier n\'est pas masquée par une activité enregistrée après la séance (F11)',
  'D05': 'DÉCOUVERT — badges, registre, niveau automatique : aucune activité n\'est comptée comme une séance (F6)',
  'D06': 'DÉCOUVERT — cardio seul avec valeur de la montre : pas de forfait d\'échauffement ajouté (F4, D-ACT-4)',
  'D07': 'DÉCOUVERT — un bloc cardio ANCIEN reste affiché à sa valeur rangée, jamais au poids du jour (F3)',
  'D08': 'DÉCOUVERT — limites de saisie : durée 1-1440, distance, date non future, heure valide',
  'D09': 'DÉCOUVERT — la valeur « 0 kcal » saisie est une valeur (≠ champ vide)',
  'D10': 'DÉCOUVERT — l\'historique : filtre « Activités », compteurs, aucune ligne « 0 kg de travail », aucun bouton d\'analyse muscu',
};
const MX = {};   // la matrice, remplie par les témoins
function W(id, nom, attendu, cond, observe, preuve, extra) {
  const e = MX[id] = MX[id] || { id, scenario: SC[id] || '', attendu: [], observe: [], ok: true, nt: 0, preuve: [], simule: false };
  e.attendu.push(attendu); e.observe.push(observe === undefined ? '' : (typeof observe === 'string' ? observe : J(observe))); e.ok = e.ok && !!cond; e.nt++;
  if (preuve && e.preuve.indexOf(preuve) < 0) e.preuve.push(preuve);
  if (extra && extra.simule) e.simule = true;
  return !!cond;
}

/* ── le jeu de référence de la mission : 02/11 muscu 410 · 04/11 muscu 365 + cardio 379 · 05/11 muscu 303 ── */
function jeuReference() {
  const mk = (jour, hh, sets, kcal) => ({ id: Date.parse(`2026-11-${jour}T${hh}:00:00+01:00`), ts: Date.parse(`2026-11-${jour}T${hh}:00:00+01:00`), date: `2026-11-${jour}`, startHour: +hh,
    exs: [{ name: 'Développé Couché Barre', sets: sets.map(([kg, reps]) => ({ kg, reps, type: 'N', done: true, rm1: Math.round(kg * (1 + reps / 30)) })) }],
    volume: sets.reduce((a, [kg, reps]) => a + kg * reps, 0), uniConv: 1, synced: false, duration: 3600, progLabel: '', calories: kcal, calData: { total: kcal } });
  const rep = (n, s) => Array.from({ length: n }, () => s);
  const A = mk('02', '18', rep(16, [100, 5]).concat([[100, 10]]), 410);      // 17 séries · 9 000 kg
  const B = mk('04', '18', rep(15, [100, 5]).concat([[100, 10]]), 365);      // 16 séries · 8 500 kg
  const C = mk('05', '17', rep(15, [100, 5]).concat([[67, 15]]), 303);       // 16 séries · 8 505 kg
  const CARDIO = { id: Date.parse('2026-11-04T19:30:00+01:00'), ts: Date.parse('2026-11-04T19:30:00+01:00'), date: '2026-11-04', startHour: 19, exs: [], volume: 0, uniConv: 1, synced: false,
    duration: 45 * 60, progLabel: '', cardio: { type: 'tapis', intensity: 'modere', duration: 45 }, calories: 379, calData: { total: 379, cardio: 379 } };
  return [C, CARDIO, B, A];       // plus récent d'abord, comme l'app
}
// une marche « à la main » (pour les tests qui n'ont pas besoin du formulaire) : la forme EXACTE que le formulaire écrit
function marche(date, hh, o) {
  o = o || {}; const ts = Date.parse(`${date}T${hh}:00+01:00`) + (o.dts || 0), duree = o.duree || 60, kcalEst = o.est == null ? 312 : o.est;
  const a = { type: o.type || 'marche', duration: duree, heure: hh, kcalEst, kcalPoids: 82, kcalMode: 'met1' };
  if (o.man != null) a.kcalMan = o.man; if (o.dist != null) a.distance = o.dist; if (o.int) a.intensity = o.int;
  const ret = o.man != null ? o.man : kcalEst;
  return { id: ts, ts, date, startHour: +hh.slice(0, 2), exs: [], exercises: [], volume: 0, uniConv: 1, synced: true, duration: duree * 60, progLabel: '', calories: ret, calData: { total: ret, autre: ret }, autre: a };
}

/* Le texte EXACT des bilans d'une période de musculation SEULE (3 séances du jeu de la mission : semaine du 02/11 vue le lundi 09/11 à 10 h, mois de novembre vu le 05/11),
   CAPTURÉ sur la version publiée ft-v1263 (master e2b942f3). Une période sans cardio ni activité doit garder cet affichage à l'OCTET (espaces et retours à la ligne compris). */
const BILAN_MUSCU_PUBLIE = {"moisHtml": "<div style=\"font-size:13px;color:var(--t3);font-weight:700;margin-bottom:4px;text-transform:capitalize;\">novembre 2026</div><div class=\"week-sum-row\"><span class=\"week-sum-lbl\">🏋️ Séances</span><span class=\"week-sum-val\">3</span></div><div class=\"week-sum-row\"><span class=\"week-sum-lbl\">📅 Jours d'entraînement</span><span class=\"week-sum-val\">3</span></div><div class=\"week-sum-row\"><span class=\"week-sum-lbl\">🔢 Séries de travail</span><span class=\"week-sum-val\">49</span></div><div class=\"week-sum-row\"><span class=\"week-sum-lbl\">📦 Volume</span><span class=\"week-sum-val\">26 005 kg</span></div><div class=\"week-sum-row\"><span class=\"week-sum-lbl\">🔥 Calories</span><span class=\"week-sum-val\">1 078 kcal</span></div><div class=\"week-badge-pill\">🏅 🏋️ Premier soulevé · 🔥 En feu</div><div style=\"font-size:11.5px;color:var(--t3);margin-top:8px;\">Pas de mois précédent dans ton historique — rien à comparer pour l'instant.</div>", "semHtml": "\n    <div style=\"font-size:13px;color:var(--t3);font-weight:700;margin-bottom:4px;\">Semaine du lun. 2 nov. au dim. 8 nov.</div>\n    <div class=\"week-sum-row\"><span class=\"week-sum-lbl\">🏋️ Séances</span><span class=\"week-sum-val\">3</span></div>\n    <div class=\"week-sum-row\"><span class=\"week-sum-lbl\">📦 Volume total</span><span class=\"week-sum-val\">26005 kg</span></div>\n    <div class=\"week-sum-row\"><span class=\"week-sum-lbl\">🔥 Calories</span><span class=\"week-sum-val\">1078 kcal</span></div>\n    \n  ", "share": "Force Tracker — Semaine du lun. 2 nov.\n🏋️ 3 séances\n📦 Volume : 26005 kg\n🔥 Calories : 1078 kcal\n💪 Force Tracker"};
const AG = `(()=>{ const a=_agregatPeriode(S.sessions); return {nMuscu:a.nMuscu,nCardio:a.nCardio,nAutre:a.nAutre,jours:a.jours,joursMuscu:a.joursMuscu,muscu:a.kcal.muscu,cardio:a.kcal.cardio,autre:a.kcal.autre,total:a.kcal.total,series:a.series,vol:a.vol}; })()`;

async function ecran(t, b, PORT) {
  const ouvrir = async (opts) => {
    opts = opts || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: opts.w || 390, height: opts.h || 844 }, timezoneId: opts.tz || 'Europe/Paris', locale: 'fr-FR', hasTouch: true });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    /* Les deux bilans qui s'ouvrent TOUT SEULS au démarrage (semaine le lundi, mois en début de mois) sont déjà « annoncés » : une fenêtre qui s'ouvre au milieu
       d'un clic de test intercepte le clic. Les témoins des bilans les rejouent à la main (`checkWeeklySummary` après remise à zéro, `openMonthReports`). */
    const nowD = new Date(opts.now || T0), ymd = nowD.toLocaleDateString('sv-SE', { timeZone: opts.tz || 'Europe/Paris' });
    const pm = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 2, 15)), lms = pm.getUTCFullYear() + '-' + String(pm.getUTCMonth() + 1).padStart(2, '0');
    const D = Object.assign({}, BASE, { ft4_lms: lms, ft4_lws: ymd }, opts.ls || {});
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_act'))return; sessionStorage.setItem('_act','1'); localStorage.clear();
      const D=${J(D)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); }catch(e){} })();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 200)));
    await pg.clock.setFixedTime(new Date(opts.now || T0));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(opts.wait || 1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none';
      window.__T = []; const _t = window.toast; window.toast = function (m) { window.__T.push(String(m)); try { return _t.apply(this, arguments); } catch (e) {} }; });
    return { cx, pg, errs };
  };
  const sess = (jeu, extra) => ({ ls: Object.assign({ ft4_sessions: J(jeu) }, extra || {}) });
  const ag = X => X.pg.evaluate(AG);
  const toasts = X => X.pg.evaluate(() => window.__T.slice());
  const txt = (X, sel) => X.pg.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; }, sel);
  /* Le geste complet d'une création, par les VRAIS champs : types, durée, valeur de la montre, distance, notes, puis « Enregistrer ». */
  const creer = async (X, o) => {
    await X.pg.evaluate(() => openAutreActivite()); await X.pg.waitForTimeout(60);
    if (o.type) await X.pg.evaluate(k => _auType(k), o.type);
    if (o.int) await X.pg.evaluate(k => _auInt(k), o.int);
    if (o.date) await X.pg.fill('#au-date', o.date);
    if (o.heure !== undefined) await X.pg.fill('#au-heure', o.heure);
    if (o.duree !== undefined) await X.pg.fill('#au-duree', String(o.duree));
    if (o.dist) await X.pg.fill('#au-dist', o.dist);
    if (o.notes) await X.pg.fill('#au-notes', o.notes);
    if (o.libelle) await X.pg.fill('#au-libelle', o.libelle);
    if (o.man !== undefined) { const i = X.pg.locator('#au-kcal input'); await i.fill(String(o.man)); await i.press('Tab'); }
    if (o.noSave) return;
    await X.pg.click('#au-save-btn'); await X.pg.waitForTimeout(120);
  };
  const ouvrirAutre = async (X, id) => { await X.pg.evaluate(i => openAutreActivite(i), id); await X.pg.waitForTimeout(80); };
  const saisirMan = async (X, v) => { const i = X.pg.locator('#au-kcal input'); await i.fill(String(v)); await i.press('Tab'); await X.pg.waitForTimeout(60); };
  const enregistrerForm = async X => { await X.pg.click('#au-save-btn'); await X.pg.waitForTimeout(120); };
  const autres = X => X.pg.evaluate(() => JSON.parse(JSON.stringify(S.sessions.filter(s => s.autre))));
  const stocke = X => X.pg.evaluate(() => JSON.parse(localStorage.getItem('ft4_sessions') || '[]'));
  const fermer = async X => { try { await X.cx.close(); } catch (e) {} };
  const c = { t, b, PORT, ouvrir, sess, ag, toasts, txt, creer, ouvrirAutre, saisirMan, enregistrerForm, autres, stocke, fermer, W, MX, SC, jeuReference, marche, J, _det, BASE, T0, AG };

  /* ACT_BLOCS (ex. « A,B ») : ne jouer que certains blocs — boucle de mise au point seulement ; la passe et le banc jouent TOUT. */
  const sel = process.env.ACT_BLOCS ? process.env.ACT_BLOCS.split(',') : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const BL = { A: () => blocA(c), B: () => blocB(c), C: () => blocC(c), D: () => blocD(c), E: () => blocE(c), F: () => blocF(c), G: () => blocG(c), H: () => blocH(c) };
  for (const k of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) if (sel.indexOf(k) >= 0) await BL[k]();
  /* A le parcours réel et la référence · B le mécanisme commun du cardio · C les bilans et les frontières de période · D les invariants (Nutrition, récupération,
     fréquence, badges, programmes) · E Milo · F Accueil · Agenda · Progrès · G persistance, hors ligne, reprise, conflits, identifiants · H exports et rapports. */

  // ── ce qui n'a PAS pu être exécuté ici, dit avec sa cause ──
  c.BLOQUES = {
    T50: 'BLOCKED — aucun export réel de `S.sessions` n\'est accessible : le Drive (lecture seule) ne contient que des documents de pilotage et le journal nutrition ; le dossier MET ne donne que des moyennes. Le jeu de la mission (410 / 365 / 379 / 303) est vérifié par T-ref sur des séances reconstruites, pas sur des séances réelles.',
  };
  const matrice = Object.keys(SC).map(id => {
    const e = MX[id];
    if (c.BLOQUES[id]) return { id, scenario: SC[id], attendu: 'calculs exacts sur les séances réelles de Michel', observe: c.BLOQUES[id], statut: 'BLOCKED', preuve: 'recherche Drive (titres historique / séances / sessions / export) : 0 fichier' };
    if (!e) return { id, scenario: SC[id], attendu: '', observe: 'aucun témoin exécuté', statut: 'NOT RUN', preuve: '' };
    return { id, scenario: SC[id], attendu: e.attendu.join(' ⏐ '), observe: e.observe.join(' ⏐ '), statut: e.ok ? 'PASS' : 'FAIL', preuve: e.preuve.join(' ; ') + (e.simule ? ' (SIMULÉ)' : ''), nTemoins: e.nt, simule: e.simule };
  });
  if (process.env.ACT_MATRICE) { try { fs.writeFileSync(process.env.ACT_MATRICE, J(matrice)); } catch (e) {} }
  t('C-ACT-Z1 la matrice ne contient aucun FAIL (' + matrice.filter(m => m.statut === 'PASS').length + ' PASS · ' + matrice.filter(m => m.statut === 'FAIL').length + ' FAIL · '
    + matrice.filter(m => m.statut === 'BLOCKED').length + ' BLOCKED · ' + matrice.filter(m => m.statut === 'NOT RUN').length + ' NOT RUN)',
    matrice.every(m => m.statut !== 'FAIL'), matrice.filter(m => m.statut === 'FAIL').map(m => m.id).join(' '));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// BLOC A — le parcours réel, de la tuile à la suppression, sur le jeu de référence de la mission
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function blocA(c) {
  const { t, ouvrir, sess, ag, toasts, txt, creer, ouvrirAutre, saisirMan, enregistrerForm, autres, stocke, fermer, W, jeuReference, J, _det } = c;
  const P = 'C-ACT-A';
  const recharger = async X => { await X.pg.reload(); await X.pg.waitForTimeout(1500);
    await X.pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none';
      window.__T = []; const _t = window.toast; window.toast = function (m) { window.__T.push(String(m)); try { return _t.apply(this, arguments); } catch (e) {} }; }); };
  const X = await ouvrir(sess(jeuReference()));
  const pg = X.pg;
  // ── la référence AVANT toute activité ──
  let a = await ag(X); const nAvant = await pg.evaluate(() => S.sessions.length);
  t(P + '1 ⭐ T-ref : le jeu de référence donne muscu 1 078 · cardio 379 · total 1 457 · 3 séances · 1 cardio · 3 jours',
    W('T-ref', 'référence', 'muscu 1078 · cardio 379 · total 1457 · 3 séances muscu · 1 activité cardio · 3 jours · 0 autre', a.muscu === 1078 && a.cardio === 379 && a.total === 1457 && a.nMuscu === 3 && a.nCardio === 1 && a.jours === 3 && a.nAutre === 0, a, 'banc C-ACT-A1'), _det(a));
  // ── la tuile : 3ᵉ, juste sous « Programme », distincte de « Séance libre » ──
  await pg.evaluate(() => goScreen('log', document.getElementById('nb-log'))); await pg.waitForTimeout(250);
  const tu = await pg.evaluate(() => [...document.querySelectorAll('#log-avant .la-go > button')].map(b => { const r = b.getBoundingClientRect(); return { t: b.textContent.replace(/\s+/g, ' ').trim().slice(0, 30), top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) }; }));
  t(P + '2 ⭐ la tuile « Autre activité » est la 3ᵉ, JUSTE sous « Programme » (même gabarit), distincte de « Séance libre »',
    W('T03', 'tuile', 'Séance libre · Programme · Autre activité, la 3ᵉ collée à la 2ᵉ', tu.length === 3 && /^Séance libre/.test(tu[0].t) && /^Programme/.test(tu[1].t) && /^Autre activité/.test(tu[2].t) && tu[2].top >= tu[1].bottom && tu[2].top - tu[1].bottom <= 16 && tu[2].h === tu[1].h, tu, 'banc C-ACT-A2'), _det(tu));
  await pg.click('#la-autre'); await pg.waitForTimeout(250);
  t(P + '3 le clic sur la tuile ouvre le formulaire (titre « Autre activité », Supprimer caché, 8 types)',
    W('T03', 'formulaire', 'formulaire ouvert, création, 8 types', await pg.evaluate(() => document.getElementById('ov-autre').classList.contains('open') && document.getElementById('au-title').textContent === 'Autre activité'
      && document.getElementById('au-del-btn').style.display === 'none' && document.querySelectorAll('#au-types button').length === 8), 'ok', 'banc C-ACT-A3'), '');
  // une durée vide est refusée, rien n'est écrit (D08)
  await pg.click('#au-save-btn'); await pg.waitForTimeout(80);
  t(P + '4 D08 : durée vide → refus affiché, rien d\'écrit, le formulaire reste ouvert',
    W('D08', 'durée vide', 'refus + rien d\'écrit', await pg.evaluate(n => document.getElementById('au-err').style.display === 'block' && S.sessions.length === n && document.getElementById('ov-autre').classList.contains('open'), nAvant), 'refus', 'banc C-ACT-A4'), '');
  // ── T03 : l'estimation automatique, par la vraie frappe ──
  await pg.fill('#au-duree', '60'); await pg.waitForTimeout(80);
  const e1 = await txt(X, '#au-kcal');
  t(P + '5 ⭐ T03 : 60 min de marche à 82 kg → estimation FT ≈ 312 kcal (3,8 MET), retenu = estimation',
    W('T03', 'estimation auto', 'estimation 312, retenu 312 « estimation »', /≈ 312 kcal/.test(e1) && /Retenu 312 kcal/.test(e1) && /· estimation/.test(e1), e1, 'banc C-ACT-A5'), e1);
  // ── T04 : la valeur de la montre REMPLACE, ne s'additionne pas ──
  await saisirMan(X, 255);
  const e2 = await txt(X, '#au-kcal');
  t(P + '6 ⭐ T04 : valeur de la montre 255 → retenu 255 « valeur saisie » ; l\'estimation 312 reste affichée ; jamais 312 + 255',
    W('T04', 'remplacement', 'retenu 255, estimation 312 conservée, pas 567', /≈ 312 kcal/.test(e2) && /Retenu 255 kcal/.test(e2) && /valeur saisie/.test(e2) && !/567/.test(e2), e2, 'banc C-ACT-A6'), e2);
  await pg.fill('#au-dist', '4,5'); await pg.fill('#au-notes', 'Parc, beau temps');
  await enregistrerForm(X);
  const rec = (await autres(X))[0];
  t(P + '7 ⭐ enregistré : exs=[] · volume 0 · calories 255 (retenue) · calData.autre 255 · autre{kcalEst 312, kcalMan 255, kcalPoids 82, distance 4,5, notes} · message',
    W('T04', 'enregistrement', 'forme exacte, aucune série ni volume', !!rec && Array.isArray(rec.exs) && rec.exs.length === 0 && rec.exercises.length === 0 && rec.volume === 0 && rec.calories === 255 && rec.calData.autre === 255
      && rec.autre.kcalEst === 312 && rec.autre.kcalMan === 255 && rec.autre.kcalPoids === 82 && rec.autre.kcalMode === 'met1' && rec.autre.distance === 4.5 && rec.autre.notes === 'Parc, beau temps' && rec.autre.duration === 60
      && rec.date === '2026-11-05' && rec.progLabel === '' && (await toasts(X)).some(m => /Activité enregistrée ✓ — 255 kcal/.test(m)), rec, 'banc C-ACT-A7'), _det(rec));
  t(P + '8 identifiants : id = ts, nombre entier, unique dans tout l\'historique',
    W('T49', 'identifiant', 'id numérique entier = ts, unique', !!rec && Number.isInteger(rec.id) && rec.id === rec.ts && await pg.evaluate(() => new Set(S.sessions.map(s => s.ts || s.id)).size === S.sessions.length), rec && rec.id, 'banc C-ACT-A8'), '');
  a = await ag(X);
  t(P + '9 ⭐ T-ref : +255 → total 1 712 UNE fois (muscu 1 078 · cardio 379 · autres 255) ; 3 séances · 1 cardio · 1 autre · 3 jours ; 49 séries · 26 005 kg inchangés',
    W('T-ref', '+255', 'total 1712 une fois ; compteurs selon leur définition', a.total === 1712 && a.muscu === 1078 && a.cardio === 379 && a.autre === 255 && a.nMuscu === 3 && a.nCardio === 1 && a.nAutre === 1 && a.jours === 3 && a.joursMuscu === 3 && a.series === 49 && a.vol === 26005, a, 'banc C-ACT-A9')
    && W('T24', 'double comptage', 'le total ne compte l\'activité qu\'une fois (1457 + 255)', a.total === 1457 + 255, a.total, 'banc C-ACT-A9'), _det(a));
  // ── T26 : redémarrage de l'application ──
  await recharger(X);
  a = await ag(X);
  t(P + '10 T26 : après redémarrage (rechargement de la page) l\'activité est là, total 1 712, stockage local à jour',
    W('T26', 'redémarrage', 'activité et total 1712 retrouvés, bloc autre dans ft4_sessions', a.total === 1712 && a.nAutre === 1 && (await stocke(X)).some(s => s.autre && s.autre.kcalMan === 255), a, 'banc C-ACT-A10'), _det(a));
  // ── T05 : modification des calories après enregistrement (le même enregistrement) ──
  const id = rec.ts;
  await ouvrirAutre(X, id);
  t(P + '11 T05 : l\'activité s\'ouvre en modification, préremplie (60 min · 4,5 km · 255 retenu · Supprimer visible)',
    W('T05', 'préremplissage', 'formulaire prérempli', await pg.evaluate(() => document.getElementById('au-duree').value === '60' && document.getElementById('au-dist').value === '4,5' && document.getElementById('au-title').textContent === 'Modifier l\'activité'
      && document.getElementById('au-del-btn').style.display === 'block' && /Retenu 255 kcal/.test(document.getElementById('au-kcal').innerText.replace(/\s+/g, ' '))), 'ok', 'banc C-ACT-A11'), '');
  await saisirMan(X, 200); await enregistrerForm(X);
  a = await ag(X);
  t(P + '12 ⭐ T05 / T-ref : 255 → 200 → total 1 657, autres 200, UN seul enregistrement « autre », même identifiant',
    W('T05', '255→200', 'total 1657, un seul enregistrement, même id', a.total === 1657 && a.autre === 200 && a.nAutre === 1 && await pg.evaluate(i => S.sessions.filter(s => s.autre).length === 1 && S.sessions.find(s => s.autre).ts === i, id), a, 'banc C-ACT-A12')
    && W('T-ref', '255→200', 'total 1657', a.total === 1657, a.total, 'banc C-ACT-A12'), _det(a));
  // ── T45 : retour à l'estimation ──
  await ouvrirAutre(X, id);
  await pg.click('#au-kcal button:has-text("Revenir à l")'); await pg.waitForTimeout(80); await enregistrerForm(X);
  a = await ag(X);
  t(P + '13 ⭐ T45 : « Revenir à l\'estimation » → retenu 312, kcalMan RETIRÉ (≠ 0), total 1 769',
    W('T45', 'retour estimation', 'retenu 312 ; kcalMan absent ; total 1769', a.autre === 312 && a.total === 1769 && await pg.evaluate(() => !('kcalMan' in S.sessions.find(s => s.autre).autre)), a, 'banc C-ACT-A13'), _det(a));
  // ── T06 : modification de durée ──
  await ouvrirAutre(X, id); await pg.fill('#au-duree', '30'); await enregistrerForm(X);
  t(P + '14 ⭐ T06 : durée 60 → 30 sans valeur saisie → l\'estimation suit (156), au poids RANGÉ (82 kg)',
    W('T06', 'durée sans saisie', 'estimation 156', (await ag(X)).autre === 156 && await pg.evaluate(() => S.sessions.find(s => s.autre).autre.kcalPoids === 82), (await ag(X)).autre, 'banc C-ACT-A14'), '');
  await ouvrirAutre(X, id); await saisirMan(X, 255); await pg.fill('#au-duree', '90'); await enregistrerForm(X);
  t(P + '15 ⭐ T06 : durée changée AVEC une valeur de la montre → la valeur est conservée (255), l\'estimation suit (467)',
    W('T06', 'durée avec saisie', 'retenu 255 conservé ; estimation 467', await pg.evaluate(() => { const r = S.sessions.find(s => s.autre); return r.calories === 255 && r.autre.kcalMan === 255 && r.autre.kcalEst === 467; }), await pg.evaluate(() => S.sessions.find(s => s.autre).autre), 'banc C-ACT-A15'), '');
  // ── T07 : modification d'intensité ──
  await ouvrirAutre(X, id); await pg.evaluate(() => _auInt('intense')); await pg.waitForTimeout(60);
  const eInt = await txt(X, '#au-kcal');
  await enregistrerForm(X);
  t(P + '16 ⭐ T07 : intensité « intense » (4,8 MET × 82 × 1,5 h = 590) → l\'estimation suit, la valeur de la montre (255) reste la valeur retenue',
    W('T07', 'intensité', 'estimation 590 ; retenu 255', await pg.evaluate(() => { const r = S.sessions.find(s => s.autre); return r.autre.intensity === 'intense' && r.autre.kcalEst === 590 && r.autre.kcalMan === 255 && r.calories === 255; }), eInt, 'banc C-ACT-A16'), eInt);
  await ouvrirAutre(X, id); await pg.evaluate(() => _auInt('intense')); await pg.waitForTimeout(40);      // retaper la même intensité l'efface (facultative)
  await pg.evaluate(() => _auType('velo_sportif')); await saisirMan(X, ''); await pg.fill('#au-duree', '60'); await enregistrerForm(X);
  t(P + '17 ⭐ le TYPE change l\'estimation : vélo sportif modéré (8,0 MET × 82 × 1 h = 656), valeur retirée → retenu 656',
    W('T07', 'type', 'estimation 656', await pg.evaluate(() => { const r = S.sessions.find(s => s.autre); return r.autre.type === 'velo_sportif' && r.autre.kcalEst === 656 && r.calories === 656 && !('intensity' in r.autre) && !('kcalMan' in r.autre); }), await pg.evaluate(() => S.sessions.find(s => s.autre).autre), 'banc C-ACT-A17'), '');
  // ── T25 : le poids du jour change — la valeur enregistrée ne bouge pas, et l'édition utilise le poids rangé ──
  await ouvrirAutre(X, id); await pg.evaluate(() => _auType('marche')); await pg.fill('#au-duree', '60'); await enregistrerForm(X);     // 312 à 82 kg
  await pg.evaluate(() => { S.bw = 95; persist(); });
  t(P + '18 ⭐ T25 : poids du jour 82 → 95 kg → l\'activité déjà enregistrée garde 312 (rien n\'est recalculé en silence)',
    W('T25', 'poids sans édition', 'valeur enregistrée inchangée (312)', await pg.evaluate(() => S.sessions.find(s => s.autre).calories === 312), (await ag(X)).autre, 'banc C-ACT-A18'), '');
  await ouvrirAutre(X, id); await pg.fill('#au-duree', '120'); await enregistrerForm(X);
  t(P + '19 ⭐ T25 : on modifie la durée à 120 min APRÈS le changement de poids → l\'estimation reste au poids RANGÉ (82 kg → 623, pas 95 kg → 722)',
    W('T25', 'poids avec édition', 'estimation 623 (82 kg rangé)', await pg.evaluate(() => { const r = S.sessions.find(s => s.autre); return r.autre.kcalEst === 623 && r.autre.kcalPoids === 82 && r.calories === 623; }), await pg.evaluate(() => S.sessions.find(s => s.autre).autre), 'banc C-ACT-A19'), '');
  await pg.evaluate(() => { S.bw = 82; persist(); });
  // ── T08 : suppression, avec confirmation en deux temps ──
  await ouvrirAutre(X, id);
  await pg.click('#au-del-btn'); await pg.waitForTimeout(60);
  t(P + '20 T08 : 1er clic « Supprimer » → demande de confirmation, rien n\'est supprimé',
    W('T08', 'confirmation', 'confirmation demandée, activité présente', await pg.evaluate(() => /Confirmer/.test(document.getElementById('au-del-btn').textContent) && S.sessions.some(s => s.autre)), 'ok', 'banc C-ACT-A20'), '');
  await pg.click('#au-del-btn'); await pg.waitForTimeout(150);
  a = await ag(X);
  t(P + '21 ⭐ T08 / T-ref : suppression confirmée → retour EXACT au jeu de référence (1 457 · muscu 1 078 · cardio 379 · 3 séances · 3 jours), même nombre d\'enregistrements',
    W('T08', 'suppression', 'retour à 1457, mêmes enregistrements', a.total === 1457 && a.nAutre === 0 && a.muscu === 1078 && a.cardio === 379 && a.nMuscu === 3 && a.jours === 3 && await pg.evaluate(n => S.sessions.length === n, nAvant), a, 'banc C-ACT-A21')
    && W('T-ref', 'suppression', 'total 1457', a.total === 1457, a.total, 'banc C-ACT-A21'), _det(a));
  t(P + '22 la suppression est persistée (ft4_sessions) et un identifiant inexistant ne fait rien',
    W('T08', 'persistance suppression', 'plus aucune activité dans le stockage', !(await stocke(X)).some(s => s.autre), 'ok', 'banc C-ACT-A22') && await pg.evaluate(() => { const n = S.sessions.length; openAutreActivite(123); autreSupprimerOuConfirmer(); autreSupprimerOuConfirmer(); return S.sessions.length === n; }), '');
  await pg.evaluate(() => closeAutreActivite());

  // ── T44 : valeur manuelle absente, nulle ou invalide ──
  await creer(X, { duree: 60, noSave: true });
  const inval = {};
  for (const v of ['abc', '-5', '1e3', '12,3,4', '99999', '12 5', '--']) {
    await saisirMan(X, 255);               // une valeur valide d'abord
    await X.pg.locator('#au-kcal input').fill(v); await X.pg.locator('#au-kcal input').press('Tab'); await pg.waitForTimeout(50);
    inval[v] = await pg.evaluate(() => ({ err: document.getElementById('au-err').style.display === 'block' ? document.getElementById('au-err').textContent : '', man: _au.kcalMan }));
  }
  t(P + '23 ⭐ T44 : valeurs INVALIDES (abc · -5 · 1e3 · 12,3,4 · 99999 · « 12 5 » · --) → message, la valeur valide précédente (255) est conservée, rien n\'est écrit',
    W('T44', 'invalides', 'message affiché, valeur précédente conservée', Object.keys(inval).every(k => inval[k].err && inval[k].man === 255), inval, 'banc C-ACT-A23') && await pg.evaluate(() => !S.sessions.some(s => s.autre)), _det(inval));
  await saisirMan(X, '255,6');
  t(P + '24 T44 : « 255,6 » (virgule) est accepté et arrondi au kcal (256) ; « 255 » avec espaces aussi',
    W('T44', 'virgule', '255,6 → 256', await pg.evaluate(() => _au.kcalMan === 256 && document.getElementById('au-err').style.display !== 'block'), 'ok', 'banc C-ACT-A24'), '');
  await saisirMan(X, ' 255 ');
  t(P + '25 ⭐ T44 / D09 : « 0 » est une VALEUR (retenu 0, kcalMan 0 ≠ champ vide) ; vider le champ revient à l\'estimation',
    await (async () => {
      await saisirMan(X, '0'); const z = await pg.evaluate(() => ({ man: _au.kcalMan, txt: document.getElementById('au-kcal').innerText.replace(/\s+/g, ' ') }));
      await enregistrerForm(X); const r0 = (await autres(X))[0];
      const ok0 = z.man === 0 && /Retenu 0 kcal/.test(z.txt) && /valeur saisie/.test(z.txt) && r0 && r0.calories === 0 && r0.autre.kcalMan === 0 && r0.calData.autre === 0;
      const a0 = await ag(X);
      const okAg = a0.autre === 0 && a0.total === 1457 && a0.nAutre === 1;
      await ouvrirAutre(X, r0.ts); await saisirMan(X, ''); await enregistrerForm(X);
      const r1 = (await autres(X))[0];
      const okVide = r1.calories === 312 && !('kcalMan' in r1.autre);
      return W('T44', 'zéro', 'retenu 0 (valeur), vide → estimation', ok0 && okAg && okVide, { z, r0cal: r0 && r0.calories, a0, r1cal: r1 && r1.calories }, 'banc C-ACT-A25')
        && W('D09', 'zéro', '0 kcal saisi est une valeur', ok0 && okAg, z, 'banc C-ACT-A25');
    })(), '');
  // supprimer cette activité pour la suite
  const r1 = (await autres(X))[0]; await ouvrirAutre(X, r1.ts); await pg.click('#au-del-btn'); await pg.click('#au-del-btn'); await pg.waitForTimeout(100);

  // ── D08 : limites de saisie ──
  const lim = {};
  const essai = async (nom, o) => { await creer(X, Object.assign({ noSave: true }, o)); await enregistrerForm(X);
    lim[nom] = await pg.evaluate(() => ({ err: document.getElementById('au-err').style.display === 'block' ? document.getElementById('au-err').textContent : '', ouvert: document.getElementById('ov-autre').classList.contains('open'), n: S.sessions.filter(s => s.autre).length }));
    await pg.evaluate(() => closeAutreActivite()); };
  await essai('duree0', { duree: 0 }); await essai('duree1441', { duree: 1441 }); await essai('duree60,5', { duree: '60.5' }); await essai('dateFuture', { duree: 30, date: '2026-11-06' });
  await essai('dist0', { duree: 30, dist: '0' }); await essai('distGrosse', { duree: 30, dist: '1000,5' }); await essai('distTexte', { duree: 30, dist: 'abc' });
  t(P + '26 ⭐ D08 : durée 0 · 1441 · « 60.5 », date future, distance 0 · 1000,5 · « abc » → TOUS refusés avec un message, rien d\'écrit',
    W('D08', 'refus', 'sept entrées refusées, rien d\'écrit', Object.keys(lim).every(k => lim[k].err && lim[k].ouvert && lim[k].n === 0), lim, 'banc C-ACT-A26'), _det(lim));
  await creer(X, { duree: 1440, dist: '1000', date: '2026-11-05', notes: 'x'.repeat(600) });
  const rl = (await autres(X))[0];
  t(P + '27 D08 : les bornes ACCEPTÉES (1440 min, 1000 km) passent ; les notes sont coupées à 500 caractères',
    W('D08', 'bornes', '1440 min · 1000 km acceptés ; notes ≤ 500', !!rl && rl.autre.duration === 1440 && rl.autre.distance === 1000 && rl.autre.notes.length === 500, rl && rl.autre.notes && rl.autre.notes.length, 'banc C-ACT-A27'), '');
  await ouvrirAutre(X, rl.ts); await pg.click('#au-del-btn'); await pg.click('#au-del-btn'); await pg.waitForTimeout(100);

  // ── T43 : créations, modifications, suppressions RÉPÉTÉES — un modèle tenu dans le test, comparé à l'app ──
  const modele = [];   // {id, kcal}
  for (let i = 1; i <= 9; i++) {
    const j = ('0' + (i % 3 + 1)).slice(-2);                                   // jours 02, 03, 01…
    await creer(X, { type: ['marche', 'randonnee', 'velo_loisir'][i % 3], duree: 20 + i, man: 100 + i * 10, date: '2026-11-' + j, heure: '0' + (i % 9) + ':15' });
    const apres = await autres(X); const nouveau = apres.find(s => !modele.some(m => m.id === s.ts)); modele.push({ id: nouveau.ts, kcal: 100 + i * 10 });
    if (i % 3 === 0) { const m = modele[modele.length - 2]; await ouvrirAutre(X, m.id); await saisirMan(X, 500 + i); await enregistrerForm(X); m.kcal = 500 + i; }
    if (i % 4 === 0) { const m = modele.shift(); await ouvrirAutre(X, m.id); await pg.click('#au-del-btn'); await pg.click('#au-del-btn'); await pg.waitForTimeout(80); }
  }
  const fin = await autres(X); a = await ag(X);
  t(P + '28 ⭐ T43 : 9 créations + 3 modifications + 2 suppressions → l\'app et le modèle du test s\'accordent (même identifiants, même total, aucun doublon), jeu de référence intact',
    W('T43', 'répétitions', 'état = modèle ; aucun doublon ; référence intacte', fin.length === modele.length && fin.every(s => modele.some(m => m.id === s.ts && m.kcal === s.calories)) && new Set(fin.map(s => s.ts)).size === fin.length
      && a.autre === modele.reduce((x, m) => x + m.kcal, 0) && a.total === 1457 + a.autre && a.muscu === 1078 && a.cardio === 379 && a.nMuscu === 3, { n: fin.length, attendu: modele.length, a }, 'banc C-ACT-A28'), _det({ n: fin.length, attendu: modele.length }));
  t(P + '29 aucune erreur de page pendant tout le parcours', X.errs.length === 0, J(X.errs));
  await fermer(X);

  // ── T15 : une activité AUTONOME, un jour sans aucune séance ──
  const Y = await ouvrir(sess(jeuReference()));
  await creer(Y, { type: 'randonnee', duree: 180, date: '2026-11-03', dist: '12', man: 900 });
  const ra = (await autres(Y))[0]; a = await ag(Y);
  t(P + '30 ⭐ T15 : une randonnée un jour SANS séance (03/11) → 4 jours actifs mais toujours 3 jours de musculation ; aucune série, aucun volume ajouté',
    W('T15', 'autonome', 'jours 4, joursMuscu 3, séries 49, volume 26005, kcal autres 900', a.jours === 4 && a.joursMuscu === 3 && a.series === 49 && a.vol === 26005 && a.autre === 900 && a.total === 2357 && !!ra && ra.exs.length === 0 && ra.volume === 0, a, 'banc C-ACT-A30'), _det(a));
  await fermer(Y);
}


// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// BLOC B — le mécanisme COMMUN des calories pour le cardio (estimée · saisie · retenue), y compris les anciens enregistrements
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function blocB(c) {
  const { t, ouvrir, sess, ag, txt, ouvrirAutre, creer, saisirMan, enregistrerForm, autres, fermer, W, jeuReference, J, _det, T0 } = c;
  const P = 'C-ACT-B';
  // la fin d'une séance par le VRAI `finishWorkout` (l'horloge est figée : on la fait avancer entre deux séances pour que les identifiants diffèrent)
  const terminer = (X, w, dt) => X.pg.evaluate(async ([w, dt]) => {
    const avant = new Set(S.sessions.map(s => s.ts || s.id));
    S.wkt = Object.assign({ date: today(), exs: [], startHour: 17, startTs: Date.now() - 30 * 60000 }, w);
    await finishWorkout();
    const s = S.sessions.find(x => !avant.has(x.ts || x.id));
    return s ? JSON.parse(JSON.stringify(s)) : null;
  }, [w, dt || 0]);
  const squat = () => ({ name: 'Squat Barre', sets: [1, 2, 3].map(i => ({ kg: 100, reps: 5, type: 'N', done: true, at: 60000 * i })) });

  // ── T01 : un cardio SEUL, estimation automatique, par l'écran de la séance en cours puis le vrai `finishWorkout` ──
  {
    const X = await ouvrir(sess([])); const pg = X.pg;
    await pg.evaluate(() => { startWorkout(); _cardioOpen = true; setCardioField('type', 'tapis', 'apres'); setCardioField('intensity', 'modere', 'apres'); setCardioField('duration', 45, 'apres'); renderCardioBlock(); });
    const ed = await txt(X, '#log-cardio .kcal-ed');
    t(P + '1 ⭐ T01 : cardio « tapis · modéré · 45 min » à 82 kg → l\'éditeur de la séance en cours dit « Estimation FT ≈ 338 kcal · Retenu 338 kcal · estimation »',
      W('T01', 'éditeur', 'estimation 338, retenu 338 (estimation)', !!ed && /Estimation FT ≈ 338 kcal/.test(ed) && /Retenu 338 kcal/.test(ed) && /· estimation/.test(ed) && !/Revenir/.test(ed), ed, 'banc C-ACT-B1'), String(ed));
    const r = await pg.evaluate(async () => { await finishWorkout(); return JSON.parse(JSON.stringify(S.sessions[0])); });
    const g = await pg.evaluate(() => _genreSeance(S.sessions[0])); const a = await ag(X);
    t(P + '2 ⭐ T01 : séance enregistrée → bloc{kcalEst 338, kcalPoids 82, pas de kcalMan} · calories 338 (somme des blocs, D-ACT-4) · calData.cardio 338 · aucune série · genre « cardio »',
      W('T01', 'enregistrement', 'bloc figé 338 ; calories 338 ; genre cardio', !!r && r.cardio.kcalEst === 338 && r.cardio.kcalPoids === 82 && !('kcalMan' in r.cardio) && r.calories === 338 && r.calData.cardio === 338 && r.calData.total === 338
        && r.exs.length === 0 && g === 'cardio' && a.cardio === 338 && a.nCardio === 1 && a.nMuscu === 0, r, 'banc C-ACT-B2'), _det(r));
    await fermer(X);
  }

  // ── T02 : cardio avec calories PERSONNALISÉES — l'exemple de la mission : estimation 145, montre 115, retenu 115 ──
  {
    const X = await ouvrir(sess([], { ft4_bw: '72.5' })); const pg = X.pg;     // 4,0 MET × 72,5 kg × 0,5 h = 145 kcal EXACTEMENT
    await pg.evaluate(() => { startWorkout(); _cardioOpen = true; setCardioField('type', 'elliptique', 'apres'); setCardioField('intensity', 'leger', 'apres'); setCardioField('duration', 30, 'apres'); renderCardioBlock(); });
    const e0 = await txt(X, '#log-cardio .kcal-ed');
    const inp = pg.locator('#log-cardio .kcal-ed input'); await inp.fill('115'); await inp.press('Tab'); await pg.waitForTimeout(60);
    const e1 = await txt(X, '#log-cardio .kcal-ed');
    t(P + '3 ⭐ T02 : estimation FT 145 (elliptique léger 30 min à 72,5 kg) ; la personne tape 115 (sa montre) → « Retenu 115 kcal · valeur saisie », l\'estimation 145 reste affichée, jamais 260',
      W('T02', 'éditeur', 'estimation 145 ; retenu 115 ; pas 260', /≈ 145 kcal/.test(e0) && /Retenu 145 kcal/.test(e0) && /≈ 145 kcal/.test(e1) && /Retenu 115 kcal/.test(e1) && /valeur saisie/.test(e1) && /Revenir/.test(e1) && !/260/.test(e1), { e0, e1 }, 'banc C-ACT-B3'), _det({ e0, e1 }));
    const r = await pg.evaluate(async () => { await finishWorkout(); return JSON.parse(JSON.stringify(S.sessions[0])); }); const a = await ag(X);
    t(P + '4 ⭐ T02 / D06 : séance enregistrée → bloc{kcalEst 145, kcalMan 115} · calories 115 · calData.cardio 115 · total 115 (PAS 139 : aucun forfait d\'échauffement sur un cardio seul qui porte une valeur de montre) · agrégat cardio 115',
      W('T02', 'enregistrement', 'retenu 115 ; total 115 ; estimation 145 conservée', !!r && r.cardio.kcalEst === 145 && r.cardio.kcalMan === 115 && r.calories === 115 && r.calData.cardio === 115 && r.calData.total === 115 && a.cardio === 115 && a.total === 115, r, 'banc C-ACT-B4')
      && W('D06', 'forfait', 'cardio seul + valeur de montre : 115 exactement', !!r && r.calories === 115, r && r.calories, 'banc C-ACT-B4')
      && W('T24', 'remplacement cardio', 'jamais 145 + 115', !!r && r.calories !== 260 && r.calData.cardio !== 260, r && r.calories, 'banc C-ACT-B4'), _det(r));
    await fermer(X);
  }
  // ── T04 (l'exemple de la mission pour l'activité) : marche d'1 h estimée 300, montre 255, retenu 255 ──
  {
    const X = await ouvrir(sess([], { ft4_bw: '100' })); const pg = X.pg;      // 3,0 MET (léger) × 100 kg × 1 h = 300 kcal EXACTEMENT
    await creer(X, { type: 'marche', int: 'leger', duree: 60, noSave: true });
    const e0 = await txt(X, '#au-kcal'); await saisirMan(X, 255); const e1 = await txt(X, '#au-kcal'); await enregistrerForm(X);
    const r = (await autres(X))[0];
    t(P + '5 ⭐ T04 : l\'exemple de la mission — marche d\'une heure, estimation FT 300, montre 255 → retenu 255 (calories 255, calData.autre 255, jamais 555)',
      W('T04', 'exemple mission', 'estimation 300 ; montre 255 ; retenu 255', /≈ 300 kcal/.test(e0) && /≈ 300 kcal/.test(e1) && /Retenu 255 kcal/.test(e1) && !!r && r.autre.kcalEst === 300 && r.autre.kcalMan === 255 && r.calories === 255 && r.calData.autre === 255, { e0, e1, r: r && r.autre }, 'banc C-ACT-B5')
      && W('T24', 'remplacement activité', 'jamais 300 + 255', !!r && r.calories !== 555, r && r.calories, 'banc C-ACT-B5'), _det({ e1 }));
    await fermer(X);
  }

  // ── T14 : un cardio AJOUTÉ à une séance de musculation ──
  /* Le moteur gelé retire lui-même 5 min de forfait d'échauffement par moment de cardio MESURÉ (« les mêmes minutes ne sont pas payées deux fois », app.js) :
     la séance avec cardio n'est donc PAS « la séance sans cardio + le cardio ». Ce que le mécanisme commun garantit, et que ces témoins gardent, c'est que
     la part cardio est EXACTEMENT la valeur retenue (200 saisie, sinon 226 estimée) et que la part musculation est exactement celle du moteur. */
  {
    const X = await ouvrir(sess([])); const pg = X.pg;
    const s1 = await terminer(X, { exs: [squat()] });
    await pg.clock.setFixedTime(new Date(T0 + 3600000));
    const s2 = await terminer(X, { exs: [squat()], cardio: { type: 'tapis', intensity: 'modere', duration: 30, kcalEst: 226, kcalPoids: 82, kcalMode: 'met1', kcalMan: 200 } });
    await pg.clock.setFixedTime(new Date(T0 + 7200000));
    const s3 = await terminer(X, { exs: [squat()], cardio: { type: 'tapis', intensity: 'modere', duration: 30 } });       // sans valeur de montre
    const moteur = await pg.evaluate(() => S.sessions.map(s => ({ id: s.ts || s.id, moteur: calcSessionCalories(s).total })));
    const mo = id => (moteur.find(m => m.id === id) || {}).moteur;
    const a = await ag(X);
    t(P + '6 ⭐ T14 : séance de squat + cardio de fin (estimé 226, montre 200) → calData.cardio = 200 EXACTEMENT, et calories = part du moteur (musculation) + 200 — ni 226, ni 426',
      W('T14', 'cardio ajouté à la muscu', 'part cardio = 200 ; calories = moteur + 200', !!s2 && s2.calData.cardio === 200 && s2.calories === mo(s2.ts) + 200 && s2.calories !== mo(s2.ts) + 226 && s2.calories !== mo(s2.ts) + 426 && !('cardio' in s1.calData), { cal: s2 && s2.calories, cardio: s2 && s2.calData.cardio, moteur: mo(s2 && s2.ts) }, 'banc C-ACT-B6')
      && W('T24', 'muscu + cardio', 'le cardio n\'est compté qu\'une fois', !!s2 && s2.calories === mo(s2.ts) + 200, s2 && s2.calories, 'banc C-ACT-B6'), _det({ s1: s1 && s1.calories, s2: s2 && s2.calories, moteur: mo(s2 && s2.ts) }));
    t(P + '7 ⭐ T14 : remplacer 226 (estimation) par 200 (montre) retire EXACTEMENT 26 kcal du total (même séance, même moteur) ; sans valeur de montre le cardio vaut 226',
      W('T14', 'remplacement', 'estimation − montre = 26', !!s3 && !!s2 && s3.calData.cardio === 226 && s3.calories - s2.calories === 26, { s3: s3 && s3.calories, s2: s2 && s2.calories }, 'banc C-ACT-B7'), _det({ s3: s3 && s3.calories, s2: s2 && s2.calories }));
    t(P + '8 T14 : l\'agrégat sépare muscu et cardio (cardio = 200 + 226 = 426 ; muscu = somme des parts moteur), 3 séances de musculation, 2 blocs cardio, total = somme des calories',
      W('T14', 'agrégat', 'cardio 426 ; 3 séances ; 2 blocs ; total = Σ calories', !!s3 && a.cardio === 426 && a.nMuscu === 3 && a.nCardio === 2 && a.muscu === s1.calories + (s2.calories - 200) + (s3.calories - 226) && a.total === s1.calories + s2.calories + s3.calories, a, 'banc C-ACT-B8'), _det(a));
    await fermer(X);
  }

  // ── T10 : musculation + cardio LE MÊME JOUR (deux enregistrements, 04/11) — chaque catégorie compte une fois ──
  {
    const X = await ouvrir(sess(jeuReference())); const pg = X.pg;
    const j = await pg.evaluate(() => { const a = _agregatPeriode(S.sessions.filter(s => s.date === '2026-11-04')); return { muscu: a.kcal.muscu, cardio: a.kcal.cardio, total: a.kcal.total, nMuscu: a.nMuscu, nCardio: a.nCardio, jours: a.jours }; });
    t(P + '9 T10 : le 04/11 (musculation 365 + cardio 379 dans deux enregistrements) → muscu 365 · cardio 379 · total 744 · 1 séance · 1 cardio · 1 jour',
      W('T10', 'même jour', 'muscu 365 ; cardio 379 ; total 744 ; 1 jour', j.muscu === 365 && j.cardio === 379 && j.total === 744 && j.nMuscu === 1 && j.nCardio === 1 && j.jours === 1, j, 'banc C-ACT-B9'), _det(j));
    await fermer(X);
  }

  // ── T17 / D07 : un ANCIEN cardio (bloc sans calories figées, calories rangées 379 à un autre poids) ──
  {
    const X = await ouvrir(sess(jeuReference())); const pg = X.pg;       // poids du jour : 82 kg → le calcul « d'aujourd'hui » vaudrait 338, la valeur rangée est 379
    const id = jeuReference()[1].ts;
    await pg.evaluate(i => openSessDetail(i), id); await pg.waitForTimeout(250);
    const d0 = await txt(X, '#sd-content .kcal-ed');
    t(P + '10 ⭐ D07 : le détail d\'un ANCIEN cardio affiche sa valeur RANGÉE (379), jamais le calcul au poids du jour (338)',
      W('D07', 'ancien bloc', 'estimation affichée 379 (rangée), pas 338', !!d0 && /≈ 379 kcal/.test(d0) && /Retenu 379 kcal/.test(d0) && !/338/.test(d0), d0, 'banc C-ACT-B10'), String(d0));
    const inp = pg.locator('#sd-content .kcal-ed input'); await inp.fill('300'); await inp.press('Tab'); await pg.waitForTimeout(100);
    const d1 = await txt(X, '#sd-content .kcal-ed');
    await pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-sess-detail button')].find(x => /Enregistrer/.test(x.textContent)); bt.click(); }); await pg.waitForTimeout(200);
    let r = await pg.evaluate(i => JSON.parse(JSON.stringify(S.sessions.find(s => (s.ts || s.id) === i))), id); let a = await ag(X);
    t(P + '11 ⭐ T17 : valeur de la montre 300 sur l\'ancien cardio → retenu 300 ; l\'estimation figée est la valeur RANGÉE (379) ; calories 300 ; total du jeu 1 378 (1 457 − 379 + 300)',
      W('T17', 'ancien cardio + saisie', 'retenu 300 ; estimation 379 ; total 1378', /≈ 379 kcal/.test(d1) && /Retenu 300 kcal/.test(d1) && r.cardio.kcalEst === 379 && r.cardio.kcalMan === 300 && r.calories === 300 && r.calData.cardio === 300 && a.cardio === 300 && a.total === 1378, { r: r.cardio, cal: r.calories, a }, 'banc C-ACT-B11')
      && W('T05', 'cardio passé', 'modification des calories après enregistrement', r.calories === 300, r.calories, 'banc C-ACT-B11'), _det({ r: r.cardio, a }));
    await pg.evaluate(i => openSessDetail(i), id); await pg.waitForTimeout(250);
    await pg.click('#sd-content .kcal-ed button:has-text("Revenir")'); await pg.waitForTimeout(80);
    await pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-sess-detail button')].find(x => /Enregistrer/.test(x.textContent)); bt.click(); }); await pg.waitForTimeout(200);
    r = await pg.evaluate(i => JSON.parse(JSON.stringify(S.sessions.find(s => (s.ts || s.id) === i))), id); a = await ag(X);
    t(P + '12 ⭐ T45 : « Revenir à l\'estimation » sur l\'ancien cardio → retenu 379 (l\'estimation figée, pas le poids du jour), kcalMan retiré, total 1 457',
      W('T45', 'ancien cardio', 'retour à 379 ; kcalMan retiré', r.calories === 379 && !('kcalMan' in r.cardio) && a.total === 1457 && a.cardio === 379, { cal: r.calories, a }, 'banc C-ACT-B12'), _det({ cal: r.calories, a }));
    // modifier la DURÉE d'un cardio qui porte une valeur de montre : la valeur reste, l'estimation suit
    await pg.evaluate(i => openSessDetail(i), id); await pg.waitForTimeout(250);
    const inp2 = pg.locator('#sd-content .kcal-ed input'); await inp2.fill('300'); await inp2.press('Tab'); await pg.waitForTimeout(80);
    await pg.evaluate(() => setSessCardio('duration', 90, 'apres')); await pg.waitForTimeout(80);
    await pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-sess-detail button')].find(x => /Enregistrer/.test(x.textContent)); bt.click(); }); await pg.waitForTimeout(200);
    r = await pg.evaluate(i => JSON.parse(JSON.stringify(S.sessions.find(s => (s.ts || s.id) === i))), id);
    t(P + '13 ⭐ T06 : durée du cardio passée de 45 à 90 min avec une valeur de montre (300) → la valeur est conservée (calories 300), l\'estimation double (758 = 379 × 2, au poids rangé)',
      W('T06', 'durée cardio avec saisie', 'retenu 300 conservé ; estimation 758', r.calories === 300 && r.cardio.kcalMan === 300 && r.cardio.kcalEst === 758 && r.cardio.duration === 90, { cal: r.calories, b: r.cardio }, 'banc C-ACT-B13'), _det({ cal: r.calories, b: r.cardio }));
    await fermer(X);
  }
  // un ancien cardio dont on ne change que la durée, SANS rien saisir : l'ancienne règle F21 (échelle de l'effort), à l'octet
  {
    const X = await ouvrir(sess(jeuReference())); const pg = X.pg; const id = jeuReference()[1].ts;
    await pg.evaluate(i => openSessDetail(i), id); await pg.waitForTimeout(250);
    await pg.evaluate(() => setSessCardio('duration', 90, 'apres')); await pg.waitForTimeout(80);
    await pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-sess-detail button')].find(x => /Enregistrer/.test(x.textContent)); bt.click(); }); await pg.waitForTimeout(200);
    const r = await pg.evaluate(i => JSON.parse(JSON.stringify(S.sessions.find(s => (s.ts || s.id) === i))), id);
    t(P + '14 T06 / T37 : un ancien cardio dont on double la durée SANS saisir de valeur suit l\'ancienne règle F21 (seule la variation d\'effort s\'applique à la valeur rangée : 379 → 734, chiffre IDENTIQUE à la version publiée ft-v1263), sans bloc figé',
      W('T06', 'durée cardio ancien', 'ancienne règle F21 : 734 (identique à ft-v1263), bloc non figé', r.calories === 734 && !('kcalEst' in r.cardio) && !('kcalMan' in r.cardio), { cal: r.calories, b: r.cardio }, 'banc C-ACT-B14'), _det({ cal: r.calories, b: r.cardio }));
    await fermer(X);
  }
  // un brouillon de séance d'AVANT la mise à jour (bloc cardio sans estimation figée) se termine au même total qu'avant
  {
    const X = await ouvrir(sess([])); const pg = X.pg;
    const r = await terminer(X, { exs: [squat()], cardio: { type: 'velo', intensity: 'intense', duration: 20 } });
    const attendu = await pg.evaluate(() => { const bw = S.bw; const s = JSON.parse(JSON.stringify(S.sessions[0])); delete s.cardio.kcalEst; delete s.cardio.kcalPoids; delete s.cardio.kcalMode; delete s.calData; delete s.calories;
      const c = calcSessionCalories(s); return Math.round(c.total + calcCardioKcal(s.cardio)); });
    t(P + '15 T37 : un brouillon d\'avant la mise à jour (cardio sans estimation figée) se termine au MÊME total que l\'ancien calcul (moteur + MET × poids × durée), le bloc est figé à la fin',
      W('T37', 'brouillon ancien', 'même total que l\'ancienne formule', !!r && r.calories === attendu && typeof r.cardio.kcalEst === 'number' && r.cardio.kcalPoids === 82, { cal: r && r.calories, attendu }, 'banc C-ACT-B15'), _det({ cal: r && r.calories, attendu }));
    await fermer(X);
  }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// BLOC C — les bilans de la semaine et du mois, leurs frontières (semaine · mois · année · changement d'heure · fuseaux), la rétroactivité
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function blocC(c) {
  const { t, ouvrir, sess, ag, txt, creer, fermer, stocke, W, jeuReference, marche, J, _det } = c;
  const P = 'C-ACT-C';
  const norm = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  const lignes = (X, sel) => X.pg.evaluate(s => Object.fromEntries([...document.querySelectorAll(s + ' .week-sum-row')].map(r => [r.children[0].textContent.trim(), r.children[1].textContent.replace(/\s+/g, ' ').trim()])), sel);
  const val = (L, re) => { const k = Object.keys(L).find(k => re.test(k)); return k ? L[k] : undefined; };
  const semaine = X => X.pg.evaluate(() => { S.lastWeekSummary = ''; checkWeeklySummary();     // le bilan s'est déjà affiché au démarrage (avant la création) : on le rejoue
    return new Promise(r => setTimeout(() => r({ html: document.getElementById('week-sum-content').innerHTML, share: _weekSumText, tete: (document.querySelector('#week-sum-content div') || {}).textContent }), 60)); });
  const moisB = (X, ym) => X.pg.evaluate(ym => { openMonthReports(ym); return JSON.parse(JSON.stringify(_bilanMois(ym))); }, ym);
  const detail = X => X.pg.evaluate(() => { const e = document.querySelector('#week-sum-content [data-kcal-detail], #month-sum-content [data-kcal-detail]'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; });
  const lundi = '2026-11-09T10:00:00+01:00';

  // ── T18 : le bilan de la SEMAINE — musculation · cardio · autres, séparés ──
  {
    const jeu = jeuReference().concat([marche('2026-11-05', '08:00', { man: 255 })]);
    const X = await ouvrir(Object.assign(sess(jeu), { now: lundi })); const w = await semaine(X); const L = await lignes(X, '#week-sum-content'); const d = await detail(X);
    t(P + '1 ⭐ T18 : bilan de la semaine (jeu de la mission + une marche de 255) → 3 séances de musculation · 1 activité cardio · 1 autre activité · 3 jours actifs · volume 26005 kg · 1 712 kcal « dont musculation 1 078 · cardio 379 · autres 255 »',
      W('T18', 'semaine', 'catégories séparées ; 1712 kcal une fois', val(L, /Séances de musculation/) === '3' && val(L, /Activités cardio/) === '1' && val(L, /Autres activités/) === '1' && val(L, /Jours actifs/) === '3'
        && /26005 kg/.test(val(L, /Volume total \(musculation\)/)) && norm(val(L, /Calories dépensées/)) === '1 712 kcal' && norm(d) === 'dont musculation 1 078 · cardio 379 · autres 255' && !/Séances$/.test(Object.keys(L).join('|')), { L, d }, 'banc C-ACT-C1'), _det({ L, d }));
    t(P + '2 T18 : le texte de PARTAGE de la semaine dit les mêmes catégories et le même total',
      W('T18', 'partage', 'texte de partage cohérent', /3 séances de musculation/.test(norm(w.share)) && /1 activité cardio/.test(norm(w.share)) && /1 autre activité/.test(norm(w.share)) && /3 jours actifs/.test(norm(w.share)) && /1712 kcal \(musculation 1 078 · cardio 379 · autres 255\)/.test(norm(w.share)), norm(w.share), 'banc C-ACT-C2'), _det(w.share));
    await fermer(X);
  }
  {
    const X = await ouvrir(Object.assign(sess(jeuReference()), { now: lundi })); await semaine(X); const L = await lignes(X, '#week-sum-content'); const d = await detail(X);
    t(P + '3 T18 : la MÊME semaine sans la marche → pas de ligne « Autres activités », 1 457 kcal « dont musculation 1 078 · cardio 379 »',
      W('T18', 'semaine sans activité', 'pas de ligne autres ; 1457', val(L, /Autres activités/) === undefined && val(L, /Séances de musculation/) === '3' && val(L, /Activités cardio/) === '1' && norm(val(L, /Calories dépensées/)) === '1 457 kcal' && norm(d) === 'dont musculation 1 078 · cardio 379', { L, d }, 'banc C-ACT-C3'), _det({ L, d }));
    await fermer(X);
  }

  // ── T19 : le bilan du MOIS, et sa comparaison au mois précédent (musculation contre musculation) ──
  {
    const oct = [ // octobre : 2 séances de musculation (1 000 kg chacune) + 1 cardio + 3 marches
      Object.assign({}, jeuReference()[3], { id: Date.parse('2026-10-05T18:00:00+01:00'), ts: Date.parse('2026-10-05T18:00:00+01:00'), date: '2026-10-05', volume: 1000, calories: 300, calData: { total: 300 }, exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, type: 'N', done: true }, { kg: 100, reps: 5, type: 'N', done: true }] }] }),
      Object.assign({}, jeuReference()[3], { id: Date.parse('2026-10-12T18:00:00+01:00'), ts: Date.parse('2026-10-12T18:00:00+01:00'), date: '2026-10-12', volume: 1000, calories: 300, calData: { total: 300 }, exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, type: 'N', done: true }, { kg: 100, reps: 5, type: 'N', done: true }] }] }),
      Object.assign({}, jeuReference()[1], { id: Date.parse('2026-10-14T19:30:00+01:00'), ts: Date.parse('2026-10-14T19:30:00+01:00'), date: '2026-10-14' }),
      marche('2026-10-07', '08:00', { man: 200 }), marche('2026-10-09', '08:00', { man: 200 }), marche('2026-10-20', '08:00', { man: 200 })];
    const jeu = jeuReference().concat([marche('2026-11-05', '08:00', { man: 255 })], oct);
    const X = await ouvrir(sess(jeu)); const b = await moisB(X, '2026-11'); const L = await lignes(X, '#month-sum-content'); const d = await detail(X);
    const cp = await X.pg.evaluate(() => { let out = null; try { navigator.clipboard.writeText = (x) => { out = x; return Promise.resolve(); }; copyMonthSummary(); } catch (e) { out = 'ERR ' + e.message; } return out; });      // « le mois affiché » : novembre
    const bo = await moisB(X, '2026-10');
    t(P + '4 ⭐ T19 : bilan de novembre → 3 séances de musculation · 1 cardio · 1 autre · 3 jours actifs (3 de musculation) · 49 séries · 26 005 kg · 1 712 kcal (1 078 + 379 + 255)',
      W('T19', 'mois', 'catégories séparées ; 1712 kcal', b.nSess === 3 && b.nCardio === 1 && b.nAutre === 1 && b.jours === 3 && b.joursMuscu === 3 && b.series === 49 && b.vol === 26005 && b.kcal === 1712 && b.kcalMuscu === 1078 && b.kcalCardio === 379 && b.kcalAutre === 255
        && val(L, /Autres activités/) === '1' && norm(val(L, /Calories dépensées/)) === '1 712 kcal' && norm(d) === 'dont musculation 1 078 · cardio 379 · autres 255', { b: { nSess: b.nSess, nCardio: b.nCardio, nAutre: b.nAutre, kcal: b.kcal }, d }, 'banc C-ACT-C4'), _det({ b: { nSess: b.nSess, nCardio: b.nCardio, nAutre: b.nAutre, kcal: b.kcal }, d }));
    t(P + '5 ⭐ T19 / vérification des comparaisons : octobre = 2 séances de musculation (2 000 kg) + 1 cardio + 3 marches ; novembre se compare À LA MUSCULATION d\'octobre (2 séances, +1 ; volume +1 200 %), les marches et le cardio n\'y entrent pas',
      W('T19', 'comparaison', 'comp = musculation contre musculation', bo.nSess === 2 && bo.vol === 2000 && bo.nAutre === 3 && bo.nCardio === 1 && !!b.comp && b.comp.nSess === 2 && b.comp.vol === 2000 && b.comp.dSess === 1 && b.comp.dVol === 1200, { comp: b.comp, oct: { nSess: bo.nSess, nAutre: bo.nAutre } }, 'banc C-ACT-C5'), _det({ comp: b.comp }));
    // la copie du mois (faite plus haut, pendant que novembre était le mois affiché)
    t(P + '6 T19 : le texte copié du mois dit les mêmes catégories (3 séances de musculation · 1 activité cardio · 1 autre activité · 3 jours actifs · 1 712 kcal avec le détail)',
      W('T19', 'copie', 'texte du mois cohérent', /3 séances de musculation/.test(norm(cp)) && /1 activité cardio/.test(norm(cp)) && /1 autre activité/.test(norm(cp)) && /3 jours actifs/.test(norm(cp)) && /1 712 kcal \(musculation 1 078 · cardio 379 · autres 255\)/.test(norm(cp)), norm(cp), 'banc C-ACT-C6'), _det(norm(cp)));
    await fermer(X);
  }

  // ── D03 : une période de musculation SEULE garde exactement son ancien affichage (semaine, mois, partage) ──
  {
    const muscu = jeuReference().filter(s => !s.cardio);
    const X = await ouvrir(Object.assign(sess(muscu), { now: lundi })); const w = await semaine(X);
    const m = await X.pg.evaluate(() => { openMonthReports('2026-11'); return document.getElementById('month-sum-content').innerHTML; });
    t(P + '7 ⭐ D03 : une semaine et un mois de musculation SEULE s\'affichent à l\'OCTET comme dans la version publiée ft-v1263 (HTML de la semaine, HTML du mois, texte de partage)',
      W('D03', 'musculation seule', 'identique à la version publiée', w.html === BILAN_MUSCU_PUBLIE.semHtml && m === BILAN_MUSCU_PUBLIE.moisHtml && w.share === BILAN_MUSCU_PUBLIE.share, { semaine: w.html === BILAN_MUSCU_PUBLIE.semHtml, mois: m === BILAN_MUSCU_PUBLIE.moisHtml, partage: w.share === BILAN_MUSCU_PUBLIE.share }, 'banc C-ACT-C7'), _det({ semaine: w.html === BILAN_MUSCU_PUBLIE.semHtml, mois: m === BILAN_MUSCU_PUBLIE.moisHtml, partage: w.share === BILAN_MUSCU_PUBLIE.share }));
    await fermer(X);
  }

  // ── T20 : RECALCUL RÉTROACTIF — l'historique d'AVANT (aucun marqueur) est classé d'après ses données sources, sans rien réécrire ni inventer ──
  {
    const m1 = Object.assign({}, jeuReference()[3], { id: 1, ts: 1, date: '2026-10-05', calories: 500, calData: { total: 500, cardio: 150 }, cardio: { type: 'tapis', intensity: 'modere', duration: 25 } });     // muscu + cardio, part cardio rangée
    const m2 = Object.assign({}, jeuReference()[3], { id: 2, ts: 2, date: '2026-10-06', calories: 400, calData: { total: 400 }, cardio: { type: 'velo', intensity: 'leger', duration: 20 } });                    // muscu + cardio, part cardio NON rangée (très ancien)
    const m3 = Object.assign({}, jeuReference()[1], { id: 3, ts: 3, date: '2026-10-07', calories: 300, calData: { total: 300, cardio: 300 } });                                                                    // cardio seul
    const m4 = Object.assign({}, jeuReference()[3], { id: 4, ts: 4, date: '2026-10-08', calories: 250, calData: { total: 250 } });                                                                                    // muscu seule
    const jeu = [m4, m3, m2, m1]; const avant = J(jeu);
    const X = await ouvrir(sess(jeu)); const b = await moisB(X, '2026-10');
    const L = await lignes(X, '#month-sum-content'); const apres = await X.pg.evaluate(() => JSON.stringify(S.sessions)); const sto = await X.pg.evaluate(() => localStorage.getItem('ft4_sessions'));
    const pied = await X.pg.evaluate(() => document.getElementById('month-sum-content').textContent.replace(/\s+/g, ' '));
    t(P + '8 ⭐ T20 : un ancien historique SANS marqueur est classé d\'après ses données sources — musculation 250 + 350 + 400 = 1 000 · cardio 150 + 300 = 450 · total 1 450 · 3 séances de musculation · 3 blocs cardio ; une ancienne séance dont la part cardio n\'a jamais été rangée est COMPTÉE et SIGNALÉE, jamais devinée',
      W('T20', 'rétroactivité', 'musculation 1000 ; cardio 450 ; total 1450 ; non répartie 1, signalée', b.kcalMuscu === 1000 && b.kcalCardio === 450 && b.kcal === 1450 && b.nSess === 3 && b.nCardio === 3 && b.cardioNonRepartie === 1 && /1 ancienne séance avec cardio : sa part de cardio n'est pas séparable/.test(pied), { b: { m: b.kcalMuscu, c: b.kcalCardio, t: b.kcal, n: b.nSess, nc: b.nCardio, nr: b.cardioNonRepartie } }, 'banc C-ACT-C8'), _det({ m: b.kcalMuscu, c: b.kcalCardio, t: b.kcal, nr: b.cardioNonRepartie }));
    t(P + '9 ⭐ T20 / T37 : calculer les bilans ne réécrit RIEN — chaque enregistrement ancien est identique à l\'octet en mémoire et dans le stockage local',
      W('T20', 'rien de réécrit', 'enregistrements anciens inchangés', apres === avant && (sto === null || sto === avant), { memoire: apres === avant, stockage: sto === avant }, 'banc C-ACT-C9')
      && W('T37', 'anciennes données', 'enregistrements anciens inchangés après lecture', apres === avant, apres === avant, 'banc C-ACT-C9'), '');
    await fermer(X);
  }

  // ── T33 : le passage de la SEMAINE — dimanche 23 h 30 d'un côté, lundi 0 h 10 de l'autre ──
  {
    const X = await ouvrir({ ls: { ft4_sessions: J(jeuReference()) }, now: '2026-11-09T00:20:00+01:00' });
    await creer(X, { type: 'marche', date: '2026-11-08', heure: '23:30', duree: 60, man: 100 });
    await creer(X, { type: 'marche', date: '2026-11-09', heure: '00:10', duree: 30, man: 50 });
    await semaine(X); const L = await lignes(X, '#week-sum-content'); const b = await moisB(X, '2026-11'); const sto = await stocke(X);
    t(P + '10 ⭐ T33 : activité du dimanche 23 h 30 → dans la semaine du 02 au 08 (1 557 kcal, 1 autre activité) ; celle du lundi 0 h 10 n\'y est PAS ; le mois les compte toutes les deux (2 · 150 kcal)',
      W('T33', 'semaine', 'dimanche dans la semaine ; lundi hors semaine', val(L, /Autres activités/) === '1' && norm(val(L, /Calories dépensées/)) === '1 557 kcal' && b.nAutre === 2 && b.kcalAutre === 150, { L, nAutre: b.nAutre }, 'banc C-ACT-C10'), _det({ L, nAutre: b.nAutre }));
    await fermer(X);
    const Y = await ouvrir({ ls: { ft4_sessions: J(sto) }, now: '2026-11-16T10:00:00+01:00' }); await semaine(Y); const L2 = await lignes(Y, '#week-sum-content');
    t(P + '11 T33 : la semaine SUIVANTE (09 au 15, vue le lundi 16) ne compte que l\'activité du lundi 0 h 10 : 1 autre activité, 1 jour actif, 50 kcal, aucune séance',
      W('T33', 'semaine suivante', 'seule l\'activité du lundi', val(L2, /Autres activités/) === '1' && val(L2, /Jours actifs/) === '1' && norm(val(L2, /Calories dépensées/)) === '50 kcal' && val(L2, /Séances de musculation/) === undefined, L2, 'banc C-ACT-C11'), _det(L2));
    await fermer(Y);
  }

  // ── T34 : le passage du MOIS — 31 octobre 23 h 50 et 1ᵉʳ novembre 0 h 10 ──
  {
    const X = await ouvrir({ ls: { ft4_sessions: J([]) }, now: '2026-11-01T00:20:00+01:00' });
    await creer(X, { type: 'randonnee', date: '2026-10-31', heure: '23:50', duree: 120, man: 80 });
    await creer(X, { type: 'marche', date: '2026-11-01', heure: '00:10', duree: 30, man: 40 });
    const bo = await moisB(X, '2026-10'); const bn = await moisB(X, '2026-11'); const liste = await X.pg.evaluate(() => _moisAvecSeances());
    t(P + '12 ⭐ T34 : l\'activité du 31/10 23 h 50 est dans octobre (80 kcal), celle du 01/11 0 h 10 dans novembre (40 kcal) ; les deux mois existent, jamais de mélange',
      W('T34', 'mois', 'octobre 80 ; novembre 40', bo.nAutre === 1 && bo.kcalAutre === 80 && bn.nAutre === 1 && bn.kcalAutre === 40 && liste.join() === '2026-11,2026-10', { oct: bo.kcalAutre, nov: bn.kcalAutre, liste }, 'banc C-ACT-C12'), _det({ oct: bo.kcalAutre, nov: bn.kcalAutre, liste }));
    await fermer(X);
  }

  // ── T35 : le passage de l'ANNÉE — 31/12/2026 et 01/01/2027, dans la MÊME semaine (lundi 28/12 → dimanche 03/01) ──
  {
    const X = await ouvrir({ ls: { ft4_sessions: J([]) }, now: '2027-01-04T10:00:00+01:00' });
    await creer(X, { type: 'velo_loisir', date: '2026-12-31', heure: '23:30', duree: 60, man: 90 });
    await creer(X, { type: 'marche', date: '2027-01-01', heure: '00:30', duree: 45, man: 60 });
    await semaine(X); const L = await lignes(X, '#week-sum-content'); const bd = await moisB(X, '2026-12'); const bj = await moisB(X, '2027-01');
    const av = await X.pg.evaluate(() => _moisAvant('2027-01'));
    await X.pg.evaluate(() => goSessionsHistory()); await X.pg.waitForTimeout(300);
    const an = await X.pg.evaluate(() => document.getElementById('sess-list').innerText.replace(/\s+/g, ' '));
    t(P + '13 ⭐ T35 : la semaine du 28/12 au 03/01 compte les DEUX activités (2 autres activités · 2 jours actifs · 150 kcal) ; décembre et janvier restent séparés (90 / 60) ; le mois précédent de 2027-01 est 2026-12 ; l\'historique range 2027 puis 2026',
      W('T35', 'année', 'une semaine, deux mois, deux années', val(L, /Autres activités/) === '2' && val(L, /Jours actifs/) === '2' && norm(val(L, /Calories dépensées/)) === '150 kcal' && bd.kcalAutre === 90 && bj.kcalAutre === 60 && av === '2026-12' && an.indexOf('2027') >= 0 && an.indexOf('2027') < an.indexOf('2026'), { L, dec: bd.kcalAutre, jan: bj.kcalAutre, av }, 'banc C-ACT-C13'), _det({ L, dec: bd.kcalAutre, jan: bj.kcalAutre }));
    await fermer(X);
  }

  // ── T36 : les CHANGEMENTS D'HEURE — 25/10/2026 (la nuit de 25 h : 02 h 30 existe deux fois) et 29/03/2026 (02 h 30 n'existe pas) ──
  {
    const X = await ouvrir({ ls: { ft4_sessions: J([]) }, now: '2026-10-26T10:00:00+01:00' });
    await creer(X, { type: 'marche', date: '2026-10-25', heure: '02:30', duree: 60, man: 70 });
    await creer(X, { type: 'marche', date: '2026-10-25', heure: '02:30', duree: 60, man: 30 });       // la MÊME heure locale, le même jour
    await creer(X, { type: 'balade', date: '2026-10-25', heure: '00:30', duree: 30, man: 20 });
    const rs = await X.pg.evaluate(() => S.sessions.filter(s => s.autre).map(s => ({ id: s.ts, date: s.date, h: s.startHour, jour: new Date(s.ts).getDate() })));
    await semaine(X); const L = await lignes(X, '#week-sum-content');
    t(P + '14 ⭐ T36 : trois activités le jour du retour à l\'heure d\'hiver (dont deux à 02 h 30) → trois enregistrements aux identifiants DISTINCTS, tous datés 25/10, un seul jour actif, 120 kcal dans la semaine du 19 au 25',
      W('T36', 'heure d\'hiver', '3 enregistrements distincts le 25/10', rs.length === 3 && new Set(rs.map(r => r.id)).size === 3 && rs.every(r => r.date === '2026-10-25') && val(L, /Autres activités/) === '3' && val(L, /Jours actifs/) === '1' && norm(val(L, /Calories dépensées/)) === '120 kcal', { rs, L }, 'banc C-ACT-C14'), _det({ rs, L }));
    await fermer(X);
    const Y = await ouvrir({ ls: { ft4_sessions: J([]) }, now: '2026-03-30T10:00:00+02:00' });
    await creer(Y, { type: 'course', date: '2026-03-29', heure: '02:30', duree: 40, man: 300 });       // 02 h 30 n'existe pas ce jour-là en France
    const r2 = await Y.pg.evaluate(() => { const s = S.sessions.find(x => x.autre); return { date: s.date, h: s.startHour, heure: s.autre.heure, jour: new Date(s.ts).getDate() }; });
    await semaine(Y); const L2 = await lignes(Y, '#week-sum-content');
    t(P + '15 T36 : une activité tapée à 02 h 30 le jour du passage à l\'heure d\'été (heure inexistante) reste datée du 29/03 (ni le 28 ni le 30), compte dans sa semaine (23 au 29)',
      W('T36', 'heure d\'été', 'datée du 29/03', r2.date === '2026-03-29' && r2.heure === '02:30' && r2.jour === 29 && val(L2, /Autres activités/) === '1' && norm(val(L2, /Calories dépensées/)) === '300 kcal', { r2, L2 }, 'banc C-ACT-C15'), _det({ r2, L2 }));
    await fermer(Y);
  }

  // ── T32 : les FUSEAUX HORAIRES — la date est celle du téléphone, jamais celle d'UTC ──
  {
    const LA = await ouvrir({ ls: { ft4_sessions: J([]) }, tz: 'America/Los_Angeles', now: '2026-11-05T23:30:00-08:00' });       // 06/11 07 h 30 en UTC
    await creer(LA, { type: 'marche', duree: 30, man: 100 });
    const rLA = await LA.pg.evaluate(() => { const s = S.sessions.find(x => x.autre); return { date: s.date, h: s.startHour, heure: s.autre.heure, today: today() }; });
    await fermer(LA);
    const NZ = await ouvrir({ ls: { ft4_sessions: J([]) }, tz: 'Pacific/Auckland', now: '2026-11-06T00:30:00+13:00' });        // 05/11 11 h 30 en UTC
    await creer(NZ, { type: 'marche', duree: 30, man: 100 });
    const rNZ = await NZ.pg.evaluate(() => { const s = S.sessions.find(x => x.autre); return { date: s.date, h: s.startHour, heure: s.autre.heure, today: today() }; });
    await fermer(NZ);
    t(P + '16 ⭐ T32 : une activité créée à 23 h 30 à Los Angeles est du 05/11 (pas du 06, la date d\'UTC) ; à 00 h 30 à Auckland elle est du 06/11 (pas du 05)',
      W('T32', 'fuseaux', 'date locale', rLA.date === '2026-11-05' && rLA.heure === '23:30' && rNZ.date === '2026-11-06' && rNZ.heure === '00:30', { rLA, rNZ }, 'banc C-ACT-C16'), _det({ rLA, rNZ }));
    // un enregistrement fait à Paris (23 h 30) et relu dans un autre fuseau reste sur SA date (une chaîne, jamais reconvertie)
    const fix = marche('2026-11-05', '23:30', { man: 100 });
    const AK = await ouvrir({ ls: { ft4_sessions: J([fix]) }, tz: 'Pacific/Auckland', now: '2026-11-07T10:00:00+13:00' });
    const carte = await AK.pg.evaluate(() => { goSessionsHistory(); return new Promise(r => setTimeout(() => r(document.getElementById('sess-list').innerText.replace(/\s+/g, ' ')), 300)); });
    const jr = await AK.pg.evaluate(() => _agregatPeriode(S.sessions.filter(s => s.date === '2026-11-05')).nAutre);
    t(P + '17 T32 : l\'activité du 05/11 enregistrée à 23 h 30 (heure de Paris) et relue sur un téléphone réglé à Auckland reste sur le 05/11 (carte « jeu. 5 nov. », agrégat du 05/11 = 1)',
      W('T32', 'changement de fuseau', 'reste sur sa date', /jeu\. 5 nov\./.test(carte) && jr === 1, { jr, extrait: carte.slice(0, 160) }, 'banc C-ACT-C17'), _det({ jr }));
    await fermer(AK);
  }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// BLOC D — LES INVARIANTS : ajouter des activités ne change AUCUNE sortie « séance » (Nutrition, fréquence, récupération, registre, badges, niveau, programmes)
// Le test DIFFÉRENTIEL : le même historique de musculation, avec et sans 9 marches (dont une aujourd'hui), lu par les lecteurs de `S.sessions` — mêmes sorties, à l'octet.
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function blocD(c) {
  const { t, ouvrir, sess, ag, txt, creer, fermer, stocke, W, jeuReference, marche, J, _det, T0 } = c;
  const P = 'C-ACT-D';
  const J2 = n => { const d = new Date('2026-11-05T12:00:00+01:00'); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
  // 4 semaines de musculation (3 séances par semaine) avant le jeu de la mission : les fréquences existent
  const hist = [];
  for (let sem = 1; sem <= 4; sem++) for (const j of [1, 3, 5]) {
    const date = J2(sem * 7 - 7 + j + 5), ts = Date.parse(date + 'T18:00:00+01:00');
    hist.push({ id: ts, ts, date, startHour: 18, exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, type: 'N', done: true, rm1: 117 }, { kg: 100, reps: 5, type: 'N', done: true, rm1: 117 }] }],
      volume: 1000, uniConv: 1, synced: true, duration: 3600, progLabel: '', calories: 300, calData: { total: 300 } });
  }
  const base = jeuReference().concat(hist);
  const marches = [marche('2026-11-05', '08:00', { man: 255 })];
  for (let sem = 0; sem < 4; sem++) for (const j of [2, 6]) marches.push(marche(J2(sem * 7 + j + 5), '08:00', { man: 255, dts: sem * 1000 + j }));
  const lsProfil = { ft4_act: '1.55', ft4_act_src: 'choisi', ft4_work: 'bureau', ft4_nphase: 'maintien', ft4_progs: J([{ name: 'Push', date: '2026-10-01', exs: [{ name: 'Développé Couché Barre', sets: [{ reps: 8, kg: 0 }] }] }]) };
  const lire = async jeu => {
    const X = await ouvrir({ ls: Object.assign({ ft4_sessions: J(jeu) }, lsProfil) });
    const r = await X.pg.evaluate(() => {
      const out = {}; const safe = (k, f) => { try { out[k] = f(); } catch (e) { out[k] = 'ERR ' + String(e.message).slice(0, 80); } };
      S.activityLevel = 1.55; S.activitySrc = 'choisi'; S.workType = 'bureau'; S.height = 178; S.age = 41; S.bw = 82; S.gender = 'H'; S.goal = 'force';
      S.coachQuiz = { answers: { freq: '3', othersport: 'aucun' }, done: true };
      const now = Date.now(), auj = today();
      // Nutrition
      safe('calcTDEE', () => calcTDEE());
      safe('calcMacros', () => { const m = calcMacros(S.nutritionPhase); return { cal: m.calories, p: m.prot_g, g: m.carbs_g, l: m.fat_g, cycle: m.cycle || null }; });
      safe('jourSeance', () => jourSeance()); safe('ecartNiveauActivite', () => ecartNiveauActivite()); safe('pendingFreq', () => _pendingFreqContext());
      safe('weeklyCounts4', () => _weeklyCounts(4)); safe('semainesVecues', () => _semainesVecues(4));
      // séances, programmes
      safe('planned', () => plannedSession()); safe('manquee', () => seanceManquee()); safe('derniere', () => { const d = _derniereSeance(); return d && (d.ts || d.id); });
      safe('derniereAvant', () => { const d = _derniereSeanceAvant(now, auj); return d && (d.ts || d.id); }); safe('progs', () => JSON.stringify(S.programmes));
      // statistiques, registre, badges, récupération
      safe('synth', () => _synthConstantes(now)); safe('volParMuscle', () => _volumeParMuscle(now, 30));
      safe('registre', () => computeRegistreFacts());
      safe('badgesCond', () => ['first_session', 'fire', 'regular_10', 'assidu_25', 'veteran_50', 'streak_7'].map(id => { try { return id + ':' + _checkBadgeCond(BADGES.find(b => b.id === id)); } catch (e) { return id + ':?'; } }));
      safe('recup', () => { const d = calcRecoveryDetail(); return { score: d.score }; }); safe('recupProj', () => projectionRecup()); safe('recupHisto', () => recupHistorique(14));
      return out;
    });
    r.__ecrans = await X.pg.evaluate(() => {
      const o = {}; const safe = (k, f) => { try { o[k] = f(); } catch (e) { o[k] = 'ERR ' + String(e.message).slice(0, 80); } };
      safe('nutri', () => { renderNutrition(); const g = i => (document.getElementById(i) || {}).textContent; return { sessCal: g('nu-session-cal'), sessLbl: g('nu-session-lbl'), weekSess: g('nu-week-sess'), tdee: g('nu-tdee'), mkcal: g('m-kcal') }; });
      safe('progModal', () => { openProgModal(); const e = document.getElementById('ov-prog'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 400) : null; });
      return o; });
    r.__err = X.errs; await fermer(X); return r;
  };
  const A = await lire(base), B = await lire(base.concat(marches));
  const egal = k => J(A[k]) === J(B[k]);
  const groupe = ks => ks.filter(k => !egal(k));
  const erreur = v => typeof v === 'string' && /^ERR /.test(v);
  const vide = ks => ks.filter(k => erreur(A[k]) || erreur(B[k]));      // une sortie qui a LEVÉ une erreur ne prouve rien (null ou undefined, eux, sont des réponses)
  const GN = ['calcTDEE', 'calcMacros', 'jourSeance', 'ecartNiveauActivite', 'pendingFreq', 'weeklyCounts4', 'semainesVecues'];
  const GS = ['planned', 'manquee', 'derniere', 'derniereAvant', 'progs'];
  const GT = ['synth', 'volParMuscle', 'registre', 'badgesCond', 'recup', 'recupProj', 'recupHisto'];
  t(P + '1 ⭐ non-vacuité : les lecteurs répondent VRAIMENT sur l\'historique de musculation (TDEE > 0, fréquences 3/semaine, une séance planifiée lisible, aucune erreur) — sinon l\'égalité plus bas ne prouverait rien',
    (A.calcTDEE > 1500 && J(A.weeklyCounts4) !== '[0,0,0,0]' && A.derniere > 0 && vide(GN.concat(GS, GT)).length === 0 && !!A.__ecrans.nutri && !!A.__ecrans.nutri.tdee) || false, _det({ tdee: A.calcTDEE, wc: A.weeklyCounts4, vides: vide(GN.concat(GS, GT)), nutri: A.__ecrans.nutri }));
  const gN = groupe(GN), gS = groupe(GS), gT = groupe(GT);
  t(P + '2 ⭐ T22 / T24 : 9 marches de 255 kcal (dont une aujourd\'hui) ne changent NI la dépense (TDEE), NI les macros (calories, protéines, glucides, lipides, cycle), NI le jour de séance, NI le niveau d\'activité conseillé, NI les fréquences — la cible du jour n\'est PAS augmentée de 255',
    W('T22', 'nutrition', 'sorties identiques avec et sans activités', gN.length === 0, { differ: gN, tdee: [A.calcTDEE, B.calcTDEE], macros: [A.calcMacros, B.calcMacros] }, 'banc C-ACT-D2')
    && W('T24', 'cible alimentaire', 'cible du jour inchangée (pas de +255)', A.calcTDEE === B.calcTDEE && J(A.calcMacros) === J(B.calcMacros), [A.calcTDEE, B.calcTDEE], 'banc C-ACT-D2'), _det({ differ: gN, tdee: [A.calcTDEE, B.calcTDEE], macros: [A.calcMacros, B.calcMacros] }));
  t(P + '3 ⭐ T22 : l\'écran Nutrition affiche les MÊMES chiffres avec et sans activités (dépense, calories, tuile « Séance » du jour, séances de la semaine)',
    W('T22', 'écran nutrition', 'mêmes valeurs affichées', J(A.__ecrans.nutri) === J(B.__ecrans.nutri), { sans: A.__ecrans.nutri, avec: B.__ecrans.nutri }, 'banc C-ACT-D3'), _det({ sans: A.__ecrans.nutri, avec: B.__ecrans.nutri }));
  t(P + '4 ⭐ T38 / T39 : la séance planifiée, la séance manquée, la dernière séance (et la « dernière avant ») et les programmes sont IDENTIQUES avec et sans activités ; l\'écran « Programme » aussi',
    W('T38', 'séances existantes', 'lecteurs de séances identiques', gS.length === 0, { differ: gS }, 'banc C-ACT-D4') && W('T39', 'programmes', 'programmes et planification identiques', gS.length === 0 && J(A.__ecrans.progModal) === J(B.__ecrans.progModal), { differ: gS, modal: J(A.__ecrans.progModal) === J(B.__ecrans.progModal) }, 'banc C-ACT-D4'), _det({ differ: gS }));
  t(P + '5 ⭐ T41 / D05 : statistiques (constantes, volume par muscle), registre (faits mesurés), badges, score de récupération, projection et historique de récupération sont IDENTIQUES avec et sans activités',
    W('T41', 'statistiques', 'sorties identiques', gT.length === 0, { differ: gT }, 'banc C-ACT-D5') && W('D05', 'registre, badges, récupération', 'identiques', gT.length === 0, { differ: gT }, 'banc C-ACT-D5'), _det({ differ: gT, recup: [A.recup, B.recup] }));
  t(P + '6 aucune erreur de page pendant la lecture (sans / avec)', A.__err.length === 0 && B.__err.length === 0, J([A.__err, B.__err]));

  // ── D05 : le 10ᵉ « séance » — une activité n'en est pas une (badge « régulier 10 »), alors qu'une vraie séance, elle, le débloque (témoin qui PEUT rougir) ──
  {
    const neuf = base.slice(0, 1).concat(hist.slice(0, 8));      // 9 séances de musculation
    const X = await ouvrir({ ls: { ft4_sessions: J(neuf), ft4_badges: '{}' } }); const pg = X.pg;
    const n0 = await pg.evaluate(() => S.sessions.length);
    await creer(X, { type: 'marche', duree: 60, man: 255 });
    await pg.evaluate(() => checkBadges(true));
    const apresActivite = await pg.evaluate(() => ({ b10: !!(S.badges && S.badges.regular_10), n: S.sessions.filter(s => !s.autre).length, toasts: window.__T.filter(m => /Niveau|badge|Badge/.test(m)) }));
    // témoin : une vraie 10ᵉ séance de musculation débloque le badge
    await pg.evaluate(async () => { S.wkt = { date: today(), exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, type: 'N', done: true, at: 60000 }] }], startHour: 17, startTs: Date.now() - 1800000 }; await finishWorkout(); });
    const apresSeance = await pg.evaluate(() => ({ b10: !!(S.badges && S.badges.regular_10), n: S.sessions.filter(s => !s.autre).length }));
    t(P + '7 ⭐ D05 : avec 9 séances de musculation, enregistrer une marche ne débloque PAS « régulier 10 » (9 séances, pas 10) ; une vraie 10ᵉ séance, elle, le débloque (le détecteur sait donc rougir)',
      W('D05', 'badge 10 séances', 'marche ≠ séance ; la 10ᵉ vraie séance débloque', !apresActivite.b10 && apresActivite.n === 9 && apresSeance.b10 && apresSeance.n === 10, { apresActivite, apresSeance }, 'banc C-ACT-D7'), _det({ apresActivite, apresSeance }));
    await fermer(X);
  }

  // ── T39 : le cycle de vie d'une activité ne touche pas aux programmes, et une séance libre démarre normalement avec des activités dans l'historique ──
  {
    const X = await ouvrir({ ls: Object.assign({ ft4_sessions: J(base.concat(marches)) }, lsProfil) }); const pg = X.pg;
    const avant = await pg.evaluate(() => J => JSON.stringify(S.programmes)).then(() => pg.evaluate(() => JSON.stringify(S.programmes)));
    await creer(X, { type: 'course', duree: 30, man: 300 });
    const r = (await c.autres(X)).find(s => s.autre.type === 'course');
    await c.ouvrirAutre(X, r.ts); await c.saisirMan(X, 280); await c.enregistrerForm(X);
    await c.ouvrirAutre(X, r.ts); await pg.click('#au-del-btn'); await pg.click('#au-del-btn'); await pg.waitForTimeout(100);
    const apres = await pg.evaluate(() => JSON.stringify(S.programmes));
    const wkt = await pg.evaluate(() => { startWorkout(); return { ouvert: !!S.wkt, exs: S.wkt && S.wkt.exs.length, avant: !!document.getElementById('log-avant') }; });
    t(P + '8 T39 : créer, modifier puis supprimer une activité ne touche pas aux programmes ; « Séance libre » démarre une séance normale (vide, sans exercice hérité) avec 9 activités dans l\'historique',
      W('T39', 'programmes', 'programmes inchangés ; séance libre normale', apres === avant && wkt.ouvert && wkt.exs === 0, { programmes: apres === avant, wkt }, 'banc C-ACT-D8'), _det({ programmes: apres === avant, wkt }));
    await fermer(X);
  }
}
module.exports = { ecran };
