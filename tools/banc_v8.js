#!/usr/bin/env node
/* 🧪 BANC V8 — ⛔ LECTURE SEULE, aucune modification du moteur servi, aucune publication.

   ⭐ TROIS ÉTAPES, DANS CET ORDRE, ET L'ORDRE COMPTE :
   ① le MIROIR de V0 est revalidé contre l'app SERVIE — *une candidate comparée à un adversaire
     mal reproduit ne prouve rien* ;
   ② CORPUS A (quadrillage adversarial) et CORPUS B (population plausible) — ⛔ la fréquence de A
     n'est JAMAIS présentée comme une prévalence ;
   ③ contre-audit adversarial de V8 : on cesse de la défendre et on essaie de la détruire.
*/
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const M8 = require('./moteur_v8.js');
const ROOT = path.dirname(__dirname);
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
  '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2',
  '.webp':'image/webp','.ico':'image/x-icon','.wasm':'application/wasm'};
const VAR = M8.VARIANTES, NOMS = Object.keys(VAR);

/* ═════════ MÉTRIQUES — exactement les mêmes pour toutes les variantes (§19) ═════════ */
function metriques(p, r) {
  if (!r) return null;
  const { ffm } = M8.ffmDe(p);
  const kM = r.prot_g * 4 + r.fat_g * 9 + r.carbs_g * 4;
  const tdee = M8.mTDEE(p);
  return {
    kcal: r.kcal, kcal_kg: r.kcal / p.bw,
    prot_gkg: r.prot_g / p.bw, prot_gkg_ffm: r.prot_g / ffm, prot_pct: r.prot_g * 4 / r.kcal,
    lip_gkg: r.fat_g / p.bw, lip_pct: r.fat_g * 9 / r.kcal,
    gluc_gkg: r.carbs_g / p.bw, gluc_abs: r.carbs_g, gluc_pct: r.carbs_g * 4 / r.kcal,
    ecart_pct: (r.kcal - tdee) / tdee, ecart_kcal: r.kcal - tdee,
    vitesse_pct_sem: (r.kcal - tdee) * 7 / M8.CONST.KCAL_PAR_KG / p.bw * 100,
    ea: (r.kcal - (p.seancesSem || 0) * 7 * p.bw / 7) / ffm,
    fermeture: kM - r.kcal
  };
}
/* ⛔ Les propriétés sont écrites AVANT V8 et valent pour TOUTES les variantes. Une propriété
   écrite autour de la candidate ne mesure que la candidate (règle d'honnêteté §24). */
