#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════════════
   🧪 BANC MILO R34 — CE QUE MILO FAIT DU NIVEAU D'ACTIVITÉ, AVANT / APRÈS (25/09/2026)

   Autorisé par Michel : un PETIT banc réel, plafonné à 5 € et 20 appels, pour vérifier que
   B1 (activité jamais choisie ≠ 1,55) et D-021 (ancien 1,55 « à confirmer ») ne font pas
   dire de bêtises à Milo. ⛔ Ce n'est PAS le banc EV (`eval.js`) : ici, pas de persona
   (`_vcApplyPersona` écrase l'activité par la chaîne 'modéré') — le profil est posé par le
   VRAI chargement (`localStorage → load()`), puis Milo est appelé par `_vcAsk`, le chemin
   réseau de l'app elle-même (jeton S1 compris).

   ⚠️⚠️ L'ORIGINE, ET POURQUOI CE N'EST PAS UNE PORTE DÉROBÉE. Le Worker n'accepte QUE
   `https://michdu75-commits.github.io` (worker.js). Le code de la BRANCHE n'est pas publié :
   pour le mesurer, Playwright sert les fichiers de la branche À CETTE ADRESSE, dans le
   navigateur de test uniquement. Le Worker vérifie le jeton S1 exactement comme pour tout
   le monde (contrôle principal) ; l'origine n'est qu'un contrôle secondaire anti-site-tiers.
   Rien n'est ouvert : c'est l'app, avec le badge du banc, depuis un navigateur de test.

   ⛔ GARDE-FOUS :
     · AUCUN e-mail dans le profil, et Apps Script + Supabase BLOQUÉS : la page ne peut ni
       restaurer ni écraser un profil cloud (le profil de test est synthétique) ;
     · un COMPTEUR d'appels dans la page : au-delà du plafond, `fetch` refuse ;
     · devis AVANT tout appel (contexte réel mesuré, estimation prudente) → refus si > 5 € ;
     · séquentiel ; `_vcAsk` refait UNE tentative en cas d'échec technique (le retry autorisé),
       rien de plus ; une mauvaise réponse n'est jamais rejouée.
   ⛔ Sans `--go` : À BLANC (0 appel, 0 €).

   Usage : node tests/milo/r34_banc.js [--go] [--avant <racine de l'arbre AVANT>]
   ══════════════════════════════════════════════════════════════════════════════════════ */
const fs = require('fs'), path = require('path');
const { chargerPlaywright } = require('../_playwright.js');
const _pw = chargerPlaywright();
const chromium = _pw.pw.chromium;
/* Même règle que `eval.js` : le navigateur du conteneur s'il existe, sinon celui que Playwright a installé (runner). */
const execPath = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome']
  .find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
const ARGV = process.argv.slice(2);
const GO = ARGV.includes('--go');
const AVANT = (() => { const i = ARGV.indexOf('--avant'); return i >= 0 ? path.resolve(ARGV[i + 1]) : ''; })();
const APRES = path.resolve(__dirname, '..', '..');
/* --cas R34-A,R34-B : ne jouer QUE ces cas (micro-banc). Validé strictement : identifiants connus seulement. */
const CAS_ARG = (() => { const i = ARGV.indexOf('--cas'); return i >= 0 ? String(ARGV[i + 1] || '') : String(process.env.R34_CAS || ''); })().trim();
const ORIGINE = 'https://michdu75-commits.github.io';
const BASE_URL = ORIGINE + '/forcetracker/';
/* Plafond d'appels réglable par R34_PLAFOND_APPELS (jamais au-dessus de 20) : un micro-banc de
   Michel peut exiger « 4 au total, retries compris » — le retry n'a alors lieu que dans ce budget. */
const PLAFOND_APPELS = Math.max(1, Math.min(20, parseInt(process.env.R34_PLAFOND_APPELS || '20', 10) || 20)), PLAFOND_EUR = 5;
/* Tarif vérifié (grille Anthropic du 24/06/2026) : claude-sonnet-4-6 = 3 $/M entrée, 15 $/M sortie.
   PRUDENT : toute l'entrée comptée au prix d'une ÉCRITURE de cache 1 h (2× → 6 $/M), la sortie au
   plafond du Worker (max_tokens 1024), 3 caractères par token, et 1 $ compté comme 1 €. */
const PRIX = { entree: 6 / 1e6, sortie: 15 / 1e6, maxSortie: 1024, carParToken: 3 };
const BANC_TOKEN = String(process.env.FT_BANC_TOKEN || '').trim();
const FT_TOKEN_KEY = (/FT_TOKEN_KEY\s*=\s*'([^']+)'/.exec(fs.readFileSync(path.join(APRES, 'constants.js'), 'utf8')) || [])[1];
if (!FT_TOKEN_KEY) { console.error('⛔ FT_TOKEN_KEY introuvable dans constants.js'); process.exit(2); }
if (GO && BANC_TOKEN.length !== 64) { console.error('⛔ FT_BANC_TOKEN absent ou mal formé (' + BANC_TOKEN.length + ' car., 64 attendus) — refus AVANT toute dépense.'); process.exit(2); }

/* Profil SYNTHÉTIQUE (pas celui de Michel) : les réponses peuvent finir dans un journal public. */
const PROFIL = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_work: 'bureau',
                 ft4_goal: 'force', ft4_nphase: 'charge', ft4_ob2: '1', ft4_name: 'Test' };
