/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🛡️ SESSION-INTEGRITY-01 — le cycle séance → remplacement → fin → débrief → persistance →
   historique → export, tenu de bout en bout (session-B · 04/10/2026)

   Source des défauts : docs/SESSION-MILO-E2E-01.md (parcours réel de Michel, 03/10).
   Blocs : B-SI01-S (source) · B-SI01-R (remplacement) · B-SI01-D (débrief) · B-SI01-H (Progrès)
           · B-SI01-E (export) · B-SI01-P (première référence / records) · B-SI01-G (N-G2)
           · B-SI01-T (scénario 03/10 complet).

   Ce que les témoins CONDUISENT : l'onglet Séance, le remplacement par le sélecteur
   (`openExPickerForReplace` + `addExercise`, comme les témoins CXVI / CLXXVIII), la case ✓ d'une
   série, le bouton « Terminer » (`finishWorkout`), « Analyser cette séance avec Milo » et « Réessayer » de l'écran de fin, sa
   fermeture, l'onglet Coach, l'onglet Progrès, le bouton « Voir le débrief Milo », la fenêtre
   d'export (« Sans / Avec les débriefs », CSV, PDF), un VRAI rechargement.
   Frontières SIMULÉES : le Worker IA (réponses scriptées — succès, `complete:false` « Désolé,
   réessaie. », HTTP 502), Apps Script, Supabase. ⛔ 0 appel réel à Anthropic.
   Ce qu'ils OBSERVENT : `S.wkt` / `ft4_wkt`, `S.sessions` / `ft4_sessions`, `S.prs`, l'ABSENCE de la file
   `ft4_pending_debrief` et du « reçu » (retirés, DEBRIEF-ON-DEMAND-01), le magasin `ft4_debriefs`, `coachHistory` / `ft4_coach_hist`,
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
  /* 🔁 DEBRIEF-ON-DEMAND-01 (05/10/2026) — R30. S6/S7/S8 visaient les TROIS chemins du débrief automatique
     (l'écran de fin et son « reçu », le Coach `opts.debriefSess`, le rattrapage `_dbfRecuperer`). Le « reçu », le
     chemin du Coach et le rattrapage sont retirés : il n'y a plus qu'UN chemin, le clic. L'invariant qu'ils
     protégeaient — « aucun débrief n'est rangé sur un faux succès » — est réécrit sur ce qui existe. */
  t('S6 le seul chemin valide AVANT d\'enregistrer (aucun enregistrement sur un faux succès)',
    run.indexOf('_dbfReponseValide') > 0 && run.indexOf('_dbfEnregistrer(') > 0 && run.indexOf('_dbfReponseValide') < run.indexOf('_dbfEnregistrer('), '');
  const st = corps(co, 'sendToCoach');
  t('S7 le Coach n\'a plus de chemin de débrief (aucun second propriétaire de l\'écriture)',
    st.length > 0 && !/debriefSess/.test(st) && !/_dbfEnregistrer\(/.test(st), '');
  t('S8 à la mise à jour, un ancien « reçu » n\'est rangé que s\'il n\'est PAS le repli « Désolé, réessaie. »',
    /_DBF_REPLI/.test(corps(co, '_dbfOublierAncienAutomatisme')) && /_dbfEnregistrer\(r\.id/.test(corps(co, '_dbfOublierAncienAutomatisme')), '');
  const fw = corps(lo, 'finishWorkout');
  t('S9 D-045 : une absence de référence n\'est plus un record (`!old` → première référence)',
    /if\(!old\)\{_refExs\.add/.test(fw) && !/if\(!old\|\|rm>old\.rm1\)/.test(fw), '');
  t('S10 N-G2 : le record de référence est figé AVANT la mise à jour de `S.prs`',
    fw.indexOf('sess.refAvant=') > 0 && fw.indexOf('sess.refAvant=') < fw.indexOf('S.prs[ex.name]='), '');
  t('S11 l\'export lit le magasin canonique, jamais une conversation', /_dbfTexteDe\(/.test(corps(se, '_histoLignes')) && !/coachHistory|coachConversations/.test(corps(se, '_histoLignes')), '');
  /* ═════════ FINITION (04/10, après contre-vérification) — B-SI01-K (rétention) · B-SI01-Z (suppression) ═════════
     Un témoin d'écran à 260 débriefs ne voit pas un plafond caché à 1 000 : celui-ci regarde le PROPRIÉTAIRE de
     l'écriture. L'invariant (décision de Michel) : tant que la séance existe, son débrief ne disparaît pas à cause
     d'un plafond — donc celui qui ÉCRIT n'efface jamais, et un seul propriétaire efface : la suppression d'une séance. */
  t('K0 ⛔ l\'écriture d\'un débrief n\'efface JAMAIS rien (aucun plafond, aucune éviction, à aucun seuil)',
    enr && !/delete\s|\.splice\(|\.slice\(|\.sort\(/.test(enr), enr.slice(0, 160));
  const oub = corps(co, '_dbfOublier'), del = corps(se, 'deleteSessOrConfirm');
  t('Z0 UN seul propriétaire de l\'effacement (`_dbfOublier`, déclaré une fois), appelé par la suppression d\'une séance',
    oub && (tout.match(/function _dbfOublier\(/g) || []).length === 1 && /_dbfOublier\(/.test(del)
    && (tout.match(/delete\s+[\w.]*seances\[/g) || []).length === 1 && /delete\s+[\w.]*seances\[/.test(oub), del.slice(0, 200));
};

/* 📄 LIRE UN PDF COMME UN LECTEUR LE MONTRERA (finition, 04/10). jsPDF n'est pas compressé ici : on relève les
   chaînes réellement dessinées (`(…) Tj`), on défait les échappements PDF, puis on décode le jeu de la police
   standard (WinAnsi = Windows-1252) — exactement ce qu'un lecteur affiche. ⚠️ Une chaîne que jsPDF a dû passer
   en « 16 bits » (un seul caractère hors de ce jeu suffit) garde ses octets nuls : c'est la ligne en charabia. */
const CP1252 = { 0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…', 0x86: '†', 0x87: '‡', 0x88: 'ˆ', 0x89: '‰', 0x8A: 'Š', 0x8B: '‹', 0x8C: 'Œ',
  0x8E: 'Ž', 0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—', 0x98: '˜', 0x99: '™', 0x9A: 'š', 0x9B: '›', 0x9C: 'œ', 0x9E: 'ž', 0x9F: 'Ÿ' };
const lirePdf = bin => { const out = []; const re = /\(((?:\\[\s\S]|[^\\)])*)\)\s*Tj/g; let m;
  while ((m = re.exec(bin))) out.push(m[1].replace(/\\([0-7]{1,3}|[\s\S])/g, (a, c) => /^[0-7]+$/.test(c) ? String.fromCharCode(parseInt(c, 8)) : ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' }[c] || c))
    .replace(/[\x80-\x9f]/g, ch => CP1252[ch.charCodeAt(0)] || ch));
  return out; };
/* Le jeu de données de l'export : DATES FIXES (la référence historique ne dépend pas du jour où l'on teste). */
const MS = (j, h) => Date.UTC(2026, 8, j, h, 0);   // septembre 2026
const SEANCES_PDF = () => [
  { id: MS(8, 16), ts: MS(8, 16), date: '2026-09-08', volume: 1360, progLabel: 'Haut', exs: [{ name: 'Shoulder Press', sets: [{ kg: 60, reps: 8, type: 'N', done: true }, { kg: 70, reps: 8, type: 'N', done: true }] }] },
  { id: MS(8, 7), ts: MS(8, 7), date: '2026-09-08', volume: 800, exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 5, type: 'N', done: true }, { kg: 80, reps: 5, type: 'N', done: true }] }] },
  { id: MS(1, 8), ts: MS(1, 8), date: '2026-09-01', volume: 1500, progLabel: 'Jambes → force 💪', exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, type: 'N', done: true }, { kg: 100, reps: 5, type: 'É', done: true }, { kg: 100, reps: 5, type: 'N', done: true }] }] },
  { id: MS(1, 6), ts: MS(1, 6), date: '2026-08-25', volume: 300, exs: [{ name: 'Curl Biceps Haltères', sets: [{ kg: 15, reps: 10, type: 'N', done: true }] }] }];
/* ⭐ RÉFÉRENCE HISTORIQUE de l'export « sans débriefs » : produite par le code de MASTER c3c830ab (ft-v1249, avant
   SESSION-INTEGRITY-01), servi tel quel, même jeu de données, même lecture — `node tools/ref_pdf_sans_si01.js <arbre>`.
   La date d'export est la seule partie variable ; elle est neutralisée des deux côtés. */
const REF_PDF_SANS = ["Historique d'entraînement","3 séances · 8 séries · exporté le <date>","Séries validées uniquement. Aucune donnée de santé (ni poids de corps, ni âge, ni sexe).","Mardi 8 septembre 2026","Exercice","Série","Type","kg","Reps","RIR","Volume","Shoulder Press","1","N","60","8","480","Shoulder Press","2","N","70","8","560","Développé Couché","1","N","80","5","400","Développé Couché","2","N","80","5","400","Mardi 1 septembre 2026","Exercice","Série","Type","kg","Reps","RIR","Volume","Squat","1","N","100","5","500","Squat","2","É","100","5","500","Squat","3","N","100","5","500","Mardi 25 août 2026","Exercice","Série","Type","kg","Reps","RIR","Volume","Curl Biceps Haltères","1","N","15","10","150"];
const normPdf = L => L.map(s => s.replace(/exporté le \d{2}\/\d{2}\/\d{4}/, 'exporté le <date>'));
module.exports.PDF = { lirePdf, SEANCES_PDF, normPdf };

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
  /* 🔁 DEBRIEF-ON-DEMAND-01 : terminer n'appelle plus Milo. Ces blocs éprouvent ce qui se passe QUAND la personne
     le demande — `terminer` clique donc « Analyser cette séance avec Milo », comme elle (sauf `sansAnalyse`). */
  const terminer = async (X, re, sansAnalyse) => { await clic(X.pg, '#nb-log'); await X.pg.waitForTimeout(300); const f = await clic(X.pg, 'button[onclick="finishWorkout()"]');
    if (!sansAnalyse) { await X.pg.waitForTimeout(300); await clic(X.pg, '#se-debrief .se-dbf-go'); }
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
    /* 🔁 DEBRIEF-ON-DEMAND-01 (R30) : D3 exigeait que le jeton revienne EN TÊTE DE FILE (le débrief repartait seul).
       Il n'y a plus de file : l'invariant « le nouvel essai reste possible » est tenu par le bouton, et RIEN ne repart seul. */
    t('D3 ⛔ aucun nouvel essai caché : aucune file, un seul appel, et « Réessayer » reste là pour la personne',
      sid && L1.file.length === 0 && X.st.coach.length === 1 && await X.pg.evaluate(() => !!document.querySelector('#se-debrief .se-dbf-retry')), js(L1.file) + ' / ' + sid);
    t('D4 ⛔ aucun summarizeCoach payé sur le faux succès', X.st.summarize === 0 && X.st.coach.length === 1, 'summarize=' + X.st.summarize + ' coach=' + X.st.coach.length);
    const re = await clic(X.pg, '#se-debrief .se-dbf-retry');
    const txt = await attendreDebrief(X.pg, /DEBRIEF-SI01/);
    const L2 = await lire(X.pg);
    t('D5 « Réessayer » → débrief VALIDE affiché, sous le socle chiffré', re && /DEBRIEF-SI01/.test(txt) && X.st.coach.length === 2, txt.slice(-160));
    t('D6 ⛔⛔ UN seul débrief final : une entrée au magasin, un seul message dans le fil, aucun repli conservé',
      L2.mag && Object.keys(L2.mag.seances).length === 1 && /DEBRIEF-SI01/.test(L2.mag.seances[sid] && L2.mag.seances[sid].texte)
      && L2.fil.filter(c => /^a:DEBRIEF-SI01/.test(c)).length === 1 && L2.fil.filter(c => /^u\*:\[DÉBRIEF AUTO\]/.test(c)).length === 1 && !L2.fil.some(c => /Désolé/.test(c)), js({ mag: L2.mag, fil: L2.fil }));
    t('D6b … rien en file, aucun « reçu », un seul summarizeCoach (après le VRAI débrief)',
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
    /* 🔁 D3b — RETOURNÉ (DEBRIEF-ON-DEMAND-01, R30). Avant : échec → quitter l'écran → ouvrir le Coach, et le nouvel
       essai partait TOUT SEUL (chemin du Coach). C'est exactement l'appel sans clic que la décision retire. Nouvel
       attendu : le Coach ne relance rien ; le nouvel essai part quand la personne le demande, depuis Progrès, et le
       débrief est rangé à SA séance. */
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [REPLI, OK('DEBRIEF-SI01 relancé depuis Progrès.')] });
    const f = await terminer(X);
    await clic(X.pg, '[onclick="closeSessionEnd()"]');
    await clic(X.pg, '#nb-coach'); await X.pg.waitForTimeout(2500);
    let L = await lire(X.pg);
    const sid = String((L.sessions.find(s => (s.exs || []).some(e => e.name === 'Rowing Yates')) || {}).id || '');
    t('D3b ⛔⛔ échec → quitter l\'écran → Coach : RIEN ne repart seul (1 appel, rien de rangé)',
      /n'a pas pu/.test(f.ecran) && X.st.coach.length === 1 && !(L.mag && L.mag.seances && L.mag.seances[sid]), js({ coach: X.st.coach.length, mag: L.mag }));
    await clic(X.pg, '#nb-progress'); await X.pg.waitForTimeout(500);
    await X.pg.evaluate(() => { try { switchProgTab('exo', document.getElementById('ptab-exo')); } catch (e) {} });
    await X.pg.waitForTimeout(400);
    const go = await clic(X.pg, '#sess-list .sess-dbf-go[onclick*="' + sid + '"]', 'ov-debrief-milo');
    const t0 = Date.now();
    while (Date.now() - t0 < 8000) { L = await lire(X.pg); if (L.mag && L.mag.seances && L.mag.seances[sid]) break; await X.pg.waitForTimeout(200); }
    t('D3c … « Analyser avec Milo » dans Progrès relance (2ᵉ appel) et range le débrief à SA séance',
      go && X.st.coach.length === 2 && L.mag && L.mag.seances[sid] && /relancé depuis Progrès/.test(L.mag.seances[sid].texte) && L.file.length === 0, js({ coach: X.st.coach.length, mag: L.mag }));
    await X.cx.close();
  }
  {
    /* 🔁 D1b — RÉÉCRIT (R30). Avant : « le chemin du COACH, lui aussi, refuse `complete:false` » (502 puis repli). Le
       chemin du Coach est retiré, et le moteur faisait 2 essais réseau cachés. Invariant gardé : une erreur HTTP
       n'affiche ni ne range rien, et ne laisse aucune consigne cachée dans le fil. Nouveau : UN essai par clic. */
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ status: 502 }, REPLI] });
    const f = await terminer(X);
    await clic(X.pg, '[onclick="closeSessionEnd()"]');
    await clic(X.pg, '#nb-coach'); await X.pg.waitForTimeout(2500);
    const L = await lire(X.pg);
    const sid = String((L.sessions.find(s => (s.exs || []).some(e => e.name === 'Rowing Yates')) || {}).id || '');
    t('D1b HTTP 502 → UN seul appel (aucun essai caché), aucune bulle « Désolé », rien de rangé, aucune consigne cachée laissée, Coach muet',
      /n'a pas pu/.test(f.ecran) && X.st.coach.length === 1 && !/Désolé/.test(L.coachDom) && !(L.mag && L.mag.seances && L.mag.seances[sid]) && L.file.length === 0
      && !L.mem.some(c => /DÉBRIEF AUTO/.test(c)) && X.st.summarize === 0, js({ coach: X.st.coach.length, file: L.file, mem: L.mem, sum: X.st.summarize }));
    await X.cx.close();
  }
  {
    /* D1c — un ancien « reçu » de repli (écrit par une version d'avant) n'est jamais posé comme débrief.
       🔁 (R30) Avant, la séance « retournait en file » ; il n'y a plus de file : la clé est oubliée, rien ne part. */
    const X = await ouvrir({ sessions: HIST(), stock: { ft4_debrief_recu: JSON.stringify({ id: '1001', ts: Date.now(), reply: 'Désolé, réessaie.', instr: '[DÉBRIEF AUTO] x' }) }, attente: 4500 });
    const L = await lire(X.pg);
    t('D1c un ancien « reçu » « Désolé, réessaie. » → oublié, rien n\'est posé ni rangé, aucun appel',
      !L.recu && L.file.length === 0 && !L.fil.some(c => /Désolé/.test(c)) && !(L.mag && L.mag.seances && L.mag.seances['1001']) && X.st.coach.length === 0, js(L));
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

  /* ═════════ FINITION (04/10/2026, après contre-vérification) — décisions de Michel ═════════
     ① plus de plafond de 200 débriefs · ② supprimer une séance supprime SON débrief · ③ l'export PDF garde les
     caractères que jsPDF sait écrire. Débriefs locaux seulement (ratifié) : rien ici ne touche le cloud. */

  /* ═════════ B-SI01-K — RÉTENTION : tant que la séance existe, son débrief reste ═════════
     260 séances existantes, 260 débriefs écrits par le propriétaire unique (`_dbfEnregistrer`, celui des trois chemins),
     avec une horloge À REBOURS (le plus récent porte le plus petit `ts`) : aucune survie ne peut dépendre de
     `Date.now`. ~1 400 caractères par débrief : la taille d'un vrai débrief, pas un jouet. */
  {
    const N = 260, t0 = Date.UTC(2025, 11, 1, 9, 0);
    const ids = Array.from({ length: N }, (_, i) => String(t0 + i * 86400000));
    const sess = ids.map(id => ({ id: +id, ts: +id, date: new Date(+id).toISOString().slice(0, 10), volume: 500,
      exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, type: 'N', done: true }] }] }));
    const mag0 = { v: 1, autre: 'garde', seances: { [ids[0]]: { texte: 'ANCIEN', ts: 1, src: 'fin', extra: 'garde' } } };
    const X = await ouvrir({ sessions: sess, prs: {}, fil: null, stock: { ft4_debriefs: JSON.stringify(mag0) } });
    const r = await X.pg.evaluate(ids => {
      const vrai = Date.now; let h = 2e12; Date.now = () => (h -= 1000);
      const res = ids.map((id, i) => _dbfEnregistrer(id, 'TXT-K' + i + ' ' + 'x'.repeat(1400), 'fin'));
      Date.now = vrai;
      const m = JSON.parse(localStorage.getItem('ft4_debriefs'));
      return { ok: res.filter(Boolean).length, n: Object.keys(m.seances).length,
        tous: ids.every((id, i) => m.seances[id] && m.seances[id].texte.indexOf('TXT-K' + i + ' ') === 0),
        autre: m.autre, extra: (m.seances[ids[0]] || {}).extra, taille: localStorage.getItem('ft4_debriefs').length };
    }, ids);
    t('K1 ⛔⛔ 260 séances, 260 débriefs : les 260 restent (aucun plafond ; le plus ancien comme le plus récent)',
      r.ok === N && r.n === N && r.tous, js({ ok: r.ok, n: r.n, tous: r.tous }));
    t('K1b … aucune survie ne dépend de `Date.now` (horloge à rebours) · champs inconnus du magasin et de l\'entrée conservés',
      r.tous && r.autre === 'garde' && r.extra === 'garde', js({ autre: r.autre, extra: r.extra }));
    const r2 = await X.pg.evaluate(id => { _dbfEnregistrer(id, 'TXT-K5 réécrit', 'coach'); const m = JSON.parse(localStorage.getItem('ft4_debriefs'));
      return { n: Object.keys(m.seances).length, e: m.seances[id], k6: (m.seances[String(+id + 86400000)] || {}).texte || '' }; }, ids[5]);
    t('K2 ⛔ réécrire le débrief d\'une MÊME séance met à jour CETTE entrée : pas de doublon, la voisine ne bouge pas',
      r2.n === N && r2.e && r2.e.texte === 'TXT-K5 réécrit' && r2.e.src === 'coach' && r2.k6.indexOf('TXT-K6 ') === 0, js({ n: r2.n, e: r2.e, k6: r2.k6.slice(0, 12) }));
    await X.pg.reload(); await X.pg.waitForTimeout(3000);
    const r3 = await X.pg.evaluate(ids => { const m = JSON.parse(localStorage.getItem('ft4_debriefs'));
      return { n: Object.keys(m.seances).length, prem: !!_dbfTexteDe(ids[0]), der: !!_dbfTexteDe(ids[ids.length - 1]) }; }, ids);
    await clic(X.pg, '#nb-progress'); await X.pg.evaluate(() => { try { switchProgTab('exo', document.getElementById('ptab-exo')); } catch (e) {} }); await X.pg.waitForTimeout(400);
    const vus = await X.pg.evaluate(() => ({ cartes: document.querySelectorAll('#sess-list .sess-card').length, btns: document.querySelectorAll('#sess-list .sess-dbf-btn').length }));
    t('K3 ⛔ après rechargement : les 260 associations tiennent, et chaque séance affichée garde son « Voir le débrief Milo »',
      r3.n === N && r3.prem && r3.der && vus.cartes > 0 && vus.btns === vus.cartes, js({ r3, vus }));
    t('K-err aucune erreur de page', X.errs.length === 0, X.errs.join(' | '));
    await X.cx.close();
  }

  /* ═════════ B-SI01-Z — SUPPRIMER UNE SÉANCE EMPORTE SON DÉBRIEF, ET LUI SEUL ═════════
     Conduit : Progrès → la carte de la séance → « 🗑️ Supprimer » deux fois (la vraie confirmation). Deux séances le
     MÊME jour (A le matin, B le soir), une troisième (C) la semaine d'avant, une quatrième (D) sans débrief.
     L'association est l'identifiant de la séance : jamais la date, jamais « le dernier ». */
  const A = String(MS(8, 7)), B = String(MS(8, 16)), C = String(MS(1, 8)), D = String(MS(1, 6));
  const MAGZ = () => ({ v: 1, seances: { [A]: { texte: 'TXT-A matin', ts: 1, src: 'fin' }, [B]: { texte: 'TXT-B soir', ts: 2, src: 'fin' }, [C]: { texte: 'TXT-C jambes', ts: 3, src: 'coach' } } });
  const versHistorique = async X => { await clic(X.pg, '#nb-progress');
    await X.pg.evaluate(() => { try { switchProgTab('exo', document.getElementById('ptab-exo')); } catch (e) {} }); await X.pg.waitForTimeout(350); };
  const supprimer = async (X, id) => {
    await versHistorique(X);
    const a = await clic(X.pg, '#sess-list .sess-card[onclick="openSessDetail(' + id + ')"] .sess-title', 'ov-sess-detail');
    const b1 = await clic(X.pg, '#sd-del-btn', 'ov-sess-detail');                  // 1er appui : « ⚠️ Confirmer ? »
    const b2 = await clic(X.pg, '#sd-del-btn', 'ov-sess-detail');                  // 2e appui : la séance part
    await X.pg.waitForTimeout(300);
    return a && b1 && b2;
  };
  const etatZ = pg => pg.evaluate(() => ({ mag: localStorage.getItem('ft4_debriefs'), ids: JSON.parse(localStorage.getItem('ft4_sessions') || '[]').map(s => String(s.id)),
    fil: localStorage.getItem('ft4_coach_hist'), file: localStorage.getItem('ft4_pending_debrief'),
    btns: [...document.querySelectorAll('#sess-list .sess-dbf-btn')].map(x => (x.getAttribute('onclick').match(/\d{10,}/) || [''])[0]) }));
  const seances = m => Object.keys(((JSON.parse(m || '{}') || {}).seances) || {}).sort().join(',');
  {
    const X = await ouvrir({ sessions: SEANCES_PDF(), prs: {}, stock: { ft4_debriefs: JSON.stringify(MAGZ()) } });
    const av = await etatZ(X.pg);
    const ok = await supprimer(X, A);
    const ap = await etatZ(X.pg); const m = (JSON.parse(ap.mag || '{}') || {}).seances || {};
    t('Z1 ⛔⛔ séance A (matin) supprimée → SON débrief part avec elle, et lui seul',
      ok && ap.ids.indexOf(A) < 0 && !m[A] && seances(ap.mag) === [B, C].sort().join(), js({ ok, ids: ap.ids, cles: Object.keys(m) }));
    t('Z1b ⛔ deux séances le MÊME jour ne se croisent pas : le débrief du soir (B) est intact, mot pour mot',
      !!m[B] && m[B].texte === 'TXT-B soir' && !!m[C] && m[C].texte === 'TXT-C jambes', js(m));
    t('Z1c le fil du Coach n\'est pas touché par la suppression (comportement existant)', !!av.fil && av.fil === ap.fil, '');
    const ok2 = await supprimer(X, D);
    const ap2 = await etatZ(X.pg);
    t('Z2 ⛔ séance SANS débrief supprimée → le magasin ne bouge pas d\'un octet', ok2 && ap2.ids.indexOf(D) < 0 && ap2.mag === ap.mag, js({ ok2, ids: ap2.ids }));
    await X.pg.reload(); await X.pg.waitForTimeout(3000);
    await versHistorique(X);
    const ap3 = await etatZ(X.pg);
    t('Z3 ⛔ après rechargement : A reste sans débrief, B et C gardent le leur — et leur bouton',
      seances(ap3.mag) === [B, C].sort().join() && ap3.btns.slice().sort().join() === [B, C].sort().join() && ap3.ids.slice().sort().join() === [B, C].sort().join(),
      js({ btns: ap3.btns, ids: ap3.ids }));
    t('Z-err aucune erreur de page', X.errs.length === 0, X.errs.join(' | '));
    await X.cx.close();
  }
  {
    // L'autre sens : la séance du SOIR est supprimée — celle du matin garde son débrief.
    const X = await ouvrir({ sessions: SEANCES_PDF(), prs: {}, stock: { ft4_debriefs: JSON.stringify(MAGZ()) } });
    const ok = await supprimer(X, B);
    const ap = await etatZ(X.pg); const m = (JSON.parse(ap.mag || '{}') || {}).seances || {};
    t('Z4 ⛔⛔ séance B (soir) supprimée → seul SON débrief part ; A (même jour) et C intacts',
      ok && ap.ids.indexOf(B) < 0 && seances(ap.mag) === [A, C].sort().join() && m[A].texte === 'TXT-A matin', js({ ok, cles: Object.keys(m) }));
    await X.cx.close();
  }
  {
    /* Le débrief À VENIR : une séance terminée hors ligne attendait le sien (jeton en file) ; on la supprime avant.
       🔁 DEBRIEF-ON-DEMAND-01 (R30) : la file n'existe plus — une ancienne clé est OUBLIÉE au démarrage (OD-17).
       L'invariant tient tel quel : aucune séance supprimée ne coûte un appel ni ne laisse un débrief orphelin. */
    const X = await ouvrir({ sessions: SEANCES_PDF(), prs: {}, reponses: [OK('ORPHELIN débrief d\'une séance supprimée.')],
      stock: { ft4_debriefs: JSON.stringify({ v: 1, seances: { [C]: { texte: 'TXT-C jambes', ts: 3, src: 'coach' } } }), ft4_pending_debrief: JSON.stringify([A]) } });
    const ok = await supprimer(X, A);
    const ap = await etatZ(X.pg);
    await clic(X.pg, '#nb-coach'); await X.pg.waitForTimeout(2500);
    const fin = await etatZ(X.pg);
    t('Z5 ⛔⛔ séance supprimée AVANT son débrief : plus aucune file (clé oubliée) — au Coach, aucun appel payé, aucun débrief orphelin',
      ok && ap.file === null && X.st.coach.length === 0 && seances(fin.mag) === C && !/ORPHELIN/.test(fin.fil || ''),
      js({ ok, file: ap.file, coach: X.st.coach.length, cles: seances(fin.mag) }));
    await X.cx.close();
  }

  /* ═════════ B-SI01-F — EXPORT PDF : ce que jsPDF SAIT écrire reste écrit ═════════
     Mesuré dans jsPDF 2.5.2 (celui de l'app, police standard) : tout Windows-1252 s'encode — œ, €, ’, “ ”, •, ™…
     (27 caractères sur 27). Un seul caractère HORS de ce jeu (→, emoji, espace fine) fait passer TOUTE la ligne en
     charabia 16 bits. Donc : rien d'écrivable n'est retiré ; le reste est traduit quand il porte du sens (→ « -> »,
     1ʳᵉ « 1re », − « - », ≥ « >= »…), sinon retiré (emoji). Comparé au code de master pour l'export « sans ». */
  {
    const TA = '**Bravo** : le cœur, la Manœuvre — 5 €, l’épaule. « Joué » “top” ‘ok’ – fin… • ™ ÉÀÇ ×½°';
    const TB = '65 kg → 70 kg, 1ʳᵉ fois, 2ᵉ série ≥ 3, ≤ 5, −5 kg, a ≠ b ← c, séance\u202F: top 💪 fin';
    const TC = ('Longue analyse → la charge monte bien, garde le tempo et la profondeur. ').repeat(6) + 'Fin.';
    const X = await ouvrir({ sessions: SEANCES_PDF(), prs: {}, stock: { ft4_debriefs: JSON.stringify({ v: 1,
      seances: { [A]: { texte: TA, ts: 1, src: 'fin' }, [B]: { texte: TB, ts: 2, src: 'fin' }, [C]: { texte: TC, ts: 3, src: 'coach' } } }) } });
    await X.pg.evaluate(() => { window.__fichiers = []; window._donnerFichier = async (c, n) => {
      const buf = await c.arrayBuffer(); window.__fichiers.push({ nom: n, bin: Array.from(new Uint8Array(buf)).map(x => String.fromCharCode(x)).join('') }); return 'ok'; }; });
    const pdf = async avec => {
      await X.pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); openHistoExport(); });
      if (avec) await clic(X.pg, '#histo-exp-avec', 'ov-histo-export');
      await clic(X.pg, '#ov-histo-export button[onclick="exportHistoPdf()"]', 'ov-histo-export'); await X.pg.waitForTimeout(1500);
      const f = await X.pg.evaluate(() => window.__fichiers.pop()); return f && /\.pdf$/.test(f.nom) ? lirePdf(f.bin) : [];
    };
    const sans = await pdf(false), avec = await pdf(true);
    const nz = s => s.replace(/ {2,}/g, ' ').trim();                       // les espaces laissés par un emoji retiré
    const bloc = re => { const i = avec.findIndex(s => re.test(nz(s))); if (i < 0) return null; const out = [];
      for (let k = i + 1; k < avec.length && !/^Débrief Milo|^Exercice$|^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche) /.test(avec[k]); k++) out.push(avec[k]);
      return out; };
    const bA = bloc(/^Débrief Milo \(séance terminée à \d\d:\d\d\)$/), bB = bloc(/^Débrief Milo — Haut \(séance terminée à \d\d:\d\d\)$/),
      bC = bloc(/^Débrief Milo — Jambes -> force \(séance terminée à \d\d:\d\d\)$/);
    t('F1 ⛔⛔ « cœur », « Manœuvre », €, ’, « », “ ”, ‘ ’, –, —, …, •, ™, accents : écrits tels quels (rien d\'écrivable n\'est retiré)',
      !!bA && bA.length === 1 && bA[0] === 'Bravo : le cœur, la Manœuvre — 5 €, l’épaule. « Joué » “top” ‘ok’ – fin… • ™ ÉÀÇ ×½°', js(bA));
    t('F2 ⛔ hors du jeu de la police : traduit quand ça porte du sens (→ ->, 1ʳᵉ 1re, 2ᵉ 2e, ≥ >=, ≤ <=, − -, ≠ !=, ← <-, espace fine insécable), l\'emoji retiré',
      !!bB && bB.length === 1 && nz(bB[0]) === '65 kg -> 70 kg, 1re fois, 2e série >= 3, <= 5, -5 kg, a != b <- c, séance\u00A0: top fin', js(bB));
    t('F2b ⛔⛔ aucune ligne du PDF « avec » n\'est passée en charabia 16 bits (titres de débrief compris)',
      avec.length > 0 && !avec.some(s => /\x00/.test(s)), js(avec.filter(s => /\x00/.test(s)).map(s => s.replace(/\x00/g, '').slice(0, 60))));
    t('F3 ⛔ un nom de programme avec emoji et flèche ne casse pas le titre du débrief ; un long débrief se lit en entier, dans l\'ordre',
      !!bC && bC.length > 1 && nz(bC.join(' ')) === nz(TC.replace(/→/g, '->')), js({ n: bC && bC.length, debut: bC && bC[0] }));
    t('F4 ⛔⛔ export SANS débriefs : EXACTEMENT le PDF de master c3c830ab (même texte, même ordre ; seule la date d\'export est neutralisée)',
      JSON.stringify(normPdf(sans)) === JSON.stringify(REF_PDF_SANS), js(normPdf(sans).filter((s, i) => s !== REF_PDF_SANS[i]).slice(0, 4)));
    t('F-err aucune erreur de page, 0 appel réel', X.errs.length === 0 && X.st.reels === 0, X.errs.join(' | '));
    await X.cx.close();
  }
};
