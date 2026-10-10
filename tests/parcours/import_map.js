/* ═══════════════════════════════════════════════════════════════════════════════════════
   🏷️ IMPORT-MAP-01 — UN RAPPROCHEMENT AUTOMATIQUE NE CHANGE JAMAIS LE MATÉRIEL ÉCRIT (session-B · 10/10/2026)
   Blocs : B-IMAP-A (cas nommés) · B-IMAP-H (historique, vrai chemin d'import) · B-IMAP-G (grille du catalogue).

   AVANT (mesuré sur master b280ea5d) : `_EX_STOP` retire machine / barre / haltères / poulie / câble ;
   « Squat machine » se réduisait à « squat » → équivalence → « Squat à la Barre » (AUTO 95), et
   « Élévations latérales haltères » partageait 100 % de ses mots utiles avec « …Câble » (AUTO 100).
   Un programme importé récupérait alors les charges, l'historique et les records d'un AUTRE exercice.

   CONDUIT : `_matchExercise` dans la vraie page ; la vraie chaîne d'import (`analyzeImportPhotos` avec une
   réponse du Worker simulée, `finalImportProg`, `_loadProgDayVraiment`) sur un historique et des records
   réels. OBSERVE : niveau (auto / confirm / new), cible, matériel de la cible, nom de la carte chargée,
   charges pré-remplies, séances précédentes (`getPrev`) et record (`S.prs`) visibles sous ce nom.
   NE COUVRE PAS : l'historique déjà contaminé avant ce lot, les fautes d'orthographe (hors périmètre),
   Safari iOS. ⛔ 0 appel réel (Worker et Apps Script simulés).
   Banc : tools/banc_import_map.js · contrôle négatif : tools/mut_import_map.py ·
   grille avant/après : tools/grille_import_map.js
   ═══════════════════════════════════════════════════════════════════════════════════════ */

/* ⚙️ CLASSEMENT DU MATÉRIEL PROPRE AU TÉMOIN — écrit ici, indépendamment de l'app, pour que la mesure
   ne soit pas la formule qu'elle vérifie (un contrôle qui relit sa propre règle ne peut pas rougir).
   Matériel ÉCRIT dans un nom (mots entiers, sans accents) : smith › poulie/câble › machine/guidé ›
   haltères/kettlebell › barre. Rien d'écrit → null. */
