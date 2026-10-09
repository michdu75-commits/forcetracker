/* ═════════════════════════════════════════════════════════════════════════════════════════════
   🔒 SEC-ADMIN-01 — la route de diagnostic premium (S-01) fermée, l'admin durci (session-B · 09/10/2026)
   Blocs : B-SEC-S (serveur) · B-SEC-E (écran). Banc : tools/banc_sec_admin.js · contrôle négatif : tools/mut_sec_admin.py
   CONDUIT : le VRAI Code.js exécuté en local (vm Node) par ses VRAIES portes `doGet` / `doPost` — routage, contrôle du
     jeton, lecture des propriétés, réponse ; puis la VRAIE app (déverrouillage du mode admin, carte « Statut Premium »,
     carte « Qui a protégé son compte », synchro, restauration, premium) contre ce même serveur.
   SIMULÉ : les services Google (propriétés en mémoire, ni classeur ni Drive), le Worker (réponse fixe), Supabase et
     Anthropic (coupés et comptés : 0 appel réel).
   OBSERVE : le texte brut de chaque réponse, le journal `Logger`, les propriétés avant/après chaque appel refusé,
     chaque requête de l'app (action, adresse, jeton), l'état de l'app (S.email, localStorage, cartes Admin).
   NE COUVRE PAS : le vrai déploiement Apps Script (aucun redéploiement dans ce lot), les vraies Script Properties,
     Safari iOS, la route `authStatus` (ouverte par décision de Michel du 07/08 — mesurée ici, pas modifiée).
   ⛔⛔ AUCUNE ADRESSE RÉELLE : la liste premium en dur de Code.js et les listes admin / testeurs / premium de
     constants.js sont REMPLACÉES avant exécution par des adresses du domaine réservé example.test (RFC 2606).
     Chaque remplacement est COMPTÉ : s'il ne prend pas, le banc rougit au lieu de tourner sur les vraies adresses.
     Les jetons sont tirés au hasard à chaque lancement : aucun secret réel n'entre ici.
   ═════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), vm = require('vm'), crypto = require('crypto'), path = require('path');
const RACINE = path.join(__dirname, '..', '..');

const FONDATEUR = 'fondateur@example.test', ALICE = 'alice@example.test', BOB = 'bob@example.test',
      CAROL = 'carol@example.test', DAVE = 'dave@example.test';
const hex = n => crypto.randomBytes(n).toString('hex');
const SECRETS = { IDEES: 'idees-' + hex(16), ADMIN: 'admin-' + hex(16), BACKUP: 'backup-' + hex(16) };
const CODE_ADMIN_CLIENT = '135790';
const SYNTH = /@(example\.test|test\.internal)$/i;
const adresses = s => (String(s == null ? '' : s).match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []);
const reelles = s => adresses(s).filter(a => !SYNTH.test(a));
const court = (x, n) => String(x == null ? '' : x).slice(0, n || 220);
/* ⛔ Même quand le code testé fuit une VRAIE adresse (arbre d'avant, mutation), elle n'est jamais recopiée dans la
   sortie du banc : chaque détail passe par ce masque avant d'être affiché. */
const masque = s => String(s == null ? '' : s).replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, a => (SYNTH.test(a) ? a : '[adresse réelle masquée]'));
const masquer = t => (nom, cond, det) => t(nom, cond, det == null ? det : masque(det));

// ── Le VRAI Code.js, la liste premium en dur remplacée (et le remplacement compté) ──
const CODE_BRUT = fs.readFileSync(path.join(RACINE, 'Code.js'), 'utf8');
const RE_HARD = /const PREMIUM_HARDCODED_ = \[[^\]]*\];/g;
const N_HARD = (CODE_BRUT.match(RE_HARD) || []).length;
const CODE_SRC = CODE_BRUT.replace(RE_HARD, "const PREMIUM_HARDCODED_ = ['" + FONDATEUR + "'];");

// ── constants.js tel qu'il sera SERVI à l'app du banc : listes admin / testeurs / premium remplacées ──
const CONST_BRUT = fs.readFileSync(path.join(RACINE, 'constants.js'), 'utf8');
const SUBST = [
  [/const ADMIN_EMAILS=\[[^\]]*\];/, "const ADMIN_EMAILS=['" + FONDATEUR + "'];"],
  [/const ADMIN_CODE='[^']*';/, "const ADMIN_CODE='" + CODE_ADMIN_CLIENT + "';"],
  [/const TESTER_EMAILS=\[[^\]]*\];/, "const TESTER_EMAILS=['" + BOB + "','" + CAROL + "','" + FONDATEUR + "'];"],
  [/const SUPER_TESTER_EMAILS=\[[^\]]*\];/, "const SUPER_TESTER_EMAILS=['" + FONDATEUR + "'];"],
  [/const PREMIUM_CLIENT_EMAILS=\[[^\]]*\];/, "const PREMIUM_CLIENT_EMAILS=['" + FONDATEUR + "'];"],
  [/const TESTER_FEEDBACK_EMAIL='[^']*';/, "const TESTER_FEEDBACK_EMAIL='boite@example.test';"],
];
let CONST_SRC = CONST_BRUT; const CONST_COMPTES = [];
for (const [re, rep] of SUBST) {
  CONST_COMPTES.push((CONST_SRC.match(new RegExp(re.source, 'g')) || []).length);
  CONST_SRC = CONST_SRC.replace(re, rep);
}