function violations(p, r, m) {
  const o = [];
  if (!r || !m) { o.push('P00_pas_de_sortie'); return o; }
  if (!isFinite(r.prot_g) || !isFinite(r.fat_g) || !isFinite(r.carbs_g) || !isFinite(r.kcal)) o.push('P03_nan');
  if (r.prot_g < 0 || r.fat_g < 0 || r.carbs_g < 0) o.push('P02_macro_negative');
  if (Math.abs(m.fermeture) > 5) o.push('P01_fermeture_sup_5');
  if (Math.abs(m.fermeture) > 50) o.push('P01_fermeture_sup_50');
  if (Math.abs(m.fermeture) > 200) o.push('P01_fermeture_sup_200');
  const reg = !!p.foodMode;
  const tag = s => reg ? s + '@regime' : s;
  if (m.prot_gkg < 0.8) o.push('P11_prot_sous_0_8_gkg');
  if (m.prot_gkg > 2.2) o.push(tag('P11_prot_sur_2_2_gkg_ANSES'));
  if (m.prot_gkg_ffm > 3.1) o.push(tag('P11_prot_sur_3_1_gkg_ffm_Helms'));
  if (m.prot_pct > 0.40) o.push(tag('P11_prot_sur_40pct'));
  if (m.lip_gkg < 0.5) o.push(tag('P12_lip_sous_0_5_gkg_Iraki'));
  if (m.lip_pct < 0.15) o.push(tag('P12_lip_sous_15pct_Helms'));
  if (m.lip_pct > 0.35) o.push(tag('P12_lip_sur_35pct'));
  if (m.lip_gkg > 1.5) o.push(tag('P12_lip_sur_1_5_gkg_Iraki'));
  if (r.carbs_g === 0 && !reg) o.push('P13_gluc_zero');
  /* ⛔⛔ RECLASSÉE EN OBSERVATION LE 23/09, ET C'EST MOI QUI AVAIS MAL EMPLOYÉ LA SOURCE.
     Henselmans 2022 dit que **des glucides SUPPLÉMENTAIRES n'améliorent pas la performance**
     d'une séance nourrie à <= 10 series par groupe musculaire. ⛔ Ça ne dit PAS qu'au-delà de
     4-5 g/kg les glucides deviennent faux : quelqu'un dont la depense est elevee a besoin de
     ces calories, et elles doivent bien aller quelque part.
     👉 *Transformer « pas de benefice ergogenique supplementaire » en « plafond d'apport » est
     exactement le piege n°10 de la liste de Michel* — une plage de litterature devenue seuil
     physiologique. Le compteur reste, comme OBSERVATION, parce qu'il dit quelque chose d'utile
     (a quelle frequence la prescription depasse ce que l'entrainement declare justifie) ; il ne
     compte plus comme violation. */
  if (m.gluc_gkg > M8.bandeGlucides(p) && !reg) o.push('O13_gluc_au_dela_de_la_charge');
  if (m.gluc_gkg > 12 && !reg) o.push('P13_gluc_sur_12_gkg');
  if (m.gluc_abs > 600 && !reg) o.push('P13_gluc_sur_600g_praticabilite');
  if (m.ecart_kcal < -M8.CONST.DEFICIT_MAX_KCAL) o.push('P09_deficit_sur_500kcal_Murphy');
  if (m.ecart_pct > 0.20) o.push('P10_surplus_sur_20pct');
  if (m.ea < M8.CONST.EA_MIN) o.push('P19_disponibilite_energetique_sous_30');
  if (m.kcal_kg > M8.CONST.KCAL_KG_SIGNAL) o.push('P20_kcal_kg_sur_55');
  return o;
}

/* ═════════ CORPUS A — quadrillage ADVERSARIAL (extrêmes, pas prévalence) ═════════ */
function* corpusA() {
  for (const gender of ['H', 'F'])
  for (const age of [18, 30, 45, 60, 80])
  for (const height of [148, 160, 172, 185, 200])
  for (const bw of [45, 60, 75, 90, 110, 130, 150])
  for (const bfCible of [null, 8, 15, 25, 35, 45])
  for (const activityLevel of [1.375, 1.55, 1.725, 1.9])
  for (const workType of ['bureau', 'actif', 'physique'])
  for (const goal of ['perte', 'recomp', 'equilibre', 'force', 'muscle'])
  for (const seancesSem of [0, 3, 6])
  for (const level of ['', 'confirme'])
    yield { gender, age, height, bw, activityLevel, workType, goal, level, seancesSem,
            seriesParGroupe: seancesSem * 3, phase: 'charge', smoker: false,
            othersport: 'aucun', foodMode: '', manualKcal: null,
            lm: bfCible == null ? null : Math.round(bw * (1 - bfCible / 100) * 10) / 10 };
}

/* ═════════ CORPUS B — population PLAUSIBLE ═════════
   ⚠️ C'est un MODÈLE, pas un recensement : l'app ne remonte pas ces distributions. */
let _s = 20260923;
const rnd = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
const gauss = (mu, sd) => mu + sd * Math.sqrt(-2 * Math.log(Math.max(1e-9, rnd()))) * Math.cos(2 * Math.PI * rnd());
const tire = t => { let r = rnd() * t.reduce((a, x) => a + x[1], 0);
  for (const [v, p] of t) { r -= p; if (r <= 0) return v; } return t[t.length - 1][0]; };
