/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
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
      if (body.action === 'bodyStudy')      return json(await bodyStudy(body, apiKey));
      if (body.action === 'importBloodTest') return json(await bloodTest(body, apiKey));
      if (body.action === 'summarizeCoach')  return json(await summarizeCoach(body, apiKey));
      if (body.action === 'estimateFood')    return json(await estimateFood(body, apiKey));
      if (body.action === 'importMealPlan')  return json(await importMealPlan(body, apiKey));
      if (body.action === 'generateMealPlan') return json(await generateMealPlan(body, apiKey));

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
// Variante instrumentée : renvoie AUSSI le statut HTTP et le type d'erreur de l'API Anthropic.
// Sert au diagnostic (PT-001 / laboratoire) — distinguer rate limit (429), surcharge (529),
// erreur API, réponse vide… au lieu de tout masquer en « Désolé, réessaie. ».
async function callClaudeDiag(apiKey, payload) {
  try {
    const r = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(payload),
    });
    let data = null; try { data = await r.json(); } catch (e) {}
    const text = (data && data.content && data.content[0] && data.content[0].text) || '';
    const apiErr = (data && data.error) ? [data.error.type, data.error.message].filter(Boolean).join(': ') : '';
    return { text, status: r.status, apiErr: String(apiErr) };
  } catch (e) {
    return { text: '', status: 0, apiErr: 'fetch: ' + ((e && e.message) || '?') };
  }
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
  // Sanitize : l'API Anthropic n'accepte QUE {role, content} sur un message. Un champ parasite
  // (ex. _silent du débrief auto) → 400 invalid_request_error. On nettoie défensivement.
  const history = (body.history || []).slice(-8)
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && m.content != null && m.content !== '')
    .map(m => ({ role: m.role, content: m.content }));
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
  const d = await callClaudeDiag(apiKey, { model, max_tokens: 1024, system, messages });
  // _diag = diagnostic technique (ignoré par l'app normale, lu par PT-001 / le laboratoire).
  // On NE change PAS le message utilisateur : Milo dit toujours « Désolé, réessaie. » si vide.
  const _diag = d.text ? 'ok'
    : (d.status === 429 ? 'rate_limit'
      : (d.status === 529 ? 'overloaded'
        : (d.status && d.status >= 400 ? ('api_error ' + d.status + (d.apiErr ? ' ' + d.apiErr : ''))
          : (d.apiErr ? ('error ' + d.apiErr) : 'empty'))));
  return { reply: d.text || 'Désolé, réessaie.', _diag };
}

