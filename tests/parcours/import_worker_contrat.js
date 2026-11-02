/* ═══════════════════════════════════════════════════════════════════════════════════════
   📥 IMPORT-IA-FIDELITE-01 · LOT A — LE CONTRAT D'IMPORT DU WORKER (02/11/2026)

   LE DÉFAUT. Le Worker est la route VIVANTE de `importProgram` (`AI_PROXY_ACTIONS`, constants.js) :
   c'est lui qui lit le document de la personne, pas Apps Script. Or son prompt était une copie
   ANCIENNE de celui de `Code.js` — 2 822 caractères contre 9 832 : ni `setTypePerSet`, ni repos,
   ni anti-invention de date (l'exemple de structure portait `"weeks":7,"startDate":"2026-03-23"`,
   recopiable), et la liste `body.catalogue` que le client envoie n'était jamais lue. Pire : AUCUNE
   validation de la réponse. Ce que le modèle écrivait partait tel quel dans l'application.

   L'INVARIANT. Le programme importé est FIDÈLE au document : ce qui est écrit survit (dans un champ
   ou dans la note), ce qui n'est pas écrit n'est JAMAIS inventé (pas de `|| 10`, pas de `|| 3`, pas
   de date, pas de repos), et une plage reste une plage (« 8-10 » ne devient jamais 810).

   CE QUE CE BANC OBSERVE, et pas autre chose :
     .source : ce qui est ÉCRIT — la PARITÉ avec le prompt de Code.js (le repli), les deux
               exceptions documentées, le budget de taille, l'empreinte de l'historique.
     .reel   : le VRAI worker.js, conduit dans un bac à sable (`vm`), réseau SIMULÉ (0 appel réel),
               horloge FIGÉE au 02/11/2026. On regarde (1) le prompt réellement envoyé à
               Anthropic et (2) la réponse réellement rendue au client.
   ⛔ Ce qu'il ne prouve pas : la qualité de lecture du modèle (aucun appel IA), ni Cloudflare.
      Il prouve la MÉCANIQUE du Worker — le contrat de sortie et le prompt qu'il envoie.
   Contrôle négatif : `tools/mut_import_worker_contrat.py` (banc : `tools/banc_import_worker_contrat.js`).
   ═══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const vm = require('vm');
const crypto = require('crypto');

const ORIGINE = 'https://michdu75-commits.github.io';
const JETON = 'a'.repeat(64);
// L'horloge du bac à sable : le 2 novembre 2026 à midi UTC (13 h à Paris). Figée pour que les
// témoins de date ne dépendent JAMAIS du jour où on les lance.
const FIXE = Date.UTC(2026, 10, 2, 12, 0, 0);
// L'empreinte du prompt d'IMPORT D'HISTORIQUE tel qu'il était à ft-v1263 : ce lot n'y touche pas.
const EMPREINTE_HIST = '4bd0c498b2f7a071b6dc8909dbe54f0fa1850d99a97f2c4f4c9cf760b1fad041';
const MSG_TRONQUE = 'Programme trop long pour une seule lecture — importe-le en deux fois.';
const MSG_VIDE = 'Aucun exercice trouvé dans le document.';

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');

/* ───────────────────────── le bac à sable ───────────────────────── */
function dateFixe(ms) {
  return class DateFixe extends Date {
    constructor(...a) { if (a.length) super(...a); else super(ms); }
    static now() { return ms; }
  };
}
const rep = (obj, ok, statut) => ({ ok: ok !== false, status: statut || 200,
  async json() { return obj; }, async text() { return JSON.stringify(obj); } });
// L'API Anthropic simulée. `stop` : une raison d'arrêt, ou null pour « le modèle n'en a pas rendu ».
const repAnthropic = (texte, stop) => ({ ok: true, status: 200,
  async json() {
    const o = { content: [{ type: 'text', text: texte }], model: 'claude-sonnet-4-6', usage: {} };
    if (stop !== null) o.stop_reason = stop === undefined ? 'end_turn' : stop;
    return o;
  }, async text() { return ''; } });

/** Monte le VRAI worker.js : API Anthropic et Apps Script simulés et OBSERVÉS. */
function monter(ROOT, fs, path, o) {
  o = o || {};
  const src = fs.readFileSync(path.join(ROOT, 'worker.js'), 'utf8').replace(/export default/, 'const _handlerExporte =');
  const appels = [], ia = [];
  const ctx = {
    crypto: globalThis.crypto, TextEncoder, Request, Response, Headers, URL,
    console: { log() {}, error() {}, warn() {} }, setTimeout, clearTimeout,
    Date: dateFixe(o.maintenant || FIXE),
    async fetch(url, opts) {
      let corps = {}; try { corps = JSON.parse((opts && opts.body) || '{}'); } catch (e) {}
      const u = String(url);
      appels.push({ url: u, action: corps.action || '', brut: (opts && opts.body) || '' });
      if (u.indexOf('api.anthropic.com') >= 0) { ia.push(corps); return o.anthropic ? o.anthropic(corps, ia.length) : repAnthropic('{}'); }
      if (u.indexOf('script.google.com') >= 0) {
        if (corps.action === 'authIdentity')
          return o.pont ? o.pont() : rep({ status: 'ok', email: 'compte-a.test', premium: false, blocked: false });
        if (o.relais && ['aiCount', 'aiUsageLog'].indexOf(corps.action) < 0)
          return { ok: true, status: 200, async text() { return o.relais; }, async json() { return JSON.parse(o.relais); } };
        return rep({ status: 'ok' });
      }
      return rep({ status: 'ok' });
    },
  };
  ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  vm.runInContext(src + '\n;globalThis._h=_handlerExporte;', ctx, { filename: 'worker.js' });
  return { ctx, appels, ia };
}

const SORTIES = [];   // toutes les réponses « ok » rendues pendant le banc : le contrat est vérifié sur chacune

