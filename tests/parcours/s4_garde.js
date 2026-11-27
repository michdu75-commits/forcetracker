/* ═════════════════════════════════════════════════════════════════
   🛡️ S4-GARDE (Claude N°2 Séance, 27/11/2026, lot `ft-v1269`) — LE DOUBLE APPUI NE VALIDE PAS L'EXERCICE QUE LE PASSAGE VIENT D'OUVRIR (blocs B-S4GARDE-*).
   GO de Michel (27/11) : « P1 retenue — 300 ms, constante nommée, protection ciblée silencieuse, armement aux passages ordinaires, aux changements de
   partenaire de superset, aux tours suivants et aux sorties, limitée à la VALIDATION de l'exercice nouvellement ouvert ; préserver la dévalidation, les
   validations volontaires et la navigation ; aucun verrou global ; aucune donnée persistée ; préserver le RIR précédent, le chrono, les charges et les
   compteurs ; référence temporelle monotone, armée au moment effectif du changement d'exercice. »
   ✅ Qualifié en ciblé le 27/11/2026 (commit 3899e4f0) : `node tools/banc_s4_garde.js` → 29 OK / 0 rouge ; `python3 tools/mut_s4_garde.py` → 25/25 conformes (chaque mutation rougit
   son témoin). Branché dans `tests/parcours/runner.js` le même jour. Un témoin qui ne rougit pas n'a pas sa place ici (R35).
   Ce que les témoins CONDUISENT : la vraie page dans Chromium, réseau coupé, avec de VRAIS événements `click` / `keydown` envoyés aux vrais boutons ✓ et champs kg
   (donc `window.event` est défini, comme sur un vrai appui), un horodatage de GESTE imposé (`event.timeStamp`) et une horloge `performance.now()` pilotée.
   Ce qu'ils OBSERVENT : `S.wkt` (séries validées), `_expandedEx`, `restStartTs`, `_rirCible`, `#rest-suite`, `ft4_wkt` sur le disque, le nombre d'appels à `persist()`.
   Ce qu'ils NE COUVRENT PAS : le vrai doigt, le vrai délai d'un iPhone, le redessin pixel (recette iPhone ciblée), le second appui « avant le redessin » (il vise
   l'ancienne case : décision produit séparée).
   Chaque cas « refusé » a son jumeau « accepté » dans la même famille : sans lui, un appui qui n'agirait jamais ferait passer tous les refus pour acquis.
   ⛔ Les attendus ne se « corrigent » jamais pour faire passer un lot : un rouge ici est une régression à comprendre.
   ═════════════════════════════════════════════════════════════════ */
'use strict';

const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1', ft4_guide_shown: '1', ft4_wn_seen: '99', ft4_lms: moisPrec };
const _det = o => JSON.stringify(o);

async function page(b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
  await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_s4garde'))return; sessionStorage.setItem('_s4garde','1'); localStorage.clear();
    const D=${JSON.stringify(BASE)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 140)));
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
  await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); goScreen('log', document.getElementById('nb-log')); });
  return { cx, pg, errs };
}

/* La fabrique de scénarios et l'horloge pilotée, injectées dans la page. `__g.h` = ce que répond `performance.now()` (= l'instant où le code s'exécute) ;
   `ts` = l'instant du GESTE (`event.timeStamp`). Un appui « normal » a ts = h ; un gestionnaire lent a ts < h. */
