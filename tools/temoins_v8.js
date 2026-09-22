#!/usr/bin/env node
/* 🔬 TÉMOINS DE V8 — bloc B-CCCLIII. ⛔ NON BRANCHÉ dans `tests/parcours/runner.js` :
   V8 n'est pas servie, donc ses témoins ne doivent pas bloquer une livraison du produit.
   ⭐ Chaque témoin porte le NUMÉRO d'invariant du brief (P01…P20) et se lit seul.
   ⛔ Ils sont écrits à partir des INVARIANTS, pas autour du comportement de V8 : plusieurs
   échouent volontairement sur V0, et c'est ce qui prouve qu'ils mesurent quelque chose. */
const M = require('./moteur_v8.js');
const V8 = M.mV8, V8nc = M.VARIANTES.V8nc, C = M.CONST;
let ok = 0, rouge = [];
const T = (id, cond, det) => { if (cond) ok++; else rouge.push(id + (det ? ' — ' + det : '')); };

const base = { gender:'H',age:35,height:178,bw:85,activityLevel:1.55,workType:'bureau',goal:'muscle',
  phase:'charge',smoker:false,othersport:'aucun',foodMode:'',manualKcal:null,lm:null,level:'',
  seancesSem:3,seriesParGroupe:9 };
const P = o => Object.assign({}, base, o);
const ferm = r => r.prot_g * 4 + r.fat_g * 9 + r.carbs_g * 4 - r.kcal;

/* ── P01 FERMETURE : l'invariant qui ne dépend d'AUCUNE source externe ── */
{
  let pire = 0, n = 0;
  for (const bw of [42,45,55,70,85,100,120,150]) for (const goal of ['perte','recomp','equilibre','force','muscle'])
  for (const g of ['H','F']) for (const ph of ['charge','decharge']) for (const fm of ['','keto','lowcarb'])
  for (const act of [1.375,1.55,1.9]) {
    const r = V8(P({ bw, goal, gender: g, phase: ph, foodMode: fm, activityLevel: act }));
    if (!r) continue; n++; pire = Math.max(pire, Math.abs(ferm(r)));
  }
  T('P01① fermeture exacte sur ' + n + ' profils', pire === 0, 'pire écart ' + pire + ' kcal');
}
T('P01② le cas femme 78a/148cm/120kg ferme', ferm(V8(P({gender:'F',age:78,height:148,bw:120,activityLevel:1.375,goal:'perte',phase:'decharge',seancesSem:0}))) === 0);
T('P01③ la cible manuelle infaisable ferme quand même',
  ferm(V8(P({ manualKcal: 600 }))) === 0);

/* ── P02/P03 ── */
{
  let mauvais = 0;
  for (const bw of [42,60,85,120,150]) for (const goal of ['perte','recomp','muscle','force','equilibre'])
  for (const mk of [null,600,1000,9000]) {
    const r = V8(P({ bw, goal, manualKcal: mk })); if (!r) continue;
    if (r.prot_g < 0 || r.fat_g < 0 || r.carbs_g < 0) mauvais++;
    if (!isFinite(r.prot_g) || !isFinite(r.fat_g) || !isFinite(r.carbs_g) || !isFinite(r.kcal)) mauvais++;
  }
  T('P02/P03 aucune macro négative ni NaN', mauvais === 0, mauvais + ' cas');
}

/* ── P04/P18 déterminisme ── */
{
  const s = new Set(); for (let i = 0; i < 8; i++) s.add(JSON.stringify(V8(P({ bw: 77.3, goal: 'perte' }))));
  T('P04/P18 déterminisme strict', s.size === 1);
}