/** Une requête `importProgram` (ou autre action) de bout en bout. `modele` : l'objet (ou le texte) que le modèle simulé renvoie. */
async function importer(ROOT, fs, path, modele, opt) {
  opt = opt || {};
  const texte = typeof modele === 'string' ? modele : JSON.stringify(modele);
  const m = monter(ROOT, fs, path, { anthropic: opt.anthropic || (() => repAnthropic(texte, opt.stop)), pont: opt.pont, relais: opt.relais, maintenant: opt.maintenant });
  const corps = Object.assign({ action: 'importProgram', token: JETON,
    images: [{ type: 'text/plain', isText: true, data: 'DOCUMENT DE TEST', name: 'p.txt' }] }, opt.corps || {});
  if (opt.catalogue !== undefined) corps.catalogue = opt.catalogue;
  const req = new Request('https://worker.test/', { method: 'POST',
    headers: { Origin: ORIGINE, 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(corps) });
  const r = await m.ctx._h.fetch(req, opt.sansCle ? {} : { ANTHROPIC_API_KEY: 'cle-de-test' }, { waitUntil() {} });
  let d = {}; try { d = await r.json(); } catch (e) {}
  if (!opt.horsCorpus && d && d.status === 'ok' && d.data && opt.corps === undefined) SORTIES.push(d);
  return { statut: r.status, d, ia: m.ia, appels: m.appels,
    // l'instruction envoyée au modèle = le DERNIER bloc de texte du message ; le bloc catalogue, celui d'avant
    instr: lastText(m.ia[0]), catalogueBloc: catBloc(m.ia[0]) };
}
function blocs(corps) { const mm = corps && corps.messages && corps.messages[0]; return (mm && Array.isArray(mm.content)) ? mm.content : []; }
function lastText(corps) { const b = blocs(corps); return b.length ? String(b[b.length - 1].text || '') : ''; }
function catBloc(corps) { const b = blocs(corps).filter(x => x.type === 'text' && /^LISTE DES EXERCICES/.test(String(x.text || ''))); return b.length ? String(b[0].text) : ''; }

/* ───────────────────────── petites aides de lecture ───────────────────────── */
const jour = (r, j) => ((r.d.data || {}).days || [])[j || 0] || { exercises: [] };
const exo = (r, e, j) => (jour(r, j).exercises || [])[e || 0] || {};
const norm = (r) => ((r.d.data || {}).normalisation) || {};
const PROG = (exs, extra) => Object.assign({ name: 'Programme test', weeks: 0, startDate: '', days: [{ label: 'Jour 1', exercises: exs }] }, extra || {});
const J = (v) => JSON.stringify(v);
const arr = (x) => (Array.isArray(x) ? x : []);
const eg = (a, b) => J(a) === J(b);

/* Le CONTRAT de sortie (spec Lot A §2) — vérifié sur CHAQUE programme rendu pendant le banc. */
function violations(d) {
  const v = [];
  const dt = d && d.data;
  if (!dt || typeof dt !== 'object') return ['data absent'];
  if (typeof dt.name !== 'string' || dt.name.length > 120) v.push('name');
  if (!Number.isInteger(dt.weeks) || dt.weeks < 0 || dt.weeks > 104) v.push('weeks');
  if (typeof dt.startDate !== 'string' || (dt.startDate !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(dt.startDate))) v.push('startDate');
  if (!Array.isArray(dt.days) || !dt.days.length) v.push('days');
  arr(dt.days).forEach((jr, ji) => {
    if (!jr || typeof jr !== 'object') { v.push('j' + ji + ' jour non objet'); return; }
    if (typeof jr.label !== 'string') v.push('j' + ji + ' label');
    if (!Array.isArray(jr.exercises) || !jr.exercises.length) v.push('j' + ji + ' jour vide');
    arr(jr && jr.exercises).forEach((e, ei) => {
      if (!e || typeof e !== 'object') { v.push('j' + ji + 'e' + ei + ' exercice non objet'); return; }
      const p = 'j' + ji + 'e' + ei + ' ';
      if (typeof e.name !== 'string' || !e.name || e.name.length > 160) v.push(p + 'name');
      if (!Number.isInteger(e.sets) || e.sets < 1) v.push(p + 'sets');
      if (!Number.isInteger(e.reps) || e.reps < 0 || e.reps > 999) v.push(p + 'reps');
      ['repsPerSet', 'kgPerSet', 'setTypePerSet', 'restPerSet'].forEach(k => {
        if (!Array.isArray(e[k])) v.push(p + k + ' non tableau');
        else if (e[k].length && e[k].length !== e.sets) v.push(p + k + ' longueur ' + e[k].length + '≠' + e.sets);
      });
      arr(e.repsPerSet).forEach(x => { if (!Number.isInteger(x) || x < 0 || x > 999) v.push(p + 'repsPerSet valeur ' + J(x)); });
      if (typeof e.kg !== 'number' || !(e.kg >= 0 && e.kg <= 1000) || (e.kg * 2) % 1 !== 0) v.push(p + 'kg ' + J(e.kg));
      arr(e.kgPerSet).forEach(x => { if (typeof x !== 'number' || !(x >= 0 && x <= 1000) || (x * 2) % 1 !== 0) v.push(p + 'kgPerSet valeur ' + J(x)); });
      if (e.setType !== '' && e.setType !== 'D') v.push(p + 'setType ' + J(e.setType));
      arr(e.setTypePerSet).forEach(x => { if (x !== '' && x !== 'W') v.push(p + 'setTypePerSet valeur ' + J(x)); });
      if (!/^[A-Z]{0,2}$/.test(String(e.supersetGroup))) v.push(p + 'supersetGroup ' + J(e.supersetGroup));
      if (!Array.isArray(e.specialSets) || e.specialSets.some(i => !Number.isInteger(i) || i < 0 || i >= e.sets)) v.push(p + 'specialSets');
      if (typeof e.rest !== 'string' || e.rest.length > 40) v.push(p + 'rest');
      arr(e.restPerSet).forEach(x => { if (typeof x !== 'string' || x.length > 40) v.push(p + 'restPerSet valeur'); });
      if (typeof e.note !== 'string' || e.note.length > 1500) v.push(p + 'note');
    });
  });
  const n = dt.normalisation;
  if (!n || typeof n !== 'object') v.push('normalisation absente');
  else Object.keys(n).forEach(k => { if (!Number.isInteger(n[k]) || n[k] < 0) v.push('normalisation.' + k + ' ' + J(n[k])); });
  if (d.normalisation !== undefined) v.push('normalisation à la racine (une seule place : data.normalisation)');
  return v;
}

/* ───────────────────────── Code.js : la référence de parité ───────────────────────── */
function codeJs(ROOT, fs, path) {
  const src = fs.readFileSync(path.join(ROOT, 'Code.js'), 'utf8');
  const out = { prompt: '', bloc: '', normAccepteWE: false };
  const deb = src.indexOf("text: 'Analyse ces images/documents et extrait le programme");
  if (deb >= 0) {
    const q = src.indexOf("'", deb), fin = src.indexOf('\n', q);
    try { out.prompt = vm.runInNewContext('(' + src.slice(q, fin).replace(/\s+$/, '') + ')'); } catch (e) {}
  }
  const i = src.indexOf('function _blocCatalogue_(body) {');
  if (i >= 0) {
    const j = src.indexOf('\n}\n', i);
    try { out.bloc = vm.runInNewContext('(' + src.slice(i, j + 2) + ')')({ catalogue: ['Exercice A', 'Exercice B'] }); } catch (e) {}
  }
  out.normAccepteWE = src.indexOf("['D','W','E'].includes(String(ex.setType||'').toUpperCase())") >= 0;
  return out;
}

/** Le Worker chargé pour LIRE ses constantes (aucune requête n'est envoyée). */
function lireWorker(ROOT, fs, path) {
  const src = fs.readFileSync(path.join(ROOT, 'worker.js'), 'utf8').replace(/export default/, 'const _handlerExporte =');
  const ctx = { crypto: globalThis.crypto, TextEncoder, Request, Response, Headers, URL, console: { log() {}, error() {}, warn() {} },
    setTimeout, clearTimeout, fetch() { throw new Error('réseau interdit dans ce chargement'); } };
  ctx.globalThis = ctx; ctx.self = ctx; vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: 'worker.js' });
  return ctx;
}
const lire = (ctx, expr) => { try { return vm.runInContext(expr, ctx); } catch (e) { return undefined; } };

/* Les CAPACITÉS du prompt de Code.js que le Worker doit aussi porter. Chaque motif est ancré sur UNE phrase
   et DOIT se vérifier des deux côtés : un motif qui ne mord pas Code.js ne prouverait rien (contrôle C0). */
