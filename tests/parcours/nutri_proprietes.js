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

  t('B-CCCLII ⑭ ⛔ aucune erreur de page sur tout le parcours', errs.length === 0, errs.join(' | '));
  await cx.close();
};
