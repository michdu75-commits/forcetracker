// ═══════════════════════════════════════════════════════════
// Force Tracker — Google Apps Script v3.5
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
  'apollonone75@gmail.com'
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
        allTriggers.forEach(t => ScriptApp.deleteTrigger(t));
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

  if (body.action === 'test')              return json_({status:'online', version:'3.5'});
  if (body.action === 'loadProfile')       return handleLoadProfilePost_(body);
  if (body.action === 'saveProfile')       return handleSaveProfile_(body);
  if (body.action === 'logSession')        return handleLogSession_(body);
  if (body.action === 'coach')             return handleCoach_(body);
  if (body.action === 'validateCode')      return handleValidateCode_(body);
  if (body.action === 'logCustomExercise') return handleLogCustomExercise_(body);
  if (body.action === 'importProgram')     return handleImportProgram_(body);
  if (body.action === 'morphoAnalysis')    return handleMorphoAnalysis_(body);
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

// ───────────────────────────────────────────────────────────
function handleSaveProfile_(body) {
  try {
    const email = (body.email || '').toLowerCase().trim();
    if (!email) return json_({status:'error', error:'Email requis'});

    const isNewUser = !loadUserData_(email);
    const existing = loadUserData_(email) || {};
    const profile = existing.profile || {};

    if (body.name          !== undefined) profile.name          = body.name;
    if (body.bw            !== undefined) profile.bw            = body.bw;
    if (body.age           !== undefined) profile.age           = body.age;
    if (body.height        !== undefined) profile.height        = body.height;
    if (body.gender        !== undefined) profile.gender        = body.gender;
    if (body.goal          !== undefined) profile.goal          = body.goal;
    if (body.activityLevel !== undefined) profile.activityLevel = body.activityLevel;
    if (body.workType       !== undefined) profile.workType       = body.workType;
    if (body.smoker         !== undefined) profile.smoker         = body.smoker;
    if (body.neck           !== undefined) profile.neck           = body.neck;
    if (body.waist          !== undefined) profile.waist          = body.waist;
    if (body.hip            !== undefined) profile.hip            = body.hip;
    if (body.nutritionPhase !== undefined) profile.nutritionPhase = body.nutritionPhase;
    if (body.barW           !== undefined) profile.barW           = body.barW;
    if (body.defRest        !== undefined) profile.defRest        = body.defRest;
    if (body.mensCycleStart !== undefined) profile.mensCycleStart = body.mensCycleStart;
    if (body.mensCycleDur   !== undefined) profile.mensCycleDur   = body.mensCycleDur;
    if (body.contraception  !== undefined) profile.contraception  = body.contraception;
    if (body.morpho         !== undefined) profile.morpho         = body.morpho;
    if (body.morphotype     !== undefined) profile.morphotype     = body.morphotype;
    if (body.customExercises!== undefined) profile.customExercises= body.customExercises;
    if (body.coachMemory    !== undefined) profile.coachMemory    = body.coachMemory;
    if (body.healthProfile  !== undefined) profile.healthProfile  = body.healthProfile;
    if (body.a11y           !== undefined) profile.a11y           = body.a11y;
    if (body.colorblind     !== undefined) profile.colorblind     = body.colorblind;
    if (body.leftHand       !== undefined) profile.leftHand       = body.leftHand;

    existing.profile   = profile;
    if (body.sessions !== undefined) {
      const incomingSess = body.sessions || [];
      const existingSess = existing.sessions || [];
      if (incomingSess.length === 0 && existingSess.length > 0) {
        Logger.log('[FT GARDE-FOU sessions] refusé : ' + existingSess.length + ' séances cloud conservées (entrante: 0)');
      } else {
        existing.sessions = body.sessions;
      }
    }
    if (body.prs !== undefined) {
      const incomingPrs = Object.keys(body.prs || {}).length;
      const existingPrs = Object.keys(existing.prs || {}).length;
      if (incomingPrs === 0 && existingPrs > 0) {
        Logger.log('[FT GARDE-FOU prs] refusé : ' + existingPrs + ' PRs cloud conservés');
      } else {
        existing.prs = body.prs;
      }
    }
    if (body.weightLog !== undefined) existing.weightLog = body.weightLog;
    if (body.sleepLog  !== undefined) existing.sleepLog  = body.sleepLog;
    if (body.cycle     !== undefined) existing.cycle     = body.cycle;
    existing.email     = email;
    existing.updatedAt = new Date().toISOString();

    saveUserData_(email, existing);
    _mirrorUserToSheet_(email, existing); // best-effort, silencieux

    // Email de bienvenue pour les nouveaux utilisateurs
    if (body.welcome && isNewUser) {
      try {
        const prenom = body.name ? body.name : 'Athlète';
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

    // Sonnet si plusieurs images (PDF multi-pages) ou texte, Haiku sinon
    const hasText = images.some(img => img.isText || img.type === 'text/plain');
    const model = (images.length > 1 || hasText) ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001';

    const userContent = images.map(img => {
      if (img.isText || img.type === 'text/plain') {
        return {type:'text', text:'[Fichier : '+(img.name||'document')+']\n\n'+img.data};
      }
      return {type:'image', source:{type:'base64', media_type:img.type||'image/jpeg', data:img.data}};
    });

    userContent.push({
      type: 'text',
      text: 'Analyse ces images et extrait le programme d\'entraînement complet.\n\nRetourne UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après, sans balises markdown, avec cette structure exacte :\n{"name":"nom du programme","weeks":7,"startDate":"2026-03-23","days":[{"label":"Séance 1 - Dorsaux Triceps","exercises":[{"name":"nom complet de l\'exercice","sets":5,"reps":8,"repsPerSet":[20,15,12,8,8],"specialSets":[3,4],"kg":0,"kgPerSet":[],"supersetGroup":"","setType":"","note":"méthode et instructions"}]}]}\n\nRègles STRICTES :\n\n1. REPS PAR SÉRIE (repsPerSet) :\n- Si chaque série a des reps différentes (ex: 20/15/12/8/8 sur 5 séries) → repsPerSet:[20,15,12,8,8] et sets:5\n- Si toutes les séries ont les mêmes reps → repsPerSet:[] et sets=nombre de séries\n- "reps" = valeur numérique principale de la dernière/plus basse série\n- Reps complexes : "5\'\'+8" → reps:8 (noter la méthode dans note) | "8+10" → reps:10 | "15+(3-5 reps)x5" → reps:15 | "10x2" ou "bras/bras" → reps:10 (noter "unilatéral bras/bras" dans note)\n- "4x8" ou "4×8" → sets:4, reps:8, repsPerSet:[]\n\n2. SÉRIES SPÉCIALES (specialSets) :\n- Liste les indices 0-based des séries dont les REPS apparaissent en rouge, en gras coloré, ou en couleur dans le PDF\n- Si TOUTES les séries d\'un exercice sont en rouge → specialSets:[0,1,2,...] (tous les indices)\n- Si AUCUNE série n\'est en rouge → specialSets:[]\n- Exemple : sur 5 séries avec les 2 dernières en rouge → specialSets:[3,4]\n- Ces sets seront affichés en orange dans l\'app pour alerter l\'athlète\n\n3. NOTE (OBLIGATOIRE — ne rien omettre) :\n- Capture TOUT le texte en rouge/couleur = méthodes spéciales (Isométrie, Excentrique, Myo-Reps, Lourd/Léger, complète/partielle, Série unique, etc.) avec leur explication complète\n- Ajoute les instructions d\'exécution normales (texte sous le nom de l\'exercice)\n- Sépare les éléments par " | "\n- Ces méthodes sont cruciales pour l\'athlète, ne les perds JAMAIS\n\n4. STRUCTURE :\n- label du jour = nom complet de la séance (ex: "Séance 1 - Dorsaux Triceps Abdos")\n- kg:0 si charge non indiquée\n- "weeks" : durée totale du programme en semaines si mentionnée (ex: "7 semaines"), sinon 0\n- "startDate" : date de début au format "YYYY-MM-DD" si visible dans le document (ex: "23 Mars 2026" → "2026-03-23"), sinon ""\n- Inclus ABSOLUMENT TOUS les exercices de toutes les pages\n\n5. SUPERSETS / TRI-SETS :\n- Exercices groupés (C1+C2, D1/D2, "SUPERSET X+Y", lettre préfixe identique) → "supersetGroup":"C" pour TOUS les exercices du groupe (lettre commune)\n- Tri-set : C1/C2/C3 → tous les trois ont "supersetGroup":"C"\n- Exercice solo → "supersetGroup":""\n- La lettre du groupe = lettre AVANT le chiffre (C1 → "C", D2 → "D", A1 → "A")\n\n6. DROPSETS :\n- DROPSET avec charges/reps dégressives → "setType":"D", repsPerSet avec les reps de chaque palier, kgPerSet avec le kg de chaque palier\n- Ex: "DROPSET: 15 @ 35kg >> 12 @ 25kg >> max @ 15kg" → setType:"D", repsPerSet:[15,12,99], kgPerSet:[35,25,15]\n- "max reps" / "à l\'échec" / "MAX" → 99 dans repsPerSet pour ce palier\n- Si dropset sans détail de charges → setType:"D", repsPerSet:[], kgPerSet:[]\n\n7. CHARGES (%1RM) :\n- Si le document indique les 1RM et des pourcentages → calcule kg = arrondi(1RM × %, 0.5 kg) pour chaque exercice\n- Ex: "Squat 152kg, S1 80%" → Squat kg = 121.5 (152×0.80 arrondi à 0.5). Note: "80% 1RM"\n- Si plusieurs semaines avec % différents → utilise le % de la semaine 1 pour kg, note les autres %\n- RPE → ajoute "RPE X" dans note\n\n- Réponds UNIQUEMENT avec le JSON, aucun autre texte'
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

    const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
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
// BACKUP — Sauvegarde toutes les données utilisateurs
// Crée un onglet "Backup YYYY-MM-DD HH:MM" dans le Sheet.
// Peut être appelé manuellement (clasp run) ou via Apps Script
// Exécutions (déclencheur unique one-shot).
// ═══════════════════════════════════════════════════════════
function backupAllUserData_() {
  const props = PropertiesService.getScriptProperties();
  const all   = props.getProperties();
  const now   = new Date();
  const label = Utilities.formatDate(now, 'Europe/Paris', 'yyyy-MM-dd HH:mm');
  const ss    = _getSheet_();

  // Supprime les anciens onglets backup de plus de 30 jours
  ss.getSheets().forEach(sh => {
    const n = sh.getName();
    if (!n.startsWith('Backup ')) return;
    const d = new Date(n.replace('Backup ', '').replace(' ', 'T') + ':00');
    if (!isNaN(d) && (now - d) > 30 * 24 * 3600 * 1000) ss.deleteSheet(sh);
  });

  // Onglet backup daté
  let sheet = ss.getSheetByName('Backup ' + label);
  if (!sheet) sheet = ss.insertSheet('Backup ' + label);
  sheet.clearContents();
  sheet.appendRow(['email', 'data_json', 'backed_up_at']);

  Object.keys(all)
    .filter(k => k.startsWith('u_'))
    .forEach(k => {
      const email = k.replace(/^u_/, '');
      sheet.appendRow([email, all[k], now.toISOString()]);
    });

  Logger.log('Backup terminé : ' + sheet.getName() + ' — ' + (sheet.getLastRow() - 1) + ' utilisateurs');
}

// Lance le backup une seule fois dans les 5 prochaines minutes (one-shot trigger)
function scheduleOneTimeBackup_() {
  ScriptApp.newTrigger('backupAllUserData_')
    .timeBased()
    .after(60 * 1000) // dans 1 minute
    .create();
  Logger.log('Déclencheur one-shot créé — backup dans ~1 min');
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
