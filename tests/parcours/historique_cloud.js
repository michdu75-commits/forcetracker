/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🗂️ FIABILISATION LOT 3 — HISTORIQUE ORDONNÉ + RESTAURATION CLOUD SANS PERTE (F03 + F03b + CL)
   session-B · 28/09/2026

   Mesuré par l'écran sur master b5069757 (ft-v1240), AVANT correction :
     · F03 — « Dernière séance RÉALISÉE rattachée à un libellé » envoyée à Milo = `slice(-1)`
       d'une liste rangée du plus récent au plus ancien → la PLUS ANCIENNE (« Push A » d'il y a
       3 jours au lieu de « Pull B » d'hier) ;
     · F03b — une séance datée d'hier par le sélecteur de date de l'écran Séance passait en TÊTE
       de `S.sessions` (`unshift`) : historique affiché, liste détaillée envoyée à Milo et tous les
       lecteurs de `S.sessions[0]` la prenaient pour la dernière — et ça survivait au rechargement ;
     · CL — « Restaurer » : la liste du cloud remplaçait la liste locale dès qu'elle était plus
       LONGUE (séance jamais synchronisée perdue, note ou superset corrigés sur place écrasés) ;
       plus courte, elle n'apportait rien.
   Correctif : l'ordre a UN propriétaire (`_cmpSeances` / `_trierSeances` / `_seancesRecentes` /
   `_derniereSeance`, state.js) ; la restauration fait une UNION par identité forte `id`
   (`_fusionnerSeancesRestauration`) — même contenu → une seule, contenu différent → la version
   du téléphone reste active et celle du cloud est gardée à part (`ft4_sessions_conflits`).

   Ce que les témoins CONDUISENT : l'onglet Séance, le sélecteur de date `#s-date`, « Terminer »,
   l'onglet Progrès (historique), l'onglet Coach et l'envoi d'un message, l'écran Profil, le
   bouton « 🔄 Restaurer mon compte depuis le cloud », le champ e-mail, « Restaurer », un VRAI
   rechargement. Frontières simulées : Worker (coach), Apps Script (loadProfile, logSession).
   Ce qu'ils OBSERVENT : `S.sessions` en mémoire ET `ft4_sessions` sur le disque, l'historique
   affiché, le contexte RÉELLEMENT envoyé à Milo (champ `context` de la requête), `synced`,
   `ft4_sessions_conflits`, le message affiché, `S.wkt`.
   Ce qu'ils NE COUVRENT PAS : l'import d'historique (témoin de SOURCE seulement), la fusion entre
   onglets (témoin de source), la correction d'une séance enregistrée (l'éditeur n'a pas de champ
   date — vérifié), l'union côté Apps Script, les autres lecteurs de `S.sessions[0]` (couverts
   parce que le stockage est rangé, pas un par un).
   Banc : tools/banc_lot3.js · contrôle négatif : tools/mut_lot3.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const JOUR = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' }); };
const D0 = JOUR(0), D1 = JOUR(1), D2 = JOUR(2), D3 = JOUR(3), D5 = JOUR(5);
let _seq = 1700000000000;
const SEANCE = (date, label, ex, o) => { const id = ++_seq; return Object.assign({ id, date, ts: id,
  exs: [{ name: ex || 'Développé Couché', sets: [{ kg: 80, reps: 6, type: 'N', done: true, rm1: 93 }] }], volume: 480, synced: true,
  startHour: 18, duration: 3600, progLabel: label || '' }, o || {}); };
