#!/usr/bin/env node
/* 🥊 PHASE L — CONTRE-AUDIT ADVERSARIAL. On cherche à CASSER, pas à confirmer.
   ⛔ LECTURE SEULE. Attaques : sauts de profil, discontinuités, incohérences inter-objectifs,
      comportement entraînement/repos, valeurs qui explosent. */
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
  const cx = await b.newContext({ serviceWorkers: 'block', timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`try{localStorage.clear();}catch(e){}`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2200);

  const R = await pg.evaluate(() => {
    const j = n => { const d = new Date(Date.now() - n * 864e5);
      return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
    const poser = (p) => {
      S.gender = p.g || 'H'; S.bw = p.bw; S.height = p.h || 175; S.age = p.a || 35;
      S.activityLevel = p.act || 1.55; S.workType = p.work || 'bureau'; S.goal = p.goal;
      S.nutritionPhase = p.phase || 'charge'; S.manualKcal = p.man || 0; S.foodMode = '';
      S.keto = false; S.smoker = !!p.fum; S.sessions = p.sessions || []; S.weightLog = [];
      S.otherSports = p.sport || ''; S.stepsLog = null;
      S.bodyScans = p.lm ? [{ date: j(p.jours == null ? 10 : p.jours), leanMass: p.lm,
                              weight: p.bwScan || p.bw, bodyFat: p.mg }] : [];
      const m = calcMacros(S.nutritionPhase);
      return { bmr: calcBMR(), tdee: calcTDEE(), kcal: m.calories,
               P: m.prot_g, G: m.carbs_g, L: m.fat_g, meth: bmrDetail().methode };
    };
    const A = [];
    const att = (nom, res, casse, det) => A.push({ nom, casse, det, res });

    // ══ ATTAQUE 1 — LE SAUT DE PROFIL : 1 kg de plus change-t-il brutalement la prescription ?
    let pireSaut = { d: 0 };
    for (let bw = 50; bw <= 140; bw++) {
      const a = poser({ bw, goal: 'perte' }), b2 = poser({ bw: bw + 1, goal: 'perte' });
      const d = Math.abs(b2.kcal - a.kcal);
      if (d > pireSaut.d) pireSaut = { d, bw, a: a.kcal, b: b2.kcal };
    }
    att('1 · saut de cible pour +1 kg de poids', pireSaut, pireSaut.d > 60,
        '+1 kg à ' + pireSaut.bw + ' kg → ' + pireSaut.a + ' → ' + pireSaut.b + ' kcal');

    // ══ ATTAQUE 2 — LE BILAN CORPOREL QUI EXPIRE (90 jours) ═════════════════════════════
    const f89 = poser({ bw: 90, goal: 'perte', lm: 65, mg: 28, jours: 89 });
    const f91 = poser({ bw: 90, goal: 'perte', lm: 65, mg: 28, jours: 91 });
    att('2 · le bilan corporel passe de 89 à 91 jours', { f89, f91 },
        Math.abs(f91.kcal - f89.kcal) > 60,
        f89.meth + ' ' + f89.kcal + ' kcal → ' + f91.meth + ' ' + f91.kcal + ' kcal ('
        + (f91.kcal - f89.kcal) + ')');

    // ══ ATTAQUE 3 — LE SEUIL DES 5 % D'ÉCART DE POIDS ══════════════════════════════════
    const e4 = poser({ bw: 104, bwScan: 100, goal: 'muscle', lm: 78, mg: 22 });
    const e6 = poser({ bw: 106, bwScan: 100, goal: 'muscle', lm: 78, mg: 22 });
    att('3 · l\'écart de poids passe de 4 % à 6 % depuis le bilan', { e4, e6 },
        Math.abs(e6.kcal - e4.kcal) > 60,
        e4.meth + ' ' + e4.kcal + ' → ' + e6.meth + ' ' + e6.kcal + ' kcal');

    // ══ ATTAQUE 4 — INCOHÉRENCE INTER-OBJECTIFS : perte < équilibre < muscle ? ══════════
    let inc = 0, exInc = null;
    for (const bw of [50, 70, 90, 110, 130]) for (const act of [1.375, 1.55, 1.725, 1.9]) {
      const p = poser({ bw, goal: 'perte', act }), e = poser({ bw, goal: 'equilibre', act }),
            m = poser({ bw, goal: 'muscle', act });
      if (!(p.kcal < e.kcal && e.kcal < m.kcal)) { inc++; if (!exInc) exInc = { bw, act, p: p.kcal, e: e.kcal, m: m.kcal }; }
    }
    att('4 · ordre des objectifs (perte < équilibre < muscle)', { inc, exInc }, inc > 0,
        inc + ' incohérence(s)' + (exInc ? ' · ex : ' + JSON.stringify(exInc) : ''));

    // ══ ATTAQUE 5 — CHARGE vs DÉCHARGE : la charge est-elle TOUJOURS au-dessus ? ════════
    let incPh = 0;
    for (const bw of [50, 80, 120]) for (const goal of ['muscle', 'perte', 'recomp', 'force', 'equilibre', 'endurance']) {
      const c = poser({ bw, goal, phase: 'charge' }), d2 = poser({ bw, goal, phase: 'decharge' });
      if (!(c.kcal > d2.kcal)) incPh++;
    }
    att('5 · charge toujours au-dessus de décharge', { incPh }, incPh > 0, incPh + ' inversion(s)');

    // ══ ATTAQUE 6 — LE NOMBRE DE SÉANCES CHANGE-T-IL LA CIBLE ? ════════════════════════
    const mk = n => { const s = []; for (let k = 0; k < 4; k++) for (let i = 0; i < n; i++)
      s.push({ date: j(k * 7 + i), exs: [{ name: 'Squat', sets: [{ kg: 140, reps: 5, done: true }] }], vol: 9000 }); return s; };
    const s0 = poser({ bw: 85, goal: 'muscle', sessions: [] });
    const s6 = poser({ bw: 85, goal: 'muscle', sessions: mk(6) });
    att('6 · 0 séance/sem vs 6 séances/sem', { s0: s0.kcal, s6: s6.kcal }, s0.kcal === s6.kcal,
        'cible identique : ' + s0.kcal + ' kcal dans les deux cas');

    // ══ ATTAQUE 7 — LE FUMEUR : +7 % sur le BMR, combien à l'arrivée ? ═════════════════
    const nf = poser({ bw: 85, goal: 'muscle' }), fu = poser({ bw: 85, goal: 'muscle', fum: true });
    att('7 · arrêter de fumer', { nf: nf.kcal, fu: fu.kcal }, Math.abs(fu.kcal - nf.kcal) > 150,
        nf.kcal + ' → ' + fu.kcal + ' kcal (' + (fu.kcal - nf.kcal) + ')');

    // ══ ATTAQUE 8 — LE PROFIL LE PLUS DÉFAVORABLE QU'ON PUISSE CONSTRUIRE ══════════════
    const pire = poser({ g: 'F', bw: 120, h: 148, a: 78, act: 1.375, goal: 'perte', phase: 'decharge' });
    att('8 · femme 78 ans, 148 cm, 120 kg, sédentaire, perte, décharge', pire,
        pire.G === 0 || (pire.P * 4 + pire.G * 4 + pire.L * 9) - pire.kcal > 100,
        'cible ' + pire.kcal + ' · macros = ' + (pire.P * 4 + pire.G * 4 + pire.L * 9)
        + ' kcal (P' + pire.P + ' G' + pire.G + ' L' + pire.L + ')');

    // ══ ATTAQUE 9 — LES CALORIES MANUELLES CONTOURNENT-ELLES LE PLANCHER ? ═════════════
    const man = poser({ g: 'F', bw: 55, goal: 'perte', man: 600 });
    att('9 · calories manuelles à 600 kcal', man, man.kcal === 600,
        'cible retenue = ' + man.kcal + ' kcal · P' + man.P + ' G' + man.G + ' L' + man.L);

    // ══ ATTAQUE 10 — AUTRE SPORT DÉCLARÉ : double comptage ? ═══════════════════════════
    const ss = poser({ bw: 85, goal: 'muscle', act: 1.9 });
    const as = poser({ bw: 85, goal: 'muscle', act: 1.9, sport: 'velo' });
    att('10 · autre sport déclaré à niveau « très actif »', { ss: ss.tdee, as: as.tdee },
        as.tdee > ss.tdee, 'TDEE ' + ss.tdee + ' → ' + as.tdee + ' (' + (as.tdee - ss.tdee) + ')');
    return { A, errs: 0 };
  });
  R.erreursPage = errs;
  fs.writeFileSync('/tmp/contre_audit.json', JSON.stringify(R, null, 1));
  console.log('══ CONTRE-AUDIT ADVERSARIAL — 10 attaques ══\n');
  R.A.forEach(a => console.log((a.casse ? '⛔ CASSE  ' : '✅ tient  ') + a.nom + '\n           → ' + a.det + '\n'));
  console.log('erreurs de page : ' + errs.length);
  await cx.close(); await b.close(); srv.close();
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
