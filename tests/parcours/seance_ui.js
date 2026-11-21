/* ═════════════════════════════════════════════════════════════════════════════════════════════
   🏋️ SCUI — ÉCRAN SÉANCE EN COURS : SUPPRIMER LA SÉRIE CHOISIE · LE RIR RESTE ATTEIGNABLE APRÈS UN ZOOM · LE BLOC CHRONO + RIR MOINS HAUT
   (Claude N°2, GO limité de Michel du 16/11/2026 — D-173, D-174, D-175). Blocs : B-SCUI-S* (D-173) · B-SCUI-R* (D-175) · B-SCUI-Z* (D-174).

   D-173 : en séance, supprimer PRÉCISÉMENT la série choisie (4 échauffements puis 3 séries de travail : le 4ᵉ échauffement, pas la dernière
   ligne). Les autres séries ne bougent pas (mêmes objets : cases, charges, reps, RIR, repos, notes, identités, ordre) ; ni le programme
   d'origine ni les séances enregistrées ne changent ; une série POINTÉE demande confirmation, une série non pointée part tout de suite ; la
   question du RIR du repos qui court suit sa série. GÉNÉRIQUE : plusieurs familles d'exercices, un exercice PERSONNALISÉ, un exercice
   FICTIF inédit absent du catalogue, un superset.
   D-174 : après un pinch-zoom (page agrandie), le dock de repos — donc le RIR — doit rester DANS la fenêtre visible, atteignable, sans
   perdre l'état de la séance ; le zoom n'est jamais désactivé ; à ×1 rien ne change.
   D-175 : le bloc chrono + RIR est moins haut ; temps restant, durée du repos, réglage, progression, Passer, −15 s, +15 s et les six réponses
   (Échec, 0, 1, 2, 3, 4+) sont tous là, visibles, sans chevauchement, cibles tactiles ≥ 40 px (les six réponses ≥ 36 px de large).

   CONDUIT : le VRAI Chromium 390×844 (dpr 2, mobile, tactile), la VRAIE app servie en local, les vrais boutons (menu ⋯, lignes de la feuille,
   dock, réponses RIR), `Emulation.setPageScaleFactor` pour le zoom.
   OBSERVE : `S.wkt` (objet complet) / `S.progs` / `S.sessions` avant-après, le stockage local, les rectangles réels (getBoundingClientRect), le
   visualViewport, `elementFromPoint` au centre des boutons, la position du bouton central (règle d'or #9).
   NE COUVRE PAS ⛔ : Safari iOS. Chromium n'est PAS un iPhone : le geste de pan tactile synthétique ne déplace pas la fenêtre visible (même sur une
   page témoin vide), donc la CAUSE exacte du défaut iPhone n'est pas rejouée — seule la GÉOMÉTRIE l'est (le dock tombe hors de la fenêtre visible) et
   le correctif place le dock dans la fenêtre visible. La validation iPhone réelle reste obligatoire avant clôture.
   ⛔ 0 appel réel. Données ENTIÈREMENT FICTIVES. Banc : tools/banc_seance_ui.js · contrôle négatif : tools/mut_seance_ui.py
   ═════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 'scui@example.test', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_lms: moisPrec };
const _det = o => JSON.stringify(o);
const FIC = 'Zorglub inversé à la poulie', PERSO = 'Exo perso Zéta';        // FICTIF (absent du catalogue) · PERSONNALISÉ (S.customExercises)
const PROGS = () => [{ id: 'p1', name: 'Push fictif', exs: [{ name: 'Développé Couché', sets: [{ kg: 0, reps: 8, type: 'N' }, { kg: 0, reps: 8, type: 'N' }] }] }];
const SESS = () => [{ id: 1760349600000, ts: 1760349600000, date: '2026-10-13', synced: true, volume: 2900, progLabel: 'Push',
  exs: [{ name: 'Développé Couché', sets: [{ kg: 90, reps: 8, done: true, type: 'N', rm1: 112 }] }] }];
let _mk = 0;
/* une série marquée : `mk` = son IDENTITÉ de test (jamais confondue avec la position), `note`/`rest` = des champs que seule la série porte */
const SR = (kg, reps, done, type, extra) => Object.assign({ mk: 'm' + (++_mk), kg, reps, done: !!done, type: type || 'N', rm1: done ? Math.round(kg * (1 + reps / 30)) : 0, note: 'n' + _mk, rest: 60 + _mk },
  done ? { at: 100 + _mk, rir: 2, rirV: 2 } : {}, extra || {});
const exo = (name, sets, extra) => Object.assign({ name, sets }, extra || {});

