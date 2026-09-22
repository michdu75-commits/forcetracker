#!/usr/bin/env node
/* 🔬 PHASES C→H — BANC NUTRITIONNEL PAR OBJECTIF, LECTURE SEULE.
   Répond aux phases E (perte), F (prise de muscle), G (recomposition), H (force) du brief,
   et à la question factuelle : la DISCIPLINE et le NIVEAU changent-ils quelque chose ? */
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
    const j = n => { const d = new Date(Date.now() - n * 864e5);
      return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
    const poser = (p) => {
      S.gender = p.g || 'H'; S.bw = p.bw; S.height = p.h || 175; S.age = p.a || 35;
      S.activityLevel = p.act || 1.55; S.workType = p.work || 'bureau'; S.goal = p.goal;
      S.nutritionPhase = p.phase || 'charge'; S.manualKcal = 0; S.foodMode = ''; S.keto = false;
      S.smoker = false; S.sessions = p.sessions || []; S.weightLog = []; S.otherSports = '';
      S.stepsLog = null; S.discipline = p.disc || 'muscu'; S.level = p.lvl || '';
      S.bodyScans = p.lm ? [{ date: j(10), leanMass: p.lm, weight: p.bw, bodyFat: p.mg }] : [];
      const m = calcMacros(S.nutritionPhase);
      return { bmr: calcBMR(), tdee: calcTDEE(), kcal: m.calories,
               P: m.prot_g, G: m.carbs_g, L: m.fat_g };
    };
    const out = {};

    // ══ PHASE H/C — LA DISCIPLINE ET LE NIVEAU CHANGENT-ILS QUELQUE CHOSE ? ═════════════
    const DISC = ['muscu', 'bodybuilding', 'powerbuilding', 'powerlifting', 'haltero'];
    const LVL = ['debutant', 'intermediaire', 'confirme'];
    const GOAL = ['muscle', 'perte', 'recomp', 'force', 'equilibre', 'endurance'];
    const ref = {}; let nDisc = 0, ecartDisc = 0, ecartLvl = 0;
    GOAL.forEach(goal => { ref[goal] = poser({ bw: 85, goal }); });
    DISC.forEach(disc => LVL.forEach(lvl => GOAL.forEach(goal => {
      const r = poser({ bw: 85, goal, disc, lvl }); nDisc++;
      const a = ref[goal];
      if (r.kcal !== a.kcal || r.P !== a.P || r.G !== a.G || r.L !== a.L) {
        if (disc !== 'muscu') ecartDisc++; else ecartLvl++;
      }
    })));
    out.discipline = { n: nDisc, ecartDisc, ecartLvl, disciplines: DISC, niveaux: LVL };

    // ══ PHASE E — PERTE DE POIDS : déficit, vitesse, disponibilité énergétique ══════════
    out.perte = [];
    [[60, 10], [70, 15], [80, 20], [90, 25], [100, 30], [110, 35], [120, 40], [130, 45]]
      .forEach(([bw, mg]) => {
        const lm = +(bw * (1 - mg / 100)).toFixed(1);
        ['perte', 'recomp'].forEach(goal => {
          const r = poser({ bw, goal, lm, mg, act: 1.55 });
          const def = r.kcal - r.tdee;
          // ⛔ Le deficit theorique en kg/semaine : 7700 kcal ~ 1 kg de masse grasse.
          const kgSem = def * 7 / 7700;
          out.perte.push({ bw, mg, lm, goal, tdee: r.tdee, kcal: r.kcal, def,
            defPct: +(def / r.tdee * 100).toFixed(1),
            kgSem: +kgSem.toFixed(2), pctSem: +(kgSem / bw * 100).toFixed(2),
            P: r.P, G: r.G, L: r.L,
            gkgP_poids: +(r.P / bw).toFixed(2), gkgP_maigre: +(r.P / lm).toFixed(2),
            gkgG: +(r.G / bw).toFixed(2), gkgL: +(r.L / bw).toFixed(2),
            pctP: +(r.P * 4 / r.kcal * 100).toFixed(1),
            // ⛔ Disponibilite energetique = (apport - depense d exercice) / masse maigre.
            //    Seuil RED-S : < 30 kcal/kg de masse maigre. La depense d exercice est
            //    approchee par (TDEE - BMR*1.2), la part « activite » au-dela du repos.
            ea: +((r.kcal - Math.max(0, r.tdee - r.bmr * 1.2)) / lm).toFixed(1) });
        });
      });

    // ══ PHASE F — PRISE DE MUSCLE : surplus absolu et relatif ══════════════════════════
    out.muscle = [];
    [55, 65, 75, 85, 95, 110].forEach(bw => {
      [1.375, 1.55, 1.725, 1.9].forEach(act => {
        ['charge', 'decharge'].forEach(phase => {
          const r = poser({ bw, goal: 'muscle', act, phase });
          out.muscle.push({ bw, act, phase, tdee: r.tdee, kcal: r.kcal,
            sur: r.kcal - r.tdee, surPct: +((r.kcal - r.tdee) / r.tdee * 100).toFixed(1),
            kgSem: +((r.kcal - r.tdee) * 7 / 7700).toFixed(2),
            pctSem: +((r.kcal - r.tdee) * 7 / 7700 / bw * 100).toFixed(2),
            gkgG: +(r.G / bw).toFixed(2), gkgP: +(r.P / bw).toFixed(2) });
        });
      });
    });

    // ══ PHASE G — RECOMPOSITION : l unite des proteines ════════════════════════════════
    out.recomp = [];
    [[70, 10], [80, 15], [85, 20], [95, 25], [105, 30]].forEach(([bw, mg]) => {
      const lm = +(bw * (1 - mg / 100)).toFixed(1);
      const r = poser({ bw, goal: 'recomp', lm, mg });
      out.recomp.push({ bw, mg, lm, P: r.P, gkg_poids: +(r.P / bw).toFixed(2),
        gkg_maigre: +(r.P / lm).toFixed(2), pctP: +(r.P * 4 / r.kcal * 100).toFixed(1),
        dansISSN: (r.P / bw) >= 2.3 && (r.P / bw) <= 3.1,
        dansHelmsLBM: (r.P / lm) >= 2.3 && (r.P / lm) <= 3.1 });
    });

    // ══ PHASE H — FORCE : les glucides selon le volume ═════════════════════════════════
    out.force = [];
    [0, 2, 3, 4, 5, 6].forEach(sem => {
      const sess = [];
      for (let k = 0; k < 4; k++) for (let i = 0; i < sem; i++)
        sess.push({ date: j(k * 7 + i), exs: [{ name: 'Squat',
          sets: [{ kg: 140, reps: 5, done: true }] }], vol: 8000 });
      ['force', 'muscle'].forEach(goal => {
        [1.55, 1.725, 1.9].forEach(act => {
          const r = poser({ bw: 85, goal, act, sessions: sess.slice() });
          out.force.push({ sem, goal, act, kcal: r.kcal, G: r.G,
            gkgG: +(r.G / 85).toFixed(2), pctG: +(r.G * 4 / r.kcal * 100).toFixed(1) });
        });
      });
    });
    return out;
  });
  R.erreursPage = errs;
  fs.writeFileSync('/tmp/banc_objectifs.json', JSON.stringify(R, null, 1));
  console.log('erreurs de page : ' + errs.length);
  console.log('discipline/niveau : ' + R.discipline.n + ' combinaisons · écarts discipline = '
    + R.discipline.ecartDisc + ' · écarts niveau = ' + R.discipline.ecartLvl);
  await cx.close(); await b.close(); srv.close();
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
