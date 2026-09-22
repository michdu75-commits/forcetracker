#!/usr/bin/env node
/* 🔬 PHASE 5 — SIMULATION DE VARIANTES DE CONCEPTION, SANS TOUCHER AU MOTEUR SERVI.
   ⛔ LECTURE SEULE sur `state.js` : les CALORIES viennent de `autoKcal()` (le moteur réel,
      inchangé) ; seule la RÉPARTITION est rejouée à côté, en variantes comparables.
   ⚠️ Oui, cela DUPLIQUE `macrosForKcal` — volontairement et de façon bornée : c'est un banc de
      conception, pas du code servi. Le témoin V0 existe pour ça : il compare la variante
      « actuelle » du banc au vrai `calcMacros()` et doit tomber à l'identique, sinon le banc
      mesure autre chose que la production. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
           '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2',
           '.webp':'image/webp','.ico':'image/x-icon','.wasm':'application/wasm'};
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'});
  fs.createReadStream(f).pipe(r);
});
(async () => {
  await new Promise(r => srv.listen(0, r));
  const PORT = srv.address().port;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                  timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`try{localStorage.clear();}catch(e){}`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  const R = await pg.evaluate(() => {
    const PROT = { muscle: 2.2, perte: 2.5, recomp: 2.6, force: 2.0, equilibre: 2.0, endurance: 1.7 };
    const FAT = { muscle: 0.9, perte: 0.8, recomp: 0.85, force: 1.0, equilibre: 0.85, endurance: 0.75 };
    /* ⛔ LE SEUL NOMBRE NEUF DE CE BANC, ET IL A UNE SOURCE : le poids de reference est plafonne
       au poids correspondant a un IMC de 30 — « at least 1.2 g/kg body weight per day with a
       maximum weight of BMI 30 » (litterature clinique de l obesite). Ce n est pas un plafond
       choisi parce qu il paraissait raisonnable. */
    const IMC_PLAFOND = 30;
    /* ⛔ ET LA BORNE DE PLAUSIBILITE DES GLUCIDES VIENT DE Slater & Phillips 2011 (sports de
       force) : 4-7 g/kg. On n invente pas 7, on le cite. */
    const GLU_MAX_FORCE = 7;

    const poidsRef = (bw, h, lm, mode) => {
      const plafond = IMC_PLAFOND * (h / 100) * (h / 100);
      if (mode === 'V0') return bw;
      if (mode === 'V1') return Math.min(bw, plafond);
      // V2/V3 : la masse maigre si elle est connue et fraiche, sinon le poids plafonne
      if (lm) return lm / 0.85;      // LBM -> poids « de reference » a ~15 % de gras
      return Math.min(bw, plafond);
    };
    const repartir = (kcal, bw, h, lm, goal, mode) => {
      /* ⭐⭐ V4/V5 — CORRECTION NEE DU CONTRE-AUDIT : V1 et V2 appliquaient le poids reduit aux
         DEUX macros, et creaient un defaut que V0 n avait PAS (lipides sous 0,5 g/kg : 0 -> 1920).
         Or la justification (le tissu adipeux ne consomme pas de proteines) vaut pour les
         PROTEINES ; les lipides ont un role hormonal et leur plancher s exprime en poids REEL. */
      const refP = poidsRef(bw, h, lm, mode);
      const ref = (mode === 'V4' || mode === 'V5') ? bw : refP;
      const P = Math.round(refP * PROT[goal]);
      let L = Math.round(ref * FAT[goal]);
      if (mode === 'V4' || mode === 'V5') {
        // plancher double : jamais sous 0,5 g/kg de poids REEL, jamais sous 15 % des calories
        L = Math.max(L, Math.round(bw * 0.5), Math.round(kcal * 0.15 / 9));
      }
      let G = Math.max(0, Math.round((kcal - P * 4 - L * 9) / 4));
      let signal = null;
      if (mode === 'V5') {
        /* ⛔ ON NE FABRIQUE PAS UN NOMBRE EXTREME : si les glucides depassent la plage de
           reference des sports de force, on verse aux lipides SANS depasser 35 % des calories ;
           si ca ne suffit pas, on SIGNALE l incoherence au lieu de la maquiller (cahier §6). */
        const gG0 = G / bw;
        if (gG0 > GLU_MAX_FORCE && goal !== 'endurance') {
          const Gmax = Math.round(GLU_MAX_FORCE * bw);
          const Lmax = Math.round(kcal * 0.35 / 9);
          const libre = (G - Gmax) * 4;
          const place = Math.min(Math.round(libre / 9), Math.max(0, Lmax - L));
          L = L + place; G = Math.round((kcal - P * 4 - L * 9) / 4);
          signal = (G / bw > GLU_MAX_FORCE)
            ? 'incoherence : impossible de rester dans les plages a ' + kcal + ' kcal'
            : 'glucides ramenes a la plage des sports de force, surplus verse aux lipides';
        }
      }
      if (mode === 'V3') {
        // ⭐ La plausibilite se VERIFIE, et si elle mord on dit OU vont les calories.
        const gG = G / bw;
        if (gG > GLU_MAX_FORCE && goal !== 'endurance') {
          const Gmax = Math.round(GLU_MAX_FORCE * bw);
          const libre = (G - Gmax) * 4;
          G = Gmax;
          L = L + Math.round(libre / 9);            // les calories vont aux LIPIDES, pas nulle part
          signal = 'glucides bornes a ' + GLU_MAX_FORCE + ' g/kg, surplus verse aux lipides';
        }
        if (G === 0 && kcal - P * 4 - L * 9 < 0) signal = 'impossible de fermer dans les plages';
      }
      return { P: P, G: G, L: L, signal: signal, ref: +ref.toFixed(1) };
    };

    const SEXE = ['H', 'F'], AGE = [18, 35, 55, 75], TAILLE = [150, 165, 180, 195];
    const POIDS = [45, 60, 75, 90, 110, 130, 150];
    const MG = [null, 10, 20, 30, 40];
    const ACT = [1.375, 1.55, 1.725, 1.9], WORK = ['bureau', 'actif', 'physique'];
    const GOAL = ['muscle', 'perte', 'recomp', 'force', 'equilibre', 'endurance'];
    const MODES = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5'];
    const j = n => { const d = new Date(Date.now() - n * 864e5);
      return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };

    const res = {}; MODES.forEach(m => res[m] = { n: 0, v: {}, pire: {} });
    const compte = (m, k, o) => { const r = res[m].v; r[k] = (r[k] || 0) + 1;
      if (!res[m].pire[k]) res[m].pire[k] = o; };
    let ecartV0 = 0, nV0 = 0;

    for (const sexe of SEXE) for (const age of AGE) for (const h of TAILLE) for (const bw of POIDS) {
      const imc = bw / ((h / 100) * (h / 100));
      if (imc < 13 || imc > 55) continue;
      for (const mg of MG) for (const act of ACT) for (const work of WORK) for (const goal of GOAL) {
        S.gender = sexe; S.bw = bw; S.height = h; S.age = age; S.activityLevel = act;
        S.workType = work; S.goal = goal; S.nutritionPhase = 'charge'; S.manualKcal = 0;
        S.foodMode = ''; S.keto = false; S.smoker = false; S.sessions = []; S.weightLog = [];
        S.otherSports = ''; S.stepsLog = null;
        const lm = mg == null ? null : +(bw * (1 - mg / 100)).toFixed(1);
        S.bodyScans = lm ? [{ date: j(10), leanMass: lm, weight: bw, bodyFat: mg }] : [];
        const kcal = autoKcal('charge');
        if (kcal == null) continue;
        const vrai = calcMacros('charge');
        for (const mode of MODES) {
          const r = repartir(kcal, bw, h, lm, goal, mode);
          res[mode].n++;
          const id = { sexe, age, h, bw, imc: +imc.toFixed(1), mg, act, work, goal,
                       kcal, P: r.P, G: r.G, L: r.L, ref: r.ref, signal: r.signal };
          if (mode === 'V0') { nV0++; if (r.P !== vrai.prot_g || r.L !== vrai.fat_g) ecartV0++; }
          const gP = r.P / bw, gG = r.G / bw, gL = r.L / bw;
          const pctP = r.P * 4 / kcal * 100, pctL = r.L * 9 / kcal * 100;
          if (r.G === 0) compte(mode, 'gluc_zero', id);
          if (gG > 8) compte(mode, 'gluc_sur_8_gkg', id);
          if (gG > 7 && goal !== 'endurance') compte(mode, 'gluc_sur_7_gkg_force', id);
          if (pctP > 40) compte(mode, 'prot_sur_40pct_cal', id);
          if (r.P / (lm || bw * 0.8) > 3.1) compte(mode, 'prot_sur_3.1_gkg_maigre', id);
          if (pctL < 15) compte(mode, 'lip_sous_15pct', id);
          if (gL < 0.5) compte(mode, 'lip_sous_0.5_gkg', id);
          if (pctL > 40) compte(mode, 'lip_sur_40pct', id);
          if (Math.abs(r.P * 4 + r.G * 4 + r.L * 9 - kcal) > 12) compte(mode, 'fermeture_>12kcal', id);
          if (r.signal) compte(mode, 'signal_emis', id);
        }
      }
    }
    return { res, ecartV0, nV0 };
  });
  R.erreursPage = errs;
  fs.writeFileSync('/tmp/simul_nutri_v2.json', JSON.stringify(R, null, 1));
  console.log('témoin V0 (le banc doit égaler la production) : ' + R.ecartV0 + ' écart(s) sur ' + R.nV0);
  console.log('erreurs de page : ' + R.erreursPage.length);
  const cles = new Set(); Object.values(R.res).forEach(m => Object.keys(m.v).forEach(k => cles.add(k)));
  const lg = 26;
  const MM = ['V0','V1','V2','V3','V4','V5'];
  const TT = ['V0 actuel','V1 IMC30','V2 maigre','V3 borne','V4 P seule','V5 V4+borne'];
  console.log('\n' + 'propriété violée'.padEnd(lg) + TT.map(x=>x.padStart(12)).join(''));
  [...cles].sort().forEach(k => {
    console.log(k.padEnd(lg) + MM.map(m => String(R.res[m].v[k] || 0).padStart(12)).join(''));
  });
  console.log('\nprofils par variante : ' + R.res.V0.n);
  await cx.close(); await b.close(); srv.close();
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
