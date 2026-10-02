/* ══════════════════════════════════════════════════════════════════════════════════════
   🥑 NUTRITION — NUT-LIPIDES-25-01 : LES LIPIDES DES MODES STANDARDS = 25 % DE LA CIBLE
   (02/10/2026, session-B, décision produit de Michel après la simulation NUT-LIPIDES-SIM-01)
   — blocs B-CDXXV (source) → B-CDXXVII (écran, aperçu, rechargement, Milo).

   AVANT : lipides = poids TOTAL × table par objectif (0,75 → 1,0 g/kg). Proportionnels au poids,
   pas à la cible : 130 kg en perte et décharge → 104 g de lipides pour 1 932 kcal, glucides à 0.
   APRÈS : lipides = cible × 25 % / 9 (arrondi), glucides = le reste, jamais sous 0.
   ⛔ INCHANGÉS, et c'est ce que ce banc protège autant que le changement : protéines (poids total ×
   objectif, + 0,2 g/kg en phase lutéale), cible, BMR, TDEE, kéto, low carb, et D-034 (un écart
   restant est DIT, jamais corrigé en silence).
   ⚠️ 25 % est une CONVENTION PRODUIT documentée, pas une vérité scientifique.

   ⛔ Les valeurs attendues sont MESURÉES (master 5b0387d4 pour ce qui ne doit pas bouger, branche
   pour ce qui change), jamais choisies. Profils de TEST, pas l'état de quelqu'un.
   Contrôle négatif : `tools/mut_nutri_lipides25.py`. Différentiel large : `tools/diff_nutri_lipides25.js`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');
const GEL = '2026-09-20T12:00:00';   // un dimanche
const BASE = { ft4_bw: '80', ft4_age: '35', ft4_ht: '175', ft4_gender: 'H', ft4_act: '1.55', ft4_goal: 'muscle', ft4_nphase: 'charge' };
const P_ = (o) => Object.assign({}, BASE, o || {});
const PROFILS = {
  A: P_(),
  A_perte: P_({ ft4_goal: 'perte' }), A_recomp: P_({ ft4_goal: 'recomp' }), A_force: P_({ ft4_goal: 'force' }),
  A_equilibre: P_({ ft4_goal: 'equilibre' }), A_endurance: P_({ ft4_goal: 'endurance' }),
  B20: P_({ ft4_bw: '20' }),
  C300: P_({ ft4_bw: '300' }),
  E150: P_({ ft4_bw: '150', ft4_ht: '190', ft4_age: '25', ft4_act: '1.9' }),
  D150: P_({ ft4_bw: '150', ft4_ht: '160', ft4_age: '70', ft4_act: '1.2', ft4_goal: 'perte', ft4_nphase: 'decharge' }),
  D1: P_({ ft4_bw: '130', ft4_ht: '170', ft4_age: '60', ft4_act: '1.2', ft4_goal: 'perte', ft4_nphase: 'decharge' }),
  T4a: P_({ ft4_bw: '200', ft4_ht: '160', ft4_age: '70', ft4_act: '1.2', ft4_goal: 'perte', ft4_nphase: 'decharge' }),
  T4c: P_({ ft4_bw: '180', ft4_ht: '160', ft4_age: '70', ft4_gender: 'F', ft4_act: '1.2', ft4_goal: 'perte', ft4_nphase: 'decharge' }),
  GAP: P_({ ft4_bw: '100', ft4_ht: '180', ft4_age: '40', ft4_goal: 'perte', ft4_manualkcal: '800' }),
  DECL: P_({ ft4_bw: '85.9', ft4_ht: '180', ft4_age: '48', ft4_goal: 'force' }),
  KETO1: P_({ ft4_foodmode: 'keto' }), LOWCARB1: P_({ ft4_foodmode: 'lowcarb' }),
  KETO250: P_({ ft4_bw: '250', ft4_ht: '180', ft4_age: '40', ft4_goal: 'perte', ft4_manualkcal: '800', ft4_foodmode: 'keto' }),
  PALEO: P_({ ft4_foodmode: 'paleo' }),
  LUT: P_({ ft4_bw: '60', ft4_ht: '165', ft4_gender: 'F', ft4_mcstart: '2026-09-01' }),
  /* T6 : même masse maigre (60 kg, pesée avec % de gras du jour → Katch-McArdle), donc même cible, deux poids */
  K75: P_({ ft4_bw: '75', ft4_wlog: JSON.stringify([{ date: '2026-09-20', kg: 75, bf: 20 }]) }),
  K150: P_({ ft4_bw: '150', ft4_wlog: JSON.stringify([{ date: '2026-09-20', kg: 150, bf: 60 }]) }),
};

