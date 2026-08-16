/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
// Déploiement backend : fix .claspignore (worker.js/food-health.js/translations.js ne doivent PAS partir dans Apps Script — worker.js contient `export` → cassait clasp push depuis mi-juillet). Ce commit re-déclenche le déploiement des changements backend accumulés (ADN sportif @ft-v464 + dayStateLog @ft-v549).
// Rechute du MÊME piège le 30/07/2026 : tools/exercices-muscles.js (générateur de la carte des exercices, créé le jour même) n'était pas ignoré → clasp push KO (« Unexpected token ILLEGAL: tools/exercices-muscles.gs ») → le fix leanMass n'était pas parti. `tools/**` ajouté à .claspignore ; cette ligne force le re-push complet. RÈGLE : tout NOUVEAU fichier .js hors backend → .claspignore IMMÉDIATEMENT.
// ═══════════════════════════════════════════════════════════
// Force Tracker — Google Apps Script v3.5
// (re-sync clasp : projet backend = Code.js + appsscript.json uniquement)
// Colle ce code dans script.google.com, remplace tout,
// puis clique "Déployer > Nouveau déploiement" (web app,
// "Tout le monde" pour l'accès), et copie la nouvelle URL.
// ═══════════════════════════════════════════════════════════

// Script Properties utilisées :
//   ANTHROPIC_API_KEY  — clé API Claude
//   KOFI_TOKEN         — token de vérification webhook Ko-fi (optionnel)
//   PREMIUM_EMAILS     — emails whitelist gratuits, séparés par virgule (accès indéfini)
//   PREMIUM_CODES      — codes payants, séparés par virgule (accès indéfini)
//   prem_{email}       — JSON {expiry:"YYYY-MM-DD", tier:"trial"|"monthly"} (accès daté)

// ───────────────────────────────────────────────────────────
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function userKey_(email) {
  return 'u_' + (email || '').toLowerCase().trim();
}

// SÉCURITÉ : les tokens d'admin ne sont PLUS en dur dans le code (repo public).
// Ils vivent dans les Script Properties (ADMIN_TOKEN, IDEES_TOKEN, BACKUP_TOKEN).
// Fail-closed : si la propriété est absente/vide/trop courte, l'accès est REFUSÉ.
function _checkTok_(propName, given) {
  // .trim() des deux côtés : robuste aux espaces/retours à la ligne invisibles
  // collés par erreur dans la Script Property ou l'URL.
  var stored = (PropertiesService.getScriptProperties().getProperty(propName) || '').trim();
  var g = String(given == null ? '' : given).trim();
  return stored.length >= 12 && g === stored;
}

// SHA-256 hexadécimal (pour l'authentification par code perso — jamais le code en clair).
function _sha256hex_(s){
  var raw=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8);
  return raw.map(function(b){return ('0'+(b&0xff).toString(16)).slice(-2);}).join('');
}
// ─── Jeton des routes d'ADMINISTRATION (getIdees · getCustomEx · storeHealth · mailFails ·
// aiUsage · checkBackup). Le secret ne vit QUE dans les Script Properties.
//
// 🔴 CE QUI ÉTAIT FAUX AVANT (corrigé le 07/08/2026, faille trouvée le 04/08) — la version
// précédente vérifiait un HASH en dur, en croyant que « le token en clair n'est pas dans le
// repo public ». C'était FAUX : l'ancien jeton était écrit en clair dans `app.js`, à trois
// endroits — un fichier servi publiquement par GitHub Pages ET présent dans un dépôt public.
// Le hash côté serveur ne protégeait donc RIEN, puisque la clé était distribuée avec
// l'application. N'importe qui pouvait lire `?action=getIdees` → le NOM, l'E-MAIL et le
// MESSAGE de chaque testeur (jusqu'à 300 entrées).
// ⚠️ La leçon n'est pas « on a oublié » : c'est un défaut de conception. *Un secret distribué
// avec le client n'est pas un secret* — hacher ne change rien à ça. Et la note de sécurité de
// `CLAUDE.md` affirmait le contraire depuis le 12/07 : une note fausse est pire que pas de
// note, elle clôt la question.
//
// ⚠️ LE REPLI EST `false`, ET C'EST LE CŒUR DU CORRECTIF. Le réflexe habituel (« si la config
// manque, on laisse passer ») transformerait une propriété effacée en porte grande ouverte —
// exactement le problème qu'on répare. Pas de propriété = route FERMÉE.
function _checkIdeesTok_(given){
  var want = PropertiesService.getScriptProperties().getProperty('IDEES_TOKEN2');
  if (!want || String(want).length < 12) return false;   // absente ou trop courte → fermé
  return String(given == null ? '' : given).trim() === String(want).trim();
}
// ─── Protection opt-in par code perso ─────────────────────────────────────────
// INVARIANT ABSOLU : un compte SANS 'auth_{email}' se comporte EXACTEMENT comme
// avant (aucun impact sur les utilisateurs actuels). Un compte AVEC un code activé
// exige le bon code pour lire/écrire ses données. Stockage : 'salt$hash' (jamais le code).
function _authCheck_(email, code){
  try{
    var stored=PropertiesService.getScriptProperties().getProperty('auth_'+email)||'';
    if(stored.length<20) return {ok:true, opted:false};           // pas de code → accès libre (comportement actuel)
    var sep=stored.indexOf('$');
    var salt=sep>0?stored.slice(0,sep):'', hash=sep>0?stored.slice(sep+1):'';
    if(_sha256hex_(salt+'|'+String(code==null?'':code))===hash) return {ok:true, opted:true};
    var blocked=_dailyCounterBlock_('authfail_'+email, 20);       // anti-brute-force : 20 essais ratés/jour/compte
    return {ok:false, opted:true, blocked:blocked};
  }catch(e){ return {ok:true, opted:false}; }                     // fail-open : un bug ne bloque jamais un vrai utilisateur
}

// ─── LECTURE STRICTE : un compte SANS code perso n'est plus téléchargeable (07/08/2026) ────
// 🔴 LA FAILLE : `?action=loadProfile&email=UNE_ADRESSE` renvoyait le compte ENTIER — profil,
// séances, poids, mensurations, mémoire de Milo, et les données de SANTÉ (bilans sanguins,
// bilans corporels, cycle menstruel). Sans jeton, sans mot de passe. Et six adresses réelles
// sont écrites en clair dans le dépôt PUBLIC : il n'y avait même pas à deviner.
// Mesuré le 07/08 : 4 comptes sur 5 étaient ouverts.
//
// ⚠️ POURQUOI SEULEMENT LA LECTURE, ET PAS L'ÉCRITURE. La fuite, c'est la lecture. Fermer aussi
// l'écriture arrêterait la sauvegarde des séances de gens qui n'ont encore rien demandé — et la
// règle d'or n°3 dit « zéro perte de séance, priorité n°1 absolue ». On ferme donc ce qui fuit,
// on garde ce qui protège. Une fois le code posé, les DEUX sens sont verrouillés (_authCheck_).
//
// ⚠️ ET ON NE PEUT PAS S'ENFERMER DEHORS : `setAccessCode` et `sendConfirmCode` ne passent PAS
// par cette vérification (constaté avant d'écrire une ligne). Poser son code reste donc possible
// alors même que la lecture est fermée — sinon on protégerait les données en les rendant
// inaccessibles à leur propriétaire, ce qui n'est pas protéger.
//
// 🔧 SOUPAPE : la Script Property `LECTURE_STRICTE` = 'off' rouvre tout, sans redéployer.
// Absente = fermé (repli sûr). Voir ouvrirLectureTemporairement() / refermerLecture().
function _lectureAutorisee_(email, code){
  var a = _authCheck_(email, code);
  if (!a.ok) return a;                       // code posé mais faux → refus (inchangé)
  if (a.opted) return a;                     // code posé et bon → OK
  try {
    if (PropertiesService.getScriptProperties().getProperty('LECTURE_STRICTE') === 'off')
      return a;                              // soupape ouverte : ancien comportement
  } catch(e) {}
  // Pas de code du tout → on ne sert plus le compte. `needsCode` permet à l'app de dire la
  // bonne chose (« protège ton compte ») au lieu de réclamer un code qui n'existe pas.
  return {ok:false, opted:false, needsCode:true, blocked:false};
}

// SÉCURITÉ Sheets : neutralise l'injection de formule (CSV injection). Une chaîne
// qui commence par = + - @ (ou une tabulation) est exécutée comme formule quand on
// ouvre le Sheet → on la préfixe d'une apostrophe (invisible, affichage identique).
function _safeCell_(v) {
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(v)) return "'" + v;
  return v;
}
function _safeRow_(arr) { return (arr || []).map(_safeCell_); }

// ── Compression des comptes (31/07/2026 — le réservoir Script Properties était PLEIN à 102 % :
// plus AUCUNE écriture n'aboutissait depuis le 29/07 — sync de Christophe figée, boîte à idées
// muette, mails morts). Les données d'un compte sont stockées gzip+base64 sous le préfixe 'GZ:'
// (≈ 5× plus petit). TOUT lecteur passe par _unpackUser_ ; TOUT écrivain par _packUser_.
// Un compte ancien non compressé reste lisible tel quel (rétrocompatible) et se compresse à sa
// prochaine sauvegarde. _packUser_ s'AUTO-VÉRIFIE : le paquet n'est rendu que s'il se relit à
// l'identique — sinon on garde le JSON en clair (jamais de compte illisible, quoi qu'il arrive).
function _packUser_(json) {
  try {
    var gz = 'GZ:' + Utilities.base64Encode(Utilities.gzip(Utilities.newBlob(json, 'application/octet-stream')).getBytes());
    if (gz.length < json.length && _unpackUser_(gz) === json) return gz;
  } catch(e) {}
  return json;
}
function _unpackUser_(raw) {
  if (!raw) return null;
  if (raw.slice(0, 3) === 'GZ:') {
    try {
      return Utilities.ungzip(Utilities.newBlob(Utilities.base64Decode(raw.slice(3)), 'application/x-gzip')).getDataAsString();
    } catch(e) { return null; }
  }
  return raw;
}

function loadUserData_(email) {
  const raw = _unpackUser_(PropertiesService.getScriptProperties().getProperty(userKey_(email)));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch(e) { return null; }
}

function saveUserData_(email, data) {
  PropertiesService.getScriptProperties().setProperty(userKey_(email), _packUser_(JSON.stringify(data)));
}

// ─── Mirror Sheets — best-effort, jamais bloquant ───────────
function _mirrorUserToSheet_(email, data) {
  try {
    const ss = _getSheet_();
    let sheet = ss.getSheetByName('Utilisateurs');
    if (!sheet) {
      sheet = ss.insertSheet('Utilisateurs');
      const hdrRange = sheet.getRange(1, 1, 1, 11);
      hdrRange.setValues([['email','nom','genre','age_ans','taille_cm','poids_kg','objectif','activite','premium','nb_seances','derniere_sync']]);
      hdrRange.setFontWeight('bold').setBackground('#f3f3f3');
    }
    const p = data.profile || {};
    const prem = getPremiumStatus_(email);
    const premLabel = prem.premium ? (prem.expiry ? 'premium→' + prem.expiry : 'lifetime') : 'gratuit';
    const row = [
      email,
      p.name          || '',
      p.gender        || '',
      p.age           || '',
      p.height        || '',
      p.bw            || '',
      p.goal          || '',
      p.activityLevel || '',
      premLabel,
      (data.sessions  || []).length,
      new Date().toISOString()
    ];
    // UPSERT : chercher la ligne existante par email (colonne 1)
    const allVals = sheet.getDataRange().getValues();
    let rowIdx = -1;
    for (let i = 1; i < allVals.length; i++) {
      if (String(allVals[i][0]).toLowerCase() === email) { rowIdx = i + 1; break; }
    }
    if (rowIdx > 0) {
      sheet.getRange(rowIdx, 1, 1, row.length).setValues([_safeRow_(row)]);
    } else {
      sheet.appendRow(_safeRow_(row));
    }
  } catch(e) {} // Silencieux — jamais bloquant
}

function loadPremiumData_(email) {
  const raw = PropertiesService.getScriptProperties().getProperty('prem_' + email);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch(e) { return null; }
}

function savePremiumData_(email, data) {
  PropertiesService.getScriptProperties().setProperty('prem_' + email, JSON.stringify(data));
}

function todayStr_() {
  return new Date().toISOString().split('T')[0];
}

var SHEET_ID_ = '1b0kuCk6kuNi26hMJq5Q5R6-mKFeXEexfm2P9SryJ-eg';
function _getSheet_() { return SpreadsheetApp.openById(SHEET_ID_); }

// Liste premium codée en dur — indépendante des Script Properties
// (résiste à tout trigger/init qui écraserait PREMIUM_EMAILS)
const PREMIUM_HARDCODED_ = [
  'michdu75@gmail.com',
  'elineazs32@gmail.com',
  'christophe@famillelanglois.fr',
  'emma.david16@gmail.com',
  'tanna.valery.studio@gmail.com'
];

// Calcule le statut premium d'un email — retourne {premium, expiry}
function getPremiumStatus_(email) {
  const props = PropertiesService.getScriptProperties();

  // 0. Liste codée en dur (toujours prioritaire)
  if (PREMIUM_HARDCODED_.includes(email)) {
    Logger.log('[FT premium] email=' + email + ' | source=HARDCODED | match=true');
    return { premium: true, expiry: null };
  }

  // 1. Whitelist Script Property PREMIUM_EMAILS
  const rawList = props.getProperty('PREMIUM_EMAILS') || '';
  const whitelist = rawList.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const match = whitelist.includes(email);
  Logger.log('[FT premium] email=' + email + ' | source=PREMIUM_EMAILS | raw="' + rawList + '" | match=' + match);
  if (match) {
    return { premium: true, expiry: null };
  }

  // 2. Accès daté (prem_{email})
  const prem = loadPremiumData_(email);
  if (prem && prem.expiry && prem.expiry >= todayStr_()) {
    return { premium: true, expiry: prem.expiry };
  }

  return { premium: false, expiry: null };
}

