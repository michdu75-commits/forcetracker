'use strict';
/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
   NUT-SYNC-03 — HARNAIS « ENVOIS DE SYNCHRONISATION » (tests locaux seulement ; AUCUN réseau, AUCUNE donnée réelle).
   Repris du harnais de l'agent de simulation C1 (05/11/2026), avec trois changements :
     · l'arbre CLIENT est un paramètre (`FT_ARBRE_CLIENT`, défaut = ce dépôt) — le même banc rejoue le candidat a87cc89d (« avant »), le correctif (« après »),
       une copie mutée (contrôle négatif) ou ft-v1263 (ancien client) ;
     · des PORTES contrôlées par le test (`gateApply`, `gateResp`) remplacent les attentes en temps réel : « réponse retardée de 120 s » se joue en quelques secondes,
       avec le temps VIRTUEL du navigateur (`page.clock`) ;
     · l'instrumentation compte le nombre d'envois SIMULTANÉS dans la page (`__volMax`).
   CONDUIT  : le VRAI client dans Chromium, face à un faux Apps Script HTTP qui exécute le VRAI Code.js (@194 = a87cc89d), avec 302 + écho CORS (trois origines).
   NE REPRODUIT PAS : le vrai 302 de Google, Safari/WebKit et son délai de 60 s, ITP, Private Relay, la vraie latence/file d'Apps Script (ici un seul processus Node, verrou factice).
   ⇒ TOUT ce qui sort d'ici est SIMULÉ : jamais une preuve sur réseau mobile réel (condition C1, à jouer avec Michel sur le projet de TEST).
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const path = require('path'), fs = require('fs'), http = require('http'), crypto = require('crypto');
const RACINE = path.resolve(__dirname, '..');
require(path.join(RACINE, 'tests/_garde_reseau.js'));            // garde réseau AVANT Playwright (D031S-VII)
const { chargerPlaywright } = require(path.join(RACINE, 'tests/_playwright.js'));
const { chromium } = chargerPlaywright().pw;
const ARBRE = path.resolve(process.env.FT_ARBRE_CLIENT || RACINE);   // l'arbre CLIENT joué (défaut : ce dépôt)
const CHROME = process.env.FT_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const EMAIL = 'alice@example.test', CODE = '4242';
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const J = JSON.stringify;

/* ── comptes de contrôles ─────────────────────────────────────────────────────────────────────────────── */
const R = { ok: 0, rouge: 0, lignes: [] };
function verif(nom, cond, detail) {
  const ok = !!cond; ok ? R.ok++ : R.rouge++;
  const l = (ok ? 'OK    ' : 'ROUGE ') + nom + (detail !== undefined ? '   [' + (typeof detail === 'string' ? detail : J(detail)) + ']' : '');
  R.lignes.push(l); console.log(l);
}
function bilan(titre) { console.log('\n== ' + titre + ' : ' + R.ok + ' OK · ' + R.rouge + ' ROUGE (' + (R.ok + R.rouge) + ' contrôles) =='); return R; }

/* ── le serveur statique du client ───────────────────────────────────────────────────────────────────────── */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.ico': 'image/x-icon', '.gif': 'image/gif', '.wasm': 'application/wasm' };
/* `appsUrl` : l'adresse du faux Apps Script, substituée à DEFAULT_URL dans constants.js (UNE ligne, remplacement compté — jamais silencieux).
   `reecrire` : [[exact, remplacement, fichier]] — pour les scénarios qui accélèrent le temps ; chaque remplacement doit tomber EXACTEMENT 1 fois. */