const DEM = 'Dis-moi comment se passent mes dernières séances de musculation';
const cp = x => JSON.parse(JSON.stringify(x));

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-CCCXCVII (session-B). LOT 3 — un seul propriétaire de l\'ordre, une union sans perte (source) ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const st = nu('state.js'), lo = nu('log.js'), co = nu('coach.js'), se = nu('setup.js');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? undefined : j); };
  const cmp = corps(st, '_cmpSeances'), fus = corps(st, '_fusionnerSeancesRestauration'), rec = corps(st, '_seancesRecentes'),
        fin = corps(lo, 'finishWorkout'), imp = corps(lo, 'finalImportHist'), res = corps(se, '_applyRestoreData');
  t('① les fonctions sont trouvées (sinon les témoins suivants ne mesurent rien)', cmp && fus && rec && fin && imp && res, [cmp, fus, rec, fin, imp, res].map(x => x.length).join('/'));
  const NOMS = ['_cmpSeances', '_trierSeances', '_seancesRecentes', '_derniereSeance', '_fusionnerSeancesRestauration'];
  const autres = ['log.js', 'coach.js', 'setup.js', 'app.js', 'tracking.js', 'screens.js'].map(nu).join('\n');
  t('② UN seul propriétaire : chaque fonction d\'ordre / d\'union est déclarée une fois, dans state.js seulement',
    NOMS.every(n => (st.match(new RegExp('function ' + n + '\\(', 'g')) || []).length === 1 && !new RegExp('function ' + n + '\\(').test(autres)), '');
  t('③ le comparateur lit la DATE d\'abord, puis `ts`, sans jamais remplacer une date absente par aujourd\'hui',
    /a&&a\.date\|\|''/.test(cmp) && /b&&b\.ts/.test(cmp) && !/today\(|new Date\(/.test(cmp), cmp.slice(0, 220));
  t('④ F03 : Milo reçoit `_derniereSeance(...)`, plus `slice(-1)` d\'une liste rangée à l\'envers',
    /const derniere=_derniereSeance\(x=>x&&x\.progLabel\)/.test(co) && !/sessions\|\|\[\]\)\.filter\([^;]*\)\.slice\(-1\)/.test(co), '');
  t('④b F03 : la liste détaillée envoyée à Milo vient de `_seancesRecentes(_NB_DETAIL)` (nombre inchangé : 5)',
    /const _sessVues = _seancesRecentes\(_NB_DETAIL\)/.test(co) && /const _NB_DETAIL = 5;/.test(co), '');
  t('⑤ F03b : la fin de séance range avant d\'écrire, marque LA séance envoyée, et annule PAR RÉFÉRENCE',
    /S\.sessions\.unshift\(sess\);\s*_trierSeances\(S\.sessions\);/.test(fin) && /sess\.synced=true/.test(fin)
    && !/S\.sessions\[0\]\.synced/.test(fin) && !/S\.sessions\.shift\(\)/.test(fin) && /S\.sessions\.indexOf\(sess\)/.test(fin), '');
  t('⑥ l\'import range avec le même propriétaire (plus de comparateur local)', /_trierSeances\(S\.sessions\)/.test(imp) && !/S\.sessions\.sort\(/.test(imp), '');
  t('⑦ le chargement et la fusion entre onglets rangent avec le même propriétaire',
    /S\.sessions=_trierSeances\(_lsJson\('ft4_sessions',\[\]\)\)/.test(st) && /S\.sessions\s*=\s*_trierSeances\(_fusionListe\(S\.sessions,/.test(st), '');
  t('⑧ CL : la restauration passe par l\'union, plus par « la liste la plus longue gagne »',
    /_fusionnerSeancesRestauration\(S\.sessions,\s*sessions\)/.test(res) && !/sessions\.length>S\.sessions\.length/.test(res) && /ft4_sessions_conflits/.test(res), '');
  t('⑨ ⛔ AUCUNE identité approximative dans l\'union : ni date, ni exercices, ni libellé, ni nom',
    !/\.date\b|\.exs\b|\.exercises\b|progLabel|\.name\b|\.volume\b/.test(fus) && /\.id!=null/.test(fus), fus.slice(0, 200));
  t('⑩ l\'union range son résultat avec le comparateur commun', /liste:_trierSeances\(out\)/.test(fus), '');
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CCCXCVIII (session-B). LOT 3 — F03 · F03b · CL par l\'écran ═══');
  const js = x => JSON.stringify(x).slice(0, 260);
  const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
  const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 't@t.t',
    ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_lms: moisPrec, ft4_ok: '1' };
  const PROFIL = { name: 'Test', bw: 80, age: 40, gender: 'H', goal: 'force' };
  const tous = [];
  const ouvrir = async (seed, o) => {
    o = o || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    const X = { cx, coach: [], logSess: [], loadP: 0, cloud: o.cloud || [] };
    await cx.route(/supabase\.co/, r => r.abort());
    await cx.route(/script\.google\.com/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      const u = r.request().url(); const a = c.action || (u.match(/action=([a-zA-Z]+)/) || [])[1] || (/test=1/.test(u) ? 'ping' : '?');
      const rep = x => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) });
      if (a === 'ping' || a === 'test') return rep({ status: 'online', version: '3.5' });
      if (a === 'loadProfile') { X.loadP++; return o.cloud ? rep({ status: 'ok', premium: false, profile: PROFIL, sessions: cp(X.cloud), prs: {} }) : rep({ status: 'not_found' }); }
      if (a === 'logSession') { X.logSess.push(c.date); return rep(o.logOk && o.logOk(c) ? { status: 'ok', count: 1 } : { status: 'error', error: 'simulé' }); }
      return rep({ status: 'ok' }); });
    await cx.route(/workers\.dev/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      if (c.action === 'coach') { X.coach.push(c); return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'Ok, noté.', stopReason: 'end_turn', truncated: false, complete: true, continued: false }) }); }
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); });
    const pg = await cx.newPage(); X.pg = pg; X.errs = []; pg.on('pageerror', x => X.errs.push(x.message));
    const init = Object.assign({}, BASE);
    Object.keys(seed || {}).forEach(k => { init[k] = typeof seed[k] === 'string' ? seed[k] : JSON.stringify(seed[k]); });
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_l3'))return; sessionStorage.setItem('_l3','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));
      ${o.stockagePlein ? "const _s=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(k==='ft4_sessions'&&window.__plein) throw new DOMException('plein','QuotaExceededError'); return _s.call(this,k,v); };" : ''}
    }catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    tous.push(X); return X;
  };
  const GARDER = /ov-restore-account|ov-session-end|ov-confirm/;
  const clic = async (pg, sel, txt) => {
    for (let k = 0; k < 6; k++) {
      await pg.evaluate(g => document.querySelectorAll('.overlay.open').forEach(o => { if (!new RegExp(g).test(o.id)) o.classList.remove('open'); }), GARDER.source);
      const h = (await pg.evaluateHandle(([s, x]) => [...document.querySelectorAll(s)].find(e => e.offsetParent !== null && (!x || e.textContent.includes(x))) || null, [sel, txt])).asElement();
      if (!h) { await pg.waitForTimeout(250); continue; }
      try { await h.evaluate(x => x.scrollIntoView({ block: 'center' })); await h.click({ timeout: 3000 }); return true; } catch (e) { await pg.waitForTimeout(200); }
    }
    return false;
  };
  const fermer = async X => { try { await X.cx.close(); } catch (e) {} };
  const resume = l => (l || []).map(s => (s.date || '(sans date)') + (s.progLabel ? '·' + s.progLabel : '') + '#' + String(s.id).slice(-3));
  const lire = X => X.pg.evaluate(() => { let d = null; try { d = JSON.parse(localStorage.getItem('ft4_sessions')); } catch (e) {}
    let c = null; try { c = JSON.parse(localStorage.getItem('ft4_sessions_conflits')); } catch (e) {}
    return { mem: JSON.parse(JSON.stringify(S.sessions || [])), disque: d, conflits: c, wkt: S.wkt ? JSON.parse(JSON.stringify(S.wkt)) : null,
      toast: (document.getElementById('toast') || {}).textContent || '' }; });
  const range = l => l.every((s, i) => i === 0 || String(l[i - 1].date || '') >= String(s.date || '') || !s.date);
  // Contexte RÉELLEMENT envoyé à Milo : on envoie un message par l'écran et on lit la requête.
  const contexte = async X => {
    const n = X.coach.length;
    await clic(X.pg, '#nb-coach'); await X.pg.waitForTimeout(400);
    await X.pg.evaluate(() => { S.premium = true; window._premiumPending = false; });
    await X.pg.evaluate(async () => { const t0 = Date.now(); while (Date.now() - t0 < 20000 && (window.coachBusy || (document.getElementById('coach-send-btn') || {}).disabled)) await new Promise(z => setTimeout(z, 100)); });
    await X.pg.fill('#coach-inp', DEM); await clic(X.pg, '#coach-send-btn');
    for (let k = 0; k < 60 && !X.coach.slice(n).some(c => String(c.message || '').includes(DEM)); k++) await X.pg.waitForTimeout(200);
    const c = String((X.coach.slice(n).filter(c => String(c.message || '').includes(DEM)).pop() || {}).context || '');
    const m = c.match(/Dernière séance RÉALISÉE rattachée à un libellé : « ([^»]+) » \(([^)]+)\)/) || [];
    const i = c.indexOf('DERNIÈRES SÉANCES:'), j = c.indexOf('→ ⚠️ CE QUE TU VOIS ICI', i);
    const bloc = i >= 0 ? c.slice(i, j > i ? j : i + 4000) : '';
    const dates = [...bloc.matchAll(/^\S+ (\d{4}-\d{2}-\d{2})/gm)].map(x => x[1]);
    return { lien: m[1] ? m[1] + ' (' + m[2] + ')' : '(absent)', dates, vu: !!c };
  };
  const historique = async X => {
    await clic(X.pg, '#nb-progress'); await X.pg.waitForTimeout(400);
    await X.pg.evaluate(() => { try { renderSessions(); } catch (e) {} });
    return X.pg.evaluate(() => [...document.querySelectorAll('#sess-list > *')].map(e => e.textContent.replace(/\s+/g, ' ').slice(0, 40)));
  };
  // Fin de séance par l'écran, avec la date choisie par le sélecteur de date de l'écran Séance.
  const terminer = async (X, date) => {
    await clic(X.pg, '#nb-log'); await X.pg.waitForTimeout(400);
    if (date) await X.pg.evaluate(d => { const i = document.getElementById('s-date'); i.value = d; i.dispatchEvent(new Event('change', { bubbles: true })); }, date);
    const dateWkt = await X.pg.evaluate(() => S.wkt && S.wkt.date);
    const ok = await clic(X.pg, 'button[onclick="finishWorkout()"]');
    await X.pg.waitForTimeout(2200);
    await X.pg.evaluate(() => { try { if (typeof closeSessionEnd === 'function') closeSessionEnd(); } catch (e) {} });
    return { ok, dateWkt };
  };
  const WKT = (label, ex) => ({ date: D0, progLabel: label || '', exs: [{ name: ex || 'Squat', sets: [{ kg: 100, reps: 5, type: 'N', done: true, rm1: 0 }] }] });
  // Restauration par le vrai bouton du Profil.
  const restaurer = async X => {
    await X.pg.evaluate(() => { try { openProfil(); } catch (e) {} }); await X.pg.waitForTimeout(400);
    const b1 = await clic(X.pg, '#btn-restore-cloud'); await X.pg.waitForTimeout(300);
    await X.pg.fill('#restore-email-inp', 't@t.t');
    const b2 = await clic(X.pg, '#restore-account-btn');
    await X.pg.waitForFunction(() => !document.querySelector('#ov-restore-account.open'), null, { timeout: 8000 }).catch(() => {});
    await X.pg.waitForTimeout(3300);   // le message « deux versions » part 3 s après, pour ne pas être recouvert
    return b1 && b2;
  };
  const ids = l => (l || []).map(s => String(s.id));
  const memeDisque = e => JSON.stringify(e.mem) === JSON.stringify(e.disque);

  try {
    // ══ F03 ══════════════════════════════════════════════════════════════════════════════════
    { const B = SEANCE(D1, 'Pull B', 'Rowing Barre (Tirage Horizontal)'), A = SEANCE(D3, 'Push A');
      const X = await ouvrir({ ft4_sessions: [B, A] }); const c = await contexte(X);
      t('[F03 · C1] A ancienne (« Push A », J-3) puis B récente (« Pull B », J-1) → Milo reçoit B comme dernière séance à libellé',
        c.vu && c.lien === 'Pull B (' + D1 + ')', 'reçu : ' + c.lien);
      t('[F03 · C1] la liste détaillée envoyée commence par la plus récente', c.dates[0] === D1 && c.dates[1] === D3, js(c.dates));
      await fermer(X); }
    { const Z = SEANCE(D0, ''), B = SEANCE(D1, 'Pull B', 'Rowing Barre (Tirage Horizontal)'), A = SEANCE(D3, 'Push A');
      const X = await ouvrir({ ft4_sessions: [Z, B, A] }); const c = await contexte(X);
      t('[F03 · C3] une séance d\'aujourd\'hui SANS libellé n\'est pas éligible : la plus récente À LIBELLÉ est « Pull B »',
        c.lien === 'Pull B (' + D1 + ')', 'reçu : ' + c.lien);
      await fermer(X); }
    { const A = SEANCE(D3, 'Push A'), B = SEANCE(D1, 'Pull B', 'Rowing Barre (Tirage Horizontal)');
      const X = await ouvrir({ ft4_sessions: [A, B] }); const e = await lire(X); const c = await contexte(X);
      t('[F03 · disque dans le désordre] un historique enregistré à l\'envers est remis dans l\'ordre des dates au chargement',
        JSON.stringify(resume(e.mem)) === JSON.stringify(resume([B, A])), js(resume(e.mem)));
      t('[F03 · disque dans le désordre] Milo reçoit « Pull B » et la liste détaillée commence par J-1', c.lien === 'Pull B (' + D1 + ')' && c.dates[0] === D1, c.lien + ' · ' + js(c.dates));
      await fermer(X); }
    { const L = [0, 1, 2, 3, 5, 6, 8].map((n, i) => SEANCE(JOUR(n), 'J' + i));
      const X = await ouvrir({ ft4_sessions: L.slice().reverse() }); const c = await contexte(X);
      t('[F03 · nombre] toujours 5 séances détaillées, les 5 plus récentes, de la plus récente à la plus ancienne',
        JSON.stringify(c.dates) === JSON.stringify([0, 1, 2, 3, 5].map(JOUR)), js(c.dates));
      await fermer(X); }

    // ══ F03b ═════════════════════════════════════════════════════════════════════════════════
    { const B = SEANCE(D0, 'Pull B', 'Rowing Barre (Tirage Horizontal)', { synced: false });
      const X = await ouvrir({ ft4_sessions: [B], ft4_wkt: WKT('Push A') }, { logOk: c => c.date === D1 });
      const f = await terminer(X, D1); const e = await lire(X);
      t('[F03b · T2] séance « Push A » datée d\'HIER par le sélecteur de date, puis « Terminer » : la date choisie est bien celle de la séance',
        f.ok && f.dateWkt === D1, js(f));
      t('[F03b · T2] `S.sessions` reste rangé : « Pull B » (aujourd\'hui) en tête, « Push A » (hier) après — mémoire ET disque',
        JSON.stringify(e.mem.map(s => s.date + '·' + s.progLabel)) === JSON.stringify([D0 + '·Pull B', D1 + '·Push A']) && memeDisque(e), js(resume(e.mem)));
      t('[F03b · T2] aucune date modifiée : « Pull B » garde la sienne, « Push A » garde celle qu\'on a choisie',
        e.mem.find(s => s.progLabel === 'Pull B').date === D0 && e.mem.find(s => s.progLabel === 'Push A').date === D1, js(resume(e.mem)));
      t('[F03b · T2] « synced » est posé sur LA séance envoyée (Push A), pas sur la première du tableau (Pull B reste à renvoyer)',
        e.mem.find(s => s.progLabel === 'Push A').synced === true && e.mem.find(s => s.progLabel === 'Pull B').synced === false,
        js(e.mem.map(s => s.progLabel + ':' + s.synced)) + ' · logSession ' + js(X.logSess));
      const h = await historique(X);
      t('[F03b · T2] l\'historique affiché commence par « Pull B »', /Pull B/.test(h[0] || '') && /Push A/.test(h[1] || ''), js(h.slice(0, 2)));
      const c = await contexte(X);
      t('[F03b · C2] Milo reçoit « Pull B » (aujourd\'hui) comme dernière séance, liste détaillée J, puis J-1',
        c.lien === 'Pull B (' + D0 + ')' && c.dates[0] === D0 && c.dates[1] === D1, c.lien + ' · ' + js(c.dates));
      await X.pg.reload(); await X.pg.waitForTimeout(1500); const r = await lire(X);
      t('[F03b · T2] après un vrai rechargement : même ordre, mêmes dates', JSON.stringify(resume(r.mem)) === JSON.stringify(resume(e.mem)), js(resume(r.mem)));
      await fermer(X); }
    { const X = await ouvrir({ ft4_wkt: WKT('', 'Squat') });
      await terminer(X, null);
      await X.pg.evaluate(() => { S.wkt = { date: today(), exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 6, type: 'N', done: true, rm1: 0 }] }] }; persist(); });
      await terminer(X, null); const e = await lire(X);
      t('[F03b · T3] deux séances le MÊME jour : la dernière ENREGISTRÉE vient en tête (départage par `ts`), dates intactes',
        e.mem.length === 2 && e.mem.every(s => s.date === D0) && e.mem[0].exs[0].name === 'Développé Couché' && e.mem[0].ts > e.mem[1].ts,
        js(e.mem.map(s => s.date + ' ' + s.exs[0].name + ' ' + s.ts)));
      await X.pg.reload(); await X.pg.waitForTimeout(1500); const r = await lire(X);
      t('[F03b · T3] l\'ordre du même jour est stable au rechargement', JSON.stringify(ids(r.mem)) === JSON.stringify(ids(e.mem)), '');
      await fermer(X); }
    { const N = SEANCE(D0, 'Sans date'); delete N.date; const B = SEANCE(D1, 'Pull B');
      const X = await ouvrir({ ft4_sessions: [N, B] }); const e = await lire(X);
      t('[F03b · date absente] une séance sans date passe APRÈS les séances datées et reste SANS date (jamais « aujourd\'hui »)',
        e.mem.length === 2 && e.mem[0].date === D1 && e.mem[1].date === undefined && e.mem[1].progLabel === 'Sans date', js(resume(e.mem)));
      await fermer(X); }
    { const B = SEANCE(D0, 'Pull B', 'Rowing Barre (Tirage Horizontal)');
      const X = await ouvrir({ ft4_sessions: [B], ft4_wkt: WKT('Push A') }, { stockagePlein: true });
      await X.pg.evaluate(() => { window.__plein = true; });
      await terminer(X, D1); await X.pg.evaluate(() => { window.__plein = false; }); const e = await lire(X);
      t('[F03b · stockage plein] l\'échec d\'écriture retire LA séance qu\'on venait d\'ajouter, pas « Pull B » (qui n\'est plus en tête)',
        e.mem.length === 1 && e.mem[0].id === B.id && e.wkt && e.wkt.date === D1, js(resume(e.mem)) + ' · wkt ' + (e.wkt && e.wkt.date));
      await fermer(X); }

    // ══ CL — restauration par le vrai bouton « Restaurer » ═════════════════════════════════════
    const cas = async (nom, local, cloud, seedPlus) => {
      const X = await ouvrir(Object.assign({ ft4_sessions: local }, seedPlus || {}), { cloud });
      const e0 = await lire(X); const ok = await restaurer(X); const e1 = await lire(X);
      return { X, e0, e1, ok, nom };
    };
    { const A = SEANCE(D5, 'Push A'), B = SEANCE(D3, 'Pull B', 'Rowing Barre (Tirage Horizontal)'), C = SEANCE(D1, 'Legs C', 'Squat'),
        L = SEANCE(D0, 'Local L', 'Tractions', { synced: false });
      const W0 = { date: D0, exs: [], cardio: { type: 'elliptique', intensity: 'modere', duration: 20 } };
      const R = await cas('A/B/F', [L, A], [C, B, A], { ft4_wkt: W0 });
      t('[CL · A+F] une séance présente seulement sur le téléphone (jamais synchronisée) reste, même face à un cloud plus long',
        R.ok && ids(R.e1.mem).includes(String(L.id)), js(resume(R.e1.mem)));
      t('[CL · B] les séances présentes seulement dans le cloud sont ajoutées', ids(R.e1.mem).includes(String(C.id)) && ids(R.e1.mem).includes(String(B.id)), js(resume(R.e1.mem)));
      t('[CL · A/B] résultat = 4 séances, rangées par date, mémoire = disque, aucun doublon',
        R.e1.mem.length === 4 && new Set(ids(R.e1.mem)).size === 4 && range(R.e1.mem) && memeDisque(R.e1), js(resume(R.e1.mem)));
      t('[CL · A/B] aucune date modifiée par la restauration', R.e1.mem.every(s => s.date === [L, A, B, C].find(x => x.id === s.id).date), '');
      t('[CL · négatif] la séance en cours (cardio noté) n\'est pas touchée par la restauration', JSON.stringify(R.e1.wkt) === JSON.stringify(R.e0.wkt), js(R.e1.wkt));
      await R.X.pg.reload(); await R.X.pg.waitForTimeout(1500); const r = await lire(R.X);
      t('[CL · H] après un vrai rechargement : même liste, même ordre', JSON.stringify(ids(r.mem)) === JSON.stringify(ids(R.e1.mem)), js(resume(r.mem)));
      await fermer(R.X); }
    { const A = SEANCE(D5, 'Push A'), B = SEANCE(D3, 'Pull B');
      const R = await cas('C', [B, A], [cp(B), cp(A)]);
      t('[CL · C] même identité forte, même contenu → une seule séance chacune, aucun conflit, aucun message',
        R.e1.mem.length === 2 && !(R.e1.conflits || []).length && !/deux versions/.test(R.e1.toast), js(resume(R.e1.mem)) + ' · ' + R.e1.toast);
      await restaurer(R.X); const e2 = await lire(R.X);
      t('[CL · I] une DEUXIÈME restauration identique ne change rien (idempotente)', JSON.stringify(e2.mem) === JSON.stringify(R.e1.mem), js(resume(e2.mem)));
      await fermer(R.X); }
    { const A = SEANCE(D5, 'Push A'), B = SEANCE(D3, 'Pull B', 'Rowing Barre (Tirage Horizontal)'), C = SEANCE(D1, 'Legs C', 'Squat');
      const Bn = Object.assign(cp(B), { note: 'corrigée sur le téléphone' });
      const R = await cas('D', [Bn, A], [C, B, A]);
      const actif = R.e1.mem.find(s => s.id === B.id);
      t('[CL · D] même `id`, contenu différent → la version du TÉLÉPHONE reste active (la note n\'est pas écrasée)',
        R.e1.mem.filter(s => s.id === B.id).length === 1 && actif && actif.note === 'corrigée sur le téléphone', js(actif));
      t('[CL · D] … et la version du CLOUD est gardée à part, pas jetée', (R.e1.conflits || []).length === 1 && R.e1.conflits[0].id === B.id && !R.e1.conflits[0].note, js(R.e1.conflits));
      t('[CL · D] … et on le DIT (pas de choix silencieux)', /deux versions/.test(R.e1.toast), R.e1.toast);
      t('[CL · D] la séance du cloud seule (« Legs C ») est ajoutée', ids(R.e1.mem).includes(String(C.id)) && R.e1.mem.length === 3, js(resume(R.e1.mem)));
      await restaurer(R.X); const e2 = await lire(R.X);
      t('[CL · I] deuxième restauration : la version mise de côté n\'est pas dupliquée, rien ne change',
        (e2.conflits || []).length === 1 && JSON.stringify(e2.mem) === JSON.stringify(R.e1.mem), js(e2.conflits && e2.conflits.length));
      await fermer(R.X); }
    { const A = SEANCE(D5, 'Push A'), B = SEANCE(D3, 'Pull B', 'Rowing Barre (Tirage Horizontal)'), C = SEANCE(D1, 'Legs C', 'Squat');
      const Bss = cp(B); Bss.exs = [{ name: 'Rowing Barre (Tirage Horizontal)', group: 'g1', groupType: 'super', sets: B.exs[0].sets },
        { name: 'Curl Barre', group: 'g1', groupType: 'super', sets: [{ kg: 30, reps: 10, type: 'N', done: true, rm1: 40 }] }];
      const R = await cas('D-superset', [Bss, A], [C, B, A]);
      const actif = R.e1.mem.find(s => s.id === B.id);
      t('[CL · D superset] un superset corrigé sur le téléphone n\'est pas remplacé par la variante du cloud', actif && actif.exs.length === 2 && actif.exs.every(e => e.group === 'g1'), js(actif && actif.exs.map(e => e.name + ':' + e.group)));
      await fermer(R.X); }
    { const S1 = SEANCE(D2, 'Push A'), S2 = Object.assign(cp(S1), { id: S1.id + 500, ts: S1.ts + 500 });
      const R = await cas('E', [S1], [S2]);
      t('[CL · E] deux VRAIES séances le même jour, même exercice, mêmes séries, même libellé (ids différents) → les deux restent',
        R.e1.mem.length === 2 && ids(R.e1.mem).includes(String(S1.id)) && ids(R.e1.mem).includes(String(S2.id)), js(resume(R.e1.mem)));
      await fermer(R.X); }
    { const n1 = SEANCE(D3, 'Ancienne'); delete n1.id; const n2 = Object.assign(cp(n1), { exs: [{ name: 'Développé Couché', sets: [{ kg: 82.5, reps: 6, type: 'N', done: true, rm1: 96 }] }] });
      const R = await cas('E-sans-id', [cp(n1)], [cp(n1), cp(n1), n2]);
      t('[CL · E sans id] séances très anciennes sans `id` : une copie STRICTEMENT identique est reconnue une fois pour une fois, tout le reste est gardé',
        R.e1.mem.length === 3 && R.e1.mem.filter(s => JSON.stringify(s.exs) === JSON.stringify(n1.exs)).length === 2 && R.e1.mem.some(s => s.exs[0].sets[0].kg === 82.5),
        js(R.e1.mem.map(s => s.date + ' ' + s.exs[0].sets[0].kg)));
      await fermer(R.X); }
    { const A = SEANCE(D5, 'Push A'), B = SEANCE(D3, 'Pull B'), C = SEANCE(D1, 'Legs C'), L = SEANCE(D0, 'Local L');
      const R = await cas('G', [L, B, A], [C, B]);
      t('[CL · G] cloud plus COURT : aucune séance locale supprimée, et la séance du cloud seule est ajoutée',
        R.e1.mem.length === 4 && [L, B, A, C].every(s => ids(R.e1.mem).includes(String(s.id))) && range(R.e1.mem), js(resume(R.e1.mem)));
      await fermer(R.X); }
    { const A = SEANCE(D5, 'Push A'), B = SEANCE(D3, 'Pull B');
      const R = await cas('ordre', [B, A], [SEANCE(D1, 'Legs C'), SEANCE(D0, 'Push D'), SEANCE(D2, 'Arms E')]);
      t('[CL · ordre] après fusion, un seul ordre : par date, la plus récente d\'abord (historique, Milo, disque)',
        JSON.stringify(R.e1.mem.map(s => s.date)) === JSON.stringify([D0, D1, D2, D3, D5]) && memeDisque(R.e1), js(resume(R.e1.mem)));
      const c = await contexte(R.X);
      t('[CL · ordre] Milo reçoit la plus récente après restauration (« Push D », aujourd\'hui)', c.lien === 'Push D (' + D0 + ')' && c.dates[0] === D0, c.lien);
      await fermer(R.X); }

    const errs = tous.flatMap(X => X.errs);
    t('[négatif] aucune erreur JavaScript pendant ces parcours', !errs.length, js(errs.slice(0, 3)));
    // 0 appel réel PAR CONSTRUCTION : chaque contexte route Worker, Apps Script et Supabase vers une réponse simulée ou un abandon.
  } finally { for (const X of tous) await fermer(X); }
};

