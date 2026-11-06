#!/usr/bin/env node
/* SONDE DU VERROU — « LockService marche-t-il VRAIMENT dans le vrai Apps Script, sous les portées de appsscript.json ? » — ZÉRO DONNÉE ÉCRITE.
   Elle appelle l'action `pushHealth` avec une adresse FICTIVE qui n'a pas de compte. Dans le Code.js du candidat, ce chemin est :
       identité → code d'accès → PRISE DU VERROU → lecture du compte → « introuvable » → réponse `not_found` → verrou rendu (finally).
   Rien n'est écrit dans un compte, ni dans la Sheet, ni dans Drive (le seul effet : le compteur agrégé `mig_stats` du jour gagne 1, comme pour tout envoi sans jeton).
     · verrou disponible          → {"status":"not_found"}                                          → exit 0 (✅)
     · verrou refusé / exception  → {"status":"error","ok":false,"code":"NUT_LOCK_BUSY",…}          → exit 1 (⛔ retour arrière du serveur)
     · réponse qui n'est pas du JSON (page Google : autorisation requise, erreur…)                  → exit 2 (⛔)
     · autre réponse (identité refusée avant le verrou, ancien Code.js…)                            → exit 3 (inconclusif : la sonde n'a rien prouvé)
   ⚠️ Sur l'ANCIEN Code.js (@193), `pushHealth` ne prend aucun verrou : la sonde y rend aussi `not_found` et ne prouve donc RIEN — elle ne vaut qu'APRÈS le déploiement du candidat.
   Usage : node sonde_verrou.js <URL /exec>            (aucune option : l'action et l'adresse sont FIGÉES ici, exprès) */
'use strict';
const ADRESSE_FICTIVE = 'controle-verrou@exemple.invalid';
const CORPS = JSON.stringify({ action: 'pushHealth', email: ADRESSE_FICTIVE });

function interpreter(texte) {
  let j = null; try { j = JSON.parse(texte); } catch (e) { /* page HTML */ }
  if (!j || typeof j !== 'object') return { code: 2, verdict: '⛔ réponse qui n\'est pas du JSON (autorisation requise ? erreur Google ?) : ' + String(texte).replace(/\s+/g, ' ').slice(0, 140) };
  if (j.code === 'NUT_LOCK_BUSY') return { code: 1, verdict: '⛔ VERROU INDISPONIBLE (NUT_LOCK_BUSY) alors que personne d\'autre n\'écrit : LockService ne marche pas dans ce projet → NE PAS publier le client ; retour arrière du serveur' };
  if (j.status === 'not_found') return { code: 0, verdict: '✅ le verrou a été pris puis rendu (réponse « not_found » obtenue APRÈS la prise du verrou) ; rien n\'a été écrit' };
  return { code: 3, verdict: '❔ réponse inattendue — la sonde ne prouve rien : ' + String(texte).slice(0, 200) };
}

module.exports = { interpreter, CORPS, ADRESSE_FICTIVE };

if (require.main === module) {
  const url = process.argv[2];
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url || '')) { console.error('Usage : node sonde_verrou.js https://script.google.com/macros/s/…/exec'); process.exit(64); }
  (async () => {
    const t0 = Date.now();
    const r = await fetch(url, { method: 'POST', body: CORPS, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow' });
    const txt = await r.text();
    const v = interpreter(txt);
    console.log('HTTP ' + r.status + ' en ' + (Date.now() - t0) + ' ms');
    console.log('réponse : ' + txt.slice(0, 300));
    console.log(v.verdict);
    process.exit(v.code);
  })().catch((e) => { console.error('⛔ ERREUR RÉSEAU : ' + (e && e.message || e)); process.exit(2); });
}
