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
    SC.includes("_inc.innerHTML=_incompatibleHTML(macros);") && SC.includes('_cibleIncompatible(mm.prot_g,mm.fat_g,mm.carbs_g,v)')
    && !/\*9/.test(corps(SC, '_incompatibleHTML')) && !/\*9/.test(corps(CO, '_incompatibleTxt'))
    && /<div id="nu-incompatible"><\/div>/.test(IH) && /<div id="kcal-pv-note"><\/div>/.test(IH), 'lecture absente ou calcul refait');
  t('B-CDXV ⑥ Milo : un vrai 0 g s\'écrit 0 (`_gMac`), la ligne d\'écart suit celle des macros',
    CO.includes("function_gMac(v){returnv==null?'—':v;}")
    && CO.includes('Protéines:${_gMac(macros.prot_g)}g|Glucides:${_gMac(macros.carbs_g)}g|Lipides:${_gMac(macros.fat_g)}g')
    && CO.includes('${_incompatibleTxt(macros)}${_cibleDetailTxt()}'), 'ligne des macros de Milo modifiée');
  t('B-CDXV ⑦ enregistrer une cible incompatible ne dit plus « ✅ » (ne pas laisser croire qu\'elle est validée)',
    /if\(_inc\)toast\([^;]*incompatible/.test(corps(SC, 'saveKcalEdit')) && !/_inc\.ecart>0\)toast/.test(corps(SC, 'saveKcalEdit')), 'toast inchangé');
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
  console.log('\n-- B-CDXVI. B3 — le moteur conduit : chiffres de master, écart déclaré (cas mesurés + grille) --');
  const R = await pg.evaluate(({ P, poserSrc }) => {
    const poser = eval(poserSrc);
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
    cas('CYCseance', P.CYC, [0, 1, 2, 3, 4, 5]);
    cas('B1', P.B1); cas('B2', P.B2);
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
            if (!r.cyc && !(r.P === pl.prot_g && r.L === pl.fat_g && r.G === Math.max(0, Math.round((r.cal - pl.prot_g * 4 - pl.fat_g * 9) / 4)))) g.regles++;
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
  }, { P: PROFILS, poserSrc: _poser });

  const det = o => JSON.stringify(o);
  const q = (o, P, L, G, cal) => o && o.P === P && o.L === L && o.G === G && (cal == null || o.cal === cal);
  const inc = (o, e, mac) => o && o.inc && o.inc.ecart === e && (mac == null || o.inc.macros === mac);
  t('B-CDXVI A1 H 85 kg · 180 · 40 a · Modéré : muscle 3209 → 187/77/442, rien de déclaré',
    q(R.A1, 187, 77, 442, 3209) && !R.A1.inc, det(R.A1));
  t('B-CDXVI A1 perte (2409 → 213/68/236 ; décharge 2209 → 213/68/186), maintien (2859 → 170/72/383) : master, rien de déclaré',
    q(R.A1perte, 213, 68, 236, 2409) && q(R.A1dech, 213, 68, 186, 2209) && q(R.A1maint, 170, 72, 383, 2859)
    && !R.A1perte.inc && !R.A1dech.inc && !R.A1maint.inc, [R.A1perte, R.A1dech, R.A1maint].map(det).join(' | '));
  t('B-CDXVI A1 cycle 4 séances/sem : séance 187/65/470, repos 187/94/405 — master, rien de déclaré',
    q(R.A1seance, 187, 65, 470) && q(R.A1repos, 187, 94, 405) && !R.A1seance.inc && !R.A1repos.inc, det(R.A1seance) + ' | ' + det(R.A1repos));
  t('B-CDXVI D1 charge ⭐ chiffres de master (325/104/0 pour 2132) ET écart DÉCLARÉ : 2236 kcal, +104',
    q(R.D1charge, 325, 104, 0, 2132) && inc(R.D1charge, 104, 2236) && !R.D1charge.inc.autre, det(R.D1charge));
  t('B-CDXVI D1 décharge ⭐ 325/104/0 pour 1932 (master) ET écart DÉCLARÉ : 2236 kcal, +304',
    q(R.D1, 325, 104, 0, 1932) && inc(R.D1, 304, 2236), det(R.D1));
  t('B-CDXVI D1 décharge + cycle : jour de séance +70 (2002) ET jour de repos +394 (2326), les deux déclarés',
    q(R.D1seance, 325, 78, 0, 1932) && inc(R.D1seance, 70, 2002) && R.D1seance.inc.autre && R.D1seance.inc.autre.jour === 'repos'
    && R.D1seance.inc.autre.ecart === 394 && inc(R.D1repos, 394, 2326) && R.D1repos.inc.autre && R.D1repos.inc.autre.ecart === 70,
    det(R.D1seance) + ' | ' + det(R.D1repos));
  t('B-CDXVI D1 recomp 338/111/0 (+219 déclaré) ; D1 muscle 286/117/134 : rien de déclaré',
    q(R.D1recomp, 338, 111, 0, 2132) && inc(R.D1recomp, 219, 2351) && q(R.D1muscle, 286, 117, 134, 2732) && !R.D1muscle.inc,
    det(R.D1recomp) + ' | ' + det(R.D1muscle));
  t('B-CDXVI D1 la décomposition de la cible pour Milo est inchangée (1932 = calcul de l\'app)',
    R.D1.dec && R.D1.dec.cible === 1932 && !R.D1.dec.manuelle, det(R.D1.dec));
  t('B-CDXVI D2 F 45 kg perte : plancher 1200 → 113/36/106, rien de déclaré (70 a et 30 a)',
    q(R.D2, 113, 36, 106, 1200) && q(R.D2charge, 113, 36, 106, 1200) && !R.D2.inc && !R.D2charge.inc, det(R.D2) + ' | ' + det(R.D2charge));
  t('B-CDXVI manuel 800 à 100 kg ⭐ 800 gardés, 250/80/0 (master), écart DÉCLARÉ : 1720 kcal, +920',
    q(R.GAP, 250, 80, 0, 800) && inc(R.GAP, 920, 1720), det(R.GAP));
  t('B-CDXVI manuel 1200 (85,9 kg, force) : 172/86/0 (master), +262 déclaré ; manuel 2500 : 172/86/260, rien',
    q(R.DECL1200, 172, 86, 0, 1200) && inc(R.DECL1200, 262, 1462) && q(R.DECL2500, 172, 86, 260, 2500) && !R.DECL2500.inc,
    det(R.DECL1200) + ' | ' + det(R.DECL2500));
  t('B-CDXVI kéto 250 kg à 800 kcal : 200/0/10 (master), +40 déclaré ; kéto et low carb sur D1 : master, rien',
    q(R.KETO, 200, 0, 10, 800) && inc(R.KETO, 40, 840) && q(R.KETOD1, 104, 158, 24, 1932) && !R.KETOD1.inc
    && q(R.LOWD1, 145, 97, 121, 1932) && !R.LOWD1.inc, [R.KETO, R.KETOD1, R.LOWD1].map(det).join(' | '));
  t('B-CDXVI cycle 80 kg · 1500 kcal · 6 séances : aujourd\'hui tient (200/61/39, rien), le jour de repos +65 est DÉCLARÉ',
    q(R.CYCseance, 200, 61, 39, 1500) && R.CYCseance.inc && R.CYCseance.inc.ecart === 0 && R.CYCseance.inc.autre
    && R.CYCseance.inc.autre.jour === 'repos' && R.CYCseance.inc.autre.ecart === 65 && R.CYCseance.inc.autre.macros === 1565, det(R.CYCseance));
  t('B-CDXVI B1 sans poids : tout nul, rien de déclaré ; B2 2000 kcal à la main sans poids : 2000 gardés, macros nulles, rien',
    R.B1.cal == null && R.B1.P == null && !R.B1.inc && R.B2.cal === 2000 && R.B2.P == null && R.B2.G == null && !R.B2.inc,
    det(R.B1) + ' | ' + det(R.B2));
  const G = R.grille, M = R.man;
  t('B-CDXVI grille (' + G.n + ' profils automatiques) ⭐ règles de master intactes, cible jamais modifiée',
    G.n > 15000 && G.regles === 0 && G.cibleBouge === 0, det(G));
  t('B-CDXVI grille : écart déclaré SI ET SEULEMENT SI une macro est écrêtée et que la somme dépasse de plus de 6 kcal — valeur exacte, jour et autre bout',
    G.presence === 0 && G.valeur === 0 && G.macros === 0 && G.declares > 1000, det(G));
  t('B-CDXVI cibles manuelles (' + M.n + ', standard / kéto / low carb) : cible gardée, écart déclaré si et seulement si réel, à l\'unité',
    M.n > 500 && M.cibleBouge === 0 && M.presence === 0 && M.valeur === 0 && M.macros === 0 && M.declares > 50, det(M));
  t('B-CDXVI aucune erreur de page pendant le moteur', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};

