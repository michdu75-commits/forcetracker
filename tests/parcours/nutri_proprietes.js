/* ══════════════════════════════════════════════════════════════════════════════════════
   🔬 T01 + PROPRIÉTÉS DU MOTEUR NUTRITIONNEL — L'ÉTAT ACTUEL, FIGÉ AVANT TOUTE REFONTE.

   ⛔⛔ CE BLOC NE DÉCRIT PAS CE QUI DEVRAIT ÊTRE : il fige CE QUI EST, le 22/09/2026, pour que
   toute modification future du moteur soit VISIBLE au lieu d'être silencieuse. C'est le test
   T01 du cahier d'audit (« reproduire les captures de référence et figer les sorties actuelles
   AVANT toute refonte »).

   ⚠️ CONSÉQUENCE ASSUMÉE : le jour où Michel valide une correction, une partie de ces témoins
   ROUGIRA — et c'est exactement leur métier. *Un témoin qui fige un état ne se supprime pas
   quand cet état change : il se retourne, avec la raison écrite à côté* (R30).

   ⭐ DEUX FAMILLES, et elles ne se confondent pas :
     ① les INVARIANTS — ce qui doit rester vrai quoi qu'on décide (aucune macro négative, aucun
       NaN, le plancher calorique, la fermeture bornée). Ceux-là ne se retournent jamais.
     ② les PHOTOGRAPHIES — les valeurs d'aujourd'hui (tables de ratios, écarts par objectif).
       Celles-là bougeront si Michel tranche en ce sens.
   ══════════════════════════════════════════════════════════════════════════════════════ */

