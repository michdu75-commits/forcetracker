// ═══════════════════════════════════════════════════════════
// Force Tracker — Google Apps Script v3.2
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

// Calcule le statut premium d'un email — retourne {premium, expiry}
function getPremiumStatus_(email) {
  const props = PropertiesService.getScriptProperties();

  // 1. Whitelist indéfinie (PREMIUM_EMAILS)
  const whitelist = (props.getProperty('PREMIUM_EMAILS') || '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  if (whitelist.includes(email)) {
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

  if (p.test) {
    return json_({status:'online', version:'3.2'});
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
      nutritionPhase: data.nutritionPhase || 'charge'
    });
  }

  return json_({status:'error', error:'Unknown GET action'});
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

  if (body.action === 'saveProfile')  return handleSaveProfile_(body);
  if (body.action === 'logSession')   return handleLogSession_(body);
  if (body.action === 'coach')        return handleCoach_(body);
  if (body.action === 'validateCode') return handleValidateCode_(body);

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
      const ss = SpreadsheetApp.getActiveSpreadsheet();
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
    if (body.customExercises!== undefined) profile.customExercises= body.customExercises;

    existing.profile   = profile;
    if (body.sessions  !== undefined) existing.sessions  = body.sessions;
    if (body.prs       !== undefined) existing.prs       = body.prs;
    if (body.weightLog !== undefined) existing.weightLog = body.weightLog;
    if (body.sleepLog  !== undefined) existing.sleepLog  = body.sleepLog;
    if (body.cycle     !== undefined) existing.cycle     = body.cycle;
    existing.email     = email;
    existing.updatedAt = new Date().toISOString();

    saveUserData_(email, existing);

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

    const ss = SpreadsheetApp.getActiveSpreadsheet();
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
function handleCoach_(body) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey) {
    return json_({reply: '🔑 Clé API Anthropic non configurée. Dans Apps Script : Projet > Paramètres > Propriétés du script, ajoute ANTHROPIC_API_KEY.'});
  }

  try {
    const history = (body.history || []).slice(-8);
    const messages = history.concat([{role:'user', content: String(body.message || '')}]);
    const ctx = body.context || {};

    const systemPrompt =
      'Tu es un coach de musculation expert. Tu réponds toujours en français, de façon concise et pratique. ' +
      'Profil athlète : ' + JSON.stringify(ctx);

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