module.exports.ecranVue = async function (t, b, PORT) {
  const { cx, pg, errs } = await _page(b, PORT);
  console.log('\n-- B-CDXVII. B3 — ce que la personne LIT (onglet Nutrition + réglage manuel, vrais rechargements) --');
  const voir = async (D, ses) => {
    await pg.evaluate(({ D, ses, poserSrc }) => { eval(poserSrc)(D, ses); }, { D, ses: ses || null, poserSrc: _poser });
    await pg.reload(); await pg.waitForTimeout(2000);
    return pg.evaluate(async () => {
      goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
      await new Promise(r => setTimeout(r, 300));
      const v = id => { const e = document.getElementById(id); return e ? e.textContent.replace(/[  ]/g, ' ').trim() : null; };
      return { kcal: v('m-kcal'), P: v('m-prot'), L: v('m-fat'), G: v('m-carbs'), inc: v('nu-incompatible') };
    });
  };
  const d1 = await voir(PROFILS.D1);
  t('B-CDXVII D1 à l\'écran : 1 932 kcal · 325 / 104 / 0 g (master) et la phrase dit l\'incompatibilité : 2 236 kcal, +304',
    d1.kcal === '1 932' && d1.P === '325' && d1.L === '104' && d1.G === '0'
    && /incompatible avec les règles de répartition actuelles/.test(d1.inc) && /2 236 kcal/.test(d1.inc) && /304 kcal de plus/.test(d1.inc)
    && /ne respectent donc PAS la cible/.test(d1.inc) && /les glucides tombent à 0/.test(d1.inc) && !/lipides tombent/.test(d1.inc), JSON.stringify(d1));
  const ke = await voir(PROFILS.KETO);
  t('B-CDXVII B · kéto 250 kg à 800 kcal (lipides écrêtés) : la phrase nomme les LIPIDES, pas les glucides ; chiffres de master 200 / 0 / 10',
    ke.P === '200' && ke.L === '0' && ke.G === '10' && /les lipides tombent à 0/.test(ke.inc) && !/glucides tombent/.test(ke.inc)
    && /glucides kéto/.test(ke.inc) && /840 kcal/.test(ke.inc), JSON.stringify(ke));
  const lc = await voir(Object.assign({}, PROFILS.DECL, { ft4_manualkcal: '1050', ft4_foodmode: 'lowcarb' }));
  t('B-CDXVII D · low carb 1 050 kcal : 66 / 79 / 53 g (master, +7 kcal de pur arrondi, rien d\'écrêté) → AUCUNE phrase',
    lc.P === '79' && lc.G === '66' && lc.L === '53' && lc.inc === '', JSON.stringify(lc));
  const d1r = await voir(PROFILS.D1, [0, 3]);
  t('B-CDXVII D1 un jour de séance : l\'écart du jour ET celui d\'un jour de repos (2 326 kcal, +394) sont dits',
    /2 002 kcal/.test(d1r.inc) && /un jour de repos/.test(d1r.inc) && /2 326 kcal/.test(d1r.inc) && /\+394/.test(d1r.inc), JSON.stringify(d1r));
  const a1 = await voir(PROFILS.A1);
  t('B-CDXVII A1 à l\'écran : 3 209 · 187 / 77 / 442 g, AUCUNE phrase ajoutée',
    a1.kcal === '3 209' && a1.P === '187' && a1.L === '77' && a1.G === '442' && a1.inc === '', JSON.stringify(a1));
  const gap = await voir(PROFILS.GAP);
  t('B-CDXVII 800 kcal à la main, 100 kg : 250 / 80 / 0 g et « 800 kcal » n\'est PAS présenté comme tenable (1 720 kcal, +920)',
    gap.kcal === '800' && gap.P === '250' && gap.L === '80' && gap.G === '0' && /Ta cible de 800 kcal est incompatible/.test(gap.inc)
    && /1 720 kcal/.test(gap.inc) && /920 kcal de plus/.test(gap.inc), JSON.stringify(gap));
  const d2 = await voir(PROFILS.D2);
  t('B-CDXVII D2 à l\'écran : 1 200 · 113 / 36 / 106 g, aucune phrase',
    d2.kcal === '1 200' && d2.P === '113' && d2.L === '36' && d2.G === '106' && d2.inc === '', JSON.stringify(d2));
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
    o.a1200 = await taper(1200); o.a2500 = await taper(2500); o.a500 = await taper(500); await taper(1200);
    [...ov.querySelectorAll('button')].find(x => /Enregistrer mes calories/.test(x.textContent)).click();
    await new Promise(r => setTimeout(r, 300));
    o.toasts = toasts;
    return o;
  });
  t('B-CDXVII aperçu à 1 200 kcal (85,9 kg, force) : 172 / 0 / 86 g (master) et la note dit l\'incompatibilité (1 462 kcal, +262)',
    mod.ouvert && mod.a1200 && mod.a1200.P === '172 g' && mod.a1200.G === '0 g' && mod.a1200.L === '86 g'
    && /1 462 kcal/.test(mod.a1200.note || '') && /262 kcal de plus/.test(mod.a1200.note || ''), JSON.stringify(mod.a1200));
  t('B-CDXVII aperçu à 2 500 kcal : aucune note ; à 500 kcal (refusé à l\'enregistrement) : aucune note non plus',
    mod.a2500 && mod.a2500.note === '' && mod.a500 && mod.a500.note === '', JSON.stringify([mod.a2500, mod.a500]));
  t('B-CDXVII enregistrer 1 200 kcal incompatibles : pas de « ✅ », le message dit « incompatible avec tes macros (+262 kcal) »',
    (mod.toasts || []).some(x => /incompatible avec tes macros \(\+262 kcal\)/.test(x)) && !(mod.toasts || []).some(x => /✅/.test(x)), JSON.stringify(mod.toasts));
  await pg.reload(); await pg.waitForTimeout(2000);
  const apres = await pg.evaluate(async () => {
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
    await new Promise(r => setTimeout(r, 300));
    const v = id => { const e = document.getElementById(id); return e ? e.textContent.replace(/[  ]/g, ' ').trim() : null; };
    return { man: localStorage.getItem('ft4_manualkcal'), kcal: v('m-kcal'), P: v('m-prot'), L: v('m-fat'), G: v('m-carbs'), inc: v('nu-incompatible') };
  });
  t('B-CDXVII rechargé : 1 200 kcal sur le disque, 172 / 86 / 0 g, et l\'incompatibilité toujours dite à l\'écran',
    apres.man === '1200' && apres.kcal === '1 200' && apres.P === '172' && apres.L === '86' && apres.G === '0' && /1 462 kcal/.test(apres.inc || ''), JSON.stringify(apres));
  /* ⭐ A (témoin demandé par la contre-vérification) : compatible AUJOURD'HUI, incompatible UN JOUR DE REPOS.
     La carte le dit — le message d'enregistrement ne doit pas dire le contraire par une coche verte. */
  await voir(PROFILS.CYC, [0, 1, 2, 3, 4, 5]);
  const cyc = await pg.evaluate(async () => {
    const toasts = []; const _t = window.toast; window.toast = (m, k) => { toasts.push(m); try { _t && _t(m, k); } catch (e) {} };
    [...document.querySelectorAll('#nu-adjust button')].find(x => /Ajuster mes calories/.test(x.textContent)).click();
    await new Promise(r => setTimeout(r, 200));
    const inp = document.getElementById('kcal-edit-inp'); inp.value = '1500'; inp.dispatchEvent(new Event('input', { bubbles: true }));
    [...document.getElementById('ov-kcal-edit').querySelectorAll('button')].find(x => /Enregistrer mes calories/.test(x.textContent)).click();
    await new Promise(r => setTimeout(r, 300));
    const v = id => { const e = document.getElementById(id); return e ? e.textContent.replace(/[\u202f\u00a0]/g, ' ').trim() : null; };
    return { toasts, P: v('m-prot'), L: v('m-fat'), G: v('m-carbs'), inc: v('nu-incompatible') };
  });
  t('B-CDXVII A · 1 500 kcal compatibles aujourd\'hui mais pas un jour de repos (+65) : AUCUNE coche verte, le message dit « +65 kcal un jour de repos »',
    cyc.toasts.some(x => /incompatible avec tes macros \(\+65 kcal un jour de repos\)/.test(x)) && !cyc.toasts.some(x => /✅/.test(x))
    && cyc.P === '200' && cyc.L === '61' && cyc.G === '39' && /un jour de repos/.test(cyc.inc || ''), JSON.stringify(cyc));
  t('B-CDXVII aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};

module.exports.ecranMilo = async function (t, b, PORT) {
  const { cx, pg, errs } = await _page(b, PORT);
  console.log('\n-- B-CDXVIII. B3 — ce que Milo reçoit (contexte construit, 0 appel) --');
  const C = await pg.evaluate(({ P, poserSrc }) => {
    const poser = eval(poserSrc); const o = {};
    const ctx = (nom, D, ses) => { poser(D, ses); const c = buildCoachContext('test');
      o[nom] = c.split('\n').filter(l => /Calories cible|INCOMPATIBLE|CALCUL DE LA CIBLE/.test(l)); };
    ctx('D1', P.D1); ctx('D1s', P.D1, [0, 3]); ctx('GAP', P.GAP); ctx('A1', P.A1); ctx('B1', P.B1); ctx('KETO', P.KETO);
    return o;
  }, { P: PROFILS, poserSrc: _poser });
  const un = (l, re) => (l || []).filter(x => re.test(x)).length;
  t('B-CDXVIII D1 : « Glucides: 0g » (et plus « —g ») et UNE ligne dit que ces macros NE respectent PAS la cible (2236, +304)',
    un(C.D1, /^- Calories cible: 1932 kcal \| Protéines: 325g \| Glucides: 0g \| Lipides: 104g$/) === 1
    && un(C.D1, /CIBLE INCOMPATIBLE AVEC LES RÈGLES MACROS ACTUELLES.*2236 kcal pour une cible de 1932 kcal \(\+304\).*NE respectent PAS la cible.*jamais comme la respectant/) === 1
    && un(C.D1, /CIBLE 1932 kcal/) === 1, JSON.stringify(C.D1));
  t('B-CDXVIII D1 un jour de séance : Milo reçoit aussi l\'écart d\'un jour de repos (2326, +394)',
    un(C.D1s, /CIBLE INCOMPATIBLE.*\(\+70\).*un jour de repos : 2326 kcal \(\+394, glucides écrêtés à 0\)/) === 1, JSON.stringify(C.D1s));
  t('B-CDXVIII 800 kcal à la main : Milo sait que 800 kcal n\'est pas tenable avec ces macros (1720, +920)',
    un(C.GAP, /^- Calories cible: 800 kcal \| Protéines: 250g \| Glucides: 0g \| Lipides: 80g$/) === 1
    && un(C.GAP, /CIBLE INCOMPATIBLE.*1720 kcal pour une cible de 800 kcal \(\+920\)/) === 1, JSON.stringify(C.GAP));
  t('B-CDXVIII A1 : la ligne des macros est celle de master, sans aucune ligne ajoutée',
    un(C.A1, /^- Calories cible: 3209 kcal \| Protéines: 187g \| Glucides: 442g \| Lipides: 77g$/) === 1 && un(C.A1, /INCOMPATIBLE/) === 0, JSON.stringify(C.A1));
  t('B-CDXVIII profil sans poids : les macros inconnues restent « — » (D-016), rien de déclaré',
    un(C.B1, /Protéines: —g \| Glucides: —g \| Lipides: —g/) === 1 && un(C.B1, /INCOMPATIBLE/) === 0, JSON.stringify(C.B1));
  t('B-CDXVIII kéto 250 kg à 800 kcal : « Lipides: 0g » et l\'écart de 40 kcal est dit',
    un(C.KETO, /Lipides: 0g$/) === 1 && un(C.KETO, /CIBLE INCOMPATIBLE.*protéines \+ glucides kéto = 840 kcal pour une cible de 800 kcal \(\+40\), lipides écrêtés à 0/) === 1
    && un(C.KETO, /glucides écrêtés/) === 0, JSON.stringify(C.KETO));
  /* ⭐ C (témoin demandé par la contre-vérification) : en standard, c'est toujours des GLUCIDES qu'on parle. */
  t('B-CDXVIII C · standard (D1) : Milo lit « glucides écrêtés à 0 », jamais « lipides écrêtés »',
    un(C.D1, /glucides écrêtés à 0/) === 1 && un(C.D1, /lipides écrêtés/) === 0, JSON.stringify(C.D1));
  t('B-CDXVIII aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};
