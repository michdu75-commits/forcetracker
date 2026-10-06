/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🔐 AUTH-SIGNUP-STRICT-01 — inscription en lecture stricte : « confirme cet e-mail », puis le serveur tranche (session-B · 06/10/2026)
   Blocs : B-AS-E (écran conduit). CONDUIT : la vraie inscription (« COMMENCER »), la vraie fenêtre « Protéger mon compte »
   (envoi du code, saisie, activation), la reprise automatique, contre le VRAI Code.js exécuté localement en LECTURE STRICTE
   (défaut quand `LECTURE_STRICTE` manque) : `handleLoadProfilePost_`, `handleSaveProfile_`, `handleSendConfirmCode_`,
   `handleSetAccessCode_`, `handleIssueTokenByCode_` ; Gmail simulé (le code part dans un tableau) ; réseau coupé / 500 /
   JSON invalide simulés au besoin. OBSERVE : le texte montré, les appels réels à `finishOnboarding` (compteur posé sur la
   vraie fonction), chaque `saveProfile` (email, bienvenue), l'état serveur, l'inscription.
   ⛔ 0 appel réel. NE COUVRE PAS : la vraie boîte mail, Safari iOS. D1 et T-JETON (AS-07, AS-08) : banc B-AC-E rejoué.
   Banc : tools/banc_auth_signup_strict.js · contrôle négatif : tools/mut_auth_signup_strict.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const fs = require('fs'), vm = require('vm'), crypto = require('crypto'), path = require('path');
