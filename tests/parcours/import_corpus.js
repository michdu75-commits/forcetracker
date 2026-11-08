/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════════
   📚 IMPORT-IA-FIDELITE-01 — LE CORPUS SYNTHÉTIQUE, PASSÉ PAR LA VRAIE CHAÎNE (blocs B-IIC-*)
   Claude N°2 (Séance, session-C) · 02/11/2026.
   Données : tests/parcours/corpus_import/ — programmes ENTIÈREMENT INVENTÉS (aucun document de coach, de testeur ou de personne) : 12 méthodes
   sportives (rest-pause, myo-reps, 10x10, dropset…) et 4 programmes qui reproduisent les FORMES d'écriture rencontrées à l'import (repos « 2 mins » /
   « 75 sec max » / « 1 . 20 min » / plages, dropset à repos recopié, matériel écrit dans la note, reps absentes, colonne ECH/TRAV, lignes d'échauffement
   à part, ancien format du Worker, noms d'exercices à reconnaître). Chaque fixture porte `aiOutput` (la réponse d'un modèle fidèle au contrat du Worker, APRÈS normalisation) et `attendu`
   (ce que le programme ENREGISTRÉ doit contenir, avant confirmation des propositions).
   Chaîne conduite : `aiOutput` → analyzeImportPhotos → regroupement échauffement/travail → rattachement catalogue → aperçu →
   finalImportProg → programme ENREGISTRÉ → _loadProgDayVraiment (la séance) → toggleSet → startRest (le chrono).
   OBSERVÉ : le programme enregistré série par série, les statuts de reconnaissance de l'aperçu, et la durée RÉELLEMENT passée à
   `startRest` pour chaque série validée (pas la valeur du programme : celle qui sert quand le chrono se déclenche).
   ⛔ 0 appel réel (Worker, Apps Script, Anthropic, Supabase interceptés). NE COUVRE PAS : ce que l'IA RÉELLE renvoie pour un vrai PDF
   (recette séparée, docs/IMPORT-IA-FIDELITE-01.md §Recette), Safari iOS, les couleurs / images / vidéos des documents (texte seul).
   ⛔ Aucune donnée personnelle dans les fixtures : le témoin de source le vérifie par des motifs GÉNÉRIQUES (adresse, lien, téléphone).
   Banc : tools/banc_import_corpus.js · contrôle négatif : tools/mut_import_corpus.py
   ═════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const DIR = path.join(__dirname, 'corpus_import');

const js = x => JSON.stringify(x).slice(0, 700);
const naz = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const BASE_LS = { ft4_ob2: '1', ft4_name: 'Testeur', ft4_premium: 'true', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '130' };

/** Toutes les fixtures du corpus (un fichier S-methodes en contient plusieurs dans `fixtures[]`). */
function charger() {
  const out = [];
  fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort().forEach(f => {
    const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    (Array.isArray(d.fixtures) ? d.fixtures : [d]).forEach(x => out.push(Object.assign({ _fichier: f }, x)));
  });
  return out;
}

/** ⛔ Les écarts CONNUS du rattachement catalogue, nommés avec leur raison : tout AUTRE écart fait rougir le banc.
 *  clé = « id de fixture | nom écrit dans le document » → le nom (faux) auquel l'app l'attache d'office. */
const RATTACHEMENTS_FAUX_CONNUS = {
  'X02-dropset-superset-materiel|Tirage vertical': 'Tirage Poulie Haute (Lat Pulldown)',   // le document écrit « Tirage vertical » + « Prise inversée » : la PRISE (variante) est dans la note, pas dans le nom — l'app ne lit pas les prises (limite dite, dossier §Limites)
};
/** Plancher de reconnaissance (exercices du catalogue reconnus d'office OU proposés avec la BONNE cible) mesuré le 02/11/2026 sur le corpus synthétique.
 *  Un plancher, pas une cible : une amélioration le dépasse, une régression de la reconnaissance passe dessous et fait rougir. */
