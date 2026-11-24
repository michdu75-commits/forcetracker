/* ═════════════════════════════════════════════════════════════════
   🧭 S2-NAV (session-C / Claude N°2 Séance, 24/11/2026, lot `ft-v1269`) — LE PASSAGE AUTOMATIQUE ENTRE EXERCICES (blocs B-S2NAV-*).
   Décision de Michel (24/11) : « dropsets et pyramides : pas de nouvelle fonctionnalité dans ce lot, mais vérifier IMPÉRATIVEMENT qu'ils ne
   régressent pas avec la fonction de navigation commune. » Ce module a DEUX parties :
     · NR-*  — NON-RÉGRESSION, écrite AVANT de toucher au code : ce que `toggleSet` fait AUJOURD'HUI (master `dde3e9a2`, ft-v1268) d'un dropset
               descendant (outil ou importé), d'une pyramide, d'un groupe `drop` / `pyramid-up` / `pyramid-down`, du tour d'un superset et des durées
               de repos. Les valeurs attendues ont été RELEVÉES sur le code d'avant (sonde `explo_golden`), pas déduites du code d'après.
     · S2-*  — la nouvelle navigation (ajoutée avec le code, voir plus bas).
   Ce que les témoins CONDUISENT : la vraie fonction `toggleSet(ei, si)` de la page, dans Chromium, réseau coupé.
   Ce qu'ils OBSERVENT : `_expandedEx` (l'exercice ouvert), `restStartTs` / `restTot` (le chrono), `#rest-label`, `_restDoneCb` (l'avance armée).
   Ce qu'ils NE COUVRENT PAS : l'affichage pixel (recette iPhone), le vrai temps réel d'un repos (le callback est exécuté à la main, comme à la fin du repos).
   ⛔ Les attendus de NR-* ne se « corrigent » jamais pour faire passer un lot : un rouge ici est une régression à comprendre.
   ═════════════════════════════════════════════════════════════════ */
'use strict';

const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1', ft4_guide_shown: '1', ft4_wn_seen: '99', ft4_lms: moisPrec };
const _det = o => JSON.stringify(o);

/* Une page neuve, l'app réellement chargée, aucune séance. Les scénarios construisent leur séance DANS la page puis appellent le vrai `toggleSet`. */
async function page(b, PORT, extra) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
  const init = Object.assign({}, BASE, extra || {});
  await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_s2nav'))return; sessionStorage.setItem('_s2nav','1'); localStorage.clear();
    const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 140)));
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
  await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); goScreen('log', document.getElementById('nb-log')); });
  return { cx, pg, errs };
}

/* La fabrique de scénarios, injectée dans la page (même code pour NR et S2). */
const OUTILS = `(() => {
  window.__s = {
    sets: (n, kg, extra) => Array.from({ length: n }, (_, i) => Object.assign({ kg: Array.isArray(kg) ? kg[i] : kg, reps: 8, type: 'N', done: false }, extra || {})),
    mk: (exs, ouvert) => { S.wkt = { date: new Date().toISOString().slice(0, 10), startHour: 10, exs }; _expandedEx = ouvert || 0; stopRest(); renderExBlocks(); },
    snap: () => ({ ouvert: _expandedEx, repos: !!restStartTs, total: restStartTs ? restTot : null,
      label: (document.getElementById('rest-label') || {}).textContent || '', cb: typeof _restDoneCb === 'function' }),
    // comme à la fin d'un repos : si une avance est armée, on l'exécute (le callback ne se re-déclenche pas seul dans le banc)
    joue: (liste) => { const j = []; for (const [ei, si] of liste) { toggleSet(ei, si); const s = __s.snap(); s.etape = ei + '.' + si; if (s.cb) { const cb = _restDoneCb; cb(); s.apresCb = _expandedEx; } j.push(s); } return j; }
  };
})();`;

