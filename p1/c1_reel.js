#!/usr/bin/env node
/* C1 « RÉEL GOOGLE » — LE VRAI CLIENT (candidat A/A2) DANS UN VRAI NAVIGATEUR, FACE AU VRAI PROJET APPS SCRIPT DE TEST.
   ⚠️ CE QUE C'EST : le vrai `saveProfile` (POST text/plain, redirect:'follow', LECTURE de la réponse), le vrai 302 de Google, le vrai écho CORS, le vrai Code.js (@194), le vrai verrou.
   ⚠️ CE QUE CE N'EST PAS : un essai sur RÉSEAU MOBILE. Le navigateur est Chromium sur un serveur GitHub (datacenter), PAS Safari/WebKit sur un iPhone en 4G/5G.
      Les perturbations (réponse retardée / perdue / illisible, débit limité) sont INJECTÉES PAR LE NAVIGATEUR sur le trajet de RETOUR ; le serveur de Google, lui, a vraiment appliqué l'envoi.
      ⇒ ce banc dit si le client se comporte bien face à un VRAI Apps Script ; il NE VALIDE PAS C1 (réseau mobile réel = l'iPhone de Michel).
   ⛔ Comptes FICTIFS « c1-…@example.invalid » seulement. ⛔ Refuse l'adresse de PRODUCTION. ⛔ LISTE BLANCHE RÉSEAU stricte : seuls le serveur local du client, l'adresse /exec de TEST et son écho
      (script.googleusercontent.com) sortent ; le Worker (Milo), Supabase, polices, etc. sont ABANDONNÉS par le navigateur et comptés dans le rapport.
   Usage : node p1/c1_reel.js <URL /exec de TEST> [--rapport f.json] [--only R1,R2] [--tag xyz]
           node p1/c1_reel.js <URL /exec de TEST> --c5 [--rapport f.json]     (C5 : suspension puis reprise ; l'OPÉRATEUR exécute `suspendreEssaiP1` puis `reprendreEssaiP1` dans l'éditeur du projet de TEST quand le banc le demande)
           node p1/c1_reel.js --local [--only R1]        (auto-contrôle contre le faux Apps Script du dépôt : jamais de réseau) */