// ───────────────────────────────────────────────────────────
function doGet(e) {
  const p = e.parameter || {};

  // One-shot backup avant migration set-tags — s'exécute une seule fois
  const _bProps = PropertiesService.getScriptProperties();
  if (!_bProps.getProperty('backup_set_tags_2026_06_29')) {
    try { backupAllUserData_(); } catch(_e) { Logger.log('backup err: ' + _e); }
    _bProps.setProperty('backup_set_tags_2026_06_29', new Date().toISOString());
  }

  // One-shot purge des triggers installables (fantôme PREMIUM_EMAILS)
  // Nécessite le scope script.scriptapp — si non autorisé, échoue silencieusement (jamais bloquant)
  try {
    const _purgeFlag = _bProps.getProperty('triggers_purged_20260630');
    if (!_purgeFlag) {
      try {
        const allTriggers = ScriptApp.getProjectTriggers();
        const trigLog = allTriggers.map(t => t.getHandlerFunction() + '/' + t.getEventType()).join(', ');
        // Ne pas supprimer le trigger backup quotidien (backupAllUserData_, 2 h du
        // matin) : c'est LE filet de sécurité des données de tous les utilisateurs
        // (sauvegarde JSON quotidienne sur Drive). Sans lui, plus aucun backup et
        // personne ne s'en aperçoit — la purge ci-dessous efface tous les AUTRES.
        allTriggers.forEach(t => {
          if (t.getHandlerFunction() !== 'backupAllUserData_') ScriptApp.deleteTrigger(t);
        });
        Logger.log('[FT cleanup] Triggers supprimés : ' + trigLog);
        _bProps.setProperty('triggers_purged_20260630', new Date().toISOString());
        _bProps.setProperty('triggers_purged_log', trigLog || 'AUCUN');
      } catch(err) {
        Logger.log('[FT cleanup] Scope non autorisé, purge ignorée : ' + err);
        _bProps.setProperty('triggers_purged_20260630', 'skipped_auth');
      }
    }
  } catch(_) {} // Double filet — ne jamais bloquer la réponse GET

  if (p.test) {
    return json_({status:'online', version:'3.5'});
  }

  // Debug premium — ?debugPremium=1&email=xxx@xxx.com
  if (p.debugPremium && p.email) {
    const props2 = PropertiesService.getScriptProperties();
    const rawList = props2.getProperty('PREMIUM_EMAILS') || '';
    const whitelist = rawList.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const emailQ = (p.email || '').toLowerCase().trim();
    const matchProp = whitelist.includes(emailQ);
    const matchHard = PREMIUM_HARDCODED_.includes(emailQ);
    // Triggers installables (peuvent écraser des properties)
    let triggers = [];
    try {
      triggers = ScriptApp.getProjectTriggers().map(t => ({
        fn: t.getHandlerFunction(),
        type: t.getEventType().toString(),
        src: t.getTriggerSource().toString()
      }));
    } catch(_) {}
    Logger.log('[FT debugPremium] email=' + emailQ + ' | raw="' + rawList + '" | matchProp=' + matchProp + ' | matchHard=' + matchHard);
    // Liste complète = hardcodé + propriété, sans doublons
    const fullList = Array.from(new Set([...PREMIUM_HARDCODED_, ...whitelist]));
    return json_({
      debugPremium: true,
      emailQueried: emailQ,
      rawPremiumEmails: rawList,
      parsedWhitelist: whitelist,
      whitelistCount: whitelist.length,
      matchProperty: matchProp,
      matchHardcoded: matchHard,
      premiumResult: matchProp || matchHard,
      hardcodedList: PREMIUM_HARDCODED_,
      fullPremiumList: fullList,
      fullPremiumCount: fullList.length,
      projectTriggers: triggers,
      triggerPurgeLog: _bProps.getProperty('triggers_purged_log') || 'pas encore purgé',
      triggerPurgedAt: _bProps.getProperty('triggers_purged_20260630') || null
    });
  }

  // Installation trigger backup quotidien — ouvrir l'URL dans le navigateur une seule fois
  // ?action=installDailyBackup&t=FT_BACKUP_INIT_2026
  if (p.action === 'installDailyBackup' && _checkTok_('BACKUP_TOKEN', p.t)) {
    try {
      installDailyBackupTrigger_();
      try { backupAllUserData_(); } catch(be) { Logger.log('[FT backup init] ' + be); }
      const cnt = ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'backupAllUserData_').length;
      const folder = _getDriveBackupFolder_();
      return json_({status:'ok', msg:'Trigger dailyBackup installé — ' + cnt + ' trigger(s) actif(s)', firstBackupDone:true, folderId:folder.getId()});
    } catch(err) { return json_({status:'error', error:err.message}); }
  }

  // Migration onglets Sheet → Drive — ?action=migrateBackups&t=FT_BACKUP_INIT_2026
  if (p.action === 'migrateBackups' && _checkTok_('BACKUP_TOKEN', p.t)) {
    try {
      const result = migrateSheetBackupsToDrive_();
      const folder = _getDriveBackupFolder_();
      return json_({status:'ok', folderId:folder.getId(), folderName:'ForceTracker-Backups', ...result});
    } catch(err) { return json_({status:'error', error:err.message}); }
  }

  // Vérification état backup Drive — ?action=checkBackup&token=<BACKUP_TOKEN>
  if (p.action === 'checkBackup') {
    // Accepte AUSSI le jeton des idées (hash en dur, fiable) : `BACKUP_TOKEN` est une Script
    // Property, et sur ce projet elles ne persistent pas (c'est exactement pourquoi IDEES_TOKEN
    // a dû passer en hash codé en dur, @auto 2026-07-12). Sans ça la sonde des sauvegardes est
    // inutilisable — donc jamais consultée. L'ancien jeton reste accepté (rétrocompatible).
    if (!_checkTok_('BACKUP_TOKEN', p.token) && !_checkIdeesTok_(p.token))
      return json_({status:'error', error:'unauthorized'});
    try {
      const cnt = ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'backupAllUserData_').length;
      const folder = _getDriveBackupFolder_();
      // ⚠️ ON TRIE PAR DATE RÉELLE, PLUS JAMAIS PAR NOM (05/08/2026).
      // Le tri alphabétique plaçait `backup-MIGRATION-2026-06-29-2003.json` APRÈS
      // `backup-2026-08-05....json` — parce que « m » vient après « 2 ». Le fichier de
      // migration du 29 juin était donc annoncé comme « le plus récent » POUR TOUJOURS,
      // et le voyant serait resté ROUGE même avec des sauvegardes parfaites.
      // C'est le pire défaut possible pour une alarme : à force de crier pour rien, on
      // apprend à l'ignorer — et c'est exactement ce qui a coûté 36 jours sans sauvegarde.
      // 👉 Un nom de fichier n'est pas une date. On demande sa date à Drive.
      const infos = [];
      const iter = folder.getFiles();
      while (iter.hasNext()) { const f = iter.next(); infos.push({n:f.getName(), d:f.getDateCreated().getTime()}); }
      infos.sort((a,b) => a.d - b.d);
      const files = infos.map(x => x.n);
      const dernier = infos.length ? infos[infos.length-1] : null;
      return json_({status:'ok', triggersInstalled:cnt, driveFolder:'ForceTracker-Backups',
        folderId:folder.getId(), fileCount:files.length, lastFiles:files.slice(-5),
        // Date du plus récent, donnée explicitement : l'app n'a plus à la deviner d'après un nom.
        lastDate: dernier ? new Date(dernier.d).toISOString() : null,
        lastName: dernier ? dernier.n : null});
    } catch(err) { return json_({status:'error', error:err.message}); }
  }

  // Lecture des idées des testeurs (boîte à idées) — ?action=getIdees&token=…
  if (p.action === 'getIdees') {
    if (!_checkIdeesTok_(p.token)) return json_({status:'error', error:'token'});
    let arr = [];
    try { arr = JSON.parse(PropertiesService.getScriptProperties().getProperty('TESTER_IDEAS') || '[]'); } catch(e2) { arr = []; }
    return json_({status:'ok', count: arr.length, ideas: arr});
  }

  // Exercices perso créés par les utilisateurs — ?action=getCustomEx&token=…
  // Michel, 02/08 : « je ne vais jamais dans Google Sheet ». La remontée existait depuis
  // longtemps, mais dans un onglet qu'il n'ouvre pas — donc elle n'existait pas en pratique.
  // Cette route la ramène DANS l'app (onglet Admin), à côté de la boîte à idées.
  if (p.action === 'getCustomEx') {
    if (!_checkIdeesTok_(p.token)) return json_({status:'error', error:'token'});
    try {
      const sh = _getSheet_().getSheetByName('Exercices manquants');
      if (!sh) return json_({status:'ok', count:0, exercices:[]});
      const data = sh.getDataRange().getValues();
      const out = [];
      for (let i = 1; i < data.length; i++) {
        const r = data[i];
        if (!r[0]) continue;
        out.push({name:r[0], group:r[1]||'', count:+(r[2]||1),
                  first:_dstr_(r[4]), last:_dstr_(r[5]),
                  musclesP:r[6]||'', musclesS:r[7]||''});
      }
      // les plus DEMANDÉS en premier, puis les plus récents : c'est l'ordre de décision
      out.sort(function(a,b){ return (b.count-a.count) || String(b.last).localeCompare(String(a.last)); });
      return json_({status:'ok', count: out.length, exercices: out});
    } catch(e2) { return json_({status:'error', error:String(e2 && e2.message || e2)}); }
  }

  // Santé du stockage (diagnostic 31/07 : plus AUCUNE écriture depuis le 29/07 — boîte à idées
  // figée, MAIL_FAILS vide malgré les échecs. Suspect : la limite Google de 500 Ko TOTAL sur les
  // Script Properties, où vivent les comptes. Cette sonde mesure le remplissage ET tente une
  // écriture réelle pour lire l'erreur exacte.) — ?action=storeHealth&token=…
  if (p.action === 'storeHealth') {
    if (!_checkIdeesTok_(p.token)) return json_({status:'error', error:'token'});
    var shp = PropertiesService.getScriptProperties();
    var shKeys = shp.getKeys();
    var shTot = 0, shItems = [];
    for (var shI = 0; shI < shKeys.length; shI++) {
      var shV = shp.getProperty(shKeys[shI]) || '';
      shTot += shKeys[shI].length + shV.length;
      shItems.push({ cle: shKeys[shI], octets: shV.length });
    }
    shItems.sort(function(a, b){ return b.octets - a.octets; });
    var shWrite = 'ok';
    try { shp.setProperty('PING_DIAG', new Date().toISOString()); }
    catch(eW) { shWrite = 'ECHEC: ' + eW.message; }
    // Refus de rétrécissement d'historique (garde-fou sessions, 02/08) : une alerte qui ne
    // remonte nulle part ne sert à personne — c'est la leçon de la panne du 29/07.
    var shShrink = [];
    try { shShrink = JSON.parse(shp.getProperty('HIST_SHRINK') || '[]'); } catch(eS) {}
    return json_({status:'ok', nbCles: shKeys.length, totalOctets: shTot,
                  limiteOctets: 512000, pourcentPlein: Math.round(shTot / 5120),
                  testEcriture: shWrite, plusGrosses: shItems.slice(0, 15),
                  histRefus: shShrink.slice(0, 10)});
  }

  // Migration one-shot (31/07) : compresse tous les comptes déjà stockés + supprime le compte
  // de test michdu75+test (décision Michel). Chaque compte n'est réécrit que si le paquet
  // compressé se relit à l'identique (vérification AVANT écriture). — ?action=compressStore&token=…
  if (p.action === 'compressStore') {
    if (!_checkIdeesTok_(p.token)) return json_({status:'error', error:'token'});
    var csp = PropertiesService.getScriptProperties();
    var csDeleted = false;
    if (csp.getProperty('u_michdu75+test@gmail.com') != null) { csp.deleteProperty('u_michdu75+test@gmail.com'); csDeleted = true; }
    try { csp.deleteProperty('PING_DIAG'); } catch(eD) {}
    var csKeys = csp.getKeys().filter(function(k){ return k.indexOf('u_') === 0; });
    var csBefore = 0, csAfter = 0, csDone = 0, csDeja = 0, csVerifKo = 0;
    csKeys.forEach(function(k){
      var raw = csp.getProperty(k) || '';
      csBefore += raw.length;
      if (raw.slice(0, 3) === 'GZ:') { csDeja++; csAfter += raw.length; return; }
      var packed = _packUser_(raw);
      if (packed !== raw && _unpackUser_(packed) === raw) { csp.setProperty(k, packed); csDone++; csAfter += packed.length; }
      else { if (packed !== raw) csVerifKo++; csAfter += raw.length; }
    });
    return json_({status:'ok', comptes: csKeys.length, compresses: csDone, dejaCompresses: csDeja,
                  verifEchouee: csVerifKo, testSupprime: csDeleted, avantOctets: csBefore, apresOctets: csAfter});
  }

  // Échecs d'envoi de mail (diagnostic panne silencieuse) — ?action=mailFails&token=…
  if (p.action === 'mailFails') {
    if (!_checkIdeesTok_(p.token)) return json_({status:'error', error:'token'});
    var mf = [];
    try { mf = JSON.parse(PropertiesService.getScriptProperties().getProperty('MAIL_FAILS') || '[]'); } catch(e2) { mf = []; }
    var quotaMail = null;
    try { quotaMail = MailApp.getRemainingDailyQuota(); } catch(e3) {}
    return json_({status:'ok', count: mf.length, fails: mf, quotaMailRestant: quotaMail});
  }

  // Consommation IA du jour (garde-fou coût) — ?action=aiUsage&token=…
  if (p.action === 'aiUsage') {
    if (!_checkIdeesTok_(p.token)) return json_({status:'error', error:'token'});
    var sp = PropertiesService.getScriptProperties();
    var q = {};
    try { q = JSON.parse(sp.getProperty('ai_quota') || '{}'); } catch(e2) { q = {}; }
    var byEmail = q.byEmail || {};
    var top = Object.keys(byEmail).map(function(k){ return {email:k, count:byEmail[k]}; })
                    .sort(function(a,b){ return b.count - a.count; }).slice(0, 30);
    var _seen = String(sp.getProperty('AI_CAP_SEEN') || '').split('|');
    return json_({
      status: 'ok',
      capArmed: _seen[0] === 'armed',
      capSeenAt: _seen[1] || null,
      capKnown: !!_seen[0],
      date: q.date || null,
      global: q.global || 0,
      globalMax: parseInt(sp.getProperty('AI_GLOBAL_MAX'), 10) || 1500,
      emailMax: parseInt(sp.getProperty('AI_EMAIL_MAX'), 10) || 100,
      uniqueUsers: Object.keys(byEmail).length,
      topUsers: top
    });
  }

  // Test garde-fou universel — ?action=testGardeFou
  if (p.action === 'testGardeFou') {
    try {
      const te = 'ft_gf_' + Date.now() + '@test.internal';
      saveUserData_(te, {email:te, profile:{name:'TestGardeFou', age:35, bw:80, goal:'muscle'},
        sessions:[{id:'t1', date:'2026-07-02'}], prs:{'Squat':{rm1:100, kg:80, reps:6}}, programmes:[]});
      // Push vide — doit être refusé
      handleSaveProfile_({email:te, name:'', age:0, bw:0, goal:'', sessions:[], prs:{}, badges:{}});
      const after = loadUserData_(te);
      PropertiesService.getScriptProperties().deleteProperty(userKey_(te)); // cleanup
      const ok = after.profile.name === 'TestGardeFou'
               && (after.sessions||[]).length === 1
               && Object.keys(after.prs||{}).length === 1
               && after.profile.age === 35
               && after.profile.bw === 80
               && after.profile.goal === 'muscle';
      return json_({
        status: ok ? 'ok' : 'FAILED',
        gardeFouUniversel: ok,
        details: {
          name: after.profile.name, age: after.profile.age, bw: after.profile.bw,
          goal: after.profile.goal, sessions: (after.sessions||[]).length,
          prs: Object.keys(after.prs||{}).length
        }
      });
    } catch(err) { return json_({status:'error', error:err.message}); }
  }

  // Déverrouillage admin (dernier recours) : retire le code perso d'un compte si
  // un utilisateur est vraiment coincé. Protégé par ADMIN_TOKEN (Script Property).
  // ?action=adminUnlockAuth&email=...&token=<ADMIN_TOKEN>
  if (p.action === 'adminUnlockAuth') {
    if (!_checkTok_('ADMIN_TOKEN', p.token)) return json_({status:'error', error:'unauthorized'});
    var _e = (p.email || '').toLowerCase().trim();
    if (!_e) return json_({status:'error', error:'email'});
    PropertiesService.getScriptProperties().deleteProperty('auth_' + _e);
    return json_({status:'ok', unlocked:_e});
  }

  // « Ce compte est-il protégé ? » en LECTURE SIMPLE — ?action=authStatus&email=…
  // ⚠️ Ouvert exprès en GET (07/08/2026, demande de Michel : un lien par personne pour vérifier
  // qui est encore exposé). Ne renvoie QUE deux booléens : aucune donnée personnelle, aucun
  // secret, et surtout PAS le code. La même route existe déjà en POST sans jeton depuis ft-v757 :
  // ouvrir le GET n'expose donc rien de plus, ça évite juste de devoir bricoler une requête.
  // ⚠️ Et c'est précisément pour ÉVITER d'utiliser `loadProfile` pour cette question : celui-là
  // déverserait le compte entier (bilans sanguins compris) dans le navigateur, pour lire un
  // oui/non. *On ne regarde pas la vie de quelqu'un pour savoir s'il a mis un mot de passe.*
  // `light:true` forcé : on ne décompresse pas le compte pour lire un booléen (piège du 04/08,
  // 4 comptes sur 5 en « non vérifié » parce que la requête n'aboutissait pas sur les gros).
  if (p.action === 'authStatus' && p.email) {
    return handleAuthStatus_({email: p.email, light: true});
  }

  if (p.action === 'loadProfile' && p.email) {
    const email = (p.email || '').toLowerCase().trim();
    const _a = _lectureAutorisee_(email, p.authCode);
    if (!_a.ok) return json_({status:'error', error:'auth', blocked:_a.blocked, needsCode:!!_a.needsCode});
    const data = loadUserData_(email);
    const prem = getPremiumStatus_(email);
    if (!data) return json_({status:'not_found', premium: prem.premium, premiumExpiry: prem.expiry});
    return json_({
      status:         'ok',
      premium:        prem.premium,
      premiumExpiry:  prem.expiry,
      profile:        data.profile        || {},
      prs:            data.prs            || {},
      sessions:       data.sessions       || [],
      weightLog:      data.weightLog      || [],
      sleepLog:       data.sleepLog       || [],
      dayStateLog:    data.dayStateLog    || [],
      cycle:          data.cycle          || null,
      nutritionPhase: data.nutritionPhase || 'charge',
      coachMemory:    (data.profile && data.profile.coachMemory) || '',
      healthInbox:    data.healthInbox    || []
    });
  }

  return json_({status:'error', error:'Unknown GET action'});
}

function handleLoadProfilePost_(body) {
  const email = (body.email || '').toLowerCase().trim();
  if (!email) return json_({status:'error', error:'email required'});
  const _a = _lectureAutorisee_(email, body.authCode);
  if (!_a.ok) return json_({status:'error', error:'auth', blocked:_a.blocked, needsCode:!!_a.needsCode});
  const data = loadUserData_(email);
  const prem = getPremiumStatus_(email);
  if (!data) return json_({status:'not_found', premium: prem.premium, premiumExpiry: prem.expiry});
  return json_({
    status:         'ok',
    premium:        prem.premium,
    premiumExpiry:  prem.expiry,
    profile:        data.profile        || {},
    prs:            data.prs            || {},
    sessions:       data.sessions       || [],
    weightLog:      data.weightLog      || [],
    sleepLog:       data.sleepLog       || [],
    dayStateLog:    data.dayStateLog    || [],
    cycle:          data.cycle          || null,
    programmes:     data.programmes     || [],
    exRestPref:     data.exRestPref     || {},
    nutritionPhase: data.nutritionPhase || 'charge',
    coachMemory:    (data.profile && data.profile.coachMemory) || '',
    healthInbox:    data.healthInbox    || []
  });
}

// Safeguard permanent : s'assure que PREMIUM_HARDCODED_ est toujours dans PREMIUM_EMAILS
function ensurePremiumEmails_() {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty('PREMIUM_EMAILS') || '';
  const existing = raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const missing = PREMIUM_HARDCODED_.filter(e => !existing.includes(e));
  if (missing.length > 0) {
    const merged = Array.from(new Set([...PREMIUM_HARDCODED_, ...existing]));
    props.setProperty('PREMIUM_EMAILS', merged.join(','));
    Logger.log('[FT safeguard] PREMIUM_EMAILS corrigé : ' + merged.join(','));
  }
}

// ── Garde-fou coût IA : compteurs journaliers d'appels IA (1 propriété JSON,
// remise à zéro automatique chaque jour). Limites réglables via Script Properties
// AI_GLOBAL_MAX / AI_EMAIL_MAX (sans redéploiement). Fail-open : en cas d'erreur,
// on ne bloque JAMAIS un vrai utilisateur.
function _aiQuotaBlock_(email) {
  try {
    var sp = PropertiesService.getScriptProperties();
    var GLOBAL_MAX = parseInt(sp.getProperty('AI_GLOBAL_MAX'), 10) || 600; // total / jour (baissé de 1500 : borne le coût en cas d'abus)
    var EMAIL_MAX  = parseInt(sp.getProperty('AI_EMAIL_MAX'), 10)  || 50;  // / jour / email (baissé de 100 : l'email est usurpable)
    var tz = Session.getScriptTimeZone() || 'Europe/Paris';
    var today = Utilities.formatDate(new Date(), tz, 'yyyyMMdd');
    var raw = sp.getProperty('ai_quota');
    var q = raw ? JSON.parse(raw) : null;
    if (!q || q.date !== today) q = { date: today, global: 0, byEmail: {} };
    var e = (email || 'anon').toString().toLowerCase().trim() || 'anon';
    var ec = q.byEmail[e] || 0;
    if (q.global >= GLOBAL_MAX) return { blocked: true, scope: 'global' };
    if (ec >= EMAIL_MAX)        return { blocked: true, scope: 'email' };
    q.global++;
    q.byEmail[e] = ec + 1;
    sp.setProperty('ai_quota', JSON.stringify(q));
    return { blocked: false };
  } catch (err) {
    return { blocked: false };
  }
}

// Compteur journalier générique (1 propriété JSON, remise à zéro chaque jour).
// Sert à plafonner des endpoints sensibles sans IA (envoi d'emails, essais de codes).
// Fail-open : en cas d'erreur, on ne bloque JAMAIS (dispo > strictness).
function _dailyCounterBlock_(propKey, max) {
  try {
    var sp = PropertiesService.getScriptProperties();
    var tz = Session.getScriptTimeZone() || 'Europe/Paris';
    var today = Utilities.formatDate(new Date(), tz, 'yyyyMMdd');
    var raw = sp.getProperty(propKey);
    var q = raw ? JSON.parse(raw) : null;
    if (!q || q.date !== today) q = { date: today, count: 0 };
    if (q.count >= max) return true;
    q.count++;
    sp.setProperty(propKey, JSON.stringify(q));
    return false;
  } catch (e) { return false; }
}

// ───────────────────────────────────────────────────────────
function doPost(e) {
  // Ko-fi envoie application/x-www-form-urlencoded avec un champ "data" JSON
  if (e.parameter && e.parameter.data) {
    return handleKofiWebhook_(e.parameter.data);
  }

  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch(err) {
    return json_({status:'error', error:'JSON parse error: ' + err.message});
  }

  ensurePremiumEmails_();

  // ── GARDE-FOU COÛT IA ─────────────────────────────────────────────
  // Limite le nombre d'appels IA par jour (par email + global) pour éviter les abus
  // et l'explosion de la facture Anthropic. N'affecte PAS les actions sans IA
  // (loadProfile, saveProfile, logSession, validateCode, test…).
  var AI_ACTIONS_ = ['coach','importProgram','importHistory','importMealPlan','estimateFood','foodLabel','readBarcode','morphoAnalysis','bodyStudy','importBodyScan','importBloodTest','summarizeCoach','generateMealPlan'];
  if (AI_ACTIONS_.indexOf(body.action) >= 0) {
    var _q = _aiQuotaBlock_(body.email);
    if (_q.blocked) {
      var _msg = _q.scope === 'global'
        ? "L'assistant IA est très sollicité aujourd'hui 🙏 Réessaie un peu plus tard ou demain."
        : "Tu as atteint ta limite d'IA pour aujourd'hui 👍 Reviens demain, l'entraînement continue !";
      return json_({status:'error', error:'quota', scope:_q.scope, reply:_msg});
    }
  }

  // ── 📊 COMPTAGE DES APPELS IA VENUS DU WORKER (08/08/2026) ─────────────
  // Les 13 actions IA passent par le Worker Cloudflare depuis la migration 4G du 13/07 :
  // le garde-fou ci-dessus ne voyait donc plus RIEN, et le panneau Admin → IA affichait
  // une photo de mi-juillet. Le Worker appelle maintenant cette route pour que le compteur
  // reparte — même propriété `ai_quota`, même panneau, aucun second compteur (R2).
  //
  // ⚠️ POURQUOI LE BLOCAGE EST DÉSACTIVÉ PAR DÉFAUT, et pourquoi ça ne contredit pas ft-v787 :
  // l'URL Apps Script est publique (elle est dans constants.js, dépôt public). Sans secret
  // partagé, n'importe qui pourrait appeler cette route 600 fois et COUPER Milo pour tout le
  // monde — le blocage serait alors une arme, pas une protection. Le comptage, lui, est
  // inoffensif : au pire un chiffre faux dans un panneau d'admin.
  // Le jeton d'admin (ft-v787) protège une LECTURE de données personnelles → repli FERMÉ.
  // Ici le risque est inversé → repli OUVERT. Poser `FT_COUNT_TOKEN` des deux côtés
  // (Script Property + secret Cloudflare) active le plafond.
  if (body.action === 'aiCount') {
    // 🔐 LE SECRET NE VIT PLUS DANS UNE SCRIPT PROPERTY (11/08/2026).
    // Michel : « tu sais très bien que ça ne marchera pas sur Google, à chaque fois c'est
    // pareil, rien n'est enregistré ». Son expérience est réelle mais elle porte sur UNE
    // propriété — `PREMIUM_EMAILS`, réécrite par un déclencheur fantôme (d'où
    // `PREMIUM_HARDCODED_`). Les autres persistent : TOUS les comptes utilisateurs sont
    // stockés en Script Properties (`u_{email}`), c'est la sauvegarde cloud elle-même.
    // ⚠️ Mais on n'a pas besoin de trancher le débat pour avancer : on suit le motif déjà
    // adopté ici pour le premium — **l'empreinte en dur dans le code**, hors d'atteinte de
    // tout déclencheur. Michel n'a donc plus qu'UN endroit à remplir, et ce n'est pas Google :
    // le secret Cloudflare `FT_COUNT_TOKEN` du Worker.
    // 👉 L'empreinte est publique et c'est sans risque : elle ne permet pas de retrouver le
    //    secret. Pour en changer : régénérer un secret côté Cloudflare et remplacer la ligne.
    // ⚠️ REPLI : secret absent ou faux → `armed:false` → on COMPTE mais on ne BLOQUE PAS.
    //    C'est voulu (règle d'or #3) : une erreur de configuration ne doit jamais couper Milo.
    // 🔁 EMPREINTE REGÉNÉRÉE LE 13/08/2026. Pourquoi : le 11/08 j'ai remplacé la
    // comparaison « les deux côtés pareils » par « une valeur précise et une seule »,
    // SANS donner à Michel la clé correspondante — sa valeur Cloudflare, qui marchait
    // avant, ne pouvait donc plus correspondre. Le plafond est resté DÉSARMÉ deux jours.
    // ⚠️ Une empreinte SHA-256 ne se remonte pas : si la clé Cloudflare est perdue, on ne
    //    la retrouve NULLE PART. La seule issue est d'en régénérer une — procédure écrite
    //    dans `A-FAIRE-SUR-PC.md`, pour ne pas avoir à rouvrir une vieille conversation.
    var _HASH_COUNT = '8876f1898e466e84e3ec872c8234782649430274c040334ec2eccf79a6db112f';
    var _q2 = _aiQuotaBlock_(body.email);
    var _recu = String(body.token == null ? '' : body.token).trim();
    var _arme = _recu.length >= 12 && _sha256hex_(_recu) === _HASH_COUNT;
    // 👁️ ON GARDE UNE TRACE DE CE QU'ON A CONSTATÉ (11/08/2026). Sans ça, l'état du plafond
    // n'est lisible NULLE PART : Michel a posé le secret et n'avait aucun moyen de vérifier
    // qu'il avait pris. *Un garde-fou qu'on ne peut pas voir ne rassure que celui qui l'a
    // écrit* — c'est la leçon de la sauvegarde morte 36 jours et du compteur figé 3 semaines.
    // On note l'état RÉEL observé lors du dernier appel du Worker, pas une intention.
    try{
      PropertiesService.getScriptProperties().setProperty('AI_CAP_SEEN',
        (_arme ? 'armed' : 'off') + '|' + new Date().toISOString());
    }catch(_e){}
    return json_({status:'ok', counted:true, armed:_arme,
                  blocked: _arme && _q2.blocked, scope:_q2.scope || ''});
  }

  if (body.action === 'test')              return json_({status:'online', version:'3.5'});
  if (body.action === 'loadProfile')       return handleLoadProfilePost_(body);
  if (body.action === 'saveProfile')       return handleSaveProfile_(body);
  if (body.action === 'logSession')        return handleLogSession_(body);
  if (body.action === 'coach')             return handleCoach_(body);
  if (body.action === 'validateCode')      return handleValidateCode_(body);
  if (body.action === 'sendConfirmCode')   return handleSendConfirmCode_(body);
  if (body.action === 'verifyConfirmCode') return handleVerifyConfirmCode_(body);
  if (body.action === 'logCustomExercise') return handleLogCustomExercise_(body);
  if (body.action === 'importProgram')     return handleImportProgram_(body);
  if (body.action === 'importHistory')    return handleImportHistory_(body);
  if (body.action === 'importMealPlan')    return handleImportMealPlan_(body);
  if (body.action === 'estimateFood')      return handleEstimateFood_(body);
  if (body.action === 'foodLabel')         return handleFoodLabel_(body);
  if (body.action === 'readBarcode')       return handleReadBarcode_(body);
  if (body.action === 'morphoAnalysis')    return handleMorphoAnalysis_(body);
  if (body.action === 'bodyStudy')         return handleBodyStudy_(body);
  if (body.action === 'importBodyScan')    return handleImportBodyScan_(body);
  if (body.action === 'importBloodTest')   return handleImportBloodTest_(body);
  if (body.action === 'testerIdea')        return handleTesterIdea_(body);
  if (body.action === 'summarizeCoach')    return handleSummarizeCoach_(body);
  if (body.action === 'generateMealPlan')  return handleGenerateMealPlan_(body);
  if (body.action === 'adminRestore')      return handleAdminRestore_(body);
  if (body.action === 'listUsers')         return handleListUsers_(body);
  if (body.action === 'setAccessCode')     return handleSetAccessCode_(body);
  if (body.action === 'authStatus')        return handleAuthStatus_(body);
  if (body.action === 'pushHealth')        return handlePushHealth_(body);

  return json_({status:'error', error:'Unknown POST action: ' + body.action});
}