function servirClient(root, appsUrl, reecrire) {
  const cache = Object.create(null);
  return new Promise((res) => {
    const s = http.createServer((q, r) => {
      let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
      const f = path.join(root, p);
      if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
      let corps = fs.readFileSync(f);
      const nom = p.slice(1);
      if (nom === 'constants.js') {
        let t = corps.toString('utf8');
        const re = /const DEFAULT_URL='[^']+';/g, n = (t.match(re) || []).length;
        if (n !== 1) { r.writeHead(500); return r.end('DEFAULT_URL : ' + n + ' occurrences'); }
        t = t.replace(re, "const DEFAULT_URL='" + appsUrl + "';"); corps = Buffer.from(t, 'utf8');
      }
      (reecrire || []).forEach(([a, b, fic]) => {
        if (fic !== nom) return;
        let t = corps.toString('utf8'); const n = t.split(a).length - 1;
        if (n !== 1) { r.writeHead(500); return r.end('réécriture : ' + n + ' occurrences de ' + a.slice(0, 50)); }
        corps = Buffer.from(t.replace(a, () => b), 'utf8');
      });
      r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      r.end(corps);
    });
    s.listen(0, '127.0.0.1', () => res({ s, port: s.address().port }));
  });
}

/* ── le FAUX Apps Script ───────────────────────────────────────────────────────────────────────────────────
   faute(info) → objet (défaut {}), consulté À L'ARRIVÉE du premier morceau du corps (l'action y est lisible).
     info  = { n (n° d'ordre toutes requêtes), nSave (n° d'ordre des saveProfile), method, action, contentLength }
     champs :
       cutUploadAt : n octets reçus après lesquels la connexion est détruite ; le serveur N'APPLIQUE PAS (corps incomplet)
       lectureBps  : débit de LECTURE du corps (octets/s) — simule un faible débit montant (le serveur ralentit la lecture)
       delayApply  : ms entre « corps complet reçu » et l'application par Code.js
       apply       : false = on ne l'exécute pas (le serveur « n'a rien fait »)
       delayResp   : ms entre l'application et l'envoi du 302 (serveur lent)
       gateApply   : Promise — le serveur a reçu le corps COMPLET mais n'applique qu'à sa résolution (téléversement lent, vu du client : requête en vol, rien d'appliqué)
       gateResp    : Promise — le serveur a APPLIQUÉ mais n'envoie le 302 qu'à sa résolution (réponse lente : le pire cas pour les courses)
       first       : 'ok' (302 normal) | 'reset' (connexion détruite à la place du 302) | 'html' | 'html-sans-cors' | '500'
                     | 'redir-echoue' (302 vers un port fermé) | '302-sans-cors'
       echo        : { mode:'ok'|'reset'|'hang'|'html'|'sans-cors'|'500'|'json-casse'|'vide', delay:ms }   (sort du GET de redirection)
   Journal : un enregistrement par requête, complété au fil de l'eau (tout en temps RÉEL Node). */
