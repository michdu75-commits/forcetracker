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

module.exports = { ecran };