// ── Import de document : programme / historique — recopié de handleImportProgram_/handleImportHistory_
function docContent(images) {
  return images.map(img => {
    if (img.isText || img.type === 'text/plain') return { type: 'text', text: '[Fichier : ' + (img.name || 'document') + ']\n\n' + img.data };
    if (img.type === 'application/pdf') return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: img.data } };
    return { type: 'image', source: { type: 'base64', media_type: img.type || 'image/jpeg', data: img.data } };
  });
}
const PROG_PROMPT = 'Analyse ces images/documents et extrait le programme d\'entraînement complet.\n\nRetourne UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après, sans balises markdown, avec cette structure exacte :\n{"name":"nom du programme","weeks":7,"startDate":"2026-03-23","days":[{"label":"Séance 1 - Dorsaux Triceps","exercises":[{"name":"nom complet de l\'exercice","sets":5,"reps":8,"repsPerSet":[20,15,12,8,8],"specialSets":[3,4],"kg":0,"kgPerSet":[],"supersetGroup":"","setType":"","note":"méthode et instructions"}]}]}\n\nRègles STRICTES :\n\n0. DÉCOUPAGE EN SÉANCES — RÈGLE ABSOLUE :\n- Une NOUVELLE séance commence UNIQUEMENT quand le document contient un titre explicite : "SÉANCE N", "SEANCE N", "Jour N", "Day N", "Workout N".\n- Les titres de GROUPES MUSCULAIRES (DORSAUX, PECTORAUX, BICEPS…) = sous-sections à l\'intérieur d\'une séance. Ils ne créent JAMAIS une nouvelle séance.\n- Ignore les pages SOMMAIRE (liste des séances sans tableau d\'exercices) et toute séance vide.\n\n1. REPS PAR SÉRIE (repsPerSet) :\n- Reps différentes par série (ex: 20/15/12/8/8) → repsPerSet:[20,15,12,8,8] et sets:5. Mêmes reps partout → repsPerSet:[] et sets=nombre de séries.\n- "4x8" → sets:4, reps:8, repsPerSet:[]. Unilatéral (bras/bras, jambe/jambe, alterné) → chaque ligne NxN = 2 séries.\n- "vide"/"barre à vide" → kg:0. Ramping reps ("3+4+5+6+7 par cycle") → repsPerSet:[3,4,5,6,7], jamais 3x7.\n\n2. SÉRIES SPÉCIALES (specialSets) : indices 0-based des séries dont les reps sont en rouge/couleur. Aucune → [].\n\n3. NOTE (OBLIGATOIRE, ne rien omettre) : capture TOUT le texte en couleur = méthodes (Isométrie, Excentrique, Myo-Reps, Rest-pause, Ramping…) + instructions d\'exécution. Sépare par " | ".\n\n4. STRUCTURE et setType : setType = "" (Normal) ou "D" (Dropset) UNIQUEMENT. JAMAIS "E" ni "W". "à l\'échec"/"Maxi"/"échauffement" → NOTE, jamais setType. kg:0 si non indiqué.\n\n5. SUPERSETS / BI-SETS / TRI-SETS : deux exercices (ou plus) enchaînés SANS repos entre eux = même supersetGroup (une lettre commune). Reconnais TOUS ces formats : (a) préfixe lettre+chiffre A1/A2, B1/B2, C1/C2… → supersetGroup = la lettre ("A","B","C"…) ; (b) un mot "Superset", "Supersérie", "SS", "Bi-set", "Bi-série", "Tri-set", "Circuit", "en superset avec", "combiné avec", "enchaîné avec" au-dessus ou à côté d\'un groupe d\'exercices → donne-leur la MÊME lettre de groupe ; (c) exercices reliés par une accolade/crochet/trait, ou par "+" ENTRE deux noms d\'exercices complets. NE PAS confondre avec un "+" dans les reps (15x2+15). Un exercice seul (non enchaîné) → supersetGroup:"".\n\n6. DROPSETS : charges/reps dégressives → setType:"D", repsPerSet + kgPerSet par palier. "max"/"à l\'échec" → 99 dans repsPerSet.\n\n7. CHARGES (%1RM) : si 1RM + pourcentages donnés → kg = arrondi(1RM × %, 0.5). RPE → note.\n\nRéponds UNIQUEMENT avec le JSON, aucun autre texte.';
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

