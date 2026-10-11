/* ════════════════════════════════════════════════════════════════════════════════════════════════════════
   🏷️ IMPORT-P0-2 — « TRICEPS PUSHDOWN » N'EST PAS « EXTENSION TRICEPS » (session-B · 11/10/2026)
   Blocs : B-P02-A (rattachement, cas nommés et corpus) · B-P02-P (import de PROGRAMME : carte, charges,
   séances précédentes, record) · B-P02-H (import d'HISTORIQUE : séance enregistrée et record recalculé).

   AVANT (mesuré sur master 7d7bb5a8) : trois alias complets « souverains » de `_EX_EQUIV` envoyaient
   « triceps pushdown », « cable triceps pushdown » et « extension triceps poulie » vers « Extension Triceps »,
   l'extension verticale À L'HALTÈRE (illustration `extension-triceps-verticale-haltere`, nom anglais « triceps
   extension overhead »). Un pushdown à la poulie importé reprenait alors les charges, les séances et le record de
   l'extension haltère — et un import d'historique écrivait son record sous le mauvais nom. Le garde-fou matériel
   d'IMPORT-MAP ne pouvait rien : l'alias complet passe avant lui, et la cible n'a aucun matériel lisible.

   CONDUIT : `_matchExercise` dans la vraie page ; la vraie chaîne d'import de programme (`analyzeImportPhotos` avec
   une réponse du Worker simulée, `finalImportProg`, `_loadProgDayVraiment`) ; la vraie chaîne d'import
   d'historique (`analyzeHistPhotos` → `_vmMatchHist` → `finalImportHist`), sur trois historiques DISTINCTS
   (Extension Triceps 30 kg · Triceps Poulie 45 kg · Triceps Corde Poulie 25 kg, chacun avec son record).
   OBSERVE : niveau (auto / confirm / new), cible, nom de la carte chargée, charges pré-remplies, séances
   précédentes (`getPrev`), record (`S.prs`) ; après l'import d'historique, le nom enregistré et le record.
   NE COUVRE PAS : un historique déjà contaminé avant ce lot (il n'est ni lu ni réparé), Safari iOS.
   ⛔ 0 appel réel (Worker et Apps Script simulés). Banc : tools/banc_p02_triceps.js ·
   contrôle négatif : tools/mut_p02_triceps.py
   ════════════════════════════════════════════════════════════════════════════════════════════════════════ */

const ET = 'Extension Triceps', TP = 'Triceps Poulie', TC = 'Triceps Corde Poulie';

/* Le corpus du brief (§6 et §10), avec ce qui est PERMIS pour chaque libellé — écrit ici, sans lire l'app.
   `auto` : la seule cible AUTO acceptée · `jamais` : cibles qu'un AUTO ne doit jamais viser.
   Une question (confirm) ou un exercice nouveau est toujours permis : ce banc interdit les faux AUTO. */
const POULIE = { auto: TP };
const CORDE = { auto: TC };
const CORPUS = [
  ['Triceps Pushdown', POULIE, 'A'], ['Cable triceps pushdown', POULIE, 'B'], ['Extension triceps poulie', POULIE, 'C'],
  ['Tricep pushdown', POULIE, 'D'], ['Triceps pushdowns', POULIE, 'E'],
  ['Cable Tricep Pushdown', POULIE],
  ['Triceps corde', CORDE, 'F'], ['Triceps cordes', CORDE], ['Tricep Rope Pushdown', CORDE, 'G'], ['Tricep Rope Pushdowns', CORDE],
  ['Pushdown barre', { jamais: [ET, TC] }], ['Pushdown barre EZ', { jamais: [ET, TC] }],
  ['Pushdown corde', { jamais: [ET, TP] }],
  ['Banded pushdown', { jamais: [ET, TP, TC] }], ['Pushdown élastique', { jamais: [ET, TP, TC], lettre: 'H' }],
  ['Extension triceps verticale élastique', { auto: 'Extension Triceps Verticale Élastique' }],
  ['Extension triceps haltère', { jamais: [TP, TC] }],
  ['Skull crusher', { auto: 'Barre au Front' }], ['Barre au front', { auto: 'Barre au Front' }],
  ['Extension Triceps', { auto: ET }],
];
module.exports.CORPUS = CORPUS;
/* ⚠️ LIMITE CONNUE, PRÉEXISTANTE ET HORS DE CE LOT — nommée, jamais rouge, mais elle ne doit pas GRANDIR.
   « Extension triceps » + un matériel (poulie / câble / barre / machine) part en AUTO vers « Extension Triceps » par
   RECOUVREMENT DE MOTS (via « mots »), pas par un alias : la cible est classée Polyvalent (`_exEquip` = « autre ») et son
   nom anglais (« triceps extension overhead ») ne dit aucun matériel, donc le garde-fou d'IMPORT-MAP n'a rien à opposer.
   Mesuré identique sur master 7d7bb5a8 et après ce lot. La corriger demande de décider ce qu'EST « Extension Triceps »
   (haltère seulement, ou polyvalent ?) : décision de Michel, pas un alias de plus. Ce banc fige la liste : un libellé de
   plus qui y tombe rougit. */
