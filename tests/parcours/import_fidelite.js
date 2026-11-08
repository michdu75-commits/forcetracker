/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   📥 IMPORT-IA-FIDELITE-01 — DU DOCUMENT AU CHRONOMÈTRE : le programme importé est FIDÈLE, et la séance suit (blocs B-IIF-*)
   Claude N°2 (Séance, session-C) · 02/11/2026 · GO de Michel (audit ciblé de l'importation IA).
   Chaîne conduite : réponse de l'IA SIMULÉE (à la forme exacte du Worker) → `analyzeImportPhotos` → regroupement échauffement/travail
   (`_mergeImportBlocsEch`) → rattachement catalogue → aperçu → `finalImportProg` → programme ENREGISTRÉ → `_loadProgDayVraiment`
   (la séance) → `toggleSet` (validation d'une série) → `startRest` (le chrono). OBSERVÉ : le programme enregistré (types, charges,
   reps, repos, texte de repos), la séance chargée, et SURTOUT la durée réellement passée à `startRest` / lue dans `restTot` au moment
   où le chrono se déclenche (pas la valeur de l'éditeur).
   ⛔ 0 appel réel (Worker, Apps Script, Anthropic, Supabase interceptés). NE COUVRE PAS : ce que l'IA réelle renvoie pour un PDF réel
   (recette séparée, protocole docs/IMPORT-IA-FIDELITE-01.md §Recette), Safari iOS (Chromium 390×844 ≠ iPhone).
   Banc : tools/banc_import_fidelite.js · contrôle négatif : tools/mut_import_fidelite.py
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const vm = require('vm');

const js = x => JSON.stringify(x).slice(0, 600);
const L = (name, sets, reps, kg, note, extra) => Object.assign({ name, sets, reps, repsPerSet: [], kg, kgPerSet: [], supersetGroup: '', setType: '', note: note || '' }, extra || {});
const _naz = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const BASE_LS = { ft4_ob2: '1', ft4_name: 'Testeur', ft4_premium: 'true', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '130' };

/* ── PUR : la lecture d'un repos écrit par un coach (vm sur le VRAI constants.js, sans navigateur) ── */
module.exports.pur = function (t, ROOT, fs, path) {
  console.log('\n═══ B-IIF-R. IMPORT-IA-FIDELITE-01 — lire un repos comme le coach l\'a écrit (constants.js exécuté) ═══');
  const ctx = { console, window: {}, document: {}, localStorage: { getItem() { return null; } }, navigator: {} };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'constants.js'), 'utf8'), ctx, { filename: 'constants.js' });
  const lire = v => vm.runInContext('_reposLire(' + JSON.stringify(v) + ')', ctx);
  const sec = v => vm.runInContext('_secRepos(' + JSON.stringify(v) + ')', ctx);
  const existe = vm.runInContext('typeof _reposLire', ctx) === 'function';
  t('IIF-R00 ⛔ CONTRÔLE — `_reposLire` existe (le propriétaire UNIQUE de la lecture d\'un repos)', existe, '');
  if (!existe) return;
  // des écritures courantes chez les coachs : le pluriel « mins » et « 1.30 »
  const FERMES = [['3 mins', 180], ['2 mins', 120], ['1.30 mins', 90], ['2.30 mins', 150], ['3 min', 180], ['2.5 min', 150], ['1.5 minutes', 90],
    ['3mn', 180], ['2minutes', 120], ['90s', 90], ['90 sec', 90], ['90 secondes', 90], ['1:30', 90], ["1'30", 90], ['1min30', 90],
    ['1 min 30', 90], ['1m30', 90], ['2minutes30', 150], ['1 minute 30 s', 90], ['120', 120], ['180', 180], [180, 180], ['2', 120],
    ['1.30', 90], ['40 sec', 40], ['repos 40 sec', 40], ['Repos : 2 min', 120], ['Récup 90 s', 90], ['Repos 1.30 mins', 90], ['2 min', 120],
    // ce que les coachs écrivent AUTOUR du chiffre (écritures courantes) : un PLAFOND (« max », « maxi »), une approximation, un blanc de PDF
    ['2 min max', 120], ['repos 30 sec maxi', 30], ['Repos 45 sec max', 45], ['1 min 45 max', 105], ['1.15 min max', 75], ['1.30 max', 90],
    ['1 . 20 min', 80], ['environ 90 s', 90], ['~2 min', 120], ['2 minutes maximum', 120]];
  const ecartF = FERMES.filter(([v, a]) => { const r = lire(v); return !(r.sec === a && !r.min && !r.max && r.txt === ''); }).map(([v, a]) => v + ' → ' + js(lire(v)) + ' (attendu ' + a + ')');
  t('IIF-R01 ⭐ ' + FERMES.length + ' écritures FERMES lues (« 3 mins », « 1.30 mins », « 2.30 mins »…)', ecartF.length === 0, ecartF.join(' | '));
  const PLAGES = [['60-90 s', 60, 90], ['3-4 min', 180, 240], ['2-3 min', 120, 180], ['2 à 3 mins', 120, 180], ['2 -3 mins', 120, 180], ['1 à 2 mins', 60, 120],
    ['90-120 s', 90, 120], ['90–120s', 90, 120], ['2 à 4 minutes', 120, 240], ['1.30 à 2 mins', 90, 120], ['60 s à 90 s', 60, 90], ['2-3', 120, 180],
    ['60-90', 60, 90], ['1 à 2 min', 60, 120], ['repos 2-3 min', 120, 180], ['2 à 3 mins max', 120, 180], ['4-5 min', 240, 300], ['4–5 min', 240, 300], ['4 – 5 min', 240, 300]];
  const ecartP = PLAGES.filter(([v, a, b]) => { const r = lire(v); return !(r.sec === 0 && r.min === a && r.max === b && r.txt && r.txt.length > 0); }).map(([v, a, b]) => v + ' → ' + js(lire(v)) + ' (attendu ' + a + '–' + b + ')');
  t('IIF-R02 ⛔⛔ ' + PLAGES.length + ' PLAGES : jamais converties en repos (sec 0), bornes lues, TEXTE ÉCRIT conservé (rien n\'est perdu)', ecartP.length === 0, ecartP.join(' | '));
  const RIEN = ['selon ressenti', 'au feeling', 'quand tu es prêt', 'bientôt', '', null, '-', '—', '0', -5, 'abc', '10', '13', '4-3', 'repos', 'pause', 'n/a',
    'max', 'maxi', 'repos maximum', '1.10/20 min max', '1.10/20 min', '70 s à 20 min'];
  const ecartN = RIEN.filter(v => sec(v) !== 0).map(v => js(v) + ' → ' + sec(v));
  t('IIF-R03 ⛔ un texte flou, vide, un tiret ou une valeur ambiguë n\'invente JAMAIS de repos (sec 0)', ecartN.length === 0, ecartN.join(' | '));
  const txtGarde = ['selon ressenti', 'au feeling'].every(v => lire(v).txt === v) && lire('').txt === '' && lire('-').txt === '';
  t('IIF-R04 un texte non chiffré est CONSERVÉ tel quel (`txt`), un vide ou un tiret ne laisse rien', txtGarde, js([lire('selon ressenti'), lire('-')]));
  /* ⏱️ DÉCISION DE MICHEL (08/11/2026) : la durée PROPOSÉE (`prop`) d'une plage est sa BORNE BASSE ; une valeur ferme est elle-même ; un texte sans chiffre ou une valeur ambiguë = 0.
     ⛔ `sec` d'une plage RESTE 0 : `_secRepos` sert aussi aux séances de Milo, il ne change pas de sens. */
  const PROP = [['4-5 min', 240], ['4–5 min', 240], ['60-90 s', 60], ['3-4 min', 180], ['2 à 3 mins', 120], ['1 à 2 mins', 60], ['3 mins', 180], ['90 s', 90], ['1:30', 90], ['2 min max', 120],
    ['selon ressenti', 0], ['1.10/20 min', 0], ['1.10/20 min max', 0], ['', 0], [null, 0], ['abc', 0], ['4-3', 0]];
  const ecartPr = PROP.filter(([v, a]) => lire(v).prop !== a).map(([v, a]) => js(v) + ' → prop ' + lire(v).prop + ' (attendu ' + a + ')');
  t('IIF-R07 ⭐⭐ DÉCISION DE MICHEL (08/11/2026) — `prop` : une PLAGE vaut sa BORNE BASSE (« 4-5 min » → 240 s), une valeur ferme vaut elle-même, un texte flou ou une valeur ambiguë vaut 0 (' + PROP.length + ' écritures)', ecartPr.length === 0, ecartPr.join(' | '));
  t('IIF-R08 ⛔ `_secRepos` (qui sert aussi à Milo) NE CHANGE PAS : une plage reste 0 seconde — seul l\'import lit `prop`', ['4-5 min', '60-90 s', '3-4 min', '2 à 3 mins'].every(v => sec(v) === 0), js(['4-5 min', '60-90 s'].map(v => [v, sec(v)])));
  // « 1.10/20 min » : un coach qui écrit 1 min 10 à 1 min 20. Lu comme une plage, c'était 70 s → 20 MINUTES. Le texte reste, rien n'est appliqué.
  const bizarre = lire('1.10/20 min max');
  t('IIF-R06 ⛔ une « plage » dont la borne haute dépasse 5 fois la basse (« 1.10/20 min max ») n\'est PAS une plage : aucun chiffre, le texte écrit est conservé',
    bizarre.sec === 0 && bizarre.min === 0 && bizarre.max === 0 && bizarre.txt === '1.10/20 min max', js(bizarre));
  // compatibilité : tout ce que l'ancien parseur lisait est lu à l'identique (voir CCLXXIV, calculs)
  const ANCIEN = [[180, 180], ['180', 180], ['3 min', 180], ['3min', 180], ['90 s', 90], ['1 min 30', 90], ['1:30', 90], ['', 0], [null, 0], ['bientôt', 0], [-5, 0],
    ['2 min', 120], ['90s', 90], ['120', 120], ['2 minutes', 120], ['90 sec', 90], ["1'30", 90], ['3mn', 180], ['2min', 120], ['1min30', 90], ['1m30', 90], ['2minutes30', 150], ['2,5 min', 150],
    ['90-120s', 0], ['1 à 2 min', 0]];
  const ecartA = ANCIEN.filter(([v, a]) => sec(v) !== a).map(([v, a]) => js(v) + ' → ' + sec(v) + ' (avant ' + a + ')');
  t('IIF-R05 ⭐ COMPATIBILITÉ — `_secRepos` rend ce qu\'il rendait pour toutes ses valeurs d\'avant (' + ANCIEN.length + ')', ecartA.length === 0, ecartA.join(' | '));
};

