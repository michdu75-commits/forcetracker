// ─────────────────────────────────────────────────────────────────────────────
// Force Tracker — Serveur IA (Cloudflare Worker) — PLAN B : appelle l'IA DIRECTEMENT
// ─────────────────────────────────────────────────────────────────────────────
// Pourquoi : le simple « relais vers Google Apps Script » échoue (Google renvoie une
// page HTML au serveur Cloudflare — blocage par IP). Ici, le Worker appelle
// directement l'API Anthropic (Claude) → plus de Google dans le chemin → marche en 4G.
//
// ⚠️ CLÉ SECRÈTE : ce Worker a besoin de la clé API Anthropic, stockée dans Cloudflare
// en VARIABLE SECRÈTE nommée `ANTHROPIC_API_KEY` (voir GUIDE-CLOUDFLARE.md). Elle n'est
// JAMAIS dans ce code ni dans le repo public.
//
// ⚠️ PROMPTS : ceux du bilan/étiquette/code-barres sont RECOPIÉS depuis Code.js
// (handleImportBodyScan_ / handleFoodLabel_ / handleReadBarcode_). Si un prompt change
// dans Code.js, le mettre à jour ici aussi. Les actions NON gérées ici sont relayées à
// Apps Script (fallback — marche en wifi ; pour la 4G, on les ajoutera en direct ensuite).
// ─────────────────────────────────────────────────────────────────────────────

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA/exec';
const ANTHROPIC_URL   = 'https://api.anthropic.com/v1/messages';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (request.method !== 'POST')    return json({ status: 'error', error: 'Utilise POST.' }, 405);

    const raw = await request.text();
    let body = {};
    try { body = JSON.parse(raw); } catch (e) {}
    const apiKey = (env && env.ANTHROPIC_API_KEY) || '';

    try {
      // ── Actions IA gérées EN DIRECT (sans Google) ─────────────────────────
      if (body.action === 'importBodyScan') return json(await bodyScan(body, apiKey));
      if (body.action === 'foodLabel')      return json(await foodLabel(body, apiKey));
      if (body.action === 'readBarcode')    return json(await readBarcode(body, apiKey));
      if (body.action === 'coach')          return json(await coach(body, apiKey));
      if (body.action === 'importProgram')  return json(await importDoc(body, apiKey, 'program'));
      if (body.action === 'importHistory')  return json(await importDoc(body, apiKey, 'history'));
      if (body.action === 'morphoAnalysis') return json(await morpho(body, apiKey));

      // ── Sinon : relais vers Apps Script (fallback) ────────────────────────
      const up = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: raw,
        redirect: 'follow',
      });
      const t = await up.text();
      return new Response(t, { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS } });
    } catch (err) {
      return json({ status: 'error', error: 'Serveur : ' + (err && err.message) });
    }
  },
};

// ── Appel générique à Claude ───────────────────────────────────────────────
async function callClaude(apiKey, payload) {
  const r = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(payload),
  });
  const data = await r.json();
  return (data && data.content && data.content[0] && data.content[0].text) || '';
}
function firstJson(text) {
  const stripped = String(text || '').replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const m = stripped.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch (e) { return null; }
}
function imagesOf(body) {
  if (Array.isArray(body.images) && body.images.length) return body.images;
  if (body.image) return [{ data: body.image.data || body.image, type: (body.image && body.image.type) || body.imageType || 'image/jpeg' }];
  return [];
}

