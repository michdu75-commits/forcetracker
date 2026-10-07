/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🧩 LOT 6 / ML-A — LE DROPSET SURVIT AU PROGRAMME (séance → programme → séance)
   session-B · 28/09/2026

   Mesuré AVANT correction (audit Lot 6, sonde locale sur master dcc2ff43, ft-v1241) : un exercice
   portant `ex.dropset` (posé par `applyDropset`) le perdait dans « 💾 Sauvegarder comme programme »
   (`saveAsProg`), et aucun des deux chargeurs (`_loadProgVraiment`, `_loadProgDayVraiment`) ne le
   recopiait. Rechargé, l'écran n'affichait plus le dropset et les paliers redevenaient des séries
   normales, avec un repos entre chacun.
   Correctif : un seul propriétaire de la recopie, `_recopierDropset` (log.js), appelé aux trois
   endroits. Présent → copie profonde entière ; absent → rien n'est créé.

   Ce que les témoins CONDUISENT : l'onglet Séance, « 📉 Drop » (la vraie modale `#ov-drop-cfg` et
   son bouton de création), « Programme », le champ de nom, « 💾 Sauvegarder comme programme »,
   « ▶ Charger », le sélecteur de jour `#ov-day-sel`, la case ✓ d'un palier, un VRAI rechargement.
   Frontières simulées : Apps Script et Worker (aucun appel réel, aucun appel Milo).
   Ce qu'ils OBSERVENT : `S.programmes` et `ft4_progs`, `S.wkt` et `ft4_wkt`, l'égalité STRICTE du
   dropset (y compris des sous-champs inconnus), l'absence d'alias mémoire entre programme et
   séance, la liste EXACTE des champs de chaque exercice et de chaque série (non-destruction), le
   rendu (bloc dropset) et le repos (pas de barre de repos entre deux paliers descendants).
   Ce qu'ils NE COUVRENT PAS : le type de série `D`, les `groupType` drop/pyramide, l'éditeur de
   programme, la note de série, les séances de Milo, l'import, le cloud (hors périmètre ML-A) ;
   le contenu de `seanceWarn` (avertissements préexistants, seulement sa présence est tolérée).
   Banc : tools/banc_ml_a.js · contrôle négatif : tools/mut_ml_a.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const cp = x => JSON.parse(JSON.stringify(x));
// Égalité STRICTE, indépendante de l'ordre des clés (un objet relu du disque peut les réordonner).
const canon = v => Array.isArray(v) ? '[' + v.map(canon).join(',') + ']'
  : (v && typeof v === 'object') ? '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}'
  : JSON.stringify(v);