function materielEcrit(s) {
  s = ' ' + String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ') + ' ';
  if (/ smith /.test(s)) return 'smith';
  if (/ (poulie|cable|cables) /.test(s)) return 'poulie';
  if (/ (machine|guide|guidee) /.test(s)) return 'machine';
  if (/ (haltere|halteres|dumbbell|dumbbells|kettlebell) /.test(s)) return 'libre';
  if (/ (barre|barbell) /.test(s)) return 'barre';
  return null;
}
module.exports.materielEcrit = materielEcrit;

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-IMAP-A (session-B). IMPORT-MAP-01 — cas nommés : jamais d\'AUTO vers un autre matériel ═══');
  const js = x => JSON.stringify(x).slice(0, 420);
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  let reels = 0;
  await cx.route(/supabase\.co|anthropic\.com/, r => { reels++; return r.abort(); });
  // Réponse du Worker à la FORME exacte de `importProgram` (une ligne = un exercice, nom tel qu'écrit).
  const L = (name, sets, reps, kg) => ({ name, sets, reps, repsPerSet: [], kg, kgPerSet: [], supersetGroup: '', setType: '', note: '' });
  const PROG = { name: 'Programme IMPORT-MAP', weeks: 0, startDate: '', days: [
    { label: 'Jambes', exercises: [L('Squat machine', 3, 10, 0), L('Élévations latérales haltères', 3, 12, 0), L('Presse Zeta', 3, 10, 40)] },
    { label: 'Contrôle', exercises: [L('Squat à la barre', 3, 5, 0), L('Élévations latérales câble', 3, 12, 0)] },
  ] };
  await cx.route(/workers\.dev|script\.google\.com/, async r => {
    let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
    if (c.action === 'importProgram') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: JSON.parse(JSON.stringify(PROG)) }) });
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
  });
  // Historique RÉEL du squat barre et des élévations câble : charges, séances, records.
  const ser = (kg, reps, n) => Array.from({ length: n }, () => ({ kg, reps, done: true, type: 'N', rm1: 0 }));
  const SESS = [{ id: 'imap-1', date: '2026-10-01', exs: [{ name: 'Squat à la Barre', sets: ser(140, 5, 3) }, { name: 'Élévations Latérales Câble', sets: ser(25, 12, 3) }] }];
  const PRS = { 'Squat à la Barre': { rm1: 163, kg: 140, reps: 5, date: '2026-10-01' }, 'Élévations Latérales Câble': { rm1: 35, kg: 25, reps: 12, date: '2026-10-01' } };
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_imap'))return; sessionStorage.setItem('_imap','1'); localStorage.clear();
    const D={ft4_ob2:'1',ft4_name:'Testeur',ft4_premium:'true',ft4_guide_shown:'1',ft4_wn_seen:'999',
      ft4_sessions:${JSON.stringify(JSON.stringify(SESS))},ft4_prs:${JSON.stringify(JSON.stringify(PRS))}};
    Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2500);

  const M = await pg.evaluate(noms => { const o = {}; noms.forEach(n => { const r = _matchExercise(n) || {}; o[n] = { tier: r.tier, match: r.match || null, via: r.via || '', conf: r.confidence }; }); return o; }, [
    'Squat machine', 'Élévations latérales haltères', 'Squat Smith', 'Rowing machine', 'Rowing barre', 'Rowing haltère',
    'DC', 'Dc', 'Bench press', 'bench', 'DC Barre', 'Développé couché', 'Developpe couche', 'Shoulder press machine', 'Larsen Press',
    'Presse Zeta', 'Développé épaules', 'Développé épaules guidé / haltères', 'Squat haltères', 'DC Haltères', 'Shrug haltères',
    'Soulevé de terre haltères', 'Squat guidé', 'Peck deck machine', 'Pendulum squat machine', 'Leg press machine', 'Face pull poulie',
    'Élévations latérales poulie', 'Élévations latérales machine', 'T-bar row', 'Rowing T-bar', 'Hip thrust haltère', 'Devlopé couché']);
  const eqOf = await pg.evaluate(noms => { const o = {}; noms.forEach(n => { if (n) o[n] = _exEquip(n); }); return o; }, [...new Set(Object.values(M).map(r => r.match).filter(Boolean))]);
  // Matériel d'une CIBLE : écrit dans son nom, sinon déduit par l'app (`_exEquip`) ; 'guide' déduit reste un guidé quelconque.
  const materielCible = n => { const e = materielEcrit(n); if (e) return e; const q = eqOf[n]; return (!q || q === 'autre') ? null : q; };
  const oppose = (src, cible) => { const a = materielEcrit(src), c = materielCible(cible); if (!a || !c || a === c) return false;
    if (c === 'guide') return !['machine', 'poulie', 'smith'].includes(a); return true; };
  const jamaisAutoContraire = n => { const r = M[n]; return !(r.tier === 'auto' && r.match && oppose(n, r.match)); };
  const auto = (n, cible) => M[n].tier === 'auto' && M[n].match === cible;

  t('A ⛔ « Squat machine » n\'est jamais rattaché AUTOMATIQUEMENT à un exercice d\'un autre matériel (avant : Squat à la Barre, AUTO 95)',
    jamaisAutoContraire('Squat machine') && !auto('Squat machine', 'Squat à la Barre'), js(M['Squat machine']));
  t('B ⛔ « Élévations latérales haltères » n\'est jamais rattaché AUTOMATIQUEMENT à la version câble ou machine (avant : …Câble, AUTO 100)',
    jamaisAutoContraire('Élévations latérales haltères') && !auto('Élévations latérales haltères', 'Élévations Latérales Câble'), js(M['Élévations latérales haltères']));
  const autres = ['Squat haltères', 'DC Haltères', 'Shrug haltères', 'Soulevé de terre haltères', 'Squat guidé'];
  t('A-B bis ⛔ même famille, mesurée le 10/10 : « Squat haltères », « DC Haltères », « Shrug haltères », « Soulevé de terre haltères », « Squat guidé » — jamais d\'AUTO vers un autre matériel',
    autres.every(jamaisAutoContraire), js(autres.map(n => n + ' → ' + M[n].tier + ' ' + M[n].match)));
  t('C « Squat Smith » → AUTO « Smith Machine Squat »', auto('Squat Smith', 'Smith Machine Squat'), js(M['Squat Smith']));
  t('D « Rowing machine / barre / haltère » → AUTO, chacun vers SON matériel',
    auto('Rowing machine', 'Rowing Machine (Tirage Horizontal)') && auto('Rowing barre', 'Rowing Barre (Tirage Horizontal)') && auto('Rowing haltère', 'Rowing Haltère (Tirage Horizontal)'),
    js(['Rowing machine', 'Rowing barre', 'Rowing haltère'].map(n => M[n].match)));
  const dc = ['DC', 'Dc', 'Bench press', 'bench', 'DC Barre', 'Développé couché', 'Developpe couche'];
  t('E DC · Dc · Bench press · bench · DC Barre · Développé couché · Developpe couche → AUTO « Développé Couché »',
    dc.every(n => auto(n, 'Développé Couché')), js(dc.map(n => n + ':' + M[n].tier + ' ' + M[n].match)));
  t('F « Shoulder press machine » → AUTO « Développé Épaules Machine » · « Larsen Press » → AUTO Larsen',
    auto('Shoulder press machine', 'Développé Épaules Machine') && auto('Larsen Press', 'Développé Couché Larsen (Larsen Press)'), js([M['Shoulder press machine'], M['Larsen Press']]));
  t('G ⛔ « Presse Zeta » (nom propriétaire inconnu) : jamais rattaché automatiquement', M['Presse Zeta'].tier !== 'auto', js(M['Presse Zeta']));
  t('H ⭐ « Développé épaules » (aucun matériel écrit) → CONFIRMATION vers la variante machine, plus AUTO (décision de Michel)',
    M['Développé épaules'].tier === 'confirm' && M['Développé épaules'].match === 'Développé Épaules Machine', js(M['Développé épaules']));
  t('I « Développé épaules guidé / haltères » (ambigu) : jamais de décision automatique', M['Développé épaules guidé / haltères'].tier !== 'auto', js(M['Développé épaules guidé / haltères']));
  const surs = [['Peck deck machine', 'Pec Deck'], ['Pendulum squat machine', 'Pendulum Squat'], ['Leg press machine', 'Press Jambes 45°'], ['Face pull poulie', 'Tirage Visage (Face Pull)'],
    ['Élévations latérales poulie', 'Élévations Latérales Câble'], ['Élévations latérales machine', 'Élévations Latérales Machine'], ['T-bar row', 'Rowing T-Bar Machine'],
    ['Rowing T-bar', 'Rowing T-Bar Machine'], ['Hip thrust haltère', 'Hip Thrust Haltère (Poussée de Hanche)']];
  t('S ⭐ rapprochements SÛRS gardés en AUTO (protègent du garde-fou trop strict) : Peck deck machine · Pendulum squat machine · Leg press machine · Face pull poulie · poulie = câble · T-bar · haltère exact',
    surs.every(([n, c]) => auto(n, c)), js(surs.filter(([n, c]) => !auto(n, c)).map(([n]) => n + ' → ' + M[n].tier + ' ' + M[n].match)));
  t('P une petite faute (« Devlopé couché ») ne produit jamais d\'AUTO vers un autre exercice',
    M['Devlopé couché'].tier !== 'auto' || M['Devlopé couché'].match === 'Développé Couché', js(M['Devlopé couché']));

  console.log('\n═══ B-IMAP-H (session-B). IMPORT-MAP-01 — historique : un faux rattachement ne récupère plus les données d\'un autre exercice ═══');
  const H = await pg.evaluate(async () => {
    S.premium = true; _impPhotos = [{ type: 'text/plain', data: 'programme', name: 'prog.txt', isText: true }]; _impMode = 'new';
    await analyzeImportPhotos();
    finalImportProg();
    const iP = S.programmes.length - 1, prog = S.programmes[iP], jours = [];
    for (let d = 0; d < prog.days.length; d++) {
      S.wkt = null; try { _loadProgDayVraiment(iP, d); } catch (e) { jours.push({ err: e.message }); continue; }
      jours.push((S.wkt && S.wkt.exs || []).map(e => ({ name: e.name, kg: (e.sets || []).map(s => s.kg), prev: getPrev(e.name).map(s => s.kg), pr: !!(S.prs && S.prs[e.name]) })));
    }
    return { prog: prog.days.map(d => d.exs.map(e => e.name)), jours, custom: (S.customExercises || []).map(e => e.n) };
  });
  const carte = (d, re) => ((H.jours[d] || []).find(e => re.test(e.name)) || null);
  const sqC = carte(1, /squat/i), elC = carte(1, /elevations? laterales? cable|élévations latérales câble/i);
  t('H0 témoin de mesure : le contrôle « Squat à la barre » récupère bien 140 kg et son record (sinon les témoins suivants ne mesureraient rien)',
    !!sqC && sqC.name === 'Squat à la Barre' && sqC.kg.every(k => k === 140) && sqC.prev.length === 3 && sqC.pr, js(H.jours[1]));
  t('H0b témoin de mesure : le contrôle « Élévations latérales câble » récupère bien 25 kg et son record',
    !!elC && elC.kg.every(k => k === 25) && elC.pr, js(H.jours[1]));
  const sqM = (H.jours[0] || [])[0] || {}, elH = (H.jours[0] || [])[1] || {}, zeta = (H.jours[0] || [])[2] || {};
  t('H1 ⛔⛔ « Squat machine » importé : la carte ne devient pas « Squat à la Barre », aucune charge de 140 kg, aucune séance ni record du squat barre',
    sqM.name && sqM.name !== 'Squat à la Barre' && !sqM.kg.includes(140) && !sqM.prev.includes(140) && !sqM.pr, js(sqM));
  t('H2 ⛔⛔ « Élévations latérales haltères » importé : ni le nom, ni les 25 kg, ni le record de la version câble',
    elH.name && elH.name !== 'Élévations Latérales Câble' && !elH.kg.includes(25) && !elH.prev.includes(25) && !elH.pr, js(elH));
  t('H3 « Presse Zeta » est gardé sous son nom (exercice inconnu conservé), jamais renommé',
    zeta.name === 'Presse Zeta' && H.custom.includes('Presse Zeta'), js({ zeta, custom: H.custom }));

  console.log('\n═══ B-IMAP-G (session-B). IMPORT-MAP-01 — grille du catalogue : aucun AUTO inter-matériel par rapprochement ═══');
  const G = await pg.evaluate(() => {
    const MOTS = ['machine', 'barre', 'haltères', 'poulie', 'smith'];
    const RE_MAT = /\b(machine|barre|barbell|halteres?|haltère|haltères|dumbbells?|poulie|câble|cable|smith|guidé|guidée)\b/i;
    const out = [], vus = new Set();
    const ajoute = (v, src) => { const k = v.toLowerCase(); if (vus.has(k)) return; vus.add(k); out.push({ v, src }); };
    (EXLIB || []).forEach(ex => {
      const n = String(ex.n), base = n.replace(/\s*\([^)]*\)\s*$/, '').trim();
      if (base !== n) ajoute(base, n);
      if (RE_MAT.test(base)) MOTS.forEach(w => ajoute(base.replace(RE_MAT, w), n));
      else MOTS.forEach(w => ajoute(base + ' ' + w, n));
    });
    return out.map(o => { const r = _matchExercise(o.v) || {}; return { v: o.v, src: o.src, tier: r.tier, match: r.match || null, via: r.via || '',
      eq: r.match ? _exEquip(r.match) : null, cle: !!(typeof _EX_EQUIV !== 'undefined' && _EX_EQUIV[_normEx(o.v)]) }; });
  });
  const matCible = (n, eq) => materielEcrit(n) || ((!eq || eq === 'autre') ? null : eq);
  const inter = G.filter(r => { if (r.tier !== 'auto' || !r.match) return false; const a = materielEcrit(r.v), c = matCible(r.match, r.eq);
    if (!a || !c || a === c) return false; if (c === 'guide') return !['machine', 'poulie', 'smith'].includes(a); return true; });
  const gouvernes = inter.filter(r => r.via === 'mots' || (r.via === 'équivalence connue' && !r.cle));
  console.log('   ℹ️ grille : ' + G.length + ' variantes · ' + G.filter(r => r.tier === 'auto').length + ' AUTO · ' + inter.length + ' AUTO inter-matériel (' + gouvernes.length + ' par rapprochement)');
  t('G1 ⛔ grille du catalogue : AUCUN AUTO inter-matériel par recouvrement de mots ni par équivalence obtenue en retirant des mots',
    gouvernes.length === 0, js(gouvernes.slice(0, 8).map(r => r.v + ' → ' + r.match + ' (' + r.via + ')')));
  t('G2 les AUTO inter-matériel qui restent passent tous par une identité DÉCLARÉE (exact, sans parenthèse, synonyme EN, alias complet)',
    inter.every(r => /^exact/.test(r.via) || r.via === 'synonyme EN' || (r.via === 'équivalence connue' && r.cle)), js(inter.slice(0, 6).map(r => r.v + ' → ' + r.match + ' (' + r.via + ')')));
  const AL = await pg.evaluate(() => Object.keys(_EX_EQUIV).map(k => { const r = _matchExercise(k) || {}; return { k, cible: _EX_EQUIV[k], tier: r.tier, match: r.match, via: r.via || '' }; }));
  const perdus = AL.filter(a => !(a.tier === 'auto' && (a.match === a.cible || /^exact/.test(a.via) || a.via === 'synonyme EN')));
  t('G3 ⭐ les ' + AL.length + ' alias déclarés (`_EX_EQUIV`) restent tous AUTO vers leur cible (ou vers une identité exacte) — garde-fou contre le correctif trop strict',
    AL.length > 300 && perdus.length === 0, js(perdus.slice(0, 8)));
  /* ⛔ G5 RETIRÉ (R30), REMPLACÉ PAR B-IMAPB-S (`import_map_alias.js`, IMPORT-MAP-01B) — il comptait « ≤ 23 alias
     contradictoires ». La contre-vérification Nutrition l'a battu : retirer « rowing halteres » et ajouter « military
     press halteres → Développé Militaire » le laissait VERT (même compte, nouvelle violation). Et son vocabulaire,
     recopié de l'app, ne lisait pas « db ». Le remplaçant juge chaque alias (vocabulaire de test propre, db/bb/kb) et
     exige 0 alias qui CAUSE un AUTO contradictoire. */
  const EN = await pg.evaluate(() => (EXLIB || []).filter(ex => typeof EX_EN !== 'undefined' && EX_EN[ex.n]).map(ex => { const r = _matchExercise(EX_EN[ex.n]) || {}; return { en: EX_EN[ex.n], n: ex.n, tier: r.tier, match: r.match }; }));
  const enPerdus = EN.filter(e => !(e.tier === 'auto'));
  t('G4 les ' + EN.length + ' synonymes anglais du catalogue restent tous AUTO', EN.length > 100 && enPerdus.length === 0, js(enPerdus.slice(0, 6)));

  t('IMAP-∅ aucune erreur de page, 0 appel réel', !errs.length && reels === 0, errs.join(' | ').slice(0, 300));
  try { await cx.close(); } catch (e) {}
};