// ── Bilan corporel (balance) — recopié de handleImportBodyScan_ ─────────────
async function bodyScan(body, apiKey) {
  if (!apiKey) return { status: 'error', error: 'Clé API absente dans Cloudflare (ANTHROPIC_API_KEY).' };
  const imgs = imagesOf(body);
  if (!imgs.length) return { status: 'error', error: 'Aucune image reçue' };
  const multi = imgs.length > 1;
  const content = imgs.map(im => ({ type: 'image', source: { type: 'base64', media_type: im.type || 'image/jpeg', data: im.data } }));
  content.push({ type: 'text', text:
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
    + '- skMuscle = masse musculaire squelettique, en kg (jamais un %)\n'
    + '- bone = masse osseuse, en kg\n'
    + '- water = eau corporelle totale, en kg (jamais un %)\n'
    + '- protein = protéines, en kg (jamais un %)\n'
    + '- visceral = niveau / indice de graisse viscérale, petit nombre entier\n'
    + '- bmr = métabolisme de base (BMR / TMB / taux métabolique de base), en kcal\n'
    + '- metaAge = âge corporel / âge métabolique, en années\n'
    + '- imc = IMC / BMI\n'
    + '- bodyScore = score/note corporel(le) global(e) sur 100 (si présent)\n'
    + '- leanMass = masse maigre / masse corporelle maigre / masse sans graisse, en kg\n'
    + '- subFat = graisse sous-cutanée, en %\n'
    + '- smi = indice de masse musculaire squelettique, en kg/m2\n'
    + '- date = date des mesures, au format YYYY-MM-DD\n'
    + 'DÉTAIL PAR SEGMENT — TRÈS IMPORTANT, NE LE ZAPPE PAS : ces valeurs sont souvent DESSINÉES SUR DES SCHÉMAS DU CORPS (silhouettes), avec des nombres à GAUCHE et à DROITE de la figure. Il y a en général DEUX schémas : un pour la GRAISSE et un pour le MUSCLE. Lis les DEUX. Pour chaque membre, le grand nombre en kg est la valeur — ignore le % et les mots Normal/Élevé/Trop élevé. Mappe : bras gauche/droit → armMuscleL/armMuscleR et armFatL/armFatR ; tronc → trunkMuscle et trunkFat ; jambe gauche/droite → legMuscleL/legMuscleR et legFatL/legFatR. Si ces schémas sont présents, REMPLIS ces champs.\n'
    + 'RÈGLE D\'UNITÉ ABSOLUE : un champ en kg ne prend QUE des valeurs en kg. Si une donnée n\'est disponible qu\'en POURCENTAGE, laisse le champ kg correspondant à null — ne mets JAMAIS un pourcentage dans un champ kg.\n'
    + 'Retourne UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après, avec EXACTEMENT ces clés '
    + '("." comme séparateur décimal, null seulement si la valeur est vraiment absente ou illisible) :\n'
    + '{"date":null,"weight":null,"bf":null,"fatMass":null,"muscle":null,"skMuscle":null,"bone":null,"water":null,"protein":null,"visceral":null,"bmr":null,"metaAge":null,"imc":null,'
    + '"bodyScore":null,"leanMass":null,"subFat":null,"smi":null,'
    + '"armMuscleL":null,"armMuscleR":null,"trunkMuscle":null,"legMuscleL":null,"legMuscleR":null,"armFatL":null,"armFatR":null,"trunkFat":null,"legFatL":null,"legFatR":null}. '
    + 'Efforce-toi de remplir un MAXIMUM de champs. N\'invente aucun chiffre.' });
  const text = await callClaude(apiKey, { model: 'claude-haiku-4-5', max_tokens: 1024, messages: [{ role: 'user', content }] });
  const data = firstJson(text);
  if (!data) return { status: 'error', error: 'Lecture impossible. Réessaie avec une photo plus nette.' };
  return { status: 'ok', data };
}

