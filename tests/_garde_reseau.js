/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   LE GARDE RÉSEAU DES TESTS — FERMÉ PAR DÉFAUT (D-031-SÉCURITÉ-01, 19/10/2026)
   ═══════════════════════════════════════════════════════════════════════════════════════════════
   ⛔⛔ POURQUOI CE FICHIER EXISTE — un défaut MESURÉ, pas une précaution de principe.
   La contre-expertise du 19/10/2026 (C1, M4) a recompté, dans la passe A0 d'OPTI-TEST-02,
   1 356 requêtes externes qu'aucun test n'arrêtait : 502 vers la production (Apps Script,
   Worker), 850 vers des tiers, 4 vers une adresse non routable — dont des ÉCRITURES SANS JETON
   (saveProfile, logCustomExercise, logSearchMiss, sendConfirmCode), une sous l'adresse réelle
   d'un testeur. Elles n'ont été arrêtées QUE par un garde extérieur à la passe. 👉 *L'innocuité
   de la passe dépendait du réseau de la machine qui la lance.*

   ⭐ CE QU'IL FAIT — deux couches indépendantes, et un journal :
     ① NAVIGATEUR : tout contexte reçoit, À SA CRÉATION, une route qui ABANDONNE toute adresse
        non locale (`blockedbyclient`). Les simulations des tests, posées après, gardent la
        priorité. Chromium part avec un PROXY MORT (127.0.0.1:9) et une résolution de noms
        coupée : une requête qu'un test laisse partir (`route.continue()`) ne sort pas non plus.
        Les options qui contourneraient le proxy (`proxy`, `--no-proxy-server`, `--proxy-*`)
        sont RETIRÉES ; les contextes persistants, `connect`, CDP et `launchServer` sont REFUSÉS.
     ② NODE : toute connexion TCP, résolution DNS ou envoi UDP vers une destination non locale
        est refusé ; les processus enfants héritent du garde (`NODE_OPTIONS`) et de proxys morts
        (Python, git, curl les lisent) ; un navigateur lancé hors Playwright sans le proxy mort
        est REFUSÉ.
     ③ JOURNAL : chaque requête externe a un sort — simulée · refusée par le test · bloquée par
        le refus par défaut · bloquée par le garde de processus · servie par le service worker ·
        interrompue · autre échec · ⛔ SORTIE (une vraie réponse réseau est arrivée : ce cas doit
        rester à zéro, D031S-II ② le vérifie). Détail par requête (destination, action, sort) dans
        `FT_GARDE_JOURNAL/garde-<pid>.jsonl` quand cette variable nomme un dossier.
   ⛔ FERMÉ PAR DÉFAUT : toute copie de Playwright chargée est patchée ; une copie dont la
   structure est inconnue fait ÉCHOUER le chargement au lieu de laisser un navigateur sans garde.
   Les variables d'environnement dont le NOM ressemble à un secret (clé, jeton, mot de passe…)
   sont retirées du processus et de ses enfants : un test ne peut pas lire une vraie clé.

   ⚠️ CE QU'IL NE FAIT PAS, et il faut le savoir :
     · il ne rend pas un test JUSTE : une requête bloquée est une panne réseau que l'app voit.
       Un test qui veut vérifier un comportement doit SIMULER la réponse (route.fulfill) —
       le garde est un filet, pas une simulation ;
     · il ne protège que les processus qui le chargent : la passe le charge en première ligne
       (`tests/parcours/runner.js`) ; un banc lancé seul doit être lancé avec
       `node -r ./tests/_garde_reseau.js tools/banc_x.js` tant qu'il ne le charge pas lui-même.
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const MARQUE = Symbol.for('forcetracker.gardeReseau');
if (globalThis[MARQUE]) { module.exports = globalThis[MARQUE]; return; }     // chargé deux fois : une seule instance

