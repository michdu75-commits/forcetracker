#!/usr/bin/env node
/* TÉMOINS D'ÉCRASEMENT DES SÉANCES PAR HTTP — SUR LE VRAI APPS SCRIPT DE TEST (comptes FICTIFS « …@example.invalid » seulement), ou sur le serveur local à vrais processus (p1_shim_http.js).
   « GO TEST P0 » de Michel (11/11/2026). Mêmes cas, même oracle que le joueur local (tools/chaos/ecrasement_sessions.js) : p1/p0_oracle.js. Ce que le vrai Google ajoute et que le local ne peut pas prouver :
   la vraie redirection 302 + lecture de la réponse, le vrai stockage des propriétés, et — cas 12 — la VRAIE concurrence (deux envois simultanés sous le vrai LockService).
   Sur le code ACTUEL, les cas annoncés rouges DOIVENT l'être (C02a, C02b, C04, C05, C07, C10, C13, et le cas 12) : c'est la preuve que le témoin sait échouer.
   Usage : node p1/p0_ecrasement.js <URL de l'exécutable /exec> [--rapport f.json] [--tag xyz] [--exiger-vert]
     · sans option : PASS si le serveur se comporte comme la règle ACTUELLE le prédit ET si les rouges sont exactement ceux annoncés ;
     · --exiger-vert : PASS seulement si AUCUN invariant n'est violé (à demander APRÈS une correction — aujourd'hui il DOIT échouer).
   ⛔ Refuse l'adresse de PRODUCTION (AKfycbxWUsEFIlmx…), sans option pour passer outre. ⛔ N'écrit que des comptes « p0e-…@example.invalid ». ⛔ Ne touche à aucune propriété, à aucun dossier, à aucun déclencheur.
   Prérequis du projet de TEST : propriété `LECTURE_STRICTE` = `off` (sinon loadProfile refuse les comptes sans code : `needsCode`) — déjà posée par `preparerEssaiP1()`. */
