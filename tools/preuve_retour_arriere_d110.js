#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01)
/* PREUVE — RETOUR ARRIÈRE DE D-110 (FIX-A′, intégration Nutrition V2 × P1, 23/10/2026). Hors passe : c'est une preuve
   attachée à UN déploiement, pas un témoin permanent.
   CONDUIT : le Code.js de ce dépôt (intégration) PUIS le Code.js déployé en production (@192, blob git fixe ci-dessous),
   sur le MÊME stockage simulé (propriétés + Drive en mémoire, vraie compression) — exactement un redéploiement arrière.
   OBSERVE : la réponse de `loadProfile` (restauration), le compte stocké après une réécriture par la prod, puis la reprise
   par le code d'intégration redéployé en avant.
   NE COUVRE PAS : le vrai Apps Script, le vrai Drive, deux envois simultanés pendant le basculement.
   ⛔ DONNÉES INVENTÉES (example.test, « fav-fictif-… », « repas-fictif-… »).
   CONTRÔLES NÉGATIFS (la preuve sait rougir) : CONTROLE=integ (la « prod » = le code d'intégration : R2 et R4 rougissent)
   · CONTROLE=perd (une prod qui jetterait les champs inconnus du compte : R2 et R5 rougissent).
   Usage : node tools/preuve_retour_arriere_d110.js [blob ou révision du Code.js de la prod]   (depuis la racine du dépôt) */
'use strict';
const fs = require('fs'), vm = require('vm'), crypto = require('crypto'), zlib = require('zlib'), path = require('path'), cp = require('child_process');
const RACINE = path.dirname(__dirname);
const REF = process.argv[2] || '8430bf8759fad44b3d76b7eb18166d5a1e35f6af';   // Code.js du déploiement @192 (A1, 22/10)
const FONDATEUR = 'fondateur@example.test', BOB = 'bob@example.test', CODE = 'bob-code-fictif';
const HARD = /const PREMIUM_HARDCODED_ = \[[^\]]*\];/g;
const prep = s => { if ((s.match(HARD) || []).length !== 1) throw new Error('liste premium en dur introuvable'); return s.replace(HARD, "const PREMIUM_HARDCODED_ = ['" + FONDATEUR + "'];"); };
const SRC_INTEG = prep(fs.readFileSync(path.join(RACINE, 'Code.js'), 'utf8'));
const lireRef = () => cp.execSync('git cat-file -p ' + (/^[0-9a-f]{40}$/.test(REF) ? REF : REF + ':Code.js'), { cwd: RACINE, encoding: 'utf8', maxBuffer: 64 << 20 });
const SRC_PROD = process.env.CONTROLE === 'integ' ? SRC_INTEG
  : process.env.CONTROLE === 'perd' ? prep(lireRef()).replace('function saveUserData_(email, data) {', 'function saveUserData_(email, data) { if (data) delete data.recupNut;')
  : prep(lireRef());
const BLOB_PROD = cp.execSync('git rev-parse ' + (/^[0-9a-f]{40}$/.test(REF) ? REF : REF + ':Code.js'), { cwd: RACINE, encoding: 'utf8' }).trim();
const blob = d => { const b = Buffer.isBuffer(d) ? d : Buffer.from(String(d), 'utf8'); return { getBytes: () => b, getDataAsString: () => b.toString('utf8'), setName() { return this; } }; };
const fmt = (d, tz, f) => { const x = new Date(d), p = n => String(n).padStart(2, '0');
  return String(f || "yyyy-MM-dd'T'HH:mm:ss").replace('yyyy', x.getUTCFullYear()).replace('MM', p(x.getUTCMonth() + 1)).replace('dd', p(x.getUTCDate()))
    .replace('HH', p(x.getUTCHours())).replace('mm', p(x.getUTCMinutes())).replace('ss', p(x.getUTCSeconds())).replace(/'/g, ''); };
/* Un MÊME stockage (propriétés + Drive) partagé par deux versions du serveur : c'est exactement un redéploiement. */
const props = Object.create(null), fichiers = [], journal = []; let panne = false, horloge = Date.now();
Object.assign(props, { backup_set_tags_2026_06_29: '2026-06-29T00:00:00.000Z', triggers_purged_20260630: '2026-06-30T00:00:00.000Z', triggers_purged_log: 'AUCUN', PREMIUM_EMAILS: FONDATEUR });
const sp = { getProperty: k => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v); }, deleteProperty: k => { delete props[k]; }, getProperties: () => Object.assign({}, props), getKeys: () => Object.keys(props) };
const iter = l => { let i = 0; return { hasNext: () => i < l.length, next: () => l[i++] }; };
const fichier = f => ({ getName: () => f.name, getDateCreated: () => new Date(f.updated), getLastUpdated: () => new Date(f.updated), getSize: () => Buffer.byteLength(f.content), getBlob: () => blob(f.content), getId: () => 'f_' + f.name });
const sous = Object.create(null);
const dossier = (dir, nomD) => ({ getId: () => 'd_' + (dir || 'racine'), getName: () => nomD, getFiles: () => iter(fichiers.filter(x => x.dir === dir).map(fichier)),
  getFilesByName: nm => iter(fichiers.filter(x => x.dir === dir && x.name === nm).map(fichier)), getFoldersByName: nm => iter(!dir && sous[nm] ? [sous[nm]] : []),
  createFolder: nm => (sous[nm] = dossier(String(nm), String(nm))),
  createFile: (nom, contenu) => { if (panne) throw new Error('Drive indisponible (panne simulée)'); const f = { name: String(nom), dir, updated: ++horloge, content: String(contenu) }; fichiers.push(f); return fichier(f); } });