module.exports.ecran = async function (t, b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                  timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`try{localStorage.clear();}catch(e){}`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  console.log('\n═══ B-CCCLII. Le moteur nutritionnel — T01 et propriétés ═══');

  const R = await pg.evaluate(() => {
    const poser = (p) => {
      S.gender = p.g || 'H'; S.bw = p.bw; S.height = p.h; S.age = p.a;
      S.activityLevel = p.act; S.workType = p.work || 'bureau'; S.goal = p.goal;
      S.nutritionPhase = p.phase || 'charge'; S.manualKcal = 0; S.foodMode = ''; S.keto = false;
      S.smoker = false; S.sessions = []; S.weightLog = []; S.otherSports = ''; S.stepsLog = null;
      S.bodyScans = p.lm ? [{ date: (function(){ const d = new Date(Date.now() - 10 * 864e5);
        return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); })(),
        leanMass: p.lm, weight: p.bw, bodyFat: p.mg }] : [];
      const m = calcMacros(S.nutritionPhase);
      return { bmr: calcBMR(), tdee: calcTDEE(), kcal: m.calories,
               P: m.prot_g, G: m.carbs_g, L: m.fat_g };
    };
    const o = {};
    // ── ① T01 : LE CAS DE RÉFÉRENCE DU CAHIER, FIGÉ ────────────────────────────────────
    const base = { bw: 85.8, h: 179, a: 41, act: 1.725, work: 'physique' };
    o.t01 = {};
    ['force', 'recomp', 'muscle', 'equilibre'].forEach(goal => {
      o.t01[goal] = poser(Object.assign({}, base, { goal: goal, phase: 'charge' })); });
    // ── ② LES TABLES, LUES À LA SOURCE ─────────────────────────────────────────────────
    o.deltas = (typeof _GOAL_DELTA_KCAL !== 'undefined') ? _GOAL_DELTA_KCAL : null;
    o.plancher = (typeof PLANCHER_KCAL !== 'undefined') ? PLANCHER_KCAL : null;
    // ── ③ LE DÉFAUT MESURÉ : la masse maigre n'atteint pas les macros ──────────────────
    const sans = poser({ bw: 110, h: 175, a: 40, act: 1.55, goal: 'perte' });
    const avec = poser({ bw: 110, h: 175, a: 40, act: 1.55, goal: 'perte', lm: 66, mg: 40 });
    o.maigre = { sansP: sans.P, avecP: avec.P, sansL: sans.L, avecL: avec.L,
                 bmrChange: avec.bmr !== sans.bmr };
    // ── ④ LE CAS À ZÉRO GLUCIDE, TROUVÉ PAR LE CORPUS ──────────────────────────────────
    o.zero = poser({ bw: 110, h: 150, a: 55, act: 1.375, goal: 'perte', phase: 'decharge' });
    // ── ⑤ INVARIANTS sur un échantillon large ──────────────────────────────────────────
    let neg = 0, nan = 0, sousPlancher = 0, fermeture = 0, n = 0, maxF = 0;
    let fermHorsEcret = 0, maxFHorsEcret = 0;
    for (const g of ['H', 'F']) for (const bw of [45, 60, 80, 100, 130])
      for (const h of [150, 170, 190]) for (const a of [18, 40, 70])
        for (const act of [1.375, 1.9]) for (const goal of ['muscle', 'perte', 'recomp', 'force', 'equilibre', 'endurance'])
          for (const phase of ['charge', 'decharge']) {
            const imc = bw / ((h / 100) * (h / 100)); if (imc < 13 || imc > 55) continue;
            const r = poser({ g, bw, h, a, act, goal, phase }); n++;
            if (r.P < 0 || r.G < 0 || r.L < 0) neg++;
            if (![r.P, r.G, r.L, r.kcal].every(x => typeof x === 'number' && isFinite(x))) nan++;
            if (r.kcal < (g === 'H' ? 1500 : 1200)) sousPlancher++;
            const f = Math.abs(r.P * 4 + r.G * 4 + r.L * 9 - r.kcal);
            if (f > 12) fermeture++; if (f > maxF) maxF = f;
            if (r.G > 0) { if (f > 12) fermHorsEcret++; if (f > maxFHorsEcret) maxFHorsEcret = f; }
          }
    o.inv = { n, neg, nan, sousPlancher, fermeture, maxF, fermHorsEcret, maxFHorsEcret };
    return o;
  });

  // ══ ① T01 — LA PHOTOGRAPHIE DU 22/09/2026 ════════════════════════════════════════════
  const T01 = { force: [3815, 172, 588, 86], recomp: [3365, 223, 454, 73],
                muscle: [3965, 189, 629, 77], equilibre: [3615, 172, 568, 73] };
  Object.keys(T01).forEach((g, i) => {
    const r = R.t01[g], a = T01[g];
    t('B-CCCLII ' + '①②③④'[i] + ' 📷 T01 · ' + g + ' figé (' + a.join(' / ') + ')',
      r.kcal === a[0] && r.P === a[1] && r.G === a[2] && r.L === a[3],
      JSON.stringify([r.kcal, r.P, r.G, r.L]));
  });

  // ══ ② LES TABLES ═════════════════════════════════════════════════════════════════════
  t('B-CCCLII ⑤ 📷 la table des écarts par objectif est celle d\'aujourd\'hui',
    JSON.stringify(R.deltas) === JSON.stringify({ muscle: 350, perte: -450, recomp: -250,
      force: 200, equilibre: 0, endurance: 100 }), JSON.stringify(R.deltas));
  t('B-CCCLII ⑥ 🛡️ INVARIANT · le plancher calorique vaut 1500 H / 1200 F',
    JSON.stringify(R.plancher) === JSON.stringify({ H: 1500, F: 1200 }), JSON.stringify(R.plancher));

  // ══ ③ LE DÉFAUT MESURÉ, FIGÉ POUR QU'IL NE DISPARAISSE PAS SANS DÉCISION ═════════════
  /* ⛔⛔ CE TÉMOIN FIGE UN DÉFAUT, PAS UNE QUALITÉ. Il est VERT aujourd'hui parce que le
     défaut existe : un bilan corporel frais change le BMR et ne change PAS les macros (R4).
     Le jour où Michel valide la correction, il rougira — c'est le signal attendu. */
  t('B-CCCLII ⑦ ⛔ DÉFAUT FIGÉ · un bilan corporel frais ne change NI protéines NI lipides',
    R.maigre.sansP === R.maigre.avecP && R.maigre.sansL === R.maigre.avecL,
    JSON.stringify(R.maigre));
  t('B-CCCLII ⑧ ⭐ … alors qu\'il change bien le BMR (donc l\'info EXISTE et n\'atteint pas les macros)',
    R.maigre.bmrChange === true, JSON.stringify(R.maigre));
  t('B-CCCLII ⑨ ⛔ DÉFAUT FIGÉ · un homme 110 kg / 150 cm en perte reçoit 0 g de glucides',
    R.zero.G === 0 && R.zero.P > 250, JSON.stringify(R.zero));

  // ══ ④ INVARIANTS — ceux-là ne se retournent jamais ═══════════════════════════════════
  t('B-CCCLII ⑩ 🛡️ INVARIANT · aucune macro négative (' + R.inv.n + ' profils)',
    R.inv.neg === 0, JSON.stringify(R.inv));
  t('B-CCCLII ⑪ 🛡️ INVARIANT · aucun NaN ni valeur non finie',
    R.inv.nan === 0, JSON.stringify(R.inv));
  t('B-CCCLII ⑫ 🛡️ INVARIANT · aucune cible sous le plancher calorique',
    R.inv.sousPlancher === 0, JSON.stringify(R.inv));
  /* ⛔⛔⛔ CE TÉMOIN A ÉTÉ ÉCRIT COMME UN INVARIANT, ET IL A ROUGI SUR LE CODE SERVI — c'est
     la découverte la plus importante de cet audit, et elle n'est ni dans le cahier ni dans mon
     rapport d'hier.
     ① J'avais publié « fermeture saine, ±3 kcal » sur **14 cas**. Puis « ±6 kcal » sur 922 000.
       ⚠️ Les deux étaient FAUX, et la seconde fois c'est MA LECTURE qui mentait : mon corpus ne
       gardait que les **8 premiers** cas rencontrés, pas les **pires**. *Un échantillon d'exemples
       n'est pas un maximum.*
     ② Le vrai écart maximal mesuré est **+377 kcal** : femme 75 ans, 150 cm, 110 kg, sédentaire,
       objectif perte, décharge → l'écran annonce **1 515 kcal** de cible et affiche des macros
       qui totalisent **1 892 kcal**. 👉 ***Deux chiffres qui se contredisent sur le même écran*** —
       la famille de bugs la plus vicieuse du projet.
     ③ La cause est le `Math.max(0, …)` des glucides : quand `P×4 + L×9` dépasse déjà la cible,
       les glucides sont écrêtés à 0 et **tout le surplus reste dans la somme**.
     ⛔ Le témoin fige donc le DÉFAUT tel qu'il est aujourd'hui (191 profils sur 131 712, écart
     moyen 108 kcal) : il rougira le jour où Michel validera la correction. */
  t('B-CCCLII ⑬ ⛔⛔ DÉFAUT FIGÉ · la somme des macros peut dépasser la cible de plusieurs centaines de kcal',
    R.inv.fermeture > 0 && R.inv.maxF > 100,
    'dépassements = ' + R.inv.fermeture + ' · écart max mesuré = ' + R.inv.maxF + ' kcal');
  /* ⭐ ET L'INVARIANT QUI RESTE VRAI, SÉPARÉ DU DÉFAUT : hors écrêtage, la fermeture tient dans
     la tolérance d'arrondi. P et L sont arrondis avant que G ne soit calculé — l'écart maximal
     théorique est 0,5×4 + 0,5×9 + 0,5×4 ≈ 8,5 kcal. *Un témoin qui exigerait 0 mesurerait
     l'arrondi, pas le moteur.* */
  t('B-CCCLII ⑬bis 🛡️ INVARIANT · hors écrêtage des glucides, la fermeture tient dans l\'arrondi',
    R.inv.fermHorsEcret === 0, 'écart max hors écrêtage = ' + R.inv.maxFHorsEcret + ' kcal');

  // ══ ⑮→⑳ LES DÉCOUVERTES DU 22/09 AU SOIR — chacune figée ═════════════════════════════
  const D = await pg.evaluate(() => {
    const j = n => { const d = new Date(Date.now() - n * 864e5);
      return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
    const poser = (p) => {
      S.gender = p.g || 'H'; S.bw = p.bw; S.height = p.h || 175; S.age = p.a || 35;
      S.activityLevel = p.act || 1.55; S.workType = 'bureau'; S.goal = p.goal;
      S.nutritionPhase = p.phase || 'charge'; S.manualKcal = p.man || 0; S.foodMode = '';
      S.keto = false; S.smoker = false; S.sessions = p.sessions || []; S.weightLog = [];
      S.otherSports = ''; S.stepsLog = null; S.discipline = p.disc || 'muscu'; S.level = p.lvl || '';
      S.bodyScans = p.lm ? [{ date: j(p.jours == null ? 10 : p.jours), leanMass: p.lm,
                              weight: p.bwScan || p.bw, bodyFat: p.mg }] : [];
      const m = calcMacros(S.nutritionPhase);
      return { bmr: calcBMR(), tdee: calcTDEE(), kcal: m.calories, P: m.prot_g,
               G: m.carbs_g, L: m.fat_g, meth: bmrDetail().methode };
    };
    const o = {};
    // ⑮ la discipline et le niveau n'atteignent pas la nutrition
    const ref = poser({ bw: 85, goal: 'muscle' });
    let ecarts = 0;
    ['muscu', 'bodybuilding', 'powerbuilding', 'powerlifting', 'haltero'].forEach(disc =>
      ['debutant', 'intermediaire', 'confirme'].forEach(lvl => {
        const r = poser({ bw: 85, goal: 'muscle', disc, lvl });
        if (r.kcal !== ref.kcal || r.P !== ref.P || r.G !== ref.G || r.L !== ref.L) ecarts++;
      }));
    o.discEcarts = ecarts;
    // ⑯ le nombre de séances n'atteint pas la cible
    const mk = n => { const s = []; for (let k = 0; k < 4; k++) for (let i = 0; i < n; i++)
      s.push({ date: j(k * 7 + i), exs: [{ name: 'Squat', sets: [{ kg: 140, reps: 5, done: true }] }], vol: 9000 }); return s; };
    o.s0 = poser({ bw: 85, goal: 'muscle', sessions: [] }).kcal;
    o.s6 = poser({ bw: 85, goal: 'muscle', sessions: mk(6) }).kcal;
    // ⑰ le déficit est FIXE : la vitesse relative de perte s'effondre quand le poids monte
    const p60 = poser({ bw: 60, goal: 'perte' }), p130 = poser({ bw: 130, goal: 'perte' });
    o.def60 = p60.kcal - p60.tdee; o.def130 = p130.kcal - p130.tdee;
    o.pct60 = (p60.kcal - p60.tdee) * 7 / 7700 / 60 * 100;
    o.pct130 = (p130.kcal - p130.tdee) * 7 / 7700 / 130 * 100;
    // ⑱ le surplus est FIXE : il dépasse +20 % chez les profils légers
    const m55 = poser({ bw: 55, goal: 'muscle', act: 1.375 });
    o.sur55Pct = (m55.kcal - m55.tdee) / m55.tdee * 100;
    // ⑲ une cible manuelle basse est acceptée, et les macros la dépassent largement
    const man = poser({ g: 'F', bw: 55, goal: 'perte', man: 600 });
    o.man = { kcal: man.kcal, somme: man.P * 4 + man.G * 4 + man.L * 9, G: man.G };
    // ⑳ discontinuité au seuil de fraîcheur du bilan corporel (90 jours)
    o.j89 = poser({ bw: 90, goal: 'perte', lm: 65, mg: 28, jours: 89 });
    o.j91 = poser({ bw: 90, goal: 'perte', lm: 65, mg: 28, jours: 91 });
    return o;
  });
  t('B-CCCLII ⑮ ⛔ DÉFAUT FIGÉ · discipline et niveau n\'atteignent PAS la nutrition (15 combinaisons)',
    D.discEcarts === 0, 'écarts mesurés = ' + D.discEcarts);
  t('B-CCCLII ⑯ ⛔ DÉFAUT FIGÉ · 0 séance/sem et 6 séances/sem donnent la MÊME cible',
    D.s0 === D.s6, D.s0 + ' kcal dans les deux cas');
  /* ⛔ Le déficit est un nombre FIXE (−450 + phase), pas une proportion : la vitesse relative
     de perte s'effondre quand le poids monte — l'inverse de ce que la littérature recommande. */
  t('B-CCCLII ⑰ ⛔ DÉFAUT FIGÉ · déficit identique à 60 kg et à 130 kg, donc vitesse relative divisée par ~2',
    D.def60 === D.def130 && (D.pct60 / D.pct130) > 1.8,
    'déficit ' + D.def60 + ' kcal · ' + D.pct60.toFixed(2) + ' %/sem à 60 kg contre '
    + D.pct130.toFixed(2) + ' %/sem à 130 kg');
  t('B-CCCLII ⑱ ⛔ DÉFAUT FIGÉ · le surplus fixe dépasse +20 % du TDEE chez les profils légers',
    D.sur55Pct > 20, 'surplus = ' + D.sur55Pct.toFixed(1) + ' % du TDEE (repère : +10-20 %)');
  /* ⚖️ La cible manuelle échappe au plancher — c'est une DÉCISION ACTÉE (on n'interdit pas).
     ⛔ Mais que les macros totalisent bien plus que la cible n'est décidé nulle part. */
  t('B-CCCLII ⑲ ⛔ DÉFAUT FIGÉ · cible manuelle 600 kcal → macros qui totalisent bien plus',
    D.man.kcal === 600 && D.man.somme > 800 && D.man.G === 0,
    'cible ' + D.man.kcal + ' kcal · macros ' + D.man.somme + ' kcal · glucides ' + D.man.G + ' g');
  t('B-CCCLII ⑳ ⛔ DÉFAUT FIGÉ · le bilan corporel qui passe 90 jours fait sauter la cible',
    D.j89.meth !== D.j91.meth && Math.abs(D.j91.kcal - D.j89.kcal) > 50,
    D.j89.meth + ' ' + D.j89.kcal + ' → ' + D.j91.meth + ' ' + D.j91.kcal + ' kcal');

  t('B-CCCLII ㉑ ⛔ aucune erreur de page sur tout le parcours', errs.length === 0, errs.join(' | '));
  await cx.close();
};
