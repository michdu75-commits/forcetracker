/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🎯 DEBRIEF-ON-DEMAND-01 — LE DÉBRIEF DE MILO SE DEMANDE (session-B · 05/10/2026, décision de Michel)

   Contrat : fin de séance = le résumé chiffré local + « Analyser cette séance avec Milo » ; même accès
   dans Progrès (« Analyser avec Milo » OU « Voir le débrief Milo », jamais les deux). ⛔ Sans clic, AUCUN
   appel IA : ni à la fin, ni au rechargement, ni au démarrage, ni à l'ouverture du Coach. Un clic = au plus
   UNE génération active par séance. Un échec ne range rien et n'est repris que sur un clic. Une analyse
   coupée par un rechargement se DIT (« Analyse interrompue ») et ne repart pas seule.

   Blocs : B-OD-S (source) · B-OD-E (écran conduit, OD-01 → OD-17).
   Ce que les témoins CONDUISENT : « Terminer », le minuteur RÉEL du démarrage (on attend au-delà de
   load + 3 s), le bouton « ✨ Analyser cette séance avec Milo » de l'écran de fin, « Réessayer »,
   l'onglet Coach, l'onglet Progrès et le bouton de la carte de séance (« Analyser avec Milo » / « Relancer » /
   « Voir le débrief Milo »), la suppression d'une séance (🗑️ deux fois), un VRAI rechargement.
   Frontières SIMULÉES : le Worker IA (réponses scriptées, RETARDÉES à la demande — succès, `complete:false`,
   repli « Désolé, réessaie. », HTTP 502), Apps Script, Supabase. ⛔ 0 appel réel à Anthropic.
   Ce qu'ils OBSERVENT : chaque requête `coach` qui ARRIVE au Worker simulé, le magasin `ft4_debriefs`,
   l'emplacement « en vol » `ft4_debrief_encours`, le fil `ft4_coach_hist`, `S.registre.sessionLog`, le DOM
   de l'écran de fin, de la carte Progrès et de la fenêtre « Débrief Milo ».
   Ce qu'ils NE COUVRENT PAS : deux ONGLETS ouverts en même temps, Safari iOS, le comportement réel
   d'Anthropic quand le client disparaît, l'export (couvert par B-SI01-E/F, qui ne dépend pas du déclencheur).
   Banc : tools/banc_debrief_demande.js · contrôle négatif : tools/mut_debrief_demande.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); const k = src.indexOf('\nasync function ', i + 10);
  const l = src.indexOf('\nconst ', i + 10), m = src.indexOf('\nlet ', i + 10), n = src.indexOf('\n(function', i + 10);
  const fin = [j, k, l, m, n].filter(x => x > 0); return src.slice(i, fin.length ? Math.min(...fin) : undefined); };

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-OD-S (session-B). DEBRIEF-ON-DEMAND-01 — plus aucun déclencheur automatique (source) ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const co = nu('coach.js'), lo = nu('log.js'), sc = nu('screens.js'), se = nu('setup.js');
  const tout = ['state.js', 'coach.js', 'setup.js', 'app.js', 'tracking.js', 'screens.js', 'log.js'].map(nu).join('\n');
  const run = corps(lo, '_runSeDebrief'), vue = corps(lo, '_seDebriefVue'), fin = corps(lo, '_showSessionEnd'), an = corps(se, 'analyserSeanceMilo');
  t('S1 les fonctions sont trouvées (sinon les témoins suivants ne mesurent rien)', run && vue && fin && an, [run, vue, fin, an].map(x => x.length).join('/'));
  t('S2 ⛔ l\'écran de fin n\'appelle plus le moteur : il montre la vue (aucun `_runSeDebrief(` dans `_showSessionEnd`)',
    /_seDebriefVue\(/.test(fin) && !/_runSeDebrief\(/.test(fin), fin.slice(-200));
  t('S3 ⛔ les automatismes ont DISPARU du code (aucune déclaration) : file, rattrapages, débrief à l\'ouverture du Coach, reçu, faits',
    !/function (_maybeAutoDebrief|_dbfRecuperer|_dbfRattraper|_dbfPrendre|_dbfPrendreCible|_dbfRendre|_dbfFini|_dbfRecu|_dbfAjouter|_dbfMarquerFait|_dbfFaits|_recapSeance)\(/.test(tout), '');
  t('S4 ⛔ ni l\'ouverture du Coach, ni la fin de séance, ni le démarrage ne déclenchent quoi que ce soit',
    !/_maybeAutoDebrief/.test(sc) && !/_dbfAjouter|ft4_pending_debrief/.test(corps(lo, 'finishWorkout')) && !/addEventListener\('load'[\s\S]{0,120}_dbf/.test(co), '');
  t('S5 la branche `debriefSess` de `sendToCoach` est retirée (plus aucun appelant)', !/debriefSess/.test(tout), '');
  t('S6 UN seul chemin appelle Milo pour un débrief : `_runSeDebrief`, appelé seulement par le clic (`analyserSeanceMilo`)',
    (tout.match(/_runSeDebrief\(/g) || []).length === 3 && /_runSeDebrief\(/.test(an), (tout.match(/_runSeDebrief\(/g) || []).length + ' occurrences');
  t('S7 les gardes du moteur sont dans l\'ordre : débrief rangé → en vol → hors ligne → poser « en vol » → appel',
    run.indexOf('_dbfTexteDe(sid)') < run.indexOf('_dbfEnVol(sid)') && run.indexOf('_dbfEnVol(sid)') < run.indexOf('_dbfVolPoser(sid)') && run.indexOf('_dbfVolPoser(sid)') < run.indexOf('fetch('), '');
  t('S8 la mémoire de débrief n\'est écrite qu\'APRÈS validation de la réponse',
    run.indexOf('_dbfReponseValide') > 0 && run.indexOf('_dbfReponseValide') < run.indexOf('_recordDebriefMemory') && run.indexOf('_dbfReponseValide') < run.indexOf('_dbfEnregistrer('), '');
  t('S9 la fin libère SEULEMENT la séance analysée (`_dbfVolRetirer(sid)` dans un `finally`)', /finally\{(?:\s*if\([^)]*\)\s*return;(?:\s*\/\/[^\n]*)?)?\s*_dbfVolRetirer\(sid\)/.test(run), '');
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-OD-E (session-B). DEBRIEF-ON-DEMAND-01 — écran conduit, Worker simulé, requêtes comptées ═══');
  const { jourParis } = require('../_jour.js');
  const js = x => JSON.stringify(x).slice(0, 300);
  const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
  const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 't@t.t',
    ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_lms: moisPrec, ft4_ok: '1', ft4_stmig1: '1',
    /* OD-11 instable (1 rouge sur 3, « carte introuvable ») : sans ce repère, le « Quoi de neuf » s'ouvrait au démarrage
       de CHAQUE test, par-dessus l'onglet visé. La fixture décrit un utilisateur à jour ; aucun critère ne change. */
    ft4_wn_seen: '999' };
  const J = jourParis(), J1 = jourParis(-7);
  const HIST = () => [{ id: 1001, ts: 1001, date: J1, volume: 1000, exs: [{ name: 'Rowing Yates', sets: [{ kg: 35, reps: 10, type: 'N', done: true }] }] }];
  const MEM = '\n```json\n{"objectif":"OBJ-OD tenir 40 kg","decision":"garder"}\n```';
  const OK = txt => ({ reply: txt, _diag: 'ok', stopReason: 'end_turn', truncated: false, complete: true, continued: false });
  const REPLI = { reply: 'Désolé, réessaie.', _diag: 'erreur', stopReason: null, truncated: false, complete: false, continued: false };
  const REPLI_TXT = { reply: 'Désolé, réessaie.', _diag: 'ok', stopReason: 'end_turn', truncated: false, complete: true, continued: false };
  const FIL = [{ role: 'user', content: 'Salut Milo', ts: 1 }, { role: 'assistant', content: 'Salut ! Prêt ?', ts: 2 }];
  const YATES = () => ({ name: 'Rowing Yates', sets: [1, 2, 3].map(() => ({ kg: 40, reps: 10, type: 'N', done: true, rm1: 0 })) });   // 1 200 kg
  const WKT = exs => ({ date: J, startHour: 10, exs });
  const volDe = m => { const x = /— (\d+)kg de volume/.exec(m || ''); return x ? +x[1] : null; };

  const ouvrir = async (o) => {
    o = o || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    const st = { req: [], summarize: 0, reels: 0, file: (o.reponses || []).slice(), T0: Date.now() };
    await cx.route(/supabase\.co/, r => r.abort());
    await cx.route(/anthropic\.com/, r => { st.reels++; return r.abort(); });
    await cx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json',
      body: /test=1/.test(r.request().url()) ? '{"status":"online","version":"3.5"}' : '{"status":"not_found"}' }));
    await cx.route(/workers\.dev/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      if (c.action === 'coach') {
        const m = String(c.message || '');
        const cx0 = String(c.context || ''), cb = /SÉANCE À ANALYSER \(identifiant ([^ ]+) [^\n]*\n([^\n]*)/.exec(cx0);
        st.req.push({ t: Date.now() - st.T0, vol: volDe(m), auto: /\[DÉBRIEF AUTO\]/.test(m), fin: /Je viens de terminer/.test(m),
          cibleId: cb ? cb[1] : null, cible: cb ? cb[2] : '', msg: m, nbBlocs: (cx0.match(/SÉANCE À ANALYSER/g) || []).length });
        const x = st.file.length ? st.file.shift() : { rep: OK('DEBRIEF-OD par défaut.') };
        if (x.delai) await new Promise(z => setTimeout(z, x.delai));
        try {
          if (x.status) await r.fulfill({ status: x.status, contentType: 'application/json', body: '{"error":"amont"}' });
          else await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x.rep) });
        } catch (e) {}
        return;
      }
      if (c.action === 'summarizeCoach') { st.summarize++; return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ summary: 'RESUME-OD' }) }); }
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    const init = Object.assign({}, BASE, { ft4_sessions: JSON.stringify(o.sessions || HIST()), ft4_prs: '{}', ft4_coach_hist: JSON.stringify(FIL) },
      o.wkt ? { ft4_wkt: JSON.stringify(o.wkt) } : {}, o.stock || {});
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_od'))return; sessionStorage.setItem('_od','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); st.T0 = Date.now(); await pg.waitForTimeout(o.attente || 1500);
    return { cx, pg, st, errs };
  };
  const clic = async (pg, sel, garder) => {
    for (let k = 0; k < 8; k++) {
      await pg.evaluate(g => document.querySelectorAll('.overlay.open').forEach(o => { if (!new RegExp(g).test(o.id)) o.classList.remove('open'); }), garder || 'ov-session-end|ov-sess-detail|ov-debrief-milo');
      const h = (await pg.evaluateHandle(s => [...document.querySelectorAll(s)].find(x => x.offsetParent !== null) || null, sel)).asElement();
      if (!h) { await pg.waitForTimeout(200); continue; }
      try { await h.evaluate(x => x.scrollIntoView({ block: 'center' })); await h.click({ timeout: 3000 }); await pg.waitForTimeout(150); return true; } catch (e) { await pg.waitForTimeout(200); }
    }
    return false;
  };
  const terminer = async X => { await clic(X.pg, '#nb-log'); await X.pg.waitForTimeout(250); const ok = await clic(X.pg, 'button[onclick="finishWorkout()"]'); await X.pg.waitForTimeout(400); return ok; };
  const fermerFin = X => clic(X.pg, '[onclick="closeSessionEnd()"]');
  const coach = async (X, ms) => { await clic(X.pg, '#nb-coach'); await X.pg.waitForTimeout(ms || 1500); };
  const versProgres = async X => { await clic(X.pg, '#nb-progress');
    await X.pg.evaluate(() => { try { switchProgTab('exo', document.getElementById('ptab-exo')); } catch (e) {} }); await X.pg.waitForTimeout(350);
    /* ⚠️ La liste de Progrès se dessine APRÈS l'onglet : sous charge, 350 ms ne suffisaient pas (OD-08b, OD-11, OD-17b ont
       rougi sur du code sain, « carte introuvable »). On attend une carte, 3 s au plus. */
    const t0 = Date.now(); while (Date.now() - t0 < 3000) { if (await X.pg.evaluate(() => !!document.querySelector('#sess-list .sess-card'))) break; await X.pg.waitForTimeout(150); } };
  const jusqua = async (X, ms) => { const r = ms - (Date.now() - X.st.T0); if (r > 0) await X.pg.waitForTimeout(r); };
  const etat = pg => pg.evaluate(() => {
    const mag = JSON.parse(localStorage.getItem('ft4_debriefs') || 'null');
    const sess = JSON.parse(localStorage.getItem('ft4_sessions') || '[]');
    const auj = sess.find(s => (s.exs || []).some(e => e.name === 'Rowing Yates') && s.volume === 1200) || null;
    const carte = id => { const c = [...document.querySelectorAll('#sess-list .sess-card')].find(x => (x.getAttribute('onclick') || '').indexOf(String(id)) >= 0);
      return c ? [...c.querySelectorAll('.sess-dbf-btn,.sess-dbf-go')].map(x => x.textContent.trim()) : null; };
    return { sid: auj ? String(auj.id) : '', mag: mag ? Object.keys(mag.seances) : [], magTxt: mag ? Object.values(mag.seances).map(e => e.texte.slice(0, 50)) : [],
      encours: JSON.parse(localStorage.getItem('ft4_debrief_encours') || 'null'),
      filAuto: JSON.parse(localStorage.getItem('ft4_coach_hist') || '[]').filter(m => /\[DÉBRIEF AUTO\]/.test(m.content || '')).length,
      fin: (document.getElementById('se-debrief') || {}).textContent || '', fenetre: (document.getElementById('dbf-milo-body') || {}).textContent || '',
      cartes: (auj ? { [String(auj.id)]: carte(auj.id) } : {}), carte: null, ids: sess.map(s => String(s.id)),
      log: (S.registre && S.registre.sessionLog || []).map(x => String(x.sessId)),
      anciennes: ['ft4_pending_debrief', 'ft4_debrief_recu', 'ft4_debrief_faits'].filter(k => localStorage.getItem(k) !== null) };
  });
  /* ⚠️ Une carte PRÉCISE peut arriver après les autres (vu le 06/10 : OD-10b « carte introuvable » sur du code sain) —
     on l'attend, 3 s au plus ; absente au bout de 3 s, elle est vraiment absente. */
  const boutons = async (X, id) => { const t0 = Date.now(); let r = null;
    do { r = await X.pg.evaluate(i => { const c = [...document.querySelectorAll('#sess-list .sess-card')].find(x => (x.getAttribute('onclick') || '').indexOf(String(i)) >= 0);
        return c ? [...c.querySelectorAll('.sess-dbf-btn,.sess-dbf-go')].map(x => x.textContent.trim()) : null; }, id);
      if (r) break; await X.pg.waitForTimeout(150); } while (Date.now() - t0 < 3000);
    return r; };
  const resume = X => js(X.st.req);
  const attendre = async (pg, sel, re, ms) => { const t0 = Date.now(); let txt = '';
    while (Date.now() - t0 < (ms || 9000)) { txt = await pg.evaluate(s => (document.querySelector(s) || {}).textContent || '', sel); if (re.test(txt)) break; await pg.waitForTimeout(150); }
    return txt.replace(/\s+/g, ' '); };

  const { jourParis: jP } = require('../_jour.js');
  const ser = (kg, reps, x) => Object.assign({ kg, reps, type: 'N', done: true, rm1: 0 }, x || {});
  const RECENTES = () => [1, 2, 3, 4, 5, 6].map(k => ({ id: 2000 + k, ts: 2000 + k, date: jP(-k), volume: 120,
    exs: [{ name: 'Curl Biceps Haltères', sets: [ser(12, 10)] }] }));
  const ANC = () => ({ id: 3081, ts: 3081, date: jP(-81), volume: 630,
    exs: [{ name: 'Développé Militaire', sets: [ser(52.5, 6, { rir: 2 }), ser(52.5, 6, { note: 'barre posée à la 5e' })] }] });
  const sansDecor = x => String(x || '');
  const ouvrirCarte = (X, id) => clic(X.pg, '#sess-list .sess-card[onclick*="' + id + '"] .sess-dbf-go', 'ov-debrief-milo');
  const attendreReq = async (X, n, ms) => { const t0 = Date.now(); while (X.st.req.length < n && Date.now() - t0 < (ms || 6000)) await X.pg.waitForTimeout(100); };
  const attendreMag = async (X, id, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 12000)) {
      const e = await etat(X.pg); if (e.mag.indexOf(String(id)) >= 0) return true; await X.pg.waitForTimeout(150); } return false; };
  const versCarte = async (X, id) => { await versProgres(X); const t0 = Date.now();
    while (Date.now() - t0 < 4000) { if (await boutons(X, id)) return true; await X.pg.waitForTimeout(200); } return false; };

  /* ═════════ OD-01 / OD-02 / OD-03 / OD-16 — sans clic, RIEN ne part ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]) });
    const f = await terminer(X);
    await jusqua(X, 6000);                                         // au-delà du minuteur de démarrage (load + 3 s)
    const a = await etat(X.pg);
    t('OD-01 ⛔⛔ terminer une séance → 0 appel de débrief ; l\'écran montre le résumé local et « Analyser cette séance avec Milo »',
      f && X.st.req.length === 0 && /Analyser cette séance avec Milo/.test(a.fin) && !/Milo analyse/.test(a.fin)
      && await X.pg.evaluate(() => !!document.querySelector('#se-debrief .se-dbf-go')), resume(X) + ' | ' + a.fin.slice(0, 200));
    await fermerFin(X); await coach(X, 2500);
    t('OD-03 ⛔ terminer puis ouvrir le Coach → 0 appel', X.st.req.length === 0, resume(X));
    await X.pg.reload(); X.st.T0 = Date.now(); await X.pg.waitForTimeout(4500); await coach(X, 2000);
    t('OD-02 ⛔ terminer puis recharger (et rouvrir le Coach) → 0 appel', X.st.req.length === 0, resume(X));
    await versProgres(X);
    const b0 = await etat(X.pg), btn = await boutons(X, b0.sid);
    t('OD-16 la séance non analysée est là, entière : historique, carte « ✨ Analyser avec Milo » seule, aucun débrief rangé, aucune mémoire de débrief',
      b0.sid && b0.mag.length === 0 && b0.log.indexOf(b0.sid) < 0 && btn && btn.length === 1 && /Analyser avec Milo/.test(btn[0]) && b0.filAuto === 0, js({ btn, b0 }));
    /* 🔁 Contre-audit : « Rowing Yates » existait DÉJÀ dans l'historique de la fixture (séance de J-7) — le témoin restait
       vert même si la séance du jour manquait au contexte. On cherche la ligne de CETTE séance : 3 séries et 1 200 kg. */
    const ctx = await X.pg.evaluate(() => { try { return /S3 40×10[^\n]*— 1200kg vol total/.test(buildCoachContext('test')); } catch (e) { return 'ERR ' + e.message; } });
    t('OD-16b … et Milo la voit toujours dans son contexte (la séance reste une vérité de Force Tracker)', ctx === true, String(ctx));
    t('OD-0x aucune erreur de page, 0 appel réel', X.errs.length === 0 && X.st.reels === 0, X.errs.join(' | '));
    await X.cx.close();
  }
  /* ═════════ OD-04 / OD-08 — un clic, un appel, un débrief rangé, « Voir » dans Progrès ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 400, rep: OK('DEBRIEF-OD de la séance.' + MEM) }] });
    await terminer(X);
    const ok = await clic(X.pg, '#se-debrief .se-dbf-go');
    const txt = await attendre(X.pg, '#se-debrief', /DEBRIEF-OD/);
    await X.pg.waitForTimeout(600);
    const a = await etat(X.pg);
    t('OD-04 ⛔⛔ « Analyser cette séance avec Milo » → EXACTEMENT 1 appel, et c\'est la consigne de fin de séance',
      ok && X.st.req.length === 1 && X.st.req[0].vol === 1200 && X.st.req[0].fin, resume(X));
    t('OD-08 ⛔ succès valide → `ft4_debriefs[sessionId]` rangé, affiché sous les chiffres, un message dans le fil, la mémoire de débrief écrite',
      /DEBRIEF-OD/.test(txt) && a.mag.length === 1 && a.mag[0] === a.sid && a.filAuto === 1 && a.log.indexOf(a.sid) >= 0, js(a));
    await fermerFin(X); await versProgres(X);
    const btn = await boutons(X, a.sid);
    t('OD-08b … dans Progrès, la carte porte « 💬 Voir le débrief Milo » et SEULEMENT lui', btn && btn.length === 1 && /Voir le débrief Milo/.test(btn[0]), js(btn));
    await jusqua(X, 6500); await coach(X, 1500);
    t('OD-08c … et rien ne repart ensuite (Coach, démarrage)', X.st.req.length === 1, resume(X));
    await X.cx.close();
  }
  /* ═════════ OD-05 — double clic rapide (et deux écrans) ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 2000, rep: OK('DEBRIEF-OD unique.') }, { delai: 100, rep: OK('DEBRIEF-OD DOUBLON') }] });
    await terminer(X);
    await X.pg.evaluate(() => { const b = document.querySelector('#se-debrief .se-dbf-go'); b.click(); b.click(); });
    const sid = (await etat(X.pg)).sid;
    await X.pg.evaluate(i => { analyserSeanceMilo(i); analyserSeanceMilo(i); }, sid);   // et encore, par le geste public
    await X.pg.waitForTimeout(3200);
    const a = await etat(X.pg);
    t('OD-05 ⛔⛔ double clic rapide (+ deux appels du geste) pendant l\'analyse → EXACTEMENT 1 appel, un seul débrief',
      X.st.req.length === 1 && a.mag.length === 1 && !/DOUBLON/.test(a.magTxt.join('|')), resume(X) + ' ' + js(a));
    await X.cx.close();
  }
  /* ═════════ OD-06 / OD-07 — rechargement PENDANT l'analyse ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 6000, rep: OK('DEBRIEF-OD perdu avec la page.') }, { delai: 300, rep: OK('DEBRIEF-OD relancé.') }] });
    await terminer(X); await clic(X.pg, '#se-debrief .se-dbf-go'); await X.pg.waitForTimeout(800);
    await X.pg.reload(); X.st.T0 = Date.now(); await X.pg.waitForTimeout(4500);
    await coach(X, 2500);
    const r = await etat(X.pg);
    t('OD-06 ⛔⛔ rechargement pendant l\'analyse → AUCUNE relance automatique (démarrage, Coach) : 1 requête, aucun débrief rangé',
      X.st.req.length === 1 && r.mag.length === 0, resume(X) + ' ' + js(r));
    await versProgres(X);
    const btn = await boutons(X, r.sid);
    t('OD-07 ⛔ … la carte dit « Analyse interrompue — relancer », et rien ne part avant le clic',
      btn && btn.length === 1 && /interrompue/.test(btn[0]) && X.st.req.length === 1, js(btn));
    const ok = await clic(X.pg, '#sess-list .sess-dbf-go', 'ov-debrief-milo');
    const txt = await attendre(X.pg, '#dbf-milo-body', /DEBRIEF-OD relancé/);
    const fin = await etat(X.pg), btn2 = await boutons(X, r.sid);
    t('OD-07b … le clic relance (2ᵉ requête, consigne « à ma demande », pas « je viens de terminer »), le débrief est rangé, la carte passe à « Voir »',
      ok && X.st.req.length === 2 && !X.st.req[1].fin && /DEBRIEF-OD relancé/.test(txt) && fin.mag.indexOf(r.sid) >= 0 && btn2 && /Voir le débrief/.test(btn2.join('|')) && !fin.encours,
      resume(X) + ' ' + js({ btn2, enc: fin.encours }));
    await X.cx.close();
  }
  /* ═════════ OD-06c — la page qui s'en va ne transforme pas l'analyse en échec (déterministe) ═════════
     Mesuré le 05/10 : au rechargement, le navigateur ANNULE la requête ; son rejet s'exécutait pendant le
     déchargement et effaçait « en vol » → la carte disait « Analyser » au lieu de « Analyse interrompue ».
     OD-07 ne le voyait que sous charge (course) : ce témoin rejoue la course sans dépendre du temps. */
  {
    const X = await ouvrir({});
    const R = await X.pg.evaluate(async () => {
      const vf = window.fetch; let rejeter = null;
      window.fetch = () => new Promise((_, nok) => { rejeter = nok; });
      try {
        window._demoMode = false; S.connected = true;
        const s = { id: 'OD06C', ts: 1, date: '2026-10-05', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }] };
        S.sessions = [s];
        const d = document.createElement('div'); document.body.appendChild(d);
        const p = _runSeDebrief(s, 0, d);
        await new Promise(z => setTimeout(z, 50));
        window.dispatchEvent(new Event('pagehide'));
        if (rejeter) rejeter(new TypeError('Failed to fetch'));
        await p;
        const enc = JSON.parse(localStorage.getItem('ft4_debrief_encours') || 'null');
        return { encore: !!(enc && enc.vol && enc.vol.OD06C), echecAffiche: /n'a pas pu/.test(d.textContent || ''), parti: !!rejeter };
      } finally { window.fetch = vf; }
    });
    t('OD-06c ⛔ la requête annulée par un départ de page laisse « en vol » (la page suivante dira « interrompue »), sans afficher d\'échec',
      R.parti === true && R.encore === true && R.echecAffiche === false, js(R));
    await X.cx.close();
  }
  /* ═════════ OD-09 / OD-10 — échecs : rien de rangé, reprise seulement sur un clic ═════════ */
  for (const [nom, rep] of [['OD-09 complete:false', { delai: 300, rep: REPLI }], ['OD-10 repli « Désolé, réessaie. »', { delai: 300, rep: REPLI_TXT }], ['OD-10b HTTP 502', { delai: 300, status: 502 }]]) {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [rep, { delai: 300, rep: OK('DEBRIEF-OD après échec.') }] });
    await terminer(X); await clic(X.pg, '#se-debrief .se-dbf-go');
    const txt = await attendre(X.pg, '#se-debrief', /n'a pas pu/);
    const a = await etat(X.pg), sum0 = X.st.summarize, req0 = X.st.req.length;   // mesurés AU MOMENT de l'échec
    await fermerFin(X); await coach(X, 1500);
    await X.pg.reload(); X.st.T0 = Date.now(); await X.pg.waitForTimeout(4500); await coach(X, 1500);
    const apres = X.st.req.length;
    await versProgres(X);
    const btn = await boutons(X, a.sid);
    const ok = await clic(X.pg, '#sess-list .sess-dbf-go', 'ov-debrief-milo');
    await attendre(X.pg, '#dbf-milo-body', /DEBRIEF-OD après échec/);
    const fin = await etat(X.pg);
    t(nom + ' ⛔ → aucun débrief rangé, « Réessayer » proposé, aucun message dans le fil, aucun résumé payé',
      /n'a pas pu/.test(txt) && /Réessayer/.test(txt) && a.mag.length === 0 && a.filAuto === 0 && sum0 === 0 && req0 === 1, 'summarize=' + sum0 + ' req=' + req0 + ' | ' + txt.slice(-120));
    t(nom + ' ⛔ … aucune reprise cachée (Coach, rechargement) ; la carte propose « Analyser » ; la reprise ne part QUE sur le clic',
      apres === 1 && btn && /Analyser avec Milo/.test(btn.join('|')) && ok && X.st.req.length === 2 && fin.mag.length === 1, resume(X) + ' ' + js(btn));
    await X.cx.close();
  }
  /* ═════════ OD-11 — un débrief existe déjà : « Voir », jamais d'appel ═════════ */
  {
    const S0 = { id: Date.now() - 3600e3, ts: Date.now() - 3600e3, date: J, volume: 1200, exs: [YATES()] }; const sid = String(S0.id);
    const X = await ouvrir({ sessions: HIST().concat([S0]), reponses: [{ delai: 100, rep: OK('DEBRIEF-OD REPAYÉ.') }],
      stock: { ft4_debriefs: JSON.stringify({ v: 1, seances: { [sid]: { texte: 'DEBRIEF-OD déjà rangé.', ts: 1, src: 'fin' } } }) } });
    await jusqua(X, 4000); await coach(X, 1200); await versCarte(X, sid);   // la liste se dessine : on attend la carte (course vue le 06/10)
    const btn = await boutons(X, sid);
    await clic(X.pg, '#sess-list .sess-dbf-btn', 'ov-debrief-milo');
    const vu = await X.pg.evaluate(() => document.getElementById('dbf-milo-body').textContent);
    await X.pg.evaluate(i => analyserSeanceMilo(i), sid); await X.pg.waitForTimeout(1200);
    const fin = await etat(X.pg);
    t('OD-11 ⛔⛔ débrief déjà rangé → la carte porte « Voir » seul, il s\'ouvre, et même le geste « analyser » ne repaie rien (0 appel)',
      btn && btn.length === 1 && /Voir le débrief/.test(btn[0]) && /déjà rangé/.test(vu) && X.st.req.length === 0 && /déjà rangé/.test(fin.magTxt.join('|')), resume(X) + ' ' + js(btn));
    await X.cx.close();
  }
  /* ═════════ OD-12 / OD-13 — deux séances, le même jour ═════════ */
  const SB = () => ({ id: Date.now() - 2 * 3600e3, ts: Date.now() - 2 * 3600e3, date: J, volume: 777, exs: [
    { name: 'Squat', sets: [{ kg: 70, reps: 5, type: 'N', done: true }] }, { name: 'Curl Biceps Haltères', sets: [{ kg: 12, reps: 10, type: 'N', done: true }] }] });
  {
    const B = SB(); const bid = String(B.id);
    const X = await ouvrir({ wkt: WKT([YATES()]), sessions: HIST().concat([B]),
      reponses: [{ delai: 6000, rep: OK('DEBRIEF-OD séance A.') }, { delai: 12000, rep: OK('DEBRIEF-OD séance B.') }] });
    /* ⚠️ Délais choisis pour qu'aucun rafraîchissement de la liste (réponse de A) ne tombe PENDANT le clic sur B :
       à 3 s, la réponse de A redessinait la carte de B au moment du clic, et le clic se perdait (vu sous charge). */
    await terminer(X); await clic(X.pg, '#se-debrief .se-dbf-go');      // A part (écran de fin)
    await fermerFin(X); await versProgres(X);
    const okB = await clic(X.pg, '#sess-list .sess-card[onclick*="' + bid + '"] .sess-dbf-go', 'ov-debrief-milo');   // B part (Progrès)
    await X.pg.waitForTimeout(500);
    const deux = X.st.req.length;
    { const t0 = Date.now(); while (Date.now() - t0 < 12000) { const e = await etat(X.pg); if (e.mag.indexOf(e.sid) >= 0) break; await X.pg.waitForTimeout(200); } }   // A a répondu, B est encore en vol
    const vol = await X.pg.evaluate(i => { const v = JSON.parse(localStorage.getItem('ft4_debrief_encours') || 'null'); return !!(v && v.vol && v.vol[i]); }, bid);
    const mid = await etat(X.pg);
    await attendre(X.pg, '#dbf-milo-body', /séance B/, 15000); await X.pg.waitForTimeout(400);
    const fin = await etat(X.pg);
    t('OD-12 ⛔⛔ deux séances le même jour : un appel CHACUNE, chacune désignée par la sienne (1 200 kg / 777 kg), débriefs rangés sous LEUR identifiant',
      okB && deux === 2 && X.st.req.filter(r => r.vol === 1200).length === 1 && X.st.req.filter(r => r.vol === 777).length === 1
      && fin.mag.length === 2 && fin.mag.indexOf(fin.sid) >= 0 && fin.mag.indexOf(bid) >= 0 && /séance A/.test(fin.magTxt.join('|')), resume(X) + ' ' + js(fin));
    t('OD-13 ⛔ la réponse de A ne libère PAS l\'analyse de B (B toujours « en vol » quand A a répondu, et rangée ensuite)',
      vol && mid.mag.indexOf(mid.sid) >= 0 && mid.mag.indexOf(bid) < 0 && fin.mag.indexOf(bid) >= 0, js({ vol, mid: mid.mag }));
    await X.cx.close();
  }
  /* ═════════ OD-14 — suppression d'une séance (comportement SESSION-INTEGRITY gardé) ═════════ */
  const supprimer = async (X, id) => {
    await versProgres(X);
    const a = await clic(X.pg, '#sess-list .sess-card[onclick="openSessDetail(' + id + ')"] .sess-title');
    const b1 = await clic(X.pg, '#sd-del-btn'); const b2 = await clic(X.pg, '#sd-del-btn');
    await X.pg.waitForTimeout(300); return a && b1 && b2;
  };
  {
    const A = { id: Date.now() - 5 * 3600e3, ts: Date.now() - 5 * 3600e3, date: J, volume: 1200, exs: [YATES()] }, B = SB(); const aid = String(A.id), bid = String(B.id);
    const X = await ouvrir({ sessions: HIST().concat([A, B]), reponses: [{ delai: 100, rep: OK('NE DOIT PAS PARTIR') }],
      stock: { ft4_debriefs: JSON.stringify({ v: 1, seances: { [aid]: { texte: 'TXT-A', ts: 1, src: 'fin' }, [bid]: { texte: 'TXT-B', ts: 2, src: 'fin' } } }),
        ft4_debrief_encours: JSON.stringify({ v: 2, vol: { [aid]: { ts: Date.now() - 60e3, page: 'ancienne' } } }) } });
    const ok = await supprimer(X, aid);
    await coach(X, 1500);
    const fin = await etat(X.pg);
    t('OD-14 ⛔ séance supprimée → SON débrief et son état « en vol » partent ; l\'autre séance du même jour garde le sien ; 0 appel',
      ok && fin.ids.indexOf(aid) < 0 && fin.mag.indexOf(aid) < 0 && fin.mag.indexOf(bid) >= 0 && !(fin.encours && fin.encours.vol && fin.encours.vol[aid]) && X.st.req.length === 0,
      js({ ok, mag: fin.mag, enc: fin.encours }));
    await X.cx.close();
  }
  /* ═════════ OD-15 — l'export lit le magasin, quel que soit le déclencheur ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 200, rep: OK('DEBRIEF-OD exporté.') }] });
    await terminer(X); await clic(X.pg, '#se-debrief .se-dbf-go'); await attendre(X.pg, '#se-debrief', /DEBRIEF-OD/);
    const ex = await X.pg.evaluate(() => { const sans = _histoLignes(false), avec = _histoLignes(true);
      return { sans: sans.some(l => /DEBRIEF-OD/.test(JSON.stringify(l))), avec: avec.some(l => /DEBRIEF-OD exporté/.test(JSON.stringify(l))) }; });
    t('OD-15 l\'export « avec » porte le débrief demandé, l\'export « sans » ne le porte pas (comportement SESSION-INTEGRITY inchangé)', ex.avec && !ex.sans, js(ex));
    await X.cx.close();
  }
  /* ═════════ OD-17 — les clés de l'ancien automatisme sont oubliées, sans perte ni appel ═════════ */
  {
    const S0 = { id: Date.now() - 3600e3, ts: Date.now() - 3600e3, date: J, volume: 1200, exs: [YATES()] }; const sid = String(S0.id);
    const X = await ouvrir({ sessions: HIST().concat([S0]), reponses: [{ delai: 100, rep: OK('NE DOIT PAS PARTIR') }],
      stock: { ft4_pending_debrief: JSON.stringify([sid]), ft4_debrief_faits: JSON.stringify([sid]),
        ft4_debrief_recu: JSON.stringify({ id: sid, ts: Date.now() - 600e3, reply: 'DEBRIEF-OD payé, jamais posé.', instr: 'x' }) } });
    await jusqua(X, 4500); await coach(X, 2000);
    const fin = await etat(X.pg);
    t('OD-17 ⛔ mise à jour : les clés de l\'ancien automatisme (file, reçu, faits) disparaissent, le débrief payé du « reçu » est RANGÉ avec sa séance, 0 appel',
      fin.anciennes.length === 0 && /payé, jamais posé/.test(fin.magTxt.join('|')) && fin.mag.indexOf(sid) >= 0 && X.st.req.length === 0, js(fin) + ' ' + resume(X));
    await X.cx.close();
  }
  {
    /* OD-17b — l'ancienne FILE seule (sans « reçu ») : la séance attendait un débrief automatique. Après la mise à jour,
       rien ne part (ni démarrage, ni Coach) ; la clé disparaît ; la séance garde « ✨ Analyser avec Milo ».
       Ajouté parce que le contrôle négatif l'a demandé : OD-17 ne voyait pas une relance de l'ancienne file
       (M-OD12), sa séance ayant déjà son débrief par le « reçu ». */
    const S0 = { id: Date.now() - 1800e3, ts: Date.now() - 1800e3, date: J, volume: 1200, exs: [YATES()] }; const sid = String(S0.id);
    const X = await ouvrir({ sessions: HIST().concat([S0]), reponses: [{ delai: 100, rep: OK('NE DOIT PAS PARTIR') }],
      stock: { ft4_pending_debrief: JSON.stringify([sid]) } });
    await jusqua(X, 4500); await coach(X, 2000);
    const fin = await etat(X.pg);
    await versProgres(X);
    let btn = null; { const t0 = Date.now(); while (Date.now() - t0 < 4000) { btn = await boutons(X, sid); if (btn) break; await X.pg.waitForTimeout(200); } }   // la liste se dessine, on l'attend
    const dbg = await X.pg.evaluate(() => [...document.querySelectorAll('#sess-list .sess-card')].map(c => (c.getAttribute('onclick') || '') + '|' + c.textContent.slice(0, 40)).slice(0, 4));
    t('OD-17b ⛔ mise à jour, ancienne file SANS reçu : 0 appel, la clé disparaît, rien de rangé, la séance propose « Analyser »',
      X.st.req.length === 0 && fin.anciennes.length === 0 && fin.mag.indexOf(sid) < 0 && btn && btn.length === 1 && /Analyser avec Milo/.test(btn[0]), js({ btn, dbg, fin }) + ' ' + resume(X));
    await X.cx.close();
  }
  /* ═════════════════════════════════════════════════════════════════════════════════════════════════
     CORRECTIF POST CONTRE-AUDIT (06/10/2026) — F1 · C1 · témoins perdus · complete:false
     ═════════════════════════════════════════════════════════════════════════════════════════════════ */
  /* ═════════ F1 — Milo reçoit LA séance réelle, lue par son identifiant ═════════ */
  {
    const A = ANC();
    const X = await ouvrir({ sessions: RECENTES().concat([A]), reponses: [{ delai: 200, rep: OK('DEBRIEF-F1 militaire.' + MEM) }] });
    await versCarte(X, A.id); const go = await ouvrirCarte(X, A.id); await attendreReq(X, 1);
    const r = X.st.req[0] || {};
    const dl = await X.pg.evaluate(d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }); } catch (e) { return ''; } }, A.date);
    t('F1-02 ⛔⛔ séance de 81 jours (hors des 5 récentes) → son bloc EXACT part : identifiant, exercice, séries, charges, RIR, note, volume',
      go && r.cibleId === '3081' && /Développé Militaire/.test(r.cible) && /S1 52\.5×6 RIR2/.test(r.cible) && /S2 52\.5×6\[💬 barre posée/.test(r.cible)
      && /630kg vol total/.test(r.cible) && r.nbBlocs === 1, js({ cible: r.cible, id: r.cibleId }));
    t('F1-02b … avec sa date RÉELLE (81 jours), pas celle d\'aujourd\'hui', !!dl && r.cible.toLowerCase().indexOf(dl.split(' ')[0]) >= 0 && r.cible.indexOf(String(new Date().getDate()) + ' ') !== 0, dl + ' | ' + r.cible.slice(0, 60));
    t('F1-05 ⛔ l\'historique récent (6 séances de curl) ne remplace pas la séance ciblée : le bloc ne parle que du développé militaire',
      !/Curl Biceps/.test(r.cible), r.cible.slice(0, 120));
    t('F1-06 ⛔ pas de mensonge dans la consigne : depuis Progrès, ni « je viens de terminer » ni « douleur du jour », et elle renvoie au bloc réellement fourni',
      !r.fin && !/douleur du jour/.test(r.msg) && /SÉANCE À ANALYSER/.test(r.msg) && !/\(tu les as\)/.test(r.msg), sansDecor(r.msg).slice(0, 200));
    const ok = await attendreMag(X, A.id);
    const log = (await etat(X.pg)).log;
    t('F1-07 ⛔ succès → débrief rangé sous 3081 et mémoire de débrief liée au MÊME identifiant', ok && log.indexOf('3081') >= 0, js({ ok, log }));
    const ctxSans = await X.pg.evaluate(() => buildCoachContext('bonjour').indexOf('SÉANCE À ANALYSER'));
    t('F1-00 ⛔ un message ordinaire au Coach ne reçoit AUCUN bloc de séance ciblée (le contexte par défaut est inchangé)', ctxSans === -1, String(ctxSans));
    await X.cx.close();
  }
  {
    /* F1-01 / F1-03 / F1-04 — séance récente, deux séances le même jour, A puis B */
    const J0 = jP(-2);
    const SA = { id: 4001, ts: 4001, date: J0, volume: 800, exs: [{ name: 'Squat à la Barre', sets: [ser(80, 5), ser(80, 5)] }] };
    const SB = { id: 4002, ts: 4002, date: J0, volume: 300, exs: [{ name: 'Tirage Vertical', sets: [ser(50, 6)] }] };
    const X = await ouvrir({ sessions: [SA, SB], reponses: [{ delai: 150, rep: OK('DEBRIEF-F1 A.') }, { delai: 150, rep: OK('DEBRIEF-F1 B.') }] });
    await versCarte(X, SA.id); await ouvrirCarte(X, SA.id); await attendreReq(X, 1); await attendreMag(X, SA.id);
    await clic(X.pg, '#ov-debrief-milo button[onclick="fermerDebriefMilo()"]', 'ov-debrief-milo');
    await versCarte(X, SB.id); await ouvrirCarte(X, SB.id); await attendreReq(X, 2);
    const [ra, rb] = [X.st.req[0] || {}, X.st.req[1] || {}];
    t('F1-01 séance récente depuis Progrès → le bon identifiant et SES données (squat 80×5)',
      ra.cibleId === '4001' && /Squat à la Barre: S1 80×5 · S2 80×5/.test(ra.cible) && /800kg vol total/.test(ra.cible), js(ra.cible));
    t('F1-03 ⛔⛔ deux séances le MÊME jour → aucune confusion : B reçoit le tirage, jamais le squat',
      rb.cibleId === '4002' && /Tirage Vertical: S1 50×6/.test(rb.cible) && !/Squat/.test(rb.cible), js(rb.cible));
    t('F1-04 ⛔ A puis B → l\'analyse de B ne reçoit jamais les données de A (un seul bloc, le sien)', rb.nbBlocs === 1 && !/800kg/.test(rb.cible), js(rb));
    await X.cx.close();
  }

  /* ═════════ C1 — une réponse ne s'affiche que sous SA séance ═════════ */
  {
    const J0 = jP(-3);
    const SA = { id: 5001, ts: 5001, date: J0, volume: 500, exs: [{ name: 'Squat à la Barre', sets: [ser(100, 5)] }] };
    const SC = { id: 5003, ts: 5003, date: jP(-4), volume: 400, exs: [{ name: 'Développé Couché', sets: [ser(80, 5)] }] };
    const X = await ouvrir({ sessions: [SA, SC], reponses: [{ delai: 4000, rep: OK('REPONSE-A tardive.') }],
      stock: { ft4_debriefs: JSON.stringify({ v: 1, seances: { '5003': { texte: 'TEXTE-C rangé.', ts: 1, src: 'fin' } } }) } });
    await versCarte(X, SA.id); await ouvrirCarte(X, SA.id); await attendreReq(X, 1);
    await clic(X.pg, '#ov-debrief-milo button[onclick="fermerDebriefMilo()"]', 'ov-debrief-milo');
    await clic(X.pg, '#sess-list .sess-card[onclick*="5003"] .sess-dbf-btn', 'ov-debrief-milo');      // « Voir » de C, A en vol
    const avant = await X.pg.evaluate(() => document.getElementById('dbf-milo-body').textContent);
    const ok = await attendreMag(X, SA.id); await X.pg.waitForTimeout(300);
    const vue = await X.pg.evaluate(() => ({ body: document.getElementById('dbf-milo-body').textContent, sub: document.getElementById('dbf-milo-sub').textContent,
      ouvert: document.getElementById('ov-debrief-milo').classList.contains('open') }));
    t('C1-02 ⛔⛔ analyse A → ouvrir C → réponse A : RIEN de A sous C (C reste affichée, avec son en-tête)',
      /TEXTE-C/.test(avant) && ok && vue.ouvert && /TEXTE-C/.test(vue.body) && !/REPONSE-A/.test(vue.body), js(vue));
    await clic(X.pg, '#ov-debrief-milo button[onclick="fermerDebriefMilo()"]', 'ov-debrief-milo');
    await versCarte(X, SA.id);
    const btnA = await boutons(X, SA.id);
    await clic(X.pg, '#sess-list .sess-card[onclick*="5001"] .sess-dbf-btn', 'ov-debrief-milo');
    const retour = await X.pg.evaluate(() => document.getElementById('dbf-milo-body').textContent);
    t('C1-03 … retour sur A : la carte dit « Voir », et son débrief est là', btnA && /Voir le débrief/.test(btnA.join('|')) && /REPONSE-A/.test(retour), js({ btnA, retour: retour.slice(0, 80) }));
    await X.cx.close();
  }
  {
    /* C1-01 / C1-04 / C1-05 / C1-06 — A et B le même jour, B répond AVANT A */
    const J0 = jP(-2);
    const SA = { id: 6001, ts: 6001, date: J0, volume: 500, exs: [{ name: 'Squat à la Barre', sets: [ser(100, 5)] }] };
    const SB = { id: 6002, ts: 6002, date: J0, volume: 300, exs: [{ name: 'Tirage Vertical', sets: [ser(50, 6)] }] };
    const X = await ouvrir({ sessions: [SA, SB], reponses: [{ delai: 5000, rep: OK('REPONSE-A lente.') }, { delai: 600, rep: OK('REPONSE-B rapide.') }] });
    await versCarte(X, SA.id); await ouvrirCarte(X, SA.id); await attendreReq(X, 1);
    await clic(X.pg, '#ov-debrief-milo button[onclick="fermerDebriefMilo()"]', 'ov-debrief-milo');
    await versCarte(X, SB.id); await ouvrirCarte(X, SB.id); await attendreReq(X, 2);
    const okB = await attendreMag(X, SB.id);
    const vueB = await X.pg.evaluate(() => document.getElementById('dbf-milo-body').textContent);
    t('C1-01 la réponse de B s\'affiche sous B', okB && /REPONSE-B/.test(vueB), vueB.slice(0, 80));
    const okA = await attendreMag(X, SA.id); await X.pg.waitForTimeout(300);
    const vueApres = await X.pg.evaluate(() => document.getElementById('dbf-milo-body').textContent);
    const m = await X.pg.evaluate(() => JSON.parse(localStorage.getItem('ft4_debriefs')).seances);
    t('C1-05 ⛔⛔ B répond avant A, puis A arrive : la fenêtre de B ne montre JAMAIS A', okA && /REPONSE-B/.test(vueApres) && !/REPONSE-A/.test(vueApres), vueApres.slice(0, 80));
    t('C1-04 / C1-06 ⛔ même date : chaque réponse est rangée sous SON identifiant, aucun croisement',
      /REPONSE-A/.test(m['6001'].texte) && /REPONSE-B/.test(m['6002'].texte), js(m));
    await X.cx.close();
  }

  /* ═════════ T1 — le verrou « en vol » n'a PAS de minuteur ═════════ */
  {
    const A = ANC();
    const X = await ouvrir({ sessions: [A], reponses: [{ delai: 9000, rep: OK('LENT.') }] });
    await versCarte(X, A.id); await ouvrirCarte(X, A.id); await attendreReq(X, 1);
    await clic(X.pg, '#ov-debrief-milo button[onclick="fermerDebriefMilo()"]', 'ov-debrief-milo');
    await X.pg.waitForTimeout(6500);                                         // au-delà d'un minuteur de 5 s
    const btn = await boutons(X, A.id);
    const relance = await X.pg.evaluate(id => { analyserSeanceMilo(String(id)); return true; }, A.id);
    await X.pg.waitForTimeout(800);
    t('T1 ⛔⛔ 6,5 s après le clic, l\'analyse toujours en cours reste VERROUILLÉE (pas de minuteur) : carte « Milo analyse… », un 2ᵉ geste ne paie rien',
      relance && btn && /Milo analyse/.test(btn.join('|')) && X.st.req.length === 1, js({ btn, n: X.st.req.length }));
    await X.cx.close();
  }
  /* ═════════ T2 — cardio seul : pas d'analyse (contrat depuis ft-v1118 : un débrief exige une série validée) ═════════ */
  {
    const X = await ouvrir({ wkt: { date: J, startHour: 10, exs: [], cardio: { type: 'velo', intensity: 'modere', duration: 30 } } });
    const f = await terminer(X); await X.pg.waitForTimeout(400);
    const fin = await X.pg.evaluate(() => ({ go: !!document.querySelector('#se-debrief .se-dbf-go'), titre: (document.getElementById('se-debrief-titre') || {}).textContent || '' }));
    await fermerFin(X); await coach(X, 1500);
    const sid = await X.pg.evaluate(() => String((S.sessions[0] || {}).id || ''));
    await versCarte(X, sid); const btn = await boutons(X, sid);
    t('T2 ⛔ cardio seul : aucun bouton d\'analyse (fin de séance ni Progrès), le titre ne promet pas « l\'avis de Milo », 0 appel',
      f && !fin.go && fin.titre === 'Ta séance' && (!btn || btn.length === 0) && X.st.req.length === 0, js({ fin, btn, n: X.st.req.length }));
    await X.cx.close();
  }
  /* ═════════ T3 — l'ancien format de `ft4_debrief_encours` (ft-v1250 : {id, ts}) ═════════ */
  {
    const A = ANC();
    const X = await ouvrir({ sessions: [A], reponses: [{ delai: 200, rep: OK('REPRIS.') }],
      stock: { ft4_debrief_encours: JSON.stringify({ id: String(A.id), ts: Date.now() - 60000 }) }, attente: 4000 });
    await coach(X, 1500);
    await versCarte(X, A.id); const btn = await boutons(X, A.id);
    const n0 = X.st.req.length;
    await ouvrirCarte(X, A.id); const ok = await attendreMag(X, A.id);
    const enc = (await etat(X.pg)).encours;
    t('T3 ⛔ stockage ft-v1250 (« en vol » ancien format) : 0 appel seul, carte « interrompue — relancer », le clic relance UNE fois et le verrou disparaît',
      n0 === 0 && btn && /interrompue/.test(btn.join('|')) && ok && X.st.req.length === 1 && !(enc && enc.vol && enc.vol[String(A.id)]) && !(enc && enc.id),
      js({ n0, btn, n: X.st.req.length, enc }));
    await X.cx.close();
  }
  /* ═════════ T4 — deux analyses en vol, puis rechargement ═════════ */
  {
    const SA = { id: 7001, ts: 7001, date: jP(-2), volume: 500, exs: [{ name: 'Squat à la Barre', sets: [ser(100, 5)] }] };
    const SB = { id: 7002, ts: 7002, date: jP(-2), volume: 300, exs: [{ name: 'Tirage Vertical', sets: [ser(50, 6)] }] };
    const X = await ouvrir({ sessions: [SA, SB], reponses: [{ delai: 9000, rep: OK('A.') }, { delai: 9000, rep: OK('B.') }] });
    await versCarte(X, SA.id); await ouvrirCarte(X, SA.id); await attendreReq(X, 1);
    await clic(X.pg, '#ov-debrief-milo button[onclick="fermerDebriefMilo()"]', 'ov-debrief-milo');
    await versCarte(X, SB.id); await ouvrirCarte(X, SB.id); await attendreReq(X, 2);
    await X.pg.reload(); await X.pg.waitForTimeout(4000); await coach(X, 2000);
    await versCarte(X, SA.id);
    const ba = await boutons(X, SA.id), bb = await boutons(X, SB.id), e = await etat(X.pg);
    t('T4 ⛔⛔ deux analyses en vol puis rechargement : 2 requêtes en tout (aucune relance), CHACUNE « interrompue », rien de rangé',
      X.st.req.length === 2 && ba && bb && /interrompue/.test(ba.join()) && /interrompue/.test(bb.join()) && e.mag.length === 0, js({ n: X.st.req.length, ba, bb }));
    await X.cx.close();
  }
  /* ═════════ T5 — suppression PENDANT l'analyse : LIMITE CONNUE, mesurée (hors lot) ═════════
     Le contrat de D-047 (« une séance supprimée emporte SON débrief ») n'est pas tenu si la réponse arrive APRÈS la
     suppression : elle est encore rangée sous l'identifiant disparu (orphelin, invisible dans l'app). Ce témoin FIGE
     le comportement actuel pour qu'il reste visible ; le jour où il est corrigé, ce témoin doit être retourné. */
  {
    const SA = { id: 8001, ts: 8001, date: jP(-2), volume: 500, exs: [{ name: 'Squat à la Barre', sets: [ser(100, 5)] }] };
    const X = await ouvrir({ sessions: [SA, ANC()], reponses: [{ delai: 4000, rep: OK('ORPHELIN.') }] });
    await versCarte(X, SA.id); await ouvrirCarte(X, SA.id); await attendreReq(X, 1);
    await clic(X.pg, '#ov-debrief-milo button[onclick="fermerDebriefMilo()"]', 'ov-debrief-milo');
    const a = await clic(X.pg, '#sess-list .sess-card[onclick="openSessDetail(8001)"] .sess-title', 'ov-sess-detail');
    await clic(X.pg, '#sd-del-btn', 'ov-sess-detail'); await clic(X.pg, '#sd-del-btn', 'ov-sess-detail');
    await X.pg.waitForTimeout(5000);
    const e = await etat(X.pg);
    t('T5 ⚠️ LIMITE MESURÉE (hors lot) : séance supprimée PENDANT l\'analyse → 1 seul appel, séance partie, mais la réponse est rangée en orphelin sous 8001',
      a && X.st.req.length === 1 && e.ids.indexOf('8001') < 0 && e.mag.indexOf('8001') >= 0, js({ a, ids: e.ids, mag: e.mag }));
    await X.cx.close();
  }

  /* ═════════ CF — complete:false avec un VRAI texte n'est pas un débrief ═════════ */
  {
    const A = ANC();
    const FAUX = { reply: 'Belle séance au développé militaire, charges tenues, garde ce cap.' + MEM, _diag: 'erreur', stopReason: 'max_tokens', truncated: true, complete: false, continued: false };
    const X = await ouvrir({ sessions: [A], reponses: [{ delai: 200, rep: FAUX }] });
    await versCarte(X, A.id); await ouvrirCarte(X, A.id); await attendreReq(X, 1);
    const txt = await attendre(X.pg, '#dbf-milo-body', /n'a pas pu|Belle séance/, 6000); await X.pg.waitForTimeout(500);
    const e = await etat(X.pg);
    t('CF-01 ⛔⛔ réponse crédible mais `complete:false` → PAS un succès : rien de rangé, aucune mémoire, aucun résumé payé, « Réessayer » seul',
      /n'a pas pu/.test(txt) && !/Belle séance/.test(txt) && e.mag.length === 0 && e.log.indexOf('3081') < 0 && X.st.summarize === 0
      && await X.pg.evaluate(() => !!document.querySelector('#dbf-milo-body .se-dbf-retry')), js({ txt: txt.slice(0, 80), e: { mag: e.mag, log: e.log }, sum: X.st.summarize }));
    await X.cx.close();
  }
  {
    const A = ANC();
    const X = await ouvrir({ sessions: [A], stock: { ft4_debrief_recu: JSON.stringify({ id: String(A.id), ts: Date.now() - 60000, reply: 'Désolé, réessaie.', instr: 'x' }) }, attente: 3500 });
    const e = await etat(X.pg);
    t('CF-02 ⛔ un ancien « reçu » porteur du message d\'échec n\'est PAS migré comme débrief (clé oubliée, rien de rangé, 0 appel)',
      e.mag.length === 0 && e.anciennes.length === 0 && X.st.req.length === 0, js(e));
    await X.cx.close();
  }

};