// ───────────────────────────────────────────────────────────
// Webhook Ko-fi — déclenché automatiquement à chaque paiement
// Tarifs (décision Michel 31/07/2026 — « 4,99 €/2 mois c'est trop léger », formule longue plafonnée à 6 mois) :
// 1.99€ → 3 jours (essai)  |  6.99€ → 31 jours (1 mois)  |  34.99€ → 184 jours (6 mois, ~−17 %)
// (un ancien paiement 4.99 déclenche encore le mois : personne ne paie dans le vide)
// ⚠️ Les abonnements DÉJÀ accordés gardent leur date d'expiration acquise (on ne reprend rien).
// Ko-fi > Settings > API > Webhook URL = URL de ce script déployé
function handleKofiWebhook_(dataStr) {
  try {
    const data = JSON.parse(dataStr);

    // Vérification token Ko-fi — FAIL-CLOSED : on refuse si le token n'est pas
    // configuré OU s'il ne correspond pas (empêche d'auto-s'attribuer premium).
    const expectedToken = PropertiesService.getScriptProperties().getProperty('KOFI_TOKEN') || '';
    if (!expectedToken || data.verification_token !== expectedToken) {
      return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
    }

    const email = (data.email || '').toLowerCase().trim();
    if (!email) return ContentService.createTextOutput('No email').setMimeType(ContentService.MimeType.TEXT);

    // Durée selon le montant
    const amount = parseFloat(data.amount || '0');
    let days = 0;
    let tier = '';
    if (amount >= 30.0)     { days = 184; tier = 'semiannual'; } // 34.99€ → 6 mois
    else if (amount >= 4.0) { days = 31;  tier = 'monthly';    } // 6.99€ → 1 mois (≥ 4 : un ancien lien 4.99 donne aussi le mois)
    else if (amount >= 0.9) { days = 3;   tier = 'trial';      } // 1.99€ → 3 jours (seuil large : tout petit montant donne l'essai)

    let expiryStr = '';
    if (days > 0) {
      // Si déjà premium et pas expiré → prolonger depuis l'expiry actuel
      const existing = loadPremiumData_(email);
      let base = new Date();
      if (existing && existing.expiry && existing.expiry >= todayStr_()) {
        base = new Date(existing.expiry);
      }
      base.setDate(base.getDate() + days);
      expiryStr = base.toISOString().split('T')[0];
      savePremiumData_(email, { expiry: expiryStr, tier: tier, updatedAt: new Date().toISOString() });
    }

    // Logger dans Google Sheets onglet Premium
    try {
      const ss = _getSheet_();
      let sheet = ss.getSheetByName('Premium');
      if (!sheet) {
        sheet = ss.insertSheet('Premium');
        sheet.appendRow(['date','email','nom','montant','devise','tier','expiration','transaction_id']);
      }
      sheet.appendRow(_safeRow_([
        new Date().toISOString(),
        email,
        data.from_name || '',
        data.amount || '',
        data.currency || '',
        tier,
        expiryStr,
        data.kofi_transaction_id || ''
      ]));
    } catch(e) {}

    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  } catch(err) {
    return ContentService.createTextOutput('Error: ' + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

// ── Helpers garde-fou : le vide ne gagne jamais sur du rempli ──────────
// Chaîne : '' ou null n'écrase pas une valeur existante non-vide
function _ps_(b, e){ if(b===undefined)return e; return (b&&b!=='')?b:(e||b||''); }
// Nombre : 0 ou null n'écrase pas une valeur existante non-nulle
function _pn_(b, e){ if(b===undefined)return e; return (b&&b!==0)?b:(e||b||0); }
// Tableau : [] n'écrase pas un tableau existant non-vide
function _pa_(b, e){ if(b===undefined)return e; const bi=b||[],ei=e||[]; return(bi.length>0||ei.length===0)?bi:ei; }
// Objet  : {} n'écrase pas un objet existant non-vide
function _po_(b, e){ if(b===undefined)return e; const bk=Object.keys(b||{}).length,ek=Object.keys(e||{}).length; return(bk>0||ek===0)?b:e; }

// ───────────────────────────────────────────────────────────

/**
 * Journalise un refus de rétrécissement d'historique (garde-fou sessions, 02/08/2026).
 * Sans trace, ce refus serait invisible : on saurait que les données sont sauvées, mais pas
 * qu'un appareil est en train d'envoyer un historique amputé — ce qui EST le symptôme utile.
 * Lisible via ?action=storeHealth (carte « Santé du système » de l'onglet Admin).
 */
function _logHistShrink_(email, recues, enBase) {
  try {
    const P = PropertiesService.getScriptProperties();
    const l = JSON.parse(P.getProperty('HIST_SHRINK') || '[]');
    l.unshift({ d: new Date().toISOString(), e: String(email || '').slice(0, 60),
                recues: recues, enBase: enBase });
    P.setProperty('HIST_SHRINK', JSON.stringify(l.slice(0, 30)));
  } catch (e) {}
}

function handleSaveProfile_(body) {
  try {
    const email = (body.email || '').toLowerCase().trim();
    if (!email) return json_({status:'error', error:'Email requis'});

    const _a = _authCheck_(email, body.authCode);
    if (!_a.ok) return json_({status:'error', error:'auth', blocked:_a.blocked});

    const isNewUser = !loadUserData_(email);
    const existing = loadUserData_(email) || {};
    const profile = existing.profile || {};

    // GARDE-FOU GLOBAL : le vide ne gagne jamais sur du rempli
    // Chaînes identité : '' n'écrase pas une valeur existante
    if (body.name          !== undefined) profile.name          = _ps_(body.name,          profile.name);
    if (body.gender        !== undefined) profile.gender        = _ps_(body.gender,        profile.gender);
    if (body.goal          !== undefined) profile.goal          = _ps_(body.goal,          profile.goal);
    if (body.goal2         !== undefined) profile.goal2         = _ps_(body.goal2,         profile.goal2);
    if (body.priorities    !== undefined) profile.priorities    = _pa_(body.priorities,    profile.priorities);
    if (body.workType      !== undefined) profile.workType      = _ps_(body.workType,      profile.workType);
    if (body.nutritionPhase!== undefined) profile.nutritionPhase= _ps_(body.nutritionPhase,profile.nutritionPhase);
    if (body.mensCycleStart!== undefined) profile.mensCycleStart= _ps_(body.mensCycleStart,profile.mensCycleStart);
    if (body.contraception !== undefined) profile.contraception = _ps_(body.contraception, profile.contraception);
    if (body.morpho        !== undefined) profile.morpho        = _ps_(body.morpho,        profile.morpho);
    if (body.morphotype    !== undefined) profile.morphotype    = _ps_(body.morphotype,    profile.morphotype);
    if (body.colorblind    !== undefined) profile.colorblind    = _ps_(body.colorblind,    profile.colorblind);
    if (body.coachMemory   !== undefined) profile.coachMemory   = _ps_(body.coachMemory,   profile.coachMemory);
    if (body.bday          !== undefined) profile.bday          = _ps_(body.bday,          profile.bday);
    // Nombres physiques : 0 n'écrase pas une valeur existante
    if (body.bw            !== undefined) profile.bw            = _pn_(body.bw,            profile.bw);
    if (body.age           !== undefined) profile.age           = _pn_(body.age,           profile.age);
    if (body.height        !== undefined) profile.height        = _pn_(body.height,        profile.height);
    if (body.activityLevel !== undefined) profile.activityLevel = _pn_(body.activityLevel, profile.activityLevel);
    if (body.barW          !== undefined) profile.barW          = _pn_(body.barW,          profile.barW);
    if (body.defRest       !== undefined) profile.defRest       = _pn_(body.defRest,       profile.defRest);
    if (body.mensCycleDur  !== undefined) profile.mensCycleDur  = _pn_(body.mensCycleDur,  profile.mensCycleDur);
    if (body.neck          !== undefined) profile.neck          = _pn_(body.neck,          profile.neck);
    if (body.waist         !== undefined) profile.waist         = _pn_(body.waist,         profile.waist);
    if (body.hip           !== undefined) profile.hip           = _pn_(body.hip,           profile.hip);
    if (body.targetWeight  !== undefined) profile.targetWeight  = _pn_(body.targetWeight,  profile.targetWeight);
    if (body.strengthGoals !== undefined) profile.strengthGoals = _po_(body.strengthGoals, profile.strengthGoals);
    if (body.manualKcal    !== undefined) profile.manualKcal    = _pn_(body.manualKcal,    profile.manualKcal);
    // Booleans : false est une valeur valide — toujours écrire
    if (body.smoker        !== undefined) profile.smoker        = body.smoker;
    if (body.a11y          !== undefined) profile.a11y          = body.a11y;
    if (body.leftHand      !== undefined) profile.leftHand      = body.leftHand;
    // Tableaux : [] n'écrase pas un tableau existant
    if (body.customExercises!== undefined) profile.customExercises= _pa_(body.customExercises, profile.customExercises);
    // Photos d'exercices = LOCAL SEULEMENT : on ne les garde JAMAIS dans le store cloud
    // (elles saturaient les 9 Mo). On retire img des exos perso stockés + on nettoie l'existant.
    if (Array.isArray(profile.customExercises)) {
      profile.customExercises = profile.customExercises.map(function(x){
        if (x && x.img) { var y = {}; for (var k in x) { if (k !== 'img') y[k] = x[k]; } return y; }
        return x;
      });
    }
    // Objets  : {} ou null n'écrase pas un objet existant
    if (body.healthProfile !== undefined) profile.healthProfile = body.healthProfile||profile.healthProfile||null;
    if (body.badges        !== undefined) profile.badges        = _po_(body.badges,        profile.badges);
    if (body.discipline    !== undefined) profile.discipline    = _ps_(body.discipline,    profile.discipline);
    if (body.level         !== undefined) profile.level         = _ps_(body.level,         profile.level);
    if (body.coachTone     !== undefined) profile.coachTone     = _ps_(body.coachTone,     profile.coachTone);
    if (body.registre      !== undefined) profile.registre      = _po_(body.registre,      profile.registre);
    if (body.adn           !== undefined) profile.adn           = _po_(body.adn,           profile.adn);
    if (body.histImports   !== undefined) profile.histImports   = _pn_(body.histImports,   profile.histImports);
    // exPhotos (photos d'exos bibliothèque) = LOCAL SEULEMENT : jamais stocké, et on nettoie l'existant.
    if (profile.exPhotos) delete profile.exPhotos;
    if (body.bodyStudy     !== undefined) profile.bodyStudy     = _po_(body.bodyStudy,     profile.bodyStudy);
    if (body.bodyStudies   !== undefined) profile.bodyStudies   = _pa_(body.bodyStudies,   profile.bodyStudies);
    if (body.bodyScans     !== undefined) profile.bodyScans     = _pa_(body.bodyScans,     profile.bodyScans);
    if (body.bloodTests    !== undefined) profile.bloodTests    = _pa_(body.bloodTests,    profile.bloodTests);
    if (body.bodyScanImports!== undefined) profile.bodyScanImports= _pn_(body.bodyScanImports, profile.bodyScanImports);
    if (body.progImports !== undefined) profile.progImports = _pn_(body.progImports, profile.progImports); // imports IA de programme (limite gratuite, 31/07)
    if (body.coachQuiz     !== undefined) profile.coachQuiz     = _po_(body.coachQuiz,     profile.coachQuiz);
    if (body.coachQuizPro  !== undefined) profile.coachQuizPro  = _po_(body.coachQuizPro,  profile.coachQuizPro);
    if (body.scaleType     !== undefined) profile.scaleType     = _ps_(body.scaleType,     profile.scaleType);
    if (body.diet          !== undefined) profile.diet          = _ps_(body.diet,          profile.diet);
    if (body.dietRestrictions!== undefined) profile.dietRestrictions = _pa_(body.dietRestrictions, profile.dietRestrictions);
    if (body.dietNotes     !== undefined) profile.dietNotes     = _ps_(body.dietNotes,     profile.dietNotes);
    if (body.foodLog       !== undefined) profile.foodLog       = _pa_(body.foodLog,       profile.foodLog);
    if (body.savedFoods    !== undefined) profile.savedFoods    = _pa_(body.savedFoods,    profile.savedFoods);
    if (body.foodAiUses    !== undefined) profile.foodAiUses    = Math.max(parseInt(body.foodAiUses)||0, parseInt(profile.foodAiUses)||0);

    existing.profile = profile;

    // Tableaux entraînement : [] n'écrase pas des données existantes
    if (body.sessions !== undefined) {
      const inSess = body.sessions || [], exSess = existing.sessions || [];
      // ⚠️ GARDE-FOU ÉLARGI le 02/08. Il ne refusait qu'un envoi VIDE — donc un envoi de 50
      // séances remplaçait sans broncher un historique de 500. Chemin réel : le stockage du
      // téléphone sature, l'app tronque l'historique local à 50, et la sauvegarde suivante
      // écrasait le cloud. On refuse maintenant tout RÉTRÉCISSEMENT BRUTAL (règle d'or n°1).
      // Seuils : on ne juge que si le cloud a déjà un vrai historique (>= 30 séances), et on
      // laisse passer les suppressions ordinaires (jusqu'à 40 % en une fois).
      const SEUIL_MINI = 30, PART_MINI = 0.6;
      const vide      = inSess.length === 0 && exSess.length > 0;
      const retreci   = exSess.length >= SEUIL_MINI && inSess.length < exSess.length * PART_MINI;
      if (vide || retreci) {
        Logger.log('[FT GARDE-FOU sessions] refusé : ' + inSess.length + ' reçues contre ' +
                   exSess.length + ' en base — historique conservé');
        _logHistShrink_(email, inSess.length, exSess.length);
      } else { existing.sessions = inSess; }
    }
    if (body.prs !== undefined) {
      const inPrs = Object.keys(body.prs||{}).length, exPrs = Object.keys(existing.prs||{}).length;
      if (inPrs === 0 && exPrs > 0) {
        Logger.log('[FT GARDE-FOU prs] refusé : ' + exPrs + ' PRs conservés');
      } else { existing.prs = body.prs; }
    }
    if (body.programmes !== undefined) {
      const inProg = body.programmes || [], exProg = existing.programmes || [];
      if (inProg.length === 0 && exProg.length > 0) {
        Logger.log('[FT GARDE-FOU programmes] refusé : ' + exProg.length + ' programmes conservés');
      } else { existing.programmes = inProg; }
    }
    if (body.weightLog !== undefined) {
      const inWL = body.weightLog || [], exWL = existing.weightLog || [];
      if (inWL.length === 0 && exWL.length > 0) {
        Logger.log('[FT GARDE-FOU weightLog] refusé : ' + exWL.length + ' entrées conservées');
      } else { existing.weightLog = inWL; }
    }
    if (body.sleepLog !== undefined) {
      const inSL = body.sleepLog || [], exSL = existing.sleepLog || [];
      if (inSL.length === 0 && exSL.length > 0) {
        Logger.log('[FT GARDE-FOU sleepLog] refusé : ' + exSL.length + ' entrées conservées');
      } else { existing.sleepLog = inSL; }
    }
    if (body.dayStateLog !== undefined) {
      const inDL = body.dayStateLog || [], exDL = existing.dayStateLog || [];
      if (inDL.length === 0 && exDL.length > 0) {
        Logger.log('[FT GARDE-FOU dayStateLog] refusé : ' + exDL.length + ' entrées conservées');
      } else { existing.dayStateLog = inDL; }
    }
    if (body.exRestPref !== undefined) existing.exRestPref = body.exRestPref;
    if (body.cycle      !== undefined) existing.cycle      = body.cycle; // null intentionnel OK
    existing.email     = email;
    existing.updatedAt = new Date().toISOString();

    saveUserData_(email, existing);
    _mirrorUserToSheet_(email, existing); // best-effort, silencieux

    // Email de bienvenue pour les nouveaux utilisateurs
    if (body.welcome && isNewUser) {
      try {
        const prenom = profile.name || 'Athlète';
        MailApp.sendEmail(
          email,
          '🏋️ Bienvenue sur Force Tracker !',
          'Bonjour ' + prenom + ' !\n\n' +
          'Ton compte Force Tracker a bien été créé.\n\n' +
          '📧 Ton email de connexion : ' + email + '\n\n' +
          'Conserve cet email — il te permettra de restaurer toutes tes données ' +
          '(séances, records, profil) si tu réinstalles l\'application.\n\n' +
          'Bonne séance ! 💪\n\n' +
          '— L\'équipe Force Tracker\n' +
          'forcetracker.app@gmail.com'
        );
      } catch(mailErr) {}
    }

    return json_({status:'ok'});
  } catch(err) {
    return json_({status:'error', error: err.message});
  }
}

// ───────────────────────────────────────────────────────────
function handleLogSession_(body) {
  try {
    const rows = body.rows || [];
    if (!rows.length) return json_({status:'ok', count:0});

    const ss = _getSheet_();
    let sheet = ss.getSheetByName('Sessions');
    if (!sheet) {
      sheet = ss.insertSheet('Sessions');
      sheet.appendRow(['date','exercise','set_num','type','kg','reps','volume','rm1','bw','gender','age']);
    }
    rows.forEach(r => sheet.appendRow(_safeRow_([
      r.date, r.exercise, r.set_num, r.type,
      r.kg, r.reps, r.volume, r.rm1,
      r.bw, r.gender, r.age
    ])));

    return json_({status:'ok', count: rows.length});
  } catch(err) {
    return json_({status:'error', error: err.message});
  }
}

// ───────────────────────────────────────────────────────────
// Codes Premium : PREMIUM_CODES = "CODE1,CODE2,..." → accès indéfini
function handleValidateCode_(body) {
  try {
    const code = (body.code || '').trim().toUpperCase();
    if (!code) return json_({status:'error', error:'Code requis'});

    // Anti-brute-force : plafonne les essais/jour (un code payant ne se teste pas 1000×).
    // ~40/jour = large pour de vrais utilisateurs, rend le forçage d'un code infaisable.
    if (_dailyCounterBlock_('validate_code_quota', 40)) return json_({status:'error', error:'trop d\'essais, réessaie demain'});

    const raw = PropertiesService.getScriptProperties().getProperty('PREMIUM_CODES') || '';
    const codes = raw.split(',').map(c => c.trim().toUpperCase()).filter(Boolean);

    if (codes.includes(code)) {
      // Enregistrer l'email dans la whitelist indéfinie
      const email = (body.email || '').toLowerCase().trim();
      if (email) {
        const props = PropertiesService.getScriptProperties();
        const existing = (props.getProperty('PREMIUM_EMAILS') || '')
          .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
        if (!existing.includes(email)) {
          existing.push(email);
          props.setProperty('PREMIUM_EMAILS', existing.join(','));
        }
      }
      return json_({status:'ok', type:'lifetime'});
    }
    return json_({status:'invalid'});
  } catch(err) {
    return json_({status:'error', error: err.message});
  }
}

// ── Confirmation d'email (soft) : envoi d'un code à 6 chiffres par email ──
// Ne bloque JAMAIS l'inscription : c'est un bonus de sécurité (vérifie que l'email
// est réel/possédé -> évite qu'une faute de frappe fasse perdre la sauvegarde cloud).
function handleSendConfirmCode_(body) {
  try {
    var email = (body.email || '').toString().trim().toLowerCase();
    if (!email || email.indexOf('@') < 0) return json_({status:'error', error:'email'});
    var sp = PropertiesService.getScriptProperties();
    var map = {}; try { map = JSON.parse(sp.getProperty('pending_confirms') || '{}'); } catch(e) { map = {}; }
    var now = Date.now();
    Object.keys(map).forEach(function(k){ if (map[k].exp < now) delete map[k]; }); // purge expirés
    var cur = map[email];
    if (cur && cur.sentAt && (now - cur.sentAt) < 60000) return json_({status:'ok', cooldown:true}); // anti-spam 60s par email
    // Plafond GLOBAL d'envois/jour : empêche le bombardement d'emails en changeant d'adresse
    // (protège la réputation + le quota du compte Gmail). ~80/jour = large pour de vrais inscrits.
    if (_dailyCounterBlock_('confirm_send_quota', 80)) return json_({status:'ok', capped:true});
    var code = '' + Math.floor(100000 + Math.random() * 900000);
    map[email] = { code: code, exp: now + 15 * 60000, tries: 0, sentAt: now };
    sp.setProperty('pending_confirms', JSON.stringify(map));
    // GmailApp = scope gmail.send (déjà déclaré/autorisé) -> pas de nouvelle autorisation
    GmailApp.sendEmail(email, 'Force Tracker — ton code de confirmation : ' + code,
      'Ton code de confirmation Force Tracker : ' + code + ' (expire dans 15 minutes).',
      {
        name: 'Force Tracker',
        htmlBody: '<div style="font-family:Arial,Helvetica,sans-serif;max-width:440px;margin:auto;">' +
          '<h2 style="color:#FF2D55;margin-bottom:4px;">Force Tracker</h2>' +
          '<p>Salut 👋 Voici ton code pour confirmer ton adresse email :</p>' +
          '<p style="font-size:34px;font-weight:bold;letter-spacing:8px;color:#111;">' + code + '</p>' +
          '<p style="color:#555;">Entre ce code dans l\'appli pour vérifier ton email. Il expire dans 15 minutes.</p>' +
          '<p style="color:#999;font-size:12px;margin-top:18px;">Si tu n\'as pas demandé ça, ignore simplement ce message.</p>' +
          '</div>'
      });
    return json_({status:'ok'});
  } catch(err) {
    // Quota email atteint ou autre : on renvoie une erreur douce (l'inscription n'est jamais bloquée)
    return json_({status:'error', error:'send', detail: String(err)});
  }
}
function handleVerifyConfirmCode_(body) {
  try {
    var email = (body.email || '').toString().trim().toLowerCase();
    var code  = (body.code  || '').toString().trim();
    if (!email || !code) return json_({status:'error', error:'params'});
    var sp = PropertiesService.getScriptProperties();
    var map = {}; try { map = JSON.parse(sp.getProperty('pending_confirms') || '{}'); } catch(e) { map = {}; }
    var cur = map[email];
    if (!cur) return json_({status:'nocode'});
    var save = function(){ sp.setProperty('pending_confirms', JSON.stringify(map)); };
    if (cur.exp < Date.now()) { delete map[email]; save(); return json_({status:'expired'}); }
    if (cur.tries >= 5)       { delete map[email]; save(); return json_({status:'toomany'}); }
    if (cur.code !== code)    { cur.tries++;       save(); return json_({status:'invalid'}); }
    delete map[email]; save();
    // Marque le profil comme vérifié (voyage via loadProfile)
    try {
      var data = loadUserData_(email);
      if (data) { data.profile = data.profile || {}; data.profile.emailVerified = true; saveUserData_(email, data); }
      else { sp.setProperty('confirmed_' + email, new Date().toISOString().slice(0,10)); }
    } catch(e2) {}
    return json_({status:'ok'});
  } catch(err) {
    return json_({status:'error', error:'verify', detail: String(err)});
  }
}

// ── Activer / réinitialiser le code perso (protection opt-in) ─────────────────
// Exige un code de confirmation email VALIDE (prouve la possession de l'email →
// garantit la récupération). Couvre le 1er réglage ET le reset "code oublié".
function handleSetAccessCode_(body) {
  try {
    var email   = (body.email   || '').toString().trim().toLowerCase();
    var confirm = (body.code    || '').toString().trim();       // code 6 chiffres reçu par email
    var newCode = (body.newCode || '').toString().trim();       // code perso choisi
    if (!email || !confirm) return json_({status:'error', error:'params'});
    if (!body.remove && newCode.length < 4) return json_({status:'error', error:'court'}); // min 4 caractères (sauf désactivation)
    // 1) Vérifier le code email (même logique que verifyConfirmCode)
    var sp = PropertiesService.getScriptProperties();
    var map = {}; try { map = JSON.parse(sp.getProperty('pending_confirms') || '{}'); } catch(e) { map = {}; }
    var cur = map[email];
    var save = function(){ sp.setProperty('pending_confirms', JSON.stringify(map)); };
    if (!cur)                 return json_({status:'nocode'});
    if (cur.exp < Date.now()) { delete map[email]; save(); return json_({status:'expired'}); }
    if (cur.tries >= 5)       { delete map[email]; save(); return json_({status:'toomany'}); }
    if (cur.code !== confirm) { cur.tries++;       save(); return json_({status:'invalid'}); }
    delete map[email]; save();
    // 2a) DÉSACTIVATION : email vérifié → on retire la protection
    if (body.remove) { sp.deleteProperty('auth_' + email); return json_({status:'ok', removed:true}); }
    // 2b) Poser le code perso (salt$hash, jamais le code en clair) + marquer email vérifié
    var salt = Utilities.getUuid().replace(/-/g,'').slice(0,16);
    sp.setProperty('auth_' + email, salt + '$' + _sha256hex_(salt + '|' + newCode));
    try {
      var data = loadUserData_(email);
      if (data) { data.profile = data.profile || {}; data.profile.emailVerified = true; saveUserData_(email, data); }
    } catch(e2) {}
    return json_({status:'ok'});
  } catch(err) {
    return json_({status:'error', error:'setcode', detail:String(err)});
  }
}
// L'app demande si un compte est protégé (aucun secret divulgué — juste un booléen).
/* ⌚ LA MONTRE ÉCRIT DIRECTEMENT DANS LE COMPTE (16/08/2026, ft-v880)
   Michel : *« j'aimerais que l'information arrive direct dans mon appli pour éviter de donner les
   csv, juste le cardio »*.

   ⭐ POURQUOI CETTE ROUTE EXISTE, ET POURQUOI ELLE EST SI SIMPLE : il n'y a AUCUN moyen pour une
   PWA de lire Apple Santé — iOS l'interdit, ce n'est pas un manque d'effort. Et les deux voies
   « officielles » sont fermées ou payantes, vérifié le 16/08 :
     · l'API Garmin Connect demande une entité légale, et le programme est suspendu ;
     · l'API Strava exige un abonnement Strava depuis juin 2026 pour accéder à… ses propres données.
   La 3ᵉ voie ne demande ni approbation, ni abonnement, ni application native : **le téléphone
   POUSSE lui-même**. Un raccourci iOS lit Santé (où Garmin écrit tout seul) et appelle cette
   route. Le serveur ne va rien CHERCHER : il REÇOIT. C'est ce qui rend la chose faisable ce soir.

   ⚠️ SÉCURITÉ : même vérification que partout ailleurs (`_authCheck_`). Un compte protégé par un
   code perso exige ce code — le raccourci le porte, et il vit sur le téléphone de la personne.
   ⚠️ ON NE TOUCHE À AUCUNE SÉANCE ICI. Cette route ne fait que DÉPOSER dans une boîte de
   réception ; c'est l'app qui proposera de rattacher, et c'est la personne qui valide (R29).
   Écrire dans les séances depuis un point d'entrée public serait la meilleure façon d'écraser une
   saisie manuelle sans que personne ne s'en aperçoive (règle d'or #3).
   ⚠️ ET LE RACCOURCI RENVERRA LES MÊMES ACTIVITÉS TOUS LES JOURS : la déduplication est donc
   obligatoire, pas un confort. La clé est l'instant de DÉBUT + le type. */
var HEALTH_MAX_   = 60;     // ce n'est pas une archive, juste de quoi rattacher
var HEALTH_JOURS_ = 45;     // au-delà, la séance est classée depuis longtemps
function handlePushHealth_(body) {
  try {
    var email = (body.email || '').toString().trim().toLowerCase();
    if (!email) return json_({status:'error', error:'email required'});
    var a = _authCheck_(email, body.authCode);
    if (!a.ok) return json_({status:'error', error:'auth', blocked:a.blocked});
    var data = loadUserData_(email);
    if (!data) return json_({status:'not_found'});

    var recues = body.activities;
    if (!recues || !recues.length) return json_({status:'ok', count:0, total:(data.healthInbox||[]).length});
    if (recues.length > 200) recues = recues.slice(0, 200);      // garde-fou de taille

    var inbox = data.healthInbox || [];
    var vus = {};
    for (var i = 0; i < inbox.length; i++) vus[inbox[i].start + '|' + inbox[i].type] = 1;

    var ajout = 0;
    for (var j = 0; j < recues.length; j++) {
      var r = recues[j] || {};
      var start = String(r.start || '').slice(0, 19);            // ISO, à la seconde
      if (!start) continue;
      var type = String(r.type || 'autre').slice(0, 40);
      var cle = start + '|' + type;
      if (vus[cle]) continue;                                    // déjà reçue → on ignore
      var min = Math.round(Number(r.min) || 0);
      if (!(min > 0) || min > 600) continue;                     // 0 ou plus de 10 h = donnée fausse
      vus[cle] = 1;
      inbox.push({
        start: start,
        type:  type,
        min:   min,
        kcal:  Math.round(Number(r.kcal) || 0) || null,          // reçu et gardé, mais l'app ne s'en sert pas
        hr:    Math.round(Number(r.hr)   || 0) || null,
        src:   'sante',
        recu:  new Date().toISOString().slice(0, 19)
      });
      ajout++;
    }

    // on borne dans le TEMPS puis en NOMBRE — une boîte de réception n'est pas une archive
    var limite = new Date(Date.now() - HEALTH_JOURS_ * 86400000).toISOString().slice(0, 10);
    inbox = inbox.filter(function(x){ return String(x.start).slice(0, 10) >= limite; });
    inbox.sort(function(x, y){ return x.start < y.start ? 1 : -1; });
    if (inbox.length > HEALTH_MAX_) inbox = inbox.slice(0, HEALTH_MAX_);

    data.healthInbox = inbox;
    saveUserData_(email, data);
    return json_({status:'ok', count:ajout, total:inbox.length});
  } catch (err) {
    return json_({status:'error', error:'pushhealth'});
  }
}

function handleAuthStatus_(body) {
  try {
    var email = (body.email || '').toString().trim().toLowerCase();
    if (!email) return json_({status:'error', error:'email'});
    var sp = PropertiesService.getScriptProperties();
    var hasCode = (sp.getProperty('auth_' + email) || '').length >= 20;
    // ⚠️ light:true → on NE CHARGE PAS le compte. Mesuré le 04/08 : la carte admin « qui a protégé
    // son compte » renvoyait « non vérifié » sur 4 comptes sur 5, dont un dont on avait PROUVÉ
    // qu'il était protégé. Cause : le `loadUserData_` ci-dessous décompresse le compte ENTIER
    // (Christophe = 278 Ko) uniquement pour lire `emailVerified` — dont l'appelant ne se sert pas.
    // Sur les gros comptes la requête n'aboutissait pas. `hasCode` ne demande qu'une propriété.
    // ⚠️ En mode light, `emailVerified` ne vient QUE de la propriété `confirmed_` : c'est moins
    // complet (le drapeau miroir du profil n'est pas lu), donc à n'utiliser que quand seul
    // `hasCode` compte. Le chemin normal, lui, ne change pas d'un octet.
    if (body.light) return json_({status:'ok', hasCode: hasCode, emailVerified: !!sp.getProperty('confirmed_' + email), light: true});
    var data = loadUserData_(email);
    var verified = !!(data && data.profile && data.profile.emailVerified) || !!sp.getProperty('confirmed_' + email);
    return json_({status:'ok', hasCode: hasCode, emailVerified: verified});
  } catch(err) {
    return json_({status:'error', error:'authstatus'});
  }
}

// À lancer UNE fois depuis l'éditeur Apps Script SI les emails de confirmation
// n'arrivent pas (force l'écran d'autorisation Google pour l'envoi d'email).
function authorizeMail() {
  GmailApp.sendEmail('forcetracker.app@gmail.com', 'Force Tracker — test autorisation email',
    'Si tu reçois ce mail, l\'envoi d\'email fonctionne ✅');
  Logger.log('Email de test envoyé — autorisation OK');
}

// ───────────────────────────────────────────────────────────
// Une cellule de date du Sheet revient tantôt en texte, tantôt en objet Date selon comment
// elle a été écrite — on normalise en AAAA-MM-JJ pour l'affichage dans l'app.
function _dstr_(v) {
  if (!v) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') return v.toISOString().slice(0,10);
  return String(v).slice(0,10);
}
function handleLogCustomExercise_(body) {
  try {
    const name   = (body.name || '').trim();
    if (!name) return json_({status:'ok'});
    const anonId = (body.anonId || 'anon').trim();
    const grp    = body.group || 'Autres';
    const ss     = _getSheet_();
    const today  = new Date().toISOString().slice(0, 10);

    // Feuille agrégée "Exercices manquants"
    let sheet = ss.getSheetByName('Exercices manquants');
    if (!sheet) {
      sheet = ss.insertSheet('Exercices manquants');
      sheet.appendRow(['Exercice','Groupe','Signalements','IDs anonymes','Première date','Dernière date','Muscles principaux','Muscles secondaires']);
      sheet.setFrozenRows(1);
      sheet.getRange(1,1,1,8).setFontWeight('bold');
    }

    const data = sheet.getDataRange().getValues();
    let rowIdx = -1;
    for (let i = 1; i < data.length; i++) {
      if ((data[i][0]||'').toLowerCase() === name.toLowerCase()) { rowIdx = i + 1; break; }
    }

    // Les muscles cochés par la personne : jusqu'au 02/08 ils étaient envoyés par l'app puis
    // JETÉS ici (reçus dans le body, écrits nulle part). C'est pourtant l'info qui permet
    // d'ajouter l'exercice au catalogue déjà correctement classé, sans avoir à deviner.
    const musP = (body.musclesP || []).join(', ');
    const musS = (body.musclesS || []).join(', ');

    if (rowIdx > 0) {
      const row = data[rowIdx - 1];
      const count = (row[2] || 0) + 1;
      const ids = (row[3] || '').split(', ').filter(Boolean);
      if (anonId && !ids.includes(anonId)) ids.push(anonId);
      // on n'écrase pas des muscles déjà renseignés par un envoi vide
      const p2 = musP || (row[6] || ''), s2 = musS || (row[7] || '');
      sheet.getRange(rowIdx, 3, 1, 6).setValues([_safeRow_([count, ids.join(', '), row[4]||today, today, p2, s2])]);
    } else {
      sheet.appendRow(_safeRow_([name, grp, 1, anonId, today, today, musP, musS]));
    }

    return json_({status:'ok'});
  } catch(err) {
    return json_({status:'error', error: err.message});
  }
}

// ───────────────────────────────────────────────────────────
function handleImportProgram_(body) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey) return json_({status:'error', error:'Clé API Anthropic non configurée'});

  try {
    const images = body.images || [];
    if (!images.length) return json_({status:'error', error:'Aucun fichier reçu'});

    // Sonnet si plusieurs images, PDF, texte ; Haiku sinon (image unique)
    const hasText = images.some(img => img.isText || img.type === 'text/plain');
    const hasPdf  = images.some(img => img.type === 'application/pdf');
    const model = (images.length > 1 || hasText || hasPdf) ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001';

    const userContent = images.map(img => {
      if (img.isText || img.type === 'text/plain') {
        return {type:'text', text:'[Fichier : '+(img.name||'document')+']\n\n'+img.data};
      }
      if (img.type === 'application/pdf') {
        return {type:'document', source:{type:'base64', media_type:'application/pdf', data:img.data}};
      }
      return {type:'image', source:{type:'base64', media_type:img.type||'image/jpeg', data:img.data}};
    });

    userContent.push({
      type: 'text',
      text: 'Analyse ces images/documents et extrait le programme d\'entraînement complet.\n\nRetourne UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après, sans balises markdown, avec cette structure exacte :\n{"name":"nom du programme","weeks":7,"startDate":"2026-03-23","days":[{"label":"Séance 1 - Dorsaux Triceps","exercises":[{"name":"nom complet de l\'exercice","sets":5,"reps":8,"repsPerSet":[20,15,12,8,8],"specialSets":[3,4],"kg":0,"kgPerSet":[],"supersetGroup":"","setType":"","note":"méthode et instructions"}]}]}\n\nRègles STRICTES :\n\n0. DÉCOUPAGE EN SÉANCES — RÈGLE ABSOLUE :\n- Une NOUVELLE séance commence UNIQUEMENT quand le document contient un titre explicite : "SÉANCE N", "SEANCE N", "Jour N", "Day N", "Workout N" (N = chiffre ou lettre, ex. "SÉANCE 1", "Jour A").\n- Les titres de GROUPES MUSCULAIRES en majuscules ou normaux (DORSAUX, PECTORAUX, BICEPS, TRICEPS, ÉPAULES, TRAPÈZES, QUADRICEPS, FESSIERS, ISCHIOS, MOLLETS, LOMBAIRES, ABDOS…) = sous-sections à l\'intérieur d\'une séance existante. Ils ne créent JAMAIS une nouvelle séance.\n- Ignore les pages SOMMAIRE : une page qui liste les séances (ex. "SÉANCE 1 - Dorsaux..., SÉANCE 2 - Pectoraux...") sans tableau d\'exercices (sans colonnes Mouvement / Séries / Reps / Repos) = résumé → ne pas créer de séances depuis cette page.\n- Ignore toute séance vide (sans exercices).\n\n1. REPS PAR SÉRIE (repsPerSet) :\n- Si chaque série a des reps différentes (ex: 20/15/12/8/8 sur 5 séries) → repsPerSet:[20,15,12,8,8] et sets:5\n- Si toutes les séries ont les mêmes reps → repsPerSet:[] et sets=nombre de séries\n- "reps" = valeur numérique principale de la dernière/plus basse série\n- "4x8" ou "4×8" → sets:4, reps:8, repsPerSet:[]\n- EXERCICES UNILATÉRAUX (mots-clés dans le nom : "bras/bras", "jambe/jambe", "alterné", "unilatéral") :\n  Chaque ligne "NxN" = 2 séries (une par côté). Exemple : lignes "15x2, 12x2, 8x2, 8x2" sur un exo bras/bras → repsPerSet:[15,15,12,12,8,8,8,8], sets:8. Le poids noté = par haltère/côté. Un exo peut être unilatéral ET en superset simultanément.\n  "NxN+M" sur un exo unilatéral en superset : le "+M" indique les reps du PARTENAIRE superset (exercice suivant relié par +), PAS des reps supplémentaires de cet exo. Cet exo → 2 séries de N. Partenaire → M reps.\n- "vide" ou "barre à vide" dans le poids = kg:0 (ex. "15 rep vide" → reps:15, kg:0)\n- Reps complexes : "5\'\'+8" → reps:8 noter méthode dans note | "8+10" → reps:10 | "15+(3-5 reps)x5" → reps:15\n- Méthode "Ramping reps" (mots-clés : "Ramping", "ramping reps", ou séquence progressive type "3+4+5+6+7 par cycle") : produire repsPerSet=[3,4,5,6,7], sets=5, reps=7. NE PAS appliquer la formule "NxM = N séries de M reps" quand le contexte est Ramping. "3 cycles × 7 paliers" ≠ "3x7". Mettre "Méthode Ramping reps : [séquence complète] par cycle" dans la NOTE.\n\n2. SÉRIES SPÉCIALES (specialSets) :\n- Liste les indices 0-based des séries dont les REPS apparaissent en rouge, en gras coloré, ou en couleur dans le PDF\n- Si TOUTES les séries d\'un exercice sont en rouge → specialSets:[0,1,2,...] (tous les indices)\n- Si AUCUNE série n\'est en rouge → specialSets:[]\n- Exemple : sur 5 séries avec les 2 dernières en rouge → specialSets:[3,4]\n- Ces sets seront affichés en orange dans l\'app pour alerter l\'athlète\n\n3. NOTE (OBLIGATOIRE — ne rien omettre) :\n- Capture TOUT le texte en rouge/couleur = méthodes spéciales (Isométrie, Excentrique, Myo-Reps, Lourd/Léger, complète/partielle, Série unique, Ramping reps, Rest-pause, etc.) avec leur explication complète\n- Ajoute les instructions d\'exécution normales (texte sous le nom de l\'exercice)\n- Sépare les éléments par " | "\n- Ces méthodes sont cruciales pour l\'athlète, ne les perds JAMAIS\n\n4. STRUCTURE ET setType :\n- label du jour = nom complet de la séance (ex: "Séance 1 - Dorsaux Triceps Abdos")\n- kg:0 si charge non indiquée\n- "weeks" : durée totale du programme en semaines si mentionnée (ex: "7 semaines"), sinon 0\n- "startDate" : date de début au format "YYYY-MM-DD" si visible dans le document (ex: "23 Mars 2026" → "2026-03-23"), sinon ""\n- Inclus ABSOLUMENT TOUS les exercices de toutes les pages\n- setType : DEUX valeurs possibles UNIQUEMENT à l\'import : "" (Normal, défaut pour toute série) ou "D" (Dropset structuré — cf. règle 6 uniquement). NE JAMAIS utiliser "E" (Échec) ni "W" (Échauffement). Même si le document mentionne "à l\'échec", "Maxi", "MAX reps", "échauffement", "à la faute", "failure" : ces mots décrivent une méthode d\'exécution → vont TOUJOURS en NOTE, ne changent JAMAIS setType.\n\n5. SUPERSETS / TRI-SETS :\n- Exercices groupés par préfixe lettre+chiffre (C1/C2, D1/D2, A1/A2) → supersetGroup = la lettre commune (C, D, A…)\n- Tri-set C1/C2/C3 → tous les trois ont supersetGroup:"C"\n- Libellé de groupe "SUPERSET X+Y" ou "TRI-SET" → même supersetGroup\n- Deux exercices reliés par un "+" ENTRE LEURS NOMS D\'EXERCICE COMPLETS (ex: "Curl Biceps + Extension Triceps", ou un "+" seul sur sa propre ligne entre deux blocs d\'exercice) → superset, assigne-leur une lettre de groupe libre (A, B, C…). Vaut pour TOUS les groupes musculaires (biceps/triceps, trapèzes, abdos, épaules, jambes…).\n- ATTENTION — ne PAS confondre avec les "+" dans les colonnes Reps ou les méthodes : "15x2+15", "8+2+2", "7+7+7", "10+6+4", "3+1+1" = notations de répétitions ou méthodes. PAS des supersets.\n- Exercice solo → supersetGroup:""\n- La lettre du groupe = lettre AVANT le chiffre (C1 → "C", D2 → "D")\n\n6. DROPSETS :\n- DROPSET avec charges/reps dégressives → "setType":"D", repsPerSet avec les reps de chaque palier, kgPerSet avec le kg de chaque palier\n- Ex: "DROPSET: 15 @ 35kg >> 12 @ 25kg >> max @ 15kg" → setType:"D", repsPerSet:[15,12,99], kgPerSet:[35,25,15]\n- "max reps" / "à l\'échec" / "MAX" → 99 dans repsPerSet pour ce palier\n- Si dropset sans détail de charges → setType:"D", repsPerSet:[], kgPerSet:[]\n\n7. CHARGES (%1RM) :\n- Si le document indique les 1RM et des pourcentages → calcule kg = arrondi(1RM × %, 0.5 kg) pour chaque exercice\n- Ex: "Squat 152kg, S1 80%" → Squat kg = 121.5 (152×0.80 arrondi à 0.5). Note: "80% 1RM"\n- Si plusieurs semaines avec % différents → utilise le % de la semaine 1 pour kg, note les autres %\n- RPE → ajoute "RPE X" dans note\n\n- Réponds UNIQUEMENT avec le JSON, aucun autre texte'
    });

    const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify({
        model: model,
        max_tokens: 8192,
        messages: [{role: 'user', content: userContent}]
      }),
      muteHttpExceptions: true
    });

    const rawText = resp.getContentText();
    console.log('[importProgram] Réponse brute Claude :', rawText.substring(0, 3000));

    const result = JSON.parse(rawText);
    const text = (result.content && result.content[0] && result.content[0].text) || '';
    console.log('[importProgram] Texte Claude :', text.substring(0, 2000));

    // Extraire le JSON — supprimer les balises markdown si présentes
    const stripped = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) return json_({status:'error', error:'Extraction échouée. Réponse IA : '+text.substring(0,300)});

    // Nettoyer les caractères qui cassent le JSON : '' (pouces) → ", guillemets typographiques → "
    const cleaned = match[0]
      .replace(/‘|’/g, "'")   // guillemets courbes simples → apostrophe droite
      .replace(/“|”/g, '"')   // guillemets courbes doubles → guillemet droit
      .replace(/\r\n|\r/g, '\\n')       // retours chariot dans les chaînes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''); // caractères de contrôle

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch(parseErr) {
      console.error('[importProgram] JSON invalide :', parseErr.message, '| Extrait :', cleaned.substring(0,500));
      return json_({status:'error', error:'JSON invalide : '+parseErr.message+'. Réponse IA (début) : '+text.substring(0,200)});
    }
    // Normaliser durée/date de début du cycle
    data.weeks = parseInt(data.weeks) || 0;
    data.startDate = data.startDate || '';
    // Normaliser reps/sets/repsPerSet en entiers
    if (data.days) data.days.forEach(day => (day.exercises||[]).forEach(ex => {
      if (ex.repsPerSet && Array.isArray(ex.repsPerSet) && ex.repsPerSet.length > 0) {
        ex.repsPerSet = ex.repsPerSet.map(r => parseInt(String(r).replace(/[^0-9]/g,'')) || 10);
        ex.sets = ex.repsPerSet.length;
        ex.reps = ex.repsPerSet[ex.repsPerSet.length - 1];
      } else {
        ex.repsPerSet = [];
        ex.sets = parseInt(ex.sets)||3;
        const r = String(ex.reps||'10');
        ex.reps = parseInt(r.replace(/[^0-9]/g,'').slice(-2)||r) || 10;
      }
      ex.kg = parseFloat(ex.kg)||0;
      ex.note = ex.note||'';
      ex.specialSets = Array.isArray(ex.specialSets) ? ex.specialSets.map(i=>parseInt(i)).filter(i=>!isNaN(i)) : [];
      ex.supersetGroup = String(ex.supersetGroup||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,2);
      ex.setType = ['D','W','E'].includes(String(ex.setType||'').toUpperCase()) ? String(ex.setType).toUpperCase() : '';
      ex.kgPerSet = Array.isArray(ex.kgPerSet) ? ex.kgPerSet.map(k=>Math.round((parseFloat(k)||0)*2)/2) : [];
    }));
    if (!data.days || !data.days.length) return json_({status:'error', error:'Aucun exercice trouvé dans les images.'});

    return json_({status:'ok', data});
  } catch(err) {
    return json_({status:'error', error: err.message});
  }
}

