/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
   💬 D-087 — LA NOTE GÉNÉRALE DE L'EXERCICE LA DERNIÈRE FOIS (18/10/2026, blocs B-NOTE-*), branche locale claude/ux-d086.
   Décision de Michel : un petit indicateur bleu près de « Note perso » quand la dernière séance de l'exercice porte une note ;
   un appui l'ouvre en lecture seule, avec sa date ; jamais recopiée dans la note du jour ; aucun indicateur sans note.
   Les points du brief : ① note écrite puis retrouvée à la séance suivante · ② ancienne note et nouvelle note, sans
   écrasement · ③ pas de note précédente → pas d'indicateur · ④ commentaires de séries sans contamination · ⑤ types
   N / É / X indépendants des commentaires · ⑥ fermeture et réouverture · ⑦ la note dans le contexte de Milo SIMULÉ ·
   ⑧ affichage à 360 / 375 / 390 / 430 px · ⑨ aucune écriture, aucun réseau en lisant.
   Ce que les témoins CONDUISENT : la vraie app servie en local, les vrais gestes (taper dans « Note perso », le ✓, le
   point bleu, « Fermer », la pastille de type, la fenêtre de note de série), un vrai rechargement de page, la vraie fin
   de séance (`finishWorkout`) et le vrai ajout d'exercice (`addExercise`).
   Ce qu'ils OBSERVENT : rectangles CALCULÉS, `S.wkt` / `S.sessions` avant-après, le stockage local relu, le texte que
   `buildCoachContext` fabrique pour Milo (fonction locale, AUCUN appel), toutes les requêtes du navigateur.
   Ce qu'ils NE COUVRENT PAS : la réponse de Milo (⛔ aucun appel réel, aucune clé), Safari / le vrai iPhone, la
   synchronisation cloud (bloquée exprès : toute requête hors du serveur local est coupée et notée).
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_lms: '2026-10' };
const _det = o => JSON.stringify(o);
const DC = 'Développé Couché', DM = 'Développé Militaire', SQ = 'Squat à la Barre', RB = 'Rowing Barre (Tirage Horizontal)';   // noms du catalogue
const NOTE_DC = 'Matériel Fitness Park — pivot différent, charges non comparables';
const S_ = (kg, reps, done, type, extra) => Object.assign({ kg, reps, done: !!done, type: type || 'N' }, extra || {});
/* L'histoire : le 16/10, le Développé Couché porte une note d'EXERCICE et deux commentaires de SÉRIE (la 2ᵉ et l'échec) ;
   le Militaire n'a pas de note ; le Squat n'en a pas non plus le 16/10, mais en avait une le 09/10 (elle ne doit pas
   remonter : c'est la DERNIÈRE séance qui compte, la même que « Précédent »). Le 09/10, le Couché avait une autre note. */
const HISTO = () => {
  const s = (date, exs) => { const ts = Date.parse(date + 'T18:00:00'); return { id: ts, ts, date, synced: true, volume: 3000, exs }; };
  return [
    s('2026-10-16', [
      { name: DC, note: NOTE_DC, sets: [S_(60, 10, 1, 'É'), S_(92.5, 8, 1, 'N', { note: 'Coudes serrés, bonne trajectoire' }), S_(92.5, 8, 1),
        S_(90, 6, 1, 'X', { note: 'Échec à la 7e' })] },
      { name: DM, sets: [S_(55, 8, 1), S_(55, 7, 1)] },
      { name: SQ, sets: [S_(120, 5, 1), S_(120, 5, 1)] }]),
    s('2026-10-09', [
      { name: DC, note: 'NOTE ANCIENNE DC', sets: [S_(90, 8, 1), S_(90, 8, 1)] },
      { name: SQ, note: 'NOTE ANCIENNE SQUAT', sets: [S_(115, 5, 1)] }]),
  ];
};
const WKT = () => ({ date: '__TODAY__', startHour: 10, startTs: Date.now() - 600000, exs: [
  { name: DC, sets: [S_(60, 10, 1, 'É', { rm1: 80, at: 60 }), S_(92.5, 8, 1, 'N', { rm1: 114.8, at: 300 }), S_(92.5, 8), S_(90, 6, 0, 'X'), S_(87.5, 8)] },
  { name: DM, sets: [S_(55, 8), S_(55, 8)] },
  { name: SQ, sets: [S_(120, 5), S_(120, 5)] },
  { name: 'Tirage Vertical', sets: [S_(60, 10), S_(60, 10)] } ] });