/* ── P05/P06 continuité ── */
{
  let pire = 0;
  for (let bw = 45; bw <= 150; bw++) for (const goal of ['perte','recomp','muscle'])
    pire = Math.max(pire, Math.abs(V8(P({ bw: bw + 1, goal })).kcal - V8(P({ bw, goal })).kcal));
  T('P05 continuité +1 kg (< 120 kcal)', pire < 120, 'pire saut ' + pire);
  let pireMG = 0;
  for (let bf = 5; bf <= 50; bf++) {
    const mk = x => P({ bw: 90, goal: 'perte', lm: Math.round(90 * (1 - x / 100) * 10) / 10 });
    pireMG = Math.max(pireMG, Math.abs(V8(mk(bf + 1)).kcal - V8(mk(bf)).kcal));
  }
  T('P06 continuité +1 % de masse grasse (< 120 kcal)', pireMG < 120, 'pire saut ' + pireMG);
}

/* ── P07 ordre des objectifs : perte < recomp < equilibre < force < muscle ── */
{
  const k = g => V8(P({ goal: g })).kcal;
  T('P07 ordre des objectifs', k('perte') < k('recomp') && k('recomp') < k('equilibre')
    && k('equilibre') <= k('force') && k('force') <= k('muscle'),
    [k('perte'),k('recomp'),k('equilibre'),k('force'),k('muscle')].join(' < '));
}
/* ── P08 charge > décharge (décision actée du produit) ── */
T('P08 charge au-dessus de décharge', V8(P({ phase: 'charge' })).kcal > V8(P({ phase: 'decharge' })).kcal);

/* ── P09 plafond de déficit (Murphy & Koehler) ── */
{
  /* ⛔⛔ LE PROFIL COMPTE AUTANT QUE L'ASSERTION — le contrôle négatif me l'a prouvé une
     seconde fois. Ma première version balayait des profils « moyens » où le plafond de déficit
     n'est **jamais atteint** : porter la borne de 500 à 1 500 kcal ne changeait donc rien et la
     mutation restait VERTE. *Un témoin qui ne visite jamais le régime où la règle mord ne
     mesure pas la règle, il mesure son absence.* Les profils ci-dessous sont ceux où chaque
     borne mord réellement, trouvés par balayage et non choisis à la main. */
  let pire = 0, pireReg = 0;
  const DUR = [{ bw: 60, height: 148, age: 18, activityLevel: 1.375, lm: 42 },
               { bw: 150, height: 148, age: 18, activityLevel: 1.375 },
               { bw: 120, height: 160, age: 45, activityLevel: 1.375, lm: 72 },
               { bw: 100, height: 172, age: 30, activityLevel: 1.55 }];
  for (const d of DUR) for (const g of ['H','F']) for (const fm of ['','keto','lowcarb']) {
    const p = P(Object.assign({ gender: g, goal: 'perte', foodMode: fm, seancesSem: 0 }, d));
    const e = V8(p).kcal - M.mTDEE(p);
    if (fm) pireReg = Math.min(pireReg, e); else pire = Math.min(pire, e);
  }
  T('P09① déficit jamais au-delà de 500 kcal (hors régime)', pire >= -C.DEFICIT_MAX_KCAL, 'pire ' + pire);
  T('P09② régime : dépassement borné à l\'arrondi (≤ 5 kcal)', pireReg >= -(C.DEFICIT_MAX_KCAL + 5), 'pire ' + pireReg);
  T('P09③ le plafond MORD réellement sur ces profils (sinon le témoin ne mesure rien)',
    DUR.some(d => V8(P(Object.assign({ goal: 'perte', seancesSem: 0 }, d))).borne === 'deficit_plafonne'));
}
/* ── P10 surplus plafonné (Helms 2023) ── */
{
  let pire = 0; const SUR = [];
  for (const bw of [42,45,60,85,120,150]) for (const act of [1.375,1.55,1.725,1.9])
  for (const h of [148,178]) for (const bf of [null,30]) {
    const p = P({ bw, activityLevel: act, goal: 'muscle', height: h, age: 18,
                  lm: bf ? Math.round(bw * (1 - bf / 100) * 10) / 10 : null, seancesSem: 0 });
    const r = V8(p); pire = Math.max(pire, (r.kcal - M.mTDEE(p)) / M.mTDEE(p));
    if (r.borne === 'surplus_plafonne') SUR.push(1);
  }
  T('P10① surplus ≤ 15 % + arrondi', pire <= C.SURPLUS_MAX_PCT + 0.01, 'pire ' + (pire * 100).toFixed(1) + ' %');
  T('P10② le plafond de surplus MORD réellement sur ces profils', SUR.length > 0);
}

