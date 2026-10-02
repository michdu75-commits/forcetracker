/* ══════════════════════════════════════════════════════════════════════════════════════
   ⚖️ NUTRITION LOT 1 — B3 : LA CIBLE CALORIQUE ET LES MACROS NE SE CONTREDISENT PLUS
   (30/09/2026, session-B, à la demande de Michel) — blocs B-CDXV → B-CDXVIII.

   LE DÉFAUT (docs/NUTRITION-GLUCIDES-2026-09-24.md, cas B3) : P et L sont proportionnels au
   poids TOTAL, la cible ne l'est pas. Quand 4P + 9L dépassait la cible, les glucides (le reste)
   tombaient à 0 et les macros affichées dépassaient la cible sans rien dire — 130 kg en perte et
   décharge : cible 1 932, macros 2 236. Le cycle séance/repos le faisait aussi les jours de repos
   (+65 kcal dès 80 kg). Et Milo lisait « Glucides : — » au lieu de 0.

   L'INVARIANT DEMANDÉ : 4P + 9L + 4G ≈ cible (arrondi) ; sinon l'écart est EXPLICITE et EXPLIQUÉ.
   ⭐ DÉCISION DE MICHEL (30/09, après contre-vérification — D-033 proposée NON validée) : on garde les
   règles macros de master MOT POUR MOT ; aucune réduction, aucun plancher nouveau. Quand 4P + 9L dépasse
   la cible, on CALCULE l'écart réel et on le DIT (écran, aperçu du réglage manuel, Milo). Tout profil
   dont les macros tiennent : strictement identique à master.

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
  console.log('\n═══ B-CDXV. B3 — l\'écart est DIT, les règles macros de master ne bougent pas (source) ═══');
  const mfk = corps(ST, 'macrosForKcal'), cyc = corps(ST, 'cycleGlucides'), inc = corps(ST, '_cibleIncompatible');
  t('B-CDXV ① `macrosForKcal` garde le résidu de master, sans branche de réduction ni nouveau plancher',
    mfk.includes('constcarbs_g=Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4));return{prot_g,fat_g,carbs_g};}')
    && mfk.includes('constprotMini=Math.round((S.bw||0)*0.8);') && !/_macrosDansLaCible|_PROT_MIN_GKG|ajuste/.test(ST),
    'la répartition a été modifiée');
  t('B-CDXV ② le cycle séance/repos est celui de master (aucune borne ajoutée)',
    cyc.length > 0 && !/ajoutMax|m\.ajuste|incompatible/.test(cyc), 'cycleGlucides modifié');
  t('B-CDXV ③ un seul propriétaire de l\'écart : écrêtage à 0 ET dépassement au-delà de l\'arrondi (6 kcal)',
    ST.includes('const_ARRONDI_MACROS_KCAL=6;')
    && inc.includes("constecrete=(carbs_g===0&&fat_g===0)?'glucidesetlipides':(carbs_g===0?'glucides':(fat_g===0?'lipides':null));")
    && inc.includes('return(ecrete&&ecart>_ARRONDI_MACROS_KCAL)?{ecart,macros:Math.round(somme),ecrete}:null;'),
    'critère absent ou modifié');
  t('B-CDXV ④ `calcMacros` le calcule sur le jour ET sur l\'autre bout du cycle, et la cible reste `manual||auto`',
    ST.includes('constinc=calculable?_cibleIncompatible(m.prot_g,m.fat_g,m.carbs_g,calories):null;')
    && ST.includes('_cibleIncompatible(m.prot_g,m.cycle.autre.fat_g,m.cycle.autre.carbs_g,calories)')
    && ST.includes('constcalories=manual||auto;')
    && ST.includes('functionautoKcal(phase){constb=_autoKcalBrut(phase);returnb==null?null:_plancherKcal(b);}'), 'appel ou cible modifiés');
  t('B-CDXV ⑤ écran, aperçu du réglage manuel et Milo LISENT l\'écart, aucun ne le recalcule (R2)',
    SC.includes("_inc.innerHTML=_incompatibleHTML(macros);")
    && SC.includes('try{S.manualKcal=v;sim=calcMacros(S.nutritionPhase);}catch(e){sim=null;}finally{S.manualKcal=gard;}')
    && SC.includes("nt.innerHTML=sim?_incompatibleHTML(sim):'';")
    && !/\*9/.test(corps(SC, '_incompatibleHTML')) && !/\*9/.test(corps(CO, '_incompatibleTxt'))
    && /<div id="nu-incompatible"><\/div>/.test(IH) && /<div id="kcal-pv-note"><\/div>/.test(IH), 'lecture absente ou calcul refait');
  t('B-CDXV ⑥ Milo : un vrai 0 g s\'écrit 0 (`_gMac`), la ligne d\'écart suit celle des macros',
    CO.includes("function_gMac(v){returnv==null?'—':v;}")
    && CO.includes('Protéines:${_gMac(macros.prot_g)}g|Glucides:${_gMac(macros.carbs_g)}g|Lipides:${_gMac(macros.fat_g)}g')
    && CO.includes('${_incompatibleTxt(macros)}${_cibleDetailTxt()}'), 'ligne des macros de Milo modifiée');
  t('B-CDXV ⑦ enregistrer une cible incompatible ne dit plus « ✅ » (ne pas laisser croire qu\'elle est validée)',
    corps(SC, 'saveKcalEdit').includes("const_jours=_joursIncompatibles(calcMacros(S.nutritionPhase));if(_jours.length)toast(_toastIncompatible(_jours),'info');"), 'toast inchangé');
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

/* 🥑 NUT-LIPIDES-25-01 (02/10/2026, décision de Michel) — LE CYCLE ET D-034 NE COEXISTENT PLUS.
   Lipides = 25 % de la cible : un cycle séance/repos actif exige lipides > 0,6 g/kg (plancher `_CYCLE_FAT_MIN`,
   inchangé), donc cible > 21,6 × poids ; un écart D-034 exige 4P > 0,75 × cible, donc cible < 5,33 × P ≤ 14,9 × poids
   (P ≤ 2,8 g/kg, phase lutéale comprise). Les deux plages sont DISJOINTES, et le jour de repos d'un cycle actif garde
   des glucides (≥ 0,058 × cible avant transfert, transfert ≤ 0,028 × cible). Mesuré : 0 sur la grille dense ci-dessous.
   ⭐ CHAQUE ANCIEN TÉMOIN « JOUR DE CYCLE » EST DEVENU DEUX TÉMOINS :
     RÉEL — le contrat validé, sur un vrai profil : le cycle est refusé par le plancher (rien n'est modifié, rien
            de faux n'est affiché) ou actif (plancher respecté, total tenu) ;
     SYNTHÉTIQUE — la même assertion qu'avant, avec la sortie du moteur de cycle FORCÉE (`_forcer`) : le code
            d'affichage « jour par jour » est CONSERVÉ (preuve d'inutilité = la seule règle des 25 % ; il redeviendrait
            atteignable si le plancher du cycle changeait) et reste ainsi couvert. ⛔ Un témoin synthétique ne prouve
            PAS qu'un profil réel l'atteint — il prouve que le code conservé dit encore juste. */