const PLANCHER_RECONNAISSANCE = 42;

/* ── SOURCE : les fixtures elles-mêmes sont saines (sans navigateur) ── */
module.exports.source = function (t) {
  console.log('\n═══ B-IIC-S. IMPORT-IA-FIDELITE-01 — le corpus est sain (fixtures inventées, cohérentes, au catalogue) ═══');
  const fx = charger();
  const reelles = fx.filter(x => !x.synthetique), synth = fx.filter(x => x.synthetique);
  t('IIC-S01 ⭐ le corpus est ENTIÈREMENT synthétique : 12 méthodes (S) + 4 programmes inventés (X, dont 1 avec colonne ECH/TRAV et son ancien format), AUCUNE fixture « réelle » — un document de coach ou de personne n\'entre JAMAIS dans ce dépôt (il est public)',
    reelles.length === 0 && synth.length === 16 && fx.every(x => /^[SX]\d\d-/.test(x.id) && x.aiOutput && x.attendu), 'réelles=' + reelles.length + ' synth=' + synth.length + ' ids=' + fx.map(x => x.id).join());
  t('IIC-S02 les identifiants sont uniques', new Set(fx.map(x => x.id)).size === fx.length, fx.map(x => x.id).join());
  // aucune donnée personnelle : des motifs GÉNÉRIQUES (jamais une liste de noms — la liste serait elle-même une donnée)
  const brut = fx.map(x => JSON.stringify(x)).join('\n');
  const motifs = { 'adresse e-mail': /[\w.+-]+@[\w-]+\.[\w.]+/, 'lien': /https?:\/\/|www\.|\bdrive\.google|docs\.google/i, 'téléphone': /(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}/, 'identifiant Drive': /\b(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[a-z])(?=[A-Za-z0-9_-]*[A-Z])[A-Za-z0-9_-]{32,}\b/ };
  const trouves = Object.keys(motifs).filter(k => motifs[k].test(brut));
  t('IIC-S03 ⛔⛔ AUCUNE donnée personnelle dans les fixtures (adresse e-mail, lien, téléphone, identifiant de fichier)', trouves.length === 0, trouves.join(' | '));
  // cohérence interne : les totaux déclarés = ceux recalculés sur `attendu`
  const bad = [];
  fx.forEach(x => {
    const a = x.attendu; if (!a || !a.jours) { bad.push(x.id + ' sans attendu'); return; }
    const exs = a.jours.reduce((n, j) => n + j.exercices.length, 0), ser = a.jours.reduce((n, j) => n + j.exercices.reduce((m, e) => m + e.series.length, 0), 0);
    const ech = a.jours.reduce((n, j) => n + j.exercices.reduce((m, e) => m + e.series.filter(s => s.type === 'É').length, 0), 0);
    if (a.totaux && (a.totaux.jours !== a.jours.length || a.totaux.exercices !== exs || a.totaux.series !== ser || a.totaux.seriesEch !== ech)) bad.push(x.id + ' totaux ' + js(a.totaux) + ' ≠ ' + js({ j: a.jours.length, e: exs, s: ser, ech }));
    a.jours.forEach(j => j.exercices.forEach(e => e.series.forEach(s => {
      // ⚠️ MIS À JOUR LE 08/11/2026 (décision de Michel) : un repos chiffré PEUT porter un texte — c'est une PLAGE écrite, et le chiffre est sa BORNE BASSE (« 3-4 min » → 180).
      //    Un repos chiffré avec un texte qui n'est pas une plage (tiret ou « à ») est incohérent ; un texte SANS chiffre (« selon ressenti ») garde repos 0.
      if (!(s.repos >= 0) || (s.repos > 0 && s.reposTxt && !/\d\s*(?:[-–—]|à)\s*\d/.test(s.reposTxt))) bad.push(x.id + ' ' + e.nom + ' repos incohérent ' + js(s));
    })));
  });
  t('IIC-S04 les totaux déclarés par chaque `attendu` sont ceux qu\'on recalcule (jours, exercices, séries, échauffements) ; un repos chiffré n\'a de texte que si c\'est une plage écrite (sa borne basse)', bad.length === 0, bad.slice(0, 3).join(' | '));
  // les noms de catalogue attendus existent TOUS dans le catalogue de l'application
  let exlib = [];
  try {
    const vm = require('vm'); const ctx = { console, window: {}, document: {}, localStorage: { getItem() { return null; } }, navigator: {} }; ctx.globalThis = ctx; vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'constants.js'), 'utf8'), ctx, { filename: 'constants.js' });
    exlib = vm.runInContext('EXLIB.map(e=>e.n)', ctx);
  } catch (e) {}
  const inconnus = []; fx.forEach(x => (x.attendu.jours || []).forEach(j => j.exercices.forEach(e => { if (e.catalogueAttendu && exlib.indexOf(e.catalogueAttendu) < 0) inconnus.push(x.id + ' : ' + e.catalogueAttendu); })));
  t('IIC-S05 chaque nom de catalogue attendu existe à la lettre dans EXLIB (' + exlib.length + ' exercices)', exlib.length > 300 && inconnus.length === 0, inconnus.slice(0, 3).join(' | '));
  // le corpus contient bien les cas que la mission exige
  const tous = fx.map(x => JSON.stringify(x.aiOutput)).join('\n');
  t('IIC-S06 le corpus couvre : colonne ECH/TRAV, repos par série, plages de repos, « Monté en charge », « Série de chauffe », supersets, dropsets, A/B, unilatéral, tempo',
    /"setTypePerSet":\["W"/.test(tous) && /"restPerSet":\["[^"]/.test(tous) && /\d à \d|\d-\d/.test(tous) && /Monté en charge/i.test(tous) && /Série (longue )?de chauffe/i.test(tous)
    && /"supersetGroup":"[A-Z]"/.test(tous) && /"setType":"D"/.test(tous) && /Semaine B/.test(tous) && /unilat|bras\/bras|par bras|côté/i.test(tous) && /[Tt]empo/.test(tous), '');
};

