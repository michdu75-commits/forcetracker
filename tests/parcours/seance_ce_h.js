/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   🔁 LOT 1 « CONTRE-EXPERTISE » (16/11/2026) — D-163 TOUS LES PROGRAMMES · D-168 UNE RETOUCHE, UN CHAMP (REPOS COMPRIS) · D-171 LE COMMENTAIRE PAR SÉRIE (blocs B-SCCH-*)
   Claude N°2 (Séance), mission corrective du 16/11/2026. Sondes de la contre-expertise : H02 · H03 · H05 · H09 · H12 (à rendre conformes) ; H01 · H04 · H06 · H08 · H10 · H11 (à ne pas régresser) ; H07 (repli : ARBITRÉ le 17/11/2026 — la prescription, jamais une séance plus ancienne).
   Chaîne conduite : vrai Chromium 390 × 844 (et 375 × 812 pour les cibles tactiles) → l'éditeur de programme (VRAIS gestes : clics, saisie, glisser à la souris) → `_loadProgDayVraiment` / `_loadProgVraiment` → `finishWorkout` (la VRAIE
   séance enregistrée) → le chargement suivant ; programmes de Milo : VRAIES fonctions `_normalizeForceProg` / `_saveForceProgram` sur une réponse FICTIVE (aucun appel modèle) ; serveur : le VRAI `Code.js` (vm Node, services simulés) pour l'aller-retour.
   ⛔ AUCUN NOM D'EXERCICE NE DÉCIDE : six familles — haltères, barre, machine, poids du corps, exercice PERSONNALISÉ (`S.customExercises`) et exercice FICTIF INÉDIT absent du catalogue.
   ⛔ Données 100 % INVENTÉES. 0 appel réel. Dates RELATIVES (jamais en dur) ; les bilans qui s'ouvrent seuls (lundi, mois écoulé) sont posés « annoncés » ; les horloges AVANCENT (chaque séance enregistrée attend 14 ms, chaque retouche 25 ms de plus que la précédente).
   NE COUVRE PAS : Safari iOS (Chromium ≠ iPhone) ; la manière dont la personne VOIT le grisé et « Précédent » ; le cardio (un bloc de durée, sans séries).
   Banc : tools/banc_seance_ce_h.js · contrôle négatif : tools/mut_seance_ce_h.py
   Préfixes : SCCH-A (D-163 tous programmes · chronologie · homonymes) · SCCH-B (D-168 repos) · SCCH-C (D-171 commentaire par série · cibles tactiles) · SCCH-V (aller-retour serveur) · SCCH-Z (règle d'or #9)
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE_LS = { ft4_ob2: '1', ft4_name: 'Testeur', ft4_premium: 'true', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '130' };
const clone = x => JSON.parse(JSON.stringify(x));
const js = x => String(JSON.stringify(x)).slice(0, 700);
const SE = (kg, reps, type, rest, extra) => Object.assign({ kg, reps, type: type || 'N', rest: rest || 0 }, extra || {});
const EXO = (name, sets, extra) => Object.assign({ name, note: '', sets }, extra || {});
/* Les six FAMILLES : haltères · barre · machine · poids du corps · exercice PERSONNALISÉ · exercice FICTIF INÉDIT (absent du catalogue). */
const N_HAL = 'Curl Haltères', N_BAR = 'Squat à la Barre', N_MAC = 'Leg Curl Assis Machine', N_PDC = 'Traction', N_PERSO = 'Mon Exo Perso Fictif', N_INED = 'Zorglub Presse Quantique';
const NOMS = [N_HAL, N_BAR, N_MAC, N_PDC, N_PERSO, N_INED];
const JOUR = (label) => ({ label, exs: [
  EXO(N_HAL, [SE(20, 10, 'N', 60), SE(20, 10, 'N', 60), SE(20, 10, 'N', 60)]),
  EXO(N_BAR, [SE(60, 8, 'É', 60), SE(100, 5, 'N', 120), SE(100, 5, 'N', 120)]),
  EXO(N_MAC, [SE(40, 12, 'N', 90), SE(40, 12, 'N', 90)]),
  EXO(N_PDC, [SE(0, 8, 'N', 90), SE(0, 8, 'N', 90)]),
  EXO(N_PERSO, [SE(15, 12, 'N', 75), SE(15, 12, 'N', 75)]),
  EXO(N_INED, [SE(30, 10, 'N', 100), SE(30, 10, 'N', 100)])] });
const KGS = w => w.exs.map(e => e.sets.map(s => s.kg).join(','));
const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/* la prescription attendue du JOUR(…) : une chaîne par exercice « kg1,kg2,… » */
const PRESC = () => JOUR('x').exs.map(e => e.sets.map(s => s.kg).join(','));
/* ce que la personne « fait » (écarts voulus) : [exercice, série, charge, reps, repos?] */
const FAIT = [[0, 0, 22.5, 9], [0, 1, 22.5, 9], [0, 2, 22.5, 8], [1, 0, 65, 7], [1, 1, 102.5, 5], [1, 2, 102.5, 5], [2, 0, 42.5, 11], [2, 1, 42.5, 10], [3, 0, 0, 9], [3, 1, 0, 8], [4, 0, 16, 12], [4, 1, 16, 11], [5, 0, 32.5, 10], [5, 1, 32.5, 9]];
const APRES_FAIT = ['22.5,22.5,22.5', '65,102.5,102.5', '42.5,42.5', '0,0', '16,16', '32.5,32.5'];

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-SCCH. LOT 1 — D-163 TOUS LES PROGRAMMES · D-168 REPOS · D-171 COMMENTAIRE PAR SÉRIE (l\'app conduite) ═══');
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
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_scch'))return; sessionStorage.setItem('_scch','1'); localStorage.clear();
    const D=${JSON.stringify(BASE_LS)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2500);
  const section = async (nom, fn) => { console.log('\n─── B-SCCH-' + nom + ' ───'); try { await fn(); } catch (e) { t('SCCH-' + nom + ' ⛔ la section n\'a pas pu aller au bout', false, String(e && e.message || e).slice(0, 300)); } };

  const poserH = () => pg.evaluate(() => {
    const iso = d => { const x = new Date(Date.now() - d * 864e5); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
    window.H = {
      iso,
      /** Repart d'un compte vierge (exercice personnalisé déclaré, bilans « annoncés ») avec un historique donné. */
      raz(progs, hist) {
        document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
        S.customExercises = [{ n: 'Mon Exo Perso Fictif', g: 'Dos', custom: true }];
        S.programmes = progs || []; S.sessions = hist || []; S.wkt = null; S.prs = {}; S.exRestPref = {}; S.defRest = 130;
        const t = today(), pm = new Date(Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 2, 15));
        S.lastWeekSummary = t; S.lastMonthSummary = pm.getUTCFullYear() + '-' + String(pm.getUTCMonth() + 1).padStart(2, '0');
        persist();
      },
      /** L'historique d'AILLEURS : les mêmes exercices, d'autres valeurs, sans programme OU d'un AUTRE programme. */
      hostile(noms, progId, kg) { return [{ id: 1, ts: Date.now() - 9 * 864e5, date: iso(9), progLabel: 'Séance libre', ...(progId ? { progId, progDayId: 'j-autre' } : {}), exs: noms.map(n => ({ name: n, sets: [0, 1, 2, 3].map(() => ({ kg: kg || 77, reps: 7, type: 'N', done: true })) })), volume: 1, synced: true, uniConv: 1 }]; },
      charge(i, j) { S.wkt = null; if (S.programmes[i].days && S.programmes[i].days.length) _loadProgDayVraiment(i, j || 0); else _loadProgVraiment(i); return JSON.parse(JSON.stringify(S.wkt)); },
      /** Fait un jour (charge → ajustements [[ex, série, kg, reps, repos?]] → séries validées → VRAIE séance enregistrée) ; rend la séance enregistrée (la dernière ENREGISTRÉE). `date` : une date de séance autre qu'aujourd'hui. */
      async fait(i, j, aj, sauf, date) {
        H.charge(i, j);
        (aj || []).forEach(([ei, si, kg, reps, rest]) => { const s = S.wkt.exs[ei].sets[si]; if (kg != null) s.kg = kg; if (reps != null) s.reps = reps; if (rest != null) s.rest = rest; });
        S.wkt.exs.forEach((e, ei) => e.sets.forEach(s => { s.done = (sauf || []).indexOf(ei) < 0; }));
        if (date) S.wkt.date = date;
        await finishWorkout(); await new Promise(r => setTimeout(r, 14));
        return JSON.parse(JSON.stringify(S.sessions.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0))[0]));
      },
      prog(i) { return JSON.parse(JSON.stringify(S.programmes[i])); }
    };
  });
  await poserH();
  const raz = (progs, hist) => pg.evaluate(([p, h]) => { H.raz(p, h); }, [progs, hist || null]);
  const hostile = (noms, progId, kg) => pg.evaluate(([n, p, k]) => H.hostile(n, p, k), [noms, progId || null, kg || null]);
  const charge = (i, j) => pg.evaluate(([i, j]) => H.charge(i, j), [i, j || 0]);
  const fait = (i, j, aj, sauf, date) => pg.evaluate(([i, j, a, s, d]) => H.fait(i, j, a, s, d), [i, j || 0, aj || null, sauf || null, date || null]);
  const prog = i => pg.evaluate(i => H.prog(i), i);
  const lu = w => KGS(w);

  // ═══ A. D-163 — TOUS LES PROGRAMMES : 1ᵉʳ chargement = prescriptions ; ensuite la dernière séance TERMINÉE du même programme ET du même jour ═══
  await section('A', async () => {
    // A01 — H02 : un programme SANS le drapeau « prescrit » (créé à la main avant la règle, d'avant l'import) + l'historique d'un AUTRE programme (80) et sans programme (77) sur les mêmes noms
    const NONP = () => ({ id: 'p-scch-nonp', name: 'Programme fictif non marqué', weeks: 0, startDate: '', days: [JOUR('JOUR A'), JOUR('JOUR B')] });
    const hist = (await hostile(NOMS, 'p-scch-autre', 80)).concat(await hostile(NOMS, null, 77).then(h => { h[0].id = 2; h[0].ts += 1; return h; }));
    await raz([NONP()], hist);
    const avant = JSON.stringify(await pg.evaluate(() => S.sessions));
    const w1 = await charge(0, 0);
    t('SCCH-A01 ⭐⭐ H02 / D-163 — un programme NON MARQUÉ « prescrit » s\'ouvre, au 1ᵉʳ chargement, avec SES prescriptions (6 familles : haltères · barre · machine · poids du corps · personnalisé · fictif inédit) — malgré la charge 80 d\'un AUTRE programme et 77 d\'une séance libre sur les mêmes noms',
      egal(lu(w1), PRESC()), js({ lu: lu(w1), att: PRESC() }));
    t('SCCH-A02 ⭐ … et rien n\'est écrit dans le passé : aucune séance de l\'historique n\'a bougé (ouvrir un jour ne réécrit aucune séance), aucun `prescrit` n\'est ajouté au programme',
      JSON.stringify(await pg.evaluate(() => S.sessions)) === avant && !(await prog(0)).prescrit, '');
    const s1 = await fait(0, 0, FAIT);
    const w2 = await charge(0, 0), wB = await charge(0, 1);
    t('SCCH-A03 ⭐⭐ … puis la dernière séance TERMINÉE de CE jour (22,5 · 65 · 102,5 · 42,5 · 0 · 16 · 32,5) ; le jour B du MÊME programme, jamais fait, reste à SA prescription', egal(lu(w2), APRES_FAIT) && egal(lu(wB), PRESC()) && s1.progId === 'p-scch-nonp' && !!s1.progDayId, js({ w2: lu(w2), wB: lu(wB) }));

    // A04 — un programme TRÈS ancien : ni `id` de programme, ni `prescrit`, ni identité de jour ; ses séances d'avant (sans `progId`) ne lui sont rattachées à aucun jour
    const ANC = () => ({ name: 'Programme très ancien fictif', days: [JOUR('LUNDI'), JOUR('JEUDI')] });
    await raz([ANC()], (await hostile(NOMS, null, 77)));
    const wa = await charge(0, 0);
    const pa = await prog(0);
    t('SCCH-A04 ⭐⭐ un programme TRÈS ancien (aucun `id`, aucun `prescrit`) s\'ouvre avec SA prescription (jamais la séance libre d\'avant : 77) ; il reçoit ses identités (programme, jour) à ce chargement, la séance chargée les porte',
      egal(lu(wa), PRESC()) && !!pa.id && !!pa.days[0].id && !pa.days[1].id && wa.progId === pa.id && wa.progDayId === pa.days[0].id, js({ lu: lu(wa), id: pa.id, d: pa.days.map(d => d.id || null) }));
    await fait(0, 0, FAIT);
    const wb = await charge(0, 0);
    t('SCCH-A05 ⭐ … sa séance terminée est alors reprise (même règle, aucune migration) ; le 2ᵉ jour (jamais fait) garde sa prescription', egal(lu(wb), APRES_FAIT) && egal(lu(await charge(0, 1)), PRESC()), js(lu(wb)));
    // programme ancien à UN SEUL jour (`exs`, sans `days`)
    await raz([{ name: 'Programme ancien un jour', exs: JOUR('X').exs }], (await hostile(NOMS, null, 77)));
    const wu = await charge(0);
    await fait(0, 0, FAIT);
    const wu2 = await charge(0);
    t('SCCH-A06 ⭐ un programme ancien à UN SEUL jour : 1ᵉʳ usage = sa prescription (jamais 77), puis sa dernière séance faite', egal(lu(wu), PRESC()) && egal(lu(wu2), APRES_FAIT) && !!wu.progId, js({ a: lu(wu), b: lu(wu2) }));

    // A07 — H03 : un programme de MILO — VRAIES fonctions de normalisation et de sauvegarde sur une réponse FICTIVE (aucun appel modèle)
    const mi = await pg.evaluate(() => {
      H.raz([], H.hostile(['Squat à la Barre', 'Curl Haltères', 'Zorglub Presse Quantique'], 'p-scch-autre', 80));
      const rep = { name: 'Programme fictif de Milo', days: [{ label: 'Jour 1 — Bas', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 110, reps: 5, type: 'N', rest: 180 }, { kg: 110, reps: 5, type: 'N', rest: 180 }] }, { name: 'Zorglub Presse Quantique', sets: [{ kg: 35, reps: 10, type: 'N', rest: 90 }] }] }, { label: 'Jour 2 — Haut', exs: [{ name: 'Curl Haltères', sets: [{ kg: 14, reps: 10, type: 'N', rest: 60 }] }] }] };
      const m = _normalizeForceProg(rep); _pendingForceProgs = [m]; S.programmes = []; _saveForceProgram(0, null);
      const p = JSON.parse(JSON.stringify(S.programmes[0]));
      const w = H.charge(0, 0);
      return { prescrit: !!p.prescrit, kg: w.exs.map(e => e.sets.map(s => s.kg).join(',')), progId: w.progId === p.id };
    });
    t('SCCH-A07 ⭐⭐ H03 / D-163 — un programme de MILO (normalisation et sauvegarde RÉELLES, réponse fictive, aucun appel modèle) reste « prescrit » et s\'ouvre avec les charges de Milo (110 · 110 / 35), malgré 80 ailleurs', mi.prescrit === true && egal(mi.kg, ['110,110', '35']) && mi.progId === true, js(mi));

    // A08 — un programme GÉNÉRÉ (parcours débutant : l'outil réel `createBeginnerProg`)
    const bg = await pg.evaluate(async () => {
      H.raz([], H.hostile(['Chest Press Machine Horizontale', 'Press Jambes 45°', 'Gainage'], 'p-scch-autre', 77));
      S.gender = 'H'; S.level = 'debutant'; _bgStyle = 'fullbody'; _bgFreq = 3; _bgMatos = 'machines';
      createBeginnerProg();
      const p = S.programmes[S.programmes.length - 1], i = S.programmes.length - 1;
      const w = H.charge(i, 0);
      const premiers = w.exs.slice(0, 2).map(e => e.sets.map(s => s.kg).join(','));
      w.exs.forEach(e => e.sets.forEach(s => { s.kg = 12; s.done = true; })); S.wkt = w; await finishWorkout(); await new Promise(r => setTimeout(r, 14));
      const w2 = H.charge(i, 0);
      return { prescrit: p.prescrit || null, premiers, apres: w2.exs.slice(0, 2).map(e => e.sets.map(s => s.kg).join(',')), ids: !!p.id && !!p.days[0].id };
    });
    t('SCCH-A08 ⭐ un programme GÉNÉRÉ (l\'outil réel `createBeginnerProg`) suit la même règle : 1ᵉʳ usage = sa prescription (charges vides : INCONNUES, jamais 77 d\'ailleurs — ORACLE ADAPTÉ le 18/11/2026, lot Z : « sans source, pas de zéro inventé », la prescription d\'un programme généré porte `null`, affiché vide, au lieu de 0) ; une fois le jour fait, sa dernière séance (12 kg) — aucun `prescrit` ajouté', egal(bg.premiers, [',,', ',,']) && egal(bg.apres, ['12,12,12', '12,12,12']) && bg.ids && bg.prescrit === null, js(bg));

    // A09 — H05 : la CHRONOLOGIE réelle, pas l'ordre du tableau. Un tableau d'historique NON trié (la séance la plus ancienne en tête) ; trois variantes — même date / dates différentes / date absente
    const SEQ = (progId, dayId, ts, date, kg) => ({ id: ts, ts, date, progId, progDayId: dayId, progLabel: 'JOUR A', exs: [{ name: N_HAL, sets: [{ kg, reps: 8, type: 'N', done: true }] }], volume: 1, synced: true, uniConv: 1 });
    const chrono = await pg.evaluate(([n]) => {
      const out = {};
      const P = () => ({ id: 'p-chr', name: 'Chrono', days: [{ id: 'j-chr', label: 'JOUR A', exs: [{ name: n, note: '', sets: [{ kg: 20, reps: 8, type: 'N', rest: 0 }] }] }] });
      const mk = (ts, date, kg) => ({ id: ts, ts, date, progId: 'p-chr', progDayId: 'j-chr', progLabel: 'JOUR A', exs: [{ name: n, sets: [{ kg, reps: 8, type: 'N', done: true }] }], volume: 1, synced: true, uniConv: 1 });
      const t0 = Date.now(), j = k => H.iso(k);
      const essai = (hist) => { H.raz([P()], hist); const av = JSON.stringify(S.sessions); const w = H.charge(0, 0); return { kg: w.exs[0].sets[0].kg, intact: av === JSON.stringify(S.sessions) }; };
      out.memeDate = essai([mk(t0 - 5000, j(2), 90), mk(t0 - 1000, j(2), 105)]);              // même date : l'enregistrement le plus tardif d'abord… ici l'ordre est INVERSÉ (le plus ancien en tête)
      out.memeDateOrdreNormal = essai([mk(t0 - 1000, j(2), 105), mk(t0 - 5000, j(2), 90)]);
      out.dates = essai([mk(t0 - 9 * 864e5, j(9), 90), mk(t0 - 3 * 864e5, j(3), 105), mk(t0 - 20 * 864e5, j(20), 70)]);   // dates différentes, ordre quelconque
      const sansTs = mk(0, j(1), 105); delete sansTs.ts; sansTs.id = 5;                            // une séance sans `ts` (ancienne) mais PLUS RÉCENTE par sa date
      out.sansTs = essai([mk(t0 - 6 * 864e5, j(6), 90), sansTs]);
      return out;
    }, [N_HAL]);
    t('SCCH-A09 ⭐⭐ H05 / D-163 — la dernière séance se lit dans la CHRONOLOGIE RÉELLE (date réalisée, puis ordre d\'enregistrement), pas dans l\'ordre du tableau : un tableau non trié (la plus ancienne en tête, même date ou dates différentes, avec une séance sans `ts`) donne toujours la séance la plus RÉCENTE (105) ; le tableau n\'est jamais réordonné ni modifié',
      chrono.memeDate.kg === 105 && chrono.memeDateOrdreNormal.kg === 105 && chrono.dates.kg === 105 && chrono.sansTs.kg === 105 && [chrono.memeDate, chrono.memeDateOrdreNormal, chrono.dates, chrono.sansTs].every(x => x.intact), js(chrono));

    // A10 — la chronologie par la VRAIE fin de séance : une séance ENREGISTRÉE en dernier mais DATÉE plus tôt (le sélecteur de date) n'est pas « la dernière »
    await raz([{ id: 'p-scch-date', name: 'Programme fictif dates', days: [JOUR('JOUR A')] }], []);
    await fait(0, 0, [[0, 0, 30, 8]], null, null);              // aujourd'hui : 30
    await pg.waitForTimeout(25);
    await fait(0, 0, [[0, 0, 18, 8]], null, await pg.evaluate(() => H.iso(6)));   // enregistrée PLUS TARD, mais datée d'il y a 6 jours : 18
    const wd = await charge(0, 0);
    t('SCCH-A10 ⭐ une séance enregistrée en dernier mais DATÉE d\'il y a 6 jours (18 kg) ne devient pas « la dernière » : celle d\'aujourd\'hui (30 kg) reste la référence — la chronologie de la séance, pas celle de la saisie', wd.exs[0].sets[0].kg === 30, js(wd.exs[0].sets.map(s => s.kg)));

    // A11 — H07 (ARBITRÉ par Michel le 17/11/2026) : si la dernière séance TERMINÉE du jour NE CONTIENT PAS l'exercice, le chargement reprend la PRESCRIPTION — jamais une séance plus ancienne du même jour. (Oracle RÉÉCRIT : il figeait l'ancien repli « une plus ancienne fournit la charge » = 90 ; l'invariant est gardé — la dernière séance du jour fait foi pour l'exercice qu'elle contient : 40.)
    const h07 = await pg.evaluate(([n]) => {
      const P = () => ({ id: 'p-h07', name: 'H07', days: [{ id: 'j-h07', label: 'JOUR A', exs: [{ name: n, note: '', sets: [{ kg: 100, reps: 5, type: 'N', rest: 0 }] }, { name: 'Autre exercice fictif', note: '', sets: [{ kg: 10, reps: 5, type: 'N', rest: 0 }] }] }] });
      const mk = (ts, date, exs) => ({ id: ts, ts, date, progId: 'p-h07', progDayId: 'j-h07', progLabel: 'JOUR A', exs, volume: 1, synced: true, uniConv: 1 });
      const t0 = Date.now(), out = {};
      const hist = [mk(t0 - 1000, H.iso(1), [{ name: 'Autre exercice fictif', sets: [{ kg: 40, reps: 5, type: 'N', done: true }] }]), mk(t0 - 3 * 864e5, H.iso(3), [{ name: n, sets: [{ kg: 90, reps: 5, type: 'N', done: true }] }])];
      H.raz([P()], hist);
      const av = JSON.stringify(S.sessions);
      out.kg = H.charge(0, 0).exs.map(e => e.sets[0].kg);
      out.intact = av === JSON.stringify(S.sessions);
      // la dernière séance porte l'exercice mais AUCUNE série faite : il n'a pas été refait → la prescription aussi (pas la séance d'avant)
      const h2 = [mk(t0 - 1000, H.iso(1), [{ name: n, sets: [{ kg: 55, reps: 5, type: 'N', done: false }] }, { name: 'Autre exercice fictif', sets: [{ kg: 40, reps: 5, type: 'N', done: true }] }]), hist[1]];
      H.raz([P()], h2);
      out.nonFaite = H.charge(0, 0).exs.map(e => e.sets[0].kg);
      // ancien programme (sans identités d'exercice dans la séance, sans `prescrit`) : la même règle
      const h3 = [mk(t0 - 1000, H.iso(1), [{ name: 'Autre exercice fictif', sets: [{ kg: 40, reps: 5, type: 'N', done: true }] }]), hist[1]];
      H.raz([P()], h3);
      out.ancien = H.charge(0, 0).exs.map(e => e.sets[0].kg);
      return out;
    }, [N_BAR]);
    t('SCCH-A11 ⭐⭐ H07 / ARBITRAGE DE MICHEL (17/11) — quand la dernière séance TERMINÉE du jour ne contient pas l\'exercice, le chargement reprend la PRESCRIPTION (100), jamais la séance plus ancienne (90) ; l\'exercice présent dans la dernière séance prend la sienne (40) ; un exercice présent mais sans aucune série faite = non refait : la prescription aussi ; l\'historique n\'est pas modifié', egal(h07.kg, [100, 40]) && h07.intact && egal(h07.nonFaite, [100, 40]) && egal(h07.ancien, [100, 40]), js(h07));

    // A12 — H12 : DEUX BLOCS DE MÊME NOM, puis RÉORGANISATION par le VRAI geste (glisser une carte sur l'autre à la souris dans l'éditeur) : chaque bloc retrouve SON historique
    const DUO = () => ({ id: 'p-scch-duo', name: 'Programme fictif deux blocs', days: [{ label: 'TOP', exs: [
      EXO(N_BAR, [SE(100, 3, 'N', 180), SE(100, 3, 'N', 180)], { note: 'Bloc A' }), EXO(N_BAR, [SE(60, 8, 'N', 90), SE(60, 8, 'N', 90)], { note: 'Bloc B' }), EXO(N_HAL, [SE(20, 10, 'N', 60)])] }] });
    await raz([DUO()], []);
    await fait(0, 0, [[0, 0, 105, 3], [0, 1, 105, 3], [1, 0, 55, 8], [1, 1, 55, 8], [2, 0, 22, 10]]);
    const ouvrir = () => pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); editProg(0); const m = document.getElementById('prog-edit-content'); if (m) m.scrollTop = 0; });
    await pg.setViewportSize({ width: 390, height: 1400 });   // les deux cartes visibles ensemble pendant le glisser (la zone de dépôt se lit au point exact sous la souris)
    await ouvrir();
    const g = await pg.evaluate(() => { const g0 = document.querySelector('.prog-ex-card[data-ei="0"] .ex-grip'); g0.scrollIntoView({ block: 'center' }); const a = g0.getBoundingClientRect(), c1 = document.querySelector('.prog-ex-card[data-ei="1"]'); const c = c1.getBoundingClientRect(); return { x: a.left + a.width / 2, y: a.top + a.height / 2, cx: c.left + c.width / 2, cy: c.top + c.height / 2, haut: c.top >= 0 && c.bottom <= innerHeight }; });
    await pg.mouse.move(g.x, g.y); await pg.mouse.down(); await pg.mouse.move((g.x + g.cx) / 2, (g.y + g.cy) / 2, { steps: 4 }); await pg.mouse.move(g.cx, g.cy, { steps: 4 }); await pg.mouse.up();
    const ordre = await pg.evaluate(() => _editProgData.days[0].exs.map(e => e.note || e.name));
    await pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-prog-edit button')].find(x => /Enregistrer/.test(x.textContent)); bt.click(); });
    await pg.setViewportSize({ width: 390, height: 844 });
    const wr = await charge(0, 0);
    t('SCCH-A12 ⭐⭐⭐ H12 / D-163 — deux blocs de MÊME NOM (« Bloc A » 105, « Bloc B » 55), puis RÉORGANISÉS par le vrai geste (glisser la carte A sur la carte B à la souris) : chaque bloc retrouve SON historique, pas celui de l\'autre — l\'ordre devient B · A, les valeurs suivent l\'identité',
      egal(ordre.slice(0, 2), ['Bloc B', 'Bloc A']) && egal(wr.exs.map(e => e.sets.map(s => s.kg).join(',')), ['55,55', '105,105', '22']) && wr.exs[0].note === 'Bloc B', js({ g, ordre, kg: wr.exs.map(e => [e.note, e.sets.map(s => s.kg).join(',')]) }));

    // A13 — mêmes blocs de même nom, SANS commentaire (rien pour les distinguer) : l'identité seule les distingue — après réorganisation, chaque bloc garde SON historique
    const DUO2 = () => ({ id: 'p-scch-duo2', name: 'Programme fictif deux blocs sans note', days: [{ label: 'TOP', exs: [EXO(N_BAR, [SE(100, 3, 'N', 180)]), EXO(N_BAR, [SE(60, 8, 'N', 90)])] }] });
    await raz([DUO2()], []);
    await fait(0, 0, [[0, 0, 105, 3], [1, 0, 55, 8]]);
    const r2 = await pg.evaluate(() => { const p = S.programmes[0]; p.days[0].exs.reverse(); persist(); return H.charge(0, 0).exs.map(e => e.sets[0].kg); });
    t('SCCH-A13 ⭐⭐ deux blocs de même nom SANS commentaire : la liste inversée, chaque bloc garde SON historique (les identités, pas le rang) — 55 puis 105 (rang : 105 puis 55, le mélange que la décision interdit)', egal(r2, [55, 105]), js(r2));

    // A14 — H12 « historique d'AVANT les identités » : des séances enregistrées SANS identité d'exercice, deux blocs de même nom portant des commentaires différents, programme inversé → les commentaires les distinguent ; sans commentaire distinct ET nombres différents → la PRESCRIPTION (aucune valeur d'un bloc qu'on ne sait pas reconnaître)
    const leg = await pg.evaluate(([n]) => {
      const mkP = (exs) => ({ id: 'p-leg', name: 'Leg', days: [{ id: 'j-leg', label: 'J', exs }] });
      const ex = (note, kg) => ({ name: n, note, sets: [{ kg, reps: 5, type: 'N', rest: 0 }] });
      const mkS = (exs) => ({ id: 7, ts: Date.now() - 2000, date: H.iso(2), progId: 'p-leg', progDayId: 'j-leg', progLabel: 'J', exs: exs.map(e => ({ name: e.name, note: e.note, sets: [{ kg: e.kg2, reps: 5, type: 'N', done: true }] })), volume: 1, synced: true, uniConv: 1 });
      const out = {};
      // (a) commentaires différents, programme inversé (B, A) : l'historique (A=105, B=55) suit les commentaires
      H.raz([mkP([ex('Bloc B', 50), ex('Bloc A', 100)])], [mkS([{ name: n, note: 'Bloc A', kg2: 105 }, { name: n, note: 'Bloc B', kg2: 55 }])]);
      out.a = H.charge(0, 0).exs.map(e => e.sets[0].kg);
      // (b) sans commentaire, même nombre de blocs : AMBIGU → la PRESCRIPTION (arbitrage du 17/11 : le rang n'est jamais lu, « y compris si les commentaires coïncident »)
      H.raz([mkP([ex('', 100), ex('', 50)])], [mkS([{ name: n, note: '', kg2: 105 }, { name: n, note: '', kg2: 55 }])]);
      out.b = H.charge(0, 0).exs.map(e => e.sets[0].kg);
      // (c) sans commentaire distinct, nombres de blocs différents (2 dans la séance, 1 dans le programme) : la PRESCRIPTION reste
      H.raz([mkP([ex('', 100)])], [mkS([{ name: n, note: '', kg2: 105 }, { name: n, note: '', kg2: 55 }])]);
      out.c = H.charge(0, 0).exs.map(e => e.sets[0].kg);
      return out;
    }, [N_BAR]);
    t('SCCH-A14 ⭐ séances d\'AVANT les identités, deux blocs de même nom : (a) leurs commentaires les distinguent (B → 55 · A → 105 malgré l\'inversion) ; (b) sans commentaire (mêmes nombres de blocs) : AMBIGU → la PRESCRIPTION (100 · 50), le rang n\'est plus lu (oracle RÉÉCRIT le 17/11 : il figeait [105, 55], l\'attribution par rang que Michel interdit) ; (c) sans commentaire distinct et nombres différents, la PRESCRIPTION (100) — jamais une valeur d\'un bloc qu\'on ne reconnaît pas',
      egal(leg.a, [55, 105]) && egal(leg.b, [100, 50]) && egal(leg.c, [100]), js(leg));

    // A15 — RENOMMER un exercice (même identité) garde son historique ; en SUPPRIMER un et en ajouter un de MÊME NOM n'hérite de rien
    await raz([{ id: 'p-scch-ren', name: 'Renommage', days: [{ label: 'JOUR A', exs: [EXO(N_HAL, [SE(20, 10)]), EXO(N_MAC, [SE(40, 12)])] }] }], []);
    await fait(0, 0, [[0, 0, 24, 9], [1, 0, 45, 11]]);
    const rn = await pg.evaluate(() => {
      const p = S.programmes[0]; p.days[0].exs[0].name = 'Curl Haltères — renommé'; persist();        // renommage (même `exId`)
      const a = H.charge(0, 0).exs.map(e => e.sets[0].kg);
      p.days[0].exs.splice(1, 1); p.days[0].exs.push({ name: 'Leg Curl Assis Machine', note: '', sets: [{ kg: 38, reps: 12, type: 'N', rest: 0 }] }); persist();   // supprimé puis ajouté de même nom : une NOUVELLE identité
      const b = H.charge(0, 0).exs.map(e => e.sets[0].kg);
      return { a, b };
    });
    t('SCCH-A15 ⭐ un exercice RENOMMÉ garde son historique (24) ; un exercice supprimé puis re-ajouté sous le même nom est un NOUVEL exercice : sa prescription (38), pas l\'historique de l\'ancien (45)', egal(rn.a, [24, 45]) && egal(rn.b, [24, 38]), js(rn));

    // A16 — identités en double (un jour copié, un exercice copié) : jamais deux fois la même
    const dup = await pg.evaluate(() => {
      const J = () => ({ id: 'j-copie', label: 'COPIE', exs: [{ name: 'Curl Haltères', exId: 'xx', note: '', sets: [{ kg: 10, reps: 5, type: 'N', rest: 0, sid: 's1' }, { kg: 12, reps: 5, type: 'N', rest: 0, sid: 's1' }] }, { name: 'Curl Haltères', exId: 'xx', note: '', sets: [{ kg: 11, reps: 5, type: 'N', rest: 0 }] }] });
      H.raz([{ id: 'p-dup', name: 'Doublons', days: [J(), J()] }], []);
      H.charge(0, 1); H.charge(0, 0);
      const p = S.programmes[0], e0 = p.days[0].exs, e1 = p.days[1].exs;
      return { jours: p.days[0].id !== p.days[1].id, exs: e0[0].exId !== e0[1].exId, sets: e0[0].sets[0].sid !== e0[0].sets[1].sid, autre: e1[0].exId !== e1[1].exId };
    });
    t('SCCH-A16 ⛔ des identités en DOUBLE (un jour copié avec son `id`, un exercice copié avec son `exId`, deux séries au même `sid`) sont renouvelées : jamais deux fois la même identité dans un jour / un exercice', dup.jours && dup.exs && dup.sets && dup.autre, js(dup));

    // A17 — D-163 : une séance ANCIENNE ambiguë n'est pas attribuée à un jour par simple libellé (deux jours homonymes) ; un jour d'un AUTRE programme ne prête rien
    const amb = await pg.evaluate(([n]) => {
      const mk = (pid, lab, kg, extra) => Object.assign({ id: kg, ts: Date.now() - 4000 - kg, date: H.iso(3), progId: pid, progLabel: lab, exs: [{ name: n, sets: [{ kg, reps: 5, type: 'N', done: true }] }], volume: 1, synced: true, uniConv: 1 }, extra || {});
      const P = () => ({ id: 'p-amb', name: 'Amb', days: [{ label: 'HAUT', exs: [{ name: n, note: '', sets: [{ kg: 50, reps: 5, type: 'N', rest: 0 }] }] }, { label: 'HAUT', exs: [{ name: n, note: '', sets: [{ kg: 70, reps: 5, type: 'N', rest: 0 }] }] }, { label: 'BAS', exs: [{ name: n, note: '', sets: [{ kg: 90, reps: 5, type: 'N', rest: 0 }] }] }] });
      H.raz([P()], [mk('p-amb', 'HAUT', 61), mk('p-amb', 'BAS', 62), mk('p-autre', 'BAS', 63)]);
      return [H.charge(0, 0).exs[0].sets[0].kg, H.charge(0, 1).exs[0].sets[0].kg, H.charge(0, 2).exs[0].sets[0].kg];
    }, [N_HAL]);
    t('SCCH-A17 ⭐ séances ANCIENNES (sans identité de jour) : « HAUT » existe deux fois dans le programme → ni l\'un ni l\'autre ne la reçoit (50 · 70, les prescriptions) ; « BAS » est unique → sa séance (62) compte, celle d\'un AUTRE programme (63) jamais', egal(amb, [50, 70, 62]), js(amb));

    // A18 — L'IDENTITÉ D'UNE SÉRIE : déplacer une série (le vrai geste : toucher son numéro) emporte son historique ; une série dont le TYPE change (rôle différent) n'emprunte pas la valeur de l'ancien rôle ; une série AJOUTÉE n'a pas d'historique (sa prescription reste)
    await raz([{ id: 'p-scch-sets', name: 'Programme fictif séries', days: [{ label: 'JOUR S', exs: [EXO(N_INED, [SE(10, 10, 'N', 60), SE(20, 10, 'N', 60), SE(30, 10, 'N', 60)])] }] }], []);
    await fait(0, 0, [[0, 0, 11, 10], [0, 1, 21, 10], [0, 2, 31, 10]]);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); editProg(0); });
    const CS = '.prog-ex-card[data-di="0"][data-ei="0"]';
    await pg.locator(CS + ' .pe-row[data-si="2"] [data-ch="num"]').click();        // la 3ᵉ série (30) monte en 2ᵉ position : ordre 10 · 30 · 20
    await pg.locator(CS + ' .pe-row[data-si="0"] [data-ch="type"]').click();       // la 1ʳᵉ série devient un échauffement (N → É) : un AUTRE rôle
    await pg.locator(CS + ' button', { hasText: '+ série' }).click();              // une série AJOUTÉE (copie de la dernière : 20)
    await pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-prog-edit button')].find(x => /Enregistrer/.test(x.textContent)); bt.click(); });
    const wsr = await charge(0, 0);
    t('SCCH-A18 ⭐⭐ D-163 × D-168 × D-171 — l\'IDENTITÉ d\'une série : après avoir DÉPLACÉ la série de 30 en 2ᵉ position (vrai geste), changé le TYPE de la 1ʳᵉ (N → É) et AJOUTÉ une série, chaque série garde SON historique : la déplacée 31 (pas le 21 du rang), la série de 20 reprend 21, la série devenue échauffement garde sa prescription (10 — jamais le 11 d\'un autre rôle), la série ajoutée sa prescription (20)',
      egal(wsr.exs[0].sets.map(x => x.kg), [10, 31, 21, 20]) && egal(wsr.exs[0].sets.map(x => x.type), ['É', 'N', 'N', 'N']), js(wsr.exs[0].sets.map(x => [x.type, x.kg])));

    // A18b — ASSEMBLAGE (17/11/2026) : une série RETIRÉE puis une AUTRE ajoutée à sa place. Le 3ᵉ rang de l'historique (31) n'est plus la série de personne : la série ajoutée n'a PAS d'historique (sa prescription reste, 20),
    // jamais le 31 de la série retirée — même quand la colonne « Précédent » (qui, elle, propose par rôle une série libre) montrerait ce 31 au même rang.
    await raz([{ id: 'p-scch-sets2', name: 'Programme fictif séries 2', days: [{ label: 'JOUR S2', exs: [EXO(N_INED, [SE(10, 10, 'N', 60), SE(20, 10, 'N', 60), SE(30, 10, 'N', 60)])] }] }], []);
    await fait(0, 0, [[0, 0, 11, 10], [0, 1, 21, 10], [0, 2, 31, 10]]);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); editProg(0); });
    await pg.locator(CS + ' .pe-row[data-si="2"] [data-ch="supprimer"]').click();                  // la 3ᵉ série (30) est RETIRÉE
    await pg.locator(CS + ' button', { hasText: '+ série' }).click();                              // une série AJOUTÉE (copie de la dernière restante : 20)
    await pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-prog-edit button')].find(x => /Enregistrer/.test(x.textContent)); bt.click(); });
    const wsr2 = await charge(0, 0);
    t('SCCH-A18b ⭐⭐ ASSEMBLAGE — une série RETIRÉE puis une autre AJOUTÉE à sa place : les deux premières gardent leur historique (11 · 21), la série ajoutée sa prescription (20), jamais le 31 de la série retirée',
      egal(wsr2.exs[0].sets.map(x => x.kg), [11, 21, 20]), js(wsr2.exs[0].sets.map(x => x.kg)));

    // A19 — seules les séries TERMINÉES d'une séance comptent : une série non faite (pas pointée) de la dernière séance ne donne jamais sa valeur
    const nf = await pg.evaluate(() => {
      H.raz([{ id: 'p-nf', name: 'Non faites', days: [{ id: 'j-nf', label: 'J', exs: [{ name: 'Curl Haltères', note: '', sets: [{ kg: 20, reps: 8, type: 'N', rest: 0 }, { kg: 20, reps: 8, type: 'N', rest: 0 }] }] }] }],
        [{ id: 3, ts: Date.now() - 3000, date: H.iso(1), progId: 'p-nf', progDayId: 'j-nf', exs: [{ name: 'Curl Haltères', sets: [{ kg: 40, reps: 8, type: 'N', done: true }, { kg: 99, reps: 8, type: 'N', done: false }] }], volume: 1, synced: true, uniConv: 1 }]);
      return H.charge(0, 0).exs[0].sets.map(s => s.kg);
    });
    t('SCCH-A19 ⭐ seules les séries TERMINÉES de la dernière séance comptent : la série non pointée (99) ne donne jamais sa valeur — la 2ᵉ série reprend la dernière série faite (40), jamais 99', egal(nf, [40, 40]), js(nf));
  });

  // ═══ B. D-168 — UNE RETOUCHE MANUELLE VOLONTAIRE EST PRIORITAIRE POUR LE SEUL CHAMP ET LA SEULE SÉRIE TOUCHÉS, REPOS COMPRIS ═══
  await section('B', async () => {
    const PB = () => ({ id: 'p-scch-b', name: 'Programme fictif repos', days: [JOUR('JOUR A')] });
    const edit = (fn) => pg.evaluate(([fn]) => { editProg(0); (new Function('return ' + fn))()(); saveProgEdit(); return JSON.parse(JSON.stringify(S.programmes[0])); }, [fn]);
    await raz([PB()], await hostile(NOMS, null, 77));
    // la séance faite : repos RÉALISÉ 150 sur la 1ʳᵉ série du curl (repos prescrit 60), 45 sur la 2ᵉ ; le reste inchangé
    await fait(0, 0, FAIT.map(a => a).concat([]).map(a => a.slice()), null);
    await pg.evaluate(() => { const s = S.sessions[0]; s.exs[0].sets[0].rest = 150; s.exs[0].sets[1].rest = 45; persist(); });   // les repos réalisés dans l'historique (la séance enregistrée est un passé qu'on lit, ici posé pour le scénario)
    await pg.waitForTimeout(25);
    const pe = await edit('() => { _setProgSetKg(0, 0, 0, "24"); }');   // seule la CHARGE de la 1ʳᵉ série du curl est retouchée
    const w1 = await charge(0, 0);
    t('SCCH-B01 ⭐⭐ H09 / D-168 — seule la CHARGE de la 1ʳᵉ série du curl est retouchée (24, repos prescrit 60) : la charge est celle de la retouche, mais le REPOS vient de l\'historique (150) ; la 2ᵉ série reprend son repos d\'historique (45) ; les séries jamais retouchées reprennent le leur (barre : 60 → 60, machine 90 → 90)',
      w1.exs[0].sets[0].kg === 24 && w1.exs[0].sets[0].rest === 150 && w1.exs[0].sets[1].rest === 45 && w1.exs[0].sets[1].kg === 22.5 && w1.exs[2].sets[0].rest === 90 && w1.exs[1].sets[1].rest === 120, js({ curl: w1.exs[0].sets.map(s => [s.kg, s.rest]), mac: w1.exs[2].sets.map(s => s.rest) }));
    t('SCCH-B02 ⛔ la retouche de la charge ne pose son instant que sur la charge de cette série (aucun `ed.rest`)', Object.keys(pe.days[0].exs[0].sets[0].ed || {}).join() === 'kg' && !pe.days[0].exs[0].sets[1].ed, js(pe.days[0].exs[0].sets.map(s => s.ed || null)));
    await pg.waitForTimeout(25);
    const pe2 = await edit('() => { _setProgSetRest(0, 0, 1, "75"); }');
    const w2 = await charge(0, 0);
    t('SCCH-B03 ⭐⭐ H10 / D-168 — le REPOS retouché de la 2ᵉ série (75) l\'emporte sur l\'historique (45) pour CETTE série seulement ; la 1ʳᵉ garde son repos d\'historique (150) et sa charge retouchée (24) ; la charge de la 2ᵉ série reste celle de la séance (22,5)',
      w2.exs[0].sets[1].rest === 75 && w2.exs[0].sets[0].rest === 150 && w2.exs[0].sets[0].kg === 24 && w2.exs[0].sets[1].kg === 22.5 && Object.keys(pe2.days[0].exs[0].sets[1].ed || {}).join() === 'rest', js(w2.exs[0].sets.map(s => [s.kg, s.rest])));
    await pg.evaluate(() => { editProg(0); _setProgSetRest(0, 0, 1, '75'); _setProgSetRest(0, 0, 0, '60'); saveProgEdit(); });   // retaper la MÊME valeur n'est pas une retouche (75 déjà) ; 60 → 60 aussi
    const pe3 = await prog(0);
    t('SCCH-B04 ⭐ retaper le MÊME repos (60 déjà écrit, 75 déjà retouché) ne pose AUCUN nouvel instant : l\'instant de la retouche du repos de la 1ʳᵉ série reste absent', !(pe3.days[0].exs[0].sets[0].ed || {}).rest, js(pe3.days[0].exs[0].sets[0].ed || null));
    await pg.waitForTimeout(25);
    await fait(0, 0, [[0, 1, null, null, 80]]);                 // une séance FAITE plus tard : le repos de CETTE série (80) reprend la main sur la retouche (75, antérieure)
    const w3 = await charge(0, 0);
    t('SCCH-B05 ⭐ une séance terminée APRÈS la retouche du repos reprend la main : la 2ᵉ série redonne ce qui a été FAIT (80), plus la valeur retouchée (75)', w3.exs[0].sets[1].rest === 80, js(w3.exs[0].sets.map(s => s.rest)));
    // B06 — un repos INCONNU dans l'historique (0) n'efface pas celui du programme : aucune valeur inventée
    const rz = await pg.evaluate(() => {
      H.raz([{ id: 'p-rz', name: 'Repos zéro', days: [{ id: 'j-rz', label: 'J', exs: [{ name: 'Curl Haltères', exId: 'e1', note: '', sets: [{ kg: 20, reps: 8, type: 'N', rest: 90, sid: 's1' }, { kg: 20, reps: 8, type: 'N', rest: 0, restTxt: '3-4 min', sid: 's2' }] }] }] }],
        [{ id: 3, ts: Date.now() - 3000, date: H.iso(1), progId: 'p-rz', progDayId: 'j-rz', exs: [{ name: 'Curl Haltères', exId: 'e1', sets: [{ kg: 21, reps: 8, type: 'N', done: true, rest: 0, sid: 's1' }, { kg: 21, reps: 8, type: 'N', done: true, rest: 150, sid: 's2' }] }], volume: 1, synced: true, uniConv: 1 }]);
      const w = H.charge(0, 0); return w.exs[0].sets.map(s => [s.kg, s.rest, s.restTxt || null]);
    });
    t('SCCH-B06 ⭐ aucun repos INVENTÉ : un repos de 0 dans l\'historique (inconnu) laisse celui du programme (90) ; un repos réalisé de 150 sur une série dont le programme n\'écrit qu\'une consigne (« 3-4 min ») est repris, et la consigne écrite reste', egal(rz, [[21, 90, null], [21, 150, '3-4 min']]), js(rz));
    // B07 — la charge et les reps gardent leur règle D-168 (H11) : la charge retouchée n'empêche pas les reps de reprendre l'historique
    await raz([PB()], []);
    await fait(0, 0, [[0, 0, 22.5, 8]]);
    await pg.waitForTimeout(25);
    await edit('() => { _setProgSetKg(0, 0, 0, "26"); }');
    const w4 = await charge(0, 0);
    t('SCCH-B07 ⭐ H11 — la charge retouchée (26) l\'emporte, les répétitions de la même série reprennent la séance faite (8), les autres séries gardent la leur', w4.exs[0].sets[0].kg === 26 && w4.exs[0].sets[0].reps === 8 && w4.exs[0].sets[1].kg === 20, js(w4.exs[0].sets.map(s => [s.kg, s.reps])));
  });

  // ═══ C. D-171 — ÉDITION PAR SÉRIE ET COMMENTAIRE PAR SÉRIE (aux vrais gestes), CIBLE TACTILE DU DÉPLACEMENT ═══
  await section('C', async () => {
    const PC = () => ({ id: 'p-scch-c', name: 'Programme fictif commentaires', days: [{ label: 'JOUR C', exs: [EXO(N_INED, [SE(20, 10, 'N', 60), SE(25, 8, 'N', 90), SE(30, 6, 'N', 120)], { note: 'Consigne de l\'exercice — conservée' }), EXO(N_HAL, [SE(10, 12)])] }] });
    await raz([PC()], await hostile([N_INED, N_HAL], null, 77));
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); editProg(0); });
    const CARD = '.prog-ex-card[data-di="0"][data-ei="0"]';
    const sets = () => pg.evaluate(() => JSON.parse(JSON.stringify(_editProgData.days[0].exs[0].sets)));
    const avantBtn = await pg.evaluate(() => !!document.querySelector('.prog-ex-card[data-ei="0"] [data-ch="notes-serie"]') && !document.querySelector('.prog-ex-card[data-ei="0"] .pe-snote'));
    t('SCCH-C01 ⭐ les commentaires par série sont FACULTATIFS et discrets : sans aucun, l\'éditeur n\'ajoute qu\'un bouton « 💬 Commentaire par série » (aucun champ affiché, rien d\'écrit dans les données)', avantBtn && (await sets()).every(s => !('note' in s)), '');
    await pg.locator(CARD + ' [data-ch="notes-serie"]').click();
    const nCh = await pg.locator(CARD + ' .pe-snote textarea').count();
    await pg.locator('#prog-snote-0-0-1').fill('Cran 4, dos calé — consigne de la série 2');
    await pg.locator('#prog-snote-0-0-1').blur();
    await pg.locator('#prog-snote-0-0-2').fill('Dernière série : sans les sangles');
    await pg.locator('#prog-snote-0-0-2').blur();
    const s1 = await sets();
    t('SCCH-C02 ⭐⭐ D-171 — un champ de commentaire par série (3 séries → 3 champs) ; la saisie aux vrais gestes écrit le commentaire de CETTE série seulement (séries 2 et 3), la série 1 n\'en a pas (aucune clé) ; la consigne de l\'exercice est intacte',
      nCh === 3 && s1[1].note === 'Cran 4, dos calé — consigne de la série 2' && s1[2].note === 'Dernière série : sans les sangles' && !('note' in s1[0]) && (await pg.evaluate(() => _editProgData.days[0].exs[0].note)) === 'Consigne de l\'exercice — conservée', js(s1));
    // déplacer la série 3 (touche du numéro) : le commentaire voyage avec elle
    await pg.locator(CARD + ' .pe-row[data-si="2"] [data-ch="num"]').click();
    const s2 = await sets();
    t('SCCH-C03 ⭐⭐ D-171 — DÉPLACER la série 3 en 2ᵉ position (touche du numéro) : la série voyage ENTIÈRE avec son commentaire, sa charge (30), ses répétitions et son repos ; l\'ancienne 2ᵉ passe en 3ᵉ avec le sien',
      s2[1].kg === 30 && s2[1].note === 'Dernière série : sans les sangles' && s2[1].reps === 6 && s2[1].rest === 120 && s2[2].kg === 25 && s2[2].note === 'Cran 4, dos calé — consigne de la série 2', js(s2.map(s => [s.kg, s.note])));
    // type · charge · reps · repos modifiables par série (l'éditeur actuel marche, observé) ; ajout / suppression de série sans toucher aux commentaires des autres
    await pg.locator(CARD + ' button', { hasText: '+ série' }).click();
    const nPlus = (await sets()).length;
    await pg.locator(CARD + ' .pe-row[data-si="3"] [data-ch="supprimer"]').click();
    await pg.locator(CARD + ' .pe-row[data-si="0"] [data-ch="supprimer"]').click();
    const s3 = await sets();
    t('SCCH-C04 ⭐ ajouter une série (la nouvelle n\'hérite d\'AUCUN commentaire), puis supprimer la nouvelle et la 1ʳᵉ : les commentaires des séries restantes ne bougent pas (30 → « sans les sangles », 25 → « Cran 4 »)', nPlus === 4 && s3.length === 2 && s3[0].note === 'Dernière série : sans les sangles' && s3[1].note === 'Cran 4, dos calé — consigne de la série 2', js({ nPlus, s3: s3.map(s => [s.kg, s.note]) }));
    // enregistrer → le programme porte les commentaires ; le bouton de dépliage n'existe plus (ils sont toujours visibles) ; rouvrir ne les cache pas
    await pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-prog-edit button')].find(x => /Enregistrer/.test(x.textContent)); bt.click(); });
    const sv = await prog(0);
    t('SCCH-C05 ⭐ « Enregistrer » écrit les commentaires dans le programme (aucune troncature) et conserve la consigne de l\'exercice et son autre exercice',
      sv.days[0].exs[0].sets.length === 2 && sv.days[0].exs[0].sets[0].note === 'Dernière série : sans les sangles' && sv.days[0].exs[0].note === 'Consigne de l\'exercice — conservée' && sv.days[0].exs[1].name === N_HAL && !('note' in sv.days[0].exs[1].sets[0]), js(sv.days[0].exs[0].sets));
    // survit au RECHARGEMENT de l'application (le stockage réel) et se retrouve dans l'éditeur, déplié
    await pg.reload(); await pg.waitForTimeout(2500); await poserH();   // le rechargement vide les aides posées dans la page : on les repose
    const rel = await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); editProg(0); const ta = [...document.querySelectorAll('#prog-edit-content textarea[id^="prog-snote-"]')]; const vis = ta.map(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0; }); const btn = document.querySelector('.prog-ex-card[data-ei="0"] [data-ch="notes-serie"]'); return { vals: ta.map(x => x.value), vis, bouton: !!btn }; });
    t('SCCH-C06 ⭐⭐ après le RECHARGEMENT de l\'application, les commentaires de série sont là, dépliés et visibles dans l\'éditeur (jamais cachés derrière un bouton quand ils existent)', egal(rel.vals, ['Dernière série : sans les sangles', 'Cran 4, dos calé — consigne de la série 2']) && rel.vis.every(Boolean) && rel.bouton === false, js(rel));
    await pg.evaluate(() => { closeProgEdit(); });
    // séance DÉMARRÉE : le commentaire de série est celui de la série (visible à l'écran), la consigne d'exercice aussi ; faire la séance l'enregistre
    const wk = await pg.evaluate(() => { const w = H.charge(0, 0); goScreen('log', document.getElementById('nb-log')); renderExBlocks(); _expandedEx = 0; renderExBlocks(); const txt = document.getElementById('wkt-exs').innerText; return { notes: w.exs[0].sets.map(s => s.note || null), exNote: w.exs[0].note, visible: txt.includes('Dernière série : sans les sangles') && txt.includes('Cran 4, dos calé') }; });
    t('SCCH-C07 ⭐⭐ séance DÉMARRÉE : chaque série porte SON commentaire (celui du programme) et il est lisible à l\'écran sous la série ; la consigne de l\'exercice est chargée aussi', egal(wk.notes, ['Dernière série : sans les sangles', 'Cran 4, dos calé — consigne de la série 2']) && wk.exNote === 'Consigne de l\'exercice — conservée' && wk.visible, js(wk));
    const fin = await pg.evaluate(async () => { S.wkt.exs.forEach(e => e.sets.forEach(s => { s.done = true; })); await finishWorkout(); await new Promise(r => setTimeout(r, 14)); const s = S.sessions.slice().sort((a, b) => b.ts - a.ts)[0]; return s.exs[0].sets.map(x => x.note || null); });
    const apres = await charge(0, 0);
    t('SCCH-C08 ⭐ la séance TERMINÉE garde les commentaires de série (historique) ; le chargement suivant les retrouve (ceux du programme) — rien n\'est perdu d\'un tour à l\'autre', egal(fin, ['Dernière série : sans les sangles', 'Cran 4, dos calé — consigne de la série 2']) && egal(apres.exs[0].sets.map(s => s.note || null), fin), js({ fin, apres: apres.exs[0].sets.map(s => s.note || null) }));
    // « enregistrer en programme » (Sauvegarder comme programme) : les commentaires de série suivent (un copieur qui ne les nomme pas les supprimerait)
    const sap = await pg.evaluate(() => { H.charge(0, 0); document.getElementById('prog-name-inp').value = 'Copie avec commentaires'; saveAsProg(); const p = S.programmes.find(x => x.name === 'Copie avec commentaires'); return p.exs[0].sets.map(s => s.note || null); });
    t('SCCH-C09 ⭐ « Sauvegarder comme programme » conserve le commentaire de chaque série (sinon un commentaire écrit dans l\'éditeur disparaîtrait au premier remplacement du programme)', egal(sap, ['Dernière série : sans les sangles', 'Cran 4, dos calé — consigne de la série 2']), js(sap));
    // un import « Nouveau » d'un AUTRE programme n'efface ni ne touche les commentaires du premier
    const imp = await pg.evaluate(() => { const av = JSON.stringify(S.programmes[0]); openImportProg(); _impExtracted = { name: 'Programme importé fictif', weeks: 0, startDate: '', days: [{ label: 'JOUR 1', exercises: [{ name: 'Curl Haltères', sets: 2, reps: 10, repsPerSet: [10, 10], specialSets: [], kg: 0, kgPerSet: [], supersetGroup: '', setType: '', note: 'Consigne importée' }] }] }; finalImportProg(); return { intact: JSON.stringify(S.programmes[0]) === av, noteImportee: S.programmes[S.programmes.length - 1].days[0].exs[0].note }; });
    t('SCCH-C10 ⭐ l\'IMPORT d\'un autre programme ne touche pas les commentaires du premier (programme intact, octet pour octet) ; la consigne d\'exercice importée est conservée', imp.intact && imp.noteImportee === 'Consigne importée', js(imp));
    // plafond : un commentaire énorme est dit, jamais coupé en silence ; un texte déjà plus long n'est jamais raccourci
    const cap = await pg.evaluate(() => { editProg(0); const long = 'x'.repeat(4500); _setProgSetNote(0, 0, 0, long); const a = _editProgData.days[0].exs[0].sets[0].note.length; _editProgData.days[0].exs[0].sets[1].note = 'y'.repeat(5000); _setProgSetNote(0, 0, 1, 'y'.repeat(4900)); const b = _editProgData.days[0].exs[0].sets[1].note.length; _setProgSetNote(0, 0, 1, ''); const c = 'note' in _editProgData.days[0].exs[0].sets[1]; closeProgEdit(); return { a, b, c }; });
    t('SCCH-C11 ⭐ le plafond de sûreté (4 000) se dit et coupe un collage énorme ; un commentaire déjà plus long (5 000) n\'est jamais coupé au plafond par une retouche (4 900 reste 4 900, pas 4 000) ; le vider retire la clé', cap.a === 4000 && cap.b === 4900 && cap.c === false, js(cap));

    // CIBLES TACTILES — le numéro de série qui déplace (24 px de large aujourd'hui) : mesuré à 390 et à 375
    const mesure = async (w, h) => { await pg.setViewportSize({ width: w, height: h }); await pg.waitForTimeout(250);
      return pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); editProg(0);
        const ups = [...document.querySelectorAll('.prog-ex-card[data-ei="0"] .pe-up')];
        const ty = ups[0].closest('.pe-row').querySelector('.pe-ty').getBoundingClientRect(), num = ups[0].getBoundingClientRect();   // la pastille de type de la MÊME ligne
        const kg = document.querySelector('.prog-ex-card[data-ei="0"] .pe-row [data-ch="kg"]').getBoundingClientRect(), re = document.querySelector('.prog-ex-card[data-ei="0"] .pe-row [data-ch="rest"]').getBoundingClientRect();
        const overflow = document.documentElement.scrollWidth > innerWidth;
        const cx = num.left + num.width / 2, cy = num.top + num.height / 2, est = (x, y) => { const e = document.elementFromPoint(x, y); return !!(e && e.closest('.pe-up') === ups[0]); };
        // la zone TOUCHABLE réelle (balayage au pixel autour du numéro de la 2ᵉ série) : largeur sur la ligne du centre, hauteur sur la colonne du centre
        let x0 = null, x1 = null, y0 = null, y1 = null;
        for (let x = Math.floor(num.left) - 20; x <= Math.ceil(num.right) + 12; x++) if (est(x, cy)) { if (x0 === null) x0 = x; x1 = x; }
        for (let y = Math.floor(num.top) - 12; y <= Math.ceil(num.bottom) + 12; y++) if (est(cx, y)) { if (y0 === null) y0 = y; y1 = y; }
        const typeAtCentre = (() => { const e = document.elementFromPoint(ty.left + ty.width / 2, ty.top + ty.height / 2); return !!(e && e.closest('.pe-ty')); })();
        const typeAtBord = (() => { const e = document.elementFromPoint(ty.left + 1, ty.top + ty.height / 2); return !!(e && e.closest('.pe-ty')); })();
        const pitch = ups.length > 1 ? Math.round((ups[1].getBoundingClientRect().top - num.top) * 10) / 10 : null;
        closeProgEdit(); return { vis: { w: Math.round(num.width * 10) / 10, h: Math.round(num.height * 10) / 10 }, touch: { w: x1 - x0 + 1, h: y1 - y0 + 1 }, kgW: Math.round(kg.width), restW: Math.round(re.width), overflow, typeAtCentre, typeAtBord, pitch }; }); };
    const m390 = await mesure(390, 844), m375 = await mesure(375, 812);
    await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(150);
    console.log('   ℹ️  MESURE cible du numéro (déplacer une série) — 390 : ' + js(m390) + ' · 375 : ' + js(m375));
    t('SCCH-C12 ⭐⭐ D-171 — la cible TACTILE du numéro de série (qui déplace) : MESURÉE 24 × 34 px avant (390 et 375) ; la zone touchable réelle (balayage au pixel) fait maintenant au moins 40 px de large et couvre TOUTE la hauteur de la ligne (38 px de pas : aucun interstice mort entre deux numéros), à 390 ET à 375, sans déborder la page, avec les champs charge et repos toujours ≥ 52 px et la pastille de type voisine intacte (centre ET bord gauche)',
      [m390, m375].every(m => m.touch.w >= 40 && m.touch.h >= 38 && !m.overflow && m.kgW >= 52 && m.restW >= 52 && m.typeAtCentre && m.typeAtBord), js({ m390, m375 }));
  });

  // ═══ V. L'ALLER-RETOUR : le VRAI Code.js rend ce qu'il a reçu (identités + commentaire), la restauration les reprend (R4) ═══
  await section('V', async () => {
    const PV = () => ({ id: 'p-scch-v', name: 'Programme fictif voyage', days: [{ label: 'JOUR V', exs: [EXO(N_INED, [SE(20, 10, 'N', 60, { note: 'Cran 3' }), SE(25, 8, 'N', 90)], { note: 'Consigne' })] }] });
    await raz([PV()], []);
    await fait(0, 0, [[0, 0, 22, 10, 70]]);
    await pg.evaluate(() => { S.email = 'scch@example.test'; S.url = DEFAULT_URL; window._demoMode = false; });
    POSTS.length = 0;
    await pg.evaluate(() => { try { _cloudSync(); } catch (e) {} }); await pg.waitForTimeout(1200);
    const etat = await pg.evaluate(() => ({ programmes: JSON.parse(JSON.stringify(S.programmes)), sessions: JSON.parse(JSON.stringify(S.sessions)) }));
    const corps = POSTS.slice().reverse().find(c => c && c.action === 'saveProfile');
    const { serveur } = require('./nut_secu_p1.js');
    const X = serveur({}); const EM = 'scch@example.test';
    let lue = {}, rep = {};
    if (corps) { X.compte(EM); corps.email = EM; rep = X.post(corps); lue = X.lireCompte(EM) || {}; }
    const sans = a => JSON.parse(JSON.stringify(a || null, (k, v) => k === 'synced' ? undefined : v));
    const same = (a, c) => JSON.stringify(sans(a)) === JSON.stringify(sans(c));
    const P0 = (lue.programmes || [])[0], S0 = (lue.sessions || [])[0];
    t('SCCH-V01 ⭐⭐ la SYNCHRONISATION (le vrai corps de `_cloudSync`, le vrai `Code.js`) rend EXACTEMENT ce qu\'elle a reçu : identités de jour · d\'exercice (`exId`) · de série (`sid`) et commentaire de série (`note`) sont conservés — aucun champ supprimé par un copieur',
      !!corps && (rep.j || {}).status === 'ok' && same(lue.programmes, etat.programmes) && same(lue.sessions, etat.sessions) && !!P0.days[0].exs[0].exId && !!P0.days[0].exs[0].sets[0].sid && P0.days[0].exs[0].sets[0].note === 'Cran 3' && !!S0.exs[0].exId && !!S0.exs[0].sets[0].sid && S0.exs[0].sets[0].note === 'Cran 3',
      js({ corps: !!corps, statut: (rep.j || {}).status, progs: same(lue.programmes, etat.programmes), seances: same(lue.sessions, etat.sessions) }));
    const rest = await pg.evaluate((cmp) => { S.programmes = []; S.sessions = []; S.prs = {}; persist();
      try { _applyRestoreData(Object.assign({}, cmp, { profile: Object.assign({ name: 'Testeur', bw: 80, age: 35, gender: 'H', goal: 'force' }, cmp.profile || {}) })); } catch (e) { return { err: String(e && e.message || e) }; }
      const w = H.charge(0, 0); return { err: null, notes: w.exs[0].sets.map(s => s.note || null), kg: w.exs[0].sets.map(s => s.kg), rest: w.exs[0].sets.map(s => s.rest) }; }, lue);
    t('SCCH-V02 ⭐ la RESTAURATION reprend les commentaires de série et les identités : le jour restauré retrouve sa séance PAR IDENTITÉ (charge 22, repos réalisé 70 sur la 1ʳᵉ série) et le commentaire de chaque série', !rest.err && egal(rest.notes, ['Cran 3', null]) && rest.kg[0] === 22 && rest.rest[0] === 70, js(rest));
  });

  // ═══ Z. RÈGLE D'OR #9 — le bouton central « + » Séance ne bouge pas (on le MESURE) : accueil → éditeur ouvert → écran Séance chargé avec commentaires de série ═══
  await section('Z', async () => {
    await raz([{ id: 'p-scch-z', name: 'Programme fictif zone', days: [{ label: 'JOUR Z', exs: [EXO(N_INED, [SE(20, 10, 'N', 60, { note: 'Commentaire de série' }), SE(25, 8)])] }] }], []);
    const rect = () => pg.evaluate(() => { const e = document.getElementById('nb-log'); const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(x => Math.round(x * 10) / 10); });
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); S.wkt = null; goScreen('home', document.getElementById('nb-home')); });
    const a = await rect();
    await pg.evaluate(() => { H.charge(0, 0); goScreen('log', document.getElementById('nb-log')); renderExBlocks(); });
    await pg.waitForTimeout(300);
    const b2 = await rect();
    t('SCCH-Z01 ⭐ règle d\'or #9 — le bouton central « + » Séance de la barre du bas ne bouge pas (position et taille MESURÉES identiques sur l\'accueil et sur l\'écran Séance chargé avec un commentaire de série)', js(a) === js(b2) && a[2] > 40, js({ accueil: a, seance: b2 }));
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); editProg(0); });
    await pg.waitForTimeout(200);
    const c = await rect();
    await pg.evaluate(() => { closeProgEdit(); });
    t('SCCH-Z02 ⭐ … et il ne bouge pas non plus quand l\'éditeur de programme est ouvert avec ses commentaires de série dépliés (même rectangle)', js(a) === js(c), js({ accueil: a, editeur: c }));
  });

  t('SCCH-Z00 aucune erreur JavaScript pendant tout le banc', errs.length === 0, errs.slice(0, 3).join(' | '));
  await cx.close();
};