const _forcer = `(SPEC) => {
  if (!window.__cgOrig) window.__cgOrig = cycleGlucides;
  window.cycleGlucides = function (m, kcal) {
    const s = SPEC[kcal]; if (!s || !m || m.prot_g == null) return window.__cgOrig(m, kcal);
    return { prot_g: m.prot_g, fat_g: s.L, carbs_g: s.G,
             cycle: { jour: s.jour, freq: 3, dFat: s.L - m.fat_g, dCarbs: s.G - m.carbs_g, region: s.jour === 'seance' ? 1 : null,
                      autre: { jour: s.jour === 'seance' ? 'repos' : 'seance', fat_g: s.aL, carbs_g: s.aG, estime: s.jour !== 'seance' } } };
  };
}`;
/* Les sorties forcées rejouent EXACTEMENT celles de master avant NUT-LIPIDES-25-01 (lipides en g/kg). */
const SPEC = {
  D1S: { 1932: { jour: 'seance', L: 78, G: 0, aL: 114, aG: 0 } },      // D1 séance : +70 (2 002) · repos +394 (2 326)
  D1R: { 1932: { jour: 'repos', L: 114, G: 0, aL: 78, aG: 0 } },
  CYCS: { 1500: { jour: 'seance', L: 61, G: 39, aL: 85, aG: 0 } },     // 80 kg · 1 500 : aujourd'hui tient, repos +65 (1 565)
  P80R: { 1400: { jour: 'repos', L: 81, G: 0, aL: 50, aG: 37 } },      // 80 kg · 1 400 : repos aujourd'hui +129 (1 529)
};

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
  console.log('\n-- B-CDXVI. B3 — le moteur conduit : chiffres de master, écart déclaré (cas mesurés + grille) --');
  const R = await pg.evaluate(({ P, poserSrc, forcerSrc, SPEC }) => {
    const poser = eval(poserSrc), forcer = eval(forcerSrc);
    const lire = (ph) => { const m = calcMacros(ph == null ? S.nutritionPhase : ph);
      const ok = m.prot_g != null && m.calories != null;
      return { cal: m.calories, P: m.prot_g, L: m.fat_g, G: m.carbs_g, k: ok ? m.prot_g * 4 + m.fat_g * 9 + m.carbs_g * 4 : null,
               inc: m.incompatible || null, cyc: m.cycle ? { jour: m.cycle.jour, autre: m.cycle.autre } : null,
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
    cas('CYCseance', P.CYC, [0, 1, 2, 3, 4, 5]); cas('CYCsans', P.CYC);
    cas('B1', P.B1); cas('B2', P.B2);
    /* SYNTHÉTIQUE : moteur de cycle forcé (sorties de master), puis remis */
    forcer(SPEC.D1S); cas('sD1seance', P.D1, [0, 3]); forcer(SPEC.D1R); cas('sD1repos', P.D1, [1, 4]);
    forcer(SPEC.CYCS); cas('sCYCseance', P.CYC, [0, 1, 2, 3, 4, 5]);
    window.cycleGlucides = window.__cgOrig;
    o.stubRemis = (cycleGlucides === window.__cgOrig);
    /* ── GRILLE DENSE DU NOUVEAU CONTRAT : cibles 800 → 6 000, poids 20 → 300, 6 objectifs, H / F / F lutéale,
       1 · 3 · 5 séances par semaine, aujourd'hui séance OU repos. Cible à la main pour couvrir toutes les cibles. ── */
    {
      const semD = (jours) => { const T = new Date('2026-09-20T12:00:00'), s = [];
        for (let d = 0; d < 28; d++) { const x = new Date(T - d * 864e5); if (jours.includes(x.getDay()))
          s.push({ date: x.toISOString().slice(0, 10), exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, done: true }] }] }); } return s; };
      const SES = [[0], [1], [0, 2, 4], [1, 3, 5], [0, 1, 2, 3, 5], [1, 2, 3, 4, 5]].map(semD);   // dimanche 20/09 = séance / repos
      const c = { n: 0, actif: 0, refuse: 0, coexist: 0, plancher: 0, total: 0, protBouge: 0, refuseModifie: 0, d034Faux: 0, d034: 0 };
      for (let K = 800; K <= 6000; K += 200) for (let bw = 20; bw <= 300; bw += 20)
        for (const goal of ['muscle', 'force', 'perte', 'recomp', 'equilibre', 'endurance'])
          for (const sx of ['H', 'F', 'FL']) for (const ses of SES) {
            S.gender = sx === 'H' ? 'H' : 'F'; S.bw = bw; S.height = 175; S.age = 40; S.activityLevel = 1.55; S.activitySrc = 'choisi';
            S.goal = goal; S.nutritionPhase = 'charge'; S.workType = 'bureau'; S.smoker = false; S.manualKcal = K; S.coachQuiz = null;
            S.bodyScans = []; S.weightLog = []; S.foodMode = ''; S.keto = false; S.wkt = null; S.sessions = ses;
            S.mensCycleStart = sx === 'FL' ? '2026-09-01' : ''; S.contraception = '';
            const m = calcMacros('charge'), base = macrosForKcal(K); c.n++;
            if (m.prot_g !== base.prot_g) c.protBouge++;
            const somme = (L, G) => m.prot_g * 4 + L * 9 + G * 4;
            if (m.cycle) {
              c.actif++;
              const au = m.cycle.autre, fSeance = m.cycle.jour === 'seance' ? m.fat_g : au.fat_g;
              if (fSeance < bw * 0.6 - 0.5) c.plancher++;                                   // le garde-fou 0,6 g/kg tient
              if (Math.abs(somme(m.fat_g, m.carbs_g) - K) > 6 || Math.abs(somme(au.fat_g, au.carbs_g) - K) > 6) c.total++;
              if (m.incompatible) c.coexist++;                                                // cycle actif ET écart : impossible
            } else {
              c.refuse++;
              if (m.fat_g !== base.fat_g || m.carbs_g !== base.carbs_g) c.refuseModifie++;   // refusé = rien n'est touché
              const e = somme(m.fat_g, m.carbs_g) - K, att = ((m.carbs_g === 0 || m.fat_g === 0) && e > 6) ? e : null;
              if ((m.incompatible ? m.incompatible.ecart : null) !== att) c.d034Faux++;
              if (m.incompatible) c.d034++;
            }
          }
      S.manualKcal = 0; S.sessions = []; S.mensCycleStart = '';
      o.dense = c;
    }
    /* ── Grille : affectation directe de S (mêmes champs que load()) ── */
    poser(P.A1);
    const plain = () => { const x = macrosForKcal(1e6); return x; };
    const sem = (jours) => { const T = new Date('2026-09-20T12:00:00'), s = [];
      for (let d = 0; d < 28; d++) { const x = new Date(T - d * 864e5); if (jours.includes(x.getDay()))
        s.push({ date: x.toISOString().slice(0, 10), exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, done: true }] }] }); } return s; };
    const attendu = (P_, L, G, cal) => { const e = P_ * 4 + L * 9 + G * 4 - cal; return ((G === 0 || L === 0) && e > 6) ? e : 0; };
    const verifier = (r, acc) => {
      acc.n++;
      const eJ = attendu(r.P, r.L, r.G, r.cal), au = r.cyc && r.cyc.autre, eA = au ? attendu(r.P, au.fat_g, au.carbs_g, r.cal) : 0;
      const decl = r.inc ? (r.inc.ecart || 0) : 0, declA = r.inc && r.inc.autre ? r.inc.autre.ecart : 0;
      if ((eJ > 0 || eA > 0) !== !!r.inc) acc.presence++;
      if (decl !== eJ || declA !== eA) acc.valeur++;
      if (r.inc && r.inc.ecart > 0 && r.inc.macros !== r.k) acc.macros++;
      if (eJ || eA) acc.declares++;
    };
    const g = { n: 0, presence: 0, valeur: 0, macros: 0, declares: 0, cibleBouge: 0, regles: 0 };
    ['H', 'F'].forEach(sx => [50, 70, 90, 110, 130, 150, 180, 220, 260, 300].forEach(bw => [155, 185].forEach(h => [25, 75].forEach(a =>
      [1.2, 1.55, 1.9].forEach(ac => ['muscle', 'force', 'perte', 'recomp', 'equilibre', 'endurance'].forEach(goal =>
        ['charge', 'decharge'].forEach(ph => [null, [0, 2, 4], [1, 3, 5], [0, 1, 2, 3, 4, 5]].forEach(ses =>
          (sx === 'F' ? [false, true] : [false]).forEach(lut => {
            S.gender = sx; S.bw = bw; S.height = h; S.age = a; S.activityLevel = ac; S.activitySrc = 'choisi'; S.goal = goal;
            S.nutritionPhase = ph; S.workType = 'bureau'; S.smoker = false; S.manualKcal = 0; S.coachQuiz = null; S.bodyScans = [];
            S.weightLog = []; S.foodMode = ''; S.keto = false; S.wkt = null; S.sessions = ses ? sem(ses) : [];
            S.mensCycleStart = lut ? '2026-08-31' : ''; S.contraception = '';
            const r = lire(ph), pl = plain();
            if (r.cal !== autoKcal(ph)) g.cibleBouge++;
            /* les règles de master : P et L = poids × objectif, le reste en glucides (borné à 0) */
            /* NUT-LIPIDES-25-01 : les lipides des modes standards sont 25 % de la cible (plus un g/kg) */
            const Le = Math.round(r.cal * 0.25 / 9);
            if (!r.cyc && !(r.P === pl.prot_g && r.L === Le && r.G === Math.max(0, Math.round((r.cal - pl.prot_g * 4 - Le * 9) / 4)))) g.regles++;
            if (r.cyc && r.P !== pl.prot_g) g.regles++;
            verifier(r, g);
          })))))))));
    o.grille = g;
    const man = { n: 0, presence: 0, valeur: 0, macros: 0, declares: 0, cibleBouge: 0 };
    [800, 1000, 1200, 1500, 2000, 3000].forEach(k => [50, 80, 100, 130, 180, 250, 300].forEach(bw => ['muscle', 'perte', 'recomp', 'endurance'].forEach(goal =>
      ['', 'keto', 'lowcarb'].forEach(md => [null, [0, 2, 4]].forEach(ses => {
        S.gender = 'H'; S.bw = bw; S.height = 175; S.age = 40; S.activityLevel = 1.55; S.goal = goal; S.nutritionPhase = 'charge';
        S.manualKcal = k; S.foodMode = md; S.keto = (md === 'keto'); S.sessions = ses ? sem(ses) : []; S.mensCycleStart = '';
        const r = lire('charge'); if (r.cal !== k) man.cibleBouge++;
        verifier(r, man);
      })))));
    o.man = man;
    return o;
  }, { P: PROFILS, poserSrc: _poser, forcerSrc: _forcer, SPEC });

  const det = o => JSON.stringify(o);
  const q = (o, P, L, G, cal) => o && o.P === P && o.L === L && o.G === G && (cal == null || o.cal === cal);
  const inc = (o, e, mac) => o && o.inc && o.inc.ecart === e && (mac == null || o.inc.macros === mac);
  /* NUT-LIPIDES-25-01 (02/10) : lipides des modes standards = 25 % de la cible — valeurs re-mesurées. */
  t('B-CDXVI A1 H 85 kg · 180 · 40 a · Modéré : muscle 3209 → 187/89/415 (lipides 25 %), rien de déclaré',
    q(R.A1, 187, 89, 415, 3209) && !R.A1.inc, det(R.A1));
  t('B-CDXVI A1 perte (2409 → 213/67/239 ; décharge 2209 → 213/61/202), maintien (2859 → 170/79/367) : rien de déclaré',
    q(R.A1perte, 213, 67, 239, 2409) && q(R.A1dech, 213, 61, 202, 2209) && q(R.A1maint, 170, 79, 367, 2859)
    && !R.A1perte.inc && !R.A1dech.inc && !R.A1maint.inc, [R.A1perte, R.A1dech, R.A1maint].map(det).join(' | '));
  t('B-CDXVI A1 cycle 4 séances/sem : séance 187/75/447, repos 187/108/372 — rien de déclaré',
    q(R.A1seance, 187, 75, 447) && q(R.A1repos, 187, 108, 372) && !R.A1seance.inc && !R.A1repos.inc, det(R.A1seance) + ' | ' + det(R.A1repos));
  t('B-CDXVI D1 charge : 325/59/75 pour 2132 — plus d\'écart depuis NUT-LIPIDES-25-01 (avant : 325/104/0, +104 déclaré)',
    q(R.D1charge, 325, 59, 75, 2132) && !R.D1charge.inc, det(R.D1charge));
  t('B-CDXVI D1 décharge : 325/54/37 pour 1932 — plus d\'écart depuis NUT-LIPIDES-25-01 (avant : 325/104/0, +304 déclaré)',
    q(R.D1, 325, 54, 37, 1932) && !R.D1.inc, det(R.D1));
  t('B-CDXVI RÉEL · D1 + séances : le cycle est REFUSÉ par le plancher (54 g < 0,6 × 130 = 78 g), jour de séance ET de repos = 325/54/37, rien de modifié, rien de déclaré',
    q(R.D1seance, 325, 54, 37, 1932) && q(R.D1repos, 325, 54, 37, 1932) && !R.D1seance.cyc && !R.D1repos.cyc
    && !R.D1seance.inc && !R.D1repos.inc, det(R.D1seance) + ' | ' + det(R.D1repos));
  t('B-CDXVI SYNTHÉTIQUE · D1, cycle FORCÉ (sorties de master) : jour de séance +70 (2002) ET jour de repos +394 (2326), les deux déclarés — code conservé',
    q(R.sD1seance, 325, 78, 0, 1932) && inc(R.sD1seance, 70, 2002) && R.sD1seance.inc.autre && R.sD1seance.inc.autre.jour === 'repos'
    && R.sD1seance.inc.autre.ecart === 394 && inc(R.sD1repos, 394, 2326) && R.sD1repos.inc.autre && R.sD1repos.inc.autre.ecart === 70
    && R.stubRemis, det(R.sD1seance) + ' | ' + det(R.sD1repos));
  t('B-CDXVI D1 recomp 338/59/62 (avant 338/111/0, +219) ; D1 muscle 286/76/226 : rien de déclaré',
    q(R.D1recomp, 338, 59, 62, 2132) && !R.D1recomp.inc && q(R.D1muscle, 286, 76, 226, 2732) && !R.D1muscle.inc,
    det(R.D1recomp) + ' | ' + det(R.D1muscle));
  t('B-CDXVI D1 la décomposition de la cible pour Milo est inchangée (1932 = calcul de l\'app)',
    R.D1.dec && R.D1.dec.cible === 1932 && !R.D1.dec.manuelle, det(R.D1.dec));
  t('B-CDXVI D2 F 45 kg perte : plancher 1200 → 113/33/113, rien de déclaré (70 a et 30 a)',
    q(R.D2, 113, 33, 113, 1200) && q(R.D2charge, 113, 33, 113, 1200) && !R.D2.inc && !R.D2charge.inc, det(R.D2) + ' | ' + det(R.D2charge));
  t('B-CDXVI manuel 800 à 100 kg ⭐ 800 gardés, 250/22/0, écart DÉCLARÉ : 1198 kcal, +398 (les protéines seules font 1000 kcal)',
    q(R.GAP, 250, 22, 0, 800) && inc(R.GAP, 398, 1198), det(R.GAP));
  t('B-CDXVI manuel 1200 (85,9 kg, force) : 172/33/54, rien (avant 172/86/0, +262) ; manuel 2500 : 172/69/298, rien',
    q(R.DECL1200, 172, 33, 54, 1200) && !R.DECL1200.inc && q(R.DECL2500, 172, 69, 298, 2500) && !R.DECL2500.inc,
    det(R.DECL1200) + ' | ' + det(R.DECL2500));
  t('B-CDXVI kéto 250 kg à 800 kcal : 200/0/10 (master), +40 déclaré ; kéto et low carb sur D1 : master, rien',
    q(R.KETO, 200, 0, 10, 800) && inc(R.KETO, 40, 840) && q(R.KETOD1, 104, 158, 24, 1932) && !R.KETOD1.inc
    && q(R.LOWD1, 145, 97, 121, 1932) && !R.LOWD1.inc, [R.KETO, R.KETOD1, R.LOWD1].map(det).join(' | '));
  t('B-CDXVI RÉEL · 80 kg · 1500 kcal · 6 séances : cycle REFUSÉ par le plancher (42 g < 48 g), 200/42/81 = sans séance, rien de déclaré',
    q(R.CYCseance, 200, 42, 81, 1500) && q(R.CYCsans, 200, 42, 81, 1500) && !R.CYCseance.cyc && !R.CYCseance.inc, det(R.CYCseance));
  t('B-CDXVI SYNTHÉTIQUE · 80 kg · 1500 kcal, cycle FORCÉ : aujourd\'hui tient (200/61/39), le jour de repos +65 (1565) est DÉCLARÉ — code conservé',
    q(R.sCYCseance, 200, 61, 39, 1500) && R.sCYCseance.inc && R.sCYCseance.inc.ecart === 0 && R.sCYCseance.inc.autre
    && R.sCYCseance.inc.autre.jour === 'repos' && R.sCYCseance.inc.autre.ecart === 65 && R.sCYCseance.inc.autre.macros === 1565, det(R.sCYCseance));
  const DN = R.dense;
  t('B-CDXVI RÉEL · grille dense (' + DN.n + ' profils, cibles 800 → 6000, 20 → 300 kg) ⭐ cycle actif ET écart D-034 : JAMAIS (inatteignable depuis NUT-LIPIDES-25-01)',
    DN.n > 40000 && DN.actif > 5000 && DN.refuse > 5000 && DN.coexist === 0, det(DN));
  t('B-CDXVI RÉEL · grille dense : cycle ACTIF → plancher 0,6 g/kg respecté le jour de séance, total des deux jours = cible (±6), protéines intactes',
    DN.plancher === 0 && DN.total === 0 && DN.protBouge === 0, det(DN));
  t('B-CDXVI RÉEL · grille dense : cycle REFUSÉ → macros = macrosForKcal(cible) au gramme, D-034 exact (écrêtage + > 6 kcal), présent quand il le faut',
    DN.refuseModifie === 0 && DN.d034Faux === 0 && DN.d034 > 1000, det(DN));
  t('B-CDXVI B1 sans poids : tout nul, rien de déclaré ; B2 2000 kcal à la main sans poids : 2000 gardés, macros nulles, rien',
    R.B1.cal == null && R.B1.P == null && !R.B1.inc && R.B2.cal === 2000 && R.B2.P == null && R.B2.G == null && !R.B2.inc,
    det(R.B1) + ' | ' + det(R.B2));
  const G = R.grille, M = R.man;
  t('B-CDXVI grille (' + G.n + ' profils automatiques) ⭐ règles de master intactes, cible jamais modifiée',
    G.n > 15000 && G.regles === 0 && G.cibleBouge === 0, det(G));
  t('B-CDXVI grille : écart déclaré SI ET SEULEMENT SI une macro est écrêtée et que la somme dépasse de plus de 6 kcal — valeur exacte, jour et autre bout',
    G.presence === 0 && G.valeur === 0 && G.macros === 0 && G.declares > 200, det(G));
  t('B-CDXVI cibles manuelles (' + M.n + ', standard / kéto / low carb) : cible gardée, écart déclaré si et seulement si réel, à l\'unité',
    M.n > 500 && M.cibleBouge === 0 && M.presence === 0 && M.valeur === 0 && M.macros === 0 && M.declares > 50, det(M));
  t('B-CDXVI aucune erreur de page pendant le moteur', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};

