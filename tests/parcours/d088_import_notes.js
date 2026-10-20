/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
   📥 BRIEF « D-088 » (18/10/2026, blocs B-D088-*) — branche locale claude/ux-d086. Décisions de Michel (registre : D-089) :
   ① « Importer un historique » revient dans le menu « … » de la séance en cours, par le MÊME moteur que l'ancien écran
   (`openImportHist`), sans jamais effacer ni remplacer en silence ce qui est saisi ; l'import de programme reste possible ;
   ② la fenêtre de la note dit « Note de la dernière séance », le point reste même si le texte est identique au champ du jour ;
   ③ l'outil du prompt de Milo (`tools/dump_prompt.js`) n'écrit plus jamais dans le dépôt principal depuis une copie.
   Ce que les témoins CONDUISENT : la vraie app servie en local, les vrais gestes (menu « … », « Importer un historique »,
   une vraie photo donnée au champ de fichier, « Analyser », « Importer dans l'historique », « Annuler », un appui à côté,
   « Programmes » → « Importer un programme »), un vrai rechargement de page, et l'outil réel lancé depuis un dossier temporaire.
   Ce qu'ils OBSERVENT : `S.wkt` et son stockage relus avant / après (octet pour octet), l'historique, les records, l'écran,
   toutes les requêtes du navigateur, les fichiers du dépôt principal.
   ⛔ L'IA d'import n'est JAMAIS appelée : la réponse est FABRIQUÉE ici (route locale) ; toute autre requête est coupée et notée.
   Ce qu'ils NE COUVRENT PAS : la vraie lecture d'une page par l'IA, Safari / l'iPhone réel, la synchronisation cloud.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process'), crypto = require('crypto');

const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_lms: '2026-10' };
const _det = o => JSON.stringify(o);
const DC = 'Développé Couché', DM = 'Développé Militaire', SQ = 'Squat à la Barre';
const NOTE_DC = 'Matériel Fitness Park — pivot différent';
const S_ = (kg, reps, done, type, extra) => Object.assign({ kg, reps, done: !!done, type: type || 'N' }, extra || {});
const HISTO = () => {
  const s = (date, exs) => { const ts = Date.parse(date + 'T18:00:00'); return { id: ts, ts, date, synced: true, volume: 3000, exs }; };
  return [
    s('2026-10-16', [{ name: DC, note: NOTE_DC, sets: [S_(60, 10, 1, 'É'), S_(92.5, 8, 1, 'N', { note: 'Coudes serrés' }), S_(90, 6, 1, 'X', { note: 'Échec à la 7e' })] },
      { name: DM, sets: [S_(55, 8, 1), S_(55, 7, 1)] }]),
    s('2026-10-09', [{ name: SQ, note: 'Ancienne note squat', sets: [S_(115, 5, 1)] }]),
  ];
};
// La séance EN COURS : séries faites et à faire, types É / N / X, un commentaire de série, un RIR, une note d'exercice.
const WKT = (noteDuJour) => ({ date: '__TODAY__', startHour: 10, startTs: Date.now() - 900000, exs: [
  { name: DC, note: noteDuJour === undefined ? 'Note du jour en cours' : noteDuJour,
    sets: [S_(60, 10, 1, 'É', { rm1: 80, at: 60 }), S_(92.5, 8, 1, 'N', { note: 'Plus lent à la descente', rir: 2, rm1: 114.8, at: 300 }), S_(92.5, 8), S_(90, 6, 0, 'X')] },
  { name: DM, sets: [S_(55, 8, 1, 'N', { rm1: 67.7, at: 600 }), S_(55, 8)] } ] });
// Réponses FABRIQUÉES de l'IA d'import (aucun appel réel). Le 16/10 existe déjà dans l'historique → conflit (« Les 2 » par défaut).
const HIST_OK = { status: 'ok', data: { typesNormalises: 0, sessions: [
  { date: '2026-10-05', label: 'Carnet A', exercises: [{ name: DC, note: 'Carnet papier', sets: [{ kg: 80, reps: 8, type: '' }, { kg: 80, reps: 8, type: '' }] }] },
  { date: '2026-10-16', label: 'Carnet B', exercises: [{ name: SQ, sets: [{ kg: 110, reps: 5, type: '' }] }] } ] } };
const HIST_VIDE = { status: 'ok', data: { typesNormalises: 0, sessions: [] } };
const PROG_OK = { status: 'ok', data: { name: 'Programme importé D088', weeks: 4, startDate: '2026-10-18',
  days: [{ label: 'Jour A', exercises: [{ name: DC, sets: 3, reps: 8, kg: 80, rest: 120, note: 'Consigne du programme' }] }] } };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
const IA = ['importBodyScan', 'foodLabel', 'readBarcode', 'coach', 'importProgram', 'importHistory', 'morphoAnalysis', 'bodyStudy',
  'importBloodTest', 'summarizeCoach', 'estimateFood', 'importMealPlan', 'generateMealPlan', 'seanceJson'];
const TAILLES = [[360, 740], [375, 667], [390, 844], [430, 932]];

