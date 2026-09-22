#!/usr/bin/env node
/* 🔬 PHASE 3 — CORPUS MASSIF DE SIMULATION DU MOTEUR NUTRITIONNEL.
   ⛔ LECTURE SEULE : aucun fichier servi n'est modifié. On POSE des profils dans `S` et on lit
      `bmrDetail()`, `calcTDEE()`, `autoKcal()`, `calcMacros()` — le chemin de production entier.
   ⭐ L'analyse se fait DANS le navigateur : sortir 180 000 lignes brutes serait ingérable, et
      ce qui décide n'est pas la liste, ce sont les EXTRÊMES et les violations de propriétés. */
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
    const SEXE = ['H', 'F'];
    const AGE = [18, 25, 35, 45, 55, 65, 75];
    const TAILLE = [150, 160, 170, 180, 190, 200];
    const POIDS = [45, 55, 65, 75, 85, 95, 110, 130, 150];
    const ACT = [1.375, 1.55, 1.725, 1.9];
    const WORK = ['bureau', 'debout', 'actif', 'physique'];
    const GOAL = ['muscle', 'perte', 'recomp', 'force', 'equilibre', 'endurance'];
    const PHASE = ['charge', 'decharge'];

    /* ⛔ LES SÉANCES SONT POSÉES UNE FOIS : `cycleGlucides` relit l'historique à chaque appel,
       et le régénérer 180 000 fois coûterait plus cher que tout le reste du corpus. */
    const j = n => { const d = new Date(Date.now() - n * 864e5);
      return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
    const mkSess = (parSem) => { const s = [];
      for (let k = 0; k < 4; k++) for (let i = 0; i < parSem; i++)
        s.push({ date: j(k * 7 + i), exs: [{ name: 'Développé couché',
          sets: [{ kg: 80, reps: 8, done: true }] }], vol: 5000 });
      return s; };
    const SESS = { 0: [], 2: mkSess(2), 4: mkSess(4), 6: mkSess(6) };

    const stat = {};      // par objectif : min/max/somme/n sur chaque grandeur
    const viol = {};      // violations de propriétés → au plus 8 exemples chacune
    const extremes = {};  // top des valeurs les plus hautes / basses
    const push = (k, o) => { (viol[k] = viol[k] || { n: 0, ex: [] }).n++;
      if (viol[k].ex.length < 8) viol[k].ex.push(o); };
    const maj = (g, c, v) => { if (v == null || !isFinite(v)) return;
      const s = (stat[g] = stat[g] || {}); const x = (s[c] = s[c] || { min: v, max: v, som: 0, n: 0 });
      if (v < x.min) x.min = v; if (v > x.max) x.max = v; x.som += v; x.n++; };
    const top = (k, o, v, sens) => { const t = (extremes[k] = extremes[k] || []);
      t.push(Object.assign({ v: v }, o));
      t.sort((a, b) => sens > 0 ? b.v - a.v : a.v - b.v); if (t.length > 25) t.length = 25; };

    let n = 0, t0 = Date.now();
    for (const sexe of SEXE) for (const age of AGE) for (const h of TAILLE) for (const bw of POIDS) {
      // ⛔ IMC BORNÉ : un 45 kg pour 200 cm (IMC 11) n'est pas un « cas limite raisonnable »,
      //    c'est un profil qui n'existe pas. On garde 13 <= IMC <= 55.
      const imc = bw / ((h / 100) * (h / 100));
      if (imc < 13 || imc > 55) continue;
      for (const act of ACT) for (const work of WORK) for (const sem of [0, 2, 4, 6])
      for (const goal of GOAL) for (const phase of PHASE) for (const seance of [false, true]) {
        if (seance && sem === 0) continue;               // pas de séance sans historique
        S.gender = sexe; S.bw = bw; S.height = h; S.age = age;
        S.activityLevel = act; S.workType = work; S.goal = goal; S.nutritionPhase = phase;
        S.manualKcal = 0; S.foodMode = ''; S.keto = false; S.smoker = false;
        S.bodyScans = []; S.weightLog = []; S.otherSports = ''; S.stepsLog = null;
        S.sessions = SESS[sem].slice();
        if (seance) S.sessions.push({ date: j(0), exs: [{ name: 'Développé couché',
          sets: [{ kg: 80, reps: 8, done: true }] }], vol: 5000 });

        const bmr = calcBMR(), tdee = calcTDEE(), m = calcMacros(phase);
        n++;
        if (m.calories == null || m.prot_g == null) { push('macros_nulles', {sexe,age,h,bw,act,work,goal,phase,sem,seance}); continue; }
        const P = m.prot_g, G = m.carbs_g, L = m.fat_g, C = m.calories;
        const id = { sexe, age, h, bw, imc: +imc.toFixed(1), act, work, sem, seance, goal, phase,
                     bmr, tdee, kcal: C, P, G, L };
        const gP = P / bw, gG = G / bw, gL = L / bw;
        const pctP = P * 4 / C * 100, pctG = G * 4 / C * 100, pctL = L * 9 / C * 100;
        const ferm = P * 4 + G * 4 + L * 9 - C;
        maj(goal, 'kcalkg', C / bw); maj(goal, 'gP', gP); maj(goal, 'gG', gG); maj(goal, 'gL', gL);
        maj(goal, 'pctL', pctL); maj(goal, 'pctG', pctG); maj(goal, 'ecartTdee', C - tdee);
        top('glucides_gkg_haut', id, +gG.toFixed(2), 1);
        top('glucides_gkg_bas', id, +gG.toFixed(2), -1);
        top('prot_gkg_haut', id, +gP.toFixed(2), 1);
        top('lip_pct_bas', id, +pctL.toFixed(1), -1);
        top('lip_pct_haut', id, +pctL.toFixed(1), 1);
        top('kcalkg_haut', id, +(C / bw).toFixed(1), 1);
        top('kcalkg_bas', id, +(C / bw).toFixed(1), -1);
        // ── PROPRIÉTÉS ────────────────────────────────────────────────────────
        if (P < 0 || G < 0 || L < 0) push('macro_negative', id);
        if (!isFinite(P) || !isFinite(G) || !isFinite(L)) push('macro_non_finie', id);
        if (Math.abs(ferm) > 5) push('fermeture_>5kcal', Object.assign({ ferm }, id));
        if (C < (sexe === 'H' ? 1500 : 1200)) push('sous_plancher', id);
        if (gP < 0.8) push('prot_sous_0.8_gkg', Object.assign({ gP: +gP.toFixed(2) }, id));
        if (gL < 0.5) push('lip_sous_0.5_gkg', Object.assign({ gL: +gL.toFixed(2) }, id));
        if (pctL < 15) push('lip_sous_15pct', Object.assign({ pctL: +pctL.toFixed(1) }, id));
        if (pctL > 40) push('lip_sur_40pct', Object.assign({ pctL: +pctL.toFixed(1) }, id));
        if (gG > 8) push('gluc_sur_8_gkg', Object.assign({ gG: +gG.toFixed(2) }, id));
        if (gG > 12) push('gluc_sur_12_gkg', Object.assign({ gG: +gG.toFixed(2) }, id));
        if (gG < 1) push('gluc_sous_1_gkg', Object.assign({ gG: +gG.toFixed(2) }, id));
        if (G === 0) push('gluc_zero', id);
      }
    }
    const moy = {};
    Object.keys(stat).forEach(g => { moy[g] = {};
      Object.keys(stat[g]).forEach(c => { const x = stat[g][c];
        moy[g][c] = { min: +x.min.toFixed(2), max: +x.max.toFixed(2),
                      moy: +(x.som / x.n).toFixed(2), n: x.n }; }); });
    return { n, ms: Date.now() - t0, stats: moy, violations: viol, extremes: extremes };
  });
  R.erreursPage = errs;
  fs.writeFileSync('/tmp/corpus_nutri.json', JSON.stringify(R, null, 1));
  console.log('profils mesurés : ' + R.n + ' en ' + Math.round(R.ms / 1000) + ' s');
  console.log('erreurs de page : ' + errs.length);
  Object.keys(R.violations).forEach(k => console.log('  ' + k + ' : ' + R.violations[k].n));
  await cx.close(); await b.close(); srv.close();
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
