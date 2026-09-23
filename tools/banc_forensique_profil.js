#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════════════
   BANC FORENSIQUE DU PROFIL — audit du 23/09/2026, LECTURE SEULE
   ══════════════════════════════════════════════════════════════════════════════════════
   ⛔⛔ CE BANC NE MODIFIE RIEN. Il sert l'application telle quelle, la conduit dans un vrai
   navigateur, et MESURE. Aucun fichier servi n'est touché.

   ⛔⛔ LES DEUX PROFILS EMPLOYES SONT SYNTHETIQUES, ET LE BANC LE DIT LUI-MEME (§34 du
   cahier de Michel). Ils portent un champ `__SYNTHETIQUE__` et une `__RAISON__` : aucun
   outil, aucun rapport ne doit pouvoir ecrire « Michel a 48 ans » parce que SYNTH_A existe.
   SYNTH_A reprend les valeurs que Michel DECLARE (48 / 180 / 3-4) : c'est une [B], pas une
   mesure de son etat interne — le banc ne peut pas lire son telephone.
   SYNTH_B reprend les valeurs du profil RECONSTRUIT le 22/09 (41 / 179 / 5-6) : c'est une
   [C]. Les deux existent pour prouver que le systeme sait dire « donnee synthetique ».

   Sortie : JSON sur stdout apres la ligne ===JSON===.
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const M = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.woff2':'font/woff2',
  '.webp':'image/webp', '.ico':'image/x-icon', '.wasm':'application/wasm' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, { 'Content-Type': M[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});

const SYNTH_A = { __SYNTHETIQUE__: true, __NOM__: 'SYNTH-A',
  __RAISON__: 'valeurs DECLAREES par Michel le 22/09 [B] - jamais lues dans son etat interne',
  age: 48, height: 180, bw: 85.9, gender: 'H', activityLevel: 1.55, workType: 'physique', smoker: false };
const SYNTH_B = { __SYNTHETIQUE__: true, __NOM__: 'SYNTH-B',
  __RAISON__: 'profil RECONSTRUIT le 22/09 pour reproduire une sortie [C] - jamais observe',
  age: 41, height: 179, bw: 85.8, gender: 'H', activityLevel: 1.725, workType: 'physique', smoker: false };

const OUT = { meta: { date: '2026-09-23', lecture_seule: true,
  profils: { SYNTH_A, SYNTH_B } }, sections: {} };
const GEL = '2026-09-20T10:00:00';

async function page(b, decor) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
    timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{const F=new Date(${JSON.stringify(GEL)});const V=Date;
    window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}
      static now(){return F.getTime();}};})();`);
  await pg.addInitScript(`(()=>{try{
    if(localStorage.getItem('__banc__')==='1')return;
    localStorage.clear();localStorage.setItem('__banc__','1');
    ${decor || ''}
  }catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);
  pg.__errs = errs; pg.__cx = cx;
  return pg;
}

