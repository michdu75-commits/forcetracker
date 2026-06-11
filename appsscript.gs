// ═══════════════════════════════════════════════════════════
// Force Tracker — Google Apps Script v3.1
// Colle ce code dans script.google.com, remplace tout,
// puis clique "Déployer > Nouveau déploiement" (web app,
// "Tout le monde" pour l'accès), et copie la nouvelle URL.
// ═══════════════════════════════════════════════════════════

// Clé API Anthropic pour le Coach IA (optionnel)
// Va dans Projet > Paramètres > Propriétés du script
// et ajoute : ANTHROPIC_API_KEY = sk-ant-...
// OU mets-la directement ici (moins sécurisé) :
// const ANTHROPIC_API_KEY = 'sk-ant-...';

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

// ───────────────────────────────────────────────────────────
function doGet(e) {
  const p = e.parameter || {};

  if (p.test) {
    return json_({status:'online', version:'3.1'});
  }

  if (p.action === 'loadProfile' && p.email) {
    const email = (p.email || '').toLowerCase().trim();
    const data = loadUserData_(email);
    if (!data) return json_({status:'not_found'});
    return json_({
      status:        'ok',
      profile:       data.profile       || {},
      prs:           data.prs           || {},
      sessions:      data.sessions      || [],
      weightLog:     data.weightLog     || [],
      sleepLog:      data.sleepLog      || [],
      cycle:         data.cycle         || null,
      nutritionPhase:data.nutritionPhase || 'charge'
    });
  }

  return json_({status:'error', error:'Unknown GET action'});
}

// ───────────────────────────────────────────────────────────
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch(err) {
    return json_({status:'error', error:'JSON parse error: ' + err.message});
  }

  if (body.action === 'saveProfile')  return handleSaveProfile_(body);
  if (body.action === 'logSession')   return handleLogSession_(body);
  if (body.action === 'coach')        return handleCoach_(body);

  return json_({status:'error', error:'Unknown POST action: ' + body.action});
}

// ───────────────────────────────────────────────────────────
function handleSaveProfile_(body) {
  try {
    const email = (body.email || '').toLowerCase().trim();
    if (!email) return json_({status:'error', error:'Email requis'});

    const existing = loadUserData_(email) || {};
    const profile = existing.profile || {};

    // Met à jour uniquement les champs envoyés
    if (body.name         !== undefined) profile.name          = body.name;
    if (body.bw           !== undefined) profile.bw            = body.bw;
    if (body.age          !== undefined) profile.age           = body.age;
    if (body.height       !== undefined) profile.height        = body.height;
    if (body.gender       !== undefined) profile.gender        = body.gender;
    if (body.goal         !== undefined) profile.goal          = body.goal;
    if (body.activityLevel!== undefined) profile.activityLevel = body.activityLevel;

    existing.profile    = profile;
    existing.email      = email;
    existing.updatedAt  = new Date().toISOString();

    saveUserData_(email, existing);
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

    // Log dans la feuille "Sessions" pour analytics
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
