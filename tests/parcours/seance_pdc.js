/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   ⚖️ D-164 / D-166 — LA CHARGE AU POIDS DU CORPS (PDC) ET LES HALTÈRES (blocs B-SCPDC-*) — Claude N°2 (Séance), GO limité de Michel du 16/11/2026.
   D-164 : cinq états de charge qui ne se confondent jamais — INCONNUE · ZÉRO écrit · BARRE À VIDE · charge en kilos · POIDS DU CORPS. Le pavé de charge offre trois
   choix MANUELS (« PDC », « PDC + lest », « PDC − assistance »). ⛔ Aucune attribution automatique d'après le nom ou le type d'un exercice, aucune conversion en kilos, rien
   n'est recalculé quand le poids de corps change. Le choix est un champ facultatif `pdc` de la série (nombre signé : 0 · +lest · −assistance), `kg` reste 0 :
   tonnage, records / 1RM, calories, statistiques et CSV lisent ce qu'ils lisaient.
   D-166 : exercice à UN bras = la charge de CHAQUE haltère ; deux bras = la charge TOTALE ; jamais de double multiplication, jamais de conversion rétroactive, aucune
   dépendance à un nom. Ici : des témoins qui FIGENT l'existant (volume, records, saisie, import) sur plusieurs familles, un exercice PERSONNALISÉ et un exercice FICTIF inédit.
   Ce que les témoins CONDUISENT : la vraie app servie en local (390 × 844 ; 360 et 430 pour le bouton central), les vrais gestes (focus du champ de charge, appui sur un choix,
   frappe, Tab / Entrée, ✓), la vraie fin de séance (`finishWorkout`), un vrai rechargement, la vraie ouverture du détail et des « 4 dernières séances », le vrai chargement d'un
   programme. Ce qu'ils OBSERVENT : l'état des séries avant / après, le texte des champs, le volume, `S.prs`, les calories, le CSV fabriqué, le contexte de Milo (fonction locale),
   le corps des envois coupés, les rectangles du bouton « + ». Ce qu'ils NE COUVRENT PAS : Safari iOS (le clavier décimal, l'appui qui garde le focus, :has() sur un iOS ancien),
   la réponse de Milo (aucun appel), l'envoi réel au serveur (coupé), Code.js (non modifié).
   Données 100 % FICTIVES. Banc : tools/banc_seance_pdc.js · contrôle négatif : tools/mut_seance_pdc.py
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '130', ft4_sessions: '[]', ft4_prs: '{}' };
const J = o => JSON.stringify(o);
const TR = 'Tractions (Pull-up)', DC = 'Développé Couché', RH = 'Rowing Haltère (Tirage Horizontal)', DI = 'Développé Incliné Haltères';
const CU = 'Machine Maison Zorglub', FI = 'Zorglub Inédit Pivotant';          // un exercice PERSONNALISÉ (S.customExercises) et un exercice FICTIF absent du catalogue
const PLUS = { 360: 154, 390: 167, 430: 184 };                                  // le « + » validé sur iPhone (règle d'or #9) : il ne bouge pas
const PLUSY = { 360: 688, 390: 792, 430: 880 };                                 // et sa hauteur (haut du bouton), MESURÉE sur 13e84397 par ce banc (Chromium, viewport donné) : même code d'avant