/* ── P11 protéines contextualisées ── */
{
  const sec = V8(P({ bw: 80, goal: 'perte', lm: 74.4 }));      // 7 % de MG
  const gras = V8(P({ bw: 80, goal: 'perte', lm: 48 }));       // 40 % de MG
  T('P11① le sujet SEC reçoit plus de protéines par kg de poids que le sujet GRAS',
    sec.prot_g / 80 > gras.prot_g / 80, sec.prot_g + ' vs ' + gras.prot_g);
  T('P11② jamais au-dessus de 3,1 g/kg de masse maigre (Helms)',
    sec.prot_g / 74.4 <= 3.11 && gras.prot_g / 48 <= 3.11);
  let pire = 0;
  for (const bw of [45,60,85,120,150]) for (const goal of ['perte','recomp','muscle','equilibre'])
  for (const bf of [5,15,25,35,45]) {
    const r = V8(P({ bw, goal, lm: Math.round(bw * (1 - bf / 100) * 10) / 10 }));
    pire = Math.max(pire, r.prot_g / bw);
  }
  T('P11③ jamais au-dessus de 2,2 g/kg de poids (plafond ANSES)', pire <= C.PROT_BW_MAX, 'pire ' + pire.toFixed(3));
  let bas = 9;
  for (const bw of [45,85,150]) for (const goal of ['perte','muscle','equilibre'])
    bas = Math.min(bas, V8(P({ bw, goal })).prot_g / bw);
  T('P11④ jamais sous 1,4 g/kg de poids', bas >= C.PROT_BW_MIN, 'plus bas ' + bas.toFixed(3));
  T('P11⑤ le déficit MONTE les protéines (Helms : plus de déficit → plus haut dans la plage)',
    V8(P({ bw: 80, goal: 'perte', lm: 68 })).prot_g > V8(P({ bw: 80, goal: 'equilibre', lm: 68 })).prot_g);
  /* ⛔⛔ LA MODULATION DE HELMS SE MESURE SUR `V8nc`, ET CE N'EST PAS UN CONTOURNEMENT.
     Mesuré : le plafond ANSES (2,2 g/kg de poids) **masque** la modulation par la sécheresse
     chez les sujets secs — 0,94 × 3,1 = 2,91 g/kg, donc le clamp tranche avant que la
     modulation ne se voie. `V8nc` est la MÊME fonction sans ce seul plafond : mutiler la
     modulation y est donc visible. 👉 *Un témoin doit observer la règle là où elle décide,
     pas là où une autre règle décide à sa place.*
     ⭐ Et c'est un FAIT sur V8 qu'il faut dire : chez un sujet sec, c'est le plafond ANSES —
     source française secondaire — qui commande, pas Helms. */
  {
    const sec2 = V8nc(P({ bw: 85, goal: 'perte', lm: 79.9 }));     // 6 % de MG
    const gras2 = V8nc(P({ bw: 85, goal: 'perte', lm: 51 }));      // 40 % de MG
    T('P11⑥ la modulation par la SÉCHERESSE existe (mesurée hors plafond ANSES)',
      sec2.prot_g / 79.9 > gras2.prot_g / 51 + 0.3,
      (sec2.prot_g / 79.9).toFixed(2) + ' vs ' + (gras2.prot_g / 51).toFixed(2) + ' g/kg de masse maigre');
    const petitDef = V8nc(P({ bw: 85, goal: 'recomp', lm: 51 }));
    const grosDef = V8nc(P({ bw: 85, goal: 'perte', lm: 51 }));
    T('P11⑦ la SÉVÉRITÉ du déficit monte les protéines à masse maigre égale',
      grosDef.prot_g / 51 > petitDef.prot_g / 51,
      (grosDef.prot_g / 51).toFixed(2) + ' vs ' + (petitDef.prot_g / 51).toFixed(2));
    let hautFFM = 0;
    /* ⚠️ `decharge` est INDISPENSABLE ici : le plafond de Helms ne mord qu'à sévérité de déficit
       maximale, et en `charge` le +100 kcal empêche d'y arriver. *Une borne haute se teste au
       point où elle est atteinte, pas au milieu du domaine.* */
    for (const bw of [60,85,120,150]) for (const bf of [3,5,10,20,30,40])
    for (const goal of ['perte','recomp']) for (const ph of ['charge','decharge'])
    for (const act of [1.375,1.55,1.9]) {
      const lm = Math.round(bw * (1 - bf / 100) * 10) / 10;
      hautFFM = Math.max(hautFFM, V8nc(P({ bw, goal, lm, height: 148, age: 18, phase: ph, activityLevel: act })).prot_g / lm);
    }
    T('P11⑨ le plafond de Helms MORD réellement (sinon le témoin ne mesure rien)', hautFFM > 3.05, hautFFM.toFixed(3));
    T('P11⑧ le plafond de Helms (3,1 g/kg de masse maigre) tient hors plafond ANSES',
      hautFFM <= 3.11, 'plus haut ' + hautFFM.toFixed(3));
  }
}

