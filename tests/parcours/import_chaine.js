/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   📥 IMPORT PDF — LA CHAÎNE FIDÈLE, DU DOCUMENT À LA SÉANCE CHARGÉE (blocs B-ICF-*) — Claude N°2 (Séance), 15/11/2026
   Mission prioritaire de Michel après la recette iPhone de ft-v1267 (8 captures + le PDF réel, gardé HORS DU DÉPÔT).
   Chaîne conduite : réponse de l'IA SIMULÉE (à la forme exacte du Worker, avec les défauts OBSERVÉS : 4 charges pour 5 séries, fourchettes,
   virgules, « barre ») → `analyzeImportPhotos` → regroupement → aperçu → `finalImportProg` → programme ENREGISTRÉ → `_loadProgDayVraiment`
   → la séance chargée. ⛔ Données 100 % FICTIVES : mêmes FORMES que le document de recette (une barre à vide dans une liste de charges, une
   fourchette, « 60 kg total (30/haltère) », « charge adaptée », des décimales), autres chiffres, autres libellés.
   0 appel réel (Worker, Apps Script, Anthropic, Supabase interceptés). NE COUVRE PAS : ce que l'IA RÉELLE renvoie pour le PDF réel (un test de
   prompt prouve la PRÉSENCE d'une règle, jamais l'obéissance du modèle — recette humaine), Safari iOS (Chromium 390×844 ≠ iPhone).
   Banc : tools/banc_import_chaine.js · contrôle négatif : tools/mut_import_chaine.py
   Préfixes : ICF-A (charges) · ICF-B (historique contre prescriptions) · ICF-F (remplacement)
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const js = x => JSON.stringify(x).slice(0, 700);
/** Une ligne de la réponse du Worker (forme du schéma de PROG_PROMPT). */
const EX = (name, repsPerSet, kgPerSet, note, extra) => Object.assign({ name, sets: repsPerSet.length, reps: repsPerSet[0] || 0, repsPerSet: repsPerSet.slice(),
  specialSets: [], kg: 0, kgPerSet: kgPerSet.slice(), supersetGroup: '', setType: '', note: note || '' }, extra || {});