const fs = require('fs'), path = require('path'), net = require('net'), dns = require('dns'), dgram = require('dgram'),
      cp = require('child_process'), Module = require('module');
const SOI = __filename;
const PROXY_MORT = 'http://127.0.0.1:9';
const ARGS_NAV = ['--proxy-server=' + PROXY_MORT, '--proxy-bypass-list=localhost;127.0.0.1;::1',
  '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE localhost , EXCLUDE 127.0.0.1',
  '--force-webrtc-ip-handling-policy=disable_non_proxied_udp'];
const RE_ARGS_RETIRES = /^--(proxy-server|proxy-bypass-list|host-resolver-rules|proxy-pac-url|no-proxy-server|proxy-auto-detect|winhttp-proxy-resolver|force-webrtc-ip-handling-policy)(=|$)/;
/* le REFUS PAR DÉFAUT du navigateur : toute adresse qui n'est PAS la machine elle-même. Une expression rationnelle et
   pas une fonction, exprès : Playwright la transmet au navigateur, qui n'intercepte alors QUE ces requêtes — une
   fonction ferait intercepter aussi chaque fichier local de l'app (un aller-retour de plus par fichier). */
const RE_NON_LOCAL = /^(?!(?:https?|wss?):\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?(?:[\/?#]|$))(?!(?:data|blob|about|chrome|chrome-extension|chrome-error|devtools):)/i;
const RE_SECRET = /(KEY|TOKEN|SECRET|PASSW|CREDENTIAL|AUTH|COOKIE|BEARER|SESSION|API_?K|JETON|MOT_?DE_?PASSE|MDP)/i;   // noms anglais ET français
const RE_EXE_NAV = /(?:^|[\\/])(?:chrome|chromium(?:-browser)?|google-chrome[\w.-]*|headless_shell|chrome-headless-shell|msedge|firefox(?:-bin)?|MiniBrowser|pw_run\.sh)(?:\.exe)?$/i;
const RE_CLIENT_PW = /playwright-core[\\/]lib[\\/]client[\\/](browserType|browser|browserContext|network)\.js$/;
const RE_ENTREE_PW = /[\\/]playwright(-core)?[\\/]index\.js$/;

// ── l'état du garde : compteurs et journal (en mémoire ; dans un fichier si FT_GARDE_JOURNAL nomme un dossier) ──
const compte = { nodeRefusees: 0, lancements: 0, contextes: 0, enfants: 0, copiesPlaywright: 0,
  nav: { 'simulée': 0, 'refusée par le test': 0, 'bloquée (refus par défaut)': 0, 'bloquée (garde de processus)': 0,
         'SORTIE': 0, 'interrompue': 0, 'autre échec': 0, websocket: 0 } };
const journal = [];
const FICHIER = process.env.FT_GARDE_JOURNAL ? path.join(process.env.FT_GARDE_JOURNAL, 'garde-' + process.pid + '.jsonl') : null;
if (FICHIER) { try { fs.mkdirSync(process.env.FT_GARDE_JOURNAL, { recursive: true }); } catch (e) {} }
const noter = (ev) => { ev.ms = Date.now(); journal.push(ev); if (FICHIER) { try { fs.appendFileSync(FICHIER, JSON.stringify(ev) + '\n'); } catch (e) {} } };
const erreurGarde = (quoi, code) => Object.assign(new Error('garde réseau : ' + quoi + ' refusé (tests sans réseau)'), { code: code || 'ENETUNREACH', gardeReseau: true });

// ── ce qui est LOCAL : la machine elle-même, rien d'autre (« localhost.exemple.com » n'est PAS local) ──
const estLocalHote = (h) => {
  if (h == null || h === '') return true;
  h = String(h).trim().toLowerCase().replace(/^\[|\]$/g, '');
  return h === 'localhost' || h === '::1' || h === '::' || h === '0.0.0.0' || /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h) || /^::ffff:127\./.test(h);
};
const estLocalUrl = (u) => !RE_NON_LOCAL.test(String(u));     // UNE seule définition de « local » côté navigateur (R2)
const actionDe = (req) => {      // l'action d'un appel au backend (?action= ou corps JSON), pour le journal — jamais les valeurs
  try { const a = new URL(req.url()).searchParams.get('action'); if (a) return a; } catch (e) {}
  try { const d = req.postData && req.postData(); if (d) { const j = JSON.parse(d); if (j && typeof j.action === 'string') return j.action; } } catch (e) {}
  try { const d = req.postData && req.postData(); const m = d && d.match(/(?:^|[&?])data=([^&]*)/); if (m) { const j = JSON.parse(decodeURIComponent(m[1])); if (j && j.action) return String(j.action); } } catch (e) {}
  return '';
};

// ── ① l'environnement : aucun secret lisible, des proxys morts pour tout ce qui en lit, le garde transmis aux enfants ──
const secretsRetires = [];
for (const k of Object.keys(process.env)) if (k !== 'NODE_OPTIONS' && RE_SECRET.test(k)) { secretsRetires.push(k); delete process.env[k]; }
/* GIT_CONFIG_KEY_n retiré sans son groupe laisserait GIT_CONFIG_COUNT pointer sur des clés absentes : git refuserait
   alors de démarrer. Le groupe part en entier — git retombe sur ses fichiers de configuration ordinaires. */
const groupeGit = (env) => { if (Object.keys(env).some(k => /^GIT_CONFIG_(KEY|VALUE)_\d+$/.test(k)) || secretsRetires.some(k => /^GIT_CONFIG_KEY_/.test(k)))
  for (const k of Object.keys(env)) if (/^GIT_CONFIG_(COUNT|KEY_\d+|VALUE_\d+)$/.test(k)) delete env[k]; };
groupeGit(process.env);
for (const k of ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'http_proxy', 'https_proxy', 'all_proxy']) process.env[k] = PROXY_MORT;
process.env.NO_PROXY = process.env.no_proxy = 'localhost,127.0.0.1,::1';
const OPTION_REQUIRE = '--require ' + JSON.stringify(SOI);
if (!(process.env.NODE_OPTIONS || '').includes(SOI)) process.env.NODE_OPTIONS = ((process.env.NODE_OPTIONS || '') + ' ' + OPTION_REQUIRE).trim();
const envEnfant = (env) => {
  const e = Object.assign({}, env);
  for (const k of Object.keys(e)) if (k !== 'NODE_OPTIONS' && RE_SECRET.test(k)) delete e[k];
  groupeGit(e);
  for (const k of ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'http_proxy', 'https_proxy', 'all_proxy']) e[k] = PROXY_MORT;
  e.NO_PROXY = e.no_proxy = 'localhost,127.0.0.1,::1';
  if (!(e.NODE_OPTIONS || '').includes(SOI)) e.NODE_OPTIONS = ((e.NODE_OPTIONS || '') + ' ' + OPTION_REQUIRE).trim();
  return e;
};

