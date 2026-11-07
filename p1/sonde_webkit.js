#!/usr/bin/env node
/* LE MÊME CHEMIN QUE L'APP, DANS LE MOTEUR DE SAFARI (WebKit de Playwright) — pas l'iPhone, mais le seul moteur WebKit automatisable.
   Question : un `fetch` POST `text/plain` + `redirect:'follow'` vers l'adresse /exec de TEST, lancé depuis une page d'une AUTRE origine, rend-il une réponse LISIBLE (CORS + 302 vers script.googleusercontent.com) ?
   C'est la lecture que fait `_cloudSync`. Elle est testée pour `loadProfile` (lecture seule) puis pour un `saveProfile` v3 d'un compte FICTIF (@example.invalid), puis un rejeu du MÊME requestId (accusé « deja »).
   ⛔ Refuse l'adresse de PRODUCTION. Usage : node p1/sonde_webkit.js <URL /exec de TEST> */
'use strict';
const http = require('http'), crypto = require('crypto');
const URL_EXEC = process.argv[2] || '';
if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(URL_EXEC)) { console.error('Usage : node p1/sonde_webkit.js https://script.google.com/macros/s/…/exec'); process.exit(64); }
if (URL_EXEC.includes('AKfycbxWUsEFIlmx')) { console.error('⛔ PRODUCTION : refus'); process.exit(3); }
let ok = 0, rouge = 0; const t = (n, c, d) => { c ? ok++ : rouge++; console.log((c ? '   OK  ' : '❌ ROUGE ') + n + (d !== undefined ? '   >> ' + (typeof d === 'string' ? d : JSON.stringify(d)).slice(0, 260) : '')); };
(async () => {
  let pw; try { pw = require('playwright'); } catch (e) { console.error('⛔ Playwright absent'); process.exit(2); }
  const srv = http.createServer((q, r) => { r.writeHead(200, { 'Content-Type': 'text/html' }); r.end('<!doctype html><title>sonde</title><body>sonde</body>'); });
  await new Promise((res) => srv.listen(0, '127.0.0.1', res)); const port = srv.address().port;
  const b = await pw.webkit.launch(); const pg = await (await b.newContext()).newPage();
  await pg.goto('http://127.0.0.1:' + port + '/'); console.log('   moteur : WebKit ' + b.version() + ' · page d\'origine http://127.0.0.1:' + port + ' (autre origine que script.google.com)');
  const appel = (corps) => pg.evaluate(async ([u, c]) => { const t0 = Date.now(); try { const r = await fetch(u, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(c) }); const txt = await r.text(); let j = null; try { j = JSON.parse(txt); } catch (e) {} return { ok: true, http: r.status, type: r.type, json: j, brut: j ? '' : txt.slice(0, 100), ms: Date.now() - t0 }; } catch (e) { return { ok: false, err: String(e && e.message || e), ms: Date.now() - t0 }; } }, [URL_EXEC, corps]);
  const email = 'webkit-' + crypto.randomBytes(3).toString('hex') + '@example.invalid', rid = 'rq' + crypto.randomBytes(8).toString('hex');
  const r1 = await appel({ action: 'loadProfile', email });
  t('WebKit : le POST loadProfile (lecture seule) rend une réponse LISIBLE (JSON) à travers le 302', r1.ok && !!r1.json, r1.ok ? { http: r1.http, type: r1.type, statut: r1.json && r1.json.status, ms: r1.ms } : r1);
  const ligne = { id: 'wk0001-10000001', date: '2026-11-01', meal: 'dejeuner', name: 'Repas webkit test', q: 100, u: 'g', kcal: 130, prot: 3, carbs: 28, fat: 1, ts: 1760000000000, per100: null, v: 1, saisie: 'liste', origine: 'reprise', n2: { s: 1, m: 'd', no: [], st: 'declaree' } };
  const corps = { action: 'saveProfile', email, foodLogV: 3, requestId: rid, foodLog: [ligne], savedFoods: [], hiddenFoods: [], foodSupprimes: [], sessions: [], prs: {}, weightLog: [] };
  const r2 = await appel(corps);
  t('WebKit : le POST saveProfile v3 (compte fictif) rend un accusé LISIBLE : ok:true, requestId rendu', r2.ok && r2.json && r2.json.ok === true && r2.json.requestId === rid, r2.ok ? { http: r2.http, ok: r2.json && r2.json.ok, requestId: r2.json && String(r2.json.requestId).slice(0, 8), ms: r2.ms, brut: r2.brut } : r2);
  const r3 = await appel(corps);
  t('WebKit : le MÊME requestId rejoué → accusé identique « déjà appliqué » (idempotence lue par le navigateur)', r3.ok && r3.json && r3.json.ok === true && r3.json.nut && r3.json.nut.deja === true, r3.ok ? { ok: r3.json && r3.json.ok, deja: r3.json && r3.json.nut && r3.json.nut.deja } : r3);
  await b.close(); srv.close();
  console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(rouge ? 1 : 0);
})().catch((e) => { console.error('⛔ ' + (e && e.message || e)); process.exit(2); });
