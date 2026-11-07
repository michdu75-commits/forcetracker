#!/usr/bin/env node
/* MESURE : combien de temps l'adresse de RÉPONSE de Google (script.googleusercontent.com/macros/echo?user_content_key=…) reste-t-elle CORRECTE après la redirection ?
   ⚠️ « lisible » ne suffit pas : on vérifie que le CONTENU est bien la réponse de CETTE requête (pour saveProfile : ok:true ET le requestId envoyé), comme le fait le client (`d.requestId !== envoi.requestId` → « ACCUSE_ABSENT »).
   Trois chemins : GET ?test=1 · POST loadProfile (lecture seule, compte fictif inexistant) · POST saveProfile v3 (compte FICTIF @example.invalid, un compte par attente).
   ⛔ Refuse l'adresse de PRODUCTION. Usage : node p1/sonde_echo.js <URL /exec de TEST> */
'use strict';
const crypto = require('crypto');
const URL_EXEC = process.argv[2] || '';
if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(URL_EXEC)) { console.error('Usage : node p1/sonde_echo.js https://script.google.com/macros/s/…/exec'); process.exit(64); }
if (URL_EXEC.includes('AKfycbxWUsEFIlmx')) { console.error('⛔ PRODUCTION : refus'); process.exit(3); }
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const DELAIS = [0, 15, 30, 45, 60, 90, 120, 180];
const ligne = (tag) => ({ id: tag + '-10000001', date: '2026-11-01', meal: 'dejeuner', name: 'Repas echo ' + tag, q: 100, u: 'g', kcal: 130, prot: 3, carbs: 28, fat: 1, ts: 1760000000000, per100: null, v: 1, saisie: 'liste', origine: 'reprise', n2: { s: 1, m: 'd', no: [], st: 'declaree' } });
const VARIANTES = {
  'GET ?test=1': () => ({ get: true, ok: (j) => j && j.status === 'online' }),
  'POST loadProfile (lecture seule)': () => ({ corps: { action: 'loadProfile', email: 'echo-sonde@example.invalid' }, ok: (j) => j && j.status === 'not_found' }),
  'POST saveProfile v3 (compte fictif)': () => { const e = 'echo-' + crypto.randomBytes(4).toString('hex') + '@example.invalid', rid = 'rq' + crypto.randomBytes(8).toString('hex');
    return { corps: { action: 'saveProfile', email: e, foodLogV: 3, requestId: rid, foodLog: [ligne(crypto.randomBytes(3).toString('hex'))], savedFoods: [], hiddenFoods: [], foodSupprimes: [], sessions: [], prs: {}, weightLog: [] }, ok: (j) => j && j.ok === true && j.requestId === rid }; } };
(async () => {
  for (const [nom, fab] of Object.entries(VARIANTES)) {
    console.log('── ' + nom);
    const res = await Promise.all(DELAIS.map(async (d) => {
      const v = fab();
      const r1 = await (v.get ? fetch(URL_EXEC + '?test=1', { redirect: 'manual' }) : fetch(URL_EXEC, { method: 'POST', body: JSON.stringify(v.corps), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'manual' }));
      const loc = r1.headers.get('location'); if (!loc) { const txt = await r1.text(); return { d, bon: false, detail: 'pas de redirection (HTTP ' + r1.status + ') : ' + txt.slice(0, 60) }; }
      await pause(d * 1000);
      const r2 = await fetch(loc, { redirect: 'follow' }); const txt = await r2.text(); let j = null; try { j = JSON.parse(txt); } catch (e) { /* html */ }
      return { d, bon: !!v.ok(j), detail: 'HTTP ' + r2.status + ' · ' + (j ? ('JSON status=' + j.status + ' ok=' + j.ok + ' requestId=' + (j.requestId ? String(j.requestId).slice(0, 8) : '—') + (v.corps && v.corps.requestId ? ' (envoyé ' + v.corps.requestId.slice(0, 8) + ')' : '') + (j.error ? ' error=' + String(j.error).slice(0, 40) : '')) : 'NON JSON : « ' + txt.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 70) + ' »') };
    }));
    res.sort((a, b) => a.d - b.d).forEach((x) => console.log('   attente ' + String(x.d).padStart(3) + ' s : ' + (x.bon ? 'CORRECTE' : 'INCORRECTE') + ' · ' + x.detail));
    const ko = res.filter((x) => !x.bon).map((x) => x.d), ok = res.filter((x) => x.bon).map((x) => x.d);
    console.log('   → RÉSULTAT : dernière attente correcte = ' + (ok.length ? Math.max.apply(null, ok) : 'aucune') + ' s · première attente incorrecte = ' + (ko.length ? Math.min.apply(null, ko) + ' s' : 'aucune jusqu\'à ' + DELAIS[DELAIS.length - 1] + ' s'));
  }
  process.exit(0);
})().catch((e) => { console.error('⛔ ' + (e && e.message || e)); process.exit(2); });