function fauxAppsScript(srv, opt) {
  opt = opt || {};
  const o = { faute: opt.faute || (() => ({})) };
  const echos = Object.create(null);           // id → { json, plan }
  const journal = [], echoLog = [];
  let n = 0, nSave = 0;
  const t0 = Date.now();
  const CORS = { 'access-control-allow-origin': '*' };
  const portEcho = { v: 0 }, portMort = { v: 0 };
  const sockets = new Set();

  function repondreGet(req, res, rec, plan) {
    const url = new URL(req.url, 'http://x');
    const rep = srv.get(Object.fromEntries(url.searchParams));
    return terminer(req, res, rec, plan, rep.t);
  }
  function terminer(req, res, rec, plan, texteReponse) {
    const id = crypto.randomUUID();
    echos[id] = { json: texteReponse, plan: plan.echo || { mode: 'ok' }, rec };
    rec.echoId = id;
    const first = plan.first || 'ok';
    const sortir = () => {
      rec.t302 = Date.now() - t0;
      if (first === 'reset') { rec.premiereReponse = 'reset'; return res.socket.destroy(); }
      if (first === '500') { rec.premiereReponse = '500'; res.writeHead(500, CORS); return res.end('Internal Server Error'); }
      if (first === 'html') { rec.premiereReponse = 'html'; res.writeHead(200, Object.assign({ 'content-type': 'text/html; charset=utf-8' }, CORS)); return res.end('<!doctype html><html><head><title>Google</title></head><body>Erreur Google (page HTML)</body></html>'); }
      if (first === 'html-sans-cors') { rec.premiereReponse = 'html-sans-cors'; res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end('<!doctype html><html><body>Page Google sans CORS</body></html>'); }
      const loc = (first === 'redir-echoue') ? 'http://127.0.0.1:' + portMort.v + '/echo/' + id : 'http://127.0.0.1:' + portEcho.v + '/echo/' + id;
      rec.premiereReponse = first === 'redir-echoue' ? '302-vers-port-ferme' : '302';
      res.writeHead(302, Object.assign({ Location: loc, 'content-type': 'text/html' }, first === '302-sans-cors' ? {} : CORS));
      res.end('<HTML><BODY>Moved</BODY></HTML>');
    };
    if (plan.gateResp) plan.gateResp.then(sortir); else if (plan.delayResp) setTimeout(sortir, plan.delayResp); else sortir();
  }

  const serveurApps = http.createServer((req, res) => {
    const rec = { n: ++n, t: Date.now() - t0, method: req.method, octetsRecus: 0, appliquee: false, clientFerme: false, echoLu: false };
    journal.push(rec);
    res.on('close', () => { if (!res.writableEnded) rec.clientFerme = true; });
    if (req.method === 'OPTIONS') { res.writeHead(204, Object.assign({ 'access-control-allow-methods': 'GET, POST', 'access-control-allow-headers': '*' }, CORS)); return res.end(); }
    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://x'); rec.action = url.searchParams.get('action') || '(get)';
      const plan = {};   // les GET (loadProfile…) ne sont pas fautés : le scénario ne vise que les saveProfile
      return repondreGet(req, res, rec, plan);
    }
    const morceaux = []; let vu = 0, plan = null, coupe = false, premier = true;
    rec.contentLength = Number(req.headers['content-length'] || 0);
    req.on('data', (c) => {
      if (coupe) return;
      morceaux.push(c); vu += c.length; rec.octetsRecus = vu;
      if (premier) {
        premier = false;
        const m = /^\{"action":"([A-Za-z]+)"/.exec(c.toString('utf8', 0, 80)); rec.action = m ? m[1] : '(inconnue)';
        if (rec.action === 'saveProfile') rec.nSave = ++nSave;
        plan = Object.assign({}, o.faute({ n: rec.n, nSave: rec.nSave, method: req.method, action: rec.action, contentLength: rec.contentLength }) || {});
        rec.plan = plan;
      }
      if (plan.cutUploadAt && vu >= plan.cutUploadAt) { coupe = true; rec.coupeEn = vu; req.socket.destroy(); return; }
      if (plan.lectureBps) { req.pause(); setTimeout(() => req.resume(), Math.max(1, Math.round(c.length / plan.lectureBps * 1000))); }
    });
    req.on('error', () => { rec.erreurLecture = true; });
    req.on('aborted', () => { rec.clientAbandonne = true; });
    req.on('end', () => {
      if (coupe) return;
      rec.tCorpsComplet = Date.now() - t0;
      const corps = Buffer.concat(morceaux).toString('utf8');
      if (opt.garder) rec.corpsBrut = corps;
      try { const j = JSON.parse(corps); rec.requestId = j.requestId; rec.foodLogV = j.foodLogV; rec.nFoodLog = Array.isArray(j.foodLog) ? j.foodLog.length : undefined; rec.nSup = Array.isArray(j.foodSupprimes) ? j.foodSupprimes.length : undefined; rec.nSessions = Array.isArray(j.sessions) ? j.sessions.length : undefined; } catch (e) { rec.corpsIllisible = true; }
      const appliquer = () => {
        let texte;
        if (plan.apply === false) texte = J({ status: 'ok', note: 'non appliqué (scénario)' });
        else { const tA = Date.now(); texte = srv.post(corps).t; rec.appliquee = true; rec.tApplique = Date.now() - t0; rec.msExecution = Date.now() - tA; rec.octetsReponse = Buffer.byteLength(String(texte)); try { rec.reponse = JSON.parse(texte); } catch (e) { rec.reponse = { brut: String(texte).slice(0, 120) }; } }
        terminer(req, res, rec, plan, texte);
      };
      if (plan.gateApply) plan.gateApply.then(appliquer); else if (plan.delayApply) setTimeout(appliquer, plan.delayApply); else appliquer();
    });
  });
  serveurApps.requestTimeout = 0; serveurApps.headersTimeout = 0; serveurApps.keepAliveTimeout = 5000;
  serveurApps.on('connection', (s) => { sockets.add(s); s.on('close', () => sockets.delete(s)); });

  const serveurEcho = http.createServer((req, res) => {
    const id = decodeURIComponent((req.url.split('/echo/')[1] || '').split('?')[0]);
    const e = echos[id]; const l = { t: Date.now() - t0, id, mode: e ? e.plan.mode : 'inconnu', issue: 'en-cours' };
    echoLog.push(l);
    if (e && e.rec) e.rec.echoLu = true;
    res.on('close', () => { if (!res.writableEnded) { l.issue = 'ferme-avant-fin'; if (e && e.rec) e.rec.echoFermeParClient = true; } });
    if (!e) { res.writeHead(404, CORS); return res.end('inconnu'); }
    const p = e.plan, repondre = () => {
      const m = p.mode || 'ok';
      if (m === 'reset') { l.issue = 'reset'; return res.socket.destroy(); }
      if (m === 'hang') { l.issue = 'suspendu'; return; }
      if (m === '500') { l.issue = '500'; res.writeHead(500, CORS); return res.end('erreur'); }
      if (m === 'html') { l.issue = 'html'; res.writeHead(200, Object.assign({ 'content-type': 'text/html; charset=utf-8' }, CORS)); return res.end('<!doctype html><html><body>Page HTML de Google</body></html>'); }
      if (m === 'sans-cors') { l.issue = 'sans-cors'; res.writeHead(200, { 'content-type': 'application/json' }); return res.end(e.json); }
      if (m === 'json-casse') { l.issue = 'json-casse'; res.writeHead(200, Object.assign({ 'content-type': 'application/json' }, CORS)); return res.end(String(e.json).slice(0, Math.floor(String(e.json).length / 2))); }
      if (m === 'vide') { l.issue = 'vide'; res.writeHead(200, Object.assign({ 'content-type': 'application/json' }, CORS)); return res.end(''); }
      l.issue = 'servi'; res.writeHead(200, Object.assign({ 'content-type': 'application/json; charset=utf-8' }, CORS)); res.end(e.json);
    };
    if (p.delay) setTimeout(repondre, p.delay); else repondre();
  });
  serveurEcho.on('connection', (s) => { sockets.add(s); s.on('close', () => sockets.delete(s)); });

  // un port « mort » (rien n'écoute) pour le 302 qui échoue
  const mort = http.createServer();
  return new Promise((res) => {
    serveurApps.listen(0, '127.0.0.1', () => serveurEcho.listen(0, '127.0.0.1', () => mort.listen(0, '127.0.0.1', () => {
      portEcho.v = serveurEcho.address().port; portMort.v = mort.address().port; mort.close();
      res({
        port: serveurApps.address().port, portEcho: portEcho.v, url: 'http://127.0.0.1:' + serveurApps.address().port + '/exec',
        journal, echoLog, srv, set faute(f) { o.faute = f || (() => ({})); },
        saves() { return journal.filter((r) => r.action === 'saveProfile'); },
        octetsSave() { return journal.filter((r) => r.action === 'saveProfile').reduce((s, r) => s + (r.octetsRecus || 0), 0); },
        t0,
        fermer() { sockets.forEach((s) => { try { s.destroy(); } catch (e) {} }); serveurApps.close(); serveurEcho.close(); },
      });
    })));
  });
}

