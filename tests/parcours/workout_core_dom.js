/* ═══════════════════════════════════════════════════════════════════════════════
   ⚡ WORKOUT-CORE-01 · DOM-01/02 — LE RENDU CIBLÉ D'UNE SÉRIE (témoins DOM-T01 → DOM-T12, DOM-R1, DOM-S1 → DOM-S3) —
   Claude N°2 (Séance), 30/10/2026, GO de développement (docs/WORKOUT-CORE-01.md).
   ⚠️ PRÉPARÉ, JAMAIS EXÉCUTÉ À L'ÉCRITURE (GO TESTS non accordé) : seule la syntaxe a été vérifiée. Le premier passage dira si une
   attente ou un sélecteur est à reprendre — à lire comme tel, pas comme une régression de l'app.
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
   Rouge attendu sur `e2b942f3` (chaque validation reconstruisait `#wkt-exs`) : DOM-T01, DOM-T02, DOM-T03, DOM-T04, DOM-T09b,
   DOM-T11, DOM-T12, DOM-R1, DOM-S1 ; DOM-T09a si le navigateur n'enregistre pas le champ détruit (à mesurer, comme DOM-T05 et
   DOM-T09c). Les autres sont des non-régressions (verts avant comme après).
   ═══════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '120', ft4_sessions: '[]' };
const DC = 'Développé Couché', SQ = 'Squat à la Barre';
const S8 = (kg, reps, done) => ({ kg, reps, type: 'N', done: !!done });
// Deux exercices ordinaires (hors groupe) : 4 séries pré-remplies à 60 kg × 8, puis 3 à 100 kg × 5. Séance démarrée il y a 10 min.
const WKT = (extra) => Object.assign({ date: new Date().toISOString().slice(0, 10), startHour: 14, startTs: Date.now() - 10 * 60000,
  exs: [{ name: DC, sets: [S8(60, 8), S8(60, 8), S8(60, 8), S8(60, 8)] }, { name: SQ, sets: [S8(100, 5), S8(100, 5), S8(100, 5)] }] }, extra || {});
const _det = o => JSON.stringify(o);

async function ecran(t, b, PORT) {
  const ouvrir = async (opts) => {
    opts = opts || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: opts.h || 844 }, timezoneId: 'Europe/Paris',
      locale: 'fr-FR', hasTouch: true });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    const init = Object.assign({}, BASE, { ft4_wkt: JSON.stringify(opts.wkt || WKT()) });
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_wd'))return; sessionStorage.setItem('_wd','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); }catch(e){} })();`);
    /* espions, posés AVANT tout script de l'app : vibrations ; chaque sauvegarde de `ft4_wkt` (les séries telles qu'enregistrées) ;
       les remplacements des enfants de `#wkt-exs` (le rendu global) et le nombre de nœuds ajoutés dessous */
    await cx.addInitScript(`(()=>{ window.__vib=[]; window.__snaps=[]; window.__rempl=0; window.__ajoutes=0;
      try{ navigator.vibrate=function(p){ window.__vib.push(p); return true; }; }catch(e){}
      const si=Storage.prototype.setItem;
      Storage.prototype.setItem=function(k,v){ try{ if(this===window.localStorage&&k==='ft4_wkt'){ const w=JSON.parse(v);
        window.__snaps.push((w&&w.exs||[]).map(e=>(e.sets||[]).map(s=>({kg:s.kg,reps:s.reps,done:!!s.done})))); } }catch(e){}
        return si.apply(this,arguments); };
      document.addEventListener('DOMContentLoaded',()=>{ const c=document.getElementById('wkt-exs'); if(!c) return;
        new MutationObserver(r=>{ r.forEach(x=>{ if(x.target===c&&x.type==='childList') window.__rempl++; window.__ajoutes+=x.addedNodes.length; }); })
          .observe(c,{childList:true,subtree:true}); });
    })();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const X = { cx, pg, errs };
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
    t('DOM-T03 ⭐ … la sélection posée dans ce champ (caractères 0 à 1) est intacte', r2.sel[0] === 0 && r2.sel[1] === 1, _det(r2.sel));
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
    /* ⚠️ L'étiquette « 📉 Série dégressive terminée » n'est PAS exigée ici : dans `toggleSet`, elle est posée AVANT `startRest()`, qui
       l'efface (`_stopRestTimerOnly`) — comportement existant, vu à la lecture le 30/10, non reproduit, hors de ce lot (signalé dans
       docs/WORKOUT-CORE-01.md). Ce témoin garde l'enchaînement : pas de repos entre paliers, focus au palier suivant, repos à la fin. */
    t('DOM-T07 ⭐ dropset ↓ : palier 1 validé → pas de repos, le focus va au palier suivant (comme avant) ; dernier palier → le repos part',
      r10.p.focus === 'sr-0-1' && !r10.p.repos && r10.f.repos && _det(r10.f.faits) === _det([true, true, true]), _det(r10));
    await X.cx.close();
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
      for (let tour = 0; tour < 2; tour++) for (let k = 0; k < 4; k++) { document.querySelector('#sr-0-' + k + ' .chk').click(); await attendre(30); }
      for (let k = 0; k < 2; k++) { const deux = [...document.querySelectorAll('#rest-rir .rir-b')].find(x => x.textContent.trim() === '1'); if (deux) deux.click(); await attendre(30); }
      stopRest(); await attendre(30);
      return { remplacements: window.__rempl - r0, noeuds: window.__ajoutes - a0 }; });
    t('DOM-T12 ⭐ 8 gestes ordinaires (4 validations, 4 dé-validations) + réponses de réserve : 0 remplacement de `#wkt-exs` (avant ce lot : un par geste)',
      r14.remplacements === 0, _det(r14));
    console.log('   ℹ️ DOM-T12 (indicatif) — nœuds ajoutés sous #wkt-exs pendant ces gestes : ' + r14.noeuds + ' (avant ce lot : chaque geste recréait toutes les cartes)');
    await X.cx.close();
  }
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
  t('DOM-S3 la valeur tapée de la série validée passe par `upSet` (mêmes conversions `numFR`, même 1RM) — aucune conversion recopiée',
    /upSet\(ei,si,f,inp\.value\)/.test(corps(code, '_saisieVersModele')) && /if\(row&&!set\.done\)_saisieVersModele\(ei,si,row\);/.test(ts), '');
}

module.exports = { ecran, source };