const LIRE = `(() => {
  const n = v => (v===null||v===undefined||(typeof v==='number'&&!isFinite(v))) ? null : v;
  let bmr=null, tdee=null, cible=null, macros=null, manquants=null, bmrMeth=null;
  try { const d = bmrDetail(); bmr = n(d.kcal); bmrMeth = d.methode; } catch(e) { bmr='ERR:'+e.message; }
  try { tdee = n(calcTDEE()); } catch(e) { tdee='ERR:'+e.message; }
  try { cible = n(autoKcal(S.nutritionPhase)); } catch(e) { cible='ERR:'+e.message; }
  try { const m = calcMacros(S.nutritionPhase); macros = m?{kcal:n(m.calories),p:n(m.prot_g),g:n(m.carbs_g),l:n(m.fat_g)}:null; } catch(e) { macros='ERR:'+e.message; }
  try { manquants = profilCaloriqueManquants(); } catch(e) { manquants='ERR:'+e.message; }
  let seance=null;
  try {
    const s = { exs:[{ name:'Squat à la Barre', sets:[
      {kg:100,reps:5,done:true},{kg:100,reps:5,done:true},{kg:100,reps:5,done:true}] }] };
    const r = calcSessionCalories(s); seance = { total:n(r.total), dureeMin:n(r.dureeMin) };
  } catch(e) { seance='ERR:'+e.message; }
  let workExtra=null, sportExtra=null, pasExtra=null;
  try { workExtra = calcWorkExtra(); } catch(e) { workExtra='ERR'; }
  try { sportExtra = calcSportExtra(); } catch(e) { sportExtra='ERR'; }
  try { pasExtra = calcPasExtra(); } catch(e) { pasExtra='ERR'; }
  return {
    S: { age:n(S.age), height:n(S.height), bw:n(S.bw), gender:n(S.gender),
         activityLevel:n(S.activityLevel), workType:n(S.workType), smoker:n(S.smoker),
         goal:n(S.goal), phase:n(S.nutritionPhase), level:n(S.level) },
    LS: { age:localStorage.getItem('ft4_age'), ht:localStorage.getItem('ft4_ht'),
          bw:localStorage.getItem('ft4_bw'), gender:localStorage.getItem('ft4_gender'),
          act:localStorage.getItem('ft4_act'), work:localStorage.getItem('ft4_work'),
          smoker:localStorage.getItem('ft4_smoker') },
    UI: { age:(document.getElementById('age-inp')||{}).value,
          ht:(document.getElementById('ht-inp')||{}).value,
          bw:(document.getElementById('bw-inp')||{}).value,
          act:(document.getElementById('act-sel')||{}).value },
    moteurs: { bmr, bmrMeth, tdee, cible, macros, manquants, seance,
               workExtra, sportExtra, pasExtra }
  };
})()`;

let PORT = 0;