// ── Étude du corps — recopié de handleBodyStudy_ (mode deep/compare) ──────────
async function bodyStudy(body, apiKey) {
  if (!apiKey) return { status: 'error', error: 'Clé API absente dans Cloudflare (ANTHROPIC_API_KEY).' };
  const images = body.images || [];
  if (!images.length) return { status: 'error', error: 'Aucune image reçue' };
  const gender = body.gender === 'F' ? 'femme' : 'homme';
  const age = body.age || '?';
  const goal = body.goal || 'muscle';
  const discipline = body.discipline || 'muscu';
  const health = body.health || {};
  const conditions = (health.conditions || []).join(', ');
  const injuries = (health.injuries || []).map(i => (i.zone || '') + (i.status ? ' (' + i.status + ')' : '')).join(', ');
  const healthNotes = (health.notes || '').trim();
  const healthTxt = (conditions || injuries || healthNotes)
    ? ('Conditions: ' + (conditions || 'aucune') + ' | Blessures: ' + (injuries || 'aucune') + (healthNotes ? (' | Notes: ' + healthNotes) : ''))
    : 'Aucune information santé fournie';

  const deep = body.deep === true;
  const prevImages = (body.compare === true && Array.isArray(body.prevImages)) ? body.prevImages : [];
  const compare = prevImages.length > 0;

  const userContent = images.map(img => ({ type: 'image', source: { type: 'base64', media_type: img.type || 'image/jpeg', data: img.data } }));
  const labelLine = images.map(img => img.label).filter(Boolean).join(', ');
  prevImages.forEach(img => userContent.push({ type: 'image', source: { type: 'base64', media_type: img.type || 'image/jpeg', data: img.data } }));

  const promptText = 'Tu es un coach expert en morphologie, posture et biomécanique. Analyse ces photos d\'un(e) ' + gender + ' de ' + age + ' ans '
    + '(objectif: ' + goal + ', discipline: ' + discipline + '). '
    + (compare
        ? ('Les ' + images.length + ' PREMIÈRES photos = SÉRIE ACTUELLE (ordre: ' + (labelLine || 'non précisé') + '). Les ' + prevImages.length + ' SUIVANTES = SÉRIE PRÉCÉDENTE du ' + (body.prevDate || '?') + (body.prevAnalysis ? (' (résumé du bilan précédent: ' + String(body.prevAnalysis).slice(0, 400) + ')') : '') + '. Compare la série actuelle à la précédente. ')
        : ('Photos fournies (dans l\'ordre): ' + (labelLine || 'non précisé') + '. '))
    + 'Les poses relâchées montrent la posture, les poses contractées révèlent le développement réel et les asymétries.\n\n'
    + 'PROFIL SANTÉ: ' + healthTxt + '. Tes suggestions d\'exercices DOIVENT respecter ces contraintes (éviter/adapter les mouvements à risque) et le mentionner dans "healthNotes".\n\n'
    + 'Analyse ' + (deep ? 'de façon TRÈS complète et détaillée' : '') + ': la stature et la posture (bascule du bassin, épaules enroulées/asymétriques, dos), les insertions musculaires visibles (longueur des muscles, points forts génétiques), l\'ÉQUILIBRE du corps (gauche/droite, haut/bas, agonistes/antagonistes ex. pectoraux vs dos), les points forts et les groupes en retard, et propose des exercices correctifs concrets et prioritaires.\n\n'
    + 'Reste bienveillant, factuel et prudent. Ne pose JAMAIS de diagnostic médical.\n\n'
    + 'Retourne UNIQUEMENT un objet JSON valide, sans texte avant/après, avec EXACTEMENT ces clés:\n'
    + '{' + (compare ? '"evolution":"compare la série actuelle à la précédente: ce qui a progressé, ce qui a fondu/pris, les changements de posture/équilibre visibles — en 2-4 phrases concrètes et motivantes",' : '') + '"stature":"posture et stature en 2-3 phrases","insertions":"insertions musculaires notables en 2-3 phrases","balance":"évaluation de l\'équilibre gauche/droite, haut/bas, avant/arrière — dis clairement si le corps est globalement équilibré ou non et pourquoi","strengths":"points forts en 1-2 phrases","weaknesses":"groupes musculaires ou zones en retard en 1-2 phrases","exercises":[{"zone":"groupe/zone ciblée","exercises":"2-3 exercices concrets","why":"pourquoi (court)"}],"healthNotes":"comment la santé a été prise en compte / mouvements à éviter ou adapter en 1-2 phrases","summary":"synthèse motivante en 1-2 phrases"}';

  userContent.push({ type: 'text', text: promptText });
  const text = await callClaude(apiKey, { model: 'claude-sonnet-4-6', max_tokens: (deep || compare) ? 3072 : 2048, messages: [{ role: 'user', content: userContent }] });
  const m = String(text || '').match(/\{[\s\S]*\}/);
  if (!m) return { status: 'error', error: 'Analyse impossible. Réessaie avec des photos plus nettes et bien cadrées.' };
  let data;
  try { data = JSON.parse(m[0]); } catch (e) { return { status: 'error', error: 'JSON invalide' }; }
  return { status: 'ok', data };
}

