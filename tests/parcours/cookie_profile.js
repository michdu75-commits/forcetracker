/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🛡️ COOKIE-PROFILE-01 — un cookie `ft_email` n'est qu'un INDICE de compte (session-B · 06/10/2026)
   Blocs : B-CP-E (écran conduit). CONDUIT : un navigateur au stockage vide (ou réel) avec un cookie `ft_email`, le vrai
   démarrage (index.html → load → autoConnect → IndexedDB), des `persist()` et des écrivains cloud appelés comme l'app.
   SIMULÉ : Apps Script (loadProfile complet / partiel / introuvable / erreur / non-JSON / qui pend / hors ligne), le Worker
   (miroir `cloudSave`). OBSERVE : chaque `saveProfile`, `cloudSave`, `logSession` envoyé ; l'inscription ; le profil restauré
   (sexe, objectif, séances) ; `ft4_restau_attendue`, `ft4_email`, le cookie. ⛔ 0 appel réel. NE COUVRE PAS : Safari iOS,
   un vrai serveur. Banc : tools/banc_cookie_profile.js · contrôle négatif : tools/mut_cookie_profile.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CP-E (session-B). COOKIE-PROFILE-01 — rien n\'est écrit pour un compte pas encore récupéré ═══');
  const js = x => JSON.stringify(x).slice(0, 300);
  const MAIL = 'compte.existant@gmail.com';
  const COMPLET = { status: 'ok', premium: false, profile: { name: 'Revenante', bw: 62, age: 34, height: 165, gender: 'F', goal: 'perte' },
    sessions: [{ id: 1001, ts: 1001, date: '2026-09-01', volume: 500, exs: [{ name: 'Squat à la Barre', sets: [{ kg: 50, reps: 8, type: 'N', done: true }] }] }], prs: {} };
  const PARTIEL = { status: 'ok', premium: false, profile: { name: 'Partielle', bw: 60, age: 30, height: 163, gender: 'F', goal: 'perte' }, sessions: [], prs: {} };
  const ouvrir = async (o) => {
    o = o || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    if (o.cookie !== undefined) await cx.addCookies([{ name: 'ft_email', value: encodeURIComponent(o.cookie), url: 'http://localhost:' + PORT }]);
    const st = { load: 0, save: 0, miroir: 0, logs: 0, reels: 0, pourMail: 0, profils: [], mode: o.mode || 'introuvable' };
    const noter = (txt, c) => { if (String(txt || '').indexOf(MAIL) >= 0) st.pourMail++; if (c && c.action === 'saveProfile') st.profils.push({ g: c.gender, o: c.goal, n: c.name }); };
    await cx.route(/supabase\.co|anthropic\.com/, r => { st.reels++; return r.abort(); });
    await cx.route(/workers\.dev/, r => { let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
      if (c.action === 'cloudSave') { st.miroir++; noter(r.request().postData(), null); }
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); });
    await cx.route(/script\.google\.com/, async r => {
      if (/test=1/.test(r.request().url())) return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"online"}' });
      let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
      if (c.action === 'saveProfile') { st.save++; noter(r.request().postData(), c); return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); }
      if (c.action === 'logSession') { st.logs++; noter(r.request().postData(), null); return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok","count":1}' }); }
      if (c.action === 'loadProfile') { st.load++;
        if (st.mode === 'horsligne') return r.abort('internetdisconnected');
        if (st.mode === 'pend') return;
        if (st.mode === 'erreur') return r.fulfill({ status: 500, contentType: 'text/plain', body: 'Internal error' });
        if (st.mode === 'nonjson') return r.fulfill({ status: 200, contentType: 'text/html', body: '<html>oups</html>' });
        const body = st.mode === 'complet' ? COMPLET : st.mode === 'partiel' ? PARTIEL : { status: 'not_found' };
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) }); }
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    const init = o.stock || {};
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_cp'))return; sessionStorage.setItem('_cp','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(o.attente || 5000);
    // « écrit » = une écriture qui PORTE cet email (profil, miroir, séances). Un envoi anonyme d'un utilisateur sans email n'est
    // pas une écriture pour ce compte.
    return { cx, pg, st, errs, ecrit: () => st.pourMail };
  };
  const etat = pg => pg.evaluate(() => ({ flag: localStorage.getItem('ft4_restau_attendue'), email: S.email || '', lsEmail: localStorage.getItem('ft4_email'),
    ob2: localStorage.getItem('ft4_ob2'), obVisible: (() => { const o = document.getElementById('onboarding'); return !!o && getComputedStyle(o).display !== 'none' && !document.documentElement.classList.contains('ob-done'); })(),
    gender: S.gender, goal: S.goal, name: S.name || '', nbSess: (S.sessions || []).length, cookie: document.cookie,
    pre: [(document.getElementById('ob-email') || {}).value || '', (document.getElementById('ob-email-final') || {}).value || ''] }));
  // Tous les écrivains cloud, comme l'app les appelle : une pesée, une séance terminée envoyée au classeur, la file, la synchro.
  const solliciter = async pg => { await pg.evaluate(async () => {
    try { S.weightLog = (S.weightLog || []).concat([{ date: '2026-10-06', kg: 81 }]); persist(); } catch (e) {}
    try { _cloudSync(); } catch (e) {}
    try { await syncSheets({ id: 9, date: '2026-10-06', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 60, reps: 5, type: 'N', done: true }] }], volume: 300 }); } catch (e) {}
    try { await _retrySheetQueue(); } catch (e) {}
  }); await pg.waitForTimeout(4600); };   // au-delà du délai de 4 s de la synchro différée

  /* ═════════ CP-00 — L'INVARIANT, indépendant du cookie : « aucune écriture tant que restauration attendue » ═════════ */
  {
    const X = await ouvrir({ stock: { ft4_ob2: '1', ft4_email: MAIL, ft4_restau_attendue: '1', ft4_guide_shown: '1', ft4_wn_seen: '999' }, mode: 'horsligne', attente: 2500 });
    await solliciter(X.pg);
    t('CP-00 ⛔⛔ INVARIANT : tant que la restauration est attendue, AUCUNE écriture cloud pour cet email (profil, miroir, séances) — quel que soit l\'écrivain',
      X.ecrit() === 0, js(X.st));
    await X.cx.close();
  }
  /* ═════════ CP-01 — pas de cookie ═════════ */
  {
    const X = await ouvrir({});
    const e = await etat(X.pg);
    t('CP-01 pas de cookie, stockage vierge → inscription normale, rien d\'écrit', e.obVisible && !e.flag && X.ecrit() === 0, js(e));
    await X.cx.close();
  }
  /* ═════════ CP-02 / CP-07 / CP-13 — cookie + profil complet ═════════ */
  {
    const X = await ouvrir({ cookie: MAIL, mode: 'complet' });
    const e = await etat(X.pg);
    t('CP-02 / CP-07 cookie + profil complet → restauré (séances, sexe, objectif), inscription faite, attente levée, rien d\'écrit AVANT',
      !e.obVisible && e.ob2 === '1' && !e.flag && e.nbSess === 1 && e.gender === 'F' && e.goal === 'perte' && e.name === 'Revenante'
      && X.st.profils.every(p => p.g === 'F' && p.o === 'perte' && p.n === 'Revenante'), js({ e, st: X.st }));
    await solliciter(X.pg);
    t('CP-13 après une restauration réelle, la synchro normale redevient possible — et ce qui part est le profil RESTAURÉ (F, perte), jamais un défaut',
      X.st.save >= 1 && X.st.profils.every(p => p.g === 'F' && p.o === 'perte'), js(X.st));
    await X.cx.close();
  }
  /* ═════════ CP-08 — cookie + profil PARTIEL, 0 séance ═════════ */
  {
    const X = await ouvrir({ cookie: MAIL, mode: 'partiel' });
    const e = await etat(X.pg);
    t('CP-08 ⛔⛔ cookie + profil partiel (F, perte, 0 séance) → RESTAURÉ : F reste F, perte reste perte, jamais H / muscle',
      !e.obVisible && !e.flag && e.gender === 'F' && e.goal === 'perte' && e.name === 'Partielle' && X.st.profils.every(p => p.g === 'F' && p.o === 'perte'), js({ e, profils: X.st.profils }));
    await X.cx.close();
  }
  /* ═════════ CP-03 — cookie + profil introuvable ═════════ */
  {
    const X = await ouvrir({ cookie: MAIL, mode: 'introuvable' });
    const e = await etat(X.pg);
    await solliciter(X.pg);
    t('CP-03 ⛔⛔ cookie + « introuvable » → inscription normale, email pré-rempli, sexe demandé, l\'indice oublié, 0 écriture',
      e.obVisible && !e.flag && e.email === '' && e.pre.indexOf(MAIL) >= 0 && X.ecrit() === 0 && !/ft_email=compte/.test(e.cookie), js({ e, st: X.st }));
    await X.cx.close();
  }
  /* ═════════ CP-04 / CP-05 / CP-06 — hors ligne, requête qui pend, erreur serveur, réponse invalide ═════════ */
  for (const [nom, mode] of [['CP-04 hors ligne', 'horsligne'], ['CP-05 requête qui pend', 'pend'], ['CP-06 erreur serveur 500', 'erreur'], ['CP-06b réponse non-JSON', 'nonjson']]) {
    const X = await ouvrir({ cookie: MAIL, mode });
    const e = await etat(X.pg);
    await solliciter(X.pg);
    t(nom + ' ⛔ → inscription PAS faussement validée, « introuvable » PAS conclu (attente maintenue), aucun profil inventé, 0 écriture',
      e.obVisible && e.ob2 === null && e.flag === '1' && e.email === MAIL && X.ecrit() === 0, js({ e, st: X.st }));
    await X.cx.close();
  }
  /* ═════════ CP-09 — cookie malformé / vide ═════════ */
  for (const v of ['pas-un-email', '']) {
    const X = await ouvrir({ cookie: v, mode: 'complet', attente: 2500 });
    const e = await etat(X.pg);
    t('CP-09 cookie ' + (v ? 'malformé' : 'vide') + ' → ignoré : ni email, ni attente, inscription normale, aucun appel', e.obVisible && !e.flag && !e.lsEmail && X.st.load === 0, js(e));
    await X.cx.close();
  }
  /* ═════════ CP-10 — email local déjà présent + cookie différent ═════════ */
  {
    const X = await ouvrir({ cookie: 'autre.compte@gmail.com', mode: 'complet', stock: { ft4_ob2: '1', ft4_email: 'moi@gmail.com', ft4_name: 'Moi', ft4_guide_shown: '1', ft4_wn_seen: '999' } });
    const e = await etat(X.pg);
    t('CP-10 email local présent + cookie différent → le cookie est ignoré (comportement existant), pas d\'attente, l\'email local reste',
      e.email === 'moi@gmail.com' && !e.flag, js(e));
    await X.cx.close();
  }
  /* ═════════ CP-11 — données locales SANS email + cookie d'un autre compte (existant) ═════════ */
  {
    const loc = [{ id: 7, ts: 7, date: '2026-09-20', volume: 900, exs: [{ name: 'Développé Couché', sets: [{ kg: 90, reps: 5, type: 'N', done: true }] }] },
                 { id: 8, ts: 8, date: '2026-09-22', volume: 800, exs: [{ name: 'Squat à la Barre', sets: [{ kg: 80, reps: 5, type: 'N', done: true }] }] }];
    const X = await ouvrir({ cookie: MAIL, mode: 'complet', stock: { ft4_ob2: '1', ft4_name: 'Local', ft4_sessions: JSON.stringify(loc), ft4_guide_shown: '1', ft4_wn_seen: '999' } });
    const e = await etat(X.pg);
    await solliciter(X.pg);
    const e2 = await etat(X.pg);
    t('CP-11 ⛔⛔ données locales sans email + cookie d\'un autre compte → rien ne part vers cet email, les séances locales ne sont pas écrasées',
      X.ecrit() === 0 && e2.nbSess >= 2 && e.flag === '1', js({ e: { flag: e.flag, nbSess: e.nbSess }, e2: e2.nbSess, st: X.st }));
    await X.cx.close();
  }
  /* ═════════ CP-12 — échec de restauration puis vie normale ═════════ */
  {
    const X = await ouvrir({ cookie: MAIL, mode: 'horsligne' });
    await solliciter(X.pg); await solliciter(X.pg);
    t('CP-12 ⛔ échec de restauration puis pesées, séance, file, synchro → toujours 0 écriture tant que ce n\'est pas tranché', X.ecrit() === 0, js(X.st));
    const e = await etat(X.pg);
    t('CP-0x aucune erreur de page, 0 appel réel', X.errs.length === 0 && X.st.reels === 0 && e.flag === '1', X.errs.join(' | '));
    await X.cx.close();
  }
};
