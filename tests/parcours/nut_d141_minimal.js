'use strict';
const fs = require('fs'), vm = require('vm'), crypto = require('crypto'), zlib = require('zlib'), path = require('path');
const RACINE = path.join(__dirname, '..', '..');

const FONDATEUR = 'fondateur@example.test', ALICE = 'alice@example.test', BOB = 'bob@example.test',
      CAROL = 'carol@example.test', DAVE = 'dave@example.test', EVE = 'eve@example.test';
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
  let horloge = Date.now();                                 // dates de création STRICTEMENT croissantes (tri par date sans ex æquo)
  const fichier = f => ({ getName: () => f.name, getLastUpdated: () => new Date(f.updated), getDateCreated: () => new Date(f.updated),
    getSize: () => Buffer.byteLength(f.content), getBlob: () => blob(f.content), getId: () => 'f_' + f.name });
  /* Un dossier Drive en mémoire : `X.fichiers` garde TOUS les fichiers (champ `dir` = sous-dossier, '' = le dossier des
     sauvegardes lui-même) ; `getFiles()` ne rend, comme Drive, que les fichiers DIRECTEMENT dans le dossier. */
  const sousDossiers = Object.create(null);
  const faireDossier = (dir, nomD) => ({
    getId: () => 'dossier_ft' + (dir ? '_' + dir : ''), getName: () => nomD,
    getFiles: () => iter(fichiers.filter(x => (x.dir || '') === dir).map(fichier)),
    getFilesByName: nm => iter(fichiers.filter(x => (x.dir || '') === dir && x.name === nm).map(fichier)),
    getFoldersByName: nm => iter(dir || !sousDossiers[nm] ? [] : [sousDossiers[nm]]),
    createFolder: nm => { if (dir) throw new Error('sous-sous-dossier non doublé'); return (sousDossiers[nm] = faireDossier(String(nm), String(nm))); },
    createFile: (nom, contenu) => {
      // Le message d'erreur porte une adresse (inventée) : le journal du serveur doit la MASQUER, pas la recopier.
      if (o.drivePanne && o.drivePanne(String(nom))) throw new Error('Drive indisponible (panne simulée) pour proprietaire-fictif@example.test');
      const f = { name: String(nom), dir, updated: ++horloge, content: String(contenu) }; fichiers.push(f);
      // Une relecture qui ne rend pas ce qui a été écrit (fichier tronqué, altéré) : la garde doit le voir.
      if (o.driveAltere && o.driveAltere(String(nom))) { const g = Object.assign({}, f, { content: f.content.slice(0, -2) }); return fichier(g); }
      return fichier(f);
    },
  });
  const dossier = faireDossier('', 'ForceTracker-Backups');
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
  vm.runInContext(o.code || CODE_SRC, ctx, { filename: 'Code.js' });
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

const alea = graine => { let x = graine >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; };
const copie = v => JSON.parse(JSON.stringify(v));
const canon = v => JSON.stringify((function tri(x) {
  if (Array.isArray(x)) return x.map(tri);
  if (x && typeof x === 'object') { const r = {}; Object.keys(x).sort().forEach(k => { r[k] = tri(x[k]); }); return r; }
  return x;
})(v));
/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
   🙈 D-141 MINIMAL (29/10/2026, GO TESTS de Michel) — la fusion SERVEUR des masquages Nutrition `hiddenFoods`.
   Bloc : B-ND141. Banc : tools/banc_nut_d141_minimal.js · contrôle négatif : tools/mut_nut_d141_minimal.py
   CONDUIT : le VRAI Code.js (vm Node) par ses vraies portes `doPost` (saveProfile, loadProfile, adminRestore) ; la fonction
     `handleAdminRestore_` est aussi appelée DIRECTEMENT pour observer l'objet reçu (immuabilité). La fusion pure
     `_nutMasquesFusion_` est appelée telle que livrée (jamais recopiée).
   SIMULÉ : les services Google (propriétés en mémoire, compression réelle, Drive en mémoire), l'horloge (`Date.now` figée).
     « Concurrence » = ENTRELACEMENT LU-LU-ÉCRIT-ÉCRIT reconstitué en capturant les écritures de `saveUserData_` : ce n'est PAS une
     exécution parallèle réelle d'Apps Script.
   COMPARE : le Code.js de master (`3d8d49ef`, avant D-141) pour attribuer l'origine d'un comportement ; le vrai
     `_nutMasquesNormaliser` du client (state.js), extrait et exécuté tel quel.
   NE COUVRE PAS : le vrai déploiement, les vraies Script Properties (plafond 512 Ko non simulé), le vrai Drive, l'iPhone,
     deux téléphones réels, le temps réel entre deux requêtes.
   ⛔ DONNÉES INVENTÉES : adresses example.test (RFC 2606), aliments fictifs. Aucun jeton réel.
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const NOW = 1800000000000, ADMIN = 'admin-fictif-' + hex(12);
const T = n => NOW - n * 1000;                       // « il y a n secondes »
const E = (k, tt) => ({ k, t: tt });
const memes2 = (a, b) => canon(a) === canon(b);
const prepa = src => src.replace(RE_HARD, "const PREMIUM_HARDCODED_ = ['" + FONDATEUR + "'];");
let BASE_SRC = null, BASE_ORIGINE = '';
try {
  if (process.env.D141_BASE_CODE) { BASE_SRC = prepa(fs.readFileSync(process.env.D141_BASE_CODE, 'utf8')); BASE_ORIGINE = 'fichier'; }
  else { BASE_SRC = prepa(require('child_process').execSync('git show 3d8d49ef:Code.js', { cwd: RACINE, maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] }).toString('utf8')); BASE_ORIGINE = 'git'; }
} catch (e) { BASE_SRC = null; }

function neuf(o) {
  const X = serveur(o);
  vm.runInContext('Date.now = function(){ return ' + NOW + '; }', X.ctx);
  X.props.ADMIN_TOKEN = ADMIN;
  X.props.LECTURE_STRICTE = 'off';   // soupape documentée de Code.js : sans elle, `loadProfile` exige un code de compte (ce banc ne teste pas l'authentification de lecture)
  return X;
}
const hidBrut = (X, email) => ((X.lireCompte(email) || {}).profile || {}).hiddenFoods;
/** Toujours un tableau (vide si le champ n'existe pas) : un témoin qui échoue doit ROUGIR, jamais planter. */
const hid = (X, email) => { const v = hidBrut(X, email); return Array.isArray(v) ? v : (v === undefined ? [] : [v]); };
/** Un compte tel qu'il existe au serveur : écrit par le vrai saveUserData_. */
function compteH(X, email, o) {
  o = o || {};
  const profile = Object.assign({ name: 'N-' + email.split('@')[0] }, o.profile || {});
  if (o.hidden !== undefined) profile.hiddenFoods = o.hidden;
  if (o.foodLog !== undefined) profile.foodLog = o.foodLog;
  if (o.savedFoods !== undefined) profile.savedFoods = o.savedFoods;
  X.ctx.saveUserData_(email, Object.assign({ email, profile, prs: {}, sessions: [] }, o.racine || {}));
}
const envoiH = (X, email, hidden, autres) => X.envoi(email, Object.assign(hidden === undefined ? {} : { hiddenFoods: hidden }, autres || {}));
const restaure = (X, email, data) => X.post({ action: 'adminRestore', adminToken: ADMIN, email, data });
const sansBruit = c => { const x = copie(c || {}); delete x.updatedAt; if (x.profile) delete x.profile.hiddenFoods; return x; };
const preuve = (titre, o) => console.log('   PREUVE ' + titre + ' :: ' + canon(o).slice(0, 700));