// ── Prise de sang — recopié de handleImportBloodTest_ ────────────────────────
async function bloodTest(body, apiKey) {
  if (!apiKey) return { status: 'error', error: 'Clé API absente dans Cloudflare (ANTHROPIC_API_KEY).' };
  const imgs = imagesOf(body);
  if (!imgs.length) return { status: 'error', error: 'Aucune image reçue' };
  const multi = imgs.length > 1;
  const userContent = imgs.map(im => ({ type: 'image', source: { type: 'base64', media_type: im.type || 'image/jpeg', data: im.data } }));
  userContent.push({ type: 'text', text:
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
    + 'value = nombre. low/high = bornes de l\'intervalle (nombres) ou null si absentes/texte du type "< 50" (dans ce cas low=null, high=50) ou "> 10" (low=10, high=null).' });
  const text = await callClaude(apiKey, { model: 'claude-sonnet-4-6', max_tokens: 4096, messages: [{ role: 'user', content: userContent }] });
  const m = String(text || '').match(/\{[\s\S]*\}/);
  if (!m) return { status: 'error', error: 'Lecture impossible. Réessaie avec des photos plus nettes.' };
  let data;
  try { data = JSON.parse(m[0]); } catch (e) { return { status: 'error', error: 'JSON invalide' }; }
  return { status: 'ok', data };
}

// ── Mémoire du coach — recopié de handleSummarizeCoach_ (génère le résumé) ────
// ⚠️ Le worker ne persiste PAS dans le stockage Google : le résumé revient au
//    front (S.coachMemory local) puis part au cloud via le prochain saveProfile.
async function summarizeCoach(body, apiKey) {
  if (!apiKey) return { summary: '' };
  const history = (body.history || []).slice(-16);
  const existing = body.existingMemory || '';
  const histText = history.map(m => {
    const role = m.role === 'user' ? 'Utilisateur' : 'Coach';
    const content = typeof m.content === 'string' ? m.content
      : (Array.isArray(m.content) ? m.content.filter(c => c.type === 'text').map(c => c.text).join(' ') : '');
    return role + ': ' + String(content).substring(0, 400);
  }).join('\n');
  const prompt = (existing ? 'Mémoire existante : ' + existing + '\n\n' : '')
    + 'Résume cette conversation coach/athlète en 2-3 phrases max (garde : objectifs, conseils clés, décisions, problèmes identifiés). Français uniquement.\n\nConversation :\n' + histText + '\n\nRésumé :';
  const summary = await callClaude(apiKey, { model: 'claude-haiku-4-5-20251001', max_tokens: 250, messages: [{ role: 'user', content: prompt }] });
  return { summary: summary || '' };
}

// ── Journal : estimer kcal+macros d'une description texte — handleEstimateFood_
async function estimateFood(body, apiKey) {
  if (!apiKey) return { status: 'error', error: 'Clé API absente dans Cloudflare (ANTHROPIC_API_KEY).' };
  const desc = String(body.description || '').trim();
  if (!desc) return { status: 'error', error: 'Description vide' };
  const prompt = 'Tu es un expert en nutrition. Estime les valeurs nutritionnelles TOTALES de ce que la personne a mangé.\n\n'
    + 'Repas décrit : "' + desc + '"\n\n'
    + 'Retourne UNIQUEMENT un objet JSON valide, sans texte avant ni après, sans balises markdown :\n'
    + '{"name":"résumé court du repas","kcal":650,"prot":40,"carbs":70,"fat":18}\n\n'
    + 'Règles :\n- kcal = calories totales (nombre entier).\n- prot, carbs, fat = grammes totaux de protéines, glucides, lipides (nombres entiers).\n'
    + '- Si les quantités ne sont pas précisées, estime une portion normale.\n- name = résumé court et propre du repas (max 40 caractères).\n'
    + '- Sois réaliste, ne mets jamais 0 kcal si un aliment est cité.\nRéponds UNIQUEMENT avec le JSON.';
  const text = await callClaude(apiKey, { model: 'claude-haiku-4-5-20251001', max_tokens: 400, messages: [{ role: 'user', content: prompt }] });
  const d = firstJson(text);
  if (!d) return { status: 'error', error: 'Estimation échouée' };
  return {
    status: 'ok',
    name: String(d.name || desc).slice(0, 60),
    kcal: Math.max(0, parseInt(d.kcal) || 0),
    prot: Math.max(0, parseInt(d.prot) || 0),
    carbs: Math.max(0, parseInt(d.carbs) || 0),
    fat: Math.max(0, parseInt(d.fat) || 0),
  };
}

