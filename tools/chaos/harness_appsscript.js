/* ════════════════════════════════════════════════════════════════════════════════════════
   HARNAIS APPS SCRIPT — on fait tourner LE VRAI `Code.js`, pas une reecriture.

   ⭐⭐ C'EST LA DECISION CENTRALE DE TOUT LE BANC DE CHAOS. Reecrire la fusion d'Apps Script
   en JavaScript « fidele » aurait produit un banc qui valide MA REECRITURE, pas la
   production. Le projet a deja paye cette leçon (ft-v1222 : « un banc qui rejouerait ma
   reecriture de l'injecteur validerait ma reecriture »). On charge donc le fichier servi tel
   quel dans un contexte `vm`, on lui donne des doublures pour les services Google, et on
   appelle `handleSaveProfile_` — la vraie.

   ⛔ CE QU'ON DOUBLE, ET RIEN DE PLUS : les services Google (aucun n'existe en Node) et les
   deux portes de stockage `loadUserData_` / `saveUserData_`, remplacees par une memoire.
   ⛔ ON NE DOUBLE NI `_ps_` NI `_pn_` NI `_pa_` NI `_po_` NI LES GARDE-FOUS : ce sont eux
   qu'on mesure.

   ⚠️ CE QUE CE HARNAIS NE PROUVE PAS : il n'y a ni Sheet, ni quota, ni concurrence Google.
   Il mesure la SEMANTIQUE DE FUSION de `handleSaveProfile_`, pas le comportement de Google.
   ════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = path.resolve(__dirname, '..', '..');

function creer() {
  const proprietes = new Map();
  const journaux = [];
  const courriels = [];
  let base = Object.create(null);      // email -> donnees utilisateur

  const ctx = {
    console,
    JSON, Math, Date, String, Number, Boolean, Array, Object, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
    setTimeout, clearTimeout,

    Logger: { log: (m) => journaux.push(String(m)) },

    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k) => (proprietes.has(k) ? proprietes.get(k) : null),
        setProperty: (k, v) => { proprietes.set(k, String(v)); },
        deleteProperty: (k) => { proprietes.delete(k); },
        getProperties: () => Object.fromEntries(proprietes),
        getKeys: () => Array.from(proprietes.keys()),
      }),
    },

    Utilities: {
      getUuid: () => 'uuid-' + Math.random().toString(16).slice(2) + '-' + Date.now(),
      /* ⛔ Le hachage doit etre un VRAI SHA-256 : plusieurs garanties du projet reposent
         dessus (le registre de jetons est indexe par `sha256(jeton)`). Une doublure qui
         rendrait n'importe quoi ferait passer des tests d'identite pour de mauvaises
         raisons. */
      computeDigest: (_alg, s) => {
        const h = require('crypto').createHash('sha256').update(String(s), 'utf8').digest();
        return Array.from(h).map((b) => (b > 127 ? b - 256 : b));
      },
      DigestAlgorithm: { SHA_256: 'SHA_256' },
      /* ⚠️ `Utilities.Charset.UTF_8` est passe en 3e argument par `_sha256hex_` du fichier
         servi. Sans cette table, la doublure plantait — et c'est bien la PRODUCTION qui
         dictait ce qui manquait, pas ma memoire de l'API. */
      Charset: { UTF_8: 'UTF_8', US_ASCII: 'US_ASCII' },
      base64Encode: (s) => Buffer.from(String(s), 'utf8').toString('base64'),
      formatDate: (d) => new Date(d).toISOString(),
      sleep: () => {},
    },

    Session: { getScriptTimeZone: () => 'Europe/Paris' },
    MailApp: { sendEmail: (...a) => courriels.push(a) },
    SpreadsheetApp: { openById: () => { throw new Error('SpreadsheetApp non double'); } },
    DriveApp: { getFolderById: () => { throw new Error('DriveApp non double'); } },
    UrlFetchApp: { fetch: () => { throw new Error('UrlFetchApp non double'); } },
    ContentService: {
      createTextOutput: (t) => ({ _t: t, setMimeType() { return this; }, getContent() { return this._t; } }),
      MimeType: { JSON: 'JSON' },
    },
    CacheService: { getScriptCache: () => ({ get: () => null, put: () => {} }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
    ScriptApp: { getProjectTriggers: () => [], newTrigger: () => { throw new Error('non double'); } },
  };
  ctx.globalThis = ctx;

  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(RACINE, 'Code.js'), 'utf8'), ctx,
                  { filename: 'Code.js' });

  /* ── LES DEUX PORTES DE STOCKAGE, ET ELLES SEULES ─────────────────────────────────────
     ⚠️ On remplace APRES le chargement : les declarations de fonction du fichier servi sont
     deja en place, on les recouvre. Tout le reste de `handleSaveProfile_` reste le vrai. */
  ctx.loadUserData_ = (email) => {
    const d = base[String(email || '').toLowerCase()];
    return d ? JSON.parse(JSON.stringify(d)) : null;
  };
  ctx.saveUserData_ = (email, data) => {
    base[String(email || '').toLowerCase()] = JSON.parse(JSON.stringify(data));
    return true;
  };

  return {
    ctx,
    journaux,
    courriels,
    /** Ecrit par LA VRAIE fonction. Rend l'objet de reponse deja decode. */
    sauver(corps) {
      const r = ctx.handleSaveProfile_(corps);
      const txt = (r && typeof r.getContent === 'function') ? r.getContent() : String(r);
      try { return JSON.parse(txt); } catch (e) { return { brut: txt }; }
    },
    lire(email) { return ctx.loadUserData_(email); },
    poser(email, donnees) { ctx.saveUserData_(email, donnees); },
    vider() { base = Object.create(null); journaux.length = 0; },
    /** Pose un jeton dans le registre S1, par la VRAIE fonction du fichier servi. */
    poserJeton(email, libelle) { return ctx._jetonPoser_(email, libelle || 'appareil'); },
  };
}

module.exports = { creer };