const QUESTION = 'Combien de calories je dois manger par jour, et sur quel niveau d\'activité tu te bases pour le calculer ?';
const CAS = [
  { id: 'R34-A', arbre: 'apres', titre: 'activité absente', ls: {} },
  { id: 'R34-B', arbre: 'apres', titre: '1,55 choisi', ls: { ft4_act: '1.55', ft4_act_src: 'choisi' } },
  { id: 'R34-C', arbre: 'apres', titre: '1,725 choisi', ls: { ft4_act: '1.725', ft4_act_src: 'choisi' } },
  { id: 'R34-D', arbre: 'apres', titre: 'ancien 1,55 non confirmé', ls: { ft4_act: '1.55' } },
  { id: 'R34-E', arbre: 'apres', titre: 'ancien 1,55 puis Confirmer', ls: { ft4_act: '1.55' }, confirmer: true },
  /* AVANT (arbre d'avant B1) : les cas A, B, D, E y avaient TOUS le même contexte (« 1.55 »
     d'office) — un seul appel les couvre ; C a le sien. */
  /* CONTRAT FT → MILO (25/09) : un programme STRUCTURÉ + des performances réalisées. La question
     demande l'analyse du programme ET des performances : Milo doit distinguer le prévu, le
     réalisé et ce que l'app ne sait pas (actif, phase, progression, RIR cible). */
  { id: 'CTR-PROG', arbre: 'apres', titre: 'programme structuré + performances', ls: { ft4_act: '1.55', ft4_act_src: 'choisi' },
    question: 'Analyse mon programme actuel ET mes performances qui en découlent.',
    prep: "S.programmes=[{id:'p1',name:'Bloc 1 V2',weeks:8,startDate:'2026-09-01',days:["
      + "{label:'Push',exs:[{name:'Développé Couché',sets:[{kg:90,reps:6},{kg:90,reps:6},{kg:90,reps:6}]},{name:'Développé Militaire',sets:[{kg:50,reps:8},{kg:50,reps:8}]}]},"
      + "{label:'Pull',exs:[{name:'Soulevé de Terre',sets:[{kg:140,reps:5},{kg:140,reps:5}]},{name:'Tractions',sets:[{reps:8},{reps:8},{reps:8}]}]}]}];"
      + "S.sessions=[{id:1,date:'2026-09-15',progLabel:'Push',exs:[{name:'Développé Couché',sets:[{kg:87.5,reps:6,done:true},{kg:87.5,reps:6,done:true},{kg:87.5,reps:5,done:true}]}]},"
      + "{id:2,date:'2026-09-17',progLabel:'Pull',exs:[{name:'Soulevé de Terre',sets:[{kg:140,reps:5,done:true},{kg:140,reps:4,done:true}]}]},"
      + "{id:3,date:'2026-09-19',progLabel:'Push',exs:[{name:'Développé Couché',sets:[{kg:90,reps:6,done:true},{kg:90,reps:5,done:true},{kg:90,reps:5,done:true}]}]}];" },
  { id: 'AVANT-155', arbre: 'avant', titre: 'avant B1 : 1,55 (couvre A, B, D, E)', ls: { ft4_act: '1.55' } },
  { id: 'AVANT-1725', arbre: 'avant', titre: 'avant B1 : 1,725 (couvre C)', ls: { ft4_act: '1.725' } },
];
/* ⛔ PREUVE DE COUVERTURE (à blanc) : un appel AVANT n'en remplace plusieurs QUE si l'arbre
   d'avant construisait, pour chacun, un contexte IDENTIQUE octet pour octet. Sinon : refus. */
