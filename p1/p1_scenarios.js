#!/usr/bin/env node
/* SCÉNARIOS P1 — LES SYNCHRONISATIONS NUTRITION CRITIQUES, PAR HTTP, SUR UN VRAI APPS SCRIPT DE TEST (comptes FICTIFS « …@example.invalid » seulement).
   Ce qu'ils prouvent que la simulation ne PEUT PAS prouver : le VRAI `LockService` sous les portées de `appsscript.json` (P1-01), la vraie concurrence (P1-05, vraies exécutions parallèles),
   le vrai stockage des propriétés sur un gros compte (P1-08), le vrai Drive de la zone de récupération (P1-07), la vraie redirection 302 + lecture de l'accusé.
   Ils sont d'abord VALIDÉS contre le serveur local à vrais processus (p1_shim_http.js) : tous verts, et P1-05 ROUGE quand le verrou ne verrouille plus rien (NUT_SANS_VERROU=1).
   Usage : node p1_scenarios.js <URL de l'exécutable /exec> [--rapport fichier.json] [--tag xyz] [--autoriser-production] [--suspendu]   (--suspendu = seulement P1-09, après avoir posé NUT_SUSPENDU)
   ⛔ Refuse l'adresse de PRODUCTION (AKfycbxWUsEFIlmx…) sans --autoriser-production. ⛔ N'écrit que des comptes « p1-…@example.invalid ». ⛔ Ne touche à aucune propriété (suspension : à la main, voir le rapport).
   Prérequis du projet de TEST : propriété `LECTURE_STRICTE` = `off` (sinon loadProfile refuse les comptes sans code : `needsCode`) — la fonction `preparerEssaiP1()` la pose. */