const CAPACITES = [
  ['structure : le repos par série est dans l\'exemple', /"setTypePerSet":\[\],"rest":"","restPerSet":\[\]/],
  ['séances : une nouvelle séance UNIQUEMENT sur un titre explicite', /Une NOUVELLE séance commence UNIQUEMENT/],
  ['séances : les groupes musculaires sont des sous-sections', /Ils ne créent JAMAIS une nouvelle séance/],
  ['séances : les pages SOMMAIRE sont ignorées', /Ignore les pages SOMMAIRE/],
  ['séances : une séance vide est ignorée', /Ignore toute séance vide/],
  ['séries : reps différentes → repsPerSet', /repsPerSet:\[20,15,12,8,8\] et sets:5/],
  ['séries : « 4x8 » → sets 4, reps 8', /"4x8" ou "4×8" → sets:4, reps:8, repsPerSet:\[\]/],
  ['unilatéral : chaque ligne NxN = 2 séries', /Chaque ligne "NxN" = 2 séries/],
  ['unilatéral : l\'exemple bras/bras à 8 séries', /\[15,15,12,12,8,8,8,8\]/],
  ['unilatéral + superset : le +M est le partenaire', /le "\+M" indique les reps du PARTENAIRE superset/],
  ['charge : « barre à vide » → kg 0', /"vide" ou "barre à vide"/],
  ['reps complexes (« 8+10 » → 10…)', /Reps complexes/],
  ['ramping reps : 3,4,5,6,7', /repsPerSet=\[3,4,5,6,7\]/],
  ['séries spéciales : indices 0-based des reps en rouge', /indices 0-based des séries dont les REPS apparaissent en rouge/],
  ['note : tout le texte en couleur', /Capture TOUT le texte en rouge\/couleur/],
  ['note : séparateur « | »', /Sépare les éléments par " \| "/],
  ['label du jour = nom complet de la séance', /label du jour = nom complet de la séance/],
  ['durée du programme (weeks)', /durée totale du programme en semaines/],
  ['anti-invention de date de début', /n'invente AUCUNE date de début/i],
  ['ne pas recopier l\'exemple de structure', /NE RECOPIE JAMAIS LES VALEURS DE L'EXEMPLE DE STRUCTURE/],
  ['tous les exercices de toutes les pages', /Inclus ABSOLUMENT TOUS les exercices de toutes les pages/],
  ['setType : jamais E ni W', /NE JAMAIS utiliser "E" \(Échec\) ni "W" \(Échauffement\)/],
  ['setType / setTypePerSet ne se contredisent pas', /CETTE INTERDICTION PORTE SUR LE CHAMP "setType"/],
  ['superset : préfixe lettre+chiffre', /C1\/C2, D1\/D2, A1\/A2/],
  ['superset : tri-set', /Tri-set C1\/C2\/C3/],
  ['superset : « + » entre deux noms complets', /ENTRE LEURS NOMS D'EXERCICE COMPLETS/],
  ['superset : ne pas confondre avec les « + » des reps', /ne PAS confondre avec les "\+" dans les colonnes Reps/],
  ['superset : exercice solo → groupe vide', /Exercice solo → supersetGroup:""/],
  ['dropset : paliers reps + kg', /repsPerSet:\[15,12,99\], kgPerSet:\[35,25,15\]/],
  ['dropset : « max » → 99', /99 dans repsPerSet/],
  ['charges en %1RM', /arrondi\(1RM × %, 0.5 kg\)/],
  ['RPE → note', /ajoute "RPE X" dans note/],
  ['colonne de type de série', /COLONNE « TYPE DE SÉRIE »/],
  ['lignes consécutives de même nom = UN exercice', /plusieurs LIGNES CONSÉCUTIVES portant LE MÊME NOM D'EXERCICE = UN SEUL exercice/],
  ['jamais « ECH » dans le nom', /ne mets JAMAIS « ECH », « \(ECH\) », « échauffement » ou « TRAV » dans le champ "name"/],
  ['l\'exemple réel du développé couché (7 séries, 4 « W »)', /"setTypePerSet":\["W","W","W","W","","",""\]/],
  ['setTypePerSet : un élément par série', /setTypePerSet : un élément PAR SÉRIE/],
  ['setTypePerSet : seulement d\'après la colonne', /N'emploie setTypePerSet QUE d'après cette colonne/],
  ['sans colonne de type → setTypePerSet vide', /Si le document n'a PAS de colonne de type : setTypePerSet:\[\] pour tous les exercices/],
  ['cardio : un exercice à part entière', /reste un exercice à part entière/],
  ['repos : la colonne Repos / Récup / Rest', /colonne « Repos », « Récup », « Rest »/],
  ['repos : un élément par série', /un élément PAR SÉRIE/],
  ['repos : écrit dans le titre → toutes les séances concernées', /s'applique à TOUS les exercices de cette séance/],
  ['repos : jamais inventé', /N'INVENTE JAMAIS UN REPOS/],
  ['repos : pas de doublon avec la note', /Ne mets PAS le repos dans la note/],
  ['sortie : JSON seul, avant', /Retourne UNIQUEMENT un objet JSON valide/],
  ['sortie : JSON seul, après', /Réponds UNIQUEMENT avec le JSON, aucun autre texte/],
  // le bloc catalogue (Code.js : `_blocCatalogue_`)
  ['catalogue : l\'intitulé de la liste', /LISTE DES EXERCICES QUE L'APPLICATION CONNAÎT/],
  ['catalogue : la règle s\'applique à chaque « name »', /RÈGLE DE NOMMAGE — elle s'applique à CHAQUE champ "name"/],
  ['catalogue : nom EXACT, caractère pour caractère', /nom EXACT de la liste, caractère pour caractère/],
  ['catalogue : seulement si MANIFESTEMENT le même', /MANIFESTEMENT/],
  ['catalogue : ce n\'est PAS une liste fermée', /PAS une liste fermée/],
  ['catalogue : sinon, le nom du document', /SINON, GARDE LE NOM DU DOCUMENT/],
  ['catalogue : dans le doute, le nom du document', /Dans le doute, garde le nom du document/],
];

/* ═══════════════════════════════════════════════ SOURCE ═══════════════════════════════════════════════ */
module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ IIF-W — LOT A : le contrat d\'import du Worker (source : parité avec Code.js) ═══');
  const C = codeJs(ROOT, fs, path);
  const wctx = lireWorker(ROOT, fs, path);
  const PW = String(lire(wctx, 'PROG_PROMPT') || '');
  const bf = lire(wctx, "typeof _blocCatalogueProg === 'function' ? _blocCatalogueProg : null");
  let BW = ''; try { BW = bf ? String(bf({ catalogue: ['Exercice A', 'Exercice B'] })) : ''; } catch (e) {}

  t('IIF-W-C0 CONTRÔLE — le prompt de Code.js s\'extrait (le témoin de parité a une référence)', C.prompt.length > 5000, 'longueur ' + C.prompt.length);
  t('IIF-W-C0 CONTRÔLE — le bloc catalogue de Code.js s\'extrait et s\'exécute', /LISTE DES EXERCICES/.test(C.bloc), C.bloc.slice(0, 80));
  t('IIF-W-C0 CONTRÔLE — le Worker porte un prompt de programme (PROG_PROMPT) et un bloc catalogue',
    PW.length > 2000 && !!BW, 'prompt ' + PW.length + ' · bloc ' + BW.length);

  const refCode = C.prompt + '\n' + C.bloc, refWorker = PW + '\n' + BW;
  CAPACITES.forEach(([nom, re]) => {
    const cote = re.test(refCode), wk = re.test(refWorker);
    t('IIF-W-C parité · ' + nom, cote && wk,
      !cote ? 'motif absent de Code.js : le témoin ne mesurerait rien' : 'MANQUE au prompt du Worker');
  });

  /* LES DEUX EXCEPTIONS DOCUMENTÉES — chacune se vérifie des DEUX côtés : Code.js a bien encore la chose
     (sinon l'exception est périmée), et le Worker ne l'a PAS (sinon le remplacement n'a pas eu lieu). */
  const flou = /Une valeur VARIABLE ou FLOUE n'est PAS un repos/;
  t('IIF-W-C exception 1 · « plage de repos → vide » est REMPLACÉE (Code.js la garde, le Worker recopie la plage)',
    flou.test(refCode) && !flou.test(refWorker) && /TEL QU'ÉCRIT/.test(PW) && /PLAGES \("60-90 s"/.test(PW)
    && !/L'app applique alors son propre réglage/.test(PW), 'Code.js:' + flou.test(refCode) + ' Worker:' + flou.test(refWorker));
  t('IIF-W-C exception 2 · setType W/E : le normaliseur de Code.js les laisse passer, le prompt du Worker les interdit',
    C.normAccepteWE === true && /NE JAMAIS utiliser "E" \(Échec\) ni "W" \(Échauffement\)/.test(PW), 'Code.js accepte W/E : ' + C.normAccepteWE);

  t('IIF-W-C budget · le prompt du Worker ne dépasse pas celui de Code.js de plus de 3 000 caractères',
    C.prompt.length > 0 && PW.length > 0 && PW.length <= C.prompt.length + 3000, 'Worker ' + PW.length + ' · Code.js ' + C.prompt.length + ' · écart ' + (PW.length - C.prompt.length));

  /* LES NOUVEAUTÉS DU WORKER (absentes de Code.js) : chacune a sa phrase, donc son témoin. */
  const NOUVEAUTES = [
    ['fidélité : tout ce que le document contient survit', /FIDÉLITÉ — ELLE PASSE AVANT TOUTES LES AUTRES/],
    ['fidélité : une info sans champ va dans la note', /Une information qui n'a pas de champ va dans "note"/],
    ['fidélité : n\'omets jamais une ligne, une série ni un exercice', /N'omets JAMAIS une ligne, une série ni un exercice/],
    ['plages : la valeur TELLE QUE DANS LE DOCUMENT, en chaîne', /PLAGE de reps \("8-10", "12-15"\) ou de charge[^\n]*TELLE QUE DANS LE DOCUMENT/],
    ['charge non chiffrée → 0 + la note', /Charge non chiffrée \("à calibrer", "léger", "progressif"\) → kg:0 et "Charge : à calibrer"/],
    ['colonnes sans champ (RIR, tempo, RPE) → la note', /Colonnes sans champ propre \(RIR, RPE, tempo, côté, consigne\)[^\n]*"RIR 2-3", "Tempo 3-1-1", "RPE 8"/],
    ['semaine A / semaine B : deux jours distincts', /"J3A - <titre> - Semaine A", puis "J3B - <titre> - Semaine B"/],
    ['séance facultative : la mention dans le label', /"\(facultative\)" dans le label/],
    ['repos : TEL QU\'ÉCRIT, plages comprises, rien calculé', /Recopie le texte TEL QU'ÉCRIT dans le document[^\n]*NE RIEN CALCULER, NE PAS CHOISIR dans une plage/],
    ['repos : les écritures de coach (1.30 mins…)', /"3 mins", "1\.30 mins", "2\.30 mins", "repos 40 sec"/],
    ['sans colonne de type : UNE LIGNE = UN EXERCICE', /UNE LIGNE = UN EXERCICE/],
    ['sans colonne de type : ne pas fusionner deux noms voisins', /Dev\. épaules guidé/],
    ['« montée en charge » en prose ne type pas les séries', /« Montée en charge 1x5 3x3 3x2 » décrit souvent le schéma entier/],
    ['date de début : seulement si elle est écrite', /UNIQUEMENT si le document écrit une date de début/],
  ];
  NOUVEAUTES.forEach(([nom, re]) => t('IIF-W-N nouveauté du Worker · ' + nom, re.test(PW), 'absent du prompt'));

  /* Le prompt ne contient plus aucune valeur recopiable. */
  t('IIF-W-N ⛔ l\'exemple de structure ne porte AUCUNE valeur réelle (ni 2026-03-23, ni "weeks":7)',
    !/2026-03-23/.test(PW) && !/"weeks"\s*:\s*7\b/.test(PW) && /"weeks":0,"startDate":""/.test(PW), '');
  /* L'exemple du prompt est du JSON valide et porte EXACTEMENT les champs du contrat (R2 : une seule forme). */
  {
    const ligne = (PW.split('\n').find(l => /^\{"name":"nom du programme"/.test(l)) || '');
    let ex = null; try { ex = JSON.parse(ligne); } catch (e) {}
    const CH = ['name', 'sets', 'reps', 'repsPerSet', 'specialSets', 'kg', 'kgPerSet', 'supersetGroup', 'setType', 'setTypePerSet', 'rest', 'restPerSet', 'note'];
    const e0 = ex && ex.days && ex.days[0] && ex.days[0].exercises && ex.days[0].exercises[0];
    t('IIF-W-N l\'exemple de structure est du JSON valide et porte exactement les champs du contrat',
      !!ex && eg(Object.keys(ex), ['name', 'weeks', 'startDate', 'days']) && !!e0 && eg(Object.keys(e0), CH), ligne.slice(0, 120));
  }

  /* ANTI-INVENTION, À LA SOURCE : la région « import de programme » ne contient aucun des défauts historiques de Code.js. */
  {
    const W = _sansCommentaires(fs.readFileSync(path.join(ROOT, 'worker.js'), 'utf8'));
    const i = W.indexOf('function _blocCatalogueProg('), j = W.indexOf('async function importDoc(');
    const reg = (i >= 0 && j > i) ? W.slice(i, j) : '';
    t('IIF-W-S0 CONTRÔLE — la région « import de programme » est localisable (catalogue → normaliseur)', reg.length > 1500, 'longueur ' + reg.length);
    t('IIF-W-S1 ⛔ aucun `|| 10` ni `|| 3` : une valeur absente reste absente, jamais inventée', !/\|\|\s*10\b/.test(reg) && !/\|\|\s*3\b/.test(reg), '');
    t('IIF-W-S2 ⛔ aucun `replace(/[^0-9]/g,\'\')` ni `parseInt(String(…` : « 8-10 » ne peut plus devenir 810',
      !/\[\^0-9\]/.test(reg) && !/parseInt\(\s*String\(/.test(reg), '');
    t('IIF-W-S3 ⛔ le type par série ne se devine pas (aucune liste « W », « E » acceptée)', !/\['D',\s*'W',\s*'E'\]/.test(reg) && !/\['W',\s*'E'/.test(reg), '');
  }

  /* L'HISTORIQUE N'A PAS BOUGÉ : ce lot ne touche que le programme. */
  {
    const H = String(lire(wctx, 'HIST_PROMPT') || '');
    t('IIF-W-D1 ⛔ le prompt d\'import d\'HISTORIQUE est strictement celui de ft-v1263 (empreinte SHA-256)',
      crypto.createHash('sha256').update(H).digest('hex') === EMPREINTE_HIST, 'longueur ' + H.length);
  }
};

/* ═══════════════════════════════════════════════ RÉEL ═══════════════════════════════════════════════ */
module.exports.reel = async function (t, ROOT, fs, path) {
  console.log('\n═══ IIF-W — LOT A : le Worker CONDUIT (réseau simulé, horloge figée, 0 appel réel) ═══');
  const run = (modele, opt) => importer(ROOT, fs, path, modele, opt);
  const ex = (r, i, j) => exo(r, i, j);

  /* ───────────── A. LE PROMPT RÉELLEMENT ENVOYÉ ───────────── */
  {
    const CAT = ['Squat à la Barre', 'Press Jambes 45°', 'Développé Couché Barre', 'Squat à la Barre', '  ', '', 'Curl Haltères'];
    const sans = await run(PROG([{ name: 'X', sets: 3, reps: 8 }]));
    const avec = await run(PROG([{ name: 'X', sets: 3, reps: 8 }]), { catalogue: CAT });
    const P = sans.instr, B = avec.catalogueBloc, PA = avec.instr;
    t('IIF-W-A1 le prompt envoyé contient `setTypePerSet`', /setTypePerSet/.test(P), 'longueur ' + P.length);
    t('IIF-W-A2 le prompt envoyé contient `restPerSet`', /restPerSet/.test(P), '');
    t('IIF-W-A3 règle des repos : recopier le texte « TEL QU\'ÉCRIT », rien calculer, plages comprises',
      /TEL QU'ÉCRIT/.test(P) && /NE RIEN CALCULER/.test(P) && /PLAGES/.test(P), '');
    t('IIF-W-A4 règle des plages de reps / de charge : la valeur telle que dans le document, en chaîne',
      /PLAGE de reps/.test(P) && /TELLE QUE DANS LE DOCUMENT/.test(P), '');
    t('IIF-W-A5 règle semaine A / semaine B : « J3A » et « J3B »', /J3A/.test(P) && /J3B/.test(P) && /Semaine A/.test(P), '');
    t('IIF-W-A6 le catalogue fourni → un bloc « LISTE DES EXERCICES » avec la règle « même matériel »',
      /^LISTE DES EXERCICES/.test(B) && /MANIFESTEMENT/.test(B) && /même matériel/.test(B) && /machine ≠ barre ≠ haltères ≠ poulie ≠ Smith/.test(B), B.slice(0, 120));
    t('IIF-W-A6 … la liste est dédoublonnée et nettoyée (4 noms retenus sur 7 entrées, doublon et vides écartés)',
      /\(4\) :/.test(B) && B.split('Squat à la Barre').length === 2 && /Curl Haltères/.test(B), B.slice(0, 160));
    t('IIF-W-A6 … et le bloc est un bloc de texte séparé, placé APRÈS le document et AVANT l\'instruction',
      (() => { const b = blocs(avec.ia[0]); const iC = b.findIndex(x => /^LISTE DES EXERCICES/.test(String(x.text || '')));
        return b.length === 3 && iC === 1 && b[0].type === 'text' && /DOCUMENT DE TEST/.test(b[0].text) && b[2].text === PA; })(), '');
    t('IIF-W-A7 SANS catalogue → aucun bloc catalogue, et la requête n\'a que deux blocs (document + instruction)',
      sans.catalogueBloc === '' && blocs(sans.ia[0]).length === 2, 'blocs : ' + blocs(sans.ia[0]).length);
    const inutiles = [[], null, 'texte', 42, [''], ['   ', null], [{ nom: 'x' }], { 0: 'a' }];
    const res = [];
    for (const c of inutiles) { const r = await run(PROG([{ name: 'X', sets: 3, reps: 8 }]), { catalogue: c }); res.push(r.catalogueBloc === '' && r.statut === 200 && !!(r.d.data)); }
    t('IIF-W-A7 … un catalogue inutilisable (vide, null, texte, nombre, que des blancs, objets) n\'ajoute rien et ne bloque rien',
      res.every(Boolean), J(res));
    t('IIF-W-A8 ⛔ ni `2026-03-23` ni `"weeks":7` dans le prompt réellement envoyé', !/2026-03-23/.test(PA) && !/"weeks"\s*:\s*7\b/.test(PA), '');
    t('IIF-W-A8 … l\'exemple porte `"weeks":0,"startDate":""`', /"weeks":0,"startDate":""/.test(PA), '');
    t('IIF-W-A9 sans catalogue, l\'instruction est la MÊME qu\'avec (le bloc est un ajout, pas une variante du prompt)', P === PA, '');

    // le plafond, les doublons, la troncature des noms longs
    const gros = []; for (let i = 0; i < 2500; i++) gros.push('Exercice numéro ' + String(i).padStart(4, '0') + ' ' + 'x'.repeat(10));
    gros.push('N'.repeat(300));
    const g = await run(PROG([{ name: 'X', sets: 3, reps: 8 }]), { catalogue: gros });
    const liste = (g.catalogueBloc.split('\n')[1] || '');
    const nb = Number((/\((\d+)\) :/.exec(g.catalogueBloc) || [, '-1'])[1]);
    t('IIF-W-A10 plafond : la LISTE ne dépasse pas ~12 000 caractères (et le nombre annoncé est le nombre réellement listé)',
      liste.length > 9000 && liste.length <= 12000 && nb === liste.split(' · ').length && !/numéro 2499/.test(liste), 'liste ' + liste.length + ' · annoncés ' + nb);
    const longs = await run(PROG([{ name: 'X', sets: 3, reps: 8 }]), { catalogue: ['N'.repeat(300), 'Court'] });
    const l1 = (longs.catalogueBloc.split('\n')[1] || '').split(' · ');
    t('IIF-W-A10 … un nom de plus de 80 caractères est tronqué à 80', l1[0] && l1[0].length === 80 && l1[1] === 'Court', J(l1.map(x => x.length)));
    const espaces = await run(PROG([{ name: 'X', sets: 3, reps: 8 }]), { catalogue: ['  Squat \n barre  ', 'Squat barre'] });
    t('IIF-W-A10 … les blancs sont normalisés (un saut de ligne ne casse pas la liste) et les doublons exacts disparaissent',
      /\(1\) :\nSquat barre\n/.test(espaces.catalogueBloc), espaces.catalogueBloc.slice(0, 80));
  }

  /* ───────────── B. NORMALISATION — plages, nombres, séries ───────────── */
  {
    const r = await run(PROG([
      { name: 'P0', sets: 4, reps: '8-10', kg: 100 },
      { name: 'P1', repsPerSet: ['12-15', '10-12', '8-10'], kg: '55-60' },
      { name: 'P2', sets: 3, reps: 10, kg: '87,5-90' },
      { name: 'P3', sets: 3, reps: '12 à 15', kg: '55 – 60 kg' },
      { name: 'P4', sets: 3, reps: 8, kg: 'à calibrer' },
      { name: 'P5', sets: 3, reps: 8, kg: '87,5' },
      { name: 'P6', sets: 3, reps: '8', kg: '20 kg' },
      { name: 'P7', sets: 3, reps: 8, kg: -20 },
      { name: 'P8', sets: 3, reps: 8, kgPerSet: [82.3, 82.2, '82,25'] },
      { name: 'P9', repsPerSet: [12, 'max', null, '8+10'], kg: 0 },
      { name: 'P10', sets: '3-4', reps: 8 },
      { name: 'P11', sets: 'plusieurs', reps: 8 },
      { name: 'P12', sets: 3, reps: 8.6 },
      { name: 'P13', sets: 3, reps: 1500 },
      { name: 'P14', sets: 3, reps: 8, kg: 'barre à vide' },
      { name: 'P15', sets: 3, reps: '8-10', kg: 60, note: 'Reps 8-10 | RIR 2' },
      { name: 'P16', sets: 3, reps: '8-10', kg: '55-60', note: 'Tempo 3-1-1' },
    ]));
    t('IIF-W-B1 reps « 8-10 » → 8 (JAMAIS 810) + « Reps 8-10 » dans la note', ex(r, 0).reps === 8 && ex(r, 0).note === 'Reps 8-10' && ex(r, 0).sets === 4 && ex(r, 0).kg === 100, J(ex(r, 0)));
    t('IIF-W-B1 … par série : [« 12-15 », « 10-12 », « 8-10 »] → [12,10,8], 3 séries, reps = la dernière',
      eg(ex(r, 1).repsPerSet, [12, 10, 8]) && ex(r, 1).sets === 3 && ex(r, 1).reps === 8, J(ex(r, 1)));
    t('IIF-W-B1 … et la note garde chaque plage, dans l\'ordre, puis la charge', ex(r, 1).note === 'Reps 12-15 / 10-12 / 8-10 | Charge 55-60 kg' && ex(r, 1).kg === 55, J(ex(r, 1).note));
    t('IIF-W-B2 charge « 87,5-90 » → 87.5 + « Charge 87,5-90 kg »', ex(r, 2).kg === 87.5 && ex(r, 2).note === 'Charge 87,5-90 kg', J(ex(r, 2)));
    t('IIF-W-B2 … « 12 à 15 » et « 55 – 60 kg » (écritures variées) → borne basse + la plage normalisée',
      ex(r, 3).reps === 12 && ex(r, 3).kg === 55 && ex(r, 3).note === 'Reps 12-15 | Charge 55-60 kg', J(ex(r, 3)));
    t('IIF-W-B3 charge « à calibrer » → kg 0 + « Charge : à calibrer »', ex(r, 4).kg === 0 && ex(r, 4).note === 'Charge : à calibrer', J(ex(r, 4)));
    t('IIF-W-B3 … « barre à vide » → kg 0 + « Charge : barre à vide »', ex(r, 14).kg === 0 && ex(r, 14).note === 'Charge : barre à vide', J(ex(r, 14)));
    t('IIF-W-B4 virgule décimale : « 87,5 » → 87.5 · « 20 kg » → 20 · reps « 8 » → 8, sans rien ajouter à la note',
      ex(r, 5).kg === 87.5 && ex(r, 5).note === '' && ex(r, 6).kg === 20 && ex(r, 6).reps === 8 && ex(r, 6).note === '', J([ex(r, 5), ex(r, 6)]));
    t('IIF-W-B4 … une charge négative n\'est ni gardée ni perdue : 0 + « Charge : -20 »', ex(r, 7).kg === 0 && /Charge : -20/.test(ex(r, 7).note), J(ex(r, 7)));
    t('IIF-W-B4 … arrondi au 0,5 : 82.3 → 82.5 · 82.2 → 82 · « 82,25 » → 82.5', eg(ex(r, 8).kgPerSet, [82.5, 82, 82.5]), J(ex(r, 8).kgPerSet));
    t('IIF-W-B5 reps non chiffrées (« max », vide, « 8+10 ») → 0, jamais un 10 inventé, et le texte reste dans la note',
      eg(ex(r, 9).repsPerSet, [12, 0, 0, 0]) && ex(r, 9).sets === 4 && ex(r, 9).reps === 0 && ex(r, 9).note === 'Reps : 12 / max / 8+10', J(ex(r, 9)));
    t('IIF-W-B6 séries « 3-4 » → 3 + « Séries 3-4 »', ex(r, 10).sets === 3 && ex(r, 10).note === 'Séries 3-4', J(ex(r, 10)));
    t('IIF-W-B6 … séries illisibles → 1 (comptées), jamais 3', ex(r, 11).sets === 1 && /Séries : plusieurs/.test(ex(r, 11).note), J(ex(r, 11)));
    t('IIF-W-B6 … reps 8.6 → 9 · reps 1500 (hors bornes) → 0 + « Reps : 1500 »', ex(r, 12).reps === 9 && ex(r, 13).reps === 0 && /Reps : 1500/.test(ex(r, 13).note), J([ex(r, 12).reps, ex(r, 13)]));
    t('IIF-W-B7 ⛔ la mention de plage n\'est pas écrite deux fois (note déjà porteuse de « Reps 8-10 »)',
      ex(r, 15).reps === 8 && ex(r, 15).note === 'Reps 8-10 | RIR 2', J(ex(r, 15).note));
    t('IIF-W-B7 … la note du modèle reste en tête, les mentions s\'ajoutent derrière avec « | »',
      ex(r, 16).note === 'Tempo 3-1-1 | Reps 8-10 | Charge 55-60 kg', J(ex(r, 16).note));
    const n = norm(r);
    t('IIF-W-B8 compteurs : 1 plage de reps en P0 + 3 en P1 + 1 en P3 + 2 en P15/P16 = 7 · charges en plage 3 (P1, P2, P3) + P16 = 4',
      n.plagesReps === 7 && n.plagesCharge === 4, J(n));
    t('IIF-W-B8 … non chiffrées : charges 3 (à calibrer, -20, barre à vide) · reps 3 (max, 8+10, 1500)', n.chargesNonChiffrees === 3 && n.repsNonChiffrees === 3, J(n));
    t('IIF-W-B8 ⛔ la normalisation ne contient QUE des compteurs entiers, aucun texte du document',
      Object.keys(n).length >= 9 && Object.keys(n).every(k => Number.isInteger(n[k]) && n[k] >= 0) && !/calibrer|barre|plusieurs/i.test(J(n)), J(n));
    t('IIF-W-B8 … servie à UNE seule place, `data.normalisation` (pas de doublon à la racine de la réponse)', r.d.normalisation === undefined && Object.keys(n).length >= 9, J(r.d.normalisation));
  }

  /* ───────────── B. séries : jamais de nombre inventé ───────────── */
  {
    const r = await run(PROG([
      { name: 'S0' },
      { name: 'S1', sets: 5, repsPerSet: [8, 8, 8] },
      { name: 'S2', sets: 4, reps: 8 },
      { name: 'S3', repsPerSet: [5, 3, 2, 1], kgPerSet: [50, 65], kg: 40 },
      { name: 'S4', repsPerSet: [5, 3], kgPerSet: [50, 65, 80, 85] },
      { name: 'S5', sets: '4', reps: '12' },
      { name: 'S6', sets: 0, reps: 0, repsPerSet: [], kgPerSet: [] },
      { name: 'S7', sets: 3, reps: null, kg: null },
    ]));
    t('IIF-W-B9 ⛔ aucune série ni répétition dans le document → 1 série, 0 rep, 0 kg (ni 3, ni 10 inventés)',
      ex(r, 0).sets === 1 && ex(r, 0).reps === 0 && ex(r, 0).kg === 0 && eg(ex(r, 0).repsPerSet, []) && ex(r, 0).note === '', J(ex(r, 0)));
    t('IIF-W-B9 … et c\'est compté (S0 et S6) : setsInconnus = 2', norm(r).setsInconnus === 2, J(norm(r)));
    t('IIF-W-B9 … un 0 explicite de série est « inconnu », pas « zéro série » — et il ne laisse aucune note parasite', ex(r, 6).sets === 1 && ex(r, 6).reps === 0 && ex(r, 6).note === '', J(ex(r, 6)));
    t('IIF-W-B10 le nombre de séries = la longueur de repsPerSet quand elle existe', ex(r, 1).sets === 3 && eg(ex(r, 1).repsPerSet, [8, 8, 8]), J(ex(r, 1)));
    t('IIF-W-B10 … sinon le nombre écrit (sets 4 × reps 8 → 4 × 8, repsPerSet vide) ; « 4 » et « 12 » en chaînes sont lus',
      ex(r, 2).sets === 4 && ex(r, 2).reps === 8 && eg(ex(r, 2).repsPerSet, []) && ex(r, 5).sets === 4 && ex(r, 5).reps === 12, J([ex(r, 2), ex(r, 5)]));
    t('IIF-W-B11 kgPerSet plus COURT que les séries → complété par `kg` (comme le client)', eg(ex(r, 3).kgPerSet, [50, 65, 40, 40]), J(ex(r, 3).kgPerSet));
    t('IIF-W-B11 … plus LONG → ramené au nombre de séries, et c\'est compté', eg(ex(r, 4).kgPerSet, [50, 65]) && norm(r).tableauxRealignes >= 2, J([ex(r, 4).kgPerSet, norm(r)]));
    t('IIF-W-B12 reps nulles / absentes → 0 (jamais 10), kg null → 0', ex(r, 7).reps === 0 && ex(r, 7).kg === 0 && ex(r, 7).sets === 3, J(ex(r, 7)));
  }

  /* ───────────── B. valeurs vides ou de mauvais type : jamais inventées, jamais un plantage ───────────── */
  {
    const r = await run(PROG([
      { name: 'V0', sets: 3, reps: '', kg: '   ', rest: '  ', note: '' },
      { name: 'V1', sets: 3, reps: true, kg: { a: 1 } },
      { name: 'V2', sets: 3, reps: 8, note: 42 },
      { name: 'V3', sets: 3, reps: 8, note: { a: 1 } },
      { name: 123, sets: 3, reps: 8 },
      { name: 'V5', sets: 3, reps: [8], kg: [50], repsPerSet: [true, {}, [1], ''] },
      { name: 'V6', sets: 3, reps: '8 reps', kg: '+10' },
    ]));
    t('IIF-W-B38 une chaîne vide ou faite de blancs est une valeur ABSENTE : 0, ni note ni compteur',
      ex(r, 0).reps === 0 && ex(r, 0).kg === 0 && ex(r, 0).rest === '' && ex(r, 0).note === '' && norm(r).repsNonChiffrees === 0 && norm(r).chargesNonChiffrees === 0, J([ex(r, 0), norm(r)]));
    t('IIF-W-B38 … un booléen, un objet, un tableau à la place d\'un nombre : 0 (jamais un plantage, jamais un nombre inventé)',
      ex(r, 1).reps === 0 && ex(r, 1).kg === 0 && ex(r, 1).sets === 3 && ex(r, 5).reps === 0 && ex(r, 5).kg === 0 && eg(ex(r, 5).repsPerSet, [0, 0, 0, 0]), J([ex(r, 1), ex(r, 5)]));
    t('IIF-W-B38 … une note numérique est gardée en texte, une note objet est ignorée', ex(r, 2).note === '42' && ex(r, 3).note === '', J([ex(r, 2).note, ex(r, 3).note]));
    t('IIF-W-B38 … un nom numérique devient du texte', ex(r, 4).name === '123', J(ex(r, 4).name));
    t('IIF-W-B38 … « 8 reps » et « +10 » (charge ajoutée) sont lus comme des nombres, sans note', ex(r, 6).reps === 8 && ex(r, 6).kg === 10 && ex(r, 6).note === '', J(ex(r, 6)));
  }

  /* ───────────── B. types de série ───────────── */
  {
    const r = await run(PROG([
      { name: 'T0', repsPerSet: [5, 3, 2, 1, 3], setTypePerSet: ['W', 'w', 'ECH', '', 'E'] },
      { name: 'T1', sets: 4, repsPerSet: [5, 3, 2, 1], setTypePerSet: ['W', 'W'] },
      { name: 'T2', repsPerSet: [8, 8, 8], setTypePerSet: ['', '', ''] },
      { name: 'T3', sets: 3, reps: 8, setType: 'W' },
      { name: 'T4', sets: 3, reps: 8, setType: 'E' },
      { name: 'T5', sets: 3, reps: 8, setType: 'D' },
      { name: 'T6', sets: 3, reps: 8, setType: 'd' },
      { name: 'T7', sets: 3, reps: 8, setType: 'X' },
      { name: 'T8', repsPerSet: [5, 3, 2, 1, 3, 3, 3], setTypePerSet: ['W', 'W', 'W', 'W', '', '', ''], kgPerSet: [50, 65, 80, 85, 90, 90, 90] },
      { name: 'T9', sets: 3, reps: 8, setTypePerSet: 'W' },
      { name: 'T10', repsPerSet: [8, 8], setTypePerSet: [' w ', 'Warm-up'] },
    ]));
    t('IIF-W-B13 setTypePerSet : seul « W » / « w » donne « W » (ECH, E et le reste → « »)', eg(ex(r, 0).setTypePerSet, ['W', 'W', '', '', '']), J(ex(r, 0).setTypePerSet));
    t('IIF-W-B13 … blancs ignorés (« w » entouré d\'espaces → W) ; « Warm-up » n\'est PAS reconnu', eg(ex(r, 10).setTypePerSet, ['W', '']), J(ex(r, 10).setTypePerSet));
    t('IIF-W-B14 setTypePerSet mal dimensionné (2 pour 4 séries) → [] — jamais deviné — et compté', eg(ex(r, 1).setTypePerSet, []) && norm(r).tableauxRealignes >= 1, J([ex(r, 1).setTypePerSet, norm(r)]));
    t('IIF-W-B14 … sans aucun « W », le tableau n\'a pas d\'information : []', eg(ex(r, 2).setTypePerSet, []), J(ex(r, 2).setTypePerSet));
    t('IIF-W-B14 … un tableau bien formé est rendu tel quel (le cas du développé couché de Michel : 4 W + 3 travail)',
      eg(ex(r, 8).setTypePerSet, ['W', 'W', 'W', 'W', '', '', '']) && ex(r, 8).sets === 7 && eg(ex(r, 8).kgPerSet, [50, 65, 80, 85, 90, 90, 90]), J(ex(r, 8)));
    t('IIF-W-B14 … ce qui n\'est pas un tableau → []', eg(ex(r, 9).setTypePerSet, []), J(ex(r, 9).setTypePerSet));
    t('IIF-W-B15 setType : « W » → « » · « E » → « » · « X » → « » (le prompt les interdit, le Worker les refuse)',
      ex(r, 3).setType === '' && ex(r, 4).setType === '' && ex(r, 7).setType === '', J([ex(r, 3).setType, ex(r, 4).setType, ex(r, 7).setType]));
    t('IIF-W-B15 … « D » et « d » sont gardés (le dropset structuré)', ex(r, 5).setType === 'D' && ex(r, 6).setType === 'D', J([ex(r, 5).setType, ex(r, 6).setType]));
    t('IIF-W-B15 … les types refusés sont comptés (T0 : ECH, E · T3 W · T4 E · T7 X · T10 Warm-up = 6)', norm(r).typesInvalides === 6, J(norm(r)));
  }

  /* ───────────── B. repos : recopiés tels qu'écrits ───────────── */
  {
    const TELS = ['3-4 min', '60-90 s', '3 mins', '1.30 mins', 'repos 40 sec', '2 à 3 mins', '90-120 s', '2.30 mins', '1min30', 'selon ressenti'];
    const exs = TELS.map((s, i) => ({ name: 'R' + i, sets: 3, reps: 8, rest: s }));
    exs.push({ name: 'R-num', sets: 3, reps: 8, rest: 120 });
    exs.push({ name: 'R-court', sets: 4, repsPerSet: [8, 8, 8, 8], restPerSet: ['60-90 s', '60-90 s'] });
    exs.push({ name: 'R-long', sets: 3, repsPerSet: [8, 8, 8], restPerSet: ['1', '2', '3', '4', '5'] });
    exs.push({ name: 'R-blancs', sets: 3, reps: 8, rest: '  3   mins  ' });
    exs.push({ name: 'R-40', sets: 3, reps: 8, rest: 'x'.repeat(60) });
    exs.push({ name: 'R-vides', sets: 3, repsPerSet: [8, 8, 8], restPerSet: ['', '', ''] });
    exs.push({ name: 'R-null', sets: 3, reps: 8, rest: null });
    exs.push({ name: 'R-obj', sets: 3, reps: 8, rest: { a: 1 }, restPerSet: 'texte' });
    exs.push({ name: 'R-var', sets: 3, repsPerSet: [8, 8, 8], restPerSet: ['2 min', '2 min', '3 mins'], rest: '' });
    exs.push({ name: 'R-bool', sets: 3, reps: 8, rest: true });
    const r = await run(PROG(exs));
    const lus = TELS.map((s, i) => ex(r, i).rest);
    t('IIF-W-B16 ⛔ repos « 3-4 min », « 60-90 s », « 3 mins », « 1.30 mins »… préservés TELS QUELS (aucune conversion, aucune plage perdue)',
      eg(lus, TELS), J(lus));
    const k = TELS.length;
    t('IIF-W-B16 … un repos numérique (120) devient la chaîne « 120 »', ex(r, k).rest === '120', J(ex(r, k).rest));
    t('IIF-W-B17 restPerSet plus COURT que les séries → complété par « » (4 séries : 2 écrites + 2 vides)', eg(ex(r, k + 1).restPerSet, ['60-90 s', '60-90 s', '', '']), J(ex(r, k + 1).restPerSet));
    t('IIF-W-B17 … plus LONG → ramené au nombre de séries', eg(ex(r, k + 2).restPerSet, ['1', '2', '3']), J(ex(r, k + 2).restPerSet));
    t('IIF-W-B17 … les deux réalignements sont comptés', norm(r).tableauxRealignes >= 2, J(norm(r)));
    t('IIF-W-B18 espaces normalisés (« 3   mins » → « 3 mins »)', ex(r, k + 3).rest === '3 mins', J(ex(r, k + 3).rest));
    t('IIF-W-B18 … 40 caractères au plus', ex(r, k + 4).rest.length === 40, J(ex(r, k + 4).rest.length));
    t('IIF-W-B18 … un restPerSet sans aucune valeur → [] ; rien, null, objet, booléen → « » (jamais inventé)',
      eg(ex(r, k + 5).restPerSet, []) && ex(r, k + 6).rest === '' && ex(r, k + 7).rest === '' && eg(ex(r, k + 7).restPerSet, []) && ex(r, k + 9).rest === '', J([ex(r, k + 5), ex(r, k + 6), ex(r, k + 7), ex(r, k + 9)]));
    t('IIF-W-B18 … repos variables par série : conservés, avec rest = « »', eg(ex(r, k + 8).restPerSet, ['2 min', '2 min', '3 mins']) && ex(r, k + 8).rest === '', J(ex(r, k + 8)));
  }

  /* ───────────── B. séances, noms, ordre ───────────── */
  {
    const r = await run({ name: '  Mon   programme  ', weeks: '4', startDate: '', days: [
      { label: 'J3A - Haut du corps - Semaine A', exercises: [{ name: 'Développé couché', sets: 3, reps: 8 }, { name: 'Tractions', sets: 3, reps: 6 }, { name: 'Développé couché', sets: 3, reps: 8 }] },
      { label: 'Jour vide', exercises: [] },
      { label: 'J3B - Haut du corps - Semaine B (facultative)', exercises: [{ name: '', sets: 2, reps: 12 }, { sets: 2, reps: 12 }, { name: '   ', sets: 1 }, null, 42, 'Gainage', { name: 'Z' + ' longue'.repeat(60), sets: 1, reps: 1 }] },
      { label: 'Sans exercices du tout' },
      { label: 'Autre', exercises: [null] },
    ] });
    const d = r.d.data || {};
    t('IIF-W-B19 jours sans exercice écartés (3 sur 5, dont celui qui n\'avait que du vide), les autres dans leur ordre',
      (d.days || []).length === 2 && d.days[0].label === 'J3A - Haut du corps - Semaine A' && /Semaine B \(facultative\)$/.test(d.days[1].label) && norm(r).joursEcartes === 3, J((d.days || []).map(x => x.label)) + J(norm(r)));
    t('IIF-W-B20 les libellés A / B et « (facultative) » passent tels quels', !!d.days && /^J3A - /.test(d.days[0].label) && /^J3B - /.test(d.days[1].label), '');
    t('IIF-W-B21 ordre conservé et AUCUNE déduplication (« Développé couché » ×2 reste ×2)',
      eg((d.days[0].exercises || []).map(e => e.name), ['Développé couché', 'Tractions', 'Développé couché']), J((d.days || [{ exercises: [] }])[0].exercises.map(e => e.name)));
    const noms = ((d.days || [])[1] || { exercises: [] }).exercises.map(e => e.name);
    t('IIF-W-B22 un exercice SANS NOM n\'est pas jeté : « (exercice sans nom) » (vide, absent, blancs), compté',
      noms.slice(0, 3).every(x => x === '(exercice sans nom)') && norm(r).exercicesSansNom === 3, J(noms) + J(norm(r)));
    t('IIF-W-B22 … une chaîne seule devient un exercice de ce nom ; null et nombre sont écartés et comptés', noms[3] === 'Gainage' && noms.length === 5 && norm(r).exercicesIllisibles === 3, J(noms.map(x => x.slice(0, 20))) + J(norm(r)));
    t('IIF-W-B22 … nom limité à 160 caractères', (noms[4] || '').length === 160, String((noms[4] || '').length));
    t('IIF-W-B23 nom du programme nettoyé (blancs) ; durée « 4 » (chaîne) → 4', d.name === 'Mon programme' && d.weeks === 4, J([d.name, d.weeks]));
    const ws = [];
    for (const v of [7, 104, 0, 105, -1, 7.5, 'quatre', null, '12', {}]) {
      const rr = await run(PROG([{ name: 'X', sets: 1, reps: 1 }], { weeks: v }));
      ws.push((rr.d.data || {}).weeks);
    }
    t('IIF-W-B23 durée : 7 → 7 · 104 → 104 · 0 → 0 · 105, -1, 7.5, « quatre », null, objet → 0 · « 12 » → 12', eg(ws, [7, 104, 0, 0, 0, 0, 0, 0, 12, 0]), J(ws));
    const sg = await run(PROG([
      { name: 'a', sets: 1, reps: 1, supersetGroup: 'a1' }, { name: 'b', sets: 1, reps: 1, supersetGroup: 'bc' }, { name: 'c', sets: 1, reps: 1, supersetGroup: 'xyz' },
      { name: 'd', sets: 1, reps: 1, supersetGroup: '' }, { name: 'e', sets: 1, reps: 1, supersetGroup: 7 }, { name: 'f', sets: 1, reps: 1, supersetGroup: null }, { name: 'g', sets: 1, reps: 1, supersetGroup: '12' },
    ]));
    t('IIF-W-B24 supersetGroup : lettres A-Z, 2 au plus (« a1 » → A · « bc » → BC · « xyz » → XY · 7, null, « 12 » → « »)',
      eg([0, 1, 2, 3, 4, 5, 6].map(i => ex(sg, i).supersetGroup), ['A', 'BC', 'XY', '', '', '', '']), J([0, 1, 2, 3, 4, 5, 6].map(i => ex(sg, i).supersetGroup)));
    const ss = await run(PROG([{ name: 's', repsPerSet: [8, 8, 8], specialSets: [0, '2', 7, -1, 'x', 1.5, 2, null] }]));
    t('IIF-W-B25 specialSets : seuls les indices entiers de 0 à (séries - 1) restent, sans doublon', eg(ex(ss, 0).specialSets, [0, 2]), J(ex(ss, 0).specialSets));
    const nl = await run(PROG([{ name: 'n', sets: 3, reps: '8-10', note: 'Y'.repeat(3000) }]));
    t('IIF-W-B26 note ≤ 1 500 caractères — et la mention de plage survit à la coupe',
      ex(nl, 0).note.length <= 1500 && /Reps 8-10$/.test(ex(nl, 0).note) && ex(nl, 0).reps === 8, String(ex(nl, 0).note.length));
    const lb = await run(PROG([{ name: 'n', sets: 3, reps: 8, note: 'Pause 2 s en bas' }]));
    t('IIF-W-B27 la note du modèle est conservée telle quelle quand il n\'y a rien à ajouter', ex(lb, 0).note === 'Pause 2 s en bas', J(ex(lb, 0).note));
    const ch = await run(PROG([{ name: 'Presse', sets: 3, reps: 10 }], { name: 'x'.repeat(300) }));
    t('IIF-W-B28 nom du programme ≤ 120 caractères', ((ch.d.data || {}).name || '').length === 120, String(((ch.d.data || {}).name || '').length));
  }

  /* ───────────── B. la date de début : jamais inventée, refusée si périmée ───────────── */
  {
    const sd = async (startDate, weeks, maintenant) => {
      const r = await run(PROG([{ name: 'X', sets: 1, reps: 1 }], { startDate, weeks }), { maintenant });
      return { sd: (r.d.data || {}).startDate, refus: norm(r).startDateRefusee };
    };
    const a = await sd('2026-03-23', 7);
    t('IIF-W-B29 ⭐ le cas de Michel : « 2026-03-23 » sur 7 semaines (fini le 10 mai) est refusé → « » (et compté)', a.sd === '' && a.refus === 1, J(a));
    t('IIF-W-B29 … un bloc en cours (commencé le 19 octobre, 4 semaines, fini le 15 novembre) GARDE sa date', (await sd('2026-10-19', 4)).sd === '2026-10-19', '');
    t('IIF-W-B29 … une date future est gardée', (await sd('2026-12-01', 8)).sd === '2026-12-01', '');
    t('IIF-W-B30 frontière : un cycle fini HIER (1er novembre) est refusé', (await sd('2026-10-05', 4)).sd === '', '');
    t('IIF-W-B30 … un cycle qui finit AUJOURD\'HUI (2 novembre) est gardé', (await sd('2026-10-06', 4)).sd === '2026-10-06', '');
    t('IIF-W-B30 … « aujourd\'hui » est le jour de PARIS : à 23 h 30 UTC le 1er novembre il est déjà le 2 à Paris, le cycle fini le 1er est refusé',
      (await sd('2026-10-05', 4, Date.UTC(2026, 10, 1, 23, 30, 0))).sd === '', '');
    t('IIF-W-B31 sans durée (0), on ne peut pas juger : la date valide est gardée', (await sd('2026-03-23', 0)).sd === '2026-03-23', '');
    const inv = [];
    for (const v of ['2026-13-45', '2026-02-30', '2026-00-10', 'pas une date', '23/03/2026', '2026-3-5', '2026-11-02T00:00:00Z', null, 12345, {}]) inv.push((await sd(v, 0)).sd);
    t('IIF-W-B31 une date invalide (mois 13, 30 février, jour/mois/année, texte, nombre, objet) → « » : jamais devinée', inv.every(x => x === ''), J(inv));
    const hb = [];
    for (const v of ['1999-12-31', '2101-01-01', '2000-01-01', '2100-12-31']) hb.push((await sd(v, 0)).sd);
    t('IIF-W-B31 année hors 2000..2100 → « » ; 2000 et 2100 acceptées', eg(hb, ['', '', '2000-01-01', '2100-12-31']), J(hb));
    t('IIF-W-B31 … des blancs autour d\'une date valide sont tolérés', (await sd('  2026-12-01 ', 8)).sd === '2026-12-01', '');
    const sans = await sd('', 0);
    t('IIF-W-B32 aucune date écrite → « » et rien de compté', sans.sd === '' && sans.refus === 0, J(sans));
  }

  /* ───────────── B. erreurs : jamais un programme partiel ───────────── */
  {
    const OK = PROG([{ name: 'X', sets: 3, reps: 8 }]);
    const tr = await run('{"name":"Gros programme","weeks":0,"startDate":"","days":[{"label":"J1","exercises":[{"name":"Squat","sets":4,"reps":8},{"name":"Pres', { stop: 'max_tokens', horsCorpus: true });
    t('IIF-W-B33 ⭐ réponse tronquée (stop_reason « max_tokens ») → erreur EXPLICITE, pas « JSON invalide »', tr.d.status === 'error' && tr.d.error === MSG_TRONQUE && !tr.d.data, J(tr.d).slice(0, 160));
    const trOk = await run(OK, { stop: 'max_tokens', horsCorpus: true });
    t('IIF-W-B33 ⛔ … même si le texte coupé se trouve être du JSON complet : jamais un programme partiel en silence', trOk.d.status === 'error' && trOk.d.error === MSG_TRONQUE && !trOk.d.data, J(trOk.d).slice(0, 160));
    const inv = await run('{"name":"x","days":[{"label":"J1","exercises":[{"name":"S"}', { horsCorpus: true });
    t('IIF-W-B34 JSON invalide (arrêt normal) → erreur, aucune donnée', inv.d.status === 'error' && /JSON invalide/.test(inv.d.error || '') && !inv.d.data, J(inv.d).slice(0, 120));
    const sansStop = await run('{"name":"x","days":[{"label":"J1","exercises":[{"name":"S","sets":4,"reps":8},{"na', { stop: null, horsCorpus: true });
    t('IIF-W-B34 … et sans raison d\'arrêt transmise, un JSON coupé reste une erreur (jamais un programme partiel)', sansStop.d.status === 'error' && !sansStop.d.data, J(sansStop.d).slice(0, 120));
    const sansAcc = await run('Voici ton programme : aucun JSON ici.', { horsCorpus: true });
    t('IIF-W-B34 … du texte sans JSON → erreur « Extraction échouée »', sansAcc.d.status === 'error' && /Extraction échouée/.test(sansAcc.d.error || ''), J(sansAcc.d).slice(0, 120));
    const ids = [];
    for (const m of [{ name: 'x' }, { name: 'x', days: [] }, { name: 'x', days: 'oui' }, { name: 'x', days: [{ label: 'a', exercises: [] }, { label: 'b' }] }, { name: 'x', days: [null, 3] }]) {
      const rr = await run(m, { horsCorpus: true }); ids.push(rr.d.status === 'error' && rr.d.error === MSG_VIDE && !rr.d.data);
    }
    t('IIF-W-B35 `days` absent, vide, mal formé, ou ne contenant que des jours sans exercice → « ' + MSG_VIDE + ' »', ids.every(Boolean), J(ids));
    const fence = await run('```json\n' + J(OK) + '\n```');
    t('IIF-W-B36 le JSON entouré de balises markdown est toujours lu', fence.d.status === 'ok' && ex(fence, 0).name === 'X', J(fence.d).slice(0, 100));
    const guill = await run(J(PROG([{ name: 'Curl', sets: 3, reps: 10, note: 'Contrôle la phase “négative” sur 3 s' }])));
    t('IIF-W-B36 ⭐ des guillemets typographiques “ ” dans une note n\'empêchent plus l\'import', guill.d.status === 'ok' && /“négative”/.test(ex(guill, 0).note), J(guill.d).slice(0, 140));
  }

  /* ───────────── B. une sortie de modèle HOSTILE ne casse jamais le Worker ───────────── */
  {
    // Générateur pseudo-aléatoire à graine FIXE : déterministe, donc rejouable ; les types sont mélangés exprès.
    let graine = 20261102; const alea = () => { graine = (graine * 1664525 + 1013904223) >>> 0; return graine / 4294967296; };
    const pick = (a) => a[Math.floor(alea() * a.length)];
    const POOL = [0, 1, 3, 8, 8.5, 12, 99, 100, 999, 1000, 1500, -1, -20, 82.25, 0.5, 1e9, '', ' ', '8', '8-10', '12 à 15', '87,5', '87,5-90', '55 – 60 kg',
      '20 kg', 'à calibrer', 'max', '8+10', 'x'.repeat(200), '3 mins', '1.30 mins', '3-4 min', true, false, null, [], [1, 2], ['8-10', 5], {}, { a: 1 },
      'W', 'w', 'ECH', 'D', 'E', 'a1', 'ZZZ', '2026-03-23', '2026-13-45', '<script>', '\u0000x'];
    const CHAMPS = ['name', 'sets', 'reps', 'repsPerSet', 'specialSets', 'kg', 'kgPerSet', 'supersetGroup', 'setType', 'setTypePerSet', 'rest', 'restPerSet', 'note'];
    const tab = () => Array.from({ length: Math.floor(alea() * 7) }, () => pick(POOL));
    const exoAlea = () => {
      if (alea() < 0.12) return pick(POOL);
      const e = {}; CHAMPS.forEach((c) => { if (alea() < 0.6) e[c] = (/PerSet|specialSets/.test(c) && alea() < 0.7) ? tab() : pick(POOL); }); return e;
    };
    const progAlea = () => ({ name: pick(POOL), weeks: pick(POOL), startDate: pick(POOL),
      days: alea() < 0.1 ? pick(POOL) : Array.from({ length: Math.floor(alea() * 4) }, () => ({ label: pick(POOL), exercises: alea() < 0.1 ? pick(POOL) : Array.from({ length: Math.floor(alea() * 5) }, exoAlea) })) });
    const echecs = []; let nOk = 0, nErr = 0;
    for (let i = 0; i < 400; i++) {
      const p = progAlea(); const rr = await run(p, { horsCorpus: true });
      if (rr.statut !== 200) { echecs.push(i + ' statut ' + rr.statut); continue; }
      if (rr.d.status === 'error') { nErr++; if (rr.d.error !== MSG_VIDE) echecs.push(i + ' erreur « ' + String(rr.d.error).slice(0, 60) + ' » ' + J(p).slice(0, 80)); continue; }
      nOk++; const v = violations(rr.d); if (v.length) echecs.push(i + ' contrat : ' + v.slice(0, 2).join(' ; ') + ' ← ' + J(p).slice(0, 100));
    }
    t('IIF-W-B39 ⭐ 400 réponses de modèle HOSTILES (types mélangés, valeurs absurdes) : jamais d\'exception, jamais de contrat violé (' + nOk + ' programmes, ' + nErr + ' « aucun exercice »)',
      echecs.length === 0 && nOk >= 150 && nErr >= 20, echecs.slice(0, 3).join(' | ') + ' [ok ' + nOk + ' · err ' + nErr + ']');
  }

  /* ───────────── le CONTRAT sur toutes les sorties ───────────── */
  {
    const tous = SORTIES.map(violations);
    const mauvais = tous.map((v, i) => v.length ? { i, v: v.slice(0, 3) } : null).filter(Boolean);
    t('IIF-W-B37 ⭐ le contrat de sortie (champs, types, bornes, tableaux de la longueur des séries) tient sur CHAQUE programme rendu (' + SORTIES.length + ')',
      SORTIES.length >= 8 && mauvais.length === 0, J(mauvais.slice(0, 3)));
  }

  /* ───────────── D. NON-RÉGRESSION ───────────── */
  {
    const H = {
      sessions: [
        { date: '23/04/26', estimatedDate: false, label: 'Séance 1', exercises: [{ name: 'Squat', sets: [{ kg: '80', reps: '8', type: 'W', note: 'a' }, { kg: 82.3, reps: 8, type: 'D' }, { kg: 0, reps: 0, type: '' }], note: 'n' }] },
        { date: '', label: 'vide', exercises: [] },
      ],
    };
    const h = await run(H, { corps: { action: 'importHistory' } });
    const s0 = ((h.d.data || {}).sessions || [])[0] || {};
    const sets = ((s0.exercises || [])[0] || {}).sets || [];
    t('IIF-W-D2 importHistory : la normalisation est celle d\'avant (date 23/04/26 → 2026-04-23, type W → « » compté, 82.3 → 82.5, série à 0 rep retirée, séance vide retirée)',
      h.d.status === 'ok' && (h.d.data.sessions || []).length === 1 && s0.date === '2026-04-23' && sets.length === 2 && sets[0].type === '' && sets[0].kg === 80 && sets[1].type === 'D' && sets[1].kg === 82.5 && h.d.data.typesNormalises === 1, J(h.d).slice(0, 200));
    t('IIF-W-D2 … et sa réponse ne porte AUCUNE normalisation de programme (`normalisation` absente à la racine comme dans data)', h.d.normalisation === undefined && (h.d.data || {}).normalisation === undefined, J(Object.keys(h.d)));
    const hp = h.ia[0] || {};
    t('IIF-W-D3 importHistory : modèle Sonnet, max_tokens 8192 (inchangés), et son prompt est celui d\'origine', hp.model === 'claude-sonnet-4-6' && hp.max_tokens === 8192 && crypto.createHash('sha256').update(lastText(hp)).digest('hex') === EMPREINTE_HIST, J([hp.model, hp.max_tokens]));
    const hcat = await run(H, { corps: { action: 'importHistory' }, catalogue: ['Squat'] });
    t('IIF-W-D3 … l\'historique ne reçoit PAS le catalogue (ce lot ne concerne que le programme)', hcat.catalogueBloc === '' && blocs(hcat.ia[0]).length === 2, '');
    const prog = await run(PROG([{ name: 'X', sets: 3, reps: 8 }]));
    const pp = prog.ia[0] || {};
    t('IIF-W-D4 importProgram : max_tokens 16000 (plafond, pas une cible)', pp.max_tokens === 16000, String(pp.max_tokens));
    const img = (n) => Array.from({ length: n }, (_, i) => ({ type: 'image/jpeg', data: 'AAAA', name: 'p' + i + '.jpg' }));
    const mod = async (images) => ((await run(PROG([{ name: 'X', sets: 3, reps: 8 }]), { corps: { images }, horsCorpus: true })).ia[0] || {}).model;
    t('IIF-W-D5 modèle : 1 image → Haiku', await mod(img(1)) === 'claude-haiku-4-5-20251001', '');
    t('IIF-W-D5 … 2 images → Sonnet · un texte → Sonnet · un PDF → Sonnet',
      await mod(img(2)) === 'claude-sonnet-4-6' && await mod([{ type: 'text/plain', isText: true, data: 'x', name: 'a.txt' }]) === 'claude-sonnet-4-6' && await mod([{ type: 'application/pdf', data: 'JVBERi0=', name: 'a.pdf' }]) === 'claude-sonnet-4-6', '');
    const co = await run('x', { corps: { action: 'coach', message: 'Salut', context: 'ctx', history: [], images: undefined }, anthropic: () => repAnthropic('Réponse de Milo.') });
    t('IIF-W-D6 une AUTRE action IA (coach) n\'est pas affectée : une réponse, un seul appel, max_tokens 1024',
      co.statut === 200 && /Réponse de Milo/.test(String(co.d.reply || '')) && co.ia.length === 1 && co.ia[0].max_tokens === 1024, J(co.d).slice(0, 120));
    const refus = await run(PROG([{ name: 'X', sets: 3, reps: 8 }]), { pont: () => rep({ status: 'error', error: 'token', raison: 'revoque' }), horsCorpus: true });
    const panne = await run(PROG([{ name: 'X', sets: 3, reps: 8 }]), { pont: () => { throw new Error('ECONNRESET'); }, horsCorpus: true });
    t('IIF-W-D7 ⛔ l\'identité S1 garde la porte : jeton refusé → 401, panne du pont → 503, et AUCUN appel IA dans les deux cas',
      refus.statut === 401 && refus.ia.length === 0 && panne.statut === 503 && panne.ia.length === 0, J([refus.statut, refus.ia.length, panne.statut, panne.ia.length]));
    const rel = await run('x', { corps: { action: 'loadProfile', email: 'quelquun@test' }, relais: '{"status":"ok","relais":true}', horsCorpus: true });
    t('IIF-W-D8 le relais attrape-tout vers Apps Script est intact (action inconnue → relayée telle quelle, réponse rendue)',
      rel.statut === 200 && rel.d.relais === true && rel.ia.length === 0 && rel.appels.some(a => /script\.google\.com/.test(a.url) && /loadProfile/.test(a.brut)), J(rel.d));
    const e529 = await run('x', { anthropic: () => ({ ok: false, status: 529, async json() { return { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }; }, async text() { return ''; } }), horsCorpus: true });
    t('IIF-W-D9 l\'API Anthropic en erreur (529) → une erreur propre, pas de plantage ni de programme', e529.d.status === 'error' && !e529.d.data, J(e529.d).slice(0, 120));
    const sc = await run(PROG([{ name: 'X', sets: 3, reps: 8 }]), { sansCle: true, horsCorpus: true });
    t('IIF-W-D9 … clé API absente → le message d\'avant', sc.d.status === 'error' && /Clé API absente/.test(sc.d.error || ''), J(sc.d).slice(0, 100));
    const sf = await run(PROG([{ name: 'X', sets: 3, reps: 8 }]), { corps: { images: [] }, horsCorpus: true });
    t('IIF-W-D9 … aucun fichier → « Aucun fichier reçu »', sf.d.status === 'error' && sf.d.error === 'Aucun fichier reçu', J(sf.d));
    const lie = await run(PROG([{ name: 'X', sets: 3, reps: 8 }]));
    const L = String(lire(lireWorker(ROOT, fs, path), 'PROG_PROMPT') || '');
    t('IIF-W-D10 l\'instruction réellement envoyée EST `PROG_PROMPT` (le prompt testé pour la parité est celui qui part)', L.length > 2000 && lie.instr === L, 'envoyée ' + lie.instr.length + ' · constante ' + L.length);
  }
};