const racine = dossier('', 'ForceTracker-Backups');
const refuse = n => () => { throw new Error(n + ' non doublé'); };
function serveur(src) {
  const ctx = { console: { log() {}, warn() {}, error() {} }, PropertiesService: { getScriptProperties: () => sp },
    Utilities: { getUuid: () => crypto.randomUUID(), DigestAlgorithm: { SHA_256: 1 }, Charset: { UTF_8: 1 },
      computeDigest: (a, s) => [...crypto.createHash('sha256').update(String(s), 'utf8').digest()].map(x => (x > 127 ? x - 256 : x)),
      newBlob: d => blob(d), gzip: b => blob(zlib.gzipSync(b.getBytes())), ungzip: b => blob(zlib.gunzipSync(b.getBytes())),
      base64Encode: b => Buffer.from(b.getBytes ? b.getBytes() : b).toString('base64'), base64Decode: s => Buffer.from(String(s), 'base64'), formatDate: fmt, sleep() {} },
    Session: { getScriptTimeZone: () => 'Europe/Paris' }, Logger: { log: m => { journal.push(String(m)); } },
    MailApp: { sendEmail() {}, getRemainingDailyQuota: () => 100 }, GmailApp: { sendEmail() {} }, SpreadsheetApp: { openById: refuse('SpreadsheetApp') },
    DriveApp: { getFolderById: () => racine, getFoldersByName: () => iter([racine]), createFolder: refuse('DriveApp.createFolder') },
    UrlFetchApp: { fetch: refuse('UrlFetchApp') }, ScriptApp: { getProjectTriggers: () => [], newTrigger: refuse('newTrigger'), deleteTrigger: refuse('deleteTrigger') },
    ContentService: { createTextOutput: x => ({ t: x, setMimeType() { return this; } }), MimeType: { JSON: 1 } },
    CacheService: { getScriptCache: () => ({ get: () => null, put() {}, remove() {} }) }, LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock() {}, releaseLock() {} }) } };
  vm.createContext(ctx); vm.runInContext(src, ctx, { filename: 'Code.js' });
  const lire = r => { const t = String(r && r.t != null ? r.t : r); let j = {}; try { j = JSON.parse(t); } catch (e) {} return { t, j }; };
  return { ctx, post: c => lire(ctx.doPost({ postData: { contents: JSON.stringify(c) }, parameter: {} })),
    get: q => lire(ctx.doGet({ parameter: q })), compte: e => ctx.loadUserData_(e) };
}
const fav = (i, k) => ({ name: 'fav-fictif-' + i + '-v' + k, kcal: 90 + i, prot: 3, carbs: 12, fat: 1, per100: { kcal: 90 + i, prot: 3, carbs: 12, fat: 1 }, q: 100, u: 'g', portionLabel: 'portion', portionWeightG: 125 });
const lot = k => Array.from({ length: 150 }, (_, i) => fav(i, k));
const repas = i => ({ id: 'rb-' + crypto.createHash('md5').update('rb' + i).digest('hex').slice(0, 20), date: '2026-09-' + String(1 + i % 28).padStart(2, '0'), meal: 'midi', name: 'repas-fictif-' + i, kcal: 200 + i, prot: 10, carbs: 20, fat: 5, q: 100, u: 'g', ts: 1758000000000 + i * 6e4 });
const canon = v => JSON.stringify((function tri(x) { if (Array.isArray(x)) return x.map(tri); if (x && typeof x === 'object') { const r = {}; Object.keys(x).sort().forEach(k => { r[k] = tri(x[k]); }); return r; } return x; })(v));
const zone = (c, nom) => ((((c || {}).recupNut || {})[nom]) || []);
const taille = (c, nom) => zone(c, nom).reduce((a, z) => a + JSON.stringify(z).length, 0);
let ok = 0, ko = 0; const t = (n, c, d) => { if (c) { ok++; console.log('  OK   ' + n); } else { ko++; console.log('  !!   ' + n + '   ' + (d || '')); } };

