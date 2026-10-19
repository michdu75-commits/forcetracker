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
  const sans = module.exports.entreesSansGarde();
  console.log('  ℹ️ ' + sans.length + ' point(s) d\'entrée lancent Playwright sans charger le garde (bancs et outils lancés SEULS ; la passe, elle, est gardée) — '
    + 'les lancer gardés : node -r ./tests/_garde_reseau.js <fichier>');
};

/* ⛔ CE QUI CONTOURNERAIT LE GARDE, cherché dans le TEXTE des fichiers que la passe charge. Le garde refuse déjà ces chemins
   à l'exécution ; ce témoin les refuse à l'ÉCRITURE — un contournement ajouté demain rougit avant de pouvoir servir.
   `route.continue()` n'en fait pas partie : la requête part vers le proxy mort, et le résumé de fin la montre. */
const RE_CONTOURNEMENT = /launchPersistentContext|connectOverCDP|chromium\.connect\(|launchServer\(|no-proxy-server|proxy-server|proxy\s*:\s*\{|ignoreDefaultArgs|net\.Socket\.prototype\.connect\s*=|Module\._extensions|dns\.(lookup|resolve\w*)\s*=|process\.env\.(HTTPS?_PROXY|ALL_PROXY|NO_PROXY|NODE_OPTIONS)\s*=|delete\s+process\.env|forcetracker\.gardeReseau|unshare/;
const fichiersDeLaPasse = () => [].concat(
  fs.readdirSync(path.join(RACINE, 'tests', 'parcours')).filter(f => f.endsWith('.js')).map(f => path.join('tests', 'parcours', f)),
  fs.readdirSync(path.join(RACINE, 'tests')).filter(f => f.endsWith('.js')).map(f => path.join('tests', f)))
  .filter(f => !/(^|[\\/])(_garde_reseau|garde_reseau)\.js$/.test(f));
module.exports.contournements = () => {
  const vus = [];
  for (const f of fichiersDeLaPasse()) {
    const lignes = fs.readFileSync(path.join(RACINE, f), 'utf8').split('\n');
    lignes.forEach((l, i) => { const m = l.match(RE_CONTOURNEMENT); if (m) vus.push(f + ':' + (i + 1) + ' « ' + m[0] + ' »'); });
  }
  return vus;
};
/* ℹ️ les points d'entrée qui lancent Playwright SANS charger le garde (bancs lancés seuls, outils). Information, pas verdict :
   la passe, elle, est gardée. Un banc se lance gardé avec `node -r ./tests/_garde_reseau.js tools/banc_x.js`. */
module.exports.entreesSansGarde = () => {
  const liste = [];
  for (const dir of ['tools', 'tests', path.join('tests', 'parcours'), path.join('tests', 'milo'), path.join('tests', 'recette')]) {
    let fichiers = []; try { fichiers = fs.readdirSync(path.join(RACINE, dir)); } catch (e) { continue; }
    for (const f of fichiers.filter(x => x.endsWith('.js'))) {
      const src = fs.readFileSync(path.join(RACINE, dir, f), 'utf8');
      if (/require\([^)]*playwright[^)]*\)|_playwright\.js/.test(src) && !/_garde_reseau/.test(src) && !/^tests[\\/]parcours[\\/](?!runner\.js)/.test(path.join(dir, f))) liste.push(path.join(dir, f));
    }
  }
  return liste;
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
  /* ℹ️ L'INFORMATION, PAS UN VERDICT : ce que les tests n'ont PAS simulé. Bloqué n'est pas sorti — c'est la sécurité, et
     elle tient. Mais chaque ligne est une panne réseau que l'app a vue sans que le test l'ait voulue : la qualité du test
     (simuler ce qu'on attend) est un autre sujet que la sécurité, et elle se lit ici. */
  const ns = g.nonSimulees();
  console.log('  ℹ️ garde réseau : ' + k.contextes + ' contexte(s), ' + k.lancements + ' lancement(s), ' + k.enfants + ' processus enfant(s) · ' +
    Object.entries(k.nav).filter(([, n]) => n).map(([s, n]) => s + ' ' + n).join(' · '));
  for (const [cle, n] of ns.slice(0, 40)) console.log('  ℹ️   ' + n + ' × ' + cle);
  if (ns.length > 40) console.log('  ℹ️   … ' + (ns.length - 40) + ' autre(s) ligne(s) — détail : variable FT_GARDE_JOURNAL');
};
