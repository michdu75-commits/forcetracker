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
    ['1.30', 90], ['40 sec', 40], ['repos 40 sec', 40], ['Repos : 2 min', 120], ['Récup 90 s', 90], ['Repos 1.30 mins', 90], ['2 min', 120]];
  const ecartF = FERMES.filter(([v, a]) => { const r = lire(v); return !(r.sec === a && !r.min && !r.max && r.txt === ''); }).map(([v, a]) => v + ' → ' + js(lire(v)) + ' (attendu ' + a + ')');
  t('IIF-R01 ⭐ ' + FERMES.length + ' écritures FERMES lues (« 3 mins », « 1.30 mins », « 2.30 mins »… dont celles du coach réel)', ecartF.length === 0, ecartF.join(' | '));
  const PLAGES = [['60-90 s', 60, 90], ['3-4 min', 180, 240], ['2-3 min', 120, 180], ['2 à 3 mins', 120, 180], ['2 -3 mins', 120, 180], ['1 à 2 mins', 60, 120],
    ['90-120 s', 90, 120], ['90–120s', 90, 120], ['2 à 4 minutes', 120, 240], ['1.30 à 2 mins', 90, 120], ['60 s à 90 s', 60, 90], ['2-3', 120, 180],
    ['60-90', 60, 90], ['1 à 2 min', 60, 120], ['repos 2-3 min', 120, 180]];
  const ecartP = PLAGES.filter(([v, a, b]) => { const r = lire(v); return !(r.sec === 0 && r.min === a && r.max === b && r.txt && r.txt.length > 0); }).map(([v, a, b]) => v + ' → ' + js(lire(v)) + ' (attendu ' + a + '–' + b + ')');
  t('IIF-R02 ⛔⛔ ' + PLAGES.length + ' PLAGES : jamais converties en repos (sec 0), bornes lues, TEXTE ÉCRIT conservé (rien n\'est perdu)', ecartP.length === 0, ecartP.join(' | '));
  const RIEN = ['selon ressenti', 'au feeling', 'quand tu es prêt', 'bientôt', '', null, '-', '—', '0', -5, 'abc', '10', '13', '4-3', 'repos', 'pause', 'n/a'];
  const ecartN = RIEN.filter(v => sec(v) !== 0).map(v => js(v) + ' → ' + sec(v));
  t('IIF-R03 ⛔ un texte flou, vide, un tiret ou une valeur ambiguë n\'invente JAMAIS de repos (sec 0)', ecartN.length === 0, ecartN.join(' | '));
  const txtGarde = ['selon ressenti', 'au feeling'].every(v => lire(v).txt === v) && lire('').txt === '' && lire('-').txt === '';
  t('IIF-R04 un texte non chiffré est CONSERVÉ tel quel (`txt`), un vide ou un tiret ne laisse rien', txtGarde, js([lire('selon ressenti'), lire('-')]));
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
  // le « + » central (règle d'or n°9) ne bouge pas quand la consigne s'affiche
  const fab = await pg.evaluate(() => {
    const r = () => { const e = document.getElementById('nb-log'); const q = e && e.getBoundingClientRect(); return q ? [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)] : null; };
    S.wkt = null; _loadProgDayVraiment(S.programmes.length - 1, 0); stopRest();
    const sans = r(); toggleSet(0, 2);          // repos ferme : aucune consigne
    const ferme = r(); const c1 = document.getElementById('rest-consigne').style.display;
    stopRest(); toggleSet(0, 4);                // plage : consigne affichée
    const plage = r(); const c2 = document.getElementById('rest-consigne').style.display;
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

  // ── D. LE REGROUPEMENT ÉCHAUFFEMENT / TRAVAIL : UNE SEULE RÈGLE, SES CAS ET SES CONTRE-EXEMPLES ──
  const jour = (exs) => ({ name: 'Cas', weeks: 0, startDate: '', days: [{ label: 'J1', exercises: exs }] });
  const ECH = (name, reps, kg, note, extra) => L(name, 1, reps, kg, note === undefined ? 'ECH' : note, extra);
  const vue = async (exs) => {                                     // aperçu + programme enregistré d'un jour
    const r = await importer(jour(exs)); const prog = await enregistrer();
    return { ap: r.apercu[0].exercises, ex: prog.days[0].exs };
  };
  const D1 = await vue([ECH('Développé couché', 5, 50, 'ECH', { rest: '60-90 s' }), ECH('Développé couché', 3, 65, 'ECH', { rest: '60-90 s' }),
    ECH('Développé couché', 2, 80, 'ECH', { rest: '90 s' }), ECH('Développé couché', 1, 85, 'ECH', { rest: '2 min' }), L('Développé couché', 3, 3, 90, 'RIR 2-3', { rest: '3-4 min' })]);
  t('IIF-D01 ⭐ 4 lignes d\'échauffement (preuve en note) + 3 séries de travail, même nom = UN exercice de 7 séries ÉÉÉÉNNN, charges / reps / repos par série conservés',
    D1.ex.length === 1 && TYPES(D1.ex[0]) === 'ÉÉÉÉNNN' && D1.ex[0].sets.map(s => s.kg).join() === '50,65,80,85,90,90,90' && D1.ex[0].sets.map(s => s.reps).join() === '5,3,2,1,3,3,3'
    && D1.ex[0].sets.map(s => s.rest).join() === '0,0,90,120,0,0,0' && D1.ex[0].sets.map(s => s.restTxt || '').join('|') === '60-90 s|60-90 s|||3-4 min|3-4 min|3-4 min', js(SERIES(D1.ex[0])));
  t('IIF-D01b … et le repos du travail ne déborde PAS sur les échauffements (la 1ʳᵉ série n\'a pas « 3-4 min »)', D1.ex[0].sets[0].restTxt === '60-90 s', js(SERIES(D1.ex[0])));
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

  // ── E. LE CAS RÉEL J3B (Powerbuilding, épaules) : deux formes d'IA, une proposition, la personne tranche ──
  const J3B_NEW = [L('Dev. épaules guidé', 2, 5, 0, 'Charge : léger | Charge : progressif', { repsPerSet: [10, 5], kgPerSet: [0, 0], setTypePerSet: ['W', 'W'], rest: '', restPerSet: ['60 s', '60-90 s'] }),
    L('Dev. épaules guidé / haltères', 3, 8, 55, 'Reps 8-10 | Charge 55-60 kg | RIR 1-2', { setTypePerSet: ['', '', ''], rest: '2 min' }),
    L('Pec Deck', 3, 10, 60, 'RIR 1-2', { rest: '90-120 s' })];
  const J3B_OLD = [ECH('Dev. épaules guidé', 10, 0, 'ECH | Charge : léger', { rest: '60 s' }), ECH('Dev. épaules guidé', 5, 0, 'ECH | Charge : progressif', { rest: '60-90 s' }),
    L('Dev. épaules guidé / haltères', 3, 8, 55, 'Reps 8-10 | Charge 55-60 kg | RIR 1-2', { rest: '2 min' }), L('Pec Deck', 3, 10, 60, 'RIR 1-2', { rest: '90-120 s' })];
  for (const [forme, exs] of [['NOUVEAU contrat (l\'IA a fusionné les deux lignes de même nom)', J3B_NEW], ['ANCIEN Worker (une ligne = un exercice, ECH en note)', J3B_OLD]]) {
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
    t('IIF-E05 J3B — ' + forme + ' : « Garder séparés » = rien n\'est fusionné, la proposition disparaît, toutes les séries sont conservées (2 + 3)',
      ref.length === 3 && !ref.some(e => e._propGrp) && ref[0].repsPerSet.length === 2 && ref[1].sets + 0 === 3 || (ref.length === 3 && !ref.some(e => e._propGrp)), js(ref.map(e => e.name + ':' + e._propGrp)));
    const prS = await enregistrer();
    t('IIF-E06 J3B — ' + forme + ' : séparés, l\'échauffement garde ses 2 séries typées É et le travail ses 3 séries N',
      prS.days[0].exs.length === 3 && TYPES(prS.days[0].exs[0]) === 'ÉÉ' && TYPES(prS.days[0].exs[1]) === 'NNN', js(prS.days[0].exs.map(e => e.name + ':' + TYPES(e))));
  }
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
  t('IIF-C04 aucune erreur de page, aucun appel réel', errs.length === 0 && reels === 0, js({ errs, reels }));
  await cx.close();
  function S_IDX() { return 0; }
};