const formatDate = (d, tz, f) => {
  const x = new Date(d), p = n => String(n).padStart(2, '0');
  return String(f || "yyyy-MM-dd'T'HH:mm:ss").replace('yyyy', x.getUTCFullYear()).replace('MM', p(x.getUTCMonth() + 1))
    .replace('dd', p(x.getUTCDate())).replace('HH', p(x.getUTCHours())).replace('mm', p(x.getUTCMinutes()))
    .replace('ss', p(x.getUTCSeconds())).replace(/'/g, '');
};

/** Un serveur neuf : le vrai Code.js, des propriétés en mémoire, un journal `Logger` observé. */
function serveur(o) {
  o = o || {};
  const props = Object.create(null), journal = [], mails = [];
  // Les deux opérations « une seule fois » du haut de doGet sont déjà passées (sinon le 1er GET lancerait une sauvegarde Drive).
  props.backup_set_tags_2026_06_29 = '2026-06-29T00:00:00.000Z';
  props.triggers_purged_20260630 = '2026-06-30T00:00:00.000Z';
  props.triggers_purged_log = 'AUCUN';
  if (o.idees !== null) props.IDEES_TOKEN2 = (o.idees === undefined ? SECRETS.IDEES : o.idees);
  props.ADMIN_TOKEN = SECRETS.ADMIN;
  props.BACKUP_TOKEN = SECRETS.BACKUP;
  props.PREMIUM_EMAILS = ALICE + ',' + BOB;
  const sp = {
    getProperty: k => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v); },
    deleteProperty: k => { delete props[k]; }, getProperties: () => Object.assign({}, props), getKeys: () => Object.keys(props),
  };
  const refuse = nom => () => { throw new Error(nom + ' non doublé'); };
  const ctx = {
    console: { log() {}, warn() {}, error() {} },
    PropertiesService: { getScriptProperties: () => sp },
    Utilities: {
      getUuid: () => crypto.randomUUID(), DigestAlgorithm: { SHA_256: 1 }, Charset: { UTF_8: 1 },
      computeDigest: (a, s) => [...crypto.createHash('sha256').update(String(s), 'utf8').digest()].map(x => (x > 127 ? x - 256 : x)),
      formatDate, sleep() {},
    },
    Session: { getScriptTimeZone: () => 'Europe/Paris' },
    Logger: { log: m => { journal.push(String(m)); } },
    MailApp: { sendEmail: (...a) => { mails.push(a); }, getRemainingDailyQuota: () => 100 },
    GmailApp: { sendEmail: (...a) => { mails.push(a); } },
    SpreadsheetApp: { openById: refuse('SpreadsheetApp') },
    DriveApp: { getFolderById: refuse('DriveApp'), getFoldersByName: refuse('DriveApp'), createFolder: refuse('DriveApp') },
    UrlFetchApp: { fetch: refuse('UrlFetchApp') },
    ScriptApp: {
      getProjectTriggers: () => [{ getHandlerFunction: () => 'backupAllUserData_', getEventType: () => 'CLOCK', getTriggerSource: () => 'CLOCK' }],
      newTrigger: refuse('ScriptApp.newTrigger'), deleteTrigger: refuse('ScriptApp.deleteTrigger'),
    },
    ContentService: { createTextOutput: x => ({ t: x, setMimeType() { return this; } }), MimeType: { JSON: 1 } },
    CacheService: { getScriptCache: () => ({ get: () => null, put() {}, remove() {} }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock() {}, releaseLock() {} }) },
  };
  vm.createContext(ctx);
  vm.runInContext(CODE_SRC, ctx, { filename: 'Code.js' });
  const textes = [];   // tout ce que le serveur a répondu — relu par le contrôle « aucune adresse réelle »
  const lire = r => {
    const t = (r && r.t != null) ? String(r.t) : String(r);
    textes.push(t);
    let j = null; try { j = JSON.parse(t); } catch (e) { /* réponse non JSON */ }
    return { t, j: (j && typeof j === 'object') ? j : {} };
  };
  const X = {
    ctx, props, journal, mails, textes,
    get: q => lire(ctx.doGet({ parameter: Object.assign({}, q || {}) })),
    post: (corps, q) => lire(ctx.doPost({ postData: { contents: JSON.stringify(corps) }, parameter: Object.assign({}, q || {}) })),
    compte(email, nom, code, n) {
      ctx.saveUserData_(email, {
        email, profile: { name: nom }, prs: {},
        sessions: Array.from({ length: n || 3 }, (_, i) => ({ id: 1000 + i, ts: 1000 + i, date: '2026-09-0' + (1 + i), volume: 400,
          exs: [{ name: 'Squat à la Barre', sets: [{ kg: 60, reps: 5, type: 'N', done: true }] }] })),
      });
      if (code) { const salt = hex(8); props['auth_' + email] = salt + '$' + ctx._sha256hex_(salt + '|' + code); }
    },
    jeton: email => ctx._jetonPoser_(email, 'tel'),
    instantane: () => JSON.stringify(Object.keys(props).sort().map(k => [k, props[k]])),
    lireCompte: email => ctx.loadUserData_(email),
  };
  return X;
}

/** Les comptes du banc. Le compte admin est PROTÉGÉ par son code perso (contexte produit confirmé par Michel). */
function peupler(X) {
  X.compte(FONDATEUR, 'Fondateur', 'fondateur-code');   // compte admin, protégé, premium « en dur »
  X.compte(ALICE, 'Alice', 'alice-code');               // premium (liste), protégée
  X.compte(BOB, 'Bob', null);                           // premium (liste), SANS code perso
  X.compte(CAROL, 'Carol', 'carol-code');               // non premium, protégée
  X.compte(DAVE, 'Dave', null);                         // non premium, SANS code perso
  return { tokA: X.jeton(ALICE), tokC: X.jeton(CAROL), tokD: X.jeton(DAVE) };
}

// Ce qu'un refus ne doit JAMAIS porter : une adresse, une liste, un statut premium ou de protection.
const CLES_PREMIUM = ['fullPremiumList', 'fullPremiumCount', 'rawPremiumEmails', 'parsedWhitelist', 'hardcodedList',
  'matchProperty', 'matchHardcoded', 'premiumResult', 'whitelistCount', 'emailQueried'];