module.exports.source = function (t, ROOT, fs, path) {
  const lire = f => _sansCommentaires(fs.readFileSync(path.join(ROOT, f), 'utf8')).replace(/\s+/g, '');
  const ST = lire('state.js');
  const corps = (src, nom) => { const i = src.indexOf('function' + nom + '('); if (i < 0) return '';
    let d = 0; for (let k = src.indexOf('{', i); k > 0 && k < src.length; k++) {
      if (src[k] === '{') d++; else if (src[k] === '}' && !--d) return src.slice(i, k + 1); }
    return src.slice(i); };
  console.log('\n═══ B-CDXXV. NUT-LIPIDES-25-01 — lipides des modes standards à 25 % de la cible (source) ═══');
  const mfk = corps(ST, 'macrosForKcal');
  const std = mfk.slice(mfk.indexOf('constcp=getMensCyclePhase();'));
  t('B-CDXXV ① une seule part, nommée, et une seule ligne de lipides standards : cible × 25 % / 9 (arrondi)',
    ST.includes('const_LIPIDES_PART_STANDARD=0.25;') && (ST.match(/_LIPIDES_PART_STANDARD/g) || []).length === 2
    && std.includes('constfat_g=Math.round(kcal*_LIPIDES_PART_STANDARD/9);') && !/fatRatio/.test(ST), 'règle absente ou dupliquée');
  t('B-CDXXV ② protéines inchangées : poids TOTAL × table par objectif (+ lutéale), mot pour mot',
    std.includes("constprotRatio=({muscle:2.2,perte:2.5,recomp:2.6,force:2.0,equilibre:2.0,endurance:1.7}[goal]||2.2)+lutealProt;")
    && std.includes('constprot_g=Math.round((S.bw||0)*protRatio);'), 'protéines modifiées');
  t('B-CDXXV ③ glucides = le reste, jamais sous 0',
    std.includes('constcarbs_g=Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4));return{prot_g,fat_g,carbs_g};}'), 'glucides modifiés');
  t('B-CDXXV ④ kéto et low carb : leurs branches sont celles de master, la part standard n\'y entre pas',
    mfk.includes("if(S.foodMode==='keto'||S.keto){constcarbs_g=Math.max(0,Math.round(kcal*0.05/4));constprotMini=Math.round((S.bw||0)*0.8);constprot_g=Math.max(0,Math.round(kcal*0.15/4),protMini);constreste=kcal-prot_g*4-carbs_g*4;constfat_g=Math.max(0,Math.round(reste/9));return{prot_g,fat_g,carbs_g};}")
    && mfk.includes("if(S.foodMode==='lowcarb'){constcarbs_g=Math.max(0,Math.round(kcal*0.25/4));constprot_g=Math.max(0,Math.round(kcal*0.30/4));constfat_g=Math.max(0,Math.round(kcal*0.45/9));return{prot_g,fat_g,carbs_g};}")
    && mfk.indexOf('_LIPIDES_PART_STANDARD') > mfk.indexOf("if(S.foodMode==='lowcarb')"), 'branche kéto / low carb modifiée');
  t('B-CDXXV ⑤ D-034 reste le garde : critère et appels de master (aucun ajustement silencieux)',
    ST.includes('const_ARRONDI_MACROS_KCAL=6;')
    && corps(ST, '_cibleIncompatible').includes('return(ecrete&&ecart>_ARRONDI_MACROS_KCAL)?{ecart,macros:Math.round(somme),ecrete}:null;')
    && ST.includes('constinc=calculable?_cibleIncompatible(m.prot_g,m.fat_g,m.carbs_g,calories):null;')
    && ST.includes('constcalories=manual||auto;'), 'D-034 modifié');
  /* Les textes qui DÉCRIVENT la règle ne doivent plus dire « lipides calés sur ton profil / ton poids » (R4, R23). */
  const brut = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const textes = ['screens.js', 'index.html', 'coach.js', 'setup.js'].map(brut).join('\n');
  t('B-CDXXV ⑥ aide, réglage manuel, aide détaillée, objectifs et avertissement D-034 disent « lipides = 25 % », plus « calés sur ton profil »',
    !/protéines et (les )?lipides restent calés sur ton profil/.test(textes) && !/protéines et lipides \(calculés sur ton poids/.test(textes)
    && !/Lipides élevés pour le support hormonal/.test(textes)
    && (textes.match(/les lipides font 25 % de tes calories/g) || []).length === 3 && /et tes lipides \(25 % de ta cible\)/.test(textes),
    'texte de l\'ancienne règle encore présent');
};

/* Pose un profil sur le disque et recharge par le VRAI chemin `localStorage → load()`. */
const _poser = `(D, ses) => {
  localStorage.clear();
  Object.keys(D).forEach(k => localStorage.setItem(k, D[k]));
  if (D.ft4_act) localStorage.setItem('ft4_act_src', 'choisi');
  localStorage.setItem('ft4_work', 'bureau'); localStorage.setItem('ft4_ob2', '1');
  if (ses) {
    const T = new Date('2026-09-20T12:00:00'), s = [];
    for (let d = 0; d < 28; d++) { const x = new Date(T - d * 864e5);
      if (ses.includes(x.getDay())) s.push({ date: x.toISOString().slice(0, 10), exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, done: true }] }] }); }
    localStorage.setItem('ft4_sessions', JSON.stringify(s));
  }
  load();
}`;

async function _page(b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  await cx.route(/script\.google\.com|workers\.dev|anthropic/, rt => rt.abort());
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{const F=new Date(${JSON.stringify(GEL)});const V=Date;
    window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}
      static now(){return F.getTime();}};})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);
  return { cx, pg, errs };
}