'use strict';
const crypto = require('crypto'), fs = require('fs');
const argv = process.argv.slice(2);
const URL_EXEC = argv.find((a) => /^https?:\/\//.test(a));
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const RAPPORT = opt('--rapport', null);
const TAG = opt('--tag', crypto.randomBytes(2).toString('hex'));
if (!URL_EXEC) { console.error('Usage : node p1_scenarios.js <URL /exec> [--rapport f.json] [--tag xyz] [--autoriser-production]'); process.exit(2); }
if (/AKfycbxWUsEFIlmx/.test(URL_EXEC) && !argv.includes('--autoriser-production')) { console.error('⛔ Cette adresse est celle de la PRODUCTION. Refus (ces scénarios écrivent des comptes fictifs et font des envois lourds). --autoriser-production pour passer outre, en connaissance de cause.'); process.exit(3); }

const journal = [], lat = [];
const t = (nom, cond, det) => { journal.push({ nom, ok: !!cond, det: det === undefined ? '' : det }); console.log((cond ? '   OK  ' : '❌ ROUGE ') + nom + (det !== undefined && det !== '' ? '   >> ' + String(typeof det === 'string' ? det : JSON.stringify(det)).slice(0, 360) : '')); };
const rid = () => 'rq' + crypto.randomBytes(8).toString('hex');
const compte = (nom) => 'p1-' + nom + '-' + TAG + '-' + crypto.randomBytes(3).toString('hex') + '@example.invalid';
const ligne = (nom, id) => ({ id, date: '2026-11-01', meal: 'dejeuner', name: nom, q: 100, u: 'g', kcal: 130, prot: 3, carbs: 28, fat: 1, ts: 1760000000000, per100: null, v: 1, saisie: 'liste', origine: 'reprise', n2: { s: 1, m: 'd', no: [], st: 'declaree' } });
const L = (tag, i) => ligne('Repas ' + tag + i + ' test', tag + String(i).padStart(4, '0') + '-' + String(10000000 + i));
const SEANCE = (d, vol) => ({ date: d, exs: [{ name: 'Squat (test)', sets: [{ kg: 100, reps: 5, done: true, type: 'normal' }] }], vol: vol || 500 });
const RECORDS = { 'Squat (test)': { rm1: 117, kg: 100, reps: 5, date: '2026-10-20' } };
const PESEES = [{ date: '2026-10-20', kg: 80.5 }, { date: '2026-10-27', kg: 80.1 }];
const FAV = (i) => ({ name: 'Favori fictif ' + i, kcal: 1 + i, prot: 1, carbs: 1, fat: 1 });
const v3 = (m, champs) => Object.assign({ action: 'saveProfile', email: m, foodLogV: 3, requestId: rid() }, champs);

async function appel(methode, corps, params) {
  const t0 = Date.now();
  const url = URL_EXEC + (params ? (URL_EXEC.includes('?') ? '&' : '?') + new URLSearchParams(params) : '');
  let txt = '', statut = 0, err = null;
  try {
    const r = await fetch(url, methode === 'POST' ? { method: 'POST', body: JSON.stringify(corps), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow' } : { redirect: 'follow' });
    statut = r.status; txt = await r.text();
  } catch (e) { err = String(e && e.message || e); }
  const ms = Date.now() - t0; lat.push(ms);
  let j = null; try { j = JSON.parse(txt); } catch (e) { /* page HTML : autorisation manquante, erreur Google… */ }
  return { j: j || {}, brut: txt, ms, statut, err, json: !!j };
}
const post = (c) => appel('POST', c);
const get = (p) => appel('GET', null, p);
async function lire(m) {
  const r = await get({ action: 'loadProfile', email: m });
  const j = r.j, p = j.profile || {};
  return { ok: j.status === 'ok', raison: r.json ? (j.error || j.status) : 'réponse non JSON : ' + r.brut.slice(0, 100), ids: (p.foodLog || []).map((l) => l.id).sort(), fav: (p.savedFoods || []).length,
    seances: (j.sessions || []).length, prs: j.prs || {}, pesees: (j.weightLog || p.weightLog || []).length, brut: j };
}
const memes = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const verrou = (r) => (r.j && (r.j.code === 'NUT_LOCK_BUSY')) ? 'NUT_LOCK_BUSY' : (!r.json ? 'réponse non JSON : ' + r.brut.slice(0, 120) : '');

(async () => {
  console.log('Scénarios P1 sur : ' + URL_EXEC.replace(/(\/s\/[^/]{6})[^/]+/, '$1…') + '   (étiquette ' + TAG + ')');
  if (argv.includes('--suspendu')) {
    /* ── P1-09 (à lancer APRÈS avoir posé la propriété NUT_SUSPENDU = 1 dans le projet de test) : tout envoi qui porte du Nutrition est refusé « suspendu » ; le reste est enregistré ── */
    const S = compte('s'), y1 = L('s', 1);
    const r9 = await post(v3(S, { foodLog: [y1], savedFoods: [FAV(1)], sessions: [SEANCE('2026-10-20')], prs: RECORDS, weightLog: PESEES, foodSupprimes: [] }));
    const s9 = await lire(S);
    t('P1-09 ⭐ SUSPENSION : un envoi à jour qui porte du Nutrition est refusé NUT_SUSPENDU (réessayable) ; la séance, le record et les pesées du même envoi SONT enregistrés ; aucun repas n\'est écrit',
      r9.j.code === 'NUT_SUSPENDU' && r9.j.retryable === true && s9.seances === 1 && s9.pesees === 2 && s9.ids.length === 0, { code: r9.j.code, retryable: r9.j.retryable, seances: s9.seances, pesees: s9.pesees, repas: s9.ids.length, rep: String(r9.brut).slice(0, 160) });
    rapport(); return;
  }
  const h = await get({ test: 1 });
  t('P1-00 le backend répond « online » (test=1), la redirection 302 est suivie', h.j.status === 'online', { statut: h.statut, rep: h.brut.slice(0, 120), err: h.err, ms: h.ms });
  if (h.j.status !== 'online') { console.log('\n⛔ le serveur ne répond pas comme un Apps Script déployé : on s\'arrête (autorisation du projet manquante ? déploiement absent ?)'); rapport(); return; }

  /* ── P1-01 : le VRAI LockService. Une première synchro à jour sur un compte neuf. Si le service de verrou est refusé par les portées, la réponse est NUT_LOCK_BUSY et RIEN n'est écrit. ── */
  const A = compte('a');
  const m1 = L('a', 1), m2 = L('a', 2), m3 = L('a', 3);
  const r1 = await post(v3(A, { foodLog: [m1, m2, m3], savedFoods: [FAV(1)], sessions: [SEANCE('2026-10-20')], prs: RECORDS, weightLog: PESEES, foodSupprimes: [] }));
  t('P1-01 ⭐ LE VRAI LockService : une synchro à jour est acceptée et accusée (ok:true, pas de NUT_LOCK_BUSY, 3 accusés), la durée de détention du verrou est rapportée',
    r1.j.ok === true && !verrou(r1) && r1.j.nut && (r1.j.nut.acks || []).length === 3 && typeof r1.j.lockMs === 'number', { ok: r1.j.ok, code: r1.j.code || verrou(r1), lockMs: r1.j.lockMs, acks: r1.j.nut && (r1.j.nut.acks || []).length, ms: r1.ms });
  const a1 = await lire(A);
  t('P1-02 la relecture redonne exactement ce qui a été envoyé : 3 repas, 1 favori, 1 séance, 1 record, 2 pesées', a1.ok && memes(a1.ids, [m1.id, m2.id, m3.id].sort()) && a1.fav === 1 && a1.seances === 1 && !!a1.prs['Squat (test)'] && a1.pesees === 2, { raison: a1.raison, ids: a1.ids.length, fav: a1.fav, seances: a1.seances, pesees: a1.pesees });

  /* ⛔ GARDE « PROJET PRÉPARÉ » — `preparerEssaiP1()` pose, DANS CET ORDRE, le dossier Drive de TEST (`ft_backup_drive_folder_id`) PUIS `LECTURE_STRICTE = off`. Si la relecture du compte qu'on vient d'enregistrer échoue,
     la préparation n'a pas été faite (ou pas terminée) : on S'ARRÊTE ICI, avant P1-07 / P1-08 qui écrivent sur Drive — sans la propriété du dossier, le serveur retomberait sur le dossier de PRODUCTION « ForceTracker-Backups », trouvé par son nom. */
  if (!a1.ok) {
    console.log('\n⛔ ARRÊT : le compte fictif qu\'on vient d\'enregistrer ne se relit pas (' + a1.raison + ') — le projet de TEST n\'est pas préparé. Lancer `preparerEssaiP1` dans l\'éditeur du projet de TEST, puis recommencer. Aucun scénario qui écrit sur Drive n\'a été joué.');
    rapport(); return;
  }

  /* ── P1-03 : idempotence — le même envoi rejoué (coupure réseau) rend le même accusé et n'écrit rien de plus ── */
  const rejeu = Object.assign({}, v3(A, { foodLog: [m1, m2, m3], foodSupprimes: [] }), { requestId: r1.j.requestId });
  const r3 = await post(rejeu);
  const a3 = await lire(A);
  t('P1-03 le MÊME envoi rejoué (même requestId) : accusé identique (deja:true), aucune écriture de plus (3 repas)', r3.j.ok === true && r3.j.nut && r3.j.nut.deja === true && a3.ids.length === 3, { ok: r3.j.ok, deja: r3.j.nut && r3.j.nut.deja, ids: a3.ids.length });

  /* ── P1-04 : une suppression voulue est durable — un appareil resté en retard ne la fait pas revenir ── */
  const r4a = await post(v3(A, { foodLog: [m1, m3], foodSupprimes: [{ i: m2.id, t: Date.now() }] }));
  const r4b = await post(v3(A, { foodLog: [m1, m2, m3], foodSupprimes: [] }));       // l'appareil en retard : il ne connaît pas la suppression
  const a4 = await lire(A);
  t('P1-04 ⭐ le repas supprimé NE REVIENT PAS quand un appareil en retard renvoie son ancienne liste (suppression durable côté serveur)', r4a.j.ok === true && !a4.ids.includes(m2.id) && a4.ids.includes(m1.id) && a4.ids.includes(m3.id), { r4a: r4a.j.ok, r4b: r4b.j.ok, ids: a4.ids });

  /* ── P1-05 : la VRAIE concurrence — N appareils envoient EN MÊME TEMPS ; chacun apporte un repas ; aucun ne doit disparaître (mise à jour perdue) ── */
  let pertes = 0, refus = 0, maxLock = 0, tours = 3, N = 8;
  for (let tour = 0; tour < tours; tour++) {
    const C = compte('c' + tour);
    const b1 = L('c' + tour + 'b', 1), b2 = L('c' + tour + 'b', 2);
    await post(v3(C, { foodLog: [b1, b2], foodSupprimes: [] }));
    const nouveaux = Array.from({ length: N }, (_, k) => L('c' + tour + 'n', k + 1));
    const rs = await Promise.all(nouveaux.map((n) => post(v3(C, { foodLog: [b1, b2, n], foodSupprimes: [] }))));
    refus += rs.filter((r) => r.j.ok !== true).length;
    rs.forEach((r) => { if (typeof r.j.lockMs === 'number') maxLock = Math.max(maxLock, r.j.lockMs); });
    const c = await lire(C);
    const attendus = [b1, b2].concat(nouveaux).map((x) => x.id).sort();
    pertes += attendus.filter((i) => !c.ids.includes(i)).length;
  }
  t('P1-05 ⭐ LA VRAIE CONCURRENCE : ' + tours + ' tours de ' + N + ' envois SIMULTANÉS sur un même compte — tous acceptés, AUCUN repas perdu (mise à jour perdue = 0)', refus === 0 && pertes === 0, { envoisRefuses: refus, repasPerdus: pertes, verrouTenuMaxMs: maxLock });

  /* ── P1-06 : un ANCIEN téléphone (sans foodLogV ni requestId) sur un compte à état v3 : son Nutrition est refusé, séances / records / pesées sont ENREGISTRÉS ── */
  const avant6 = await lire(A);
  const r6 = await post({ action: 'saveProfile', email: A, foodLog: [L('a', 90), L('a', 91)], sessions: [SEANCE('2026-10-20'), SEANCE('2026-10-27', 640)], prs: RECORDS, weightLog: PESEES.concat([{ date: '2026-11-03', kg: 79.9 }]) });
  const a6 = await lire(A);
  t('P1-06 ⭐ ancien téléphone sur un compte v3 : le journal ne bouge pas (Nutrition refusé), la 2ᵉ séance et la 3ᵉ pesée SONT enregistrées', memes(a6.ids, avant6.ids) && a6.seances === 2 && a6.pesees === 3, { journal: a6.ids.length + ' (avant ' + avant6.ids.length + ')', seances: a6.seances, pesees: a6.pesees, rep: String(r6.brut).slice(0, 140) });

  /* ── P1-07 : compte d'AVANT (jamais synchronisé à jour) : l'ancien envoi est toléré ; un journal plus COURT passe par la zone de récupération (Drive) sans erreur ; puis la 1ʳᵉ synchro à jour pose la porte ── */
  const B = compte('b');
  const x1 = L('b', 1), x2 = L('b', 2), x3 = L('b', 3);
  const r7a = await post({ action: 'saveProfile', email: B, foodLog: [x1, x2], sessions: [SEANCE('2026-10-20')], prs: RECORDS, weightLog: PESEES });
  const b7a = await lire(B);
  const r7b = await post({ action: 'saveProfile', email: B, foodLog: [x1], sessions: [SEANCE('2026-10-20')], prs: RECORDS, weightLog: PESEES });   // plus court : x2 part en zone de récupération (Drive)
  const b7b = await lire(B);
  const r7c = await post(v3(B, { foodLog: [x1, x3], foodSupprimes: [] }));
  const r7d = await post({ action: 'saveProfile', email: B, foodLog: [x1, x2, x3, L('b', 4)], sessions: [SEANCE('2026-10-20')], prs: RECORDS, weightLog: PESEES });   // ancien envoi APRÈS la porte
  const b7d = await lire(B);
  t('P1-07 ⭐ compte d\'avant : l\'ancien envoi est accepté, le journal plus court passe par la zone de récupération SANS erreur Drive (pas de NUT_ZONE_DRIVE) ; après la 1ʳᵉ synchro à jour, l\'ancien envoi est REFUSÉ pour le Nutrition',
    b7a.ids.length === 2 && b7b.ids.length === 1 && r7b.j.code !== 'NUT_ZONE_DRIVE' && r7c.j.ok === true && memes(b7d.ids, [x1.id, x3.id].sort()),
    { aprèsAncien: b7a.ids.length, aprèsCourt: b7b.ids.length, codeCourt: r7b.j.code || '', synchroÀJour: r7c.j.ok, aprèsPorte: b7d.ids.length, repAncienApresPorte: String(r7d.brut).slice(0, 120) });

  /* ── P1-08 : un GROS compte (500 repas, 300 suppressions déjà notées, 20 favoris) : le vrai stockage des propriétés l'accepte et le rend ── */
  const G = compte('g');
  const gros = Array.from({ length: 500 }, (_, i) => L('g', i + 1));
  const morts = Array.from({ length: 300 }, (_, k) => ({ i: 'gmort' + String(1000000 + k) + '-aaaa', t: 1 + k }));
  const r8 = await post(v3(G, { foodLog: gros, savedFoods: Array.from({ length: 20 }, (_, i) => FAV(i)), sessions: [SEANCE('2026-10-20')], prs: RECORDS, weightLog: PESEES, foodSupprimes: morts }));
  const g8 = await lire(G);
  const r8b = await post(v3(G, { foodLog: gros.concat([L('g', 501)]), foodSupprimes: morts }));
  const g8b = await lire(G);
  t('P1-08 ⭐ gros compte : 500 repas + 300 suppressions + 20 favoris acceptés (ok:true) ; relecture : 500 repas puis 501 après un ajout', r8.j.ok === true && g8.ids.length === 500 && g8.fav === 20 && r8b.j.ok === true && g8b.ids.length === 501, { ok: r8.j.ok, code: r8.j.code, repas: g8.ids.length, fav: g8.fav, apres: g8b.ids.length, msEnvoi: r8.ms, verrouMs: r8.j.lockMs });

  /* ── mesures ── */
  const tri = lat.slice().sort((a, b) => a - b); const pc = (p) => tri[Math.min(tri.length - 1, Math.floor(p * tri.length))];
  console.log('\n   mesures (information) : ' + lat.length + ' appels · latence médiane ' + pc(0.5) + ' ms · p95 ' + pc(0.95) + ' ms · max ' + tri[tri.length - 1] + ' ms ; verrou tenu au plus ' + maxLock + ' ms (alerte du serveur à 2 000 ms ; délai d\'attente du verrou : 20 000 ms)');
  console.log('   NON COUVERT par ces scénarios : la suspension NUT_SUSPENDU (elle se pose à la main dans les propriétés du script) et le miroir Supabase / le Worker (non concernés par Code.js).');
  rapport();
})().catch((e) => { console.error('PLANTAGE : ' + (e && e.stack || e)); process.exit(2); });

function rapport() {
  const ko = journal.filter((x) => !x.ok).length;
  console.log('\n──── ' + (journal.length - ko) + ' OK / ' + ko + ' rouge ────');
  if (RAPPORT) fs.writeFileSync(RAPPORT, JSON.stringify({ url: URL_EXEC.replace(/(\/s\/[^/]{6})[^/]+/, '$1…'), etiquette: TAG, ok: journal.length - ko, rouge: ko, appels: lat.length, journal }, null, 2));
  process.exit(ko ? 1 : 0);
}