// ── Étiquette nutritionnelle — recopié de handleFoodLabel_ ──────────────────
async function foodLabel(body, apiKey) {
  if (!apiKey) return { status: 'error', error: 'Clé API absente dans Cloudflare (ANTHROPIC_API_KEY).' };
  const imgs = imagesOf(body);
  if (!imgs.length) return { status: 'error', error: 'Image manquante' };
  const prompt = 'Tu regardes la photo du tableau des VALEURS NUTRITIONNELLES d\'un produit alimentaire. '
    + 'Lis les valeurs POUR 100 g (colonne "pour 100 g"). Si seule une portion est indiquee, convertis en pour-100g. '
    + 'Retourne UNIQUEMENT un JSON valide, sans texte ni markdown :\n'
    + '{"name":"nom du produit si visible sinon vide","kcal100":99,"prot100":6.1,"carbs100":10,"fat100":3.2,"serving":205}\n\n'
    + 'Regles :\n'
    + '- kcal100 = calories POUR 100 g (depuis les kcal, JAMAIS les kJ).\n'
    + '- prot100/carbs100/fat100 = grammes POUR 100 g, garde 1 decimale si presente.\n'
    + '- serving = taille d\'une portion en grammes si indiquee, sinon 0.\n'
    + '- Si le tableau est illisible ou absent, renvoie {"error":"illisible"}.\n'
    + 'Reponds UNIQUEMENT avec le JSON.';
  const text = await callClaude(apiKey, { model: 'claude-haiku-4-5-20251001', max_tokens: 400, messages: [{ role: 'user', content: [
    { type: 'image', source: { type: 'base64', media_type: imgs[0].type || 'image/jpeg', data: imgs[0].data } },
    { type: 'text', text: prompt },
  ] }] });
  const d = firstJson(text);
  if (!d) return { status: 'error', error: 'Lecture echouee' };
  if (d.error) return { status: 'error', error: String(d.error) };
  return { status: 'ok',
    name: String(d.name || '').slice(0, 60),
    kcal100: Math.max(0, parseFloat(d.kcal100) || 0),
    prot100: Math.max(0, parseFloat(d.prot100) || 0),
    carbs100: Math.max(0, parseFloat(d.carbs100) || 0),
    fat100: Math.max(0, parseFloat(d.fat100) || 0),
    serving: Math.max(0, parseFloat(d.serving) || 0) };
}

// ── Code-barres photo — recopié de handleReadBarcode_ ───────────────────────
async function readBarcode(body, apiKey) {
  if (!apiKey) return { status: 'error', error: 'Clé API absente dans Cloudflare (ANTHROPIC_API_KEY).' };
  const imgs = imagesOf(body);
  if (!imgs.length) return { status: 'error', error: 'Image manquante' };
  const prompt = 'Tu regardes la photo d\'un CODE-BARRES de produit (les barres noires verticales avec des chiffres imprimes juste en dessous). '
    + 'Lis le NUMERO du code-barres : la suite de chiffres imprimee sous les barres (en general 8, 12 ou 13 chiffres, format EAN ou UPC). '
    + 'Retourne UNIQUEMENT un JSON valide, sans texte ni markdown :\n'
    + '{"barcode":"3017620422003"}\n\n'
    + 'Regles :\n'
    + '- barcode = uniquement les chiffres, sans espaces ni tirets.\n'
    + '- Renvoie SEULEMENT le code-barres principal du produit. Ignore les autres numeros (prix, lot, dates, poids).\n'
    + '- Si aucun code-barres n\'est lisible, renvoie {"error":"illisible"}.\n'
    + 'Reponds UNIQUEMENT avec le JSON.';
  const text = await callClaude(apiKey, { model: 'claude-haiku-4-5-20251001', max_tokens: 100, messages: [{ role: 'user', content: [
    { type: 'image', source: { type: 'base64', media_type: imgs[0].type || 'image/jpeg', data: imgs[0].data } },
    { type: 'text', text: prompt },
  ] }] });
  const d = firstJson(text);
  if (!d) return { status: 'error', error: 'Lecture echouee' };
  if (d.error) return { status: 'error', error: String(d.error) };
  const code = String(d.barcode || '').replace(/\D/g, '');
  if (code.length < 8) return { status: 'error', error: 'Code-barres illisible' };
  return { status: 'ok', barcode: code };
}

