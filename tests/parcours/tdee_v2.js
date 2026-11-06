/* ═══════════════════════════════════════════════════════════════════════════════
   🔥 TDEE V2 — ÉTAPE 1 : « DÉPENSE DU JOUR » (moteur pur + adaptateurs + affichage Nutrition) — blocs C-TDEE-* — session-C (Claude N°2, Séance), GO de Michel du 06/11/2026, développement isolé.
   Base : l'audit `FORCE-TRACKER-AUDIT-TDEE-V2-2026-11-06.pdf` (formule actuelle, 11 constats, sept règles anti-doublon, scénarios chiffrés, matrice de tests).
   Ce que les témoins CONDUISENT : (P) le VRAI moteur, extrait de `tracking.js` entre les repères ⟦DJ:DEBUT⟧ / ⟦DJ:FIN⟧ et rejoué HORS navigateur — le code testé est le code livré, pas un prototype ;
   (S·H·A·D·N·E·U·K) la vraie app servie en local (réseau coupé, données fictives, horloge fixe) : la façade `depenseEstimeeDuJour`, le vrai `kcalBloc`, les vrais enregistrements de `S.sessions`
   et de `S.healthDaily`, le vrai écran Nutrition et sa carte « Dépense et objectif », et de VRAIS clics dans le formulaire « Autre activité ».
   Ce qu'ils OBSERVENT : les nombres (estimé, fourchette, provenance, absences), les textes à l'écran, la cible (`calcTDEE`, `calcMacros`, `cibleDecomposition`, `_pasEcart` — qui doivent rester À L'OCTET
   ceux de la version publiée), les écritures de stockage, le réseau, les appels de persistance et de synchronisation.
   Ce qu'ils NE COUVRENT PAS : l'iPhone réel, le réseau réel, Apple Santé réel (aucune lecture : seulement `S.healthDaily` déjà présent ; le raccourci de Michel ne poste aujourd'hui que la FC au repos),
   de vraies données de Michel (aucun export de pas, d'entraînements ou de calories de montre n'est accessible : les paramètres restent des HYPOTHÈSES, dites comme telles), le moteur MET (gelé).
   ⛔ Chaque témoin s'éprouve sur code SAIN puis CASSÉ par mutation volontaire : `python3 tools/mut_tdee_v2.py` (R17 : un test protège un invariant, pas une implémentation).
   Si TDEE_MATRICE est posée, le module y écrit le JSON de la matrice (ID · intitulé · statut · témoins). TDEE_BLOCS (ex. « P,S ») : ne jouer que certains blocs — mise au point seulement.
   ═══════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const AUJ = '2026-11-06', T0 = Date.parse(AUJ + 'T18:00:00+01:00');
const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '130', ft4_sessions: '[]', ft4_prs: '{}', ft4_act: '1.55', ft4_act_src: 'choisi', ft4_work: 'bureau', ft4_nphase: 'maintien' };
const J = o => JSON.stringify(o);
const _det = o => { const s = typeof o === 'string' ? o : J(o); return s.length > 380 ? s.slice(0, 380) + '…' : s; };
const jourISO = n => new Date(Date.UTC(2026, 10, 6) - n * 864e5).toISOString().slice(0, 10);
const base30 = (v) => Array.from({ length: 30 }, (_, i) => ({ date: jourISO(i + 1), steps: v == null ? 6200 : v }));
const Th = hh => Date.parse(`${AUJ}T${String(hh).padStart(2, '0')}:00:00+01:00`);

/* ── les scénarios de l'audit, mot pour mot ── */
const SC = {
  S1: 'Journée de repos', S2: 'Musculation 1 h', S3: '2 h de marche', S4: 'Randonnée 8 h', S5: '40 000 pas', S6: 'Course 4 h', S7: 'Activités combinées (muscu 1 h + marche 2 h + course 1 h)',
  AD: 'Anti-doublons : pas, marche, randonnée, course, cardio, musculation, montre, saisie + import', HI: 'Historique : un jour ne reçoit que ses données, un jour passé se rejoue seul',
  AB: 'Absence de données : valeurs absentes signalées, jamais inventées', NR: 'Étape 2 · l\'objectif, le TDEE et les macros ne dépendent plus des pas ni des activités ; la référence EST le TDEE',
  ES: 'Aucun effet de bord : ni écriture, ni réseau, ni synchronisation', AF: 'Affichage Nutrition : trois valeurs distinctes + dépenses enregistrées, sans inciter à manger plus',
  CA: 'Calibrage : sensibilité des hypothèses, couloir de la montre, fourchettes contre la référence', AR: 'Architecture : moteur pur, objectif jamais lié au moteur',
  PD: 'Étape 2 · dates passées : les pas d\'aujourd\'hui ne touchent ni la cible ni le « reste » d\'hier (TD-C03, TD-C04)',
  TX: 'Étape 2 · textes cohérents : aucune phrase ne dit que les pas s\'ajoutent à l\'objectif (Nutrition, Accueil, Progrès, Milo)',
  AL: 'Étape 2 · information prudente : un effort exceptionnel est NOMMÉ, jamais compensé dans l\'objectif',
};
const MX = {};
/* À quels scénarios / familles de la matrice appartient un témoin (par son identifiant) : P01-P07 → S1-S7, S101-S111 → S1-S7, le reste par bloc. */
function groupes(id) {
  if (/^P0[1-7]/.test(id)) return ['S' + id[2]];
  if (id === 'P33') return ['AL'];
  if (id === 'P35') return ['AB'];
  if (/^H1[4-9]$/.test(id)) return ['PD'];
  if (/^N1[1-6]$/.test(id)) return ['TX'];
  if (/^U2[0-3]$/.test(id)) return ['AL'];
  if (/^P(1\d|2\d)/.test(id)) return ['AD'];
  if (/^P3/.test(id)) return ['AR'];
  if (/^K/.test(id)) return ['CA'];
  if (/^S10[12]$/.test(id)) return ['S' + id[3]];
  if (/^S10[345]$/.test(id) || id === 'S115') return ['S3'];
  if (/^S10[67]$/.test(id)) return ['S4'];
  if (/^S10[89]$/.test(id)) return ['S5'];
  if (id === 'S110') return ['S6'];
  if (id === 'S111') return ['S7'];
  if (/^S11[2-8]$/.test(id) || /^D/.test(id)) return ['AD'];
  if (/^H/.test(id)) return ['HI'];
  if (/^A/.test(id)) return ['AB'];
  if (/^N0[56]$/.test(id)) return ['NR', 'AR'];
  if (/^N/.test(id)) return ['NR'];
  if (/^E/.test(id)) return ['ES'];
  if (/^U/.test(id)) return ['AF'];
  return [];
}
function reg(id, nom, ok) { groupes(id).forEach(g => { const e = MX[g] = MX[g] || { id: g, scenario: SC[g] || '', ok: true, nt: 0, noms: [] }; e.ok = e.ok && !!ok; e.nt++; if (e.noms.length < 60) e.noms.push(id + ' ' + nom.slice(0, 80)); }); return !!ok; }

/* ── le moteur, extrait de la SOURCE et rejoué hors navigateur ── */
function extraire(src) {
  const a = src.indexOf('// ⟦DJ:DEBUT⟧'), b = src.indexOf('// ⟦DJ:FIN⟧');
  if (a < 0 || b < a) throw new Error('repères ⟦DJ:DEBUT⟧ / ⟦DJ:FIN⟧ absents de tracking.js');
  const bloc = src.slice(a, b);
  const M = new Function(bloc + '\nreturn { DJ_PARAMS, DJ_LABELS, djMediane, djDedoublonner, djNetEntrainement, djCadence, djPasEntrainement, djEcartObjectif, depenseDuJour };')();
  return { M, bloc };
}
const sansCom = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');
const corps = (n, src) => { const m = new RegExp('(?:async\\s+)?function\\s+' + n + '\\s*\\([^)]*\\)\\s*\\{').exec(src); if (!m) return ''; let i = m.index + m[0].length - 1, d = 0, j = i;
  for (; j < src.length; j++) { const c = src[j]; if (c === '{') d++; else if (c === '}') { d--; if (!d) return src.slice(i, j + 1); } } return ''; };