module.exports.ecran = async function (t, b, PORT) {
  const { cx, pg, errs } = await _page(b, PORT);
  console.log('\n-- B-CDXXVI. NUT-LIPIDES-25-01 — le moteur conduit (cas de référence + grille) --');
  const R = await pg.evaluate(({ P, poserSrc }) => {
    const poser = eval(poserSrc);
    const lire = () => { const m = calcMacros(S.nutritionPhase); const ok = m.prot_g != null && m.calories != null;
      return { cal: m.calories, P: m.prot_g, L: m.fat_g, G: m.carbs_g, k: ok ? m.prot_g * 4 + m.fat_g * 9 + m.carbs_g * 4 : null,
               inc: m.incompatible ? m.incompatible.ecart : null, ecrete: m.incompatible ? m.incompatible.ecrete : null,
               cyc: m.cycle ? m.cycle.jour : null, bmr: bmrDetail().kcal, tdee: calcTDEE() }; };
    const o = {};
    Object.keys(P).forEach(n => { poser(P[n]); o[n] = lire(); });
    poser(P.DECL); S.manualKcal = 1200; o.MAN1200 = lire(); S.manualKcal = 2500; o.MAN2500 = lire(); S.manualKcal = 0;
    /* ── Grille : affectation directe de S (mêmes champs que load()), sans cycle séance/repos ── */
    const RATIO = { muscle: 2.2, perte: 2.5, recomp: 2.6, force: 2.0, equilibre: 2.0, endurance: 1.7 };
    const g = { n: 0, std: 0, prot: 0, lip: 0, glu: 0, pctMin: 1e9, pctMax: 0, g0: 0, inc: 0, incFaux: 0, cibleBouge: 0, keto: 0, lowcarb: 0, kl: 0 };
    ['H', 'F'].forEach(sx => [20, 45, 70, 100, 130, 170, 220, 300].forEach(bw => [155, 185].forEach(h => [25, 75].forEach(a =>
      [1.2, 1.55, 1.9].forEach(ac => ['muscle', 'force', 'perte', 'recomp', 'equilibre', 'endurance'].forEach(goal =>
        ['charge', 'decharge'].forEach(ph => ['', 'paleo', 'keto', 'lowcarb'].forEach(md => [0, 900, 1500, 3000].forEach(man =>
          (sx === 'F' ? [false, true] : [false]).forEach(lut => {
            S.gender = sx; S.bw = bw; S.height = h; S.age = a; S.activityLevel = ac; S.activitySrc = 'choisi'; S.goal = goal;
            S.nutritionPhase = ph; S.workType = 'bureau'; S.smoker = false; S.manualKcal = man; S.coachQuiz = null; S.bodyScans = [];
            S.weightLog = []; S.foodMode = md; S.keto = (md === 'keto'); S.wkt = null; S.sessions = [];
            S.mensCycleStart = lut ? '2026-09-01' : ''; S.contraception = '';
            const r = lire(); g.n++;
            if (r.cal !== (man || autoKcal(ph))) g.cibleBouge++;
            const K = r.cal;
            if (md === 'keto') { g.kl++; g.keto++;
              const Gk = Math.max(0, Math.round(K * 0.05 / 4)), Pk = Math.max(0, Math.round(K * 0.15 / 4), Math.round(bw * 0.8)), Lk = Math.max(0, Math.round((K - Pk * 4 - Gk * 4) / 9));
              if (r.P === Pk && r.L === Lk && r.G === Gk) g.keto--;
            } else if (md === 'lowcarb') { g.kl++; g.lowcarb++;
              if (r.P === Math.round(K * 0.30 / 4) && r.L === Math.round(K * 0.45 / 9) && r.G === Math.round(K * 0.25 / 4)) g.lowcarb--;
            } else {
              g.std++;
              const lt = (lut && typeof getMensCyclePhase === 'function' && (getMensCyclePhase() || {}).phase === 'Lutéale') ? 0.2 : 0;
              const Pe = Math.round(bw * (RATIO[goal] + lt)), Le = Math.round(K * 0.25 / 9), Ge = Math.max(0, Math.round((K - Pe * 4 - Le * 9) / 4));
              if (r.P !== Pe) g.prot++;
              if (r.L !== Le) g.lip++;
              if (r.G !== Ge) g.glu++;
              const pct = r.L * 9 / K * 100; g.pctMin = Math.min(g.pctMin, pct); g.pctMax = Math.max(g.pctMax, pct);
              if (r.G === 0) g.g0++;
            }
            /* D-034 : déclaré SI ET SEULEMENT SI une macro est écrêtée à 0 et que la somme dépasse de plus de 6 kcal, à l'unité */
            const e = r.k - K, attendu = ((r.G === 0 || r.L === 0) && e > 6) ? e : null;
            if (attendu !== r.inc) g.incFaux++;
            if (r.inc) g.inc++;
          }))))))))));
    g.pctMin = Math.round(g.pctMin * 10) / 10; g.pctMax = Math.round(g.pctMax * 10) / 10;
    o.grille = g;
    return o;
  }, { P: PROFILS, poserSrc: _poser });

  const det = o => JSON.stringify(o);
  const q = (o, cal, P, L, G) => o && o.cal === cal && o.P === P && o.L === L && o.G === G;
  const vingtCinq = o => o && Math.abs(o.L * 9 / o.cal - 0.25) <= 0.0025 + 4.5 / o.cal;
  const tient = o => o && o.inc === null && Math.abs(o.k - o.cal) <= 6;
  /* T1 — profil central (80 kg, 175 cm, 35 a, Modéré) : les 6 objectifs. P = valeur de master. */
  const T1 = [['A', 'muscle', 3122, 176, 87, 409], ['A_perte', 'perte', 2322, 200, 65, 234], ['A_recomp', 'recomp', 2522, 208, 70, 265],
              ['A_force', 'force', 2972, 160, 83, 396], ['A_equilibre', 'équilibre', 2772, 160, 77, 360], ['A_endurance', 'endurance', 2872, 136, 80, 402]];
  T1.forEach(([n, lib, cal, P, L, G]) => t('B-CDXXVI T1 ' + lib + ' : ' + cal + ' kcal → P ' + P + ' (master) · L ' + L + ' (25 %) · G ' + G + ' (le reste), somme = cible, rien de déclaré',
    q(R[n], cal, P, L, G) && vingtCinq(R[n]) && tient(R[n]), det(R[n])));
  t('B-CDXXVI A ⭐ 80 kg muscle 3122 : P 176 · L 87 (avant 72) · G 409 (avant 443)', q(R.A, 3122, 176, 87, 409), det(R.A));
  t('B-CDXXVI T2 poids faible 20 kg : 2192 → P 44 · L 61 (avant 18) · G 367, rien de déclaré',
    q(R.B20, 2192, 44, 61, 367) && tient(R.B20), det(R.B20));
  t('B-CDXXVI T3 poids élevé, calories élevées : 300 kg 6532 → 660/181/566 ; 150 kg très actif 5329 → 330/148/669',
    q(R.C300, 6532, 660, 181, 566) && q(R.E150, 5329, 330, 148, 669) && tient(R.C300) && tient(R.E150), det([R.C300, R.E150]));
  t('B-CDXXVI D1 ⭐ 130 kg perte décharge 1932 : P 325 · L 54 (avant 104) · G 37 (avant 0) — l\'écart de +304 disparaît',
    q(R.D1, 1932, 325, 54, 37) && tient(R.D1), det(R.D1));
  t('B-CDXXVI 150 kg cible faible (2036) : 375/57/6 — tient, rien de déclaré', q(R.D150, 2036, 375, 57, 6) && tient(R.D150), det(R.D150));
  t('B-CDXXVI T4 ⭐ poids élevé, cible faible : G = 0 ET écart DÉCLARÉ par les protéines (200 kg 2636 → 500/73/0, +21 ; F 180 kg 2197 → 450/61/0, +152)',
    q(R.T4a, 2636, 500, 73, 0) && R.T4a.inc === 21 && R.T4a.ecrete === 'glucides'
    && q(R.T4c, 2197, 450, 61, 0) && R.T4c.inc === 152 && R.T4c.ecrete === 'glucides', det([R.T4a, R.T4c]));
  t('B-CDXXVI T5 cible manuelle : 800 à 100 kg → 250/22/0, écart DÉCLARÉ +398 (protéines seules : 1000 kcal) ; 1200 → 172/33/54 et 2500 → 172/69/298, rien',
    q(R.GAP, 800, 250, 22, 0) && R.GAP.inc === 398 && q(R.MAN1200, 1200, 172, 33, 54) && tient(R.MAN1200)
    && q(R.MAN2500, 2500, 172, 69, 298) && tient(R.MAN2500), det([R.GAP, R.MAN1200, R.MAN2500]));
  t('B-CDXXVI T6 ⭐ même cible (3032, même masse maigre), deux poids : MÊMES lipides (84), protéines de master (165 / 330), glucides = le reste (404 / 239)',
    q(R.K75, 3032, 165, 84, 404) && q(R.K150, 3032, 330, 84, 239) && tient(R.K75) && tient(R.K150), det([R.K75, R.K150]));
  t('B-CDXXVI KETO1 80 kg : 117/278/39 — identique à master ; kéto 250 kg à 800 kcal : 200/0/10, +40 déclaré (master)',
    q(R.KETO1, 3122, 117, 278, 39) && q(R.KETO250, 800, 200, 0, 10) && R.KETO250.inc === 40 && R.KETO250.ecrete === 'lipides', det([R.KETO1, R.KETO250]));
  t('B-CDXXVI LOWCARB1 80 kg : 234/156/195 — identique à master', q(R.LOWCARB1, 3122, 234, 156, 195), det(R.LOWCARB1));
  t('B-CDXXVI paléo (mode d\'ALIMENTS, pas de répartition propre) suit la règle standard : 176/87/409', q(R.PALEO, 3122, 176, 87, 409), det(R.PALEO));
  t('B-CDXXVI phase lutéale : +0,2 g/kg de protéines conservé (60 kg F 2607 → 144/72/346)', q(R.LUT, 2607, 144, 72, 346), det(R.LUT));
  t('B-CDXXVI BMR et TDEE du profil central : ceux de master (1724 · 2672)',
    R.A.bmr === 1724 && R.A.tdee === 2672, det({ bmr: R.A.bmr, tdee: R.A.tdee }));
  const G = R.grille;
  t('B-CDXXVI grille (' + G.n + ' profils) ⭐ modes standards : protéines = règle de master, lipides = 25 % de la cible, glucides = le reste borné à 0, cible jamais modifiée',
    G.n > 30000 && G.std > 15000 && G.prot === 0 && G.lip === 0 && G.glu === 0 && G.cibleBouge === 0 && G.pctMin >= 24.5 && G.pctMax <= 25.5, det(G));
  t('B-CDXXVI grille ⭐ kéto et low carb : la règle de master à l\'unité (' + G.kl + ' profils)', G.kl > 15000 && G.keto === 0 && G.lowcarb === 0, det(G));
  t('B-CDXXVI grille : D-034 déclaré SI ET SEULEMENT SI une macro est écrêtée et que la somme dépasse de plus de 6 kcal — à l\'unité',
    G.incFaux === 0 && G.inc > 0 && G.g0 > 0, det(G));
  t('B-CDXXVI aucune erreur de page pendant le moteur', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};

module.exports.ecranVue = async function (t, b, PORT) {
  const { cx, pg, errs } = await _page(b, PORT);
  console.log('\n-- B-CDXXVII. NUT-LIPIDES-25-01 — ce que la personne LIT et ce que Milo reçoit --');
  const det = o => JSON.stringify(o);
  const voir = async (D) => {
    await pg.evaluate(({ D, poserSrc }) => { eval(poserSrc)(D, null); }, { D, poserSrc: _poser });
    await pg.reload(); await pg.waitForTimeout(2000);
    return pg.evaluate(async () => {
      goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
      await new Promise(r => setTimeout(r, 300));
      const v = id => { const e = document.getElementById(id); return e ? e.textContent.replace(/[\u00a0\u202f]/g, ' ').trim() : null; };
      const ctx = buildCoachContext('test').split('\n').filter(l => /Calories cible|INCOMPATIBLE/.test(l));
      return { kcal: v('m-kcal'), P: v('m-prot'), L: v('m-fat'), G: v('m-carbs'), inc: v('nu-incompatible'), ctx };
    });
  };
  const a = await voir(PROFILS.A);
  t('B-CDXXVII A à l\'écran : 3 122 · 176 / 87 / 409 g, aucune phrase d\'écart',
    a.kcal === '3 122' && a.P === '176' && a.L === '87' && a.G === '409' && a.inc === '', det(a));
  t('B-CDXXVII A pour Milo : la même ligne (Protéines 176 · Glucides 409 · Lipides 87), aucune ligne d\'écart',
    a.ctx.length === 1 && a.ctx[0] === '- Calories cible: 3122 kcal | Protéines: 176g | Glucides: 409g | Lipides: 87g', det(a.ctx));
  const d1 = await voir(PROFILS.D1);
  t('B-CDXXVII D1 à l\'écran et pour Milo : 1 932 · 325 / 54 / 37 g, plus aucune phrase d\'incompatibilité',
    d1.kcal === '1 932' && d1.P === '325' && d1.L === '54' && d1.G === '37' && d1.inc === ''
    && d1.ctx.length === 1 && d1.ctx[0] === '- Calories cible: 1932 kcal | Protéines: 325g | Glucides: 37g | Lipides: 54g', det(d1));
  const t4 = await voir(PROFILS.T4c);
  t('B-CDXXVII T4 à l\'écran et pour Milo : 450 / 61 / 0 g et l\'écart est DIT (2 349 kcal, +152) — glucides écrêtés',
    t4.P === '450' && t4.L === '61' && t4.G === '0' && /incompatible avec les règles de répartition actuelles/.test(t4.inc)
    && /2 349 kcal/.test(t4.inc) && /152 kcal de plus/.test(t4.inc) && /les glucides tombent à 0/.test(t4.inc)
    && /Tes protéines \(calculées sur ton poids et ton objectif\) et tes lipides \(25 % de ta cible\) font déjà/.test(t4.inc)
    && t4.ctx.some(l => /CIBLE INCOMPATIBLE.*\(\+152\).*glucides écrêtés à 0/.test(l)), det(t4));
  const ke = await voir(PROFILS.KETO1), lc = await voir(PROFILS.LOWCARB1);
  t('B-CDXXVII KETO1 et LOWCARB1 à l\'écran : 117 / 278 / 39 et 234 / 156 / 195 (master)',
    ke.P === '117' && ke.L === '278' && ke.G === '39' && lc.P === '234' && lc.L === '156' && lc.G === '195', det([ke, lc]));
  /* Aperçu « Ajuster mes calories » (lit `macrosForKcal` directement), enregistrement, vrai rechargement. */
  await voir(PROFILS.DECL);
  const mod = await pg.evaluate(async () => {
    const toasts = []; const _t = window.toast; window.toast = (m, k) => { toasts.push(m); try { _t && _t(m, k); } catch (e) {} };
    const btn = [...document.querySelectorAll('#nu-adjust button')].find(x => /Ajuster mes calories/.test(x.textContent));
    if (!btn) return { err: 'bouton introuvable' };
    btn.click(); await new Promise(r => setTimeout(r, 200));
    const ov = document.getElementById('ov-kcal-edit'), inp = document.getElementById('kcal-edit-inp');
    const v = id => { const e = document.getElementById(id); return e ? e.textContent.replace(/[\u00a0\u202f]/g, ' ').trim() : null; };
    const taper = async (x) => { inp.value = String(x); inp.dispatchEvent(new Event('input', { bubbles: true })); await new Promise(r => setTimeout(r, 60));
      return { P: v('kcal-pv-prot'), G: v('kcal-pv-carb'), L: v('kcal-pv-fat'), note: v('kcal-pv-note') }; };
    const o = { ouvert: ov.classList.contains('open') };
    o.a2500 = await taper(2500); o.a900 = await taper(900);
    [...ov.querySelectorAll('button')].find(x => /Enregistrer mes calories/.test(x.textContent)).click();
    await new Promise(r => setTimeout(r, 300));
    o.toasts = toasts;
    return o;
  });
  t('B-CDXXVII aperçu à 2 500 kcal (85,9 kg, force) : 172 / 298 / 69 g (lipides = 25 %), aucune note',
    mod.ouvert && mod.a2500 && mod.a2500.P === '172 g' && mod.a2500.G === '298 g' && mod.a2500.L === '69 g' && mod.a2500.note === '', det(mod.a2500));
  t('B-CDXXVII aperçu à 900 kcal : 172 / 0 / 25 g et la note dit l\'écart (+ 13 kcal de protéines au-delà) ; enregistré sans « ✅ »',
    mod.a900 && mod.a900.P === '172 g' && mod.a900.G === '0 g' && mod.a900.L === '25 g' && /913 kcal/.test(mod.a900.note || '') && /13 kcal de plus/.test(mod.a900.note || '')
    && (mod.toasts || []).includes('Cible incompatible : +13 kcal.') && !(mod.toasts || []).some(x => /✅/.test(x)), det(mod));
  await pg.reload(); await pg.waitForTimeout(2000);
  const apres = await pg.evaluate(async () => {
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
    await new Promise(r => setTimeout(r, 300));
    const v = id => { const e = document.getElementById(id); return e ? e.textContent.replace(/[\u00a0\u202f]/g, ' ').trim() : null; };
    return { man: localStorage.getItem('ft4_manualkcal'), kcal: v('m-kcal'), P: v('m-prot'), L: v('m-fat'), G: v('m-carbs'), inc: v('nu-incompatible') };
  });
  t('B-CDXXVII rechargé : 900 kcal sur le disque, 172 / 25 / 0 g, l\'écart toujours dit à l\'écran',
    apres.man === '900' && apres.kcal === '900' && apres.P === '172' && apres.L === '25' && apres.G === '0' && /913 kcal/.test(apres.inc || ''), det(apres));
  t('B-CDXXVII aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};