// ── ② Node : TCP, DNS, UDP ──
const refusNode = (quoi, hote, port) => { compte.nodeRefusees++; noter({ type: 'node', quoi, hote: String(hote).slice(0, 120), port: port == null ? null : port, sort: 'bloquée (garde de processus)' }); };
const connect0 = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...a) {
  let o = a[0]; if (Array.isArray(o)) o = o[0];
  let hote, port, chemin;
  if (o && typeof o === 'object') { hote = o.host; port = o.port; chemin = o.path; }
  else if (typeof o === 'string' && isNaN(Number(o))) chemin = o;
  else { port = o; hote = typeof a[1] === 'string' ? a[1] : undefined; }
  if (!chemin && !estLocalHote(hote)) {
    refusNode('connexion TCP', hote, port);
    const s = this; process.nextTick(() => s.destroy(erreurGarde('connexion vers ' + hote)));
    return this;
  }
  return connect0.apply(this, a);
};
const refusDns = (nom, h, rappel, promesse) => {
  refusNode('DNS ' + nom, h);
  const e = Object.assign(erreurGarde('résolution de ' + h, 'ENOTFOUND'), { hostname: h });
  if (promesse) return Promise.reject(e);
  if (rappel) { process.nextTick(rappel, e); return {}; }
  throw e;
};
const lookup0 = dns.lookup;
dns.lookup = function (h, ...r) { return estLocalHote(h) ? lookup0.call(this, h, ...r) : refusDns('lookup', h, r.find(x => typeof x === 'function'), false); };
const RESOLVEURS = ['resolve', 'resolve4', 'resolve6', 'resolveAny', 'resolveCname', 'resolveCaa', 'resolveMx', 'resolveNaptr', 'resolveNs',
  'resolvePtr', 'resolveSoa', 'resolveSrv', 'resolveTxt', 'reverse', 'lookupService', 'lookup'];
