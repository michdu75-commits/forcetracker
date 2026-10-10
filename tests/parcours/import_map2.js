/* ═══ B-IMAP2 (session-B). IMPORT-MAP-02 — LE MATÉRIEL SE LIT À SA PLACE (10/10/2026) ═══
   Suite d'IMPORT-MAP-01 / 01B, après l'audit du corpus externe, la conception validée et les décisions de Michel
   (P.1 Fentes = « les 3 » ; P.2 Tirage Menton, P.3 Tirage en Rack / Waiter Curl : différés ; P.4 « tirage horizontal » :
   ambigu, jamais AUTO). Trois défauts, un seul propriétaire, `_materielDe` :
   · P0-1 — une cible « Polyvalent » cachait le matériel que le catalogue écrit dans son nom anglais : « Lateral Raise
     (Cable) » devenait AUTOMATIQUEMENT les élévations latérales aux haltères (charges, séances, record compris) ;
   · P1-1 — « barre » est lu comme une charge libre même quand c'est la poignée d'une poulie (« Tirage vertical barre »
     perdait son AUTO juste vers Tirage Poulie Haute) ;
   · P1-2 — corde / rope / pushdown / EZ écrivent un matériel sans le nommer : D-053 demandait une confirmation à tort.
   CONDUIT : `_matchExercise` dans la vraie page ; la vraie chaîne d'import (`analyzeImportPhotos` avec une réponse du Worker
   simulée, `finalImportProg`, `_loadProgDayVraiment`) sur un historique réel, une charge DISTINCTE par exercice.
   OBSERVE : niveau (auto / confirm / new), cible, carte chargée, charges pré-remplies, séances précédentes, record.
   NE COUVRE PAS : le vocabulaire étranger, les fautes, les alias à cible fausse (P0-2), la qualité des suggestions (P1-3),
   les modificateurs (P1-4), Tirage Menton / Tirage en Rack / Waiter Curl (différés). ⛔ 0 appel réel.
   Les attendus sont des CIBLES nommées du catalogue (pas un vocabulaire recopié de l'app) : un témoin qui relirait la
   règle qu'il vérifie ne pourrait pas rougir. Banc : tools/banc_import_map2.js · contrôle négatif : tools/mut_import_map2.py */

const TPH = 'Tirage Poulie Haute (Lat Pulldown)', ELH = 'Élévations Latérales (Lateral Raise)', ELC = 'Élévations Latérales Câble';
const EFA = 'Extension Fessiers Arrière (Kickback)', KBM = 'Kickback Machine', TCP = 'Triceps Corde Poulie';
const CPEZ = 'Curl Pupitre Barre EZ (Larry Scott)', EFH = 'Élévations Frontales', EFC = 'Élévations Frontales Câble';
const RB = 'Rowing Barre (Tirage Horizontal)', RC = 'Rowing Câble (Tirage Horizontal)';

