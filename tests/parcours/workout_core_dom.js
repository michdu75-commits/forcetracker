/* ═══════════════════════════════════════════════════════════════════════════════
   ⚡ WORKOUT-CORE-01 · DOM-01/02 — LE RENDU CIBLÉ D'UNE SÉRIE (témoins DOM-T01 → DOM-T14, DOM-R1, DOM-S1 → DOM-S3) —
   Claude N°2 (Séance), 30/10/2026, GO de développement (docs/WORKOUT-CORE-01.md).
   ⚠️ PRÉPARÉ sans exécution (GO DÉVELOPPEMENT du 30/10) ; EXÉCUTÉ au GO TESTS du 30/10. Ajouté ce jour-là : la matrice de la saisie
   validée (DOM-T13a → f, les cas 1, 3, 5, 7 et 10 de l'ordre ; 2, 4, 6, 8, 9 sont DOM-T09b, T09c, T09a, T02, T09a) avec un espion
   sur `upSet`. Elle a trouvé un VRAI défaut du lot (corrigé dans log.js, mutations D17/D18) : après une frappe, quitter le champ
   validé émettait un `change` de plus — même valeur, mais un 2ᵉ `upSet`, donc une sauvegarde complète de plus. Et le banc voisin
   `session_integrity` (T1) en a trouvé un second : l'ancien texte affiché écrasait un modèle changé par le code sans redessin
   (corrigé dans log.js : « tapée » = le champ a reçu une frappe, événement `input` ; témoins DOM-T13g/h, mutations D20/D21).
   Ce que les témoins CONDUISENT : la vraie app servie en local ; de vrais champs de série (clic, frappe au clavier, « Entrée ») ;
   la coche ✓ déclenchée par un clic PROGRAMMATIQUE quand il faut garder le focus dans un autre champ — c'est ce que fait un toucher
   sur iPhone (un bouton touché ne prend pas le focus) et que Chromium ne reproduit pas avec un vrai clic ; les boutons de réserve
   (RIR) ; supersérie, dropset, pyramide, ajout / retrait de série et d'exercice, ouverture d'une autre carte ; une réouverture.
   Ce qu'ils OBSERVENT : les remplacements de `#wkt-exs` (MutationObserver : un rendu global = un remplacement de ses enfants),
   l'IDENTITÉ des nœuds (mêmes objets avant / après), le focus, la sélection, la classe `kbd-serie`, la position de défilement,
   `S.wkt`, chaque sauvegarde de `ft4_wkt` (espion : la valeur enregistrée AU MOMENT où la série devient « faite »), la carte rendue
   sur place comparée AU CARACTÈRE PRÈS à la carte que le rendu global produit juste après.
   Ce qu'ils NE COUVRENT PAS : le clavier réel de l'iPhone (simulé : le champ garde le focus et `kbd-serie` reste — la recette sur
   iPhone reste obligatoire), le dessin à l'écran (rien n'est capturé), Milo, les calories (aucune règle de calcul touchée).
   Rouge sur `e2b942f3`, MESURÉ le 30/10 (chaque validation reconstruisait `#wkt-exs`) : DOM-S1, S2, S3, T01, T02, T03, T04, R1,
   T09a, T09b, T09c, T09d, T09e, T10 et T11 (par leur seule clause « sur place »), T12, T13a, T13b, T13c, T13d, T13f — 21 sur 39.
   Verts sur la base aussi, ajoutés ensuite : T13g et T13h (la base ne relisait pas l'écran quand le modèle était rempli) et T14
   (le « + » ne bougeait pas non plus). ⭐ Ce que la base
   y MONTRE : la série enregistrée « faite » d'abord avec l'ANCIENNE valeur (T09a, T09b, T13a, T13c) ; l'écran qui affiche 60 quand
   le modèle a 62,5 (T09a, T13a, T13c, T13d, T13f) ; un champ vidé qui écrit 0 répétition dans une série validée (T09c, T09e) ; la saisie
   d'une série VOISINE enregistrée sans avoir été validée (T02 : 65 kg) ; deux valeurs changées sans événement simplement perdues
   (T13b) ; un 1RM resté celui de 60 × 8 sur une série à 0 kg (T13d). Verts sur la base : les non-régressions (T05, T06, T07, T07b,
   T08, T13e, T13e2 — la règle de la suggestion grise est celle d'avant) et DOM-T01b, VIDE par construction sur la base (les deux
   rendus y sont globaux) : il ne juge que le chemin sur place.
   ═══════════════════════════════════════════════════════════════════════════════ */
'use strict';

// ⚠️ SEANCE-HL-01 (02/11/2026) : le bilan mensuel (`checkMonthlySummary`, app.js) s'ouvre 2,2 s après le chargement quand le mois ÉCOULÉ contient des
// séances — la fixture PREV est datée du 27/10 : dès le 1ᵉʳ novembre il interceptait les clics de tout ce banc (plantage mesuré le 02/11 sur 9bb9fcb7,
// SANS la correction HL-01). On le déclare déjà annoncé (`ft4_lms`), quelle que soit la date du jour : calculé, jamais figé sur un mois.
const MOIS_ECOULE = (() => { const [y, m] = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' }).split('-').map(Number);
  return m === 1 ? (y - 1) + '-12' : y + '-' + String(m - 1).padStart(2, '0'); })();
const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '120', ft4_lms: MOIS_ECOULE, ft4_sessions: '[]' };
const DC = 'Développé Couché', SQ = 'Squat à la Barre';
const S8 = (kg, reps, done) => ({ kg, reps, type: 'N', done: !!done });
// Deux exercices ordinaires (hors groupe) : 4 séries pré-remplies à 60 kg × 8, puis 3 à 100 kg × 5. Séance démarrée il y a 10 min.
const WKT = (extra) => Object.assign({ date: new Date().toISOString().slice(0, 10), startHour: 14, startTs: Date.now() - 10 * 60000,
  exs: [{ name: DC, sets: [S8(60, 8), S8(60, 8), S8(60, 8), S8(60, 8)] }, { name: SQ, sets: [S8(100, 5), S8(100, 5), S8(100, 5)] }] }, extra || {});
const _det = o => JSON.stringify(o);

