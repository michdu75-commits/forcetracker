#!/usr/bin/env node
/* FAUX GOOGLE LOCAL — NE SERT QU'À ÉPROUVER `recetteRestaurationP1` (p1/TestP1.js) AVANT DE LA DONNER À MICHEL. AUCUN RÉSEAU, AUCUNE DONNÉE RÉELLE.
   Le VRAI Code.js (feuille de production neutralisée EXACTEMENT comme le fait le workflow d'essai) et le VRAI TestP1.js sont chargés dans un même contexte `vm` — comme les deux fichiers d'un projet Apps Script —,
   avec des doublures en mémoire des seuls services de Google : propriétés de script, Drive (dossiers, fichiers), LockService, ScriptApp (déclencheurs), Utilities (gzip, base64, SHA-256 RÉELS : `_packUser_`
   et `_unpackUser_` du fichier servi tournent pour de bon), ContentService. Les DEUX portes de stockage (`loadUserData_` / `saveUserData_`) ne sont PAS remplacées : elles écrivent dans les propriétés doublées.
   ⚠️ CE QUE CE FAUX GOOGLE NE PROUVE PAS : le comportement de Google (quotas, latences, cohérence de Drive, autorisations). Il éprouve la LOGIQUE de la fonction et ses gardes ; le vrai Google, lui, se joue dans l'éditeur. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), zlib = require('zlib'), crypto = require('crypto');
const RACINE = path.resolve(__dirname, '..');
const NEUTRE = 'TEST-SANS-FEUILLE-DE-PRODUCTION';

const signes = (buf) => Array.from(buf, (b) => (b > 127 ? b - 256 : b));
const versBuf = (x) => (typeof x === 'string' ? Buffer.from(x, 'utf8') : Buffer.from(Array.from(x, (b) => b & 255)));
function blob(buf, type, nom) {
  const b = Buffer.from(buf);
  const o = { _buf: b, getBytes: () => signes(b), getDataAsString: () => b.toString('utf8'), getContentType: () => type || 'application/octet-stream', getName: () => nom || '', setName(n) { nom = n; return o; } };
  return o;
}
function formater(date, tz, fmt) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz === 'UTC' ? 'UTC' : tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    .formatToParts(new Date(date)).map((x) => [x.type, x.value]));
  let out = '', lit = false;
  for (let i = 0; i < fmt.length;) {
    if (fmt[i] === "'") { lit = !lit; i++; continue; }
    if (lit) { out += fmt[i++]; continue; }
    const t = [['yyyy', p.year], ['MM', p.month], ['dd', p.day], ['HH', p.hour], ['mm', p.minute], ['ss', p.second]].find(([k]) => fmt.startsWith(k, i));
    if (t) { out += t[1]; i += t[0].length; } else out += fmt[i++];
  }
  return out;
}

function creer(opts) {
  opts = opts || {};
  const props = new Map(), journaux = [], courriels = [], etat = { verrouOccupe: false, sommeils: 0, ecritures: [], limiteTotale: opts.limiteTotale || 0 };
  let seqId = 0; const nouvelId = (p) => p + String(++seqId).padStart(6, '0') + 'x'.repeat(20);
  const dossiers = new Map(), declencheurs = [];
  const iter = (liste) => { let i = 0; return { hasNext: () => i < liste.length, next: () => liste[i++] }; };
  function nouveauDossier(nom, parent) {
    const d = { id: nouvelId('D'), nom, parent: parent || null, corbeille: false, fichiers: [], sous: [] };
    dossiers.set(d.id, d);
    if (parent) parent.sous.push(d);
    const api = {
      _d: d, getId: () => d.id, getName: () => d.nom, isTrashed: () => d.corbeille, setTrashed(v) { d.corbeille = !!v; return api; },
      getFiles: () => iter(d.fichiers.filter((f) => !f.corbeille).map((f) => f.api)),
      getFilesByName: (n) => iter(d.fichiers.filter((f) => !f.corbeille && f.nom === n).map((f) => f.api)),
      getFolders: () => iter(d.sous.map((s) => s.api)),
      createFolder: (n) => nouveauDossier(n, d),
      createFile(nom2, contenu, mime) {
        const buf = typeof contenu === 'string' ? Buffer.from(contenu, 'utf8') : Buffer.from(contenu._buf || contenu);
        const f = { id: nouvelId('F'), nom: nom2, buf, mime: mime || 'text/plain', cree: new Date(), corbeille: false };
        f.api = { getId: () => f.id, getName: () => f.nom, getBlob: () => blob(f.buf, f.mime, f.nom), getDateCreated: () => f.cree, getSize: () => f.buf.length, isTrashed: () => f.corbeille, getMimeType: () => f.mime, setTrashed(v) { f.corbeille = !!v; return f.api; } };
        d.fichiers.push(f); etat.ecritures.push({ dossier: d.nom, dossierId: d.id, nom: nom2, taille: buf.length });
        return f.api;
      },
    };
    d.api = api; return api;
  }
  const quotaTotal = () => { let n = 0; props.forEach((v, k) => { n += k.length + v.length; }); return n; };
  const ctx = {
    console, JSON, Math, Date, String, Number, Boolean, Array, Object, RegExp, Error, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, setTimeout, clearTimeout,
    Logger: { log: (m) => journaux.push(String(m)) },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: (k) => (props.has(k) ? props.get(k) : null),
      setProperty: (k, v) => {
        if (opts.ecritureRefusee && opts.ecritureRefusee(k, 'set')) throw new Error('écriture refusée (essai de panne) : ' + k);
        const nv = String(v); const ancien = props.has(k) ? props.get(k).length + k.length : 0;
        if (etat.limiteTotale && quotaTotal() - ancien + k.length + nv.length > etat.limiteTotale) throw new Error('Limite de stockage des propriétés dépassée');
        props.set(k, nv);
      },
      deleteProperty: (k) => { if (opts.ecritureRefusee && opts.ecritureRefusee(k, 'delete')) return; props.delete(k); },
      getProperties: () => Object.fromEntries(props), getKeys: () => Array.from(props.keys()),
    }) },
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      computeDigest: (_a, s) => signes(crypto.createHash('sha256').update(versBuf(s)).digest()),
      DigestAlgorithm: { SHA_256: 'SHA_256' }, Charset: { UTF_8: 'UTF_8', US_ASCII: 'US_ASCII' },
      base64Encode: (x) => versBuf(x).toString('base64'), base64Decode: (s) => signes(Buffer.from(String(s), 'base64')),
      newBlob: (d, m, n) => blob(versBuf(d), m, n), gzip: (b) => blob(zlib.gzipSync(b._buf), 'application/x-gzip'), ungzip: (b) => blob(zlib.gunzipSync(b._buf)),
      formatDate: (d, tz, f) => formater(d, tz, f), sleep: () => { etat.sommeils++; },
    },
    Session: { getScriptTimeZone: () => 'Europe/Paris', getActiveUser: () => ({ getEmail: () => '' }), getEffectiveUser: () => ({ getEmail: () => '' }) },
    MailApp: { sendEmail: (...a) => courriels.push(a), getRemainingDailyQuota: () => 100 }, GmailApp: { sendEmail: (...a) => courriels.push(a) },
    SpreadsheetApp: { openById: () => { throw new Error('Unexpected error while getting the method or property openById on object SpreadsheetApp.'); } },
    UrlFetchApp: { fetch: () => { throw new Error('UrlFetchApp non double'); } },
    ContentService: { createTextOutput: (t) => ({ _t: t, setMimeType() { return this; }, getContent() { return this._t; } }), MimeType: { JSON: 'JSON' } },
    CacheService: { getScriptCache: () => ({ get: () => null, put: () => {}, remove: () => {} }) },
    LockService: { getScriptLock: () => ({ tryLock: () => !etat.verrouOccupe, releaseLock: () => {} }) },
    DriveApp: {
      getFolderById: (id) => { const d = dossiers.get(id); if (!d) throw new Error('Exception: Impossible de trouver l\'élément avec l\'ID : ' + id); return d.api; },
      getFoldersByName: (n) => iter(Array.from(dossiers.values()).filter((d) => d.nom === n && !d.corbeille).map((d) => d.api)),
      createFolder: (n) => nouveauDossier(n, null),
    },
    ScriptApp: {
      getProjectTriggers: () => declencheurs.slice(),
      deleteTrigger: (t) => { const i = declencheurs.indexOf(t); if (i >= 0) declencheurs.splice(i, 1); },
      newTrigger: (fn) => { const mk = () => { const t = { getHandlerFunction: () => fn, getEventType: () => 'CLOCK', getTriggerSource: () => 'CLOCK' }; return t; };
        const b = { timeBased: () => ({ after: () => ({ create: () => { const t = mk(); declencheurs.push(t); return t; } }), everyMinutes: () => ({ create: () => { const t = mk(); declencheurs.push(t); return t; } }), atHour: () => ({ everyDays: () => ({ create: () => { const t = mk(); declencheurs.push(t); return t; } }) }) }) }; return b; },
    },
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  const code = fs.readFileSync(path.join(RACINE, 'Code.js'), 'utf8').replace(/^var SHEET_ID_ = '[^']*';/m, "var SHEET_ID_ = '" + (opts.sheetId || NEUTRE) + "';");
  if (!opts.sheetId) { if ((code.match(/^var SHEET_ID_ = 'TEST-SANS-FEUILLE-DE-PRODUCTION';/gm) || []).length !== 1) throw new Error('la feuille de production n\'a pas été neutralisée (une seule ligne attendue)'); }
  vm.runInContext(code, ctx, { filename: 'Code.js' });
  vm.runInContext(fs.readFileSync(path.join(RACINE, 'p1', 'TestP1.js'), 'utf8'), ctx, { filename: 'TestP1.js' });
  return {
    ctx, props, journaux, courriels, etat, declencheurs, dossiers,
    nouveauDossier: (n) => nouveauDossier(n, null),
    ajouterDeclencheur: (fn) => { const t = { getHandlerFunction: () => fn, getEventType: () => 'CLOCK', getTriggerSource: () => 'CLOCK' }; declencheurs.push(t); return t; },
    /** écrit un compte par LA VRAIE fonction d'écriture du serveur */
    sauver(corps) { const r = ctx.handleSaveProfile_(corps); try { return JSON.parse(r.getContent()); } catch (e) { return { brut: String(r.getContent()) }; } },
    instantane() { return { props: JSON.stringify(Array.from(props.entries()).sort()), fichiers: etat.ecritures.length, declencheurs: declencheurs.length, dossiers: dossiers.size }; },
  };
}
module.exports = { creer, NEUTRE };
