/* ═══════════════════════════════════════════════════════════════════════════════
   ⏱️ WORKOUT-CORE-01 · CHR-03 — UN SEUL MÉTRONOME DE REPOS, À 1 s (témoins CHR-T01 → CHR-T10, CHR-S1 → CHR-S4) —
   Claude N°2 (Séance), 30/10/2026, GO de développement (docs/WORKOUT-CORE-01.md).
   ⚠️ PRÉPARÉ sans exécution (30/10, GO DÉVELOPPEMENT) ; EXÉCUTÉ au GO TESTS du 30/10 : 1ᵉʳ passage 30 OK / 2 rouges, deux
   défauts DES TÉMOINS, corrigés ici (CHR-T03b, CHR-T09a) ; et la base `e2b942f3` a montré que CHR-T05b/c/d comptaient toute
   écriture du chiffre, pas seulement ses CHANGEMENTS (corrigé : ils mesurent maintenant le retard d'affichage, leur promesse).
   Ce que les témoins CONDUISENT : la vraie app servie en local, de vrais repos (`startRest`), −15 s / +15 s (`addRT`), « Régler »
   (`applyRestEdit`), « Passer », le tap sur l'écran GO, la pause, « Vider », « Annuler la séance », « Terminer » (vrai bouton), une
   réouverture avec un repos rangé, le retour au premier plan (`visibilitychange`), la navigation vers Nutrition / Milo / Progrès.
   Le temps qui passe est simulé en reculant le départ du repos d'un nombre ENTIER de secondes (même méthode que runner.js :
   `_restLeft()` est une soustraction sur `restStartTs` ; la phase du tic n'en est pas changée).
   Ce qu'ils OBSERVENT : les minuteurs vivants (espion posé avant tout script sur setInterval / setTimeout / clear* : type, période,
   NOM de la fonction appelée — `_restTick`, `_updPill`, `_restCaler`), le nombre de réveils par fonction, les vibrations (espion),
   le dock, la pilule, l'écran du décompte, `restIv` / `restStartTs` / `S.wkt.repos`, les mutations de l'écran (MutationObserver
   sur le dock, la pilule et le décompte), les métriques Chromium quand une session CDP s'ouvre (affichées, jamais jugées).
   Ce qu'ils NE COUVRENT PAS : l'iPhone réel (minuteurs gelés par iOS — simulé en retirant l'intervalle puis en reculant le départ),
   la BATTERIE (⛔ les compteurs sont des indicateurs sous Chromium Linux, jamais une mesure de batterie), le son (il n'y en a pas),
   `_wktChronoIv` (chrono de séance, hors périmètre : ses réveils sont comptés à part sous « (anonyme) », jamais jugés).
   Rouge attendu sur `e2b942f3` (deux intervalles, 250 ms et 500 ms), MESURÉ le 30/10 : CHR-T01, CHR-T02a, CHR-T02b, CHR-T09a,
   CHR-T10a, CHR-T10b, CHR-T10c, CHR-T10d, CHR-T10e, CHR-S1, CHR-S4 (`_restArmer` n'existe pas) ; et, par leur SEULE clause
   d'architecture (leurs clauses visibles sont vertes sur la base) : CHR-T04 (« un minuteur à 1 000 ms ») et CHR-T05a (« le
   métronome est réinstallé » — la simulation retire l'intervalle, la base ne le repose pas). Les autres sont des
   non-régressions (verts avant comme après).
   ═══════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '120', ft4_sessions: '[]' };
const SQ = 'Squat à la Barre';
const serie = (done, type) => ({ kg: 100, reps: 5, type: type || 'N', done: !!done });
// La séance active : chrono démarré il y a 10 min, une série faite, deux à faire (l'heure est celle du banc : aucun gel d'horloge ici).
const WKT = (extra) => Object.assign({ date: new Date().toISOString().slice(0, 10), startHour: 14, startTs: Date.now() - 10 * 60000,
  exs: [{ name: SQ, sets: [serie(1), serie(0), serie(0)] }] }, extra || {});
const _det = o => JSON.stringify(o);
const REPOS = ['_restTick', '_updPill', '_restCaler'];   // les fonctions que les minuteurs du repos appellent (avant / après le lot)

async function ecran(t, b, PORT) {
  const ouvrir = async (opts) => {
    opts = opts || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris',
      locale: 'fr-FR', hasTouch: true });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    const init = Object.assign({}, BASE, { ft4_wkt: JSON.stringify(opts.wkt || WKT()) });
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_wc'))return; sessionStorage.setItem('_wc','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); }catch(e){} })();`);
    /* espions, posés AVANT tout script de l'app :
       · minuteurs : chaque setInterval / setTimeout vivant (type, période, nom de la fonction), retiré quand il part ou est annulé ;
         chaque réveil compté par nom de fonction (`__fires`) ;
       · vibrations (`__vib`) ;
       · mutations de l'écran du repos (`__mut`) : dock, pilule, décompte — une mutation = une écriture que le navigateur a dû
         traiter (texte remplacé, attribut ou style posé). */
    await cx.addInitScript(`(()=>{ const reg=new Map(); window.__timers=reg; window.__fires={}; window.__vib=[];
      const si=window.setInterval, ci=window.clearInterval, st=window.setTimeout, ct=window.clearTimeout;
      const nom=f=>(f&&f.name)||'(anonyme)';
      window.setInterval=function(f,ms){ const n=nom(f), a=[].slice.call(arguments,2);
        const id=si.call(window,function(){ window.__fires[n]=(window.__fires[n]||0)+1; return f.apply(this,arguments); },ms,...a);
        reg.set(id,{type:'iv',ms:+ms||0,nom:n}); return id; };
      window.setTimeout=function(f,ms){ const n=nom(f), a=[].slice.call(arguments,2); let id;
        id=st.call(window,function(){ reg.delete(id); window.__fires[n]=(window.__fires[n]||0)+1; return (typeof f==='function')?f.apply(this,arguments):undefined; },ms,...a);
        reg.set(id,{type:'to',ms:+ms||0,nom:n}); return id; };
      window.clearInterval=function(id){ reg.delete(id); return ci.call(window,id); };
      window.clearTimeout=function(id){ reg.delete(id); return ct.call(window,id); };
      try{ navigator.vibrate=function(p){ window.__vib.push(p); return true; }; }catch(e){}
      window.__mut={dock:0,pill:0,cdown:0};
      document.addEventListener('DOMContentLoaded',()=>{
        const obs=(id,k)=>{ const el=document.getElementById(id); if(!el) return;
          new MutationObserver(r=>{ window.__mut[k]+=r.length; }).observe(el,{subtree:true,childList:true,characterData:true,attributes:true}); };
        obs('rest-bar','dock'); obs('rest-pill','pill'); obs('ov-rest-countdown','cdown'); });
    })();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const X = { cx, pg, errs };
    await nettoyer(X); if (opts.ecran !== 'home') await versSeance(X);
    return X;
  };
  const nettoyer = X => X.pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; });
  const versSeance = async X => { await X.pg.evaluate(() => { goScreen('log', document.getElementById('nb-log')); renderLog(); }); await X.pg.waitForTimeout(250); };
  const clic = async (X, sel) => { const loc = X.pg.locator(sel).filter({ visible: true });
    if (!(await loc.count())) return false; try { await loc.first().click({ timeout: 2500 }); } catch (e) { return false; } await X.pg.waitForTimeout(300); return true; };
  const confirmer = async X => { await X.pg.waitForTimeout(150);
    if (await X.pg.evaluate(() => { const o = document.getElementById('ov-confirm'); return !!(o && o.classList.contains('open')); })) await X.pg.click('#confirm-ok');
    await X.pg.waitForTimeout(600); };
  // l'état du repos : minuteurs vivants (seulement ceux du repos), moteur, écran
  const etat = X => X.pg.evaluate((REPOS) => { const v = [...window.__timers.values()];
    const fmt = l => (l < 0 ? '+' : '') + Math.floor(Math.abs(l) / 60) + ':' + String(Math.abs(l) % 60).padStart(2, '0');
    return { arme: !!restIv, iv: v.filter(x => x.type === 'iv' && REPOS.indexOf(x.nom) >= 0).map(x => x.nom + '@' + x.ms).sort(),
      cale: v.filter(x => x.nom === '_restCaler').length, pillIv: typeof _pillIv, debut: restStartTs, total: restTot,
      left: _restLeft(), attendu: fmt(_restLeft()),
      dock: document.getElementById('rest-bar').classList.contains('show'), temps: (document.getElementById('rest-time') || {}).textContent || '',
      pilule: document.getElementById('rest-pill').classList.contains('show'), pTemps: (document.getElementById('rest-pill-time') || {}).textContent || '',
      decompte: (document.getElementById('ov-rest-countdown') || { style: {} }).style.display === 'block',
      num: (document.getElementById('rcd-num') || {}).textContent || '', vib: (window.__vib || []).length, ecran: window._curScreen,
      repos: S.wkt ? (S.wkt.repos === undefined ? '∅' : S.wkt.repos) : 'pas de séance' }; }, REPOS);
  const compteurs = X => X.pg.evaluate(() => ({ fires: Object.assign({}, window.__fires), mut: Object.assign({}, window.__mut) }));
  const ecart = (a, b, k) => { const o = {}; Object.keys(b[k]).forEach(n => { o[n] = (b[k][n] || 0) - (a[k][n] || 0); }); return o; };

  /* ── A. UN SEUL MINUTEUR, JAMAIS DEUX, JAMAIS ORPHELIN ─────────────────────────────────────────────── */
  {
    const X = await ouvrir();
    await X.pg.evaluate(() => startRest(60));
    const a0 = await etat(X);
    await X.pg.waitForTimeout(400);
    const a1 = await etat(X);
    t('CHR-T01 ⭐ un repos qui démarre = UN minuteur périodique, `_restTick` à 1 000 ms — `_pillIv` (500 ms) n\'existe plus, et le repos est « armé » dès l\'appel (`restIv` non nul)',
      a0.arme && _det(a1.iv) === _det(['_restTick@1000']) && a1.cale === 0 && a1.pillIv === 'undefined', _det({ a0: [a0.arme, a0.iv, a0.cale], a1: [a1.iv, a1.cale, a1.pillIv] }));

    await X.pg.evaluate(() => { for (let i = 0; i < 5; i++) startRest(45 + i); });
    const b0 = await etat(X);
    await X.pg.waitForTimeout(1300);
    const b1 = await etat(X);
    t('CHR-T02a ⭐ cinq `startRest` d\'affilée → toujours UN seul minuteur du repos (aucun doublon), le dernier réglage gagne (49 s)',
      b0.arme && (b0.iv.length + b0.cale) === 1 && _det(b1.iv) === _det(['_restTick@1000']) && b1.cale === 0 && b1.total === 49,
      _det({ b0: [b0.iv, b0.cale], b1: [b1.iv, b1.cale, b1.total] }));

    await X.pg.evaluate(() => { addRT(15); addRT(-15); _reposReprendre(); for (let i = 0; i < 3; i++) document.dispatchEvent(new Event('visibilitychange')); });
    const b2 = await etat(X);
    await X.pg.waitForTimeout(1300);
    const b3 = await etat(X);
    t('CHR-T02b ⭐ −15 s, +15 s, une reprise (`_reposReprendre`) et trois retours au premier plan → toujours UN minuteur, à 1 000 ms',
      b2.arme && (b2.iv.length + b2.cale) === 1 && _det(b3.iv) === _det(['_restTick@1000']) && b3.cale === 0 && b3.arme,
      _det({ b2: [b2.iv, b2.cale], b3: [b3.iv, b3.cale] }));

    await X.pg.evaluate(() => { startRest(60); addRT(15); stopRest(); });
    const c0 = await etat(X);
    await X.pg.waitForTimeout(1300);
    const c1 = await etat(X);
    t('CHR-T02c ⛔ `stopRest()` pendant le calage : l\'armement ponctuel est annulé, RIEN ne se réarme ensuite (0 minuteur, `restIv` nul)',
      !c0.arme && !c1.arme && c1.iv.length === 0 && c1.cale === 0, _det({ c0: [c0.arme, c0.iv, c0.cale], c1: [c1.arme, c1.iv, c1.cale] }));

    // « n'écrire que ce qui change » ne doit jamais laisser un écran FAUX : « Passer » remet la bordure du dock à zéro à la main ;
    // le repos suivant, dans le même état d'affichage, doit la réécrire (la mémoire des valeurs écrites est vidée à l'arrêt)
    const nv = await X.pg.evaluate(() => {
      startRest(120); restStartTs -= 10000; _restTick();          // repos A : en cours, au-dessus de 50 % (bordure Cobalt)
      const a = { bd: document.getElementById('rest-bar').style.borderColor };
      skipRest();                                                 // l'arrêt remet `borderColor` à '' (ligne directe, hors cache)
      startRest(120);                                             // repos B : même bordure attendue que A
      const tm = document.getElementById('rest-time');
      const b = { bd: document.getElementById('rest-bar').style.borderColor, temps: tm.textContent, col: tm.style.color,
        over: (document.getElementById('rest-over') || {}).textContent };
      stopRest(); return { a, b }; });
    t('CHR-T11 ⭐ un repos NEUF repart d\'un écran juste : après « Passer » (qui efface la bordure du dock à la main), le repos suivant la réécrit — « 2:00 », Cobalt, sans « au-delà »',
      nv.a.bd !== '' && nv.b.bd === nv.a.bd && nv.b.temps === '2:00' && nv.b.col === 'var(--sea)' && nv.b.over === '', _det(nv));

    const fins = await X.pg.evaluate(async (REPOS) => {
      const dors = ms => new Promise(r => setTimeout(r, ms));
      const vivants = () => [...window.__timers.values()].filter(x => REPOS.indexOf(x.nom) >= 0).length;
      const o = {};
      const essai = async (nom, geste) => { startRest(60); await dors(50); geste(); await dors(1300); o[nom] = { vivants: vivants(), arme: !!restIv }; };
      await essai('passer', () => skipRest());
      await essai('tapGO', () => { restStartTs -= 55000; _restTick(); restStartTs -= 6000; _restTick(); _cdownTap(); });
      await essai('pause', () => toggleWktPause());
      if (typeof _isWktPaused === 'function' && _isWktPaused()) toggleWktPause();          // reprise : aucun repos ne revient
      await dors(1300); o.reprise = { vivants: vivants(), arme: !!restIv };
      await essai('expiration', () => { restStartTs -= (60 + 900) * 1000; document.dispatchEvent(new Event('visibilitychange')); });
      const sc = window.showConfirm; window.showConfirm = (a, b, cb) => cb();
      await essai('vider', () => clearAllEx());
      window.showConfirm = sc;
      return o; }, REPOS);
    const ok = Object.keys(fins).every(k => fins[k].vivants === 0 && !fins[k].arme);
    t('CHR-T03a ⭐ « Passer », tap sur GO, pause (puis reprise), expiration à +15 min, « Vider » → 0 minuteur du repos, `restIv` nul — aucun orphelin',
      ok && Object.keys(fins).length === 6, _det(fins));
    t('CHR-T03z aucune erreur de page (bloc A)', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  {
    const o = {};
    for (const nom of ['annuler', 'terminer']) {
      const X = await ouvrir();
      await X.pg.evaluate(() => startRest(60)); await X.pg.waitForTimeout(300);
      if (nom === 'annuler') await X.pg.evaluate(() => { const sc = window.showConfirm; window.showConfirm = (a, b, cb) => cb(); clearWkt(); window.showConfirm = sc; });
      else { o.boutonTerminer = await clic(X, '.tbs-fin'); await confirmer(X); }
      await X.pg.waitForTimeout(1300);
      const e = await etat(X);
      /* « plus de séance » ≠ `S.wkt` absent : `renderLog` recrée une séance VIDE (`if(!S.wkt) S.wkt={date,exs:[]}`), sur la base
         comme avec ce lot (1ᵉʳ passage du 30/10 : rouge sur `!!S.wkt`, défaut du témoin). On regarde ce qui compte : plus aucun
         exercice, plus de repos rangé, plus de séance en cours sur le téléphone. */
      const sc = await X.pg.evaluate(() => { let d = null; try { d = JSON.parse(localStorage.getItem('ft4_wkt') || 'null'); } catch (e) { d = 'illisible'; }
        return { exs: S.wkt ? (S.wkt.exs || []).length : 0, repos: !!(S.wkt && S.wkt.repos), disque: d === 'illisible' ? -1 : (d && d.exs ? d.exs.length : 0),
          sessions: (S.sessions || []).length }; });
      o[nom] = { vivants: e.iv.length + e.cale, arme: e.arme, seance: sc, err: X.errs.length };
      await X.cx.close();
    }
    t('CHR-T03b ⭐ fin DÉFINITIVE de la séance — « Annuler la séance » et « Terminer » (vrai bouton) → plus de séance, 0 minuteur du repos',
      o.boutonTerminer === true && ['annuler', 'terminer'].every(k => o[k].vivants === 0 && !o[k].arme && o[k].seance.exs === 0 && !o[k].seance.repos
        && o[k].seance.disque === 0 && o[k].err === 0) && o.annuler.seance.sessions === 0 && o.terminer.seance.sessions === 1, _det(o));
  }

  /* ── B. NAVIGATION : LE REPOS CONTINUE, L'AFFICHAGE EST EXACT TOUT DE SUITE ───────────────────────── */
  {
    const X = await ouvrir();
    await X.pg.evaluate(() => startRest(90)); await X.pg.waitForTimeout(400);
    const nav = await X.pg.evaluate(() => { const d0 = restStartTs, out = [];
      for (const ec of ['nutrition', 'coach', 'progress']) {
        goScreen(ec); const l = _restLeft();
        out.push({ ec, pilule: document.getElementById('rest-pill').classList.contains('show'),
          pT: document.getElementById('rest-pill-time').textContent, attendu: (l < 0 ? '+' : '') + Math.floor(Math.abs(l) / 60) + ':' + String(Math.abs(l) % 60).padStart(2, '0'),
          memeDepart: restStartTs === d0, arme: !!restIv }); }
      return out; });
    await X.pg.waitForTimeout(1300);
    const n1 = await etat(X);
    await X.pg.evaluate(() => goScreen('log', document.getElementById('nb-log')));
    const n2 = await etat(X);
    t('CHR-T04 ⭐ Nutrition, Milo, Progrès : le repos n\'est jamais arrêté (même départ), la pilule est EXACTE dès l\'arrivée sur l\'écran (sans attendre un tic) ; retour sur Séance : le dock aussi',
      nav.length === 3 && nav.every(x => x.pilule && x.pT === x.attendu && x.memeDepart && x.arme) && _det(n1.iv) === _det(['_restTick@1000'])
      && n2.dock && n2.temps === n2.attendu && !n2.pilule, _det({ nav, n1: n1.iv, n2: [n2.dock, n2.temps, n2.attendu, n2.pilule] }));
    t('CHR-T04z aucune erreur de page (bloc B)', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ── C. SUSPENSION, PHASE DU TIC, VIBRATIONS, CALLBACK DE FIN, 900 s ──────────────────────────────── */
  {
    const X = await ouvrir();
    await X.pg.evaluate(() => startRest(120)); await X.pg.waitForTimeout(1300);
    const s = await X.pg.evaluate(async () => {
      const dors = ms => new Promise(r => setTimeout(r, ms));
      while (((Date.now() - restStartTs) % 1000 + 1000) % 1000 < 300 || ((Date.now() - restStartTs) % 1000 + 1000) % 1000 > 700) await dors(10);   // loin d'un changement de seconde
      const orig = window._restTick; let n = 0; window._restTick = function () { n++; return orig.apply(this, arguments); };
      clearInterval(restIv);                       // iOS gèle les minuteurs de l'app en arrière-plan (simulé : plus aucun tic)
      const l0 = _restLeft();
      restStartTs -= 40000;                        // … pendant que 40 s passent
      const v0 = window.__vib.length, avant = document.getElementById('rest-time').textContent;
      document.dispatchEvent(new Event('visibilitychange'));   // retour au premier plan
      const l = _restLeft(), fmt = x => (x < 0 ? '+' : '') + Math.floor(Math.abs(x) / 60) + ':' + String(Math.abs(x) % 60).padStart(2, '0');
      const r = { l0, avant, apres: document.getElementById('rest-time').textContent, attendu: fmt(l), left: l, appels: n, vib: window.__vib.length - v0, arme: !!restIv };
      window._restTick = orig; return r; });
    await X.pg.waitForTimeout(1300);
    const s2 = await etat(X);
    t('CHR-T05a ⭐ suspension simulée (minuteurs gelés, 40 s écoulées) : au retour, le temps vient de l\'HORLOGE — 40 s de moins tout de suite, en UN seul appel (aucun tic rattrapé), aucune vibration ; puis le métronome est réinstallé',
      s.left === s.l0 - 40 && s.apres === s.attendu && s.avant !== s.apres && s.appels === 1 && s.vib === 0 && s.arme && _det(s2.iv) === _det(['_restTick@1000']),
      _det({ s, s2: s2.iv }));

    // la phase du tic après un changement de départ : le chiffre doit changer ≤ 0,25 s après chaque changement de seconde
    const phase = (geste) => X.pg.evaluate(async (geste) => {
      const dors = ms => new Promise(r => setTimeout(r, ms));
      startRest(300); await dors(1300);
      while (((Date.now() - restStartTs) % 1000 + 1000) % 1000 < 550) await dors(10);    // au milieu d'une seconde
      if (geste === 'plus15') addRT(15);
      if (geste === 'regler') { openRestEdit(); document.getElementById('re-min').value = '4'; document.getElementById('re-sec').value = '0'; applyRestEdit(); }
      if (geste === 'reprise') _reposReprendre();
      const el = document.getElementById('rest-time'), retards = [];
      let vu = el.textContent;     // seuls les CHANGEMENTS comptent : réécrire le même texte n'est pas un retard (T10b juge les écritures)
      const mo = new MutationObserver(() => { const v = el.textContent; if (v === vu) return; vu = v;
        retards.push(((Date.now() - restStartTs) % 1000 + 1000) % 1000); });
      mo.observe(el, { childList: true, characterData: true, subtree: true });
      await dors(4300); mo.disconnect();
      return retards; }, geste);
    const p15 = await phase('plus15'), pReg = await phase('regler'), pRep = await phase('reprise');
    const cale = r => r.length >= 3 && r.every(x => x <= 250);
    t('CHR-T05b ⭐ « +15 s » posé au milieu d\'une seconde : le tic se RECALE — le chiffre change ≤ 0,25 s après chaque changement de seconde (sans recalage : ~0,5 s de retard)',
      cale(p15), _det(p15));
    t('CHR-T05c « Régler » (4:00) posé au milieu d\'une seconde : même garantie', cale(pReg), _det(pReg));
    t('CHR-T05d une reprise (`_reposReprendre`) au milieu d\'une seconde : même garantie', cale(pRep), _det(pRep));
    console.log('   ℹ️ CHR-T05 (indicatif) — retard du chiffre après chaque changement de seconde, en ms : +15 s ' + _det(p15) + ' · Régler '
      + _det(pReg) + ' · reprise ' + _det(pRep));

    const v = await X.pg.evaluate(() => {
      startRest(60); clearInterval(restIv);        // minuteurs gelés
      const v0 = window.__vib.length;
      restStartTs -= 57000;                        // il reste 3 s : les secondes 10 → 4 ne sont jamais passées
      document.dispatchEvent(new Event('visibilitychange'));
      const a3 = window.__vib.slice(v0);
      clearInterval(restIv); clearTimeout(restIv); // encore gelé (calage ou intervalle, quel qu'il soit)
      const v1 = window.__vib.length;
      restStartTs -= 20000;                        // 17 s après la fin
      document.dispatchEvent(new Event('visibilitychange'));
      const fin = window.__vib.slice(v1), v2 = window.__vib.length;
      document.dispatchEvent(new Event('visibilitychange')); _restTick(); _restTick();
      const encore = window.__vib.slice(v2);
      stopRest(); return { a3, fin, encore }; });
    t('CHR-T06a ⭐ retour au premier plan à 3 s (secondes 10 → 4 jamais vues) : seule la seconde EN COURS vibre (au plus 60 ms + 80 ms) — aucune seconde sautée n\'est rattrapée',
      v.a3.length >= 1 && v.a3.length <= 2 && v.a3.every(p => p === 60 || p === 80), _det(v.a3));
    t('CHR-T06b ⭐ retour au premier plan après la fin : une vibration de fin et celle de l\'écran GO, une fois chacune — un 2ᵉ retour et deux tics n\'ajoutent RIEN',
      v.fin.length >= 1 && v.fin.length <= 2 && v.fin.every(p => Array.isArray(p)) && v.encore.length === 0, _det({ fin: v.fin, encore: v.encore }));

    // l'app reste ouverte : chaque seconde 5…1 vibre UNE fois (60 ms), 3…1 aussi sur l'écran du décompte (80 ms), GO et fin une fois
    await X.pg.evaluate(() => { window.__vib.length = 0; startRest(30); restStartTs -= 24000; });   // il reste 6 s
    await X.pg.waitForTimeout(7600);
    const va = await X.pg.evaluate(() => { const v = window.__vib.slice(); stopRest(); return v; });
    const n60 = va.filter(p => p === 60).length, n80 = va.filter(p => p === 80).length, nPat = va.filter(p => Array.isArray(p)).length;
    t('CHR-T06c ⭐ app ouverte, vrai temps : 5…1 vibrent chacune UNE fois (5 × 60 ms), 3…1 sur le décompte (3 × 80 ms), GO et fin une fois (2 motifs) — règles inchangées à 1 Hz',
      n60 === 5 && n80 === 3 && nPat === 2, _det(va));

    const cb = await X.pg.evaluate(async () => { const dors = ms => new Promise(r => setTimeout(r, ms));
      let n = 0; startRest(8); _restDoneCb = () => { n++; };      // ≤ 10 s : pas d'écran de décompte, chemin direct (callback différé de 400 ms)
      restStartTs -= 9000; _restTick(); _restTick();
      document.dispatchEvent(new Event('visibilitychange')); renderLog();
      await dors(1500); const direct = n;
      let m = 0; startRest(30); _restDoneCb = () => { m++; };     // > 10 s : l'écran GO garde le callback jusqu'au tap
      restStartTs -= 25000; _restTick();                          // 5 s : l'écran du décompte s'ouvre
      restStartTs -= 10000; _restTick(); _restTick();             // fin, écran ouvert
      await dors(1500); const avantTap = m;
      _cdownTap(); _cdownTap(); await dors(600);
      let k = 0; startRest(30); _restDoneCb = () => { k++; }; skipRest(); skipRest(); await dors(600);
      return { direct, avantTap, apresTap: m, passer: k }; });
    t('CHR-T07 ⭐ le callback de fin part UNE fois — chemin direct (tics répétés, retour au premier plan, renderLog, un tic du métronome), écran GO (au tap, pas avant ; deux taps = une fois), « Passer » (deux fois = une fois)',
      cb.direct === 1 && cb.avantTap === 0 && cb.apresTap === 1 && cb.passer === 1, _det(cb));

    const e = await X.pg.evaluate(() => { startRest(60); restStartTs -= (60 + 899) * 1000; _restTick();
      const a = { arme: !!restIv, dock: document.getElementById('rest-bar').classList.contains('show'), temps: document.getElementById('rest-time').textContent };
      restStartTs -= 1000; _restTick();
      const b = { arme: !!restIv, dock: document.getElementById('rest-bar').classList.contains('show'), repos: S.wkt && S.wkt.repos !== undefined };
      return { a, b }; });
    await X.pg.waitForTimeout(1300);
    const e2 = await etat(X);
    t('CHR-T08 ⭐ dépassement : à +14:59 le repos tourne encore ; à +15:00 il est abandonné — minuteur retiré, dock caché, état rangé effacé, et rien ne se réarme',
      e.a.arme && e.a.dock && e.a.temps === '+14:59' && !e.b.arme && !e.b.dock && e.b.repos === false && !e2.arme && e2.iv.length === 0 && e2.cale === 0,
      _det({ e, e2: [e2.arme, e2.iv, e2.cale] }));
    t('CHR-T08z aucune erreur de page (bloc C)', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ── D. REPRISE APRÈS FERMETURE (repos rangé dans la séance) ──────────────────────────────────────── */
  {
    const debut = Date.now() - 40000;
    const X = await ouvrir({ wkt: WKT({ repos: { debut, total: 120 } }), ecran: 'home' });
    const d0 = await etat(X);
    await X.pg.waitForTimeout(1300);
    /* lu au MILIEU d'une seconde : le chiffre change ~0,1 s APRÈS chaque changement de seconde (le calage, voulu ; CHR-T05 en
       borne le retard) — lu au hasard, il retarde d'une seconde ~1 fois sur 10 (1ᵉʳ passage du 30/10 : « 1:18 » contre « 1:17 ») */
    await X.pg.evaluate(() => new Promise(r => { const f = () => { const pos = ((Date.now() - restStartTs) % 1000 + 1000) % 1000;
      if (pos >= 450 && pos <= 650) r(); else setTimeout(f, 10); }; f(); }));
    const d1 = await etat(X);
    t('CHR-T09a ⭐ réouverture avec un repos rangé (parti il y a ~40 s) : il reprend à l\'heure réelle — UN minuteur à 1 000 ms, même départ, la pilule EXACTE',
      d1.arme && _det(d1.iv) === _det(['_restTick@1000']) && d1.cale === 0 && d1.debut === debut && d1.total === 120 && d0.pilule && d1.pilule && d1.pTemps === d1.attendu,
      _det({ d0: [d0.arme, d0.pilule, d0.pTemps, d0.attendu], d1: [d1.iv, d1.cale, d1.debut - debut, d1.pTemps, d1.attendu] }));
    await X.cx.close();
    const Y = await ouvrir({ wkt: WKT({ repos: { debut: Date.now() - (120 + 900 + 5) * 1000, total: 120 } }), ecran: 'home' });
    await Y.pg.waitForTimeout(1300);
    const y = await etat(Y);
    t('CHR-T09b réouverture 15 min après la fin du repos rangé : rien n\'est repris — 0 minuteur, état effacé',
      !y.arme && y.iv.length === 0 && y.cale === 0 && y.repos === '∅' && !y.pilule, _det({ arme: y.arme, iv: y.iv, cale: y.cale, repos: y.repos, pilule: y.pilule }));
    await Y.cx.close();
  }

  /* ── E. INSTRUMENTS : RÉVEILS ET MUTATIONS, AVANT / APRÈS (⛔ indicateurs Chromium, PAS une mesure de batterie) ── */
  {
    const X = await ouvrir();
    let cdp = null; try { cdp = await X.cx.newCDPSession(X.pg); await cdp.send('Performance.enable'); } catch (e) { cdp = null; }
    const met = async () => { if (!cdp) return null; try { const r = await cdp.send('Performance.getMetrics'); const o = {};
      r.metrics.forEach(m => { if (['RecalcStyleCount', 'LayoutCount', 'ScriptDuration', 'TaskDuration'].indexOf(m.name) >= 0) o[m.name] = m.value; }); return o; } catch (e) { return null; } };
    await X.pg.evaluate(() => startRest(300)); await X.pg.waitForTimeout(1300);
    const m0 = await compteurs(X), k0 = await met();
    await X.pg.waitForTimeout(10000);
    const m1 = await compteurs(X), k1 = await met();
    const f = ecart(m0, m1, 'fires'), mu = ecart(m0, m1, 'mut');
    const rev = (f._restTick || 0) + (f._updPill || 0) + (f._restCaler || 0);
    t('CHR-T10a ⭐ réveils du repos sur 10 s, écran Séance : 8 à 12 (un par seconde) — avant ce lot ≈ 60 (`_restTick` 4/s + `_updPill` 2/s)',
      rev >= 8 && rev <= 12, _det(f));
    t('CHR-T10b ⭐ écritures du dock sur 10 s : ≤ 40 mutations (le chiffre, la barre, l\'anneau : ~3/s) — avant ce lot, 9 écritures à chaque tic, 4 tics/s',
      mu.dock <= 40, _det(mu));
    await X.pg.evaluate(() => goScreen('home'));
    const p0 = await compteurs(X); await X.pg.waitForTimeout(5000); const p1 = await compteurs(X);
    const mp = ecart(p0, p1, 'mut');
    t('CHR-T10c ⭐ pilule sur l\'Accueil, 5 s : ≤ 20 mutations (avant ce lot : 4 écritures × 6 appels/s)', mp.pill <= 20, _det(mp));
    await X.pg.evaluate(() => { goScreen('log', document.getElementById('nb-log')); startRest(30); restStartTs -= 21000; });   // il reste 9 s
    await X.pg.waitForTimeout(1300);
    const c0 = await compteurs(X); await X.pg.waitForTimeout(4000); const c1 = await compteurs(X);
    const mc = ecart(c0, c1, 'mut');
    t('CHR-T10d ⭐ décompte final, 4 s : ≤ 80 mutations (seuls les traits qui changent : ~4-5/s + le chiffre) — avant ce lot, les 44 traits repeints à chaque tic',
      mc.cdown <= 80, _det(mc));
    await X.pg.evaluate(() => { restStartTs -= 10000; });              // au-delà de la fin : écran GO, sans toucher
    await X.pg.waitForTimeout(1300);
    const g0 = await compteurs(X); await X.pg.waitForTimeout(3000); const g1 = await compteurs(X);
    const mg = ecart(g0, g1, 'mut');
    t('CHR-T10e ⭐ écran GO laissé ouvert, 3 s : ≤ 15 mutations (le « +N s » une fois par seconde) — avant ce lot, 44 traits + libellé + « GO » à chaque tic',
      mg.cdown <= 15, _det(mg));
    await X.pg.evaluate(() => stopRest());
    // ℹ️ indicatif, JAMAIS jugé : métriques du moteur de rendu sur les 10 s de repos ci-dessus
    console.log('   ℹ️ CHR-T10 (indicatif, PAS une mesure de batterie) — réveils/10 s : ' + _det(f) + ' · mutations/10 s : ' + _det(mu)
      + ' · pilule (Accueil, 5 s) : ' + _det(mp) + ' · décompte (4 s) : ' + _det(mc) + ' · écran GO (3 s) : ' + _det(mg)
      + ' · métriques Chromium/10 s : ' + (k0 && k1 ? _det(Object.keys(k1).reduce((o, n) => { o[n] = +(k1[n] - k0[n]).toFixed(4); return o; }, {})) : 'session CDP indisponible'));
    t('CHR-T10z aucune erreur de page (bloc E)', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
}

/* ── TÉMOINS DE SOURCE (le code SEUL : commentaires retirés) ─────────────────────────────────────────────── */
function source(t, ROOT, fs, path) {
  const log = fs.readFileSync(path.join(ROOT, 'log.js'), 'utf8');
  const code = log.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\n}', i); return j < 0 ? '' : src.slice(i, j + 2); };
  const iv = code.match(/setInterval\(\s*_restTick\s*,\s*\d+\s*\)/g) || [];
  const ecrivains = (code.match(/(?<!let )\brestIv\s*=(?!=)/g) || []).length;   // la déclaration `let restIv=null` ne compte pas
  t('CHR-S1 ⭐ un seul minuteur périodique du repos dans le code : `setInterval(_restTick,1000)` une fois, aucun `_pillIv`, `restIv` posé seulement par `_restArmer` / `_restDesarmer`',
    _det(iv) === _det(['setInterval(_restTick,1000)']) && !/\b_pillIv\b/.test(code) && !/setInterval\(\s*_updPill/.test(code)
    && ecrivains === (corps(code, '_restArmer').match(/\brestIv\s*=(?!=)/g) || []).length + (corps(code, '_restDesarmer').match(/\brestIv\s*=(?!=)/g) || []).length,
    _det({ iv, ecrivains }));
  t('CHR-S2 le temps restant vient toujours de l\'horloge : `_restLeft()` = restTot − ⌊(Date.now() − restStartTs) / 1000⌋, inchangé',
    /return restTot-Math\.floor\(\(Date\.now\(\)-restStartTs\)\/1000\);/.test(corps(code, '_restLeft')), corps(code, '_restLeft').slice(0, 120));
  t('CHR-S3 ⛔ aucun son : ni AudioContext, ni Audio dans log.js (le code, pas les commentaires)',
    !/AudioContext|webkitAudioContext|new\s+Audio\s*\(/.test(code), '');
  const appels = ['startRest', '_reposReprendre', 'addRT', 'applyRestEdit'].filter(f => /_restArmer\(\)/.test(corps(code, f)));
  const nArm = (code.match(/(?<!function )_restArmer\(\)/g) || []).length;   // les APPELS, pas la déclaration
  t('CHR-S4 le métronome est (re)posé là où le repos commence, reprend ou change de phase — startRest, _reposReprendre, addRT, applyRestEdit — et au retour au premier plan ; jamais ailleurs',
    appels.length === 4 && /if\(restIv\)\{\s*_restTick\(\);\s*_restArmer\(\);\s*\}/.test(code) && nArm === 5, _det({ appels, nArm }));
}

module.exports = { ecran, source };