// ───────────────────────────────────────────────────────────
function handleImportHistory_(body) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey) return json_({status:'error', error:'Clé API Anthropic non configurée'});

  try {
    const images = body.images || [];
    if (!images.length) return json_({status:'error', error:'Aucun fichier reçu'});

    const userContent = images.map(img => {
      if (img.isText || img.type === 'text/plain') {
        return {type:'text', text:'[Fichier : '+(img.name||'document')+']\n\n'+img.data};
      }
      if (img.type === 'application/pdf') {
        return {type:'document', source:{type:'base64', media_type:'application/pdf', data:img.data}};
      }
      return {type:'image', source:{type:'base64', media_type:img.type||'image/jpeg', data:img.data}};
    });

    userContent.push({
      type: 'text',
      text: 'Analyse ce document et extrait TOUTES les séances d\'entraînement réalisées.\n\nRetourne UNIQUEMENT un objet JSON valide, sans texte avant ni après, sans balises markdown :\n{"sessions":[{"date":"YYYY-MM-DD","estimatedDate":false,"label":"Séance 1 (15) 23/04","exercises":[{"name":"Squat à la barre","sets":[{"kg":80,"reps":8,"type":"","note":""}],"note":""}]}]}\n\nRÈGLES STRICTES :\n\n0. EXTRACTION :\n- Extrais TOUTES les séances réalisées dans l\'ordre chronologique. Ne rate aucun exercice, ni aucune série.\n- Chaque bloc "Séance N", "Séance N (x) JJ/MM" ou titre de séance daté = une séance.\n\n1. DATES :\n- "23/04/26" → "2026-04-23"\n- "14/05" → "2026-05-14" (année 2026 si manquante)\n- "02/07/2026" → "2026-07-02"\n- Séance SANS date claire → estimatedDate:true, date estimée entre les séances datées voisines\n- label = le titre exact du bloc dans le document\n\n2. SÉRIES — "⁃ N rep Xkg" ou "N rep Xkg" ou "N rép Xkg" = une série :\n- kg = X, reps = N, type = ""\n- "vide" / "barre à vide" / "PDC" / "poids du corps" → kg = 0\n- "par bras" / "par jambe" / "unilatéral" → 2 séries identiques (une par côté)\n- "N rep Xkg N rep Ykg" ou "N rep Xkg puis Y" sur une seule ligne = DROP SET : [{kg:X,reps:N,type:"D"},{kg:Y,reps:M,type:"D"}]\n- Notes libres ("la dernière était dure", "rate de peu") → champ note de la série ou de l\'exercice\n\n3. TYPE : UNIQUEMENT "" (Normal) ou "D" (Drop set). JAMAIS "E" ni "W".\n\n4. NOMS : utiliser le nom tel qu\'écrit dans le document. Corriger les fautes évidentes.\n\nRéponds UNIQUEMENT avec le JSON, aucun autre texte.'
    });

    const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        messages: [{role: 'user', content: userContent}]
      }),
      muteHttpExceptions: true
    });

    const rawText = resp.getContentText();
    console.log('[importHistory] Réponse brute Claude :', rawText.substring(0, 3000));

    const result = JSON.parse(rawText);
    const text = (result.content && result.content[0] && result.content[0].text) || '';
    console.log('[importHistory] Texte Claude :', text.substring(0, 2000));

    const stripped = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) return json_({status:'error', error:'Extraction échouée. Réponse IA : '+text.substring(0,300)});

    const cleaned = match[0]
      .replace(/'|'/g, "'")
      .replace(/"|"/g, '"')
      .replace(/\r\n|\r/g, '\\n')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch(parseErr) {
      console.error('[importHistory] JSON invalide :', parseErr.message, '| Extrait :', cleaned.substring(0,500));
      return json_({status:'error', error:'JSON invalide : '+parseErr.message+'. Réponse IA : '+text.substring(0,200)});
    }

    // Normaliser
    if (!data.sessions || !Array.isArray(data.sessions)) data.sessions = [];
    data.sessions.forEach(sess => {
      sess.estimatedDate = Boolean(sess.estimatedDate);
      sess.label = String(sess.label || '');
      // Normaliser date → YYYY-MM-DD
      if (sess.date && !/^\d{4}-\d{2}-\d{2}$/.test(String(sess.date))) {
        const m = String(sess.date).match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
        if (m) {
          const y = m[3] ? (m[3].length === 2 ? '20'+m[3] : m[3]) : '2026';
          sess.date = y+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[1]).padStart(2,'0');
        } else { sess.date = ''; sess.estimatedDate = true; }
      }
      (sess.exercises || []).forEach(ex => {
        ex.name = String(ex.name || '').trim();
        ex.note = String(ex.note || '');
        (ex.sets || []).forEach(s => {
          s.kg   = Math.round((parseFloat(s.kg) || 0) * 2) / 2;
          s.reps = parseInt(s.reps) || 0;
          s.type = s.type === 'D' ? 'D' : '';
          s.note = String(s.note || '');
        });
        ex.sets = (ex.sets || []).filter(s => s.reps > 0);
      });
      sess.exercises = (sess.exercises || []).filter(ex => ex.name && ex.sets && ex.sets.length > 0);
    });
    data.sessions = data.sessions.filter(s => s.exercises && s.exercises.length > 0);
    if (!data.sessions.length) return json_({status:'error', error:'Aucune séance trouvée dans le document.'});

    return json_({status:'ok', data});
  } catch(err) {
    return json_({status:'error', error: err.message});
  }
}

