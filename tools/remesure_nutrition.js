#!/usr/bin/env node
/* REMESURE DU MOTEUR NUTRITION — LECTURE SEULE (nuit du 24→25/09/2026, après B1/B2)
   ⛔ AUCUNE RÈGLE N'EST CHANGÉE ICI : on conduit le code SERVI (state.js via index.html) avec
   des entrées ENTIÈREMENT SPÉCIFIÉES, par le vrai chemin `localStorage → load() → moteur`.
   Trois sorties :
     1. les scénarios (format complet, provenance de chaque entrée) ;
     2. la matrice activité × métier (un profil synthétique stable) ;
     3. le banc exploratoire B3 (macros > cible) sur une GRILLE documentée.
   ⚠️ Une fréquence mesurée sur la grille est une fréquence DANS LA GRILLE, jamais une
   estimation de ce qui arrive chez de vrais utilisateurs.
   Usage : node tools/remesure_nutrition.js [--json fichier]   (depuis la racine du dépôt) */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
           '.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.wasm':'application/wasm'};
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'});
  fs.createReadStream(f).pipe(r);
});
const GEL = '2026-09-20T12:00:00';   // un dimanche

/* ── 1. SCÉNARIOS ─────────────────────────────────────────────────────────────────────────
   `origine` dit d'où vient chaque profil. `act` = null veut dire « jamais choisie ».
   ⛔ Aucun scénario n'est « le profil réel de Michel » : ses données DÉCLARÉES sont
   H · 48 ans · 180 cm · ~85,9 kg · objectif force · phase charge ; son métier, son niveau
   d'activité et sa situation tabac ne sont PAS connus du dépôt → chaque variante est étiquetée. */