/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🗂️ LOT 3B — `_recoverDraft` NE DÉPEND PLUS DE L'ORDRE DES SÉANCES · session-B · 28/09/2026

   Trouvé par la contre-vérification du Lot 3 : au démarrage, `_recoverDraft` (app.js) jugeait
   « ce brouillon est déjà enregistré » en regardant `S.sessions[0]` seul (même date, assez
   d'exercices). Depuis le Lot 3, `S.sessions[0]` est la séance la plus RÉCENTE par date, plus
   celle qu'on vient de terminer : une séance datée d'hier, terminée alors qu'une séance
   d'aujourd'hui existe, n'était plus reconnue — son brouillon résiduel revenait comme séance en
   cours (doublon si on la termine).
   Correctif : le brouillon et la séance enregistrée partagent la MÊME HORLOGE — le brouillon garde
   `startTs` / `pausedTotal` / `pausedAt`, la séance garde `duration` (calculée par `_wktElapsedMs`
   sur ces champs) et `ts` (l'instant de la fin). `_seanceDuBrouillon` cherche dans TOUTE la liste
   une séance finie APRÈS le début du brouillon et dont la durée se recalcule exactement depuis
   ces champs. Aucune signature date / exercices / séries.
   CONDUIT : la validation d'une série (`.chk`, qui pose `startTs`), le sélecteur de date, la
   pause, « Terminer », un vrai rechargement. L'arrêt brutal est SIMULÉ en rendant sans effet
   l'effacement du brouillon (`removeItem('ft4_wkt_draft')`) pendant la fin de séance : c'est
   exactement l'état disque décrit par la contre-vérification (`ft4_wkt` vide, brouillon présent).
   OBSERVE : `S.wkt`, `ft4_wkt`, `ft4_wkt_draft`, `S.sessions`, au démarrage suivant.
   NE COUVRE PAS : l'arrêt brutal AVANT l'écriture de `ft4_wkt` vide (la séance finie est alors
   encore dans `ft4_wkt`, donc active au démarrage, indépendamment du brouillon — préexistant,
   identique sur master, classé hors lot) ; les brouillons sans `startTs` (aucune série validée).
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.source3b = function (t, ROOT, fs, path) {
  console.log('\n═══ B-CCCXCIX (session-B). LOT 3B — le brouillon est relié à sa séance par l\'horloge, pas par la position (source) ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const ap = nu('app.js');
  const i = ap.indexOf('(function _recoverDraft('), rec = i >= 0 ? ap.slice(i, ap.indexOf('})();', i)) : '';
  const j = ap.indexOf('function _seanceDuBrouillon('), lien = j >= 0 ? ap.slice(j, ap.indexOf('\n}', j)) : '';
  t('① `_recoverDraft` et `_seanceDuBrouillon` sont trouvées', !!rec && !!lien, rec.length + '/' + lien.length);
  t('② `_recoverDraft` ne lit plus AUCUNE position de la liste (`[0]`, `slice`, `at(`)', !!rec && !/sessions\s*(&&\s*S\.sessions)?\s*\[|\.slice\(|\.at\(/.test(rec), rec.slice(0, 200));
  t('③ `_recoverDraft` passe par `_seanceDuBrouillon`', /_seanceDuBrouillon\(draft\)/.test(rec), '');
  t('④ le lien lit l\'horloge du brouillon (`startTs`, `pausedTotal`, `pausedAt`) et celle de la séance (`ts`, `duration`)',
    /startTs/.test(lien) && /pausedTotal/.test(lien) && /pausedAt/.test(lien) && /\.ts\b/.test(lien) && /\.duration\b/.test(lien), '');
  t('⑤ ⛔ aucune signature approximative : ni nombre d\'exercices, ni premier exercice, ni séries, ni libellé',
    !!lien && !/\.exs\b|\.exercises\b|\.sets\b|progLabel|\.name\b|\.volume\b/.test(lien), lien.slice(0, 200));
  t('⑥ `_seanceDuBrouillon` n\'est déclarée qu\'une fois, dans app.js', (ap.match(/function _seanceDuBrouillon\(/g) || []).length === 1
    && !['state.js', 'log.js', 'coach.js', 'setup.js', 'tracking.js', 'screens.js'].some(f => /function _seanceDuBrouillon\(/.test(nu(f))), '');
};

module.exports.ecran3b = async function (t, b, PORT) {
  console.log('\n═══ B-CD (session-B). LOT 3B — brouillon résiduel après « Terminer » : reconnu, ou récupéré, jamais les deux (écran conduit) ═══');
  const js = x => JSON.stringify(x).slice(0, 240);
  const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
  const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 't@t.t',
    ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_lms: moisPrec, ft4_ok: '1' };
  const tous = [];
  const ouvrir = async (seed) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/supabase\.co/, r => r.abort());
    await cx.route(/script\.google\.com/, r => { const u = r.request().url();
      return /test=1/.test(u) ? r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"online"}' }) : r.abort('failed'); });
    await cx.route(/workers\.dev/, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'Ok.', stopReason: 'end_turn', truncated: false, complete: true, continued: false }) }));
    const pg = await cx.newPage(); const X = { cx, pg, errs: [] }; pg.on('pageerror', x => X.errs.push(x.message));
    const init = Object.assign({}, BASE);
    Object.keys(seed || {}).forEach(k => { init[k] = typeof seed[k] === 'string' ? seed[k] : JSON.stringify(seed[k]); });
    /* L'ARRÊT BRUTAL : tant que `window.__perdre` est vrai, effacer le brouillon n'a aucun effet. Le
       drapeau vit dans la page : un rechargement le remet à faux, comme un vrai redémarrage. */
    await pg.addInitScript(`(()=>{try{
      const _r=Storage.prototype.removeItem; Storage.prototype.removeItem=function(k){ if(k==='ft4_wkt_draft'&&window.__perdre) return; return _r.call(this,k); };
      if(sessionStorage.getItem('_l3b'))return; sessionStorage.setItem('_l3b','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    tous.push(X); return X;
  };
  const clic = async (pg, sel, txt) => {
    for (let k = 0; k < 6; k++) {
      await pg.evaluate(() => document.querySelectorAll('.overlay.open').forEach(o => { if (!/ov-session-end|ov-confirm/.test(o.id)) o.classList.remove('open'); }));
      const h = (await pg.evaluateHandle(([s, x]) => [...document.querySelectorAll(s)].find(e => e.offsetParent !== null && (!x || e.textContent.includes(x))) || null, [sel, txt])).asElement();
      if (!h) { await pg.waitForTimeout(250); continue; }
      try { await h.evaluate(x => x.scrollIntoView({ block: 'center' })); await h.click({ timeout: 3000 }); return true; } catch (e) { await pg.waitForTimeout(200); }
    }
    return false;
  };
  const lire = X => X.pg.evaluate(() => { let w = null, d = null, s = null; try { w = JSON.parse(localStorage.getItem('ft4_wkt')); } catch (e) {}
    try { d = JSON.parse(localStorage.getItem('ft4_wkt_draft')); } catch (e) {} try { s = JSON.parse(localStorage.getItem('ft4_sessions')); } catch (e) {}
    /* une séance « vide » (aucun exercice) n'est pas une séance active : l'écran Séance en recrée une tout seul */
    const r = o => o && o.exs && o.exs.length ? o.exs.map(e => e.name + ':' + (e.sets || []).filter(x => x.done).length).join(',') : null;
    return { active: r(S.wkt), disqueWkt: r(w), brouillon: d ? r(d) : null, brouillonStartTs: !!(d && d.startTs), brouillonEnPause: !!(d && d.pausedAt), brouillonPauseCumulee: +(d && d.pausedTotal || 0),
      sessions: (S.sessions || []).map(x => x.date + '·' + (x.progLabel || '') + '·' + r(x)), disqueSessions: (s || []).length }; });
  const valider = async X => { await clic(X.pg, '#nb-log'); await X.pg.waitForTimeout(300); const ok = await clic(X.pg, 'button.chk[onclick="toggleSet(0,0)"]'); await X.pg.waitForTimeout(300);
    await X.pg.evaluate(() => { try { if (typeof stopRest === 'function') stopRest(); } catch (e) {} }); return ok; };
  const terminerAvecArret = async (X, date, pause) => {
    await clic(X.pg, '#nb-log'); await X.pg.waitForTimeout(300);
    if (date) await X.pg.evaluate(d => { const i = document.getElementById('s-date'); i.value = d; i.dispatchEvent(new Event('change', { bubbles: true })); }, date);
    /* ⏱️ Une pause PLUS LONGUE que la marge du lien (5 s) : sinon une horloge qui ignorerait la pause
       tomberait quand même dans la marge, et le témoin ne pourrait pas rougir. */
    if (pause) { await X.pg.waitForTimeout(1200); await clic(X.pg, '#wkt-pause-btn'); await X.pg.waitForTimeout(7500);
      if (pause === 'reprise') { await clic(X.pg, '#wkt-pause-btn'); await X.pg.waitForTimeout(1200); } }
    await X.pg.evaluate(() => { window.__perdre = true; });
    const ok = await clic(X.pg, 'button[onclick="finishWorkout()"]'); await X.pg.waitForTimeout(2200);
    await X.pg.evaluate(() => { try { if (typeof closeSessionEnd === 'function') closeSessionEnd(); } catch (e) {} });
    return ok;
  };
  const redemarrer = async X => { await X.pg.reload(); await X.pg.waitForTimeout(1500); return lire(X); };
  const fermer = async X => { try { await X.cx.close(); } catch (e) {} };
  const J = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' }); };
  const D0 = J(0), D1 = J(1);
  const EX = (n, done) => ({ name: n, sets: [{ kg: 100, reps: 5, type: 'N', done: !!done, rm1: 0 }] });
  const FAITE = (date, label, exs, ageMin) => { const ts = Date.now() - ageMin * 60000; return { id: ts, ts, date, progLabel: label, exs, volume: 500, uniConv: 1, synced: true, startHour: 9, duration: 1800 }; };
  try {
    // ── T1 : séance d'aujourd'hui déjà là, séance d'HIER terminée ensuite, brouillon résiduel ─────────
    { const X = await ouvrir({ ft4_sessions: [FAITE(D0, 'Pull B', [EX('Rowing Barre (Tirage Horizontal)', 1)], 90)], ft4_wkt: { date: D0, progLabel: 'Push A', exs: [EX('Squat')] } });
      const v = await valider(X); const f = await terminerAvecArret(X, D1); const e0 = await lire(X);
      t('[T1 · état de départ] séance d\'hier terminée, puis arrêt brutal : `ft4_wkt` vide, brouillon (avec son horloge) resté sur le disque',
        v && f && e0.disqueWkt === null && e0.brouillon === 'Squat:1' && e0.brouillonStartTs && !e0.brouillonEnPause && e0.sessions.length === 2, js(e0));
      const e1 = await redemarrer(X);
      t('[T1] au redémarrage, la séance d\'hier est reconnue comme DÉJÀ enregistrée : aucune séance active recréée, brouillon effacé',
        e1.active === null && e1.disqueWkt === null && e1.brouillon === null && e1.sessions.length === 2, js(e1));
      const e2 = await redemarrer(X);
      t('[T6 · T1] un rechargement de plus : état stable (aucune séance active, 2 séances, pas de brouillon)', JSON.stringify(e2) === JSON.stringify(e1) && e2.active === null && e2.brouillon === null, js(e2));
      await fermer(X); }
    // ── T1 en pause : la séance est terminée pendant une pause (l'horloge se fige sur `pausedAt`) ────────
    { const X = await ouvrir({ ft4_sessions: [FAITE(D0, 'Pull B', [EX('Rowing Barre (Tirage Horizontal)', 1)], 90)], ft4_wkt: { date: D0, progLabel: 'Push A', exs: [EX('Squat')] } });
      await valider(X); await terminerAvecArret(X, D1, true); const e0 = await lire(X); const e1 = await redemarrer(X);
      t('[T1 · pause] séance terminée en pause, datée d\'hier : reconnue au redémarrage, aucune séance active',
        e0.brouillon === 'Squat:1' && e0.brouillonEnPause && e1.active === null && e1.brouillon === null && e1.sessions.length === 2, js(e0) + ' → ' + js(e1));
      await fermer(X); }
    // ── T1 pause puis reprise : 7,5 s de pause cumulée (`pausedTotal`) avant « Terminer » ────────────────
    { const X = await ouvrir({ ft4_sessions: [FAITE(D0, 'Pull B', [EX('Rowing Barre (Tirage Horizontal)', 1)], 90)], ft4_wkt: { date: D0, progLabel: 'Push A', exs: [EX('Squat')] } });
      await valider(X); await terminerAvecArret(X, D1, 'reprise'); const e0 = await lire(X); const e1 = await redemarrer(X);
      t('[T1 · pause puis reprise] le temps de pause cumulé est déduit comme dans la durée enregistrée : séance reconnue, aucune séance active',
        e0.brouillon === 'Squat:1' && !e0.brouillonEnPause && e0.brouillonPauseCumulee >= 7000 && e1.active === null && e1.brouillon === null && e1.sessions.length === 2, js(e0) + ' → ' + js(e1));
      await fermer(X); }
    // ── T2 : séance d'aujourd'hui, aucune autre séance (le cas historique) ────────────────────────────
    { const X = await ouvrir({ ft4_wkt: { date: D0, progLabel: 'Push A', exs: [EX('Squat')] } });
      await valider(X); await terminerAvecArret(X, null); const e0 = await lire(X); const e1 = await redemarrer(X);
      t('[T2] séance d\'aujourd\'hui seule, brouillon résiduel : reconnue, aucune séance active (comportement historique inchangé)',
        e0.brouillon === 'Squat:1' && e1.active === null && e1.brouillon === null && e1.sessions.length === 1, js(e0) + ' → ' + js(e1));
      await fermer(X); }
    // ── T3 : brouillon d'une séance JAMAIS terminée, `ft4_wkt` perdu → il doit revenir ──────────────────
    { const X = await ouvrir({ ft4_wkt: { date: D0, progLabel: 'Push A', exs: [EX('Squat')] } });
      await valider(X); await X.pg.evaluate(() => localStorage.setItem('ft4_wkt', 'null'));
      const e1 = await redemarrer(X);
      t('[T3] séance en cours jamais terminée, `ft4_wkt` perdu : le brouillon est récupéré comme séance active',
        e1.active === 'Squat:1' && e1.disqueWkt === 'Squat:1' && e1.sessions.length === 0, js(e1));
      const e2 = await redemarrer(X);
      t('[T6 · T3] un rechargement de plus : la séance récupérée reste active, rien n\'est ajouté à l\'historique', e2.active === 'Squat:1' && e2.sessions.length === 0, js(e2));
      await fermer(X); }
    // ── T4 : une AUTRE séance a déjà été faite aujourd'hui (plus d'exercices) : le brouillon n'est pas « elle » ──
    { const X = await ouvrir({ ft4_sessions: [FAITE(D0, 'Matin', [EX('Squat', 1), EX('Développé Couché', 1), EX('Soulevé de Terre', 1)], 240)],
        ft4_wkt: { date: D0, progLabel: 'Soir', exs: [EX('Squat')] } });
      await valider(X); await X.pg.evaluate(() => localStorage.setItem('ft4_wkt', 'null'));
      const e1 = await redemarrer(X);
      t('[T4] deux séances le même jour : celle du matin (3 exercices) ne fait PAS passer le brouillon du soir pour enregistré — il est récupéré',
        e1.active === 'Squat:1' && e1.sessions.length === 1, js(e1));
      await fermer(X); }
    // ── T5 : une séance enregistrée IDENTIQUE en contenu, mais une autre séance ─────────────────────────
    { const exs = [EX('Squat', 1)]; exs[0].sets[0].at = 0;
      const w = { date: D0, progLabel: 'Push A', exs: JSON.parse(JSON.stringify(exs)), startTs: Date.now() - 20 * 60000, pausedTotal: 0, pausedAt: null, startHour: 9 };
      const X = await ouvrir({ ft4_sessions: [FAITE(D0, 'Push A', JSON.parse(JSON.stringify(exs)), 120)], ft4_wkt: 'null', ft4_wkt_draft: w });
      const e1 = await lire(X);
      t('[T5] une séance enregistrée au contenu IDENTIQUE (même date, même libellé, mêmes séries) mais finie avant le début du brouillon n\'est pas « lui » : brouillon récupéré',
        e1.active === 'Squat:1' && e1.sessions.length === 1, js(e1));
      await fermer(X); }
    const errs = tous.flatMap(X => X.errs);
    t('[négatif] aucune erreur JavaScript pendant ces parcours', !errs.length, js(errs.slice(0, 3)));
  } finally { for (const X of tous) await fermer(X); }
};