// ───────────────────────────────────────────────────────────
// Import d'un plan alimentaire (diététicien : photo/PDF) → repas structurés
function handleImportMealPlan_(body) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey) return json_({status:'error', error:'Clé API Anthropic non configurée'});

  try {
    const images = body.images || [];
    if (!images.length) return json_({status:'error', error:'Aucun fichier reçu'});
    const diet = String(body.diet || '');

    const userContent = images.map(img => {
      if (img.isText || img.type === 'text/plain') {
        return {type:'text', text:'[Fichier : '+(img.name||'document')+']\n\n'+img.data};
      }
      if (img.type === 'application/pdf') {
        return {type:'document', source:{type:'base64', media_type:'application/pdf', data:img.data}};
      }
      return {type:'image', source:{type:'base64', media_type:img.type||'image/jpeg', data:img.data}};
    });

    userContent.push({
      type: 'text',
      text: 'Analyse ce document (plan alimentaire d\'un(e) diététicien(ne) / nutritionniste) et extrais TOUS les repas.\n\nRetourne UNIQUEMENT un objet JSON valide, sans texte avant ni après, sans balises markdown, avec cette structure exacte :\n{"planName":"nom ou objectif du plan","days":[{"label":"Lundi","meals":[{"name":"Petit-déjeuner","foods":["3 œufs","50g de flocons d\'avoine","1 banane"],"kcal":450,"prot":30,"carbs":45,"fat":15}]}]}\n\nRÈGLES STRICTES :\n\n1. JOURS :\n- Si le plan détaille plusieurs jours (Lundi, Mardi… ou Jour 1, Jour 2…) → un objet par jour dans "days", label = le nom du jour.\n- Si le plan décrit UNE journée type (sans distinction de jours) → un seul jour, label = "Journée type".\n- Maximum 7 jours.\n\n2. REPAS :\n- Chaque repas (Petit-déjeuner, Collation, Déjeuner, Goûter, Dîner, Pré/Post-training…) = un objet dans "meals". name = le nom du repas tel qu\'écrit.\n- "foods" = liste des aliments avec leurs quantités, un aliment par entrée, texte fidèle au document (ex. "150g de riz basmati", "200g de poulet").\n\n3. MACROS ET CALORIES :\n- Si le document indique les kcal/protéines/glucides/lipides par repas → reprends-les (nombres entiers, en grammes pour prot/carbs/fat).\n- Si NON indiqués → estime-les au mieux à partir des aliments et quantités (valeurs réalistes). Ne mets jamais 0 si le repas contient des aliments.\n\n4. FIDÉLITÉ : n\'invente pas de repas absents. Ne modifie pas les quantités données. Reprends le plan tel quel.'
        + (diet ? '\n\n5. RÉGIME DE L\'UTILISATEUR : '+diet+'. Si un aliment du plan ne respecte PAS ce régime, garde-le quand même (c\'est le plan du diététicien) mais ajoute " ⚠️" à la fin de la ligne de cet aliment.' : '')
        + '\n\nRéponds UNIQUEMENT avec le JSON, aucun autre texte.'
    });

    const hasText = images.some(img => img.isText || img.type === 'text/plain');
    const hasPdf  = images.some(img => img.type === 'application/pdf');
    const model = (images.length > 1 || hasText || hasPdf) ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001';

    const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify({
        model: model,
        max_tokens: 8192,
        messages: [{role: 'user', content: userContent}]
      }),
      muteHttpExceptions: true
    });

    const rawText = resp.getContentText();
    console.log('[importMealPlan] Réponse brute Claude :', rawText.substring(0, 3000));

    const result = JSON.parse(rawText);
    const text = (result.content && result.content[0] && result.content[0].text) || '';

    const stripped = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) return json_({status:'error', error:'Extraction échouée. Réponse IA : '+text.substring(0,300)});

    const cleaned = match[0]
      .replace(/‘|’/g, "'")
      .replace(/“|”/g, '"')
      .replace(/\r\n|\r/g, '\\n')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch(parseErr) {
      console.error('[importMealPlan] JSON invalide :', parseErr.message, '| Extrait :', cleaned.substring(0,500));
      return json_({status:'error', error:'JSON invalide : '+parseErr.message+'. Réponse IA : '+text.substring(0,200)});
    }

    // Normaliser
    data.planName = String(data.planName || '');
    if (!data.days || !Array.isArray(data.days)) data.days = [];
    data.days = data.days.slice(0, 7);
    data.days.forEach(day => {
      day.label = String(day.label || '');
      (day.meals || []).forEach(m => {
        m.name  = String(m.name || 'Repas');
        m.foods = Array.isArray(m.foods) ? m.foods.map(f => String(f)).filter(Boolean) : [];
        m.kcal  = parseInt(m.kcal)  || 0;
        m.prot  = parseInt(m.prot)  || 0;
        m.carbs = parseInt(m.carbs) || 0;
        m.fat   = parseInt(m.fat)   || 0;
      });
      day.meals = (day.meals || []).filter(m => m.foods.length > 0);
    });
    data.days = data.days.filter(d => d.meals && d.meals.length > 0);
    if (!data.days.length) return json_({status:'error', error:'Aucun repas trouvé dans le document.'});

    return json_({status:'ok', data});
  } catch(err) {
    return json_({status:'error', error: err.message});
  }
}

// ───────────────────────────────────────────────────────────
// Journal alimentaire : estime kcal + macros d'une description libre (texte)
function handleEstimateFood_(body) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey) return json_({status:'error', error:'Clé API Anthropic non configurée'});

  try {
    const desc = String(body.description || '').trim();
    if (!desc) return json_({status:'error', error:'Description vide'});

    const prompt = 'Tu es un expert en nutrition. Estime les valeurs nutritionnelles TOTALES de ce que la personne a mangé.\n\n'
      + 'Repas décrit : "' + desc + '"\n\n'
      + 'Retourne UNIQUEMENT un objet JSON valide, sans texte avant ni après, sans balises markdown :\n'
      + '{"name":"résumé court du repas","kcal":650,"prot":40,"carbs":70,"fat":18}\n\n'
      + 'Règles :\n'
      + '- kcal = calories totales (nombre entier).\n'
      + '- prot, carbs, fat = grammes totaux de protéines, glucides, lipides (nombres entiers).\n'
      + '- Si les quantités ne sont pas précisées, estime une portion normale.\n'
      + '- name = résumé court et propre du repas (max 40 caractères).\n'
      + '- Sois réaliste, ne mets jamais 0 kcal si un aliment est cité.\n'
      + 'Réponds UNIQUEMENT avec le JSON.';

    const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01'},
      payload: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{role:'user', content: prompt}]
      }),
      muteHttpExceptions: true
    });

    const result = JSON.parse(resp.getContentText());
    const text = (result.content && result.content[0] && result.content[0].text) || '';
    const stripped = text.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim();
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) return json_({status:'error', error:'Estimation échouée'});

    let d;
    try { d = JSON.parse(match[0]); }
    catch(e){ return json_({status:'error', error:'JSON invalide'}); }

    return json_({status:'ok',
      name:  String(d.name || desc).slice(0, 60),
      kcal:  Math.max(0, parseInt(d.kcal)  || 0),
      prot:  Math.max(0, parseInt(d.prot)  || 0),
      carbs: Math.max(0, parseInt(d.carbs) || 0),
      fat:   Math.max(0, parseInt(d.fat)   || 0)
    });
  } catch(err) {
    return json_({status:'error', error: err.message});
  }
}

// Lecture du tableau nutritionnel depuis une photo (Claude vision) → valeurs POUR 100 g
function handleFoodLabel_(body) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey) return json_({status:'error', error:'Clé API Anthropic non configurée'});
  try {
    const img = body.image || {};
    if (!img.data) return json_({status:'error', error:'Image manquante'});
    const prompt = 'Tu regardes la photo du tableau des VALEURS NUTRITIONNELLES d\'un produit alimentaire. '
      + 'Lis les valeurs POUR 100 g (colonne "pour 100 g"). Si seule une portion est indiquee, convertis en pour-100g. '
      + 'Retourne UNIQUEMENT un JSON valide, sans texte ni markdown :\n'
      + '{"name":"nom du produit si visible sinon vide","kcal100":99,"prot100":6.1,"carbs100":10,"fat100":3.2,"serving":205}\n\n'
      + 'Regles :\n'
      + '- kcal100 = calories POUR 100 g (depuis les kcal, JAMAIS les kJ).\n'
      + '- prot100/carbs100/fat100 = grammes POUR 100 g (proteines/glucides/lipides), garde 1 decimale si presente.\n'
      + '- serving = taille d\'une portion en grammes si indiquee, sinon 0.\n'
      + '- Si le tableau est illisible ou absent, renvoie {"error":"illisible"}.\n'
      + 'Reponds UNIQUEMENT avec le JSON.';
    const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method:'post',
      headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
      payload: JSON.stringify({
        model:'claude-haiku-4-5-20251001',
        max_tokens:400,
        messages:[{role:'user', content:[
          {type:'image', source:{type:'base64', media_type:(img.type||'image/jpeg'), data:img.data}},
          {type:'text', text:prompt}
        ]}]
      }),
      muteHttpExceptions:true
    });
    const result = JSON.parse(resp.getContentText());
    const text = (result.content && result.content[0] && result.content[0].text) || '';
    const stripped = text.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim();
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) return json_({status:'error', error:'Lecture echouee'});
    let d; try { d = JSON.parse(match[0]); } catch(e){ return json_({status:'error', error:'JSON invalide'}); }
    if (d.error) return json_({status:'error', error:String(d.error)});
    return json_({status:'ok',
      name: String(d.name||'').slice(0,60),
      kcal100: Math.max(0, parseFloat(d.kcal100)||0),
      prot100: Math.max(0, parseFloat(d.prot100)||0),
      carbs100: Math.max(0, parseFloat(d.carbs100)||0),
      fat100: Math.max(0, parseFloat(d.fat100)||0),
      serving: Math.max(0, parseFloat(d.serving)||0)
    });
  } catch(err) { return json_({status:'error', error: err.message}); }
}