function profilB() {
  const gender = rnd() < 0.72 ? 'H' : 'F';
  const height = Math.round(Math.min(205, Math.max(145, gauss(gender === 'H' ? 176 : 164, 7))));
  const imc = Math.min(45, Math.max(16, gauss(25.5, 4.2)));
  const bw = Math.round(imc * (height / 100) ** 2 * 10) / 10;
  const age = Math.round(Math.min(80, Math.max(16, gauss(34, 12))));
  const seancesSem = +tire([[0, 8], [1, 6], [2, 14], [3, 26], [4, 24], [5, 13], [6, 7], [7, 2]]);
  /* 1 personne sur 5 a un bilan corporel frais : le reste passe par l'estimation. */
  const aBilan = rnd() < 0.20;
  const bf = Math.min(55, Math.max(4, gauss(gender === 'H' ? 20 : 28, 7)));
  return { gender, height, bw, age, seancesSem,
    seriesParGroupe: Math.round(seancesSem * (2 + rnd() * 4)),
    activityLevel: +tire([[1.375, 25], [1.55, 45], [1.725, 25], [1.9, 5]]),
    workType: tire([['bureau', 55], ['debout', 20], ['actif', 17], ['physique', 8]]),
    goal: tire([['muscle', 38], ['perte', 30], ['recomp', 14], ['force', 8], ['equilibre', 8], ['endurance', 2]]),
    level: tire([['', 55], ['debutant', 15], ['intermediaire', 18], ['confirme', 12]]),
    phase: tire([['charge', 75], ['decharge', 25]]), smoker: rnd() < 0.18,
    othersport: rnd() < 0.35 ? 'velo' : 'aucun',
    foodMode: tire([['', 92], ['keto', 4], ['lowcarb', 4]]), manualKcal: null,
    lm: aBilan ? Math.round(bw * (1 - bf / 100) * 10) / 10 : null };
}

const pctl = (a, q) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const dist = a => a.length ? { p01: +pctl(a, .01).toFixed(2), p05: +pctl(a, .05).toFixed(2), p25: +pctl(a, .25).toFixed(2),
  med: +pctl(a, .5).toFixed(2), p75: +pctl(a, .75).toFixed(2), p95: +pctl(a, .95).toFixed(2),
  p99: +pctl(a, .99).toFixed(2), min: +Math.min(...a).toFixed(2), max: +Math.max(...a).toFixed(2) } : null;