module.exports.ecranVue = async function (t, b, PORT) {
  const { cx, pg, errs } = await _page(b, PORT);
  console.log('\n-- B-CDXVII. B3 — ce que la personne LIT (onglet Nutrition + réglage manuel, vrais rechargements) --');
  /* `spec` (facultatif) : sortie du moteur de cycle FORCÉE après le rechargement — témoins SYNTHÉTIQUES seulement. */
  const voir = async (D, ses, spec) => {
    await pg.evaluate(({ D, ses, poserSrc }) => { eval(poserSrc)(D, ses); }, { D, ses: ses || null, poserSrc: _poser });
    await pg.reload(); await pg.waitForTimeout(2000);
    if (spec) await pg.evaluate(({ forcerSrc, spec }) => { eval(forcerSrc)(spec); }, { forcerSrc: _forcer, spec });
    return pg.evaluate(async () => {
      goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
      await new Promise(r => setTimeout(r, 300));
      const v = id => { const e = document.getElementById(id); return e ? e.textContent.replace(/[\u202f\u00a0]/g, ' ').trim() : null; };
      return { kcal: v('m-kcal'), P: v('m-prot'), L: v('m-fat'), G: v('m-carbs'), inc: v('nu-incompatible'), cycle: v('nu-cycle') || '' };
    });
  };
  const d1 = await voir(PROFILS.D1);
  /* NUT-LIPIDES-25-01 (02/10) : D1 tient sa cible (325 / 54 / 37) ; le cas « glucides écrêtés » à l'écran
     est porté par 800 kcal à la main (GAP, plus bas) et par `tests/parcours/nutri_lipides25.js` (T4). */
  t('B-CDXVII D1 à l\'écran : 1 932 kcal · 325 / 54 / 37 g, plus de phrase d\'incompatibilité depuis NUT-LIPIDES-25-01',
    d1.kcal === '1 932' && d1.P === '325' && d1.L === '54' && d1.G === '37' && d1.inc === '', JSON.stringify(d1));
  const ke = await voir(PROFILS.KETO);
  t('B-CDXVII B · kéto 250 kg à 800 kcal (lipides écrêtés) : la phrase nomme les LIPIDES, pas les glucides ; chiffres de master 200 / 0 / 10',
    ke.P === '200' && ke.L === '0' && ke.G === '10' && /les lipides tombent à 0/.test(ke.inc) && !/glucides tombent/.test(ke.inc)
    && /glucides kéto/.test(ke.inc) && /840 kcal/.test(ke.inc), JSON.stringify(ke));
  const lc = await voir(Object.assign({}, PROFILS.DECL, { ft4_manualkcal: '1050', ft4_foodmode: 'lowcarb' }));
  t('B-CDXVII D · low carb 1 050 kcal : 66 / 79 / 53 g (master, +7 kcal de pur arrondi, rien d\'écrêté) → AUCUNE phrase',
    lc.P === '79' && lc.G === '66' && lc.L === '53' && lc.inc === '', JSON.stringify(lc));
  const d1r = await voir(PROFILS.D1, [0, 3]);
  t('B-CDXVII RÉEL · D1 un jour de séance : cycle refusé par le plancher → 1 932 · 325 / 54 / 37, AUCUNE carte de cycle, aucune phrase, aucun « jour de séance / repos »',
    d1r.kcal === '1 932' && d1r.P === '325' && d1r.L === '54' && d1r.G === '37' && d1r.inc === '' && d1r.cycle === ''
    && !/Jour de séance|Jour de repos|jour de repos|au repos/.test(d1r.inc + d1r.cycle), JSON.stringify(d1r));
  const d1s = await voir(PROFILS.D1, [0, 3], SPEC.D1S);
  t('B-CDXVII SYNTHÉTIQUE · D1, cycle FORCÉ : chaque jour est NOMMÉ avec son écart (séance, aujourd\'hui : 2 002, +70 ; repos : 2 326, +394) — code conservé',
    /Un jour de séance \(aujourd'hui\) : tes macros font 2 002 kcal, soit 70 kcal de plus/.test(d1s.inc)
    && /Un jour de repos : tes macros font 2 326 kcal, soit 394 kcal de plus/.test(d1s.inc) && /Ces jours-là/.test(d1s.inc), JSON.stringify(d1s));
  const a1 = await voir(PROFILS.A1);
  t('B-CDXVII A1 à l\'écran : 3 209 · 187 / 89 / 415 g, AUCUNE phrase ajoutée',
    a1.kcal === '3 209' && a1.P === '187' && a1.L === '89' && a1.G === '415' && a1.inc === '', JSON.stringify(a1));
  const gap = await voir(PROFILS.GAP);
  t('B-CDXVII 800 kcal à la main, 100 kg : 250 / 22 / 0 g et « 800 kcal » n\'est PAS présenté comme tenable (1 198 kcal, +398) — glucides',
    gap.kcal === '800' && gap.P === '250' && gap.L === '22' && gap.G === '0' && /Ta cible de 800 kcal est incompatible/.test(gap.inc)
    && /1 198 kcal/.test(gap.inc) && /398 kcal de plus/.test(gap.inc) && /les glucides tombent à 0/.test(gap.inc)
    && /ne respectent donc PAS la cible/.test(gap.inc) && !/lipides tombent/.test(gap.inc), JSON.stringify(gap));
  const d2 = await voir(PROFILS.D2);
  t('B-CDXVII D2 à l\'écran : 1 200 · 113 / 33 / 113 g, aucune phrase',
    d2.kcal === '1 200' && d2.P === '113' && d2.L === '33' && d2.G === '113' && d2.inc === '', JSON.stringify(d2));
  await voir(PROFILS.DECL);
  const mod = await pg.evaluate(async () => {
    const toasts = []; const _t = window.toast; window.toast = (m, k) => { toasts.push(m); try { _t && _t(m, k); } catch (e) {} };
    const btn = [...document.querySelectorAll('#nu-adjust button')].find(x => /Ajuster mes calories/.test(x.textContent));
    if (!btn) return { err: 'bouton introuvable' };
    btn.click(); await new Promise(r => setTimeout(r, 200));
    const ov = document.getElementById('ov-kcal-edit'), inp = document.getElementById('kcal-edit-inp');
    const v = id => { const e = document.getElementById(id); return e ? e.textContent.replace(/[  ]/g, ' ').trim() : null; };
    const taper = async (x) => { inp.value = String(x); inp.dispatchEvent(new Event('input', { bubbles: true })); await new Promise(r => setTimeout(r, 60));
      return { P: v('kcal-pv-prot'), G: v('kcal-pv-carb'), L: v('kcal-pv-fat'), note: v('kcal-pv-note') }; };
    const o = { ouvert: ov.classList.contains('open') };
    o.a900 = await taper(900); o.a2500 = await taper(2500); o.a500 = await taper(500); await taper(900);
    [...ov.querySelectorAll('button')].find(x => /Enregistrer mes calories/.test(x.textContent)).click();
    await new Promise(r => setTimeout(r, 300));
    o.toasts = toasts;
    return o;
  });
  /* NUT-LIPIDES-25-01 (02/10) : 1 200 kcal tiennent désormais (172 / 54 / 33) ; la cible incompatible tapée
     à la main devient 900 kcal (172 / 0 / 25 → 913 kcal, +13). */
  t('B-CDXVII aperçu à 900 kcal (85,9 kg, force) : 172 / 0 / 25 g et la note dit l\'incompatibilité (913 kcal, +13)',
    mod.ouvert && mod.a900 && mod.a900.P === '172 g' && mod.a900.G === '0 g' && mod.a900.L === '25 g'
    && /913 kcal/.test(mod.a900.note || '') && /13 kcal de plus/.test(mod.a900.note || ''), JSON.stringify(mod.a900));
  t('B-CDXVII aperçu à 2 500 kcal : aucune note ; à 500 kcal (refusé à l\'enregistrement) : aucune note non plus',
    mod.a2500 && mod.a2500.note === '' && mod.a500 && mod.a500.note === '', JSON.stringify([mod.a2500, mod.a500]));
  t('B-CDXVII enregistrer 900 kcal incompatibles : pas de « ✅ », le message dit « Cible incompatible : +13 kcal. »',
    (mod.toasts || []).includes('Cible incompatible : +13 kcal.') && !(mod.toasts || []).some(x => /✅/.test(x)), JSON.stringify(mod.toasts));
  await pg.reload(); await pg.waitForTimeout(2000);
  const apres = await pg.evaluate(async () => {
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
    await new Promise(r => setTimeout(r, 300));
    const v = id => { const e = document.getElementById(id); return e ? e.textContent.replace(/[  ]/g, ' ').trim() : null; };
    return { man: localStorage.getItem('ft4_manualkcal'), kcal: v('m-kcal'), P: v('m-prot'), L: v('m-fat'), G: v('m-carbs'), inc: v('nu-incompatible') };
  });
  t('B-CDXVII rechargé : 900 kcal sur le disque, 172 / 25 / 0 g, et l\'incompatibilité toujours dite à l\'écran',
    apres.man === '900' && apres.kcal === '900' && apres.P === '172' && apres.L === '25' && apres.G === '0' && /913 kcal/.test(apres.inc || ''), JSON.stringify(apres));
  /* ⭐ A (témoin demandé par la contre-vérification) : compatible AUJOURD'HUI, incompatible UN JOUR DE REPOS.
     La carte le dit — le message d'enregistrement ne doit pas dire le contraire par une coche verte. */
  const enregistrer1500 = () => pg.evaluate(async () => {
    const toasts = []; const _t = window.toast; window.toast = (m, k) => { toasts.push(m); try { _t && _t(m, k); } catch (e) {} };
    [...document.querySelectorAll('#nu-adjust button')].find(x => /Ajuster mes calories/.test(x.textContent)).click();
    await new Promise(r => setTimeout(r, 200));
    const inp = document.getElementById('kcal-edit-inp'); inp.value = '1500'; inp.dispatchEvent(new Event('input', { bubbles: true }));
    [...document.getElementById('ov-kcal-edit').querySelectorAll('button')].find(x => /Enregistrer mes calories/.test(x.textContent)).click();
    await new Promise(r => setTimeout(r, 300));
    const v = id => { const e = document.getElementById(id); return e ? e.textContent.replace(/[\u202f\u00a0]/g, ' ').trim() : null; };
    return { toasts, P: v('m-prot'), L: v('m-fat'), G: v('m-carbs'), inc: v('nu-incompatible'), cycle: v('nu-cycle') || '' };
  });
  await voir(PROFILS.CYC, [0, 1, 2, 3, 4, 5]);
  const cycR = await enregistrer1500();
  t('B-CDXVII RÉEL · 80 kg, 6 séances, 1 500 kcal à la main : cycle refusé par le plancher → 200 / 42 / 81, coche verte LÉGITIME, aucun « au repos », aucune carte de cycle',
    cycR.toasts.some(x => /^Objectif réglé sur 1.500 kcal ✅$/.test(x)) && !cycR.toasts.some(x => /incompatible|repos|séance/.test(x))
    && cycR.P === '200' && cycR.L === '42' && cycR.G === '81' && cycR.inc === '' && cycR.cycle === '', JSON.stringify(cycR));
  await voir(PROFILS.CYC, [0, 1, 2, 3, 4, 5], SPEC.CYCS);
  const cyc = await enregistrer1500();
  t('B-CDXVII SYNTHÉTIQUE · A · cycle FORCÉ, 1 500 kcal compatibles aujourd\'hui mais pas un jour de repos (+65) : AUCUNE coche verte, « +65 kcal au repos » — code conservé',
    cyc.toasts.includes('Cible incompatible : +65 kcal au repos.') && !cyc.toasts.some(x => /✅/.test(x))
    && cyc.P === '200' && cyc.L === '61' && cyc.G === '39' && /Un jour de repos : tes macros font 1 565 kcal, soit 65 kcal de plus/.test(cyc.inc || '')
    && /L'autre jour tient/.test(cyc.inc || ''), JSON.stringify(cyc));
  t('B-CDXVII aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};

module.exports.ecranMilo = async function (t, b, PORT) {
  const { cx, pg, errs } = await _page(b, PORT);
  console.log('\n-- B-CDXVIII. B3 — ce que Milo reçoit (contexte construit, 0 appel) --');
  const C = await pg.evaluate(({ P, poserSrc, forcerSrc, SPEC }) => {
    const poser = eval(poserSrc), forcer = eval(forcerSrc); const o = {};
    const ctx = (nom, D, ses) => { poser(D, ses); const c = buildCoachContext('test');
      o[nom] = c.split('\n').filter(l => /Calories cible|INCOMPATIBLE|CALCUL DE LA CIBLE/.test(l)); };
    ctx('D1', P.D1); ctx('D1s', P.D1, [0, 3]); ctx('GAP', P.GAP); ctx('A1', P.A1); ctx('B1', P.B1); ctx('KETO', P.KETO);
    forcer(SPEC.D1S); ctx('sD1s', P.D1, [0, 3]); window.cycleGlucides = window.__cgOrig;   // SYNTHÉTIQUE, puis remis
    return o;
  }, { P: PROFILS, poserSrc: _poser, forcerSrc: _forcer, SPEC });
  const un = (l, re) => (l || []).filter(x => re.test(x)).length;
  /* NUT-LIPIDES-25-01 (02/10) : D1 tient sa cible ; « Glucides: 0g » + la ligne d'écart sont portés par 800 kcal à la main (GAP). */
  t('B-CDXVIII D1 : 1932 kcal · 325 / 37 / 54 g et AUCUNE ligne d\'écart depuis NUT-LIPIDES-25-01 (décomposition de la cible inchangée)',
    un(C.D1, /^- Calories cible: 1932 kcal \| Protéines: 325g \| Glucides: 37g \| Lipides: 54g$/) === 1
    && un(C.D1, /INCOMPATIBLE/) === 0 && un(C.D1, /CIBLE 1932 kcal/) === 1, JSON.stringify(C.D1));
  t('B-CDXVIII RÉEL · D1 un jour de séance : cycle refusé → Milo reçoit 1932 · 325 / 37 / 54, AUCUNE ligne d\'écart, aucun « jour de repos »',
    un(C.D1s, /^- Calories cible: 1932 kcal \| Protéines: 325g \| Glucides: 37g \| Lipides: 54g$/) === 1
    && un(C.D1s, /INCOMPATIBLE|jour de repos|jour de séance/) === 0, JSON.stringify(C.D1s));
  t('B-CDXVIII SYNTHÉTIQUE · D1, cycle FORCÉ : Milo reçoit aussi l\'écart d\'un jour de repos (2326, +394) — code conservé',
    un(C.sD1s, /CIBLE INCOMPATIBLE.*\(\+70\).*un jour de repos : 2326 kcal \(\+394, glucides écrêtés à 0\)/) === 1, JSON.stringify(C.sD1s));
  t('B-CDXVIII 800 kcal à la main : « Glucides: 0g » (et plus « —g ») et UNE ligne dit que ces macros NE respectent PAS la cible (1198, +398)',
    un(C.GAP, /^- Calories cible: 800 kcal \| Protéines: 250g \| Glucides: 0g \| Lipides: 22g$/) === 1
    && un(C.GAP, /CIBLE INCOMPATIBLE AVEC LES RÈGLES MACROS ACTUELLES.*1198 kcal pour une cible de 800 kcal \(\+398\).*NE respectent PAS la cible.*jamais comme la respectant/) === 1, JSON.stringify(C.GAP));
  t('B-CDXVIII A1 : la ligne des macros (187 / 415 / 89), sans aucune ligne ajoutée',
    un(C.A1, /^- Calories cible: 3209 kcal \| Protéines: 187g \| Glucides: 415g \| Lipides: 89g$/) === 1 && un(C.A1, /INCOMPATIBLE/) === 0, JSON.stringify(C.A1));
  t('B-CDXVIII profil sans poids : les macros inconnues restent « — » (D-016), rien de déclaré',
    un(C.B1, /Protéines: —g \| Glucides: —g \| Lipides: —g/) === 1 && un(C.B1, /INCOMPATIBLE/) === 0, JSON.stringify(C.B1));
  t('B-CDXVIII kéto 250 kg à 800 kcal : « Lipides: 0g » et l\'écart de 40 kcal est dit',
    un(C.KETO, /Lipides: 0g$/) === 1 && un(C.KETO, /CIBLE INCOMPATIBLE.*protéines \+ glucides kéto = 840 kcal pour une cible de 800 kcal \(\+40\), lipides écrêtés à 0/) === 1
    && un(C.KETO, /glucides écrêtés/) === 0, JSON.stringify(C.KETO));
  /* ⭐ C (témoin demandé par la contre-vérification) : en standard, c'est toujours des GLUCIDES qu'on parle. */
  t('B-CDXVIII C · standard (800 kcal à la main) : Milo lit « glucides écrêtés à 0 », jamais « lipides écrêtés »',
    un(C.GAP, /glucides écrêtés à 0/) === 1 && un(C.GAP, /lipides écrêtés/) === 0, JSON.stringify(C.GAP));
  t('B-CDXVIII aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};

/* ══ B-CDXIX. B3 — corrections UX après contre-vérification (30/09) : la note du réglage manuel lit la MÊME
   source que la carte (cycle compris), la phrase de la semaine n'affirme plus un total identique quand il
   ne l'est pas, le toast tient sur un écran de 390 px. Aucun chiffre ni aucune cible ne changent. ══ */
module.exports.ecranUX = async function (t, b, PORT) {
  const { cx, pg, errs } = await _page(b, PORT);
  console.log('\n-- B-CDXIX. B3 — note du réglage manuel = carte, phrase de la semaine, toast mobile (390 px) --');
  const P80 = { ft4_bw: '80', ft4_age: '40', ft4_ht: '175', ft4_gender: 'H', ft4_act: '1.55', ft4_goal: 'perte', ft4_nphase: 'charge' };
  const ouvrir = async (D, ses, spec) => {
    await pg.evaluate(({ D, ses, poserSrc }) => { eval(poserSrc)(D, ses); }, { D, ses: ses || null, poserSrc: _poser });
    await pg.reload(); await pg.waitForTimeout(2000);
    if (spec) await pg.evaluate(({ forcerSrc, spec }) => { eval(forcerSrc)(spec); }, { forcerSrc: _forcer, spec });   // SYNTHÉTIQUE
  };
  /* Tape une cible dans la VRAIE fenêtre, lit la note ; puis Annuler ou Enregistrer ; lit carte, toast, rectangle du toast. */
  const regler = (x, enregistrer) => pg.evaluate(async ({ x, enregistrer }) => {
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
    await new Promise(r => setTimeout(r, 300));
    const v = id => { const e = document.getElementById(id); return e ? e.textContent.replace(/[  ]/g, ' ').trim() : null; };
    const toasts = []; const _t = window.toast; window.toast = (m, k) => { toasts.push(m.replace(/[  ]/g, ' ')); try { _t && _t(m, k); } catch (e) {} };
    const avant = { S: S.manualKcal, disque: localStorage.getItem('ft4_manualkcal') };
    const btn = [...document.querySelectorAll('#nu-adjust button')].find(b => /Ajuster mes calories|Modifier/.test(b.textContent));
    if (!btn) return { err: 'bouton introuvable' };
    btn.click(); await new Promise(r => setTimeout(r, 200));
    const ov = document.getElementById('ov-kcal-edit'), inp = document.getElementById('kcal-edit-inp');
    inp.value = String(x); inp.dispatchEvent(new Event('input', { bubbles: true })); await new Promise(r => setTimeout(r, 60));
    const note = v('kcal-pv-note'), pendant = S.manualKcal;
    [...ov.querySelectorAll('button')].find(b => (enregistrer ? /Enregistrer mes calories/ : /Annuler/).test(b.textContent)).click();
    await new Promise(r => setTimeout(r, 350));
    const tr = document.getElementById('toast').getBoundingClientRect();
    window.toast = _t;
    return { note, pendant, avant, apres: { S: S.manualKcal, disque: localStorage.getItem('ft4_manualkcal') }, carte: v('nu-incompatible'),
             cycle: v('nu-cycle'), toasts, toast: { left: tr.left, right: tr.right, vw: innerWidth, sw: document.getElementById('toast').scrollWidth, cw: document.getElementById('toast').clientWidth },
             P: v('m-prot'), L: v('m-fat'), G: v('m-carbs'), kcal: v('m-kcal') };
  }, { x, enregistrer });
  const dans = (r) => r && r.toast.left >= 0 && r.toast.right <= r.toast.vw && r.toast.sw <= r.toast.cw + 1;
  const det = o => JSON.stringify(o);

  /* 🥑 NUT-LIPIDES-25-01 : A, B et D sont chacun RÉEL (le contrat validé : cycle refusé par le plancher, rien de
     faux) puis SYNTHÉTIQUE (sortie du cycle forcée = celle de master : le code d'affichage conservé dit encore juste). */
  // A RÉEL — 80 kg · perte · 5 séances, repos aujourd'hui · 1 400 kcal : lipides 39 g < plancher 48 g → pas de cycle,
  //          200 / 39 / 62, compatible ; à 900 kcal (200 / 25 / 0 → 1 025, +125) l'écart est dit SANS jour
  await ouvrir(P80, [1, 2, 3, 4, 5]);
  const a0 = await regler(1400, false);
  /* (la carte de cycle visible à ce moment est celle de la cible AUTOMATIQUE en vigueur, 2 283 kcal, où le cycle joue
     légitimement : l'aperçu n'est pas enregistré — seule la note de l'aperçu parle de 1 400) */
  t('B-CDXIX A RÉEL · aperçu à 1 400 kcal, repos aujourd\'hui : cycle refusé par le plancher, la note est VIDE (rien d\'incompatible, aucun « jour de repos »)',
    a0.note === '' && a0.carte === '', det(a0));
  t('B-CDXIX A · taper sans enregistrer ne change RIEN : la cible reste celle d\'avant, en mémoire et sur le disque (la simulation est remise)',
    a0.apres.S === a0.avant.S && a0.apres.disque === a0.avant.disque && a0.pendant === a0.avant.S, det([a0.avant, a0.pendant, a0.apres]));
  const ar = await regler(1400, true);
  t('B-CDXIX A RÉEL · enregistré 1 400 : 200 / 39 / 62, coche verte LÉGITIME, aucune carte d\'écart, aucune carte de cycle',
    ar.P === '200' && ar.L === '39' && ar.G === '62' && ar.carte === '' && ar.cycle === ''
    && ar.toasts.includes('Objectif réglé sur 1 400 kcal ✅'), det(ar));
  const a9n = await regler(900, false), a9 = await regler(900, true);
  t('B-CDXIX A RÉEL · 900 kcal (glucides écrêtés, +125) : la carte dit EXACTEMENT ce que disait la note, toast « Cible incompatible : +125 kcal. » (sans jour)',
    /incompatible/.test(a9n.note || '') && /1 025 kcal/.test(a9n.note || '') && /125 kcal de plus/.test(a9n.note || '')
    && a9.carte === a9n.note && a9.toasts.includes('Cible incompatible : +125 kcal.') && !a9.toasts.some(x => /✅|repos|séance/.test(x))
    && a9.P === '200' && a9.L === '25' && a9.G === '0', det({ note: a9n.note, carte: a9.carte, toasts: a9.toasts }));
  t('B-CDXIX E · toast mobile (écart sans jour) : message court et COMPLET, entièrement dans l\'écran de 390 px', dans(a9), det(a9.toast));
  // A SYNTHÉTIQUE — même profil, cycle FORCÉ à 1 400 (repos aujourd'hui 200 / 81 / 0 → 1 529, +129 ; séance 50 / 37 tient)
  await ouvrir(P80, [1, 2, 3, 4, 5], SPEC.P80R);
  const a0s = await regler(1400, false);
  t('B-CDXIX A SYNTHÉTIQUE · cycle FORCÉ, aperçu à 1 400 kcal : la note NOMME le jour de repos et son écart exact (+129) — code conservé',
    /Un jour de repos \(aujourd'hui\) : tes macros font 1 529 kcal, soit 129 kcal de plus — les glucides tombent à 0/.test(a0s.note || '')
    && /L'autre jour tient/.test(a0s.note || ''), det(a0s));
  const a1 = await regler(1400, true);
  t('B-CDXIX A SYNTHÉTIQUE · enregistré : la carte dit EXACTEMENT ce que disait la note, le toast « Cible incompatible : +129 kcal au repos. » — code conservé',
    a1.carte === a0s.note && a1.toasts.includes('Cible incompatible : +129 kcal au repos.') && !a1.toasts.some(x => /✅/.test(x))
    && a1.P === '200' && a1.L === '81' && a1.G === '0', det({ note: a0s.note, carte: a1.carte, toasts: a1.toasts, P: a1.P, L: a1.L, G: a1.G }));
  t('B-CDXIX E · toast mobile : message court et COMPLET, entièrement dans l\'écran de 390 px', dans(a1), det(a1.toast));

  // B RÉEL — D1, séance aujourd'hui, 1 932 kcal : cycle refusé (54 g < 78 g) → note vide, 325 / 54 / 37, coche verte légitime
  await ouvrir(PROFILS.D1, [0, 3]);
  const b0r = await regler(1932, false), b1r = await regler(1932, true);
  t('B-CDXIX B RÉEL · D1, séance aujourd\'hui, 1 932 kcal : cycle refusé par le plancher → note vide, 325 / 54 / 37, aucune carte, coche verte légitime',
    b0r.note === '' && b1r.carte === '' && b1r.cycle === '' && b1r.P === '325' && b1r.L === '54' && b1r.G === '37'
    && b1r.toasts.includes('Objectif réglé sur 1 932 kcal ✅') && !b1r.toasts.some(x => /incompatible|repos|séance/.test(x)), det({ b0r, b1r }));
  // B SYNTHÉTIQUE — D1 avec cycle FORCÉ (sorties de master) : la note, la carte et le toast portent les MÊMES chiffres (+70 / +394)
  await ouvrir(PROFILS.D1, [0, 3], SPEC.D1S);
  const b0 = await regler(1932, false);
  t('B-CDXIX B SYNTHÉTIQUE · D1, cycle FORCÉ, 1 932 kcal : la note dit +70 (séance, aujourd\'hui) et +394 (repos) — plus jamais +304 (sans le cycle) — code conservé',
    /Un jour de séance \(aujourd'hui\) : tes macros font 2 002 kcal, soit 70 kcal de plus/.test(b0.note || '')
    && /Un jour de repos : tes macros font 2 326 kcal, soit 394 kcal de plus/.test(b0.note || '') && !/304/.test(b0.note || ''), det(b0.note));
  const b1 = await regler(1932, true);
  t('B-CDXIX B SYNTHÉTIQUE · enregistré : carte identique à la note, toast « Cible incompatible : +70 à +394 kcal. », chiffres forcés (325 / 78 / 0) — code conservé',
    b1.carte === b0.note && b1.toasts.includes('Cible incompatible : +70 à +394 kcal.') && b1.P === '325' && b1.L === '78' && b1.G === '0',
    det({ note: b0.note, carte: b1.carte, toasts: b1.toasts }));
  t('B-CDXIX E · toast des deux jours : entièrement dans l\'écran de 390 px', dans(b1), det(b1.toast));

  // C — cycle neutre (A1, 4 séances) : la phrase « total de la semaine identique » est conservée
  await ouvrir(PROFILS.A1, [0, 2, 4, 6]);
  const c0 = await regler(3209, true);
  t('B-CDXIX C · cycle neutre : « sur la semaine le total est le même » CONSERVÉ, aucune phrase d\'incompatibilité',
    /sur la semaine le total est le même/.test(c0.cycle || '') && !/ne peut pas conserver/.test(c0.cycle || '') && c0.carte === '', det(c0.cycle));
  // F — profil normal : chiffres de master et coche verte
  t('B-CDXIX F · profil normal : 187 / 75 / 447 un jour de séance (lipides 25 %, cycle actif), note vide, « Objectif réglé sur 3 209 kcal ✅ »',
    c0.P === '187' && c0.L === '75' && c0.G === '447' && c0.toasts.includes('Objectif réglé sur 3 209 kcal ✅') && dans(c0), det(c0));
  const f0 = await regler(2500, false);
  t('B-CDXIX F · aperçu d\'une cible compatible (2 500) : aucune note', f0.note === '', det(f0.note));

  // D RÉEL — 80 kg (20 a, 150 cm, décharge), 6 séances, séance aujourd'hui. À 1 500 kcal : 42 g < plancher 48 g → AUCUNE
  //          carte de cycle (ni « total identique », ni « ne peut pas conserver »). À 1 800 kcal : 50 g > 48 g → le cycle
  //          joue, la phrase « total identique » est dite ET VRAIE (les deux jours font la cible à ±6 kcal).
  const P80D = { ft4_bw: '80', ft4_age: '20', ft4_ht: '150', ft4_gender: 'H', ft4_act: '1.2', ft4_goal: 'perte', ft4_nphase: 'decharge' };
  await ouvrir(P80D, [0, 1, 2, 3, 4, 5]);
  const dr = await regler(1500, true);
  t('B-CDXIX D RÉEL · cycle refusé par le plancher (1 500 kcal) : aucune carte de cycle, aucune phrase sur la semaine, aucune carte d\'écart',
    dr.cycle === '' && dr.carte === '' && dr.P === '200' && dr.L === '42' && dr.G === '81', det(dr));
  const da = await regler(1800, true);
  const daM = await pg.evaluate(() => { const m = calcMacros(S.nutritionPhase), au = m.cycle && m.cycle.autre;
    return m.cycle ? { P: m.prot_g, L: m.fat_g, G: m.carbs_g, aL: au.fat_g, aG: au.carbs_g, K: m.calories, plancher: S.bw * 0.6 } : null; });
  const tient = daM && Math.abs(daM.P * 4 + daM.L * 9 + daM.G * 4 - daM.K) <= 6 && Math.abs(daM.P * 4 + daM.aL * 9 + daM.aG * 4 - daM.K) <= 6;
  t('B-CDXIX D RÉEL · cycle actif au ras du plancher (1 800 kcal) : « sur la semaine le total est le même » dit ET VRAI, plancher 0,6 g/kg respecté le jour de séance',
    !!daM && tient && daM.L >= daM.plancher - 0.5 && /sur la semaine le total est le même/.test(da.cycle || '') && !/ne peut pas conserver/.test(da.cycle || '')
    && da.carte === '', det({ cycle: da.cycle, daM }));
  // D SYNTHÉTIQUE — cycle FORCÉ non neutre (séance aujourd'hui tient, repos +65) : la phrase fausse a disparu
  await ouvrir(P80D, [0, 1, 2, 3, 4, 5], SPEC.CYCS);
  const d0 = await regler(1500, true);
  t('B-CDXIX D SYNTHÉTIQUE · cycle FORCÉ non neutre : « le total est le même » ABSENT, remplacé par « le cycle ne peut pas conserver exactement le même total » — code conservé',
    !/le total est le même/.test(d0.cycle || '') && /Avec cette cible, le cycle ne peut pas conserver exactement le même total calorique sur la semaine/.test(d0.cycle || '')
    && /Jour de séance/.test(d0.cycle || ''), det(d0.cycle));

  // E — pire cas : écarts à 4 chiffres, un jour et deux jours
  const e0 = await pg.evaluate(async () => {
    const out = [];
    for (const L of [[{ ecart: 1780, jour: 'seance' }], [{ ecart: 1780, jour: 'repos' }], [{ ecart: 1780, jour: 'seance' }, { ecart: 2100, jour: 'repos' }], [{ ecart: 2100, jour: null }]]) {
      const m = _toastIncompatible(L); toast(m, 'info'); await new Promise(r => setTimeout(r, 250));
      const e = document.getElementById('toast'), r = e.getBoundingClientRect();
      out.push({ m: m.replace(/[  ]/g, ' '), ok: r.left >= 0 && r.right <= innerWidth && e.scrollWidth <= e.clientWidth + 1, w: Math.round(r.width) });
    }
    return out;
  });
  t('B-CDXIX E · pire cas (4 chiffres, un jour ou deux jours) : chaque toast est complet et tient dans 390 px',
    e0.every(x => x.ok) && e0[0].m === 'Cible incompatible : +1 780 kcal en séance.' && e0[2].m === 'Cible incompatible : +1 780 à +2 100 kcal.', det(e0));
  t('B-CDXIX aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};