/* ── ÉCRAN : la chaîne complète, conduite dans l'app servie ── */
module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-IIF-C. IMPORT-IA-FIDELITE-01 — document → programme → séance → chrono (l\'app conduite) ═══');
  let PROG = null;                                   // la réponse « du Worker » courante, changée d'un cas à l'autre
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
  let reels = 0;
  await cx.route(/supabase\.co|anthropic\.com/, r => { reels++; return r.abort(); });
  await cx.route(/workers\.dev|script\.google\.com/, async r => {
    let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
    if (c.action === 'importProgram') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: JSON.parse(JSON.stringify(PROG)) }) });
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
  });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_iif'))return; sessionStorage.setItem('_iif','1'); localStorage.clear();
    const D=${JSON.stringify(BASE_LS)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2500);

  /** Une section qui plante (fonction absente sur le code d'AVANT, par exemple) devient un ROUGE nommé — jamais un arrêt du banc. */
  const section = async (nom, fn) => { try { await fn(); } catch (e) { t('IIF-' + nom + ' ⛔ la section n\'a pas pu aller au bout', false, String(e && e.message || e).slice(0, 240)); } };
  /** Importe `prog` (réponse simulée de l'IA) : renvoie l'aperçu, puis le programme ENREGISTRÉ (`finalImportProg`). */
  const importer = async (prog) => {
    PROG = prog;
    return pg.evaluate(async () => {
      S.premium = true; S.programmes = []; S.customExercises = []; S.exRestPref = {}; S.defRest = 130; persist();
      _impPhotos = [{ type: 'text/plain', data: 'programme', name: 'prog.txt', isText: true }]; _impMode = 'new';
      await analyzeImportPhotos();
      const apercu = JSON.parse(JSON.stringify((_impExtracted || {}).days || []));
      return { apercu };
    });
  };
  const enregistrer = () => pg.evaluate(() => {
    finalImportProg();
    const prog = S.programmes[S.programmes.length - 1];
    return JSON.parse(JSON.stringify(prog));
  });
  const SERIES = e => (e.sets || []).map(s => ({ kg: s.kg, reps: s.reps, type: s.type, rest: s.rest, restTxt: s.restTxt || '' }));
  const TYPES = e => (e.sets || []).map(s => s.type).join('');
  const jourExs = (prog, d) => (prog.days[d].exs || []);
  const trouve = (prog, d, nom) => jourExs(prog, d).filter(e => nom instanceof RegExp ? nom.test(_naz(e.name)) : _naz(e.name) === _naz(nom));

  // ── A. UN EXERCICE À ÉCHAUFFEMENTS ET REPOS ÉCRITS (forme du NOUVEAU contrat du Worker : l'IA a fusionné les lignes de même nom) ──
  const DC = L('Développé couché', 7, 3, 0, 'RIR 2-3', { repsPerSet: [5, 3, 2, 1, 3, 3, 3], kgPerSet: [50, 65, 80, 85, 90, 90, 90],
    setTypePerSet: ['W', 'W', 'W', 'W', '', '', ''], rest: '', restPerSet: ['60-90 s', '60-90 s', '90 s', '2 min', '3-4 min', '3-4 min', '3-4 min'] });
  const CP = L('Chest Press inclinée', 3, 8, 0, 'Charge : à calibrer | RIR 1-2', { rest: '2 min' });
  const ROW = L('Rowing poitrine appuyée', 3, 8, 52, 'RIR 1-2', { rest: '2 min' });
  const FP = L('Face Pull', 3, 12, 28, 'Reps 12-15 | RIR 2', { rest: '60-90 s' });
  const NR = L('Curl marteau', 3, 10, 14, '', { rest: 'libre' });                  // un texte SANS durée : rien n'est écrit, les réglages de la personne s'appliquent (B07 / B08)
  await importer({ name: 'Programme test', weeks: 4, startDate: '', days: [{ label: 'J1 - Pectoraux / Dos', exercises: [DC, CP, ROW, FP, NR] }] });
  const p1 = await enregistrer();
  const dc = trouve(p1, 0, 'Développé couché')[0] || { sets: [] };
  t('IIF-A01 ⭐ l\'exercice à 4 échauffements + 3 séries de travail reste UN exercice de 7 séries, types ÉÉÉÉNNN, ordre et charges conservés',
    trouve(p1, 0, 'Développé couché').length === 1 && TYPES(dc) === 'ÉÉÉÉNNN' && dc.sets.map(s => s.kg).join(',') === '50,65,80,85,90,90,90' && dc.sets.map(s => s.reps).join(',') === '5,3,2,1,3,3,3', js(SERIES(dc)));
  t('IIF-A02 ⭐⭐ les repos du document sont enregistrés par série, sans décalage d\'une série : les FERMES tels quels (90 s, 2 min), les PLAGES à leur borne basse (60 s, 3 min)',
    dc.sets.map(s => s.rest).join(',') === '60,60,90,120,180,180,180', js(SERIES(dc)));
  t('IIF-A03 ⛔⛔ DÉCISION DE MICHEL (08/11/2026) — les PLAGES (« 60-90 s », « 3-4 min ») deviennent leur BORNE BASSE (60 s, 180 s) ET le texte écrit est CONSERVÉ série par série (la consigne d\'origine ne disparaît pas)',
    dc.sets.map(s => s.restTxt || '').join('|') === '60-90 s|60-90 s|||3-4 min|3-4 min|3-4 min' && dc.sets.filter(s => s.restTxt).every(s => s.rest > 0), js(SERIES(dc)));
  const cp = trouve(p1, 0, /chest press/)[0] || { sets: [] };
  t('IIF-A04 un repos écrit pour tout l\'exercice (« 2 min ») vaut pour CHAQUE série (3 × 120 s)', cp.sets.length === 3 && cp.sets.every(s => s.rest === 120 && !s.restTxt), js(SERIES(cp)));
  const fp = trouve(p1, 0, /face pull/)[0] || { sets: [] };
  t('IIF-A05 une plage écrite pour tout l\'exercice vaut pour CHAQUE série : 3 × (repos 60 s = borne basse, texte « 60-90 s » conservé)', fp.sets.length === 3 && fp.sets.every(s => s.rest === 60 && s.restTxt === '60-90 s'), js(SERIES(fp)));
  t('IIF-A06 la note du document (RIR, charge « à calibrer ») est conservée', /RIR 2-3/.test(dc.note) && /à calibrer/.test(cp.note), js({ dc: dc.note, cp: cp.note }));

  // ── B. LE CHRONOMÈTRE : la durée RÉELLEMENT passée à `startRest` quand on valide une série ──
  /** Charge le jour d, valide les séries de l'exercice ei dans l'ordre, relève pour chacune (startRest, restTot, consigne affichée). */
  const sequence = (progIdx, dayIdx, ei, opts) => pg.evaluate(([progIdx, dayIdx, ei, opts]) => {
    opts = opts || {};
    S.defRest = opts.defRest != null ? opts.defRest : 130; S.exRestPref = {}; persist();
    S.wkt = null; _loadProgDayVraiment(progIdx, dayIdx);
    // préférences d'exercice posées sur les noms RÉELS de la séance (le catalogue a pu renommer l'exercice)
    (opts.pref || []).forEach(([motif, sec]) => S.wkt.exs.forEach(e => { if (new RegExp(motif, 'i').test(e.name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) S.exRestPref[e.name] = sec; }));
    persist();
    window.__rests = []; if (!window.__espion) { window.__espion = true; const o = window.startRest; window.startRest = function (sec) { window.__rests.push(sec); return o.apply(this, arguments); }; }
    const out = [];
    const n = S.wkt.exs[ei].sets.length;
    for (let si = 0; si < n; si++) {
      window.__rests.length = 0; stopRest();
      toggleSet(ei, si);
      const c = document.getElementById('rest-consigne');
      out.push({ appel: window.__rests.slice(), tot: restTot, enCours: !!restStartTs, consigne: c && c.style.display !== 'none' ? c.textContent : '', type: S.wkt.exs[ei].sets[si].type });
    }
    stopRest();
    return out;
  }, [progIdx, dayIdx, ei, opts]);
  const seqDC = await sequence(S_IDX(0), 0, 0);
  const apps = seqDC.map(x => x.appel[0]);
  t('IIF-B01 ⭐⭐ UNE validation = UN démarrage de chrono, avec la durée choisie (7 séries → 7 appels)', seqDC.every(x => x.appel.length === 1 && x.enCours), js(seqDC.map(x => x.appel)));
  t('IIF-B02 ⛔⛔ les repos fermes du document sont CEUX DU CHRONO : 3ᵉ échauffement 90 s, 4ᵉ échauffement 120 s (et `restTot` le confirme)',
    apps[2] === 90 && apps[3] === 120 && seqDC[2].tot === 90 && seqDC[3].tot === 120, js({ apps, tots: seqDC.map(x => x.tot) }));
  t('IIF-B03 ⛔⛔ DÉCISION DE MICHEL (08/11/2026) — une série à PLAGE (« 3-4 min ») lance sa BORNE BASSE (180 s, pas le réglage de la personne) ET la consigne écrite reste AFFICHÉE, avec le chrono réglé dit',
    [4, 5, 6].every(i => apps[i] === 180 && seqDC[i].tot === 180 && /3-4 min/.test(seqDC[i].consigne) && /3:00/.test(seqDC[i].consigne)), js({ apps: apps.slice(4), cons: seqDC.slice(4).map(x => x.consigne) }));
  t('IIF-B04 une série à repos FERME n\'affiche aucune consigne (rien de contradictoire à l\'écran)', seqDC[2].consigne === '' && seqDC[3].consigne === '', js(seqDC.map(x => x.consigne)));
  t('IIF-B05 les échauffements écrits en plage (« 60-90 s ») lancent leur borne basse (60 s) — un repos ÉCRIT gagne sur la règle de palier —, et la consigne « 60-90 s » est dite',
    apps[0] === 60 && apps[1] === 60 && /60-90 s/.test(seqDC[0].consigne) && /60-90 s/.test(seqDC[1].consigne), js({ apps: apps.slice(0, 2), cons: seqDC.slice(0, 2).map(x => x.consigne) }));

  // priorité : repos exact de la série > préférence de l'exercice > réglage global
  const seqCP = await sequence(S_IDX(0), 0, 1, { defRest: 100, pref: [['chest press', 75]] });
  t('IIF-B06 ⭐⭐ PRIORITÉ — un repos ÉCRIT (2 min) bat la préférence de l\'exercice (75 s) ET le réglage global (100 s)', seqCP.every(x => x.appel[0] === 120), js(seqCP.map(x => x.appel)));
  // ⚠️ 08/11/2026 : B07 / B08 visaient « Face Pull » (plage « 60-90 s »). Une plage vaut désormais sa borne basse (60 s) et compte comme un repos ÉCRIT : ces deux témoins ont donc été
  //    reportés sur un exercice dont le document n'écrit AUCUNE durée (« libre ») — l'invariant testé est le même : sans durée écrite, préférence de l'exercice > réglage global.
  const seqFP = await sequence(S_IDX(0), 0, 4, { defRest: 100, pref: [['marteau', 75]] });   // le catalogue renomme « Curl marteau » en « Marteau »
  t('IIF-B07 ⭐ PRIORITÉ — sans repos chiffré (texte « libre ») : la préférence de l\'exercice (75 s) passe avant le réglage global (100 s)', seqFP.every(x => x.appel[0] === 75), js(seqFP.map(x => x.appel)));
  const seqFP2 = await sequence(S_IDX(0), 0, 4, { defRest: 100, pref: [] });
  t('IIF-B08 ⭐ PRIORITÉ — ni repos écrit ni préférence : le réglage global (100 s)', seqFP2.every(x => x.appel[0] === 100), js(seqFP2.map(x => x.appel)));
  const seqFPp = await sequence(S_IDX(0), 0, 3, { defRest: 100, pref: [['face pull', 75]] });
  t('IIF-B07b ⭐⭐ DÉCISION DE MICHEL (08/11/2026) — une PLAGE écrite (« 60-90 s ») compte comme un repos écrit : sa borne basse (60 s) passe avant la préférence de l\'exercice (75 s) ET le réglage global (100 s) ; la consigne écrite reste affichée',
    seqFPp.every(x => x.appel[0] === 60 && /60-90 s/.test(x.consigne)), js(seqFPp.map(x => [x.appel, x.consigne])));
  t('IIF-B09 ⛔ l\'import n\'a ÉCRIT AUCUNE préférence de repos (`exRestPref` reste vide) et n\'a pas touché au réglage global',
    await pg.evaluate(() => { S.exRestPref = {}; S.defRest = 130; persist(); return true; }) && p1.days.length === 1, '');
  // les bornes de la consigne sont proposées dans « Régler », la personne décide
  const choix = await pg.evaluate(() => {
    S.defRest = 130; S.exRestPref = {}; S.wkt = null; _loadProgDayVraiment(S.programmes.length - 1, 0);
    stopRest(); toggleSet(0, 4);                                         // 1ʳᵉ série de travail : « 3-4 min »
    openRestEdit();
    const rc = document.getElementById('re-consigne');
    const avant = { min: !!document.getElementById('rc-min'), max: !!document.getElementById('rc-max'), txt: rc ? rc.textContent : '', tot: restTot };
    const mx = document.getElementById('rc-max'); if (mx) mx.click();      // la personne choisit la borne haute
    const apres = { tot: restTot, pref: (S.exRestPref || {})[S.wkt.exs[0].name] };
    stopRest(); return { avant, apres };
  });
  t('IIF-B10 ⭐⭐ « Régler » propose les DEUX BORNES de la consigne (3:00 et 4:00) ; la personne choisit 4:00 → le chrono passe à 240 s (même chemin que les préréglages)',
    choix.avant.min && choix.avant.max && /3-4 min/.test(choix.avant.txt) && choix.apres.tot === 240 && choix.apres.pref === 240, js(choix));
  t('IIF-B11 ⭐ la durée PROPOSÉE est celle du document (la borne basse, 180 s) — pas un réglage deviné — et c\'est la PERSONNE qui la change : avant son geste le chrono tournait à 180 s', choix.avant.tot === 180, js(choix.avant));
  // un repos CHIFFRÉ (la borne basse posée à l'import, ou un chiffre choisi dans l'éditeur) lance son chiffre ET la consigne d'origine reste affichée (décision de Michel, 08/11/2026)
  const dbl = await pg.evaluate(() => {
    S.defRest = 130; S.exRestPref = {};
    const avant = S.programmes;                                            // on AJOUTE un programme, on n'écrase pas ceux des autres tests
    S.programmes = avant.concat([{ id: 'p9', name: 'Mixte', weeks: 0, startDate: '', days: [{ label: 'J1', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, type: 'N', rest: 150, restTxt: '2-3 min' }, { kg: 100, reps: 5, type: 'N', rest: 0, restTxt: '2-3 min' }] }] }] }]);
    S.wkt = null; _loadProgDayVraiment(S.programmes.length - 1, 0); stopRest();
    const rcs = () => { const e = document.getElementById('rest-consigne'); return e ? { d: e.style.display, t: e.textContent } : { d: '(absent)', t: '' }; };   // absent sur le code d'avant : un rouge, pas un plantage
    toggleSet(0, 0); const a = { tot: restTot, cons: rcs().d, txt: rcs().t };
    stopRest(); toggleSet(0, 1); const b2 = { tot: restTot, cons: rcs().d, txt: rcs().t };
    const garde = S.wkt.exs[0].sets[0].restTxt;
    stopRest(); S.programmes = avant; S.wkt = null; persist();
    return { a, b: b2, restTxtGarde: garde };
  });
  t('IIF-B14 ⭐ une série au repos CHIFFRÉ (150 s) lance 150 s ET affiche la consigne d\'origine « 2-3 min » (conservée) ; la voisine sans chiffre lance le réglage de la personne (130 s) et l\'affiche aussi — le texte écrit n\'a jamais été effacé',
    dbl.a.tot === 150 && dbl.a.cons === 'block' && /2-3 min/.test(dbl.a.txt) && /2:30/.test(dbl.a.txt) && dbl.b.tot === 130 && dbl.b.cons === 'block' && /2-3 min/.test(dbl.b.txt) && dbl.restTxtGarde === '2-3 min', js(dbl));
  // le « + » central (règle d'or n°9) ne bouge pas quand la consigne s'affiche
  const fab = await pg.evaluate(() => {
    const r = () => { const e = document.getElementById('nb-log'); const q = e && e.getBoundingClientRect(); return q ? [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)] : null; };
    S.wkt = null; _loadProgDayVraiment(S.programmes.length - 1, 0); stopRest();
    const sans = r(); toggleSet(0, 2);          // repos ferme : aucune consigne
    const ferme = r(); const c1 = (document.getElementById('rest-consigne') || { style: {} }).style.display;
    stopRest(); toggleSet(0, 4);                // plage : consigne affichée
    const plage = r(); const c2 = (document.getElementById('rest-consigne') || { style: {} }).style.display;
    stopRest(); return { sans, ferme, plage, c1, c2 };
  });
  t('IIF-B12 ⛔ RÈGLE D\'OR n°9 — le bouton central « + » Séance ne bouge pas d\'un pixel (sans repos / repos ferme / consigne affichée)',
    fab.sans && js(fab.sans) === js(fab.ferme) && js(fab.sans) === js(fab.plage) && fab.c1 !== 'block' && fab.c2 === 'block', js(fab));
  // réouverture : la séance chargée survit à un rechargement, et le chrono reprend les mêmes durées
  await pg.evaluate(() => { S.defRest = 130; S.exRestPref = {}; S.wkt = null; _loadProgDayVraiment(S.programmes.length - 1, 0); persist(); stopRest(); });
  await pg.reload(); await pg.waitForTimeout(2200);
  const reouv = await pg.evaluate(() => {
    window.__rests = []; if (!window.__espion) { window.__espion = true; const o = window.startRest; window.startRest = function (sec) { window.__rests.push(sec); return o.apply(this, arguments); }; }
    const wk = S.wkt && S.wkt.exs && S.wkt.exs[0];
    if (!wk) return { err: 'séance absente après rechargement' };
    toggleSet(0, 2); const a = restTot; stopRest(); toggleSet(0, 3); const b2 = restTot; stopRest();
    return { a, b: b2, texte: wk.sets[4].restTxt || '', rest2: wk.sets[2].rest, rest3: wk.sets[3].rest };
  });
  t('IIF-B13 ⭐ APRÈS FERMETURE / RÉOUVERTURE de l\'app : la séance en cours porte toujours les repos (90 s, 120 s) et la consigne écrite (« 3-4 min »)',
    !reouv.err && reouv.a === 90 && reouv.b === 120 && reouv.texte === '3-4 min', js(reouv));

  // ── C. CHRONO EN SUPERSET, DROPSET, ET FIN D'EXERCICE ──
  const SS_A = L('Curl biceps haltères', 3, 12, 14, '', { supersetGroup: 'A', rest: '', restPerSet: ['', '', '90 s'] });
  const SS_B = L('Extension triceps poulie', 3, 12, 25, '', { supersetGroup: 'A', rest: '2 min' });
  const DROP = L('Élévations latérales', 3, 12, 10, '', { setType: 'D', repsPerSet: [12, 10, 8], kgPerSet: [10, 8, 6], rest: '3 mins' });
  const LAST = L('Leg curl', 2, 12, 40, '', { rest: '1.30 mins' });
  const NEXT = L('Mollets debout', 2, 15, 60, '', { rest: '40 sec' });
  await importer({ name: 'Transitions', weeks: 0, startDate: '', days: [{ label: 'J1', exercises: [SS_A, SS_B, DROP, LAST, NEXT] }] });
  await enregistrer();
  const trans = await pg.evaluate(() => {
    S.defRest = 130; S.exRestPref = {}; S.wkt = null; _loadProgDayVraiment(S.programmes.length - 1, 0);
    window.__rests = []; if (!window.__espion) { window.__espion = true; const o = window.startRest; window.startRest = function (sec) { window.__rests.push(sec); return o.apply(this, arguments); }; }
    const rep = {}; const mark = (k, fn) => { window.__rests.length = 0; stopRest(); fn(); rep[k] = window.__rests.slice(); };
    const g = S.wkt.exs[0].group;
    mark('ss_A1', () => toggleSet(0, 0));       // premier exercice du tour : AUCUN repos (enchaîné)
    mark('ss_B1', () => toggleSet(1, 0));       // dernier exercice du tour : repos de CETTE série (2 min)
    mark('ss_A2', () => toggleSet(0, 1));
    mark('ss_B2', () => toggleSet(1, 1));
    mark('ss_A3', () => toggleSet(0, 2));
    mark('ss_B3', () => toggleSet(1, 2));
    mark('drop1', () => toggleSet(2, 0));
    mark('drop2', () => toggleSet(2, 1));
    mark('drop3', () => toggleSet(2, 2));
    mark('leg1', () => toggleSet(3, 0));
    mark('leg2', () => toggleSet(3, 1));        // dernière série de l'exercice → repos de CETTE série, puis l'exercice suivant
    mark('mol1', () => toggleSet(4, 0));
    stopRest();
    rep.groupe = g; rep.types = S.wkt.exs.map(e => e.groupType || '');
    return rep;
  });
  t('IIF-C01 ⭐ SUPERSET — aucun repos après le 1ᵉʳ exercice du tour (enchaîné), le repos de la série du 2ᵉ exercice (120 s) à la fin du tour ; pas de repos contradictoire',
    trans.ss_A1.length === 0 && trans.ss_A2.length === 0 && trans.ss_B1.join() === '120' && trans.ss_B2.join() === '120' && trans.ss_B3.join() === '120', js(trans));
  t('IIF-C02 ⭐ DROPSET — pas de repos entre les paliers, le repos écrit (3 mins = 180 s) à la fin de la série dégressive',
    trans.drop1.length === 0 && trans.drop2.length === 0 && trans.drop3.join() === '180', js({ d1: trans.drop1, d2: trans.drop2, d3: trans.drop3 }));
  t('IIF-C03 ⭐⭐ ÉCRITURE DU COACH — « 1.30 mins » = 90 s, « 40 sec » = 40 s, appliqués à chaque série ; la dernière série d\'un exercice utilise SON repos (pas celui de l\'exercice suivant)',
    trans.leg1.join() === '90' && trans.leg2.join() === '90' && trans.mol1.join() === '40', js({ l1: trans.leg1, l2: trans.leg2, m1: trans.mol1 }));

  // ── A (suite). Lecture du repos par série et séries en couleur — après le chrono, qui lit le programme de la section A ──
  await importer({ name: 'Couleur', weeks: 0, startDate: '', days: [{ label: 'J1', exercises: [L('Curl barre EZ', 5, 8, 30, 'Méthode du coach', { specialSets: [3, 4] })] }] });
  const pCoul = await enregistrer();
  t('IIF-A08 ⛔ les séries « en couleur » du document (specialSets) ne sont plus jetées en silence : le programme dit QUELLES séries (n° 4, 5), sans deviner leur sens',
    /Séries en couleur dans le document : n° 4, 5/.test(pCoul.days[0].exs[0].note) && /Méthode du coach/.test(pCoul.days[0].exs[0].note), js(pCoul.days[0].exs[0]));
  await importer({ name: 'Repli', weeks: 0, startDate: '', days: [{ label: 'J1', exercises: [L('Rowing barre', 3, 8, 60, '', { rest: '2 min', restPerSet: ['', '', '3 mins'] })] }] });
  const pRepli = await enregistrer();
  t('IIF-A07 ⭐ une valeur par série VIDE retombe sur le repos de l\'exercice (« 2 min »), une valeur écrite pour LA série gagne (« 3 mins » = 180 s)',
    pRepli.days[0].exs[0].sets.map(s => s.rest).join() === '120,120,180', js(SERIES(pRepli.days[0].exs[0])));

  // ── outils des sections D à H ──
  const jour = (exs) => ({ name: 'Cas', weeks: 0, startDate: '', days: [{ label: 'J1', exercises: exs }] });
  const ECH = (name, reps, kg, note, extra) => L(name, 1, reps, kg, note === undefined ? 'ECH' : note, extra);
  const vue = async (exs) => {                                     // aperçu + programme enregistré d'un jour
    const r = await importer(jour(exs)); const prog = await enregistrer();
    return { ap: r.apercu[0].exercises, ex: prog.days[0].exs };
  };
  // ── D. LE REGROUPEMENT ÉCHAUFFEMENT / TRAVAIL : UNE SEULE RÈGLE, SES CAS ET SES CONTRE-EXEMPLES ──
  await section('D', async () => {
  const D1 = await vue([ECH('Développé couché', 5, 50, 'ECH', { rest: '60-90 s' }), ECH('Développé couché', 3, 65, 'ECH', { rest: '60-90 s' }),
    ECH('Développé couché', 2, 80, 'ECH', { rest: '90 s' }), ECH('Développé couché', 1, 85, 'ECH', { rest: '2 min' }), L('Développé couché', 3, 3, 90, 'RIR 2-3', { rest: '3-4 min' })]);
  t('IIF-D01 ⭐ 4 lignes d\'échauffement (preuve en note) + 3 séries de travail, même nom = UN exercice de 7 séries ÉÉÉÉNNN, charges / reps / repos par série conservés',
    D1.ex.length === 1 && TYPES(D1.ex[0]) === 'ÉÉÉÉNNN' && D1.ex[0].sets.map(s => s.kg).join() === '50,65,80,85,90,90,90' && D1.ex[0].sets.map(s => s.reps).join() === '5,3,2,1,3,3,3'
    && D1.ex[0].sets.map(s => s.rest).join() === '60,60,90,120,180,180,180' && D1.ex[0].sets.map(s => s.restTxt || '').join('|') === '60-90 s|60-90 s|||3-4 min|3-4 min|3-4 min', js(SERIES(D1.ex[0])));
  t('IIF-D01b … et le repos du travail ne déborde PAS sur les échauffements (la 1ʳᵉ série n\'a pas « 3-4 min »)', D1.ex[0].sets[0].restTxt === '60-90 s', js(SERIES(D1.ex[0])));
  const D1c = await vue([ECH('Soulevé de terre', 5, 60, 'ECH'), ECH('Soulevé de terre', 3, 80, 'ECH'), L('Soulevé de terre', 3, 3, 130, 'RIR 2', { rest: '3 min' })]);
  t('IIF-D01c ⛔ un échauffement SANS repos écrit n\'hérite JAMAIS du repos de la ligne de travail (0, 0, puis 180 ×3) — pas de décalage, pas de débordement',
    D1c.ex.length === 1 && D1c.ex[0].sets.map(s => s.rest).join() === '0,0,180,180,180' && TYPES(D1c.ex[0]) === 'ÉÉNNN', js(SERIES(D1c.ex[0])));
  const D3 = await vue([L('Développé couché', 1, 5, 50, 'Échauffement'), L('Développé couché', 1, 3, 65, 'échauffement léger'), L('Développé couché', 3, 5, 85, '')]);
  t('IIF-D02 échauffement présent DANS UNE NOTE seulement → regroupé (ÉÉNNN)', D3.ex.length === 1 && TYPES(D3.ex[0]) === 'ÉÉNNN', js(D3.ex.map(e => e.name + ':' + TYPES(e))));
  const D4 = await vue([L('Curl biceps', 1, 12, 14, ''), L('Curl biceps', 1, 10, 16, '')]);
  t('IIF-D03 ⛔ deux lignes identiques SANS aucune preuve d\'échauffement restent DEUX exercices (R29 : sans preuve, rien ne bouge)', D4.ex.length === 2 && D4.ex.every(e => e.sets.length === 1 && TYPES(e) === 'N'), js(D4.ex.map(e => e.name + ':' + TYPES(e))));
  const D5 = await vue([L('Développé couché', 1, 5, 50, 'Montée en charge'), L('Développé couché', 1, 3, 70, 'Monté en charge'), L('Développé couché', 3, 5, 90, '')]);
  t('IIF-D04 « Montée en charge » ET « Monté en charge » (une faute courante) comptent comme preuve → ÉÉNNN', D5.ex.length === 1 && TYPES(D5.ex[0]) === 'ÉÉNNN', js(D5.ex.map(e => e.name + ':' + TYPES(e))));
  const D6 = await vue([L('Squat', 1, 8, 40, 'Série de chauffe'), L('Squat', 1, 5, 60, 'Série longue de chauffe'), L('Squat', 4, 6, 100, '')]);
  t('IIF-D05 « Série de chauffe » / « Série longue de chauffe » comptent comme preuve → ÉÉNNNN', D6.ex.length === 1 && TYPES(D6.ex[0]) === 'ÉÉNNNN', js(D6.ex.map(e => e.name + ':' + TYPES(e))));
  const D7 = await vue([ECH('Leg extension', 15, 20, 'Échauffement'), L('Rowing haltère', 3, 10, 30, '')]);
  t('IIF-D06 ⭐ un échauffement ISOLÉ (aucune série de travail du même exercice) reste un exercice à lui, sa série conservée, rien fusionné',
    D7.ex.length === 2 && D7.ex[0].sets.length === 1 && D7.ex[0].sets[0].kg === 20 && D7.ex[1].sets.length === 3, js(D7.ex.map(e => e.name + ':' + e.sets.length)));
  const D8 = await vue([ECH('Squat (échauffement)', 8, 40, ''), L('Squat bulgare', 3, 10, 20, '')]);
  t('IIF-D07 ⛔⛔ « Squat » (échauffement) puis « Squat Bulgare » : DEUX mouvements, JAMAIS fusionnés, JAMAIS proposés', D8.ex.length === 2 && !D8.ap.some(e => e._propGrp), js(D8.ap.map(e => e.name + ':' + !!e._propGrp)));
  const D9 = await vue([ECH('Développé militaire barre', 5, 30, 'ECH'), L('Développé militaire haltères', 3, 8, 20, '')]);
  t('IIF-D08 ⛔⛔ « Développé militaire barre » (échauffement) puis « … haltères » : matériels qui se contredisent = deux mouvements, jamais fusionnés ni proposés',
    D9.ex.length === 2 && !D9.ap.some(e => e._propGrp), js(D9.ap.map(e => e.name + ':' + !!e._propGrp)));
  const D10 = await vue([ECH('Développé couché', 5, 50, 'Échauffement'), L('Écarté poulie', 3, 12, 15, ''), L('Développé couché', 3, 5, 85, '')]);
  t('IIF-D09 ⛔ un AUTRE exercice entre les deux COUPE le bloc : pas de fusion à travers lui (3 exercices)', D10.ex.length === 3, js(D10.ex.map(e => e.name + ':' + TYPES(e))));
  const D11 = await vue([ECH('Développé couché (ECH)', 5, 50, ''), ECH('Développé couché (échauffement)', 3, 65, ''), L('Développé couché', 3, 5, 85, '')]);
  t('IIF-D10 le marqueur DANS LE NOM (« X (ECH) ») — le cas de l\'ancien filet — est toujours regroupé, sans ajout d\'un second filet', D11.ex.length === 1 && TYPES(D11.ex[0]) === 'ÉÉNNN' && D11.ex[0].name === 'Développé Couché', js(D11.ex.map(e => e.name + ':' + TYPES(e))));
  const D12 = await vue([ECH('Développé militaire', 8, 20, 'ECH'), L('Développé militaire haltères', 3, 8, 24, 'RIR 2')]);
  t('IIF-D11 ⭐ un matériel écrit d\'un côté et pas de l\'autre (« Développé militaire » / « … haltères ») : PROPOSITION, aucune fusion automatique',
    D12.ex.length === 2 && D12.ap.length === 2 && D12.ap[0]._propGrp && D12.ap[0]._propGrp === D12.ap[1]._propGrp && D12.ap[0]._propRole === 'ech' && D12.ap[1]._propRole === 'travail', js(D12.ap.map(e => e.name + ':' + e._propRole)));

  });
  // ── E. LE CAS « MATÉRIEL ÉCRIT D'UN SEUL CÔTÉ » (épaules, machine guidée puis haltères) : deux formes d'IA, une proposition, la personne tranche ──
  const GUIDE_NEW = [L('Presse épaules guidée', 2, 5, 0, 'Charge : très légère | Charge : montée progressive', { repsPerSet: [10, 5], kgPerSet: [0, 0], setTypePerSet: ['W', 'W'], rest: '', restPerSet: ['60 s', '60-90 s'] }),
    L('Presse épaules guidée / haltères', 3, 8, 50, 'Reps 6-8 | Charge 45-50 kg | RIR 1-2', { setTypePerSet: ['', '', ''], rest: '2 min' }),
    L('Pec Deck', 3, 10, 60, 'RIR 1-2', { rest: '90-120 s' })];
  const GUIDE_OLD = [ECH('Presse épaules guidée', 10, 0, 'ECH | Charge : très légère', { rest: '60 s' }), ECH('Presse épaules guidée', 5, 0, 'ECH | Charge : montée progressive', { rest: '60-90 s' }),
    L('Presse épaules guidée / haltères', 3, 8, 50, 'Reps 6-8 | Charge 45-50 kg | RIR 1-2', { rest: '2 min' }), L('Pec Deck', 3, 10, 60, 'RIR 1-2', { rest: '90-120 s' })];
  for (const [forme, exs] of [['NOUVEAU contrat (l\'IA a fusionné les deux lignes de même nom)', GUIDE_NEW], ['ANCIEN Worker (une ligne = un exercice, ECH en note)', GUIDE_OLD]]) await section('E', async () => {
    const r = await importer(jour(JSON.parse(JSON.stringify(exs))));
    const ap = r.apercu[0].exercises;
    t('IIF-E01 ⭐⭐ GUIDÉ — ' + forme + ' : AVANT toute décision, rien n\'est fusionné (2 exercices + Pec Deck), une PROPOSITION relie l\'échauffement au travail',
      ap.length === 3 && ap[0].name === 'Presse épaules guidée' && ap[1].name === 'Presse épaules guidée / haltères' && ap[0]._propGrp && ap[0]._propGrp === ap[1]._propGrp && ap[0]._propRole === 'ech' && ap[1]._propRole === 'travail', js(ap.map(e => e.name + ':' + (e._propRole || '-'))));
    const T1 = await pg.evaluate(() => {
      const d = _impExtracted.days[0];
      const el = document.getElementById('imp-preview');
      return { ei: d.exercises.findIndex(e => e._propRole === 'travail'), texte: el ? el.innerText : '', btn: typeof impGrouperEch === 'function' };
    });
    t('IIF-E02 GUIDÉ — ' + forme + ' : l\'aperçu NOMME la proposition (regrouper / garder séparés) sans bloquer', /regrouper/i.test(T1.texte) && /séparés/i.test(T1.texte), T1.texte.slice(0, 300));
    // la personne ACCEPTE
    const ok = await pg.evaluate(() => { impGrouperEch(0, _impExtracted.days[0].exercises.findIndex(e => e._propRole === 'travail')); return JSON.parse(JSON.stringify(_impExtracted.days[0].exercises)); });
    const fus = ok[0];
    t('IIF-E03 ⭐⭐ GUIDÉ — ' + forme + ' : après « Regrouper » = UN exercice de 5 séries ÉÉNNN, nom fidèle au document (« … / haltères »), ordre 10-5-8-8-8',
      ok.length === 2 && fus.name === 'Presse épaules guidée / haltères' && (fus.setTypePerSet || []).join('') === 'WW' + '' && fus.repsPerSet.join() === '10,5,8,8,8' && fus.kgPerSet.join() === '0,0,50,50,50', js({ n: ok.length, name: fus.name, types: fus.setTypePerSet, reps: fus.repsPerSet, kg: fus.kgPerSet }));
    const pr = await enregistrer();
    const e5 = pr.days[0].exs[0];
    t('IIF-E04 GUIDÉ — ' + forme + ' : enregistré, types ÉÉNNN, repos [60 s, plage « 60-90 s » → 60 s, 2 min ×3] sans décalage, notes de l\'échauffement conservées',
      TYPES(e5) === 'ÉÉNNN' && e5.sets.map(s => s.rest).join() === '60,60,120,120,120' && e5.sets[1].restTxt === '60-90 s' && /légère/.test(e5.note) && /progressive/.test(e5.note) && /RIR 1-2/.test(e5.note), js({ types: TYPES(e5), sets: SERIES(e5), note: e5.note }));
    // la personne REFUSE
    await importer(jour(JSON.parse(JSON.stringify(exs))));
    const ref = await pg.evaluate(() => { impGarderSepares(0, _impExtracted.days[0].exercises.findIndex(e => e._propRole === 'travail')); return JSON.parse(JSON.stringify(_impExtracted.days[0].exercises)); });
    t('IIF-E05 GUIDÉ — ' + forme + ' : « Garder séparés » = rien n\'est fusionné, la proposition disparaît, toutes les séries sont conservées (2 échauffements + 3 travail + Pec Deck)',
      ref.length === 3 && !ref.some(e => e._propGrp || e._propRole) && ref[0].name === 'Presse épaules guidée' && ref[0].repsPerSet.length === 2 && ref[1].name === 'Presse épaules guidée / haltères' && (ref[1].repsPerSet.length || ref[1].sets) === 3, js(ref.map(e => e.name + ':' + (e.repsPerSet || []).length + ':' + e._propGrp)));
    const prS = await enregistrer();
    t('IIF-E06 GUIDÉ — ' + forme + ' : séparés, l\'échauffement garde ses 2 séries typées É et le travail ses 3 séries N',
      prS.days[0].exs.length === 3 && TYPES(prS.days[0].exs[0]) === 'ÉÉ' && TYPES(prS.days[0].exs[1]) === 'NNN', js(prS.days[0].exs.map(e => e.name + ':' + TYPES(e))));
  });
  await section('E2', async () => {
  // les deux variantes d'un même jour (semaine A / semaine B) ne se mélangent JAMAIS
  await importer({ name: 'AB', weeks: 4, startDate: '', days: [
    { label: 'Jour 3 - Semaine A - Larsen', exercises: [L('Larsen press', 3, 5, 80, '')] },
    { label: 'Jour 3 - Semaine B - Épaules', exercises: [L('Développé épaules machine', 3, 10, 40, '')] }] });
  const ab = await pg.evaluate(() => JSON.parse(JSON.stringify(_impExtracted.days.map(d => [d.label, (d.exercises || []).map(e => e.name)]))));
  t('IIF-E07 ⛔ deux jours « Jour 3 — Semaine A » / « Jour 3 — Semaine B » (même numéro) NE SONT PAS collés en une séance (variantes d\'un jour, une semaine sur deux)', ab.length === 2 && ab[0][1].length === 1 && ab[1][1].length === 1, js(ab));
  await importer({ name: 'AB2', weeks: 0, startDate: '', days: [
    { label: 'Séance 1 - Dorsaux', exercises: [L('Tractions', 3, 8, 0, '')] }, { label: 'Séance 1 - Biceps', exercises: [L('Curl barre', 3, 10, 30, '')] }] });
  const sc = await pg.evaluate(() => _impExtracted.days.length);
  t('IIF-E08 non-régression — « Séance 1 — Dorsaux » + « Séance 1 — Biceps » restent UNE séance (sections d\'une même séance)', sc === 1, 'jours=' + sc);

  });
  await section('F', async () => {
  // ── F. L'APERÇU : statut, vraie illustration, séries, corrections (ce que la personne VOIT avant d'enregistrer) ──
  const PV = [L('Développé couché', 5, 5, 0, 'RIR 2', { repsPerSet: [5, 3, 5, 5, 5], kgPerSet: [50, 65, 90, 90, 90], setTypePerSet: ['W', 'W', '', '', ''], restPerSet: ['60 s', '60-90 s', '3-4 min', '3-4 min', '3-4 min'] }),
    L('Presse Zeta Prototype', 3, 10, 120, 'Consigne du coach', { rest: '2 min' }),
    L('Squat machine', 3, 8, 100, '', { rest: '2 min' }),
    L('Élévations latérales poulie', 3, 12, 10, '', { rest: '90 s' }),
    L('Développé couché Smith', 3, 8, 60, '', { rest: '2 min' }),
    L('Chest Press inclinée', 3, 8, 40, '', { rest: '2 min' })];
  await importer(jour(PV));
  const aperc = await pg.evaluate(() => {
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    document.getElementById('ov-import-prog').classList.add('open'); _renderImpConfirm();
    const cartes = [...document.querySelectorAll('#imp-preview .imp-card')].map(c => ({
      nom: c.querySelector('.imp-nom').textContent, statut: c.getAttribute('data-statut'), lib: (c.querySelector('.imp-st') || {}).textContent,
      img: !!c.querySelector('img.imp-ill'), sans: !!c.querySelector('.imp-ill-none'), silhouette: !!c.querySelector('img[src*="muscles/"]'), ech: +c.getAttribute('data-ech'), trav: +c.getAttribute('data-trav'),
      texte: c.querySelector('.imp-sum').innerText }));
    return { cartes, creesAvant: (S.customExercises || []).length, vm: _impExtracted.days[0].exercises.map(e => ({ n: e.name, from: e._vmFrom || '', sugg: e._vmSuggest || '' })) };
  });
  const cDC = aperc.cartes[0], cZ = aperc.cartes[1];
  t('IIF-F01 ⭐ l\'aperçu montre les séries d\'ÉCHAUFFEMENT et de TRAVAIL avec leurs charges, reps et repos (et pas seulement « 5×5 »)',
    cDC.ech === 2 && cDC.trav === 3 && /Échauffement/.test(cDC.texte) && /50 kg × 5/.test(cDC.texte) && /65 kg × 3/.test(cDC.texte) && /Travail/.test(cDC.texte) && /90 kg/.test(cDC.texte) && /3-4 min/.test(cDC.texte) && /1 min/.test(cDC.texte), js(cDC));
  t('IIF-F02 ⭐ un exercice RECONNU affiche son statut et sa VRAIE illustration (image du catalogue)', cDC.statut === 'ok' && /Reconnu/.test(cDC.lib) && cDC.img && !cDC.sans, js(cDC));
  t('IIF-F03 ⭐⭐ un exercice INCONNU est annoncé « sera créé », avec l\'aveu « aucune illustration » — JAMAIS une silhouette de muscle qui ferait croire à une reconnaissance',
    cZ.statut === 'new' && /Sera créé/.test(cZ.lib) && cZ.sans && !cZ.img && !cZ.silhouette, js(cZ));
  t('IIF-F04 ⛔ AUCUN exercice perso n\'est créé par l\'aperçu : la création n\'a lieu qu\'à « Importer » (0 créé avant)', aperc.creesAvant === 0, 'créés=' + aperc.creesAvant);
  const vmDe = motif => aperc.vm.find(v => motif.test(v.from) || motif.test(v.n)) || {};
  const sqM = vmDe(/squat machine/i), elP = vmDe(/lat[ée]rales.*(poulie|c[âa]ble)/i), smi = vmDe(/couch[ée].*smith|smith.*couch[ée]/i);
  t('IIF-F05 ⛔⛔ AUCUN rattachement automatique à un AUTRE MATÉRIEL (squat machine ↛ squat barre ; poulie ↛ haltères ; Smith ↛ libre) — garde-fous IMPORT-MAP conservés',
    !/barre/i.test(sqM.n || '') && /machine/i.test(sqM.n || '') && /c[âa]ble|poulie/i.test(elP.n || '') && !/halt[èe]re/i.test(elP.n || '') && /smith/i.test(smi.n || ''), js({ sqM, elP, smi }));
  const cCP = aperc.cartes[aperc.cartes.length - 1];
  t('IIF-F09 ⭐ un exercice AMBIGU est annoncé « À confirmer » (jamais rattaché d\'office) et son nom du document est conservé tant que la personne n\'a pas dit oui',
    cCP.statut === 'conf' && /À confirmer/.test(cCP.lib) && /Chest Press inclinée/i.test(cCP.nom), js(cCP));
  // confort sur un téléphone (Chromium 390 × 844 — PAS un iPhone) : rien ne déborde, les cibles tactiles tiennent
  const lay = await pg.evaluate(() => {
    const ex = _impExtracted.days[0].exercises; const nom0 = ex[0].name, note0 = ex[0].note;     // restaurés plus bas : F06 / F07 repartent du même état
    ex[0].name = 'Développé couché incliné prise neutre aux haltères avec pause en bas de mouvement et contrôle de la phase excentrique (variante du coach)';
    ex[0].note = 'RIR 2-3 | ' + 'consigne très longue sans espace '.repeat(8) + 'x'.repeat(60);
    _impOuverts.clear(); impToggleDet(0, 0); impEditRepos(0, 0, 2);
    const pv = document.getElementById('imp-preview'), W = innerWidth;
    const dehors = [...pv.querySelectorAll('.imp-card, .imp-card *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > W + 0.5 || r.left < -0.5); }).length;
    const h = sel => [...pv.querySelectorAll(sel)].map(b => Math.round(b.getBoundingClientRect().height));
    const res = { deborde: pv.scrollWidth - pv.clientWidth, dehors, det: h('.imp-det'), x: h('.imp-x'), rp: h('.imp-rp'), ty: h('.imp-ty'), puces: h('.imp-rpe-c button'), ok: h('.imp-prop-b button') };
    ex[0].name = nom0; ex[0].note = note0; _impOuverts.clear(); _renderImpConfirm();
    return res;
  });
  t('IIF-F10 ⭐ confort téléphone : un nom de 130 caractères et une consigne sans espace ne font pas déborder l\'aperçu ; boutons « Voir / corriger » et ✕ ≥ 40 px, puces de repos et de type ≥ 34 px',
    lay.deborde <= 0 && lay.dehors === 0 && lay.det.every(v => v >= 40) && lay.x.every(v => v >= 40) && lay.rp.every(v => v >= 34) && lay.ty.every(v => v >= 33) && lay.puces.every(v => v >= 34), js(lay));
  // corrections : le type et le repos d'une série se corrigent DANS l'aperçu, et c'est ce qui est enregistré
  const corr = await pg.evaluate(() => {
    _impOuverts.clear(); impToggleDet(0, 0);
    impBasculerType(0, 0, 1);                    // la 2ᵉ série d'échauffement (65×3) passe en travail
    impFixerRepos(0, 0, 3, 240);                 // « 3-4 min » → 4 min pour la 4ᵉ série
    impEditRepos(0, 0, 2);
    const ouvert = !!document.querySelector('#imp-preview .imp-rpe');
    impReposAutre(0, 0, 2);                      // champ vide : refusé, rien ne bouge
    const ex = _impExtracted.days[0].exercises[0];
    const v = _impVueSeries(ex);
    return { ouvert, types: v.map(x => x.type).join(''), repos: v.map(x => x.repos.sec + '|' + x.repos.txt), note: ex.note };
  });
  t('IIF-F06 ⭐ « Voir / corriger » : on bascule échauffement ↔ travail et on fixe un repos depuis l\'aperçu ; la consigne écrite d\'origine reste dans la note (rien de perdu)',
    corr.ouvert && corr.types === 'ÉNNNN' && corr.repos[3] === '240|' && /Repos écrit : 3-4 min/.test(corr.note), js(corr));
  const prF = await enregistrer();
  const dcF = prF.days[0].exs.find(e => /couch/i.test(e.name) && !/smith/i.test(e.name));
  t('IIF-F07 ⭐ ce qui est enregistré = ce que l\'aperçu montrait après corrections (types ÉNNNN, 4ᵉ série à 240 s choisis, 3ᵉ à la borne basse 180 s avec sa plage conservée)',
    dcF && TYPES(dcF) === 'ÉNNNN' && dcF.sets[3].rest === 240 && dcF.sets[2].restTxt === '3-4 min' && dcF.sets[2].rest === 180, js(dcF && SERIES(dcF)));
  const autre = await pg.evaluate(() => {
    _impPhotos = [{ type: 'text/plain', data: 'x', name: 'p.txt', isText: true }];
    return null;
  });
  await importer(jour([L('Presse Zeta Prototype', 3, 10, 120, '', { rest: '2 min' })]));
  const aut = await pg.evaluate(() => { _impOuverts.clear(); impToggleDet(0, 0); impEditRepos(0, 0, 0); const i = document.getElementById('imp-rp-autre'); i.value = '100'; impReposAutre(0, 0, 0);
    const v1 = _impVueSeries(_impExtracted.days[0].exercises[0])[0].repos.sec; impEditRepos(0, 0, 1); document.getElementById('imp-rp-autre').value = '2 min'; impReposAutre(0, 0, 1);
    return { v1, v2: _impVueSeries(_impExtracted.days[0].exercises[0])[1].repos.sec }; });
  t('IIF-F08 le champ « autre » : des chiffres seuls = des secondes (100 → 100 s), « 2 min » = 120 s', aut.v1 === 100 && aut.v2 === 120, js(aut));

  });
  await section('G', async () => {
  // ── G. LE CALENDRIER : sans date de début, on ne fabrique pas « Semaine 1 / N » ──
  const cal = async (startDate, weeks) => {
    await pg.evaluate(([sd, w]) => { S.programmes = [{ id: 'p1', name: 'Cycle', weeks: w, startDate: sd, days: [{ label: 'J1', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, type: 'N', rest: 0 }] }] }] }]; persist(); openProgModal(); }, [startDate, weeks]);
    return pg.evaluate(() => { const c = document.querySelector('#prog-list .prog-card, .prog-card'); return { texte: c ? c.innerText : '', pm: c ? [...c.querySelectorAll('button')].map(b => b.textContent.trim()).join('|') : '' }; });
  };
  const c0 = await cal('', 4);
  t('IIF-G01 ⭐⭐ programme de 4 semaines SANS date de début : « Date de début à définir » — pas de « Semaine 1 / 4 » fabriqué, pas de barre, pas de boutons ±', /Date de début à définir/.test(c0.texte) && !/Semaine\s*1\s*\/\s*4/.test(c0.texte) && !/^−$|\|−\||\|\+\|/.test(c0.pm) && /Définir/.test(c0.pm), js(c0));
  const il8 = new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0];
  const c1 = await cal(il8, 4);
  t('IIF-G02 ⭐ avec une vraie date de début, le calcul existant est INCHANGÉ (début il y a 8 jours → « Semaine 2 / 4 », dates affichées, boutons ±)', /Semaine\s*2\s*\/\s*4/.test(c1.texte) && !/Date de début à définir/.test(c1.texte), js(c1));
  const shift = await pg.evaluate(() => { S.programmes[0].startDate = ''; shiftProgStart(0, 1); return S.programmes[0].startDate; });
  t('IIF-G03 ⛔ « décaler d\'une semaine » sans date ne pose JAMAIS la date du jour (reste vide)', shift === '', 'startDate=' + shift);
  const ed = await pg.evaluate(() => {
    S.programmes = [{ id: 'p1', name: 'Cycle', weeks: 4, startDate: '', days: [{ label: 'J1', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, type: 'N', rest: 0 }] }] }] }]; persist();
    editProg(0);
    const btn = document.getElementById('prog-edit-today'), hint = document.getElementById('prog-edit-start-hint'), inp = document.getElementById('prog-edit-start');
    const avant = { btn: !!btn, hint: hint ? hint.textContent : '', val: inp ? inp.value : null };
    return avant;
  });
  t('IIF-G04 ⭐ éditeur d\'un programme sans date : bouton explicite « Aujourd\'hui » + l\'aveu « sans date, la semaine n\'avance pas » ; le champ reste VIDE tant que la personne ne touche à rien',
    ed.btn && /n'avance pas/.test(ed.hint) && ed.val === '', js(ed));
  const ed2 = await pg.evaluate(() => { document.getElementById('prog-edit-today').click(); const inp = document.getElementById('prog-edit-start'); const r = { val: inp.value, hint: document.getElementById('prog-edit-start-hint').textContent, today: today() };
    saveProgEdit(); r.sauve = S.programmes[0].startDate; return r; });
  t('IIF-G05 ⭐ « Aujourd\'hui » (geste explicite) pose la date du jour, l\'aveu disparaît, et l\'enregistrement la garde', ed2.val === ed2.today && ed2.hint === '' && ed2.sauve === ed2.today, js(ed2));
  const ed3 = await pg.evaluate(() => { S.programmes[0].startDate = ''; persist(); editProg(0); saveProgEdit(); return S.programmes[0].startDate; });
  t('IIF-G06 ⛔⛔ ouvrir puis enregistrer l\'éditeur SANS toucher à la date ne l\'invente pas (reste vide : l\'affichage d\'un champ date vide par iOS ne devient jamais une date)', ed3 === '', 'startDate=' + ed3);

  });
  await section('H', async () => {
  // ── H. DEUX PROGRAMMES DE MÊME NOM : distingués, et le remplacement vise une CIBLE confirmée ──
  const homs = await pg.evaluate(() => {
    S.customExercises = [];
    S.programmes = [
      { id: 'p1700000000001', name: 'Force 5x5', weeks: 4, startDate: '2026-10-05', days: [{ label: 'J1', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, type: 'N', rest: 0 }] }] }, { label: 'J2', exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 5, type: 'N', rest: 0 }] }] }] },
      { id: 'p1700000000002', name: 'Force 5x5', weeks: 0, startDate: '', days: [{ label: 'J1', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 60, reps: 8, type: 'N', rest: 0 }] }] }] }];
    persist(); openProgModal();
    const liste = document.querySelector('.prog-card') ? [...document.querySelectorAll('.prog-card .prog-card-name')].map(n => n.textContent.trim()) : [];
    return { liste };
  });
  t('IIF-H01 ⭐ deux programmes du MÊME NOM se distinguent dans la liste (un numéro apparaît sur chacun)', homs.liste.length === 2 && homs.liste.every(n => /n°/.test(n)) && homs.liste[0] !== homs.liste[1], js(homs.liste));
  await importer(jour([L('Presse Zeta Prototype', 3, 10, 120, '', { rest: '2 min' }), L('Tractions', 3, 8, 0, '')]));
  const rep = await pg.evaluate(() => {
    S.programmes = [
      { id: 'p1700000000001', name: 'Force 5x5', weeks: 4, startDate: '2026-10-05', days: [{ label: 'J1', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, type: 'N', rest: 0 }] }] }, { label: 'J2', exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 5, type: 'N', rest: 0 }] }] }] },
      { id: 'p1700000000002', name: 'Force 5x5', weeks: 0, startDate: '', days: [{ label: 'J1', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 60, reps: 8, type: 'N', rest: 0 }] }] }] }];
    S.customExercises = []; persist();
    _impExtracted.name = 'Force 5x5';
    _setImpMode('replace');
    const sel = document.getElementById('imp-replace-sel'); const opts = [...sel.options].map(o => o.textContent);
    sel.value = '1';
    finalImportProg();                                                // AVANT la confirmation : rien ne doit bouger
    const dlg = document.getElementById('ov-confirm'), msg = document.getElementById('confirm-msg').textContent;
    const avant = { ouvert: dlg.classList.contains('open'), msg, ids: S.programmes.map(p => p.id), crees: (S.customExercises || []).length };
    closeConfirm();                                                   // la personne ANNULE
    const annule = { ids: S.programmes.map(p => p.id), noms: S.programmes.map(p => p.days[0].exs[0].name), crees: (S.customExercises || []).length };
    return { opts, avant, annule };
  });
  t('IIF-H02 ⭐ la liste de remplacement montre pour chaque programme : nom, durée, début, nombre de séances et numéro technique', rep.opts.length === 2 && /4 sem\./.test(rep.opts[0]) && /début/.test(rep.opts[0]) && /2 séances/.test(rep.opts[0]) && /n°/.test(rep.opts[0]) && /sans date de début/.test(rep.opts[1]) && /durée non précisée/.test(rep.opts[1]) && rep.opts[0] !== rep.opts[1], js(rep.opts));
  t('IIF-H03 ⭐⭐ « Remplacer » NOMME sa cible dans une confirmation (numéro, durée…) AVANT tout effet : rien n\'est remplacé ni créé tant que la personne n\'a pas dit oui',
    rep.avant.ouvert && /n°/.test(rep.avant.msg) && /sans date de début/.test(rep.avant.msg) && rep.avant.ids.join() === 'p1700000000001,p1700000000002' && rep.avant.crees === 0, js(rep.avant));
  t('IIF-H04 ⛔ ANNULER ne remplace rien et ne crée AUCUN exercice perso (les deux programmes, leurs contenus et le catalogue intacts)', rep.annule.ids.join() === 'p1700000000001,p1700000000002' && rep.annule.noms.join() === 'Squat à la Barre,Squat à la Barre' && rep.annule.crees === 0, js(rep.annule));
  const ok2 = await pg.evaluate(() => {
    _impMode = 'replace'; _setImpMode('replace'); const sel = document.getElementById('imp-replace-sel'); sel.value = '1';
    finalImportProg(); confirmOk();                                    // la personne CONFIRME
    return { ids: S.programmes.map(p => p.id), noms: S.programmes.map(p => p.name), ex0: S.programmes[0].days[0].exs[0].name, ex1: S.programmes[1].days[0].exs.map(e => e.name) };
  });
  t('IIF-H05 ⭐ confirmé : SEULE la cible (n°…02) est remplacée ; son homonyme (n°…01) reste intact, à la même place',
    ok2.ids.length === 2 && ok2.ex0 === 'Squat à la Barre' && ok2.ex1.some(n => /zeta/i.test(n)) && ok2.noms.join() === 'Force 5x5,Force 5x5', js(ok2));
  });
  await section('I', async () => {
  // ── I. CE QUE LES PROGRAMMES DE COACHS ONT RÉVÉLÉ (cas synthétiques, aucun document réel) ──
  // ⛔⛔ PROTECTION DES DONNÉES (mission §11) : un import n'écrit QUE le nouveau programme (et ses exercices perso nouveaux)
  PROG = jour([L('Presse Zeta Prototype', 3, 10, 120, '', { rest: '2 min' }), L('Développé couché', 3, 5, 90, 'RIR 2', { rest: '3 mins' })]);
  const prot = await pg.evaluate(async () => {
    S.premium = true;
    S.sessions = [{ date: '2026-10-20', exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 5, done: true, type: 'N', rm1: 93 }] }], vol: 400 }];
    S.prs = { 'Développé Couché': { rm1: 93, kg: 80, reps: 5, date: '2026-10-20' } };
    S.exRestPref = { 'Développé Couché': 150 }; S.defRest = 111; S.weightLog = [{ date: '2026-10-20', kg: 80 }];
    S.customExercises = [{ n: 'Mon exo perso', g: 'Autres', custom: true }];
    S.programmes = [{ id: 'pExistant', name: 'Mon programme', weeks: 4, startDate: '2026-10-05', days: [{ label: 'J1', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, type: 'N', rest: 120 }] }] }] }];
    persist();
    const etat = () => JSON.stringify({ s: S.sessions, p: S.prs, e: S.exRestPref, d: S.defRest, w: S.weightLog, c: (S.customExercises || []).filter(x => x.n === 'Mon exo perso'), pr: S.programmes.filter(x => x.id === 'pExistant') });
    const avant = etat();
    _impPhotos = [{ type: 'text/plain', data: 'programme', name: 'prog.txt', isText: true }]; _impMode = 'new';
    await analyzeImportPhotos(); finalImportProg();
    return { egal: avant === etat(), nProg: S.programmes.length, neuf: S.programmes.some(x => x.id !== 'pExistant') };
  });
  t('IIF-I10 ⛔⛔ DONNÉES PROTÉGÉES — importer puis enregistrer un programme ne touche NI aux séances passées, NI aux records, NI aux préférences de repos, NI au réglage global, NI aux pesées, NI à un exercice perso, NI à un programme existant ; il AJOUTE le nouveau',
    prot.egal && prot.nProg === 2 && prot.neuf, js(prot));
  const R0 = await vue([L('Élévations latérales haltères', 1, 0, 0, '', { rest: '1.30 mins' })]);
  t('IIF-I01 ⭐ des reps que le document n\'écrit PAS ne passent pas pour une prescription : le programme garde « Non renseigné » (`null`) — plus de 10 inventé « puis signalé » (correction D, 02/11 : détail en section K)',
    R0.ex[0].sets[0].reps === null && R0.ex[0].note === '' && R0.ap[0].note === R0.ex[0].note, js(R0.ex[0]));
  const R1 = await vue([L('Curl barre EZ', 3, 12, 20, 'RIR 2', { rest: '90 s' })]);
  t('IIF-I02 … et des reps écrites ne reçoivent AUCUNE mention (la note du coach reste intacte)', !/Répétitions non écrites/.test(R1.ex[0].note) && R1.ex[0].sets.every(s => s.reps === 12) && R1.ex[0].note === 'RIR 2', js(R1.ex[0]));
  const statut = () => pg.evaluate(() => { const ex = _impExtracted.days[0].exercises[0]; return { nom: ex.name, sugg: ex._vmSuggest || '', from: ex._vmFrom || '', k: _impStatut(ex, _catalogueConnu()).k }; });
  await importer(jour([L('Hip Thrust', 4, 8, 0, 'Lourd | Machine guidée', { rest: '2 min 30' })]));
  const sm = await statut();
  t('IIF-I03 ⛔⛔ « Hip Thrust » dont la NOTE dit « Machine guidée » n\'est PAS rattaché d\'office à l\'exercice à la barre : proposition « À confirmer », nom du document gardé',
    sm.k === 'conf' && !sm.from && sm.nom === 'Hip Thrust' && /hip thrust barre/i.test(sm.sugg), js(sm));
  await importer(jour([L('Hip Thrust', 4, 8, 0, 'Lourd | pause en haut', { rest: '2 min 30' })]));
  const sb = await statut();
  t('IIF-I04 … sans matériel dans la note, le rattachement d\'office existe toujours (la garde ne bloque pas tout : « Hip Thrust » → « Hip Thrust Barre »)', sb.k === 'ok' && /hip thrust barre/i.test(sb.nom) && sb.from === 'Hip Thrust', js(sb));
  await importer(jour([L('Hip Thrust', 4, 8, 0, 'Lourd | à la barre', { rest: '2 min 30' })]));
  const sbb = await statut();
  t('IIF-I05 … et une note qui dit « barre » ne contredit pas une cible non marquée (barre par défaut) : rattaché d\'office', sbb.k === 'ok' && /hip thrust barre/i.test(sbb.nom), js(sbb));
  // ce que le serveur a dû écarter se DIT dans l'aperçu ; la simple conservation d'une plage n'est pas une perte
  const pertes = async (norm) => { await importer(Object.assign(jour([L('Curl barre EZ', 3, 12, 20, '', { rest: '90 s' })]), norm === undefined ? {} : { normalisation: norm }));
    return pg.evaluate(() => { _renderImpConfirm(); const e = document.querySelector('#imp-preview .imp-perte'); return e ? e.textContent : ''; }); };
  const p1 = await pertes({ joursEcartes: 1, exercicesIllisibles: 2, startDateRefusee: 1, plagesReps: 3 });
  t('IIF-I06 ⭐ ce que le serveur a dû ÉCARTER se dit avant d\'enregistrer (1 séance sans exercice, 2 lignes illisibles, la date de début non gardée)',
    /1 séance sans exercice lisible a été écartée/.test(p1) && /2 lignes illisibles ont été ignorées/.test(p1) && /date de début/.test(p1), js(p1));
  const p2 = await pertes({ plagesReps: 5, plagesCharge: 2, repsNonChiffrees: 2, chargesNonChiffrees: 1, tableauxRealignes: 1 });
  t('IIF-I07 ⛔ la simple CONSERVATION (plages gardées dans la note, charges « à calibrer ») n\'est pas annoncée comme une perte', p2 === '', js(p2));
  const p3 = await pertes(undefined);
  t('IIF-I08 ⛔ l\'ancien serveur (Apps Script) ne compte rien : on ne dit RIEN plutôt qu\'un « tout va bien » inventé', p3 === '', js(p3));
  const p4 = await pg.evaluate(() => { finalImportProg(); const pr = S.programmes[S.programmes.length - 1]; return JSON.stringify(pr).indexOf('normalisation') >= 0; });
  t('IIF-I09 ⛔ les compteurs du serveur ne sont jamais ENREGISTRÉS dans le programme (aucune donnée persistée en plus)', p4 === false, 'normalisation présente dans le programme enregistré');
  });
  await section('J', async () => {
  // ── J. CORRECTION C (02/11/2026) — LES DROPSETS DÉJÀ ENREGISTRÉS GARDENT LEUR COMPORTEMENT ; SEUL LE NOUVEL IMPORT ÉCRIT SON MARQUAGE ──
  // Le premier jet de ce lot DÉDUISAIT l'enchaînement des paliers du seul type « D » + repos absent : le chrono des programmes DÉJÀ enregistrés
  // changeait en silence (un repos entier devenait « aucun repos »). Décision de Michel : une donnée ancienne ne reçoit JAMAIS un comportement
  // nouveau par simple déduction ; un marquage EXPLICITE (`dropChaine`) est écrit par le nouvel import, et par lui seul.
  // Les programmes « anciens » ci-dessous sont écrits À LA FORME de ce que l'ancien import enregistrait (paliers de type D, le repos de
  // l'exercice recopié sur chaque palier, ou 0) — mesuré sur la base e2b942f3 avant ce lot : même chrono que celui attendu ici.
  const PAL = [[10, 12], [8, 10], [6, 8]];
  const LEG = { name: 'Leg curl', note: '', sets: [{ kg: 40, reps: 12, type: 'N', rest: 90 }, { kg: 40, reps: 12, type: 'N', rest: 90 }] };
  const ancien = (id, rest) => ({ id, name: 'Ancien ' + id, weeks: 0, startDate: '', days: [{ label: 'J1', exs: [
    { name: 'Élévations latérales', note: '', sets: PAL.map(([kg, reps]) => ({ kg, reps, type: 'D', rest })) }, JSON.parse(JSON.stringify(LEG))] }] });
  const poser = (progs) => pg.evaluate((progs) => { S.programmes = JSON.parse(JSON.stringify(progs)); S.sessions = []; S.wkt = null; persist(); return true; }, progs);
  const chrono = (seq) => seq.map(x => x.appel.join('+')).join('|');       // « 180|180|180 » : la durée passée à startRest à chaque validation, vide = aucun repos
  const sans = (o) => JSON.stringify(o, (k, v) => k === 'dropChaine' ? undefined : v);

  await poser([ancien('A', 180)]);
  const jA = await sequence(0, 0, 0);
  t('IIF-J01 ⭐⭐ ANCIEN dropset AVEC repos (180 s recopié sur chaque palier, comme l\'ancien import) : un repos ENTIER entre les paliers, exactement comme avant ce lot',
    chrono(jA) === '180|180|180' && jA.every(x => x.enCours), js(jA.map(x => x.appel)));
  const jA2 = await sequence(0, 0, 1);
  t('IIF-J02 … et l\'exercice qui SUIT garde son propre repos (90 s, 90 s) : la transition après un ancien dropset ne bouge pas', chrono(jA2) === '90|90', js(jA2.map(x => x.appel)));
  await poser([ancien('B', 0)]);
  const jB = await sequence(0, 0, 0);
  t('IIF-J03 ⭐⭐ ANCIEN dropset SANS repos (0) : le repos par défaut (130 s) entre les paliers, comme avant — JAMAIS un enchaînement déduit du seul type « D »',
    chrono(jB) === '130|130|130' && jB.every(x => x.enCours), js(jB.map(x => x.appel)));
  await poser([ancien('A', 180)]);
  const intact = await pg.evaluate(() => {
    const snap = () => JSON.stringify(S.programmes) + '§' + localStorage.getItem('ft4_progs');
    const av = snap();
    S.wkt = null; _loadProgDayVraiment(0, 0); toggleSet(0, 0); toggleSet(0, 1); stopRest();
    return { egal: av === snap(), plein: av.length > 50, marque: S.wkt.exs.map(e => Object.prototype.hasOwnProperty.call(e, 'dropChaine')) };
  });
  t('IIF-J04 ⛔ un ancien programme n\'est JAMAIS réécrit par le chargement ni par la séance (programmes et stockage identiques), et la séance chargée ne reçoit AUCUN marqueur d\'enchaînement',
    intact.egal && intact.plein && intact.marque.join() === 'false,false', js(intact));

  // le NOUVEL import : le document dit « dropset » → l'exercice porte le marquage, et la séance enchaîne les paliers
  const DROP = L('Élévations latérales', 3, 12, 10, '', { setType: 'D', repsPerSet: [12, 10, 8], kgPerSet: [10, 8, 6], rest: '3 mins' });
  const NORM = L('Leg curl', 2, 12, 40, '', { rest: '1.30 mins' });
  await importer(jour([JSON.parse(JSON.stringify(DROP)), JSON.parse(JSON.stringify(NORM))]));
  const pN = await enregistrer();
  const exN = pN.days[0].exs;
  const jN = await sequence(0, 0, 0);
  t('IIF-J05 ⭐⭐ NOUVEL import d\'un dropset : l\'exercice porte `dropChaine: true` (et LUI SEUL), le repos écrit (3 mins) est sur le DERNIER palier, la séance enchaîne les paliers sans repos et prend 180 s à la fin',
    exN[0].dropChaine === true && !Object.prototype.hasOwnProperty.call(exN[1], 'dropChaine') && exN[0].sets.map(s => s.rest).join() === '0,0,180' && exN[0].sets.every(s => s.type === 'D')
    && chrono(jN) === '||180' && !jN[0].enCours && !jN[1].enCours && jN[2].enCours && jN[2].tot === 180, js({ marque: exN.map(e => e.dropChaine), rest: exN[0].sets.map(s => s.rest), chrono: jN.map(x => x.appel) }));
  const jN2 = await sequence(0, 0, 1);
  t('IIF-J06 … et l\'exercice qui suit le nouveau dropset garde son repos (1.30 mins = 90 s ×2) : les transitions sont intactes', chrono(jN2) === '90|90', js(jN2.map(x => x.appel)));

  // le document écrit un repos POUR CHAQUE palier : il est respecté (le repos écrit gagne toujours sur l'enchaînement)
  await importer(jour([L('Élévations latérales', 3, 12, 10, '', { setType: 'D', repsPerSet: [12, 10, 8], kgPerSet: [10, 8, 6], rest: '', restPerSet: ['20 s', '30 s', '3 mins'] })]));
  const pP = await enregistrer(); const jP = await sequence(0, 0, 0);
  t('IIF-J07 ⭐ un repos ÉCRIT pour chaque palier (20 s, 30 s, 3 mins) est respecté tel quel — le document gagne sur l\'enchaînement',
    pP.days[0].exs[0].sets.map(s => s.rest).join() === '20,30,180' && chrono(jP) === '20|30|180', js({ rest: pP.days[0].exs[0].sets.map(s => s.rest), chrono: jP.map(x => x.appel) }));
  // aucun repos écrit nulle part : les paliers s'enchaînent, le repos PAR DÉFAUT vient à la fin seulement
  await importer(jour([L('Élévations latérales', 3, 12, 10, '', { setType: 'D', repsPerSet: [12, 10, 8], kgPerSet: [10, 8, 6] })]));
  await enregistrer(); const jV = await sequence(0, 0, 0);
  t('IIF-J08 ⭐ un dropset SANS aucun repos écrit : paliers enchaînés, repos par défaut (130 s) à la fin seulement', chrono(jV) === '||130', js(jV.map(x => x.appel)));

  // le marqueur voyage avec l'exercice : sauvegarde de la séance en programme, puis rechargement (un jour et plusieurs jours)
  await importer(jour([JSON.parse(JSON.stringify(DROP))])); await enregistrer();
  const sav = await pg.evaluate(() => {
    S.wkt = null; _loadProgDayVraiment(0, 0); stopRest();
    document.getElementById('prog-name-inp').value = 'Copie du dropset'; saveAsProg();
    const copie = S.programmes.find(p => p.name === 'Copie du dropset');
    const ex = copie && (copie.exs || [])[0];
    const marque = !!ex && ex.dropChaine === true;
    const idx = S.programmes.indexOf(copie);
    S.defRest = 130; S.exRestPref = {}; S.wkt = null; loadProg(idx);
    window.__rests = []; if (!window.__espion) { window.__espion = true; const o = window.startRest; window.startRest = function (sec) { window.__rests.push(sec); return o.apply(this, arguments); }; }
    const sortie = []; for (let si = 0; si < S.wkt.exs[0].sets.length; si++) { window.__rests.length = 0; stopRest(); toggleSet(0, si); sortie.push(window.__rests.join('+')); }
    stopRest();
    return { marque, rechargee: S.wkt.exs[0].dropChaine === true, chrono: sortie.join('|'), types: S.wkt.exs[0].sets.map(s => s.type).join('') };
  });
  t('IIF-J09 ⭐ le marquage TRAVERSE la sauvegarde en programme (`saveAsProg`) et le rechargement (`loadProg`) : l\'exercice rechargé enchaîne encore ses paliers',
    sav.marque && sav.rechargee && sav.chrono === '||180' && sav.types === 'DDD', js(sav));

  // un exercice qui n'est pas un dropset ne reçoit jamais le marqueur, ni un dropset réduit à UN palier (aucune clé persistée en plus)
  await importer(jour([L('Curl barre EZ', 3, 12, 20, 'RIR 2', { rest: '90 s' }), L('Écarté', 1, 12, 10, '', { setType: 'D', rest: '2 min' }), L('Presse', 3, 10, 120, '', { rest: '2 min' })]));
  const pM = await enregistrer();
  t('IIF-J10 ⛔ AUCUNE clé persistée en plus hors dropset : ni un exercice ordinaire, ni un dropset à UN palier, ne reçoit `dropChaine`',
    pM.days[0].exs.every(e => !Object.prototype.hasOwnProperty.call(e, 'dropChaine')), js(pM.days[0].exs.map(e => e.name + ':' + Object.keys(e).join('/'))));
  });
  await section('K', async () => {
  // ── K. CORRECTION D (02/11/2026) — DES RÉPÉTITIONS QUE LE DOCUMENT N'ÉCRIT PAS : « NON RENSEIGNÉ », JAMAIS UN 10 INVENTÉ ──
  // Décision de Michel : l'absence de répétitions ne devient JAMAIS un 10 en silence (le premier jet de ce lot le mettait puis le signalait dans la
  // note). Le programme garde `reps: null`, l'aperçu et l'éditeur disent « Non renseigné », la séance demande le nombre à la personne ; une valeur
  // suggérée n'est jamais enregistrée à sa place. Les programmes d'AVANT (reps 0, séries « maxi ») gardent leur comportement.
  const espion = () => pg.evaluate(() => { window.__toasts = []; if (!window.__espionToast) { window.__espionToast = true; const o = window.toast; window.toast = function (m, ty) { window.__toasts.push(String(m)); return o.apply(this, arguments); }; }
    window.__rests = []; if (!window.__espion) { window.__espion = true; const o = window.startRest; window.startRest = function (sec) { window.__rests.push(sec); return o.apply(this, arguments); }; } });
  const ABS = () => L('Élévations latérales haltères', 3, 0, 8, 'Tempo lent', { rest: '1.30 mins' });          // le cas constaté : ni séries ni reps lisibles
  const MIX = () => L('Curl marteau', 3, 8, 14, '', { repsPerSet: [8, 0, 8], kgPerSet: [14, 14, 14], rest: '90 s' });
  const K0 = await vue([ABS()]);
  t('IIF-K01 ⭐⭐ des reps que le document n\'écrit PAS : le programme ENREGISTRÉ garde « Non renseigné » (`reps: null`) sur chaque série — jamais 10 —, et la note du coach reste intacte (rien d\'ajouté)',
    K0.ex[0].sets.length === 3 && K0.ex[0].sets.every(s => s.reps === null) && K0.ex[0].note === 'Tempo lent' && K0.ap[0].note === 'Tempo lent', js(K0.ex[0]));
  const K0b = await vue([MIX()]);
  t('IIF-K02 ⭐ une série SANS reps écrites entre deux séries qui en ont : celle-là seule est « Non renseigné » (8, null, 8) — elle ne reprend PAS les reps uniformes de l\'exercice',
    JSON.stringify(K0b.ex[0].sets.map(s => s.reps)) === '[8,null,8]', js(K0b.ex[0].sets.map(s => s.reps)));
  // l'APERÇU le dit (ligne résumé, détail par série, mention sur la carte) — et un type corrigé dans l'aperçu ne le perd pas
  await importer(jour([ABS(), MIX(), L('Presse', 3, 10, 120, '', { rest: '2 min' })]));
  const ap = await pg.evaluate(() => {
    _impOuverts.add('0-0'); _renderImpConfirm();
    const cartes = [...document.querySelectorAll('#imp-preview .imp-card')];
    const tx = (c, sel) => [...c.querySelectorAll(sel)].map(e => e.textContent).join(' | ');
    const lire = (ei) => JSON.stringify(_impVueSeries(_impExtracted.days[0].exercises[ei]).map(x => x.reps));
    const avant0 = lire(0), avant1 = lire(1);
    impBasculerType(0, 0, 1); impBasculerType(0, 1, 0);        // la personne corrige le type d'une série : l'aperçu MATÉRIALISE l'exercice (repsPerSet réécrit)
    return { somme0: tx(cartes[0], '.imp-sum'), infos0: tx(cartes[0], '.imp-info'), nr0: cartes[0].querySelectorAll('.imp-nr').length, det0: tx(cartes[0], '.imp-kr'),
      somme1: tx(cartes[1], '.imp-sum'), infos1: tx(cartes[1], '.imp-info'), somme2: tx(cartes[2], '.imp-sum'), infos2: tx(cartes[2], '.imp-info'),
      avant0, apres0: lire(0), avant1, apres1: lire(1) };
  });
  t('IIF-K03 ⭐ l\'APERÇU dit « Non renseigné » (résumé, détail série par série) et explique en une ligne que la personne saisira les répétitions à la séance',
    /Non renseigné/.test(ap.somme0) && ap.nr0 >= 4 && /Non renseigné/.test(ap.det0) && /Répétitions non écrites dans le document/.test(ap.infos0) && /rien n'est inventé/.test(ap.infos0), js(ap));
  t('IIF-K04 … la série seule sans reps est nommée dans une ligne mixte (« 8 · Non renseigné · 8 »), et un exercice dont toutes les reps sont écrites n\'a ni mention ni explication',
    /8.*Non renseigné.*8/.test(ap.somme1) && /Répétitions non écrites/.test(ap.infos1) && !/Non renseigné/.test(ap.somme2) && !/Répétitions non écrites/.test(ap.infos2), js({ somme1: ap.somme1, somme2: ap.somme2, infos2: ap.infos2 }));
  t('IIF-K05 ⛔ une correction de TYPE dans l\'aperçu (l\'exercice est matérialisé) ne transforme pas « Non renseigné » en autre chose — et la série sans reps ne retombe PAS sur les reps uniformes (8) de son exercice',
    ap.avant0 === '[null,null,null]' && ap.apres0 === '[null,null,null]' && ap.avant1 === '[8,null,8]' && ap.apres1 === '[8,null,8]', js({ a0: ap.avant0, p0: ap.apres0, a1: ap.avant1, p1: ap.apres1 }));
  // le RETRAIT est écrit (R30) : ni le 10 ni la note « 10 proposées » ne reviennent
  const retrait = await pg.evaluate(() => typeof _impSignalerRepsAbsentes);
  t('IIF-K06 ⛔ RETRAIT ÉCRIT — l\'ancien signalement « 10 proposées, à corriger » n\'existe plus (il masquait un 10 inventé) ; le programme n\'en porte ni le 10 ni la note',
    retrait === 'undefined' && K0.ex[0].sets.every(s => s.reps !== 10) && !/10 proposées|Répétitions non écrites/.test(JSON.stringify(K0.ex[0])), js({ retrait, ex: K0.ex[0] }));

  // la SÉANCE : champ vide à compléter, bandeau, validation protégée
  await importer(jour([ABS()])); await enregistrer();
  await espion();
  const sce = await pg.evaluate(() => {
    S.defRest = 130; S.exRestPref = {}; S.sessions = []; S.prs = {}; S.wkt = null; _loadProgDayVraiment(0, 0);
    const inp = document.querySelector('#sr-0-0 .sinp');
    return { reps: S.wkt.exs[0].sets.map(s => s.reps), cls: inp ? inp.className : '(absent)', val: inp ? inp.value : '(absent)', ph: inp ? inp.placeholder : '(absent)',
      hint: (document.querySelector('#ex-block-0 .reps-nr-hint') || {}).textContent || '', prog: JSON.stringify(S.programmes[0].days[0].exs[0].sets.map(s => s.reps)) };
  });
  t('IIF-K07 ⭐⭐ à la SÉANCE : les 3 séries portent `reps: null`, le champ est VIDE (aucun 10 pré-rempli), marqué « à compléter », et un bandeau dit « Non renseigné dans le programme »',
    JSON.stringify(sce.reps) === '[null,null,null]' && /sinp-nr/.test(sce.cls) && sce.val === '' && sce.ph === '?' && /Non renseigné dans le programme/.test(sce.hint), js(sce));
  const garde = await pg.evaluate(() => {
    const avant = JSON.stringify(S.wkt.exs[0].sets[0]);
    window.__toasts.length = 0; window.__rests.length = 0; stopRest();
    toggleSet(0, 0);
    const s = S.wkt.exs[0].sets[0];
    return { done: s.done, reps: s.reps, inchangee: avant === JSON.stringify(s), appels: window.__rests.length, chrono: !!restStartTs, toast: window.__toasts.join('|'), focus: !!(document.activeElement && document.activeElement.closest && document.activeElement.closest('#sr-0-0')) };
  });
  t('IIF-K08 ⭐⭐ VALIDATION PROTÉGÉE — toucher ✓ sans nombre ne valide RIEN (ni 0, ni 10), ne démarre aucun repos, dit quoi faire et ramène le curseur sur le champ ; la série reste « Non renseigné »',
    garde.done === false && garde.reps === null && garde.inchangee && garde.appels === 0 && !garde.chrono && /Saisis les répétitions/.test(garde.toast) && garde.focus, js(garde));
  // la vraie voie : on tape un nombre dans le champ (événement `change` compris), puis on touche ✓
  await pg.fill('#sr-0-0 .sinp', '12');
  const ok1 = await pg.evaluate(() => {
    document.querySelector('#sr-0-0 .sinp').dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector('#sr-0-0 .chk').click();
    const s = S.wkt.exs[0].sets[0];
    const ref = _workVol({ exs: [{ name: S.wkt.exs[0].name, sets: [{ kg: 8, reps: 12, done: true, type: 'N' }] }], uniConv: 1 });
    const r = { done: s.done, reps: s.reps, rm1: s.rm1, vol: _workVol({ exs: S.wkt.exs, uniConv: 1 }), ref, repos: restTot, enCours: !!restStartTs, autres: S.wkt.exs[0].sets.slice(1).map(x => [x.reps, x.done]), prog: JSON.stringify(S.programmes[0].days[0].exs[0].sets.map(x => x.reps)) };
    stopRest(); return r;
  });
  t('IIF-K09 ⭐⭐ un nombre TAPÉ puis ✓ valide la série : 12 répétitions, 1RM et volume calculés (le volume d\'une série 8 kg × 12 de référence), repos démarré (90 s) — les 2 autres séries restent « Non renseigné » et NON validées',
    ok1.done && ok1.reps === 12 && ok1.rm1 > 0 && ok1.ref > 0 && ok1.vol === ok1.ref && ok1.enCours && ok1.repos === 90 && JSON.stringify(ok1.autres) === '[[null,false],[null,false]]', js(ok1));
  t('IIF-K10 ⛔ la saisie de la séance n\'écrit JAMAIS dans le programme : il garde « Non renseigné » sur ses 3 séries (rien n\'est enregistré comme donnée du document)',
    ok1.prog === '[null,null,null]', js({ prog: ok1.prog }));

  // la suggestion grise (la dernière fois) n'est reprise que par L'APPUI de la personne — comme pour toute série
  const sug = await pg.evaluate(() => {
    stopRest(); S.wkt = null; _loadProgDayVraiment(0, 0);
    const inp = document.querySelector('#sr-0-1 .sinp'); inp.placeholder = '9';          // une suggestion visible dans le champ (historique)
    const avant = S.wkt.exs[0].sets[1].reps;
    toggleSet(0, 1);
    const s = S.wkt.exs[0].sets[1]; const r = { avant, apres: s.reps, done: s.done, prog: S.programmes[0].days[0].exs[0].sets[1].reps }; stopRest(); return r;
  });
  t('IIF-K11 ⭐ une suggestion VISIBLE dans le champ n\'est reprise qu\'à l\'appui de ✓ (avant : « Non renseigné » ; après : 9 dans la séance) — le programme, lui, n\'est jamais touché',
    sug.avant === null && sug.apres === 9 && sug.done === true && sug.prog === null, js(sug));

  // FIN DE SÉANCE : l'historique ne porte jamais `null`, volume et records ne comptent que le validé
  const fin = await pg.evaluate(async () => {
    stopRest(); S.defRest = 130; S.sessions = []; S.prs = {}; S.wkt = null; _loadProgDayVraiment(0, 0);
    const inp = document.querySelector('#sr-0-0 .sinp'); inp.value = '10'; toggleSet(0, 0); stopRest();       // 1 série validée : 10 × 8 kg ; les 2 autres restent « Non renseigné »
    const nom = S.wkt.exs[0].name;
    const ref = _workVol({ exs: [{ name: nom, sets: [{ kg: 8, reps: 10, done: true, type: 'N' }] }], uniConv: 1 });
    _finishing = false; await finishWorkout(); _finishing = false;
    const s = S.sessions[0]; const sets = s.exs[0].sets;
    return { nbSessions: S.sessions.length, reps: sets.map(x => x.reps), done: sets.map(x => !!x.done), volume: s.volume, ref: Math.round(ref), aucunNull: sets.every(x => x.reps !== null) && (s.exercises[0].sets || []).every(x => x.reps !== null),
      pr: S.prs[nom] ? { reps: S.prs[nom].reps, kg: S.prs[nom].kg } : null, prog: JSON.stringify(S.programmes[0].days[0].exs[0].sets.map(x => x.reps)) };
  });
  t('IIF-K12 ⭐⭐ FIN DE SÉANCE — l\'historique enregistré ne porte AUCUN `null` (les séries non faites valent 0), seule la série validée compte (volume de 10 × 8 kg, record 10 × 8 kg), le programme garde « Non renseigné »',
    fin.nbSessions === 1 && JSON.stringify(fin.reps) === '[10,0,0]' && JSON.stringify(fin.done) === '[true,false,false]' && fin.aucunNull && fin.ref > 0 && fin.volume === fin.ref && fin.pr && fin.pr.reps === 10 && fin.pr.kg === 8 && fin.prog === '[null,null,null]', js(fin));

  // SAUVEGARDER LA SÉANCE EN PROGRAMME : « Non renseigné » reste « Non renseigné » (avant : 5)
  const sav2 = await pg.evaluate(() => {
    S.sessions = []; S.wkt = null; _loadProgDayVraiment(0, 0); stopRest();
    document.getElementById('prog-name-inp').value = 'Sans reps (copie)'; saveAsProg();
    const c = S.programmes.find(p => p.name === 'Sans reps (copie)');
    return { reps: JSON.stringify(c.exs[0].sets.map(s => s.reps)) };
  });
  t('IIF-K13 ⭐ « 💾 Sauvegarder comme programme » une séance dont les reps ne sont pas renseignées les garde « Non renseigné » (ni 5, ni 10)', sav2.reps === '[null,null,null]', js(sav2));
  const add = await pg.evaluate(() => { S.sessions = []; S.wkt = null; _loadProgDayVraiment(0, 0); stopRest(); addSet(0); const r = S.wkt.exs[0].sets.map(s => s.reps); S.wkt = null; return r; });
  t('IIF-K14 ⭐ « + série » copie une série « Non renseigné » : la nouvelle l\'est aussi (et non un 8 d\'office)', JSON.stringify(add) === '[null,null,null,null]', js(add));

  // L'ÉDITEUR DE PROGRAMME : champ marqué, placeholder « ? », saisir un nombre, vider = « Non renseigné », « + série » copie, « maxi » intact
  const ed = await pg.evaluate(() => {
    S.programmes = JSON.parse(JSON.stringify(S.programmes.filter(p => p.name !== 'Sans reps (copie)')));
    editProg(0);
    const champs = [...document.querySelectorAll('#prog-edit-content input.reps-nr')];
    const r = { n: champs.length, ph: champs.map(c => c.placeholder).join(''), titre: champs[0] ? champs[0].title : '', hint: /Non renseigné/.test((document.getElementById('prog-edit-content') || {}).textContent || '') };
    _setProgSetReps(0, 0, 0, '12'); r.saisi = _editProgData.days[0].exs[0].sets[0].reps;
    _setProgSetReps(0, 0, 0, ''); r.vide = _editProgData.days[0].exs[0].sets[0].reps;
    _setProgSetReps(0, 0, 1, 'abc'); r.illisible = _editProgData.days[0].exs[0].sets[1].reps;
    _addProgSet(0, 0); r.copie = _editProgData.days[0].exs[0].sets.map(s => s.reps);
    const ex = _editProgData.days[0].exs[0]; ex.sets[0] = { kg: 5, reps: 0, maxi: true, type: 'N', rest: 0 };           // une série « maxi » (d'avant) : son 0 est SON état
    _setProgSetReps(0, 0, 0, ''); r.maxi = [ex.sets[0].reps, ex.sets[0].maxi];
    _toggleProgSetMaxi(0, 0, 0); r.maxiOff = [ex.sets[0].reps, ex.sets[0].maxi];                                        // « maxi » retiré sans nombre : « Non renseigné », pas un 0 que la séance remplacerait par 10
    _toggleProgSetMaxi(0, 0, 0); r.maxiOn = [ex.sets[0].reps, ex.sets[0].maxi];
    closeProgEdit();
    return r;
  });
  t('IIF-K15 ⭐ ÉDITEUR — les séries « Non renseigné » ont un champ marqué (placeholder « ? »), la mention est dite ; saisir 12 → 12 ; vider ou saisir n\'importe quoi → « Non renseigné » ; « + série » copie « Non renseigné » ; « maxi » garde son 0, et son retrait sans nombre donne « Non renseigné »',
    ed.n === 3 && ed.ph === '???' && /Non renseigné/.test(ed.titre) && ed.hint && ed.saisi === 12 && ed.vide === null && ed.illisible === null && JSON.stringify(ed.copie) === '[null,null,null,null]'
    && JSON.stringify(ed.maxi) === '[0,true]' && JSON.stringify(ed.maxiOff) === '[null,false]' && JSON.stringify(ed.maxiOn) === '[0,true]', js(ed));

  // LES DONNÉES D'AVANT : un programme enregistré avant ce correctif garde EXACTEMENT son comportement (chargement identique à la base e2b942f3)
  const hist = await pg.evaluate(() => {
    S.programmes = [{ id: 'pH', name: 'Ancien', weeks: 0, startDate: '', days: [{ label: 'J1', exs: [
      { name: 'Squat à la Barre', note: '', sets: [{ kg: 100, reps: 0, type: 'N', rest: 120 }, { kg: 100, reps: 12, type: 'N', rest: 120 }, { kg: 100, type: 'N', rest: 120 }] },
      { name: 'Tractions', note: '', sets: [{ kg: 0, reps: 0, maxi: true, type: 'N', rest: 90 }] }] }] },
      { id: 'pH2', name: 'Ancien 1 jour', weeks: 0, startDate: '', exs: [{ name: 'Curl barre EZ', note: '', sets: [{ kg: 20, reps: 0, type: 'N', rest: 90 }, { kg: 20, reps: 8, type: 'N', rest: 90 }] }] }];
    S.sessions = []; S.wkt = null;
    const avant = JSON.stringify(S.programmes);
    _loadProgDayVraiment(0, 0);
    const a = S.wkt.exs.map(e => e.sets.map(s => [s.reps, !!s.maxi]));
    S.wkt = null; loadProg(1);
    const b = S.wkt.exs.map(e => e.sets.map(s => [s.reps, !!s.maxi]));
    S.wkt = null; _loadProgDayVraiment(0, 0);
    toggleSet(1, 0);                                            // la série « maxi » se valide comme avant (sans nombre exigé)
    const maxiValide = S.wkt.exs[1].sets[0].done; stopRest();
    return { a, b, maxiValide, intacte: avant === JSON.stringify(S.programmes) };
  });
  t('IIF-K16 ⭐⭐ DONNÉES D\'AVANT — un programme enregistré avec `reps: 0` (ou sans reps) charge toujours 10 (jour) / 5 (programme simple), `12` reste 12, une série « maxi » reste 0 et se valide comme avant ; rien n\'est réécrit',
    JSON.stringify(hist.a) === '[[[10,false],[12,false],[10,false]],[[0,true]]]' && JSON.stringify(hist.b) === '[[[5,false],[8,false]]]' && hist.maxiValide === true && hist.intacte, js(hist));

  // LE PAPIER, LE PDF, L'ANALYSE ET MILO : « ? », jamais « null », jamais un nombre inventé
  await importer(jour([ABS(), MIX()])); await enregistrer();
  const pap = await pg.evaluate(() => {
    const idx = S.programmes.length - 1;
    window.print = () => {}; printProg(idx);
    const feuille = (document.getElementById('print-area') || {}).textContent || '';
    return { unit: [_valRepsProg([{ reps: 12 }, { reps: 12 }]), _valRepsProg([{ reps: null }, { reps: null }]), _valRepsProg([{ reps: 12 }, { reps: null }, { reps: 10 }]), _valRepsProg([{ reps: 0 }, { reps: 0 }])].join(' ; '),
      feuille: /3 × \?/.test(feuille) && /8\/\?\/8/.test(feuille) && !/null|undefined/.test(feuille), analyse: _formatProgForAnalysis(S.programmes[idx]),
      aPlat: _formatProgForAnalysis({ exs: [{ name: 'Curl', sets: [{ kg: 0, reps: null }, { kg: 0, reps: null }] }] }) };
  });
  t('IIF-K17 ⭐ SUR PAPIER — « 3 × ? » et « 8/?/8 » (jamais « null »), le reste inchangé (12 · 12/10/8 · 0) ; l\'analyse envoyée à Milo dit « 3×? »',
    pap.unit === '12 ; ? ; 12/?/10 ; 0' && pap.feuille && /×\?/.test(pap.analyse) && !/null|undefined/.test(pap.analyse) && /Curl : 2×\?/.test(pap.aPlat), js(pap));
  const milo = await pg.evaluate(() => { try { const c = buildCoachContext('Salut', {}); return { ok: typeof c === 'string', ligne: ((String(c).match(/SES PROGRAMMES ENREGISTRÉS[\s\S]{0,1200}/) || [''])[0]) }; } catch (e) { return { ok: false, err: String(e) }; } });
  t('IIF-K18 ⭐ MILO voit « Non renseigné » comme « ? » dans les programmes enregistrés (« 3×? »), jamais « 3×0 » ni un nombre inventé', milo.ok && /Élévation[^·\n]*3×\?/.test(milo.ligne) && /Marteau[^·\n]*3×8/.test(milo.ligne) && !/3×0/.test(milo.ligne), js(milo));

  // UN PROGRAMME À UN SEUL JOUR (l'autre chargeur) et la saisie : « Non renseigné » ne se transforme pas en 5 ni en 0
  const un = await pg.evaluate(() => {
    S.programmes = [{ id: 'pN', name: 'Un jour sans reps', weeks: 0, startDate: '', exs: [{ name: 'Curl barre EZ', note: '', sets: [{ kg: 20, reps: null, type: 'N', rest: 90 }, { kg: 20, reps: 8, type: 'N', rest: 90 }] }] }];
    S.sessions = []; S.wkt = null; loadProg(0);
    const charge = S.wkt.exs[0].sets.map(s => s.reps);
    upSet(0, 0, 'reps', ''); const vide = S.wkt.exs[0].sets[0].reps;               // effacer un champ déjà vide ne l'invente pas à 0
    upSet(0, 0, 'reps', 'abc'); const illisible = S.wkt.exs[0].sets[0].reps;
    upSet(0, 0, 'reps', '14'); const saisi = S.wkt.exs[0].sets[0].reps;
    S.wkt = null; return { charge, vide, illisible, saisi };
  });
  // la touche ENTRÉE du champ de charge (valider et passer à la suivante) : refusée sur « Non renseigné », le curseur RESTE sur la série
  await importer(jour([ABS()])); await enregistrer();
  const ent = await pg.evaluate(() => {
    S.sessions = []; S.defRest = 130; S.wkt = null; _loadProgDayVraiment(0, 0); stopRest();
    const dans = (i) => !!(document.activeElement && document.activeElement.closest && document.activeElement.closest('#sr-0-' + i));
    confirmSetAndNext(0, 0);                                                  // sans nombre : refusée
    const refus = { done: S.wkt.exs[0].sets[0].done, surLaSerie: dans(0), surLaSuivante: dans(1) };
    document.querySelector('#sr-0-0 .sinp').value = '11'; confirmSetAndNext(0, 0);   // avec un nombre : validée, le curseur passe à la suivante
    const ok = { done: S.wkt.exs[0].sets[0].done, reps: S.wkt.exs[0].sets[0].reps, surLaSuivante: dans(1) };
    stopRest(); S.wkt = null; return { refus, ok };
  });
  t('IIF-K20 ⭐ ENTRÉE dans le champ de charge d\'une série « Non renseigné » sans nombre : refusée, le curseur RESTE sur cette série (il ne saute pas à la suivante) ; avec un nombre : validée et le curseur passe à la suivante',
    ent.refus.done === false && ent.refus.surLaSerie && !ent.refus.surLaSuivante && ent.ok.done === true && ent.ok.reps === 11 && ent.ok.surLaSuivante, js(ent));
  t('IIF-K19 ⭐ un programme à UN SEUL jour (`loadProg`) garde aussi « Non renseigné » (pas de 5) ; effacer ou mal saisir un champ « Non renseigné » ne l\'invente pas à 0 ; un nombre saisi est repris (14)',
    JSON.stringify(un.charge) === '[null,8]' && un.vide === null && un.illisible === null && un.saisi === 14, js(un));
  });
  await section('P', async () => {
  // ── P. LA FORME DU PDF DE MICHEL (IMPORT PDF, 08/11/2026 — « GO CORRECTIF IMPORT PDF ») ──
  //    « X - échauffement » + « X » = UN exercice · plages « 4-5 min » = 4:00 au chrono, consigne d'origine gardée et modifiable · top set / back-offs lisibles · 4 séances dont la facultative · commentaires conservés.
  //    ⛔ TOUT EST INVENTÉ (le dépôt est public) : seule la FORME du document est reprise (noms de lignes, nombres de séries, plages d'écriture) — jamais ses valeurs réelles ni sa mise en page.
  const POUSSEE = [
    L('Développé Couché - échauffement', 5, 0, 0, 'Barre à vide pour la 1ʳᵉ série', { repsPerSet: [10, 5, 3, 1, 1], kgPerSet: [0, 40, 55, 70, 80] }),
    L('Développé Couché', 3, 0, 0, 'RIR 2 | top set puis deux back-offs', { repsPerSet: [2, 3, 3], kgPerSet: [90, 85, 85], rest: '4-5 min' }),
    L('Chest Press inclinée', 3, 8, 40, '', { rest: '2 min' })];
  const TIRAGE = [
    L('Soulevé de Terre - échauffement', 5, 0, 0, '', { repsPerSet: [8, 5, 3, 1, 1], kgPerSet: [0, 50, 80, 100, 120] }),
    L('Soulevé de Terre', 3, 0, 0, 'RIR 2', { repsPerSet: [3, 3, 3], kgPerSet: [140, 130, 130], rest: '4-5 min' })];
  const JAMBES = [
    L('Squat à la Barre - échauffement', 5, 0, 0, '', { repsPerSet: [10, 5, 3, 2, 1], kgPerSet: [0, 40, 60, 80, 90] }),
    L('Squat à la Barre', 3, 0, 0, 'RIR 2', { repsPerSet: [3, 3, 3], kgPerSet: [110, 100, 100], rest: '4-5 min' })];
  const BRAS = [L('Curl Biceps Haltères', 3, 12, 14, 'Séance facultative', { rest: '90 s' })];
  const PDF = { name: 'Jumeau inventé de la forme du PDF', weeks: 8, startDate: '', days: [
    { label: 'SÉANCE 1 — Poussée', exercises: POUSSEE }, { label: 'SÉANCE 2 — Tirage', exercises: TIRAGE },
    { label: 'SÉANCE 3 — Jambes', exercises: JAMBES }, { label: 'SÉANCE 4 (facultative) — Bras', exercises: BRAS }] };
  await importer(PDF);
  const ap = await pg.evaluate(() => {
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    document.getElementById('ov-import-prog').classList.add('open'); _renderImpConfirm();
    const cartes = [...document.querySelectorAll('#imp-preview .imp-card')].map(c => ({ nom: c.querySelector('.imp-nom').textContent, statut: c.getAttribute('data-statut'),
      ech: +c.getAttribute('data-ech'), trav: +c.getAttribute('data-trav'), texte: c.querySelector('.imp-sum').innerText, note: (c.querySelector('.imp-note') || { textContent: '' }).textContent }));
    const total = (document.querySelector('#imp-preview > div') || { innerText: '' }).innerText;
    return { cartes, total, jours: _impExtracted.days.map(d => d.exercises.map(e => e.name)) };
  });
  const cDC = ap.cartes[0] || {};
  t('IPDF-A01 ⭐⭐ « Développé Couché - échauffement » + « Développé Couché » = UN SEUL exercice (5 échauffements + 3 travail), idem Soulevé de Terre et Squat : 5 cartes pour 3 séances de 2+1+1 exercices, AUCUNE carte « … - échauffement »',
    ap.cartes.length === 5 && ap.cartes.every(c => !/chauffement/i.test(c.nom)) && cDC.ech === 5 && cDC.trav === 3 && (ap.cartes[2] || {}).ech === 5 && (ap.cartes[3] || {}).ech === 5, js({ jours: ap.jours, cDC }));
  t('IPDF-A02 ⭐ le rattachement ne propose plus de « ≈ Rattacher… » pour une carte d\'échauffement qui n\'existe plus : les trois mouvements de force sont « Reconnu », aucune proposition en attente',
    [0, 2, 3].every(i => (ap.cartes[i] || {}).statut === 'ok'), js(ap.cartes.map(c => [c.nom, c.statut])));
  t('IPDF-B01 ⭐⭐ L\'APERÇU est fidèle : échauffements ET travail avec leurs charges, reps (jamais « ×0 »), top set 90 × 2 puis back-offs 85 × 3, repos « 4 min (écrit : 4-5 min) »',
    /Échauffement/.test(cDC.texte) && /Travail/.test(cDC.texte) && /40 kg × 5/.test(cDC.texte) && /90 kg × 2/.test(cDC.texte) && /85 kg × 3/.test(cDC.texte)
    && /4 min \(écrit : 4-5 min\)/.test(cDC.texte) && !/×\s*0\b/.test(cDC.texte) && !/\b0 reps\b/.test(cDC.texte), js(cDC));
  t('IPDF-B02 ⭐ le décompte annonce les QUATRE séances et les 15 échauffements regroupés, et dit que 9 repos sont écrits en plage (borne basse proposée)',
    /4 séances/.test(ap.total) && /dont 15 d.échauffement/.test(ap.total) && /9 repos écrits/.test(ap.total) && /borne basse/.test(ap.total), js(ap.total));
  const prog = await enregistrer();
  const dcP = trouve(prog, 0, 'Développé couché');
  const d0 = dcP[0] || { sets: [] };
  t('IPDF-A03 ⭐⭐ ENREGISTRÉ : UN exercice « Développé Couché » de 8 séries, types ÉÉÉÉÉNNN, charges 0·40·55·70·80 puis 90·85·85, reps 10·5·3·1·1 puis 2·3·3, dans l\'ordre du document',
    dcP.length === 1 && TYPES(d0) === 'ÉÉÉÉÉNNN' && d0.sets.map(s => s.kg).join() === '0,40,55,70,80,90,85,85' && d0.sets.map(s => s.reps).join() === '10,5,3,1,1,2,3,3', js(SERIES(d0)));
  t('IPDF-A04 ⭐⭐ ENREGISTRÉ : les repos « 4-5 min » deviennent 240 s sur les 3 séries de travail (borne basse) ET la consigne « 4-5 min » est CONSERVÉE série par série ; les échauffements, sans repos écrit, n\'en reçoivent pas',
    d0.sets.map(s => s.rest).join() === '0,0,0,0,0,240,240,240' && d0.sets.map(s => s.restTxt || '').join('|') === '|||||4-5 min|4-5 min|4-5 min', js(SERIES(d0)));
  const noms = prog.days.map(d => d.exs.map(e => e.name));
  t('IPDF-A05 ⭐⭐ les QUATRE séances sont là, la 4ᵉ « facultative » avec son libellé et son exercice ; aucun exercice perso « … - échauffement » n\'a été créé',
    prog.days.length === 4 && /facultative/i.test(prog.days[3].label) && prog.days[3].exs.length === 1 && prog.days.every(d => d.exs.every(e => !/chauffement/i.test(e.name)))
    && ((await pg.evaluate(() => (S.customExercises || []).map(e => e.n))).every(n => !/chauffement/i.test(n))), js({ labels: prog.days.map(d => d.label), noms }));
  t('IPDF-A06 ⭐ les COMMENTAIRES du document sont conservés : la note du travail (RIR, top set / back-offs) ET celle de l\'échauffement (« Barre à vide… », étiquetée « Échauffement : »), rien n\'est perdu à la fusion',
    /RIR 2/.test(d0.note) && /top set/.test(d0.note) && /Échauffement : Barre à vide/.test(d0.note), js({ note: d0.note }));

  // ── la SÉANCE : le chrono propose 4:00, la consigne d'origine reste affichée, « Régler » propose 4:00 et 5:00 ──
  const seqP = await sequence(S_IDX(0), 0, 0);
  t('IPDF-C01 ⭐⭐ LE CHRONO : les 3 séries de travail lancent 240 s (4:00, la borne basse) et la consigne « 4-5 min » reste AFFICHÉE avec « chrono réglé sur 4:00 » ; les échauffements gardent leurs repos par type',
    [5, 6, 7].every(i => seqP[i].appel[0] === 240 && seqP[i].tot === 240 && /4-5 min/.test(seqP[i].consigne) && /4:00/.test(seqP[i].consigne)) && [0, 1, 2, 3, 4].every(i => seqP[i].appel[0] > 0 && seqP[i].appel[0] < 240 && seqP[i].consigne === ''),
    js({ apps: seqP.map(x => x.appel[0]), cons: seqP.slice(4).map(x => x.consigne) }));
  const choixP = await pg.evaluate(() => {
    S.defRest = 130; S.exRestPref = {}; S.wkt = null; _loadProgDayVraiment(0, 0);
    stopRest(); toggleSet(0, 5); openRestEdit();
    const rc = document.getElementById('re-consigne');
    const avant = { min: (document.getElementById('rc-min') || {}).textContent || '', max: (document.getElementById('rc-max') || {}).textContent || '', tot: restTot };
    const mx = document.getElementById('rc-max'); if (mx) mx.click();
    const apres = { tot: restTot }; stopRest(); return { avant, apres };
  });
  t('IPDF-C02 ⭐⭐ « Régler » propose les DEUX bornes (4:00 et 5:00) : le chrono tournait déjà à 4:00 (proposé), la personne choisit 5:00 → 300 s',
    choixP.avant.min === '4:00' && choixP.avant.max === '5:00' && choixP.avant.tot === 240 && choixP.apres.tot === 300, js(choixP));

  // ── l'ÉDITEUR : la consigne d'origine reste VISIBLE et le chiffre se MODIFIE sans effacer le texte ──
  const edit = await pg.evaluate(() => {
    editProg(0);
    const el = document.getElementById('prog-edit-content');
    const avant = el ? el.innerText : '';
    _setProgSetRest(0, 0, 5, '270');                           // la personne change la 1ʳᵉ série de travail à 4 min 30
    const s5 = _editProgData.days[0].exs[0].sets[5];
    _renderProgEdit();
    const apres = document.getElementById('prog-edit-content').innerText;
    const out = { avant, apres, rest: s5.rest, txt: s5.restTxt, r6: _editProgData.days[0].exs[0].sets[6].rest };
    closeProgEdit(); return out;
  });
  t('IPDF-C03 ⭐⭐ ÉDITEUR : la consigne d\'origine « 4-5 min » est LISIBLE sous les séries de travail (« séries 6 à 8 »), le chiffre se modifie (270 s) SANS effacer le texte écrit, et les voisines gardent 240 s',
    /repos écrit dans le document : « 4-5 min » \(séries 6 à 8\)/.test(edit.avant) && edit.rest === 270 && edit.txt === '4-5 min' && edit.r6 === 240 && /repos écrit dans le document/.test(edit.apres), js({ rest: edit.rest, txt: edit.txt, r6: edit.r6, extrait: (edit.avant.match(/repos écrit[^\n]*/) || [''])[0] }));
  // un commentaire importé plus long que 300 caractères n'est JAMAIS coupé par la première frappe
  const note = await pg.evaluate(() => {
    editProg(0);
    const ex = _editProgData.days[0].exs[0]; const longue = 'RIR 2 | ' + 'consigne du coach '.repeat(25);      // ≈ 450 caractères
    ex.note = longue; _setProgExNote(0, 0, longue + ' +ajout'); const apres = ex.note;
    ex.note = 'courte'; _setProgExNote(0, 0, 'x'.repeat(400)); const plafond = ex.note.length;                     // un commentaire TAPÉ reste plafonné à 300
    closeProgEdit(); return { avant: longue.length, apres: apres.length, plafond };
  });
  t('IPDF-E01 ⭐ un commentaire IMPORTÉ de ≈450 caractères survit à la première frappe (aucune coupure silencieuse) ; un commentaire TAPÉ reste plafonné à 300',
    note.apres === note.avant + ' +ajout'.length && note.plafond === 300, js(note));

  // ── les FORMES du marqueur (à la fin, après un séparateur) et les CONTRE-EXEMPLES (R29 : sans preuve, rien ne bouge) ──
  const mini = (nomEch, nomTrav, extraEch, extraTrav) => [
    L(nomEch, 2, 0, 0, '', Object.assign({ repsPerSet: [8, 4], kgPerSet: [40, 60] }, extraEch || {})), L(nomTrav, 3, 5, 100, '', Object.assign({ rest: '3 min' }, extraTrav || {}))];
  const resume = async (exs) => { const v = await vue(exs); return { n: v.ex.length, noms: v.ex.map(e => e.name), types: v.ex.map(e => TYPES(e)) }; };
  const FORMES = ['Squat à la Barre – ECH', 'Squat à la Barre : échauffement', 'Squat à la Barre | warm-up', 'Squat à la Barre - warm-up', 'Squat à la Barre - échauffement léger', 'Squat à la Barre - Montée en charge', 'Squat à la Barre - ECH 1', 'Squat à la Barre / échauffement progressif'];
  const ecartF = [];
  for (const f of FORMES) { const r = await resume(mini(f, 'Squat à la Barre')); if (!(r.n === 1 && r.types[0] === 'ÉÉNNN' && /^squat/.test(_naz(r.noms[0])))) ecartF.push(f + ' → ' + js(r)); }
  t('IPDF-F01 ⭐⭐ le marqueur à la FIN du nom est reconnu sous toutes ses formes (' + FORMES.length + ') : tiret, tiret long, deux-points, barre, « warm-up », « léger / progressif », « Montée en charge », numéro → UN exercice ÉÉNNN', ecartF.length === 0, ecartF.join(' | '));
  const rb = await resume(mini('Squat à la Barre - Bulgare', 'Squat à la Barre'));
  t('IPDF-F02 ⛔⛔ « Squat - Bulgare » n\'est PAS un échauffement : deux exercices, aucune série retypée, aucun regroupement (les charges d\'un squat ne passent jamais sur une fente)', rb.n === 2 && rb.types.join() === 'NN,NNN', js(rb));
  const seul = await resume([L('Squat à la Barre - échauffement', 2, 0, 0, '', { repsPerSet: [8, 4], kgPerSet: [40, 60] }), L('Rowing barre', 3, 8, 60, '', {})]);
  t('IPDF-F03 ⛔ un échauffement SANS ligne de travail du même exercice derrière reste ce que le document en dit : deux exercices, rien retypé, rien renommé', seul.n === 2 && seul.types.join() === 'NN,NNN' && /chauffement/i.test(seul.noms[0]), js(seul));
  const inter = await resume([mini('Squat à la Barre - échauffement', 'Rowing barre')[0], L('Rowing barre', 3, 8, 60, '', {}), L('Squat à la Barre', 3, 5, 100, '', {})]);
  t('IPDF-F04 ⛔ un AUTRE exercice entre l\'échauffement et le travail COUPE le bloc : trois exercices, aucun regroupement', inter.n === 3 && inter.types.join() === 'NN,NNN,NNN', js(inter));
  const apresT = await resume([L('Squat à la Barre', 3, 5, 100, '', {}), L('Squat à la Barre - échauffement', 2, 0, 0, '', { repsPerSet: [8, 4], kgPerSet: [40, 60] })]);
  t('IPDF-F05 ⛔ un échauffement APRÈS le travail n\'est pas fusionné dans le travail qui le précède (ouvrir un autre bloc seul) : deux exercices', apresT.n === 2 && apresT.types[0] === 'NNN', js(apresT));
  const ss = await resume(mini('Squat à la Barre - échauffement', 'Squat à la Barre', { supersetGroup: 'A' }, { supersetGroup: 'A' }));
  t('IPDF-F06 ⛔ un superset n\'est jamais touché : l\'échauffement nommé « - échauffement » reste séparé', ss.n === 2, js(ss));
  const mat = await resume(mini('Développé militaire barre - échauffement', 'Développé militaire haltères'));
  t('IPDF-F07 ⛔ matériels qui se contredisent (barre / haltères) : jamais fusionnés d\'office — l\'échauffement à la barre ne passe pas sur un travail aux haltères', mat.n === 2, js(mat));

  // ── les QUATRE séances : la facultative n'est jamais collée à sa voisine de même numéro ──
  const nbJours = async (labels) => {
    await importer({ name: 'Séances', weeks: 0, startDate: '', days: labels.map((lb, i) => ({ label: lb, exercises: [L('Exercice test ' + (i + 1), 3, 8, 20, '')] })) });
    return pg.evaluate(() => _impExtracted.days.map(d => d.label));
  };
  const sFac = await nbJours(['Séance 1', 'Séance 2', 'Séance 3', 'Séance 3 – facultative']);
  const sBis = await nbJours(['Séance 3', 'Séance 3 bis']);
  const sSans = await nbJours(['Séance 3', 'Séance facultative']);
  const sTrois = await nbJours(['Séance 1 - Dorsaux', 'Séance 1 - Biceps']);
  const sDeux = await nbJours(['Séance 4 (facultative) - Biceps', 'Séance 4 (facultative) - Triceps']);   // 1 seule, qui GARDE le mot dans son libellé
  t('IPDF-D01 ⭐⭐ « Séance 3 – facultative » après « Séance 3 » reste UNE séance à part (4 séances), idem « Séance 3 bis » et « Séance facultative » ; la fusion par numéro des sections d\'une même séance est INTACTE (Dorsaux + Biceps = 1 ; deux sections d\'une même facultative = 1)',
    sFac.length === 4 && sBis.length === 2 && sSans.length === 2 && sTrois.length === 1 && sDeux.length === 1 && /facultative/i.test(sDeux[0]) && /facultative/i.test(sFac[3]), js({ sFac, sBis, sSans, sTrois, sDeux }));
  });
  t('IIF-C04 aucune erreur de page, aucun appel réel', errs.length === 0 && reels === 0, js({ errs, reels }));
  await cx.close();
  function S_IDX() { return 0; }
};