// ── Coach IA (Milo) — recopié de handleCoach_ ───────────────────────────────
// Le system prompt (personnalité de Milo) est envoyé par l'appli dans body.context → pas de
// duplication ici. Renvoie {reply:"..."} (comme Apps Script). Modèle par utilisateur.
async function coach(body, apiKey) {
  if (!apiKey) return { reply: '🔑 Clé API absente dans Cloudflare (ANTHROPIC_API_KEY).' };
  const history = (body.history || []).slice(-8);
  const ctx = body.context || '';
  const memory = body.coachMemory || '';
  let userContent;
  if (body.image) {
    userContent = [
      { type: 'image', source: { type: 'base64', media_type: body.imageType || 'image/jpeg', data: body.image } },
      { type: 'text', text: String(body.message || 'Analyse cette photo de mon corps.') },
    ];
  } else {
    userContent = String(body.message || '');
  }
  const messages = history.concat([{ role: 'user', content: userContent }]);
  const system = String(ctx) + (memory ? '\n\nMÉMOIRE CONVERSATIONS PRÉCÉDENTES:\n' + memory : '');
  // Modèle selon l'utilisateur (comme Code.js, mais en dur ici — pas d'accès aux Script Properties)
  const em = String(body.email || '').toLowerCase().trim();
  let model = 'claude-haiku-4-5';
  if (em === 'michdu75@gmail.com') model = 'claude-opus-4-6';
  else if (em === 'christophe@famillelanglois.fr') model = 'claude-sonnet-4-6';
  const text = await callClaude(apiKey, { model, max_tokens: 1024, system, messages });
  return { reply: text || 'Désolé, réessaie.' };
}

