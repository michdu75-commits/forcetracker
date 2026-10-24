#!/usr/bin/env node
/* DIAGNOSTIC MET (24/10/2026, mission Séance de Michel) — outil de MESURE, hors passe : il ne juge rien (aucun témoin).
   Il n'écrit que dans le dossier de sortie donné. Rapport : docs/DIAGNOSTIC-MET-2026-10-24.md. Monté comme les bancs :
   la VRAIE application servie depuis une COPIE (git archive HEAD), réseau coupé (garde des tests + routes locales
   seules), données FICTIVES, un contexte neuf par scénario. Rien n'est écrit dans le dépôt.
   Usage : tools/sous_garde.sh node tools/diag_met.js <arbre> <dossier_sortie> [scénario,…]
   Chaque scénario écrit <dossier_sortie>/<scénario>.json et une ligne JSON sur la sortie standard. */
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2]);
const OUT = path.resolve(process.argv[3] || '.');
const SEUL = process.argv[4] ? process.argv[4].split(',') : null;
fs.mkdirSync(OUT, { recursive: true });
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.gif':'image/gif'};
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
// Profil FICTIF (le même que harnais3.js) : homme, 82 kg, 40 ans, 178 cm, repos par défaut 130 s.
const BASE = { ft4_bw:'82', ft4_age:'40', ft4_ht:'178', ft4_gender:'H', ft4_goal:'force', ft4_act:'1.55', ft4_work:'bureau', ft4_ob2:'1', ft4_name:'Test', ft4_email:'t@t.t',
  ft4_devtoken:'f'.repeat(64), ft4_tester_eq_v1:'1', ft4_ok:'1', ft4_stmig1:'1', ft4_guide_shown:'1', ft4_wn_seen:'999', ft4_sessions:'[]', ft4_prs:'{}', ft4_rest:'130' };

