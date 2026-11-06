#!/usr/bin/env node
/* DIAGNOSTIC D'UNE ADRESSE /exec DE TEST — LECTURE SEULE (un GET `?test=1`, rien n'est écrit, aucun compte touché).
   Dit EXACTEMENT ce que Google répond : code HTTP, adresse finale après redirections, type de contenu, et le TEXTE visible de la page si ce n'est pas du JSON
   (une page d'erreur de Google dit souvent la cause : « autorisation requise », « fichier introuvable », « accès refusé »…).
   ⛔ Refuse l'adresse de PRODUCTION. Usage : node p1/diag_url.js <URL /exec> */
'use strict';
const url = process.argv[2] || '';
if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url)) { console.error('Usage : node p1/diag_url.js https://script.google.com/macros/s/…/exec'); process.exit(64); }
if (/AKfycbxWUsEFIlmx/.test(url)) { console.error('⛔ adresse de PRODUCTION : refus'); process.exit(3); }
(async () => {
  const t0 = Date.now();
  const r = await fetch(url + '?test=1', { redirect: 'follow' });
  const txt = await r.text();
  console.log('HTTP ' + r.status + ' en ' + (Date.now() - t0) + ' ms · adresse finale : ' + String(r.url).replace(/(\/s\/[^/]{6})[^/]+/, '$1…').slice(0, 120) + ' · type : ' + r.headers.get('content-type'));
  let j = null; try { j = JSON.parse(txt); } catch (e) { /* page HTML */ }
  if (j) { console.log('JSON : ' + JSON.stringify(j).slice(0, 300)); process.exit(j.status === 'online' ? 0 : 1); }
  const titre = (/<title>([^<]*)<\/title>/i.exec(txt) || [, ''])[1];
  const visible = txt.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  console.log('TITRE : ' + titre);
  console.log('TEXTE VISIBLE : ' + visible.slice(0, 700));
  console.log('(page HTML de ' + txt.length + ' octets, pas du JSON)');
  process.exit(2);
})().catch((e) => { console.error('⛔ ERREUR RÉSEAU : ' + (e && e.message || e)); process.exit(2); });