// ───────────────────────────────────────────────────────────
// Lit le NUMERO d'un code-barres sur une photo (l'IA lit les chiffres imprimes
// sous les barres) -> renvoie la suite de chiffres, que l'app cherche ensuite
// gratuitement dans Open Food Facts. Pour les produits ou le scan camera galere.
function handleReadBarcode_(body) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey) return json_({status:'error', error:'Clé API Anthropic non configurée'});
  try {
    const img = body.image || {};
    if (!img.data) return json_({status:'error', error:'Image manquante'});
    const prompt = 'Tu regardes la photo d\'un CODE-BARRES de produit (les barres noires verticales avec des chiffres imprimes juste en dessous). '
      + 'Lis le NUMERO du code-barres : la suite de chiffres imprimee sous les barres (en general 8, 12 ou 13 chiffres, format EAN ou UPC). '
      + 'Retourne UNIQUEMENT un JSON valide, sans texte ni markdown :\n'
      + '{"barcode":"3017620422003"}\n\n'
      + 'Regles :\n'
      + '- barcode = uniquement les chiffres, sans espaces ni tirets.\n'
      + '- Renvoie SEULEMENT le code-barres principal du produit (le long numero sous les barres). Ignore les autres numeros visibles (prix, numero de lot, dates, poids).\n'
      + '- Si aucun code-barres n\'est lisible, renvoie {"error":"illisible"}.\n'
      + 'Reponds UNIQUEMENT avec le JSON.';
    const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method:'post',
      headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
      payload: JSON.stringify({
        model:'claude-haiku-4-5-20251001',
        max_tokens:100,
        messages:[{role:'user', content:[
          {type:'image', source:{type:'base64', media_type:(img.type||'image/jpeg'), data:img.data}},
          {type:'text', text:prompt}
        ]}]
      }),
      muteHttpExceptions:true
    });
    const result = JSON.parse(resp.getContentText());
    const text = (result.content && result.content[0] && result.content[0].text) || '';
    const stripped = text.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim();
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) return json_({status:'error', error:'Lecture echouee'});
    let d; try { d = JSON.parse(match[0]); } catch(e){ return json_({status:'error', error:'JSON invalide'}); }
    if (d.error) return json_({status:'error', error:String(d.error)});
    var code = String(d.barcode||'').replace(/\D/g,'');
    if (code.length < 8) return json_({status:'error', error:'Code-barres illisible'});
    return json_({status:'ok', barcode: code});
  } catch(err) { return json_({status:'error', error: err.message}); }
}

// ───────────────────────────────────────────────────────────
function handleMorphoAnalysis_(body) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey) return json_({status:'error', error:'Clé API Anthropic non configurée'});

  try {
    const images = body.images || [];
    if (!images.length) return json_({status:'error', error:'Aucune image reçue'});
    const gender = body.gender || 'H';
    const gLabel = gender === 'F' ? 'femme' : 'homme';

    const userContent = images.map(img => ({
      type: 'image',
      source: { type: 'base64', media_type: img.type || 'image/jpeg', data: img.data }
    }));

    userContent.push({
      type: 'text',
      text: `Analyse les photos de cet(te) ${gLabel} et détermine sa morphologie.\n\nRetourne UNIQUEMENT un objet JSON valide sans texte avant ou après :\n${gender === 'F'
        ? '{"morpho":"H|A|V|X|O","morphotype":"ecto|meso|endo","bodyComp":"description courte de la composition corporelle estimée","strengths":"points forts morphologiques en 1-2 phrases","advice":"conseils nutrition et entraînement personnalisés selon la morphologie en 2-3 phrases"}'
        : '{"morpho":"H|A|T|V|O","morphotype":"ecto|meso|endo","bodyComp":"description courte de la composition corporelle estimée","strengths":"points forts morphologiques en 1-2 phrases","advice":"conseils nutrition et entraînement personnalisés selon la morphologie en 2-3 phrases"}'}\n\nMorphologies ${gender === 'F' ? 'femme' : 'homme'} :\n${gender === 'F'
        ? '- H: Rectangle (épaules/taille/hanches similaires)\n- A: Poire (hanches plus larges)\n- V: Triangle inversé (épaules plus larges)\n- X: Sablier (taille très marquée)\n- O: Ronde (ventre proéminent)'
        : '- H: Rectangle\n- A: Triangle (hanches plus larges)\n- T: Trapèze (épaules légèrement plus larges)\n- V: Triangle inversé (épaules beaucoup plus larges)\n- O: Ovale (ventre proéminent)'}\nMorphotypes : ecto=mince/métabolisme rapide, meso=athlétique, endo=rond/métabolisme lent`
    });

    const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{role: 'user', content: userContent}]
      }),
      muteHttpExceptions: true
    });

    const result = JSON.parse(resp.getContentText());
    const text = (result.content && result.content[0] && result.content[0].text) || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return json_({status:'error', error:'Analyse impossible. Réessaie avec des photos plus nettes.'});

    const data = JSON.parse(match[0]);
    return json_({status:'ok', data});
  } catch(err) {
    return json_({status:'error', error: err.message});
  }
}

// ───────────────────────────────────────────────────────────
// Étude du corps — bilan morpho-postural profond (posture, insertions,
// équilibre, exercices correctifs) en tenant compte de la santé.
function handleBodyStudy_(body) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey) return json_({status:'error', error:'Clé API Anthropic non configurée'});

  try {
    const images = body.images || [];
    if (!images.length) return json_({status:'error', error:'Aucune image reçue'});
    const gender = body.gender === 'F' ? 'femme' : 'homme';
    const age = body.age || '?';
    const goal = body.goal || 'muscle';
    const discipline = body.discipline || 'muscu';
    const health = body.health || {};
    const conditions = (health.conditions || []).join(', ');
    const injuries = (health.injuries || []).map(function(i){ return (i.zone||'') + (i.status?' ('+i.status+')':''); }).join(', ');
    const healthNotes = (health.notes || '').trim();
    const healthTxt = (conditions || injuries || healthNotes)
      ? ('Conditions: ' + (conditions||'aucune') + ' | Blessures: ' + (injuries||'aucune') + (healthNotes?(' | Notes: '+healthNotes):''))
      : 'Aucune information santé fournie';

    // Mode « super testeur » : analyse plus poussée + comparaison avec la série précédente
    const deep = body.deep === true;
    const prevImages = (body.compare === true && Array.isArray(body.prevImages)) ? body.prevImages : [];
    const compare = prevImages.length > 0;

    const userContent = images.map(function(img){
      return { type:'image', source:{ type:'base64', media_type: img.type || 'image/jpeg', data: img.data } };
    });
    // Rappel du rôle de chaque photo (les labels sont envoyés par le front)
    const labelLine = images.map(function(img){ return img.label; }).filter(Boolean).join(', ');
    // Photos de la série précédente (pour la comparaison d'évolution)
    prevImages.forEach(function(img){
      userContent.push({ type:'image', source:{ type:'base64', media_type: img.type || 'image/jpeg', data: img.data } });
    });

    var promptText = 'Tu es un coach expert en morphologie, posture et biomécanique. Analyse ces photos d\'un(e) ' + gender + ' de ' + age + ' ans '
      + '(objectif: ' + goal + ', discipline: ' + discipline + '). '
      + (compare
          ? ('Les ' + images.length + ' PREMIÈRES photos = SÉRIE ACTUELLE (ordre: ' + (labelLine||'non précisé') + '). Les ' + prevImages.length + ' SUIVANTES = SÉRIE PRÉCÉDENTE du ' + (body.prevDate||'?') + (body.prevAnalysis?(' (résumé du bilan précédent: ' + String(body.prevAnalysis).slice(0,400) + ')'):'') + '. Compare la série actuelle à la précédente. ')
          : ('Photos fournies (dans l\'ordre): ' + (labelLine||'non précisé') + '. '))
      + 'Les poses relâchées montrent la posture, les poses contractées révèlent le développement réel et les asymétries.\n\n'
      + 'PROFIL SANTÉ: ' + healthTxt + '. Tes suggestions d\'exercices DOIVENT respecter ces contraintes (éviter/adapter les mouvements à risque) et le mentionner dans "healthNotes".\n\n'
      + 'Analyse ' + (deep?'de façon TRÈS complète et détaillée':'') + ': la stature et la posture (bascule du bassin, épaules enroulées/asymétriques, dos), les insertions musculaires visibles (longueur des muscles, points forts génétiques), l\'ÉQUILIBRE du corps (gauche/droite, haut/bas, agonistes/antagonistes ex. pectoraux vs dos), les points forts et les groupes en retard, et propose des exercices correctifs concrets et prioritaires.\n\n'
      + 'Reste bienveillant, factuel et prudent. Ne pose JAMAIS de diagnostic médical.\n\n'
      + 'Retourne UNIQUEMENT un objet JSON valide, sans texte avant/après, avec EXACTEMENT ces clés:\n'
      + '{' + (compare?'"evolution":"compare la série actuelle à la précédente: ce qui a progressé, ce qui a fondu/pris, les changements de posture/équilibre visibles — en 2-4 phrases concrètes et motivantes",':'') + '"stature":"posture et stature en 2-3 phrases","insertions":"insertions musculaires notables en 2-3 phrases","balance":"évaluation de l\'équilibre gauche/droite, haut/bas, avant/arrière — dis clairement si le corps est globalement équilibré ou non et pourquoi","strengths":"points forts en 1-2 phrases","weaknesses":"groupes musculaires ou zones en retard en 1-2 phrases","exercises":[{"zone":"groupe/zone ciblée","exercises":"2-3 exercices concrets","why":"pourquoi (court)"}],"healthNotes":"comment la santé a été prise en compte / mouvements à éviter ou adapter en 1-2 phrases","summary":"synthèse motivante en 1-2 phrases"}';

    userContent.push({ type:'text', text: promptText });

    const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: { 'Content-Type':'application/json', 'x-api-key': apiKey, 'anthropic-version':'2023-06-01' },
      payload: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: (deep || compare) ? 3072 : 2048,
        messages: [{ role:'user', content: userContent }]
      }),
      muteHttpExceptions: true
    });

    const result = JSON.parse(resp.getContentText());
    const text = (result.content && result.content[0] && result.content[0].text) || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return json_({status:'error', error:'Analyse impossible. Réessaie avec des photos plus nettes et bien cadrées.'});

    const data = JSON.parse(match[0]);
    return json_({status:'ok', data: data});
  } catch(err) {
    return json_({status:'error', error: err.message});
  }
}

// ── Bilan corporel : lire une photo de rapport de balance pro → JSON des valeurs ──
function handleImportBodyScan_(body) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey) return json_({status:'error', error:'Clé API Anthropic non configurée'});
  try {
    // Accepte soit un tableau d'images (tranches d'un long rapport), soit une seule image
    var imgs = (Array.isArray(body.images) && body.images.length)
      ? body.images
      : (body.image ? [{ data: body.image, type: body.imageType || 'image/jpeg' }] : []);
    if (!imgs.length) return json_({status:'error', error:'Aucune image reçue'});
    const multi = imgs.length > 1;
    const userContent = imgs.map(function(im){
      return { type:'image', source:{ type:'base64', media_type: im.type || 'image/jpeg', data: im.data } };
    });
    userContent.push(
      { type:'text', text:
          (multi
            ? ('Ces ' + imgs.length + ' images sont des TRANCHES horizontales successives (de HAUT en BAS, dans l\'ordre) d\'UN SEUL et même rapport de composition corporelle (balance à impédance, type InBody/MyBodyCheck) — un léger recouvrement existe entre elles. Combine-les pour lire le rapport ENTIER. ')
            : 'Ceci est la photo d\'un rapport de composition corporelle (balance à impédance, type InBody/MyBodyCheck). ')
        + 'Lis TOUT le rapport, y compris les sections annexes ("Autres indicateurs", "Score corporel", "Analyse corporelle", "Mon coaching Expert", analyses segmentaires). '
        + 'IMPORTANT : dans les tableaux, une valeur est souvent suivie d\'une PLAGE de référence entre parenthèses '
        + '(ex. "87.50 (60.6-82.0)" ou "18.3 (8.6-17.1)"). Prends UNIQUEMENT le premier nombre (la mesure réelle), IGNORE la plage entre parenthèses.\n'
        + 'Il existe des DIZAINES de balances connectées différentes (Feelfit, InBody, MyBodyCheck, Renpho, Withings, Xiaomi…), avec des libellés, unités et langues variés. Ne te limite PAS à des mots exacts : COMPRENDS le SENS de chaque valeur et mappe-la à la bonne clé, quel que soit le libellé. Chaque clé (et son UNITÉ à respecter) :\n'
        + '- weight = poids total du corps, en kg\n'
        + '- bf = pourcentage de masse grasse (body fat), en %\n'
        + '- fatMass = masse grasse, en kg\n'
        + '- muscle = masse musculaire totale, en kg\n'
        + '- skMuscle = masse musculaire squelettique, en kg (⚠️ jamais un %)\n'
        + '- bone = masse osseuse, en kg\n'
        + '- water = eau corporelle totale, en kg (⚠️ jamais un %)\n'
        + '- protein = protéines, en kg (⚠️ jamais un %)\n'
        + '- visceral = niveau / indice de graisse viscérale, petit nombre entier\n'
        + '- bmr = métabolisme de base (BMR / TMB / taux métabolique de base), en kcal\n'
        + '- metaAge = âge corporel / âge métabolique, en années\n'
        + '- imc = IMC / BMI\n'
        + '- bodyScore = score/note corporel(le) global(e) sur 100 (si présent)\n'
        + '- leanMass = masse maigre / masse corporelle maigre / masse sans graisse, en kg\n'
        + '- subFat = graisse sous-cutanée, en %\n'
        + '- smi = indice de masse musculaire squelettique, en kg/m²\n'
        + '- date = date des mesures, au format YYYY-MM-DD\n'
        + 'DÉTAIL PAR SEGMENT — TRÈS IMPORTANT, NE LE ZAPPE PAS : ces valeurs sont souvent DESSINÉES SUR DES SCHÉMAS DU CORPS (silhouettes), avec des nombres à GAUCHE et à DROITE de la figure. Il y a en général DEUX schémas : un pour la GRAISSE (ex. section "Analyse segmentaire de la graisse") et un pour le MUSCLE (ex. "Équilibre musculaire" / "masse musculaire"). Lis les DEUX. Pour chaque membre, le grand nombre en kg (ex. "0.9 kg", "9.3 kg", "4.0 kg", "11.4 kg") est la valeur — ignore le % et les mots Normal/Élevé/Trop élevé. Mappe : bras gauche/droit → armMuscleL/armMuscleR et armFatL/armFatR ; tronc → trunkMuscle et trunkFat ; jambe gauche/droite → legMuscleL/legMuscleR et legFatL/legFatR (G/gauche/L à gauche, D/droite/R à droite). Si ces schémas sont présents, REMPLIS ces champs — ne les laisse pas vides.\n'
        + '⚠️ RÈGLE D\'UNITÉ ABSOLUE : un champ en kg ne prend QUE des valeurs en kg. Si une donnée n\'est disponible qu\'en POURCENTAGE (ex. "Muscle squelettique 54.7%", "Eau corporelle 61.2%", "Protéine 19.3%", "Taux de ...%"), laisse le champ kg correspondant à null — ne mets JAMAIS un pourcentage dans un champ kg. Ignore "Poids idéal", "Niveau d\'obésité", et toute valeur que tu ne peux pas rattacher avec certitude à une clé.\n'
        + 'Retourne UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après, avec EXACTEMENT ces clés '
        + '("." comme séparateur décimal, null seulement si la valeur est vraiment absente ou illisible) :\n'
        + '{"date":...,"weight":...,"bf":...,"fatMass":...,"muscle":...,"skMuscle":...,"bone":...,"water":...,"protein":...,"visceral":...,"bmr":...,"metaAge":...,"imc":...,'
        + '"bodyScore":...,"leanMass":...,"subFat":...,"smi":...,'
        + '"armMuscleL":...,"armMuscleR":...,"trunkMuscle":...,"legMuscleL":...,"legMuscleR":...,"armFatL":...,"armFatR":...,"trunkFat":...,"legFatL":...,"legFatR":...}. '
        + 'Efforce-toi de remplir un MAXIMUM de champs (ils sont presque tous présents sur ce type de rapport). N\'invente aucun chiffre.' }
    );
    const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method:'post',
      headers:{ 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
      // Haiku 4.5 : bien plus RAPIDE que Sonnet (~5-10 s au lieu de 30-60 s) → la réponse revient
      // avant qu'iOS Safari ne coupe la requête longue (« TypeError: Load failed »). Le rapport est
      // un document net imprimé → Haiku lit les chiffres sans souci (2026-07-13).
      payload: JSON.stringify({ model:'claude-haiku-4-5', max_tokens:1024, messages:[{role:'user', content:userContent}] }),
      muteHttpExceptions:true
    });
    const result = JSON.parse(resp.getContentText());
    const text = (result.content && result.content[0] && result.content[0].text) || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return json_({status:'error', error:'Lecture impossible. Réessaie avec une photo plus nette et bien cadrée.'});
    const data = JSON.parse(match[0]);
    // 🩹 Replis DÉTERMINISTES — jamais d'IA là où une multiplication suffit, on ne complète
    // que depuis des valeurs réellement LUES, et on n'écrase jamais une valeur lue.
    // Étendus le 31/07/2026 (audit « famille du bug d'Eline ») : la masse grasse en kg et le
    // % de masse grasse se déduisent l'un de l'autre quand le poids est lu — beaucoup de
    // balances n'affichent que l'un des deux. L'ordre compte : fatMass/bf AVANT leanMass,
    // pour que la chaîne aboutisse (bf → fatMass → leanMass). Même règle côté app (state.js).
    if ((data.fatMass == null || !isFinite(Number(data.fatMass))) &&
        isFinite(Number(data.weight)) && Number(data.weight) > 0 &&
        isFinite(Number(data.bf)) && Number(data.bf) > 0 && Number(data.bf) < 100) {
      data.fatMass = Math.round(Number(data.weight) * Number(data.bf) / 100 * 10) / 10;
    }
    if ((data.bf == null || !isFinite(Number(data.bf))) &&
        isFinite(Number(data.weight)) && Number(data.weight) > 0 &&
        isFinite(Number(data.fatMass)) && Number(data.fatMass) > 0 &&
        Number(data.fatMass) < Number(data.weight)) {
      data.bf = Math.round(Number(data.fatMass) / Number(data.weight) * 1000) / 10;
    }
    // (30/07/2026, rapport MyBodyCheck d'Eline) : le modèle de lecture
    // rate parfois la « masse maigre » dans la section « Autres indicateurs ». Or elle se DÉDUIT :
    // masse maigre = poids − masse grasse (vérifié sur son rapport : 51.85 − 14.1 = 37.75 ≈ 37.8).
    if ((data.leanMass == null || !isFinite(Number(data.leanMass))) &&
        isFinite(Number(data.weight)) && Number(data.weight) > 0 &&
        isFinite(Number(data.fatMass)) && Number(data.fatMass) > 0 &&
        Number(data.fatMass) < Number(data.weight)) {
      data.leanMass = Math.round((Number(data.weight) - Number(data.fatMass)) * 10) / 10;
    }
    return json_({status:'ok', data: data});
  } catch(err) {
    return json_({status:'error', error: err.message});
  }
}

// ── Bilan sanguin : lit un ou plusieurs pages de résultats de laboratoire → JSON des marqueurs ──
// MÉDICAL : on EXTRAIT seulement (valeur + unité + intervalle de référence du labo). Aucune interprétation.
function handleImportBloodTest_(body) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey) return json_({status:'error', error:'Clé API Anthropic non configurée'});
  try {
    var imgs = (Array.isArray(body.images) && body.images.length)
      ? body.images
      : (body.image ? [{ data: body.image, type: body.imageType || 'image/jpeg' }] : []);
    if (!imgs.length) return json_({status:'error', error:'Aucune image reçue'});
    const multi = imgs.length > 1;
    const userContent = imgs.map(function(im){
      return { type:'image', source:{ type:'base64', media_type: im.type || 'image/jpeg', data: im.data } };
    });
    userContent.push(
      { type:'text', text:
          (multi
            ? ('Ces ' + imgs.length + ' images sont les PAGES successives (dans l\'ordre) d\'UN SEUL et même compte-rendu de laboratoire d\'analyses de sang. Lis-les toutes. ')
            : 'Ceci est un compte-rendu de laboratoire d\'analyses de sang. ')
        + 'Extrais TOUS les marqueurs biologiques présents (numération/hémogramme, biochimie, rein, foie, fer, vitamines, électrolytes, glycémie, lipides, hormones/thyroïde, etc.). '
        + 'Pour CHAQUE marqueur, prends : le nom exact, la valeur mesurée (la plus récente si plusieurs colonnes de dates), l\'unité, et l\'intervalle de référence du labo (borne basse et haute). '
        + 'Quand une valeur est donnée en 2 unités (ex. "16,7 g/dL" et une autre ligne), garde la ligne principale (celle avec l\'intervalle le plus lisible). '
        + 'N\'INTERPRÈTE RIEN, ne dis pas si c\'est normal ou non, n\'ajoute aucun commentaire médical : tu ne fais que RECOPIER les chiffres du rapport. N\'invente aucune valeur. '
        + 'Récupère aussi la DATE de prélèvement (format YYYY-MM-DD) si présente.\n'
        + 'Réponds UNIQUEMENT par un objet JSON valide, sans texte avant/après, de cette forme EXACTE :\n'
        + '{"date":"YYYY-MM-DD ou null","markers":[{"name":"Ferritine","group":"Fer & vitamines","value":293,"unit":"µg/L","low":30,"high":400}, ...]}\n'
        + 'Le champ "group" = une catégorie courte que tu déduis (ex. "Hémogramme", "Rein", "Foie", "Fer & vitamines", "Électrolytes", "Glycémie & lipides", "Thyroïde"). '
        + 'value = nombre. low/high = bornes de l\'intervalle (nombres) ou null si absentes/texte du type "< 50" (dans ce cas low=null, high=50) ou "> 10" (low=10, high=null).' }
    );
    const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method:'post',
      headers:{ 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
      payload: JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:4096, messages:[{role:'user', content:userContent}] }),
      muteHttpExceptions:true
    });
    const result = JSON.parse(resp.getContentText());
    const text = (result.content && result.content[0] && result.content[0].text) || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return json_({status:'error', error:'Lecture impossible. Réessaie avec des photos plus nettes.'});
    const data = JSON.parse(match[0]);
    return json_({status:'ok', data: data});
  } catch(err) {
    return json_({status:'error', error: err.message});
  }
}

