'use strict';
/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   🛡️ NUT-SYNC-02 PHASE A — CORRECTIONS DE SÉCURITÉ (02/11/2026, GO du Principal après son contrôle statique). Bloc : B-PA02. Banc : tools/banc_nut_phasea02.js · contrôle négatif : tools/mut_nut_phasea02.py
   Deux mécanismes remplacent la porte globale de la première version (qui refusait TOUS les anciens clients, partout, derrière une constante dont le contraire n'était pas un retour arrière sûr) :
     ① LA PORTE PAR COMPTE — un ancien client est toléré tant que le compte n'a AUCUN état v3, refusé dès qu'il en a un ; l'état v3 est PROUVÉ (un marqueur durable posé avec les données par la 1ʳᵉ synchro v3 appliquée, ou un registre, une mémoire d'opérations,
        une ligne révisée), jamais déclaré par le client ;
     ② LA SUSPENSION — la propriété de script `NUT_SUSPENDU` coupe TOUT le volet Nutrition (v3 comme ancien), sans redéploiement : rien n'est lu ni écrit côté Nutrition, aucun accusé, le reste du profil est enregistré, l'appareil garde ses opérations en attente.

   CONDUIT :
     · section S — le VRAI Code.js (vm Node, services Google simulés, compression réelle : `serveur()` de nut_secu_p1.js), par ses vraies portes `doPost`, en séquence, dans la mémoire — les DEUX ORDRES (ancien → nouveau, nouveau → ancien) ;
     · section D — DE VRAIS PROCESSUS serveur (tools/nut_serveur_proc.js), propriétés partagées, VRAI verrou entre processus : un ancien et un nouveau client lancés ENSEMBLE, une suppression contre un envoi ancien refusé, la suspension vue par tous les
        processus à la fois — avec le contrôle négatif du banc (processus dont le verrou ne verrouille rien : la perte DOIT apparaître) ;
     · section C — le VRAI client courant (suspension) ET le VRAI ancien client de production (révision publiée, ft-v1263, `no-cors`, jamais de lecture de réponse) dans des contextes navigateur indépendants, reliés à ces processus.
   OBSERVE : chaque réponse brute, le compte stocké (journal, registre, favoris, révision, mémoire des opérations, marqueur, zone de récupération), le journal du serveur, les écritures du compte, les corps réellement ENVOYÉS, le stockage et la mémoire de chaque appareil, les toasts.
   SIMULÉ : les services Google (propriétés en mémoire ou en fichiers, Drive en mémoire, verrou), le réseau, le miroir Supabase (un modèle du contrat de la migration 0003).
   NE COUVRE PAS : le vrai Apps Script déployé (le VRAI LockService et son autorisation, les vraies Script Properties, la latence Drive), le vrai Supabase, l'iPhone, une mise à jour automatique réelle de l'application chez un utilisateur — « NON TESTÉ » dans le rapport.
   ⛔⛔ DONNÉES INVENTÉES SEULEMENT (domaine example.test, repas « … test »). Aucune écriture hors des dossiers temporaires du banc. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const P1 = require('./nut_secu_p1.js');
const S2 = require('./nut_sync02.js');
const CL = require('./nut_sync02_clients.js');

/* `PA02_SEULEMENT=S,D,C` (liste) : ne rejouer que certaines sections (les mutations ne rejouent que ce dont elles ont besoin) ; absent = tout. */
const SECT = process.env.PA02_SEULEMENT || '';
const voulu = (x) => !SECT || SECT.split(',').indexOf(x) >= 0;
/* `PA02_BLOCS=PD10,PC20` (liste) : ne rejouer que certains blocs des sections D et C ; absent = tous. */
const BLOCS = process.env.PA02_BLOCS || '';
const bloc = (x) => !BLOCS || BLOCS.split(',').indexOf(x) >= 0;
const SUSPENSION = 'NUT_SUSPENDU';                                  // la propriété de script (voir `_nutSuspendu_`)