/* ── P12 lipides protégés ── */
{
  let basGkg = 9, basPct = 9, hautGkg = 0, hautPct = 0, nInfais = 0; const sansSignal = [];
  /* Profils choisis pour que CHAQUE borne lipidique morde au moins une fois (trouvés par
     balayage) : petit poids + faible TDEE pour les plafonds, petit poids + gros TDEE pour le
     plancher en % de l'énergie. */
  for (const bw of [42,45,60,85,120,150]) for (const goal of ['perte','recomp','muscle','equilibre','force'])
  for (const act of [1.375,1.9]) for (const h of [148,178]) for (const wt of ['bureau','physique'])
  for (const bf of [null,6]) for (const mk of [null,700,5000]) {
    /* ⭐ LES CIBLES MANUELLES SONT INDISPENSABLES ICI, et c'est une mesure qui l'a montré :
       `FAT_RATIO` vaut au minimum 0,75 g/kg, donc le plancher de 0,5 g/kg **ne peut jamais
       mordre sur la valeur initiale** — il ne mord que dans l'arbitrage, quand protéines +
       lipides dépassent la cible. Symétriquement, le plancher de 15 % des calories ne mord
       qu'à cible très élevée. *Une borne qu'on ne peut atteindre qu'en passant par un autre
       chemin doit être testée PAR ce chemin.* */
    const r = V8(P({ bw, goal, activityLevel: act, height: h, workType: wt, age: 18, seancesSem: 7,
                     manualKcal: mk,
                     lm: bf ? Math.round(bw * (1 - bf / 100) * 10) / 10 : null }));
    /* ⛔⛔ ET LA FORMULATION EXACTE DE L'INVARIANT EST CELLE-CI, PAS « les bornes tiennent
       toujours ». À une cible manuelle de 700 kcal chez 150 kg, **aucune répartition ne peut
       satisfaire les quatre bornes en même temps** : c'est arithmétique, pas discutable.
       👉 ***Soit toutes les bornes tiennent, soit la prescription est DÉCLARÉE infaisable.***
       Un moteur qui choisirait en silence laquelle abandonner serait pire qu'un moteur qui dit
       « ta cible est plus basse que tes besoins minimaux ». */
    if (r.faisable === false) { nInfais++; continue; }
    const hors = (r.fat_g / bw > C.LIP_GKG_MAX + 0.02) || (r.fat_g * 9 / r.kcal > C.LIP_PCT_MAX + 0.005)
              || (r.fat_g / bw < C.LIP_GKG_MIN - 0.001) || (r.fat_g * 9 / r.kcal < C.LIP_PCT_MIN - 0.005);
    if (hors && !(r.signaux || []).includes('bornes_lipides_en_conflit'))
      sansSignal.push({ bw, goal, mk, L: r.fat_g, gkg: +(r.fat_g / bw).toFixed(2), pct: +(r.fat_g * 9 / r.kcal).toFixed(3) });
    basGkg = Math.min(basGkg, r.fat_g / bw); hautGkg = Math.max(hautGkg, r.fat_g / bw);
    basPct = Math.min(basPct, r.fat_g * 9 / r.kcal); hautPct = Math.max(hautPct, r.fat_g * 9 / r.kcal);
  }
  T('P12① lipides ≥ 0,5 g/kg (Iraki bas de plage)', basGkg >= C.LIP_GKG_MIN, 'plus bas ' + basGkg.toFixed(3));
  T('P12② lipides ≤ 1,5 g/kg (Iraki haut de plage) SAUF conflit déclaré',
    hautGkg <= C.LIP_GKG_MAX + 0.02 || sansSignal.length === 0,
    'plus haut ' + hautGkg.toFixed(3) + ', ' + sansSignal.length + ' breach(es) sans signal');
  T('P12③ lipides ≥ 15 % des calories (Helms)', basPct >= C.LIP_PCT_MIN - 0.005, 'plus bas ' + (basPct * 100).toFixed(1) + ' %');
  T('P12④ lipides ≤ 35 % des calories SAUF conflit déclaré',
    hautPct <= C.LIP_PCT_MAX + 0.005 || sansSignal.length === 0,
    'plus haut ' + (hautPct * 100).toFixed(1) + ' %, ' + sansSignal.length + ' breach(es) sans signal');
  T('P12⑦ TOUT franchissement d\'une borne lipidique porte un SIGNAL (aucun choix silencieux)',
    sansSignal.length === 0, JSON.stringify(sansSignal.slice(0, 3)));
  T('P12⑥ des cibles IRRÉALISABLES existent et sont déclarées (jamais arbitrées en silence)',
    nInfais > 0, nInfais + ' profils déclarés infaisables');
  T('P12⑤ les QUATRE bornes lipidiques mordent réellement dans ce jeu de profils',
    basGkg <= C.LIP_GKG_MIN + 0.02 && hautGkg >= C.LIP_GKG_MAX - 0.05
    && basPct <= C.LIP_PCT_MIN + 0.012 && hautPct >= C.LIP_PCT_MAX - 0.012,
    [basGkg.toFixed(2), hautGkg.toFixed(2), basPct.toFixed(3), hautPct.toFixed(3)].join(' / '));
}

