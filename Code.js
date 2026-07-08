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

function loadUserData_(email) {
  const raw = PropertiesService.getScriptProperties().getProperty(userKey_(email));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch(e) { return null; }
}

function saveUserData_(email, data) {
  PropertiesService.getScriptProperties().setProperty(userKey_(email), JSON.stringify(data));
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
      sheet.getRange(rowIdx, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
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
  'apollonone75@gmail.com',
  'emma.david16@gmail.com'
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
        // Ne pas supprimer le trigger backup quotidien
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
  if (p.action === 'installDailyBackup' && p.t === 'FT_BACKUP_INIT_2026') {
    try {
      installDailyBackupTrigger_();
      try { backupAllUserData_(); } catch(be) { Logger.log('[FT backup init] ' + be); }
      const cnt = ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'backupAllUserData_').length;
      const folder = _getDriveBackupFolder_();
      return json_({status:'ok', msg:'Trigger dailyBackup installé — ' + cnt + ' trigger(s) actif(s)', firstBackupDone:true, folderId:folder.getId()});
    } catch(err) { return json_({status:'error', error:err.message}); }
  }

  // Migration onglets Sheet → Drive — ?action=migrateBackups&t=FT_BACKUP_INIT_2026
  if (p.action === 'migrateBackups' && p.t === 'FT_BACKUP_INIT_2026') {
    try {
      const result = migrateSheetBackupsToDrive_();
      const folder = _getDriveBackupFolder_();
      return json_({status:'ok', folderId:folder.getId(), folderName:'ForceTracker-Backups', ...result});
    } catch(err) { return json_({status:'error', error:err.message}); }
  }

  // Vérification état backup Drive — ?action=checkBackup
  if (p.action === 'checkBackup') {
    try {
      const cnt = ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'backupAllUserData_').length;
      const folder = _getDriveBackupFolder_();
      const files = [];
      const iter = folder.getFiles();
      while (iter.hasNext()) files.push(iter.next().getName());
      files.sort();
      return json_({status:'ok', triggersInstalled:cnt, driveFolder:'ForceTracker-Backups', folderId:folder.getId(), fileCount:files.length, lastFiles:files.slice(-5)});
    } catch(err) { return json_({status:'error', error:err.message}); }
  }

  // Lecture des idées des testeurs (boîte à idées) — ?action=getIdees&token=FT_IDEES_2026
  if (p.action === 'getIdees') {
    if (p.token !== 'FT_IDEES_2026') return json_({status:'error', error:'token'});
    let arr = [];
    try { arr = JSON.parse(PropertiesService.getScriptProperties().getProperty('TESTER_IDEAS') || '[]'); } catch(e2) { arr = []; }
    return json_({status:'ok', count: arr.length, ideas: arr});
  }

  // Consommation IA du jour (garde-fou coût) — ?action=aiUsage&token=FT_IDEES_2026
  if (p.action === 'aiUsage') {
    if (p.token !== 'FT_IDEES_2026') return json_({status:'error', error:'token'});
    var sp = PropertiesService.getScriptProperties();
    var q = {};
    try { q = JSON.parse(sp.getProperty('ai_quota') || '{}'); } catch(e2) { q = {}; }
    var byEmail = q.byEmail || {};
    var top = Object.keys(byEmail).map(function(k){ return {email:k, count:byEmail[k]}; })
                    .sort(function(a,b){ return b.count - a.count; }).slice(0, 30);
    return json_({
      status: 'ok',
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

  if (p.action === 'loadProfile' && p.email) {
    const email = (p.email || '').toLowerCase().trim();
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
      cycle:          data.cycle          || null,
      nutritionPhase: data.nutritionPhase || 'charge',
      coachMemory:    (data.profile && data.profile.coachMemory) || ''
    });
  }

  return json_({status:'error', error:'Unknown GET action'});
}