/* ═════════ CAS OBLIGATOIRES (§16) ═════════ */
const CAS = [
  ['F 78a 148cm 120kg sedentaire perte decharge', { gender:'F',age:78,height:148,bw:120,activityLevel:1.375,workType:'bureau',goal:'perte',phase:'decharge',seancesSem:0 }],
  ['H 55kg tres actif muscle charge (gluc > 10 g/kg en V0)', { gender:'H',age:35,height:178,bw:55,activityLevel:1.9,workType:'bureau',goal:'muscle',phase:'charge',seancesSem:5 }],
  ['H 85kg metier physique tres actif muscle (717 g en V0)', { gender:'H',age:35,height:178,bw:85,activityLevel:1.9,workType:'physique',goal:'muscle',phase:'charge',seancesSem:5 }],
  ['H 45kg 195cm 18a tres actif muscle', { gender:'H',age:18,height:195,bw:45,activityLevel:1.9,workType:'bureau',goal:'muscle',phase:'charge',seancesSem:4 }],
  ['H 150kg sedentaire perte decharge', { gender:'H',age:35,height:178,bw:150,activityLevel:1.375,workType:'bureau',goal:'perte',phase:'decharge',seancesSem:0 }],
  ['cible manuelle 600 kcal (H 85kg)', { gender:'H',age:35,height:178,bw:85,activityLevel:1.55,workType:'bureau',goal:'muscle',phase:'charge',seancesSem:3,manualKcal:600 }],
  ['profil TRES SEC (H 80kg, 7 % MG, perte)', { gender:'H',age:28,height:180,bw:80,activityLevel:1.725,workType:'bureau',goal:'perte',phase:'charge',seancesSem:5,lm:74.4 }],
  ['profil FORTE MG (H 120kg, 42 % MG, perte)', { gender:'H',age:45,height:175,bw:120,activityLevel:1.375,workType:'bureau',goal:'perte',phase:'charge',seancesSem:2,lm:69.6 }],
  ['F 42kg 150cm 25a sedentaire perte', { gender:'F',age:25,height:150,bw:42,activityLevel:1.375,workType:'bureau',goal:'perte',phase:'decharge',seancesSem:0 }],
  ['H 130kg recomp bureau', { gender:'H',age:35,height:178,bw:130,activityLevel:1.55,workType:'bureau',goal:'recomp',phase:'charge',seancesSem:3 }],
  ['TDEE tres eleve (H 110kg, 1.9, physique, 6 seances)', { gender:'H',age:25,height:190,bw:110,activityLevel:1.9,workType:'physique',goal:'muscle',phase:'charge',seancesSem:6,seriesParGroupe:20 }],
  ['TDEE tres faible (F 45kg 150cm 80a sedentaire)', { gender:'F',age:80,height:150,bw:45,activityLevel:1.375,workType:'bureau',goal:'equilibre',phase:'decharge',seancesSem:0 }],
  ['H 100kg keto perte', { gender:'H',age:50,height:175,bw:100,activityLevel:1.375,workType:'bureau',goal:'perte',phase:'decharge',seancesSem:2,foodMode:'keto' }],
  ['H 100kg lowcarb perte', { gender:'H',age:50,height:175,bw:100,activityLevel:1.375,workType:'bureau',goal:'perte',phase:'decharge',seancesSem:2,foodMode:'lowcarb' }],
].map(([n, p]) => [n, Object.assign({ level:'', smoker:false, othersport:'aucun', foodMode:'',
  manualKcal:null, lm:null, seriesParGroupe:(p.seancesSem||0)*3 }, p)]);

