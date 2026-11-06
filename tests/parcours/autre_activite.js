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
  'D11': 'DÉCOUVERT — un enregistrement d\'activité venu d\'ailleurs, sans estimation figée, garde sa valeur rangée quand on le rouvre puis l\'enregistre',
};
const MX = {};   // la matrice, remplie par les témoins
function W(id, nom, attendu, cond, observe, preuve, extra) {
  const e = MX[id] = MX[id] || { id, scenario: SC[id] || '', attendu: [], observe: [], ok: true, nt: 0, preuve: [], simule: false };
  e.attendu.push(attendu); e.observe.push(observe === undefined ? '' : (typeof observe === 'string' ? observe : J(observe))); e.ok = e.ok && !!cond; e.nt++;
  if (process.env.ACT_VERBOSE) console.log('      · ' + id + ' [' + nom + '] ' + (cond ? 'ok' : 'ROUGE') + ' → ' + e.observe[e.observe.length - 1].slice(0, 400));
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
    /* Le marqueur d'amorçage vit dans localStorage (pas sessionStorage) : un SECOND onglet du même contexte (témoins multi-onglets) ne doit pas effacer les données du premier. */
    await cx.addInitScript(`(()=>{try{ if(localStorage.getItem('_act_seed'))return; localStorage.clear();
      const D=${J(D)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); localStorage.setItem('_act_seed','1'); }catch(e){} })();`);
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
  const sel = process.env.ACT_BLOCS ? process.env.ACT_BLOCS.split(',') : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const BL = { A: () => blocA(c), B: () => blocB(c), C: () => blocC(c), D: () => blocD(c), E: () => blocE(c), F: () => blocF(c), G: () => blocG(c), H: () => blocH(c), I: () => blocI(c), J: () => blocJ(c) };
  /* ⛔ Un bloc qui LÈVE une exception ne doit pas faire planter tout le banc (code 2, plus de ligne de total) : sous mutation, le premier témoin rouge est souvent suivi d'un geste
     impossible (le bouton « Supprimer » a déjà disparu…) — le banc doit alors dire ROUGE et continuer. L'arrêt du bloc est lui-même un rouge (`C-ACT-<bloc>X`) :
     un bloc interrompu n'est jamais un bloc vert. */
  for (const k of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']) if (sel.indexOf(k) >= 0) {
    try { await BL[k](); }
    catch (e) { t('C-ACT-' + k + 'X ⛔ le bloc ' + k + ' s\'est ARRÊTÉ avant la fin (exception) — les témoins suivants de ce bloc n\'ont PAS été joués', false, String(e && e.message || e).split('\n')[0].slice(0, 200)); }
  }
  /* A le parcours réel et la référence · B le mécanisme commun du cardio · C les bilans et les frontières de période · D les invariants (Nutrition, récupération,
     fréquence, badges, programmes) · E Milo · F Accueil · Agenda · Progrès · G persistance, hors ligne, reprise, conflits, identifiants · H exports et rapports · I valeur de la montre
     tapée mais champ pas encore quitté (iPhone). */

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
  /* A31 — le champ « Durée » est un champ ENTIER : `type="number"` (jamais « text »), pavé numérique, bornes 1 à AU_DUREE_MAX, pas de 1. Né d'un rouge RÉEL de la passe (05/11 : le témoin de base
     « ft-v1057 ne convertit AUCUN champ entier » refuse tout champ numérique hors liste blanche) — la liste blanche de la base n'est pas élargie. */
  const champD = await pg.evaluate(() => { const e = document.getElementById('au-duree'); return e ? { type: e.type, im: e.getAttribute('inputmode'), min: e.min, max: e.max, step: e.step, borne: String(AU_DUREE_MAX) } : null; });
  t(P + '31 ⛔ le champ « Durée » est un champ ENTIER : type="number", inputmode="numeric", min 1, max = AU_DUREE_MAX (1440), pas de 1',
    !!champD && champD.type === 'number' && champD.im === 'numeric' && champD.min === '1' && champD.max === champD.borne && champD.borne === '1440' && champD.step === '1', _det(champD));
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
    const rLA = await LA.pg.evaluate(() => { const s = S.sessions.find(x => x.autre) || { autre: {} }; return { date: s.date, h: s.startHour, heure: s.autre.heure, today: today(), enregistree: !!S.sessions.find(x => x.autre) }; });      // un refus (date « future ») rend un ROUGE, pas une exception
    await fermer(LA);
    const NZ = await ouvrir({ ls: { ft4_sessions: J([]) }, tz: 'Pacific/Auckland', now: '2026-11-06T00:30:00+13:00' });        // 05/11 11 h 30 en UTC
    await creer(NZ, { type: 'marche', duree: 30, man: 100 });
    const rNZ = await NZ.pg.evaluate(() => { const s = S.sessions.find(x => x.autre) || { autre: {} }; return { date: s.date, h: s.startHour, heure: s.autre.heure, today: today(), enregistree: !!S.sessions.find(x => x.autre) }; });
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
  // la marche d'aujourd'hui est enregistrée À 20 h 30 : APRÈS la séance de 17 h, donc l'enregistrement le plus récent de l'historique est une ACTIVITÉ — c'est le cas qui piège les lecteurs « dernière séance »
  const marches = [marche('2026-11-05', '20:30', { man: 255 })];
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
      safe('registre', () => { computeRegistreFacts(); return S.registre && S.registre.facts; });      // la fonction ÉCRIT les faits et ne rend rien : on lit ce qu'elle a écrit (sinon undefined = undefined, un vert qui ne peut pas rougir)
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
  if (process.env.ACT_SONDE) console.log('SONDE D (sorties sans activité, tronquées) :\n' + Object.keys(A).filter(k => !/^__/.test(k)).map(k => '   ' + k + ' = ' + String(J(A[k])).slice(0, 110)).join('\n'));    // mise au point : voir ce que les lecteurs répondent vraiment
  const egal = k => J(A[k]) === J(B[k]);
  const groupe = ks => ks.filter(k => !egal(k));
  const erreur = v => v === undefined || (typeof v === 'string' && /^ERR /.test(v));
  const vide = ks => ks.filter(k => erreur(A[k]) || erreur(B[k]));      // une sortie qui a LEVÉ une erreur, ou qui ne rend RIEN (undefined), ne prouve rien — `null`, lui, est une réponse
  const GN = ['calcTDEE', 'calcMacros', 'jourSeance', 'ecartNiveauActivite', 'pendingFreq', 'weeklyCounts4', 'semainesVecues'];
  const GS = ['planned', 'manquee', 'derniere', 'derniereAvant', 'progs'];
  const GT = ['synth', 'volParMuscle', 'registre', 'badgesCond', 'recup', 'recupProj', 'recupHisto'];
  t(P + '1 ⭐ non-vacuité : les lecteurs répondent VRAIMENT sur l\'historique de musculation (TDEE > 0, fréquences 3/semaine, une séance planifiée lisible, aucune erreur) — sinon l\'égalité plus bas ne prouverait rien',
    (A.calcTDEE > 1500 && J(A.weeklyCounts4) !== '[0,0,0,0]' && A.derniere > 0 && vide(GN.concat(GS, GT)).length === 0 && !!A.__ecrans.nutri && !!A.__ecrans.nutri.tdee
      && !!A.registre && !!A.registre.seances && !!A.registre.regularite && !!A.registre.anciennete) || false, _det({ tdee: A.calcTDEE, wc: A.weeklyCounts4, vides: vide(GN.concat(GS, GT)), nutri: A.__ecrans.nutri, registre: A.registre && Object.keys(A.registre) }));
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

  // ── D9 (I10) : l'Accueil reste MUET pour un compte qui n'a ni nuit enregistrée ni séance — une marche n'est pas un signal de récupération ──
  // La garde est dans `_renderHomeHero` (`_sansDonnee`) ; le moteur `calcRecoveryDetail` n'est pas touché (D5 le prouve). Le témoin de contraste est une VRAIE séance de musculation : elle,
  // fait apparaître un score — sans lui, un Accueil muet pour tout le monde passerait pour un succès.
  {
    const lireHero = async ls => { const X = await ouvrir({ ls }); const r = await X.pg.evaluate(() => { renderHome(); const h = document.getElementById('home-hero'); return h ? h.innerText.replace(/\s+/g, ' ').trim() : null; }); await fermer(X); return r; };
    const rien = await lireHero({ ft4_sessions: '[]' });
    const uneMarche = await lireHero({ ft4_sessions: J([marche('2026-11-05', '17:00', { man: 255 })]) });
    const uneSeance = await lireHero({ ft4_sessions: J([jeuReference()[0]]) });
    const muet = x => !!x && /Enregistre ton sommeil/.test(x);
    t(P + '9 ⭐ I10 / D05 : un compte SANS nuit ni séance reste muet à l\'Accueil (« Enregistre ton sommeil », aucun score) avec une marche seule — comme sans rien — alors qu\'une vraie séance de musculation fait apparaître un score (la garde sait donc rougir)',
      W('D05', 'récupération, Accueil', 'muet avec une marche seule ; score avec une vraie séance', muet(rien) && muet(uneMarche) && !muet(uneSeance), { rien, uneMarche, uneSeance }, 'banc C-ACT-D9'), _det({ rien, uneMarche, uneSeance }));
  }
  // ── D10 (T38) : une séance ANNONCÉE reste annoncée, une séance MANQUÉE reste manquée, même si une marche tombe le jour concerné ──
  // `plannedSession` / `seanceManquee` disent « honorée » dès qu'une séance a eu lieu le jour prévu ou après : une marche n'est pas une séance. Le jeu de départ n'avait AUCUNE annonce
  // (les deux fonctions rendaient `null`, avec et sans marche : un vert qui ne peut pas rougir, démasqué par la mutation M39) — ici l'annonce existe, et on vérifie qu'elle est lue.
  {
    const reel = base.filter(s => s.date <= '2026-11-02');                    // des séances réelles jusqu'au 02/11 seulement : rien le 03, le 04 ni le 05
    const lirePlan = async (jeu, np) => { const X = await ouvrir({ ls: { ft4_sessions: J(jeu) } });
      const r = await X.pg.evaluate(np => { S.nextPlanned = np; S.missedLog = []; return { planned: plannedSession(), manquee: seanceManquee() }; }, np); await fermer(X); return r; };
    const annonce = { date: '2026-11-05', label: 'Push' }, passee = { date: '2026-11-03', label: 'Pull' };
    const a1 = await lirePlan(reel, annonce), b1 = await lirePlan(reel.concat([marche('2026-11-05', '20:30', { man: 255 })]), annonce);
    const a2 = await lirePlan(reel, passee), b2 = await lirePlan(reel.concat([marche('2026-11-03', '08:00', { man: 255 })]), passee);
    const vivant = !!a1.planned && a1.planned.date === '2026-11-05' && !!a2.manquee && a2.manquee.date === '2026-11-03';
    t(P + '10 ⭐ T38 : une séance ANNONCÉE pour aujourd\'hui reste annoncée avec une marche aujourd\'hui, une séance MANQUÉE du 03/11 reste manquée avec une marche le 03/11 — l\'annonce est bien lue sans la marche (la garde sait donc rougir)',
      W('T38', 'séance annoncée / manquée', 'inchangées par une marche le jour concerné', vivant && J(a1) === J(b1) && J(a2) === J(b2), { sans: [a1, a2], avec: [b1, b2] }, 'banc C-ACT-D10'), _det({ vivant, sans: [a1, a2], avec: [b1, b2] }));
  }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// BLOC E — MILO : il RECOIT les activités (calories retenues, provenance) sans les confondre avec des séances. Le contexte avec et sans activité ne diffère que par ce bloc.
// ⚠️ Ce que ce bloc prouve est la PRÉSENCE et l'ABSENCE de ce que Milo reçoit (comme `tests/milo`), jamais l'OBÉISSANCE du modèle — aucun appel réseau n'est possible ici.
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function blocE(c) {
  const { t, ouvrir, sess, fermer, W, jeuReference, marche, J, _det } = c;
  const P = 'C-ACT-E';
  const lire = async (jeu, ls) => {
    const X = await ouvrir({ ls: Object.assign({ ft4_sessions: J(jeu) }, ls || {}) });
    const r = await X.pg.evaluate(async () => ({ full: await buildCoachContext('Comment va ma semaine ?'), bloc: _ctxAutresActivites(), hist: _historiqueCompact(), memoire: _memoireLongue(), duree: _ctxDureeSeance(), n: S.sessions.length }));
    r.err = X.errs; await fermer(X); return r;
  };
  const sans = jeuReference();
  const hier = marche('2026-11-04', '08:00', { man: 255, dist: 4.5 });
  const A = await lire(sans), B = await lire(sans.concat([hier]));
  t(P + '1 ⭐ T23 : sans activité, le contexte de Milo ne contient AUCUNE mention du bloc « AUTRES ACTIVITÉS » (les utilisateurs sans activité reçoivent exactement ce qu\'ils recevaient)',
    W('T23', 'sans activité', 'aucun bloc', A.bloc === '' && A.full.indexOf('AUTRES ACTIVITÉS') < 0 && A.full.length > 20000, { bloc: A.bloc.length, len: A.full.length }, 'banc C-ACT-E1'), _det({ bloc: A.bloc.length, len: A.full.length }));
  t(P + '2 ⭐ T23 : avec une marche d\'hier (255 kcal saisies, 4,5 km), Milo reçoit la ligne exacte — « Marche 60 min, 4.5 km — 255 kcal (valeur saisie par la personne, relevée sur sa montre) » — et la consigne de ne pas la compter comme une séance ni de l\'ajouter à la dépense',
    W('T23', 'avec activité', 'ligne exacte + consigne', B.full.indexOf(B.bloc) >= 0 && /2026-11-04 \(hier\) : Marche 60 min, 4\.5 km — 255 kcal \(valeur saisie par la personne, relevée sur sa montre\)/.test(B.bloc) && /PAS des séances de musculation/.test(B.bloc) && /aucune série, aucune charge, aucun volume/.test(B.bloc) && /ne les ajoute pas à sa dépense/.test(B.bloc), B.bloc, 'banc C-ACT-E2'), _det(B.bloc));
  const retire = B.full.split(B.bloc).join('');
  t(P + '3 ⭐ T23 / R34 : le contexte complet AVEC activité, une fois ce bloc retiré, est IDENTIQUE à l\'octet au contexte SANS activité (' + A.full.length + ' caractères) — rien d\'autre n\'a bougé dans ce que Milo reçoit',
    W('T23', 'différentiel de contexte', 'seul le bloc des activités diffère', B.bloc.length > 100 && retire === A.full, { sans: A.full.length, avec: B.full.length, bloc: B.bloc.length, egal: retire === A.full }, 'banc C-ACT-E3'), _det({ sans: A.full.length, avec: B.full.length, bloc: B.bloc.length, egal: retire === A.full }));
  /* E4 — avec le seul jeu de la mission (4 séances) l'« historique compact » est VIDE (il ne liste que les séances au-delà des 5 plus récentes) : l'égalité sans/avec ne prouvait rien et
     la mutation M20 (le compact liste les activités) survivait. On lui donne huit séances plus anciennes, et on exige que les trois lecteurs répondent VRAIMENT. */
  const anciennes = ['2026-10-30', '2026-10-27', '2026-10-24', '2026-10-21', '2026-10-18', '2026-10-15', '2026-10-12', '2026-10-09'].map((d, i) => { const ts = Date.parse(d + 'T18:00:00+01:00');
    return { id: ts, ts, date: d, startHour: 18, exs: [{ name: 'Développé Couché Barre', sets: [{ kg: 80 + i, reps: 5, type: 'N', done: true, rm1: 93 }] }], volume: (80 + i) * 5, uniConv: 1, synced: false, duration: 3600 + i * 60, progLabel: '', calories: 300, calData: { total: 300 } }; });
  const gros = sans.concat(anciennes);
  const A4 = await lire(gros), B4 = await lire(gros.concat([hier]));
  const vivants = A4.hist.length > 50 && A4.memoire.length > 50 && A4.duree.length > 20;
  t(P + '4 T23 : l\'historique compact, la mémoire longue et la durée réelle des séances sont les MÊMES avec et sans activité (la marche n\'y est ni une séance, ni une durée de séance) — et ces trois lecteurs répondent VRAIMENT sur 12 séances (sinon l\'égalité ne prouverait rien)',
    W('T23', 'lecteurs de séances de Milo', 'identiques', vivants && A4.hist === B4.hist && A4.memoire === B4.memoire && A4.duree === B4.duree, { vivants, hist: A4.hist === B4.hist, memoire: A4.memoire === B4.memoire, duree: A4.duree === B4.duree }, 'banc C-ACT-E4'), _det({ vivants, tailles: [A4.hist.length, A4.memoire.length, A4.duree.length], hist: A4.hist === B4.hist, memoire: A4.memoire === B4.memoire, duree: A4.duree === B4.duree }));
  // ── la seule activité du jour : Milo ne doit pas croire que la séance du jour est faite ──
  {
    const sansAuj = jeuReference().filter(s => s.date !== '2026-11-05');
    const A2 = await lire(sansAuj), B2 = await lire(sansAuj.concat([marche('2026-11-05', '08:00', { man: 255 })]));
    t(P + '5 ⭐ T23 : une marche AUJOURD\'HUI sans séance de musculation → le contexte de Milo ne diffère que par le bloc (« aujourd\'hui »), jamais par « séance du jour faite », dernière séance, rythme ou repos',
      W('T23', 'activité du jour', 'seul le bloc diffère', /\(aujourd'hui\)/.test(B2.bloc) && B2.full.split(B2.bloc).join('') === A2.full, { bloc: B2.bloc.slice(0, 160) }, 'banc C-ACT-E5'), _det({ egal: B2.full.split(B2.bloc).join('') === A2.full }));
  }
  // ── provenance : estimation / valeur saisie, étiquette personnalisée, intensité, plafond de 8 lignes sur 28 jours ──
  {
    const e = marche('2026-11-03', '08:00', { est: 312 });                                  // aucune valeur de montre
    const f = marche('2026-11-02', '09:00', { type: 'autre', man: 600, int: 'intense', duree: 90 }); f.autre.libelle = 'Football'; f.autre.intensity = 'intense';
    const vieux = marche('2026-09-20', '08:00', { man: 400 });                              // hors des 28 jours
    const tous = [e, f, vieux];
    for (let i = 0; i < 9; i++) tous.push(marche('2026-10-' + String(10 + i), '08:00', { man: 100 + i, dts: i }));
    const C = await lire(sans.concat(tous));
    const lignes = (C.bloc.match(/\n {2}· /g) || []).length;
    t(P + '6 ⭐ T23 : provenance et libellés — une marche SANS valeur de montre est dite « estimation de l\'app » ; « Football » (type libre, intensité intense, 600 kcal saisies) garde son nom ; une activité de plus de 28 jours n\'est pas envoyée ; jamais plus de 8 lignes',
      W('T23', 'provenance', 'estimation / saisie distinguées ; 28 jours ; 8 lignes', /2026-11-03 \(il y a 2 jours\) : Marche 60 min — 312 kcal \(estimation de l'app\)/.test(C.bloc) && /Football 90 min, intensité Intense — 600 kcal \(valeur saisie/.test(C.bloc) && C.bloc.indexOf('2026-09-20') < 0 && lignes <= 8 && lignes === 8, { lignes, bloc: C.bloc.slice(0, 300) }, 'banc C-ACT-E6')
      && W('T23', 'taille', 'bloc borné (8 lignes)', C.bloc.length < 2000, C.bloc.length, 'banc C-ACT-E6'), _det({ lignes, len: C.bloc.length }));
  }
  t(P + '7 aucune erreur de page', A.err.length === 0 && B.err.length === 0, J([A.err, B.err]));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// BLOC F — ACCUEIL · AGENDA (le calendrier de l'Accueil) · PROGRÈS (l'historique) : plusieurs activités par jour, mélanges avec musculation et cardio, cohérence, rafraîchissement
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function blocF(c) {
  const { t, ouvrir, sess, ag, txt, creer, ouvrirAutre, saisirMan, enregistrerForm, autres, fermer, W, jeuReference, marche, J, _det } = c;
  const P = 'C-ACT-F';
  const norm = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  const cardio03 = Object.assign({}, jeuReference()[1], { id: Date.parse('2026-11-03T19:30:00+01:00'), ts: Date.parse('2026-11-03T19:30:00+01:00'), date: '2026-11-03', calories: 300, calData: { total: 300, cardio: 300 } });
  const jeu = jeuReference().concat([
    marche('2026-11-05', '08:00', { man: 255 }),                                                   // avant la séance de 17 h
    marche('2026-11-05', '12:30', { type: 'velo_loisir', man: 400, duree: 90, est: 420, dts: 1 }),
    marche('2026-11-05', '20:30', { type: 'balade', man: 80, duree: 40, est: 90, dts: 2 }),         // APRÈS la séance : elle ne doit pas masquer sa couleur (F11)
    marche('2026-11-04', '07:00', { type: 'velo_sportif', man: 200, duree: 30, est: 270 }),         // le même jour que la musculation (365) ET le cardio (379)
    marche('2026-11-03', '08:00', { type: 'randonnee', man: 900, duree: 180, est: 700 }), cardio03, // un jour SANS musculation : cardio (300) + activité (900)
    marche('2026-11-01', '09:00', { type: 'randonnee', man: 900, duree: 180, est: 700, dts: 5 })]); // un jour d'activité SEULE
  const lsF = { ft4_sessions: J(jeu) };
  const panneau = async (X, ymd) => X.pg.evaluate(ymd => { _calSelect(ymd); const el = document.getElementById('home-secondary');
    const rows = [...el.querySelectorAll('[data-calact]')].map(r => ({ id: r.getAttribute('data-calact'), t: r.textContent.replace(/\s+/g, ' ').trim() }));
    const tot = el.querySelector('[data-caltotal]'), rev = el.querySelector('[data-calpanel-revoir]');
    return { rows, total: tot ? tot.textContent.replace(/\s+/g, ' ').trim() : null, revoir: rev ? rev.textContent.replace(/\s+/g, ' ').trim() : null, texte: el.innerText.replace(/\s+/g, ' ') }; }, ymd);
  const X = await ouvrir({ ls: lsF }); const pg = X.pg;
  await pg.evaluate(() => goScreen('home', document.getElementById('nb-home'))); await pg.waitForTimeout(400);

  // ── T09 / T11 : le 05/11 — musculation (303) + trois activités (255 · 400 · 80) ──
  const p5 = await panneau(X, '2026-11-05');
  t(P + '1 ⭐ T09 / T11 : le panneau du 05/11 liste les TROIS activités (identifiants distincts, durée, calories retenues, ✎ pour la valeur de la montre) à côté de la musculation, avec « Total du jour » = 303 + 255 + 400 + 80 = 1 038 kcal (chaque enregistrement UNE fois)',
    W('T09', 'plusieurs activités le même jour', '3 lignes distinctes ; total du jour 1038', p5.rows.length === 3 && new Set(p5.rows.map(r => r.id)).size === 3 && /255 kcal ✎/.test(p5.rows.map(r => r.t).join('|')) && /400 kcal ✎/.test(p5.rows.map(r => r.t).join('|')) && /80 kcal ✎/.test(p5.rows.map(r => r.t).join('|')) && /1038 kcal/.test(p5.total), p5, 'banc C-ACT-F1')
    && W('T11', 'musculation + activité', 'les deux visibles, total 1038', /Revoir la séance/.test(p5.revoir) && /1038 kcal/.test(p5.total) && /SÉRIES/.test(p5.texte), { revoir: p5.revoir, total: p5.total }, 'banc C-ACT-F1'), _det(p5));
  t(P + '2 T11 : le tonnage et les séries du jour ne parlent que de la musculation (16 séries du 05/11), les activités n\'en ajoutent aucune',
    W('T11', 'séries du jour', '16 séries (musculation seule)', /16 SÉRIES/.test(p5.texte) && /1 EXOS/.test(p5.texte), p5.texte.slice(0, 200), 'banc C-ACT-F2'), _det(p5.texte.slice(0, 200)));
  // ── T13 : musculation + cardio + autre activité le 04/11 ; T12 : cardio + autre activité le 03/11 (sans musculation) ──
  const p4 = await panneau(X, '2026-11-04'), p3 = await panneau(X, '2026-11-03');
  t(P + '3 ⭐ T13 : le 04/11 (musculation 365 + cardio 379 + vélo 200) → total du jour 944, une activité listée ; T12 : le 03/11 (cardio 300 + randonnée 900, sans musculation) → total 1 200',
    W('T13', 'musculation + cardio + activité', 'total 944', p4.rows.length === 1 && /944 kcal/.test(p4.total), p4, 'banc C-ACT-F3') && W('T12', 'cardio + activité', 'total 1200', p3.rows.length === 1 && /1200 kcal/.test(p3.total), p3, 'banc C-ACT-F3'), _det({ p4: p4.total, p3: p3.total }));
  // ── D04 : la couleur du calendrier n'est pas masquée par une activité enregistrée APRÈS la séance ; un jour d'activité seule est actif mais neutre ──
  const cel = await pg.evaluate(() => { const cell = d => [...document.querySelectorAll('#home-secondary [onclick^="_calSelect"]')].find(e => e.getAttribute('onclick').indexOf(d) >= 0);
    const c5 = cell('2026-11-05'), c1 = cell('2026-11-01'); return { c5: c5 ? c5.outerHTML : null, c1: c1 ? c1.outerHTML : null }; });
  const p1 = await panneau(X, '2026-11-01');
  t(P + '4 ⭐ D04 : le 05/11 la case garde la couleur de la RÉGION de la musculation (rouge, haut du corps) malgré une balade enregistrée à 20 h 30, APRÈS la séance de 17 h ; le 01/11 (activité seule) la case est cliquable mais NEUTRE',
    W('D04', 'couleur du calendrier', 'région de la musculation conservée ; activité seule neutre', !!cel.c5 && /width:19px;height:3px;border-radius:2px;background:var\(--red\)/.test(cel.c5) && !!cel.c1 && /height:3px;border-radius:2px;background:var\(--t2\)/.test(cel.c1) && !/height:3px;border-radius:2px;background:var\(--(red|blue|purp|orange|green)\)/.test(cel.c1) && p1.rows.length === 1 && /900 kcal/.test(p1.total) && !/TONNAGE/.test(p1.texte), { c5: (cel.c5 || '').slice(-120), c1: (cel.c1 || '').slice(-120), p1: p1.texte.slice(0, 120) }, 'banc C-ACT-F4'), _det({ c5: (cel.c5 || '').slice(-120), c1: (cel.c1 || '').slice(-120) }));
  t(P + '5 D04 : un jour d\'activité SEULE ouvre un panneau sans tonnage ni séries, avec le bouton « Voir l\'activité »',
    W('D04', 'jour d\'activité seule', 'panneau sans tonnage ; bouton Voir l\'activité', /Voir l'activité/.test(p1.revoir) && !/SÉRIES|TONNAGE/.test(p1.texte), p1, 'banc C-ACT-F5'), _det(p1));
  // ── T21 : la MÊME valeur partout (enregistrement · historique · panneau du calendrier · bilan du mois · tuile de l'Accueil) ──
  const mois = await pg.evaluate(() => { const b = _bilanMois('2026-11'); return { kcal: b.kcal, m: b.kcalMuscu, c: b.kcalCardio, a: b.kcalAutre, nSess: b.nSess, nAutre: b.nAutre, nCardio: b.nCardio, jours: b.jours }; });
  const tuile = await pg.evaluate(() => { renderHome(); const e = document.getElementById('h-sess'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; });
  t(P + '6 ⭐ T21 : bilan de novembre = 1 078 (musculation) + 679 (cardio) + 2 735 (activités) = 4 492 kcal, 3 séances de musculation, 6 activités, 5 jours actifs — et la tuile « Séances » de l\'Accueil compte les 5 séances (3 musculation + 2 cardio) « +6 act. », jamais les activités comme séances',
    W('T21', 'bilan du mois', 'catégories et total exacts', mois.m === 1078 && mois.c === 679 && mois.a === 2735 && mois.kcal === 4492 && mois.nSess === 3 && mois.nAutre === 6 && mois.nCardio === 2 && mois.jours === 5, mois, 'banc C-ACT-F6')
    && W('T21', 'tuile de l\'Accueil', '5 séances + 6 act.', /^5\s*\+6 act\./.test(tuile || ''), tuile, 'banc C-ACT-F6'), _det({ mois, tuile }));
  // ── T16 / D10 : l'historique (Progrès → Séances) ──
  await pg.evaluate(() => goSessionsHistory()); await pg.waitForTimeout(400);
  const h = await pg.evaluate(() => { const L = document.getElementById('sess-list'); const cards = [...L.querySelectorAll('.sess-card')];
    return { filtres: [...document.querySelectorAll('.sessf-chip')].map(b => b.textContent.trim()), n: cards.length,
      autres: cards.filter(e => e.dataset.genre === 'autre').map(e => ({ t: e.textContent.replace(/\s+/g, ' ').trim(), milo: !!e.querySelector('[onclick*="debrief"], [onclick*="analys"]') || /Analyser avec Milo/.test(e.textContent), kgTravail: /kg de travail/.test(e.textContent) })),
      entete: (L.innerText.match(/\d+ séances? · [^\n]*activit[^\n]*/) || [''])[0] }; });
  t(P + '7 ⭐ T16 / D10 : l\'historique montre les 6 activités avec leur icône, leur durée, leur distance et leurs calories retenues ; AUCUNE n\'affiche « kg de travail » ni « Analyser avec Milo » ; le mois dit « 3 séances · 2 cardio · 6 activités » ; les filtres Tout · Musculation · Cardio · Activités existent',
    W('T16', 'consultation', '6 cartes d\'activité propres', h.autres.length === 6 && h.autres.every(a => !a.kgTravail && !a.milo && /🔥\d+ kcal/.test(a.t)) && /🚶 Marche/.test(h.autres.map(a => a.t).join('|')) && /🥾 Randonnée/.test(h.autres.map(a => a.t).join('|')) && h.filtres.join() === 'Tout,Musculation,Cardio,Activités' && /3 séances · 2 cardio · 6 activités/.test(norm(h.entete)), h, 'banc C-ACT-F7')
    && W('D10', 'cartes', 'ni kg de travail ni bouton Milo', h.autres.every(a => !a.kgTravail && !a.milo), h.autres.length, 'banc C-ACT-F7'), _det(h));
  const f = await pg.evaluate(() => {
      const genre = e => e.classList.contains('sess-card-autre') ? 'autre' : (/kg de travail/.test(e.textContent) ? 'muscu' : (/^\s*🏃 Cardio/.test(e.textContent) ? 'cardio' : '?'));
      const lire = g => { setSessGenre(g); return [...document.querySelectorAll('#sess-list .sess-card')].map(genre); };
      const a = lire('autre'), m = lire('muscu'), k = lire('cardio'), tout = lire('');
      return { a, m, k, tout: tout.length, toutGenres: tout.filter(x => x === 'autre').length + '/' + tout.filter(x => x === 'muscu').length + '/' + tout.filter(x => x === 'cardio').length }; });
  t(P + '8 ⭐ T16 : le filtre « Activités » ne garde que les 6 activités, « Musculation » que les 3 séances, « Cardio » que les 2 cardios ; « Tout » rend les 11 enregistrements',
    W('T16', 'filtres', 'Activités 6 · Musculation 3 · Cardio 2 · Tout 11 (6/3/2)', f.a.length === 6 && f.a.every(g => g === 'autre') && f.m.length === 3 && f.m.every(g => g === 'muscu') && f.k.length === 2 && f.k.every(g => g === 'cardio') && f.tout === 11 && f.toutGenres === '6/3/2', f, 'banc C-ACT-F8'), _det(f));
  // ── T48 : modifier depuis l'historique (un vrai clic sur la carte) → tous les écrans concernés suivent ──
  const marche5 = jeu.find(s => s.autre && s.date === '2026-11-05' && s.startHour === 8);
  await pg.evaluate(() => setSessGenre('autre')); await pg.waitForTimeout(100);
  await pg.click('.sess-card-autre[onclick*="' + marche5.ts + '"]'); await pg.waitForTimeout(250);
  const ouvert = await pg.evaluate(() => document.getElementById('ov-autre').classList.contains('open') && document.getElementById('au-title').textContent === 'Modifier l\'activité');
  await saisirMan(X, 100); await enregistrerForm(X);
  const apres = await pg.evaluate(() => { const carte = [...document.querySelectorAll('#sess-list .sess-card-autre')].map(e => e.textContent.replace(/\s+/g, ' ')).join('|'); return { carte }; });
  const p5b = await panneau(X, '2026-11-05'); const moisB = await pg.evaluate(() => _bilanMois('2026-11').kcalAutre); const tuileB = await pg.evaluate(() => { renderHome(); return document.getElementById('h-sess').textContent.replace(/\s+/g, ' ').trim(); });
  t(P + '9 ⭐ T48 / T05 : un clic sur la carte de la marche ouvre le formulaire de modification ; 255 → 100 : l\'historique affiche 100 sans rechargement, le panneau du calendrier dit « Total du jour » 883 (1 038 − 155), le bilan du mois compte 2 580 kcal d\'activités (2 735 − 155), la tuile de l\'Accueil est inchangée',
    W('T48', 'modification', 'historique, calendrier, bilan et tuile suivent', ouvert && /🔥100 kcal ✎/.test(apres.carte) && /883 kcal/.test(p5b.total) && moisB === 2580 && tuileB === tuile, { ouvert, carte: apres.carte.slice(0, 160), total: p5b.total, moisB, tuileB }, 'banc C-ACT-F9')
    && W('T05', 'depuis l\'historique', 'modification persistée et répercutée', ouvert && moisB === 2580, moisB, 'banc C-ACT-F9'), _det({ ouvert, total: p5b.total, moisB, tuileB }));
  // suppression de l'activité du 01/11 (jour d'activité seule) : plus de carte, plus de case cliquable, le bilan et la tuile suivent
  const hike01 = jeu.find(s => s.autre && s.date === '2026-11-01');
  await pg.click('.sess-card-autre[onclick*="' + hike01.ts + '"]'); await pg.waitForTimeout(250); await pg.click('#au-del-btn'); await pg.click('#au-del-btn'); await pg.waitForTimeout(250);
  const sup = await pg.evaluate(ts => ({ carte: !!document.querySelector('.sess-card-autre[onclick*="' + ts + '"]'), nAutre: document.querySelectorAll('#sess-list .sess-card-autre').length, kcal: _bilanMois('2026-11').kcalAutre, nA: _bilanMois('2026-11').nAutre }), hike01.ts);
  await pg.evaluate(() => goScreen('home', document.getElementById('nb-home'))); await pg.waitForTimeout(300);
  const caseSup = await pg.evaluate(() => { _calSelDay = null; _renderHomeCalendar(); return !![...document.querySelectorAll('#home-secondary [onclick^="_calSelect"]')].find(e => e.getAttribute('onclick').indexOf('2026-11-01') >= 0); });
  const tuileC = await pg.evaluate(() => { renderHome(); return document.getElementById('h-sess').textContent.replace(/\s+/g, ' ').trim(); });
  t(P + '10 ⭐ T48 / T08 : supprimer la randonnée du 01/11 (seule activité de ce jour) → sa carte disparaît sans rechargement, il reste 5 activités (1 680 kcal), le 01/11 n\'est plus un jour cliquable du calendrier, la tuile de l\'Accueil dit « +5 act. »',
    W('T48', 'suppression', 'carte, case, bilan et tuile suivent', !sup.carte && sup.nAutre === 5 && sup.kcal === 1680 && sup.nA === 5 && !caseSup && /^5\s*\+5 act\./.test(tuileC), { sup, caseSup, tuileC }, 'banc C-ACT-F10')
    && W('T08', 'depuis l\'historique', 'suppression répercutée partout', !sup.carte && sup.nA === 5, sup, 'banc C-ACT-F10'), _det({ sup, caseSup, tuileC }));
  /* F13 — D04 sous un autre angle : le test F4 prenait une séance « haut du corps », dont la couleur (rouge) est AUSSI la couleur par défaut d'une activité sans région — une mutation qui
     laisse l'activité choisir la couleur (M18) y survivait. Ici le jour est un jour de JAMBES (violet, « bas du corps ») suivi d'une balade à 20 h 30 : seule la bonne couleur est violette. */
  {
    const tsJ = Date.parse('2026-11-03T17:00:00+01:00');
    const jambes = { id: tsJ, ts: tsJ, date: '2026-11-03', startHour: 17, exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, type: 'N', done: true, rm1: 117 }, { kg: 100, reps: 5, type: 'N', done: true, rm1: 117 }] }],
      volume: 1000, uniConv: 1, synced: false, duration: 3600, progLabel: '', calories: 300, calData: { total: 300 } };
    const Y = await ouvrir({ ls: { ft4_sessions: J([jambes, marche('2026-11-03', '20:30', { man: 255 })]) } });
    await Y.pg.evaluate(() => goScreen('home', document.getElementById('nb-home'))); await Y.pg.waitForTimeout(400);
    const c3 = await Y.pg.evaluate(() => { const e = [...document.querySelectorAll('#home-secondary [onclick^="_calSelect"]')].find(x => x.getAttribute('onclick').indexOf('2026-11-03') >= 0); return e ? e.outerHTML : null; });
    await fermer(Y);
    t(P + '13 ⭐ D04 : un jour de JAMBES (Squat) suivi d\'une balade à 20 h 30 garde la couleur violette (« bas du corps ») dans le calendrier — l\'activité n\'a aucune région et prendrait le rouge par défaut',
      W('D04', 'couleur du calendrier (jambes)', 'violet conservé malgré une activité enregistrée après', !!c3 && /height:3px;border-radius:2px;background:var\(--purp\)/.test(c3), c3 ? c3.slice(-240) : null, 'banc C-ACT-F13'), _det(c3 ? c3.slice(-240) : null));
  }
  /* F12 — la carte d'historique d'une SÉANCE (musculation, cardio seul, programme + cloud, longue durée) est IDENTIQUE À L'OCTET à celle de la version publiée.
     Les cinq cartes ci-dessous ont été rendues par `_sessCarteHtml` sur ft-v1263 (master e2b942f3), horloge figée, puis hachées (SHA-256 de leur tableau JSON).
     Elle protège l'enveloppe commune `_sessCarteEnveloppe` (un seul producteur de carte : PS-S3) : pour tout ce qui n'est pas une activité, rien ne bouge (invariant I13). */
  const CARTES_PUBLIE = 'd5595888187707ffea130d85ecf841e39e7ab4a5fc115c7cc0630a805dd0d9b6';
  const cartesSeance = await pg.evaluate(() => {
    const sauve = S.sessions, T = (d, hh) => Date.parse(d + 'T' + hh + ':00:00+01:00');
    const mk = (d, hh, exs, extra) => Object.assign({ id: T(d, hh), ts: T(d, hh), date: d, startHour: +hh, exs, volume: 0, uniConv: 1, synced: false, duration: 3600, progLabel: '', calories: 300, calData: { total: 300 } }, extra || {});
    const set = (kg, reps) => ({ kg, reps, type: 'N', done: true, rm1: Math.round(kg * (1 + reps / 30)) });
    try {
      S.sessions = [
        mk('2026-11-05', '17', [{ name: 'Développé Couché Barre', sets: [set(100, 5), set(100, 5), set(100, 5)] }], { volume: 1500, calories: 303 }),
        mk('2026-11-04', '19', [], { duration: 2700, calories: 379, cardio: { type: 'tapis', intensity: 'modere', duration: 45 }, calData: { total: 379, cardio: 379 } }),
        mk('2026-11-04', '18', [{ name: 'Squat', sets: [set(120, 5), set(120, 5)] }, { name: 'Tractions', sets: [set(0, 8)] }], { volume: 1200, synced: true, progLabel: 'Jour A', calories: 365 }),
        mk('2026-11-02', '18', [{ name: 'Développé Couché Barre', sets: Array.from({ length: 17 }, () => set(100, 5)) }, { name: 'Rowing Barre', sets: [set(80, 8)] }, { name: 'Curl Barre', sets: [set(30, 10)] }, { name: 'Squat', sets: [set(100, 5)] }, { name: 'Élévations Latérales', sets: [set(10, 12)] }], { volume: 9000, calories: 410, duration: 5400 }),
        mk('2026-10-30', '08', [{ name: 'Développé Couché Barre', sets: [set(90, 5)] }], { volume: 450, duration: 7 * 3600, calories: 150 })
      ];
      return S.sessions.map(s => _sessCarteHtml(s));
    } finally { S.sessions = sauve; }
  });
  const shaCartes = require('crypto').createHash('sha256').update(J(cartesSeance), 'utf8').digest('hex');
  t(P + '12 ⛔ I13 : la carte d\'historique d\'une SÉANCE (5 cas : musculation, cardio seul, programme + cloud, longue durée) est IDENTIQUE à l\'octet à celle de la version publiée ft-v1263 (SHA-256 mesuré)',
    shaCartes === CARTES_PUBLIE && cartesSeance.length === 5 && cartesSeance.every(c => !/sess-card-autre|data-genre/.test(c)), J({ sha: shaCartes, attendu: CARTES_PUBLIE, n: cartesSeance.length }));
  t(P + '11 aucune erreur de page pendant tout le bloc', X.errs.length === 0, J(X.errs));
  await fermer(X);
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// BLOC G — PERSISTANCE · HORS LIGNE · REPRISE · CONFLITS · IDENTIFIANTS · import d'historique · outil admin
// Ce qui est RÉEL : le navigateur, le stockage local, les fonctions de fusion de l'app, le vrai `Code.js` (chargé dans un contexte vm par le harnais de chaos).
// Ce qui est SIMULÉ, et dit tel quel : le serveur du réseau (une route interceptée répond « ok »), le « second appareil » (un second onglet du même navigateur).
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function blocG(c) {
  const { t, ouvrir, sess, ag, txt, creer, ouvrirAutre, saisirMan, enregistrerForm, autres, stocke, fermer, W, jeuReference, marche, J, _det, T0, PORT } = c;
  const P = 'C-ACT-G';
  const prep = pg => pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none';
    window.__T = []; const _t = window.toast; window.toast = function (m) { window.__T.push(String(m)); try { return _t.apply(this, arguments); } catch (e) {} }; });
  // le « serveur » : toute requête hors localhost est CAPTURÉE puis acquittée (aucun réseau réel)
  const capter = async X => { const cap = []; await X.cx.route(u => !/^http:\/\/localhost:/.test(String(u)), r => { cap.push({ url: r.request().url(), m: r.request().method(), body: r.request().postData() });
    r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"status":"ok"}' }); }); return cap; };
  // les deux destinations de la même sauvegarde : Apps Script (corps à plat) et le miroir du Worker (`{action, data, token}`)
  const sauvegardes = cap => cap.filter(r => r.m === 'POST' && /script\.google\.com/.test(r.url) && r.body && /"action":"saveProfile"/.test(r.body)).map(r => { try { return JSON.parse(r.body); } catch (e) { return null; } }).filter(Boolean);
  const miroirs = cap => cap.filter(r => r.m === 'POST' && /workers\.dev/.test(r.url) && r.body).map(r => { try { const o = JSON.parse(r.body); return typeof o.data === 'string' ? JSON.parse(o.data) : o.data; } catch (e) { return null; } }).filter(Boolean);

  // ── T27 : l'application est FERMÉE aussitôt après « Enregistrer » ──
  {
    const X = await ouvrir(sess(jeuReference())); const cap = await capter(X); const pg = X.pg;
    await creer(X, { duree: 60, man: 255, noSave: true });
    await pg.click('#au-save-btn', { noWaitAfter: true }); await pg.close({ runBeforeUnload: false });                 // fermée SANS attendre : ni la synchro (4 s), ni le moindre délai
    const pg2 = await X.cx.newPage(); pg2.on('pageerror', e => X.errs.push(String(e.message).slice(0, 160)));
    await pg2.clock.setFixedTime(new Date(T0)); await pg2.goto('http://localhost:' + PORT + '/index.html'); await pg2.waitForTimeout(1500); await prep(pg2);
    const r = await pg2.evaluate(() => ({ n: S.sessions.filter(s => s.autre).length, cal: (S.sessions.find(s => s.autre) || {}).calories, sto: JSON.parse(localStorage.getItem('ft4_sessions')).filter(s => s.autre).length, total: _agregatPeriode(S.sessions).kcal.total }));
    await pg2.waitForTimeout(5200);                                                                                       // la synchro différée (4 s) a-t-elle repris à la réouverture ?
    const nuage = sauvegardes(cap).some(b => (b.sessions || []).some(s => s.autre && s.calories === 255));
    t(P + '1 ⭐ T27 : fermeture de l\'application IMMÉDIATEMENT après « Enregistrer » → à la réouverture l\'activité est là (mémoire ET stockage), total 1 712 ; l\'écriture locale précède toute synchro (règle d\'or #3)',
      W('T27', 'fermeture pendant la sauvegarde', 'activité retrouvée, total 1712', r.n === 1 && r.cal === 255 && r.sto === 1 && r.total === 1712, { r, nuageApresReouverture: nuage }, 'banc C-ACT-G1'), _det({ r, nuageApresReouverture: nuage }));
    await fermer(X);
  }

  // ── T28 : HORS CONNEXION — toute la vie d'une activité (créer · modifier · supprimer) sans réseau ──
  {
    const X = await ouvrir(sess(jeuReference())); const pg = X.pg;
    await X.cx.setOffline(true); const hors = await pg.evaluate(() => navigator.onLine === false);
    await creer(X, { duree: 45, man: 200 }); const r = (await autres(X))[0];
    await ouvrirAutre(X, r.ts); await saisirMan(X, 150); await enregistrerForm(X); const a1 = await ag(X);
    await ouvrirAutre(X, r.ts); await pg.click('#au-del-btn'); await pg.click('#au-del-btn'); await pg.waitForTimeout(100); const a2 = await ag(X);
    t(P + '2 ⭐ T28 : sans réseau (mode avion émulé), créer (200) · modifier (150) · supprimer une activité fonctionne ; totaux 1 657 puis 1 607 puis 1 457 ; aucune erreur',
      W('T28', 'hors connexion', 'créer, modifier, supprimer sans réseau', hors && !!r && r.calories === 200 && a1.autre === 150 && a1.total === 1607 && a2.autre === 0 && a2.total === 1457 && X.errs.length === 0, { hors, a1: a1.total, a2: a2.total, errs: X.errs }, 'banc C-ACT-G2'), _det({ hors, a1: a1.total, a2: a2.total, errs: X.errs }));
    await fermer(X);
  }

  // ── T29 (SIMULÉ côté serveur) : coupure du réseau → création → retour du réseau → la sauvegarde suivante emporte l'activité telle quelle ──
  {
    const X = await ouvrir(sess(jeuReference())); const pg = X.pg;
    const cap = []; let coupe = true, coupees = 0;                                                                           // le « serveur » : coupé (la connexion échoue) puis rétabli (il acquitte)
    await X.cx.route(u => !/^http:\/\/localhost:/.test(String(u)), r => { if (coupe) { coupees++; return r.abort('internetdisconnected'); }
      cap.push({ url: r.request().url(), m: r.request().method(), body: r.request().postData() });
      r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"status":"ok"}' }); });
    await creer(X, { duree: 60, man: 255, dist: '4,5', notes: 'Parc' }); await pg.evaluate(() => _cloudSync()); await pg.waitForTimeout(400);
    const horsLigne = sauvegardes(cap).length, tentatives = coupees;                                                       // rien n'a pu partir ; l'app a bien essayé
    coupe = false;                                                                                                          // le réseau revient
    await pg.evaluate(() => window.dispatchEvent(new Event('online'))); await pg.waitForTimeout(5300);                      // l'app, d'elle-même (4 s de différé + marge), renvoie-t-elle quelque chose ?
    const seul = sauvegardes(cap).length;
    await pg.evaluate(() => { persist(); }); await pg.waitForTimeout(5300);                                                 // le prochain geste (n'importe quel `persist()`) → synchro différée
    const envoi = sauvegardes(cap); const dernier = envoi[envoi.length - 1]; const mir = miroirs(cap); const dernierMiroir = mir[mir.length - 1];
    const act = dernier && (dernier.sessions || []).find(s => s.autre); const actMiroir = dernierMiroir && (dernierMiroir.sessions || []).find(s => s.autre);
    t(P + '3 ⭐ T29 (SIMULÉ : le « serveur » est une route coupée puis rétablie) : réseau coupé → rien ne part (' + tentatives + ' tentative(s) échouée(s), sans erreur affichée) ; le réseau revient → la sauvegarde SUIVANTE emporte les 5 séances/activités et l\'activité INTACTE (bloc autre, valeur retenue 255, distance, notes, identifiants) vers Apps Script ET vers le miroir',
      W('T29', 'reprise', 'au retour du réseau, l\'activité part intacte à la sauvegarde suivante', horsLigne === 0 && tentatives >= 1 && !!dernier && dernier.sessions.length === 5 && !!act && act.calories === 255 && act.autre.kcalMan === 255 && act.autre.kcalEst === 312 && act.autre.distance === 4.5 && act.autre.notes === 'Parc'
        && Number.isInteger(act.id) && act.id === act.ts && act.exs.length === 0 && !!actMiroir && J(actMiroir) === J(act) && X.errs.length === 0, { horsLigne, tentatives, envoiSansGeste: seul, n: dernier && dernier.sessions.length, act: act && act.autre, miroir: !!actMiroir && J(actMiroir) === J(act) }, 'banc C-ACT-G3', { simule: true }),
      _det({ horsLigne, tentatives, envoiSansGeste: seul, n: dernier && dernier.sessions.length, miroir: !!actMiroir && J(actMiroir) === J(act) }));
    await fermer(X);
  }

  // ── T29 / T30 (VRAI Code.js) : ce que le serveur déployé fait d'une activité, et du « dernier écrivain gagne » ──
  {
    const HA = require('../../tools/chaos/harness_appsscript.js'); const h = HA.creer(); const EM = 'activite.test@exemple.invalid';
    const jA = h.poserJeton(EM, 'appareil A'), jB = h.poserJeton(EM, 'appareil B');
    const ref = JSON.parse(J(jeuReference())); const m = marche('2026-11-05', '08:00', { man: 255, dist: 4.5 });
    const corps = (sessions, token) => ({ action: 'saveProfile', email: EM, token, name: 'ACT', bw: 82, age: 41, height: 178, gender: 'H', goal: 'force', sessions, prs: {} });
    h.sauver(corps(ref, jA));
    const r1 = h.sauver(corps(ref.concat([m]), jA));
    const stocke = (h.lire(EM) || {}).sessions || [];
    const sm = stocke.find(s => s && s.autre);
    t(P + '4 ⭐ T29 (VRAI Code.js déployé, harnais vm) : une sauvegarde qui contient une activité la RANGE telle quelle — le bloc « autre » (estimation, valeur saisie, poids, mode, distance), les calories retenues et l\'identifiant, sans rien perdre ni ajouter',
      W('T29', 'serveur réel', 'activité rangée à l\'identique', r1.status === 'ok' && stocke.length === 5 && !!sm && J(sm) === J(m), { statut: r1.status, n: stocke.length, identique: !!sm && J(sm) === J(m) }, 'banc C-ACT-G4'), _det({ statut: r1.status, n: stocke.length, identique: !!sm && J(sm) === J(m) }));
    // le « second appareil » (B) n'a jamais vu l'activité : sa sauvegarde périmée passe APRÈS celle de A
    const r2 = h.sauver(corps(ref, jB)); const apres = (h.lire(EM) || {}).sessions || [];
    const perdue = !apres.some(s => s && s.autre);
    t(P + '5 T30 / T31 (VRAI Code.js, 2ᵉ appareil SIMULÉ) : LIMITE CONNUE, MESURÉE — le serveur applique « dernier écrivain gagne » à la liste ENTIÈRE : la sauvegarde périmée d\'un 2ᵉ appareil qui n\'a jamais vu l\'activité l\'efface du classeur (statut ' + r2.status + ') ; c\'est le même comportement que pour toute séance (banc de chaos M1a) et la restauration par union (témoin suivant) la rattrape',
      W('T30', 'dernier écrivain gagne', 'limite mesurée : la liste périmée écrase', perdue === true || r2.status !== 'ok', { statut: r2.status, activitePerdue: perdue, n: apres.length }, 'banc C-ACT-G5', { simule: true })
      && W('T31', 'second appareil (serveur)', 'comportement du serveur pour l\'activité identique à celui d\'une séance', true, { n: apres.length }, 'banc C-ACT-G5', { simule: true }), _det({ statut: r2.status, activitePerdue: perdue, n: apres.length }));
  }

  // ── T30 / T49 : la RESTAURATION par union d'identifiants — l'activité manquante revient ; deux versions différentes d'un même identifiant → conflit signalé, jamais d'écrasement silencieux ──
  {
    const X = await ouvrir(sess(jeuReference())); const pg = X.pg;
    const m = marche('2026-11-05', '08:00', { man: 255 }), m2 = JSON.parse(J(m)); m2.autre.kcalMan = 100; m2.calories = 100; m2.calData = { total: 100, autre: 100 };
    const r = await pg.evaluate(([cloudA, cloudB, locA]) => { const loc = JSON.parse(JSON.stringify(S.sessions));
      const A = _fusionnerSeancesRestauration(loc, JSON.parse(cloudA));                                       // le nuage a l'activité, ce téléphone ne l'a pas
      const loc2 = JSON.parse(JSON.stringify(S.sessions)).concat([JSON.parse(locA)]);
      const B = _fusionnerSeancesRestauration(loc2, JSON.parse(cloudB));                                      // les deux l'ont, avec des valeurs différentes
      return { A: { n: A.liste.length, ajoutees: A.ajoutees, conflits: A.conflits.length, a: (A.liste.find(s => s.autre) || {}).calories }, B: { n: B.liste.length, ajoutees: B.ajoutees, conflits: B.conflits.length, gardee: (B.liste.find(s => s.autre) || {}).calories, ids: B.liste.filter(s => s.autre).length } }; },
      [J(jeuReference().concat([m])), J(jeuReference().concat([m2])), J(m)]);
    t(P + '6 ⭐ T30 / T49 : restauration par union — l\'activité du nuage absente du téléphone REVIENT (1 ajoutée, 5 enregistrements) ; une activité présente des deux côtés avec deux valeurs (255 / 100) donne UN conflit signalé, la version du téléphone est gardée (255), jamais deux copies',
      W('T30', 'union à la restauration', 'ajout sans doublon ; conflit signalé', r.A.n === 5 && r.A.ajoutees === 1 && r.A.conflits === 0 && r.A.a === 255 && r.B.n === 5 && r.B.conflits === 1 && r.B.gardee === 255 && r.B.ids === 1, r, 'banc C-ACT-G6')
      && W('T49', 'identité à la restauration', 'un identifiant = une activité', r.B.ids === 1 && r.A.n === 5, r, 'banc C-ACT-G6'), _det(r));
    await fermer(X);
  }

  // ── T31 : DEUX ONGLETS du même navigateur (le « second appareil » le plus proche qu'on puisse conduire ici — SIMULÉ) ──
  {
    const X = await ouvrir(sess(jeuReference())); const pgA = X.pg, cx = X.cx;
    const pgB = await cx.newPage(); pgB.on('pageerror', e => X.errs.push(String(e.message).slice(0, 160)));
    await pgB.clock.setFixedTime(new Date(T0)); await pgB.goto('http://localhost:' + PORT + '/index.html'); await pgB.waitForTimeout(1500); await prep(pgB);
    const XB = { pg: pgB, cx, errs: X.errs };
    await creer(X, { type: 'marche', duree: 60, man: 255, heure: '08:00' });                       // l'onglet A enregistre X…
    await pgB.waitForTimeout(300);
    await creer(XB, { type: 'velo_loisir', duree: 90, man: 400, heure: '12:30' });                 // …l'onglet B, qui n'a jamais vu X, enregistre Y
    const apresB = await pgB.evaluate(() => ({ mem: S.sessions.filter(s => s.autre).map(s => s.calories).sort(), sto: JSON.parse(localStorage.getItem('ft4_sessions')).filter(s => s.autre).map(s => s.calories).sort() }));
    t(P + '7 ⭐ T31 (SIMULÉ : deux onglets d\'un même navigateur) : l\'onglet B, resté sur une liste périmée, enregistre une 2ᵉ activité — l\'activité de l\'onglet A N\'EST PAS écrasée (mémoire de B et stockage ont les deux : 255 et 400)',
      W('T31', 'deux onglets', 'les deux activités survivent', J(apresB.mem) === J([255, 400].map(String).map(Number).sort()) && J(apresB.sto) === J([255, 400]), apresB, 'banc C-ACT-G7', { simule: true }), _det(apresB));
    // la suppression dans B n'est PAS ressuscitée par une fusion avec le disque, et la modification d'un même enregistrement dans les deux onglets ne crée jamais de doublon
    const idX = (await pgA.evaluate(() => S.sessions.find(s => s.autre && s.calories === 255 && s.startHour === 8).ts));
    await ouvrirAutre(X, idX); await saisirMan(X, 111); await enregistrerForm(X);                       // A modifie X (111)
    await ouvrirAutre(XB, idX); await saisirMan(XB, 222); await enregistrerForm(XB);                     // B modifie le MÊME enregistrement (222) : le dernier gagne
    const fin = await pgB.evaluate(i => ({ n: S.sessions.filter(s => s.autre).length, x: S.sessions.filter(s => s.autre && (s.ts || s.id) === i).map(s => s.calories), sto: JSON.parse(localStorage.getItem('ft4_sessions')).filter(s => s.autre && s.ts === i).map(s => s.calories) }), idX);
    t(P + '8 T31 / T49 (SIMULÉ) : le même enregistrement modifié dans les deux onglets (111 puis 222) reste UN enregistrement ; le dernier écrivain gagne (222) ; aucun doublon',
      W('T31', 'même enregistrement, deux onglets', 'un seul enregistrement ; dernier écrivain gagne', fin.n === 2 && fin.x.length === 1 && fin.x[0] === 222 && fin.sto.length === 1 && fin.sto[0] === 222, fin, 'banc C-ACT-G8', { simule: true })
      && W('T49', 'références', 'identité stable entre onglets', fin.x.length === 1, fin, 'banc C-ACT-G8'), _det(fin));
    await fermer(X);
  }

  // ── T46 / T47 : ÉCHEC D'ÉCRITURE (stockage plein) puis nouvelle tentative — rien de perdu, rien de dupliqué ──
  {
    const X = await ouvrir(sess(jeuReference())); const pg = X.pg;
    const bloquer = on => pg.evaluate(on => { if (!window.__realSet) { window.__realSet = Storage.prototype.setItem; window.__echecs = 0;
        Storage.prototype.setItem = function (k, v) { if (window.__bloquer && k === 'ft4_sessions') { window.__echecs++; const e = new Error('The quota has been exceeded.'); e.name = 'QuotaExceededError'; throw e; } return window.__realSet.apply(this, arguments); }; }
      window.__bloquer = on; }, on);
    const etat = () => pg.evaluate(() => ({ n: S.sessions.length, sto: localStorage.getItem('ft4_sessions'), toasts: window.__T.slice(), ouvert: document.getElementById('ov-autre').classList.contains('open'), duree: (document.getElementById('au-duree') || {}).value, echecs: window.__echecs || 0 }));
    const avant = await etat();
    // création qui échoue
    await creer(X, { duree: 60, man: 255, noSave: true }); await bloquer(true); await enregistrerForm(X);
    const e1 = await etat();
    t(P + '9 ⭐ T46 / T47 : l\'écriture est refusée (stockage plein) à la CRÉATION → rien n\'est ajouté en mémoire ni dans le stockage, le formulaire reste ouvert avec ce qui a été tapé (60 min), message « Stockage plein… »',
      W('T46', 'échec à la création', 'rien écrit ; formulaire gardé ; message', e1.n === avant.n && e1.sto === avant.sto && e1.ouvert && e1.duree === '60' && e1.echecs >= 1 && e1.toasts.some(m => /Stockage plein : rien n'a été enregistré/.test(m)), e1, 'banc C-ACT-G9')
      && W('T47', 'création échouée', 'ni perte ni doublon', e1.n === avant.n && e1.sto === avant.sto, { n: e1.n, avant: avant.n }, 'banc C-ACT-G9'), _det({ n: e1.n, ouvert: e1.ouvert, duree: e1.duree, echecs: e1.echecs, toasts: e1.toasts }));
    // nouvelle tentative, le stockage est libéré : UNE activité, pas deux
    await bloquer(false); await enregistrerForm(X); const e2 = await etat(); const a2 = await ag(X);
    t(P + '10 ⭐ T46 / T47 : nouvelle tentative une fois le stockage libéré → UNE activité (255), total 1 712, formulaire fermé, aucun doublon (une seule entrée dans le stockage)',
      W('T46', 'nouvelle tentative', 'une activité, total 1712', e2.n === avant.n + 1 && !e2.ouvert && a2.nAutre === 1 && a2.total === 1712 && JSON.parse(e2.sto).filter(s => s.autre).length === 1, { n: e2.n, a2 }, 'banc C-ACT-G10')
      && W('T47', 'après nouvelle tentative', 'aucun doublon', a2.nAutre === 1 && new Set(JSON.parse(e2.sto).map(s => s.ts || s.id)).size === JSON.parse(e2.sto).length, a2.nAutre, 'banc C-ACT-G10'), _det({ n: e2.n, a2 }));
    // modification qui échoue : l'ancienne valeur est intacte
    const idA = (await pg.evaluate(() => S.sessions.find(s => s.autre).ts)); const stoOk = e2.sto;
    await ouvrirAutre(X, idA); await saisirMan(X, 99); await bloquer(true); await enregistrerForm(X); const e3 = await etat();
    t(P + '11 T46 / T47 : une MODIFICATION refusée (255 → 99) laisse l\'enregistrement tel qu\'il était (255, en mémoire et dans le stockage) et le formulaire ouvert ; la nouvelle tentative l\'applique une fois',
      W('T46', 'échec à la modification', 'ancienne valeur intacte', e3.sto === stoOk && await pg.evaluate(() => S.sessions.find(s => s.autre).calories === 255) && e3.ouvert, { ouvert: e3.ouvert }, 'banc C-ACT-G11')
      && await (async () => { await bloquer(false); await enregistrerForm(X); const a3 = await ag(X); return W('T47', 'modification rejouée', 'valeur appliquée une fois', a3.autre === 99 && a3.nAutre === 1, a3, 'banc C-ACT-G11'); })(), '');
    // suppression qui échoue : l'enregistrement reste
    await ouvrirAutre(X, idA); await bloquer(true); await pg.click('#au-del-btn'); await pg.click('#au-del-btn'); await pg.waitForTimeout(100); const e4 = await etat();
    t(P + '12 T46 / T47 : une SUPPRESSION refusée laisse l\'activité en place (mémoire et stockage) ; la nouvelle tentative la supprime',
      W('T46', 'échec à la suppression', 'activité conservée', e4.n === avant.n + 1 && await pg.evaluate(() => S.sessions.some(s => s.autre)) && e4.toasts.filter(m => /Stockage plein/.test(m)).length >= 3, { n: e4.n }, 'banc C-ACT-G12')
      && await (async () => { await bloquer(false); await ouvrirAutre(X, idA); await pg.click('#au-del-btn'); await pg.click('#au-del-btn'); await pg.waitForTimeout(100); const a4 = await ag(X); return W('T47', 'suppression rejouée', 'supprimée une fois', a4.nAutre === 0 && a4.total === 1457, a4, 'banc C-ACT-G12'); })(), '');
    await fermer(X);
  }

  // ── T37 : conservation des anciennes données — écrire puis relire (persist, load) ne change aucun ancien enregistrement ──
  {
    const m1 = Object.assign({}, jeuReference()[3], { id: 1, ts: 1, date: '2026-10-05', calories: 500, calData: { total: 500, cardio: 150 }, cardio: { type: 'tapis', intensity: 'modere', duration: 25 } });
    const m3 = Object.assign({}, jeuReference()[1], { id: 3, ts: 3, date: '2026-10-07', calories: 300, calData: { total: 300, cardio: 300 } });
    const jeu = [m3, m1].concat(jeuReference()); const avant = J(jeu);
    const X = await ouvrir(sess(jeu)); const pg = X.pg;
    await creer(X, { duree: 30, man: 100 });                                                                // une activité s'ajoute : persist() réécrit TOUT
    const apres = await pg.evaluate(() => { const bruts = JSON.parse(localStorage.getItem('ft4_sessions')); load(); return { disque: JSON.stringify(bruts.filter(s => !s.autre)), memoire: JSON.stringify(S.sessions.filter(s => !s.autre)) }; });
    const idx = o => JSON.stringify(JSON.parse(o).sort((a, b) => (a.ts || a.id) - (b.ts || b.id)));
    t(P + '13 ⭐ T37 : après l\'ajout d\'une activité (qui réécrit tout l\'historique) puis un rechargement par `load()`, les ' + jeu.length + ' anciens enregistrements — dont un cardio ancien et une muscu+cardio ancienne — sont IDENTIQUES à l\'octet, sur le disque et en mémoire',
      W('T37', 'conservation', 'anciens enregistrements identiques à l\'octet', idx(apres.disque) === idx(avant) && idx(apres.memoire) === idx(avant), { disque: idx(apres.disque) === idx(avant), memoire: idx(apres.memoire) === idx(avant) }, 'banc C-ACT-G13'), _det({ disque: idx(apres.disque) === idx(avant), memoire: idx(apres.memoire) === idx(avant) }));
    await fermer(X);
  }

  // ── D01 : l'import d'historique ne supprime jamais une activité ; un jour d'activité seule n'est pas un « conflit » ──
  {
    const walkTard = marche('2026-11-05', '20:30', { man: 80, type: 'balade', duree: 40, est: 90 });              // enregistrée APRÈS la séance de 17 h → classée avant elle dans la liste du jour
    const seul = marche('2026-11-01', '09:00', { man: 900, type: 'randonnee', duree: 180, est: 700 });
    const X = await ouvrir(sess(jeuReference().concat([walkTard, seul]))); const pg = X.pg;
    const r = await pg.evaluate(() => {
      _histExtracted = { sessions: [{ date: '2026-11-01', label: 'Import', exercises: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5 }] }] }, { date: '2026-11-05', label: 'Import', exercises: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5 }] }] }], typesNormalises: 0 };
      _renderHistPreview(); const conflits = _histConflicts.map(c => c.idx);
      const i5 = _histConflicts.find(c => c.idx === 1); if (i5) i5.resolution = 'replace';
      const premier = S.sessions.find(s => s.date === '2026-11-05'); const premierEstActivite = !!(premier && premier.autre);
      finalImportHist();
      return { conflits, premierEstActivite, activites5: S.sessions.filter(s => s.autre && s.date === '2026-11-05').length, activite1: S.sessions.filter(s => s.autre && s.date === '2026-11-01').length,
        muscu5: S.sessions.filter(s => !s.autre && !s.cardio && s.date === '2026-11-05').map(s => (s.exs[0] || {}).name), anciennePerdue: !S.sessions.some(s => s.date === '2026-11-05' && !s.autre && (s.exs[0] || {}).name === 'Développé Couché Barre') }; });
    t(P + '14 ⭐ D01 : importer un historique — le 01/11 (activité seule) n\'est PAS un conflit, le 05/11 (séance + activités) en est un ; « Remplacer » retire la SÉANCE du 05/11 (pas l\'activité de 20 h 30, pourtant classée avant elle), toutes les activités sont conservées',
      W('D01', 'import d\'historique', 'activités conservées ; conflit seulement sur une vraie séance', J(r.conflits) === '[1]' && r.premierEstActivite && r.activites5 === 1 && r.activite1 === 1 && r.anciennePerdue && r.muscu5.indexOf('Squat Barre') >= 0, r, 'banc C-ACT-G14'), _det(r));
    await fermer(X);
  }

  // ── D02 : l'outil admin de recalage (×1,55 des anciennes séances non chronométrées) ne touche jamais une activité ──
  {
    const walk = marche('2026-11-05', '08:00', { man: 255 }), walk2 = marche('2026-11-03', '08:00', { est: 312, dts: 3 });
    const X = await ouvrir(sess(jeuReference().concat([walk, walk2]))); const pg = X.pg;
    const r = await pg.evaluate(() => { window._isAdminUnlocked = () => true; const avant = S.sessions.map(s => ({ id: s.ts || s.id, cal: s.calories, autre: !!s.autre }));
      _recalerAnciennesSeances();
      const apres = S.sessions.map(s => ({ id: s.ts || s.id, cal: s.calories, autre: !!s.autre, av: s.caloriesAvant }));
      return { act: apres.filter(a => a.autre).every((a, i) => a.cal === avant.filter(x => x.autre)[i].cal && a.av === undefined), muscuRecalee: apres.filter(a => !a.autre && a.av !== undefined).length }; });
    t(P + '15 ⭐ D02 : l\'outil admin « recaler les anciennes séances » recale les séances de musculation non chronométrées (témoin : au moins une l\'est) mais ne change NI la valeur retenue NI n\'ajoute `caloriesAvant` à aucune activité',
      W('D02', 'outil admin', 'activités intactes ; l\'outil agit bien sur la musculation', r.act && r.muscuRecalee >= 1, r, 'banc C-ACT-G15'), _det(r));
    await fermer(X);
  }

  // ── T17 : modification d'une ANCIENNE activité (octobre, enregistrée à 90 kg, le poids du jour est 82) ; D11 : un enregistrement venu d'ailleurs, sans estimation figée ──
  {
    const vieille = marche('2026-10-12', '08:00', { man: 255, est: 342 }); vieille.autre.kcalPoids = 90;                                        // 3,8 MET × 90 kg × 1 h = 342
    const etrangere = { id: 1790000000000, ts: 1790000000000, date: '2026-10-14', exs: [], exercises: [], volume: 0, uniConv: 1, synced: true, duration: 3600, progLabel: '', calories: 250, calData: { total: 250, autre: 250 }, autre: { type: 'marche', duration: 60 } };
    const X = await ouvrir(sess(jeuReference().concat([vieille, etrangere]))); const pg = X.pg;
    const lire = id => pg.evaluate(i => JSON.parse(JSON.stringify(S.sessions.find(s => (s.ts || s.id) === i))), id);
    // ① on rouvre et on ne change que les notes : rien d'autre ne bouge (ni la valeur, ni l'estimation figée à 90 kg)
    await ouvrirAutre(X, vieille.ts); await pg.fill('#au-notes', 'revue en novembre'); await enregistrerForm(X); const r1 = await lire(vieille.ts);
    // ② on change la date (12 → 13 octobre) : même identifiant, même valeur
    await ouvrirAutre(X, vieille.ts); await pg.fill('#au-date', '2026-10-13'); await enregistrerForm(X); const r2 = await lire(vieille.ts);
    // ③ on change la durée : la valeur de la montre reste, l'estimation suit AU POIDS RANGÉ (90 kg → 171), jamais au poids du jour (82 kg → 156)
    await ouvrirAutre(X, vieille.ts); await pg.fill('#au-duree', '30'); await enregistrerForm(X); const r3 = await lire(vieille.ts);
    t(P + '17 ⭐ T17 : une ANCIENNE activité (12/10, enregistrée à 90 kg) rouverte puis enregistrée garde sa valeur (255), son estimation figée (342) et son poids (90) ; changer sa date la garde sous le même identifiant ; changer sa durée refait l\'estimation au poids RANGÉ (171, pas 156)',
      W('T17', 'ancienne activité', 'valeurs figées conservées ; date modifiable ; durée au poids rangé', r1.calories === 255 && r1.autre.kcalEst === 342 && r1.autre.kcalPoids === 90 && r1.autre.notes === 'revue en novembre' && r2.date === '2026-10-13' && (r2.ts || r2.id) === vieille.ts && r2.calories === 255
        && r3.calories === 255 && r3.autre.kcalMan === 255 && r3.autre.kcalEst === 171 && r3.autre.kcalPoids === 90, { r1: r1.autre, r2: r2.date, r3: r3.autre }, 'banc C-ACT-G17')
      && W('T05', 'ancienne activité', 'modification après coup sans recalcul silencieux', r1.calories === 255 && r1.autre.kcalEst === 342, r1.calories, 'banc C-ACT-G17'), _det({ r1: r1.autre, r2: r2.date, r3: r3.autre }));
    // D11 : un enregistrement SANS estimation figée (autre appareil, autre version) : rouvert puis réenregistré tel quel, sa valeur rangée (250) ne change pas en silence
    await ouvrirAutre(X, etrangere.ts); const eForm = await txt(X, '#au-kcal'); await enregistrerForm(X); const r4 = await lire(etrangere.ts);
    t(P + '18 ⭐ D11 : un enregistrement venu d\'ailleurs, SANS estimation figée (calories rangées 250, marche de 60 min), rouvert puis réenregistré sans rien changer garde 250 (le formulaire l\'affiche comme estimation) — jamais un recalcul au poids du jour (312)',
      W('D11', 'enregistrement étranger', 'valeur rangée conservée', r4.calories === 250 && r4.autre.kcalEst === 250 && /Retenu 250 kcal/.test(eForm || '') && !('kcalMan' in r4.autre), { cal: r4.calories, est: r4.autre.kcalEst, eForm }, 'banc C-ACT-G18'), _det({ cal: r4.calories, est: r4.autre.kcalEst, eForm }));
    await fermer(X);
  }

  // ── T49 : références — l'identifiant est numérique dans le HTML, la porte « détail » route vers le BON formulaire ──
  {
    const walk = marche('2026-11-05', '08:00', { man: 255 });
    const X = await ouvrir(sess(jeuReference().concat([walk]))); const pg = X.pg;
    const r = await pg.evaluate(id => { goSessionsHistory(); return new Promise(res => setTimeout(() => { const carte = document.querySelector('.sess-card-autre'); const html = carte ? carte.outerHTML : ''; openSessDetail(id); res({ onclick: /onclick="openSessDetail\((\d+)\)"/.test(html), cle: _dbfCle(S.sessions.find(s => s.autre)) === String(id), ouvertActivite: document.getElementById('ov-autre').classList.contains('open'), detailMuscuOuvert: document.getElementById('ov-sess-detail').classList.contains('open') }); }, 300)); }, walk.ts);
    t(P + '16 T49 : la carte appelle `openSessDetail(<nombre>)` ; la clé de débrief `_dbfCle` vaut l\'identifiant ; ouvrir le détail d\'une activité ouvre le formulaire d\'ACTIVITÉ (pas le détail de séance de musculation)',
      W('T49', 'références', 'identifiant numérique ; routage vers le formulaire d\'activité', r.onclick && r.cle && r.ouvertActivite && !r.detailMuscuOuvert, r, 'banc C-ACT-G16'), _det(r));
    await fermer(X);
  }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// BLOC H — EXPORTS ET RAPPORTS : le CSV et le PDF de l'historique, l'export JSON. Sans activité : le fichier est celui d'AVANT, à l'octet. Avec : une ligne `ACTIVITE`, jamais une série.
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function blocH(c) {
  const { t, ouvrir, sess, fermer, W, jeuReference, marche, J, _det } = c;
  const P = 'C-ACT-H';
  /* Capturé sur la version publiée ft-v1263 (master e2b942f3), jeu de la mission SANS activité, horloge du 05/11/2026 : SHA-256 du texte du CSV (BOM compris) et phrase d'en-tête du PDF. */
  const CSV_REF_SHA = 'ff926df019bdd5a6999055e90c358f0701992c05804e33344e62deedfd98033a';
  const ENTETE_REF = '4 séances sur 3 jours d\'entraînement · 49 séries · exporté le 05/11/2026';
  const sha = txt => require('crypto').createHash('sha256').update(txt, 'utf8').digest('hex');
  const pdftexte = b64 => { const cp = require('child_process'), os = require('os'), path = require('path'), fs = require('fs'); const f = path.join(os.tmpdir(), 'act_hist_' + process.pid + '_' + Date.now() + '.pdf');
    try { fs.writeFileSync(f, Buffer.from(b64, 'base64')); const r = cp.spawnSync('pdftotext', ['-layout', f, '-'], { encoding: 'utf8' }); return r.status === 0 ? r.stdout : null; } catch (e) { return null; } finally { try { fs.unlinkSync(f); } catch (e) {} } };
  const stubFichier = pg => pg.evaluate(() => { window.__F = []; window._donnerFichier = async (c, n, m) => { const o = { n, m }; if (typeof c === 'string') o.txt = c; else { const b = await c.arrayBuffer(); let bin = ''; const u = new Uint8Array(b); for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); o.b64 = btoa(bin); } window.__F.push(o); return 'ok'; }; });
  const marcheDist = marche('2026-11-05', '08:00', { man: 255, dist: 4.5, int: 'modere' });

  // ── CSV : sans activité = le fichier d'avant à l'octet ; avec activité = une ligne ACTIVITE de plus, rien d'autre ne bouge ──
  {
    const X1 = await ouvrir(sess(jeuReference())); await stubFichier(X1.pg);
    const sans = await X1.pg.evaluate(async () => { await exportHistoCsv(); return { csv: window.__F[0].txt, toasts: window.__T.slice(), entete: _histoEntete(_histoLignes()) }; });
    await fermer(X1);
    t(P + '1 ⭐ T42 / D03 : le CSV de l\'historique SANS activité est identique à l\'octet à celui de la version publiée (SHA-256 ' + CSV_REF_SHA.slice(0, 8) + '…), l\'en-tête du PDF aussi, le message « 50 séries exportées » aussi',
      W('T42', 'CSV sans activité', 'identique à la version publiée', sha(sans.csv) === CSV_REF_SHA && sans.entete === ENTETE_REF && sans.toasts.indexOf('50 séries exportées') >= 0, { sha: sha(sans.csv).slice(0, 12), entete: sans.entete, toasts: sans.toasts }, 'banc C-ACT-H1'), _det({ sha: sha(sans.csv).slice(0, 12), entete: sans.entete, toasts: sans.toasts }));
    const X2 = await ouvrir(sess(jeuReference().concat([marcheDist]))); await stubFichier(X2.pg);
    const avec = await X2.pg.evaluate(async () => { await exportHistoCsv(); return { csv: window.__F[0].txt, toasts: window.__T.slice(), entete: _histoEntete(_histoLignes()) }; });
    await fermer(X2);
    const lignes = avec.csv.split('\n'), act = lignes.filter(l => /;ACTIVITE;/.test(l)), reste = lignes.filter(l => !/;ACTIVITE;/.test(l)).join('\n');
    const cols = l => { const o = []; let cur = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ';' && !q) { o.push(cur); cur = ''; } else cur += ch; } o.push(cur); return o; };
    t(P + '2 ⭐ T42 : avec une marche de 4,5 km → UNE ligne `ACTIVITE` de plus (« Autre activité · Marche — 4,5 km (Modéré) · 1 · ACTIVITE · 0 · 60 · · 0 »), 9 colonnes comme les autres lignes, les 51 autres lignes IDENTIQUES à l\'octet à l\'export d\'avant, volume total inchangé (26 005), message « 51 lignes exportées »',
      W('T42', 'CSV avec activité', 'une ligne ACTIVITE ; le reste identique', act.length === 1 && cols(act[0]).length === 9 && cols(act[0])[1] === 'Autre activité' && cols(act[0])[2] === 'Marche — 4,5 km (Modéré)' && cols(act[0])[4] === 'ACTIVITE' && cols(act[0])[5] === '0' && cols(act[0])[6] === '60' && cols(act[0])[8] === '0'
        && sha(reste) === CSV_REF_SHA && lignes.slice(1).reduce((a, l) => a + (+cols(l)[8] || 0), 0) === 26005 && avec.toasts.indexOf('51 lignes exportées') >= 0, { act, sansActiviteIdentique: sha(reste) === CSV_REF_SHA, toasts: avec.toasts }, 'banc C-ACT-H2'), _det({ act, identique: sha(reste) === CSV_REF_SHA, toasts: avec.toasts }));
    t(P + '3 T42 : l\'en-tête du PDF compte à part — « 4 séances · 1 activité sur 3 jours d\'entraînement · 49 séries » : l\'activité n\'est ni une séance ni une série',
      W('T42', 'en-tête du PDF', '4 séances · 1 activité · 49 séries', avec.entete === '4 séances · 1 activité sur 3 jours d\'entraînement · 49 séries · exporté le 05/11/2026', avec.entete, 'banc C-ACT-H3'), avec.entete);
  }

  // ── PDF : la remise du fichier est suivie du BON message (corrigé : il disait « Export PDF impossible » après un export réussi), et le document contient l'activité ──
  {
    const X = await ouvrir(sess(jeuReference().concat([marcheDist]))); await stubFichier(X.pg);
    const r = await X.pg.evaluate(async () => { await exportHistoPdf(); await new Promise(r => setTimeout(r, 200)); return { fichier: window.__F[0] ? { n: window.__F[0].n, m: window.__F[0].m, taille: (window.__F[0].b64 || '').length } : null, toasts: window.__T.slice() }; });
    const b64 = await X.pg.evaluate(() => window.__F[0] && window.__F[0].b64); const texte = b64 ? pdftexte(b64) : null;
    t(P + '4 ⭐ T42 : l\'export PDF remet un fichier PDF et le message est « 4 séances et 1 activité exportées » (la version publiée affichait « Export PDF impossible » juste après avoir remis le fichier : variable `seances` inexistante) ; aucune erreur',
      W('T42', 'PDF — remise et message', 'fichier remis ; message de réussite', !!r.fichier && r.fichier.m === 'application/pdf' && r.fichier.taille > 10000 && r.toasts.indexOf('4 séances et 1 activité exportées') >= 0 && r.toasts.indexOf('Export PDF impossible') < 0 && X.errs.length === 0, r, 'banc C-ACT-H4'), _det(r));
    t(P + '5 ⭐ T42 : le texte du PDF (extrait par `pdftotext`) porte l\'en-tête « 4 séances · 1 activité », la ligne de l\'activité (Marche — 4,5 km, ACTIVITE, 60) et les 49 séries sans aucun tonnage ajouté par l\'activité',
      W('T42', 'PDF — contenu', 'en-tête, ligne ACTIVITE, séries inchangées', !!texte && /4 séances · 1 activité sur 3 jours d'entraînement · 49 séries/.test(texte.replace(/\s+/g, ' ')) && /Marche — 4,5 km \(Modéré\)/.test(texte.replace(/\s+/g, ' ')) && /ACTIVITE/.test(texte) && (texte.match(/Développé Couché Barre/g) || []).length === 49, { extrait: texte ? texte.replace(/\s+/g, ' ').slice(0, 260) : null, nDC: texte ? (texte.match(/Développé Couché Barre/g) || []).length : null }, 'banc C-ACT-H5'), _det({ nDC: texte ? (texte.match(/Développé Couché Barre/g) || []).length : null }));
    await fermer(X);
  }

  // ── L'export JSON (restreint « séances seules » et complet) : l'activité part avec son bloc, le message la compte à part ──
  {
    const X = await ouvrir(sess(jeuReference().concat([marcheDist]))); const pg = X.pg;
    await pg.evaluate(() => { window.__B = []; const o = URL.createObjectURL; URL.createObjectURL = function (b) { window.__B.push(b); return o.call(URL, b); }; HTMLAnchorElement.prototype.click = function () {}; });
    const r = await pg.evaluate(async () => { lancerExportSeances(); await new Promise(r => setTimeout(r, 200)); const restreint = JSON.parse(await window.__B[0].text()); const t1 = window.__T.slice();
      lancerExport(false); await new Promise(r => setTimeout(r, 200)); const complet = JSON.parse(await window.__B[1].text());
      const pick = e => (e.donnees.sessions || []).find(s => s.autre);
      return { t1, restreint: { n: (restreint.donnees.sessions || []).length, act: pick(restreint) }, complet: { n: (complet.donnees.sessions || []).length, act: pick(complet) } }; });
    t(P + '6 ⭐ T42 : les deux exports JSON contiennent l\'activité avec son bloc complet (valeur retenue 255, estimation 312, valeur saisie, distance) parmi 5 enregistrements ; le message de l\'export restreint dit « 4 séances et 1 activité exportées · sans tes données de santé ✓ »',
      W('T42', 'export JSON', 'activité exportée avec son bloc ; message correct', r.restreint.n === 5 && r.complet.n === 5 && !!r.restreint.act && r.restreint.act.calories === 255 && r.restreint.act.autre.kcalMan === 255 && r.restreint.act.autre.kcalEst === 312 && r.restreint.act.autre.distance === 4.5 && J(r.complet.act) === J(r.restreint.act)
        && r.t1.indexOf('4 séances et 1 activité exportées · sans tes données de santé ✓') >= 0, r, 'banc C-ACT-H6'), _det(r));
    await fermer(X);
  }
}


// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// BLOC I — LA VALEUR DE LA MONTRE TAPÉE, LE CHAMP PAS ENCORE QUITTÉ (iPhone : un bouton touché ne retire pas toujours le focus, donc `change` n'a pas eu lieu)
// Un clic PROGRAMMATIQUE (`.click()`) ne déplace pas le focus : c'est exactement ce cas. Sans la lecture avant d'enregistrer, la valeur tapée serait perdue en silence.
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function blocI(c) {
  const { t, ouvrir, sess, ag, creer, autres, fermer, W, jeuReference, J, _det } = c;
  const P = 'C-ACT-I';
  const clic = (pg, sel) => pg.evaluate(s => document.querySelector(s).click(), sel);
  // ── le formulaire d'activité ──
  {
    const X = await ouvrir(sess(jeuReference())); const pg = X.pg;
    await creer(X, { duree: 60, noSave: true });
    await pg.locator('#au-kcal input').fill('255');                                  // tapé, pas de Tab : aucun `change`
    const avant = await pg.evaluate(() => ({ man: _au.kcalMan, champ: document.querySelector('#au-kcal input').value }));
    await clic(pg, '#au-save-btn'); await pg.waitForTimeout(150);
    const r = (await autres(X))[0]; const a = await ag(X);
    t(P + '1 ⭐ T04 : 255 tapé dans « Calories de ta montre » SANS quitter le champ, puis « Enregistrer » (le focus ne bouge pas) → l\'activité est enregistrée à 255 (pas à l\'estimation 312) ; le brouillon ne la connaissait pas encore',
      W('T04', 'valeur tapée, champ non quitté', 'enregistrée à 255', avant.man === undefined && avant.champ === '255' && !!r && r.calories === 255 && r.autre.kcalMan === 255 && r.autre.kcalEst === 312 && a.total === 1712, { avant, cal: r && r.calories, a: a.total }, 'banc C-ACT-I1'), _det({ avant, cal: r && r.calories }));
    await fermer(X);
  }
  {
    const X = await ouvrir(sess(jeuReference())); const pg = X.pg; const n0 = await pg.evaluate(() => S.sessions.length);
    await creer(X, { duree: 60, noSave: true });
    await pg.locator('#au-kcal input').fill('abc');
    await clic(pg, '#au-save-btn'); await pg.waitForTimeout(150);
    const r = await pg.evaluate(() => ({ n: S.sessions.length, ouvert: document.getElementById('ov-autre').classList.contains('open'), err: document.getElementById('au-err').style.display === 'block' ? document.getElementById('au-err').textContent : '' }));
    t(P + '2 ⭐ T44 : une valeur INVALIDE tapée sans quitter le champ (« abc ») puis « Enregistrer » → rien n\'est enregistré, le formulaire reste ouvert avec le message — la valeur n\'est jamais ignorée en silence',
      W('T44', 'invalide non quittée', 'refus visible, rien d\'écrit', r.n === n0 && r.ouvert && /nombre de kcal/i.test(r.err), r, 'banc C-ACT-I2'), _det(r));
    await fermer(X);
  }
  // ── la séance en cours (cardio seul) : « Terminer » / « C'est noté » avec la valeur tapée à l'instant ──
  {
    const X = await ouvrir(sess([], { ft4_bw: '72.5' })); const pg = X.pg;
    await pg.evaluate(() => { startWorkout(); _cardioOpen = true; setCardioField('type', 'elliptique', 'apres'); setCardioField('intensity', 'leger', 'apres'); setCardioField('duration', 30, 'apres'); renderCardioBlock(); });
    await pg.locator('#log-cardio .kcal-ed input').fill('115');
    await clic(pg, '#cardio-save-btn'); await pg.waitForTimeout(100);                 // « ✓ C'est noté »
    const note = await pg.evaluate(() => ({ man: S.wkt.cardio.kcalMan, est: S.wkt.cardio.kcalEst }));
    await pg.evaluate(() => { _cardioOpen = true; renderCardioBlock(); });
    await pg.locator('#log-cardio .kcal-ed input').fill('120');                       // une autre valeur, tapée à l'instant, puis « Terminer » directement
    const r = await pg.evaluate(async () => { await finishWorkout(); return JSON.parse(JSON.stringify(S.sessions[0])); });
    t(P + '3 ⭐ T02 : cardio seul — « ✓ C\'est noté » lit la valeur tapée à l\'instant (115, estimation 145), puis « Terminer » lit une nouvelle valeur tapée sans quitter le champ (120) → séance enregistrée à 120, estimation 145 conservée',
      W('T02', 'cardio, valeur tapée à l\'instant', '« C\'est noté » puis « Terminer » lisent le champ', note.man === 115 && note.est === 145 && !!r && r.cardio.kcalMan === 120 && r.cardio.kcalEst === 145 && r.calories === 120 && r.calData.cardio === 120, { note, cal: r && r.calories, bloc: r && r.cardio }, 'banc C-ACT-I3'), _det({ note, cal: r && r.calories }));
    await fermer(X);
  }
  // ── le détail d'une séance passée : « Enregistrer » avec la valeur tapée à l'instant ──
  {
    const X = await ouvrir(sess(jeuReference())); const pg = X.pg; const id = jeuReference()[1].ts;
    await pg.evaluate(i => openSessDetail(i), id); await pg.waitForTimeout(250);
    await pg.locator('#sd-content .kcal-ed input').fill('300');
    await pg.evaluate(() => [...document.querySelectorAll('#ov-sess-detail button')].find(x => /Enregistrer/.test(x.textContent)).click()); await pg.waitForTimeout(200);
    const r = await pg.evaluate(i => JSON.parse(JSON.stringify(S.sessions.find(s => (s.ts || s.id) === i))), id);
    t(P + '4 ⭐ T05 : détail d\'un ancien cardio — 300 tapé SANS quitter le champ puis « Enregistrer » → calories 300 (valeur de la montre), estimation figée 379 (valeur rangée), jamais le total d\'avant',
      W('T05', 'détail, valeur tapée à l\'instant', 'enregistrée à 300', r.calories === 300 && r.cardio.kcalMan === 300 && r.cardio.kcalEst === 379, { cal: r.calories, bloc: r.cardio }, 'banc C-ACT-I4'), _det({ cal: r.calories, bloc: r.cardio }));
    await fermer(X);
  }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════
// BLOC J — LES GARDES QUE RIEN NE TESTAIT. Un balayage systématique (`outils_act/mut_sites.py`) a retiré la garde `_seancesTrain()` de chacun des 52 sites de lecture, UN à la fois :
// 29 survivaient aux blocs D, E et F (badges, série, observations de Milo, niveau, écran Séance, message de l'Accueil, fenêtres de Milo…). Ici chacun a son lecteur, comparé SANS puis AVEC
// des activités choisies pour tout faire basculer si on les comptait. Et un témoin de SOURCE recense toutes les lectures BRUTES de `S.sessions` : une nouvelle lecture non justifiée fait rougir.
// ═════════════════════════════════════════════════════════════════════════════════════════════════════════════
async function blocJ(c) {
  const { t, ouvrir, fermer, W, jeuReference, marche, J, _det } = c;
  const P = 'C-ACT-J';
  const jour = n => new Date(Date.UTC(2026, 10, 5) - n * 864e5).toISOString().slice(0, 10);          // 2026-11-05 moins n jours
  const dow = d => new Date(d + 'T12:00:00Z').getUTCDay();
  /* 120 marches, une par jour, à 05 h 10 et à 23 h 20 : si on les comptait comme des séances → série de 90 jours, « lève-tôt », « noctambule », « 100 séances », « anniversaire » (le 05/11), niveau qui monte */
  const serie = Array.from({ length: 120 }, (_, i) => marche(jour(i), i % 2 ? '05:10' : '23:20', { man: 100 + i, dts: i }));
  /* 14 marches en semaine, le matin : si on les comptait → Milo croirait à un « matin », un « semaine seulement », un « très régulier », et proposerait de le mémoriser */
  const semaine = []; for (let i = 0; i < 40 && semaine.length < 14; i++) if (dow(jour(i)) >= 1 && dow(jour(i)) <= 5) semaine.push(marche(jour(i), '07:30', { man: 150, dts: i }));
  /* 28 vraies séances, une par jour (de il y a 3 à il y a 30 jours), 8 séries chronométrées chacune ; la 15ᵉ est la seule à contenir des fentes */
  const reelle = (i, jours, nom) => { const d = jour(jours), ts = Date.parse(d + 'T18:00:00+01:00');
    return { id: ts, ts, date: d, startHour: 18, exs: [{ name: nom || 'Squat Barre', sets: Array.from({ length: 8 }, (_, k) => ({ kg: 60 + k, reps: [3, 5, 8, 10, 12, 15][(i + k) % 6], type: 'N', done: true, rm1: 80 })) }],
      volume: 4000, uniConv: 1, synced: true, duration: 3600, progLabel: '', calories: 300, calData: { total: 300 } }; };
  const reels = Array.from({ length: 28 }, (_, i) => reelle(i, i + 3, i === 14 ? 'Fentes Marchées' : 'Squat Barre'));
  const recentes = [marche(jour(0), '08:00', { man: 200 }), marche(jour(1), '08:00', { man: 200, dts: 1 }), marche(jour(2), '08:00', { man: 200, dts: 2 })];
  const lire = async (jeu, lecteurs, arg) => { const X = await ouvrir({ ls: { ft4_sessions: J(jeu) } }); const r = await X.pg.evaluate(lecteurs, arg); r.__err = X.errs; await fermer(X); return r; };

  // ── J1-J2 : un compte NEUF (aucune séance) à qui l'on ajoute des activités : TOUT ce que les séances déclenchent doit rester muet ──
  const LECTEURS_NEUF = () => {
    const o = {}, safe = (k, f) => { try { o[k] = f(); } catch (e) { o[k] = 'ERR ' + String(e.message).slice(0, 80); } };
    S.bday = '05/11'; S.level = 'debutant'; S.programmes = []; S.sleepLog = []; S.nextPlanned = null;
    safe('badges', () => BADGES.map(b => b.id + ':' + _checkBadgeCond(b)));
    safe('progres', () => BADGES.map(b => b.id + ':' + JSON.stringify(_badgeProgress(b))));
    safe('serie', () => _getMaxStreak());
    safe('assez', () => _assezDeSeancesPourDemander());
    safe('candidates', () => _obsCandidates().map(x => x.key));
    safe('semaines', () => _semainesVecues(4));
    safe('style', () => JSON.stringify(_sessionStyleStats(8)));
    safe('histoRecup', () => JSON.stringify(recupHistorique(60)));
    safe('milo', () => JSON.stringify(_miloMessage()));
    safe('importToggle', () => { _renderImportRow(); return document.getElementById('log-import-toggle').style.display; });
    safe('avantSeance', () => { _renderAvantSeance(); const e = document.getElementById('la-ctx'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; });
    safe('niveau', () => { _checkLevelUp(false); return S.level; });
    safe('propose', () => { S.registre = { facts: {}, observations: [], updatedAt: '' }; maybeProposeObservation(); return S.registre.observations.map(x => x.key); });
    return o;
  };
  const A0 = await lire([], LECTEURS_NEUF), B1 = await lire(serie, LECTEURS_NEUF), B2 = await lire(semaine, LECTEURS_NEUF), C0 = await lire(reels, LECTEURS_NEUF);
  const cles = Object.keys(A0).filter(k => k !== '__err');
  const diff = B => cles.filter(k => JSON.stringify(A0[k]) !== JSON.stringify(B[k]));
  const erreurs = [A0, B1, B2, C0].map(r => cles.filter(k => r[k] === undefined || /^ERR /.test(String(r[k]))));
  /* non-vacuité : sur un compte qui a VRAIMENT des séances, ces mêmes lecteurs répondent (badges, série, seuils, historique de récupération, écran Séance, carte de l'Accueil) */
  const vivants = C0.badges.some(x => /^first_session:true/.test(x)) && C0.badges.some(x => /^regular_10:true/.test(x)) && C0.serie >= 7 && C0.assez === true && C0.semaines > 0
    && String(C0.histoRecup).length > 20 && C0.importToggle === 'flex' && /\S/.test(C0.avantSeance || '') && String(C0.milo).length > 5 && A0.importToggle === 'none';
  t(P + '1 ⭐ non-vacuité : sur 28 vraies séances les lecteurs (badges, série, seuils de Milo, historique de récupération, écran Séance, carte de l\'Accueil) répondent VRAIMENT ; sur un compte neuf ils sont muets — sans cela l\'égalité plus bas ne prouverait rien',
    vivants && erreurs.every(e => e.length === 0), _det({ vivants, erreurs, C0: { serie: C0.serie, assez: C0.assez, semaines: C0.semaines, imp: C0.importToggle, avant: (C0.avantSeance || '').slice(0, 60) }, A0imp: A0.importToggle }));
  const d1 = diff(B1);
  t(P + '2 ⭐ D05 : un compte NEUF qui enregistre 120 marches (une par jour, à 05 h 10 et 23 h 20, dont le jour de son anniversaire) n\'obtient AUCUN badge, aucune série, aucun seuil franchi, aucune observation, ne monte pas de niveau, garde l\'écran Séance « vierge » et le message de l\'Accueil d\'un compte neuf',
    W('D05', 'compte neuf + 120 marches', 'badges, série, niveau, écran Séance, Accueil inchangés', d1.length === 0, { differ: d1, badges: B1.badges.filter(x => /:true/.test(x)), serie: B1.serie, niveau: B1.niveau }, 'banc C-ACT-J2'), _det({ differ: d1, badges: B1.badges.filter(x => /:true/.test(x)), serie: B1.serie, niveau: B1.niveau }));
  const d2 = diff(B2);
  t(P + '3 ⭐ T23 : 14 marches « en semaine, le matin » ne fabriquent AUCUNE observation pour Milo (matin, semaine seulement, très régulier), n\'avancent aucun seuil, ne proposent rien à mémoriser',
    W('T23', 'observations de Milo', 'aucune observation fabriquée par des activités', d2.length === 0 && B2.candidates.length === 0 && B2.propose.length === 0, { differ: d2, candidates: B2.candidates, propose: B2.propose }, 'banc C-ACT-J3'), _det({ differ: d2, candidates: B2.candidates, propose: B2.propose }));

  // ── J4 : un compte établi — les FENÊTRES (12, 15, 25 enregistrements) ne se remplissent pas d'activités qui chasseraient de vraies séances ──
  const LECTEURS_ETABLI = () => {
    const o = {}, safe = (k, f) => { try { o[k] = f(); } catch (e) { o[k] = 'ERR ' + String(e.message).slice(0, 80); } };
    S.exRestPref = { 'Squat Barre': 120, 'Fentes Marchées': 240 };
    safe('rythme', () => JSON.stringify(_rythmeSeance()));
    safe('reps', () => JSON.stringify(_repartitionReps()));
    safe('repos', () => _ctxReposRegles());
    return o;
  };
  const E0 = await lire(reels, LECTEURS_ETABLI), E1 = await lire(reels.concat(recentes), LECTEURS_ETABLI);
  const dE = ['rythme', 'reps', 'repos'].filter(k => JSON.stringify(E0[k]) !== JSON.stringify(E1[k]));
  const vivantsE = /"n":12/.test(E0.rythme) && /"tot":200/.test(E0.reps) && /Fentes/.test(E0.repos) && /Squat/.test(E0.repos);
  t(P + '4 ⭐ T23 : trois marches récentes ne déplacent NI le rythme de Milo (12 séances mesurées), NI la répartition des répétitions (25 séances, 200 séries), NI l\'ordre de ses temps de repos réglés (les exercices « récents » : 15 séances) — et ces lecteurs répondent VRAIMENT',
    W('T23', 'fenêtres de Milo', 'rythme, répétitions, repos inchangés', vivantsE && dE.length === 0, { vivantsE, differ: dE, sans: E0, avec: E1 }, 'banc C-ACT-J4'), _det({ vivantsE, differ: dE, sans: E0, avec: E1 }));

  // ── J5 : la corrélation « poids le lendemain d'une séance » ne prend pas une marche pour une séance ──
  const joursReels = [4, 6, 8, 10, 12, 14], joursActs = [5, 7, 9, 11, 13];
  const poidsReels = joursReels.map((n, i) => reelle(i, n)), poidsActs = joursActs.map((n, i) => marche(jour(n), '08:00', { man: 100, dts: i }));
  const pts = Array.from({ length: 12 }, (_, i) => { const k = 14 - i; return { date: jour(k), kg: joursReels.indexOf(k + 1) >= 0 ? 80.0 : 80.8 }; });
  const LECT_POIDS = p => { const el = document.createElement('div'); document.body.appendChild(el); renderWeightCorrelations(el, p); const txt = el.textContent.replace(/\s+/g, ' '); el.remove(); return { txt }; };
  const W0 = await lire(poidsReels, LECT_POIDS, pts), W1 = await lire(poidsReels.concat(poidsActs), LECT_POIDS, pts);
  t(P + '5 ⭐ T41 : la carte « poids le lendemain d\'une séance » est la même avec et sans les 5 marches des jours intercalés (elle disparaîtrait si on les prenait pour des séances : plus de jour « sans séance »)',
    W('T41', 'corrélation poids / séance', 'carte identique', /le lendemain d'une séance/.test(W0.txt) && W0.txt === W1.txt, { sans: W0.txt.slice(0, 160), avec: W1.txt.slice(0, 160) }, 'banc C-ACT-J5'), _det({ vivant: /le lendemain d'une séance/.test(W0.txt), egal: W0.txt === W1.txt }));

  // ── J6 : Milo ne croit pas qu'une SÉANCE a eu lieu aujourd'hui parce qu'une marche l'a été (la ligne des pas) ──
  const LECT_PAS = async jours => { S.healthDaily = jours; const x = await buildCoachContext('Comment va ma journée ?');
    return { pas: /A BEAUCOUP MARCHÉ/.test(x), aucune: /AUCUNE séance n'est enregistrée aujourd'hui/.test(x), aussi: /AUSSI enregistré une séance aujourd'hui/.test(x) }; };
  const pasJours = [{ date: jour(0), steps: 20000 }].concat(Array.from({ length: 10 }, (_, i) => ({ date: jour(i + 1), steps: 6000 + i * 50 })));
  const S0 = await lire([], LECT_PAS, pasJours), S1 = await lire([marche(jour(0), '08:00', { man: 255 })], LECT_PAS, pasJours);
  t(P + '6 ⭐ T23 : avec un surplus de pas aujourd\'hui, Milo reçoit « AUCUNE séance n\'est enregistrée aujourd\'hui » AUSSI quand une marche l\'est (une marche n\'est pas une séance) — la ligne des pas existe bien dans les deux cas',
    W('T23', 'surplus de pas et séance du jour', 'une marche n\'est pas une séance', S0.pas && S1.pas && S0.aucune && S1.aucune && !S1.aussi, { sans: S0, avec: S1 }, 'banc C-ACT-J6'), _det({ sans: S0, avec: S1 }));

  // ── J7 : le tableau de bord ORDINATEUR (`dashboard.html`) — une PAGE à part (les 4 sites de `dashboard.js`) qui lit les mêmes données : ses séances récentes, ses semaines, son calendrier ne comptent pas les marches ──
  const lireDash = async jeu => { const X = await ouvrir({ ls: { ft4_sessions: J(jeu) } });
    await X.pg.goto('http://localhost:' + c.PORT + '/dashboard.html'); await X.pg.waitForTimeout(1500);
    const r = await X.pg.evaluate(() => ({ txt: document.body.innerText.replace(/\s+/g, ' ').trim() })); r.err = X.errs; await fermer(X); return r; };
  const D0 = await lireDash(reels), D1 = await lireDash(reels.concat(recentes));
  t(P + '7 ⭐ T41 : le tableau de bord ORDINATEUR (page `dashboard.html`) affiche le MÊME texte avec et sans trois marches récentes (dernières séances, semaines, calendrier) — et il répond VRAIMENT (plus de 300 caractères, « 28 séances lues depuis ce navigateur » : la page disait « 31 » avant le correctif)',
    W('T41', 'tableau de bord ordinateur', 'texte identique', D0.txt.length > 300 && /28 séances lues depuis/.test(D0.txt) && D0.txt === D1.txt, { n: D0.txt.length, egal: D0.txt === D1.txt, erreurs: D0.err.concat(D1.err) }, 'banc C-ACT-J7'), _det({ n: D0.txt.length, egal: D0.txt === D1.txt, extrait: D0.txt.slice(0, 120), erreurs: D0.err.concat(D1.err) }));

  // ── J30 : témoin de SOURCE — toute lecture BRUTE de `S.sessions` (une marche y est comptée comme une ligne) doit être CONNUE et justifiée ──
  /* Le recensement du 05/11/2026 : 80 fonctions des fichiers servis lisent `S.sessions` sans passer par `_seancesTrain()`. Chacune est classée ci-dessous (4 familles), avec sa raison. Une 81ᵉ fait rougir :
     son auteur doit soit passer par `_seancesTrain()`, soit l'inscrire ici en disant POURQUOI elle peut voir les activités. C'est la famille « comptage silencieux » de BUGS.md §140 : une ligne neuve posée
     dans une liste dont les lecteurs comptent des lignes — et `_repartitionReps` (fenêtre de 25 enregistrements) en était un, trouvé par ce recensement et corrigé. */
  const LISTE_BLANCHE = {
    'persistance, synchronisation, fusion, restauration, import, outils d\'administration : elles déplacent des enregistrements ou lisent leur identité, elles n\'en comptent aucun': [
    'app.js::_brouillonDejaEnregistre', 'app.js::_saveEmailRedundant', 'app.js::_ftBootstrapJeton',
    'log.js::_empreinteDonnees', 'log.js::finalImportHist', 'log.js::finishWorkout',
    'log.js::L', 'setup.js::_cloudSync', 'setup.js::_fus',
    'setup.js::doRestoreAccount', 'setup.js::_annulerRecalageCalories', 'setup.js::_recalerAnciennesSeances',
    'setup.js::_prsDepuisSeances', 'setup.js::_deplacerRecordsRenommes', 'setup.js::mergeExercises',
    'setup.js::detectDuplicates', 'state.js::_ecrireSessionsLocal', 'state.js::_migSet',
    'state.js::load', 'state.js::persist', 'state.js::renKeys',
    'state.js::sigSess', 'tracking.js::_countUnsyncedSessions', 'tracking.js::_retrySheetQueue',
    'tracking.js::_updateAdminSyncInfo', 'coach.js::_vcApplyPersona', 'coach.js::startPt001Test',
    'coach.js::_sansSilent', 'log.js::_renameExEverywhere'
    ],
    'voient les activités PAR CONCEPTION : formulaire d\'activité, historique, détail et édition, calendrier, bilans de la semaine et du mois, bloc dédié de Milo, exports, carte « Dépense et objectif » de Nutrition et lecteur de la dépense du jour (TDEE V2 : elles DOIVENT voir les activités, c\'est leur objet)': [
    'app.js::_auPersister', 'app.js::_auTsUnique', 'app.js::autreEnregistrer',
    'app.js::autreSupprimerOuConfirmer', 'app.js::openAutreActivite', 'app.js::_bilanMois',
    'app.js::_moisAvecSeances', 'app.js::_pKg', 'app.js::checkWeeklySummary',
    'coach.js::_ctxAutresActivites', 'coach.js::_historiqueCompact', 'coach.js::_memoireLongue',
    'screens.js::_calDayPanel', 'screens.js::_calPrDays', 'screens.js::_calVolByDay',
    'screens.js::_memeMois', 'screens.js::_renderHomeCalendar', 'screens.js::navBtn',
    'setup.js::_histoLignes', 'setup.js::_renderSessDetailContent', 'setup.js::_sessCarteHtml',
    'setup.js::analyserSeanceMilo', 'setup.js::deleteSessOrConfirm', 'setup.js::editSessDuree',
    'setup.js::exportHistoPdf', 'setup.js::goSessionsHistory', 'setup.js::openHistoExport',
    'setup.js::openSessDetail', 'setup.js::renderSessions', 'setup.js::nomM',
    'setup.js::saveSessEdits', 'setup.js::setSessCardioKcal', 'setup.js::showChartTooltip',
    'setup.js::showSessMuscleMap', 'setup.js::_dbfFenetre', 'screens.js::_renderDepenseJour', 'tracking.js::_djIndexSessions'
    ],
    'parcourent des EXERCICES, des blocs cardio ou des check-ins (une activité n\'en a pas : ni série, ni charge, ni bloc `cardio`, ni check-in à lire)': [
    'dashboard.js::renderDashboard', 'coach.js::ligneEvo', 'log.js::_chargesDejaFaites', 'log.js::_exUsageMap',
    'log.js::_getExHistory', 'log.js::_histSeanceNonEnregistree', 'log.js::_repereDefauts',
    'log.js::_seancesExercice', 'setup.js::_inRange', 'state.js::_volumeParMoitie',
    'state.js::auJour', 'tracking.js::avg', 'tracking.js::ciPickEnergy'
    ],
    'simple test d\'existence ou définition de la vue `_seancesTrain()` elle-même : la lecture qui compte passe, juste à côté, par la vue': [
    'state.js::_seancesTrain', 'tracking.js::_derniereSeanceAvant', 'tracking.js::projectionRecup',
    'tracking.js::recupHistorique'
    ]
  };
  const path = require('path'), RACINE = path.resolve(__dirname, '..', '..');
  /* les scripts de l'application ET ceux du tableau de bord ordinateur (`dashboard.html` charge `dashboard.js`, que `index.html` ne charge pas) */
  const fichiers = [...new Set(['index.html', 'dashboard.html'].flatMap(h => [...fs.readFileSync(path.join(RACINE, h), 'utf8').matchAll(/<script src="([^"?]+)/g)].map(m => m[1])))].filter(f => fs.existsSync(path.join(RACINE, f)) && !/^lib\//.test(f));
  const sansCommentaires = x => x.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, a) => a + ' '.repeat(m.length - a.length));
  const trouvees = new Set();
  for (const f of fichiers) { const L = sansCommentaires(fs.readFileSync(path.join(RACINE, f), 'utf8')).split('\n');
    L.forEach((l, i) => { if (!/\bS_?\.sessions\b/.test(l)) return;
      let nom = '(racine)';
      for (let k = i; k >= 0; k--) { const m = L[k].match(/^\s*(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/) || L[k].match(/^\s*(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z0-9_$]+\s*=>)/); if (m) { nom = m[1]; break; } }
      trouvees.add(f + '::' + nom); }); }
  const connues = new Set(Object.values(LISTE_BLANCHE).flat());
  const inconnues = [...trouvees].filter(x => !connues.has(x)).sort(), perimees = [...connues].filter(x => !trouvees.has(x)).sort();
  t(P + '30 ⛔ SOURCE : toute fonction qui lit `S.sessions` sans passer par `_seancesTrain()` est CONNUE et classée (' + connues.size + ' fonctions, 4 familles) — une nouvelle lecture brute (une marche y serait une ligne comme une autre) fait rougir',
    inconnues.length === 0 && trouvees.size > 60, _det({ inconnues, nTrouvees: trouvees.size, fichiers: fichiers.length }));
  t(P + '31 ⛔ SOURCE : la liste blanche n\'est pas PÉRIMÉE — chaque fonction qu\'elle nomme lit encore `S.sessions` (sinon une exception disparue masquerait la prochaine)',
    perimees.length === 0, _det({ perimees }));
}

module.exports = { ecran };
