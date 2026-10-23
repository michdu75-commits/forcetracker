/* ═════════════════════════════════════════════════════════════════════════════════════════════
   🛡️ NUT-SECURISATION-P1 — le journal alimentaire et les favoris ne perdent plus rien en silence (session-B · 23/10/2026)
   Bloc : B-NSP1. Banc : tools/banc_nut_secu_p1.js · contrôle négatif : tools/mut_nut_secu_p1.py
   CONDUIT : le VRAI Code.js exécuté en local (vm Node) par ses VRAIES portes — `doPost` (saveProfile, loadProfile,
     nutInventory, nutBackupAudit) et `doGet` (loadProfile) — plus la vraie sauvegarde nocturne `backupAllUserData_`.
   SIMULÉ : les services Google — propriétés en mémoire, compression RÉELLE (zlib) derrière `Utilities.gzip`, Drive en
     mémoire (un dossier de sauvegardes), ni classeur, ni courriel, ni réseau.
   OBSERVE : le compte stocké (journal actif + zone de récupération `recupNut`), chaque réponse brute, le journal `Logger`,
     les propriétés avant/après, le fichier de sauvegarde écrit, les compteurs des routes A1.
   NE COUVRE PAS : le vrai déploiement Apps Script, les vraies Script Properties (leur plafond réel de 512 Ko n'est pas
     simulé : la taille est MESURÉE et affichée), deux envois SIMULTANÉS (aucun verrou dans Code.js — défaut préexistant),
     le client (P1 ne modifie aucun fichier de l'app : les envois ont la forme de `_cloudSync`, setup.js).
   ⛔⛔ DONNÉES INVENTÉES SEULEMENT : adresses du domaine réservé example.test (RFC 2606), repas « repas-fictif-… »,
     favoris « fav-fictif-… ». La liste premium en dur de Code.js est remplacée avant exécution (remplacement COMPTÉ).
   ═════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), vm = require('vm'), crypto = require('crypto'), zlib = require('zlib'), path = require('path');
const RACINE = path.join(__dirname, '..', '..');

const FONDATEUR = 'fondateur@example.test', ALICE = 'alice@example.test', BOB = 'bob@example.test',
      CAROL = 'carol@example.test', DAVE = 'dave@example.test';
const PII = /example\.test|repas-fictif|fav-fictif/;
const hex = n => crypto.randomBytes(n).toString('hex');
const TOK_IDEES = 'idees-' + hex(16);

// ── Le VRAI Code.js, la liste premium en dur remplacée (et le remplacement compté) ──
const CODE_BRUT = fs.readFileSync(path.join(RACINE, 'Code.js'), 'utf8');
const RE_HARD = /const PREMIUM_HARDCODED_ = \[[^\]]*\];/g;
const N_HARD = (CODE_BRUT.match(RE_HARD) || []).length;
const CODE_SRC = CODE_BRUT.replace(RE_HARD, "const PREMIUM_HARDCODED_ = ['" + FONDATEUR + "'];");

const blob = d => { const b = Buffer.isBuffer(d) ? d : Buffer.from(String(d), 'utf8');
  return { getBytes: () => b, getDataAsString: () => b.toString('utf8'), setName() { return this; } }; };
const formatDate = (d, tz, f) => {
  const x = new Date(d), p = n => String(n).padStart(2, '0');
  return String(f || "yyyy-MM-dd'T'HH:mm:ss").replace('yyyy', x.getUTCFullYear()).replace('MM', p(x.getUTCMonth() + 1))
    .replace('dd', p(x.getUTCDate())).replace('HH', p(x.getUTCHours())).replace('mm', p(x.getUTCMinutes()))
    .replace('ss', p(x.getUTCSeconds())).replace(/'/g, '');
};

/** Un serveur neuf : le vrai Code.js, des propriétés en mémoire, la vraie compression, un Drive en mémoire. */
function serveur(o) {
  o = o || {};
  const props = Object.create(null), journal = [], ecritures = [], fichiers = o.fichiers || [];
  props.backup_set_tags_2026_06_29 = '2026-06-29T00:00:00.000Z';
  props.triggers_purged_20260630 = '2026-06-30T00:00:00.000Z';
  props.triggers_purged_log = 'AUCUN';
  props.IDEES_TOKEN2 = TOK_IDEES;
  props.PREMIUM_EMAILS = FONDATEUR;
  const sp = {
    getProperty: k => (k in props ? props[k] : null),
    setProperty: (k, v) => { if (o.panne && o.panne(k)) throw new Error('écriture refusée (panne simulée)'); ecritures.push(k); props[k] = String(v); },
    deleteProperty: k => { ecritures.push('-' + k); delete props[k]; },
    getProperties: () => Object.assign({}, props), getKeys: () => Object.keys(props),
  };
  const iter = l => { let i = 0; return { hasNext: () => i < l.length, next: () => l[i++] }; };
  const fichier = f => ({ getName: () => f.name, getLastUpdated: () => new Date(f.updated), getSize: () => Buffer.byteLength(f.content),
    getBlob: () => blob(f.content), getId: () => 'f_' + f.name });
  const dossier = {
    getId: () => 'dossier_ft', getName: () => 'ForceTracker-Backups',
    getFiles: () => iter(fichiers.map(fichier)), getFilesByName: nm => iter(fichiers.filter(x => x.name === nm).map(fichier)),
    createFile: (nom, contenu) => { const f = { name: String(nom), updated: Date.now(), content: String(contenu) }; fichiers.push(f); return fichier(f); },
  };
  const refuse = nom => () => { throw new Error(nom + ' non doublé'); };
  const mails = [];
  const ctx = {
    console: { log() {}, warn() {}, error() {} },
    PropertiesService: { getScriptProperties: () => sp },
    Utilities: {
      getUuid: () => crypto.randomUUID(), DigestAlgorithm: { SHA_256: 1 }, Charset: { UTF_8: 1 },
      computeDigest: (a, s) => [...crypto.createHash('sha256').update(String(s), 'utf8').digest()].map(x => (x > 127 ? x - 256 : x)),
      newBlob: d => blob(d), gzip: b => blob(zlib.gzipSync(b.getBytes())), ungzip: b => blob(zlib.gunzipSync(b.getBytes())),
      base64Encode: b => Buffer.from(b.getBytes ? b.getBytes() : b).toString('base64'),
      // ⚠️ Comme Apps Script : `base64Decode` rend des OCTETS (pas un blob) — sinon `_packUser_` ne se relit pas et
      //    n'ose jamais compresser : la mesure de taille serait fausse (vu au 1er lancement : 167 Ko « compressés »).
      base64Decode: s => Buffer.from(String(s), 'base64'),
      formatDate, sleep() {},
    },
    Session: { getScriptTimeZone: () => 'Europe/Paris' },
    Logger: { log: m => { journal.push(String(m)); } },
    MailApp: { sendEmail: (...a) => { mails.push(a); }, getRemainingDailyQuota: () => 100 },
    GmailApp: { sendEmail: (...a) => { mails.push(a); } },
    SpreadsheetApp: { openById: refuse('SpreadsheetApp') },
    DriveApp: { getFolderById: () => dossier, getFoldersByName: () => iter([dossier]), createFolder: refuse('DriveApp.createFolder') },
    UrlFetchApp: { fetch: refuse('UrlFetchApp') },
    ScriptApp: { getProjectTriggers: () => [], newTrigger: refuse('ScriptApp.newTrigger'), deleteTrigger: refuse('ScriptApp.deleteTrigger') },
    ContentService: { createTextOutput: x => ({ t: x, setMimeType() { return this; } }), MimeType: { JSON: 1 } },
    CacheService: { getScriptCache: () => ({ get: () => null, put() {}, remove() {} }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock() {}, releaseLock() {} }) },
  };
  vm.createContext(ctx);
  vm.runInContext(CODE_SRC, ctx, { filename: 'Code.js' });
  const textes = [];
  const lire = r => {
    const t = (r && r.t != null) ? String(r.t) : String(r);
    textes.push(t);
    let j = null; try { j = JSON.parse(t); } catch (e) { /* réponse non JSON */ }
    return { t, j: (j && typeof j === 'object') ? j : {} };
  };
  const X = {
    ctx, props, journal, ecritures, fichiers, textes, mails,
    get: q => lire(ctx.doGet({ parameter: Object.assign({}, q || {}) })),
    post: corps => lire(ctx.doPost({ postData: { contents: typeof corps === 'string' ? corps : JSON.stringify(corps) }, parameter: {} })),
    /** Un compte tel qu'il existe au serveur avant l'envoi (écrit par le vrai saveUserData_, donc compressé). */
    compte(email, o2) {
      o2 = o2 || {};
      const profile = { name: 'N' };
      if (o2.foodLog !== undefined) profile.foodLog = o2.foodLog;
      if (o2.savedFoods !== undefined) profile.savedFoods = o2.savedFoods;
      ctx.saveUserData_(email, { email, profile, prs: {}, sessions: [] });
      if (o2.code) { const salt = hex(8); props['auth_' + email] = salt + '$' + ctx._sha256hex_(salt + '|' + o2.code); }
    },
    envoi: (email, champs) => X.post(Object.assign({ action: 'saveProfile', email }, champs)),
    lireCompte: email => ctx.loadUserData_(email),
    brut: email => props['u_' + email],
  };
  return X;
}