const egal = (a, b) => canon(a) === canon(b);
const aCle = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-CDII (session-B). LOT 6 / ML-A — un seul propriétaire de la recopie du dropset (source) ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const lo = nu('log.js'), co = nu('coach.js');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? undefined : j); };
  const aide = corps(lo, '_recopierDropset'), sav = corps(lo, 'saveAsProg'), l1 = corps(lo, '_loadProgVraiment'), l2 = corps(lo, '_loadProgDayVraiment');
  t('① les fonctions sont trouvées (sinon les témoins suivants ne mesurent rien)', aide && sav && l1 && l2, [aide, sav, l1, l2].map(x => x.length).join('/'));
  const autres = ['state.js', 'coach.js', 'setup.js', 'app.js', 'tracking.js', 'screens.js'].map(nu).join('\n');
  t('② UN seul propriétaire : `_recopierDropset` est déclarée une fois, dans log.js seulement',
    (lo.match(/function _recopierDropset\(/g) || []).length === 1 && !/function _recopierDropset\(/.test(autres), '');
  t('③ les TROIS sites l\'appellent, une fois chacun (saveAsProg · _loadProgVraiment · _loadProgDayVraiment)',
    [sav, l1, l2].every(c => (c.match(/_recopierDropset\(/g) || []).length === 1), [sav, l1, l2].map(c => (c.match(/_recopierDropset\(/g) || []).length).join('/'));
  t('④ absent → rien n\'est créé ; présent → copie PROFONDE entière (aucun sous-champ trié, aucun alias)',
    /src\.dropset===undefined\)return dst;/.test(aide) && /dst\.dropset=JSON\.parse\(JSON\.stringify\(src\.dropset\)\);/.test(aide)
    && !/paliers|pct|direction/.test(aide), aide.slice(0, 200));
  t('⑤ ⛔ hors périmètre : ni `_normalizeForceProg` ni `_normalizeMiloSession` ne touchent au dropset',
    !/dropset/.test(corps(co, '_normalizeForceProg')) && !/dropset/.test(corps(lo, '_normalizeMiloSession')), '');
  t('⑥ ⛔ hors périmètre : `SET_TYPES` reste N / É / X (le type `D` n\'est pas touché)',
    /const SET_TYPES=\['N','É','X'\];/.test(nu('constants.js')), '');
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CDIII (session-B). LOT 6 / ML-A — le dropset traverse séance → programme → séance (écran) ═══');
  const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
  const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 't@t.t',
    ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_lms: moisPrec, ft4_ok: '1', ft4_stmig1: '1' };
  const js = x => JSON.stringify(x).slice(0, 240);
  const ouvrir = async (seed) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    const X = { cx, milo: 0 };
    await cx.route(u => !/^http:\/\/localhost/.test(String(u)), r => { const u = r.request().url();
      if (/workers\.dev/.test(u)) X.milo++;
      if (/script\.google\.com/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: /test=1/.test(u) ? '{"status":"online","version":"3.5"}' : '{"status":"not_found"}' });
      return r.abort(); });
    const pg = await cx.newPage(); X.pg = pg; X.errs = []; pg.on('pageerror', x => X.errs.push(x.message));
    const init = Object.assign({}, BASE);
    Object.keys(seed || {}).forEach(k => { init[k] = typeof seed[k] === 'string' ? seed[k] : JSON.stringify(seed[k]); });
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_mla'))return; sessionStorage.setItem('_mla','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); }catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    return X;
  };
  const GARDER = /mod-prog|ov-drop-cfg|ov-day-sel|ov-confirm/;
  const clic = async (pg, sel, txt) => {
    for (let k = 0; k < 8; k++) {
      await pg.evaluate(g => document.querySelectorAll('.overlay.open').forEach(o => { if (!new RegExp(g).test(o.id)) o.classList.remove('open'); }), GARDER.source);
      const h = (await pg.evaluateHandle(([s, x]) => [...document.querySelectorAll(s)].find(e => e.offsetParent !== null && (!x || e.textContent.includes(x))) || null, [sel, txt])).asElement();
      if (!h) { await pg.waitForTimeout(250); continue; }
      try { await h.evaluate(x => x.scrollIntoView({ block: 'center' })); await h.click({ timeout: 3000 }); await pg.waitForTimeout(250); return true; } catch (e) { await pg.waitForTimeout(200); }
    }
    return false;
  };
  const allerSeance = async X => { await clic(X.pg, '#nb-log'); await X.pg.waitForTimeout(400); };
  const recharger = async X => { await X.pg.reload(); await X.pg.waitForTimeout(1500); };
  const etat = X => X.pg.evaluate(() => ({ progs: JSON.parse(JSON.stringify(S.programmes || [])), wkt: S.wkt ? JSON.parse(JSON.stringify(S.wkt)) : null,
    progsDisque: JSON.parse(localStorage.getItem('ft4_progs') || '[]'), wktDisque: JSON.parse(localStorage.getItem('ft4_wkt') || 'null') }));
  const sauver = async (X, nom) => {
    await allerSeance(X);
    const a = await clic(X.pg, 'button[onclick="openProgModal()"]');
    await X.pg.fill('#prog-name-inp', nom);
    const s = await clic(X.pg, '#prog-save-section button', 'Sauvegarder comme programme');
    await X.pg.evaluate(() => { const m = document.getElementById('mod-prog'); if (m) m.classList.remove('open'); });
    return a && s;
  };
  const charger = async (X, nom, jour) => {
    await allerSeance(X);
    await clic(X.pg, 'button[onclick="openProgModal()"]');
    const i = await X.pg.evaluate(n => (S.programmes || []).findIndex(p => p.name === n), nom);
    /* LOT 1 IMPORT PROGRAMME (07/10/2026) : les boutons de programme visent l'ID (`loadProg("p…")`), plus l'index —
       le sélecteur littéral `loadProg(N)` ne trouvait plus rien. Même bouton, même garantie, visé par l'id. */
    const pid = await X.pg.evaluate(k => (S.programmes[k] || {}).id || '', i);
    const a = await clic(X.pg, '[onclick=\'loadProg("' + pid + '")\']');
    let d = true;
    if (jour != null) d = await clic(X.pg, '[onclick=\'loadProgDay("' + pid + '",' + jour + ')\']');
    await X.pg.waitForTimeout(300);
    return a && d && i >= 0;
  };
  // Les champs qu'une version sans ML-A produisait déjà — la liste EXACTE (non-destruction).
  const CLES_EX_PROG = ['name', 'sets', 'note', 'group', 'groupType'];
  const CLES_SET_PROG = ['kg', 'reps', 'maxi', 'type', 'rest'];
  const CLES_EX_WKT = ['name', 'note', 'sets', 'group', 'groupType', 'seanceWarn'];
  const CLES_SET_WKT = ['kg', 'reps', 'maxi', 'type', 'done', 'rm1', 'rest'];
  const clesOk = (o, permises, extra) => Object.keys(o).every(k => permises.includes(k) || k === extra);

  const WKT = () => ({ date: '2026-09-28', startHour: 10, exs: [
    { name: 'Développé couché', note: 'coudes serrés', sets: [
      { kg: 60, reps: 8, type: 'É', done: false, rm1: 0, rest: 90 }, { kg: 80, reps: 6, type: 'N', done: false, rm1: 0, rest: 150 },
      { kg: 80, reps: 0, maxi: true, type: 'X', done: false, rm1: 0, rest: 180 } ] },
    { name: 'Curl biceps haltères', group: 'ssT', groupType: 'super', sets: [ { kg: 12, reps: 10, type: 'N', done: false, rm1: 0, rest: 0 } ] },
    { name: 'Extension triceps poulie', note: 'coudes fixes', group: 'ssT', groupType: 'super', sets: [ { kg: 25, reps: 12, type: 'N', done: false, rm1: 0, rest: 60 } ] },
    { name: 'Élévations latérales', sets: [ { kg: 10, reps: 12, type: 'N', done: false, rm1: 0 } ] },
    { name: 'Presse à cuisses', note: 'dropset importé', sets: [ { kg: 150, reps: 12, type: 'D', done: false, rm1: 0, rest: 0 }, { kg: 110, reps: 10, type: 'D', done: false, rm1: 0, rest: 0 } ] } ] });
  const DS_UI = { paliers: 3, pct: 20, direction: 'down' };

  // ── T1 · T4 · T6 : séance → dropset par l'ÉCRAN → sauvegarde par l'ÉCRAN → VRAI rechargement → chargement ──
  {
    const X = await ouvrir({ ft4_wkt: WKT() });
    await allerSeance(X);
    const dOk = await X.pg.evaluate(() => { openDropsetConfig(3, 'down'); return !!document.getElementById('ov-drop-cfg'); });
    const cree = await clic(X.pg, '#ov-drop-cfg button[onclick="applyDropset()"]');
    const avant = await etat(X);
    t('T0 le dropset est posé par la vraie modale (témoin de départ)', dOk && cree && egal(avant.wkt.exs[3].dropset, DS_UI), js(avant.wkt.exs[3]));
    const sv = await sauver(X, 'Prog ML-A');
    const e1 = await etat(X);
    const p = e1.progs.find(x => x.name === 'Prog ML-A'), pd = e1.progsDisque.find(x => x.name === 'Prog ML-A');
    t('T1 saveAsProg : le dropset est dans le programme EN MÉMOIRE, strictement identique', sv && p && egal(p.exs[3].dropset, DS_UI), js(p && p.exs[3]));
    t('T1b … et SUR LE DISQUE (ft4_progs)', pd && egal(pd.exs[3].dropset, DS_UI), js(pd && pd.exs[3]));
    t('T1c aucun alias : modifier le dropset de la séance ne touche pas celui du programme',
      await X.pg.evaluate(() => { const p = S.programmes.find(x => x.name === 'Prog ML-A'); const d = S.wkt.exs[3].dropset; if (!p || !p.exs[3] || !d) return false;
        const av = p.exs[3].dropset.pct; d.pct = 99; const ok = p.exs[3].dropset !== d && p.exs[3].dropset.pct === av; d.pct = av; return ok; }), '');
    t('T6 seul l\'exercice qui avait un dropset en porte un dans le programme',
      p && p.exs.every((e, i) => aCle(e, 'dropset') === (i === 3)), p && p.exs.map(e => aCle(e, 'dropset') ? 'D' : '-').join(''));
    await recharger(X);
    const r1 = await etat(X);
    const pr = r1.progs.find(x => x.name === 'Prog ML-A');
    t('T4a après un VRAI rechargement, le programme porte toujours le dropset', pr && egal(pr.exs[3].dropset, DS_UI), js(pr && pr.exs[3]));
    const ch = await charger(X, 'Prog ML-A');
    const r2 = await etat(X);
    t('T4b chargé par « ▶ Charger » : la séance porte le dropset, strictement identique (mémoire ET ft4_wkt)',
      ch && r2.wkt && egal(r2.wkt.exs[3].dropset, DS_UI) && r2.wktDisque && egal(r2.wktDisque.exs[3].dropset, DS_UI), js(r2.wkt && r2.wkt.exs[3]));
    t('T4c paliers identiques : 3 séries, charges 10 / 7,5 / 5, rien converti',
      r2.wkt && egal(r2.wkt.exs[3].sets.map(s => [s.kg, s.reps, s.type]), [[10, 12, 'N'], [7.5, 12, 'N'], [5, 12, 'N']]), js(r2.wkt && r2.wkt.exs[3].sets));
    t('T6b dans la séance chargée, seul cet exercice porte un dropset',
      r2.wkt && r2.wkt.exs.every((e, i) => aCle(e, 'dropset') === (i === 3)), r2.wkt && r2.wkt.exs.map(e => aCle(e, 'dropset') ? 'D' : '-').join(''));
    // UTILISABLE : l'écran le montre comme un dropset, et un palier validé n'ouvre pas de repos.
    await allerSeance(X);
    await X.pg.evaluate(() => { _expandedEx = 3; renderExBlocks(); });
    const vu = await X.pg.evaluate(() => /Retirer dropset|Modifier paliers/i.test(document.getElementById('s-log').innerText));
    t('T4d l\'écran Séance affiche le dropset (bouton « Retirer dropset » / « Modifier paliers »)', vu, '');
    const coche = await clic(X.pg, '[onclick="toggleSet(3,0)"]');
    const repos = await X.pg.evaluate(() => { const b = document.getElementById('rest-bar'); return !!(b && b.classList.contains('show')); });
    t('T4e utilisable : valider le 1ᵉʳ palier n\'ouvre PAS de repos (on enchaîne le palier suivant)', coche && !repos, 'coche=' + coche + ' repos=' + repos);
    await recharger(X);
    const r3 = await etat(X);
    t('T4f la séance en cours, rechargée à son tour, garde le dropset', r3.wkt && egal(r3.wkt.exs[3].dropset, DS_UI), js(r3.wkt && r3.wkt.exs[3]));
    t('T4g aucune erreur de page, aucun appel Milo', X.errs.length === 0 && X.milo === 0, X.errs.join(' | ').slice(0, 200) + ' milo=' + X.milo);
    await X.cx.close();
  }

  // ── T2 · T3 · T8 : programmes semés avec un dropset (contenu inconnu compris) → chargement par l'écran ──
  const DS_RICHE = { paliers: 4, pct: 15, direction: 'down', series: [2, 3], _futur: { v: 2, note: 'à garder' } };
  const PROG_1J = { id: 'p1', name: 'Un jour DS', exs: [
    { name: 'Squat', sets: [ { kg: 100, reps: 5, maxi: false, type: 'N', rest: 180 } ] },
    { name: 'Leg curl', note: 'lent', _inconnu: 'x', sets: [ { kg: 40, reps: 12, maxi: false, type: 'N', rest: 0 }, { kg: 34, reps: 12, maxi: false, type: 'N', rest: 0 } ], dropset: DS_RICHE } ] };
  const PROG_2J = { id: 'p2', name: 'Deux jours DS', days: [
    { label: 'Jour A', exs: [ { name: 'Squat', sets: [ { kg: 100, reps: 5, maxi: false, type: 'N', rest: 180 } ] } ] },
    { label: 'Jour B', exs: [ { name: 'Tirage vertical', sets: [ { kg: 50, reps: 10, maxi: false, type: 'N', rest: 90 } ] },
      { name: 'Élévations latérales', sets: [ { kg: 12, reps: 12, type: 'N', rest: 0 }, { kg: 10, reps: 12, type: 'N', rest: 0 } ], dropset: { paliers: 2, pct: 10, direction: 'up' } } ] } ] };
  {
    const X = await ouvrir({ ft4_progs: [PROG_1J, PROG_2J] });
    const c1 = await charger(X, 'Un jour DS');
    const e = await etat(X);
    t('T2 _loadProgVraiment : dropset présent et strictement identique, sous-champs inconnus compris (T8)',
      c1 && e.wkt && egal(e.wkt.exs[1].dropset, DS_RICHE) && e.wktDisque && egal(e.wktDisque.exs[1].dropset, DS_RICHE), js(e.wkt && e.wkt.exs[1]));
    t('T2b aucun alias : la séance et le programme ne partagent pas le même objet',
      await X.pg.evaluate(() => { const p = S.programmes.find(x => x.name === 'Un jour DS'); return !!(p && S.wkt && S.wkt.exs[1].dropset && S.wkt.exs[1].dropset !== p.exs[1].dropset && S.wkt.exs[1].dropset._futur !== p.exs[1].dropset._futur); }), '');
    t('T2c non-destruction : un champ inconnu de l\'exercice n\'est PAS recopié (comportement d\'avant ML-A inchangé)',
      e.wkt && !aCle(e.wkt.exs[1], '_inconnu') && e.wkt.exs[1].note === 'lent', js(e.wkt && e.wkt.exs[1]));
    t('T8 contenu non converti : 2 séries restent 2 séries même si `paliers` dit 4 (aucun nouveau modèle)',
      e.wkt && e.wkt.exs[1].sets.length === 2 && e.wkt.exs[1].sets.every(s => s.type === 'N'), js(e.wkt && e.wkt.exs[1].sets));
    // séance en PRÉPARATION (aucune série faite) → le chargement suivant remplace sans question
    const c2 = await charger(X, 'Deux jours DS', 1);
    const f = await etat(X);
    t('T3 _loadProgDayVraiment : dropset présent et identique (pyramide ↑ comprise)',
      c2 && f.wkt && egal(f.wkt.exs[1].dropset, { paliers: 2, pct: 10, direction: 'up' }) && f.wktDisque && egal(f.wktDisque.exs[1].dropset, { paliers: 2, pct: 10, direction: 'up' }), js(f.wkt && f.wkt.exs));
    t('T3b l\'autre exercice du jour n\'en reçoit pas', f.wkt && !aCle(f.wkt.exs[0], 'dropset'), js(f.wkt && f.wkt.exs[0]));
    await X.cx.close();
  }

  // ── T5 : anciens programmes SANS dropset (un jour et plusieurs jours) + séance sans dropset sauvegardée ──
  {
    const LEG1 = { id: 'l1', name: 'Legacy 1', exs: [ { name: 'Squat', note: 'n', sets: [ { kg: 100, reps: 5, maxi: false, type: 'N', rest: 180 } ] },
      { name: 'Curl biceps haltères', sets: [ { kg: 12, reps: 10, maxi: false, type: 'N', rest: 0 } ], group: 'g1', groupType: 'super' },
      { name: 'Extension triceps poulie', sets: [ { kg: 25, reps: 12, maxi: false, type: 'N', rest: 60 } ], group: 'g1', groupType: 'super' } ] };
    const LEG2 = { id: 'l2', name: 'Legacy 2', days: [ { label: 'A', exs: [ { name: 'Tirage vertical', sets: [ { kg: 50, reps: 10, type: 'N', rest: 90 } ] } ] } ] };
    const X = await ouvrir({ ft4_progs: [LEG1, LEG2], ft4_wkt: { date: '2026-09-28', startHour: 10, exs: [ { name: 'Pompes', sets: [ { kg: 0, reps: 15, type: 'N', done: false, rm1: 0 } ] } ] } });
    await sauver(X, 'Sans DS');
    const s0 = await etat(X);
    const ps = s0.progs.find(x => x.name === 'Sans DS');
    t('T5a séance SANS dropset → programme : aucune clé `dropset` créée', ps && ps.exs.every(e => !aCle(e, 'dropset')), js(ps));
    await charger(X, 'Legacy 1');
    const a = await etat(X);
    t('T5b ancien programme (un jour) : chargement normal, aucune clé `dropset` inventée (mémoire ET disque)',
      a.wkt && a.wkt.exs.length === 3 && a.wkt.exs.every(e => !aCle(e, 'dropset')) && a.wktDisque.exs.every(e => !aCle(e, 'dropset')), js(a.wkt && a.wkt.exs));
    await charger(X, 'Legacy 2', 0);
    const c = await etat(X);
    t('T5c ancien programme (plusieurs jours) : aucune clé `dropset` inventée',
      c.wkt && c.wkt.exs.length === 1 && c.wkt.exs.every(e => !aCle(e, 'dropset')), js(c.wkt && c.wkt.exs));
    await X.cx.close();
  }

  // ── T7 : exercice cumulant dropset + note + repos + maxi + superset → rien d'autre ne bouge ──
  {
    const DS7 = { paliers: 2, pct: 25, direction: 'up', extra: 'x' };
    const W7 = { date: '2026-09-28', startHour: 10, exs: [
      { name: 'Écarté poulie', note: 'étirement', group: 'ssD', groupType: 'super', dropset: DS7, _milo: true, _vmFrom: 'Écarté haltères', seanceWarn: ['ancien avertissement'], sets: [
        { kg: 20, reps: 12, type: 'N', done: false, rm1: 0, rest: 45, note: 'série notée', rir: 2 }, { kg: 25, reps: 0, maxi: true, type: 'N', done: false, rm1: 0, rest: 45 } ] },
      { name: 'Extension triceps poulie', group: 'ssD', groupType: 'super', sets: [ { kg: 25, reps: 15, type: 'N', done: false, rm1: 0, rest: 45 } ] } ] };
    const X = await ouvrir({ ft4_wkt: W7 });
    await sauver(X, 'Combo');
    const e = await etat(X);
    const p = e.progs.find(x => x.name === 'Combo');
    const x0 = p && p.exs[0];
    t('T7a programme : le dropset est AJOUTÉ, rien d\'autre ne change (note, superset, repos, maxi, reps « maxi » → 5 comme avant)',
      x0 && egal(x0, { name: 'Écarté poulie', note: 'étirement', group: 'ssD', groupType: 'super', dropset: DS7,
        sets: [ { kg: 20, reps: 12, maxi: false, type: 'N', rest: 45 }, { kg: 25, reps: 5, maxi: true, type: 'N', rest: 45 } ] }), js(x0));
    t('T7b programme : liste EXACTE des champs (exercices et séries), ordre des exercices et des séries inchangé',
      p && p.exs.length === 2 && p.exs[0].name === 'Écarté poulie' && p.exs[1].name === 'Extension triceps poulie'
      && p.exs.every(ex => clesOk(ex, CLES_EX_PROG, 'dropset') && ex.sets.every(s => clesOk(s, CLES_SET_PROG))), js(p && p.exs.map(Object.keys)));
    t('T7c ⛔ superset + dropset sur le même exercice : les DEUX sont gardés (aucune combinaison interdite)',
      x0 && x0.group === 'ssD' && egal(x0.dropset, DS7) && p.exs[1].group === 'ssD', js(x0));
    await charger(X, 'Combo');
    const f = await etat(X);
    const w0 = f.wkt && f.wkt.exs[0];
    t('T7d séance chargée : mêmes valeurs qu\'avant ML-A + le dropset',
      w0 && w0.note === 'étirement' && w0.group === 'ssD' && w0.groupType === 'super' && egal(w0.dropset, DS7)
      && egal(w0.sets.map(s => [s.kg, s.reps, !!s.maxi, s.type, s.rest, s.done, s.rm1]), [[20, 12, false, 'N', 45, false, 0], [25, 0, true, 'N', 45, false, 0]]), js(w0));
    t('T7e séance chargée : liste EXACTE des champs (exercices et séries), ordre inchangé',
      f.wkt && f.wkt.exs.length === 2 && f.wkt.exs[1].name === 'Extension triceps poulie'
      && f.wkt.exs.every(ex => clesOk(ex, CLES_EX_WKT, 'dropset') && ex.sets.every(s => clesOk(s, CLES_SET_WKT))), js(f.wkt && f.wkt.exs.map(Object.keys)));
    // dropset présent mais nul : présent → gardé tel quel (on ne le transforme ni en absence, ni en valeur)
    const n = await X.pg.evaluate(() => { const o = {}; _recopierDropset({ dropset: null }, o); const v = {}; _recopierDropset({}, v);
      return { nulGarde: Object.prototype.hasOwnProperty.call(o, 'dropset') && o.dropset === null, absentReste: !Object.prototype.hasOwnProperty.call(v, 'dropset') }; });
    t('T8b présent (même `null`) → recopié tel quel ; absent → reste absent', n.nulGarde && n.absentReste, js(n));
    await X.cx.close();
  }
};