const OUTILS = `(() => {
  window.__g = {
    h: 1000,
    sets: (n, kg, extra) => Array.from({ length: n }, (_, i) => Object.assign({ kg: Array.isArray(kg) ? kg[i] : kg, reps: 8, type: 'N', done: false }, extra || {})),
    mk: (exs, ouvert, tout) => { S.expandAll = !!tout; S.wkt = { date: new Date().toISOString().slice(0, 10), startHour: 10, exs }; _expandedEx = ouvert || 0; _garde = null; stopRest(); __g.h = 1000; renderExBlocks(); },
    tap: (ei, si, ts, h) => { __g.h = h; const b = document.querySelector('#sr-' + ei + '-' + si + ' .chk'); if (!b) return { absent: true };
      const ev = new MouseEvent('click', { bubbles: true, cancelable: true }); Object.defineProperty(ev, 'timeStamp', { value: ts }); b.dispatchEvent(ev); return { absent: false }; },
    entree: (ei, si, ts, h) => { __g.h = h; const inp = document.querySelectorAll('#sr-' + ei + '-' + si + ' .sinp')[1]; if (!inp) return { absent: true };
      const ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }); Object.defineProperty(ev, 'timeStamp', { value: ts }); inp.dispatchEvent(ev); return { absent: false }; },
    snap: () => ({ ouvert: _expandedEx, debut: restStartTs, total: restTot, rir: JSON.stringify(_rirCible), faits: S.wkt.exs.map(e => e.sets.filter(s => s.done).length),
      suite: (document.getElementById('rest-suite') || {}).innerText || '', garde: !!_garde }),
    // le scénario « ordinaire » du constat : développé couché (3 séries, 2 déjà validées SANS geste), squat, rowing ; la dernière série du DC est validée PAR UN APPUI (instant 5000)
    ordinaire: (opts) => { opts = opts || {};
      __g.mk([{ name: 'Développé Couché', sets: __g.sets(3, 80) }, { name: 'Squat', sets: __g.sets(3, 100) }, { name: 'Rowing Barre', sets: __g.sets(3, 60) }], 0, !!opts.tout);
      toggleSet(0, 0); toggleSet(0, 1); stopRest();                                      // appels SANS geste : jamais refusés, jamais armés
      if (opts.squatFait !== undefined) S.wkt.exs[1].sets[opts.squatFait].done = true;
      const avant = __g.snap(); __g.tap(0, 2, 5000, 5000); return { avant, passage: __g.snap() }; },
    // 2ᵉ appui sur la dernière case du squat : geste à 5000+dg, exécuté à 5000+dh
    second: (dg, dh) => { const x = __g.tap(1, 2, 5000 + dg, 5000 + dh); return { x, s: __g.snap() }; }
  };
  performance.now = () => __g.h;
})();`;