/* ── un appareil (Chromium) chargeant le VRAI client ───────────────────────────────────────────────────────────
   Instrumentation posée APRÈS le chargement (jamais avant : le client doit démarrer comme en vrai) :
     window.__toasts      tous les toasts (instant, texte, type)
     window.__fetchLog    chaque fetch vers l'URL du faux Apps Script (octets du corps, mode, issue)
     window.__issues      chaque appel de _nutTraiterReponse / _nutNonConfirme (issue rendue)
   opt.clock : true → `page.clock` installé AVANT le chargement (temps virtuel pour setTimeout/Date) */
async function lancer() { return chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] }); }
async function appareil(b, port, appsUrl, opt) {
  opt = opt || {};
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const pg = await cx.newPage();
  const D = { cx, pg, erreurs: [], miroir: [], consoles: [] };
  pg.on('pageerror', (e) => D.erreurs.push(String(e && e.message || e).slice(0, 200)));
  pg.on('console', (m) => { if (/FT/.test(m.text())) D.consoles.push(m.text().slice(0, 200)); });
  pg.on('dialog', (d) => d.accept());
  const st = Object.assign({ ft4_ob2: '1', ft4_guide_shown: '1', ft4_wn_seen: '99', ft4_email: opt.email || EMAIL, ft4_ok: '1', ft4_authcode: CODE }, opt.stockage || {});
  await pg.addInitScript({ content: "(() => { if (sessionStorage.getItem('__seed')) return; sessionStorage.setItem('__seed', '1'); localStorage.clear(); const st = " + J(st) + "; Object.keys(st).forEach(k => localStorage.setItem(k, st[k])); })();" });
  await pg.route(/workers\.dev/, async (route) => {   // le miroir Supabase (via le Worker) : on enregistre ce qui PART, rien ne sort
    let c = null; try { c = JSON.parse(route.request().postData() || 'null'); } catch (e) {}
    D.miroir.push({ t: Date.now(), corps: c });
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: J({ status: 'ok', voie: 'directe' }) });
  });
  await pg.route(/supabase\.co/, (r) => r.abort());
  if (opt.clock) await pg.clock.install({ time: new Date('2026-11-05T12:00:00Z') });
  D.ev = (f, a) => pg.evaluate(f, a);
  D.instrumenter = async () => {
    await pg.evaluate((APPS) => {
      window.__toasts = []; window.__fetchLog = []; window.__issues = []; window.__ouverts = new Set(); window.__volMax = 0;   // __ouverts : requestId des envois dont ni l'accusé ni l'échec n'a encore été traité
      const ot = window.toast; window.toast = function (m, t) { window.__toasts.push({ t: Date.now(), m: String(m).slice(0, 90), type: t }); return ot.apply(this, arguments); };
      const of = window.fetch;
      window.fetch = function (url, init) {
        if (String(url).indexOf(APPS) !== 0) return of.apply(this, arguments);
        let action = ''; try { const m = /^\{"action":"([A-Za-z]+)"/.exec(String(init && init.body || '').slice(0, 80)); action = m ? m[1] : ''; } catch (e) {}
        const rec = { i: window.__fetchLog.length, t0: Date.now(), action, octets: init && init.body ? String(init.body).length : 0, mode: (init && init.mode) || 'cors', etat: 'en-cours' };
        window.__fetchLog.push(rec);
        if (action === 'saveProfile') { const m = /"requestId":"([^"]+)"/.exec(String(init.body)); rec.rid = m ? m[1] : null; if (rec.rid) { window.__ouverts.add(rec.rid); window.__volMax = Math.max(window.__volMax || 0, window.__ouverts.size); } }
        const p = of.apply(this, arguments);
        p.then((r) => { rec.etat = 'resolu'; rec.status = r.status; rec.type = r.type; rec.t1 = Date.now(); }, (e) => { rec.etat = 'rejete'; rec.err = String(e && e.message || e); rec.t1 = Date.now(); });
        return p;
      };
      const o1 = window._nutTraiterReponse, o2 = window._nutNonConfirme;
      if (typeof o2 === 'function') window._nutNonConfirme = function (envoi, code) { const r = o2.apply(this, arguments); try { window.__ouverts.delete(envoi && envoi.requestId); } catch (e) {} window.__issues.push({ t: Date.now(), via: 'nonConfirme', code, issue: r, rid: envoi && envoi.requestId }); return r; };
      if (typeof o1 === 'function') window._nutTraiterReponse = function (d, envoi) { const r = o1.apply(this, arguments); try { window.__ouverts.delete(envoi && envoi.requestId); } catch (e) {} window.__issues.push({ t: Date.now(), via: 'traiter', ok: d && d.ok, code: d && d.code, issue: r, rid: envoi && envoi.requestId }); return r; };
    }, appsUrl);
    await D.outils();
  };
  D.charger = async (ms) => {
    await pg.goto('http://127.0.0.1:' + port + '/index.html'); await pause(ms == null ? 1500 : ms);
    await D.instrumenter();
  };
  /* Les gestes de la personne, par les VRAIS écrivains du client (`_n2Enregistrer` = celui d'« + Ajouter » et de « Modifier »,
     `_journalPersister` = ce qu'ils appellent ensuite ; `removeFoodEntry` = la croix). Rien n'est écrit « à la main » dans S.foodLog. */
  D.outils = () => pg.evaluate(() => {
    const decl = (q) => ({ kcal: Math.round(q * 1.3), prot: Math.round(q * 0.1), carbs: Math.round(q * 0.2), fat: Math.round(q * 0.05) });
    window.__ajouter = (nom, q, repas) => { const r = _n2Enregistrer({ id: _foodLineId(), ts: Date.now(), date: '2026-11-05', repas: repas || 'dejeuner', nom, origine: { saisie: 'manuel', origine: 'utilisateur' }, mode: 'declaree', declare: decl(q), quantite: { val: q, unite: 'g' } }, 'addFoodEntry'); if (r.ok) (typeof _journalPersister === 'function' ? (typeof _journalPersister === 'function' ? _journalPersister() : persist()) : persist()); return !!r.ok; };
    window.__modifier = (nom, q) => { const e = S.foodLog.find((l) => l && l.name === nom); if (!e) return 'introuvable'; const r = _n2Enregistrer({ id: e.id, ts: e.ts, date: e.date, repas: e.meal, nom: e.name, origine: { saisie: e.saisie, origine: e.origine }, mode: 'declaree', declare: decl(q), quantite: { val: q, unite: 'g' }, remplace: e }, 'saveEditFood'); if (r.ok) (typeof _journalPersister === 'function' ? (typeof _journalPersister === 'function' ? _journalPersister() : persist()) : persist()); return r.ok ? 'ok' : r.erreur; };
    window.__supprimer = (nom) => { const e = S.foodLog.find((l) => l && l.name === nom); if (!e) return 'introuvable'; removeFoodEntry(e.id); return 'ok'; };
    window.__etatLog = () => S.foodLog.map((l) => ({ nom: l.name, q: l.q, meal: l.meal, rev: l.rev === undefined ? null : l.rev, id: String(l.id).slice(-6) }));
  });
  D.log = () => D.ev(() => window.__etatLog());
  D.recharger = async (ms) => { D.vm0 = Math.max(D.vm0 || 0, await D.volMax()); D.toasts0 = (D.toasts0 || []).concat(await D.ev(() => window.__toasts || [])); await pg.reload(); await pause(ms == null ? 1800 : ms); await D.instrumenter(); };   // la page rechargée perd ses compteurs : on garde ceux d'avant
  D.disque = () => D.ev(() => { try { return JSON.parse(localStorage.getItem('ft4_foodlog') || '[]'); } catch (e) { return null; } });
  D.cle = (k) => D.ev((k) => localStorage.getItem(k), k);
  D.toasts = async () => (D.toasts0 || []).concat(await D.ev(() => window.__toasts || []));
  D.fetchLog = () => D.ev(() => window.__fetchLog || []);
  D.issues = () => D.ev(() => window.__issues || []);
  D.etatNut = () => D.ev(() => ({ aConfirmer: (typeof _nutAConfirmer === 'undefined') ? null : _nutAConfirmer, relanceN: (typeof _nutRelance === 'undefined') ? null : _nutRelance.n, relanceTimer: (typeof _nutRelance === 'undefined') ? null : !!_nutRelance.timer, nAttente: (typeof _foodSupprimesEnAttente === 'function') ? _foodSupprimesEnAttente().length : null, nSup: (S.foodSupprimes || []).length, nSupConf: (S.foodSupprimes || []).filter((e) => e.c).length, nLog: (S.foodLog || []).length }));
  D.volMax = async () => Math.max(D.vm0 || 0, await D.ev(() => window.__volMax || 0));
  D.fermer = () => cx.close();
  return D;
}