const CLES_DONNEES = CLES_PREMIUM.concat(['users', 'comptes', 'ideas', 'exercices', 'plusGrosses', 'fails', 'topUsers',
  'hasCode', 'emailVerified', 'premium', 'profile', 'sessions', 'unlocked', 'gardeFouUniversel', 'details']);
const sansDonnee = r => adresses(r.t).length === 0 && !CLES_DONNEES.some(c => c in r.j);
const refusee = r => r.j.status !== 'ok' && sansDonnee(r);
// La réponse d'un admin autorisé : ce que la carte affiche, plus le diagnostic des déclencheurs (aucune donnée de compte).
const CLES_ADMIN_PERMISES = ['status', 'debugPremium', 'matchProperty', 'matchHardcoded', 'fullPremiumList',
  'fullPremiumCount', 'rawPremiumEmails', 'projectTriggers', 'triggerPurgeLog', 'triggerPurgedAt'];
const CLES_ADMIN_UTILES = ['matchProperty', 'matchHardcoded', 'fullPremiumList', 'fullPremiumCount', 'rawPremiumEmails'];

/* ══════════════════════════════ B-SEC-S — LE SERVEUR ══════════════════════════════ */
function serveurTests(t0) {
  const t = masquer(t0);
  console.log('\n═══ B-SEC-S (session-B). SEC-ADMIN-01 — le vrai Code.js : routes admin et diagnostic ═══');
  t('SEC-ADMIN-07a · la liste premium en dur est remplacée par une adresse fictive (1 remplacement exact)', N_HARD === 1,
    'remplacements : ' + N_HARD);
  t('SEC-ADMIN-07b · constants.js du banc : listes admin / testeurs / premium remplacées (6 remplacements exacts)',
    CONST_COMPTES.every(n => n === 1), JSON.stringify(CONST_COMPTES));
  if (N_HARD !== 1) return;   // ⛔ jamais tourner sur les vraies adresses

  // ── SEC-ADMIN-01 : requête anonyme sur la route de diagnostic premium ──
  {
    const X = serveur(); peupler(X);
    const j0 = X.journal.length;
    const a = X.get({ debugPremium: '1', email: ALICE });
    const b = X.get({ debugPremium: '1', email: DAVE });
    const c = X.get({ debugPremium: 'true', email: CAROL });
    const nouveaux = X.journal.slice(j0).join('\n');
    t('⭐⭐ SEC-ADMIN-01a · S-01 : requête ANONYME → aucune adresse, aucune liste premium',
      refusee(a) && refusee(b) && refusee(c), court(a.t) + ' | ' + court(b.t, 120));
    t('SEC-ADMIN-01b · le refus est explicite (error:"token") — la carte Admin sait redemander le jeton',
      a.j.status === 'error' && a.j.error === 'token', court(a.t));
    t('⭐ SEC-ADMIN-07c · une requête anonyme n\'écrit AUCUNE adresse dans le journal du serveur',
      adresses(nouveaux).length === 0, 'journal : ' + adresses(nouveaux).length + ' adresse(s)');
  }

  // ── SEC-ADMIN-02 / 09 : une identité NORMALE (jeton d'appareil, code perso), avec ou sans code posé ──
  {
    const X = serveur(); const k = peupler(X);
    X.post({ action: 'test' });   // échauffement : doPost réécrit PREMIUM_EMAILS une fois (ensurePremiumEmails_)
    const identites = [['anonyme', {}], ['jeton d\'appareil (compte protégé)', { token: k.tokA }],
      ['code perso comme jeton', { token: 'alice-code' }], ['code perso en paramètre', { authCode: 'alice-code' }],
      ['jeton d\'appareil (compte SANS code)', { token: k.tokD }]];
    const ROUTES = [
      ['debugPremium', q => Object.assign({ debugPremium: '1', email: ALICE }, q)],
      ['testGardeFou', q => Object.assign({ action: 'testGardeFou' }, q)],
      ['getIdees', q => Object.assign({ action: 'getIdees' }, q)],
      ['getCustomEx', q => Object.assign({ action: 'getCustomEx' }, q)],
      ['storeHealth', q => Object.assign({ action: 'storeHealth' }, q)],
      ['compressStore', q => Object.assign({ action: 'compressStore' }, q)],
      ['mailFails', q => Object.assign({ action: 'mailFails' }, q)],
      ['aiUsage', q => Object.assign({ action: 'aiUsage' }, q)],
      ['setsCorrompus', q => Object.assign({ action: 'setsCorrompus' }, q)],
      ['sessionDoublons', q => Object.assign({ action: 'sessionDoublons', email: ALICE }, q)],
      ['sessionNettoyer', q => Object.assign({ action: 'sessionNettoyer', email: ALICE }, q)],
      ['gardienStats', q => Object.assign({ action: 'gardienStats' }, q)],
      ['checkBackup', q => Object.assign({ action: 'checkBackup' }, q)],
      ['adminUnlockAuth', q => Object.assign({ action: 'adminUnlockAuth', email: CAROL }, q)],
      ['installDailyBackup', q => Object.assign({ action: 'installDailyBackup', t: q.token }, q)],
      ['migrateBackups', q => Object.assign({ action: 'migrateBackups', t: q.token }, q)],
    ];
    for (const [nom, f] of ROUTES) {
      const fautes = [];
      for (const [qui, cred] of identites) {
        const avant = X.instantane();
        let r; try { r = X.get(f(cred)); } catch (e) { r = { t: 'EXCEPTION ' + e.message, j: { status: 'exception' } }; }
        const apres = X.instantane();
        if (!refusee(r)) fautes.push(qui + ' → ' + court(r.t, 140));
        else if (apres !== avant) fautes.push(qui + ' → refusé mais les propriétés ont CHANGÉ');
      }
      t((nom === 'debugPremium' || nom === 'testGardeFou' ? '⭐⭐ ' : '') + 'SEC-ADMIN-02 · ' + nom +
        ' : anonyme ou identité normale → refus, aucune donnée, aucune écriture', fautes.length === 0, fautes.join(' · '));
    }
    const POSTS = [
      ['listUsers', c => ({ action: 'listUsers', adminToken: c })],
      ['adminRestore', c => ({ action: 'adminRestore', adminToken: c, email: CAROL, data: { profile: { name: 'Pirate' } } })],
      ['migStats', c => ({ action: 'migStats', token_admin: c })],
    ];
    for (const [nom, f] of POSTS) {
      const fautes = [];
      for (const c of [k.tokA, 'alice-code', k.tokD, '', CODE_ADMIN_CLIENT]) {
        const avant = X.instantane();
        const r = X.post(f(c));
        if (!refusee(r)) fautes.push(court(r.t, 140));
        else if (X.instantane() !== avant) fautes.push('refusé mais les propriétés ont CHANGÉ');
      }
      t('SEC-ADMIN-02 · ' + nom + ' (POST) : identité normale → refus, aucune donnée', fautes.length === 0, fautes.join(' · '));
    }
    t('SEC-ADMIN-09a · le code perso de Carol est intact après toutes ces tentatives', !!X.props['auth_' + CAROL]);
  }

  // ── SEC-ADMIN-03 : la seule adresse de l'admin, sans preuve, ne donne rien ──
  {
    const X = serveur(); peupler(X);
    const fautes = [];
    for (const q of [{ debugPremium: '1', email: FONDATEUR }, { debugPremium: '1', email: FONDATEUR, authCode: 'x' },
      { action: 'getIdees', email: FONDATEUR }, { action: 'storeHealth', email: FONDATEUR }]) {
      const r = X.get(q); if (!refusee(r)) fautes.push(JSON.stringify(Object.keys(q)) + ' → ' + court(r.t, 140));
    }
    const p = X.post({ action: 'listUsers', email: FONDATEUR });
    if (!refusee(p)) fautes.push('listUsers → ' + court(p.t, 140));
    t('⭐⭐ SEC-ADMIN-03 · l\'adresse de l\'admin seule (sans jeton) → aucun privilège', fautes.length === 0, fautes.join(' · '));
  }

  // ── SEC-ADMIN-04 : paramètres « admin » fabriqués par le client ──
  {
    const X = serveur(); peupler(X);
    const fautes = [];
    for (const extra of [{ admin: 'true' }, { isAdmin: '1' }, { role: 'admin' }, { adminMode: '1' }, { token: 'true' },
      { token: '1' }, { token: 'admin' }, { token: '' }, { token: 'undefined' }, { token: 'null' }]) {
      const r = X.get(Object.assign({ debugPremium: '1', email: ALICE }, extra));
      if (!refusee(r)) fautes.push(JSON.stringify(extra) + ' → ' + court(r.t, 120));
      const g = X.get(Object.assign({ action: 'testGardeFou' }, extra));
      if (!refusee(g)) fautes.push('testGardeFou ' + JSON.stringify(extra) + ' → ' + court(g.t, 120));
    }
    t('⭐ SEC-ADMIN-04 · admin=true, isAdmin, role, jetons bidons → aucun privilège', fautes.length === 0, fautes.join(' · '));
  }

  // ── SEC-ADMIN-05 : un « état client » falsifié ne vaut rien côté serveur ; le contrôle est FERMÉ par défaut ──
  {
    const X = serveur(); peupler(X);
    const fautes = [];
    const presque = SECRETS.IDEES.slice(0, -1) + (SECRETS.IDEES.slice(-1) === 'a' ? 'b' : 'a');
    for (const [qui, tok] of [['code admin de l\'app', CODE_ADMIN_CLIENT], ['jeton à 1 caractère près', presque],
      ['12 premiers caractères du jeton', SECRETS.IDEES.slice(0, 12)], ['jeton en majuscules', SECRETS.IDEES.toUpperCase()],
      ['marqueur local ft4_admin_ok', '1'], ['jeton d\'un autre secret (sauvegarde)', SECRETS.BACKUP]]) {
      const r = X.get({ debugPremium: '1', email: ALICE, token: tok });
      if (!refusee(r)) fautes.push(qui + ' → ' + court(r.t, 120));
    }
    t('⭐ SEC-ADMIN-05a · code admin de l\'app, jeton approché, marqueur local → refus', fautes.length === 0, fautes.join(' · '));
    const Y = serveur({ idees: null }); peupler(Y);
    const r1 = Y.get({ debugPremium: '1', email: ALICE, token: SECRETS.IDEES });
    const Z = serveur({ idees: 'court1234' }); peupler(Z);
    const r2 = Z.get({ debugPremium: '1', email: ALICE, token: 'court1234' });
    t('⭐⭐ SEC-ADMIN-05b · secret absent ou trop court côté serveur → la route reste FERMÉE (jamais ouverte par défaut)',
      refusee(r1) && refusee(r2), court(r1.t, 120) + ' | ' + court(r2.t, 120));
  }

  // ── SEC-ADMIN-06 : l'admin réellement autorisé — et seulement ce qui est nécessaire ──
  {
    const X = serveur(); peupler(X);
    const j0 = X.journal.length;
    const r = X.get({ debugPremium: '1', email: ALICE, token: SECRETS.IDEES });
    const nouveaux = X.journal.slice(j0).join('\n');
    const liste = (r.j.fullPremiumList || []).slice().sort();
    t('⭐ SEC-ADMIN-06a · admin avec le bon jeton → la liste premium complète (et rien que les premium)',
      r.j.status === 'ok' && JSON.stringify(liste) === JSON.stringify([ALICE, BOB, FONDATEUR].sort()) && r.j.fullPremiumCount === 3
        && r.j.matchProperty === true && r.j.matchHardcoded === false && r.j.rawPremiumEmails === ALICE + ',' + BOB,
      court(r.t, 300));
    const enTrop = Object.keys(r.j).filter(c => CLES_ADMIN_PERMISES.indexOf(c) < 0);
    const manque = CLES_ADMIN_UTILES.filter(c => !(c in r.j));
    t('⭐ SEC-ADMIN-06b · la réponse admin ne porte que ce que la carte affiche (aucun doublon de la liste)',
      enTrop.length === 0 && manque.length === 0, 'en trop : ' + enTrop.join(',') + ' · manque : ' + manque.join(','));
    t('⭐ SEC-ADMIN-07d · même autorisé, le diagnostic n\'écrit aucune adresse dans le journal du serveur',
      adresses(nouveaux).length === 0, 'journal : ' + adresses(nouveaux).length + ' adresse(s)');
    const avant = X.instantane();
    const g = X.get({ action: 'testGardeFou', token: SECRETS.IDEES });
    const restes = Object.keys(X.props).filter(c => /^(u|h)_ft_gf_/.test(c));
    t('SEC-ADMIN-06c · testGardeFou avec le bon jeton → il tourne et se nettoie (aucun compte de test laissé)',
      g.j.status === 'ok' && g.j.gardeFouUniversel === true && restes.length === 0, court(g.t, 200) + ' restes:' + restes.length);
    t('SEC-ADMIN-06d · testGardeFou ne touche aucun vrai compte', JSON.stringify(X.lireCompte(ALICE).profile) === JSON.stringify({ name: 'Alice' })
      && avant.indexOf('"u_' + ALICE + '"') >= 0);
  }

  // ── SEC-ADMIN-08 : routes inconnues et anciennes formes → fermé ──
  {
    const X = serveur(); peupler(X);
    const fautes = [];
    for (const q of [{ action: 'debugPremium', email: ALICE }, { debugPremium: '1' }, { action: 'inconnue', email: ALICE },
      { action: 'listUsers' }, { action: 'adminRestore' }, { action: 'testGardeFou' }, { debug: '1', email: ALICE }, {}]) {
      const avant = X.instantane();
      const r = X.get(q);
      if (!refusee(r)) fautes.push(JSON.stringify(q) + ' → ' + court(r.t, 120));
      else if (X.instantane() !== avant) fautes.push(JSON.stringify(q) + ' → refusé mais propriétés modifiées');
    }
    const p = X.post({ action: 'debugPremium', email: ALICE });
    if (!refusee(p)) fautes.push('POST debugPremium → ' + court(p.t, 120));
    t('⭐ SEC-ADMIN-08 · route inconnue ou ancienne forme du diagnostic → refus, sans donnée ni écriture',
      fautes.length === 0, fautes.join(' · '));
  }

  // ── SEC-ADMIN-09 : un compte SANS code perso n'ouvre jamais les données d'un autre ──
  {
    const X = serveur(); const k = peupler(X);
    const lA = X.post({ action: 'loadProfile', email: ALICE, token: k.tokD });
    const lB = X.post({ action: 'loadProfile', email: BOB, token: k.tokD });
    const lC = X.get({ action: 'loadProfile', email: CAROL, token: k.tokD });
    t('⭐ SEC-ADMIN-09b · le jeton d\'un compte sans code ne lit ni un compte protégé ni un autre compte ouvert',
      lA.j.error === 'auth' && !lA.j.profile && lB.j.error === 'auth' && !lB.j.profile && lC.j.error === 'auth' && !lC.j.profile,
      court(lA.t, 90) + ' | ' + court(lB.t, 90) + ' | ' + court(lC.t, 90));
    const s = X.post({ action: 'saveProfile', email: BOB, token: k.tokD, name: 'Pirate' });
    t('⭐ SEC-ADMIN-09c · « jeton de Dave + adresse de Bob » écrit chez DAVE, jamais chez Bob',
      s.j.status === 'ok' && X.lireCompte(BOB).profile.name === 'Bob' && X.lireCompte(DAVE).profile.name === 'Pirate',
      court(s.t, 120) + ' bob=' + X.lireCompte(BOB).profile.name);
    // CONSTAT (pas une faute de ce lot) : la transition sans jeton est une décision de Michel (`_MIG_FERME_` = false).
    const tr = X.post({ action: 'saveProfile', email: BOB, name: 'Ecrase' });
    t('CONSTAT (décision de Michel, transition `_MIG_FERME_`) : SANS jeton, un compte sans code reste écrasable par qui connaît son adresse',
      tr.j.status === 'ok' && X.lireCompte(BOB).profile.name === 'Ecrase',
      'si ce témoin rougit, la transition a été fermée : mets-le à jour, ne le « répare » pas');
    const trC = X.post({ action: 'saveProfile', email: CAROL, name: 'Ecrase' });
    t('SEC-ADMIN-09d · … mais un compte AVEC code refuse la même écriture', trC.j.error === 'auth' && X.lireCompte(CAROL).profile.name === 'Carol',
      court(trC.t, 120));
  }

  // ── SEC-ADMIN-10 : compte protégé — comportement normal inchangé ──
  {
    const X = serveur(); const k = peupler(X);
    const ok = X.post({ action: 'loadProfile', email: CAROL, authCode: 'carol-code' });
    const faux = X.post({ action: 'loadProfile', email: CAROL, authCode: 'mauvais' });
    const ecr = X.post({ action: 'saveProfile', email: CAROL, authCode: 'carol-code', token: k.tokC, weightLog: [{ date: '2026-10-09', kg: 61 }] });
    const st = X.get({ action: 'authStatus', email: CAROL });
    t('SEC-ADMIN-10a · compte protégé : le bon code lit le compte', ok.j.status === 'ok' && (ok.j.sessions || []).length === 3, court(ok.t, 120));
    t('SEC-ADMIN-10b · compte protégé : un mauvais code est refusé', faux.j.error === 'auth' && !faux.j.profile, court(faux.t, 120));
    t('SEC-ADMIN-10c · compte protégé : l\'écriture avec son code passe', ecr.j.status === 'ok'
      && (X.lireCompte(CAROL).weightLog || []).some(w => w.kg === 61), court(ecr.t, 120));
    t('SEC-ADMIN-10d · authStatus (route ouverte, décision du 07/08) répond toujours pareil', st.j.status === 'ok' && st.j.hasCode === true, court(st.t, 120));
  }

  // ── SEC-ADMIN-11 / 12 / 13 : synchro, restauration et premium normaux ──
  {
    const X = serveur(); const k = peupler(X);
    const s = X.post({ action: 'saveProfile', email: ALICE, token: k.tokA, authCode: 'alice-code', weightLog: [{ date: '2026-10-09', kg: 58 }] });
    t('SEC-ADMIN-11 · synchro normale : l\'écriture d\'Alice (jeton + code) passe et se relit',
      s.j.status === 'ok' && (X.lireCompte(ALICE).weightLog || []).some(w => w.kg === 58), court(s.t, 120));
    const rp = X.post({ action: 'loadProfile', email: ALICE, authCode: 'alice-code' });
    const rg = X.get({ action: 'loadProfile', email: ALICE, authCode: 'alice-code' });
    t('SEC-ADMIN-12 · restauration normale : Alice retrouve son profil et ses 3 séances (POST et GET)',
      rp.j.status === 'ok' && rp.j.profile.name === 'Alice' && rp.j.sessions.length === 3 && rg.j.status === 'ok' && rg.j.sessions.length === 3,
      court(rp.t, 120));
    const pc = X.post({ action: 'loadProfile', email: CAROL, authCode: 'carol-code' });
    const iA = X.post({ action: 'authIdentity', token: k.tokA });
    const iD = X.post({ action: 'authIdentity', token: k.tokD });
    const fond = X.ctx.getPremiumStatus_(FONDATEUR);
    t('⭐ SEC-ADMIN-13 · premium normal : liste (Alice oui, Carol non), jeton (Alice oui, Dave non), compte en dur (oui)',
      rp.j.premium === true && pc.j.premium === false && iA.j.premium === true && iD.j.premium === false && fond.premium === true,
      [rp.j.premium, pc.j.premium, iA.j.premium, iD.j.premium, fond.premium].join(','));
    t('SEC-ADMIN-13b · le filet PREMIUM_EMAILS ← liste en dur est intact (ensurePremiumEmails_)',
      String(X.props.PREMIUM_EMAILS || '').split(',').indexOf(FONDATEUR) >= 0, court(X.props.PREMIUM_EMAILS));
  }
}

