#!/usr/bin/env node
/* TÉMOINS D'ÉCRASEMENT DES SÉANCES — EN LOCAL, LE VRAI Code.js (`handleSaveProfile_`, garde-fou « sessions ») DANS LE HARNAIS EN MÉMOIRE `harness_appsscript.js`.
   « GO TEST P0 » de Michel (11/11/2026) : voisin de `banc.js`, qui ne tourne pas ici faute de PostgreSQL (le miroir Supabase du banc), alors que ces témoins ne regardent QU'Apps Script.
   Ce qu'il joue : les 14 cas locaux du PDF « P0 » (§ 4 ; le 12ᵉ — la vraie concurrence — n'existe que par HTTP, p1/p0_ecrasement.js) + un tirage à graine fixe de 2 000 cas, et pour chacun :
     (a) le serveur ACTUEL fait-il ce que la règle transcrite PRÉDIT (p1/p0_oracle.js) ? — c'est la mesure de mon modèle contre le vrai code ;
     (b) les invariants I1 (existantes) / I2 (nouvelles) / I4 (inchangé) tiennent-ils ? — ROUGE = « le témoin voit l'écrasement » ; I3 (rejeu) pour le cas 13.
   Sur le code ACTUEL, les cas annoncés rouges DOIVENT l'être (un témoin qui ne peut pas rougir ne prouve rien). Usage : node tools/chaos/ecrasement_sessions.js [--exiger-vert]
     · sans option : PASS si le serveur se comporte comme prédit ET si les rouges sont exactement ceux annoncés (aujourd'hui) ;
     · --exiger-vert : PASS seulement si AUCUN invariant n'est violé (à demander APRÈS une correction, jamais avant : aujourd'hui il doit échouer). */
'use strict';
const { creer } = require('./harness_appsscript');
const O = require('../../p1/p0_oracle');
const EXIGER_VERT = process.argv.includes('--exiger-vert');
let ok = 0, rouge = 0;
const t = (nom, cond, det) => { cond ? ok++ : rouge++; console.log((cond ? '   OK  ' : '❌ ROUGE ') + nom + (det !== undefined && det !== '' ? '   >> ' + (typeof det === 'string' ? det : JSON.stringify(det)).slice(0, 220) : '')); };

const h = creer();
let n = 0;
function jouer(base, envoi) {
  const email = 'p0l-' + (++n) + '@example.invalid';
  const r0 = h.sauver({ action: 'saveProfile', email, sessions: base });
  const dep = (h.lire(email) || {}).sessions || [];
  const corps = { action: 'saveProfile', email }; if (envoi !== undefined) corps.sessions = envoi;
  const r1 = h.sauver(corps);
  const apres = (h.lire(email) || {}).sessions || [];
  return { email, apres, depart: dep, r0, r1 };
}
const violation = (j) => !(j.i1 && j.i2 && j.i4);