if (CAS_ARG) {
  if (!/^[A-Z0-9-]+(,[A-Z0-9-]+)*$/.test(CAS_ARG)) { console.error('⛔ --cas illisible : ' + CAS_ARG); process.exit(2); }
  const voulus = CAS_ARG.split(',');
  const inconnus = voulus.filter(v => !CAS.some(c => c.id === v));
  if (inconnus.length) { console.error('⛔ cas inconnus : ' + inconnus.join(', ')); process.exit(2); }
  for (let i = CAS.length - 1; i >= 0; i--) if (voulus.indexOf(CAS[i].id) < 0) CAS.splice(i, 1);
}
const COUVERTURE = {
  'AVANT-155': [ { id: 'avant/A', arbre: 'avant', ls: {} }, { id: 'avant/B', arbre: 'avant', ls: { ft4_act: '1.55', ft4_act_src: 'choisi' } },
                 { id: 'avant/D', arbre: 'avant', ls: { ft4_act: '1.55' } }, { id: 'avant/E', arbre: 'avant', ls: { ft4_act: '1.55' }, confirmer: true } ],
  'AVANT-1725': [ { id: 'avant/C', arbre: 'avant', ls: { ft4_act: '1.725', ft4_act_src: 'choisi' } } ],
};
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.ico': 'image/x-icon', '.wasm': 'application/wasm', '.webmanifest': 'application/manifest+json' };

/* UNE seule fonction joue un cas. `go=false` → À BLANC : le Worker est BLOQUÉ au niveau du
   navigateur (route abort) ET le jeton n'est pas posé — aucun appel possible, même par erreur.
   `restant` = appels autorisés pour CE cas (≤ 2 : 1 essai + le 1 retry technique de `_vcAsk`). */
