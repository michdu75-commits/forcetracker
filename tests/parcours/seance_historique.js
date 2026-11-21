/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   🔁 LA SÉANCE D'UN JOUR DE PROGRAMME — PRESCRIPTION AU 1ᵉʳ USAGE, PUIS LA DERNIÈRE SÉANCE DE CE JOUR ; UNE RETOUCHE MANUELLE GARDE LA MAIN (blocs B-SCHIS-*)
   Claude N°2 (Séance), 16/11/2026 — décisions de Michel D-163 (identité stable d'un jour + reprise de la dernière séance TERMINÉE de la MÊME journée du MÊME programme),
   D-168 (une modification manuelle volontaire d'une charge / de répétitions est prioritaire, pour ces seuls champs), D-171 (l'éditeur, par série), D-165 (rien de précoché), D-167 (échauffement + travail).
   Chaîne conduite : un programme FICTIF (jamais le contenu d'un vrai programme) → l'éditeur (vraies fonctions et vrais gestes) → `_loadProgDayVraiment` / `_loadProgVraiment` → `finishWorkout` (la VRAIE séance
   enregistrée) → le chargement suivant. Le chargeur est lu dans l'app servie (390 × 844), le serveur est le VRAI `Code.js` (vm Node, services simulés) pour l'aller-retour des nouvelles données.
   ⛔ AUCUN NOM D'EXERCICE NE DÉCIDE : la règle est testée sur six familles — haltères, barre, machine, poids du corps, un exercice PERSONNALISÉ (`S.customExercises`) et un exercice FICTIF INÉDIT absent du catalogue.
   ⛔ Données 100 % INVENTÉES. 0 appel réel (Worker, Apps Script, Anthropic, Supabase interceptés). Les dates sont RELATIVES (jamais en dur) ; les bilans qui s'ouvrent seuls (lundi, mois écoulé) sont posés « annoncés ».
   NE COUVRE PAS : Safari iOS (Chromium ≠ iPhone) ; le cardio (un bloc de durée, sans séries : la règle ne le concerne pas) ; la validation humaine de la manière dont la personne VOIT « Précédent » et le grisé.
   Banc : tools/banc_seance_historique.js · contrôle négatif : tools/mut_seance_historique.py
   Préfixes : SCHIS-I (identité d'un jour) · SCHIS-R (la règle) · SCHIS-E (retouche manuelle) · SCHIS-D (éditeur · objectif · regroupement)
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE_LS = { ft4_ob2: '1', ft4_name: 'Testeur', ft4_premium: 'true', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '130' };
const clone = x => JSON.parse(JSON.stringify(x));
const js = x => String(JSON.stringify(x)).slice(0, 700);

/* Une série de programme : [charge, reps, type, repos] — et un exercice : nom + séries (+ champs de structure). */
const SE = (kg, reps, type, rest, extra) => Object.assign({ kg, reps, type: type || 'N', rest: rest || 0 }, extra || {});
const EXO = (name, sets, extra) => Object.assign({ name, note: '', sets }, extra || {});
/* Les six FAMILLES : haltères · barre · machine · poids du corps · exercice PERSONNALISÉ · exercice FICTIF INÉDIT (absent du catalogue). */
const N_HAL = 'Curl Haltères', N_BAR = 'Squat à la Barre', N_MAC = 'Leg Curl Assis Machine', N_PDC = 'Traction', N_PERSO = 'Mon Exo Perso Fictif', N_INED = 'Zorglub Presse Quantique';
const NOMS = [N_HAL, N_BAR, N_MAC, N_PDC, N_PERSO, N_INED];
/* Le jour « lourd » et le jour « léger » d'UN MÊME programme portent le MÊME libellé ; les mêmes exercices, d'autres prescriptions. */
const JOUR_LOURD = () => ({ label: 'HAUT', exs: [
  EXO(N_HAL, [SE(20, 10), SE(20, 10), SE(20, 10)]),
  EXO(N_BAR, [SE(60, 8, 'É', 60), SE(100, 5), SE(100, 5), SE(100, 5)]),
  EXO(N_MAC, [SE(40, 12, 'N', 90), SE(40, 12, 'N', 90)]),
  EXO(N_PDC, [SE(0, 8), SE(0, 8), SE(0, 6)]),
  EXO(N_PERSO, [SE(15, 12), SE(15, 12)]),
  EXO(N_INED, [SE(30, 10), SE(30, 10)])] });
const JOUR_LEGER = () => ({ label: 'HAUT', exs: [
  EXO(N_HAL, [SE(10, 15), SE(10, 15), SE(10, 15)]),
  EXO(N_BAR, [SE(40, 10, 'É', 60), SE(50, 12), SE(50, 12), SE(50, 12)]),
  EXO(N_MAC, [SE(25, 15, 'N', 60), SE(25, 15, 'N', 60)]),
  EXO(N_PDC, [SE(0, 12), SE(0, 12), SE(0, 10)]),
  EXO(N_PERSO, [SE(8, 20), SE(8, 20)]),
  EXO(N_INED, [SE(12, 20), SE(12, 20)])] });
const JOUR_BAS = () => ({ label: 'BAS', exs: [
  EXO(N_BAR, [SE(120, 3), SE(120, 3)]),
  EXO(N_INED, [SE(45, 8), SE(45, 8)])] });
/* Les valeurs que la personne « fait » vraiment le jour lourd (écarts voulus par rapport à la prescription) : [exercice, série, charge, reps]. */
const FAIT_LOURD = [[0, 0, 22.5, 9], [0, 1, 22.5, 9], [0, 2, 22.5, 8], [1, 0, 65, 7], [1, 1, 102.5, 5], [1, 2, 102.5, 5], [1, 3, 105, 4], [2, 0, 42.5, 11], [2, 1, 42.5, 10], [3, 0, 0, 9], [3, 1, 0, 8], [3, 2, 0, 7], [4, 0, 16, 12], [4, 1, 16, 11], [5, 0, 32.5, 10], [5, 1, 32.5, 9]];
const FAIT_LEGER = [[0, 0, 11, 14], [0, 1, 11, 14], [0, 2, 11, 13], [1, 0, 42.5, 10], [1, 1, 52.5, 12], [1, 2, 52.5, 11], [1, 3, 52.5, 10], [2, 0, 27.5, 15], [2, 1, 27.5, 14], [3, 0, 0, 13], [3, 1, 0, 12], [3, 2, 0, 11], [4, 0, 9, 20], [4, 1, 9, 19], [5, 0, 13, 20], [5, 1, 13, 18]];
const FAIT_BAS = [[0, 0, 122.5, 3], [0, 1, 125, 3], [1, 0, 47.5, 8], [1, 1, 50, 7]];
/** La forme ATTENDUE d'une séance chargée : la prescription `jour` + les ajustements `aj` (null = la prescription seule), kg/reps par série. */
const ATTENDU = (jour, aj) => jour.exs.map((e, ei) => ({ n: e.name, kg: e.sets.map((s, si) => { const a = (aj || []).find(x => x[0] === ei && x[1] === si); return a ? a[2] : s.kg; }).join(','), reps: e.sets.map((s, si) => { const a = (aj || []).find(x => x[0] === ei && x[1] === si); return a ? a[3] : s.reps; }).join(',') }));
const LU = w => w.exs.map(e => ({ n: e.name, kg: e.sets.map(s => s.kg).join(','), reps: e.sets.map(s => s.reps).join(',') }));
const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const diffs = (a, b) => a.map((x, i) => egal(x, b[i]) ? null : (x.n + ' ' + x.kg + '×' + x.reps + ' ≠ ' + (b[i] ? b[i].kg + '×' + b[i].reps : '∅'))).filter(Boolean).join(' | ');

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-SCHIS. LA SÉANCE D\'UN JOUR DE PROGRAMME — D-163 · D-168 · D-171 · D-165 · D-167 (l\'app conduite) ═══');
  const POSTS = [];
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
  await cx.route(/supabase\.co|anthropic\.com/, r => r.abort());
  await cx.route(/workers\.dev|script\.google\.com/, async r => {
    let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
    POSTS.push(c);
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
  });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
  pg.setDefaultTimeout(8000);
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_schis'))return; sessionStorage.setItem('_schis','1'); localStorage.clear();
    const D=${JSON.stringify(BASE_LS)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2500);
  /** Une section qui plante devient un ROUGE nommé — jamais un arrêt du banc. */
  const section = async (nom, fn) => { console.log('\n─── B-SCHIS-' + nom + ' ───'); try { await fn(); } catch (e) { t('SCHIS-' + nom + ' ⛔ la section n\'a pas pu aller au bout', false, String(e && e.message || e).slice(0, 300)); } };

  /* Les aides, DANS la page (un seul appel réseau-free par geste). Les horloges AVANCENT : chaque séance enregistrée attend 12 ms de plus que la précédente (jamais deux `ts` identiques). */
  await pg.evaluate(() => {
    const iso = d => { const x = new Date(Date.now() - d * 864e5); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
    window.H = {
      iso,
      /** Repart d'un compte vierge avec l'historique HOSTILE : les mêmes exercices, d'autres valeurs, sans programme (un `ts` bien plus ancien que tout ce que le banc enregistre). */
      raz(progs, hist) {
        document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
        S.customExercises = [{ n: 'Mon Exo Perso Fictif', g: 'Dos', custom: true }];
        S.programmes = progs || []; S.sessions = hist || []; S.wkt = null; S.prs = {}; S.exRestPref = {}; S.defRest = 130;
        const t = today(), pm = new Date(Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 2, 15));
        S.lastWeekSummary = t; S.lastMonthSummary = pm.getUTCFullYear() + '-' + String(pm.getUTCMonth() + 1).padStart(2, '0');   // le piège du lundi / du mois : les bilans automatiques sont « déjà annoncés »
        persist();
      },
      hostile(noms) { return [{ id: 1, ts: Date.now() - 9 * 864e5, date: iso(9), progLabel: 'Séance libre', exs: noms.map(n => ({ name: n, sets: [{ kg: 77, reps: 7, type: 'N', done: true }, { kg: 77, reps: 7, type: 'N', done: true }, { kg: 77, reps: 7, type: 'N', done: true }, { kg: 77, reps: 7, type: 'N', done: true }] })), volume: 1, synced: true, uniConv: 1 }]; },
      charge(i, j) { S.wkt = null; if (S.programmes[i].days && S.programmes[i].days.length) _loadProgDayVraiment(i, j || 0); else _loadProgVraiment(i); return JSON.parse(JSON.stringify(S.wkt)); },
      /** Fait un jour (charge → ajustements [[ex, série, kg, reps]] → toutes les séries validées → VRAIE séance enregistrée) ; rend la séance enregistrée. */
      async fait(i, j, aj, sauf) {
        const w = H.charge(i, j);
        (aj || []).forEach(([ei, si, kg, reps]) => { const s = S.wkt.exs[ei].sets[si]; if (kg != null) s.kg = kg; if (reps != null) s.reps = reps; });
        S.wkt.exs.forEach((e, ei) => e.sets.forEach(s => { s.done = (sauf || []).indexOf(ei) < 0; }));
        await finishWorkout(); await new Promise(r => setTimeout(r, 14));
        return JSON.parse(JSON.stringify(S.sessions[0]));
      },
      prog(i) { return JSON.parse(JSON.stringify(S.programmes[i])); }
    };
  });
  const raz = (progs, noms) => pg.evaluate(([p, n]) => { H.raz(p, n ? H.hostile(n) : []); }, [progs, noms || null]);
  const charge = (i, j) => pg.evaluate(([i, j]) => H.charge(i, j), [i, j || 0]);
  const fait = (i, j, aj, sauf) => pg.evaluate(([i, j, a, s]) => H.fait(i, j, a, s), [i, j || 0, aj || null, sauf || null]);
  const prog = i => pg.evaluate(i => H.prog(i), i);
  const PROG_A = () => ({ id: 'p-schis-a', name: 'Programme fictif lourd-léger', prescrit: true, weeks: 0, startDate: '', days: [JOUR_LOURD(), JOUR_LEGER(), JOUR_BAS()] });

  // ═══ I. L'IDENTITÉ STABLE D'UN JOUR (D-163) ═══
  await section('I', async () => {
    await raz([PROG_A()], NOMS);
    const avant = clone(await prog(0));
    const hist0 = await pg.evaluate(() => JSON.stringify(S.sessions));
    const w0 = await charge(0, 0);
    t('SCHIS-I01 ⛔ CONTRÔLE — le jour lourd s\'ouvre avec SA prescription (haltères · barre · machine · poids du corps · exercice PERSONNALISÉ · exercice FICTIF INÉDIT), malgré un historique hostile sur les mêmes noms (77 kg × 7)',
      egal(LU(w0), ATTENDU(JOUR_LOURD(), null)), diffs(LU(w0), ATTENDU(JOUR_LOURD(), null)));
    const p1 = await prog(0);
    t('SCHIS-I02 ⭐⭐ D-163 — chaque jour CHARGÉ reçoit son identité (`id`), posée paresseusement et ENREGISTRÉE ; un jour jamais chargé n\'en a pas (rien n\'est écrit d\'avance : ni migration, ni écriture à l\'import ou à la création)',
      !!p1.days[0].id && !p1.days[1].id && !p1.days[2].id && !!w0.progDayId && w0.progDayId === p1.days[0].id, js({ ids: p1.days.map(d => d.id || null), wkt: w0.progDayId }));
    /* ⚠️ RÉÉCRIT LE 16/11/2026 (lot 1 « contre-expertise », D-163) : avant, SEULE l'identité du jour s'écrivait au chargement ; les identités d'exercice (`exId`) et de série (`sid`) s'y ajoutent (homonymes H12, déplacement de série). L'invariant reste ENTIER —
       rien d'autre ne change : ni séries, ni types, ni charges, ni repos, ni libellés, ni cycle (aucune migration). La comparaison ignore les TROIS identités (jour, exercice, série), pas un champ de plus. */
    const sansIdent = (k, v) => ((k === 'id' && v && v.charAt(0) === 'j') || k === 'exId' || k === 'sid') ? undefined : v;
    t('SCHIS-I03 ⛔ aux identités près (jour · exercice · série), le programme enregistré est IDENTIQUE à celui d\'avant (séries, types, charges, repos, libellés, cycle) — aucune migration, aucune autre donnée ajoutée',
      JSON.stringify(p1, sansIdent) === JSON.stringify(avant, sansIdent), '');
    await charge(0, 1); await charge(0, 2);
    const p2 = await prog(0);
    t('SCHIS-I04 ⭐ les trois jours ont chacun leur identité, DISTINCTE (le lundi lourd et le jeudi léger portent le même libellé « HAUT »), et la 2ᵉ ouverture du jour 1 ne la change pas',
      new Set(p2.days.map(d => d.id)).size === 3 && p2.days.every(d => !!d.id) && p2.days[0].id === p1.days[0].id, js(p2.days.map(d => d.id)));
    const s1 = await fait(0, 0, FAIT_LOURD);
    t('SCHIS-I05 ⭐⭐ la séance ENREGISTRÉE porte l\'identité du jour (`progDayId`) en plus du programme (`progId`) et du libellé : c\'est elle, plus le libellé, qui dit « ce jour a été fait »',
      s1.progDayId === p2.days[0].id && s1.progId === 'p-schis-a' && s1.progLabel === 'HAUT', js({ d: s1.progDayId, p: s1.progId, l: s1.progLabel }));
    t('SCHIS-I06 ⛔ l\'historique d\'AVANT est IMMUABLE : ouvrir des jours, faire une séance n\'a modifié aucune ancienne séance (seule une séance a été ajoutée)',
      (await pg.evaluate(() => JSON.stringify(S.sessions.slice(1)))) === hist0 && (await pg.evaluate(() => S.sessions.length)) === 2, '');

    // I7 — un RENOMMAGE et une RÉORGANISATION des jours : l'identité voyage avec le jour, pas avec son libellé ni sa position
    await pg.evaluate(() => { const p = S.programmes[0]; p.days[0].label = 'HAUT — renommé'; p.days.reverse(); persist(); });
    const wr = await charge(0, 2);   // le jour lourd est maintenant le DERNIER (après renommage et inversion)
    t('SCHIS-I07 ⭐⭐ D-163 — le jour lourd RENOMMÉ et DÉPLACÉ (dernier de la liste) retrouve SA dernière séance (par identité, pas par libellé ni position) : mêmes valeurs que la séance faite, tous exercices',
      wr.progLabel === 'HAUT — renommé' && egal(LU(wr), ATTENDU(JOUR_LOURD(), FAIT_LOURD)), diffs(LU(wr), ATTENDU(JOUR_LOURD(), FAIT_LOURD)));
    const wl = await charge(0, 1);   // le jour léger (libellé « HAUT », n'a jamais été fait) n'hérite de rien
    t('SCHIS-I08 ⭐ … et le jour homonyme « HAUT » (le léger), jamais fait, reste à SA prescription : une séance du jour lourd renommé ne se reconnaît pas par un libellé', egal(LU(wl), ATTENDU(JOUR_LEGER(), null)), diffs(LU(wl), ATTENDU(JOUR_LEGER(), null)));

    // I9 — REPLI : des séances d'AVANT l'identifiant (sans `progDayId`) — le libellé, seulement s'il est UNIQUE dans le programme
    const L = () => ({ id: 'p-schis-leg', name: 'Programme fictif séances anciennes', prescrit: true, weeks: 0, startDate: '', days: [{ label: 'JOUR UN', exs: [EXO(N_HAL, [SE(20, 10), SE(20, 10)])] }, { label: 'DOUBLE', exs: [EXO(N_HAL, [SE(30, 10)])] }, { label: 'DOUBLE', exs: [EXO(N_HAL, [SE(5, 20)])] }] });
    await pg.evaluate(([l]) => { H.raz([l], []); const mk = (lab, kg) => ({ id: Date.now() + kg, ts: Date.now() - 3 * 864e5 - kg, date: H.iso(3), progId: 'p-schis-leg', progLabel: lab, exs: [{ name: 'Curl Haltères', sets: [{ kg, reps: 6, type: 'N', done: true }, { kg, reps: 6, type: 'N', done: true }] }], volume: 1, synced: true, uniConv: 1 }); const autre = mk('JOUR UN', 88); autre.progId = 'p-schis-autre'; autre.ts += 5000; S.sessions = [autre, mk('JOUR UN', 31), mk('DOUBLE', 99)]; persist(); }, [L()]);   // une séance PLUS RÉCENTE d'un AUTRE programme, au même libellé « JOUR UN » : elle ne compte pas
    const lu1 = await charge(0, 0), lu2 = await charge(0, 1), lu3 = await charge(0, 2);
    t('SCHIS-I09 ⭐ REPLI — une séance d\'avant l\'identifiant (sans `progDayId`) dont le libellé est UNIQUE dans le programme compte encore : « JOUR UN » reprend 31 × 6 ; « DOUBLE » (deux jours homonymes, séance sans identifiant) n\'est choisi pour AUCUN des deux (la prescription reste : 30 et 5)',
      lu1.exs[0].sets.map(s => s.kg + 'x' + s.reps).join() === '31x6,31x6' && lu2.exs[0].sets[0].kg === 30 && lu3.exs[0].sets[0].kg === 5, js([lu1, lu2, lu3].map(w => w.exs[0].sets.map(s => s.kg + 'x' + s.reps).join())));
  });

  // ═══ R. LA RÈGLE : 1ᵉʳ usage = prescriptions ; ensuite = la dernière séance terminée de CE jour de CE programme (D-163) ═══
  await section('R', async () => {
    await raz([PROG_A()], NOMS);
    const hist0 = await pg.evaluate(() => JSON.stringify(S.sessions));
    await fait(0, 0, FAIT_LOURD);
    const w1 = await charge(0, 0);
    t('SCHIS-R01 ⭐⭐ D-163 — le jour lourd, une fois TERMINÉ, rouvre avec les valeurs RÉELLEMENT faites (6 familles : haltères · barre · machine · poids du corps · exercice personnalisé · exercice fictif inédit) — jamais la prescription d\'origine, jamais l\'historique hostile (77 × 7)',
      egal(LU(w1), ATTENDU(JOUR_LOURD(), FAIT_LOURD)), diffs(LU(w1), ATTENDU(JOUR_LOURD(), FAIT_LOURD)));
    const w2 = await charge(0, 1);
    t('SCHIS-R02 ⭐⭐ D-163 — le jour LÉGER (même programme, MÊME libellé « HAUT », mêmes exercices) ne reprend RIEN du jour lourd : il s\'ouvre avec SA prescription (10 × 15, 40/50 × …)', egal(LU(w2), ATTENDU(JOUR_LEGER(), null)), diffs(LU(w2), ATTENDU(JOUR_LEGER(), null)));
    await fait(0, 1, FAIT_LEGER);
    const w3 = await charge(0, 1), w4 = await charge(0, 0);
    t('SCHIS-R03 ⭐⭐ le jour léger fait reprend SA séance (11 × 14, 42,5…) ; le jour lourd garde LA SIENNE (22,5 × 9, 65…) : lourd et léger ne se mélangent jamais, dans aucun des deux sens',
      egal(LU(w3), ATTENDU(JOUR_LEGER(), FAIT_LEGER)) && egal(LU(w4), ATTENDU(JOUR_LOURD(), FAIT_LOURD)), diffs(LU(w3), ATTENDU(JOUR_LEGER(), FAIT_LEGER)) + ' || ' + diffs(LU(w4), ATTENDU(JOUR_LOURD(), FAIT_LOURD)));
    const w5 = await charge(0, 2);
    t('SCHIS-R04 ⭐ un 3ᵉ jour (« BAS », libellé unique, jamais fait) garde sa prescription malgré les deux autres jours faits (barre 120 × 3, exercice fictif 45 × 8)', egal(LU(w5), ATTENDU(JOUR_BAS(), null)), diffs(LU(w5), ATTENDU(JOUR_BAS(), null)));
    await fait(0, 2, FAIT_BAS);
    const w6 = await charge(0, 2), w7 = await charge(0, 0);
    t('SCHIS-R05 ⭐ et le jour « BAS », une fois fait, reprend sa séance (122,5 · 125 sur la barre) sans toucher le squat du jour lourd (60 → 65, 100 → 102,5 · 105)', egal(LU(w6), ATTENDU(JOUR_BAS(), FAIT_BAS)) && egal(LU(w7), ATTENDU(JOUR_LOURD(), FAIT_LOURD)), diffs(LU(w6), ATTENDU(JOUR_BAS(), FAIT_BAS)));
    t('SCHIS-R06 ⛔ l\'historique d\'AVANT et les séances faites sont IMMUABLES : ouvrir et rouvrir des jours ne modifie aucune séance enregistrée', (await pg.evaluate(() => JSON.stringify(S.sessions.slice(3)))) === hist0, '');
    const ech = w7.exs[1].sets.map(s => s.type).join('');
    t('SCHIS-R07 ⭐ la structure suit le PROGRAMME (types, repos, nombre de séries) : échauffement « É » puis trois « N » (ÉNNN), repos 60 s · 0 · 0 · 0 du programme, jamais ceux de la séance précédente',
      ech === 'ÉNNN' && w7.exs[1].sets.map(s => s.rest).join() === '60,0,0,0' && w7.exs[2].sets.map(s => s.rest).join() === '90,90' && w7.exs.every(e => e.sets.every(s => s.done === false)), js({ ech, rest: w7.exs[1].sets.map(s => s.rest) }));

    // R8 — un exercice ABSENT de la dernière séance du jour : la PRESCRIPTION (arbitrage de Michel du 17/11/2026, H07 — oracle RÉÉCRIT : il exigeait l'avant-dernière séance de ce jour ; l'invariant « jamais celle d'un autre jour » est gardé, et « jamais une séance plus ancienne » s'y ajoute)
    await fait(0, 0, [[0, 0, 24, 8], [0, 1, 24, 8], [0, 2, 24, 7]], [4, 5]);   // 2ᵉ séance du jour lourd : l'exercice personnalisé (4) et l'exercice fictif (5) ne sont pas faits
    const w8 = await charge(0, 0);
    const att8 = ATTENDU(JOUR_LOURD(), FAIT_LOURD); att8[0].kg = '24,24,24'; att8[0].reps = '8,8,7';
    const presc8 = ATTENDU(JOUR_LOURD(), null); att8[4] = presc8[4]; att8[5] = presc8[5];                  // 17/11 : l'exercice absent de la dernière séance reprend SA PRESCRIPTION (plus l'avant-dernière séance)
    t('SCHIS-R08 ⭐ (H07, arbitré le 17/11) les exercices NON faits à la dernière séance du jour (personnalisé, fictif inédit) reprennent LEUR PRESCRIPTION (15 × 12 · 30 × 10), jamais l\'avant-dernière séance de ce jour (16 × 12 · 32,5 × 10) ; ceux de la dernière séance reprennent la dernière (24 × 8) — l\'autre jour n\'y est pour rien',
      egal(LU(w8), att8), diffs(LU(w8), att8));
    // R9 — le même exercice DEUX FOIS dans un jour (un top set puis un back-off listés à part) : chaque bloc reprend SON bloc de la séance précédente
    await pg.evaluate(() => { H.raz([{ id: 'p-schis-dup', name: 'Programme fictif deux blocs', prescrit: true, days: [{ label: 'TOP', exs: [{ name: 'Squat à la Barre', note: '', sets: [{ kg: 130, reps: 2, type: 'N', rest: 240 }] }, { name: 'Curl Haltères', note: '', sets: [{ kg: 18, reps: 10, type: 'N', rest: 90 }] }, { name: 'Squat à la Barre', note: '', sets: [{ kg: 100, reps: 6, type: 'N', rest: 150 }, { kg: 100, reps: 6, type: 'N', rest: 150 }] }] }] }], H.hostile(['Squat à la Barre'])); });
    await fait(0, 0, [[0, 0, 135, 2], [2, 0, 105, 6], [2, 1, 102.5, 6]]);
    const w9 = await charge(0, 0);
    t('SCHIS-R09 ⭐ un exercice listé DEUX fois dans le jour : chaque bloc reprend SON bloc de la dernière séance (top set 135 × 2 ; back-off 105 · 102,5 × 6) — jamais le même bloc deux fois, jamais l\'historique hostile (77)',
      w9.exs[0].sets.map(s => s.kg).join() === '135' && w9.exs[2].sets.map(s => s.kg).join() === '105,102.5' && w9.exs[1].sets[0].kg === 18, js(w9.exs.map(e => e.sets.map(s => s.kg))));
  });

  // ═══ S. LES STRUCTURES PARTICULIÈRES (supersets, dégressives, échauffements, « maxi ») et les programmes MANUELS ═══
  await section('S', async () => {
    const STRUCT = () => ({ id: 'p-schis-struct', name: 'Programme fictif structures', prescrit: true, days: [{ label: 'STRUCTURES', exs: [
      EXO(N_BAR, [SE(40, 10, 'É', 45), SE(60, 5, 'É', 60), SE(100, 5, 'N', 180), SE(100, 5, 'N', 180)]),
      EXO(N_HAL, [SE(14, 12, 'N', 0), SE(14, 12, 'N', 0)], { group: 'sg1', groupType: 'super' }),
      EXO(N_INED, [SE(20, 12, 'N', 90), SE(20, 12, 'N', 90)], { group: 'sg1', groupType: 'super' }),
      EXO(N_PERSO, [SE(30, 10, 'D', 0), SE(22, 10, 'D', 0), SE(15, 10, 'D', 90)], { dropChaine: true }),
      EXO(N_PDC, [SE(0, 0, 'N', 90, { maxi: true }), SE(0, 8, 'N', 90)])] }] });
    await raz([STRUCT()], NOMS);
    const wA = await charge(0, 0);
    t('SCHIS-S01 ⛔ CONTRÔLE — 1ᵉʳ usage : la prescription telle quelle (échauffements, superset, dégressive, « maxi »), malgré l\'historique hostile', wA.exs[0].sets.map(s => s.kg).join() === '40,60,100,100' && wA.exs[3].sets.map(s => s.kg).join() === '30,22,15', js(wA.exs.map(e => e.sets.map(s => s.kg))));
    await fait(0, 0, [[0, 0, 42.5, 9], [0, 1, 62.5, 5], [0, 2, 105, 5], [0, 3, 105, 4], [1, 0, 16, 12], [1, 1, 16, 11], [2, 0, 22, 12], [2, 1, 22, 11], [3, 0, 32, 9], [3, 1, 24, 9], [3, 2, 16, 8], [4, 1, 0, 9]]);
    const w = await charge(0, 0);
    t('SCHIS-S02 ⭐⭐ 2ᵉ usage — par RÔLE : les échauffements reprennent les échauffements (42,5 · 62,5), le travail le travail (105 · 105) ; le superset (16 · 16 et 22 · 22) et la dégressive (32 · 24 · 16) reprennent leurs séries ; l\'exercice fictif inédit comme les autres',
      w.exs[0].sets.map(s => s.kg).join() === '42.5,62.5,105,105' && w.exs[1].sets.map(s => s.kg).join() === '16,16' && w.exs[2].sets.map(s => s.kg).join() === '22,22' && w.exs[3].sets.map(s => s.kg).join() === '32,24,16', js(w.exs.map(e => e.sets.map(s => s.kg))));
    t('SCHIS-S03 ⛔ superset, dégressive, « maxi » restent ce que le programme dit : mêmes `group`, `groupType`, `dropChaine`, types ÉÉNN / DDD, la série « maxi » garde ses répétitions vides (0)',
      w.exs[1].group === 'sg1' && w.exs[2].group === 'sg1' && w.exs[1].groupType === 'super' && w.exs[3].dropChaine === true && w.exs[3].sets.map(s => s.type).join('') === 'DDD' && w.exs[0].sets.map(s => s.type).join('') === 'ÉÉNN' && w.exs[4].sets[0].maxi === true && w.exs[4].sets[0].reps === 0 && w.exs[4].sets[1].reps === 9, js({ g: w.exs.map(e => e.group || null), d: w.exs[3].dropChaine, m: w.exs[4].sets.map(s => [s.maxi, s.reps]) }));
    t('SCHIS-S04 ⛔ le repos reste celui du PROGRAMME (45 · 60 · 180 · 180 / 90 / 0·0·90), jamais repris de la séance', w.exs[0].sets.map(s => s.rest).join() === '45,60,180,180' && w.exs[2].sets.map(s => s.rest).join() === '90,90' && w.exs[3].sets.map(s => s.rest).join() === '0,0,90', js(w.exs.map(e => e.sets.map(s => s.rest))));

    // S5 — un programme MANUEL à UN SEUL jour (« Sauvegarder comme programme ») et un programme créé dans l'éditeur : même règle
    const man = await pg.evaluate(async () => {
      H.raz([], H.hostile(['Curl Haltères', 'Zorglub Presse Quantique']));
      S.wkt = { date: today(), progLabel: 'Séance libre', exs: [{ name: 'Curl Haltères', note: '', sets: [{ kg: 12, reps: 12, type: 'N', done: true, rest: 60 }, { kg: 12, reps: 12, type: 'N', done: true, rest: 60 }] }, { name: 'Zorglub Presse Quantique', note: '', sets: [{ kg: 33, reps: 11, type: 'N', done: true, rest: 90 }] }] };
      document.getElementById('prog-name-inp').value = 'Programme fictif manuel'; saveAsProg();
      const p = JSON.parse(JSON.stringify(S.programmes[0]));
      const w1 = H.charge(0);
      const a = { prescrit: p.prescrit, pid: !!p.id, w1: w1.exs.map(e => e.sets.map(s => s.kg + 'x' + s.reps).join()), progId: w1.progId };
      await H.fait(0, 0, [[0, 0, 13, 10], [0, 1, 13, 9], [1, 0, 35, 10]]);
      const w2 = H.charge(0);
      // un AUTRE programme qui contient le même exercice ne reprend rien de celui-ci
      S.programmes.push({ id: 'p-autre', name: 'Autre programme', prescrit: true, exs: [{ name: 'Curl Haltères', note: '', sets: [{ kg: 8, reps: 15, type: 'N', rest: 0 }] }] });
      persist(); const w3 = H.charge(1);
      return { a, w2: w2.exs.map(e => e.sets.map(s => s.kg + 'x' + s.reps).join()), w3: w3.exs[0].sets.map(s => s.kg + 'x' + s.reps).join() };
    });
    t('SCHIS-S05 ⭐⭐ D-163 — un programme MANUEL à un seul jour (« Sauvegarder comme programme ») est « prescrit » : 1ᵉʳ usage = ce qui a été enregistré (12 × 12 · 12 × 12 ; 33 × 11), malgré l\'historique hostile ; sa séance porte son `progId`',
      man.a.prescrit === true && man.a.pid && man.a.w1.join('|') === '12x12,12x12|33x11' && !!man.a.progId, js(man.a));
    t('SCHIS-S06 ⭐ … puis sa dernière séance FAITE (13 × 10 · 13 × 9 ; 35 × 10) ; et un AUTRE programme qui contient le même exercice ne reprend rien de lui (8 × 15, sa prescription)', man.w2.join('|') === '13x10,13x9|35x10' && man.w3 === '8x15', js(man));
    const crea = await pg.evaluate(() => {
      H.raz([], []); creerProgramme(); _editDayIdx = 0; _addExToProgEdit('Zorglub Presse Quantique');
      _setProgSetKg(0, 0, 0, '55'); document.getElementById('prog-edit-name').value = 'Programme fictif créé'; saveProgEdit(); const p = S.programmes[S.programmes.length - 1];   // le nom se tape APRÈS l'ajout d'un exercice : `_renderProgEdit` redessine le champ
      if (!p) return { prescrit: null, w: 'aucun programme créé' };
      S.sessions = H.hostile(['Zorglub Presse Quantique']); persist();
      return { prescrit: p.prescrit, w: H.charge(S.programmes.length - 1).exs[0].sets.map(s => s.kg + 'x' + s.reps).join() };
    });
    t('SCHIS-S07 ⭐ un programme CRÉÉ dans l\'éditeur est « prescrit » : 1ᵉʳ usage = ses valeurs (55 × 10, puis deux charges INCONNUES × 10 — la charge non écrite reste vide : null depuis D-164, plus 0), pas l\'historique hostile (77)', crea.prescrit === true && crea.w === '55x10,nullx10,nullx10', js(crea));

    // S8 — un programme d'AVANT (ni `prescrit`, ni identifiant de jour) : RÉÉCRIT LE 16/11/2026 (D-163, sondes H02/H03) — il suit la MÊME règle que les autres : 1ᵉʳ usage = SA prescription, jamais l'historique d'un autre contexte ; aucun `prescrit` ajouté (aucune migration)
    const anc = await pg.evaluate(() => {
      H.raz([{ id: 'p-ancien', name: 'Programme ancien fictif', weeks: 0, startDate: '', days: [{ label: 'JOUR A', exs: [{ name: 'Mon Exo Perso Fictif', note: '', sets: [{ kg: 15, reps: 12, type: 'N', rest: 0 }, { kg: 15, reps: 12, type: 'N', rest: 0 }] }] }] }], H.hostile(['Mon Exo Perso Fictif']));
      const w = H.charge(0), p = S.programmes[0];
      return { w: w.exs[0].sets.map(s => s.kg + 'x' + s.reps).join(), id: p.days[0].id || null, prescrit: p.prescrit || null, progDayId: w.progDayId || null };
    });
    t('SCHIS-S08 ⭐⭐ D-163 — un programme d\'AVANT (sans `prescrit`) suit la MÊME règle : au 1ᵉʳ usage c\'est SA prescription (15 × 12), jamais la dernière séance de l\'exercice d\'ailleurs (77 × 7) ; il reçoit son identité de jour, mais aucun `prescrit` n\'est ajouté — jamais de migration (AVANT : « comportement conservé », 77 × 7 — c\'était le défaut H02/H03)',
      anc.w === '15x12,15x12' && !!anc.id && anc.progDayId === anc.id && anc.prescrit === null, js(anc));
  });

  // ═══ E. UNE MODIFICATION MANUELLE VOLONTAIRE EST PRIORITAIRE — pour les seuls champs touchés (D-168) ═══
  await section('E', async () => {
    const edit = (i, fn) => pg.evaluate(([i, fn]) => { editProg(i); (new Function('return ' + fn))()(); saveProgEdit(); return JSON.parse(JSON.stringify(S.programmes[i])); }, [i, fn]);
    await raz([PROG_A()], NOMS);
    await fait(0, 0, FAIT_LOURD);
    await pg.waitForTimeout(25);                       // l'horloge AVANCE : la retouche est strictement postérieure à la séance
    const pe = await edit(0, '() => { _setProgSetKg(0, 1, 2, "110"); _setProgSetReps(0, 0, 1, "6"); _setProgSetRest(0, 2, 0, "75"); }');
    /* ⚠️ RÉÉCRIT LE 16/11/2026 (D-168, sonde H09/H10) : le REPOS a désormais son propre marqueur (`ed.rest`) — « le repos n'en pose pas » contredisait la décision (une retouche du repos est prioritaire, comme celle de la charge et des répétitions, pour CE champ de CETTE série).
       L'invariant utile reste : la retouche ne pose son instant que sur la série TOUCHÉE et son champ SEUL (aucune autre série, aucun autre champ). */
    t('SCHIS-E01 ⭐ une retouche de charge, de répétitions ou de repos dans l\'éditeur est ENREGISTRÉE avec l\'instant de la retouche, sur la série TOUCHÉE et son champ SEULS (`ed.kg` sur la 3ᵉ série du squat, `ed.reps` sur la 2ᵉ série du curl, `ed.rest` sur la 1ʳᵉ série de la machine)',
      !!pe.days[0].exs[1].sets[2].ed && typeof pe.days[0].exs[1].sets[2].ed.kg === 'number' && Object.keys(pe.days[0].exs[1].sets[2].ed).join() === 'kg' && Object.keys(pe.days[0].exs[0].sets[1].ed || {}).join() === 'reps'
      && Object.keys(pe.days[0].exs[2].sets[0].ed || {}).join() === 'rest' && typeof pe.days[0].exs[2].sets[0].ed.rest === 'number' && pe.days[0].exs[2].sets[0].rest === 75 && pe.days[0].exs.every((e, ei) => e.sets.every((s, si) => (ei === 1 && si === 2) || (ei === 0 && si === 1) || (ei === 2 && si === 0) || !s.ed)), js({ sq: pe.days[0].exs[1].sets[2], curl: pe.days[0].exs[0].sets[1], mac: pe.days[0].exs[2].sets[0] }));
    const w = await charge(0, 0);
    const att = ATTENDU(JOUR_LOURD(), FAIT_LOURD); att[1].kg = '65,102.5,110,105'; att[0].reps = '9,6,8';
    t('SCHIS-E02 ⭐⭐ D-168 — la charge retouchée (110 sur la 3ᵉ série du squat) et les répétitions retouchées (6 sur la 2ᵉ série du curl) PASSENT AVANT la dernière séance, pour ces séries et ces champs SEULEMENT : toutes les autres séries, et l\'autre champ de la même série (la charge du curl : 22,5), gardent leur progression (la séance faite)',
      egal(LU(w), att), diffs(LU(w), att));
    t('SCHIS-E03 ⭐ le repos retouché (75 s sur la machine) est celui chargé ; les autres repos restent ceux du programme (90)', w.exs[2].sets[0].rest === 75 && w.exs[2].sets[1].rest === 90, js(w.exs[2].sets.map(s => s.rest)));
    t('SCHIS-E04 ⛔ l\'instant de retouche reste dans le PROGRAMME seulement : ni la séance chargée (`S.wkt`), ni la séance enregistrée n\'en portent trace',
      !JSON.stringify(w).includes('"ed"') && !(await pg.evaluate(() => JSON.stringify(S.sessions).includes('"ed"'))), '');
    await pg.waitForTimeout(25);
    await fait(0, 0, [[1, 2, 111, 4]]);               // une séance FAITE PLUS TARD que la retouche : la progression reprend la main
    const w2 = await charge(0, 0);
    t('SCHIS-E05 ⭐⭐ D-168 — une séance terminée APRÈS la retouche reprend la main : la 3ᵉ série du squat redonne ce qui a été FAIT (111), non plus la valeur retouchée (110) ; les autres séries gardent la progression',
      w2.exs[1].sets[2].kg === 111 && w2.exs[1].sets[0].kg === 65 && w2.exs[0].sets[1].reps === 6 /* la séance faite le jour de la retouche a gardé les reps proposées (6) */, js({ sq: w2.exs[1].sets.map(s => s.kg), curl: w2.exs[0].sets.map(s => s.reps) }));

    // E6 — une retouche ANTÉRIEURE à la dernière séance ne gagne pas ; retaper la MÊME valeur n'est pas une retouche ; vider une charge en est une
    await pg.waitForTimeout(25);
    const pm = await edit(0, '() => { _setProgSetKg(0, 4, 0, "15"); _setProgSetKg(0, 4, 1, ""); }');
    t('SCHIS-E06 ⭐ retaper la MÊME charge (15 sur l\'exercice personnalisé, déjà 15) ne pose AUCUN instant ; vider une charge (la 2ᵉ série, 15 → vide) en pose un', !pm.days[0].exs[4].sets[0].ed && !!pm.days[0].exs[4].sets[1].ed && pm.days[0].exs[4].sets[1].kg === null, js(pm.days[0].exs[4].sets));   // D-164 : vider une charge la rend INCONNUE (null), plus un zéro
    const w3 = await charge(0, 0);
    t('SCHIS-E07 ⭐ une série dont la charge a été volontairement VIDÉE reste vide (non renseignée — la personne l\'a voulu ; l\'historique la suggère en grisé, il ne la remplit pas), l\'autre série du même exercice garde la progression (16)', w3.exs[4].sets[1].kg === null && w3.exs[4].sets[0].kg === 16, js(w3.exs[4].sets.map(s => s.kg)));

    // E8 — RENOMMER un jour dans l'éditeur garde l'identité ET les retouches ; l'historique ne bouge pas
    const histAvant = await pg.evaluate(() => JSON.stringify(S.sessions));
    await edit(0, '() => { _setProgDayLabel(0, "HAUT — lourd renommé"); }');
    const pr = await prog(0), wn = await charge(0, 0);
    t('SCHIS-E08 ⭐ renommer le jour dans l\'éditeur garde son identité et ses retouches (la 2ᵉ série vidée le reste) ; il retrouve toujours SA séance ; aucune séance de l\'historique n\'a bougé',
      pr.days[0].label === 'HAUT — lourd renommé' && wn.progDayId === pr.days[0].id && wn.exs[4].sets[1].kg === null && wn.exs[1].sets[2].kg === 111 && (await pg.evaluate(() => JSON.stringify(S.sessions))) === histAvant, js({ id: pr.days[0].id, wkt: wn.progDayId }));

    // E9 — un programme d'AVANT (sans `prescrit`) : la retouche est prioritaire AUSSI, pour ses seuls champs ; RÉÉCRIT LE 16/11/2026 (D-163) : les autres séries ne reprennent plus « l'historique de l'exercice » d'ailleurs (77) mais SA prescription (30)
    const leg = await pg.evaluate(async () => {
      H.raz([{ id: 'p-anc2', name: 'Programme ancien fictif', weeks: 0, startDate: '', days: [{ label: 'JOUR A', exs: [{ name: 'Zorglub Presse Quantique', note: '', sets: [{ kg: 30, reps: 10, type: 'N', rest: 0 }, { kg: 30, reps: 10, type: 'N', rest: 0 }, { kg: 30, reps: 10, type: 'N', rest: 0 }] }] }] }], H.hostile(['Zorglub Presse Quantique']));
      await new Promise(r => setTimeout(r, 25));
      editProg(0); _setProgSetKg(0, 0, 1, '32.5'); saveProgEdit();
      const w = H.charge(0), p = S.programmes[0];
      return { kg: w.exs[0].sets.map(s => s.kg).join(), reps: w.exs[0].sets.map(s => s.reps).join(), prescrit: p.prescrit || null, id: p.days[0].id || null };
    });
    t('SCHIS-E09 ⭐⭐ D-168 sur un programme d\'AVANT : seule la série retouchée (2ᵉ : 32,5) diffère ; les deux autres gardent la prescription du programme (30 — AVANT : l\'historique d\'un autre contexte, 77) ; aucun `prescrit` n\'est ajouté (aucune migration)', leg.kg === '30,32.5,30' && leg.reps === '10,10,10' && leg.prescrit === null && !!leg.id, js(leg));

    // E10 — DÉPLACER une série emporte sa retouche (D-171 × D-168)
    const dep = await pg.evaluate(async () => {
      H.raz([{ id: 'p-dep', name: 'Programme fictif déplacements', prescrit: true, days: [{ label: 'D', exs: [{ name: 'Mon Exo Perso Fictif', note: '', sets: [{ kg: 10, reps: 10, type: 'N', rest: 0 }, { kg: 20, reps: 10, type: 'N', rest: 0 }, { kg: 30, reps: 10, type: 'N', rest: 0 }] }] }] }], []);
      await H.fait(0, 0, [[0, 0, 11, 10], [0, 1, 21, 10], [0, 2, 31, 10]]);
      await new Promise(r => setTimeout(r, 25));
      editProg(0); _setProgSetKg(0, 0, 2, '35'); _moveProgSet(0, 0, 2); saveProgEdit();   // la 3ᵉ série (retouchée à 35) monte en 2ᵉ position
      const p = JSON.parse(JSON.stringify(S.programmes[0])), w = H.charge(0);
      return { kgs: p.days[0].exs[0].sets.map(s => s.kg).join(), eds: p.days[0].exs[0].sets.map(s => s.ed ? 'ed' : '-').join(), w: w.exs[0].sets.map(s => s.kg).join() };
    });
    /* ⚠️ RÉÉCRIT LE 16/11/2026 (D-163 × D-168 × D-171) : l'ancien oracle attendait « les autres reprennent la séance faite par RANG (11 · 35 · 31) » — la 3ᵉ POSITION (devenue la série de 20) recevait le 31 de la série de 30 : deux séries MÉLANGÉES par un
       déplacement. La décision dit l'inverse (« préserver les identités lors du déplacement ») : chaque série garde SON historique. Invariant gardé : la retouche voyage avec la série et prime sur la séance. */
    t('SCHIS-E10 ⭐⭐ une série retouchée puis DÉPLACÉE garde sa retouche (elle voyage entière) : l\'ordre devient 10 · 35 · 20, la retouche suit la série (35 en 2ᵉ position) ET chaque autre série garde SON historique (11 pour la série de 10, 21 pour la série de 20 — jamais le 31 de la série déplacée)', dep.kgs === '10,35,20' && dep.eds === '-,ed,-' && dep.w === '11,35,21', js(dep));
  });

  // ═══ D. L'ÉDITEUR PAR SÉRIE (D-171) · RIEN DE PRÉCOCHÉ À L'IMPORT (D-165) · LE REGROUPEMENT ÉCHAUFFEMENT + TRAVAIL (D-167) ═══
  await section('D', async () => {
    const PE = () => ({ id: 'p-ed', name: 'Programme fictif éditeur', prescrit: true, days: [{ label: 'JOUR ÉDITEUR', exs: [EXO(N_INED, [SE(20, 10, 'N', 60), SE(25, 8, 'N', 90), SE(30, 6, 'N', 120)])] }] });
    await raz([PE()], null);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); editProg(0); });
    const ROW = si => '.prog-ex-card[data-di="0"][data-ei="0"] .pe-row[data-si="' + si + '"]';
    const CH = (si, ch) => ROW(si) + ' [data-ch="' + ch + '"]';
    const sets = () => pg.evaluate(() => JSON.parse(JSON.stringify(_editProgData.days[0].exs[0].sets)));
    const note = () => pg.evaluate(() => _editProgData.days[0].exs[0].note || '');
    const saisir = async (sel, v) => { const l = pg.locator(sel); await l.fill(v); await l.blur(); };
    // 1. modifier la charge, les répétitions, le repos ; 2. le type ; 3. le commentaire — par les vrais gestes
    await saisir(CH(1, 'kg'), '27,5'); await saisir(CH(1, 'reps'), '9'); await saisir(CH(1, 'rest'), '100');
    await pg.locator(CH(0, 'type')).click();
    await pg.locator('.prog-ex-card[data-di="0"][data-ei="0"] textarea').fill('Dos calé, cran 4 — consigne fictive');
    const s1 = await sets();
    t('SCHIS-D01 ⭐ D-171 — par série : la charge (27,5), les répétitions (9), le repos (100 s), le TYPE (N → É) et le commentaire se modifient aux vrais gestes ; seule la série touchée change', s1[1].kg === 27.5 && s1[1].reps === 9 && s1[1].rest === 100 && s1[0].type === 'É' && s1[2].kg === 30 && s1[2].reps === 6 && (await note()) === 'Dos calé, cran 4 — consigne fictive', js(s1));
    // 4. ajouter une série puis la supprimer (la suppression individuelle existe déjà : elle n'est pas réécrite, seulement observée)
    await pg.locator('.prog-ex-card[data-di="0"][data-ei="0"] button', { hasText: '+ série' }).click();
    const nPlus = (await sets()).length;
    await pg.locator(CH(3, 'supprimer')).click();
    await pg.locator(CH(0, 'supprimer')).click();
    const s2 = await sets();
    t('SCHIS-D02 ⭐ D-171 — AJOUTER une série (3 → 4) puis SUPPRIMER individuellement la nouvelle puis la 1ʳᵉ (4 → 3 → 2) : la suppression d\'une série ne retire que CETTE série (restent 27,5 et 30)', nPlus === 4 && s2.length === 2 && s2[0].kg === 27.5 && s2[1].kg === 30, js({ nPlus, restent: s2.map(s => s.kg) }));
    // 5. DÉPLACER : le numéro d'une série (dès la 2ᵉ) la monte d'un cran ; la 1ʳᵉ n'a pas de monte
    const premier = await pg.evaluate(() => document.querySelector('.prog-ex-card[data-di="0"][data-ei="0"] .pe-row[data-si="0"] [data-ch="num"]').tagName);
    await pg.locator(CH(1, 'num')).click();
    const s3 = await sets();
    t('SCHIS-D03 ⭐⭐ D-171 — DÉPLACER une série : toucher le numéro de la 2ᵉ série (30 kg) la monte en 1ʳᵉ position (30 · 27,5), avec toutes ses valeurs (charge, reps, repos, type) ; la 1ʳᵉ ligne n\'a pas de bouton de montée', s3[0].kg === 30 && s3[0].reps === 6 && s3[0].rest === 120 && s3[1].kg === 27.5 && s3[1].reps === 9 && s3[1].rest === 100 && premier === 'SPAN', js({ s3: s3.map(s => [s.kg, s.reps, s.rest]), premier }));
    // 6. rien n'est écrit avant « Enregistrer » ; l'historique n'est jamais touché
    const avantEnr = await pg.evaluate(() => JSON.stringify(S.programmes[0].days[0].exs[0].sets.map(s => s.kg)));
    await pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-prog-edit button')].find(x => /Enregistrer/.test(x.textContent)); bt.click(); });
    const apresEnr = await pg.evaluate(() => JSON.stringify(S.programmes[0].days[0].exs[0].sets.map(s => s.kg)));
    t('SCHIS-D04 ⛔ rien n\'est écrit dans le programme avant « Enregistrer » (20 · 25 · 30 intacts pendant l\'édition) ; après : 30 · 27,5, et le commentaire suit', avantEnr === '[20,25,30]' && apresEnr === '[30,27.5]' && (await pg.evaluate(() => S.programmes[0].days[0].exs[0].note)) === 'Dos calé, cran 4 — consigne fictive', avantEnr + ' → ' + apresEnr);
    // D-165 — rien de précoché : le mode d'import par défaut ne remplace rien ; « Remplacer » n'a aucune cible d'office ; aucun programme existant ne perd son début de cycle à un import « Nouveau »
    const imp = await pg.evaluate(() => {
      H.raz([{ id: 'p-cycle', name: 'Programme en cours fictif', prescrit: true, weeks: 8, startDate: H.iso(10), days: [{ label: 'X', exs: [{ name: 'Curl Haltères', note: '', sets: [{ kg: 10, reps: 10, type: 'N', rest: 0 }] }] }] }], []);
      openImportProg();
      _impExtracted = { name: 'Programme importé fictif', weeks: 6, startDate: '', days: [{ label: 'JOUR 1', exercises: [{ name: 'Curl Haltères', sets: 2, reps: 10, repsPerSet: [10, 10], specialSets: [], kg: 0, kgPerSet: [], supersetGroup: '', setType: '', note: '' }] }] };
      const av = JSON.stringify(S.programmes[0]);
      const sel = document.getElementById('imp-replace-sel');
      const etat = { modeInitial: _impMode, selVisible: getComputedStyle(sel).display !== 'none', cochees: document.querySelectorAll('#ov-import-prog input:checked').length };   // l'état À L'OUVERTURE : ce que l'écran propose avant tout geste
      finalImportProg();
      return { etat, nbProgs: S.programmes.length, ancienIntact: JSON.stringify(S.programmes[0]) === av, importe: S.programmes[1] && S.programmes[1].prescrit === true, debut: S.programmes[1] && S.programmes[1].startDate };
    });
    t('SCHIS-D05 ⭐ D-165 — rien n\'est précoché ni imposé : le mode « Nouveau » (qui ne remplace rien) est le défaut, la liste « Remplacer » n\'est pas montrée, aucune case n\'est cochée ; l\'import « Nouveau » AJOUTE un programme (2), laisse le cycle en cours INTACT (début, 8 semaines) et n\'impose aucune date de début au nouveau (aucune écrite : sans date)',
      imp.etat.modeInitial === 'new' && imp.etat.selVisible === false && imp.etat.cochees === 0 && imp.nbProgs === 2 && imp.ancienIntact && imp.importe === true && !imp.debut, js(imp));

    // D-167 — après avoir ACCEPTÉ une proposition de regroupement, les numéros des séries « en couleur » suivent la fusion (3ᵉ et 4ᵉ série de l'exercice regroupé, pas 1ʳᵉ et 2ᵉ)
    const rg = await pg.evaluate(async () => {
      H.raz([], []);
      const EX = (name, n, spec, note) => ({ name, sets: n, reps: 8, repsPerSet: Array(n).fill(8), specialSets: spec, kg: 0, kgPerSet: Array(n).fill(40), supersetGroup: '', setType: '', note });
      _impExtracted = { name: 'Programme regroupement fictif', weeks: 0, startDate: '', days: [{ label: 'JOUR G', exercises: [EX('Presse Zeta Prototype - échauffement', 2, [], ''), EX('Presse Zeta Prototype / haltères', 3, [0, 1], 'Séries lourdes')] }] };
      _impOuverts && _impOuverts.clear && _impOuverts.clear();
      _mergeImportBlocsEch(); _impConserverSpeciales();
      const avant = _impExtracted.days[0].exercises.map(e => e.name + '|' + e.note);
      const prop = _impExtracted.days[0].exercises.some(e => e._propGrp);
      if (prop) impGrouperEch(0, 1);
      const ex = _impExtracted.days[0].exercises;
      return { prop, avant, apres: ex.map(e => ({ n: e.name, note: e.note, nb: (e.repsPerSet || []).length })) };
    });
    t('SCHIS-D06 ⭐ D-167 — « Regrouper » une proposition (échauffement 2 séries + travail 3 séries dont les 1ʳᵉ et 2ᵉ « en couleur ») : l\'exercice regroupé a 5 séries et sa note dit n° 3, 4 (les rangs de la fusion), pas n° 1, 2 (ceux de la ligne d\'origine)',
      rg.prop === true && rg.apres.length === 1 && rg.apres[0].nb === 5 && /Séries en couleur dans le document : n° 3, 4/.test(rg.apres[0].note) && !/n° 1, 2/.test(rg.apres[0].note), js(rg));
  });

  // ═══ I (suite). LES NOUVELLES DONNÉES VOYAGENT : le VRAI Code.js les rend telles quelles, la restauration les reprend (R4 — un copieur qui ne les nomme pas les supprimerait) ═══
  await section('V', async () => {
    await raz([PROG_A()], NOMS);
    await fait(0, 0, FAIT_LOURD);
    await pg.waitForTimeout(25);
    await pg.evaluate(() => { editProg(0); _setProgSetKg(0, 1, 2, '110'); saveProgEdit(); });
    POSTS.length = 0;
    await pg.evaluate(() => { S.email = 'schis@example.test'; S.url = DEFAULT_URL; window._demoMode = false; });
    await pg.evaluate(() => { try { _cloudSync(); } catch (e) {} }); await pg.waitForTimeout(1200);
    const etat = await pg.evaluate(() => ({ programmes: JSON.parse(JSON.stringify(S.programmes)), sessions: JSON.parse(JSON.stringify(S.sessions)) }));
    const corps = POSTS.slice().reverse().find(c => c && c.action === 'saveProfile');
    const { serveur } = require('./nut_secu_p1.js');
    const X = serveur({}); const EM = 'schis@example.test';
    let lu = {}, rep = {};
    if (corps) { X.compte(EM); corps.email = EM; rep = X.post(corps); lu = X.lireCompte(EM) || {}; }
    const sans = a => JSON.parse(JSON.stringify(a || null, (k, v) => k === 'synced' ? undefined : v));
    const same = (a, c) => JSON.stringify(sans(a)) === JSON.stringify(sans(c));
    t('SCHIS-V01 ⭐⭐ la SYNCHRONISATION (le vrai corps de `_cloudSync`, le vrai `Code.js`) rend EXACTEMENT ce qu\'elle a reçu : l\'identité du jour (`id`), la séance rattachée (`progDayId`) et la retouche (`ed`) sont conservées — aucun champ supprimé par un copieur',
      !!corps && (rep.j || {}).status === 'ok' && same(lu.programmes, etat.programmes) && same(lu.sessions, etat.sessions) && !!(lu.programmes || [])[0].days[0].id && !!(lu.sessions || [])[0].progDayId && !!(lu.programmes || [])[0].days[0].exs[1].sets[2].ed,
      js({ corps: !!corps, statut: (rep.j || {}).status, progs: same(lu.programmes, etat.programmes), seances: same(lu.sessions, etat.sessions) }));
    const rest = await pg.evaluate((cmp) => { S.programmes = []; S.sessions = []; S.prs = {}; persist();
      try { _applyRestoreData(Object.assign({}, cmp, { profile: Object.assign({ name: 'Testeur', bw: 80, age: 35, gender: 'H', goal: 'force' }, cmp.profile || {}) })); } catch (e) { return { err: String(e && e.message || e) }; }
      const w = H.charge(0, 0); return { err: null, id: S.programmes[0].days[0].id, pdi: S.sessions[0].progDayId, sq: w.exs[1].sets.map(s => s.kg).join() }; }, lu);
    t('SCHIS-V02 ⭐ la RESTAURATION reprend identité, séance rattachée et retouche : le jour restauré retrouve SA séance, et la retouche (110) passe encore avant elle (la séance est antérieure)', !rest.err && rest.id === rest.pdi && rest.sq === '65,102.5,110,105', js(rest));
  });

  // ═══ Z. RÈGLE D'OR #9 — le bouton central « + » Séance ne bouge pas (on le MESURE) : écran d'accueil, puis écran Séance avec un jour de programme chargé (et son historique repris) ═══
  await section('Z', async () => {
    await raz([PROG_A()], NOMS);
    await fait(0, 0, FAIT_LOURD);
    const rect = () => pg.evaluate(() => { const e = document.getElementById('nb-log'); const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(x => Math.round(x * 10) / 10); });
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); S.wkt = null; goScreen('home', document.getElementById('nb-home')); });
    const a = await rect();
    await pg.evaluate(() => { H.charge(0, 0); goScreen('log', document.getElementById('nb-log')); renderExBlocks(); });
    await pg.waitForTimeout(300);
    const b2 = await rect();
    t('SCHIS-Z01 ⭐ règle d\'or #9 — le bouton central « + » Séance de la barre du bas ne bouge pas (position et taille MESURÉES identiques sur l\'accueil et sur l\'écran Séance chargé d\'un jour de programme, historique repris)', js(a) === js(b2) && a[2] > 40, js({ accueil: a, seance: b2 }));
  });

  t('SCHIS-Z00 aucune erreur JavaScript pendant tout le banc', errs.length === 0, errs.slice(0, 3).join(' | '));
  await cx.close();
};