const FAMILLE_CONNUE = ['Extension triceps à la poulie', 'Extension des triceps à la poulie', 'Extension triceps câble', 'Extension triceps cable',
  'Extension triceps au câble', 'Cable triceps extension', 'Triceps extension cable', 'Extensions triceps poulie', 'Extension triceps barre',
  'Extension triceps machine'];
const FAMILLE_SONDE = FAMILLE_CONNUE.concat(['Extension triceps poulie haute', 'Extension triceps à la poulie haute', 'Extension triceps nuque poulie',
  'Extension triceps vis-à-vis', 'Pushdown triceps', 'Triceps push down', 'Triceps pressdown', 'Cable pushdown', 'Pushdown poulie', 'Pushdown câble',
  'Poulie triceps', 'Triceps à la poulie', 'Extension triceps poulie corde', 'Extension triceps corde']);
module.exports.FAMILLE_CONNUE = FAMILLE_CONNUE;

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-P02-A (session-B). IMPORT-P0-2 — un pushdown à la poulie va vers « Triceps Poulie », jamais vers l\'extension haltère ═══');
  const js = x => JSON.stringify(x).slice(0, 420);
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  let reels = 0;
  await cx.route(/supabase\.co|anthropic\.com/, r => { reels++; return r.abort(); });
  // Réponses du Worker à la FORME exacte de `importProgram` et `importHistory` (noms tels qu'écrits).
  const L = (name, sets, reps, kg) => ({ name, sets, reps, repsPerSet: [], kg, kgPerSet: [], supersetGroup: '', setType: '', note: '' });
  const PROG = { name: 'Programme P0-2', weeks: 0, startDate: '', days: [
    { label: 'Triceps', exercises: [L('Triceps Pushdown', 3, 12, 0), L('Cable triceps pushdown', 3, 12, 0), L('Extension triceps poulie', 3, 12, 0)] },
    { label: 'Contrôles', exercises: [L('Extension Triceps', 3, 10, 0), L('Triceps corde', 3, 12, 0), L('Triceps Poulie', 3, 12, 0)] },
  ] };
  const st = (kg, reps) => ({ kg, reps, type: 'N', note: '' });
  const HIST = { sessions: [{ date: '2026-10-08', estimatedDate: false, label: 'Bras', exercises: [
    { name: 'Triceps Pushdown', sets: [st(77, 8)], note: '' },
    { name: 'Cable triceps pushdown', sets: [st(73, 8)], note: '' },
    { name: 'Extension triceps poulie', sets: [st(71, 8)], note: '' }] }] };
  await cx.route(/workers\.dev|script\.google\.com/, async r => {
    let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
    if (c.action === 'importProgram') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: JSON.parse(JSON.stringify(PROG)) }) });
    if (c.action === 'importHistory') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: JSON.parse(JSON.stringify(HIST)) }) });
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
  });
  // Trois historiques DISTINCTS : A = Extension Triceps (haltère) · B = Triceps Poulie · C = Triceps Corde Poulie.
  const ser = (kg, reps, n) => Array.from({ length: n }, () => ({ kg, reps, done: true, type: 'N', rm1: 0 }));
  const SESS = [{ id: 'p02-1', date: '2026-10-01', exs: [{ name: ET, sets: ser(30, 10, 3) }, { name: TP, sets: ser(45, 12, 3) }, { name: TC, sets: ser(25, 12, 3) }] }];
  const PRS = { [ET]: { rm1: 40, kg: 30, reps: 10, date: '2026-10-01' }, [TP]: { rm1: 63, kg: 45, reps: 12, date: '2026-10-01' }, [TC]: { rm1: 35, kg: 25, reps: 12, date: '2026-10-01' } };
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_p02'))return; sessionStorage.setItem('_p02','1'); localStorage.clear();
    const D={ft4_ob2:'1',ft4_name:'Testeur',ft4_premium:'true',ft4_guide_shown:'1',ft4_wn_seen:'999',
      ft4_sessions:${JSON.stringify(JSON.stringify(SESS))},ft4_prs:${JSON.stringify(JSON.stringify(PRS))}};
    Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2500);

  const M = await pg.evaluate(noms => { const o = {}; noms.forEach(n => { const r = _matchExercise(n) || {}; o[n] = { tier: r.tier, match: r.match || null, via: r.via || '' }; }); return o; }, [...new Set(CORPUS.map(c => c[0]).concat(FAMILLE_SONDE))]);
  const auto = (n, c) => M[n].tier === 'auto' && M[n].match === c;
  const conforme = ([n, regle]) => {
    const r = M[n];
    if (regle.auto) return auto(n, regle.auto);
    return !(r.tier === 'auto' && (regle.jamais || []).includes(r.match));
  };
  for (const c of CORPUS.filter(c => c[2] || (c[1] && c[1].lettre))) {
    const lettre = c[2] || c[1].lettre, regle = c[1];
    const attendu = regle.auto ? 'AUTO → « ' + regle.auto + ' »' : 'jamais AUTO vers ' + regle.jamais.map(x => '« ' + x + ' »').join(' / ');
    t('B-P02-A ' + lettre + ' « ' + c[0] + ' » : ' + attendu, conforme(c), js(M[c[0]]));
  }
  t('B-P02-A I « Extension triceps haltère » ne devient jamais AUTO « Triceps Poulie » (ni « Triceps Corde Poulie »)',
    conforme(CORPUS.find(c => c[0] === 'Extension triceps haltère')), js(M['Extension triceps haltère']));
  t('B-P02-A J « Extension Triceps » (nom exact du catalogue) désigne toujours « Extension Triceps »', auto('Extension Triceps', ET), js(M['Extension Triceps']));
  const fautes = CORPUS.filter(c => !conforme(c));
  t('B-P02-A ⛔ corpus du brief (' + CORPUS.length + ' libellés) : aucun faux AUTO — poulie → Triceps Poulie, corde → Triceps Corde Poulie, élastique / haltère / barre au front jamais aspirés',
    fautes.length === 0, js(fautes.map(c => c[0] + ' → ' + M[c[0]].tier + ' ' + M[c[0]].match + ' (' + M[c[0]].via + ')')));
  const versET = CORPUS.filter(c => /pushdown|poulie/i.test(c[0]) && M[c[0]].tier === 'auto' && M[c[0]].match === ET);
  t('B-P02-A ⛔⛔ aucun libellé « pushdown » ou « poulie » du corpus n\'est rattaché AUTOMATIQUEMENT à « Extension Triceps »',
    versET.length === 0, js(versET.map(c => c[0])));
  const pushET = FAMILLE_SONDE.filter(n => /push ?down|pressdown/i.test(n) && M[n].tier === 'auto' && M[n].match === ET);
  t('B-P02-A ⛔⛔ aucune tournure « pushdown / push down / pressdown » n\'est rattachée AUTOMATIQUEMENT à « Extension Triceps » (' + FAMILLE_SONDE.filter(n => /push ?down|pressdown/i.test(n)).length + ' tournures sondées)',
    pushET.length === 0, js(pushET));
  const tombees = FAMILLE_SONDE.filter(n => M[n].tier === 'auto' && M[n].match === ET);
  const nouvelles = tombees.filter(n => !FAMILLE_CONNUE.includes(n));
  console.log('   ℹ️  LIMITE CONNUE (préexistante, hors lot, décision de Michel) : ' + tombees.length + ' tournure(s) « extension triceps + matériel » encore AUTO vers « Extension Triceps » par recouvrement de mots : ' + tombees.join(' · '));
  t('B-P02-A la limite connue « extension triceps + matériel → Extension Triceps (mots) » ne GRANDIT pas : aucune tournure hors des ' + FAMILLE_CONNUE.length + ' nommées (mesurées identiques sur master)',
    nouvelles.length === 0, js(nouvelles));

  console.log('\n═══ B-P02-P (session-B). IMPORT-P0-2 — import de PROGRAMME : la carte reprend SON historique, jamais celui de l\'extension haltère ═══');
  const P = await pg.evaluate(async () => {
    S.premium = true; _impPhotos = [{ type: 'text/plain', data: 'programme', name: 'prog.txt', isText: true }]; _impMode = 'new';
    await analyzeImportPhotos();
    finalImportProg();
    const iP = S.programmes.length - 1, prog = S.programmes[iP], jours = [];
    for (let d = 0; d < prog.days.length; d++) {
      S.wkt = null; try { _loadProgDayVraiment(iP, d); } catch (e) { jours.push({ err: e.message }); continue; }
      jours.push((S.wkt && S.wkt.exs || []).map(e => ({ name: e.name, kg: (e.sets || []).map(s => s.kg), prev: getPrev(e.name).map(s => s.kg), pr: S.prs && S.prs[e.name] ? S.prs[e.name].rm1 : null })));
    }
    return { prog: prog.days.map(d => d.exs.map(e => e.name)), jours };
  });
  const ctl = P.jours[1] || [];
  const cET = ctl.find(e => e.name === ET), cTC = ctl.find(e => e.name === TC), cTP = ctl.find(e => e.name === TP);
  t('B-P02-P0 témoin de mesure : les contrôles reprennent bien LEUR historique (Extension Triceps 30 kg / record 40 · Triceps corde 25 kg / 35 · Triceps Poulie 45 kg / 63) — sinon les témoins suivants ne mesureraient rien',
    !!cET && cET.kg.every(k => k === 30) && cET.pr === 40 && !!cTC && cTC.kg.every(k => k === 25) && cTC.pr === 35 && !!cTP && cTP.kg.every(k => k === 45) && cTP.pr === 63, js(ctl));
  const jour0 = P.jours[0] || [];
  ['Triceps Pushdown', 'Cable triceps pushdown', 'Extension triceps poulie'].forEach((src, i) => {
    const c = jour0[i] || {};
    t('B-P02-P' + (i + 1) + ' ⛔⛔ « ' + src + ' » importé → carte « Triceps Poulie », charges 45 kg, séances et record (63) de Triceps Poulie — jamais les 30 kg ni le record de l\'extension haltère',
      c.name === TP && c.kg.length > 0 && c.kg.every(k => k === 45) && c.prev.length === 3 && c.prev.every(k => k === 45) && c.pr === 63
        && !c.kg.includes(30) && !c.prev.includes(30), js(c));
  });

  console.log('\n═══ B-P02-H (session-B). IMPORT-P0-2 — import d\'HISTORIQUE : la séance et le record vont à « Triceps Poulie » ═══');
  const H = await pg.evaluate(async () => {
    S.premium = true; _histPhotos = [{ type: 'text/plain', data: 'historique', name: 'hist.txt', isText: true }];
    await analyzeHistPhotos();
    const apercu = ((_histExtracted && _histExtracted.sessions) || []).map(s => (s.exercises || []).map(e => ({ name: e.name, from: e._vmFrom || null })));
    finalImportHist();
    const sess = (S.sessions || []).find(s => s.date === '2026-10-08') || null;
    const noms = sess ? (sess.exs || sess.exercises || []).map(e => ({ name: e.name, kg: (e.sets || []).map(x => x.kg) })) : null;
    const sousET = (S.sessions || []).flatMap(s => (s.exs || s.exercises || []).filter(e => e.name === 'Extension Triceps').flatMap(e => (e.sets || []).map(x => x.kg)));
    return { apercu, noms, prTP: S.prs['Triceps Poulie'] || null, prET: S.prs['Extension Triceps'] || null, sousET,
      perso: (S.customExercises || []).map(e => e.n) };
  });
  t('B-P02-H1 l\'aperçu de l\'import d\'historique rattache les trois libellés à « Triceps Poulie » (nom d\'origine gardé pour « annuler »)',
    Array.isArray(H.apercu[0]) && H.apercu[0].length === 3 && H.apercu[0].every(e => e.name === TP && !!e.from), js(H.apercu));
  t('B-P02-H2 ⛔⛔ la séance importée est enregistrée sous « Triceps Poulie » (77 / 73 / 71 kg) — aucune ligne « Extension Triceps » ne porte ces charges',
    Array.isArray(H.noms) && H.noms.length === 3 && H.noms.every(e => e.name === TP) && ![77, 73, 71].some(k => H.sousET.includes(k)), js({ noms: H.noms, sousET: H.sousET }));
  t('B-P02-H3 ⛔⛔ le record de « Triceps Poulie » monte à la charge importée (77 kg) ; celui d\'« Extension Triceps » reste intact (30 kg, record 40)',
    !!H.prTP && H.prTP.kg === 77 && H.prTP.date === '2026-10-08' && !!H.prET && H.prET.kg === 30 && H.prET.rm1 === 40, js({ prTP: H.prTP, prET: H.prET }));
  t('B-P02-H4 aucun exercice perso créé pour ces libellés (ils ont une identité au catalogue)',
    !H.perso.some(n => /pushdown|poulie/i.test(n)), js(H.perso));

  t('B-P02-∅ aucune erreur de page, 0 appel réel', !errs.length && reels === 0, errs.join(' | ').slice(0, 300));
  try { await cx.close(); } catch (e) {}
};
