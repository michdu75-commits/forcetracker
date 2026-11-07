#!/usr/bin/env node
/* MESURE : combien de temps l'adresse de RÉPONSE de Google (script.googleusercontent.com/macros/echo?user_content_key=…) reste-t-elle lisible après la redirection ?
   Pourquoi : un client qui reçoit le 302 puis perd le réseau pendant N secondes ne pourra plus lire l'accusé (il le traitera comme une réponse perdue : l'envoi sera rejoué avec le même requestId).
   Lecture seule : des GET `?test=1` (rien n'est écrit, aucun verrou, aucun compte). ⛔ Refuse l'adresse de PRODUCTION. Usage : node p1/sonde_echo.js <URL /exec de TEST> */
'use strict';
const URL_EXEC = process.argv[2] || '';
if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(URL_EXEC)) { console.error('Usage : node p1/sonde_echo.js https://script.google.com/macros/s/…/exec'); process.exit(64); }
if (URL_EXEC.includes('AKfycbxWUsEFIlmx')) { console.error('⛔ PRODUCTION : refus'); process.exit(3); }
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const DELAIS = [0, 5, 15, 25, 35, 45, 60, 90, 120, 180];
(async () => {
  const res = await Promise.all(DELAIS.map(async (d) => {
    const r1 = await fetch(URL_EXEC + '?test=1', { redirect: 'manual' }); const loc = r1.headers.get('location');
    if (!loc) { const txt = await r1.text(); return { d, etat: 'pas de redirection (HTTP ' + r1.status + ')', json: /"status"\s*:\s*"online"/.test(txt) }; }
    await pause(d * 1000);
    const r2 = await fetch(loc, { redirect: 'follow' }); const txt = await r2.text(); let j = null; try { j = JSON.parse(txt); } catch (e) { /* html */ }
    return { d, http: r2.status, lisible: !!(j && j.status === 'online'), debut: j ? '' : txt.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 70), hote: new URL(loc).host };
  }));
  res.sort((a, b) => a.d - b.d).forEach((x) => console.log('   attente ' + String(x.d).padStart(3) + ' s avant de lire l\'adresse de réponse : ' + (x.etat || ('HTTP ' + x.http + ' · ' + (x.lisible ? 'LISIBLE (JSON online)' : 'ILLISIBLE : « ' + x.debut + ' »'))) + (x.hote ? ' · ' + x.hote : '')));
  const dernierOk = Math.max.apply(null, res.filter((x) => x.lisible).map((x) => x.d).concat([-1]));
  const premierKo = Math.min.apply(null, res.filter((x) => x.lisible === false).map((x) => x.d).concat([1e9]));
  console.log('\nRÉSULTAT : dernière attente encore lisible = ' + dernierOk + ' s · première attente illisible = ' + (premierKo === 1e9 ? 'aucune (toutes lisibles jusqu\'à ' + DELAIS[DELAIS.length - 1] + ' s)' : premierKo + ' s'));
  process.exit(0);
})().catch((e) => { console.error('⛔ ' + (e && e.message || e)); process.exit(2); });