/* ── P13 glucides : résidu, JAMAIS tronqué ── */
{
  const p = P({ bw: 45, height: 195, age: 18, activityLevel: 1.9, goal: 'muscle', seancesSem: 4 });
  const r = V8(p);
  T('P13① les calories excédentaires ne sont pas jetées (fermeture exacte sur le cas 45 kg)', ferm(r) === 0);
  T('P13② le cas 45 kg très actif porte un SIGNAL au lieu d\'une troncature',
    (r.signaux || []).includes('gluc_au_dela_de_la_charge') || (r.signaux || []).includes('tdee_a_reexaminer'),
    JSON.stringify(r.signaux));
  T('P13③ aucun plafond dur sur les glucides : ils dépassent la bande quand l\'énergie l\'exige',
    r.carbs_g / 45 > M.bandeGlucides(p), (r.carbs_g / 45).toFixed(2) + ' vs bande ' + M.bandeGlucides(p));
}

/* ── P14 données périmées / manquantes ── */
T('P14① profil incomplet → aucune sortie (on ne devine pas)', V8(P({ bw: 0 })) === null && V8(P({ height: 0 })) === null && V8(P({ age: 0 })) === null);
T('P14② bilan corporel présent → provenance « mesure »', V8(P({ lm: 68 })).src_ffm === 'mesure');
T('P14③ bilan absent → provenance « estimee », jamais silencieuse', V8(P({})).src_ffm === 'estimee');

