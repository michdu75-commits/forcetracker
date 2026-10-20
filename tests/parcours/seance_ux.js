/* ═════════════════════════════════════════════════════════════════════════════════════════════
   🏋️ UX SÉANCE (blocs B-UXS-*) — session-B, 16/10/2026, chantier principal d'implémentation.
   Cadrage validé par Michel le 16/10 (« écran Séance : cible finale et plan d'intégration ») et
   ses 5 décisions figées : ① N/M et « il reste » = séries de TRAVAIL (échauffements exclus) ;
   ② en séance active, la barre haute laisse la place à l'en-tête de séance (logo, ?, partage,
   Sheets masqués ; l'aide passe dans ⋯) ; ③ les préréglages de repos passent dans « Régler » ;
   ④ « Séance libre » avant, « Ajouter un exercice » pendant — « + Créer ma séance » disparaît ;
   ⑤ pastille verte informative sur le bouton central.
   Ce que les témoins CONDUISENT : l'écran Séance réel (vraie app servie en local), les vrais
   boutons trouvés par leur TEXTE (« Séance libre », « Terminer », « Continuer la séance »…), le
   menu ⋯, le bouton central, la navigation, les vrais toggleSet/startRest.
   Ce qu'ils OBSERVENT : la visibilité réelle (getClientRects), les positions mesurées, S.wkt et
   S.sessions (objet complet), l'appel effectif des propriétaires existants (espions posés AVANT
   le clic, l'onclick résout le nom au moment du clic).
   Ce qu'ils NE COUVRENT PAS : le clavier iOS et le sélecteur de date natif (non mesurables en
   Chromium → recette iPhone) ; les groupes et dropsets côté MOTEUR (bancs ML-B, CC-01) ; Milo.
   ═════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_lms: '2026-09' };
const _det = o => JSON.stringify(o);
const DC = 'Développé Couché', DM = 'Développé Militaire';
// Une séance passée (pour « Dernière séance » et la colonne Précédent) et trois programmes.
const PASSEE = () => [{ id: 1760349600000, ts: 1760349600000, date: '2026-10-13', synced: true, volume: 2900, progLabel: 'Push', uniConv: 1,
  exs: [{ name: DC, sets: [{ kg: 90, reps: 8, done: true, type: 'N', rm1: 112 }, { kg: 90, reps: 8, done: true, type: 'N', rm1: 112 }] }] }];
const PROGS = () => [{ id: 'p1', name: 'Push', exs: [{ name: DC, sets: [{ kg: 0, reps: 8, type: 'N' }] }] },
  { id: 'p2', name: 'Pull', exs: [{ name: 'Tractions', sets: [{ kg: 0, reps: 8, type: 'N' }] }] },
  { id: 'p3', name: 'Legs', exs: [{ name: 'Squat', sets: [{ kg: 0, reps: 8, type: 'N' }] }] }];

async function ecran(t, b, PORT) {
  const ouvrir = async (opts) => {
    opts = opts || {};
    const W = opts.w || 390, H = opts.h || 844;
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: W, height: H }, timezoneId: 'Europe/Paris' });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    const init = Object.assign({}, BASE, { ft4_sessions: JSON.stringify(opts.sessions || PASSEE()), ft4_progs: JSON.stringify(opts.progs || PROGS()) });
    if (opts.wkt !== undefined) { init.ft4_wkt = JSON.stringify(opts.wkt); init.ft4_wkt_draft = JSON.stringify(opts.wkt); }
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_uxs'))return; sessionStorage.setItem('_uxs','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; });
    return { cx, pg, errs, W, H };
  };
  // La séance du jour, construite DANS la page (date réelle du conteneur), sans passer par l'interface.
  const wkt = (exs, extra) => Object.assign({ date: '__TODAY__', startHour: 10, startTs: Date.now() - 600000, exs }, extra || {});
  const fixDate = async X => X.pg.evaluate(() => { if (S.wkt && S.wkt.date === '__TODAY__') { S.wkt.date = today(); persist(); } });
  const versSeance = async X => { await X.pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    goScreen('log', document.getElementById('nb-log')); }); await X.pg.waitForTimeout(250); };
  const versAccueil = async X => { await X.pg.evaluate(() => goScreen('home', document.getElementById('nb-home'))); await X.pg.waitForTimeout(250); };
  // Visibilité RÉELLE (un élément en position fixe n'a pas d'offsetParent : on lit les rectangles).
  const VIS = `(e=>{ if(!e) return false; for(let x=e;x&&x!==document.documentElement;x=x.parentElement){ const c=getComputedStyle(x); if(c.display==='none'||c.visibility==='hidden') return false; } return e.getClientRects().length>0; })`;
  const parTexte = (X, txt, sel) => X.pg.evaluate(([txt, sel, VIS]) => { const vis = eval(VIS);
    return [...document.querySelectorAll(sel || 'button,a,label,[role=button]')].filter(e => vis(e) && (e.textContent || '').replace(/\s+/g, ' ').includes(txt)).length; }, [txt, sel, VIS]);
  const clicTexte = async (X, txt, sel) => {
    const h = (await X.pg.evaluateHandle(([txt, sel, VIS]) => { const vis = eval(VIS);
      const l = [...document.querySelectorAll(sel || 'button,a,label,[role=button]')].filter(e => vis(e) && (e.textContent || '').replace(/\s+/g, ' ').includes(txt));
      return l[l.length - 1] || null; }, [txt, sel, VIS])).asElement();
    if (!h) return false;
    await h.evaluate(x => x.scrollIntoView({ block: 'center' })); await h.click({ timeout: 3000 }); await X.pg.waitForTimeout(250); return true;
  };
  // Clic PROTÉGÉ par un sélecteur : un élément absent rend `false` (témoin rouge), jamais un plantage du banc.
  const clicSel = async (X, sel) => { const ok = await X.pg.evaluate(([sel, VIS]) => { const vis = eval(VIS); return vis(document.querySelector(sel)); }, [sel, VIS]);
    if (!ok) return false; await X.pg.click(sel, { timeout: 3000 }); await X.pg.waitForTimeout(200); return true; };
  const rect = (X, sel) => X.pg.evaluate(([sel, VIS]) => { const vis = eval(VIS); const e = document.querySelector(sel); if (!vis(e)) return null;
    const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom) }; }, [sel, VIS]);
  const fab = X => X.pg.evaluate(() => { const r = document.getElementById('nb-log').getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(v => Math.round(v * 10) / 10).join(','); });
  const etat = X => X.pg.evaluate(() => ({ wkt: S.wkt ? JSON.parse(JSON.stringify(S.wkt)) : null, nSess: (S.sessions || []).length,
    s0: (S.sessions || [])[0] ? JSON.parse(JSON.stringify(S.sessions[0])) : null }));
  const confirmOuvert = X => X.pg.evaluate(() => { const o = document.getElementById('ov-confirm'); return !!(o && o.classList.contains('open')); });
  const confirmTexte = X => X.pg.evaluate(() => ({ titre: (document.getElementById('confirm-title') || {}).textContent || '', msg: (document.getElementById('confirm-msg') || {}).textContent || '',
    ok: (document.getElementById('confirm-ok') || {}).textContent || '', non: (document.getElementById('confirm-cancel') || {}).textContent || '' }));
  const progression = X => X.pg.evaluate(([VIS]) => { const vis = eval(VIS); const tb = document.querySelector('.topbar'); if (!tb) return null;
    const m = (tb.textContent || '').replace(/\s+/g, ' ').match(/(\d+)\s*\/\s*(\d+)\s*séries?/); return m && vis(tb) ? m[1] + '/' + m[2] : null; }, [VIS]);
  const enteteTexte = X => X.pg.evaluate(([VIS]) => { const vis = eval(VIS); const tb = document.querySelector('.topbar');
    return [...tb.querySelectorAll('*')].filter(e => vis(e) && e.children.length === 0).map(e => e.textContent.trim()).filter(Boolean).join(' | '); }, [VIS]);

  const N = (kg, reps, done, type) => Object.assign({ kg, reps, done: !!done, type: type || 'N', rm1: 0 }, done ? { at: 60 } : {});

  /* ══ A · AVANT LA SÉANCE ══════════════════════════════════════════════════════════════ */
  {
    const X = await ouvrir({ wkt: null });
    await versSeance(X);
    t('B-UXS-A1 ⭐ avant séance : « Séance libre » est visible (décision ④) et ouvre le sélecteur d\'exercices existant',
      (await parTexte(X, 'Séance libre')) >= 1 && await X.pg.evaluate(() => [...document.querySelectorAll('button')].some(e => /Séance libre/.test(e.textContent) && /openExPicker\(/.test(e.getAttribute('onclick') || ''))),
      'boutons « Séance libre » visibles : ' + await parTexte(X, 'Séance libre'));
    const cta = await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); const bs = [...document.querySelectorAll('#s-log button')].filter(vis);
      const lib = bs.find(e => /Séance libre/.test(e.textContent)); const pro = bs.find(e => /^\s*Programme/.test(e.textContent) || /openProgModal\(/.test(e.getAttribute('onclick') || ''));
      const r = e => e ? e.getBoundingClientRect() : null; const c = document.getElementById('log-cardio'), ty = document.getElementById('log-types');
      const rc = c && vis(c) ? c.getBoundingClientRect() : null, rt = ty && vis(ty) && ty.children.length ? ty.getBoundingClientRect() : null;
      return { lib: r(lib) && Math.round(r(lib).bottom), pro: r(pro) && Math.round(r(pro).bottom), proTop: r(pro) && Math.round(r(pro).top), proOnclick: pro && pro.getAttribute('onclick'),
        cardio: rc && Math.round(rc.top), types: rt && Math.round(rt.top), H: innerHeight, nav: Math.round(document.querySelector('.nav').getBoundingClientRect().top) }; }, [VIS]);
    t('B-UXS-A2 ⭐ « Programme » est la 2ᵉ action, juste sous « Séance libre » (avant les types et le cardio) et ouvre « Mes programmes »',
      cta.lib !== null && cta.pro !== null && cta.proTop >= cta.lib - 2 && /openProgModal\(/.test(cta.proOnclick || '') && (cta.types === null || cta.pro <= cta.types) && (cta.cardio === null || cta.pro <= cta.cardio), _det(cta));
    t('B-UXS-A3 avant séance : aucun « Ajouter un exercice » (le geste d\'une séance déjà ouverte)', (await parTexte(X, 'Ajouter un exercice')) === 0, '');
    t('B-UXS-A4 ⭐ le cardio n\'est pas dominant : il vient APRÈS Séance libre, Programme et les types de séance', cta.cardio !== null && cta.cardio > cta.pro && (cta.types === null || cta.cardio > cta.types), _det(cta));
    t('B-UXS-A5 avant séance, la barre de marque reste (logo visible) et l\'en-tête de séance est absent', (await rect(X, '#tb-logo')) !== null && (await parTexte(X, 'Séance en cours', '.topbar *')) === 0, '');
    t('B-UXS-A6 aucun « + Créer ma séance » à l\'écran (libellé remplacé par la décision du 16/10)', (await parTexte(X, 'Créer ma séance')) === 0, '');
    t('B-UXS-A7 la date de la séance reste réglable (étiquette liée au champ date) et dit « Aujourd\'hui » le jour même',
      await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); const l = [...document.querySelectorAll('label[for="s-date"]')].filter(vis); return l.length >= 1 && /Aujourd/.test(l[0].textContent); }, [VIS]), '');
    t('B-UXS-A8 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  // Petits écrans : les deux actions sont visibles SANS défiler, au-dessus de la barre du bas.
  for (const [W, H] of [[360, 780], [375, 667]]) {
    const X = await ouvrir({ wkt: null, w: W, h: H });
    await versSeance(X);
    const r = await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); const bs = [...document.querySelectorAll('#s-log button')].filter(vis);
      const lib = bs.find(e => /Séance libre/.test(e.textContent)); const pro = bs.find(e => /openProgModal\(/.test(e.getAttribute('onclick') || ''));
      const nav = document.querySelector('.nav').getBoundingClientRect().top;
      return { lib: lib ? Math.round(lib.getBoundingClientRect().bottom) : null, pro: pro ? Math.round(pro.getBoundingClientRect().bottom) : null, nav: Math.round(nav) }; }, [VIS]);
    t('B-UXS-A9 ⭐ ' + W + '×' + H + ' : « Séance libre » et « Programme » visibles sans défiler, au-dessus de la barre du bas',
      r.lib !== null && r.pro !== null && r.lib <= r.nav && r.pro <= r.nav, _det(r));
    await X.cx.close();
  }

  /* ══ B · SÉANCE ACTIVE ═════════════════════════════════════════════════════════════════ */
  {
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(100, 8, true), N(100, 8), N(100, 8)] }, { name: DM, sets: [N(50, 8), N(50, 8)] }]) });
    await fixDate(X); await versSeance(X);
    t('B-UXS-B1 ⭐ séance active : l\'en-tête « Séance en cours » est dans la barre haute', (await parTexte(X, 'Séance en cours', '.topbar *')) >= 1, await enteteTexte(X));
    t('B-UXS-B2 ⭐ « Ajouter un exercice » est visible et ouvre le sélecteur existant',
      (await parTexte(X, 'Ajouter un exercice')) >= 1 && await X.pg.evaluate(() => [...document.querySelectorAll('#s-log button')].some(e => /Ajouter un exercice/.test(e.textContent) && /openExPicker\(/.test(e.getAttribute('onclick') || ''))), '');
    t('B-UXS-B3 ⭐ l\'ancien « + Créer ma séance » n\'apparaît plus quand la séance existe', (await parTexte(X, 'Créer ma séance')) === 0, '');
    t('B-UXS-B4 ⭐ progression N/M = séries de TRAVAIL : 1 / 5', (await progression(X)) === '1/5', 'lu : ' + await progression(X) + ' · ' + await enteteTexte(X));
    const haut = await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); return { logo: vis(document.getElementById('tb-logo')), aide: [...document.querySelectorAll('.topbar button')].some(e => vis(e) && e.getAttribute('onclick') === 'showHelp()'),
      partage: [...document.querySelectorAll('.topbar button')].some(e => vis(e) && e.getAttribute('onclick') === 'openShareModal()'), sheets: vis(document.getElementById('sync-pill')) }; }, [VIS]);
    t('B-UXS-B5 ⭐ barre haute simplifiée en séance : logo, aide « ? », partage et Sheets masqués (décision ②)', !haut.logo && !haut.aide && !haut.partage && !haut.sheets, _det(haut));
    t('B-UXS-B6 la barre du bas reste entière et accessible (6 boutons visibles, bouton central compris)',
      await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); return [...document.querySelectorAll('.nav .nb')].filter(vis).length === 6 && vis(document.getElementById('nb-log')); }, [VIS]), '');
    t('B-UXS-B7 ⭐ la rangée Pause ✕ Vider Changer a quitté l\'écran (rangée dans le menu ⋯)',
      await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); return ![...document.querySelectorAll('#s-log button')].some(e => vis(e) && /^(clearAllEx|clearWkt)\(\)$/.test(e.getAttribute('onclick') || '')) && !vis(document.getElementById('log-hdr-btns')); }, [VIS]), '');
    t('B-UXS-B8 le bloc « avant séance » est masqué pendant la séance', (await parTexte(X, 'Séance libre')) === 0, '');
    const cartes = await X.pg.evaluate(([VIS]) => { const vis = eval(VIS);
      const c0 = document.getElementById('ex-block-0'), c1 = document.getElementById('ex-block-1');
      const lignes = c => c ? [...c.querySelectorAll('.set-row')].filter(vis).length : -1;
      return { actif: _expandedEx, l0: lignes(c0), l1: lignes(c1), puces1: c1 ? [...c1.querySelectorAll('button')].filter(e => vis(e) && /createSupersetFrom|openDropsetConfig/.test(e.getAttribute('onclick') || '')).length : -1 }; }, [VIS]);
    t('B-UXS-B9 l\'exercice actif est ouvert (ses séries sont affichées)', cartes.actif === 1 ? cartes.l1 > 0 : cartes.l0 > 0, _det(cartes));
    await versAccueil(X);
    t('B-UXS-B10 sur un autre onglet, la barre de marque revient et l\'en-tête de séance disparaît',
      (await rect(X, '#tb-logo')) !== null && (await parTexte(X, 'Séance en cours', '.topbar *')) === 0, '');
    t('B-UXS-B11 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  // Exercice terminé = compact, avec sa marque ; les autres lisibles sans leurs boutons de méthode.
  {
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(60, 10, false, 'É'), N(100, 8, true), N(100, 8, true)] }, { name: DM, sets: [N(50, 8), N(50, 8)] }]) });
    await fixDate(X); await X.pg.evaluate(() => { _expandedEx = 1; renderExBlocks(); }); await versSeance(X);
    await X.pg.evaluate(() => { _expandedEx = 1; renderExBlocks(); });
    const c = await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); const c0 = document.getElementById('ex-block-0');
      return { lignes: [...c0.querySelectorAll('.set-row')].filter(vis).length, fini: !!c0.querySelector('[data-fini="1"]'),
        puces: [...c0.querySelectorAll('button')].filter(e => vis(e) && /createSupersetFrom|openDropsetConfig|moveExBlock|openExHistory/.test(e.getAttribute('onclick') || '')).length,
        h: Math.round(c0.getBoundingClientRect().height), texte: c0.textContent.replace(/\s+/g, ' ').slice(0, 90) }; }, [VIS]);
    t('B-UXS-B12 ⭐ un exercice terminé (séries de travail toutes faites, échauffement sauté) est COMPACT et porte la marque « terminé »',
      c.lignes === 0 && c.fini === true, _det(c));
    t('B-UXS-B13 ⭐ une carte repliée n\'affiche plus Super / Drop / +% / ↑ ↓ / stats (rangés dans la carte ouverte et le menu ⋯ d\'exercice)', c.puces === 0, _det(c));
    await X.cx.close();
  }

  /* ══ B′ · LE MENU ⋯ DE LA SÉANCE : chaque ligne appelle le propriétaire EXISTANT ══════════ */
  {
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(100, 8, true), N(100, 8)] }, { name: DM, sets: [N(50, 8)] }]) });
    await fixDate(X); await versSeance(X);
    const attendus = [['Mettre en pause', 'toggleWktPause'], ['Tout dérouler', 'toggleExpandAll'], ['Grouper des exercices', 'toggleGroupMode'],
      ['Programmes', 'openProgModal'], ['Aide de l\'écran Séance', 'showHelp'], ['Vider la séance', 'clearAllEx'], ['Abandonner la séance', 'clearWkt']];
    const ouvre = await clicTexte(X, '', '.topbar button[aria-label*="actions sur la séance"]');
    const lignes = await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); const ov = document.getElementById('ov-wkt-menu');
      return ov && ov.classList.contains('open') ? [...ov.querySelectorAll('button,label')].filter(vis).map(e => e.textContent.replace(/\s+/g, ' ').trim()) : null; }, [VIS]);
    t('B-UXS-M1 ⭐ le bouton ⋯ de l\'en-tête ouvre la feuille « Séance en cours » avec toutes les actions rangées',
      ouvre && lignes && attendus.every(([l]) => lignes.some(x => x.indexOf(l) === 0)) && lignes.some(x => /^Date de la séance/.test(x)), _det(lignes));
    const ordre = lignes ? ['Vider la séance', 'Abandonner la séance'].map(l => lignes.findIndex(x => x.indexOf(l) === 0)) : [-1, -1];
    const autres = lignes ? ['Mettre en pause', 'Programmes', 'Aide de l\'écran Séance'].map(l => lignes.findIndex(x => x.indexOf(l) === 0)) : [99];
    t('B-UXS-M2 les actions à risque (Vider, Abandonner) sont séparées, en bas', ordre.every(i => i >= 0) && Math.min(...ordre) > Math.max(...autres)
      && await X.pg.evaluate(() => !!document.querySelector('#ov-wkt-menu .wm-danger')), _det({ ordre, autres }));
    // Espions posés AVANT le clic : l'onclick résout le nom de la fonction au moment du clic.
    const appels = [];
    for (const [libelle, fn] of attendus) {
      await X.pg.evaluate(fns => { window.__appels = []; fns.forEach(n => { window[n] = function () { window.__appels.push(n); }; });
        if (typeof openWktMenu === 'function') openWktMenu(); }, attendus.map(a => a[1]));
      await X.pg.waitForTimeout(150);
      await clicTexte(X, libelle, '#ov-wkt-menu button');
      appels.push([libelle, await X.pg.evaluate(() => window.__appels.slice())]);
    }
    t('B-UXS-M3 ⭐ chaque ligne du menu appelle EXACTEMENT son propriétaire existant (pause, tout dérouler, grouper, programmes, aide, vider, abandonner)',
      appels.every(([l, a], i) => a.length === 1 && a[0] === attendus[i][1]), _det(appels));
    await X.cx.close();
  }
  // Pause depuis le menu, reprise depuis l'en-tête — même moteur (toggleWktPause).
  {
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(100, 8, true), N(100, 8)] }]) });
    await fixDate(X); await versSeance(X);
    await clicTexte(X, '', '.topbar button[aria-label*="actions sur la séance"]');
    await clicTexte(X, 'Mettre en pause', '#ov-wkt-menu button');
    const p = await X.pg.evaluate(() => ({ pause: !!(S.wkt && S.wkt.pausedAt) }));
    const enPause = (await parTexte(X, 'Séance en pause', '.topbar *')) >= 1;
    const repr = await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); const e = document.getElementById('wkt-pause-btn'); return vis(e) && !!e.closest('.topbar'); }, [VIS]);
    t('B-UXS-P1 ⭐ « Mettre en pause » (menu) met la séance en pause ; l\'en-tête dit « Séance en pause » et montre le bouton de reprise', p.pause && enPause && repr, _det({ p, enPause, repr }));
    await clicSel(X, '.topbar #wkt-pause-btn');
    const r = await X.pg.evaluate(() => ({ pause: !!(S.wkt && S.wkt.pausedAt), total: S.wkt && S.wkt.pausedTotal > 0 }));
    t('B-UXS-P2 la reprise depuis l\'en-tête relance la séance (pause cumulée, moteur inchangé)', !r.pause && r.total && (await parTexte(X, 'Séance en cours', '.topbar *')) >= 1, _det(r));
    await X.cx.close();
  }

  /* ══ C · N/M = SÉRIES DE TRAVAIL (échauffements exclus, X compté) ═════════════════════════ */
  {
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(60, 10, true, 'É'), N(100, 8, true), N(100, 8), N(100, 6, false, 'X')] },
      { name: DM, sets: [N(30, 10, false, 'É'), N(50, 8), N(50, 8)] }]) });
    await fixDate(X); await versSeance(X);
    t('B-UXS-C1 ⭐ échauffement validé exclu, échec (X) compté : 1 / 5', (await progression(X)) === '1/5', 'lu : ' + await progression(X));
    await X.pg.evaluate(() => { toggleSet(0, 2); stopRest(); }); await X.pg.waitForTimeout(200);
    t('B-UXS-C2 valider une série de travail fait avancer : 2 / 5', (await progression(X)) === '2/5', 'lu : ' + await progression(X));
    await X.pg.evaluate(() => { toggleSet(1, 0); stopRest(); }); await X.pg.waitForTimeout(200);
    t('B-UXS-C3 ⭐ valider un ÉCHAUFFEMENT ne change rien : toujours 2 / 5', (await progression(X)) === '2/5', 'lu : ' + await progression(X));
    t('B-UXS-C4 la barre de progression a un segment par exercice', await X.pg.evaluate(() => { const s = document.getElementById('tbs-segs'); return !!s && s.children.length === 2; }), '');
    await X.cx.close();
  }

  /* ══ D · TERMINER : séries de travail seulement ; direct si aucune ; confirmation exacte sinon ══ */
  const terminerEntete = async X => clicTexte(X, 'Terminer', '.topbar button');
  {
    // Toutes les séries de TRAVAIL faites, un échauffement sauté → fin directe, sans question.
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(60, 10, false, 'É'), N(100, 8, true), N(100, 7, true)] }]) });
    await fixDate(X); await versSeance(X);
    const avant = await etat(X);
    const ok = await terminerEntete(X); await X.pg.waitForTimeout(1600);
    const apres = await etat(X);
    t('B-UXS-D1 ⭐ 0 série de travail restante (échauffement sauté) : « Terminer » enregistre DIRECTEMENT, sans question',
      ok && !(await confirmOuvert(X)) && apres.nSess === avant.nSess + 1 && apres.s0 && apres.s0.exs[0].sets.length === 3 && !(apres.wkt && apres.wkt.exs && apres.wkt.exs.length),
      _det({ ok, nSess: [avant.nSess, apres.nSess], confirm: await confirmOuvert(X) }));
    await X.cx.close();
  }
  {
    // 3 séries de travail restantes (dont un échec prévu), 2 échauffements restants → « Il reste 3 séries ».
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(60, 10, false, 'É'), N(100, 8, true), N(100, 8), N(100, 6, false, 'X')] },
      { name: DM, sets: [N(30, 10, false, 'É'), N(50, 8)] }]) });
    await fixDate(X); await versSeance(X);
    const avant = await etat(X);
    const ok = await terminerEntete(X);
    const c = await confirmTexte(X);
    t('B-UXS-D2 ⭐ séries de travail restantes : confirmation « Il reste 3 séries à faire · Terminer quand même ? » (échauffements exclus)',
      ok && await confirmOuvert(X) && /Il reste 3 séries à faire/.test(c.titre) && /Terminer quand même \?/.test(c.msg) && /Terminer quand même/.test(c.ok) && /Continuer la séance/.test(c.non), _det(c));
    await clicTexte(X, 'Continuer la séance', '#ov-confirm button');
    const apres = await etat(X);
    t('B-UXS-D3 ⭐ « Continuer la séance » ne change rien (séance en cours identique, rien d\'enregistré)',
      !(await confirmOuvert(X)) && _det(apres.wkt) === _det(avant.wkt) && apres.nSess === avant.nSess, _det({ n: [avant.nSess, apres.nSess] }));
    // La porte du BAS converge vers le même propriétaire.
    await X.pg.evaluate(() => { document.getElementById('log-finish').scrollIntoView(); });
    const okBas = await clicTexte(X, 'Terminer la séance', '#log-finish button');
    const cb = await confirmTexte(X);
    t('B-UXS-D4 ⭐ le bouton « Terminer la séance » du bas passe par la MÊME confirmation (une seule porte de fin)',
      okBas && await confirmOuvert(X) && /Il reste 3 séries à faire/.test(cb.titre), _det(cb));
    await clicTexte(X, 'Terminer quand même', '#ov-confirm button'); await X.pg.waitForTimeout(1600);
    const fin = await etat(X);
    const sauve = fin.s0 && fin.s0.exs.map(e => e.sets.map(s => s.kg + 'x' + s.reps + (s.done ? '✓' : '') + s.type).join(','));
    t('B-UXS-D5 ⭐ « Terminer quand même » enregistre la séance telle quelle (mêmes exercices, séries faites intactes) — flux actuel inchangé',
      fin.nSess === avant.nSess + 1 && _det(sauve) === _det(avant.wkt.exs.map(e => e.sets.map(s => s.kg + 'x' + s.reps + (s.done ? '✓' : '') + s.type).join(','))),
      _det({ sauve, n: fin.nSess }));
    await X.cx.close();
  }
  {
    // « 🔄 Réessayer » (après un stockage plein, `_showSaveError`) repasse par la MÊME porte de fin : rien n'est enregistré
    // sans la question tant qu'il reste des séries de travail (une seule porte, R2).
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(100, 8, true), N(100, 8)] }]) });
    await fixDate(X); await versSeance(X);
    const avant = await etat(X);
    await X.pg.evaluate(() => { _showSaveError(); });
    const okR = await clicTexte(X, 'Réessayer', '#log-finish button');
    const c = await confirmTexte(X);
    const apres = await etat(X);
    t('B-UXS-D9 ⭐ « 🔄 Réessayer » après un stockage plein repasse par la même porte : « Il reste 1 série à faire », rien d\'enregistré sans réponse',
      okR && await confirmOuvert(X) && /Il reste 1 série à faire/.test(c.titre) && apres.nSess === avant.nSess && _det(apres.wkt) === _det(avant.wkt), _det({ okR, c, n: [avant.nSess, apres.nSess] }));
    await X.cx.close();
  }
  {
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(100, 8, true), N(100, 8)] }]) });
    await fixDate(X); await versSeance(X);
    await terminerEntete(X);
    t('B-UXS-D6 singulier : « Il reste 1 série à faire »', /Il reste 1 série à faire/.test((await confirmTexte(X)).titre), (await confirmTexte(X)).titre);
    await X.cx.close();
  }
  {
    // Préparation (exercices posés, rien de fait, pas de cardio) : pas de « Terminer » dans l'en-tête.
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(100, 8), N(100, 8)] }], { startTs: undefined }) });
    await fixDate(X); await versSeance(X);
    // ⚖️ R30 (17/10, décision M de Michel) : une séance préparée dont rien n'est fait s'appelle « Séance prête »
    //    (présentation seule, _seanceOuverte inchangée) — le témoin gardait « Séance en cours ». La GARANTIE ne bouge pas :
    //    l'en-tête de séance est là et n'offre pas « Terminer ».
    t('B-UXS-D7 rien de fait : l\'en-tête (« Séance prête ») n\'offre pas « Terminer » (rien à enregistrer — même règle que le bas)',
      (await parTexte(X, 'Séance prête', '.topbar *')) >= 1 && (await parTexte(X, 'Terminer', '.topbar button')) === 0, await enteteTexte(X));
    // ⭐ « Séance active affichée vide » : une séance OUVERTE dont le chrono n'a pas démarré (exercices posés, rien validé —
    //    l'état juste après un programme chargé) montre ses exercices, jamais l'écran « avant séance » ni une liste vide.
    const v = await X.pg.evaluate(() => { const vis = e => !!(e && e.offsetParent !== null && e.getBoundingClientRect().height > 0);
      return { cartes: document.querySelectorAll('#wkt-exs .ex-block').length, avant: vis(document.getElementById('log-avant')),
        ajout: vis(document.getElementById('log-add-ex')), noms: [...document.querySelectorAll('#wkt-exs .ex-name')].map(n => n.textContent.trim().slice(0, 18)) }; });
    t('B-UXS-B14 ⭐ séance ouverte SANS chrono démarré (rien validé) : l\'exercice est affiché, l\'écran « avant séance » est masqué, « Ajouter un exercice » est là',
      v.cartes === 1 && !v.avant && v.ajout, _det(v));
    await X.cx.close();
  }
  {
    // Cardio seul : la séance est ouverte, rien à confirmer, l'enregistrement part directement.
    const X = await ouvrir({ wkt: { date: '__TODAY__', exs: [], cardio: { type: 'tapis', intensity: 'modere', duration: 25 } } });
    await fixDate(X); await versSeance(X);
    const ok = await terminerEntete(X); await X.pg.waitForTimeout(1600);
    const e = await etat(X);
    t('B-UXS-D8 cardio seul : « Terminer » enregistre sans question (aucune série de travail)', ok && !(await confirmOuvert(X)) && e.nSess === 2 && e.s0 && e.s0.cardio && e.s0.cardio.duration === 25,
      _det({ ok, n: e.nSess }));
    await X.cx.close();
  }

  /* ══ E · BOUTON CENTRAL : une séance ouverte = une seule vérité ═══════════════════════════ */
  {
    const X = await ouvrir({ wkt: null });
    const fabs = [];
    await versAccueil(X); fabs.push(await fab(X));
    const aria0 = await X.pg.evaluate(() => document.getElementById('nb-log').getAttribute('aria-label'));
    const point0 = await X.pg.evaluate(() => getComputedStyle(document.querySelector('#nb-log .nb-plus'), '::after').content);
    await X.pg.click('#nb-log'); await X.pg.waitForTimeout(300);
    const e1 = await X.pg.evaluate(() => ({ ecran: window._curScreen, n: S.wkt && S.wkt.exs ? S.wkt.exs.length : -1, ouverte: _seanceOuverte() }));
    t('B-UXS-E1 sans séance : le « + » ouvre l\'écran Séance, rien d\'ouvert (comportement actuel)', e1.ecran === 'log' && e1.n === 0 && !e1.ouverte, _det(e1));
    t('B-UXS-E2 sans séance : pas de pastille, libellé « Démarrer une séance »', (point0 === 'none' || point0 === 'normal') && aria0 === 'Démarrer une séance', _det({ point0, aria0 }));
    fabs.push(await fab(X));
    // Ouvrir une vraie séance (un exercice), aller ailleurs, revenir par le « + ».
    await X.pg.evaluate(() => { S.wkt.exs.push({ name: 'Développé Couché', sets: [{ kg: 100, reps: 8, done: true, type: 'N', at: 30 }, { kg: 100, reps: 8, done: false, type: 'N' }] });
      S.wkt.startTs = Date.now() - 300000; persist(); renderLog(); });
    fabs.push(await fab(X));
    const avant = await etat(X);
    await versAccueil(X); fabs.push(await fab(X));
    const aria1 = await X.pg.evaluate(() => document.getElementById('nb-log').getAttribute('aria-label'));
    const point1 = await X.pg.evaluate(() => { const s = getComputedStyle(document.querySelector('#nb-log .nb-plus'), '::after'); return { c: s.content, bg: s.backgroundColor, w: s.width }; });
    // ⚖️ R30 (17/10, décision C de Michel) : la pastille VERTE devient un point BLEU plein (jeton Cobalt de séance, --sea).
    //    Ce qui l'allume ne change pas (#root.seance-on, _seanceOuverte). Le témoin figeait le vert rgb(52, 211, 153).
    t('B-UXS-E3 ⭐ séance ouverte : point bleu sur le « + » et libellé « Revenir à ta séance » (décision ⑤, informative)',
      point1.c !== 'none' && point1.c !== 'normal' && /rgb\(124, 149, 255\)/.test(point1.bg) && aria1 === 'Revenir à ta séance', _det({ point1, aria1 }));
    await X.pg.click('#nb-log'); await X.pg.waitForTimeout(300);
    const apres = await etat(X);
    t('B-UXS-E4 ⭐ séance ouverte : le « + » ramène à LA MÊME séance — jamais une deuxième', (await X.pg.evaluate(() => window._curScreen)) === 'log'
      && _det(apres.wkt) === _det(avant.wkt) && apres.nSess === avant.nSess, _det({ n: [avant.nSess, apres.nSess] }));
    fabs.push(await fab(X));
    await X.pg.click('#nb-log'); await X.pg.waitForTimeout(300);
    const encore = await etat(X);
    t('B-UXS-E5 déjà sur Séance : le « + » ne crée rien (même séance)', _det(encore.wkt) === _det(avant.wkt) && encore.nSess === avant.nSess, '');
    fabs.push(await fab(X));
    t('B-UXS-E6 🔴 RÈGLE D\'OR #9 : le bouton central n\'a pas bougé d\'un pixel entre les 6 états (sans/avec séance, Accueil/Séance)', new Set(fabs).size === 1, fabs.join(' | '));
    t('B-UXS-E7 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ══ F · DOCK DE REPOS (le moteur ne change pas : startRest / addRT / skipRest / setRestPreset) ══ */
  {
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets: [N(100, 8, true), N(100, 8), N(100, 8)] }]), w: 390, h: 844 });
    await fixDate(X); await versSeance(X);
    const avant = await rect(X, '#ex-block-0');
    const spAvant = await X.pg.evaluate(() => Math.round(document.querySelector('#s-log .scroll-spacer').getBoundingClientRect().height));
    await X.pg.evaluate(() => { _rirPending = [{ ei: 0, si: 0 }]; startRest(120); }); await X.pg.waitForTimeout(400);
    const dock = await rect(X, '#rest-bar'), nav = await rect(X, '.nav'), apres = await rect(X, '#ex-block-0');
    const spApres = await X.pg.evaluate(() => Math.round(document.querySelector('#s-log .scroll-spacer').getBoundingClientRect().height));
    t('B-UXS-F1 ⭐ le repos s\'affiche en DOCK en bas, juste au-dessus de la barre de navigation', dock !== null && nav !== null && dock.b <= nav.y + 4 && dock.y > X.H / 2, _det({ dock, nav }));
    t('B-UXS-F2 ⭐ le dock ne pousse pas le contenu (la carte d\'exercice ne bouge pas quand le repos démarre)', avant && apres && avant.y === apres.y, _det({ avant, apres }));
    t('B-UXS-F3 ⭐ l\'espace de fin de liste grandit pendant le repos (le bas reste atteignable sous le dock)', spApres > spAvant + 100, _det({ spAvant, spApres }));
    const btn = await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); const bar = document.getElementById('rest-bar');
      const txt = [...bar.querySelectorAll('button')].filter(vis).map(e => e.textContent.replace(/\s+/g, ' ').trim());
      return { txt, presetsDansDock: [60, 90, 120].some(v => vis(document.getElementById('rp-' + v)) && bar.contains(document.getElementById('rp-' + v))),
        rir: vis(document.getElementById('rest-rir')) && document.getElementById('rest-rir').textContent.trim().length > 0 }; }, [VIS]);
    t('B-UXS-F4 ⭐ le dock porte −15, +15, Passer et Régler — et plus les préréglages (décision ③)',
      ['−15', '+15', 'Passer'].every(l => btn.txt.some(x => x === l || x.indexOf(l) === 0)) && btn.txt.some(x => /Régler/.test(x)) && !btn.presetsDansDock, _det(btn));
    t('B-UXS-F5 la question du RIR reste dans le dock après une série de travail', btn.rir, _det(btn));
    const l0 = await X.pg.evaluate(() => _restLeft());
    await clicTexte(X, '+15', '#rest-bar button'); const l1 = await X.pg.evaluate(() => _restLeft());
    await clicTexte(X, '−15', '#rest-bar button'); const l2 = await X.pg.evaluate(() => _restLeft());
    t('B-UXS-F6 −15 / +15 règlent le temps restant (addRT inchangé)', l1 - l0 >= 13 && l1 - l0 <= 16 && l1 - l2 >= 13 && l1 - l2 <= 16, _det({ l0, l1, l2 }));
    await clicTexte(X, 'Régler', '#rest-bar button');
    const reg = await X.pg.evaluate(([VIS]) => { const vis = eval(VIS); const ov = document.getElementById('ov-rest-edit');
      return { ouvert: ov.classList.contains('open'), presets: [60, 90, 120].map(v => { const b = document.getElementById('rp-' + v); return !!b && vis(b) && ov.contains(b); }) }; }, [VIS]);
    t('B-UXS-F7 ⭐ « Régler » ouvre la fenêtre de réglage, qui porte les préréglages 1:00 / 1:30 / 2:00', reg.ouvert && reg.presets.every(Boolean), _det(reg));
    await clicSel(X, '#ov-rest-edit #rp-90');
    const pr = await X.pg.evaluate(() => ({ tot: restTot, ferme: !document.getElementById('ov-rest-edit').classList.contains('open'), tourne: !!restIv }));
    t('B-UXS-F8 un préréglage règle le repos (setRestPreset inchangé) et referme la fenêtre', pr.tot === 90 && pr.ferme && pr.tourne, _det(pr));
    await clicTexte(X, 'Passer', '#rest-bar button');
    const fin = await X.pg.evaluate(() => ({ tourne: !!restIv, montre: document.getElementById('rest-bar').classList.contains('show') }));
    t('B-UXS-F9 « Passer » arrête le repos (skipRest inchangé)', !fin.tourne && !fin.montre, _det(fin));
    t('B-UXS-F10 la règle du dock tient compte de la zone de sécurité basse (encoche)', await X.pg.evaluate(() => [...document.styleSheets].some(ss => { try { return [...ss.cssRules].some(r => r.selectorText === '#rest-bar' && /safe-area-inset-bottom/.test(r.cssText)); } catch (e) { return false; } })), '');
    t('B-UXS-F11 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  // La série suivante reste visible au-dessus du dock, même quand on valide en bas d'écran (360 px).
  {
    const sets = []; for (let i = 0; i < 8; i++) sets.push(N(100, 8));
    const X = await ouvrir({ wkt: wkt([{ name: DC, sets }]), w: 360, h: 780 });
    await fixDate(X); await versSeance(X);
    // On amène la 6ᵉ série juste au-dessus de la barre du bas, puis on la valide par le vrai ✓.
    await X.pg.evaluate(() => { const sc = document.getElementById('s-log'); const r = document.getElementById('sr-0-5').getBoundingClientRect();
      const nav = document.querySelector('.nav').getBoundingClientRect().top; sc.scrollTop += (r.bottom - (nav - 6)); });
    await X.pg.waitForTimeout(200);
    await clicSel(X, '#sr-0-5 .chk'); await X.pg.waitForTimeout(500);
    const m = await X.pg.evaluate(() => { const d = document.getElementById('rest-bar').getBoundingClientRect(); const r = document.getElementById('sr-0-6').getBoundingClientRect();
      const top = document.querySelector('.screens').getBoundingClientRect().top; return { dockTop: Math.round(d.top), dockH: Math.round(d.height), ligneTop: Math.round(r.top), ligneBas: Math.round(r.bottom), haut: Math.round(top) }; });
    t('B-UXS-F12 ⭐ 360 px : après validation en bas d\'écran, la série SUIVANTE est entièrement visible au-dessus du dock', m.dockH > 0 && m.ligneBas <= m.dockTop && m.ligneTop >= m.haut, _det(m));
    await X.cx.close();
  }

  /* ══ G · RESPONSIVE : 430 / 390 / 375 / 360, avant et pendant ═════════════════════════════ */
  for (const [W, H] of [[430, 932], [390, 844], [375, 667], [360, 780]]) {
    for (const actif of [false, true]) {
      const X = await ouvrir({ wkt: actif ? wkt([{ name: DC, sets: [N(100, 8, true), N(100, 8), N(100, 8)] }, { name: 'Élévations Latérales (Lateral Raise)', sets: [N(12, 15)] }], { progLabel: 'Push Pull Legs — jour 1 (haut du corps)' }) : null, w: W, h: H });
      if (actif) await fixDate(X);
      await versSeance(X);
      const o = await X.pg.evaluate(([W, VIS]) => { const vis = eval(VIS);
        const deb = [...document.querySelectorAll('#s-log *, .topbar *')].filter(e => vis(e) && !e.closest('.ts-liste') && getComputedStyle(e).position !== 'fixed' && e.getBoundingClientRect().right > W + 0.5)
          .map(e => (e.id || e.className || e.tagName) + '').slice(0, 4);
        const tb = document.querySelector('.topbar').getBoundingClientRect();
        const prem = [...document.getElementById('s-log').children].find(e => vis(e) && e.getBoundingClientRect().height > 0);
        return { deb, page: document.scrollingElement.scrollWidth <= W, entete: Math.round(tb.height), contenu: prem ? Math.round(prem.getBoundingClientRect().top) : null, basEntete: Math.round(tb.bottom) }; }, [W, VIS]);
      t('B-UXS-G ⭐ ' + W + '×' + H + (actif ? ' en séance : rien ne déborde, l\'en-tête de séance tient (≤ 100 px)' : ' avant : rien ne déborde (barre de marque inchangée)') + ' et le contenu commence dessous',
        o.deb.length === 0 && o.page && (!actif || o.entete <= 100) && o.contenu !== null && o.contenu >= o.basEntete - 2, _det(o));
      await X.cx.close();
    }
  }
}

module.exports = { ecran };