const rng = seed => { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
const MET_MOD = { marche: 3.8, marche_sportive: 5.5, randonnee: 6.0, balade: 3.0, velo_loisir: 4.0, velo_sportif: 8.0, course: 8.5, autre: 5.5 };
const brut = (fam, min, kg) => fam === 'muscu' ? 330 : Math.round((MET_MOD[fam] || 5.5) * (kg || 82) * min / 60);
const W = (famille, dureeMin, hh, extra) => Object.assign({ famille, dureeMin, debut: Th(hh), origine: 'saisie', kcalEstBrute: brut(famille, dureeMin) }, extra || {});
const PR = { kg: 82, bmr: 1733, tdeeRef: 2686, sportExtra: 0 };
const H30 = { pasHors: Array(30).fill(6200), entrainementsNet: [], energieActive: Array(30).fill(600) };

async function ecran(t, b, PORT) {
  const T = (id, nom, cond, det) => { reg(id, nom, cond); t('C-TDEE-' + id + (nom ? ' ' + nom : ''), !!cond, det === undefined ? '' : _det(det)); return !!cond; };
  const srcTrk = fs.readFileSync(path.join(ROOT, 'tracking.js'), 'utf8'), srcSta = fs.readFileSync(path.join(ROOT, 'state.js'), 'utf8'), srcScr = fs.readFileSync(path.join(ROOT, 'screens.js'), 'utf8');
  const { M, bloc } = extraire(srcTrk);
  const sel = process.env.TDEE_BLOCS ? process.env.TDEE_BLOCS.split(',') : ['P', 'K', 'S', 'D', 'H', 'A', 'N', 'E', 'U'];

  const ouvrir = async (opts) => {
    opts = opts || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: opts.w || 390, height: opts.h || 844 }, timezoneId: opts.tz || 'Europe/Paris', locale: 'fr-FR', hasTouch: true });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    const nowD = new Date(opts.now || T0), ymd = nowD.toLocaleDateString('sv-SE', { timeZone: opts.tz || 'Europe/Paris' });
    const pm = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 2, 15)), lms = pm.getUTCFullYear() + '-' + String(pm.getUTCMonth() + 1).padStart(2, '0');
    const ls = Object.assign({}, BASE, { ft4_lms: lms, ft4_lws: ymd }, opts.ls || {});
    if (opts.sessions) ls.ft4_sessions = J(opts.sessions);
    if (opts.hd) ls.ft4_healthd = J(opts.hd);
    await cx.addInitScript(`(()=>{try{ if(localStorage.getItem('_tdee_seed'))return; localStorage.clear();
      const D=${J(ls)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); localStorage.setItem('_tdee_seed','1'); }catch(e){} })();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 200)));
    await pg.clock.setFixedTime(new Date(opts.now || T0));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(opts.wait || 1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; window.__T = []; });
    return { cx, pg, errs };
  };
  const fermer = async X => { try { await X.cx.close(); } catch (e) {} };
  const fac = (X, date) => X.pg.evaluate(d => { const r = depenseEstimeeDuJour(d); return r ? JSON.parse(JSON.stringify(r)) : null; }, date || undefined);
  /* les enregistrements, TELS QUE L'APP LES ÉCRIT (mêmes champs que le formulaire « Autre activité » et que le cardio autonome) */
  const act = (type, min, kcalEst, hh, o) => { o = o || {}; const dj = o.date || AUJ, ts = Date.parse(`${dj}T${hh}:00+01:00`) + (o.dts || 0), ret = o.man != null ? o.man : kcalEst;
    const a = { type, duration: min, heure: hh, kcalEst, kcalPoids: 82, kcalMode: 'met1' }; if (o.man != null) a.kcalMan = o.man; if (o.int) a.intensity = o.int;
    return { id: ts, ts, date: dj, startHour: +hh.slice(0, 2), exs: [], exercises: [], volume: 0, uniConv: 1, synced: true, duration: min * 60, progLabel: '', calories: ret, calData: { total: ret, autre: ret }, autre: a }; };
  const muscu = (min, kcal, hh, dj) => { const d = dj || AUJ, ts = Date.parse(`${d}T${hh}:00+01:00`); return { id: ts, ts, date: d, startHour: +hh.slice(0, 2), exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, type: 'N', done: true, rm1: 117 }] }], volume: 500, uniConv: 1, synced: true, duration: min * 60, progLabel: '', calories: kcal, calData: { total: kcal } }; };
  const cardioSeul = (type, int, min, kcalEst, hh, o) => { o = o || {}; const dj = o.date || AUJ, ts = Date.parse(`${dj}T${hh}:00+01:00`), ret = o.man != null ? o.man : kcalEst;
    const c = { type, intensity: int, duration: min, kcalEst, kcalPoids: 82, kcalMode: 'met1' }; if (o.man != null) c.kcalMan = o.man;
    return { id: ts, ts, date: dj, startHour: +hh.slice(0, 2), exs: [], volume: 0, uniConv: 1, synced: true, duration: min * 60, progLabel: '', cardio: c, calories: ret, calData: { total: ret, cardio: ret } }; };
  const jeuReference = () => { const mk = (jour, hh, kcal) => ({ id: Date.parse(`2026-11-${jour}T${hh}:00:00+01:00`), ts: Date.parse(`2026-11-${jour}T${hh}:00:00+01:00`), date: `2026-11-${jour}`, startHour: +hh,
      exs: [{ name: 'Développé Couché Barre', sets: [{ kg: 100, reps: 5, type: 'N', done: true, rm1: 117 }] }], volume: 500, uniConv: 1, synced: false, duration: 3600, progLabel: '', calories: kcal, calData: { total: kcal } });
    const CARD = { id: Date.parse('2026-11-04T19:30:00+01:00'), ts: Date.parse('2026-11-04T19:30:00+01:00'), date: '2026-11-04', startHour: 19, exs: [], volume: 0, uniConv: 1, synced: false, duration: 45 * 60, progLabel: '', cardio: { type: 'tapis', intensity: 'modere', duration: 45 }, calories: 379, calData: { total: 379, cardio: 379 } };
    return [mk('05', '17', 303), CARD, mk('04', '18', 365), mk('02', '18', 410)]; };
  const ctx = { t, T, b, PORT, ouvrir, fermer, fac, act, muscu, cardioSeul, jeuReference, M, bloc, srcTrk, srcSta, srcScr, J, _det, jourISO, base30, Th };

  const BL = { P: () => blocP(ctx), K: () => blocK(ctx), S: () => blocS(ctx), D: () => blocD(ctx), H: () => blocH(ctx), A: () => blocA(ctx), N: () => blocN(ctx), E: () => blocE(ctx), U: () => blocU(ctx) };
  /* ⛔ Un bloc qui LÈVE une exception ne doit pas faire planter tout le banc : sous mutation, le premier témoin rouge est souvent suivi d'un geste impossible. L'arrêt du bloc est lui-même un rouge. */
  for (const k of ['P', 'K', 'S', 'D', 'H', 'A', 'N', 'E', 'U']) if (sel.indexOf(k) >= 0) {
    try { await BL[k](); } catch (e) { t('C-TDEE-' + k + 'X ⛔ le bloc ' + k + ' s\'est ARRÊTÉ avant la fin (exception) — les témoins suivants de ce bloc n\'ont PAS été joués', false, String(e && e.message || e).split('\n')[0].slice(0, 200)); }
  }
  /* P le moteur pur : scénarios, 16 propriétés, pureté · K calibrage : sensibilité, couloir de la montre, fourchettes · S les scénarios de l'audit par la VRAIE façade · D anti-doublons dans la vraie app ·
     H historique · A absence de données · N non-régression de l'objectif · E effets de bord · U affichage. */
  const matrice = Object.keys(SC).map(id => { const e = MX[id]; return e ? { id, scenario: SC[id], statut: e.ok ? 'PASS' : 'FAIL', nTemoins: e.nt, temoins: e.noms } : { id, scenario: SC[id], statut: 'NOT RUN', nTemoins: 0, temoins: [] }; });
  if (process.env.TDEE_MATRICE) { try { fs.writeFileSync(process.env.TDEE_MATRICE, J(matrice)); } catch (e) {} }
  if (!process.env.TDEE_BLOCS) t('C-TDEE-Z1 la matrice ne contient aucun FAIL ni NOT RUN (' + matrice.filter(m => m.statut === 'PASS').length + ' PASS · ' + matrice.filter(m => m.statut === 'FAIL').length + ' FAIL · ' + matrice.filter(m => m.statut === 'NOT RUN').length + ' NOT RUN)',
    matrice.every(m => m.statut === 'PASS'), matrice.filter(m => m.statut !== 'PASS').map(m => m.id).join(' '));
}

// ═════════════════════════════════════════════════════════════════════════════════
// BLOC P — le moteur PUR, extrait de la source : les sept scénarios, les propriétés, la pureté
// ═════════════════════════════════════════════════════════════════════════════════
async function blocP(c) {
  const { T, M, bloc, srcTrk } = c;
  const ex = (j, pr, h) => { const o = M.depenseDuJour(pr || PR, j, h || H30); return o ? o.extra : null; };
  const run = (pas, ws, pr, h) => M.depenseDuJour(pr || PR, { pas, entrainements: ws }, h || H30);
  // ── les scénarios de l'audit : les MÊMES chiffres que le prototype, maintenant sur le code livré ──
  const S3 = [W('marche', 120, 9)], S4 = [W('randonnee', 480, 8)], S6 = [W('course', 240, 8)], S7 = [W('muscu', 60, 7), W('marche', 120, 10), W('course', 60, 17)];
  const att = (id, nom, r, extra, lo, hi, src) => T(id, nom, r && r.extra === extra && (lo == null || (r.bandeExtra.lo === lo && r.bandeExtra.hi === hi)) && (!src || r.sources.join() === src), r && { extra: r.extra, bande: r.bandeExtra, sources: r.sources, connu: r.connu });
  att('P01', '⭐ S1 repos : 5 000 pas (sous l\'habitude) → rien en plus, estimé = référence, donnée connue', run(5000, []), 0, 0, 0);
  T('P01b', 'S1 : l\'estimé du jour vaut la référence (2 686)', run(5000, []).estime === 2686 && run(5000, []).connu === true);
  att('P02', '⭐ S2 musculation 1 h : la séance est DÉJÀ dans le niveau d\'activité → +0, dite « dans ton niveau »', run(6500, [W('muscu', 60, 18)]), 0, 0, 0);
  T('P02b', 'S2 : la ligne de provenance de la musculation dit « dans_ton_niveau » et vaut 0', (r => r.lignes.length === 1 && r.lignes[0].source === 'dans_ton_niveau' && r.lignes[0].kcal === 0)(run(6500, [W('muscu', 60, 18)])));
  att('P03', '⭐ S3 2 h de marche, pas + saisie : +459 (actif de l\'estimation 623 − repos 164), fourchette 344–574', run(18200, S3), 459, 344, 574, 'estimation');
  att('P03b', 'S3 pas seuls : +331 (surplus de 12 000 pas, rampe continue)', run(18200, []), 331, 232, 431, 'pas');
  att('P03c', 'S3 saisie seule (sans Apple Santé) : +459', run(null, S3), 459, 344, 574, 'estimation');
  att('P03d', 'S3 avec une valeur de montre (340) : elle est PRÉFÉRÉE à l\'estimation, jamais additionnée → +340 ± 20 %', run(18200, [W('marche', 120, 9, { kcalMontreActive: 340 })]), 340, 272, 408, 'montre');
  att('P04', '⭐ S4 randonnée 8 h, pas + saisie : +3 280 (actif 3 936 − 656), fourchette 1 968–4 592 (± 40 %)', run(36600, S4), 3280, 1968, 4592, 'estimation');
  att('P04b', 'S4 pas seuls : +911 (un total de pas ne dit pas ce qui a été fait)', run(36600, []), 911, null, null, 'pas');
  att('P04c', 'S4 saisie seule : +3 280', run(null, S4), 3280, 1968, 4592, 'estimation');
  att('P04d', 'S4 avec la valeur de la montre (2 700) → +2 700', run(36600, [W('randonnee', 480, 8, { kcalMontreActive: 2700 })]), 2700, 2160, 3240, 'montre');
  att('P05', '⭐ S5 40 000 pas, rien d\'enregistré : +1 019 (sans le plafond de 500 du moteur actuel), fourchette 713–1 324', run(40000, []), 1019, 713, 1324, 'pas');
  T('P05b', 'S5 sans Apple Santé : RIEN n\'est su → connu:false, +0, absence DITE (jamais « +0 » présenté comme un fait)', (r => r.connu === false && r.extra === 0 && r.manques.indexOf('pas_du_jour') >= 0)(run(null, [])));
  att('P06', '⭐ S6 course 4 h, pas + saisie : +2 460 (actif 2 788 − 328), fourchette 1 845–3 075', run(44600, S6), 2460, 1845, 3075, 'estimation');
  att('P06b', 'S6 pas seuls : +1 164 — la course est payée comme une marche faute d\'enregistrement (limite DITE)', run(44600, []), 1164, null, null, 'pas');
  att('P06c', 'S6 avec la valeur de la montre (2 300) → +2 300', run(44600, [W('course', 240, 8, { kcalMontreActive: 2300 })]), 2300, 1840, 2760, 'montre');
  att('P07', '⭐ S7 combiné (muscu 1 h + marche 2 h + course 1 h) : +1 074 (459 + 615), la muscu n\'ajoute rien', run(26900, S7), 1074, 806, 1343, 'estimation');
  att('P07b', 'S7 : les pas des deux entraînements (12 000 + 9 900) sont retirés, il ne reste que 5 000 pas ordinaires → aucun doublon de pas', (r => r.sources.indexOf('pas') < 0 ? run(26900, S7) : null)(run(26900, S7)), 1074, 806, 1343);
  att('P07c', 'S7 pas seuls : +606', run(26900, []), 606, null, null, 'pas');
  att('P07d', 'S7 avec les montres (380 + 560) : +940', run(26900, [W('muscu', 60, 7), W('marche', 120, 10, { kcalMontreActive: 380 }), W('course', 60, 17, { kcalMontreActive: 560 })]), 940, null, null, 'montre');

  // ── les propriétés ──
  const FAM = ['marche', 'marche_sportive', 'randonnee', 'balade', 'course', 'velo_loisir', 'velo_sportif', 'muscu'], DUR = [20, 30, 45, 60, 90, 120, 180, 240, 480];
  const genW = (r, fam, sansMontre) => { const f = fam || FAM[Math.floor(r() * FAM.length)], d = DUR[Math.floor(r() * DUR.length)];
    const w = { famille: f, dureeMin: d, debut: Th(6) + Math.floor(r() * 12) * 3600e3, origine: 'saisie', kcalEstBrute: brut(f, d) }; if (!sansMontre && r() < 0.3) w.kcalMontreActive = Math.round(r() * 3000); return w; };
  const genJour = (r, sansMontre) => ({ pas: r() < 0.2 ? null : Math.floor(r() * 60000), entrainements: Array.from({ length: Math.floor(r() * 4) }, () => genW(r, null, sansMontre)) });
  const prop = (id, nom, f) => { const d = f(); T(id, nom, d === null, d); };
  prop('P10', 'P1a monotone : plus de pas ne baisse jamais l\'estimation', () => { const r = rng(11); for (let i = 0; i < 300; i++) { const j = genJour(r); if (j.pas == null) continue; const e0 = ex(j), e1 = ex(Object.assign({}, j, { pas: j.pas + Math.floor(r() * 9000) })); if (e1 < e0 - 1) return 'cas ' + i + ' : ' + e0 + ' → ' + e1; } return null; });
  prop('P11', 'P1b monotone : un entraînement estimé de plus ne baisse jamais l\'estimation', () => { const r = rng(12); for (let i = 0; i < 300; i++) { const j = genJour(r, true), e0 = ex(j), w = genW(r, ['marche', 'randonnee', 'course', 'balade'][Math.floor(r() * 4)], true); w.debut = Th(23); const e1 = ex(Object.assign({}, j, { entrainements: j.entrainements.concat([w]) })); if (e1 < e0 - 1) return 'cas ' + i + ' : ' + e0 + ' → ' + e1; } return null; });
  prop('P12', '⭐ P2 AUCUN DOUBLON pas/entraînement : estimation(jour) = entraînements seuls + pas ordinaires seuls', () => { const r = rng(13); for (let i = 0; i < 300; i++) { const ws = M.djDedoublonner(Array.from({ length: 1 + Math.floor(r() * 3) }, () => genW(r, ['marche', 'randonnee', 'course', 'balade', 'marche_sportive'][Math.floor(r() * 5)]))); const ord = Math.floor(r() * 14000), tot = ord + ws.reduce((a, w) => a + M.djPasEntrainement(w), 0);
    const o = M.depenseDuJour(PR, { pas: tot, entrainements: ws }, H30); if (o.avert.some(x => /plafond/.test(x))) continue; const a = o.extra, b2 = ex({ pas: null, entrainements: ws }) + ex({ pas: ord, entrainements: [] }); if (Math.abs(a - b2) > 1) return 'cas ' + i + ' : jour ' + a + ' ≠ entraînements seuls + pas ordinaires seuls ' + b2; } return null; });
  prop('P13', '⭐ P3 le même entraînement saisi ET importé ne compte qu\'une fois', () => { const r = rng(14); for (let i = 0; i < 300; i++) { const j = genJour(r), ws = j.entrainements; if (!ws.length) continue; const d = Object.assign({}, ws[0], { debut: ws[0].debut + 5 * 60000, origine: 'montre' }); const a = ex(j), b2 = ex(Object.assign({}, j, { entrainements: ws.concat([d]) })); if (Math.abs(a - b2) > 1) return 'cas ' + i + ' : ' + a + ' → ' + b2; } return null; });
  prop('P14', 'P4a jamais négative (un jour calme ne baisse rien)', () => { const r = rng(15); for (let i = 0; i < 300; i++) { const j = genJour(r); j.pas = Math.floor(r() * 5000); const e = ex(j); if (e < 0) return 'cas ' + i + ' : ' + e; } return null; });
  prop('P15', 'P4b plafond de plausibilité : jamais plus de 2 × le métabolisme de base', () => { const j = { pas: 99000, entrainements: [W('course', 480, 6, { kcalMontreActive: 20000 }), W('randonnee', 480, 15, { kcalMontreActive: 20000 })] }; const e = ex(j); return e > 2 * 1733 + 1 ? 'extra = ' + e : null; });
  prop('P16', 'P4c pas de profil, pas de chiffre (D-016) : sortie nulle', () => (M.depenseDuJour(null, { pas: 20000 }, H30) === null && M.depenseDuJour({ kg: 80, bmr: 1700, tdeeRef: null }, { pas: 20000 }, H30) === null && M.depenseDuJour({ kg: 0, bmr: 1700, tdeeRef: 2500 }, { pas: 1 }, H30) === null) ? null : 'un chiffre sans profil');
  prop('P17', '⭐ P6 actif ≤ brut − repos (jamais de brut ajouté au TDEE de référence)', () => { const r = rng(17); for (let i = 0; i < 300; i++) { const w = genW(r, null, true); if (w.famille === 'muscu') continue; const n = M.djNetEntrainement(w, 82); if (n.net > n.brut - 82 * w.dureeMin / 60 + 1e-6) return 'cas ' + i + ' : actif ' + n.net + ' > brut − repos'; } return null; });
  prop('P18', 'P7 indépendant de l\'ordre des entraînements', () => { const r = rng(18); for (let i = 0; i < 200; i++) { const j = genJour(r), a = ex(j), b2 = ex(Object.assign({}, j, { entrainements: j.entrainements.slice().reverse() })); if (Math.abs(a - b2) > 1) return 'cas ' + i; } return null; });
  prop('P19', 'P8 continue au seuil de pas : pas de falaise (le moteur actuel saute de 0 à 47 kcal)', () => { const a = ex({ pas: 6200 + 1500, entrainements: [] }), b2 = ex({ pas: 6200 + 1501, entrainements: [] }); return (a === 0 && b2 <= 1) ? null : 'au seuil ' + a + ', un pas de plus ' + b2; });
  prop('P20', '⭐ P9 la musculation n\'ajoute rien (elle est dans le niveau d\'activité)', () => { const r = rng(19); for (let i = 0; i < 200; i++) { const j = genJour(r), a = ex(j), b2 = ex(Object.assign({}, j, { entrainements: j.entrainements.concat([W('muscu', 75, 21)]) })); if (Math.abs(a - b2) > 1) return 'cas ' + i + ' : ' + a + ' → ' + b2; } return null; });
  prop('P21', '⭐ P10 une valeur de montre aberrante est bornée (≤ 2 × l\'estimation active)', () => { const w = W('marche', 120, 9, { kcalMontreActive: 5000 }), n = M.djNetEntrainement(w, 82), e = M.djNetEntrainement(W('marche', 120, 9), 82).net; return (n.net <= 2 * e + 1 && n.alerte === 'montre_trop_haute') ? null : 'montre 5000 retenue ' + Math.round(n.net) + ' pour une estimation de ' + Math.round(e); });
  prop('P22', 'P10b une montre « 0 » (saisie réelle, souvent un capteur absent) est remontée au bas du couloir, et dite', () => { const n = M.djNetEntrainement(W('marche', 120, 9, { kcalMontreActive: 0 }), 82); return (Math.abs(n.net - 0.5 * 459.2) < 1 && n.alerte === 'montre_trop_basse') ? null : _det(n); });
  prop('P23', 'P11 l\'énergie active du jour supplante entraînements et pas (jamais additionnée)', () => { const r = rng(20); for (let i = 0; i < 200; i++) { const j = genJour(r); j.energieJour = { active: 1500 + Math.floor(r() * 2000) }; const a = ex(j), b2 = ex({ pas: null, entrainements: [], energieJour: j.energieJour }); if (Math.abs(a - b2) > 1) return 'cas ' + i + ' : ' + a + ' ≠ ' + b2; } return null; });
  prop('P24', 'P12 la provenance (saisie / montre / HealthKit) ne change aucun résultat : même donnée, même résultat', () => { const r = rng(21); for (let i = 0; i < 200; i++) { const j = genJour(r), a = ex(j), b2 = ex(Object.assign({}, j, { entrainements: j.entrainements.map(w => Object.assign({}, w, { origine: 'healthkit' })) })); if (a !== b2) return 'cas ' + i; } return null; });
  prop('P25', '⭐ P13 l\'« autre sport » déclaré (+150 déjà dans la référence) est déduit : un jour de sport vaut son dépassement, jamais négatif', () => { const p2 = Object.assign({}, PR, { sportExtra: 150 }); const r = rng(22); for (let i = 0; i < 200; i++) { const j = genJour(r, true); j.pas = null; const a = M.depenseDuJour(p2, j, H30), b2 = M.depenseDuJour(PR, j, H30); if (a.avert.some(x => /plafond/.test(x)) || b2.avert.some(x => /plafond/.test(x))) continue; if (Math.abs(a.extra - Math.max(0, b2.extra - 150)) > 1) return 'cas ' + i + ' : ' + a.extra + ' ≠ max(0, ' + b2.extra + ' − 150)'; } return null; });
  prop('P26', 'P14 l\'habitude d\'entraînement (médiane des jours observés, ≥ 7) est déduite ; moins de 7 jours : pas d\'habitude supposée', () => { const w = [W('marche', 60, 7)]; const net = M.djNetEntrainement(w[0], 82).net; const h14 = Object.assign({}, H30, { entrainementsNet: Array(14).fill(net) }), h3 = Object.assign({}, H30, { entrainementsNet: Array(3).fill(net) });
    return (ex({ pas: null, entrainements: w }, PR, h14) === 0 && ex({ pas: null, entrainements: w }, PR, h3) === Math.round(net)) ? null : 'habitude 14 j → ' + ex({ pas: null, entrainements: w }, PR, h14) + ' ; 3 j → ' + ex({ pas: null, entrainements: w }, PR, h3); });
  prop('P26b', '⭐ P14b l\'habitude d\'entraînement (médiane des jours observés) ET le sport déclaré (+150 ou +300) : on déduit la PLUS GRANDE des deux, jamais leur somme', () => {
    const w2 = [W('marche', 120, 9)], net2 = Math.round(M.djNetEntrainement(w2[0], 82).net), hab2 = Object.assign({}, H30, { entrainementsNet: Array(14).fill(230) });
    const a150 = ex({ pas: null, entrainements: w2 }, Object.assign({}, PR, { sportExtra: 150 }), hab2), a300 = ex({ pas: null, entrainements: w2 }, Object.assign({}, PR, { sportExtra: 300 }), hab2);
    return (a150 === net2 - 230 && a300 === net2 - 300) ? null : 'sport 150 + habitude 230 → ' + a150 + ' (attendu ' + (net2 - 230) + ') ; sport 300 + habitude 230 → ' + a300 + ' (attendu ' + (net2 - 300) + ')';
  });
  prop('P27', 'P15 déterminisme : mêmes entrées, même sortie (et l\'entrée n\'est pas modifiée)', () => { const r = rng(23); for (let i = 0; i < 100; i++) { const j = genJour(r), copie = J(j), a = J(M.depenseDuJour(PR, j, H30)), b2 = J(M.depenseDuJour(PR, j, H30)); if (a !== b2 || J(j) !== copie) return 'cas ' + i; } return null; });
  prop('P28', 'P16 un jour dont les pas sont nuls, négatifs ou illisibles n\'invente rien (pas = absent)', () => { for (const p of [-5, NaN, Infinity, undefined, null, 'abc']) { const o = M.depenseDuJour(PR, { pas: p, entrainements: [] }, H30); if (!o || o.manques.indexOf('pas_du_jour') < 0 || o.extra !== 0) return 'pas = ' + String(p) + ' → ' + _det(o); } return null; });
  prop('P29', 'P17 une habitude de pas inconnue (moins de 7 jours) : les pas ne comptent PAS, et c\'est dit', () => { const o = M.depenseDuJour(PR, { pas: 40000, entrainements: [] }, { pasHors: Array(6).fill(6200) }); return (o.extra === 0 && o.manques.indexOf('habitude_pas') >= 0) ? null : _det(o); });
  prop('P29b', '⭐ P18 les pas PROPRES à un entraînement (montre, HealthKit) priment sur la cadence : ce sont EUX qui sont retirés du total du jour (randonnée de 4 h dont la montre a compté 10 000 pas sur 20 000 → 10 000 pas ordinaires, donc une ligne « pas » ; la cadence en aurait retiré 18 000 et n\'en aurait laissé aucune)', () => {
    const avec = run(20000, [W('randonnee', 240, 8, { pas: 10000 })]), sans = run(20000, [W('randonnee', 240, 8)]);
    const l = avec.lignes.find(x => x.source === 'pas');
    return (l && l.detail.pasHors === 10000 && !sans.lignes.some(x => x.source === 'pas') && Math.abs((avec.extra - sans.extra) - Math.round(l.kcal)) <= 1) ? null : _det({ avec: avec.lignes.map(x => [x.source, Math.round(x.kcal), x.detail && x.detail.pasHors]), sans: sans.lignes.map(x => [x.source, Math.round(x.kcal)]), extra: [avec.extra, sans.extra] });
  });
  prop('P29c', '⭐ P19 deux saisies de la MÊME minute, même durée, même origine, valeurs de montre différentes (150 et 220) : le résultat ne dépend pas de l\'ordre d\'arrivée', () => {
    const a1 = W('marche', 60, 9, { kcalMontreActive: 150 }), b1 = W('marche', 60, 9, { kcalMontreActive: 220 });
    const x = ex({ pas: null, entrainements: [a1, b1] }), y = ex({ pas: null, entrainements: [b1, a1] });
    return (x === y && x === 150) ? null : 'ordre a,b → ' + x + ' ; ordre b,a → ' + y;
  });
  prop('P29d', 'P20 deux saisies du même effort aux durées voisines (60 et 70 min, à 5 min d\'écart) ne font qu\'UNE ligne, de la durée la plus LONGUE', () => {
    const o = M.djDedoublonner([W('marche', 60, 9), Object.assign(W('marche', 70, 9), { debut: Th(9) + 5 * 60000, origine: 'montre' })]);
    return (o.length === 1 && o[0].dureeMin === 70 && o[0].fusion === 2) ? null : _det(o);
  });
  prop('P29e', '⭐ P21 la saisie à la main ET l\'import de la montre du même effort : UNE ligne, qui garde la valeur de la MONTRE (la meilleure preuve), dans les deux ordres d\'arrivée', () => {
    const a1 = W('marche', 60, 9), b1 = Object.assign(W('marche', 60, 9), { debut: Th(9) + 3 * 60000, origine: 'montre', kcalMontreActive: 210 });
    const o = M.djDedoublonner([a1, b1]), o2 = M.djDedoublonner([b1, a1]);
    return (o.length === 1 && o[0].kcalMontreActive === 210 && o[0].origine === 'montre' && J(o) === J(o2)) ? null : _det({ o, o2 });
  });

  // ── la pureté, lue dans la source : le moteur ne touche à rien d'extérieur ──
  const code = sansCom(bloc);
  const interdits = [['S.', /\bS\./], ['S[', /\bS\s*\[/], ['document', /\bdocument\b/], ['window', /\bwindow\b/], ['localStorage', /\blocalStorage\b/], ['sessionStorage', /\bsessionStorage\b/], ['fetch', /\bfetch\b/], ['XMLHttpRequest', /\bXMLHttpRequest\b/],
    ['sendBeacon', /\bsendBeacon\b/], ['Date.now', /\bDate\.now\b/], ['new Date', /\bnew\s+Date\b/], ['Math.random', /\bMath\.random\b/], ['persist(', /\bpersist\s*\(/], ['_cloudSync', /\b_cloudSync/], ['toast(', /\btoast\s*\(/], ['setTimeout', /\bsetTimeout\b/], ['today(', /\btoday\s*\(/]];
  const trouves = interdits.filter(([, re]) => re.test(code)).map(([n]) => n);
  T('P30', '⛔ PURETÉ (source) : le moteur ne contient AUCUNE référence à S, au DOM, au stockage, au réseau, à l\'horloge, au hasard ni à la persistance', trouves.length === 0, trouves);
  T('P31', '⛔ PURETÉ (source) : les paramètres sont GELÉS (aucun témoin ni code ne peut les changer en route)', /DJ_PARAMS\s*=\s*Object\.freeze\(/.test(code) && Object.isFrozen(M.DJ_PARAMS) && Object.isFrozen(M.DJ_PARAMS.CADENCE) && Object.isFrozen(M.DJ_PARAMS.INCERT));
  T('P32', 'le moteur n\'a AUCUN barème MET à lui : l\'estimation brute lui est fournie par le propriétaire (`kcalBloc`), R2', !/\bMET\b\s*[:=]\s*\{/.test(code) && !/\b(3\.8|8\.5|6\.0)\b/.test(code));
  // ── l'information prudente : `djEcartObjectif` (étape 2, 06/11/2026) ──
  const E1 = (r, o) => M.djEcartObjectif(r, o);
  const rando = M.depenseDuJour(PR, { pas: null, entrainements: [W('randonnee', 480, 8, { kcalMontreActive: 2700 })] }, H30);             // estimée 5 386, en plus 2 700
  const marche = M.depenseDuJour(PR, { pas: null, entrainements: [W('marche', 120, 9)] }, H30);                                         // estimée 3 145, en plus 459
  const seuilE = M.depenseDuJour(PR, { pas: null, entrainements: [W('marche', 120, 9, { kcalMontreActive: 800 })] }, H30);              // en plus 800 pile
  const sousE = M.depenseDuJour(PR, { pas: null, entrainements: [W('marche', 120, 9, { kcalMontreActive: 799 })] }, H30);               // en plus 799
  const e1 = E1(rando, 2786), e2 = E1(rando, 4500), e3 = E1(rando, rando.estime - 1000), e4 = E1(rando, rando.estime - 999), e5 = E1(marche, 1500), e6 = E1(seuilE, seuilE.estime - 1000), e7 = E1(sousE, sousE.estime - 1000);
  T('P33', '⭐ L\'ÉCART AVEC L\'OBJECTIF (information prudente) : randonnée de 8 h (estimée 5 386) face à 2 786 → +2 600, ALERTE · face à 4 500 → +886, non · écart de 1 000 pile → oui, 999 → non · une cible BASSE (1 500) avec 2 h de marche (+459, écart 1 645) → NON (l\'effort n\'est pas exceptionnel) · effort de 800 pile → oui, 799 → non · sans objectif, sans journée connue ou sans fourchette → null',
    e1 && e1.ecart === 2600 && e1.alerte === true && e1.lo === 2060 && e1.hi === 3140 && e2 && e2.ecart === 886 && e2.alerte === false && e3 && e3.alerte === true && e4 && e4.alerte === false
    && e5 && e5.ecart === 1645 && e5.alerte === false && e6 && e6.alerte === true && e7 && e7.alerte === false
    && E1(null, 2786) === null && E1(rando, null) === null && E1(rando, 0) === null && E1({ connu: false, estime: 2686, extra: 0, bande: { lo: 2686, hi: 2686 } }, 1000) === null && E1({ connu: true, estime: 5000, extra: 2000 }, 2000) === null,
    { e1, e2, e3, e4, e5, e6, e7 });
  // ── TD-C08 : brut → actif converti à UN seul endroit (source, bloc du moteur et adaptateurs) ──
  const blocTrk = srcTrk.slice(srcTrk.indexOf('// ⟦DJ:BLOC-DEBUT⟧'), srcTrk.indexOf('// ⟦DJ:BLOC-FIN⟧')), codeBloc = sansCom(blocTrk);
  const nbRepos = (codeBloc.match(/\bkg\s*\*\s*h\b/g) || []).length;
  T('P34', '⛔ TD-C08 · brut → actif : la soustraction du repos (`kg × h`) n\'existe qu\'à UN endroit (`djNetEntrainement`) dans le moteur ET ses adaptateurs, et les calories enregistrées n\'y entrent que sous le nom `kcalEstBrute` (jamais ajoutées telles quelles à la référence)',
    nbRepos === 1 && /function djNetEntrainement\b[\s\S]{0,700}brut - kg \* h/.test(codeBloc) && /kcalEstBrute: k\.estimee/.test(codeBloc) && !/\bextra\s*\+=\s*[\w.]*\.(calories|kcal)\b/.test(codeBloc) && !/\.calories\b/.test(codeBloc.replace(/\+s\.calories\s*\|\|\s*0/g, '')), { nbRepos });
  // ── TD-C02 : la dépense estimée n'est JAMAIS sous la référence, et vaut la référence quand rien n'est connu ──
  prop('P35', '⭐ TD-C02 · l\'estimée du jour est ≥ la référence (jamais en dessous) sur 300 jours tirés au hasard, et = la référence, extra 0, `connu:false` quand AUCUNE donnée n\'existe', () => {
    const r = rng(35); for (let i = 0; i < 300; i++) { const j = genJour(r), o = M.depenseDuJour(PR, j, H30); if (o.estime < o.ref || o.bande.lo < o.ref || (!o.connu && (o.estime !== o.ref || o.extra !== 0))) return 'cas ' + i + ' : ' + _det(o); }
    const vide = M.depenseDuJour(PR, { pas: null, entrainements: [] }, H30); return (vide.connu === false && vide.estime === vide.ref && vide.extra === 0) ? null : _det(vide); });
}

// ═════════════════════════════════════════════════════════════════════════════════
// BLOC K — le calibrage : ce que valent les hypothèses, mesuré
// ═════════════════════════════════════════════════════════════════════════════════
async function blocK(c) {
  const { T, M, bloc } = c;
  const variante = (f) => { const src = bloc.replace(/(CADENCE: Object\.freeze\(\{[^\n]*?\}\) \}\),)/, m => m.replace(/\b(\d+)\b/g, n => String(Math.round(+n * f))));
    return new Function(src + '\nreturn { depenseDuJour };')(); };
  const cas = { S3: [18200, [W('marche', 120, 9)]], S4: [36600, [W('randonnee', 480, 8)]], S6: [44600, [W('course', 240, 8)]], S7: [26900, [W('muscu', 60, 7), W('marche', 120, 10), W('course', 60, 17)]] };
  const ex = (V, pas, ws) => V.depenseDuJour(PR, { pas, entrainements: ws }, H30).extra;
  const V08 = variante(0.8), V12 = variante(1.2), V10 = variante(1);
  T('K01', 'le banc de sensibilité est SAIN : la variante « cadences × 1,0 » redonne exactement le moteur livré', Object.keys(cas).every(k => ex(V10, ...cas[k]) === M.depenseDuJour(PR, { pas: cas[k][0], entrainements: cas[k][1] }, H30).extra));
  T('K02', 'la variante « cadences × 0,8 » ne change réellement rien quand le texte n\'a pas pu être réécrit : elle DIFFÈRE sur au moins un scénario', Object.keys(cas).some(k => ex(V08, ...cas[k]) !== ex(V10, ...cas[k])));
  const delta = {}; let pire = 0;
  for (const k of Object.keys(cas)) for (const [nom, V] of [['×0,8', V08], ['×1,2', V12]]) { const a = ex(V10, ...cas[k]), v = ex(V, ...cas[k]), d = Math.abs(v - a) / a; delta[k + ' ' + nom] = Math.round(d * 1000) / 10 + ' %'; pire = Math.max(pire, d); }
  T('K03', '⭐ SENSIBILITÉ DES CADENCES : faire varier TOUTES les cadences de ± 20 % déplace l\'estimé de moins de 10 % sur les quatre scénarios avec entraînement (le résultat ne repose pas sur une cadence exacte)', pire < 0.10, delta);
  // le couloir de la montre, ses bornes exactes
  const net = M.djNetEntrainement(W('marche', 120, 9), 82).net;
  const montre = v => M.djNetEntrainement(W('marche', 120, 9, { kcalMontreActive: v }), 82);
  T('K04', 'le couloir de la montre est inclusif : 0,5× et 2× l\'estimation active passent tels quels, sans alerte', montre(0.5 * net).alerte === null && montre(2 * net).alerte === null && Math.abs(montre(2 * net).net - 2 * net) < 1e-9);
  T('K05', 'juste au-delà du couloir : bornée, avec l\'alerte du bon côté', montre(2 * net + 1).alerte === 'montre_trop_haute' && montre(0.5 * net - 1).alerte === 'montre_trop_basse');
  // les fourchettes contre la référence physiologique INDÉPENDANTE (deux méthodes : barème MET − 1 et coût ACSM) — le milieu de la référence doit tomber dans la fourchette annoncée
  const ref = { S3: [0.5 * 82 * 9.6, 2.8 * 82 * 2], S4: [0.5 * 82 * 22 + 0.009 * 82 * 1200, 5 * 82 * 8], S6: [7.5 * 82 * 4, 1.0 * 82 * 32], S7: [0.5 * 82 * 9.6 + 7.5 * 82, 2.8 * 82 * 2 + 1.0 * 82 * 8] };
  const ok = {}; let tout = true;
  for (const k of Object.keys(ref)) { const o = M.depenseDuJour(PR, { pas: cas[k][0], entrainements: cas[k][1] }, H30), mid = (ref[k][0] + ref[k][1]) / 2, dedans = o.bandeExtra.lo <= mid && mid <= o.bandeExtra.hi; ok[k] = Math.round(mid) + ' dans [' + o.bandeExtra.lo + ', ' + o.bandeExtra.hi + '] : ' + dedans; tout = tout && dedans; }
  T('K06', '⭐ CALIBRAGE : la fourchette annoncée contient le MILIEU de la référence physiologique indépendante (ACSM + barème MET) sur les quatre scénarios avec entraînement', tout, ok);
  const o5 = M.depenseDuJour(PR, { pas: 40000, entrainements: [] }, H30), mid5 = (0.5 * 82 * (33800 / 1300) + 2.8 * 82 * (33800 / 100 / 60)) / 2;
  T('K07', 'S5 (40 000 pas) : la fourchette contient aussi le milieu de la référence (marche pure : les pas SONT le bon signal)', o5.bandeExtra.lo <= mid5 && mid5 <= o5.bandeExtra.hi, { mid: Math.round(mid5), bande: o5.bandeExtra });
  // la limite DITE : avec les seuls pas, la course et la randonnée sont sous-estimées — ce n'est pas un défaut caché, c'est un fait écrit
  const o6 = M.depenseDuJour(PR, { pas: 44600, entrainements: [] }, H30), mid6 = (7.5 * 82 * 4 + 1.0 * 82 * 32) / 2;
  T('K08', 'LIMITE ÉCRITE : la course 4 h vue par ses seuls pas est sous-estimée de plus de moitié (1 164 pour ≈ 2 540) — un total de pas ne dit pas ce qui a été fait ; l\'enregistrer corrige', o6.extra < 0.6 * mid6, { pas: o6.extra, reference: Math.round(mid6) });
}

// ═════════════════════════════════════════════════════════════════════════════════
// BLOC S — les scénarios de l'audit par la VRAIE façade, dans la vraie app
// ═════════════════════════════════════════════════════════════════════════════════
async function blocS(c) {
  const { T, ouvrir, fermer, fac, act, muscu } = c;
  const X = await ouvrir({});
  const lire = async (pas, ss) => X.pg.evaluate(p => { S.healthDaily = (p.pas == null ? [] : [{ date: '2026-11-06', steps: p.pas }]).concat(p.base); S.sessions = p.ss; const r = depenseEstimeeDuJour(); return r ? JSON.parse(JSON.stringify(r)) : null; }, { pas, ss, base: base30() });
  const check = (id, nom, r, extra, bande, src, connu) => T(id, nom, r && r.extra === extra && (bande == null || (r.bandeExtra.lo === bande[0] && r.bandeExtra.hi === bande[1])) && (src === undefined || r.sources.join() === src) && (connu === undefined || r.connu === connu) && r.ref === 2686 && r.estime === 2686 + extra,
    r && { extra: r.extra, bande: r.bandeExtra, sources: r.sources, connu: r.connu, ref: r.ref, estime: r.estime });
  check('S101', '⭐ S1 repos (5 000 pas) : +0, donnée connue', await lire(5000, []), 0, [0, 0], '', true);
  check('S102', '⭐ S2 musculation 1 h : +0 (déjà dans le niveau d\'activité)', await lire(6500, [muscu(60, 330, '18:00')]), 0, [0, 0], '', true);
  check('S103', '⭐ S3 2 h de marche, pas + saisie : +459', await lire(18200, [act('marche', 120, 623, '09:00')]), 459, [344, 574], 'estimation');
  check('S104', 'S3 saisie seule (sans Santé) : +459', await lire(null, [act('marche', 120, 623, '09:00')]), 459, [344, 574], 'estimation');
  check('S105', 'S3 pas seuls : +331', await lire(18200, []), 331, [232, 431], 'pas');
  check('S106', '⭐ S4 randonnée 8 h, pas + saisie : +3 280', await lire(36600, [act('randonnee', 480, 3936, '08:00')]), 3280, [1968, 4592], 'estimation');
  check('S107', 'S4 avec la montre saisie (2 700, calories d\'activité) : +2 700 — la valeur saisie REMPLACE l\'estimation', await lire(36600, [act('randonnee', 480, 3936, '08:00', { man: 2700 })]), 2700, [2160, 3240], 'montre');
  check('S108', '⭐ S5 40 000 pas sans enregistrement : +1 019', await lire(40000, []), 1019, [713, 1324], 'pas');
  check('S109', 'S5 sans Apple Santé : connu:false, +0 — rien n\'est supposé', await lire(null, []), 0, [0, 0], '', false);
  check('S110', '⭐ S6 course 4 h, pas + saisie : +2 460', await lire(44600, [act('course', 240, 2788, '08:00')]), 2460, [1845, 3075], 'estimation');
  check('S111', '⭐ S7 combiné : +1 074', await lire(26900, [muscu(60, 330, '07:00'), act('marche', 120, 623, '10:00'), act('course', 60, 697, '17:00')]), 1074, [806, 1343], 'estimation');
  // le cardio AUTONOME (un bloc `cardio`, genre « cardio ») est un entraînement additif ; le cardio d'une séance de musculation fait partie de la séance
  const cs = c.cardioSeul('tapis', 'modere', 45, 338, '19:00');
  const rc = await lire(null, [cs]);
  T('S112', 'un cardio AUTONOME (tapis 45 min modéré) est un entraînement additif : actif = estimation brute 338 − repos 61,5 = 276,5 → 277 (arrondi au kcal)', rc && rc.extra === 277 && rc.sources.join() === 'estimation', rc && { extra: rc.extra, lignes: rc.lignes.map(l => l.label + ':' + Math.round(l.kcal)) });
  const mixte = muscu(60, 330, '18:00'); mixte.cardio = { type: 'tapis', intensity: 'modere', duration: 20, kcalEst: 150, kcalPoids: 82, kcalMode: 'met1' };
  const rm = await lire(null, [mixte]);
  T('S113', 'le cardio d\'une séance de MUSCULATION fait partie de la séance : non additif, +0', rm && rm.extra === 0 && rm.lignes.every(l => l.source === 'dans_ton_niveau'), rm && { extra: rm.extra, lignes: rm.lignes.length });
  // la valeur de la montre sur un cardio AUTONOME
  const csm = c.cardioSeul('tapis', 'modere', 45, 338, '19:00', { man: 250 });
  const rcm = await lire(null, [csm]);
  T('S114', 'une valeur de montre saisie sur un cardio autonome (250, activité seule) remplace l\'estimation : +250', rcm && rcm.extra === 250 && rcm.sources.join() === 'montre', rcm && { extra: rcm.extra, sources: rcm.sources });
  // le cardio fait AVANT (`cardioAvant`) est un entraînement à part entière, décalé de la durée du précédent : il ne doit pas disparaître
  const csa = c.cardioSeul('tapis', 'modere', 45, 338, '19:00'); csa.cardioAvant = { type: 'tapis', intensity: 'leger', duration: 20, kcalEst: 100, kcalPoids: 82, kcalMode: 'met1' };
  const rca = await lire(null, [csa]);
  T('S118', '⭐ un cardio fait AVANT (20 min, 100) ET un cardio APRÈS (45 min, 338) sur le même enregistrement : DEUX entraînements, +349 (72,7 + 276,5) et deux lignes — le premier ne disparaît pas', rca && rca.extra === 349 && rca.lignes.length === 2, rca && { extra: rca.extra, lignes: rca.lignes.map(l => l.label + ':' + Math.round(l.kcal)) });
  // de bout en bout par le VRAI formulaire « Autre activité »
  await X.pg.evaluate(() => { S.healthDaily = []; S.sessions = []; persist(); });
  await X.pg.evaluate(() => openAutreActivite()); await X.pg.waitForTimeout(80);
  await X.pg.evaluate(() => _auType('marche')); await X.pg.fill('#au-date', '2026-11-06'); await X.pg.fill('#au-heure', '09:00'); await X.pg.fill('#au-duree', '120');
  await X.pg.click('#au-save-btn'); await X.pg.waitForTimeout(250);
  const rf = await fac(X);
  T('S115', '⭐ DE BOUT EN BOUT : une marche de 120 min créée par le VRAI formulaire est vue par la façade : +459, fourchette 344–574, provenance « estimation »', rf && rf.extra === 459 && rf.bandeExtra.lo === 344 && rf.bandeExtra.hi === 574 && rf.sources.join() === 'estimation', rf && { extra: rf.extra, bande: rf.bandeExtra });
  T('S116', 'le résultat porte la date du jour et son contexte (pas connectés ou non)', rf && rf.date === '2026-11-06' && rf.pasConnectes === false, rf && { date: rf.date, pasConnectes: rf.pasConnectes });
  T('S117', 'aucune erreur de page pendant tout le bloc', X.errs.length === 0, X.errs);
  await fermer(X);
}

// ═════════════════════════════════════════════════════════════════════════════════
// BLOC D — anti-doublons, dans la vraie app
// ═════════════════════════════════════════════════════════════════════════════════
async function blocD(c) {
  const { T, ouvrir, fermer, act, muscu } = c;
  const X = await ouvrir({});
  const lire = async (pas, ss, hd) => X.pg.evaluate(p => { S.healthDaily = (p.pas == null ? [] : [{ date: '2026-11-06', steps: p.pas }]).concat(p.hd || p.base); S.sessions = p.ss; const r = depenseEstimeeDuJour(); return r ? JSON.parse(JSON.stringify(r)) : null; }, { pas, ss, base: base30(), hd });
  const marche2h = () => act('marche', 120, 623, '09:00');
  const seul = await lire(null, [marche2h()]), avecPas = await lire(18200, [marche2h()]), pasOrdinaires = await lire(6200, []);
  T('D01', '⭐ PAS ET MARCHE = UN SEUL EFFORT : le jour (pas + marche) vaut la marche seule + les pas ordinaires seuls (459 + 0), jamais la somme naïve (837)', avecPas.extra === seul.extra + pasOrdinaires.extra && avecPas.extra === 459, { jour: avecPas.extra, marcheSeule: seul.extra, pasOrdinaires: pasOrdinaires.extra });
  const rando = await lire(36600, [act('randonnee', 480, 3936, '08:00')]);
  T('D02', '⭐ RANDONNÉE 8 h : les 36 000 pas de la randonnée sont déjà payés par elle (pas hors entraînement : 600) → aucune ligne « pas », +3 280', rando.extra === 3280 && rando.sources.join() === 'estimation' && !rando.lignes.some(l => l.source === 'pas'), rando.lignes.map(l => l.label + ':' + l.source));
  const course = await lire(44600, [act('course', 240, 2788, '08:00')]);
  T('D03', '⭐ COURSE 4 h : même règle (39 600 pas retirés) → +2 460, aucune ligne « pas »', course.extra === 2460 && !course.lignes.some(l => l.source === 'pas'), { extra: course.extra });
  T('D04', '⭐ ACTIF, PAS BRUT : la randonnée enregistrée à 3 936 (brut) vaut 3 280 en dépense ACTIVE (repos de 8 h = 656 déduit) ; la marche de 2 h, 459 et non 623', rando.extra === 3936 - 656 && seul.extra === 623 - 164, { rando: rando.extra, marche: seul.extra });
  const cmp = await lire(null, [act('marche', 120, 623, '09:00', { man: 340 })]);
  T('D05', '⭐ LA MONTRE REMPLACE, NE S\'AJOUTE PAS : estimation 623 + valeur saisie 340 → +340 (jamais 340 + 459)', cmp.extra === 340 && cmp.sources.join() === 'montre', { extra: cmp.extra });
  const mus = await lire(null, [muscu(60, 330, '18:00'), muscu(45, 250, '07:00')]);
  T('D06', '⭐ MUSCULATION HABITUELLE NON AJOUTÉE : deux séances le même jour valent +0, dites « dans ton niveau d\'activité »', mus.extra === 0 && mus.lignes.length === 2 && mus.lignes.every(l => l.source === 'dans_ton_niveau'), { extra: mus.extra, lignes: mus.lignes.length });
  const sansMus = await lire(18200, [marche2h()]), avecMus = await lire(18200, [marche2h(), muscu(60, 330, '18:00')]);
  T('D07', 'ajouter une séance de musculation à une journée de marche ne change PAS l\'estimé (+459 dans les deux cas)', sansMus.extra === avecMus.extra, { sans: sansMus.extra, avec: avecMus.extra });
  const doublon = await lire(null, [marche2h(), act('marche', 120, 623, '09:00', { dts: 5 * 60000 })]);
  T('D08', '⭐ LE MÊME EFFORT SAISI DEUX FOIS (même heure à 5 min près, même durée) ne compte qu\'une fois : +459', doublon.extra === 459, { extra: doublon.extra });
  const deux = await lire(null, [act('marche', 60, 312, '07:00'), act('marche', 60, 312, '18:00')]);
  T('D09', 'deux marches DISTINCTES (matin et soir) comptent toutes les deux : 2 × 230 = 460', deux.extra === 460, { extra: deux.extra });
  const cross = await lire(null, [act('marche', 60, 312, '09:00'), act('course', 60, 697, '09:00')]);
  T('D10', 'deux efforts de familles différentes à la même heure ne sont PAS un doublon (le moteur ne devine pas : il additionne ce qui est saisi) : 230 + 615 = 845', cross.extra === 845, { extra: cross.extra });
  // une activité déjà dans l'habitude de la personne n'est pas comptée une seconde fois
  const hist14 = []; for (let k = 1; k <= 28; k++) hist14.push(act('marche', 60, 312, '07:00', { date: c.jourISO(k) }));   // 28 jours d'habitude : la fenêtre entière (14 jours d'habitude + 14 jours sans seraient une habitude à moitié : médiane 115)
  const hab = await lire(null, hist14.concat([act('marche', 60, 312, '07:00')]));
  T('D11', '⭐ L\'HABITUDE EST DÉJÀ DANS LA RÉFÉRENCE : une marche d\'1 h faite chaque jour depuis 28 jours ne vaut plus rien un jour de plus (+0) ; la même marche un jour sans habitude vaut 230', hab.extra === 0 && (await lire(null, [act('marche', 60, 312, '07:00')])).extra === 230, { habituelle: hab.extra });
  const sport = await X.pg.evaluate(() => { S.coachQuiz = { answers: { othersport: 'velo' } }; S.sessions = [{ id: 1793898000000, ts: 1793898000000, date: '2026-11-06', startHour: 9, exs: [], exercises: [], volume: 0, duration: 7200, calories: 623, calData: { total: 623, autre: 623 }, autre: { type: 'marche', duration: 120, heure: '09:00', kcalEst: 623, kcalPoids: 82, kcalMode: 'met1' } }]; S.healthDaily = []; const r = depenseEstimeeDuJour(); return r && { extra: r.extra, ref: r.ref }; });
  T('D12', '⭐ L\'« AUTRE SPORT » DÉCLARÉ (+150 déjà dans la référence 2 836) est déduit : marche de 2 h = 459 − 150 = 309, référence 2 836', sport && sport.extra === 309 && sport.ref === 2836, sport);
  T('D13', 'aucune erreur de page', X.errs.length === 0, X.errs);
  await fermer(X);
}

// ═════════════════════════════════════════════════════════════════════════════════
// BLOC H — l'historique : un jour ne reçoit que ses données, un jour passé se rejoue seul
// ═════════════════════════════════════════════════════════════════════════════════
async function blocH(c) {
  const { T, ouvrir, fermer, act, jourISO, fac } = c;
  const X = await ouvrir({});
  const hier = jourISO(1), avantHier = jourISO(2);
  const evalFac = (hd, ss, date, now) => X.pg.evaluate(p => { S.healthDaily = p.hd; S.sessions = p.ss; const r = depenseEstimeeDuJour(p.date); return r ? JSON.parse(JSON.stringify(r)) : null; }, { hd, ss, date });
  // ⭐ H1 — AUCUN REPORT : les pas d'HIER ne servent pas à AUJOURD'HUI (le moteur actuel les reprenait : +435 à 8 h du matin)
  const hdHier = [{ date: hier, steps: 20000 }].concat(base30().slice(1));
  const r1 = await evalFac(hdHier, []);
  const legacy = await X.pg.evaluate(hd => { S.healthDaily = hd; const m = calcMacros(S.nutritionPhase); return { fonction: typeof calcPasExtra, tdee: calcTDEE(), cible: m.calories }; }, hdHier);
  T('H01', '⭐ AUCUN REPORT DES PAS D\'HIER : avec 20 000 pas hier et RIEN aujourd\'hui, l\'estimé d\'aujourd\'hui vaut sa référence, sans source « pas », et dit « pas du jour non reçus »', r1 && r1.extra === 0 && r1.sources.indexOf('pas') < 0 && r1.manques.indexOf('pas_du_jour') >= 0 && r1.estime === r1.ref, r1 && { extra: r1.extra, manques: r1.manques });
  T('H02', '⭐ TD-C03 · LE LIEN HISTORIQUE AVEC LES PAS EST COUPÉ (NUT-TDEE-02, décision de Michel) : avec 20 000 pas HIER et rien aujourd\'hui, le TDEE vaut 2 686 et la cible 2 786 — l\'ancien calcul reprenait les pas d\'hier comme ceux d\'aujourd\'hui (+435 : 3 121 et 3 221) ; `calcPasExtra` n\'existe plus', legacy.fonction === 'undefined' && legacy.tdee === 2686 && legacy.cible === 2786, legacy);
  // ⭐ H3 — UN JOUR PASSÉ SE REJOUE SEUL : ce qui s'est passé depuis ne le change pas
  const ssAvantHier = [act('marche', 60, 312, '07:30', { date: avantHier })];
  const hdA = [{ date: avantHier, steps: 12200 }].concat(base30().slice(2));
  const passeSeul = await evalFac(hdA, ssAvantHier, avantHier);
  const avecApres = await evalFac(hdA.concat([{ date: hier, steps: 30000 }, { date: AUJ, steps: 25000 }]).sort((a, b) => b.date.localeCompare(a.date)), ssAvantHier.concat([act('randonnee', 480, 3936, '08:00', { date: hier }), act('course', 120, 1394, '07:00')]), avantHier);
  T('H03', '⭐ UN JOUR PASSÉ SE REJOUE SEUL : l\'estimé d\'avant-hier est IDENTIQUE avec ou sans la randonnée d\'hier, la course d\'aujourd\'hui et leurs pas (rien de ce qui s\'est passé depuis ne le touche)', passeSeul && avecApres && J(passeSeul) === J(avecApres), { seul: passeSeul && passeSeul.extra, apres: avecApres && avecApres.extra });
  T('H04', 'un jour passé sait dire ce qu\'il a vu : la marche d\'avant-hier est dans SON estimé (dépense active 230) et ses 6 000 pas sont attribués à la marche — avec 12 200 pas au total il reste 6 200 pas ordinaires, donc AUCUN surplus de pas', passeSeul && passeSeul.extra === 230 && passeSeul.lignes.length === 1 && passeSeul.lignes[0].famille === 'marche', passeSeul && { extra: passeSeul.extra, lignes: passeSeul.lignes.map(l => l.label) });
  const aujourdhui = await evalFac(hdA.concat([{ date: hier, steps: 30000 }, { date: AUJ, steps: 25000 }]), ssAvantHier, undefined);
  T('H05', 'et AUJOURD\'HUI n\'hérite pas non plus de la marche d\'avant-hier : seule la journée du jour compte (pas d\'activité aujourd\'hui, 25 000 pas → seulement la rampe des pas)', aujourdhui && aujourdhui.lignes.every(l => l.source === 'pas'), aujourdhui && aujourdhui.lignes.map(l => l.label));
  // ⭐ H6 — la frontière de minuit : une activité de 23 h 50 appartient à SON jour, pas au suivant (aucun décalage UTC)
  const ssMinuit = [act('marche', 60, 312, '23:50', { date: hier })];
  const rHier = await evalFac([], ssMinuit, hier), rAuj = await evalFac([], ssMinuit, undefined);
  T('H06', '⭐ MINUIT : une marche de 23 h 50 (heure de Paris) compte pour SON jour, pas pour le suivant', rHier && rHier.extra === 230 && rAuj && rAuj.extra === 0 && rAuj.connu === false, { hier: rHier && rHier.extra, aujourdhui: rAuj && rAuj.extra });
  const Xm = await ouvrir({ now: '2026-11-06T00:30:00+01:00' });          // 23 h 30 la veille en UTC : la date du TÉLÉPHONE fait foi
  const rm = await fac(Xm);
  T('H07', '⭐ À 00 h 30 heure de Paris (la veille en UTC), « aujourd\'hui » est bien le 06/11', rm && rm.date === '2026-11-06', rm && rm.date);
  await fermer(Xm);
  // l'habitude de pas ne compte QUE les pas hors entraînement des jours d'avant (les pas d'une marche habituelle ne gonflent pas la base)
  const hist = await X.pg.evaluate(p => { S.sessions = p.ss; S.healthDaily = p.hd; return _djHistorique(p.date, 82); }, { date: AUJ, hd: Array.from({ length: 10 }, (_, i) => ({ date: c.jourISO(i + 1), steps: 12000 })), ss: Array.from({ length: 10 }, (_, i) => act('marche', 60, 312, '07:00', { date: c.jourISO(i + 1) })) });
  T('H08', '⭐ BASE DE PAS HORS ENTRAÎNEMENT : 10 jours à 12 000 pas dont une marche d\'1 h (6 000 pas) donnent une base de 6 000, pas de 12 000', hist.pasHors.length === 10 && hist.pasHors.every(v => v === 6000), hist.pasHors);
  T('H09', 'les jours OBSERVÉS (avec séance ou pas) alimentent l\'habitude d\'entraînement : 10 jours de marche d\'1 h → 10 valeurs de 230', hist.entrainementsNet.length === 10 && hist.entrainementsNet.every(v => v === 230), hist.entrainementsNet);
  const histVide = await X.pg.evaluate(() => { S.sessions = []; S.healthDaily = []; return _djHistorique('2026-11-06', 82); });
  T('H10', 'un jour sans pas ni séance n\'est PAS un zéro d\'habitude : sans aucune donnée, l\'historique est vide (on ne sait pas)', histVide.pasHors.length === 0 && histVide.entrainementsNet.length === 0, histVide);
  // la fenêtre : une activité vieille de 29 jours est dans l'habitude, une de 31 jours non
  const f = await X.pg.evaluate(p => { S.healthDaily = []; S.sessions = p.ss; return _djHistorique('2026-11-06', 82).entrainementsNet.length; }, { ss: [act('marche', 60, 312, '07:00', { date: c.jourISO(28) }), act('marche', 60, 312, '07:00', { date: c.jourISO(29) })] });
  T('H11', 'FENÊTRE : l\'habitude d\'entraînement porte sur 28 jours (une séance d\'il y a 28 jours y est, celle d\'il y a 29 jours non)', f === 1, f);
  // ⭐ le jour n'entre JAMAIS dans sa propre habitude : 6 jours d'avant + aujourd'hui (40 000 pas, une marche) → l'habitude reste INCONNUE (6 < 7)
  const h6 = await X.pg.evaluate(p => { S.sessions = p.ss; S.healthDaily = p.hd; const hi = _djHistorique(p.date, 82), r = depenseEstimeeDuJour(); return { hi, r: r && { extra: r.extra, manques: r.manques, sources: r.sources } }; },
    { date: AUJ, hd: [{ date: AUJ, steps: 40000 }].concat(Array.from({ length: 6 }, (_, i) => ({ date: c.jourISO(i + 1), steps: 6200 }))), ss: [act('marche', 60, 312, '07:00')] });
  T('H13', '⭐ LE JOUR NE FAIT PAS SA PROPRE HABITUDE : avec 6 jours d\'historique + aujourd\'hui (40 000 pas, une marche), l\'habitude de pas et d\'entraînement ne compte QUE les 6 jours d\'AVANT — donc « habitude de pas inconnue », pas de ligne « pas »',
    h6.hi.pasHors.length === 6 && h6.hi.pasHors.every(v => v === 6200) && h6.hi.entrainementsNet.length === 6 && h6.r && h6.r.manques.indexOf('habitude_pas') >= 0 && h6.r.sources.indexOf('pas') < 0, h6);
  // ⭐ H14 · TD-C04 — LES PAS D'AUJOURD'HUI NE BOUGENT NI LA CIBLE NI LE « RESTE » D'HIER (mesuré avant : 786 sans pas, 1 221 avec 20 000 pas aujourd'hui)
  const resteHier = async (pasAuj) => X.pg.evaluate(p => { S.sessions = []; S.healthDaily = p.hd; S.foodLog = [{ id: 'dj-h14', date: p.hier, name: 'Repas test', kcal: 2000, prot: 150, carbs: 220, fat: 70 }];
    const r = _resteDuJour(p.hier), t = tendance14j(); return { reste: r && { kcal: r.kcal, prot: r.prot, carbs: r.carbs, fat: r.fat, cible: r.cible && r.cible.calories }, tendance: JSON.stringify(t) }; },
    { hier, hd: (pasAuj == null ? [] : [{ date: AUJ, steps: pasAuj }]).concat(base30()) });
  const rh0 = await resteHier(null), rh1 = await resteHier(20000), rh2 = await resteHier(40000);
  T('H14', '⭐ TD-C04 · LE « RESTE » D\'HIER EST IDENTIQUE avec 0, 20 000 ou 40 000 pas aujourd\'hui (2 000 mangés hier → il reste 786 sur la cible de 2 786), et la carte « tendance 14 jours » aussi — avant : 786 → 1 221', rh0.reste && rh0.reste.kcal === 786 && J(rh0) === J(rh1) && J(rh0) === J(rh2), { rh0: rh0.reste, rh1: rh1.reste, rh2: rh2.reste, tendance: rh0.tendance === rh1.tendance && rh0.tendance === rh2.tendance });
  // ⭐ H15 · TD-C03 — LE MAUVAIS JOUR DE L'AUDIT (08 h, 09 h, minuit, J+2) : la cible et le TDEE ne sautent plus (avant : 3 121 · 2 686 · 3 121 · 2 686)
  const instants = [['2026-11-06T08:00:00+01:00', [{ date: hier, steps: 20000 }]], ['2026-11-06T09:00:00+01:00', [{ date: AUJ, steps: 5000 }, { date: hier, steps: 20000 }]], ['2026-11-07T00:01:00+01:00', [{ date: hier, steps: 20000 }, { date: AUJ, steps: 22000 }]], ['2026-11-08T00:01:00+01:00', [{ date: hier, steps: 20000 }, { date: AUJ, steps: 22000 }]]];
  const saut = [];
  for (const [quand, jours] of instants) { await X.pg.clock.setFixedTime(new Date(quand)); const r = await X.pg.evaluate(p => { S.sessions = []; S.healthDaily = p.jours.concat(p.base); const m = calcMacros(S.nutritionPhase); return { tdee: calcTDEE(), cible: m.calories }; }, { jours, base: base30().slice(2) }); saut.push(quand.slice(5, 16) + ' → ' + r.tdee + ' / ' + r.cible); }
  T('H15', '⭐ TD-C03 · LE MAUVAIS JOUR : à 08 h (les seuls pas d\'hier), 09 h (un premier partiel), à minuit et à J+2, le TDEE reste 2 686 et la cible 2 786 — plus aucun saut de ±435 kcal sans que la personne ait rien fait', saut.every(x => /→ 2686 \/ 2786$/.test(x)), saut);
  T('H12', 'aucune erreur de page', X.errs.length === 0, X.errs);
  await fermer(X);
}

// ═════════════════════════════════════════════════════════════════════════════════
// BLOC A — l'absence de données : signalée, jamais inventée
// ═════════════════════════════════════════════════════════════════════════════════
async function blocA(c) {
  const { T, ouvrir, fermer, act, muscu } = c;
  const X = await ouvrir({});
  const lire = (hd, ss) => X.pg.evaluate(p => { S.healthDaily = p.hd; S.sessions = p.ss; const r = depenseEstimeeDuJour(); return r ? JSON.parse(JSON.stringify(r)) : null; }, { hd, ss });
  const vide = await lire([], []);
  T('A01', '⭐ AUCUNE DONNÉE : connu:false, +0, estimé = référence, et l\'absence est DITE (« pas du jour »)', vide && vide.connu === false && vide.extra === 0 && vide.estime === vide.ref && vide.manques.indexOf('pas_du_jour') >= 0 && vide.pasConnectes === false, vide);
  const sansPasAuj = await lire(c.base30(), []);
  T('A02', '⭐ DES PAS CONNUS MAIS PAS AUJOURD\'HUI : rien n\'est reporté, « pas du jour non reçus », et la carte sait que la personne a des pas (pasConnectes)', sansPasAuj && sansPasAuj.connu === false && sansPasAuj.manques.indexOf('pas_du_jour') >= 0 && sansPasAuj.pasConnectes === true, sansPasAuj && { connu: sansPasAuj.connu, manques: sansPasAuj.manques });
  const zero = await lire([{ date: AUJ, steps: 0 }].concat(c.base30()), []);
  T('A03', 'UN JOUR À 0 PAS n\'est pas une donnée (capteur éteint, téléphone posé) : traité comme absent, jamais comme « 0 pas = journée immobile »', zero && zero.connu === false && zero.manques.indexOf('pas_du_jour') >= 0, zero && { connu: zero.connu, manques: zero.manques });
  const peu = await lire([{ date: AUJ, steps: 40000 }].concat(c.base30().slice(0, 4)), []);
  T('A04', '⭐ HABITUDE DE PAS INCONNUE (4 jours seulement) : les 40 000 pas ne comptent PAS, et c\'est dit — aucun surplus sans base (R29)', peu && peu.extra === 0 && peu.manques.indexOf('habitude_pas') >= 0 && peu.connu === true, peu && { extra: peu.extra, manques: peu.manques });
  const muscuSeule = await lire([], [muscu(60, 330, '18:00')]);
  T('A05', 'une séance de musculation seule est une donnée du jour (connue), +0, et le dit : « déjà dans ton niveau d\'activité »', muscuSeule && muscuSeule.connu === true && muscuSeule.extra === 0 && muscuSeule.lignes[0].source === 'dans_ton_niveau', muscuSeule && { connu: muscuSeule.connu });
  const zeroMontre = await lire([], [act('marche', 120, 623, '09:00', { man: 0 })]);
  T('A06', '⭐ UNE MONTRE SAISIE À 0 (capteur absent) n\'écrase pas l\'estimation : remontée au bas du couloir (0,5 × 459 = 230), avec l\'alerte — la valeur enregistrée, elle, reste 0', zeroMontre && zeroMontre.extra === 230 && zeroMontre.avert.some(a => /montre_trop_basse/.test(a)), zeroMontre && { extra: zeroMontre.extra, avert: zeroMontre.avert });
  // des enregistrements abîmés ne font ni planter ni inventer
  const abime = await X.pg.evaluate(() => { S.healthDaily = [null, { date: '2026-11-06' }, { date: '2026-11-06', steps: 'abc' }, { steps: 5000 }]; S.sessions = [null, undefined, { date: '2026-11-06' }, { date: '2026-11-06', autre: {} }, { date: '2026-11-06', autre: { type: 'marche', duration: 'abc' } }, { date: '2026-11-06', autre: { type: 'marche', duration: 0 } },
      { date: '2026-11-06', exs: [], cardio: { type: 'tapis', duration: -5 } }, { date: '2026-11-06', autre: { type: 'marche', duration: 60 } }];
    try { const r = depenseEstimeeDuJour(); return { ok: true, extra: r && r.extra, lignes: r && r.lignes.length, connu: r && r.connu }; } catch (e) { return { ok: false, err: String(e) }; } });
  T('A07', '⭐ DES ENREGISTREMENTS ABÎMÉS (null, durée « abc », durée nulle ou négative, date manquante) ne font ni planter ni inventer : seul l\'enregistrement lisible (marche 60 min sans estimation fournie → recalculée par `kcalBloc`) compte', abime.ok === true && abime.lignes === 1 && abime.extra > 0, abime);
  const sansProfil = await X.pg.evaluate(() => { const bw = S.bw; S.bw = null; S.sessions = []; S.healthDaily = []; const r = depenseEstimeeDuJour(); S.bw = bw; return r; });
  T('A08', '⭐ PROFIL INCOMPLET (pas de poids) : pas de chiffre du tout (D-016) — la façade rend null', sansProfil === null, sansProfil);
  const sansNiveau = await X.pg.evaluate(() => { const a = S.activityLevel; S.activityLevel = null; S.sessions = []; S.healthDaily = []; const r = depenseEstimeeDuJour(); S.activityLevel = a; return r; });
  T('A09', '⭐ NIVEAU D\'ACTIVITÉ JAMAIS CHOISI : pas de chiffre (D-020) — la façade rend null', sansNiveau === null, sansNiveau);
  T('A10', 'aucune erreur de page', X.errs.length === 0, X.errs);
  await fermer(X);
}

// ═════════════════════════════════════════════════════════════════════════════════
// BLOC N — non-régression : l'objectif, le TDEE, les macros et le lien HISTORIQUE avec les pas, À L'OCTET
// ═════════════════════════════════════════════════════════════════════════════════
async function blocN(c) {
  const { T, ouvrir, fermer, act, muscu, cardioSeul, srcSta, srcTrk, srcScr, M } = c;
  const lireSrc = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const X = await ouvrir({});
  const lire = (pas, ss) => X.pg.evaluate(p => { S.healthDaily = (p.pas == null ? [] : [{ date: '2026-11-06', steps: p.pas }]).concat(p.base); S.sessions = p.ss; const m = calcMacros(S.nutritionPhase), d = cibleDecomposition(S.nutritionPhase);
    return { tdee: calcTDEE(), cible: m.calories, prot: m.prot_g, glu: m.carbs_g, lip: m.fat_g, deco: d && { tdee: d.tdee, cible: d.cible, base: d.base, bmr: d.bmr, act: d.act, pas: d.pas } }; }, { pas, ss, base: c.base30() });
  const jeux = { S1: [5000, []], S2: [6500, [muscu(60, 330, '18:00')]], S3: [18200, [act('marche', 120, 623, '09:00')]], S4: [36600, [act('randonnee', 480, 3936, '08:00')]], S5: [40000, []], S6: [44600, [act('course', 240, 2788, '08:00')]],
    S7: [26900, [muscu(60, 330, '07:00'), act('marche', 120, 623, '10:00'), act('course', 60, 697, '17:00')]] };
  /* ⭐ ÉTAPE 2 (06/11/2026, NUT-TDEE-02, décision explicite de Michel). Ce bloc disait, jusqu'ici, « l'objectif est à l'octet celui de la version publiée » et épinglait +378 à +500 kcal de pas
     dans le TDEE. ⛔ Ces témoins IMPOSAIENT l'ancienne règle : ils sont REMPLACÉS (pas assouplis) par l'invariant inverse, prouvé par mutation (`tools/mut_tdee_v2.py`). */
  const ref0 = await lire(null, []);
  const diffs = [];
  for (const k of Object.keys(jeux)) { const r = await lire(...jeux[k]); if (J([r.tdee, r.cible, r.prot, r.glu, r.lip]) !== J([ref0.tdee, ref0.cible, ref0.prot, ref0.glu, ref0.lip])) diffs.push(k + ' : ' + J([r.tdee, r.cible, r.prot, r.glu, r.lip])); }
  T('N01', '⭐ TD-C01 · LA CIBLE NE DÉPEND PLUS DES PAS : TDEE, cible ET macros des sept scénarios (de 5 000 à 44 600 pas, avec leurs activités) sont IDENTIQUES à ceux d\'un profil sans aucun pas — 2 686 · 2 786 (avant : +378 à +500 kcal, 3 164 à 3 286)', diffs.length === 0 && ref0.tdee === 2686 && ref0.cible === 2786 && ref0.glu > 0, { ref0, diffs });
  const riche = [muscu(60, 330, '07:00'), act('marche', 120, 623, '09:00', { man: 340 }), act('randonnee', 480, 3936, '08:00', { date: c.jourISO(1) }), act('course', 240, 2788, '08:00'), cardioSeul('tapis', 'modere', 45, 338, '19:00', { man: 250 })];
  const a0 = await lire(null, []), a1 = await lire(null, riche), a2 = await lire(40000, riche);
  T('N02', '⭐ ITEM 3 · UNE ACTIVITÉ ENREGISTRÉE (musculation, marche avec valeur de montre, randonnée, course, cardio autonome), avec ou sans 40 000 pas, ne change NI le TDEE, NI la cible, NI les macros (règle du 05/11, désormais vraie pour les pas aussi)', J(a0) === J(a1) && J(a0) === J(a2) && a0.cible === 2786, { a0: [a0.tdee, a0.cible], a1: [a1.tdee, a1.cible], a2: [a2.tdee, a2.cible] });
  // le chemin est FERMÉ et le reste fermé (R30 : un retrait écrit se fige, une absence aussi)
  const tdeeSrc = sansCom(corps('calcTDEE', srcSta)).replace(/\s+/g, '');
  const ferme = await X.pg.evaluate(() => ({ calcPasExtra: typeof calcPasExtra, ligneSousTdee: !!document.getElementById('nu-tdee-pas') }));
  T('N03', '⛔ R30 · LE LIEN AVEC LES PAS EST COUPÉ ET FIGÉ : `calcPasExtra` n\'EXISTE PLUS ; le corps de `calcTDEE` ne lit ni `_pasEcart`, ni `healthDaily`, ni `steps` et garde ses TROIS termes (BMR × niveau + travail + sport) ; la ligne « +K kcal de pas » sous le TDEE n\'existe plus', ferme.calcPasExtra === 'undefined' && !ferme.ligneSousTdee && /calcBMR\(\)\*S\.activityLevel\+calcWorkExtra\(\)\+calcSportExtra\(\)/.test(tdeeSrc) && !/_pasEcart|calcPasExtra|healthDaily|steps/.test(tdeeSrc), { ferme, tdeeSrc: tdeeSrc.slice(0, 160) });
  const courbe = await X.pg.evaluate(() => [7699, 7700, 12000, 40000].map(p => { S.healthDaily = [{ date: '2026-11-06', steps: p }].concat(Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.UTC(2026, 10, 6) - (i + 1) * 864e5).toISOString().slice(0, 10), steps: 6200 }))); const e = _pasEcart(); return e && { surplus: e.surplus, depasse: e.depasse, kcal: e.kcal }; }));
  T('N04', '`_pasEcart` dit des PAS et plus jamais des calories : 7 699 pas → surplus 1 499 (non notable) · 7 700 → 1 500 (notable) · 12 000 → 5 800 · 40 000 → 33 800 ; aucune clé `kcal` (la conversion pas → kcal n\'a qu\'un propriétaire : le moteur de la dépense estimée, R2)', J(courbe.map(x => x && [x.surplus, x.depasse, x.kcal === undefined])) === J([[1499, false, true], [1500, true, true], [5800, true, true], [33800, true, true]]), courbe);
  // l'objectif ne connaît pas le moteur : par la source…
  const objectif = ['calcTDEE', 'calcBMR', 'calcWorkExtra', 'calcSportExtra', '_autoKcalBrut', 'autoKcal', '_plancherKcal', 'calcMacros', 'cibleDecomposition'].map(n => [n, corps(n, srcSta)]);
  const manquants = objectif.filter(([, s]) => !s).map(([n]) => n);
  const touches = objectif.filter(([, s]) => /depenseDuJour|depenseEstimeeDuJour|depenseReference|djEcartObjectif|_dj[A-Z]|\bdj[A-Z]|DJ_|_pasEcart/.test(sansCom(s))).map(([n]) => n);
  const pas = corps('_pasEcart', srcTrk);
  T('N05', '⭐⛔ L\'OBJECTIF NE CONNAÎT NI LE MOTEUR NI LES PAS (source) : aucune des fonctions du TDEE, de la cible et des macros ne cite la dépense du jour ni `_pasEcart` ; et `_pasEcart` ne cite pas le moteur', manquants.length === 0 && touches.length === 0 && pas && !/depenseDuJour|depenseEstimeeDuJour|depenseReference|_dj[A-Z]|DJ_/.test(sansCom(pas)), { manquants, touches });
  // …et par le comportement : si le moteur plante, l'objectif ne bouge pas ; s'il est appelé pendant l'objectif, on le saurait
  const piege = await X.pg.evaluate(p => { S.healthDaily = [{ date: '2026-11-06', steps: 36600 }].concat(p.base); S.sessions = p.ss; let appels = 0; const sauve = { a: window.depenseEstimeeDuJour, b: window.depenseDuJour, c: window.depenseReference, d: window._pasEcart };
    window.depenseEstimeeDuJour = function () { appels++; throw new Error('piège'); }; window.depenseDuJour = window.depenseEstimeeDuJour; window.depenseReference = window.depenseEstimeeDuJour; window._pasEcart = window.depenseEstimeeDuJour;
    try { const m = calcMacros(S.nutritionPhase); const d = cibleDecomposition(S.nutritionPhase); const t = calcTDEE(); return { appels, cible: m.calories, tdee: t, deco: !!d }; } catch (e) { return { appels, err: String(e) }; }
    finally { window.depenseEstimeeDuJour = sauve.a; window.depenseDuJour = sauve.b; window.depenseReference = sauve.c; window._pasEcart = sauve.d; } }, { base: c.base30(), ss: jeux.S4[1] });
  T('N06', '⭐⛔ L\'OBJECTIF NE CONNAÎT NI LE MOTEUR NI LES PAS (comportement) : avec le moteur ET `_pasEcart` remplacés par un piège qui plante, la cible, le TDEE et la décomposition se calculent sans les appeler (0 appel) — 2 786 · 2 686', piege.appels === 0 && piege.cible === 2786 && piege.tdee === 2686 && piege.deco === true, piege);
  // la référence : recalculée À PART, sans copier la formule du moteur — et elle EST le TDEE
  const refs = await X.pg.evaluate(() => { const rs = []; for (const w of ['bureau', 'debout', 'actif', 'physique']) for (const pal of [1.2, 1.55, 1.9]) for (const os of [null, 'velo']) { S.workType = w; S.activityLevel = pal; S.coachQuiz = os ? { answers: { othersport: os } } : null; S.healthDaily = []; const att = Math.round(calcBMR() * pal + { bureau: 0, debout: 200, actif: 325, physique: 450 }[w] + (os && pal < 1.725 ? 150 : 0)); rs.push([depenseReference(), att, calcTDEE()]); } return rs; });
  T('N07', '⭐ LA RÉFÉRENCE = BMR × niveau + travail + sport, recalculée À PART sur 24 profils (4 métiers × 3 niveaux × avec/sans autre sport) : `depenseReference()` la retrouve à l\'unité près, et vaut le TDEE (qui n\'a plus de terme de pas)', refs.every(r => r[0] === r[1] && r[2] === r[1]), refs.filter(r => r[0] !== r[1] || r[2] !== r[1]).slice(0, 3));
  const refPas = await X.pg.evaluate(() => { S.workType = 'bureau'; S.activityLevel = 1.55; S.coachQuiz = null; S.healthDaily = [{ date: '2026-11-06', steps: 40000 }].concat(Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.UTC(2026, 10, 6) - (i + 1) * 864e5).toISOString().slice(0, 10), steps: 6200 }))); return { ref: depenseReference(), tdee: calcTDEE() }; });
  T('N08', 'LE TDEE ET LA RÉFÉRENCE N\'INCLUENT AUCUN PAS : avec 40 000 pas, TDEE 2 686 = référence 2 686 (avant : TDEE 3 186, référence 2 686 obtenue en retirant le terme de pas)', refPas.ref === 2686 && refPas.tdee === 2686, refPas);
  T('N09', 'aucune erreur de page', X.errs.length === 0, X.errs);
  // ⭐ TD-C05 — la décomposition envoyée à Milo : trois termes, la somme tient
  const deco = await X.pg.evaluate(() => { const out = []; for (const phase of ['charge', 'decharge']) for (const w of ['bureau', 'physique']) for (const avecPas of [false, true]) {
      S.workType = w; S.activityLevel = 1.55; S.coachQuiz = { answers: { othersport: 'velo' } };
      S.healthDaily = avecPas ? [{ date: '2026-11-06', steps: 40000 }].concat(Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.UTC(2026, 10, 6) - (i + 1) * 864e5).toISOString().slice(0, 10), steps: 6200 }))) : [];
      const d = cibleDecomposition(phase), m = calcMacros(phase); out.push({ phase, w, avecPas, d, cible: m.calories }); } return out; });
  const okDeco = deco.every(o => o.d && o.d.pas === undefined && o.d.cible === o.cible && o.d.base === Math.round(o.d.bmr * o.d.act) && o.d.base + o.d.travail + o.d.sport === o.d.tdee && Math.round(o.d.tdee + o.d.goalDelta + o.d.phaseAdj + o.d.lutealBonus) === o.d.brut);
  T('N10', '⭐ TD-C05 · LA DÉCOMPOSITION DE LA CIBLE SANS TERME « pas » : sur 2 phases × 2 métiers × avec/sans 40 000 pas, `base` = BMR × niveau à l\'unité près, base + travail + sport = TDEE, TDEE + objectif + phase + bonus = brut, et la cible décomposée est celle de `calcMacros`', okDeco && deco.length === 8, deco.filter(o => !(o.d && o.d.pas === undefined && o.d.cible === o.cible)).slice(0, 2));
  await X.pg.evaluate(() => { S.workType = 'bureau'; S.activityLevel = 1.55; S.coachQuiz = null; });   // le bloc a fait varier le profil (N07, N10) : on repart du profil de référence
  // ⭐ ITEM 4 · MILO — la ligne des pas dit la vérité du code (et seulement pour AUJOURD'HUI)
  const hierJ = c.jourISO(1);
  const ctxMilo = async (hd, ss) => X.pg.evaluate(p => { S.sessions = p.ss; S.healthDaily = p.hd; const ctx = String(buildCoachContext() || ''), i = ctx.indexOf('BEAUCOUP MARCHÉ'); return { present: i >= 0, ligne: i >= 0 ? ctx.slice(i - 40, i + 1100) : '', detail: typeof _cibleDetailTxt === 'function' ? _cibleDetailTxt() : '' }; }, { hd, ss });
  const mAuj = await ctxMilo([{ date: AUJ, steps: 15000 }].concat(c.base30()), []), mHier = await ctxMilo([{ date: hierJ, steps: 15000 }].concat(c.base30().slice(1)), []), mCalme = await ctxMilo([{ date: AUJ, steps: 6100 }].concat(c.base30()), []);
  const mSans = await ctxMilo(c.base30(), []);
  T('N11', '⭐ ITEM 4 · MILO : le surplus de pas d\'AUJOURD\'HUI est dit en pas (« 15 000 pas, soit 8 800 de plus »), avec « ne changent PAS son objectif calorique ni son TDEE » et l\'interdit d\'inventer l\'activité — la phrase « DÉJÀ ajoutées à son TDEE » a disparu ; les pas d\'HIER, une journée ordinaire ou aucun pas ne produisent AUCUNE ligne',
    mAuj.present && /15[\s  ]000 pas, soit 8[\s  ]800 de plus/.test(mAuj.ligne) && /ne changent PAS son objectif calorique ni son TDEE/.test(mAuj.ligne) && /Tu ne sais PAS de quoi il s'agit/.test(mAuj.ligne) && !/DÉJÀ ajoutées/.test(mAuj.ligne) && !/kcal sont/.test(mAuj.ligne)
    && !mHier.present && !mCalme.present && !mSans.present, { auj: mAuj.ligne.slice(0, 420), hier: mHier.present, calme: mCalme.present, sans: mSans.present });
  const dSansPas = (await ctxMilo(c.base30().slice(0, 0), [])).detail;
  T('N12', '⭐ ITEM 4 · MILO : le calcul de la cible qu\'il reçoit n\'a plus de terme « pas » (« … travail … autre sport ; puis objectif … ») et il est IDENTIQUE avec ou sans 40 000 pas', mAuj.detail === dSansPas && mAuj.detail.length > 50 && /autre sport ; puis objectif/.test(mAuj.detail) && !/[+−]\d+ pas\b/.test(mAuj.detail), { avec: mAuj.detail.slice(0, 260), sans: dSansPas.slice(0, 260) });
  // ⭐ ITEM 4 · PROGRÈS — la carte « Tes pas » parle en PAS, nomme son jour, ne parle plus de calories de cible
  const carte = async (hd, deplier) => X.pg.evaluate(p => { S.healthDaily = p.hd; if (p.deplier && !_pasHistOpen) togglePasHist(); else if (!p.deplier && _pasHistOpen) togglePasHist(); renderPasCard(); const el = document.getElementById('pas-card'); return { visible: !!el && el.style.display !== 'none', txt: el ? el.textContent.replace(/\s+/g, ' ') : '' }; }, { hd, deplier });
  const cAuj = await carte([{ date: AUJ, steps: 15000 }].concat(c.base30()), false), cDepl = await carte([{ date: AUJ, steps: 15000 }].concat(c.base30()), true), cHier = await carte([{ date: hierJ, steps: 15000 }].concat(c.base30().slice(1)), false), cSansBase = await carte([{ date: AUJ, steps: 15000 }, { date: hierJ, steps: 6000 }], false);
  const sp = t => t.replace(/[  ]/g, ' ');
  T('N13', '⭐ ITEM 4 · PROGRÈS : la carte « Tes pas » dit « 15 000 pas · aujourd\'hui · 8 800 de plus que ton habitude » (jamais de kcal), nomme « hier » quand ce sont les pas d\'hier (au lieu de les prendre pour ceux d\'aujourd\'hui), dit « habitude pas encore connue » sous 7 jours — et, dépliée, que les jours en vert comptent dans la dépense ESTIMÉE, « pas dans ton objectif alimentaire »',
    cAuj.visible && /15 000 pas · aujourd'hui · 8 800 de plus que ton habitude/.test(sp(cAuj.txt)) && !/kcal/i.test(cAuj.txt) && /15 000 pas · hier · 8 800 de plus/.test(sp(cHier.txt)) && !/aujourd'hui/.test(cHier.txt.split('Moyenne')[0]) && /habitude pas encore connue/.test(cSansBase.txt) && /ta dépense estimée du jour \(onglet Nutrition\), pas dans ton objectif alimentaire/.test(cDepl.txt) && !/s'ajoute/.test(cDepl.txt),
    { auj: sp(cAuj.txt).slice(0, 120), hier: sp(cHier.txt).slice(0, 120), sansBase: cSansBase.txt.slice(0, 120), depl: cDepl.txt.slice(-330) });
  // ⭐ ITEM 4 · ACCUEIL — « ce qu'il te reste » et le reste du jour ne bougent pas avec les pas (TD-U03)
  const accueil = async (pasAuj) => X.pg.evaluate(p => { S.sessions = []; S.healthDaily = p.pas == null ? p.base : [{ date: p.auj, steps: p.pas }].concat(p.base); S.foodLog = [{ id: 'dj-n14', date: p.auj, name: 'Repas test', kcal: 1200, prot: 80, carbs: 120, fat: 40 }]; const r = _resteDuJour(p.auj); return { reste: r && { kcal: r.kcal, prot: r.prot, carbs: r.carbs, fat: r.fat }, bloc: typeof _blocResteHTML === 'function' ? _blocResteHTML(p.auj) : null }; }, { pas: pasAuj, base: c.base30(), auj: AUJ });
  const ac0 = await accueil(null), ac1 = await accueil(20000), ac2 = await accueil(40000);
  T('N14', '⭐ ITEM 4 · ACCUEIL (TD-U03) : « ce qu\'il te reste » est IDENTIQUE avec 0, 20 000 ou 40 000 pas aujourd\'hui (1 200 mangés → il reste 1 586 sur la cible de 2 786) — le reste du jour ne bouge plus avec les pas', ac0.reste && ac0.reste.kcal === 1586 && J(ac0) === J(ac1) && J(ac0) === J(ac2), { ac0: ac0.reste, ac1: ac1.reste, ac2: ac2.reste });
  // ⭐ ITEM 4 · NUTRITION — le TDEE n'affiche plus de ligne de pas, et AUCUN texte vivant ne dit que les pas s'ajoutent à la dépense ou à l'objectif
  const nutri = await X.pg.evaluate(p => { S.sessions = []; S.healthDaily = [{ date: p.auj, steps: 15000 }].concat(p.base); goScreen('nutrition', document.getElementById('nb-nutrition')); renderNutrition(); return { ligne: !!document.getElementById('nu-tdee-pas'), tdee: (document.getElementById('nu-tdee') || {}).textContent }; }, { base: c.base30(), auj: AUJ });
  const vivants = { 'coach.js': lireSrc('coach.js'), 'screens.js': srcScr, 'tracking.js': srcTrk, 'app.js': lireSrc('app.js'), 'index.html': lireSrc('index.html') };
  const interdits = [/DÉJÀ ajoutées à son TDEE/, /s\\?'ajoute(?:nt)? (?:enfin )?à ta dépense/, /affichées sous ton TDEE/, /borné à 500 kcal/, /ajoutées à ta dépense du jour/, /getElementById\('nu-tdee-pas'\)/];
  const trouves = []; for (const [f, src] of Object.entries(vivants)) for (const re of interdits) if (re.test(f === 'index.html' ? src : sansCom(src))) trouves.push(f + ' : ' + re);
  T('N15', '⭐ ITEM 4 · NUTRITION et textes VIVANTS : le TDEE n\'a plus de ligne « 🚶 +K kcal », et ni l\'aide « ? », ni la diapo du Guide, ni la carte de Progrès, ni Milo ne contiennent plus « s\'ajoute à ta dépense », « DÉJÀ ajoutées à son TDEE », « affichées sous ton TDEE » ou « borné à 500 kcal » (les annonces DATÉES — pop-up v65, point rouge — ne sont pas réécrites : on ne falsifie pas ce qui a été annoncé ce jour-là)', !nutri.ligne && trouves.length === 0, { nutri, trouves });
  await fermer(X);
}

// ═════════════════════════════════════════════════════════════════════════════════
// BLOC E — aucun effet de bord : ni écriture, ni réseau, ni synchronisation
// ═════════════════════════════════════════════════════════════════════════════════
async function blocE(c) {
  const { T, ouvrir, fermer, act, muscu } = c;
  const X = await ouvrir({ sessions: [muscu(60, 330, '07:00'), act('marche', 120, 623, '09:00'), act('course', 240, 2788, '12:00'), act('randonnee', 480, 3936, '08:00', { date: c.jourISO(2) })], hd: [{ date: AUJ, steps: 18200 }].concat(c.base30()) });
  const externes = []; X.pg.on('request', rq => { if (!/^http:\/\/localhost:/.test(rq.url())) externes.push(rq.url().slice(0, 90)); });
  /* ⭐ ON OBSERVE LES DEUX POINTS D'ENTRÉE DE LA V2 DÈS LE TOUT PREMIER APPEL — avant même d'ouvrir Nutrition (campagne de mutations du 06/11 : une clé écrite « une seule fois », au premier calcul, passait entre
     les mailles d'un instantané pris après la navigation — mutation M54). Les compteurs ne comptent que ce qui se passe PENDANT un appel de la V2 : l'écran Nutrition, lui, a ses propres écritures légitimes. */
  await X.pg.evaluate(() => {
    window.__cnt = {}; window.__dans = 0; window.__appels = 0; window.__etat = [];
    const J = JSON.stringify, snap = () => J(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]));
    const log = k => { if (window.__dans) window.__cnt[k] = (window.__cnt[k] || 0) + 1; };
    const wrap = (o, n, k) => { const f = o[n]; if (typeof f !== 'function') return; o[n] = function () { log(k); return f.apply(this, arguments); }; };
    wrap(Storage.prototype, 'setItem', 'setItem'); wrap(Storage.prototype, 'removeItem', 'removeItem'); wrap(Storage.prototype, 'clear', 'clear'); wrap(window, 'fetch', 'fetch'); wrap(XMLHttpRequest.prototype, 'open', 'xhr'); wrap(navigator, 'sendBeacon', 'beacon');
    ['persist', '_cloudSync', '_cloudSyncDebounced', 'syncSheets', 'toast'].forEach(n => wrap(window, n, n));
    ['depenseEstimeeDuJour', '_renderDepenseJour'].forEach(n => { const f = window[n]; if (typeof f !== 'function') return;
      window[n] = function () { const a = J(S), l = snap(); window.__dans++; window.__appels++;
        try { return f.apply(this, arguments); } finally { window.__dans--; const b = J(S), l2 = snap(); if (a !== b) window.__etat.push(n + ' : S modifié'); if (l !== l2) window.__etat.push(n + ' : stockage modifié'); } }; });
  });
  await X.pg.evaluate(() => { goScreen('nutrition', document.getElementById('nb-nutrition')); }); await X.pg.waitForTimeout(500);
  const ok = await X.pg.evaluate(() => { const r1 = depenseEstimeeDuJour(), r2 = depenseEstimeeDuJour(r1 && r1.date), r3 = depenseEstimeeDuJour('2026-11-04'); renderNutrition(); renderNutrition(); return !!(r1 && r2 && r3); });
  await X.pg.waitForTimeout(1200);
  const cnt = await X.pg.evaluate(() => window.__cnt), etat = await X.pg.evaluate(() => window.__etat), appels = await X.pg.evaluate(() => window.__appels);
  T('E01', '⭐ AUCUNE ÉCRITURE : pendant les appels de la V2 (la façade, la carte), DÈS LE PREMIER, aucune clé de stockage n\'est écrite, retirée ni effacée', ok && appels >= 5 && !cnt.setItem && !cnt.removeItem && !cnt.clear, { appels, cnt });
  T('E02', '⭐ AUCUN RÉSEAU : pendant les appels de la V2 ni fetch, ni XMLHttpRequest, ni balise ; et aucune requête vers l\'extérieur de toute la séance', ok && appels >= 5 && !cnt.fetch && !cnt.xhr && !cnt.beacon && externes.length === 0, { cnt, externes });
  T('E03', '⭐ AUCUNE SYNCHRONISATION NI PERSISTANCE : pendant les appels de la V2 ni `persist`, ni `_cloudSync`, ni `_cloudSyncDebounced`, ni `syncSheets` (le protocole de Claude Principal n\'est pas sollicité)', ok && appels >= 5 && !cnt.persist && !cnt._cloudSync && !cnt._cloudSyncDebounced && !cnt.syncSheets, { appels, cnt });
  T('E04', '⭐ L\'ÉTAT N\'A PAS BOUGÉ : `S` et le stockage local sont octet pour octet les mêmes avant et après CHAQUE appel de la V2 — y compris le premier (une clé créée une seule fois est vue)', ok && appels >= 5 && etat.length === 0, { appels, etat });
  T('E05', 'aucune erreur de page', X.errs.length === 0, X.errs);
  await fermer(X);
}

// ═════════════════════════════════════════════════════════════════════════════════
// BLOC U — l'affichage : trois valeurs distinctes + la dépense enregistrée, sans inciter à manger plus
// ═════════════════════════════════════════════════════════════════════════════════
async function blocU(c) {
  const { T, ouvrir, fermer, act, muscu, jeuReference, srcScr } = c;
  const carte = async X => { await X.pg.evaluate(() => { goScreen('nutrition', document.getElementById('nb-nutrition')); renderNutrition(); }); await X.pg.waitForTimeout(400);
    return X.pg.evaluate(() => { const e = document.getElementById('nu-dj'); return e && e.style.display !== 'none' ? { txt: e.innerText.replace(/\s+/g, ' ').trim(), w: e.getBoundingClientRect().width } : null; }); };
  const NOTE = 'À titre d\'information. Ces calories ne s\'ajoutent pas à ton objectif — ton niveau d\'activité compte déjà ton entraînement habituel — et ce ne sont pas des calories en plus à manger.';
  // ── un jour de randonnée avec la valeur de la montre ──
  let X = await ouvrir({ sessions: [act('randonnee', 480, 3936, '08:00', { man: 2700 })], hd: [{ date: AUJ, steps: 36600 }].concat(c.base30()) });
  let k = await carte(X);
  const mk = await X.pg.evaluate(() => document.getElementById('m-kcal').textContent.replace(/\s/g, ''));
  T('U01', '⭐ TROIS VALEURS DISTINCTES : « Référence », « Estimée aujourd\'hui » et « Objectif alimentaire » ont chacune leur ligne, avec leur propre chiffre (2 686 · ≈ 5 386 · 2 786)', k && /Référence\s*2\s?686 kcal/.test(k.txt.replace(/[  ]/g, ' ')) && /Estimée aujourd'hui\s*≈\s*5\s?386 kcal/.test(k.txt.replace(/[  ]/g, ' ')) && /Objectif alimentaire\s*2\s?786 kcal/.test(k.txt.replace(/[  ]/g, ' ')), k && k.txt.slice(0, 300));
  T('U02', '⭐ la FOURCHETTE et la PROVENANCE sont à l\'écran : « de 4 846 à 5 926 », « Randonnée · 8 h : +2 700 valeur saisie (montre), activité seule · ± 20 % »', k && /de 4\s?846 à 5\s?926/.test(k.txt.replace(/[  ]/g, ' ')) && /Randonnée · 8 h : \+2\s?700 valeur saisie \(montre\), activité seule/.test(k.txt.replace(/[  ]/g, ' ')), k && k.txt.slice(60, 420));
  const objCarte = ((k && k.txt.replace(/[\u00a0\u202f]/g, ' ').match(/Objectif alimentaire\s*(\d[\d ]*) kcal/)) || [])[1];
  T('U03', '⭐ L\'OBJECTIF AFFICHÉ EST LE VRAI (celui de `m-kcal`, 2 786) : la carte le lit, ne le recalcule pas ; il ne dépend NI de l\'estimée NI des pas, et la carte ne parle plus d\'une « règle actuelle » de pas (retirée le 06/11, NUT-TDEE-02)', mk === '2786' && objCarte && objCarte.replace(/\s/g, '') === mk && /ne dépend ni de l'estimée ci-dessus ni de tes pas/.test(k.txt) && !/inclut|règle actuelle|de pas \(/.test(k.txt), { mk, objCarte });
  T('U04', '⭐ LA NOTE D\'INFORMATION est là, mot pour mot, et AUCUN mot du reste de la carte n\'invite à manger plus (« tu peux », « autorisé », « budget », « rattraper », « compenser », « bonus »)', k && k.txt.indexOf(NOTE) >= 0 && !/peux manger|autoris|budget|rattrap|compens|bonus|tu as le droit|en plus à manger/i.test(k.txt.replace(NOTE, '')), k && k.txt.replace(NOTE, '').slice(0, 200));
  const w = await X.pg.evaluate(() => { const e = document.getElementById('nu-dj'); const r = e.getBoundingClientRect(); return { carteDroite: Math.round(r.right), vue: window.innerWidth, debordeDoc: document.documentElement.scrollWidth > window.innerWidth + 1 }; });
  T('U05', 'à 390 px la carte tient dans l\'écran, sans débordement horizontal', w.carteDroite <= w.vue && !w.debordeDoc, w);
  T('U06', 'aucune erreur de page', X.errs.length === 0, X.errs);
  await fermer(X);
  // ── 320 px ──
  X = await ouvrir({ w: 320, sessions: jeuReference().concat([act('marche', 60, 312, '20:30', { date: '2026-11-05', man: 255 })]), now: '2026-11-05T21:00:00+01:00' });
  k = await carte(X);
  const w3 = await X.pg.evaluate(() => { const e = document.getElementById('nu-dj'); const r = e.getBoundingClientRect(); return { carteDroite: Math.round(r.right), vue: window.innerWidth, debordeDoc: document.documentElement.scrollWidth > window.innerWidth + 1 }; });
  T('U07', '⭐ à 320 px la carte tient aussi dans l\'écran (cas le plus chargé : référence de la mission + une marche)', w3.carteDroite <= w3.vue && !w3.debordeDoc, w3);
  // ── le jeu de référence de la mission, par les VRAIS gestes ──
  const txtN = k => k ? k.txt.replace(/[  ]/g, ' ') : '';
  const sectionEnreg = tx => { const i = tx.toLowerCase().indexOf('dépense enregistrée'); return i < 0 ? '' : tx.slice(i); };   // l'en-tête s'affiche en MAJUSCULES (CSS) : on cherche sans la casse
  T('U08', '⭐ RÉFÉRENCE DE LA MISSION (muscu 1 078 · cardio 379) + marche 255 : « Dépense enregistrée » dit Aujourd\'hui 558 (musculation 303 · autres 255) et 7 derniers jours 1 712 (musculation 1 078 · cardio 379 · autres 255)', /Aujourd'hui\s*558 kcal\s*musculation 303 · autres 255/.test(txtN(k)) && /7 derniers jours\s*1\s?712 kcal\s*musculation 1\s?078 · cardio 379 · autres 255/.test(txtN(k)), sectionEnreg(txtN(k)).slice(0, 330));
  const etat = async () => { const kk = await carte(X); return { t: txtN(kk), mk: await X.pg.evaluate(() => document.getElementById('m-kcal').textContent.replace(/\s/g, '')), ref: txtN(kk).match(/Référence\s*(\d[\d ]*) kcal/)[1].replace(/\s/g, '') }; };
  const e1 = await etat();
  const id = await X.pg.evaluate(() => S.sessions.find(s => s.autre).id);
  await X.pg.evaluate(i => openAutreActivite(i), id); await X.pg.waitForTimeout(80);
  const inp = X.pg.locator('#au-kcal input'); await inp.fill('200'); await inp.press('Tab'); await X.pg.click('#au-save-btn'); await X.pg.waitForTimeout(200);
  const e2 = await etat();
  T('U09', '⭐ MODIFIER la marche à 200 : la dépense enregistrée passe à 7 derniers jours 1 657 · aujourd\'hui 503 ; la référence et l\'objectif ne bougent pas', /7 derniers jours\s*1\s?657 kcal/.test(e2.t) && /Aujourd'hui\s*503 kcal/.test(e2.t) && e2.mk === e1.mk && e2.ref === e1.ref, { mk: [e1.mk, e2.mk], ref: [e1.ref, e2.ref] });
  await X.pg.evaluate(i => openAutreActivite(i), id); await X.pg.waitForTimeout(80);
  await X.pg.click('#au-del-btn'); await X.pg.click('#au-del-btn'); await X.pg.waitForTimeout(200);
  const e3 = await etat();
  T('U10', '⭐ SUPPRIMER la marche : retour à 7 derniers jours 1 457 · aujourd\'hui 303 ; référence et objectif toujours identiques (2 686 · 2 786)', /7 derniers jours\s*1\s?457 kcal\s*musculation 1\s?078 · cardio 379/.test(e3.t) && /Aujourd'hui\s*303 kcal/.test(e3.t) && sectionEnreg(e3.t).length > 100 && !/autres \d/.test(sectionEnreg(e3.t)) && e3.mk === e1.mk && e3.ref === e1.ref, { mk: [e1.mk, e3.mk], ref: [e1.ref, e3.ref] });
  T('U11', 'aucune erreur de page', X.errs.length === 0, X.errs);
  await fermer(X);
  // ── l'absence, DITE ──
  X = await ouvrir({});
  k = await carte(X);
  T('U12', '⭐ SANS AUCUNE DONNÉE : « Estimée aujourd\'hui » vaut « — » et dit pourquoi (« aucune donnée d\'activité aujourd\'hui : rien n\'est supposé ») ; la référence et l\'objectif restent affichés', k && /Estimée aujourd'hui\s*—/.test(txtN(k)) && /rien n'est supposé \(ta référence reste 2\s?686\)/.test(txtN(k)) && /Objectif alimentaire\s*2\s?786 kcal/.test(txtN(k)) && sectionEnreg(txtN(k)) === '', k && txtN(k).slice(0, 260));
  await fermer(X);
  X = await ouvrir({ sessions: [act('marche', 60, 312, '07:30')], hd: c.base30() });
  k = await carte(X);
  T('U13', '⭐ DES PAS CONNUS MAIS PAS AUJOURD\'HUI : la carte le dit (« Pas d\'aujourd\'hui non reçus : rien n\'est reporté d\'hier »)', k && /Pas d'aujourd'hui non reçus : rien n'est reporté d'hier\./.test(txtN(k)), k && txtN(k).slice(0, 360));
  await fermer(X);
  X = await ouvrir({ sessions: [], hd: [{ date: AUJ, steps: 40000 }].concat(c.base30().slice(0, 4)) });
  k = await carte(X);
  T('U14', 'UNE HABITUDE DE PAS INCONNUE est dite (« moins de 7 jours : les pas ne comptent pas encore »)', k && /Habitude de pas pas encore connue \(moins de 7 jours\)/.test(txtN(k)), k && txtN(k).slice(0, 360));
  await fermer(X);
  X = await ouvrir({ ls: { ft4_bw: '' } });
  k = await carte(X);
  T('U15', '⭐ PROFIL INCOMPLET et rien d\'enregistré : la carte n\'existe pas (aucun chiffre fabriqué, D-016)', k === null, k);
  await fermer(X);
  X = await ouvrir({ ls: { ft4_bw: '' }, sessions: [act('marche', 60, 312, '07:30', { man: 255 })] });
  k = await carte(X);
  T('U16', 'PROFIL INCOMPLET mais une activité enregistrée : seule la « Dépense enregistrée » s\'affiche (ce que la personne a saisi), sans référence ni objectif inventés', k && sectionEnreg(k.txt).length > 100 && !/référence/i.test(k.txt) && !/objectif alimentaire/i.test(k.txt) && !/estimée aujourd/i.test(k.txt), k && k.txt.slice(0, 200));
  await fermer(X);
  // ── la FENÊTRE « 7 derniers jours » : il y a 6 jours est dedans, il y a 7 jours n'y est plus ──
  X = await ouvrir({ sessions: [act('marche', 60, 312, '07:30', { date: c.jourISO(6), man: 100 }), act('marche', 60, 312, '07:30', { date: c.jourISO(7), man: 400 })] });
  k = await carte(X);
  T('U19', '⭐ FENÊTRE : « 7 derniers jours » compte la marche d\'il y a 6 jours (100) et PAS celle d\'il y a 7 jours (400) — 100 kcal, jamais 500', k && /7 derniers jours\s*100 kcal/.test(txtN(k)) && !/500 kcal/.test(txtN(k)) && !/Aujourd'hui\s*\d/.test(sectionEnreg(txtN(k))), k && sectionEnreg(txtN(k)).slice(0, 220));
  await fermer(X);
  // ── ITEM 6 · L'INFORMATION PRUDENTE : un effort EXCEPTIONNEL est nommé, jamais compensé dans l'objectif ──
  const alerte = async X => X.pg.evaluate(() => { const e = document.getElementById('nu-dj-alerte'); return e && e.style.display !== 'none' ? e.textContent.replace(/\s+/g, ' ').trim() : null; });
  X = await ouvrir({ sessions: [act('randonnee', 480, 3936, '08:00', { man: 2700 })], hd: [{ date: AUJ, steps: 36600 }].concat(c.base30()) });
  k = await carte(X);
  const alR = await alerte(X), mkR = await X.pg.evaluate(() => document.getElementById('m-kcal').textContent.replace(/\s/g, ''));
  T('U20', '⭐ ITEM 6 · UNE RANDONNÉE DE 8 H (estimée ≈ 5 386, objectif 2 786) fait apparaître l\'information prudente — « Journée d\'effort exceptionnel : ta dépense estimée dépasse ton objectif d\'environ 2 600 kcal (estimation, pas une mesure). Ton objectif ne change pas. » — et l\'objectif reste 2 786',
    !!alR && /Journée d'effort exceptionnel/.test(alR) && /dépasse ton objectif d'environ 2[\s\u202f\u00a0]600 kcal \(estimation, pas une mesure\)/.test(alR) && /Ton objectif ne change pas/.test(alR) && mkR === '2786', { alR, mkR });
  T('U22', '⭐ ITEM 6 · LE TON : neutre et prudent — « c\'est une information, pas une consigne », « s\'il se répète », « professionnel de santé » ; AUCUN mot qui dise quoi manger (« manger », « mange », « rattraper », « compenser », « autoriser », « budget », « bonus », « tu peux »)',
    !!alR && /information, pas une consigne/.test(alR) && /s'il se répète/.test(alR) && /professionnel de santé/.test(alR) && !/manger|mange|rattrap|compens|autoris|budget|bonus|tu peux|il faut|tu dois/i.test(alR), { alR });
  await fermer(X);
  X = await ouvrir({ sessions: [act('marche', 120, 623, '09:00')], hd: c.base30() });
  k = await carte(X);
  const alM = await alerte(X);
  await X.pg.evaluate(() => { S.manualKcal = 1500; renderNutrition(); }); await X.pg.waitForTimeout(250);
  const alBas = await alerte(X), objBas = ((await carte(X)).txt.replace(/[\u00a0\u202f]/g, ' ').match(/Objectif alimentaire\s*(\d[\d ]*) kcal/) || [])[1];
  T('U21', '⭐ ITEM 6 · PAS DE FAUX POSITIF : 2 h de marche (+459, estimée ≈ 3 145) ne déclenchent rien ; et avec une CIBLE BASSE choisie à la main (1 500, écart de 1 645 avec la dépense) rien non plus — l\'effort n\'est pas exceptionnel, c\'est la cible qui est basse',
    alM === null && alBas === null && objBas && objBas.replace(/\s/g, '') === '1500', { alM, alBas, objBas });
  // le seuil, vu à l'écran : écart de 1 000 pile → oui ; 999 → non (objectif fixé à la main, estimée de 5 386)
  await fermer(X);
  X = await ouvrir({ sessions: [act('randonnee', 480, 3936, '08:00', { man: 2700 })], hd: [{ date: AUJ, steps: 36600 }].concat(c.base30()) });
  await carte(X);
  const seuil = []; for (const obj of [4386, 4387]) { await X.pg.evaluate(o => { S.manualKcal = o; renderNutrition(); }, obj); await X.pg.waitForTimeout(200); seuil.push(await alerte(X)); }
  T('U23', '⭐ ITEM 6 · LE SEUIL, VU À L\'ÉCRAN : objectif fixé à 4 386 (écart de 1 000 pile avec l\'estimée 5 386) → l\'information apparaît ; à 4 387 (999) → elle disparaît', seuil[0] !== null && /d'environ 1[\s\u202f\u00a0]000 kcal/.test(seuil[0]) && seuil[1] === null, seuil);
  await fermer(X);
  // ── la source de l'écran ──
  T('U17', '⛔ SOURCE : `_renderDepenseJour` n\'ÉCRIT rien et n\'appelle ni `persist` ni une synchronisation, et son appel dans `renderNutrition` ne bloque jamais l\'écran (try/catch)',
    (s => !/persist\s*\(|_cloudSync|localStorage|fetch\s*\(|S\.\w+\s*=[^=]/.test(sansCom(s)))(corps('_renderDepenseJour', srcScr)) && /try\{\s*_renderDepenseJour\(\);\s*\}catch\(e\)/.test(srcScr), '');
  /* ⭐ ÉTAPE 2 : l'étape 1 GELAIT `_HELP_DATA` (zone de Claude Principal) ; la décision de Michel du 06/11 demande EXPRESSÉMENT de corriger les textes qui présentent les pas comme des calories ajoutées à l'objectif
     — dont les deux conseils d'aide « ? » (Nutrition, Progrès). Le témoin ne gèle donc plus la zone : il vérifie que ces deux conseils disent la NOUVELLE règle, et rien d'autre n'est exigé de `_HELP_DATA`. */
  const aide = (srcScr.match(/const _HELP_DATA\s*=\s*\{[\s\S]*?\n\};/) || [''])[0];
  const tipN = (aide.match(/\{i:'🚶',t:'<b>Tes grosses journées de marche comptent[^\n]*/) || [''])[0], tipP = (aide.match(/\{i:'🚶',t:'<b>« Tes pas »<\/b>[^\n]*/) || [''])[0];
  T('U18', '⭐ ITEM 4 · L\'AIDE « ? » de Nutrition et de Progrès dit la NOUVELLE règle : les pas comptent dans la dépense ESTIMÉE du jour, « jamais dans ton objectif » (Nutrition : « Ton objectif ne bouge pas avec tes pas », « pas des calories en plus à manger » ; Progrès : « jamais dans ton objectif alimentaire ») — et ne contient plus « ~290 kcal », « borné à 500 kcal », « affichées sous ton TDEE » ni « s\'ajoutent à ta dépense »',
    aide.length > 5000 && /dépense ESTIMÉE du jour — jamais dans ton objectif/.test(tipN) && /Ton objectif ne bouge pas avec tes pas/.test(tipN) && /pas des calories en plus à manger/.test(tipN) && !/290 kcal|borné à 500|affichées sous ton TDEE/.test(tipN)
    && /dépense <b>estimée<\/b> du jour/.test(tipP) && /jamais dans ton objectif alimentaire/.test(tipP) && !/s\\'ajoutent à ta dépense/.test(tipP), { nutrition: tipN.slice(0, 200), progres: tipP.slice(0, 200) });
}

module.exports = { ecran };
