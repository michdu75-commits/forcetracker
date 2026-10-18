/* ═════════════════════════════════════════════════════════════════════════════════════════════
   🎨 UX — INTÉGRATION DES DÉCISIONS DU 17/10/2026 (blocs B-UXI-*) — D-085, branche claude/ux-seance-02.
   Les décisions A→M de Michel : jeton « Cobalt » de séance (A) · Terminer Cobalt, rouge réservé au destructif (B) ·
   point bleu plein sur le « + », jamais rogné, sans collision (C) · 6 entrées, « + » de taille et d'ombre constantes (D) ·
   cartes de type en texte seul (E) · silhouette gardée (F) · type en badge sur le numéro, 1RM dans sa colonne, cibles
   ≥ 44 px (G) · barre du bas masquée pendant la saisie d'une série (H) · onglets « Discussion / Espace Milo » (I) ·
   courbes Progrès neutres, progrès en vert, record en or (J) · cardio à part dans « Autres options » (K) · « Autre
   activité » NON construite (L) · « Séance prête » (M).
   Ce que les témoins CONDUISENT : la vraie app servie en local, les vrais boutons (en-tête, ⋯, Terminer, numéro de
   série, onglets du Coach), le vrai focus d'un champ de série, goScreen, renderChart, toggleSet.
   Ce qu'ils OBSERVENT : les couleurs CALCULÉES (getComputedStyle), les rectangles mesurés, la classe de la barre du bas,
   S.wkt / coachHistory / localStorage avant-après, les appels réseau (fetch espionné).
   Ce qu'ils NE COUVRENT PAS : le vrai clavier iOS (simulé ici en réduisant visualViewport), la vraie encoche
   (env(safe-area-inset-bottom) vaut 0 en Chromium) → recette iPhone ; Milo lui-même (aucun appel).
   ═════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_lms: '2026-09' };
const _det = o => JSON.stringify(o);
const DC = 'Développé Couché', DM = 'Développé Militaire';
// Deux exercices dans l'historique : le Développé Couché MONTE (90 → 100 kg), le Militaire DESCEND (60 → 50 kg).
const HISTO = () => {
  const s = (j, dc, dm) => { const ts = Date.parse('2026-10-' + String(j).padStart(2, '0') + 'T10:00:00');
    return { id: ts, ts, date: '2026-10-' + String(j).padStart(2, '0'), synced: true, volume: 2000,
      exs: [{ name: DC, sets: [{ kg: dc, reps: 8, done: true, type: 'N' }] }, { name: DM, sets: [{ kg: dm, reps: 8, done: true, type: 'N' }] }] }; };
  return [s(13, 100, 50), s(9, 95, 55), s(6, 90, 60)];
};
const PROGS = () => [{ id: 'p1', name: 'Push', exs: [{ name: DC, sets: [{ kg: 0, reps: 8, type: 'N' }] }] }];
const COBALT = 'rgb(47, 91, 255)', SEA = 'rgb(124, 149, 255)';

async function ecran(t, b, PORT) {
  const ouvrir = async (opts) => {
    opts = opts || {};
    const W = opts.w || 390, H = opts.h || 844;
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: W, height: H }, timezoneId: 'Europe/Paris' });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    const init = Object.assign({}, BASE, { ft4_sessions: JSON.stringify(opts.sessions || HISTO()), ft4_progs: JSON.stringify(PROGS()) });
    if (opts.wkt !== undefined) { init.ft4_wkt = JSON.stringify(opts.wkt); init.ft4_wkt_draft = JSON.stringify(opts.wkt); }
    if (opts.hist) init.ft4_coach_hist = JSON.stringify(opts.hist);
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_uxi'))return; sessionStorage.setItem('_uxi','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}
      window.__fetchN=0; const f=window.fetch; window.fetch=function(){ window.__fetchN++; return f.apply(this,arguments); };})();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; });
    return { cx, pg, errs, W, H };
  };
  const wkt = (exs, extra) => Object.assign({ date: '__TODAY__', startHour: 10, startTs: Date.now() - 600000, exs }, extra || {});
  const fixDate = async X => X.pg.evaluate(() => { if (S.wkt && S.wkt.date === '__TODAY__') { S.wkt.date = today(); persist(); } });
  const vers = async (X, id) => { await X.pg.evaluate(id => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    goScreen(id, document.getElementById('nb-' + id)); }, id); await X.pg.waitForTimeout(300); };
  const VIS = `(e=>{ if(!e) return false; for(let x=e;x&&x!==document.documentElement;x=x.parentElement){ const c=getComputedStyle(x); if(c.display==='none'||c.visibility==='hidden') return false; } return e.getClientRects().length>0; })`;
  const style = (X, sel, prop, pseudo) => X.pg.evaluate(([sel, prop, pseudo]) => { const e = document.querySelector(sel); return e ? getComputedStyle(e, pseudo || null)[prop] : null; }, [sel, prop, pseudo || null]);
  const bouton = (X, txt, sel) => X.pg.evaluate(([txt, sel, VIS]) => { const vis = eval(VIS);
    const e = [...document.querySelectorAll(sel)].filter(e => vis(e) && (e.textContent || '').replace(/\s+/g, ' ').includes(txt))[0];
    return e ? { bg: getComputedStyle(e).backgroundColor, img: getComputedStyle(e).backgroundImage, col: getComputedStyle(e).color } : null; }, [txt, sel, VIS]);
  // Texte VISIBLE de l'en-tête (innerText ignore ce qui est caché, comme le chrono d'une séance prête).
  const entete = X => X.pg.evaluate(() => (document.querySelector('.topbar').innerText || '').replace(/\s+/g, ' ').trim());
  const confirmOk = X => X.pg.evaluate(() => { const o = document.getElementById('ov-confirm'), k = document.getElementById('confirm-ok');
    return { open: o.classList.contains('open'), seance: o.classList.contains('cf-seance'), bg: getComputedStyle(k).backgroundColor, img: getComputedStyle(k).backgroundImage, txt: k.textContent }; });
  const rouge = c => /255, 45, 85|255, 77, 109/.test(c.img || '') || /255, 106, 115|239, 62, 87/.test(c.bg || '');
  const N = (kg, reps, done, type) => Object.assign({ kg, reps, done: !!done, type: type || 'N', rm1: 0 }, done ? { at: 60 } : {});
  // Clic PROTÉGÉ : un élément absent rend `false` (le témoin rougit), jamais un plantage du banc.
  const clic = async (X, sel) => { if (!(await X.pg.$(sel))) return false; await X.pg.click(sel, { timeout: 3000 }).catch(() => {}); await X.pg.waitForTimeout(150); return true; };
  const snapLS = X => X.pg.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });

  /* ══ A · COBALT EN SÉANCE (décisions A, B) ══════════════════════════════════════════════ */
  {
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(40, 10, true, 'É'), N(100, 8, true), N(100, 8), N(100, 8)] }, { name: DM, sets: [N(50, 8, true), N(50, 8, true)] }]) });
    await fixDate(X); await X.pg.evaluate(() => { _expandedEx = 0; }); await vers(X, 'log');
    const fin = await bouton(X, 'Terminer', '.topbar button');
    t('B-UXI-A1 ⭐ décision B : le « Terminer » de l\'en-tête est Cobalt (fond #2F5BFF, texte blanc) — plus rouge',
      fin && fin.bg === COBALT && fin.col === 'rgb(255, 255, 255)', _det(fin));
    const bas = await bouton(X, 'Terminer', '#log-finish button');
    t('B-UXI-A2 ⭐ décision B : le « Terminer la séance » du bas est Cobalt, sans dégradé rouge', bas && bas.bg === COBALT && !rouge(bas), _det(bas));
    const c = await X.pg.evaluate(() => ({ live: getComputedStyle(document.querySelector('.tbs-live')).backgroundColor,
      actif: getComputedStyle(document.querySelector('.ex-block.ex-actif')).borderTopColor,
      cur: (document.querySelector('.set-row.set-cur .snum') ? getComputedStyle(document.querySelector('.set-row.set-cur .snum')).color : null),
      chk: getComputedStyle(document.querySelector('#s-log .chk.done'), '::before').backgroundColor,
      fini: document.querySelector('.ex-fini-b') ? getComputedStyle(document.querySelector('.ex-fini-b')).backgroundColor : null,
      add: getComputedStyle(document.getElementById('log-add-ex')).color, nom: getComputedStyle(document.querySelector('.ex-name')).color }));
    t('B-UXI-A3 ⭐ décision A : séance active, exercice actif, série active et série validée sont en Cobalt (jeton de séance)',
      c.live === SEA && /124, 149, 255/.test(c.actif) && c.cur === SEA && c.chk === COBALT, _det(c));
    t('B-UXI-A4 décision A : un exercice terminé porte la coche Cobalt ; « Ajouter un exercice » est Cobalt', c.fini === COBALT && c.add === SEA, _det(c));
    t('B-UXI-A5 le nom d\'exercice n\'est plus rouge (le rouge est réservé à la marque et au destructif)', c.nom === 'rgb(242, 243, 245)', c.nom);
    // Le jeton est DÉDIÉ : les autres bleus de l'app ne bougent pas (décision A : « ne pas recolorer tous les bleus »).
    const bleus = await X.pg.evaluate(() => { const r = getComputedStyle(document.documentElement); return { blue: r.getPropertyValue('--blue').trim(), green: r.getPropertyValue('--green').trim(), sea: r.getPropertyValue('--sea').trim(), fill: r.getPropertyValue('--sea-fill').trim() }; });
    t('B-UXI-A6 le jeton Cobalt est dédié : --blue (#5BA8FF) et --green (#34D399) sont inchangés', bleus.blue === '#5BA8FF' && bleus.green === '#34D399' && bleus.sea === '#7C95FF' && bleus.fill === '#2F5BFF', _det(bleus));
    // Terminer avec des séries restantes : la question s'ouvre, « Terminer quand même » est Cobalt ; « Continuer » ne touche à rien.
    const avant = await X.pg.evaluate(() => JSON.stringify(S.wkt));
    await X.pg.evaluate(() => terminerSeance()); await X.pg.waitForTimeout(250);
    const q = await confirmOk(X);
    t('B-UXI-A7 ⭐ fin avec séries restantes : la question s\'ouvre et « Terminer quand même » est Cobalt (pas rouge)', q.open && q.seance && q.bg === COBALT && !rouge(q) && /Terminer quand même/.test(q.txt), _det(q));
    await clic(X, '#confirm-cancel'); await X.pg.waitForTimeout(200);
    t('B-UXI-A8 « Continuer la séance » ne change rien à la séance (Terminer reste intelligent)', (await X.pg.evaluate(() => JSON.stringify(S.wkt))) === avant, '');
    // Une confirmation DESTRUCTIVE ouverte ensuite garde son rouge : la classe de séance ne fuit pas.
    await X.pg.evaluate(() => clearAllEx()); await X.pg.waitForTimeout(250);
    const v = await confirmOk(X);
    t('B-UXI-A9 ⭐ « Vider la séance » ouvert APRÈS un Terminer : son bouton reste rouge (aucune fuite du Cobalt)', v.open && !v.seance && rouge(v), _det(v));
    await clic(X, '#confirm-cancel'); await X.pg.waitForTimeout(200);
    await X.pg.evaluate(() => clearWkt()); await X.pg.waitForTimeout(250);
    const a = await confirmOk(X);
    t('B-UXI-A10 « Abandonner » garde son bouton rouge (destructif)', a.open && !a.seance && rouge(a), _det(a));
    await clic(X, '#confirm-cancel'); await X.pg.waitForTimeout(200);
    t('B-UXI-A11 rien n\'a été vidé ni abandonné (on a annulé) : la séance est intacte', (await X.pg.evaluate(() => JSON.stringify(S.wkt))) === avant, '');
    // Repos : l'anneau, le temps et « Passer » sont Cobalt ; le dock reste au-dessus de la barre du bas.
    await X.pg.evaluate(() => startRest(120)); await X.pg.waitForTimeout(700);
    const r = await X.pg.evaluate(() => { const d = document.getElementById('rest-bar'), nav = document.querySelector('.nav').getBoundingClientRect();
      return { ring: getComputedStyle(document.querySelector('.rd-ring-fg')).stroke, time: getComputedStyle(document.getElementById('rest-time')).color,
        skip: getComputedStyle(document.querySelector('#rest-bar .rd-skip')).backgroundColor, bas: Math.round(d.getBoundingClientRect().bottom), nav: Math.round(nav.top) }; });
    t('B-UXI-A12 ⭐ repos : anneau, temps et « Passer » en Cobalt ; le dock reste AU-DESSUS de la barre du bas',
      r.ring === SEA && r.time === SEA && r.skip === COBALT && r.bas <= r.nav, _det(r));
    await X.pg.evaluate(() => { if (typeof skipRest === 'function') skipRest(); });
    // Silhouette musculaire gardée (décision F) : « Ta séance jusqu'ici » montre la figurine des muscles travaillés.
    t('B-UXI-A13 décision F : la silhouette musculaire reste (« Ta séance jusqu\'ici »)', await X.pg.evaluate(() => !!document.querySelector('#log-finish .lf-fig svg')), '');
    t('B-UXI-A14 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  {
    // Pause : l'état « en pause » est dit, et « Reprendre » (une action de séance) est Cobalt.
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(100, 8, true), N(100, 8)] }], { pausedAt: Date.now() - 120000 }) });
    await fixDate(X); await vers(X, 'log');
    const rep = await X.pg.evaluate(() => { const e = document.querySelector('.topbar .tbs-rep'); return e ? { bg: getComputedStyle(e).backgroundColor, t: e.textContent.trim() } : null; });
    t('B-UXI-A15 pause : « Séance en pause » est affiché et « Reprendre » est Cobalt', /Séance en pause/.test(await entete(X)) && rep && rep.bg === COBALT, _det({ rep, e: await entete(X) }));
    await vers(X, 'home');
    const acc = await X.pg.evaluate(() => { const e = [...document.querySelectorAll('#s-home button')].find(b => /startWorkout\(\)/.test(b.getAttribute('onclick') || '')); return e ? getComputedStyle(e).backgroundColor : null; });
    t('B-UXI-A16 Accueil : le bouton de reprise de la séance ouverte est Cobalt', acc === COBALT, acc);
    await X.cx.close();
  }

  /* ══ B · « SÉANCE PRÊTE » (décision M) ═════════════════════════════════════════════════ */
  {
    // Programme chargé : 1 échauffement + 3 séries de travail, rien de fait, chrono pas parti.
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(40, 10, false, 'É'), N(100, 8), N(100, 8), N(100, 8)] }], { startTs: undefined, progLabel: 'Push' }) });
    await fixDate(X); await vers(X, 'log');
    const e = await entete(X);
    t('B-UXI-B1 ⭐ décision M : un programme chargé sans série faite s\'appelle « Séance prête » — avec son nom et 0 / 3 séries de travail (échauffement exclu)',
      /Séance prête/.test(e) && !/Séance en cours/.test(e) && /Push/.test(e) && /0\s*\/\s*3/.test(e), e);
    const ch = await X.pg.evaluate(([VIS]) => eval(VIS)(document.getElementById('wkt-chrono')), [VIS]);
    t('B-UXI-B2 « Séance prête » : pas de chrono affiché (il n\'est pas parti) et pas de « Terminer »', !ch && !/Terminer/.test(e), _det({ ch, e }));
    const ouv = await X.pg.evaluate(() => ({ o: _seanceOuverte(), on: document.getElementById('root').classList.contains('seance-on') }));
    t('B-UXI-B3 ⭐ affichage seul : la séance prête reste OUVERTE (_seanceOuverte) et le point du « + » est allumé, comme avant', ouv.o && ouv.on, _det(ouv));
    // La 1ʳᵉ série validée la fait passer « en cours » (le chrono part), sans autre changement.
    await X.pg.evaluate(() => { _expandedEx = 0; renderLog(); });
    await X.pg.click('#s-log .set-row:nth-of-type(2) .chk').catch(() => {});
    await X.pg.evaluate(() => { if (!S.wkt.startTs) { const r = document.querySelectorAll('#s-log .chk'); if (r[1]) r[1].click(); } });
    await X.pg.waitForTimeout(400);
    const e2 = await entete(X), st = await X.pg.evaluate(() => ({ ts: !!S.wkt.startTs, fait: S.wkt.exs[0].sets.filter(s => s.done).length }));
    t('B-UXI-B4 ⭐ la 1ʳᵉ série validée : « Séance en cours », chrono visible, « Terminer » présent', /Séance en cours/.test(e2) && !/Séance prête/.test(e2) && st.ts && st.fait >= 1 && /Terminer/.test(e2), _det({ e2, st }));
    await X.cx.close();
  }
  {
    // Un cardio seul n'est pas « prêt » : il y a quelque chose à enregistrer.
    const X = await ouvrir({ wkt: { date: '__TODAY__', exs: [], cardio: { type: 'tapis', intensity: 'modere', duration: 25 } } });
    await fixDate(X); await vers(X, 'log');
    t('B-UXI-B5 cardio noté sans exercice : « Séance en cours » (rien n\'est dit « prêt » quand il y a à enregistrer)', !/Séance prête/.test(await entete(X)), await entete(X));
    await X.cx.close();
  }

  /* ══ C · BARRE DU BAS (décisions C, D) ════════════════════════════════════════════════ */
  for (const [W, H] of [[390, 844], [375, 667], [360, 740]]) {
    const X = await ouvrir({ w: W, h: H, wkt: null });
    const mes = [];
    const mesure = async (ou) => mes.push(Object.assign({ ou }, await X.pg.evaluate(() => { const p = document.querySelector('#nb-log .nb-plus'), r = p.getBoundingClientRect(), c = getComputedStyle(p);
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), sh: c.boxShadow, tr: c.transform }; })));
    for (const id of ['home', 'log', 'progress', 'nutrition', 'coach']) { await vers(X, id); await mesure(id); }
    await X.pg.evaluate(() => { S.wkt = { date: today(), startHour: 10, startTs: Date.now() - 300000, exs: [{ name: 'Développé Couché', sets: [{ kg: 100, reps: 8, done: true, type: 'N', at: 30 }, { kg: 100, reps: 8, done: false, type: 'N' }] }] }; persist(); });
    for (const id of ['log', 'home', 'coach']) { await vers(X, id); await mesure(id + '+séance'); }
    const ref = mes[0], diff = mes.filter(m => m.x !== ref.x || m.y !== ref.y || m.w !== ref.w || m.h !== ref.h || m.sh !== ref.sh || (m.tr !== 'none' && m.tr !== ref.tr));
    t('B-UXI-C1 ⭐ ' + W + '×' + H + ' décision D : le « + » garde la même place, la même taille (44 px) et la même ombre sur tous les écrans, séance ouverte ou non',
      !diff.length && ref.w === 44 && ref.h === 44, _det({ ref, diff: diff.slice(0, 2) }));
    // Ordre À L'ÉCRAN (par position mesurée), pas seulement dans le code : un `order` CSS déplacerait le « + » en silence.
    const nav = await X.pg.evaluate(() => [...document.querySelectorAll('.nav > .nb, .nav > button')].map(b => [b.id, b.getBoundingClientRect().x]).sort((a, c) => a[1] - c[1]).map(a => a[0]));
    t('B-UXI-C2 ' + W + ' : 6 entrées, le « + » en 3ᵉ position À L\'ÉCRAN (décentré exprès, pour le pouce)', nav.length === 6 && nav[2] === 'nb-log', _det(nav));
    // Le point : entier (aucun ancêtre ne le rogne), bleu, et à l'écart du point « nouveauté ».
    const pt = await X.pg.evaluate(() => {
      const p = document.querySelector('#nb-log .nb-plus'), r = p.getBoundingClientRect(), a = getComputedStyle(p, '::after');
      const d = { l: r.right + 4 - 12, t: r.top - 4, r: r.right + 4, b: r.top - 4 + 12 };
      const rogne = []; for (let x = p.parentElement; x && !x.classList.contains('nav'); x = x.parentElement) { const c = getComputedStyle(x), q = x.getBoundingClientRect();
        if (c.overflow !== 'visible' && (d.l < q.left || d.t < q.top || d.r > q.right || d.b > q.bottom)) rogne.push(x.id || x.className); }
      const nav = document.querySelector('.nav').getBoundingClientRect();
      if (d.t < nav.top && getComputedStyle(document.querySelector('.nav')).overflow !== 'visible') rogne.push('nav');
      let nd = document.querySelector('#nb-log .new-dot'), cree = false;
      if (!nd) { nd = document.createElement('span'); nd.className = 'new-dot'; document.getElementById('nb-log').appendChild(nd); cree = true; }
      const n = nd.getBoundingClientRect(); const col = !(n.right <= d.l || n.left >= d.r || n.bottom <= d.t || n.top >= d.b);
      if (cree) nd.remove();
      return { contenu: a.content, bg: a.backgroundColor, w: a.width, ring: a.boxShadow, rogne, col, d: [d.l, d.t].map(Math.round), n: [n.left, n.top].map(Math.round) }; });
    t('B-UXI-C3 ⭐ ' + W + ' décision C : point bleu PLEIN (12 px), affiché en ENTIER — aucun conteneur ne le rogne', pt.contenu !== 'none' && pt.bg === SEA && pt.w === '12px' && !pt.rogne.length, _det(pt));
    t('B-UXI-C4 ⭐ ' + W + ' : le point « nouveauté » du « + » ne chevauche plus le point de séance', !pt.col, _det(pt));
    await X.cx.close();
  }

  /* ══ D · CLAVIER OUVERT DANS UNE SÉRIE (décision H) ══════════════════════════════════════ */
  for (const [W, H] of [[390, 844], [375, 667], [360, 740]]) {
    const sets = []; for (let i = 0; i < 6; i++) sets.push(N(100, 8, i < 5));
    const X = await ouvrir({ w: W, h: H, wkt: wkt([{ name: DM, sets: [N(50, 8, true), N(50, 8, true)] }, { name: DC, sets }]) });
    await fixDate(X); await X.pg.evaluate(() => { _expandedEx = 1; }); await vers(X, 'log'); await X.pg.evaluate(() => renderLog());
    // Clavier simulé : la hauteur VISIBLE tombe à 55 % de l'écran (sur iPhone, le clavier ne réduit pas innerHeight).
    const kb = Math.round(H * 0.55);
    await X.pg.evaluate(kb => { try { Object.defineProperty(window.visualViewport, 'height', { get: () => kb, configurable: true }); } catch (e) {} }, kb);
    await X.pg.evaluate(() => { const i = document.querySelectorAll('#s-log .ex-block')[1].querySelectorAll('.set-row')[5].querySelector('.sinp'); i.focus(); });
    await X.pg.waitForTimeout(450);
    const o = await X.pg.evaluate(kb => { const nav = document.querySelector('.nav'), a = document.activeElement, row = a.closest('.set-row').getBoundingClientRect();
      return { cls: document.getElementById('root').classList.contains('kbd-serie'), nav: getComputedStyle(nav).display, top: Math.round(row.top), bas: Math.round(row.bottom), kb }; }, kb);
    t('B-UXI-D1 ⭐ ' + W + '×' + H + ' décision H : champ de série au focus → la barre du bas est MASQUÉE', o.cls && o.nav === 'none', _det(o));
    t('B-UXI-D2 ⭐ ' + W + '×' + H + ' : la ligne active reste visible AU-DESSUS du clavier', o.bas <= kb && o.top >= 0, _det(o));
    // Passage reps → kg : la barre ne réapparaît pas entre deux champs.
    await X.pg.evaluate(() => { const a = document.activeElement, n = a.closest('.set-row').querySelectorAll('.sinp'); (n[1] === a ? n[0] : n[1]).focus(); });
    await X.pg.waitForTimeout(150);
    t('B-UXI-D3 ' + W + ' : passer d\'un champ de série à l\'autre garde la barre masquée', await X.pg.evaluate(() => getComputedStyle(document.querySelector('.nav')).display === 'none'), '');
    await X.pg.evaluate(() => document.activeElement.blur()); await X.pg.waitForTimeout(200);
    const f = await X.pg.evaluate(() => ({ cls: document.getElementById('root').classList.contains('kbd-serie'), nav: getComputedStyle(document.querySelector('.nav')).display }));
    t('B-UXI-D4 ⭐ ' + W + ' : clavier fermé → la barre du bas REVIENT', !f.cls && f.nav !== 'none', _det(f));
    await X.cx.close();
  }
  {
    // Hors série, rien ne change : le champ du Coach ne masque pas la barre.
    const X = await ouvrir({ wkt: null });
    await vers(X, 'coach'); await X.pg.evaluate(() => { const i = document.getElementById('coach-inp'); if (i) i.focus(); }); await X.pg.waitForTimeout(200);
    t('B-UXI-D5 le champ du Coach au focus ne masque PAS la barre du bas (seuls les champs de série)', await X.pg.evaluate(() => getComputedStyle(document.querySelector('.nav')).display !== 'none'), '');
    await X.cx.close();
  }

  /* ══ E · RIEN DERRIÈRE LA BARRE DU BAS (safe-area) ═════════════════════════════════════ */
  for (const [W, H] of [[390, 844], [375, 667], [360, 740]]) {
    const X = await ouvrir({ w: W, h: H, wkt: wkt([{ name: DC, sets: [N(100, 8, true), N(100, 8), N(100, 8)] }, { name: DM, sets: [N(50, 8), N(50, 8)] }]) });
    await fixDate(X); await vers(X, 'log');
    const r = await X.pg.evaluate(() => { const sc = document.getElementById('s-log'); sc.scrollTop = sc.scrollHeight;
      const nav = document.querySelector('.nav').getBoundingClientRect(), fin = document.querySelector('#log-finish .lf-fin');
      return new Promise(res => setTimeout(() => res({ fin: fin ? Math.round(fin.getBoundingClientRect().bottom) : null, nav: Math.round(nav.top) }), 150)); });
    t('B-UXI-E1 ' + W + '×' + H + ' : défilé jusqu\'en bas, le dernier bouton (« Terminer la séance ») s\'arrête au-dessus de la barre du bas', r.fin !== null && r.fin <= r.nav, _det(r));
    await X.cx.close();
  }

  /* ══ F · CARTES DE TYPE, SÉRIES (décisions E, G, K, L) ══════════════════════════════════ */
  {
    const X = await ouvrir({ w: 360, h: 740, wkt: null });
    await vers(X, 'log');
    const ty = await X.pg.evaluate(() => { const c = [...document.querySelectorAll('#log-types .ts-carte')];
      return { n: c.length, ico: document.querySelectorAll('#log-types .ts-ico').length, emoji: c.filter(x => /\p{Extended_Pictographic}/u.test(x.textContent)).map(x => x.textContent.trim().slice(0, 20)),
        img: c.filter(x => x.querySelector('img,svg')).length, tag: document.querySelector('#log-types .ts-tag') ? getComputedStyle(document.querySelector('#log-types .ts-tag')).color : null }; });
    t('B-UXI-F1 ⭐ décision E : cartes de type en TEXTE SEUL (aucun emoji, aucune icône)', ty.n >= 3 && ty.ico === 0 && !ty.emoji.length && ty.img === 0, _det(ty));
    t('B-UXI-F2 l\'étiquette « la tienne » n\'est plus rouge', ty.tag === null || !/255, 106, 115|255, 45, 85/.test(ty.tag), _det(ty));
    const k = await X.pg.evaluate(([VIS]) => { const vis = eval(VIS), q = id => document.getElementById(id);
      const top = id => q(id) && vis(q(id)) ? Math.round(q(id).getBoundingClientRect().top) : null;
      return { autres: top('la-autres'), cardio: top('log-cardio'), types: top('log-types'), autreAct: /Autre activit/i.test(document.getElementById('s-log').textContent) }; }, [VIS]);
    t('B-UXI-F3 décision K : le cardio reste à part, sous « Autres options », après les types de séance', k.autres !== null && k.cardio !== null && k.cardio >= k.autres && k.autres > k.types, _det(k));
    t('B-UXI-F4 décision L : « Autre activité » n\'est PAS construite (aucune entrée à l\'écran Séance)', !k.autreAct, _det(k));
    await X.cx.close();
  }
  {
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(40, 10, true, 'É'), N(100, 8, true), N(100, 8, false), N(102.5, 5, false, 'X')] }]) });
    await fixDate(X); await X.pg.evaluate(() => { _expandedEx = 0; }); await vers(X, 'log'); await X.pg.evaluate(() => renderLog());
    /* ⛔ R30 — D-086 (18/10/2026, recette iPhone de Michel) REMPLACE la décision G « le type sur le numéro » : Michel n'a pas
       trouvé le badge (une série normale n'affichait rien, rien ne disait qu'on pouvait toucher le numéro). Ces quatre
       témoins disaient « badge sur le numéro » et « plus de colonne Type » ; ils disent maintenant ce que D-086 a décidé —
       une colonne Type, une pastille sur CHAQUE série, même `cycleType` — et gardent ce que G avait acquis : le 1RM dans SA
       colonne, hors de tout bouton, et des cibles d'au moins 44 px. Le détail est dans `tests/parcours/ux_d086.js`. */
    const s = await X.pg.evaluate(() => { const rows = [...document.querySelectorAll('#s-log .ex-block .set-row')];
      return { hdr: [...document.querySelectorAll('#s-log .sets-hdr span')].map(x => x.textContent.trim()),
        pastilles: rows.map(r => { const b = r.querySelector('button.stype .tbtn'); return b ? b.textContent.trim() : ''; }),
        type: rows.map(r => { const n = r.querySelector('button.stype'); return n ? Math.round(Math.min(n.getBoundingClientRect().width, n.getBoundingClientRect().height)) : 0; }),
        chk: rows.map(r => { const c = r.querySelector('.chk'); return c ? Math.round(Math.min(c.getBoundingClientRect().width, c.getBoundingClientRect().height)) : 0; }),
        rm: rows.map(r => { const e = r.querySelector('[id^="trm-"]'); return e ? { cls: e.className, dansBouton: !!e.closest('button'), t: e.textContent.trim() } : null; }) }; });
    t('B-UXI-F5 ⭐ D-086 (remplace G) : le type a SA colonne, une pastille sur CHAQUE série (É, N, N, X) ; « Précédent » reste',
      _det(s.pastilles) === _det(['É', 'N', 'N', 'X']) && s.hdr.includes('Précédent'), _det(s));
    t('B-UXI-F6 ⭐ décision G gardée : le 1RM a SA colonne (en-tête « 1RM », valeur hors de tout bouton) — et le type a la sienne (D-086)',
      s.hdr.includes('1RM') && s.hdr.includes('Type') && s.rm.every(x => x && x.cls === 'srm' && !x.dansBouton) && /~/.test(s.rm[1].t), _det(s));
    t('B-UXI-F7 pastille de type et coche : zones d\'appui ≥ 44 × 44 px', s.type.every(h => h >= 44) && s.chk.every(w => w >= 44), _det(s));
    // Changer le type : on appuie sur la PASTILLE (même action qu'avant, cycleType) — la donnée change, la pastille suit.
    await clic(X, '#tbtn-0-2'); await X.pg.waitForTimeout(250);
    const c = await X.pg.evaluate(() => ({ type: S.wkt.exs[0].sets[2].type, pastille: (document.querySelector('#tbtn-0-2 .tbtn') || {}).textContent || '' }));
    t('B-UXI-F8 ⭐ appuyer sur la pastille change le type (cycleType) et la pastille suit', c.type === 'É' && c.pastille === 'É', _det(c));
    t('B-UXI-F9 la progression N / M exclut toujours les échauffements', /1\s*\/\s*2/.test(await entete(X)), await entete(X));
    await X.cx.close();
  }

  /* ══ G · MILO : DISCUSSION / ESPACE MILO (décision I) ══════════════════════════════════ */
  {
    const X = await ouvrir({ wkt: null });
    await vers(X, 'coach'); await X.pg.waitForTimeout(300);
    const ls0 = await snapLS(X), net0 = await X.pg.evaluate(() => window.__fetchN);
    const v = await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); return { tabs: vis(document.getElementById('coach-tabs')),
      esp: !!document.querySelector('#ctab-espace.on'), sel: (document.getElementById('ctab-espace') || { getAttribute: () => null }).getAttribute('aria-selected'),
      home: vis(document.getElementById('coach-home')), msgs: vis(document.getElementById('coach-msgs')), inp: vis(document.getElementById('coach-inp')) }; }, [VIS]);
    t('B-UXI-G1 ⭐ décision I : sans discussion, le Coach s\'ouvre sur « Espace Milo » (l\'accueil de Milo, comme avant) ; les deux onglets sont là',
      v.tabs && v.esp && v.sel === 'true' && v.home && !v.msgs, _det(v));
    await clic(X, '#ctab-disc'); await X.pg.waitForTimeout(200);
    const d = await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); return { on: !!document.querySelector('#ctab-disc.on'), home: vis(document.getElementById('coach-home')),
      msgs: vis(document.getElementById('coach-msgs')), suggs: vis(document.getElementById('coach-suggs')), inp: vis(document.getElementById('coach-inp')) }; }, [VIS]);
    t('B-UXI-G2 « Discussion » sans échange : le fil (vide) et les suggestions, la saisie reste là', d.on && !d.home && d.msgs && d.inp, _det(d));
    const ls1 = await snapLS(X), net = await X.pg.evaluate(() => window.__fetchN);
    t('B-UXI-G3 ⭐ changer d\'onglet n\'écrit RIEN (aucune clé ajoutée ni modifiée) et n\'appelle pas le réseau',
      _det(ls1) === _det(ls0) && net === net0, _det({ ajout: Object.keys(ls1).filter(k => !(k in ls0)), modif: Object.keys(ls1).filter(k => k in ls0 && ls0[k] !== ls1[k]), net, net0 }));
    await X.cx.close();
  }
  {
    const hist = [{ role: 'user', content: 'Combien de séries pour les pecs ?' }, { role: 'assistant', content: 'Entre 10 et 20 séries par semaine.' }];
    const X = await ouvrir({ wkt: null, hist });
    await vers(X, 'coach'); await X.pg.waitForTimeout(300);
    const v = await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); return { disc: !!document.querySelector('#ctab-disc.on'), home: vis(document.getElementById('coach-home')),
      msgs: vis(document.getElementById('coach-msgs')), n: coachHistory.length, morpho: getComputedStyle(document.getElementById('coach-morpho-btn-wrap') || document.body).display }; }, [VIS]);
    t('B-UXI-G4 ⭐ avec une discussion, le Coach s\'ouvre sur « Discussion » (le fil, comme avant)', v.disc && !v.home && v.msgs && v.n === 2, _det(v));
    const fn0 = await X.pg.evaluate(() => window.__fetchN), ls0 = await snapLS(X);
    await clic(X, '#ctab-espace'); await X.pg.waitForTimeout(200);
    const e = await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); return { on: !!document.querySelector('#ctab-espace.on'), home: vis(document.getElementById('coach-home')),
      msgs: vis(document.getElementById('coach-msgs')), inp: vis(document.getElementById('coach-inp')), n: coachHistory.length,
      morpho: getComputedStyle(document.getElementById('coach-morpho-btn-wrap') || document.body).display }; }, [VIS]);
    t('B-UXI-G5 ⭐ « Espace Milo » pendant une discussion : l\'accueil de Milo revient, le fil est caché mais GARDÉ', e.on && e.home && !e.msgs && e.n === 2 && e.inp, _det(e));
    t('B-UXI-G6 « Analyses photo de Milo » a le même affichage dans les deux onglets (rien de dupliqué, rien de perdu)', e.morpho === v.morpho, _det({ disc: v.morpho, esp: e.morpho }));
    await clic(X, '#ctab-disc'); await X.pg.waitForTimeout(200);
    const r = await X.pg.evaluate(([VIS]) => ({ msgs: eval(VIS)(document.getElementById('coach-msgs')), n: coachHistory.length, net: window.__fetchN }), [VIS]);
    const ls1 = await snapLS(X);
    t('B-UXI-G7 ⭐ retour sur « Discussion » : le même fil, aucune écriture, aucun appel réseau', r.msgs && r.n === 2 && r.net === fn0 && _det(ls1) === _det(ls0), _det(r));
    await X.cx.close();
  }

  /* ══ H · PROGRÈS : COURBES NEUTRES (décision J) ════════════════════════════════════════ */
  {
    const X = await ouvrir({ wkt: null });
    await vers(X, 'progress');
    const lit = async ex => X.pg.evaluate(ex => { _progEx = ex; _progRange = 'all'; renderChart(); const box = document.getElementById('chart-box');
      const ligne = [...box.querySelectorAll('svg path')].find(p => (p.getAttribute('fill') === 'none') || /stroke/.test(p.getAttribute('style') || ''));
      const pts = [...box.querySelectorAll('svg circle')].filter(c => +c.getAttribute('r') >= 4 && +c.getAttribute('r') <= 6).map(c => getComputedStyle(c).fill);
      const delta = [...box.querySelectorAll('div')].find(d => d.nextElementSibling && /^Progrès/.test(d.nextElementSibling.textContent.trim()) && /font-size:\s*25px/.test(d.getAttribute('style') || ''));
      const g = document.createElement('i'); g.style.color = 'var(--gold)'; document.body.appendChild(g); const or = getComputedStyle(g).color; g.remove();
      return { ligne: ligne ? getComputedStyle(ligne).stroke : null, pts, or, delta: delta ? getComputedStyle(delta).color : null, dt: delta ? delta.textContent.trim() : null }; }, ex);
    const up = await lit(DC), down = await lit(DM);
    t('B-UXI-H1 ⭐ décision J : courbe qui MONTE — ligne neutre (blanche), progrès chiffré en vert, record en or',
      up.ligne === 'rgb(242, 243, 245)' && up.delta === 'rgb(52, 211, 153)' && /^\+/.test(up.dt) && up.pts.includes(up.or) && up.pts.filter(p => p !== up.or).every(p => p === 'rgb(242, 243, 245)'), _det(up));
    t('B-UXI-H2 ⭐ courbe qui DESCEND — la ligne reste neutre (pas de couleur de progrès sur une baisse), le chiffre n\'est pas vert',
      down.ligne === 'rgb(242, 243, 245)' && down.delta !== 'rgb(52, 211, 153)' && /^-|^−/.test(down.dt), _det(down));
    await X.cx.close();
  }

  /* ══ I · AUCUNE DONNÉE NOUVELLE ════════════════════════════════════════════════════════ */
  {
    // Parcours d'affichage complet (séance prête → en cours → ⋯ → clavier → Terminer annulé → Coach → onglets) : à la fin,
    // les SEULES clés écrites sont celles qu'écrivaient déjà les propriétaires (séance, brouillon) — aucune clé nouvelle.
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(100, 8), N(100, 8)] }], { startTs: undefined }) });
    await fixDate(X); const ls0 = await snapLS(X);
    await vers(X, 'log'); await X.pg.evaluate(() => { _expandedEx = 0; renderLog(); });
    await X.pg.evaluate(() => { const c = document.querySelectorAll('#s-log .chk')[0]; if (c) c.click(); }); await X.pg.waitForTimeout(300);
    await X.pg.evaluate(() => openWktMenu()); await X.pg.waitForTimeout(150); await X.pg.evaluate(() => closeWktMenu());
    await X.pg.evaluate(() => { const i = document.querySelector('#s-log .sinp'); if (i) { i.focus(); i.blur(); } }); await X.pg.waitForTimeout(150);
    await X.pg.evaluate(() => terminerSeance()); await X.pg.waitForTimeout(150); await clic(X, '#confirm-cancel');
    await vers(X, 'coach'); await clic(X, '#ctab-disc'); await clic(X, '#ctab-espace'); await vers(X, 'home');
    const ls1 = await snapLS(X);
    const nouvelles = Object.keys(ls1).filter(k => !(k in ls0));
    t('B-UXI-I1 ⭐ aucune clé de stockage nouvelle après tout le parcours d\'affichage (Séance prête, clavier, Terminer, onglets Milo)',
      !nouvelles.length && /kbd|onglet|coachTab|prete|cobalt/i.test(Object.keys(ls1).join(',')) === false, _det({ nouvelles }));
    t('B-UXI-I2 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
}

module.exports = { ecran };