/* ── AIDES INJECTÉES DANS LA PAGE (window.__H) — elles n'appellent QUE les vraies fonctions de l'app ── */
function HELPERS() {
  const H = {};
  // Séances types FICTIVES (déclarées dans le diagnostic) : [nom, [[kg, reps, type], …], note?]
  H.TYPES = {
    A_pecs_epaules: { cible: 60, exs: [
      ['Développé Couché', [[40,10,'É'],[60,6,'É'],[80,8],[80,8],[80,8],[80,8]]],
      ['Développé Incliné Haltères', [[52,10],[52,10],[52,10]]],
      ['Écarté Poulie', [[15,12],[15,12],[15,12]]],
      ['Développé Militaire Haltères', [[36,10],[36,10],[36,10]]],
      ['Élévations Latérales (Lateral Raise)', [[16,15],[16,15],[16,15],[16,15]]],
      ['Oiseau', [[12,15],[12,15],[12,15]]] ] },
    B_jambes: { cible: 75, exs: [
      ['Squat à la Barre', [[60,8,'É'],[80,5,'É'],[100,3,'É'],[120,5],[120,5],[120,5],[120,5]]],
      ['Press Jambes 45°', [[180,12],[180,12],[180,12]]],
      ['Soulevé de Terre Roumain Barre', [[100,8],[100,8],[100,8]]],
      ['Leg Curl Assis Machine', [[50,12],[50,12],[50,12]]],
      ['Extension Quadriceps (Leg Extension)', [[45,15],[45,15],[45,15]]],
      ['Élévations Mollets Debout', [[80,15],[80,15],[80,15],[80,15]]] ] },
    C_courte: { cible: 20, exs: [
      ['Pompes (Push-up)', [[0,15],[0,15],[0,15]]],
      ['Rowing Haltère (Tirage Horizontal)', [[30,10],[30,10],[30,10]]],
      ['Curl Haltères', [[14,12],[14,12],[14,12]]],
      ['Gainage', [[0,45],[0,45]]] ] },
  };
  // Records FICTIFS (pour le facteur de charge) — séries de travail à ~70-80 % du max.
  H.PRS = { 'Développé Couché':100, 'Développé Incliné Haltères':66, 'Écarté Poulie':22, 'Développé Militaire Haltères':46,
    'Élévations Latérales (Lateral Raise)':22, 'Oiseau':18, 'Squat à la Barre':150, 'Press Jambes 45°':260,
    'Soulevé de Terre Roumain Barre':140, 'Leg Curl Assis Machine':70, 'Extension Quadriceps (Leg Extension)':65,
    'Élévations Mollets Debout':120, 'Rowing Haltère (Tirage Horizontal)':42, 'Curl Haltères':20 };
  H.posePRs = (on) => { S.prs = {}; if (on) Object.keys(H.PRS).forEach(k => { S.prs[k] = { rm1: H.PRS[k], kg: H.PRS[k], reps: 1, date: '2026-09-01' }; }); };
  // Écarts entre deux validations de séries (secondes) avant mise à l'échelle — repères métier de DOSSIER-MET §8.
  H.ecart = (prev, next, memeEx) => {
    if (!memeEx) return 180;                         // passage d'un exercice à l'autre
    if (prev[2] === 'É') return 60;                  // palier d'échauffement
    const r = +prev[1] || 0;
    if (r <= 5) return 200; if (r <= 12) return 110; return 75;
  };
  /* Construit une séance. mode : 'horodatage' (séries horodatées, fenêtre = cible) · 'chrono' (durée seule) ·
     'saisie' (durée saisie à la main) · 'aucune' (ni durée ni horodatage). */
  H.seance = (spec, mode, opts) => {
    opts = opts || {};
    const cibleMin = opts.cibleMin || spec.cible;
    const exs = spec.exs.map(([name, sets, note]) => ({ name, ...(note ? { note } : {}), sets: sets.map(s => ({ kg: s[0], reps: s[1], done: true, type: s[2] || 'N' })) }));
    const sess = { id: 1, ts: Date.now(), date: today(), uniConv: 1, exs };
    if (mode === 'horodatage') {
      const flat = []; spec.exs.forEach(([n, sets], ei) => sets.forEach((s, si) => flat.push({ ei, si, s })));
      const gaps = [0]; for (let i = 1; i < flat.length; i++) gaps.push(H.ecart(flat[i - 1].s, flat[i].s, flat[i - 1].ei === flat[i].ei));
      const brut = gaps.reduce((a, b) => a + b, 0), k = (cibleMin * 60) / brut;
      let t = 30; flat.forEach((f, i) => { t += (i ? Math.round(gaps[i] * k) : 0); exs[f.ei].sets[f.si].at = t; });
      // ajuster la dernière pour tomber exactement sur la cible (arrondis)
      const last = flat[flat.length - 1], first = flat[0];
      exs[last.ei].sets[last.si].at = exs[first.ei].sets[first.si].at + cibleMin * 60;
      sess.duration = cibleMin * 60 + 120;        // le chrono court un peu plus (fin de séance), comme en vrai
    } else if (mode === 'chrono') { sess.duration = cibleMin * 60; }
    else if (mode === 'saisie') { sess.duration = cibleMin * 60; sess.durationDite = true; }
    sess.exercises = sess.exs;
    if (opts.cardioAvant) sess.cardioAvant = opts.cardioAvant;
    if (opts.cardio) sess.cardio = opts.cardio;
    return sess;
  };
  // Ce que stocke finishWorkout : calcSessionCalories + cardio (log.js:5001-5004)
  H.kcal = (sess) => { const c = calcSessionCalories(sess); const ck = calcCardioKcal(sess.cardioAvant || null) + calcCardioKcal(sess.cardio || null);
    return { total: c.total + ck, moteur: c.total, cardio: ck, activeMin: c.activeMin, restMin: c.restMin, transitionMin: c.transitionMin, warmupMin: c.warmupMin,
      dureeMin: c.dureeMin, dureeSrc: c.dureeSrc, totalMin: c.totalMin, totalSets: c.totalSets, engineVersion: c.engineVersion, breakdown: c.breakdown }; };
  // Détail par exercice : MET retenu, facteur de charge moyen, secondes actives
  H.detail = (sess) => (sess.exs || []).map(ex => { const d = (ex.sets || []).filter(s => s.done); const rm1 = (S.prs && S.prs[ex.name] && +S.prs[ex.name].rm1) || 0;
    return { nom: ex.name, MET: getExerciseMET(ex.name), series: d.length, secActives: d.reduce((a, s) => a + _secSerie(s, ex), 0),
      facteurs: d.map(s => +_facteurCharge(s.kg, rm1).toFixed(3)) }; });
  // Décomposition exacte du moteur (régime « durée réelle ≥ modèle ») : 3,0 × poids × durée + Σ (MET×f − 3,0) × poids × t + forfait
  H.decompose = (sess) => {
    const bw = S.bw || 80, rest = reposDefaut(); let act = 0, bonus = 0, modelMin = 0, nSets = 0;
    (sess.exs || []).forEach(ex => { const d = (ex.sets || []).filter(s => s.done); if (!d.length) return; const met = getExerciseMET(ex.name);
      const rm1 = (S.prs && S.prs[ex.name] && +S.prs[ex.name].rm1) || 0; nSets += d.length;
      d.forEach(s => { const sec = _secSerie(s, ex), f = _facteurCharge(s.kg, rm1); act += met * f * bw * sec / 3600; bonus += (met * f - MET_REST) * bw * sec / 3600; modelMin += sec / 60; });
      modelMin += Math.max(0, d.length - 1) * rest / 60; });
    const c = calcSessionCalories(sess), D = c.dureeMin; return { bw, D, modelMin: +modelMin.toFixed(2), socle3MET: +(MET_REST * bw * D / 60).toFixed(1), bonusActif: +bonus.toFixed(1),
      forfait: +(3.5 * bw * c.warmupMin / 60).toFixed(1), totalMoteur: c.total };
  };
  // Le chemin de décision de getExerciseMET (app.js:298-330), réécrit pour ÉTIQUETER — vérifié égal au vrai résultat
  H.chemin = (name) => {
    const n = name || '', low = n.toLowerCase();
    const kO = OLYMPIC_KW.find(k => low.includes(k.toLowerCase())); if (kO) return { chemin: 'mot-clé haltérophilie « ' + kO + ' »', met: MET_OLYMPIC };
    const kC = CARDIO_KW.find(k => low.includes(k.toLowerCase())); if (kC) return { chemin: 'mot-clé cardio « ' + kC + ' »', met: MET_CARDIO };
    if (/farmer|fermier|\bcarry\b|porte lourd|suitcase carry/i.test(n)) return { chemin: 'porté (expression régulière)', met: MET_LOWER };
    const sc = (_mscScores([{ name: n, sets: [{ done: true }] }]) || {}).sc || {}; const noms = Object.keys(sc);
    if (noms.length < 3) return { chemin: noms.length ? (noms.length + ' muscle(s) < 3 → isolation') : 'aucun muscle connu → isolation par défaut', met: MET_ISO, sc };
    if (_movPattern(n) === 'hip-hinge') return { chemin: '≥ 3 muscles + charnière de hanche', met: MET_LOWER, sc };
    let bas = 0, tot = 0; for (const m of noms) { tot += sc[m]; if (_MET_REGIONS.bas.indexOf(m) >= 0) bas += sc[m]; }
    const part = tot > 0 ? bas / tot : 0;
    return { chemin: '≥ 3 muscles, part du bas ' + Math.round(part * 100) + ' % ' + (part >= 0.5 ? '≥' : '<') + ' 50 %', met: part >= 0.5 ? MET_LOWER : MET_UPPER, sc, partBas: +part.toFixed(3) };
  };
  H.sourceMuscles = (name) => {
    const f = exMuscles(exNomCatalogue(name)); if (f) return { source: 'fiche écrite (EX_MUSCLES)', p: f.p, s: f.s };
    const nm = _naz(name); const i = _MEX.findIndex(r => r.re.test(nm));
    if (i >= 0) return { source: 'règle _MEX n°' + i + ' ' + String(_MEX[i].re), p: _MEX[i].p, s: _MEX[i].s };
    const c = (S.customExercises || []).find(e => e.n === name); if (c && c.muscles) return { source: 'muscles cochés (perso)', p: c.muscles.p, s: c.muscles.s };
    return { source: 'aucune' };
  };
  window.__H = H;
}