function serveurTests(t) {
  const P = neuf();                                  // un serveur pour les appels purs
  const fus = (a, b) => copie(P.ctx._nutMasquesFusion_(a, b));
  const key = i => 'nom:aliment-fictif-' + String(i).padStart(4, '0');
  t('B-ND141 ⓪ le VRAI Code.js est chargé : `_nutMasquesFusion_`, `NUT_MASQUES_MAX_` = 300, `handleAdminRestore_` existent', typeof P.ctx._nutMasquesFusion_ === 'function' && P.ctx.NUT_MASQUES_MAX_ === 300 && typeof P.ctx.handleAdminRestore_ === 'function' && N_HARD === 1, N_HARD + ' remplacement(s) premium');
  t('B-ND141 ⓪b le Code.js de COMPARAISON (master, avant D-141) est disponible, et il ne connaît pas `hiddenFoods`', BASE_SRC !== null && (BASE_SRC.match(/hiddenFoods/g) || []).length === 0, 'origine : ' + BASE_ORIGINE);

  /* ═══ S — LE MOTEUR DE FUSION (fonction pure réelle) ═══ */
  t('B-ND141 S01 première sauvegarde : une entrée valide est conservée', memes2(fus([], [E('nom:a', T(10))]), [E('nom:a', T(10))]));
  const EX = [E('nom:b', T(5)), E('nom:a', T(10))];
  t('B-ND141 S02 envoi absent (undefined) / null : rien ne se perd', memes2(fus(EX, undefined), EX) && memes2(fus(EX, null), EX));
  t('B-ND141 S03 envoi vide : les masquages existants valides restent', memes2(fus(EX, []), EX));
  t('B-ND141 S04 liste plus courte : trois existants, un reçu → les trois restent', memes2(fus([E('nom:a', T(10)), E('nom:b', T(8)), E('nom:c', T(6))], [E('nom:b', T(8))]), [E('nom:c', T(6)), E('nom:b', T(8)), E('nom:a', T(10))].sort((x, y) => y.t - x.t)));
  t('B-ND141 S05 même identité, dates différentes : la plus RÉCENTE gagne (dans les deux sens)', memes2(fus([E('nom:a', T(10))], [E('nom:a', T(3))]), [E('nom:a', T(3))]) && memes2(fus([E('nom:a', T(3))], [E('nom:a', T(10))]), [E('nom:a', T(3))]));
  { const A = [E('nom:a', T(10)), E('*', T(50)), E('nom:c', T(7))], B = [E('nom:b', T(9)), E('nom:a', T(2)), E('id:3000000000137', T(4))];
    t('B-ND141 S06 ordre inversé des deux listes : résultat identique', memes2(fus(A, B), fus(B, A)) && memes2(fus(A, B), fus(A.slice().reverse(), B.slice().reverse())));
    t('B-ND141 S07 idempotence (à horloge fixe) : refusionner le résultat ou la même liste ne change rien', memes2(fus(fus(A, B), B), fus(A, B)) && memes2(fus(fus(A, B), A), fus(A, B)) && memes2(fus(fus(A, B), []), fus(A, B))); }
  { const TIE = [E('nom:c', T(5)), E('nom:a', T(5)), E('nom:b', T(5)), E('id:z', T(5)), E('nom:d', T(9))], TIE2 = TIE.slice().reverse();
    t('B-ND141 S06b égalités de date : à date égale, l\'ordre est celui des CLÉS (donc indépendant de l\'ordre d\'arrivée)', memes2(fus(TIE, []), fus(TIE2, [])) && memes2(fus(TIE, []).map(x => x.k), ['id:z', 'nom:a', 'nom:b', 'nom:c', 'nom:d']), JSON.stringify(fus(TIE, []).map(x => x.k))); }
  const IDS = ['id:3000000000137', 'nom:3000000000137', 'id:ciqual:19000', 'nom:ciqual:19000'];
  t('B-ND141 S08 `id:` et `nom:` de même suite restent QUATRE entrées distinctes (aucune fusion par la forme)', memes2(fus(IDS.map((k, i) => E(k, T(10 + i))), []).map(x => x.k).sort(), IDS.slice().sort()) && fus(IDS.map((k, i) => E(k, T(10 + i))), []).length === 4);
  t('B-ND141 S09 `*` récent : conservé en tête ; les masquages antérieurs OU ÉGAUX à sa date tombent, le postérieur reste (S10)',
    memes2(fus([E('nom:a', T(10)), E('nom:b', T(2)), E('nom:egal', T(5))], [E('*', T(5))]), [E('*', T(5)), E('nom:b', T(2))]));
  t('B-ND141 S09b deux `*` : le plus récent prévaut', memes2(fus([E('*', T(20))], [E('*', T(5))]), [E('*', T(5))]) && memes2(fus([E('*', T(5))], [E('*', T(20))]), [E('*', T(5))]));
  const N = n => Array.from({ length: n }, (_, i) => E(key(i), T(1000 + i)));      // distinct : i=0 le plus RÉCENT, i grand le plus ancien
  { const r299 = fus([], N(299)), r300 = fus([], N(300)), r301 = fus([], N(301));
    t('B-ND141 S11 plafond : 299 → 299, 300 → 300, 301 → 300', r299.length === 299 && r300.length === 300 && r301.length === 300, [r299.length, r300.length, r301.length].join('/'));
    t('B-ND141 S11b à 301, le PLUS ANCIEN est écarté (pas le plus récent) — comme le client', (r301[0] || {}).k === key(0) && r301.every(x => x.k !== key(300)) && (r301[299] || {}).k === key(299)); }
  { const r = fus([E('*', T(2000))], N(301));
    t('B-ND141 S12 plafond avec `*` : `*` occupe un emplacement (300 au total), reste en premier, et 299 entrées au plus', r.length === 300 && (r[0] || {}).k === '*' && r.slice(1).length === 299 && r.every((x, i) => i === 0 || x.k !== key(299) && x.k !== key(300)), r.length + ' / ' + r[0].k); }
  { const bad = [E('nom:nan', NaN), E('nom:neg', -5), E('nom:zero', 0), E('nom:abc', 'abc'), E('nom:inf', Infinity), { k: 'nom:sans-date' }, { t: T(5) }, E('', T(5)), E('   ', T(5)), E(7, T(5)), null, 'nom:chaine', 42, E('nom:ok', T(5)), E('nom:texte-num', '12'), E('nom:nul', null)];
    const r = fus([], bad);
    t('B-ND141 S13 dates invalides (NaN, négatif, 0, texte, Infinity, absente, null) et entrées sans clé valide : IGNORÉES ; seule une date numérique valide reste',
      memes2(r.map(x => x.k).sort(), ['nom:ok', 'nom:texte-num']), JSON.stringify(r));
    t('B-ND141 S13b CONSTAT : une date en TEXTE numérique (« 12 ») est acceptée (Number("12"), comme le client `+x.t`) — pas de contrôle de type', r.some(x => x.k === 'nom:texte-num' && x.t === 12)); }
  { const r = fus([], [E('nom:futur', NOW + 1e9), E('nom:futur-leger', NOW + 1), E('nom:passe', T(5))]);
    t('B-ND141 S14 dates futures : ramenées à « maintenant » (horloge fixée)', (r.find(x => x.k === 'nom:futur') || {}).t === NOW && (r.find(x => x.k === 'nom:futur-leger') || {}).t === NOW && (r.find(x => x.k === 'nom:passe') || {}).t === T(5));
    t('B-ND141 S14b un `*` futur est ramené à maintenant : il masque alors une entrée « maintenant » (≤) — CONSTAT : une horloge d\'appareil en avance peut masquer jusqu\'à l\'instant serveur', memes2(fus([E('nom:x', NOW)], [E('*', NOW + 1e9)]), [E('*', NOW)])); }
  t('B-ND141 S15 doublons : une même clé cinq fois, dates différentes → une entrée, la plus récente', memes2(fus([], [E('nom:d', T(9)), E('nom:d', T(1)), E('nom:d', T(5)), E('nom:d', T(3)), E('nom:d', T(7))]), [E('nom:d', T(1))]));
  { const K = ['__proto__', 'constructor', 'hasOwnProperty', 'toString', 'nom:crème fraîche', 'nom:creme fraiche', 'id:ciqual:19000', 'id:ciqual 19000'];
    const r = fus([], K.map((k, i) => E(k, T(10 + i))));
    t('B-ND141 S16 clés particulières (`__proto__`, `constructor`, `hasOwnProperty`, `toString`, accents, id: proches) : HUIT entrées distinctes, aucune corruption', r.length === 8 && memes2(r.map(x => x.k).sort(), K.map(k => k.toLowerCase()).sort()) && r.every((x, i) => x.t === T(10 + K.map(k => k.toLowerCase()).indexOf(x.k))), JSON.stringify(r.map(x => x.k)));
    t('B-ND141 S16b le dictionnaire n\'a pollué le prototype d\'AUCUN objet ordinaire du serveur (`__proto__` n\'est qu\'une clé)', vm.runInContext('({}).t === undefined && ({}).k === undefined && Object.keys(Object.prototype).length === 0', P.ctx) === true); }
  { const base = 'nom:', l119 = base + 'x'.repeat(115), l120 = base + 'x'.repeat(116), l121 = base + 'x'.repeat(117);
    const r = fus([], [E(l119, T(1)), E(l120, T(2)), E(l121, T(3))]);
    t('B-ND141 S17 CONSTAT identités de 119/120/121 caractères : 119 et 120 intactes ; 121 tronquée à 120 (et donc égale à la 120 de même préfixe)', r.map(x => x.k.length).sort().join() === '119,120' && r.length === 2, JSON.stringify(r.map(x => [x.k.length, x.t])));
    const a = base + 'y'.repeat(116) + 'AAAA', b = base + 'y'.repeat(116) + 'BBBB', c = fus([], [E(a, T(4)), E(b, T(2))]);
    t('B-ND141 S17b ⚠️ COLLISION CONSTATÉE (ANOMALIE A1, antérieure à D-141 : le client tronque pareil) : deux identités qui ne diffèrent qu\'après le 120ᵉ caractère se fondent en UNE entrée, de la date la plus récente', c.length === 1 && (c[0] || {}).t === T(2) && ((c[0] || {}).k || '').length === 120, JSON.stringify(c.map(x => [x.k.length, x.t]))); }
  { const grosse = []; for (let i = 0; i < 6000; i++) grosse.push(E(key(i % 700), T(10000 + i)));
    const durees = []; let r; for (let i = 0; i < 5; i++) { const d0 = process.hrtime.bigint(); r = fus([], grosse); durees.push(Number(process.hrtime.bigint() - d0) / 1e6); }
    console.log('   MESURE S18 : 6 000 entrées reçues (700 identités, 88 % de doublons) → ' + r.length + ' retenues ; durée ms sur 5 essais (Node, vm, cette machine) : ' + durees.map(x => x.toFixed(1)).join(' · ') + ' ; taille de sortie ' + JSON.stringify(r).length + ' octets');
    t('B-ND141 S18 volume : 6 000 entrées dont 88 % de doublons → au plus 300 retenues, triées, sans doublon, la plus récente par identité', r.length === 300 && new Set(r.map(x => x.k)).size === 300 && r.every((x, i) => i === 0 || r[i - 1].t >= x.t) && (r[0] || {}).k === key(0));
    const r2 = fus([], grosse.slice().reverse()); t('B-ND141 S18b le résultat ne dépend pas de l\'ordre d\'arrivée des 6 000 entrées', memes2(r, r2)); }
  { const al = alea(20261029), alea1 = (n) => Math.floor(al() * n); let ko = '';
    const gen = () => Array.from({ length: alea1(40) }, () => E((['nom:', 'id:', ''][alea1(3)]) + 'k' + alea1(25), al() < 0.1 ? NOW + alea1(1e6) : (T(1 + alea1(500)))));
    for (let i = 0; i < 300; i++) { const A = gen(), B = gen();
      if (al() < 0.15) A.push(E('*', T(1 + alea1(500))));
      const r = fus(A, B), r2 = fus(B, A);
      if (!memes2(r, r2)) ko = 'commutativité ' + i; else if (!memes2(fus(r, B), r) || !memes2(fus(r, []), r)) ko = 'idempotence ' + i;
      else if (r.length > 300 || new Set(r.map(x => x.k)).size !== r.length || r.some((x, j) => j && r[j - 1].k !== '*' && r[j - 1].t < x.t)) ko = 'bornes/tri ' + i;
      else if (r.some(x => x.k !== '*' && r[0] && r[0].k === '*' && x.t <= r[0].t)) ko = 'étoile ' + i; }
    t('B-ND141 S20 propriétés sur 300 paires de listes pseudo-aléatoires (graine fixe) : commutativité, idempotence, ≤ 300, sans doublon, trié, entrées ≤ `*` absentes', ko === '', ko); }
  t('B-ND141 S19 la fusion ne MODIFIE PAS les listes qu\'on lui donne (entrées inchangées après appel)', (() => { const a = [E('nom:z', T(3)), E('nom:y', T(1)), E('*', T(9))], b = [E('nom:z', T(1)), E('nom:w', NOW + 5)], a0 = copie(a), b0 = copie(b); fus(a, b); return memes2(a, a0) && memes2(b, b0); })());

  /* ═══ SP — LE VRAI CHEMIN handleSaveProfile_ ═══ */
  const AL = 'alice@example.test', BO = 'bob@example.test';
  const LOG = [{ id: 'l1', date: '2026-10-01', meal: 'midi', name: 'repas-fictif-1', kcal: 300, prot: 20, carbs: 30, fat: 8, q: 150, u: 'g', ts: 1760000000000, v: 1, sourceId: 'ciqual:1001' }, { id: 'l2', date: '2026-10-02', meal: 'soir', name: 'repas-fictif-2', kcal: 410, prot: 25, carbs: 40, fat: 12, q: 200, u: 'g', ts: 1760100000000, v: 1 }];
  const FAV = [{ name: 'fav-fictif-0', kcal: 90, prot: 3, carbs: 12, fat: 1, per100: { kcal: 90, prot: 3, carbs: 12, fat: 1 }, q: 100, u: 'g', t: 1760000000000 }, { name: 'fav-fictif-1', kcal: 91, prot: 3, carbs: 12, fat: 1, q: 100, u: 'g' }];
  const RICHE = { profile: { name: 'Alice Fictive', healthProfile: { note: 'fictif' }, foodAiUses: 3, goal: 'force' }, foodLog: LOG, savedFoods: FAV,
    racine: { sessions: [{ date: '2026-10-01', exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, done: true }] }], vol: 500 }], prs: { Squat: { rm1: 115, kg: 100, reps: 5, date: '2026-10-01' } }, programmes: [{ name: 'prog-fictif', exs: [] }], weightLog: [{ date: '2026-10-01', kg: 80 }] } };
  { const X = neuf(); X.compte(AL, {}); const av = hidBrut(X, AL);
    const rep = envoiH(X, AL, [E('nom:a', T(10))]);
    preuve('SP1 (état initial → requête → persisté → relu)', { initial: av === undefined ? 'aucun hiddenFoods' : av, requete: [E('nom:a', T(10))], reponse: rep.j.status, persiste: hid(X, AL), relu_loadProfile: X.post({ action: 'loadProfile', email: AL }).j.profile.hiddenFoods });
    t('B-ND141 SP1 première sauvegarde par le VRAI chemin : réponse ok, ET entrée relue dans le stockage, ET renvoyée par `loadProfile`', rep.j.status === 'ok' && av === undefined && memes2(hid(X, AL), [E('nom:a', T(10))]) && memes2(X.post({ action: 'loadProfile', email: AL }).j.profile.hiddenFoods, [E('nom:a', T(10))])); }
  { const X = neuf(); const EX2 = [E('nom:b', T(5)), E('nom:a', T(10))];
    compteH(X, AL, { hidden: EX2 }); let r = envoiH(X, AL, undefined, { name: 'Alice 2' }); t('B-ND141 SP2 envoi SANS le champ (ancien client) : masquages intacts, autre champ appliqué', r.j.status === 'ok' && memes2(hid(X, AL), EX2) && X.lireCompte(AL).profile.name === 'Alice 2');
    r = envoiH(X, AL, []); t('B-ND141 SP3 envoi d\'un tableau vide : masquages intacts', r.j.status === 'ok' && memes2(hid(X, AL), EX2));
    r = X.envoi(AL, { hiddenFoods: null }); t('B-ND141 SP3b envoi de `null` : masquages intacts', r.j.status === 'ok' && memes2(hid(X, AL), EX2));
    r = envoiH(X, AL, [E('nom:b', T(5))]); t('B-ND141 SP4 liste plus courte : masquages intacts', r.j.status === 'ok' && memes2(hid(X, AL), EX2));
    r = envoiH(X, AL, 'pas un tableau'); t('B-ND141 SP4b envoi d\'un non-tableau (chaîne) : ignoré, masquages intacts', memes2(hid(X, AL), EX2));
    r = envoiH(X, AL, [E('nom:b', T(5)), E('nom:a', T(10))]); const w0 = X.ecritures.length; const r2 = envoiH(X, AL, [E('nom:b', T(5)), E('nom:a', T(10))]);
    t('B-ND141 SP14 répétition d\'un envoi identique : état identique (idempotent)', memes2(hid(X, AL), EX2) && r2.j.status === 'ok'); }
  { const X = neuf(); compteH(X, AL, { hidden: [] });
    envoiH(X, AL, [E('nom:tel1', T(10)), E('nom:commun', T(9))]); envoiH(X, AL, [E('nom:tel2', T(8)), E('nom:commun', T(2))]);
    t('B-ND141 SP5 deux appareils, listes différentes, envois successifs : l\'UNION est conservée, la date récente de l\'identité commune l\'emporte', memes2(hid(X, AL), [E('nom:commun', T(2)), E('nom:tel2', T(8)), E('nom:tel1', T(10))].sort((a, b) => b.t - a.t)));
    envoiH(X, AL, undefined, { name: 'ancien client' });
    t('B-ND141 SP6 un ancien client (sans le champ) passe entre deux : rien ne bouge', hid(X, AL).length === 3); }
  { const X = neuf(); compteH(X, AL, { hidden: [E('nom:a', T(10)), E('nom:b', T(3))] });
    envoiH(X, AL, [E('*', T(6))]);
    t('B-ND141 SP7 `*` reçu : conservé en tête, l\'entrée antérieure tombe, la postérieure reste', memes2(hid(X, AL), [E('*', T(6)), E('nom:b', T(3))]));
    envoiH(X, AL, [E('nom:vieux', T(20))]);
    t('B-ND141 SP7b un envoi plus ancien que `*` ne ressuscite rien et n\'enlève pas `*`', memes2(hid(X, AL), [E('*', T(6)), E('nom:b', T(3))]));
    envoiH(X, AL, [E('nom:b', T(3))]); t('B-ND141 SP7c refusionner le même état ne change rien (R12 relecture)', memes2(hid(X, AL), [E('*', T(6)), E('nom:b', T(3))])); }
  { const X = neuf(); X.compte(AL, {}); X.compte(BO, {}); compteH(X, BO, { hidden: [E('nom:bob', T(4))] });
    envoiH(X, AL, [E('nom:alice', T(5))]);
    t('B-ND141 SP12 isolation des comptes : l\'envoi d\'Alice n\'écrit rien sur Bob', memes2(hid(X, BO), [E('nom:bob', T(4))]) && memes2(hid(X, AL), [E('nom:alice', T(5))])); }
  { const X = neuf(); X.compte(AL, {}); const big = Array.from({ length: 450 }, (_, i) => E(key(i), T(2000 + i))); envoiH(X, AL, big);
    t('B-ND141 SP13 450 entrées envoyées → 300 stockées (les plus récentes)', hid(X, AL).length === 300 && (hid(X, AL)[0] || {}).k === key(0)); }
  { const X = neuf(); compteH(X, AL, RICHE); const av = copie(X.lireCompte(AL)); const pk0 = Object.keys(X.props).sort(); X.ecritures.length = 0;
    const r = envoiH(X, AL, [E('nom:a', T(5))]);
    const ap = X.lireCompte(AL);
    t('B-ND141 SP9 ⭐ un envoi de masquages seul ne change AUCUN autre champ du compte (journal, favoris, séances, records, programmes, poids, santé, compteurs — comparaison de structure)', memes2(sansBruit(av), sansBruit(ap)) && (ap.profile.hiddenFoods || []).length === 1, 'diff: ' + Object.keys(sansBruit(ap)).filter(k => !memes2(sansBruit(av)[k], sansBruit(ap)[k])).join(','));
    t('B-ND141 SP9b `foodLog` et `savedFoods` : égalité de sérialisation JSON stricte avant/après', JSON.stringify(av.profile.foodLog) === JSON.stringify(ap.profile.foodLog) && JSON.stringify(av.profile.savedFoods) === JSON.stringify(ap.profile.savedFoods));
    const nouvelles = Object.keys(X.props).filter(k => pk0.indexOf(k) < 0);
    const ecrD = X.ecritures.filter((k, i, a) => a.indexOf(k) === i).sort(); let ecrM = null;
    if (BASE_SRC) { const Xm = neuf({ code: BASE_SRC }); compteH(Xm, AL, RICHE); Xm.ecritures.length = 0; Xm.envoi(AL, { hiddenFoods: [E('nom:a', T(5))] }); ecrM = Xm.ecritures.filter((k, i, a) => a.indexOf(k) === i).sort(); }
    t('B-ND141 SP11 aucune zone de récupération, aucun fichier Drive ; les propriétés écrites sont EXACTEMENT celles que master écrit pour la même requête (compteur de migration `mig_stats`, santé `h_`, compte `u_` : préexistants) — D-141 n\'en ajoute aucune', X.fichiers.length === 0 && !('recupNut' in ap) && ecrM !== null && memes2(ecrD, ecrM), JSON.stringify({ d141: ecrD, master: ecrM }));
    t('B-ND141 SP11b le journal du serveur ne contient ni l\'adresse ni le contenu des masquages', !X.journal.some(l => /example\.test|nom:a\b/.test(l)));
    const X2 = neuf({ code: BASE_SRC }); compteH(X2, AL, RICHE);
    const corps = { name: 'Alice Nouveau', foodLog: copie(LOG), savedFoods: copie(FAV), hiddenFoods: [E('nom:a', T(5))] }, corpsSans = Object.assign({}, corps); delete corpsSans.hiddenFoods;
    if (BASE_SRC) { const X1 = neuf(); compteH(X1, AL, RICHE); X1.envoi(AL, corps); X2.envoi(AL, corps);
      t('B-ND141 SP10 ⭐ ATTRIBUTION : avec un envoi COMPLET (journal + favoris identiques à l\'existant), le compte écrit par D-141 est identique à celui écrit par master, au seul champ `hiddenFoods` près (P1 inchangé)', memes2(sansBruit(X1.lireCompte(AL)), sansBruit(X2.lireCompte(AL))) && X2.lireCompte(AL).profile.hiddenFoods === undefined && (X1.lireCompte(AL).profile.hiddenFoods || []).length === 1);
      const Xr = neuf(), Xb = neuf({ code: BASE_SRC }); [Xr, Xb].forEach(S => { compteH(S, AL, RICHE); S.envoi(AL, { foodLog: [], savedFoods: [] }); });
      t('B-ND141 SP10b envoi VIDE de journal/favoris (garde-fous P1) : D-141 et master produisent le même compte, mêmes zones de récupération', memes2(sansBruit(Xr.lireCompte(AL)), sansBruit(Xb.lireCompte(AL))) && Object.keys(Xr.props).sort().join() === Object.keys(Xb.props).sort().join());
    } else t('B-ND141 SP10 attribution à master', false, 'Code.js de master indisponible'); }

  /* ═══ R — LA RESTAURATION ADMINISTRATIVE ═══ */
  const BACKUP = (hidden, o) => { const p = Object.assign({ name: 'Alice Sauvegarde' }, (o && o.profile) || {}); if (hidden !== undefined) p.hiddenFoods = hidden; return Object.assign({ email: AL, profile: p, prs: {}, sessions: [] }, (o && o.racine) || {}); };
  { const X = neuf(); const ACTUEL = [E('nom:recent', T(2)), E('nom:ancien', T(30))]; compteH(X, AL, { hidden: ACTUEL });
    let r = restaure(X, AL, BACKUP());
    preuve('R01 (compte → sauvegarde → relu)', { compte: ACTUEL, sauvegarde: 'sans hiddenFoods', reponse: r.j.status, relu: hid(X, AL) });
    t('B-ND141 R01 ⭐ sauvegarde ANCIENNE sans `hiddenFoods` : les masquages du compte restent', r.j.status === 'ok' && memes2(hid(X, AL), ACTUEL));
    compteH(X, AL, { hidden: ACTUEL }); r = restaure(X, AL, BACKUP([E('nom:ancien', T(30))]));
    t('B-ND141 R02 sauvegarde plus COURTE : les masquages récents du compte ne disparaissent pas', memes2(hid(X, AL), ACTUEL));
    compteH(X, AL, { hidden: ACTUEL }); r = restaure(X, AL, BACKUP([E('nom:extra', T(15)), E('nom:ancien', T(1))]));
    t('B-ND141 R03 sauvegarde avec masquages EN PLUS / plus récents : fusion des deux ensembles, le plus récent par identité', memes2(hid(X, AL), [E('nom:ancien', T(1)), E('nom:recent', T(2)), E('nom:extra', T(15))]));
    compteH(X, AL, { hidden: [E('*', T(8)), E('nom:b', T(3))] }); restaure(X, AL, BACKUP([E('nom:vieux', T(40))]));
    t('B-ND141 R04 `*` du compte, sauvegarde sans `*` : `*` préservé, l\'ancien de la sauvegarde ne ressuscite pas', memes2(hid(X, AL), [E('*', T(8)), E('nom:b', T(3))]));
    compteH(X, AL, { hidden: [E('nom:a', T(20)), E('nom:b', T(2))] }); restaure(X, AL, BACKUP([E('*', T(9))]));
    t('B-ND141 R05 `*` dans la sauvegarde : fusion correcte avec l\'état du compte (`*` conservé, antérieur tombé, postérieur gardé)', memes2(hid(X, AL), [E('*', T(9)), E('nom:b', T(2))]));
    compteH(X, AL, {}); restaure(X, AL, BACKUP());
    t('B-ND141 R06 sauvegarde très ancienne sans champ, compte sans masquage : aucun champ `hiddenFoods` n\'est inventé', hidBrut(X, AL) === undefined);
    const X3 = neuf(); r = restaure(X3, AL, BACKUP([E('nom:b', T(4)), E('nom:a', T(9))]));
    t('B-ND141 R07 compte INEXISTANT + sauvegarde avec masquages : restaurés (et normalisés)', r.j.status === 'ok' && memes2(hid(X3, AL), [E('nom:b', T(4)), E('nom:a', T(9))]));
    t('B-ND141 R08 relecture : `loadProfile` après restauration renvoie les masquages fusionnés', memes2(X3.post({ action: 'loadProfile', email: AL }).j.profile.hiddenFoods, [E('nom:b', T(4)), E('nom:a', T(9))]));
    const X4 = neuf(); compteH(X4, AL, { hidden: ACTUEL }); const avant = copie(X4.props), nEcr = X4.ecritures.length;
    r = X4.post({ action: 'adminRestore', adminToken: 'faux-jeton-123456', email: AL, data: BACKUP([E('nom:piege', T(1))]) });
    t('B-ND141 R09 jeton administrateur invalide : refus, AUCUNE écriture, compte intact', r.j.error === 'unauthorized' && X4.ecritures.length === nEcr && memes2(Object.assign({}, X4.props), avant) && memes2(hid(X4, AL), ACTUEL));
    r = X4.post({ action: 'adminRestore', adminToken: '', email: AL, data: BACKUP() }); t('B-ND141 R09b jeton vide : refus', r.j.error === 'unauthorized' && memes2(hid(X4, AL), ACTUEL));
    r = restaure(X4, AL, { email: AL, prs: {} }); t('B-ND141 R10 structure invalide (pas de `profile`) : refus « data.profile required », aucune écriture', r.j.error === 'data.profile required' && X4.ecritures.length === nEcr && memes2(hid(X4, AL), ACTUEL));
    r = restaure(X4, '', BACKUP()); t('B-ND141 R10b e-mail absent : refus, aucune écriture', r.j.error === 'email required' && X4.ecritures.length === nEcr); }
  { /* R11 : l'objet reçu — comparaison D-141 / master */
    const mut = (code) => { const X = neuf({ code }); compteH(X, AL, { hidden: [E('nom:recent', T(2))] }); const corps = { adminToken: ADMIN, email: AL, data: BACKUP([E('nom:b', T(4))], { profile: { savedFoods: copie(FAV), foodLog: copie(LOG) } }) }; delete corps.data.email;
      const avant = copie(corps); X.ctx.handleAdminRestore_(corps);
      const diff = { racine: ['email', 'updatedAt'].filter(k => canon(corps.data[k]) !== canon(avant.data[k])), profile: Object.keys(Object.assign({}, avant.data.profile, corps.data.profile)).filter(k => canon(corps.data.profile[k]) !== canon(avant.data.profile[k])) };
      return { diff, X, corps }; };
    const d = mut(undefined), b = BASE_SRC ? mut(BASE_SRC) : null;
    console.log('   CONSTAT R11 objet `body.data` reçu — D-141 : racine modifiée ' + JSON.stringify(d.diff.racine) + ', profil modifié ' + JSON.stringify(d.diff.profile) + (b ? ' · master : racine ' + JSON.stringify(b.diff.racine) + ', profil ' + JSON.stringify(b.diff.profile) : ''));
    t('B-ND141 R11 ⭐ le PROFIL du fichier reçu n\'est jamais modifié par D-141 (copie contrôlée) ; la mutation préexistante de la racine (`email`, `updatedAt` ajoutés par master) n\'a plus lieu dans ce cas — la copie est mutée à la place', d.diff.profile.length === 0 && (!b || (b.diff.profile.length === 0 && b.diff.racine.join() === 'email,updatedAt' && d.diff.racine.length === 0)), JSON.stringify(d.diff) + ' / ' + (b ? JSON.stringify(b.diff) : 'master indisponible'));
    t('B-ND141 R11b ce qui est ÉCRIT garde bien `email` et `updatedAt` (le compte enregistré est complet)', !!d.X.lireCompte(AL).email && !!d.X.lireCompte(AL).updatedAt);
    t('B-ND141 R12 ⭐ favoris : après restauration, `savedFoods` du compte = celui de la sauvegarde, à l\'identique, comme avant D-141 (aucun filtrage)', !b || (memes2(d.X.lireCompte(AL).profile.savedFoods, FAV) && memes2(b.X.lireCompte(AL).profile.savedFoods, FAV)));
    t('B-ND141 R13 ⭐ journal : après restauration, `foodLog` = celui de la sauvegarde, comme master ; le compte restauré par D-141 = celui de master au seul `hiddenFoods` près (master écrit celui de la sauvegarde seul ; D-141 y ajoute celui du compte)', !b || (memes2(d.X.lireCompte(AL).profile.foodLog, LOG) && memes2(sansBruit(d.X.lireCompte(AL)), sansBruit(b.X.lireCompte(AL))) && memes2(b.X.lireCompte(AL).profile.hiddenFoods, [E('nom:b', T(4))]) && memes2(d.X.lireCompte(AL).profile.hiddenFoods, [E('nom:recent', T(2)), E('nom:b', T(4))])));
    const X = neuf(); X.compte(AL, {}); X.compte(BO, {}); compteH(X, BO, { hidden: [E('nom:bob', T(4))] }); const bob0 = copie(X.lireCompte(BO));
    restaure(X, AL, BACKUP([E('nom:alice', T(5))])); t('B-ND141 R14 isolation : restaurer Alice n\'écrit rien chez Bob', memes2(X.lireCompte(BO), bob0) && memes2(hid(X, AL), [E('nom:alice', T(5))]));
    const X5 = neuf(); compteH(X5, AL, { hidden: [E('nom:r', T(2))] }); restaure(X5, AL, BACKUP([E('nom:r', T(2))])); restaure(X5, AL, BACKUP([E('nom:r', T(2))]));
    t('B-ND141 R15 restauration RÉPÉTÉE : état stable', memes2(hid(X5, AL), [E('nom:r', T(2))]));
    const X6 = neuf(); compteH(X6, AL, { hidden: [E('nom:r', T(2))] }); restaure(X6, AL, BACKUP([E('nom:vieux', T(40))]));
    t('B-ND141 R16 restaurer une sauvegarde plus VIEILLE que le compte n\'enlève aucun masquage récent du compte (le sens inverse de ce que fait une restauration pour le reste)', hid(X6, AL).some(x => x.k === 'nom:r')); }

  /* ═══ L — ANCIENS MASQUAGES AU FORMAT CHAÎNE ═══ */
  { const OBJ = [E('nom:obj', T(3))], CH = ['crème fraîche', 'nom:chaine-prefixee'];
    const X = neuf(); compteH(X, AL, { hidden: CH }); envoiH(X, AL, OBJ);
    t('B-ND141 L01 CONSTAT ⚠️ LIMITE : un serveur qui contiendrait une liste de CHAÎNES la perd au premier envoi moderne (les chaînes sont ignorées, jamais converties)', memes2(hid(X, AL), OBJ));
    const X2 = neuf(); compteH(X2, AL, { hidden: OBJ }); restaure(X2, AL, BACKUP(CH));
    t('B-ND141 L02 sauvegarde en chaînes + compte en objets : les objets du compte restent, les chaînes sont ignorées (ni conservées ni converties)', memes2(hid(X2, AL), OBJ));
    const X3 = neuf(); restaure(X3, AL, BACKUP(CH));
    t('B-ND141 L03 CONSTAT : sauvegarde en chaînes SEULES + compte sans masquage : le champ est écrit tel quel (comportement de master conservé, la fusion ne s\'applique pas car vide)', memes2(X3.lireCompte(AL).profile.hiddenFoods, CH));
    envoiH(X3, AL, OBJ);
    t('B-ND141 L06 ⚠️ puis un envoi MODERNE du même compte : les chaînes restaurées disparaissent (perte d\'un masquage historique) — scénario reproductible, impact limité (voir rapport)', memes2(hid(X3, AL), OBJ));
    const X4 = neuf(); compteH(X4, AL, { hidden: [E('nom:obj', T(3)), 'brut'] }); envoiH(X4, AL, [E('nom:autre', T(1))]);
    t('B-ND141 L04 mélange chaînes + objets : les objets sont conservés et fusionnés, les chaînes ignorées', memes2(hid(X4, AL), [E('nom:autre', T(1)), E('nom:obj', T(3))]));
    t('B-ND141 L05 la même entrée en chaîne ET en objet : l\'objet est gardé (une seule entrée)', memes2(fus(['nom:obj'], [E('nom:obj', T(3))]), [E('nom:obj', T(3))]));
    if (BASE_SRC) { const Xb = neuf({ code: BASE_SRC }); Xb.ctx.saveUserData_; Xb.compte(AL, {}); restaure(Xb, AL, BACKUP(CH));
      t('B-ND141 L07 ORIGINE : avec le code de master, une restauration de sauvegarde en chaînes écrit les chaînes telles quelles — la situation L03 vient donc d\'une sauvegarde, jamais d\'un envoi du client', memes2(Xb.lireCompte(AL).profile.hiddenFoods, CH)); } }

  /* ═══ A — ALIGNEMENT CLIENT / SERVEUR ═══ */
  { const st = fs.readFileSync(path.join(RACINE, 'state.js'), 'utf8'), m = st.match(/const _NUT_MASQUES_MAX=300;[\s\S]*?function _nutMasquesFusion\(a, b, maintenant\)\{[\s\S]*?\n\}/);
    t('B-ND141 A0 le vrai `_nutMasquesNormaliser` du client est extrait de state.js', !!m);
    if (m) { const cx = vm.createContext({}); vm.runInContext(m[0] + ';this._f=_nutMasquesFusion;this._n=_nutMasquesNormaliser;', cx);
      const cli = (a, b) => copie(cx._f(a, b, NOW)), srv = (a, b) => fus(a, b);
      const longs = [E('nom:' + 'q'.repeat(130), T(3)), E('nom:' + 'q'.repeat(116) + 'ZZ', T(1))];
      const BAT = {
        'simples': [[E('nom:a', T(5)), E('id:123', T(7))], [E('nom:b', T(1))]], 'doublons': [[E('nom:a', T(5)), E('nom:a', T(9))], [E('nom:a', T(2)), E('nom:a', T(20))]],
        'dates invalides': [[E('nom:a', NaN), E('nom:b', -1)], [E('nom:c', 0), E('nom:d', 'x'), E('nom:e', T(2))]], 'futures': [[E('nom:f', NOW + 5e6)], [E('*', NOW + 7)]],
        'clés longues': [longs, []], 'étoile': [[E('*', T(10)), E('nom:a', T(20)), E('nom:b', T(3))], [E('*', T(4)), E('nom:c', T(4))]],
        'plafond 300': [N(150), N(400).slice(100)], 'accents/majuscules': [[E('NOM:Crème Fraîche', T(5)), E('nom:creme fraiche', T(3)), E('  Nom:Béchamel  ', T(2))], [E('ID:CIQUAL:19000', T(1))]],
        'particulières': [[E('__proto__', T(4)), E('constructor', T(5))], [E('hasOwnProperty', T(6)), E('id:ciqual 19000', T(2))]], 'vides': [[], []], 'une seule liste': [[E('nom:a', T(5))], null] };
      Object.keys(BAT).forEach(nom => { const [a, b] = BAT[nom]; t('B-ND141 A1 « ' + nom + ' » : serveur et client donnent le MÊME résultat (horloge identique)', memes2(srv(a, b), cli(a, b)), canon(srv(a, b)).slice(0, 200) + ' ≠ ' + canon(cli(a, b)).slice(0, 200)); });
      const chaine = [['nom:ch'], [E('nom:o', T(2))]];
      t('B-ND141 A2 DIVERGENCE VOULUE (documentée) : sur une chaîne nue, le client la convertit en date « maintenant » ; le serveur l\'ignore', cli(chaine[0], chaine[1]).some(x => x.k === 'nom:ch') && !srv(chaine[0], chaine[1]).some(x => x.k === 'nom:ch'));
      t('B-ND141 A3 le plafond du client et celui du serveur sont la MÊME constante (300)', P.ctx.NUT_MASQUES_MAX_ === 300 && /_NUT_MASQUES_MAX=300/.test(m[0])); } }

  /* ═══ C — DEUX APPAREILS : ENTRELACEMENT SIMULÉ ═══ */
  /** A lit, B lit, puis A écrit, puis B écrit : reconstitué en capturant ce que chaque requête voulait écrire. */
  function entrelacer(X, email, corpsA, corpsB, ordreEcriture) {
    const orig = X.ctx.saveUserData_, pris = [];
    X.ctx.saveUserData_ = (e, d) => { pris.push([e, copie(d)]); };
    X.envoi(email, corpsA); X.envoi(email, corpsB);           // les deux LISENT le même état de départ ; aucune écriture n'a lieu
    X.ctx.saveUserData_ = orig;
    (ordreEcriture === 'BA' ? [pris[1], pris[0]] : pris).forEach(([e, d]) => orig(e, d));
    return pris.length;
  }
  { const A = [E('nom:tel-a', T(10))], B = [E('nom:tel-b', T(8))];
    const X = neuf(); X.compte(AL, {}); X.envoi(AL, { hiddenFoods: A }); X.envoi(AL, { hiddenFoods: B });
    const X2 = neuf(); X2.compte(AL, {}); X2.envoi(AL, { hiddenFoods: B }); X2.envoi(AL, { hiddenFoods: A });
    t('B-ND141 C01 envois SÉQUENTIELS A puis B : les deux appareils sont conservés', hid(X, AL).length === 2);
    t('B-ND141 C02 ordre inverse B puis A : résultat identique à C01', memes2(hid(X, AL), hid(X2, AL)));
    const Xc = neuf(); Xc.compte(AL, {}); const n = entrelacer(Xc, AL, { hiddenFoods: A }, { hiddenFoods: B }, 'AB'); const fin = hid(Xc, AL);
    preuve('C03 (A lit, B lit, A écrit, B écrit)', { requetes: 2, ecritures_capturees: n, etat_final: fin });
    t('B-ND141 C03 ⚠️ CONSTAT, ENTRELACEMENT RÉEL SIMULÉ : A lit, B lit, A écrit, B écrit → le DERNIER écrivain écrase : le masquage de A est PERDU côté serveur (fusion avec l\'état LU, pas avec l\'état écrit)', n === 2 && memes2(fin, B), JSON.stringify(fin));
    const Xd = neuf(); Xd.compte(AL, {}); entrelacer(Xd, AL, { hiddenFoods: A }, { hiddenFoods: B }, 'AB'); Xd.envoi(AL, { hiddenFoods: A });
    t('B-ND141 C04 ⭐ CONVERGENCE : l\'appareil A réenvoie sa liste (le client renvoie toujours sa liste complète) → le masquage perdu est récupéré, l\'union est rétablie', memes2(hid(Xd, AL), [E('nom:tel-b', T(8)), E('nom:tel-a', T(10))].sort((a, b) => b.t - a.t)));
    console.log('   NOTE C04b : tant que A ne synchronise pas, le serveur n\'a pas le masquage de A (B et tout appareil qui charge ne le voient pas) — fenêtre de réapparition bornée par la prochaine sauvegarde de A.');
    const Xe = neuf(); Xe.compte(AL, {}); entrelacer(Xe, AL, { hiddenFoods: A }, { hiddenFoods: B }, 'BA');
    t('B-ND141 C03b écritures dans l\'autre ordre (B puis A) : c\'est A, le dernier, qui gagne — la perte est symétrique', memes2(hid(Xe, AL), A));
    const Xf = neuf(); compteH(Xf, AL, { hidden: [E('nom:x', T(10)), E('nom:y', T(9))] }); entrelacer(Xf, AL, { hiddenFoods: [E('*', T(2))] }, { hiddenFoods: [E('nom:z', T(30))] }, 'AB');
    t('B-ND141 C05 ⚠️ REMISE À ZÉRO CONCURRENTE (A envoie `*`, B une liste antérieure, entrelacés) : B écrase `*` → les anciens masquages RÉAPPARAISSENT côté serveur jusqu\'au prochain envoi de A', !hid(Xf, AL).some(x => x.k === '*') && hid(Xf, AL).some(x => x.k === 'nom:x'), JSON.stringify(hid(Xf, AL)));
    Xf.envoi(AL, { hiddenFoods: [E('*', T(2))] });
    t('B-ND141 C05b … et le réenvoi de `*` par A rétablit la remise à zéro (convergence)', (hid(Xf, AL)[0] || {}).k === '*' && !hid(Xf, AL).some(x => x.k === 'nom:x'));
    const Xg = neuf(); Xg.compte(AL, {}); Xg.envoi(AL, { hiddenFoods: A }); const Xo = Xg.envoi(AL, { name: 'vieux téléphone', foodLog: [], savedFoods: [] });
    t('B-ND141 C06 client ANCIEN (sans le champ, avec ses autres champs) après un client moderne : masquages conservés', memes2(hid(Xg, AL), A));
    const Xh = neuf(); Xh.compte(AL, {}); const w0 = Xh.ctx.NUT_MASQUES_MAX_;
    t('B-ND141 C07 LIMITE DU HARNAIS : aucune exécution parallèle réelle d\'Apps Script n\'est simulée — Code.js n\'a AUCUN verrou (`LockService` absent de Code.js) ; l\'entrelacement ci-dessus est reconstitué, pas observé', !/LockService/.test(CODE_BRUT)); }

  /* ═══ RB — RISQUE DE RETOUR EN ARRIÈRE (code) ═══ */
  if (BASE_SRC) { const X = neuf({ code: BASE_SRC }); compteH(X, AL, { hidden: [E('nom:garde', T(3))] });
    X.envoi(AL, { name: 'après retour arrière', hiddenFoods: [E('nom:autre', T(1))] });
    t('B-ND141 RB1 RETOUR au Code.js de master : un masquage DÉJÀ stocké survit à une sauvegarde ordinaire (champ inconnu non effacé), mais le champ envoyé n\'est plus fusionné', memes2(X.lireCompte(AL).profile.hiddenFoods, [E('nom:garde', T(3))]));
    restaure(X, AL, BACKUP([E('nom:vieille', T(50))]));
    t('B-ND141 RB2 RETOUR au code de master : une restauration administrative ÉCRASE les masquages stockés (le comportement d\'AVANT D-141) — un retour arrière du code ne restaure ni ne supprime des données, il retire la protection', memes2(X.lireCompte(AL).profile.hiddenFoods, [E('nom:vieille', T(50))])); }
}
module.exports.serveurTests = serveurTests;
module.exports.source = function (t0) { serveurTests(t0); };