const cibles = [[dns, false], [dns.Resolver && dns.Resolver.prototype, false], [dns.promises, true], [dns.promises && dns.promises.Resolver && dns.promises.Resolver.prototype, true]];
for (const [obj, promesse] of cibles) {
  if (!obj) continue;
  for (const nom of RESOLVEURS) {
    if (obj === dns && nom === 'lookup') continue;               // déjà fait ci-dessus
    const f0 = obj[nom]; if (typeof f0 !== 'function') continue;
    obj[nom] = function (h, ...r) { return estLocalHote(h) ? f0.call(this, h, ...r) : refusDns(nom, h, r.find(x => typeof x === 'function'), promesse); };
  }
}
const udpSend0 = dgram.Socket.prototype.send, udpConnect0 = dgram.Socket.prototype.connect;
dgram.Socket.prototype.send = function (msg, ...r) {
  const adresse = r.find(x => typeof x === 'string');
  if (adresse !== undefined && !estLocalHote(adresse)) {
    refusNode('envoi UDP', adresse, r.find(x => typeof x === 'number'));
    const rappel = r.find(x => typeof x === 'function'); const e = erreurGarde('envoi UDP vers ' + adresse);
    if (rappel) process.nextTick(rappel, e); else process.nextTick(() => this.emit('error', e));
    return;
  }
  return udpSend0.call(this, msg, ...r);
};
if (typeof udpConnect0 === 'function') dgram.Socket.prototype.connect = function (port, adresse, ...r) {
  if (typeof adresse === 'string' && !estLocalHote(adresse)) { refusNode('UDP connect', adresse, port); throw erreurGarde('UDP vers ' + adresse); }
  return udpConnect0.call(this, port, adresse, ...r);
};

// ── ③ processus enfants : le garde suit ; un navigateur lancé sans le proxy mort est refusé ──
const verifierNavigateur = (cmd, args) => {
  const exe = String(cmd || ''), liste = Array.isArray(args) ? args.map(String) : [];
  const ligne = exe + ' ' + liste.join(' ');
  const premier = exe.trim().split(/\s+/)[0] || '';            // exec : la commande est une ligne de shell
  const lance = RE_EXE_NAV.test(exe) || RE_EXE_NAV.test(premier) || /--remote-debugging-(port|pipe)/.test(ligne);
  if (lance && !ligne.includes('--proxy-server=' + PROXY_MORT)) {
    noter({ type: 'lancement', quoi: 'navigateur sans le proxy mort', exe: premier.slice(0, 120), sort: 'bloquée (garde de processus)' });
    throw erreurGarde('lancement d\'un navigateur sans le proxy mort (' + premier.slice(0, 80) + ')', 'EGARDE');
  }
};
for (const nom of ['spawn', 'spawnSync', 'execFile', 'execFileSync', 'fork']) {
  const f0 = cp[nom]; if (typeof f0 !== 'function') continue;
  cp[nom] = function (cmd, args, options, ...r) {
    // (cmd, options[, rappel]) : les options sont à la place des arguments — on décale, sans perdre le rappel
    if (args && !Array.isArray(args) && typeof args === 'object') return cp[nom].call(this, cmd, [], args, options, ...r);
    verifierNavigateur(cmd, args);
    if (options && typeof options === 'object' && options.env) options = Object.assign({}, options, { env: envEnfant(options.env) });
    compte.enfants++;
    return f0.call(this, cmd, args, options, ...r);
  };
}
for (const nom of ['exec', 'execSync']) {
  const f0 = cp[nom]; if (typeof f0 !== 'function') continue;
  cp[nom] = function (commande, options, ...r) {
    verifierNavigateur(commande, []);
    if (options && typeof options === 'object' && options.env) options = Object.assign({}, options, { env: envEnfant(options.env) });
    compte.enfants++;
    return f0.call(this, commande, options, ...r);
  };
}