async function ecran(t, b, PORT) {
  const X = await page(b, PORT);
  await X.pg.evaluate(OUTILS);
  const run = fn => X.pg.evaluate(fn);

  // G-0 : la constante est nommée, vaut 300 ms ; le gabarit du bouton n'a PAS changé (des bancs existants le cherchent par son attribut).
  { const r = await run(`(() => { __g.ordinaire(); renderExBlocks(); const bt = document.querySelector('#sr-1-0 .chk');
      return { c: typeof GARDE_PASSAGE_MS !== 'undefined' ? GARDE_PASSAGE_MS : null, a: bt ? bt.getAttribute('onclick') : null }; })()`);
    t('B-S4GARDE-G0 la durée est une constante nommée `GARDE_PASSAGE_MS` (300 ms) et le bouton ✓ garde son attribut `onclick="toggleSet(ei,si)"` (aucun gabarit modifié)', r.c === 300 && r.a === 'toggleSet(1,0)', _det(r)); }

  // G-1 : LE CAS DU CONSTAT — dernière série du DC validée à 5000, second appui à +167 ms sur la 3ᵉ case du squat.
  { const r = await run(`(() => { const o = __g.ordinaire(); const nb = { n: 0 }; const p0 = window.persist; window.persist = function () { nb.n++; return p0.apply(this, arguments); };
      const a = __g.second(167, 167); window.persist = p0; return { o, a, nbPersist: nb.n, disque: localStorage.getItem('ft4_wkt') }; })()`);
    const { o, a } = r;
    t('B-S4GARDE-G1 le 2ᵉ appui à +167 ms sur le squat est IGNORÉ : aucune série du squat validée, le DC reste à 3/3, le squat reste ouvert', !a.x.absent && a.s.faits[1] === 0 && a.s.faits[0] === 3 && a.s.ouvert === 1, _det(a));
    t('B-S4GARDE-G1b le chrono est celui du passage (même départ, même durée), la question du RIR vise TOUJOURS la dernière série du DC, le dock « Repos · Développé Couché » est conservé',
      a.s.debut === o.passage.debut && a.s.total === o.passage.total && a.s.rir === o.passage.rir && /"ei":0/.test(a.s.rir) && /"si":2/.test(a.s.rir) && /Repos · Développé Couché/.test(a.s.suite), _det({ o: o.passage, a: a.s }));
    t('B-S4GARDE-G1c un appui ignoré n\'écrit RIEN : aucun appel à `persist()`', r.nbPersist === 0, 'nbPersist=' + r.nbPersist);
    // jumeau : SANS la protection (garde effacée), le même appui valide bien la série du squat — l'appui agit, le refus n'est donc pas un faux acquis
    const j = await run(`(() => { __g.ordinaire(); _garde = null; return __g.second(167, 167); })()`);
    t('B-S4GARDE-G1d [contrôle du harnais] sans la protection, le même 2ᵉ appui valide la série du squat (le défaut du constat est visible) : le témoin sait voir la panne', !j.x.absent && j.s.faits[1] === 1 && !/Repos · Développé Couché/.test(j.s.suite), _det(j)); }

  // G-2 : LIMITES TEMPORELLES autour de 300 ms (geste et exécution au même instant)
  { const rep = {};
    for (const dt of [-10, 0, 1, 167, 299, 300, 301, 400, 600]) {
      rep[dt] = await run(`(() => { __g.ordinaire(); const a = __g.second(${dt === -10 ? -10 : dt}, ${dt === -10 ? 10 : dt}); return a.s.faits[1]; })()`);
    }
    t('B-S4GARDE-G2 limites : refusé à −10 (geste parti pendant le gestionnaire), 0, 1, 167 et 299 ms ; ACCEPTÉ à 300, 301, 400 et 600 ms',
      [-10, 0, 1, 167, 299].every(d => rep[d] === 0) && [300, 301, 400, 600].every(d => rep[d] === 1), _det(rep)); }

  // G-2b : AUCUNE BORNE BASSE — un geste né AVANT l'armement (horodatage matériel, gestionnaire en retard) est refusé quel que soit son retard plausible.
  { const rep = {};
    for (const dg of [-2000, -4900]) rep[dg] = await run(`(() => { __g.ordinaire(); return __g.second(${dg}, 0).s.faits[1]; })()`);
    t('B-S4GARDE-G2b aucune borne basse : un geste né 2000 ms, ou 4900 ms, AVANT l\'armement est refusé (ancienne borne arbitraire de −1000 ms supprimée)', rep[-2000] === 0 && rep[-4900] === 0, _det(rep)); }

  // G-3 : RÉFÉRENCE MONOTONE ET INSTANT DU GESTE — un gestionnaire lent ne doit pas faire sortir le 2ᵉ appui de la fenêtre.
  { const lent = await run(`(() => { __g.ordinaire(); return __g.second(167, 400).s.faits[1]; })()`);              // geste à +167, exécuté à +400
    const lentOk = await run(`(() => { __g.ordinaire(); return __g.second(400, 400).s.faits[1]; })()`);            // geste à +400 : volontaire
    const epoque = await run(`(() => { __g.ordinaire(); const a = __g.tap(1, 2, 1.7e12, 5100); return __g.snap().faits[1]; })()`);   // horodatage d'époque (anciens Safari) : repli sur l'horloge, dt = 100
    const epoqueOk = await run(`(() => { __g.ordinaire(); const a = __g.tap(1, 2, 1.7e12, 5400); return __g.snap().faits[1]; })()`);
    t('B-S4GARDE-G3 horloge monotone : geste à +167 mais exécuté à +400 → refusé (c\'est l\'instant du GESTE qui compte) ; geste à +400 → accepté', lent === 0 && lentOk === 1, _det({ lent, lentOk }));
    t('B-S4GARDE-G3b horodatage de geste inutilisable (époque) : repli sur `performance.now()` — refusé à +100, accepté à +400', epoque === 0 && epoqueOk === 1, _det({ epoque, epoqueOk })); }

  // G-3c : PLAUSIBILITÉ de l'horodatage du geste (`GARDE_AGE_MAX_MS` = 5000) — dedans on s'en sert, au-delà on retombe sur l'horloge d'exécution.
  { const age = {};
    for (const a of [4999, 5000, 5500]) age[a] = await run(`(() => { __g.ordinaire(); return __g.second(0, ${a}).s.faits[1]; })()`);   // geste à l'instant 5000, exécuté a ms plus tard
    t('B-S4GARDE-G3c plausibilité : horodatage vieux de 4999 ms → utilisé (écart 0 : refusé) ; vieux de 5000 ms ou 5500 ms → repli sur l\'heure d\'exécution (écart ≥ 5000 : accepté)',
      age[4999] === 0 && age[5000] === 1 && age[5500] === 1, _det(age)); }
  { const sans = await run(`(() => { __g.ordinaire(); __g.tap(1, 2, NaN, 5100); return __g.snap().faits[1]; })()`);
    const sansOk = await run(`(() => { __g.ordinaire(); __g.tap(1, 2, NaN, 5400); return __g.snap().faits[1]; })()`);
    const zero = await run(`(() => { __g.ordinaire(); __g.tap(1, 2, 0, 5100); return __g.snap().faits[1]; })()`);
    t('B-S4GARDE-G3d horodatage absent (NaN) ou nul : repli sur l\'heure d\'exécution — refusé à +100 ms, accepté à +400 ms', sans === 0 && sansOk === 1 && zero === 0, _det({ sans, sansOk, zero })); }

  // G-4 : un appel SANS geste n'est jamais refusé (code interne, bancs existants).
  { const r = await run(`(() => { __g.ordinaire(); toggleSet(1, 2); return __g.snap().faits[1]; })()`);
    t('B-S4GARDE-G4 un appel programmatique de `toggleSet` (aucun événement) n\'est JAMAIS refusé, même à 0 ms du passage', r === 1, 'faits squat=' + r); }

  // G-5 : la DÉVALIDATION n'est jamais touchée.
  { const r = await run(`(() => { __g.ordinaire({ squatFait: 0 }); const a = __g.tap(1, 0, 5167, 5167); return { a, f: __g.snap().faits }; })()`);
    t('B-S4GARDE-G5 dévalider une série déjà validée de l\'exercice nouvellement ouvert reste possible dans la fenêtre (squat 1 → 0)', !r.a.absent && r.f[1] === 0, _det(r)); }

  // G-6 : un AUTRE exercice (tout déroulé) n'est pas gêné ; G-7 : les séries d'un même exercice sans passage non plus.
  { const r = await run(`(() => { __g.ordinaire({ tout: true }); const a = __g.tap(2, 0, 5167, 5167); return { a, f: __g.snap().faits }; })()`);
    t('B-S4GARDE-G6 en mode « tout dérouler », la validation d\'un AUTRE exercice (rowing) à +167 ms du passage n\'est pas refusée', !r.a.absent && r.f[2] === 1, _det(r)); }
  { const r = await run(`(() => { __g.mk([{ name: 'Développé Couché', sets: __g.sets(4, 80) }, { name: 'Squat', sets: __g.sets(3, 100) }], 0);
      const a = __g.tap(0, 0, 5000, 5000), b2 = __g.tap(0, 1, 5100, 5100), c = __g.tap(0, 2, 5200, 5200); return { f: __g.snap().faits }; })()`);
    t('B-S4GARDE-G7 trois validations d\'un même exercice à 100 ms d\'intervalle (aucun passage, rien d\'armé) sont toutes acceptées', r.f[0] === 3, _det(r)); }

  // G-8..G-10 : SUPERSET — avance vers le partenaire, tour suivant, sortie.
  { const ss = (n1, n2) => `[{ name: 'Curl Biceps', group: 'g1', groupType: 'super', sets: __g.sets(${n1}, 20) }, { name: 'Extension Triceps', group: 'g1', groupType: 'super', sets: __g.sets(${n2}, 25) }, { name: 'Squat', sets: __g.sets(2, 100) }]`;
    const av = await run(`(() => { __g.mk(${ss(3, 3)}, 0); __g.tap(0, 0, 5000, 5000); const e = __g.tap(1, 0, 5167, 5167); return { e, f: __g.snap().faits, o: __g.snap().ouvert }; })()`);
    const avOk = await run(`(() => { __g.mk(${ss(3, 3)}, 0); __g.tap(0, 0, 5000, 5000); const e = __g.tap(1, 0, 5300, 5300); return { e, f: __g.snap().faits }; })()`);
    t('B-S4GARDE-G8 superset, avance A → B : un appui sur la case de B à +167 ms est ignoré ; à +300 ms il est accepté', !av.e.absent && av.f[1] === 0 && av.o === 1 && !avOk.e.absent && avOk.f[1] === 1, _det({ av, avOk }));
    const tour = await run(`(() => { __g.mk(${ss(3, 3)}, 0); __g.tap(0, 0, 5000, 5000); __g.tap(1, 0, 6000, 6000); const e = __g.tap(0, 1, 6167, 6167); return { e, f: __g.snap().faits, o: __g.snap().ouvert }; })()`);
    const tourOk = await run(`(() => { __g.mk(${ss(3, 3)}, 0); __g.tap(0, 0, 5000, 5000); __g.tap(1, 0, 6000, 6000); const e = __g.tap(0, 1, 6300, 6300); return { e, f: __g.snap().faits }; })()`);
    t('B-S4GARDE-G9 superset, tour suivant (B → A) : la case de A à +167 ms est ignorée ; à +300 ms elle est acceptée', !tour.e.absent && tour.f[0] === 1 && tour.o === 0 && !tourOk.e.absent && tourOk.f[0] === 2, _det({ tour, tourOk }));
    const sortie = await run(`(() => { __g.mk(${ss(2, 2)}, 0); __g.tap(0, 0, 5000, 5000); __g.tap(1, 0, 6000, 6000); __g.tap(0, 1, 7000, 7000); __g.tap(1, 1, 8000, 8000);
      const e = __g.tap(2, 0, 8167, 8167); return { e, f: __g.snap().faits, o: __g.snap().ouvert }; })()`);
    const sortieOk = await run(`(() => { __g.mk(${ss(2, 2)}, 0); __g.tap(0, 0, 5000, 5000); __g.tap(1, 0, 6000, 6000); __g.tap(0, 1, 7000, 7000); __g.tap(1, 1, 8000, 8000);
      const e = __g.tap(2, 0, 8300, 8300); return { e, f: __g.snap().faits }; })()`);
    t('B-S4GARDE-G10 sortie d\'un superset 2+2 vers l\'exercice suivant : un appui sur sa case à +167 ms est ignoré ; à +300 ms il est accepté', !sortie.e.absent && sortie.f[2] === 0 && sortie.o === 2 && !sortieOk.e.absent && sortieOk.f[2] === 1, _det({ sortie, sortieOk })); }

  // G-11 : DROPSET ↓ de l'outil — aucun passage, donc aucune protection : les paliers se valident à la suite.
  { const r = await run(`(() => { __g.mk([{ name: 'Développé Couché', sets: __g.sets(3, [80, 64, 52]), dropset: { paliers: 3, pct: 20, direction: 'down' } }, { name: 'Squat', sets: __g.sets(2, 100) }], 0);
      __g.tap(0, 0, 5000, 5000); __g.tap(0, 1, 5150, 5150); __g.tap(0, 2, 5300, 5300); return { f: __g.snap().faits, g: __g.snap().garde }; })()`);
    t('B-S4GARDE-G11 dropset descendant de l\'outil : trois paliers validés à 150 ms d\'intervalle, tous acceptés, rien n\'est armé', r.f[0] === 3 && r.g === false, _det(r)); }

  // G-12/13 : anciens GROUPES drop (avance immédiate) et pyramide (avance différée) — même armement, vérifié.
  { const drop = await run(`(() => { __g.mk([{ name: 'Curl A', group: 'd1', groupType: 'drop', sets: __g.sets(1, 30) }, { name: 'Curl B', group: 'd1', groupType: 'drop', sets: __g.sets(1, 24) }], 0);
      __g.tap(0, 0, 5000, 5000); const e = __g.tap(1, 0, 5167, 5167); return { e, f: __g.snap().faits, o: __g.snap().ouvert }; })()`);
    const dropOk = await run(`(() => { __g.mk([{ name: 'Curl A', group: 'd1', groupType: 'drop', sets: __g.sets(1, 30) }, { name: 'Curl B', group: 'd1', groupType: 'drop', sets: __g.sets(1, 24) }], 0);
      __g.tap(0, 0, 5000, 5000); const e = __g.tap(1, 0, 5400, 5400); return { e, f: __g.snap().faits }; })()`);
    t('B-S4GARDE-G12 ancien groupe « drop » (avance immédiate au palier suivant) : la case du partenaire à +167 ms est ignorée ; à +400 ms acceptée', !drop.e.absent && drop.f[1] === 0 && drop.o === 1 && !dropOk.e.absent && dropOk.f[1] === 1, _det({ drop, dropOk }));
    const pyr = await run(`(() => { __g.mk([{ name: 'Presse A', group: 'p1', groupType: 'pyramid-up', sets: __g.sets(1, 60) }, { name: 'Presse B', group: 'p1', groupType: 'pyramid-up', sets: __g.sets(1, 66) }], 0);
      __g.tap(0, 0, 5000, 5000); const cb = _restDoneCb; __g.h = 9000; if (cb) cb(); const e = __g.tap(1, 0, 9167, 9167); return { cb: !!cb, e, f: __g.snap().faits, o: __g.snap().ouvert }; })()`);
    const pyrOk = await run(`(() => { __g.mk([{ name: 'Presse A', group: 'p1', groupType: 'pyramid-up', sets: __g.sets(1, 60) }, { name: 'Presse B', group: 'p1', groupType: 'pyramid-up', sets: __g.sets(1, 66) }], 0);
      __g.tap(0, 0, 5000, 5000); const cb = _restDoneCb; __g.h = 9000; if (cb) cb(); const e = __g.tap(1, 0, 9400, 9400); return { e, f: __g.snap().faits }; })()`);
    t('B-S4GARDE-G13 ancienne pyramide (avance différée, exécutée à la fin du repos ou à « Passer ») : armée au moment effectif du changement — la case du partenaire à +167 ms est ignorée ; à +400 ms acceptée',
      pyr.cb && !pyr.e.absent && pyr.f[1] === 0 && pyr.o === 1 && !pyrOk.e.absent && pyrOk.f[1] === 1, _det({ pyr, pyrOk })); }

  // G-14 : OUVRIR UNE CARTE À LA MAIN désarme (la navigation reste libre).
  { const r = await run(`(() => { __g.ordinaire(); toggleExBlock(1); const a = __g.second(100, 100); return a.s.faits[1]; })()`);
    t('B-S4GARDE-G14 ouvrir une carte à la main désarme la protection : la validation qui suit, même à 100 ms, est acceptée', r === 1, 'faits squat=' + r); }

  // G-15 : AUCUNE DONNÉE PERSISTÉE — rien dans `S.wkt`, rien sur le disque, mêmes clés de stockage.
  { const r = await run(`(() => { __g.ordinaire(); const clesAvant = Object.keys(localStorage).sort().join('|'); const disqueAvant = localStorage.getItem('ft4_wkt');
      const w = JSON.stringify(S.wkt); const tout = Object.keys(localStorage).map(k => localStorage.getItem(k)).join('\\n');
      __g.second(167, 167); return { cles: clesAvant === Object.keys(localStorage).sort().join('|'), disque: disqueAvant === localStorage.getItem('ft4_wkt'),
        sansTrace: !/garde/i.test(w) && !/_garde|GARDE_PASSAGE/.test(tout) }; })()`);
    t('B-S4GARDE-G15 aucune donnée persistée : mêmes clés de stockage, `ft4_wkt` identique octet pour octet après un appui ignoré, aucune trace de la protection dans la séance ni sur le disque', r.cles && r.disque && r.sansTrace, _det(r)); }

  // G-16 : le RIR répondu après un appui ignoré s'écrit sur la bonne série (la dernière du DC), pas sur le squat.
  { const r = await run(`(() => { __g.ordinaire(); __g.second(167, 167); setRir(0, 2, 2); return { dc: S.wkt.exs[0].sets[2].rir, squat: S.wkt.exs[1].sets.map(s => s.rir === undefined ? null : s.rir) }; })()`);
    t('B-S4GARDE-G16 le RIR 2 répondu après l\'appui ignoré s\'écrit sur la dernière série du développé couché ; aucune série du squat n\'en reçoit', r.dc === 2 && r.squat.every(v => v === null), _det(r)); }

  // G-17 : la touche Entrée (champ kg, `confirmSetAndNext`) est protégée de la même façon.
  { const r = await run(`(() => { __g.ordinaire(); const e = __g.entree(1, 2, 5167, 5167); return { e, f: __g.snap().faits }; })()`);
    const ok = await run(`(() => { __g.ordinaire(); const e = __g.entree(1, 2, 5400, 5400); return { e, f: __g.snap().faits }; })()`);
    t('B-S4GARDE-G17 Entrée dans le champ kg du squat : ignorée à +167 ms, acceptée à +400 ms (même protection que le toucher)', !r.e.absent && r.f[1] === 0 && !ok.e.absent && ok.f[1] === 1, _det({ r, ok })); }

  // G-19 : EN ARRIÈRE-PLAN la protection est levée (l'horloge d'un appareil endormi n'est pas fiable) — `visibilitychange` masqué, `pagehide` ; « visible » ne lève rien.
  { const r = await run(`(() => { const etat = v => Object.defineProperty(document, 'visibilityState', { get: () => v, configurable: true });
      __g.ordinaire(); etat('visible'); document.dispatchEvent(new Event('visibilitychange')); const encore = __g.snap().garde;
      etat('hidden'); document.dispatchEvent(new Event('visibilitychange')); const apres = __g.snap().garde; const a = __g.second(100, 100);
      delete document.visibilityState; return { encore, apres, f: a.s.faits[1] }; })()`);
    t('B-S4GARDE-G19 `visibilitychange` : « visible » ne lève pas la protection ; « hidden » la lève (un appui à +100 ms est alors accepté)', r.encore === true && r.apres === false && r.f === 1, _det(r)); }
  { const r = await run(`(() => { __g.ordinaire(); window.dispatchEvent(new Event('pagehide')); const apres = __g.snap().garde; const a = __g.second(100, 100); return { apres, f: a.s.faits[1] }; })()`);
    t('B-S4GARDE-G19b `pagehide` lève la protection (un appui à +100 ms est alors accepté)', r.apres === false && r.f === 1, _det(r)); }

  // G-20 : IDENTIFICATION DU GESTE — seul un clic, ou Entrée, dont la cible est dans la ligne de la série visée peut être refusé ; tout le reste passe (jamais de blocage sur doute).
  { const r = await run(`(() => {
      const ev = (Ctor, type, extra, ts) => { const e = new Ctor(type, Object.assign({ bubbles: true, cancelable: true }, extra || {})); Object.defineProperty(e, 'timeStamp', { value: ts }); return e; };
      const essai = (choix) => { __g.ordinaire(); __g.h = 5100; choix(); return __g.snap().faits[1]; };
      // (a) un appel programmatique pendant un événement d'un AUTRE TYPE (focusout, même dans la ligne visée) n'est jamais refusé
      const a = essai(() => { const c = document.querySelector('#sr-1-2 .sinp'); c.addEventListener('focusout', () => toggleSet(1, 2), { once: true }); c.dispatchEvent(ev(FocusEvent, 'focusout', {}, 5100)); });
      // (b) un clic dont la cible est dans une AUTRE ligne (série 1 du squat) n'est pas un geste sur la série 3 : jamais refusé
      const b = essai(() => { const c = document.querySelector('#sr-1-0 .snum'); c.addEventListener('click', () => toggleSet(1, 2), { once: true }); c.dispatchEvent(ev(MouseEvent, 'click', {}, 5100)); });
      // (c) une touche autre qu'Entrée n'est pas un geste de validation : jamais refusée
      const c2 = essai(() => { const k = document.querySelectorAll('#sr-1-2 .sinp')[1]; k.addEventListener('keydown', () => toggleSet(1, 2), { once: true }); k.dispatchEvent(ev(KeyboardEvent, 'keydown', { key: 'a' }, 5100)); });
      // (d) CONTRÔLE : un clic dont la cible est dans LA ligne visée (ici son numéro, pas le bouton) EST un geste : refusé
      const d = essai(() => { const c = document.querySelector('#sr-1-2 .snum'); c.addEventListener('click', () => toggleSet(1, 2), { once: true }); c.dispatchEvent(ev(MouseEvent, 'click', {}, 5100)); });
      return { a, b, c2, d }; })()`);
    t('B-S4GARDE-G20 identification : événement d\'un autre type (focusout), clic dans une autre ligne, touche autre qu\'Entrée → jamais refusés ; clic dont la cible est dans la ligne visée → refusé',
      r.a === 1 && r.b === 1 && r.c2 === 1 && r.d === 0, _det(r)); }

  t('B-S4GARDE-G18 aucune erreur de page pendant les scénarios', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  await X.cx.close();
}

async function tout(t, b, PORT) {
  try { await ecran(t, b, PORT); }
  catch (e) { t('B-S4GARDE-EXCEPTION le module s\'est arrêté : ' + String(e && e.message || e).slice(0, 160), false, ''); }
}

module.exports = { ecran, tout };