console.log('\n=== LES CAS DU PDF « P0 » § 4 — le vrai Code.js actuel (harnais en mémoire) ===');
let conformes = 0, rougesVus = [], vertsVus = [];
for (const c of O.CAS) {
  const { base, envoi } = c.faire();
  const x = jouer(base, envoi);
  const graine = x.depart.length === base.length && x.r0.status === 'ok';
  const pred = O.predireActuel(base, envoi), j = O.juger(base, envoi, x.apres);
  const conforme = graine && O.memes(x.apres, pred.apres);
  let i3 = true, detRejeu = '';
  if (c.rejeu) { h.sauver({ action: 'saveProfile', email: x.email, sessions: envoi }); const ap2 = (h.lire(x.email) || {}).sessions || []; i3 = O.memes(ap2, x.apres); detRejeu = ' · rejeu : ' + ap2.length + ' (stable : ' + i3 + ')'; }
  const viole = violation(j) || !i3;
  (viole ? rougesVus : vertsVus).push(c.id); if (conforme) conformes++;
  const lecture = c.id + ' ' + c.nom + ' — base ' + base.length + ' → envoi ' + (envoi === undefined ? '(absent)' : envoi.length) + ' : ' + x.apres.length + ' en base après · ' + j.perdues + ' ancienne(s) perdue(s) · ' + j.nouvellesPerdues + ' neuve(s) perdue(s)' + detRejeu;
  t(lecture + ' [prévu : ' + pred.decision + ' ' + pred.apres.length + ']', conforme && (EXIGER_VERT ? !viole : viole === c.rouge),
    (viole ? 'ROUGE' : 'VERT') + (viole === c.rouge ? (viole ? ' (attendu aujourd\'hui)' : '') : ' ⚠️ INATTENDU : annoncé ' + (c.rouge ? 'rouge' : 'vert')) + (conforme ? '' : ' · ⚠️ le serveur n\'a PAS fait ce que la règle transcrite prédit : ' + x.apres.length + ' ≠ ' + pred.apres.length));
}
t('le serveur actuel fait EXACTEMENT ce que la règle transcrite prédit, sur les ' + O.CAS.length + ' cas', conformes === O.CAS.length, conformes + '/' + O.CAS.length);
t('rouges vus = rouges annoncés (' + O.CAS.filter((c) => c.rouge).map((c) => c.id).join(', ') + ')', JSON.stringify(rougesVus.sort()) === JSON.stringify(O.CAS.filter((c) => c.rouge).map((c) => c.id).sort()) || EXIGER_VERT, rougesVus.sort());

console.log('\n=== TIRAGE À GRAINE FIXE — 2 000 cas : le vrai Code.js contre le modèle de la règle actuelle, et les invariants ===');
{
  const rnd = O.mulberry32(20261110), NB = 2000; let egal = 0, viol = 0, i1 = 0, i2 = 0, i4 = 0, i3 = 0, premier = null;
  for (let k = 0; k < NB; k++) {
    const { base, envoi } = O.tirage(rnd), x = jouer(base, envoi), pred = O.predireActuel(base, envoi), j = O.juger(base, envoi, x.apres);
    if (O.memes(x.apres, pred.apres)) egal++; else if (!premier) premier = { base: base.length, envoi: envoi.length, apres: x.apres.length, predit: pred.apres.length };
    h.sauver({ action: 'saveProfile', email: x.email, sessions: envoi });                                             // rejeu (I3)
    if (!O.memes((h.lire(x.email) || {}).sessions || [], x.apres)) i3++;
    if (!j.i1) i1++; if (!j.i2) i2++; if (!j.i4) i4++; if (violation(j)) viol++;
  }
  t('le vrai Code.js = le modèle de la règle actuelle sur ' + NB + ' cas tirés (graine fixe 20261110)', egal === NB, egal + '/' + NB + (premier ? ' · premier écart ' + JSON.stringify(premier) : ''));
  t('I3 (rejeu) : rejouer le même envoi ne change rien — sur les ' + NB + ' cas', i3 === 0, i3 + ' écart(s)');
  console.log('   ℹ︎  invariants violés par le code ACTUEL sur le tirage : I1 ' + i1 + ' · I2 ' + i2 + ' · I4 ' + i4 + ' · au moins un : ' + viol + ' / ' + NB);
  t(EXIGER_VERT ? 'AUCUN invariant violé sur le tirage' : 'le témoin sait ROUGIR : le code actuel viole I1 ou I2 sur le tirage (rouge attendu aujourd\'hui)', EXIGER_VERT ? viol === 0 : (i1 > 0 && i2 > 0), { i1, i2, i4, viol });
}
console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE' + (EXIGER_VERT ? ' (mode --exiger-vert)' : ' (ici « ROUGE » = un défaut du TÉMOIN ; les rouges du CODE actuel sont comptés OK parce qu\'ils sont attendus)') + ' ────');
process.exit(rouge ? 1 : 0);