// ── ④ Playwright : TOUTES les copies chargées, fermé par défaut ──
const DEJA = new WeakSet(), CONTEXTES = new WeakSet(), DEFAUT = new WeakSet(), DECISION = new WeakMap(), EN_COURS = new Map();
const patches = { BrowserType: 0, Browser: 0, BrowserContext: 0, Route: 0 };
const optionsSures = (o) => {
  const r = Object.assign({}, o || {});
  r.args = (r.args || []).filter(a => !RE_ARGS_RETIRES.test(String(a))).concat(ARGS_NAV);
  delete r.proxy;
  return r;
};
const refusParDefaut = (rt) => { DEFAUT.add(rt.request()); return rt.abort('blockedbyclient'); };
const poserRefus = (c) => c.route(RE_NON_LOCAL, refusParDefaut);
async function installerContexte(c) {
  if (!c || CONTEXTES.has(c)) return;
  CONTEXTES.add(c); compte.contextes++;
  // ⛔ LA PREMIÈRE ROUTE, donc la DERNIÈRE consultée : tout ce que les tests ne simulent pas finit ici
  await poserRefus(c);
  c.on('request', (rq) => { if (!estLocalUrl(rq.url())) { let hote = ''; try { hote = new URL(rq.url()).host; } catch (e) {} EN_COURS.set(rq, { hote, action: actionDe(rq), methode: rq.method() }); } });
  const classer = async (rq, finie) => {
    const ev = EN_COURS.get(rq); if (!ev) return; EN_COURS.delete(rq);
    const d = DECISION.get(rq), err = finie ? '' : ((rq.failure() || {}).errorText || '');
    let sort, adresse = null;
    if (finie) {
      if (d === 'fulfill') sort = 'simulée';
      else {
        let rs = null; try { rs = await rq.response(); } catch (e) {}
        if (rs && rs.fromServiceWorker()) sort = 'servie par le service worker';
        else { sort = 'SORTIE'; try { adresse = rs && await rs.serverAddr(); } catch (e) {} }
      }
    }
    else if (DEFAUT.has(rq) || /ERR_BLOCKED_BY_CLIENT/.test(err)) sort = 'bloquée (refus par défaut)';
    else if (d === 'abort') sort = 'refusée par le test';
    else if (/PROXY|NAME_NOT_RESOLVED|TUNNEL|ADDRESS_UNREACHABLE|CONNECTION_REFUSED|NETWORK_ACCESS_DENIED|INTERNET_DISCONNECTED/.test(err)) sort = 'bloquée (garde de processus)';
    else if (/ERR_ABORTED/.test(err)) sort = 'interrompue';
    else sort = 'autre échec';
    compte.nav[sort] = (compte.nav[sort] || 0) + 1;
    noter(Object.assign({ type: 'nav', sort, erreur: err.slice(0, 60), decision: d || null, adresse }, ev));
  };
  c.on('requestfinished', (rq) => { classer(rq, true); });
  c.on('requestfailed', (rq) => { classer(rq, false); });
  c.on('close', () => { for (const [rq] of EN_COURS) { try { if (rq.frame && rq.frame().page().context() === c) { EN_COURS.delete(rq); compte.nav['non terminée'] = (compte.nav['non terminée'] || 0) + 1; } } catch (e) { EN_COURS.delete(rq); compte.nav['non terminée'] = (compte.nav['non terminée'] || 0) + 1; } } });
  c.on('page', (pg) => pg.on('websocket', (ws) => { if (!estLocalUrl(ws.url())) { compte.nav.websocket++; noter({ type: 'websocket', hote: (() => { try { return new URL(ws.url()).host; } catch (e) { return ''; } })(), sort: 'tentée (coupée par le proxy mort)' }); } }));
}
function patcherClient(fichier, ex) {
  if (!ex || typeof ex !== 'object') return;
  const BT = ex.BrowserType, B = ex.Browser, BC = ex.BrowserContext, R = ex.Route;
  if (BT && BT.prototype && typeof BT.prototype.launch === 'function' && !DEJA.has(BT.prototype)) {
    DEJA.add(BT.prototype); patches.BrowserType++;
    const la0 = BT.prototype.launch;
    BT.prototype.launch = async function (o) {
      compte.lancements++;
      const nav = await la0.call(this, optionsSures(o));
      // ⛔ fermé par défaut : un navigateur dont la classe n'est pas patchée créerait des contextes sans refus par défaut
      if (!nav || !DEJA.has(Object.getPrototypeOf(nav))) { try { await nav.close(); } catch (e) {} throw erreurGarde('navigateur d\'une copie de Playwright non patchée', 'EGARDE'); }
      return nav;
    };
    for (const nom of ['launchPersistentContext', 'connect', 'connectOverCDP', 'launchServer']) {
      if (typeof BT.prototype[nom] === 'function') BT.prototype[nom] = function () { throw erreurGarde(nom + ' (chemin de lancement non contrôlé)', 'EGARDE'); };
    }
  }
  if (B && B.prototype && typeof B.prototype.newContext === 'function' && !DEJA.has(B.prototype)) {
    DEJA.add(B.prototype); patches.Browser++;
    // _innerNewContext est le passage commun de newContext, newPage et _newContextForReuse (Playwright 1.56)
    const nom = typeof B.prototype._innerNewContext === 'function' ? '_innerNewContext' : 'newContext';
    const nc0 = B.prototype[nom];
    B.prototype[nom] = async function (...a) { const c = await nc0.apply(this, a); await installerContexte(c); return c; };
  }
  if (BC && BC.prototype && !DEJA.has(BC.prototype)) {
    DEJA.add(BC.prototype); patches.BrowserContext++;
    const ua0 = BC.prototype.unrouteAll;      // « tout retirer » ne retire pas le refus par défaut : il est reposé, seul
    if (typeof ua0 === 'function') BC.prototype.unrouteAll = async function (...a) { const r = await ua0.apply(this, a); if (CONTEXTES.has(this)) await poserRefus(this); return r; };
  }
  if (R && R.prototype && typeof R.prototype.fulfill === 'function' && !DEJA.has(R.prototype)) {
    DEJA.add(R.prototype); patches.Route++;
    for (const [nom, decision] of [['fulfill', 'fulfill'], ['abort', 'abort'], ['continue', 'continue'], ['fallback', 'fallback']]) {
      const f0 = R.prototype[nom]; if (typeof f0 !== 'function') continue;
      R.prototype[nom] = function (...a) { try { const rq = this.request(); if (!DECISION.has(rq) || decision !== 'fallback') DECISION.set(rq, decision); } catch (e) {} return f0.apply(this, a); };
    }
  }
}
// ⛔ fermé par défaut, copie par copie : les navigateurs qu'une copie de Playwright exporte doivent avoir une classe patchée
const verifierEntree = (ex) => {
  const types = ['chromium', 'firefox', 'webkit'].map(n => ex && ex[n]).filter(Boolean);
  if (!types.length || !types.every(t => DEJA.has(Object.getPrototypeOf(t))) || !patches.Browser || !patches.Route) {
    throw erreurGarde('Playwright chargé sous une forme inconnue (BrowserType ' + patches.BrowserType + ', Browser ' + patches.Browser + ', Route ' + patches.Route + ') — aucun navigateur ne partira sans garde', 'EGARDE');
  }
};
const ext0 = Module._extensions['.js'];
Module._extensions['.js'] = function (module, fichier) {
  ext0.call(this, module, fichier);
  if (RE_CLIENT_PW.test(fichier)) patcherClient(fichier, module.exports);
  else if (RE_ENTREE_PW.test(fichier)) { compte.copiesPlaywright++; verifierEntree(module.exports); }
};
for (const [fichier, m] of Object.entries(require.cache)) if (RE_CLIENT_PW.test(fichier)) patcherClient(fichier, m.exports);   // copies déjà chargées
for (const [fichier, m] of Object.entries(require.cache)) if (RE_ENTREE_PW.test(fichier)) { compte.copiesPlaywright++; verifierEntree(m.exports); }

