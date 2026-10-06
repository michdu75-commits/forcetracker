/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🔐 AUTH-NEW-DEVICE-01 — un refus d'authentification n'est JAMAIS « compte introuvable » (session-B · 06/10/2026)
   Blocs : B-AN-E (écran conduit). CONDUIT : un navigateur au stockage vide (nouveau téléphone), le vrai démarrage, la vraie
   inscription (« Restaurer mes données », « COMMENCER »), la vraie fenêtre « Protéger mon compte » (envoi du code email,
   saisie, activation), l'écran Profil → Restaurer, un rechargement, une coupure réseau, l'abandon.
   SIMULÉ : Apps Script AVEC ÉTAT — un compte sans code (20 séances), un compte avec code (10 séances), un email inconnu ;
   loadProfile renvoie `needsCode` comme `_lectureAutorisee_`, saveProfile ACCEPTE l'email seul (transition S1, `_MIG_FERME_`
   = false) et REMPLACE les séances comme `handleSaveProfile_` (garde-fou « vide » seulement sous 30) ; setAccessCode /
   sendConfirmCode / verifyConfirmCode / issueTokenByCode ; le Worker (`cloudSave`, `coach`).
   OBSERVE : chaque écriture qui porte l'email, le nombre de séances EN LIGNE après coup, l'inscription, `ft4_restau_attendue`,
   le jeton d'appareil, le texte montré. ⛔ 0 appel réel. NE COUVRE PAS : Safari iOS, le vrai serveur, la vraie boîte mail.
   Banc : tools/banc_auth_new_device.js · contrôle négatif : tools/mut_auth_new_device.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-AN-E (session-B). AUTH-NEW-DEVICE-01 — needsCode ≠ introuvable, jamais de compte neuf par-dessus ═══');
  const js = x => JSON.stringify(x).slice(0, 360);
  const SANS = 'sans.code@gmail.com', AVEC = 'avec.code@gmail.com', NEUF = 'tout.neuf@gmail.com';
  const CODE_MAIL = '123456', JETON_CODE = 'c'.repeat(64), JETON_MAIL = 'e'.repeat(64);
  const seances = (n, base) => Array.from({ length: n }, (_, i) => ({ id: base + i, ts: base + i, date: '2026-09-' + String(1 + (i % 28)).padStart(2, '0'), volume: 400,
    exs: [{ name: 'Squat à la Barre', sets: [{ kg: 60, reps: 5, type: 'N', done: true }] }] }));
  const ouvrir = async (o) => {
    o = o || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    const st = { comptes: { [SANS]: { code: null, nom: 'Sans', sessions: seances(20, 100) }, [AVEC]: { code: '4321', nom: 'Avec', sessions: seances(10, 500) } },
      ecrits: {}, profils: [], horsligne: false, appels: [], coachJeton: null, reels: 0 };
    const ecrit = (txt, mail) => { if (String(txt || '').indexOf(mail) >= 0) st.ecrits[mail] = (st.ecrits[mail] || 0) + 1; };
    const json = (r, o2) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o2) });
    await cx.route(/supabase\.co|anthropic\.com/, r => { st.reels++; return r.abort(); });
    await cx.route(/workers\.dev/, r => { let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
      if (c.action === 'cloudSave') [SANS, AVEC].forEach(m => ecrit(r.request().postData(), m));
      if (c.action === 'coach') st.coachJeton = c.token || '';
      return json(r, { status: 'ok', reply: 'ok' }); });
    await cx.route(/script\.google\.com/, async r => {
      if (/test=1/.test(r.request().url())) return json(r, { status: 'online' });
      let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
      st.appels.push(c.action);
      if (st.horsligne) return r.abort('internetdisconnected');
      const em = String(c.email || '').toLowerCase(), a = st.comptes[em];
      if (c.action === 'saveProfile') {
        [SANS, AVEC].forEach(m => ecrit(r.request().postData(), m));
        st.profils.push({ email: em, n: (c.sessions || []).length, welcome: !!c.welcome });
        if (a && a.code && c.authCode !== a.code) return json(r, { status: 'error', error: 'auth' });   // compte protégé : refusé
        if (a && c.sessions !== undefined && !(c.sessions.length === 0 && a.sessions.length)) a.sessions = c.sessions;   // REMPLACE (< 30)
        return json(r, { status: 'ok' });
      }
      if (c.action === 'logSession') { [SANS, AVEC].forEach(m => ecrit(r.request().postData(), m)); return json(r, { status: 'ok', count: 1 }); }
      if (c.action === 'loadProfile') {
        if (!a) return json(r, { status: 'not_found' });
        if (!a.code) return json(r, { status: 'error', error: 'auth', blocked: false, needsCode: true });
        if (c.authCode !== a.code) return json(r, { status: 'error', error: 'auth', blocked: false, needsCode: false });
        return json(r, { status: 'ok', premium: false, profile: { name: a.nom, gender: 'F', goal: 'perte', bw: 60, age: 30, height: 165 }, sessions: a.sessions, prs: {} });
      }
      if (c.action === 'authStatus') return json(r, { status: 'ok', hasCode: !!(a && a.code), emailVerified: false });
      if (c.action === 'sendConfirmCode') return json(r, { status: 'ok' });
      if (c.action === 'verifyConfirmCode') return json(r, c.code === CODE_MAIL ? { status: 'ok', token: JETON_MAIL } : { status: 'invalid' });
      if (c.action === 'setAccessCode') { if (c.code !== CODE_MAIL) return json(r, { status: 'invalid' }); if (a) a.code = c.newCode; return json(r, { status: 'ok' }); }
      if (c.action === 'issueTokenByCode') return json(r, a && a.code && c.authCode === a.code ? { status: 'ok', token: JETON_CODE } : { status: 'error', error: 'no_code' });
      return json(r, { status: 'ok' });
    });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    const init = o.stock || {};
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_an'))return; sessionStorage.setItem('_an','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(o.attente || 2500);
    return { cx, pg, st, errs, ecrits: m => st.ecrits[m] || 0, enLigne: m => st.comptes[m].sessions.length };
  };
  const etat = pg => pg.evaluate(() => ({ flag: localStorage.getItem('ft4_restau_attendue'), email: S.email || '', ob2: localStorage.getItem('ft4_ob2'),
    obVisible: (() => { const o = document.getElementById('onboarding'); return !!o && getComputedStyle(o).display !== 'none' && !document.documentElement.classList.contains('ob-done'); })(),
    nbSess: (S.sessions || []).length, code: localStorage.getItem('ft4_authcode') || '', jeton: localStorage.getItem('ft4_devtoken') || '',
    msg: ((document.getElementById('ob-email-msg') || {}).innerText || '').replace(/\s+/g, ' '),
    wrap: ((document.getElementById('ob-code-wrap') || {}).innerText || '').replace(/\s+/g, ' '),
    rest: ((document.getElementById('restore-status') || {}).innerText || '').replace(/\s+/g, ' '),
    champCode: !!document.getElementById('ob-code-inp') || !!document.getElementById('restore-code-inp'),
    protOuvert: !!(document.getElementById('ov-protect') || { classList: { contains: () => false } }).classList.contains('open') }));
  const versFin = pg => pg.evaluate(() => { try { obSetGender('H'); } catch (e) {} const n = document.getElementById('ob-name'); if (n) n.value = 'Nouveau'; obGoTo(5); });
  const commencer = async (pg, mail) => { await versFin(pg); await pg.evaluate(x => { document.getElementById('ob-email-final').value = x; }, mail);
    const h = await pg.$('#ob-start-btn'); await h.scrollIntoViewIfNeeded(); await h.click(); await pg.waitForTimeout(1800); };
  const restaurerOb = async (pg, mail) => { await pg.evaluate(x => { obShowRestore(); document.getElementById('ob-email').value = x; obDoRestore(); }, mail); await pg.waitForTimeout(1800); };
  // Tous les écrivains cloud, comme l'app les appelle (même sollicitation que COOKIE-PROFILE-01).
  const solliciter = async pg => { await pg.evaluate(async () => {
    try { S.weightLog = (S.weightLog || []).concat([{ date: '2026-10-06', kg: 81 }]); persist(); } catch (e) {}
    try { _cloudSync(); } catch (e) {}
    try { await syncSheets({ id: 9, date: '2026-10-06', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 60, reps: 5, type: 'N', done: true }] }], volume: 300 }); } catch (e) {}
    try { await _retrySheetQueue(); } catch (e) {}
  }); await pg.waitForTimeout(4600); };
  // Le vrai geste « Protéger mon compte » : bouton, envoi du code email, saisie, activation.
  const proteger = async (pg, cliquer) => {
    await pg.click(cliquer); await pg.waitForTimeout(900);
    await pg.click('#protect-send-btn'); await pg.waitForTimeout(500);
    await pg.fill('#protect-emailcode', CODE_MAIL); await pg.fill('#protect-newcode', '9876');
    await pg.click('#protect-activate-btn'); await pg.waitForTimeout(2600);
  };

  /* ═════════ AN-01 / AN-09 — nouveau téléphone, compte SANS code, « COMMENCER » ═════════ */
  {
    const X = await ouvrir({});
    await commencer(X.pg, SANS);
    const e = await etat(X.pg);
    await solliciter(X.pg);
    t('AN-01 ⛔⛔ nouveau téléphone + compte existant SANS code (needsCode) → PAS un compte neuf : inscription non terminée, attente posée, sécurisation proposée, aucune demande de code inexistant',
      e.obVisible && e.ob2 === null && e.flag === '1' && e.email === SANS && /pas encore de code perso/.test(e.msg) && !/Entre ton code/.test(e.msg), js(e));
    t('AN-09 ⛔⛔ aucune séquence (inscription, persist, synchro, séance, file) n\'envoie d\'instantané « nouveau compte » : 0 écriture, 20 séances en ligne intactes',
      X.ecrits(SANS) === 0 && X.enLigne(SANS) === 20 && X.st.profils.length === 0, js({ ecrits: X.st.ecrits, profils: X.st.profils, enLigne: X.enLigne(SANS) }));

    /* ═════════ AN-02 / AN-10 — même téléphone : la personne SÉCURISE le compte, puis tout revient ═════════ */
    await proteger(X.pg, '#ob-email-msg button.btn-red');
    const e2 = await etat(X.pg);
    t('AN-02 ⛔ sécurisation (code email + code perso, la fenêtre existante) → jeton conservé, compte RESTAURÉ (20 séances), attente levée, 20 en ligne',
      e2.code === '9876' && e2.jeton === JETON_CODE && e2.nbSess === 20 && !e2.flag && X.enLigne(SANS) === 20 && X.st.appels.indexOf('setAccessCode') >= 0, js({ e2, appels: X.st.appels }));
    await X.pg.evaluate(() => { const f = document.getElementById('ob-email-final'); if (f) f.value = ''; });
    const h = await X.pg.$('#ob-start-btn'); if (h) { await h.scrollIntoViewIfNeeded(); await h.click(); } await X.pg.waitForTimeout(800);
    await solliciter(X.pg);
    await X.pg.evaluate(() => fetch(AI_PROXY_URL, { method: 'POST', body: JSON.stringify({ action: 'coach', message: 'test' }) }).catch(() => {}));
    await X.pg.waitForTimeout(600);
    const e3 = await etat(X.pg);
    t('AN-10 SANS REDÉMARRAGE : inscription faite, le cloud reprend (instantané = 20 séances, jamais 1), Milo reçoit le jeton',
      e3.ob2 === '1' && X.st.profils.length >= 1 && X.st.profils.every(p => p.n === 20 && !p.welcome) && X.enLigne(SANS) === 20 && X.st.coachJeton === JETON_CODE,
      js({ ob2: e3.ob2, profils: X.st.profils, coach: X.st.coachJeton, errs: X.errs }));
    await X.cx.close();
  }
  /* ═════════ AN-01b — « Restaurer mes données » dans l'inscription, compte sans code ═════════ */
  {
    const X = await ouvrir({});
    await restaurerOb(X.pg, SANS);
    const e = await etat(X.pg);
    await solliciter(X.pg);
    t('AN-01b ⛔ « Restaurer mes données » + compte sans code → « pas encore de code perso », sécurisation proposée, AUCUN champ « ton code », 0 écriture',
      /pas encore de code perso/.test(e.wrap) && !e.champCode && e.flag === '1' && X.ecrits(SANS) === 0 && X.enLigne(SANS) === 20, js(e));
    await X.cx.close();
  }
  /* ═════════ AN-03 / AN-04 — compte AVEC code ═════════ */
  {
    const X = await ouvrir({});
    await commencer(X.pg, AVEC);
    const e = await etat(X.pg);
    t('AN-03a compte AVEC code + « COMMENCER » → on demande le code existant (pas de compte neuf, attente posée)',
      e.obVisible && e.ob2 === null && e.flag === '1' && /protégé par un code perso/.test(e.msg) && !!(await X.pg.$('#ob-code-final')), js(e));
    await X.pg.fill('#ob-code-final', '0000'); await X.pg.click('#ob-email-msg button.btn-red'); await X.pg.waitForTimeout(1800);
    const e4 = await etat(X.pg);
    await solliciter(X.pg);
    t('AN-04 ⛔ mauvais code → refusé (« Code incorrect »), code effacé, inscription non terminée, 0 écriture, 10 séances en ligne',
      /Code incorrect/.test(e4.msg) && !e4.code && e4.ob2 === null && X.ecrits(AVEC) === 0 && X.enLigne(AVEC) === 10, js({ e4, ecrits: X.st.ecrits }));
    await X.pg.fill('#ob-code-final', '4321'); await X.pg.click('#ob-email-msg button.btn-red'); await X.pg.waitForTimeout(2200);
    const e3 = await etat(X.pg);
    t('AN-03 bon code → restauration normale (10 séances), inscription faite, aucun profil de bienvenue, attente levée',
      e3.ob2 === '1' && e3.nbSess === 10 && !e3.flag && X.st.profils.every(p => !p.welcome) && X.enLigne(AVEC) === 10, js({ e3, profils: X.st.profils }));
    await X.cx.close();
  }
  {
    const X = await ouvrir({});
    await restaurerOb(X.pg, AVEC);
    const e = await etat(X.pg);
    t('AN-03b « Restaurer mes données » + compte AVEC code → le champ « ton code perso » (comportement existant conservé)',
      /Ce compte est protégé/.test(e.wrap) && e.champCode && !/pas encore de code/.test(e.wrap), js(e));
    await X.cx.close();
  }
  /* ═════════ AN-05 — compte réellement inexistant ═════════ */
  {
    const X = await ouvrir({});
    await commencer(X.pg, NEUF);
    const e = await etat(X.pg);
    t('AN-05 email réellement inconnu (not_found) → inscription normale d\'un compte neuf (profil de bienvenue envoyé), sans attente',
      e.ob2 === '1' && !e.flag && e.email === NEUF && X.st.profils.some(p => p.email === NEUF && p.welcome), js({ e, profils: X.st.profils }));
    await X.cx.close();
  }
  /* ═════════ AN-06 / AN-07 / AN-08 — needsCode puis rechargement, coupure, abandon ═════════ */
  {
    const X = await ouvrir({});
    await commencer(X.pg, SANS);
    await X.pg.reload(); await X.pg.waitForTimeout(3000);
    const e = await etat(X.pg);
    await solliciter(X.pg);
    t('AN-06 ⛔ needsCode puis RECHARGEMENT → jamais un compte neuf : inscription toujours à faire, attente maintenue, 0 écriture, 20 en ligne',
      e.obVisible && e.ob2 === null && e.flag === '1' && X.ecrits(SANS) === 0 && X.enLigne(SANS) === 20, js({ e, ecrits: X.st.ecrits }));
    X.st.horsligne = true;
    await commencer(X.pg, SANS);
    const e2 = await etat(X.pg);
    await solliciter(X.pg);
    t('AN-07 ⛔ needsCode puis RÉSEAU COUPÉ → message réseau, inscription non terminée, 0 écriture',
      e2.ob2 === null && /réseau/i.test(e2.msg) && e2.flag === '1' && X.ecrits(SANS) === 0, js(e2));
    X.st.horsligne = false;
    await X.pg.evaluate(() => obContinuerSansEmail()); await X.pg.waitForTimeout(800);
    const e3 = await etat(X.pg);
    await solliciter(X.pg);
    t('AN-08 ⛔ needsCode puis ABANDON (« continue sans email ») → app locale utilisable, aucun email gardé en douce, compte distant intact (20, 0 écriture)',
      e3.ob2 === '1' && e3.email === '' && !e3.flag && X.ecrits(SANS) === 0 && X.enLigne(SANS) === 20, js({ e3, ecrits: X.st.ecrits }));
    await X.cx.close();
  }
  /* ═════════ AN-09b — Profil → Restaurer, appareil sans email avec ses séances, compte sans code ═════════ */
  {
    const X = await ouvrir({ stock: { ft4_ob2: '1', ft4_name: 'Local', ft4_sessions: JSON.stringify(seances(1, 900)), ft4_guide_shown: '1', ft4_wn_seen: '999' } });
    await X.pg.evaluate(x => { openRestoreAccount(); document.getElementById('restore-email-inp').value = x; doRestoreAccount(); }, SANS); await X.pg.waitForTimeout(1800);
    const e = await etat(X.pg);
    await solliciter(X.pg);
    t('AN-09b ⛔⛔ Profil → Restaurer (compte sans code, téléphone avec 1 séance locale) → « pas encore de code perso », aucun champ code, 0 écriture : les 20 séances en ligne ne deviennent PAS 1',
      /pas encore de code perso/.test(e.rest) && !e.champCode && e.flag === '1' && X.ecrits(SANS) === 0 && X.enLigne(SANS) === 20, js({ e, ecrits: X.st.ecrits }));
    await proteger(X.pg, '#restore-status button');
    const e2 = await etat(X.pg);
    t('AN-02b sécurisation depuis Profil → restauration automatique (les 20 du cloud + la séance locale, fusion existante), attente levée, jeton conservé, rien perdu en ligne',
      e2.nbSess >= 20 && !e2.flag && e2.jeton === JETON_CODE && X.enLigne(SANS) >= 20, js({ e2, appels: X.st.appels }));
    await X.cx.close();
  }
  /* ═════════ AN-10b — le jeton rendu par verifyConfirmCode est conservé ═════════ */
  {
    const X = await ouvrir({ stock: { ft4_ob2: '1', ft4_email: NEUF, ft4_name: 'Neuf', ft4_guide_shown: '1', ft4_wn_seen: '999' } });
    await X.pg.evaluate(c => { S.emailVerified = false; openEmailConfirm(); document.getElementById('ec-code').value = c; verifyEmailCode(); }, CODE_MAIL);
    await X.pg.waitForTimeout(1200);
    const e = await etat(X.pg);
    t('AN-10b ⛔ « Confirme ton email » → le jeton d\'appareil rendu par le serveur est CONSERVÉ (avant : jeté)', e.jeton === JETON_MAIL, js(e));
    await X.cx.close();
  }
};
