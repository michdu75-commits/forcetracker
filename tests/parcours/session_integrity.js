/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🛡️ SESSION-INTEGRITY-01 — le cycle séance → remplacement → fin → débrief → persistance →
   historique → export, tenu de bout en bout (session-B · 04/10/2026)

   Source des défauts : docs/SESSION-MILO-E2E-01.md (parcours réel de Michel, 03/10).
   Blocs : B-SI01-S (source) · B-SI01-R (remplacement) · B-SI01-D (débrief) · B-SI01-H (Progrès)
           · B-SI01-E (export) · B-SI01-P (première référence / records) · B-SI01-G (N-G2)
           · B-SI01-T (scénario 03/10 complet).

   Ce que les témoins CONDUISENT : l'onglet Séance, le remplacement par le sélecteur
   (`openExPickerForReplace` + `addExercise`, comme les témoins CXVI / CLXXVIII), la case ✓ d'une
   série, le bouton « Terminer » (`finishWorkout`), le bouton « Réessayer » de l'écran de fin, sa
   fermeture, l'onglet Coach, l'onglet Progrès, le bouton « Voir le débrief Milo », la fenêtre
   d'export (« Sans / Avec les débriefs », CSV, PDF), un VRAI rechargement.
   Frontières SIMULÉES : le Worker IA (réponses scriptées — succès, `complete:false` « Désolé,
   réessaie. », HTTP 502), Apps Script, Supabase. ⛔ 0 appel réel à Anthropic.
   Ce qu'ils OBSERVENT : `S.wkt` / `ft4_wkt`, `S.sessions` / `ft4_sessions`, `S.prs`, la file
   `ft4_pending_debrief`, le « reçu », le magasin `ft4_debriefs`, `coachHistory` / `ft4_coach_hist`,
   le DOM du fil Coach, de l'écran de fin et de Progrès, le nombre d'appels `coach` et
   `summarizeCoach`, le contenu des fichiers exportés (CSV texte, PDF brut), le contexte de Milo.
   Ce qu'ils NE COUVRENT PAS : Safari iOS, le cloud (Apps Script / Supabase simulés), la formulation
   réelle de Milo, l'export JSON du Menu (inchangé), la nouvelle discussion du 03/10, l'ancien J1,
   la montée en charge (hors lot).
   Banc : tools/banc_session_integrity.js · contrôle négatif : tools/mut_session_integrity.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); const k = src.indexOf('\nasync function ', i + 10);
  const fin = [j, k].filter(x => x > 0); return src.slice(i, fin.length ? Math.min(...fin) : undefined); };

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-SI01-S (session-B). SESSION-INTEGRITY-01 — propriétaires uniques (source) ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const lo = nu('log.js'), co = nu('coach.js'), se = nu('setup.js');
  const rep = corps(lo, '_replaceExInWorkout'), rem = corps(lo, '_exerciceRemplacant'), val = corps(co, '_dbfReponseValide'),
    enr = corps(co, '_dbfEnregistrer'), run = corps(lo, '_runSeDebrief');
  t('S1 les fonctions sont trouvées (sinon les témoins suivants ne mesurent rien)', rep && rem && val && enr && run, [rep, rem, val, enr, run].map(x => x.length).join('/'));
  t('S2 le remplacement construit un NOUVEL objet, il ne renomme plus (`exs[ei].name=name` a disparu)',
    /_exerciceRemplacant\(/.test(rep) && !/S\.wkt\.exs\[ei\]\.name\s*=\s*name/.test(rep), rep.slice(0, 160));
  t('S3 le remplaçant ne reçoit ni repos, ni consigne, ni marqueur d\'auteur, ni méthode de l\'ancien',
    !/\.rest\b|\.note\b|_milo|dropset|maxi/.test(rem), rem.slice(0, 200));
  const tout = ['state.js', 'coach.js', 'setup.js', 'app.js', 'tracking.js', 'screens.js', 'log.js'].map(nu).join('\n');
  t('S4 UN seul propriétaire : `_dbfReponseValide`, `_dbfEnregistrer`, `_dbfTexteDe` déclarés une fois',
    ['_dbfReponseValide', '_dbfEnregistrer', '_dbfTexteDe'].every(n => (tout.match(new RegExp('function ' + n + '\\(', 'g')) || []).length === 1), '');
  t('S5 le critère de succès repose sur `_miloEtatReponse` (fail-closed) et refuse le repli « Désolé, réessaie. »',
    /_miloEtatReponse\(data\)==='complete'/.test(val) && /_DBF_REPLI/.test(val), val.slice(0, 200));
  t('S6 l\'écran de fin valide AVANT le « reçu » (aucun reçu ni enregistrement sur un faux succès)',
    run.indexOf('_dbfReponseValide') > 0 && run.indexOf('_dbfReponseValide') < run.indexOf('_dbfRecu(') && run.indexOf('_dbfRecu(') < run.indexOf('_dbfEnregistrer('), '');
  const st = corps(co, 'sendToCoach');
  t('S7 le Coach (débrief automatique) passe par le même critère et range le débrief à SA séance',
    /opts\.debriefSess\s*&&\s*!_dbfReponseValide\(data\)/.test(st) && /_dbfEnregistrer\(opts\.debriefSess/.test(st), '');
  t('S8 le rattrapage au démarrage range aussi le débrief, et refuse un ancien « reçu » de repli',
    /_DBF_REPLI/.test(corps(co, '_dbfRecuperer')) && /_dbfEnregistrer\(_r\.id/.test(corps(co, '_dbfRecuperer')), '');
  const fw = corps(lo, 'finishWorkout');
  t('S9 D-045 : une absence de référence n\'est plus un record (`!old` → première référence)',
    /if\(!old\)\{_refExs\.add/.test(fw) && !/if\(!old\|\|rm>old\.rm1\)/.test(fw), '');
  t('S10 N-G2 : le record de référence est figé AVANT la mise à jour de `S.prs`',
    fw.indexOf('sess.refAvant=') > 0 && fw.indexOf('sess.refAvant=') < fw.indexOf('S.prs[ex.name]='), '');
  t('S11 l\'export lit le magasin canonique, jamais une conversation', /_dbfTexteDe\(/.test(corps(se, '_histoLignes')) && !/coachHistory|coachConversations/.test(corps(se, '_histoLignes')), '');
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-SI01-R/D/H/E/P/G/T (session-B). SESSION-INTEGRITY-01 — écran conduit, Milo simulé ═══');
  const { jourParis } = require('../_jour.js');
  const js = x => JSON.stringify(x).slice(0, 260);
  const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
  const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 't@t.t',
    ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_lms: moisPrec, ft4_ok: '1', ft4_stmig1: '1' };
  const J = jourParis(), J1 = jourParis(-7), J2 = jourParis(-14);
  // L'historique du terrain : le Rowing et le Shoulder Press ont leur propre passé.
  const HIST = () => [
    { id: 1001, ts: 1001, date: J1, volume: 1000, exs: [
      { name: 'Rowing Hammer Strength', sets: [{ kg: 40, reps: 8, type: 'N', done: true }, { kg: 40, reps: 8, type: 'N', done: true }, { kg: 50, reps: 8, type: 'N', done: true }] },
      { name: 'Shoulder Press', sets: [{ kg: 60, reps: 8, type: 'N', done: true }, { kg: 80, reps: 8, type: 'N', done: true }, { kg: 90, reps: 8, type: 'N', done: true }] }] },
    { id: 1000, ts: 1000, date: J2, volume: 900, exs: [
      { name: 'Développé Couché', sets: [{ kg: 80, reps: 5, type: 'N', done: true }] }] }];
  const PRS = () => ({ 'Développé Couché': { kg: 80, reps: 5, rm1: 90, date: J2 } });
  // La séance proposée par Milo : Presse 200×2 É puis 240×10 ×3, repos et consigne prescrits.
  const PRESSE = (faites) => ({ name: 'Presse à Cuisses Iso-Latérale', note: 'pieds hauts', _milo: true, sets: [
    { kg: 200, reps: 2, type: 'É', done: faites > 0, rm1: 0, rest: 120 }, { kg: 240, reps: 10, type: 'N', done: faites > 1, rm1: 0, rest: 120 },
    { kg: 240, reps: 10, type: 'N', done: faites > 2, rm1: 0, rest: 120 }, { kg: 240, reps: 10, type: 'N', done: faites > 3, rm1: 0, rest: 120 }] });
  const DC = () => ({ name: 'Développé Couché', sets: [{ kg: 60, reps: 8, type: 'É', done: false, rm1: 0 }, { kg: 85, reps: 5, type: 'N', done: false, rm1: 0 }] });
  const WKT = exs => ({ date: J, startHour: 10, exs });
  const OK = txt => ({ reply: txt, _diag: 'ok', stopReason: 'end_turn', truncated: false, complete: true, continued: false });
  const REPLI = { reply: 'Désolé, réessaie.', _diag: 'erreur', stopReason: null, truncated: false, complete: false, continued: false };
  const FIL = [{ role: 'user', content: 'Salut Milo', ts: 1 }, { role: 'assistant', content: 'Salut ! Prêt pour la séance ?', ts: 2 }];

  const ouvrir = async (o) => {
    o = o || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    const st = { coach: [], summarize: 0, reels: 0, file: (o.reponses || []).slice() };
    await cx.route(/supabase\.co/, r => r.abort());
    await cx.route(/anthropic\.com/, r => { st.reels++; return r.abort(); });
    await cx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json',
      body: /test=1/.test(r.request().url()) ? '{"status":"online","version":"3.5"}' : '{"status":"not_found"}' }));
    await cx.route(/workers\.dev/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      if (c.action === 'coach') { st.coach.push(String(c.message || '')); const x = st.file.length ? st.file.shift() : OK('DEBRIEF-SI01 par défaut.');
        if (x && x.status) return r.fulfill({ status: x.status, contentType: 'application/json', body: '{"error":"amont"}' });
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) }); }
      if (c.action === 'summarizeCoach') { st.summarize++; return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ summary: 'RESUME-SI01' }) }); }
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    const init = Object.assign({}, BASE, { ft4_sessions: JSON.stringify(o.sessions || HIST()), ft4_prs: JSON.stringify(o.prs || PRS()) },
      o.wkt ? { ft4_wkt: JSON.stringify(o.wkt) } : {}, o.fil === null ? {} : { ft4_coach_hist: JSON.stringify(o.fil || FIL) }, o.stock || {});
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_si1'))return; sessionStorage.setItem('_si1','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(o.attente || 1600);
    return { cx, pg, st, errs };
  };
  const clic = async (pg, sel, garder) => {
    for (let k = 0; k < 8; k++) {
      await pg.evaluate(g => document.querySelectorAll('.overlay.open').forEach(o => { if (!new RegExp(g).test(o.id)) o.classList.remove('open'); }), garder || 'ov-session-end|ov-debrief-milo|ov-histo-export');
      const h = (await pg.evaluateHandle(s => [...document.querySelectorAll(s)].find(x => x.offsetParent !== null) || null, sel)).asElement();
      if (!h) { await pg.waitForTimeout(220); continue; }
      try { await h.evaluate(x => x.scrollIntoView({ block: 'center' })); await h.click({ timeout: 3000 }); await pg.waitForTimeout(200); return true; } catch (e) { await pg.waitForTimeout(200); }
    }
    return false;
  };
  const remplacer = (pg, ei, nom) => pg.evaluate(([i, n]) => { openExPickerForReplace(i); addExercise(n); return JSON.parse(JSON.stringify(S.wkt)); }, [ei, nom]);
  const attendreDebrief = async (pg, re) => { const t0 = Date.now(); let txt = '';
    while (Date.now() - t0 < 8000) { txt = await pg.evaluate(() => (document.getElementById('se-debrief') || {}).textContent || ''); if (re.test(txt)) break; await pg.waitForTimeout(150); }
    await pg.waitForTimeout(500); return txt.replace(/\s+/g, ' '); };
  const terminer = async (X, re) => { await clic(X.pg, '#nb-log'); await X.pg.waitForTimeout(300); const f = await clic(X.pg, 'button[onclick="finishWorkout()"]');
    return { clic: f, ecran: await attendreDebrief(X.pg, re || /DEBRIEF-SI01|n'a pas pu|Hors ligne/) }; };
  const lire = pg => pg.evaluate(() => {
    const mag = JSON.parse(localStorage.getItem('ft4_debriefs') || 'null');
    const fil = JSON.parse(localStorage.getItem('ft4_coach_hist') || '[]');
    return { mag, file: JSON.parse(localStorage.getItem('ft4_pending_debrief') || '[]'), recu: localStorage.getItem('ft4_debrief_recu'),
      fil: fil.map(m => (m.role === 'user' ? (m._silent ? 'u*' : 'u') : 'a') + ':' + String(m.content).slice(0, 60)),
      mem: coachHistory.map(m => (m.role === 'user' ? (m._silent ? 'u*' : 'u') : 'a') + ':' + String(m.content).slice(0, 60)),
      sessions: JSON.parse(localStorage.getItem('ft4_sessions') || '[]'), prs: JSON.parse(localStorage.getItem('ft4_prs') || '{}'),
      coachDom: (document.getElementById('coach-msgs') || {}).textContent || '' };
  });
  const nKg = (ex, kgs) => (ex.sets || []).filter(s => kgs.indexOf(+s.kg) >= 0).length;
  const cles = o => Object.keys(o).sort().join(',');

  /* ═════════ B-SI01-R — REMPLACEMENT ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([DC(), PRESSE(0)]) });
    await clic(X.pg, '#nb-log');
    const w1 = await remplacer(X.pg, 1, 'Rowing Hammer Strength');
    const r1 = w1.exs[1];
    t('R1 ⛔⛔ Presse → Rowing Hammer : aucune charge de la Presse ne survit (200 / 240 absents)',
      r1.name === 'Rowing Hammer Strength' && nKg(r1, [200, 240]) === 0 && w1.exs.length === 2, js(r1));
    t('R1b … les séries viennent de l\'historique du Rowing (É vide, puis 40×8 · 40×8 · 50×8), aucune n\'est faite',
      r1.sets.map(s => s.type + s.kg + 'x' + s.reps).join(',') === 'É0x5,N40x8,N40x8,N50x8' && r1.sets.every(s => !s.done), r1.sets.map(s => s.type + s.kg + 'x' + s.reps).join(','));
    t('R1c … ni repos prescrit, ni consigne, ni marqueur d\'auteur `_milo` : rien de propre à l\'ancien',
      cles(r1) === 'name,sets' && r1.sets.every(s => cles(s) === 'done,kg,reps,rm1,type'), cles(r1) + ' | ' + cles(r1.sets[0]));
    const w2 = await remplacer(X.pg, 1, 'Shoulder Press');
    const r2 = w2.exs[1];
    t('R2 ⛔⛔ Rowing → Shoulder Press : même invariant, les séries sont celles du Shoulder Press',
      r2.name === 'Shoulder Press' && nKg(r2, [200, 240, 40, 50]) === 0 && r2.sets.map(s => s.kg).join(',') === '0,60,80,90', js(r2));
    const prev = await X.pg.evaluate(() => getPrev('Shoulder Press').map(s => s.kg).join(','));
    t('R3 l\'historique « précédent » du nouvel exercice est le sien (60 · 80 · 90)', prev === '60,80,90', prev);
    const disque = await X.pg.evaluate(() => JSON.parse(localStorage.getItem('ft4_wkt')).exs[1]);
    t('R3b … et l\'état est ENREGISTRÉ tel quel (ft4_wkt)', disque.name === 'Shoulder Press' && nKg(disque, [200, 240]) === 0, js(disque));
    const dc = w2.exs[0];
    t('R3c l\'exercice voisin n\'est pas touché', dc.name === 'Développé Couché' && dc.sets.length === 2 && dc.sets[1].kg === 85, js(dc));
    t('R3d aucune erreur de page pendant les remplacements', X.errs.length === 0, X.errs.join(' | '));
    await X.cx.close();
  }
  {
    // R4 — deux séries faites sur la Presse, puis remplacement : elles RESTENT à la Presse.
    const X = await ouvrir({ wkt: WKT([DC(), PRESSE(2)]) });
    await clic(X.pg, '#nb-log');
    const w = await remplacer(X.pg, 1, 'Rowing Hammer Strength');
    const a = w.exs[1], bb = w.exs[2];
    t('R4 ⛔⛔ une série VALIDÉE sur la Presse reste à la Presse (200×2 É ✓ · 240×10 ✓), jamais réétiquetée',
      w.exs.length === 3 && a.name === 'Presse à Cuisses Iso-Latérale' && a.sets.length === 2 && a.sets.every(s => s.done) && a.sets.map(s => s.kg).join(',') === '200,240', js(a));
    t('R4b … le Rowing ne prend que le travail RESTANT (2 séries, de son historique, aucune faite)',
      bb.name === 'Rowing Hammer Strength' && bb.sets.length === 2 && bb.sets.every(s => !s.done) && nKg(bb, [200, 240]) === 0 && bb.sets.map(s => s.kg).join(',') === '40,40', js(bb));
    // On valide une série du Rowing et on termine : la séance enregistrée porte les deux vérités.
    await X.pg.evaluate(() => { toggleSet(2, 0); });
    const f = await terminer(X, /DEBRIEF-SI01|n'a pas pu/);
    const L = await lire(X.pg);
    const s0 = L.sessions.find(s => s.date === J && (s.exs || []).length === 3) || {};
    const pr = (s0.exs || []).find(e => /Presse/.test(e.name)) || {}, ro = (s0.exs || []).find(e => /Rowing/.test(e.name)) || {};
    t('R4c la séance ENREGISTRÉE : Presse 200×2 É + 240×10 · Rowing 40×8 — aucune charge fantôme',
      f.clic && pr.sets && pr.sets.filter(s => s.done).map(s => s.kg).join(',') === '200,240' && ro.sets && ro.sets.filter(s => s.done).map(s => s.kg).join(',') === '40', js(s0.exs));
    t('R4d … et aucun record « Rowing » à 240 kg (le volume de la presse ne passe pas au rowing)',
      !L.prs['Rowing Hammer Strength'] || L.prs['Rowing Hammer Strength'].kg < 100, js(L.prs['Rowing Hammer Strength']));
    await X.cx.close();
  }
  {
    // R4e — tout était fait : la Presse reste intacte, le Rowing s'ajoute avec la même structure.
    const X = await ouvrir({ wkt: WKT([PRESSE(4)]) });
    await clic(X.pg, '#nb-log');
    const w = await remplacer(X.pg, 0, 'Rowing Hammer Strength');
    t('R4e tout fait → la Presse garde ses 4 séries faites, le Rowing arrive derrière, vierge (structure É + 3)',
      w.exs.length === 2 && w.exs[0].sets.length === 4 && w.exs[0].sets.every(s => s.done) && w.exs[1].sets.length === 4 && w.exs[1].sets.every(s => !s.done) && w.exs[1].sets[0].type === 'É', js(w.exs.map(e => e.name + ':' + e.sets.length)));
    await X.cx.close();
  }
  {
    // R5 — superset : la place dans le groupe est une propriété de la PLACE, elle est gardée.
    const SS = (faites) => [Object.assign(PRESSE(faites), { group: 'ssA', groupType: 'super' }),
      { name: 'Curl Biceps Haltères', group: 'ssA', groupType: 'super', sets: [{ kg: 12, reps: 10, type: 'N', done: faites > 0, rm1: 0 }, { kg: 12, reps: 10, type: 'N', done: false, rm1: 0 }] }];
    const X = await ouvrir({ wkt: WKT(SS(0)) });
    await clic(X.pg, '#nb-log');
    const w = await remplacer(X.pg, 0, 'Rowing Hammer Strength');
    t('R5 superset, rien de fait : le Rowing prend la place de la Presse DANS le groupe (2 membres)',
      w.exs[0].name === 'Rowing Hammer Strength' && w.exs[0].group === 'ssA' && w.exs[0].groupType === 'super' && w.exs.filter(e => e.group === 'ssA').length === 2, js(w.exs.map(e => e.name + ':' + e.group)));
    await X.cx.close();
    const Y = await ouvrir({ wkt: WKT(SS(2)) });
    await clic(Y.pg, '#nb-log');
    const v = await remplacer(Y.pg, 0, 'Rowing Hammer Strength');
    t('R5b superset, séries faites : la Presse sort du groupe avec SES séries faites, le Rowing y entre (2 membres, jamais « Circuit (1) »)',
      v.exs.length === 3 && !v.exs[0].group && v.exs[0].sets.every(s => s.done) && v.exs[1].group === 'ssA' && v.exs[2].group === 'ssA'
      && v.exs.filter(e => e.group === 'ssA').length === 2, js(v.exs.map(e => e.name + ':' + (e.group || '-') + ':' + e.sets.length)));
    const html = await Y.pg.evaluate(() => (document.getElementById('log-exs') || document.getElementById('s-log') || {}).textContent || '');
    t('R5c … et l\'écran ne montre aucun groupe à un seul membre', !/\(1\)/.test(html), html.match(/[^.]{0,30}\(1\)/) || '');
    await Y.cx.close();
  }
  {
    // R6 — non-régressions : même nom = rien ; ajout, suppression, déplacement intacts.
    const X = await ouvrir({ wkt: WKT([DC(), PRESSE(0)]) });
    await clic(X.pg, '#nb-log');
    const avant = await X.pg.evaluate(() => JSON.stringify(S.wkt));
    const w = await remplacer(X.pg, 1, 'Presse à Cuisses Iso-Latérale');
    t('R6 remplacer par le MÊME exercice ne change rien', JSON.stringify(w) === avant, '');
    const n = await X.pg.evaluate(() => { addExercise('Shoulder Press'); const a = S.wkt.exs.length; moveExBlock(2, -1); const ordre = S.wkt.exs.map(e => e.name);
      S.wkt.exs.splice(0, 1); persist(); return { a, ordre, apres: S.wkt.exs.map(e => e.name), sp: S.wkt.exs.find(e => e.name === 'Shoulder Press').sets.map(s => s.kg).join(',') }; });
    t('R6b ajout · déplacement · suppression intacts, et l\'ajout pré-remplit toujours depuis l\'historique',
      n.a === 3 && n.ordre[1] === 'Shoulder Press' && n.apres.length === 2 && n.sp === '0,60,80', js(n));   // `addExercise` inchangé : É + 2 séries de travail
    await X.cx.close();
  }

  /* ═════════ B-SI01-D — DÉBRIEF : faux succès, retry, persistance, rendu ═════════ */
  const YATES = () => ({ name: 'Rowing Yates', sets: [{ kg: 40, reps: 10, type: 'N', done: true, rm1: 0 }, { kg: 40, reps: 10, type: 'N', done: true, rm1: 0 }, { kg: 40, reps: 10, type: 'N', done: true, rm1: 0 }] });
  {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [REPLI, OK('DEBRIEF-SI01 : belle séance de reprise, garde ce rythme.')] });
    // Le fil Coach est DÉJÀ affiché avant la séance (le cas terrain : on avait parlé à Milo).
    await clic(X.pg, '#nb-coach'); await X.pg.waitForTimeout(500);
    const domAvant = await X.pg.evaluate(() => document.querySelectorAll('#coach-msgs .msg-bubble').length);
    const f = await terminer(X);
    const L1 = await lire(X.pg);
    const sid = String((L1.sessions.find(s => (s.exs || []).some(e => e.name === 'Rowing Yates')) || {}).id || '');
    t('D1 ⛔⛔ HTTP 200 `complete:false` « Désolé, réessaie. » = ÉCHEC : l\'écran le dit et propose « Réessayer »',
      f.clic && /n'a pas pu analyser/.test(f.ecran) && !/Désolé, réessaie/.test(f.ecran)
      && await X.pg.evaluate(() => !!document.querySelector('#se-debrief .se-dbf-retry')), f.ecran.slice(-200));
    t('D2 ⛔ aucun débrief enregistré : ni magasin, ni « reçu », ni message dans le fil (mémoire et disque)',
      !(L1.mag && L1.mag.seances && L1.mag.seances[sid]) && !L1.recu && !L1.fil.some(c => /Désolé|DÉBRIEF AUTO/.test(c)) && !L1.mem.some(c => /Désolé|DÉBRIEF AUTO/.test(c)), js({ mag: L1.mag, recu: L1.recu, fil: L1.fil }));
    t('D3 ⛔ le jeton est RENDU : la séance est en tête de file, le nouvel essai reste possible', sid && L1.file[0] === sid, js(L1.file) + ' / ' + sid);
    t('D4 ⛔ aucun summarizeCoach payé sur le faux succès', X.st.summarize === 0 && X.st.coach.length === 1, 'summarize=' + X.st.summarize + ' coach=' + X.st.coach.length);
    const re = await clic(X.pg, '#se-debrief .se-dbf-retry');
    const txt = await attendreDebrief(X.pg, /DEBRIEF-SI01/);
    const L2 = await lire(X.pg);
    t('D5 « Réessayer » → débrief VALIDE affiché, sous le socle chiffré', re && /DEBRIEF-SI01/.test(txt) && X.st.coach.length === 2, txt.slice(-160));
    t('D6 ⛔⛔ UN seul débrief final : une entrée au magasin, un seul message dans le fil, aucun repli conservé',
      L2.mag && Object.keys(L2.mag.seances).length === 1 && /DEBRIEF-SI01/.test(L2.mag.seances[sid] && L2.mag.seances[sid].texte)
      && L2.fil.filter(c => /^a:DEBRIEF-SI01/.test(c)).length === 1 && L2.fil.filter(c => /^u\*:\[DÉBRIEF AUTO\]/.test(c)).length === 1 && !L2.fil.some(c => /Désolé/.test(c)), js({ mag: L2.mag, fil: L2.fil }));
    t('D6b … le jeton est consommé (plus dans la file), le « reçu » effacé, un seul summarizeCoach (après le VRAI débrief)',
      L2.file.indexOf(sid) < 0 && !L2.recu && X.st.summarize === 1, js({ file: L2.file, recu: L2.recu, sum: X.st.summarize }));
    // Rendu immédiat : on ferme l'écran de fin et on va au Coach — SANS recharger.
    await clic(X.pg, '[onclick="closeSessionEnd()"]'); await clic(X.pg, '#nb-coach'); await X.pg.waitForTimeout(400);
    const dom = await X.pg.evaluate(() => ({ txt: (document.getElementById('coach-msgs') || {}).textContent || '', n: document.querySelectorAll('#coach-msgs .msg-bubble').length }));
    t('D8 ⛔⛔ le débrief est VISIBLE dans le Coach tout de suite (fil déjà affiché avant la séance), sans rechargement',
      domAvant > 0 && /DEBRIEF-SI01/.test(dom.txt) && (dom.txt.match(/DEBRIEF-SI01/g) || []).length === 1, 'avant=' + domAvant + ' | ' + dom.txt.slice(-160));
    // Rechargement : la relation séance ↔ débrief tient.
    await X.pg.reload(); await X.pg.waitForTimeout(4200);
    const L3 = await lire(X.pg);
    t('D7 ⛔ après rechargement : débrief toujours rattaché à SA séance (même identifiant), aucun appel de plus',
      L3.mag && L3.mag.seances[sid] && /DEBRIEF-SI01/.test(L3.mag.seances[sid].texte) && X.st.coach.length === 2 && L3.file.indexOf(sid) < 0, js({ cles: L3.mag && Object.keys(L3.mag.seances), coach: X.st.coach.length }));
    // B-SI01-H — Progrès
    await clic(X.pg, '#nb-progress'); await X.pg.waitForTimeout(500);
    await X.pg.evaluate(() => { try { switchProgTab('exo', document.getElementById('ptab-exo')); } catch (e) {} });
    await X.pg.waitForTimeout(400);
    const btns = await X.pg.evaluate(() => [...document.querySelectorAll('#sess-list .sess-dbf-btn')].map(x => x.getAttribute('onclick')));
    t('H1 ⛔ la séance débriefée porte « 💬 Voir le débrief Milo » (après rechargement)', btns.length === 1 && btns[0].indexOf(sid) > 0, js(btns));
    t('H2 ⛔ les séances SANS débrief n\'ont pas de faux bouton (3 séances, 1 bouton)', L3.sessions.length === 3 && btns.length === 1, L3.sessions.length + ' séances');
    const avantLecture = X.st.coach.length + X.st.summarize;
    const sessAvant = await X.pg.evaluate(() => localStorage.getItem('ft4_sessions'));
    const o = await clic(X.pg, '#sess-list .sess-dbf-btn', 'ov-debrief-milo');
    const vu = await X.pg.evaluate(() => ({ ouvert: document.getElementById('ov-debrief-milo').classList.contains('open'),
      body: document.getElementById('dbf-milo-body').textContent, sub: document.getElementById('dbf-milo-sub').textContent,
      detail: document.getElementById('ov-sess-detail') ? document.getElementById('ov-sess-detail').classList.contains('open') : false }));
    t('H1b le bouton ouvre le débrief EXACT de cette séance, la séance est identifiée (date · exercices)',
      o && vu.ouvert && /DEBRIEF-SI01/.test(vu.body) && /1 exercice/.test(vu.sub) && !vu.detail, js(vu));
    t('H3 ⛔ lire un débrief rangé = 0 appel IA, et la séance n\'est pas modifiée',
      X.st.coach.length + X.st.summarize === avantLecture && sessAvant === await X.pg.evaluate(() => localStorage.getItem('ft4_sessions')), '');
    await clic(X.pg, '#ov-debrief-milo button[onclick="fermerDebriefMilo()"]', 'ov-debrief-milo');
    t('H4 la fenêtre se ferme, et elle est déclarée dans les fermetures propres (R15)',
      await X.pg.evaluate(() => !document.getElementById('ov-debrief-milo').classList.contains('open') && _OVERLAY_CLOSERS['ov-debrief-milo'] === 'fermerDebriefMilo'), '');
    // Hors ligne : la lecture d'un débrief rangé marche sans réseau.
    await X.cx.setOffline(true);
    await clic(X.pg, '#sess-list .sess-dbf-btn', 'ov-debrief-milo');
    t('H5 hors ligne : le débrief rangé s\'ouvre quand même', await X.pg.evaluate(() => /DEBRIEF-SI01/.test(document.getElementById('dbf-milo-body').textContent)), '');
    await X.cx.setOffline(false);
    t('D-err aucune erreur de page sur tout le parcours', X.errs.length === 0, X.errs.join(' | '));
    t('D-réel ⛔ 0 appel réel à Anthropic', X.st.reels === 0, '');
    await X.cx.close();
  }
  {
    // D3b — échec, on QUITTE l'écran de fin, on revient par le Coach : le nouvel essai part tout seul.
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [REPLI, OK('DEBRIEF-SI01 rattrapé au Coach.')] });
    const f = await terminer(X);
    await clic(X.pg, '[onclick="closeSessionEnd()"]');
    await clic(X.pg, '#nb-coach');
    const t0 = Date.now(); let L = null;
    while (Date.now() - t0 < 8000) { L = await lire(X.pg); if (L.mag && Object.keys(L.mag.seances).length) break; await X.pg.waitForTimeout(200); }
    await X.pg.waitForTimeout(500); L = await lire(X.pg);
    const sid = String((L.sessions.find(s => (s.exs || []).some(e => e.name === 'Rowing Yates')) || {}).id || '');
    t('D3b échec → quitter l\'écran → Coach : le débrief est refait et rangé à SA séance (chemin du Coach)',
      /n'a pas pu/.test(f.ecran) && L.mag && L.mag.seances[sid] && /rattrapé au Coach/.test(L.mag.seances[sid].texte) && L.file.indexOf(sid) < 0 && /rattrapé au Coach/.test(L.coachDom), js({ mag: L.mag, file: L.file }));
    await X.cx.close();
  }
  {
    // D1b — le chemin du Coach, lui aussi, refuse `complete:false` : rien d'affiché, rien de rangé, jeton rendu.
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ status: 502 }, REPLI] });
    await terminer(X);
    await clic(X.pg, '[onclick="closeSessionEnd()"]');
    await clic(X.pg, '#nb-coach'); await X.pg.waitForTimeout(2500);
    const L = await lire(X.pg);
    const sid = String((L.sessions.find(s => (s.exs || []).some(e => e.name === 'Rowing Yates')) || {}).id || '');
    t('D1b Coach : HTTP 502 puis `complete:false` → aucune bulle « Désolé », rien de rangé, jeton RENDU, aucune consigne cachée laissée',
      X.st.coach.length === 2 && !/Désolé/.test(L.coachDom) && !(L.mag && L.mag.seances && L.mag.seances[sid]) && L.file[0] === sid
      && !L.mem.some(c => /DÉBRIEF AUTO/.test(c)) && X.st.summarize === 0, js({ coach: X.st.coach.length, file: L.file, mem: L.mem, sum: X.st.summarize }));
    await X.cx.close();
  }
  {
    // D1c — un ancien « reçu » de repli (écrit par une version d'avant) n'est jamais posé comme débrief.
    const X = await ouvrir({ sessions: HIST(), stock: { ft4_debrief_recu: JSON.stringify({ id: '1001', ts: Date.now(), reply: 'Désolé, réessaie.', instr: '[DÉBRIEF AUTO] x' }) }, attente: 4500 });
    const L = await lire(X.pg);
    t('D1c un ancien « reçu » « Désolé, réessaie. » → la séance retourne en file, rien n\'est posé ni rangé',
      !L.recu && L.file.indexOf('1001') >= 0 && !L.fil.some(c => /Désolé/.test(c)) && !(L.mag && L.mag.seances && L.mag.seances['1001']), js(L));
    await X.cx.close();
  }

  /* ═════════ B-SI01-D9 / E — plusieurs séances, et l'export avec / sans ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [OK('TXT-UN débrief de la première.'), OK('TXT-DEUX débrief de la seconde.')] });
    await terminer(X, /TXT-UN/);
    await clic(X.pg, '[onclick="closeSessionEnd()"]');
    await X.pg.evaluate(j => { S.wkt = { date: j, startHour: 18, exs: [{ name: 'Shoulder Press', sets: [{ kg: 70, reps: 8, type: 'N', done: true, rm1: 0 }] }] }; persist(); }, J);
    await X.pg.waitForTimeout(1100);   // deux identifiants (Date.now) distincts
    await terminer(X, /TXT-DEUX/);
    await clic(X.pg, '[onclick="closeSessionEnd()"]');
    const L = await lire(X.pg);
    const sY = String((L.sessions.find(s => (s.exs || []).some(e => e.name === 'Rowing Yates')) || {}).id || '');
    const sS = String((L.sessions.find(s => s.date === J && (s.exs || []).some(e => e.name === 'Shoulder Press')) || {}).id || '');
    t('D9 ⛔⛔ deux séances le même jour : chacune SON débrief, aucun croisement',
      sY && sS && sY !== sS && /TXT-UN/.test(L.mag.seances[sY].texte) && /TXT-DEUX/.test(L.mag.seances[sS].texte), js(L.mag));
    await clic(X.pg, '#nb-progress'); await X.pg.evaluate(() => { try { switchProgTab('exo', document.getElementById('ptab-exo')); } catch (e) {} }); await X.pg.waitForTimeout(400);
    const lus = await X.pg.evaluate(([a, c]) => { voirDebriefMilo(a); const x = document.getElementById('dbf-milo-body').textContent; voirDebriefMilo(c); const y = document.getElementById('dbf-milo-body').textContent; fermerDebriefMilo(); return [x, y]; }, [sY, sS]);
    t('D9b … et chaque bouton ouvre le bon texte', /TXT-UN/.test(lus[0]) && !/TXT-DEUX/.test(lus[0]) && /TXT-DEUX/.test(lus[1]) && !/TXT-UN/.test(lus[1]), js(lus));
    // Export : on capte le fichier au lieu de le donner (la livraison réelle n'est pas l'objet ici).
    await X.pg.evaluate(() => { window.__fichiers = []; window._donnerFichier = async (c, n, m) => {
      let txt = c; if (c && typeof c !== 'string') { const buf = await c.arrayBuffer(); txt = Array.from(new Uint8Array(buf)).map(x => String.fromCharCode(x)).join(''); }
      window.__fichiers.push({ nom: n, mime: m, txt }); return 'ok'; }; });
    await X.pg.evaluate(() => openHistoExport()); await X.pg.waitForTimeout(200);
    const choix = await X.pg.evaluate(() => ({ visible: document.getElementById('histo-exp-dbf').style.display !== 'none', n: document.getElementById('histo-exp-dbf-n').textContent,
      sans: document.getElementById('histo-exp-sans').classList.contains('on') }));
    t('E0 le choix « Sans / Avec les débriefs » est proposé (2 séances débriefées), « Sans » par défaut', choix.visible && choix.n === '2' && choix.sans, js(choix));
    await clic(X.pg, '#ov-histo-export button[onclick="exportHistoCsv()"]', 'ov-histo-export');
    await X.pg.evaluate(() => openHistoExport());
    await clic(X.pg, '#histo-exp-avec', 'ov-histo-export');
    await clic(X.pg, '#ov-histo-export button[onclick="exportHistoCsv()"]', 'ov-histo-export');
    const F = await X.pg.evaluate(() => window.__fichiers.map(f => ({ nom: f.nom, txt: f.txt })));
    const sans = (F[0] || {}).txt || '', avec = (F[1] || {}).txt || '';
    const ref = await X.pg.evaluate(() => '﻿' + HISTO_COLONNES.join(';') + '\n' + _histoLignes().map(r => HISTO_COLONNES.map(c => _csvEchappe(r[c])).join(';')).join('\n'));
    t('E1 ⛔⛔ export SANS : aucun texte de débrief, et le fichier est EXACTEMENT celui d\'avant (mêmes colonnes, mêmes lignes)',
      sans && !/TXT-UN|TXT-DEUX|debrief_milo|DEBRIEF/.test(sans) && sans === ref, sans.slice(0, 160));
    const lignes = avec.split('\n'), tete = lignes[0].replace('﻿', '').split(';');
    const iId = tete.indexOf('seance_id'), iTx = tete.indexOf('debrief_milo'), iTy = tete.indexOf('type'), iEx = tete.indexOf('exercise');
    const cel = l => l.match(/("([^"]|"")*"|[^;]*)(;|$)/g).map(x => x.replace(/;$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
    const rows = lignes.slice(1).map(cel);
    const dY = rows.find(r => r[iTy] === 'DEBRIEF' && /TXT-UN/.test(r[iTx])), dS = rows.find(r => r[iTy] === 'DEBRIEF' && /TXT-DEUX/.test(r[iTx]));
    const yatesId = (rows.find(r => r[iEx] === 'Rowing Yates') || [])[iId], spId = (rows.find(r => r[iEx] === 'Shoulder Press' && r[iId] === sS) || [])[iId];
    t('E2 ⛔⛔ export AVEC : chaque débrief est rattaché sans ambiguïté à SA séance (seance_id identique à ses séries)',
      iId > 0 && iTx > 0 && dY && dS && dY[iId] === sY && yatesId === sY && dS[iId] === sS && spId === sS && rows.filter(r => r[iTy] === 'DEBRIEF').length === 2, js({ tete, dY, dS }));
    // PDF avec / sans
    await X.pg.evaluate(() => { openHistoExport(); }); await X.pg.waitForTimeout(150);
    await clic(X.pg, '#ov-histo-export button[onclick="exportHistoPdf()"]', 'ov-histo-export'); await X.pg.waitForTimeout(1500);
    await X.pg.evaluate(() => { openHistoExport(); choisirDebriefsExport(true); });
    await clic(X.pg, '#ov-histo-export button[onclick="exportHistoPdf()"]', 'ov-histo-export'); await X.pg.waitForTimeout(1500);
    const P = await X.pg.evaluate(() => window.__fichiers.filter(f => /\.pdf$/.test(f.nom)).map(f => f.txt));
    t('E3 PDF SANS : aucun débrief · PDF AVEC : les deux débriefs, sous leurs séances',
      P.length === 2 && !/TXT-UN|TXT-DEUX/.test(P[0]) && /TXT-UN/.test(P[1]) && /TXT-DEUX/.test(P[1]) && /brief Milo/.test(P[1]), 'pdf=' + P.length);
    t('E-err aucune erreur de page', X.errs.length === 0, X.errs.join(' | '));
    await X.cx.close();
  }

  /* ═════════ B-SI01-P — PREMIÈRE RÉFÉRENCE ≠ RECORD (D-045) · B-SI01-G — N-G2 ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]) });
    const f = await terminer(X);
    const ecran = await X.pg.evaluate(() => (document.getElementById('se-stats') || {}).textContent || '');
    const L = await lire(X.pg);
    t('P1 ⛔⛔ 1ʳᵉ fois sur le Rowing Yates → « Première référence enregistrée », AUCUN « record battu »',
      /Première référence enregistrée/.test(ecran) && /Rowing Yates/.test(ecran) && !/record/i.test(ecran), ecran);
    t('P1b … la référence est gardée (`S.prs`) et marquée `premiere`', L.prs['Rowing Yates'] && L.prs['Rowing Yates'].premiere === true && L.prs['Rowing Yates'].kg === 40, js(L.prs['Rowing Yates']));
    const ctx = await X.pg.evaluate(() => buildCoachContext('débrief'));
    t('P1c Milo reçoit « 1ʳᵉ référence, pas un record » et elle n\'est PAS « Dernier RECORD en date »',
      /Rowing Yates: 40kg×10 \([^)]*\) \[1ʳᵉ référence, pas un record\]/.test(ctx) && !/Dernier RECORD en date: Rowing Yates/.test(ctx), (ctx.match(/Dernier RECORD[^\n]*/) || [''])[0]);
    const dbf = await X.pg.evaluate(() => (document.getElementById('se-debrief') || {}).textContent || '');
    t('G1 ⛔⛔ N-G2 : la séance n\'est pas jugée contre le record qu\'elle vient de créer (aucune remarque d\'intensité sur une 1ʳᵉ fois)',
      // ⚠️ Le motif vise la REMARQUE elle-même (« 3×10 à 40 kg »), pas « Rowing Yates … ⚡ » : les séries sont
      // séparées par « · » dans le contexte, un `[^·]*` ne la trouvait jamais (témoin aveugle trouvé par M12b).
      !/tenable|1RM estimé/.test(dbf) && /Rowing Yates: S1 40×10/.test(ctx) && !/⚡ intensité — [^\]]*3×10 à 40 kg/.test(ctx), dbf.slice(0, 200));
    const s0 = L.sessions.find(s => (s.exs || []).some(e => e.name === 'Rowing Yates')) || {};
    t('G1b … la référence d\'avant la séance est figée sur la séance (`refAvant` = 0 : aucune référence)', s0.refAvant && s0.refAvant['Rowing Yates'] === 0, js(s0.refAvant));
    await X.cx.close();
  }
  {
    const cas = async (sets, nom) => { const X = await ouvrir({ wkt: WKT([{ name: 'Développé Couché', sets }]) }); await terminer(X);
      const r = { ecran: await X.pg.evaluate(() => (document.getElementById('se-stats') || {}).textContent || ''), L: await lire(X.pg),
        ctx: await X.pg.evaluate(() => buildCoachContext('débrief')) }; await X.cx.close(); return r; };
    const sup = await cas([{ kg: 85, reps: 5, type: 'N', done: true, rm1: 0 }]);
    t('P2 ⛔ vrai nouveau record (85×5 > 80×5 antérieur) → « 1 record battu », sans marqueur `premiere`',
      /1 record battu/.test(sup.ecran) && !/Première référence/.test(sup.ecran) && sup.L.prs['Développé Couché'].kg === 85 && !sup.L.prs['Développé Couché'].premiere, sup.ecran);
    t('P2b … et c\'est bien lui le « Dernier RECORD en date »', /Dernier RECORD en date: Développé Couché 85kg×5/.test(sup.ctx), (sup.ctx.match(/Dernier RECORD[^\n]*/) || [''])[0]);
    const egalr = await cas([{ kg: 80, reps: 5, type: 'N', done: true, rm1: 0 }]);
    t('P3 ⛔ performance ÉGALE → pas de record', !/record/i.test(egalr.ecran) && egalr.L.prs['Développé Couché'].kg === 80, egalr.ecran);
    const inf = await cas([{ kg: 70, reps: 5, type: 'N', done: true, rm1: 0 }]);
    t('P3b ⛔ performance INFÉRIEURE → pas de record', !/record/i.test(inf.ecran) && inf.L.prs['Développé Couché'].kg === 80, inf.ecran);
    const ech = await cas([{ kg: 120, reps: 1, type: 'É', done: true, rm1: 0 }, { kg: 70, reps: 5, type: 'N', done: true, rm1: 0 }]);
    t('P4 ⛔ un ÉCHAUFFEMENT lourd ne crée ni record ni référence (règle existante `_serieFaitFoiPourPR`)', !/record/i.test(ech.ecran) && ech.L.prs['Développé Couché'].kg === 80, ech.ecran);
    const s0 = sup.L.sessions.find(s => s.date === J) || {};
    t('G2 N-G2 : sur un vrai record, la référence figée est celle d\'AVANT (90), pas la nouvelle', s0.refAvant && s0.refAvant['Développé Couché'] === 90, js(s0.refAvant));
  }

  /* ═════════ B-SI01-T — LE 03/10 REJOUÉ DE BOUT EN BOUT ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([DC(), PRESSE(0)]), reponses: [REPLI, OK('DEBRIEF-SI01 terrain : Shoulder Press propre à 90×5.')] });
    await clic(X.pg, '#nb-coach'); await X.pg.waitForTimeout(400);           // fil déjà affiché
    await clic(X.pg, '#nb-log');
    await remplacer(X.pg, 1, 'Rowing Hammer Strength');                        // ① remplacement
    const w = await remplacer(X.pg, 1, 'Shoulder Press');                       // ② second remplacement
    await X.pg.evaluate(() => { const e = S.wkt.exs[1]; e.sets[0].kg = 40; e.sets[0].reps = 8; [1, 2, 3].forEach(i => { e.sets[i].kg = 90; e.sets[i].reps = 5; });
      persist(); [0, 1, 2, 3].forEach(i => toggleSet(1, i)); toggleSet(0, 1); });  // ③ vraies séries saisies
    const f = await terminer(X);                                                 // ④ fin + échec
    const re = await clic(X.pg, '#se-debrief .se-dbf-retry');                    // ⑤ retry
    await attendreDebrief(X.pg, /DEBRIEF-SI01 terrain/);
    await clic(X.pg, '[onclick="closeSessionEnd()"]');
    await clic(X.pg, '#nb-coach'); await X.pg.waitForTimeout(300);
    const coach = await X.pg.evaluate(() => (document.getElementById('coach-msgs') || {}).textContent || '');
    await X.pg.reload(); await X.pg.waitForTimeout(4200);                       // ⑥ rechargement
    await clic(X.pg, '#nb-progress'); await X.pg.evaluate(() => { try { switchProgTab('exo', document.getElementById('ptab-exo')); } catch (e) {} }); await X.pg.waitForTimeout(300);
    const o = await clic(X.pg, '#sess-list .sess-dbf-btn', 'ov-debrief-milo');
    const vu = await X.pg.evaluate(() => document.getElementById('dbf-milo-body').textContent);
    const L = await lire(X.pg);
    const ses = L.sessions.filter(s => s.date === J);
    const sp = ((ses[0] || {}).exs || []).find(e => e.name === 'Shoulder Press') || {};
    t('T1 ⛔⛔ une seule séance du jour, le bon exercice, le travail réellement fait (40×8 É · 90×5 ×3), aucune charge fantôme',
      ses.length === 1 && w.exs[1].sets.every(s => s.kg !== 200 && s.kg !== 240) && (sp.sets || []).filter(s => s.done).map(s => s.kg + 'x' + s.reps).join(',') === '40x8,90x5,90x5,90x5'
      && !JSON.stringify(ses[0].exs).match(/"kg":2[04]0/), js(ses[0] && ses[0].exs));
    t('T2 ⛔⛔ un seul débrief valide, au bon identifiant, visible au Coach, retrouvé après rechargement dans Progrès',
      f.clic && re && /DEBRIEF-SI01 terrain/.test(coach) && o && /DEBRIEF-SI01 terrain/.test(vu) && Object.keys(L.mag.seances).length === 1 && L.mag.seances[String(ses[0].id)]
      && !L.fil.some(c => /Désolé/.test(c)), js({ mag: L.mag && Object.keys(L.mag.seances), id: ses[0] && ses[0].id }));
    t('T3 ⛔ aucun record fantôme à 240 kg, aucun summarizeCoach sur l\'échec', !Object.values(L.prs).some(p => +p.kg >= 200) && X.st.summarize === 1, js(L.prs));
    t('T-err aucune erreur de page, 0 appel réel', X.errs.length === 0 && X.st.reels === 0, X.errs.join(' | '));
    await X.cx.close();
  }
};