console.log('code de la prod = blob ' + BLOB_PROD + (process.env.CONTROLE ? ' — CONTRÔLE NÉGATIF « ' + process.env.CONTROLE + ' »' : '') + (BLOB_PROD.startsWith('8430bf87') ? ' (celui du déploiement @192, A1)' : ' (⚠️ PAS celui de @192)'));
const I = serveur(SRC_INTEG);
// 1 · Code d'INTÉGRATION : un compte protégé, 60 repas, 150 favoris ; puis panne Drive et deux lots → zone au-delà de sa borne
I.ctx.saveUserData_(BOB, { email: BOB, profile: { name: 'Bob', foodLog: Array.from({ length: 60 }, (_, i) => repas(i)), savedFoods: lot(0) }, prs: {}, sessions: [] });
const sel = crypto.randomBytes(8).toString('hex'); props['auth_' + BOB] = sel + '$' + I.ctx._sha256hex_(sel + '|' + CODE);
I.post({ action: 'saveProfile', email: BOB, authCode: CODE, savedFoods: lot(1) });
panne = true;
const r2 = I.post({ action: 'saveProfile', email: BOB, authCode: CODE, savedFoods: lot(2) });
const c1 = I.compte(BOB), ev = (((c1.recupNut || {}).evts) || []).slice(-1)[0] || {};
t('R0 · base : le code d\'intégration a accepté pendant la panne (« différé »), zone des favoris AU-DELÀ de la borne de 60 000',
  r2.j.status === 'ok' && ev.differe === 'drive' && taille(c1, 'savedFoods') > 60000, 'zone=' + taille(c1, 'savedFoods') + ' évt=' + JSON.stringify(ev).slice(0, 120));
const zoneAvant = canon(c1.recupNut), brutAvant = props['u_' + BOB].length;

// 2 · RETOUR ARRIÈRE : le code de la PROD relit et réécrit CE compte (même stockage)
const P = serveur(SRC_PROD);
const lp = P.post({ action: 'loadProfile', email: BOB, authCode: CODE });
t('R1 · la prod relit le compte (restauration) : statut ok, les 150 favoris actifs rendus TELS QUELS, la zone n\'apparaît PAS dans la réponse',
  lp.j.status === 'ok' && canon((lp.j.profile || {}).savedFoods) === canon(lot(2)) && !/recupNut|fav-fictif-\d+-v[01]\b/.test(lp.t), lp.t.slice(0, 160));
const r3 = P.post({ action: 'saveProfile', email: BOB, authCode: CODE, savedFoods: lot(3) });
const c2 = P.compte(BOB);
t('R2 · la prod RÉÉCRIT le compte (nouvelle liste) : liste active = l\'envoi, et la zone d\'avant est CONSERVÉE à l\'octet près (champ racine inconnu gardé)',
  r3.j.status === 'ok' && canon(c2.profile.savedFoods) === canon(lot(3)) && canon(c2.recupNut) === zoneAvant, 'zone gardée=' + (canon(c2.recupNut) === zoneAvant));
t('R3 · … et le journal alimentaire (60 repas) n\'a pas bougé', canon(c2.profile.foodLog) === canon(c1.profile.foodLog));
t('R4 · ⚠️ LIMITE DU RETOUR ARRIÈRE (attendue, celle de la prod d\'aujourd\'hui) : la version remplacée (lot 2) n\'est gardée NULLE PART par la prod',
  !zone(c2, 'savedFoods').some(z => canon(z.l) === canon(lot(2)[0])) && fichiers.length === 0, 'fichiers=' + fichiers.length);

// 3 · RE-DÉPLOIEMENT EN AVANT : le code d'intégration reprend ce compte, Drive revenu
panne = false; const I2 = serveur(SRC_INTEG);
const r4 = I2.post({ action: 'saveProfile', email: BOB, authCode: CODE, savedFoods: lot(4) });
const c3 = I2.compte(BOB);
const vus = new Set(); (c3.profile.savedFoods || []).forEach(f => vus.add(canon(f))); zone(c3, 'savedFoods').forEach(z => vus.add(canon(z.l)));
fichiers.forEach(f => { try { const o = JSON.parse(f.content); if (o.type === 'recupNut') (o.entrees || []).forEach(r => vus.add(canon(r.l))); } catch (e) {} });
const manquants = [0, 1, 3, 4].map(k => lot(k).filter(f => !vus.has(canon(f))).length);
t('R5 · redéployé en avant (Drive revenu) : le code d\'intégration reprend la zone laissée par la prod, le surplus déménage (relu), rien de ce qu\'il avait gardé n\'est perdu',
  r4.j.status === 'ok' && manquants.every(n => n === 0) && taille(c3, 'savedFoods') <= 60000 && fichiers.length >= 1, 'manquants lots 0/1/3/4=' + manquants.join('/') + ' zone=' + taille(c3, 'savedFoods') + ' fichiers=' + fichiers.length);
console.log('\n' + ok + ' OK / ' + ko + ' rouge');
process.exit(ko ? 1 : 0);