// ⛔ Notes FICTIVES (le dépôt est public) : une forme de consigne plausible, aucune phrase ni aucun chiffre d'un vrai document de la personne.
const NOTE_ECH = 'Repos court (30-60 s) entre les premières montées, puis 2 min avant la dernière. Rester frais, aucune fatigue.';
const NOTE_TRAV = 'Série lourde à 2 reps, RIR 1-2. Ensuite deux séries plus légères à 3 reps, RIR 1-2. Récupération 4-5 min. Si la série lourde paraît facile (RIR 2 ou plus), ajouter 2,5 kg à la prochaine séance.';
const prog = (...jours) => ({ name: 'Programme fictif 8 semaines', weeks: 8, startDate: '', days: jours.map((ex, i) => ({ label: 'SÉANCE ' + (i + 1) + ' - TEST', exercises: ex })) });
const BASE_LS = { ft4_ob2: '1', ft4_name: 'Testeur', ft4_premium: 'true', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '130' };

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-ICF. IMPORT PDF — la chaîne fidèle : document → aperçu → programme enregistré → séance chargée (l\'app conduite) ═══');
  let PROG = null;                                   // la réponse « du Worker » courante, changée d'un cas à l'autre
  const POSTS = [];                                  // les corps envoyés (section G : le VRAI corps de `_cloudSync`)
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
  await cx.route(/supabase\.co|anthropic\.com/, r => r.abort());
  await cx.route(/workers\.dev|script\.google\.com/, async r => {
    let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
    POSTS.push(c);
    if (c.action === 'importProgram') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: JSON.parse(JSON.stringify(PROG)) }) });
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
  });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_icf'))return; sessionStorage.setItem('_icf','1'); localStorage.clear();
    const D=${JSON.stringify(BASE_LS)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2500);

  /** Une section qui plante devient un ROUGE nommé — jamais un arrêt du banc. */
  const section = async (nom, fn) => { try { await fn(); } catch (e) { t('ICF-' + nom + ' ⛔ la section n\'a pas pu aller au bout', false, String(e && e.message || e).slice(0, 240)); } };
  /** Importe `p` (réponse simulée) sur un compte `cpt` ; renvoie le texte de l'aperçu et les exercices après regroupement. */
  const importer = async (p, cpt) => {
    PROG = p; cpt = cpt || {};
    return pg.evaluate(async (c) => {
      S.premium = true; S.programmes = c.programmes || []; S.customExercises = []; S.exRestPref = {}; S.defRest = 130; S.sessions = c.sessions || []; persist();
      _impPhotos = [{ type: 'text/plain', data: 'programme', name: 'prog.txt', isText: true }]; _impMode = 'new';
      await analyzeImportPhotos();
      const el = document.getElementById('imp-preview');
      return { texte: el ? el.innerText : '', html: el ? el.innerHTML : '', exos: ((_impExtracted || {}).days || []).map(d => (d.exercises || []).map(e => e.name)) };
    }, cpt);
  };
  const enregistrer = () => pg.evaluate(() => { finalImportProg(); return JSON.parse(JSON.stringify(S.programmes[S.programmes.length - 1])); });
  const charger = (idx, jour) => pg.evaluate(([i, j]) => { S.wkt = null; _loadProgDayVraiment(i, j); return JSON.parse(JSON.stringify(S.wkt)); }, [idx, jour]);
  const trouve = (p, d, nom) => ((p.days[d] || {}).exs || []).filter(e => e.name === nom);
  /* D-164 (mission corrective du 16/11/2026) : une charge INCONNUE (`null`) s'écrit « ? » ici — elle ne se confond plus avec un ZÉRO écrit (« 0 », une barre « à vide ») : avant, `join` rendait `null` vide et l'import écrivait 0 pour « non renseignée ». */
  const KG = e => (e && e.sets || []).map(s => s.kg === null ? '?' : s.kg).join(',');
  const REPS = e => (e && e.sets || []).map(s => s.reps).join(',');
  const TYPES = e => (e && e.sets || []).map(s => s.type).join('');
  const VIDES = e => (e && e.sets || []).map(s => s.vide ? 'V' : '.').join('');

  // ═══ A. LES CHARGES : fidèles, jamais décalées, jamais comblées d'une valeur inventée ═══
  await section('A', async () => {
    // A1 — LE DÉFAUT OBSERVÉ LE 15/11 : « Barre / 40 / 60 / 75 / 80 kg » → le modèle rend 4 charges pour 5 séries (la barre est omise).
    //      Avant : les 4 valeurs prenaient les 4 premières séries et la 5ᵉ recevait `kg` de l'exercice → TOUT décalé (40·60·75·80·80 au lieu de barre·40·60·75·80).
    const ECH_COURT = EX('Développé Couché - échauffement', [10, 5, 3, 1, 1], [40, 60, 75, 80], NOTE_ECH, { kg: 80 });
    const TRAV = EX('Développé Couché', [2, 3, 3], [85, 80, 80], NOTE_TRAV);
    const ap1 = await importer(prog([ECH_COURT, TRAV]));
    const p1 = await enregistrer();
    const dc1 = trouve(p1, 0, 'Développé Couché')[0] || { sets: [] };
    t('ICF-A01 ⭐⭐ UN TABLEAU DE CHARGES TROP COURT (4 charges pour 5 séries) n\'est JAMAIS aligné ni comblé : aucune charge inventée, les 5 séries d\'échauffement restent « non renseignées » (INCONNUES : null, jamais un zéro inventé)',
      TYPES(dc1) === 'ÉÉÉÉÉNNN' && KG(dc1).split(',').slice(0, 5).every(k => k === '?'), js({ types: TYPES(dc1), kg: KG(dc1) }));
    t('ICF-A02 ⭐ … et les charges de TRAVAIL de la ligne suivante ne bougent pas d\'un cran (85 · 80 · 80)', KG(dc1).split(',').slice(5).join(',') === '85,80,80', KG(dc1));
    t('ICF-A03 ⭐ l\'aperçu DIT que la lecture est incomplète (4 charges pour 5 séries) — on ne le découvre pas à la salle', /charges? incompl[eè]tes?/i.test(ap1.texte) && /4 charges? .*5 s[ée]ries/i.test(ap1.texte), ap1.texte.slice(0, 500));
    t('ICF-A04 ⛔ et l\'aperçu n\'affiche AUCUNE valeur décalée (« 40 kg × 10 » en face de la barre)', !/40 kg × 10/.test(ap1.texte.replace(/\s+/g, ' ')), '');

    // A5 — la lecture CORRECTE : la barre est écrite « 0 » à sa place dans un tableau qui a au moins une charge positive = « à vide », distincte d'une charge non renseignée
    const ECH_OK = EX('Développé Couché - échauffement', [10, 5, 3, 1, 1], [0, 40, 60, 75, 80], NOTE_ECH, { kg: 80 });
    const ap2 = await importer(prog([ECH_OK, EX('Développé Couché', [2, 3, 3], [85, 80, 80], NOTE_TRAV)]));
    const p2 = await enregistrer();
    const dc2 = trouve(p2, 0, 'Développé Couché')[0] || { sets: [] };
    t('ICF-A05 ⭐⭐ « BARRE À VIDE » ≠ « CHARGE NON RENSEIGNÉE » : la 1ʳᵉ série porte `vide:true` (0 kg écrit par le document), les suivantes leurs charges, ordre conservé',
      KG(dc2) === '0,40,60,75,80,85,80,80' && VIDES(dc2) === 'V.......' && TYPES(dc2) === 'ÉÉÉÉÉNNN', js({ kg: KG(dc2), vide: VIDES(dc2), types: TYPES(dc2) }));
    t('ICF-A06 ⭐ l\'aperçu écrit « à vide » pour la barre (jamais un tiret, jamais « 0 kg » : ce n\'est pas une charge manquante)', /à vide/i.test(ap2.texte), ap2.texte.slice(0, 400));
    t('ICF-A07 ⛔ une lecture COMPLÈTE n\'affiche aucun avertissement de charges incomplètes', !/charges? incompl/i.test(ap2.texte), '');

    // A8 — un tableau de zéros (remplissage du modèle) n'est PAS « à vide » : charges inconnues, aucun `vide`
    const ZEROS = EX('Traction', [8, 8, 8], [0, 0, 0], 'Poids du corps', {});
    await importer(prog([ZEROS]));
    const p3 = await enregistrer();
    const tr3 = trouve(p3, 0, 'Traction')[0] || { sets: [] };
    t('ICF-A08 ⛔ un tableau de zéros SEULS est une charge non renseignée (pas « à vide ») : aucun `vide`, charge inconnue (null)', VIDES(tr3) === '...' && KG(tr3) === '?,?,?', js({ kg: KG(tr3), vide: VIDES(tr3) }));

    // A9 — une charge écrite pour tout l'exercice vaut pour CHAQUE série (comportement conservé)
    await importer(prog([EX('Squat Avant', [5, 5, 5], [], 'RIR 2. Repos 3 min.', { kg: 55 })]));
    const p4 = await enregistrer();
    t('ICF-A09 une charge unique (« 55 kg », pas de tableau) vaut pour chaque série (55 · 55 · 55)', KG(trouve(p4, 0, 'Squat Avant')[0]) === '55,55,55', KG(trouve(p4, 0, 'Squat Avant')[0]));

    // A10 — décimales : la virgule est une virgule (142,5 ≠ 142), nombres ou chaînes
    await importer(prog([EX('Soulevé de Terre', [2, 3, 3], ['142,5', 135, '135 kg'], NOTE_TRAV), EX('Squat à la Barre', [3, 3, 3], [115, 107.5, '107,5'], 'RIR 2')]));
    const p5 = await enregistrer();
    t('ICF-A10 ⭐ DÉCIMALES : « 142,5 » → 142.5 (nombre, jamais la chaîne ni 142) ; 107,5 conservé ; « 135 kg » → 135',
      KG(trouve(p5, 0, 'Soulevé de Terre')[0]) === '142.5,135,135' && KG(trouve(p5, 0, 'Squat à la Barre')[0]) === '115,107.5,107.5'
      && (trouve(p5, 0, 'Soulevé de Terre')[0].sets || []).every(s => typeof s.kg === 'number'), js({ sdt: KG(trouve(p5, 0, 'Soulevé de Terre')[0]), sq: KG(trouve(p5, 0, 'Squat à la Barre')[0]) }));

    // A11 — fourchettes : la BORNE BASSE est le nombre ; la consigne d'origine est conservée (fin de note, une seule fois) ; rien n'est inventé
    await importer(prog([EX('Rowing Poitrine Appuyée', ['8', '8', '8'], [], 'RIR 2. Repos 2 min.', { kg: '44-48 kg' }),
      EX('Développé Incliné Haltères', ['6-8', '6-8', '6-8'], [], 'RIR 2. Repos 2-3 min.', { kg: 70 })]));
    const p6 = await enregistrer();
    const row = (p6.days[0].exs[0]) || { sets: [], note: '' }, inc = (p6.days[0].exs[1]) || { sets: [], note: '' };   // par RANG : le catalogue peut renommer l'exercice reconnu
    t('ICF-A11 ⭐ FOURCHETTE DE CHARGE « 44-48 kg » → borne basse 44 sur chaque série (jamais 46, jamais 48), la fourchette EXACTE est gardée à la FIN de la note', KG(row) === '44,44,44' && /44-48/.test(row.note) && row.note.startsWith('RIR 2'), js({ kg: KG(row), note: row.note }));
    t('ICF-A12 ⭐ FOURCHETTE DE REPS « 6-8 » → borne basse 6 sur chaque série, fourchette gardée dans la note (une seule fois)', REPS(inc) === '6,6,6' && (inc.note.match(/6-8/g) || []).length === 1, js({ reps: REPS(inc), note: inc.note }));
    t('ICF-A13 ⛔ aucune fourchette n\'est ajoutée à une note quand le document n\'en contient pas', !/Charge :|Reps :/.test(trouve(p5, 0, 'Squat à la Barre')[0].note || ''), js(trouve(p5, 0, 'Squat à la Barre')[0].note));

    // A14 — « charge confortable / adaptée » : aucun nombre inventé, le texte du document reste (dans la note) ; la barre écrite en toutes lettres est « à vide »
    await importer(prog([EX('Tirage Visage', [12, 12], [], 'RIR 3. Repos 60-90 s. Charge confortable.', { kg: 'Charge confortable' }),
      EX('Crunch Poulie', [10, 10], ['Barre', 20], 'RIR 2')]));
    const p7 = await enregistrer();
    const tv = (p7.days[0].exs[0]) || { sets: [], note: '' }, cr = (p7.days[0].exs[1]) || { sets: [], note: '' };
    t('ICF-A14 ⛔ « Charge confortable » : aucun nombre inventé (charge inconnue, pas `vide`), la note du document est intacte', KG(tv) === '?,?' && VIDES(tv) === '..' && /Charge confortable/.test(tv.note), js({ kg: KG(tv), note: tv.note }));
    t('ICF-A15 « Barre » écrite en toutes lettres dans un tableau de charges = « à vide » (explicite), la charge suivante est lue', VIDES(cr) === 'V.' && KG(cr) === '0,20', js({ kg: KG(cr), vide: VIDES(cr) }));

    // A18 — le remplissage du modèle (zéros SEULS sur la ligne d'échauffement) puis un travail chiffré : les zéros ne deviennent JAMAIS une barre à vide après le regroupement
    await importer(prog([EX('Soulevé de Terre - échauffement', [5, 3, 2, 1, 1], [0, 0, 0, 0, 0], '1-2 min au début.', { kg: 0 }), EX('Soulevé de Terre', [2, 3, 3], [135, 125, 125], 'Série lourde à 2 reps.')]));
    const p9 = await enregistrer(); const sd9 = (p9.days[0].exs[0]) || { sets: [] };
    t('ICF-A18 ⭐ un échauffement rempli de ZÉROS par le modèle (charges inconnues) fusionné à son travail : aucune série « à vide » (le remplissage n\'est pas une barre), les charges de travail sont intactes',
      sd9.sets.length === 8 && VIDES(sd9) === '........' && KG(sd9) === '?,?,?,?,?,135,125,125', js({ kg: KG(sd9), vide: VIDES(sd9) }));

    // A19 — SANS charge lisible, l'échauffement d'un exercice de MUSCULATION ne devient jamais du cardio (la note donne des durées : « 2 min avant la dernière »)
    //       (avant : un tableau incomplet était COMBLÉ, donc la ligne gardait des charges ; maintenant les charges restent « non renseignées » — le garde ① du cardio ne suffit plus)
    await importer(prog([EX('Développé Couché - échauffement', [10, 5, 3, 1, 1], [40, 60, 75, 80], NOTE_ECH, { kg: 80 }), EX('Squat à la Barre', [5, 5, 5], [100, 100, 100], 'RIR 2')]));
    const p10 = await enregistrer();
    t('ICF-A19 ⭐⭐ un échauffement de musculation SANS charge lisible reste un EXERCICE (jamais « vélo léger 3 min » tiré de la durée de sa note) : 2 exercices dans le jour, aucun cardio avant',
      p10.days[0].exs.length === 2 && !p10.days[0].cardioAvant && /chauffement/.test(p10.days[0].exs[0].name), js({ n: p10.days[0].exs.length, cardio: p10.days[0].cardioAvant || null, noms: p10.days[0].exs.map(e => e.name) }));
    await importer(prog([EX('Échauffement', [1], [], '8 min vélo léger', { kg: 0 }), EX('Squat à la Barre', [5, 5, 5], [100, 100, 100], 'RIR 2')]));
    const p11 = await enregistrer();
    t('ICF-A20 ⛔ CONTRÔLE — un VRAI cardio (« Échauffement : 8 min vélo léger », sans charge) part toujours dans le bloc cardio du jour (comportement conservé)', p11.days[0].exs.length === 1 && !!p11.days[0].cardioAvant, js({ n: p11.days[0].exs.length, cardio: p11.days[0].cardioAvant || null }));

    // A21 — les TRAITS D'UNION TYPOGRAPHIQUES (un PDF en produit : ‐ U+2010, ‑ U+2011, ‒ U+2012, − U+2212) comptent comme le tiret « - » dans « X - échauffement »
    const TIRETS = [['\u2010', 'U+2010'], ['\u2011', 'U+2011'], ['\u2012', 'U+2012'], ['\u2212', 'U+2212'], ['\u2013', 'U+2013 (demi-cadratin)']];
    const rTir = [];
    for (const [c, nom] of TIRETS) {
      await importer(prog([EX('Développé Couché ' + c + ' échauffement', [10, 5, 3, 1, 1], [0, 40, 60, 75, 80], NOTE_ECH, { kg: 80 }), EX('Développé Couché', [2, 3, 3], [85, 80, 80], NOTE_TRAV)]));
      const pt = await enregistrer(); const e0 = pt.days[0].exs[0] || { sets: [] };
      rTir.push(nom + ':' + pt.days[0].exs.length + 'ex/' + TYPES(e0));
    }
    t('ICF-A21 ⭐ « Développé Couché ‐ échauffement » avec un trait d\'union TYPOGRAPHIQUE (U+2010, U+2011, U+2012, U+2212, U+2013) est regroupé avec son travail : UN exercice de 8 séries ÉÉÉÉÉNNN', rTir.every(x => /:1ex\/ÉÉÉÉÉNNN$/.test(x)), rTir.join(' · '));

    // A22 — « 2 x 30 kg » (deux haltères ? deux séries ?) n'est JAMAIS lu « 2 kg » : on ne devine pas, la charge reste non renseignée
    await importer(prog([EX('Développé Incliné Haltères', [8, 8, 8], [], 'RIR 2', { kg: '2 x 30 kg' }), EX('Curl Marteau', [10, 10], ['2x14', '2 × 14'], 'RIR 2')]));
    const p12 = await enregistrer();
    t('ICF-A22 ⛔ une charge écrite « 2 x 30 kg » ou « 2x14 » n\'est jamais lue « 2 kg » (ambiguë : deux haltères ? deux séries ?) — charge non renseignée, rien n\'est deviné',
      KG(p12.days[0].exs[0]) === '?,?,?' && KG(p12.days[0].exs[1]) === '?,?', js({ a: KG(p12.days[0].exs[0]), b: KG(p12.days[0].exs[1]) }));

    // A23 — une lecture INCOMPLÈTE garde les valeurs LUES dans la note (à la fin, une seule fois) : l'aperçu disparaît à « Enregistrer », la note non ; jamais en double avec l'écriture du Worker préparé
    const noteLues = String(dc1.note || '');
    t('ICF-A23 ⭐ les 4 charges LUES d\'un tableau incomplet (40 · 60 · 75 · 80) restent ÉCRITES dans la note de l\'exercice enregistré, une seule fois — la personne les place dans l\'éditeur sans rouvrir le PDF',
      /Charges lues : 40 · 60 · 75 · 80 \(4 pour 5 séries\)/.test(noteLues) && noteLues.split('Charges lues').length === 2, noteLues.slice(-200));
    await importer(prog([EX('Développé Couché - échauffement', [10, 5, 3, 1, 1], [40, 60, 75, 80], NOTE_ECH + ' | Charges : 40 / 60 / 75 / 80 kg (4 pour 5 séries)', { kg: 80 }), EX('Développé Couché', [2, 3, 3], [85, 80, 80], NOTE_TRAV)]));
    const pW = await enregistrer(); const nW = String((trouve(pW, 0, 'Développé Couché')[0] || {}).note || '');
    t('ICF-A24 ⛔ si le Worker a DÉJÀ écrit « (4 pour 5 séries) » dans la note, l\'app ne l\'écrit pas une seconde fois', !/Charges lues/.test(nW) && nW.split('4 pour 5 séries').length === 2, nW.slice(-200));

    // A25 — D4 « préserver l'information source » : une charge ÉCRITE mais ILLISIBLE (« 2 x 30 kg », « Charge adaptée ») n'est pas perdue en silence
    const ap25 = await importer(prog([EX('Développé Incliné Haltères', [8, 8, 8], [], 'RIR 2', { kg: '2 x 30 kg' }), EX('Leg Curl Assis Machine', [10, 10], [], '', { kg: 'Charge adaptée' }), EX('Squat à la Barre', [5, 5, 5], [100, 100, 100], 'RIR 2')]));
    const p25 = await enregistrer(); const e25 = p25.days[0].exs;   // par RANG : le catalogue peut renommer l'exercice reconnu
    const nbAvert = (ap25.texte.match(/Charge écrite non lue/g) || []).length;
    t('ICF-A25 ⭐⭐ D4 — une charge ÉCRITE mais ILLISIBLE (« 2 x 30 kg », « Charge adaptée ») n\'est pas perdue en silence : le texte du document reste à la FIN de la note, l\'aperçu le DIT (une fois par exercice concerné, jamais pour une charge lue), aucun nombre n\'est deviné, rien de transitoire n\'est enregistré',
      nbAvert === 2 && /2 x 30 kg/.test(ap25.texte) && /Charge adaptée/.test(ap25.texte) && e25[0].note === 'RIR 2 | Charge non lue : 2 x 30 kg' && e25[1].note === 'Charge non lue : Charge adaptée' && e25[2].note === 'RIR 2'
      && KG(e25[0]) === '?,?,?' && KG(e25[1]) === '?,?' && KG(e25[2]) === '100,100,100' && !JSON.stringify(p25).includes('_kgNonLue'), js({ avert: nbAvert, notes: e25.map(e => e.note), kg: e25.map(KG) }));
    await importer(prog([EX('Leg Curl Assis Machine', [10, 10], [], 'RIR 2. Charge adaptée.', { kg: 'Charge adaptée' })]));
    const p25b = await enregistrer();
    t('ICF-A26 ⛔ D4 — le texte d\'une charge illisible n\'est jamais écrit DEUX FOIS : une note qui le porte déjà reste telle quelle', p25b.days[0].exs[0].note === 'RIR 2. Charge adaptée.', p25b.days[0].exs[0].note);
    // … et l'information SUIT l'exercice quand une ligne d'échauffement (dont la charge est illisible) est regroupée avec son travail
    const ap27 = await importer(prog([EX('Développé Couché - échauffement', [10, 5], [], '', { kg: '2 x 20 kg' }), EX('Développé Couché', [5, 5], [80, 80], 'RIR 2')]));
    const p27 = await enregistrer(); const e27 = (p27.days[0].exs || [])[0] || { sets: [], note: '' };
    t('ICF-A27 ⭐ D4 — l\'avertissement et le texte d\'une charge illisible SUIVENT l\'exercice regroupé (échauffement « 2 x 20 kg » + travail 80 · 80 : un exercice de 4 séries, le texte dans la note, l\'aperçu le dit)',
      p27.days[0].exs.length === 1 && TYPES(e27) === 'ÉÉNN' && KG(e27) === '?,?,80,80' && /Charge non lue : 2 x 20 kg/.test(e27.note) && /RIR 2/.test(e27.note) && (ap27.texte.match(/Charge écrite non lue/g) || []).length === 1, js({ n: p27.days[0].exs.length, types: TYPES(e27), kg: KG(e27), note: e27.note, avert: (ap27.texte.match(/Charge écrite non lue/g) || []).length }));

    // A16 — un échauffement COURT fusionné à son travail : les charges de TRAVAIL ne sont jamais décalées par un tableau incomplet voisin
    //       (le cas exact du 15/11 : la ligne d'échauffement est incomplète, la ligne de travail est juste)
    t('ICF-A16 ⭐ après regroupement, un tableau incomplet n\'efface NI ne déplace les charges de la ligne voisine (85 · 80 · 80 en 6ᵉ-8ᵉ position)', KG(dc1).split(',').length === 8 && KG(dc1).split(',').slice(5).join(',') === '85,80,80', KG(dc1));

    // A17 — les consignes (progression, RIR, plusieurs phrases) arrivent ENTIÈRES du document à la séance
    const NOTE_LONGUE = NOTE_TRAV + ' Semaines 3-4 : si la série lourde atteint RIR 2, monter de 2,5 kg. Semaines 5-6 : série lourde jusqu\'à RIR 1, séries légères RIR 1-2. Semaine 7 : une seule répétition lourde et propre est possible. ' + 'Technique : omoplates serrées, pieds ancrés, trajectoire stable. '.repeat(6);
    await importer(prog([EX('Développé Couché', [2, 3, 3], [85, 80, 80], NOTE_LONGUE)]));
    const p8 = await enregistrer();
    const w8 = await charger(p8 ? (await pg.evaluate(() => S.programmes.length - 1)) : 0, 0);
    const dc8 = trouve(p8, 0, 'Développé Couché')[0] || { note: '' };
    t('ICF-A17 ⭐ une consigne LONGUE (' + NOTE_LONGUE.length + ' caractères : RIR, progression, technique) est enregistrée ENTIÈRE et reprise telle quelle à la séance', dc8.note === NOTE_LONGUE && (w8.exs[0] || {}).note === NOTE_LONGUE, js({ prog: (dc8.note || '').length, seance: ((w8.exs[0] || {}).note || '').length }));
  });

  // ═══ B. L'HISTORIQUE NE REMPLACE PLUS LES PRESCRIPTIONS D'UN PROGRAMME IMPORTÉ À SON PREMIER USAGE ═══
  await section('B', async () => {
    const SET = (kg, reps, type, extra) => Object.assign({ kg, reps, type: type || 'N', done: true, rm1: 0, rest: 0 }, extra || {});
    /** Une séance DÉJÀ ENREGISTRÉE (l'historique de la personne) : `progId` / `progLabel` seulement si elle vient d'un programme. */
    const SEANCE = (date, exs, progId, progLabel) => Object.assign({ id: Date.parse(date), ts: Date.parse(date), date, exs, volume: 1000, synced: true, uniConv: 1 }, progId ? { progId, progLabel } : { progLabel: progLabel || 'Séance libre' });
    // l'historique de la personne : ses séances d'AVANT (autre programme), avec SES échauffements et SES séries de travail
    const HIST = [
      SEANCE('2026-11-08', [{ name: 'Développé Couché', sets: [SET(45, 6, 'É'), SET(65, 4, 'É'), SET(82.5, 3, 'É'), SET(97.5, 2), SET(97.5, 2), SET(97.5, 2)] }, { name: 'Squat à la Barre', sets: [SET(80, 3), SET(92.5, 3), SET(102.5, 3)] }, { name: 'Leg Curl Assis Machine', sets: [SET(55, 8), SET(55, 8), SET(55, 8)] }]),
      SEANCE('2026-11-01', [{ name: 'Développé Couché', sets: [SET(92.5, 3), SET(92.5, 3), SET(92.5, 3)] }])
    ];
    const DC_ECH = EX('Développé Couché - échauffement', [10, 5, 3, 1, 1], [0, 40, 60, 75, 80], NOTE_ECH, { kg: 80 });
    const DC_TRAV = EX('Développé Couché', [2, 3, 3], [85, 80, 80], NOTE_TRAV);
    const SQ = EX('Squat à la Barre', [3, 3, 3], [115, 107.5, 107.5], 'Une série lourde à 3 reps (RIR 1-2), puis deux séries plus légères à 3 reps.');
    const DC_SEC = EX('Développé Couché', [5, 5, 5], [70, 70, 70], 'Séance secondaire. RIR 3 environ.');
    const RIEN = EX('Leg Curl Assis Machine', [8, 8, 8], [], 'RIR 2. Charge adaptée.', { kg: 'Charge adaptée' });
    const P = prog([DC_ECH, DC_TRAV, SQ, RIEN], [DC_SEC]);
    await importer(P, { sessions: JSON.parse(JSON.stringify(HIST)) });
    const prog1 = await enregistrer();
    const idx = await pg.evaluate(() => S.programmes.length - 1);
    t('ICF-B00 ⛔ CONTRÔLE — l\'import pose `prescrit:true` sur le programme importé (et sur lui seul : le marqueur d\'un programme neuf)', prog1.prescrit === true && !!prog1.id, js({ prescrit: prog1.prescrit, id: prog1.id }));

    // B1 — PREMIER USAGE : les prescriptions du document font foi, malgré l'historique (le défaut observé : la dernière séance de l'exercice remplaçait charges ET répétitions du programme)
    const w1 = await charger(idx, 0);
    const dc = w1.exs[0], sq = w1.exs[1], rien = w1.exs[2];
    t('ICF-B01 ⭐⭐ 1ᵉʳ USAGE — les charges ET les répétitions du développé couché sont CELLES DU DOCUMENT (barre, 40, 60, 75, 80, puis 85×2 · 80×3 · 80×3), pas celles de l\'historique (97,5×2…)',
      dc.sets.map(s => s.kg).join(',') === '0,40,60,75,80,85,80,80' && dc.sets.map(s => s.reps).join(',') === '10,5,3,1,1,2,3,3', js({ kg: dc.sets.map(s => s.kg).join(','), reps: dc.sets.map(s => s.reps).join(',') }));
    t('ICF-B02 ⭐⭐ 1ᵉʳ USAGE — le squat prescrit « 115·107,5·107,5 » s\'ouvre en 115·107,5·107,5 (jamais 80·92,5·102,5 : le top set et les back-off ne sont pas remplacés par une autre méthode)',
      sq.sets.map(s => s.kg).join(',') === '115,107.5,107.5', sq.sets.map(s => s.kg).join(','));
    t('ICF-B03 ⭐ la barre « à vide » reste « à vide » à la séance (`vide`, 0 kg) — la charge d\'une série d\'historique ne la remplace pas', dc.sets[0].vide === true && dc.sets[0].kg === 0 && !dc.sets[1].vide, js(dc.sets.slice(0, 2)));
    t('ICF-B04 ⛔ une donnée NON PRESCRITE (« charge adaptée ») reste vide à la séance : rien n\'est écrit à la place de la personne (charge inconnue : null, pas un zéro) — sa suggestion est le grisé du champ',
      rien.sets.every(s => s.kg === null && !s.vide), js(rien.sets));
    const ph = await pg.evaluate(() => { const r = n => { const row = document.getElementById('sr-' + n); const i = row ? row.querySelectorAll('.sinp') : []; return { kg: i[1] ? i[1].placeholder : null, valeur: i[1] ? i[1].value : null }; };
      const a = { vide: r('0-0'), travail: r('0-5') }; _expandedEx = 2; renderExBlocks(); a.rien = r('2-0'); a.prevRien = document.querySelector('#sr-2-0 .sprev').textContent.replace(/\s+/g, ' ').trim(); _expandedEx = 0; renderExBlocks(); a.prevTravail = document.querySelector('#sr-0-5 .sprev').textContent.replace(/\s+/g, ' ').trim(); return a; });
    t('ICF-B05 ⭐ l\'HISTORIQUE RESTE VISIBLE dans la colonne « Précédent » (97,5 · 55) mais n\'est plus SUGGÉRÉ dans le champ de charge : il vient d\'une séance LIBRE, pas de ce jour de ce programme (arbitrage du 17/11/2026 — oracle RÉÉCRIT : il exigeait le grisé « 97.5 » / « 55 » ; l\'invariant « l\'historique reste visible » est gardé, « à vide » sur la barre aussi)',
      ph.vide.kg === 'à vide' && ph.travail.valeur === '85' && ph.travail.kg === '' && ph.rien.valeur === '' && ph.rien.kg === '' && /97[.,]5/.test(ph.prevTravail) && /55/.test(ph.prevRien), js(ph));
    const gp = await pg.evaluate(() => ({ prev: getPrev('Développé Couché').length, kg: getPrev('Développé Couché').map(s => s.kg).join(',') }));
    t('ICF-B06 ⛔ `getPrev` (la colonne « Précédent » et la feuille « 4 dernières séances ») lit toujours l\'historique, tous programmes confondus — inchangé', gp.prev === 6 && gp.kg === '45,65,82.5,97.5,97.5,97.5', js(gp));

    // B1bis — VALIDER d'un appui ✓ : la barre « à vide » s'enregistre à 0 kg (jamais `NaN` : le champ porte le TEXTE « à vide »), la suggestion grise d'une donnée non prescrite est reprise par l'appui (mécanisme de toutes les séries)
    const tap = await pg.evaluate(() => { toggleSet(0, 0); _expandedEx = 2; renderExBlocks(); toggleSet(2, 0); const a = S.wkt.exs[0].sets[0], b = S.wkt.exs[2].sets[0]; _expandedEx = 0; renderExBlocks();
      return { vide: { kg: a.kg, vide: !!a.vide, done: !!a.done, reps: a.reps }, rien: { kg: b.kg, vide: !!b.vide, done: !!b.done } }; });
    t('ICF-B16 ⭐ valider la barre « à vide » d\'un appui ✓ : 0 kg, `vide` conservé, jamais NaN ; valider la charge NON prescrite ne reprend RIEN d\'une séance libre (55) : elle reste inconnue (`null`) — arbitrage du 17/11/2026 (oracle RÉÉCRIT : il exigeait kg = 55, « le seul chemin par lequel l\'historique entre » ; l\'historique d\'une séance libre n\'entre plus par ✓, seul celui du même jour du même programme)',
      tap.vide.kg === 0 && tap.vide.vide === true && tap.vide.done === true && tap.vide.reps === 10 && tap.rien.kg === null && tap.rien.vide === false && tap.rien.done === true, js(tap));

    // B2 — un AUTRE jour du même programme : le développé couché SECONDAIRE ne reprend pas les séries lourdes du jour 1
    const w2 = await charger(idx, 1);
    t('ICF-B07 ⭐ le jour « couché secondaire » (70×5 ×3) s\'ouvre avec SA prescription, jamais avec le top set du développé couché lourd', w2.exs[0].sets.map(s => s.kg + 'x' + s.reps).join(',') === '70x5,70x5,70x5', w2.exs[0].sets.map(s => s.kg + 'x' + s.reps).join(','));

    // B3 — UNE FOIS LE JOUR 1 FAIT : ses adaptations volontaires (échauffement allégé, charge qui a bougé) se reprennent — de CE jour, pas d'un autre
    await pg.evaluate(([pid, lbl]) => {
      S.sessions.unshift({ id: 1763300000000, ts: 1763300000000, date: '2026-11-15', progId: pid, progLabel: lbl, exs: [{ name: 'Développé Couché', sets: [
        { kg: 0, reps: 10, type: 'É', done: true, vide: true }, { kg: 30, reps: 5, type: 'É', done: true }, { kg: 50, reps: 3, type: 'É', done: true }, { kg: 70, reps: 1, type: 'É', done: true }, { kg: 80, reps: 1, type: 'É', done: true },
        { kg: 87.5, reps: 2, type: 'N', done: true }, { kg: 82.5, reps: 3, type: 'N', done: true }, { kg: 82.5, reps: 3, type: 'N', done: true }] }], volume: 1, synced: true, uniConv: 1 });
      persist();
    }, [prog1.id, prog1.days[0].label]);
    const w3 = await charger(idx, 0);
    t('ICF-B08 ⭐⭐ PROGRAMME DÉJÀ SUIVI — la dernière séance DE CE JOUR reprend la main : les adaptations volontaires (échauffements 30·50·70, top set 87,5) se reprennent, comme avant',
      w3.exs[0].sets.map(s => s.kg).join(',') === '0,30,50,70,80,87.5,82.5,82.5', w3.exs[0].sets.map(s => s.kg).join(','));
    t('ICF-B09 ⛔ … mais le squat du MÊME jour, absent de cette séance, garde sa prescription (115·107,5·107,5), pas l\'historique d\'un autre programme', w3.exs[1].sets.map(s => s.kg).join(',') === '115,107.5,107.5', w3.exs[1].sets.map(s => s.kg).join(','));
    const w4 = await charger(idx, 1);
    t('ICF-B10 ⭐ le JOUR 3 (couché secondaire) n\'est pas « suivi » parce que le jour 1 l\'est : il garde sa prescription (70×5)', w4.exs[0].sets.map(s => s.kg + 'x' + s.reps).join(',') === '70x5,70x5,70x5', w4.exs[0].sets.map(s => s.kg + 'x' + s.reps).join(','));

    // B3bis — une séance d'un AUTRE programme (progId différent) qui porte le MÊME libellé de jour ne rend pas ce jour « déjà suivi »
    await pg.evaluate(([lbl]) => { S.sessions.unshift({ id: 1763400000000, ts: 1763400000000, date: '2026-11-16', progId: 'p-autre-programme', progLabel: lbl, exs: [{ name: 'Développé Couché', sets: [{ kg: 100, reps: 2, type: 'N', done: true }, { kg: 100, reps: 2, type: 'N', done: true }, { kg: 100, reps: 2, type: 'N', done: true }] }], volume: 1, synced: true, uniConv: 1 }); persist(); }, [prog1.days[1].label]);
    const w4b = await charger(idx, 1);
    t('ICF-B15 ⛔ une séance d\'un AUTRE programme qui porte le même libellé de jour ne rend pas ce jour « déjà suivi » : la prescription (70×5) reste', w4b.exs[0].sets.map(s => s.kg + 'x' + s.reps).join(',') === '70x5,70x5,70x5', w4b.exs[0].sets.map(s => s.kg + 'x' + s.reps).join(','));

    // B4 — UN PROGRAMME D'AVANT (sans `prescrit`) — RÉÉCRIT LE 16/11/2026 (lot 1 « contre-expertise », D-163, sondes H02/H03) : il suit la MÊME règle que tous les programmes (1ᵉʳ usage = SA prescription) ; aucune migration (aucun `prescrit` ajouté), aucun changement rétroactif de l'historique
    await pg.evaluate(([hist]) => {
      S.sessions = hist; S.programmes.push({ id: 'p-ancien', name: 'Programme ancien', weeks: 0, startDate: null, days: [{ label: 'Jour A', exs: [{ name: 'Développé Couché', note: '', sets: [{ kg: 60, reps: 8, type: 'N', rest: 0 }, { kg: 60, reps: 8, type: 'N', rest: 0 }] }] }] }); persist();
    }, [JSON.parse(JSON.stringify(HIST))]);
    const w5 = await charger(await pg.evaluate(() => S.programmes.length - 1), 0);
    /* AVANT : « la dernière séance de l'exercice REMPLACE toujours la valeur du programme (60×8 → 97,5) » — c'est exactement le défaut H02/H03 de la contre-expertise (la charge d'un AUTRE contexte remplaçait la prescription au 1ᵉʳ usage). Invariant gardé : rien n'est migré
       ni réécrit (B12/B13) ; ce qui change : la prescription du programme (60×8) fait foi, l'historique des autres contextes reste VISIBLE (colonne « Précédent », grisé). */
    t('ICF-B11 ⭐⭐ D-163 — PROGRAMME D\'AVANT (sans `prescrit`) : au 1ᵉʳ usage, SA prescription fait foi (60×8), jamais la dernière séance de l\'exercice d\'un autre contexte (97,5) ; rien n\'est migré', w5.exs[0].sets.map(s => s.kg).join(',') === '60,60' && w5.exs[0].sets.map(s => s.reps).join(',') === '8,8', js(w5.exs[0].sets.map(s => s.kg + 'x' + s.reps)));
    t('ICF-B12 ⛔ ce programme n\'a aucun `progId` posé par erreur ni `prescrit` ajouté (rien n\'est réécrit)', !(await pg.evaluate(() => S.programmes[S.programmes.length - 1].prescrit)), '');

    // B5 — la séance ENREGISTRÉE sait de quel programme elle vient (c'est ce qui distingue un 1ᵉʳ usage d'un programme suivi) ; l'historique n'est jamais modifié
    const avant = await pg.evaluate(() => JSON.stringify(S.sessions));
    await charger(idx, 0);
    const apres = await pg.evaluate(() => JSON.stringify(S.sessions));
    t('ICF-B13 ⛔ ouvrir une séance ne modifie AUCUNE séance de l\'historique (aucun changement rétroactif)', avant === apres, '');
    const fin = await pg.evaluate(([i]) => { S.wkt = null; _loadProgDayVraiment(i, 1); S.wkt.exs.forEach(e => e.sets.forEach(s => { s.done = true; })); const n0 = S.sessions.length; try { finishWorkout(); } catch (e) { return { err: String(e && e.message || e) }; } return { n0, n1: S.sessions.length, progId: (S.sessions[0] || {}).progId, label: (S.sessions[0] || {}).progLabel }; }, [idx]);
    t('ICF-B14 ⭐ la séance terminée porte le `progId` du programme et le libellé du jour (la base du « déjà suivi »)', fin.progId === prog1.id && fin.label === prog1.days[1].label, js(fin));

    // B6 — L'ÉDITEUR ne retire pas `prescrit` : ouvrir un programme importé puis « Enregistrer » sans rien changer le laisse PRESCRIT (sinon l'historique reprendrait la main dès son 1ᵉʳ usage)
    await importer(P, { sessions: JSON.parse(JSON.stringify(HIST)) });
    await enregistrer(); const iE = await pg.evaluate(() => S.programmes.length - 1);
    const ed = await pg.evaluate(([i]) => { const av = JSON.parse(JSON.stringify(S.programmes[i])); editProg(i); saveProgEdit(); const ap = S.programmes[i];
      const sets = p => JSON.stringify((p.days || []).map(d => (d.exs || []).map(e => e.sets))); return { prescrit: ap.prescrit, memeId: ap.id === av.id, memesSeries: sets(av) === sets(ap) }; }, [iE]);
    const wE = await charger(iE, 0);
    t('ICF-B17 ⭐ ouvrir un programme importé dans l\'ÉDITEUR puis « Enregistrer » sans rien changer le garde PRESCRIT (même id, mêmes séries, `vide` compris) : à son 1ᵉʳ usage il se joue encore comme le document l\'écrit',
      ed.prescrit === true && ed.memeId && ed.memesSeries && KG(wE.exs[0]) === '0,40,60,75,80,85,80,80' && wE.exs[0].sets[0].vide === true, js({ ed, kg: KG(wE.exs[0]) }));

    // B7 — « Sauvegarder comme programme » (`saveAsProg`) est le SEUL copieur de séries d'une séance vers un programme : un champ qu'il ne recopie pas est un champ SUPPRIMÉ (R4)
    const longue = 'Consigne de coach, RIR 2, repos 4-5 min. '.repeat(14);   // ≈ 570 caractères
    const sp = await pg.evaluate(([n]) => { S.programmes = []; S.wkt = { date: today(), progLabel: 'Jour', exs: [{ name: 'Développé Couché', note: n, sets: [
      { kg: 0, reps: 10, type: 'É', done: true, vide: true, rest: 60 }, { kg: 60, reps: 5, type: 'É', done: true, rest: 90, restTxt: '45-90 s' }, { kg: 85, reps: 2, type: 'N', done: true, rest: 240 }] }] };
      document.getElementById('prog-name-inp').value = 'Programme sauvé'; saveAsProg(); return JSON.parse(JSON.stringify(S.programmes[S.programmes.length - 1])); }, [longue]);
    const e0 = (sp.exs || [])[0] || { sets: [{}, {}, {}] };
    t('ICF-B18 ⭐ « Sauvegarder comme programme » recopie « à vide » et la consigne de repos écrite, et ne coupe plus la consigne à 300 caractères (570 gardés en entier)',
      e0.sets[0].vide === true && e0.sets[0].kg === 0 && !e0.sets[1].vide && e0.sets[1].restTxt === '45-90 s' && !('restTxt' in e0.sets[2]) && e0.note === longue, js({ vide: e0.sets.map(s => !!s.vide), restTxt: e0.sets.map(s => s.restTxt || null), note: (e0.note || '').length }));
  });

  // ═══ F. LE REMPLACEMENT : aucune présélection, cible choisie EXPLICITEMENT, début de cycle dit et conservé ═══
  await section('F', async () => {
    const { jourParis } = require('../_jour.js');   // 21/11/2026 : le jour de PARIS (le contexte tourne en Europe/Paris), pas celui de Greenwich — entre 00 h et 02 h les deux diffèrent
    const jour = (d) => jourParis(-d);
    const ancien = (id, nom, debut) => ({ id, name: nom, weeks: 8, startDate: debut, days: [{ label: 'SÉANCE 1', exs: [{ name: 'Squat à la Barre', note: 'ancienne note', sets: [{ kg: 60, reps: 5, type: 'N', rest: 0 }] }] }] });
    const DOC = (debut) => Object.assign(prog([EX('Squat à la Barre', [5, 5, 5], [100, 100, 100], 'RIR 2')]), { startDate: debut || '' });
    /** Importe `p` puis ouvre le mode « Remplacer » sur un compte à deux programmes HOMONYMES. */
    const ouvrirRemplacer = async (p, progs) => {
      await importer(p, { programmes: progs });
      return pg.evaluate(() => { _setImpMode('replace'); const sel = document.getElementById('imp-replace-sel'); return { valeur: sel.value, idx: sel.selectedIndex, options: [...sel.options].map(o => o.textContent.trim()), affiche: getComputedStyle(sel).display }; });
    };
    const A = ancien('p-aaa111', 'Programme Force', jour(14)), B = ancien('p-bbb222', 'Programme Force', null);
    const sel0 = await ouvrirRemplacer(DOC(''), [A, B]);
    t('ICF-F01 ⭐⭐ « Remplacer » : AUCUNE cible présélectionnée — la liste s\'ouvre sur « Choisir le programme à remplacer » (avant : le 1ᵉʳ programme était choisi d\'office)',
      sel0.valeur === '' && sel0.idx === 0 && /Choisir le programme à remplacer/.test(sel0.options[0] || '') && sel0.options.length === 3 && sel0.affiche !== 'none', js(sel0));
    const av = await pg.evaluate(() => JSON.stringify(S.programmes));
    const r2 = await pg.evaluate(() => { finalImportProg(); return { confirmation: document.getElementById('ov-confirm').classList.contains('open'), progs: JSON.stringify(S.programmes), toast: (document.getElementById('toast') || document.querySelector('.toast') || {}).textContent || '' }; });
    t('ICF-F02 ⭐⭐ sans cible choisie, l\'import est BLOQUÉ : aucun programme remplacé, AUCUN programme créé « par défaut », aucune confirmation, la raison est dite',
      r2.progs === av && !r2.confirmation && /Choisis d.abord le programme à remplacer/.test(r2.toast), js({ identique: r2.progs === av, confirmation: r2.confirmation, toast: r2.toast.slice(0, 80) }));

    // F3 — la cible choisie (un HOMONYME) est nommée sans ambiguïté dans la confirmation ; rien ne bouge avant « Remplacer »
    const c3 = await pg.evaluate(() => { const sel = document.getElementById('imp-replace-sel'); sel.value = '1'; finalImportProg(); return { ouvert: document.getElementById('ov-confirm').classList.contains('open'), msg: document.getElementById('confirm-msg').textContent, progs: JSON.stringify(S.programmes) }; });
    t('ICF-F03 ⭐ la confirmation NOMME la cible choisie parmi deux homonymes (n° bbb222, pas aaa111) ; rien n\'est remplacé avant le « Remplacer » final', c3.ouvert && /n°bbb222/.test(c3.msg) && !/n°aaa111/.test(c3.msg) && c3.progs === av, js({ msg: c3.msg.slice(0, 220) }));
    t('ICF-F04 ⭐ la confirmation DIT le sort du début de cycle (ici : le programme remplacé n\'en a pas)', /Sans date de début/.test(c3.msg), c3.msg.slice(-160));
    const ap3 = await pg.evaluate(() => { confirmOk(); return JSON.parse(JSON.stringify(S.programmes)); });
    t('ICF-F05 ⭐ après la confirmation : SEUL le programme choisi (l\'homonyme n°bbb222) est remplacé ; l\'autre est strictement inchangé ; aucun programme en plus',
      ap3.length === 2 && JSON.stringify(ap3[0]) === JSON.stringify(A) && ap3[1].id !== 'p-bbb222' && ap3[1].days.length === 1 && ap3[1].prescrit === true, js({ n: ap3.length, ids: ap3.map(p => p.id) }));

    // F6 — le cycle ACTIF du programme remplacé est CONSERVÉ quand le nouveau document n'écrit pas de date, et la confirmation le dit
    await ouvrirRemplacer(DOC(''), [JSON.parse(JSON.stringify(A)), JSON.parse(JSON.stringify(B))]);
    const c6 = await pg.evaluate(() => { document.getElementById('imp-replace-sel').value = '0'; finalImportProg(); const msg = document.getElementById('confirm-msg').textContent; confirmOk(); return { msg, p: JSON.parse(JSON.stringify(S.programmes[0])) }; });
    t('ICF-F06 ⭐⭐ REMPLACER UN PROGRAMME ACTIF : le début de cycle du programme remplacé est CONSERVÉ (le document n\'en écrit pas) et la confirmation le dit', c6.p.startDate === A.startDate && /conservé/.test(c6.msg), js({ debut: c6.p.startDate, attendu: A.startDate, msg: c6.msg.slice(-150) }));
    // F7 — une date ÉCRITE par le document (valable) l'emporte ; et la confirmation le dit
    await ouvrirRemplacer(DOC(jour(3)), [JSON.parse(JSON.stringify(A)), JSON.parse(JSON.stringify(B))]);
    const c7 = await pg.evaluate(() => { document.getElementById('imp-replace-sel').value = '0'; finalImportProg(); const msg = document.getElementById('confirm-msg').textContent; confirmOk(); return { msg, p: JSON.parse(JSON.stringify(S.programmes[0])) }; });
    t('ICF-F07 la date de début ÉCRITE par le nouveau document (valable) l\'emporte sur celle du programme remplacé, et la confirmation le dit', c7.p.startDate === jour(3) && /écrit dans le document/.test(c7.msg), js({ debut: c7.p.startDate, msg: c7.msg.slice(-120) }));
    // F8 — un cycle DÉJÀ TERMINÉ n'est pas une date : rien n'est inventé, la confirmation le dit
    const VIEUX = ancien('p-ccc333', 'Programme Force', jour(200));
    await ouvrirRemplacer(DOC(''), [VIEUX, JSON.parse(JSON.stringify(B))]);
    const c8 = await pg.evaluate(() => { document.getElementById('imp-replace-sel').value = '0'; finalImportProg(); const msg = document.getElementById('confirm-msg').textContent; confirmOk(); return { msg, p: JSON.parse(JSON.stringify(S.programmes[0])) }; });
    t('ICF-F08 ⛔ un cycle déjà TERMINÉ n\'est pas conservé (on n\'invente pas une date) : le nouveau programme est sans date, et la confirmation l\'a dit', !c8.p.startDate && /ne peut pas être gardé/.test(c8.msg), js({ debut: c8.p.startDate, msg: c8.msg.slice(-170) }));
    // F9 — « Nouveau » n'a besoin d'aucune cible : le programme est ajouté, rien n'est remplacé
    await importer(DOC(''), { programmes: [JSON.parse(JSON.stringify(A))] });
    const c9 = await pg.evaluate(() => { _setImpMode('new'); finalImportProg(); return JSON.parse(JSON.stringify(S.programmes)); });
    t('ICF-F09 ⛔ « Nouveau » est inchangé : le programme est AJOUTÉ (2 programmes), l\'ancien intact', c9.length === 2 && JSON.stringify(c9[0]) === JSON.stringify(A), js({ n: c9.length }));
  });

  // ═══ G. D1 / D4 (nuit du 15 au 16/11/2026) — l'IDENTITÉ d'un jour, la charge PRÉCÉDENTE inconnue, et la chaîne jusqu'au SERVEUR, à la RESTAURATION et à MILO ═══
  await section('G', async () => {
    // G1 — D1 : DEUX JOURS d'un même programme portent le MÊME libellé (un lundi lourd, un jeudi léger) — l'identité d'un jour n'est que son libellé : on ne choisit pas à la place du document
    const LOURD = EX('Développé Couché', [3, 3, 3], [100, 95, 95], 'Jour lourd. RIR 1.');
    const LEGER = EX('Développé Couché', [12, 12, 12], [60, 60, 60], 'Jour léger. RIR 3.');
    const BAS = EX('Squat à la Barre', [5, 5, 5], [120, 120, 120], 'RIR 2.');
    const PG = { name: 'Programme fictif lourd-léger', weeks: 4, startDate: '', days: [{ label: 'HAUT DU CORPS', exercises: [LOURD] }, { label: 'BAS DU CORPS', exercises: [BAS] }, { label: 'HAUT DU CORPS', exercises: [LEGER] }] };
    await importer(PG); await enregistrer();
    const iG = await pg.evaluate(() => S.programmes.length - 1);
    /** Fait le jour `j` (les séries validées, `aj` = [[exercice, série, charge]] des ajustements de la personne) puis enregistre la séance. */
    const fait = (j, aj) => pg.evaluate(async ([i, j, aj]) => { S.wkt = null; _loadProgDayVraiment(i, j); (aj || []).forEach(([ei, si, kg]) => { S.wkt.exs[ei].sets[si].kg = kg; }); S.wkt.exs.forEach(e => e.sets.forEach(s => { s.done = true; })); await finishWorkout(); return S.sessions[0].progLabel; }, [iG, j, aj || null]);   // `await` : `finishWorkout` garde `_finishing` jusqu'à la fin de son envoi — une 2ᵉ séance lancée avant serait ignorée (le garde anti double-appui)
    const l0 = await charger(iG, 0);
    t('ICF-G00 ⛔ CONTRÔLE — le jour lourd s\'ouvre avec SA prescription (100 · 95 · 95 × 3) : la suite part d\'un état sain', KG(l0.exs[0]) === '100,95,95' && REPS(l0.exs[0]) === '3,3,3', js({ kg: KG(l0.exs[0]), reps: REPS(l0.exs[0]) }));
    await fait(0, [[0, 0, 97.5]]);                                         // le lundi lourd est FAIT, avec un ajustement (97,5)
    const l2 = await charger(iG, 2);
    t('ICF-G01 ⭐⭐ D1 — DEUX JOURS AU MÊME LIBELLÉ ne se confondent pas : faire le lundi lourd ne rend pas le jeudi léger « déjà suivi » — il s\'ouvre avec SA prescription (60 × 12 ×3), jamais avec la séance lourde (97,5 · 95 · 95 × 3)',
      KG(l2.exs[0]) === '60,60,60' && REPS(l2.exs[0]) === '12,12,12' && l2.exs[0].note === 'Jour léger. RIR 3.', js({ kg: KG(l2.exs[0]), reps: REPS(l2.exs[0]), note: l2.exs[0].note }));
    const l0b = await charger(iG, 0);
    /* ⚠️ RÉÉCRIT LE 16/11/2026 (D-163, décision de Michel — « jours homonymes enfin distinguables »). Ce témoin figeait la PRUDENCE de la nuit du 15 au 16 (deux jours au même libellé : aucun n'est « suivi », le lourd garde sa
       prescription même une fois fait — `D-163 PROPOSÉE`). L'identité stable d'un jour (`progDayId`) rend les deux jours distinguables : le lundi lourd, une fois fait, reprend SA séance. Les séances d'AVANT l'identifiant,
       elles, gardent la prudence (témoin `SCHIS-I09`). L'invariant protégé ne change pas : jamais la séance d'un AUTRE jour (G01) ; il n'y a plus de raison de refuser SA propre séance. */
    t('ICF-G02 ⛔ D1 / D-163 — le jour lourd, une fois fait, reprend SA séance (97,5 · 95 · 95 × 3) et non plus sa prescription (100) : l\'identité du jour le distingue du jour léger au même libellé',
      KG(l0b.exs[0]) === '97.5,95,95' && REPS(l0b.exs[0]) === '3,3,3', js({ kg: KG(l0b.exs[0]), reps: REPS(l0b.exs[0]) }));
    await fait(1, [[0, 2, 125]]);                                           // un jour au libellé UNIQUE, fait avec un ajustement
    const l1 = await charger(iG, 1);
    t('ICF-G03 ⭐ D1 — un jour au libellé UNIQUE reste « suivi » comme avant : ses adaptations se reprennent (125 sur la dernière série) — la prudence ne tue pas le comportement', KG(l1.exs[0]) === '120,120,125', js({ kg: KG(l1.exs[0]), seances: await pg.evaluate(() => S.sessions.map(s => [s.progLabel, s.date, !!s.progId, s.exs.map(e => e.name + ':' + e.sets.map(x => x.kg).join('/')).join('+')])) }));

    // G4 — D4 : une charge PRÉCÉDENTE inconnue (`null` : champ vidé dans le détail d'une séance passée ; `undefined` ; NaN) ne s'écrit JAMAIS comme un mot
    const aff = await pg.evaluate(() => { const out = {};
      [['null', null], ['undefined', undefined], ['NaN', NaN], ['zéro', 0], ['60', 60]].forEach(([nom, kg]) => {
        const set = { reps: 8, type: 'N', done: true }; if (kg !== undefined) set.kg = kg;
        S.sessions = [{ id: 1763000000000, ts: 1763000000000, date: '2026-11-01', progLabel: 'Séance libre', exs: [{ name: 'Développé Couché', sets: [set] }], volume: 1, synced: true, uniConv: 1 }]; persist();
        S.wkt = { date: today(), progLabel: 'Séance libre', exs: [{ name: 'Développé Couché', note: '', sets: [{ kg: 0, reps: 8, type: 'N', done: false, rm1: 0, rest: 90 }] }], startHour: 10 };
        _expandedEx = 0; renderExBlocks();
        const row = document.getElementById('sr-0-0'), inp = row.querySelectorAll('.sinp');
        out[nom] = { prec: ((row.querySelector('.sprev-n') || {}).textContent || '').trim(), ph: inp[1].placeholder }; });
      return out; });
    const mot = /null|undefined|NaN/;
    t('ICF-G04 ⭐⭐ D4 — une charge précédente INCONNUE (null · undefined · NaN) s\'affiche « ? » dans « Précédent » et ne met AUCUNE suggestion dans le champ : jamais « 8×null », « undefined » ni « NaN » à l\'écran (la jumelle du correctif du 01/09/2026, qui n\'avait protégé que le détail de séance)',
      ['null', 'undefined', 'NaN'].every(k => aff[k].prec === '8×?' && aff[k].ph === '' && !mot.test(aff[k].prec + aff[k].ph)), js(aff));
    t('ICF-G05 ⛔ … et rien d\'autre ne change : une charge précédente de 60 s\'affiche « 8×60 » et se propose en grisé (60) ; un 0 (série validée sans charge) reste un 0 — l\'affichage n\'en décide pas',
      aff['60'].prec === '8×60' && aff['60'].ph === '60' && aff['zéro'].prec === '8×0' && aff['zéro'].ph === '0', js({ soixante: aff['60'], zero: aff['zéro'] }));

    // G6/G7 — D4 : UNE séance de bout en bout avec une charge INCONNUE (« charge adaptée ») et une barre « à vide » : Milo, le serveur (le VRAI Code.js), la restauration
    await importer(prog([EX('Leg Curl Assis Machine', [10, 10, 10], [], 'RIR 2', { kg: 'Charge adaptée' }), EX('Squat à la Barre', [10, 5, 5], ['Barre', 40, 60], 'RIR 2')]));
    const pD4 = await enregistrer();
    const ctx = await pg.evaluate(async (id) => { const i = S.programmes.findIndex(p => p.id === id); S.sessions = []; S.prs = {}; S.wkt = null; _loadProgDayVraiment(i, 0); S.wkt.exs.forEach(e => e.sets.forEach(s => { s.done = true; })); await finishWorkout();
      let c = ''; try { c = String(buildCoachContext() || ''); } catch (e) { c = 'ERR ' + e.message; } return c; }, pD4.id);
    const mSess = /Leg Curl Assis Machine: S1 \?×10 · S2 \?×10 · S3 \?×10/.test(ctx), mZero = /Leg Curl Assis Machine: S1 0/.test(ctx), mKg0 = /(^|[^0-9.,])0 ?kg|@0/.test(ctx.split('\n').filter(l => /Leg Curl Assis Machine/.test(l) && !/^- (Haltères|Barre|Machines|Élastique|TRX|Poids)/.test(l)).join('\n')), mProg = /Leg Curl Assis Machine 3×10(?! @)/.test(ctx);
    t('ICF-G06 ⭐⭐ D4 — MILO reçoit « ? » pour une charge inconnue (« S1 ?×10 · S2 ?×10 · S3 ?×10 ») : jamais « 0×10 », ni « 0 kg », ni « @0kg » dans ses programmes ni dans ses séances',
      mSess && !mZero && !mKg0 && mProg, js({ seance: mSess, zeroAffiche: mZero, motif0kg: mKg0, programme: mProg, extrait: (ctx.match(/[^\n]{0,70}Leg Curl Assis Machine[^\n]{0,90}/) || [''])[0] }));
    POSTS.length = 0;
    await pg.evaluate(() => { S.email = 'icf@example.test'; S.url = DEFAULT_URL; window._demoMode = false; });
    await pg.evaluate(() => { try { _cloudSync(); } catch (e) {} }); await pg.waitForTimeout(1200);
    // l'état de l'app APRÈS l'envoi : `_cloudSync` pose `synced:true` sur les séances qu'elle envoie — c'est cet état-là que le serveur doit rendre
    const etatApp = await pg.evaluate(() => ({ programmes: JSON.parse(JSON.stringify(S.programmes)), sessions: JSON.parse(JSON.stringify(S.sessions)) }));
    const corps = POSTS.slice().reverse().find(c => c && c.action === 'saveProfile');
    const { serveur } = require('./nut_secu_p1.js');                       // le VRAI Code.js (vm Node, services Google simulés) — jamais un serveur réécrit pour le test
    const X = serveur({}); const EM = 'icf@example.test';
    let lu = {}, rep = {};
    if (corps) { X.compte(EM); corps.email = EM; rep = X.post(corps); lu = X.lireCompte(EM) || {}; }
    const sansSynced = a => JSON.parse(JSON.stringify(a || null, (k, v) => k === 'synced' ? undefined : v));   // `synced` = l'accusé de transport (posé APRÈS l'envoi), pas une donnée de la personne
    const egal = (a, b) => JSON.stringify(sansSynced(a)) === JSON.stringify(sansSynced(b));
    const diff = (a, b) => { const A = JSON.stringify(a || []), B = JSON.stringify(b || []); let i = 0; while (i < A.length && A[i] === B[i]) i++; return 'à ' + i + ' : app « ' + A.slice(Math.max(0, i - 30), i + 50) + ' » · serveur « ' + B.slice(Math.max(0, i - 30), i + 50) + ' »'; };
    const aVide = o => JSON.stringify(o || {}).includes('"vide":true');
    t('ICF-G07 ⭐⭐ D4 — la SYNCHRONISATION (le vrai corps de `_cloudSync`, le vrai `Code.js`) rend EXACTEMENT ce qu\'elle a reçu : programmes et séances identiques, `prescrit`, `progId` et « à vide » (programme ET séance) conservés — aucun champ supprimé par un copieur (R4)',
      !!corps && (rep.j || {}).status === 'ok' && egal(lu.programmes, etatApp.programmes) && egal(lu.sessions, etatApp.sessions) && (lu.programmes || [])[0].prescrit === true
      && !!((lu.sessions || [])[0] || {}).progId && aVide(lu.programmes) && aVide(lu.sessions), js({ corps: !!corps, statut: (rep.j || {}).status, progs: egal(lu.programmes, etatApp.programmes), seances: egal(lu.sessions, etatApp.sessions), videP: aVide(lu.programmes), videS: aVide(lu.sessions), ecart: egal(lu.sessions, etatApp.sessions) ? null : diff(etatApp.sessions, lu.sessions) }));
    const rest = await pg.evaluate((cmp) => { S.programmes = []; S.sessions = []; S.prs = {}; persist();
      try { _applyRestoreData(Object.assign({}, cmp, { profile: Object.assign({ name: 'Testeur', bw: 80, age: 35, gender: 'H', goal: 'force' }, cmp.profile || {}) })); } catch (e) { return { err: String(e && e.message || e) }; }
      return { programmes: JSON.parse(JSON.stringify(S.programmes)), sessions: JSON.parse(JSON.stringify(S.sessions)) }; }, lu);
    t('ICF-G08 ⭐ D4 — la RESTAURATION (`_applyRestoreData`) reprend ce que le serveur a gardé : mêmes programmes, mêmes séances (`vide`, `prescrit`, `progId` compris), rattachées l\'une à l\'autre', !rest.err && egal(rest.programmes, etatApp.programmes) && egal(rest.sessions, etatApp.sessions) && ((rest.sessions || [])[0] || {}).progId === ((rest.programmes || [])[0] || {}).id, js({ err: rest.err || null, progs: egal(rest.programmes, etatApp.programmes), seances: egal(rest.sessions, etatApp.sessions) }));
  });

  // ═══ H. D1 — LA CHAÎNE, CHAMP PAR CHAMP : ce que le document prescrit arrive IDENTIQUE à chaque étape (programme · éditeur · séance chargée · séance enregistrée) ═══
  await section('H', async () => {
    // Un document riche (données fictives) : échauffements (barre à vide + charges), séries de travail et back-off, fourchettes de reps et de charge, poids du corps, repos écrits (dont une plage), un superset, deux jours.
    const RICH = { name: 'Programme fictif riche', weeks: 6, startDate: '', days: [
      { label: 'JOUR RICHE A', exercises: [
        EX('Développé Couché - échauffement', [10, 5, 3], [0, 40, 60], 'Échauffement progressif.', { restPerSet: ['45-90 s', '1 min', '90 s'] }),
        EX('Développé Couché', [5, 5, 5, 8], [80, 80, 80, 70], 'Série lourde, puis un back-off. RIR 1-2.', { rest: '3 min' }),
        EX('Rowing Poitrine Appuyée', ['8-10', '8-10', '8-10'], [], 'Tempo contrôlé.', { kg: '44-48 kg', rest: '90 s' }),
        EX('Traction', [8, 8, 6], [0, 0, 0], 'Poids du corps.', { rest: '2 min' })] },
      { label: 'JOUR RICHE B', exercises: [
        EX('Squat à la Barre - échauffement', [8, 5], ['Barre', 60], '', {}),
        EX('Squat à la Barre', [5, 5, 5], [100, 100, 100], 'RIR 2.', { rest: '3 min' }),
        EX('Curl Marteau', [12, 12], [14, 14], 'Superset avec le triceps.', { supersetGroup: 'A' }),
        EX('Extension Triceps Poulie', [12, 12], [20, 20], '', { supersetGroup: 'A' })] }] };
    await importer(RICH);
    const pr = await enregistrer(); const ir = await pg.evaluate(() => S.programmes.length - 1);
    /** La FORME d'une ligne, avec TOUS les champs qu'un document prescrit : nombre de séries, type, charge, « à vide », reps, repos (+ sa consigne écrite), « max », superset, commentaire. */
    const forme = e => ({ n: e.name, note: e.note || '', g: e.group || '', s: (e.sets || []).map(s => [s.type, s.kg, !!s.vide, s.reps, s.rest, s.restTxt || '', !!s.maxi].join('|')) });
    const attendu = pr.days.map(d => d.exs.map(forme));
    const a0 = attendu[0][0];   // le développé couché du jour A : 3 échauffements + 4 séries de travail fusionnés en UNE ligne
    t('ICF-H00 ⛔ CONTRÔLE — la ligne « développé couché » du jour A porte 7 séries ÉÉÉNNNN (3 échauffements fusionnés + 4 de travail), la barre « à vide » en 1ʳᵉ, un repos écrit en plage : l\'état de départ n\'est pas vide',
      a0.s.length === 7 && a0.s.map(x => x.split('|')[0]).join('') === 'ÉÉÉNNNN' && a0.s[0].split('|')[2] === 'true' && a0.s[0].split('|')[5] !== '', js(a0));
    // H1 — l'ÉDITEUR : ouvrir puis « Enregistrer » sans rien changer ne bouge AUCUN champ
    const apresEd = await pg.evaluate(([i]) => { editProg(i); saveProgEdit(); return JSON.parse(JSON.stringify(S.programmes[i])); }, [ir]);
    t('ICF-H01 ⭐ D1 — programme → ÉDITEUR → programme : aucun champ ne bouge (séries, types, charges, « à vide », reps, repos et leur consigne, superset, commentaires — sur les deux jours)',
      JSON.stringify(apresEd.days.map(d => d.exs.map(forme))) === JSON.stringify(attendu), js({ avant: attendu[0][0], apres: apresEd.days[0].exs.map(forme)[0] }));
    // H2 — la SÉANCE chargée (1ᵉʳ usage) : exactement la prescription, l'historique de la personne n'y change rien (un historique DIFFÉRENT est posé exprès)
    const HIST2 = [{ id: 1763000000000, ts: 1763000000000, date: '2026-11-01', progLabel: 'Séance libre', exs: ['Développé Couché', 'Squat à la Barre', 'Traction', 'Curl Marteau'].map(n => ({ name: n, sets: [{ kg: 30, reps: 12, type: 'N', done: true }, { kg: 30, reps: 12, type: 'N', done: true }] })), volume: 1, synced: true, uniConv: 1 }];
    await pg.evaluate(([h]) => { S.sessions = h; persist(); }, [HIST2]);
    const charges = []; for (let d = 0; d < pr.days.length; d++) { const w = await charger(ir, d); charges.push(w.exs.map(forme)); }
    t('ICF-H02 ⭐⭐ D1 — programme → SÉANCE chargée : exactement la prescription du document, champ par champ, sur les deux jours — malgré un historique différent (30 × 12) — l\'historique reste visible, il ne remplace rien',
      JSON.stringify(charges) === JSON.stringify(attendu), js({ attendu: attendu[0][0], charge: charges[0] && charges[0][0] }));
    // H3 — la séance ENREGISTRÉE (toutes les séries validées) : les mêmes champs, rattachée au programme et au jour
    const rec = await pg.evaluate(async ([i]) => { S.wkt = null; _loadProgDayVraiment(i, 0); S.wkt.exs.forEach(e => e.sets.forEach(s => { s.done = true; })); await finishWorkout(); const se = S.sessions[0]; return JSON.parse(JSON.stringify({ exs: se.exs, progId: se.progId, progLabel: se.progLabel })); }, [ir]);
    t('ICF-H03 ⭐ D1 — SÉANCE enregistrée : les mêmes champs que ceux chargés (séries, types, charges, « à vide », reps, repos et consigne, commentaires), séries toutes validées, rattachée au programme et au jour',
      JSON.stringify(rec.exs.map(forme)) === JSON.stringify(attendu[0]) && rec.exs.every(e => e.sets.every(s => s.done === true)) && rec.progId === pr.id && rec.progLabel === 'JOUR RICHE A', js({ progId: rec.progId === pr.id, label: rec.progLabel }));
  });

  // ═══ I. ÉCHAUFFEMENTS — conservation exacte (étude des échauffements, nuit n°2) : une ligne de musculation n'est jamais prise pour du cardio (ses séries ne DISPARAISSENT pas), ni enregistrée avec une lettre hors N / É / X ═══
  await section('I', async () => {
    // I1 — le nom de BASE d'un échauffement connu par ÉQUIVALENCE (« Squat » = Squat à la Barre ; « Bench Press » = synonyme anglais), sans charge lisible et avec une DURÉE dans la note : reste un exercice
    await importer(prog([EX('Warm-up - Squat', [10], [], '10 min tranquille'), EX('Développé Couché', [5, 5], [80, 80], 'RIR 2')]));
    const dI1 = (await enregistrer()).days[0];
    t('ICF-I01 ⭐⭐ un échauffement « Warm-up - Squat » (nom de base connu par équivalence, aucune charge lisible, « 10 min tranquille » en note) reste un EXERCICE : ses séries ne disparaissent pas dans un bloc cardio',
      dI1.exs.length === 2 && !dI1.cardioAvant && !dI1.cardio && /Squat/.test(dI1.exs[0].name) && dI1.exs[0].sets.length === 1, js({ n: dI1.exs.length, noms: dI1.exs.map(e => e.name), avant: dI1.cardioAvant || null }));
    await importer(prog([EX('Bench Press - warm-up', [8], [], '5 min tranquille'), EX('Squat à la Barre', [5, 5], [100, 100], 'RIR 2')]));   // un AUTRE exercice derrière : rien à regrouper, l'échauffement est seul
    const dI1b = (await enregistrer()).days[0];
    t('ICF-I02 ⭐ … idem pour un synonyme anglais (« Bench Press - warm-up » + « 5 min tranquille »)', dI1b.exs.length === 2 && !dI1b.cardioAvant && !dI1b.cardio, js({ n: dI1b.exs.length, avant: dI1b.cardioAvant || null }));
    // I3 — une BARRE « à vide » est une charge : l'échauffement d'un exercice hors catalogue, barre seule, « 5 min tapis » en note, reste un exercice (la charge non lue valant 0, le garde sur la charge ne le voyait plus)
    await importer(prog([EX('Échauffement - Presse Zeta Prototype', [10], ['Barre'], '5 min tapis'), EX('Développé Couché', [5, 5], [80, 80], 'RIR 2')]));
    const dI3 = (await enregistrer()).days[0];
    t('ICF-I03 ⭐⭐ une BARRE « à vide » est une charge : « Échauffement - Presse Zeta Prototype » (barre seule, « 5 min tapis » en note) reste un exercice, à vide, et n\'est pas retiré au bloc cardio',
      dI3.exs.length === 2 && !dI3.cardioAvant && dI3.exs[0].sets.length === 1 && dI3.exs[0].sets[0].vide === true, js({ n: dI3.exs.length, avant: dI3.cardioAvant || null, sets: (dI3.exs[0] || {}).sets }));
    // I4 — CONTRÔLE : un VRAI cardio d'échauffement, sans charge, part toujours dans le bloc cardio (comportement conservé), et un nom inconnu sans marqueur ni barre ne change pas
    await importer(prog([EX('Échauffement', [1], [], '8 min vélo léger', { kg: 0 }), EX('Développé Couché', [5, 5], [80, 80], 'RIR 2')]));
    const dI4 = (await enregistrer()).days[0];
    t('ICF-I04 ⛔ CONTRÔLE — un vrai cardio (« Échauffement : 8 min vélo léger », sans charge ni barre) part toujours dans le bloc cardio : le garde n\'a pas viré à tout protéger', dI4.exs.length === 1 && !!dI4.cardioAvant, js({ n: dI4.exs.length, avant: dI4.cardioAvant || null }));
    // I5 — `setType:'W'` (ancien format) d'une ligne NON regroupée : enregistrée « É », jamais la lettre « W » (hors N / É / X)
    await importer(prog([EX('Presse Zeta Prototype', [8, 5], [60, 80], '', { setType: 'W' }), EX('Développé Couché', [5, 5], [80, 80], 'RIR 2')]));
    const pI5 = await enregistrer(); const e5 = pI5.days[0].exs[0] || { sets: [] };
    t('ICF-I05 ⭐ un échauffement `setType:"W"` (ancien format) NON regroupé s\'enregistre « É · É » — jamais la lettre « W » (hors N / É / X)', TYPES(e5) === 'ÉÉ' && !/"type":"W"/.test(JSON.stringify(pI5)), js({ types: TYPES(e5) }));
  });

  t('ICF-Z00 aucune erreur JavaScript pendant tout le banc', errs.length === 0, errs.slice(0, 3).join(' | '));
  await cx.close();
};