// ── Import plan diététicien (photo/PDF/texte) — handleImportMealPlan_ ─────────
async function importMealPlan(body, apiKey) {
  if (!apiKey) return { status: 'error', error: 'Clé API absente dans Cloudflare (ANTHROPIC_API_KEY).' };
  const images = body.images || [];
  if (!images.length) return { status: 'error', error: 'Aucun fichier reçu' };
  const diet = String(body.diet || '');
  const userContent = docContent(images);
  userContent.push({ type: 'text', text:
    'Analyse ce document (plan alimentaire d\'un(e) diététicien(ne) / nutritionniste) et extrais TOUS les repas.\n\nRetourne UNIQUEMENT un objet JSON valide, sans texte avant ni après, sans balises markdown, avec cette structure exacte :\n{"planName":"nom ou objectif du plan","days":[{"label":"Lundi","meals":[{"name":"Petit-déjeuner","foods":["3 œufs","50g de flocons d\'avoine","1 banane"],"kcal":450,"prot":30,"carbs":45,"fat":15}]}]}\n\nRÈGLES STRICTES :\n\n1. JOURS :\n- Si le plan détaille plusieurs jours (Lundi, Mardi… ou Jour 1, Jour 2…) → un objet par jour dans "days", label = le nom du jour.\n- Si le plan décrit UNE journée type (sans distinction de jours) → un seul jour, label = "Journée type".\n- Maximum 7 jours.\n\n2. REPAS :\n- Chaque repas (Petit-déjeuner, Collation, Déjeuner, Goûter, Dîner, Pré/Post-training…) = un objet dans "meals". name = le nom du repas tel qu\'écrit.\n- "foods" = liste des aliments avec leurs quantités, un aliment par entrée, texte fidèle au document (ex. "150g de riz basmati", "200g de poulet").\n\n3. MACROS ET CALORIES :\n- Si le document indique les kcal/protéines/glucides/lipides par repas → reprends-les (nombres entiers, en grammes pour prot/carbs/fat).\n- Si NON indiqués → estime-les au mieux à partir des aliments et quantités (valeurs réalistes). Ne mets jamais 0 si le repas contient des aliments.\n\n4. FIDÉLITÉ : n\'invente pas de repas absents. Ne modifie pas les quantités données. Reprends le plan tel quel.'
    + (diet ? '\n\n5. RÉGIME DE L\'UTILISATEUR : ' + diet + '. Si un aliment du plan ne respecte PAS ce régime, garde-le quand même (c\'est le plan du diététicien) mais ajoute " ⚠️" à la fin de la ligne de cet aliment.' : '')
    + '\n\nRéponds UNIQUEMENT avec le JSON, aucun autre texte.' });
  const hasText = images.some(img => img.isText || img.type === 'text/plain');
  const hasPdf = images.some(img => img.type === 'application/pdf');
  const model = (images.length > 1 || hasText || hasPdf) ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001';
  const text = await callClaude(apiKey, { model, max_tokens: 8192, messages: [{ role: 'user', content: userContent }] });
  const stripped = String(text || '').replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const mm = stripped.match(/\{[\s\S]*\}/);
  if (!mm) return { status: 'error', error: 'Extraction échouée. Réponse IA : ' + String(text).slice(0, 200) };
  const cleaned = mm[0].replace(/‘|’/g, "'").replace(/“|”/g, '"').replace(/\r\n|\r/g, '\\n').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  let data;
  try { data = JSON.parse(cleaned); } catch (e) { return { status: 'error', error: 'JSON invalide : ' + e.message }; }
  data.planName = String(data.planName || '');
  if (!data.days || !Array.isArray(data.days)) data.days = [];
  data.days = data.days.slice(0, 7);
  data.days.forEach(day => {
    day.label = String(day.label || '');
    (day.meals || []).forEach(m => {
      m.name = String(m.name || 'Repas');
      m.foods = Array.isArray(m.foods) ? m.foods.map(f => String(f)).filter(Boolean) : [];
      m.kcal = parseInt(m.kcal) || 0; m.prot = parseInt(m.prot) || 0; m.carbs = parseInt(m.carbs) || 0; m.fat = parseInt(m.fat) || 0;
    });
    day.meals = (day.meals || []).filter(m => m.foods.length > 0);
  });
  data.days = data.days.filter(d => d.meals && d.meals.length > 0);
  if (!data.days.length) return { status: 'error', error: 'Aucun repas trouvé dans le document.' };
  return { status: 'ok', data };
}