async function ecran(t, b, PORT) {
  const ouvrir = async (w, h) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: w || 390, height: h || 844 }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
    const dehors = [];                                                                  // ⛔ toute requête hors du serveur local : notée, puis coupée (aucune ne part)
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => { const rq = rt.request(); dehors.push({ m: rq.method(), u: rq.url(), body: String(rq.postData() || '') }); return rt.abort(); });
    /* Le piège du LUNDI et du MOIS : les bilans automatiques recouvrent l'écran. On les pose comme déjà vus, par des dates RELATIVES. */
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_scpdc'))return; sessionStorage.setItem('_scpdc','1'); localStorage.clear();
      const D=${J(BASE)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));
      const n=new Date(); localStorage.setItem('ft4_lws', n.toLocaleDateString('sv-SE'));
      const p=new Date(n.getFullYear(), n.getMonth()-1, 15); localStorage.setItem('ft4_lms', p.getFullYear()+'-'+String(p.getMonth()+1).padStart(2,'0')); }catch(e){} })();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 200)));
    pg.setDefaultTimeout(5000);                                                         // un élément ABSENT (code d'avant, mutation) échoue vite : un rouge nommé
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const X = { cx, pg, errs, dehors };
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none';
      const n = new Date(); S.lastWeekSummary = today(); S.lastMonthSummary = new Date(n.getFullYear(), n.getMonth() - 1, 15).getFullYear() + '-' + String(new Date(n.getFullYear(), n.getMonth() - 1, 15).getMonth() + 1).padStart(2, '0');
      window.__T = []; const _t = window.toast; window.toast = function (m) { window.__T.push(String(m)); try { return _t.apply(this, arguments); } catch (e) {} };
      persist(); });
    return X;
  };
  const section = async (nom, titre, fn) => { console.log('\n─── B-SCPDC-' + nom + ' · ' + titre + ' ───'); try { await fn(); } catch (e) { t('SCPDC-' + nom + ' ⛔ la section n\'a pas pu aller au bout', false, String(e && e.message || e).slice(0, 300)); } };
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
    return { v: k ? k.value : null, ph: k ? k.placeholder : null, cls: k ? k.className : '', pdc: st.pdc, kg: st.kg, vide: st.vide, done: st.done, rm1: st.rm1, reps: st.reps, trm: (document.getElementById('trm-' + ei + '-' + si) || {}).textContent }; }, [ei, si]);
  const strip = (X, ei, si) => X.pg.evaluate(([ei, si]) => { const s = document.getElementById('kgm-' + ei + '-' + si); if (!s) return null; const r = s.getBoundingClientRect();
    return { d: getComputedStyle(s).display, txt: [...s.querySelectorAll('.kgm-b')].map(x => x.textContent.trim()), on: [...s.querySelectorAll('.kgm-b.on')].map(x => x.getAttribute('data-m')), top: r.top, bottom: r.bottom, left: r.left, right: r.right, vw: innerWidth, vh: innerHeight }; }, [ei, si]);
  const toasts = X => X.pg.evaluate(() => (window.__T || []).slice());
  const plus = X => X.pg.evaluate(() => { const p = document.querySelector('#nb-log .nb-plus').getBoundingClientRect(); return { x: Math.round(p.left + p.width / 2), y: Math.round(p.top) }; });
  /** Le geste complet : le doigt sur le champ de charge, un appui sur un choix, (le montant), Tab. */
  const choisir = async (X, ei, si, m, montant) => {
    await X.pg.click(KG(ei, si)); await X.pg.click(BTN(ei, si, m));
    if (montant !== undefined) { await X.pg.keyboard.type(String(montant)); await X.pg.keyboard.press('Tab'); } else { await X.pg.keyboard.press('Tab'); }
    await X.pg.waitForTimeout(120);
  };
  const FAMILLES = [[TR, 'poids du corps (catalogue)'], [DC, 'barre (catalogue)'], [RH, 'haltère à un bras (catalogue)'], [CU, 'exercice PERSONNALISÉ'], [FI, 'exercice FICTIF inédit']];
  const CUSTOM = [{ n: CU, g: 'Dos', muscles: { p: ['lats'], s: [] } }];
  const WKT5 = () => FAMILLES.map(([n]) => ({ name: n, sets: [{ reps: 8 }, { reps: 8 }, { reps: 8 }] }));

  /* ══ A00 · LE JEU DE TEST ═══════════════════════════════════════════════════════════════════════════════════════════════ */
  const X = await ouvrir();
  await section('A00', 'contrôle du jeu de test', async () => {
    const r = await X.pg.evaluate(([TR, DC, RH, DI, FI, CU]) => ({ cat: [TR, DC, RH, DI].map(n => EXLIB.some(e => e.n === n)), fi: EXLIB.some(e => e.n === FI), cu: EXLIB.some(e => e.n === CU), uni: [RH, DC, TR, FI, CU].map(n => estUnilateral(n)) }), [TR, DC, RH, DI, FI, CU]);
    t('SCPDC-A00 ⛔ CONTRÔLE DU JEU DE TEST — quatre exercices du catalogue, le perso et le fictif n\'y sont PAS ; seul le rowing haltère est unilatéral', r.cat.every(Boolean) && !r.fi && !r.cu && J(r.uni) === '[true,false,false,false,false]', J(r));
  });

  /* ══ A · LE PAVÉ DE CHARGE : trois choix manuels, jamais d'attribution automatique ═══════════════════════════════════════ */
  await section('A', 'le pavé de charge (5 familles : poids du corps, barre, haltère, personnalisé, fictif inédit)', async () => {
    await poser(X, { custom: CUSTOM, wkt: WKT5() });
    for (let ei = 0; ei < FAMILLES.length; ei++) {
      const [nom, fam] = FAMILLES[ei];
      await voir(X, ei);
      const a1 = await strip(X, ei, 0), plusAvant = await plus(X);
      /* Pendant la saisie d'une série, la barre du bas est MASQUÉE (D-085, décision H : `#root.kbd-serie`) — pour TOUS les champs de série. On compare donc le « + » avant, après, et
         pendant le focus du champ de charge à ce que fait déjà le champ des répétitions : la barre du bas ne réagit pas autrement à cause des trois choix. */
      t('SCPDC-A1 ⭐ ' + fam + ' : les trois choix existent, dans l\'ordre « PDC » · « PDC + lest » · « PDC − assistance », et ne se montrent PAS tant que le champ n\'a pas le doigt',
        !!a1 && a1.d === 'none' && J(a1.txt) === J(['PDC', 'PDC + lest', 'PDC − assistance']) && a1.on.length === 0, J(a1));
      const ecartLignes = ei => X.pg.evaluate(ei => document.getElementById('sr-wrap-' + ei + '-1').getBoundingClientRect().top - document.getElementById('sr-wrap-' + ei + '-0').getBoundingClientRect().top, ei);   // l'écart entre deux séries : indépendant du défilement
      const hauteurAvant = await ecartLignes(ei);
      await X.pg.click(`#sr-${ei}-0 input[type="number"]`); const plusReps = await plus(X); await X.pg.keyboard.press('Tab');
      await X.pg.click(KG(ei, 0));
      const a2 = await strip(X, ei, 0), plusPendant = await plus(X);
      const ligne0 = await X.pg.evaluate(ei => { const r = document.getElementById('sr-' + ei + '-0').getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; }, ei);   // la ligne qui a le doigt
      const hauteurApres = await ecartLignes(ei);
      await X.pg.keyboard.press('Tab'); await X.pg.waitForTimeout(150);
      const plusApres = await plus(X), a3 = await strip(X, ei, 0);
      t('SCPDC-A2 ⭐ ' + fam + ' : le doigt sur le champ de charge → les trois choix sont visibles et DANS l\'écran (au-dessus du champ, hors du clavier), sans rien déplacer (écart entre séries identique, « + » central : même état que pendant la saisie des reps, et revenu à sa place) ; le champ quitté, ils disparaissent',
        a2.d === 'flex' && a2.left >= 0 && a2.right <= a2.vw && a2.top >= 0 && a2.bottom <= a2.vh && a2.top < ligne0.top && a2.bottom <= ligne0.bottom && Math.abs(hauteurApres - hauteurAvant) < 0.5 && plusPendant.x === plusReps.x && plusPendant.y === plusReps.y
          && plusApres.x === plusAvant.x && plusApres.y === plusAvant.y && a3.d === 'none', J({ a2, hauteurAvant, hauteurApres, plusAvant, plusReps, plusPendant, plusApres, a3: a3 && a3.d }));
      // ⛔ AUCUNE ATTRIBUTION AUTOMATIQUE : une série validée sans charge reste une série sans charge — quel que soit l'exercice.
      await X.pg.click(CHK(ei, 0)); await X.pg.waitForTimeout(150);
      const s0 = await etat(X, ei, 0);
      t('SCPDC-A3 ⭐⭐ ' + fam + ' : « ' + nom + ' » validé SANS charge → aucun `pdc`, `kg` reste 0 : le nom ou le type de l\'exercice ne décide jamais du poids du corps', s0.done === true && s0.pdc === undefined && s0.kg === 0 && s0.cls.indexOf('sinp-pdc') < 0, J(s0));
    }
    // ── « PDC » (choix 1), « + lest » (2), « − assistance » (3), sur chaque famille, par les vrais gestes
    for (let ei = 0; ei < FAMILLES.length; ei++) {
      const fam = FAMILLES[ei][1];
      await voir(X, ei);
      await choisir(X, ei, 1, '0');
      const p0 = await etat(X, ei, 1);
      t('SCPDC-A4 ⭐ ' + fam + ' : « PDC » → `pdc` 0, `kg` 0, le champ le DIT (« PDC »), aucun 1RM', p0.pdc === 0 && p0.kg === 0 && p0.v === 'PDC' && p0.cls.indexOf('sinp-pdc') >= 0 && !p0.trm, J(p0));
      await X.pg.click(KG(ei, 2)); await X.pg.click(BTN(ei, 2, '+'));
      const att = await etat(X, ei, 2);
      await X.pg.keyboard.type('10');
      const frappe = await etat(X, ei, 2);
      await X.pg.keyboard.press('Tab'); await X.pg.waitForTimeout(120);
      const p1 = await etat(X, ei, 2);
      t('SCPDC-A5 ⭐ ' + fam + ' : « PDC + lest » puis 10 → `pdc` +10, `kg` 0, champ « PDC+10 » ; pendant la frappe aucun 1RM (10 kg × 8 ne se lit pas comme une charge) ; en attente du montant le champ est vide',
        att.v === '' && att.ph === 'lest kg' && att.pdc === 0 && frappe.trm === '' && p1.pdc === 10 && p1.kg === 0 && p1.v === 'PDC+10' && !p1.trm, J({ att, frappe, p1 }));
    }
    await voir(X, 0);
    // ── changer le SENS garde le montant · retaper le montant · un 2ᵉ appui sur le même choix = retour à une charge en kilos
    await X.pg.click(KG(0, 2)); await X.pg.click(BTN(0, 2, '-'));
    const sens = await etat(X, 0, 2); const stripSens = await strip(X, 0, 2);
    await X.pg.keyboard.type('25'); await X.pg.keyboard.press('Tab'); await X.pg.waitForTimeout(100);
    const m25 = await etat(X, 0, 2);
    t('SCPDC-A6 ⭐ « PDC − assistance » : le sens change sans perdre le montant (+10 → −10), le choix en cours est marqué, retaper 25 → −25 (`kg` toujours 0)',
      sens.pdc === -10 && sens.v === 'PDC−10' && J(stripSens.on) === '["-"]' && m25.pdc === -25 && m25.kg === 0 && m25.v === 'PDC−25', J({ sens, stripSens, m25 }));
    await X.pg.click(KG(0, 2)); await X.pg.click(BTN(0, 2, '-')); await X.pg.keyboard.press('Tab');
    const retour = await etat(X, 0, 2);
    t('SCPDC-A7 ⭐ un 2ᵉ appui sur le choix actif retire le PDC (aucun 4ᵉ bouton) : plus de `pdc`, plus de style, le champ est vide', retour.pdc === undefined && retour.kg === 0 && retour.v === '' && retour.cls.indexOf('sinp-pdc') < 0, J(retour));
    // ── les autres états de charge ne sont pas cassés : kilos, zéro écrit, barre à vide
    await X.pg.fill(KG(0, 2), '60'); await X.pg.press(KG(0, 2), 'Tab'); await X.pg.click(CHK(0, 2)); await X.pg.waitForTimeout(150);
    const kilos = await etat(X, 0, 2);
    t('SCPDC-A8 la charge en kilos reste la charge en kilos : 60 → `kg` 60, pas de `pdc`, 1RM calculé', kilos.kg === 60 && kilos.pdc === undefined && kilos.rm1 > 60 && kilos.done === true, J(kilos));
    await X.pg.evaluate(() => { S.wkt.exs[1].sets.push({ kg: 0, reps: 8, done: false, type: 'N', rm1: 0, vide: true }); persist(); }); await voir(X, 1);
    const vide0 = await etat(X, 1, 3); await X.pg.click(CHK(1, 3)); await X.pg.waitForTimeout(150); const vide1 = await etat(X, 1, 3);
    t('SCPDC-A9 « barre à vide » reste distincte : le champ dit « à vide », ✓ garde `vide:true`, `kg` 0, aucun `pdc`', vide0.ph === 'à vide' && vide1.vide === true && vide1.kg === 0 && vide1.pdc === undefined && vide1.done === true, J({ vide0, vide1 }));
    // ── un montant SANS sens (série « PDC » seul) est ambigu : on ne devine pas
    await voir(X, 0);
    await X.pg.click(KG(0, 1)); await X.pg.keyboard.press('Control+A'); await X.pg.keyboard.type('12'); await X.pg.keyboard.press('Tab'); await X.pg.waitForTimeout(120);
    const amb = await etat(X, 0, 1), tt = await toasts(X);
    t('SCPDC-A10 ⭐ un montant tapé sur une série « PDC » seule, sans avoir choisi lest ou assistance, n\'est PAS deviné : le PDC reste 0, un message demande de choisir', amb.pdc === 0 && amb.kg === 0 && amb.v === 'PDC' && tt.some(m => /lest/.test(m) && /assistance/.test(m)), J({ amb, tt }));
    // ── Entrée dans le champ : le montant est lu AVEC son sens, la série est validée
    await voir(X, 3);
    await X.pg.click(KG(3, 2)); await X.pg.click(BTN(3, 2, '-')); await X.pg.keyboard.type('7,5'); await X.pg.keyboard.press('Enter'); await X.pg.waitForTimeout(250);
    const ent = await etat(X, 3, 2);
    t('SCPDC-A11 ⭐ « PDC − assistance », 7,5 puis Entrée (sans quitter le champ) → série validée avec `pdc` −7,5 (la virgule se lit), `kg` 0, aucun 1RM', ent.done === true && ent.pdc === -7.5 && ent.kg === 0 && !ent.rm1, J(ent));
    t('SCPDC-A12 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  });

  /* ══ B · LA CHAÎNE : fin de séance, historique, Précédent, détail, export, Milo ═════════════════════════════════════════ */
  await section('B', 'la chaîne — tonnage, records, calories, CSV, Milo, « Précédent », détail, rechargement', async () => {
    await poser(X, { custom: CUSTOM, wkt: [
      { name: TR, sets: [{ reps: 8, done: true, pdc: 0 }, { reps: 6, done: true, pdc: 10 }, { reps: 10, done: true, pdc: -20 }] },
      { name: DC, sets: [{ reps: 5, kg: 60, done: true }, { reps: 5, kg: 0, done: true }] },
      { name: CU, sets: [{ reps: 12, done: true, pdc: 0 }] },
      { name: FI, sets: [{ reps: 9, done: true, pdc: 5 }] }] });
    const av = await X.pg.evaluate(async () => { S.bw = 82; await finishWorkout(); const s = S.sessions[0]; return { s: JSON.parse(JSON.stringify(s)), prs: Object.keys(S.prs), prDC: S.prs['Développé Couché'] }; });
    const kilosSeuls = av.s.exs.reduce((a, e) => a + e.sets.reduce((b2, x) => b2 + ((x.kg > 0 && x.reps > 0) ? x.kg * x.reps : 0), 0), 0);
    const lestSeul = av.s.exs.reduce((a, e) => a + e.sets.reduce((b2, x) => b2 + ((x.pdc > 0 && x.reps > 0) ? x.pdc * x.reps : 0), 0), 0);
    /* ⚖️ RÉÉCRIT (mission corrective du 16/11/2026, arbitrage VALIDÉ par Michel : « un lest réellement ajouté PARTICIPE au tonnage, selon la convention existante »). AVANT : « le tonnage ne bouge pas : une série PDC compte 0, volume 300 ».
       L'invariant qui reste : le tonnage des KILOS est exactement celui d'avant (60 × 5 = 300) ; un PDC seul et une ASSISTANCE comptent 0 (aucune règle inventée) ; seul le lest s'y ajoute (+10 × 6 = 60 ; fictif +5 × 9 = 45) — jamais le poids de corps. */
    t('SCPDC-B1 ⭐ le tonnage des KILOS ne bouge pas (barre 60 × 5 = 300) ; un PDC seul (kg 0) et une assistance comptent 0 ; seul un LEST s\'y ajoute (arbitrage de Michel : 10 × 6 + 5 × 9 = 105) — jamais le poids de corps : volume 405', av.s.volume === 405 && lestSeul === 105 && av.s.volume === Math.round(kilosSeuls + lestSeul), J({ vol: av.s.volume, kilosSeuls, lestSeul }));
    t('SCPDC-B2 ⭐ les records ne bougent pas : aucun record ni 1RM n\'est créé pour une série au poids du corps (seul le Développé Couché a un record, 60 × 5)', J(av.prs) === J(['Développé Couché']) && av.prDC.kg === 60, J({ prs: av.prs, prDC: av.prDC }));
    const cal = await X.pg.evaluate(() => { const s = S.sessions[0], c = JSON.parse(JSON.stringify(s)); c.exs.forEach(e => e.sets.forEach(x => { delete x.pdc; })); c.exercises = c.exs;
      return { avec: calcSessionCalories(s).total, sans: calcSessionCalories(c).total, enreg: s.calories }; });
    t('SCPDC-B3 ⭐ les calories (MET) ne bougent pas : la même séance SANS le champ `pdc` donne exactement le même total, et c\'est celui qui est enregistré', cal.avec === cal.sans && cal.enreg === cal.avec && cal.avec > 0, J(cal));
    t('SCPDC-B4 ⭐ le choix saisi est enregistré TEL QUEL dans l\'historique (0 · +10 · −20, perso 0, fictif +5) et `kg` reste 0 sur ces séries',
      J(av.s.exs[0].sets.map(x => x.pdc)) === '[0,10,-20]' && J(av.s.exs[2].sets.map(x => x.pdc)) === '[0]' && J(av.s.exs[3].sets.map(x => x.pdc)) === '[5]' && av.s.exs[0].sets.every(x => x.kg === 0) && av.s.exs[1].sets.every(x => x.pdc === undefined), J(av.s.exs.map(e => e.sets.map(x => [x.kg, x.pdc]))));
    // le poids de corps change : le passé ne bouge pas
    const bw = await X.pg.evaluate(() => { const avant = J2(S.sessions), l0 = J2(_histoLignes(false)); S.bw = 95; S.weightLog = [{ date: today(), kg: 95 }]; persist(); return { egal: J2(S.sessions) === avant && J2(_histoLignes(false)) === l0, vol: Math.round(_workVol(S.sessions[0])) }; function J2(o) { return JSON.stringify(o); } });
    t('SCPDC-B5 ⭐ le poids de corps passe de 82 à 95 kg : la séance enregistrée et ses lignes d\'export sont IDENTIQUES (rien n\'est recalculé, rien n\'est converti en kilos) — le volume (405 : kilos + lest écrit) ne dépend pas du poids de corps', bw.egal === true && bw.vol === 405, J(bw));
    // un vrai rechargement : le stockage local rend le champ intact
    await X.pg.reload(); await X.pg.waitForTimeout(1500);
    const rl = await X.pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); const s = S.sessions[0]; return { sets: s.exs[0].sets.map(x => [x.kg, x.pdc]), fi: s.exs[3].sets[0].pdc, ls: JSON.parse(localStorage.getItem('ft4_sessions'))[0].exs[0].sets.map(x => x.pdc) }; });
    t('SCPDC-B6 ⭐ après un vrai rechargement, le champ survit (stockage local) : [0, +10, −20] et fictif +5', J(rl.sets) === '[[0,0],[0,10],[0,-20]]' && J(rl.ls) === '[0,10,-20]' && rl.fi === 5, J(rl));
    // ── « Précédent » : la dernière fois, dite, et reprise telle quelle
    await X.pg.evaluate(() => { window.__T = []; const lw = today(), lm = S.lastMonthSummary; S.lastWeekSummary = lw; S.lastMonthSummary = lm; S.wkt = { date: today(), startHour: 10, startTs: Date.now() - 60000, exs: [{ name: 'Tractions (Pull-up)', sets: [{ kg: 0, reps: 8, done: false, type: 'N', rm1: 0 }, { kg: 0, reps: 8, done: false, type: 'N', rm1: 0 }, { kg: 0, reps: 8, done: false, type: 'N', rm1: 0 }] }] }; persist(); });
    await voir(X, 0);
    const pr = await X.pg.evaluate(() => [0, 1, 2].map(i => ({ prec: (document.querySelector('#sr-0-' + i + ' .sprev-n') || {}).textContent, ph: document.querySelectorAll('#sr-0-' + i + ' .sinp')[1].placeholder })));
    t('SCPDC-B7 ⭐ « Précédent » dit le choix de la dernière fois, sans faux chiffre : 8×PDC · 6×PDC+10 · 10×PDC−20 (jamais « 8×0 » ni « 6×10 »), et la suggestion grise le redit', J(pr.map(x => x.prec)) === '["8×PDC","6×PDC+10","10×PDC−20"]' && J(pr.map(x => x.ph)) === '["PDC","PDC+10","PDC−20"]', J(pr));
    // ✓ sans rien taper : la suggestion « PDC+10 » se reprend TELLE QUELLE — jamais lue comme 10 kg
    await X.pg.click(CHK(0, 1)); await X.pg.waitForTimeout(150);
    const rep = await etat(X, 0, 1);
    t('SCPDC-B8 ⭐ ✓ sans rien taper sur la suggestion « PDC+10 » → `pdc` +10 (reprise telle quelle), `kg` 0 — jamais 10 kg, jamais de 1RM', rep.done === true && rep.pdc === 10 && rep.kg === 0 && !rep.rm1, J(rep));
    await X.pg.evaluate(() => { addSet(0); });
    const ajout = await X.pg.evaluate(() => S.wkt.exs[0].sets[3]);
    t('SCPDC-B9 « + Série » reprend le choix de la dernière fois (4ᵉ série : 3ᵉ de la dernière séance, −20)', ajout.pdc === -20 && ajout.kg === 0, J(ajout));
    // un programme (séries sans charge) : la dernière fois pré-remplit le PDC, comme elle pré-remplit `kg`
    /* ⚠️ RÉÉCRIT LE 16/11/2026 (lot 1 « contre-expertise », D-163 — TOUS les programmes) : avant, un programme NON marqué « prescrit » reprenait « la dernière séance de l'exercice » d'où qu'elle vienne (c'était le défaut H02/H03 : la charge d'un autre contexte remplaçait la
       prescription). L'invariant de ce témoin n'est pas là : le choix PDC de la dernière fois est repris COMME `kg` (même règle). On le garde ENTIER en rattachant la séance de l'historique à CE programme et à CE jour — c'est ce que fait la vraie fin de séance (`progId`, libellé). */
    await X.pg.evaluate(() => { S.sessions[0].progId = 'pPDC'; S.sessions[0].progLabel = 'J1'; persist(); });
    const prog = await X.pg.evaluate(() => { S.wkt = null; S.programmes = [{ id: 'pPDC', name: 'Programme fictif PDC', days: [{ label: 'J1', exs: [{ name: 'Tractions (Pull-up)', sets: [{ kg: 0, reps: 8, type: 'N', rest: 90 }, { kg: 0, reps: 8, type: 'N', rest: 90 }, { kg: 0, reps: 8, type: 'N', rest: 90 }] }, { name: 'Zorglub Inédit Pivotant', sets: [{ kg: 0, reps: 9, type: 'N', rest: 90 }] }] }] }]; persist();
      _loadProgDayVraiment(0, 0); return S.wkt.exs.map(e => e.sets.map(s => [s.kg, s.pdc])); });
    t('SCPDC-B10 ⭐ un programme chargé : les séries reprennent le PDC de la dernière séance de CE jour (0 · +10 · −20) ; l\'exercice fictif, dont la dernière séance portait +5, le reprend aussi ; rien n\'est attribué à un exercice sans historique',
      J(prog[0]) === '[[0,0],[0,10],[0,-20]]' && J(prog[1]) === '[[0,5]]', J(prog));
    // un programme IMPORTÉ (`prescrit`) — comme tous, depuis le 16/11 : « précédent » = la dernière séance de CE jour du programme (progId + libellé) — le PDC y suit, une séance d'un autre programme n'y prête rien
    const presc = await X.pg.evaluate(() => { const s0 = S.sessions[0]; s0.progId = 'pPDC'; s0.progLabel = 'J1'; S.programmes[0].prescrit = true; persist(); _loadProgDayVraiment(0, 0); const avec = S.wkt.exs[0].sets.map(s => s.pdc);
      s0.progId = 'autre'; persist(); _loadProgDayVraiment(0, 0); const sans = S.wkt.exs[0].sets.map(s => s.pdc); return { avec, sans }; });
    t('SCPDC-B10b ⭐ programme importé (`prescrit`) : le PDC de la dernière séance de CE jour est repris (0 · +10 · −20) ; si la dernière séance vient d\'un autre programme, rien n\'est repris (aucun PDC par défaut)', J(presc.avec) === '[0,10,-20]' && J(presc.sans) === '[null,null,null]', J(presc));
    // un programme à UN SEUL jour (exercices à plat) et la séance de MILO (deux portes) : le même repli sur la dernière fois ; quand Milo ÉCRIT des kilos, ils priment (aucun PDC par-dessus)
    const autres = await X.pg.evaluate(() => {
      S.sessions[0].progId = 'pUn'; S.sessions[0].progLabel = 'Programme à un jour';   // D-163 : la dernière séance faite DE CE programme (voir plus haut)
      S.programmes = [{ id: 'pUn', name: 'Programme à un jour', exs: [{ name: 'Tractions (Pull-up)', sets: [{ kg: 0, reps: 8, type: 'N', rest: 90 }, { kg: 0, reps: 8, type: 'N', rest: 90 }, { kg: 0, reps: 8, type: 'N', rest: 90 }] }] }]; persist();
      S.wkt = null; _loadProgVraiment(0); const un = S.wkt.exs[0].sets.map(s => [s.kg, s.pdc]);
      const miloSets = () => [{ kg: 30, reps: 5, type: 'N' }, { kg: 0, reps: 8, type: 'N' }, { kg: 0, reps: 8, type: 'N' }];
      _pendingMiloSessions = [{ label: 'Séance fictive de Milo', exs: [{ name: 'Tractions (Pull-up)', sets: miloSets() }] }];
      /* ⚖️ ORACLE RÉÉCRIT (17/11/2026, lot C de la finale — arbitrage de Michel : « séance libre : UNIQUEMENT la dernière séance libre admissible ») : la séance de Milo est une séance LIBRE ; la dernière fois, ici, vient d'un PROGRAMME (`pUn`) → elle ne prête RIEN (m0 : [30,null] · [0,null] · [0,null]). Le PDC de la dernière fois se reprend toujours, mais d'une séance LIBRE du même exercice :
         on en pose une copie, plus récente (`lib`), pour les deux portes. Invariant gardé : une charge ÉCRITE par Milo prime (aucun PDC dessus), les séries sans charge reprennent la dernière fois ADMISSIBLE (PDC+10, PDC−20). */
      S.wkt = null; _pendingMiloSessions = [{ label: 'Séance fictive de Milo', exs: [{ name: 'Tractions (Pull-up)', sets: [{ kg: 30, reps: 5, type: 'N' }, { kg: 0, reps: 8, type: 'N' }, { kg: 0, reps: 8, type: 'N' }] }] }];
      _startSessionFromMilo(0, null); const m0 = S.wkt ? S.wkt.exs[0].sets.map(s => [s.kg, s.pdc]) : null;
      const lib = JSON.parse(JSON.stringify(S.sessions[0])); delete lib.progId; delete lib.progDayId; lib.progLabel = 'Séance libre'; lib.id = (lib.id || 0) + 1; lib.ts = (lib.ts || lib.id) + 1; S.sessions.unshift(lib); persist();
      _pendingMiloSessions = [{ label: 'Séance fictive de Milo', exs: [{ name: 'Tractions (Pull-up)', sets: miloSets() }] }];
      S.wkt = null; _startSessionFromMilo(0, null); const m1 = S.wkt ? S.wkt.exs[0].sets.map(s => [s.kg, s.pdc]) : null;
      _pendingMiloSessions = [{ label: 'Séance fictive de Milo', exs: [{ name: 'Tractions (Pull-up)', sets: miloSets() }] }];
      _miloPendingIdx = 0; _miloPendingBtn = null; S.wkt = { date: today(), startHour: 10, exs: [{ name: 'Exercice à remplacer', sets: [{ kg: 0, reps: 5, done: false, type: 'N', rm1: 0 }] }] }; _applyMiloSession('replace'); const m2 = S.wkt ? S.wkt.exs[0].sets.map(s => [s.kg, s.pdc]) : null;
      S.sessions = S.sessions.filter(x => x !== lib); persist();   // la copie libre ne reste pas dans l'historique des témoins suivants (l'export CSV, B14, lit toutes les séances)
      return { un, m0, m1, m2 }; });
    t('SCPDC-B10c ⭐ programme à un seul jour : les séries reprennent le PDC de la dernière fois (0 · +10 · −20)', J(autres.un) === '[[0,0],[0,10],[0,-20]]', J(autres.un));
    /* ↪️ ORACLE RÉÉCRIT le 18/11/2026 (lot S, consigne « inconnue ≠ zéro ») — INVARIANT GARDÉ : rien d'un programme n'est repris, aucun PDC. Sans source admissible la charge de Milo « non précisée » était un 0 INVENTÉ (`pp?pp.kg:0`) : elle est INCONNUE (`null`). */
    t('SCPDC-B10d ⭐ séance de Milo (deux portes) : une charge ÉCRITE par Milo (30 kg) prime — aucun PDC dessus ; les séries sans charge reprennent la dernière fois d\'une séance LIBRE (PDC+10, PDC−20) — et rien de celle d\'un programme : charge inconnue, pas un zéro inventé (lot C : m0)', J(autres.m0) === '[[30,null],[null,null],[null,null]]' && J(autres.m1) === '[[30,null],[0,10],[0,-20]]' && J(autres.m2) === '[[30,null],[0,10],[0,-20]]', J(autres));
    await X.pg.evaluate(() => { S.wkt = null; persist(); });
    // ── « 4 dernières séances » et le détail d'une séance passée
    await X.pg.evaluate(() => { S.wkt = { date: today(), startHour: 10, startTs: Date.now() - 60000, exs: [{ name: 'Tractions (Pull-up)', sets: [{ kg: 0, reps: 8, done: false, type: 'N', rm1: 0 }] }] }; persist(); });
    await voir(X, 0);
    const p4 = await X.pg.evaluate(() => { openDernieresSeances(0); const ov = document.getElementById('ov-prev4'); return ov ? ov.innerText.replace(/\s+/g, ' ') : ''; });
    t('SCPDC-B11 ⭐ « 4 dernières séances » dit « 8 × PDC », « 6 × PDC+10 », « 10 × PDC−20 » (jamais « × 0 »)', /8 × PDC\b/.test(p4) && p4.indexOf('6 × PDC+10') >= 0 && p4.indexOf('10 × PDC−20') >= 0 && p4.indexOf('× 0') < 0, p4.slice(0, 300));
    await X.pg.evaluate(() => { document.getElementById('ov-prev4').classList.remove('open'); S.wkt = null; persist(); });
    const det = await X.pg.evaluate(() => { const s = S.sessions[0]; openSessDetail(s.ts || s.id); const inps = [...document.querySelectorAll('#sd-content input')].filter(i => (i.getAttribute('onchange') || '').indexOf("'kg'") > 0);
      return { ph: inps.slice(0, 3).map(i => [i.value, i.placeholder]) }; });
    t('SCPDC-B12 ⭐ le détail d\'une séance passée dit le choix (« PDC » · « PDC+10 » · « PDC−20 » en indice, jamais « 0 » dans le champ)', J(det.ph) === '[["","PDC"],["","PDC+10"],["","PDC−20"]]', J(det));
    const edit = await X.pg.evaluate(() => { const set = (ei, si, v) => updateSessSet(ei, si, 'kg', v); set(0, 0, ''); const apresVide = _sessEdits.exs[0].sets[0].pdc; set(0, 1, '50'); const s1 = _sessEdits.exs[0].sets[1]; return { apresVide, pdc1: s1.pdc, kg1: s1.kg, pdc2: _sessEdits.exs[0].sets[2].pdc }; });
    t('SCPDC-B13 dans le détail, laisser le champ de kilos vide n\'efface pas le PDC ; y taper 50 kg EST un choix (le PDC s\'efface, jamais les deux) ; les autres séries ne bougent pas', edit.apresVide === 0 && edit.pdc1 === undefined && edit.kg1 === 50 && edit.pdc2 === -20, J(edit));
    await X.pg.evaluate(() => { if (typeof closeSessDetail === 'function') closeSessDetail(); document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); });
    // ── export CSV : kg et volume restent 0, la colonne `charge` le DIT — et n'existe que s'il y a du PDC
    const csv = await X.pg.evaluate(async () => { const lig = _histoLignes(false); let sortie = null; const o = window._donnerFichier; window._donnerFichier = async c => { sortie = c; return 'ok'; }; window.closeHistoExport = window.closeHistoExport || function () {}; _histoAvecDebriefs = false;
      await exportHistoCsv(); window._donnerFichier = o;
      const ls = String(sortie || '').replace(/^﻿/, '').split('\n');
      const pdcLig = lig.filter(r => r.charge !== undefined), autres = lig.filter(r => r.charge === undefined);
      // la même histoire SANS aucune série au poids du corps : le fichier est exactement celui d'avant
      const sauf = JSON.parse(JSON.stringify(S.sessions)); S.sessions.forEach(s => s.exs.forEach(e => e.sets.forEach(x => { delete x.pdc; })));
      let sortie2 = null; window._donnerFichier = async c => { sortie2 = c; return 'ok'; }; await exportHistoCsv(); window._donnerFichier = o;
      S.sessions = sauf;
      return { entete: ls[0], charges: pdcLig.map(r => [r.exercise, r.charge, r.kg, r.volume]), nAutres: autres.length, ligne0: ls[1], entete2: String(sortie2 || '').replace(/^﻿/, '').split('\n')[0], cols: HISTO_COLONNES.join(';') };
    });
    /* ⚖️ RÉÉCRIT (arbitrage de Michel sur le lest) : `volume` d'une ligne de lest vaut lest × répétitions (+10 × 6 = 60 ; fictif +5 × 9 = 45) ; un PDC seul et une assistance restent à 0 ; `kg` reste 0 partout (aucun kilo inventé) — la somme des lignes refait le volume. */
    t('SCPDC-B14 ⭐ CSV : une colonne `charge` dit « PDC » / « PDC+10 kg » / « PDC−20 kg » ; `kg` y reste 0 (aucun kilo inventé), `volume` porte le lest (60 · 45) et 0 pour le PDC seul et l\'assistance',
      /;charge$/.test(csv.entete) && csv.charges.length === 5 && csv.charges.every(c => c[2] === 0) && J(csv.charges.map(c => c[3])) === '[0,60,0,0,45]' && J(csv.charges.slice(0, 3).map(c => c[1])).indexOf('PDC+10 kg') > 0 && J(csv.charges.map(c => c[1])).indexOf('PDC−20 kg') > 0, J(csv));
    t('SCPDC-B15 ⭐ CSV : sans aucune série au poids du corps, le fichier est EXACTEMENT celui d\'avant (même en-tête, aucune colonne en plus)', csv.entete2 === csv.cols, csv.entete2 + ' ≠ ' + csv.cols);
    // ── Milo : du texte lisible, aucun faux chiffre
    const ml = await X.pg.evaluate(() => { S.sessions[0].exs[1].sets.push({ kg: null, reps: 4, done: true, type: 'N' }, { kg: 0, reps: 3, done: true, type: 'N' }); let c = ''; try { c = buildCoachContext('test'); } catch (e) { c = 'ERREUR ' + e.message; } return { c: String(c) }; });
    const ligne = (ml.c.match(/Tractions \(Pull-up\): [^\n]*/) || [''])[0];
    t('SCPDC-B16 ⭐ Milo lit « S1 PDC×8 · S2 PDC+10kg×6 · S3 PDC−20kg×10 » (le sens et le montant, pas de kilos inventés) ; une charge INCONNUE (null) reste « ? » (pas le poids du corps) et un ZÉRO écrit se lit « 0 » (D-164, mission corrective : avant, les deux s\'écrivaient « ? »)',
      ml.c.indexOf('S1 PDC×8 · S2 PDC+10kg×6 · S3 PDC−20kg×10') > 0 && ml.c.indexOf('?×4') > 0 && ml.c.indexOf('0×3') > 0 && !/NaN|undefined/.test(ligne), (ligne || ml.c.slice(0, 200)).slice(0, 260));
    // ── synchronisation / restauration : le champ voyage sans qu'on y touche (Code.js n'est pas modifié : il range les séances telles quelles)
    const sy = await X.pg.evaluate(() => { const loc = JSON.parse(JSON.stringify(S.sessions)), cloud = JSON.parse(JSON.stringify(S.sessions));
      const f = (typeof _fusionnerSeancesRestauration === 'function') ? _fusionnerSeancesRestauration([], cloud) : null; const lignes = _buildSyncRows(S.sessions[0]);
      return { fus: f ? f.liste[0].exs[0].sets.map(x => x.pdc) : null, brut: JSON.stringify(S.sessions).indexOf('"pdc":10') > 0, lignesKg: lignes.filter(r => r.exercise === 'Tractions (Pull-up)').map(r => r.kg) }; });
    t('SCPDC-B17 la restauration depuis le cloud garde le champ tel quel ([0, +10, −20]) ; la file vers le tableur (Sheets) n\'écrit que `kg` (0 pour ces séries : inchangé, le champ reste dans le profil sauvegardé)', J(sy.fus) === '[0,10,-20]' && sy.brut === true && J(sy.lignesKg) === '[0,0,0]', J(sy));
    const env = await X.pg.evaluate(() => { S.url = 'https://script.google.com/macros/s/AKtest/exec'; S.email = 't@t.t'; S.connected = true; window.__env = null; try { _cloudSync(); } catch (e) { return 'ERREUR ' + e.message; } return 'ok'; });
    await X.pg.waitForTimeout(800);
    const corps = X.dehors.filter(d => d.m === 'POST' && /"sessions"/.test(d.body)).map(d => d.body);
    t('SCPDC-B18 l\'envoi de sauvegarde porte les séances ENTIÈRES (le champ `pdc` part avec : `"pdc":10` dans le corps, aucun envoi réel — coupé)', env === 'ok' && corps.length >= 1 && corps.some(c => c.indexOf('"pdc":10') > 0 && c.indexOf('"pdc":-20') > 0), 'envois=' + X.dehors.length + ' · avec sessions=' + corps.length);
    t('SCPDC-B19 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  });

  /* ══ C · L'IMPORT : une prescription écrite « PDC » reste identifiable, jamais convertie ni attribuée ═══════════════════════ */
  await section('C', 'import — « PDC », « lest », « 2 haltères » : le texte de la source reste, aucun kilo n\'est déduit', async () => {
    const lu = await X.pg.evaluate(() => { const r = {}; ['PDC', 'pdc', 'Poids du corps', 'PDC + 10 kg', '10 kg lest', '+10 kg de lest', 'assistance 20 kg', 'BW', '2 haltères de 15', '2 x 30 kg', '20 kg', '62,5 kg', '30', '57-63 kg', '60kg-65kg', 'barre à vide', 'à vide', 'Barre', '0', 'charge confortable', 137.5].forEach(v => { const k = _kgLu(v); r[String(v)] = k.vide ? 'vide' : k.n; }); return r; });
    t('SCPDC-C1 ⭐ les mots du poids du corps (PDC, poids du corps, BW, lest, assistance) ne deviennent JAMAIS des kilos : « 10 kg lest » ≠ 10, « PDC + 10 kg » non lu',
      ['PDC', 'pdc', 'Poids du corps', 'PDC + 10 kg', '10 kg lest', '+10 kg de lest', 'assistance 20 kg', 'BW'].every(k => lu[k] === null), J(lu));
    t('SCPDC-C2 ⭐ D-166 : « 2 haltères de 15 » n\'est plus lu « 2 kg » (deux haltères de 15 : 15 chacun ou 30 en tout ? la personne tranche) ; « 2 x 30 kg » reste non lu',
      lu['2 haltères de 15'] === null && lu['2 x 30 kg'] === null, J({ a: lu['2 haltères de 15'], b: lu['2 x 30 kg'] }));
    t('SCPDC-C3 ⭐ ce qui se lisait bien se lit toujours : 20 kg → 20 · 62,5 kg → 62,5 · 30 → 30 · 57-63 kg → 57 (borne basse) · 60kg-65kg → 60 · 137,5 → 137,5 · barre / à vide → « vide » · 0 → 0 · un texte sans chiffre → non lu',
      lu['20 kg'] === 20 && lu['62,5 kg'] === 62.5 && lu['30'] === 30 && lu['57-63 kg'] === 57 && lu['60kg-65kg'] === 60 && lu['137.5'] === 137.5 && lu['barre à vide'] === 'vide' && lu['à vide'] === 'vide' && lu['Barre'] === 'vide' && lu['0'] === 0 && lu['charge confortable'] === null, J(lu));
    const imp = await X.pg.evaluate(([TR, FI, RH, DC]) => { _impExtracted = { days: [{ label: 'J1', exercises: [
      { name: TR, sets: 3, reps: 8, kg: 'PDC' }, { name: FI, sets: 2, reps: 8, kg: '10 kg lest' }, { name: RH, sets: 2, reps: 10, kgPerSet: ['2 haltères de 15', '20 kg'] },
      { name: DC, sets: 2, reps: 5, kg: '2 x 30 kg' }, { name: 'Presse Fictive Inédite', sets: 3, reps: 10 }, { name: 'Tractions aux Anneaux', sets: 2, reps: 8 }] }] };
      _impLireCharges(); const ex = _impExtracted.days[0].exercises;
      return ex.map(e => ({ n: e.name, kgPerSet: e.kgPerSet, note: e.note || '', nonLue: e._kgNonLue || null, serie: (() => { const s = _seriesImport(e); return { kgs: s.kgs, vides: s.vides }; })() })); }, [TR, FI, RH, DC]);
    t('SCPDC-C4 ⭐⭐ import : « PDC » écrit pour un exercice du catalogue reste dans la NOTE (« Charge non lue : PDC »), la charge reste « non renseignée » (INCONNUE, null : aucun kilo, aucun zéro inventé, aucun `pdc`) — le texte de la source est identifiable, sans attribution',
      imp[0].note.indexOf('Charge non lue : PDC') >= 0 && J(imp[0].serie.kgs) === '[null,null,null]' && J(imp[0].serie.vides) === '[false,false,false]' && J(imp[0].nonLue) === '["PDC"]', J(imp[0]));
    t('SCPDC-C5 ⭐ import : « 10 kg lest » sur un exercice FICTIF → note « Charge non lue : 10 kg lest », charge inconnue ; « 2 haltères de 15 » sur 2 séries → note, la 2ᵉ série « 20 kg » reste lue (20) ; « 2 x 30 kg » → note, charge inconnue',
      imp[1].note.indexOf('Charge non lue : 10 kg lest') >= 0 && J(imp[1].serie.kgs) === '[null,null]' && imp[2].note.indexOf('Charge non lue : 2 haltères de 15') >= 0 && J(imp[2].serie.kgs) === '[null,20]' && imp[3].note.indexOf('Charge non lue : 2 x 30 kg') >= 0 && J(imp[3].serie.kgs) === '[null,null]', J(imp.slice(1, 4)));
    t('SCPDC-C6 ⭐ import : un exercice « au poids du corps » sans charge écrite (aucune mention) n\'est pas déclaré PDC : pas de note, charge inconnue (null), aucun `pdc` (la devinette « tractions = PDC » n\'existe pas)',
      imp[4].note === '' && J(imp[4].serie.kgs) === '[null,null,null]' && imp[5].note === '' && J(imp[5].serie.kgs) === '[null,null]' && J(imp[5].serie.vides) === '[false,false]' && imp.every(e => e.serie.kgs.every(k => k === null || typeof k === 'number')) && J(imp).indexOf('pdc') < 0, J([imp[4], imp[5]]));
  });

  /* ══ D · D-166 HALTÈRES : l'existant, figé (aucun nom, aucune double multiplication) ═══════════════════════════════════════ */
  await section('D', 'D-166 — haltères : un bras = chaque haltère, deux bras = le total ; jamais de double multiplication, aucune dépendance à un nom', async () => {
    const vol = await X.pg.evaluate(([RH, DI, CU, FI]) => {
      S.customExercises = [{ n: CU, g: 'Dos', muscles: { p: ['lats'], s: [] } }, { n: 'Curl Unilatéral Maison', g: 'Bras', muscles: { p: ['biceps'], s: [] } }];
      const sess = (nom, uni) => ({ uniConv: uni, exs: [{ name: nom, sets: [{ kg: 20, reps: 8, done: true, type: 'N' }, { kg: 20, reps: 8, done: true, type: 'N' }, { kg: 20, reps: 8, done: true, type: 'N' }] }] });
      const o = {};
      [[RH, 'un bras (catalogue)'], [DI, 'deux bras (catalogue)'], [CU, 'perso'], ['Curl Unilatéral Maison', 'perso nommé « unilatéral »'], [FI, 'fictif'], ['Zorglub Haltère Unilatéral Bras', 'fictif nommé « unilatéral »']].forEach(([n, l]) => {
        o[l] = { nom: n, uni: estUnilateral(n), avec: _workVol(sess(n, 1)), sans: _workVol(sess(n, 0)), lib: uniLabel(n) }; });
      o.src = String(_facteurUni);
      return o; }, [RH, DI, CU, FI]);
    t('SCPDC-D1 ⭐ un exercice à UN bras (20 kg = la charge de CHAQUE haltère) : volume ×2 une seule fois pour une séance notée sous la convention (3 × 8 × 20 × 2 = 960) ; sans la convention (séance d\'avant) 480 — pas de conversion rétroactive',
      vol['un bras (catalogue)'].uni === true && vol['un bras (catalogue)'].avec === 960 && vol['un bras (catalogue)'].sans === 480 && vol['un bras (catalogue)'].lib === 'par bras', J(vol['un bras (catalogue)']));
    t('SCPDC-D2 ⭐ deux bras (deux haltères, charge TOTALE saisie 60 ou 20…) : jamais doublé — 3 × 8 × 20 = 480 avec ou sans la convention', vol['deux bras (catalogue)'].uni === false && vol['deux bras (catalogue)'].avec === 480 && vol['deux bras (catalogue)'].sans === 480, J(vol['deux bras (catalogue)']));
    t('SCPDC-D3 ⭐⭐ la convention ne dépend d\'AUCUN nom : un exercice PERSONNALISÉ, un exercice FICTIF inédit — même nommés « Unilatéral » — ne sont jamais doublés (480 = kg × reps × séries) ; seule l\'identité du catalogue décide',
      ['perso', 'perso nommé « unilatéral »', 'fictif', 'fictif nommé « unilatéral »'].every(k => vol[k].uni === false && vol[k].avec === 480 && vol[k].sans === 480 && vol[k].lib === ''), J(['perso', 'perso nommé « unilatéral »', 'fictif', 'fictif nommé « unilatéral »'].map(k => vol[k])));
    t('SCPDC-D4 le propriétaire du facteur ne lit aucun nom d\'exercice (ni littéral, ni expression régulière) : il demande à `estUnilateral` (table d\'IDENTIFIANTS du catalogue)', !/['"`][A-ZÀ-Ý][^'"`]{3,}['"`]/.test(vol.src) && !/\/[^\/\n]+\/[gimsuy]*\.test|\.match\(|\.indexOf\(/.test(vol.src) && /estUnilateral/.test(vol.src), vol.src);
    // la saisie : ce qui est tapé est ce qui est enregistré, pour toute famille ; records et 1RM sans multiplication
    const sai = await X.pg.evaluate(async ([RH, DI, CU, FI]) => {
      S.sessions = []; S.prs = {};
      S.wkt = { date: today(), startHour: 10, startTs: Date.now() - 600000, exs: [RH, DI, CU, FI].map(n => ({ name: n, sets: [{ kg: 0, reps: 8, done: false, type: 'N', rm1: 0 }] })) }; persist();
      const lu0 = []; [0, 1, 2, 3].forEach(ei => { upSet(ei, 0, 'kg', '20'); toggleSet(ei, 0); lu0.push(S.wkt.exs[ei].sets[0].kg); });
      await finishWorkout(); const s = S.sessions[0]; const rec = n => (S.prs[n] || {}).kg;
      return { lu0, kgs: s.exs.map(e => e.sets[0].kg), vol: s.volume, attendu: 20 * 8 * 2 + 20 * 8 * 3, recs: [RH, DI, CU, FI].map(rec), rm1: S.prs[RH].rm1, bz: bz(20, 8), csv: _histoLignes(false).filter(r => r.date === s.date).map(r => [r.exercise, r.kg, r.volume]) }; }, [RH, DI, CU, FI]);
    t('SCPDC-D5 ⭐ saisie : 20 kg tapé est enregistré 20 pour le un bras, le deux bras, le perso et le fictif (aucune multiplication à la saisie) ; records : 20 kg, 1RM = bz(20, 8) sans ×2',
      J(sai.lu0) === '[20,20,20,20]' && J(sai.kgs) === '[20,20,20,20]' && J(sai.recs) === '[20,20,20,20]' && sai.rm1 === sai.bz, J({ lu0: sai.lu0, kgs: sai.kgs, recs: sai.recs, rm1: sai.rm1, bz: sai.bz }));
    t('SCPDC-D6 ⭐ le volume de la séance doublé UNE fois pour le seul un bras (160 × 2 + 3 × 160 = 800) et l\'export le redit : 320 (un bras) · 160 · 160 · 160, somme = volume',
      sai.vol === sai.attendu && J(sai.csv.map(r => r[2])) === '[320,160,160,160]' && sai.csv.reduce((a, r) => a + r[2], 0) === sai.vol, J({ vol: sai.vol, csv: sai.csv }));
  });
  await X.cx.close();

  /* ══ E · RÈGLE D'OR n°9 : le bouton central « + » ne bouge pas (mesuré, 360 · 390 · 430) ═══════════════════════════════════ */
  await section('E', 'le bouton central « + » ne bouge pas (360, 390, 430 px)', async () => {
    for (const [W, H] of [[360, 740], [390, 844], [430, 932]]) {
      const Y = await ouvrir(W, H);
      await poser(Y, { custom: CUSTOM, wkt: WKT5() });
      await voir(Y, 0);
      const a = await plus(Y);
      await Y.pg.click(`#sr-0-0 input[type="number"]`); const pr = await plus(Y); await Y.pg.keyboard.press('Tab');
      await Y.pg.click(KG(0, 0)); await Y.pg.click(BTN(0, 0, '+')); await Y.pg.keyboard.type('10'); const b1 = await plus(Y);
      await Y.pg.keyboard.press('Tab'); await Y.pg.waitForTimeout(150); const c = await plus(Y);
      const doc = await Y.pg.evaluate(() => ({ docW: document.documentElement.scrollWidth, vw: innerWidth }));
      t('SCPDC-E1 ⭐ ' + W + ' px : le « + » central ne bouge pas (règle d\'or n°9) — au repère validé D-085 (' + PLUS[W] + ') avant, revenu au même point après ; pendant le choix et la frappe il est dans le même état que pendant la frappe des répétitions (barre du bas masquée par D-085)',
        Math.abs(a.x - PLUS[W]) <= 1 && Math.abs(a.y - PLUSY[W]) <= 1 && c.x === a.x && c.y === a.y && b1.x === pr.x && b1.y === pr.y, J({ a, pr, b1, c, ref: [PLUS[W], PLUSY[W]] }));
      t('SCPDC-E2 ' + W + ' px : aucun débordement horizontal avec le champ « PDC+10 » et les trois choix', doc.docW <= doc.vw && Y.errs.length === 0, J({ doc, errs: Y.errs.slice(0, 2) }));
      await Y.cx.close();
    }
  });
}

module.exports.ecran = ecran;
