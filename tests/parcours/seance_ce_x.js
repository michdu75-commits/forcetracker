/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════
   🧵 SCCX — L'INTERACTION DES TROIS LOTS (Claude N°2, mission corrective Séance du 16/11/2026, assemblage) : blocs B-SCCX-*.
   Les trois lots ont été développés séparément, chacun avec son banc (B-SCCH : D-163 / D-168 / D-171 · B-SCCP : D-164 / D-167 · B-SCCM : D-170 / D-173 / D-176), puis ASSEMBLÉS. RIEN ne les testait ENSEMBLE sur un même
   parcours — alors qu'ils se partagent les mêmes fonctions de `log.js` (`_exsDeProgramme`, `saveAsProg`, `supprimerSerie`, `_kgTxtSerie`, `openSerieSuppr`) et les mêmes identités (`sid`, `exId`, `ed`, `pdc`, `note`).
   ⭐ Ici : UN fil conducteur, conduit par les VRAIS gestes d'un VRAI Chromium mobile (390 × 844) —
     X1  la feuille « Quelle série supprimer ? » (D-173) dit chaque série comme le reste de l'app (D-164) : PDC + lest · assistance · « à vide » · kilos · charge inconnue · zéro écrit · paliers verrouillés ;
     X2  un programme à DEUX JOURS DE MÊME LIBELLÉ (lot 1), avec des séries aux états de charge différents et un commentaire par série (lots 1 + 2), deux blocs HOMONYMES, un dropset posé par l'outil :
         1ᵉʳ chargement = les prescriptions ; séance A faite et terminée (lest 12 → 15, RIR, tonnage, record de lest) ; l'ÉDITEUR (une retouche charge + repos, une série DÉPLACÉE, un commentaire de série) ;
         2ᵉ chargement = la progression par IDENTITÉ (la retouche gagne pour SA série et SON champ seulement, le repos vient de l'historique pour les autres) ; séance B : pointer, répondre au RIR, SUPPRIMER une série (lot 3)
         sans toucher ni aux identités, ni aux commentaires, ni aux PDC, ni aux RIR des autres ; « Sauvegarder comme programme » ; terminer ; la séance enregistrée, le tonnage avec lest, le record de lest ; l'export (CSV) et
         le contexte de Milo (fonction locale, AUCUN appel au modèle) ; un VRAI rechargement de la page puis le 3ᵉ chargement (l'AUTRE jour de même libellé reste à sa prescription) ;
     X3  D-176 sur ce même fil : Accueil → Séance → Progrès → Nutrition → Coach → Profil → Accueil (et un écran FUTUR inventé) PENDANT une séance : l'en-tête global n'est visible que sur l'Accueil, aucune bande vide, « Terminer »
         et la barre du bas restent, le bouton central « + » ne bouge pas d'un pixel (règle d'or #9) ;
     X4  D-170 sur ce même fil (vrai service worker, publications simulées, serveur local qui FIGE le corps de la réponse) : pendant « Terminer » aucune mise à jour ne tombe, l'opération se TERMINE (issue dite, séance
         gardée avec ses identités et ses états de charge), et la progression du jour est reprise de cette séance après le redémarrage.
   Les oracles sont ÉCRITS ICI (constantes du scénario, arithmétique à la main) : aucun n'est calculé par la fonction qu'il juge. Données ENTIÈREMENT FICTIVES : exercices du catalogue (Tractions, Développé Couché, Extension Triceps),
   UN exercice PERSONNALISÉ (`S.customExercises`) et UN exercice FICTIF inédit absent du catalogue ; dates RELATIVES ; l'horloge réelle AVANCE (des attentes séparent chaque étape : les instants `ed` et les séances se classent
   comme en vrai) ; les bilans qui s'ouvrent seuls (lundi, mois écoulé) sont posés « annoncés » (le piège de calendrier de B-MAJV-B). 0 appel réel (toute requête hors du serveur local est comptée puis coupée).
   NE COUVRE PAS ⛔ : Safari iOS (Chromium n'est pas un iPhone : gel d'une page en arrière-plan, zone sûre réelle, vrais gestes M36) ; la réponse réelle d'un Worker / de Milo (aucun appel) ; l'envoi réel au tableur.
   Banc : tools/banc_seance_ce_x.js · contrôle négatif : tools/mut_seance_ce_x.py
   Parties : `pur` (source, instantané) · `ecran` (X1 + X2 + X3, un seul fil) · `maj` (X4).
   ═════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const mvAide = require('./maj_version.js').aide;
const sm = require('./seance_maj.js').aide;
const { reseau } = require('./seance_ce_m.js');
const { allerA, lireBandeau, voit, marquer, rechargee, dormir, attendre, publier, recue, calme } = mvAide;

const J = (o) => JSON.stringify(o);
const js = (x) => J(x).slice(0, 600);
const TR = 'Tractions (Pull-up)', DC = 'Développé Couché', ET = 'Extension Triceps';       // trois exercices du CATALOGUE (poids du corps · barre · poulie)
const PERSO = 'Exo perso Zéta', FIC = 'Zorglub inversé à la poulie';                        // un exercice PERSONNALISÉ (S.customExercises) · un exercice FICTIF inédit
const SE = (kg, reps, type, rest, extra) => Object.assign({ kg, reps, type: type || 'N', rest: rest || 0 }, extra || {});
/* le programme (ancien format : aucun identifiant, aucun `prescrit`) — deux jours de MÊME libellé ; index des exercices du jour 0 : 0 Tractions · 1 Développé · 2 Triceps « Bloc A » · 3 Triceps « Bloc B » · 4 perso · 5 fictif (dropset posé par l'outil) */
const PROG = () => ({ name: 'Programme fictif X', days: [
  { label: 'HAUT', exs: [
    { name: TR, note: '', sets: [SE(0, 6, 'N', 120, { pdc: 12, note: 'ceinture' }), SE(0, 8, 'N', 90, { pdc: -20, note: 'élastique' }), SE(0, 8, 'N', 75), SE(null, 8, 'N', 60, { note: 'à confirmer' })] },
    { name: DC, note: '', sets: [SE(0, 12, 'É', 45, { vide: true, note: 'barre seule' }), SE(60, 8, 'É', 60), SE(80, 5, 'N', 150, { note: 'top' }), SE(80, 5, 'N', 150)] },
    { name: ET, note: 'Bloc A', sets: [SE(30, 10, 'N', 60), SE(30, 10, 'N', 60)] },
    { name: ET, note: 'Bloc B', sets: [SE(20, 15, 'N', 45), SE(20, 15, 'N', 45)] },
    { name: PERSO, note: '', sets: [SE(25, 10, 'N', 75), SE(25, 10, 'N', 75)] },
    { name: FIC, note: '', dropset: { paliers: 2, pct: 10, direction: 'down' }, sets: [SE(40, 10, 'N', 90), SE(36, 10, 'N', 0), SE(32, 10, 'N', 0)] }] },
  { label: 'HAUT', exs: [{ name: TR, note: '', sets: [SE(0, 5, 'N', 100, { pdc: 5 })] }, { name: DC, note: '', sets: [SE(70, 6, 'N', 120)] }] }] });
/* l'historique d'AILLEURS : une séance libre d'il y a 10 jours, mêmes noms, valeurs hostiles — rien de tout ça ne doit jamais apparaître (aucun `progId`, libellé ambigu).
   ⚠️ ORACLE CHANGÉ le 17/11/2026 (lot H, arbitrage de Michel — valider une charge vide ne reprend JAMAIS la suggestion d'un AUTRE programme) : les Tractions y SONT désormais (99). Avant, elles en étaient absentes exprès parce que valider une série
   SANS charge reprenait la suggestion grise de « Précédent » d'où qu'elle vienne ; ce banc veut justement observer qu'une série « inconnue » validée sans rien taper RESTE inconnue — il l'observe maintenant AVEC un 99 hostile à portée de main. */
const OLD = () => { const ts = Date.now() - 10 * 864e5, d = new Date(ts), ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const h = (name, extra) => ({ name, sets: [Object.assign({ kg: 99, reps: 3, done: true, type: 'N', rm1: 108 }, extra || {})] });
  return { id: ts, ts, date: ds, synced: true, uniConv: 1, volume: 99 * 3 * 4, progLabel: 'HAUT', exs: [h(TR), h(DC), h(ET), h(PERSO), h(FIC)] }; };
const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 'sccx@example.test', ft4_devtoken: 'f'.repeat(64),
  ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '130', ft4_premium: 'true' };
const CUEX = [{ n: PERSO, g: 'Pectoraux', eq: 'Haltères', c: 'custom' }];

/* la projection d'une série : charge · PDC · « à vide » · répétitions · type · repos · commentaire — c'est ce que la personne a ÉCRIT / CHOISI */
const P = (s) => [s.kg === undefined ? 'U' : s.kg, s.pdc === undefined ? '' : s.pdc, s.vide ? 'V' : '', s.reps, s.type, s.rest, s.note || ''];
const PX = (ex) => ex.sets.map(P);
const SANS_IDS = (o) => JSON.parse(JSON.stringify(o, (k, v) => (k === 'id' || k === 'sid' || k === 'exId') ? undefined : v));          // un programme sans ses identités posées paresseusement
/* le texte d'une charge, tel que la feuille « Quelle série supprimer ? » doit le DIRE (écrit ici, d'après le sens de chaque état — D-164) */
const TXT = (s) => typeof s.pdc === 'number' ? (s.pdc === 0 ? 'PDC' : 'PDC' + (s.pdc > 0 ? '+' : '−') + Math.abs(s.pdc) + 'kg') : ((s.vide && !(s.kg > 0)) ? 'à vide' : (s.kg > 0 ? s.kg + ' kg' : '— kg'));
const TYPE = { N: 'Normal', 'É': 'Échauffement', X: 'Échec' };
const LIGNE = (s) => TYPE[s.type] + ' · ' + s.reps + ' × ' + TXT(s) + (s.done ? ' ✓ faite' : '');
/* le tonnage d'une séance enregistrée, REFAIT ICI : séries faites hors échauffement ; des kilos, ou le montant d'un LEST (jamais une assistance, jamais le poids de corps) × répétitions */
const TONNAGE = (sess, avecLest) => { let v = 0; sess.exs.forEach((ex) => ex.sets.forEach((s) => { if (!s.done || s.type === 'É' || s.type === 'W' || !(s.reps > 0)) return;
  const c = typeof s.pdc === 'number' ? (avecLest ? Math.max(s.pdc, 0) : 0) : (+s.kg || 0); v += c * s.reps; })); return v; };

