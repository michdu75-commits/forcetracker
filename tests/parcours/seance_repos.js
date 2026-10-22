/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   ⏱️ SEANCE-REPOS-01 — LE REPOS EN COURS SURVIT À LA FERMETURE DE L'APP (blocs C-REP-*) — session-C (Claude Séance),
   22/10/2026, feu vert et décisions de Michel du 22/10 (docs/SEANCE-REPOS-01.md).
   ① le repos en cours est rangé dans la séance ACTIVE, `S.wkt.repos = {debut, total}` — rien d'autre, aucune clé nouvelle ;
   ② il revient à l'heure RÉELLE après une fermeture, un rechargement ou un retour dans la PWA — jamais redémarré ;
   ③ expiration 15 min après la fin THÉORIQUE (`debut + total`) : jusque-là le dépassement s'affiche en négatif, ensuite le
     repos est abandonné et son état persistant effacé — au premier plan comme au retour (avenant du 22/10 après-midi : le
     seuil était de 5 min le matin ; les témoins B0 et B5a gardent l'ancien instant d'abandon, 15:07:00, pour prouver qu'il
     ne coupe plus rien) ;
   ④ les réglages (−15 s, +15 s, « Régler », préréglages) suivent ; « Passer », la fin, l'abandon, « Vider » et la pause l'effacent ;
   ⑤ seul `ft4_wkt` le porte : jamais le brouillon de secours (`ft4_wkt_draft`), jamais la séance enregistrée ;
   ⑥ rien n'est restauré pour une séance qui n'est pas réellement active (en pause, vide, absente) ni pour une valeur douteuse.
   Ce que les témoins CONDUISENT : la vraie app servie en local, l'horloge du navigateur, de vrais gestes (coche d'une série, −15 s,
   +15 s, « Régler » → Valider, un préréglage, « Passer », « Terminer » → « Terminer quand même », le menu ⋯ → pause / vider /
   abandonner, le tap sur l'écran GO), de vrais rechargements, un retour au premier plan, et une réouverture HORS LIGNE servie par
   le vrai service worker.
   Ce qu'ils OBSERVENT : le dock (`#rest-bar`, `#rest-time`, `#rest-over`), la pilule, l'écran du décompte, le moteur
   (`restIv`, `restStartTs`, `restTot`), `S.wkt`, `ft4_wkt`, `ft4_wkt_draft`, la séance enregistrée, chaque écriture du stockage
   (espion), les vibrations (espion), le « + » central, le contexte de Milo CONSTRUIT (jamais envoyé), les erreurs de page.
   Ce qu'ils NE COUVRENT PAS : Safari / l'iPhone réel (une PWA tuée par iOS est simulée par un rechargement), le son ou une alerte
   app fermée (hors périmètre), ce qui n'est PAS repris après un rechargement (la question du RIR, l'étiquette « ⏭️ Ensuite »,
   l'avance automatique du superset, la mémoire de durée par exercice — limites écrites, hors périmètre), Milo lui-même.
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const T0 = Date.parse('2026-10-22T15:00:00+02:00');           // le repos de 2 min commence à 15 h 00
const S_ = s => T0 + s * 1000;
const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '120', ft4_sessions: '[]' };
const SQ = 'Squat à la Barre', DC = 'Développé Couché';
const serie = (done, type) => ({ kg: 100, reps: 5, type: type || 'N', done: !!done });
/* La séance active : chrono démarré il y a 10 min, une série faite, deux à faire. Repos de travail réglé à 2:00 (`ft4_rest`). */
const WKT = (extra) => Object.assign({ date: '2026-10-22', startHour: 14, startTs: T0 - 10 * 60000,
  exs: [{ name: SQ, sets: [serie(1), serie(0), serie(0)] }] }, extra || {});
const _det = o => JSON.stringify(o);

