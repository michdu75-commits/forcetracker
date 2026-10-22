/* ═════════════════════════════════════════════════════════════════════════════════════════════
   🛡️ D031S — LE GARDE RÉSEAU DE LA PASSE, ÉPROUVÉ AU DÉBUT ET VÉRIFIÉ À LA FIN (D-031-SÉCURITÉ-01, 19/10/2026)
   Blocs : D031S-I (début) · D031S-II (fin). Garde : tests/_garde_reseau.js · banc : tools/banc_garde_reseau.js ·
   contrôle négatif : tools/mut_garde_reseau.py
   POURQUOI : la contre-expertise du 19/10 (C1, M4) a recompté 1 356 requêtes externes que la passe laissait partir,
     dont des écritures sans jeton vers la production. Le garde les arrête ; ces témoins prouvent, À CHAQUE PASSE, qu'il
     est bien là et qu'il mord — un garde qu'on ne voit jamais refuser est un garde dont on suppose qu'il marche.
   CONDUIT : le VRAI navigateur de la passe (celui-là même, pas une copie), de vraies requêtes de page, les vraies portes
     de lancement de Playwright, de vrais processus enfants.
   ⛔ DESTINATIONS FICTIVES SEULEMENT : domaines réservés (RFC 2606 / 6761 : `.invalid`, `example.test`) et adresse de
     documentation (RFC 5737 : 192.0.2.1). Même si le garde manquait, rien ne pourrait atteindre un vrai service.
   OBSERVE : le CODE d'erreur du navigateur — il dit QUELLE couche a arrêté la requête : `ERR_BLOCKED_BY_CLIENT` = le refus
     par défaut (avant tout réseau) · `ERR_PROXY_CONNECTION_FAILED` = le proxy mort (la requête était déjà partie vers le
     réseau). Côté Node, l'erreur porte la marque `gardeReseau` : une machine sans réseau donnerait une autre erreur, et
     le témoin rougirait — ces témoins ne peuvent pas être verts « grâce à la machine ».
   NE COUVRE PAS : un processus qui ne charge pas le garde (un banc lancé seul sans `node -r ./tests/_garde_reseau.js`) ;
     un navigateur lancé par un script shell intermédiaire qui retirerait lui-même le proxy ; la vérité fonctionnelle des
     tests (une requête bloquée est une panne réseau pour l'app, pas une réponse simulée).
   ═════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const cp = require('child_process'), fs = require('fs'), path = require('path');
const RACINE = path.join(__dirname, '..', '..');
const GARDE = () => globalThis[Symbol.for('forcetracker.gardeReseau')];
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const court = (x, n) => String(x == null ? '' : x).slice(0, n || 200);
const attendre = ms => new Promise(r => setTimeout(r, ms));

/* Une page locale, et pour chaque destination fictive : ce que la PAGE a vu, et l'erreur que le NAVIGATEUR a donnée. */
async function sonde(b, PORT, preparer) {
  const c = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const erreurs = {}, finies = {};
  c.on('requestfailed', rq => { try { erreurs[new URL(rq.url()).host] = (rq.failure() || {}).errorText || '?'; } catch (e) {} });
  c.on('requestfinished', rq => { try { finies[new URL(rq.url()).host] = true; } catch (e) {} });
  if (preparer) await preparer(c);
  const p = await c.newPage();
  await p.goto('http://localhost:' + PORT + '/index.html');
  return { c, p, erreurs, finies };
}
const chercher = (p, url) => p.evaluate(u => fetch(u).then(r => r.text().then(x => 'RÉPONSE ' + r.status + ' ' + x.slice(0, 40)), e => 'ÉCHEC'), url);