/* ── le serveur « Apps Script » dont l'application est mesurée : le VRAI Code.js ───────────────────────────────── */
function serveurDe(o) {
  const P1 = require(path.join(RACINE, 'tests/parcours/nut_secu_p1.js'));   // le VRAI Code.js de ce dépôt (identique à @194 : blob 897a0fb8), services Google simulés
  return P1.serveur(Object.assign({}, o || {}));
}

/* ── fixtures ─────────────────────────────────────────────────────────────────────────────────────────────────── */
const SEANCE = (i) => ({ id: 's' + i, ts: 1759000000000 + i * 86400000, date: new Date(1759000000000 + i * 86400000).toISOString().slice(0, 10),
  exs: ['Squat', 'Développé couché', 'Rowing barre', 'Soulevé de terre roumain', 'Développé militaire', 'Curl biceps'].map((nom, k) => ({ name: nom,
    sets: [0, 1, 2, 3].map((s) => ({ kg: 60 + k * 5 + s * 2.5, reps: 8 - (s % 3), done: true, type: 'N', rm1: 80 + k * 4 })) })), vol: 5400 + i, duration: 3300 });
const stockageBase = (journal, nSeances, extra) => Object.assign({
  ft4_foodlog: J(journal || []), ft4_sessions: J(Array.from({ length: nSeances == null ? 1 : nSeances }, (_, i) => SEANCE(i))),
  ft4_prs: J({ Squat: { rm1: 117, kg: 100, reps: 5, date: '2026-10-01' } }), ft4_name: 'Alice test', ft4_bw: '80', ft4_age: '30', ft4_ht: '180' }, extra || {});

