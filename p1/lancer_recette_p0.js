#!/usr/bin/env node
/* TENTATIVE DE LANCER LA RECETTE P0 PAR L'API APPS SCRIPT (`scripts.run`) — « GO TEST P0 » de Michel (11/11/2026), règle d'or n°16 :
   avant de demander un clic à Michel, MESURER si l'action peut être automatisée. Cette étape n'ajoute aucun droit : elle appelle, sur le projet de TEST SEULEMENT,
   la même fonction d'éditeur `recetteRestaurationP1` que le clic de Michel jouerait (mêmes gardes internes : elles refusent sans rien écrire si une condition manque).
   Résultat attendu avec le jeton de clasp : REFUS de Google (projet Cloud non partagé / portées manquantes) — alors l'erreur exacte est la preuve que le clic est nécessaire.
   Si Google l'accepte : la fonction a tourné, le verdict revient ici (pass, R1–R10) et ce même verdict est écrit dans le marqueur « P0-VERDICT-… » du dossier de TEST.
   ⛔ Refuse le Script ID de PRODUCTION. Aucune adresse e-mail n'est affichée. Usage : node p1/lancer_recette_p0.js <scriptId du projet de TEST> */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const SID = process.argv[2] || '';
if (!/^1[A-Za-z0-9_-]{40,60}$/.test(SID)) { console.error('Usage : node p1/lancer_recette_p0.js <scriptId>'); process.exit(64); }
if (SID === '1RwE46hNmZrykInYcrMgm1OZWt4NmS6NjTqttvAevZLuqo2v6EEb1Drw') { console.error('⛔ Script ID de PRODUCTION : refus'); process.exit(3); }
const sansMail = (s) => String(s).replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/gi, '<adresse>');
const court = (s, n) => sansMail(typeof s === 'string' ? s : JSON.stringify(s)).slice(0, n || 500);
(async () => {
  const rc = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.clasprc.json'), 'utf8'));
  const tk = (rc.tokens && (rc.tokens.default || Object.values(rc.tokens)[0])) || rc;
  const tj = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ client_id: tk.client_id, client_secret: tk.client_secret, refresh_token: tk.refresh_token, grant_type: 'refresh_token' }), headers: { 'content-type': 'application/x-www-form-urlencoded' } })).json();
  if (!tj.access_token) { console.error('⛔ jeton non obtenu'); process.exit(2); }
  console.log('   portées du jeton (noms seulement) : ' + String(tj.scope || '(non annoncées)').split(' ').map((s) => s.replace('https://www.googleapis.com/auth/', '')).join(' · '));
  const ctl = new AbortController(), minuteur = setTimeout(() => ctl.abort(), 5 * 60 * 1000);
  let r, txt;
  try {
    r = await fetch('https://script.googleapis.com/v1/scripts/' + SID + ':run', { method: 'POST', headers: { authorization: 'Bearer ' + tj.access_token, 'content-type': 'application/json' }, body: JSON.stringify({ function: 'recetteRestaurationP1', devMode: true }), signal: ctl.signal });
    txt = await r.text();
  } catch (e) {
    console.log('API_RECETTE_P0 DÉLAI/RÉSEAU : ' + court(e && e.message || e, 200) + ' — la fonction a PEUT-ÊTRE tourné : lire l\'étape « verdict » AVANT de relancer quoi que ce soit');
    process.exit(5);
  } finally { clearTimeout(minuteur); }
  let j = null; try { j = JSON.parse(txt); } catch (e) { /* texte brut */ }
  console.log('   HTTP ' + r.status);
  if (j && j.error) {
    const det = (j.error.details || []).map((d) => ({ type: d.errorType, msg: d.errorMessage })).filter((d) => d.type || d.msg);
    console.log('API_RECETTE_P0 REFUSÉ PAR GOOGLE : code ' + j.error.code + ' · ' + j.error.status + ' · ' + court(j.error.message, 400) + (det.length ? ' · détails : ' + court(det, 400) : ''));
    process.exit(4);
  }
  if (j && j.done && j.response && j.response.result !== undefined) {
    const v = j.response.result || {};
    console.log('API_RECETTE_P0 EXÉCUTÉE : pass=' + v.pass + ' · R=' + court(v.r, 400) + ' · durée ' + v.dureeMs + ' ms' + (v.erreur ? ' · erreur : ' + court(v.erreur, 300) : ''));
    process.exit(v.pass ? 0 : 1);
  }
  console.log('API_RECETTE_P0 RÉPONSE INATTENDUE : ' + court(txt, 600));
  process.exit(6);
})().catch((e) => { console.error('⛔ ' + court(e && e.message || e, 300)); process.exit(2); });
