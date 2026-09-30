/* ══════════════════════════════════════════════════════════════════════════════════════
   ⚖️ NUTRITION LOT 1 — B3 : LA CIBLE CALORIQUE ET LES MACROS NE SE CONTREDISENT PLUS
   (30/09/2026, session-B, à la demande de Michel) — blocs B-CDXV → B-CDXVIII.

   LE DÉFAUT (docs/NUTRITION-GLUCIDES-2026-09-24.md, cas B3) : P et L sont proportionnels au
   poids TOTAL, la cible ne l'est pas. Quand 4P + 9L dépassait la cible, les glucides (le reste)
   tombaient à 0 et les macros affichées dépassaient la cible sans rien dire — 130 kg en perte et
   décharge : cible 1 932, macros 2 236. Le cycle séance/repos le faisait aussi les jours de repos
   (+65 kcal dès 80 kg). Et Milo lisait « Glucides : — » au lieu de 0.

   L'INVARIANT DEMANDÉ : 4P + 9L + 4G ≈ cible (arrondi) ; si ce n'est pas possible pour une raison
   métier légitime, l'écart est EXPLICITE et EXPLIQUÉ.
   LA STRATÉGIE (proposée par Claude, soumise à contre-vérification) : la cible ne bouge jamais ;
   les lipides cèdent d'abord (plancher 0,6 g/kg), puis les protéines (0,8 g/kg, seuil du Gardien) ;
   si même ces minimums dépassent (cible manuelle très basse), l'écart est déclaré (`ajuste.depasse`).

   ⛔ Les valeurs attendues sont MESURÉES dans l'app servie, jamais choisies. Les profils sont des
   valeurs de TEST, pas l'état de quelqu'un. Contrôle négatif : `tools/mut_nutri_b3.py`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');
const GEL = '2026-09-20T12:00:00';   // un dimanche
const PROFILS = {
  A1: { ft4_bw: '85', ft4_age: '40', ft4_ht: '180', ft4_gender: 'H', ft4_act: '1.55', ft4_goal: 'muscle', ft4_nphase: 'charge' },
  D1: { ft4_bw: '130', ft4_age: '60', ft4_ht: '170', ft4_gender: 'H', ft4_act: '1.2', ft4_goal: 'perte', ft4_nphase: 'decharge' },
  D2: { ft4_bw: '45', ft4_age: '70', ft4_ht: '150', ft4_gender: 'F', ft4_act: '1.2', ft4_goal: 'perte', ft4_nphase: 'decharge' },
  GAP: { ft4_bw: '100', ft4_age: '40', ft4_ht: '180', ft4_gender: 'H', ft4_act: '1.55', ft4_goal: 'perte', ft4_nphase: 'charge', ft4_manualkcal: '800' },
  DECL: { ft4_bw: '85.9', ft4_age: '48', ft4_ht: '180', ft4_gender: 'H', ft4_act: '1.55', ft4_goal: 'force', ft4_nphase: 'charge' },
  KETO: { ft4_bw: '250', ft4_age: '40', ft4_ht: '180', ft4_gender: 'H', ft4_act: '1.55', ft4_goal: 'perte', ft4_nphase: 'charge', ft4_manualkcal: '800', ft4_foodmode: 'keto' },
  CYC: { ft4_bw: '80', ft4_age: '20', ft4_ht: '150', ft4_gender: 'H', ft4_act: '1.2', ft4_goal: 'perte', ft4_nphase: 'decharge' },
  B1: { ft4_age: '40', ft4_ht: '180', ft4_gender: 'H', ft4_act: '1.55', ft4_goal: 'perte', ft4_nphase: 'charge' },
  B2: { ft4_age: '40', ft4_ht: '180', ft4_gender: 'H', ft4_act: '1.55', ft4_goal: 'perte', ft4_nphase: 'charge', ft4_manualkcal: '2000' },
};

module.exports.source = function (t, ROOT, fs, path) {
  const lire = f => _sansCommentaires(fs.readFileSync(path.join(ROOT, f), 'utf8')).replace(/\s+/g, '');
  const ST = lire('state.js'), SC = lire('screens.js'), CO = lire('coach.js');
  const IH = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  /* Le CORPS d'une fonction, accolades appariées (un « 'function' » dans une chaîne ne le coupe pas). */
  const corps = (src, nom) => { const i = src.indexOf('function' + nom + '('); if (i < 0) return '';
    let d = 0; for (let k = src.indexOf('{', i); k > 0 && k < src.length; k++) {
      if (src[k] === '{') d++; else if (src[k] === '}' && !--d) return src.slice(i, k + 1); }
    return src.slice(i); };
  console.log('\n═══ B-CDXV. B3 — la cible et les macros ne se contredisent plus (source) ═══');
  const mfk = corps(ST, 'macrosForKcal'), dlc = corps(ST, '_macrosDansLaCible'), cyc = corps(ST, 'cycleGlucides');
  t('B-CDXV ① le résidu reste LA formule quand P et L tiennent ; sinon `_macrosDansLaCible`',
    mfk.includes('constcarbs_g=Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4));')
    && mfk.includes('if(prot_g*4+fat_g*9>kcal)return_macrosDansLaCible(kcal,prot_g,fat_g);'), 'branche B3 absente');
  t('B-CDXV ② les minimums ont UN propriétaire chacun : `_CYCLE_FAT_MIN` (0,6) et `_PROT_MIN_GKG` (0,8)',
    ST.includes('const_PROT_MIN_GKG=0.8;') && ST.includes('const_CYCLE_FAT_MIN=0.6;')
    && dlc.includes('_CYCLE_FAT_MIN') && dlc.includes('_PROT_MIN_GKG') && !/\*0\.[68]\)/.test(dlc)
    && mfk.includes('(S.bw||0)*_PROT_MIN_GKG') && !/\(S\.bw\|\|0\)\*0\.8\)/.test(mfk), 'seuil écrit en dur ou propriétaire absent');
  t('B-CDXV ③ la cible n\'est jamais touchée : `calcMacros` rend `manual||auto`, `autoKcal` inchangé',
    ST.includes('constcalories=manual||auto;') && ST.includes('functionautoKcal(phase){constb=_autoKcalBrut(phase);returnb==null?null:_plancherKcal(b);}')
    && ST.includes('returntdee+goalDelta+phaseAdj+lutealBonus;'), 'la cible a été modifiée');
  t('B-CDXV ④ le cycle ne cycle pas une répartition comprimée, et borne les glucides du jour de repos à 0',
    cyc.includes('if(m.ajuste)returnm;') && cyc.includes('constajoutMax=Math.max(0,(kcal-m.prot_g*4-m.fat_g*9)/9);')
    && cyc.includes('if(rMoy>0&&ajout(D)>ajoutMax)D=ajoutMax/(rMoy*f/7);'), 'borne du cycle absente');
  t('B-CDXV ⑤ `calcMacros` expose `ajuste` — l\'écran et Milo le lisent sans refaire le calcul (R2)',
    ST.includes('ajuste:(base&&base.ajuste)||null') && !/_ajusteMacrosHTML[^]*?\*9/.test(corps(SC, '_ajusteMacrosHTML'))
    && !/\*9/.test(corps(CO, '_macrosAjusteTxt')), 'ajuste non exposé ou calcul refait');
  t('B-CDXV ⑥ Milo : un vrai 0 g s\'écrit 0 (`_gMac`), la note d\'ajustement suit la ligne des macros',
    CO.includes("function_gMac(v){returnv==null?'—':v;}")
    && CO.includes('Protéines:${_gMac(macros.prot_g)}g|Glucides:${_gMac(macros.carbs_g)}g|Lipides:${_gMac(macros.fat_g)}g')
    && CO.includes('${_macrosAjusteTxt(macros)}${_cibleDetailTxt()}'), 'ligne des macros de Milo modifiée');
  t('B-CDXV ⑦ l\'écran : `nu-ajuste` (sous les macros) et `kcal-pv-note` (aperçu du réglage manuel) existent',
    /<div id="nu-ajuste"><\/div>/.test(IH) && /<div id="kcal-pv-note"><\/div>/.test(IH)
    && SC.includes("_aj.innerHTML=_ajusteMacrosHTML(macros,macros.calories)"), 'élément ou appel absent');
  t('B-CDXV ⑧ le texte de la fenêtre manuelle ne promet plus « protéines et lipides restent calés » sans réserve',
    /les lipides baissent d'abord, puis les protéines — jamais sous un minimum/.test(IH), 'texte non corrigé');
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
  console.log('\n-- B-CDXVI. B3 — le moteur conduit (cas mesurés + propriétés sur une grille) --');
  const R = await pg.evaluate(({ P, poserSrc }) => {
    const poser = eval(poserSrc);
    const lire = (ph) => { const m = calcMacros(ph == null ? S.nutritionPhase : ph);
      const ok = m.prot_g != null && m.calories != null;
      return { cal: m.calories, auto: autoKcal(S.nutritionPhase), P: m.prot_g, L: m.fat_g, G: m.carbs_g,
               k: ok ? m.prot_g * 4 + m.fat_g * 9 + m.carbs_g * 4 : null, aj: m.ajuste || null,
               cyc: m.cycle ? { jour: m.cycle.jour, dCarbs: m.cycle.dCarbs, autre: m.cycle.autre } : null,
               dec: (typeof cibleDecomposition === 'function') ? cibleDecomposition(S.nutritionPhase) : null }; };
    const o = {};
    const cas = (nom, D, ses) => { poser(D, ses); o[nom] = lire(); };
    cas('A1', P.A1); cas('A1perte', Object.assign({}, P.A1, { ft4_goal: 'perte' }));
    cas('A1dech', Object.assign({}, P.A1, { ft4_goal: 'perte', ft4_nphase: 'decharge' }));
    cas('A1maint', Object.assign({}, P.A1, { ft4_goal: 'equilibre' }));
    cas('A1seance', P.A1, [0, 2, 4, 6]); cas('A1repos', P.A1, [1, 2, 4, 6]);
    cas('D1charge', Object.assign({}, P.D1, { ft4_nphase: 'charge' })); cas('D1', P.D1);
    cas('D1seance', P.D1, [0, 3]); cas('D1repos', P.D1, [1, 4]);
    cas('D1recomp', Object.assign({}, P.D1, { ft4_goal: 'recomp' })); cas('D1muscle', Object.assign({}, P.D1, { ft4_goal: 'muscle' }));
    cas('D2', P.D2); cas('D2charge', Object.assign({}, P.D2, { ft4_age: '30', ft4_nphase: 'charge' }));
    cas('GAP', P.GAP); cas('DECL1200', Object.assign({}, P.DECL, { ft4_manualkcal: '1200' }));
    cas('DECL2500', Object.assign({}, P.DECL, { ft4_manualkcal: '2500' }));
    cas('KETO', P.KETO); cas('KETOD1', Object.assign({}, P.D1, { ft4_foodmode: 'keto' }));
    cas('LOWD1', Object.assign({}, P.D1, { ft4_foodmode: 'lowcarb' }));
    cas('CYCseance', P.CYC, [0, 1, 2, 3, 4, 5]); cas('CYCrepos', P.CYC, [1, 2, 3, 4, 5, 6]);
    cas('B1', P.B1); cas('B2', P.B2);
    /* Même profil, séance du jour = BRAS (région 0,8) sur un historique de JAMBES (1,25) : le jour de repos
       est estimé sur la moyenne des séances (`rMoy`), pas sur celle du jour — la borne doit employer la même. */
    poser(P.CYC, [0, 1, 2, 3, 4, 5]);
    S.sessions.forEach(x => { if (x.date === today()) x.exs = [{ name: 'Curl Biceps Haltères', sets: [{ kg: 15, reps: 10, done: true }] }]; });
    o.CYCbras = lire();
    /* ── Grille : affectation directe de S (mêmes champs que load()), contrôlée plus haut par les cas. ── */
    poser(P.A1);
    const plain = () => { const g = S.manualKcal; const x = macrosForKcal(1e6); S.manualKcal = g; return x; };
    const sem = (jours) => { const T = new Date('2026-09-20T12:00:00'), s = [];
      for (let d = 0; d < 28; d++) { const x = new Date(T - d * 864e5); if (jours.includes(x.getDay()))
        s.push({ date: x.toISOString().slice(0, 10), exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, done: true }] }] }); } return s; };
    const g = { n: 0, tenait: 0, change: 0, comprime: 0, horsTol: [], cibleBouge: 0, ordre: 0, plancher: 0, sousMin: 0, autreHors: 0, neutre: 0 };
    ['H', 'F'].forEach(sx => [50, 70, 90, 110, 130, 150, 180, 220, 260, 300].forEach(bw => [155, 185].forEach(h => [25, 75].forEach(a =>
      [1.2, 1.55, 1.9].forEach(ac => ['muscle', 'force', 'perte', 'recomp', 'equilibre', 'endurance'].forEach(goal =>
        ['charge', 'decharge'].forEach(ph => [null, [0, 2, 4], [1, 3, 5], [0, 1, 2, 3, 4, 5]].forEach(ses =>
          (sx === 'F' ? [false, true] : [false]).forEach(lut => {
            S.gender = sx; S.bw = bw; S.height = h; S.age = a; S.activityLevel = ac; S.activitySrc = 'choisi'; S.goal = goal;
            S.nutritionPhase = ph; S.workType = 'bureau'; S.smoker = false; S.manualKcal = 0; S.coachQuiz = null; S.bodyScans = [];
            S.weightLog = []; S.foodMode = ''; S.keto = false; S.wkt = null; S.sessions = ses ? sem(ses) : [];
            S.mensCycleStart = lut ? '2026-08-31' : ''; S.contraception = '';
            g.n++;
            const r = lire(ph), pl = plain(), lMin = Math.round(bw * 0.6), pMin = Math.round(bw * 0.8);
            if (r.cal !== autoKcal(ph)) g.cibleBouge++;
            const tol = r.cyc ? 6 : 2;
            if (Math.abs(r.k - r.cal) > tol && !(r.aj && r.aj.depasse > 0 && r.k - r.cal === r.aj.depasse)) g.horsTol.push([sx, bw, h, a, ac, goal, ph, ses, lut, r.k - r.cal]);
            if (r.cyc && r.cyc.autre) { const au = r.cyc.autre; if (Math.abs(r.P * 4 + au.fat_g * 9 + au.carbs_g * 4 - r.cal) > 6) g.autreHors++; }
            if (pl.prot_g * 4 + pl.fat_g * 9 <= r.cal) {
              g.tenait++;
              if (r.aj) g.change++;
              if (!r.cyc && !(r.P === pl.prot_g && r.L === pl.fat_g && r.G === Math.max(0, Math.round((r.cal - pl.prot_g * 4 - pl.fat_g * 9) / 4)))) g.change++;
            } else {
              g.comprime++;
              if (!r.aj || r.cyc) g.change++;
              if (r.P < pl.prot_g && r.L !== lMin) g.ordre++;            // les protéines ne cèdent qu'après les lipides
              if (r.L < lMin || r.P < pMin) g.sousMin++;
              if (r.aj && r.aj.depasse > 0 && !(r.L === lMin && r.P === pMin)) g.plancher++;
            }
          })))))))));
    o.grille = { n: g.n, tenait: g.tenait, comprime: g.comprime, change: g.change, horsTol: g.horsTol.length, exHors: g.horsTol.slice(0, 3),
                 cibleBouge: g.cibleBouge, ordre: g.ordre, sousMin: g.sousMin, plancher: g.plancher, autreHors: g.autreHors };
    /* ── Neutralité hebdomadaire du cycle borné (profil CYC, 1 à 6 séances/sem) ── */
    o.neutre = {};
    poser(P.CYC);
    [1, 2, 3, 4, 5, 6].forEach(f => {
      const base = sem([1, 2, 3, 4, 5, 6].slice(0, f));          // jours de séance hors dimanche → aujourd'hui = repos
      S.sessions = base; const rep = calcMacros(S.nutritionPhase);
      S.sessions = sem([0].concat([1, 2, 3, 4, 5, 6].slice(0, f - 1))); const sea = calcMacros(S.nutritionPhase);
      S.sessions = []; const nu = macrosForKcal(sea.calories);
      o.neutre[f] = { ecart: Math.round(f * sea.carbs_g + (7 - f) * rep.carbs_g - 7 * nu.carbs_g), repos: rep.carbs_g,
                      kRep: rep.prot_g * 4 + rep.fat_g * 9 + rep.carbs_g * 4 - rep.calories,
                      kSea: sea.prot_g * 4 + sea.fat_g * 9 + sea.carbs_g * 4 - sea.calories };
    });
    /* ── Cibles manuelles : standard, kéto, low carb ── */
    const man = { n: 0, horsTol: 0, ex: [], nonDeclare: 0, lowcarb: 0 };
    [800, 1000, 1200, 1500, 2000, 3000].forEach(k => [50, 80, 100, 130, 180, 250, 300].forEach(bw => ['muscle', 'perte', 'recomp', 'endurance'].forEach(goal =>
      ['', 'keto', 'lowcarb'].forEach(md => [null, [0, 2, 4]].forEach(ses => {
        S.gender = 'H'; S.bw = bw; S.height = 175; S.age = 40; S.activityLevel = 1.55; S.goal = goal; S.nutritionPhase = 'charge';
        S.manualKcal = k; S.foodMode = md; S.keto = (md === 'keto'); S.sessions = ses ? sem(ses) : []; S.mensCycleStart = '';
        man.n++;
        const r = lire('charge'); const tol = md ? 8 : (r.cyc ? 6 : 2); const e = r.k - r.cal;
        if (r.cal !== k) man.horsTol++;
        if (e > tol || e < -tol) {
          if (!(r.aj && r.aj.depasse > 0 && e === r.aj.depasse)) { man.nonDeclare++; if (man.ex.length < 3) man.ex.push([k, bw, goal, md, ses, e, r.aj]); }
        }
        if (md === 'lowcarb' && r.aj) man.lowcarb++;
      })))));
    o.man = man;
    return o;
  }, { P: PROFILS, poserSrc: _poser });

  const det = o => JSON.stringify(o);
  const q = (o, P, L, G, cal) => o && o.P === P && o.L === L && o.G === G && (cal == null || o.cal === cal);
  const ecart = o => o.k - o.cal;
  // A1 — identique au code d'avant (valeurs mesurées sur master 105d4e20)
  t('B-CDXVI A1 H 85 kg · 180 · 40 a · Modéré : muscle 3209 → 187/77/442, rien d\'ajusté',
    q(R.A1, 187, 77, 442, 3209) && !R.A1.aj && ecart(R.A1) === 0, det(R.A1));
  t('B-CDXVI A1 perte (charge 2409 → 213/68/236 ; décharge 2209 → 213/68/186) et maintien (2859 → 170/72/383) : inchangés',
    q(R.A1perte, 213, 68, 236, 2409) && q(R.A1dech, 213, 68, 186, 2209) && q(R.A1maint, 170, 72, 383, 2859)
    && !R.A1perte.aj && !R.A1dech.aj && !R.A1maint.aj, [R.A1perte, R.A1dech, R.A1maint].map(det).join(' | '));
  t('B-CDXVI A1 cycle 4 séances/sem : séance 187/65/470, repos 187/94/405 — inchangés',
    q(R.A1seance, 187, 65, 470) && q(R.A1repos, 187, 94, 405) && R.A1seance.cyc && R.A1repos.cyc, det(R.A1seance) + ' | ' + det(R.A1repos));
  // D1 — le cas du défaut
  t('B-CDXVI D1 charge ⭐ cible 2132 gardée : lipides 104 → 92 g, protéines 325 intactes, total = cible',
    q(R.D1charge, 325, 92, 1, 2132) && R.D1charge.auto === 2132 && ecart(R.D1charge) === 0
    && R.D1charge.aj && R.D1charge.aj.fat_de === 104 && R.D1charge.aj.prot_de === 325 && R.D1charge.aj.depasse === 0, det(R.D1charge));
  t('B-CDXVI D1 décharge ⭐ cible 1932 gardée : lipides 104 → 78 g (0,6 g/kg) PUIS protéines 325 → 307 g, total 1934 (arrondi)',
    q(R.D1, 307, 78, 1, 1932) && R.D1.auto === 1932 && Math.abs(ecart(R.D1)) <= 2 && R.D1.aj && R.D1.aj.depasse === 0, det(R.D1));
  t('B-CDXVI D1 décharge + cycle : un jour de séance ET un jour de repos rendent 307/78/1 (plus de 2 326 kcal le jour de repos)',
    q(R.D1seance, 307, 78, 1, 1932) && q(R.D1repos, 307, 78, 1, 1932) && !R.D1seance.cyc && !R.D1repos.cyc, det(R.D1seance) + ' | ' + det(R.D1repos));
  t('B-CDXVI D1 recomp (2132 → 338/86/2, lipides d\'abord) ; D1 muscle 2732 → 286/117/134 intact',
    q(R.D1recomp, 338, 86, 2, 2132) && R.D1recomp.aj && q(R.D1muscle, 286, 117, 134, 2732) && !R.D1muscle.aj, det(R.D1recomp) + ' | ' + det(R.D1muscle));
  t('B-CDXVI D1 la décomposition de la cible pour Milo tient toujours (1932 = calcul de l\'app)',
    R.D1.dec && R.D1.dec.cible === 1932 && !R.D1.dec.manuelle, det(R.D1.dec));
  // D2 — petit gabarit, plancher
  t('B-CDXVI D2 F 45 kg perte : plancher 1200 → 113/36/106, total = 1200, rien d\'ajusté (70 a et 30 a)',
    q(R.D2, 113, 36, 106, 1200) && q(R.D2charge, 113, 36, 106, 1200) && !R.D2.aj && ecart(R.D2) === 0, det(R.D2) + ' | ' + det(R.D2charge));
  // Cibles manuelles
  t('B-CDXVI manuel 1200 (85,9 kg, force) : 1200 gardés, lipides 86 → 56 g, total 1200',
    q(R.DECL1200, 172, 56, 2, 1200) && ecart(R.DECL1200) === 0 && R.DECL1200.aj && R.DECL1200.aj.fat_de === 86, det(R.DECL1200));
  t('B-CDXVI manuel 800 à 100 kg ⭐ l\'écart est DÉCLARÉ : minimums 80/60 g = 860 kcal, dépasse de 60, cible 800 intacte',
    q(R.GAP, 80, 60, 0, 800) && ecart(R.GAP) === 60 && R.GAP.aj && R.GAP.aj.depasse === 60 && R.GAP.aj.prot_de === 250 && R.GAP.aj.fat_de === 80, det(R.GAP));
  t('B-CDXVI manuel 2500 (85,9 kg, force) : résidu habituel, rien d\'ajusté',
    q(R.DECL2500, 172, 86, 260, 2500) && !R.DECL2500.aj && Math.abs(ecart(R.DECL2500)) <= 2, det(R.DECL2500));
  t('B-CDXVI kéto 250 kg à 800 kcal : chiffres du régime inchangés (200/0/10), écart de 40 kcal DÉCLARÉ',
    q(R.KETO, 200, 0, 10, 800) && R.KETO.aj && R.KETO.aj.depasse === 40, det(R.KETO));
  t('B-CDXVI kéto et low carb sur D1 : inchangés (104/158/24 et 145/97/121), rien d\'ajusté',
    q(R.KETOD1, 104, 158, 24, 1932) && !R.KETOD1.aj && q(R.LOWD1, 145, 97, 121, 1932) && !R.LOWD1.aj, det(R.KETOD1) + ' | ' + det(R.LOWD1));
  // Profils incomplets (contrat D-016 inchangé)
  t('B-CDXVI B1 sans poids : cible et macros nulles, rien d\'ajusté ; B2 2000 kcal à la main sans poids : 2000 gardés, macros nulles',
    R.B1.cal == null && R.B1.P == null && R.B1.G == null && !R.B1.aj && R.B2.cal === 2000 && R.B2.P == null && R.B2.L == null && R.B2.G == null && !R.B2.aj,
    det(R.B1) + ' | ' + det(R.B2));
  // Le cycle borné
  const cs = R.CYCseance, cr = R.CYCrepos;
  t('B-CDXVI cycle ⭐ 80 kg · 1 500 kcal · 6 séances : le jour de repos ne dépasse plus (était +65 kcal), aujourd\'hui ±6',
    cs.cyc && cs.cyc.autre && Math.abs(cs.P * 4 + cs.cyc.autre.fat_g * 9 + cs.cyc.autre.carbs_g * 4 - cs.cal) <= 6
    && Math.abs(ecart(cs)) <= 6 && q(cs, 200, 62, 36, 1500) && cs.cyc.autre.fat_g === 78 && cs.cyc.autre.carbs_g === 0, det(cs));
  const cb = R.CYCbras;
  t('B-CDXVI cycle, séance de BRAS sur un historique de jambes : le jour de repos (estimé sur la moyenne) reste à ±6 kcal',
    cb.cyc && cb.cyc.jour === 'seance' && cb.cyc.autre && Math.abs(cb.P * 4 + cb.cyc.autre.fat_g * 9 + cb.cyc.autre.carbs_g * 4 - cb.cal) <= 6
    && Math.abs(ecart(cb)) <= 6, det(cb));
  t('B-CDXVI cycle même profil, aujourd\'hui = repos : total du jour = cible (±6), glucides ≥ 0',
    cr.cyc && Math.abs(ecart(cr)) <= 6 && cr.G >= 0, det(cr));
  const nt = R.neutre;
  t('B-CDXVI cycle borné : la neutralité de la semaine tient (1 à 6 séances : ±7 g) et chaque jour reste à ±6 kcal',
    Object.values(nt).every(x => Math.abs(x.ecart) <= 7 && Math.abs(x.kRep) <= 6 && Math.abs(x.kSea) <= 6), det(nt));
  // Propriétés sur la grille
  const G = R.grille;
  t('B-CDXVI grille (' + G.n + ' profils automatiques) ⭐ 0 contradiction hors arrondi, et la cible ne bouge JAMAIS',
    G.n > 15000 && G.horsTol === 0 && G.autreHors === 0 && G.cibleBouge === 0, det(G));
  t('B-CDXVI grille : tout profil dont P et L tiennent garde EXACTEMENT « poids × objectif » et le résidu ; les autres sont ajustés et ne cyclent pas',
    G.tenait > 0 && G.comprime > 0 && G.change === 0, det(G));
  t('B-CDXVI grille : les protéines ne cèdent qu\'après les lipides, jamais sous 0,8 g/kg, lipides jamais sous 0,6 g/kg',
    G.ordre === 0 && G.sousMin === 0 && G.plancher === 0, det(G));
  t('B-CDXVI cibles manuelles (' + R.man.n + ') : cible toujours gardée ; tout écart hors arrondi est DÉCLARÉ à l\'unité ; low carb jamais ajusté',
    R.man.n > 500 && R.man.horsTol === 0 && R.man.nonDeclare === 0 && R.man.lowcarb === 0, det(R.man));
  t('B-CDXVI aucune erreur de page pendant le moteur', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};