module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-AS-E (session-B). AUTH-SIGNUP-STRICT-01 — lecture stricte : preuve d\'abord, puis restauré ou compte neuf ═══');
  const js = x => JSON.stringify(x).slice(0, 420);
  const U = 'tout.nouveau@gmail.com', B = 'bob.b@gmail.com', K = 'karim.k@gmail.com';
  const seances = (n, base) => Array.from({ length: n }, (_, i) => ({ id: base + i, ts: base + i, date: '2026-09-' + String(1 + (i % 28)).padStart(2, '0'), volume: 400,
    exs: [{ name: 'Squat à la Barre', sets: [{ kg: 60, reps: 5, type: 'N', done: true }] }] }));
  const serveur = (comptes) => {
    const props = {}, db = {}, mails = [];
    const ctx = { console: { log() {}, warn() {}, error() {} }, JSON, Date, Math, Object, Array, String, Number, parseInt, isFinite, RegExp, Error,
      PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] ?? null, setProperty: (k, v) => { props[k] = String(v); }, deleteProperty: k => { delete props[k]; }, getProperties: () => ({ ...props }) }) },
      Utilities: { getUuid: () => crypto.randomUUID(), DigestAlgorithm: { SHA_256: 1 }, Charset: { UTF_8: 1 },
        computeDigest: (a, s) => [...crypto.createHash('sha256').update(String(s)).digest()].map(x => x > 127 ? x - 256 : x), formatDate: () => '20261006' },
      Session: { getScriptTimeZone: () => 'Europe/Paris' }, Logger: { log() {} },
      GmailApp: { sendEmail: (to, subj) => { const m = String(subj).match(/\d{6}/); mails.push({ to, code: m ? m[0] : '' }); } },
      ContentService: { createTextOutput: t2 => ({ t: t2, setMimeType() { return this; } }), MimeType: { JSON: 1 } } };
    vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, '..', '..', 'Code.js'), 'utf8'), ctx);
    ctx.__db = db;
    vm.runInContext('loadUserData_=function(e){return __db[e]?JSON.parse(JSON.stringify(__db[e])):null};saveUserData_=function(e,d){__db[e]=JSON.parse(JSON.stringify(d))};', ctx);
    Object.keys(comptes || {}).forEach(e => { const c = comptes[e]; db[e] = { profile: { name: c.nom, gender: 'F', goal: 'perte' }, sessions: seances(c.n, c.base), prs: {} };
      if (c.code) { const salt = '0123456789abcdef'; props['auth_' + e] = salt + '$' + ctx._sha256hex_(salt + '|' + c.code); } });
    return { ctx, db, props, mails };
  };
  const ouvrir = async (comptes) => {
    const srv = serveur(comptes);
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    const st = { envois: [], panne: '', reels: 0 };
    await cx.route(/supabase\.co|anthropic\.com/, r => { st.reels++; return r.abort(); });
    await cx.route(/workers\.dev/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok","reply":"ok"}' }));
    await cx.route(/script\.google\.com/, async r => {
      if (/test=1/.test(r.request().url())) return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"online"}' });
      let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
      if (c.action === 'loadProfile' && st.panne === 'horsligne') return r.abort('internetdisconnected');
      if (c.action === 'loadProfile' && st.panne === '500') return r.fulfill({ status: 500, contentType: 'text/plain', body: 'Internal error' });
      if (c.action === 'loadProfile' && st.panne === 'nonjson') return r.fulfill({ status: 200, contentType: 'text/html', body: '<html>oups</html>' });
      if (c.action === 'saveProfile' || c.action === 'logSession') st.envois.push({ action: c.action, email: String(c.email || '').toLowerCase(), welcome: !!c.welcome, code: !!c.authCode });
      const H = { loadProfile: 'handleLoadProfilePost_', saveProfile: 'handleSaveProfile_', sendConfirmCode: 'handleSendConfirmCode_', verifyConfirmCode: 'handleVerifyConfirmCode_',
        setAccessCode: 'handleSetAccessCode_', issueTokenByCode: 'handleIssueTokenByCode_', authStatus: 'handleAuthStatus_' }[c.action];
      let body = c.action === 'logSession' ? '{"status":"ok","count":1}' : '{"status":"ok"}';
      if (H) { try { body = srv.ctx[H](c).t; } catch (e) { body = JSON.stringify({ status: 'error', error: 'harnais:' + e.message }); } }
      return r.fulfill({ status: 200, contentType: 'application/json', body });
    });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_as'))return; sessionStorage.setItem('_as','1'); localStorage.clear(); }catch(e){}
      // Compteur posé sur la VRAIE fonction : l'app l'appelle par son nom global.
      window.addEventListener('load',()=>{ try{ const f=window.finishOnboarding; window.__fin=0; window.finishOnboarding=function(){ window.__fin++; return f.apply(this,arguments); }; }catch(e){} });})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2500);
    return { cx, pg, st, srv, errs };
  };
  const etat = pg => pg.evaluate(() => ({ ob2: localStorage.getItem('ft4_ob2'), flag: localStorage.getItem('ft4_restau_attendue'), email: S.email || '', fin: window.__fin,
    nbSess: (S.sessions || []).length, name: S.name || '', msg: ((document.getElementById('ob-email-msg') || {}).innerText || '').replace(/\s+/g, ' '),
    obVisible: !document.documentElement.classList.contains('ob-done') }));
  const commencer = async (X, m) => { await X.pg.evaluate(x => { try { obSetGender('H'); } catch (e) {} const n = document.getElementById('ob-name'); if (n) n.value = 'Nouveau';
      obGoTo(5); document.getElementById('ob-email-final').value = x; }, m);
    const h = await X.pg.$('#ob-start-btn'); await h.scrollIntoViewIfNeeded(); await h.click(); await X.pg.waitForTimeout(2000); };
  const proteger = async (X, code) => {
    await X.pg.click('#ob-email-msg button.btn-red'); await X.pg.waitForTimeout(900);
    await X.pg.click('#protect-send-btn'); await X.pg.waitForTimeout(700);
    const m = X.srv.mails[X.srv.mails.length - 1] || { code: '' };
    await X.pg.fill('#protect-emailcode', m.code); await X.pg.fill('#protect-newcode', code);
    await X.pg.click('#protect-activate-btn'); await X.pg.waitForTimeout(3500);
  };

  /* ═════════ AS-01 / AS-05 / AS-02 — email TOTALEMENT INCONNU, lecture stricte ═════════ */
  {
    const X = await ouvrir({ [B]: { nom: 'Bob', n: 8, base: 500 } });
    await commencer(X, U);
    const e = await etat(X.pg);
    t('AS-01 ⛔⛔ email inconnu + lecture stricte (vrai Code.js → needsCode) → AUCUN « compte existe déjà » : « Confirme cet e-mail pour continuer »',
      /Confirme cet e-mail/.test(e.msg) && !/existe d[ée]j[àa]/i.test(e.msg) && e.obVisible, js(e));
    t('AS-05 ⛔⛔ needsCode AVANT la vérification → 0 appel de finishOnboarding, 0 profil envoyé, inscription non faite, attente posée',
      e.fin === 0 && X.st.envois.length === 0 && e.ob2 === null && e.flag === '1' && !X.srv.db[U], js({ e, envois: X.st.envois }));
    await proteger(X, '7777');
    const e2 = await etat(X.pg);
    t('AS-02 ⛔⛔ vérification réussie (code email + code perso) → aucun profil → inscription NEUVE terminée SEULE (sans 2ᵉ appui), compte créé AVEC son code, B jamais touché',
      e2.ob2 === '1' && e2.fin === 1 && !e2.flag && e2.email === U && X.st.envois.some(v => v.email === U && v.welcome && v.code) && !!X.srv.db[U]
      && X.st.envois.every(v => v.email !== B) && X.srv.db[B].sessions.length === 8, js({ e2, envois: X.st.envois, errs: X.errs }));
    await X.cx.close();
  }
  /* ═════════ AS-03 — compte EXISTANT sans code ═════════ */
  {
    const X = await ouvrir({ [B]: { nom: 'Bob', n: 8, base: 500 } });
    await commencer(X, B);
    const e = await etat(X.pg);
    await proteger(X, '8888');
    const e2 = await etat(X.pg);
    t('AS-03 ⛔ email existant sans code → même 1ʳᵉ étape (« Confirme cet e-mail »), vérification réussie → profil TROUVÉ → restauré (Bob, 8 séances), aucun compte neuf ni profil de bienvenue',
      /Confirme cet e-mail/.test(e.msg) && e.fin === 0 && e2.ob2 === '1' && e2.nbSess === 8 && e2.name === 'Bob' && !e2.flag
      && X.st.envois.every(v => !v.welcome) && X.srv.db[B].sessions.length === 8 && X.srv.db[B].profile.name === 'Bob', js({ e, e2, envois: X.st.envois }));
    await X.cx.close();
  }
  /* ═════════ AS-04 — compte existant AVEC code ═════════ */
  {
    const X = await ouvrir({ [K]: { nom: 'Karim', n: 6, base: 700, code: '4242' } });
    await commencer(X, K);
    const e = await etat(X.pg);
    const champ = !!(await X.pg.$('#ob-code-final'));
    await X.pg.fill('#ob-code-final', '4242'); await X.pg.click('#ob-email-msg button.btn-red'); await X.pg.waitForTimeout(2500);
    const e2 = await etat(X.pg);
    t('AS-04 email existant AVEC code → le code EXISTANT est demandé (pas « confirme cet e-mail »), bon code → restauré (Karim, 6 séances), jamais compte neuf',
      champ && /protégé par un code perso/.test(e.msg) && !/Confirme cet e-mail/.test(e.msg) && e2.ob2 === '1' && e2.nbSess === 6 && e2.name === 'Karim'
      && X.st.envois.every(v => !v.welcome), js({ e, e2, envois: X.st.envois }));
    await X.cx.close();
  }
  /* ═════════ AS-06 — réseau coupé / 500 / JSON invalide → jamais de compte neuf ═════════ */
  for (const panne of ['horsligne', '500', 'nonjson']) {
    const X = await ouvrir({});
    X.st.panne = panne;
    await commencer(X, U);
    const e = await etat(X.pg);
    t('AS-06 ⛔ ' + panne + ' à la lecture → 0 finishOnboarding, 0 profil envoyé, message « réseau », inscription non faite',
      e.fin === 0 && X.st.envois.length === 0 && e.ob2 === null && /r[ée]seau/i.test(e.msg), js(e));
    await X.cx.close();
  }
};