async function ecran(t, b, PORT) {
  const ouvrir = async (opts) => {
    opts = opts || {};
    const cx = await b.newContext({ serviceWorkers: opts.sw ? 'allow' : 'block', viewport: { width: 390, height: 844 },
      timezoneId: 'Europe/Paris', locale: 'fr-FR', hasTouch: true });
    const req = [];
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => { req.push(rt.request().url().slice(0, 70)); return rt.abort(); });
    const init = Object.assign({}, BASE, opts.ls || {});
    const w = opts.wkt === undefined ? WKT() : opts.wkt;
    if (w !== null) init.ft4_wkt = JSON.stringify(w);
    const dr = opts.draft === undefined ? w : opts.draft;
    if (dr !== null && dr !== undefined) init.ft4_wkt_draft = JSON.stringify(dr);
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_rep'))return; sessionStorage.setItem('_rep','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); }catch(e){} })();`);
    // espions : chaque écriture du stockage local, chaque vibration — posés à CHAQUE chargement
    await cx.addInitScript(`(()=>{ window.__ecrits=[]; window.__vib=[];
      const si=Storage.prototype.setItem, ri=Storage.prototype.removeItem;
      Storage.prototype.setItem=function(k,v){ try{ if(this===window.localStorage) window.__ecrits.push(String(k)); }catch(e){} return si.apply(this,arguments); };
      Storage.prototype.removeItem=function(k){ try{ if(this===window.localStorage) window.__ecrits.push('-'+String(k)); }catch(e){} return ri.apply(this,arguments); };
      try{ navigator.vibrate=function(p){ window.__vib.push(p); return true; }; }catch(e){}
      /* le dock de repos affiché depuis ce chargement, même un quart de seconde (un fantôme qui clignote ne se voit pas en
         lisant l'état après coup) : chaque ajout de la classe « show » sur #rest-bar est compté */
      window.__dockVu=0; const add=DOMTokenList.prototype.add;
      DOMTokenList.prototype.add=function(){ try{ const rb=document.getElementById('rest-bar');
        if(rb&&this===rb.classList&&[].indexOf.call(arguments,'show')>=0) window.__dockVu++; }catch(e){} return add.apply(this,arguments); }; })();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    await pg.clock.setFixedTime(new Date(opts.t === undefined ? T0 : opts.t));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const X = { cx, pg, errs, req };
    await nettoyer(X); if (opts.ecran !== 'home') await versSeance(X);
    return X;
  };
  const nettoyer = X => X.pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; });
  const versSeance = async X => { await X.pg.evaluate(() => { goScreen('log', document.getElementById('nb-log')); renderLog(); }); await X.pg.waitForTimeout(250); };
  const heure = async (X, t) => { await X.pg.clock.setFixedTime(new Date(t)); await X.pg.waitForTimeout(450); };   // ≥ un tick (250 ms)
  // un « redémarrage » : la page repart de zéro (PWA tuée, rechargée) — on lit l'état AVANT tout geste, puis on va sur Séance
  const recharger = async (X, t) => { await X.pg.clock.setFixedTime(new Date(t)); await X.pg.reload(); await X.pg.waitForTimeout(1500);
    const auDemarrage = await lire(X); await nettoyer(X); await versSeance(X); return auDemarrage; };
  const lire = X => X.pg.evaluate(() => {
    const ls = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return '??'; } };
    const w = ls('ft4_wkt'), d = ls('ft4_wkt_draft'), cd = document.getElementById('ov-rest-countdown');
    const fab = document.getElementById('nb-log').getBoundingClientRect();
    return { ecran: window._curScreen, dock: document.getElementById('rest-bar').classList.contains('show'),
      temps: (document.getElementById('rest-time') || {}).textContent || '', au_dela: (document.getElementById('rest-over') || {}).textContent || '',
      pilule: document.getElementById('rest-pill').classList.contains('show'), pTemps: (document.getElementById('rest-pill-time') || {}).textContent || '',
      tourne: !!restIv, debut: restStartTs, total: restTot,
      decompte: !!(cd && cd.style.display === 'block'), go: ((document.getElementById('rcd-num') || {}).textContent || '') === 'GO',
      repos: S.wkt ? (S.wkt.repos === undefined ? '∅' : S.wkt.repos) : 'pas de séance',
      lsRepos: w && typeof w === 'object' ? (w.repos === undefined ? '∅' : w.repos) : (w === null ? 'null' : '??'),
      brouillon: d && typeof d === 'object' ? (Object.prototype.hasOwnProperty.call(d, 'repos') ? 'AVEC repos' : 'sans repos') : (d === null ? 'absent' : '??'),
      vib: (window.__vib || []).length, dockVu: window.__dockVu || 0, fab: [fab.x, fab.y, fab.width, fab.height].map(Math.round),
      seance: S.wkt ? JSON.stringify(S.wkt.exs) : null, pause: !!(S.wkt && S.wkt.pausedAt) };
  });
  const ouvrirEx = async (X, ei) => { await X.pg.evaluate(ei => { _expandedEx = ei; renderExBlocks(); }, ei); await X.pg.waitForTimeout(150); };
  const clic = async (X, sel, txt) => { let loc = X.pg.locator(sel).filter({ visible: true }); if (txt) loc = loc.filter({ hasText: txt });
    if (!(await loc.count())) return false; try { await loc.first().click({ timeout: 2500 }); } catch (e) { return false; } await X.pg.waitForTimeout(300); return true; };
  // la VRAIE coche d'une série : le repos démarre comme à la salle (toggleSet → startRest)
  const cocher = async (X, ei, si) => { await ouvrirEx(X, ei); return clic(X, '#sr-' + ei + '-' + si + ' .chk'); };
  const menu = async (X, ligne) => { if (!(await clic(X, '.tbs-btn[onclick="openWktMenu()"]'))) return false; return clic(X, '#ov-wkt-menu .wm-row', ligne); };
  const confirmer = async X => { await X.pg.waitForTimeout(150);
    if (await X.pg.evaluate(() => { const o = document.getElementById('ov-confirm'); return !!(o && o.classList.contains('open')); })) await X.pg.click('#confirm-ok');
    await X.pg.waitForTimeout(600); };
  const fermer = X => X.cx.close();

  /* ── A. RECHARGEMENT PENDANT LE DÉCOMPTE ───────────────────────────────────────────────────────────── */
  {
    const X = await ouvrir();
    const avant = await lire(X);
    const coche = await cocher(X, 0, 1);
    const a = await lire(X);
    t('C-REP-A1 ⭐ la coche démarre le repos ET le range dans la séance active : `S.wkt.repos` = {debut: 15:00:00, total: 120} — ces deux clés, rien d\'autre',
      coche && a.tourne && _det(a.repos) === _det({ debut: T0, total: 120 }), _det({ coche, tourne: a.tourne, repos: a.repos }));
    t('C-REP-A1b … et `ft4_wkt` le porte sur le disque (le téléphone peut s\'éteindre maintenant)',
      _det(a.lsRepos) === _det({ debut: T0, total: 120 }), _det({ disque: a.lsRepos }));
    // une écriture « normale » pendant le repos : la réponse à la réserve (setRir → persist) réécrit séance ET brouillon
    const rep = await X.pg.evaluate(() => { const bt = [...document.querySelectorAll('#rest-rir .rir-b')].find(x => x.textContent.trim() === '2'); if (!bt) return false; bt.click(); return true; });
    await X.pg.waitForTimeout(250);
    const a2 = await lire(X);
    const rir = await X.pg.evaluate(() => { const s = S.wkt.exs[0].sets[1]; return { rir: s.rir, rirV: s.rirV }; });
    t('C-REP-A2 ⛔ décision 3 de Michel : le brouillon de secours ne porte JAMAIS le repos (même après une sauvegarde complète pendant le repos)',
      rep && rir.rir === 2 && a2.brouillon === 'sans repos' && _det(a2.lsRepos) === _det({ debut: T0, total: 120 }),
      _det({ reponse: rep, rir, brouillon: a2.brouillon, disque: a2.lsRepos }));
    const auDemarrage = await recharger(X, S_(40));
    t('C-REP-A3 ⭐⭐ rechargement à 15:00:40 (PWA tuée puis rouverte) : le repos REPREND à l\'heure réelle — la pilule de l\'Accueil dit 1:20',
      auDemarrage.tourne && auDemarrage.debut === T0 && auDemarrage.total === 120 && auDemarrage.pilule && auDemarrage.pTemps === '1:20',
      _det({ ecran: auDemarrage.ecran, tourne: auDemarrage.tourne, debut: auDemarrage.debut - T0, total: auDemarrage.total, pilule: auDemarrage.pilule, pTemps: auDemarrage.pTemps }));
    const b1 = await lire(X);
    t('C-REP-A4 ⭐ … et sur Séance le dock affiche 1:20 (2:00 − 40 s), sans « au-delà »',
      b1.dock && b1.temps === '1:20' && b1.au_dela === '', _det({ dock: b1.dock, temps: b1.temps, au_dela: b1.au_dela }));
    t('C-REP-A5 ⛔ aucun fantôme à la reprise : ni vibration, ni écran de décompte, aucune erreur',
      b1.vib === 0 && !b1.decompte && X.errs.length === 0, _det({ vib: b1.vib, decompte: b1.decompte, err: X.errs.slice(0, 2) }));
    t('C-REP-A6 ⛔ aucun redémarrage artificiel : l\'heure de départ et la durée sont celles d\'avant la fermeture, en mémoire comme sur le disque',
      _det(b1.repos) === _det({ debut: T0, total: 120 }) && _det(b1.lsRepos) === _det({ debut: T0, total: 120 }), _det({ repos: b1.repos, disque: b1.lsRepos }));
    t('C-REP-A7 ⛔ zéro perte : la séance (séries faites, réserve répondue) est identique après le rechargement',
      b1.seance === a2.seance && /"rir":2/.test(b1.seance || ''), _det({ avant: (a2.seance || '').slice(0, 90), apres: (b1.seance || '').slice(0, 90) }));
    t('C-REP-A8 🔴 règle d\'or #9 : le « + » central n\'a pas bougé (avant le repos = après la reprise)',
      _det(avant.fab) === _det(b1.fab) && b1.fab[2] > 0, _det({ avant: avant.fab, apres: b1.fab }));
    await heure(X, S_(112));
    const c1 = await lire(X);
    t('C-REP-A9 le repos repris finit comme un autre : à 8 s de la fin, l\'écran du décompte s\'ouvre',
      c1.decompte && c1.tourne, _det({ decompte: c1.decompte, temps: c1.temps }));
    await heure(X, S_(125));
    const c2 = await lire(X);
    t('C-REP-A10 … puis GO, et le dock passe en négatif (+0:05, « au-delà de ton repos max ») — le fonctionnement existant',
      c2.go && c2.dock && c2.temps === '+0:05' && /au-delà de ton repos max/.test(c2.au_dela) && c2.vib >= 1,
      _det({ go: c2.go, temps: c2.temps, au_dela: c2.au_dela, vib: c2.vib }));
    await fermer(X);
  }

  /* ── B. LE DÉPASSEMENT : 14:59 AFFICHÉ, 15:00 ABANDONNÉ (5:00 NE COUPE PLUS RIEN) ────────────────── */
  {
    // l'ANCIEN instant d'abandon (5 min après la fin, décision du 22/10 au matin) : il ne doit plus rien couper
    const X = await ouvrir();
    await cocher(X, 0, 1);
    const auDemarrage = await recharger(X, S_(120 + 300));       // 15:07:00
    const b = await lire(X);
    t('C-REP-B0 ⭐⭐ rouvert à 15:07:00 (5 min après la fin prévue, l\'ancien seuil) : le repos est toujours là, en négatif (+5:00), rien n\'est effacé',
      auDemarrage.tourne && b.dock && b.temps === '+5:00' && _det(b.lsRepos) === _det({ debut: T0, total: 120 }) && !b.decompte && b.vib === 0,
      _det({ tourne: auDemarrage.tourne, dock: b.dock, temps: b.temps, disque: b.lsRepos, decompte: b.decompte, vib: b.vib }));
    await fermer(X);
  }
  {
    const X = await ouvrir();
    await cocher(X, 0, 1);
    const auDemarrage = await recharger(X, S_(120 + 899));       // 15:16:59
    const b = await lire(X);
    t('C-REP-B1 ⭐⭐ retour à 15:16:59 (14 min 59 s après la fin prévue) : le dock dit +14:59 et « au-delà de ton repos max », sans écran GO ni vibration',
      auDemarrage.tourne && b.dock && b.temps === '+14:59' && /au-delà de ton repos max/.test(b.au_dela) && !b.decompte && b.vib === 0,
      _det({ tourne: auDemarrage.tourne, dock: b.dock, temps: b.temps, au_dela: b.au_dela, decompte: b.decompte, vib: b.vib }));
    // la PILULE (hors de l'écran Séance, donc lue au démarrage, avant d'aller sur Séance) : elle a son propre arrêt
    t('C-REP-B1b la pilule, au même instant (15:16:59, hors de l\'écran Séance) : visible, +14:59 — elle lit le même seuil',
      auDemarrage.pilule && auDemarrage.pTemps === '+14:59', _det({ pilule: auDemarrage.pilule, pTemps: auDemarrage.pTemps, ecran: auDemarrage.ecran }));
    await heure(X, S_(120 + 900));                                // 15:17:00
    const b2 = await lire(X);
    t('C-REP-B2 ⭐ … et à 15:17:00 le repos est abandonné : dock et pilule fermés, état persistant effacé (mémoire et disque)',
      !b2.tourne && !b2.dock && !b2.pilule && b2.repos === '∅' && b2.lsRepos === '∅', _det({ tourne: b2.tourne, dock: b2.dock, repos: b2.repos, disque: b2.lsRepos }));
    await fermer(X);
  }
  {
    const X = await ouvrir();
    await cocher(X, 0, 1);
    const pre = await lire(X);
    const auDemarrage = await recharger(X, S_(120 + 900));       // rouvert à 15:17:00 pile
    const b = await lire(X);
    t('C-REP-B3 ⭐⭐ rouvert à 15:17:00 (15 min après la fin prévue) : rien ne reprend, et le repos rangé avant la fermeture est EFFACÉ du disque',
      _det(pre.lsRepos) === _det({ debut: T0, total: 120 }) && !auDemarrage.tourne && !auDemarrage.pilule && auDemarrage.dockVu === 0 && !b.dock && b.repos === '∅' && b.lsRepos === '∅',
      _det({ avantFermeture: pre.lsRepos, tourne: auDemarrage.tourne, pilule: auDemarrage.pilule, dockVu: auDemarrage.dockVu, dock: b.dock, repos: b.repos, disque: b.lsRepos }));
    t('C-REP-B3b … la séance, elle, est intacte (seul le repos part)',
      b.seance === pre.seance && !!b.seance, _det({ seance: (b.seance || '').slice(0, 80) }));
    await fermer(X);
  }
  {
    const X = await ouvrir();
    await cocher(X, 0, 1);
    const auDemarrage = await recharger(X, S_(2 * 3600));        // deux heures plus tard
    const b = await lire(X);
    t('C-REP-B4 rouvert deux heures plus tard : aucun chrono, rien sur le disque',
      !auDemarrage.tourne && auDemarrage.dockVu === 0 && !b.dock && b.lsRepos === '∅', _det({ tourne: auDemarrage.tourne, dockVu: auDemarrage.dockVu, dock: b.dock, disque: b.lsRepos }));
    await fermer(X);
  }
  {
    // AU PREMIER PLAN, sans fermeture : la même règle (un seul seuil, un seul propriétaire)
    const X = await ouvrir();
    await cocher(X, 0, 1);
    await heure(X, S_(120 + 300));
    const f0 = await lire(X);
    t('C-REP-B5a ⭐ app restée ouverte : à 15:07:00 (l\'ancien seuil de 5 min) le repos tourne encore, +5:00, toujours rangé sur le disque',
      f0.tourne && f0.dock && f0.temps === '+5:00' && _det(f0.lsRepos) === _det({ debut: T0, total: 120 }), _det({ tourne: f0.tourne, temps: f0.temps, disque: f0.lsRepos }));
    await heure(X, S_(120 + 899));
    const f1 = await lire(X);
    t('C-REP-B5 app restée ouverte : à 15:16:59 le dock dit +14:59',
      f1.tourne && f1.dock && f1.temps === '+14:59', _det({ tourne: f1.tourne, temps: f1.temps }));
    await heure(X, S_(120 + 900));
    const f2 = await lire(X);
    t('C-REP-B6 ⭐ app restée ouverte : à 15:17:00 le repos s\'arrête et son état persistant est effacé (le même seuil qu\'au retour)',
      !f2.tourne && !f2.dock && f2.repos === '∅' && f2.lsRepos === '∅', _det({ tourne: f2.tourne, dock: f2.dock, repos: f2.repos, disque: f2.lsRepos }));
    await fermer(X);
  }

  /* ── C. RETOUR DANS LA PWA SANS RECHARGEMENT (l'app était en arrière-plan) ─────────────────────────── */
  {
    const X = await ouvrir();
    await cocher(X, 0, 1);
    await heure(X, S_(150));
    await X.pg.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await X.pg.waitForTimeout(300);
    const v1 = await lire(X);
    t('C-REP-C1 ⭐⭐ retour au premier plan 30 s après la fin : le repos est toujours là, en négatif (+0:30) — il n\'est plus coupé',
      v1.tourne && v1.dock && v1.temps === '+0:30', _det({ tourne: v1.tourne, dock: v1.dock, temps: v1.temps }));
    await X.pg.clock.setFixedTime(new Date(S_(120 + 300)));
    await X.pg.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await X.pg.waitForTimeout(300);
    const v15 = await lire(X);
    t('C-REP-C1b retour au premier plan à 15:07:00 (l\'ancien seuil de 5 min) : toujours là, +5:00, toujours rangé',
      v15.tourne && v15.dock && v15.temps === '+5:00' && _det(v15.lsRepos) === _det({ debut: T0, total: 120 }), _det({ tourne: v15.tourne, temps: v15.temps, disque: v15.lsRepos }));
    await X.pg.clock.setFixedTime(new Date(S_(120 + 900)));
    await X.pg.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await X.pg.waitForTimeout(300);
    const v2 = await lire(X);
    t('C-REP-C2 … et un retour 15 min après la fin trouve le repos abandonné et effacé',
      !v2.tourne && !v2.dock && v2.lsRepos === '∅', _det({ tourne: v2.tourne, dock: v2.dock, disque: v2.lsRepos }));
    await fermer(X);
  }

  /* ── D. LES RÉGLAGES FAITS AVANT LA FERMETURE SONT RETROUVÉS ──────────────────────────────────────── */
  {
    const X = await ouvrir();
    await cocher(X, 0, 1);
    await heure(X, S_(10));
    const plus = await clic(X, '#rest-btn-plus');
    const d = await lire(X);
    await recharger(X, S_(20));
    const r = await lire(X);
    // 2:00 − 10 s + 15 s = 2:05 restant à 15:00:10 → l'heure de départ équivalente est 15:00:15 → à 15:00:20 il reste 1:55
    t('C-REP-D1 ⭐ « +15 s » puis fermeture : le disque suit (départ équivalent 15:00:15) et la reprise dit 1:55',
      plus && _det(d.lsRepos) === _det({ debut: S_(15), total: 120 }) && r.dock && r.temps === '1:55',
      _det({ clic: plus, disque: d.lsRepos && { debut: d.lsRepos.debut - T0, total: d.lsRepos.total }, temps: r.temps }));
    await fermer(X);
  }
  {
    /* ⚠️ Trouvé par la revue adverse de l'avenant (22/10 après-midi) : « +15 s » TÔT dans le repos range un départ
       équivalent DANS LE FUTUR (le restant dépasse alors la durée) — et la reprise refusait tout départ à plus de 5 s dans le
       futur (garde « horloge reculée ») : fermer l'app dans les secondes qui suivent EFFAÇAIT le repos. */
    const X = await ouvrir();
    await cocher(X, 0, 1);                                         // 15:00:00, repos de 2:00
    await heure(X, S_(1));
    const p1 = await clic(X, '#rest-btn-plus'), p2 = await clic(X, '#rest-btn-plus');   // 1:59 → 2:14 → 2:29
    const d = await lire(X);
    const auDemarrage = await recharger(X, S_(10));                 // téléphone verrouillé 9 s
    const r = await lire(X);
    // 2:29 restant à 15:00:01 → départ équivalent 15:00:30 (dans le futur) → à 15:00:10 il reste 2:20
    t('C-REP-D1b ⭐⭐ « +15 s » deux fois dès le début, puis fermeture 9 s plus tard : le repos REVIENT (2:20), il n\'est pas pris pour une horloge reculée',
      p1 && p2 && _det(d.lsRepos) === _det({ debut: S_(30), total: 120 }) && auDemarrage.tourne && r.dock && r.temps === '2:20' && _det(r.lsRepos) === _det({ debut: S_(30), total: 120 }),
      _det({ clics: [p1, p2], disque: d.lsRepos && { debut: d.lsRepos.debut - T0, total: d.lsRepos.total }, tourne: auDemarrage.tourne, temps: r.temps, apres: r.lsRepos }));
    await fermer(X);
  }
  {
    const X = await ouvrir();
    await cocher(X, 0, 1);
    await heure(X, S_(10));
    const moins = await clic(X, '#rest-btn-minus');
    await recharger(X, S_(20));
    const r = await lire(X);
    // 2:00 − 10 s − 15 s = 1:35 restant à 15:00:10 → à 15:00:20 il reste 1:25
    t('C-REP-D2 « −15 s » puis fermeture : la reprise dit 1:25', moins && r.dock && r.temps === '1:25', _det({ clic: moins, temps: r.temps }));
    await fermer(X);
  }
  {
    const X = await ouvrir();
    await cocher(X, 0, 1);
    await heure(X, S_(10));
    const ouvre = await clic(X, '#rest-regler');
    await X.pg.fill('#re-min', '1'); await X.pg.fill('#re-sec', '0');
    const valide = await clic(X, '#ov-rest-edit .re-ok');
    await recharger(X, S_(40));
    const r = await lire(X);
    // « Régler » 1:00 à 15:00:10 repart de 1:00 → à 15:00:40 il reste 0:30
    t('C-REP-D3 « Régler » → 1:00 → Valider, puis fermeture : la reprise dit 0:30 (repos de 1:00 parti à 15:00:10)',
      ouvre && valide && r.dock && r.temps === '0:30' && _det(r.repos) === _det({ debut: S_(10), total: 60 }), _det({ ouvre, valide, temps: r.temps, repos: r.repos }));
    await fermer(X);
  }
  {
    const X = await ouvrir();
    await cocher(X, 0, 1);
    await heure(X, S_(10));
    const ouvre = await clic(X, '#rest-regler');
    const pre = await clic(X, '#rp-45');
    await recharger(X, S_(30));
    const r = await lire(X);
    // préréglage 45 s : le départ reste 15:00:00, la cible devient 45 s → à 15:00:30 il reste 0:15
    t('C-REP-D4 préréglage 45 s puis fermeture : la reprise dit 0:15 (même départ, nouvelle durée)',
      ouvre && pre && r.dock && r.temps === '0:15' && _det(r.repos) === _det({ debut: T0, total: 45 }), _det({ ouvre, pre, temps: r.temps, repos: r.repos }));
    await fermer(X);
  }

  /* ── E. FERMETURE ET REPRISE HORS CONNEXION (le vrai service worker) ─────────────────────────────── */
  {
    const X = await ouvrir({ sw: true });
    const ctl = await X.pg.evaluate(async () => { const t0 = performance.now();
      while (performance.now() - t0 < 15000) { const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.active && navigator.serviceWorker.controller) return true; await new Promise(r => setTimeout(r, 200)); }
      return false; }).catch(() => false);
    await X.pg.waitForLoadState('load'); await X.pg.waitForTimeout(1200);
    await nettoyer(X); await versSeance(X);
    await cocher(X, 0, 1);
    await X.cx.setOffline(true);
    let servi = null;
    try { await X.pg.clock.setFixedTime(new Date(S_(30))); const rep = await X.pg.reload({ waitUntil: 'load', timeout: 15000 }); servi = !!(rep && rep.fromServiceWorker()); }
    catch (e) { servi = 'erreur ' + String(e.message || e).slice(0, 60); }
    await X.pg.waitForTimeout(1500); await nettoyer(X); await versSeance(X);
    const r = await lire(X);
    t('C-REP-E1 ⭐ hors connexion (rechargement servi par le service worker) : le repos reprend à 1:30, rien ne vient du réseau',
      ctl === true && servi === true && r.tourne && r.dock && r.temps === '1:30', _det({ controle: ctl, servi, tourne: r.tourne, temps: r.temps }));
    await fermer(X);
  }

  /* ── F. CE QUI L'EFFACE : Passer, fin, abandon, Vider, pause, tap sur GO ─────────────────────────── */
  {
    const X = await ouvrir();
    await cocher(X, 0, 1);
    const pre = await lire(X);
    const passe = await clic(X, '#rest-bar .rd-skip');
    const a = await lire(X);
    const auDemarrage = await recharger(X, S_(20));
    t('C-REP-F1 « Passer » efface le repos (mémoire et disque) ; rouvert 20 s plus tard, rien ne revient',
      _det(pre.lsRepos) === _det({ debut: T0, total: 120 }) && passe && a.repos === '∅' && a.lsRepos === '∅' && !auDemarrage.tourne && !auDemarrage.pilule && auDemarrage.dockVu === 0,
      _det({ avant: pre.lsRepos, clic: passe, repos: a.repos, disque: a.lsRepos, tourne: auDemarrage.tourne, dockVu: auDemarrage.dockVu }));
    await fermer(X);
  }
  {
    const X = await ouvrir();
    await cocher(X, 0, 1);
    const fin = await clic(X, '.tbs-fin');
    await confirmer(X);
    /* ⚠️ Après la fin, l'écran Séance RECRÉE un objet vide (`renderLog`, comportement existant — cf. B-S01-N7) : « plus de
       séance active » se lit donc « aucune séance, ou un objet vide sans exercice », jamais « S.wkt === null ». */
    const s = await X.pg.evaluate(() => { const lw = JSON.parse(localStorage.getItem('ft4_wkt') || 'null');
      return { active: !!(S.wkt && (S.wkt.exs || []).length), repos: !!(S.wkt && 'repos' in S.wkt), lsActive: !!(lw && (lw.exs || []).length),
        lsRepos: !!(lw && 'repos' in lw), n: (S.sessions || []).length, cles: S.sessions && S.sessions[0] ? Object.keys(S.sessions[0]) : [],
        disque: (JSON.parse(localStorage.getItem('ft4_sessions') || '[]')[0] || {}) }; });
    const auDemarrage = await recharger(X, S_(30));
    t('C-REP-F2 ⭐ « Terminer » pendant un repos : séance enregistrée SANS champ `repos` (mémoire et disque), plus de séance active, rien ne revient',
      fin && !s.active && !s.repos && !s.lsActive && !s.lsRepos && s.n === 1 && s.cles.indexOf('repos') < 0 && !('repos' in s.disque) && !auDemarrage.tourne && !auDemarrage.pilule && auDemarrage.dockVu === 0,
      _det({ clic: fin, s, tourne: auDemarrage.tourne }));
    await fermer(X);
  }
  {
    const X = await ouvrir();
    await cocher(X, 0, 1);
    const ab = await menu(X, 'Abandonner la séance');
    await confirmer(X);
    const a = await lire(X);
    const auDemarrage = await recharger(X, S_(30));
    t('C-REP-F3 « Abandonner la séance » pendant un repos : plus de séance, plus de repos ; rien ne revient',
      ab && (a.repos === 'pas de séance' || a.repos === '∅') && (a.lsRepos === 'null' || a.lsRepos === '∅') && a.seance === '[]' && !a.tourne && !auDemarrage.tourne && !auDemarrage.pilule && auDemarrage.dockVu === 0,
      _det({ menu: ab, repos: a.repos, disque: a.lsRepos, tourne: auDemarrage.tourne }));
    await fermer(X);
  }
  {
    const X = await ouvrir();
    await cocher(X, 0, 1);
    const vi = await menu(X, 'Vider la séance');
    await confirmer(X);
    const a = await lire(X);
    const auDemarrage = await recharger(X, S_(30));
    t('C-REP-F4 « Vider la séance » pendant un repos : le repos s\'arrête et s\'efface ; rien ne revient',
      vi && !a.tourne && a.repos === '∅' && a.lsRepos === '∅' && !auDemarrage.tourne && auDemarrage.dockVu === 0, _det({ menu: vi, tourne: a.tourne, repos: a.repos, disque: a.lsRepos, apres: auDemarrage.tourne }));
    await fermer(X);
  }
  {
    const X = await ouvrir();
    await cocher(X, 0, 1);
    const pa = await menu(X, 'Mettre en pause');
    const a = await lire(X);
    const auDemarrage = await recharger(X, S_(30));
    t('C-REP-F5 « Mettre en pause » pendant un repos : le repos s\'arrête et s\'efface ; la séance en pause ne fait rien revenir',
      pa && a.pause && !a.tourne && a.repos === '∅' && a.lsRepos === '∅' && !auDemarrage.tourne && !auDemarrage.pilule && auDemarrage.dockVu === 0,
      _det({ menu: pa, pause: a.pause, tourne: a.tourne, repos: a.repos, disque: a.lsRepos, apres: auDemarrage.tourne }));
    await fermer(X);
  }
  {
    const X = await ouvrir();
    await cocher(X, 0, 1);
    await heure(X, S_(115));
    await heure(X, S_(121));
    const go = await lire(X);
    const tap = await clic(X, '#ov-rest-countdown');
    const a = await lire(X);
    t('C-REP-F6 le tap sur l\'écran GO arrête le repos et l\'efface',
      go.decompte && go.go && tap && !a.tourne && a.repos === '∅' && a.lsRepos === '∅', _det({ go: go.go, tap, tourne: a.tourne, repos: a.repos, disque: a.lsRepos }));
    await fermer(X);
  }

  /* ── G. AUCUN CHRONOMÈTRE FANTÔME ───────────────────────────────────────────────────────────────── */
  {
    // une séance d'AVANT ce lot : aucun champ `repos`
    const X = await ouvrir({ ecran: 'home' });
    const r = await lire(X);
    const w = await X.pg.evaluate(() => ({ ls: localStorage.getItem('ft4_wkt'), ecrits: (window.__ecrits || []).filter(k => k === 'ft4_wkt').length }));
    t('C-REP-G1 ⭐ séance existante SANS repos (enregistrée avant ce lot) : au démarrage, aucun chrono, aucune pilule, et `ft4_wkt` n\'est pas réécrit pour le repos',
      !r.tourne && !r.pilule && r.dockVu === 0 && r.lsRepos === '∅' && w.ecrits === 0 && JSON.parse(w.ls).exs.length === 1, _det({ tourne: r.tourne, pilule: r.pilule, dockVu: r.dockVu, disque: r.lsRepos, ecritures: w.ecrits }));
    await fermer(X);
  }
  {
    const cas = [
      ['séance en pause', WKT({ pausedAt: S_(-30), repos: { debut: S_(-20), total: 120 } })],
      ['séance vide, jamais commencée', { date: '2026-10-22', exs: [], repos: { debut: S_(-20), total: 120 } }],
      ['départ dans le futur (horloge reculée)', WKT({ repos: { debut: S_(3600), total: 120 } })],
      // « +15 s » peut ranger un départ futur (C-REP-D1b), mais jamais un restant de plus de 10 min : 15:08:20 + 2:00 = 10:20 restants
      ['départ futur au-delà de ce que « +15 s » peut produire (10:20 restants)', WKT({ repos: { debut: S_(500), total: 120 } })],
      ['durée nulle', WKT({ repos: { debut: S_(-20), total: 0 } })],
      ['durée illisible', WKT({ repos: { debut: S_(-20), total: 'abc' } })],
      ['départ absent', WKT({ repos: { total: 120 } })],
      ['valeur qui n\'est pas un objet', WKT({ repos: 42 })],
    ];
    const res = [];
    for (const [nom, w] of cas) {
      const X = await ouvrir({ wkt: w, draft: null, ecran: 'home' });
      const r = await lire(X);
      res.push({ nom, tourne: r.tourne, pilule: r.pilule, dockVu: r.dockVu, disque: r.lsRepos, err: X.errs.length });
      await fermer(X);
    }
    t('C-REP-G2 ⭐ rien n\'est repris pour une séance qui n\'est pas réellement active ni pour une valeur douteuse — et la valeur est effacée du disque (8 cas)',
      res.every(r => !r.tourne && !r.pilule && r.dockVu === 0 && r.disque === '∅' && r.err === 0), _det(res.filter(r => r.tourne || r.pilule || r.dockVu || r.disque !== '∅' || r.err)));
  }
  {
    // le repos n'écrit que `ft4_wkt` : aucune clé nouvelle, jamais le brouillon ; en mode démo, rien du tout
    const X = await ouvrir();
    const e = await X.pg.evaluate(() => { window.__ecrits.length = 0; startRest(60); addRT(15); setRestPreset(45); stopRest();
      const tout = window.__ecrits.slice(); window.__ecrits.length = 0;
      window._demoMode = true; startRest(60); addRT(15); stopRest(); const demo = window.__ecrits.slice(); window._demoMode = false;
      return { tout, demo }; });
    t('C-REP-G3 ⭐ le repos n\'écrit QUE `ft4_wkt` (aucune clé nouvelle, jamais `ft4_wkt_draft`)',
      e.tout.length > 0 && e.tout.every(k => k === 'ft4_wkt'), _det(e.tout));
    t('C-REP-G4 ⛔ en mode démo (personas de test), le repos n\'écrit rien', e.demo.length === 0, _det(e.demo));
    await fermer(X);
  }

  /* ── H. NON-RÉGRESSIONS : Milo, la réserve, le superset, l'avance à l'exercice suivant ────────────── */
  {
    const X = await ouvrir();
    const m = await X.pg.evaluate(() => { const a = buildCoachContext('Combien de repos ?');
      S.wkt.repos = { debut: Date.now() - 30000, total: 120 }; const b = buildCoachContext('Combien de repos ?'); delete S.wkt.repos;
      return { egal: a === b, la: a.length, lb: b.length, mot: /repos\W{0,3}debut|"debut"|"total"/.test(b) }; });
    t('C-REP-H1 ⛔ Milo ne reçoit rien de nouveau : le contexte construit est identique avec et sans repos rangé (aucun appel)',
      m.egal && !m.mot, _det(m));
    await fermer(X);
  }
  {
    // superset : la 1ʳᵉ coche avance sans repos, la 2ᵉ lance le repos du tour avec ses DEUX questions — et le range
    const w = { date: '2026-10-22', startHour: 14, startTs: T0 - 10 * 60000, exs: [
      { name: SQ, group: 'g1', groupType: 'super', sets: [serie(0), serie(0)] },
      { name: DC, group: 'g1', groupType: 'super', sets: [serie(0), serie(0)] }] };
    const X = await ouvrir({ wkt: w });
    await cocher(X, 0, 0);
    const a = await lire(X);
    await cocher(X, 1, 0);
    const b = await lire(X);
    const q = await X.pg.evaluate(() => document.querySelectorAll('#rest-rir .rir-lbl').length);
    t('C-REP-H2 superset inchangé : pas de repos entre les deux mouvements, puis le repos du tour (2 questions de réserve) — rangé dans la séance',
      !a.tourne && a.repos === '∅' && b.tourne && q === 2 && _det(b.repos) === _det({ debut: T0, total: 120 }), _det({ entre: a.tourne, tour: b.tourne, questions: q, repos: b.repos }));
    await fermer(X);
  }
  {
    // la dernière série de travail d'un exercice : « ⏭️ Ensuite » puis « Passer » avance à l'exercice suivant (ft-v825)
    const w = { date: '2026-10-22', startHour: 14, startTs: T0 - 10 * 60000, exs: [
      { name: SQ, sets: [serie(1), serie(0)] }, { name: DC, sets: [serie(0), serie(0)] }] };
    const X = await ouvrir({ wkt: w });
    await cocher(X, 0, 1);
    const lbl = await X.pg.evaluate(() => (document.getElementById('rest-label') || {}).textContent || '');
    await clic(X, '#rest-bar .rd-skip');
    await X.pg.waitForTimeout(300);
    const ouvert = await X.pg.evaluate(() => _expandedEx);
    t('C-REP-H3 l\'avance à l\'exercice suivant tient : « ⏭️ Ensuite : Développé Couché », puis « Passer » ouvre le développé couché',
      /Ensuite : Développé Couché/.test(lbl) && ouvert === 1, _det({ etiquette: lbl, ouvert }));
    await fermer(X);
  }

  /* ── I. LES CALORIES NE BOUGENT PAS — avenant du 22/10 après-midi, consigne de Michel ──────────────────
     « Ne modifier ni le moteur calorique ni les règles de plafonnement ; vérifier que les calories restent identiques à
     données de séance équivalentes ; vérifier l'absence de double comptage après fermeture et reprise. »
     Le moteur (`calcSessionCalories`, app.js) ne lit pas le chrono de repos : il lit la séance figée par « Terminer »
     (`set.at`, `sess.duration`), `S.defRest`, le poids, les records. Ces témoins le prouvent par le RÉSULTAT, pas par la
     lecture du code : la séance ENREGISTRÉE (durée, horodatages, calories et leur détail, chaque champ) est comparée à
     l'octet. Conduit : de vraies coches, « Passer », « Régler », de vrais rechargements, « Terminer ». Observé : la séance
     enregistrée en mémoire et sur le disque, le chrono de séance (`startTs`, `pausedTotal`, `at`), le brouillon. Ne couvre
     pas : Safari réel, une séance avec cardio, la pause (elle arrête le repos — F5). */
  const enreg = X => X.pg.evaluate(() => {
    const disque = JSON.parse(localStorage.getItem('ft4_sessions') || '[]');
    const proj = s => { if (!s) return null; const o = JSON.parse(JSON.stringify(s)); delete o.runId; return o; };   // runId : tiré au hasard
    const s = S.sessions[0] || null;
    return { n: S.sessions.length, nDisque: disque.length, brouillon: localStorage.getItem('ft4_wkt_draft'),
      seance: JSON.stringify(proj(s)), disque: JSON.stringify(proj(disque[0] || null)),
      src: s && s.calData ? s.calData.dureeSrc : null, kcal: s ? s.calories : null, duree: s ? s.duration : null,
      repos: !!(s && 'repos' in s), actif: !!(S.wkt && (S.wkt.exs || []).length) }; });
  const moteur = X => X.pg.evaluate(() => ({ st: S.wkt.startTs, pt: S.wkt.pausedTotal || 0, pa: S.wkt.pausedAt || null,
    ats: S.wkt.exs.map(e => e.sets.map(x => x.done ? (x.at === undefined ? 'sans' : x.at) : null)) }));
  const terminer = async X => { const ok = await clic(X, '.tbs-fin'); await confirmer(X); return ok; };
  {
    // ÉGALITÉ — mêmes séries, coche à 15:00:00, fin à 15:16:40 (pour un repos de 2:00, 14:40 après sa fin : il tourne
    // encore avec 15 min) ; seul l'état du repos à la fin change, par de vrais gestes. Trois sources de durée.
    const FIN = S_(1000);
    const SC = [
      { nom: 'horodatage', w: WKT({ exs: [{ name: SQ, sets: [Object.assign(serie(1), { at: 300 }), serie(0), serie(0)] }] }), src: 'horodatage' },
      { nom: 'chrono', w: WKT({ startTs: T0 - 60000 }), src: 'chrono' },      // un seul `at` : la durée vient du chrono
      { nom: 'estimée', w: WKT(), src: 'estimee' } ];                       // 26 min pour 2 séries : chrono douteux
    for (const sc of SC) {
      const R = {};
      for (const v of ['aucun', 'actif', 'expire_ouvert', 'restaure', 'expire_au_retour']) {
        const X = await ouvrir({ wkt: sc.w });
        await cocher(X, 0, 1);                                         // 15:00:00, le repos de 2:00 démarre
        let obs = false;
        if (v === 'aucun') { const p = await clic(X, '#rest-bar .rd-skip'); await heure(X, FIN); obs = p && !(await lire(X)).tourne; }
        if (v === 'actif') { await heure(X, FIN); const l = await lire(X); obs = l.tourne && l.temps === '+14:40'; }
        if (v === 'expire_ouvert' || v === 'expire_au_retour') {        // « Régler » 0:05 : fini à 15:00:05, expiré à 15:15:05
          await clic(X, '#rest-regler'); await X.pg.fill('#re-min', '0'); await X.pg.fill('#re-sec', '5'); await clic(X, '#ov-rest-edit .re-ok');
          if (v === 'expire_ouvert') { await heure(X, FIN); const l = await lire(X); obs = !l.tourne && l.lsRepos === '∅'; }
          else { const d = await recharger(X, FIN); obs = !d.tourne && (await lire(X)).lsRepos === '∅'; } }
        if (v === 'restaure') { const d = await recharger(X, S_(60)); await heure(X, FIN); obs = d.tourne && (await lire(X)).tourne; }
        const m = await moteur(X);
        const fin = await terminer(X);
        R[v] = { obs: obs && fin, m, e: await enreg(X) };
        await fermer(X);
      }
      const ref = R.aucun;
      const memes = Object.keys(R).filter(k => _det(R[k].m) === _det(ref.m) && R[k].e.seance === ref.e.seance && R[k].e.disque === ref.e.seance);
      t('C-REP-I1 [' + sc.nom + '] ⭐⭐ ⛔ calories, durée et horodatages de la séance enregistrée IDENTIQUES À L\'OCTET avec un repos passé / en cours / expiré app ouverte / restauré après fermeture / expiré au retour',
        Object.keys(R).every(k => R[k].obs) && memes.length === 5 && ref.e.src === sc.src && ref.e.kcal > 0 && ref.e.n === 1,
        _det({ obs: Object.keys(R).filter(k => !R[k].obs), differents: Object.keys(R).filter(k => memes.indexOf(k) < 0), src: ref.e.src, kcal: ref.e.kcal,
          duree: ref.e.duree, kcalVariantes: Object.keys(R).map(k => k + ':' + R[k].e.kcal + '/' + R[k].e.duree) }));
      t('C-REP-I2 [' + sc.nom + '] une seule séance enregistrée par variante (mémoire = disque = 1), jamais de champ `repos`, plus de séance active',
        Object.keys(R).every(k => R[k].e.n === 1 && R[k].e.nDisque === 1 && !R[k].e.repos && !R[k].e.actif),
        _det(Object.keys(R).map(k => k + ':' + R[k].e.n + '/' + R[k].e.nDisque + (R[k].e.repos ? ' AVEC repos' : '') + (R[k].e.actif ? ' ACTIVE' : ''))));
    }
  }
  {
    // PAS DE DOUBLE COMPTAGE — la même séance jouée deux fois : une fois sans jamais fermer l'app, une fois en la fermant
    // pendant le repos (absence de 60 s : le repos revient ; de 1500 s : il a expiré entre-temps).
    const W = WKT({ exs: [{ name: SQ, sets: [Object.assign(serie(1), { at: 300 }), serie(0), serie(0)] }] });
    for (const absence of [60, 1500]) {
      const jouer = async ferme => {
        const X = await ouvrir({ wkt: W });
        await cocher(X, 0, 1);                                         // 15:00:00, at = 600, repos lancé
        const avant = await moteur(X);
        let d = null;
        if (ferme) d = await recharger(X, S_(absence)); else await heure(X, S_(absence));
        const apres = await moteur(X);
        await heure(X, S_(absence + 100)); await cocher(X, 0, 2);       // la série suivante, 100 s après le retour
        await heure(X, S_(absence + 160));
        const fin = await terminer(X);
        const e = await enreg(X);
        const r2 = await recharger(X, S_(absence + 400));                 // rouvrir après la fin : rien ne doit renaître
        const e2 = await enreg(X);
        await fermer(X);
        return { d, avant, apres, fin, e, e2, r2 };
      };
      const A = await jouer(false), B = await jouer(true);
      t('C-REP-J1 [' + absence + ' s] ⭐⭐ ⛔ fermer puis rouvrir pendant un repos : la séance enregistrée (calories, durée, horodatages) est IDENTIQUE à la même séance jamais fermée — le temps fermé n\'est compté qu\'une fois, comme du temps réel',
        A.fin && B.fin && A.e.seance === B.e.seance && A.e.kcal > 0 && _det(B.avant) === _det(B.apres) && (absence === 60 ? B.d.tourne : !B.d.tourne),
        _det({ kcal: [A.e.kcal, B.e.kcal], duree: [A.e.duree, B.e.duree], chronoAvant: B.avant, chronoApres: B.apres, reprise: B.d && B.d.tourne }));
      t('C-REP-J2 [' + absence + ' s] une seule séance, en mémoire et sur le disque, brouillon supprimé ; un rechargement après la fin ne fait rien renaître (ni séance, ni repos)',
        [A, B].every(r => r.e.n === 1 && r.e.nDisque === 1 && r.e.brouillon === null && r.e2.n === 1 && r.e2.nDisque === 1 && !r.e2.actif && !r.r2.tourne && r.e2.seance === r.e.seance),
        _det([A, B].map(r => ({ n: r.e.n, disque: r.e.nDisque, brouillon: r.e.brouillon, n2: r.e2.n, actif2: r.e2.actif, tourne2: r.r2.tourne }))));
    }
  }
}

