'use strict';
/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   🛡️ NUT-SYNC-02 PHASE A — BANC CIBLÉ (02/11/2026, GO du Principal). Bloc : B-PA01. Banc : tools/banc_nut_phasea01.js · contrôle négatif : tools/mut_nut_phasea01.py
   La phase A rend les sauvegardes sûres SANS ajouter le stockage Drive des suppressions : une porte de version pour les anciens clients · des suppressions DIFFÉRÉES entrée par entrée (le plafond de 3 000 reste) · des accusés explicites ·
   le confinement des erreurs Nutrition · UN verrou pour tous les écrivains du compte, durée mesurée · la reprise (retour réseau, retour à l'écran) · le quota local qui ne réduit plus jamais `ft4_sessions`.

   CONDUIT :
     · section S — le VRAI Code.js (vm Node, services Google simulés, compression réelle : `serveur()` de nut_secu_p1.js), par ses vraies portes `doPost`, en séquence, dans la mémoire ;
     · section D — DE VRAIS PROCESSUS serveur (tools/nut_serveur_proc.js) sur des propriétés PARTAGÉES avec un VRAI verrou entre processus : `saveProfile` ET un autre écrivain du compte (`pushHealth`) lancés ENSEMBLE ;
     · section C — le VRAI client (index.html + scripts) dans des contextes navigateur indépendants reliés à ces processus (la fabrique d'appareils de nut_sync02_clients.js, réutilisée telle quelle).
   OBSERVE : chaque réponse brute, le compte stocké (journal, registre, favoris, révision, mémoire des opérations, zone de récupération), les corps réellement ENVOYÉS, le stockage et la mémoire de chaque appareil, les toasts.
   SIMULÉ : les services Google (propriétés en mémoire ou en fichiers, Drive en mémoire, verrou), le réseau, le miroir Supabase (un modèle du contrat de la migration 0003).
   NE COUVRE PAS : le vrai Apps Script déployé (le VRAI LockService, ses délais et son autorisation, les vraies Script Properties et leurs plafonds, la latence Drive), le vrai Supabase, l'iPhone, le stockage Google réel — « NON TESTÉ » dans le rapport.
   ⛔⛔ DONNÉES INVENTÉES SEULEMENT (domaine example.test, repas « … test »). Aucune écriture hors des dossiers temporaires du banc. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const P1 = require('./nut_secu_p1.js');
const S2 = require('./nut_sync02.js');
const CL = require('./nut_sync02_clients.js');

/* `PA01_SEULEMENT=S,D,C` (liste) : ne rejouer que certaines sections (les mutations ne rejouent que ce dont elles ont besoin) ; absent = tout. */
const SECT = process.env.PA01_SEULEMENT || '';
const voulu = (x) => !SECT || SECT.split(',').indexOf(x) >= 0;
/* `PA01_BLOCS=PC04,PC05` (liste) : ne rejouer que certains blocs des sections D et C (une mutation du client n'a pas besoin de rejouer les 40 s des autres scénarios) ; absent = tous. */
const BLOCS = process.env.PA01_BLOCS || '';
const bloc = (x) => !BLOCS || BLOCS.split(',').indexOf(x) >= 0;

module.exports.ecran = async function ecran(t0, b, PORT) {
  console.log('\n-- B-PA01. NUT-SYNC-02 phase A · porte de version · suppressions différées · confinement · verrou unique · reprise · quota --');
  const O = S2.outils;
  const { canon, ligne, email, rid, mille, corps, lj, CODE_PERSO, pause, J, lancerPool } = O;
  const t = (nom, cond, detail) => t0('B-PA01 ' + nom, cond, detail);
  /* Un témoin qui LÈVE une exception n'est ni un vert ni un abandon du banc : c'est un ROUGE nommé (un plantage du banc n'est jamais un verdict ; ici l'exception se compte contre le code qu'on éprouve). Les témoins déjà évalués avant la levée restent comptés. */
  const garde = async (id, f) => { try { await f(); } catch (e) { t(id + ' ⛔ le témoin a levé une exception (' + String(e && e.message || e).slice(0, 100) + ')', false, String(e && e.stack || e).slice(0, 300)); } };
  const erreursGlobales = [];
  const env = (X, m, champs) => X.post(corps(m, Object.assign({ requestId: rid() }, champs)));
  const ancien = (X, m, champs) => X.post(Object.assign({ action: 'saveProfile', email: m, authCode: CODE_PERSO }, champs));   // un envoi d'AVANT : ni `foodLogV` ni `requestId`
  const etatNut = (X, m) => { const c = X.lireCompte(m), p = c.profile; return canon({ fs: p.foodSupprimes, fl: p.foodLog, sf: p.savedFoods, nr: p.nutRev, no: p.nutOps, rn: c.recupNut }); };
  const remplir = (X, m, n) => X.ctx.saveUserData_(m, { email: m, profile: { name: 'N', foodSupprimes: mille(0, n) }, prs: {}, sessions: [] });
  const FAV = (nom) => ({ name: nom, kcal: 1, prot: 1, carbs: 1, fat: 1 });

  /* ═══ S — le serveur, en mémoire ═══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
  if (voulu('S')) {

    /* ── 1. LA PORTE DE VERSION : sur un compte à état v3, un ancien client est REFUSÉ explicitement et en entier ── */
    await garde('PA00', async () => {
      const X = P1.serveur(); const m = email('porte'); X.compte(m, { code: CODE_PERSO });
      env(X, m, { foodLog: [ligne('Repas A', 'pa-a-00000001'), ligne('Repas B', 'pa-b-00000001')], foodSupprimes: [{ i: 'pa-sup-00000001', t: 5 }], savedFoods: [FAV('Favori')] });
      env(X, m, { foodLog: [ligne('Repas A', 'pa-a-00000001', { rev: 1, kcal: 140 }), ligne('Repas B', 'pa-b-00000001', { rev: 1 })] });   // une modification : la zone de récupération garde l'ancienne version
      const avant = etatNut(X, m);
      /* ↪️ ADAPTÉ le 02/11/2026 (correction, GO du Principal — R30). Avant : « la porte est armée par défaut : `NUT_COMPAT_STRICT_ === true` ». Cette constante globale est RETIRÉE (son contraire `= false` n'était pas un retour arrière sûr : il rouvrait la résurrection et l'écrasement) ;
         la porte est PAR COMPTE. Le témoin protège désormais une ABSENCE (le levier non sûr n'existe plus), la version minimale du protocole et la richesse de l'état de départ — un compte à état v3 (registre, journal révisé, mémoire des opérations, marqueur), sur lequel un envoi ancien reste refusé. */
      t('PA00 le levier global `NUT_COMPAT_STRICT_` N\'EXISTE PLUS (une absence protégée : `= false` rouvrait la résurrection et l\'écrasement), la porte est par compte (`_nutAncienRefuse_`), la version minimale du protocole vaut 3 ; l\'état de départ de ce banc est riche (registre, journal révisé, favoris, mémoire des opérations, marqueur, zone de récupération non vide)',
        typeof X.ctx.NUT_COMPAT_STRICT_ === 'undefined' && typeof X.ctx._nutAncienRefuse_ === 'function' && X.ctx.NUT_PROTOCOLE_MIN_ === 3 && X.lireCompte(m).nutProto === 3 && (X.lireCompte(m).recupNut || {}).foodLog && X.lireCompte(m).recupNut.foodLog.length > 0 && (X.lireCompte(m).profile.nutOps || []).length === 2, '');
      const rL = ancien(X, m, { foodLog: [ligne('Repas ancien', 'pa-old-0000001')], savedFoods: [FAV('Fav ancien')], foodSupprimes: [{ i: 'pa-sup-00000002', t: 6 }], weightLog: [{ date: '2026-11-02', kg: 81 }], prs: { Squat: { rm1: 100, kg: 80, reps: 6, date: '2026-11-01' } }, sessions: [{ id: 's1', ts: 1, date: '2026-11-02', exs: [] }] });
      t('PA01 ⭐⭐ un ANCIEN client (ni `foodLogV` ni `requestId`) qui envoie du Nutrition est REFUSÉ EXPLICITEMENT ET EN ENTIER : { status:\'nut_refuse\', ok:false, code:\'NUT_CLIENT_INCOMPATIBLE\', retryable:false, profilEnregistre:true, details:{versionClient, versionMin} } — jamais `ok:true`, jamais d\'accusé',
        rL.j.status === 'nut_refuse' && rL.j.ok === false && rL.j.code === 'NUT_CLIENT_INCOMPATIBLE' && rL.j.retryable === false && rL.j.profilEnregistre === true && J(rL.j.details) === J({ versionClient: 0, versionMin: 3 }) && !('nut' in rL.j) && rL.j.requestId === '', rL.t.slice(0, 300));
      t('PA01b ⭐⭐ RIEN de Nutrition n\'a été lu ni écrit : registre, journal, favoris, révision du compte, mémoire des opérations ET zone de récupération sont IDENTIQUES octet pour octet à ceux d\'avant l\'envoi',
        etatNut(X, m) === avant, '');
      const c = X.lireCompte(m);
      t('PA01c ⭐ … et le reste du MÊME envoi est ENREGISTRÉ (règle d\'or n°3 : une séance, un record, une pesée ne se perdent jamais à cause du Nutrition) : séance, record et pesée sont au compte',
        (c.sessions || []).length === 1 && c.prs && c.prs.Squat && c.prs.Squat.kg === 80 && J(c.weightLog) === J([{ date: '2026-11-02', kg: 81 }]), J({ s: (c.sessions || []).length }));
      t('PA01d le refus est JOURNALISÉ (version reçue et version minimale, aucune donnée, aucune adresse)',
        X.journal.some((l) => /\[FT COMPAT\] Nutrition refusée : client en version 0 \(minimum 3\)/.test(l)) && !X.journal.some((l) => /example\.test/.test(l)), J(X.journal.slice(-3)));
      /* trois façons de nuire, trois refus : ressusciter, écraser, perdre en silence */
      const rA = ancien(X, m, { foodLog: [ligne('Repas ressuscité', 'pa-sup-00000001')] });
      t('PA03a ⭐⭐ un ancien appareil ne peut PAS ressusciter un repas supprimé : la ligne dont la suppression est au registre, renvoyée par lui, est refusée avec tout le reste — le journal du compte n\'en contient toujours pas',
        rA.j.ok === false && rA.j.code === 'NUT_CLIENT_INCOMPATIBLE' && !(X.lireCompte(m).profile.foodLog || []).some((l) => l.id === 'pa-sup-00000001') && etatNut(X, m) === avant, rA.t.slice(0, 200));
      const rB = ancien(X, m, { foodLog: [ligne('Seul repas de l\'ancien', 'pa-seul-0000001')] });
      const rB2 = ancien(X, m, { foodLog: [] });
      t('PA03b ⭐⭐ un ancien appareil ne peut PAS écraser l\'historique : son journal plus court (un repas, ou vide) ne remplace pas celui du compte — 2 repas révisés intacts, rien copié en zone, rien retiré',
        rB.j.ok === false && rB2.j.ok === false && (X.lireCompte(m).profile.foodLog || []).length === 2 && etatNut(X, m) === avant, J({ n: (X.lireCompte(m).profile.foodLog || []).length }));
      const rC = ancien(X, m, { foodLog: [ligne('Repas A', 'pa-a-00000001', { kcal: 999 }), ligne('Repas B', 'pa-b-00000001'), ligne('Saisi par l\'ancien', 'pa-neuf-0000001')] });
      t('PA03c ⭐⭐ un ancien appareil ne perd pas SILENCIEUSEMENT une nouvelle saisie : son repas neuf n\'est pas annoncé « enregistré » (`ok:false`, aucun accusé, aucune révision) — il reste sur SON téléphone ; la version périmée d\'un repas révisé n\'est pas appliquée non plus',
        rC.j.ok === false && !('nut' in rC.j) && !(X.lireCompte(m).profile.foodLog || []).some((l) => l.id === 'pa-neuf-0000001') && (X.lireCompte(m).profile.foodLog.find((l) => l.id === 'pa-a-00000001') || {}).kcal === 140 && etatNut(X, m) === avant, rC.t.slice(0, 160));
    });

    /* ── 2. les frontières de la porte ── */
    await garde('PA02', async () => {
      const cas = [
        ['foodLogV:2 avec requestId', { foodLogV: 2, requestId: rid(), foodLog: [ligne('C1', 'pa-c1-00000001')] }, true],
        ['foodLogV:3 SANS requestId', { foodLogV: 3, foodLog: [ligne('C2', 'pa-c2-00000001')] }, true],
        ['foodLogV:3 avec un requestId invalide (trop court)', { foodLogV: 3, requestId: 'court', foodLog: [ligne('C3', 'pa-c3-00000001')] }, true],
        ['des favoris seuls, sans version', { savedFoods: [FAV('Fav C4')] }, true],
        ['des suppressions seules, sans version', { foodSupprimes: [{ i: 'pa-sup-00000009', t: 7 }] }, true],
        ['foodLogV:3 avec requestId valide', { foodLogV: 3, requestId: rid(), foodLog: [ligne('C6', 'pa-c6-00000001')] }, false],
        ['foodLogV:4 (un client plus récent) avec requestId valide', { foodLogV: 4, requestId: rid(), foodLog: [ligne('C7', 'pa-c7-00000001')] }, false],
      ];
      /* ↪️ ADAPTÉ le 02/11/2026 (correction — R30) : les frontières se jouent sur un compte à ÉTAT v3 (une synchro v3 a déjà été appliquée : la porte y refuse). Sur un compte SANS état v3 la même voie ancienne est TOLÉRÉE (éprouvé par `nut_phasea02`, PB01) — seul un envoi qui se dit v3 sans pouvoir
         lire d'accusé est refusé partout (PB04). `applique` se mesure sur l'état Nutrition complet : rien n'a bougé si l'envoi est refusé. */
      const res = cas.map(([nom, champs, refuse]) => {
        const Y = P1.serveur(); const mm = email('p2'); Y.compte(mm, { code: CODE_PERSO });
        env(Y, mm, { foodLog: [ligne('Base', 'pa-base-0000001')] });                                  // une synchro v3 appliquée : le compte est à état v3
        const avant = etatNut(Y, mm);
        const r = Y.post(Object.assign({ action: 'saveProfile', email: mm, authCode: CODE_PERSO }, champs));
        const applique = etatNut(Y, mm) !== avant;
        return { nom, refuse, ok: refuse ? (r.j.ok === false && r.j.code === 'NUT_CLIENT_INCOMPATIBLE' && !applique) : (r.j.ok === true && applique) };
      });
      t('PA02 ⭐ les FRONTIÈRES de la porte, sur un compte à état v3 : refusés (rien appliqué) — v2 même avec `requestId`, v3 sans `requestId`, `requestId` invalide, favoris seuls, suppressions seules ; acceptés (appliqués) — v3 avec `requestId`, v4 (un client plus récent)',
        res.every((x) => x.ok), J(res.filter((x) => !x.ok)));
      const Y = P1.serveur(); const mm = email('p2b'); Y.compte(mm, { code: CODE_PERSO });
      const r = Y.post({ action: 'saveProfile', email: mm, authCode: CODE_PERSO, weightLog: [{ date: '2026-11-02', kg: 82 }], prs: { Squat: { rm1: 90, kg: 70, reps: 6, date: '2026-11-02' } } });
      t('PA02b un envoi d\'un ancien client SANS aucun champ Nutrition n\'est PAS refusé (rien à refuser) : `ok:true`, pesée et record enregistrés', r.j.ok === true && r.j.status === 'ok' && J(Y.lireCompte(mm).weightLog) === J([{ date: '2026-11-02', kg: 82 }]), r.t.slice(0, 160));
      /* ↪️ REMPLACÉ le 02/11/2026 (correction — R30, un retrait s'écrit). Ce témoin prouvait « le levier de retour arrière `NUT_COMPAT_STRICT_ = false` existe et rétablit le comportement d'avant » : retiré avec le levier (il n'était PAS sûr — mesuré : une ancienne ligne sans identité
         ressuscitait un repas supprimé). Ce qu'il garantissait de bien — « le refus de PA01 vient de la porte, pas d'autre chose » — reste : le MÊME envoi ancien, sur un compte SANS état v3, est accepté ; c'est l'ÉTAT DU COMPTE qui décide. */
      const L = P1.serveur(); const ml = email('etat'); L.compte(ml, { code: CODE_PERSO });
      const rl = L.post({ action: 'saveProfile', email: ml, authCode: CODE_PERSO, foodLog: [ligne('Repas ancien', 'pa-lev-0000001')] });
      t('PA04 ⭐ le refus de PA01 vient bien de l\'ÉTAT DU COMPTE : le MÊME envoi d\'ancien client, sur un compte SANS état v3, est accepté et appliqué (et il ne pose aucun marqueur)',
        rl.j.ok === true && (L.lireCompte(ml).profile.foodLog || []).some((l) => l.id === 'pa-lev-0000001') && L.lireCompte(ml).nutProto === undefined && L.ctx._nutProtoDe_(L.lireCompte(ml)) === 0, rl.t.slice(0, 200));
    });

    /* ── 3. LES SUPPRESSIONS DIFFÉRÉES : l'accusé dit EXACTEMENT ce qui est inscrit et ce qui ne l'est pas ── */
    await garde('PA05', async () => {
      const X = P1.serveur(); const m = email('diff'); X.compte(m, { code: CODE_PERSO }); remplir(X, m, 2998);
      const r = env(X, m, { foodSupprimes: [{ i: 'tmb100000-aaaa', t: 1 }].concat(mille(2998, 3001)) });
      const tomb = (r.j.nut || {}).tomb || {};
      const reg = X.lireCompte(m).profile.foodSupprimes;
      t('PA05 ⭐⭐ l\'accusé nomme EXACTEMENT ce qui est inscrit : sur 4 identités reçues (1 déjà connue, 3 nouvelles) alors que le registre est à 2 998, `tomb.ok` = la connue + les 2 nouvelles qui tiennent (3 000), `tomb.diff` = la dernière avec le code NUT_TOMBSTONE_LIMIT, jamais dans `ok`',
        r.j.ok === true && tomb.v === 1 && J((tomb.ok || []).slice().sort()) === J(['tmb100000-aaaa', 'tmb102998-aaaa', 'tmb102999-aaaa']) && J(tomb.diff) === J([{ i: 'tmb103000-aaaa', code: 'NUT_TOMBSTONE_LIMIT' }]) && tomb.n === 3000
        && reg.length === 3000 && !reg.some((e) => e.i === 'tmb103000-aaaa') && reg.some((e) => e.i === 'tmb102999-aaaa'), r.t.slice(0, 300));
    });
    await garde('PA06', async () => {
      const X = P1.serveur(); const m = email('rej'); X.compte(m, { code: CODE_PERSO }); remplir(X, m, 2999);
      const RQ = rid(), ch = { foodSupprimes: mille(2999, 3001), requestId: RQ };
      const r1 = X.post(corps(m, ch)); const ap1 = canon(X.lireCompte(m).profile);
      const r2 = X.post(corps(m, ch));
      t('PA06 ⭐⭐ un envoi REJOUÉ (réponse perdue, même `requestId`) rend le MÊME résultat pour les suppressions (mêmes acceptées, mêmes différées), `deja:true`, et ne réapplique RIEN (le profil est identique octet pour octet)',
        r1.j.ok === true && r2.j.ok === true && r2.j.nut.deja === true && J(r1.j.nut.tomb) === J({ v: 1, ok: ['tmb102999-aaaa'], diff: [{ i: 'tmb103000-aaaa', code: 'NUT_TOMBSTONE_LIMIT' }], n: 3000 }) && J(r2.j.nut.tomb) === J(r1.j.nut.tomb) && canon(X.lireCompte(m).profile) === ap1, r2.t.slice(0, 300));
    });
    await garde('PA06b', async () => {
      const X = P1.serveur(); const m = email('trq'); X.compte(m, { code: CODE_PERSO }); remplir(X, m, 2999);
      const RQ = rid(), ch = { foodSupprimes: [{ i: 'tmb102999-aaaa', t: 1 }].concat(mille(3000, 3014)), requestId: RQ };      // 1 acceptée, 14 différées : plus que la mémoire n'en garde
      const r1 = X.post(corps(m, ch)); const r2 = X.post(corps(m, ch)); const T2 = (r2.j.nut || {}).tomb || {};
      t('PA06b ⭐ quand les différées dépassent ce que la mémoire des opérations garde (12), le REJEU ne ment pas : il le dit (`tomb.incomplet:true`) et n\'annonce RIEN d\'accepté — l\'appareil garde tout en attente et renverra',
        ((r1.j.nut || {}).tomb || {}).diff && r1.j.nut.tomb.diff.length === 14 && (r2.j.nut || {}).deja === true && T2.incomplet === true && (T2.ok || []).length === 0 && (T2.diff || []).length === 0, J(T2));
    });
    await garde('PA07', async () => {
      const X = P1.serveur(); const m = email('inv'); X.compte(m, { code: CODE_PERSO });
      const r = env(X, m, { foodSupprimes: ['x', 'identité avec espaces', null, 12, { i: 'y' }, { i: 'valide-id-00000001', t: 3 }, 'valide-id-00000002'] });
      const reg = X.lireCompte(m).profile.foodSupprimes || [];
      t('PA07 les identités INVALIDES (trop courtes, caractères interdits, nulles, numériques) ne sont ni acceptées ni « différées » : elles n\'apparaissent ni dans `ok`, ni dans `diff`, ni au registre — seules les deux valides y sont',
        r.j.ok === true && J(r.j.nut.tomb.ok.slice().sort()) === J(['valide-id-00000001', 'valide-id-00000002']) && r.j.nut.tomb.diff.length === 0 && J(reg.map((e) => e.i).sort()) === J(['valide-id-00000001', 'valide-id-00000002']), r.t.slice(0, 200));
    });

    /* ── 4. LE CONFINEMENT : une erreur imprévue du bloc Nutrition ne coûte JAMAIS les séances, les records, les pesées ── */
    await garde('PA08', async () => {
    for (const avecZone of [true, false]) {
      const X = P1.serveur(); const m = email(avecZone ? 'conf1' : 'conf0'); X.compte(m, { code: CODE_PERSO });
      env(X, m, { foodLog: [ligne('Repas X', 'cf-x-00000001')] });
      if (avecZone) env(X, m, { foodLog: [ligne('Repas X', 'cf-x-00000001', { rev: 1, kcal: 150 })] });                // révision 2 : la zone de récupération garde l'ancienne version
      const avant = etatNut(X, m);
      X.ctx._nutEvenement_ = function () { throw new TypeError('faute simulée dans le bloc Nutrition'); };            // levée APRÈS les écritures de la zone ET la fusion du registre : l'un et l'autre sont DÉJÀ modifiés quand l'erreur éclate
      const r = env(X, m, { foodLog: [ligne('Repas X', 'cf-x-00000001', { kcal: 999 })], foodSupprimes: [{ i: 'cf-supp-0000001', t: 5 }], weightLog: [{ date: '2026-11-02', kg: 83 }], prs: { Squat: { rm1: 111, kg: 90, reps: 5, date: '2026-11-02' } }, sessions: [{ id: 'sc1', ts: 5, date: '2026-11-02', exs: [] }] });   // une version périmée : un conflit, donc une copie en zone
      const c = X.lireCompte(m);
      t('PA08' + (avecZone ? 'a' : 'b') + ' ⭐⭐ CONFINEMENT (' + (avecZone ? 'zone de récupération déjà présente' : 'zone absente avant') + ') : une erreur imprévue DANS le bloc Nutrition (une TypeError, pas une erreur métier nommée) est contenue — { status:\'nut_refuse\', ok:false, code:\'NUT_INTERNE\', retryable:true, profilEnregistre:true } — et l\'état d\'AVANT du volet est restitué octet pour octet, ZONE comprise',
        r.j.status === 'nut_refuse' && r.j.ok === false && r.j.code === 'NUT_INTERNE' && r.j.retryable === true && r.j.profilEnregistre === true && etatNut(X, m) === avant && (avecZone ? (c.recupNut || {}).foodLog.length > 0 : c.recupNut === undefined), r.t.slice(0, 220));
      t('PA08' + (avecZone ? 'c' : 'd') + ' ⭐⭐ … et la séance, le record et la pesée du MÊME envoi sont ENREGISTRÉS (avant : `SERVER_ERROR`, RIEN n\'était écrit) ; l\'erreur est journalisée sans donnée ni adresse',
        (c.sessions || []).length === 1 && c.prs.Squat && c.prs.Squat.kg === 90 && J(c.weightLog) === J([{ date: '2026-11-02', kg: 83 }]) && X.journal.some((l) => /\[FT NUT_INTERNE\] faute simulée/.test(l)) && !X.journal.some((l) => /example\.test/.test(l)), J({ s: (c.sessions || []).length }));
    }
    });

    /* ── 5. UN SEUL VERROU POUR TOUS LES ÉCRIVAINS DU COMPTE ── */
    await garde('PA10', async () => {
      /* un verrou de banc qui COMPTE : prises, libérations, refus ; `tenu` = vrai quand quelqu'un le détient */
      const verrou = () => {
        const st = { tenu: false, prises: 0, rendus: 0, refus: 0 };
        return { st, LockService: { getScriptLock: () => ({ tryLock: () => { if (st.tenu) { st.refus++; return false; } st.tenu = true; st.prises++; return true; }, waitLock() {}, releaseLock: () => { if (st.tenu) { st.tenu = false; st.rendus++; } }, hasLock: () => st.tenu }) } };
      };
      const attente = (X, m, code) => { X.props.pending_confirms = JSON.stringify({ [m]: { code, exp: Date.now() + 600000, tries: 0 } }); };
      const ECRIVAINS = {
        pushHealth: { corps: (m) => ({ action: 'pushHealth', email: m, authCode: CODE_PERSO, sleep: 7.5, date: '2026-11-02' }), pre() {}, hook: 'loadUserData_',
          effet: (X, m) => (X.lireCompte(m).healthDaily || []).length === 1, occupe: (X, m, r) => r.j.code === 'NUT_LOCK_BUSY' && r.j.retryable === true && !(X.lireCompte(m).healthDaily || []).length },
        verifyConfirmCode: { corps: (m) => ({ action: 'verifyConfirmCode', email: m, code: '123456', appareil: 'banc' }), pre: (X, m) => attente(X, m, '123456'), hook: 'loadUserData_',
          effet: (X, m) => X.lireCompte(m).profile.emailVerified === true, occupe: (X, m, r) => r.j.status === 'ok' && !!X.props['confirmed_' + m] && X.lireCompte(m).profile.emailVerified !== true },
        setAccessCode: { corps: (m) => ({ action: 'setAccessCode', email: m, code: '654321', newCode: '9876' }), pre: (X, m) => attente(X, m, '654321'), hook: 'loadUserData_', authConcurrent: '9876',
          effet: (X, m) => X.lireCompte(m).profile.emailVerified === true, occupe: (X, m, r) => r.j.status === 'ok' && !!X.props['confirmed_' + m] && X.lireCompte(m).profile.emailVerified !== true },
        summarizeCoach: { corps: (m) => ({ action: 'summarizeCoach', email: m, history: [{ role: 'user', content: 'Bonjour test' }], existingMemory: '' }), hook: 'loadUserData_',
          pre: (X) => { X.props.ANTHROPIC_API_KEY = 'sk-test'; X.ctx.UrlFetchApp = { fetch: () => ({ getContentText: () => JSON.stringify({ content: [{ text: 'Résumé test' }] }) }) }; },
          effet: (X, m) => X.lireCompte(m).profile.coachMemory === 'Résumé test', occupe: (X, m, r) => r.j.summary === 'Résumé test' && X.lireCompte(m).profile.coachMemory === undefined },
        adminRestore: { corps: (m) => ({ action: 'adminRestore', adminToken: 'admintoken-test-000001', email: m, data: { profile: { name: 'Restauré' }, sessions: [] } }), pre: (X) => { X.props.ADMIN_TOKEN = 'admintoken-test-000001'; }, hook: 'saveUserData_',
          effet: (X, m) => X.lireCompte(m).profile.name === 'Restauré', occupe: (X, m, r) => r.j.code === 'NUT_LOCK_BUSY' && r.j.retryable === true && X.lireCompte(m).profile.name === 'N' },
      };
      const noms = Object.keys(ECRIVAINS);
      /* (a) verrou TENU par quelqu'un d'autre : chaque écrivain répond « occupé » (ou se rabat sur l'indicateur `confirmed_`) et N'ÉCRIT PAS le compte */
      const occupes = noms.map((nom) => {
        const d = ECRIVAINS[nom], V = verrou(), X = P1.serveur({ LockService: V.LockService }), m = email('occ'); X.compte(m, { code: CODE_PERSO }); d.pre(X, m);
        V.st.tenu = true;
        const r = X.post(d.corps(m));
        return { nom, ok: d.occupe(X, m, r) && V.st.prises === 0 && V.st.refus === 1, rep: r.t.slice(0, 90) };
      });
      t('PA10 ⭐⭐ VERROU TENU par un autre : chacun des CINQ écrivains du compte hors `saveProfile` (santé de la montre, confirmation d\'e-mail, code perso, mémoire du coach, restauration admin) le RESPECTE — réponse « occupé » réessayable (ou repli sur `confirmed_` pour les deux e-mails) et le compte n\'est PAS écrit',
        occupes.every((x) => x.ok), J(occupes.filter((x) => !x.ok)));
      /* (b) verrou LIBRE : chacun le prend UNE fois, le rend UNE fois, et pendant qu'il le tient un `saveProfile` concurrent est REFUSÉ (« occupé ») — l'exclusion mutuelle, prouvée par un entrelacement déterministe */
      const exclus = noms.map((nom) => {
        const d = ECRIVAINS[nom], V = verrou(), X = P1.serveur({ LockService: V.LockService }), m = email('excl'); X.compte(m, { code: CODE_PERSO }); d.pre(X, m);
        const orig = X.ctx[d.hook]; let arme = true, concurrent = null;
        X.ctx[d.hook] = function () { if (arme) { arme = false; concurrent = X.post(Object.assign(corps(m, { requestId: rid(), foodLog: [ligne('Concurrent', 'pa-conc-00000001')] }), { authCode: d.authConcurrent || CODE_PERSO })); } return orig.apply(this, arguments); };
        const r = X.post(d.corps(m));
        X.ctx[d.hook] = orig;
        const c = X.lireCompte(m);
        return { nom, ok: !!concurrent && concurrent.j.code === 'NUT_LOCK_BUSY' && d.effet(X, m) && V.st.prises === 1 && V.st.rendus === 1 && V.st.refus === 1 && !(c.profile.foodLog || []).some((l) => l.id === 'pa-conc-00000001'), conc: concurrent && concurrent.t.slice(0, 80), rep: r.t.slice(0, 60) };
      });
      t('PA11 ⭐⭐⭐ EXCLUSION MUTUELLE, écrivain par écrivain : verrou libre, chacun le prend UNE fois et le rend UNE fois ; pendant qu\'il lit-puis-écrit le compte, un `saveProfile` concurrent est REFUSÉ (« occupé ») — donc personne ne peut effacer l\'écriture de l\'autre — et son propre effet est bien là',
        exclus.every((x) => x.ok), J(exclus.filter((x) => !x.ok)));
      /* (c) le verrou est rendu sur TOUS les chemins d'un autre écrivain : compte inconnu, erreur d'écriture, refus d'accès (avant le verrou : jamais pris) */
      await garde('PA13', async () => {
        const V = verrou(), X = P1.serveur({ LockService: V.LockService });
        const r1 = X.post({ action: 'pushHealth', email: email('inconnu'), sleep: 7, date: '2026-11-02' });
        const s1 = { p: V.st.prises, r: V.st.rendus };
        const m = email('chem'); X.compte(m, { code: CODE_PERSO });
        const ecrire = X.ctx.saveUserData_; X.ctx.saveUserData_ = () => { throw new Error('écriture refusée (panne simulée)'); };
        const r2 = X.post({ action: 'pushHealth', email: m, authCode: CODE_PERSO, sleep: 7, date: '2026-11-02' });
        X.ctx.saveUserData_ = ecrire;
        const s2 = { p: V.st.prises, r: V.st.rendus };
        const r3 = X.post({ action: 'pushHealth', email: m, authCode: 'mauvais-code', sleep: 7, date: '2026-11-02' });
        t('PA13 le verrou d\'un autre écrivain est RENDU sur tous les chemins — compte inconnu (`not_found`), erreur d\'écriture au milieu (annoncée), refus d\'accès (le verrou n\'est même pas pris) : prises = libérations à chaque étape, jamais gardé',
          r1.j.status === 'not_found' && s1.p === 1 && s1.r === 1 && r2.j.status === 'error' && s2.p === 2 && s2.r === 2 && r3.j.status === 'error' && V.st.prises === 2 && V.st.rendus === 2 && V.st.tenu === false, J({ s1, s2, fin: V.st }));
      });
      /* (d) la DURÉE de détention est MESURÉE : rendue dans la réponse, journalisée au-delà du seuil avec son origine */
      await garde('PA12', async () => {
        const V = verrou(), X = P1.serveur({ LockService: V.LockService }); const m = email('ms'); X.compte(m, { code: CODE_PERSO });
        const r0 = env(X, m, { foodLog: [ligne('M0', 'pa-ms-00000001')] });
        t('PA12 ⭐ la durée de détention est MESURÉE : la réponse porte `lockMs` (un nombre fini, ≥ 0), et à vitesse normale rien n\'est journalisé',
          Number.isFinite(r0.j.lockMs) && r0.j.lockMs >= 0 && r0.j.lockMs < 2000 && !X.journal.some((l) => /\[FT VERROU\]/.test(l)), r0.t.slice(0, 160));
        let horloge = 1000000; X.ctx._nutHorloge_ = () => (horloge += 2500);                         // une horloge LENTE : chaque lecture avance de 2 500 ms
        const r1 = env(X, m, { foodLog: [ligne('M1', 'pa-ms-00000002')] });
        const r2 = X.post({ action: 'pushHealth', email: m, authCode: CODE_PERSO, sleep: 7, date: '2026-11-02' });
        t('PA12b ⭐ une détention LENTE (horloge simulée : 2 500 ms) est mesurée (`lockMs:2500`) et JOURNALISÉE avec son origine — pour `saveProfile` ET pour un autre écrivain du compte : une lenteur qui se voit se maîtrise',
          r1.j.lockMs === 2500 && r2.j.status === 'ok' && X.journal.some((l) => /\[FT VERROU\] saveProfile : verrou tenu 2500 ms/.test(l)) && X.journal.some((l) => /\[FT VERROU\] pushHealth : verrou tenu 2500 ms/.test(l)), J(X.journal.filter((l) => /VERROU/.test(l))));
      });
    });
  }

  /* ═══ D et C — de VRAIS processus serveur, puis le VRAI client relié à eux ═══════════════════════════════════════════════════════════════ */
  if (voulu('D') || voulu('C')) {
    const dirPool = fs.mkdtempSync(path.join(os.tmpdir(), 'pa01_'));
    const dirSans = fs.mkdtempSync(path.join(os.tmpdir(), 'pa01sans_'));
    const pool = lancerPool(dirPool, 3);
    let poolSans = null;
    try {
      await pool.prets;
      const sante = (m, extra) => Object.assign({ action: 'pushHealth', email: m, authCode: CODE_PERSO, sleep: 7.25, date: '2026-11-02' }, extra || {});

      /* ── D — la concurrence RÉELLE entre `saveProfile` et un AUTRE écrivain du compte ── */
      if (voulu('D')) {
        console.log('\n-- B-PA01 (D). De vrais processus serveur · un seul verrou pour `saveProfile` ET pour les autres écrivains du compte --');
        /* PD01 — `saveProfile` (un repas) et `pushHealth` (le sommeil de la montre) lancés ENSEMBLE, la barrière faisant lire le MÊME état aux deux : sans verrou commun, le dernier à écrire efface l'autre */
        if (bloc('PD01')) await garde('PD01', async () => {
          const REP = 5; const d1 = [];
          for (let k = 0; k < REP; k++) {
            const m = email('d01'); await pool.init(0, m, { code: CODE_PERSO });
            const [ra, rb] = await pool.simultane([{ k: 1, corps: corps(m, { foodLog: [ligne('Repas D' + k, 'pd-a-' + String(1000000 + k))], requestId: rid() }) }, { k: 2, corps: sante(m) }], true);
            const ja = lj(ra), jb = lj(rb); const c = await pool.lire(0, m);
            const sain = ja.ok === true && Number.isFinite(ja.lockMs) && jb.status === 'ok' && jb.sleep === 7.25 && (c.profile.foodLog || []).length === 1 && (c.profile.foodLog[0] || {}).rev === 1 && (c.healthDaily || []).length === 1 && c.healthDaily[0].sleep === 7.25;
            if (!sain) d1.push({ k, ja: ja.ok, lockMs: ja.lockMs, jb: jb.status || jb.code, n: (c.profile.foodLog || []).length, h: (c.healthDaily || []).length });
          }
          t('PD01 ⭐⭐⭐ (VRAIE CONCURRENCE) `saveProfile` (un repas) et un AUTRE écrivain du compte (`pushHealth`, le sommeil de la montre) lancés ENSEMBLE sur le MÊME état, ' + REP + ' fois : les DEUX effets sont TOUJOURS au compte (le repas à la révision 1, l\'entrée de santé), les deux réponses sont « ok », la durée de détention est mesurée (`lockMs`), aucun verrou ne reste posé',
            d1.length === 0 && !fs.existsSync(path.join(dirPool, 'verrou')), J(d1.slice(0, 2)));
        });

        /* PD02 — LE CONTRÔLE NÉGATIF DU BANC : des processus dont le verrou ne verrouille rien — la perte de mise à jour DOIT apparaître, sinon PD01 est un vert qui ne peut pas rougir */
        if (bloc('PD02')) await garde('PD02', async () => {
          poolSans = lancerPool(dirSans, 3, { NUT_SANS_VERROU: '1' });
          await poolSans.prets;
          let pertes = 0; const essais = 5;
          for (let k = 0; k < essais; k++) {
            const m = email('d02'); await poolSans.init(0, m, { code: CODE_PERSO });
            const [ra, rb] = await poolSans.simultane([{ k: 1, corps: corps(m, { foodLog: [ligne('Repas S' + k, 'pd-s-' + String(1000000 + k))], requestId: rid() }) }, { k: 2, corps: sante(m) }], true);
            const c = await poolSans.lire(0, m);
            if (lj(ra).ok === true && lj(rb).status === 'ok' && ((c.profile.foodLog || []).length + (c.healthDaily || []).length) < 2) pertes++;     // les DEUX ont répondu « ok », et un effet manque : c'est la perte de mise à jour
          }
          t('PD02 ⭐⭐ CONTRÔLE NÉGATIF DU BANC (processus dont le verrou ne verrouille rien) : la perte de mise à jour APPARAÎT entre `saveProfile` et `pushHealth` — les deux répondent « ok » et l\'un des deux effets a disparu (' + pertes + '/' + essais + ' essais) : le banc sait détecter l\'absence de verrou commun',
            pertes >= 1, J({ pertes, essais }));
        });

        /* PD03 — le verrou est tenu par quelqu'un d'autre : un autre écrivain répond « occupé », n'écrit RIEN, et la tentative suivante réussit UNE fois (même date de santé : fusion, aucun doublon) */
        if (bloc('PD03')) await garde('PD03', async () => {
          const m = email('d03'); await pool.init(0, m, { code: CODE_PERSO });
          const avant = canon(await pool.lire(0, m));
          await pool.regler(1, 'NUT_VERROU_MS_', 300);
          fs.mkdirSync(path.join(dirPool, 'verrou'));                                // quelqu'un tient le verrou
          const t0 = Date.now();
          const rb = await pool.post(1, sante(m));
          const dt = Date.now() - t0; const jb = lj(rb);
          const apres = canon(await pool.lire(0, m));
          t('PD03 ⭐⭐ (vrai verrou entre processus) verrou INDISPONIBLE pour un autre écrivain du compte (`pushHealth`) : réponse { ok:false, code:\'NUT_LOCK_BUSY\', retryable:true } après avoir attendu, et RIEN n\'est écrit (le compte est identique octet pour octet)',
            jb.ok === false && jb.code === 'NUT_LOCK_BUSY' && jb.retryable === true && dt >= 250 && apres === avant, J({ code: jb.code, dt }));
          fs.rmdirSync(path.join(dirPool, 'verrou'));                                 // libéré
          const r2 = await pool.post(1, sante(m)); const r3 = await pool.post(2, sante(m));
          const c = await pool.lire(0, m);
          t('PD03b ⭐ … la nouvelle tentative réussit UNE fois, une répétition ne duplique rien (la même date fusionne : une seule entrée de santé), et le verrou est rendu',
            lj(r2).status === 'ok' && lj(r3).status === 'ok' && (c.healthDaily || []).length === 1 && !fs.existsSync(path.join(dirPool, 'verrou')), J({ h: (c.healthDaily || []).length }));
          await pool.regler(1, 'NUT_VERROU_MS_', 20000);
        });

        /* PD04 — TROIS écrivains à la fois (deux appareils qui synchronisent + la montre) : rien ne se perd */
        if (bloc('PD04')) await garde('PD04', async () => {
          const d4 = [];
          for (let k = 0; k < 3; k++) {
            const m = email('d04'); await pool.init(0, m, { code: CODE_PERSO });
            const rs = await pool.simultane([
              { k: 0, corps: corps(m, { foodLog: [ligne('A' + k, 'pd-x-' + String(1000000 + k))], requestId: rid() }) },
              { k: 1, corps: corps(m, { foodLog: [ligne('B' + k, 'pd-y-' + String(1000000 + k))], requestId: rid() }) },
              { k: 2, corps: sante(m) }], true);
            const c = await pool.lire(0, m); const fl = c.profile.foodLog || [];
            if (!(lj(rs[0]).ok === true && lj(rs[1]).ok === true && lj(rs[2]).status === 'ok' && fl.length === 2 && fl.every((x) => x.rev === 1) && (c.healthDaily || []).length === 1)) d4.push({ k, n: fl.length, h: (c.healthDaily || []).length, r: rs.map((r) => lj(r).ok || lj(r).status) });
          }
          t('PD04 ⭐⭐ (VRAIE CONCURRENCE) TROIS écrivains lancés ENSEMBLE — deux appareils qui synchronisent chacun un repas différent, et la montre —, 3 fois : les deux repas ET l\'entrée de santé sont toujours au compte (rien ne se perd, aucun doublon)',
            d4.length === 0 && !fs.existsSync(path.join(dirPool, 'verrou')), J(d4));
        });
      }

      /* ── C — le VRAI client, relié à ces processus ── */
      if (voulu('C')) {
        console.log('\n-- B-PA01 (C). Le vrai client · suppressions confirmées par leur nom · refus explicites · reprise · quota local --');
        const appareil = CL.fabriquerAppareils(b, PORT, pool, O, erreursGlobales);
        const compte = (mail) => pool.lire(0, mail);
        const SUCCES = /r[ée]ussi|synchronis[ée]e? ✅|sauvegard[ée]e? ✅|✅.*synchro/i;
        const SEM = [
          ligne('Pâtes test', 'sem1-00000001', { kcal: 131.4, prot: 4.6, carbs: 25.3, fat: 1.1, q: 135 }),
          ligne('Pomme test', 'sem2-00000002', { kcal: 52.3, prot: 0.3, carbs: 13.8, fat: 0.2, q: 180 }),
          ligne('Riz test', 'sem3-00000003', { kcal: 129.9, prot: 2.7, carbs: 28.2, fat: 0.3, q: 150 }),
        ];
        const copie = (x) => JSON.parse(JSON.stringify(x));
        const envoyes = (A) => A.corps.map((x) => { try { return JSON.parse(x); } catch (e) { return {}; } }).filter((x) => x.action === 'saveProfile');
        const entree = async (A, id) => (await A.registre()).find((e) => e.i === id) || {};

        /* PC01 — seules les suppressions NON confirmées voyagent */
        if (bloc('PC01')) await garde('PC01', async () => {
          const m = email('c01'); await pool.init(0, m, { code: CODE_PERSO, profile: { foodSupprimes: mille(0, 40) } });
          const miroir = {};                                                              // le « blob » du compte côté miroir de secours (modèle du contrat d'écriture)
          const A = await appareil('A', 1, m, { miroir });
          await A.graine(SEM.map(copie)); await A.sync(); await A.restaurer();
          const reg0 = await A.registre();
          A.corps.length = 0;
          await A.supprimer('sem2-00000002'); await A.sync();
          const e1 = envoyes(A)[0] || {};
          const reg1 = await A.registre();
          A.corps.length = 0; await A.sync();
          const e2 = envoyes(A)[0] || {};
          const c = await compte(m);
          t('PC01 ⭐⭐ (vrai client) le registre du compte compte 40 suppressions CONFIRMÉES sur l\'appareil : une nouvelle suppression part SEULE (1 entrée dans `foodSupprimes`, pas 41), elle est confirmée par l\'accusé ; la synchronisation suivante n\'en envoie AUCUNE — et le compte, lui, en porte bien 41',
            reg0.length === 40 && reg0.every((e) => !!e.c) && Array.isArray(e1.foodSupprimes) && e1.foodSupprimes.length === 1 && e1.foodSupprimes[0].i === 'sem2-00000002'
            && reg1.length === 41 && reg1.every((e) => !!e.c && !e.x) && Array.isArray(e2.foodSupprimes) && e2.foodSupprimes.length === 0 && (c.profile.foodSupprimes || []).length === 41, J({ n0: reg0.length, e1: e1.foodSupprimes && e1.foodSupprimes.length, n1: reg1.length, e2: e2.foodSupprimes && e2.foodSupprimes.length, compte: (c.profile.foodSupprimes || []).length }));
          await pause(300);
          t('PC01b ⭐ … le miroir de secours reçoit, lui, le registre COMPLET (41 entrées, confirmées ou non), jamais seulement les nouvelles : il REMPLACE son champ, un sous-ensemble lui ferait oublier toutes les autres',
            Array.isArray(miroir.foodSupprimes) && miroir.foodSupprimes.length === 41, J({ n: (miroir.foodSupprimes || []).length }));
          await A.fermer();
        });

        /* PC02 — une place libre pour deux suppressions : le client confirme EXACTEMENT celle que le serveur nomme */
        if (bloc('PC02')) await garde('PC02', async () => {
          const m = email('c02'); await pool.init(0, m, { code: CODE_PERSO, profile: { foodSupprimes: mille(0, 2999) } });
          const A = await appareil('A', 1, m);
          await A.graine(SEM.map(copie)); await A.sync();
          await A.supprimer('sem1-00000001'); await A.supprimer('sem2-00000002'); await A.sync();
          const e1 = await entree(A, 'sem1-00000001'), e2 = await entree(A, 'sem2-00000002'); const c = await compte(m); const reg = c.profile.foodSupprimes || []; const tc = await A.toasts();
          const conf = [e1, e2].filter((e) => !!e.c), diff = [e1, e2].filter((e) => !e.c && e.x === 'NUT_TOMBSTONE_LIMIT');
          const idConf = conf.length === 1 ? conf[0].i : null, idDiff = diff.length === 1 ? diff[0].i : null;
          const vivants = (c.profile.foodLog || []).map((l) => l.id);
          t('PC02 ⭐⭐⭐ (vrai client + vrai serveur) UNE place libre pour DEUX suppressions : exactement UNE est confirmée (celle que le serveur a inscrite, au registre du compte) et exactement UNE reste DIFFÉRÉE (code NUT_TOMBSTONE_LIMIT, jamais confirmée, jamais effacée, absente du registre du compte) ; le registre reste à 3 000 ; le repas de la confirmée a disparu du compte, celui de la différée y est toujours ; un message honnête, aucun succès affiché',
            !!idConf && !!idDiff && idConf !== idDiff && reg.length === 3000 && reg.some((e) => e.i === idConf) && !reg.some((e) => e.i === idDiff)
            && !vivants.includes(idConf) && vivants.includes(idDiff) && tc.some((x) => /registre des suppressions/.test(x) && /Rien n'est perdu/.test(x)) && !tc.some((x) => SUCCES.test(x)), J({ e1, e2, n: reg.length, vivants, tc }));
          await A.fermer();
        });

        /* PC03 — un accusé VALIDE qui n'annonce PAS ses suppressions (serveur plus ancien) ne confirme rien */
        if (bloc('PC03')) await garde('PC03', async () => {
          const m = email('c03'); await pool.init(0, m, { code: CODE_PERSO });
          const A = await appareil('A', 1, m);
          await A.graine(SEM.slice(0, 2).map(copie)); await A.sync();
          await A.supprimer('sem2-00000002');
          A.sansTomb = true; await A.sync(); await A.sync(); A.sansTomb = false;
          const e1 = await entree(A, 'sem2-00000002'); const tc = await A.toasts();
          await A.sync();
          const e2 = await entree(A, 'sem2-00000002');
          t('PC03 ⭐⭐ un accusé VALIDE (ok:true, le bon `requestId`) mais SANS `nut.tomb` — un serveur qui ne sait pas annoncer ses suppressions — ne confirme RIEN : la suppression reste « en attente » (ni confirmée, ni différée, ni effacée), un seul message honnête, aucun succès ; l\'accusé complet qui suit la confirme',
            !e1.c && !e1.x && !!e1.i && tc.filter((x) => /pas encore confirmée/.test(x)).length === 1 && !tc.some((x) => SUCCES.test(x)) && !!e2.c && !e2.x, J({ e1, e2, tc }));
          await A.fermer();
        });

        /* PC04 — la GUÉRISON : le compte est revenu en arrière (sauvegarde ancienne) et annonce MOINS de suppressions que l'appareil n'en a confirmé */
        if (bloc('PC04')) await garde('PC04', async () => {
          const m = email('c04'); await pool.init(0, m, { code: CODE_PERSO });
          const A = await appareil('A', 1, m);
          await A.graine(SEM.map(copie)); await A.sync();
          await A.supprimer('sem1-00000001'); await A.supprimer('sem2-00000002'); await A.sync();
          const avant = (await A.registre()).filter((e) => !!e.c).length;
          await pool.init(0, m, { code: CODE_PERSO, profile: { foodSupprimes: [{ i: 'sem1-00000001', t: 1 }] } });      // le compte est restauré d'une sauvegarde plus ancienne : il ne connaît plus qu'UNE suppression
          await A.sync();
          const apresSync = await A.registre();
          let fin = null;
          for (let i = 0; i < 40; i++) { fin = await A.registre(); if (fin.length === 2 && fin.every((e) => !!e.c)) break; await pause(300); }
          const c = await compte(m); const reg = (c.profile.foodSupprimes || []).map((e) => e.i).sort();
          t('PC04 ⭐⭐ GUÉRISON : le compte annonce 1 suppression alors que l\'appareil en a confirmé 2 — l\'écart est l\'anomalie : les confirmées repassent « en attente », sont renvoyées d\'elles-mêmes (synchronisation différée, sans aucun geste), le compte retrouve les DEUX, et elles sont confirmées de nouveau',
            avant === 2 && apresSync.length === 2 && apresSync.every((e) => !e.c) && !!fin && fin.length === 2 && fin.every((e) => !!e.c) && J(reg) === J(['sem1-00000001', 'sem2-00000002']), J({ avant, apresSync, fin, reg }));
          await A.fermer();
        });

        /* PC05 — le serveur REFUSE ce client en entier (version incompatible) : rien n'est confirmé, rien n'est effacé, aucune boucle de réessais, un message clair UNE fois */
        if (bloc('PC05')) await garde('PC05', async () => {
          const m = email('c05'); await pool.init(0, m, { code: CODE_PERSO });
          const A = await appareil('A', 1, m);
          await A.graine(SEM.slice(0, 2).map(copie)); await A.sync();
          await A.supprimer('sem2-00000002');
          const journalAvant = canon(await A.journal());
          A.fabriqueSeul = true; A.reponseFabriquee = (c) => ({ status: 'nut_refuse', ok: false, code: 'NUT_CLIENT_INCOMPATIBLE', retryable: false, profilEnregistre: true, requestId: c.requestId });
          await A.sync(); await A.sync();
          const e1 = await entree(A, 'sem2-00000002'); const tc = await A.toasts();
          const minuteur = await A.ev(() => _nutRelance.timer !== null);
          const jAp = canon(await A.journal()); const dsk = await A.registreDisque();
          A.fabriqueSeul = false; A.reponseFabriquee = null; await A.sync();
          t('PC05 ⭐⭐ (vrai client) le serveur REFUSE ce client en entier (`NUT_CLIENT_INCOMPATIBLE`, non réessayable) : la suppression reste « en attente » (ni confirmée, ni marquée rejetée, ni effacée — sur disque comme en mémoire), le journal est intact, AUCUNE boucle de réessais n\'est planifiée, le message dit de rouvrir l\'application et que rien n\'est perdu — UNE seule fois malgré deux tentatives, aucun succès affiché',
            !!e1.i && !e1.c && !e1.x && dsk.some((e) => e.i === 'sem2-00000002' && !e.c && !e.x) && jAp === journalAvant && minuteur === false
            && tc.filter((x) => /ne peut plus synchroniser la Nutrition/.test(x) && /Rien n'est perdu/.test(x)).length === 1 && !tc.some((x) => SUCCES.test(x)), J({ e1, minuteur, tc }));
          t('PC05b ⭐ … et quand le serveur accepte de nouveau, la MÊME suppression est confirmée sans geste ni doublon : le refus n\'avait rien abîmé',
            !!(await entree(A, 'sem2-00000002')).c && ((await compte(m)).profile.foodSupprimes || []).filter((e) => e.i === 'sem2-00000002').length === 1, J(await A.registre()));
          await A.fermer();
        });

        /* PC06 — une erreur interne RÉESSAYABLE : rien n'est confirmé, un message UNE fois, des réessais à TEMPORISATION CROISSANTE qui repartent de zéro après un accusé valide */
        if (bloc('PC06')) await garde('PC06', async () => {
          const m = email('c06'); await pool.init(0, m, { code: CODE_PERSO });
          const A = await appareil('A', 1, m);
          await A.graine(SEM.slice(0, 2).map(copie)); await A.sync();
          await A.supprimer('sem2-00000002');
          /* le minuteur de réessai est COMPRESSÉ (15 ms au lieu de 30 s…) mais la durée DEMANDÉE est enregistrée : c'est elle qu'on vérifie */
          await A.ev(() => { clearTimeout(_syncTimer); window.__delais = []; const o = window.setTimeout; window.setTimeout = function (f, d) { if (typeof f === 'function' && d >= 30000 && /_nutRelance\.timer\s*=\s*null/.test(String(f))) { window.__delais.push(d); d = 15; } return o.apply(this, [f, d].concat([].slice.call(arguments, 2))); }; });
          const panne = (c) => ({ status: 'nut_refuse', ok: false, code: 'NUT_INTERNE', retryable: true, profilEnregistre: true, requestId: c.requestId });
          A.fabriqueSeul = true; A.reponseFabriquee = panne;
          await A.ev(() => { _cloudSync(); });
          for (let i = 0; i < 150 && (await A.ev(() => window.__delais.length)) < 7; i++) await pause(60);
          const delais = await A.ev(() => window.__delais.slice(0, 7));
          const e1 = await entree(A, 'sem2-00000002'); const tc = await A.toasts();
          t('PC06 ⭐⭐ (vrai client) erreur interne RÉESSAYABLE du serveur (`NUT_INTERNE`) : la suppression reste « en attente » (jamais confirmée, jamais effacée), UN message honnête malgré les réessais, et les réessais s\'espacent — 30 s, 1 min, 2 min, 5 min, puis 15 min (durées demandées au minuteur) —, au lieu de 5 fois 30 s puis plus rien',
            J(delais) === J([30000, 60000, 120000, 300000, 900000, 900000, 900000]) && !!e1.i && !e1.c && !e1.x && tc.filter((x) => /erreur côté serveur/.test(x) && /sera retentée/.test(x)).length === 1 && !tc.some((x) => SUCCES.test(x)), J({ delais, e1, tc }));
          A.reponseFabriquee = null; A.fabriqueSeul = false;                                            // le serveur va mieux : le prochain réessai (15 ms plus tard) est accepté
          for (let i = 0; i < 80 && (await A.ev(() => _nutAConfirmer)); i++) await pause(60);
          const n0 = await A.ev(() => _nutRelance.n), conf = !!(await entree(A, 'sem2-00000002')).c, encore = await A.ev(() => _nutAConfirmer);
          A.fabriqueSeul = true; A.reponseFabriquee = panne;
          await A.ev(() => { window.__delais.length = 0; _cloudSync(); });
          for (let i = 0; i < 50 && (await A.ev(() => window.__delais.length)) < 1; i++) await pause(60);
          const reprise = await A.ev(() => window.__delais.slice(0, 1));
          t('PC06b ⭐ … un accusé valide remet la temporisation À ZÉRO : la suppression est confirmée, le compteur de réessais est à 0, et une nouvelle panne repart de 30 s (pas de 15 min)',
            conf && n0 === 0 && encore === false && J(reprise) === J([30000]), J({ conf, n0, encore, reprise }));
          A.fabriqueSeul = false; A.reponseFabriquee = null;
          await A.fermer();
        });

        /* PC07 — la REPRISE : retour du réseau, retour à l'écran — et RIEN quand il n'y a rien à confirmer */
        if (bloc('PC07')) await garde('PC07', async () => {
          const m = email('c07'); await pool.init(0, m, { code: CODE_PERSO });
          const A = await appareil('A', 1, m);
          await A.graine(SEM.map(copie)); await A.sync();
          const attendre = async (id) => { let e = {}; for (let i = 0; i < 40; i++) { e = await entree(A, id); if (e.c) return e; await pause(250); } return e; };
          /* l'application est « gelée » (minuteurs suspendus, comme en arrière-plan sur iPhone) : on supprime, la synchronisation échoue hors ligne, et le minuteur différé ne tourne pas */
          const gelee = async (id) => { A.horsLigne = true; await A.supprimer(id); await A.ev(() => { clearTimeout(_syncTimer); }); await A.sync(); await A.ev(() => { clearTimeout(_syncTimer); }); };
          await gelee('sem1-00000001');
          const eHors = await entree(A, 'sem1-00000001'); const aConf = await A.ev(() => _nutAConfirmer);
          A.horsLigne = false;
          const n0 = await A.ev(() => window.__net.envoyes);
          await A.ev(() => { window.dispatchEvent(new Event('online')); });                         // le réseau revient
          const eOnline = await attendre('sem1-00000001'); const n1 = await A.ev(() => window.__net.envoyes);
          t('PC07 ⭐⭐ (reprise) l\'application a une suppression non confirmée (réseau coupé), aucun minuteur ne tourne : au RETOUR DU RÉSEAU (événement `online`) une synchronisation part d\'elle-même, sans aucun geste, et la suppression est confirmée',
            !!eHors.i && !eHors.c && aConf === true && n1 > n0 && !!eOnline.c && !eOnline.x, J({ eHors, aConf, n0, n1, eOnline }));
          await gelee('sem2-00000002');
          const eHors2 = await entree(A, 'sem2-00000002'); A.horsLigne = false;
          const n2 = await A.ev(() => window.__net.envoyes);
          await A.ev(() => { document.dispatchEvent(new Event('visibilitychange')); });             // l'application redevient visible
          const eVis = await attendre('sem2-00000002'); const n3 = await A.ev(() => window.__net.envoyes);
          t('PC07b ⭐⭐ (reprise) même chose au RETOUR À L\'ÉCRAN (`visibilitychange`, application visible) : la synchronisation part d\'elle-même et la suppression est confirmée — le seul déclencheur qu\'un iPhone permette quand l\'application était en veille ; aucune synchronisation en arrière-plan n\'est promise',
            !!eHors2.i && !eHors2.c && n3 > n2 && !!eVis.c && !eVis.x, J({ eHors2, n2, n3, eVis }));
          /* une synchronisation SANS accusé alors qu'AUCUNE suppression n'est en attente (un repas neuf saisi hors ligne) : le drapeau « à confirmer » suffit à la reprise */
          A.horsLigne = true;
          await A.ev((l) => { S.foodLog.push(l); persist(); }, ligne('Repas saisi hors ligne', 'hors-00000001'));
          await A.ev(() => { clearTimeout(_syncTimer); });
          await A.sync(); await A.ev(() => { clearTimeout(_syncTimer); });
          const sansSup = await A.ev(() => _nutAConfirmer === true && _foodSupprimesEnAttente().length === 0);
          const horsCompte = !((await compte(m)).profile.foodLog || []).some((l) => l.id === 'hors-00000001');
          A.horsLigne = false;
          await A.ev(() => { window.dispatchEvent(new Event('online')); });
          let auCompte = false; for (let i = 0; i < 40 && !auCompte; i++) { auCompte = ((await compte(m)).profile.foodLog || []).some((l) => l.id === 'hors-00000001'); if (!auCompte) await pause(250); }
          t('PC07d ⭐⭐ (reprise) AUCUNE suppression en attente, mais la dernière synchronisation n\'a reçu aucun accusé (un repas saisi hors ligne) : le retour du réseau suffit — le repas rejoint le compte tout seul, sans que la personne touche à rien',
            sansSup === true && horsCompte === true && auCompte === true && (await A.ev(() => _nutAConfirmer)) === false, J({ sansSup, horsCompte, auCompte }));
          /* RIEN à confirmer : ni suppression en attente, ni synchronisation sans accusé → aucun trafic inutile */
          await A.ev(() => { clearTimeout(_syncTimer); });
          const sansRien = await A.ev(() => !_nutAConfirmer && _foodSupprimesEnAttente().length === 0);
          const n4 = await A.ev(() => window.__net.envoyes);
          await A.ev(() => { window.dispatchEvent(new Event('online')); document.dispatchEvent(new Event('visibilitychange')); });
          await pause(5500);                                                                         // plus que le délai différé (4 s)
          const n5 = await A.ev(() => window.__net.envoyes);
          t('PC07c ⭐ … et quand il n\'y a RIEN à confirmer, le retour du réseau et le retour à l\'écran ne déclenchent AUCUNE requête (pas de trafic inutile, pas de batterie gaspillée)',
            sansRien === true && n5 === n4, J({ sansRien, n4, n5 }));
          await A.fermer();
        });

        /* PC08 — LE QUOTA LOCAL : une clé Nutrition refusée ne réduit JAMAIS l'historique des séances (la preuve : `ft4_sessions` identique octet pour octet) */
        if (bloc('PC08')) await garde('PC08', async () => {
          const m = email('c08'); await pool.init(0, m, { code: CODE_PERSO });
          const A = await appareil('A', 1, m);
          await A.ev(() => { S.sessions = Array.from({ length: 60 }, (_, i) => ({ id: 'ps' + (1000 + i), ts: 1760000000000 + i * 1000, date: '2026-10-' + String(1 + (i % 28)).padStart(2, '0'), exs: [], vol: 100 + i })); persist(); });
          const REF = await A.ev(() => localStorage.getItem('ft4_sessions'));
          await A.espionner();
          const ANNEXES = ['ft4_savedfoods', 'ft4_hiddenfoods', 'ft4_mealplan', 'ft4_foodai', 'ft4_foodai_label', 'ft4_foodai_meal', 'ft4_foodai_bc'];
          const CLES = ANNEXES.concat(['ft4_foodlog', 'ft4_food_supprimes']);
          const mauvais = [];
          for (const K of CLES) {
            await A.ev((k) => { window.__Q.refuse = [k]; window.__Q.refus = []; S.savedFoods = (S.savedFoods || []).concat([{ name: 'Favori ' + k, kcal: 1, prot: 1, carbs: 1, fat: 1 }]); S.foodAiUses = (S.foodAiUses || 0) + 1; persist(); }, K);
            const r = await A.ev((k) => ({ sess: localStorage.getItem('ft4_sessions'), tronque: localStorage.getItem('ft4_hist_tronque'), n: S.sessions.length, histTronque: !!S.histTronque, refus: window.__Q.refus.slice(), annexe: _nutClesRefusees().indexOf(k) >= 0 }), K);
            const tc = await A.toasts();
            const bon = r.sess === REF && r.tronque !== '1' && r.n === 60 && r.histTronque === false && r.refus.indexOf(K) >= 0 && (ANNEXES.indexOf(K) < 0 || r.annexe) && !tc.some((x) => /Stockage du téléphone plein/.test(x));
            if (!bon) mauvais.push({ K, sessIdentique: r.sess === REF, tronque: r.tronque, n: r.n, refus: r.refus, annexe: r.annexe, tc: tc.slice(0, 2) });
          }
          t('PC08 ⭐⭐⭐ (vrai client, quota local) une clé NUTRITION qui dépasse le quota — chacune des sept clés annexes (favoris, masquages, plan de repas, quatre compteurs de l\'IA nutritionnelle) ET le journal ET le registre — ne touche JAMAIS aux séances : `ft4_sessions` est IDENTIQUE octet pour octet (60 séances), le drapeau « historique tronqué » n\'est pas levé, le message « stockage plein » n\'apparaît pas, et la clé refusée est bien celle qui a été essayée',
            mauvais.length === 0, J(mauvais.slice(0, 2)));
          /* LE TÉMOIN DE PORTÉE (contrôle négatif du témoin) : une clé HORS Nutrition refusée déclenche toujours le repli d'avant — le banc VOIT donc le repli quand il a lieu, et le périmètre n'a pas bougé */
          await A.ev(() => { window.__Q.refuse = ['ft4_name']; window.__Q.refus = []; persist(); });
          const rep = await A.ev(() => ({ n: JSON.parse(localStorage.getItem('ft4_sessions') || '[]').length, tronque: localStorage.getItem('ft4_hist_tronque') }));
          t('PC08b ⭐ TÉMOIN DE PORTÉE : une clé HORS Nutrition refusée (`ft4_name`) déclenche TOUJOURS le repli d\'avant (séances ramenées à 50 sur le téléphone, drapeau levé) — le banc voit le repli quand il a lieu, et le comportement hors Nutrition n\'a pas bougé (limite écrite : le navigateur ne dit pas quelle clé a échoué)',
            rep.n === 50 && rep.tronque === '1', J(rep));
          await A.fermer();
        });
      }
    } finally {
      pool.tuer(); if (poolSans) poolSans.tuer();
      try { fs.rmSync(dirPool, { recursive: true, force: true }); fs.rmSync(dirSans, { recursive: true, force: true }); } catch (e) { /* tant pis */ }
    }
  }

  t('G99 aucune erreur JavaScript inattendue pendant tout le banc (les erreurs de quota simulées sont attendues)', erreursGlobales.filter((e) => !/quota|refus|faute|écriture/i.test(e)).length === 0, J(erreursGlobales.slice(0, 3)));
};