/* ══════════════════════════════ B-SEC-E — L'ÉCRAN ══════════════════════════════ */
module.exports.ecran = async function (t0, b, PORT) {
  const t = masquer(t0);
  serveurTests(t0);
  console.log('\n═══ B-SEC-E (session-B). SEC-ADMIN-01 — le mode admin de l\'app contre le vrai Code.js ═══');
  if (N_HARD !== 1 || !CONST_COMPTES.every(n => n === 1)) { t('SEC-ADMIN-E · harnais valide (remplacements)', false, 'arrêt : remplacements invalides'); return; }
  const tousLesEnvois = [];
  let reelsTotal = 0;
  const ouvrir = async (o) => {
    const srv = serveur(); const toks = peupler(srv);
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    const st = { req: [], worker: [] };
    await cx.route(/\/constants\.js(\?|$)/, r => r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: CONST_SRC }));
    await cx.route(/supabase\.co|anthropic\.com/, r => { reelsTotal++; return r.abort(); });
    await cx.route(/workers\.dev/, r => { st.worker.push(r.request().postData() || ''); tousLesEnvois.push(r.request().postData() || '');
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok","reply":"ok"}' }); });
    await cx.route(/script\.google\.com/, async r => {
      const req = r.request(), u = new URL(req.url());
      if (u.searchParams.get('test') === '1') return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"online","version":"3.5"}' });
      let rep = '{"status":"ok"}';
      try {
        if (req.method() === 'GET') {
          const q = Object.fromEntries(u.searchParams.entries());
          st.req.push({ m: 'GET', action: q.action || (q.debugPremium ? 'debugPremium' : ''), email: String(q.email || '').toLowerCase(), token: q.token || q.t || '', brut: u.search });
          rep = srv.get(q).t;
        } else {
          const txt = req.postData() || '{}'; let c = {}; try { c = JSON.parse(txt); } catch (e) { /* corps illisible */ }
          st.req.push({ m: 'POST', action: c.action || '', email: String(c.email || '').toLowerCase(), token: c.token || '', brut: txt });
          if (c.action === 'logSession') rep = '{"status":"ok","count":' + ((c.rows || []).length) + '}';
          else rep = srv.post(c).t;
        }
      } catch (e) { rep = JSON.stringify({ status: 'error', error: 'harnais:' + e.message }); }
      tousLesEnvois.push(st.req.length ? st.req[st.req.length - 1].brut : '');
      return r.fulfill({ status: 200, contentType: 'application/json', body: rep });
    });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    const init = o.stock ? o.stock(toks) : {};
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_sec'))return; sessionStorage.setItem('_sec','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(o.attente || 2600);
    return { cx, pg, st, srv, toks, errs };
  };
  const BASE = { ft4_ob2: '1', ft4_guide_shown: '1', ft4_wn_seen: '999' };
  /** Ouvre la carte « 🔑 Statut Premium » de l'onglet Admin et appuie sur son VRAI bouton. */
  const carteStatut = async (X, promptRendu) => {
    await X.pg.evaluate(v => { window.prompt = () => v; if (!window._adminMode) _toggleAdminMode(); }, promptRendu);
    await X.pg.waitForTimeout(500);
    await X.pg.click('button[onclick="debugPremiumCheck()"]', { timeout: 4000 }).catch(async () => { await X.pg.evaluate(() => debugPremiumCheck()); });
    await X.pg.waitForTimeout(1800);
    return X.pg.evaluate(() => (document.getElementById('admin-premium-info') || {}).innerHTML || '');
  };

  // ── B / C : le déverrouillage admin sur un appareil vierge ne change pas l'identité ──
  {
    const X = await ouvrir({ stock: () => Object.assign({}, BASE) });
    await X.pg.evaluate(code => {
      for (let i = 0; i < 5; i++) onLogoTap();
      const inp = document.getElementById('admin-code-inp'); if (inp) inp.value = code;
      _submitAdminCode();
    }, CODE_ADMIN_CLIENT);
    await X.pg.waitForTimeout(5600);   // > délai de la synchro différée (4 s)
    const e = await X.pg.evaluate(() => ({ email: S.email || '', ls: localStorage.getItem('ft4_email') || '', admin: !!window._adminMode,
      champ: (document.getElementById('email-inp') || {}).value || '' }));
    // L'appareil n'a AUCUNE adresse : aucune requête ne doit en porter une — ni celle de constants.js, ni une écrite en dur.
    const auNomAdmin = X.st.req.filter(q => q.email || adresses(q.brut).length);
    const codeParti = X.st.req.some(q => q.brut.indexOf(CODE_ADMIN_CLIENT) >= 0) || X.st.worker.some(w => w.indexOf(CODE_ADMIN_CLIENT) >= 0);
    t('SEC-ADMIN-B1 · appareil vierge + code admin de l\'app → le mode admin s\'ouvre (verrou d\'INTERFACE seulement)', e.admin === true, JSON.stringify(e));
    t('⭐⭐ SEC-ADMIN-B2 · … et l\'identité locale ne change PAS : S.email et ft4_email restent vides', e.email === '' && e.ls === '', JSON.stringify(e));
    t('SEC-ADMIN-B3 · le champ e-mail de l\'onglet Admin n\'est pas pré-rempli avec l\'adresse de l\'admin', e.champ === '', JSON.stringify(e));
    t('⭐⭐ SEC-ADMIN-C1 · aucune requête ne part au nom d\'une adresse (ni celle de l\'admin, ni aucune autre)', auNomAdmin.length === 0,
      auNomAdmin.map(q => q.m + ' ' + q.action).join(','));
    t('⭐ SEC-ADMIN-A1 · le code admin de l\'app ne quitte jamais l\'appareil (aucune requête ne le porte)', !codeParti);
    t('SEC-ADMIN-B4 · aucune erreur JavaScript', X.errs.length === 0, X.errs.join(' | '));
    await X.cx.close();
  }

  // ── 05 (écran) : un appareil « admin » falsifié, SANS jeton serveur → la carte ne montre aucune liste ──
  {
    const X = await ouvrir({ stock: k => Object.assign({}, BASE, { ft4_email: DAVE, ft4_name: 'Dave', ft4_devtoken: k.tokD, ft4_devtoken_compte: DAVE, ft4_admin_ok: '1' }) });
    const h = await carteStatut(X, '');
    t('⭐⭐ SEC-ADMIN-E2 · marqueur admin local falsifié, aucun jeton → la carte « Statut Premium » n\'affiche AUCUNE autre adresse',
      h.indexOf(ALICE) < 0 && h.indexOf(BOB) < 0 && h.indexOf(FONDATEUR) < 0 && !/Tous les comptes premium/.test(h), court(h.replace(/<[^>]+>/g, ' '), 260));
    await X.cx.close();
  }
  {
    const X = await ouvrir({ stock: k => Object.assign({}, BASE, { ft4_email: DAVE, ft4_name: 'Dave', ft4_devtoken: k.tokD, ft4_devtoken_compte: DAVE,
      ft4_admin_ok: '1', ft4_admin_tok: 'faux-jeton-0123456789' }) });
    const h = await carteStatut(X, '');
    const oublie = await X.pg.evaluate(() => localStorage.getItem('ft4_admin_tok'));
    t('⭐ SEC-ADMIN-E3 · jeton tapé FAUX → le serveur refuse, aucune liste, et le jeton faux est oublié (redemandé au prochain essai)',
      h.indexOf(ALICE) < 0 && h.indexOf(BOB) < 0 && !/Tous les comptes premium/.test(h) && !oublie, court(h.replace(/<[^>]+>/g, ' '), 200) + ' tok=' + !!oublie);
    await X.cx.close();
  }

  // ── 03 (écran) : quelqu'un tape l'adresse de l'admin comme la sienne, sans code ni jeton ──
  {
    const X = await ouvrir({ stock: () => Object.assign({}, BASE, { ft4_email: FONDATEUR, ft4_name: 'Inconnu' }), attente: 3200 });
    const e = await X.pg.evaluate(() => ({ n: (S.sessions || []).length, nom: S.name || '' }));
    const h = await carteStatut(X, '');
    await X.pg.waitForTimeout(4500);
    const fond = X.srv.lireCompte(FONDATEUR);
    t('⭐⭐ SEC-ADMIN-E6 · adresse de l\'admin tapée sans preuve → aucune liste premium dans la carte',
      h.indexOf(ALICE) < 0 && h.indexOf(BOB) < 0 && !/Tous les comptes premium/.test(h), court(h.replace(/<[^>]+>/g, ' '), 200));
    t('SEC-ADMIN-E6b · … et le compte de l\'admin (protégé) n\'est ni restauré sur cet appareil ni écrasé',
      e.n === 0 && e.nom !== 'Fondateur' && fond.profile.name === 'Fondateur' && fond.sessions.length === 3, JSON.stringify(e) + ' serveur=' + fond.profile.name);
    await X.cx.close();
  }

  // ── 06 (écran) : l'appareil de l'admin, avec le vrai jeton → la carte fonctionne ──
  {
    const X = await ouvrir({ stock: () => Object.assign({}, BASE, { ft4_email: FONDATEUR, ft4_name: 'Fondateur', ft4_authcode: 'fondateur-code', ft4_admin_tok: SECRETS.IDEES }), attente: 3000 });
    const h = await carteStatut(X, '');
    const dbg = X.st.req.filter(q => q.action === 'debugPremium');
    t('⭐ SEC-ADMIN-E4 · admin + bon jeton → la carte affiche la liste premium (3 comptes)',
      h.indexOf(ALICE) >= 0 && h.indexOf(BOB) >= 0 && h.indexOf(FONDATEUR) >= 0 && /\(3\)/.test(h), court(h.replace(/<[^>]+>/g, ' '), 260));
    t('SEC-ADMIN-E4b · la carte présente le jeton admin au serveur (la décision est prise côté serveur)',
      dbg.length > 0 && dbg.every(q => q.token === SECRETS.IDEES), dbg.length + ' requête(s)');
    await X.cx.close();
  }

  // ── Vue « Qui a protégé son compte » : un libellé exact ──
  {
    const X = await ouvrir({ stock: () => Object.assign({}, BASE, { ft4_email: FONDATEUR, ft4_name: 'Fondateur', ft4_authcode: 'fondateur-code' }), attente: 3000 });
    const r = await X.pg.evaluate(async () => {
      const box = document.getElementById('admin-auth-list');
      const carte = box ? box.closest('.card') : null;
      const texte = carte ? carte.textContent.replace(/\s+/g, ' ') : '';
      await loadAuthStatusAdmin();
      return { texte, liste: box ? box.innerText : '' };
    });
    t('⭐ SEC-ADMIN-E5a · la carte ne prétend plus « ne lire aucune donnée personnelle » : elle dit qu\'elle affiche l\'adresse e-mail',
      !/sans lire aucune donn/i.test(r.texte) && /adresse e-mail/i.test(r.texte), court(r.texte, 300));
    t('SEC-ADMIN-E5b · le résumé ne dit plus « lisibles côté serveur » (faux en lecture stricte) pour un compte sans code',
      /1 compte sans code/.test(r.liste) && !/lisibles? côté serveur/i.test(r.liste), court(r.liste, 300));
    t('SEC-ADMIN-E5c · la vue classe toujours juste : Bob OUVERT, Carol protégée', /bob@example\.test\s*OUVERT/.test(r.liste)
      && /carol@example\.test\s*protégé/.test(r.liste), court(r.liste, 300));
    await X.cx.close();
  }

  // ── 11 / 12 / 13 (écran) : synchro, restauration, premium — inchangés ──
  {
    const X = await ouvrir({ stock: k => Object.assign({}, BASE, { ft4_email: ALICE, ft4_name: 'Alice', ft4_authcode: 'alice-code',
      ft4_devtoken: k.tokA, ft4_devtoken_compte: ALICE }), attente: 3000 });
    const prem = await X.pg.evaluate(() => S.premium === true);
    await X.pg.evaluate(() => { S.weightLog = (S.weightLog || []).concat([{ date: '2026-10-09', kg: 57 }]); persist(); _cloudSync(); });
    await X.pg.waitForTimeout(2500);
    const a = X.srv.lireCompte(ALICE);
    t('SEC-ADMIN-E11 · synchro normale depuis l\'app : la pesée d\'Alice arrive dans son compte', (a.weightLog || []).some(w => w.kg === 57),
      JSON.stringify(a.weightLog || []));
    t('SEC-ADMIN-E13 · premium normal dans l\'app : Alice (premium) est premium après le démarrage', prem === true);
    await X.cx.close();
  }
  {
    const X = await ouvrir({ stock: () => Object.assign({}, BASE), attente: 2600 });
    await X.pg.evaluate(async em => { const i = document.getElementById('restore-email-inp'); if (i) i.value = em; await doRestoreAccount(); }, ALICE);
    await X.pg.waitForTimeout(900);
    await X.pg.evaluate(() => { const c = document.getElementById('restore-code-inp'); if (c) c.value = 'alice-code'; _restoreSubmitCode(); });
    await X.pg.waitForTimeout(3200);
    const e = await X.pg.evaluate(() => ({ email: S.email || '', n: (S.sessions || []).length }));
    t('SEC-ADMIN-E12 · restauration normale : appareil neuf + adresse + code → Alice retrouve ses 3 séances', e.email === ALICE && e.n === 3, JSON.stringify(e));
    await X.cx.close();
  }
  {
    const X = await ouvrir({ stock: k => Object.assign({}, BASE, { ft4_email: CAROL, ft4_name: 'Carol', ft4_authcode: 'carol-code',
      ft4_devtoken: k.tokC, ft4_devtoken_compte: CAROL }), attente: 3000 });
    const prem = await X.pg.evaluate(() => S.premium === true);
    t('SEC-ADMIN-E13b · premium normal dans l\'app : Carol (non premium) n\'est pas premium', prem === false);
    await X.cx.close();
  }

  // ── 07 : aucune adresse réelle n'a circulé ; 0 appel réel ──
  const propre = fs.readFileSync(__filename, 'utf8');
  t('⭐ SEC-ADMIN-07e · ce banc ne contient aucune adresse réelle (fixtures en example.test)', reelles(propre).length === 0,
    reelles(propre).length + ' adresse(s) non fictive(s)');
  t('⭐ SEC-ADMIN-07f · aucune adresse réelle dans les requêtes de l\'app pendant le banc', tousLesEnvois.every(s => reelles(s).length === 0),
    tousLesEnvois.filter(s => reelles(s).length).length + ' requête(s)');
  t('SEC-ADMIN-07g · 0 appel réel (Supabase, Anthropic)', reelsTotal === 0, String(reelsTotal));
};

module.exports.serveurTests = serveurTests;