async function ecran(t, b, PORT) {
  const X = await page(b, PORT);
  await X.pg.evaluate(OUTILS);
  const run = fn => X.pg.evaluate(fn);
  const SUIV = "{ name: 'Squat', sets: __s.sets(2, 100) }";

  /* ───────────── NR — NON-RÉGRESSION (attendus relevés sur le code d'avant) ───────────── */
  // NR-1/2 : un dropset DESCENDANT posé par l'outil — aucun repos entre les paliers, le repos au dernier palier, JAMAIS de passage à l'exercice suivant.
  for (const [id, titre, ds, nbSeries] of [
    ['NR-1', 'dropset ↓ de l\'outil, 3 paliers', "{ paliers: 3, pct: 20, direction: 'down' }", 3],
    ['NR-2', 'dropset ↓ de l\'outil, 1 série normale puis 2 paliers', "{ paliers: 2, pct: 20, direction: 'down' }", 3]]) {
    const j = await run(`(() => { __s.mk([{ name: 'Développé Couché', sets: __s.sets(3, [80, 64, 52]), dropset: ${ds} }, ${SUIV}]); return __s.joue([[0,0],[0,1],[0,2]]); })()`);
    t(`B-S2NAV-${id} ${titre} : pas de repos entre les paliers, le repos (130 s) au DERNIER palier seulement`,
      j.length === nbSeries && !j[0].repos && !j[1].repos && j[2].repos && j[2].total === 130, _det(j));
    t(`B-S2NAV-${id}b ${titre} : l'exercice reste ouvert, aucune avance au suivant n'est armée (comportement d'avant, à ne pas changer dans ce lot)`,
      j.every(s => s.ouvert === 0 && !s.cb), _det(j));
  }
  // NR-3 : un dropset IMPORTÉ avec marqueur `dropChaine` — même chaîne sans repos ; au dernier palier il passe par la logique d'un exercice ordinaire.
  { const j = await run(`(() => { __s.mk([{ name: 'Développé Couché', dropChaine: true, sets: __s.sets(3, [80, 64, 52], { type: 'D' }) }, ${SUIV}]); return __s.joue([[0,0],[0,1],[0,2]]); })()`);
    t('B-S2NAV-NR-3 dropset importé (marqueur `dropChaine`) : aucun repos entre les paliers ; repos de 130 s au dernier ET le suivant est atteint',
      !j[0].repos && !j[1].repos && j[2].repos && j[2].total === 130 && (j[2].apresCb === 1 || j[2].ouvert === 1), _det(j)); }
  // NR-4 : un dropset importé SANS marqueur (ancienne donnée) : « aucun comportement nouveau » (décision du 02/11) — chaque palier garde son repos.
  { const j = await run(`(() => { __s.mk([{ name: 'Développé Couché', sets: __s.sets(3, [80, 64, 52], { type: 'D' }) }, ${SUIV}]); return __s.joue([[0,0],[0,1],[0,2]]); })()`);
    t('B-S2NAV-NR-4 dropset importé SANS marqueur : chaque palier a son repos de 130 s (ancienne donnée inchangée) ; le dernier atteint le suivant',
      j.every(s => s.repos && s.total === 130) && (j[2].apresCb === 1 || j[2].ouvert === 1), _det(j)); }
  // NR-5 : une pyramide ↑ de l'outil (ex.dropset direction up) : logique d'un exercice ordinaire — repos à chaque série, le suivant atteint à la fin.
  { const j = await run(`(() => { __s.mk([{ name: 'Développé Couché', sets: __s.sets(3, [60, 66, 72]), dropset: { paliers: 3, pct: 10, direction: 'up' } }, ${SUIV}]); return __s.joue([[0,0],[0,1],[0,2]]); })()`);
    t('B-S2NAV-NR-5 pyramide ↑ de l\'outil : repos de 130 s à chaque série ; le dernier palier atteint l\'exercice suivant',
      j.every(s => s.repos && s.total === 130) && (j[2].apresCb === 1 || j[2].ouvert === 1), _det(j)); }
  // NR-6 : un groupe de type « drop » — passage immédiat au partenaire sans repos ; JAMAIS de sortie du groupe vers l'exercice suivant.
  { const j = await run(`(() => { __s.mk([{ name: 'Curl Haltères', sets: __s.sets(2, 20), group: 'g1', groupType: 'drop' }, { name: 'Extension Triceps Poulie', sets: __s.sets(2, 30), group: 'g1', groupType: 'drop' }, ${SUIV}]); return __s.joue([[0,0],[1,0],[0,1],[1,1]]); })()`);
    t('B-S2NAV-NR-6 groupe « drop » : le 1ᵉʳ membre passe au 2ᵉ SANS repos ; ensuite repos de 130 s', j[0].ouvert === 1 && !j[0].repos && j[1].repos && j[1].total === 130, _det(j));
    t('B-S2NAV-NR-6b groupe « drop » : on ne sort jamais du groupe tout seul (l\'exercice suivant n\'est jamais ouvert) et aucune avance n\'est armée', j.every(s => s.ouvert !== 2 && !s.cb), _det(j)); }
  // NR-7/8 : groupes pyramide — repos + avance au partenaire à la fin du repos ; libellé ; pré-remplissage de la charge ×1,1 (↑) ou ×0,9 (↓) ; jamais de sortie.
  for (const [id, gt, lib, kgAttendu] of [['NR-7', 'pyramid-up', '📈 Pyramide +', 22.5], ['NR-8', 'pyramid-down', '📉 Pyramide −', 17.5]]) {
    const R = await run(`(() => { __s.mk([{ name: 'Curl Haltères', sets: __s.sets(2, 20), group: 'g1', groupType: '${gt}' }, { name: 'Extension Triceps Poulie', sets: __s.sets(2, 30), group: 'g1', groupType: '${gt}' }, ${SUIV}]);
      const r = __s.joue([[0,0],[1,0],[0,1],[1,1]]); return { pas: r, kgPartenaire: S.wkt.exs[1].sets.map(s => s.kg) }; })()`);
    const j = R.pas;
    t(`B-S2NAV-${id} groupe ${gt} : repos de 130 s, libellé « ${lib} », avance au partenaire à la fin du repos`, j[0].repos && j[0].total === 130 && j[0].label === lib && j[0].cb === true && j[0].apresCb === 1, _det(j));
    t(`B-S2NAV-${id}b groupe ${gt} : charge du partenaire pré-remplie (${kgAttendu} kg) et jamais de sortie vers l'exercice suivant`,
      R.kgPartenaire[1] === kgAttendu && j.every(s => s.ouvert !== 2 && s.apresCb !== 2), _det(R)); }
  // NR-9 : le tour d'un superset ÉQUILIBRÉ (2+2) — le 1ᵉʳ membre passe au 2ᵉ sans repos ; le dernier membre revient au 1ᵉʳ AVEC repos et « ⚡ Tour suivant ».
  { const j = await run(`(() => { __s.mk([{ name: 'Curl Haltères', sets: __s.sets(2, 20), group: 'g1', groupType: 'super' }, { name: 'Extension Triceps Poulie', sets: __s.sets(2, 30), group: 'g1', groupType: 'super' }, ${SUIV}]); return __s.joue([[0,0],[1,0]]); })()`);
    t('B-S2NAV-NR-9 superset 2+2 : A1 → B sans repos ; B1 → retour à A avec repos de 130 s et « ⚡ Tour suivant »',
      j[0].ouvert === 1 && !j[0].repos && j[1].ouvert === 0 && j[1].repos && j[1].total === 130 && j[1].label === '⚡ Tour suivant', _det(j)); }
  // NR-10 : les durées de repos (type de série, préférence de l'exercice, durée écrite sur la série, abdos).
  { const d = await run(`(() => { const dur = (ex, pref) => { __s.mk([ex, ${SUIV}]); S.exRestPref = pref || {}; toggleSet(0, 0); const t = restTot; stopRest(); S.exRestPref = {}; return t; };
      const E = (kg, type) => ({ kg, reps: 8, type: type || 'N', done: false });
      return { defaut: dur({ name: 'Développé Couché', sets: __s.sets(2, 80) }),
        echec: dur({ name: 'Développé Couché', sets: [E(80, 'X'), E(80)] }),
        serieRest: dur({ name: 'Développé Couché', sets: [Object.assign(E(80), { rest: 75 }), E(80)] }),
        preference: dur({ name: 'Développé Couché', sets: __s.sets(2, 80) }, { 'Développé Couché': 100 }),
        abdos: dur({ name: 'Crunch', sets: __s.sets(2, 0) }),
        echauffVersTravail: dur({ name: 'Développé Couché', sets: [E(40, 'É'), E(80)] }),
        echauffEntrePaliers: dur({ name: 'Développé Couché', sets: [E(40, 'É'), E(60, 'É'), E(80)] }) }; })()`);
    t('B-S2NAV-NR-10 durées de repos inchangées : défaut 130 · échec X 240 · durée écrite sur la série 75 · préférence de l\'exercice 100 · abdos 30',
      d.defaut === 130 && d.echec === 240 && d.serieRest === 75 && d.preference === 100 && d.abdos === 30, _det(d));
    t('B-S2NAV-NR-10b durées de repos inchangées : échauffement avant une série de travail = repos de travail (130) ; entre deux paliers = repos de palier',
      d.echauffVersTravail === 130 && d.echauffEntrePaliers >= 45 && d.echauffEntrePaliers <= 130, _det(d)); }
  t('B-S2NAV-NR-11 aucune erreur de page pendant les scénarios de non-régression', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  await X.cx.close();
}

/* ═════════════════ S2 — LA NOUVELLE NAVIGATION (exercice ordinaire ET superset) ═════════════════
   Arbitrages de Michel (24/11) : passage AVANT le chronomètre · échauffements non validés ne bloquent jamais (décision ① du 16/10) · séries de TRAVAIL ajoutées prises en compte ·
   sortie des supersets déséquilibrés · retour sur un exercice terminé pour ajouter une série · fin de séance JAMAIS automatique · question du RIR nommée · reprise tel que laissé. */
const OUTILS_S2 = `(() => {
  const L = ['A', 'B', 'M'];
  const NOMS = ['Curl Haltères', 'Extension Triceps Poulie', 'Élévations Latérales'];
  window.__g = {
    // un groupe superset de tailles n[], suivi d'un exercice « Squat » (2 séries) ; renvoie le journal d'une personne qui valide, à chaque pas, la 1ʳᵉ série non faite de l'exercice OUVERT
    groupe: (n, extra) => { const exs = n.map((k, i) => ({ name: NOMS[i], sets: __s.sets(k, 20), group: 'g1', groupType: 'super' })); exs.push({ name: 'Squat', sets: __s.sets(2, 100) });
      if (extra) extra(exs); __s.mk(exs, 0); const j = []; let garde = 0;
      while (garde++ < 20) { const ei = _expandedEx; if (ei >= n.length) break; const k = S.wkt.exs[ei].sets.findIndex(x => !x.done);
        if (k < 0) { j.push('⚠ ' + L[ei] + ' sans série restante'); break; }
        toggleSet(ei, k); const s = __s.snap(); j.push(L[ei] + (k + 1) + '→' + (s.ouvert >= n.length ? 'C' : L[s.ouvert]) + (s.repos ? '·repos' : '·sans')); if (s.repos && s.ouvert < n.length) stopRest(); }   // le repos de la DERNIÈRE série du groupe reste en cours (son dock offre « ＋ Série sur … »)
      return j; }
  };
})();`;

async function ecranS2(t, b, PORT) {
  const X = await page(b, PORT);
  await X.pg.evaluate(OUTILS); await X.pg.evaluate(OUTILS_S2);
  // ⛔ UNE EXCEPTION DANS LA PAGE EST UN ROUGE NOMMÉ, PAS UN PLANTAGE : le scénario rend `{__err}` et les conditions (optional chaining) échouent sur SON libellé
  const run = expr => X.pg.evaluate(`(() => { try { return ${expr}; } catch (e) { return { __err: String(e && e.message || e).slice(0, 160) }; } })()`);
  const TROIS = "[{ name: 'Développé Couché', sets: __s.sets(3, 80) }, { name: 'Squat', sets: __s.sets(2, 100) }, { name: 'Tractions', sets: __s.sets(2, 0) }]";

  // S2-1 : le passage a lieu AVANT le chronomètre (mesuré à l'instant où `startRest` est appelé), le repos démarre dans le même tour, sans avance différée.
  { const r = await run(`(() => { __s.mk(${TROIS}); const o = window.startRest; let ouvertAuDepart = null; window.startRest = function (s) { ouvertAuDepart = _expandedEx; return o.apply(this, arguments); };
      toggleSet(0, 0); toggleSet(0, 1); const avant = __s.snap(); toggleSet(0, 2); const apres = __s.snap(); window.startRest = o;
      return { avant, apres, ouvertAuDepart, dock: (document.getElementById('rest-suite') || {}).textContent || '' }; })()`);
    t('B-S2NAV-S2-1 la dernière série d\'un exercice ordinaire ouvre le suivant AVANT que le chronomètre démarre (exercice déjà ouvert à l\'appel de startRest), repos de 130 s démarré, aucune avance différée',
      r.avant?.ouvert === 0 && r.apres?.ouvert === 1 && r.ouvertAuDepart === 1 && r.apres?.repos && r.apres?.total === 130 && r.apres?.cb === false, _det(r));
    t('B-S2NAV-S2-1b le dock dit de quel exercice est le repos, quel est le suivant, et offre « ＋ Série sur … » (arbitrage du 24/11)',
      /Repos · Développé Couché/.test(r.dock) && /Ensuite : Squat/.test(r.dock) && /＋ Série sur Développé Couché/.test(r.dock), _det(r.dock)); }

  // S2-2 : « + Série » AVANT la validation de la dernière série programmée → l'exercice n'est pas terminé, aucun passage prématuré ; la série ajoutée est comptée.
  { const r = await run(`(() => { __s.mk(${TROIS}); toggleSet(0, 0); toggleSet(0, 1); addSet(0); toggleSet(0, 2); const s3 = __s.snap(); toggleSet(0, 3); const s4 = __s.snap(); return { s3, s4, nb: S.wkt.exs[0].sets.length }; })()`);
    t('B-S2NAV-S2-2 une série ajoutée avant la dernière validation est prise en compte : on reste sur l\'exercice jusqu\'à elle, puis on passe au suivant',
      r.nb === 4 && r.s3?.ouvert === 0 && r.s4?.ouvert === 1 && r.s4?.repos, _det(r)); }

  // S2-3 : « ＋ Série sur … » du dock, PENDANT le repos : l'exercice terminé se rouvre, la série s'ajoute, le dock s'efface, la validation relance le passage.
  { const r = await run(`(() => { __s.mk(${TROIS}); toggleSet(0, 0); toggleSet(0, 1); toggleSet(0, 2); const apresSortie = __s.snap(); ajouterSerieDepuisDock();
      const apresAjout = Object.assign(__s.snap(), { nb: S.wkt.exs[0].sets.length, dock: (document.getElementById('rest-suite') || {}).textContent || '' });
      toggleSet(0, 3); const apresValidation = __s.snap(); return { apresSortie, apresAjout, apresValidation }; })()`);
    t('B-S2NAV-S2-3 « ＋ Série sur [exercice] » rouvre l\'exercice terminé et y ajoute une série de travail ; le repos continue ; le dock s\'efface',
      r.apresSortie?.ouvert === 1 && r.apresAjout?.ouvert === 0 && r.apresAjout?.nb === 4 && r.apresAjout?.repos && r.apresAjout?.dock === '', _det(r));
    t('B-S2NAV-S2-3b la série ajoutée après coup, une fois validée, relance le passage automatique vers le mouvement suivant',
      r.apresValidation?.ouvert === 1 && r.apresValidation?.repos, _det(r.apresValidation)); }

  // S2-4 : dévalidation / double appui / « Passer » pendant le repos : plus aucun passage en différé qui parte tout seul (le défaut mesuré le 24/11).
  { const r = await run(`(() => { __s.mk(${TROIS}); toggleSet(0, 0); toggleSet(0, 1); toggleSet(0, 2); _expandedEx = 0; renderExBlocks(); toggleSet(0, 2);   // dévalidation
      const a = __s.snap(); skipRest(); const b2 = __s.snap(); return { a, b2, aFaire: S.wkt.exs[0].sets.filter(s => !s.done).length }; })()`);
    t('B-S2NAV-S2-4 dévalider la dernière série puis « Passer » ne déplace plus l\'écran (aucune avance différée à invalider)', r.aFaire === 1 && r.a?.cb === false && r.b2?.ouvert === 0, _det(r)); }

  // S2-5 : échauffements (décision du 16/10) — non validés, ils ne bloquent pas ; en valider un sur un exercice terminé ne déclenche aucun passage.
  { const r = await run(`(() => { __s.mk([{ name: 'Développé Couché', sets: [{ kg: 40, reps: 10, type: 'É', done: false }].concat(__s.sets(2, 80)) }, { name: 'Squat', sets: __s.sets(2, 100) }]);
      toggleSet(0, 1); const a = __s.snap(); toggleSet(0, 2); const b2 = __s.snap(); return { a, b2, echauffementNonFait: !S.wkt.exs[0].sets[0].done }; })()`);
    t('B-S2NAV-S2-5 un échauffement non validé ne bloque pas le passage (décision ① du 16/10) : on passe au suivant dès la dernière série de TRAVAIL',
      r.echauffementNonFait && r.a?.ouvert === 0 && r.b2?.ouvert === 1 && r.b2?.repos, _det(r)); }
  { const r = await run(`(() => { __s.mk([{ name: 'Développé Couché', sets: __s.sets(2, 80).concat([{ kg: 40, reps: 10, type: 'É', done: false }]) }, { name: 'Squat', sets: __s.sets(2, 100) }]);
      toggleSet(0, 0); toggleSet(0, 1); _expandedEx = 0; renderExBlocks(); toggleSet(0, 2); const s = __s.snap(); return { s }; })()`);
    t('B-S2NAV-S2-5b valider un échauffement ajouté sur un exercice DÉJÀ terminé ne déclenche aucun passage (l\'écran reste où la personne est revenue)', r.s?.ouvert === 0, _det(r)); }

  // S2-6 : les supersets déséquilibrés et équilibrés — journal pas à pas (A/B/M = membres, C = l'exercice suivant) ; jamais d'ouverture d'un membre terminé ; sortie avant le repos.
  const J = (n, extra) => run(`__g.groupe(${JSON.stringify(n)}${extra ? ', ' + extra : ''})`);
  const cas = [
    ['3+2', [3, 2], ['A1→B·sans', 'B1→A·repos', 'A2→B·sans', 'B2→A·repos', 'A3→C·repos']],
    ['2+3', [2, 3], ['A1→B·sans', 'B1→A·repos', 'A2→B·sans', 'B2→B·repos', 'B3→C·repos']],
    ['3+3', [3, 3], ['A1→B·sans', 'B1→A·repos', 'A2→B·sans', 'B2→A·repos', 'A3→B·sans', 'B3→C·repos']],
    ['2+2', [2, 2], ['A1→B·sans', 'B1→A·repos', 'A2→B·sans', 'B2→C·repos']],
    ['1+3', [1, 3], ['A1→B·sans', 'B1→B·repos', 'B2→B·repos', 'B3→C·repos']],
    ['2+2+2 (3 membres)', [2, 2, 2], ['A1→B·sans', 'B1→M·sans', 'M1→A·repos', 'A2→B·sans', 'B2→M·sans', 'M2→C·repos']]];
  for (const [nom, n, attendu] of cas) {
    const j = await J(n);
    t(`B-S2NAV-S2-6 superset ${nom} : l'alternance suit ce qu'il RESTE à faire, le chronomètre démarre après CHAQUE dernière série du groupe, et on sort vers l'exercice suivant`, _det(j) === _det(attendu), _det(j));
  }
  // S2-7 : sortie vers le premier exercice À FAIRE (un exercice déjà terminé est sauté) ; pas de suivant → on reste, le repos démarre, la séance n'est PAS terminée.
  { // ⛔ le RANG de l'exercice ouvert est mesuré (le journal ne dit que « C » pour tout ce qui suit le groupe : il ne distinguerait pas Pompes de Squat)
    const r = await run(`(() => { const j = __g.groupe([2, 2], exs => { exs.splice(2, 0, { name: 'Pompes', sets: __s.sets(2, 0).map(s => Object.assign(s, { done: true })) }); });
      return { j, ouvert: _expandedEx, nom: S.wkt.exs[_expandedEx] && S.wkt.exs[_expandedEx].name }; })()`);
    t('B-S2NAV-S2-7 la sortie saute l\'exercice déjà terminé (Pompes) et ouvre le premier à faire (Squat)', r.nom === 'Squat' && r.ouvert === 3, _det(r)); }
  { const r = await run(`(() => { const exs = [{ name: 'Curl Haltères', sets: __s.sets(2, 20), group: 'g1', groupType: 'super' }, { name: 'Extension Triceps Poulie', sets: __s.sets(2, 30), group: 'g1', groupType: 'super' }]; __s.mk(exs, 0);
      const nbSeances = (S.sessions || []).length; toggleSet(0, 0); toggleSet(1, 0); toggleSet(0, 1); toggleSet(1, 1); const s = __s.snap(); return { s, finie: (S.sessions || []).length !== nbSeances, wkt: !!S.wkt, dock: (document.getElementById('rest-suite') || {}).textContent || '' }; })()`);
    t('B-S2NAV-S2-7b fin de séance : le dernier exercice terminé ne passe nulle part, le repos démarre, la séance n\'est JAMAIS terminée toute seule', r.s?.repos && r.s?.ouvert === 1 && !r.finie && r.wkt && r.dock === '', _det(r)); }
  // S2-8 : série ajoutée APRÈS la sortie du superset (par le dock, ou en rouvrant la carte) : l'alternance reprend avec elle, puis nouvelle sortie.
  { const r = await run(`(() => { const j = []; __g.groupe([2, 2]); const apresSortie = _expandedEx;
      ajouterSerieDepuisDock(); j.push('dock→' + _expandedEx + ' nbB=' + S.wkt.exs[1].sets.length); const k = S.wkt.exs[1].sets.length - 1; toggleSet(1, k); j.push('B' + (k + 1) + '→' + _expandedEx + (restStartTs ? '·repos' : '·sans')); stopRest();
      toggleExBlock(0); addSet(0); toggleSet(0, 2); j.push('A3→' + _expandedEx + (restStartTs ? '·repos' : '·sans')); stopRest();
      toggleExBlock(1); addSet(1); toggleExBlock(0); addSet(0); toggleSet(0, 3); j.push('A4→' + _expandedEx + (restStartTs ? '·repos' : '·sans')); stopRest(); toggleSet(1, 3); j.push('B4→' + _expandedEx + (restStartTs ? '·repos' : '·sans'));
      return { apresSortie, j }; })()`);
    t('B-S2NAV-S2-8 une série ajoutée sur un membre terminé du superset (dock ou carte rouverte) est prise en compte : on sort de nouveau vers l\'exercice suivant ; ajoutées des DEUX côtés, l\'alternance reprend',
      r.apresSortie === 2 && _det(r.j) === _det(['dock→1 nbB=3', 'B3→2·repos', 'A3→2·repos', 'A4→1·sans', 'B4→2·repos']), _det(r)); }

  // S2-9 : la question du RIR après le changement d'exercice nomme l'exercice visé, et la réponse va à la bonne série.
  { const r = await run(`(() => { __s.mk(${TROIS}); toggleSet(0, 0); const dansLeMeme = (document.getElementById('rest-rir') || {}).textContent || ''; stopRest(); toggleSet(0, 1); toggleSet(0, 2);
      const apres = (document.getElementById('rest-rir') || {}).textContent || ''; setRir(0, 2, 2); return { dansLeMeme, apres, rir: S.wkt.exs[0].sets[2].rir, ouvert: _expandedEx }; })()`);
    t('B-S2NAV-S2-9 la question du RIR ne nomme pas l\'exercice tant qu\'on y est ; après le passage automatique elle le NOMME, et la réponse est écrite sur la série de l\'exercice terminé',
      !/Développé Couché/.test(r.dansLeMeme) && /Développé Couché/.test(r.apres) && r.rir === 2 && r.ouvert === 1, _det(r)); }
  t('B-S2NAV-S2-10 aucune erreur de page pendant les scénarios S2', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  await X.cx.close();
}

/* ═════════════════ VUE — `S.wkt.vue` : la reprise rouvre l'exercice tel que laissé ═════════════════ */
async function ecranVue(t, b, PORT) {
  const X = await page(b, PORT);
  await X.pg.evaluate(OUTILS);
  const lire = () => X.pg.evaluate(() => ({ ouvert: _expandedEx, nom: S.wkt && S.wkt.exs[_expandedEx] ? S.wkt.exs[_expandedEx].name : null, vue: S.wkt && S.wkt.vue || null,
    disque: (() => { try { const d = JSON.parse(localStorage.getItem('ft4_wkt') || 'null'); return d && d.vue || null; } catch (e) { return 'illisible'; } })(), repos: !!restStartTs }));
  // La vraie réouverture : la page est rechargée, on retourne sur l'écran Séance (c'est là que l'exercice ouvert se choisit), les outils du banc sont reposés.
  const recharger = async () => { await X.pg.reload(); await X.pg.waitForTimeout(1500);
    await X.pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); goScreen('log', document.getElementById('nb-log')); });
    await X.pg.waitForTimeout(300); await X.pg.evaluate(OUTILS); };
  const seance = (extraSets) => X.pg.evaluate((es) => { const s3 = (n, f) => Array.from({ length: n }, (_, i) => ({ kg: 50, reps: 8, type: 'N', done: i < f, at: i < f ? 100 + i : undefined }));
    S.wkt = { date: new Date().toISOString().slice(0, 10), startHour: 10, startTs: Date.now() - 20 * 60000, runId: 'r-s2', exs: [
      { name: 'Squat', sets: s3(3, 3) }, { name: 'Développé Couché', sets: s3(3, 1) }, { name: 'Tractions', sets: s3(3, 0) }] };
    if (es) es(); _expandedEx = null; _vuePremiere = false; persist(); renderExBlocks(); return true; }, extraSets || null);
  const dep = async (extra) => { await seance(); await X.pg.evaluate(extra); };

  // V-1 : ouvrir un exercice « pour voir », sans rien valider, l'enregistre (champ seul, clé existante) ; la reprise le rouvre.
  // ⭐ l'exercice ouvert volontairement est le 1ᵉʳ (Squat, 3/3) : ni le dernier de la liste (valeur par défaut d'avant), ni le « prochain à faire » (repli dérivé) — seul le pointeur peut le redonner
  // VUE-0 : AFFICHER n'est pas MODIFIER — une séance qu'on ne fait que regarder (1ᵉʳ rendu, aide ouverte, retour sur l'écran) ne reçoit aucune vue
  await seance(); await X.pg.evaluate(() => { renderExBlocks(); renderExBlocks(); });
  { const a = await lire(); t('B-S2NAV-VUE-0 le premier rendu d\'une séance n\'écrit AUCUNE vue (ni en mémoire ni sur le disque) : afficher n\'est pas modifier', a.vue === null && a.disque === null, _det(a)); }
  await seance(); await X.pg.evaluate(() => { toggleExBlock(0); });
  { const a = await lire(); t('B-S2NAV-VUE-1 ouvrir un exercice enregistre `S.wkt.vue` (rang + nom) dans la clé existante `ft4_wkt`', a.ouvert === 0 && a.vue && a.vue.i === 0 && a.vue.n === 'Squat' && a.disque && a.disque.i === 0, _det(a)); }
  await recharger();
  { const a = await lire(); t('B-S2NAV-VUE-2 après fermeture/réouverture, c\'est l\'exercice OUVERT VOLONTAIREMENT qui revient — pas le dernier de la liste (Tractions), pas le prochain à faire (Développé Couché)', a.ouvert === 0 && a.nom === 'Squat', _det(a)); }
  // V-3 : le passage automatique enregistre aussi la vue ; réouverture sur le mouvement ouvert par le passage, repos repris à l'heure réelle.
  await seance(); await X.pg.evaluate(() => { __s.mk([{ name: 'Développé Couché', sets: __s.sets(2, 80) }, { name: 'Squat', sets: __s.sets(2, 100) }], 0); S.wkt.runId = 'r-s2'; S.wkt.startTs = Date.now() - 600000; persist(); toggleSet(0, 0); toggleSet(0, 1); });
  { const a = await lire(); t('B-S2NAV-VUE-3 le passage automatique enregistre la nouvelle vue (le mouvement ouvert) et le repos est rangé', a.ouvert === 1 && a.vue && a.vue.n === 'Squat' && a.disque && a.disque.n === 'Squat' && a.repos, _det(a)); }
  await recharger();
  { const a = await lire(); t('B-S2NAV-VUE-4 réouverture après un passage automatique : le bon exercice (Squat), et le repos repris (aucun passage rejoué)', a.ouvert === 1 && a.nom === 'Squat' && a.repos, _det(a)); }
  // V-5 : séance commencée AVANT la mise à jour (pas de `vue`) → repli dérivé : l'exercice de la série validée la plus récente ; terminé → le prochain à faire.
  await seance(); await X.pg.evaluate(() => { delete S.wkt.vue; persist(); });
  await recharger();
  { const a = await lire(); t('B-S2NAV-VUE-5 sans `vue` (séance d\'avant la mise à jour) : repli sur l\'exercice de la série validée la plus récente ; terminé (Squat 3/3) → le prochain à faire (Développé Couché)', a.ouvert === 1 && a.nom === 'Développé Couché', _det(a)); }
  // V-6 : pointeur périmé (nom qui ne correspond plus) → jamais un autre exercice visé au hasard : repli dérivé.
  await seance(); await X.pg.evaluate(() => { S.wkt.vue = { i: 2, n: 'Un autre exercice' }; persist(); });
  await recharger();
  { const a = await lire(); t('B-S2NAV-VUE-6 un pointeur dont le nom ne correspond plus est ignoré (repli dérivé) : on n\'ouvre jamais un exercice « au rang »', a.ouvert === 1 && a.nom === 'Développé Couché', _det(a)); }
  // V-7 : écriture sûre — une AUTRE séance sur le disque (autre onglet) n'est jamais écrasée ; aucune synchro déclenchée (persist non appelé) ; pas de vue dans la séance enregistrée.
  await seance();
  { const r = await X.pg.evaluate(() => { const autre = { date: '2026-01-01', startHour: 9, startTs: 1, runId: 'autre-onglet', exs: [{ name: 'Squat', sets: [{ kg: 1, reps: 1, type: 'N', done: true }] }] };
      localStorage.setItem('ft4_wkt', JSON.stringify(autre)); let nbPersist = 0; const p = window.persist; window.persist = function () { nbPersist++; return p.apply(this, arguments); };
      toggleExBlock(2); toggleExBlock(0); window.persist = p; const d = JSON.parse(localStorage.getItem('ft4_wkt')); return { runId: d.runId, vue: d.vue || null, nbPersist }; });
    t('B-S2NAV-VUE-7 une autre séance sur le disque (autre onglet) n\'est jamais écrasée, et ouvrir une carte n\'appelle pas `persist()` (aucune synchronisation)', r.runId === 'autre-onglet' && r.vue === null && r.nbPersist === 0, _det(r)); }
  // VUE-7b : la MÊME séance sur le disque — la vue s'y écrit (champ seul), et toujours sans `persist()` (donc sans relancer la synchronisation)
  await seance();
  { const r = await X.pg.evaluate(() => { let nbPersist = 0; const p = window.persist; window.persist = function () { nbPersist++; return p.apply(this, arguments); };
      toggleExBlock(2); toggleExBlock(1); window.persist = p; const d = JSON.parse(localStorage.getItem('ft4_wkt')); return { vue: d.vue || null, nbPersist, exsIntactes: d.exs.length === 3 && d.exs[0].sets.length === 3 }; });
    t('B-S2NAV-VUE-7b dans la même séance la vue s\'écrit dans `ft4_wkt` (champ seul, séries intactes) et ouvrir une carte n\'appelle JAMAIS `persist()`', r.vue && r.vue.i === 1 && r.vue.n === 'Développé Couché' && r.nbPersist === 0 && r.exsIntactes, _det(r)); }
  await seance();
  { const r = await X.pg.evaluate(() => { toggleExBlock(1); const avant = S.wkt.vue; S.wkt.exs.forEach(e => e.sets.forEach(s => { s.done = true; })); S.wkt.cardio = null; return { avant, avecVue: JSON.stringify(S.wkt).includes('"vue"') }; });
    t('B-S2NAV-VUE-8 la vue est un champ de la séance EN COURS seulement : elle n\'est pas copiée dans la séance enregistrée', r.avant && r.avecVue === true, _det(r)); }
  { const r = await X.pg.evaluate(async () => { try { await finishWorkout(); } catch (e) { return { err: String(e) }; } const s = (S.sessions || [])[0] || (S.sessions || []).slice(-1)[0]; return { vueDansSeance: !!(s && (s.vue !== undefined || JSON.stringify(s).includes('"vue"'))), nb: (S.sessions || []).length, wktApres: !!S.wkt }; });
    t('B-S2NAV-VUE-9 la séance enregistrée par « Terminer » ne contient aucune trace de `vue`, et la séance en cours disparaît avec elle', !r.err && r.vueDansSeance === false && r.nb >= 1, _det(r)); }
  t('B-S2NAV-VUE-10 aucune erreur de page pendant les scénarios de reprise', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  await X.cx.close();
}

/* ⛔ UNE EXCEPTION DANS UNE PARTIE EST UN ROUGE, PAS UN PLANTAGE DE LA PASSE : sur du code qui n'a pas (encore) les fonctions éprouvées (le contrôle négatif remet le code d'AVANT),
   `page.evaluate` lève ; sans ce filet toute la passe s'arrêterait, et le témoin qui devait rougir ne rougirait jamais nommément. */
async function tout(t, b, PORT) {
  for (const [nom, f] of [['NR', ecran], ['S2', ecranS2], ['VUE', ecranVue]]) {
    try { await f(t, b, PORT); }
    catch (e) { t('B-S2NAV-' + nom + '-EXCEPTION une partie du module ne doit pas lever d\'exception', false, String((e && e.message) || e).slice(0, 160)); }
  }
}

module.exports = { ecran, ecranS2, ecranVue, tout };