/* ══════════════════════════════════════ SOURCE ══════════════════════════════════════ */
function pur(t, ROOT, fs, path) {
  console.log('\n═══ B-SCCX-P (source). L\'INTERACTION DES TROIS LOTS ═══');
  const lire = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const log = lire('log.js'), runner = lire('tests/parcours/runner.js'), rep = lire('tests/parcours/repartition-3.json');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? src.length : j); };
  t('B-SCCX-P1 ⛔⛔ la feuille « Quelle série supprimer ? » (lot 3, D-173) dit la charge d\'une série par le MÊME propriétaire que le reste de l\'app (lot 2, D-164 : `_kgTxtSerie`, `_pdcDe`) — elle ne porte plus de lecture locale qui dirait « — kg » pour un PDC',
    /_pdcDe\(set\)!==null/.test(corps(log, 'openSerieSuppr')) && /_kgTxtSerie\(set\)/.test(corps(log, 'openSerieSuppr')));
  t('B-SCCX-P2 le banc d\'interaction est ENREGISTRÉ pour la passe : joué par le runner (source · écran · mise à jour) et rangé dans la répartition en 3 processus',
    /require\('\.\/seance_ce_x\.js'\)\.pur\(/.test(runner) && /require\('\.\/seance_ce_x\.js'\)\.ecran\(/.test(runner) && /require\('\.\/seance_ce_x\.js'\)\.maj\(/.test(runner) && /"\.\/seance_ce_x\.js"\s*:\s*[012]/.test(rep));
}

/* ══════════════════════════════════════ ÉCRAN : X1 + X2 + X3, UN SEUL FIL ══════════════════════════════════════ */
async function ecran(t, b, PORT) {
  console.log('\n═══ B-SCCX (écran conduit). UN FIL : feuille de suppression · deux jours · éditeur · séance A · séance B · en-tête · enregistrement ═══');
  const SEUL = (process.env.SCCX_SEUL || '').split(',').filter(Boolean);
  const garde = async (nom, f) => { if (SEUL.length && SEUL.indexOf(nom) < 0) return; try { await f(); } catch (e) { t('B-SCCX-' + nom + ' ⛔ le scénario s\'est exécuté jusqu\'au bout', false, String(e && e.stack || e).slice(0, 700)); } };
  await garde('X', async () => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
    const dehors = [];                                                                       // ⛔ toute requête hors du serveur local : notée, puis coupée
    await cx.route((u) => !/^http:\/\/localhost:/.test(String(u)), (rt) => { const rq = rt.request(); let c = {}; try { c = JSON.parse(rq.postData() || '{}'); } catch (e) {} dehors.push({ u: rq.url().slice(0, 60), a: c.action || '' }); return rt.abort(); });
    const init = Object.assign({}, BASE, { ft4_sessions: J([OLD()]), ft4_progs: J([PROG()]), ft4_cuex: J(CUEX) });
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_sccx'))return; sessionStorage.setItem('_sccx','1'); localStorage.clear();
      const D=${J(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));
      const n=new Date(); localStorage.setItem('ft4_lws', n.toLocaleDateString('sv-SE'));
      const p=new Date(n.getFullYear(), n.getMonth()-1, 15); localStorage.setItem('ft4_lms', p.getFullYear()+'-'+String(p.getMonth()+1).padStart(2,'0')); }catch(e){} })();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', (x) => errs.push(String(x.message).slice(0, 200)));
    pg.setDefaultTimeout(6000);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const tidy = () => pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none';
      const tt = today(), pm = new Date(Date.UTC(+tt.slice(0, 4), +tt.slice(5, 7) - 2, 15)); S.lastWeekSummary = tt; S.lastMonthSummary = pm.getUTCFullYear() + '-' + String(pm.getUTCMonth() + 1).padStart(2, '0'); persist(); });
    await tidy();
    const X = { cx, pg, errs, dehors };
    const lire = () => pg.evaluate(() => ({ wkt: S.wkt ? JSON.parse(JSON.stringify(S.wkt)) : null, progs: JSON.parse(JSON.stringify(S.programmes)), sess: JSON.parse(JSON.stringify(S.sessions)),
      progsDisque: JSON.parse(localStorage.getItem('ft4_progs') || 'null'), sessDisque: JSON.parse(localStorage.getItem('ft4_sessions') || 'null'), wktDisque: JSON.parse(localStorage.getItem('ft4_wkt') || 'null') }));
    const KG = (ei, si) => `#sr-${ei}-${si} input[inputmode="decimal"]`, REPS = (ei, si) => `#sr-${ei}-${si} input[inputmode="numeric"]`, CHK = (ei, si) => `#sr-${ei}-${si} .chk`;
    const voir = async (ei) => { await pg.evaluate((ei) => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); _expandedEx = ei; goScreen('log', document.getElementById('nb-log')); renderExBlocks(); }, ei); await pg.waitForTimeout(220); };
    const taper = async (sel, v) => { await pg.click(sel); await pg.fill(sel, String(v)); await pg.press(sel, 'Tab'); await pg.waitForTimeout(90); };
    const valider = async (ei, si, garder) => { await pg.click(CHK(ei, si)); await pg.waitForTimeout(90); if (!garder) await pg.evaluate(() => { stopRest(); }); await pg.waitForTimeout(60); };
    const fab = () => pg.evaluate(() => { const r = document.getElementById('nb-log').getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 100) / 100).join(','); });
    const refFab = await fab();                                                              // le bouton central sur l'Accueil, avant tout (règle d'or #9)
    /* « Mes programmes » → « ▶ Charger » → le jour : le VRAI chemin de chargement d'un jour (aucun appel direct à la fonction qui charge) */
    const charger = async (jour) => { await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); openProgModal(); }); await pg.waitForTimeout(200);
      await pg.click('#mod-prog button[onclick="loadProg(0)"]'); await pg.waitForTimeout(200);
      await pg.click(`#day-sel-btns button[onclick="loadProgDay(0,${jour})"]`); await pg.waitForTimeout(450); };
    const ouvrirMenu = async (ei) => { await voir(ei);
      const ok = await pg.evaluate((ei) => { const bt = [...document.querySelectorAll('#ex-block-' + ei + ' .ex-hdr button')].filter((e) => (e.textContent || '').trim() === '⋯').pop(); if (!bt) return false; bt.click(); return true; }, ei);
      await pg.waitForTimeout(150); return ok; };
    const feuille = async (ei) => { if (!await ouvrirMenu(ei)) return null;
      const ok = await pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-ex-menu button')].find((e) => /Supprimer une série/.test(e.textContent)); if (!bt) return false; bt.click(); return true; });
      await pg.waitForTimeout(150); if (!ok) return null;
      return pg.evaluate(() => { const o = document.getElementById('ov-ex-menu'); const lignes = [...o.querySelectorAll('button[onclick^="supprimerSerie("]')].map((e) => ({ si: +/supprimerSerie\(\d+,(\d+)\)/.exec(e.getAttribute('onclick'))[1], txt: e.textContent.replace(/\s+/g, ' ').replace(/^\d+\s*/, '').replace(/\s*🗑️.*$/, '').trim() }));
        return { lignes, verrouilles: [...o.querySelectorAll('div[style*="opacity:.55"]')].map((e) => e.textContent.replace(/\s+/g, ' ').replace(/^\d+\s*/, '').trim()), texte: o.innerText.replace(/\s+/g, ' ') }; }); };
    const fermerFeuille = () => pg.evaluate(() => { closeExMenu(); });
    const confirmOuvert = () => pg.evaluate(() => { const o = document.getElementById('ov-confirm'); return !!(o && o.classList.contains('open')); });

    // ═══ X1 · 1ᵉʳ CHARGEMENT : les prescriptions, états de charge INTACTS — puis la feuille « Quelle série supprimer ? » les DIT ═══
    console.log('\n─── B-SCCX-X1 · le 1ᵉʳ chargement (deux jours de même libellé) et la feuille de suppression ───');
    const avantTout = await lire();
    await charger(0);
    const L0 = await lire();
    const w0 = L0.wkt, p0 = L0.progs[0];
    const ATT0 = [
      [[0, 12, '', 6, 'N', 120, 'ceinture'], [0, -20, '', 8, 'N', 90, 'élastique'], [0, '', '', 8, 'N', 75, ''], [null, '', '', 8, 'N', 60, 'à confirmer']],
      [[0, '', 'V', 12, 'É', 45, 'barre seule'], [60, '', '', 8, 'É', 60, ''], [80, '', '', 5, 'N', 150, 'top'], [80, '', '', 5, 'N', 150, '']],
      [[30, '', '', 10, 'N', 60, ''], [30, '', '', 10, 'N', 60, '']], [[20, '', '', 15, 'N', 45, ''], [20, '', '', 15, 'N', 45, '']], [[25, '', '', 10, 'N', 75, ''], [25, '', '', 10, 'N', 75, '']],
      [[40, '', '', 10, 'N', 90, ''], [36, '', '', 10, 'N', 0, ''], [32, '', '', 10, 'N', 0, '']]];
    t('B-SCCX-X1a ⭐⭐ 1ᵉʳ chargement d\'un jour (programme d\'AVANT, deux jours « HAUT ») : les PRESCRIPTIONS, exactement — PDC+12 · PDC−20 · zéro écrit · charge INCONNUE (null) · « à vide » · kilos · deux blocs homonymes · perso · fictif · dropset ; les commentaires PAR SÉRIE suivent ; rien des valeurs hostiles d\'ailleurs (99)',
      J(w0.exs.map(PX)) === J(ATT0) && w0.exs.every((e, i) => e.name === PROG().days[0].exs[i].name) && J(w0.exs[5].dropset) === J({ paliers: 2, pct: 10, direction: 'down' }) && w0.exs[2].note === 'Bloc A' && w0.exs[3].note === 'Bloc B', js(w0.exs.map(PX)));
    t('B-SCCX-X1b ⭐ les identités se posent PAUSÉEMENT et sans rien changer d\'autre : le programme, le jour chargé, ses exercices et ses séries reçoivent un identifiant ; le 2ᵉ jour (pas chargé) n\'en a pas ; le programme, une fois les identifiants retirés, est celui qu\'on a écrit',
      (() => { const dif = (a, b, ch) => { if (J(a) === J(b)) return null; if (a && b && typeof a === 'object' && typeof b === 'object') { const k = new Set(Object.keys(a).concat(Object.keys(b))); for (const x of k) { const d = dif(a[x], b[x], ch + '.' + x); if (d) return d; } } return ch + ' : ' + J(a) + ' ≠ ' + J(b); };
        const c = { prog: !!p0.id, jour0: !!p0.days[0].id, jour1: !p0.days[1].id, seance: w0.progId === p0.id && w0.progDayId === p0.days[0].id, ids: p0.days[0].exs.every((e) => !!e.exId && e.sets.every((s) => !!s.sid)), intact: J(SANS_IDS(p0)) === J(SANS_IDS(PROG())) };
        return Object.values(c).every(Boolean) || (console.log('      (détail X1b : ' + js(c) + ' ' + (c.intact ? '' : dif(SANS_IDS(p0), SANS_IDS(PROG()), 'prog')) + ')'), false); })(), '');
    t('B-SCCX-X1c l\'historique d\'ailleurs n\'est pas touché par un chargement (octet pour octet), et la séance en cours est écrite sur le disque (zéro perte)', J(L0.sess) === J(avantTout.sess) && !!L0.wktDisque && J(L0.wktDisque.exs.map(PX)) === J(ATT0), '');
    const sidsP = p0.days[0].exs.map((e) => e.sets.map((s) => s.sid));                      // les identités de séries du programme (la séance A les copie)
    t('B-SCCX-X1d les identités de séries du jour chargé sont UNIQUES dans chaque exercice et copiées dans la séance (même `sid`, même `exId`) — deux blocs de même nom ne partagent rien', sidsP.every((l) => new Set(l).size === l.length) && J(w0.exs.map((e) => e.sets.map((s) => s.sid))) === J(sidsP) && J(w0.exs.map((e) => e.exId)) === J(p0.days[0].exs.map((e) => e.exId)) && w0.exs[2].exId !== w0.exs[3].exId, '');
    await voir(0);
    const f0 = await feuille(0);
    t('B-SCCX-X1e ⭐⭐⭐ la feuille « Quelle série supprimer ? » de l\'exercice au poids du corps DIT chaque état comme le reste de l\'app : « PDC+12kg » · « PDC−20kg » · le zéro écrit et la charge inconnue en « — kg » (le champ de la séance est vide dans les deux cas) — jamais « — kg » pour un PDC (le défaut de l\'assemblage D-164 × D-173)',
      !!f0 && f0.lignes.length === 4 && J(f0.lignes.map((l) => l.txt)) === J(w0.exs[0].sets.map(LIGNE)) && /PDC\+12kg/.test(f0.lignes[0].txt) && /PDC−20kg/.test(f0.lignes[1].txt) && !/PDC|à vide/.test(f0.lignes[2].txt) && f0.lignes[3].txt === 'Normal · 8 × — kg', js(f0 && f0.lignes));
    await fermerFeuille();
    const f1 = await feuille(1);
    t('B-SCCX-X1f ⭐⭐ la feuille du Développé : « à vide » dit « à vide » (jamais « — kg »), des kilos restent des kilos (« 60 kg », « 80 kg ») ; les types se disent (Échauffement · Normal)',
      !!f1 && J(f1.lignes.map((l) => l.txt)) === J(w0.exs[1].sets.map(LIGNE)) && /à vide/.test(f1.lignes[0].txt) && /Échauffement · 8 × 60 kg/.test(f1.lignes[1].txt), js(f1 && f1.lignes));
    await fermerFeuille();
    const f5 = await feuille(5);
    /* RÉÉCRIT le 17/11/2026 (lot D de fermeture, arbitrage de Michel : D-173 autorise le palier isolé). AVANT : « les 2 PALIERS sont des lignes verrouillées … et la phrase DIT pourquoi ». L'INVARIANT GARDÉ : la feuille DIT la
       charge de chaque palier (« Palier · 10 × 36 kg »), comme le reste de l'app, jamais « — kg ». Maintenant : 3 lignes cliquables (la normale et les 2 paliers, dont aucun n'est le dernier) ; aucune ligne verrouillée. */
    t('B-SCCX-X1g ⭐ la feuille du dropset posé par l\'outil : la série normale et les 2 PALIERS sont proposés (aucun palier verrouillé : il en reste un autre) et les paliers disent leur charge (« Palier · 10 × 36 kg »)',
      !!f5 && J(f5.lignes.map((l) => l.si)) === '[0,1,2]' && f5.verrouilles.length === 0 && /^Palier · 10 × 36 kg/.test(f5.lignes[1].txt) && /^Palier · 10 × 32 kg/.test(f5.lignes[2].txt) && !/Dernier palier/.test(f5.texte), js(f5));
    await fermerFeuille();
    const f2 = await feuille(2), f4 = await feuille(4);
    t('B-SCCX-X1h les deux blocs homonymes, l\'exercice perso : chacun liste SES 2 séries', !!f2 && f2.lignes.length === 2 && /Bloc A/.test(await pg.evaluate(() => S.wkt.exs[2].note)) && !!f4 && f4.lignes.length === 2 && /Exo perso Zéta/.test(f4.texte), '');
    await fermerFeuille();
    t('B-SCCX-X1i aucun élément n\'a changé en regardant : la séance en cours est la même qu\'au chargement', J((await lire()).wkt.exs.map(PX)) === J(ATT0), '');

    // ═══ X2a · SÉANCE A : la personne la fait (vrais gestes), la termine ═══
    console.log('\n─── B-SCCX-X2a · la séance A (lest 12 → 15, RIR, valeurs tapées) ───');
    t('B-SCCX-X2a0 « démarrer » : avant la 1ʳᵉ série validée le chrono n\'a pas démarré ; la validation de la 1ʳᵉ série le démarre', !(await lire()).wkt.startTs, '');
    await voir(0);
    await taper(KG(0, 0), '15');                                                              // le lest 12 → 15 (le champ affiche « PDC+12 », on tape le montant)
    await valider(0, 0, true);
    const rir = await pg.evaluate(() => ({ barre: document.getElementById('rest-bar') && document.getElementById('rest-bar').classList.contains('show'), btn: !!document.querySelector('#rest-rir button[onclick="setRir(0,0,2)"]'), start: !!S.wkt.startTs }));
    await pg.click('#rest-rir button[onclick="setRir(0,0,2)"]'); await pg.waitForTimeout(100);
    await pg.evaluate(() => { stopRest(); });
    t('B-SCCX-X2a1 ⭐ « démarrer » : la 1ʳᵉ série validée démarre le chrono ; sur une série de travail le repos pose la question de la réserve (RIR), la réponse « 2 » va à SA série', rir.barre && rir.btn && rir.start && (await lire()).wkt.exs[0].sets[0].rir === 2, js(rir));
    await valider(0, 1); await valider(0, 2); await valider(0, 3);                            // assistance · zéro écrit · charge inconnue : validées sans rien taper
    await voir(1);
    await valider(1, 0); await valider(1, 1);                                                 // les deux échauffements
    await taper(KG(1, 2), '85'); await valider(1, 2);
    await taper(KG(1, 3), '85'); await taper(REPS(1, 3), '4'); await valider(1, 3);
    await voir(2); await taper(KG(2, 0), '32'); await taper(REPS(2, 0), '12'); await valider(2, 0);   // le bloc A : 32 × 12 puis 32 × 11
    await taper(KG(2, 1), '32'); await taper(REPS(2, 1), '11'); await valider(2, 1);
    await voir(3); await taper(KG(3, 0), '22'); await taper(REPS(3, 0), '18'); await valider(3, 0);   // le bloc B : 22 × 18 deux fois
    await taper(KG(3, 1), '22'); await taper(REPS(3, 1), '18'); await valider(3, 1);
    await voir(4); await taper(KG(4, 0), '27.5'); await valider(4, 0); await valider(4, 1);
    await voir(5); await taper(KG(5, 0), '42');
    await pg.evaluate(() => { toggleSet(5, 0); toggleSet(5, 1); toggleSet(5, 2); stopRest(); persist(); });
    const mid = (await lire()).wkt;
    t('B-SCCX-X2a2 ⭐ ce que la personne a fait est dans la séance : PDC+15 (lest changé) · assistance gardée · zéro · inconnue VALIDÉE sans rien taper RESTE inconnue (null) · 85 × 5 / 85 × 4 · les deux blocs homonymes ont CHACUN leurs valeurs (32 / 22) · perso 27,5 · fictif 42 · dropset intact',
      J(mid.exs[0].sets.map((s) => [s.kg, s.pdc === undefined ? '' : s.pdc, s.done, s.note || '', s.rir === undefined ? '' : s.rir])) === J([[0, 15, true, 'ceinture', 2], [0, -20, true, 'élastique', ''], [0, '', true, '', ''], [null, '', true, 'à confirmer', '']])
      && J(mid.exs[1].sets.map((s) => [s.kg, s.reps])) === J([[0, 12], [60, 8], [85, 5], [85, 4]]) && J(mid.exs[2].sets.map((s) => [s.kg, s.reps])) === J([[32, 12], [32, 11]]) && J(mid.exs[3].sets.map((s) => [s.kg, s.reps])) === J([[22, 18], [22, 18]])
      && J(mid.exs[4].sets.map((s) => s.kg)) === J([27.5, 25]) && J(mid.exs[5].sets.map((s) => s.kg)) === J([42, 36, 32]) && J(mid.exs[5].dropset) === J({ paliers: 2, pct: 10, direction: 'down' }) && mid.exs.every((e) => e.sets.every((s) => s.done)), js(mid.exs[0].sets));
    await voir(0);
    const clicT = await pg.evaluate(() => { const r = document.querySelector('.topbar .tbs-fin').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }; });
    await pg.mouse.click(clicT.x, clicT.y); await pg.waitForTimeout(900);                      // un VRAI toucher sur « Terminer »
    const recapA = await pg.evaluate(() => { const o = document.getElementById('ov-session-end'); return { ouvert: !!(o && o.classList.contains('open')), stats: (document.getElementById('se-stats') || { innerText: '' }).innerText.replace(/\s+/g, ' ') }; });
    await pg.evaluate(() => { closeSessionEnd('home'); }); await pg.waitForTimeout(300);
    const LA = await lire();
    const A = LA.sess.find((s) => s.progId === LA.progs[0].id);
    t('B-SCCX-X2a3 ⭐⭐ « Terminer » (vrai toucher) : le récapitulatif s\'ouvre, la séance A est enregistrée ET sur le disque ; elle porte le programme, le JOUR chargé (`progDayId`), les identités des exercices et des séries (celles du programme) et chaque état tel quel (PDC+15, −20, zéro, null) avec ses commentaires',
      (() => { const c = { recap: recapA.ouvert, A: !!A, n: LA.sess.length === 2 && LA.sessDisque.length === 2, jour: !!A && A.progDayId === LA.progs[0].days[0].id, exId: !!A && J(A.exs.map((e) => e.exId)) === J(LA.progs[0].days[0].exs.map((e) => e.exId)), sids: !!A && J(A.exs.map((e) => e.sets.map((s) => s.sid))) === J(sidsP),
        etats: !!A && J(A.exs[0].sets.map((s) => [s.kg, s.pdc === undefined ? '' : s.pdc, s.note || ''])) === J([[0, 15, 'ceinture'], [0, -20, 'élastique'], [0, '', ''], [null, '', 'à confirmer']]), wktVide: !LA.wkt || !(LA.wkt.exs || []).length };           // `renderLog()` recrée une séance VIERGE (sans exercice) : « vidée » = aucun exercice

        return Object.values(c).every(Boolean) || (console.log('      (détail X2a3 : ' + js(c) + ')'), false); })(), '');
    const volA = 90 + 765 + 736 + 792 + 525 + 1100;                                            // 15×6 · 85×5+85×4 · 32×12+32×11 · 22×18×2 · 27,5×10+25×10 · 42×10+36×10+32×10 (l'assistance, le zéro et l'inconnue : 0)
    t('B-SCCX-X2a4 ⭐⭐ le TONNAGE avec lest (lot 2) sur une séance de jour de programme (lot 1) : 3 répétitions × lest = lest × répétitions (ici 15 × 6 = 90 pour les Tractions) ; volume enregistré = 4 008 ; l\'assistance, le zéro et l\'inconnue comptent 0 ; refait ici, sans la fonction qui le calcule',
      A.volume === volA && TONNAGE(A, true) === volA && TONNAGE(A, true) - TONNAGE(A, false) === 90, js({ volume: A.volume, att: volA, oracle: TONNAGE(A, true) }));
    const recA = await pg.evaluate(() => ({ lest: _recordLest('Tractions (Pull-up)'), prs: Object.keys(S.prs).sort() }));
    t('B-SCCX-X2a5 ⭐ le RECORD DE LEST est dérivé de A (+15 × 6) ; aucun record de charge n\'a été créé par un PDC / une assistance / un zéro ; seul le Développé (85 kg) a le sien ; l\'historique d\'ailleurs (99) n\'a rien prêté', recA.lest && recA.lest.lest === 15 && recA.lest.reps === 6 && J(recA.prs) === J([DC, ET, FIC, PERSO].sort()), js(recA));
    t('B-SCCX-X2a6 ⭐ le passé n\'a pas bougé : la séance d\'il y a 10 jours est identique octet pour octet', J(LA.sess.find((s) => s.progLabel === 'HAUT' && !s.progId)) === J(avantTout.sess[0]), '');
    await pg.waitForTimeout(40);

    // ═══ X2b · L'ÉDITEUR : une retouche (charge + repos), une série DÉPLACÉE, un commentaire de série ═══
    console.log('\n─── B-SCCX-X2b · l\'éditeur de programme (vrais gestes) ───');
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); openProgModal(); }); await pg.waitForTimeout(200);
    await pg.click('#mod-prog button[title="Modifier"]'); await pg.waitForTimeout(400);
    const CARD = (ei) => `#ov-prog-edit .prog-ex-card[data-di="0"][data-ei="${ei}"]`, ROW = (ei, si) => `${CARD(ei)} .pe-row[data-si="${si}"]`;
    const avantEd = (await lire()).progs[0];
    const tsAvantRetouche = Date.now();
    await pg.waitForTimeout(40);
    await pg.fill(ROW(1, 3) + ' [data-ch="kg"]', '82.5'); await pg.press(ROW(1, 3) + ' [data-ch="kg"]', 'Tab');          // LA retouche : 4ᵉ série du Développé, charge ET repos
    await pg.fill(ROW(1, 3) + ' [data-ch="rest"]', '200'); await pg.press(ROW(1, 3) + ' [data-ch="rest"]', 'Tab');
    await pg.fill(ROW(0, 2) + ' [data-ch="rest"]', '80'); await pg.press(ROW(0, 2) + ' [data-ch="rest"]', 'Tab');          // une 2ᵉ retouche, sur le REPOS de la série (zéro écrit) qu'on va DÉPLACER : sa retouche doit la suivre
    await pg.click(ROW(0, 2) + ' [data-ch="num"]'); await pg.waitForTimeout(150);                                          // DÉPLACER : le numéro 3 (le zéro écrit) monte d'un cran, l'assistance descend
    await pg.fill(`#prog-snote-0-0-1`, 'sans lest ce jour');                                                                // un commentaire de série sur la série DÉPLACÉE (le zéro écrit, désormais n°2)
    await pg.waitForTimeout(80);
    await pg.click(ROW(2, 1) + ' [data-ch="supprimer"]'); await pg.waitForTimeout(120);                                      // le bloc A du triceps : on RETIRE sa 2ᵉ série (D-171) …
    await pg.click(CARD(2) + ' button:has-text("+ série")'); await pg.waitForTimeout(120);                                     // … et on en AJOUTE une neuve (copie de la dernière : 30 × 10) : elle prend la place de la retirée, sans histoire
    await pg.click('#ov-prog-edit button[onclick="saveProgEdit()"]'); await pg.waitForTimeout(300);
    await pg.evaluate(() => { closeProgModal(); }); await pg.waitForTimeout(100);
    const LE = await lire(); const pe = LE.progs[0], trE = pe.days[0].exs[0].sets, dcE = pe.days[0].exs[1].sets;
    t('B-SCCX-X2b1 ⭐⭐ l\'éditeur n\'écrit QUE ce qu\'on a touché : la série déplacée emporte SON identité (`sid`), SES états (PDC, zéro), SES commentaires ; les deux retouches (le Développé : charge ET repos ; le repos de la série déplacée) sont marquées (`ed`) sur CES champs de CES séries seulement, plus récentes que la séance A, et la retouche SUIT la série déplacée ; les autres séries n\'ont aucune retouche',
      J(trE.map((s) => [s.sid, s.pdc === undefined ? '' : s.pdc, s.note || ''])) === J([[sidsP[0][0], 12, 'ceinture'], [sidsP[0][2], '', 'sans lest ce jour'], [sidsP[0][1], -20, 'élastique'], [sidsP[0][3], '', 'à confirmer']])
      && dcE[3].kg === 82.5 && dcE[3].rest === 200 && dcE[3].ed && dcE[3].ed.kg > tsAvantRetouche && dcE[3].ed.rest > tsAvantRetouche && !dcE[3].ed.reps && !!trE[1].ed && trE[1].ed.rest > tsAvantRetouche && !trE[1].ed.kg && trE[1].rest === 80 && pe.days.every((d) => d.exs.every((e, ei) => e.sets.every((s, si) => (d === pe.days[0] && ((ei === 1 && si === 3) || (ei === 0 && si === 1))) || !s.ed)))
      && J(dcE.map((s) => s.sid)) === J(sidsP[1]) && pe.id === avantEd.id && pe.days[0].id === avantEd.days[0].id && trE[3].kg === null, js({ tr: trE.map((s) => [s.sid, s.note]), ed: dcE[3].ed }));
    t('B-SCCX-X2b3 ⭐ une série RETIRÉE puis une série AJOUTÉE dans l\'éditeur (bloc A du triceps) : la 1ʳᵉ garde son identité, la neuve n\'en a pas encore (elle la reçoit au chargement) et ne porte aucune retouche ; l\'autre bloc de même nom est intact', pe.days[0].exs[2].sets.length === 2 && pe.days[0].exs[2].sets[0].sid === sidsP[2][0] && !pe.days[0].exs[2].sets[1].sid && !pe.days[0].exs[2].sets[1].ed && J(pe.days[0].exs[2].sets[1]) === J({ kg: 30, reps: 10, type: 'N', rest: 60 }) && J(pe.days[0].exs[3].sets.map((s) => s.sid)) === J(sidsP[3]), js(pe.days[0].exs[2].sets));
    t('B-SCCX-X2b2 le jour 2 (de même libellé) n\'a pas bougé et n\'a toujours pas d\'identité ; la séance A n\'est pas touchée par l\'éditeur', J(pe.days[1]) === J(avantEd.days[1]) && !pe.days[1].id && J(LE.sess) === J(LA.sess), '');
    // un repos de PROGRAMME qui change SANS retouche manuelle (un programme mis à jour par un import / par Milo) : le stand-in direct (aucun `ed`)
    await pg.evaluate(() => { S.programmes[0].days[0].exs[1].sets[2].rest = 90; persist(); });
    await pg.waitForTimeout(40);
    const peT = (await lire()).progs[0];                                                        // le programme tel qu'il est AVANT le 2ᵉ chargement (retouche + repos mis à jour)

    // ═══ X2c · 2ᵉ CHARGEMENT : la progression PAR IDENTITÉ ═══
    console.log('\n─── B-SCCX-X2c · le 2ᵉ chargement du même jour (progression par identité, retouche, repos) ───');
    await charger(0);
    const LB = await lire(); const wB = LB.wkt;
    const ATTB = [
      [[0, 15, '', 6, 'N', 120, 'ceinture'], [0, '', '', 8, 'N', 80, 'sans lest ce jour'], [0, -20, '', 8, 'N', 90, 'élastique'], [null, '', '', 8, 'N', 60, 'à confirmer']],          // l'ordre du PROGRAMME (déplacé) ; PDC+15 = A ; le zéro et l'inconnue restent ce qu'ils sont
      [[0, '', 'V', 12, 'É', 45, 'barre seule'], [60, '', '', 8, 'É', 60, ''], [85, '', '', 5, 'N', 150, 'top'], [82.5, '', '', 4, 'N', 200, '']],                                           // 85 × 5 repos 150 = A (le programme dit 90 sans retouche) · la retouche 82,5 / 200 gagne, les reps (4) viennent de A
      [[32, '', '', 12, 'N', 60, ''], [30, '', '', 10, 'N', 60, '']], [[22, '', '', 18, 'N', 45, ''], [22, '', '', 18, 'N', 45, '']], [[27.5, '', '', 10, 'N', 75, ''], [25, '', '', 10, 'N', 75, '']],      // le bloc A : la 1ʳᵉ série retrouve la sienne (32 × 12), la NEUVE sa prescription (30 × 10) — pas la 32 × 11 de celle qu\'on a retirée
      [[42, '', '', 10, 'N', 90, ''], [36, '', '', 10, 'N', 0, ''], [32, '', '', 10, 'N', 0, '']]];
    t('B-SCCX-X2c1 ⭐⭐⭐ 2ᵉ chargement du jour 0 : les séries retrouvent LEUR séance A PAR IDENTITÉ malgré le déplacement — PDC+15 (la dernière fois, pas le +12 prescrit) · le zéro écrit · l\'assistance · l\'inconnue ; le bloc A (32 × 12, puis la série NEUVE à sa prescription 30 × 10) et le bloc B (22 × 18) ne se croisent pas ; perso 27,5 ; fictif 42',
      J(wB.exs.map(PX)) === J(ATTB), js(wB.exs.map(PX)));
    t('B-SCCX-X2c7 ⭐⭐ une série AJOUTÉE dans l\'éditeur à la place d\'une série RETIRÉE (D-171) n\'hérite PAS de l\'historique de celle qu\'on a retirée : sa dernière fois n\'existe pas, elle s\'ouvre à sa prescription (30 kg × 10, repos 60 s) et non à 32 × 11 (la série retirée) ni à la dernière série répétée',
      J(PX(wB.exs[2])) === J([[32, '', '', 12, 'N', 60, ''], [30, '', '', 10, 'N', 60, '']]) && !!wB.exs[2].sets[1].sid && wB.exs[2].sets[1].sid !== sidsP[2][1], js(PX(wB.exs[2])));
    const dcB = wB.exs[1].sets;
    t('B-SCCX-X2c2 ⭐⭐ D-168 : la retouche manuelle (82,5 kg, repos 200 s) gagne pour SA série et SES deux champs seulement — les répétitions (4) viennent de A, et la série voisine garde sa progression (85 kg × 5) ; le repos des AUTRES séries vient de l\'historique (150 s pour la voisine, malgré le 90 s écrit plus tard dans le programme sans retouche) ; la retouche du repos d\'une série DÉPLACÉE l\'a suivie (80 s, la séance A disait 75)',
      dcB[3].kg === 82.5 && dcB[3].rest === 200 && dcB[3].reps === 4 && dcB[2].kg === 85 && dcB[2].reps === 5 && dcB[2].rest === 150 && wB.exs[0].sets[1].rest === 80 && wB.exs.every((e) => e.sets.every((s) => s.ed === undefined)), js(dcB.map(P)));
    t('B-SCCX-X2c3 ⭐ les identités et les commentaires voyagent dans la séance : mêmes `sid` que le programme dans l\'ordre déplacé, mêmes `exId` ; le commentaire de la série déplacée est là ; le jour reste le jour 0 (`progDayId`)',
      J(wB.exs[0].sets.map((s) => s.sid)) === J(pe.days[0].exs[0].sets.map((s) => s.sid)) && J(wB.exs.map((e) => e.exId)) === J(pe.days[0].exs.map((e) => e.exId)) && wB.progDayId === pe.days[0].id && wB.progId === pe.id && wB.exs[0].sets[1].note === 'sans lest ce jour', '');
    t('B-SCCX-X2c4 le programme n\'est touché par ce chargement QUE par l\'identité de la série neuve (posée paresseusement, une fois) : aucune identité d\'avant n\'est renouvelée, rien d\'autre n\'a changé, l\'historique non plus',
      J(SANS_IDS(LB.progs[0])) === J(SANS_IDS(peT)) && peT.days[0].exs.every((e, i) => e.sets.every((x, k) => !x.sid || x.sid === LB.progs[0].days[0].exs[i].sets[k].sid)) && !!LB.progs[0].days[0].exs[2].sets[1].sid && J(LB.sess) === J(LA.sess), '');

    // ═══ X2c5 · « PRÉCÉDENT » PAR IDENTITÉ — le défaut d'INTERACTION trouvé par ce banc (D-171 déplacer × D-163 identités × D-164 PDC) ═══
    //   La colonne « Précédent », la suggestion grise du champ de charge et le « commentaire de la dernière fois » se rapprochaient par RÔLE et par POSITION (`_prevAligneDetail`) : après qu'une série a été déplacée dans
    //   l'éditeur, la ligne du zéro écrit montrait « 8×PDC−20 » (celle de l'assistance) et son commentaire « élastique », et VALIDER cette série sans rien taper reprenait la suggestion : un zéro devenait « PDC−20 ».
    await voir(0);
    const pv = await pg.evaluate(() => [0, 1, 2, 3].map((i) => { const r = document.getElementById('sr-0-' + i), inp = r.querySelectorAll('.sinp')[1], sp = r.querySelector('.sprev');
      return { prec: ((sp.querySelector('.sprev-n') || {}).textContent || '').trim(), ph: inp.placeholder, val: inp.value, commentaire: sp.classList.contains('a-note') }; }));
    t('B-SCCX-X2c5 ⭐⭐⭐ « Précédent » PAR IDENTITÉ après le DÉPLACEMENT d\'une série : chaque ligne montre SA série d\'avant — la ligne du zéro écrit (déplacée) dit « 8×0 » (pas « 8×PDC−20 », celle de l\'assistance), sa suggestion grise n\'est pas « PDC−20 » et elle ne reçoit PAS le commentaire « élastique » de sa voisine ; la ligne de l\'assistance garde le sien',
      pv[0].prec === '6×PDC+15' && pv[0].commentaire && pv[1].prec === '8×0' && pv[1].ph !== 'PDC−20' && !pv[1].commentaire && pv[2].prec === '8×PDC−20' && pv[2].val === 'PDC−20' && pv[2].commentaire && pv[3].prec === '8×?' && pv[3].commentaire, js(pv));
    const zAv = (await lire()).wkt.exs[0].sets[1];
    await pg.click(CHK(0, 1)); await pg.waitForTimeout(120); const zPend = (await lire()).wkt.exs[0].sets[1]; await pg.evaluate(() => { stopRest(); });
    await pg.click(CHK(0, 1)); await pg.waitForTimeout(120); await pg.evaluate(() => { stopRest(); }); const zApres = (await lire()).wkt.exs[0].sets[1];
    t('B-SCCX-X2c6 ⭐⭐⭐ valider la série du zéro écrit (déplacée), sans rien taper, ne lui donne PAS le PDC−20 de sa voisine : elle reste à 0 kg, sans `pdc` (D-164 : un PDC n\'est jamais attribué que par un choix) ; la dévalider la remet exactement comme elle était',
      zPend.done === true && zPend.pdc === undefined && zPend.kg === 0 && zApres.done === false && J(P(zApres)) === J(P(zAv)) && zApres.sid === zAv.sid, js({ zAv: P(zAv), zPend: P(zPend), zApres: P(zApres) }));

    // ═══ X2d · SÉANCE B : pointer, répondre au RIR, SUPPRIMER une série (lot 3) sans toucher aux autres ═══
    console.log('\n─── B-SCCX-X2d · la séance B : pointer, RIR, supprimer une série, enregistrer en programme, terminer ───');
    await voir(0);
    const fB = await feuille(0);
    t('B-SCCX-X2d0 ⭐ la feuille « Quelle série supprimer ? » du 2ᵉ chargement (états venus de l\'HISTORIQUE par identité) dit « PDC+15kg » (la dernière fois), « — kg », « PDC−20kg », « — kg » dans l\'ordre du programme', !!fB && J(fB.lignes.map((l) => l.txt)) === J(wB.exs[0].sets.map(LIGNE)) && /^Normal · 6 × PDC\+15kg$/.test(fB.lignes[0].txt) && /PDC−20kg/.test(fB.lignes[2].txt), js(fB && fB.lignes));
    await fermerFeuille();
    await taper(KG(0, 0), '17.5');                                                            // le lest : 15 (repris de A) → 17,5 (un record)
    await valider(0, 0, true);
    await pg.click('#rest-rir button[onclick="setRir(0,0,3)"]'); await pg.waitForTimeout(100); await pg.evaluate(() => { stopRest(); });
    await valider(0, 3, true);                                                                // l'inconnue (dernière série) : sa question du RIR reste EN ATTENTE
    const avDel = (await lire()).wkt;
    const attente = await pg.evaluate(() => ({ btn: !!document.querySelector('#rest-rir button[onclick="setRir(0,3,1)"]'), cible: JSON.parse(JSON.stringify(_rirCible || null)) }));
    await ouvrirMenu(0);
    await pg.evaluate(() => { [...document.querySelectorAll('#ov-ex-menu button')].find((e) => /Supprimer une série/.test(e.textContent)).click(); }); await pg.waitForTimeout(150);
    const fab0 = await fab();
    await pg.click('#ov-ex-menu button[onclick="supprimerSerie(0,2)"]'); await pg.waitForTimeout(250);                  // l'assistance (n°3, non pointée) : un toucher sur sa ligne
    const apDel = await lire(); const wD = apDel.wkt;
    t('B-SCCX-X2d1 ⭐⭐⭐ SUPPRIMER la série choisie (l\'assistance, n°3, non pointée) : elle seule part, tout de suite ; les trois autres sont les MÊMES objets (identité `sid`, commentaires, PDC+17,5, zéro, inconnue, RIR 3, repos, pointage, ordre) ; les autres exercices, le programme et l\'historique sont intacts ; c\'est sur le disque',
      wD.exs[0].sets.length === 3 && J(wD.exs[0].sets) === J(avDel.exs[0].sets.filter((_, i) => i !== 2)) && J(wD.exs[0].sets.map((s) => s.sid)) === J([pe.days[0].exs[0].sets[0].sid, pe.days[0].exs[0].sets[1].sid, pe.days[0].exs[0].sets[3].sid])
      && wD.exs[0].sets[0].rir === 3 && wD.exs[0].sets[0].pdc === 17.5 && wD.exs[0].sets[1].note === 'sans lest ce jour' && wD.exs[0].sets[2].note === 'à confirmer' && wD.exs[0].sets[2].kg === null
      && J(wD.exs.slice(1)) === J(avDel.exs.slice(1)) && J(apDel.progs) === J(LB.progs) && J(apDel.sess) === J(LB.sess) && J(apDel.wktDisque.exs[0].sets.map((s) => s.sid)) === J(wD.exs[0].sets.map((s) => s.sid)) && !(await confirmOuvert()), js(wD.exs[0].sets.map(P)));
    t('B-SCCX-X2d2 ⭐⭐ la question du RIR en attente (la série « inconnue », 4ᵉ → désormais 3ᵉ) SUIT sa série : elle est recalée, et la réponse « 1 » va à CETTE série — pas à sa voisine (le zéro écrit) ni à la 1ʳᵉ (qui garde son RIR 3)',
      attente.btn && await pg.evaluate(() => !!document.querySelector('#rest-rir button[onclick="setRir(0,2,1)"]') && !document.querySelector('#rest-rir button[onclick="setRir(0,3,1)"]')), js(attente));
    await pg.click('#rest-rir button[onclick="setRir(0,2,1)"]'); await pg.waitForTimeout(100); await pg.evaluate(() => { stopRest(); });
    const apRir = (await lire()).wkt.exs[0].sets;
    t('B-SCCX-X2d3 la réponse est sur la bonne série : RIR 3 (n°1) · aucun RIR (le zéro écrit) · RIR 1 (l\'inconnue) ; la charge inconnue est TOUJOURS inconnue après tout ça (null)', J(apRir.map((s) => s.rir === undefined ? '' : s.rir)) === J([3, '', 1]) && apRir[2].kg === null && apRir[0].pdc === 17.5, js(apRir.map(P)));
    t('B-SCCX-X2d4 règle d\'or #9 : le bouton central « + » n\'a pas bougé pendant ouverture de la feuille puis suppression', fab0 === refFab && await fab() === refFab, fab0 + ' | ' + refFab);
    // le reste de la séance : la 4ᵉ série du Développé (la retouche) est changée à la main, puis tout est pointé
    await voir(1); await taper(KG(1, 3), '87.5');
    await pg.evaluate(() => { S.wkt.exs.forEach((e, ei) => e.sets.forEach((s, si) => { if (!s.done) { toggleSet(ei, si); } })); stopRest(); persist(); });
    t('B-SCCX-X2d5 toutes les séries restantes sont pointées sans rien changer aux états de charge (les kilos tapés restent, l\'inconnue reste inconnue, « à vide » reste « à vide »)',
      await pg.evaluate(() => S.wkt.exs.every((e) => e.sets.every((s) => s.done)) && S.wkt.exs[0].sets[2].kg === null && S.wkt.exs[1].sets[0].vide === true && S.wkt.exs[1].sets[3].kg === 87.5), '');

    // ═══ X3 · D-176 : l'en-tête global, PENDANT cette séance, une fois ses séries pointées (« Terminer » est alors proposé) (Accueil → Séance → Progrès → Nutrition → Coach → Profil → Accueil, puis un écran FUTUR) ═══
    console.log('\n─── B-SCCX-X3 · l\'en-tête global pendant la séance B (D-176, règle d\'or #9) ───');
    const mesure = () => pg.evaluate(() => {
      const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, b: r.bottom }; };
      const vu = (e) => { if (!e) return false; for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const tb = document.querySelector('.topbar'), sc = document.querySelector('.screens'), act = document.querySelector('.screen.active'), fin = document.querySelector('.topbar .tbs-fin');
      let reach = false; if (fin && vu(fin)) { const r = fin.getBoundingClientRect(); const c = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); reach = !!c && (c === fin || fin.contains(c)); }
      const nb = [...document.querySelectorAll('.nav .nb')].map((e) => { const r = e.getBoundingClientRect(), c = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return vu(e) && !!c && (c === e || e.contains(c)); });
      return { ecran: window._curScreen, tbAff: !!tb && getComputedStyle(tb).display !== 'none', tbH: tb ? tb.getBoundingClientRect().height : null, logo: vu(document.getElementById('tb-logo')), seance: vu(document.getElementById('tb-seance')), fin: vu(fin), reach,
        screens: R(sc), actif: R(act), fab: R(document.getElementById('nb-log')), nb, vh: document.documentElement.clientHeight, scrollX: act ? act.scrollWidth - act.clientWidth : null, seanceOuverte: !!S.wkt }; });
    const bandeVide = (m) => m.screens && Math.abs(m.screens.y) < 0.6 && Math.abs(m.screens.b - m.vh) < 0.6 && m.actif && Math.abs(m.actif.y) < 0.6;
    await pg.click('#nb-home'); await pg.waitForTimeout(350);
    const h0 = await mesure();
    t('B-SCCX-X3a ⭐ ACCUEIL, séance B en cours : l\'en-tête global est là (logo, haut de page) et l\'écran commence juste dessous', h0.tbAff && h0.tbH > 40 && h0.logo && h0.seanceOuverte && Math.abs(h0.screens.y - h0.tbH) < 0.6 && h0.nb.every(Boolean) && h0.ecran === 'home', js(h0));
    const tour = [];
    for (const e of ['log', 'progress', 'nutrition', 'coach', 'setup']) {
      if (e === 'setup') {                                                                       // le dernier onglet ouvre le MENU (un tiroir) : on y va par la navigation, puis on vérifie que l'onglet existe et ouvre bien le tiroir
        await pg.evaluate(() => { goScreen('setup', document.getElementById('nb-setup')); }); await pg.waitForTimeout(450);
      } else { await pg.click('#nb-' + e); await pg.waitForTimeout(450); }
      const m = await mesure(); tour.push([e, m]);
    }
    await pg.evaluate(() => { try { closeMenuDrawer(); } catch (e) {} });
    t('B-SCCX-X3b ⭐⭐ pendant la séance, Séance → Progrès → Nutrition → Coach → Profil : l\'en-tête GLOBAL (logo) n\'est visible sur AUCUN ; hors de la Séance plus aucune barre du tout ; l\'écran occupe toute la hauteur — aucune bande vide en haut',
      tour.every(([e, m]) => m.ecran === e && !m.logo && m.seanceOuverte && (e === 'log' ? m.tbAff && m.seance : (!m.tbAff && m.tbH === 0 && bandeVide(m)))) && tour[0][1].tbAff, js(tour.map(([e, m]) => [e, m.ecran, m.tbAff, m.logo, m.tbH])));
    t('B-SCCX-X3c ⭐⭐ sur la Séance, « Terminer » reste là, atteignable au toucher et de taille tactile (≥ 40 px), l\'écran commence juste sous l\'en-tête de séance',
      tour[0][1].fin && tour[0][1].reach && Math.abs(tour[0][1].screens.y - tour[0][1].tbH) < 0.6 && tour[0][1].tbH >= 40, js(tour[0][1]));
    t('B-SCCX-X3d ⭐⭐⭐ règle d\'or #9 (mesurée, en pixels) : le bouton central « + » est EXACTEMENT au même endroit sur l\'Accueil et sur les cinq autres écrans ; les six onglets restent visibles et atteignables ; aucun défilement horizontal parasite',
      tour.every(([e, m]) => J(m.fab) === J(h0.fab) && m.nb.length === 6 && m.nb.every(Boolean) && (m.scrollX === 0 || m.scrollX === null)), js({ accueil: h0.fab, fabs: tour.map(([e, m]) => m.fab) }));
    await pg.click('#nb-home'); await pg.waitForTimeout(350);
    const h1 = await mesure();
    t('B-SCCX-X3e ⭐ RETOUR à l\'Accueil : l\'en-tête global est RESTAURÉ au même endroit, la séance n\'a pas bougé', h1.tbAff && h1.logo && J(h1.fab) === J(h0.fab) && Math.abs(h1.tbH - h0.tbH) < 0.6 && h1.seanceOuverte, js(h1));
    const futur = await pg.evaluate(async () => { const d = document.createElement('div'); d.className = 'screen'; d.id = 's-futurx'; d.innerHTML = '<h2 id="titre-futurx">Écran futur</h2><div class="scroll-spacer"></div>'; document.querySelector('.screens').appendChild(d);
      goScreen('futurx', null); await new Promise((r) => setTimeout(r, 350));
      const m = (() => { const tb = document.querySelector('.topbar'), sc = document.querySelector('.screens').getBoundingClientRect(), r = document.getElementById('nb-log').getBoundingClientRect(); return { tb: getComputedStyle(tb).display, tbH: tb.getBoundingClientRect().height, y: sc.top, fab: [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 100) / 100).join(','), titre: document.getElementById('titre-futurx').getBoundingClientRect().height > 0 }; })();
      goScreen('home', document.getElementById('nb-home')); await new Promise((r) => setTimeout(r, 300)); document.getElementById('s-futurx').remove(); return m; });
    t('B-SCCX-X3f ⭐⭐ un écran FUTUR inventé par le banc (absent de toute liste) : en-tête global masqué, aucune bande vide, bouton central immobile, son titre visible — sans qu\'on ait rien à lui déclarer', futur.tb === 'none' && futur.tbH === 0 && Math.abs(futur.y) < 0.6 && futur.fab === refFab && futur.titre, js(futur));

    // « Sauvegarder comme programme » depuis cette séance (lot 2 : pdc, note, vide, null recopiés) — vrais gestes dans « Mes programmes »
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); openProgModal(); }); await pg.waitForTimeout(200);
    await pg.fill('#prog-name-inp', 'Copie fictive X'); await pg.click('#mod-prog button[onclick="saveAsProg()"]'); await pg.waitForTimeout(250);
    await pg.evaluate(() => { closeProgModal(); });
    const LS = await lire(); const cp = LS.progs.find((p) => p.name === 'Copie fictive X');
    const ATTCP = [
      [[0, 17.5, '', 6, 'N', 120, 'ceinture'], [0, '', '', 8, 'N', 80, 'sans lest ce jour'], [null, '', '', 8, 'N', 60, 'à confirmer']],
      [[0, '', 'V', 12, 'É', 45, 'barre seule'], [60, '', '', 8, 'É', 60, ''], [85, '', '', 5, 'N', 150, 'top'], [87.5, '', '', 4, 'N', 200, '']],
      [[32, '', '', 12, 'N', 60, ''], [30, '', '', 10, 'N', 60, '']], [[22, '', '', 18, 'N', 45, ''], [22, '', '', 18, 'N', 45, '']], [[27.5, '', '', 10, 'N', 75, ''], [25, '', '', 10, 'N', 75, '']],
      [[42, '', '', 10, 'N', 90, ''], [36, '', '', 10, 'N', 0, ''], [32, '', '', 10, 'N', 0, '']]];
    t('B-SCCX-X2d6 ⭐⭐⭐ « Sauvegarder comme programme » (la séance en cours, une série supprimée) recopie chaque état SANS rien convertir : PDC+17,5 · le zéro · l\'inconnue en `null` (pas 0) · « à vide » · kilos ; les commentaires de série et d\'exercice voyagent ; le dropset (réglage) aussi ; la série supprimée n\'est pas là',
      !!cp && J((cp.exs || []).map(PX)) === J(ATTCP) && J(cp.exs[5].dropset) === J({ paliers: 2, pct: 10, direction: 'down' }) && cp.exs[2].note === 'Bloc A' && cp.exs[3].note === 'Bloc B' && cp.prescrit === true && !cp.exs.some((e) => e.sets.some((s) => s.ed || s.sid)), js(cp && cp.exs.map(PX)));
    t('B-SCCX-X2d7 le programme d\'origine n\'est pas touché par cet enregistrement sous un autre nom (4 séries de Tractions, la déplacée à sa place)', J(LS.progs[0]) === J(LB.progs[0]), '');

    await voir(0);
    const clicT2 = await pg.evaluate(() => { const r = document.querySelector('.topbar .tbs-fin').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await pg.mouse.click(clicT2.x, clicT2.y); await pg.waitForTimeout(900);
    const recapB = await pg.evaluate(() => ({ ouvert: document.getElementById('ov-session-end').classList.contains('open'), txt: document.getElementById('se-stats').innerText.replace(/\s+/g, ' ') }));
    await pg.evaluate(() => { closeSessionEnd('home'); }); await pg.waitForTimeout(300);
    const LF = await lire();
    const B = LF.sess.find((s) => s.progId === pe.id && s !== undefined && s.id !== A.id);
    t('B-SCCX-X2e1 ⭐⭐ la séance B enregistrée (vrai « Terminer ») : jour 0, identités du programme (3 séries de Tractions, la supprimée absente), états de charge tels quels, RIR sur les bonnes séries, commentaires, retouche 87,5 ; le disque la porte',
      recapB.ouvert && !!B && LF.sess.length === 3 && LF.sessDisque.length === 3 && B.progDayId === pe.days[0].id && J(B.exs[0].sets.map((s) => s.sid)) === J([pe.days[0].exs[0].sets[0].sid, pe.days[0].exs[0].sets[1].sid, pe.days[0].exs[0].sets[3].sid])
      && J(B.exs[0].sets.map((s) => [s.kg, s.pdc === undefined ? '' : s.pdc, s.rir === undefined ? '' : s.rir, s.note || ''])) === J([[0, 17.5, 3, 'ceinture'], [0, '', '', 'sans lest ce jour'], [null, '', 1, 'à confirmer']]) && B.exs[1].sets[3].kg === 87.5 && B.exs[1].sets[0].vide === true, js(B && B.exs[0].sets.map(P)));
    const volB = 105 + (85 * 5 + 87.5 * 4) + (32 * 12 + 30 * 10) + 792 + 525 + 1100;           // 17,5×6 · 85×5+87,5×4 · bloc A (32×12 + la série neuve 30×10) · bloc B · perso · fictif
    t('B-SCCX-X2e2 ⭐⭐ tonnage avec lest après une suppression : 17,5 × 6 = 105 de lest (l\'ancienne assistance supprimée ne change rien, le zéro et l\'inconnue : 0) ; volume enregistré = refait ici ; chaque ancienne séance garde SON volume (A : 4 008)',
      B.volume === Math.round(volB) && TONNAGE(B, true) === volB && TONNAGE(B, true) - TONNAGE(B, false) === 105 && LF.sess.find((s) => s.id === A.id).volume === volA, js({ volume: B.volume, att: volB }));
    t('B-SCCX-X2e3 ⭐⭐ le RECORD DE LEST bat l\'ancien (+17,5 contre +15 × 6) et le récapitulatif le DIT (« Record de lest … Tractions (Pull-up) +17.5 kg × 6 ») ; aucun record de charge pour le PDC', /Record de lest/i.test(recapB.txt) && /Tractions \(Pull-up\) \+17[.,]5 kg × 6/i.test(recapB.txt) && await pg.evaluate(() => _recordLest('Tractions (Pull-up)').lest === 17.5 && !S.prs['Tractions (Pull-up)']), recapB.txt.slice(0, 300));
    t('B-SCCX-X2e4 ⭐ le passé est INTACT après toute la séance B : la séance A et la séance libre d\'il y a 10 jours sont identiques octet pour octet', J(LF.sess.find((s) => s.id === A.id)) === J(A) && J(LF.sess.find((s) => !s.progId)) === J(avantTout.sess[0]), '');

    // l'export (CSV) et le contexte de Milo (fonction locale — AUCUN appel au modèle), sur la séance B
    const sortie = await pg.evaluate(async () => { const ctx = String(buildCoachContext('test')); const lig = _histoLignes(false); const o = window._donnerFichier; let csv = '';
      window._donnerFichier = async (c) => { csv = c; return 'ok'; }; _histoAvecDebriefs = false; window.closeHistoExport = window.closeHistoExport || function () {}; await exportHistoCsv(); window._donnerFichier = o;
      const sid = S.sessions.find((s) => s.progId && s.exs[0].sets.length === 3).id;
      return { ctx: (ctx.match(/Tractions \(Pull-up\): [^\n]*/g) || []), dc: (ctx.match(/Développé Couché: [^\n]*/g) || []), lig: lig.filter((r) => r.exercise === 'Tractions (Pull-up)').map((r) => [r.kg, r.volume, r.charge === undefined ? '' : r.charge, r.setNumber === undefined ? '' : r.setNumber, r.date]), csv: csv.replace(/^﻿/, '').split('\n').length, sid }; });
    t('B-SCCX-X2f1 ⭐⭐ Milo (contexte construit en LOCAL, aucun appel au modèle) lit la séance B sans inventer : « S1 PDC+17.5kg×6 … · S2 0×8 … · S3 ?×8 » (lest · zéro écrit · inconnue, avec leur RIR et leurs commentaires) ; « à vide » se dit « à vide » ; aucun kilo inventé pour le PDC',
      sortie.ctx.some((l) => /S1 PDC\+17\.5kg×6[^·]*· S2 0×8[^·]*· S3 \?×8/.test(l)) && sortie.dc.some((l) => /à vide×12/.test(l)) && !sortie.ctx.some((l) => /PDC\+17\.5kg×6[^·]*· S2 \?×8/.test(l)) && sortie.ctx.every((l) => !/PDC\+17\.5kg×[0-9]*\s*kg/.test(l)) && sortie.ctx.filter((l) => /PDC\+17\.5kg/.test(l)).every((l) => !/\b99\b/.test(l)), js(sortie.ctx.slice(0, 3)));   // ORACLE REFAIT le 17/11 (lot H) : l'ancienne séance libre des Tractions (99) est désormais DANS l'historique — le contexte de Milo la raconte légitimement sur SA ligne ; ce qui est interdit, c'est que ce 99 passe dans la lecture de la séance B (la ligne qui dit « PDC+17.5kg »)
    const tr = sortie.lig.filter((r) => r[4] === LF.sess.find((s) => s.id === B.id).date || true);
    t('B-SCCX-X2f2 ⭐⭐ l\'export dit PDC / lest sans inventer : pour la séance B la ligne du lest porte « PDC+17.5 kg » et un volume de 105, le zéro écrit n\'a pas de volume, la charge INCONNUE a une colonne `kg` VIDE (jamais « 0 ») ; une seule ligne d\'export par série (la série supprimée n\'a plus de ligne)',
      sortie.lig.filter((r) => r[2] === 'PDC+17.5 kg' && r[1] === 105).length === 1 && sortie.lig.some((r) => r[0] === '' && r[2] === '') && sortie.lig.filter((r) => r[2] === 'PDC−20 kg').length === 1 && sortie.csv > 5, js(sortie.lig));
    t('B-SCCX-X2f3 ⛔ aucun appel au modèle ni au Worker n\'est parti de tout le parcours (X1 → X3) : toute requête hors du serveur local est COUPÉE (le banc la note : la synchronisation de l\'app tente de partir, elle est refusée) ; aucune n\'était une demande à Milo (`coach`) ni ne visait l\'IA', dehors.every((d) => d.a !== 'coach' && !/anthropic/.test(d.u)), js(dehors.filter((d) => d.a === 'coach' || /anthropic/.test(d.u)).slice(0, 4)));

    // ═══ X2g · UN VRAI rechargement de la page, puis le 3ᵉ chargement : le jour 0 reprend B, l'AUTRE jour « HAUT » reste à sa prescription ═══
    console.log('\n─── B-SCCX-X2g · rechargement réel, 3ᵉ chargement, l\'autre jour de même libellé ───');
    await pg.reload({ waitUntil: 'load' }); await pg.waitForTimeout(1600); await tidy();
    const apRel = await lire();
    t('B-SCCX-X2g0 ⭐ après un VRAI rechargement : le programme (avec ses identités, sa retouche `ed` et la série déplacée), les 3 séances et le programme enregistré sous un autre nom sont là, tels que le disque les portait', J(apRel.progs) === J(LS.progs) && J(apRel.sess) === J(LF.sess) && !apRel.wkt, js({ progs: apRel.progs.length, sess: apRel.sess.length }));
    await charger(0);
    const w3 = (await lire()).wkt;
    const ATT3 = [
      [[0, 17.5, '', 6, 'N', 120, 'ceinture'], [0, '', '', 8, 'N', 80, 'sans lest ce jour'], [0, -20, '', 8, 'N', 90, 'élastique'], [null, '', '', 8, 'N', 60, 'à confirmer']],         // l'assistance, supprimée de B, retrouve sa PRESCRIPTION ; le lest vient de B (17,5)
      [[0, '', 'V', 12, 'É', 45, 'barre seule'], [60, '', '', 8, 'É', 60, ''], [85, '', '', 5, 'N', 150, 'top'], [87.5, '', '', 4, 'N', 200, '']]];                                       // la retouche (82,5) est plus ANCIENNE que B : la progression habituelle reprend (87,5)
    t('B-SCCX-X2g1 ⭐⭐⭐ 3ᵉ chargement du jour 0 : la dernière séance TERMINÉE de CE jour est B (PDC+17,5 · 87,5 × 4) — la retouche, désormais plus ancienne que B, ne gagne plus ; la série SUPPRIMÉE de B retrouve sa prescription (PDC−20) au lieu d\'une valeur d\'ailleurs ; le zéro et l\'inconnue restent ce qu\'ils sont',
      J(w3.exs.slice(0, 2).map(PX)) === J(ATT3) && w3.progDayId === pe.days[0].id, js(w3.exs.slice(0, 2).map(PX)));
    const pv3 = await pg.evaluate(() => [0, 1, 2, 3].map((i) => { const sp = document.getElementById('sr-0-' + i).querySelector('.sprev'); const n = sp.querySelector('.sprev-n'); return { prec: ((n || sp.querySelector('.sprev-v') || {}).textContent || '').trim(), commentaire: sp.classList.contains('a-note') }; }));
    t('B-SCCX-X2g1b ⭐⭐ « Précédent » après une SUPPRESSION (D-173) : la séance d\'avant (B) n\'a que 3 séries de Tractions ; la série supprimée (n°3) n\'a pas de dernière fois — « — », elle n\'emprunte pas celle de sa voisine ; l\'inconnue (n°4) retrouve SA ligne (« 8×? » + son commentaire « à confirmer ») ; le zéro (n°2) la sienne (« 8×0 » + son commentaire) ; le lest dit « 6×PDC+17.5 »',
      pv3[0].prec === '6×PDC+17.5' && pv3[0].commentaire && pv3[1].prec === '8×0' && pv3[1].commentaire && pv3[2].prec === '—' && !pv3[2].commentaire && pv3[3].prec === '8×?' && pv3[3].commentaire, js(pv3));
    await charger(1);
    const w4 = (await lire()).wkt;
    t('B-SCCX-X2g2 ⭐⭐⭐ l\'AUTRE jour du même programme, de MÊME LIBELLÉ (« HAUT »), jamais fait : il s\'ouvre avec SA prescription (PDC+5 · 70 kg), pas avec la séance du jour 0 — la séance d\'il y a 10 jours (99) n\'y est pas non plus ; il reçoit alors ses identités',
      J(w4.exs.map(PX)) === J([[[0, 5, '', 5, 'N', 100, '']], [[70, '', '', 6, 'N', 120, '']]]) && !!(await lire()).progs[0].days[1].id && (await lire()).progs[0].days[1].id !== pe.days[0].id, js(w4.exs.map(PX)));
    t('B-SCCX-X2g3 aucune erreur de page pendant tout le fil (X1 → X3)', errs.length === 0, errs.slice(0, 3).join(' | '));
    await cx.close();
  });
}