module.exports.ecranVue = async function (t, b, PORT) {
  const { cx, pg, errs } = await _page(b, PORT);
  console.log('\n-- B-CDXVII. B3 — ce que la personne LIT (onglet Nutrition + réglage manuel, vrais rechargements) --');
  const voir = async (D) => {
    await pg.evaluate(({ D, poserSrc }) => { eval(poserSrc)(D); }, { D, poserSrc: _poser });
    await pg.reload(); await pg.waitForTimeout(2000);
    return pg.evaluate(async () => {
      goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
      await new Promise(r => setTimeout(r, 300));
      const v = id => { const e = document.getElementById(id); return e ? e.textContent.replace(/[\u202f\u00a0]/g, ' ').trim() : null; };
      return { kcal: v('m-kcal'), P: v('m-prot'), L: v('m-fat'), G: v('m-carbs'), aj: v('nu-ajuste'), cyc: v('nu-cycle') };
    });
  };
  const d1 = await voir(PROFILS.D1);
  t('B-CDXVII D1 à l\'écran : 1 932 kcal · 307 / 78 / 1 g, et UNE phrase dit ce qui a baissé et pourquoi',
    d1.kcal === '1 932' && d1.P === '307' && d1.L === '78' && d1.G === '1'
    && /104 → 78 g/.test(d1.aj) && /325 → 307 g/.test(d1.aj) && /1 932 kcal/.test(d1.aj) && !/dépassent/.test(d1.aj), JSON.stringify(d1));
  const a1 = await voir(PROFILS.A1);
  t('B-CDXVII A1 à l\'écran : 3 209 · 187 / 77 / 442 g, AUCUNE phrase ajoutée',
    a1.kcal === '3 209' && a1.P === '187' && a1.L === '77' && a1.G === '442' && a1.aj === '', JSON.stringify(a1));
  const gap = await voir(PROFILS.GAP);
  t('B-CDXVII 800 kcal à la main, 100 kg : 80 / 60 / 0 g et l\'écart de 60 kcal est DIT (860 kcal, minimums nommés, chiffre non touché)',
    gap.kcal === '800' && gap.P === '80' && gap.L === '60' && gap.G === '0'
    && /dépassent ta cible de 60 kcal/.test(gap.aj) && /860 kcal/.test(gap.aj) && /0,8 g\/kg/.test(gap.aj) && /0,6 g\/kg/.test(gap.aj)
    && /ne touche pas à ton chiffre/.test(gap.aj), JSON.stringify(gap));
  const d2 = await voir(PROFILS.D2);
  t('B-CDXVII D2 à l\'écran : 1 200 · 113 / 36 / 106 g, aucune phrase d\'ajustement',
    d2.kcal === '1 200' && d2.P === '113' && d2.L === '36' && d2.G === '106' && d2.aj === '', JSON.stringify(d2));
  /* Le réglage manuel, conduit : bouton → fenêtre → frappe → aperçu → enregistrer → recharger. */
  await voir(PROFILS.DECL);
  const mod = await pg.evaluate(async () => {
    const btn = [...document.querySelectorAll('#nu-adjust button')].find(x => /Ajuster mes calories/.test(x.textContent));
    if (!btn) return { err: 'bouton introuvable' };
    btn.click(); await new Promise(r => setTimeout(r, 200));
    const ov = document.getElementById('ov-kcal-edit'), inp = document.getElementById('kcal-edit-inp');
    const v = id => { const e = document.getElementById(id); return e ? e.textContent.replace(/[\u202f\u00a0]/g, ' ').trim() : null; };
    const taper = async (x) => { inp.value = String(x); inp.dispatchEvent(new Event('input', { bubbles: true })); await new Promise(r => setTimeout(r, 60));
      return { P: v('kcal-pv-prot'), G: v('kcal-pv-carb'), L: v('kcal-pv-fat'), note: v('kcal-pv-note') }; };
    const o = { ouvert: ov.classList.contains('open'), intro: ov.querySelector('.modal > div:nth-child(2)').textContent };
    o.a1200 = await taper(1200); o.a2500 = await taper(2500); o.a500 = await taper(500); o.a1200b = await taper(1200);
    [...ov.querySelectorAll('button')].find(x => /Enregistrer mes calories/.test(x.textContent)).click();
    await new Promise(r => setTimeout(r, 300));
    return o;
  });
  t('B-CDXVII fenêtre manuelle : le texte annonce que les lipides puis les protéines baissent si le chiffre est trop bas',
    mod.ouvert && /les lipides baissent d'abord, puis les protéines — jamais sous un minimum/.test(mod.intro || ''), JSON.stringify(mod).slice(0, 300));
  t('B-CDXVII aperçu à 1 200 kcal (85,9 kg, force) : 172 / 2 / 56 g et la note dit « lipides 86 → 56 g »',
    mod.a1200 && mod.a1200.P === '172 g' && mod.a1200.G === '2 g' && mod.a1200.L === '56 g' && /86 → 56 g/.test(mod.a1200.note || ''), JSON.stringify(mod.a1200));
  t('B-CDXVII aperçu à 2 500 kcal : aucune note ; à 500 kcal (refusé à l\'enregistrement) : aucune note non plus',
    mod.a2500 && mod.a2500.note === '' && mod.a500 && mod.a500.note === '', JSON.stringify([mod.a2500, mod.a500]));
  await pg.reload(); await pg.waitForTimeout(2000);
  const apres = await pg.evaluate(async () => {
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
    await new Promise(r => setTimeout(r, 300));
    const v = id => { const e = document.getElementById(id); return e ? e.textContent.replace(/[\u202f\u00a0]/g, ' ').trim() : null; };
    return { man: localStorage.getItem('ft4_manualkcal'), kcal: v('m-kcal'), P: v('m-prot'), L: v('m-fat'), G: v('m-carbs'), aj: v('nu-ajuste') };
  });
  t('B-CDXVII enregistré puis rechargé : 1 200 kcal sur le disque, 172 / 56 / 2 g et la phrase d\'ajustement à l\'écran',
    apres.man === '1200' && apres.kcal === '1 200' && apres.P === '172' && apres.L === '56' && apres.G === '2' && /86 → 56 g/.test(apres.aj || ''), JSON.stringify(apres));
  t('B-CDXVII aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};

module.exports.ecranMilo = async function (t, b, PORT) {
  const { cx, pg, errs } = await _page(b, PORT);
  console.log('\n-- B-CDXVIII. B3 — ce que Milo reçoit (contexte construit, 0 appel) --');
  const C = await pg.evaluate(({ P, poserSrc }) => {
    const poser = eval(poserSrc); const o = {};
    const ctx = (nom, D) => { poser(D); const c = buildCoachContext('test');
      o[nom] = c.split('\n').filter(l => /Calories cible|MACROS DÉPASSENT|habituels plus hauts|CALCUL DE LA CIBLE/.test(l)); };
    ctx('D1', P.D1); ctx('GAP', P.GAP); ctx('A1', P.A1); ctx('B1', P.B1); ctx('KETO', P.KETO);
    return o;
  }, { P: PROFILS, poserSrc: _poser });
  const un = (l, re) => (l || []).filter(x => re.test(x)).length;
  t('B-CDXVIII D1 : Milo reçoit 307 / 1 / 78 g et UNE ligne qui dit ce que l\'app a réduit (lipides 104 → 78, protéines 325 → 307)',
    un(C.D1, /^- Calories cible: 1932 kcal \| Protéines: 307g \| Glucides: 1g \| Lipides: 78g$/) === 1
    && un(C.D1, /habituels plus hauts que la cible.*lipides 104 → 78 g, protéines 325 → 307 g/) === 1
    && un(C.D1, /CIBLE 1932 kcal/) === 1 && un(C.D1, /MACROS DÉPASSENT/) === 0, JSON.stringify(C.D1));
  t('B-CDXVIII 800 kcal à la main ⭐ « Glucides: 0g » (et plus « —g ») et l\'écart de 60 kcal est dit à Milo',
    un(C.GAP, /^- Calories cible: 800 kcal \| Protéines: 80g \| Glucides: 0g \| Lipides: 60g$/) === 1
    && un(C.GAP, /MACROS DÉPASSENT LA CIBLE DE 60 kcal.*protéines 0,8 g\/kg, lipides 0,6 g\/kg.*n'est PAS modifiée/) === 1, JSON.stringify(C.GAP));
  t('B-CDXVIII A1 : la ligne des macros est celle d\'avant, sans aucune ligne ajoutée',
    un(C.A1, /^- Calories cible: 3209 kcal \| Protéines: 187g \| Glucides: 442g \| Lipides: 77g$/) === 1
    && un(C.A1, /habituels plus hauts|MACROS DÉPASSENT/) === 0, JSON.stringify(C.A1));
  t('B-CDXVIII profil sans poids : les macros inconnues restent « — » (D-016)',
    un(C.B1, /Protéines: —g \| Glucides: —g \| Lipides: —g/) === 1 && un(C.B1, /habituels plus hauts|MACROS DÉPASSENT/) === 0, JSON.stringify(C.B1));
  t('B-CDXVIII kéto 250 kg à 800 kcal : « Lipides: 0g » et l\'écart de 40 kcal nomme les glucides du kéto',
    un(C.KETO, /Lipides: 0g$/) === 1 && un(C.KETO, /MACROS DÉPASSENT LA CIBLE DE 40 kcal.*glucides du kéto/) === 1, JSON.stringify(C.KETO));
  t('B-CDXVIII aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};