async function jouer(nav, cas, go, restant) {
  const ROOT = cas.arbre === 'avant' ? AVANT : APRES;
  const ctx = await nav.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  /* ⛔ Aucun appel vers Apps Script ni Supabase : pas de restauration, pas d'écriture cloud. */
  await ctx.route(/script\.google\.com|supabase\.co/, r => r.abort());
  const bloques = [];
  if (!go) await ctx.route(/workers\.dev/, r => { bloques.push(r.request().url()); return r.abort(); });
  /* Les fichiers de l'arbre choisi, servis à l'adresse de l'app. */
  await ctx.route(BASE_URL + '**', r => {
    let p = decodeURIComponent(new URL(r.request().url()).pathname.replace(/^\/forcetracker\/?/, ''));
    if (!p) p = 'index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ status: 404, body: '404' });
    return r.fulfill({ status: 200, contentType: MIME[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) });
  });
  await ctx.addInitScript(({ ls, tok, cle, restant }) => {
    const F = new Date('2026-09-20T12:00:00'); const V = Date;
    window.Date = class extends V { constructor(...a) { if (a.length) super(...a); else super(F.getTime()); } static now() { return F.getTime(); } };
    if (!sessionStorage.getItem('_r34')) {
      sessionStorage.setItem('_r34', '1');
      localStorage.clear();
      Object.keys(ls).forEach(k => localStorage.setItem(k, ls[k]));
      if (tok) localStorage.setItem(cle, tok);
    }
    /* ⛔ LE COMPTEUR : TOUT appel vers le Worker IA est compté (démarrage compris) ; au-delà, refus. */
    window.__appelsIA = 0; window.__urlsIA = []; const f0 = window.fetch;
    window.fetch = function (u, o) {
      const url = String((u && u.url) || u || '');
      if (/workers\.dev/.test(url)) {
        let act = ''; try { act = JSON.parse((o && o.body) || '{}').action || ''; } catch (e) {}
        window.__urlsIA.push(act || '?');
        if (window.__appelsIA >= restant) return Promise.reject(new Error('PLAFOND D\'APPELS ATTEINT'));
        window.__appelsIA++;
      }
      return f0.apply(this, arguments);
    };
  }, { ls: Object.assign({}, PROFIL, cas.ls), tok: go ? BANC_TOKEN : '', cle: FT_TOKEN_KEY, restant: go ? restant : 0 });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE_URL + 'index.html'); await page.waitForTimeout(2500);
  const r = await page.evaluate(async ({ q, go, confirmer, prep }) => {
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    window._cloudSync = () => {}; window._cloudSyncDebounced = () => {};
    const demarrage = window.__urlsIA.slice();
    if (confirmer && typeof confirmerActivite === 'function') confirmerActivite();
    if (prep) (new Function(prep))();
    const ctx = String(buildCoachContext(q));
    const ligne = ((ctx.match(/Niveau activité sportive: [^|]*/) || [''])[0]).trim();
    const tdee = ((ctx.match(/TDEE: [^ |\n]*/) || [''])[0]);
    const cible = ((ctx.match(/Calories cible: [^|\n]*/) || [''])[0]).trim();
    const etat = (typeof etatActivite === 'function') ? etatActivite() : '(arbre sans D-021)';
    const src = (typeof S !== 'undefined') ? { act: S.activityLevel, src: S.activitySrc === undefined ? '(champ absent)' : S.activitySrc, email: S.email || '' } : {};
    if (!go) return { blanc: true, car: ctx.length, ctxTexte: ctx, ligne, tdee, cible, etat, src, demarrage, appels: window.__appelsIA, urls: window.__urlsIA.slice() };
    const a = await _vcAsk({ scenario: q, coachEmail: '' });
    return { car: ctx.length, ligne, tdee, cible, etat, src, demarrage, ok: !!a.ok, kind: a.kind, err: a.err || '', status: a.status || 0,
             modele: a.modele || '', ms: a.ms || 0, reply: a.reply || '', appels: window.__appelsIA, urls: window.__urlsIA.slice() };
  }, { q: cas.question || QUESTION, go, confirmer: !!cas.confirmer, prep: cas.prep || '' });
  r.errs = errs.slice(0, 3); r.bloques = bloques;
  if (r.ctxTexte != null) { r.empreinte = require('crypto').createHash('sha256').update(r.ctxTexte).digest('hex').slice(0, 16); delete r.ctxTexte; }
  await ctx.close();
  return r;
}