// ── Boîte à idées des testeurs — stockage (lecture via doGet ?action=getIdees) ──
function handleTesterIdea_(body) {
  try {
    const ps = PropertiesService.getScriptProperties();
    let arr = [];
    try { arr = JSON.parse(ps.getProperty('TESTER_IDEAS') || '[]'); } catch(e) { arr = []; }
    arr.push({
      date:  body.date  || new Date().toISOString(),
      name:  String(body.name  || ''),
      email: String(body.email || ''),
      text:  String(body.text  || ''),
      photos: body.photos || 0
    });
    if (arr.length > 300) arr = arr.slice(-300); // garde les 300 dernières
    ps.setProperty('TESTER_IDEAS', JSON.stringify(arr));
    // Envoi mail avec les PHOTOS EN PIÈCES JOINTES (texte + photos ENSEMBLE — fix Christophe #13).
    // Les photos ne sont PAS stockées dans la propriété (trop lourdes) : elles vivent dans le mail.
    try {
      var atts = [];
      var imgs = body.images || [];
      for (var i = 0; i < imgs.length; i++) {
        if (imgs[i] && imgs[i].data) {
          try { atts.push(Utilities.newBlob(Utilities.base64Decode(imgs[i].data), imgs[i].type || 'image/jpeg', 'idee-' + (i + 1) + '.jpg')); } catch (eB) {}
        }
      }
      // Les DEUX boîtes (31/07/2026) : Michel attendait le mail sur sa boîte perso — il ne
      // surveillera pas deux boîtes. En dur comme PREMIUM_HARDCODED_ (les Script Properties
      // libres ne persistent pas de façon fiable sur ce projet).
      GmailApp.sendEmail('forcetracker.app@gmail.com,michdu75@gmail.com',
        '💡 Force Tracker — nouvelle idée' + (body.name ? ' de ' + body.name : ''),
        'Nouvelle idée dans la boîte à idées :\n\n'
        + 'Date : ' + (body.date || new Date().toISOString()) + '\n'
        + 'De   : ' + (body.name || '?') + ' <' + (body.email || '?') + '>\n'
        + 'Photos jointes : ' + atts.length + '\n\n'
        + '--- Idée ---\n' + (body.text || '(vide)') + '\n------------\n\n'
        + '— Force Tracker (boîte à idées automatique)',
        atts.length ? { attachments: atts } : {});
    } catch (eMail) { _logMailFail_('idee ' + (body.name || '?'), eMail); }
    return json_({status:'ok'});
  } catch(err) {
    return json_({status:'error', error: err.message});
  }
}

// ── Journal des ÉCHECS d'envoi de mail (31/07/2026, message de Christophe jamais reçu) ──
// Avant : un échec de GmailApp était avalé par un catch VIDE → panne de mail INVISIBLE,
// personne ne pouvait savoir qu'un maillon avait lâché. Maintenant chaque échec s'écrit
// ici (les 50 derniers), lisible via ?action=mailFails&token=… (même token que getIdees).
function _logMailFail_(quoi, err) {
  try {
    var sp = PropertiesService.getScriptProperties();
    var arr = [];
    try { arr = JSON.parse(sp.getProperty('MAIL_FAILS') || '[]'); } catch(e) { arr = []; }
    arr.push({ date: new Date().toISOString(), quoi: String(quoi || ''), err: String((err && err.message) || err || '?') });
    if (arr.length > 50) arr = arr.slice(-50);
    sp.setProperty('MAIL_FAILS', JSON.stringify(arr));
  } catch(e2) {}
}

// ───────────────────────────────────────────────────────────
function handleCoach_(body) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey) {
    return json_({reply: '🔑 Clé API Anthropic non configurée. Dans Apps Script : Projet > Paramètres > Propriétés du script, ajoute ANTHROPIC_API_KEY.'});
  }

  try {
    const history = (body.history || []).slice(-8);
    const ctx = body.context || '';
    const memory = body.coachMemory || '';

    // Construire le contenu du dernier message (texte + image optionnelle)
    let userContent;
    if (body.image) {
      userContent = [
        { type: 'image', source: { type: 'base64', media_type: body.imageType || 'image/jpeg', data: body.image } },
        { type: 'text', text: String(body.message || 'Analyse cette photo de mon corps.') }
      ];
    } else {
      userContent = String(body.message || '');
    }

    const messages = history.concat([{role:'user', content: userContent}]);

    const systemPrompt = String(ctx) +
      (memory ? '\n\nMÉMOIRE CONVERSATIONS PRÉCÉDENTES:\n' + memory : '');

    // Milo : modèle selon l'utilisateur (valeurs dans les Script Properties, pas en dur)
    var sp = PropertiesService.getScriptProperties();
    var coachModel = 'claude-haiku-4-5-20251001';
    var em = String(body.email || '').toLowerCase().trim();
    var perUser = {
      'michdu75@gmail.com':            sp.getProperty('COACH_MODEL_MICHEL'),
      'christophe@famillelanglois.fr': sp.getProperty('COACH_MODEL_CHRISTOPHE')
    };
    if (perUser[em]) coachModel = perUser[em];

    const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify({
        model:      coachModel,
        max_tokens: 1024,
        system:     systemPrompt,
        messages:   messages
      }),
      muteHttpExceptions: true
    });

    const result = JSON.parse(resp.getContentText());
    const reply  = (result.content && result.content[0] && result.content[0].text) || 'Désolé, réessaie.';
    return json_({reply});
  } catch(err) {
    return json_({reply: 'Erreur Coach IA : ' + err.message});
  }
}

function handleGenerateMealPlan_(body) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey) return json_({status:'error', message:'Clé API manquante'});
  try {
    var ctx = String(body.context || '');
    var scope = body.scope || 'day';
    var startDate = body.startDate || new Date().toISOString().split('T')[0];
    var regenDay = body.regenDay || null;
    var regenMeal = body.regenMeal || null;
    var userMsg, maxTokens;
    if (regenMeal && regenDay) {
      userMsg = 'Régénère UNIQUEMENT le repas "' + regenMeal + '" pour la date ' + regenDay + '.\n'
        + 'Retourne UNIQUEMENT ce JSON (un seul repas) :\n'
        + '{"days":[{"date":"' + regenDay + '","meals":[{"name":"' + regenMeal + '","foods":["Aliment 1","Aliment 2"],"kcal":0,"prot":0,"carbs":0,"fat":0}]}]}';
      maxTokens = 512;
    } else {
      var days = scope === 'week' ? 7 : 1;
      var dates = [];
      var d0 = new Date(startDate + 'T12:00:00');
      for (var i = 0; i < days; i++) {
        var di = new Date(d0.getTime()); di.setDate(d0.getDate() + i);
        dates.push(di.toISOString().split('T')[0]);
      }
      userMsg = 'Génère un plan de repas pour ' + (days === 1 ? '1 jour' : '7 jours') + '.\n'
        + 'Dates exactes : ' + dates.join(', ') + '\n'
        + 'Retourne UNIQUEMENT le JSON, sans texte avant ou après.';
      maxTokens = scope === 'week' ? 3500 : 900;
    }
    var systemPrompt = 'Tu es un diététicien sportif. Génère un plan de repas adapté au profil fourni.\n\n'
      + 'RÈGLE ABSOLUE : réponds UNIQUEMENT avec du JSON valide, sans aucun texte avant ou après.\n\n'
      + 'Format exact (respecte les emojis dans "name") :\n'
      + '{"days":[{"date":"YYYY-MM-DD","meals":['
      + '{"name":"🌅 Petit-déjeuner","foods":["Avoine 80g","Œufs brouillés (3)","Lait 200ml"],"kcal":420,"prot":28,"carbs":55,"fat":12},'
      + '{"name":"🍽️ Déjeuner","foods":["Poulet grillé 150g","Riz basmati 100g","Brocolis 100g"],"kcal":580,"prot":45,"carbs":65,"fat":14},'
      + '{"name":"🌙 Dîner","foods":["Saumon 130g","Patate douce 150g","Haricots verts"],"kcal":480,"prot":38,"carbs":40,"fat":18},'
      + '{"name":"🍎 Collation","foods":["Yaourt grec 200g","Noix 20g"],"kcal":220,"prot":16,"carbs":12,"fat":11}'
      + ']}]}\n\n'
      + 'Règles :\n'
      + '- Exactement 4 repas par jour (Petit-déjeuner, Déjeuner, Dîner, Collation)\n'
      + '- 2 à 4 aliments par repas avec quantités précises (en grammes ou unités)\n'
      + '- Macros cohérentes avec le profil fourni, s\'additionnant proches des cibles\n'
      + '- Aliments réalistes et disponibles en France\n'
      + '- Sur 7 jours : varie les plats (pas le même dîner deux jours consécutifs)';
    var payload = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{role:'user', content: ctx + '\n\n' + userMsg}]
    };
    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    var result = JSON.parse(resp.getContentText());
    if (result.error) return json_({status:'error', message: result.error.message});
    var raw = (result.content && result.content[0] && result.content[0].text || '').trim();
    var parsed;
    try {
      var m = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(m ? m[0] : raw);
    } catch(pe) { return json_({status:'error', message:'Format JSON invalide : '+raw.substring(0,100)}); }
    return json_({status:'ok', plan: parsed});
  } catch(err) { return json_({status:'error', message: err.message}); }
}

function handleSummarizeCoach_(body) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey) return json_({summary: ''});
  try {
    const email = (body.email || '').toLowerCase().trim();
    const history = (body.history || []).slice(-16);
    const existing = body.existingMemory || '';
    const histText = history.map(function(m) {
      var role = m.role === 'user' ? 'Utilisateur' : 'Coach';
      var content = typeof m.content === 'string' ? m.content :
        (Array.isArray(m.content) ? m.content.filter(function(c){return c.type==='text';}).map(function(c){return c.text;}).join(' ') : '');
      return role + ': ' + content.substring(0, 400);
    }).join('\n');
    const prompt = (existing ? 'Mémoire existante : ' + existing + '\n\n' : '') +
      'Résume cette conversation coach/athlète en 2-3 phrases max (garde : objectifs, conseils clés, décisions, problèmes identifiés). Français uniquement.\n\nConversation :\n' + histText + '\n\nRésumé :';
    const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
      payload: JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:250,messages:[{role:'user',content:prompt}]}),
      muteHttpExceptions: true
    });
    const result = JSON.parse(resp.getContentText());
    const summary = (result.content && result.content[0] && result.content[0].text) || '';
    if (email && summary) {
      const userData = loadUserData_(email) || {};
      if (!userData.profile) userData.profile = {};
      userData.profile.coachMemory = summary;
      userData.updatedAt = new Date().toISOString();
      saveUserData_(email, userData);
    }
    return json_({summary});
  } catch(err) {
    return json_({summary: '', error: err.message});
  }
}


// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// BACKUP DRIVE — 1 fichier JSON par jour dans ForceTracker-Backups/
// Politique : JAMAIS supprimé, JAMAIS écrasé (append-only).
// Si le trigger tourne 2× le même jour → suffixe -HH-mm dans le nom.
// Seul le script serveur a accès au dossier Drive.
// ═══════════════════════════════════════════════════════════

function _getDriveBackupFolder_() {
  const props = PropertiesService.getScriptProperties();
  const stored = props.getProperty('ft_backup_drive_folder_id');
  if (stored) {
    try { return DriveApp.getFolderById(stored); } catch(e) {}
  }
  const it = DriveApp.getFoldersByName('ForceTracker-Backups');
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder('ForceTracker-Backups');
  props.setProperty('ft_backup_drive_folder_id', folder.getId());
  Logger.log('[FT backup] Dossier Drive ID : ' + folder.getId());
  return folder;
}

function backupAllUserData_() {
  try {
    const props = PropertiesService.getScriptProperties();
    const all = props.getProperties();
    const now = new Date();
    const folder = _getDriveBackupFolder_();

    const dateStr = Utilities.formatDate(now, 'Europe/Paris', 'yyyy-MM-dd');
    const timeStr = Utilities.formatDate(now, 'Europe/Paris', 'HH-mm');

    // backup-YYYY-MM-DD.json — si déjà présent (2e exécution du jour) → suffixe -HH-mm
    let fileName = 'backup-' + dateStr + '.json';
    if (folder.getFilesByName(fileName).hasNext()) {
      fileName = 'backup-' + dateStr + '-' + timeStr + '.json';
    }

    const userKeys = Object.keys(all).filter(k => k.startsWith('u_'));
    const users = [];
    userKeys.forEach(k => {
      try {
        const data = JSON.parse(_unpackUser_(all[k]));
        users.push({ email: data.email || k.slice(2), data: data });
      } catch(e) {
        Logger.log('[FT backup] Parse err ' + k + ' : ' + e.message);
      }
    });

    folder.createFile(fileName, JSON.stringify({
      backed_up_at: now.toISOString(),
      user_count: users.length,
      users: users
    }), 'application/json');

    Logger.log('[FT backup Drive] ' + fileName + ' — ' + users.length + ' users');

    // Comptage des fichiers — alerte si le dossier grossit trop (jamais de suppression auto)
    try {
      let fileCount = 0;
      const fi = folder.getFiles();
      while (fi.hasNext()) { fi.next(); fileCount++; }
      if (fileCount > 1000) {
        Logger.log('[FT backup ⚠️ ALERTE DRIVE] ' + fileCount + ' fichiers dans ForceTracker-Backups/'
          + ' — penser à archiver manuellement (NE JAMAIS supprimer automatiquement).');
      } else {
        Logger.log('[FT backup Drive] Dossier : ' + fileCount + ' fichier(s) au total');
      }
    } catch(e) { /* quota check non bloquant */ }

  } catch(err) {
    Logger.log('[FT backup Drive] ERREUR : ' + err.message);
  }
}

// Migre les anciens onglets "Backup ..." du Sheet → Drive (sécurité d'abord).
// Idempotent : ne recrée pas un fichier déjà présent dans Drive.
function migrateSheetBackupsToDrive_() {
  const ss = _getSheet_();
  const folder = _getDriveBackupFolder_();
  const sheets = ss.getSheets().filter(s => s.getName().startsWith('Backup '));
  let migrated = 0, skipped = 0;

  sheets.forEach(sh => {
    const name = sh.getName(); // "Backup YYYY-MM-DD HH:mm"
    // → "backup-migration-YYYY-MM-DD-HHmm.json"
    const suffix = name.replace('Backup ', '').replace(' ', '-').replace(':', '');
    const fileName = 'backup-migration-' + suffix + '.json';

    if (folder.getFilesByName(fileName).hasNext()) { skipped++; return; }

    try {
      const rows = sh.getDataRange().getValues();
      const users = [];
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r[0]) continue;
        try {
          users.push({ email: r[0], data: JSON.parse(r[1]), backed_up_at: r[2] });
        } catch(e) {
          users.push({ email: r[0], raw_truncated: String(r[1]), backed_up_at: r[2] });
        }
      }
      folder.createFile(fileName, JSON.stringify({
        source: 'migration_from_sheet',
        sheet_name: name,
        migrated_at: new Date().toISOString(),
        user_count: users.length,
        users: users
      }), 'application/json');
      migrated++;
      Logger.log('[FT migrate] ' + fileName + ' — ' + users.length + ' users');
    } catch(e) {
      Logger.log('[FT migrate] Erreur ' + name + ' : ' + e.message);
    }
  });

  Logger.log('[FT migrate] Total : ' + migrated + ' migrés, ' + skipped + ' déjà présents.');
  return { migrated: migrated, skipped: skipped, total: sheets.length };
}

// Lance le backup une seule fois dans les 5 prochaines minutes (one-shot trigger)
function scheduleOneTimeBackup_() {
  ScriptApp.newTrigger('backupAllUserData_')
    .timeBased()
    .after(60 * 1000) // dans 1 minute
    .create();
  Logger.log('Déclencheur one-shot créé — backup dans ~1 min');
}

// ⭐ LE BOUTON « RÉPARER LA SAUVEGARDE », visible dans l'IDE (04/08/2026).
//
// ⚠️ POURQUOI CETTE FONCTION EXISTE, et pourquoi elle n'a PAS d'underscore final.
// On a découvert le 04/08 que la sauvegarde nocturne ne tournait plus depuis 36 JOURS,
// sans le moindre signal. Deux chemins étaient censés la réinstaller, et AUCUN des DEUX
// ne marchait :
//   ① l'URL `?action=installDailyBackup&t=…` → refusée, parce que le jeton est comparé à
//      la Script Property `BACKUP_TOKEN` qui ne contient pas cette valeur. Pire : quand le
//      jeton est faux, le `if` retombe sur le fourre-tout et répond « Unknown GET action ».
//      Un jeton invalide devient donc INDISCERNABLE d'une route inexistante — on cherche
//      un bug de route pendant que c'est un problème d'authentification.
//   ② « depuis l'IDE, Run > installDailyBackupTrigger_ » — consigne écrite juste ici, et
//      qui NE PEUT PAS marcher : dans Apps Script, une fonction dont le nom finit par `_`
//      est privée et n'apparaît JAMAIS dans le menu déroulant d'exécution.
//
// Autrement dit, le filet de sécurité avait deux cordes et les deux étaient coupées. Une
// procédure de secours qu'on ne teste jamais n'est pas une procédure de secours.
// D'où cette fonction PUBLIQUE (sans underscore) qui fait tout d'un coup et écrit le
// résultat dans les journaux, pour qu'on puisse VOIR qu'elle a marché.
// ─── SOUPAPE DE LA LECTURE STRICTE — rouvrir en 30 s, sans redéployer ──────────────────────
// Un correctif d'authentification qu'on ne peut pas annuler vite est un correctif dangereux :
// si quelque chose se passe mal, il faut pouvoir rendre l'accès AVANT de comprendre pourquoi.
// (C'est la règle d'or n°8 — « rollback en 1 ligne » — appliquée au backend.)
function ouvrirLectureTemporairement() {
  PropertiesService.getScriptProperties().setProperty('LECTURE_STRICTE', 'off');
  var relu = PropertiesService.getScriptProperties().getProperty('LECTURE_STRICTE');
  Logger.log(relu === 'off'
    ? '🔓 LECTURE ROUVERTE (ancien comportement). ⚠️ La fuite est de nouveau ouverte : à refermer dès que possible.'
    : '❌ ÉCHEC : la propriété ne s\'est pas enregistrée (relu : ' + relu + ').');
}
function refermerLecture() {
  PropertiesService.getScriptProperties().deleteProperty('LECTURE_STRICTE');
  var relu = PropertiesService.getScriptProperties().getProperty('LECTURE_STRICTE');
  Logger.log(!relu ? '🔒 LECTURE STRICTE ACTIVE — un compte sans code perso n\'est plus téléchargeable.'
                   : '❌ ÉCHEC : la propriété est toujours là (' + relu + ').');
}
// Dit qui est protégé et qui ne l'est pas, sans rien révéler d'autre qu'un oui/non.
function quiEstProtege() {
  var sp = PropertiesService.getScriptProperties();
  var strict = sp.getProperty('LECTURE_STRICTE') !== 'off';
  Logger.log('Lecture stricte : ' + (strict ? '🔒 ACTIVE' : '🔓 DÉSACTIVÉE (soupape ouverte)'));
  PREMIUM_HARDCODED_.forEach(function(e){
    var has = (sp.getProperty('auth_' + e) || '').length >= 20;
    Logger.log((has ? '🔒 ' : '🔓 ') + e + (has ? ' — code posé' : ' — AUCUN code'
      + (strict ? ' (lecture refusée, écriture toujours possible)' : ' (TÉLÉCHARGEABLE)')));
  });
}

// ─── JETON D'ADMINISTRATION — POSE ET VÉRIFICATION DEPUIS L'IDE ────────────────────────────
// ⚠️ POURQUOI CETTE FONCTION EXISTE (07/08/2026). Michel, en posant la propriété à la main :
// « google bloque à chaque fois ». Et c'est précisément cet argument — « les Script Properties
// ne persistent pas sur ce projet » — qui avait fait choisir, le 12/07, un HASH EN DUR dans le
// code… c'est-à-dire la faille elle-même. On ne peut donc pas se contenter d'espérer que le
// formulaire tienne : un correctif de sécurité qui dépend d'un formulaire capricieux n'est pas
// un correctif. Écrire la propriété DEPUIS LE CODE ne passe pas par ce formulaire du tout.
//
// ⚠️ ET LE SECRET NE TOUCHE JAMAIS LE DÉPÔT : la fonction le TIRE AU SORT et l'affiche dans le
// journal d'exécution. Michel le recopie une fois sur son téléphone. Rien à écrire ici, donc
// rien à faire fuiter — c'est exactement l'erreur qu'on est en train de réparer.
function poserJetonAdmin() {
  var P = PropertiesService.getScriptProperties();
  var actuel = P.getProperty('IDEES_TOKEN2');
  if (actuel && String(actuel).length >= 12) {
    // On ne réaffiche JAMAIS un secret déjà posé : de quoi le reconnaître, pas de quoi le voler.
    Logger.log('✅ DÉJÀ POSÉ — IDEES_TOKEN2 existe (' + String(actuel).length + ' caractères, '
      + 'commence par « ' + String(actuel).slice(0, 3) + '… »). Rien à faire.');
    Logger.log('   Pour en remettre un neuf : lance d\'abord effacerJetonAdmin(), puis relance celle-ci.');
    return;
  }
  var al = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var t = 'ft_';
  for (var i = 0; i < 40; i++) t += al.charAt(Math.floor(Math.random() * al.length));
  P.setProperty('IDEES_TOKEN2', t);
  // ⚠️ ON RELIT AU LIEU DE CROIRE L'ÉCRITURE — c'est tout le sujet : la question n'est pas
  // « a-t-on appelé setProperty ? » mais « la valeur est-elle VRAIMENT là ? ».
  // On vérifie l'EFFET, jamais le retour de la fonction qui prétend l'avoir produit.
  var relu = P.getProperty('IDEES_TOKEN2');
  if (relu !== t) {
    Logger.log('❌ ÉCHEC : la propriété ne s\'est pas enregistrée (relu : ' + (relu || 'rien') + ').');
    Logger.log('   NE PAS déployer le correctif dans cet état — les routes d\'admin resteraient fermées.');
    return;
  }
  Logger.log('✅ POSÉ ET RELU. Recopie ce jeton dans l\'app (Profil → Admin, il sera demandé une fois) :');
  Logger.log('');
  Logger.log('        ' + t);
  Logger.log('');
  Logger.log('⚠️ Ne le partage pas, ne le photographie pas avec autre chose à l\'écran.');
}
// Dit si le jeton est là, SANS le révéler. Sert à vérifier après coup qu'il a tenu.
function verifierJetonAdmin() {
  var v = PropertiesService.getScriptProperties().getProperty('IDEES_TOKEN2');
  if (!v) { Logger.log('❌ ABSENT — les routes d\'administration sont FERMÉES (repli volontaire).'); return; }
  if (String(v).length < 12) { Logger.log('⚠️ TROP COURT (' + String(v).length + ') — refusé par sécurité.'); return; }
  Logger.log('✅ PRÉSENT — ' + String(v).length + ' caractères, commence par « ' + String(v).slice(0, 3) + '… ».');
}
// Retire le jeton. Referme les routes d'admin : à n'utiliser que pour en poser un neuf.
function effacerJetonAdmin() {
  PropertiesService.getScriptProperties().deleteProperty('IDEES_TOKEN2');
  Logger.log('🗑️ Effacé. Les routes d\'administration sont fermées. Lance poserJetonAdmin() pour un nouveau.');
}

