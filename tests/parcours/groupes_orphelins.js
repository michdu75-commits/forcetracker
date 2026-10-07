/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🧩 LOT 6 / ML-B — UN GROUPEMENT D'EXERCICES NE RESTE PLUS ACTIF AVEC MOINS DE DEUX MEMBRES
   session-B · 29/09/2026

   Mesuré AVANT correction (sonde locale sur master 2f10ae40, ft-v1242) : « ↩ Retirer » sur un
   superset de 2 laissait le survivant seul dans son groupe (`removeFromGroup` testait
   `left.length<1`, jamais vrai) → l'écran affichait « ⚡ Circuit (1) », valider une série annonçait
   « ⚡ Tour suivant », et l'orphelin était écrit dans ft4_wkt puis relu au rechargement. Même chose
   au bout d'une chaîne 3 → 2 → 1. « 🗑️ Supprimer l'exercice » (`rmEx`) dissolvait bien le groupe,
   mais laissait `groupType` sur le survivant.
   Correctif : un seul propriétaire de la règle pour la séance, `_dissoudreGroupeOrphelin(exs,gid)`
   (log.js), appelé par `removeFromGroup` et `rmEx` : à 0 ou 1 membre, le groupe `gid` est dissous,
   et on ne retire QUE `group` et `groupType`.

   Ce que les témoins CONDUISENT : l'onglet Séance, le tap sur un exercice replié d'un groupe, le
   bouton « ↩ Retirer », le menu « ⋯ » et le maintien sur « Supprimer l'exercice » puis la vraie
   fenêtre de confirmation, la case ✓ d'une série, « 💾 Sauvegarder comme programme », « ▶ Charger »,
   un VRAI rechargement.
   ⚠️ T5 (exercice non groupé) APPELLE `removeFromGroup` : l'écran n'offre pas « ↩ Retirer » hors
   groupe — c'est vérifié d'abord, puis la fonction est appelée pour prouver qu'elle ne fait rien.
   Frontières simulées : Apps Script et Worker (aucun appel réel, aucun appel Milo).
   Ce qu'ils OBSERVENT : S.wkt et ft4_wkt, l'état AVANT/APRÈS de chaque exercice (égalité stricte,
   seules les clés `group`/`groupType` des membres concernés peuvent disparaître — séries, charges,
   repos, note, maxi, dropset, done, rir, horodatage et champs inconnus compris), l'ordre des
   exercices et des séries, les identifiants des autres groupes, les libellés affichés
   (Super Set / Tri-set / Circuit (N)), et le repos annoncé après une série validée.
   Ce qu'ils NE COUVRENT PAS : l'éditeur de programme (`_rebuildProgGroups`, `_normalizeProgGroups`),
   les supersets non contigus, `createSupersetFrom` abandonné (chemin de CRÉATION, hors ML-B —
   mesuré : il laisse encore un groupe à 1 membre), les `groupType` drop/pyramide (aucun écrivain),
   le dropset, Milo, l'import, le cloud.
   Banc : tools/banc_ml_b.js · contrôle négatif : tools/mut_ml_b.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const canon = v => Array.isArray(v) ? '[' + v.map(canon).join(',') + ']'
  : (v && typeof v === 'object') ? '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}'
  : JSON.stringify(v);