module.exports.ecran = async function ecran(t0, b, PORT, PORT_ANCIEN) {
  console.log('\n-- B-PA02. NUT-SYNC-02 phase A · corrections de sécurité · porte par compte · suspension · ancien ↔ nouveau, séquence et concurrence --');
  const O = S2.outils;
  const { canon, ligne, email, rid, mille, corps, lj, CODE_PERSO, pause, J, lancerPool, RACINE } = O;
  const t = (nom, cond, detail) => t0('B-PA02 ' + nom, cond, detail);
  /* Un témoin qui LÈVE une exception n'est ni un vert ni un abandon du banc : c'est un ROUGE nommé (un plantage du banc n'est jamais un verdict). Les témoins déjà évalués avant la levée restent comptés. */
  const garde = async (id, f) => { try { await f(); } catch (e) { t(id + ' ⛔ le témoin a levé une exception (' + String(e && e.message || e).slice(0, 100) + ')', false, String(e && e.stack || e).slice(0, 300)); } };
  const erreursGlobales = [];
  const env = (X, m, champs) => X.post(corps(m, Object.assign({ requestId: rid() }, champs)));                            // un envoi À JOUR : `foodLogV:3` + `requestId`
  const ancien = (X, m, champs) => X.post(Object.assign({ action: 'saveProfile', email: m, authCode: CODE_PERSO }, champs)); // un envoi d'AVANT : ni `foodLogV` ni `requestId`
  /* tout le volet Nutrition du compte, marqueur compris : l'identité octet pour octet de « avant » et « après » */
  const etatNut = (X, m) => { const c = X.lireCompte(m), p = c.profile; return canon({ fs: p.foodSupprimes, fl: p.foodLog, sf: p.savedFoods, nr: p.nutRev, no: p.nutOps, rn: c.recupNut, np: c.nutProto }); };
  const FAV = (nom) => ({ name: nom, kcal: 1, prot: 1, carbs: 1, fat: 1 });
  const L = (tag, n, o) => Array.from({ length: n }, (_, k) => ligne('Repas ' + tag + k, 'pb-' + tag + '-' + String(1000000 + k), o));
  const idsDe = (X, m) => (X.lireCompte(m).profile.foodLog || []).map((l) => l.id).sort();
  const tri = (a) => a.slice().sort();
  /* une séance par envoi : le serveur REMPLACE les séances par la liste reçue (jamais de fusion — Code.js, `body.sessions`) : trois envois qui portent chacun une séance différente n'en laissent qu'UNE, la dernière écrite. Les témoins qui lancent plusieurs envois ensemble
     envoient donc la MÊME séance ; chaque séance du banc a quand même sa date et son horodatage propres. */
  let nSeance = 0;
  const SEANCE = (id) => { nSeance++; return { id, ts: 1760000000000 + nSeance * 100000, date: '2026-11-' + String(1 + (nSeance % 27)).padStart(2, '0'), exs: [] }; };
  /* un refus explicite et complet du volet Nutrition : `nut_refuse`, `ok:false`, le code, le reste du profil enregistré, JAMAIS d'accusé */
  const refus = (r, code) => r.j.status === 'nut_refuse' && r.j.ok === false && r.j.code === code && r.j.profilEnregistre === true && !('nut' in r.j);

  /* ═══ S — le serveur, en mémoire ═══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
  if (voulu('S')) {

    /* ── 1. UN ANCIEN CLIENT RESTE COMPATIBLE tant que rien ne l'empêche : un compte SANS état v3 ── */
    await garde('PB01', async () => {
      const X = P1.serveur(); const m = email('tol'); X.compte(m, { code: CODE_PERSO });
      const l4 = L('t', 4);
      const r1 = ancien(X, m, { foodLog: l4.slice(0, 3), savedFoods: [FAV('F1')], weightLog: [{ date: '2026-11-02', kg: 80 }] });
      const r2 = ancien(X, m, { foodLog: l4 });
      const ids2 = idsDe(X, m);
      const r3 = ancien(X, m, { foodLog: l4.slice(1) });                                                          // un repas retiré par omission : la voie d'avant
      const c = X.lireCompte(m);
      t('PB01 ⭐⭐ un ANCIEN client sur un compte SANS état v3 reste COMPATIBLE : trois envois successifs (premier envoi, ajout, retrait par omission) sont tous acceptés et appliqués (`ok:true`, avec accusé comme avant), le journal du compte est la liste de l\'appareil à chaque fois, le repas retiré est gardé en zone de récupération (P1) — et aucun envoi ancien ne pose de marqueur (il ne prouve jamais un état v3)',
        r1.j.ok === true && r2.j.ok === true && r3.j.ok === true && J(ids2) === J(tri(l4.map((l) => l.id))) && J(idsDe(X, m)) === J(tri(l4.slice(1).map((l) => l.id))) && ((c.recupNut || {}).foodLog || []).length > 0 && c.nutProto === undefined && O.canon(c.weightLog) === O.canon([{ date: '2026-11-02', kg: 80 }]), J({ r: [r1.j.ok, r2.j.ok, r3.j.ok], np: c.nutProto }));
      t('PB01b ⭐ chaque envoi ancien toléré est JOURNALISÉ (version reçue, compte sans état v3 — que des nombres, aucune adresse ni donnée) et aucun n\'est « refusé »',
        X.journal.filter((l) => /\[FT COMPAT\] ancien client toléré : version 0, compte sans état v3/.test(l)).length === 3 && !X.journal.some((l) => /Nutrition refusée/.test(l)) && !X.journal.some((l) => /example\.test/.test(l)), J(X.journal.filter((l) => /FT COMPAT/.test(l))));
    });

    /* ── 2. LES DEUX ORDRES, de bout en bout : ancien → nouveau → ancien → mise à jour ── */
    await garde('PB02', async () => {
      const X = P1.serveur(); const m = email('cycle'); X.compte(m, { code: CODE_PERSO });
      const [A, B, C, D, E] = ['A', 'B', 'C', 'D', 'E'].map((n) => ligne('Repas ' + n, 'pb-cy-' + n + '0000001'));
      const r1 = ancien(X, m, { foodLog: [A, B, C] });                                                            // 1. l'appareil O (ancien) : A B C
      const idsApres1 = idsDe(X, m); const np1 = X.lireCompte(m).nutProto;
      const r2 = env(X, m, { foodLog: [A, C, D], foodSupprimes: [{ i: B.id, t: 5 }] });                           // 2. l'appareil N (à jour) : supprime B, ajoute D
      const c2 = X.lireCompte(m);
      t('PB02 ⭐⭐⭐ ORDRE « ANCIEN → NOUVEAU » : l\'ancien appareil écrit d\'abord (toléré, aucun marqueur) ; l\'appareil à jour synchronise ensuite sur ses données : sa suppression est INSCRITE (accusée), son repas neuf ajouté, et le compte porte désormais le marqueur de protocole 3',
        r1.j.ok === true && J(idsApres1) === J(tri([A.id, B.id, C.id])) && np1 === undefined && r2.j.ok === true && J(r2.j.nut.tomb.ok) === J([B.id]) && J(idsDe(X, m)) === J(tri([A.id, C.id, D.id])) && c2.nutProto === 3 && (c2.profile.foodSupprimes || []).some((e) => e.i === B.id), r2.t.slice(0, 200));
      const avant = etatNut(X, m);
      const r3 = ancien(X, m, { foodLog: [A, B, C, E], weightLog: [{ date: '2026-11-03', kg: 79 }], sessions: [SEANCE('pb-cy-s1')] });   // 3. O, qui a encore B ET un repas neuf E : son volet Nutrition est refusé en entier (le reste de l'envoi est enregistré)
      const c3 = X.lireCompte(m);
      t('PB02b ⭐⭐⭐ … puis ORDRE « NOUVEAU → ANCIEN » : l\'ancien appareil, qui renvoie le repas supprimé B et un repas neuf E, voit son VOLET Nutrition REFUSÉ EXPLICITEMENT ET EN ENTIER (`NUT_CLIENT_INCOMPATIBLE`, pas d\'accusé) — B ne ressuscite PAS, rien n\'est écrasé, E n\'est pas annoncé « enregistré » (il reste sur son téléphone) — et sa pesée et sa séance, elles, SONT enregistrées',
        refus(r3, 'NUT_CLIENT_INCOMPATIBLE') && r3.j.retryable === false && etatNut(X, m) === avant && !idsDe(X, m).includes(B.id) && !idsDe(X, m).includes(E.id) && (c3.sessions || []).some((s) => s.id === 'pb-cy-s1') && (c3.weightLog || []).some((w) => w.date === '2026-11-03'), r3.t.slice(0, 200));
      const r4 = env(X, m, { foodLog: [A, B, C, E] });                                                            // 4. O se met à jour : il renvoie son journal tel quel (B y est encore, il ne connaît pas le registre)
      const ids4 = idsDe(X, m);
      t('PB02c ⭐⭐⭐ … et quand l\'ancien appareil se met à jour, la transition s\'ACHÈVE sans perte ni résurrection : E (la saisie refusée) arrive, B reste supprimé (le registre du compte le protège), D (saisi par l\'autre appareil) est toujours là',
        r4.j.ok === true && J(ids4) === J(tri([A.id, C.id, D.id, E.id])) && (X.lireCompte(m).profile.foodSupprimes || []).some((e) => e.i === B.id), J({ ids4 }));
    });
    await garde('PB02d', async () => {
      const X = P1.serveur(); const m = email('cyc2'); X.compte(m, { code: CODE_PERSO });
      const [A, B, C] = ['A', 'B', 'C'].map((n) => ligne('Repas ' + n, 'pb-c2-' + n + '0000001'));
      const r1 = env(X, m, { foodLog: [A, B] });                                                                  // l'appareil à jour écrit EN PREMIER, sur un compte neuf (ses lignes sont stampées révision 1)
      const avant = etatNut(X, m);
      const r2 = ancien(X, m, { foodLog: [A, B, C] });                                                            // l'ancien appareil, avec un repas neuf C
      const intact = etatNut(X, m) === avant;                                                                     // l'état Nutrition juste après le refus, AVANT la mise à jour de l'ancien appareil
      const r3 = env(X, m, { foodLog: [A, B, C] });                                                               // … puis il se met à jour
      t('PB02d ⭐⭐ ORDRE « NOUVEAU → ANCIEN » sur un compte NEUF : le premier envoi à jour suffit à armer la porte — l\'ancien appareil qui suit est REFUSÉ (rien écrit, C n\'est pas annoncé enregistré), et C arrive dès sa mise à jour',
        r1.j.ok === true && refus(r2, 'NUT_CLIENT_INCOMPATIBLE') && intact && r3.j.ok === true && J(idsDe(X, m)) === J(tri([A.id, B.id, C.id])), r2.t.slice(0, 160));
    });

    /* ── 3. LE COMPTE v3 QUI N'A FAIT AUCUNE OPÉRATION : seul le marqueur le prouve ── */
    await garde('PB03', async () => {
      const X = P1.serveur(); const m = email('noop'); X.compte(m, { code: CODE_PERSO });
      const base = L('n', 5);
      ancien(X, m, { foodLog: base });                                                                            // le journal d'un ancien appareil : 5 repas, aucune révision
      const r = env(X, m, { foodLog: base, savedFoods: [], foodSupprimes: [] });                                  // la 1ʳᵉ synchro à jour ne change RIEN
      const c = X.lireCompte(m), p = c.profile;
      const aucuneTrace = (p.foodSupprimes || []).length === 0 && (p.nutOps || []).length === 0 && !(p.foodLog || []).some((l) => l.rev > 0);
      t('PB03 ⭐ précondition de ce témoin (sinon il ne prouve rien) : après une synchro à jour qui ne change rien, le compte ne porte AUCUNE trace dans ses données — ni registre, ni mémoire d\'opérations, ni ligne révisée — et son SEUL signe est le marqueur (protocole 3)',
        r.j.ok === true && aucuneTrace && c.nutProto === 3 && (p.foodLog || []).length === 5, J({ ok: r.j.ok, aucuneTrace, np: c.nutProto }));
      const avant = etatNut(X, m);
      const rO = ancien(X, m, { foodLog: base.slice(0, 2) });                                                     // un ancien appareil PÉRIMÉ (2 repas sur 5) tente d'écraser
      t('PB03b ⭐⭐⭐ un compte à état v3 qui n\'a fait AUCUNE suppression ni modification est reconnu quand même : l\'ancien appareil périmé est REFUSÉ, le journal garde ses 5 repas, rien n\'est copié en zone ni retiré (sans le marqueur, ce compte serait indiscernable d\'un compte d\'avant)',
        refus(rO, 'NUT_CLIENT_INCOMPATIBLE') && idsDe(X, m).length === 5 && etatNut(X, m) === avant, rO.t.slice(0, 160));
      /* ce que coûte la TOLÉRANCE, mesuré et dit : sur un compte SANS état v3 le même envoi périmé est accepté (comme en production aujourd'hui) — le journal est remplacé, mais rien n'est perdu : les 3 repas retirés sont en zone de récupération */
      const Y = P1.serveur(); const my = email('tole'); Y.compte(my, { code: CODE_PERSO });
      ancien(Y, my, { foodLog: base });
      const rT = ancien(Y, my, { foodLog: base.slice(0, 2) });
      const zone = ((Y.lireCompte(my).recupNut || {}).foodLog || []);
      t('PB03c (LIMITE ÉCRITE, mesurée) sur un compte SANS aucune preuve d\'état v3, le même envoi périmé est TOLÉRÉ (la voie de la production d\'avant) : le journal est remplacé par la liste de l\'appareil (2 repas) mais les 3 repas retirés sont GARDÉS en zone de récupération — rien n\'est perdu, c\'est le prix de la compatibilité',
        rT.j.ok === true && idsDe(Y, my).length === 2 && base.slice(2).every((l) => zone.some((z) => (z.l ? z.l.id : z.id) === l.id || J(z).indexOf(l.id) >= 0)), J({ z: zone.length }));
    });

    /* ── 4. UN ENVOI QUI SE DIT « À JOUR » SANS POUVOIR LIRE D'ACCUSÉ est refusé PARTOUT ── */
    await garde('PB04', async () => {
      const cas = [
        ['foodLogV:3 SANS requestId', { foodLogV: 3 }],
        ['foodLogV:3 avec un requestId trop court', { foodLogV: 3, requestId: 'court' }],
        ['foodLogV:3 avec un requestId trop long (65)', { foodLogV: 3, requestId: 'a'.repeat(65) }],
        ['foodLogV:3 avec un requestId aux caractères interdits', { foodLogV: 3, requestId: 'id avec espaces!' }],
        ['foodLogV:4 SANS requestId', { foodLogV: 4 }],
      ];
      const res = cas.map(([nom, ch], k) => {
        const X = P1.serveur(); const m = email('mal'); X.compte(m, { code: CODE_PERSO });                          // un compte SANS état v3 : la voie ancienne y est tolérée…
        const avant = etatNut(X, m);
        const r = X.post(Object.assign({ action: 'saveProfile', email: m, authCode: CODE_PERSO, foodLog: [ligne('M' + k, 'pb-ma-' + (1000000 + k))] }, ch));
        return { nom, ok: refus(r, 'NUT_CLIENT_INCOMPATIBLE') && etatNut(X, m) === avant, rep: r.t.slice(0, 80) };      // … mais PAS celui-ci : il se dit à jour sans pouvoir lire l'accusé
      });
      t('PB04 ⭐⭐ un envoi qui se dit à jour (`foodLogV` ≥ 3) SANS `requestId` valide (absent, trop court, trop long, caractères interdits) est refusé PARTOUT, même sur un compte sans état v3 : il ne pourrait pas lire d\'accusé — rien n\'est écrit, aucun marqueur',
        res.every((x) => x.ok), J(res.filter((x) => !x.ok)));
      const X = P1.serveur(); const m = email('v2'); X.compte(m, { code: CODE_PERSO });
      const rv2 = X.post({ action: 'saveProfile', email: m, authCode: CODE_PERSO, foodLogV: 2, requestId: rid(), foodLog: [ligne('V2', 'pb-v2-00000001')] });
      t('PB04b ⭐ une version INFÉRIEURE à 3 (1 ou 2, même avec un `requestId`) est un client d\'avant : sur un compte sans état v3 il est toléré comme tel, sans marqueur',
        rv2.j.ok === true && X.lireCompte(m).nutProto === undefined && idsDe(X, m).length === 1, rv2.t.slice(0, 120));
    });

    /* ── 5. QUI PROUVE L'ÉTAT v3 ? Chaque preuve seule, puis les non-preuves ── */
    await garde('PB05', async () => {
      /* un compte RÉEL (une vraie synchro à jour, une vraie modification) réduit à UNE seule preuve : les formes viennent du serveur, pas du test */
      const reduit = (garder) => {
        const X = P1.serveur(); const m = email('pr'); X.compte(m, { code: CODE_PERSO });
        env(X, m, { foodLog: [ligne('R', 'pb-ev-00000001'), ligne('S', 'pb-ev-00000002')], foodSupprimes: [{ i: 'pb-ev-00000009', t: 3 }] });
        env(X, m, { foodLog: [ligne('R', 'pb-ev-00000001', { rev: 1, kcal: 150 }), ligne('S', 'pb-ev-00000002', { rev: 1 })] });   // une modification : zone de récupération, mémoire d'opérations, révisions
        const c = X.lireCompte(m), p = c.profile;
        if (garder !== 'zone') delete c.recupNut;
        if (garder !== 'marqueur') delete c.nutProto; else c.nutProto = 3;
        if (garder !== 'registre') delete p.foodSupprimes;
        if (garder !== 'ops') delete p.nutOps;
        if (garder !== 'rev') (p.foodLog || []).forEach((l) => { delete l.rev; delete l.modifiedAt; });
        p.nutRev = 7;                                                                                              // la révision du compte reste TOUJOURS : une écriture ancienne la fait aussi monter, ce n'est pas une preuve
        X.ctx.saveUserData_(m, c);
        return { X, m };
      };
      const cas = [['le marqueur seul', 'marqueur', true], ['le registre des suppressions seul', 'registre', true], ['la mémoire des opérations seule', 'ops', true], ['une ligne déjà révisée seule', 'rev', true],
        ['AUCUNE preuve (la révision du compte `nutRev` seule — une écriture ancienne la fait monter)', 'rien', false], ['la zone de récupération seule (la voie ancienne en écrit aussi)', 'zone', false]];
      const res = cas.map(([nom, garder, doitRefuser]) => {
        const { X, m } = reduit(garder);
        const avant = etatNut(X, m);
        const r = ancien(X, m, { foodLog: [ligne('Neuf ancien', 'pb-ev-00000050')] });
        const tolere = r.j.ok === true && idsDe(X, m).includes('pb-ev-00000050');
        return { nom, ok: doitRefuser ? (refus(r, 'NUT_CLIENT_INCOMPATIBLE') && etatNut(X, m) === avant) : tolere, rep: r.t.slice(0, 90) };
      });
      t('PB05 ⭐⭐ QUI PROUVE L\'ÉTAT v3 — sur des comptes réels réduits à UNE preuve : le marqueur, le registre, la mémoire des opérations OU une ligne révisée suffit à refuser un ancien envoi (rien n\'est écrit) ; ni la révision du compte (`nutRev`) ni la zone de récupération ne suffisent — l\'envoi ancien est toléré',
        res.every((x) => x.ok), J(res.filter((x) => !x.ok)));
      const bizarres = [['une valeur sous le minimum (2)', 2], ['du texte', 'abc'], ['un nombre négatif', -3], ['null', null], ['un objet', { v: 3 }], ['un booléen', true], ['0', 0]];
      const res2 = bizarres.map(([nom, v]) => {
        const X = P1.serveur(); const m = email('biz'); X.compte(m, { code: CODE_PERSO });
        const c = X.lireCompte(m); c.nutProto = v; X.ctx.saveUserData_(m, c);
        let r; try { r = ancien(X, m, { foodLog: [ligne('Neuf', 'pb-bz-00000001')] }); } catch (e) { return { nom, ok: false, rep: 'exception ' + e.message }; }
        return { nom, ok: r.j.ok === true && idsDe(X, m).includes('pb-bz-00000001'), rep: r.t.slice(0, 80) };
      });
      t('PB05b ⭐ un marqueur ILLISIBLE ou sous le minimum (2, du texte, un négatif, null, un objet, un booléen, 0) ne prouve rien et ne fait rien planter : le compte reste « sans état v3 », l\'envoi ancien est toléré',
        res2.every((x) => x.ok), J(res2.filter((x) => !x.ok)));
    });

    /* ── 6. LA DURABILITÉ : une transition n'est confirmée qu'une fois écrite ── */
    await garde('PB06', async () => {
      let panne = false;
      const X = P1.serveur({ panne: (k) => panne && /^u_/.test(k) });
      const m = email('dur'); X.compte(m, { code: CODE_PERSO });
      const RQ = rid(); const ch = { foodLog: [ligne('Dur A', 'pb-du-00000001')], requestId: RQ };
      panne = true;
      const r1 = X.post(corps(m, ch));                                                                            // l'écriture du compte échoue
      panne = false;
      const a1 = X.lireCompte(m);
      t('PB06 ⭐⭐⭐ DURABILITÉ : quand l\'écriture du compte échoue pendant la 1ʳᵉ synchro à jour, il n\'y a NI accusé NI « ok » (l\'appareil garde tout en attente), NI marqueur, et le compte est inchangé — la transition n\'est jamais annoncée avant d\'être écrite',
        r1.j.ok !== true && !('nut' in r1.j) && a1.nutProto === undefined && (a1.profile.foodLog || []).length === 0 && (a1.profile.nutOps || []).length === 0, r1.t.slice(0, 160));
      const n0 = X.ecritures.length;
      const r2 = X.post(corps(m, ch));                                                                            // le MÊME envoi, rejoué après la panne
      const nU = X.ecritures.slice(n0).filter((k) => /^u_/.test(k)).length;
      const a2 = X.lireCompte(m);
      t('PB06b ⭐⭐ … le même envoi rejoué après la panne est APPLIQUÉ (pas un faux « déjà reçu »), accusé, et le marqueur ET les données sont dans la MÊME écriture du compte (une seule écriture : durables ensemble ou pas du tout)',
        r2.j.ok === true && r2.j.nut && r2.j.nut.deja !== true && a2.nutProto === 3 && idsDe(X, m).includes('pb-du-00000001') && nU === 1, J({ nU, deja: r2.j.nut && r2.j.nut.deja }));
      const n1 = X.ecritures.length;
      const r3 = X.post(corps(m, ch));                                                                            // et un REJEU n'écrit pas deux fois le marqueur ni la donnée
      t('PB06c ⭐ le rejeu d\'un envoi déjà appliqué rend le MÊME accusé (`deja:true`), n\'ajoute aucune ligne et laisse le marqueur à 3',
        r3.j.ok === true && r3.j.nut && r3.j.nut.deja === true && idsDe(X, m).length === 1 && X.lireCompte(m).nutProto === 3, r3.t.slice(0, 120) + ' ' + (X.ecritures.length - n1));
    });

    /* ── 7. LE MARQUEUR N'EST JAMAIS POSÉ PAR UN ENVOI QUI N'A PAS ÉTÉ APPLIQUÉ ── */
    await garde('PB07', async () => {
      const cas = [];
      { const X = P1.serveur(); const m = email('m1'); X.compte(m, { code: CODE_PERSO }); X.props[SUSPENSION] = '1';
        const r = env(X, m, { foodLog: [ligne('S', 'pb-mq-00000001')] }); cas.push({ nom: 'envoi à jour pendant une suspension', ok: r.j.code === 'NUT_SUSPENDU' && X.lireCompte(m).nutProto === undefined }); }
      { const V = { tenu: true }; const X = P1.serveur({ LockService: { getScriptLock: () => ({ tryLock: () => !V.tenu, waitLock() {}, releaseLock() {}, hasLock: () => false }) } }); const m = email('m2'); X.ctx.saveUserData_(m, { email: m, profile: { name: 'N' }, prs: {}, sessions: [] });
        { const salt = 'abcd1234abcd1234'; X.props['auth_' + m] = salt + '$' + X.ctx._sha256hex_(salt + '|' + CODE_PERSO); }
        const r = env(X, m, { foodLog: [ligne('S', 'pb-mq-00000002')] }); cas.push({ nom: 'verrou occupé', ok: r.j.code === 'NUT_LOCK_BUSY' && r.j.retryable === true && X.lireCompte(m).nutProto === undefined && idsDe(X, m).length === 0 }); }
      { const X = P1.serveur(); const m = email('m3'); X.compte(m, { code: CODE_PERSO }); X.ctx._nutSynchroniser_ = function () { throw new TypeError('faute simulée dans le bloc Nutrition'); };
        const r = env(X, m, { foodLog: [ligne('S', 'pb-mq-00000003')], weightLog: [{ date: '2026-11-02', kg: 70 }] }); cas.push({ nom: 'erreur imprévue confinée (NUT_INTERNE)', ok: r.j.code === 'NUT_INTERNE' && r.j.retryable === true && X.lireCompte(m).nutProto === undefined && (X.lireCompte(m).weightLog || []).length === 1 }); }
      { const X = P1.serveur(); const m = email('m4'); X.compte(m, { code: CODE_PERSO });
        const r = X.post({ action: 'saveProfile', email: m, authCode: CODE_PERSO, foodLogV: 3, foodLog: [ligne('S', 'pb-mq-00000004')] }); cas.push({ nom: 'envoi « à jour » sans requestId', ok: r.j.code === 'NUT_CLIENT_INCOMPATIBLE' && X.lireCompte(m).nutProto === undefined }); }
      { const X = P1.serveur(); const m = email('m5'); X.compte(m, { code: CODE_PERSO });
        const r = ancien(X, m, { foodLog: [ligne('S', 'pb-mq-00000005')] }); cas.push({ nom: 'envoi ancien toléré', ok: r.j.ok === true && X.lireCompte(m).nutProto === undefined }); }
      { const X = P1.serveur(); const m = email('m6'); X.compte(m, { code: CODE_PERSO });
        const r = env(X, m, { weightLog: [{ date: '2026-11-02', kg: 70 }] }); cas.push({ nom: 'envoi à jour SANS aucun champ Nutrition (rien à appliquer)', ok: r.j.ok === true && X.lireCompte(m).nutProto === undefined }); }
      t('PB07 ⭐⭐ le marqueur de protocole n\'est posé QUE par une synchro à jour dont le volet a été APPLIQUÉ : jamais par un envoi suspendu, refusé faute de verrou, tombé en erreur confinée, « à jour » sans accusé possible, ancien toléré, ni par un envoi sans Nutrition',
        cas.every((x) => x.ok), J(cas.filter((x) => !x.ok)));
      const Y = P1.serveur(); const my = email('m7'); Y.compte(my, { code: CODE_PERSO });
      const ry = env(Y, my, { foodLog: [], savedFoods: [], foodSupprimes: [] });                                  // une synchro à jour de l'appareil VIDE : appliquée, même sans rien changer
      t('PB07b ⭐ … en revanche une synchro à jour APPLIQUÉE pose le marqueur même quand elle ne change rien (journal et favoris vides) : le compte a un appareil à jour, la porte doit le savoir',
        ry.j.ok === true && Y.lireCompte(my).nutProto === 3, ry.t.slice(0, 120));
    });

    /* ── 8. LE MARQUEUR NE RECULE JAMAIS et reste borné ── */
    await garde('PB08', async () => {
      const X = P1.serveur(); const m = email('mono'); X.compte(m, { code: CODE_PERSO });
      env(X, m, { foodLogV: 4, foodLog: [ligne('V4', 'pb-mo-00000001')] });
      const n4 = X.lireCompte(m).nutProto;
      env(X, m, { foodLog: [ligne('V3', 'pb-mo-00000002')] });
      const n3 = X.lireCompte(m).nutProto;
      env(X, m, { foodLogV: 1000000, foodLog: [ligne('Enorme', 'pb-mo-00000003')] });
      const nG = X.lireCompte(m).nutProto;
      t('PB08 le marqueur ne RECULE jamais (un client en version 4 puis un en version 3 : il reste à 4) et reste BORNÉ (une version absurde — 1 000 000 — le plafonne à 99)',
        n4 === 4 && n3 === 4 && nG === 99, J({ n4, n3, nG }));
    });

    /* ── 9. LA SUSPENSION ── */
    await garde('PB09', async () => {
      const X = P1.serveur(); const m = email('susp'); X.compte(m, { code: CODE_PERSO });
      env(X, m, { foodLog: [ligne('Base', 'pb-su-00000001'), ligne('Base2', 'pb-su-00000002')], foodSupprimes: [{ i: 'pb-su-00000009', t: 5 }] });
      env(X, m, { foodLog: [ligne('Base', 'pb-su-00000001', { rev: 1, kcal: 150 }), ligne('Base2', 'pb-su-00000002', { rev: 1 })] });
      const avant = etatNut(X, m);
      X.props[SUSPENSION] = '1';
      const RQ = rid();
      const r = X.post(corps(m, { requestId: RQ, foodLog: [ligne('Pendant', 'pb-su-00000010')], foodSupprimes: [{ i: 'pb-su-00000002', t: 9 }], weightLog: [{ date: '2026-11-02', kg: 82 }], prs: { Squat: { rm1: 120, kg: 100, reps: 5, date: '2026-11-02' } }, sessions: [SEANCE('pb-su-s1')] }));
      const c = X.lireCompte(m);
      t('PB09 ⭐⭐⭐ SUSPENSION : un envoi à jour pendant la suspension est refusé EXPLICITEMENT — { status:\'nut_refuse\', ok:false, code:\'NUT_SUSPENDU\', retryable:true, profilEnregistre:true } avec SON requestId, jamais d\'accusé — et RIEN de Nutrition n\'est lu ni écrit : registre, journal, favoris, révision, mémoire des opérations, marqueur ET zone de récupération sont identiques octet pour octet',
        refus(r, 'NUT_SUSPENDU') && r.j.retryable === true && r.j.requestId === RQ && etatNut(X, m) === avant, r.t.slice(0, 220));
      t('PB09b ⭐⭐ … et le reste du MÊME envoi est ENREGISTRÉ (règle d\'or n°3 : une séance, un record, une pesée ne dépendent jamais du Nutrition) ; la suspension est journalisée sans donnée ni adresse',
        (c.sessions || []).some((s) => s.id === 'pb-su-s1') && c.prs.Squat && c.prs.Squat.kg === 100 && (c.weightLog || []).some((w) => w.date === '2026-11-02') && X.journal.some((l) => /\[FT SUSPENSION\]/.test(l)) && !X.journal.some((l) => /example\.test/.test(l)), J({ s: (c.sessions || []).length }));
      /* l'ANCIEN client, lui non plus, ne contourne pas la suspension — sur un compte sans état v3 (où il serait toléré) comme sur un compte à état v3 */
      const Y = P1.serveur(); const my = email('susp0'); Y.compte(my, { code: CODE_PERSO }); Y.props[SUSPENSION] = 'oui';
      const avantY = etatNut(Y, my);
      const rY = ancien(Y, my, { foodLog: [ligne('Ancien', 'pb-su-00000020')], savedFoods: [FAV('Fav')], weightLog: [{ date: '2026-11-02', kg: 77 }] });
      t('PB09c ⭐⭐⭐ l\'ANCIEN client ne contourne pas la suspension : sur un compte SANS état v3 (où il serait toléré) son volet Nutrition est refusé aussi (`NUT_SUSPENDU`), le journal reste intact — et sa pesée est enregistrée',
        refus(rY, 'NUT_SUSPENDU') && etatNut(Y, my) === avantY && (Y.lireCompte(my).weightLog || []).length === 1, rY.t.slice(0, 160));
      const rX = ancien(X, m, { foodLog: [ligne('Ancien', 'pb-su-00000021')] });
      t('PB09d … et sur un compte à état v3 c\'est la suspension qui répond (réessayable), pas l\'incompatibilité : le compte reste identique',
        refus(rX, 'NUT_SUSPENDU') && rX.j.retryable === true && etatNut(X, m) === avant, rX.t.slice(0, 120));
      /* TOUTES les formes d'envoi qui portent du Nutrition sont suspendues ; celles qui n'en portent pas ne le sont pas */
      const formes = [['journal seul', { foodLog: [ligne('F', 'pb-su-00000030')] }, true], ['favoris seuls', { savedFoods: [FAV('Fav seul')] }, true], ['suppressions seules', { foodSupprimes: [{ i: 'pb-su-00000031', t: 4 }] }, true],
        ['journal vide', { foodLog: [] }, true], ['pesée seule', { weightLog: [{ date: '2026-11-04', kg: 83 }] }, false], ['séance seule', { sessions: [SEANCE('pb-su-s2')] }, false]];
      const resF = formes.map(([nom, ch, suspendu]) => {
        const rr = env(X, m, ch);
        return { nom, ok: suspendu ? (refus(rr, 'NUT_SUSPENDU') && etatNut(X, m) === avant) : (rr.j.ok === true), rep: rr.t.slice(0, 80) };
      });
      t('PB09e ⭐⭐ TOUTES les formes d\'envoi qui portent du Nutrition (journal, journal vide, favoris, suppressions) sont suspendues, rien n\'est écrit ; une pesée seule ou une séance seule passe normalement (`ok:true`)',
        resF.every((x) => x.ok), J(resF.filter((x) => !x.ok)));
    });
    await garde('PB10', async () => {
      const X = P1.serveur(); const m = email('val'); X.compte(m, { code: CODE_PERSO });
      let k = 0;
      const essai = (v) => {
        if (v === null) delete X.props[SUSPENSION]; else X.props[SUSPENSION] = v;
        const r = env(X, m, { foodLog: [ligne('V' + k, 'pb-va-' + String(1000000 + (k++)))] });
        return r.j.code === 'NUT_SUSPENDU' ? 'suspendu' : (r.j.ok === true ? 'actif' : 'autre:' + r.t.slice(0, 60));
      };
      const attendu = [[null, 'actif'], ['', 'actif'], ['  ', 'actif'], ['0', 'actif'], ['false', 'actif'], ['FALSE', 'actif'], [' Off ', 'actif'], ['non', 'actif'], ['no', 'actif'],
        ['1', 'suspendu'], ['true', 'suspendu'], ['oui', 'suspendu'], ['on', 'suspendu'], [' 1 ', 'suspendu'], ['maintenance', 'suspendu'], ['x', 'suspendu']];
      const res = attendu.map(([v, att]) => ({ v, att, vu: essai(v) })).filter((x) => x.vu !== x.att);
      t('PB10 ⭐ LA PROPRIÉTÉ `NUT_SUSPENDU`, par ses effets : absente, vide, `0`, `false`, `non`, `no`, `off` (toutes casses, espaces autour) = ACTIF ; toute autre valeur (`1`, `true`, `oui`, `on`, un mot…) = SUSPENDU — instantané, sans redéploiement',
        res.length === 0, J(res));
      /* l'EN CAS DE DOUTE : la lecture de la propriété échoue → SUSPENDU, jamais actif */
      const sp0 = X.ctx.PropertiesService.getScriptProperties();
      const faux = Object.assign({}, sp0, { getProperty: (cle) => { if (cle === SUSPENSION) throw new Error('lecture impossible (panne simulée)'); return sp0.getProperty(cle); } });
      X.ctx.PropertiesService = { getScriptProperties: () => faux };
      delete X.props[SUSPENSION];
      const avant = etatNut(X, m);
      const r = env(X, m, { foodLog: [ligne('Doute', 'pb-va-00000999')] });
      X.ctx.PropertiesService = { getScriptProperties: () => sp0 };
      t('PB10b ⭐⭐ EN CAS DE DOUTE c\'est SUSPENDU : si la lecture de la propriété échoue, le volet Nutrition est suspendu (sens sûr) — rien d\'écrit, réponse réessayable',
        refus(r, 'NUT_SUSPENDU') && r.j.retryable === true && etatNut(X, m) === avant, r.t.slice(0, 160));
    });
    await garde('PB11', async () => {
      const X = P1.serveur(); const m = email('lev'); X.compte(m, { code: CODE_PERSO });
      const DEJA = rid();                                                                                         // appliqué AVANT la suspension
      const rA = X.post(corps(m, { requestId: DEJA, foodLog: [ligne('Avant', 'pb-le-00000001')] }));
      const nutA = rA.j.nut;
      X.props[SUSPENSION] = '1';
      const PENDANT = rid();                                                                                      // reçu PENDANT la suspension : jamais appliqué, jamais mémorisé
      const rP = X.post(corps(m, { requestId: PENDANT, foodLog: [ligne('Avant', 'pb-le-00000001'), ligne('Pendant', 'pb-le-00000002')] }));
      const rR = X.post(corps(m, { requestId: DEJA, foodLog: [ligne('Avant', 'pb-le-00000001')] }));              // le rejeu d'un envoi DÉJÀ appliqué, pendant la suspension (la réponse s'était perdue)
      const opsPendant = (X.lireCompte(m).profile.nutOps || []).map((o) => J(o));
      t('PB11 ⭐⭐⭐ ACCUSÉS ET SUSPENSION : un envoi reçu pendant la suspension n\'est PAS appliqué et PAS mémorisé (aucun accusé ne sera donné pour lui), et le rejeu d\'un envoi déjà appliqué est lui aussi refusé (réessayable) plutôt que « déjà reçu » — l\'appareil garde tout en attente',
        refus(rP, 'NUT_SUSPENDU') && refus(rR, 'NUT_SUSPENDU') && !idsDe(X, m).includes('pb-le-00000002') && opsPendant.every((s) => s.indexOf(PENDANT) < 0), J({ ops: opsPendant.length }));
      delete X.props[SUSPENSION];                                                                                 // la REPRISE
      const rP2 = X.post(corps(m, { requestId: PENDANT, foodLog: [ligne('Avant', 'pb-le-00000001'), ligne('Pendant', 'pb-le-00000002')] }));
      const rR2 = X.post(corps(m, { requestId: DEJA, foodLog: [ligne('Avant', 'pb-le-00000001')] }));
      t('PB11b ⭐⭐⭐ … à la reprise, l\'envoi mis en attente est appliqué UNE fois (pas « déjà reçu »), son accusé est donné ; le rejeu de l\'envoi appliqué avant rend EXACTEMENT son accusé d\'origine (`deja:true`) : rien n\'est perdu, rien n\'est doublé',
        rP2.j.ok === true && rP2.j.nut && rP2.j.nut.deja !== true && idsDe(X, m).includes('pb-le-00000002') && rR2.j.ok === true && rR2.j.nut.deja === true && J(rR2.j.nut.acks) === J(nutA.acks) && idsDe(X, m).length === 2, J({ p: rP2.t.slice(0, 120) }));
    });
    await garde('PB12', async () => {
      const X = P1.serveur(); const m = email('adm'); X.compte(m, { code: CODE_PERSO });
      X.props.ADMIN_TOKEN = 'admintoken-test-000001';
      const restaurer = (mm, data) => X.post({ action: 'adminRestore', adminToken: 'admintoken-test-000001', email: mm, data });
      env(X, m, { foodLog: [ligne('R', 'pb-ad-00000001')], foodSupprimes: [{ i: 'pb-ad-00000009', t: 2 }] });
      const r = restaurer(m, { profile: { name: 'Restauré', foodLog: [ligne('R', 'pb-ad-00000001'), ligne('Vieux', 'pb-ad-00000002')] }, sessions: [] });   // une sauvegarde d'AVANT l'état v3 : ni marqueur, ni registre
      const c = X.lireCompte(m);
      const rO = ancien(X, m, { foodLog: [ligne('Ancien', 'pb-ad-00000003')] });
      t('PB12 ⭐⭐ une RESTAURATION ADMIN d\'une sauvegarde d\'avant l\'état v3 ne fait PAS régresser le compte vers la voie tolérante : le marqueur est conservé et un ancien envoi qui suit est refusé',
        r.j.status === 'ok' && c.profile.name === 'Restauré' && c.nutProto === 3 && refus(rO, 'NUT_CLIENT_INCOMPATIBLE'), r.t.slice(0, 120) + ' ' + rO.t.slice(0, 100));
      const r2 = restaurer(m, { profile: { name: 'R2' }, nutProto: 5, sessions: [] });
      const r3 = restaurer(m, { profile: { name: 'R3' }, nutProto: 2, sessions: [] });
      t('PB12b ⭐ … une sauvegarde qui porte un marqueur PLUS ÉLEVÉ le garde (5) ; un marqueur plus bas (2) ne fait jamais reculer le compte (il reste à 5)',
        r2.j.status === 'ok' && r3.j.status === 'ok' && X.lireCompte(m).nutProto === 5, J({ np: X.lireCompte(m).nutProto }));
      const Y = P1.serveur(); const my = email('adm0'); Y.compte(my, { code: CODE_PERSO }); Y.props.ADMIN_TOKEN = 'admintoken-test-000001';
      const rY = Y.post({ action: 'adminRestore', adminToken: 'admintoken-test-000001', email: my, data: { profile: { name: 'Restauré Y' }, sessions: [] } });
      t('PB12c ⭐ … et sur un compte SANS état v3 une restauration n\'invente aucun marqueur',
        rY.j.status === 'ok' && Y.lireCompte(my).nutProto === undefined, rY.t.slice(0, 100));
      Y.props[SUSPENSION] = '1';
      const rY2 = Y.post({ action: 'adminRestore', adminToken: 'admintoken-test-000001', email: my, data: { profile: { name: 'Restauré pendant la suspension' }, sessions: [] } });
      t('PB12d la restauration admin reste possible pendant la suspension (c\'est un acte d\'administrateur conscient, pas une synchronisation d\'appareil)',
        rY2.j.status === 'ok' && Y.lireCompte(my).profile.name === 'Restauré pendant la suspension', rY2.t.slice(0, 100));
    });

    /* ── 10. LES CHEMINS SANS VERROU : tout écrivain du compte prend le verrou commun ── */
    await garde('PB13', async () => {
      const src = fs.readFileSync(path.join(RACINE, 'Code.js'), 'utf8');
      /* chaque appel à `saveUserData_(` : la fonction de premier niveau qui le contient doit prendre ET rendre le verrou commun — sauf la définition elle-même et le compte JETABLE du test de garde-fou (route admin, adresse `ft_gf_*@test.internal`) */
      const appels = []; const re = /saveUserData_\(/g; let mt;
      while ((mt = re.exec(src))) appels.push(mt.index);
      const debuts = []; const rf = /^function\s+([A-Za-z0-9_$]+)\s*\(/gm;
      while ((mt = rf.exec(src))) debuts.push({ nom: mt[1], i: mt.index });
      const detail = appels.map((i) => {
        const f = debuts.filter((d) => d.i < i).pop() || { nom: '?', i: 0 };
        const corpsFn = src.slice(f.i, i);
        const suivant = debuts.find((d) => d.i > i); const finFn = suivant ? suivant.i : src.length;
        /* le CODE de la fonction, sans ses commentaires : une mention du verrou dans un commentaire ne le prend pas (les URL `://` ne sont pas des commentaires : le `//` doit suivre un espace ou un début de ligne) */
        const entier = src.slice(f.i, finFn).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
        const definition = f.nom === 'saveUserData_';
        const jetable = f.nom === 'doGet' && /testGardeFou/.test(corpsFn.slice(Math.max(0, corpsFn.length - 1500))) && /ft_gf_/.test(src.slice(i - 400, i + 400));
        return { fonction: f.nom, verrou: /_nutVerrouPrendre_\(/.test(entier) && /_nutVerrouRendre_\(/.test(entier), definition, jetable };
      });
      const sansVerrou = detail.filter((d) => !d.definition && !d.jetable && !d.verrou);
      t('PB13 ⭐⭐⭐ CHEMINS SANS VERROU (statique) : sur les ' + appels.length + ' appels à `saveUserData_` du serveur, TOUS — sauf la définition et le compte jetable du test de garde-fou — sont dans une fonction qui prend ET rend le verrou commun (saveProfile, e-mail vérifié, code perso, santé, mémoire du coach, restauration admin) : un nouvel écrivain sans verrou rougit ici',
        appels.length >= 8 && sansVerrou.length === 0 && detail.filter((d) => d.jetable).length === 1, J({ n: appels.length, sansVerrou, jetables: detail.filter((d) => d.jetable).length }));
      const directs = (src.match(/setProperty\(\s*(userKey_\(|'u_'|"u_")/g) || []).length;
      t('PB13b ⭐ … et AUCUN écrivain du compte ne passe à côté de `saveUserData_` : une seule écriture directe de la propriété du compte (`setProperty(userKey_(`) existe, dans `saveUserData_` elle-même',
        directs === 1 && /function saveUserData_[\s\S]{0,1800}setProperty\(\s*userKey_\(/.test(src), J({ directs }));
    });
    await garde('PB14', async () => {
      const pasDeGlobal = !/NUT_COMPAT_STRICT_\s*=/.test(fs.readFileSync(path.join(RACINE, 'Code.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''));
      const X = P1.serveur();
      t('PB14 ⭐ (R30 — un retrait s\'écrit et se fige) le levier GLOBAL `NUT_COMPAT_STRICT_` n\'existe plus, ni comme constante ni comme réglage (son contraire rouvrait la résurrection et l\'écrasement) ; la porte est `_nutAncienRefuse_`, par compte ; le seul retour arrière sûr est la SUSPENSION (`NUT_SUSPENDU`)',
        pasDeGlobal && typeof X.ctx.NUT_COMPAT_STRICT_ === 'undefined' && typeof X.ctx._nutAncienRefuse_ === 'function' && typeof X.ctx._nutSuspendu_ === 'function' && X.ctx.NUT_SUSPENSION_PROP_ === SUSPENSION && X.ctx.NUT_PROTOCOLE_MIN_ === 3, '');
    });

    /* ── 11. LA RAISON DU RETRAIT, FIGÉE (R30) ── */
    await garde('PB15', async () => {
      const monter = (sansPorte) => {
        const X = P1.serveur(sansPorte ? { compatStrict: false } : {}); const m = email('rais'); X.compte(m, { code: CODE_PERSO });
        const R = ligne('Riz test', 'pb-ra-00000001'), P = ligne('Pâtes test', 'pb-ra-00000002');
        env(X, m, { foodLog: [R, P] });                                                                           // le compte est à jour
        env(X, m, { foodLog: [Object.assign({}, P, { rev: 1 })], foodSupprimes: [{ i: R.id, t: 3 }] });          // R est supprimé : il est au registre
        const sansId = Object.assign({}, R); delete sansId.id;                                                    // une ANCIENNE ligne : elle n'a pas d'identité
        const r = ancien(X, m, { foodLog: [sansId, Object.assign({}, P)] });
        return { r, riz: (X.lireCompte(m).profile.foodLog || []).filter((l) => l.name === 'Riz test').length };
      };
      const sans = monter(true), avec = monter(false);
      t('PB15 ⭐⭐ (LA RAISON DU RETRAIT, mesurée et figée — R30) SANS la porte par compte (le réglage de banc `compatStrict:false` fait exactement ce que faisait `NUT_COMPAT_STRICT_ = false`), un ancien envoi dont la ligne n\'a PAS d\'identité RESSUSCITE le repas supprimé — il revient au journal malgré son entrée au registre ; AVEC la porte il est refusé et le repas reste supprimé : c\'est pourquoi aucun levier global ne peut exister',
        sans.r.j.ok === true && sans.riz === 1 && avec.r.j.ok === false && avec.r.j.code === 'NUT_CLIENT_INCOMPATIBLE' && avec.riz === 0, J({ sans: [sans.r.j.ok, sans.riz], avec: [avec.r.j.ok, avec.riz] }));
    });

    /* ── 12. LE TEST MANQUANT (finalisation NUT-SYNC-02, GO de Michel) : un ancien client REFUSÉ POUR NUTRITION enregistre TOUJOURS ses séances, ses records et ses pesées ── */
    await garde('PB18', async () => {
      const etats = [
        ['compte à état v3 (la porte)', (X, m) => { env(X, m, { foodLog: [ligne('Base', 'pb-an-base0001')] }); }, 'NUT_CLIENT_INCOMPATIBLE'],
        ['serveur SUSPENDU, compte sans état v3', (X) => { X.props[SUSPENSION] = '1'; }, 'NUT_SUSPENDU'],
        ['serveur SUSPENDU, compte à état v3', (X, m) => { env(X, m, { foodLog: [ligne('Base', 'pb-an-base0001')] }); X.props[SUSPENSION] = '1'; }, 'NUT_SUSPENDU'],
      ];
      const res = etats.map(([nom, preparer, code], k) => {
        const X = P1.serveur(); const m = email('anrest'); X.compte(m, { code: CODE_PERSO }); preparer(X, m);
        const avant = etatNut(X, m);
        const r = ancien(X, m, {
          foodLog: [ligne('Repas de l\'ancien', 'pb-an-' + k + '0000001')], savedFoods: [FAV('Fav de l\'ancien')],                                  // le volet Nutrition : REFUSÉ
          sessions: [SEANCE('pb-an-s' + k)], prs: { Squat: { rm1: 112, kg: 90, reps: 5, date: '2026-11-02' } }, weightLog: [{ date: '2026-11-02', kg: 79.5 }],   // séances, records, pesées : ENREGISTRÉS
          foodMode: 'strict', fasting: '16:8', diet: 'vegetarien', manualKcal: 2600, foodAiUses: 7 });                                          // réglages Nutrition du profil : hors volet, ENREGISTRÉS
        const c = X.lireCompte(m), p = c.profile;
        const ok = refus(r, code) && etatNut(X, m) === avant
          && (c.sessions || []).some((x) => x.id === 'pb-an-s' + k) && !!c.prs && !!c.prs.Squat && c.prs.Squat.kg === 90 && (c.weightLog || []).some((w) => w.date === '2026-11-02' && w.kg === 79.5)
          && p.foodMode === 'strict' && p.fasting === '16:8' && p.diet === 'vegetarien' && p.manualKcal === 2600 && p.foodAiUses >= 7;
        return { nom, ok, rep: r.t.slice(0, 90), s: (c.sessions || []).length, prs: Object.keys(c.prs || {}), w: (c.weightLog || []).length, reglages: [p.foodMode, p.fasting, p.diet, p.manualKcal, p.foodAiUses] };
      });
      t('PB18 ⭐⭐⭐ LE TEST MANQUANT — un ancien client REFUSÉ POUR NUTRITION (porte : compte à état v3 ; suspension : compte sans ou avec état v3) enregistre TOUJOURS, dans ce même envoi, ses SÉANCES, ses RECORDS et ses PESÉES — et ses réglages Nutrition du profil (mode alimentaire, jeûne, régime, kcal manuelles, compteur IA) ; seul son VOLET Nutrition (journal, favoris, suppressions) est refusé : le volet du compte est identique octet pour octet',
        res.every((x) => x.ok), J(res.filter((x) => !x.ok)));
    });

    /* ── 13. LES EXCEPTIONS DU SERVICE DE VERROU SE VOIENT (finalisation NUT-SYNC-02) : une ligne de journal, sans donnée, et le comportement est INCHANGÉ ── */
    await garde('PB16', async () => {
      const MSG = 'Exception: autorisation manquante pour LockService.getScriptLock — proprietaire-fictif@example.test ' + 'z'.repeat(300);
      const RQ = 'rq-verrou-exception-0001';
      const corpsEnvoi = (m) => corps(m, { requestId: RQ, foodLog: [ligne('Jamais écrit', 'pb-vx-00000001')], weightLog: [{ date: '2026-11-02', kg: 70 }], sessions: [SEANCE('pb-vx-s')] });
      const service = (quoi) => ({ getScriptLock: () => { if (quoi === 'getScriptLock') throw new Error(MSG); return { tryLock: () => { throw new Error(MSG); }, waitLock() {}, releaseLock() {}, hasLock: () => false }; } });
      /* la RÉFÉRENCE : un délai simplement dépassé (`tryLock` rend faux) — pas une exception : même réponse, AUCUNE ligne de journal */
      const Y = P1.serveur({ LockService: { getScriptLock: () => ({ tryLock: () => false, waitLock() {}, releaseLock() {}, hasLock: () => false }) } }); const my = email('vref'); Y.compte(my, { code: CODE_PERSO });
      const rY = Y.post(corpsEnvoi(my));
      const res = [['getScriptLock', false], ['tryLock', false], ['tryLock', true]].map(([quoi, journalEnPanne]) => {
        const X = P1.serveur({ LockService: service(quoi) }); const m = email('vexc'); X.compte(m, { code: CODE_PERSO });
        const avant = canon(X.lireCompte(m));
        if (journalEnPanne) X.ctx.Logger = { log() { throw new Error('journal en panne (simulée)'); } };         // le journal lui-même est en panne : le verrou ne doit rien en savoir
        const r = X.post(corpsEnvoi(m));
        const lignes = X.journal.filter((l) => /\[FT VERROU\]/.test(l));
        const l0 = lignes[0] || '';
        const memeReponse = r.t === rY.t.replace(my, m);
        const journalOk = journalEnPanne ? lignes.length === 0
          : (lignes.length === 1 && /^\[FT VERROU\] prise du verrou : exception du service — Exception: autorisation manquante/.test(l0) && l0.indexOf('[adresse]') > 0 && !/example\.test|proprietaire-fictif/.test(l0) && l0.indexOf(m) < 0 && l0.length <= 230);
        return { quoi: quoi + (journalEnPanne ? ' + journal en panne' : ''), ok: memeReponse && journalOk && canon(X.lireCompte(m)) === avant && r.j.code === 'NUT_LOCK_BUSY' && r.j.retryable === true, rep: r.t.slice(0, 100), lignes: lignes.length, l0: l0.slice(0, 120) };
      });
      t('PB16 ⭐⭐⭐ une EXCEPTION du service de verrou (levée par `getScriptLock` ou par `tryLock`) laisse UNE ligne `[FT VERROU] prise du verrou : exception du service — …` SANS donnée ni adresse (l\'adresse du message est masquée `[adresse]`, 160 caractères au plus, aucune adresse du compte) — et le COMPORTEMENT est INCHANGÉ : la réponse est octet pour octet celle d\'un simple délai dépassé (`NUT_LOCK_BUSY`, réessayable), rien n\'est écrit (ni séance, ni pesée, ni repas), même quand le journal lui-même est en panne',
        res.every((x) => x.ok) && rY.j.code === 'NUT_LOCK_BUSY' && Y.journal.filter((l) => /\[FT VERROU\]/.test(l)).length === 0, J({ res: res.filter((x) => !x.ok), ref: rY.t.slice(0, 100), refLignes: Y.journal.filter((l) => /\[FT VERROU\]/.test(l)).length }));
    });
    await garde('PB17', async () => {
      const MSG = 'Exception: libération impossible — proprietaire-fictif@example.test ' + 'y'.repeat(300);
      const X = P1.serveur({ LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock() {}, releaseLock: () => { throw new Error(MSG); }, hasLock: () => true }) } });
      const m = email('vrel'); X.compte(m, { code: CODE_PERSO });
      const r = env(X, m, { foodLog: [ligne('Écrit malgré tout', 'pb-vr-00000001')], weightLog: [{ date: '2026-11-02', kg: 71 }], sessions: [SEANCE('pb-vr-s')] });
      const c = X.lireCompte(m);
      const lignes = X.journal.filter((l) => /\[FT VERROU\] saveProfile : libération du verrou : exception du service — /.test(l));
      const r2 = X.post({ action: 'pushHealth', email: m, authCode: CODE_PERSO, sleep: 7.5, date: '2026-11-02' });
      const lignes2 = X.journal.filter((l) => /\[FT VERROU\] pushHealth : libération du verrou : exception du service — /.test(l));
      t('PB17 ⭐⭐ une EXCEPTION À LA LIBÉRATION du verrou est journalisée avec l\'écrivain qui le tenait (`saveProfile`, `pushHealth`) — UNE ligne chacun, sans donnée ni adresse — et le comportement est INCHANGÉ : la sauvegarde réussit, accusée, le repas, la séance et la pesée sont au compte, la santé de la montre est enregistrée',
        r.j.ok === true && idsDe(X, m).includes('pb-vr-00000001') && (c.sessions || []).some((x) => x.id === 'pb-vr-s') && (c.weightLog || []).some((w) => w.date === '2026-11-02')
        && lignes.length === 1 && lignes[0].indexOf('[adresse]') > 0 && lignes[0].length <= 260 && !/example\.test|proprietaire-fictif/.test(lignes[0])
        && r2.j.status === 'ok' && lignes2.length === 1 && !/example\.test|proprietaire-fictif/.test(lignes2[0]), J({ ok: r.j.ok, l: lignes.length, l2: lignes2.length, r2: r2.t.slice(0, 80) }));
    });
  }

  /* ═══ D et C — de VRAIS processus serveur, puis les VRAIS clients reliés à eux ═══════════════════════════════════════════════════════════════ */
  if (voulu('D') || voulu('C')) {
    const dirPool = fs.mkdtempSync(path.join(os.tmpdir(), 'pa02_'));
    const dirSans = fs.mkdtempSync(path.join(os.tmpdir(), 'pa02sans_'));
    const pool = lancerPool(dirPool, 3);
    let poolSans = null;
    const propSusp = (dir) => path.join(dir, 'p_' + encodeURIComponent(SUSPENSION));
    const suspendre = (dir) => fs.writeFileSync(propSusp(dir), '1');
    const reprendre = (dir) => { try { fs.unlinkSync(propSusp(dir)); } catch (e) { /* déjà levée */ } };
    const sante = (m) => ({ action: 'pushHealth', email: m, authCode: CODE_PERSO, sleep: 7.25, date: '2026-11-02' });
    const anc = (m, champs) => Object.assign({ action: 'saveProfile', email: m, authCode: CODE_PERSO }, champs);
    try {
      await pool.prets;

      /* ── D — la concurrence RÉELLE : un ancien et un nouveau client, ENSEMBLE ── */
      if (voulu('D')) {
        console.log('\n-- B-PA02 (D). De vrais processus serveur · un ancien et un nouveau client lancés ENSEMBLE · une suppression contre un envoi ancien · la suspension vue par tous --');

        /* PD10 — sur un compte NEUF, l'ancien et le nouveau arrivent ensemble : quel que soit celui qui passe d'abord, jamais de perte silencieuse */
        if (bloc('PD10')) await garde('PD10', async () => {
          const REP = 4; const anomalies = []; const ordres = { 'ancien-d-abord': 0, 'nouveau-d-abord': 0 };
          for (let k = 0; k < REP; k++) {
            const m = email('d10'); await pool.init(0, m, { code: CODE_PERSO });
            const LO = [ligne('O1', 'pd-o1-' + (1000000 + k)), ligne('O2', 'pd-o2-' + (1000000 + k))], LN = [ligne('N1', 'pd-n1-' + (1000000 + k)), ligne('N2', 'pd-n2-' + (1000000 + k))];
            const [ro, rn] = await pool.simultane([{ k: 1, corps: anc(m, { foodLog: LO, sessions: [SEANCE('pd-so-' + k)] }) }, { k: 2, corps: corps(m, { foodLog: LN, requestId: rid() }) }], true);
            const jo = lj(ro), jn = lj(rn); const c = await pool.lire(0, m); const ids = (c.profile.foodLog || []).map((l) => l.id);
            const aLO = LO.every((l) => ids.includes(l.id)), aLN = LN.every((l) => ids.includes(l.id)), sansLO = !LO.some((l) => ids.includes(l.id));
            const ordre = jo.ok === true ? 'ancien-d-abord' : 'nouveau-d-abord'; ordres[ordre]++;
            const coherent = jn.ok === true && aLN && c.nutProto === 3                                                                      // le nouveau est TOUJOURS appliqué, accusé, et le marqueur est durable
              && ((jo.ok === true && aLO) || (jo.ok === false && jo.code === 'NUT_CLIENT_INCOMPATIBLE' && sansLO))                           // l'ancien : appliqué (et alors présent) OU refusé explicitement (et alors absent) — jamais « ok » sans trace, jamais trace sans « ok »
              && (c.sessions || []).some((s) => s.id === 'pd-so-' + k);                                                                     // et sa séance est enregistrée dans les deux cas
            if (!coherent) anomalies.push({ k, ordre, jo: jo.ok === true ? 'ok' : jo.code, jn: jn.ok, np: c.nutProto, aLO, aLN, s: (c.sessions || []).length });
          }
          t('PD10 ⭐⭐⭐ (VRAIE CONCURRENCE, verrou réel) un ANCIEN client et un NOUVEAU client lancés ENSEMBLE sur le MÊME compte neuf, ' + REP + ' fois (' + J(ordres) + ') : quel que soit l\'ordre, le nouveau est toujours appliqué avec son marqueur durable ; l\'ancien est soit appliqué ET présent, soit refusé explicitement ET absent — jamais acquitté sans trace, jamais présent sans acquittement — et sa séance est toujours enregistrée',
            anomalies.length === 0 && !fs.existsSync(path.join(dirPool, 'verrou')), J(anomalies.slice(0, 2)));
        });

        /* PD11 — une SUPPRESSION contre un envoi ancien refusé : le refus écrit lui aussi le reste du profil, il ne doit pas écraser le registre */
        if (bloc('PD11')) await garde('PD11', async () => {
          const REP = 4; const anomalies = [];
          for (let k = 0; k < REP; k++) {
            const m = email('d11'); await pool.init(0, m, { code: CODE_PERSO });
            const A = ligne('A', 'pd-a-' + (1000000 + k)), B = ligne('B', 'pd-b-' + (1000000 + k));
            await pool.post(0, corps(m, { foodLog: [A, B], requestId: rid() }));                                                           // le compte est à état v3
            const [ro, rn] = await pool.simultane([{ k: 1, corps: anc(m, { foodLog: [A, B], sessions: [SEANCE('pd-sa-' + k)] }) }, { k: 2, corps: corps(m, { foodLog: [A], foodSupprimes: [{ i: B.id, t: 7 }], requestId: rid() }) }], true);
            const jo = lj(ro), jn = lj(rn); const c = await pool.lire(0, m); const ids = (c.profile.foodLog || []).map((l) => l.id);
            const ok = jo.ok === false && jo.code === 'NUT_CLIENT_INCOMPATIBLE' && jn.ok === true && !ids.includes(B.id) && (c.profile.foodSupprimes || []).some((e) => e.i === B.id) && (c.sessions || []).some((s) => s.id === 'pd-sa-' + k);
            if (!ok) anomalies.push({ k, jo: jo.ok === true ? 'ok' : jo.code, jn: jn.ok, B: ids.includes(B.id), reg: (c.profile.foodSupprimes || []).length, s: (c.sessions || []).length });
          }
          t('PD11 ⭐⭐⭐ (VRAIE CONCURRENCE) une SUPPRESSION à jour et un envoi ANCIEN (qui renvoie le repas supprimé et une séance) lancés ENSEMBLE, ' + REP + ' fois : l\'ancien est refusé, la suppression est inscrite, le repas ne ressuscite JAMAIS, et la séance de l\'ancien est enregistrée — même un envoi refusé réécrit le compte, sous le verrou il le fait sur l\'état À JOUR',
            anomalies.length === 0, J(anomalies.slice(0, 2)));
        });

        /* PD12 — LE CONTRÔLE NÉGATIF DU BANC : sans verrou, ces deux courses DOIVENT casser, sinon PD10 et PD11 sont des verts qui ne peuvent pas rougir */
        if (bloc('PD12')) await garde('PD12', async () => {
          poolSans = lancerPool(dirSans, 3, { NUT_SANS_VERROU: '1' });
          await poolSans.prets;
          let casse10 = 0, casse11 = 0; const essais = 4;
          for (let k = 0; k < essais; k++) {
            const m = email('d12'); await poolSans.init(0, m, { code: CODE_PERSO });
            const LO = [ligne('O1', 'ps-o1-' + (1000000 + k))], LN = [ligne('N1', 'ps-n1-' + (1000000 + k))];
            const [ro, rn] = await poolSans.simultane([{ k: 1, corps: anc(m, { foodLog: LO }) }, { k: 2, corps: corps(m, { foodLog: LN, requestId: rid() }) }], true);
            const jo = lj(ro), jn = lj(rn); const c = await poolSans.lire(0, m); const ids = (c.profile.foodLog || []).map((l) => l.id);
            if ((jn.ok === true && (!ids.includes(LN[0].id) || c.nutProto !== 3)) || (jo.ok === true && !ids.includes(LO[0].id))) casse10++;                // acquitté mais absent, ou marqueur perdu
          }
          for (let k = 0; k < essais; k++) {
            const m = email('d12b'); await poolSans.init(0, m, { code: CODE_PERSO });
            const A = ligne('A', 'ps-a-' + (1000000 + k)), B = ligne('B', 'ps-b-' + (1000000 + k));
            await poolSans.post(0, corps(m, { foodLog: [A, B], requestId: rid() }));
            const [ro, rn] = await poolSans.simultane([{ k: 1, corps: anc(m, { foodLog: [A, B], sessions: [SEANCE('ps-sa-' + k)] }) }, { k: 2, corps: corps(m, { foodLog: [A], foodSupprimes: [{ i: B.id, t: 7 }], requestId: rid() }) }], true);
            const c = await poolSans.lire(0, m); const ids = (c.profile.foodLog || []).map((l) => l.id);
            if (ids.includes(B.id) || !(c.profile.foodSupprimes || []).some((e) => e.i === B.id) || !(c.sessions || []).some((s) => s.id === 'ps-sa-' + k)) casse11++;   // le repas supprimé est revenu, ou le registre a disparu, ou la séance
          }
          t('PD12 ⭐⭐ CONTRÔLE NÉGATIF DU BANC (processus dont le verrou ne verrouille rien) : la course « ancien contre nouveau » PERD des données acquittées (' + casse10 + '/' + essais + ') et la course « suppression contre envoi ancien refusé » FAIT RESSUSCITER le repas ou perdre sa suppression (' + casse11 + '/' + essais + ') — le banc sait détecter l\'absence de verrou commun, PD10 et PD11 peuvent rougir',
            casse10 >= 1 && casse11 >= 1, J({ casse10, casse11, essais }));
        });

        /* PD20 — LA SUSPENSION vue par TOUS les processus à la fois, sans redéploiement */
        if (bloc('PD20')) await garde('PD20', async () => {
          const m = email('d20'); await pool.init(0, m, { code: CODE_PERSO });
          await pool.post(0, corps(m, { foodLog: [ligne('Base', 'pd-20-00000001')], foodSupprimes: [{ i: 'pd-20-00000009', t: 3 }], requestId: rid() }));
          const avant = canon({ p: (await pool.lire(0, m)).profile, np: (await pool.lire(0, m)).nutProto, rn: (await pool.lire(0, m)).recupNut });
          suspendre(dirPool);
          const RQ = rid(); const SC = SEANCE('pd-20-s');                                                           // la MÊME séance dans les trois envois : le serveur REMPLACE les séances par la liste reçue, ce qui compte est qu'elle soit enregistrée malgré le refus du Nutrition
          const rs = await pool.simultane([
            { k: 0, corps: corps(m, { foodLog: [ligne('Pendant 0', 'pd-20-00000010')], sessions: [SC], requestId: rid() }) },
            { k: 1, corps: anc(m, { foodLog: [ligne('Pendant 1', 'pd-20-00000011')], sessions: [SC] }) },
            { k: 2, corps: corps(m, { foodLog: [ligne('Autre', 'pd-20-00000002')], foodSupprimes: [{ i: 'pd-20-00000001', t: 9 }], sessions: [SC], requestId: RQ }) }], false);
          const js = rs.map(lj); const c = await pool.lire(0, m);
          const apres = canon({ p: Object.assign({}, c.profile), np: c.nutProto, rn: c.recupNut });
          const nutIdentique = canon({ fs: c.profile.foodSupprimes, fl: c.profile.foodLog, sf: c.profile.savedFoods, nr: c.profile.nutRev, no: c.profile.nutOps }) === canon({ fs: JSON.parse(avant).p.foodSupprimes, fl: JSON.parse(avant).p.foodLog, sf: JSON.parse(avant).p.savedFoods, nr: JSON.parse(avant).p.nutRev, no: JSON.parse(avant).p.nutOps }) && J(JSON.parse(apres).rn) === J(JSON.parse(avant).rn) && c.nutProto === 3;
          t('PD20 ⭐⭐⭐ (VRAIS PROCESSUS) la propriété `NUT_SUSPENDU` posée dans les propriétés PARTAGÉES est vue par les TROIS processus à la fois, sans redéploiement : un envoi à jour, un envoi ancien et une suppression sont tous refusés (`NUT_SUSPENDU`, réessayable), le volet Nutrition du compte est identique octet pour octet, et la séance de ces envois est enregistrée malgré le refus du Nutrition',
            js.every((j) => j.status === 'nut_refuse' && j.ok === false && j.code === 'NUT_SUSPENDU' && j.retryable === true && !('nut' in j)) && nutIdentique && (c.sessions || []).some((s) => s.id === 'pd-20-s'), J({ codes: js.map((j) => j.code || j.status), nutIdentique, np: c.nutProto, ses: (c.sessions || []).map((x) => x.id), retry: js.map((j) => j.retryable), nut: js.map((j) => 'nut' in j) }));
          reprendre(dirPool);
          const r2 = lj(await pool.post(1, corps(m, { foodLog: [ligne('Autre', 'pd-20-00000002')], foodSupprimes: [{ i: 'pd-20-00000001', t: 9 }], requestId: RQ })));
          const c2 = await pool.lire(0, m);
          t('PD20b ⭐⭐ … la propriété retirée, la reprise est INSTANTANÉE sur un autre processus : le même envoi (même requestId) est appliqué une fois, accusé, la suppression est au registre',
            r2.ok === true && (r2.nut || {}).deja !== true && (c2.profile.foodSupprimes || []).some((e) => e.i === 'pd-20-00000001') && !(c2.profile.foodLog || []).some((l) => l.id === 'pd-20-00000001'), J(r2).slice(0, 160));
        });
      }

      /* ── C — les VRAIS clients, reliés à ces processus ── */
      if (voulu('C')) {
        console.log('\n-- B-PA02 (C). Le vrai client courant sous suspension · le VRAI ancien client de production face au nouveau serveur --');
        const appareil = CL.fabriquerAppareils(b, PORT, pool, O, erreursGlobales);
        const compte = (mail) => pool.lire(0, mail);
        const SUCCES = /r[ée]ussi|synchronis[ée]e? ✅|sauvegard[ée]e? ✅|✅.*synchro/i;
        const SEM = [
          ligne('Pâtes test', 'sem1-00000001', { kcal: 131.4, prot: 4.6, carbs: 25.3, fat: 1.1, q: 135 }),
          ligne('Pomme test', 'sem2-00000002', { kcal: 52.3, prot: 0.3, carbs: 13.8, fat: 0.2, q: 180 }),
          ligne('Riz test', 'sem3-00000003', { kcal: 129.9, prot: 2.7, carbs: 28.2, fat: 0.3, q: 150 }),
        ];
        const copie = (x) => JSON.parse(JSON.stringify(x));
        const parId = (j) => (j || []).slice().sort((a, c) => (a.id < c.id ? -1 : 1));

        /* PC10 — le client courant sous suspension : opérations en attente, un seul message, rien d'effacé, reprise sans perte */
        if (bloc('PC10')) await garde('PC10', async () => {
          const m = email('c10'); await pool.init(0, m, { code: CODE_PERSO });
          const A = await appareil('A', 1, m);
          await A.graine(SEM.map(copie)); await A.sync();
          const avant = await compte(m);
          suspendre(dirPool);
          await A.supprimer('sem2-00000002');
          await A.ev((l) => { S.foodLog.push(l); persist(); }, ligne('Repas pendant la suspension', 'susp-00000001'));
          await A.ev(() => { S.weightLog = (S.weightLog || []).concat([{ date: '2026-11-02', kg: 81.5 }]); persist(); });
          await A.sync();
          const t1 = await A.toasts();
          await A.sync();
          const t2 = await A.toasts();
          const c = await compte(m); const reg = await A.registre(); const e = reg.find((x) => x.i === 'sem2-00000002') || {};
          t('PC10 ⭐⭐⭐ (vrai client, vrais processus) PENDANT la suspension : la suppression et le repas neuf restent EN ATTENTE sur l\'appareil (suppression ni confirmée ni rejetée ni effacée, repas en mémoire ET sur disque), le compte n\'a rien reçu de Nutrition, aucun succès n\'est affiché — et la pesée du même envoi est ENREGISTRÉE',
            !!e.i && !e.c && !e.x && (await A.ev(() => _foodSupprimesEnAttente().length)) === 1 && (await A.journal()).some((l) => l.id === 'susp-00000001') && ((await A.disque()) || []).some((l) => l.id === 'susp-00000001')
            && canon(parId(c.profile.foodLog)) === canon(parId(avant.profile.foodLog)) && J(c.profile.foodSupprimes || []) === J(avant.profile.foodSupprimes || []) && !(c.profile.foodLog || []).some((l) => l.id === 'susp-00000001')
            && (c.weightLog || []).some((w) => w.date === '2026-11-02') && !t2.some((x) => SUCCES.test(x)), J({ e, toasts: t2 }));
          const msgs = t2.filter((x) => /suspendue momentanément/.test(x));
          t('PC10b ⭐ … le message est clair (« suspendue momentanément », rien n\'est perdu, les repas et suppressions restent sur le téléphone et partiront à la reprise) et il n\'apparaît QU\'UNE fois malgré deux synchronisations de suite',
            msgs.length === 1 && /Rien n'est perdu/.test(msgs[0]) && /partiront dès la reprise/.test(msgs[0]) && t1.filter((x) => /suspendue momentanément/.test(x)).length === 1, J({ msgs: msgs.length }));
          await A.redemarrer();
          t('PC10c ⭐⭐ … un REDÉMARRAGE de l\'application pendant la suspension ne perd rien : la suppression est toujours en attente (stockage compris), le repas neuf est toujours là',
            (await A.registreDisque()).some((x) => x.i === 'sem2-00000002' && !x.c && !x.x) && ((await A.disque()) || []).some((l) => l.id === 'susp-00000001') && (await A.journal()).some((l) => l.id === 'susp-00000001') && !(await A.journal()).some((l) => l.id === 'sem2-00000002'), '');
          reprendre(dirPool);
          await A.sync();
          const c2 = await compte(m); const reg2 = await A.registre(); const e2 = reg2.find((x) => x.i === 'sem2-00000002') || {};
          t('PC10d ⭐⭐⭐ … la suspension levée, la prochaine synchronisation envoie ce qui attendait : la suppression est confirmée par l\'accusé, le repas arrive au compte, le repas supprimé n\'y est plus — rien perdu, rien doublé',
            !!e2.c && !(c2.profile.foodLog || []).some((l) => l.id === 'sem2-00000002') && (c2.profile.foodLog || []).filter((l) => l.id === 'susp-00000001').length === 1 && (c2.profile.foodSupprimes || []).some((x) => x.i === 'sem2-00000002') && (await A.ev(() => _foodSupprimesEnAttente().length)) === 0, J({ e2 }));
          await A.fermer();
        });

        /* PC20 — le VRAI ancien client de production face au nouveau serveur */
        if (bloc('PC20')) await garde('PC20', async () => {
          if (!PORT_ANCIEN) { t('PC20 ⛔ le VRAI ancien client de production n\'est pas disponible (révision introuvable) — la preuve est ABSENTE, pas verte', false, 'FT_ANCIEN_CLIENT_REF / FT_ANCIEN_CLIENT_DIR'); return; }
          const ancienAppareil = CL.fabriquerAppareils(b, PORT_ANCIEN, pool, O, erreursGlobales);
          const lignesO = SEM.map(copie);
          /* (a) un compte SANS état v3 : l'ancien client réel fonctionne comme avant */
          {
            const m = email('c20a'); await pool.init(0, m, { code: CODE_PERSO });
            const O1 = await ancienAppareil('O', 1, m);
            const version = await O1.ev(() => (typeof CACHE_VERSION !== 'undefined' ? CACHE_VERSION : (document.title || '')));
            await O1.graine(lignesO.map(copie)); await O1.sync();
            const envoyes = O1.corps.map((x) => { try { return JSON.parse(x); } catch (e) { return {}; } }).filter((x) => x.action === 'saveProfile');
            const c = await compte(m);
            t('PC20 ⭐⭐⭐ (VRAI ancien client de production) il n\'envoie NI `foodLogV` NI `requestId` (le client d\'avant, `no-cors`) ; sur un compte SANS état v3 sa synchronisation est ACCEPTÉE et APPLIQUÉE comme avant : le journal du compte est le sien, aucun marqueur n\'est posé, aucune erreur de page',
              envoyes.length >= 1 && envoyes.every((x) => x.foodLogV === undefined && x.requestId === undefined && Array.isArray(x.foodLog)) && canon(parId(c.profile.foodLog).map((l) => l.id)) === canon(lignesO.map((l) => l.id).sort()) && c.nutProto === undefined && O1.erreurs.length === 0, J({ n: envoyes.length, ids: (c.profile.foodLog || []).length, np: c.nutProto, err: O1.erreurs, version }));
            await O1.fermer();
          }
          /* (b) le compte passe à l'état v3 : un appareil À JOUR synchronise et supprime ; l'ancien client réel, qui a encore le repas supprimé et un repas neuf, est refusé SANS RIEN CASSER */
          {
            const m = email('c20b'); await pool.init(0, m, { code: CODE_PERSO });
            const O1 = await ancienAppareil('O', 1, m);
            await O1.graine(lignesO.map(copie)); await O1.sync();                                                 // l'ancien appareil écrit d'abord (toléré)
            const N = await appareil('N', 2, m); await N.restaurer(); await N.sync();                             // l'appareil à jour reprend le compte, synchronise (marqueur)
            await N.supprimer('sem2-00000002'); await N.sync();                                                   // … et supprime un repas (registre)
            const avantCompte = await compte(m);
            await O1.ev((l) => { S.foodLog.push(l); persist(); }, ligne('Repas neuf de l\'ancien', 'ancien-nouv-0001'));
            await O1.ev(() => {                                                                                   // … et, saisis sur le MÊME téléphone : UNE séance, UN record, UNE pesée (rien de Nutrition)
              S.sessions = (S.sessions || []).concat([{ id: 'ancien-sc-0001', date: '2026-11-02', ts: 1760002000000, exs: [], vol: 0 }]);
              S.prs = Object.assign({}, S.prs || {}, { Squat: { rm1: 112, kg: 90, reps: 5, date: '2026-11-02' } });
              S.weightLog = (S.weightLog || []).concat([{ date: '2026-11-02', kg: 79.5 }]);
              persist();
            });
            O1.corps.length = 0;
            await O1.sync();                                                                                      // l'ancien appareil resynchronise : il a encore sem2 ET un repas neuf
            const apresCompte = await compte(m);
            const idsAvant = (avantCompte.profile.foodLog || []).map((l) => l.id).sort(), idsApres = (apresCompte.profile.foodLog || []).map((l) => l.id).sort();
            const toastsO = await O1.toasts();
            t('PC20b ⭐⭐⭐ (VRAI ancien client, compte À ÉTAT v3) l\'envoi de l\'ancien client est REFUSÉ côté serveur : le repas supprimé NE RESSUSCITE PAS, le journal du compte n\'est pas écrasé, son repas neuf n\'est pas annoncé enregistré (absent du compte) — le registre et le marqueur sont intacts',
              canon(idsApres) === canon(idsAvant) && !idsApres.includes('sem2-00000002') && !idsApres.includes('ancien-nouv-0001') && J(apresCompte.profile.foodSupprimes) === J(avantCompte.profile.foodSupprimes) && apresCompte.nutProto === 3, J({ idsAvant, idsApres }));
            const jO = await O1.journal();
            t('PC20c ⭐⭐ … et l\'ancien client n\'est pas cassé pour autant : AUCUNE erreur de page, AUCUN message d\'erreur, son journal local garde ses 4 repas (le repas neuf n\'est pas perdu : il part dès la mise à jour), il peut toujours enregistrer en local — le refus lui est invisible, c\'est la limite écrite (`no-cors`)',
              O1.erreurs.length === 0 && jO.length === 4 && jO.some((l) => l.id === 'ancien-nouv-0001') && jO.some((l) => l.id === 'sem2-00000002') && !toastsO.some((x) => /erreur|échec|impossible|incompatible/i.test(x)), J({ err: O1.erreurs, n: jO.length, toastsO }));
            const sess = apresCompte.sessions || [], prsC = apresCompte.prs || {}, wl = apresCompte.weightLog || [];
            const absentAvant = !(avantCompte.sessions || []).some((x) => x.id === 'ancien-sc-0001') && !(avantCompte.prs || {}).Squat && !(avantCompte.weightLog || []).some((w) => w.kg === 79.5);   // la donnée n'existait pas au compte : elle ne peut venir que de l'envoi refusé
            t('PC20e ⭐⭐⭐ (LE TEST MANQUANT — VRAI ancien client de production, compte À ÉTAT v3) son VOLET Nutrition est refusé (PC20b) MAIS, dans ce même envoi, sa séance, son record (Squat 90 kg) et sa pesée (79,5 kg), saisis sur l\'ancien téléphone, sont ENREGISTRÉS au compte — qui n\'en avait aucun avant : seul le Nutrition est refusé',
              absentAvant && sess.some((x) => x.id === 'ancien-sc-0001') && !!prsC.Squat && prsC.Squat.kg === 90 && wl.some((w) => w.date === '2026-11-02' && w.kg === 79.5), J({ absentAvant, s: sess.length, prs: Object.keys(prsC), wl: wl.length }));
            await O1.fermer(); await N.fermer();
          }
          /* (b2) LA CONCURRENCE avec les deux vrais clients : leurs requêtes sont RETENUES puis lâchées ensemble — le serveur (vrais processus, vrai verrou) les reçoit presque en même temps */
          {
            const REP = 3; const anomalies = []; const ordres = { 'ancien-d-abord': 0, 'nouveau-d-abord': 0 };
            for (let k = 0; k < REP; k++) {
              const m = email('c21'); await pool.init(0, m, { code: CODE_PERSO });
              const LO = [ligne('Ancien 1', 'c21o-' + (1000000 + k)), ligne('Ancien 2', 'c21o-' + (2000000 + k))], LN = [ligne('Nouveau 1', 'c21n-' + (1000000 + k)), ligne('Nouveau 2', 'c21n-' + (2000000 + k))];
              const O1 = await ancienAppareil('O', 1, m), N = await appareil('N', 2, m);
              await O1.graine(LO.map(copie)); await N.graine(LN.map(copie));
              let lacher; const porte = new Promise((r) => { lacher = r; });
              O1.retenir = porte; N.retenir = porte;
              const pO = O1.sync(), pN = N.sync();
              await pause(900); lacher();                                                                         // les deux requêtes sont arrivées et attendent : on les lâche ENSEMBLE
              await Promise.all([pO, pN]);
              const c = await compte(m); const ids = (c.profile.foodLog || []).map((l) => l.id);
              const aLO = LO.every((l) => ids.includes(l.id)), aLN = LN.every((l) => ids.includes(l.id)), sansLO = !LO.some((l) => ids.includes(l.id));
              const ordre = aLO ? 'ancien-d-abord' : 'nouveau-d-abord'; ordres[ordre]++;
              const jO = await O1.journal(), jN = await N.journal();
              const coherent = aLN && c.nutProto === 3 && (aLO || sansLO) && jO.length === 2 && jN.length >= 2 && O1.erreurs.length === 0 && N.erreurs.length === 0;     // le nouveau est toujours là avec son marqueur ; l'ancien est ENTIER ou ABSENT, jamais à moitié ; aucun appareil n'a perdu ses repas
              if (!coherent) anomalies.push({ k, ordre, aLO, aLN, sansLO, np: c.nutProto, jO: jO.length, jN: jN.length, eO: O1.erreurs, eN: N.erreurs });
              await O1.fermer(); await N.fermer();
            }
            t('PC21 ⭐⭐⭐ (VRAIS CLIENTS, ancien de production + courant, requêtes lâchées ENSEMBLE, vrais processus, vrai verrou) ' + REP + ' fois (' + J(ordres) + ') : le compte porte TOUJOURS les repas du nouveau et son marqueur ; ceux de l\'ancien y sont ENTIERS ou ABSENTS (jamais à moitié) selon l\'ordre d\'arrivée ; aucun appareil ne perd un repas localement, aucune erreur de page',
              anomalies.length === 0, J(anomalies.slice(0, 2)));
          }
          /* (c) sous suspension : l'ancien client réel n'écrit pas non plus, mais sa pesée est enregistrée */
          {
            const m = email('c20c'); await pool.init(0, m, { code: CODE_PERSO });
            const O1 = await ancienAppareil('O', 1, m);
            suspendre(dirPool);
            await O1.graine(lignesO.map(copie));
            await O1.ev(() => {
              S.weightLog = (S.weightLog || []).concat([{ date: '2026-11-02', kg: 80.5 }]);
              S.sessions = (S.sessions || []).concat([{ id: 'ancien-sd-0001', date: '2026-11-02', ts: 1760003000000, exs: [], vol: 0 }]);
              S.prs = Object.assign({}, S.prs || {}, { Squat: { rm1: 105, kg: 85, reps: 5, date: '2026-11-02' } });
              persist();
            });
            await O1.sync();
            const c = await compte(m);
            reprendre(dirPool);
            t('PC20d ⭐⭐ (VRAI ancien client, serveur SUSPENDU) son volet Nutrition n\'est pas écrit (journal du compte vide) alors qu\'un compte sans état v3 l\'aurait toléré — et sa pesée, sa séance et son record (Squat 85 kg) sont ENREGISTRÉS ; aucune erreur de page',
              (c.profile.foodLog || []).length === 0 && (c.weightLog || []).some((w) => w.date === '2026-11-02') && (c.sessions || []).some((x) => x.id === 'ancien-sd-0001') && !!c.prs && !!c.prs.Squat && c.prs.Squat.kg === 85 && O1.erreurs.length === 0, J({ n: (c.profile.foodLog || []).length, w: (c.weightLog || []).length, s: (c.sessions || []).length, prs: Object.keys(c.prs || {}), err: O1.erreurs }));
            await O1.fermer();
          }
        });
      }
    } finally {
      pool.tuer(); if (poolSans) poolSans.tuer();
      try { fs.rmSync(dirPool, { recursive: true, force: true }); fs.rmSync(dirSans, { recursive: true, force: true }); } catch (e) { /* tant pis */ }
    }
  }

  t('PG99 aucune erreur JavaScript inattendue pendant tout le banc (les erreurs de quota simulées sont attendues)', erreursGlobales.filter((e) => !/quota|refus|faute|écriture/i.test(e)).length === 0, J(erreursGlobales.slice(0, 3)));
};