(async () => {
  await new Promise(r => srv.listen(0, r));
  PORT = srv.address().port;
  const b = await chromium.launch({ executablePath: CHROME });

  // ═══ F3. PROFIL TOTALEMENT VIDE — que rendent les moteurs ? (§8, §30) ═══════════════
  {
    const pg = await page(b, '');
    OUT.sections.F3_profil_vide = await pg.evaluate(LIRE);
    OUT.sections.F3_profil_vide.__erreurs_page = pg.__errs.slice(0, 5);
    await pg.__cx.close();
  }

  // ═══ F1. CHAINE UI -> PERSISTANCE -> RELOAD -> RUNTIME -> MOTEUR (§5) ═══════════════
  //    On conduit la VRAIE interface : on remplit les champs et on clique Enregistrer.
  {
    const pg = await page(b, `localStorage.setItem('ft4_gender','H');`);
    const etapes = {};
    etapes['0_avant'] = await pg.evaluate(LIRE);
    await pg.evaluate(async () => {
      const pause = ms => new Promise(r => setTimeout(r, ms));
      goScreen('setup', document.querySelector('[onclick*="setup"]')); await pause(500);
      document.getElementById('age-inp').value = '48';
      document.getElementById('ht-inp').value = '180';
      document.getElementById('bw-inp').value = '85,9';      // virgule FR, expres
      document.getElementById('act-sel').value = '1.55';
      setWorkType('physique');
      saveProfile(); await pause(600);
    });
    etapes['1_apres_saveProfile'] = await pg.evaluate(LIRE);
    await pg.reload({ waitUntil: 'load' }); await pg.waitForTimeout(2200);
    etapes['2_apres_reload'] = await pg.evaluate(LIRE);
    await pg.evaluate(async () => {
      const pause = ms => new Promise(r => setTimeout(r, ms));
      goScreen('nutrition', document.querySelector('[onclick*="nutrition"]')); await pause(500);
      goScreen('home', document.querySelector('[onclick*="home"]')); await pause(400);
      goScreen('setup', document.querySelector('[onclick*="setup"]')); await pause(500);
    });
    etapes['3_apres_navigation'] = await pg.evaluate(LIRE);
    // champ VIDE puis Enregistrer : la valeur est-elle effacee ou conservee ?
    await pg.evaluate(async () => {
      const pause = ms => new Promise(r => setTimeout(r, ms));
      document.getElementById('age-inp').value = '';
      saveProfile(); await pause(500);
    });
    etapes['4_age_vide_puis_save'] = await pg.evaluate(LIRE);
    // valeur hors bornes
    await pg.evaluate(async () => {
      const pause = ms => new Promise(r => setTimeout(r, ms));
      document.getElementById('age-inp').value = '120';
      saveProfile(); await pause(500);
    });
    etapes['5_age_120_hors_bornes'] = await pg.evaluate(LIRE);
    OUT.sections.F1_chaine_ui = etapes;
    OUT.sections.F1_chaine_ui.__erreurs_page = pg.__errs.slice(0, 5);
    await pg.__cx.close();
  }

  // ═══ F4. UNE VARIABLE A LA FOIS (§26) ══════════════════════════════════════════════
  {
    const pg = await page(b, '');
    const res = await pg.evaluate(async (P) => {
      const pause = ms => new Promise(r => setTimeout(r, ms));
      const n = v => (v===null||v===undefined||(typeof v==='number'&&!isFinite(v))) ? null : v;
      const poser = p => { Object.keys(p).forEach(k => { if (!k.startsWith('__')) S[k] = p[k]; }); };
      const sortie = () => {
        const o = {};
        try { o.bmr = n(bmrDetail().kcal); } catch(e) { o.bmr = null; }
        try { o.tdee = n(calcTDEE()); } catch(e) { o.tdee = null; }
        try { o.cible = n(autoKcal(S.nutritionPhase)); } catch(e) { o.cible = null; }
        try { const m = calcMacros(S.nutritionPhase); o.p=n(m.prot_g); o.g=n(m.carbs_g); o.l=n(m.fat_g); } catch(e) {}
        try { const s={exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:5,done:true},{kg:100,reps:5,done:true},{kg:100,reps:5,done:true}]}]};
              o.seanceKcal = n(calcSessionCalories(s).total); } catch(e) { o.seanceKcal = null; }
        try { o.workExtra = calcWorkExtra(); } catch(e) {}
        try { o.sportExtra = calcSportExtra(); } catch(e) {}
        return o;
      };
      const base = Object.assign({}, P.A, { goal:'recomp', nutritionPhase:'charge' });
      poser(base); await pause(60);
      const ref = sortie();
      const VARIATIONS = [
        ['age', 48, 41], ['height', 180, 179], ['bw', 85.9, 85.8],
        ['activityLevel', 1.55, 1.725], ['workType', 'physique', 'bureau'],
        ['gender', 'H', 'F'], ['smoker', false, true],
        ['goal', 'recomp', 'muscle'], ['nutritionPhase', 'charge', 'decharge'],
        ['level', '', 'avance']
      ];
      const out = { reference: { profil: 'SYNTH-A (synthetique)', valeurs: base, sortie: ref }, variations: [] };
      for (const [champ, avant, apres] of VARIATIONS) {
        poser(base); S[champ] = apres; await pause(40);
        const s = sortie();
        const diff = {};
        Object.keys(ref).forEach(k => { if (JSON.stringify(ref[k]) !== JSON.stringify(s[k])) diff[k] = [ref[k], s[k]]; });
        out.variations.push({ champ, de: avant, vers: apres, sortie: s, change: diff,
                              nb_sorties_changees: Object.keys(diff).length });
      }
      poser(base);
      return out;
    }, { A: SYNTH_A });
    OUT.sections.F4_une_variable = res;
    await pg.__cx.close();
  }

  // ═══ F5. FREQUENCE : buckets et sequences (§15) ═════════════════════════════════════
  {
    const pg = await page(b, '');
    OUT.sections.F5_frequence = await pg.evaluate(async (P) => {
      const pause = ms => new Promise(r => setTimeout(r, ms));
      Object.keys(P.A).forEach(k => { if (!k.startsWith('__')) S[k] = P.A[k]; });
      const jours = n => { const d = new Date(Date.now() - n*864e5);
        return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
      const poserSemaines = cnts => {          // cnts[0] = 7 derniers jours
        const ss = [];
        cnts.forEach((c, w) => { for (let i = 0; i < c; i++) ss.push({ date: jours(w*7 + 1 + (i % 6)), exs: [], vol: 0 }); });
        S.sessions = ss;
      };
      const essai = (cnts, actuel) => {
        poserSemaines(cnts); S.activityLevel = actuel;
        if (S.registre) delete S.registre.ctxAct;
        let wk = null, buckets = null, ec = null;
        try { wk = _weeklyCounts(4); } catch(e) {}
        try { buckets = wk ? wk.map(c => _freqBucketOf(c)) : null; } catch(e) {}
        try { ec = ecartNiveauActivite(); } catch(e) { ec = 'ERR:'+e.message; }
        return { demande: cnts, actuel, comptes: wk, buckets,
                 niveaux: buckets ? buckets.map(b => _ACT_PAR_FREQ[b]) : null,
                 carte: ec ? { suggere: ec.suggere, actuel: ec.actuel, label: ec.labelSuggere } : null };
      };
      const out = { bucket_par_compte: {}, essais_uniformes: [], essais_sequences: [] };
      for (let i = 0; i <= 8; i++) { try { out.bucket_par_compte[i] = { bucket: _freqBucketOf(i), niveau: _ACT_PAR_FREQ[_freqBucketOf(i)] }; } catch(e) {} }
      for (let c = 1; c <= 7; c++) out.essais_uniformes.push(essai([c,c,c,c], 1.725));
      const SEQ = [[3,4,3,4],[4,3,4,3],[3,3,4,4],[4,4,3,3],[5,5,3,3],[2,3,4,5],[5,3,5,3],[4,4,4,4],[3,3,3,3]];
      for (const s of SEQ) { out.essais_sequences.push(essai(s, 1.725)); }
      out.deja_au_bon_niveau = essai([3,4,3,4], 1.55);
      out.a_tres_actif = essai([3,3,3,3], 1.9);
      // que se passe-t-il quand on ACCEPTE ? on regarde s'il existe un chemin d'ecriture
      out.accepte_ecrit = { existe_appliquer: typeof window.appliquerNiveauActivite,
        freq_quiz_avant: (S.coachQuiz && S.coachQuiz.answers) ? S.coachQuiz.answers.freq : null };
      return out;
    }, { A: SYNTH_A });
    await pg.__cx.close();
  }

  // ═══ F6. CALORIES DE SEANCE : quels champs de profil interviennent ? (§10, §33) ═════
  {
    const pg = await page(b, '');
    OUT.sections.F6_calories_seance = await pg.evaluate(async (P) => {
      Object.keys(P.A).forEach(k => { if (!k.startsWith('__')) S[k] = P.A[k]; });
      const seance = { exs: [{ name: 'Squat à la Barre', sets: [
        {kg:100,reps:5,done:true},{kg:100,reps:5,done:true},{kg:100,reps:5,done:true},
        {kg:100,reps:5,done:true}] }] };
      const mesure = () => { try { const r = calcSessionCalories(seance);
        return { total: r.total, dureeMin: r.dureeMin }; } catch(e) { return 'ERR:'+e.message; } };
      const ref = mesure();
      const out = { reference: ref, sensibilite: {} };
      const essai = (champ, val) => { const g = S[champ]; S[champ] = val;
        const m = mesure(); S[champ] = g;
        out.sensibilite[champ + ' = ' + JSON.stringify(val)] =
          { total: m.total, delta: (m && ref && typeof m.total==='number') ? +(m.total - ref.total).toFixed(1) : null }; };
      essai('age', 20); essai('age', 70); essai('age', null);
      essai('height', 150); essai('height', 200); essai('height', null);
      essai('gender', 'F');
      essai('bw', 60); essai('bw', 110);
      essai('activityLevel', 1.2); essai('activityLevel', 1.9);
      essai('workType', 'bureau'); essai('smoker', true);
      essai('level', 'debutant'); essai('goal', 'perte');
      // LE CAS CRITIQUE : poids absent
      const g = S.bw; S.bw = null; const sansPoids = mesure(); S.bw = g;
      out.poids_absent = { total: sansPoids.total, reference: ref.total,
        __note: 'si un nombre sort alors que le poids est absent, un defaut silencieux est applique' };
      // ces calories entrent-elles dans le TDEE ?
      out.dans_le_tdee = { sportExtra: (()=>{try{return calcSportExtra();}catch(e){return 'ERR';}})(),
        pasExtra: (()=>{try{return calcPasExtra();}catch(e){return 'ERR';}})(),
        tdee: (()=>{try{return calcTDEE();}catch(e){return 'ERR';}})() };
      return out;
    }, { A: SYNTH_A });
    await pg.__cx.close();
  }

  // ═══ F7. DEFAUTS SILENCIEUX SUR DONNEES PHYSIOLOGIQUES (§8, §30) ═══════════════════
  {
    const pg = await page(b, '');
    OUT.sections.F7_defauts_silencieux = await pg.evaluate(async () => {
      const out = {};
      const ess = (nom, prep, lire) => { const sauve = JSON.stringify({bw:S.bw,age:S.age,height:S.height,activityLevel:S.activityLevel});
        try { prep(); out[nom] = lire(); } catch(e) { out[nom] = 'ERR:'+e.message; }
        const r = JSON.parse(sauve); S.bw=r.bw; S.age=r.age; S.height=r.height; S.activityLevel=r.activityLevel; };
      S.bw = 85.9; S.age = 48; S.height = 180; S.gender = 'H'; S.activityLevel = 1.55; S.workType = 'physique';
      const sea = { exs:[{ name:'Squat à la Barre', sets:[{kg:100,reps:5,done:true},{kg:100,reps:5,done:true}] }] };
      ess('seance_poids_present', ()=>{S.bw=85.9;}, ()=>calcSessionCalories(sea).total);
      ess('seance_poids_absent',  ()=>{S.bw=null;}, ()=>calcSessionCalories(sea).total);
      ess('seance_poids_zero',    ()=>{S.bw=0;},    ()=>calcSessionCalories(sea).total);
      ess('seance_poids_texte',   ()=>{S.bw='abc';},()=>calcSessionCalories(sea).total);
      ess('tdee_poids_absent',    ()=>{S.bw=null;}, ()=>calcTDEE());
      ess('tdee_age_absent',      ()=>{S.age=null;},()=>calcTDEE());
      ess('sportExtra_act_absent',()=>{S.activityLevel=null;}, ()=>calcSportExtra());
      ess('creatine_poids_absent',()=>{S.bw=null;}, ()=>{ const d=document.body.innerHTML; return 'voir app.js:7310'; });
      out.__note = 'un NOMBRE la ou le poids est absent = defaut silencieux sur donnee critique';
      return out;
    });
    await pg.__cx.close();
  }

  // ═══ F8. CONTROLE NEGATIF DE PROVENANCE (§34) ══════════════════════════════════════
  OUT.sections.F8_controle_negatif = {
    regle: 'aucune valeur de ce banc ne peut etre attribuee a une personne reelle',
    profils_declares: [SYNTH_A.__NOM__, SYNTH_B.__NOM__],
    marqueur: '__SYNTHETIQUE__',
    verification: (SYNTH_A.__SYNTHETIQUE__ === true && SYNTH_B.__SYNTHETIQUE__ === true
      && !!SYNTH_A.__RAISON__ && !!SYNTH_B.__RAISON__),
    __note: 'SYNTH-A porte les valeurs DECLAREES par Michel [B], SYNTH-B les valeurs '
      + 'RECONSTRUITES le 22/09 [C]. Ni l une ni l autre n est une lecture de son etat interne.'
  };

  await b.close(); srv.close();
  console.log('===JSON===');
  console.log(JSON.stringify(OUT, null, 1));
})().catch(e => { console.error('PLANTAGE : ' + (e && e.stack || e)); try{srv.close();}catch(_){} process.exit(2); });