/* ── P15 calories manuelles ── */
{
  /* ⛔⛔ P01 ET P15 SONT MATHÉMATIQUEMENT INCOMPATIBLES AU KCAL PRÈS — mes deux témoins se
     contredisaient, et c'est une PREUVE, pas un réglage.
     Les macros s'expriment en GRAMMES ENTIERS. Un gramme de glucide vaut 4 kcal, un gramme de
     lipide 9. La somme `P×4 + L×9 + G×4` ne peut donc atteindre qu'un sous-ensemble des entiers :
     à protéines et lipides fixés, elle avance **par pas de 4 kcal**. 👉 ***Une cible manuelle de
     3 000 kcal n'est en général PAS atteignable exactement en grammes entiers.***
     ⭐ Le choix est donc forcé, et il est le bon : **la cible affichée EST la somme des macros**
     (P01), et la cible manuelle est honorée **à la granularité d'un gramme près**, soit au plus
     2 kcal. *Afficher 3 000 au-dessus de macros qui en font 2 999 recréerait exactement le
     défaut que ce chantier existe pour fermer.*
     ⚠️ Le témoin borne donc l'écart au lieu d'exiger l'égalité — et il vérifie que la borne est
     bien la borne THÉORIQUE (2 kcal), pas une tolérance choisie pour passer. */
  const r1 = V8(P({ manualKcal: 3000 })), r2 = V8(P({ manualKcal: 600 }));
  T('P15① une cible manuelle RÉALISABLE est gardée à la granularité du gramme (≤ 2 kcal)',
    Math.abs(r1.kcal - 3000) <= 2, String(r1.kcal));
  T('P15② une cible manuelle IRRÉALISABLE est déclarée, jamais maquillée',
    r2.faisable === false && (r2.signaux || []).includes('cible_infaisable'));
  T('P15③ la cible manuelle échappe au plafond de déficit (décision actée)',
    Math.abs(V8(P({ manualKcal: 1200, goal: 'perte' })).kcal - 1200) <= 2);
  /* ⭐ Et on PROUVE la borne : sur 3 000 cibles manuelles, l'écart maximal doit rester ≤ 2 kcal.
     Un témoin qui se contenterait de « ≤ 2 » sur un cas mesurerait un hasard. */
  let pireMan = 0;
  for (let k = 800; k <= 6000; k += 1) {
    const r = V8(P({ manualKcal: k }));
    if (r && r.faisable !== false) pireMan = Math.max(pireMan, Math.abs(r.kcal - k));
  }
  T('P15④ la borne de 2 kcal tient sur 5 201 cibles manuelles', pireMan <= 2, 'pire ' + pireMan);
}