const MICHEL = { sexe: 'H', age: 48, taille: 180, poids: 85.9, but: 'force', phase: 'charge' };
const SC = [
  { id: 'A', origine: 'données déclarées de Michel — activité JAMAIS CHOISIE', ...MICHEL, act: null, metier: 'bureau', sport: 'aucun', fumeur: false },
  { id: 'B', origine: 'scénario sur données déclarées de Michel — activité 1,55 CHOISIE · métier bureau (hypothèse)', ...MICHEL, act: 1.55, metier: 'bureau', sport: 'aucun', fumeur: false },
  { id: 'C', origine: 'scénario sur données déclarées de Michel — activité 1,725 CHOISIE · métier bureau (hypothèse)', ...MICHEL, act: 1.725, metier: 'bureau', sport: 'aucun', fumeur: false },
  { id: 'D', origine: 'scénario sur données déclarées de Michel — activité 1,55 CHOISIE · métier physique (hypothèse)', ...MICHEL, act: 1.55, metier: 'physique', sport: 'aucun', fumeur: false },
  { id: 'E', origine: 'scénario sur données déclarées de Michel — activité 1,725 CHOISIE · métier physique (hypothèse)', ...MICHEL, act: 1.725, metier: 'physique', sport: 'aucun', fumeur: false },
  { id: 'F1', origine: 'scénario sur données déclarées de Michel — 1,55 · bureau · autre sport « vélo » (hypothèse)', ...MICHEL, act: 1.55, metier: 'bureau', sport: 'velo', fumeur: false },
  { id: 'F2', origine: 'scénario sur données déclarées de Michel — 1,55 · bureau · phase décharge', ...MICHEL, phase: 'decharge', act: 1.55, metier: 'bureau', sport: 'aucun', fumeur: false },
  { id: 'G0', origine: 'SYNTHÉTIQUE — PAS MICHEL (SYNTH-B du 22/09, reconstruit) — sans historique de séances', sexe: 'H', age: 41, taille: 179, poids: 85.8, but: 'muscle', phase: 'charge', act: 1.725, metier: 'physique', sport: 'aucun', fumeur: false },
  { id: 'G4', origine: 'SYNTHÉTIQUE — PAS MICHEL (SYNTH-B) + 4 séances/sem de jambes, dimanche = séance (choix de reproduction, 24/09)', sexe: 'H', age: 41, taille: 179, poids: 85.8, but: 'muscle', phase: 'charge', act: 1.725, metier: 'physique', sport: 'aucun', fumeur: false, seances: [0, 1, 3, 5] },
  { id: 'G5', origine: 'SYNTHÉTIQUE — PAS MICHEL (SYNTH-B) + 5 séances/sem de jambes (seancesSem:5 de banc_v9), dimanche = séance', sexe: 'H', age: 41, taille: 179, poids: 85.8, but: 'muscle', phase: 'charge', act: 1.725, metier: 'physique', sport: 'aucun', fumeur: false, seances: [0, 1, 2, 4, 5] },
  { id: 'X1', origine: 'SYNTHÉTIQUE NEUF (extrême, entièrement spécifié) — H 110 kg · 190 · 25 a · 1,9 · physique · FUMEUR · muscle · charge', sexe: 'H', age: 25, taille: 190, poids: 110, but: 'muscle', phase: 'charge', act: 1.9, metier: 'physique', sport: 'aucun', fumeur: true },
  { id: 'X2', origine: 'SYNTHÉTIQUE NEUF (extrême) — H 70 kg · 178 · 25 a · 1,9 · physique · endurance · charge', sexe: 'H', age: 25, taille: 178, poids: 70, but: 'endurance', phase: 'charge', act: 1.9, metier: 'physique', sport: 'aucun', fumeur: false },
  { id: 'X3', origine: 'SYNTHÉTIQUE NEUF (extrême) — X1 + 5 séances/sem de jambes, dimanche = séance', sexe: 'H', age: 25, taille: 190, poids: 110, but: 'muscle', phase: 'charge', act: 1.9, metier: 'physique', sport: 'aucun', fumeur: true, seances: [0, 1, 2, 4, 5] },
  { id: 'Y1', origine: 'SYNTHÉTIQUE NEUF (bas) — F 55 kg · 160 · 45 a · 1,2 · bureau · perte', sexe: 'F', age: 45, taille: 160, poids: 55, but: 'perte', phase: 'charge', act: 1.2, metier: 'bureau', sport: 'aucun', fumeur: false },
  { id: 'Y2', origine: 'SYNTHÉTIQUE NEUF (B3) — H 130 kg · 170 · 55 a · 1,2 · bureau · perte', sexe: 'H', age: 55, taille: 170, poids: 130, but: 'perte', phase: 'charge', act: 1.2, metier: 'bureau', sport: 'aucun', fumeur: false },
  { id: 'Y3', origine: 'SYNTHÉTIQUE NEUF (B3, cible MANUELLE) — données déclarées de Michel · 1,55 · bureau · 1 200 kcal à la main', ...MICHEL, act: 1.55, metier: 'bureau', sport: 'aucun', fumeur: false, manuel: 1200 },
];