(async () => {
  const T = {}, t0 = Date.now();
  const OUT = { horodatage: new Date().toISOString() };

  /* ───── ① REVALIDATION DU MIROIR DE V0 CONTRE L'APP SERVIE ───── */
  const srv = http.createServer((q, r) => {
    let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html';
    const f = path.join(ROOT, u);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(r);
  });
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`try{localStorage.clear();}catch(e){}`);
  await pg.goto('http://localhost:' + srv.address().port + '/index.html');
  await pg.waitForTimeout(2200);

  const ech = []; let i = 0;
  for (const p of corpusA()) { if (i++ % 211 === 0) ech.push(p); }
  for (const [, p] of CAS) ech.push(p);
  const tV0 = Date.now();
  const APP = await pg.evaluate(profils => {
    const j = n => { const d = new Date(Date.now() - n * 864e5);
      return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
    return profils.map(p => {
      S.gender=p.gender; S.bw=p.bw; S.height=p.height; S.age=p.age;
      S.activityLevel=p.activityLevel; S.workType=p.workType; S.goal=p.goal;
      S.smoker=!!p.smoker; S.nutritionPhase=p.phase; S.manualKcal=p.manualKcal;
      S.foodMode=p.foodMode||''; S.keto=false; S.level=p.level||''; S.discipline='muscu';
      S.sessions=[]; S.weightLog=[]; S.mensLog=[]; S.stepsLog=[];
      S.coachQuiz={answers:{othersport:p.othersport}};
      S.bodyScans = p.lm!=null ? [{date:j(3),leanMass:p.lm,weight:p.bw}] : [];
      S.mensCycleStart=null; S.contraception='';
      const m=calcMacros(p.phase);
      return { kcal:m.calories, prot_g:m.prot_g, fat_g:m.fat_g, carbs_g:m.carbs_g };
    });
  }, ech);
  T.validation_ms = Date.now() - tV0;
  const ecarts = [];
  ech.forEach((p, k) => {
    const a = APP[k], v = M8.mV0(p), d = [];
    if (a.kcal !== v.kcal) d.push(`kcal ${a.kcal}!=${v.kcal}`);
    if (a.prot_g !== v.prot_g) d.push(`P ${a.prot_g}!=${v.prot_g}`);
    if (a.fat_g !== v.fat_g) d.push(`L ${a.fat_g}!=${v.fat_g}`);
    if (a.carbs_g !== v.carbs_g) d.push(`G ${a.carbs_g}!=${v.carbs_g}`);
    if (d.length) ecarts.push({ p, d });
  });
  await b.close(); srv.close();
  OUT.validation_v0 = { taille: ech.length, ecarts: ecarts.length, detail: ecarts.slice(0, 10), erreurs_page: errs };
  if (ecarts.length) {
    console.log('⛔ ARRÊT : le miroir de V0 diverge de l\'app servie sur ' + ecarts.length + ' profils.');
    ecarts.slice(0, 5).forEach(e => console.log('   ' + JSON.stringify(e.d)));
    fs.writeFileSync('/tmp/banc_v8.json', JSON.stringify(OUT, null, 1));
    process.exit(1);
  }
  console.log('① MIROIR V0 vs APP SERVIE : ' + ech.length + ' profils, 0 écart, ' + errs.length + ' erreur(s) de page');

  /* ───── ② CORPUS A et B ───── */
  function passe(gen, n, nom) {
    const R = {}; NOMS.forEach(k => R[k] = { n: 0, viol: {}, ex: {}, met: {} });
    const CH = ['kcal','kcal_kg','prot_gkg','prot_gkg_ffm','prot_pct','lip_gkg','lip_pct',
                'gluc_gkg','gluc_abs','gluc_pct','ecart_pct','vitesse_pct_sem','ea','fermeture'];
    NOMS.forEach(k => CH.forEach(c => R[k].met[c] = []));
    let z = 0;
    for (const p of gen) {
      if (n && z >= n) break;
      const garde = (z % 101 === 0); z++;
      for (const k of NOMS) {
        const r = VAR[k](p), m = metriques(p, r), X = R[k]; X.n++;
        for (const v of violations(p, r, m)) {
          X.viol[v] = (X.viol[v] || 0) + 1;
          if (!X.ex[v]) X.ex[v] = [];
          if (X.ex[v].length < 3 && r) X.ex[v].push({
            p: `${p.gender} ${p.age}a ${p.height}cm ${p.bw}kg act${p.activityLevel} ${p.workType} ${p.goal} ${p.seancesSem}s/sem${p.lm!=null?' MG'+Math.round(100*(1-p.lm/p.bw))+'%':''}`,
            r: `${r.kcal}kcal P${r.prot_g} L${r.fat_g} G${r.carbs_g}` });
        }
        if (garde && m) CH.forEach(c => { if (isFinite(m[c])) X.met[c].push(m[c]); });
      }
    }
    const O = { nom, n: z, variantes: {} };
    NOMS.forEach(k => { O.variantes[k] = { violations: R[k].viol, exemples: R[k].ex, distributions: {} };
      CH.forEach(c => O.variantes[k].distributions[c] = dist(R[k].met[c])); });
    return O;
  }
  const tA = Date.now(); OUT.corpusA = passe(corpusA(), 0, 'A — quadrillage adversarial'); T.corpusA_ms = Date.now() - tA;
  const tB = Date.now();
  OUT.corpusB = passe((function* () { for (let z = 0; z < 1000000; z++) yield profilB(); })(), 1000000, 'B — population plausible');
  T.corpusB_ms = Date.now() - tB;
  console.log('② CORPUS A : ' + OUT.corpusA.n.toLocaleString('fr-FR') + ' profils × ' + NOMS.length + ' variantes');
  console.log('   CORPUS B : ' + OUT.corpusB.n.toLocaleString('fr-FR') + ' profils × ' + NOMS.length + ' variantes');

  /* ───── ③ CAS OBLIGATOIRES ───── */
  OUT.cas = CAS.map(([nom, p]) => { const o = { cas: nom };
    NOMS.forEach(k => { const r = VAR[k](p), m = metriques(p, r);
      o[k] = r ? { kcal: r.kcal, P: r.prot_g, L: r.fat_g, G: r.carbs_g,
        pgkg: +m.prot_gkg.toFixed(2), pffm: +m.prot_gkg_ffm.toFixed(2), lgkg: +m.lip_gkg.toFixed(2),
        lpct: +(m.lip_pct*100).toFixed(1), ggkg: +m.gluc_gkg.toFixed(2), ferm: m.fermeture,
        sig: r.signaux || null, faisable: r.faisable !== false } : null; });
    return o; });

  /* ───── ④ CONTRE-AUDIT ADVERSARIAL DE V8 ───── */
  const ca = { continuite_poids: [], continuite_mg: [], determinisme: 0, sans_solution: [],
               oscillations: [], conflits: [] };
  const base = { gender:'H',age:35,height:178,activityLevel:1.55,workType:'bureau',level:'',
                 phase:'charge',smoker:false,othersport:'aucun',foodMode:'',manualKcal:null,
                 seancesSem:3,seriesParGroupe:9,lm:null };
  /* P05 — continuité : +1 kg ne doit pas faire sauter la prescription */
  for (let bw = 45; bw <= 150; bw++) for (const goal of ['perte','recomp','muscle','equilibre','force']) {
    const a = M8.mV8(Object.assign({}, base, { bw, goal }));
    const c = M8.mV8(Object.assign({}, base, { bw: bw + 1, goal }));
    if (!a || !c) continue;
    const d = Math.abs(c.kcal - a.kcal);
    if (d > 120) ca.continuite_poids.push({ bw, goal, saut_kcal: d, a: a.kcal, b: c.kcal });
  }
  /* P06 — continuité : +1 % de masse grasse */
  for (let bfp = 5; bfp <= 50; bfp++) for (const goal of ['perte','recomp']) {
    const mk = x => Object.assign({}, base, { bw: 90, goal, lm: Math.round(90*(1-x/100)*10)/10 });
    const a = M8.mV8(mk(bfp)), c = M8.mV8(mk(bfp + 1));
    if (!a || !c) continue;
    const d = Math.abs(c.kcal - a.kcal), dp = Math.abs(c.prot_g - a.prot_g);
    if (d > 120 || dp > 25) ca.continuite_mg.push({ bf: bfp, goal, saut_kcal: d, saut_prot: dp });
  }
  /* P04/P18 — déterminisme : 5 appels identiques */
  for (const [, p] of CAS) { const s = new Set();
    for (let k = 0; k < 5; k++) s.add(JSON.stringify(M8.mV8(p)));
    if (s.size !== 1) ca.determinisme++; }
  /* profils SANS SOLUTION : minimums de sécurité > cible */
  let z2 = 0;
  for (const p of corpusA()) { if (z2++ % 37) continue;
    const r = M8.mV8(p); if (r && r.faisable === false && ca.sans_solution.length < 12)
      ca.sans_solution.push({ p: `${p.gender} ${p.age}a ${p.height}cm ${p.bw}kg ${p.goal}`,
        kcal_vise: r.kcal_vise, kcal_reel: r.kcal, P: r.prot_g, L: r.fat_g }); }
  /* CONFLIT documenté : la vitesse Garthe contre le plafond Murphy & Koehler */
  for (const bw of [50, 60, 70, 85, 100, 120, 150]) {
    const p = Object.assign({}, base, { bw, goal: 'perte' });
    const r = M8.mV8(p), tdee = M8.mTDEE(p);
    const { bf } = M8.ffmDe(p);
    const vitVoulue = M8.vitesseCible(p, bf);
    const kcalVoulu = vitVoulue / 100 * bw * M8.CONST.KCAL_PAR_KG / 7;
    ca.conflits.push({ bw, vitesse_voulue_pct_sem: vitVoulue,
      deficit_demande: Math.round(kcalVoulu), deficit_applique: r.kcal - tdee,
      plafonne: r.borne === 'deficit_plafonne',
      vitesse_obtenue_pct_sem: +((r.kcal - tdee) * 7 / M8.CONST.KCAL_PAR_KG / bw * 100).toFixed(2) });
  }
  OUT.contre_audit = ca;
  T.total_ms = Date.now() - t0; OUT.temps_ms = T;
  fs.writeFileSync('/tmp/banc_v8.json', JSON.stringify(OUT, null, 1));

  /* ───── SORTIE ───── */
  const L = console.log;
  for (const C of [OUT.corpusA, OUT.corpusB]) {
    L('\n=== CORPUS ' + C.nom + ' (' + C.n.toLocaleString('fr-FR') + ' profils, taux pour 100 000) ===');
    const cles = new Set(); NOMS.forEach(k => Object.keys(C.variantes[k].violations).forEach(v => cles.add(v)));
    L('PROPRIÉTÉ'.padEnd(42) + NOMS.map(x => x.padStart(8)).join(''));
    [...cles].sort().forEach(v => L(v.padEnd(42) +
      NOMS.map(k => String(Math.round((C.variantes[k].violations[v] || 0) / C.n * 1e5)).padStart(8)).join('')));
    L('\nmédiane / p99 :');
    ['gluc_gkg','gluc_abs','prot_gkg','prot_gkg_ffm','lip_gkg','lip_pct','kcal_kg','vitesse_pct_sem','ea'].forEach(c =>
      L('  ' + c.padEnd(18) + NOMS.map(k => { const d = C.variantes[k].distributions[c];
        return (k + ':' + (d ? d.med + '/' + d.p99 : '—')).padEnd(22); }).join('')));
  }
  L('\n=== CAS OBLIGATOIRES : V0 -> V8 ===');
  OUT.cas.forEach(c => { const a = c.V0, v = c.V8;
    L('  ' + c.cas.padEnd(48) + ' V0 ' + String(a.kcal).padStart(5) + ' P' + String(a.P).padStart(3) +
      ' L' + String(a.L).padStart(3) + ' G' + String(a.G).padStart(3) + ' (ferm ' + a.ferm + ')' +
      '  ->  V8 ' + String(v.kcal).padStart(5) + ' P' + String(v.P).padStart(3) +
      ' L' + String(v.L).padStart(3) + ' G' + String(v.G).padStart(3) + ' (ferm ' + v.ferm + ')' +
      (v.sig && v.sig.length ? ' [' + v.sig.join(',') + ']' : '') + (v.faisable ? '' : ' INFAISABLE')); });
  L('\n=== CONTRE-AUDIT V8 ===');
  L('  continuité +1 kg  : ' + ca.continuite_poids.length + ' saut(s) > 120 kcal');
  ca.continuite_poids.slice(0, 5).forEach(x => L('     ' + JSON.stringify(x)));
  L('  continuité +1 %MG : ' + ca.continuite_mg.length + ' saut(s)');
  ca.continuite_mg.slice(0, 5).forEach(x => L('     ' + JSON.stringify(x)));
  L('  déterminisme      : ' + ca.determinisme + ' cas non déterministe(s)');
  L('  profils SANS SOLUTION : ' + ca.sans_solution.length + ' (échantillon 1/37 du corpus A)');
  ca.sans_solution.slice(0, 4).forEach(x => L('     ' + JSON.stringify(x)));
  L('  CONFLIT Garthe (vitesse) vs Murphy & Koehler (plafond 500 kcal) :');
  ca.conflits.forEach(x => L('     ' + String(x.bw).padStart(4) + ' kg : veut ' +
    String(x.vitesse_voulue_pct_sem).padStart(5) + ' %/sem (' + String(x.deficit_demande).padStart(5) +
    ' kcal) -> appliqué ' + String(x.deficit_applique).padStart(5) + ' kcal = ' +
    String(x.vitesse_obtenue_pct_sem).padStart(5) + ' %/sem' + (x.plafonne ? '  ⛔ PLAFONNÉ' : '')));
  L('\ntemps : ' + JSON.stringify(T));
  L('→ /tmp/banc_v8.json');
})();