/* ── P16 régime choisi respecté ── */
{
  const k = V8(P({ foodMode: 'keto', bw: 100 })), l = V8(P({ foodMode: 'lowcarb', bw: 100 }));
  T('P16① kéto : glucides à ~5 % des calories', Math.abs(k.carbs_g * 4 / k.kcal - 0.05) < 0.01);
  T('P16② low-carb : glucides à ~25 % et protéines à ~30 %',
    Math.abs(l.carbs_g * 4 / l.kcal - 0.25) < 0.01 && Math.abs(l.prot_g * 4 / l.kcal - 0.30) < 0.01);
  T('P16③ les deux régimes FERMENT', ferm(k) === 0 && ferm(l) === 0, ferm(k) + '/' + ferm(l));
  /* ⛔⛔ LA FERMETURE NE SUFFIT PAS À PROUVER QUE LE RÉGIME EST JUSTE — le contrôle négatif me
     l'a montré. V8 rend TOUJOURS `kcal = somme des macros`, donc casser la répartition du
     low-carb laisse la fermeture parfaite : c'est la CIBLE qui dérive, en silence.
     👉 *Quand un moteur garantit une égalité par construction, cette égalité ne peut plus servir
     de témoin pour ce qui se passe en amont.* On épingle donc l'écart entre la cible VISÉE et
     la cible SERVIE — au plus l'arrondi d'un gramme. */
  let pireReg = 0;
  for (const bw of [42,50,70,100,130,150]) for (const fm of ['keto','lowcarb'])
  for (const goal of ['perte','muscle','equilibre','recomp','force'])
  for (const ph of ['charge','decharge']) for (const act of [1.375,1.9]) {
    const r = V8(P({ bw, foodMode: fm, goal, phase: ph, activityLevel: act }));
    pireReg = Math.max(pireReg, Math.abs(r.kcal - r.kcal_vise));
  }
  T('P16④ un régime ne fait pas DÉRIVER la cible (≤ 5 kcal d\'arrondi)', pireReg <= 5, 'pire ' + pireReg);
}

/* ── P19 disponibilité énergétique (RED-S) : le garde-fou RELÈVE, il n'abaisse jamais ── */
{
  let pireEA = 99, mord = false;
  for (const d of [{ gender:'H', bw:42, height:148, age:18, activityLevel:1.375, seancesSem:7, lm:33.6 },
                   { gender:'F', bw:50, height:165, age:25, activityLevel:1.375, seancesSem:7, lm:37 },
                   { gender:'H', bw:60, height:160, age:20, activityLevel:1.375, seancesSem:7, lm:48 }]) {
    const p = P(Object.assign({ goal: 'perte' }, d)), r = V8(p);
    pireEA = Math.min(pireEA, (r.kcal - d.seancesSem * 7 * d.bw / 7) / d.lm);
    if ((r.signaux || []).includes('disponibilite_energetique')) mord = true;
  }
  T('P19① EA ≥ 30 kcal/kg de masse maigre (CIO/RED-S)', pireEA >= C.EA_MIN - 0.5, 'plus bas ' + pireEA.toFixed(1));
  T('P19② le garde-fou MORD réellement sur ces profils', mord);
}

/* ── P20 signal de plausibilité, jamais une troncature ── */
{
  const r = V8(P({ bw: 45, height: 195, age: 18, activityLevel: 1.9, workType: 'physique', goal: 'muscle' }));
  T('P20 kcal/kg extrême → signal « tdee_a_reexaminer »', (r.signaux || []).includes('tdee_a_reexaminer'),
    JSON.stringify(r.signaux));
}

/* ── COMPARAISON : plusieurs de ces témoins DOIVENT échouer sur V0 ──
   ⭐ C'est la preuve qu'ils mesurent un invariant et non le comportement de la candidate. */
{
  const V0 = M.mV0, f0 = r => r.prot_g * 4 + r.fat_g * 9 + r.carbs_g * 4 - r.kcal;
  const casF = P({ gender:'F',age:78,height:148,bw:120,activityLevel:1.375,goal:'perte',phase:'decharge' });
  T('CTRL① V0 ÉCHOUE sur la fermeture (c\'est le défaut central)', f0(V0(casF)) !== 0, 'écart ' + f0(V0(casF)));
  T('CTRL② V0 ÉCHOUE sur le plafond protéique ANSES', V0(casF).prot_g / 120 > C.PROT_BW_MAX);
  T('CTRL③ V0 ÉCHOUE sur la cible manuelle', f0(V0(P({ manualKcal: 600 }))) !== 0);
}

console.log('TÉMOINS V8 (bloc B-CCCLIII) : ' + ok + ' OK · ' + rouge.length + ' ROUGE');
rouge.forEach(r => console.log('  ⛔ ' + r));
process.exit(rouge.length ? 1 : 0);