async function ecran(t, b, PORT) {
  const ouvrir = async (opts) => {
    opts = opts || {};
    const W = opts.w || 390, H = opts.h || 844;
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, timezoneId: 'Europe/Paris' });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    const init = Object.assign({}, BASE, { ft4_sessions: JSON.stringify(SESS()), ft4_progs: JSON.stringify(PROGS()),
      ft4_cuex: JSON.stringify([{ n: PERSO, g: 'Pectoraux', eq: 'Haltères', c: 'custom' }]) });
    if (opts.wkt !== undefined) { init.ft4_wkt = JSON.stringify(opts.wkt); init.ft4_wkt_draft = JSON.stringify(opts.wkt); }
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_scui'))return; sessionStorage.setItem('_scui','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    // ⚠️ le piège du lundi et du mois (BUGS §143/§148) : les bilans automatiques recouvriraient l'écran → posés comme dans maj_version.js
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none';
      const tt = today(), pm = new Date(Date.UTC(+tt.slice(0, 4), +tt.slice(5, 7) - 2, 15));
      S.lastWeekSummary = tt; S.lastMonthSummary = pm.getUTCFullYear() + '-' + String(pm.getUTCMonth() + 1).padStart(2, '0');
      if (S.wkt && S.wkt.date === '__TODAY__') S.wkt.date = tt; persist();
      goScreen('log', document.getElementById('nb-log')); });
    await pg.waitForTimeout(350);
    const cd = await cx.newCDPSession(pg);
    return { cx, pg, cd, errs, W, H };
  };
  const wkt = (exs, extra) => Object.assign({ date: '__TODAY__', startHour: 10, startTs: Date.now() - 600000, exs }, extra || {});
  const etat = X => X.pg.evaluate(() => ({ wkt: S.wkt ? JSON.parse(JSON.stringify(S.wkt)) : null, progs: JSON.parse(JSON.stringify(S.programmes || S.progs || [])),
    sess: JSON.parse(JSON.stringify(S.sessions || [])), disque: JSON.parse(localStorage.getItem('ft4_wkt') || 'null') }));
  const fab = X => X.pg.evaluate(() => { const r = document.getElementById('nb-log').getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(v => Math.round(v * 10) / 10).join(','); });
  const confirmOuvert = X => X.pg.evaluate(() => { const o = document.getElementById('ov-confirm'); return !!(o && o.classList.contains('open')); });
  // l'exercice `ei` ouvert (carte dépliée), puis les VRAIS boutons : ⋯ → « Supprimer une série… » → la ligne n° `n`
  const ouvrirExo = async (X, ei) => { await X.pg.evaluate(ei => { _expandedEx = ei; renderExBlocks(); }, ei); await X.pg.waitForTimeout(150); };
  const menu = async (X, ei) => { await ouvrirExo(X, ei);
    const ok = await X.pg.evaluate(ei => { const bt = [...document.querySelectorAll('#ex-block-' + ei + ' .ex-hdr button')].filter(e => (e.textContent || '').trim() === '⋯').pop(); if (!bt) return false; bt.click(); return true; }, ei);
    await X.pg.waitForTimeout(150); return ok; };
  const entree = X => X.pg.evaluate(() => { const o = document.getElementById('ov-ex-menu'); if (!o || !o.classList.contains('open')) return false;
    return [...o.querySelectorAll('button')].some(e => /Supprimer une série/.test(e.textContent)); });
  const ouvrirFeuille = async (X, ei) => { if (!await menu(X, ei)) return false;
    const ok = await X.pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-ex-menu button')].find(e => /Supprimer une série/.test(e.textContent)); if (!bt) return false; bt.click(); return true; });
    await X.pg.waitForTimeout(150); return ok; };
  const lignesFeuille = X => X.pg.evaluate(() => [...document.querySelectorAll('#ov-ex-menu button[onclick^="supprimerSerie("]')].map(e => e.textContent.replace(/\s+/g, ' ').trim()));
  const toucherLigne = async (X, ei, si) => { const ok = await X.pg.evaluate(([ei, si]) => { const bt = document.querySelector('#ov-ex-menu button[onclick="supprimerSerie(' + ei + ',' + si + ')"]'); if (!bt) return false; bt.click(); return true; }, [ei, si]);
    await X.pg.waitForTimeout(200); return ok; };
  const confirmer = async (X, oui) => { await X.pg.evaluate(oui => { document.getElementById(oui ? 'confirm-ok' : 'confirm-cancel').click(); }, !!oui); await X.pg.waitForTimeout(200); };
  const sans = (arr, i) => arr.filter((_, k) => k !== i);
  const J = o => JSON.stringify(o);

  /* ══ S · D-173 — SUPPRIMER LA SÉRIE CHOISIE ═══════════════════════════════════════════ */
  const E1 = () => [SR(20, 12, true, 'É'), SR(40, 10, true, 'É'), SR(60, 8, true, 'É'), SR(70, 5, false, 'É'),          // 4 échauffements
    SR(100, 5, true, 'N'), SR(100, 5, false, 'N'), SR(100, 5, false, 'N')];                                             // 3 séries de travail
  {
    const X = await ouvrir({ wkt: wkt([exo('Développé Couché', E1()), exo('Tractions', [SR(0, 8, false), SR(0, 8, false)])]) });
    const av = await etat(X); const f0 = await fab(X);
    t('B-SCUI-S1 ⭐ le menu ⋯ de l\'exercice propose « Supprimer une série… » (et « Supprimer l\'exercice » reste)', await menu(X, 0) && await entree(X)
      && await X.pg.evaluate(() => [...document.querySelectorAll('#ov-ex-menu button')].some(e => /Supprimer l'exercice/.test(e.textContent))), '');
    await X.pg.evaluate(() => closeExMenu());
    t('B-SCUI-S2 la feuille liste CHAQUE série (7), avec son numéro, son type, charge × reps, et « ✓ faite » pour les pointées', await ouvrirFeuille(X, 0) && await (async () => {
      const l = await lignesFeuille(X); return l.length === 7 && /^4\s*Échauffement · 5 × 70 kg/.test(l[3]) && !/faite/.test(l[3]) && /faite/.test(l[0]) && /^5\s*Normal · 5 × 100 kg ✓ faite/.test(l[4]); })(), _det(await lignesFeuille(X)));
    const fm = await fab(X);
    await toucherLigne(X, 0, 3);                      // le 4ᵉ échauffement, NON pointé
    const ap = await etat(X);
    t('B-SCUI-S3 ⭐ une série non pointée part TOUT DE SUITE, sans confirmation (le 4ᵉ échauffement)', !(await confirmOuvert(X)) && ap.wkt.exs[0].sets.length === 6, 'n=' + ap.wkt.exs[0].sets.length);
    t('B-SCUI-S4 ⭐ LE 4ᵉ ÉCHAUFFEMENT est celui qui part : 3 échauffements + 3 séries de travail restent, dans l\'ordre',
      J(ap.wkt.exs[0].sets.map(s => s.mk)) === J(sans(av.wkt.exs[0].sets, 3).map(s => s.mk)) && ap.wkt.exs[0].sets.map(s => s.type).join('') === 'ÉÉÉNNN', J(ap.wkt.exs[0].sets.map(s => s.mk + s.type)));
    t('B-SCUI-S5 ⭐ TOUT le reste est identique, objet par objet (cases pointées, charges, reps, RIR, repos, notes, horodatages, identités)',
      J(ap.wkt.exs[0].sets) === J(sans(av.wkt.exs[0].sets, 3)) && J(ap.wkt.exs[1]) === J(av.wkt.exs[1]), '');
    t('B-SCUI-S6 le reste de la séance ne change pas (date, heure de début, autres exercices)', J(Object.assign({}, ap.wkt, { exs: 0 })) === J(Object.assign({}, av.wkt, { exs: 0 })), '');
    t('B-SCUI-S7 ⭐ ni le programme d\'origine ni les séances enregistrées ne changent', J(ap.progs) === J(av.progs) && J(ap.sess) === J(av.sess), '');
    t('B-SCUI-S8 règle d\'or #3 : la suppression est écrite sur le disque tout de suite (ft4_wkt)', ap.disque && ap.disque.exs[0].sets.length === 6 && J(ap.disque.exs[0].sets.map(s => s.mk)) === J(ap.wkt.exs[0].sets.map(s => s.mk)), '');
    t('B-SCUI-S9 la feuille se ferme et l\'écran se redessine : 6 lignes de série à l\'écran', await X.pg.evaluate(() => !document.getElementById('ov-ex-menu').classList.contains('open') && document.querySelectorAll('#ex-block-0 .set-row').length === 6), '');
    t('B-SCUI-S10 ⭐ règle d\'or #9 : le bouton central « + » ne bouge pas (avant · feuille ouverte · après)', f0 === fm && f0 === await fab(X), f0 + ' | ' + fm + ' | ' + await fab(X));
    // une série POINTÉE : confirmation ; annuler ne touche à rien ; confirmer retire cette série et elle seule
    const av2 = await etat(X);
    await ouvrirFeuille(X, 0); await toucherLigne(X, 0, 3);        // maintenant la 4ᵉ ligne = la série de travail n°1 (pointée)
    const conf = await X.pg.evaluate(() => ({ ouv: document.getElementById('ov-confirm').classList.contains('open'), titre: document.getElementById('confirm-title').textContent, msg: document.getElementById('confirm-msg').textContent }));
    const pendant = await etat(X);
    t('B-SCUI-S11 ⭐ une série POINTÉE demande confirmation, et rien n\'est supprimé tant qu\'on n\'a pas confirmé', conf.ouv && /Supprimer la série 4/.test(conf.titre) && /validée/.test(conf.msg) && J(pendant.wkt.exs[0].sets) === J(av2.wkt.exs[0].sets), _det(conf));
    await confirmer(X, false);
    const annule = await etat(X);
    t('B-SCUI-S12 « Annuler » laisse la série et toutes les autres exactement telles quelles', J(annule.wkt) === J(av2.wkt) && !(await confirmOuvert(X)), '');
    await ouvrirFeuille(X, 0); await toucherLigne(X, 0, 3); await confirmer(X, true);
    const fait = await etat(X);
    t('B-SCUI-S13 ⭐ confirmer retire CETTE série pointée et elle seule (les 5 autres, intactes)', fait.wkt.exs[0].sets.length === 5 && J(fait.wkt.exs[0].sets) === J(sans(av2.wkt.exs[0].sets, 3)), J(fait.wkt.exs[0].sets.map(s => s.mk)));
    t('B-SCUI-S14 la séance reste utilisable : valider une série restante, « + Série », et « − » (appui maintenu) retirent toujours la DERNIÈRE',
      await X.pg.evaluate(() => { const n0 = S.wkt.exs[0].sets.length; const k = S.wkt.exs[0].sets.findIndex(s => !s.done); toggleSet(0, k); const ok1 = S.wkt.exs[0].sets[k].done === true; stopRest();
        addSet(0); const ok2 = S.wkt.exs[0].sets.length === n0 + 1; const dernier = S.wkt.exs[0].sets[n0]; rmLastSet(0); const ok3 = S.wkt.exs[0].sets.length === n0 && S.wkt.exs[0].sets.indexOf(dernier) < 0; return ok1 && ok2 && ok3; }), '');
    t('B-SCUI-S15 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  // DES FAMILLES D'EXERCICES, un exercice PERSONNALISÉ et un exercice FICTIF inédit : même règle, aucun nom codé en dur
  for (const [fam, nom] of [['catalogue — poussée', 'Développé Couché'], ['catalogue — jambes', 'Squat'], ['catalogue — tirage', 'Tractions'], ['catalogue — isolation', 'Curl Biceps Haltères'],
    ['catalogue — abdominaux', 'Crunch'], ['PERSONNALISÉ (S.customExercises)', PERSO], ['FICTIF inédit, absent du catalogue', FIC]]) {
    const X = await ouvrir({ wkt: wkt([exo(nom, [SR(30, 10, true, 'É'), SR(50, 8, false, 'É'), SR(80, 6, true), SR(80, 6, false), SR(80, 6, false)])]) });
    const av = await etat(X);
    const ok = await ouvrirFeuille(X, 0); const l = ok ? await lignesFeuille(X) : [];
    await toucherLigne(X, 0, 1);                                    // la 2ᵉ ligne : un échauffement non pointé, au MILIEU
    const ap = await etat(X);
    t('B-SCUI-S16 ⭐ ' + fam + ' « ' + nom + ' » : la série du MILIEU choisie part, les 4 autres restent identiques, dans l\'ordre',
      ok && l.length === 5 && ap.wkt.exs[0].sets.length === 4 && J(ap.wkt.exs[0].sets) === J(sans(av.wkt.exs[0].sets, 1)) && J(ap.sess) === J(av.sess), _det(l));
    await X.cx.close();
  }
  // un SUPERSET : deux exercices reliés par `group`, chacun sa liste ; supprimer dans l'un ne touche pas l'autre ni le lien
  {
    const g = 'g-scui';
    const X = await ouvrir({ wkt: wkt([exo('Développé Couché', [SR(60, 10, true), SR(60, 10, false), SR(60, 10, false), SR(60, 10, false)], { group: g, groupType: 'super' }),
      exo(FIC, [SR(30, 12, true), SR(30, 12, false), SR(30, 12, false)], { group: g, groupType: 'super' }), exo('Squat', [SR(90, 5, false), SR(90, 5, false)])]) });
    const av = await etat(X);
    const ok = await ouvrirFeuille(X, 0); await toucherLigne(X, 0, 1);
    const ap = await etat(X);
    t('B-SCUI-S17 ⭐ superset : la série choisie du 1ᵉʳ exercice part ; le 2ᵉ exercice, le troisième et le LIEN (group, groupType) sont intacts',
      ok && J(ap.wkt.exs[0].sets) === J(sans(av.wkt.exs[0].sets, 1)) && ap.wkt.exs[0].group === g && ap.wkt.exs[0].groupType === 'super' && J(ap.wkt.exs[1]) === J(av.wkt.exs[1]) && J(ap.wkt.exs[2]) === J(av.wkt.exs[2]), '');
    t('B-SCUI-S18 superset : la séance continue de se dérouler (les séries restantes se valident, le groupe n\'explose pas, aucune erreur)',
      await X.pg.evaluate(() => { try { for (let e = 0; e < 2; e++) for (let s = 0; s < S.wkt.exs[e].sets.length; s++) if (!S.wkt.exs[e].sets[s].done) { toggleSet(e, s); stopRest(); }
        return S.wkt.exs[0].sets.every(s => s.done) && S.wkt.exs[1].sets.every(s => s.done) && S.wkt.exs[0].group === S.wkt.exs[1].group; } catch (e) { return false; } }) && X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  // les bornes : la dernière série restante, un dropset
  {
    const X = await ouvrir({ wkt: wkt([exo('Tractions', [SR(0, 8, false)]), exo('Squat', [SR(90, 5, false), SR(90, 5, false), SR(80, 5, false)], { dropset: { paliers: 2, pct: 10, direction: 'down' } })]) });
    const av = await etat(X);
    t('B-SCUI-S19 règle existante : la DERNIÈRE série restante ne se supprime pas ici (pas d\'entrée, et la fonction refuse) — on supprime l\'exercice',
      await menu(X, 0) && !(await entree(X)) && await X.pg.evaluate(() => { closeExMenu(); if (typeof supprimerSerie === 'function') supprimerSerie(0, 0); return S.wkt.exs[0].sets.length === 1; }), '');
    /* RÉÉCRIT le 16/11/2026 (CE lot M, D-173 : « supprimer la série choisie, y compris dans les structures DÉGRESSIVES »). AVANT : « un dropset garde son propre réglage (« Modifier paliers ») : pas d'entrée, et la fonction
       refuse » — le TOUT dropset était exclu, ce que la décision interdit (la série NORMALE qui précède la chaîne se supprime comme les autres). L'INVARIANT GARDÉ, sur ce qu'il protégeait : les PALIERS d'un dropset gardent leur
       réglage « Modifier paliers » (le nombre de paliers fait loi) — la fonction REFUSE de retirer un palier isolé, sans rien changer, et leurs lignes ne sont pas cliquables. Ici : [normale, palier, palier] (paliers:2). Les
       témoins de la suppression dans un dropset (la normale part, la chaîne et son réglage restent) sont dans B-SCCM-S. */
    /* RÉÉCRIT UNE 2ᵉ FOIS le 17/11/2026 (lot D de fermeture, arbitrage de Michel : D-173 autorise le palier isolé). AVANT : « leurs lignes ne sont pas cliquables et la fonction REFUSE de retirer un palier isolé ».
       L'INVARIANT GARDÉ : le réglage « Modifier paliers » (`dropset.paliers`) dit toujours le VRAI nombre de paliers, et un dropset ne perd jamais son dernier palier en silence. Maintenant : [normale, palier, palier] —
       les 3 lignes sont proposées, retirer un palier recale le réglage (2 → 1), et le DERNIER palier restant est refusé (sémantique non décidée). */
    t('B-SCUI-S20 un dropset : ses paliers se suppriment un à un et le réglage « Modifier paliers » suit (2 → 1) ; le DERNIER palier restant est refusé',
      await ouvrirFeuille(X, 1) && await (async () => { const l = await lignesFeuille(X); return l.length === 3 && /^1\s*Normal/.test(l[0]) && /^2\s*Palier/.test(l[1]) && /^3\s*Palier/.test(l[2]); })()
      && await X.pg.evaluate(() => { closeExMenu(); if (typeof supprimerSerie === 'function') supprimerSerie(1, 2); return S.wkt.exs[1].sets.length === 2 && !!S.wkt.exs[1].dropset && S.wkt.exs[1].dropset.paliers === 1; }), '');
    const av20 = await etat(X);
    await X.pg.evaluate(() => { if (typeof supprimerSerie === 'function') { supprimerSerie(1, 1); supprimerSerie(0, 0); } });   // le dernier palier restant · la dernière série de l'autre exercice
    const ap = await etat(X);
    t('B-SCUI-S21 les tentatives REFUSÉES (dernier palier restant, dernière série) ne changent pas la séance', J(ap.wkt) === J(av20.wkt) && ap.wkt.exs[1].dropset.paliers === 1, '');
    await X.cx.close();
  }
  // la QUESTION DU RIR du repos qui court suit sa série (ou disparaît avec elle)
  {
    const X = await ouvrir({ wkt: wkt([exo('Développé Couché', [SR(80, 8, false), SR(80, 8, false), SR(80, 8, false), SR(80, 8, false)])]) });
    await X.pg.evaluate(() => { toggleSet(0, 2); });                     // la 3ᵉ série est validée : le repos démarre, la question du RIR porte sur elle
    await X.pg.waitForTimeout(300);
    const cible = await X.pg.evaluate(() => S.wkt.exs[0].sets[2].mk);
    await ouvrirFeuille(X, 0); await toucherLigne(X, 0, 0);               // on retire la 1ʳᵉ série (non pointée) : la série visée devient la n°2
    const q = await X.pg.evaluate(() => ({ cible: JSON.stringify(_rirCible), n: document.querySelectorAll('#rest-rir .rir-b').length, hasUn: !!document.querySelector('#rest-rir .rir-b') }));
    await X.pg.evaluate(() => { [...document.querySelectorAll('#rest-rir .rir-b')].find(e => e.textContent.trim() === '2').click(); });
    await X.pg.waitForTimeout(200);
    const rep = await etat(X);
    const reçu = rep.wkt.exs[0].sets.filter(s => s.rir === 2).map(s => s.mk);
    t('B-SCUI-S22 ⭐ la réponse du RIR va à LA SÉRIE QUI VIENT DE FINIR, même après une suppression au-dessus d\'elle (pas à sa voisine)',
      q.cible === J({ ei: 0, si: 1 }) && J(reçu) === J([cible]) && rep.wkt.exs[0].sets.find(s => s.mk === cible).rirV === 2, _det(q) + ' reçu=' + J(reçu) + ' cible=' + cible);
    // et si on supprime la série dont le RIR est demandé : la question disparaît avec elle
    await X.pg.evaluate(() => { stopRest(); const k = S.wkt.exs[0].sets.findIndex(s => !s.done); toggleSet(0, k); });
    await X.pg.waitForTimeout(300);
    const avant = await X.pg.evaluate(() => document.querySelectorAll('#rest-rir .rir-b').length);
    await ouvrirFeuille(X, 0);
    const cibleSi = await X.pg.evaluate(() => _rirCible && _rirCible.si);
    await toucherLigne(X, 0, cibleSi); await confirmer(X, true);
    const apres = await X.pg.evaluate(() => ({ btns: document.querySelectorAll('#rest-rir .rir-b').length, cible: _rirCible, bar: document.getElementById('rest-bar').classList.contains('show') }));
    t('B-SCUI-S23 si on supprime la série dont le RIR est demandé, la question disparaît (pas de réponse dans le vide) ; le repos, lui, continue',
      avant >= 5 && apres.btns === 0 && apres.cible === null && apres.bar, _det({ avant, apres }));
    t('B-SCUI-S24 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  // aucun nom d'exercice codé en dur dans la règle (R : générique)
  {
    const X = await ouvrir({ wkt: null });
    const r = await X.pg.evaluate(() => { const src = [window._serieSupprimable, window.openSerieSuppr, window.supprimerSerie].map(f => (typeof f === 'function' ? f.toString() : '')).join('\n').toLowerCase();
      const noms = (typeof EXLIB !== 'undefined' ? EXLIB : []).map(e => String(e.n || '').toLowerCase()).filter(n => n.length >= 5);
      return { n: noms.length, trouves: noms.filter(n => src.indexOf(n) >= 0).slice(0, 5), longueur: src.length }; });
    t('B-SCUI-S25 ⭐ GÉNÉRIQUE : aucun des noms du catalogue n\'apparaît dans le code de la suppression (aucun nom codé en dur)', r.n > 100 && r.trouves.length === 0 && r.longueur > 500, _det(r));
    await X.cx.close();
  }

  /* ══ R · D-175 — LE BLOC CHRONO + RIR MOINS HAUT ════════════════════════════════════════ */
  const dock = X => X.pg.evaluate(() => {
    const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const vis = e => !!(e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
    const bar = document.getElementById('rest-bar');
    const rir = [...document.querySelectorAll('#rest-rir .rir-b')].filter(e => !e.classList.contains('rir-x'));
    return { bar: R(bar), shown: bar.classList.contains('show'), time: R(document.getElementById('rest-time')), timeTxt: document.getElementById('rest-time').textContent,
      tot: (document.getElementById('rest-tot') || {}).textContent, ring: R(document.getElementById('rest-ring')), regler: R(document.getElementById('rest-regler')),
      moins: R(document.getElementById('rest-btn-minus')), plus: R(document.getElementById('rest-btn-plus')), skip: R(bar.querySelector('.rd-skip')),
      lbl: R(bar.querySelector('.rir-lbl')), lblTxt: (bar.querySelector('.rir-lbl') || {}).textContent, row: R(bar.querySelector('.rir-row')), rir: rir.map(R), rirTxt: rir.map(e => e.textContent.trim()), rirVis: rir.map(vis),
      vis: ['rest-time', 'rest-tot', 'rest-ring', 'rest-regler', 'rest-btn-minus', 'rest-btn-plus'].map(i => vis(document.getElementById(i))).concat([vis(bar.querySelector('.rd-skip'))]),
      onclickRegler: document.getElementById('rest-regler').getAttribute('onclick'), rowScroll: bar.querySelector('.rir-row') ? [bar.querySelector('.rir-row').scrollWidth, bar.querySelector('.rir-row').clientWidth] : null,
      vw: innerWidth, vh: innerHeight }; });
  const EXS = () => [exo('Développé Couché', [SR(80, 8, false), SR(80, 8, false), SR(80, 8, false)]), exo('Tractions', [SR(0, 8, false), SR(0, 8, false)])];
  const lancerRepos = async X => { await X.pg.evaluate(() => { toggleSet(0, 0); }); await X.pg.waitForTimeout(450); };
  for (const [W, H] of [[390, 844], [360, 780], [430, 932]]) {
    const X = await ouvrir({ w: W, h: H, wkt: wkt(EXS()) });
    const f0 = await fab(X);
    await lancerRepos(X);
    const d = await dock(X); const fR = await fab(X);
    t('B-SCUI-R1 ⭐ ' + W + '×' + H + ' : le bloc chrono + RIR est nettement moins haut (≤ 118 px, soit −30 % au moins ; il en faisait 170 avant — mesuré sur 13e84397, même état)', d.shown && d.bar && d.bar.h <= 118 && d.bar.h >= 80, 'h=' + (d.bar && d.bar.h));
    t('B-SCUI-R2 ' + W + ' px : tout est là et visible — temps restant, durée du repos, réglage, anneau de progression, Passer, −15 s, +15 s', d.vis.every(Boolean) && /^\d+:\d\d$/.test(d.timeTxt) && /\d:\d\d/.test(d.tot || '') && /openRestEdit/.test(d.onclickRegler || ''), _det(d.vis) + ' ' + d.timeTxt + ' ' + d.tot);
    t('B-SCUI-R3 ⭐ ' + W + ' px : les six réponses du RIR dans l\'ordre : Échec · 0 · 1 · 2 · 3 · 4+ (toutes visibles) et la question posée', J(d.rirTxt) === J(['Échec', '0', '1', '2', '3', '4+']) && d.rirVis.every(Boolean) && /restait combien/.test(d.lblTxt || ''), _det(d.rirTxt) + ' ' + d.lblTxt);
    t('B-SCUI-R4 ⭐ ' + W + ' px : cibles tactiles — −15 s, +15 s, Passer, le temps ≥ 44 px de haut (D-086 ⑤c gardé) ; les six réponses ≥ 40 px de haut et ≥ 36 px de large',
      [d.moins, d.plus, d.skip, d.regler].every(e => e.h >= 43.5 && e.w >= 44) && d.rir.every(e => e.h >= 39.5 && e.w >= 36), _det([d.moins, d.plus, d.skip, d.regler].map(e => [Math.round(e.w), Math.round(e.h)])) + ' ' + _det(d.rir.map(e => [Math.round(e.w), Math.round(e.h)])));
    t('B-SCUI-R5 ⭐ ' + W + ' px : AUCUN chevauchement — rangée du haut, question, réponses : chacune au-dessus de la suivante, toutes dans le bloc, sans défilement horizontal',
      d.regler.b <= d.lbl.y + 0.5 && d.moins.b <= d.lbl.y + 0.5 && d.plus.b <= d.lbl.y + 0.5 && d.skip.b <= d.lbl.y + 0.5 && d.lbl.b <= d.row.y + 0.5
      && d.rir.every(e => e.y >= d.row.y - 0.5 && e.b <= d.bar.b + 0.5 && e.x >= d.bar.x && e.r <= d.bar.r + 0.5) && d.rir.every((e, i) => i === 0 || e.x >= d.rir[i - 1].r - 0.5)
      && d.moins.r <= d.regler.x + 0.5 && d.regler.r <= d.plus.x + 0.5 && d.plus.r <= d.skip.x + 0.5 && d.rowScroll[0] <= d.rowScroll[1] + 1, _det({ regler: d.regler, lbl: d.lbl, row: d.row }));
    t('B-SCUI-R6 ' + W + ' px : le bloc reste dans l\'écran et AU-DESSUS de la barre du bas (bouton central compris)', d.bar.x >= 0 && d.bar.r <= d.vw && d.bar.y >= 0 && d.bar.b <= d.vh && d.bar.b <= (await X.pg.evaluate(() => document.getElementById('nb-log').getBoundingClientRect().top)), _det(d.bar));
    t('B-SCUI-R7 ⭐ ' + W + ' px : règle d\'or #9 — le bouton central « + » ne bouge pas (repos arrêté · repos en cours)', f0 === fR, f0 + ' | ' + fR);
    if (W === 390) {
      // la LOGIQUE du chrono et du RIR n'a pas changé : mêmes fonctions, mêmes effets
      const L0 = await X.pg.evaluate(() => _restLeft());
      await X.pg.evaluate(() => document.getElementById('rest-btn-plus').click()); const L1 = await X.pg.evaluate(() => _restLeft());
      await X.pg.evaluate(() => document.getElementById('rest-btn-minus').click()); const L2 = await X.pg.evaluate(() => _restLeft());
      t('B-SCUI-R8 ⭐ −15 s et +15 s font toujours ±15 s (chrono inchangé)', Math.abs((L1 - L0) - 15) <= 1 && Math.abs((L1 - L2) - 15) <= 1, [L0, L1, L2].join(','));
      t('B-SCUI-R9 le temps touché ouvre toujours « Régler » (ov-rest-edit)', await X.pg.evaluate(() => { document.getElementById('rest-regler').click(); const o = document.getElementById('ov-rest-edit'); const ok = !!(o && o.classList.contains('open')); if (ok) o.classList.remove('open'); return ok; }), '');
      const clicRir = txt => X.pg.evaluate(txt => { const bt = [...document.querySelectorAll('#rest-rir .rir-b')].find(e => e.textContent.trim() === txt); if (!bt) return false; bt.click(); return true; }, txt);
      await clicRir('2'); const s2 = await X.pg.evaluate(() => ({ rir: S.wkt.exs[0].sets[0].rir, rirV: S.wkt.exs[0].sets[0].rirV, type: S.wkt.exs[0].sets[0].type }));
      await clicRir('Échec'); const sE = await X.pg.evaluate(() => ({ rir: S.wkt.exs[0].sets[0].rir, type: S.wkt.exs[0].sets[0].type }));
      await clicRir('0'); const s0 = await X.pg.evaluate(() => ({ rir: S.wkt.exs[0].sets[0].rir, rirV: S.wkt.exs[0].sets[0].rirV, type: S.wkt.exs[0].sets[0].type }));
      t('B-SCUI-R10 ⭐ le RIR garde sa logique (refonte « Échec » ≠ « 0 ») : 2 → rir 2 · Échec → type X sans rir · 0 → rir 0 (rirV 2) et type N',
        s2.rir === 2 && s2.rirV === 2 && sE.type === 'X' && sE.rir === undefined && s0.rir === 0 && s0.rirV === 2 && s0.type === 'N', _det([s2, sE, s0]));
      const x = await X.pg.evaluate(() => { const b = document.querySelector('#rest-rir .rir-x'); if (!b) return null; const r = b.getBoundingClientRect(); return { w: r.width, h: r.height }; });
      t('B-SCUI-R11 « ✕ » (retirer la réponse) apparaît après une réponse, ≥ 36 px × 40 px, et la retire', !!x && x.w >= 36 && x.h >= 39.5 && await X.pg.evaluate(() => { document.querySelector('#rest-rir .rir-x').click(); const s = S.wkt.exs[0].sets[0]; return s.rir === undefined && s.type === 'N'; }), _det(x));
      await X.pg.evaluate(() => document.querySelector('#rest-bar .rd-skip').click()); await X.pg.waitForTimeout(150);
      t('B-SCUI-R12 « Passer » arrête toujours le repos et ferme le bloc', await X.pg.evaluate(() => !restIv && !document.getElementById('rest-bar').classList.contains('show')), '');
    }
    t('B-SCUI-R13 ' + W + ' px : aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  // superset : DEUX questions (une par exercice) restent lisibles et atteignables ; un libellé de repos (« Échauffement ») ne casse rien
  {
    const g = 'g-scui2';
    const X = await ouvrir({ wkt: wkt([exo('Développé Couché', [SR(60, 10, false), SR(60, 10, false)], { group: g, groupType: 'super' }), exo(FIC, [SR(30, 12, false), SR(30, 12, false)], { group: g, groupType: 'super' })]) });
    await X.pg.evaluate(() => { toggleSet(0, 0); toggleSet(1, 0); }); await X.pg.waitForTimeout(500);
    const d = await X.pg.evaluate(() => { const bar = document.getElementById('rest-bar').getBoundingClientRect(); const lbls = [...document.querySelectorAll('#rest-rir .rir-lbl')].map(e => e.getBoundingClientRect());
      const rows = [...document.querySelectorAll('#rest-rir .rir-row')].map(e => e.getBoundingClientRect()); const bs = [...document.querySelectorAll('#rest-rir .rir-b')].map(e => e.getBoundingClientRect());
      return { bar: { y: bar.top, b: bar.bottom, h: bar.height }, nq: lbls.length, ordre: lbls.every((l, i) => l.bottom <= rows[i].top + 0.5 && (i === 0 || rows[i - 1].bottom <= l.top + 0.5)),
        dedans: bs.every(r => r.top >= bar.top && r.bottom <= bar.bottom + 0.5), h40: bs.every(r => r.height >= 39.5), nb: bs.length, vh: innerHeight }; });
    t('B-SCUI-R14 superset : deux questions, une par exercice, dans l\'ordre, sans chevauchement, toutes les réponses dans le bloc et ≥ 40 px, le bloc dans l\'écran',
      d.nq === 2 && d.ordre && d.dedans && d.h40 && d.nb === 12 && d.bar.y >= 0 && d.bar.b <= d.vh, _det(d));
    await X.cx.close();
  }

  /* ══ Z · D-174 — LE RIR RESTE ATTEIGNABLE APRÈS UN ZOOM ══════════════════════════════════ */
  const vv = X => X.pg.evaluate(() => { const v = window.visualViewport; return { s: v.scale, x: v.offsetLeft, y: v.offsetTop, w: v.width, h: v.height }; });
  const zoomer = async (X, s) => { await X.cd.send('Emulation.setPageScaleFactor', { pageScaleFactor: s }); await X.pg.waitForTimeout(450); };
  // « atteignable » = chaque commande est ENTIÈREMENT dans la fenêtre visible ET c'est bien elle qui reçoit le toucher à son centre
  const atteignable = X => X.pg.evaluate(() => {
    const v = window.visualViewport; const dedans = r => r.left >= v.offsetLeft - 0.5 && r.right <= v.offsetLeft + v.width + 0.5 && r.top >= v.offsetTop - 0.5 && r.bottom <= v.offsetTop + v.height + 0.5;
    const cmd = { moins: '#rest-btn-minus', plus: '#rest-btn-plus', passer: '#rest-bar .rd-skip', regler: '#rest-regler' };
    const out = { s: v.scale, bar: document.getElementById('rest-bar').className, tr: document.getElementById('rest-bar').style.transform, cmds: {}, rir: [] };
    const test = (sel, e) => { const r = e.getBoundingClientRect(); const c = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { dedans: dedans(r), touche: !!c && (c === e || e.contains(c)), r: [r.left, r.top, r.right, r.bottom].map(Math.round) }; };
    for (const k in cmd) out.cmds[k] = test(k, document.querySelector(cmd[k]));
    document.querySelectorAll('#rest-rir .rir-b').forEach(e => out.rir.push(Object.assign({ txt: e.textContent.trim() }, test('rir', e))));
    out.vv = [v.offsetLeft, v.offsetTop, v.width, v.height].map(Math.round); return out; });
  const toutOk = a => Object.keys(a.cmds).every(k => a.cmds[k].dedans && a.cmds[k].touche) && a.rir.length >= 6 && a.rir.every(r => r.dedans && r.touche);
  // DEUX temps : un ÉCHAUFFEMENT (repos, bloc COURT, pas de question) puis, PENDANT le zoom, une série de travail (le bloc GRANDIT : la question du RIR s'ouvre) —
  // un bloc posé pour la taille du premier serait coupé en bas pour le second (c'est ce qui attrape un observateur de taille retiré).
  const EXZ = () => [exo('Développé Couché', [SR(40, 10, false, 'É'), SR(80, 8, false), SR(80, 8, false)]), exo('Tractions', [SR(0, 8, false), SR(0, 8, false)])];
  for (const s of [1.3, 2, 3]) {
    const X = await ouvrir({ wkt: wkt(EXZ()) });
    await X.pg.evaluate(() => { toggleSet(0, 0); }); await X.pg.waitForTimeout(450);
    const av = await etat(X); const f0 = await fab(X);
    const rest0 = await X.pg.evaluate(() => ({ ts: restStartTs, tot: restTot, iv: !!restIv }));
    await zoomer(X, s);
    const a = await atteignable(X);
    t('B-SCUI-Z1 ⭐ zoom ×' + s + ' : le bloc de repos (−15 s, +15 s, Passer, Régler) est dans la fenêtre VISIBLE et reçoit le toucher', a.rir.length === 0 && Object.keys(a.cmds).every(k => a.cmds[k].dedans && a.cmds[k].touche), _det(a).slice(0, 700));
    t('B-SCUI-Z2 zoom ×' + s + ' : le zoom n\'est PAS désactivé (balise viewport : user-scalable=yes, pas de maximum-scale=1) et la page est bien agrandie',
      Math.abs((await vv(X)).s - s) < 0.01 && await X.pg.evaluate(() => { const c = (document.querySelector('meta[name=viewport]') || {}).content || ''; const m = /maximum-scale\s*=\s*([\d.]+)/.exec(c); return /user-scalable\s*=\s*yes/.test(c) && (!m || +m[1] >= 3); }), '');
    const ap = await etat(X); const rest1 = await X.pg.evaluate(() => ({ ts: restStartTs, tot: restTot, iv: !!restIv }));
    t('B-SCUI-Z3 ⭐ zoom ×' + s + ' : l\'état de la séance est conservé (S.wkt identique, repos qui court sans redémarrer)', J(ap.wkt) === J(av.wkt) && J(rest1) === J(rest0) && rest1.iv, _det([rest0, rest1]));
    // un repos qui DÉMARRE pendant le zoom, avec la question du RIR : le bloc grandit et reste dans la fenêtre visible
    await X.pg.evaluate(() => { stopRest(); }); await X.pg.waitForTimeout(150);
    await X.pg.evaluate(() => { toggleSet(0, 1); }); await X.pg.waitForTimeout(450);
    t('B-SCUI-Z5 ⭐ zoom ×' + s + ' : un repos qui démarre PENDANT le zoom, avec sa question du RIR (le bloc grandit), reste dans la fenêtre visible — les six réponses atteignables', toutOk(await atteignable(X)), _det(await atteignable(X)).slice(0, 500));
    // un vrai toucher sur une réponse PENDANT le zoom (coordonnées de la souris CDP = pixels CSS de la fenêtre VISIBLE : page − décalage de la fenêtre ; mesuré, voir repro_zoom)
    const pt = await X.pg.evaluate(() => { const v = window.visualViewport; const bt = [...document.querySelectorAll('#rest-rir .rir-b')].find(e => e.textContent.trim() === '2'); const r = bt.getBoundingClientRect();
      return { x: r.left + r.width / 2 - v.offsetLeft, y: r.top + r.height / 2 - v.offsetTop }; });
    await X.pg.mouse.click(pt.x, pt.y); await X.pg.waitForTimeout(250);
    t('B-SCUI-Z4 ⭐ zoom ×' + s + ' : un VRAI toucher sur « 2 » est reçu : la série porte RIR 2', await X.pg.evaluate(() => S.wkt.exs[0].sets[1].rir === 2 && S.wkt.exs[0].sets[1].rirV === 2), _det(pt));
    await zoomer(X, 1);
    const d1 = await dock(X); const a1 = await atteignable(X);
    t('B-SCUI-Z6 ⭐ retour à ×1 : le bloc retrouve exactement sa place d\'origine (bas à 84 px du bas, 24 px de marge latérale, aucune classe ni style de zoom résiduel) et le bouton central n\'a pas bougé',
      !/vv-zoom/.test(a1.bar) && a1.tr === '' && Math.abs(d1.bar.b - (d1.vh - 84)) < 0.6 && Math.abs(d1.bar.x - 12) < 0.6 && Math.abs(d1.bar.w - (Math.min(d1.vw, 430) - 24)) < 0.6 && f0 === await fab(X), _det(d1.bar) + ' ' + f0 + ' ' + await fab(X));
    t('B-SCUI-Z7 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  {
    // pan de la fenêtre visible (molette sur la page zoomée) : si Chromium la déplace, le bloc la suit ; sinon, on le DIT (témoin non applicable)
    const X = await ouvrir({ wkt: wkt(EXS()) });
    await lancerRepos(X); await zoomer(X, 2);
    const v0 = await vv(X);
    await X.cd.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 100, y: 200, deltaX: 0, deltaY: 300 }); await X.pg.waitForTimeout(500);
    const v1 = await vv(X);
    if (Math.abs(v1.y - v0.y) > 1 || Math.abs(v1.x - v0.x) > 1) t('B-SCUI-Z8 ⭐ la fenêtre visible a bougé (pan) : le bloc la SUIT, RIR compris', toutOk(await atteignable(X)), _det([v0, v1]));
    else console.log('   (B-SCUI-Z8 sans objet : Chromium ne déplace pas la fenêtre visible par la molette — pan NON rejoué, voir l\'en-tête)');
    await X.cx.close();
  }
}

/* ── témoins de SOURCE (rapides, sans navigateur) ── */
function source(t, ROOT, fs, path) {
  const lire = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const html = lire('index.html'), css = lire('style.css'), log = lire('log.js');
  const meta = (/<meta name="viewport" content="([^"]*)"/.exec(html) || [0, ''])[1];
  t('B-SCUI-Q1 ⭐ le zoom n\'est jamais désactivé : la balise viewport garde user-scalable=yes et un maximum-scale ≥ 3 (accessibilité)', /user-scalable\s*=\s*yes/.test(meta) && !(/maximum-scale\s*=\s*([\d.]+)/.test(meta) && +/maximum-scale\s*=\s*([\d.]+)/.exec(meta)[1] < 3) && !/user-scalable\s*=\s*no/.test(meta), meta);
  t('B-SCUI-Q2 le dock suit la fenêtre visible : la classe `vv-zoom` existe côté CSS et `_dockSuivreZoom` côté code, branchée sur `visualViewport`', /#rest-bar\.vv-zoom\s*\{[^}]*transform-origin/.test(css) && /function _dockSuivreZoom\(/.test(log) && /visualViewport\.addEventListener\('resize',aller\)/.test(log), '');
  t('B-SCUI-Q3 ⭐ le correctif de zoom n\'écrit AUCUNE donnée et ne touche pas le moteur du repos (affichage seul)', (() => { const f = /function _dockSuivreZoom\(\)\{[\s\S]*?\n\}\n/.exec(log); return !!f && !/persist\(|localStorage|S\.wkt|restStartTs|restTot|startRest|updRest|_rirCible/.test(f[0]); })(), '');
}
module.exports = { ecran, source };
