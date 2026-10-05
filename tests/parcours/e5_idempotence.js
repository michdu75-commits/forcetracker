/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🔁 E5 — UNE SÉANCE, UN SEUL APPEL DE DÉBRIEF (session-B · 05/10/2026)

   Le défaut (reproduit en P2 par le banc Fantôme, puis ici sur ft-v1250) : la fin de séance lance le
   débrief ; PENDANT l'appel, le rattrapage du démarrage (`load` + 3 s) voit l'emplacement « en cours »,
   le prend pour un appel interrompu par une page précédente et REMET la séance en file ; la réponse
   arrive, `_dbfFini` marque la séance faite mais la laisse en file ; à l'ouverture du Coach,
   `_maybeAutoDebrief` reprend la séance → SECOND appel payé pour le même identifiant.

   Blocs : B-E5-S (source) · B-E5-E (écran conduit, E5-1 → E5-12).
   Ce que les témoins CONDUISENT : la fin de séance (« Terminer »), le rattrapage RÉEL du démarrage
   (minuteur `load` + 3 s de l'app, pas un appel à la main), la fermeture de l'écran de fin, l'onglet
   Coach, la suppression d'une séance (Progrès → carte → « 🗑️ » deux fois), un VRAI rechargement.
   Frontières SIMULÉES : le Worker IA (réponses scriptées, RETARDÉES à la demande — succès,
   `complete:false`, repli « Désolé, réessaie. », HTTP 502), Apps Script, Supabase.
   ⛔ 0 appel réel à Anthropic.
   Ce qu'ils OBSERVENT : chaque requête `coach` qui ARRIVE au Worker simulé (heure, séance désignée),
   la file `ft4_pending_debrief`, l'emplacement « en cours », `ft4_debrief_faits`, le magasin
   `ft4_debriefs`, le fil `ft4_coach_hist`.
   Ce qu'ils NE COUVRENT PAS : deux ONGLETS ouverts en même temps (chaque onglet est une page), le
   comportement réel d'Anthropic quand le client disparaît (le rechargement E5-6 est mesuré côté
   client seulement), Safari iOS.
   Banc : tools/banc_e5.js · contrôle négatif : tools/mut_e5.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); const k = src.indexOf('\nasync function ', i + 10);
  const l = src.indexOf('\nconst ', i + 10), m = src.indexOf('\ntry{', i + 10);
  const fin = [j, k, l, m].filter(x => x > 0); return src.slice(i, fin.length ? Math.min(...fin) : undefined); };

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-E5-S (session-B). E5 — un seul propriétaire du droit de lancer un débrief (source) ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const co = nu('coach.js'), lo = nu('log.js');
  const tout = ['state.js', 'coach.js', 'setup.js', 'app.js', 'tracking.js', 'screens.js', 'log.js'].map(nu).join('\n');
  const vol = corps(co, '_dbfEnVol'), rec = corps(co, '_dbfRecuperer'), rat = corps(co, '_dbfRattraper'),
    pr = corps(co, '_dbfPrendre'), prc = corps(co, '_dbfPrendreCible'), fini = corps(co, '_dbfFini'), rend = corps(co, '_dbfRendre');
  t('S1 les fonctions sont trouvées (sinon les témoins suivants ne mesurent rien)', vol && rec && rat && pr && prc && fini && rend, [vol, rec, rat, pr, prc, fini, rend].map(x => x.length).join('/'));
  t('S2 UN seul propriétaire de « en vol » : `_dbfEnVol` déclaré une fois, et l\'emplacement n\'est écrit que par `_dbfVolPoser` / `_dbfVolRetirer`',
    (tout.match(/function _dbfEnVol\(/g) || []).length === 1
    && (tout.match(/setItem\(_DBF_ENCOURS/g) || []).length === 1 && /setItem\(_DBF_ENCOURS/.test(corps(co, '_dbfVolEcrire')), '');
  t('S3 le rattrapage ne remet en file QUE ce qu\'une AUTRE page a laissé en vol (jamais un appel vivant de cette page)',
    /_DBF_PAGE/.test(rec) && /_dbfVolLire\(\)/.test(rec), rec.slice(0, 220));
  t('S4 le filet n°3 ne ré-inscrit ni une séance en vol, ni une séance qui a déjà son débrief',
    /_dbfEnVol\(/.test(rat) && /_dbfTexteDe\(/.test(rat), rat.slice(0, 200));
  t('S5 les DEUX preneurs (Coach, fin de séance) passent par le même verrou `_dbfDejaCouvert`',
    /_dbfDejaCouvert\(/.test(pr) && /_dbfDejaCouvert\(/.test(prc) && (tout.match(/function _dbfDejaCouvert\(/g) || []).length === 1, '');
  t('S6 un SUCCÈS retire la séance de la file ; un ÉCHEC ne la marque PAS livrée',
    /_dbfLire\(\)/.test(fini) && /_dbfMarquerFait/.test(fini) && !/_dbfMarquerFait/.test(rend) && /unshift/.test(rend), rend.slice(0, 200));
  t('S7 la clé est l\'identifiant de séance : aucune date dans le verrou', !/\.date\b/.test(vol) && !/\.date\b/.test(corps(co, '_dbfDejaCouvert')), vol);
  t('S8 aucun minuteur arbitraire ajouté au verrou (la page fait foi, pas une horloge)', !/setTimeout|Date\.now\(\)\s*-/.test(vol), vol);
  t('S9 la fin de séance garde son ordre : valider → « reçu » → magasin (SESSION-INTEGRITY-01 intact)',
    corps(lo, '_runSeDebrief').indexOf('_dbfReponseValide') < corps(lo, '_runSeDebrief').indexOf('_dbfRecu('), '');
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-E5-E (session-B). E5 — écran conduit, Worker simulé et retardé, requêtes comptées ═══');
  const { jourParis } = require('../_jour.js');
  const js = x => JSON.stringify(x).slice(0, 300);
  const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
  const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 't@t.t',
    ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_lms: moisPrec, ft4_ok: '1', ft4_stmig1: '1' };
  const J = jourParis(), J1 = jourParis(-7);
  const HIST = () => [{ id: 1001, ts: 1001, date: J1, volume: 1000, exs: [{ name: 'Rowing Yates', sets: [{ kg: 35, reps: 10, type: 'N', done: true }] }] }];
  const OK = txt => ({ reply: txt, _diag: 'ok', stopReason: 'end_turn', truncated: false, complete: true, continued: false });
  const REPLI = { reply: 'Désolé, réessaie.', _diag: 'erreur', stopReason: null, truncated: false, complete: false, continued: false };
  const REPLI_TXT = { reply: 'Désolé, réessaie.', _diag: 'ok', stopReason: 'end_turn', truncated: false, complete: true, continued: false };
  const FIL = [{ role: 'user', content: 'Salut Milo', ts: 1 }, { role: 'assistant', content: 'Salut ! Prêt ?', ts: 2 }];
  // La séance du jour : 3 × 40 × 10 = 1 200 kg de volume — c'est sa désignation dans la consigne envoyée.
  const YATES = () => ({ name: 'Rowing Yates', sets: [1, 2, 3].map(() => ({ kg: 40, reps: 10, type: 'N', done: true, rm1: 0 })) });
  const WKT = exs => ({ date: J, startHour: 10, exs });
  const volDe = m => { const x = /— (\d+)kg de volume/.exec(m || ''); return x ? +x[1] : null; };

  const ouvrir = async (o) => {
    o = o || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    const T0 = Date.now();
    const st = { req: [], fin: [], summarize: 0, reels: 0, file: (o.reponses || []).slice(), T0 };
    await cx.route(/supabase\.co/, r => r.abort());
    await cx.route(/anthropic\.com/, r => { st.reels++; return r.abort(); });
    await cx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json',
      body: /test=1/.test(r.request().url()) ? '{"status":"online","version":"3.5"}' : '{"status":"not_found"}' }));
    await cx.route(/workers\.dev/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      if (c.action === 'coach') {
        const n = st.req.length, m = String(c.message || '');
        st.req.push({ t: Date.now() - st.T0, vol: volDe(m), auto: /\[DÉBRIEF AUTO\]/.test(m) });
        const x = st.file.length ? st.file.shift() : { rep: OK('DEBRIEF-E5 par défaut.') };
        if (x.delai) await new Promise(z => setTimeout(z, x.delai));
        try {
          if (x.status) await r.fulfill({ status: x.status, contentType: 'application/json', body: '{"error":"amont"}' });
          else await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x.rep) });
          st.fin.push({ n, t: Date.now() - st.T0, livre: true });
        } catch (e) { st.fin.push({ n, t: Date.now() - st.T0, livre: false }); }   // la page qui attendait a disparu
        return;
      }
      if (c.action === 'summarizeCoach') { st.summarize++; return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ summary: 'RESUME-E5' }) }); }
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    const init = Object.assign({}, BASE, { ft4_sessions: JSON.stringify(o.sessions || HIST()), ft4_prs: '{}', ft4_coach_hist: JSON.stringify(FIL) },
      o.wkt ? { ft4_wkt: JSON.stringify(o.wkt) } : {}, o.stock || {});
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_e5'))return; sessionStorage.setItem('_e5','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); st.T0 = Date.now(); await pg.waitForTimeout(o.attente || 1500);
    return { cx, pg, st, errs };
  };
  const clic = async (pg, sel, garder) => {
    for (let k = 0; k < 8; k++) {
      await pg.evaluate(g => document.querySelectorAll('.overlay.open').forEach(o => { if (!new RegExp(g).test(o.id)) o.classList.remove('open'); }), garder || 'ov-session-end|ov-sess-detail');
      const h = (await pg.evaluateHandle(s => [...document.querySelectorAll(s)].find(x => x.offsetParent !== null) || null, sel)).asElement();
      if (!h) { await pg.waitForTimeout(200); continue; }
      try { await h.evaluate(x => x.scrollIntoView({ block: 'center' })); await h.click({ timeout: 3000 }); await pg.waitForTimeout(150); return true; } catch (e) { await pg.waitForTimeout(200); }
    }
    return false;
  };
  // Fin de séance : on ne fait QUE cliquer — sans attendre la réponse (le débrief peut être en vol).
  const terminer = async X => { await clic(X.pg, '#nb-log'); await X.pg.waitForTimeout(250); return clic(X.pg, 'button[onclick="finishWorkout()"]'); };
  const fermerFin = X => clic(X.pg, '[onclick="closeSessionEnd()"]');
  const coach = async (X, ms) => { await clic(X.pg, '#nb-coach'); await X.pg.waitForTimeout(ms || 1500); };
  const jusqua = async (X, msDepuisChargement) => { const r = msDepuisChargement - (Date.now() - X.st.T0); if (r > 0) await X.pg.waitForTimeout(r); };
  const etat = pg => pg.evaluate(() => {
    const mag = JSON.parse(localStorage.getItem('ft4_debriefs') || 'null');
    const sess = JSON.parse(localStorage.getItem('ft4_sessions') || '[]');
    const auj = sess.find(s => (s.exs || []).some(e => e.name === 'Rowing Yates') && s.volume === 1200) || null;
    return { sid: auj ? String(auj.id) : '', file: JSON.parse(localStorage.getItem('ft4_pending_debrief') || '[]'),
      encours: localStorage.getItem('ft4_debrief_encours'), faits: JSON.parse(localStorage.getItem('ft4_debrief_faits') || '[]'),
      mag: mag ? Object.keys(mag.seances) : [], magTxt: mag ? Object.values(mag.seances).map(e => e.texte.slice(0, 40)) : [],
      filAuto: JSON.parse(localStorage.getItem('ft4_coach_hist') || '[]').filter(m => /\[DÉBRIEF AUTO\]/.test(m.content || '')).length,
      ids: sess.map(s => String(s.id)) };
  });
  const sur = (X, vol) => X.st.req.filter(r => r.auto && r.vol === vol);
  const resume = X => js({ req: X.st.req, fin: X.st.fin });

  /* ═════════ E5-1 — LE DÉFAUT : réponse lente + rattrapage pendant l'appel + Coach après réception ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 4800, rep: OK('DEBRIEF-E5 de la séance.') }] });
    const f = await terminer(X);
    await jusqua(X, 3600);                                  // le rattrapage (load + 3 s) est passé PENDANT l'appel
    const pendant = await etat(X.pg);
    await jusqua(X, 7600);                                  // la réponse est arrivée
    const apres = await etat(X.pg);
    await fermerFin(X); await coach(X, 2500);              // ouverture du Coach APRÈS réception
    const fin = await etat(X.pg);
    t('E5-1 ⛔⛔ réponse lente + rattrapage pendant l\'appel + Coach ensuite → UN SEUL appel pour la séance',
      f && sur(X, 1200).length === 1, resume(X) + ' | pendant=' + js(pendant));
    t('E5-1b … le rattrapage n\'a PAS remis en file la séance dont l\'appel est vivant', pendant.sid && pendant.file.indexOf(pendant.sid) < 0, js(pendant));
    t('E5-1c … un seul débrief final : une entrée au magasin pour CET identifiant, un seul message dans le fil, plus rien en file',
      fin.mag.filter(k => k === fin.sid).length === 1 && fin.filAuto === 1 && fin.file.indexOf(fin.sid) < 0 && apres.faits.indexOf(apres.sid) >= 0, js(fin));
    t('E5-1d aucune erreur de page, 0 appel réel', X.errs.length === 0 && X.st.reels === 0, X.errs.join(' | '));
    await X.cx.close();
  }
  /* ═════════ E5-2 — réponse rapide (le contrôle) ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 300, rep: OK('DEBRIEF-E5 rapide.') }] });
    await terminer(X); await jusqua(X, 4200);
    await fermerFin(X); await coach(X, 1800);
    const fin = await etat(X.pg);
    t('E5-2 réponse rapide → toujours UN appel, débrief rangé une fois', sur(X, 1200).length === 1 && fin.mag.indexOf(fin.sid) >= 0 && fin.filAuto === 1, resume(X));
    await X.cx.close();
  }
  /* ═════════ E5-3 — le premier appel ÉCHOUE vraiment (HTTP 502, lent) : la reprise doit rester possible ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 4000, status: 502 }, { delai: 200, rep: OK('DEBRIEF-E5 après échec.') }] });
    await terminer(X); await jusqua(X, 3600);
    const pendant = await etat(X.pg);
    await jusqua(X, 6800);
    const apresEchec = await etat(X.pg);
    await fermerFin(X); await coach(X, 2500);
    const fin = await etat(X.pg);
    t('E5-3 ⛔ échec réel → la séance REVIENT en file, et n\'est PAS marquée livrée',
      apresEchec.sid && apresEchec.file[0] === apresEchec.sid && apresEchec.faits.indexOf(apresEchec.sid) < 0 && apresEchec.mag.indexOf(apresEchec.sid) < 0, js(apresEchec));
    t('E5-3b … pendant l\'appel, rien en file (pas de second appel CONCURRENT possible)', pendant.file.indexOf(pendant.sid) < 0, js(pendant));
    t('E5-3c … la reprise au Coach part (2 appels successifs, jamais simultanés) et range UN débrief',
      sur(X, 1200).length === 2 && X.st.req[1].t >= X.st.fin[0].t && fin.mag.filter(k => k === fin.sid).length === 1 && fin.filAuto === 1, resume(X) + ' ' + js(fin));
    await X.cx.close();
  }
  /* ═════════ E5-4 — `complete:false` « Désolé, réessaie. » (lent) ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 4000, rep: REPLI }, { delai: 200, rep: OK('DEBRIEF-E5 après faux succès.') }] });
    await terminer(X); await jusqua(X, 6800);
    const a = await etat(X.pg);
    await fermerFin(X); await coach(X, 2500);
    const fin = await etat(X.pg);
    t('E5-4 ⛔ `complete:false` = pas un succès : rien au magasin, pas livrée, séance en file',
      a.sid && a.mag.indexOf(a.sid) < 0 && a.faits.indexOf(a.sid) < 0 && a.file[0] === a.sid && a.filAuto === 0, js(a));
    t('E5-4b … reprise possible, sans second appel CONCURRENT : 2 appels successifs, un seul débrief final',
      sur(X, 1200).length === 2 && X.st.req[1].t >= X.st.fin[0].t && fin.mag.filter(k => k === fin.sid).length === 1, resume(X));
    await X.cx.close();
  }
  /* ═════════ E5-5 — le REPLI textuel du Worker, même déclaré « complet » ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 4000, rep: REPLI_TXT }, { delai: 200, rep: OK('DEBRIEF-E5 après repli.') }] });
    await terminer(X); await jusqua(X, 6800);
    const a = await etat(X.pg);
    await fermerFin(X); await coach(X, 2500);
    t('E5-5 ⛔ le repli « Désolé, réessaie. » n\'est jamais un débrief, la reprise reste possible, un seul débrief final',
      a.mag.indexOf(a.sid) < 0 && a.file[0] === a.sid && sur(X, 1200).length === 2 && (await etat(X.pg)).mag.length === 1, resume(X) + ' ' + js(a));
    await X.cx.close();
  }
  /* ═════════ E5-6 — RECHARGEMENT pendant l'appel (cas B du 15/09 : MESURÉ, pas inventé) ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 6000, rep: OK('DEBRIEF-E5 PERDU avec la page.') }, { delai: 200, rep: OK('DEBRIEF-E5 repris après rechargement.') }] });
    await terminer(X); await X.pg.waitForTimeout(900);
    await X.pg.reload(); X.st.T0 = Date.now(); await X.pg.waitForTimeout(3900);   // nouvelle page : son rattrapage passe
    const r = await etat(X.pg);
    await coach(X, 2500);
    await X.pg.waitForTimeout(3000);                                              // laisse la 1ʳᵉ requête finir côté « serveur »
    const fin = await etat(X.pg);
    t('E5-6 ⛔ rechargement pendant l\'appel → la réponse de la page morte est perdue ; la séance REVIENT (aucune perte de débrief)',
      r.sid && r.file.indexOf(r.sid) >= 0 && fin.mag.filter(k => k === fin.sid).length === 1 && /repris/.test(fin.magTxt.join('|')), js(r) + ' ' + js(fin));
    /* ⚠️ Le drapeau « livré » de Playwright n'est PAS une mesure ici : `fulfill` ne lève rien pour une requête dont la page a
       disparu (constaté). Ce qui se mesure : combien de requêtes ARRIVENT au serveur simulé. La 1ʳᵉ y est arrivée avant le
       rechargement, donc côté Anthropic elle est payée — c'est le cas B du 15/09, pas E5 (décision serveur chez Michel). */
    module.exports._mesureE56 = { requetes: X.st.req.length, debriefs: fin.mag.filter(k => k === fin.sid).length, messages: fin.filAuto };
    t('E5-6b … aucun DOUBLON de débrief côté téléphone (une entrée, un message) ; mesuré : ' + js(module.exports._mesureE56),
      fin.filAuto === 1 && X.st.req.length === 2, resume(X));
    await X.cx.close();
  }
  /* ═════════ E5-7 — Coach ouvert PENDANT l'appel (avant et après le rattrapage) ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 5000, rep: OK('DEBRIEF-E5 unique.') }] });
    await terminer(X); await X.pg.waitForTimeout(400);
    await fermerFin(X); await coach(X, 600);                  // avant le rattrapage
    await jusqua(X, 4200);
    await clic(X.pg, '#nb-home'); await coach(X, 1200);        // après le rattrapage, toujours en vol
    await jusqua(X, 8200);
    await clic(X.pg, '#nb-home'); await coach(X, 1500);        // après réception
    t('E5-7 ⛔⛔ Coach ouvert pendant l\'appel (avant et après le rattrapage) puis après → UN appel', sur(X, 1200).length === 1, resume(X));
    await X.cx.close();
  }
  {
    // E5-7b — même si un AUTRE écrivain remet la séance en file pendant l'appel, le Coach ne relance pas.
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 5000, rep: OK('DEBRIEF-E5 unique (b).') }] });
    await terminer(X); await X.pg.waitForTimeout(600);
    const sid = await X.pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('ft4_sessions')).find(x => x.volume === 1200); _dbfAjouter(String(s.id)); return String(s.id); });
    await fermerFin(X); await coach(X, 1500);
    await jusqua(X, 8200); await clic(X.pg, '#nb-home'); await coach(X, 1500);
    const fin = await etat(X.pg);
    t('E5-7b ⛔ séance remise en file par un autre écrivain PENDANT l\'appel → le Coach ne la relance pas ; elle sort de la file au succès',
      sur(X, 1200).length === 1 && fin.file.indexOf(sid) < 0, resume(X) + ' ' + js(fin));
    await X.cx.close();
  }
  /* ═════════ E5-8 — Coach après succès, puis après rechargement ═════════ */
  {
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 200, rep: OK('DEBRIEF-E5 livré.') }] });
    await terminer(X); await X.pg.waitForTimeout(1500);
    await fermerFin(X); await coach(X, 1500);
    await X.pg.reload(); X.st.T0 = Date.now(); await X.pg.waitForTimeout(4000); await coach(X, 1500);
    t('E5-8 Coach après succès, puis après rechargement → aucun nouvel appel', sur(X, 1200).length === 1, resume(X));
    await X.cx.close();
  }
  /* ═════════ E5-9 — DEUX séances le MÊME jour : indépendantes ═════════ */
  const SB = () => ({ id: Date.now() - 2 * 3600e3, ts: Date.now() - 2 * 3600e3, date: J, volume: 777, exs: [
    { name: 'Squat', sets: [{ kg: 70, reps: 5, type: 'N', done: true }] }, { name: 'Curl Biceps Haltères', sets: [{ kg: 12, reps: 10, type: 'N', done: true }] }] });
  {
    const B = SB(); const bid = String(B.id);
    const X = await ouvrir({ wkt: WKT([YATES()]), sessions: HIST().concat([B]), stock: { ft4_pending_debrief: JSON.stringify([bid]) },
      reponses: [{ delai: 5000, rep: OK('DEBRIEF-E5 séance A.') }, { delai: 800, rep: OK('DEBRIEF-E5 séance B.') }] });
    await terminer(X); await jusqua(X, 3800);
    await fermerFin(X); await coach(X, 1500);                   // A en vol : B part, A ne doit pas repartir
    const pendant = await etat(X.pg);
    await jusqua(X, 8500); await clic(X.pg, '#nb-home'); await coach(X, 1500);
    await X.pg.reload(); X.st.T0 = Date.now(); await X.pg.waitForTimeout(4000); await coach(X, 1500);
    const fin = await etat(X.pg);
    t('E5-9 ⛔⛔ même jour : A en vol ne bloque pas B (B part pendant A), et chacune a UN appel',
      sur(X, 1200).length === 1 && sur(X, 777).length === 1 && X.st.req.findIndex(r => r.vol === 777) === 1, resume(X) + ' ' + js(pendant));
    t('E5-9b … deux débriefs distincts, rangés chacun sous SON identifiant ; rien en file ni en vol à la fin',
      fin.mag.length === 2 && fin.mag.indexOf(fin.sid) >= 0 && fin.mag.indexOf(bid) >= 0 && fin.file.length === 0, js(fin));
    await X.cx.close();
  }
  {
    // E5-9c — « B terminé ne fait pas croire que A est terminé » : A échoue, B réussit, A reste reprenable.
    const B = SB(); const bid = String(B.id);
    const X = await ouvrir({ wkt: WKT([YATES()]), sessions: HIST().concat([B]), stock: { ft4_pending_debrief: JSON.stringify([bid]) },
      reponses: [{ delai: 4500, status: 502 }, { delai: 300, rep: OK('DEBRIEF-E5 séance B.') }, { delai: 300, rep: OK('DEBRIEF-E5 séance A repris.') }] });
    await terminer(X); await jusqua(X, 3700);
    await fermerFin(X); await coach(X, 1200);                   // B part et réussit pendant que A est en vol
    await jusqua(X, 7200);                                      // A a échoué
    const mid = await etat(X.pg);
    await clic(X.pg, '#nb-home'); await coach(X, 2000);        // A est repris
    const fin = await etat(X.pg);
    t('E5-9c ⛔ B réussi ne rend pas A « fait » : A échoué reste en file puis est repris, chacune son débrief',
      mid.file.indexOf(mid.sid) >= 0 && mid.faits.indexOf(mid.sid) < 0 && mid.faits.indexOf(bid) >= 0
      && sur(X, 1200).length === 2 && sur(X, 777).length === 1 && fin.mag.length === 2, resume(X) + ' ' + js(mid));
    await X.cx.close();
  }
  {
    /* E5-9d — trouvé par le contrôle négatif (M-E5-11 restait vert) : quand A répond, l'appel de B — toujours en vol —
       doit le RESTER. On observe l'état persisté, parce qu'aucun appel en plus ne le trahit tant que rien ne plante. */
    const B = SB(); const bid = String(B.id);
    const X = await ouvrir({ wkt: WKT([YATES()]), sessions: HIST().concat([B]), stock: { ft4_pending_debrief: JSON.stringify([bid]) },
      reponses: [{ delai: 2500, rep: OK('DEBRIEF-E5 séance A.') }, { delai: 7000, rep: OK('DEBRIEF-E5 séance B.') }] });
    await terminer(X); await fermerFin(X); await coach(X, 400);           // A (fin de séance) et B (Coach) en vol ensemble
    await jusqua(X, 6200);                                                // A a répondu, B est encore en vol
    const vol = await X.pg.evaluate(b => { const v = JSON.parse(localStorage.getItem('ft4_debrief_encours') || 'null'); return { b: !!(v && v.vol && v.vol[b]), brut: v }; }, bid);
    await jusqua(X, 11000);
    t('E5-9d ⛔ A répond pendant que B est en vol : B reste « en vol » (une séance ne libère que SON appel), un appel chacune',
      X.st.req.length === 2 && vol.b && sur(X, 1200).length === 1 && sur(X, 777).length === 1, resume(X) + ' ' + js(vol));
    await X.cx.close();
  }
  {
    /* E5-6c — trouvé par le contrôle négatif (M-E5-9, un minuteur à la place de la preuve de vie, restait vert : le filet
       n°3 ne rattrape qu'UNE séance, la plus récente, et masquait la différence). DEUX appels en vol, rechargement : au
       premier démarrage, les DEUX doivent revenir — quel que soit leur âge. Une page morte est morte tout de suite. */
    const B = SB(); const bid = String(B.id);
    const X = await ouvrir({ wkt: WKT([YATES()]), sessions: HIST().concat([B]), stock: { ft4_pending_debrief: JSON.stringify([bid]) },
      reponses: [{ delai: 9000, rep: OK('PERDU A') }, { delai: 9000, rep: OK('PERDU B') }] });
    await terminer(X); await fermerFin(X); await coach(X, 600);
    const enVol = X.st.req.length;
    await X.pg.reload(); X.st.T0 = Date.now(); await X.pg.waitForTimeout(3900);
    const r = await etat(X.pg);
    t('E5-6c ⛔ deux appels en vol puis rechargement → au premier démarrage, les DEUX séances reviennent en file (aucune attendue)',
      enVol === 2 && r.sid && r.file.indexOf(r.sid) >= 0 && r.file.indexOf(bid) >= 0, 'en vol=' + enVol + ' ' + js(r));
    await X.cx.close();
  }
  /* ═════════ E5-10 / E5-11 — suppression de la séance ═════════ */
  const supprimer = async (X, id) => {
    await clic(X.pg, '#nb-progress');
    await X.pg.evaluate(() => { try { switchProgTab('exo', document.getElementById('ptab-exo')); } catch (e) {} }); await X.pg.waitForTimeout(350);
    const a = await clic(X.pg, '#sess-list .sess-card[onclick="openSessDetail(' + id + ')"] .sess-title');
    const b1 = await clic(X.pg, '#sd-del-btn'); const b2 = await clic(X.pg, '#sd-del-btn');
    await X.pg.waitForTimeout(300); return a && b1 && b2;
  };
  {
    // E5-10 — échec (séance en attente), puis suppression : le comportement SESSION-INTEGRITY est gardé.
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 200, status: 502 }, { delai: 200, rep: OK('ORPHELIN-E5') }] });
    await terminer(X); await X.pg.waitForTimeout(1500);
    const a = await etat(X.pg);
    await fermerFin(X);
    const ok = await supprimer(X, a.sid);
    await coach(X, 2500);
    const fin = await etat(X.pg);
    t('E5-10 ⛔ séance en attente puis supprimée → plus en file, aucun appel au Coach, aucun débrief orphelin',
      a.file.indexOf(a.sid) >= 0 && ok && fin.ids.indexOf(a.sid) < 0 && fin.file.indexOf(a.sid) < 0 && X.st.req.length === 1 && fin.mag.length === 0, resume(X) + ' ' + js(fin));
    await X.cx.close();
  }
  {
    // E5-11 — suppression PENDANT un appel déjà parti : on MESURE, on ne promet rien de plus.
    const X = await ouvrir({ wkt: WKT([YATES()]), reponses: [{ delai: 5000, rep: OK('DEBRIEF-E5 arrivé après suppression.') }] });
    await terminer(X); await X.pg.waitForTimeout(500);
    const a = await etat(X.pg);
    await fermerFin(X);
    const ok = await supprimer(X, a.sid);
    await jusqua(X, 8500);
    await clic(X.pg, '#nb-home'); await coach(X, 1500);
    await X.pg.reload(); X.st.T0 = Date.now(); await X.pg.waitForTimeout(4000); await coach(X, 1500);
    const fin = await etat(X.pg);
    module.exports._mesureE511 = { appels: X.st.req.length, orphelinAuMagasin: fin.mag.indexOf(a.sid) >= 0, messageDansLeFil: fin.filAuto, file: fin.file };
    t('E5-11 suppression pendant un appel déjà parti → aucun SECOND appel (mesuré : ' + js(module.exports._mesureE511) + ')',
      ok && X.st.req.length === 1 && fin.file.indexOf(a.sid) < 0, resume(X) + ' ' + js(fin));
    await X.cx.close();
  }
  /* ═════════ E5-12 — débrief DÉJÀ rangé, séance restée en file (l'état que E5 a laissé sur les téléphones) ═════════ */
  {
    const S = { id: Date.now() - 3600e3, ts: Date.now() - 3600e3, date: J, volume: 1200, exs: [YATES()] }; const sid = String(S.id);
    const X = await ouvrir({ sessions: HIST().concat([S]), reponses: [{ delai: 200, rep: OK('DEBRIEF-E5 REPAYÉ.') }],
      stock: { ft4_pending_debrief: JSON.stringify([sid]), ft4_debrief_faits: JSON.stringify([sid]),
        ft4_debriefs: JSON.stringify({ v: 1, seances: { [sid]: { texte: 'DEBRIEF-E5 déjà rangé.', ts: 1, src: 'fin' } } }) } });
    await X.pg.waitForTimeout(2500); await coach(X, 2500);
    const fin = await etat(X.pg);
    t('E5-12 ⛔⛔ débrief déjà rangé pour cette séance → AUCUN nouvel appel, et la séance quitte la file',
      X.st.req.length === 0 && fin.file.indexOf(sid) < 0 && /déjà rangé/.test(fin.magTxt.join('|')), resume(X) + ' ' + js(fin));
    await X.cx.close();
  }
  {
    // E5-12b — l'inverse, et c'est lui qui interdit la correction paresseuse : en file + « faite » SANS débrief rangé
    // (un échec enregistré par l'ancienne version, qui marquait « faite » à l'échec) → la reprise DOIT partir.
    const S = { id: Date.now() - 3600e3, ts: Date.now() - 3600e3, date: J, volume: 1200, exs: [YATES()] }; const sid = String(S.id);
    const X = await ouvrir({ sessions: HIST().concat([S]), reponses: [{ delai: 200, rep: OK('DEBRIEF-E5 reprise d\'un ancien échec.') }],
      stock: { ft4_pending_debrief: JSON.stringify([sid]), ft4_debrief_faits: JSON.stringify([sid]) } });
    await X.pg.waitForTimeout(2500); await coach(X, 2500);
    const fin = await etat(X.pg);
    t('E5-12b ⛔ ancien échec (en file, « faite », aucun débrief rangé) → la reprise PART, une fois : aucun débrief perdu',
      X.st.req.length === 1 && fin.mag.indexOf(sid) >= 0 && fin.file.indexOf(sid) < 0, resume(X) + ' ' + js(fin));
    await X.cx.close();
  }
  {
    // E5-13 — l'appel interrompu par une page PRÉCÉDENTE (ancien format de l'emplacement) est toujours repris.
    const S = { id: Date.now() - 3600e3, ts: Date.now() - 3600e3, date: J, volume: 1200, exs: [YATES()] }; const sid = String(S.id);
    const X = await ouvrir({ sessions: HIST().concat([S]), reponses: [{ delai: 200, rep: OK('DEBRIEF-E5 repris (ancienne page).') }],
      stock: { ft4_debrief_encours: JSON.stringify({ id: sid, ts: Date.now() - 60e3 }) } });
    await X.pg.waitForTimeout(2600); await coach(X, 2500);
    const fin = await etat(X.pg);
    t('E5-13 ⛔ « en cours » laissé par une page précédente (ancien format) → repris au démarrage, un appel, aucune perte',
      X.st.req.length === 1 && fin.mag.indexOf(sid) >= 0 && !fin.encours, resume(X) + ' ' + js(fin));
    await X.cx.close();
  }
};