// ── Génération de plan de repas IA — handleGenerateMealPlan_ (erreur = message)
async function generateMealPlan(body, apiKey) {
  if (!apiKey) return { status: 'error', message: 'Clé API manquante' };
  const ctx = String(body.context || '');
  const scope = body.scope || 'day';
  const startDate = body.startDate || new Date().toISOString().split('T')[0];
  const regenDay = body.regenDay || null;
  const regenMeal = body.regenMeal || null;
  let userMsg, maxTokens;
  if (regenMeal && regenDay) {
    userMsg = 'Régénère UNIQUEMENT le repas "' + regenMeal + '" pour la date ' + regenDay + '.\n'
      + 'Retourne UNIQUEMENT ce JSON (un seul repas) :\n'
      + '{"days":[{"date":"' + regenDay + '","meals":[{"name":"' + regenMeal + '","foods":["Aliment 1","Aliment 2"],"kcal":0,"prot":0,"carbs":0,"fat":0}]}]}';
    maxTokens = 512;
  } else {
    const days = scope === 'week' ? 7 : 1;
    const dates = [];
    const d0 = new Date(startDate + 'T12:00:00');
    for (let i = 0; i < days; i++) { const di = new Date(d0.getTime()); di.setDate(d0.getDate() + i); dates.push(di.toISOString().split('T')[0]); }
    userMsg = 'Génère un plan de repas pour ' + (days === 1 ? '1 jour' : '7 jours') + '.\n'
      + 'Dates exactes : ' + dates.join(', ') + '\nRetourne UNIQUEMENT le JSON, sans texte avant ou après.';
    maxTokens = scope === 'week' ? 3500 : 900;
  }
  const systemPrompt = 'Tu es un diététicien sportif. Génère un plan de repas adapté au profil fourni.\n\n'
    + 'RÈGLE ABSOLUE : réponds UNIQUEMENT avec du JSON valide, sans aucun texte avant ou après.\n\n'
    + 'Format exact (respecte les emojis dans "name") :\n'
    + '{"days":[{"date":"YYYY-MM-DD","meals":['
    + '{"name":"🌅 Petit-déjeuner","foods":["Avoine 80g","Œufs brouillés (3)","Lait 200ml"],"kcal":420,"prot":28,"carbs":55,"fat":12},'
    + '{"name":"🍽️ Déjeuner","foods":["Poulet grillé 150g","Riz basmati 100g","Brocolis 100g"],"kcal":580,"prot":45,"carbs":65,"fat":14},'
    + '{"name":"🌙 Dîner","foods":["Saumon 130g","Patate douce 150g","Haricots verts"],"kcal":480,"prot":38,"carbs":40,"fat":18},'
    + '{"name":"🍎 Collation","foods":["Yaourt grec 200g","Noix 20g"],"kcal":220,"prot":16,"carbs":12,"fat":11}'
    + ']}]}\n\n'
    + 'Règles :\n- Exactement 4 repas par jour (Petit-déjeuner, Déjeuner, Dîner, Collation)\n'
    + '- 2 à 4 aliments par repas avec quantités précises (en grammes ou unités)\n'
    + '- Macros cohérentes avec le profil fourni, s\'additionnant proches des cibles\n'
    + '- Aliments réalistes et disponibles en France\n- Sur 7 jours : varie les plats (pas le même dîner deux jours consécutifs)';
  const r = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: maxTokens, system: systemPrompt, messages: [{ role: 'user', content: ctx + '\n\n' + userMsg }] }),
  });
  const result = await r.json();
  if (result.error) return { status: 'error', message: result.error.message };
  const rawTxt = ((result.content && result.content[0] && result.content[0].text) || '').trim();
  let parsed;
  try { const m2 = rawTxt.match(/\{[\s\S]*\}/); parsed = JSON.parse(m2 ? m2[0] : rawTxt); }
  catch (pe) { return { status: 'error', message: 'Format JSON invalide : ' + rawTxt.substring(0, 100) }; }
  return { status: 'ok', plan: parsed };
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
  });
}