/* ── ÉCRAN : chaque fixture, du document au chronomètre ── */
module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-IIC-C. IMPORT-IA-FIDELITE-01 — le corpus synthétique : document → programme → séance → chrono (l\'app conduite) ═══');
  let PROG = null;
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
  let reels = 0;
  await cx.route(/supabase\.co|anthropic\.com/, r => { reels++; return r.abort(); });
  await cx.route(/workers\.dev|script\.google\.com/, async r => {
    let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
    if (c.action === 'importProgram') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: JSON.parse(JSON.stringify(PROG)) }) });
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
  });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_iic'))return; sessionStorage.setItem('_iic','1'); localStorage.clear();
    const D=${JSON.stringify(BASE_LS)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2500);

  /** Importe une réponse simulée de l'IA, enregistre le programme et rend : l'aperçu (avec les marques de reconnaissance) et le programme. */
  const passer = async (ai) => {
    PROG = ai;
    return pg.evaluate(async () => {
      S.premium = true; S.programmes = []; S.customExercises = []; S.exRestPref = {}; S.defRest = 130; persist();
      _impPhotos = [{ type: 'text/plain', data: 'programme', name: 'prog.txt', isText: true }]; _impMode = 'new';
      await analyzeImportPhotos();
      const apercu = JSON.parse(JSON.stringify((_impExtracted || {}).days || []));
      const connus = typeof _catalogueConnu === 'function' ? _catalogueConnu() : null;
      const statuts = []; (_impExtracted.days || []).forEach((d, di) => (d.exercises || []).forEach((e, ei) => {
        let s = { k: '?' }; try { s = _impStatut(e, connus); } catch (x) {}            // sur un code d'AVANT l'aperçu, la fonction n'existe pas : le statut est inconnu, le banc rougit au lieu de planter
        statuts.push({ di, ei, doc: e._vmFrom || e.name, k: s.k, sugg: e._vmSuggest || '', nom: e.name }); }));
      finalImportProg();
      const prog = JSON.parse(JSON.stringify(S.programmes[S.programmes.length - 1] || null));
      return { apercu, statuts, prog, crees: (S.customExercises || []).map(c => c.n) };
    });
  };
  /** La séance : chaque série de chaque exercice validée dans l'ordre ; on relève ce que `startRest` a reçu. */
  const chrono = async () => pg.evaluate(() => {
    const idx = S.programmes.length - 1; const rep = [];
    window.__rests = []; if (!window.__espion) { window.__espion = true; const o = window.startRest; window.startRest = function (sec) { window.__rests.push(sec); return o.apply(this, arguments); }; }
    S.defRest = 130; S.exRestPref = {};
    S.programmes[idx].days.forEach((day, d) => {
      S.wkt = null; _loadProgDayVraiment(idx, d);
      S.wkt.exs.forEach((ex, i) => {
        ex.sets.forEach((s, k) => {
          // une série « Non renseigné » (reps que le document n'écrit pas) exige un nombre pour être validée (correction D) : la personne le TAPE, ici `upSet`
          // — ce banc mesure le CHRONO, pas la validation (celle-ci a ses témoins : IIF-K08 → K12)
          if (s.reps === null) upSet(i, k, 'reps', '10');
          stopRest(); window.__rests.length = 0; toggleSet(i, k);
          rep.push({ d, i, k, nom: ex.name, type: s.type, groupe: ex.group || '', stocke: s.rest, texte: s.restTxt || '', appels: window.__rests.slice(), tot: restTot,
            abdo: EXLIB.some(e => e.n === ex.name && e.g === 'Abdominaux') });
        });
      });
      stopRest();
    });
    return rep;
  });

  const FX = charger();
  let reconnus = 0, proposesJustes = 0, attendus = 0; const ratesNoms = [], fauxTrouves = [];
  for (const fx of FX) {
    const at = fx.attendu; let r;
    try { r = await passer(fx.aiOutput); } catch (e) { t('IIC-' + fx.id + ' ⛔ la chaîne a planté', false, String(e && e.message || e).slice(0, 300)); continue; }
    const prog = r.prog; const E = [];
    if (!prog) { t('IIC-' + fx.id + ' ⛔ aucun programme enregistré', false, ''); continue; }
    // ── 1. STRUCTURE : jours, exercices, séries, types, charges, reps, repos, texte de repos, notes, supersets, cardio ──
    if (prog.days.length !== at.jours.length) E.push('jours ' + prog.days.length + '≠' + at.jours.length);
    at.jours.forEach((jd, d) => {
      const sd = prog.days[d]; if (!sd) { E.push('J' + (d + 1) + ' absent'); return; }
      if (naz(sd.label) !== naz(jd.label)) E.push('J' + (d + 1) + ' libellé « ' + sd.label + ' »≠« ' + jd.label + ' »');
      const exs = sd.exs || [];
      if (exs.length !== jd.exercices.length) E.push('J' + (d + 1) + ' exercices ' + exs.length + '≠' + jd.exercices.length);
      const groupes = {};
      jd.exercices.forEach((ea, i) => {
        const se = exs[i]; if (!se) return;
        const lib = 'J' + (d + 1) + 'E' + (i + 1) + ' ' + ea.nom;
        if (se.sets.length !== ea.series.length) { E.push(lib + ' séries ' + se.sets.length + '≠' + ea.series.length); return; }
        ea.series.forEach((sa, k) => {
          const ss = se.sets[k]; const diff = [];
          if (ss.type !== sa.type) diff.push('type ' + ss.type + '≠' + sa.type);
          if ((+ss.kg || 0) !== (+sa.kg || 0)) diff.push('kg ' + ss.kg + '≠' + sa.kg);
          // des reps ÉCRITES se retrouvent telles quelles ; des reps que le document n'écrit PAS (attendu 0) restent « Non renseigné » (`null`) — jamais un 10 (correction D)
          if (sa.reps > 0) { if (ss.reps !== sa.reps) diff.push('reps ' + ss.reps + '≠' + sa.reps); }
          else if (ss.reps !== null) diff.push('reps non écrites enregistrées « ' + ss.reps + ' » au lieu de « Non renseigné » (null)');
          if ((+ss.rest || 0) !== (+sa.repos || 0)) diff.push('repos ' + ss.rest + '≠' + sa.repos);
          if (naz(ss.restTxt || '') !== naz(sa.reposTxt || '')) diff.push('texte de repos « ' + (ss.restTxt || '') + ' »≠« ' + (sa.reposTxt || '') + ' »');
          if (diff.length) E.push(lib + ' S' + (k + 1) + ' ' + diff.join(', '));
        });
        (ea.noteContient || []).forEach(m => { if (!naz(se.note).includes(naz(m))) E.push(lib + ' note sans « ' + m + ' »'); });
        if (!!ea.superset !== !!se.group) E.push(lib + ' superset ' + !!se.group + '≠' + !!ea.superset);
        if (ea.superset) (groupes[ea.superset] = groupes[ea.superset] || []).push(se.group || '');
      });
      Object.keys(groupes).forEach(g => { if (new Set(groupes[g]).size !== 1) E.push('J' + (d + 1) + ' le superset « ' + g + ' » n\'est pas UN groupe : ' + groupes[g].join('|')); });
      if (jd.cardioAvant) { const c = sd.cardioAvant; if (!c) E.push('J' + (d + 1) + ' cardio d\'échauffement perdu'); else if (+c.duration !== +jd.cardioAvant.duration) E.push('J' + (d + 1) + ' cardio durée ' + c.duration + '≠' + jd.cardioAvant.duration); }
      else if (sd.cardioAvant) E.push('J' + (d + 1) + ' cardio inattendu');
    });
    const ns = prog.days.reduce((a, d) => a + d.exs.reduce((x, e) => x + e.sets.length, 0), 0), ne = prog.days.reduce((a, d) => a + d.exs.length, 0);
    const nech = prog.days.reduce((a, d) => a + d.exs.reduce((x, e) => x + e.sets.filter(s => s.type === 'É').length, 0), 0);
    if (at.totaux && (ns !== at.totaux.series || ne !== at.totaux.exercices || nech !== at.totaux.seriesEch)) E.push('totaux ' + js({ ne, ns, nech }) + '≠' + js(at.totaux));
    const props = new Set(); r.apercu.forEach(d => d.exercises.forEach(e => { if (e._propGrp != null) props.add(e._propGrp); }));
    if (props.size !== (at.propositions || []).length) E.push('propositions ' + props.size + '≠' + (at.propositions || []).length);
    t('IIC-' + fx.id + ' ⭐ le programme ENREGISTRÉ est celui du document : ' + prog.days.length + ' séance(s), ' + ne + ' exercice(s), ' + ns + ' série(s) dont ' + nech + ' d\'échauffement — types, charges, reps, repos, textes de repos, notes, supersets, cardio',
      E.length === 0, E.slice(0, 6).join(' | ') + (E.length > 6 ? ' … +' + (E.length - 6) : ''));

    // ── 2. RECONNAISSANCE : aucun rattachement FAUX (hors limites dites), tout ambigu est proposé, tout inconnu est annoncé ──
    const N = []; const parDoc = {}; r.statuts.forEach(s => { parDoc[naz(s.doc)] = s; });
    at.jours.forEach((jd, d) => jd.exercices.forEach((ea, i) => {
      const s = parDoc[naz(ea.nom)]; const se = (prog.days[d].exs || [])[i];
      if (!s || !se) return;
      const cle = fx.id + '|' + ea.nom;
      const rattache = naz(se.name) !== naz(ea.nom);
      if (ea.catalogueAttendu) {
        attendus++;
        if (naz(se.name) === naz(ea.catalogueAttendu)) reconnus++;
        else if (!rattache && s.k === 'conf' && naz(s.sugg) === naz(ea.catalogueAttendu)) proposesJustes++;
        else if (!rattache && s.k === 'new') ratesNoms.push(ea.nom + ' → ' + ea.catalogueAttendu);
      }
      if (rattache && naz(se.name) !== naz(ea.catalogueAttendu)) {          // rattaché à AUTRE chose que prévu = faux
        if (RATTACHEMENTS_FAUX_CONNUS[cle] === se.name) fauxTrouves.push(cle); else N.push('« ' + ea.nom + ' » rattaché à « ' + se.name + ' » (attendu : ' + (ea.catalogueAttendu || 'rien') + ')');
      }
      if (ea.statutAttendu && s.k !== ea.statutAttendu) N.push('« ' + ea.nom + ' » : statut de l\'aperçu « ' + s.k + ' » au lieu de « ' + ea.statutAttendu + ' » (ok = reconnu d\'office · conf = À CONFIRMER, jamais appliqué sans la personne · new = « sera créé »)');
      if (s.k === 'conf' && rattache) N.push('« ' + ea.nom + ' » est à confirmer mais déjà renommé « ' + se.name + ' »');
      if (s.k === 'new' && !r.crees.some(c => naz(c) === naz(ea.nom)) && naz(se.name) === naz(ea.nom)) N.push('« ' + ea.nom + ' » annoncé « sera créé » mais non créé');
      if (s.k === 'ok' && r.crees.some(c => naz(c) === naz(se.name))) N.push('« ' + ea.nom + ' » sera créé comme exercice perso mais l\'aperçu le dit « Reconnu »');
    }));
    t('IIC-' + fx.id + ' ⛔⛔ RECONNAISSANCE : aucun exercice n\'est rattaché à un AUTRE que prévu, aucune proposition n\'est appliquée d\'office, tout inconnu annoncé « sera créé » l\'est vraiment', N.length === 0, N.slice(0, 4).join(' | '));

    // ── 3. LE CHRONO : la durée réellement passée à startRest pour CHAQUE série validée ──
    const cr = await chrono(); const C = []; let fermes = 0, replis = 0, sautes = 0;
    cr.forEach(c => {
      const lib = 'J' + (c.d + 1) + 'E' + (c.i + 1) + 'S' + (c.k + 1) + ' ' + c.nom;
      const ex = prog.days[c.d].exs[c.i]; const dernierDropset = c.type === 'D' ? !ex.sets.slice(c.k + 1).some(s => s.type === 'D') : true;
      const progTxt = (ex.sets[c.k].restTxt || '');                         // le texte écrit dans le PROGRAMME doit arriver tel quel à la SÉANCE (la consigne affichée sous le chrono)
      if (progTxt !== c.texte) C.push(lib + ' : le texte de repos du programme « ' + progTxt + ' » n\'arrive pas à la séance (« ' + c.texte + ' »)');
      if (c.groupe) { sautes++; return; }                                    // superset : le détail est couvert par IIF-C01 (aucun repos avant la fin du tour)
      if (c.type === 'D' && !dernierDropset) { sautes++; if (c.appels.length) C.push(lib + ' : un repos entre deux paliers de dropset ' + js(c.appels)); return; }
      if (c.stocke > 0) { fermes++; if (c.appels.length !== 1 || c.appels[0] !== c.stocke || c.tot !== c.stocke) C.push(lib + ' : repos écrit ' + c.stocke + ' s, chrono ' + js(c.appels) + ' / restTot ' + c.tot); }
      else if (c.type === 'É') { replis++; if (c.appels.length !== 1 || !(c.appels[0] >= 20 && c.appels[0] <= 130)) C.push(lib + ' : échauffement sans repos écrit, chrono ' + js(c.appels)); }
      else { replis++; const att = c.abdo ? 30 : 130;                        // le défaut de l'APP : 30 s pour un exercice d'abdominaux (toggleSet), sinon le réglage de la personne
        if (c.appels.length !== 1 || c.appels[0] !== att) C.push(lib + ' : aucun repos chiffré écrit (' + (c.texte || 'rien') + '), le chrono doit prendre le réglage de la personne (' + att + ' s) : ' + js(c.appels)); }
    });
    t('IIC-' + fx.id + ' ⭐⭐ CHRONO — chaque série validée lance EXACTEMENT son repos enregistré (' + fermes + ' fermes), le réglage de la personne sinon (' + replis + '), rien d\'inventé (' + sautes + ' enchaînements dropset / superset exclus)',
      C.length === 0 && cr.length === ns, C.slice(0, 4).join(' | ') + (cr.length !== ns ? ' · séries validées ' + cr.length + '≠' + ns : ''));
  }
  // ── 4. BILAN DE RECONNAISSANCE ──
  t('IIC-Z01 ⭐ RECONNAISSANCE — ' + (reconnus + proposesJustes) + ' exercices du catalogue sur ' + attendus + ' sont reconnus d\'office (' + reconnus + ') ou proposés avec la BONNE cible (' + proposesJustes + ') ; plancher ' + PLANCHER_RECONNAISSANCE,
    reconnus + proposesJustes >= PLANCHER_RECONNAISSANCE, 'reconnus=' + reconnus + ' proposés=' + proposesJustes + ' attendus=' + attendus);
  t('IIC-Z02 les limites de rattachement CONNUES sont exactement celles nommées (aucune disparue en silence, aucune nouvelle)', fauxTrouves.slice().sort().join() === Object.keys(RATTACHEMENTS_FAUX_CONNUS).sort().join(), 'trouvés=' + js(fauxTrouves));
  console.log('   ℹ️ ' + ratesNoms.length + ' exercice(s) du catalogue non reconnus (créés comme exercices perso) : abréviations et synonymes de coach. Mesuré, pas corrigé : un synonyme faux redirige un exercice en silence (R29).');
  // ── 5. L'ANCIEN FORMAT DU WORKER (une ligne d'échauffement = un exercice, « ECH » en note) est regroupé comme le nouveau ──
  const c01 = FX.find(x => x.aiOutputLegacy);
  if (c01) {
    const r = await passer(c01.aiOutputLegacy); const prog = r.prog; const E = [];
    c01.attendu.jours.forEach((jd, d) => jd.exercices.forEach(ea => {
      const sd = prog.days[d]; const cible = naz(ea.catalogueAttendu || ea.nom);
      const se = sd && (sd.exs || []).find(e => naz(e.name) === cible || naz(e.name) === naz(ea.nom));
      if (!se) { E.push('J' + (d + 1) + ' « ' + ea.nom + ' » introuvable'); return; }
      const types = se.sets.map(s => s.type).join(''), att = ea.series.map(s => s.type).join('');
      if (types !== att) E.push('J' + (d + 1) + ' ' + ea.nom + ' types ' + types + '≠' + att);
      if (se.sets.map(s => s.kg).join() !== ea.series.map(s => s.kg).join() || se.sets.map(s => s.reps).join() !== ea.series.map(s => s.reps).join()) E.push('J' + (d + 1) + ' ' + ea.nom + ' charges/reps');
    }));
    t('IIC-L01 ⭐ L\'ANCIEN format du Worker (une ligne = un exercice, « ECH » en note, aucun repos) donne les MÊMES exercices, types, charges et reps que le nouveau contrat', E.length === 0, E.slice(0, 4).join(' | '));
  }
  t('IIC-Z03 aucune erreur de page, aucun appel réel', errs.length === 0 && reels === 0, js({ errs: errs.slice(0, 3), reels }));
  await cx.close();
};