const egal = (a, b) => canon(a) === canon(b);
const aCle = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);
const sansGroupe = e => { const c = JSON.parse(JSON.stringify(e)); delete c.group; delete c.groupType; return c; };
// Nombre de membres par identifiant de groupe.
const tailles = exs => { const n = {}; (exs || []).forEach(e => { if (e && e.group) n[e.group] = (n[e.group] || 0) + 1; }); return n; };
const orphelins = exs => Object.entries(tailles(exs)).filter(([, v]) => v < 2).map(([k]) => k);

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-CDIV (session-B). LOT 6 / ML-B — un seul propriétaire de la dissolution d\'un groupe orphelin (source) ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const lo = nu('log.js');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? undefined : j); };
  const aide = corps(lo, '_dissoudreGroupeOrphelin'), rfg = corps(lo, 'removeFromGroup'), rme = corps(lo, 'rmEx');
  t('① les fonctions sont trouvées (sinon les témoins suivants ne mesurent rien)', aide && rfg && rme, [aide, rfg, rme].map(x => x.length).join('/'));
  const tout = ['log.js', 'state.js', 'coach.js', 'setup.js', 'app.js', 'tracking.js', 'screens.js'].map(nu).join('\n');
  t('② UN seul propriétaire : `_dissoudreGroupeOrphelin` est déclarée une fois, dans log.js',
    (tout.match(/function _dissoudreGroupeOrphelin\(/g) || []).length === 1 && /function _dissoudreGroupeOrphelin\(/.test(lo), '');
  const appels = (tout.match(/_dissoudreGroupeOrphelin\(/g) || []).length - 1;
  t('③ les DEUX chemins de retrait l\'appellent, une fois chacun (removeFromGroup · rmEx), et personne d\'autre',
    (rfg.match(/_dissoudreGroupeOrphelin\(/g) || []).length === 1 && (rme.match(/_dissoudreGroupeOrphelin\(/g) || []).length === 1 && appels === 2,
    'appels=' + appels);
  t('④ l\'ancienne condition morte `left.length<1` a disparu du code (hors commentaires)', !/left\.length\s*<\s*1/.test(lo), '');
  t('⑤ non-destruction : l\'aide ne retire que `group` et `groupType`, sans reconstruire d\'objet',
    /delete e\.group;\s*delete e\.groupType;/.test(aide) && !/delete e\.(?!group\b|groupType\b)/.test(aide)
    && !/JSON\.parse|Object\.assign|\.map\(|=\s*\{/.test(aide), aide.slice(0, 220));
  t('⑥ ⛔ hors périmètre : ni `_rebuildProgGroups`, ni `_normalizeProgGroups`, ni `applyDropset`, ni `createSupersetFrom` n\'appellent l\'aide',
    ['_rebuildProgGroups', '_normalizeProgGroups', 'applyDropset', 'createSupersetFrom'].every(f => corps(lo, f) && !/_dissoudreGroupeOrphelin/.test(corps(lo, f))), '');
};

// Outils communs aux blocs écran B-CDV et B-CDVII (mêmes frontières simulées, mêmes clics conduits).
function outils(b, PORT) {
  const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
  const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 't@t.t',
    ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_lms: moisPrec, ft4_ok: '1', ft4_stmig1: '1' };
  const js = x => JSON.stringify(x).slice(0, 260);
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
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_mlb'))return; sessionStorage.setItem('_mlb','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); }catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    return X;
  };
  const GARDER = /mod-prog|mod-ex|ov-ex-menu|ov-confirm|ov-day-sel/;
  const fermerAutres = pg => pg.evaluate(g => document.querySelectorAll('.overlay.open').forEach(o => { if (!new RegExp(g).test(o.id)) o.classList.remove('open'); }), GARDER.source);
  const clic = async (pg, sel, txt) => {
    for (let k = 0; k < 8; k++) {
      await fermerAutres(pg);
      const h = (await pg.evaluateHandle(([s, x]) => [...document.querySelectorAll(s)].find(e => e.offsetParent !== null && (!x || e.textContent.includes(x))) || null, [sel, txt])).asElement();
      if (!h) { await pg.waitForTimeout(250); continue; }
      try { await h.evaluate(x => x.scrollIntoView({ block: 'center' })); await h.click({ timeout: 3000 }); await pg.waitForTimeout(250); return true; } catch (e) { await pg.waitForTimeout(200); }
    }
    return false;
  };
  const allerSeance = async X => { await clic(X.pg, '#nb-log'); await X.pg.waitForTimeout(400); };
  const recharger = async X => { await X.pg.reload(); await X.pg.waitForTimeout(1500); };
  const etat = X => X.pg.evaluate(() => ({ wkt: S.wkt ? JSON.parse(JSON.stringify(S.wkt)) : null, disque: JSON.parse(localStorage.getItem('ft4_wkt') || 'null'),
    progs: JSON.parse(JSON.stringify(S.programmes || [])) }));
  const idx = (X, nom) => X.pg.evaluate(n => S.wkt.exs.findIndex(e => e.name === n), nom);
  // Libellés de groupe réellement affichés (en-têtes des blocs `.ss-group`).
  const libelles = X => X.pg.evaluate(() => [...document.querySelectorAll('#wkt-exs .ss-grp-hdr span')].map(s => s.textContent.trim()).filter(s => /Super Set|Tri-set|Circuit \(/.test(s)));
  // Conduit « ↩ Retirer » : déplie le membre (tap sur son bloc replié), puis tape le bouton de CE membre.
  const retirer = async (X, nom) => {
    await allerSeance(X);
    const i = await idx(X, nom); if (i < 0) return false;
    const deplie = await X.pg.evaluate(k => _expandedEx === k || S.expandAll, i) || await clic(X.pg, '#ex-block-' + i);
    return deplie && await clic(X.pg, '[onclick="removeFromGroup(' + i + ')"]');
  };
  // Conduit « 🗑️ Supprimer l'exercice » : ⋯ → maintien 500 ms sur la ligne rouge → vraie confirmation.
  const supprimer = async (X, nom) => {
    await allerSeance(X);
    const i = await idx(X, nom); if (i < 0) return false;
    if (!(await X.pg.evaluate(k => _expandedEx === k || S.expandAll, i))) await clic(X.pg, '#ex-block-' + i);
    const m = await clic(X.pg, '#ex-block-' + i + ' button[onclick^="openExMenu(' + i + ',"]');
    const h = (await X.pg.evaluateHandle(() => [...document.querySelectorAll('#ov-ex-menu button')].find(x => /Supprimer l'exercice/.test(x.textContent)) || null)).asElement();
    if (!m || !h) return false;
    const bx = await h.boundingBox(); if (!bx) return false;
    await X.pg.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await X.pg.mouse.down(); await X.pg.waitForTimeout(550); await X.pg.mouse.up();
    await X.pg.waitForTimeout(200);
    return await clic(X.pg, '#confirm-ok');
  };
  // Seules les clés de groupe des noms listés peuvent avoir disparu ; tout le reste est STRICTEMENT identique.
  const seulGroupeRetire = (av, ap, noms) => av.length === ap.length && av.every((e, k) =>
    noms.includes(e.name) ? egal(ap[k], sansGroupe(e)) : egal(ap[k], e));

  return { ouvrir, clic, fermerAutres, allerSeance, recharger, etat, idx, libelles, retirer, supprimer, seulGroupeRetire, js };
}

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CDV (session-B). LOT 6 / ML-B — un groupe ne reste jamais actif à moins de deux membres (écran) ═══');
  const { ouvrir, clic, fermerAutres, allerSeance, recharger, etat, idx, libelles, retirer, supprimer, seulGroupeRetire, js } = outils(b, PORT);

  const S0 = (n, extra) => Object.assign({ kg: 40 + n, reps: 10, type: 'N', done: false, rm1: 0 }, extra || {});
  const DS = { paliers: 3, pct: 20, direction: 'down', _futur: { v: 2 } };
  const WKT = () => ({ date: '2026-09-29', startHour: 10, exs: [
    // G1 — superset de 2. Le survivant (Développé couché) est RICHE : dropset, note, repos, maxi, séries faites, champ inconnu.
    { name: 'Développé couché', note: 'coudes serrés', group: 'ssA', groupType: 'super', dropset: DS, _futur: { cle: 'à garder', n: [1, 2] },
      sets: [S0(0, { done: true, rm1: 53.3, rir: 2, at: 30, rest: 120 }), S0(1, { rest: 90, _serieFuture: 'x' }), S0(2, { maxi: true, type: 'X', reps: 0 })] },
    { name: 'Rowing barre', group: 'ssA', groupType: 'super', sets: [S0(3, { rest: 60 }), S0(4)] },
    // exercice non groupé
    { name: 'Squat', note: 'profond', sets: [S0(5, { rest: 180 })] },
    // G2 — circuit de 4
    { name: 'Curl biceps', group: 'ssB', groupType: 'super', sets: [S0(6), S0(7)] },
    { name: 'Extension triceps poulie', group: 'ssB', groupType: 'super', sets: [S0(8), S0(9)] },
    { name: 'Élévations latérales', group: 'ssB', groupType: 'super', sets: [S0(10), S0(11)] },
    { name: 'Crunch', group: 'ssB', groupType: 'super', sets: [S0(12), S0(13)] },
    // G3 — superset de 2, jamais touché
    { name: 'Leg curl', group: 'ssC', groupType: 'super', sets: [S0(14)] },
    { name: 'Mollets debout', group: 'ssC', groupType: 'super', note: 'lent', sets: [S0(15)] } ] });

  // ── T1 · T4 · T6 · T7 · T8 : superset de 2 → « ↩ Retirer » → rechargement → programme ─────────────
  {
    const X = await ouvrir({ ft4_wkt: WKT() });
    await allerSeance(X);
    const av = await etat(X);
    t('T0 point de départ : trois groupes (2 · 4 · 2), aucun orphelin, libellés Super Set / Circuit (4) / Super Set',
      egal(tailles(av.wkt.exs), { ssA: 2, ssB: 4, ssC: 2 }) && egal(await libelles(X), ['⚡ Super Set', '⚡ Circuit (4)', '⚡ Super Set']), js(await libelles(X)));
    const ok = await retirer(X, 'Rowing barre');
    const ap = await etat(X);
    t('T1a « ↩ Retirer » dans un superset de 2 : le groupe est DISSOUS (plus aucun membre ssA, en mémoire ET sur le disque)',
      ok && !ap.wkt.exs.some(e => e.group === 'ssA') && !ap.disque.exs.some(e => e.group === 'ssA'), js(ap.wkt.exs.map(e => [e.name, e.group || '-'])));
    t('T1b les 2 exercices sont toujours là (9 exercices, mêmes noms)',
      ap.wkt.exs.length === 9 && ['Développé couché', 'Rowing barre'].every(n => ap.wkt.exs.some(e => e.name === n)), ap.wkt.exs.length);
    const surv = ap.wkt.exs.find(e => e.name === 'Développé couché'), ret = ap.wkt.exs.find(e => e.name === 'Rowing barre');
    t('T1c le membre RESTANT est nettoyé : ni `group` ni `groupType`', surv && !aCle(surv, 'group') && !aCle(surv, 'groupType'), js(surv));
    t('T1d le membre RETIRÉ est hors groupe : ni `group` ni `groupType`', ret && !aCle(ret, 'group') && !aCle(ret, 'groupType'), js(ret));
    t('T4 membre restant riche : SEULES les clés de groupe ont disparu (dropset, note, repos, maxi, séries faites, rir, horodatage, champs inconnus intacts)',
      surv && egal(surv, sansGroupe(av.wkt.exs[0])) && egal(surv.dropset, DS) && surv._futur && surv.sets[1]._serieFuture === 'x', js(surv));
    t('T6 les AUTRES groupes sont strictement inchangés (membres, identifiants, types, données)',
      seulGroupeRetire(av.wkt.exs, ap.wkt.exs, ['Développé couché', 'Rowing barre']) && egal(tailles(ap.wkt.exs), { ssB: 4, ssC: 2 }), js(tailles(ap.wkt.exs)));
    t('T7 ordre inchangé : exercices et séries dans le même ordre',
      egal(ap.wkt.exs.map(e => e.name), av.wkt.exs.map(e => e.name)) && ap.wkt.exs.every((e, k) => egal(e.sets, av.wkt.exs[k].sets)), js(ap.wkt.exs.map(e => e.name)));
    t('T1e l\'écran n\'affiche plus de groupe à 1 membre (« Circuit (1) » absent) ; les deux autres groupes restent affichés',
      egal(await libelles(X), ['⚡ Circuit (4)', '⚡ Super Set']), js(await libelles(X)));
    await recharger(X);
    const r = await etat(X);
    t('T8a après un VRAI rechargement : aucun groupe à moins de 2 membres ne réapparaît (mémoire ET ft4_wkt)',
      orphelins(r.wkt.exs).length === 0 && orphelins(r.disque.exs).length === 0 && egal(tailles(r.wkt.exs), { ssB: 4, ssC: 2 }), js(tailles(r.wkt.exs)));
    t('T8b … et le survivant rechargé est identique à celui d\'avant le rechargement', egal(r.wkt.exs.find(e => e.name === 'Développé couché'), surv), '');
    // Même garantie en passant par un programme : sauvegarde → rechargement → « ▶ Charger ».
    await allerSeance(X);
    const a = await clic(X.pg, 'button[onclick="openProgModal()"]');
    await X.pg.fill('#prog-name-inp', 'Prog ML-B');
    const s = await clic(X.pg, '#prog-save-section button', 'Sauvegarder comme programme');
    await X.pg.evaluate(() => { const m = document.getElementById('mod-prog'); if (m) m.classList.remove('open'); });
    await recharger(X); await allerSeance(X);
    await clic(X.pg, 'button[onclick="openProgModal()"]');
    const pi = await X.pg.evaluate(() => (S.programmes || []).findIndex(p => p.name === 'Prog ML-B'));
    /* LOT 1 IMPORT PROGRAMME (07/10/2026) : les boutons de programme visent l'ID (`loadProg("p…")`), plus l'index —
       le sélecteur littéral `loadProg(N)` ne trouvait plus rien. Même bouton, même garantie, visé par l'id. */
    const pidB = await X.pg.evaluate(k => (S.programmes[k] || {}).id || '', pi);
    const ch = await clic(X.pg, '[onclick=\'loadProg("' + pidB + '")\']');
    await X.pg.waitForTimeout(300);
    const pc = await etat(X);
    const prog = pc.progs.find(p => p.name === 'Prog ML-B');
    t('T8c sauvegardé en programme puis rechargé et chargé : aucun groupe à 1 membre, les groupes intacts gardent leurs membres',
      a && s && ch && prog && orphelins(prog.exs).length === 0 && orphelins(pc.wkt.exs).length === 0
      && Object.values(tailles(pc.wkt.exs)).sort().join(',') === '2,4', js(pc.wkt && tailles(pc.wkt.exs)));
    t('T8d aucune erreur de page, aucun appel Milo', X.errs.length === 0 && X.milo === 0, X.errs.join(' | ').slice(0, 200) + ' milo=' + X.milo);
    await X.cx.close();
  }

  // ── T2 · T3 · types : circuit de 4 → retrait → 3 (Tri-set) → retrait → 2 (Super Set) → retrait → dissous ─
  {
    const X = await ouvrir({ ft4_wkt: WKT() });
    await allerSeance(X);
    const av = await etat(X);
    const o1 = await retirer(X, 'Crunch');
    const e1 = await etat(X);
    t('T2·circuit 4 → 3 : groupe CONSERVÉ, même identifiant et même type, libellé « Tri-set »',
      o1 && tailles(e1.wkt.exs).ssB === 3 && e1.wkt.exs.filter(e => e.group === 'ssB').every(e => e.groupType === 'super')
      && egal(await libelles(X), ['⚡ Super Set', '⚡ Tri-set', '⚡ Super Set']), js(await libelles(X)));
    const o2 = await retirer(X, 'Élévations latérales');
    const e2 = await etat(X);
    t('T2 tri-set 3 → 2 : groupe CONSERVÉ à 2 membres, identifiant `ssB` et type `super` gardés, libellé « Super Set »',
      o2 && tailles(e2.wkt.exs).ssB === 2 && e2.wkt.exs.filter(e => e.group === 'ssB').map(e => e.name).join('|') === 'Curl biceps|Extension triceps poulie'
      && e2.wkt.exs.filter(e => e.group === 'ssB').every(e => e.groupType === 'super') && e2.disque.exs.filter(e => e.group === 'ssB').length === 2,
      js(e2.wkt.exs.map(e => [e.name, e.group || '-'])));
    t('T2b données intactes après les deux retraits (seules les clés de groupe des deux retirés ont disparu)',
      seulGroupeRetire(av.wkt.exs, e2.wkt.exs, ['Crunch', 'Élévations latérales']), '');
    const o3 = await retirer(X, 'Extension triceps poulie');
    const e3 = await etat(X);
    t('T3 2 → 1 : le groupe est DISSOUS, le survivant (Curl biceps) nettoyé, en mémoire ET sur le disque',
      o3 && !e3.wkt.exs.some(e => e.group === 'ssB') && !e3.disque.exs.some(e => e.group === 'ssB')
      && !aCle(e3.wkt.exs.find(e => e.name === 'Curl biceps'), 'groupType'), js(e3.wkt.exs.map(e => [e.name, e.group || '-', e.groupType || '-'])));
    t('T3b toute la chaîne : données, ordre et autres groupes intacts',
      seulGroupeRetire(av.wkt.exs, e3.wkt.exs, ['Curl biceps', 'Extension triceps poulie', 'Élévations latérales', 'Crunch'])
      && egal(tailles(e3.wkt.exs), { ssA: 2, ssC: 2 }), js(tailles(e3.wkt.exs)));
    t('T3c l\'écran n\'a jamais montré « Circuit (1) » : il reste deux « Super Set »', egal(await libelles(X), ['⚡ Super Set', '⚡ Super Set']), js(await libelles(X)));
    // UTILISABLE : le survivant se comporte comme un exercice seul — valider une série n'annonce plus « ⚡ Tour suivant ».
    const ci = await idx(X, 'Curl biceps');
    await X.pg.evaluate(k => { _expandedEx = k; renderExBlocks(); }, ci);
    const coche = await clic(X.pg, '[onclick="toggleSet(' + ci + ',0)"]');
    await fermerAutres(X.pg);
    const rep = await X.pg.evaluate(() => { const b = document.getElementById('rest-bar'), l = document.getElementById('rest-label');
      return { vu: !!(b && b.classList.contains('show')), lbl: l ? l.textContent : '' }; });
    t('T3d utilisable : une série validée sur le survivant ouvre un repos ORDINAIRE, sans « ⚡ Tour suivant »',
      coche && rep.vu && !/Tour suivant/.test(rep.lbl), 'coche=' + coche + ' ' + js(rep));
    t('T3e aucune erreur de page, aucun appel Milo', X.errs.length === 0 && X.milo === 0, X.errs.join(' | ').slice(0, 200));
    await X.cx.close();
  }

  // ── rmEx : « 🗑️ Supprimer l'exercice » dans un superset de 2 puis dans un groupe de 3 ─────────────
  {
    const seed = WKT(); seed.exs.splice(6, 1);            // G2 devient un tri-set (Crunch retiré de la graine)
    const X = await ouvrir({ ft4_wkt: seed });
    await allerSeance(X);
    const av = await etat(X);
    const o1 = await supprimer(X, 'Rowing barre');
    const e1 = await etat(X);
    const surv = e1.wkt.exs.find(e => e.name === 'Développé couché');
    t('T1·rmEx supprimer un membre d\'un superset de 2 : l\'exercice part, le groupe est dissous, le survivant n\'a plus NI `group` NI `groupType`',
      o1 && e1.wkt.exs.length === av.wkt.exs.length - 1 && !e1.wkt.exs.some(e => e.name === 'Rowing barre')
      && surv && !aCle(surv, 'group') && !aCle(surv, 'groupType') && !e1.disque.exs.some(e => e.group === 'ssA' || (e.name === 'Développé couché' && aCle(e, 'groupType'))),
      js(surv));
    const avSans = av.wkt.exs.filter(e => e.name !== 'Rowing barre');
    t('T4·rmEx survivant riche intact, les autres exercices strictement identiques, dans le même ordre',
      seulGroupeRetire(avSans, e1.wkt.exs, ['Développé couché']), js(e1.wkt.exs.map(e => e.name)));
    const o2 = await supprimer(X, 'Élévations latérales');
    const e2 = await etat(X);
    t('T2·rmEx supprimer un membre d\'un tri-set : groupe CONSERVÉ à 2, même identifiant, `groupType` gardé',
      o2 && tailles(e2.wkt.exs).ssB === 2 && e2.wkt.exs.filter(e => e.group === 'ssB').every(e => e.groupType === 'super')
      && egal(await libelles(X), ['⚡ Super Set', '⚡ Super Set']), js(await libelles(X)));
    await recharger(X);
    const r = await etat(X);
    t('T8·rmEx après rechargement : aucun orphelin, rien n\'est revenu', orphelins(r.wkt.exs).length === 0 && egal(tailles(r.wkt.exs), { ssB: 2, ssC: 2 }), js(tailles(r.wkt.exs)));
    t('T8·rmEx aucune erreur de page', X.errs.length === 0, X.errs.join(' | ').slice(0, 200));
    await X.cx.close();
  }

  // ── T5 : exercice non groupé → aucun effet ─────────────────────────────────────────────────────────
  {
    const X = await ouvrir({ ft4_wkt: WKT() });
    await allerSeance(X);
    const si = await idx(X, 'Squat');
    await X.pg.evaluate(k => { _expandedEx = k; renderExBlocks(); }, si);
    const bouton = await X.pg.evaluate(k => !!document.querySelector('[onclick="removeFromGroup(' + k + ')"]'), si);
    const av = await etat(X);
    await X.pg.evaluate(k => removeFromGroup(k), si);
    const ap = await etat(X);
    t('T5 exercice non groupé : l\'écran n\'offre pas « ↩ Retirer », et l\'appel direct ne change RIEN (séance strictement identique)',
      !bouton && egal(ap.wkt, av.wkt) && egal(ap.disque, av.disque), 'bouton=' + bouton);
    await X.cx.close();
  }
};

/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🧩 LOT 6 / ML-B — EXTENSION : ANNULER LA CRÉATION D'UN GROUPE NE LAISSE RIEN (29/09/2026)
   Mesuré avant : le tap sur « ⚡ Super » (`createSupersetFrom`) écrivait `group`/`groupType` sur
   l'exercice et les ENREGISTRAIT avant d'ouvrir le sélecteur. « Fermer », le retour arrière ou
   l'app quittée pendant le choix laissaient un groupe à 1 membre (« ⚡ Circuit (1) »), relu au
   rechargement : `closeExPicker` ne connaît pas le mode `addToGroup`.
   Correctif : rien n'est écrit au tap ; l'exercice attend dans `_superSource`, et le groupe naît
   dans `_doAddToGroup`, quand le 2ᵉ membre est réellement choisi.
   CONDUIT : « ⚡ Super », le sélecteur `#mod-ex`, son bouton « Fermer », le retour arrière
   (`history.back()` → le vrai `popstate` de l'app), la recherche et le choix d'un exercice,
   « ⚡ Grouper » + sélection + « Lier », le menu « ⋯ » → « Superset avec l'exercice du dessus »,
   « + Exo », un VRAI rechargement (y compris pendant le choix).
   ⚠️ C2·dropset APPELLE `createSupersetFrom` : l'écran n'offre pas « ⚡ Super » sur un exercice à
   dropset — c'est vérifié d'abord.
   NE COUVRE PAS : « + Exo » sur un groupe existant (mesuré : il n'ajoute PAS au groupe, défaut
   distinct, hors ML-B — le témoin C3b ne fige pas ce comportement), les anciens orphelins déjà
   enregistrés (aucune migration), l'éditeur de programme.
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.sourceCreation = function (t, ROOT, fs, path) {
  console.log('\n═══ B-CDVI (session-B). LOT 6 / ML-B — une création de groupe n\'est validée qu\'à deux membres liés (source) ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const lo = nu('log.js');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? undefined : j); };
  const csf = corps(lo, 'createSupersetFrom'), dag = corps(lo, '_doAddToGroup');
  t('① les fonctions sont trouvées', csf && dag, csf.length + '/' + dag.length);
  t('② le tap sur « ⚡ Super » n\'écrit RIEN : ni `group`, ni `groupType`, ni enregistrement',
    !/\.group\s*=|\.groupType\s*=|persist\(/.test(csf), csf.slice(0, 220));
  t('③ le groupe naît dans `_doAddToGroup`, qui lie la source ET le nouveau membre', /src\.group=gid;src\.groupType='super';/.test(dag), dag.slice(0, 260));
  t('④ aucune seconde règle d\'invariant : `_dissoudreGroupeOrphelin` reste appelée par les 2 chemins de retrait seulement',
    !/_dissoudreGroupeOrphelin/.test(csf + dag), '');
};

module.exports.creation = async function (t, b, PORT) {
  console.log('\n═══ B-CDVII (session-B). LOT 6 / ML-B — « ⚡ Super » abandonné ne laisse aucun groupe (écran) ═══');
  const { ouvrir, clic, allerSeance, recharger, etat, idx, libelles, js } = outils(b, PORT);
  const canonE = e => JSON.stringify(Object.keys(e).sort().reduce((o, k) => (o[k] = e[k], o), {}));
  const S0 = (n, extra) => Object.assign({ kg: 50 + n, reps: 8, type: 'N', done: false, rm1: 0 }, extra || {});
  const DS = { paliers: 3, pct: 20, direction: 'down', _futur: { v: 3 } };
  const WKT = () => ({ date: '2026-09-29', startHour: 10, exs: [
    { name: 'Squat', note: 'profond', _futur: { cle: 'à garder' },
      sets: [S0(0, { done: true, rm1: 58, rir: 2, at: 40, rest: 180 }), S0(1, { rest: 150, _serieFuture: 'x' }), S0(2, { maxi: true, type: 'X', reps: 0 })] },
    { name: 'Curl biceps', group: 'ssG', groupType: 'super', sets: [S0(3)] },
    { name: 'Crunch', group: 'ssG', groupType: 'super', sets: [S0(4)] },
    { name: 'Rowing barre', sets: [S0(5, { rest: 90 })] },
    { name: 'Presse à cuisses', dropset: DS, note: 'dropset', sets: [S0(6), S0(7), S0(8)] },
    { name: 'Élévations latérales', sets: [S0(9)] } ] });
  const orph = exs => { const n = {}; exs.forEach(e => { if (e.group) n[e.group] = (n[e.group] || 0) + 1; }); return Object.keys(n).filter(k => n[k] < 2); };
  const superSur = async (X, nom) => { await allerSeance(X); const i = await idx(X, nom); return i >= 0 && await clic(X.pg, 'button[onclick="createSupersetFrom(' + i + ')"]'); };
  const pickerOuvert = X => X.pg.evaluate(() => document.getElementById('mod-ex').classList.contains('open') && _exPickerMode === 'addToGroup');
  const choisir = async (X, q, txt) => { await X.pg.fill('#ex-search', q); await X.pg.waitForTimeout(250); return clic(X.pg, '#ex-list .ex-pick', txt); };

  // ── C1 · C2 · C5 : « ⚡ Super » puis « Fermer » ─────────────────────────────────────────────────
  {
    const X = await ouvrir({ ft4_wkt: WKT() });
    await allerSeance(X);
    const av = await etat(X);
    const s = await superSur(X, 'Squat');
    const pendant = await etat(X);
    t('C0 « ⚡ Super » ouvre le sélecteur du partenaire (témoin de départ)', s && await pickerOuvert(X), 's=' + s);
    t('C1a PENDANT le choix, rien n\'est écrit : ni en mémoire ni sur le disque',
      !aCle(pendant.wkt.exs[0], 'group') && !aCle(pendant.wkt.exs[0], 'groupType') && !aCle(pendant.disque.exs[0], 'group') && !aCle(pendant.disque.exs[0], 'groupType'), js(pendant.disque.exs[0]));
    const f = await clic(X.pg, '#mod-ex .modal-btns button', 'Fermer');
    await X.pg.evaluate(() => renderExBlocks());
    const ap = await etat(X);
    t('C1 « Fermer » : l\'exercice n\'a ni `group` ni `groupType`, aucun groupe à 1 membre (mémoire ET disque)',
      f && !aCle(ap.wkt.exs[0], 'group') && !aCle(ap.wkt.exs[0], 'groupType') && orph(ap.wkt.exs).length === 0 && orph(ap.disque.exs).length === 0, js(ap.wkt.exs[0]));
    t('C1b l\'écran n\'affiche pas « Circuit (1) » : seul le groupe existant reste affiché', egal(await libelles(X), ['⚡ Super Set']), js(await libelles(X)));
    t('C2 exercice riche : STRICTEMENT identique (séries, charges, reps, repos, note, maxi, faite, rir, horodatage, champs inconnus)',
      egal(ap.wkt.exs[0], av.wkt.exs[0]) && egal(ap.disque.exs[0], av.disque.exs[0]), js(ap.wkt.exs[0]));
    t('C5 l\'autre groupe et tous les autres exercices sont strictement inchangés, dans le même ordre', egal(ap.wkt, av.wkt) && egal(ap.disque, av.disque), '');
    // après l'abandon, un ajout ORDINAIRE reste un exercice seul
    const add = await clic(X.pg, 'button[onclick="openExPicker()"]') || await X.pg.evaluate(() => { openExPicker(); return true; });
    const ch = await choisir(X, 'Tirage', 'Tirage');
    await X.pg.evaluate(() => closeExPicker());
    const e2 = await etat(X);
    const nouveau = e2.wkt.exs[e2.wkt.exs.length - 1];
    t('C1c après l\'abandon, un ajout ordinaire reste un exercice SEUL, et l\'exercice abandonné aussi',
      add && ch && e2.wkt.exs.length === av.wkt.exs.length + 1 && !aCle(nouveau, 'group') && !aCle(e2.wkt.exs[0], 'group') && orph(e2.wkt.exs).length === 0, js(nouveau));
    t('C1d aucune erreur de page, aucun appel Milo', X.errs.length === 0 && X.milo === 0, X.errs.join(' | ').slice(0, 200));
    await X.cx.close();
  }

  // ── C1·retour · C6 : retour arrière, puis rechargement ; et app quittée PENDANT le choix ─────────
  {
    const X = await ouvrir({ ft4_wkt: WKT() });
    await allerSeance(X);
    const av = await etat(X);
    const s = await superSur(X, 'Rowing barre');
    await X.pg.evaluate(() => history.back()); await X.pg.waitForTimeout(400);
    const ferme = await X.pg.evaluate(() => !document.getElementById('mod-ex').classList.contains('open'));
    const ap = await etat(X);
    t('C1·retour le retour arrière ferme le sélecteur et ne laisse aucun groupe (Rowing barre intact)',
      s && ferme && egal(ap.wkt, av.wkt) && egal(ap.disque, av.disque), 'ferme=' + ferme + ' ' + js(ap.wkt.exs[3]));
    await recharger(X);
    const r = await etat(X);
    t('C6a abandon PUIS rechargement : aucun groupe à 1 membre ne réapparaît, la séance est identique', egal(r.wkt.exs, av.wkt.exs) && orph(r.disque.exs).length === 0, '');
    const s2 = await superSur(X, 'Élévations latérales');
    await recharger(X);
    const r2 = await etat(X);
    t('C6b app quittée PENDANT le choix (rechargement) : rien n\'a été enregistré, aucun groupe à 1 membre',
      s2 && orph(r2.wkt.exs).length === 0 && orph(r2.disque.exs).length === 0 && egal(r2.disque.exs, av.disque.exs), js(r2.disque.exs.map(e => [e.name, e.group || '-'])));
    await allerSeance(X);
    t('C6c … et l\'écran rechargé n\'affiche aucun « Circuit (1) »', egal(await libelles(X), ['⚡ Super Set']), js(await libelles(X)));
    await X.cx.close();
  }

  // ── C3 : création normale d'un superset de 2 (et après un abandon, et après « + Exo ») ─────────
  {
    const X = await ouvrir({ ft4_wkt: WKT() });
    await allerSeance(X);
    const av = await etat(X);
    // un abandon d'abord : il ne doit pas polluer la création suivante
    await superSur(X, 'Squat'); await clic(X.pg, '#mod-ex .modal-btns button', 'Fermer');
    const s = await superSur(X, 'Rowing barre');
    const ch = await choisir(X, 'Tirage', 'Tirage');
    await X.pg.waitForTimeout(300);
    const ap = await etat(X);
    const ri = ap.wkt.exs.findIndex(e => e.name === 'Rowing barre'), row = ap.wkt.exs[ri], part = ap.wkt.exs[ri + 1];
    t('C3 « ⚡ Super » + choix : un superset de 2, même identifiant, type `super`, le partenaire juste après la source',
      s && ch && row && part && row.group && row.group === part.group && row.groupType === 'super' && part.groupType === 'super'
      && ap.wkt.exs.filter(e => e.group === row.group).length === 2 && !/^ssG$/.test(row.group), js([row, part]));
    t('C3b la source n\'a perdu que… rien : seules les clés de groupe ont été AJOUTÉES',
      row && egal(Object.assign({}, av.wkt.exs[3], { group: row.group, groupType: 'super' }), row), js(row));
    t('C3c l\'exercice abandonné avant (Squat) n\'est pas entré dans le groupe, l\'autre groupe est inchangé',
      !aCle(ap.wkt.exs[0], 'group') && egal(ap.wkt.exs.filter(e => e.group === 'ssG'), av.wkt.exs.filter(e => e.group === 'ssG')), '');
    t('C3d l\'écran affiche deux « Super Set », aucun « Circuit (1) »', egal((await libelles(X)).sort(), ['⚡ Super Set', '⚡ Super Set']), js(await libelles(X)));
    await recharger(X);
    const r = await etat(X);
    t('C3e après rechargement, le nouveau superset est toujours là à 2 membres', r.wkt.exs.filter(e => row && e.group === row.group).length === 2 && orph(r.disque.exs).length === 0, '');
    // « + Exo » sur le groupe existant (défaut distinct : il n'ajoute pas au groupe) puis « ⚡ Super » : la paire se crée toujours correctement
    await allerSeance(X);
    const avE = await etat(X);
    await clic(X.pg, 'button[onclick="addToGroup(\'ssG\')"]');
    await choisir(X, 'Crunch', 'Crunch'); await X.pg.evaluate(() => closeExPicker());
    const mid = await etat(X);
    const s3 = await superSur(X, 'Élévations latérales');
    const ch3 = await choisir(X, 'Face pull', 'Face');
    await X.pg.waitForTimeout(300);
    const fin = await etat(X);
    const ei = fin.wkt.exs.findIndex(e => e.name === 'Élévations latérales'), el = fin.wkt.exs[ei];
    t('C3f après « + Exo », « ⚡ Super » crée une NOUVELLE paire : le groupe `ssG` n\'est pas touché par cette création',
      s3 && ch3 && el && el.group && el.group !== 'ssG' && fin.wkt.exs[ei + 1].group === el.group && fin.wkt.exs.filter(e => e.group === el.group).length === 2
      && egal(fin.wkt.exs.filter(e => e.group === 'ssG'), mid.wkt.exs.filter(e => e.group === 'ssG')) && avE, js(fin.wkt.exs.map(e => [e.name, e.group || '-'])));
    t('C3g aucune erreur de page, aucun appel Milo', X.errs.length === 0 && X.milo === 0, X.errs.join(' | ').slice(0, 200));
    await X.cx.close();
  }

  // ── C2·dropset : l'écran n'offre pas « ⚡ Super » ; l'appel direct puis l'abandon ne touchent à rien ─
  {
    const X = await ouvrir({ ft4_wkt: WKT() });
    await allerSeance(X);
    const pi = await idx(X, 'Presse à cuisses');
    await X.pg.evaluate(k => { _expandedEx = k; renderExBlocks(); }, pi);
    const bouton = await X.pg.evaluate(k => [...document.querySelectorAll('button[onclick="createSupersetFrom(' + k + ')"]')].some(e => e.offsetParent !== null), pi);
    const av = await etat(X);
    await X.pg.evaluate(k => createSupersetFrom(k), pi); await X.pg.waitForTimeout(200);
    await clic(X.pg, '#mod-ex .modal-btns button', 'Fermer');
    const ap = await etat(X);
    t('C2·dropset pas de « ⚡ Super » à l\'écran sur un exercice à dropset ; appel direct puis abandon : dropset et séance STRICTEMENT identiques',
      !bouton && egal(ap.wkt, av.wkt) && egal(ap.disque, av.disque) && egal(ap.wkt.exs[pi].dropset, DS), 'bouton=' + bouton + ' ' + js(ap.wkt.exs[pi]));
    await X.cx.close();
  }

  // ── C4 : création d'un tri-set par « ⚡ Grouper » et par « Superset avec l'exercice du dessus » ───
  {
    const X = await ouvrir({ ft4_wkt: WKT() });
    await allerSeance(X);
    const g = await clic(X.pg, 'button[onclick="toggleGroupMode()"]');
    const sel = [];
    for (const nom of ['Squat', 'Rowing barre', 'Élévations latérales']) { const i = await idx(X, nom); sel.push(await clic(X.pg, '#ex-block-' + i)); }
    const lier = await clic(X.pg, 'button[onclick="createSuperset()"]');
    const ap = await etat(X);
    const gid = ap.wkt.exs[0].group;
    t('C4a « ⚡ Grouper » + 3 exercices + « Lier » : un tri-set, même identifiant, libellé « Tri-set »',
      g && sel.every(Boolean) && lier && gid && ap.wkt.exs.filter(e => e.group === gid).length === 3 && (await libelles(X)).includes('⚡ Tri-set'), js(ap.wkt.exs.map(e => [e.name, e.group || '-'])));
    // « Superset avec l'exercice du dessus » sous le groupe existant ssG → il le rejoint (tri-set)
    const X2 = await ouvrir({ ft4_wkt: { date: '2026-09-29', exs: [WKT().exs[1], WKT().exs[2], WKT().exs[3]] } });
    await allerSeance(X2);
    const m = await clic(X2.pg, 'button[onclick^="openExMenu(2,"]');
    const lp = await clic(X2.pg, '#ov-ex-menu button', 'Superset avec');
    const e2 = await etat(X2);
    t('C4b « Superset avec l\'exercice du dessus » sous un superset de 2 : tri-set `ssG`, rien d\'autre ne change',
      m && lp && e2.wkt.exs.every(e => e.group === 'ssG' && e.groupType === 'super') && (await libelles(X2)).includes('⚡ Tri-set'), js(e2.wkt.exs.map(e => [e.name, e.group || '-'])));
    t('C4c aucune erreur de page', X.errs.length === 0 && X2.errs.length === 0, X.errs.concat(X2.errs).join(' | ').slice(0, 200));
    await X.cx.close(); await X2.cx.close();
  }
};