/* Une ligne de journal RÉALISTE : même forme que celle que l'écrivain du client (NUT2.ligneNouvelle) fabrique pour un produit pesé
   (per100 + n2.f + sourceId + étiquette) ; les noms sont inventés. `i` fait varier nom, quantité, jour, repas. */
const REPAS = ['petit-dejeuner', 'dejeuner', 'collation', 'diner'];
function ligneReelle(i, o) {
  const q = 50 + (i * 37) % 250;
  const p100 = { kcal: 100 + (i * 13) % 300, prot: 3 + (i * 7) % 25, carbs: 5 + (i * 11) % 60, fat: 1 + (i * 3) % 20 };
  const f = (k) => Math.round(q * p100[k] / 100);
  return Object.assign({ date: new Date(1759000000000 + Math.floor(i / 4) * 86400000).toISOString().slice(0, 10), meal: REPAS[i % 4], name: 'Aliment fictif numéro ' + i + ' (cuit)',
    ts: 1759000000000 + i * 3600000, id: 'm1-' + crypto.createHash('md5').update('ligne' + i).digest('hex'), v: 1, saisie: 'liste', origine: 'ciqual', q, u: 'g',
    per100: { kcal: p100.kcal, prot: p100.prot, carbs: p100.carbs, fat: p100.fat }, sourceId: 'ciqual:' + (10000 + i), etat: 'cuit',
    kcal: f('kcal'), prot: f('prot'), carbs: f('carbs'), fat: f('fat'),
    n2: { s: 1, m: 'p', st: 'verifiee', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'ciqual', ver: '2020', fiab: 'A', base: 'g', lib: 'Aliment fictif numéro ' + i } } }, o || {});
}
const journalReel = (n) => Array.from({ length: n }, (_, i) => ligneReelle(i));

module.exports = { RACINE, ARBRE, EMAIL, CODE, pause, J, verif, bilan, R, servirClient, fauxAppsScript, lancer, appareil, serveurDe, stockageBase, ligneReelle, journalReel, SEANCE, chromium };