'use strict';
const path = require('path'), fs = require('fs'), http = require('http'), crypto = require('crypto');
const RACINE = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const LOCAL = argv.includes('--local');
const C5MODE = argv.includes('--c5');
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
let CFG = null;   // { exec, hote, echoPattern }
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
      D.bloque.push(u.replace(/[?#].*$/, '').slice(0, 90));                                              // tout le reste : abandonné par le navigateur (rien ne sort)
      return await route.abort('blockedbyclient');
    } catch (e) { /* page fermée pendant une attente : normal */ }
  });
  /* L'ÉCHO (2ᵉ marche : la réponse). Playwright n'intercepte PAS les redirections : on pose NOTRE interception CDP (Fetch) sur l'adresse d'écho seulement ;
     la méthode d'origine (POST = saveProfile, GET = lecture) se retrouve par l'identifiant réseau, qui est conservé le long d'une chaîne de redirections. */
  D.methodes = new Map();
  D.cdpEcho = await cx.newCDPSession(pg);
  await D.cdpEcho.send('Network.enable');
  D.cdpEcho.on('Network.requestWillBeSent', (ev) => { if (!D.methodes.has(ev.requestId)) D.methodes.set(ev.requestId, { m: ev.request.method, a: ((/^\{"action":"([A-Za-z]+)"/.exec(String(ev.request.postData || '').slice(0, 80))) || [])[1] || '' }); });
  await D.cdpEcho.send('Fetch.enable', { patterns: [{ urlPattern: CFG.echoPattern, requestStage: 'Request' }] });
  D.cdpEcho.on('Fetch.requestPaused', (ev) => { echo(D, ev).catch(() => {}); });
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
      window.__supprimer = (nom) => { const e = S.foodLog.find((l) => l && l.name === nom); if (!e) return 'introuvable'; removeFoodEntry(e.id); return 'ok'; };
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
async function echo(D, ev) {
  const o = D.methodes.get(ev.networkId) || { m: '?', a: '' }; const m = o.m + (o.a ? ':' + o.a : '');
  const isSave = o.a === 'saveProfile'; const n = isSave ? ++D.saves : 0;
  const plan = (isSave && D.planEcho(n)) || null;
  const rec = { n, methode: m, plan: plan ? Object.keys(plan)[0] : 'normal', t: Date.now() }; D.echos.push(rec);
  if (process.env.FT_C1_DEBUG) console.log('      [écho] ' + m + ' n=' + n + ' plan=' + rec.plan + ' ' + ev.request.url.slice(0, 70));
  const continuer = () => D.cdpEcho.send('Fetch.continueRequest', { requestId: ev.requestId });
  if (!plan) return continuer();
  if (plan.delay) { await pause(plan.delay); return continuer(); }
  if (plan.perdu) return D.cdpEcho.send('Fetch.failRequest', { requestId: ev.requestId, errorReason: 'InternetDisconnected' });
  if (plan.hang) { await pause(plan.hang); return D.cdpEcho.send('Fetch.failRequest', { requestId: ev.requestId, errorReason: 'TimedOut' }); }
  return continuer();
}

/* ── le côté serveur, lu par un GET indépendant du client (lecture : rien n'est écrit) ── */
async function serveurVoit(email) {
  const u = CFG.exec + (CFG.exec.includes('?') ? '&' : '?') + new URLSearchParams({ action: 'loadProfile', email });
  const r = await fetch(u, { redirect: 'follow' }); const txt = await r.text(); let j = null; try { j = JSON.parse(txt); } catch (e) {}
  if (process.env.FT_C1_DEBUG) console.log('      [serveurVoit] HTTP ' + r.status + ' ' + txt.slice(0, 160));
  const p = (j && j.profile) || {}; const log = (p.foodLog || []).map((l) => ({ nom: l.name, q: l.q, kcal: l.kcal, rev: l.rev === undefined ? null : l.rev }));
  return { ok: !!j && j.status === 'ok', raison: j ? (j.error || j.status) : 'non JSON : ' + txt.slice(0, 80), log, seances: (j && j.sessions || []).length };
}

/* ── le serveur interrogé DIRECTEMENT (comptes fictifs) : envois à la main, avec requestId, comme le ferait un appareil ── */
const rid = () => 'rq' + crypto.randomBytes(8).toString('hex');
async function postSrv(corps) {
  let txt = '', err = null;
  try { const r = await fetch(CFG.exec, { method: 'POST', body: J(corps), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow' }); txt = await r.text(); } catch (e) { err = String(e && e.message || e); }
  let j = null; try { j = JSON.parse(txt); } catch (e) {} return { j: j || {}, json: !!j, brut: txt, err };
}
const v3 = (email, requestId, champs) => Object.assign({ action: 'saveProfile', email, foodLogV: 3, requestId }, champs);
const lc5 = (nom, i, kcal) => ({ id: 'c5' + String(i).padStart(4, '0') + '-' + String(20000000 + i), date: '2026-11-01', meal: 'dejeuner', name: nom, q: 100, u: 'g', kcal: kcal || 130, prot: 3, carbs: 28, fat: 1, ts: 1760000000000, per100: null, v: 1, saisie: 'liste', origine: 'banc-c5' });
const SEANCE_C5 = (d, vol) => ({ date: d, exs: [{ name: 'Squat (test)', sets: [{ kg: 100, reps: 5, done: true, type: 'normal' }] }], vol: vol || 500 });
const REC_C5 = { 'Squat (test)': { rm1: 117, kg: 100, reps: 5, date: '2026-10-20' } };
const PES_C5 = (n) => [{ date: '2026-10-20', kg: 80.5 }, { date: '2026-10-27', kg: 80.1 }, { date: '2026-11-03', kg: 79.8 }].slice(0, n);
async function lireSrv(email) {
  const r = await fetch(CFG.exec + '?' + new URLSearchParams({ action: 'loadProfile', email }), { redirect: 'follow' }); const txt = await r.text(); let j = null; try { j = JSON.parse(txt); } catch (e) {}
  const p = (j && j.profile) || {};
  return { ok: !!j && j.status === 'ok', ids: (p.foodLog || []).map((l) => l.id).sort(), kcal: Object.fromEntries((p.foodLog || []).map((l) => [l.id, l.kcal])), noms: (p.foodLog || []).map((l) => l.name), seances: (j && j.sessions || []).length, pesees: ((j && j.weightLog) || p.weightLog || []).length, raison: j ? (j.error || j.status) : 'non JSON : ' + txt.slice(0, 80) };
}
const meme = (a, b) => J(a) === J(b);
const compte = (scn) => 'c1-' + TAG + '-' + scn.toLowerCase() + '@example.invalid';
const nb = (log, nom) => log.filter((l) => l.nom === nom).length;
const stat = (a) => { const t = a.slice().sort((x, y) => x - y); return t.length ? { n: t.length, med: t[Math.floor(t.length / 2)], max: t[t.length - 1] } : { n: 0 }; };

/* ── les gestes de la personne : « Pates » 150 g, corrigées à 100 g puis 80 g, « Sauce » et « Yaourt » ajoutés ── */
async function cinqGestes(D, espaceMs) {
  const e = espaceMs == null ? 5000 : espaceMs;   // > 4 s (débounce du client) : chaque geste déclenche SON envoi
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
  if (process.env.FT_C1_DEBUG) { try { console.log('      [fetchLog] ' + J((await D.fetchLog()).map((x) => ({ a: x.action, etat: x.etat, st: x.status, ty: x.type, err: x.err && String(x.err).slice(0, 60), ms: x.t1 ? x.t1 - x.t0 : null }))).slice(0, 900)); console.log('      [issues] ' + J((await D.issues()).map((x) => ({ via: x.via, code: x.code, dt: x.t - (D.t0 || 0) }))).slice(0, 600)); } catch (e) { /* page fermée */ } }
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
    verif('R1 (A2) pas d\'envoi complet de plus après un accusé : au plus UN envoi par geste (5 gestes espacés de 5 s > débounce de 4 s ; l\'ancien comportement en faisait 6 ou plus)', m.envois <= 5, { envois: m.envois });
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
  async R3(b, port) {   // première réponse retardée de 60 s (l'adresse de réponse de Google peut avoir expiré : le client doit alors se comporter comme pour une réponse PERDUE)
    const email = compte('R3'); const D = await appareil(b, port, email, { planEcho: (n) => (n === 1 ? { delay: 60000 } : null) }); await D.charger(); await cinqGestes(D);   // la PREMIÈRE réponse seulement est retenue 60 s (retenir TOUTES les réponses 60 s ne laisse jamais le client converger : ce n'est pas un test, c'est une panne permanente)
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
  /* R6 « réponse illisible (CORS bloqué) » : NON joué ici — ce défaut ne se reproduit pas au niveau réseau sans déchiffrer la réponse ; il reste couvert par la SIMULATION (S-lecture-bloquée) et surtout par l'essai sur l'iPhone, qui dit s'il existe vraiment. */
  /* C5 — SUSPENSION PUIS REPRISE (NUT_SUSPENDU) : le VRAI client A/A2 + des envois directs, sur le VRAI projet de TEST. L'opérateur (Michel) exécute `suspendreEssaiP1` puis `reprendreEssaiP1`
     dans l'éditeur du projet de TEST ; le banc DÉTECTE chaque bascule par un envoi-sonde (compte fictif) et ne s'appuie sur aucune horloge. */
  async C5(b, port) {
    const email = compte('C5'), SRV = 'c5s-' + TAG + '@example.invalid', SONDE = 'c5p-' + TAG + '@example.invalid';
    const L1 = lc5('Repas C5 un', 1), L2 = lc5('Repas C5 deux', 2), L3 = lc5('Repas C5 trois', 3), L1m = Object.assign({}, L1, { kcal: 999, rev: 1 });
    const RID_0 = rid(), RID_A = rid(), RID_LATE = rid();
    const ligneSonde = lc5('Sonde C5', 90);
    const sonde = async () => { const r = await postSrv(v3(SONDE, rid(), { foodLog: [ligneSonde], savedFoods: [], hiddenFoods: [], foodSupprimes: [] })); return r.j.code === 'NUT_SUSPENDU' ? 'suspendu' : (r.j.ok === true ? 'actif' : 'inconnu:' + (r.j.code || String(r.brut).slice(0, 50) || r.err)); };
    const attendre = async (voulu, maxMs) => { const t0 = Date.now(); let e = ''; while (Date.now() - t0 < maxMs) { e = await sonde(); if (e === voulu) return { ok: true, ms: Date.now() - t0 }; await pause(10000); } return { ok: false, ms: Date.now() - t0, dernier: e }; };
    const annonce = (msg) => console.log('\n>>> ACTION OPÉRATEUR (Michel) : ' + msg + '\n');
    const operateurLocal = (voulu) => { if (!LOCAL) return; setTimeout(() => { if (voulu === 'suspendre') faux.srv.props.NUT_SUSPENDU = '1'; else delete faux.srv.props.NUT_SUSPENDU; }, 8000); };

    /* ── DÉPART : le serveur de TEST bascule tout seul (fonction `autoriserEtProgrammerEssaiP1`) ; si on arrive pendant un créneau de suspension, on attend sa fin avant de commencer ── */
    if ((await sonde()) === 'suspendu') {
      console.log('\n… le serveur est en créneau de suspension au moment du départ : on attend sa reprise (jusqu\'à 20 min) avant de commencer.\n');
      const r00 = await attendre('actif', 20 * 60000);
      verif('C5-0 le serveur sort du créneau de suspension de départ (la bascule programmée fonctionne)', r00.ok, r00);
      if (!r00.ok) return;
    }
    /* ── PHASE 1 : état sain, AVANT la suspension ── */
    const D = await appareil(b, port, email); await D.charger();
    await D.ev(() => window.__ajouter('Pates', 150)); await pause(5000); await D.ev(() => window.__ajouter('Sauce', 60));
    const m1 = await bilanScenario('C5-1', D, email, { maxCalme: 120000 });
    verif('C5-1 ⭐ AVANT la suspension : le vrai client envoie, reçoit un accusé LISIBLE, et le serveur voit « Pates » et « Sauce » (appareil = serveur)', m1.lisibles === m1.envois && m1.nonConfirmes === 0 && m1.pates.serveur === 1 && nb(m1.serveurLog, 'Sauce') === 1 && memeLog(m1.appareilLog, m1.serveurLog), { envois: m1.envois, lisibles: m1.lisibles, pates: m1.pates, serveur: m1.serveurLog.map((l) => l.nom) });
    const r0 = await postSrv(v3(SRV, RID_0, { foodLog: [L1, L2], savedFoods: [], hiddenFoods: [], foodSupprimes: [], sessions: [SEANCE_C5('2026-10-20')], prs: REC_C5, weightLog: PES_C5(2) }));
    verif('C5-1b envoi direct à jour accepté et accusé (ok:true), pas de refus', r0.j.ok === true && !r0.j.code, { ok: r0.j.ok, code: r0.j.code, err: r0.err });
    const a0 = await lireSrv(SRV); verif('C5-1c relecture : 2 repas, 1 séance, 2 pesées', a0.ok && meme(a0.ids, [L1.id, L2.id].sort()) && a0.seances === 1 && a0.pesees === 2, a0);
    const e0 = await sonde(); verif('C5-1d la sonde voit le serveur ACTIF (pas de suspension posée au départ)', e0 === 'actif', e0);
    if (e0 !== 'actif') { await D.cx.close(); return; }

    /* ── ATTENTE : suspension posée par l'opérateur ── */
    annonce('ATTENTE de la prochaine suspension programmée (fonction `autoriserEtProgrammerEssaiP1`, créneaux de 12 min toutes les 45 min) — aucune action à faire. (le banc attend jusqu\'à 40 min)'); operateurLocal('suspendre');
    const s = await attendre('suspendu', 40 * 60000);
    verif('C5-2a la suspension est DÉTECTÉE sur le vrai Apps Script (la propriété posée est lue par le serveur sans redéploiement)', s.ok, s);
    if (!s.ok) { await D.cx.close(); return; }
    const tSusp = Date.now();

    /* ── PHASE 2 : PENDANT la suspension ── */
    const envoi = v3(SRV, RID_A, { foodLog: [L1m, L3], savedFoods: [], hiddenFoods: [], foodSupprimes: [{ i: L2.id, t: 1762300000000 }], sessions: [SEANCE_C5('2026-10-20'), SEANCE_C5('2026-11-04', 640)], prs: REC_C5, weightLog: PES_C5(3) });
    const q1 = await postSrv(envoi), q2 = await postSrv(envoi);
    verif('C5-2b envoi à jour REFUSÉ NUT_SUSPENDU, réessayable, requestId rendu, profil enregistré, aucun accusé exploitable', q1.j.code === 'NUT_SUSPENDU' && q1.j.retryable === true && q1.j.requestId === RID_A && q1.j.profilEnregistre === true && !q1.j.nut, { code: q1.j.code, retryable: q1.j.retryable, pe: q1.j.profilEnregistre, nut: !!q1.j.nut });
    verif('C5-2c le MÊME requestId rejoué pendant la suspension : refusé de nouveau (jamais « déjà appliqué »)', q2.j.code === 'NUT_SUSPENDU' && !(q2.j.nut && q2.j.nut.deja), { code: q2.j.code });
    const vieux = await postSrv({ action: 'saveProfile', email: SRV, foodLog: [L1, L2, L3], sessions: [SEANCE_C5('2026-10-20'), SEANCE_C5('2026-11-04', 640)], prs: REC_C5, weightLog: PES_C5(3) });
    verif('C5-2d un ANCIEN client (sans foodLogV ni requestId) : refusé NUT_SUSPENDU aussi', vieux.j.code === 'NUT_SUSPENDU', { code: vieux.j.code });
    const a2 = await lireSrv(SRV);
    verif('C5-2e le serveur n\'a RIEN appris du Nutrition (journal inchangé, L1 à 130 kcal, L3 absent) mais ENREGISTRE le reste (2ᵉ séance, 3ᵉ pesée)', a2.ok && meme(a2.ids, [L1.id, L2.id].sort()) && a2.kcal[L1.id] === 130 && !a2.ids.includes(L3.id) && a2.seances === 2 && a2.pesees === 3, a2);
    /* le vrai client pendant la suspension : il corrige, supprime, ajoute — sans rien perdre localement */
    const fl0 = (await D.fetchLog()).filter((x) => x.action === 'saveProfile').length;
    await D.ev(() => window.__modifier('Pates', 100)); await pause(6000); await D.ev(() => window.__supprimer('Sauce')); await pause(6000); await D.ev(() => window.__ajouter('Yaourt', 125));
    await pause(110000);
    const [fl2, iss2, toasts2, log2, srv2] = await Promise.all([D.fetchLog(), D.issues(), D.toasts(), D.log(), lireSrv(email)]);
    const envoisSusp = fl2.filter((x) => x.action === 'saveProfile').length - fl0;
    const refus = iss2.filter((x) => x.via === 'traiter' && x.code === 'NUT_SUSPENDU').length;
    const msgSusp = toasts2.filter((x) => /suspendue/i.test(x.m)).length;
    info('C5-2 le vrai client PENDANT la suspension (≈ 2 min)', { envois: envoisSusp, refusNutSuspendu: refus, messagesSuspendue: msgSusp, toasts: Array.from(new Set(toasts2.map((x) => x.m))).slice(0, 4), appareil: log2.map((l) => l.nom + ':' + l.q) });
    verif('C5-2f ⭐ le vrai client : le refus est compris (NUT_SUSPENDU, pas une panne), UN seul message « suspendue » (au plus 1 par 3 h), nombre d\'envois borné (pas de boucle)', refus >= 1 && msgSusp === 1 && envoisSusp <= 8, { refus, messages: msgSusp, envois: envoisSusp });
    verif('C5-2g ⭐ AUCUNE PERTE locale : l\'appareil garde « Pates » à 100 g, « Yaourt », et « Sauce » supprimée', log2.some((l) => l.nom === 'Pates' && l.q === 100) && log2.some((l) => l.nom === 'Yaourt') && !log2.some((l) => l.nom === 'Sauce'), log2.map((l) => l.nom + ':' + l.q));
    verif('C5-2h le serveur, pendant ce temps, n\'a RIEN reçu de ces modifications (Pates toujours 150 g, Sauce toujours là, pas de Yaourt)', srv2.ok && srv2.noms.includes('Sauce') && !srv2.noms.includes('Yaourt'), { noms: srv2.noms, kcal: srv2.kcal });

    /* ── ATTENTE : reprise ── */
    annonce('ATTENTE de la reprise programmée (fin du créneau de suspension) — aucune action à faire. (le banc attend jusqu\'à 40 min)'); operateurLocal('reprendre');
    const rp = await attendre('actif', 40 * 60000);
    verif('C5-3a la REPRISE est détectée (propriété retirée : les envois sont de nouveau acceptés)', rp.ok, rp);
    if (!rp.ok) { await D.cx.close(); return; }
    const tReprise = Date.now();

    /* ── PHASE 3 : REPRISE ── */
    const r3 = await postSrv(envoi);
    verif('C5-3b le requestId refusé pendant la suspension est APPLIQUÉ : ok:true et PAS « deja » (il n\'avait jamais été appliqué)', r3.j.ok === true && !(r3.j.nut && r3.j.nut.deja), { ok: r3.j.ok, code: r3.j.code, deja: r3.j.nut && r3.j.nut.deja });
    const a3 = await lireSrv(SRV);
    verif('C5-3c journal = [L1 modifiée, L3], L2 supprimé, AUCUN doublon ; séances 2, pesées 3 (rien de perdu)', a3.ok && meme(a3.ids, [L1.id, L3.id].sort()) && new Set(a3.noms).size === a3.noms.length && a3.kcal[L1.id] === 999 && a3.seances === 2 && a3.pesees === 3, a3);
    const r3b = await postSrv(envoi), b3 = await lireSrv(SRV);
    verif('C5-3d rejeu du MÊME requestId APRÈS application : accusé identique (deja:true), journal identique', r3b.j.ok === true && r3b.j.nut && r3b.j.nut.deja === true && meme(b3.ids, a3.ids), { deja: r3b.j.nut && r3b.j.nut.deja });
    const tard = await postSrv(v3(SRV, RID_LATE, { foodLog: [L1, L2], savedFoods: [], hiddenFoods: [], foodSupprimes: [], sessions: [SEANCE_C5('2026-10-20'), SEANCE_C5('2026-11-04', 640)], prs: REC_C5, weightLog: PES_C5(3) }));
    const c3 = await lireSrv(SRV);
    verif('C5-3e un appareil EN RETARD qui renvoie l\'ancienne liste [L1, L2] : L2 ne REVIENT PAS (suppression durable)', !c3.ids.includes(L2.id), { ids: c3.ids, ok: tard.j.ok });
    /* le vrai client : converge-t-il TOUT SEUL après la reprise (relances temporisées) ? */
    let conv = null; const t0c = Date.now();
    while (Date.now() - t0c < 20 * 60000) {
      const [lg, sv] = await Promise.all([D.log(), lireSrv(email)]);
      if (sv.ok && sv.noms.includes('Yaourt') && !sv.noms.includes('Sauce') && sv.noms.length === lg.length) { conv = Date.now() - tReprise; break; }
      await pause(15000);
    }
    let declenche = false;
    if (conv === null) { await D.ev(() => { window.dispatchEvent(new Event('online')); document.dispatchEvent(new Event('visibilitychange')); }); declenche = true; await pause(40000); const sv = await lireSrv(email); const lg = await D.log(); if (sv.ok && sv.noms.includes('Yaourt') && !sv.noms.includes('Sauce') && sv.noms.length === lg.length) conv = Date.now() - tReprise; }
    const [lgF, svF, issF] = await Promise.all([D.log(), serveurVoit(email), D.issues()]);
    const conflitsF = issF.filter((x) => x.via === 'traiter').reduce((n, x) => n + (x.conflits || 0), 0);
    info('C5-3 le vrai client APRÈS la reprise', { convergeApresMs: conv, declencheurUtilisateurNecessaire: declenche, appareil: lgF.map((l) => l.nom + ':' + l.q), serveur: svF.log.map((l) => l.nom + ':' + l.q), conflits: conflitsF, dureeSuspensionMs: tReprise - tSusp });
    verif('C5-3f ⭐ le vrai client CONVERGE après la reprise : « Pates » 100 g unique, « Yaourt » présent, « Sauce » absente, appareil = serveur, aucun doublon, aucun conflit artificiel', conv !== null && lgF.filter((l) => l.nom === 'Pates').length === 1 && svF.log.filter((l) => l.nom === 'Pates').length === 1 && svF.log.some((l) => l.nom === 'Pates' && l.q === 100) && conflitsF === 0, { convMs: conv, declenche, pates: svF.log.filter((l) => l.nom === 'Pates').map((l) => l.q), conflits: conflitsF });
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
  const noms = Object.keys(SC).filter((k) => C5MODE ? k === 'C5' : (k !== 'C5' && (!ONLY.length || ONLY.includes(k))));
  let exec, client;
  if (LOCAL) {
    const srv = lib.serveurDe({}); srv.props.LECTURE_STRICTE = 'off'; faux = await lib.fauxAppsScript(srv, {}); exec = faux.url;
    CFG = { exec, hote: 'http://127.0.0.1:' + faux.port + '/', echoPattern: 'http://127.0.0.1:' + faux.portEcho + '/*' };
  } else {
    exec = URL_ARG; CFG = { exec, hote: exec.replace(/exec$/, ''), echoPattern: 'https://script.googleusercontent.com/*' };
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
