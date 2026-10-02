/* ══════════════════════════════════════════════════════════════════════════════════════
   🍽️ LE MOTEUR NUTRITION, FIGÉ TEL QU'IL EST (24/09/2026) — NUT-01 → NUT-09

   Chantier de Michel : *« TDEE · calories · glucides · provenance »*. Le gel Nutrition est
   levé pour CE chantier seulement, et dans des limites strictes : aucune règle nutritionnelle
   ne se décide ici.

   ⛔⛔ CES TÉMOINS NE DISENT PAS CE QUI EST BON — ILS DISENT CE QUI EST.
   Chaque valeur attendue a été MESURÉE dans l'app servie (ft-v1234), jamais choisie. Ils
   existent pour qu'aucune modification du moteur ne passe sans qu'on la voie, et pour que la
   future décision de Michel (plafond, plage, redistribution…) se mesure en AVANT / APRÈS.
   👉 Le jour où Michel tranche, les témoins qui figent le résidu DOIVENT rougir : on les
   réécrit alors, avec sa décision citée — on ne les « répare » jamais pour faire du vert.

   ⚠️ LES PROFILS SONT DES VALEURS DE TEST, PAS L'ÉTAT DE QUELQU'UN.
     · « déclaré » = H, 48 ans, 180 cm, 85,9 kg, « Modéré (3-4j) », objectif force, métier
       bureau (le métier est INCONNU : `bureau` est la valeur par défaut de l'app) ;
     · SYNTH-B = 41 ans, 179 cm, 85,8 kg, « Actif (5-6j) », métier physique, objectif muscle —
       profil RECONSTRUIT le 22/09 pour reproduire une sortie, ⛔ jamais observé chez Michel.

   ⭐ La chaîne mesurée : BMR (Mifflin) × activité + métier + sport + pas = TDEE → + objectif
   ± phase = cible (plancher 1500/1200) → protéines et lipides en g/kg du poids TOTAL →
   **glucides = (cible − 4P − 9L) / 4, bornés à 0, SANS plafond** → cycle séance/repos.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');
module.exports.source = function (t, ROOT, fs, path) {
  const lire = f => _sansCommentaires(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  const ST = lire('state.js').replace(/\s+/g, '');
  const IH = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const SERVIS = ['state.js', 'app.js', 'screens.js', 'coach.js', 'setup.js', 'tracking.js', 'log.js',
                  'constants.js', 'index.html'];

  console.log('\n═══ B-CCCLX. Le moteur Nutrition — ses formules, figées dans la source ═══');

  t('B-CCCLX ① les glucides sont le RÉSIDU : (kcal − 4P − 9L)/4, bornés à 0, sans plafond',
    ST.includes('constcarbs_g=Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4));'),
    'formule du résidu introuvable ou modifiée');
  t('B-CCCLX ② protéines en g/kg du poids TOTAL, table par objectif inchangée',
    ST.includes("protRatio=({muscle:2.2,perte:2.5,recomp:2.6,force:2.0,equilibre:2.0,endurance:1.7}[goal]||2.2)")
    && ST.includes('constprot_g=Math.round((S.bw||0)*protRatio);'), 'table protéines modifiée');
  /* 🥑 NUT-LIPIDES-25-01 (02/10/2026, décision de Michel) : les lipides des modes standards ne sont plus
     « poids total × table par objectif » mais 25 % de la cible. Ce témoin figeait l'ancienne table ; il fige
     maintenant la nouvelle règle, et refuse le retour de l'ancienne. */
  t('B-CCCLX ③ lipides des modes standards = 25 % de la cible (NUT-LIPIDES-25-01), plus de table g/kg',
    ST.includes('const_LIPIDES_PART_STANDARD=0.25;')
    && ST.includes('constfat_g=Math.round(kcal*_LIPIDES_PART_STANDARD/9);')
    && !/fatRatio/.test(ST), 'règle des lipides modifiée');
  t('B-CCCLX ④ écart calorique par objectif inchangé',
    ST.includes('_GOAL_DELTA_KCAL={muscle:350,perte:-450,recomp:-250,force:200,equilibre:0,endurance:100}'),
    'table des objectifs modifiée');
  t('B-CCCLX ⑤ TDEE = BMR × activité + métier + sport + pas (aucun terme ajouté ni retiré)',
    ST.includes('returnMath.round(calcBMR()*S.activityLevel+calcWorkExtra()+calcSportExtra()+calcPasExtra(refTs));'),
    'formule du TDEE modifiée');
  t('B-CCCLX ⑥ plancher calorique inchangé (H 1500 / F 1200)',
    ST.includes('constPLANCHER_KCAL={H:1500,F:1200};'), 'plancher modifié');
  t('B-CCCLX ⑦ les 5 niveaux d\'activité de l\'écran Profil sont inchangés',
    ['1.2', '1.375', '1.55', '1.725', '1.9'].every(v => new RegExp('<option value="' + v.replace('.', '\\.') + '"').test(IH)),
    'options #act-sel modifiées');
  /* ⛔ V9 N'EST PAS SERVIE, ET ÇA NE SE DÉCIDE PAS EN PASSANT : `tdeeObserve` (tools/moteur_v9.js)
     ne doit apparaître dans AUCUN fichier servi tant que Michel ne l'a pas demandé. */
  /* ⚠️ COMMENTAIRES NEUTRALISÉS : un commentaire qui NOMME `tdeeObserve` ne la sert pas
     (trouvé par le contrôle négatif — le 1ᵉʳ jet lisait le fichier brut). */
  const v9 = SERVIS.filter(f => _sansCommentaires(fs.readFileSync(path.join(ROOT, f), 'utf8'))
    .replace(/<!--[\s\S]*?-->/g, ' ').includes('tdeeObserve'));
  t('B-CCCLX ⑧ `tdeeObserve` (V9) absent de tous les fichiers servis', v9.length === 0, v9.join(', '));
};