module.exports.debut = async function (t, b, PORT, chromium) {
  console.log('\n═══ D031S-I. LE GARDE RÉSEAU — CHARGÉ AVANT LA PASSE, ÉPROUVÉ SUR DES DESTINATIONS FICTIVES ═══');
  const g = GARDE();
  const pa = g && g.patches();
  t('D031S-I ① le garde réseau est chargé AVANT Playwright, et Playwright est patché (lancement · navigateur · routes)',
    !!(g && g.actif && pa.BrowserType >= 1 && pa.Browser >= 1 && pa.Route >= 1 && g.compteurs().lancements >= 1),
    g ? JSON.stringify(pa) + ' · lancements ' + g.compteurs().lancements : 'garde ABSENT du processus');
  if (!g) return;

  const cn = await g.canariDebut;
  t('D031S-I ② Node : connexion TCP, résolution DNS (rappel et promesse) et fetch vers des destinations fictives — refusés PAR LE GARDE',
    g.canariOk(cn), JSON.stringify(cn));
  const secrets = Object.keys(process.env).filter(k => k !== 'NODE_OPTIONS' && g.RE_SECRET.test(k));
  t('D031S-I ③ aucune variable au nom de secret dans l\'environnement de la passe, proxys morts, garde transmis aux enfants',
    secrets.length === 0 && process.env.HTTPS_PROXY === g.PROXY_MORT && process.env.HTTP_PROXY === g.PROXY_MORT &&
    (process.env.NODE_OPTIONS || '').includes(g.fichier),
    'noms restants : ' + secrets.length + ' · HTTPS_PROXY ' + (process.env.HTTPS_PROXY === g.PROXY_MORT ? 'mort' : 'AUTRE'));

  // ── le navigateur : refus par défaut, simulation, continue(), fallback(), sous-ressources, navigation, WebSocket ──
  const s = await sonde(b, PORT, async (c) => {
    await c.route('https://simule.d031s.example.test/**', rt => rt.fulfill({ status: 200, body: 'simulé-d031s', headers: { 'access-control-allow-origin': '*' } }));
    await c.route('https://continue.d031s.invalid/**', rt => rt.continue());
    await c.route('https://repli.d031s.example.test/**', rt => rt.fallback());
  });
  const vu = {
    defaut: await chercher(s.p, 'https://defaut.d031s.example.test/x'),
    simule: await chercher(s.p, 'https://simule.d031s.example.test/x'),
    continue: await chercher(s.p, 'https://continue.d031s.invalid/x'),
    repli: await chercher(s.p, 'https://repli.d031s.example.test/x'),
    ip: await chercher(s.p, 'http://192.0.2.1:9/x'),
  };
  await s.p.evaluate(() => new Promise(fin => {
    let n = 0; const un = () => { if (++n === 3) fin(); };
    const i = new Image(); i.onload = i.onerror = un; i.src = 'https://image.d031s.example.test/i.png';
    const sc = document.createElement('script'); sc.onload = sc.onerror = un; sc.src = 'https://script.d031s.example.test/s.js'; document.head.appendChild(sc);
    try { navigator.sendBeacon('https://balise.d031s.example.test/b', 'x'); } catch (e) {}
    try { const w = new WebSocket('wss://ws.d031s.example.test/s'); w.onopen = () => { window.__d031sWs = 'OUVERT'; }; w.onerror = w.onclose = un; } catch (e) { un(); }
    setTimeout(fin, 4000);
  }));
  let nav = 'aucune erreur';
  try { const p2 = await s.c.newPage(); await p2.goto('https://navigation.d031s.example.test/'); await p2.close(); } catch (e) { nav = court(e.message, 120); }
  await attendre(400);
  const E = s.erreurs, wsOuvert = await s.p.evaluate(() => window.__d031sWs || '');
  t('D031S-I ④ une requête NON simulée vers une destination fictive : refusée par défaut (ERR_BLOCKED_BY_CLIENT), la page voit un échec',
    vu.defaut === 'ÉCHEC' && /BLOCKED_BY_CLIENT/.test(E['defaut.d031s.example.test'] || '') &&
    vu.ip === 'ÉCHEC' && /BLOCKED_BY_CLIENT/.test(E['192.0.2.1:9'] || ''),
    'page ' + vu.defaut + ' / ' + vu.ip + ' · navigateur ' + (E['defaut.d031s.example.test'] || 'aucune erreur') + ' / ' + (E['192.0.2.1:9'] || 'aucune erreur'));
  t('D031S-I ⑤ une réponse SIMULÉE par le test (route.fulfill) reste servie : le garde ne casse pas les simulations',
    /^RÉPONSE 200 simulé-d031s/.test(vu.simule), vu.simule);
  t('D031S-I ⑥ un test qui laisse PARTIR une requête (route.continue) : elle est arrêtée par le proxy mort (2ᵉ couche, indépendante)',
    vu.continue === 'ÉCHEC' && /PROXY_CONNECTION_FAILED/.test(E['continue.d031s.invalid'] || ''),
    'page ' + vu.continue + ' · navigateur ' + (E['continue.d031s.invalid'] || 'aucune erreur'));
  t('D031S-I ⑦ route.fallback() retombe sur le refus par défaut',
    vu.repli === 'ÉCHEC' && /BLOCKED_BY_CLIENT/.test(E['repli.d031s.example.test'] || ''), 'page ' + vu.repli + ' · ' + (E['repli.d031s.example.test'] || 'aucune erreur'));
  const sous = ['image.d031s.example.test', 'script.d031s.example.test', 'balise.d031s.example.test', 'navigation.d031s.example.test'];
  t('D031S-I ⑧ image, script, balise (sendBeacon) et navigation vers une destination fictive : refusés par défaut ; WebSocket : jamais ouvert',
    sous.every(h => /BLOCKED_BY_CLIENT/.test(E[h] || '')) && /BLOCKED_BY_CLIENT/.test(nav) && wsOuvert === '' && !sous.some(h => s.finies[h]),
    sous.map(h => h.split('.')[0] + ' ' + (E[h] || 'AUCUNE ERREUR')).join(' · ') + ' · goto ' + nav + ' · ws ' + (wsOuvert || 'fermé'));
  await s.c.unrouteAll();
  const apres = await chercher(s.p, 'https://apres-unroute.d031s.example.test/x');
  await attendre(200);
  t('D031S-I ⑨ unrouteAll() d\'un test ne retire pas le refus par défaut',
    apres === 'ÉCHEC' && /BLOCKED_BY_CLIENT/.test(E['apres-unroute.d031s.example.test'] || ''), apres + ' · ' + (E['apres-unroute.d031s.example.test'] || 'aucune erreur'));
  await s.c.close();

  // newPage() directement sur le navigateur : son contexte implicite passe par la même porte
  let implicite = 'non mesuré';
  { const p3 = await b.newPage(); const e3 = {}; p3.context().on('requestfailed', rq => { try { e3[new URL(rq.url()).host] = rq.failure().errorText; } catch (e) {} });
    await p3.goto('http://localhost:' + PORT + '/index.html');
    implicite = await chercher(p3, 'https://implicite.d031s.example.test/x'); await attendre(200);
    implicite += ' · ' + (e3['implicite.d031s.example.test'] || 'aucune erreur'); await p3.context().close(); }
  t('D031S-I ⑩ une page ouverte par browser.newPage() (contexte implicite) est sous le même refus par défaut',
    /^ÉCHEC · .*BLOCKED_BY_CLIENT/.test(implicite), implicite);

  // ── les portes de lancement ──
  const refus = [];
  for (const [nom, f] of [['launchPersistentContext', () => chromium.launchPersistentContext('/tmp/d031s-persistant')],
    ['connect', () => chromium.connect('ws://localhost:9/d031s')], ['connectOverCDP', () => chromium.connectOverCDP('http://localhost:9')],
    ['launchServer', () => chromium.launchServer()]]) {
    try { await f(); refus.push(nom + ' ACCEPTÉ'); } catch (e) { refus.push(nom + (e.code === 'EGARDE' ? ' refusé' : ' autre erreur : ' + court(e.message, 60))); }
  }
  t('D031S-I ⑪ contexte persistant, connect, CDP et serveur de navigateur : refusés par le garde (chemins non contrôlés)',
    refus.every(x => / refusé$/.test(x)), refus.join(' · '));
  let contourne = 'non mesuré';
  { const b2 = await chromium.launch({ executablePath: CHROME, args: ['--no-proxy-server', '--proxy-server=direct://', '--host-resolver-rules=MAP * 127.0.0.1'], proxy: { server: 'direct://' } });
    try { const s2 = await sonde(b2, PORT, c => c.route('https://contourne.d031s.invalid/**', rt => rt.continue()));
      contourne = (await chercher(s2.p, 'https://contourne.d031s.invalid/x')) + ' · '; await attendre(200);
      contourne += s2.erreurs['contourne.d031s.invalid'] || 'aucune erreur'; } finally { await b2.close(); } }
  t('D031S-I ⑫ un navigateur lancé avec --no-proxy-server, proxy « direct » et une résolution forcée reste derrière le proxy mort',
    /^ÉCHEC · .*PROXY_CONNECTION_FAILED/.test(contourne), contourne);

  // ── les processus enfants ──
  const enfant = (env) => { try { return JSON.parse(cp.execFileSync(process.execPath, ['-e',
    "const g=globalThis[Symbol.for('forcetracker.gardeReseau')];const s=require('net').connect(9,'192.0.2.1');" +
    "s.on('error',e=>console.log(JSON.stringify({garde:!!g,refus:!!e.gardeReseau,secret:Object.keys(process.env).filter(k=>/D031S_FAUX_(JETON|TOKEN)/.test(k)).length,proxy:process.env.HTTPS_PROXY})));" +
    "s.on('connect',()=>{console.log(JSON.stringify({garde:!!g,refus:false,connecte:true}));s.destroy();});"],
    Object.assign({ encoding: 'utf8', timeout: 30000 }, env ? { env } : {})).trim().split('\n').pop()); } catch (e) { return { erreur: court(e.message, 120) }; } };
  const e1 = enfant(null), e2 = enfant({ PATH: process.env.PATH, D031S_FAUX_JETON: 'fictif', D031S_FAUX_TOKEN: 'fictif' });
  /* un enfant qui n'est PAS Node (shell, Python, git…) ne recharge pas le garde : seul le nettoyage de son environnement
     le protège. Node, lui, se re-nettoie en chargeant le garde — on regarde donc les deux. */
  let e3 = {};
  try { const lignes = cp.execFileSync('env', [], { encoding: 'utf8', env: { PATH: process.env.PATH, D031S_FAUX_TOKEN: 'fictif', HTTPS_PROXY: 'http://proxy.d031s.invalid:3128' } }).split('\n');
    e3 = { secret: lignes.filter(l => /^D031S_FAUX_/.test(l)).length, proxy: (lignes.find(l => /^HTTPS_PROXY=/.test(l)) || '').slice(12), garde: lignes.some(l => /^NODE_OPTIONS=.*_garde_reseau/.test(l)) }; }
  catch (e) { e3 = { erreur: court(e.message, 120) }; }
  t('D031S-I ⑬ un processus enfant hérite du garde et d\'un environnement nettoyé (sans secret, proxys morts) — Node comme non-Node, même avec un environnement explicite',
    e1.garde === true && e1.refus === true && e2.garde === true && e2.refus === true && e2.secret === 0 && e2.proxy === g.PROXY_MORT &&
    e3.secret === 0 && e3.proxy === g.PROXY_MORT && e3.garde === true,
    JSON.stringify(e1) + ' · ' + JSON.stringify(e2) + ' · non-Node ' + JSON.stringify(e3));
  let navNu = 'ACCEPTÉ', ls = 'non mesuré';
  try { const pr = cp.spawn(CHROME, ['--headless=new', '--disable-gpu', 'about:blank'], { stdio: 'ignore' }); try { pr.kill('SIGKILL'); } catch (e) {} }
  catch (e) { navNu = e.code === 'EGARDE' ? 'refusé' : 'autre erreur : ' + court(e.message, 60); }
  try { ls = cp.execFileSync('ls', ['/opt/pw-browsers'], { encoding: 'utf8' }).includes('chromium') ? 'permis' : 'sortie inattendue'; } catch (e) { ls = 'REFUSÉ : ' + court(e.message, 60); }
  t('D031S-I ⑭ un navigateur lancé hors Playwright sans le proxy mort est refusé ; une commande qui NOMME seulement un chemin de navigateur passe',
    navNu === 'refusé' && ls === 'permis', 'navigateur nu ' + navNu + ' · ls ' + ls);
  const vus = module.exports.contournements();
  t('D031S-I ⑮ aucun fichier de la passe n\'écrit un contournement du garde (proxy, contexte persistant, CDP, patch réseau, environnement)',
    vus.length === 0, vus.slice(0, 6).join(' · '));
  { const k = GARDE().compteurs();
    t('D031S-I ⑯ chaque navigateur lancé s\'est PROUVÉ avant de servir (Node, refus par défaut, proxy mort) — sinon il n\'aurait pas été rendu',
      k.lancements >= 1 && k.preuves === k.lancements && k.preuvesEchouees === 0, k.preuves + ' preuve(s) / ' + k.lancements + ' lancement(s), ' + k.preuvesEchouees + ' échec(s)'); }
  const sans = module.exports.entreesSansGarde();
  console.log('  ℹ️ ' + sans.length + ' ancien(s) point(s) d\'entrée lancent Playwright sans charger le garde (inscrits dans tests/garde_existants.json, la liste ne fait que rétrécir — D031S-VII) — '
    + 'les lancer gardés : tools/sous_garde.sh node <fichier>');
};