const COBALT_TXT = 'rgb(124, 149, 255)';
const PLUS_D085 = { 360: 154, 375: 161, 390: 167, 430: 184 };   // le « + » validé sur iPhone (règle d'or #9) : il ne bouge pas
const TAILLES = [[360, 740], [375, 667], [390, 844], [430, 932]];

async function ecran(t, b, PORT) {
  const ouvrir = async (opts) => {
    opts = opts || {};
    const W = opts.w || 390, H = opts.h || 844;
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: W, height: H }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
    const dehors = [];   // ⛔ toute requête qui sortirait du serveur local : notée, puis coupée (aucune ne part)
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => { const rq = rt.request();
      dehors.push(rq.method() + ' ' + rq.url() + ' ' + String(rq.postData() || '').slice(0, 300)); return rt.abort(); });
    const init = Object.assign({}, BASE, { ft4_sessions: JSON.stringify(opts.sessions || HISTO()) });
    if (opts.wkt !== undefined && opts.wkt !== null) { init.ft4_wkt = JSON.stringify(opts.wkt); init.ft4_wkt_draft = JSON.stringify(opts.wkt); }
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_d087'))return; sessionStorage.setItem('_d087','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}
      window.__ecrits=[]; const si=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ try{ if(this===window.localStorage) window.__ecrits.push(String(k)); }catch(e){} return si.apply(this,arguments); };})();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(opts.attente || 1500);
    await nettoyer({ pg });
    return { cx, pg, errs, W, H, dehors };
  };
  const nettoyer = async X => X.pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; });
  const fixDate = async X => X.pg.evaluate(() => { if (S.wkt && S.wkt.date === '__TODAY__') { S.wkt.date = today(); persist(); } });
  const seance = async (X, ei) => { await fixDate(X); await X.pg.evaluate(ei => { _expandedEx = ei; document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    goScreen('log', document.getElementById('nb-log')); renderLog(); }, ei || 0); await X.pg.waitForTimeout(250); };
  const clic = async (X, sel) => { if (!(await X.pg.$(sel))) return false; await X.pg.click(sel, { timeout: 3000 }).catch(() => {}); await X.pg.waitForTimeout(200); return true; };
  const milo = X => X.pg.evaluate(() => { try { return buildCoachContext('test'); } catch (e) { return 'ERREUR ' + e.message; } });
  /* Milo = toute requête qui porte une action d'IA (la liste est FIGÉE ici, recopiée de worker.js `_ACTIONS_IA` : relue dans l'app,
     une mutation qui retirerait « coach » de la liste de l'app passerait inaperçue) ou qui viserait Anthropic. Le Worker sert aussi
     la synchronisation (`cloudSave`) : son adresse seule ne dit pas « Milo ». */
  const IA = ['importBodyScan', 'foodLabel', 'readBarcode', 'coach', 'importProgram', 'importHistory', 'morphoAnalysis', 'bodyStudy',
    'importBloodTest', 'summarizeCoach', 'estimateFood', 'importMealPlan', 'generateMealPlan', 'seanceJson'];
  const versMilo = l => l.filter(u => /anthropic/i.test(u) || IA.some(a => u.indexOf('"action":"' + a + '"') >= 0));

  /* ══ ③⑧ · LE POINT BLEU, AUX QUATRE LARGEURS : là où il doit être, et seulement là ═════════════════════════════════════ */
  for (const [W, H] of TAILLES) {
    const X = await ouvrir({ w: W, h: H, wkt: WKT() });
    await seance(X, 0);
    const G = await X.pg.evaluate(() => {
      const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height }; };
      const verre = el => { const n = [...el.childNodes].find(c => c.nodeType === 3 && c.textContent.includes('💬')); if (!n) return null;
        const rg = document.createRange(); rg.selectNodeContents(n); return R(rg); };
      const bloc = document.getElementById('ex-block-0'), ta = document.getElementById('ex-note-0'), ligne = ta && ta.parentElement;
      const bt = document.getElementById('exn-prev-0'), pt = bt && bt.querySelector('.exn-pt');
      const pied = bloc && bloc.querySelector('.ex-foot'), apres = ligne && ligne.nextElementSibling;
      return { bt: R(bt), pt: R(pt), ptBg: pt ? getComputedStyle(pt).backgroundColor : null, aria: bt ? bt.getAttribute('aria-label') : null,
        ta: R(ta), ligne: R(ligne), pied: R(pied), apres: R(apres), verre: bt ? verre(bt) : null,
        dansSerie: !!(bt && bt.closest('.set-row')), txtBloc: bloc ? bloc.innerText : '', taVal: ta ? ta.value : null,
        lignesSerie: [...bloc.querySelectorAll('.set-row')].map(r => Math.round(r.getBoundingClientRect().height)),
        deborde: ligne ? ligne.scrollWidth - ligne.clientWidth : -1, docW: document.documentElement.scrollWidth, vw: innerWidth,
        plus: (() => { const p = document.querySelector('#nb-log .nb-plus').getBoundingClientRect(); return Math.round(p.left + p.width / 2); })() };
    });
    t('B-NOTE-⑧a ⭐ ' + W + ' px : le point bleu est sur le 💬 de « Note perso » quand la dernière séance a une note (Développé Couché)',
      !!G.bt && !!G.pt && G.ptBg === COBALT_TXT && G.pt.w >= 6 && G.pt.w <= 10 && G.pt.h >= 6, _det({ bt: G.bt, pt: G.pt, bg: G.ptBg }));
    t('B-NOTE-⑧b ⭐ ' + W + ' px : zone d\'appui ≥ 44 × 44, qui ne recouvre ni le champ, ni « + Série », ni les boutons du dessous',
      !!G.bt && G.bt.w >= 44 && G.bt.h >= 44 && G.bt.r <= G.ta.x + 0.5 && G.bt.t >= G.pied.b - 0.5 && (!G.apres || G.bt.b <= G.apres.t + 0.5),
      _det({ bt: G.bt, ta: G.ta && G.ta.x, pied: G.pied && G.pied.b, apres: G.apres && G.apres.t }));
    t('B-NOTE-⑧c ' + W + ' px : le 💬 reste dans la ligne de note, le point le touche (en haut à droite), le champ garde de la place',
      !!G.verre && G.verre.x >= G.ligne.x + 7 && G.verre.x <= G.ligne.x + 10 && G.pt.x >= G.verre.x + G.verre.w * 0.5 && G.pt.t <= G.verre.t + 4
        && G.ta.w >= G.ligne.w * 0.7, _det({ verre: G.verre, ligne: G.ligne && [G.ligne.x, G.ligne.w], pt: G.pt && [G.pt.x, G.pt.t], ta: G.ta && G.ta.w }));
    t('B-NOTE-⑧d ' + W + ' px : rien n\'encombre les séries (aucun indicateur dans une ligne de série, lignes à leur hauteur), aucun débordement',
      !G.dansSerie && G.lignesSerie.every(h => h >= 40 && h <= 64) && G.deborde <= 0 && G.docW <= G.vw, _det({ s: G.lignesSerie, d: G.deborde, docW: G.docW }));
    t('B-NOTE-⑧e ' + W + ' px : le « + » central ne bouge pas (règle d\'or #9)', Math.abs(G.plus - PLUS_D085[W]) <= 1, G.plus + ' vs ' + PLUS_D085[W]);
    t('B-NOTE-⑧f ' + W + ' px : l\'indicateur dit ce qu\'il ouvre (date réelle de la séance)', /16\/10\/2026/.test(G.aria || ''), G.aria);
    t('B-NOTE-②a ⭐ ' + W + ' px : l\'ancienne note n\'est NI recopiée dans la carte NI préremplie dans « Note perso »',
      G.taVal === '' && G.txtBloc.indexOf('Fitness Park') < 0 && G.txtBloc.indexOf('NOTE ANCIENNE') < 0, _det({ ta: G.taVal }));
    // ③ Pas de note la dernière fois → pas d'indicateur : le Militaire (aucune note), le Squat (note seulement à l'avant-dernière
    //    séance — la même séance que « Précédent » décide), un exercice jamais fait.
    const sans = [];
    for (const ei of [1, 2, 3]) {
      await seance(X, ei);
      sans.push(await X.pg.evaluate(ei => ({ bt: !!document.getElementById('exn-prev-' + ei), plain: !!document.querySelector('#ex-note-' + ei),
        prec: ((document.querySelector('#sr-' + ei + '-0 .sprev-n') || {}).textContent || ''),
        txt: (document.getElementById('ex-block-' + ei) || {}).innerText || '' }), ei));
    }
    t('B-NOTE-③a ⭐ ' + W + ' px : sans note la dernière fois (Militaire, dont « Précédent » est bien retrouvé), pas d\'indicateur trompeur',
      !sans[0].bt && sans[0].plain && sans[0].prec === '8×55', _det({ bt: sans[0].bt, prec: sans[0].prec }));
    t('B-NOTE-③b ⭐ ' + W + ' px : une note plus ANCIENNE ne remonte pas (Squat : la dernière séance n\'en avait pas ; « Précédent » la retrouve)',
      !sans[1].bt && sans[1].plain && sans[1].prec === '5×120' && sans[1].txt.indexOf('NOTE ANCIENNE') < 0, _det({ bt: sans[1].bt, prec: sans[1].prec }));
    t('B-NOTE-③c ' + W + ' px : exercice jamais fait (pas de « Précédent ») → pas d\'indicateur', !sans[2].bt && sans[2].plain && sans[2].prec === '', _det({ bt: sans[2].bt, prec: sans[2].prec }));
    // Une carte REPLIÉE ne porte pas l'indicateur (il vit près de « Note perso », dans la carte ouverte).
    const replie = await X.pg.evaluate(() => !!document.querySelector('#ex-block-0 .exn-prev'));
    t('B-NOTE-⑧g ' + W + ' px : carte repliée → pas d\'indicateur (il vit près de « Note perso »)', replie === false, String(replie));
    t('B-NOTE-⑧h ' + W + ' px : aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ══ ② · LA LECTURE SEULE : l'ancienne note s'ouvre, la note du jour ne bouge pas ════════════════════════════════════════ */
  {
    const X = await ouvrir({ w: 390, h: 844, wkt: WKT() });
    await seance(X, 0);
    await X.pg.fill('#ex-note-0', 'Machine Basic-Fit, réglage 4');    // la vraie saisie (événements input → saveExNote)
    await X.pg.waitForTimeout(150);
    const av = await X.pg.evaluate(() => ({ ecrits: window.__ecrits.length, cur: S.wkt.exs[0].note, hist: S.sessions[0].exs[0].note }));
    const dehors0 = X.dehors.length;   // le démarrage tente déjà sa vérification serveur et une image QR (coupées) : on mesure la LECTURE
    await clic(X, '#exn-prev-0');
    const F = await X.pg.evaluate(() => {
      const ov = document.getElementById('ov-ex-note-prev'), fi = document.getElementById('exn-prev-fiche');
      const r = ov && ov.querySelector('.modal') && ov.querySelector('.modal').getBoundingClientRect();
      return { open: !!(ov && ov.classList.contains('open')), txt: fi ? fi.innerText.replace(/\s+/g, ' ').trim() : '',
        champs: ov ? ov.querySelectorAll('textarea,input,[contenteditable="true"]').length : -1,
        dansEcran: !!r && r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1,
        ta: document.getElementById('ex-note-0').value, cur: S.wkt.exs[0].note, hist: S.sessions[0].exs[0].note, ecrits: window.__ecrits.length };
    });
    t('B-NOTE-②b ⭐ toucher le point bleu ouvre la note de la dernière fois, avec la date réelle et l\'exercice',
      F.open && F.txt.indexOf('« ' + 'Matériel Fitness Park — pivot différent, charges non comparables' + ' »') >= 0 && /Séance du 16\/10\/2026/.test(F.txt) && F.txt.indexOf('Développé Couché') >= 0,
      F.txt.slice(0, 160));
    t('B-NOTE-②c ⭐ la fenêtre est en LECTURE SEULE (aucun champ) et tient dans l\'écran', F.champs === 0 && F.dansEcran, _det({ c: F.champs, e: F.dansEcran }));
    t('B-NOTE-②d ⭐⭐ ouvrir l\'ancienne note ne remplace, ne préremplit et ne modifie PAS la note du jour (ni l\'historique)',
      F.ta === 'Machine Basic-Fit, réglage 4' && F.cur === 'Machine Basic-Fit, réglage 4' && av.cur === F.cur && F.hist === NOTE_DC && av.hist === NOTE_DC,
      _det({ ta: F.ta, cur: F.cur, hist: F.hist }));
    t('B-NOTE-⑨a lire l\'ancienne note n\'écrit RIEN dans le stockage', F.ecrits === av.ecrits, (F.ecrits - av.ecrits) + ' écriture(s)');
    t('B-NOTE-②e la note de l\'avant-dernière séance n\'apparaît jamais (c\'est la dernière qui compte)', F.txt.indexOf('NOTE ANCIENNE') < 0, F.txt.slice(0, 80));
    const ouverte = () => X.pg.evaluate(() => { const o = document.getElementById('ov-ex-note-prev'); return !!(o && o.classList.contains('open')); });
    await clic(X, '#ov-ex-note-prev .btn');
    const ferme1 = !(await ouverte());
    await clic(X, '#exn-prev-0');
    const rouverte = await ouverte();
    await X.pg.mouse.click(8, 8); await X.pg.waitForTimeout(200);   // taper à côté
    const ferme2 = !(await ouverte());
    t('B-NOTE-②f « Fermer » et un appui à côté referment la fenêtre (et elle se rouvre)', F.open && ferme1 && rouverte && ferme2, _det({ ouverte: F.open, ferme1, rouverte, ferme2 }));
    t('B-NOTE-⑨b aucune requête (ni Milo, ni ailleurs) pendant la lecture ; aucune requête vers Milo depuis l\'ouverture',
      X.dehors.length === dehors0 && versMilo(X.dehors).length === 0, X.dehors.slice(dehors0).concat(versMilo(X.dehors)).slice(0, 2).join(' | ').slice(0, 200));
    t('B-NOTE-②g aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ══ ①②⑥⑦ · LE VRAI CYCLE : écrire, recharger, terminer, recommencer, écrire une autre note — Milo simulé ═══════════════ */
  {
    const X = await ouvrir({ w: 390, h: 844, wkt: { date: '__TODAY__', startHour: 10, startTs: Date.now() - 600000, exs: [{ name: RB, sets: [S_(70, 10), S_(70, 10)] }] } });
    await seance(X, 0);
    const j0 = await X.pg.evaluate(() => ({ bt: !!document.getElementById('exn-prev-0'), auj: today() }));
    await X.pg.fill('#ex-note-0', 'Matériel Fitness Park');
    await X.pg.click('#sr-0-0 .chk'); await X.pg.waitForTimeout(300);
    await X.pg.evaluate(() => { try { skipRest(); } catch (e) {} });
    await X.pg.click('#sr-0-1 .chk'); await X.pg.waitForTimeout(300);
    await X.pg.evaluate(() => { try { skipRest(); } catch (e) {} });
    // ⑥ fermeture / réouverture PENDANT la séance : la note tapée est toujours là
    await X.pg.reload(); await X.pg.waitForTimeout(1500); await nettoyer(X); await seance(X, 0);
    const j1 = await X.pg.evaluate(() => ({ ta: (document.getElementById('ex-note-0') || {}).value, cur: S.wkt && S.wkt.exs[0].note,
      faites: S.wkt ? S.wkt.exs[0].sets.filter(s => s.done).length : -1 }));
    t('B-NOTE-⑥a ⭐ fermeture puis réouverture en pleine séance : la note tapée est toujours dans « Note perso »',
      j1.ta === 'Matériel Fitness Park' && j1.cur === 'Matériel Fitness Park' && j1.faites === 2, _det(j1));
    // ① la vraie fin de séance range la note avec l'exercice
    await X.pg.evaluate(async () => { await finishWorkout(); });
    await X.pg.waitForTimeout(600); await nettoyer(X);
    await X.pg.reload(); await X.pg.waitForTimeout(1500); await nettoyer(X);
    const j2 = await X.pg.evaluate(() => { const s = S.sessions[0]; const e = s && (s.exs || []).find(x => x.name === 'Rowing Barre (Tirage Horizontal)');
      return { wkt: S.wkt ? (S.wkt.exs || []).length : 0, date: s && s.date, note: e && e.note, nb: S.sessions.length }; });
    t('B-NOTE-①a ⭐ la séance terminée garde la note de l\'exercice (relue après réouverture de l\'app)',
      j2.wkt === 0 && j2.note === 'Matériel Fitness Park' && j2.date === j0.auj && j2.nb === 3, _det(j2));
    // ① la séance SUIVANTE : le vrai ajout d'exercice → l'indicateur, la note d'avant, et un champ du jour VIDE
    await X.pg.evaluate(() => { _exPickerMode = 'workout'; addExercise('Rowing Barre (Tirage Horizontal)'); });
    await seance(X, 0);
    const j3 = await X.pg.evaluate(() => ({ bt: !!document.getElementById('exn-prev-0'), ta: document.getElementById('ex-note-0').value, cur: S.wkt.exs[0].note }));
    await clic(X, '#exn-prev-0');
    const j3f = await X.pg.evaluate(() => (document.getElementById('exn-prev-fiche') || {}).innerText || '');
    await clic(X, '#ov-ex-note-prev .btn');
    await nettoyer(X);   // filet : « Fermer » a son propre témoin (②f) ; ici, une fiche restée ouverte ne doit pas faire planter la suite
    // ⭐ la décision : consulter ne PRÉREMPLIT pas la note du jour, même quand elle est vide — relu APRÈS la lecture
    const j3b = await X.pg.evaluate(() => ({ ta: document.getElementById('ex-note-0').value, cur: S.wkt.exs[0].note || '',
      ls: ((JSON.parse(localStorage.getItem('ft4_wkt') || 'null') || { exs: [{}] }).exs[0] || {}).note || '' }));
    const dAuj = j0.auj.split('-').reverse().join('/');
    t('B-NOTE-①b ⭐⭐ la séance suivante montre le point bleu ; la note d\'avant s\'ouvre avec SA date ; « Note perso » du jour reste VIDE',
      !j0.bt && j3.bt && j3.ta === '' && !j3.cur && j3f.indexOf('« Matériel Fitness Park »') >= 0 && j3f.indexOf('Séance du ' + dAuj) >= 0
        && j3b.ta === '' && j3b.cur === '' && j3b.ls === '',
      _det({ avant: j0.bt, apres: j3.bt, ta: j3.ta, apresLecture: j3b, fiche: j3f.replace(/\s+/g, ' ').slice(0, 90) }));
    // ② une NOUVELLE note : aucun écrasement, ni dans un sens ni dans l'autre
    await X.pg.fill('#ex-note-0', 'Machine différente de ma salle habituelle');
    await X.pg.click('#sr-0-0 .chk'); await X.pg.waitForTimeout(300);
    await X.pg.evaluate(() => { try { skipRest(); } catch (e) {} });
    await X.pg.evaluate(async () => { await finishWorkout(); });
    await X.pg.waitForTimeout(600); await nettoyer(X);
    await X.pg.reload(); await X.pg.waitForTimeout(1500); await nettoyer(X);
    const j4 = await X.pg.evaluate(() => S.sessions.slice(0, 2).map(s => ((s.exs || []).find(x => x.name === 'Rowing Barre (Tirage Horizontal)') || {}).note));
    t('B-NOTE-②h ⭐⭐ deux séances, deux notes : la nouvelle n\'a pas écrasé l\'ancienne (et inversement)',
      _det(j4) === _det(['Machine différente de ma salle habituelle', 'Matériel Fitness Park']), _det(j4));
    // ⑦ Milo SIMULÉ : le texte que l'app lui enverrait, fabriqué en local (aucun appel)
    const ctx = await milo(X);
    const lignes = ctx.split('\n');
    const lNew = lignes.filter(l => l.indexOf('[note: Machine différente de ma salle habituelle]') >= 0);
    const lOld = lignes.filter(l => l.indexOf('[note: Matériel Fitness Park]') >= 0);
    t('B-NOTE-⑦a ⭐⭐ Milo (simulé) reçoit les DEUX notes, chacune avec SA séance de Rowing Barre',
      lNew.length >= 1 && lOld.length >= 1 && lNew.every(l => l.indexOf(RB) >= 0) && lOld.every(l => l.indexOf(RB) >= 0) && lNew[0] !== lOld[0],
      _det({ n: lNew.length, o: lOld.length }));
    t('B-NOTE-⑨c ⭐ aucune requête vers Milo pendant tout le cycle (les synchronisations de fin de séance, elles, sont coupées et notées)',
      versMilo(X.dehors).length === 0, versMilo(X.dehors).slice(0, 2).join(' | ').slice(0, 200));
    t('B-NOTE-①c aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ══ ④⑤⑦ · COMMENTAIRES DE SÉRIE, TYPES ET NOTE D'EXERCICE : trois choses qui ne se mélangent pas ═══════════════════════ */
  {
    const X = await ouvrir({ w: 390, h: 844, wkt: WKT() });
    await seance(X, 0);
    const dehors0 = X.dehors.length;
    const P = await X.pg.evaluate(() => [...document.querySelectorAll('#ex-block-0 .set-row')].map(r => !!r.querySelector('.sprev-pt')));
    t('B-NOTE-④a ⭐ les commentaires de la dernière fois restent sur LEURS séries (2ᵉ et 4ᵉ), jamais ailleurs',
      _det(P) === _det([false, true, false, true, false]), _det(P));
    await clic(X, '#sr-0-1 .sprev');
    const n1 = await X.pg.evaluate(() => (document.getElementById('sn-prev') || {}).innerText || '');
    await X.pg.evaluate(() => closeSetNote());
    await clic(X, '#sr-0-2 .sprev');
    const n2 = await X.pg.evaluate(() => !!document.getElementById('sn-prev'));
    await X.pg.evaluate(() => closeSetNote());
    t('B-NOTE-④b ⭐ le commentaire de la série 2 s\'ouvre sur la série 2 ; la série 3 n\'en hérite pas ; la note d\'EXERCICE n\'est jamais un commentaire de série',
      n1.indexOf('Coudes serrés') >= 0 && n1.indexOf('Fitness Park') < 0 && n2 === false, _det({ n1: n1.replace(/\s+/g, ' ').slice(0, 70), n2 }));
    // ⑤ un commentaire du jour sur la série 2, puis on change son type : le commentaire reste, le type change, la note d'exercice ne bouge pas
    await X.pg.fill('#ex-note-0', 'Note du jour');
    await X.pg.evaluate(() => openSetNote(0, 2));
    await X.pg.fill('#set-note-ta', 'Plus lent à la descente');
    await clic(X, '#ov-set-note .btn-red');
    const avT = await X.pg.evaluate(() => S.wkt.exs[0].sets[2].type);
    await clic(X, '#tbtn-0-2');
    const T5 = await X.pg.evaluate(() => { const s = S.wkt.exs[0].sets[2]; return { type: s.type, note: s.note, exn: S.wkt.exs[0].note,
      pill: (document.querySelector('#tbtn-0-2 .tbtn') || {}).textContent, autres: S.wkt.exs[0].sets.map(x => x.note || '') }; });
    t('B-NOTE-⑤a ⭐ changer le TYPE d\'une série garde son commentaire, et inversement ; la note d\'exercice ne bouge pas',
      avT === 'N' && T5.type === 'É' && T5.pill === 'É' && T5.note === 'Plus lent à la descente' && T5.exn === 'Note du jour'
        && _det(T5.autres) === _det(['', '', 'Plus lent à la descente', '', '']), _det(T5));
    // ⑦ Milo simulé : la ligne d'historique porte la note d'exercice ET les commentaires sur les bonnes séries ; la séance en
    //    cours porte la note du jour ; l'ancienne note du 09/10 n'est pas collée au 16/10.
    const ctx = await milo(X);
    const l16 = ctx.split('\n').filter(l => l.indexOf('[note: ' + NOTE_DC + ']') >= 0);
    const enCours = (ctx.split('SÉANCE EN COURS — l\'athlète')[1] || '').split('\n').filter(l => /^- Développé Couché/.test(l));
    t('B-NOTE-⑦b ⭐⭐ Milo (simulé) : la séance du 16/10 porte la note d\'exercice ET les commentaires sur la bonne série (S1, et l\'échec)',
      l16.length === 1 && /S1 92\.5×8\[💬 Coudes serrés, bonne trajectoire\]/.test(l16[0]) && /90×6\(X\)\[💬 Échec à la 7e\]/.test(l16[0])
        && l16[0].indexOf('NOTE ANCIENNE') < 0, (l16[0] || 'ABSENT').slice(0, 220));
    t('B-NOTE-⑦c ⭐ Milo (simulé) : la séance EN COURS porte la note du jour, et le type changé (É)',
      enCours.length === 1 && enCours[0].indexOf('[note: Note du jour]') >= 0 && /92\.5×8\(É\)/.test(enCours[0]), (enCours[0] || 'ABSENT').slice(0, 200));
    t('B-NOTE-⑨d aucune requête pendant ces gestes ; aucune vers Milo', X.dehors.length === dehors0 && versMilo(X.dehors).length === 0,
      X.dehors.slice(dehors0).slice(0, 2).join(' | ').slice(0, 200));
    t('B-NOTE-④c aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
}
module.exports = { ecran };