module.exports.ecran = async function (t, b, PORT) {
  const js = x => JSON.stringify(x).slice(0, 500);
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  let reels = 0;
  await cx.route(/supabase\.co|anthropic\.com/, r => { reels++; return r.abort(); });
  const L = (name) => ({ name, sets: 3, reps: 10, repsPerSet: [], kg: 0, kgPerSet: [], supersetGroup: '', setType: '', note: '' });
  // Jour 0 : les libellés visés ; jour 1 : les vrais exercices, qui doivent garder LEUR historique.
  const PROG = { name: 'Programme IMPORT-MAP-02', weeks: 0, startDate: '', days: [
    { label: 'Visés', exercises: ['Lateral Raise (Cable)', 'Machine Glute Kickbacks', 'Reverse Fly Machine', 'Oiseau sur poulie',
      'Tirage vertical barre', 'Triceps corde', 'EZ Preacher Curl'].map(L) },
    { label: 'Contrôle', exercises: ['Élévations latérales', 'Glute kickback', 'Rear delt fly', 'Rowing barre', 'Curl barre'].map(L) },
  ] };
  await cx.route(/workers\.dev|script\.google\.com/, async r => {
    let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
    if (c.action === 'importProgram') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: JSON.parse(JSON.stringify(PROG)) }) });
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
  });
  // Historique RÉEL : une charge distincte par exercice, pour reconnaître d'où vient chaque pré-remplissage.
  const KG = { [ELH]: 12, [ELC]: 8, [EFA]: 30, [KBM]: 50, 'Oiseau': 10, 'Machine Oiseau': 40, [TPH]: 70, [TCP]: 25, [CPEZ]: 35,
    [RB]: 100, 'Curl Barre': 45 };
  const ser = (kg, n) => Array.from({ length: n }, () => ({ kg, reps: 10, done: true, type: 'N', rm1: 0 }));
  const SESS = [{ id: 'imap2-1', date: '2026-10-02', exs: Object.keys(KG).map(n => ({ name: n, sets: ser(KG[n], 3) })) }];
  const PRS = {}; Object.keys(KG).forEach(n => { PRS[n] = { rm1: Math.round(KG[n] * 1.3), kg: KG[n], reps: 10, date: '2026-10-02' }; });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_imap2'))return; sessionStorage.setItem('_imap2','1'); localStorage.clear();
    const D={ft4_ob2:'1',ft4_name:'Testeur',ft4_premium:'true',ft4_guide_shown:'1',ft4_wn_seen:'999',
      ft4_sessions:${JSON.stringify(JSON.stringify(SESS))},ft4_prs:${JSON.stringify(JSON.stringify(PRS))}};
    Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2500);

  const NOMS = ['Tirage vertical barre', 'Tirage vertical à la barre', 'Tirage poitrine barre', 'Tirage nuque barre', 'Tirage barre nuque',
    'Tricep Rope Pushdown', 'Triceps corde', 'EZ Preacher Curl', 'Lateral Raise (Cable)', 'Cable Lat Raise', 'Reverse Fly Machine',
    'Oiseau sur poulie', 'Machine Glute Kickbacks', 'Élévations frontales poulie', 'Front raise cable', 'Pushdown barre', 'Pushdown barre EZ',
    'Rowing barre', 'Curl barre', 'Squat barre', 'Développé couché barre', 'Soulevé de terre barre', 'Hip thrust barre',
    'Tirage horizontal barre', 'Tirage vertical barre en V', 'Tirage vertical barre bras tendus', 'Tirage menton barre',
    'Leg curls couché', 'pull over', 'Pull Over', 'Chest Press declinee', 'Écarté incliné', 'Seated Wide Grip Row', 'Développé épaules',
    'Corde à sauter', 'Sauts à la corde', 'Jump rope', 'Battle rope', 'Band pushdown', 'Pull up bar', 'Parallel bar dips',
    'Hammer curl haltères', 'Tirage menton machine', 'Upright row machine', 'Glute kickback', 'Élévations latérales', 'Lateral raise',
    'Fentes avec haltères', 'Fentes haltères', 'Fentes barre', 'Lunges', 'Lat machine', 'Lat Pulldown', 'Triceps Rope Pushdown'];
  const M = await pg.evaluate(noms => { const o = {}; noms.forEach(n => { const r = _matchExercise(n) || {}; o[n] = { tier: r.tier, match: r.match || null, via: r.via || '', conf: r.confidence }; }); return o; }, NOMS);
  const auto = (n, c) => M[n].tier === 'auto' && M[n].match === c;
  const conf = (n, c) => M[n].tier === 'confirm' && M[n].match === c;
  const aff = n => n + ' → ' + M[n].tier + ' ' + M[n].match + ' [' + M[n].via + ' ' + M[n].conf + ']';
  const lot = L2 => js(L2.map(aff));

  console.log('\n═══ B-IMAP2-A (session-B). IMPORT-MAP-02 — cas visés (rouges avant le correctif) ═══');
  t('A ⭐ « Tirage vertical barre » (programme réel du 21 juin) → AUTO « Tirage Poulie Haute » : la barre est la poignée de la poulie',
    auto('Tirage vertical barre', TPH), aff('Tirage vertical barre'));
  t('B ⭐ « Tirage vertical à la barre » → AUTO « Tirage Poulie Haute »', auto('Tirage vertical à la barre', TPH), aff('Tirage vertical à la barre'));
  t('C ⭐ « Tirage poitrine barre » → AUTO « Tirage Poulie Haute »', auto('Tirage poitrine barre', TPH), aff('Tirage poitrine barre'));
  t('D ⭐ « Tirage nuque barre » et « Tirage barre nuque » → AUTO « Tirage Nuque »',
    auto('Tirage nuque barre', 'Tirage Nuque') && auto('Tirage barre nuque', 'Tirage Nuque'), lot(['Tirage nuque barre', 'Tirage barre nuque']));
  t('E ⭐ « Tricep Rope Pushdown » → AUTO « Triceps Corde Poulie » (rope + pushdown écrivent la poulie : plus de question D-053 à tort)',
    auto('Tricep Rope Pushdown', TCP), aff('Tricep Rope Pushdown'));
  t('F ⭐ « Triceps corde » (programmes réels du 2 et du 21 juin) → AUTO « Triceps Corde Poulie »', auto('Triceps corde', TCP), aff('Triceps corde'));
  t('G ⭐ « EZ Preacher Curl » → AUTO « Curl Pupitre Barre EZ (Larry Scott) » (EZ = barre)', auto('EZ Preacher Curl', CPEZ), aff('EZ Preacher Curl'));
  t('H ⛔⛔ « Lateral Raise (Cable) » n\'est jamais AUTO vers les élévations aux haltères — il rejoint « Élévations Latérales Câble »',
    !auto('Lateral Raise (Cable)', ELH) && auto('Lateral Raise (Cable)', ELC), aff('Lateral Raise (Cable)'));
  t('I ⛔⛔ « Cable Lat Raise » n\'est jamais AUTO vers les élévations aux haltères (ni vers une autre cible que la variante câble)',
    !auto('Cable Lat Raise', ELH) && (M['Cable Lat Raise'].tier !== 'auto' || M['Cable Lat Raise'].match === ELC), aff('Cable Lat Raise'));
  t('J ⛔⛔ « Reverse Fly Machine » n\'est jamais AUTO vers « Oiseau » (haltères)',
    !auto('Reverse Fly Machine', 'Oiseau') && (M['Reverse Fly Machine'].tier !== 'auto' || M['Reverse Fly Machine'].match === 'Machine Oiseau'), aff('Reverse Fly Machine'));
  t('J2 ⛔⛔ « Oiseau sur poulie » n\'est jamais AUTO vers « Oiseau » (haltères)',
    !auto('Oiseau sur poulie', 'Oiseau') && (M['Oiseau sur poulie'].tier !== 'auto' || M['Oiseau sur poulie'].match === 'Oiseau Poulie 45°'), aff('Oiseau sur poulie'));
  t('K ⛔⛔ « Machine Glute Kickbacks » n\'est jamais AUTO vers le kickback à la poulie — il rejoint « Kickback Machine »',
    !auto('Machine Glute Kickbacks', EFA) && auto('Machine Glute Kickbacks', KBM), aff('Machine Glute Kickbacks'));
  t('L ⛔⛔ « Élévations frontales poulie » et « Front raise cable » ne sont jamais AUTO vers la version haltères — ils rejoignent la variante câble',
    ['Élévations frontales poulie', 'Front raise cable'].every(n => !auto(n, EFH) && auto(n, EFC)), lot(['Élévations frontales poulie', 'Front raise cable']));
  t('A2 « Pushdown barre » retrouve la bonne suggestion (Triceps Poulie) ; « Pushdown barre EZ » aussi : la barre est la poignée',
    (conf('Pushdown barre', 'Triceps Poulie') || auto('Pushdown barre', 'Triceps Poulie')) && (conf('Pushdown barre EZ', 'Triceps Poulie') || auto('Pushdown barre EZ', 'Triceps Poulie')),
    lot(['Pushdown barre', 'Pushdown barre EZ']));

  console.log('\n═══ B-IMAP2-I (session-B). IMPORT-MAP-02 — invariants : la barre libre reste une barre libre ═══');
  const libres = [['Rowing barre', RB], ['Curl barre', 'Curl Barre'], ['Squat barre', 'Squat à la Barre'], ['Développé couché barre', 'Développé Couché'],
    ['Soulevé de terre barre', 'Soulevé de Terre'], ['Hip thrust barre', 'Hip Thrust Barre (Poussée de Hanche)']];
  t('I1 ⭐ Rowing / Curl / Squat / Développé couché / Soulevé de terre / Hip thrust « barre » → AUTO vers leur exercice à la BARRE LIBRE',
    libres.every(([n, c]) => auto(n, c)), js(libres.filter(([n, c]) => !auto(n, c)).map(([n]) => aff(n))));

  console.log('\n═══ B-IMAP2-Q (session-B). IMPORT-MAP-02 — cas ambigus : jamais d\'identité inventée ═══');
  t('Q1 ⛔ « Tirage horizontal barre » (ambigu, P.4) : jamais AUTO, ni vers Rowing Barre, ni vers Rowing Câble',
    M['Tirage horizontal barre'].tier !== 'auto', aff('Tirage horizontal barre'));
  t('Q2 « Tirage vertical barre en V » et « …bras tendus » : aucune fiche juste n\'existe → jamais AUTO',
    ['Tirage vertical barre en V', 'Tirage vertical barre bras tendus'].every(n => M[n].tier !== 'auto'), lot(['Tirage vertical barre en V', 'Tirage vertical barre bras tendus']));
  t('Q3 « Tirage menton barre » (P.2 différé) : jamais AUTO vers une autre cible que Tirage Menton',
    M['Tirage menton barre'].tier !== 'auto' || M['Tirage menton barre'].match === 'Tirage Menton', aff('Tirage menton barre'));

  console.log('\n═══ B-IMAP2-D (session-B). IMPORT-MAP-02 — D-053 inchangée : les confirmations voulues restent ═══');
  const d053 = [['Leg curls couché', 'Leg Curl Couché Machine'], ['pull over', 'Pull-over Haltère'], ['Pull Over', 'Pull-over Haltère'],
    ['Écarté incliné', 'Écarté Incliné Haltères'], ['Seated Wide Grip Row', 'Tirage Poulie Basse Prise Large'], ['Développé épaules', 'Développé Épaules Machine']];
  t('D1 ⭐ un nom SANS matériel vers une variante qui en écrit un reste une QUESTION (Leg curls couché, pull over ×2, Écarté incliné, Seated Wide Grip Row, Développé épaules)',
    d053.every(([n, c]) => conf(n, c)), js(d053.filter(([n, c]) => !conf(n, c)).map(([n]) => aff(n))));
  t('D2 « Chest Press declinee » (programme GPT) n\'est jamais AUTO (question voulue par D-053, ou rien)',
    M['Chest Press declinee'].tier !== 'auto', aff('Chest Press declinee'));
  t('D3 le nom anglais n\'entre pas dans D-053 : « Glute kickback », « Lateral raise », « Élévations latérales » restent AUTO vers la cible générique',
    auto('Glute kickback', EFA) && auto('Lateral raise', ELH) && auto('Élévations latérales', ELH), lot(['Glute kickback', 'Lateral raise', 'Élévations latérales']));

  console.log('\n═══ B-IMAP2-X (session-B). IMPORT-MAP-02 — ce que la règle ne doit PAS toucher ═══');
  const cardio = [['Corde à sauter', 'Sauts à la Corde'], ['Sauts à la corde', 'Sauts à la Corde'], ['Jump rope', 'Sauts à la Corde'], ['Battle rope', 'Battle Rope']];
  t('X1 les cordes de CARDIO restent du cardio (Corde à sauter, Sauts à la corde, Jump rope, Battle rope → AUTO juste)',
    cardio.every(([n, c]) => auto(n, c)), js(cardio.filter(([n, c]) => !auto(n, c)).map(([n]) => aff(n))));
  const corde = await pg.evaluate(() => [_materielDe('Corde à sauter', true), _materielDe('Sauts à la Corde', false), _materielDe('Battle rope', true)]);
  t('X2 le propriétaire ne déclare jamais une corde à sauter comme une poulie (`_materielDe`)', corde.every(m => m !== 'poulie'), js(corde));
  t('X3 un pushdown ÉLASTIQUE n\'est pas une poulie : « Band pushdown » garde sa suggestion « Extension Triceps Verticale Élastique »',
    conf('Band pushdown', 'Extension Triceps Verticale Élastique'), aff('Band pushdown'));
  t('X4 « bar » anglais n\'est pas un matériel : « Pull up bar » → Tractions, « Parallel bar dips » → Dips Triceps (AUTO)',
    auto('Pull up bar', 'Tractions (Pull-up)') && auto('Parallel bar dips', 'Dips Triceps (Buste Droit)'), lot(['Pull up bar', 'Parallel bar dips']));
  t('X5 le nom anglais n\'est jamais passé à `_exEquip` : « Hammer curl haltères » → AUTO « Marteau » (Polyvalent sans matériel anglais)',
    auto('Hammer curl haltères', 'Marteau'), aff('Hammer curl haltères'));
  t('X6 P.2 différé : le nom anglais d\'une cible dont la famille est connue n\'est pas lu — « Tirage menton machine », « Upright row machine » restent AUTO « Tirage Menton »',
    auto('Tirage menton machine', 'Tirage Menton') && auto('Upright row machine', 'Tirage Menton'), lot(['Tirage menton machine', 'Upright row machine']));
  const fentes = [['Fentes avec haltères', 'Fentes'], ['Fentes haltères', 'Fentes'], ['Fentes barre', 'Fentes'], ['Lunges', 'Fentes']];
  t('X7 ⭐ P.1 (Michel) : Fentes reste « les 3 » (barre, haltères, poids du corps) — Fentes avec haltères / haltères / barre / Lunges → AUTO « Fentes »',
    fentes.every(([n, c]) => auto(n, c)), js(fentes.filter(([n, c]) => !auto(n, c)).map(([n]) => aff(n))));
  const fen = await pg.evaluate(() => ({ en: (typeof EX_EN !== 'undefined' && EX_EN['Fentes']) || '', mat: _materielDe('Fentes', false) }));
  t('X8 P.1 (Michel) : le nom anglais de Fentes n\'écrit aucun matériel, et le garde-fou ne lui en prête aucun', !/barbell|dumbbell|cable|machine|smith/i.test(fen.en) && fen.mat === null, js(fen));
  t('X9 R8 : « Lat machine » → AUTO « Tirage Poulie Haute » (l\'alias déclaré reste le propriétaire de ce cas)',
    auto('Lat machine', TPH) && auto('Lat Pulldown', TPH) && auto('Triceps Rope Pushdown', TCP), lot(['Lat machine', 'Lat Pulldown', 'Triceps Rope Pushdown']));

  const prop = await pg.evaluate(() => ['Tirage menton barre', 'Upright row barre', 'Tirage horizontal barre', 'Lat machine', 'Tirage vertical barre', 'Triceps corde',
    'EZ Preacher Curl', 'Curl barre EZ', 'Pushdown barre EZ']
    .map(n => [n, _materielDe(n, true)]));
  const attProp = { 'Tirage menton barre': 'barre', 'Upright row barre': 'barre', 'Tirage horizontal barre': 'barre', 'Lat machine': 'machine', 'Tirage vertical barre': 'poulie', 'Triceps corde': 'poulie',
    'EZ Preacher Curl': 'barre', 'Curl barre EZ': 'barre', 'Pushdown barre EZ': 'poulie' };
  // La lecture est la même des deux côtés : une EZ lue « poignée » PARTOUT ne change aucun rattachement (mesuré, M6b).
  // Elle ne se protège donc qu'ici, chez le propriétaire — comme la corde à sauter (X2).
  t('X10 ⛔ le propriétaire `_materielDe` : « tirage menton » (P.2) et « tirage horizontal » (P.4) ne sont PAS des contextes de poulie (la barre reste une barre) ; « lat machine » n\'a pas de règle moteur (l\'alias en est propriétaire) ; l\'EZ est une barre, poignée seulement en contexte de poulie',
    prop.every(([n, m]) => m === attProp[n]), js(prop));

  console.log('\n═══ B-IMAP2-H (session-B). IMPORT-MAP-02 — historique par le VRAI chemin d\'import ═══');
  const H = await pg.evaluate(async () => {
    S.premium = true; _impPhotos = [{ type: 'text/plain', data: 'programme', name: 'prog.txt', isText: true }]; _impMode = 'new';
    await analyzeImportPhotos();
    finalImportProg();
    const iP = S.programmes.length - 1, prog = S.programmes[iP], jours = [];
    for (let d = 0; d < prog.days.length; d++) {
      S.wkt = null; try { _loadProgDayVraiment(iP, d); } catch (e) { jours.push({ err: e.message }); continue; }
      jours.push((S.wkt && S.wkt.exs || []).map(e => ({ name: e.name, kg: (e.sets || []).map(s => s.kg), prev: getPrev(e.name).map(s => s.kg), pr: !!(S.prs && S.prs[e.name]) })));
    }
    return { jours };
  });
  const J0 = H.jours[0] || [], J1 = H.jours[1] || [];
  const garde = (c, nom, kg) => !!c && c.name === nom && c.kg.length > 0 && c.kg.every(k => k === kg) && c.prev.length === 3 && c.prev.every(k => k === kg) && c.pr;
  const jamais = (c, nom, kg) => !!c && c.name !== nom && !c.kg.includes(kg) && !c.prev.includes(kg);
  t('H0 ⭐ témoins de mesure : les vrais exercices gardent LEUR historique (Élévations latérales 12 kg · Glute kickback 30 · Rear delt fly 10 · Rowing barre 100 · Curl barre 45)',
    garde(J1[0], ELH, 12) && garde(J1[1], EFA, 30) && garde(J1[2], 'Oiseau', 10) && garde(J1[3], RB, 100) && garde(J1[4], 'Curl Barre', 45), js(J1));
  t('H1 ⛔⛔ « Lateral Raise (Cable) » importé reprend l\'historique de la variante CÂBLE (8 kg), jamais celui des haltères (12 kg)',
    garde(J0[0], ELC, 8) && jamais(J0[0], ELH, 12), js(J0[0]));
  t('H2 ⛔⛔ « Machine Glute Kickbacks » reprend l\'historique de Kickback Machine (50 kg), jamais celui de la poulie (30 kg)',
    garde(J0[1], KBM, 50) && jamais(J0[1], EFA, 30), js(J0[1]));
  t('H3 ⛔⛔ « Reverse Fly Machine » ne reprend jamais l\'historique d\'Oiseau aux haltères (10 kg)', jamais(J0[2], 'Oiseau', 10) && !(J0[2] || {}).pr, js(J0[2]));
  t('H4 ⛔⛔ « Oiseau sur poulie » ne reprend jamais l\'historique d\'Oiseau aux haltères (10 kg)', jamais(J0[3], 'Oiseau', 10) && !(J0[3] || {}).pr, js(J0[3]));
  t('H5 ⭐ « Tirage vertical barre » reprend l\'historique de Tirage Poulie Haute (70 kg, record)', garde(J0[4], TPH, 70), js(J0[4]));
  t('H6 ⭐ « Triceps corde » reprend l\'historique de Triceps Corde Poulie (25 kg, record)', garde(J0[5], TCP, 25), js(J0[5]));
  t('H7 ⭐ « EZ Preacher Curl » reprend l\'historique de Curl Pupitre Barre EZ (35 kg, record)', garde(J0[6], CPEZ, 35), js(J0[6]));

  console.log('\n═══ B-IMAP2-C (session-B). IMPORT-MAP-02 — corpus externe (387 occurrences, 24 sources publiques, 6 langues) ═══');
  // Les lignes « high » sont des invariants (cliquet), les autres sont surveillées (diff imprimé, jamais rouge).
  const FX = require('./import_map2_corpus.json');
  const RC2 = await pg.evaluate(libs => { const o = {}; libs.forEach(l => { const r = _matchExercise(l) || {}; o[l] = [r.tier, r.match || null]; }); return o; },
    [...new Set(FX.lignes.map(l => l[1]))]);
  const hi = FX.lignes.filter(l => l[3] === 'high');
  const aJuste = l => RC2[l[1]][0] === 'auto' && RC2[l[1]][1] === l[4];
  const recul = FX.A_fige.filter(id => { const l = FX.lignes.find(x => x[0] === id); return !aJuste(l); });
  t('C1 ⭐ CLIQUET — les ' + FX.A_fige.length + ' lignes « high » AUTO justes le restent (93 d\'IMPORT-MAP-01B + 4 que ce lot corrige)',
    recul.length === 0, js(recul.map(id => { const l = FX.lignes.find(x => x[0] === id); return id + ' ' + l[1] + ' → ' + RC2[l[1]].join(' '); })));
  const faux = hi.filter(l => RC2[l[1]][0] === 'auto' && RC2[l[1]][1] !== l[4]);
  const fauxHors = faux.filter(l => FX.faux_fige[l[0]] !== RC2[l[1]][1]);
  t('C2 ⛔⛔ aucun AUTO faux parmi les 312 lignes « high », hors la liste figée (« Triceps Pushdown » → Extension Triceps : alias P0-2, hors lot)',
    fauxHors.length === 0, js(fauxHors.map(l => l[0] + ' ' + l[1] + ' → ' + RC2[l[1]][1] + ' (attendu ' + l[4] + ')')));
  const revenus = FX.supprimes.filter(([id, cible]) => { const l = FX.lignes.find(x => x[0] === id); return RC2[l[1]][0] === 'auto' && RC2[l[1]][1] === cible; });
  t('C3 ⛔⛔ les 10 AUTO dangereux supprimés par 01 / 01B ne reviennent pas', revenus.length === 0, js(revenus));
  const surv = FX.lignes.filter(l => l[3] !== 'high' && (RC2[l[1]][0] !== l[5] || (RC2[l[1]][1] || '') !== l[6]));
  console.log('   ℹ️ surveillance (' + FX.lignes.filter(l => l[3] !== 'high').length + ' lignes non « high ») : ' + surv.length + ' changement(s) depuis 01B'
    + (surv.length ? ' — ' + surv.map(l => l[0] + ' ' + l[1] + ' : ' + l[5] + ' ' + l[6] + ' → ' + RC2[l[1]].join(' ')).join(' · ') : ''));

  t('IMAP2-∅ aucune erreur de page, 0 appel réel', !errs.length && reels === 0, errs.join(' | ').slice(0, 300));
  try { await cx.close(); } catch (e) {}
};
