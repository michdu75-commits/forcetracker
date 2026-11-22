/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   ⚖️ MISSION CORRECTIVE SÉANCE (contre-expertise du 16/11/2026) · LOT 2 — D-164 (cinq états de charge sur TOUTE la chaîne, lest au tonnage, record de lest) et D-167 (échauffement d'un mouvement
   INCONNU : jamais « cardio » sans confirmation) — blocs B-SCCP-* — Claude N°2 (Séance), GO limité de Michel du 16/11/2026.
   D-164 : INCONNU (`null`) · ZÉRO écrit (`0`) · BARRE À VIDE (`vide`) · PDC (`pdc` 0) · PDC + lest (`pdc` > 0) · PDC − assistance (`pdc` < 0) · charge en kilos — ces états ne se confondent JAMAIS, ni à l'import, ni dans le programme, ni au 1ᵉʳ chargement,
   ni dans la séance, l'historique, « enregistrer en programme », l'export (CSV / PDF), le contexte de Milo, les chemins dégressifs. Jamais attribué d'après un nom ou le poids de corps. Pas de PDC ET de « à vide » sur une même série.
   Arbitrage de Michel : un LEST réellement ajouté PARTICIPE au tonnage (3 répétitions avec 10 kg de lest = 30 kg de volume) ; un RECORD de lest, dérivé de l'historique, distinct des charges ordinaires, du PDC seul et de l'assistance
   (⛔ aucune règle de tonnage ni de record pour l'ASSISTANCE) ; aucun recalcul du passé (les séances SANS PDC gardent à l'octet leur volume), calories inchangées.
   D-167 : un échauffement « Échauffement - X » (X : un mouvement que le catalogue ne connaît pas), sans charge, avec une durée en note, RESTE un exercice (ses séries gardées) ; l'aperçu d'import DEMANDE ; seul un oui le range au cardio.
   Ce que les témoins CONDUISENT : la vraie app servie en local (390 × 844 ; 360 et 430 pour le bouton central), les vrais gestes (focus du champ de charge, appui sur un choix, ✓, boutons de l'aperçu d'import, champs de l'éditeur de programme),
   la vraie fin de séance (`finishWorkout`), « enregistrer en programme » (`saveAsProg`), un vrai rechargement, le vrai chargement d'un programme, la vraie chaîne d'import (`analyzeImportPhotos` → aperçu → `finalImportProg`, la réponse
   du Worker SIMULÉE). Ce qu'ils OBSERVENT : l'état des séries à chaque étape, le texte des champs, le volume, `S.prs`, les calories, le CSV fabriqué, le contexte de Milo (fonction locale), le corps des envois, les rectangles du bouton « + ».
   Ce qu'ils NE COUVRENT PAS : Safari iOS, la réponse réelle de Milo / du Worker (aucun appel), l'envoi réel au tableur (coupé : Code.js n'est pas modifié, il n'a pas de colonne « charge » — un PDC y part comme `kg` 0).
   Données 100 % FICTIVES, cinq familles (poids du corps, barre, haltère à un bras) + UN exercice PERSONNALISÉ + UN exercice FICTIF inédit. Banc : tools/banc_seance_ce_p.js · contrôle négatif : tools/mut_seance_ce_p.py
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '130', ft4_sessions: '[]', ft4_prs: '{}', ft4_premium: 'true' };
const J = o => JSON.stringify(o);
const TR = 'Tractions (Pull-up)', DC = 'Développé Couché', RH = 'Rowing Haltère (Tirage Horizontal)';
const CU = 'Machine Maison Zorglub', FI = 'Zorglub Inédit Pivotant';          // un exercice PERSONNALISÉ (S.customExercises) et un exercice FICTIF absent du catalogue
const FAMILLES = [[TR, 'poids du corps (catalogue)'], [DC, 'barre (catalogue)'], [RH, 'haltère à un bras (catalogue)'], [CU, 'exercice PERSONNALISÉ'], [FI, 'exercice FICTIF inédit']];
const CUSTOM = [{ n: CU, g: 'Dos', muscles: { p: ['lats'], s: [] } }];
const PLUS = { 360: 154, 390: 167, 430: 184 };                                  // le « + » validé sur iPhone (règle d'or #9) : il ne bouge pas (mêmes repères que B-SCPDC)
const PLUSY = { 360: 688, 390: 792, 430: 880 };
const proj = s => [s.kg === undefined ? 'U' : s.kg, s.pdc === undefined ? '' : s.pdc, s.vide ? 'V' : ''];   // la projection d'une série : charge · PDC · « à vide »

