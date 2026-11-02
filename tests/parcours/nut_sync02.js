/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   🔁🛑 NUT-SYNC-01 FINAL — LE REGISTRE SATURÉ REFUSE EXPLICITEMENT · LES MODIFICATIONS CONCURRENTES NE S'ÉCRASENT PLUS (01/11/2026, ordre de Michel)
   Bloc : B-NS02. Banc : tools/banc_nut_sync02.js · contrôle négatif : tools/mut_nut_sync02.py

   CONDUIT :
     · section A–C — le VRAI Code.js (vm Node, services Google simulés, compression réelle : `serveur()` de nut_secu_p1.js), par ses vraies portes `doPost` (saveProfile…), en séquence, dans UN processus ;
     · section D — DE VRAIS PROCESSUS (`tools/nut_serveur_proc.js`) : chacun exécute le vrai Code.js, sur des propriétés PARTAGÉES (un fichier par propriété) avec un VRAI verrou entre processus
       (`mkdir` atomique). Deux envois lancés ENSEMBLE lisent et écrivent le même compte : ce n'est pas une simulation séquentielle. Une barrière force la lecture du MÊME état périmé par les deux
       processus — sans verrou la perte de mise à jour est alors quasi certaine, et le banc le MONTRE (D04, contrôle négatif du banc lui-même) ;
     · section E — le VRAI client (index.html + scripts) dans PLUSIEURS CONTEXTES NAVIGATEUR INDÉPENDANTS, reliés à ces processus serveur : leurs requêtes se chevauchent pour de bon.
   OBSERVE : chaque réponse brute, le compte stocké (journal actif, registre, zone de récupération, mémoire des opérations), le stockage et la mémoire de chaque appareil, les toasts, ce que reçoit le miroir.
   SIMULÉ : les services Google (propriétés en fichiers, Drive en mémoire), le réseau, le miroir Supabase (un modèle du contrat d'écriture de la migration 0003 : un champ PRÉSENT remplace le champ entier).
   NE COUVRE PAS : le vrai déploiement Apps Script (le VRAI LockService, ses délais, son 302 vers googleusercontent.com), les vraies Script Properties (plafonds réels), le vrai Supabase (RPC et RLS
     réelles), l'iPhone. Ces points sont écrits « NON TESTÉ » dans le rapport, jamais déclarés validés.
   ⛔⛔ DONNÉES INVENTÉES SEULEMENT (domaine example.test, repas « … test »). */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { fork } = require('child_process');
const vm = require('vm');
const J = (x) => JSON.stringify(x);
const RACINE = path.join(__dirname, '..', '..');
const P1 = require('./nut_secu_p1.js');
const CODE_PERSO = '4242';
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
/* `NS02_SEULEMENT=A,B,C,D,E` (liste) : ne rejouer que certaines sections du banc (les contrôles négatifs ne rejouent que ce dont ils ont besoin) ; absent = tout. */
const SECT = process.env.NS02_SEULEMENT || '';
const voulu = (x) => !SECT || SECT.split(',').indexOf(x) >= 0;

const canon = (v) => JSON.stringify((function tri(x) {
  if (Array.isArray(x)) return x.map(tri);
  if (x && typeof x === 'object') { const r = {}; Object.keys(x).sort().forEach((k) => { r[k] = tri(x[k]); }); return r; }
  return x;
})(v));
/** Le contenu METIER d'une ligne (ce que Milo et les macros lisent) : tout sauf ce que le serveur pose (rev, modifiedAt). */
const metier = (l) => { const o = JSON.parse(JSON.stringify(l)); delete o.rev; delete o.modifiedAt; return canon(o); };
const ligne = (nom, id, o) => Object.assign({ id, date: '2026-11-01', meal: 'dejeuner', name: nom, q: 100, u: 'g', kcal: 130, prot: 3, carbs: 28, fat: 1, ts: 1760000000000,
  per100: null, v: 1, saisie: 'liste', origine: 'reprise', n2: { s: 1, m: 'd', no: [], st: 'declaree' } }, o || {});
let compteur = 0;
const email = (tag) => ('ns02-' + tag + '-' + (++compteur) + '-' + crypto.randomBytes(3).toString('hex') + '@example.test');
const rid = () => 'rq' + crypto.randomBytes(8).toString('hex');
const mille = (a, b2) => Array.from({ length: b2 - a }, (_, k) => ({ i: 'tmb' + String(100000 + a + k) + '-aaaa', t: 1 + k }));

/* ── Le POOL de processus serveur : de vrais processus, des propriétés partagées, un verrou entre processus ── */
function lancerPool(dir, n, env) {
  const att = new Map(); let seq = 0; const procs = [];
  const prets = [];
  for (let k = 0; k < n; k++) {
    const c = fork(path.join(RACINE, 'tools', 'nut_serveur_proc.js'), [dir], { env: Object.assign({}, process.env, env || {}), stdio: ['ignore', 'inherit', 'inherit', 'ipc'] });
    prets.push(new Promise((r) => { c.__pret = r; }));
    c.on('message', (m) => { if (m.pret) return c.__pret(); const f = att.get(m.id); if (f) { att.delete(m.id); f(m); } });
    procs.push(c);
  }
  const appel = (k, m) => new Promise((r) => { const id = ++seq; att.set(id, r); procs[k].send(Object.assign({ id }, m)); });
  const pool = {
    dir, n, procs,
    prets: Promise.all(prets),
    appel,
    post: (k, corps, barriere) => appel(k, { op: 'post', corps: typeof corps === 'string' ? corps : J(corps), barriere }),
    get: (k, q) => appel(k, { op: 'get', q }),
    init: (k, mail, o) => appel(k, Object.assign({ op: 'init', email: mail }, o || {})),
    lire: async (k, mail) => (await appel(k, { op: 'lire', email: mail })).compte,
    regler: (k, nom, valeur) => appel(k, { op: 'regler', nom, valeur }),
    /** Deux (ou N) envois lancés ENSEMBLE. `barriere` : après CHAQUE lecture du compte, chaque processus attend (≤ 400 ms) que tous aient fait la même lecture — ils décident donc tous sur le MÊME état. */
    simultane: async (envois, barriere) => {
      fs.readdirSync(dir).filter((f) => /^lu_/.test(f)).forEach((f) => { try { fs.unlinkSync(path.join(dir, f)); } catch (e) { /* déjà parti */ } });
      return Promise.all(envois.map((e) => pool.post(e.k, e.corps, barriere ? envois.length : 0)));
    },
    tuer: () => procs.forEach((c) => { try { c.kill(); } catch (e) { /* déjà mort */ } }),
  };
  return pool;
}
const corps = (mail, champs) => Object.assign({ action: 'saveProfile', email: mail, authCode: CODE_PERSO, foodLogV: 3 }, champs);
const lj = (r) => { try { return JSON.parse(r.t); } catch (e) { return {}; } };

module.exports.ecran = async function ecran(t, b, PORT) {
  console.log('\n-- B-NS02. Registre saturé = refus explicite · révisions par repas · verrou · accusés lus · vrais processus serveur --');
  const erreursGlobales = [];
  const dirPool = fs.mkdtempSync(path.join(os.tmpdir(), 'ns02_'));
  const pool = lancerPool(dirPool, 3);
  await pool.prets;
  const dirSans = fs.mkdtempSync(path.join(os.tmpdir(), 'ns02sans_'));
  let poolSans = null;
  try {

  /* ═══ A — la décision et l'erreur métier, en elles-mêmes ═══════════════════════════════════════════════════════════════════════ */
  if (voulu('A')) {
    const X = P1.serveur();
    const D = (s, i) => J(X.ctx.nutDecisionModification(s, i));
    t('B-NS02 A01 ⭐ `nutDecisionModification` : création si le serveur ne connaît pas l\'identité · rejet si supprimée · rejet si révision de base invalide (absente, texte, négative, décimale, NaN, hors entier sûr) · conflit si périmée · mise à jour si identique (révision + 1)',
      D(null, {}) === J({ action: 'create' }) && D({ revision: 3, deleted: true }, { baseRevision: 3 }) === J({ action: 'reject', code: 'NUT_ENTRY_DELETED' })
      && [undefined, '3', -1, 1.5, NaN, 2 ** 60, null].every((v) => D({ revision: 3, deleted: false }, { baseRevision: v }) === J({ action: 'reject', code: 'NUT_INVALID_REVISION' }))
      && D({ revision: 3, deleted: false }, { baseRevision: 2 }) === J({ action: 'conflict', code: 'NUT_REVISION_CONFLICT' })
      && D({ revision: 3, deleted: false }, { baseRevision: 4 }) === J({ action: 'conflict', code: 'NUT_REVISION_CONFLICT' })
      && D({ revision: 3, deleted: false }, { baseRevision: 3 }) === J({ action: 'update', nextRevision: 4 })
      && D({ revision: 0, deleted: false }, { baseRevision: 0 }) === J({ action: 'update', nextRevision: 1 }), '');
    const e = new X.ctx.NutSyncError('NUT_TOMBSTONE_LIMIT', 'Registre des suppressions saturé.', { limite: 3000, refusees: 2, conservees: 3000 });
    const e0 = new X.ctx.NutSyncError('X', 'y');
    const ErrCtx = vm.runInContext('Error', X.ctx);          // l'`Error` DU CONTEXTE de Code.js (pas celle de Node)
    t('B-NS02 A02 `NutSyncError` : une vraie erreur (instance de l\'`Error` du moteur), de nom `NutSyncError`, portant code · message · détails (vides par défaut)',
      e instanceof ErrCtx && e.name === 'NutSyncError' && e.code === 'NUT_TOMBSTONE_LIMIT' && e.message === 'Registre des suppressions saturé.' && J(e.details) === J({ limite: 3000, refusees: 2, conservees: 3000 })
      && J(e0.details) === '{}' && e.constructor === X.ctx.NutSyncError, J({ name: e.name }));
  }

  /* ═══ B — le registre : 2 999 → accepté · 3 000 → refus EXPLICITE · rien d'écrit à moitié · idempotence ═════════════════════════════ */
  if (voulu('B')) {
    const X = P1.serveur();
    const m = email('reg');
    const remplir = (n) => X.ctx.saveUserData_(m, { email: m, profile: { name: 'N', foodSupprimes: mille(0, n), foodLog: [ligne('Repas déjà là', 'deja-00000001')] }, prs: {}, sessions: [] });
    const etat = () => { const c = X.lireCompte(m); const p = c.profile; return canon({ fs: p.foodSupprimes, fl: p.foodLog, sf: p.savedFoods, nr: p.nutRev, no: p.nutOps, rn: c.recupNut }); };
    remplir(2999);
    const r1 = X.envoi(m, { foodSupprimes: mille(2999, 3000), foodLogV: 3, requestId: rid() });
    t('B-NS02 B01 ⭐ (test 1) registre à 2 999 suppressions : une nouvelle est ACCEPTÉE (ok:true, accusé avec requestId et serverRevision), le registre en compte 3 000',
      r1.j.ok === true && typeof r1.j.requestId === 'string' && Number.isSafeInteger(r1.j.serverRevision) && r1.j.serverRevision >= 1 && (X.lireCompte(m).profile.foodSupprimes || []).length === 3000, J({ ok: r1.j.ok, n: (X.lireCompte(m).profile.foodSupprimes || []).length }));
    const avantReg = canon(X.lireCompte(m).profile.foodSupprimes);
    const avant = etat();
    /* l'envoi DIFFÉRÉ contient AUSSI du journal et des favoris : ils doivent PASSER (↪️ ADAPTÉ le 02/11/2026, NUT-SYNC-02 phase A — avant, ce même envoi refusait TOUT le volet ; le plafond, lui, est CONSERVÉ) */
    const r2 = X.envoi(m, { foodSupprimes: mille(3000, 3001), foodLog: [ligne('Repas déjà là', 'deja-00000001'), ligne('Repas du refus', 'refus-00000001')], savedFoods: [{ name: 'Favori du refus', kcal: 2, prot: 1, carbs: 1, fat: 1 }], foodLogV: 3, requestId: rid() });
    t('B-NS02 B02 ⭐⭐ (test 2, ADAPTÉ phase A) registre à 3 000 : une nouvelle suppression est DIFFÉRÉE EXPLICITEMENT, ENTRÉE PAR ENTRÉE — réponse ok:true, `nut.tomb.diff` = [{i, code:\'NUT_TOMBSTONE_LIMIT\'}], absente de `nut.tomb.ok`, jamais inscrite (le plafond de 3 000 protège toujours le stockage), journalisée',
      r2.j.ok === true && r2.j.status === 'ok' && J(r2.j.nut.tomb.diff) === J([{ i: 'tmb103000-aaaa', code: 'NUT_TOMBSTONE_LIMIT' }]) && r2.j.nut.tomb.ok.length === 0 && r2.j.nut.tomb.n === 3000 && r2.j.nut.tomb.v === 1
      && !(X.lireCompte(m).profile.foodSupprimes || []).some((e) => e.i === 'tmb103000-aaaa') && (X.lireCompte(m).profile.foodSupprimes || []).length === 3000 && X.journal.some((l) => /foodSupprimes\] DIFFÉRÉ : 1 suppression/.test(l)), r2.t.slice(0, 300));
    t('B-NS02 B03 ⭐⭐ (test 3, ADAPTÉ phase A) le PLAFOND TIENT : le registre est IDENTIQUE octet pour octet à celui d\'avant l\'envoi différé — rien d\'ajouté au-delà de 3 000, rien de purgé (le plafond reste protecteur jusqu\'à la phase B)',
      canon(X.lireCompte(m).profile.foodSupprimes) === avantReg, '');
    /* un envoi plus riche : plusieurs suppressions en trop + du journal + des favoris + une pesée — RIEN ne doit être bloqué */
    const r3 = X.envoi(m, { foodSupprimes: mille(3001, 3004), foodLog: [ligne('Repas déjà là', 'deja-00000001'), ligne('Nouveau', 'neuf-00000001')], savedFoods: [{ name: 'Fav', kcal: 1, prot: 1, carbs: 1, fat: 1 }], weightLog: [{ date: '2026-11-01', kg: 80 }], foodLogV: 3, requestId: rid() });
    const c3 = X.lireCompte(m);
    t('B-NS02 B04 ⭐ (ADAPTÉ phase A) une suppression différée NE BLOQUE RIEN : dans le même envoi (3 suppressions en trop, un repas neuf, un favori, une pesée) le repas neuf est écrit avec sa révision, le favori est enregistré, la pesée aussi, l\'accusé annonce les révisions — et les 3 suppressions sont dans `diff`, jamais dans `ok`',
      r3.j.ok === true && r3.j.nut.tomb.diff.length === 3 && r3.j.nut.tomb.ok.length === 0 && (c3.profile.foodLog || []).some((x) => x.id === 'neuf-00000001' && x.rev === 1) && r3.j.nut.acks.some((a) => a.i === 'neuf-00000001' && a.r === 1)
      && (c3.profile.savedFoods || []).some((f) => f.name === 'Fav') && J(c3.weightLog) === J([{ date: '2026-11-01', kg: 80 }]) && (c3.profile.foodSupprimes || []).length === 3000 && canon(c3.profile.foodSupprimes) === avantReg, r3.t.slice(0, 220));
    const r4 = X.envoi(m, { foodSupprimes: mille(0, 3000), foodLogV: 3, requestId: rid() });
    const r4b = X.envoi(m, { foodSupprimes: mille(0, 3000), foodLogV: 3, requestId: rid() });
    t('B-NS02 B05 ⭐ (test 5) RÉÉMISSION d\'une suppression déjà connue, même registre plein : ACCEPTÉE (ok:true, nommée dans `nut.tomb.ok`, aucune différée), idempotente — le registre reste exactement ce qu\'il était, deux fois de suite',
      r4.j.ok === true && r4b.j.ok === true && r4.j.nut.tomb.ok.length === 3000 && r4.j.nut.tomb.diff.length === 0 && (X.lireCompte(m).profile.foodSupprimes || []).length === 3000 && canon(X.lireCompte(m).profile.foodSupprimes) === canon(mille(0, 2999).concat(mille(2999, 3000))), '');
    const avant6 = etat();
    const rV = X.envoi(m, { foodSupprimes: mille(3000, 3001), foodLogV: 3 });
    t('B-NS02 B06 (ADAPTÉ phase A) sans `requestId` (appareil qui ne sait pas lire un accusé) la porte de version REFUSE explicitement et en entier (NUT_CLIENT_INCOMPATIBLE, non réessayable) et l\'état Nutrition est intact — le détail des cas est dans `nut_phasea01`',
      rV.j.ok === false && rV.j.code === 'NUT_CLIENT_INCOMPATIBLE' && rV.j.retryable === false && rV.j.requestId === '' && etat() === avant6, rV.t.slice(0, 160));
  }

  /* ═══ C — les révisions par repas, en séquence ═══════════════════════════════════════════════════════════════════════════════ */
  if (voulu('C')) {
    const X = P1.serveur();
    const m = email('rev');
    X.compte(m, {});
    const R1 = rid();
    const X1 = ligne('Repas X', 'mealx-00000001');
    const r1 = X.envoi(m, { foodLog: [X1], foodLogV: 3, requestId: R1 });
    const c1 = (X.lireCompte(m).profile.foodLog || [])[0] || {};
    t('B-NS02 C01 ⭐ création : le SERVEUR pose la révision (1) et son horodatage ; l\'accusé la rend ; le requestId est répété ; la révision de compte avance',
      r1.j.ok === true && r1.j.requestId === R1 && r1.j.serverRevision === 1 && c1.rev === 1 && Number.isSafeInteger(c1.modifiedAt) && J(r1.j.nut.acks) === J([{ i: 'mealx-00000001', r: 1 }]) && r1.j.nut.complet === true, r1.t.slice(0, 260));
    t('B-NS02 C01b la révision annoncée par le client à la création n\'est JAMAIS crue (un client qui prétend rev:99 reçoit 1) et le contenu métier est conservé à l\'octet',
      (() => { const Y = P1.serveur(); const mm = email('rev99'); Y.compte(mm, {}); const rr = Y.envoi(mm, { foodLog: [ligne('Y', 'mealy-00000001', { rev: 99 })], foodLogV: 3, requestId: rid() });
        const l = (Y.lireCompte(mm).profile.foodLog || [])[0] || {}; return l.rev === 1 && rr.j.nut.acks[0].r === 1 && metier(l) === metier(ligne('Y', 'mealy-00000001')); })(), '');

    /* deux appareils, même base (révision 1) — les DEUX ORDRES d'arrivée (tests 6, 7, 8) */
    for (const ordre of ['A-puis-B', 'B-puis-A']) {
      const Z = P1.serveur(); const mm = email('conf' + ordre);
      Z.compte(mm, {});
      Z.envoi(mm, { foodLog: [ligne('Repas X', 'mealx-00000001')], foodLogV: 3, requestId: rid() });
      const vA = ligne('Repas X', 'mealx-00000001', { rev: 1, kcal: 150 }), vB = ligne('Repas X', 'mealx-00000001', { rev: 1, kcal: 200 });
      const premier = ordre === 'A-puis-B' ? vA : vB, second = ordre === 'A-puis-B' ? vB : vA;
      const p = Z.envoi(mm, { foodLog: [premier], foodLogV: 3, requestId: rid() });
      const s = Z.envoi(mm, { foodLog: [second], foodLogV: 3, requestId: rid() });
      const fin = (Z.lireCompte(mm).profile.foodLog || []);
      const zone = ((Z.lireCompte(mm).recupNut || {}).foodLog || []);
      t('B-NS02 C02 ⭐⭐ (tests 6-8) deux appareils modifient le MÊME repas à partir de la révision 1, ordre « ' + ordre + ' » : UN SEUL changement est accepté (révision 2), le second reçoit un CONFLIT explicite (la version du serveur + sa révision), aucun écrasement',
        p.j.ok === true && J(p.j.nut.acks) === J([{ i: 'mealx-00000001', r: 2 }]) && p.j.nut.conflits.length === 0
        && s.j.ok === true && s.j.nut.acks.length === 0 && s.j.nut.conflits.length === 1 && s.j.nut.conflits[0].i === 'mealx-00000001' && s.j.nut.conflits[0].r === 2 && s.j.nut.conflits[0].ligne.kcal === premier.kcal
        && fin.length === 1 && fin[0].kcal === premier.kcal && fin[0].rev === 2, J({ fin: fin.map((x) => [x.kcal, x.rev]), conf: s.j.nut.conflits.length }));
      t('B-NS02 C03 ⭐ … et la version PERDANTE n\'est pas jetée : elle est en zone de récupération (motif « conflit »), l\'ancienne version aussi (« modifiee ») — rien n\'est perdu côté serveur',
        zone.some((z) => z.m === 'conflit' && z.l.kcal === second.kcal) && zone.some((z) => z.m === 'modifiee' && z.l.kcal === 130), J(zone.map((z) => [z.m, z.l.kcal])));
    }

    /* deux appareils ajoutent des repas DIFFÉRENTS (test 9, séquence) */
    {
      const Z = P1.serveur(); const mm = email('add'); Z.compte(mm, {});
      Z.envoi(mm, { foodLog: [ligne('A1', 'repas-a-0000001')], foodLogV: 3, requestId: rid() });
      Z.envoi(mm, { foodLog: [ligne('B1', 'repas-b-0000001')], foodLogV: 3, requestId: rid() });
      const fin = (Z.lireCompte(mm).profile.foodLog || []);
      t('B-NS02 C04 (test 9, séquence) deux appareils qui ajoutent des repas à identités DIFFÉRENTES : les deux sont conservés, chacun à la révision 1', fin.length === 2 && fin.every((x) => x.rev === 1), J(fin.map((x) => [x.name, x.rev])));
    }

    /* suppression et modification concurrentes (test 10, séquence) : la suppression gagne dans les deux ordres */
    for (const ordre of ['modif-puis-suppr', 'suppr-puis-modif']) {
      const Z = P1.serveur(); const mm = email('ms' + ordre); Z.compte(mm, {});
      Z.envoi(mm, { foodLog: [ligne('Repas X', 'mealx-00000001'), ligne('Autre', 'autre-00000001')], foodLogV: 3, requestId: rid() });
      const modif = () => Z.envoi(mm, { foodLog: [ligne('Repas X', 'mealx-00000001', { rev: 1, kcal: 222 }), ligne('Autre', 'autre-00000001', { rev: 1 })], foodLogV: 3, requestId: rid() });
      const suppr = () => Z.envoi(mm, { foodLog: [ligne('Autre', 'autre-00000001', { rev: 1 })], foodSupprimes: [{ i: 'mealx-00000001', t: 5 }], foodLogV: 3, requestId: rid() });
      let rm;
      if (ordre === 'modif-puis-suppr') { modif(); suppr(); rm = modif(); } else { suppr(); rm = modif(); }
      const fin = (Z.lireCompte(mm).profile.foodLog || []);
      const zone = ((Z.lireCompte(mm).recupNut || {}).foodLog || []);
      t('B-NS02 C05 ⭐⭐ (test 10, séquence) suppression et modification du même repas, ordre « ' + ordre + ' » : AUCUNE résurrection (le repas n\'est plus au journal, même renvoyé modifié après coup), le serveur dit « supprimé » (NUT_ENTRY_DELETED), la version modifiée reste récupérable',
        !fin.some((x) => x.id === 'mealx-00000001') && fin.length === 1 && rm.j.nut.rejets.some((r) => r.i === 'mealx-00000001' && r.code === 'NUT_ENTRY_DELETED')
        && zone.some((z) => z.l.id === 'mealx-00000001' && z.l.kcal === 222), J({ fin: fin.map((x) => x.name), zone: zone.map((z) => [z.m, z.l.kcal]), rejets: rm.j.nut.rejets }));
    }

    /* idempotence : la retransmission d'un envoi DÉJÀ appliqué (la réponse s'est perdue) */
    {
      const Z = P1.serveur(); const mm = email('idem'); Z.compte(mm, {});
      const RQ = rid();
      const corpsEnvoi = { foodLog: [ligne('Repas X', 'mealx-00000001'), ligne('Autre', 'autre-00000001')], foodLogV: 3, requestId: RQ };
      const r1 = Z.envoi(mm, corpsEnvoi);
      const apres1 = canon(Z.lireCompte(mm).profile);
      const r2 = Z.envoi(mm, corpsEnvoi);
      t('B-NS02 C06 ⭐ (test 11, serveur) retransmission du MÊME envoi (réponse perdue) : même accusé (mêmes révisions), `deja:true`, rien de réappliqué — le profil est identique octet pour octet, aucun doublon, la révision de compte n\'avance pas',
        r1.j.ok === true && r2.j.ok === true && r2.j.nut.deja === true && J(r2.j.nut.acks) === J(r1.j.nut.acks) && canon(Z.lireCompte(mm).profile) === apres1 && (Z.lireCompte(mm).profile.foodLog || []).length === 2 && r2.j.serverRevision === r1.j.serverRevision, r2.t.slice(0, 220));
      /* … et un nouvel identifiant d'opération avec la même charge : toujours aucun doublon (le contenu identique ne se redécide pas) */
      const r3 = Z.envoi(mm, Object.assign({}, corpsEnvoi, { requestId: rid() }));
      t('B-NS02 C07 ⭐ (test 11) le même contenu renvoyé sous un AUTRE identifiant d\'opération (l\'appareil a perdu le sien) : aucun doublon, aucun conflit contre lui-même, aucune copie en zone',
        r3.j.ok === true && r3.j.nut.conflits.length === 0 && (Z.lireCompte(mm).profile.foodLog || []).length === 2 && (((Z.lireCompte(mm).recupNut || {}).foodLog) || []).length === 0, r3.t.slice(0, 200));
      /* … et si, entre-temps, un autre appareil a modifié le repas, la retransmission de l'ancien envoi ne crée PAS de conflit fantôme */
      const RQ2 = rid();
      const e1 = { foodLog: [ligne('Repas X', 'mealx-00000001', { rev: 1, kcal: 150 })], foodLogV: 3, requestId: RQ2 };
      const a1 = Z.envoi(mm, e1);
      Z.envoi(mm, { foodLog: [ligne('Repas X', 'mealx-00000001', { rev: 2, kcal: 175 })], foodLogV: 3, requestId: rid() });   // un autre appareil modifie ensuite
      const a2 = Z.envoi(mm, e1);                                                                                           // retransmission tardive du premier
      t('B-NS02 C08 ⭐ retransmission TARDIVE d\'un envoi appliqué alors qu\'un autre appareil a modifié le repas depuis : le serveur reconnaît l\'opération (même accusé), PAS de conflit fantôme, la version la plus récente est intacte',
        a1.j.ok === true && a2.j.ok === true && a2.j.nut.deja === true && a2.j.nut.conflits.length === 0 && (Z.lireCompte(mm).profile.foodLog.find((x) => x.id === 'mealx-00000001') || {}).kcal === 175, a2.t.slice(0, 220));
    }

    /* anciennes entrées sans révision : migrées sans perte */
    {
      const Z = P1.serveur(); const mm = email('mig');
      const anciens = [ligne('Ancien 1', 'ancien-0000001'), ligne('Ancien 2', 'ancien-0000002')];
      Z.compte(mm, { foodLog: anciens.map((x) => Object.assign({}, x)) });
      const avantTout = canon(Z.lireCompte(mm).profile.foodLog);
      Z.envoi(mm, { foodLog: anciens, foodLogV: 3, requestId: rid() });          // une synchro sans changement ne touche à rien
      t('B-NS02 C09 ⭐ anciennes entrées sans révision : une synchronisation SANS changement ne les modifie pas (ni révision posée, ni horodatage, ni octet) — compatibles, rien à migrer de force', canon(Z.lireCompte(mm).profile.foodLog) === avantTout, '');
      Z.envoi(mm, { foodLog: [Object.assign({}, anciens[0], { kcal: 99 }), anciens[1]], foodLogV: 3, requestId: rid() });   // une vraie modification, base 0
      const fin = Z.lireCompte(mm).profile.foodLog;
      t('B-NS02 C10 ⭐ … la PREMIÈRE vraie modification d\'une ancienne entrée (révision de base 0) est acceptée et la fait passer à la révision 1, identité et autres valeurs conservées ; l\'autre ancienne entrée reste telle quelle',
        fin.find((x) => x.id === 'ancien-0000001').rev === 1 && fin.find((x) => x.id === 'ancien-0000001').kcal === 99 && metier(Object.assign({}, fin.find((x) => x.id === 'ancien-0000001'), { kcal: 130 })) === metier(anciens[0])
        && canon(fin.find((x) => x.id === 'ancien-0000002')) === canon(anciens[1]), J(fin.map((x) => [x.id, x.rev, x.kcal])));
    }

    /* ancien client (test 13) */
    {
      /* ↪️ ADAPTÉ le 02/11/2026 (NUT-SYNC-02 phase A, puis CORRECTION du même jour — R30) : ces trois témoins éprouvent le chemin « ancien client » SUR UN COMPTE QUI A DÉJÀ DES RÉVISIONS — en production la porte par compte le refuse en entier ; ils tournent donc sur un serveur « legacy » de BANC
         (`compatStrict:false` : la porte par compte est neutralisée pour eux seuls), explicitement. Ce n'est PAS un levier de production : la constante globale `NUT_COMPAT_STRICT_` a été retirée. */
      const Z = P1.serveur({ compatStrict: false }); const mm = email('old'); Z.compte(mm, {});
      Z.envoi(mm, { foodLog: [ligne('Révisé', 'revis-00000001'), ligne('Frère', 'frere-00000001')], foodLogV: 3, requestId: rid() });
      Z.envoi(mm, { foodLog: [ligne('Révisé', 'revis-00000001', { rev: 1, kcal: 140 }), ligne('Frère', 'frere-00000001', { rev: 1 })], foodLogV: 3, requestId: rid() });   // révisé : rev 2
      const base = Z.lireCompte(mm).profile.foodLog;
      /* (a) un ancien client (corps d'AVANT : ni foodLogV, ni requestId, ni révision) renvoie sa vieille copie MODIFIÉE */
      const o1 = Z.envoi(mm, { foodLog: [ligne('Révisé', 'revis-00000001', { kcal: 999 }), ligne('Frère', 'frere-00000001')] });
      const apres = Z.lireCompte(mm).profile.foodLog;
      t('B-NS02 C11 ⭐⭐ (test 13a) ANCIEN client (sans révision) qui renvoie une version périmée et modifiée d\'un repas déjà révisé : le serveur la REFUSE (la version récente reste, intacte), la version envoyée est gardée en zone (« sans_revision »)',
        canon(apres) === canon(base) && ((Z.lireCompte(mm).recupNut || {}).foodLog || []).some((z) => z.m === 'sans_revision' && z.l.kcal === 999) && o1.j.nut.rejets.some((r) => r.code === 'NUT_INVALID_REVISION'), J(apres.map((x) => [x.name, x.kcal, x.rev])));
      /* (b) un ancien client qui envoie une liste plus COURTE */
      const o2 = Z.envoi(mm, { foodLog: [ligne('Nouveau par ancien', 'vieux-00000001')] });
      const apres2 = Z.lireCompte(mm).profile.foodLog;
      t('B-NS02 C12 ⭐⭐ (test 13b) ANCIEN client qui envoie une liste plus courte : les repas RÉVISÉS par un appareil à jour ne sont pas retirés (il ne sait ni les révisions ni les suppressions), son repas neuf est ajouté',
        apres2.some((x) => x.id === 'revis-00000001') && apres2.some((x) => x.id === 'frere-00000001') && apres2.some((x) => x.id === 'vieux-00000001') && o2.j.ok === true, J(apres2.map((x) => x.name)));
      /* (c) un ancien client reste utile sur ce que personne n'a révisé */
      const Q = P1.serveur({ compatStrict: false }); const mq = email('old2'); Q.compte(mq, { foodLog: [ligne('Jamais révisé', 'jamais-0000001')] });
      Q.envoi(mq, { foodLog: [ligne('Jamais révisé', 'jamais-0000001', { kcal: 77 })] });
      t('B-NS02 C13 ⭐ (test 13c) un ancien client peut toujours corriger ce que personne n\'a jamais révisé (comportement d\'avant conservé), sans que la révision monte', (() => { const l = Q.lireCompte(mq).profile.foodLog[0]; return l.kcal === 77 && !('rev' in l); })(), '');
    }

    /* le verrou est bien pris ET libéré, y compris quand une erreur éclate au milieu (finally) */
    {
      const Z = P1.serveur({ LockService: (() => { let pris = 0, rendus = 0; return { getScriptLock: () => ({ tryLock: () => { pris++; return true; }, releaseLock: () => { rendus++; }, __n: () => [pris, rendus] }), __n: () => [pris, rendus] }; })() });
      const mm = email('verrou'); Z.compte(mm, {});
      const n0 = Z.ctx.LockService.__n();
      Z.envoi(mm, { foodLog: [ligne('A', 'repas-a-0000001')], foodLogV: 3, requestId: rid() });
      Z.envoi(mm, { foodSupprimes: mille(0, 3001), foodLogV: 3, requestId: rid() });          // refus métier
      /* une ERREUR qui éclate à l'écriture du compte (stockage indisponible) : le verrou n'a pas été rendu avant — c'est `finally` qui doit le faire (le verrou est rendu tôt sur les chemins qui écrivent) */
      const ecrire0 = Z.ctx.saveUserData_;
      Z.ctx.saveUserData_ = function () { throw new Error('écriture impossible (simulée)'); };
      const rErr = Z.envoi(mm, { foodLog: [ligne('B', 'repas-b-0000001')], foodLogV: 3, requestId: rid() });
      Z.ctx.saveUserData_ = ecrire0;
      const n1 = Z.ctx.LockService.__n();
      t('B-NS02 C14 ⭐ le verrou est pris UNE fois par envoi et RENDU à chaque fois (réussite, refus métier ET erreur d\'écriture au milieu) — jamais gardé ; l\'erreur est annoncée réessayable',
        n1[0] - n0[0] === 3 && n1[1] - n0[1] === 3 && rErr.j.ok === false && rErr.j.code === 'SERVER_ERROR' && rErr.j.retryable === true, J({ n0, n1, r: rErr.j.code }));
    }
    /* le verrou couvre l'ÉCRITURE du compte et rien de plus lent : rendu AVANT le miroir Sheets et l'e-mail de bienvenue (il est global au script — les garder dessous ferait attendre tous les comptes) */
    {
      let tenu = 0; const obs = { ecriture: null, miroir: null, mail: null };
      const Z = P1.serveur({ LockService: { getScriptLock: () => ({ tryLock: () => { tenu++; return true; }, releaseLock: () => { tenu--; } }) } });
      const ecrire0 = Z.ctx.saveUserData_;
      Z.ctx.saveUserData_ = function () { obs.ecriture = tenu; return ecrire0.apply(this, arguments); };
      Z.ctx._mirrorUserToSheet_ = function () { obs.miroir = tenu; };
      Z.ctx.MailApp.sendEmail = function () { obs.mail = tenu; };
      const mm = email('verrou2');                                                      // un compte NEUF : l'e-mail de bienvenue part aussi
      const r = Z.envoi(mm, { welcome: true, foodLog: [ligne('A', 'repas-a-0000002')], foodLogV: 3, requestId: rid() });
      t('B-NS02 C15 ⭐ le verrou est TENU pendant l\'écriture du compte (un seul `saveUserData_`) et RENDU avant le miroir Sheets et l\'e-mail de bienvenue — ces deux écritures lentes ne bloquent aucun autre compte',
        r.j.ok === true && obs.ecriture === 1 && obs.miroir === 0 && obs.mail === 0 && tenu === 0, J({ obs, tenu, ok: r.j.ok }));
    }
  }

  /* ═══ D — VRAIE CONCURRENCE : des processus, un verrou entre processus ══════════════════════════════════════════════════════════════ */
  if (voulu('D')) {
    /* D01 — deux modifications simultanées du même repas (tests 6, 7, 8) : on répète, la course est réelle */
    const REP = 8; let gA = 0, gB = 0, defauts = [];
    for (let k = 0; k < REP; k++) {
      const m = email('conc');
      await pool.init(0, m, { code: CODE_PERSO });
      await pool.post(0, corps(m, { foodLog: [ligne('Repas X', 'mealx-00000001')], requestId: rid() }));
      const vA = ligne('Repas X', 'mealx-00000001', { rev: 1, kcal: 150 }), vB = ligne('Repas X', 'mealx-00000001', { rev: 1, kcal: 200 });
      const [ra, rb] = await pool.simultane([{ k: 1, corps: corps(m, { foodLog: [vA], requestId: rid() }) }, { k: 2, corps: corps(m, { foodLog: [vB], requestId: rid() }) }], true);
      const ja = lj(ra), jb = lj(rb);
      const compte = await pool.lire(0, m);
      const fin = compte.profile.foodLog || [], zone = ((compte.recupNut || {}).foodLog || []);
      const gagnant = ja.nut && ja.nut.acks.length === 1 ? 'A' : (jb.nut && jb.nut.acks.length === 1 ? 'B' : '?');
      if (gagnant === 'A') gA++; else if (gagnant === 'B') gB++;
      const perdant = gagnant === 'A' ? jb : ja, kg = gagnant === 'A' ? 150 : 200, kp = gagnant === 'A' ? 200 : 150;
      const ok = gagnant !== '?' && fin.length === 1 && fin[0].kcal === kg && fin[0].rev === 2 && perdant.nut.conflits.length === 1 && perdant.nut.conflits[0].ligne.kcal === kg
        && zone.some((z) => z.m === 'conflit' && z.l.kcal === kp) && ja.ok === true && jb.ok === true;
      if (!ok) defauts.push({ k, gagnant, fin: fin.map((x) => [x.kcal, x.rev]), ja: ja.nut && [ja.nut.acks, ja.nut.conflits.length], jb: jb.nut && [jb.nut.acks, jb.nut.conflits.length] });
    }
    t('B-NS02 D01 ⭐⭐⭐ (tests 6, 7, 8 — VRAIE CONCURRENCE) deux processus serveur, deux envois lancés ENSEMBLE, le même repas modifié à partir de la même révision, ' + REP + ' fois : à chaque fois UN SEUL changement accepté (révision 2), l\'autre reçoit un conflit explicite avec la version gagnante, la version perdante est en zone — gagnant A ' + gA + ' fois, B ' + gB + ' fois',
      defauts.length === 0, J(defauts.slice(0, 2)));

    /* D02 — deux appareils ajoutent des repas DIFFÉRENTS en même temps (test 9) */
    let d2 = [];
    for (let k = 0; k < 6; k++) {
      const m = email('add'); await pool.init(0, m, { code: CODE_PERSO });
      const [ra, rb] = await pool.simultane([{ k: 1, corps: corps(m, { foodLog: [ligne('A' + k, 'repas-a-' + String(1000000 + k))], requestId: rid() }) }, { k: 2, corps: corps(m, { foodLog: [ligne('B' + k, 'repas-b-' + String(1000000 + k))], requestId: rid() }) }], true);
      const fin = ((await pool.lire(0, m)).profile.foodLog || []);
      if (!(lj(ra).ok && lj(rb).ok && fin.length === 2 && fin.every((x) => x.rev === 1))) d2.push({ k, n: fin.length, ra: lj(ra).ok, rb: lj(rb).ok });
    }
    t('B-NS02 D02 ⭐⭐ (test 9 — VRAIE CONCURRENCE) deux appareils ajoutent en même temps des repas à identités différentes, 6 fois : les DEUX repas sont toujours au compte (sans verrou, l\'un des deux disparaît)', d2.length === 0, J(d2));

    /* D03 — suppression et modification simultanées (test 10) */
    let d3 = [];
    for (let k = 0; k < 6; k++) {
      const m = email('ms'); await pool.init(0, m, { code: CODE_PERSO });
      await pool.post(0, corps(m, { foodLog: [ligne('Repas X', 'mealx-00000001'), ligne('Autre', 'autre-00000001')], requestId: rid() }));
      const [ra, rb] = await pool.simultane([
        { k: 1, corps: corps(m, { foodLog: [ligne('Repas X', 'mealx-00000001', { rev: 1, kcal: 333 }), ligne('Autre', 'autre-00000001', { rev: 1 })], requestId: rid() }) },
        { k: 2, corps: corps(m, { foodLog: [ligne('Autre', 'autre-00000001', { rev: 1 })], foodSupprimes: [{ i: 'mealx-00000001', t: 9 }], requestId: rid() }) }], true);
      const c = await pool.lire(0, m); const fin = c.profile.foodLog || [], zone = ((c.recupNut || {}).foodLog || []);
      const reg = (c.profile.foodSupprimes || []).some((e) => e.i === 'mealx-00000001');
      if (!(lj(ra).ok && lj(rb).ok && reg && !fin.some((x) => x.id === 'mealx-00000001') && fin.length === 1 && zone.some((z) => z.l.id === 'mealx-00000001' && z.l.kcal === 333))) d3.push({ k, fin: fin.map((x) => x.name), reg, zone: zone.map((z) => [z.m, z.l.kcal]) });
    }
    t('B-NS02 D03 ⭐⭐ (test 10 — VRAIE CONCURRENCE) un appareil supprime pendant que l\'autre modifie le même repas, 6 fois : le repas est TOUJOURS absent au final (aucune résurrection), la suppression est au registre, la version modifiée reste récupérable en zone', d3.length === 0, J(d3));

    /* D04 — CONTRÔLE NÉGATIF DU BANC LUI-MÊME : un verrou qui ne verrouille rien doit FAIRE apparaître la perte de mise à jour */
    poolSans = lancerPool(dirSans, 3, { NUT_SANS_VERROU: '1' });
    await poolSans.prets;
    let pertes = 0, essais = 5;
    for (let k = 0; k < essais; k++) {
      const m = email('sans'); await poolSans.init(0, m, { code: CODE_PERSO });
      await poolSans.post(0, corps(m, { foodLog: [ligne('Repas X', 'mealx-00000001')], requestId: rid() }));
      const [ra, rb] = await poolSans.simultane([{ k: 1, corps: corps(m, { foodLog: [ligne('Repas X', 'mealx-00000001', { rev: 1, kcal: 150 })], requestId: rid() }) }, { k: 2, corps: corps(m, { foodLog: [ligne('Repas X', 'mealx-00000001', { rev: 1, kcal: 200 })], requestId: rid() }) }], true);
      const ja = lj(ra), jb = lj(rb);
      const deuxAcceptes = ja.nut && jb.nut && ja.nut.acks.length === 1 && jb.nut.acks.length === 1;
      if (deuxAcceptes) pertes++;
    }
    t('B-NS02 D04 ⭐⭐ CONTRÔLE NÉGATIF DU BANC (processus dont le verrou ne verrouille rien) : la perte de mise à jour APPARAÎT — les deux envois sont « acceptés » à la même révision, l\'un des deux est écrasé en silence (' + pertes + '/' + essais + ' essais) : le banc sait détecter l\'absence de verrou',
      pertes >= 1, J({ pertes, essais }));

    /* D05 — verrou indisponible (test 12) */
    {
      const m = email('lock'); await pool.init(0, m, { code: CODE_PERSO });
      await pool.post(0, corps(m, { foodLog: [ligne('Repas X', 'mealx-00000001')], requestId: rid() }));
      const avant = canon((await pool.lire(0, m)).profile);
      await pool.regler(1, 'NUT_VERROU_MS_', 300);
      fs.mkdirSync(path.join(dirPool, 'verrou'));                          // quelqu'un tient le verrou
      const t0 = Date.now();
      const rb = await pool.post(1, corps(m, { foodLog: [ligne('Repas X', 'mealx-00000001', { rev: 1, kcal: 150 })], weightLog: [{ date: '2026-11-01', kg: 70 }], requestId: rid() }));
      const dt = Date.now() - t0; const jb = lj(rb);
      t('B-NS02 D05 ⭐⭐ (test 12) verrou INDISPONIBLE : réponse { ok:false, code:\'NUT_LOCK_BUSY\', retryable:true } après avoir attendu le verrou, et RIEN n\'est écrit (le compte est identique octet pour octet, pesée comprise)',
        jb.ok === false && jb.code === 'NUT_LOCK_BUSY' && jb.retryable === true && dt >= 250 && canon((await pool.lire(0, m)).profile) === avant, J({ code: jb.code, dt }));
      fs.rmdirSync(path.join(dirPool, 'verrou'));                           // libéré
      const rr = await pool.post(1, corps(m, { foodLog: [ligne('Repas X', 'mealx-00000001', { rev: 1, kcal: 150 })], requestId: rid() }));
      const c = await pool.lire(0, m);
      t('B-NS02 D06 ⭐ … et la nouvelle tentative, une fois le verrou rendu, réussit UNE fois (révision 2, aucun doublon) — l\'échec réessayable n\'avait rien laissé derrière lui',
        lj(rr).ok === true && (c.profile.foodLog || []).length === 1 && c.profile.foodLog[0].rev === 2 && !fs.existsSync(path.join(dirPool, 'verrou')), J(lj(rr).ok));
      await pool.regler(1, 'NUT_VERROU_MS_', 20000);
    }

    /* D07 — coupure du réseau APRÈS l'écriture (test 11) : la réponse est perdue, l'appareil renvoie */
    {
      const m = email('coupure'); await pool.init(0, m, { code: CODE_PERSO });
      const RQ = rid();
      const envoi = corps(m, { foodLog: [ligne('Repas X', 'mealx-00000001'), ligne('Repas Y', 'mealy-00000001')], requestId: RQ });
      const r1 = await pool.post(1, envoi);                                 // écrit côté serveur ; on JETTE la réponse (le réseau est coupé)
      const apres1 = canon((await pool.lire(0, m)).profile);
      const r2 = await pool.post(2, envoi);                                 // même envoi, un AUTRE processus serveur
      const apres2 = canon((await pool.lire(0, m)).profile);                // l'état juste après la RETRANSMISSION : identique à celui d'après l'envoi d'origine
      const r3 = await pool.post(2, Object.assign({}, envoi, { requestId: rid() }));
      const c = await pool.lire(0, m);
      t('B-NS02 D07 ⭐⭐ (test 11 — deux processus) coupure du réseau APRÈS l\'écriture : l\'appareil renvoie la même opération à un AUTRE processus serveur — même accusé (`deja:true`), puis un autre identifiant avec la même charge : aucun doublon, 2 repas, révision 1 chacun',
        lj(r1).ok === true && lj(r2).ok === true && lj(r2).nut.deja === true && apres2 === apres1 && lj(r3).ok === true && lj(r3).nut.conflits.length === 0
        && (c.profile.foodLog || []).length === 2 && c.profile.foodLog.every((x) => x.rev === 1), J({ n: (c.profile.foodLog || []).length, r1: lj(r1).ok, r2: lj(r2).ok && lj(r2).nut.deja, r3: lj(r3).ok && lj(r3).nut.conflits.length, rev: (c.profile.foodLog || []).map((x) => x.rev) }));
    }

    /* D08 — le registre plein sous concurrence : deux appareils veulent ajouter la DERNIÈRE place */
    {
      const m = email('plein'); await pool.init(0, m, { code: CODE_PERSO, profile: { foodSupprimes: mille(0, 2999) } });
      const [ra, rb] = await pool.simultane([{ k: 1, corps: corps(m, { foodSupprimes: mille(5000, 5001), requestId: rid() }) }, { k: 2, corps: corps(m, { foodSupprimes: mille(6000, 6001), requestId: rid() }) }], true);
      const ja = lj(ra), jb = lj(rb); const reg = ((await pool.lire(0, m)).profile.foodSupprimes || []);
      /* ↪️ ADAPTÉ le 02/11/2026 (NUT-SYNC-02 phase A) : le perdant n'est plus REFUSÉ en bloc (ok:false) mais DIFFÉRÉ entrée par entrée (ok:true, la suppression dans `nut.tomb.diff`) ; l'exigence reste la même et se lit mieux :
         JAMAIS deux acceptées (3 001), jamais une différée silencieuse (annoncée dans `diff`, absente de `ok`), et une seule des deux identités au registre. */
      const dA = ja.nut && ja.nut.tomb ? ja.nut.tomb : { ok: [], diff: [] }, dB = jb.nut && jb.nut.tomb ? jb.nut.tomb : { ok: [], diff: [] };
      const idsReg = reg.map((e) => e.i).filter((i) => i === 'tmb105000-aaaa' || i === 'tmb106000-aaaa');
      t('B-NS02 D08 ⭐ (VRAIE CONCURRENCE, ADAPTÉ phase A) deux appareils demandent en même temps la DERNIÈRE place du registre : l\'un l\'obtient (3 000, nommée dans `tomb.ok`), l\'autre est DIFFÉRÉ explicitement (dans `tomb.diff`, code NUT_TOMBSTONE_LIMIT, absent de `tomb.ok`) — jamais deux acceptés (3 001), jamais une différée silencieuse',
        reg.length === 3000 && ja.ok === true && jb.ok === true && idsReg.length === 1 && [dA, dB].filter((d) => d.ok.length === 1 && d.diff.length === 0).length === 1 && [dA, dB].filter((d) => d.ok.length === 0 && d.diff.length === 1 && d.diff[0].code === 'NUT_TOMBSTONE_LIMIT').length === 1, J({ n: reg.length, a: dA, b: dB }));
    }
  }


  /* la section E (clients navigateur reliés à ces processus serveur) vit dans `nut_sync02_clients.js` */
  if (voulu('E')) await require('./nut_sync02_clients.js')(t, b, PORT, pool, { canon, metier, ligne, email, rid, mille, corps, lj, CODE_PERSO, pause, J }, erreursGlobales);

  t('B-NS02 G99 aucune erreur JavaScript inattendue pendant tout le banc', erreursGlobales.filter((e) => !/quota|refus|faute|écriture/i.test(e)).length === 0, J(erreursGlobales.slice(0, 3)));
  } finally {
    pool.tuer(); if (poolSans) poolSans.tuer();
    try { fs.rmSync(dirPool, { recursive: true, force: true }); fs.rmSync(dirSans, { recursive: true, force: true }); } catch (e) { /* tant pis */ }
  }
};


/* NUT-SYNC-02 phase A : les outils du banc (le pool de vrais processus, les fabriques de données) pour `nut_phasea01.js` — une seule définition (R2), pas une copie. */
module.exports.outils = { canon, metier, ligne, email, rid, mille, corps, lj, CODE_PERSO, pause, J, lancerPool, RACINE };