/* ── Données inventées : une ligne a la forme réelle d'une entrée du journal (app.js, `_provFood`) ── */
const ligne = (i, o) => {
  o = o || {};
  return Object.assign({
    date: (o.mois || '2026-09-') + String(1 + (i % 28)).padStart(2, '0'), meal: ['petit-dej', 'midi', 'collation', 'soir'][i % 4],
    name: 'repas-fictif-' + (o.tag || '') + i, ts: 1758000000000 + i * 60000,
    id: (o.tag || 'x') + '-' + crypto.createHash('md5').update((o.tag || 'x') + ':' + i).digest('hex').slice(0, 24),
    kcal: 100 + (i % 50) * 7, prot: 5 + (i % 9), carbs: 10 + (i % 13), fat: 2 + (i % 5),
    v: 1, saisie: 'liste', origine: 'utilisateur', q: 100 + (i % 3) * 50, u: 'g', etat: null,
    sourceId: 'ciqual:' + (1000 + (i % 300)), per100: { kcal: 100 + (i % 50), prot: 5, carbs: 10, fat: 2 }, modifie: false,
  }, o.extra || {});
};
const J = (n, o, depart) => Array.from({ length: n }, (_, k) => ligne((depart || 0) + k, o));
const fav = i => ({ name: 'fav-fictif-' + i, kcal: 90 + i, prot: 3, carbs: 12, fat: 1, per100: { kcal: 90 + i, prot: 3, carbs: 12, fat: 1 },
  q: 100, u: 'g', portionLabel: null, portionWeightG: null });
const F = n => Array.from({ length: n }, (_, i) => fav(i));
const copie = v => JSON.parse(JSON.stringify(v));

/* ── Lecture de l'état : journal actif, zone, et « rien n'est perdu » au sens strict (multi-ensemble, id compris) ── */
const canon = v => JSON.stringify((function tri(x) {
  if (Array.isArray(x)) return x.map(tri);
  if (x && typeof x === 'object') { const r = {}; Object.keys(x).sort().forEach(k => { r[k] = tri(x[k]); }); return r; }
  return x;
})(v));
const zoneDe = (c, nom) => (((c && c.recupNut) || {})[nom] || []);
const lignesZone = (c, nom) => zoneDe(c, nom).map(r => r.l);
const evts = c => (((c && c.recupNut) || {}).evts || []);
const listeDe = (c, nom) => ((c && c.profile) || {})[nom];
/** Combien de lignes d'`origine` ne se retrouvent NULLE PART (ni au journal actif, ni dans la zone) — 0 = rien perdu. */
function perdues(origine, c, nom) {
  const dispo = new Map();
  [].concat(Array.isArray(listeDe(c, nom)) ? listeDe(c, nom) : [], lignesZone(c, nom))
    .forEach(l => { const k = canon(l); dispo.set(k, (dispo.get(k) || 0) + 1); });
  let n = 0;
  origine.forEach(l => { const k = canon(l); const d = dispo.get(k) || 0; if (d > 0) dispo.set(k, d - 1); else n++; });
  return n;
}
const memes = (a, b) => canon(a) === canon(b);
const court = (x, n) => String(x == null ? '' : x).slice(0, n || 200);
const masque = s => String(s == null ? '' : s).replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[adresse]');