function handleLoadProfilePost_(body) {
  const email = (body.email || '').toLowerCase().trim();
  if (!email) return json_({status:'error', error:'email required'});
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
    cycle:          data.cycle          || null,
    programmes:     data.programmes     || [],
    exRestPref:     data.exRestPref     || {},
    nutritionPhase: data.nutritionPhase || 'charge',
    coachMemory:    (data.profile && data.profile.coachMemory) || ''
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
    var GLOBAL_MAX = parseInt(sp.getProperty('AI_GLOBAL_MAX'), 10) || 1500; // total / jour
    var EMAIL_MAX  = parseInt(sp.getProperty('AI_EMAIL_MAX'), 10)  || 100;  // / jour / email
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
  var AI_ACTIONS_ = ['coach','importProgram','importHistory','morphoAnalysis','bodyStudy','importBodyScan','importBloodTest','summarizeCoach','generateMealPlan'];
  if (AI_ACTIONS_.indexOf(body.action) >= 0) {
    var _q = _aiQuotaBlock_(body.email);
    if (_q.blocked) {
      var _msg = _q.scope === 'global'
        ? "L'assistant IA est très sollicité aujourd'hui 🙏 Réessaie un peu plus tard ou demain."
        : "Tu as atteint ta limite d'IA pour aujourd'hui 👍 Reviens demain, l'entraînement continue !";
      return json_({status:'error', error:'quota', scope:_q.scope, reply:_msg});
    }
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
  if (body.action === 'morphoAnalysis')    return handleMorphoAnalysis_(body);
  if (body.action === 'bodyStudy')         return handleBodyStudy_(body);
  if (body.action === 'importBodyScan')    return handleImportBodyScan_(body);
  if (body.action === 'importBloodTest')   return handleImportBloodTest_(body);
  if (body.action === 'testerIdea')        return handleTesterIdea_(body);
  if (body.action === 'summarizeCoach')    return handleSummarizeCoach_(body);
  if (body.action === 'generateMealPlan')  return handleGenerateMealPlan_(body);
  if (body.action === 'adminRestore')      return handleAdminRestore_(body);
  if (body.action === 'listUsers')         return handleListUsers_(body);

  return json_({status:'error', error:'Unknown POST action: ' + body.action});
}

// ───────────────────────────────────────────────────────────
// Webhook Ko-fi — déclenché automatiquement à chaque paiement
// 0.99€ → 3 jours (essai)  |  4.99€ → 61 jours (~2 mois)
// Ko-fi > Settings > API > Webhook URL = URL de ce script déployé
function handleKofiWebhook_(dataStr) {
  try {
    const data = JSON.parse(dataStr);

    // Vérification token Ko-fi
    const expectedToken = PropertiesService.getScriptProperties().getProperty('KOFI_TOKEN') || '';
    if (expectedToken && data.verification_token !== expectedToken) {
      return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
    }

    const email = (data.email || '').toLowerCase().trim();
    if (!email) return ContentService.createTextOutput('No email').setMimeType(ContentService.MimeType.TEXT);

    // Durée selon le montant
    const amount = parseFloat(data.amount || '0');
    let days = 0;
    let tier = '';
    if (amount >= 4.0)      { days = 61; tier = 'monthly'; }  // 4.99€ → ~2 mois
    else if (amount >= 0.9) { days = 3;  tier = 'trial';   }  // 0.99€ → 3 jours

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
      sheet.appendRow([
        new Date().toISOString(),
        email,
        data.from_name || '',
        data.amount || '',
        data.currency || '',
        tier,
        expiryStr,
        data.kofi_transaction_id || ''
      ]);
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
function handleSaveProfile_(body) {
  try {
    const email = (body.email || '').toLowerCase().trim();
    if (!email) return json_({status:'error', error:'Email requis'});

    const isNewUser = !loadUserData_(email);
    const existing = loadUserData_(email) || {};
    const profile = existing.profile || {};

    // GARDE-FOU GLOBAL : le vide ne gagne jamais sur du rempli
    // Chaînes identité : '' n'écrase pas une valeur existante
    if (body.name          !== undefined) profile.name          = _ps_(body.name,          profile.name);
    if (body.gender        !== undefined) profile.gender        = _ps_(body.gender,        profile.gender);
    if (body.goal          !== undefined) profile.goal          = _ps_(body.goal,          profile.goal);
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
    if (body.histImports   !== undefined) profile.histImports   = _pn_(body.histImports,   profile.histImports);
    // exPhotos (photos d'exos bibliothèque) = LOCAL SEULEMENT : jamais stocké, et on nettoie l'existant.
    if (profile.exPhotos) delete profile.exPhotos;
    if (body.bodyStudy     !== undefined) profile.bodyStudy     = _po_(body.bodyStudy,     profile.bodyStudy);
    if (body.bodyScans     !== undefined) profile.bodyScans     = _pa_(body.bodyScans,     profile.bodyScans);
    if (body.bloodTests    !== undefined) profile.bloodTests    = _pa_(body.bloodTests,    profile.bloodTests);
    if (body.bodyScanImports!== undefined) profile.bodyScanImports= _pn_(body.bodyScanImports, profile.bodyScanImports);
    if (body.coachQuiz     !== undefined) profile.coachQuiz     = _po_(body.coachQuiz,     profile.coachQuiz);
    if (body.coachQuizPro  !== undefined) profile.coachQuizPro  = _po_(body.coachQuizPro,  profile.coachQuizPro);
    if (body.scaleType     !== undefined) profile.scaleType     = _ps_(body.scaleType,     profile.scaleType);
    if (body.diet          !== undefined) profile.diet          = _ps_(body.diet,          profile.diet);
    if (body.dietRestrictions!== undefined) profile.dietRestrictions = _pa_(body.dietRestrictions, profile.dietRestrictions);
    if (body.dietNotes     !== undefined) profile.dietNotes     = _ps_(body.dietNotes,     profile.dietNotes);

    existing.profile = profile;

    // Tableaux entraînement : [] n'écrase pas des données existantes
    if (body.sessions !== undefined) {
      const inSess = body.sessions || [], exSess = existing.sessions || [];
      if (inSess.length === 0 && exSess.length > 0) {
        Logger.log('[FT GARDE-FOU sessions] refusé : ' + exSess.length + ' séances conservées');
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
    rows.forEach(r => sheet.appendRow([
      r.date, r.exercise, r.set_num, r.type,
      r.kg, r.reps, r.volume, r.rm1,
      r.bw, r.gender, r.age
    ]));

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
    if (cur && cur.sentAt && (now - cur.sentAt) < 60000) return json_({status:'ok', cooldown:true}); // anti-spam 60s
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
// À lancer UNE fois depuis l'éditeur Apps Script SI les emails de confirmation
// n'arrivent pas (force l'écran d'autorisation Google pour l'envoi d'email).
function authorizeMail() {
  GmailApp.sendEmail('forcetracker.app@gmail.com', 'Force Tracker — test autorisation email',
    'Si tu reçois ce mail, l\'envoi d\'email fonctionne ✅');
  Logger.log('Email de test envoyé — autorisation OK');
}

// ───────────────────────────────────────────────────────────
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
      sheet.appendRow(['Exercice','Groupe','Signalements','IDs anonymes','Première date','Dernière date']);
      sheet.setFrozenRows(1);
      sheet.getRange(1,1,1,6).setFontWeight('bold');
    }

    const data = sheet.getDataRange().getValues();
    let rowIdx = -1;
    for (let i = 1; i < data.length; i++) {
      if ((data[i][0]||'').toLowerCase() === name.toLowerCase()) { rowIdx = i + 1; break; }
    }

    if (rowIdx > 0) {
      const row = data[rowIdx - 1];
      const count = (row[2] || 0) + 1;
      const ids = (row[3] || '').split(', ').filter(Boolean);
      if (anonId && !ids.includes(anonId)) ids.push(anonId);
      sheet.getRange(rowIdx, 3, 1, 4).setValues([[count, ids.join(', '), row[4]||today, today]]);
    } else {
      sheet.appendRow([name, grp, 1, anonId, today, today]);
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
      payload: JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:1024, messages:[{role:'user', content:userContent}] }),
      muteHttpExceptions:true
    });
    const result = JSON.parse(resp.getContentText());
    const text = (result.content && result.content[0] && result.content[0].text) || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return json_({status:'error', error:'Lecture impossible. Réessaie avec une photo plus nette et bien cadrée.'});
    const data = JSON.parse(match[0]);
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
    return json_({status:'ok'});
  } catch(err) {
    return json_({status:'error', error: err.message});
  }
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
        const data = JSON.parse(all[k]);
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

// ── Trigger backup QUOTIDIEN ─────────────────────────────────
// Idempotent — à appeler via ?action=installDailyBackup&t=FT_BACKUP_INIT_2026
// OU depuis l'IDE Apps Script (Run > installDailyBackupTrigger_)
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
// Token one-time : FT_RESTORE_2026_MICHEL
function handleAdminRestore_(body) {
  const ADMIN_TOKEN = 'FT_RESTORE_2026_MICHEL';
  if (body.adminToken !== ADMIN_TOKEN) {
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
  const ADMIN_TOKEN = 'FT_RESTORE_2026_MICHEL';
  if (body.adminToken !== ADMIN_TOKEN) return json_({status:'error', error:'unauthorized'});
  const props = PropertiesService.getScriptProperties().getProperties();
  const users = [];
  Object.keys(props).filter(k => k.startsWith('u_')).forEach(k => {
    try {
      const d = JSON.parse(props[k]);
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