module.exports.ecran = async function (t, b, PORT) {
  const GEL = '2026-09-20T12:00:00';
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                  timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{const F=new Date(${JSON.stringify(GEL)});const V=Date;
    window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}
      static now(){return F.getTime();}};})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  console.log('\n-- B-CCCLXI. Le moteur Nutrition conduit — NUT-01 → NUT-09 (valeurs MESURÉES, pas choisies) --');

  /* Chaque cas passe par le VRAI chemin de chargement : localStorage → load() → moteur. */
  const R = await pg.evaluate(() => {
    const DECL = { ft4_bw: '85.9', ft4_age: '48', ft4_ht: '180', ft4_gender: 'H', ft4_act: '1.55',
                   ft4_work: 'bureau', ft4_goal: 'force', ft4_nphase: 'charge' };
    const SYNTHB = { ft4_bw: '85.8', ft4_age: '41', ft4_ht: '179', ft4_gender: 'H', ft4_act: '1.725',
                     ft4_work: 'physique', ft4_goal: 'muscle', ft4_nphase: 'charge' };
    /* Séances de jambes, jours de semaine donnés, sur 4 semaines — aujourd'hui (dimanche) inclus. */
    const seances = (jours) => {
      const T = new Date('2026-09-20T12:00:00'), s = [];
      for (let d = 0; d < 28; d++) {
        const x = new Date(T - d * 864e5);
        if (jours.includes(x.getDay())) s.push({ date: x.toISOString().slice(0, 10),
          exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, done: true }] }] });
      }
      return s;
    };
    const cas = (base, o, ses) => {
      localStorage.clear();
      const D = Object.assign({}, base, o || {});
      Object.keys(D).forEach(k => localStorage.setItem(k, D[k]));
      if (ses) localStorage.setItem('ft4_sessions', JSON.stringify(ses));
      load();
      if (ses) S.sessions = ses;
      const d = bmrDetail(), m = calcMacros(S.nutritionPhase);
      return { bmr: d && d.kcal, tdee: calcTDEE(), auto: autoKcal(S.nutritionPhase), cal: m.calories,
               P: m.prot_g, L: m.fat_g, G: m.carbs_g, cycle: m.cycle ? m.cycle.jour : null };
    };
    const out = {};
    out.decl = cas(DECL);
    out.synthB = cas(SYNTHB);
    out.synthB4 = cas(SYNTHB, null, seances([0, 1, 3, 5]));
    out.act = [1.2, 1.375, 1.55, 1.725, 1.9].map(a => cas(DECL, { ft4_act: String(a) }));
    out.bw = ['60', '70', '85.9', '100', '120', '140'].map(w => cas(DECL, { ft4_bw: w }));
    out.work = ['bureau', 'debout', 'actif', 'physique'].map(w => cas(DECL, { ft4_work: w }));
    out.goal = {};
    ['muscle', 'force', 'perte', 'recomp', 'equilibre', 'endurance'].forEach(g => { out.goal[g] = cas(DECL, { ft4_goal: g }); });
    out.sansPoids = cas(DECL, { ft4_bw: '0' });
    out.manSansPoids = cas(DECL, { ft4_bw: '0', ft4_manualkcal: '2200' });
    out.man1200 = cas(DECL, { ft4_manualkcal: '1200' });
    out.man800 = cas(DECL, { ft4_manualkcal: '800' });
    out.lourdPerte = cas(DECL, { ft4_bw: '130', ft4_age: '55', ft4_ht: '170', ft4_act: '1.2', ft4_goal: 'perte' });
    out.man6000 = cas(DECL, { ft4_manualkcal: '6000' });
    out.max = cas(DECL, { ft4_act: '1.9', ft4_work: 'physique', ft4_goal: 'muscle' });
    /* NUT-06 : le repli `S.bw || 80` de la whey, lu à l'écran — sans poids. */
    cas(DECL, { ft4_bw: '0' });
    try { renderWhey(); } catch (e) {}
    const wh = document.getElementById('whey-content');
    out.wheySansPoids = wh ? wh.textContent : null;
    cas(DECL);
    try { renderWhey(); } catch (e) {}
    out.wheyDecl = wh ? wh.textContent : null;
    return out;
  });
  const eq = (o, v) => o && Object.keys(v).every(k => o[k] === v[k]);
  const det = o => JSON.stringify(o);
  const kMac = o => o.P * 4 + o.L * 9 + o.G * 4;

  // NUT-01 — profil déclaré
  /* ⚠️ Depuis NUT-LIPIDES-25-01, L et G ont changé (L 86 → 84, G 387 → 392) ; BMR, TDEE, cible et P sont
     exigés à l'identique — c'est ce qui prouve que seul le calcul des lipides a bougé. */
  t('B-CCCLXI NUT-01 profil déclaré : BMR 1749 · TDEE 2711 · cible 3011 · P 172 · L 84 · G 392',
    eq(R.decl, { bmr: 1749, tdee: 2711, auto: 3011, cal: 3011, P: 172, L: 84, G: 392 }), det(R.decl));
  // NUT-02 — ancien profil reconstruit
  t('B-CCCLXI NUT-02 SYNTH-B (profil RECONSTRUIT, pas Michel) : TDEE 3515 · cible 3965 · L 110 · G 555 sans historique',
    eq(R.synthB, { tdee: 3515, auto: 3965, P: 189, L: 110, G: 555 }), det(R.synthB));
  // NUT-03 — la condition des ~659 g
  t('B-CCCLXI NUT-03 SYNTH-B + 4 séances/sem + jour de jambes : le cycle joue toujours → L 92 · G 595 (séance)',
    eq(R.synthB4, { tdee: 3515, auto: 3965, P: 189, L: 92, G: 595, cycle: 'seance' }), det(R.synthB4));
  t('B-CCCLXI NUT-03b le RÉSIDU : sans cycle, 4P + 9L + 4G = cible (±2 kcal d\'arrondi), sur tous les profils',
    [R.decl, R.synthB, ...R.act, ...R.bw, ...R.work].every(o => Math.abs(kMac(o) - o.cal) <= 2),
    [R.decl, R.synthB].map(o => kMac(o) + '/' + o.cal).join(' '));
  // NUT-04 — activité : TDEE, lipides et glucides croissent, P constant (les lipides suivent la cible depuis NUT-LIPIDES-25-01)
  const act = R.act;
  t('B-CCCLXI NUT-04 activité 1,2 → 1,9 : TDEE, lipides et glucides strictement croissants, P constant',
    act.every((o, i) => !i || (o.tdee > act[i - 1].tdee && o.G > act[i - 1].G && o.L > act[i - 1].L))
    && act.every(o => o.P === 172), act.map(o => o.tdee + '/' + o.L + '/' + o.G).join(' '));
  t('B-CCCLXI NUT-04b valeurs figées : L = 67 · 75 · 84 · 92 · 101 · G = 277 · 336 · 392 · 450 · 507',
    act.map(o => o.L).join(',') === '67,75,84,92,101' && act.map(o => o.G).join(',') === '277,336,392,450,507',
    act.map(o => o.L + '/' + o.G).join(','));
  t('B-CCCLXI NUT-04c métier : bureau 392 · debout 431 · actif 453 · physique 477 g',
    R.work.map(o => o.G).join(',') === '392,431,453,477', R.work.map(o => o.G).join(','));
  // NUT-05 — poids : TDEE et P montent ; depuis NUT-LIPIDES-25-01 les lipides suivent la cible, donc les
  // glucides CROISSENT avec le poids (ils décroissaient de 398 à 368 quand L = poids × 1,0) — constaté, pas jugé
  const bw = R.bw;
  t('B-CCCLXI NUT-05 poids 60 → 140 kg : TDEE, P, L et glucides croissent (L 73 → 107, G 368 → 442)',
    bw.every((o, i) => !i || (o.tdee > bw[i - 1].tdee && o.P > bw[i - 1].P && o.L > bw[i - 1].L && o.G > bw[i - 1].G))
    && bw[0].L === 73 && bw[5].L === 107 && bw[0].G === 368 && bw[5].G === 442, bw.map(o => o.tdee + '/' + o.L + '/' + o.G).join(' '));
  // NUT-06 — absence de poids
  t('B-CCCLXI NUT-06 sans poids : aucun calcul (TDEE, cible, P, L, G tous null)',
    eq(R.sansPoids, { tdee: null, auto: null, cal: null, P: null, L: null, G: null }), det(R.sansPoids));
  /* Trouvé par le contrôle négatif : sans poids, la cible AUTO est déjà nulle — seul un réglage
     MANUEL prouve que les macros ne se calculent pas sur un poids absent (ft-v1232). */
  t('B-CCCLXI NUT-06c sans poids mais 2200 kcal à la main : calories gardées, P/L/G null (pas de répartition inventée)',
    eq(R.manSansPoids, { cal: 2200, P: null, L: null, G: null }), det(R.manSansPoids));
  t('B-CCCLXI NUT-06b sans poids : la whey retombe sur 80 kg (32 g) — repli CONNU, non tranché',
    /32g/.test(R.wheySansPoids || '') && /34g/.test(R.wheyDecl || ''),
    (R.wheySansPoids || '').slice(0, 60) + ' | ' + (R.wheyDecl || '').slice(0, 60));
  // NUT-07 — calories trop basses pour P + L
  const fini = o => ['cal', 'P', 'L', 'G'].every(k => Number.isFinite(o[k]));
  /* Depuis NUT-LIPIDES-25-01, 1200 kcal à la main ne mettent plus les glucides à 0 (L 33 g au lieu de 86) :
     le cas « glucides jamais négatifs » se vérifie à 800 kcal (le minimum accepté), où les protéines seules
     dépassent la cible. */
  t('B-CCCLXI NUT-07 manuel 1200 : L 33 · G 54 (les lipides suivent la cible), macros 1201 kcal ≈ 1200',
    R.man1200.cal === 1200 && R.man1200.P === 172 && R.man1200.L === 33 && R.man1200.G === 54 && fini(R.man1200)
    && kMac(R.man1200) === 1201, det(R.man1200));
  t('B-CCCLXI NUT-07c manuel 800 : glucides à 0 (jamais négatifs), tout fini, macros 886 kcal > 800',
    R.man800.cal === 800 && R.man800.G === 0 && R.man800.L === 22 && fini(R.man800) && kMac(R.man800) === 886,
    det(R.man800) + ' kMac=' + kMac(R.man800));
  t('B-CCCLXI NUT-07b 130 kg en perte, sédentaire : cible 2162, P 325, L 60, G 81 (plus d\'écrêtage), macros 2164',
    R.lourdPerte.auto === 2162 && R.lourdPerte.P === 325 && R.lourdPerte.L === 60 && R.lourdPerte.G === 81
    && kMac(R.lourdPerte) === 2164 && fini(R.lourdPerte), det(R.lourdPerte) + ' kMac=' + kMac(R.lourdPerte));
  // NUT-08 — très hautes calories
  t('B-CCCLXI NUT-08 manuel 6000 : L 167 · G 952 — aucun plafond, tout fini',
    R.man6000.L === 167 && R.man6000.G === 952 && fini(R.man6000), det(R.man6000));
  t('B-CCCLXI NUT-08b auto maximal (1,9 + physique + muscle) : cible 4223 · L 117 · G 604',
    R.max.auto === 4223 && R.max.L === 117 && R.max.G === 604, det(R.max));
  // NUT-09 — changement d'objectif
  const g = R.goal, gl = o => [o.auto, o.P, o.L, o.G].join('/');
  t('B-CCCLXI NUT-09 objectifs : muscle 3161/189/88/403 · force 3011/172/84/392 · perte 2361/215/66/227',
    gl(g.muscle) === '3161/189/88/403' && gl(g.force) === '3011/172/84/392' && gl(g.perte) === '2361/215/66/227',
    ['muscle', 'force', 'perte'].map(k => k + ' ' + gl(g[k])).join(' | '));
  t('B-CCCLXI NUT-09b objectifs : recomp 2561/223/71/258 · équilibre 2811/172/78/355 · endurance 2911/146/81/400',
    gl(g.recomp) === '2561/223/71/258' && gl(g.equilibre) === '2811/172/78/355' && gl(g.endurance) === '2911/146/81/400',
    ['recomp', 'equilibre', 'endurance'].map(k => k + ' ' + gl(g[k])).join(' | '));

  /* NUT-01 à l'ÉCRAN, après un VRAI rechargement : ce que la personne lit. */
  await pg.evaluate(() => {
    localStorage.clear();
    const D = { ft4_bw: '85.9', ft4_age: '48', ft4_ht: '180', ft4_gender: 'H', ft4_act: '1.55',
                ft4_work: 'bureau', ft4_goal: 'force', ft4_nphase: 'charge', ft4_ob2: '1' };
    Object.keys(D).forEach(k => localStorage.setItem(k, D[k]));
  });
  await pg.reload(); await pg.waitForTimeout(2200);
  const aff = await pg.evaluate(async () => {
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
    await new Promise(r => setTimeout(r, 300));
    const v = id => { const e = document.getElementById(id); return e ? e.textContent.trim() : null; };
    return { P: v('m-prot'), L: v('m-fat'), G: v('m-carbs') };
  });
  t('B-CCCLXI NUT-01b à l\'écran après rechargement : 172 · 84 · 392',
    aff.P === '172' && aff.L === '84' && aff.G === '392', JSON.stringify(aff));
  t('B-CCCLXI ∅ aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};