// ── ⑤ canaris : des destinations FICTIVES (RFC 6761 / 5737), qui doivent être refusées PAR LE GARDE ──
const canariNode = () => new Promise((fin) => {
  const r = {};
  const s = new net.Socket();
  s.on('error', (e) => { r.tcp = !!e.gardeReseau; dns.lookup('canari.invalid', (e2) => { r.dns = !!(e2 && e2.gardeReseau);
    dns.promises.resolve4('canari.example.test').then(() => { r.dnsPromesse = false; }, (e3) => { r.dnsPromesse = !!(e3 && e3.gardeReseau); })
      .then(() => (typeof fetch === 'function' ? fetch('https://canari.example.test/garde') : Promise.reject(Object.assign(new Error('pas de fetch'), { cause: { gardeReseau: true } }))))
      .then(() => { r.fetch = false; fin(r); }, (e4) => { r.fetch = !!(e4 && ((e4.cause && e4.cause.gardeReseau) || e4.gardeReseau)); fin(r); }); }); });
  s.connect(9, '192.0.2.1');
});
const canariOk = (r) => !!(r && r.tcp && r.dns && r.dnsPromesse && r.fetch);
const canariDebut = canariNode();

const api = {
  actif: true, version: 1, fichier: SOI, journalFichier: FICHIER, secretsRetires: secretsRetires.slice(),
  estLocalUrl, estLocalHote, installerContexte, canariDebut, canariNode, canariOk, RE_NON_LOCAL, RE_SECRET, PROXY_MORT,
  nonTerminees: () => EN_COURS.size,
  patches: () => Object.assign({}, patches),
  compteurs: () => JSON.parse(JSON.stringify(compte)),
  journal: () => journal.slice(),
  // le résumé lisible des requêtes du navigateur qui n'ont PAS été simulées, par destination et action
  nonSimulees: () => {
    const m = {};
    for (const e of journal) if (e.type === 'nav' && e.sort !== 'simulée') { const k = e.sort + ' · ' + e.hote + (e.action ? ' · ' + e.action : ''); m[k] = (m[k] || 0) + 1; }
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  },
};
globalThis[MARQUE] = api;
module.exports = api;

if (require.main === module) {        // node tests/_garde_reseau.js — contrôle express du garde lui-même
  canariDebut.then((r) => { console.log('garde réseau : canari Node', JSON.stringify(r), 'secrets retirés :', secretsRetires.length); process.exitCode = canariOk(r) ? 0 : 1; });
}
