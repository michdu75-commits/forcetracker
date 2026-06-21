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

  if (body.action === 'test')              return json_({status:'online', version:'3.5'});
  if (body.action === 'loadProfile')       return handleLoadProfilePost_(body);
  if (body.action === 'saveProfile')       return handleSaveProfile_(body);
  if (body.action === 'logSession')        return handleLogSession_(body);
  if (body.action === 'coach')             return handleCoach_(body);
  if (body.action === 'validateCode')      return handleValidateCode_(body);
  if (body.action === 'logCustomExercise') return handleLogCustomExercise_(body);
  if (body.action === 'importProgram')     return handleImportProgram_(body);
  if (body.action === 'morphoAnalysis')   return handleMorphoAnalysis_(body);
  if (body.action === 'summarizeCoach')   return handleSummarizeCoach_(body);

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
    if (body.contraception  !== undefined) profile.contraception  = body.contraception;
    if (body.morpho         !== undefined) profile.morpho         = body.morpho;
    if (body.morphotype     !== undefined) profile.morphotype     = body.morphotype;
    if (body.customExercises!== undefined) profile.customExercises= body.customExercises;
    if (body.coachMemory    !== undefined) profile.coachMemory    = body.coachMemory;

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
function handleLogCustomExercise_(body) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('CustomExercises');
    if (!sheet) {
      sheet = ss.insertSheet('CustomExercises');
      sheet.appendRow(['date','email','name','group','muscles_primary','muscles_secondary']);
    }
    sheet.appendRow([
      new Date().toISOString(),
      (body.email || '').toLowerCase().trim(),
      body.name || '',
      body.group || '',
      (body.musclesP || []).join(', '),
      (body.musclesS || []).join(', ')
    ]);
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
      text: 'Analyse ces images et extrait le programme d\'entraînement complet.\n\nRetourne UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après, sans balises markdown, avec cette structure exacte :\n{"name":"nom du programme","days":[{"label":"Séance 1 - Dorsaux Triceps","exercises":[{"name":"nom complet de l\'exercice","sets":5,"reps":8,"repsPerSet":[20,15,12,8,8],"kg":0,"note":"méthode et instructions"}]}]}\n\nRègles STRICTES :\n\n1. REPS PAR SÉRIE (repsPerSet) :\n- Si chaque série a des reps différentes (ex: 20/15/12/8/8 sur 5 séries) → repsPerSet:[20,15,12,8,8] et sets:5\n- Si toutes les séries ont les mêmes reps → repsPerSet:[] et sets=nombre de séries\n- "reps" = valeur numérique principale de la dernière/plus basse série\n- Reps complexes : "5\'\'+8" → reps:8 (noter la méthode dans note) | "8+10" → reps:10 | "15+(3-5 reps)x5" → reps:15 | "10x2" ou "bras/bras" → reps:10 (noter "unilatéral bras/bras" dans note)\n- "4x8" ou "4×8" → sets:4, reps:8, repsPerSet:[]\n\n2. NOTE (OBLIGATOIRE — ne rien omettre) :\n- Capture TOUT le texte en rouge/couleur = méthodes spéciales (Isométrie, Excentrique, Myo-Reps, Lourd/Léger, complète/partielle, Série unique, etc.) avec leur explication complète\n- Ajoute les instructions d\'exécution normales (texte sous le nom de l\'exercice)\n- Sépare les éléments par " | "\n- Ces méthodes sont cruciales pour l\'athlète, ne les perds JAMAIS\n\n3. STRUCTURE :\n- label du jour = nom complet de la séance (ex: "Séance 1 - Dorsaux Triceps Abdos")\n- kg:0 si charge non indiquée\n- Inclus ABSOLUMENT TOUS les exercices de toutes les pages\n- Réponds UNIQUEMENT avec le JSON, aucun autre texte'
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