/* Indicateurs CODÉS (pas un juge) : ils orientent la lecture humaine, ils ne la remplacent pas. */
function indicateurs(id, rep) {
  const t = String(rep || '').toLowerCase();
  const nomme155 = /modéré|3-4 ?j|1[.,]55/.test(t), nomme1725 = /actif \(5|5-6 ?j|1[.,]725/.test(t);
  const demandeConf = /confirm|vérifi|à jour|toujours d'actualit|est-ce (bien|toujours)|par défaut/.test(t);
  const pasRenseigne = /pas (encore )?(renseign|indiqu|choisi|défini)|non renseign|manque|il me faut|je n'ai pas (ton|de)|inconnu/.test(t);
  switch (id) {
    case 'R34-A': {
      /* D-022 : AUCUN chiffre de TDEE/cible/fourchette. Tout nombre de 1 800 à 4 500 (hors le BMR 1 718, autorisé)
         est compté comme un chiffre calorique dépendant de l'activité ; « disons / supposons » aussi. */
      const nombres = (t.replace(/(\d)[\s\u202f\u00a0.](?=\d{3}\b)/g, '$1').match(/\d{4}/g) || []).map(Number)
        .filter(n => n >= 1800 && n <= 4500 && n !== 1718);
      const scenario = /disons|supposons|en supposant|par hypoth|si tu fais \d/.test(t);
      /* D-024 : TOUTE quantité en kcal autre que le BMR (1 718), écarts et ordres de grandeur compris
         (« l'écart peut dépasser 500 kcal »), et tout multiple/pourcentage du BMR. */
      const kcal = (t.replace(/(\d)[\s\u202f\u00a0.](?=\d{3}\b)/g, '$1').match(/\d+\s*(?:kcal|calories)/g) || [])
        .map(x => parseInt(x, 10)).filter(n => n !== 1718);
      const multiple = /fois (ton|le|ta) (bmr|métabolisme)|\d+\s*%\s*(de plus|en plus|au-dessus|de ton bmr)/.test(t);
      const demande = /combien de (séances|fois)|séances? par semaine|\/sem|par semaine/.test(t);
      return { attendu: 'D-022/D-024 : dit que l\'activité manque, DEMANDE, aucun TDEE/cible/fourchette/ordre de grandeur/écart en kcal (BMR permis)', ok: pasRenseigne && demande && !nombres.length && !scenario && !kcal.length && !multiple,
               pasRenseigne, demande, nombresCaloriques: nombres, scenario, kcalHorsBMR: kcal, multipleBMR: multiple };
    }
    case 'CTR-PROG': {
      const jours = /push/.test(t) && /pull/.test(t);
      const perf = /87[,.]5|90 ?kg|140 ?kg/.test(t);
      const manque = /progression|phase|rir|actif|version|semaine (en cours|actuelle)|ne (sais|connais) pas|pas (d'|de )?info/.test(t);
      const invente = /semaine \d+ ?(\/|sur) ?8/.test(t);
      return { attendu: 'contrat : distingue le PRÉVU (Push/Pull), le RÉALISÉ (charges), et ce que l\'app ne sait pas ; n\'invente pas la semaine en cours', ok: jours && perf && manque && !invente, jours, perf, manque, invente };
    }
    case 'R34-B': case 'R34-E': { const chiffres = /2[\s\u202f\u00a0.]?663/.test(t) && /2[\s\u202f\u00a0.]?963/.test(t);
      /* R8 (contrat FT → Milo) : l'objectif (+200) ET la phase (+100) sont cités ; plus de « 2663 + 100 = 2963 ». */
      const r8 = /\+ ?200|200 kcal/.test(t) && /\+ ?100|100 kcal/.test(t) && !/2[\s\u202f\u00a0.]?663 ?\+ ?100 ?= ?2[\s\u202f\u00a0.]?963/.test(t);
      return { attendu: 'se base sur Modéré (3-4j) comme un choix, chiffres normaux (2 663 / 2 963), sans redemander confirmation', ok: nomme155 && !demandeConf && chiffres && r8, r8, nomme155, demandeConf, chiffres }; }
    case 'R34-C': return { attendu: 'reprend Actif (5-6j) exactement', ok: nomme1725 && !/modéré/.test(t), nomme1725 };
    case 'R34-D': return { attendu: 'signale que le niveau est à confirmer, ne le présente pas comme un choix certain', ok: demandeConf && !/tu as choisi|tu as (indiqué|sélectionné)/.test(t), demandeConf };
    default: return { attendu: 'référence AVANT (pas de verdict)', ok: null, nomme155, nomme1725, demandeConf, pasRenseigne };
  }
}

function fin(rapport, nav, code) {
  fs.writeFileSync(path.join(__dirname, 'r34-report.json'), JSON.stringify(rapport, null, 1));
  nav.close().then(() => process.exit(code));
}

(async () => {
  if (CAS.some(c => c.arbre === 'avant') && !AVANT) { console.error('⛔ --avant <racine> requis (arbre d\'avant B1).'); process.exit(2); }
  if (AVANT && !fs.existsSync(path.join(AVANT, 'index.html'))) { console.error('⛔ arbre AVANT introuvable : ' + AVANT); process.exit(2); }
  const nav = await chromium.launch(execPath ? { executablePath: execPath } : {});
  /* ① DEVIS — contexte RÉEL mesuré, 0 appel (Worker bloqué, pas de jeton). */
  const devis = [];
  for (const c of CAS) devis.push(Object.assign({ id: c.id }, await jouer(nav, c, false, 0)));
  const couverture = [];
  for (const [ref, liste] of Object.entries(COUVERTURE)) {
    if (!devis.some(d => d.id === ref)) continue;   // référence AVANT non jouée (micro-banc)
    const e0 = devis.find(d => d.id === ref).empreinte;
    for (const c of liste) { const r = await jouer(nav, c, false, 0); couverture.push({ ref, id: c.id, identique: r.empreinte === e0, empreinte: r.empreinte, ligne: r.ligne }); devis.push(Object.assign({ id: c.id, couverture: true }, r)); }
  }
  const fuites = devis.filter(d => d.appels || d.bloques.length || d.demarrage.length);
  for (let i = devis.length - 1; i >= 0; i--) if (devis[i].couverture) devis.splice(i, 1);
  let maxUsd = 0;
  devis.forEach(d => { const tin = Math.ceil((d.car + QUESTION.length) / PRIX.carParToken);
    d.maxUsdAppel = tin * PRIX.entree + PRIX.maxSortie * PRIX.sortie; maxUsd += 2 * d.maxUsdAppel; });
  const maxAppels = Math.min(2 * CAS.length, PLAFOND_APPELS);
  console.log('════ DEVIS (0 appel) ════  après = ' + (process.env.GITHUB_SHA || '(local)') + ' · avant = ' + (process.env.R34_AVANT_SHA || AVANT));
  devis.forEach(d => console.log(`  ${d.id.padEnd(11)} ${String(d.car).padStart(6)} car. · ${d.empreinte} · état ${d.etat} · S=${JSON.stringify(d.src)} · « ${d.ligne} » · ${d.tdee} · ${d.cible} · max ${d.maxUsdAppel.toFixed(3)} $/appel${d.errs.length ? ' · ERREURS PAGE ' + JSON.stringify(d.errs) : ''}`));
  console.log(`  appels : ${CAS.length} prévus, ${maxAppels} au maximum (1 retry par scénario, dans le plafond) — plafond ${PLAFOND_APPELS}`);
  console.log(`  coût maximal prudent : ${maxUsd.toFixed(2)} $ (compté comme ${maxUsd.toFixed(2)} €, 1 $ = 1 €) — plafond ${PLAFOND_EUR} €`);
  couverture.forEach(c => console.log(`  couverture ${c.ref} ⊇ ${c.id} : ${c.identique ? 'contexte IDENTIQUE' : 'DIFFÉRENT'} (${c.empreinte}) · « ${c.ligne} »`));
  console.log(`  appels au Worker tentés pendant le devis : ${fuites.length ? 'OUI ' + JSON.stringify(fuites.map(d => [d.id, d.demarrage, d.bloques])) : 'aucun'}`);
  let shaApres = process.env.GITHUB_SHA || '';
  if (!shaApres) { try { shaApres = require('child_process').execSync('git rev-parse HEAD', { cwd: APRES }).toString().trim(); } catch (e) {} }
  const rapport = { date: '2026-09-25', go: GO, shaApres, shaAvant: process.env.R34_AVANT_SHA || '(arbre fourni par --avant)', avant: AVANT, question: QUESTION, profil: 'synthétique H 40 a 178 cm 80 kg force charge bureau, sans e-mail',
                    couverture,
                    devis: devis.map(d => ({ id: d.id, car: d.car, empreinte: d.empreinte, etat: d.etat, src: d.src, ligne: d.ligne, tdee: d.tdee, cible: d.cible, maxUsdAppel: +d.maxUsdAppel.toFixed(4), errs: d.errs })),
                    maxUsd: +maxUsd.toFixed(4), maxAppels, resultats: [] };
  if (CAS.length > PLAFOND_APPELS || maxUsd > PLAFOND_EUR) {
    console.error('⛔ DEVIS HORS PLAFOND — BANC NON LANCÉ.'); rapport.refus = 'devis'; return fin(rapport, nav, 3);
  }
  if (couverture.some(c => !c.identique)) { console.error('⛔ un appel AVANT ne couvre pas tous ses cas — BANC NON LANCÉ.'); rapport.refus = 'couverture'; return fin(rapport, nav, 3); }
  if (fuites.length) { console.error('⛔ le démarrage appelle le Worker tout seul — coût non borné — BANC NON LANCÉ.'); rapport.refus = 'demarrage'; return fin(rapport, nav, 3); }
  if (!GO) { console.log('\n  À BLANC : rien n\'a été appelé. Ajoute --go pour lancer.'); return fin(rapport, nav, 0); }
  /* ② LES APPELS — séquentiels, compteur global, coût cumulé PROJETÉ vérifié avant chaque cas. */
  let total = 0, cumulMax = 0;
  for (const c of CAS) {
    const d = devis.find(x => x.id === c.id);
    const restant = Math.min(2, PLAFOND_APPELS - total);
    if (restant <= 0) { console.error('⛔ plafond d\'appels atteint — arrêt.'); rapport.arret = 'plafond appels'; break; }
    if (cumulMax + restant * d.maxUsdAppel > PLAFOND_EUR) { console.error('⛔ le cumul projeté dépasserait ' + PLAFOND_EUR + ' € — arrêt.'); rapport.arret = 'plafond coût'; break; }
    const r = await jouer(nav, c, true, restant);
    total += (r.appels || 0); cumulMax += (r.appels || 0) * d.maxUsdAppel;
    const ind = indicateurs(c.id, r.reply);
    rapport.resultats.push({ id: c.id, titre: c.titre, etat: r.etat, src: r.src, ligne: r.ligne, tdee: r.tdee, cible: r.cible, ok: r.ok, kind: r.kind, err: r.err, status: r.status,
                             modele: r.modele, appels: r.appels, actions: r.urls, ms: r.ms, carContexte: r.car, carReponse: (r.reply || '').length, errsPage: r.errs,
                             indicateurs: ind, reponse: r.reply });
    console.log(`\n── ${c.id} (${c.titre}) · appels ${r.appels} ${JSON.stringify(r.urls)} · ${r.ok ? 'réponse' : 'ÉCHEC ' + r.kind + ' ' + r.err} · modèle ${r.modele || '?'} · ${r.ms} ms`);
    console.log(`   contexte : « ${r.ligne} » · ${r.tdee} · ${r.cible}`);
    console.log(`   indicateur codé : ${ind.ok === null ? 'référence' : (ind.ok ? 'CONFORME' : 'À LIRE')} — attendu : ${ind.attendu}`);
    console.log('   réponse : ' + String(r.reply || '').replace(/\s+/g, ' '));
  }
  rapport.appelsTotal = total;
  const ok = rapport.resultats.filter(x => x.ok);
  const tin = rapport.resultats.reduce((a, x) => a + (x.appels || 0) * Math.ceil((x.carContexte + QUESTION.length) / PRIX.carParToken), 0);
  const tout = ok.reduce((a, x) => a + Math.ceil(x.carReponse / PRIX.carParToken), 0);
  rapport.coutEstime = { tokensEntreeEstimes: tin, tokensSortieEstimes: tout,
    usdPrudent: +(tin * PRIX.entree + tout * PRIX.sortie).toFixed(4),
    usdTarifNormal: +(tin * 3 / 1e6 + tout * 15 / 1e6).toFixed(4),
    usdPlafondRetenu: +cumulMax.toFixed(4),
    note: 'ESTIMÉ : le Worker ne renvoie pas l\'usage réel (tokens). Entrée = caractères du contexte/3 × nombre d\'appels ; sortie = caractères des réponses reçues/3. Un essai échoué ne produit pas de sortie facturée connue ici.' };
  console.log(`\n════ ${total} appel(s) · coût ESTIMÉ ${rapport.coutEstime.usdTarifNormal} $ (tarif de base) / ${rapport.coutEstime.usdPrudent} $ (prudent, écriture de cache 1 h) · borne haute ${rapport.coutEstime.usdPlafondRetenu} $ ════`);
  fin(rapport, nav, 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