// ── Import de document : programme / historique — recopié de handleImportProgram_/handleImportHistory_
function docContent(images) {
  return images.map(img => {
    if (img.isText || img.type === 'text/plain') return { type: 'text', text: '[Fichier : ' + (img.name || 'document') + ']\n\n' + img.data };
    if (img.type === 'application/pdf') return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: img.data } };
    return { type: 'image', source: { type: 'base64', media_type: img.type || 'image/jpeg', data: img.data } };
  });
}
const PROG_PROMPT = 'Analyse ces images/documents et extrait le programme d\'entraînement complet.\n\nRetourne UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après, sans balises markdown, avec cette structure exacte :\n{"name":"nom du programme","weeks":7,"startDate":"2026-03-23","days":[{"label":"Séance 1 - Dorsaux Triceps","exercises":[{"name":"nom complet de l\'exercice","sets":5,"reps":8,"repsPerSet":[20,15,12,8,8],"specialSets":[3,4],"kg":0,"kgPerSet":[],"supersetGroup":"","setType":"","note":"méthode et instructions"}]}]}\n\nRègles STRICTES :\n\n0. DÉCOUPAGE EN SÉANCES — RÈGLE ABSOLUE :\n- Une NOUVELLE séance commence UNIQUEMENT quand le document contient un titre explicite : "SÉANCE N", "SEANCE N", "Jour N", "Day N", "Workout N".\n- Les titres de GROUPES MUSCULAIRES (DORSAUX, PECTORAUX, BICEPS…) = sous-sections à l\'intérieur d\'une séance. Ils ne créent JAMAIS une nouvelle séance.\n- Ignore les pages SOMMAIRE (liste des séances sans tableau d\'exercices) et toute séance vide.\n\n1. REPS PAR SÉRIE (repsPerSet) :\n- Reps différentes par série (ex: 20/15/12/8/8) → repsPerSet:[20,15,12,8,8] et sets:5. Mêmes reps partout → repsPerSet:[] et sets=nombre de séries.\n- "4x8" → sets:4, reps:8, repsPerSet:[]. Unilatéral (bras/bras, jambe/jambe, alterné) → chaque ligne NxN = 2 séries.\n- "vide"/"barre à vide" → kg:0. Ramping reps ("3+4+5+6+7 par cycle") → repsPerSet:[3,4,5,6,7], jamais 3x7.\n\n2. SÉRIES SPÉCIALES (specialSets) : indices 0-based des séries dont les reps sont en rouge/couleur. Aucune → [].\n\n3. NOTE (OBLIGATOIRE, ne rien omettre) : capture TOUT le texte en couleur = méthodes (Isométrie, Excentrique, Myo-Reps, Rest-pause, Ramping…) + instructions d\'exécution. Sépare par " | ".\n\n4. STRUCTURE et setType : setType = "" (Normal) ou "D" (Dropset) UNIQUEMENT. JAMAIS "E" ni "W". "à l\'échec"/"Maxi"/"échauffement" → NOTE, jamais setType. kg:0 si non indiqué.\n\n5. SUPERSETS : préfixe lettre+chiffre (C1/C2 → supersetGroup:"C") ou "+" ENTRE deux noms d\'exercices complets. Ne PAS confondre avec un "+" dans les reps (15x2+15). Solo → supersetGroup:"".\n\n6. DROPSETS : charges/reps dégressives → setType:"D", repsPerSet + kgPerSet par palier. "max"/"à l\'échec" → 99 dans repsPerSet.\n\n7. CHARGES (%1RM) : si 1RM + pourcentages donnés → kg = arrondi(1RM × %, 0.5). RPE → note.\n\nRéponds UNIQUEMENT avec le JSON, aucun autre texte.';
const HIST_PROMPT = 'Analyse ce document et extrait TOUTES les séances d\'entraînement réalisées.\n\nRetourne UNIQUEMENT un objet JSON valide, sans texte avant ni après, sans balises markdown :\n{"sessions":[{"date":"YYYY-MM-DD","estimatedDate":false,"label":"Séance 1 (15) 23/04","exercises":[{"name":"Squat à la barre","sets":[{"kg":80,"reps":8,"type":"","note":""}],"note":""}]}]}\n\nRÈGLES STRICTES :\n\n0. EXTRACTION : Extrais TOUTES les séances dans l\'ordre chronologique, sans rater aucun exercice ni série. Chaque bloc "Séance N" ou titre de séance daté = une séance.\n\n1. DATES : "23/04/26"→"2026-04-23" ; "14/05"→"2026-05-14" (année 2026 si manquante). Séance sans date claire → estimatedDate:true. label = titre exact du bloc.\n\n2. SÉRIES ("N rep Xkg" = une série) : kg=X, reps=N, type="". "vide"/"PDC"/"poids du corps"→kg:0. "par bras"/"par jambe"/"unilatéral"→2 séries. "N rep Xkg N rep Ykg" sur une ligne = DROP SET [{kg:X,reps:N,type:"D"},{kg:Y,reps:M,type:"D"}]. Notes libres → champ note.\n\n3. TYPE : UNIQUEMENT "" (Normal) ou "D" (Drop set). JAMAIS "E" ni "W".\n\n4. NOMS : le nom tel qu\'écrit, corrige les fautes évidentes.\n\nRéponds UNIQUEMENT avec le JSON, aucun autre texte.';
async function importDoc(body, apiKey, kind) {
  if (!apiKey) return { status: 'error', error: 'Clé API absente dans Cloudflare (ANTHROPIC_API_KEY).' };
  const images = body.images || [];
  if (!images.length) return { status: 'error', error: 'Aucun fichier reçu' };
  const hasText = images.some(img => img.isText || img.type === 'text/plain');
  const hasPdf = images.some(img => img.type === 'application/pdf');
  const userContent = docContent(images);
  userContent.push({ type: 'text', text: kind === 'history' ? HIST_PROMPT : PROG_PROMPT });
  const model = (kind === 'history' || images.length > 1 || hasText || hasPdf) ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001';
  const text = await callClaude(apiKey, { model, max_tokens: 8192, messages: [{ role: 'user', content: userContent }] });
  const stripped = String(text || '').replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const m = stripped.match(/\{[\s\S]*\}/);
  if (!m) return { status: 'error', error: 'Extraction échouée. Réponse IA : ' + String(text).slice(0, 200) };
  const cleaned = m[0].replace(/‘|’/g, "'").replace(/“|”/g, '"').replace(/\r\n|\r/g, '\\n').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  let data;
  try { data = JSON.parse(cleaned); } catch (e) { return { status: 'error', error: 'JSON invalide : ' + e.message }; }
  if (kind === 'history') {
    if (!data.sessions || !Array.isArray(data.sessions)) data.sessions = [];
    data.sessions.forEach(sess => {
      sess.estimatedDate = Boolean(sess.estimatedDate);
      sess.label = String(sess.label || '');
      if (sess.date && !/^\d{4}-\d{2}-\d{2}$/.test(String(sess.date))) {
        const mm = String(sess.date).match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
        if (mm) { const y = mm[3] ? (mm[3].length === 2 ? '20' + mm[3] : mm[3]) : '2026'; sess.date = y + '-' + String(mm[2]).padStart(2, '0') + '-' + String(mm[1]).padStart(2, '0'); }
        else { sess.date = ''; sess.estimatedDate = true; }
      }
      (sess.exercises || []).forEach(ex => {
        ex.name = String(ex.name || '').trim();
        ex.note = String(ex.note || '');
        (ex.sets || []).forEach(s => { s.kg = Math.round((parseFloat(s.kg) || 0) * 2) / 2; s.reps = parseInt(s.reps) || 0; s.type = s.type === 'D' ? 'D' : ''; s.note = String(s.note || ''); });
        ex.sets = (ex.sets || []).filter(s => s.reps > 0);
      });
      sess.exercises = (sess.exercises || []).filter(ex => ex.name && ex.sets && ex.sets.length > 0);
    });
    data.sessions = data.sessions.filter(s => s.exercises && s.exercises.length > 0);
    if (!data.sessions.length) return { status: 'error', error: 'Aucune séance trouvée dans le document.' };
  }
  return { status: 'ok', data };
}

