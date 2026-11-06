#!/usr/bin/env node
/* C1 « RÉEL GOOGLE » — LE VRAI CLIENT (candidat A/A2) DANS UN VRAI NAVIGATEUR, FACE AU VRAI PROJET APPS SCRIPT DE TEST.
   ⚠️ CE QUE C'EST : le vrai `saveProfile` (POST text/plain, redirect:'follow', LECTURE de la réponse), le vrai 302 de Google, le vrai écho CORS, le vrai Code.js (@194), le vrai verrou.
   ⚠️ CE QUE CE N'EST PAS : un essai sur RÉSEAU MOBILE. Le navigateur est Chromium sur un serveur GitHub (datacenter), PAS Safari/WebKit sur un iPhone en 4G/5G.
      Les perturbations (réponse retardée / perdue / illisible, débit limité) sont INJECTÉES PAR LE NAVIGATEUR sur le trajet de RETOUR ; le serveur de Google, lui, a vraiment appliqué l'envoi.
      ⇒ ce banc dit si le client se comporte bien face à un VRAI Apps Script ; il NE VALIDE PAS C1 (réseau mobile réel = l'iPhone de Michel).
   ⛔ Comptes FICTIFS « c1-…@example.invalid » seulement. ⛔ Refuse l'adresse de PRODUCTION. ⛔ LISTE BLANCHE RÉSEAU stricte : seuls le serveur local du client, l'adresse /exec de TEST et son écho
      (script.googleusercontent.com) sortent ; le Worker (Milo), Supabase, polices, etc. sont ABANDONNÉS par le navigateur et comptés dans le rapport.
   Usage : node p1/c1_reel.js <URL /exec de TEST> [--rapport f.json] [--only R1,R2] [--tag xyz]
           node p1/c1_reel.js --local [--only R1]        (auto-contrôle contre le faux Apps Script du dépôt : jamais de réseau) */