/* Témoins de SOURCE : un seul propriétaire pour chaque règle (R2), et la garantie d'app.js remplacée, pas contournée. */
function source(t, ROOT, fs, path) {
  const lit = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const log = lit('log.js'), app = lit('app.js'), st = lit('state.js');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\n}', i); return j < 0 ? '' : src.slice(i, j + 2); };
  t('C-REP-S1 une seule règle d\'expiration : `REST_DEPASSEMENT_MAX` vaut 900 s (15 min après la fin théorique, app ouverte ou fermée — décision de Michel du 22/10 après-midi)',
    /\nconst REST_DEPASSEMENT_MAX = 900;/.test(log) && (log.match(/REST_DEPASSEMENT_MAX/g) || []).length >= 4);
  // les commentaires citent la structure (`S.wkt.repos = {debut, total}`) : on compte le CODE seulement
  const ecr = (log.replace(/\/\*[\s\S]*?\*\//g, '').match(/S\.wkt\.repos\s*=(?!=)/g) || []).length;
  t('C-REP-S2 un seul écrivain : `S.wkt.repos` n\'est posé qu\'à UN endroit (`_reposMemoriser`), qui l\'efface aussi',
    ecr === 1 && /S\.wkt\.repos\s*=\s*\{\s*debut\s*:\s*restStartTs\s*,\s*total\s*:\s*restTot\s*\}/.test(corps(log, '_reposMemoriser')) && /delete S\.wkt\.repos/.test(corps(log, '_reposMemoriser')),
    'écritures : ' + ecr);
  t('C-REP-S3 ⛔ la garantie d\'app.js est REMPLACÉE : le démarrage passe par `_reposReprendre()`, et la coupure à −5 s au retour au premier plan a disparu',
    /\n_reposReprendre\(\);/.test(app) && !/_restLeft\(\)\s*<=\s*-5/.test(app) && !/\nstopRest\(\);\n/.test(app));
  t('C-REP-S4 ⛔ le brouillon de secours s\'écrit SANS le repos (décision 3 de Michel) — une ligne de `persist()`',
    /setItem\('ft4_wkt_draft',JSON\.stringify\(Object\.assign\(\{\},S\.wkt,\{repos:undefined\}\)\)\)/.test(st));
  // règle d'or #11 : l'aide « ? » de Séance, l'aide détaillée, la diapo du Guide, le point rouge d'origine et le nouveau
  const aides = { '? Séance': lit('screens.js'), 'aide détaillée': lit('coach.js'), 'points rouges': lit('constants.js'), 'Guide': lit('app.js') };
  // ⚠️ « 15 min après la fin » CONTIENT « 5 min après la fin » : sans la borne (pas de chiffre devant), l'ancien texte et le
  //    nouveau se confondraient, et ce témoin resterait vert sur une aide qui dit encore 5 min.
  const faux = Object.keys(aides).filter(k => /au-delà de 15 min il s|Au-delà de 15 min il s|Au-delà de 15 minutes le chrono|(^|[^0-9])5 min(utes)? après la fin/.test(aides[k]));
  const dit = Object.keys(aides).filter(k => /(^|[^0-9])15 min(utes)? après la fin/.test(aides[k]));
  t('C-REP-S5 règle d\'or #11 : les aides (« ? » Séance, aide détaillée, Guide, points rouges) disent « 15 min après la fin » — plus aucune ne dit « 5 min » ni l\'ancien « au-delà de 15 min »',
    !faux.length && dit.length === 4 && /id:'repos-persistant'/.test(aides['points rouges']), _det({ faux, dit }));
}

module.exports = { ecran, source };