async function ecran(t, b, PORT) {
  const normaux = [];   // les avertissements de chaque parcours NORMAL (tout sauf le bloc H, qui casse l'écran exprès) — DOM-T19b
  const ouvrir = async (opts) => {
    opts = opts || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: opts.h || 844 }, timezoneId: 'Europe/Paris',
      locale: 'fr-FR', hasTouch: true });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    const init = Object.assign({}, BASE, { ft4_wkt: JSON.stringify(opts.wkt || WKT()) }, opts.sessions ? { ft4_sessions: JSON.stringify(opts.sessions) } : {});
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_wd'))return; sessionStorage.setItem('_wd','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); }catch(e){} })();`);
    /* espions, posés AVANT tout script de l'app : vibrations ; chaque sauvegarde de `ft4_wkt` (les séries telles qu'enregistrées) ;
       les remplacements des enfants de `#wkt-exs` (le rendu global) et le nombre de nœuds ajoutés dessous */
    await cx.addInitScript(`(()=>{ window.__vib=[]; window.__snaps=[]; window.__brut=[]; window.__rempl=0; window.__ajoutes=0;
      try{ navigator.vibrate=function(p){ window.__vib.push(p); return true; }; }catch(e){}
      const si=Storage.prototype.setItem;
      Storage.prototype.setItem=function(k,v){ try{ if(this===window.localStorage&&k==='ft4_wkt'){ window.__brut.push(String(v)); const w=JSON.parse(v);
        window.__snaps.push((w&&w.exs||[]).map(e=>(e.sets||[]).map(s=>({kg:s.kg,reps:s.reps,done:!!s.done})))); } }catch(e){}
        return si.apply(this,arguments); };
      document.addEventListener('DOMContentLoaded',()=>{ const c=document.getElementById('wkt-exs'); if(!c) return;
        new MutationObserver(r=>{ r.forEach(x=>{ if(x.target===c&&x.type==='childList') window.__rempl++; window.__ajoutes+=x.addedNodes.length; }); })
          .observe(c,{childList:true,subtree:true}); });
    })();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    const warns = []; pg.on('console', m => { if (m.type() === 'warning') warns.push(m.text()); });   // les refus signalés du rendu ciblé (DOM-T17, T18, T19)
    if (!opts.refusAttendus) normaux.push(warns);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const X = { cx, pg, errs, warns };
    await X.pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; });
    await X.pg.evaluate((ei) => { goScreen('log', document.getElementById('nb-log')); renderLog(); _expandedEx = ei; renderExBlocks(); }, opts.ouvert || 0);
    await X.pg.waitForTimeout(250);
    return X;
  };
  const pause = ms => new Promise(r => setTimeout(r, ms));

  /* ── A. VALIDER UNE SÉRIE ORDINAIRE : SUR PLACE, À L'IDENTIQUE DU RENDU GLOBAL ─────────────────────── */
  {
    const X = await ouvrir();
    const r1 = await X.pg.evaluate(async () => {
      const attendre = ms => new Promise(r => setTimeout(r, ms));
      const cartes = [...document.querySelectorAll('#wkt-exs > *')], champ = document.querySelector('#sr-0-2 .sinp'), r0 = window.__rempl;
      document.querySelector('#sr-0-0 .chk').click();                       // ✓ de la série 1
      await attendre(60);
      const apres = [...document.querySelectorAll('#wkt-exs > *')], row0 = document.getElementById('sr-0-0'), row1 = document.getElementById('sr-0-1');
      return { memesCartes: cartes.length === apres.length && cartes.every((c, i) => c === apres[i]), rempl: window.__rempl - r0,
        memeChamp: document.querySelector('#sr-0-2 .sinp') === champ, done: S.wkt.exs[0].sets[0].done, doneRow: row0.classList.contains('done-row'),
        chk: row0.querySelector('.chk').textContent, chkDone: row0.querySelector('.chk').classList.contains('done'),
        cur0: row0.classList.contains('set-cur'), cur1: row1.classList.contains('set-cur'),
        meta: document.querySelector('#ex-block-0 .ex-meta').textContent, repos: !!restIv,
        fin: ((document.getElementById('log-finish') || {}).innerHTML || '').length, entete: ((document.getElementById('tb-seance') || {}).textContent || '').replace(/\s+/g, ' ') }; });
    t('DOM-T01 ⭐ valider une série ordinaire : AUCUNE reconstruction de `#wkt-exs` (mêmes cartes, mêmes champs) — la ligne passe « faite » (✓), la série à faire passe à la suivante, la méta dit 1/4, le repos part ; « Ta séance jusqu\'ici » et l\'en-tête (1 / 7) suivent',
      r1.memesCartes && r1.rempl === 0 && r1.memeChamp && r1.done && r1.doneRow && r1.chk === '✓' && r1.chkDone && !r1.cur0 && r1.cur1
      && /^1\/4 séries/.test(r1.meta) && r1.repos && r1.fin > 0 && /1 \/ 7/.test(r1.entete), _det(r1));

    // la carte mise à jour SUR PLACE = celle que le rendu global aurait produite (même gabarit, comparaison au caractère près)
    const photo = () => X.pg.evaluate(() => { const live = document.getElementById('ex-block-0'), c = live.cloneNode(true);
      const li = live.querySelectorAll('input'); c.querySelectorAll('input').forEach((i, k) => i.setAttribute('value', li[k].value));
      c.querySelectorAll('textarea').forEach(ta => ta.removeAttribute('style'));   // la hauteur des notes est posée par le rendu global seul
      return c.outerHTML; });
    const local = await photo();
    await X.pg.evaluate(() => renderExBlocks());
    const glob = await photo();
    t('DOM-T01b ⭐ la carte mise à jour sur place est IDENTIQUE, au caractère près, à celle que le rendu global produit juste après (classes, ✓, 1RM, pastille, méta)',
      local === glob, _det({ local: local.length, global: glob.length, ecart: (() => { let i = 0; while (i < local.length && local[i] === glob[i]) i++; return local.slice(Math.max(0, i - 40), i + 60) + ' ≠ ' + glob.slice(Math.max(0, i - 40), i + 60); })() }));

    // un champ VOISIN en cours de saisie : la série 4 reçoit « 65 », pas encore enregistrée
    await X.pg.evaluate(() => stopRest());
    const kg3 = X.pg.locator('#sr-0-3 .sinp').nth(1);
    await kg3.click(); await X.pg.keyboard.type('65'); await X.pg.waitForTimeout(100);
    const r2 = await X.pg.evaluate(async () => {
      const attendre = ms => new Promise(r => setTimeout(r, ms));
      const champ = document.querySelectorAll('#sr-0-3 .sinp')[1];
      champ.setSelectionRange(0, 1);
      const r0 = window.__rempl;
      document.querySelector('#sr-0-1 .chk').click();                       // ✓ de la série 2 : le focus reste dans la série 4 (comme sur iPhone)
      await attendre(250);
      const a = document.activeElement;
      return { memeObjet: a === champ, valeur: champ.value, sel: [champ.selectionStart, champ.selectionEnd], modele: S.wkt.exs[0].sets[3].kg,
        kbd: document.getElementById('root').classList.contains('kbd-serie'), champSerie: _estChampSerie(a), rempl: window.__rempl - r0,
        valide: S.wkt.exs[0].sets[1].done, rmVoisin: (document.getElementById('trm-0-3') || {}).textContent, rmAttendu: '~' + fmt(bz(65, 8)) }; });
    t('DOM-T02 ⭐ champ VOISIN en cours de saisie (série 4, « 65 » tapé, pas encore enregistré) puis ✓ de la série 2 : c\'est le MÊME objet, il garde le focus, son texte et son aperçu de 1RM — et le modèle ne l\'a pas lu (on n\'enregistre que ce qu\'on valide)',
      r2.memeObjet && r2.valeur === '65' && r2.modele === 60 && r2.valide && r2.rempl === 0 && r2.rmVoisin === r2.rmAttendu, _det(r2));
    // la sélection d'un champ DÉTRUIT reste lisible sur l'objet détaché (vert à tort sur la base, mesuré le 30/10) : c'est le MÊME champ, encore actif
    t('DOM-T03 ⭐ … la sélection posée dans ce champ (caractères 0 à 1) est intacte — sur le même champ, toujours actif', r2.memeObjet && r2.sel[0] === 0 && r2.sel[1] === 1,
      _det({ sel: r2.sel, memeObjet: r2.memeObjet }));
    t('DOM-T04 ⭐ … aucune raison de fermer le clavier : le champ actif reste un champ de série et `kbd-serie` (barre du bas masquée) reste posée — simulation Chromium, PAS l\'iPhone',
      r2.kbd && r2.champSerie, _det({ kbd: r2.kbd, champSerie: r2.champSerie }));

    // la réserve (RIR) pendant le repos, champ voisin actif : seule la pastille change, rien n'est détruit
    const r3 = await X.pg.evaluate(async () => {
      const attendre = ms => new Promise(r => setTimeout(r, ms));
      const champ = document.querySelectorAll('#sr-0-3 .sinp')[1], r0 = window.__rempl;
      const deux = [...document.querySelectorAll('#rest-rir .rir-b')].find(x => x.textContent.trim() === '2');
      if (deux) deux.click();
      await attendre(80);
      const d = JSON.parse(localStorage.getItem('ft4_wkt') || 'null');
      const o = { bouton: !!deux, rir: S.wkt.exs[0].sets[1].rir, type: S.wkt.exs[0].sets[1].type, memeObjet: document.activeElement === champ,
        valeur: champ.value, rempl: window.__rempl - r0, disque: d && d.exs && d.exs[0].sets[1].rir };
      setRir(0, 1, 'X'); await attendre(50);
      const p = document.querySelector('#tbtn-0-1 .tbtn');
      o.echec = { type: S.wkt.exs[0].sets[1].type, txt: p && p.textContent, cls: p && p.className, rir: S.wkt.exs[0].sets[1].rir };
      setRir(0, 1, null); await attendre(50);
      const q = document.querySelector('#tbtn-0-1 .tbtn');
      o.retire = { type: S.wkt.exs[0].sets[1].type, txt: q && q.textContent };
      o.memeObjetFin = document.activeElement === champ; o.remplFin = window.__rempl - r0;
      return o; });
    t('DOM-R1 ⭐ réserve « 2 » pendant le repos, champ voisin en saisie : rir = 2, enregistré sur le téléphone, le champ garde focus et texte, aucune reconstruction ; « Échec » → pastille X ; « ✕ » → N — toujours sur place',
      r3.bouton && r3.rir === 2 && r3.disque === 2 && r3.type === 'N' && r3.memeObjet && r3.valeur === '65' && r3.rempl === 0 && r3.echec.type === 'X' && r3.echec.txt === 'X'
      && /\bX\b/.test(r3.echec.cls || '') && r3.echec.rir === undefined && r3.retire.type === 'N' && r3.retire.txt === 'N' && r3.memeObjetFin && r3.remplFin === 0, _det(r3));
    t('DOM-T01z aucune erreur de page (bloc A)', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ── B. CE QUI EST TAPÉ DANS LA SÉRIE VALIDÉE EST CE QUI EST ENREGISTRÉ (arbitrage du 30/10) ──────── */
  {
    const X = await ouvrir();
    // « Entrée » sur KG : 62,5 tapé sur une charge pré-remplie (60)
    await X.pg.evaluate(() => { window.__snaps.length = 0; });
    const kg2 = X.pg.locator('#sr-0-2 .sinp').nth(1);
    await kg2.click(); await X.pg.keyboard.type('62,5'); await X.pg.keyboard.press('Enter'); await X.pg.waitForTimeout(250);
    const r4 = await X.pg.evaluate(() => { const s = S.wkt.exs[0].sets[2], faits = window.__snaps.filter(x => x[0] && x[0][2] && x[0][2].done);
      const a = document.activeElement, ligne = a && a.closest ? a.closest('.set-row') : null;
      return { kg: s.kg, rm1: s.rm1, attenduRm: bz(62.5, 8), done: s.done, at: typeof s.at, premierFait: faits[0] ? faits[0][0][2] : null,
        actif: ligne ? ligne.id : null, affiche: document.querySelectorAll('#sr-0-2 .sinp')[1].value }; });
    t('DOM-T09a ⭐ « 62,5 » tapé sur une charge pré-remplie (60) puis « Entrée » : la série est enregistrée à 62,5 DÈS sa validation (1ʳᵉ sauvegarde « faite »), 1RM recalculé, horodatée ; le focus passe à la série suivante (Entrée inchangé)',
      r4.kg === 62.5 && r4.rm1 === r4.attenduRm && r4.done && r4.at === 'number' && r4.premierFait && r4.premierFait.kg === 62.5 && r4.actif === 'sr-0-3' && r4.affiche === '62.5', _det(r4));

    // ✓ touché pendant la saisie, le champ gardant le focus (iPhone) — exercice 2
    await X.pg.evaluate(() => { stopRest(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); _expandedEx = 1; renderExBlocks(); });
    await X.pg.waitForTimeout(100);
    const reps10 = X.pg.locator('#sr-1-0 .sinp').nth(0);
    await reps10.click(); await X.pg.keyboard.type('7'); await X.pg.waitForTimeout(100);
    const r5 = await X.pg.evaluate(async () => { window.__snaps.length = 0;
      const champ = document.querySelectorAll('#sr-1-0 .sinp')[0];
      document.querySelector('#sr-1-0 .chk').click(); await new Promise(r => setTimeout(r, 250));
      const s = S.wkt.exs[1].sets[0], faits = window.__snaps.filter(x => x[1] && x[1][0] && x[1][0].done);
      return { reps: s.reps, done: s.done, premierFait: faits[0] ? faits[0][1][0] : null, focusRendu: document.activeElement !== champ,
        memeChamp: document.querySelectorAll('#sr-1-0 .sinp')[0] === champ, affiche: champ.value, rm1: s.rm1, attenduRm: bz(100, 7) }; });
    t('DOM-T09b ⭐ ✓ touché PENDANT la saisie (le champ garde le focus, comme sur iPhone) : « 7 » remplace les 5 répétitions pré-remplies dès la validation ; le champ rend le focus (clavier fermé, comme avant) sans être détruit',
      r5.reps === 7 && r5.done && r5.premierFait && r5.premierFait.reps === 7 && r5.rm1 === r5.attenduRm && r5.focusRendu && r5.memeChamp && r5.affiche === '7', _det(r5));

    // un champ VIDÉ n'est pas une valeur tapée
    await X.pg.evaluate(() => stopRest());
    const reps11 = X.pg.locator('#sr-1-1 .sinp').nth(0);
    await reps11.click(); await X.pg.keyboard.press('Backspace'); await X.pg.waitForTimeout(80);
    const r6 = await X.pg.evaluate(async () => { const champ = document.querySelectorAll('#sr-1-1 .sinp')[0], vide = champ.value;
      document.querySelector('#sr-1-1 .chk').click(); await new Promise(r => setTimeout(r, 250));
      return { vide, reps: S.wkt.exs[1].sets[1].reps, done: S.wkt.exs[1].sets[1].done, affiche: champ.value }; });
    t('DOM-T09c un champ VIDÉ n\'est pas une valeur tapée : la série garde ses 5 répétitions, et rien ne vient l\'écraser après coup (ni 0, ni suggestion) — vide, zéro et suggestion restent distincts',
      r6.vide === '' && r6.reps === 5 && r6.done && r6.affiche === '5', _det(r6));

    // les données de toute la séance : modèle = sauvegarde, et rien d'autre n'a bougé
    const r7 = await X.pg.evaluate(() => { const d = JSON.parse(localStorage.getItem('ft4_wkt') || 'null');
      const net = w => (w && w.exs || []).map(e => (e.sets || []).map(s => [s.kg, s.reps, !!s.done, s.type]));
      return { egal: _det(net(d)) === _det(net(S.wkt)), modele: net(S.wkt) };
      function _det(o) { return JSON.stringify(o); } });
    t('DOM-T09d ⭐ la séance sauvegardée (`ft4_wkt`) est le modèle à l\'identique ; seules les séries validées ont bougé (62,5 kg ; 7 reps ; les autres pré-remplies intactes)',
      r7.egal && _det(r7.modele) === _det([[[60, 8, false, 'N'], [60, 8, false, 'N'], [62.5, 8, true, 'N'], [60, 8, false, 'N']], [[100, 7, true, 'N'], [100, 5, true, 'N'], [100, 5, false, 'N']]]),
      _det(r7));
    t('DOM-T09z aucune erreur de page (bloc B)', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ── B bis. LA MATRICE DE LA SAISIE VALIDÉE (GO TESTS du 30/10, cas 1, 3, 5, 10 ; les cas 2, 4, 6, 8, 9 sont en B et en A) ──
     Ce que chaque cas OBSERVE : la série (modèle, écran, téléphone), les autres séries, et CHAQUE sauvegarde de `ft4_wkt` — aucune
     valeur perdue, remplacée en silence ou rangée dans une autre série ; aucune sauvegarde « faite » avec l'ancienne valeur ; AUCUNE
     SAUVEGARDE QUI NE CHANGE RIEN (`doublons` : une écriture identique à la précédente, l'état d'avant le geste compris) ; rien
     d'écrit APRÈS le geste.
     ↪️ ADAPTÉ LE 31/10 (simplification S2, autorisation conditionnelle du CTO) : ces témoins comptaient les APPELS de `upSet` — la
     forme du code. Ils comptent désormais les SAUVEGARDES, ce que la personne paie (`persist()` réécrit toute la mémoire du
     téléphone) : même exigence (une valeur tapée = une écriture), et plus large (une sauvegarde inutile est vue quelle que soit sa
     source). ⛔ DOM-T13b est RETIRÉ : il simulait une frappe dans un champ NON actif sans `change` (valeur posée par script) — ce
     qu'aucune vraie saisie ne produit dans Chromium (DOM-T15 : 13 sorties de champ mesurées, la valeur est enregistrée à chaque
     fois). Le cas réel des deux champs tapés est DOM-T13c. Ajouté : DOM-T13i (champ quitté puis ✓ — rouge sur 227f090e). */
  {
    const X = await ouvrir();
    // l'état complet d'une série + les sauvegardes vues depuis la dernière remise, sans rien changer
    const lire = (ei, si) => X.pg.evaluate(([ei, si]) => { const s = S.wkt.exs[ei].sets[si], d = JSON.parse(localStorage.getItem('ft4_wkt') || 'null');
      const lig = document.getElementById('sr-' + ei + '-' + si), inps = lig ? lig.querySelectorAll('.sinp') : [], b = window.__brut;
      return { kg: s.kg, reps: s.reps, done: !!s.done, rm1: s.rm1, disque: d && d.exs ? [d.exs[ei].sets[si].kg, d.exs[ei].sets[si].reps, !!d.exs[ei].sets[si].done] : null,
        affiche: [inps[0] ? inps[0].value : null, inps[1] ? inps[1].value : null], ecritures: b.length - 1, doublons: b.filter((x, i) => i > 0 && x === b[i - 1]).length,
        // toutes les sauvegardes où CETTE série est « faite » : ses valeurs
        faits: window.__snaps.filter(x => x[ei] && x[ei][si] && x[ei][si].done).map(x => [x[ei][si].kg, x[ei][si].reps]),
        autres: S.wkt.exs.map((e, a) => e.sets.map((z, c) => (a === ei && c === si) ? null : [z.kg, z.reps, !!z.done])) }; }, [ei, si]);
    // la remise : repos arrêté, champ quitté, PUIS les compteurs repartent de l'état enregistré (1ᵉʳ élément de `__brut`)
    const remise = () => X.pg.evaluate(() => { stopRest(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      window.__snaps.length = 0; window.__brut = [localStorage.getItem('ft4_wkt')]; });
    // le geste : ✓ de la série, par un clic PROGRAMMATIQUE (le focus reste où il est, comme un toucher sur iPhone) ; rend le nombre
    // d'écritures 300 ms après — la lecture finale, 600 à 900 ms plus tard, doit en trouver autant (rien d'écrit après le geste)
    const valider = (sel) => X.pg.evaluate(async (sel) => { document.querySelector(sel).click(); await new Promise(r => setTimeout(r, 300)); return window.__brut.length - 1; }, sel);
    // ce que la séance DOIT contenir, mis à jour après chaque cas : une autre série qui bouge = une valeur rangée au mauvais endroit
    const ATTENDU = [[[60, 8, false], [60, 8, false], [60, 8, false], [60, 8, false]], [[100, 5, false], [100, 5, false], [100, 5, false]]];
    const autresIntacts = (r, ei, si) => _det(r.autres) === _det(ATTENDU.map((e, a) => e.map((z, b) => (a === ei && b === si) ? null : z)));

    // cas 1 — la CHARGE modifiée juste avant ✓, champ encore actif (aucun `change`) : « 67,5 » sur 60 pré-rempli, série 1
    await remise();
    await X.pg.locator('#sr-0-0 .sinp').nth(1).click(); await X.pg.keyboard.type('67,5'); await X.pg.waitForTimeout(80);
    const c1 = await X.pg.evaluate(async () => { const champ = document.querySelectorAll('#sr-0-0 .sinp')[1], kgAvant = S.wkt.exs[0].sets[0].kg, e0 = window.__brut.length - 1;
      document.querySelector('#sr-0-0 .chk').click(); await new Promise(r => setTimeout(r, 300));
      return { kgAvant, ecrituresAvant: e0, n: window.__brut.length - 1, memeChamp: document.querySelectorAll('#sr-0-0 .sinp')[1] === champ, focusRendu: document.activeElement !== champ }; });
    await X.pg.waitForTimeout(600);
    const r1 = await lire(0, 0);
    t('DOM-T13a ⭐ cas 1 — charge « 67,5 » tapée sur 60 pré-rempli, ✓ touché champ ACTIF (rien d\'enregistré avant le geste) : 67,5 dès la 1ʳᵉ sauvegarde « faite », 1RM recalculé, affichage « 67.5 », AUCUNE sauvegarde qui ne change rien (le champ quitté ne réécrit pas sa valeur), rien après le geste, rien d\'autre ne bouge',
      c1.kgAvant === 60 && c1.ecrituresAvant === 0 && r1.kg === 67.5 && r1.reps === 8 && r1.done && r1.rm1 === await X.pg.evaluate(() => bz(67.5, 8))
      && r1.faits.length >= 1 && r1.faits.every(f => f[0] === 67.5 && f[1] === 8) && r1.doublons === 0 && r1.ecritures === c1.n
      && _det(r1.disque) === _det([67.5, 8, true]) && r1.affiche[1] === '67.5' && c1.memeChamp && c1.focusRendu && autresIntacts(r1, 0, 0), _det({ c1, r1 }));
    ATTENDU[0][0] = [67.5, 8, true];

    // cas 11 (31/10) — « 62,5 » tapé puis champ QUITTÉ (sa valeur est enregistrée à la sortie, comme avant), ✓ ensuite sans champ
    // actif : la validation ne réécrit rien. Sur 227f090e : une 2ᵉ sauvegarde complète, identique (la marque de frappe relisait
    // « 62,5 », différent du texte « 62.5 » du modèle) — mesuré le 31/10.
    await remise();
    await X.pg.locator('#sr-0-1 .sinp').nth(1).click(); await X.pg.keyboard.type('62,5');
    await X.pg.locator('#sr-0-1 .sinp').nth(0).click(); await X.pg.waitForTimeout(80);
    const c11 = await X.pg.evaluate(() => { const kgQuitte = S.wkt.exs[0].sets[1].kg; document.activeElement.blur(); return { kgQuitte, e0: window.__brut.length - 1 }; });
    c11.n = await valider('#sr-0-1 .chk');
    await X.pg.waitForTimeout(600);
    const r11 = await lire(0, 1);
    t('DOM-T13i ⭐ « 62,5 » tapé puis champ QUITTÉ (UNE sauvegarde, à la sortie), ✓ ensuite : 62,5 dans toute sauvegarde « faite », AUCUNE sauvegarde qui ne change rien — la valeur déjà enregistrée n\'est pas réécrite à la validation',
      c11.kgQuitte === 62.5 && c11.e0 === 1 && r11.kg === 62.5 && r11.reps === 8 && r11.done && r11.faits.length >= 1 && r11.faits.every(f => f[0] === 62.5 && f[1] === 8)
      && r11.doublons === 0 && r11.ecritures === c11.n && _det(r11.disque) === _det([62.5, 8, true]) && autresIntacts(r11, 0, 1), _det({ c11, r11 }));
    ATTENDU[0][1] = [62.5, 8, true];

    // cas 3 — les DEUX champs tapés au clavier : les répétitions (on touche ensuite le champ KG, leur `change` part), « 72,5 », ✓ — série 3
    await remise();
    await X.pg.locator('#sr-0-2 .sinp').nth(0).click(); await X.pg.keyboard.type('9');
    await X.pg.locator('#sr-0-2 .sinp').nth(1).click(); await X.pg.keyboard.type('72,5'); await X.pg.waitForTimeout(80);
    const avant3 = await X.pg.evaluate(() => { const s = S.wkt.exs[0].sets[2]; return { kg: s.kg, reps: s.reps, ecritures: window.__brut.length - 1 }; });
    const n3 = await valider('#sr-0-2 .chk');
    await X.pg.waitForTimeout(900);    // laisse passer un éventuel `change` tardif ou l'avance automatique (700 ms)
    const r3c = await lire(0, 2);
    t('DOM-T13c ⭐ cas 3 — « 9 » puis « 72,5 » (les deux champs tapés) : les répétitions sont enregistrées en quittant leur champ (comme avant), la charge à la validation — 9 × 72,5 enregistrés et affichés, aucune sauvegarde qui ne change rien, rien après le geste',
      avant3.reps === 9 && avant3.kg === 60 && avant3.ecritures === 1 && r3c.kg === 72.5 && r3c.reps === 9 && r3c.done
      && r3c.faits.length >= 1 && r3c.faits.every(f => f[0] === 72.5 && f[1] === 9) && r3c.doublons === 0 && r3c.ecritures === n3
      && _det(r3c.disque) === _det([72.5, 9, true]) && _det(r3c.affiche) === _det(['9', '72.5']) && autresIntacts(r3c, 0, 2), _det({ avant3, r3c }));
    ATTENDU[0][2] = [72.5, 9, true];

    // cas 5 — « 0 » tapé sur une charge pré-remplie (60), ✓ champ actif : 0 est une valeur, pas une case vide — série 4
    await remise();
    await X.pg.locator('#sr-0-3 .sinp').nth(1).click(); await X.pg.keyboard.type('0'); await X.pg.waitForTimeout(80);
    const n5 = await valider('#sr-0-3 .chk');
    await X.pg.waitForTimeout(900);
    const r5 = await lire(0, 3);
    const g5 = await X.pg.evaluate(() => { renderExBlocks(); const i = document.querySelectorAll('#sr-0-3 .sinp'); return [i[0] ? i[0].value : null, i[1] ? i[1].value : null]; });
    t('DOM-T13d ⭐ cas 5 — « 0 » tapé sur 60 pré-rempli puis ✓ : la charge enregistrée est 0 (la valeur tapée), aucun 1RM inventé, rien ne la remplace après (ni 60, ni suggestion), aucune sauvegarde qui ne change rien ; l\'affichage est celui du rendu global',
      r5.kg === 0 && r5.reps === 8 && r5.done && r5.rm1 === undefined && r5.faits.length >= 1 && r5.faits.every(f => f[0] === 0 && f[1] === 8)
      && r5.doublons === 0 && r5.ecritures === n5 && _det(r5.disque) === _det([0, 8, true]) && _det(r5.affiche) === _det(g5) && autresIntacts(r5, 0, 3), _det({ r5, global: g5 }));
    ATTENDU[0][3] = [0, 8, true];

    // cas 10 — DÉ-validation pendant une saisie active : série 1 (faite à 67,5), « 75 » tapé dans sa charge, ✓ touché champ ACTIF
    await X.pg.evaluate(() => { _expandedEx = 0; renderExBlocks(); });
    await remise();
    await X.pg.locator('#sr-0-0 .sinp').nth(1).click(); await X.pg.keyboard.type('75'); await X.pg.waitForTimeout(80);
    const c10 = await X.pg.evaluate(async () => { const champ = document.querySelectorAll('#sr-0-0 .sinp')[1], r0 = window.__rempl;
      document.querySelector('#sr-0-0 .chk').click(); await new Promise(r => setTimeout(r, 300));
      const s = S.wkt.exs[0].sets[0];
      return { done: !!s.done, kgModele: s.kg, memeChamp: document.querySelectorAll('#sr-0-0 .sinp')[1] === champ, focus: document.activeElement === champ,
        valeur: champ.value, rempl: window.__rempl - r0 }; });
    await X.pg.evaluate(() => { document.activeElement.blur(); });    // la personne quitte le champ : son `change` part, comme avant
    await X.pg.waitForTimeout(300);
    const r10 = await lire(0, 0);
    t('DOM-T13f ⭐ cas 10 — dé-validation PENDANT la saisie (« 75 » tapé, champ actif) : la série repasse « à faire », le champ n\'est ni détruit ni réécrit (focus, « 75 »), puis en le quittant 75 entre dans CETTE série — aucune perte, aucune sauvegarde qui ne change rien, aucune autre série touchée',
      !c10.done && c10.memeChamp && c10.focus && c10.valeur === '75' && c10.rempl === 0 && (c10.kgModele === 67.5 || c10.kgModele === 75)
      && r10.kg === 75 && !r10.done && r10.doublons === 0 && _det(r10.disque) === _det([75, 8, false]) && autresIntacts(r10, 0, 0), _det({ c10, r10 }));
    t('DOM-T13z aucune erreur de page (bloc B bis)', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ── B ter. LA SUGGESTION GRISE N'EST PAS UNE VALEUR TAPÉE (cas 7) — et un « 0 » tapé ne laisse pas la place à la suggestion ──
     ↪️ ADAPTÉ LE 31/10 : les appels de `upSet` ne sont plus comptés (la forme), les SAUVEGARDES le sont (voir B bis). Ajouté :
     DOM-T13e3 — un champ VIDÉ, suggestion grise affichée, sur une série dont le modèle a une valeur : vider n'est pas taper. */
  {
    const PREV = [{ date: '2026-10-27', startHour: 18, duration: 3600, vol: 1170,
      exs: [{ name: DC, sets: [{ kg: 65, reps: 6, type: 'N', done: true }, { kg: 65, reps: 6, type: 'N', done: true }, { kg: 65, reps: 6, type: 'N', done: true }] }] }];
    const vide = () => ({ kg: 0, reps: 0, type: 'N', done: false });
    const X = await ouvrir({ wkt: WKT({ exs: [{ name: DC, sets: [vide(), vide(), vide()] }] }), sessions: PREV });
    const r = await X.pg.evaluate(async () => {
      const attendre = ms => new Promise(r => setTimeout(r, ms));
      window.__snaps.length = 0; window.__brut = [localStorage.getItem('ft4_wkt')];
      const i0 = document.querySelectorAll('#sr-0-0 .sinp');
      const o = { ph: [i0[0].placeholder, i0[1].placeholder], val: [i0[0].value, i0[1].value] };
      document.querySelector('#sr-0-0 .chk').click(); await attendre(300);
      const s0 = S.wkt.exs[0].sets[0], b = window.__brut;
      o.c7 = { kg: s0.kg, reps: s0.reps, done: !!s0.done, rm1: s0.rm1, attenduRm: bz(65, 6),
        // une sauvegarde où la série porterait une valeur SANS être faite = la suggestion enregistrée comme une saisie
        commeSaisie: window.__snaps.filter(x => (x[0][0].kg || x[0][0].reps) && !x[0][0].done).length,
        doublons: b.filter((x, i) => i > 0 && x === b[i - 1]).length, affiche: [...document.querySelectorAll('#sr-0-0 .sinp')].map(x => x.value) };
      stopRest(); window.__snaps.length = 0; window.__brut = [localStorage.getItem('ft4_wkt')];
      return o; });
    // « 0 » tapé dans la charge VIDE de la série 2 (suggestion 65 en gris), ✓ champ actif
    await X.pg.locator('#sr-0-1 .sinp').nth(1).click(); await X.pg.keyboard.type('0'); await X.pg.waitForTimeout(80);
    const z = await X.pg.evaluate(async () => { document.querySelector('#sr-0-1 .chk').click(); await new Promise(r => setTimeout(r, 300));
      const s = S.wkt.exs[0].sets[1], b = window.__brut;
      return { kg: s.kg, reps: s.reps, done: !!s.done, rm1: s.rm1, autre: S.wkt.exs[0].sets[2], doublons: b.filter((x, i) => i > 0 && x === b[i - 1]).length,
        faits: window.__snaps.filter(x => x[0][1].done).map(x => [x[0][1].kg, x[0][1].reps]) }; });
    t('DOM-T13e ⭐ cas 7 — série au modèle VIDE, suggestion grise 6 × 65 (la dernière fois), ✓ sans rien taper : la règle d\'avant s\'applique telle quelle (6 × 65, 1RM) — la suggestion n\'est jamais enregistrée comme une saisie (aucune sauvegarde où la série la porterait sans être faite), aucune sauvegarde qui ne change rien',
      _det(r.ph) === _det(['6', '65']) && _det(r.val) === _det(['', '']) && r.c7.kg === 65 && r.c7.reps === 6 && r.c7.done && r.c7.rm1 === r.c7.attenduRm
      && r.c7.commeSaisie === 0 && r.c7.doublons === 0 && _det(r.c7.affiche) === _det(['6', '65']), _det(r));
    t('DOM-T13e2 cas 5 + 7 — « 0 » tapé dans une charge VIDE suggérée à 65 : 0 est gardé (pas la suggestion) ; les répétitions non tapées prennent la suggestion (6), comme avant ; aucune sauvegarde qui ne change rien ; la série 3 n\'est pas touchée',
      z.kg === 0 && z.reps === 6 && z.done && z.rm1 === undefined && z.faits.length >= 1 && z.faits.every(f => f[0] === 0 && f[1] === 6) && z.doublons === 0
      && z.autre.kg === 0 && z.autre.reps === 0 && !z.autre.done, _det(z));
    // cas 7 bis (31/10) — la série 3 reçoit 9 répétitions (tapées, enregistrées en quittant le champ) ; on revient dans le champ, on le
    // VIDE (la suggestion grise « 6 » réapparaît), ✓ champ actif : vider n'est pas taper, la suggestion n'est pas une saisie → 9 reste
    await X.pg.evaluate(() => { stopRest(); });
    await X.pg.locator('#sr-0-2 .sinp').nth(0).click(); await X.pg.keyboard.type('9');
    await X.pg.locator('#sr-0-2 .sinp').nth(1).click(); await X.pg.waitForTimeout(80);
    await X.pg.locator('#sr-0-2 .sinp').nth(0).click(); await X.pg.keyboard.press('Backspace'); await X.pg.waitForTimeout(80);
    const e3 = await X.pg.evaluate(async () => { const champ = document.querySelectorAll('#sr-0-2 .sinp')[0];
      const o = { vide: champ.value, ph: champ.placeholder, repsAvant: S.wkt.exs[0].sets[2].reps, actif: document.activeElement === champ };
      document.querySelector('#sr-0-2 .chk').click(); await new Promise(r => setTimeout(r, 300));
      const s = S.wkt.exs[0].sets[2]; return Object.assign(o, { reps: s.reps, kg: s.kg, done: !!s.done, affiche: champ.value }); });
    t('DOM-T13e3 ⭐ cas 7 bis — champ des répétitions VIDÉ (suggestion grise « 6 » affichée) sur une série qui en a 9, ✓ champ actif : la série garde 9 — un champ vidé n\'est pas une saisie et la suggestion n\'est pas une valeur tapée ; la charge vide prend la suggestion (65), comme avant',
      e3.vide === '' && e3.ph === '6' && e3.repsAvant === 9 && e3.actif && e3.reps === 9 && e3.kg === 65 && e3.done && e3.affiche === '9', _det(e3));
    t('DOM-T13y aucune erreur de page (bloc B ter)', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ── B quater. UN MODÈLE CHANGÉ PAR LE CODE (sans redessin) N'EST PAS ÉCRASÉ PAR L'ANCIEN TEXTE AFFICHÉ ──────────────────────
     Trouvé au GO TESTS par `session_integrity` T1 (témoin historique, inchangé) : son harnais écrit les séries dans le modèle sans
     redessiner, puis valide. Vert sur la base aussi (elle ne relisait pas l'écran quand le modèle était rempli) : non-régression.
     ↪️ ADAPTÉ LE 31/10 : il n'y a plus de « marque de frappe » — la validation ne relit que le champ ACTIF. Les témoins vérifient
     le comportement (aucune sauvegarde ne ramène l'ancien texte), plus le nombre d'appels de `upSet`. */
  {
    const X = await ouvrir();
    const r = await X.pg.evaluate(async () => {
      const s = S.wkt.exs[0].sets[0]; s.kg = 77; s.reps = 9; persist();      // le code change le modèle ; l'écran affiche encore 8 × 60
      window.__snaps.length = 0;
      const avant = [...document.querySelectorAll('#sr-0-0 .sinp')].map(x => x.value);
      document.querySelector('#sr-0-0 .chk').click(); await new Promise(r => setTimeout(r, 300));
      const d = JSON.parse(localStorage.getItem('ft4_wkt') || 'null');
      return { avant, kg: s.kg, reps: s.reps, done: !!s.done, rm1: s.rm1, attenduRm: bz(77, 9), sauvegardes: window.__snaps.map(x => [x[0][0].kg, x[0][0].reps]),
        disque: d && d.exs ? [d.exs[0].sets[0].kg, d.exs[0].sets[0].reps, !!d.exs[0].sets[0].done] : null,
        affiche: [...document.querySelectorAll('#sr-0-0 .sinp')].map(x => x.value) }; });
    t('DOM-T13g ⭐ le modèle changé par le CODE sans redessiner (l\'écran affiche encore 8 × 60) puis ✓ sans rien taper : 9 × 77 gardés — aucune sauvegarde ne porte 8 × 60 —, et l\'écran rattrape le modèle : l\'ancien texte affiché ne remplace rien en silence',
      _det(r.avant) === _det(['8', '60']) && r.kg === 77 && r.reps === 9 && r.done && r.rm1 === r.attenduRm && r.sauvegardes.length >= 1 && r.sauvegardes.every(x => x[0] === 77 && x[1] === 9)
      && _det(r.disque) === _det([77, 9, true]) && _det(r.affiche) === _det(['9', '77']), _det(r));
    // une frappe ne sert qu'UNE fois : « 61 » tapé et validé, dé-validé, puis le code change la charge (77) sans redessiner,
    // puis ✓ sans rien taper → 77 reste (le « 61 » déjà enregistré ne revient pas l'écraser)
    await X.pg.evaluate(() => { stopRest(); });
    await X.pg.locator('#sr-0-1 .sinp').nth(1).click(); await X.pg.keyboard.type('61'); await X.pg.waitForTimeout(80);
    const h = await X.pg.evaluate(async () => {
      const attendre = ms => new Promise(r => setTimeout(r, ms)), s = S.wkt.exs[0].sets[1], chk = () => document.querySelector('#sr-0-1 .chk');
      chk().click(); await attendre(200); const apres1 = s.kg; stopRest();
      chk().click(); await attendre(120); const defaite = !s.done;
      s.kg = 77; persist(); window.__snaps.length = 0;
      chk().click(); await attendre(200); stopRest();
      return { apres1, defaite, kg: s.kg, done: !!s.done, sauvegardes: window.__snaps.map(x => x[0][1].kg) }; });
    t('DOM-T13h une frappe ne sert qu\'UNE fois : « 61 » enregistré à sa validation ; dé-validée, la série reçoit 77 du code (sans redessin) ; re-validée sans frappe → 77 reste, et aucune sauvegarde ne ramène 61',
      h.apres1 === 61 && h.defaite && h.kg === 77 && h.done && h.sauvegardes.length >= 1 && h.sauvegardes.every(k => k === 77), _det(h));
    t('DOM-T13x aucune erreur de page (bloc B quater)', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ── B quinquies. QUITTER UN CHAMP ENREGISTRE CE QUI EST TAPÉ (31/10/2026 — le PRÉALABLE de la simplification S2) ────────────
     La validation ne relit plus que le champ ACTIF de la série validée. C'est juste si, et seulement si, toute autre frappe est déjà
     dans le modèle. Ce témoin le MESURE pour 13 façons réelles de quitter un champ (clavier et souris de Playwright, toucher simulé) :
     pour chacune, soit le champ tapé est encore le champ actif (la validation le lira), soit sa valeur est dans le modèle ET sur le
     téléphone. Les trois sorties par ✓ vérifient aussi la série validée.
     Ce qu'il NE COUVRE PAS : le clavier de l'iPhone (« OK », flèches ⌃ ⌄, dictée, toucher ✓ clavier ouvert) ni l'app mise en
     arrière-plan — le navigateur de test garde la page visible et focalisée (mesuré le 31/10, même dans une vraie fenêtre sous
     Xvfb). La recette iPhone reste obligatoire. */
  {
    const huit = () => [0, 1, 2, 3, 4, 5, 6, 7].map(() => S8(60, 8)), six = () => [0, 1, 2, 3, 4, 5].map(() => S8(100, 5));
    const X = await ouvrir({ wkt: WKT({ exs: [{ name: DC, sets: huit() }, { name: SQ, sets: six() }] }) });
    const champ = (ei, si, j) => X.pg.locator('#sr-' + ei + '-' + si + ' .sinp').nth(j);
    const tape = async (ei, si, j, txt) => { await champ(ei, si, j).click({ timeout: 4000 }); await X.pg.keyboard.type(txt); await X.pg.waitForTimeout(60); };
    const carte = ei => X.pg.evaluate(ei => { stopRest(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); _expandedEx = ei; renderExBlocks(); }, ei);
    // le constat : le champ tapé est-il encore ACTIF ? sinon, sa valeur est-elle dans le modèle ET sur le téléphone ?
    const constat = (ei, si, f, v) => X.pg.evaluate(([ei, si, f, v]) => { const a = document.activeElement, lig = document.getElementById('sr-' + ei + '-' + si);
      const actif = !!(lig && a && lig.contains(a) && [].indexOf.call(lig.querySelectorAll('.sinp'), a) === (f === 'kg' ? 1 : 0));
      const d = JSON.parse(localStorage.getItem('ft4_wkt') || 'null'), s = S.wkt.exs[ei].sets[si], disque = d && d.exs ? d.exs[ei].sets[si][f] : null;
      return { actif, modele: s[f], disque, done: !!s.done, ok: actif || (s[f] === v && disque === v) }; }, [ei, si, f, v]);
    const res = {};
    await carte(0);
    await tape(0, 0, 1, '62,5'); await champ(0, 0, 0).click(); await X.pg.waitForTimeout(80); res.memeLigne = await constat(0, 0, 'kg', 62.5);
    await tape(0, 1, 1, '62,5'); await champ(0, 6, 1).click(); await X.pg.waitForTimeout(80); res.autreLigne = await constat(0, 1, 'kg', 62.5);
    await tape(0, 2, 1, '62,5'); await X.pg.keyboard.press('Tab'); await X.pg.waitForTimeout(80); res.tab = await constat(0, 2, 'kg', 62.5);
    await tape(0, 3, 1, '62,5'); await X.pg.keyboard.press('Shift+Tab'); await X.pg.waitForTimeout(80); res.majTab = await constat(0, 3, 'kg', 62.5);
    await tape(0, 4, 0, '7'); await X.pg.keyboard.press('Enter'); await X.pg.waitForTimeout(80); res.entreeReps = await constat(0, 4, 'reps', 7);
    await tape(0, 5, 0, '7'); await X.pg.waitForTimeout(950); res.avanceAuto = await constat(0, 5, 'reps', 7);
    const coin = await X.pg.locator('#ex-block-0').boundingBox();
    await tape(0, 6, 1, '62,5'); await X.pg.mouse.click(coin.x + 6, coin.y + 6); await X.pg.waitForTimeout(80); res.clicVide = await constat(0, 6, 'kg', 62.5);
    await tape(0, 7, 1, '62,5'); await X.pg.touchscreen.tap(coin.x + 6, coin.y + 6); await X.pg.waitForTimeout(80); res.toucherVide = await constat(0, 7, 'kg', 62.5);
    await carte(1);
    await tape(1, 0, 1, '102,5'); await X.pg.locator('#sr-1-0 .chk').click({ timeout: 4000 }); await X.pg.waitForTimeout(250); res.clicCoche = await constat(1, 0, 'kg', 102.5);
    await X.pg.evaluate(() => stopRest());
    await tape(1, 1, 1, '102,5'); await X.pg.locator('#sr-1-1 .chk').tap({ timeout: 4000 }); await X.pg.waitForTimeout(250); res.toucherCoche = await constat(1, 1, 'kg', 102.5);
    await X.pg.evaluate(() => stopRest());
    await tape(1, 2, 1, '102,5'); await X.pg.locator('#sr-1-3 .chk').click({ timeout: 4000 }); await X.pg.waitForTimeout(250); res.cocheAutreLigne = await constat(1, 2, 'kg', 102.5);
    const autreValidee = await X.pg.evaluate(() => { const s = S.wkt.exs[1].sets[3]; stopRest(); return [s.kg, s.reps, !!s.done]; });
    await tape(1, 4, 1, '102,5'); await X.pg.evaluate(() => goScreen('home', document.getElementById('nb-home'))); await X.pg.waitForTimeout(250);
    await X.pg.evaluate(() => goScreen('log', document.getElementById('nb-log'))); await X.pg.waitForTimeout(250); res.ecranQuitte = await constat(1, 4, 'kg', 102.5);
    await X.pg.evaluate(() => { _expandedEx = 1; renderExBlocks(); });
    await tape(1, 5, 1, '102,5'); await X.pg.evaluate(() => document.activeElement.blur()); await X.pg.waitForTimeout(80); res.blur = await constat(1, 5, 'kg', 102.5);
    const ko = Object.keys(res).filter(k => !res[k].ok);
    t('DOM-T15 ⭐ préalable S2 — 13 façons réelles de quitter un champ après une frappe (autre champ de la ligne, d\'une autre ligne, Tab, Maj+Tab, Entrée sur les répétitions, avance automatique, clic et toucher dans le vide, ✓ cliqué, ✓ touché, ✓ d\'une autre ligne, changement d\'écran, `blur()`) : la valeur tapée est TOUJOURS dans le modèle et sur le téléphone — une frappe pas encore enregistrée ne reste que dans le champ actif (Chromium, pas l\'iPhone)',
      Object.keys(res).length === 13 && ko.length === 0 && res.clicCoche.done && res.toucherCoche.done && !res.cocheAutreLigne.done && _det(autreValidee) === _det([100, 5, true]),
      _det({ ko, res, autreValidee }));
    t('DOM-T15z aucune erreur de page (bloc B quinquies)', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ── C. DÉFILEMENT : DÉ-VALIDER NE FAIT PAS SAUTER LA PAGE ───────────────────────────────────────── */
  {
    const X = await ouvrir({ h: 560, wkt: WKT({ exs: [{ name: DC, sets: [S8(60, 8, 1), S8(60, 8), S8(60, 8), S8(60, 8), S8(60, 8), S8(60, 8)] },
      { name: SQ, sets: [S8(100, 5), S8(100, 5), S8(100, 5)] }] }) });
    const r8 = await X.pg.evaluate(async () => {
      const attendre = ms => new Promise(r => setTimeout(r, ms));
      const sc = document.getElementById('s-log'); sc.scrollTop = 0; await attendre(50);
      const max = sc.scrollHeight - sc.clientHeight; sc.scrollTop = Math.min(140, max); await attendre(50);
      const y0 = sc.scrollTop;
      document.querySelector('#sr-0-0 .chk').click();                       // DÉ-valider la série 1 : aucun repos, aucun défilement prévu
      await attendre(250);
      return { max, y0, y1: sc.scrollTop, defaite: !S.wkt.exs[0].sets[0].done }; });
    t('DOM-T05 ⭐ dé-valider une série (aucun défilement prévu) : la page ne saute pas — même position', r8.max > 0 && r8.y0 > 0 && r8.y1 === r8.y0 && r8.defaite, _det(r8));
    await X.cx.close();
  }

  /* ── D. LES ENCHAÎNEMENTS STRUCTURELS RESTENT CEUX D'AVANT (superset, dropset, pyramide) ─────────── */
  {
    const X = await ouvrir({ wkt: WKT({ exs: [Object.assign({ name: DC, sets: [S8(60, 8), S8(60, 8)] }, { group: 'g1', groupType: 'super' }),
      Object.assign({ name: SQ, sets: [S8(100, 5), S8(100, 5)] }, { group: 'g1', groupType: 'super' })] }) });
    const r9 = await X.pg.evaluate(async () => {
      const attendre = ms => new Promise(r => setTimeout(r, ms));
      const r0 = window.__rempl;
      toggleSet(0, 0); await attendre(120);
      const a = { exp: _expandedEx, repos: !!restIv, rempl: window.__rempl - r0 };
      toggleSet(1, 0); await attendre(150);
      const b = { exp: _expandedEx, repos: !!restIv, lbl: (document.getElementById('rest-label') || {}).textContent };
      stopRest(); return { a, b }; });
    t('DOM-T06 ⭐ supersérie : A validé → on passe à B tout de suite, sans repos (carte reconstruite, comme avant) ; B validé → retour à A, repos « ⚡ Tour suivant »',
      r9.a.exp === 1 && !r9.a.repos && r9.a.rempl >= 1 && r9.b.exp === 0 && r9.b.repos && r9.b.lbl === '⚡ Tour suivant', _det(r9));
    await X.cx.close();
  }
  {
    const X = await ouvrir({ wkt: WKT({ exs: [{ name: DC, sets: [S8(60, 8), S8(55, 8), S8(50, 8)], dropset: { paliers: 3, pct: 10, direction: 'down' } }] }) });
    const r10 = await X.pg.evaluate(async () => {
      const attendre = ms => new Promise(r => setTimeout(r, ms));
      toggleSet(0, 0); await attendre(250);
      const a = document.activeElement, ligne = a && a.closest ? a.closest('.set-row') : null;
      const p = { focus: ligne ? ligne.id : null, repos: !!restIv };
      toggleSet(0, 1); await attendre(250);
      toggleSet(0, 2); await attendre(150);
      const f = { repos: !!restIv, faits: S.wkt.exs[0].sets.map(s => !!s.done) };
      stopRest(); return { p, f }; });
    /* ↪️ 02/11 (SEANCE-HL-01) : l'étiquette « 📉 Série dégressive terminée » n'est pas exigée ICI mais par DOM-T20 / T20b (elle était posée AVANT
       `startRest()`, qui l'efface — corrigé). Ce témoin garde l'enchaînement : pas de repos entre paliers, focus au palier suivant, repos à la fin. */
    t('DOM-T07 ⭐ dropset ↓ : palier 1 validé → pas de repos, le focus va au palier suivant (comme avant) ; dernier palier → le repos part',
      r10.p.focus === 'sr-0-1' && !r10.p.repos && r10.f.repos && _det(r10.f.faits) === _det([true, true, true]), _det(r10));
    await X.cx.close();
  }
  {
    /* ── D ter. « 📉 Série dégressive terminée » SURVIT AU DÉPART DU REPOS (SEANCE-HL-01, 02/11/2026) ─────────────────────────────────
       `toggleSet` posait l'étiquette AVANT `startRest()`, dont `stopRest()` vide `#rest-label` : personne ne l'a jamais lue. Témoin de
       COMPORTEMENT — ce que la personne lit dans le dock du repos : l'étiquette est là et VISIBLE dès le dernier palier, elle est encore là
       après le 1ᵉʳ tic du minuteur, elle part avec le repos (« Passer »), et une série ordinaire n'en reçoit jamais. Les deux chemins qui la
       posent sont joués : dropset ↓ DANS l'exercice (T20), dernier exercice d'un groupe « drop » (T20b). */
    const ETIQ = '📉 Série dégressive terminée';
    const XD = await ouvrir({ wkt: WKT({ exs: [{ name: DC, sets: [S8(60, 8), S8(55, 8), S8(50, 8)], dropset: { paliers: 3, pct: 10, direction: 'down' } }] }) });
    const e1 = await XD.pg.evaluate(async () => {
      const attendre = ms => new Promise(r => setTimeout(r, ms));
      const lit = () => { const l = document.getElementById('rest-label'), r = l ? l.getBoundingClientRect() : { width: 0, height: 0 };
        return { txt: l ? l.textContent : null, vu: !!l && r.width > 0 && r.height > 0 && getComputedStyle(l).display !== 'none',
          barre: document.getElementById('rest-bar').classList.contains('show') }; };
      toggleSet(0, 0); await attendre(200); const p1 = lit();
      toggleSet(0, 1); await attendre(200); const p2 = lit();
      toggleSet(0, 2); await attendre(200); const fin = lit();
      await attendre(1300); const tic = lit();                  // le 1ᵉʳ tic du métronome (calage ≤ 1,1 s) est passé
      stopRest(); const arret = lit();                           // « Passer »
      return { p1, p2, fin, tic, arret }; });
    t('DOM-T20 ⭐ dropset ↓ : le dernier palier validé affiche « 📉 Série dégressive terminée » dans le dock (visible), elle SURVIT au premier tic du minuteur et part avec le repos ; avant le dernier palier, ni repos ni étiquette',
      !e1.p1.barre && !/dégressive/.test(e1.p1.txt || '') && !e1.p2.barre && !/dégressive/.test(e1.p2.txt || '')
      && e1.fin.barre && e1.fin.txt === ETIQ && e1.fin.vu && e1.tic.barre && e1.tic.txt === ETIQ && e1.tic.vu
      && !e1.arret.barre && e1.arret.txt === '', _det(e1));
    await XD.cx.close();
    const XG = await ouvrir({ wkt: WKT({ exs: [Object.assign({ name: DC, sets: [S8(60, 8), S8(55, 8)] }, { group: 'g3', groupType: 'drop' }),
      Object.assign({ name: SQ, sets: [S8(100, 5), S8(90, 5)] }, { group: 'g3', groupType: 'drop' })] }) });
    const e2 = await XG.pg.evaluate(async () => {
      const attendre = ms => new Promise(r => setTimeout(r, ms));
      const lit = () => { const l = document.getElementById('rest-label'), r = l ? l.getBoundingClientRect() : { width: 0, height: 0 };
        return { txt: l ? l.textContent : null, vu: !!l && r.width > 0 && r.height > 0 && getComputedStyle(l).display !== 'none',
          barre: document.getElementById('rest-bar').classList.contains('show') }; };
      toggleSet(0, 0); await attendre(200); const a = lit(), exp = _expandedEx;   // 1ᵉʳ exercice du groupe : on passe au suivant, sans repos
      toggleSet(1, 0); await attendre(200); const fin = lit();                     // dernier exercice du groupe : le repos part
      await attendre(1300); const tic = lit();
      stopRest(); const arret = lit();
      return { a, exp, fin, tic, arret }; });
    t('DOM-T20b ⭐ groupe « drop » : le dernier exercice du groupe validé affiche « 📉 Série dégressive terminée » (visible, encore là après le premier tic, retirée avec le repos) ; le premier exercice ne déclenche ni repos ni étiquette',
      !e2.a.barre && e2.exp === 1 && !/dégressive/.test(e2.a.txt || '') && e2.fin.barre && e2.fin.txt === ETIQ && e2.fin.vu
      && e2.tic.txt === ETIQ && e2.tic.vu && !e2.arret.barre && e2.arret.txt === '', _det(e2));
    await XG.cx.close();
    const XO = await ouvrir();
    const e3 = await XO.pg.evaluate(async () => {
      const attendre = ms => new Promise(r => setTimeout(r, ms));
      const lit = () => { const l = document.getElementById('rest-label'), r = l ? l.getBoundingClientRect() : { width: 0, height: 0 };
        return { txt: l ? l.textContent : null, vu: !!l && r.width > 0 && r.height > 0 && getComputedStyle(l).display !== 'none',
          barre: document.getElementById('rest-bar').classList.contains('show') }; };
      toggleSet(0, 0); await attendre(200); const o = lit();
      stopRest(); return { o }; });
    t('DOM-T20c une série ORDINAIRE n\'affiche jamais « Série dégressive terminée » (le repos part, sans cette étiquette)',
      e3.o.barre && !/dégressive/.test(e3.o.txt || ''), _det(e3));
    await XO.cx.close();
  }
  {
    // dropset ↑ (« monte le poids — repos normal entre les séries ») : il passe par la fin ordinaire de `toggleSet`, mais la ligne du
    // palier EN COURS porte des champs et les autres non — la structure change, la carte doit être reconstruite
    const X = await ouvrir({ wkt: WKT({ exs: [{ name: DC, sets: [S8(60, 8), S8(66, 8), S8(72.5, 8)], dropset: { paliers: 3, pct: 10, direction: 'up' } }] }) });
    const r10b = await X.pg.evaluate(async () => {
      const r0 = window.__rempl; toggleSet(0, 0); await new Promise(r => setTimeout(r, 120));
      const o = { rempl: window.__rempl - r0, champs0: document.querySelectorAll('#sr-0-0 .sinp').length, champs1: document.querySelectorAll('#sr-0-1 .sinp').length,
        repos: !!restIv, done: S.wkt.exs[0].sets[0].done };
      stopRest(); return o; });
    t('DOM-T07b ⭐ dropset ↑ (pyramide dans l\'exercice) : palier 1 validé → la carte est RECONSTRUITE (le palier en cours change de ligne : ses champs passent au palier 2), repos normal',
      r10b.rempl >= 1 && r10b.champs0 === 0 && r10b.champs1 === 2 && r10b.repos && r10b.done, _det(r10b));
    await X.cx.close();
  }
  {
    /* le `change` DIFFÉRÉ — un navigateur qui l'émettrait APRÈS le départ du champ (non vérifié sur iPhone ; Chromium l'émet pendant
       `blur()`) — sur le chemin de RECONSTRUCTION (dropset ↑ : le rendu ciblé refuse) : le champ quitté doit déjà porter la valeur
       retenue, sinon ce `change` tardif écrit 0 dans la série validée. C'est ce que garde la ligne visée par la mutation D09, qui
       survivait (sur le chemin ordinaire, le rendu ciblé réécrit le champ juste après). */
    const X = await ouvrir({ wkt: WKT({ exs: [{ name: DC, sets: [S8(60, 8), S8(66, 8), S8(72.5, 8)], dropset: { paliers: 3, pct: 10, direction: 'up' } }] }) });
    await X.pg.locator('#sr-0-0 .sinp').nth(0).click(); await X.pg.keyboard.press('Backspace'); await X.pg.waitForTimeout(80);
    const r = await X.pg.evaluate(async () => {
      const champ = document.querySelectorAll('#sr-0-0 .sinp')[0], vide = champ.value, r0 = window.__rempl;
      document.querySelector('#sr-0-0 .chk').click(); await new Promise(r => setTimeout(r, 200));
      const reconstruit = window.__rempl - r0 >= 1, detache = !document.contains(champ), affiche = champ.value;
      champ.dispatchEvent(new Event('change'));                         // le `change` tardif, après la reconstruction
      await new Promise(r => setTimeout(r, 50));
      const s = S.wkt.exs[0].sets[0]; stopRest();
      return { vide, reconstruit, detache, affiche, reps: s.reps, done: !!s.done }; });
    t('DOM-T09e un `change` DIFFÉRÉ (navigateur qui l\'émettrait après le départ du champ — non vérifié sur iPhone) sur le chemin de reconstruction (dropset ↑) : le champ vidé quitté portait déjà la valeur retenue — la série validée garde 8 répétitions, pas 0',
      r.vide === '' && r.reconstruit && r.detache && r.affiche === '8' && r.reps === 8 && r.done, _det(r));
    t('DOM-T09ez aucune erreur de page (bloc D, change différé)', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  {
    const X = await ouvrir({ wkt: WKT({ exs: [Object.assign({ name: DC, sets: [S8(60, 8), S8(60, 8)] }, { group: 'g2', groupType: 'pyramid-up' }),
      Object.assign({ name: SQ, sets: [S8(100, 5), S8(100, 5)] }, { group: 'g2', groupType: 'pyramid-up' })] }) });
    const r11 = await X.pg.evaluate(async () => {
      const attendre = ms => new Promise(r => setTimeout(r, ms));
      toggleSet(0, 0); await attendre(150);
      const o = { kgB: S.wkt.exs[1].sets.map(s => s.kg), attendu: _roundToGym(60 * 1.1), repos: !!restIv, lbl: (document.getElementById('rest-label') || {}).textContent };
      skipRest(); await attendre(150); o.exp = _expandedEx; return o; });
    t('DOM-T08 ⭐ pyramide + : A validé → les charges de B montent de 10 % (arrondi salle), repos « 📈 Pyramide + », et « Passer » ouvre B (comme avant)',
      _det(r11.kgB) === _det([r11.attendu, r11.attendu]) && r11.repos && r11.lbl === '📈 Pyramide +' && r11.exp === 1, _det(r11));
    await X.cx.close();
  }

  /* ── D bis. AUCUN REFUS SIGNALÉ DANS LES PARCOURS NORMAUX : supersérie, dropset ↓ et ↑, pyramide (31/10/2026, mutation D06) ──────
     Les groupes et les dropsets ne passent PAS par le rendu ciblé : ils en sont exclus d'emblée, en silence, et reconstruits comme
     avant. Le refus SIGNALÉ (console, journal d'erreurs) est fait pour l'imprévu : dans un parcours normal il ne doit JAMAIS se
     déclencher — sinon le journal se remplit de faux signalements et le rendu ciblé se dégrade sans le dire. Ici, sur chaque
     structure : valider, répondre à la réserve (2, « Échec », effacer), dé-valider ; et chaque carte de dropset est comparée, au
     caractère près, au rendu global juste après. Mutation D06 (les dropsets ne sont plus exclus d'emblée) : la campagne du 31/10 l'a
     vue survivre au témoin d'écran DOM-T07b — le filet reconstruisait la carte (écran juste), mais en signalant un refus. */
  {
    const supA = Object.assign({ name: DC, sets: [S8(60, 8), S8(60, 8)] }, { group: 'g1', groupType: 'super' });
    const supB = Object.assign({ name: SQ, sets: [S8(100, 5), S8(100, 5)] }, { group: 'g1', groupType: 'super' });
    const dBas = { name: 'Rowing Barre (Tirage Horizontal)', sets: [S8(60, 8), S8(55, 8), S8(50, 8)], dropset: { paliers: 3, pct: 10, direction: 'down' } };
    const dHaut = { name: 'Curl Barre', sets: [S8(30, 8), S8(33, 8), S8(36, 8)], dropset: { paliers: 3, pct: 10, direction: 'up' } };
    const pyrA = Object.assign({ name: 'Curl Haltères', sets: [S8(12, 10), S8(12, 10)] }, { group: 'g2', groupType: 'pyramid-up' });
    const pyrB = Object.assign({ name: 'Extension Triceps', sets: [S8(20, 12), S8(20, 12)] }, { group: 'g2', groupType: 'pyramid-up' });
    const X = await ouvrir({ wkt: WKT({ exs: [supA, supB, dBas, dHaut, pyrA, pyrB] }) });
    const r = await X.pg.evaluate(async () => {
      const att = ms => new Promise(r => setTimeout(r, ms));
      const photo = ei => { const live = document.getElementById('ex-block-' + ei); if (!live || live.classList.contains('ex-mini')) return null;
        const c = live.cloneNode(true), li = live.querySelectorAll('input');
        c.querySelectorAll('input').forEach((i, k) => i.setAttribute('value', li[k].value));
        c.querySelectorAll('textarea').forEach(ta => ta.removeAttribute('style')); return c.outerHTML; };
      const ecarts = [], gestes = [];
      // un geste : la carte de l'exercice ouverte, le geste, puis (dropsets) la carte comparée au rendu global ; repos arrêté
      const geste = async (nom, ei, f) => { _expandedEx = ei; renderExBlocks(); await att(30);
        f(); await att(160);
        if (ei === 2 || ei === 3) { const loc = photo(ei); renderExBlocks(); const glob = photo(ei);
          if (loc !== null && loc !== glob) ecarts.push(nom); }
        stopRest(); gestes.push(nom); };
      await geste('supersérie : A validée', 0, () => toggleSet(0, 0));
      await geste('supersérie : B validée', 1, () => toggleSet(1, 0));
      await geste('supersérie : réserve 2 sur A', 0, () => setRir(0, 0, 2));
      await geste('supersérie : « Échec » sur B', 1, () => setRir(1, 0, 'X'));
      await geste('supersérie : réserve effacée sur B', 1, () => setRir(1, 0, null));
      await geste('supersérie : A dé-validée', 0, () => toggleSet(0, 0));
      await geste('dropset ↓ : palier 1', 2, () => toggleSet(2, 0));
      await geste('dropset ↓ : palier 2', 2, () => toggleSet(2, 1));
      await geste('dropset ↓ : réserve 1 sur le palier 2', 2, () => setRir(2, 1, 1));
      await geste('dropset ↓ : palier 2 dé-validé', 2, () => toggleSet(2, 1));
      await geste('dropset ↑ : palier 1', 3, () => toggleSet(3, 0));
      await geste('dropset ↑ : réserve 2', 3, () => setRir(3, 0, 2));
      await geste('dropset ↑ : « Échec »', 3, () => setRir(3, 0, 'X'));
      await geste('dropset ↑ : palier 1 dé-validé', 3, () => toggleSet(3, 0));
      await geste('pyramide : A validée', 4, () => toggleSet(4, 0));
      await geste('pyramide : B validée', 5, () => toggleSet(5, 0));
      await geste('pyramide : réserve 3 sur A', 4, () => setRir(4, 0, 3));
      await geste('pyramide : A dé-validée', 4, () => toggleSet(4, 0));
      return { gestes: gestes.length, ecarts, faits: S.wkt.exs.map(e => e.sets.map(s => !!s.done)) }; });
    const refus = X.warns.filter(w => /rendu ciblé refusé/.test(w));
    t('DOM-T19 ⭐ D06 — supersérie, dropset ↓, dropset ↑ et pyramide : 18 gestes (validations, réserves 2 / « Échec » / effacée, dé-validations) — AUCUN refus signalé (le filet ne sert qu\'à l\'imprévu), chaque carte de dropset identique au rendu global, aucune erreur de page',
      r.gestes === 18 && refus.length === 0 && r.ecarts.length === 0 && X.errs.length === 0
      && _det(r.faits) === _det([[false, false], [true, false], [true, false, false], [false, false, false], [false, false], [true, false]]),
      _det({ refus: refus.slice(0, 3), ecarts: r.ecarts, faits: r.faits, errs: X.errs.slice(0, 2) }));
    await X.cx.close();
  }

  /* ── E. RECONSTRUCTIONS STRUCTURELLES ET REPRISE ──────────────────────────────────────────────────── */
  {
    const X = await ouvrir();
    const r12 = await X.pg.evaluate(async () => {
      const attendre = ms => new Promise(r => setTimeout(r, ms));
      const o = {}; let r0 = window.__rempl;
      addSet(0); await attendre(50); o.ajout = { rempl: window.__rempl - r0, ligne: !!document.getElementById('sr-0-4'), n: S.wkt.exs[0].sets.length };
      r0 = window.__rempl; rmLastSet(0); await attendre(50); o.retrait = { rempl: window.__rempl - r0, ligne: !!document.getElementById('sr-0-4'), n: S.wkt.exs[0].sets.length };
      r0 = window.__rempl; toggleExBlock(1); await attendre(50); o.ouvrir = { rempl: window.__rempl - r0, exp: _expandedEx, ligne: !!document.getElementById('sr-1-0') };
      r0 = window.__rempl; document.querySelector('#sr-1-0 .chk').click(); await attendre(80);
      o.apres = { rempl: window.__rempl - r0, done: S.wkt.exs[1].sets[0].done }; stopRest(); return o; });
    t('DOM-T10 ⭐ ajout / retrait de série et ouverture d\'une autre carte : reconstruction comme avant (la structure change) — et la série de la carte ouverte se valide ensuite SUR PLACE',
      r12.ajout.rempl >= 1 && r12.ajout.ligne && r12.ajout.n === 5 && r12.retrait.rempl >= 1 && !r12.retrait.ligne && r12.retrait.n === 4
      && r12.ouvrir.rempl >= 1 && r12.ouvrir.exp === 1 && r12.ouvrir.ligne && r12.apres.rempl === 0 && r12.apres.done, _det(r12));
    t('DOM-T10z aucune erreur de page (bloc E)', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  {
    const X = await ouvrir({ wkt: WKT({ exs: [{ name: DC, sets: [S8(60, 8, 1), S8(62.5, 8, 1), S8(60, 8), S8(60, 8)] }, { name: SQ, sets: [S8(100, 5)] }] }) });
    const r13 = await X.pg.evaluate(async () => {
      const lig = k => document.getElementById('sr-0-' + k);
      const o = { faites: [0, 1, 2, 3].map(k => lig(k).classList.contains('done-row')), cur: [0, 1, 2, 3].map(k => lig(k).classList.contains('set-cur')),
        meta: document.querySelector('#ex-block-0 .ex-meta').textContent };
      const r0 = window.__rempl; document.querySelector('#sr-0-2 .chk').click(); await new Promise(r => setTimeout(r, 80));
      o.apres = { rempl: window.__rempl - r0, done: S.wkt.exs[0].sets[2].done, kg: S.wkt.exs[0].sets.map(s => s.kg) }; stopRest(); return o; });
    t('DOM-T11 ⭐ réouverture d\'une séance en cours (2 séries faites) : affichage juste (2 faites, la 3ᵉ à faire, 2/4) et données intactes ; la série suivante se valide SUR PLACE',
      _det(r13.faites) === _det([true, true, false, false]) && _det(r13.cur) === _det([false, false, true, false]) && /^2\/4 séries/.test(r13.meta)
      && r13.apres.rempl === 0 && r13.apres.done && _det(r13.apres.kg) === _det([60, 62.5, 60, 60]), _det(r13));
    await X.cx.close();
  }

  /* ── F. INSTRUMENT : REMPLACEMENTS DOM AVANT / APRÈS (⛔ indicateur Chromium) ─────────────────────── */
  {
    const X = await ouvrir();
    const r14 = await X.pg.evaluate(async () => {
      const attendre = ms => new Promise(r => setTimeout(r, ms));
      const r0 = window.__rempl, a0 = window.__ajoutes;
      // règle d'or #9 : le bouton central « + » se MESURE (au dixième de pixel) après chaque geste — aucun champ actif ici
      const fab = () => { const r = document.getElementById('nb-log').getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(v => Math.round(v * 10) / 10).join(','); };
      const fabs = [fab()];
      for (let tour = 0; tour < 2; tour++) for (let k = 0; k < 4; k++) { document.querySelector('#sr-0-' + k + ' .chk').click(); await attendre(30); fabs.push(fab()); }
      for (let k = 0; k < 2; k++) { const deux = [...document.querySelectorAll('#rest-rir .rir-b')].find(x => x.textContent.trim() === '1'); if (deux) deux.click(); await attendre(30); fabs.push(fab()); }
      stopRest(); await attendre(30); fabs.push(fab());
      return { remplacements: window.__rempl - r0, noeuds: window.__ajoutes - a0, fabs }; });
    t('DOM-T12 ⭐ 8 gestes ordinaires (4 validations, 4 dé-validations) + réponses de réserve : 0 remplacement de `#wkt-exs` (avant ce lot : un par geste)',
      r14.remplacements === 0, _det({ remplacements: r14.remplacements, noeuds: r14.noeuds }));
    t('DOM-T14 ⭐ règle d\'or #9 — le bouton central « + » ne bouge pas : même position et même taille (mesurées) avant, après chacun des 8 gestes, des réponses de réserve et de l\'arrêt du repos',
      r14.fabs.length === 12 && r14.fabs.every(f => f === r14.fabs[0]) && !/^0,0,0,0$/.test(r14.fabs[0]), _det(r14.fabs));
    console.log('   ℹ️ DOM-T12 (indicatif) — nœuds ajoutés sous #wkt-exs pendant ces gestes : ' + r14.noeuds + ' (avant ce lot : chaque geste recréait toutes les cartes)');
    await X.cx.close();
  }

  /* ── G. LE RENDU CIBLÉ = LE RENDU GLOBAL, DANS PLUSIEURS ÉTATS (31/10/2026) ────────────────────────────────────────────────
     DOM-T01b ne comparait que la PREMIÈRE validation. Ici chaque geste ordinaire est suivi de la comparaison, au caractère près,
     entre la carte mise à jour sur place et celle que le rendu global produit juste après — série d'échauffement (É), série du
     milieu (la précédente pas faite), réserve RIR, « Échec » (pastille X), dé-validation, série suivante, dernière série, réserve
     effacée — avec une colonne « Précédent » qui montre la série EXACTE de la dernière fois. Chaque geste doit aussi être passé SUR
     PLACE (`#wkt-exs` jamais remplacé) : sinon la comparaison ne jugerait rien. */
  {
    const PREV = [{ date: '2026-10-27', startHour: 18, duration: 3600, vol: 2000, exs: [{ name: DC, sets: [{ kg: 40, reps: 10, type: 'É', done: true },
      { kg: 60, reps: 8, type: 'N', done: true }, { kg: 60, reps: 8, type: 'N', done: true }, { kg: 62.5, reps: 6, type: 'N', done: true }, { kg: 62.5, reps: 6, type: 'N', done: true }] }] }];
    const X = await ouvrir({ sessions: PREV, wkt: WKT({ exs: [{ name: DC, sets: [{ kg: 40, reps: 10, type: 'É', done: false }, S8(60, 8), S8(60, 8), S8(62.5, 6), S8(62.5, 6)] },
      { name: SQ, sets: [S8(100, 5), S8(100, 5)] }] }) });
    const photo = () => X.pg.evaluate(() => { const live = document.getElementById('ex-block-0'), c = live.cloneNode(true);
      const li = live.querySelectorAll('input'); c.querySelectorAll('input').forEach((i, k) => i.setAttribute('value', li[k].value));
      c.querySelectorAll('textarea').forEach(ta => ta.removeAttribute('style'));   // la hauteur des notes est posée par le rendu global seul
      return c.outerHTML; });
    const prec = await X.pg.evaluate(() => [...document.querySelectorAll('#ex-block-0 .sprev-v')].length);
    const etapes = [];
    for (const [nom, src] of [['É validée (1ʳᵉ)', "document.querySelector('#sr-0-0 .chk').click()"], ['3ᵉ validée, la 2ᵉ pas faite', "document.querySelector('#sr-0-2 .chk').click()"],
      ['réserve 2 sur la 3ᵉ', 'setRir(0,2,2)'], ['« Échec » sur la 3ᵉ (X)', "setRir(0,2,'X')"], ['3ᵉ dé-validée', "document.querySelector('#sr-0-2 .chk').click()"],
      ['2ᵉ validée', "document.querySelector('#sr-0-1 .chk').click()"], ['dernière (5ᵉ) validée', "document.querySelector('#sr-0-4 .chk').click()"], ['réserve effacée (✕) sur la 5ᵉ', 'setRir(0,4,null)']]) {
      const rempl = await X.pg.evaluate(async (src) => { const r0 = window.__rempl; (new Function(src))(); await new Promise(r => setTimeout(r, 120)); return window.__rempl - r0; }, src);
      const local = await photo();
      await X.pg.evaluate(() => renderExBlocks());
      const glob = await photo();
      await X.pg.evaluate(() => stopRest());
      let i = 0; while (i < local.length && local[i] === glob[i]) i++;
      etapes.push({ nom, surPlace: rempl === 0, egal: local === glob, ecart: local === glob ? '' : local.slice(Math.max(0, i - 50), i + 70) + ' ≠ ' + glob.slice(Math.max(0, i - 50), i + 70) });
    }
    const etat = await X.pg.evaluate(() => S.wkt.exs[0].sets.map(s => [s.kg, s.reps, s.type, !!s.done, s.rir === undefined ? null : s.rir]));
    t('DOM-T16 ⭐ HUIT états, pas seulement la 1ʳᵉ validation (É, milieu, réserve, Échec X, dé-validation, suivante, dernière, réserve effacée ; « Précédent » affiché) : chaque fois la carte est mise à jour SUR PLACE et elle est IDENTIQUE, au caractère près, à celle du rendu global juste après',
      prec >= 3 && etapes.length === 8 && etapes.every(e => e.surPlace && e.egal)
      && _det(etat) === _det([[40, 10, 'É', true, null], [60, 8, 'N', true, null], [60, 8, 'X', false, null], [62.5, 6, 'N', false, null], [62.5, 6, 'N', true, null]]),
      _det({ prec, ko: etapes.filter(e => !e.surPlace || !e.egal), etat }));
    t('DOM-T16z aucune erreur de page (bloc G)', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ── G bis. LE CHAMP VOISIN EN SAISIE TRAVERSE PLUSIEURS GESTES (31/10/2026) — DOM-T02/T03 n'en jugeaient qu'UN ─────────── */
  {
    const X = await ouvrir();
    await X.pg.locator('#sr-0-3 .sinp').nth(1).click(); await X.pg.keyboard.type('65'); await X.pg.waitForTimeout(80);
    const r = await X.pg.evaluate(async () => {
      const champ = document.querySelectorAll('#sr-0-3 .sinp')[1]; champ.setSelectionRange(1, 2);
      const att = ms => new Promise(r => setTimeout(r, ms)), r0 = window.__rempl, etapes = [];
      const note = nom => etapes.push({ nom, meme: document.activeElement === champ && champ.isConnected, val: champ.value, sel: [champ.selectionStart, champ.selectionEnd],
        modele: S.wkt.exs[0].sets[3].kg, kbd: document.getElementById('root').classList.contains('kbd-serie') });
      document.querySelector('#sr-0-0 .chk').click(); await att(80); note('1ʳᵉ validée');
      setRir(0, 0, 2); await att(50); note('réserve 2');
      document.querySelector('#sr-0-1 .chk').click(); await att(80); note('2ᵉ validée');
      setRir(0, 1, 'X'); await att(50); note('« Échec »');
      document.querySelector('#sr-0-1 .chk').click(); await att(80); note('2ᵉ dé-validée');
      document.querySelector('#sr-0-2 .chk').click(); await att(80); note('3ᵉ validée');
      stopRest(); await att(50); note('repos arrêté');
      return { etapes, rempl: window.__rempl - r0 }; });
    t('DOM-T16b ⭐ champ VOISIN en saisie (série 4, « 65 », sélection 1 → 2) pendant SEPT gestes (validations, réserve, « Échec », dé-validation, arrêt du repos) : à chaque étape le même champ, actif, même texte, même sélection, barre du clavier toujours posée — le modèle ne l\'a pas lu, rien n\'est reconstruit (simulation Chromium)',
      r.rempl === 0 && r.etapes.length === 7 && r.etapes.every(e => e.meme && e.val === '65' && e.sel[0] === 1 && e.sel[1] === 2 && e.modele === 60 && e.kbd), _det(r));
    t('DOM-T16y aucune erreur de page (bloc G bis)', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ── H. UN ÉCRAN QUI NE RESSEMBLE PLUS AU GABARIT, OU UNE ERREUR : RECONSTRUCTION COMPLÈTE, ET C'EST ÉCRIT (31/10/2026) ──────
     Avant, le rendu ciblé sautait en silence un élément absent (la ligne restait fausse) et avalait ses erreurs (`return false`
     muet). Il refuse maintenant — l'appelant reconstruit la carte — et l'écrit : console à chaque fois, journal d'erreurs de
     Profil → Admin (clé existante `ft4_errlog`) une seule fois par chargement. Rien n'est montré à la personne. */
  {
    const X = await ouvrir({ refusAttendus: true, wkt: WKT({ exs: [{ name: DC, sets: [0, 1, 2, 3, 4, 5, 6].map(() => S8(60, 8)) }, { name: SQ, sets: [S8(100, 5)] }] }) });
    const r = await X.pg.evaluate(async () => {
      const att = ms => new Promise(r => setTimeout(r, ms)), journal = () => JSON.parse(localStorage.getItem('ft4_errlog') || '[]').filter(x => /rendu ciblé/.test(x.m)).length;
      localStorage.removeItem('ft4_errlog');
      // chaque cas : un élément que le rendu ciblé vérifie disparaît de l'écran (désynchronisé), puis une série est validée par son ✓
      const cas = [['1RM de la série 2', '#sr-0-1 .srm', 1, '#sr-0-1 .srm'], ['pastille de la série 3', '#sr-0-2 .stype', 2, '#sr-0-2 .stype'],
        ['✓ d\'une AUTRE série (la 7ᵉ)', '#sr-0-6 .chk', 3, '#sr-0-6 .chk'], ['méta de la carte', '#ex-block-0 .ex-meta', 4, '#ex-block-0 .ex-meta'],
        ['une ligne entière (la 7ᵉ)', '#sr-0-6', 5, '#sr-0-6'], ['champ de charge de la série validée', '#sr-0-0 .sinp:nth-of-type(2)', 0, '#sr-0-0 input.sinp + input.sinp']];
      const o = [];
      for (const [nom, sel, si, revient] of cas) {
        const el = document.querySelector(sel); const present = !!el; if (el) el.remove();
        const r0 = window.__rempl;
        document.querySelector('#sr-0-' + si + ' .chk').click(); await att(120);
        o.push({ nom, present, rempl: window.__rempl - r0, revenu: !!document.querySelector(revient), done: !!S.wkt.exs[0].sets[si].done, journal: journal() });
        stopRest();
      }
      return o; });
    const avert = X.warns.filter(w => /rendu ciblé refusé/.test(w));
    t('DOM-T17 ⭐ SIX éléments que le rendu ciblé vérifie, retirés de l\'écran un à un (1RM, pastille, ✓ d\'une autre série, méta de la carte, ligne entière, champ de la série validée) : chaque validation reconstruit la carte (l\'élément revient) et la série est faite ; chaque refus est écrit dans la console, UNE seule fois dans le journal d\'erreurs (Profil → Admin) ; rien pour la personne (aucune erreur de page)',
      r.length === 6 && r.every(c => c.present && c.rempl > 0 && c.revenu && c.done && c.journal === 1) && avert.length === 6 && X.errs.length === 0,
      _det({ ko: r.filter(c => !(c.present && c.rempl > 0 && c.revenu && c.done && c.journal === 1)), avert: avert.length }));
    await X.cx.close();
  }
  {
    const X = await ouvrir({ refusAttendus: true });
    const r = await X.pg.evaluate(async () => {
      localStorage.removeItem('ft4_errlog');
      const orig = window._renderExHtml; let appels = 0;
      window._renderExHtml = function () { if (!appels++) throw new Error('panne simulée du gabarit'); return orig.apply(this, arguments); };
      const r0 = window.__rempl;
      document.querySelector('#sr-0-0 .chk').click(); await new Promise(r => setTimeout(r, 120));
      window._renderExHtml = orig;
      const lig = document.getElementById('sr-0-0');
      const o = { appels, rempl: window.__rempl - r0, done: !!S.wkt.exs[0].sets[0].done, doneRow: lig.classList.contains('done-row'), chk: lig.querySelector('.chk').textContent,
        journal: JSON.parse(localStorage.getItem('ft4_errlog') || '[]').filter(x => /rendu ciblé/.test(x.m) && /panne simulée/.test(x.m)).length };
      stopRest(); return o; });
    const avert = X.warns.filter(w => /rendu ciblé refusé/.test(w) && /panne simulée/.test(w));
    t('DOM-T18 ⭐ une ERREUR pendant le rendu ciblé (gabarit en panne, une fois) : la carte est reconstruite, la série validée s\'affiche faite — et l\'erreur est écrite (console, journal d\'erreurs), sans rien montrer à la personne (aucune erreur de page)',
      r.appels >= 2 && r.rempl > 0 && r.done && r.doneRow && r.chk === '✓' && avert.length === 1 && r.journal === 1 && X.errs.length === 0, _det({ r, avert }));
    await X.cx.close();
  }
  /* DOM-T19b — le même invariant sur TOUS les parcours normaux de ce banc (blocs A à G bis, D bis compris) : validations, saisies,
     sorties de champ, défilement, enchaînements, reconstructions, reprise. Seul le bloc H, qui casse l'écran exprès, en est exclu. */
  { const tous = normaux.reduce((a, w) => a.concat(w), []).filter(w => /rendu ciblé refusé/.test(w));
    t('DOM-T19b ⭐ aucun refus signalé dans AUCUN parcours normal du banc (' + normaux.length + ' contextes ; le bloc H, qui casse l\'écran exprès, est exclu)',
      normaux.length >= 12 && tous.length === 0, _det(tous.slice(0, 3))); }
}

/* ── TÉMOINS DE SOURCE (le code SEUL : commentaires retirés) ─────────────────────────────────────────────── */
function source(t, ROOT, fs, path) {
  const log = fs.readFileSync(path.join(ROOT, 'log.js'), 'utf8');
  const code = log.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\n}', i); return j < 0 ? '' : src.slice(i, j + 2); };
  const ts = corps(code, 'toggleSet'), sr = corps(code, 'setRir'), up = corps(code, 'updateWorkoutSetDOM');
  t('DOM-S1 ⭐ `toggleSet` et `setRir` passent par le rendu ciblé et ne reconstruisent tout QUE s\'il refuse — les enchaînements structurels gardent `renderExBlocks()`',
    /if\(!updateWorkoutSetDOM\(ei,si,_avant\)\)renderExBlocks\(\);\s*\}$/.test(ts.trim())
    && /if\(updateWorkoutSetDOM\(ei,si,_avant\)\)\{\s*persist\(\);\s*_renderRirRow\(\);\s*\}\s*else\{\s*persist\(\);\s*_renderRirRow\(\);\s*renderExBlocks\(\);\s*\}/.test(sr)
    && (ts.match(/renderExBlocks\(\)/g) || []).length === 7, _det({ toggleSet: (ts.match(/renderExBlocks\(\)/g) || []).length }));
  t('DOM-S2 le rendu ciblé n\'invente aucune règle : il refuse les groupes, les dropsets et le mode « Grouper », et prend la carte du MÊME gabarit que le rendu global (`_renderExHtml`)',
    /_groupMode\|\|ex\.group\|\|ex\.dropset/.test(up) && /_renderExHtml\(ei,false\)/.test(up) && !/innerHTML\s*=\s*[^;]*#wkt-exs/.test(up)
    && !/document\.getElementById\('wkt-exs'\)/.test(up), '');
  /* DOM-S3 RETIRÉ le 31/10/2026 (simplification S2) : il exigeait une FORME (`upSet(ei,si,f,inp.value)` dans `_saisieVersModele`).
     Ce qu'il protégeait — la valeur tapée passe par les mêmes conversions que `change` (`numFR` : « 67,5 » → 67,5 ; même 1RM) — est
     un COMPORTEMENT, jugé par DOM-T13a (« 67,5 » enregistré 67,5, 1RM de 67,5 × 8), T13c et T13d. Les mutations qui le visaient
     (D07, D11) sont attrapées par les témoins d'écran (DOM-T09b, DOM-T02). */
}

module.exports = { ecran, source };
