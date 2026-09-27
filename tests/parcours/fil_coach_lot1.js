/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🧵 FIABILISATION LOT 1 — INTÉGRITÉ DU FIL DU COACH (F07a + F07b) · session-B · 27/09/2026

   Mesuré par l'écran sur master 2f5ccdb5 (ft-v1238), AVANT correction :
     · F07a — fil de 30 messages CHARGÉ, fin de séance + débrief en ligne → 20 messages :
       `_dbfPoserDansHistorique` coupait à 20 (`slice(-20)`), les 12 plus anciens perdus ;
     · F07b — fil de 30 messages enregistré mais PAS chargé en mémoire (Apps Script injoignable,
       Coach jamais ouvert) → le débrief était ajouté à un `coachHistory` vide puis enregistré :
       les 30 messages remplacés par les 2 du débrief. Même chose au démarrage, quand le
       rattrapage pose un débrief déjà reçu, et quand le contenu enregistré est illisible.
   Correctif : `_coachHistHydrater` lit le fil sur le téléphone AVANT toute mutation (aucun
   réseau), refuse d'écrire sur un contenu illisible (le « reçu » du débrief est alors gardé),
   et la coupe à 20 est remplacée par la règle du chat (borne 400, puis budget de place).

   Ce que les témoins CONDUISENT : l'onglet Coach, l'onglet Séance et le bouton « Terminer »
   (clics réels), un VRAI rechargement de page, un démarrage réellement hors ligne (service
   worker actif, réseau coupé), le rattrapage au démarrage, un message tapé au Coach.
   Ce qu'ils OBSERVENT : le fil en mémoire et SUR LE DISQUE (ordre, doublons, contenu brut),
   le « reçu » et la liste des séances livrées, chaque requête envoyée au Worker (dont
   l'historique transmis à Milo et à `summarizeCoach`), la séance enregistrée.
   Ce qu'ils NE COUVRENT PAS : la fenêtre de contexte envoyée à Milo quand le fil n'est pas
   chargé (F03 — inchangée, figée ici telle que master l'envoie), `continueInCoach` (autre
   écrivain du fil, hors lot), la lecture d'un fil illisible par l'ouverture du Coach (hors lot).
   Banc : tools/banc_fil_lot1.js · contrôle négatif : tools/mut_fil_lot1.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const FIL = []; { const t0 = Date.now() - 3600000;
  for (let i = 0; i < 15; i++) { FIL.push({ role: 'user', content: 'Question ' + i, ts: t0 + i * 1000 }); FIL.push({ role: 'assistant', content: 'Réponse ' + i, ts: t0 + i * 1000 + 500 }); } }
const DEBRIEF = 'Belle séance, charges tenues (DEBRIEF-LOT1).';
const ILLISIBLE = '{pas du json';

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-CCCXCIII (session-B). LOT 1 — le débrief ne coupe plus le fil et ne l\'écrase plus (source) ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const co = nu('coach.js'), lo = nu('log.js');
  const corps = (src, nom) => { const i = src.search(new RegExp('(async\\s+)?function ' + nom + '\\(')); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10), k = src.indexOf('\nasync function ', i + 10);
    const fin = [j, k].filter(x => x > 0); return src.slice(i, fin.length ? Math.min(...fin) : undefined); };
  const hyd = corps(co, '_coachHistHydrater'), pose = corps(co, '_dbfPoserDansHistorique'), rec = corps(co, '_dbfRecuperer'),
        save = corps(co, '_saveCoachHist'), pay = corps(co, '_coachHistPayload'), run = corps(lo, '_runSeDebrief');
  t('① les fonctions sont trouvées (sinon les témoins suivants ne mesurent rien)', hyd && pose && rec && save && pay && run, [hyd, pose, rec, save, pay, run].map(x => x.length).join('/'));
  t('② F07a : plus aucune coupe à 20 dans `_dbfPoserDansHistorique`', !/slice\(\s*-\s*20\s*\)/.test(pose) && !/length\s*>\s*20\b/.test(pose), pose.slice(0, 200));
  const iH = pose.indexOf('_coachHistHydrater()'), iP = pose.indexOf('coachHistory.push');
  t('③ F07b : le fil est hydraté AVANT la première mutation, et un refus arrête tout', iH > 0 && iP > iH && /if\(\s*!_coachHistHydrater\(\)\s*\)\s*return\s+false/.test(pose), iH + ' < ' + iP);
  t('④ la garde lit le contenu enregistré et REFUSE l\'illisible avant de charger — même quand le drapeau dit « chargé »',
    /JSON\.parse/.test(hyd) && /return\s+false/.test(hyd) && hyd.indexOf('JSON.parse') < hyd.indexOf('_loadCoachHist()') && hyd.indexOf('JSON.parse') < hyd.indexOf('_coachHistLoaded'), hyd.slice(0, 260));
  t('⑤ la garde n\'est PAS à l\'enregistrement : `_saveCoachHist` ne consulte pas l\'état de chargement', !/_coachHistLoaded|_coachHistHydrater/.test(save), save.slice(0, 200));
  t('⑥ budgets inchangés : 400 messages, 150 000 caractères', /const\s+_HIST_MAX_MSG\s*=\s*400\s*;/.test(co) && /const\s+_HIST_BUDGET\s*=\s*150000\s*;/.test(co), '');
  t('⑦ ce que Milo reçoit ne change pas : `_coachHistPayload` ne transmet que `role`/`content`, et le débrief en envoie 8',
    /\.map\(\s*m\s*=>\s*\(\{\s*role:\s*m\.role,\s*content:\s*m\.content\s*\}\)\)/.test(pay) && /history:\(typeof _coachHistPayload==='function'\?_coachHistPayload\(8\)/.test(run), '');
  t('⑧ rattrapage : un fil illisible garde le « reçu » (séance marquée livrée, AVANT `_dbfFini`)',
    /!_dbfPoserDansHistorique\(_r\.reply,\s*_r\.instr\)\)\{\s*_dbfMarquerFait\(_r\.id\);\s*return;\s*\}/.test(rec) && rec.indexOf('_dbfMarquerFait(_r.id)') < rec.indexOf('_dbfFini(_r.id)'), rec.slice(0, 300));
  t('⑨ fin de séance : un débrief non posé n\'efface pas son « reçu » (`_dbfFini` seulement s\'il est posé)',
    /_pose=_dbfPoserDansHistorique\(reply,\s*instr\)/.test(run) && /if\(_pose===false[^)]*\)\s*_dbfMarquerFait\(_pid\);\s*else if\(typeof _dbfFini==='function'\)\s*_dbfFini\(_pid\);/.test(run), '');
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CCCXCIV (session-B). LOT 1 — fil du Coach intact après débrief, rechargement, hors ligne (écran conduit) ═══');
  const js = x => JSON.stringify(x).slice(0, 260);
  const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
  const D = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 't@t.t',
    ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_lms: moisPrec };
  const WKT = () => ({ date: new Date().toISOString().slice(0, 10), startHour: 10, exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 6, type: 'N', done: true, rm1: 0 }] }] });
  const PROFIL_OK = a => a === 'loadProfile' ? { status: 'ok', premium: false, profile: { name: 'Test', bw: 80, age: 40, gender: 'H', goal: 'force' }, sessions: [], prs: {} } : { status: 'ok' };
  const ouvrir = async (o) => {
    o = o || {};
    const cx = await b.newContext(Object.assign({ serviceWorkers: o.sw ? 'allow' : 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' }));
    const st = { offline: false, req: [], replies: (o.replies || []).slice(), profils: 0 };
    // B : la réponse du profil est RETENUE jusqu'à ce que le débrief soit posé (puis libérée, sous la limite de 3 s d'autoConnect).
    if (o.backendRetenu) st.lacher = new Promise(z => { st._lacher = z; });
    await cx.route(/supabase\.co/, r => r.abort());
    await cx.route(/script\.google\.com/, async r => {
      if (st.offline || !o.backend) return r.abort('failed');
      let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      const a = c.action || (r.request().url().match(/action=([a-zA-Z]+)/) || [])[1] || 'ping';
      if (a === 'loadProfile' && st.lacher) await st.lacher;
      if (a === 'loadProfile') st.profils++;
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(PROFIL_OK(a)) }); });
    await cx.route(/workers\.dev/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      if (st.offline) return r.abort('internetdisconnected');
      st.req.push(c);
      if (c.action === 'coach') return r.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ reply: st.replies.shift() || DEBRIEF, _diag: 'ok', stopReason: 'end_turn', truncated: false, complete: true, continued: false }) });
      if (c.action === 'summarizeCoach') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ summary: 'RESUME-LOT1' }) });
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    if (o.backendRetenu) await pg.exposeFunction('__lot1Pose', () => { if (st._lacher) st._lacher(); });
    const init = Object.assign({}, D, { ft4_wkt: JSON.stringify(WKT()) }, o.fil === null ? {} : { ft4_coach_hist: typeof o.fil === 'string' ? o.fil : JSON.stringify(o.fil || FIL) }, o.stock || {});
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_l1'))return; sessionStorage.setItem('_l1','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(o.attenteInit || 1500);
    return { cx, pg, st, errs, n: act => st.req.filter(c => c.action === act).length };
  };
  // Clic RÉEL sur un élément visible (les pop-ups de démarrage sont fermées, jamais l'écran de fin de séance).
  const clic = async (pg, sel) => {
    for (let k = 0; k < 6; k++) {
      await pg.evaluate(() => document.querySelectorAll('.overlay.open').forEach(o => { if (o.id !== 'ov-session-end') o.classList.remove('open'); }));
      const h = (await pg.evaluateHandle(s => [...document.querySelectorAll(s)].find(x => x.offsetParent !== null) || null, sel)).asElement();
      if (!h) { await pg.waitForTimeout(200); continue; }
      try { await h.evaluate(x => x.scrollIntoView({ block: 'center' })); await h.click({ timeout: 3000 }); return true; } catch (e) { await pg.waitForTimeout(200); }
    }
    return false;
  };
  const fermerFin = pg => clic(pg, '[onclick="closeSessionEnd()"]');
  const terminer = async X => {
    const a = await clic(X.pg, '#nb-log'); await X.pg.waitForTimeout(300);
    const f = await clic(X.pg, 'button[onclick="finishWorkout()"]');
    const t0 = Date.now(); let txt = '';
    while (Date.now() - t0 < 8000) { txt = await X.pg.evaluate(() => (document.getElementById('se-debrief') || {}).textContent || '');
      if (/DEBRIEF-LOT1|Hors ligne|n'a pas pu/.test(txt)) break; await X.pg.waitForTimeout(150); }
    await X.pg.waitForTimeout(600);
    return { clics: a && f, ecran: txt.replace(/\s+/g, ' ') };
  };
  const lire = pg => pg.evaluate(() => {
    let raw = null; try { raw = localStorage.getItem('ft4_coach_hist'); } catch (e) {}
    let d = null; try { d = JSON.parse(raw); } catch (e) {}
    const arr = Array.isArray(d) ? d : null;
    const orig = arr ? arr.filter(m => /^(Question|Réponse) \d+$/.test(String(m.content))).map(m => m.content) : [];
    return { brut: raw, disque: arr ? arr.length : null, memoire: coachHistory.length, charge: _coachHistLoaded, orig,
      contenus: arr ? arr.map(m => (m.role === 'user' ? (m._silent ? 'u*' : 'u') : 'a') + ':' + String(m.content).slice(0, 40)) : null,
      memContenus: coachHistory.map(m => (m.role === 'user' ? (m._silent ? 'u*' : 'u') : 'a') + ':' + String(m.content).slice(0, 40)),
      recu: localStorage.getItem('ft4_debrief_recu'), faits: localStorage.getItem('ft4_debrief_faits'), file: localStorage.getItem('ft4_pending_debrief'),
      sessions: JSON.parse(localStorage.getItem('ft4_sessions') || '[]').map(s => (s.exs || []).map(e => e.name + ':' + (e.sets || []).map(z => z.kg + 'x' + z.reps + (z.done ? 'v' : '')).join(',')).join('|')),
      wkt: localStorage.getItem('ft4_wkt'), cartes: document.querySelectorAll('#coach-msgs .coach-seance-carte').length };
  });
  const recharger = async (X, attente) => { await X.pg.reload(); await X.pg.waitForTimeout(attente || 4500); return lire(X.pg); };
  const ORIG = FIL.map(m => m.content);
  const ordreIntact = r => JSON.stringify(r.orig) === JSON.stringify(ORIG);
  const nDebrief = r => (r.contenus || []).filter(c => c === 'a:' + DEBRIEF.slice(0, 40)).length;
  const finPropre = r => !!r.contenus && r.contenus.length === 32 && /^u\*:\[DÉBRIEF AUTO\]/.test(r.contenus[30]) && r.contenus[31] === 'a:' + DEBRIEF.slice(0, 40);
  const hist = X => X.st.req.filter(c => c.action === 'coach' && /DÉBRIEF AUTO/.test(String(c.message || ''))).map(c => (c.history || []).map(m => m.content));
  const sumH = X => X.st.req.filter(c => c.action === 'summarizeCoach').map(c => (c.history || []).map(m => String(m.content).slice(0, 40)));
  const tous = [];
  const fermer = async X => { try { await X.cx.close(); } catch (e) {} };
  try {
  // ── A · fil 30 CHARGÉ (onglet Coach ouvert), fin de séance + débrief en ligne ─────────────────
  const A = await ouvrir({}); tous.push(A);
  await clic(A.pg, '#nb-coach'); await A.pg.waitForTimeout(400);
  await A.pg.evaluate(() => { window.__nLoad = 0; const f = window._loadCoachHist; window._loadCoachHist = function () { window.__nLoad++; return f.apply(this, arguments); }; });
  const aAv = await lire(A.pg), aFin = await terminer(A), aAp = await lire(A.pg), aLoad = await A.pg.evaluate(() => window.__nLoad);
  await A.pg.waitForTimeout(800); const aW = A.st.req.length, aRe = await recharger(A);
  t('A (F07a) avant : fil chargé, 30 messages en mémoire et sur le disque', aAv.charge === true && aAv.memoire === 30 && aAv.disque === 30, js(aAv.contenus && aAv.contenus.length));
  t('A (F07a) ⭐ après le débrief : 32 = les 30 d\'origine, dans l\'ordre, PUIS le débrief (plus de coupe à 20)',
    aFin.clics && /DEBRIEF-LOT1/.test(aFin.ecran) && aAp.memoire === 32 && ordreIntact(aAp) && finPropre(aAp), 'mémoire ' + aAp.memoire + ' disque ' + aAp.disque + ' ' + js(aAp.contenus && aAp.contenus.slice(0, 2)));
  t('A après VRAI rechargement : stockage identique, 32 messages, aucun appel au Worker', aRe.brut === aAp.brut && aRe.disque === 32 && A.st.req.length === aW, 'appels ' + aW + ' → ' + A.st.req.length);
  t('F fil déjà chargé : aucun second chargement pendant la fin de séance, et un seul débrief', aLoad === 0 && nDebrief(aRe) === 1 && new Set(aRe.contenus).size === 32, 'chargements ' + aLoad + ' · débriefs ' + nDebrief(aRe));
  t('A contrôle : Milo reçoit exactement ce que master envoyait (les 8 derniers : Question 11 … Réponse 14)',
    js(hist(A)) === js([ORIG.slice(-8)]), js(hist(A)));
  t('A contrôle : `summarizeCoach` reçoit la même fenêtre que sur master (16 : Question 8 … le débrief)',
    sumH(A).length === 1 && sumH(A)[0].length === 16 && sumH(A)[0][0] === 'Question 8' && sumH(A)[0][15] === DEBRIEF.slice(0, 40), js(sumH(A)));

  // ── C · fil 30 enregistré, PAS chargé, Apps Script injoignable (T2) ────────────────────────
  const C = await ouvrir({}); tous.push(C);
  const cAv = await lire(C.pg), cFin = await terminer(C), cAp = await lire(C.pg);
  const cW = C.st.req.length;
  await fermerFin(C.pg); await clic(C.pg, '#nb-coach'); await C.pg.waitForTimeout(500);
  const cCo = await lire(C.pg);
  const cRe = await recharger(C); await clic(C.pg, '#nb-coach'); await C.pg.waitForTimeout(500); const cRe2 = await lire(C.pg);
  t('C (F07b) avant : 30 messages sur le disque, AUCUN en mémoire (fil non chargé)', cAv.charge === false && cAv.memoire === 0 && cAv.disque === 30, js(cAv.memoire));
  t('C (F07b) ⭐ après le débrief, serveur injoignable : les 30 d\'origine + le débrief (plus remplacé par 2)',
    cFin.clics && /DEBRIEF-LOT1/.test(cFin.ecran) && ordreIntact(cAp) && finPropre(cAp), 'disque ' + cAp.disque + ' ' + js(cAp.contenus && cAp.contenus.slice(0, 2)));
  t('C onglet Coach ouvert ensuite : le fil complet s\'affiche depuis la mémoire, sans rechargement ni doublon',
    cCo.memoire === 32 && js(cCo.memContenus) === js(cAp.contenus) && nDebrief(cCo) === 1, js(cCo.memoire));
  t('C ⭐ après VRAI rechargement : stockage identique, 32 messages, aucun appel au Worker', cRe.brut === cAp.brut && cRe2.memoire === 32 && C.st.req.length === cW, 'appels ' + cW + ' → ' + C.st.req.length);
  t('C contrôle : Milo reçoit exactement ce que master envoyait (fil non chargé : historique vide, F03 hors lot)', js(hist(C)) === js([[]]), js(hist(C)));
  t('C contrôle : le débrief n\'ajoute aucune carte séance', cRe2.cartes === 0 && cCo.cartes === 0, cCo.cartes + '/' + cRe2.cartes);
  t('A/C contrôle : la séance enregistrée et la séance en cours sont les mêmes par les deux chemins',
    js(aAp.sessions) === js(cAp.sessions) && aAp.sessions.length === 1 && /Développé Couché:80x6v/.test(aAp.sessions[0]) && aAp.wkt === cAp.wkt, js(aAp.sessions) + ' / ' + js(cAp.sessions) + ' wkt ' + aAp.wkt + '/' + cAp.wkt);

  // ── B · fil 30 enregistré, PAS chargé, Apps Script DISPONIBLE (sa réponse arrive APRÈS le débrief) ──
  const B = await ouvrir({ backend: true, backendRetenu: true, attenteInit: 400 }); tous.push(B);
  await B.pg.evaluate(() => { window.__chargeAuDebrief = 'jamais'; const f = window._dbfPoserDansHistorique;
    window._dbfPoserDansHistorique = function () { window.__chargeAuDebrief = _coachHistLoaded; const r = f.apply(this, arguments); try { window.__lot1Pose(); } catch (e) {} return r; }; });
  const bAv = await lire(B.pg), bFin = await terminer(B), bAp = await lire(B.pg);
  const bCharge = await B.pg.evaluate(() => window.__chargeAuDebrief);
  await B.pg.waitForFunction(() => window._premiumPending === false, null, { timeout: 5000 }).catch(() => {});
  await B.pg.waitForTimeout(500); const bPr = await lire(B.pg);
  const bRe = await recharger(B);
  t('B au moment du débrief : fil NON chargé, et le serveur répond ensuite (profil reçu et traité)',
    bAv.charge === false && bCharge === false && B.st.profils >= 1 && await B.pg.evaluate(() => window._premiumPending === false), js({ avant: bAv.charge, auDebrief: bCharge, profils: B.st.profils }));
  t('B ⭐ après le débrief : fil complet + débrief ; toujours intact quand le profil arrive ensuite',
    bFin.clics && ordreIntact(bAp) && finPropre(bAp) && bPr.brut === bAp.brut && bPr.memoire === 32, 'disque ' + bAp.disque + ' puis ' + bPr.disque + ' mémoire ' + bPr.memoire);
  t('B après VRAI rechargement : stockage identique', bRe.brut === bAp.brut, '');

  // ── E · fil VRAIMENT neuf (aucune clé) ──────────────────────────────────────────────────────
  const E = await ouvrir({ fil: null }); tous.push(E);
  const eAv = await lire(E.pg); await terminer(E); const eAp = await lire(E.pg); const eRe = await recharger(E);
  t('E fil neuf : le débrief le crée (2 messages), aucun ancien fil inventé', eAv.brut === null && eAp.disque === 2 && eAp.orig.length === 0
    && /^u\*:\[DÉBRIEF AUTO\]/.test(eAp.contenus[0]) && eAp.contenus[1] === 'a:' + DEBRIEF.slice(0, 40) && eRe.brut === eAp.brut, js(eAp.contenus));

  // ── H · fil de 400 messages : la borne de sécurité du chat s'applique, pas davantage ─────────
  const G400 = []; for (let i = 0; i < 200; i++) { G400.push({ role: 'user', content: 'Q' + i }); G400.push({ role: 'assistant', content: 'R' + i }); }
  const H = await ouvrir({ fil: G400 }); tous.push(H);
  await terminer(H); const hAp = await lire(H.pg);
  t('H fil de 400 : même borne que le chat (400) — seuls les 2 plus anciens sortent, jamais une coupe à 20',
    hAp.disque === 400 && hAp.contenus[0] === 'u:Q1' && hAp.contenus[397] === 'a:R199' && hAp.contenus[399] === 'a:' + DEBRIEF.slice(0, 40), 'disque ' + hAp.disque + ' ' + js(hAp.contenus && hAp.contenus.slice(0, 2)));

  // ── G · contenu enregistré ILLISIBLE, fil non chargé ─────────────────────────────────────────
  const G = await ouvrir({ fil: ILLISIBLE }); tous.push(G);
  const gFin = await terminer(G), gAp = await lire(G.pg); const gW = G.n('coach');
  const gRe = await recharger(G);
  let gRecu = null; try { gRecu = JSON.parse(gAp.recu); } catch (e) {}
  t('G fil illisible : RIEN n\'est écrit par-dessus (contenu brut identique octet pour octet)', gAp.brut === ILLISIBLE && gRe.brut === ILLISIBLE, js(gAp.brut));
  t('G le débrief n\'est pas perdu : affiché à l\'écran de fin, son « reçu » est GARDÉ, la séance marquée livrée',
    /DEBRIEF-LOT1/.test(gFin.ecran) && !!gRecu && gRecu.reply === DEBRIEF && !!gAp.faits && gAp.faits.indexOf(String(gRecu.id)) >= 0 && !gAp.file, js({ recu: !!gRecu, faits: gAp.faits, file: gAp.file }));
  t('G rechargement : aucun second appel payé (reçu toujours gardé)', G.n('coach') === gW && !!gRe.recu && !gRe.file, 'coach ' + gW + ' → ' + G.n('coach'));
  // G3 · le fil redevient lisible (la personne écrit au Coach), puis le rattrapage pose le débrief UNE fois
  await clic(G.pg, '#nb-coach'); await G.pg.waitForTimeout(400);
  G.st.replies.push('Réponse au squat (LOT1).');
  await G.pg.fill('#coach-inp', 'Salut, une question sur le squat'); await clic(G.pg, '#coach-send-btn');
  await G.pg.waitForFunction(() => !coachBusy && coachHistory.length >= 2, null, { timeout: 8000 }).catch(() => {});
  const g3W = G.n('coach'); const g3Re = await recharger(G); const g3Re2 = await recharger(G);
  t('G3 le fil redevenu lisible : le débrief gardé est posé au démarrage suivant, une seule fois, sans nouvel appel',
    g3Re.disque === 4 && nDebrief(g3Re) === 1 && !g3Re.recu && g3Re2.brut === g3Re.brut && G.n('coach') === g3W, js(g3Re.contenus) + ' coach ' + g3W + ' → ' + G.n('coach'));

  // ── G2 · contenu ILLISIBLE, et l'onglet Coach ouvert AVANT (qui le charge comme un fil vide) ──
  const G2 = await ouvrir({ fil: ILLISIBLE }); tous.push(G2);
  await clic(G2.pg, '#nb-coach'); await G2.pg.waitForTimeout(400);
  const g2Av = await lire(G2.pg); await terminer(G2); const g2Ap = await lire(G2.pg);
  t('G2 le drapeau « chargé » ne suffit pas : fil illisible chargé comme vide → toujours RIEN écrit, reçu gardé',
    g2Av.charge === true && g2Ap.brut === ILLISIBLE && !!g2Ap.recu, 'chargé ' + g2Av.charge + ' brut ' + js(g2Ap.brut));

  // ── R · rattrapage au démarrage : un débrief déjà reçu, fil 30 non chargé ────────────────────
  const R = await ouvrir({ stock: { ft4_debrief_recu: JSON.stringify({ id: 's-recup', ts: Date.now() - 60000, reply: DEBRIEF, instr: '[DÉBRIEF AUTO] consigne' }) } }); tous.push(R);
  await R.pg.waitForTimeout(3500); const rAp = await lire(R.pg); const rRe = await recharger(R);
  t('R (F07b) rattrapage au démarrage : le débrief reçu s\'AJOUTE au fil de 30 (plus un remplacement), sans appel',
    ordreIntact(rAp) && finPropre(rAp) && !rAp.recu && R.st.req.length === 0 && rRe.brut === rAp.brut, 'disque ' + rAp.disque + ' appels ' + R.st.req.length);

  // ── D · départ RÉELLEMENT hors ligne (service worker, réseau coupé), puis retour réseau ───────
  const Dh = await ouvrir({ sw: true }); tous.push(Dh);
  await Dh.pg.evaluate(async () => { await Promise.race([navigator.serviceWorker.ready, new Promise(z => setTimeout(z, 15000))]); await new Promise(z => setTimeout(z, 2500)); });
  if (!await Dh.pg.evaluate(() => !!navigator.serviceWorker.controller)) { await Dh.pg.reload(); await Dh.pg.waitForTimeout(2000); }
  Dh.st.offline = true; await Dh.cx.setOffline(true);
  let dCharge = true; try { await Dh.pg.reload({ timeout: 20000 }); await Dh.pg.waitForTimeout(2000); } catch (e) { dCharge = false; }
  const dAv = await lire(Dh.pg), dFin = await terminer(Dh), dAp = await lire(Dh.pg);
  Dh.st.offline = false; await Dh.cx.setOffline(false);
  await fermerFin(Dh.pg); await clic(Dh.pg, '#nb-coach');
  await Dh.pg.waitForFunction(() => !coachBusy && coachHistory.length >= 32, null, { timeout: 10000 }).catch(() => {});
  await Dh.pg.waitForTimeout(800);
  const dCo = await lire(Dh.pg); const dW = Dh.st.req.length; const dRe = await recharger(Dh);
  t('D départ hors ligne : l\'app s\'ouvre depuis le cache, fil non chargé', dCharge && dAv.charge === false && dAv.disque === 30, js({ charge: dCharge, disque: dAv.disque }));
  t('D fin de séance hors ligne : aucune écriture du fil, le débrief attend (file)', /Hors ligne/.test(dFin.ecran) && dAp.brut === dAv.brut && !!dAp.file, js(dFin.ecran.slice(-80)));
  t('D ⭐ réseau revenu + onglet Coach : le débrief s\'ajoute UNE fois aux 30', ordreIntact(dCo) && dCo.disque === 32 && (dCo.contenus || []).filter(c => /^u\*:\[DÉBRIEF AUTO\]/.test(c)).length === 1 && nDebrief(dCo) === 1, js(dCo.contenus && dCo.contenus.slice(-2)));
  t('D après VRAI rechargement : stockage identique, aucun appel au Worker', dRe.brut === dCo.brut && Dh.st.req.length === dW, 'appels ' + dW + ' → ' + Dh.st.req.length);

  const errs = tous.flatMap(X => X.errs);
  t('aucune erreur JavaScript dans les pages conduites', errs.length === 0, js(errs.slice(0, 3)));
  } finally { for (const X of tous) await fermer(X); }
};
