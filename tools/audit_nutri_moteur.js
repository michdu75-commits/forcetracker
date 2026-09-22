#!/usr/bin/env node
/* 🔬 INSTRUMENT D'AUDIT DU MOTEUR NUTRITIONNEL — LECTURE SEULE, AUCUN CODE MÉTIER TOUCHÉ.
   Répond aux points 3 (Phase A) du cahier d'audit : entrées, BMR, TDEE, objectifs, macros.
   ⛔ Il MESURE dans l'app servie, il ne déduit pas : c'est la règle de la maison. */
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
  await pg.addInitScript(`try{localStorage.clear();}catch(e){}`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  const R = await pg.evaluate(() => {
    const out = { profils: [] };
    const poser = (p) => {
      S.gender = p.g; S.bw = p.bw; S.height = p.h; S.age = p.a;
      S.activityLevel = p.act; S.workType = p.work || 'bureau';
      S.goal = p.goal; S.nutritionPhase = p.phase; S.manualKcal = 0;
      S.foodMode = ''; S.keto = false; S.smoker = false;
      S.sessions = p.sessions || []; S.bodyScans = []; S.weightLog = [];
      S.otherSports = ''; S.stepsLog = null;
    };
    const mesure = (p) => {
      poser(p);
      const bd = bmrDetail(), tdee = calcTDEE(), cible = autoKcal(p.phase), m = calcMacros(p.phase);
      const kcalMacros = (m.prot_g || 0) * 4 + (m.carbs_g || 0) * 4 + (m.fat_g || 0) * 9;
      return { goal: p.goal, phase: p.phase, bmr: bd.kcal, methode: bd.methode, tdee: tdee,
               cible: m.calories, delta: (m.calories != null && tdee != null) ? m.calories - tdee : null,
               prot: m.prot_g, carbs: m.carbs_g, fat: m.fat_g,
               gkgP: m.prot_g ? +(m.prot_g / p.bw).toFixed(2) : null,
               gkgG: m.carbs_g ? +(m.carbs_g / p.bw).toFixed(2) : null,
               gkgL: m.fat_g ? +(m.fat_g / p.bw).toFixed(2) : null,
               kcalMacros: kcalMacros, ecart: m.calories != null ? kcalMacros - m.calories : null,
               cycle: m.cycle || null };
    };
    // ⭐ LE PROFIL DU CAHIER D'AUDIT : homme ~86 kg, TDEE eleve, phase CHARGE.
    const base = { g: 'H', bw: 85.8, h: 179, a: 41, act: 1.725, work: 'physique' };
    ['force', 'recomp', 'muscle', 'equilibre', 'perte', 'endurance'].forEach(goal => {
      out.profils.push(mesure(Object.assign({}, base, { goal: goal, phase: 'charge' })));
    });
    out.decharge = ['force', 'recomp', 'muscle', 'equilibre'].map(goal =>
      mesure(Object.assign({}, base, { goal: goal, phase: 'decharge' })));
    // ⛔ La table brute, lue a la source : c est elle qui decide des ecarts.
    /* ⭐ LE MEME PROFIL, MAIS UN JOUR DE SEANCE : c est le cycle glucides qui explique l ecart
       entre ma mesure et les captures du cahier (lipides plus bas, glucides plus hauts). */
    const j = n => { const d = new Date(Date.now() - n * 864e5);
      return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
    const sess = [];
    for (let k = 0; k < 4; k++) [0, 2, 4].forEach(o => sess.push({ date: j(k * 7 + o),
      exs: [{ name: 'Développé couché', sets: [{ kg: 80, reps: 8, done: true }] }], vol: 5000 }));
    sess.push({ date: j(0), exs: [{ name: 'Développé couché', sets: [{ kg: 80, reps: 8, done: true }] }], vol: 5000 });
    out.jourSeance = ['force', 'recomp', 'muscle', 'equilibre'].map(goal =>
      mesure(Object.assign({}, base, { goal: goal, phase: 'charge', sessions: sess })));
    out.tableDeltas = (typeof _GOAL_DELTA_KCAL !== 'undefined') ? _GOAL_DELTA_KCAL : null;
    out.plancher = (typeof PLANCHER_KCAL !== 'undefined') ? PLANCHER_KCAL : null;
    out.workExtra = { bureau: 0, debout: 200, actif: 325, physique: 450 };
    return out;
  });
  console.log(JSON.stringify(R, null, 1));
  await cx.close(); await b.close(); srv.close();
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
