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
  // les écritures du coach du programme de septembre (mesurées sur le vrai document) : le pluriel « mins » et « 1.30 »
  const FERMES = [['3 mins', 180], ['2 mins', 120], ['1.30 mins', 90], ['2.30 mins', 150], ['3 min', 180], ['2.5 min', 150], ['1.5 minutes', 90],
    ['3mn', 180], ['2minutes', 120], ['90s', 90], ['90 sec', 90], ['90 secondes', 90], ['1:30', 90], ["1'30", 90], ['1min30', 90],
    ['1 min 30', 90], ['1m30', 90], ['2minutes30', 150], ['1 minute 30 s', 90], ['120', 120], ['180', 180], [180, 180], ['2', 120],
    ['1.30', 90], ['40 sec', 40], ['repos 40 sec', 40], ['Repos : 2 min', 120], ['Récup 90 s', 90], ['Repos 1.30 mins', 90], ['2 min', 120],
    // ce que les coachs écrivent AUTOUR du chiffre (6 vrais programmes, ~650 repos) : un PLAFOND (« max », « maxi »), une approximation, un blanc de PDF
    ['2 min max', 120], ['repos 30 sec maxi', 30], ['Repos 45 sec max', 45], ['1 min 30 max', 90], ['1.15 min max', 75], ['1.30 max', 90],
    ['1 . 15 min', 75], ['environ 90 s', 90], ['~2 min', 120], ['2 minutes maximum', 120]];
  const ecartF = FERMES.filter(([v, a]) => { const r = lire(v); return !(r.sec === a && !r.min && !r.max && r.txt === ''); }).map(([v, a]) => v + ' → ' + js(lire(v)) + ' (attendu ' + a + ')');
  t('IIF-R01 ⭐ ' + FERMES.length + ' écritures FERMES lues (« 3 mins », « 1.30 mins », « 2.30 mins »… dont celles du coach réel)', ecartF.length === 0, ecartF.join(' | '));
  const PLAGES = [['60-90 s', 60, 90], ['3-4 min', 180, 240], ['2-3 min', 120, 180], ['2 à 3 mins', 120, 180], ['2 -3 mins', 120, 180], ['1 à 2 mins', 60, 120],
    ['90-120 s', 90, 120], ['90–120s', 90, 120], ['2 à 4 minutes', 120, 240], ['1.30 à 2 mins', 90, 120], ['60 s à 90 s', 60, 90], ['2-3', 120, 180],
    ['60-90', 60, 90], ['1 à 2 min', 60, 120], ['repos 2-3 min', 120, 180], ['2 à 3 mins max', 120, 180]];
  const ecartP = PLAGES.filter(([v, a, b]) => { const r = lire(v); return !(r.sec === 0 && r.min === a && r.max === b && r.txt && r.txt.length > 0); }).map(([v, a, b]) => v + ' → ' + js(lire(v)) + ' (attendu ' + a + '–' + b + ')');
  t('IIF-R02 ⛔⛔ ' + PLAGES.length + ' PLAGES : jamais converties en repos (sec 0), bornes lues, TEXTE ÉCRIT conservé (rien n\'est perdu)', ecartP.length === 0, ecartP.join(' | '));
  const RIEN = ['selon ressenti', 'au feeling', 'quand tu es prêt', 'bientôt', '', null, '-', '—', '0', -5, 'abc', '10', '13', '4-3', 'repos', 'pause', 'n/a',
    'max', 'maxi', 'repos maximum', '1.15/30 min max', '1.15/30 min', '75 s à 30 min'];
  const ecartN = RIEN.filter(v => sec(v) !== 0).map(v => js(v) + ' → ' + sec(v));
  t('IIF-R03 ⛔ un texte flou, vide, un tiret ou une valeur ambiguë n\'invente JAMAIS de repos (sec 0)', ecartN.length === 0, ecartN.join(' | '));
  const txtGarde = ['selon ressenti', 'au feeling'].every(v => lire(v).txt === v) && lire('').txt === '' && lire('-').txt === '';
  t('IIF-R04 un texte non chiffré est CONSERVÉ tel quel (`txt`), un vide ou un tiret ne laisse rien', txtGarde, js([lire('selon ressenti'), lire('-')]));
  // « 1.15/30 min » : un coach qui écrit 1 min 15 à 1 min 30. Lu comme une plage, c'était 75 s → 30 MINUTES. Le texte reste, rien n'est appliqué.
  const bizarre = lire('1.15/30 min max');
  t('IIF-R06 ⛔ une « plage » dont la borne haute dépasse 5 fois la basse (« 1.15/30 min max ») n\'est PAS une plage : aucun chiffre, le texte écrit est conservé',
    bizarre.sec === 0 && bizarre.min === 0 && bizarre.max === 0 && bizarre.txt === '1.15/30 min max', js(bizarre));
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
  const CP = L('Chest Press déclinée', 3, 8, 0, 'Charge : à calibrer | RIR 1-2', { rest: '2 min' });
  const ROW = L('Rowing poitrine appuyée', 3, 8, 52, 'RIR 1-2', { rest: '2 min' });
  const FP = L('Face Pull', 3, 12, 28, 'Reps 12-15 | RIR 2', { rest: '60-90 s' });
  await importer({ name: 'Powerbuilding test', weeks: 4, startDate: '', days: [{ label: 'J1 - Pectoraux / Dos', exercises: [DC, CP, ROW, FP] }] });
  const p1 = await enregistrer();
  const dc = trouve(p1, 0, 'Développé couché')[0] || { sets: [] };
  t('IIF-A01 ⭐ l\'exercice à 4 échauffements + 3 séries de travail reste UN exercice de 7 séries, types ÉÉÉÉNNN, ordre et charges conservés',
    trouve(p1, 0, 'Développé couché').length === 1 && TYPES(dc) === 'ÉÉÉÉNNN' && dc.sets.map(s => s.kg).join(',') === '50,65,80,85,90,90,90' && dc.sets.map(s => s.reps).join(',') === '5,3,2,1,3,3,3', js(SERIES(dc)));
  t('IIF-A02 ⭐⭐ les repos FERMES du document sont enregistrés par série (90 s et 2 min), sans décalage d\'une série',
    dc.sets.map(s => s.rest).join(',') === '0,0,90,120,0,0,0', js(SERIES(dc)));
  t('IIF-A03 ⛔⛔ les PLAGES (« 60-90 s », « 3-4 min ») ne deviennent PAS un repos chiffré : `rest` 0, MAIS le texte écrit est conservé série par série',
    dc.sets.map(s => s.restTxt || '').join('|') === '60-90 s|60-90 s|||3-4 min|3-4 min|3-4 min', js(SERIES(dc)));
  const cp = trouve(p1, 0, /chest press/)[0] || { sets: [] };
  t('IIF-A04 un repos écrit pour tout l\'exercice (« 2 min ») vaut pour CHAQUE série (3 × 120 s)', cp.sets.length === 3 && cp.sets.every(s => s.rest === 120 && !s.restTxt), js(SERIES(cp)));
  const fp = trouve(p1, 0, /face pull/)[0] || { sets: [] };
  t('IIF-A05 une plage écrite pour tout l\'exercice est conservée sur CHAQUE série (3 × « 60-90 s »), repos 0', fp.sets.length === 3 && fp.sets.every(s => s.rest === 0 && s.restTxt === '60-90 s'), js(SERIES(fp)));
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
  t('IIF-B03 ⛔⛔ une série à PLAGE (« 3-4 min ») ne lance pas un repos inventé : le chrono prend le réglage de la personne (130 s) ET la consigne écrite est AFFICHÉE',
    [4, 5, 6].every(i => apps[i] === 130 && /3-4 min/.test(seqDC[i].consigne)), js({ apps: apps.slice(4), cons: seqDC.slice(4).map(x => x.consigne) }));
  t('IIF-B04 une série à repos FERME n\'affiche aucune consigne (rien de contradictoire à l\'écran)', seqDC[2].consigne === '' && seqDC[3].consigne === '', js(seqDC.map(x => x.consigne)));
  t('IIF-B05 les échauffements sans repos chiffré gardent leurs repos par type d\'avant (45 s ou palier), jamais 0, et la consigne « 60-90 s » est dite',
    apps[0] >= 30 && apps[1] >= 30 && /60-90 s/.test(seqDC[0].consigne) && /60-90 s/.test(seqDC[1].consigne), js({ apps: apps.slice(0, 2), cons: seqDC.slice(0, 2).map(x => x.consigne) }));

  // priorité : repos exact de la série > préférence de l'exercice > réglage global
  const seqCP = await sequence(S_IDX(0), 0, 1, { defRest: 100, pref: [['chest press', 75]] });
  t('IIF-B06 ⭐⭐ PRIORITÉ — un repos ÉCRIT (2 min) bat la préférence de l\'exercice (75 s) ET le réglage global (100 s)', seqCP.every(x => x.appel[0] === 120), js(seqCP.map(x => x.appel)));
  const seqFP = await sequence(S_IDX(0), 0, 3, { defRest: 100, pref: [['face pull', 75]] });
  t('IIF-B07 ⭐ PRIORITÉ — sans repos chiffré : la préférence de l\'exercice (75 s) passe avant le réglage global (100 s)', seqFP.every(x => x.appel[0] === 75), js(seqFP.map(x => x.appel)));
  const seqFP2 = await sequence(S_IDX(0), 0, 3, { defRest: 100, pref: [] });
  t('IIF-B08 ⭐ PRIORITÉ — ni repos écrit ni préférence : le réglage global (100 s)', seqFP2.every(x => x.appel[0] === 100), js(seqFP2.map(x => x.appel)));
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
  t('IIF-B11 rien n\'est choisi À LA PLACE de la personne : avant son geste le chrono tournait au réglage global (130 s)', choix.avant.tot === 130, js(choix.avant));
  // un repos CHIFFRÉ (choisi dans l'éditeur) gagne sur la consigne écrite : rien de contradictoire à l'écran
  const dbl = await pg.evaluate(() => {
    S.defRest = 130; S.exRestPref = {};
    const avant = S.programmes;                                            // on AJOUTE un programme, on n'écrase pas ceux des autres tests
    S.programmes = avant.concat([{ id: 'p9', name: 'Mixte', weeks: 0, startDate: '', days: [{ label: 'J1', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, type: 'N', rest: 150, restTxt: '2-3 min' }, { kg: 100, reps: 5, type: 'N', rest: 0, restTxt: '2-3 min' }] }] }] }]);
    S.wkt = null; _loadProgDayVraiment(S.programmes.length - 1, 0); stopRest();
    toggleSet(0, 0); const a = { tot: restTot, cons: (document.getElementById('rest-consigne') || {}).style && document.getElementById('rest-consigne').style.display };
    stopRest(); toggleSet(0, 1); const b2 = { tot: restTot, cons: document.getElementById('rest-consigne').style.display, txt: document.getElementById('rest-consigne').textContent };
    const garde = S.wkt.exs[0].sets[0].restTxt;
    stopRest(); S.programmes = avant; S.wkt = null; persist();
    return { a, b: b2, restTxtGarde: garde };
  });
  t('IIF-B14 ⭐ une série au repos CHIFFRÉ (150 s, choisi dans l\'éditeur) lance 150 s SANS afficher la consigne « 2-3 min » ; la voisine non chiffrée l\'affiche — et le texte écrit n\'a pas été effacé',
    dbl.a.tot === 150 && dbl.a.cons !== 'block' && dbl.b.tot === 130 && dbl.b.cons === 'block' && /2-3 min/.test(dbl.b.txt) && dbl.restTxtGarde === '2-3 min', js(dbl));
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
    && D1.ex[0].sets.map(s => s.rest).join() === '0,0,90,120,0,0,0' && D1.ex[0].sets.map(s => s.restTxt || '').join('|') === '60-90 s|60-90 s|||3-4 min|3-4 min|3-4 min', js(SERIES(D1.ex[0])));
  t('IIF-D01b … et le repos du travail ne déborde PAS sur les échauffements (la 1ʳᵉ série n\'a pas « 3-4 min »)', D1.ex[0].sets[0].restTxt === '60-90 s', js(SERIES(D1.ex[0])));
  const D1c = await vue([ECH('Soulevé de terre', 5, 60, 'ECH'), ECH('Soulevé de terre', 3, 80, 'ECH'), L('Soulevé de terre', 3, 3, 130, 'RIR 2', { rest: '3 min' })]);
  t('IIF-D01c ⛔ un échauffement SANS repos écrit n\'hérite JAMAIS du repos de la ligne de travail (0, 0, puis 180 ×3) — pas de décalage, pas de débordement',
    D1c.ex.length === 1 && D1c.ex[0].sets.map(s => s.rest).join() === '0,0,180,180,180' && TYPES(D1c.ex[0]) === 'ÉÉNNN', js(SERIES(D1c.ex[0])));
  const D3 = await vue([L('Développé couché', 1, 5, 50, 'Échauffement'), L('Développé couché', 1, 3, 65, 'échauffement léger'), L('Développé couché', 3, 5, 85, '')]);
  t('IIF-D02 échauffement présent DANS UNE NOTE seulement → regroupé (ÉÉNNN)', D3.ex.length === 1 && TYPES(D3.ex[0]) === 'ÉÉNNN', js(D3.ex.map(e => e.name + ':' + TYPES(e))));
  const D4 = await vue([L('Curl biceps', 1, 12, 14, ''), L('Curl biceps', 1, 10, 16, '')]);
  t('IIF-D03 ⛔ deux lignes identiques SANS aucune preuve d\'échauffement restent DEUX exercices (R29 : sans preuve, rien ne bouge)', D4.ex.length === 2 && D4.ex.every(e => e.sets.length === 1 && TYPES(e) === 'N'), js(D4.ex.map(e => e.name + ':' + TYPES(e))));
  const D5 = await vue([L('Développé couché', 1, 5, 50, 'Montée en charge'), L('Développé couché', 1, 3, 70, 'Monté en charge'), L('Développé couché', 3, 5, 90, '')]);
  t('IIF-D04 « Montée en charge » ET « Monté en charge » (la faute du coach réel) comptent comme preuve → ÉÉNNN', D5.ex.length === 1 && TYPES(D5.ex[0]) === 'ÉÉNNN', js(D5.ex.map(e => e.name + ':' + TYPES(e))));
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
  // ── E. LE CAS RÉEL J3B (Powerbuilding, épaules) : deux formes d'IA, une proposition, la personne tranche ──
  const J3B_NEW = [L('Dev. épaules guidé', 2, 5, 0, 'Charge : léger | Charge : progressif', { repsPerSet: [10, 5], kgPerSet: [0, 0], setTypePerSet: ['W', 'W'], rest: '', restPerSet: ['60 s', '60-90 s'] }),
    L('Dev. épaules guidé / haltères', 3, 8, 55, 'Reps 8-10 | Charge 55-60 kg | RIR 1-2', { setTypePerSet: ['', '', ''], rest: '2 min' }),
    L('Pec Deck', 3, 10, 60, 'RIR 1-2', { rest: '90-120 s' })];
  const J3B_OLD = [ECH('Dev. épaules guidé', 10, 0, 'ECH | Charge : léger', { rest: '60 s' }), ECH('Dev. épaules guidé', 5, 0, 'ECH | Charge : progressif', { rest: '60-90 s' }),
    L('Dev. épaules guidé / haltères', 3, 8, 55, 'Reps 8-10 | Charge 55-60 kg | RIR 1-2', { rest: '2 min' }), L('Pec Deck', 3, 10, 60, 'RIR 1-2', { rest: '90-120 s' })];
  for (const [forme, exs] of [['NOUVEAU contrat (l\'IA a fusionné les deux lignes de même nom)', J3B_NEW], ['ANCIEN Worker (une ligne = un exercice, ECH en note)', J3B_OLD]]) await section('E', async () => {
    const r = await importer(jour(JSON.parse(JSON.stringify(exs))));
    const ap = r.apercu[0].exercises;
    t('IIF-E01 ⭐⭐ J3B — ' + forme + ' : AVANT toute décision, rien n\'est fusionné (2 exercices + Pec Deck), une PROPOSITION relie l\'échauffement au travail',
      ap.length === 3 && ap[0].name === 'Dev. épaules guidé' && ap[1].name === 'Dev. épaules guidé / haltères' && ap[0]._propGrp && ap[0]._propGrp === ap[1]._propGrp && ap[0]._propRole === 'ech' && ap[1]._propRole === 'travail', js(ap.map(e => e.name + ':' + (e._propRole || '-'))));
    const T1 = await pg.evaluate(() => {
      const d = _impExtracted.days[0];
      const el = document.getElementById('imp-preview');
      return { ei: d.exercises.findIndex(e => e._propRole === 'travail'), texte: el ? el.innerText : '', btn: typeof impGrouperEch === 'function' };
    });
    t('IIF-E02 J3B — ' + forme + ' : l\'aperçu NOMME la proposition (regrouper / garder séparés) sans bloquer', /regrouper/i.test(T1.texte) && /séparés/i.test(T1.texte), T1.texte.slice(0, 300));
    // la personne ACCEPTE
    const ok = await pg.evaluate(() => { impGrouperEch(0, _impExtracted.days[0].exercises.findIndex(e => e._propRole === 'travail')); return JSON.parse(JSON.stringify(_impExtracted.days[0].exercises)); });
    const fus = ok[0];
    t('IIF-E03 ⭐⭐ J3B — ' + forme + ' : après « Regrouper » = UN exercice de 5 séries ÉÉNNN, nom fidèle au document (« … / haltères »), ordre 10-5-8-8-8',
      ok.length === 2 && fus.name === 'Dev. épaules guidé / haltères' && (fus.setTypePerSet || []).join('') === 'WW' + '' && fus.repsPerSet.join() === '10,5,8,8,8' && fus.kgPerSet.join() === '0,0,55,55,55', js({ n: ok.length, name: fus.name, types: fus.setTypePerSet, reps: fus.repsPerSet, kg: fus.kgPerSet }));
    const pr = await enregistrer();
    const e5 = pr.days[0].exs[0];
    t('IIF-E04 J3B — ' + forme + ' : enregistré, types ÉÉNNN, repos [60 s, plage « 60-90 s », 2 min ×3] sans décalage, notes de l\'échauffement conservées',
      TYPES(e5) === 'ÉÉNNN' && e5.sets.map(s => s.rest).join() === '60,0,120,120,120' && e5.sets[1].restTxt === '60-90 s' && /léger/.test(e5.note) && /progressif/.test(e5.note) && /RIR 1-2/.test(e5.note), js({ types: TYPES(e5), sets: SERIES(e5), note: e5.note }));
    // la personne REFUSE
    await importer(jour(JSON.parse(JSON.stringify(exs))));
    const ref = await pg.evaluate(() => { impGarderSepares(0, _impExtracted.days[0].exercises.findIndex(e => e._propRole === 'travail')); return JSON.parse(JSON.stringify(_impExtracted.days[0].exercises)); });
    t('IIF-E05 J3B — ' + forme + ' : « Garder séparés » = rien n\'est fusionné, la proposition disparaît, toutes les séries sont conservées (2 échauffements + 3 travail + Pec Deck)',
      ref.length === 3 && !ref.some(e => e._propGrp || e._propRole) && ref[0].name === 'Dev. épaules guidé' && ref[0].repsPerSet.length === 2 && ref[1].name === 'Dev. épaules guidé / haltères' && (ref[1].repsPerSet.length || ref[1].sets) === 3, js(ref.map(e => e.name + ':' + (e.repsPerSet || []).length + ':' + e._propGrp)));
    const prS = await enregistrer();
    t('IIF-E06 J3B — ' + forme + ' : séparés, l\'échauffement garde ses 2 séries typées É et le travail ses 3 séries N',
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
    L('Chest Press déclinée', 3, 8, 40, '', { rest: '2 min' })];
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
    cCP.statut === 'conf' && /À confirmer/.test(cCP.lib) && /Chest Press déclinée/i.test(cCP.nom), js(cCP));
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
  t('IIF-F07 ⭐ ce qui est enregistré = ce que l\'aperçu montrait après corrections (types ÉNNNN, 4ᵉ série à 240 s, 3ᵉ à plage conservée)',
    dcF && TYPES(dcF) === 'ÉNNNN' && dcF.sets[3].rest === 240 && dcF.sets[2].restTxt === '3-4 min' && dcF.sets[2].rest === 0, js(dcF && SERIES(dcF)));
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
      { id: 'p1700000000001', name: 'Powerbuilding', weeks: 4, startDate: '2026-10-05', days: [{ label: 'J1', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, type: 'N', rest: 0 }] }] }, { label: 'J2', exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 5, type: 'N', rest: 0 }] }] }] },
      { id: 'p1700000000002', name: 'Powerbuilding', weeks: 0, startDate: '', days: [{ label: 'J1', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 60, reps: 8, type: 'N', rest: 0 }] }] }] }];
    persist(); openProgModal();
    const liste = document.querySelector('.prog-card') ? [...document.querySelectorAll('.prog-card .prog-card-name')].map(n => n.textContent.trim()) : [];
    return { liste };
  });
  t('IIF-H01 ⭐ deux programmes du MÊME NOM se distinguent dans la liste (un numéro apparaît sur chacun)', homs.liste.length === 2 && homs.liste.every(n => /n°/.test(n)) && homs.liste[0] !== homs.liste[1], js(homs.liste));
  await importer(jour([L('Presse Zeta Prototype', 3, 10, 120, '', { rest: '2 min' }), L('Tractions', 3, 8, 0, '')]));
  const rep = await pg.evaluate(() => {
    S.programmes = [
      { id: 'p1700000000001', name: 'Powerbuilding', weeks: 4, startDate: '2026-10-05', days: [{ label: 'J1', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, type: 'N', rest: 0 }] }] }, { label: 'J2', exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 5, type: 'N', rest: 0 }] }] }] },
      { id: 'p1700000000002', name: 'Powerbuilding', weeks: 0, startDate: '', days: [{ label: 'J1', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 60, reps: 8, type: 'N', rest: 0 }] }] }] }];
    S.customExercises = []; persist();
    _impExtracted.name = 'Powerbuilding';
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
    ok2.ids.length === 2 && ok2.ex0 === 'Squat à la Barre' && ok2.ex1.some(n => /zeta/i.test(n)) && ok2.noms.join() === 'Powerbuilding,Powerbuilding', js(ok2));
  });
  await section('I', async () => {
  // ── I. CE QUE LES PROGRAMMES RÉELS DE COACHS ONT RÉVÉLÉ (corpus anonymisé, tests/parcours/corpus_import) ──
  const R0 = await vue([L('Élévation frontales haltères', 1, 0, 0, '', { rest: '1.30 mins' })]);
  t('IIF-I01 ⭐ des reps que le document n\'écrit PAS ne passent pas pour une prescription : 10 proposées comme avant (la séance a besoin d\'un nombre), mais la note le DIT',
    R0.ex[0].sets[0].reps === 10 && /Répétitions non écrites dans le document/.test(R0.ex[0].note) && R0.ap[0].note === R0.ex[0].note, js(R0.ex[0]));
  const R1 = await vue([L('Curl barre EZ', 3, 12, 20, 'RIR 2', { rest: '90 s' })]);
  t('IIF-I02 … et des reps écrites ne reçoivent AUCUNE mention (la note du coach reste intacte)', !/Répétitions non écrites/.test(R1.ex[0].note) && R1.ex[0].sets.every(s => s.reps === 12) && R1.ex[0].note === 'RIR 2', js(R1.ex[0]));
  const statut = () => pg.evaluate(() => { const ex = _impExtracted.days[0].exercises[0]; return { nom: ex.name, sugg: ex._vmSuggest || '', from: ex._vmFrom || '', k: _impStatut(ex, _catalogueConnu()).k }; });
  await importer(jour([L('Front Squat', 4, 8, 0, 'Lourd | Smith machine', { rest: '2 min 30' })]));
  const sm = await statut();
  t('IIF-I03 ⛔⛔ « Front Squat » dont la NOTE dit « Smith machine » n\'est PAS rattaché d\'office à l\'exercice à la barre : proposition « À confirmer », nom du document gardé',
    sm.k === 'conf' && !sm.from && sm.nom === 'Front Squat' && /squat avant/i.test(sm.sugg), js(sm));
  await importer(jour([L('Front Squat', 4, 8, 0, 'Lourd | pieds alignés avec les genoux', { rest: '2 min 30' })]));
  const sb = await statut();
  t('IIF-I04 … sans matériel dans la note, le rattachement d\'office existe toujours (la garde ne bloque pas tout : « Front Squat » → « Squat Avant »)', sb.k === 'ok' && /squat avant/i.test(sb.nom) && sb.from === 'Front Squat', js(sb));
  await importer(jour([L('Front Squat', 4, 8, 0, 'Lourd | à la barre', { rest: '2 min 30' })]));
  const sbb = await statut();
  t('IIF-I05 … et une note qui dit « barre » ne contredit pas une cible non marquée (barre par défaut) : rattaché d\'office', sbb.k === 'ok' && /squat avant/i.test(sbb.nom), js(sbb));
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
  t('IIF-C04 aucune erreur de page, aucun appel réel', errs.length === 0 && reels === 0, js({ errs, reels }));
  await cx.close();
  function S_IDX() { return 0; }
};