/* ══════════════════════════════ B-NSP1 — LE SERVEUR ══════════════════════════════ */
function serveurTests(t0) {
  const t = (nom, cond, det) => t0(nom, cond, det == null ? det : masque(det));
  console.log('\n═══ B-NSP1 (session-B). NUT-SECURISATION-P1 — le vrai Code.js : journal alimentaire et favoris ═══');
  t('NSP1-00 · harnais valide : liste premium en dur remplacée une fois (aucune adresse réelle exécutée)', N_HARD === 1, 'remplacements=' + N_HARD);
  if (N_HARD !== 1) return;

  // ── 1 · 500 lignes remplacées par 1 (appareil remis à zéro qui saisit un repas) ──
  {
    const X = serveur(); const avant = J(500, { tag: 'a' }); const neuf = ligne(9000, { tag: 'n' });
    X.compte(ALICE, { foodLog: copie(avant) });
    const r = X.envoi(ALICE, { foodLog: [neuf] }); const c = X.lireCompte(ALICE);
    const e = evts(c).slice(-1)[0] || {};
    t('⭐⭐ NSP1-01 · 500 lignes remplacées par 1 : AUCUNE des 500 n\'est perdue (journal actif + zone de récupération)',
      r.j.status === 'ok' && perdues(avant, c, 'foodLog') === 0, 'perdues=' + perdues(avant, c, 'foodLog') + ' zone=' + zoneDe(c, 'foodLog').length);
    t('NSP1-02 · … le journal actif reçoit l\'envoi TEL QUEL : rien n\'est réintroduit d\'office (une absence est ambiguë)',
      memes(listeDe(c, 'foodLog'), [neuf]), 'journal=' + (listeDe(c, 'foodLog') || []).length);
    t('⭐ NSP1-03 · … l\'écart est SIGNALÉ comme rétrécissement brutal : événement daté, 500 → 1, que des nombres',
      e.brutal === true && e.avant === 500 && e.recu === 1 && e.retirees === 500 && e.liste === 'foodLog' && !PII.test(JSON.stringify(e))
      && zoneDe(c, 'foodLog').every(z => z.m === 'brutal' && typeof z.t === 'string'), court(JSON.stringify(e)));
    t('⭐ NSP1-04 · … et tracé dans le journal du serveur, sans adresse ni aliment',
      X.journal.some(l => /\[FT GARDE-FOU foodLog\]/.test(l) && /BRUTAL/.test(l)) && X.journal.every(l => !PII.test(l)),
      court(X.journal.filter(l => /GARDE-FOU|example|fictif/.test(l)).join(' | '), 240));
    t('NSP1-05 · … la zone n\'est PAS dans le profil (ni `loadProfile` ni les routes A1 ne la lisent) : elle est à la racine du compte',
      !('recupNut' in (c.profile || {})) && !!c.recupNut);
    // L'appareil principal (tous les repas + 1 nouveau) se resynchronise : le journal actif redevient complet.
    const principal = copie(avant).concat([ligne(9001, { tag: 'p' })]);
    X.envoi(ALICE, { foodLog: principal }); const c2 = X.lireCompte(ALICE);
    t('NSP1-06 · … quand l\'appareil principal se resynchronise, le journal actif redevient complet (501) et la ligne de l\'appareil remis à zéro est gardée en zone',
      memes(listeDe(c2, 'foodLog'), principal) && perdues([neuf], c2, 'foodLog') === 0 && perdues(avant, c2, 'foodLog') === 0,
      'journal=' + (listeDe(c2, 'foodLog') || []).length + ' zone=' + zoneDe(c2, 'foodLog').length);
  }

  // ── 2 · 40 lignes recevant 30 (sous le seuil « brutal ») ──
  {
    const X = serveur(); const avant = J(40, { tag: 'b' });
    X.compte(BOB, { foodLog: copie(avant) });
    X.envoi(BOB, { foodLog: copie(avant.slice(0, 30)) }); const c = X.lireCompte(BOB);
    const e = evts(c).slice(-1)[0] || {};
    t('⭐⭐ NSP1-07 · 40 → 30 : les 10 lignes absentes de l\'envoi sont gardées (avant : perdues sans trace)',
      perdues(avant, c, 'foodLog') === 0 && zoneDe(c, 'foodLog').length === 10, 'perdues=' + perdues(avant, c, 'foodLog') + ' zone=' + zoneDe(c, 'foodLog').length);
    t('⭐ NSP1-08 · … signalées « retirée » (30/40 = 75 % gardées : sous le seuil des séances, PAS « brutal ») — le seuil seul ne les aurait pas vues',
      e.brutal === false && e.retirees === 10 && zoneDe(c, 'foodLog').every(z => z.m === 'retiree'), court(JSON.stringify(e)));
    t('NSP1-09 · … et le journal actif = l\'envoi (30)', memes(listeDe(c, 'foodLog'), avant.slice(0, 30)));
    // Envoi répété, à l'identique : ni doublon au journal, ni recopie dans la zone, ni nouvel événement.
    X.envoi(BOB, { foodLog: copie(avant.slice(0, 30)) }); X.envoi(BOB, { foodLog: copie(avant.slice(0, 30)) });
    const c2 = X.lireCompte(BOB);
    t('⭐ NSP1-10 · envoi RÉPÉTÉ (×3) : aucun doublon — journal 30, zone 10, un seul événement',
      memes(listeDe(c2, 'foodLog'), avant.slice(0, 30)) && zoneDe(c2, 'foodLog').length === 10 && evts(c2).length === 1,
      'journal=' + (listeDe(c2, 'foodLog') || []).length + ' zone=' + zoneDe(c2, 'foodLog').length + ' evts=' + evts(c2).length);
  }

  // ── 3 · Deux appareils, historiques différents (le dernier qui écrit gagne, rien ne se perd) ──
  {
    const X = serveur(); const commun = J(100, { tag: 'c' }), seulA = J(20, { tag: 'A' }), seulB = J(10, { tag: 'B' });
    const appA = commun.concat(seulA), appB = commun.concat(seulB);
    X.compte(CAROL, { foodLog: copie(appA) });
    X.envoi(CAROL, { foodLog: copie(appB) }); const c1 = X.lireCompte(CAROL);
    const nouvA = ligne(5000, { tag: 'A' });
    X.envoi(CAROL, { foodLog: copie(appA).concat([nouvA]) }); const c2 = X.lireCompte(CAROL);
    const tout = commun.concat(seulA, seulB, [nouvA]);
    t('⭐⭐ NSP1-11 · deux appareils aux historiques différents qui s\'écrasent tour à tour : AUCUNE ligne des deux n\'est perdue',
      perdues(appA, c1, 'foodLog') === 0 && perdues(tout, c2, 'foodLog') === 0,
      'après B : perdues=' + perdues(appA, c1, 'foodLog') + ' · après A : perdues=' + perdues(tout, c2, 'foodLog'));
    t('NSP1-12 · … le journal actif est celui du dernier appareil (aucune fusion d\'office) : 121 lignes de A',
      memes(listeDe(c2, 'foodLog'), appA.concat([nouvA])), 'journal=' + (listeDe(c2, 'foodLog') || []).length);
  }

  // ── 4 · iPhone (application) et Safari : deux stockages distincts, même compte ──
  {
    const X = serveur(); const iphone = J(300, { tag: 'i' });
    X.compte(DAVE, { foodLog: copie(iphone) });
    // Safari : une vieille copie d'UN repas (avant sa correction sur l'iPhone) + un repas saisi dans Safari.
    const vieux = Object.assign(copie(iphone[3]), { kcal: 1, q: 10 }), safari = ligne(7000, { tag: 's' });
    X.envoi(DAVE, { foodLog: [vieux, safari] }); const c1 = X.lireCompte(DAVE);
    const e1 = evts(c1).slice(-1)[0] || {};
    t('⭐⭐ NSP1-13 · Safari (2 lignes) écrase l\'iPhone (300) : les 300 sont gardées, dont la version CORRIGÉE du repas modifié',
      perdues(iphone, c1, 'foodLog') === 0 && e1.brutal === true && e1.retirees === 299 && e1.modifiees === 1,
      'perdues=' + perdues(iphone, c1, 'foodLog') + ' ' + court(JSON.stringify(e1)));
    const nouvI = ligne(7001, { tag: 'i2' });
    X.envoi(DAVE, { foodLog: copie(iphone).concat([nouvI]) }); const c2 = X.lireCompte(DAVE);
    t('⭐ NSP1-14 · … l\'iPhone se resynchronise : journal actif complet (301), et le repas saisi dans Safari reste récupérable',
      memes(listeDe(c2, 'foodLog'), iphone.concat([nouvI])) && perdues([safari, vieux], c2, 'foodLog') === 0 && perdues(iphone, c2, 'foodLog') === 0,
      'journal=' + (listeDe(c2, 'foodLog') || []).length + ' zone=' + zoneDe(c2, 'foodLog').length);
  }

  // ── 5 · Ajout d'une nouvelle entrée depuis un appareil en retard ──
  {
    const X = serveur(); const serv = J(60, { tag: 'r' }), neuf = ligne(8000, { tag: 'r2' });
    X.compte(ALICE, { foodLog: copie(serv) });
    const retard = copie(serv.slice(0, 50)).concat([neuf]);
    X.envoi(ALICE, { foodLog: retard }); const c = X.lireCompte(ALICE);
    t('NSP1-15 · appareil en retard qui AJOUTE un repas : le vrai ajout est bien au journal actif',
      (listeDe(c, 'foodLog') || []).some(l => memes(l, neuf)), 'journal=' + (listeDe(c, 'foodLog') || []).length);
    t('⭐⭐ NSP1-16 · … et les 10 repas plus récents qu\'il n\'avait pas encore sont gardés (avant : écrasés)',
      perdues(serv, c, 'foodLog') === 0 && zoneDe(c, 'foodLog').length === 10, 'perdues=' + perdues(serv, c, 'foodLog'));
  }

  // ── 6 · Modification légitime d'un repas existant ──
  {
    const X = serveur(); const avant = J(20, { tag: 'm' });
    X.compte(BOB, { foodLog: copie(avant) });
    const apres = copie(avant); apres[5] = Object.assign(apres[5], { kcal: 999, q: 250, modifie: true });
    X.envoi(BOB, { foodLog: apres }); const c = X.lireCompte(BOB);
    t('NSP1-17 · modification légitime : la version corrigée est au journal actif (même identifiant)', memes(listeDe(c, 'foodLog'), apres));
    t('⭐ NSP1-18 · … et l\'ANCIENNE version est gardée (« modifiée »), rien d\'autre ne bouge',
      zoneDe(c, 'foodLog').length === 1 && zoneDe(c, 'foodLog')[0].m === 'modifiee' && memes(zoneDe(c, 'foodLog')[0].l, avant[5])
      && (evts(c).slice(-1)[0] || {}).retirees === 0, court(JSON.stringify(zoneDe(c, 'foodLog').map(z => z.m))));
  }

  // ── 7 · Suppression volontaire d'une entrée · suppression importante · suppression de la dernière ──
  {
    const X = serveur(); const avant = J(20, { tag: 'd' });
    X.compte(CAROL, { foodLog: copie(avant) });
    const sans7 = copie(avant.filter((_, i) => i !== 7));
    X.envoi(CAROL, { foodLog: sans7 }); const c = X.lireCompte(CAROL);
    t('NSP1-19 · suppression volontaire d\'UNE entrée : elle disparaît du journal actif — la suppression est RESPECTÉE, jamais réintroduite',
      memes(listeDe(c, 'foodLog'), sans7) && !(listeDe(c, 'foodLog') || []).some(l => memes(l, avant[7])));
    t('⭐ NSP1-20 · … mais reste récupérable (zone, « retirée ») tant que la borne le permet',
      zoneDe(c, 'foodLog').length === 1 && memes(zoneDe(c, 'foodLog')[0].l, avant[7]) && zoneDe(c, 'foodLog')[0].m === 'retiree');
    X.envoi(CAROL, { foodLog: copie(sans7) }); const c2 = X.lireCompte(CAROL);
    t('NSP1-21 · … renvoyer la même liste ne la fait pas revenir', memes(listeDe(c2, 'foodLog'), sans7) && zoneDe(c2, 'foodLog').length === 1);
  }
  {
    const X = serveur(); const avant = J(100, { tag: 'g' });
    X.compte(DAVE, { foodLog: copie(avant) });
    const moitie = copie(avant.slice(50));
    X.envoi(DAVE, { foodLog: moitie }); const c = X.lireCompte(DAVE); const e = evts(c).slice(-1)[0] || {};
    t('NSP1-22 · suppression importante et VOULUE (100 → 50) : appliquée au journal actif (rien n\'est bloqué)', memes(listeDe(c, 'foodLog'), moitie));
    t('⭐ NSP1-23 · … les 50 sont gardées et l\'écart est marqué « brutal » (50 % < 60 %) : signalé, pas refusé (décision ouverte)',
      perdues(avant, c, 'foodLog') === 0 && e.brutal === true && e.retirees === 50, court(JSON.stringify(e)));
  }
  {
    const X = serveur(); const seule = J(1, { tag: 'u' });
    X.compte(ALICE, { foodLog: copie(seule) });
    const r = X.envoi(ALICE, { foodLog: [] }); const c = X.lireCompte(ALICE);
    t('NSP1-24 · suppression de la DERNIÈRE entrée (envoi vide) : la règle existante « le vide ne gagne jamais » tient — rien n\'est écrit',
      r.j.status === 'ok' && memes(listeDe(c, 'foodLog'), seule) && !c.recupNut,
      '⚠️ limite connue : cette suppression n\'atteint pas le serveur (indiscernable d\'un appareil neuf) — journal=' + (listeDe(c, 'foodLog') || []).length);
  }

  // ── 8 · Favoris 20 → 1 ──
  {
    const X = serveur(); const avant = F(20);
    X.compte(BOB, { foodLog: J(5, { tag: 'f' }), savedFoods: copie(avant) });
    X.envoi(BOB, { savedFoods: [copie(avant[4])] }); const c = X.lireCompte(BOB); const e = evts(c).slice(-1)[0] || {};
    t('⭐⭐ NSP1-25 · favoris 20 → 1 : les 19 retirés sont gardés (avant : perdus) et le journal n\'est pas touché',
      perdues(avant, c, 'savedFoods') === 0 && zoneDe(c, 'savedFoods').length === 19 && memes(listeDe(c, 'savedFoods'), [avant[4]])
      && (listeDe(c, 'foodLog') || []).length === 5 && zoneDe(c, 'foodLog').length === 0,
      'perdus=' + perdues(avant, c, 'savedFoods') + ' zone=' + zoneDe(c, 'savedFoods').length);
    t('NSP1-26 · … événement « savedFoods » (20 → 1) — sous 30 favoris, il n\'est pas « brutal » : le seuil ne voit pas tout, la copie si',
      e.liste === 'savedFoods' && e.avant === 20 && e.recu === 1 && e.brutal === false, court(JSON.stringify(e)));
  }

  // ── 9 · Identifiants absents, instables, identiques par erreur ──
  {
    // Lignes historiques SANS identifiant : l'app leur en pose un au chargement → le même repas revient avec un id neuf.
    const X = serveur(); const anciennes = J(30, { tag: 'h' }).map(l => { const c = copie(l); delete c.id; return c; });
    X.compte(CAROL, { foodLog: copie(anciennes) });
    const avecIds = copie(anciennes).map(l => Object.assign({ id: crypto.randomUUID() }, l));
    X.envoi(CAROL, { foodLog: avecIds }); const c = X.lireCompte(CAROL);
    t('⭐ NSP1-27 · identifiants ABSENTS au serveur, posés par l\'app : reconnus par le contenu — aucune fausse alerte, aucune copie',
      memes(listeDe(c, 'foodLog'), avecIds) && !c.recupNut, 'zone=' + zoneDe(c, 'foodLog').length);
    // Identifiants INSTABLES : un 2e appareil a posé SES propres ids sur les mêmes repas.
    const autres = copie(anciennes).map(l => Object.assign({ id: crypto.randomUUID() }, l));
    X.envoi(CAROL, { foodLog: autres }); const c2 = X.lireCompte(CAROL);
    t('⭐ NSP1-28 · identifiants INSTABLES (même repas, autre id sur un autre appareil) : pas pris pour une suppression',
      memes(listeDe(c2, 'foodLog'), autres) && !c2.recupNut, 'zone=' + zoneDe(c2, 'foodLog').length);
  }
  {
    // Même identifiant sur DEUX repas différents (par erreur) — l'ordre de l'envoi ne doit rien changer.
    const X = serveur(); const A1 = ligne(1, { tag: 'k' }), B1 = Object.assign(ligne(2, { tag: 'k' }), { id: A1.id });
    X.compte(DAVE, { foodLog: [copie(A1), copie(B1)] });
    X.envoi(DAVE, { foodLog: [copie(B1), copie(A1)] }); const c = X.lireCompte(DAVE);
    t('⭐ NSP1-29 · identifiant en DOUBLE par erreur, envoi dans l\'autre ordre : chaque repas retrouve sa copie identique — rien n\'est pris pour une modification',
      !c.recupNut, court(JSON.stringify(evts(c))));
    X.envoi(DAVE, { foodLog: [copie(A1)] }); const c2 = X.lireCompte(DAVE);
    t('⭐ NSP1-30 · … puis l\'un des deux est retiré : un identifiant en double ne couvre QU\'UNE ligne, l\'autre est gardée',
      perdues([A1, B1], c2, 'foodLog') === 0 && zoneDe(c2, 'foodLog').length === 1 && memes(zoneDe(c2, 'foodLog')[0].l, B1));
    // L'app réattribue un id neuf au doublon (`_foodLogIdentifier`) : ce n'est ni une suppression, ni une modification.
    const X2 = serveur(); X2.compte(DAVE, { foodLog: [copie(A1), copie(B1)] });
    X2.envoi(DAVE, { foodLog: [copie(A1), Object.assign(copie(B1), { id: crypto.randomUUID() })] });
    t('NSP1-31 · … et quand l\'app réattribue un id neuf au doublon : reconnu par le contenu, aucune copie', !X2.lireCompte(DAVE).recupNut);
  }
  {
    // Deux repas IDENTIQUES sans identifiant (deux yaourts) retirés ensemble : DEUX copies, pas une.
    const X = serveur(); const y = copie(ligne(3, { tag: 'y' })); delete y.id; const autre = ligne(4, { tag: 'y' });
    X.compte(ALICE, { foodLog: [copie(y), copie(y), copie(autre)] });
    X.envoi(ALICE, { foodLog: [copie(autre)] }); const c = X.lireCompte(ALICE);
    t('⭐ NSP1-32 · deux repas IDENTIQUES sans identifiant retirés ensemble : les DEUX sont gardés (multi-ensemble, pas d\'ensemble)',
      perdues([y, y, autre], c, 'foodLog') === 0 && zoneDe(c, 'foodLog').length === 2, 'zone=' + zoneDe(c, 'foodLog').length);
  }

  // ── 10 · Données incomplètes ou invalides ──
  {
    const avant = J(40, { tag: 'v' }), favs = F(6);
    const cas = [['une chaîne', 'texte'], ['un objet', {}], ['null', null], ['un nombre', 42], ['un booléen', true]];
    const res = cas.map(([nom, val]) => {
      const X = serveur(); X.compte(BOB, { foodLog: copie(avant), savedFoods: copie(favs) });
      const r = X.envoi(BOB, { foodLog: val, savedFoods: val }); const c = X.lireCompte(BOB);
      return { nom, ok: r.j.status === 'ok' && memes(listeDe(c, 'foodLog'), avant) && memes(listeDe(c, 'savedFoods'), favs) };
    });
    t('⭐⭐ NSP1-33 · envoi ILLISIBLE (chaîne, objet, null, nombre, booléen) à la place d\'une liste : journal et favoris conservés intacts',
      res.every(x => x.ok), res.filter(x => !x.ok).map(x => x.nom).join(', '));
    const X = serveur(); X.compte(BOB, { foodLog: copie(avant) });
    const melange = [null, 5, 'x', {}, { date: '2026-09-01' }, copie(avant[0])];
    const r = X.envoi(BOB, { foodLog: melange }); const c = X.lireCompte(BOB);
    t('⭐ NSP1-34 · liste aux éléments incomplets ou invalides : pas de plantage, l\'envoi est appliqué tel quel et les 39 autres lignes sont gardées',
      r.j.status === 'ok' && memes(listeDe(c, 'foodLog'), melange) && perdues(avant, c, 'foodLog') === 0, court(r.t));
    const X3 = serveur(); X3.compte(BOB, { foodLog: copie(avant) }); const brut0 = X3.brut(BOB);
    const r3 = X3.post('{"action":"saveProfile","email":"' + BOB + '","foodLog":[{"id":"tronqu');
    t('NSP1-35 · corps TRONQUÉ (JSON illisible) : refusé, le compte n\'est pas touché d\'un octet', r3.j.status === 'error' && X3.brut(BOB) === brut0, court(r3.t, 80));
  }

  // ── 11 · Aucune donnée d'un compte ne peut être associée à un autre compte ──
  {
    const X = serveur(); const jA = J(40, { tag: 'iso' }), jB = J(35, { tag: 'isoB' });
    X.compte(ALICE, { foodLog: copie(jA) }); X.compte(BOB, { foodLog: copie(jB) });
    const tokA = X.ctx._jetonPoser_(ALICE, 'tel'); const brutB = X.brut(BOB);
    const r = X.post({ action: 'saveProfile', email: BOB, token: tokA, foodLog: copie(jA.slice(0, 10)) });
    const cA = X.lireCompte(ALICE), cB = X.lireCompte(BOB);
    t('⭐⭐ NSP1-36 · jeton de A + adresse de B : c\'est A qui est écrit (journal ET zone), le compte de B n\'est pas touché d\'un octet',
      r.j.status === 'ok' && memes(listeDe(cA, 'foodLog'), jA.slice(0, 10)) && perdues(jA, cA, 'foodLog') === 0 && X.brut(BOB) === brutB && !cB.recupNut,
      'A journal=' + (listeDe(cA, 'foodLog') || []).length + ' zoneA=' + zoneDe(cA, 'foodLog').length);
    t('NSP1-37 · … la zone de A ne contient QUE des repas de A', lignesZone(cA, 'foodLog').every(l => /repas-fictif-iso\d/.test(l.name)));
    const X2 = serveur(); X2.compte(CAROL, { foodLog: copie(jB), code: 'carol-code' }); const brutC = X2.brut(CAROL);
    const r2 = X2.envoi(CAROL, { foodLog: [], authCode: 'faux' });
    const r2b = X2.envoi(CAROL, { foodLog: copie(jB.slice(0, 2)), authCode: 'faux' });
    const r2c = X2.post({ action: 'saveProfile', email: CAROL, token: 'faux-' + hex(20), foodLog: copie(jB.slice(0, 2)) });
    t('⭐ NSP1-38 · écriture REFUSÉE (mauvais code perso, jeton invalide) : rien n\'est écrit, ni journal ni zone',
      r2.j.error === 'auth' && r2b.j.error === 'auth' && r2c.j.error === 'token' && X2.brut(CAROL) === brutC, court(r2b.t + ' ' + r2c.t));
    const clesU = Object.keys(X.props).filter(k => /^(u_|h_)/.test(k)).sort();
    t('NSP1-39 · la zone vit DANS le compte (aucune nouvelle clé de stockage partagée créée)', canon(clesU) === canon(['u_' + ALICE, 'u_' + BOB]), clesU.join(','));
  }

  // ── 12 · La zone n'apparaît JAMAIS dans les réponses normales de l'application ──
  {
    const X = serveur(); const avant = J(40, { tag: 'exp' }), favs = F(8);
    X.compte(CAROL, { foodLog: copie(avant), savedFoods: copie(favs), code: 'carol-code' });
    X.envoi(CAROL, { foodLog: copie(avant.slice(0, 5)), savedFoods: [copie(favs[0])], authCode: 'carol-code' });
    const c = X.lireCompte(CAROL);
    const lp = X.post({ action: 'loadProfile', email: CAROL, authCode: 'carol-code' });
    const lg = X.get({ action: 'loadProfile', email: CAROL, authCode: 'carol-code' });
    const absent = r => r.j.status === 'ok' && !/recupNut/.test(r.t) && !/repas-fictif-exp(1[0-9]|[5-9]|[23][0-9])\b/.test(r.t) && !/fav-fictif-[1-7]\b/.test(r.t)
      && Array.isArray(r.j.profile && r.j.profile.foodLog) && r.j.profile.foodLog.length === 5;
    t('⭐ NSP1-40 · une zone existe (35 repas + 7 favoris gardés)…', zoneDe(c, 'foodLog').length === 35 && zoneDe(c, 'savedFoods').length === 7);
    t('⭐⭐ NSP1-41 · … et `loadProfile` (POST et GET, restauration de l\'app) ne la renvoie PAS : ni la clé, ni un seul repas ou favori écarté',
      absent(lp) && absent(lg), court(lp.t.replace(/"foodLog":\[.*?\]\]?/, '…'), 160));
    const sv = X.envoi(CAROL, { foodLog: copie(avant.slice(0, 4)), authCode: 'carol-code' });
    t('NSP1-42 · la réponse de `saveProfile` reste { status: ok } — rien de la zone ne revient à l\'appareil', sv.t === '{"status":"ok"}', court(sv.t));
  }

  // ── 13 · Routes A1 inchangées : elles ne lisent que le journal actif ──
  {
    const X = serveur(); const avant = J(40, { tag: 'a1' });
    X.compte(ALICE, { foodLog: copie(avant) }); X.compte(BOB, { foodLog: J(12, { tag: 'a1b' }) });
    X.envoi(ALICE, { foodLog: copie(avant.slice(0, 25)) });
    const inv = X.post({ action: 'nutInventory', token: TOK_IDEES });
    t('NSP1-43 · nutInventory compte le journal ACTIF seulement (25 + 12 = 37) : la zone n\'est pas comptée comme des repas',
      inv.j.status === 'ok' && inv.j.entreesTotal === 37, court(inv.t, 160));
    X.ctx.backupAllUserData_();
    const sauvee = X.fichiers.slice(-1)[0]; let s = null; try { s = JSON.parse(sauvee.content); } catch (e) { /* illisible */ }
    const uA = s && (s.users || []).find(u => u.email === ALICE);
    t('⭐ NSP1-44 · la sauvegarde nocturne emporte la zone avec le compte (rien à ajouter : elle recopie le compte entier)',
      !!(uA && uA.data && uA.data.recupNut && (uA.data.recupNut.foodLog || []).length === 15), 'zone sauvée=' + (uA && uA.data && uA.data.recupNut ? (uA.data.recupNut.foodLog || []).length : 'absente'));
    // La même sauvegarde SANS la zone : l'audit A1 doit rendre exactement les mêmes compteurs.
    const sansZone = copie(s); (sansZone.users || []).forEach(u => { if (u.data) delete u.data.recupNut; });
    const audit = fichiersDrive => {
      const Y = serveur({ fichiers: fichiersDrive }); Y.compte(ALICE, { foodLog: copie(avant.slice(0, 25)) }); Y.compte(BOB, { foodLog: J(12, { tag: 'a1b' }) });
      const r = Y.post({ action: 'nutBackupAudit', token: TOK_IDEES });
      return r.j.status === 'ok' ? { cmp: r.j.comparaison, f: (r.j.fichiers || []).map(f => [f.lisible, f.comptes, f.avecFoodLog, f.entrees]) } : null;
    };
    const avecZ = audit([{ name: 'backup-2026-10-23.json', updated: Date.now(), content: JSON.stringify(s) }]);
    const sansZ = audit([{ name: 'backup-2026-10-23.json', updated: Date.now(), content: JSON.stringify(sansZone) }]);
    t('NSP1-45 · l\'audit A1 des sauvegardes rend les MÊMES compteurs avec ou sans la zone dans le fichier',
      !!avecZ && !!sansZ && canon(avecZ) === canon(sansZ), court(JSON.stringify(avecZ && avecZ.cmp)));
  }

  // ── 14 · Écriture atomique : le journal et la zone partent dans la MÊME écriture ──
  {
    const panneU = { on: false };
    const X = serveur({ panne: k => panneU.on && k.indexOf('u_') === 0 }); const avant = J(40, { tag: 'at' });
    X.compte(DAVE, { foodLog: copie(avant) }); const brut0 = X.brut(DAVE);
    panneU.on = true; const r = X.envoi(DAVE, { foodLog: copie(avant.slice(0, 3)) }); panneU.on = false;
    t('NSP1-46 · l\'écriture du compte échoue (stockage plein, panne) : ni le journal ni la zone ne sont à moitié écrits',
      r.j.status === 'error' && X.brut(DAVE) === brut0, court(r.t, 120));
    X.ecritures.length = 0; X.envoi(DAVE, { foodLog: copie(avant.slice(0, 3)) });
    // TOUTES les écritures de la sauvegarde : le compte (u_) et le compteur de transition déjà existant (mig_stats), rien d'autre.
    const ecr = X.ecritures.filter(k => k !== 'mig_stats');
    t('NSP1-47 · une écriture réussie touche UNE seule clé, celle du compte (u_) : journal et zone ensemble, aucun ordre où une ligne quitte le journal sans être déjà gardée',
      ecr.join(',') === 'u_' + DAVE && perdues(avant, X.lireCompte(DAVE), 'foodLog') === 0, X.ecritures.join(','));
  }

  // ── 14 bis · Deux envois SIMULTANÉS (aucun verrou dans Code.js — défaut préexistant, non corrigé par P1) ──
  {
    const X = serveur(); const avant = J(40, { tag: 'cc' }), n1 = ligne(600, { tag: 'cc1' }), n2 = ligne(601, { tag: 'cc2' });
    X.compte(ALICE, { foodLog: copie(avant) }); const lu = X.brut(ALICE);
    X.envoi(ALICE, { foodLog: copie(avant.slice(0, 30)).concat([n1]) });     // appareil 1 : retire 10, ajoute n1
    X.props['u_' + ALICE] = lu;                                                // appareil 2 avait lu AVANT l'écriture de 1…
    X.envoi(ALICE, { foodLog: copie(avant.slice(5)).concat([n2]) });          // … et écrit APRÈS : il gagne
    const c = X.lireCompte(ALICE);
    t('NSP1-54 · deux envois simultanés : aucune ligne DÉJÀ au serveur n\'est perdue (le calcul du second les garde)',
      perdues(avant, c, 'foodLog') === 0, 'perdues=' + perdues(avant, c, 'foodLog'));
    t('NSP1-55 · … limite DITE, pas corrigée : le repas AJOUTÉ par le premier manque au serveur (il reste sur son appareil et remonte à sa prochaine synchro)',
      perdues([n1], c, 'foodLog') === 1 && perdues([n2], c, 'foodLog') === 0, 'n1 absent=' + perdues([n1], c, 'foodLog'));
  }

  // ── 15 · Zone BORNÉE : au-delà, les copies les plus anciennes partent — et c'est COMPTÉ ──
  {
    const X = serveur(); const gros = J(700, { tag: 'z' });
    X.compte(ALICE, { foodLog: copie(gros) });
    X.envoi(ALICE, { foodLog: [ligne(1, { tag: 'zz' })] }); const c = X.lireCompte(ALICE); const e = evts(c).slice(-1)[0] || {};
    const taille = zoneDe(c, 'foodLog').reduce((a, z) => a + JSON.stringify(z).length, 0), coupees = (c.recupNut || {}).coupees || 0;
    const derniers = gros.slice(-100);
    t('⭐ NSP1-48 · 700 lignes écrasées d\'un coup : la zone reste sous sa borne (200 000 caractères) et ce qui n\'y tient pas est COMPTÉ',
      taille <= 200000 && coupees > 0 && e.coupees === coupees && zoneDe(c, 'foodLog').length + coupees === 700,
      'zone=' + zoneDe(c, 'foodLog').length + ' coupées=' + coupees + ' taille=' + taille);
    t('NSP1-49 · … ce sont les plus ANCIENNES qui partent : les 100 repas les plus récents (absents de la sauvegarde de la nuit) sont tous gardés',
      perdues(derniers, c, 'foodLog') === 0, 'perdues parmi les 100 derniers=' + perdues(derniers, c, 'foodLog'));
    // Les 200 favoris que l'app envoie au plus, écrasés par 1 : la borne des favoris doit tous les tenir.
    const Xf = serveur(); const f200 = F(200).map((f, i) => Object.assign(f, { portionLabel: 'portion-' + i, portionWeightG: 125 }));
    Xf.compte(DAVE, { savedFoods: copie(f200) }); Xf.envoi(DAVE, { savedFoods: [fav(9999)] }); const cf = Xf.lireCompte(DAVE);
    t('NSP1-53 · les 200 favoris que l\'app envoie au plus, écrasés par 1 : tous gardés, rien de coupé (borne des favoris suffisante)',
      perdues(f200, cf, 'savedFoods') === 0 && !((cf.recupNut || {}).coupees), 'zone=' + zoneDe(cf, 'savedFoods').length + ' coupées=' + ((cf.recupNut || {}).coupees || 0));
    // Deux appareils qui ont chacun UN repas que l'autre n'a pas, et qui se resynchronisent 60 fois tour à tour.
    const X2 = serveur(); const base = J(10, { tag: 'ev' }), x1 = ligne(1, { tag: 'ev1' }), x2 = ligne(2, { tag: 'ev2' });
    X2.compte(BOB, { foodLog: copie(base) });
    for (let k = 0; k < 60; k++) X2.envoi(BOB, { foodLog: copie(base).concat([k % 2 ? x2 : x1]) });
    const c2 = X2.lireCompte(BOB);
    t('NSP1-50 · 60 allers-retours entre deux appareils : la liste des événements reste bornée (50) et chaque repas disputé n\'est copié qu\'UNE fois',
      evts(c2).length === 50 && zoneDe(c2, 'foodLog').length === 2 && perdues([x1, x2], c2, 'foodLog') === 0,
      'evts=' + evts(c2).length + ' zone=' + zoneDe(c2, 'foodLog').length);
    // Ce que coûte une zone pleine dans le stockage RÉEL du serveur (compressé par le vrai _packUser_).
    const X3 = serveur(); const j500 = J(500, { tag: 'w' }).map(l => Object.assign(l, { id: crypto.randomUUID() }));
    X3.compte(DAVE, { foodLog: copie(j500) }); const t0b = (X3.brut(DAVE) || '').length;
    X3.envoi(DAVE, { foodLog: [ligne(1, { tag: 'w2' })] }); const t1b = (X3.brut(DAVE) || '').length;
    X3.envoi(DAVE, { foodLog: copie(j500) }); const t2b = (X3.brut(DAVE) || '').length;
    console.log('   ℹ️  MESURE (vraie compression) — compte de 500 repas : ' + t0b + ' octets stockés · après écrasement (1 repas + zone de 500) : '
      + t1b + ' · journal rétabli + zone : ' + t2b + ' (plafond de TOUT le stockage : 512 000)');
    t('NSP1-51 · coût mesuré d\'une zone pleine : moins de 40 000 octets compressés par compte (journal de 500 repas rétabli + zone)',
      String(X3.brut(DAVE)).slice(0, 3) === 'GZ:' && t2b - t0b < 40000, 'surcoût=' + (t2b - t0b) + ' octets');
    // Le temps du garde-fou sur le plus gros journal que l'app envoie (8 000 lignes) : rien n'a changé · une ligne retirée.
    const X4 = serveur(); const j8k = J(8000, { tag: 'p' }); X4.compte(ALICE, { foodLog: copie(j8k) });
    let d0 = Date.now(); X4.envoi(ALICE, { foodLog: copie(j8k) }); const dSame = Date.now() - d0;
    d0 = Date.now(); X4.envoi(ALICE, { foodLog: copie(j8k.slice(1)) }); const dUne = Date.now() - d0;
    console.log('   ℹ️  MESURE (Node, saveProfile complet) — journal de 8 000 lignes : envoi inchangé ' + dSame + ' ms · une ligne retirée ' + dUne + ' ms');
    t('NSP1-52 · le plus gros journal envoyé (8 000 lignes) passe le garde-fou sans copie inutile, en un temps raisonnable (< 5 s ici)',
      dSame < 5000 && dUne < 5000 && zoneDe(X4.lireCompte(ALICE), 'foodLog').length === 1, dSame + ' / ' + dUne + ' ms');
  }
}

module.exports.serveurTests = serveurTests;
/** Point d'entrée de la passe (tests/parcours/runner.js, bloc des sources) : synchrone, aucun navigateur — 100 % serveur. */
module.exports.source = function (t0) { serveurTests(t0); };