(async () => {
  await new Promise(r => srv.listen(0, r));
  const PORT = srv.address().port;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const cx = await b.newContext({ serviceWorkers: 'block', timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{const F=new Date(${JSON.stringify(GEL)});const V=Date;
    window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}
      static now(){return F.getTime();}};})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  const R = await pg.evaluate((SC) => {
    const seances = (jours) => {
      const T = new Date('2026-09-20T12:00:00'), s = [];
      for (let d = 0; d < 28; d++) {
        const x = new Date(T - d * 864e5);
        if (jours.includes(x.getDay())) s.push({ date: x.toISOString().slice(0, 10),
          exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, done: true }] }] });
      }
      return s;
    };
    /* Le VRAI chemin : on écrit ce qu'un téléphone aurait sur le disque, puis `load()`. */
    const poser = (c) => {
      localStorage.clear();
      const D = { ft4_bw: String(c.poids), ft4_age: String(c.age), ft4_ht: String(c.taille), ft4_gender: c.sexe,
                  ft4_work: c.metier, ft4_goal: c.but, ft4_nphase: c.phase, ft4_smoker: c.fumeur ? '1' : '0', ft4_ob2: '1' };
      if (c.act != null) D.ft4_act = String(c.act);
      if (c.manuel) D.ft4_manualkcal = String(c.manuel);
      if (c.sport && c.sport !== 'aucun') D.ft4_coachquiz = JSON.stringify({ answers: { othersport: c.sport } });
      if (c.seances) D.ft4_sessions = JSON.stringify(seances(c.seances));
      Object.keys(D).forEach(k => localStorage.setItem(k, D[k]));
      load();
    };
    const mesurer = (c) => {
      poser(c);
      const d = bmrDetail(), m = calcMacros(S.nutritionPhase), t = calcTDEE();
      const lu = { poids: S.bw, taille: S.height, age: S.age, sexe: S.gender, act: S.activityLevel, metier: S.workType,
                   fumeur: !!S.smoker, but: S.goal, phase: S.nutritionPhase, manuel: S.manualKcal || 0,
                   sport: (S.coachQuiz && S.coachQuiz.answers && S.coachQuiz.answers.othersport) || 'aucun',
                   seancesSem: m.cycle ? m.cycle.freq : 0, jour: m.cycle ? m.cycle.jour : 'sans cycle' };
      const calculable = m.prot_g != null && m.calories != null;
      const kMac = calculable ? m.prot_g * 4 + m.fat_g * 9 + m.carbs_g * 4 : null;
      return { id: c.id, origine: c.origine, lu,
        provenanceAct: c.act == null ? 'jamais choisie (absente du stockage)' : 'choisie (écrite dans le stockage par le scénario)',
        methode: d.methode, bmr: d.kcal || null, bonusMetier: calcWorkExtra(), bonusSport: calcSportExtra(), pas: calcPasExtra(),
        tdee: t, cible: m.calories, auto: m.autoCalories, manuelle: m.isManual, plancher: (typeof plancherKcalActif === 'function') ? plancherKcalActif(S.nutritionPhase) : null,
        P: m.prot_g, L: m.fat_g, G: m.carbs_g, kMac, ecart: kMac != null ? kMac - m.calories : null,
        pourquoi: calculable ? null : ('non calculable — il manque : ' + ((m.manquants || []).join(', ') || '?')) };
    };
    const scen = SC.map(mesurer);

    /* ── 2. MATRICE activité × métier — profil synthétique stable ── */
    const BASEM = { id: 'MAT', sexe: 'H', age: 35, taille: 180, poids: 80, but: 'muscle', phase: 'charge', metier: 'bureau', sport: 'aucun', fumeur: false };
    const mat = [];
    [1.2, 1.375, 1.55, 1.725, 1.9].forEach(a => ['bureau', 'debout', 'actif', 'physique'].forEach(w => {
      const r = mesurer(Object.assign({}, BASEM, { act: a, metier: w }));
      mat.push({ act: a, metier: w, bmr: r.bmr, bonus: r.bonusMetier, tdee: r.tdee, cible: r.cible, G: r.G });
    }));

    /* ── 3. B3 EXPLORATOIRE — grille documentée ──
       ⚠️ Pour tenir en secondes, on charge UNE fois par le vrai chemin, puis on AFFECTE `S`
       directement (mêmes champs que `load()` pose). Un contrôle compare 50 points au chemin
       complet `localStorage → load()` avant de croire la grille. */
    const GRILLE = { sexe: ['H', 'F'], poids: [], taille: [160, 175, 190], age: [20, 35, 50, 65],
                     act: [1.2, 1.375, 1.55, 1.725, 1.9], but: ['muscle', 'force', 'perte', 'recomp', 'equilibre', 'endurance'],
                     phase: ['charge', 'decharge'], metier: ['bureau'] };
    for (let p = 45; p <= 160; p += 5) GRILLE.poids.push(p);
    poser(Object.assign({}, BASEM, { act: 1.55 }));
    const affecter = (c) => {
      S.gender = c.sexe; S.bw = c.poids; S.height = c.taille; S.age = c.age; S.activityLevel = c.act;
      S.goal = c.but; S.nutritionPhase = c.phase; S.workType = c.metier; S.smoker = false;
      S.manualKcal = c.manuel || 0; S.coachQuiz = null; S.sessions = []; S.bodyScans = []; S.weightLog = [];
    };
    const mesureVite = (c) => {
      affecter(c);
      const m = calcMacros(S.nutritionPhase);
      const k = m.prot_g * 4 + m.fat_g * 9 + m.carbs_g * 4;
      const pl = plancherKcalActif(S.nutritionPhase);
      return { cible: m.calories, P: m.prot_g, L: m.fat_g, G: m.carbs_g, k, ecart: k - m.calories, plancher: !!pl };
    };
    const pts = [];
    GRILLE.sexe.forEach(sx => GRILLE.poids.forEach(p => GRILLE.taille.forEach(h => GRILLE.age.forEach(a =>
      GRILLE.act.forEach(ac => GRILLE.but.forEach(g => GRILLE.phase.forEach(ph => {
        const c = { sexe: sx, poids: p, taille: h, age: a, act: ac, but: g, phase: ph, metier: 'bureau' };
        pts.push(Object.assign({ c }, mesureVite(c)));
      })))))));
    /* Contrôle de fidélité : des points repris par le chemin complet `localStorage → load()`.
       ⚠️ Resserré après la contre-vérification de nuit : le 1ᵉʳ échantillon (50 points réguliers) ne
       contenait AUCUN point B3 ni AUCUN point où le plancher agit — il ne validait pas le raccourci
       là où le banc conclut. On prend donc 30 points réguliers + 40 points B3 + TOUS les points
       plancher, et on compare aussi le drapeau du plancher. */
    const echant = [];
    for (let i = 0; i < 30; i++) echant.push(pts[Math.floor(i * pts.length / 30)]);
    const pB3 = pts.filter(x => x.ecart > 2);
    for (let i = 0; i < 40 && pB3.length; i++) echant.push(pB3[Math.floor(i * pB3.length / 40)]);
    pts.filter(x => x.plancher).forEach(x => echant.push(x));
    let fideles = 0;
    echant.forEach(q => {
      const r = mesurer(Object.assign({ id: 'F' }, q.c, { sport: 'aucun', fumeur: false }));
      if (r.cible === q.cible && r.P === q.P && r.L === q.L && r.G === q.G && (!!r.plancher) === q.plancher) fideles++;
    });
    const nEchant = echant.length, nEchantB3 = echant.filter(x => x.ecart > 2).length, nEchantPl = echant.filter(x => x.plancher).length;
    const b3 = pts.filter(x => x.ecart > 2);          // > 2 kcal : au-delà de l'arrondi
    const par = (cle, f) => { const o = {}; pts.forEach(x => { const k = f(x); o[k] = o[k] || [0, 0]; o[k][0]++; if (x.ecart > 2) o[k][1]++; }); return o; };
    const bandes = x => { const p = x.c.poids; return p < 70 ? '45-65' : p < 90 ? '70-85' : p < 110 ? '90-105' : p < 130 ? '110-125' : '130-160'; };
    const ecarts = b3.map(x => x.ecart).sort((a, c) => a - c);
    const exemples = b3.slice().sort((a, c) => c.ecart - a.ecart).slice(0, 5).map(x => ({ c: x.c, cible: x.cible, P: x.P, L: x.L, G: x.G, k: x.k, ecart: x.ecart, plancher: x.plancher }));
    /* Seuil de bascule : pour chaque (sexe, objectif), le plus petit poids où B3 apparaît. */
    const seuils = {};
    GRILLE.sexe.forEach(sx => GRILLE.but.forEach(g => {
      const l = b3.filter(x => x.c.sexe === sx && x.c.but === g).map(x => x.c.poids);
      seuils[sx + ' ' + g] = l.length ? Math.min.apply(null, l) : null;
    }));
    /* Cible MANUELLE : grille poids × objectifs × cibles tapées. */
    const man = [];
    [1200, 1500, 1800, 2000, 2500, 3000].forEach(k => GRILLE.poids.forEach(p => GRILLE.but.forEach(g => {
      const r = mesureVite({ sexe: 'H', poids: p, taille: 175, age: 35, act: 1.55, but: g, phase: 'charge', metier: 'bureau', manuel: k });
      man.push({ k, p, g, ecart: r.ecart });
    })));
    const manB3 = man.filter(x => x.ecart > 2);
    const manSeuil = {};
    [1200, 1500, 1800, 2000, 2500, 3000].forEach(k => {
      const l = manB3.filter(x => x.k === k).map(x => x.p);
      manSeuil[k] = l.length ? Math.min.apply(null, l) : null;
    });
    return { scen, mat, b3: {
      grille: Object.assign({}, GRILLE, { poids: '45 → 160 kg, pas 5 (' + GRILLE.poids.length + ' valeurs)' }),
      total: pts.length, touches: b3.length, fideles, nEchant, nEchantB3, nEchantPl,
      presqueB3: pts.filter(x => x.G === 0 && x.ecart > 0 && x.ecart <= 2).length,
      parBut: par('but', x => x.c.but), parSexe: par('sexe', x => x.c.sexe), parPoids: par('poids', bandes),
      parAct: par('act', x => x.c.act), parPhase: par('phase', x => x.c.phase),
      plancher: { total: pts.filter(x => x.plancher).length, dontB3: b3.filter(x => x.plancher).length },
      ecart: ecarts.length ? { min: ecarts[0], med: ecarts[Math.floor(ecarts.length / 2)], max: ecarts[ecarts.length - 1] } : null,
      exemples, seuils,
      manuel: { total: man.length, touches: manB3.length, seuilPoidsParCible: manSeuil } } };
  }, SC);

  const f = (v, d = 0) => v == null ? '—' : (typeof v === 'number' ? (+v.toFixed(d)).toLocaleString('fr-FR') : String(v));
  console.log('════ 1. SCÉNARIOS (code servi, chemin localStorage → load() → moteur) ════');
  R.scen.forEach(r => {
    const l = r.lu;
    console.log(`\n[${r.id}] ${r.origine}`);
    console.log(`  entrées lues : ${l.sexe} · ${f(l.poids, 1)} kg · ${l.taille} cm · ${l.age} a · activité ${l.act == null ? 'AUCUNE' : l.act} (${r.provenanceAct}) · métier ${l.metier} · autre sport ${l.sport} · fumeur ${l.fumeur ? 'oui' : 'non'} · objectif ${l.but} · phase ${l.phase}${l.manuel ? ' · cible MANUELLE ' + l.manuel : ''} · cycle ${l.jour}${l.seancesSem ? ' (' + l.seancesSem + ' séances/sem)' : ''}`);
    if (r.pourquoi) { console.log(`  BMR ${f(r.bmr)} (${r.methode || '—'}) · ${r.pourquoi}`); return; }
    console.log(`  BMR ${f(r.bmr)} (${r.methode}) · bonus métier ${r.bonusMetier} · sport ${r.bonusSport} · pas ${r.pas} · TDEE ${f(r.tdee)} · cible ${f(r.cible)}${r.manuelle ? ' (manuelle ; auto = ' + f(r.auto) + ')' : ''}${r.plancher ? ' (plancher : calcul ' + r.plancher.brut + ')' : ''}`);
    console.log(`  P ${r.P} g (${f(r.P / l.poids, 2)} g/kg) · L ${r.L} g (${f(r.L / l.poids, 2)} g/kg) · G ${r.G} g (${f(r.G / l.poids, 2)} g/kg) · macros ${f(r.kMac)} kcal · écart ${r.ecart > 0 ? '+' : ''}${r.ecart} kcal`);
  });
  console.log('\n════ 2. MATRICE activité × métier — SYNTHÉTIQUE : H · 35 a · 180 cm · 80 kg · non-fumeur · muscle · charge ════');
  console.log('  act    métier    BMR   bonus  TDEE   Δ vs bureau');
  R.mat.forEach(x => {
    const ref = R.mat.find(y => y.act === x.act && y.metier === 'bureau');
    console.log(`  ${String(x.act).padEnd(6)} ${x.metier.padEnd(9)} ${x.bmr}  +${String(x.bonus).padEnd(4)} ${x.tdee}   ${x.tdee - ref.tdee >= 0 ? '+' : ''}${x.tdee - ref.tdee}`);
  });
  const mn = Math.min(...R.mat.map(x => x.tdee)), mx = Math.max(...R.mat.map(x => x.tdee));
  console.log(`  amplitude : ${mn} → ${mx} kcal (×${(mx / mn).toFixed(2)})`);
  const B = R.b3;
  console.log('\n════ 3. B3 EXPLORATOIRE — macros > cible (écart > 2 kcal, au-delà de l\'arrondi) ════');
  console.log('  grille : ' + JSON.stringify(B.grille));
  console.log(`  fidélité : ${B.fideles}/${B.nEchant} points identiques au chemin complet localStorage → load() (dont ${B.nEchantB3} points B3 et ${B.nEchantPl} points plancher ; plancher comparé aussi)`);
  console.log(`  définition : B3 = écart > 2 kcal ⇔ 4P + 9L ≥ cible + 3 (au-delà de l'arrondi, qui reste dans −1..+2 hors cycle). ${B.presqueB3} points ont G = 0 avec 4P + 9L = cible + 1 ou + 2 : exclus par ce seuil.`);
  console.log(`  cible AUTO : ${B.touches} / ${B.total} points (${(100 * B.touches / B.total).toFixed(1)} % DE LA GRILLE — pas une fréquence réelle)`);
  const pr = o => Object.keys(o).map(k => `${k} ${o[k][1]}/${o[k][0]}`).join(' · ');
  console.log('  par objectif : ' + pr(B.parBut));
  console.log('  par sexe : ' + pr(B.parSexe));
  console.log('  par poids : ' + pr(B.parPoids));
  console.log('  par activité : ' + pr(B.parAct));
  console.log('  ⚠️ « 0 à activité ≥ 1,725 » vaut DANS CETTE GRILLE seulement : hors grille (très petite taille, âge très élevé), la contre-vérification en a trouvé.');
  console.log('  par phase : ' + pr(B.parPhase));
  console.log(`  plancher D-017 actif : ${B.plancher.total} points, dont ${B.plancher.dontB3} avec B3`);
  console.log('  écart (kcal) : ' + JSON.stringify(B.ecart));
  console.log('  plus petit poids touché, par sexe et objectif : ' + JSON.stringify(B.seuils));
  console.log('  5 pires cas : ' + JSON.stringify(B.exemples));
  console.log(`  cible MANUELLE (H 175 cm 35 a 1,55 · 6 objectifs · 24 poids · 6 cibles) : ${B.manuel.touches}/${B.manuel.total} ; plus petit poids touché par cible : ${JSON.stringify(B.manuel.seuilPoidsParCible)}`);
  console.log('\n  erreurs de page : ' + (errs.length ? errs.slice(0, 3).join(' | ') : 'aucune'));
  const i = process.argv.indexOf('--json');
  if (i > 0) fs.writeFileSync(process.argv[i + 1], JSON.stringify(R, null, 1));
  await b.close(); srv.close();
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