// ── Morphologie — recopié de handleMorphoAnalysis_
async function morpho(body, apiKey) {
  if (!apiKey) return { status: 'error', error: 'Clé API absente dans Cloudflare (ANTHROPIC_API_KEY).' };
  const images = body.images || [];
  if (!images.length) return { status: 'error', error: 'Aucune image reçue' };
  const gender = body.gender || 'H';
  const gLabel = gender === 'F' ? 'femme' : 'homme';
  const userContent = images.map(img => ({ type: 'image', source: { type: 'base64', media_type: img.type || 'image/jpeg', data: img.data } }));
  userContent.push({ type: 'text', text:
    'Analyse les photos de cet(te) ' + gLabel + ' et détermine sa morphologie.\n\nRetourne UNIQUEMENT un objet JSON valide sans texte avant ou après :\n'
    + (gender === 'F'
      ? '{"morpho":"H|A|V|X|O","morphotype":"ecto|meso|endo","bodyComp":"description courte de la composition corporelle estimée","strengths":"points forts morphologiques en 1-2 phrases","advice":"conseils nutrition et entraînement personnalisés selon la morphologie en 2-3 phrases"}'
      : '{"morpho":"H|A|T|V|O","morphotype":"ecto|meso|endo","bodyComp":"description courte de la composition corporelle estimée","strengths":"points forts morphologiques en 1-2 phrases","advice":"conseils nutrition et entraînement personnalisés selon la morphologie en 2-3 phrases"}')
    + '\n\nMorphologies ' + (gender === 'F' ? 'femme' : 'homme') + ' :\n'
    + (gender === 'F'
      ? '- H: Rectangle (épaules/taille/hanches similaires)\n- A: Poire (hanches plus larges)\n- V: Triangle inversé (épaules plus larges)\n- X: Sablier (taille très marquée)\n- O: Ronde (ventre proéminent)'
      : '- H: Rectangle\n- A: Triangle (hanches plus larges)\n- T: Trapèze (épaules légèrement plus larges)\n- V: Triangle inversé (épaules beaucoup plus larges)\n- O: Ovale (ventre proéminent)')
    + '\nMorphotypes : ecto=mince/métabolisme rapide, meso=athlétique, endo=rond/métabolisme lent' });
  const text = await callClaude(apiKey, { model: 'claude-haiku-4-5-20251001', max_tokens: 1024, messages: [{ role: 'user', content: userContent }] });
  const m = String(text || '').match(/\{[\s\S]*\}/);
  if (!m) return { status: 'error', error: 'Analyse impossible. Réessaie avec des photos plus nettes.' };
  let data;
  try { data = JSON.parse(m[0]); } catch (e) { return { status: 'error', error: 'JSON invalide' }; }
  return { status: 'ok', data };
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
  });
}