const SCEN = {
  /* ① LE CATALOGUE RECOMPTÉ — sans rien présumer */
  async CATALOGUE() {
    const noms = [...new Set(EXLIB.map(e => e.n))];
    const groupes = {}; EXLIB.forEach(e => { (groupes[e.g] = groupes[e.g] || []).push(e.n); });
    const parNom = {}; EXLIB.forEach(e => { (parNom[e.n] = parNom[e.n] || []).push(e.g); });
    const multi = Object.entries(parNom).filter(([n, g]) => g.length > 1).map(([n, g]) => ({ n, g }));
    const doublonMemeGroupe = Object.entries(parNom).filter(([n, g]) => new Set(g).size < g.length).map(([n, g]) => ({ n, g }));
    const ids = Object.keys(EX_IDS);
    const idsCatalogue = new Set(noms.map(n => exId(n)).filter(Boolean));
    const retires = ids.filter(id => !idsCatalogue.has(id)).map(id => ({ id, nom: exNom(id) }));
    const sansId = noms.filter(n => !exId(n));
    const sansFiche = noms.filter(n => !exMuscles(exNomCatalogue(n)));
    const sansMuscles = noms.filter(n => Object.keys((_mscScores([{ name: n, sets: [{ done: true }] }]) || {}).sc || {}).length === 0);
    const fichesSansExo = Object.keys(EX_MUSCLES).filter(id => !idsCatalogue.has(id));
    const parGroupe = Object.fromEntries(Object.entries(groupes).map(([g, l]) => [g, { appartenances: l.length, noms: new Set(l).size }]));
    // Variantes — méthode A : schéma moteur de l'app (_movPattern) × résistance (_movResist)
    const pat = {}; noms.forEach(n => { const p = _movPattern(n) || '(aucun schéma)'; (pat[p] = pat[p] || []).push({ n, r: _movResist(n) || '(?)' }); });
    const schemas = Object.fromEntries(Object.entries(pat).map(([p, l]) => [p, { noms: l.length, resistances: [...new Set(l.map(x => x.r))] }]));
    // Variantes — méthode B : le nom sans les mots de MATÉRIEL ni la parenthèse explicative
    const MAT = ['barre','halteres','haltere','poulie','poulies','cable','cables','machine','smith','elastique','elastiques','bande','bandes','trx','sangles','kettlebell','landmine','ez','hammer','strength','levier','chaines','trap','bar','t','avec','a','au','aux','la','le','les','de','du','des','en','sur'];
    const nz = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const base = n => nz(n.replace(/\s*\([^)]*\)\s*/g, ' ')).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(t => t && MAT.indexOf(t) < 0).join(' ');
    const fam = {}; noms.forEach(n => { const b = base(n); (fam[b] = fam[b] || []).push(n); });
    const familles = Object.entries(fam).filter(([b, l]) => l.length > 1).map(([b, l]) => ({ base: b, noms: l })).sort((a, b) => b.noms.length - a.noms.length);
    return { appartenances: EXLIB.length, nomsDistincts: noms.length, groupes: Object.keys(groupes).length, parGroupe,
      nomsDansPlusieursGroupes: multi.length, multi, doublonMemeGroupe,
      identifiants: ids.length, retires, sansId, ficheEcrite: noms.length - sansFiche.length, sansFiche: sansFiche.map(n => ({ n, source: __H.sourceMuscles(n) })),
      sansMuscles, fichesEX_MUSCLES: Object.keys(EX_MUSCLES).length, fichesSansExo,
      schemas, variantesB: { familles: familles.length, nomsConcernes: familles.reduce((a, f) => a + f.noms.length, 0), liste: familles },
      reglesMEX: _MEX.length, persoAuDemarrage: (S.customExercises || []).length };
  },
  /* ③ LA TABLE COMPLÈTE exercice → classe / MET, avec le chemin de décision (vérifié contre getExerciseMET) */
  async CLASSES() {
    const noms = [...new Set(EXLIB.map(e => e.n))];
    const idsCatalogue = new Set(noms.map(n => exId(n)).filter(Boolean));
    const retires = Object.keys(EX_IDS).filter(id => !idsCatalogue.has(id)).map(id => exNom(id));
    const groupesDe = n => [...new Set(EXLIB.filter(e => e.n === n).map(e => e.g))];
    const ISO = ['elevation-epaules','flexion-genou','curl-biceps','extension-triceps','mollets','extension-genou','hanche-laterale','poignet'];
    const COMPOSE = ['squat','fente','hip-hinge','poussee-verticale','poussee-horizontale','tirage-vertical','tirage-horizontal','porte','halterophilie'];
    const BIART = /face pull|tirage visage|tirage menton|upright/i;
    const FLY = /ecart|pec deck|croise poulie|crossover|\bfly\b/i;
    const lignes = noms.concat(retires).map(n => {
      const c = __H.chemin(n), vrai = getExerciseMET(n), p = _movPattern(n), src = __H.sourceMuscles(n);
      const nz = n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      let doute = '';
      if (vrai >= 5.5 && vrai !== MET_OLYMPIC && vrai !== MET_CARDIO && (ISO.indexOf(p) >= 0 || (p === 'poussee-horizontale' && FLY.test(nz))))
        doute = BIART.test(n) ? 'bi-articulaire (coude + épaule) compté polyarticulaire — discutable' : 'mono-articulaire compté polyarticulaire';
      else if (vrai === MET_ISO && COMPOSE.indexOf(p) >= 0 && !(p === 'poussee-horizontale' && FLY.test(nz))) doute = 'polyarticulaire compté isolation';
      else if (vrai >= 5.5 && p === 'gainage-abdos') doute = 'gainage / abdos compté polyarticulaire — à discuter';
      return { nom: n, retire: retires.indexOf(n) >= 0, groupes: groupesDe(n), schema: p || null, MET: vrai, chemin: c.chemin, etiquetteOK: c.met === vrai,
        muscles: c.sc ? Object.keys(c.sc).map(m => m + (c.sc[m] >= 2 ? '(p)' : '(s)')).join(' ') : '', partBas: c.partBas == null ? null : c.partBas, source: src.source, doute };
    });
    const parMET = {}; lignes.forEach(l => { parMET[l.MET] = (parMET[l.MET] || 0) + 1; });
    const parChemin = {}; lignes.forEach(l => { const k = l.chemin.replace(/« [^»]+ »/, '«…»').replace(/\d+ %/, 'x %').replace(/^\d muscle\(s\)/, 'n muscle(s)'); parChemin[k] = (parChemin[k] || 0) + 1; });
    return { n: lignes.length, catalogue: noms.length, retires: retires.length, etiquettesFausses: lignes.filter(l => !l.etiquetteOK).map(l => l.nom), parMET, parChemin,
      douteux: lignes.filter(l => l.doute).length, lignes };
  },
  /* ④ ⑤ ⑦ LES SÉANCES TYPES — chaque mode de durée, avec et sans records connus */
  async SEANCES() {
    const out = {};
    for (const [k, spec] of Object.entries(__H.TYPES)) {
      out[k] = {};
      for (const prs of [true, false]) {
        __H.posePRs(prs); const key = prs ? 'avecRecords' : 'sansRecord'; out[k][key] = {};
        for (const mode of ['horodatage', 'chrono', 'saisie', 'aucune']) {
          const s = __H.seance(spec, mode); const r = __H.kcal(s);
          r.metImpliciteSurDuree = r.dureeMin ? +(r.moteur / (S.bw * r.dureeMin / 60)).toFixed(2) : null;
          r.metImpliciteSurDureePlusForfait = r.dureeMin ? +(r.moteur / (S.bw * (r.dureeMin + r.warmupMin) / 60)).toFixed(2) : null;
          if (mode === 'horodatage') { const e = _estimCalTempsReel(s); r.estimation3_5affichee = e; const d = _dureeEffective(s); r.dureeEffective = d; r.decompose = __H.decompose(s); }
          if (mode === 'chrono' || mode === 'saisie') r.decompose = __H.decompose(s);
          out[k][key][mode] = r;
        }
        out[k][key].detail = __H.detail(__H.seance(spec, 'horodatage'));
      }
    }
    __H.posePRs(true);
    return { bw: S.bw, defRest: reposDefaut(), series: Object.fromEntries(Object.entries(__H.TYPES).map(([k, s]) => [k, s.exs.reduce((a, e) => a + e[1].length, 0)])), out };
  },
  /* ⑤ LE REPOS : réglage par défaut, préférences par exercice, abdos — lus ou non par le moteur ? */
  async REPOS() {
    __H.posePRs(true); const out = {};
    for (const [k, spec] of Object.entries(__H.TYPES)) {
      out[k] = {};
      for (const mode of ['horodatage', 'aucune']) {
        out[k][mode] = {};
        for (const rep of [60, 130, 240]) { S.defRest = rep; const r = __H.kcal(__H.seance(spec, mode)); out[k][mode]['defRest' + rep] = [r.total, r.restMin, r.transitionMin, r.dureeMin]; }
        S.defRest = 130; const ref = __H.kcal(__H.seance(spec, mode));
        S.exRestPref = {}; spec.exs.forEach(([n]) => { S.exRestPref[n] = 300; }); const pref300 = __H.kcal(__H.seance(spec, mode));
        spec.exs.forEach(([n]) => { S.exRestPref[n] = 45; }); const pref45 = __H.kcal(__H.seance(spec, mode)); S.exRestPref = {};
        out[k][mode].prefIgnoree = ref.total === pref300.total && ref.total === pref45.total && ref.restMin === pref300.restMin;
        out[k][mode].ref = [ref.total, ref.restMin, ref.transitionMin]; out[k][mode].pref300 = [pref300.total, pref300.restMin]; out[k][mode].pref45 = [pref45.total, pref45.restMin];
      }
    }
    // Une interruption de 20 min (appel) au milieu de la séance A : chrono contre horodatage plafonné
    const sA = __H.seance(__H.TYPES.A_pecs_epaules, 'horodatage'); const tous = []; sA.exs.forEach(e => e.sets.forEach(s => tous.push(s)));
    const mid = Math.floor(tous.length / 2); for (let i = mid; i < tous.length; i++) tous[i].at += 1200; sA.duration += 1200;
    const avecAppel = __H.kcal(sA); const d = _dureeEffective(sA);
    const chronoSeul = JSON.parse(JSON.stringify(sA)); chronoSeul.exs.forEach(e => e.sets.forEach(s => delete s.at)); chronoSeul.exercises = chronoSeul.exs;
    S.defRest = 130;
    return { out, appel20min: { horodatage: [avecAppel.total, avecAppel.dureeMin, avecAppel.dureeSrc], coupeMin: Math.round(d.coupeSec / 60), spanMin: Math.round(d.spanSec / 60), plafondSec: d.plafondSec,
      chronoSeul: (r => [r.total, r.dureeMin, r.dureeSrc])(__H.kcal(chronoSeul)) },
      chronoReposAbdos: 'abdos : 30 s au chrono (log.js:1974) — le moteur compte reposDefaut() pour tout exercice' };
  },
  /* ④ LES FORMES DE PRATIQUE — la discipline du profil est-elle lue ? que changent reps et charge ? */
  async DISCIPLINES() {
    const RM = { 'Squat à la Barre':150, 'Développé Couché':100, 'Rowing Barre (Tirage Horizontal)':100, 'Développé Militaire':65, 'Développé Incliné Haltères':66,
      'Écarté Haltères':30, 'Élévations Latérales (Lateral Raise)':22, 'Extension Triceps':30, 'Press Jambes 45°':260, 'Tirage Poulie Haute (Lat Pulldown)':90,
      'Soulevé de Terre':180, 'Arraché Debout (Muscle Snatch)':60, 'Clean & Jerk':90, 'Squat Avant':120 };
    const PCT = { muscu: () => 0.72, bodybuilding: () => 0.72, powerbuilding: (l) => l.reps <= 6 ? 0.85 : 0.70, powerlifting: (l) => l.reps <= 5 ? 0.87 : 0.72, haltero: () => 0.80 };
    S.prs = {}; Object.keys(RM).forEach(k => { S.prs[k] = { rm1: RM[k] }; });
    const res = {};
    for (const d of Object.keys(DISC_SEANCE)) {
      const lignes = DISC_SEANCE[d];
      const exs = lignes.map(l => ({ name: l.n, sets: Array.from({ length: l.sets }, () => ({ kg: RM[l.n] ? Math.round(RM[l.n] * PCT[d](l) / 2.5) * 2.5 : 0, reps: l.reps, done: true, type: 'N' })) }));
      // horodatage : écart = repos de la ligne + durée de la série suivante ; 180 s entre deux exercices
      let t = 30, first = true; exs.forEach((ex, ei) => ex.sets.forEach((s, si) => { if (!first) t += (si === 0 ? 180 : lignes[ei].rest) + _secSerie(s, ex); s.at = t; first = false; }));
      const sess = { id: 1, ts: Date.now(), date: today(), uniConv: 1, exs, exercises: exs, duration: t + 120 };
      const r = __H.kcal(sess);
      const fixe = JSON.parse(JSON.stringify(sess)); fixe.exs.forEach(e => e.sets.forEach(s => delete s.at)); fixe.duration = 3600; fixe.durationDite = true; fixe.exercises = fixe.exs;
      const r60 = __H.kcal(fixe);
      // la même séance, avec chacune des 5 disciplines dans le profil
      const parDisc = {}; for (const dd of Object.keys(DISC_SEANCE).concat([''])) { S.discipline = dd; parDisc[dd || '(non renseignée)'] = __H.kcal(sess).total; }
      S.discipline = 'muscu';
      res[d] = { series: exs.reduce((a, e) => a + e.sets.length, 0), reps: lignes.map(l => l.sets + '×' + l.reps + ' @' + Math.round(PCT[d](l) * 100) + '% (repos ' + l.rest + ' s)'),
        duree: r.dureeMin, total: r.total, kcalParMin: +(r.total / r.dureeMin).toFixed(2), metImplicite: +(r.moteur / (S.bw * r.dureeMin / 60)).toFixed(2),
        a60minSaisies: r60.total, kcalParMinA60: +(r60.moteur / 60).toFixed(2), detail: __H.detail(sess), parDisciplineDuProfil: parDisc };
    }
    return { lu: 'S.discipline n\'apparaît dans aucune des fonctions du moteur (app.js:28-849)', res };
  },
  /* ⑥ HOMMES / FEMMES — le sexe entre-t-il dans le calcul de la séance ? */
  async SEXE() {
    __H.posePRs(true); const sA = () => __H.seance(__H.TYPES.A_pecs_epaules, 'horodatage');
    const r = {}; const cardio = { type: 'velo', duration: 20, intensity: 'modere' };
    for (const g of ['H', 'F']) for (const bw of [62, 82]) { S.gender = g; S.bw = bw; r[g + bw] = { seanceA: __H.kcal(sA()).total, cardio20minVelo: calcCardioKcal(cardio), bmr: calcBMR() }; }
    S.gender = 'H'; S.bw = 82;
    return { r, identiqueHF_memePoids: r.H82.seanceA === r.F82.seanceA && r.H62.seanceA === r.F62.seanceA && r.H82.cardio20minVelo === r.F82.cardio20minVelo,
      rapport62sur82: +(r.H62.seanceA / r.H82.seanceA).toFixed(4), rapportPoids: +(62 / 82).toFixed(4) };
  },
  /* ⑦ LES EXERCICES PERSONNALISÉS — le nom passe-t-il avant les muscles cochés ? */
  async PERSO() {
    const cas = [
      ['Rowing Zorglub', { p: ['quads'], s: [] }], ['Curl Maison Zorglub', { p: ['quads'], s: [] }], ['Squat Zorglub', { p: ['biceps'], s: [] }],
      ['Machin Bizarre', null], ['Machin Bizarre Trois', { p: ['quads', 'glutes'], s: ['hamstrings'] }], ['Spoto press', { p: ['pec'], s: ['triceps', 'front-delt'] }],
      ['Abdos sur tapis', null], ['Pompes sur tapis', { p: ['pec', 'triceps'], s: ['front-delt'] }], ['Gainage sur tapis', null], ['Étirements sur tapis', null],
      ['Hang Clean', null], ['Rameur', null], ['Oiseau assis', null], ['Élévations latérales assis', null], ['Presse Hack Machine X', null], ['Tirage Zorglub', { p: ['lats'], s: ['biceps'] }] ];
    S.customExercises = cas.map(([n, m]) => ({ n, g: 'Autres', custom: true, ...(m ? { muscles: m } : {}) }));
    const lignes = cas.map(([n, m]) => { const c = __H.chemin(n); return { nom: n, musclesCoches: m ? (m.p.join('+') + (m.s.length ? ' / ' + m.s.join('+') : '')) : '—', resolu: exNomCatalogue(n),
      sourceMuscles: __H.sourceMuscles(n).source, MET: getExerciseMET(n), chemin: c.chemin, etiquetteOK: c.met === getExerciseMET(n) }; });
    // impact sur une petite séance : 4 × 10 du perso, 45 min saisies
    const imp = {}; ['Rowing Zorglub', 'Abdos sur tapis', 'Machin Bizarre Trois'].forEach(n => {
      const s = { id: 1, ts: Date.now(), date: today(), uniConv: 1, duration: 2700, durationDite: true, exs: [{ name: n, sets: [1, 2, 3, 4].map(() => ({ kg: 40, reps: 10, done: true, type: 'N' })) }] }; s.exercises = s.exs;
      imp[n] = __H.kcal(s).total; });
    // abréviations : le nom est-il résolu avant la fiche ?
    const abr = ['Squat Barre', 'Hip Thrust Barre', 'Développé Couché', 'Developpe Couche', 'Oiseau', 'Face Pull', 'Élévations Latérales'].map(n => ({ n, resolu: exNomCatalogue(n), id: exId(exNomCatalogue(n)), MET: getExerciseMET(n), source: __H.sourceMuscles(n).source }));
    S.customExercises = [];
    return { lignes, impact45minSaisies: imp, abreviations: abr };
  },
  /* ⑨ (info) SENSIBILITÉ : quel poids pèsent le classement et le facteur de charge dans le total ? (simulation en page) */
  async SENSI() {
    __H.posePRs(true); const vrai = window.getExerciseMET, fc = window._facteurCharge; const out = {};
    for (const [k, spec] of Object.entries(__H.TYPES)) {
      const m = mode => __H.kcal(__H.seance(spec, mode)).total; const r = {};
      for (const mode of ['horodatage', 'saisie']) {
        r[mode] = { reel: m(mode) };
        window.getExerciseMET = () => 4.0; r[mode].tout4 = m(mode);
        window.getExerciseMET = () => 6.5; r[mode].tout6_5 = m(mode);
        window.getExerciseMET = vrai; window._facteurCharge = () => 1; r[mode].sansFacteurCharge = m(mode); window._facteurCharge = fc;
      }
      out[k] = r;
    }
    window.getExerciseMET = vrai; window._facteurCharge = fc;
    return out;
  },
  /* ⑤ (preuve) LA DÉCOMPOSITION EXACTE sur 400 séances ALÉATOIRES (graine fixe) */
  async DECOMP() {
    let seed = 20261024; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const noms = [...new Set(EXLIB.map(e => e.n))]; const pick = a => a[Math.floor(rnd() * a.length)];
    let maxErr = 0, nLong = 0, nCourt = 0; const parts = [], ecarts = [];
    for (let i = 0; i < 400; i++) {
      S.prs = {}; const exs = [];
      for (let e = 0, ne = 1 + Math.floor(rnd() * 7); e < ne; e++) { const n = pick(noms); if (rnd() < 0.6) S.prs[n] = { rm1: 40 + Math.round(rnd() * 160) };
        exs.push({ name: n, sets: Array.from({ length: 1 + Math.floor(rnd() * 6) }, () => ({ kg: Math.round(rnd() * 150), reps: Math.floor(rnd() * 21), done: true, type: rnd() < 0.2 ? 'É' : 'N' })) }); }
      const sess = { id: 1, ts: Date.now(), date: today(), uniConv: 1, exs, exercises: exs, duration: Math.round((5 + rnd() * 145) * 60) };
      if (rnd() < 0.3) sess.cardioAvant = { type: 'velo', duration: 10, intensity: 'modere' }; if (rnd() < 0.3) sess.cardio = { type: 'tapis', duration: 15, intensity: 'leger' };
      if (rnd() < 0.25) sess.durationDite = true;
      const c = calcSessionCalories(sess), bw = S.bw, rest = reposDefaut();
      let act = 0, restMin = 0, modelMin = 0, bonus = 0;
      exs.forEach(ex => { const d = ex.sets.filter(s => s.done); if (!d.length) return; const met = getExerciseMET(ex.name), rm1 = (S.prs[ex.name] && S.prs[ex.name].rm1) || 0;
        d.forEach(s => { const sec = _secSerie(s, ex), f = _facteurCharge(s.kg, rm1); act += met * f * bw * sec / 3600; bonus += (met * f - 3) * bw * sec / 3600; modelMin += sec / 60; });
        restMin += Math.max(0, d.length - 1) * rest / 60; });
      modelMin += restMin; const D = c.dureeMin, Dexact = (_dureeSeanceMin(sess, c.totalSets, modelMin) || {}).min, warm = 3.5 * bw * c.warmupMin / 60;
      let attendu;
      if (modelMin > 0 && Dexact > 0 && Dexact < modelMin) { nCourt++; attendu = (Dexact / modelMin) * (act + 3 * bw * restMin / 60) + warm; }
      else { nLong++; attendu = 3 * bw * Dexact / 60 + bonus + warm; parts.push(bonus / Math.max(1, c.total)); }
      const err = Math.abs(Math.round(attendu) - c.total); ecarts.push(err); if (err > maxErr) maxErr = err;
    }
    parts.sort((a, b) => a - b); const q = p => +(parts[Math.floor(p * (parts.length - 1))] * 100).toFixed(1);
    return { seances: 400, regimeLong: nLong, regimeCourt: nCourt, ecartMaxKcal: maxErr, ecartsNonNuls: ecarts.filter(e => e > 0).length,
      partDuBonusActifDansLeTotal_pourcent: { p10: q(0.1), mediane: q(0.5), p90: q(0.9) } };
  },
  /* K4–K7 de harnais3.js, recopiés À L'IDENTIQUE (pour dire si les mesures du 23/10 tiennent) */
  async K4() {
    const sess = (dur) => ({ id: 1, ts: Date.now(), date: today(), uniConv: 1, duration: dur, exs: [{ name: 'Squat Barre', sets: [1, 2, 3, 4, 5, 6].map(() => ({ kg: 100, reps: 5, done: true, type: 'N' })) },
      { name: 'Développé Couché', sets: [1, 2, 3, 4, 5, 6].map(() => ({ kg: 80, reps: 8, done: true, type: 'N' })) }] });
    const lire = (dur) => { const c = calcSessionCalories(sess(dur)); return [c.total, c.restMin, c.transitionMin]; };
    const r = {};
    for (const rep of [60, 130, 240]) { S.defRest = rep; r['repos' + rep] = { '60min': lire(3600), '20min': lire(1200) }; }
    S.defRest = 130; const ref = lire(3600);
    S.exRestPref = { 'Squat Barre': 300, 'Développé Couché': 45 }; const avecPref = lire(3600);
    S.exRestPref = {};
    return { r, prefIgnoree: JSON.stringify(ref) === JSON.stringify(avecPref), ref, avecPref, MET_REST: typeof MET_REST !== 'undefined' ? MET_REST : null, MET_TRANSITION: typeof MET_TRANSITION !== 'undefined' ? MET_TRANSITION : null };
  },
  async K5() {
    const n = ['Oiseau', 'Élévations Latérales', 'Face Pull', 'Curl Haltères', 'Développé Couché'];
    return n.map(x => ({ nom: x, existe: !!exMuscles(exNomCatalogue(x)), muscles: exMuscles(exNomCatalogue(x)), MET: getExerciseMET(x) }));
  },
  async K6() {
    const base = { id: 1, ts: Date.now(), date: today(), uniConv: 1, duration: 3600, exs: [{ name: 'Squat Barre', sets: [1, 2, 3, 4, 5, 6].map(() => ({ kg: 100, reps: 5, done: true, type: 'N' })) },
      { name: 'Développé Couché', sets: [1, 2, 3, 4, 5, 6].map(() => ({ kg: 80, reps: 8, done: true, type: 'N' })) }] };
    const c0 = calcSessionCalories(base);
    const c1 = calcSessionCalories(Object.assign({}, base, { cardioAvant: { type: 'velo', duration: 10, intensity: 'moderee' } }));
    const c2 = calcSessionCalories(Object.assign({}, base, { cardioAvant: { type: 'velo', duration: 10, intensity: 'moderee' }, cardio: { type: 'velo', duration: 10, intensity: 'moderee' } }));
    const c3 = calcSessionCalories(Object.assign({}, base, { durationDite: true }));
    const k = c => ({ total: c.total, warmupMin: c.warmupMin, transitionMin: c.transitionMin, totalMin: c.totalMin, dureeMin: c.dureeMin });
    return { sansCardio: k(c0), cardioAvant: k(c1), avantEtApres: k(c2), dureeSaisie: k(c3) };
  },
  async K7() {
    const ex = [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }];
    const v = [];
    for (const d of [0, undefined, 36000]) v.push(calcSessionCalories({ id: 1, date: today(), exs: ex, duration: d }).total);
    const bw = S.bw; S.bw = 0; v.push(calcSessionCalories({ id: 1, date: today(), exs: ex, duration: 1800 }).total); S.bw = bw;
    v.push(calcSessionCalories({ id: 1, date: today(), exs: [], cardio: { type: 'velo', duration: 20, intensity: 'moderee' }, duration: 1200 }).total);
    return { valeurs: v, toutesFinies: v.every(x => typeof x === 'number' && isFinite(x)) };
  },
  /* ⑧ CE QUE L'ÉCRAN MONTRE : le détail d'une séance affiche-t-il deux chiffres de calories ? (vraies fonctions d'écran) */
  async AFFICHAGE() {
    __H.posePRs(true); const out = {};
    for (const [k, spec] of Object.entries(__H.TYPES)) {
      const s = __H.seance(spec, 'horodatage'); const T = Date.now() - 864e5; s.id = T; s.ts = T; s.date = today(T);
      const c = calcSessionCalories(s); s.calories = c.total; s.calData = c; S.sessions = [s]; persist();
      openSessDetail(T); const sub = ((document.getElementById('sd-sub') || {}).textContent || '').replace(/\s+/g, ' ').trim(); closeSessDetail();
      renderSessions(); const carte = [...document.querySelectorAll('[onclick*="openSessDetail"]')].map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(t => /kcal/.test(t)).slice(0, 1);
      out[k] = { stocke: s.calories, detail: sub, carte };
    }
    return out;
  },
  /* ⑤ (cas limites de durée) validation groupée en fin de séance · cardio d'APRÈS compris dans le chrono */
  async DUREES_CAS() {
    __H.posePRs(true); const A = __H.TYPES.A_pecs_epaules; const r = {};
    // 1. séries toutes cochées dans la dernière minute (chrono 60 min juste)
    const g = __H.seance(A, 'chrono'); let t = 3540; g.exs.forEach(e => e.sets.forEach(s => { s.at = t; t += 2; })); g.duration = 3600;
    const kg = __H.kcal(g); r.validationGroupee = { total: kg.total, dureeMin: kg.dureeMin, dureeSrc: kg.dureeSrc, chronoMin: 60 };
    const ref = __H.kcal(__H.seance(A, 'chrono')); r.memeSeanceChronoSeul = { total: ref.total, dureeMin: ref.dureeMin };
    // 1 bis. variante réaliste : la 1ʳᵉ série cochée au début (elle démarre le chrono), les 21 autres dans la dernière minute
    const g2 = __H.seance(A, 'chrono'); let t2 = 3540, prem = true; g2.exs.forEach(e => e.sets.forEach(s => { if (prem) { s.at = 0; prem = false; } else { s.at = t2; t2 += 3; } })); g2.duration = 3600;
    const kg2 = __H.kcal(g2), d2 = _dureeEffective(g2);
    r.validationGroupeeRealiste = { total: kg2.total, dureeMin: kg2.dureeMin, dureeSrc: kg2.dureeSrc, actifSec: d2 && d2.actifSec, douteuseSelonEcran: _dureeDouteuse(g2), effectifsAffiches: !!(d2 && d2.actifSec > 60) };
    // 2. cardio de fin (tapis 15 min, modéré) : chrono SEUL (il court jusqu'à « Terminer », donc le contient) contre horodatage
    const cardio = { type: 'tapis', duration: 15, intensity: 'modere' };
    const c1 = __H.seance(A, 'chrono', { cardio }); c1.duration = (60 + 15) * 60; const k1 = __H.kcal(c1);
    const c2 = __H.seance(A, 'horodatage', { cardio }); c2.duration = (60 + 15) * 60 + 120; const k2 = __H.kcal(c2);
    r.cardioApres = { chronoSeul: { total: k1.total, moteur: k1.moteur, cardio: k1.cardio, dureeMin: k1.dureeMin, transitionMin: k1.transitionMin, warmupMin: k1.warmupMin },
      horodatage: { total: k2.total, moteur: k2.moteur, cardio: k2.cardio, dureeMin: k2.dureeMin, transitionMin: k2.transitionMin, warmupMin: k2.warmupMin },
      affichageDureeTotale: { chrono: _dureeTotaleMin(c1, 22, 0), horodatage: _dureeTotaleMin(c2, 22, 0) } };
    // 3. cardio seul (20 min de vélo modéré), comme finishWorkout l'enregistre
    const co = { id: 1, ts: Date.now(), date: today(), uniConv: 1, exs: [], exercises: [], duration: 1200, cardio: { type: 'velo', duration: 20, intensity: 'modere' } };
    const kco = __H.kcal(co); r.cardioSeul = { total: kco.total, moteur: kco.moteur, cardio: kco.cardio, warmupMin: kco.warmupMin };
    return r;
  },
  /* ④ DENSITÉ : les MÊMES séries faites en plus ou moins de temps (supersets / repos courts ↔ repos longs) */
  async DENSITE() {
    __H.posePRs(true); const out = {};
    for (const k of ['A_pecs_epaules', 'B_jambes']) {
      out[k] = {};
      for (const m of [25, 30, 35, 45, 60, 75, 90, 120]) {
        const s = __H.seance(__H.TYPES[k], 'horodatage', { cibleMin: m }); const r = __H.kcal(s);
        out[k][m] = { total: r.total, dureeMin: r.dureeMin, kcalParMinSansForfait: +((r.moteur - 3.5 * S.bw * r.warmupMin / 60) / r.dureeMin).toFixed(2),
          metSeanceSansForfait: +((r.moteur - 3.5 * S.bw * r.warmupMin / 60) / (S.bw * r.dureeMin / 60)).toFixed(2), transitionMin: r.transitionMin };
      }
    }
    return out;
  },
  /* ⑨ (interaction) corriger la DURÉE d'une séance par ⏱️ (vraie fonction editSessDuree) : 60 → 60 (confirmer) et 60 → 90 */
  async EDIT_DUREE() {
    __H.posePRs(true); const out = {};
    for (const rep of ['60', '90']) {
      const s = __H.seance(__H.TYPES.A_pecs_epaules, 'chrono'); const T = Date.now() - 2 * 864e5; s.id = T; s.ts = T; s.date = today(T);
      const c = calcSessionCalories(s); s.calories = c.total; s.calData = c; S.sessions = [s]; persist();
      openSessDetail(T); window.prompt = () => rep; editSessDuree(); closeSessDetail();
      const st = JSON.parse(localStorage.getItem('ft4_sessions'))[0];
      out['60→' + rep] = { avant: c.total, apres: st.calories, durationDite: !!st.durationDite, duree: st.duration };
    }
    return out;
  },
  /* L'empreinte des constantes du moteur, lues dans la page (pour la table du point ②) */
  async CONSTANTES() {
    return { MET_LOWER, MET_UPPER, MET_OLYMPIC, MET_CARDIO, MET_ISO, MET_REST, MET_TRANSITION, CAL_ENGINE, MET_MUSCU_MODERE, SEC_INSTALLATION, SEC_PAR_REP, SEC_SERIE_MAX, SEC_SERIE_DEFAUT,
      TEMPO_MIN, TEMPO_MAX, CHARGE_NEUTRE, CHARGE_PENTE, CHARGE_MIN, CHARGE_MAX, REPOS_DEFAUT, reposDefaut: reposDefaut(), CARDIO_MET, OLYMPIC_KW, CARDIO_KW, _MET_REGIONS,
      secSerie: [0, 1, 3, 5, 8, 10, 12, 15, 20, 30, 45, 60, 100].map(r => [r, _secSerie({ reps: r })]),
      facteurCharge: [0.3, 0.5, 0.6, 0.65, 0.72, 0.8, 0.85, 0.9, 1.0, 1.1, 1.5, 2.5].map(p => [p, +_facteurCharge(p * 100, 100).toFixed(4)]),
      classeRepos: [1, 5, 6, 12, 13, 20].map(r => [r, _classeRepos(r)]),
      tempo: ['tempo 3-1-2', '3 sec descente, 2 sec contraction', 'descente 3 s', 'repos 90 sec', 'descente 3 sec, repos 90 sec', 'monte 3 sec, bloque 3 sec, descends 3 sec'].map(t => [t, _tempoSec(t)]) };
  },
};

(async () => {
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [nom, fn] of Object.entries(SCEN)) {
    if (SEUL && !SEUL.includes(nom)) continue;
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_a'))return; sessionStorage.setItem('_a','1'); localStorage.clear(); const D=${JSON.stringify(BASE)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); }catch(e){} })();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
    await pg.goto('http://localhost:' + srv.address().port + '/index.html'); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); window.__T = []; window.toast = (m) => { window.__T.push(String(m)); }; });
    await pg.evaluate(`(${HELPERS.toString()})()`);
    let res;
    try { res = await pg.evaluate(`(${fn.toString().replace(/^async\s+\w+\s*\(/, 'async function(')})()`); }
    catch (e) { res = { PLANTAGE: String(e.message).slice(0, 400) }; }
    const ligne = { scenario: nom, arbre: ROOT, res, errs };
    fs.writeFileSync(path.join(OUT, nom + '.json'), JSON.stringify(ligne, null, 1));
    console.log(JSON.stringify({ scenario: nom, ok: !res.PLANTAGE, errs: errs.length, apercu: JSON.stringify(res).slice(0, 300) }));
    await cx.close();
  }
  await b.close(); srv.close();
})().catch(e => { console.log('PLANTAGE ' + e.message); process.exit(2); });