function reparerSauvegardeNuit() {
  installDailyBackupTrigger_();
  var n = ScriptApp.getProjectTriggers()
            .filter(function(t){ return t.getHandlerFunction() === 'backupAllUserData_'; }).length;
  var res;
  try { backupAllUserData_(); } catch (e) { res = 'ERREUR pendant la sauvegarde : ' + e; }

  // ⚠️ ON NE FAIT PAS CONFIANCE À LA VALEUR DE RETOUR : `backupAllUserData_` ne renvoie
  // RIEN (elle journalise). Une première version affichait donc « sauvegarde immédiate :
  // undefined » — un mot creux, là où on attendait la seule preuve qui compte. On va
  // DONC RELIRE le dossier Drive : le fichier le plus récent, sa date, sa taille.
  // Vérifier l'effet, jamais le retour de la fonction qui prétend l'avoir produit.
  if (!res) {
    try {
      var recent = null;
      var it = _getDriveBackupFolder_().getFiles();
      while (it.hasNext()) {
        var f = it.next();
        if (!recent || f.getDateCreated() > recent.getDateCreated()) recent = f;
      }
      res = recent
        ? ('dernier fichier « ' + recent.getName() + ' » du '
           + Utilities.formatDate(recent.getDateCreated(), 'Europe/Paris', 'dd/MM/yyyy à HH:mm')
           + ' — ' + Math.round(recent.getSize() / 1024) + ' Ko')
        : '⚠️ AUCUN fichier dans le dossier de sauvegarde !';
    } catch (e) { res = 'dossier Drive illisible : ' + e; }
  }

  var msg = '[FT] Déclencheurs de sauvegarde actifs : ' + n
          + ' (attendu : 1) — ' + res;
  Logger.log(msg); console.log(msg);
  return msg;
}

// ⭐ PROUVER QUE LE PLANIFICATEUR TOURNE — sans attendre 2h du matin (04/08/2026).
//
// ⚠️ LA DISTINCTION QUI COMPTE, et qui a coûté 36 jours. Lancer `reparerSauvegardeNuit()`
// à la main prouve que le CODE de sauvegarde marche. Ça ne prouve PAS que Google
// DÉCLENCHE quoi que ce soit sur ce projet — or c'est exactement ce qui était mort :
// le déclencheur avait disparu et personne ne s'en apercevait, parce que tout ce qu'on
// vérifiait, c'était le code. *Vérifier la pièce ne vérifie pas le mécanisme qui l'actionne.*
//
// Ces deux fonctions posent un déclencheur à 1 minute qui n'écrit qu'une DATE, puis se
// supprime lui-même. Coût nul, aucune sauvegarde parasite, et la réponse en 2 minutes :
//   1. Exécuter `testerDeclencheur()`   → arme le test
//   2. Attendre ~2 minutes
//   3. Exécuter `voirResultatDeclencheur()` → dit si Google l'a lancé, et à quelle heure
function testerDeclencheur() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'preuveDeclencheur') ScriptApp.deleteTrigger(t);
  });
  PropertiesService.getScriptProperties().deleteProperty('PREUVE_DECLENCHEUR');
  ScriptApp.newTrigger('preuveDeclencheur').timeBased().after(60 * 1000).create();
  var msg = '[FT] Test armé — déclencheur posé pour dans ~1 minute. '
          + 'Attends 2 minutes puis exécute voirResultatDeclencheur().';
  Logger.log(msg); console.log(msg);
  return msg;
}

// Lancée PAR le déclencheur, jamais à la main. Elle n'écrit qu'une date, puis se retire.
//
// ⚠️ ET ELLE REFUSE DE TOURNER À LA MAIN, ce n'est pas une simple consigne. Michel a posé
// la bonne question en voyant les trois fonctions dans le menu : « et preuveDeclencheur ? »
// Si on la lance soi-même, on écrit la date soi-même — et `voirResultatDeclencheur()`
// affiche alors un ✅ qui ne prouve RIEN. *Un test qu'on peut réussir en le faisant
// soi-même ne teste rien*, et un faux vert sur une sauvegarde est exactement le genre de
// mensonge qui a coûté 36 jours. Un appel par déclencheur reçoit un événement `e` ; un
// appel manuel n'en reçoit pas. On s'appuie donc sur le mécanisme, pas sur la mémoire.
function preuveDeclencheur(e) {
  if (!e) {
    var m = '[FT] ⛔ Ne lance PAS cette fonction à la main : c\'est Google qui doit la lancer, '
          + 'c\'est tout l\'objet du test. Lance testerDeclencheur(), attends 2 minutes, '
          + 'puis voirResultatDeclencheur().';
    Logger.log(m); console.log(m);
    return m;
  }
  PropertiesService.getScriptProperties()
    .setProperty('PREUVE_DECLENCHEUR', new Date().toISOString());
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'preuveDeclencheur') ScriptApp.deleteTrigger(t);
  });
}

// ⭐ SUPPRIMER UN COMPTE DE TEST — étroit, explicite, à usage unique (05/08/2026).
//
// ⚠️ POURQUOI CETTE FONCTION EST NOMMÉE EN DUR, et ne prend PAS d'adresse en paramètre.
// Une fonction « supprime le compte que tu veux » listée dans l'IDE, c'est une arme posée
// sur la table : un jour quelqu'un la lance sur la mauvaise adresse et il n'y a pas de
// retour en arrière. Ici l'adresse est écrite dans le code, relue à froid, et la fonction
// ne sait faire que ça. Pour un autre compte : on modifie le code, on relit, on redéploie.
//
// Contexte : `apollonone75@gmail.com` était un compte de TEST, retiré des deux listes
// premium le 05/08 (Code.js + constants.js, ce dernier étant servi publiquement — donc
// n'importe qui pouvait taper l'adresse et obtenir le premium). Ses empreintes de code
// d'accès ont par ailleurs circulé sur une photo. On efface tout ce qui le concerne.
function supprimerCompteTest() {
  var CIBLE = 'apollonone75@gmail.com';
  var sp = PropertiesService.getScriptProperties();
  var cles = ['u_' + CIBLE, 'auth_' + CIBLE, 'authfail_' + CIBLE, 'prem_' + CIBLE, 'confirmed_' + CIBLE];
  var faits = [], absents = [];
  cles.forEach(function (k) {
    if (sp.getProperty(k) != null) { sp.deleteProperty(k); faits.push(k); }
    else absents.push(k);
  });
  // On RELIT après suppression : on vérifie l'effet, jamais le fait d'avoir appelé la fonction.
  var restants = cles.filter(function (k) { return sp.getProperty(k) != null; });
  var m = '[FT] Compte de test « ' + CIBLE + ' » — supprimé : ' + (faits.join(', ') || '(rien)')
        + ' · déjà absent : ' + (absents.join(', ') || '(aucun)')
        + (restants.length ? ' · ⚠️ RESTE ENCORE : ' + restants.join(', ') : ' · ✅ plus rien ne subsiste.');
  Logger.log(m); console.log(m);
  return m;
}

// ⭐ CHANGER LE MODÈLE DE MILO POUR MICHEL — sans ouvrir la page des propriétés (04/08/2026).
//
// ⚠️ POURQUOI PASSER PAR UNE FONCTION. La valeur vit dans la Script Property
// `COACH_MODEL_MICHEL`, et cette page affiche AUSSI `ANTHROPIC_API_KEY`, `ADMIN_TOKEN` et
// `KOFI_TOKEN` **en clair**. Y envoyer quelqu'un pour changer un mot, c'est lui faire ouvrir
// ses secrets sans raison — et une soirée de captures d'écran suffit à en faire fuiter un.
// *Une opération courante ne doit jamais obliger à exposer un secret.*
//
// Le contexte : le compte de Michel tourne sur Opus et pèse ~93 % de la facture IA, alors
// que les vrais utilisateurs sont sur Haiku — ce qui est aussi un problème d'évaluation
// (R9 : on doit juger Milo sur le modèle RÉELLEMENT utilisé). `claude-sonnet-4-6` est déjà
// employé ailleurs dans ce fichier : l'identifiant est éprouvé.
// Les deux fonctions affichent l'ANCIENNE valeur avant de changer, pour pouvoir revenir.
// ⭐ LISTER LA CONFIG SANS EXPOSER UN SEUL SECRET (04/08/2026).
//
// ⚠️ POURQUOI. Michel est certain d'avoir réglé son modèle sur Opus ; la propriété
// `COACH_MODEL_MICHEL` est pourtant absente. Avant d'accuser qui que ce soit, il faut
// REGARDER — mais la page des Script Properties affiche `ANTHROPIC_API_KEY`, `ADMIN_TOKEN`
// et `KOFI_TOKEN` **en clair**, donc on ne l'ouvre pas pour une simple vérification.
// Cette fonction ne rend que les **NOMS** et une **empreinte** (longueur + 3 premiers
// caractères pour les valeurs non sensibles) : assez pour savoir ce qui existe, jamais
// assez pour divulguer une clé.
// ⚠️ Les comptes utilisateurs (`u_`, `auth_`, `prem_`, `confirmed_`) sont comptés, pas listés :
//    ce sont des adresses e-mail, elles n'ont rien à faire dans un journal d'exécution.
function listerConfig() {
  var sp = PropertiesService.getScriptProperties();
  var toutes = sp.getProperties();
  var SENSIBLES = ['ANTHROPIC_API_KEY', 'ADMIN_TOKEN', 'KOFI_TOKEN', 'BACKUP_TOKEN', 'IDEES_TOKEN'];
  var lignes = [], comptes = 0;
  Object.keys(toutes).sort().forEach(function (k) {
    if (/^(u_|auth_|prem_|confirmed_|pending_)/.test(k)) { comptes++; return; }
    var v = String(toutes[k] == null ? '' : toutes[k]);
    if (SENSIBLES.indexOf(k) >= 0) {
      lignes.push('  · ' + k + ' = [PRÉSENT, ' + v.length + ' caractères — valeur masquée]');
    } else {
      lignes.push('  · ' + k + ' = ' + (v.length > 60 ? (v.slice(0, 57) + '…(' + v.length + ')') : v));
    }
  });
  var m = '[FT] CONFIG — ' + lignes.length + ' propriété(s) de configuration, '
        + comptes + ' clé(s) de comptes (non listées) :\n' + lignes.join('\n')
        + '\n[FT] COACH_MODEL_MICHEL : ' + (toutes.COACH_MODEL_MICHEL ? 'PRÉSENT' : '❌ ABSENT')
        + '  ·  COACH_MODEL_CHRISTOPHE : ' + (toutes.COACH_MODEL_CHRISTOPHE ? 'PRÉSENT' : '❌ ABSENT');
  Logger.log(m); console.log(m);
  return m;
}

// ⚠️⚠️ IL N'Y A **PAS** DE BOUTON POUR CHANGER LE MODÈLE DE MILO ICI, ET C'EST VOLONTAIRE.
//
// J'en avais écrit un le 04/08 (`passerMiloEnSonnet`) : il écrivait la Script Property
// `COACH_MODEL_MICHEL`, relisait la valeur, affichait un beau ✅… et **ne changeait
// strictement rien**. Parce que `'coach'` fait partie de `AI_PROXY_ACTIONS` (constants.js) :
// toutes les conversations avec Milo passent par le **Worker Cloudflare**, et le Worker
// choisit le modèle EN DUR (`worker.js`, constante MODELE_MICHEL). Le mécanisme de ce
// fichier est du code mort pour la conversation depuis que le Worker existe.
//
// *Un réglage qui ne pilote pas ce qu'il prétend piloter est pire qu'un réglage absent* :
// il fait croire que c'est fait. Même travers que le déclencheur de sauvegarde qu'on
// croyait posé pendant 36 jours. Retiré plutôt que corrigé — deux endroits qui règlent
// la même chose finiront toujours par diverger (**R2**).
// 👉 Pour changer le modèle : `worker.js`, constante `MODELE_MICHEL`.
function voirModeleMilo() {
  var v = PropertiesService.getScriptProperties().getProperty('COACH_MODEL_MICHEL');
  var m = '[FT] ⚠️ Cette propriété NE PILOTE PLUS la conversation avec Milo — elle est '
        + 'ignorée depuis que le coach passe par le Worker Cloudflare. Le modèle se règle '
        + 'dans worker.js (constante MODELE_MICHEL).\n'
        + '[FT] Valeur résiduelle de COACH_MODEL_MICHEL : ' + (v || '(absente)');
  Logger.log(m); console.log(m);
  return m;
}

// ⭐ LE TEST LE PLUS PROCHE DU RÉEL : la VRAIE sauvegarde, lancée par le PLANIFICATEUR.
//
// ⚠️ POURQUOI IL NE FAIT PAS DOUBLON avec `testerDeclencheur()`. Celui-là prouve que Google
// lance une fonction *bidon*. Celui-ci prouve qu'il arrive à lancer `backupAllUserData_`,
// qui doit **écrire sur le Drive**. Or un déclencheur ne s'exécute PAS avec le même contexte
// d'autorisation qu'un lancement manuel depuis l'IDE : une sauvegarde peut très bien marcher
// à la main à 23h et échouer à 2h du matin pour un scope refusé. C'est le dernier écart entre
// « ça marche quand je le fais » et « ça marche quand personne ne le fait ».
// Le déclencheur est à usage unique et se supprime lui-même — le compte reste à 1.
function testerSauvegardeReelle() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'backupParDeclencheur') ScriptApp.deleteTrigger(t);
  });
  PropertiesService.getScriptProperties().deleteProperty('PREUVE_BACKUP_AUTO');
  ScriptApp.newTrigger('backupParDeclencheur').timeBased().after(60 * 1000).create();
  var msg = '[FT] Vraie sauvegarde armée — Google la lancera dans ~1 minute. '
          + 'Attends 2 minutes puis exécute voirResultatDeclencheur().';
  Logger.log(msg); console.log(msg);
  return msg;
}

// Lancée PAR le déclencheur uniquement (même garde-fou que preuveDeclencheur).
function backupParDeclencheur(e) {
  if (!e) {
    var m = '[FT] ⛔ Ne lance PAS cette fonction à la main : tout l\'intérêt est que ce soit '
          + 'Google qui la lance. Utilise testerSauvegardeReelle().';
    Logger.log(m); console.log(m);
    return m;
  }
  var res;
  try {
    backupAllUserData_();
    // On relit le dossier : on vérifie l'EFFET, pas le retour (qui n'existe pas).
    var recent = null, it = _getDriveBackupFolder_().getFiles();
    while (it.hasNext()) {
      var f = it.next();
      if (!recent || f.getDateCreated() > recent.getDateCreated()) recent = f;
    }
    res = recent
      ? ('✅ « ' + recent.getName() + ' » écrit le '
         + Utilities.formatDate(recent.getDateCreated(), 'Europe/Paris', 'dd/MM à HH:mm')
         + ' — ' + Math.round(recent.getSize() / 1024) + ' Ko')
      : '⚠️ la sauvegarde a tourné mais le dossier est VIDE';
  } catch (err) {
    res = '❌ ÉCHEC sous déclencheur : ' + err;   // le cas qu'on cherche justement à voir
  }
  PropertiesService.getScriptProperties().setProperty('PREUVE_BACKUP_AUTO', res);
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'backupParDeclencheur') ScriptApp.deleteTrigger(t);
  });
}

function voirResultatDeclencheur() {
  var vb = PropertiesService.getScriptProperties().getProperty('PREUVE_BACKUP_AUTO');
  if (vb) {
    var mb = '[FT] VRAIE SAUVEGARDE lancée par le planificateur : ' + vb;
    Logger.log(mb); console.log(mb);
  }
  var v = PropertiesService.getScriptProperties().getProperty('PREUVE_DECLENCHEUR');
  var msg;
  if (v) {
    msg = '[FT] ✅ LE PLANIFICATEUR TOURNE — déclenché le '
        + Utilities.formatDate(new Date(v), 'Europe/Paris', 'dd/MM/yyyy à HH:mm:ss')
        + '. La sauvegarde de 2h partira donc bien.';
  } else {
    var arme = ScriptApp.getProjectTriggers()
      .filter(function (t) { return t.getHandlerFunction() === 'preuveDeclencheur'; }).length;
    msg = arme
      ? '[FT] ⏳ Pas encore déclenché — le test est toujours armé. Attends encore une minute.'
      : '[FT] ⚠️ RIEN. Ni preuve, ni test armé : soit tu n\'as pas lancé testerDeclencheur(), '
        + 'soit Google N\'EXÉCUTE PAS les déclencheurs de ce projet — et la sauvegarde de 2h ne partira pas.';
  }
  Logger.log(msg); console.log(msg);
  return msg;
}

// ── Trigger backup QUOTIDIEN ─────────────────────────────────
// ⚠️ Nom terminé par `_` = fonction PRIVÉE : elle n'apparaît PAS dans le menu d'exécution
// de l'IDE. Pour la lancer à la main, passer par `reparerSauvegardeNuit()` ci-dessus.
function installDailyBackupTrigger_() {
  // Supprimer les anciens triggers backupAllUserData_ avant d'en créer un nouveau
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'backupAllUserData_') {
      ScriptApp.deleteTrigger(t);
      Logger.log('[FT backup] Ancien trigger supprimé.');
    }
  });
  // Trigger journalier entre 2h et 3h UTC (≈ 4h heure de Paris en été)
  ScriptApp.newTrigger('backupAllUserData_')
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();
  Logger.log('[FT backup] Trigger journalier installé — backupAllUserData_ à 2h UTC chaque nuit.');
}

// Fonction utilitaire publique — exécuter UNE SEULE FOIS depuis l'IDE pour autoriser
// le scope script.scriptapp (nécessaire pour lister/supprimer les triggers fantômes).
// Affiche les triggers existants dans les Logs (Exécution > Journaux).
function authorizeAndListTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  const info = triggers.map(t =>
    t.getHandlerFunction() + ' | ' + t.getEventType() + ' | ' + t.getTriggerSource()
  );
  Logger.log('[FT] Triggers trouvés (' + triggers.length + ') : ' + (info.join(' || ') || 'AUCUN'));
  console.log('[FT] Triggers trouvés (' + triggers.length + ') : ' + (info.join(' || ') || 'AUCUN'));
}

// ───────────────────────────────────────────────────────────
// Restauration admin — réimporte un backup complet depuis PC
// Admin : restaure/écrase un compte — protégé par ADMIN_TOKEN (Script Property, jamais dans le repo)
function handleAdminRestore_(body) {
  if (!_checkTok_('ADMIN_TOKEN', body.adminToken)) {
    return json_({status:'error', error:'unauthorized'});
  }
  const email = (body.email || '').toLowerCase().trim();
  if (!email) return json_({status:'error', error:'email required'});
  const data = body.data;
  if (!data || !data.profile) return json_({status:'error', error:'data.profile required'});

  data.email = email;
  data.updatedAt = new Date().toISOString();
  saveUserData_(email, data);

  try { _mirrorUserToSheet_(email, data); } catch(e) {
    Logger.log('[FT adminRestore] mirror sheet ignoré: ' + e.message);
  }

  const readBack = loadUserData_(email) || {};
  return json_({
    status: 'ok',
    sessions: (readBack.sessions || []).length,
    prs: Object.keys(readBack.prs || {}).length,
    name: readBack.profile && readBack.profile.name
  });
}

// ───────────────────────────────────────────────────────────
// Admin : liste tous les utilisateurs et leurs stats
function handleListUsers_(body) {
  if (!_checkTok_('ADMIN_TOKEN', body.adminToken)) return json_({status:'error', error:'unauthorized'});
  const props = PropertiesService.getScriptProperties().getProperties();
  const users = [];
  Object.keys(props).filter(k => k.startsWith('u_')).forEach(k => {
    try {
      const d = JSON.parse(_unpackUser_(props[k]));
      users.push({
        email: d.email || k.replace(/^u_/, ''),
        name: (d.profile && d.profile.name) || '?',
        sessions: (d.sessions || []).length,
        prs: Object.keys(d.prs || {}).length,
        updatedAt: d.updatedAt || '?'
      });
    } catch(e) { users.push({key:k, error:e.message}); }
  });
  users.sort((a,b) => (b.sessions||0)-(a.sessions||0));
  return json_({status:'ok', count:users.length, users});
}