async function ecran(t, b, PORT) {
  const ouvrir = async (w, h) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: w || 390, height: h || 844 }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
    const dehors = [];                                                                  // ⛔ toute requête hors du serveur local : notée, puis coupée (aucune ne part)
    let PROG = null;                                                                    // la réponse « du Worker » courante (import)
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => { const rq = rt.request(); let c = {}; try { c = JSON.parse(rq.postData() || '{}'); } catch (e) {}
      dehors.push({ m: rq.method(), u: rq.url(), body: String(rq.postData() || '') });
      if (c.action === 'importProgram' && PROG) return rt.fulfill({ status: 200, contentType: 'application/json', body: J({ status: 'ok', data: JSON.parse(J(PROG)) }) });
      return rt.abort(); });
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_sccp'))return; sessionStorage.setItem('_sccp','1'); localStorage.clear();
      const D=${J(BASE)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));
      const n=new Date(); localStorage.setItem('ft4_lws', n.toLocaleDateString('sv-SE'));
      const p=new Date(n.getFullYear(), n.getMonth()-1, 15); localStorage.setItem('ft4_lms', p.getFullYear()+'-'+String(p.getMonth()+1).padStart(2,'0')); }catch(e){} })();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 200)));
    pg.setDefaultTimeout(5000);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const X = { cx, pg, errs, dehors, prog: p => { PROG = p; } };
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none';
      const n = new Date(); S.lastWeekSummary = today(); S.lastMonthSummary = new Date(n.getFullYear(), n.getMonth() - 1, 15).getFullYear() + '-' + String(new Date(n.getFullYear(), n.getMonth() - 1, 15).getMonth() + 1).padStart(2, '0');
      window.__T = []; const _t = window.toast; window.toast = function (m) { window.__T.push(String(m)); try { return _t.apply(this, arguments); } catch (e) {} };
      persist(); });
    return X;
  };
  const section = async (nom, titre, fn) => { console.log('\n─── B-SCCP-' + nom + ' · ' + titre + ' ───'); try { await fn(); } catch (e) { t('SCCP-' + nom + ' ⛔ la section n\'a pas pu aller au bout', false, String(e && e.message || e).slice(0, 300)); } };
  /** Pose l'état de l'app : séance en cours, historique (jours RELATIFS), exercices perso, programmes. */
  const poser = (X, o) => X.pg.evaluate(o => {
    document.querySelectorAll('.overlay.open').forEach(x => x.classList.remove('open'));
    S.bw = 82; S.customExercises = o.custom || []; S.prs = {}; S.programmes = o.programmes || []; S.exRestPref = {}; S.defRest = 130;
    S.sessions = (o.sessions || []).map((e, i) => { const ts = Date.now() - (e.j || 3) * 864e5 - i * 1000; return Object.assign({ id: ts, ts, date: today(ts), uniConv: 1, synced: true }, e, { exs: e.exs, exercises: e.exs }); });
    S.sessions.forEach(x => { x.volume = Math.round(_workVol(x)); }); _trierSeances(S.sessions);
    S.wkt = o.wkt ? { date: today(), startHour: 10, startTs: Date.now() - 600000, exs: o.wkt.map(e => ({ name: e.name, sets: e.sets.map(s => Object.assign({ kg: 0, reps: 8, done: false, type: 'N', rm1: 0 }, s)) })) } : null;
    window.__T = []; persist();
  }, o);
  const voir = async (X, ei) => { await X.pg.evaluate(ei => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); _expandedEx = ei; goScreen('log', document.getElementById('nb-log')); renderLog(); }, ei || 0); await X.pg.waitForTimeout(250); };
  const KG = (ei, si) => `#sr-${ei}-${si} input[inputmode="decimal"]`;
  const CHK = (ei, si) => `#sr-${ei}-${si} .chk`;
  const BTN = (ei, si, m) => `#kgm-${ei}-${si} .kgm-b[data-m="${m}"]`;
  const etat = (X, ei, si) => X.pg.evaluate(([ei, si]) => { const r = document.getElementById('sr-' + ei + '-' + si), k = r && r.querySelectorAll('.sinp')[1], st = S.wkt.exs[ei].sets[si];
    return { v: k ? k.value : null, ph: k ? k.placeholder : null, cls: k ? k.className : '', pdc: st.pdc, kg: st.kg, vide: st.vide, done: st.done }; }, [ei, si]);
  const plus = X => X.pg.evaluate(() => { const p = document.querySelector('#nb-log .nb-plus').getBoundingClientRect(); return { x: Math.round(p.left + p.width / 2), y: Math.round(p.top) }; });
  const wkt = X => X.pg.evaluate(() => JSON.parse(JSON.stringify(S.wkt.exs.map(e => e.sets.map(s => [s.kg === undefined ? 'U' : s.kg, s.pdc === undefined ? '' : s.pdc, s.vide ? 'V' : ''])))));
  const prog1 = (nom, sets, extra) => Object.assign({ id: 'pSCCP', name: 'Programme fictif SCCP', prescrit: true, days: [{ label: 'J1', exs: [Object.assign({ name: nom, sets }, extra || {})] }] }, {});
  const S0 = (kg, extra) => Object.assign({ kg, reps: 8, type: 'N', rest: 90 }, extra || {});

  /** Un appui sur un bouton de l'aperçu : s'il ne passe pas, le message DIT pourquoi (présent ? visible ? recouvert ?). */
  const clic = async (Y, sel, nom) => { try { await Y.pg.click(sel, { timeout: 4000 }); } catch (e) { const d = await Y.pg.evaluate(sel => { const el = document.querySelector(sel); if (!el) return 'absent'; const r = el.getBoundingClientRect(); const o = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return JSON.stringify({ r: [r.left, r.top, r.width, r.height], dessus: o && (o.tagName + '.' + o.className), ov: document.getElementById('ov-import-prog').className, apercu: document.getElementById('imp-preview').innerText.slice(0, 120) }); }, sel); throw new Error('appui « ' + nom + ' » impossible : ' + d); } };

  const X = await ouvrir();
  /* ══ A00 · LE JEU DE TEST ═══════════════════════════════════════════════════════════════════════════════════════════════ */
  await section('A00', 'contrôle du jeu de test', async () => {
    const r = await X.pg.evaluate(([TR, DC, RH, FI, CU]) => ({ cat: [TR, DC, RH].map(n => EXLIB.some(e => e.n === n)), fi: EXLIB.some(e => e.n === FI), cu: EXLIB.some(e => e.n === CU), uni: [RH, DC, TR, FI, CU].map(n => estUnilateral(n)) }), [TR, DC, RH, FI, CU]);
    t('SCCP-A00 ⛔ CONTRÔLE DU JEU DE TEST — trois exercices du catalogue, le perso et le fictif n\'y sont PAS ; seul le rowing haltère est unilatéral', r.cat.every(Boolean) && !r.fi && !r.cu && J(r.uni) === '[true,false,false,false,false]', J(r));
  });

  /* ══ A · LES ÉTATS DE CHARGE SE LISENT : P01 / P02 / P09 (le zéro écrit n'est plus un « ? ») ═════════════════════════════ */
  await section('A', 'les sept états de charge : lecture (fonction) et contexte de Milo (5 familles)', async () => {
    const lec = await X.pg.evaluate(() => ({ nul: _kgTxtSerie({ kg: null }), absent: _kgTxtSerie({}), vide0: _kgTxtSerie({ kg: '' }), nan: _kgTxtSerie({ kg: NaN }), zero: _kgTxtSerie({ kg: 0 }), kilos: _kgTxtSerie({ kg: 60 }), barre: _kgTxtSerie({ kg: 0, vide: true }),
      barreKilos: _kgTxtSerie({ kg: 60, vide: true }), pdc: _kgTxtSerie({ kg: 0, pdc: 0 }), lest: _kgTxtSerie({ kg: 0, pdc: 12 }), assist: _kgTxtSerie({ kg: 0, pdc: -20 }), pdcEtVide: _kgTxtSerie({ kg: 0, pdc: 5, vide: true }) }));
    t('SCCP-A01 ⭐⭐ P01 / P02 : un ZÉRO écrit se lit « 0 » (avant : « ? » — il passait pour « je ne sais pas »), l\'INCONNU (null · absent · vide · NaN) reste « ? »', lec.zero === 0 && lec.nul === '?' && lec.absent === '?' && lec.vide0 === '?' && lec.nan === '?', J(lec));
    t('SCCP-A02 ⭐ P09 : « à vide » se lit « à vide » (jamais « 0 » ni « ? »), des kilos restent des kilos (même si « à vide » est resté sur la série), PDC · PDC+12kg · PDC−20kg — et un PDC l\'emporte sur « à vide »',
      lec.barre === 'à vide' && lec.kilos === 60 && lec.barreKilos === 60 && lec.pdc === 'PDC' && lec.lest === 'PDC+12kg' && lec.assist === 'PDC−20kg' && lec.pdcEtVide === 'PDC+5kg', J(lec));
    // Milo : la même ligne, par la vraie fonction de contexte, pour chaque famille (séance terminée)
    const sets = [{ kg: null, reps: 8, done: true }, { kg: 0, reps: 8, done: true }, { kg: 60, reps: 8, done: true }, { kg: 0, vide: true, reps: 8, done: true }, { kg: 0, pdc: 12, reps: 8, done: true }, { kg: 0, pdc: -20, reps: 8, done: true }, { kg: 0, pdc: 0, reps: 8, done: true }];
    await poser(X, { custom: CUSTOM, sessions: [{ j: 2, exs: FAMILLES.map(([n]) => ({ name: n, sets: sets.map(s => Object.assign({ type: 'N', rm1: 0 }, s)) })) }] });
    const ctx = await X.pg.evaluate(() => { try { return String(buildCoachContext('test')); } catch (e) { return 'ERREUR ' + e.message; } });
    const ATT = 'S1 ?×8 · S2 0×8 · S3 60×8 · S4 à vide×8 · S5 PDC+12kg×8 · S6 PDC−20kg×8 · S7 PDC×8';
    FAMILLES.forEach(([n, fam]) => t('SCCP-A03 ⭐ ' + fam + ' : Milo lit « ' + ATT + ' » — chaque état a SON mot (jamais « 0 » pour l\'inconnu, jamais « ? » pour un zéro, aucun kilo inventé pour le PDC)', ctx.indexOf(n + ': ' + ATT) >= 0, (ctx.match(new RegExp(n.replace(/[()]/g, '.') + '[^\\n]{0,160}')) || [ctx.slice(0, 200)])[0]));
    // le programme PRESCRIT que Milo reçoit : un PDC / lest / assistance écrit se dit, une charge inconnue ne s'écrit pas « 0 »
    await poser(X, { custom: CUSTOM, programmes: [{ id: 'pM', name: 'Programme fictif pour Milo', prescrit: true, days: [{ label: 'J1', exs: [
      { name: TR, sets: [S0(0, { pdc: 12 }), S0(0, { pdc: 12 }), S0(0, { pdc: 12 })] }, { name: FI, sets: [S0(0, { pdc: -20 })] }, { name: CU, sets: [S0(null), S0(null)] }, { name: DC, sets: [S0(60)] }] }] }] });
    const ctxP = await X.pg.evaluate(() => { try { return String(buildCoachContext('test')); } catch (e) { return 'ERREUR ' + e.message; } });
    const lp = n => (ctxP.match(new RegExp(n.replace(/[()]/g, '.') + ' \\d×[^ ·\\n]*( @[^ ·\\n]*)?')) || [''])[0];
    t('SCCP-A05 ⭐ le programme prescrit que Milo reçoit DIT le PDC / lest / assistance (« 3×8 @PDC+12kg », « 1×8 @PDC−20kg »), une charge inconnue n\'est ni « 0 » ni « @0kg » (« 2×8 »), des kilos restent « @60kg »',
      /Tractions \(Pull-up\) 3×8 @PDC\+12kg/.test(ctxP) && new RegExp(FI + ' 1×8 @PDC−20kg').test(ctxP) && new RegExp(CU + ' 2×8(?! @)').test(ctxP) && /Développé Couché 1×8 @60kg/.test(ctxP), J({ tr: lp(TR), fi: lp(FI), cu: lp(CU), dc: lp(DC) }));
    t('SCCP-A04 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  });

  /* ══ B · LE 1ᵉʳ CHARGEMENT : P03 / P04 — null reste null, zéro reste zéro, le PDC prescrit survit ══════════════════════════ */
  await section('B', 'premier chargement d\'un programme (5 familles, prescrit et ancien) : chaque état survit', async () => {
    const SETS = () => [S0(null), S0(0), S0(0, { pdc: 12 }), S0(0, { pdc: -20 }), S0(0, { pdc: 0 }), S0(0, { vide: true }), S0(60), S0(0, { pdc: 10, vide: true })];
    const ATT = [[null, '', ''], [0, '', ''], [0, 12, ''], [0, -20, ''], [0, 0, ''], [0, '', 'V'], [60, '', ''], [0, 10, '']];
    for (const [prescrit, lib] of [[true, 'programme importé (`prescrit`)'], [false, 'programme d\'AVANT (sans `prescrit`)']]) {
      for (const [nom, fam] of FAMILLES) {
        await poser(X, { custom: CUSTOM, programmes: [Object.assign(prog1(nom, SETS()), prescrit ? {} : { prescrit: undefined })] });
        const r = await X.pg.evaluate(() => { S.wkt = null; _loadProgDayVraiment(0, 0); return S.wkt.exs[0].sets.map(s => [s.kg === undefined ? 'U' : s.kg, s.pdc === undefined ? '' : s.pdc, s.vide ? 'V' : '']); });
        t('SCCP-B01 ⭐⭐ P03 · P04 · ' + lib + ' · ' + fam + ' : [inconnue, zéro, PDC+12, PDC−20, PDC, à vide, 60 kg, (PDC+10 écrit avec « à vide » : le PDC gagne)] survivent au 1ᵉʳ chargement — null ≠ 0, aucun kilo inventé, jamais PDC ET « à vide »',
          J(r) === J(ATT), J(r));
      }
    }
    // aucune attribution : un exercice « poids du corps » SANS `pdc` écrit n'en reçoit jamais un
    await poser(X, { custom: CUSTOM, programmes: [prog1(TR, [S0(null), S0(0)])] });
    const sans = await X.pg.evaluate(() => { _loadProgDayVraiment(0, 0); return S.wkt.exs[0].sets.map(s => s.pdc); });
    t('SCCP-B02 ⛔ jamais attribué d\'office : un exercice au poids du corps (Tractions) dont le programme n\'écrit AUCUN `pdc` n\'en reçoit aucun, ni d\'après son nom ni d\'après le poids de corps', sans.every(x => x === undefined || x === null), J(sans));
    // l'historique : une dernière séance en KILOS gagne (même règle que `kg`) ; une dernière séance sans choix explicite ne retire pas la prescription ; une dernière séance PDC gagne
    const hist = async (kgPrec, pdcPrec) => {
      const prec = Object.assign({ reps: 8, done: true, type: 'N', rm1: 0 }, { kg: kgPrec }, pdcPrec === undefined ? {} : { pdc: pdcPrec });
      await poser(X, { custom: CUSTOM, programmes: [prog1(TR, [S0(0, { pdc: 12 })])], sessions: [{ j: 2, progId: 'pSCCP', progLabel: 'J1', exs: [{ name: TR, sets: [prec] }] }] });
      return X.pg.evaluate(() => { _loadProgDayVraiment(0, 0); const s = S.wkt.exs[0].sets[0]; return [s.kg, s.pdc === undefined ? '' : s.pdc, s.vide ? 'V' : '']; });
    };
    const h1 = await hist(60), h2 = await hist(0), h3 = await hist(0, 5);
    t('SCCP-B03 ⭐ avec une dernière séance de CE jour : des KILOS (60) gagnent sur le PDC prescrit ; une série sans choix explicite (0) laisse la prescription « PDC+12 » ; un PDC+5 fait la dernière fois est repris tel quel',
      J(h1) === J([60, '', '']) && J(h2) === J([0, 12, '']) && J(h3) === J([0, 5, '']), J({ h1, h2, h3 }));
  });

  /* ══ C · LE PARCOURS COMPLET : charger → champ → ✓ → fin de séance → Milo → CSV → « enregistrer en programme » → rechargement ═════ */
  await section('C', 'parcours complet par les vrais gestes (P04 · P05) : le PDC prescrit va jusqu\'au programme ré-enregistré', async () => {
    const PRG = { id: 'pSCCP', name: 'Programme fictif SCCP', prescrit: true, days: [{ label: 'J1', exs: [
      { name: TR, sets: [S0(0, { pdc: 12 }), S0(null), S0(0, { vide: true, reps: 5 }), S0(0, { pdc: -20 })] },
      { name: FI, sets: [S0(0, { pdc: 5, reps: 10 }), S0(0, { reps: 6 })] },
      { name: CU, sets: [S0(0, { pdc: 0, reps: 12 })] }] }] };
    await poser(X, { custom: CUSTOM, programmes: [PRG] });
    await X.pg.evaluate(() => { S.wkt = null; _loadProgDayVraiment(0, 0); }); await voir(X, 0);
    const e0 = await etat(X, 0, 0), e1 = await etat(X, 0, 1), e2 = await etat(X, 0, 2);
    t('SCCP-C01 ⭐⭐ P04 : à l\'écran, la série prescrite « PDC+12 » le DIT dans son champ (jamais un champ vide qui l\'aurait perdue) ; la charge inconnue est vide ; « à vide » le dit en indice',
      e0.v === 'PDC+12' && e0.pdc === 12 && e0.kg === 0 && e0.cls.indexOf('sinp-pdc') >= 0 && e1.v === '' && e1.kg === null && e2.ph === 'à vide' && e2.vide === true, J({ e0, e1, e2 }));
    // ✓ sur chaque série, sans rien taper : rien ne s'invente
    for (const si of [0, 1, 2, 3]) { await X.pg.click(CHK(0, si)); await X.pg.waitForTimeout(80); }
    const apres = await wkt(X);
    t('SCCP-C02 ⭐ valider les séries sans rien taper ne change AUCUN état : PDC+12 reste PDC+12 (kg 0), la charge INCONNUE le reste (null — valider n\'invente pas un zéro), « à vide » reste « à vide », PDC−20 reste PDC−20',
      J(apres[0]) === J([[0, 12, ''], [null, '', ''], [0, '', 'V'], [0, -20, '']]), J(apres[0]));
    await X.pg.evaluate(() => { S.wkt.exs[1].sets.forEach(s => { s.done = true; }); S.wkt.exs[2].sets.forEach(s => { s.done = true; }); persist(); });
    const fin = await X.pg.evaluate(async () => { await finishWorkout(); const s = S.sessions[0]; return { sets: JSON.parse(JSON.stringify(s.exs.map(e => e.sets.map(x => [x.kg === undefined ? 'U' : x.kg, x.pdc === undefined ? '' : x.pdc, x.vide ? 'V' : ''])))), vol: s.volume, prs: Object.keys(S.prs) }; });
    t('SCCP-C03 ⭐ la fin de séance enregistre les états TELS QUELS dans l\'historique (Tractions, fictif, perso) ; volume = 12 × 8 (lest) + 5 × 10 (lest du fictif) = 146 ; aucun record de charge créé',
      J(fin.sets[0]) === J([[0, 12, ''], [null, '', ''], [0, '', 'V'], [0, -20, '']]) && J(fin.sets[1]) === J([[0, 5, ''], [0, '', '']]) && J(fin.sets[2]) === J([[0, 0, '']]) && fin.vol === 146 && fin.prs.length === 0, J(fin));
    // Milo et l'export, sur CETTE séance
    const sortie = await X.pg.evaluate(async () => { const ctx = String(buildCoachContext('test')); const lig = _histoLignes(false); const o = window._donnerFichier; let csv = '';
      window._donnerFichier = async c => { csv = c; return 'ok'; }; _histoAvecDebriefs = false; window.closeHistoExport = window.closeHistoExport || function () {}; await exportHistoCsv(); window._donnerFichier = o;
      return { ctx: (ctx.match(/Tractions \(Pull-up\): [^\n]*/) || [''])[0], lig: lig.filter(r => r.exercise === 'Tractions (Pull-up)').map(r => [r.kg, r.volume, r.charge === undefined ? '' : r.charge]), csv: csv.replace(/^﻿/, '').split('\n').slice(0, 6) }; });
    t('SCCP-C04 ⭐ Milo lit « S1 PDC+12kg×8 · S2 ?×8 · S3 à vide×5 · S4 PDC−20kg×8 » (chaque état, son mot)', sortie.ctx.indexOf('S1 PDC+12kg×8 · S2 ?×8 · S3 à vide×5 · S4 PDC−20kg×8') >= 0, sortie.ctx.slice(0, 200));
    t('SCCP-C05 ⭐ CSV : la colonne `kg` est VIDE pour la charge inconnue (jamais « 0 »), `volume` porte le lest (12 × 8 = 96) et 0 pour l\'assistance, `charge` dit « PDC+12 kg » · « à vide » · « PDC−20 kg »',
      J(sortie.lig) === J([[0, 96, 'PDC+12 kg'], ['', 0, ''], [0, 0, 'à vide'], [0, 0, 'PDC−20 kg']]), J(sortie.lig));
    // « enregistrer en programme » — la vraie fonction, avec le champ de nom rempli
    await X.pg.evaluate(async ([FI, CU]) => { S.wkt = null; _loadProgDayVraiment(0, 0); S.wkt.exs.forEach(e => e.sets.forEach(s => { s.done = true; })); persist(); }, [FI, CU]);
    const sauve = await X.pg.evaluate(() => { document.getElementById('prog-name-inp').value = 'Copie fictive SCCP'; saveAsProg(); const p = S.programmes.find(x => x.name === 'Copie fictive SCCP'); return JSON.parse(JSON.stringify(p.exs.map(e => e.sets.map(s => [s.kg === undefined ? 'U' : s.kg, s.pdc === undefined ? '' : s.pdc, s.vide ? 'V' : ''])))); });
    t('SCCP-C06 ⭐⭐ P05 : « enregistrer en programme » garde chaque état — PDC+12 · inconnue (null) · « à vide » · PDC−20 · fictif PDC+5 · perso PDC (rien n\'est converti en kilos, rien n\'est perdu)',
      J(sauve[0]) === J([[0, 12, ''], [null, '', ''], [0, '', 'V'], [0, -20, '']]) && J(sauve[1]) === J([[0, 5, ''], [0, '', '']]) && J(sauve[2]) === J([[0, 0, '']]), J(sauve));
    // un vrai rechargement, puis le programme ré-enregistré est rechargé dans une séance
    await X.pg.reload(); await X.pg.waitForTimeout(1500);
    const rl = await X.pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); const i = S.programmes.findIndex(p => p.name === 'Copie fictive SCCP'); S.wkt = null; _loadProgVraiment(i);
      return { stock: JSON.parse(localStorage.getItem('ft4_progs')).find(p => p.name === 'Copie fictive SCCP').exs[0].sets.map(s => [s.kg === undefined ? 'U' : s.kg, s.pdc === undefined ? '' : s.pdc, s.vide ? 'V' : '']), wkt: S.wkt.exs[0].sets.map(s => [s.kg === undefined ? 'U' : s.kg, s.pdc === undefined ? '' : s.pdc, s.vide ? 'V' : '']) }; });
    t('SCCP-C07 ⭐ après un vrai rechargement, le programme ré-enregistré est INTACT dans le stockage local ET rechargé en séance (PDC+12 · null · à vide · PDC−20) : la chaîne est fermée',
      J(rl.stock) === J([[0, 12, ''], [null, '', ''], [0, '', 'V'], [0, -20, '']]) && J(rl.wkt) === J(rl.stock), J(rl));
    // une ancienne donnée contradictoire (PDC ET « à vide ») n'est pas recopiée telle quelle dans le programme
    const contra = await X.pg.evaluate(() => { S.wkt = { date: today(), startHour: 10, startTs: Date.now() - 6e4, exs: [{ name: 'Tractions (Pull-up)', sets: [{ kg: 0, reps: 8, done: true, type: 'N', rm1: 0, pdc: 7, vide: true }] }] };
      document.getElementById('prog-name-inp').value = 'Copie contradictoire SCCP'; saveAsProg(); const p = S.programmes.find(x => x.name === 'Copie contradictoire SCCP'); const st = p.exs[0].sets[0]; return [st.kg, st.pdc === undefined ? '' : st.pdc, st.vide ? 'V' : '']; });
    t('SCCP-C09 ⭐ « enregistrer en programme » d\'une série qui portait PDC ET « à vide » (ancienne donnée contradictoire) n\'écrit que le PDC — jamais les deux', J(contra) === J([0, 7, '']), J(contra));
    t('SCCP-C08 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  });

  /* ══ D · P10 : « PDC » et « à vide » ne coexistent jamais — par les gestes de la séance ET par l'éditeur de programme ════════ */
  await section('D', 'P10 — pas de PDC ET de « à vide » (gestes de la séance, éditeur de programme)', async () => {
    await poser(X, { custom: CUSTOM, wkt: FAMILLES.map(([n]) => ({ name: n, sets: [{ reps: 8, vide: true }, { reps: 8, vide: true }, { reps: 8, vide: true }] })) });
    for (let ei = 0; ei < FAMILLES.length; ei++) {
      await voir(X, ei);
      const av = await etat(X, ei, 0);
      await X.pg.click(KG(ei, 0)); await X.pg.click(BTN(ei, 0, '0')); await X.pg.keyboard.press('Tab'); await X.pg.waitForTimeout(100);
      const p0 = await etat(X, ei, 0);
      await X.pg.click(KG(ei, 1)); await X.pg.click(BTN(ei, 1, '+')); await X.pg.keyboard.type('10'); await X.pg.keyboard.press('Tab'); await X.pg.waitForTimeout(100);
      const p1 = await etat(X, ei, 1);
      t('SCCP-D01 ⭐⭐ P10 · ' + FAMILLES[ei][1] + ' : choisir « PDC » sur une barre « à vide » retire « à vide » (avant : `vide:true` ET `pdc:0` ensemble) ; « PDC + lest » puis 10 de même ; l\'indice ne dit plus « à vide »',
        av.vide === true && p0.pdc === 0 && p0.vide === undefined && p0.ph !== 'à vide' && p1.pdc === 10 && p1.vide === undefined && p1.kg === 0, J({ av, p0, p1 }));
    }
    // le geste inverse : une série PDC puis « à vide » (le même appui qu'un 2ᵉ choix) — via la validation sans rien taper la reprise ne mélange rien
    await poser(X, { custom: CUSTOM, wkt: [{ name: TR, sets: [{ reps: 8, vide: true, pdc: 7 }] }] });   // une ancienne donnée contradictoire (avant la correction)
    const ctx = await X.pg.evaluate(() => _kgTxtSerie(S.wkt.exs[0].sets[0]));
    t('SCCP-D02 une donnée ancienne contradictoire (PDC+7 ET « à vide ») se lit PDC — jamais les deux', ctx === 'PDC+7kg', ctx);
    const ret = await X.pg.evaluate(() => { upSet(0, 0, 'kg', '+12'); const s = S.wkt.exs[0].sets[0]; return [s.kg, s.pdc, s.vide ? 'V' : '']; });
    t('SCCP-D02b ⭐ le montant d\'un lest tapé dans le champ d\'une série encore « à vide » (donnée ancienne) retire « à vide » : PDC+12, jamais les deux', J(ret) === J([0, 12, '']), J(ret));
    // l'éditeur de programme : un programme avec un PDC prescrit
    const PRG = { id: 'pEDP', name: 'Programme fictif SCCP-éditeur', prescrit: true, days: [{ label: 'J1', exs: [{ name: TR, sets: [S0(0, { pdc: 12 }), S0(0, { pdc: -20 }), S0(0, { pdc: 5 }), S0(null)] }] }] };
    await poser(X, { custom: CUSTOM, programmes: [PRG] });
    await X.pg.evaluate(() => { editProg(0); }); await X.pg.waitForTimeout(300);
    const ed = await X.pg.evaluate(() => [...document.querySelectorAll('#ov-prog-edit .pe-row')].map(r => { const i = r.querySelector('[data-ch="kg"]'); return [i.value, i.placeholder, r.querySelector('[data-ch="vide"]').getAttribute('aria-pressed')]; }));
    t('SCCP-D03 ⭐ l\'éditeur de programme MONTRE un PDC prescrit (indice « PDC+12 » · « PDC−20 » · « PDC+5 », champ de kilos vide) — il n\'est plus invisible ; la charge inconnue dit « kg »', J(ed) === J([['', 'PDC+12', 'false'], ['', 'PDC−20', 'false'], ['', 'PDC+5', 'false'], ['', 'kg', 'false']]), J(ed));
    await X.pg.evaluate(() => { saveProgEdit(); });                                  // ouvrir puis enregistrer SANS rien toucher
    const intact = await X.pg.evaluate(() => JSON.parse(JSON.stringify(S.programmes[0].days[0].exs[0].sets.map(s => [s.kg === undefined ? 'U' : s.kg, s.pdc === undefined ? '' : s.pdc, s.vide ? 'V' : '']))));
    t('SCCP-D04 ⭐ ouvrir l\'éditeur puis enregistrer SANS toucher ne change rien : PDC+12 · PDC−20 · PDC+5 · inconnue (null) — le PDC prescrit n\'est pas perdu à l\'enregistrement', J(intact) === J([[0, 12, ''], [0, -20, ''], [0, 5, ''], [null, '', '']]), J(intact));
    await X.pg.evaluate(() => { editProg(0); }); await X.pg.waitForTimeout(300);
    const ROW = si => `#ov-prog-edit .pe-row[data-si="${si}"]`;
    await X.pg.click(ROW(0) + ' [data-ch="vide"]'); await X.pg.waitForTimeout(100);                        // « vide » sur une série PDC+12 : le dernier geste gagne
    await X.pg.fill(ROW(1) + ' [data-ch="kg"]', '25'); await X.pg.press(ROW(1) + ' [data-ch="kg"]', 'Tab'); await X.pg.waitForTimeout(100);   // des kilos sur une série PDC−20
    await X.pg.focus(ROW(2) + ' [data-ch="kg"]'); await X.pg.press(ROW(2) + ' [data-ch="kg"]', 'Tab'); await X.pg.waitForTimeout(100);        // le champ vide traversé sans rien taper : la prescription reste
    await X.pg.evaluate(() => { saveProgEdit(); });
    const apres = await X.pg.evaluate(() => JSON.parse(JSON.stringify(S.programmes[0].days[0].exs[0].sets.map(s => [s.kg === undefined ? 'U' : s.kg, s.pdc === undefined ? '' : s.pdc, s.vide ? 'V' : '']))));
    t('SCCP-D05 ⭐⭐ P10 côté programme : « vide » sur PDC+12 retire le PDC (jamais les deux) ; 25 kg tapés sur PDC−20 le remplacent ; traverser le champ vide de PDC+5 sans rien taper ne l\'efface PAS',
      J(apres) === J([[0, '', 'V'], [25, '', ''], [0, 5, ''], [null, '', '']]), J(apres));
    // « + série » copie le PDC prescrit de la série d'avant et laisse inconnue une charge inconnue ; vider (programmatiquement) le champ d'une série PDC ne l'efface pas
    await X.pg.evaluate(() => { editProg(0); }); await X.pg.waitForTimeout(300);
    await X.pg.click('#ov-prog-edit button:has-text("+ série")'); await X.pg.waitForTimeout(100);
    const copie = await X.pg.evaluate(() => { const l = _editProgData.days[0].exs[0].sets; const a = l[l.length - 1]; _setProgSetKg(0, 0, 2, '', null); return { last: [a.kg, a.pdc === undefined ? '' : a.pdc], pdc2: _editProgData.days[0].exs[0].sets[2].pdc, kg2: _editProgData.days[0].exs[0].sets[2].kg, ed2: !!_editProgData.days[0].exs[0].sets[2].ed, n: l.length }; });
    t('SCCP-D05b ⭐ « + série » de l\'éditeur copie la série d\'avant — la charge INCONNUE reste inconnue (null) ; (copiée d\'une série PDC+5 elle garde le PDC) ; vider le champ d\'une série PDC prescrite ne l\'efface pas', J(copie.last) === J([null, '']) && copie.n === 5 && copie.pdc2 === 5 && copie.kg2 === 0 && copie.ed2 === false, J(copie));   // kg reste 0 (convention d\'une série PDC) et aucune « retouche » n\'est posée
    await X.pg.evaluate(() => { _editProgData.days[0].exs[0].sets[4].pdc = 9; _editProgData.days[0].exs[0].sets[4].kg = 0; const ex = _editProgData.days[0].exs[0]; _addProgSet(0, 0); window.__c = ex.sets[ex.sets.length - 1]; });
    const copie2 = await X.pg.evaluate(() => [window.__c.kg, window.__c.pdc === undefined ? '' : window.__c.pdc]);
    t('SCCP-D05c ⭐ « + série » copie le PDC prescrit de la série d\'avant (PDC+9 → PDC+9, kg 0)', J(copie2) === J([0, 9]), J(copie2));
    await X.pg.evaluate(() => { closeProgEdit(); });
    // la charge inconnue : la vider ne la rend pas « zéro » ; « à vide » retiré non plus
    await X.pg.evaluate(() => { editProg(0); }); await X.pg.waitForTimeout(300);
    await X.pg.fill(ROW(1) + ' [data-ch="kg"]', ''); await X.pg.press(ROW(1) + ' [data-ch="kg"]', 'Tab');
    await X.pg.click(ROW(0) + ' [data-ch="vide"]'); await X.pg.waitForTimeout(100);                        // « à vide » retiré
    await X.pg.evaluate(() => { saveProgEdit(); });
    const inc = await X.pg.evaluate(() => JSON.parse(JSON.stringify(S.programmes[0].days[0].exs[0].sets.slice(0, 2).map(s => [s.kg === undefined ? 'U' : s.kg, s.vide ? 'V' : '']))));
    t('SCCP-D06 ⭐ vider une charge (25 → vide) ou retirer « à vide » rend la charge INCONNUE (null), jamais un zéro inventé', J(inc) === J([[null, ''], [null, '']]), J(inc));
    t('SCCP-D07 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  });

  /* ══ E · LE LEST AU TONNAGE, LE RECORD DE LEST (arbitrage de Michel) ════════════════════════════════════════════════════ */
  await section('E', 'lest : tonnage (3 × 10 kg de lest = 30), record de lest dérivé, assistance sans règle, passé intact, calories inchangées', async () => {
    const T = (extra) => Object.assign({ reps: 8, done: true, type: 'N', rm1: 0 }, extra);
    await poser(X, { custom: CUSTOM, wkt: [
      { name: TR, sets: [T({ reps: 3, pdc: 10 }), T({ reps: 3, pdc: 10 }), T({ reps: 3, pdc: 10 }), T({ reps: 8, pdc: -20 }), T({ reps: 8, pdc: 0 }), T({ reps: 8, pdc: 30, type: 'É' })] },
      { name: DC, sets: [T({ reps: 5, kg: 60 }), T({ reps: 5, kg: 0 })] },
      { name: RH, sets: [T({ reps: 6, pdc: 8 })] },
      { name: CU, sets: [T({ reps: 10, pdc: 5 })] },
      { name: FI, sets: [T({ reps: 10, pdc: 5 }), T({ reps: 4, kg: null })] }] });
    const av = await X.pg.evaluate(async () => { const meta = (() => { _expandedEx = 0; renderLog(); return document.querySelector('#ex-block-0 .ex-meta').textContent; })();
      S.bw = 82; await finishWorkout(); const s = S.sessions[0]; const c = JSON.parse(JSON.stringify(s)); c.exs.forEach(e => e.sets.forEach(x => { delete x.pdc; })); c.exercises = c.exs;
      return { vol: s.volume, tot: Math.round(_workVol(s, true)), prs: Object.keys(S.prs), cal: calcSessionCalories(s).total, calSans: calcSessionCalories(c).total, enreg: s.calories, meta, csv: _histoLignes(false).map(r => r.volume).reduce((a, v) => a + v, 0) }; });
    // 3×(3×10) = 90 (Tractions) · assistance, PDC, lest d'échauffement : 0 · DC 60×5 = 300 · RH : 6×8×2 (unilatéral, ×2 : convention existante) = 96 · perso 10×5 = 50 · fictif 10×5 = 50 → 586
    t('SCCP-E01 ⭐⭐ le lest participe au tonnage SELON LA CONVENTION EXISTANTE : 3 répétitions avec 10 kg de lest = 30 (Tractions 3 × 30 = 90) ; une assistance (−20), un PDC seul et un lest d\'ÉCHAUFFEMENT comptent 0 ; un lest d\'un exercice à un bras est doublé comme les kilos (6 × 8 × 2 = 96) ; perso 50, fictif 50, barre 300 — volume 586',
      av.vol === 586, J({ vol: av.vol }));
    t('SCCP-E02 ⭐ le volume TOTAL (échauffements compris) compte le lest d\'échauffement (30 × 8 = 240) : 586 + 240 = 826 — même règle, seul le tri des paliers change', av.tot === 826, J(av));
    t('SCCP-E03 ⛔ aucun record de CHARGE n\'est créé par un lest, un PDC ou une assistance : seul le Développé Couché (60 × 5) a un record dans `S.prs`', J(av.prs) === J([DC]), J(av.prs));
    t('SCCP-E04 ⭐ les CALORIES ne bougent pas : la même séance SANS le champ `pdc` donne exactement le même total, et c\'est celui qui est enregistré (aucun NaN)', av.cal === av.calSans && av.enreg === av.cal && av.cal > 0 && isFinite(av.cal), J({ cal: av.cal, sans: av.calSans, enreg: av.enreg }));
    t('SCCP-E05 la carte de l\'exercice compte le lest comme la séance (règle existante de la carte : TOUTES les séries faites, échauffements compris — Tractions 3 × 30 + 30 × 8 = 330 kg)', /· 330kg/.test(av.meta), av.meta);
    t('SCCP-E05b ⭐ l\'export (une ligne par série) refait la somme : chaque ligne porte son lest (volume = lest × répétitions × facteur), la somme des lignes = le volume TOTAL de la séance (826)', av.csv === 826, J({ csv: av.csv }));
    // le record de lest : dérivé, distinct, jamais d'assistance
    await poser(X, { custom: CUSTOM, sessions: [
      { j: 9, exs: [{ name: TR, sets: [T({ reps: 5, pdc: 10 }), T({ reps: 5, pdc: -30 })] }, { name: FI, sets: [T({ reps: 5, pdc: -10 })] }] },
      { j: 4, exs: [{ name: TR, sets: [T({ reps: 6, pdc: 10 }), T({ reps: 5, pdc: 40, type: 'É' })] }] }],
      wkt: [{ name: TR, sets: [{ reps: 3, pdc: 15 }, { reps: 8, pdc: 0 }] }, { name: FI, sets: [{ reps: 8, pdc: -20 }] }] });
    const rec = await X.pg.evaluate(([TR, FI]) => ({ tr: _recordLest(TR), fi: _recordLest(FI), prs: Object.keys(S.prs) }), [TR, FI]);
    t('SCCP-E06 ⭐ record de lest DÉRIVÉ des séances terminées : Tractions +10 × 6 (le plus lourd de TRAVAIL — un lest de 40 en échauffement ne compte pas —, puis le plus de répétitions) ; AUCUN record pour une assistance (le fictif n\'a fait que −10) ; rien dans `S.prs`',
      rec.tr && rec.tr.lest === 10 && rec.tr.reps === 6 && rec.fi === null && rec.prs.length === 0, J(rec));
    await voir(X, 0);
    const meta0 = await X.pg.evaluate(() => document.querySelector('#ex-block-0 .ex-meta').textContent);
    await voir(X, 1);
    const meta1 = await X.pg.evaluate(() => document.querySelector('#ex-block-1 .ex-meta').textContent);
    t('SCCP-E07 ⭐ la carte de l\'exercice dit le record de lest là où elle dit déjà le 1RM (« lest max +10 kg ») ; rien pour l\'exercice qui n\'a qu\'une assistance', /lest max \+10 kg/.test(meta0) && !/lest max/.test(meta1), J({ meta0, meta1 }));
    await X.pg.evaluate(() => { S.wkt.exs.forEach(e => e.sets.forEach(s => { s.done = true; })); persist(); });
    const fin = await X.pg.evaluate(async () => { await finishWorkout(); const el = document.getElementById('se-stats'); return { txt: el ? el.innerText.replace(/\s+/g, ' ') : '', prs: Object.keys(S.prs), rec: _recordLest('Tractions (Pull-up)') }; });
    t('SCCP-E08 ⭐⭐ un lest qui BAT le record (+15 contre +10) se dit à la fin de la séance (« Record de lest … Tractions (Pull-up) +15 kg × 3 »), à part du 🏆 ; l\'assistance de la même séance n\'en crée aucun ; toujours rien dans `S.prs`',
      /Record de lest/i.test(fin.txt) && /Tractions \(Pull-up\) \+15 kg × 3/i.test(fin.txt) && !/Zorglub/i.test(fin.txt.split(/Record de lest/i)[1] || '') && fin.prs.length === 0 && fin.rec.lest === 15, J(fin));
    // une 1ʳᵉ fois n'est pas un record
    await poser(X, { custom: CUSTOM, wkt: [{ name: TR, sets: [{ reps: 4, pdc: 10, done: true }] }] });
    const prem = await X.pg.evaluate(async () => { await finishWorkout(); const el = document.getElementById('se-stats'); return el ? el.innerText.replace(/\s+/g, ' ') : ''; });
    t('SCCP-E09 un PREMIER lest n\'est pas annoncé comme un record (aucun lest avant : une référence)', !/Record de lest/i.test(prem), prem.slice(0, 200));
    // le passé ne bouge pas : une séance SANS PDC garde à l'octet son volume ; une séance enregistrée avant n'est pas réécrite ; l'unilatéral reste ×2
    await poser(X, { custom: CUSTOM, sessions: [{ j: 5, exs: [{ name: DC, sets: [T({ reps: 8, kg: 100 }), T({ reps: 8, kg: 100 })] }, { name: RH, sets: [T({ reps: 8, kg: 20 })] }] },
      { j: 6, uniConv: 0, exs: [{ name: RH, sets: [T({ reps: 8, kg: 20 })] }, { name: TR, sets: [T({ reps: 8, pdc: 10 })] }] }] });
    await X.pg.evaluate(() => { S.sessions.forEach(s => { if (!s.uniConv) s.volume = 160; }); persist(); });   // une séance « enregistrée par la version d'avant » : son volume rangé vaut 160 (le lest n'y était pas)
    const pass = await X.pg.evaluate(() => { const v = S.sessions.map(s => [Math.round(_workVol(s)), s.volume]); const stock0 = JSON.parse(localStorage.getItem('ft4_sessions')).map(s => s.volume); persist(); const stock1 = JSON.parse(localStorage.getItem('ft4_sessions')).map(s => s.volume); return { v, stock0, stock1 }; });
    t('SCCP-E10 ⭐ le passé ne bouge pas : une séance SANS PDC garde à l\'octet son volume (2 × 8 × 100 + 8 × 20 × 2 = 1920 ; avant la convention unilatérale : 160) ; le volume ENREGISTRÉ d\'une séance (160) n\'est JAMAIS réécrit — enregistrer de nouveau laisse les mêmes nombres (seul l\'affichage d\'une séance portant un LEST le compte : le champ n\'existe que depuis cette version)',
      pass.v[0][0] === 1920 && pass.v[1][0] === 160 + 80 && pass.stock0[1] === 160 && J(pass.stock0) === J(pass.stock1), J(pass));
    t('SCCP-E11 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  });

  /* ══ F · LES CHEMINS DÉGRESSIFS : la structure, les paliers et chaque état de charge survivent ═══════════════════════════════ */
  await section('F', 'dégressifs (dropset) : chargement, affichage des paliers, validation, « enregistrer en programme »', async () => {
    const DS = { paliers: 3, pct: 10, direction: 'down' };
    for (const [nom, fam] of FAMILLES) {
      const PRG = { id: 'pDS', name: 'Programme fictif dégressif', prescrit: true, days: [{ label: 'J1', exs: [
        { name: nom, dropset: JSON.parse(J(DS)), sets: [S0(null, { type: 'D' }), S0(0, { pdc: 10, type: 'D' }), S0(0, { pdc: -5, type: 'D' })] }] }] };
      await poser(X, { custom: CUSTOM, programmes: [PRG] });
      const r = await X.pg.evaluate(() => { S.wkt = null; _loadProgDayVraiment(0, 0); const e = S.wkt.exs[0]; return { ds: e.dropset, sets: e.sets.map(s => [s.kg === undefined ? 'U' : s.kg, s.pdc === undefined ? '' : s.pdc, s.type]) }; });
      t('SCCP-F01 ⭐ ' + fam + ' : un dégressif chargé garde sa structure (paliers · % · sens) et l\'état de chaque palier — inconnue (null) · PDC+10 · PDC−5, type D',
        J(r.ds) === J(DS) && J(r.sets) === J([[null, '', 'D'], [0, 10, 'D'], [0, -5, 'D']]), J(r));
    }
    // l'affichage des paliers (ligne courante puis lignes faites) et la validation par un vrai appui
    const PRG = { id: 'pDS', name: 'Programme fictif dégressif', prescrit: true, days: [{ label: 'J1', exs: [{ name: TR, dropset: { paliers: 3, pct: 10, direction: 'down' }, sets: [S0(0, { pdc: 10, type: 'D' }), S0(0, { pdc: 10, type: 'D' }), S0(null, { type: 'D' })] }] }] };
    await poser(X, { custom: CUSTOM, programmes: [PRG] });
    await X.pg.evaluate(() => { S.wkt = null; _loadProgDayVraiment(0, 0); }); await voir(X, 0);
    const cour = await X.pg.evaluate(() => { const r = document.getElementById('sr-0-0'); return r ? [...r.querySelectorAll('.sinp')].map(i => i.value) : null; });
    await X.pg.click(CHK(0, 0)); await X.pg.waitForTimeout(250);
    const fait = await X.pg.evaluate(() => { const r = document.getElementById('sr-0-0'); return r ? r.innerText.replace(/\s+/g, ' ') : ''; });
    const st = await wkt(X);
    t('SCCP-F02 ⭐ le palier courant d\'un dégressif DIT son PDC (« PDC+10 » dans le champ, pas un champ vide), le palier fait aussi ; valider sans rien taper garde PDC+10 (kg 0) et laisse les autres paliers tels quels',
      J(cour) === J(['8', 'PDC+10']) && /PDC\+10/.test(fait) && J(st[0]) === J([[0, 10, ''], [0, 10, ''], [null, '', '']]), J({ cour, fait: fait.slice(0, 80), st }));
    await X.pg.evaluate(() => { S.wkt.exs[0].sets.forEach(s => { s.done = true; }); persist(); });
    const sauve = await X.pg.evaluate(() => { document.getElementById('prog-name-inp').value = 'Copie dégressive SCCP'; saveAsProg(); const p = S.programmes.find(x => x.name === 'Copie dégressive SCCP'); const e = p.exs[0]; return JSON.parse(JSON.stringify({ ds: e.dropset, sets: e.sets.map(s => [s.kg === undefined ? 'U' : s.kg, s.pdc === undefined ? '' : s.pdc, s.type]) })); });
    t('SCCP-F03 ⭐ « enregistrer en programme » d\'un dégressif garde la structure ET chaque état (PDC+10 · PDC+10 · inconnue)', J(sauve.ds) === J({ paliers: 3, pct: 10, direction: 'down' }) && J(sauve.sets) === J([[0, 10, 'D'], [0, 10, 'D'], [null, '', 'D']]), J(sauve));
    t('SCCP-F04 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  });

  /* ══ G · LES SORTIES : CSV, PDF, tableur (Sheets), « sans PDC le fichier est celui d'avant » ══════════════════════════════════ */
  await section('G', 'export CSV / PDF et file vers le tableur : chaque état garde sa lecture', async () => {
    const T = (extra) => Object.assign({ reps: 8, done: true, type: 'N', rm1: 0 }, extra);
    await poser(X, { custom: CUSTOM, sessions: [{ j: 2, exs: [{ name: TR, sets: [T({ pdc: 0 }), T({ pdc: 10 }), T({ pdc: -20 })] }, { name: DC, sets: [T({ kg: 60 }), T({ kg: 0 }), T({ kg: null }), T({ kg: 0, vide: true })] }] }] });
    const g = await X.pg.evaluate(async () => { const o = window._donnerFichier; let csv = ''; window._donnerFichier = async c => { csv = c; return 'ok'; }; _histoAvecDebriefs = false; window.closeHistoExport = window.closeHistoExport || function () {}; await exportHistoCsv(); window._donnerFichier = o;
      const ls = csv.replace(/^﻿/, '').split('\n'); const rows = _buildSyncRows(S.sessions[0]);
      return { entete: ls[0], dc: ls.filter(l => /Développé Couché/.test(l)), rows: rows.map(r => [r.exercise.slice(0, 4), r.kg, r.volume]), numeriques: rows.every(r => (typeof r.kg === 'number' && isFinite(r.kg) && typeof r.volume === 'number' && isFinite(r.volume)) || (r.kg === '' && r.volume === '')) }; });
    t('SCCP-G01 ⭐ CSV : les quatre états du Développé Couché se lisent — 60 · 0 · (vide : charge inconnue) · 0 + « à vide » ; la colonne `charge` existe parce qu\'il y a du PDC / « à vide »',
      /;charge$/.test(g.entete) && /;60;8;;480;?/.test(g.dc[0]) && /;0;8;;0;?/.test(g.dc[1]) && /;;8;;0;?/.test(g.dc[2]) && /à vide$/.test(g.dc[3]), J(g));
    /* ↪️ RÉÉCRIT le 21/11/2026 (intégration V4, décision de Michel du 20/11 : « l'export Sheets préserve la distinction inconnu / zéro »). AVANT : « inconnue, zéro, PDC, à vide y sont 0 — limite connue » — une charge INCONNUE partait en `0` (volume 0), indiscernable d'un vrai zéro.
       INVARIANT GARDÉ : la file part en NOMBRES ou en cellule VIDE — jamais `null` / `NaN` ; le PDC et « à vide » restent 0 (kg 0 écrit) ; le lest n'est pas dans `kg`. CHANGÉ : la charge INCONNUE est une cellule VIDE (kg ET volume), le ZÉRO ÉCRIT reste 0. */
    t('SCCP-G02 ⭐ la file vers le tableur (Sheets, `_buildSyncRows`) part en NOMBRES ou en cellule VIDE (jamais null / NaN) : la charge INCONNUE est une cellule vide (kg et volume), le zéro écrit, le PDC et « à vide » restent 0 ; le lest n\'y est pas dans `kg`',
      g.numeriques && g.rows.filter(r => r[0] === 'Trac').every(r => r[1] === 0 && r[2] === 0) && J(g.rows.filter(r => r[0] === 'Déve').map(r => [r[1], r[2]])) === J([[60, 480], [0, 0], ['', ''], [0, 0]]), J(g.rows));
    // PDF : la même ligne, `charge` à la place de `kg` quand elle existe (le PDF suit le producteur unique)
    const pdf = await X.pg.evaluate(async () => { try { await _loadJsPdf(); const A = (window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API); if (!A || !A.autoTable) return { err: 'autoTable absent' };
      const orig = A.autoTable; let corps = null; A.autoTable = function (o) { corps = o.body; return orig.apply(this, arguments); };
      const od = window._donnerFichier; window._donnerFichier = async () => 'ok'; window.closeHistoExport = window.closeHistoExport || function () {}; await exportHistoPdf(); window._donnerFichier = od; A.autoTable = orig;
      return { corps }; } catch (e) { return { err: String(e && e.message) }; } });
    t('SCCP-G03 ⭐ PDF : la colonne de charge dit « PDC », « PDC+10 kg », « PDC−20 kg », « à vide » ; 60 reste 60 ; l\'inconnue reste VIDE', !pdf.err && pdf.corps && J(pdf.corps.filter(r => /Trac/.test(r[0])).map(r => r[3])) === J(['PDC', 'PDC+10 kg', 'PDC−20 kg']) && J(pdf.corps.filter(r => /Dével/.test(r[0])).map(r => r[3])) === J([60, 0, '', 'à vide']), J(pdf));
    // sans aucun PDC ni « à vide » : le fichier est EXACTEMENT celui d'avant (même en-tête)
    await poser(X, { custom: CUSTOM, sessions: [{ j: 2, exs: [{ name: DC, sets: [T({ kg: 60 }), T({ kg: 0 })] }] }] });
    const sans = await X.pg.evaluate(async () => { const o = window._donnerFichier; let csv = ''; window._donnerFichier = async c => { csv = c; return 'ok'; }; await exportHistoCsv(); window._donnerFichier = o; return { entete: csv.replace(/^﻿/, '').split('\n')[0], cols: HISTO_COLONNES.join(';') }; });
    t('SCCP-G04 ⭐ sans aucun PDC ni « à vide », l\'en-tête du CSV est EXACTEMENT celui d\'avant (aucune colonne en plus)', sans.entete === sans.cols, sans.entete);
    t('SCCP-G05 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  });
  await X.cx.close();

  /* ══ H · D-167 : un échauffement d'un mouvement INCONNU n'est jamais classé cardio sans un oui ════════════════════════════════ */
  await section('H', 'D-167 — E01 : jamais de cardio sans confirmation, séries gardées (fonctions)', async () => {
    const Y = await ouvrir();
    await poser(Y, { custom: CUSTOM });
    const r = await Y.pg.evaluate(([DC, CU, FI]) => {
      const ex = (name, note, sets, extra) => Object.assign({ name, note, sets }, extra || {});
      const W = (kg) => [{ kg, reps: 8, type: 'W' }];
      const cas = {
        E01: ex('Échauffement - Zeta fictif', '10 min tranquille', W(0)),
        E01ok: ex('Échauffement - Zeta fictif', '10 min tranquille', W(0), { _cardioOk: true }),
        E02: ex('Échauffement - ' + DC, '10 min tranquille', W(0)),
        E03: ex('Échauffement - Zeta fictif', '10 min tranquille', W(20)),
        E04: ex('Échauffement', '10 min vélo', W(0)),
        E05: ex('Échauffement - 5 min', '', W(0)),
        E06: ex('Zeta fictif (ECH)', '8 min légères', W(0)),
        E07: ex('Zeta fictif - échauffement', '8 min légères', W(0)),
        E08: ex('Échauffement - ' + FI, '12 min tranquille', W(0)),
        E09: ex('Échauffement - ' + CU, '12 min tranquille', W(0)),
        E10: ex('Warm-up - vélo', '8 min', W(0)),
        E11: ex('Échauffement - Zeta fictif', 'tranquille', W(0))     // aucune durée lisible : jamais du cardio de toute façon
      };
      const o = {};
      Object.keys(cas).forEach(k => { const r = _extraireCardioMilo([JSON.parse(JSON.stringify(cas[k])), { name: 'Zeta travail', sets: [{ kg: 50, reps: 8 }] }]); o[k] = { cardio: !!r.avant, noms: r.exs.map(e => e.name), series: (r.exs[0].sets || []).length, aConfirmer: _creneauAConfirmer(cas[k]) }; });
      return o; }, [DC, CU, FI]);
    t('SCCP-H01 ⭐⭐ E01 : « Échauffement - Zeta fictif » (mouvement inconnu, série W sans charge, « 10 min tranquille ») RESTE un exercice avec sa série (avant : classé cardio, série perdue) ; l\'aperçu doit le demander',
      !r.E01.cardio && r.E01.noms[0] === 'Échauffement - Zeta fictif' && r.E01.series === 1 && r.E01.aConfirmer === true, J(r.E01));
    t('SCCP-H02 ⭐ … et SEUL un oui explicite (`_cardioOk`) le range au cardio (10 min) — la série part alors avec le cardio, sur confirmation', r.E01ok.cardio === true && r.E01ok.noms.length === 1, J(r.E01ok));
    t('SCCP-H03 ⭐ E02 · E03 : un mouvement CONNU (catalogue) ou une ligne AVEC charge reste un exercice, jamais en question (inchangé)', !r.E02.cardio && r.E02.aConfirmer === false && !r.E03.cardio && r.E03.aConfirmer === false, J({ e2: r.E02, e3: r.E03 }));
    t('SCCP-H04 ⭐ E04 · E05 · E10 : un créneau nommé (« Échauffement » + « 10 min vélo », « Échauffement - 5 min », « Warm-up - vélo ») reste du CARDIO sans question — le comportement d\'avant ne régresse pas',
      r.E04.cardio === true && r.E04.aConfirmer === false && r.E05.cardio === true && r.E10.cardio === true, J({ e4: r.E04, e5: r.E05, e10: r.E10 }));
    t('SCCP-H05 ⭐ les trois formes de marqueur (« Zeta (ECH) », « Zeta - échauffement », « Échauffement - Zeta ») et un exercice FICTIF inédit ou PERSONNALISÉ en base : tous restent des exercices, séries gardées ; seul « Échauffement - X » (la forme qui était classée cardio) est à confirmer',
      [r.E06, r.E07, r.E08, r.E09].every(x => !x.cardio && x.series === 1) && r.E08.aConfirmer === true && r.E06.aConfirmer === false && r.E07.aConfirmer === false, J({ e6: r.E06, e7: r.E07, e8: r.E08, e9: r.E09 }));
    t('SCCP-H06 sans durée lisible ce n\'est jamais du cardio ni une question (E11)', !r.E11.cardio && r.E11.aConfirmer === false, J(r.E11));
    await Y.cx.close();
  });

  await section('I', 'D-167 — la VRAIE chaîne d\'import : l\'aperçu demande, la réponse décide, le programme garde les séries', async () => {
    const Y = await ouvrir();
    const EXI = (name, repsPerSet, kgPerSet, note, extra) => Object.assign({ name, sets: repsPerSet.length, reps: repsPerSet[0] || 0, repsPerSet: repsPerSet.slice(), specialSets: [], kg: 0, kgPerSet: kgPerSet.slice(), supersetGroup: '', setType: '', note: note || '' }, extra || {});
    const prog = (...ex) => ({ name: 'Programme fictif D167', weeks: 4, startDate: '', days: [{ label: 'SÉANCE A', exercises: ex }] });
    const importer = async p => { Y.prog(p); return Y.pg.evaluate(async () => { S.premium = true; S.programmes = []; S.customExercises = []; S.exRestPref = {}; S.defRest = 130; S.sessions = []; persist();
      _impPhotos = [{ type: 'text/plain', data: 'programme', name: 'prog.txt', isText: true }]; _impMode = 'new'; await analyzeImportPhotos(); document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); document.getElementById('ov-import-prog').classList.add('open'); const el = document.getElementById('imp-preview'); return { texte: el ? el.innerText.replace(/\s+/g, ' ') : '', html: el ? el.innerHTML : '' }; }); };
    const finir = () => Y.pg.evaluate(() => { finalImportProg(); const p = S.programmes[S.programmes.length - 1]; return JSON.parse(JSON.stringify(p)); });
    const E01 = () => EXI('Échauffement - Zeta Fictif Pivotant', [8], [], '10 min tranquille', { setType: 'W' });
    const TRAV = () => EXI('Zeta Travail Fictif', [5, 5], [50, 50], 'RIR 2');
    // 1) sans réponse : exercice gardé, série gardée, rien en cardio
    const ap = await importer(prog(E01(), TRAV()));
    t('SCCP-I01 ⭐⭐ l\'aperçu DEMANDE (« à toi de dire », deux boutons « Mettre dans le cardio » / « Garder comme exercice ») pour la ligne d\'un mouvement inconnu avec une durée en note ; la ligne y est présente avec sa série',
      /à toi de dire/.test(ap.texte) && /Mettre dans le cardio/.test(ap.texte) && /Garder comme exercice/.test(ap.texte) && /Échauffement - Zeta Fictif Pivotant/.test(ap.texte), ap.texte.slice(0, 400));
    const p1 = await finir();
    const ex1 = (p1.days[0].exs || []).find(e => /Zeta Fictif Pivotant/.test(e.name)) || { sets: [] };
    t('SCCP-I02 ⭐⭐ SANS réponse, rien n\'est rangé au cardio : le programme enregistré garde l\'exercice avec sa série (8 reps, type É, note « 10 min tranquille »), aucun cardio d\'échauffement, aucun drapeau transitoire enregistré',
      ex1.sets.length === 1 && ex1.sets[0].reps === 8 && ex1.sets[0].type === 'É' && /10 min tranquille/.test(ex1.note || '') && !p1.days[0].cardioAvant && !p1.days[0].cardio && J(p1).indexOf('_cardio') < 0, J(p1.days[0]));
    // 2) « Mettre dans le cardio » (vrai clic)
    await importer(prog(E01(), TRAV()));
    await clic(Y, '#imp-preview .imp-prop-b .imp-b-ok', 'Mettre dans le cardio'); await Y.pg.waitForTimeout(150);
    const apOui = await Y.pg.evaluate(() => document.getElementById('imp-preview').innerText.replace(/\s+/g, ' '));
    const p2 = await finir();
    t('SCCP-I03 ⭐ « Mettre dans le cardio » (un vrai appui) : la question disparaît, l\'aperçu dit « Rangé dans le cardio », et le programme range 10 min légères au cardio d\'AVANT ; la ligne n\'est plus un exercice ; aucun drapeau enregistré',
      /Rangé dans le cardio/.test(apOui) && !/à toi de dire/.test(apOui) && p2.days[0].cardioAvant && p2.days[0].cardioAvant.duration === 10 && !(p2.days[0].exs || []).some(e => /Zeta Fictif Pivotant/.test(e.name)) && J(p2).indexOf('_cardio') < 0, J(p2.days[0]));
    const perso = await Y.pg.evaluate(() => (S.customExercises || []).map(e => e.n));
    t('SCCP-I03b ⭐ une ligne rangée au cardio sur confirmation ne crée PAS un exercice perso « Échauffement - … » (ce n\'est plus un exercice) ; celle qu\'on garde (I02) en crée un, comme tout exercice inconnu', !perso.some(n => /Zeta Fictif Pivotant/.test(n)), J(perso));
    // 3) « Garder comme exercice » (vrai clic) : la question ne revient pas
    await importer(prog(E01(), TRAV()));
    await clic(Y, '#imp-preview .imp-prop-b button:not(.imp-b-ok)', 'Garder comme exercice'); await Y.pg.waitForTimeout(150);
    const apNon = await Y.pg.evaluate(() => document.getElementById('imp-preview').innerText.replace(/\s+/g, ' '));
    const p3 = await finir();
    t('SCCP-I04 « Garder comme exercice » : la question disparaît, la ligne reste un exercice avec sa série, aucun cardio', !/à toi de dire/.test(apNon) && (p3.days[0].exs || []).some(e => /Zeta Fictif Pivotant/.test(e.name)) && !p3.days[0].cardioAvant, J(p3.days[0]));
    // 4) un créneau NOMMÉ reste du cardio sans question (E04 de bout en bout), et un mouvement CONNU n'est jamais en question
    const ap4 = await importer(prog(EXI('Échauffement', [1], [], '10 min vélo', { setType: 'W' }), TRAV()));
    const p4 = await finir();
    t('SCCP-I05 ⭐ « Échauffement » + « 10 min vélo » : AUCUNE question (le créneau est nommé), 10 min de vélo au cardio d\'avant — l\'existant ne régresse pas', !/à toi de dire/.test(ap4.texte) && p4.days[0].cardioAvant && p4.days[0].cardioAvant.type === 'velo' && p4.days[0].cardioAvant.duration === 10, J(p4.days[0].cardioAvant));
    t('SCCP-I06 ⭐ un mouvement du catalogue en base (« Échauffement - Squat à la Barre ») garde son exercice, aucune question', await (async () => { const a = await importer(prog(EXI('Échauffement - Squat à la Barre', [8], [], '10 min tranquille', { setType: 'W' }), EXI('Squat à la Barre', [5], [80], 'RIR 2'))); const p = await finir(); return !/à toi de dire/.test(a.texte) && (p.days[0].exs || []).some(e => /Squat/.test(e.name)) && !p.days[0].cardioAvant; })(), '');
    t('SCCP-I07 aucune erreur de page', Y.errs.length === 0, Y.errs.slice(0, 2).join(' | '));
    await Y.cx.close();
  });

  await section('J', 'D-167 — le regroupement échauffement / travail reste FIDÈLE (ordre, types, charges, repos, reps, notes ; supersets, dégressifs, exercices distincts)', async () => {
    const Y = await ouvrir();
    const EXI = (name, repsPerSet, kgPerSet, note, extra) => Object.assign({ name, sets: repsPerSet.length, reps: repsPerSet[0] || 0, repsPerSet: repsPerSet.slice(), specialSets: [], kg: 0, kgPerSet: kgPerSet.slice(), supersetGroup: '', setType: '', note: note || '' }, extra || {});
    const importer = async (p, custom) => { Y.prog(p); return Y.pg.evaluate(async (c) => { S.premium = true; S.programmes = []; S.customExercises = c || []; S.exRestPref = {}; S.defRest = 130; S.sessions = []; persist();
      _impPhotos = [{ type: 'text/plain', data: 'programme', name: 'prog.txt', isText: true }]; _impMode = 'new'; await analyzeImportPhotos(); finalImportProg(); return JSON.parse(JSON.stringify(S.programmes[S.programmes.length - 1])); }, custom); };
    for (const [nom, fam] of FAMILLES) {
      const ECH = EXI(nom + ' - échauffement', [12, 7, 4], [17, 34, null], 'Montée progressive', { setType: 'W', restPerSet: ['25 s', '50 s', '70 s'] });
      const TRV = EXI(nom, [6, 6], [57, 57], 'RIR 2. Contrôler la descente.', { restPerSet: ['170 s', '170 s'] });
      const p = await importer({ name: 'Programme fictif D167', weeks: 4, startDate: '', days: [{ label: 'SÉANCE A', exercises: [ECH, TRV] }] }, CUSTOM);
      const e = (p.days[0].exs || []).filter(x => x.name === nom || x.name === nom.replace(/ - échauffement$/, ''))[0] || { sets: [] };
      t('SCCP-J01 ⭐ ' + fam + ' : échauffement + travail regroupés en UN exercice — ordre (12·7·4 puis 6·6), types (É É É N N), charges (17 · 34 · inconnue · 57 · 57), repos (25 · 50 · 70 · 170 · 170) et notes conservés ; la charge non écrite de la 3ᵉ série reste INCONNUE (null), aucune ne se décale',
        e.sets.length === 5 && J(e.sets.map(s => s.reps)) === '[12,7,4,6,6]' && e.sets.map(s => s.type).join('') === 'ÉÉÉNN' && J(e.sets.map(s => s.kg)) === '[17,34,null,57,57]' && J(e.sets.map(s => s.rest)) === '[25,50,70,170,170]' && /RIR 2/.test(e.note || '') && /progressive/.test(e.note || ''), J({ nom: e.name, sets: e.sets.map(s => [s.reps, s.type, s.kg, s.rest]), note: e.note }));
    }
    // les structures voisines ne sont jamais touchées : deux exercices DISTINCTS, un superset, un dégressif
    const p = await importer({ name: 'Programme fictif D167', weeks: 4, startDate: '', days: [{ label: 'SÉANCE A', exercises: [
      EXI('Squat à la Barre', [5, 5], [100, 100], 'A'), EXI('Squat Bulgare', [8, 8], [20, 20], 'B'),
      EXI('Curl Biceps', [12, 12], [10, 10], '', { supersetGroup: 'A' }), EXI('Extension Triceps Poulie', [12, 12], [15, 15], '', { supersetGroup: 'A' }),
      EXI('Élévations Latérales', [12, 10, 8], [12, 9, 6], 'Dégressif fictif', { setType: 'D' })] }] });
    const ex = p.days[0].exs;
    t('SCCP-J02 ⭐ deux exercices DISTINCTS (Squat / Squat Bulgare) ne sont jamais fusionnés ; le superset garde son groupe ; le dégressif garde ses paliers D et sa structure (`dropChaine`)',
      ex.filter(e => /Squat/.test(e.name)).length === 2 && ex.find(e => /Curl/.test(e.name)).group && ex.find(e => /Curl/.test(e.name)).group === ex.find(e => /Triceps/.test(e.name)).group && J(ex.find(e => /vations/.test(e.name)).sets.map(s => s.type)) === '["D","D","D"]' && ex.find(e => /vations/.test(e.name)).dropChaine === true, J(ex.map(e => [e.name, e.group || '', e.sets.length])));
    t('SCCP-J03 aucune erreur de page', Y.errs.length === 0, Y.errs.slice(0, 2).join(' | '));
    await Y.cx.close();
  });

  /* ══ K · RÈGLE D'OR n°9 : le bouton central « + » ne bouge pas (mesuré, 360 · 390 · 430) — la carte de l'exercice a gagné « lest max » ═════════════ */
  await section('K', 'le bouton central « + » ne bouge pas (360, 390, 430 px)', async () => {
    for (const [W, H] of [[360, 740], [390, 844], [430, 932]]) {
      const Z = await ouvrir(W, H);
      await poser(Z, { custom: CUSTOM, sessions: [{ j: 3, exs: [{ name: TR, sets: [{ reps: 5, pdc: 10, done: true, type: 'N', rm1: 0 }] }] }], wkt: [{ name: TR, sets: [{ reps: 5, pdc: 15 }, { reps: 8, pdc: 0 }] }] });
      await voir(Z, 0);
      const a = await plus(Z);
      const meta = await Z.pg.evaluate(() => document.querySelector('#ex-block-0 .ex-meta').textContent);
      const doc = await Z.pg.evaluate(() => ({ docW: document.documentElement.scrollWidth, vw: innerWidth }));
      t('SCCP-K01 ⭐ ' + W + ' px : le « + » central ne bouge pas (règle d\'or n°9) — au repère validé (' + PLUS[W] + ', ' + PLUSY[W] + ') alors que la carte dit « lest max » ; aucun débordement horizontal',
        Math.abs(a.x - PLUS[W]) <= 1 && Math.abs(a.y - PLUSY[W]) <= 1 && /lest max \+10 kg/.test(meta) && doc.docW <= doc.vw && Z.errs.length === 0, J({ a, meta, doc, errs: Z.errs.slice(0, 2) }));
      await Z.cx.close();
    }
  });

  /* ══ Q · ARCH-04 (Séance V4, 22/11/2026) — STOCKAGE PLEIN : LE DRAPEAU « HISTORIQUE TRONQUÉ » S'ÉCRIT D'ABORD, ET SANS LUI LES SÉANCES NE SONT PAS RÉDUITES ═════════════
     Le défaut : le repli quota écrivait les 50 séances PUIS le drapeau ; si c'était le drapeau que le navigateur refusait, le disque portait 50 séances sans que rien ne le dise —
     au démarrage suivant l'app renvoyait ces 50 au serveur et écrasait le cloud (le défaut du 02/08, par une autre porte). Le quota est SIMULÉ sur `ft4_sessions` (au-delà de `lim` caractères) et,
     pour le cas c, sur la petite clé du drapeau aussi. Aucune donnée réelle : 60 séances FICTIVES. ══════════════════════════════════════════════════════════════════════════════════ */
  await section('Q', 'stockage plein : le drapeau « historique tronqué » d\'abord, sans lui pas de réduction', async () => {
    const Z = await ouvrir();
    const essai = async (bloqueDrapeau) => Z.pg.evaluate(async (bloque) => {
      const orig = Storage.prototype.setItem; Storage.prototype.setItem = orig;
      const vieilles = Array.from({ length: 60 }, (_, i) => ({ id: 880000 + i, ts: Date.now() - (i + 2) * 864e5, date: new Date(Date.now() - (i + 2) * 864e5).toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' }), volume: 500,
        exs: [{ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }] }));
      const lim = Math.round((JSON.stringify(vieilles.slice(0, 50)).length + JSON.stringify(vieilles).length) / 2);      // 50 séances tiennent, 60 non
      localStorage.removeItem('ft4_hist_tronque'); S.histTronque = false;
      S.sessions = JSON.parse(JSON.stringify(vieilles)); S.prs = {}; S.wkt = null; persist();                                // les 60 sont d'abord écrites normalement
      const avant = JSON.parse(localStorage.getItem('ft4_sessions') || '[]').length;
      window.__T = [];
      Storage.prototype.setItem = function (k, v) {
        if (this === localStorage && ((k === 'ft4_sessions' && String(v).length > lim) || (bloque && k === 'ft4_hist_tronque'))) throw new DOMException('quota', 'QuotaExceededError');
        return orig.apply(this, arguments); };
      let err = null; try { persist(); } catch (e) { err = String(e.message); }
      Storage.prototype.setItem = orig;
      return { err, avant, apres: JSON.parse(localStorage.getItem('ft4_sessions') || '[]').length, enMemoire: S.sessions.length, drapeau: localStorage.getItem('ft4_hist_tronque'), histTronque: !!S.histTronque,
        toastRepli: window.__T.some(x => /50 dernières séances/.test(x)) };
    }, bloqueDrapeau);
    const a = await essai(false), c = await essai(true);
    t('SCCP-Q01 ⭐ (témoin) stockage plein, drapeau enregistrable : les séances locales sont réduites à 50, le drapeau est levé (mémoire ET disque), la personne est prévenue, rien n\'est perdu en mémoire',
      a.avant === 60 && a.apres === 50 && a.drapeau === '1' && a.histTronque === true && a.toastRepli === true && a.enMemoire === 60 && !a.err, J(a));
    t('SCCP-Q02 ⛔⛔ stockage plein ET drapeau refusé : les séances ne sont PAS réduites (60 sur le disque comme avant), le drapeau n\'est levé nulle part, aucun message « 50 séances » mensonger — sans drapeau, 50 séances sur le disque seraient renvoyées au serveur au démarrage suivant',
      c.avant === 60 && c.apres === 60 && c.drapeau === null && c.histTronque === false && c.toastRepli === false && c.enMemoire === 60 && !c.err, J(c));
    await Z.cx.close();
  });
}

module.exports.ecran = ecran;