'use strict';
const crypto = require('crypto'), fs = require('fs');
const O = require('./p0_oracle');
const argv = process.argv.slice(2);
const URL_EXEC = argv.find((a) => /^https?:\/\//.test(a));
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const RAPPORT = opt('--rapport', null), TAG = opt('--tag', crypto.randomBytes(2).toString('hex')), EXIGER_VERT = argv.includes('--exiger-vert');
if (!URL_EXEC) { console.error('Usage : node p1/p0_ecrasement.js <URL /exec> [--rapport f.json] [--tag xyz] [--exiger-vert]'); process.exit(2); }
if (/AKfycbxWUsEFIlmx/.test(URL_EXEC)) { console.error('⛔ Cette adresse est celle de la PRODUCTION. Refus, sans option pour passer outre.'); process.exit(3); }

const journal = [], lat = []; let ok = 0, rouge = 0;
const t = (nom, cond, det) => { cond ? ok++ : rouge++; journal.push({ nom, ok: !!cond, det: det === undefined ? '' : det }); console.log((cond ? '   OK  ' : '❌ ROUGE ') + nom + (det !== undefined && det !== '' ? '   >> ' + (typeof det === 'string' ? det : JSON.stringify(det)).slice(0, 240) : '')); };
const compte = (nom) => 'p0e-' + nom + '-' + TAG + '-' + crypto.randomBytes(3).toString('hex') + '@example.invalid';
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function appel(methode, corps, params) {
  const t0 = Date.now();
  const url = URL_EXEC + (params ? (URL_EXEC.includes('?') ? '&' : '?') + new URLSearchParams(params) : '');
  let txt = '', statut = 0, err = null;
  try {
    const r = await fetch(url, methode === 'POST' ? { method: 'POST', body: JSON.stringify(corps), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow' } : { redirect: 'follow' });
    statut = r.status; txt = await r.text();
  } catch (e) { err = String(e && e.message || e); }
  lat.push(Date.now() - t0);
  let j = null; try { j = JSON.parse(txt); } catch (e) { /* page HTML : autorisation manquante, erreur Google… */ }
  return { j: j || {}, brut: txt, statut, err, json: !!j };
}
const envoyer = (email, sessions) => { const c = { action: 'saveProfile', email }; if (sessions !== undefined) c.sessions = sessions; return appel('POST', c); };
async function lire(email) {
  for (let essai = 0; essai < 3; essai++) {                                    // une lecture ratée (page d'erreur de Google) n'est pas un témoin : on la refait, et on le dit
    const r = await appel('GET', null, { action: 'loadProfile', email });
    if (r.json && r.j.status === 'ok') return { ok: true, sessions: r.j.sessions || [], essais: essai + 1 };
    await pause(1500);
  }
  return { ok: false, sessions: [], essais: 3 };
}
const bloque = (quoi, r) => { console.log('\n⛔ BLOQUÉ : ' + quoi + ' — ' + JSON.stringify(r && (r.j && Object.keys(r.j).length ? r.j : { statut: r.statut, err: r.err, brut: String(r.brut || '').slice(0, 120) })).slice(0, 300)); console.log('──── ' + ok + ' OK / ' + rouge + ' ROUGE (arrêt) ────'); process.exit(4); };

(async () => {
  console.log('Témoins d\'écrasement P0 sur : ' + URL_EXEC.replace(/(\/s\/[^/]{6})[^/]+/, '$1…') + '   (étiquette ' + TAG + ')' + (EXIGER_VERT ? '   [--exiger-vert]' : ''));
  const h = await appel('GET', null, { test: '1' });
  t('le backend répond « online » (test=1), la redirection 302 est suivie', h.j.status === 'online', { statut: h.statut, rep: h.brut.slice(0, 100), err: h.err });
  if (h.j.status !== 'online') bloque('le backend ne répond pas « online »', h);

  /* sonde d'écriture : un petit compte fictif, avant les cas — si le stockage est plein ou l'autorisation perdue, on s'arrête ici, proprement, sans prétendre avoir testé */
  const sonde = compte('sonde'), s0 = O.seances(1, 3), rs = await envoyer(sonde, s0);
  if (!(rs.json && rs.j.status === 'ok')) bloque('la sonde d\'écriture (3 séances, compte fictif) n\'a pas été acceptée', rs);
  const ls = await lire(sonde);
  t('sonde d\'écriture : 3 séances écrites, 3 relues (le serveur de TEST écrit et lit ; ni quota plein, ni autorisation perdue)', ls.ok && ls.sessions.length === 3, { relues: ls.sessions.length, essais: ls.essais });
  if (!ls.ok || ls.sessions.length !== 3) bloque('la sonde n\'a pas été relue', { j: {}, statut: 0 });

  console.log('\n=== LES CAS DU PDF « P0 » § 4 — le Code.js du projet de TEST (même logique que la production), par HTTP ===');
  const lignes = []; let conformes = 0; const rougesVus = [];
  for (const c of O.CAS) {
    const { base, envoi } = c.faire(), email = compte(c.id.toLowerCase());
    const r0 = await envoyer(email, base);
    if (!(r0.json && r0.j.status === 'ok')) bloque('la graine du cas ' + c.id + ' n\'a pas été acceptée (base ' + base.length + ')', r0);
    const dep = await lire(email);
    const graine = dep.ok && dep.sessions.length === base.length;
    const r1 = await envoyer(email, envoi);
    const ap = await lire(email);
    const pred = O.predireActuel(base, envoi), j = O.juger(base, envoi, ap.sessions);
    const conforme = graine && ap.ok && r1.json && O.memes(ap.sessions, pred.apres);
    let i3 = true, detRejeu = '';
    if (c.rejeu) { await envoyer(email, envoi); const ap2 = await lire(email); i3 = ap2.ok && O.memes(ap2.sessions, ap.sessions); detRejeu = ' · rejeu : ' + ap2.sessions.length + ' (stable : ' + i3 + ')'; }
    const viole = !(j.i1 && j.i2 && j.i4) || !i3;
    if (viole) rougesVus.push(c.id); if (conforme) conformes++;
    const lecture = c.id + ' ' + c.nom + ' — base ' + base.length + ' → envoi ' + (envoi === undefined ? '(absent)' : envoi.length) + ' : ' + ap.sessions.length + ' en base après · ' + j.perdues + ' ancienne(s) perdue(s) · ' + j.nouvellesPerdues + ' neuve(s) perdue(s)' + detRejeu + ' [prévu : ' + pred.decision + ' ' + pred.apres.length + ']';
    t(lecture, conforme && (EXIGER_VERT ? !viole : viole === c.rouge), (viole ? 'ROUGE' : 'VERT') + (viole === c.rouge ? (viole ? ' (attendu aujourd\'hui)' : '') : ' ⚠️ INATTENDU : annoncé ' + (c.rouge ? 'rouge' : 'vert')) + (conforme ? '' : ' · ⚠️ le serveur n\'a PAS fait ce que la règle transcrite prédit') + (ap.essais > 1 ? ' · lecture refaite ' + ap.essais + ' fois' : ''));
    lignes.push({ id: c.id, nom: c.nom, base: base.length, envoi: envoi === undefined ? null : envoi.length, apres: ap.sessions.length, perdues: j.perdues, nouvellesPerdues: j.nouvellesPerdues, predit: pred.decision + ' ' + pred.apres.length, conforme, viole, rougeAttendu: c.rouge });
    await pause(400);
  }
  t('le serveur de TEST fait EXACTEMENT ce que la règle ACTUELLE transcrite prédit, sur les ' + O.CAS.length + ' cas', conformes === O.CAS.length, conformes + '/' + O.CAS.length);
  t('rouges vus = rouges annoncés (' + O.CAS.filter((c) => c.rouge).map((c) => c.id).join(', ') + ')', JSON.stringify(rougesVus.sort()) === JSON.stringify(O.CAS.filter((c) => c.rouge).map((c) => c.id).sort()) || EXIGER_VERT, rougesVus.sort());

  /* ── C12 : la VRAIE concurrence — deux appareils envoient en même temps (50 des plus récentes ; 50 + 1 neuve) sur une base de 79 ── */
  console.log('\n=== C12 — deux envois SIMULTANÉS sur une base de 79 (le vrai LockService de Google) ===');
  {
    const base = O.seances(1, 79), a = base.slice(-50), nv = O.seance(1, 'n'), b = a.concat([nv]), email = compte('c12');
    const r0 = await envoyer(email, base); if (!(r0.json && r0.j.status === 'ok')) bloque('la graine du cas 12 n\'a pas été acceptée', r0);
    const dep = await lire(email);
    const [ra, rb] = await Promise.all([envoyer(email, a), envoyer(email, b)]);
    const ap = await lire(email);
    const occupe = [ra, rb].some((r) => r.j && r.j.code === 'NUT_LOCK_BUSY');
    const jA = O.juger(base, a, ap.sessions), jB = O.juger(base, b, ap.sessions);
    const comme = O.memes(ap.sessions, a) ? 'la liste A (50)' : O.memes(ap.sessions, b) ? 'la liste B (50 + 1 neuve)' : 'AUTRE chose';
    const viole = !(jB.i1 && jB.i2 && jB.i4) || !(jA.i1 && jA.i4);
    t('C12 base 79, A = 50 des plus récentes, B = 50 + 1 neuve, envoyées en même temps : ' + ap.sessions.length + ' en base après (= ' + comme + ') · ' + jB.perdues + ' ancienne(s) perdue(s)' + (occupe ? ' · ⚠️ un envoi a reçu NUT_LOCK_BUSY' : ''),
      dep.sessions.length === 79 && ap.ok && !occupe && (comme !== 'AUTRE chose') && (EXIGER_VERT ? !viole : viole === true),
      (viole ? 'ROUGE' : 'VERT') + (viole ? ' (attendu aujourd\'hui : le dernier remplace l\'autre)' : '') + ' · réponses : ' + [ra, rb].map((r) => (r.j && (r.j.status || r.j.code)) || '?').join(', '));
    lignes.push({ id: 'C12', nom: 'deux envois simultanés (79)', base: 79, apres: ap.sessions.length, perdues: jB.perdues, viole, comme });
  }

  const med = lat.slice().sort((x, y) => x - y)[Math.floor(lat.length / 2)];
  console.log('\n   ℹ︎  ' + lat.length + ' requêtes · médiane ' + med + ' ms · max ' + Math.max.apply(null, lat) + ' ms');
  if (RAPPORT) { fs.writeFileSync(RAPPORT, JSON.stringify({ tag: TAG, exigerVert: EXIGER_VERT, requetes: lat.length, medianeMs: med, lignes, journal }, null, 1)); console.log('   rapport écrit : ' + RAPPORT); }
  console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE' + (EXIGER_VERT ? ' (mode --exiger-vert)' : ' (ici « ROUGE » = un défaut du TÉMOIN ; les rouges du CODE actuel sont comptés OK parce qu\'ils sont attendus)') + ' ────');
  process.exit(rouge ? 1 : 0);
})().catch((e) => { console.error('⛔ ' + (e && e.stack || e)); process.exit(2); });