/* ══════════════════════════════════════ X4 · D-170 sur le même fil : pendant « Terminer », rien ne se recharge ; l'opération se termine ══════════════════════════════════════ */
async function maj(t, b) {
  console.log('\n═══ B-SCCX-M (D-170 sur le fil). « TERMINER » PENDANT UNE MISE À JOUR, LE CORPS DE LA RÉPONSE FIGÉ ═══');
  const SEUL = (process.env.SCCX_SEUL || '').split(',').filter(Boolean);
  const garde = async (nom, f) => { if (SEUL.length && SEUL.indexOf(nom) < 0) return; try { await f(); } catch (e) { t('B-SCCX-' + nom + ' ⛔ le scénario s\'est exécuté jusqu\'au bout', false, String(e && e.stack || e).slice(0, 700)); } };
  await garde('M', async () => {
    const sc = await mvAide.ouvrir(b); const g = await sm.brancher(sc); await sm.annoncerBilans(sc.pg); const net = await reseau();
    const { pg } = sc;
    const fin = async () => { try { net.fermer(); } catch (e) {} await sc.fermer(); };
    try {
      await pg.evaluate(([u, prog, old, cuex]) => { S.url = u; S.connected = true; S.customExercises = cuex; S.programmes = [prog]; S.sessions = [old]; S.wkt = null; persist(); window.__toasts = []; const v = window.toast; window.toast = function (m, ty) { window.__toasts.push(String(m)); return v.apply(this, arguments); }; }, [net.url, PROG(), OLD(), CUEX]);
      await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); _loadProgDayVraiment(0, 0); });
      await dormir(400);
      const charge = await pg.evaluate(() => JSON.parse(JSON.stringify(S.wkt)));
      await pg.evaluate(() => { S.wkt.exs.forEach((e, ei) => e.sets.forEach((s, si) => { if (!s.done) toggleSet(ei, si); })); stopRest(); persist(); });
      t('B-SCCX-M0 le contrôle : le jour 0 du programme fictif est chargé (les mêmes états de charge que X1) et toutes ses séries sont pointées', J(charge.exs[0].sets.map((s) => [s.kg, s.pdc === undefined ? '' : s.pdc])) === J([[0, 12], [0, -20], [0, ''], [null, '']]) && await pg.evaluate(() => S.wkt.exs.every((e) => e.sets.every((s) => s.done))), '');
      await marquer(pg); await publier(sc); const recu = await recue(sc); await calme(sc, 1);
      t('B-SCCX-M1 le contrôle : la mise à jour est reçue PENDANT la séance et ATTEND (la page est toujours la même)', recu && await sm.vivant(pg), '');
      await allerA(pg, 'log');
      net.mode = 'corps-fige';
      const pos = await pg.evaluate(() => { const r = document.querySelector('.topbar .tbs-fin').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await pg.mouse.click(pos.x, pos.y);                                                       // un VRAI toucher sur « Terminer » : la réponse du serveur envoie ses en-têtes puis fige son corps
      await attendre(async () => net.enTetes >= 1, 15000, 100); await dormir(400);
      const e1 = await sm.etat(pg), a1 = await sm.tient(pg, 600);
      t('B-SCCX-M2 ⛔⛔ « Terminer » pendant la mise à jour reçue, en-têtes arrivés, corps figé : la séance est DÉJÀ enregistrée (mémoire + stockage, avec son jour et ses identités), le verrou est posé, l\'écran de fin n\'est pas ouvert et AUCUN rechargement ne tombe',
        e1.fin === true && !e1.recap && e1.n === 2 && e1.stock === 2 && sm.vide(e1.wkt) && a1.ok, js({ fin: e1.fin, recap: e1.recap, n: e1.n, stock: e1.stock, attaque: a1.a }));
      await pg.evaluate((ms) => { if (!window.__nowReel) window.__nowReel = Date.now.bind(Date); Date.now = () => window.__nowReel() + ms; }, 130000);        // l'horloge de la page avance de 130 s, l'opération n'a pas fini
      const a2 = await sm.tient(pg, 600), e2 = await sm.etat(pg);
      t('B-SCCX-M3 ⛔⛔ 130 s plus tard (l\'horloge avance, le corps est toujours figé) : le verrou n\'est PAS levé par le temps — aucun rechargement (l\'ancien « filet » de 120 s rechargeait ici, sans récapitulatif)', e2.fin === true && !e2.recap && a2.ok, js({ fin: e2.fin, recap: e2.recap, attaque: a2.a }));
      await pg.evaluate(() => { if (window.__nowReel) Date.now = window.__nowReel; });
      const fini = await attendre(async () => (await sm.etat(pg)).recap, 25000, 200);
      const e3 = await sm.etat(pg), tx = await pg.evaluate(() => window.__toasts.slice());
      const v = net.vus.filter((x) => x.action === 'logSession')[0] || {};
      const ban3 = await lireBandeau(pg);
      t('B-SCCX-M4 ⛔⛔ le DÉLAI (8 s, corps compris) TERMINE l\'opération : le verrou se lève, l\'écran de fin s\'ouvre, la requête est RÉELLEMENT annulée côté serveur, l\'issue est DITE (« Réseau trop lent — ta séance est gardée »), la séance est marquée à renvoyer (`synced:false`) ; le récapitulatif ouvert retient encore la mise à jour (aucun bandeau)',
        fini && e3.fin === false && e3.recap && v.coupe === true && v.fini === false && tx.some((m) => /Réseau trop lent — ta séance est gardée/.test(m)) && await pg.evaluate(() => S.sessions[0].synced) === false && !voit(ban3), js({ fini, fin: e3.fin, recap: e3.recap, serveur: v, toasts: tx.slice(-3) }));
      const a4 = await sm.tient(pg, 900);
      t('B-SCCX-M4b ⛔⛔ le récapitulatif ouvert (opération finie, séance gardée) retient ENCORE la mise à jour : attaquée par tous les chemins qui rechargent (persist, rechargement du service worker, « Mettre à jour »…), la page reste la même', a4.ok && (await sm.etat(pg)).recap, js(a4.a));
      const gardee = await pg.evaluate(() => { const s = S.sessions.find((x) => x.progId); const p = S.programmes[0];
        return { jour: s && s.progDayId === p.days[0].id, sids: s && JSON.stringify(s.exs.map((e) => e.sets.map((x) => x.sid))) === JSON.stringify(p.days[0].exs.map((e) => e.sets.map((x) => x.sid))), etats: s && JSON.stringify(s.exs[0].sets.map((x) => [x.kg, x.pdc === undefined ? '' : x.pdc, x.note || ''])), vol: s && s.volume,
          disque: (JSON.parse(localStorage.getItem('ft4_sessions') || '[]').find((x) => x.progId) || {}).progDayId }; });
      t('B-SCCX-M5 ⭐⭐ la séance GARDÉE malgré le délai porte tout : le jour (`progDayId`), les identités de séries du programme, les états (PDC+12, −20, zéro, null) et leurs commentaires, et le disque la porte', gardee.jour && gardee.sids && gardee.etats === J([[0, 12, 'ceinture'], [0, -20, 'élastique'], [0, '', ''], [null, '', 'à confirmer']]) && gardee.disque === await pg.evaluate(() => S.programmes[0].days[0].id), js(gardee));
      net.mode = 'ok';
      await pg.evaluate(() => { closeSessionEnd('home'); });
      /* M6 RÉÉCRIT le 17/11/2026 (lot M, D-170 : plus de rechargement automatique, même sur l'Accueil). AVANT : « le récapitulatif fermé, sur l'Accueil : la mise à jour s'applique ENFIN » (toute seule). INVARIANT GARDÉ : la séance
         est INTACTE après le redémarrage (2 séances, jour reconnu). CHANGÉ : fermé, elle se PROPOSE (bandeau) sans recharger, c'est le choix « Mettre à jour » de la personne qui l'applique. */
      await attendre(async () => voit(await lireBandeau(pg)), 10000, 200);
      const bnM6 = await lireBandeau(pg), taM6 = await sm.tientAuto(pg, 1500), okM6 = await sm.cliquerMaj(pg);
      const rech = okM6 && await rechargee(pg, 25000); await dormir(400); await mvAide.poser(pg, 1);
      const ap = await pg.evaluate(() => ({ n: S.sessions.length, wkt: S.wkt, prog: S.programmes[0].days[0].id }));
      t('B-SCCX-M6 ⛔ le récapitulatif fermé, sur l\'Accueil : la mise à jour est PROPOSÉE (bandeau) sans rechargement automatique, le choix « Mettre à jour » l\'applique (c\'est la personne qui a vu ce qu\'elle a fait), et la séance est INTACTE après le redémarrage (2 séances, jour reconnu)', voit(bnM6) && taM6.ok && okM6 && rech && ap.n === 2 && sm.vide(ap.wkt) && ap.prog === gardee.disque, js({ ...ap, bandeau: voit(bnM6), vivant: taM6.ok, clic: okM6 }));
      // la chaîne continue : le jour est repris de CETTE séance (lot 1), les états de charge aussi (lot 2) — après le redémarrage, depuis le disque
      await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); _loadProgDayVraiment(0, 0); }); await dormir(400);
      const rep = await pg.evaluate(() => JSON.parse(JSON.stringify(S.wkt)));
      t('B-SCCX-M7 ⭐ après le redémarrage, le jour est repris de la séance gardée : mêmes états de charge (PDC+12 · −20 · zéro · null), mêmes commentaires ; l\'AUTRE jour de même libellé reste à sa prescription',
        J(rep.exs[0].sets.map((s) => [s.kg, s.pdc === undefined ? '' : s.pdc, s.note || ''])) === J([[0, 12, 'ceinture'], [0, -20, 'élastique'], [0, '', ''], [null, '', 'à confirmer']]) && await pg.evaluate(() => { _loadProgDayVraiment(0, 1); return S.wkt.exs[0].sets[0].pdc === 5 && S.wkt.exs[1].sets[0].kg === 70; }), js(rep.exs[0].sets.map(P)));
      t('B-SCCX-M8 0 erreur JS de page pendant tout le parcours', sc.erreurs.length === 0, js(sc.erreurs));
    } finally { await fin(); }
  });
}

module.exports = { pur, ecran, maj };