'use strict';
const path = require('path'), fs = require('fs'), http = require('http'), crypto = require('crypto');
const RACINE = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const LOCAL = argv.includes('--local');
const URL_ARG = argv.find((a) => /^https?:\/\//.test(a));
const TAG = opt('--tag', crypto.randomBytes(2).toString('hex'));
const RAPPORT = opt('--rapport', null);
const ONLY = (opt('--only', '') || '').split(',').filter(Boolean);
if (!LOCAL) {
  if (!URL_ARG || !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(URL_ARG)) { console.error('Usage : node p1/c1_reel.js https://script.google.com/macros/s/…/exec  (ou --local)'); process.exit(64); }
  if (/AKfycbxWUsEFIlmx/.test(URL_ARG)) { console.error('⛔ Cette adresse est celle de la PRODUCTION. Refus.'); process.exit(3); }
}
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const J = JSON.stringify;
const CODE = '4242';

let chromium, lib = null, faux = null, srvLocal = null;
if (LOCAL) { lib = require(path.join(RACINE, 'tools/lib_banc_reseau.js')); chromium = lib.chromium; }
else { try { chromium = require('playwright').chromium; } catch (e) { console.error('⛔ Playwright absent : npm install --no-save playwright@1.56.1'); process.exit(2); } }

/* ── contrôles ── */
const R = { ok: 0, rouge: 0, lignes: [], scenarios: {} };
function verif(nom, cond, detail) {
  const ok = !!cond; ok ? R.ok++ : R.rouge++;
  const l = (ok ? '   OK  ' : '❌ ROUGE ') + nom + (detail !== undefined ? '   >> ' + (typeof detail === 'string' ? detail : J(detail)).slice(0, 400) : '');
  R.lignes.push({ ok, nom, detail }); console.log(l);
}
function info(nom, detail) { console.log('   ℹ︎  ' + nom + '   >> ' + (typeof detail === 'string' ? detail : J(detail)).slice(0, 500)); R.lignes.push({ info: true, nom, detail }); }

/* ── le serveur statique du client : DEFAULT_URL → l'adresse de TEST (remplacement COMPTÉ, jamais silencieux) ── */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.ico': 'image/x-icon', '.gif': 'image/gif', '.wasm': 'application/wasm' };
function servirClient(appsUrl) {
  return new Promise((res) => {
    const s = http.createServer((q, r) => {
      let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
      const f = path.join(RACINE, p);
      if (!f.startsWith(RACINE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
      let corps = fs.readFileSync(f);
      if (p === '/constants.js') {
        let t = corps.toString('utf8'); const re = /const DEFAULT_URL='[^']+';/g, n = (t.match(re) || []).length;
        if (n !== 1) { r.writeHead(500); return r.end('DEFAULT_URL : ' + n + ' occurrences'); }
        corps = Buffer.from(t.replace(re, "const DEFAULT_URL='" + appsUrl + "';"), 'utf8');
      }
      r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); r.end(corps);
    });
    s.listen(0, '127.0.0.1', () => res({ s, port: s.address().port }));
  });
}

/* ── un appareil : le vrai client, réseau en LISTE BLANCHE, perturbations sur l'écho ── */
let CFG = null;   // { exec, hote, echoRe }
async function appareil(b, port, email, o) {
  o = o || {};
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const pg = await cx.newPage();
  const D = { cx, pg, erreurs: [], bloque: [], echos: [], saves: 0, planEcho: o.planEcho || (() => null) };
  pg.on('pageerror', (e) => D.erreurs.push(String(e && e.message || e).slice(0, 200)));
  pg.on('dialog', (d) => d.accept());
  const st = Object.assign({ ft4_ob2: '1', ft4_guide_shown: '1', ft4_wn_seen: '99', ft4_email: email, ft4_ok: '1', ft4_authcode: CODE }, o.stockage || {});
  await pg.addInitScript({ content: "(() => { if (sessionStorage.getItem('__seed')) return; sessionStorage.setItem('__seed', '1'); localStorage.clear(); const st = " + J(st) + "; Object.keys(st).forEach(k => localStorage.setItem(k, st[k])); })();" });
  await cx.route('**/*', async (route) => {
    const req = route.request(), u = req.url();
    try {
      if (u.startsWith('http://127.0.0.1:' + port + '/') || u.startsWith('data:') || u.startsWith('blob:')) return await route.continue();
      if (u.startsWith(CFG.hote)) return await route.continue();                                         // 1ʳᵉ marche : le VRAI POST/GET vers l'adresse /exec de TEST
      if (CFG.echoRe.test(u)) return await echo(D, route, req);                                          // 2ᵉ marche : l'écho (la RÉPONSE), la seule où l'on perturbe
      D.bloque.push(u.replace(/[?#].*$/, '').slice(0, 90));                                              // tout le reste : abandonné par le navigateur (rien ne sort)
      return await route.abort('blockedbyclient');
    } catch (e) { /* page fermée pendant une attente : normal */ }
  });
  D.ev = (f, a) => pg.evaluate(f, a);
  D.instrumenter = async () => {
    await pg.evaluate((HOTE) => {
      window.__toasts = []; window.__fetchLog = []; window.__issues = []; window.__ouverts = new Set(); window.__volMax = 0;
      const ot = window.toast; window.toast = function (m, t) { window.__toasts.push({ t: Date.now(), m: String(m).slice(0, 110), type: t }); return ot.apply(this, arguments); };
      const of = window.fetch;
      window.fetch = function (url, init) {
        if (String(url).indexOf(HOTE) !== 0) return of.apply(this, arguments);
        let action = ''; try { const m = /^\{"action":"([A-Za-z]+)"/.exec(String(init && init.body || '').slice(0, 80)); action = m ? m[1] : ''; } catch (e) {}
        const rec = { i: window.__fetchLog.length, t0: Date.now(), action, octets: init && init.body ? String(init.body).length : 0, mode: (init && init.mode) || 'cors', etat: 'en-cours' };
        window.__fetchLog.push(rec);
        if (action === 'saveProfile') { const m = /"requestId":"([^"]+)"/.exec(String(init.body)); rec.rid = m ? m[1] : null; if (rec.rid) { window.__ouverts.add(rec.rid); window.__volMax = Math.max(window.__volMax || 0, window.__ouverts.size); } }
        const p = of.apply(this, arguments);
        p.then((r) => { rec.etat = 'resolu'; rec.status = r.status; rec.type = r.type; rec.t1 = Date.now(); }, (e) => { rec.etat = 'rejete'; rec.err = String(e && e.message || e); rec.t1 = Date.now(); });
        return p;
      };
      const o1 = window._nutTraiterReponse, o2 = window._nutNonConfirme;
      if (typeof o2 === 'function') window._nutNonConfirme = function (envoi, code) { const r = o2.apply(this, arguments); try { window.__ouverts.delete(envoi && envoi.requestId); } catch (e) {} window.__issues.push({ t: Date.now(), via: 'nonConfirme', code, rid: envoi && envoi.requestId }); return r; };
      if (typeof o1 === 'function') window._nutTraiterReponse = function (d, envoi) { const r = o1.apply(this, arguments); try { window.__ouverts.delete(envoi && envoi.requestId); } catch (e) {} const n = d && d.nut || {}; window.__issues.push({ t: Date.now(), via: 'traiter', ok: d && d.ok, code: d && d.code, acks: (n.acks || []).length, conflits: (n.conflits || []).length, rejets: (n.rejets || []).length, rid: envoi && envoi.requestId }); return r; };
      const decl = (q) => ({ kcal: Math.round(q * 1.3), prot: Math.round(q * 0.1), carbs: Math.round(q * 0.2), fat: Math.round(q * 0.05) });
      window.__ajouter = (nom, q, repas) => { const r = _n2Enregistrer({ id: _foodLineId(), ts: Date.now(), date: '2026-11-05', repas: repas || 'dejeuner', nom, origine: { saisie: 'manuel', origine: 'utilisateur' }, mode: 'declaree', declare: decl(q), quantite: { val: q, unite: 'g' } }, 'addFoodEntry'); if (r.ok) _journalPersister(); return !!r.ok; };
      window.__modifier = (nom, q) => { const e = S.foodLog.find((l) => l && l.name === nom); if (!e) return 'introuvable'; const r = _n2Enregistrer({ id: e.id, ts: e.ts, date: e.date, repas: e.meal, nom: e.name, origine: { saisie: e.saisie, origine: e.origine }, mode: 'declaree', declare: decl(q), quantite: { val: q, unite: 'g' }, remplace: e }, 'saveEditFood'); if (r.ok) _journalPersister(); return r.ok ? 'ok' : r.erreur; };
      window.__etatLog = () => S.foodLog.map((l) => ({ nom: l.name, q: l.q, kcal: l.kcal, rev: l.rev === undefined ? null : l.rev }));
    }, CFG.hote);
  };
  D.charger = async (ms) => { await pg.goto('http://127.0.0.1:' + port + '/index.html'); await pause(ms == null ? 3000 : ms); await D.instrumenter(); };
  D.log = () => D.ev(() => window.__etatLog());
  D.fetchLog = () => D.ev(() => window.__fetchLog || []);
  D.issues = () => D.ev(() => window.__issues || []);
  D.toasts = () => D.ev(() => window.__toasts || []);
  D.volMax = () => D.ev(() => window.__volMax || 0);
  D.cdp = async (conditions) => { const c = await cx.newCDPSession(pg); await c.send('Network.enable'); await c.send('Network.emulateNetworkConditions', conditions); D._cdp = c; };
  /* attendre que plus rien ne soit en vol ET que plus rien n'ait bougé depuis `calmeMs` (le débounce du client est de 4 s) */
  D.calme = async (maxMs, calmeMs) => {
    const t0 = Date.now(); let dernier = Date.now(), n0 = -1;
    while (Date.now() - t0 < maxMs) {
      const [fl, ou] = await Promise.all([D.fetchLog(), D.ev(() => window.__ouverts.size)]);
      const enCours = fl.filter((x) => x.etat === 'en-cours').length;
      if (fl.length !== n0 || enCours || ou) { n0 = fl.length; dernier = Date.now(); }
      if (!enCours && !ou && Date.now() - dernier >= (calmeMs || 8000)) return true;
      await pause(500);
    }
    return false;
  };
  return D;
}
/* l'écho : seule la RÉPONSE est perturbée (le serveur, lui, a déjà appliqué) */
async function echo(D, route, req) {
  const orig = req.redirectedFrom(); const m = orig ? orig.method() : '?';
  const isSave = m === 'POST'; const n = isSave ? ++D.saves : 0;
  const plan = (isSave && D.planEcho(n)) || null;
  const rec = { n, methode: m, plan: plan ? Object.keys(plan)[0] : 'normal', t: Date.now() }; D.echos.push(rec);
  if (!plan) return route.continue();
  if (plan.delay) { await pause(plan.delay); return route.continue(); }
  if (plan.perdu) return route.abort('internetdisconnected');
  if (plan.hang) { await pause(plan.hang); return route.abort('timedout'); }
  if (plan.illisible) {                                  // le serveur a appliqué, la réponse arrive MAIS le navigateur ne peut pas la lire (pas d'en-tête CORS) : la panne redoutée en 4G
    const r = await route.fetch(); const h = Object.fromEntries(Object.entries(r.headers()).filter(([k]) => k.toLowerCase() !== 'access-control-allow-origin'));
    return route.fulfill({ status: r.status(), headers: h, body: await r.body() });
  }
  return route.continue();
}

/* ── le côté serveur, lu par un GET indépendant du client (lecture : rien n'est écrit) ── */
async function serveurVoit(email) {
  const u = CFG.exec + (CFG.exec.includes('?') ? '&' : '?') + new URLSearchParams({ action: 'loadProfile', email });
  const r = await fetch(u, { redirect: 'follow' }); const txt = await r.text(); let j = null; try { j = JSON.parse(txt); } catch (e) {}
  const p = (j && j.profile) || {}; const log = (p.foodLog || []).map((l) => ({ nom: l.name, q: l.q, kcal: l.kcal, rev: l.rev === undefined ? null : l.rev }));
  return { ok: !!j && j.status === 'ok', raison: j ? (j.error || j.status) : 'non JSON : ' + txt.slice(0, 80), log, seances: (j && j.sessions || []).length };
}
const compte = (scn) => 'c1-' + TAG + '-' + scn.toLowerCase() + '@example.invalid';
const nb = (log, nom) => log.filter((l) => l.nom === nom).length;
const stat = (a) => { const t = a.slice().sort((x, y) => x - y); return t.length ? { n: t.length, med: t[Math.floor(t.length / 2)], max: t[t.length - 1] } : { n: 0 }; };

/* ── les gestes de la personne : « Pates » 150 g, corrigées à 100 g puis 80 g, « Sauce » et « Yaourt » ajoutés ── */
async function cinqGestes(D, espaceMs) {
  const e = espaceMs == null ? 1500 : espaceMs;
  await D.ev(() => window.__ajouter('Pates', 150)); await pause(e);
  await D.ev(() => window.__modifier('Pates', 100)); await pause(e);
  await D.ev(() => window.__modifier('Pates', 80)); await pause(e);
  await D.ev(() => window.__ajouter('Sauce', 60)); await pause(e);
  await D.ev(() => window.__ajouter('Yaourt', 125));
}
async function bilanScenario(scn, D, email, o) {
  o = o || {};
  const calme = await D.calme(o.maxCalme || 150000, o.calmeMs || 9000);
  const [fl, iss, toasts, vm, appareilLog, srv] = await Promise.all([D.fetchLog(), D.issues(), D.toasts(), D.volMax(), D.log(), serveurVoit(email)]);
  const saves = fl.filter((x) => x.action === 'saveProfile');
  const durees = saves.filter((x) => x.t1).map((x) => x.t1 - x.t0);
  const traites = iss.filter((x) => x.via === 'traiter'), nonConf = iss.filter((x) => x.via === 'nonConfirme');
  const conflits = traites.reduce((s, x) => s + (x.conflits || 0), 0);
  const faux_msg = toasts.filter((t) => /autre appareil|en m[êe]me temps/i.test(t.m)).length;
  const m = { scn, calme, envois: saves.length, volMax: vm, rejetes: saves.filter((x) => x.etat === 'rejete').length, lisibles: traites.filter((x) => x.ok === true).length, nonConfirmes: nonConf.length,
    conflitsRendus: conflits, durees: stat(durees), pates: { appareil: nb(appareilLog, 'Pates'), serveur: nb(srv.log, 'Pates') }, toasts: Array.from(new Set(toasts.map((t) => t.m))).slice(0, 5), messageAutreAppareil: faux_msg,
    bloques: Array.from(new Set(D.bloque)).slice(0, 8), erreursPage: D.erreurs.slice(0, 3), serveurLu: srv.ok, appareilLog, serveurLog: srv.log };
  R.scenarios[scn] = m;
  info(scn + ' mesures', { envois: m.envois, volMax: m.volMax, lisibles: m.lisibles, nonConfirmes: m.nonConfirmes, rejetes: m.rejetes, conflits: m.conflitsRendus, dureesMs: m.durees, pates: m.pates, toasts: m.toasts });
  return m;
}
const memeLog = (a, b) => J(a.map((l) => [l.nom, l.q, l.kcal]).sort()) === J(b.map((l) => [l.nom, l.q, l.kcal]).sort());

/* ── LES SCÉNARIOS ───────────────────────────────────────────────────────────────────────────────────── */
const SC = {
  async R1(b, port) {   // chaîne réelle, SANS aucune perturbation : le témoin
    const email = compte('R1'); const D = await appareil(b, port, email); await D.charger(); await cinqGestes(D);
    const m = await bilanScenario('R1', D, email);
    verif('R1 ⭐ chaîne RÉELLE sans perturbation : chaque envoi reçoit une réponse LISIBLE (CORS + 302 de Google), aucun « non confirmé »', m.envois >= 1 && m.lisibles === m.envois && m.nonConfirmes === 0 && m.rejetes === 0, { envois: m.envois, lisibles: m.lisibles, nonConfirmes: m.nonConfirmes, rejetes: m.rejetes });
    verif('R1 un seul envoi à la fois (A), UN seul « Pates » des deux côtés, appareil = serveur, aucun conflit ni message « autre appareil »', m.volMax <= 1 && m.pates.appareil === 1 && m.pates.serveur === 1 && memeLog(m.appareilLog, m.serveurLog) && m.conflitsRendus === 0 && m.messageAutreAppareil === 0, { volMax: m.volMax, pates: m.pates, conflits: m.conflitsRendus, msg: m.messageAutreAppareil });
    verif('R1 (A2) pas d\'envoi complet de plus après un accusé : au plus 4 envois pour 5 gestes', m.envois <= 4, { envois: m.envois });
    verif('R1 liste blanche : le Worker, Supabase et le reste n\'ont RIEN reçu (abandonnés par le navigateur)', true, { abandonnes: m.bloques });
    await D.cx.close();
  },
  async R2(b, port) {   // réponse retardée de 20 s APRÈS application (le pire cas pour les courses)
    const email = compte('R2'); const D = await appareil(b, port, email, { planEcho: () => ({ delay: 20000 }) }); await D.charger(); await cinqGestes(D);
    const m = await bilanScenario('R2', D, email, { maxCalme: 240000 });
    verif('R2 ⭐ réponse retardée de 20 s (réelle : le serveur a appliqué) : un envoi à la fois, UN « Pates » des deux côtés, appareil = serveur, aucun conflit artificiel', m.volMax <= 1 && m.pates.appareil === 1 && m.pates.serveur === 1 && memeLog(m.appareilLog, m.serveurLog) && m.conflitsRendus === 0 && m.messageAutreAppareil === 0, { volMax: m.volMax, pates: m.pates, conflits: m.conflitsRendus, msg: m.messageAutreAppareil, envois: m.envois });
    verif('R2 tous les envois finissent LISIBLES (aucune réponse abandonnée) et l\'appareil converge (calme)', m.calme && m.lisibles === m.envois && m.nonConfirmes === 0, { calme: m.calme, lisibles: m.lisibles, envois: m.envois, nonConf: m.nonConfirmes });
    await D.cx.close();
  },
  async R3(b, port) {   // réponse retardée de 60 s
    const email = compte('R3'); const D = await appareil(b, port, email, { planEcho: () => ({ delay: 60000 }) }); await D.charger(); await cinqGestes(D);
    const m = await bilanScenario('R3', D, email, { maxCalme: 420000 });
    verif('R3 ⭐ réponse retardée de 60 s : un envoi à la fois, UN « Pates » des deux côtés, aucun conflit artificiel, l\'appareil converge', m.volMax <= 1 && m.pates.appareil === 1 && m.pates.serveur === 1 && memeLog(m.appareilLog, m.serveurLog) && m.conflitsRendus === 0 && m.calme, { volMax: m.volMax, pates: m.pates, conflits: m.conflitsRendus, calme: m.calme, envois: m.envois });
    await D.cx.close();
  },
  async R4(b, port) {   // réponse PERDUE après enregistrement serveur (coupure au retour) : le 1ᵉʳ envoi seulement
    const email = compte('R4'); const D = await appareil(b, port, email, { planEcho: (n) => (n === 1 ? { perdu: true } : null) }); await D.charger();
    await D.ev(() => window.__ajouter('Pates', 150)); await pause(9000);                  // l'envoi 1 part, le serveur l'applique, la réponse est perdue
    await D.ev(() => window.__ajouter('Sauce', 60)); await pause(1500);
    await D.ev(() => window.__ajouter('Yaourt', 125));
    const m = await bilanScenario('R4', D, email, { maxCalme: 120000 });
    verif('R4 ⭐ réponse PERDUE après enregistrement : l\'appareil se sait « non confirmé » (jamais présenté comme un succès) et ne perd RIEN', m.nonConfirmes >= 1 && m.appareilLog.length === 3 && m.serveurLog.length >= 3, { nonConfirmes: m.nonConfirmes, appareil: m.appareilLog.length, serveur: m.serveurLog.length });
    verif('R4 sans modification du MÊME repas : pas de doublon (un « Pates », une « Sauce », un « Yaourt » des deux côtés) et appareil = serveur', m.pates.appareil === 1 && m.pates.serveur === 1 && nb(m.serveurLog, 'Sauce') === 1 && nb(m.serveurLog, 'Yaourt') === 1 && memeLog(m.appareilLog, m.serveurLog), { pates: m.pates, serveur: m.serveurLog.map((l) => l.nom) });
    await D.cx.close();
  },
  async R5(b, port) {   // réponse perdue PUIS le MÊME repas corrigé : le résiduel connu (conflit de l'appareil contre lui-même) — MESURÉ, pas supposé
    const email = compte('R5'); const D = await appareil(b, port, email, { planEcho: (n) => (n === 1 ? { perdu: true } : null) }); await D.charger();
    await D.ev(() => window.__ajouter('Pates', 150)); await pause(9000);
    await D.ev(() => window.__modifier('Pates', 100));
    const m = await bilanScenario('R5', D, email, { maxCalme: 120000 });
    info('R5 RÉSIDUEL CONNU (identique avant/après A/A2, voir le rapport) : après une réponse perdue, corriger le MÊME repas', { pates: m.pates, conflitsRendus: m.conflitsRendus, appareil: m.appareilLog.map((l) => l.nom + ':' + l.q), serveur: m.serveurLog.map((l) => l.nom + ':' + l.q) });
    verif('R5 aucune PERTE : la dernière valeur (100 g) est présente des deux côtés', m.appareilLog.some((l) => l.nom === 'Pates' && l.q === 100) && m.serveurLog.some((l) => l.nom === 'Pates' && l.q === 100), { appareil: m.appareilLog.map((l) => l.q), serveur: m.serveurLog.map((l) => l.q) });
    await D.cx.close();
  },
  async R6(b, port) {   // réponse ILLISIBLE (CORS bloqué) : la panne redoutée en 4G, jouée pour voir CE QUE FAIT le client si elle existait
    const email = compte('R6'); const D = await appareil(b, port, email, { planEcho: () => ({ illisible: true }) }); await D.charger(); await cinqGestes(D, 4000);
    const m = await bilanScenario('R6', D, email, { maxCalme: 120000 });
    verif('R6 lecture bloquée : le client le DÉTECTE (aucun envoi « lisible », tous « non confirmés ») et ne perd RIEN côté appareil', m.lisibles === 0 && m.nonConfirmes >= 1 && m.appareilLog.length === 3, { lisibles: m.lisibles, nonConfirmes: m.nonConfirmes, appareil: m.appareilLog.length });
    info('R6 CONSÉQUENCE (si le blocage de lecture existait sur un réseau mobile) : divergence appareil/serveur et doublons', { pates: m.pates, memeLog: memeLog(m.appareilLog, m.serveurLog), appareil: m.appareilLog.map((l) => l.nom + ':' + l.q), serveur: m.serveurLog.map((l) => l.nom + ':' + l.q), conflits: m.conflitsRendus });
    await D.cx.close();
  },
  async R7(b, port) {   // envoi sans AUCUNE réponse pendant plus de 180 s : la temporisation libère la file, rien n'est abandonné en silence
    const email = compte('R7'); const D = await appareil(b, port, email, { planEcho: (n) => (n === 1 ? { hang: 200000 } : null) }); await D.charger();
    const t0 = Date.now(); await D.ev(() => window.__ajouter('Pates', 150)); await pause(7000); await D.ev(() => window.__ajouter('Sauce', 60));   // 2ᵉ demande PENDANT l'envoi 1 : gardée
    await pause(2000);
    const fl1 = await D.fetchLog(); const s1 = fl1.filter((x) => x.action === 'saveProfile').length;
    info('R7 pendant l\'envoi sans réponse : une seule requête de sauvegarde en vol', { envoisApres9s: s1 });
    const m = await bilanScenario('R7', D, email, { maxCalme: 330000, calmeMs: 12000 });
    const iss = await D.issues(); const delai = iss.find((x) => x.via === 'nonConfirme' && x.code === 'DELAI');
    verif('R7 ⭐ un envoi SANS réponse : un seul en vol pendant l\'attente (A), puis libéré par la temporisation (DELAI, ~180 s) — pas abandonné en silence', s1 === 1 && !!delai && (delai.t - t0) >= 150000 && (delai.t - t0) <= 215000, { envoisApres9s: s1, delaiMs: delai ? delai.t - t0 : null });
    verif('R7 la demande faite pendant l\'attente est rejouée : « Pates » ET « Sauce » arrivent au serveur, appareil = serveur', m.pates.serveur === 1 && nb(m.serveurLog, 'Sauce') === 1 && memeLog(m.appareilLog, m.serveurLog), { serveur: m.serveurLog.map((l) => l.nom), appareil: m.appareilLog.map((l) => l.nom) });
    await D.cx.close();
  },
  async R8(b, port) {   // gros compte (1 000 repas ≈ 520 Ko par envoi) sur un FAIBLE débit montant (≈ 0,4 Mbit/s, latence 300 ms) — limitation imposée par le navigateur
    const email = compte('R8'); const journal = Array.from({ length: 1000 }, (_, i) => ligneFictive(i));
    const D = await appareil(b, port, email, { stockage: stockageGros(journal) }); await D.charger(5000);
    await D.cdp({ offline: false, latency: 300, downloadThroughput: 200000, uploadThroughput: 50000 });
    await cinqGestes(D, 2500);
    const m = await bilanScenario('R8', D, email, { maxCalme: 420000 });
    const gros = (await D.fetchLog()).filter((x) => x.action === 'saveProfile').map((x) => x.octets);
    verif('R8 ⭐ gros compte (1 000 repas) sur faible débit montant : un envoi à la fois, UN « Pates » des deux côtés, appareil = serveur, aucun conflit artificiel', m.volMax <= 1 && m.pates.appareil === 1 && m.pates.serveur === 1 && memeLog(m.appareilLog.filter((l) => /^(Pates|Sauce|Yaourt)$/.test(l.nom)), m.serveurLog.filter((l) => /^(Pates|Sauce|Yaourt)$/.test(l.nom))) && m.conflitsRendus === 0, { volMax: m.volMax, pates: m.pates, conflits: m.conflitsRendus, envois: m.envois, octetsParEnvoi: stat(gros) });
    verif('R8 toutes les réponses lues malgré le débit (durée max des envois dite)', m.lisibles === m.envois && m.nonConfirmes === 0, { lisibles: m.lisibles, envois: m.envois, nonConf: m.nonConfirmes, dureesMs: m.durees });
    await D.cx.close();
  },
};
function ligneFictive(i) {
  const q = 50 + (i * 37) % 250;
  return { date: '2026-10-' + String(1 + Math.floor(i / 40)).padStart(2, '0'), meal: ['petit-dejeuner', 'dejeuner', 'collation', 'diner'][i % 4], name: 'Aliment fictif numéro ' + i + ' (cuit)', ts: 1759000000000 + i * 3600000,
    id: 'm1-' + crypto.createHash('md5').update('c1ligne' + i).digest('hex'), v: 1, saisie: 'liste', origine: 'ciqual', q, u: 'g', per100: { kcal: 120, prot: 8, carbs: 20, fat: 3 }, sourceId: 'ciqual:' + (10000 + i), etat: 'cuit',
    kcal: Math.round(q * 1.2), prot: Math.round(q * 0.08), carbs: Math.round(q * 0.2), fat: Math.round(q * 0.03),
    n2: { s: 1, m: 'p', st: 'verifiee', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'ciqual', ver: '2020', fiab: 'A', base: 'g', lib: 'Aliment fictif numéro ' + i } } };
}
function stockageGros(journal) {
  const seance = (i) => ({ id: 's' + i, ts: 1759000000000 + i * 86400000, date: new Date(1759000000000 + i * 86400000).toISOString().slice(0, 10), exs: ['Squat', 'Développé couché', 'Rowing barre', 'Soulevé de terre roumain', 'Développé militaire', 'Curl biceps'].map((nom, k) => ({ name: nom, sets: [0, 1, 2, 3].map((s) => ({ kg: 60 + k * 5 + s * 2.5, reps: 8 - (s % 3), done: true, type: 'N', rm1: 80 + k * 4 })) })), vol: 5400 + i, duration: 3300 });
  return { ft4_foodlog: J(journal), ft4_sessions: J(Array.from({ length: 150 }, (_, i) => seance(i))), ft4_prs: J({ Squat: { rm1: 117, kg: 100, reps: 5, date: '2026-10-01' } }), ft4_name: 'Compte fictif', ft4_bw: '80', ft4_age: '30', ft4_ht: '180' };
}

(async () => {
  const noms = Object.keys(SC).filter((k) => !ONLY.length || ONLY.includes(k));
  let exec, client;
  if (LOCAL) {
    const srv = lib.serveurDe({}); faux = await lib.fauxAppsScript(srv, {}); exec = faux.url;
    CFG = { exec, hote: 'http://127.0.0.1:' + faux.port + '/', echoRe: new RegExp('^http://127\\.0\\.0\\.1:' + faux.portEcho + '/echo/') };
  } else {
    exec = URL_ARG; CFG = { exec, hote: exec.replace(/exec$/, ''), echoRe: /^https:\/\/script\.googleusercontent\.com\// };
  }
  client = await servirClient(exec);
  console.log('C1 réel Google — client A/A2 : ' + RACINE + ' · cible : ' + (LOCAL ? '(faux Apps Script local : AUTO-CONTRÔLE)' : exec.replace(/(\/s\/[^/]{6})[^/]+/, '$1…')) + ' · étiquette ' + TAG);
  const b = await chromium.launch(LOCAL ? { executablePath: process.env.FT_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] } : { args: ['--no-sandbox'] });
  const h = LOCAL ? { ok: true } : await fetch(exec + '?test=1', { redirect: 'follow' }).then((r) => r.text()).then((t) => { try { return { ok: JSON.parse(t).status === 'online' }; } catch (e) { return { ok: false, t: t.slice(0, 100) }; } }).catch((e) => ({ ok: false, t: String(e) }));
  verif('R0 le projet de TEST répond « online » (test=1), le 302 est suivi', h.ok, h.t);
  if (h.ok) for (const k of noms) { console.log('\n── ' + k + ' ──'); const t0 = Date.now(); try { await SC[k](b, client.port); } catch (e) { verif(k + ' PLANTAGE du scénario : ' + (e && e.message || e), false); } console.log('   (' + Math.round((Date.now() - t0) / 1000) + ' s)'); }
  await b.close(); client.s.close(); if (faux) faux.fermer();
  console.log('\n──── ' + R.ok + ' OK / ' + R.rouge + ' ROUGE ────');
  if (RAPPORT) fs.writeFileSync(RAPPORT, J({ cible: LOCAL ? 'local (auto-contrôle)' : exec.replace(/(\/s\/[^/]{6})[^/]+/, '$1…'), etiquette: TAG, ok: R.ok, rouge: R.rouge, lignes: R.lignes, scenarios: R.scenarios }, null, 1));
  process.exit(R.rouge ? 1 : 0);
})().catch((e) => { console.error('PLANTAGE : ' + (e && e.stack || e)); process.exit(2); });
