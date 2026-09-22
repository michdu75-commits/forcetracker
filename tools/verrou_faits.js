#!/usr/bin/env node
/* 🔒 PHASE DE VERROUILLAGE §1 — REPRODUCTION INDÉPENDANTE DES FAITS A→D.
   ⛔ LECTURE SEULE. Aucun fichier servi modifié, aucune version posée.
   ⭐ Le brief dit : *« Ne suppose pas que le dossier précédent a raison : REPRODUIS »*. Chaque
   fait est donc remesuré ici DANS L'APP SERVIE, à partir d'un état de départ neuf, avec la
   réponse écrite à côté — y compris quand elle CONTREDIT le dossier précédent.
   ⚠️ La méthode est toujours la même : on change UNE chose, on relit la cible et les macros.
   *Un fait « la donnée n'atteint pas le moteur » se prouve par un écart de ZÉRO, pas par une
   lecture du code* — le code peut avoir un chemin qu'on n'a pas vu. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
  '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2',
  '.webp':'image/webp','.ico':'image/x-icon','.wasm':'application/wasm'};
(async () => {
  const t0 = Date.now();
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
    const f = path.join(ROOT, p);
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

  const R = await pg.evaluate(() => {
    const j = n => { const d = new Date(Date.now() - n * 864e5);
      return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
    const mkSess = (parSem) => { const s = [];
      for (let k = 0; k < 4; k++) for (let i = 0; i < parSem; i++)
        s.push({ date: j(k * 7 + i), exs: [{ name: 'Squat', sets: [{ kg: 120, reps: 5, done: true }] }], vol: 9000 });
      return s; };
    const neuf = () => {
      S.gender = 'H'; S.bw = 85; S.height = 178; S.age = 35; S.activityLevel = 1.55;
      S.workType = 'bureau'; S.goal = 'muscle'; S.smoker = false; S.nutritionPhase = 'charge';
      S.manualKcal = null; S.foodMode = ''; S.keto = false; S.sessions = []; S.weightLog = [];
      S.bodyScans = []; S.mensLog = []; S.stepsLog = []; S.coachQuiz = { answers: {} };
      S.discipline = 'muscu'; S.level = ''; S.mensCycleStart = null; S.contraception = '';
    };
    const lire = () => { const m = calcMacros(S.nutritionPhase);
      return { bmr: calcBMR(), tdee: calcTDEE(), kcal: m.calories, P: m.prot_g, L: m.fat_g, G: m.carbs_g }; };
    const eq = (a, b) => a.kcal === b.kcal && a.P === b.P && a.L === b.L && a.G === b.G;
    const out = {};

    /* ── A1. LA MASSE MAIGRE ATTEINT-ELLE LES MACROS ? ─────────────────────────────────
       Deux personnes au même poids, l'une à 12 % de gras, l'autre à 38 %. Un bilan corporel
       FRAIS existe dans les deux cas — donc le moteur a la donnée. */
    out.A1 = [];
    for (const mgPct of [12, 20, 30, 38]) {
      neuf(); const lm = Math.round(85 * (1 - mgPct / 100) * 10) / 10;
      S.bodyScans = [{ date: j(3), leanMass: lm, weight: 85 }];
      out.A1.push(Object.assign({ mg: mgPct + '%', lm }, lire()));
    }
    out.A1_verdict = {
      prot_identiques: new Set(out.A1.map(x => x.P)).size === 1,
      lip_identiques: new Set(out.A1.map(x => x.L)).size === 1,
      bmr_varie: new Set(out.A1.map(x => x.bmr)).size > 1
    };

    /* ── A2. LA DISCIPLINE ATTEINT-ELLE LE MOTEUR ? ────────────────────────────────────── */
    out.A2 = [];
    for (const d of ['muscu', 'bodybuilding', 'powerbuilding', 'powerlifting', 'haltero']) {
      neuf(); S.discipline = d; out.A2.push(Object.assign({ discipline: d }, lire()));
    }
    out.A2_verdict = { tous_identiques: out.A2.every(x => eq(x, out.A2[0])) };

    /* ── A3. LE NIVEAU DÉCLARÉ ATTEINT-IL LE MOTEUR ? ──────────────────────────────────── */
    out.A3 = [];
    for (const n of ['', 'debutant', 'intermediaire', 'confirme']) {
      neuf(); S.level = n; out.A3.push(Object.assign({ niveau: n || '(vide)' }, lire()));
    }
    out.A3_verdict = { tous_identiques: out.A3.every(x => eq(x, out.A3[0])) };

    /* ── B. LE VOLUME RÉEL D'ENTRAÎNEMENT ATTEINT-IL LA CIBLE CALORIQUE ? ──────────────── */
    out.B = [];
    for (const f of [0, 1, 2, 3, 4, 5, 6, 7]) {
      neuf(); S.sessions = mkSess(f); out.B.push(Object.assign({ seances_sem: f }, lire()));
    }
    out.B_verdict = {
      kcal_identiques: new Set(out.B.map(x => x.kcal)).size === 1,
      prot_identiques: new Set(out.B.map(x => x.P)).size === 1,
      lip_varient: new Set(out.B.map(x => x.L)).size > 1,
      ecart_kcal_0_vs_6: out.B[6].kcal - out.B[0].kcal
    };

    /* ── C. LES ÉCARTS CALORIQUES SONT-ILS FIXES ? ─────────────────────────────────────── */
    out.C = [];
    for (const bw of [50, 60, 70, 85, 100, 130, 150]) {
      const row = { bw };
      neuf(); S.bw = bw; S.goal = 'equilibre'; const base = lire();
      row.tdee = base.tdee;
      for (const g of ['perte', 'recomp', 'muscle', 'force']) {
        neuf(); S.bw = bw; S.goal = g; const r = lire();
        row[g] = r.kcal - base.kcal;
        /* % du poids de corps par semaine, à 7 700 kcal/kg */
        row[g + '_pctSem'] = Math.round((r.kcal - base.kcal) * 7 / 7700 / bw * 1000) / 10;
      }
      out.C.push(row);
    }
    out.C_verdict = {
      ecart_perte_identique_partout: new Set(out.C.map(x => x.perte)).size === 1,
      pctSem_perte_min: Math.min(...out.C.map(x => x.perte_pctSem)),
      pctSem_perte_max: Math.max(...out.C.map(x => x.perte_pctSem)),
      pctSem_muscle_min: Math.min(...out.C.map(x => x.muscle_pctSem)),
      pctSem_muscle_max: Math.max(...out.C.map(x => x.muscle_pctSem))
    };

    /* ── D. LES 9 CAS LIMITES DU BRIEF ─────────────────────────────────────────────────── */
    const cas = [
      ['femme 78a 148cm 120kg sédentaire perte décharge', p => { p.gender = 'F'; p.age = 78; p.height = 148; p.bw = 120; p.activityLevel = 1.375; p.goal = 'perte'; p.phase = 'decharge'; }],
      ['homme 55kg très actif muscle charge', p => { p.bw = 55; p.activityLevel = 1.9; p.goal = 'muscle'; p.phase = 'charge'; }],
      ['homme 150kg sédentaire perte décharge', p => { p.bw = 150; p.activityLevel = 1.375; p.goal = 'perte'; p.phase = 'decharge'; }],
      ['homme 45kg 195cm 18a très actif muscle', p => { p.bw = 45; p.height = 195; p.age = 18; p.activityLevel = 1.9; p.goal = 'muscle'; }],
      ['femme 42kg 150cm 25a sédentaire perte', p => { p.gender = 'F'; p.bw = 42; p.height = 150; p.age = 25; p.activityLevel = 1.375; p.goal = 'perte'; p.phase = 'decharge'; }],
      ['homme 130kg recomp bureau', p => { p.bw = 130; p.goal = 'recomp'; }],
      ['homme 85kg métier physique très actif muscle', p => { p.workType = 'physique'; p.activityLevel = 1.9; p.goal = 'muscle'; }],
      ['homme 100kg kéto perte', p => { p.bw = 100; p.foodMode = 'keto'; p.goal = 'perte'; }],
      ['homme 100kg lowcarb perte', p => { p.bw = 100; p.foodMode = 'lowcarb'; p.goal = 'perte'; }]
    ];
    out.D = cas.map(([nom, f]) => {
      neuf(); const p = {}; f(p);
      Object.keys(p).forEach(k => { if (k === 'phase') S.nutritionPhase = p[k]; else S[k] = p[k]; });
      const r = lire();
      const bw = S.bw;
      return { cas: nom, kcal: r.kcal, P: r.P, L: r.L, G: r.G,
        prot_gkg: Math.round(r.P / bw * 100) / 100, lip_gkg: Math.round(r.L / bw * 100) / 100,
        gluc_gkg: Math.round(r.G / bw * 100) / 100,
        prot_pct: Math.round(r.P * 4 / r.kcal * 1000) / 10, lip_pct: Math.round(r.L * 9 / r.kcal * 1000) / 10,
        gluc_pct: Math.round(r.G * 4 / r.kcal * 1000) / 10,
        fermeture: r.P * 4 + r.L * 9 + r.G * 4 - r.kcal };
    });

    /* ── E. LA CIBLE MANUELLE — le contre-audit disait qu'une cible absurde est acceptée ── */
    out.E = [];
    for (const k of [600, 1000, 1500, 3000, 9000]) {
      neuf(); S.manualKcal = k; const m = calcMacros('charge');
      out.E.push({ manuelle: k, cible: m.calories, P: m.prot_g, L: m.fat_g, G: m.carbs_g,
        kcal_macros: m.prot_g * 4 + m.fat_g * 9 + m.carbs_g * 4 });
    }
    return out;
  });
  await b.close(); srv.close();
  R.erreurs_page = errs; R.duree_ms = Date.now() - t0;
  fs.writeFileSync('/tmp/verrou_faits.json', JSON.stringify(R, null, 1));

  const L = console.log;
  L('erreurs de page : ' + errs.length + ' · durée ' + R.duree_ms + ' ms\n');
  L('A1 — MASSE MAIGRE (85 kg, bilan frais, on ne change QUE le % de gras)');
  R.A1.forEach(x => L(`   ${x.mg.padStart(4)} (mm ${x.lm} kg) → BMR ${x.bmr} · TDEE ${x.tdee} · ${x.kcal} kcal · P${x.P} L${x.L} G${x.G}`));
  L('   verdict : ' + JSON.stringify(R.A1_verdict));
  L('\nA2 — DISCIPLINE'); R.A2.forEach(x => L(`   ${x.discipline.padEnd(14)} → ${x.kcal} kcal · P${x.P} L${x.L} G${x.G}`));
  L('   verdict : ' + JSON.stringify(R.A2_verdict));
  L('\nA3 — NIVEAU DÉCLARÉ'); R.A3.forEach(x => L(`   ${x.niveau.padEnd(14)} → ${x.kcal} kcal · P${x.P} L${x.L} G${x.G}`));
  L('   verdict : ' + JSON.stringify(R.A3_verdict));
  L('\nB — VOLUME RÉEL (séances/semaine sur 4 semaines)');
  R.B.forEach(x => L(`   ${x.seances_sem}/sem → ${x.kcal} kcal · P${x.P} L${x.L} G${x.G}`));
  L('   verdict : ' + JSON.stringify(R.B_verdict));
  L('\nC — ÉCARTS CALORIQUES (kcal/j, et ce que ça vaut en %/sem du poids)');
  L('   poids  TDEE   perte  (%/sem)   recomp   muscle  (%/sem)   force');
  R.C.forEach(x => L(`   ${String(x.bw).padStart(4)}  ${String(x.tdee).padStart(5)}   ${String(x.perte).padStart(5)}  ${String(x.perte_pctSem).padStart(6)}   ${String(x.recomp).padStart(6)}   ${String(x.muscle).padStart(6)}  ${String(x.muscle_pctSem).padStart(6)}   ${String(x.force).padStart(5)}`));
  L('   verdict : ' + JSON.stringify(R.C_verdict));
  L('\nD — CAS LIMITES');
  R.D.forEach(x => L(`   ${x.cas.padEnd(46)} ${String(x.kcal).padStart(5)} kcal · P${String(x.P).padStart(3)}(${x.prot_gkg} g/kg, ${x.prot_pct}%) L${String(x.L).padStart(3)}(${x.lip_gkg}, ${x.lip_pct}%) G${String(x.G).padStart(3)}(${x.gluc_gkg}, ${x.gluc_pct}%) fermeture ${x.fermeture >= 0 ? '+' : ''}${x.fermeture}`));
  L('\nE — CIBLE MANUELLE');
  R.E.forEach(x => L(`   saisie ${String(x.manuelle).padStart(5)} → cible ${String(x.cible).padStart(5)} · P${x.P} L${x.L} G${x.G} = ${x.kcal_macros} kcal`));
  L('\n→ /tmp/verrou_faits.json');
})();