/* ⛔ CE QUI CONTOURNERAIT LE GARDE, cherché dans le TEXTE des fichiers que la passe charge. Le garde refuse déjà ces chemins
   à l'exécution ; ce témoin les refuse à l'ÉCRITURE — un contournement ajouté demain rougit avant de pouvoir servir.
   `route.continue()` n'en fait pas partie : la requête part vers le proxy mort, et le résumé de fin la montre. */
const RE_CONTOURNEMENT = /launchPersistentContext|connectOverCDP|chromium\.connect\(|launchServer\(|no-proxy-server|proxy-server|proxy\s*:\s*\{|ignoreDefaultArgs|net\.Socket\.prototype\.connect\s*=|Module\._extensions|dns\.(lookup|resolve\w*)\s*=|process\.env\.(HTTPS?_PROXY|ALL_PROXY|NO_PROXY|NODE_OPTIONS)\s*=|delete\s+process\.env|forcetracker\.gardeReseau|unshare/;
const fichiersDeLaPasse = () => [].concat(
  fs.readdirSync(path.join(RACINE, 'tests', 'parcours')).filter(f => f.endsWith('.js')).map(f => path.join('tests', 'parcours', f)),
  fs.readdirSync(path.join(RACINE, 'tests')).filter(f => f.endsWith('.js')).map(f => path.join('tests', f)))
  .filter(f => !/(^|[\\/])(_garde_reseau|garde_reseau)\.js$/.test(f));
/* le CODE sans ce qui en PARLE : commentaires blanchis, numéros de ligne gardés (famille ft-v1193/1205/1210) */
const sansCommentaires = (src) => src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .split('\n').map(l => (l.trim().startsWith('//') ? '' : l)).join('\n');
module.exports.contournements = () => {
  const vus = [];
  for (const f of fichiersDeLaPasse()) {
    const lignes = sansCommentaires(fs.readFileSync(path.join(RACINE, f), 'utf8')).split('\n');
    lignes.forEach((l, i) => { const m = l.match(RE_CONTOURNEMENT); if (m) vus.push(f + ':' + (i + 1) + ' « ' + m[0] + ' »'); });
  }
  return vus;
};
/* ═══ D031S-VII — LA GARDE OBLIGATOIRE (décision de Michel du 19/10/2026 : « OUI ») ════════════════════════════════
   Tout fichier de tests/ ou tools/ qui pilote Playwright doit charger le garde AVANT Playwright — quel que soit le chemin
   qui le lance (directement, par un outil de mutation, par la recette annexe), c'est le fichier lui-même qui se garde.
   Les fichiers d'AVANT la décision sont inscrits dans tests/garde_existants.json (« à migrer », ou conservés par décision) :
   ⛔ la liste ne peut que RÉTRÉCIR. Rougissent : un NOUVEAU point d'entrée non gardé · un inscrit devenu gardé (à retirer
   de la liste) · une ligne qui ne désigne plus rien. Un module de la passe (tests/parcours/*.js sans programme principal)
   n'est pas un point d'entrée : il ne tourne que dans la passe, qui est gardée. */
const RE_PW_JS = /require\(\s*[^)]*playwright[^)]*\)|from\s+['"][^'"]*playwright|chargerPlaywright\s*\(|\/opt\/pw-browsers|chromium\.launch\s*\(/;
const RE_PW_PY = /chargerPlaywright\s*\(|chromium\.launch\s*\(|\.launch\(\s*\{\s*executablePath/;
const RE_GARDE_CHARGE = /require\(\s*[^)]*_garde_reseau(?:\.js)?['"]\s*\)|--require[ =]\S*_garde_reseau\.js|-r\s+\S*_garde_reseau\.js/;
const INFRA = /^tests\/(_garde_reseau|_playwright|_plantages|identites_fictives)\.js$/;
const sansCommPy = (s) => s.split('\n').map(l => (l.trim().startsWith('#') ? '' : l)).join('\n');
const parcourir = (dir) => {
  const out = [];
  let lus = []; try { lus = fs.readdirSync(path.join(RACINE, dir), { withFileTypes: true }); } catch (e) { return out; }
  for (const d of lus) {
    if (/^(node_modules|\.git|__pycache__)$/.test(d.name)) continue;
    const rel = dir + '/' + d.name;
    if (d.isDirectory()) out.push(...parcourir(rel)); else out.push(rel);
  }
  return out;
};
module.exports.pointsEntree = () => {
  const r = [];
  for (const f of [].concat(parcourir('tests'), parcourir('tools'))) {
    if (!/\.(js|mjs|py|sh)$/.test(f) || INFRA.test(f)) continue;
    const brut = fs.readFileSync(path.join(RACINE, f), 'utf8'), py = /\.(py|sh)$/.test(f);
    const code = py ? sansCommPy(brut) : sansCommentaires(brut);
    const iPW = code.search(py ? RE_PW_PY : RE_PW_JS); if (iPW < 0) continue;
    if (/^tests\/parcours\/(?!runner\.js$)/.test(f) && !/require\.main\s*===\s*module/.test(code)) continue;
    const iG = code.search(RE_GARDE_CHARGE);
    r.push({ f, garde: iG >= 0 && iG < iPW });
  }
  return r;
};
/* ⛔ L'INVENTAIRE FIGÉ des anciens (état du 19/10/2026 après la 1ʳᵉ vague, arbre 80a28407 : 70 fichiers). La liste vivante
   (tests/garde_existants.json) doit en rester un SOUS-ENSEMBLE : un ancien migré ou supprimé en sort, mais AUCUN fichier n'y
   entre. Sans cet inventaire, inscrire un NOUVEAU banc dans la liste rendait D031S-VII ① vert — le contournement exact de la
   décision 2 (trou mesuré le 20/10). ⛔ Ne jamais AJOUTER de nom ici : un nouveau banc se GARDE (tools/migrer_garde.py --nouveau). */
const INVENTAIRE_FIGE_19_10 = new Set([
  'tests/anneau/runner.js',
  'tests/calculs/runner.js',
  'tests/calendrier-milo/runner.js',
  'tests/calendrier/runner.js',
  'tests/croises/runner.js',
  'tests/discussions/runner.js',
  'tests/milo/ab-memoire.js',
  'tests/milo/eval.js',
  'tests/milo/r34_banc.js',
  'tests/milo/runner.js',
  'tests/muscles/runner.js',
  'tests/questionnaire/runner.js',
  'tests/recette/pwa_offline.js',
  'tools/audit-prompt.js',
  'tools/audit_milo_liens.js',
  'tools/audit_nutri_moteur.js',
  'tools/banc_cc01_dropset.js',
  'tools/banc_clone_isolation.js',
  'tools/banc_d088.js',
  'tools/banc_debrief_demande.js',
  'tools/banc_debrief_provenance.js',
  'tools/banc_forensique_profil.js',
  'tools/banc_fp01.js',
  'tools/banc_import_echauffement.js',
  'tools/banc_notes_d087.js',
  'tools/banc_nutri_objectifs.js',
  'tools/banc_progres_seances.js',
  'tools/banc_seance_c1.js',
  'tools/banc_seance_c2.js',
  'tools/banc_seance_c3.js',
  'tools/banc_seance_date.js',
  'tools/banc_seance_unicite.js',
  'tools/banc_seance_ux.js',
  'tools/banc_session_integrity.js',
  'tools/banc_travail_lot2.js',
  'tools/banc_ux_d086.js',
  'tools/banc_ux_integration.js',
  'tools/banc_v8.js',
  'tools/banc_v9.js',
  'tools/cache-coupure.js',
  'tools/captures-nutrition.js',
  'tools/captures.js',
  'tools/contre_audit_nutri.js',
  'tools/corpus_nutri.js',
  'tools/corpus_nutri_mg.js',
  'tools/diag_seance01.js',
  'tools/diff_nutri_lipides25.js',
  'tools/diff_seance_ux.js',
  'tools/dump_prompt.js',
  'tools/exercices-muscles.js',
  'tools/export_catalogue.js',
  'tools/export_synonymes.js',
  'tools/gen_reference_catalogue.js',
  'tools/grille_import_map.js',
  'tools/instantane_1b23.js',
  'tools/instantane_douane.js',
  'tools/instantane_food_lot_b.js',
  'tools/instantane_foodlog_identite.js',
  'tools/instantane_records.js',
  'tools/instantane_ref100.js',
  'tools/instantane_rythme_questions.js',
  'tools/instantane_seance_audit.js',
  'tools/mut_banc_portabilite.py',
  'tools/r34_contexte.js',
  'tools/ref_pdf_sans_si01.js',
  'tools/remesure_nutrition.js',
  'tools/simul_nutri_v2.js',
  'tools/sonde_fuites_nutrition.js',
  'tools/verrou_faits.js',
  'tools/verrou_nutri.js',
]);
module.exports.cliquet = () => {
  const liste = JSON.parse(fs.readFileSync(path.join(RACINE, 'tests', 'garde_existants.json'), 'utf8'));
  const inscrits = new Map(liste.fichiers.map(x => [x.fichier, x]));
  const pts = module.exports.pointsEntree(), parF = new Map(pts.map(p => [p.f, p]));
  const parEtat = {}; for (const x of liste.fichiers) parEtat[x.etat] = (parEtat[x.etat] || 0) + 1;
  return {
    total: pts.length, gardes: pts.filter(p => p.garde).length, inscrits: inscrits.size, parEtat,
    nouveaux: pts.filter(p => !p.garde && !inscrits.has(p.f)).map(p => p.f),
    aRetirer: [...inscrits.keys()].filter(f => parF.has(f) && parF.get(f).garde),
    perimes: [...inscrits.keys()].filter(f => !parF.has(f)),
    intrus: [...inscrits.keys()].filter(f => !INVENTAIRE_FIGE_19_10.has(f)),
  };
};
// ℹ️ compatibilité : le compte affiché au début de la passe vient du même scanner (R2 : une seule définition)
module.exports.entreesSansGarde = () => module.exports.pointsEntree().filter(p => !p.garde).map(p => p.f);
/* les CHEMINS DE LANCEMENT officiels : la passe, la recette annexe (elle lance ses 15 suites), le lanceur à la demande */
module.exports.cheminsGardes = () => {
  const lire = (f) => { try { return fs.readFileSync(path.join(RACINE, f), 'utf8'); } catch (e) { return ''; } };
  const run = sansCommentaires(lire('tests/parcours/runner.js')), ann = sansCommPy(lire('tools/recette_annexe.py')), sg = sansCommPy(lire('tools/sous_garde.sh'));
  const iG = run.search(/require\('\.\.\/_garde_reseau\.js'\)/), iP = run.search(RE_PW_JS);
  return {
    'tests/parcours/runner.js': iG >= 0 && iG < iP,
    'tools/recette_annexe.py': /NODE_OPTIONS/.test(ann) && /_garde_reseau\.js/.test(ann) && /env\s*=\s*_env_garde\(\)/.test(ann),
    'tools/sous_garde.sh': /NODE_OPTIONS="--require[^\n]*_garde_reseau\.js/.test(sg) && /export NODE_OPTIONS\b/.test(sg),
  };
};
/* DÉCISION 3 de Michel (19/10/2026) : les essais Milo RÉELS (appels IA facturés) sont conservés tels quels, mais EXCLUS
   des exécutions non protégées. Ce qui les exclut, vérifié ici : aucun chemin automatique ne les lance — ni la passe, ni
   la recette annexe, ni un workflow — sauf banc-milo.yml, qui ne part QUE à la main (workflow_dispatch) avec « LANCER ». */
// LANCER un essai = l'EXÉCUTER (require du script, `node …`, ['node', '…']) ; LIRE sa source (témoins statiques) n'en est pas un
const ESSAIS_MILO = /require\(\s*(?:path\.join\([^)]*?)?['"][^'"]*milo\/(?:eval|r34_banc|ab-memoire)\.js['"]|node\s+\S*milo\/(?:eval|r34_banc|ab-memoire)\.js|['"]node['"]\s*,\s*['"][^'"]*milo\/(?:eval|r34_banc|ab-memoire)\.js['"]/;
module.exports.cheminsMilo = () => {
  const lire = (f) => { try { return fs.readFileSync(path.join(RACINE, f), 'utf8'); } catch (e) { return null; } };
  const ecarts = [];
  if (ESSAIS_MILO.test(sansCommentaires(lire('tests/parcours/runner.js') || ''))) ecarts.push('la passe charge un essai Milo réel');
  if (ESSAIS_MILO.test(lire('tests/recette/suites-annexes.json') || '')) ecarts.push('la recette annexe lance un essai Milo réel');
  let wfs = []; try { wfs = fs.readdirSync(path.join(RACINE, '.github', 'workflows')).filter(f => /\.ya?ml$/.test(f)); } catch (e) {}
  for (const f of wfs) {
    const y = sansCommPy(lire('.github/workflows/' + f) || '');
    if (f === 'banc-milo.yml') {
      const on = (y.match(/^on:\s*\n((?:[ \t]+.*\n|\s*\n)*)/m) || [null, ''])[1];
      if (!/^\s+workflow_dispatch:/m.test(on)) ecarts.push('banc-milo.yml ne part plus à la main');
      if (/^\s{1,4}(push|pull_request|pull_request_target|schedule|workflow_run|repository_dispatch|workflow_call):/m.test(on)) ecarts.push('banc-milo.yml a un déclencheur AUTOMATIQUE');
      if (!/!=\s*"LANCER"/.test(y)) ecarts.push('banc-milo.yml ne demande plus la confirmation LANCER');
    } else if (ESSAIS_MILO.test(y)) ecarts.push(f + ' lance un essai Milo réel');
  }
  if (!wfs.includes('banc-milo.yml') && wfs.length) { /* pas de banc réel : rien à exclure de plus */ }
  return ecarts;
};
module.exports.obligatoire = function (t) {
  console.log('\n═══ D031S-VII. LA GARDE OBLIGATOIRE — AUCUN NOUVEAU BANC SANS GARDE, LA LISTE DES ANCIENS NE FAIT QUE RÉTRÉCIR ═══');
  const c = module.exports.cliquet();
  t('D031S-VII ① aucun NOUVEAU point d\'entrée Playwright sans garde (tests/, tools/ : le garde est chargé AVANT Playwright)',
    c.nouveaux.length === 0, c.nouveaux.slice(0, 8).join(' · ') + (c.nouveaux.length ? ' — charger le garde en 1ʳᵉ ligne : require(\'../tests/_garde_reseau.js\')' : ''));
  t('D031S-VII ② la liste des anciens (tests/garde_existants.json) ne fait que RÉTRÉCIR : aucun inscrit devenu gardé, aucune ligne périmée',
    c.aRetirer.length === 0 && c.perimes.length === 0, 'à retirer : ' + c.aRetirer.slice(0, 6).join(' · ') + ' | périmés : ' + c.perimes.slice(0, 6).join(' · '));
  t('D031S-VII ⑤ la liste des anciens ne peut pas GRANDIR : chaque inscrit figure dans l\'inventaire figé du 19/10 — un nouveau banc se GARDE, il ne s\'inscrit pas',
    c.intrus.length === 0, 'inscrit(s) hors inventaire : ' + c.intrus.slice(0, 6).join(' · ') + ' — le garder : python3 tools/migrer_garde.py --nouveau <fichier>');
  const ch = module.exports.cheminsGardes();
  t('D031S-VII ③ les chemins de lancement officiels chargent le garde : la passe, la recette annexe (ses 15 suites), tools/sous_garde.sh',
    Object.values(ch).every(Boolean), Object.entries(ch).filter(([, v]) => !v).map(([k]) => k).join(' · '));
  const em = module.exports.cheminsMilo();
  t('D031S-VII ④ les essais Milo RÉELS (décision 3 : conservés) ne partent par AUCUN chemin automatique : ni la passe, ni la recette annexe, ni un workflow — sauf banc-milo, à la main, avec « LANCER »',
    em.length === 0, em.join(' · '));
  console.log('  ℹ️ ' + c.total + ' point(s) d\'entrée Playwright : ' + c.gardes + ' gardé(s) · ' + c.inscrits + ' ancien(s) inscrit(s) (' +
    Object.entries(c.parEtat).map(([e, n]) => e + ' ' + n).join(' · ') + ') — un ancien se lance gardé : tools/sous_garde.sh node <fichier>');
};

/* ═══ D031S-III — LES IDENTITÉS : fictives dans les tests, fictives dans l'app servie, reconnues comme les vraies ═══
   Les adresses réelles ne sont JAMAIS affichées : un témoin rouge dit un NOMBRE et un nom de FICHIER, pas l'adresse. */
const IDF = require('../identites_fictives.js');
const http = require('http');
const recuperer = (PORT, f) => new Promise((ok) => { http.get('http://localhost:' + PORT + '/' + f, (r) => { const b = []; r.on('data', x => b.push(x)); r.on('end', () => ok(Buffer.concat(b).toString('utf8'))); }).on('error', () => ok('')); });
module.exports.identites = async function (t, b, PORT) {
  console.log('\n═══ D031S-III. LES IDENTITÉS DE TEST — FICTIVES, SUR UN DOMAINE RÉSERVÉ (example.test) ═══');
  const ro = IDF.roles(), manquants = Object.entries(ro).filter(([, v]) => !v).map(([k]) => k);
  t('D031S-III ① les identités que l\'app reconnaît sont LUES dans son code (fondateur, Christophe, Eline, Emma, boîte à idées, 4 listes) — aucune recopiée',
    manquants.length === 0 && IDF.adressesReelles().length >= 5, manquants.length ? 'introuvable(s) dans le code : ' + manquants.join(', ') : IDF.adressesReelles().length + ' identité(s)');
  const fichiers = ['index.html', 'constants.js', 'app.js', 'coach.js', 'tracking.js', 'log.js', 'setup.js', 'screens.js', 'state.js', 'nutrition-v2.js'];
  const servis = {}; for (const f of fichiers) servis[f] = await recuperer(PORT, f);
  const fuite = fichiers.filter(f => IDF.compterReelles(servis[f]) > 0 || !servis[f]);
  t('D031S-III ② l\'app servie aux tests ne porte AUCUNE identité réelle (listes, comparaisons en dur, textes)',
    fuite.length === 0 && /fondateur@example\.test/.test(servis['constants.js']),
    fuite.map(f => f + ' : ' + (servis[f] ? IDF.compterReelles(servis[f]) + ' identité(s) réelle(s)' : 'non servi')).join(' · '));
  const c = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const p = await c.newPage();
  await p.goto('http://localhost:' + PORT + '/index.html');
  const R = await p.evaluate((ID) => { const o = {};
    try { o.admin = ADMIN_EMAILS[0] === ID.fondateur;
      const av = S.email;
      S.email = ID.christophe; o.christophe = _isChristophe() && !_isEline() && !_isEmma();
      S.email = ID.eline; o.eline = _isEline() && !_isChristophe();
      S.email = ID.emma; o.emma = _isEmma() && !_isEline();
      S.email = 'quelquun@example.com'; o.lambda = !_isChristophe() && !_isEline() && !_isEmma();
      o.testeur = TESTER_EMAILS.indexOf(ID.testeur1) >= 0 && TESTER_EMAILS.indexOf(ID.christophe) >= 0;
      S.email = av; } catch (e) { o.err = String(e && e.message || e); }
    return o; }, IDF.ID);
  await c.close();
  t('D031S-III ③ l\'app servie reconnaît les identités fictives comme les vraies (admin, Christophe, Eline, Emma, testeurs) — et pas un inconnu',
    !R.err && R.admin && R.christophe && R.eline && R.emma && R.lambda && R.testeur, JSON.stringify(R));
  const ecrites = fichiersDeLaPasse().concat([path.join('tests', 'parcours', 'garde_reseau.js')])
    .map(f => [f, IDF.compterReelles(fs.readFileSync(path.join(RACINE, f), 'utf8'))]).filter(([, n]) => n > 0);
  t('D031S-III ④ aucune identité réelle n\'est ÉCRITE dans les fichiers de test de la passe',
    ecrites.length === 0, ecrites.map(([f, n]) => f + ' : ' + n).join(' · '));
  const ailleurs = [];
  for (const dir of ['tools', path.join('tests', 'milo'), path.join('tests', 'recette'), path.join('tests', 'calculs'), path.join('tests', 'donnees')]) {
    let fs_ = []; try { fs_ = fs.readdirSync(path.join(RACINE, dir)); } catch (e) { continue; }
    for (const f of fs_.filter(x => /\.(js|py|sh)$/.test(x))) { const n = IDF.compterReelles(fs.readFileSync(path.join(RACINE, dir, f), 'utf8')); if (n) ailleurs.push(path.join(dir, f) + ' (' + n + ')'); }
  }
  console.log('  ℹ️ hors passe, ' + ailleurs.length + ' fichier(s) portent encore une identité réelle : ' + (ailleurs.join(' · ') || 'aucun'));
};

/* ═══ D031S-IV — L'HYGIÈNE DES TÉMOINS : les trois formes de faux vert déjà payées ne reviennent pas ═══
   Chacune a été MESURÉE dans cette passe (contre-expertise du 19/10, OPTI-TEST-02) :
   ① un témoin dont la condition est `true` en dur — il ne peut pas rougir (« vérifié par lecture du code ») ;
   ② `.match(/…/g||[]).length` — le `||[]` porte sur l'expression rationnelle, pas sur le résultat : un texte absent
      fait PLANTER la passe au lieu de rougir ;
   ③ `corps…(…)||'x'` — un corps de fonction ABSENT devient une chaîne quelconque, et « ne contient pas X » est vrai
      sur du vide.
   Lu dans le TEXTE des fichiers de la passe : un retour de ces formes rougit avant de servir. */
const FORMES = [
  ['condition `true` en dur', /\bt\w*\(\s*((?:'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)\s*(?:\+\s*(?:'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|\w+)\s*)*),\s*(?:true|!0|!!1)\s*[,)]/g],
  ['`.match(/…/g||[])` (le repli est dans l\'appel)', /\.match\(\/(?:[^/\\\n]|\\.)+\/[gimsuy]*\s*\|\|\s*\[\]\s*\)/g],
  ['corps absent remplacé par une chaîne (`corps…(…)||\'…\'`)', /\bcorps\w*\([^()]*\)\s*\|\|\s*(['"])[^'"]+\1/g],
];
module.exports.formesFautives = () => {
  const vus = [];
  for (const f of fichiersDeLaPasse()) {
    const src = sansCommentaires(fs.readFileSync(path.join(RACINE, f), 'utf8'));
    for (const [nom, re] of FORMES) { re.lastIndex = 0; let m; while ((m = re.exec(src))) vus.push(f + ':' + src.slice(0, m.index).split('\n').length + ' ' + nom); }
  }
  return vus;
};
module.exports.hygiene = function (t) {
  console.log('\n═══ D031S-IV. L\'HYGIÈNE DES TÉMOINS — LES FAUX VERTS DÉJÀ PAYÉS NE REVIENNENT PAS ═══');
  const vus = module.exports.formesFautives();
  t('D031S-IV ① aucun témoin de la passe n\'a une condition `true` en dur, un `.match(/…/g||[])` ou un corps absent remplacé par une chaîne',
    vus.length === 0, vus.slice(0, 8).join(' · '));
  /* SEC-04 (décision de Michel, 19/10) : sans lui, un module qui plante arrête tout sans total — le retirer doit se VOIR ici.
     Le comportement lui-même est éprouvé par tools/mut_plantages.py (11 plantages volontaires + contre-épreuve). */
  const run = sansCommentaires(fs.readFileSync(path.join(RACINE, 'tests', 'parcours', 'runner.js'), 'utf8'));
  const iSec = run.search(/require\('\.\.\/_plantages\.js'\)\.installer\(__filename,\s*t,/), iMod = run.search(/require\('\.\/[\w.-]+\.js'\)/);
  let api = null; try { api = require('../_plantages.js'); } catch (e) {}
  t('D031S-IV ② SEC-04 est installé AVANT le premier module chargé par la passe (un module qui plante devient un KO nommé)',
    iSec >= 0 && iMod > iSec && !!api && typeof api.installer === 'function', 'installation ' + iSec + ' · premier module ' + iMod + ' · tests/_plantages.js ' + (api ? 'présent' : 'ABSENT'));
  module.exports.obligatoire(t);
};

/* ═══ D031S-V — DES ORACLES INDÉPENDANTS : des valeurs calculées À LA MAIN, pas par la fonction testée ═══
   POURQUOI : plusieurs témoins comparent le résultat de l'app à… l'app (« le PR = Math.max(bz(102.5,3),bz(100,5)) »,
   « l'écran affiche calcMacros() »). Ils prouvent la COHÉRENCE, jamais la JUSTESSE : si `bz` se trompait, les deux
   côtés se tromperaient pareil. Ces témoins posent la valeur ATTENDUE en chiffres, calculée ici à la main :
   ① 1RM (Brzycki, la formule de l'app : kg / (1,0278 − 0,0278 × reps), arrondie au dixième) :
      100 × 5 → 100 / 0,8888 = 112,51 → 112,5 · 102,5 × 3 → 102,5 / 0,9444 = 108,53 → 108,5 · 20 × 12 → 20 / 0,6942
      = 28,81 → 28,8 · 1 répétition → la charge · 25 reps → plafonné à 20 : 100 / 0,4718 = 211,95 → 212 · 0 → 0.
   ② macros des modes standards (D-035, décision de Michel du 02/10/2026, exemples écrits dans le journal) :
      80 kg, prise de muscle, 3 122 kcal → protéines 80 × 2,2 = 176 g · lipides 3 122 × 25 % / 9 = 86,7 → 87 g ·
      glucides (3 122 − 704 − 783) / 4 = 408,75 → 409 g ; 130 kg, perte, 1 932 kcal → 325 g · 53,7 → 54 g ·
      (1 932 − 1 300 − 486) / 4 = 36,5 → 37 g.
   ⛔ Un rouge ici n'autorise PAS à changer une formule : c'est une anomalie à SOUMETTRE à Michel (consigne du 19/10). */
module.exports.oracles = async function (t, b, PORT) {
  console.log('\n═══ D031S-V. DES ORACLES INDÉPENDANTS — 1RM ET MACROS, VALEURS CALCULÉES À LA MAIN ═══');
  const c = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const p = await c.newPage();
  await p.goto('http://localhost:' + PORT + '/index.html');
  const R = await p.evaluate(() => { const o = {};
    try {
      o.bz = [bz(100, 5), bz(102.5, 3), bz(20, 12), bz(150, 1), bz(100, 25), bz(0, 5), bz(80, 0)];
      const sauve = { bw: S.bw, goal: S.goal, gender: S.gender, foodMode: S.foodMode, keto: S.keto };
      S.gender = 'H'; S.foodMode = ''; S.keto = false;
      S.bw = 80; S.goal = 'muscle'; o.m1 = macrosForKcal(3122);
      S.bw = 130; S.goal = 'perte'; o.m2 = macrosForKcal(1932);
      Object.assign(S, sauve);
    } catch (e) { o.err = String(e && e.message || e); }
    return o; });
  await c.close();
  const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  t('D031S-V ① 1RM (Brzycki) : 112,5 · 108,5 · 28,8 · charge seule à 1 rép · plafond à 20 reps (212) · 0 sans charge ni rép — valeurs calculées à la main',
    !R.err && egal(R.bz, [112.5, 108.5, 28.8, 150, 212, 0, 0]), R.err || JSON.stringify(R.bz));
  t('D031S-V ② macros standards (D-035) : 80 kg muscle 3 122 kcal → 176 / 87 / 409 g ; 130 kg perte 1 932 kcal → 325 / 54 / 37 g',
    !R.err && egal(R.m1, { prot_g: 176, fat_g: 87, carbs_g: 409 }) && egal(R.m2, { prot_g: 325, fat_g: 54, carbs_g: 37 }),
    R.err || JSON.stringify([R.m1, R.m2]));
};

module.exports.fin = async function (t) {
  console.log('\n═══ D031S-II. LE GARDE RÉSEAU — À LA FIN DE LA PASSE ═══');
  const g = GARDE();
  if (!g) { t('D031S-II ① le garde réseau est toujours chargé à la fin de la passe', false, 'garde ABSENT'); return; }
  const cn = await g.canariNode();
  t('D031S-II ① le garde est toujours en place à la fin (canari Node rejoué) : aucun test ne l\'a retiré',
    g.canariOk(cn), JSON.stringify(cn));
  await attendre(300);
  const k = g.compteurs(), sorties = g.journal().filter(e => e.type === 'nav' && e.sort === 'SORTIE');
  t('D031S-II ② ⛔ aucune requête de la passe n\'a reçu de réponse du vrai réseau (SORTIE = 0)',
    k.nav.SORTIE === 0, sorties.slice(0, 5).map(e => e.hote + (e.action ? ' · ' + e.action : '') + (e.adresse ? ' · ' + JSON.stringify(e.adresse) : '')).join(' | '));
  t('D031S-II ③ chaque navigateur lancé pendant la passe s\'est PROUVÉ au lancement (aucun n\'a servi sans garde)',
    k.lancements >= 1 && k.preuves === k.lancements && k.preuvesEchouees === 0, k.preuves + ' preuve(s) / ' + k.lancements + ' lancement(s), ' + k.preuvesEchouees + ' échec(s)');
  /* ℹ️ L'INFORMATION, PAS UN VERDICT : ce que les tests n'ont PAS simulé. Bloqué n'est pas sorti — c'est la sécurité, et
     elle tient. Mais chaque ligne est une panne réseau que l'app a vue sans que le test l'ait voulue : la qualité du test
     (simuler ce qu'on attend) est un autre sujet que la sécurité, et elle se lit ici. */
  const ns = g.nonSimulees();
  console.log('  ℹ️ garde réseau : ' + k.contextes + ' contexte(s), ' + k.lancements + ' lancement(s), ' + k.enfants + ' processus enfant(s) · ' +
    Object.entries(k.nav).filter(([, n]) => n).map(([s, n]) => s + ' ' + n).join(' · '));
  for (const [cle, n] of ns.slice(0, 40)) console.log('  ℹ️   ' + n + ' × ' + cle);
  if (ns.length > 40) console.log('  ℹ️   … ' + (ns.length - 40) + ' autre(s) ligne(s) — détail : variable FT_GARDE_JOURNAL');
};