async function ecran(t, b, PORT) {
  const ROOT = path.resolve(__dirname, '..', '..');
  const ouvrir = async (opts) => {
    opts = opts || {};
    const W = opts.w || 390, H = opts.h || 844;
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: W, height: H }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
    const req = [];   // toutes les requêtes hors du serveur local : { action, url, servie }
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => {
      const pd = String(rt.request().postData() || ''); const m = /"action":"([A-Za-z]+)"/.exec(pd); const action = m ? m[1] : '';
      const rep = (opts.mock || {})[action];
      req.push({ action, url: rt.request().url().slice(0, 60), servie: !!rep });
      if (rep) return rt.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' }, body: JSON.stringify(rep) });
      return rt.abort();
    });
    const init = Object.assign({}, BASE, { ft4_sessions: JSON.stringify(opts.sessions || HISTO()) });
    const w = opts.wkt === undefined ? WKT() : opts.wkt;
    if (w) { init.ft4_wkt = JSON.stringify(w); init.ft4_wkt_draft = JSON.stringify(w); }
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_d088'))return; sessionStorage.setItem('_d088','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){} })();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    const toasts = []; await pg.exposeFunction('__toastVu', m => toasts.push(String(m).slice(0, 140)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    /* Le message affiché passe par la vraie `toast` (tracking.js), enveloppée APRÈS le chargement : une déclaration
       `function toast(){}` remplace toute propriété posée avant elle sur `window` (1ʳᵉ version du banc, muette). */
    await pg.evaluate(() => { const o = window.toast; window.toast = function (m) { try { window.__toastVu(m); } catch (e) {} return o.apply(this, arguments); }; });
    await nettoyer(pg); await fixDate(pg);
    await pg.evaluate(() => { _expandedEx = 0; goScreen('log', document.getElementById('nb-log')); renderLog(); });
    await pg.waitForTimeout(250);
    return { cx, pg, errs, req, toasts, W, H };
  };
  const nettoyer = pg => pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; });
  const fixDate = pg => pg.evaluate(() => { if (S.wkt && S.wkt.date === '__TODAY__') { S.wkt.date = today(); persist(); } });
  const visible = (pg, sel) => pg.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => { const r = x.getBoundingClientRect();
      const cs = getComputedStyle(x); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; }); if (!e) return false;
    e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!top && (top === e || e.contains(top)); }, sel);
  const clic = async (pg, sel) => { if (!(await visible(pg, sel))) return false; try { await pg.locator(sel).filter({ visible: true }).first().click({ timeout: 2500 }); }
    catch (e) { return false; } await pg.waitForTimeout(250); return true; };
  const etat = pg => pg.evaluate(() => ({ wkt: JSON.stringify(S.wkt), lsWkt: localStorage.getItem('ft4_wkt'), draft: localStorage.getItem('ft4_wkt_draft'),
    nbS: (S.sessions || []).length, importees: (S.sessions || []).filter(s => s.importedHistory).map(s => s.date).sort(),
    dates: (S.sessions || []).map(s => s.date).sort(), ouverte: (typeof _seanceOuverte === 'function') ? _seanceOuverte() : null,
    ecran: (document.querySelector('.screen.active') || {}).id || '' }));
  const memeSeance = (a, b) => a.wkt === b.wkt && JSON.parse(a.lsWkt || 'null') && JSON.stringify(JSON.parse(a.lsWkt)) === JSON.stringify(JSON.parse(b.lsWkt || 'null'))
    && !!b.draft && JSON.stringify(JSON.parse(b.draft)) === b.wkt;   // et la copie de secours (règle d'or #3) est toujours CETTE séance
  const ouvert = (pg, id) => pg.evaluate(id => { const o = document.getElementById(id); return !!(o && o.classList.contains('open')); }, id);
  const etape = pg => pg.evaluate(() => [1, 2, 3, 4].find(i => { const s = document.getElementById('hist-s' + i); return s && getComputedStyle(s).display !== 'none'; }) || 0);
  const versIA = (X, a) => X.req.filter(r => r.action === a).length;
  const autresIA = (X, permis) => X.req.filter(r => IA.includes(r.action) && !permis.includes(r.action)).map(r => r.action);
  /* La porte de l'import pendant la séance : le menu « … » de la séance (branche) ou, sur l'ancien écran, la ligne
     « J'ai déjà un programme ou un historique » → « Importer un journal ». Le chemin pris est rendu, pour la comparaison. */
  const PORTES = [];   // le chemin réellement pris à chaque ouverture (comparaison ancien / nouveau écran)
  /* L'ANCIEN chemin (ft-v1256) : « 📷 J'ai déjà un programme ou un historique » déplie (ou replie !) le panneau — on ne le touche
     que si le bouton voulu n'est pas déjà à l'écran (le panneau peut être ouvert d'office, ou rester ouvert d'une ouverture à l'autre). */
  const ancienneLigne = async (pg, appel) => {
    const cible = '#log-import [onclick="' + appel + '"]';
    if (!await visible(pg, cible)) await clic(pg, '#log-import-toggle');
    return await clic(pg, cible);
  };
  const ouvrirImportHist = async X => {
    const p = await (async () => {
      if (await clic(X.pg, '[onclick*="openWktMenu("]')) {
        if (await visible(X.pg, '#ov-wkt-menu [onclick*="openImportHist("]')) { await clic(X.pg, '#ov-wkt-menu [onclick*="openImportHist("]'); return 'menu'; }
        await nettoyer(X.pg);
      }
      if (await ancienneLigne(X.pg, 'openImportHist()')) return 'ancienne ligne';
      return 'aucune';
    })();
    PORTES.push(p); return p;
  };
  const jusquApercu = async X => {   // une vraie photo dans le champ « galerie », puis « Analyser »
    await X.pg.setInputFiles('#hist-gal-inp', { name: 'carnet.png', mimeType: 'image/png', buffer: PNG }); await X.pg.waitForTimeout(500);
    await clic(X.pg, '#hist-s2 [onclick*="analyzeHistPhotos"]'); await X.pg.waitForTimeout(900);
  };

  /* ══ ① · L'ENTRÉE DANS LE MENU « … », AUX QUATRE LARGEURS ═══════════════════════════════════════════════════════════════ */
  for (const [W, H] of TAILLES) {
    const X = await ouvrir({ w: W, h: H });
    const av = await etat(X.pg);
    await clic(X.pg, '[onclick*="openWktMenu("]');
    const M = await X.pg.evaluate(() => {
      const lignes = [...document.querySelectorAll('#ov-wkt-menu .wm-row')]; const i = lignes.findIndex(l => /openImportHist\(/.test(l.getAttribute('onclick') || ''));
      const e = lignes[i]; if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { titre: (e.querySelector('b') || {}).textContent, sous: (e.querySelector('small') || {}).textContent, h: r.height, w: r.width,
        dansEcran: r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1, touchable: !!top && (top === e || e.contains(top)),
        avant: lignes[i - 1] ? (lignes[i - 1].getAttribute('onclick') || '') : '', docW: document.documentElement.scrollWidth, vw: innerWidth };
    });
    t('B-D088-IMP-①a ⭐ ' + W + ' px : le menu « … » de la séance propose « Importer un historique », juste après « Programmes »',
      !!M && M.titre === 'Importer un historique' && /historique, stats et records/.test(M.sous || '') && /openProgModal\(/.test(M.avant), _det(M).slice(0, 200));
    t('B-D088-IMP-①b ' + W + ' px : la ligne est entière dans l\'écran, au premier plan, assez haute pour le doigt (≥ 44 px), sans débordement',
      !!M && M.dansEcran && M.touchable && M.h >= 44 && M.docW <= M.vw, _det(M && { h: M.h, e: M.dansEcran, t: M.touchable }));
    /* une ligne de plus allonge la feuille : à 375 × 667 elle défile (« Abandonner » et « Fermer » sous le bord) — tout doit rester ATTEIGNABLE */
    const R = await X.pg.evaluate(() => { const sh = document.querySelector('#ov-wkt-menu .wm-sheet'); if (!sh) return null;
      const el = [...sh.querySelectorAll('.wm-row')]; const fe = [...sh.querySelectorAll('button')].find(x => /Fermer/.test(x.textContent)); if (fe) el.push(fe);
      const ko = el.filter(e => { e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return !(r.top >= 0 && r.bottom <= innerHeight + 1 && top && (top === e || e.contains(top))); }).map(e => e.textContent.trim().slice(0, 24));
      const defile = sh.scrollHeight > sh.clientHeight + 1; sh.scrollTop = 0; return { n: el.length, ko, defile }; });
    t('B-D088-IMP-①e ' + W + ' px : avec cette ligne en plus, TOUTES les lignes du menu et « Fermer » restent atteignables (la feuille défile si l\'écran est court)',
      !!R && R.n >= 10 && R.ko.length === 0, _det(R));
    await clic(X.pg, '#ov-wkt-menu [onclick*="openImportHist("]');
    const O = await X.pg.evaluate(() => { const ov = document.getElementById('ov-import-hist'); const m = ov && ov.querySelector('.modal');
      const r = m && m.getBoundingClientRect(); return { open: !!(ov && ov.classList.contains('open')), menu: !!(document.getElementById('ov-wkt-menu') || {}).classList && document.getElementById('ov-wkt-menu').classList.contains('open'),
        tient: !!r && r.left >= 0 && r.right <= innerWidth + 1 }; });
    const st = await etape(X.pg);
    t('B-D088-IMP-①c ⭐ ' + W + ' px : un appui ouvre la fenêtre d\'import de l\'ANCIEN écran, à l\'étape 1, et ferme le menu',
      O.open && !O.menu && O.tient && st === 1, _det(Object.assign({ st }, O)));
    t('B-D088-IMP-①d ' + W + ' px : ouvrir le menu puis l\'import ne touche ni la séance ni l\'historique, et n\'appelle personne',
      memeSeance(av, await etat(X.pg)) && (await etat(X.pg)).nbS === av.nbS && X.req.filter(r => IA.includes(r.action)).length === 0 && X.errs.length === 0,
      _det({ req: X.req.length, errs: X.errs.slice(0, 1) }));
    await X.cx.close();
  }

  /* ══ ② · L'IMPORT RÉUSSI PENDANT LA SÉANCE : l'historique grandit, la séance en cours ne bouge pas d'un octet ════════════ */
  {
    const X = await ouvrir({ mock: { importHistory: HIST_OK } });
    const av = await etat(X.pg);
    const porte = await ouvrirImportHist(X);
    await jusquApercu(X);
    const ap = await X.pg.evaluate(() => ({ st: [1, 2, 3, 4].find(i => getComputedStyle(document.getElementById('hist-s' + i)).display !== 'none'),
      resume: (document.getElementById('hist-summary') || {}).textContent || '', conflit: (document.getElementById('hist-conflict-status-1') || {}).textContent || '' }));
    t('B-D088-IMP-②0 ⭐ ce parcours complet passe par le menu « … » de la séance (et non par un autre chemin)', porte === 'menu', porte);
    t('B-D088-IMP-②a la photo passe par l\'analyse (IA SIMULÉE, 1 seule demande) et l\'aperçu montre les 2 séances, avec le conflit du 16/10 à « Les 2 » par défaut',
      ap.st === 4 && /2 séances trouvées/.test(ap.resume) && /Ajouter les 2/.test(ap.conflit) && versIA(X, 'importHistory') === 1, _det(Object.assign({ porte }, ap)));
    await clic(X.pg, '#hist-s4 [onclick*="finalImportHist"]'); await X.pg.waitForTimeout(500);
    const fin = await etat(X.pg);
    const P = await X.pg.evaluate(() => ({ pr: (S.prs || {})['Développé Couché'] || null, carte: (document.getElementById('ex-note-0') || {}).value,
      series: S.wkt.exs[0].sets.map(s => s.kg + 'x' + s.reps + (s.done ? '✓' : '') + s.type + (s.note ? '«' + s.note + '»' : '') + (s.rir != null ? 'R' + s.rir : '')) }));
    t('B-D088-IMP-②b ⭐⭐ la séance EN COURS est identique octet pour octet après l\'import (séries, charges, types, commentaires, RIR, notes, exercices) — en mémoire ET dans le stockage',
      memeSeance(av, fin) && fin.draft === av.draft, _det({ avant: av.wkt.length, apres: fin.wkt.length, draft: fin.draft === av.draft }));
    t('B-D088-IMP-②c ⭐ l\'historique reçoit les 2 séances importées, la séance terminée du 16/10 est GARDÉE (« Les 2 »), rien n\'est retiré',
      fin.nbS === av.nbS + 2 && _det(fin.importees) === _det(['2026-10-05', '2026-10-16']) && fin.dates.filter(d => d === '2026-10-16').length === 2 && av.dates.every(d => fin.dates.includes(d)),
      _det({ nb: [av.nbS, fin.nbS], imp: fin.importees }));
    t('B-D088-IMP-②d on reste dans la séance : écran Séance, séance ouverte, carte et note du jour à l\'écran',
      fin.ouverte === true && fin.ecran === 's-log' && P.carte === 'Note du jour en cours' && !(await ouvert(X.pg, 'ov-import-hist')), _det({ o: fin.ouverte, e: fin.ecran, n: P.carte }));
    t('B-D088-IMP-②e une seule demande d\'IA pendant tout le parcours (l\'import, simulée) — aucune vers Milo', versIA(X, 'importHistory') === 1 && autresIA(X, ['importHistory']).length === 0,
      _det(X.req.filter(r => r.action).map(r => r.action)));
    await X.pg.reload(); await X.pg.waitForTimeout(1500); await nettoyer(X.pg);
    const re = await etat(X.pg);
    t('B-D088-IMP-②f ⭐ après fermeture et réouverture de l\'app : la séance en cours est intacte et les séances importées sont toujours là',
      memeSeance(av, re) && _det(re.importees) === _det(['2026-10-05', '2026-10-16']) && re.ouverte === true, _det({ imp: re.importees, o: re.ouverte }));
    t('B-D088-IMP-②g aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ══ ③④⑤ · ANNULER, FERMER EN PLEIN IMPORT, FERMER L'APP AVANT D'IMPORTER : rien ne change ═══════════════════════════ */
  {
    const X = await ouvrir({ mock: { importHistory: HIST_OK } });
    const av = await etat(X.pg);
    await ouvrirImportHist(X);
    const o1 = await ouvert(X.pg, 'ov-import-hist'), e1 = await etape(X.pg);   // contrôle positif : la fenêtre était bien ouverte (BUGS §83 ④)
    await clic(X.pg, '#hist-s1 [onclick="closeImportHist()"]');
    const a1 = await etat(X.pg);
    t('B-D088-IMP-③a ⭐ « Annuler » à la 1re étape : fenêtre fermée, ni séance ni historique touchés, aucune demande',
      o1 && e1 === 1 && !(await ouvert(X.pg, 'ov-import-hist')) && memeSeance(av, a1) && a1.nbS === av.nbS && versIA(X, 'importHistory') === 0, _det({ o1, e1, nb: a1.nbS }));
    await ouvrirImportHist(X); await jusquApercu(X);
    const st4 = await etape(X.pg);
    await X.pg.mouse.click(5, 5); await X.pg.waitForTimeout(300);   // un appui à côté, aperçu affiché, AVANT « Importer »
    const a2 = await etat(X.pg);
    t('B-D088-IMP-④a ⭐ fermer la fenêtre à l\'aperçu (sans « Importer ») : rien n\'entre dans l\'historique, la séance ne bouge pas',
      st4 === 4 && !(await ouvert(X.pg, 'ov-import-hist')) && memeSeance(av, a2) && a2.nbS === av.nbS, _det({ st4, nb: a2.nbS }));
    await ouvrirImportHist(X);
    const rep = await X.pg.evaluate(() => ({ bande: getComputedStyle(document.getElementById('hist-reprise')).display !== 'none', st: [1, 2, 3, 4].find(i => getComputedStyle(document.getElementById('hist-s' + i)).display !== 'none') }));
    t('B-D088-IMP-④b la rouvrir propose de reprendre le scan (« Scan repris », aperçu gardé) — comportement de l\'ancien écran', rep.bande && rep.st === 4, _det(rep));
    const o4 = await ouvert(X.pg, 'ov-import-hist');   // contrôle positif : on est bien EN PLEIN import au moment de fermer l'app
    await X.pg.reload(); await X.pg.waitForTimeout(1500); await nettoyer(X.pg);   // l'app fermée en plein import
    const a3 = await etat(X.pg);
    await X.pg.evaluate(() => { _expandedEx = 0; goScreen('log', document.getElementById('nb-log')); renderLog(); }); await X.pg.waitForTimeout(250);
    await ouvrirImportHist(X); const st5 = await etape(X.pg), o5 = await ouvert(X.pg, 'ov-import-hist');
    t('B-D088-IMP-⑤a ⭐ l\'app fermée en plein import : à la réouverture, séance intacte, historique inchangé, l\'import repart de l\'étape 1',
      o4 && o5 && memeSeance(av, a3) && a3.nbS === av.nbS && a3.ouverte === true && st5 === 1, _det({ o4, o5, nb: a3.nbS, st5 }));
    t('B-D088-IMP-⑤b aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ══ ⑥⑦ · L'ANALYSE NE TROUVE RIEN ; ET L'HISTORIQUE EST VIDE AU DÉPART ══════════════════════════════════════════════════ */
  {
    const X = await ouvrir({ mock: { importHistory: HIST_VIDE } });
    const av = await etat(X.pg);
    await ouvrirImportHist(X); await jusquApercu(X);
    const st = await etape(X.pg), fin = await etat(X.pg);
    t('B-D088-IMP-⑥a ⭐ l\'analyse ne trouve aucune séance : message clair, retour à l\'étape 2, rien n\'est écrit nulle part',
      st === 2 && X.toasts.some(m => /Aucune séance lisible/.test(m)) && memeSeance(av, fin) && fin.nbS === av.nbS, _det({ st, toasts: X.toasts.slice(-1) }));
    await X.cx.close();
  }
  {
    const X = await ouvrir({ sessions: [], mock: { importHistory: HIST_OK } });
    const av = await etat(X.pg);
    await ouvrirImportHist(X); await jusquApercu(X);
    const sans = await X.pg.evaluate(() => !document.getElementById('hist-conflict-status-1'));
    await clic(X.pg, '#hist-s4 [onclick*="finalImportHist"]'); await X.pg.waitForTimeout(500);
    const fin = await etat(X.pg);
    t('B-D088-IMP-⑦a ⭐ aucun historique au départ : l\'import se fait (2 séances, aucun conflit), la séance en cours reste identique',
      av.nbS === 0 && sans && fin.nbS === 2 && memeSeance(av, fin) && fin.ouverte === true, _det({ av: av.nbS, fin: fin.nbS, sans }));
    await X.cx.close();
  }

  /* ══ ⑧ · « REMPLACER » CHOISI EXPRÈS : seule la séance TERMINÉE du même jour est remplacée, jamais celle en cours ════════ */
  {
    const X = await ouvrir({ mock: { importHistory: HIST_OK } });
    const av = await etat(X.pg);
    await ouvrirImportHist(X); await jusquApercu(X);
    await clic(X.pg, '#hist-cf-1-replace');
    await clic(X.pg, '#hist-s4 [onclick*="finalImportHist"]'); await X.pg.waitForTimeout(500);
    const fin = await etat(X.pg);
    const r16 = await X.pg.evaluate(() => (S.sessions || []).filter(s => s.date === '2026-10-16').map(s => (s.importedHistory ? 'importée:' : 'terminée:') + (s.exs || []).map(e => e.name).join('+')));
    t('B-D088-IMP-⑧a ⭐ « Remplacer » est un choix EXPLICITE sur la séance TERMINÉE du 16/10 ; la séance en cours n\'est jamais touchée',
      memeSeance(av, fin) && _det(r16) === _det(['importée:' + SQ]) && fin.nbS === av.nbS + 1, _det({ r16, nb: [av.nbS, fin.nbS] }));
    await X.cx.close();
  }

  /* ══ ⑨ · L'IMPORT DE PROGRAMME RESTE POSSIBLE PENDANT LA SÉANCE (« Programmes » → « Importer un programme ») ═══════════ */
  {
    const X = await ouvrir({ mock: { importProgram: PROG_OK } });
    const av = await etat(X.pg); const nbP0 = await X.pg.evaluate(() => (S.programmes || []).length);
    let porteProg = false;   // nouveau chemin : « … » → « Programmes » → « Importer un programme » ; sinon l'ancienne ligne
    if (await clic(X.pg, '[onclick*="openWktMenu("]') && await clic(X.pg, '#ov-wkt-menu [onclick*="openProgModal("]'))
      porteProg = await clic(X.pg, '#mod-prog [onclick*="importProgDepuisProgrammes"]') && 'menu';
    if (!porteProg) { await nettoyer(X.pg); porteProg = await ancienneLigne(X.pg, 'openImportProg()') && 'ancienne ligne'; }
    PORTES.push('programme : ' + (porteProg || 'aucune'));
    const o1 = await ouvert(X.pg, 'ov-import-prog');
    await X.pg.setInputFiles('#imp-gal-inp', { name: 'prog.png', mimeType: 'image/png', buffer: PNG }); await X.pg.waitForTimeout(500);
    await clic(X.pg, '#imp-s2 [onclick*="analyzeImportPhotos"]'); await X.pg.waitForTimeout(900);
    await clic(X.pg, '[onclick*="finalImportProg"]'); await X.pg.waitForTimeout(500);
    const fin = await etat(X.pg); const nbP1 = await X.pg.evaluate(() => (S.programmes || []).length);
    t('B-D088-IMP-⑨a ⭐ « Programmes » → « Importer un programme » marche toujours pendant la séance : le programme s\'ajoute, la séance en cours ne bouge pas',
      porteProg && o1 && nbP1 === nbP0 + 1 && memeSeance(av, fin) && versIA(X, 'importProgram') === 1 && autresIA(X, ['importProgram']).length === 0,
      _det({ porteProg, o1, prog: [nbP0, nbP1], req: X.req.map(r => r.action) }));
    t('B-D088-IMP-⑨b aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  { const c = {}; PORTES.forEach(p => { c[p] = (c[p] || 0) + 1; });   // information, pas un témoin
    console.log('   · import d\'historique ouvert par : ' + Object.keys(c).map(k => k + ' ×' + c[k]).join(', ')); }

  /* ══ ⑩ · LA NOTE DE LA DERNIÈRE SÉANCE : appellation neutre, point gardé même si le texte est identique ═══════════════ */
  for (const [W, H] of [[360, 740], [430, 932]]) {
    const X = await ouvrir({ w: W, h: H, wkt: WKT(NOTE_DC) });   // le champ du jour porte EXACTEMENT la note de la dernière séance
    const B0 = await X.pg.evaluate(() => { const b = document.getElementById('exn-prev-0'); return b ? { aria: b.getAttribute('aria-label'), title: b.getAttribute('title') } : null; });
    await clic(X.pg, '#exn-prev-0');
    const F = await X.pg.evaluate(() => { const f = document.getElementById('exn-prev-fiche'); const ov = document.getElementById('ov-ex-note-prev');
      return { titre: f ? (f.querySelector('.sn-prev-t') || {}).textContent : '', txt: ov ? ov.innerText.replace(/\s+/g, ' ') : '', champ: document.getElementById('ex-note-0').value, cur: S.wkt.exs[0].note }; });
    t('B-D088-NOTE-①a ⭐ ' + W + ' px : texte du jour IDENTIQUE à la note de la dernière séance → le point reste, et la fiche s\'ouvre',
      !!B0 && F.txt.indexOf('« ' + NOTE_DC + ' »') >= 0, _det(B0).slice(0, 120));
    t('B-D088-NOTE-①b ⭐ ' + W + ' px : la fiche s\'appelle « Note de la dernière séance » (neutre), avec la date et l\'exercice ; l\'indicateur le dit aussi',
      /💬\s*Note de la dernière séance$/.test((F.titre || '').trim()) && /Séance du 16\/10\/2026 · Développé Couché/.test(F.txt) && /^Note de la dernière séance, du 16\/10\/2026/.test((B0 || {}).aria || '')
        && /^Note de la dernière séance \(16\/10\/2026\)/.test((B0 || {}).title || ''), _det({ t: F.titre, a: (B0 || {}).aria }));
    t('B-D088-NOTE-①c ' + W + ' px : la fiche ne prétend pas savoir d\'où vient le texte (ni « consigne », ni « personnelle », ni « Milo », ni « programme »)',
      !/consigne|personnel|Milo|programme/i.test(F.txt), F.txt.slice(0, 160));
    t('B-D088-NOTE-①d ⭐ ' + W + ' px : la note du jour n\'a pas bougé (champ et donnée)', F.champ === NOTE_DC && F.cur === NOTE_DC, _det({ c: F.champ, d: F.cur }));
    await X.cx.close();
  }

  /* ══ ⑪ · L'OUTIL DU PROMPT DE MILO NE PEUT PLUS ÉCRIRE DANS LE DÉPÔT PRINCIPAL DEPUIS UNE COPIE ══════════════════════════
     ENVIRONNEMENT TEMPORAIRE SEULEMENT. L'outil de l'arbre testé est COPIÉ dans un dossier temporaire, et son chemin fixe
     (`/home/user/forcetracker`) y est redirigé vers un LEURRE de dépôt principal (des liens vers l'arbre testé, sauf `docs/`,
     vrai dossier vide) : même saboté, il ne vise jamais le vrai dépôt. Deuxième ceinture : un garde préchargé (`node -r`)
     BLOQUE et note toute écriture vers le vrai dépôt principal et vers l'arbre testé, liens suivis. Le garde est d'abord
     éprouvé sur une zone jetable (⑪-0), puis l'outil : refus depuis une copie et depuis un sous-dossier, et contrôle POSITIF
     depuis la racine du leurre (il doit marcher là, et n'écrire que son fichier). */
  {
    const MAIN = '/home/user/forcetracker';
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'd088-outil-'));
    const garde = path.join(tmp, 'garde.js'), journal = path.join(tmp, 'garde.jsonl');
    fs.writeFileSync(garde, GARDE_SRC);
    const lancer = (args, cwd, interdits, timeout) => {
      try { fs.rmSync(journal, { force: true }); } catch (e) {}
      let code = null, sortie = '';
      try { sortie = cp.execFileSync('node', ['-r', garde].concat(args), { cwd, encoding: 'utf8', timeout: timeout || 120000, stdio: ['ignore', 'pipe', 'pipe'],
        env: Object.assign({}, process.env, { FT_INTERDITS: interdits.join(':'), FT_JOURNAL_GARDE: journal }) }); code = 0; }
      catch (e) { code = e.status; sortie = String(e.stdout || '') + String(e.stderr || ''); }
      const bloques = fs.existsSync(journal) ? fs.readFileSync(journal, 'utf8').split('\n').filter(Boolean) : [];
      return { code, sortie, bloques };
    };
    /* ⑪-0 · le garde lui-même mord : écriture directe, à travers un lien, par une adresse file:// — sur une zone JETABLE */
    const zone = path.join(tmp, 'zone'), lien = path.join(tmp, 'lien'); fs.mkdirSync(zone); fs.symlinkSync(zone, lien);
    const g0 = lancer(['-e', "const fs=require('fs'),u=require('url');for(const c of ['zone/a','lien/b',u.pathToFileURL(require('path').resolve('lien/c'))])"
      + "{try{fs.writeFileSync(c,'x');}catch(e){}}"], tmp, [zone]);
    t('B-D088-OUTIL-⑪-0 le garde d\'écriture mord sur une zone jetable : écriture directe, à travers un lien et par adresse file:// — 3 bloquées, 0 faite',
      g0.bloques.length === 3 && fs.readdirSync(zone).length === 0, _det({ bloques: g0.bloques.length, zone: fs.readdirSync(zone) }));
    /* le leurre de dépôt principal, et la copie de l'outil redirigée vers lui */
    const LEURRE = path.join(tmp, 'depot'), COPIE = path.join(tmp, 'copie');
    fs.mkdirSync(path.join(LEURRE, 'docs'), { recursive: true }); fs.mkdirSync(path.join(COPIE, 'tools'), { recursive: true });
    for (const n of fs.readdirSync(ROOT)) if (n !== '.git' && n !== 'docs') fs.symlinkSync(path.join(ROOT, n), path.join(LEURRE, n));
    const src = fs.readFileSync(path.join(ROOT, 'tools', 'dump_prompt.js'), 'utf8');
    fs.writeFileSync(path.join(COPIE, 'tools', 'dump_prompt.js'), src.split(MAIN).join(LEURRE));
    const outil = path.join(COPIE, 'tools', 'dump_prompt.js'), INTERDITS = [MAIN, ROOT];
    const h = f => { try { return crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex').slice(0, 12); } catch (e) { return 'absent'; } };
    const empreinte = () => { const o = {}; try { o.git = cp.execFileSync('git', ['-C', MAIN, 'status', '--porcelain'], { encoding: 'utf8' }); } catch (e) { o.git = 'absent'; }
      o.ref = h(path.join(MAIN, 'docs', 'PROMPT-MILO-REEL.txt'));
      for (const f of ['docs/PROMPT-MILO-REEL.txt', 'coach.js', 'constants.js', 'state.js', 'tools/dump_prompt.js']) o[f] = h(path.join(ROOT, f));
      return o; };
    const av = empreinte();
    const r1 = lancer([outil], COPIE, INTERDITS);
    const r2 = lancer([outil], path.join(LEURRE, 'docs'), INTERDITS);
    const docs12 = fs.readdirSync(path.join(LEURRE, 'docs'));
    t('B-D088-OUTIL-①a ⭐⭐ lancé depuis une copie (comme depuis une branche), l\'outil du prompt REFUSE (code 2) sans tenter la moindre écriture',
      r1.code === 2 && /REFUSE/.test(r1.sortie) && r1.bloques.length === 0 && docs12.length === 0, _det({ code: r1.code, bloques: r1.bloques.slice(0, 2), docs: docs12, sortie: r1.sortie.slice(-120) }));
    t('B-D088-OUTIL-①b lancé depuis un sous-dossier du dépôt principal, il refuse aussi (code 2), sans écriture',
      r2.code === 2 && /REFUSE/.test(r2.sortie) && r2.bloques.length === 0 && docs12.length === 0, _det({ code: r2.code, bloques: r2.bloques.slice(0, 2) }));
    const r3 = lancer([outil], LEURRE, INTERDITS, 180000);
    const docs3 = fs.readdirSync(path.join(LEURRE, 'docs'));
    let txt = ''; try { txt = fs.readFileSync(path.join(LEURRE, 'docs', 'PROMPT-MILO-REEL.txt'), 'utf8'); } catch (e) {}
    t('B-D088-OUTIL-①c ⭐ contrôle POSITIF : depuis la racine du dépôt principal (le leurre), l\'outil MARCHE et n\'écrit que son fichier (docs/PROMPT-MILO-REEL.txt)',
      r3.code === 0 && r3.bloques.length === 0 && _det(docs3) === _det(['PROMPT-MILO-REEL.txt']) && /LE PROMPT DE MILO/.test(txt) && /SITUATION DE L'INSTANT/.test(txt),
      _det({ code: r3.code, bloques: r3.bloques.slice(0, 2), docs: docs3, taille: txt.length, sortie: r3.sortie.slice(-160) }));
    const ap = empreinte();
    t('B-D088-OUTIL-①d ⭐ le vrai dépôt principal et l\'arbre testé sont inchangés (état git, fichier de référence du prompt, sources lues par l\'outil)',
      _det(av) === _det(ap), _det({ av, ap }).slice(0, 260));
    t('B-D088-OUTIL-①e les deux lignes à chemin fixe restent mot pour mot (tools/gen_milo_consolidation_pdf.py s\'y redirige)',
      src.split("const ROOT='/home/user/forcetracker';").length === 2 && src.split("fs.writeFileSync('/home/user/forcetracker/docs/PROMPT-MILO-REEL.txt',").length === 2, '');
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
}

/* Le garde d'écriture préchargé (`node -r`) : bloque et note toute écriture vers FT_INTERDITS — chemins RÉELS comparés
   (un lien ne le contourne pas), adresses file:// comprises ; le reste est permis (dossier temporaire de Playwright).
   Copié tel quel dans le dossier temporaire du témoin ⑪, éprouvé en ⑪-0 sur une zone jetable. */
const GARDE_SRC = `'use strict';
const fs=require('fs'),path=require('path');
const reel=p=>{try{return fs.realpathSync(p);}catch(e){}try{return path.join(fs.realpathSync(path.dirname(p)),path.basename(p));}catch(e){}return p;};
const INTERDITS=String(process.env.FT_INTERDITS||'').split(':').filter(Boolean).map(p=>reel(path.resolve(p)));
const JOURNAL=process.env.FT_JOURNAL_GARDE; const ap=fs.appendFileSync;
const noter=(op,c)=>{try{ap(JOURNAL,JSON.stringify({op,cible:String(c)})+'\\n');}catch(e){}};
const interdit=c=>{if(c==null||typeof c==='number')return false;let p;try{const v=(c instanceof URL||/^file:/.test(String(c)))?require('url').fileURLToPath(c):String(c);p=path.resolve(v);}catch(e){return false;}
  const q=[p,reel(p)];return INTERDITS.some(r=>q.some(x=>x===r||x.startsWith(r+path.sep)));};
const garder=(n,idx,quand)=>{const f=fs[n];if(typeof f!=='function')return;fs[n]=function(...a){const c=idx.map(i=>a[i]);
  if((!quand||quand(a))&&c.some(interdit)){noter(n,c.find(interdit));const e=new Error('ÉCRITURE REFUSÉE par le garde : '+c.find(interdit));
    if(typeof a[a.length-1]==='function'&&!n.endsWith('Sync'))return a[a.length-1](e);throw e;}return f.apply(this,a);};};
const ecrit=a=>{const fl=(a[1]&&typeof a[1]==='object')?a[1].flags:a[1];return fl!=null&&/[wa+]/.test(String(fl));};
[['writeFileSync',[0]],['appendFileSync',[0]],['copyFileSync',[1]],['renameSync',[0,1]],['unlinkSync',[0]],['rmSync',[0]],['rmdirSync',[0]],['mkdirSync',[0]],
 ['truncateSync',[0]],['symlinkSync',[1]],['linkSync',[1]],['writeFile',[0]],['appendFile',[0]],['copyFile',[1]],['rename',[0,1]],['unlink',[0]],['rm',[0]],
 ['mkdir',[0]],['truncate',[0]]].forEach(([n,i])=>garder(n,i));
garder('openSync',[0],ecrit);garder('open',[0],ecrit);garder('createWriteStream',[0]);
const P=fs.promises;if(P){[['writeFile',0],['appendFile',0],['copyFile',1],['rename',1],['unlink',0],['rm',0],['mkdir',0]].forEach(([n,i])=>{const f=P[n];
  if(typeof f!=='function')return;P[n]=function(...a){if(interdit(a[i])||(n==='rename'&&interdit(a[0]))){noter('promises.'+n,a[i]);
  return Promise.reject(new Error('ÉCRITURE REFUSÉE par le garde : '+a[i]));}return f.apply(this,a);};});}
`;
module.exports = { ecran };
