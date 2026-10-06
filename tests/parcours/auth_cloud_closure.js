/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🔐 AUTH-CLOUD-CLOSURE-01 — l'ancien compte ne revient pas, un jeton ne sert jamais un autre compte (session-B · 06/10/2026)
   Blocs : B-AC-E (écran conduit). CONDUIT : la vraie app (démarrage, inscription, « continuer sans email », Profil →
   Restaurer, la vraie fenêtre « Protéger mon compte », synchro, séance, Milo) contre le VRAI Code.js exécuté localement
   (vm Node : `handleLoadProfilePost_`, `handleSaveProfile_`, `handleSendConfirmCode_`, `handleSetAccessCode_`,
   `handleIssueTokenByCode_`, `_jetonIdentite_`…), stockage en mémoire, Gmail simulé (le code part dans un tableau).
   SIMULÉ : le Worker (il résout l'identité d'un jeton avec le vrai `_jetonIdentite_`), la feuille Séances (comptée).
   OBSERVE : chaque envoi (email + jeton), les comptes A et B côté serveur après coup, cookie / IndexedDB / ft4_email,
   le jeton rangé et son compte. ⛔ 0 appel réel. NE COUVRE PAS : Safari iOS, le vrai déploiement Apps Script.
   Banc : tools/banc_auth_cloud_closure.js · contrôle négatif : tools/mut_auth_cloud_closure.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const fs = require('fs'), vm = require('vm'), crypto = require('crypto'), path = require('path');
module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-AC-E (session-B). AUTH-CLOUD-CLOSURE-01 — D1 (continuer sans email) + T-JETON (jeton inter-comptes) ═══');
  const js = x => JSON.stringify(x).slice(0, 420);
  const A = 'alice.a@gmail.com', B = 'bob.b@gmail.com', C = 'inconnu.c@gmail.com';
  const seances = (n, base) => Array.from({ length: n }, (_, i) => ({ id: base + i, ts: base + i, date: '2026-09-' + String(1 + (i % 28)).padStart(2, '0'), volume: 400,
    exs: [{ name: 'Squat à la Barre', sets: [{ kg: 60, reps: 5, type: 'N', done: true }] }] }));
  // ── Le VRAI Code.js, en local ──
  const serveur = (o) => {
    const props = Object.assign({}, o.props || {}), db = {}, mails = [];
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
    Object.keys(o.comptes || {}).forEach(e => { const c = o.comptes[e]; db[e] = { profile: { name: c.nom }, sessions: seances(c.n, c.base), prs: {} };
      if (c.code) { const salt = '0123456789abcdef'; props['auth_' + e] = salt + '$' + ctx._sha256hex_(salt + '|' + c.code); } });
    return { ctx, db, props, mails, J: r => JSON.parse(r.t) };
  };
  const ouvrir = async (o) => {
    const srv = serveur(o);
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    if (o.cookie) await cx.addCookies([{ name: 'ft_email', value: encodeURIComponent(o.cookie), url: 'http://localhost:' + PORT }]);
    const st = { envois: [], worker: [], reels: 0, horsligne: !!o.horsligne };
    await cx.route(/supabase\.co|anthropic\.com/, r => { st.reels++; return r.abort(); });
    await cx.route(/workers\.dev/, r => { let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
      const id = c.token ? srv.ctx._jetonIdentite_(c.token) : { ok: false };
      st.worker.push({ action: c.action, token: c.token || '', compte: id.ok ? id.email : '' });
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok","reply":"ok"}' }); });
    await cx.route(/script\.google\.com/, async r => {
      if (/test=1/.test(r.request().url())) return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"online"}' });
      if (st.horsligne) return r.abort('internetdisconnected');
      let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
      const em = String(c.email || '').toLowerCase();
      if (c.action === 'saveProfile' || c.action === 'logSession') st.envois.push({ action: c.action, email: em, token: c.token || '' });
      const H = { loadProfile: 'handleLoadProfilePost_', saveProfile: 'handleSaveProfile_', sendConfirmCode: 'handleSendConfirmCode_', verifyConfirmCode: 'handleVerifyConfirmCode_',
        setAccessCode: 'handleSetAccessCode_', issueTokenByCode: 'handleIssueTokenByCode_', authStatus: 'handleAuthStatus_' }[c.action];
      let body = '{"status":"ok"}';
      if (H) { try { body = srv.ctx[H](c).t; } catch (e) { body = JSON.stringify({ status: 'error', error: 'harnais:' + e.message }); } }
      else if (c.action === 'logSession') body = '{"status":"ok","count":1}';
      return r.fulfill({ status: 200, contentType: 'application/json', body });
    });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    const init = o.stock ? o.stock(srv) : {};
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_ac'))return; sessionStorage.setItem('_ac','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(o.attente || 2800);
    return { cx, pg, st, srv, errs };
  };
  const solliciter = async pg => { await pg.evaluate(async () => {
    try { S.weightLog = (S.weightLog || []).concat([{ date: '2026-10-06', kg: 81 }]); persist(); } catch (e) {}
    try { _cloudSync(); } catch (e) {}
    try { await syncSheets({ id: 9, date: '2026-10-06', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 60, reps: 5, type: 'N', done: true }] }], volume: 300 }); } catch (e) {}
  }); await pg.waitForTimeout(4600); };
  const proteger = async (X, bouton, code) => {
    await X.pg.click(bouton); await X.pg.waitForTimeout(900);
    await X.pg.click('#protect-send-btn'); await X.pg.waitForTimeout(700);
    const m = X.srv.mails[X.srv.mails.length - 1] || { code: '' };
    await X.pg.fill('#protect-emailcode', m.code); await X.pg.fill('#protect-newcode', code);
    await X.pg.click('#protect-activate-btn'); await X.pg.waitForTimeout(3200);
  };
  const versFin = pg => pg.evaluate(() => { try { obSetGender('H'); } catch (e) {} const n = document.getElementById('ob-name'); if (n) n.value = 'Nouveau'; obGoTo(5); });

  /* ⚠️ IndexedDB est lu DIRECTEMENT, pas par `_getEmailFromIDB` : celle-ci lit `r.result` sur l'ÉVÉNEMENT (au lieu de
     `r.target.result`) et rend TOUJOURS null — défaut préexistant, consigné hors lot (le réparer activerait un chemin de
     restauration qui n'a jamais tourné). Le témoin doit voir ce qui est VRAIMENT rangé. */
  /* ═════════ AC-01 / AC-02 — D1 : cookie A + IndexedDB A + attente, « continuer sans email », rechargement ═════════ */
  {
    const X = await ouvrir({ cookie: A, horsligne: true, props: { LECTURE_STRICTE: 'off' }, comptes: { [A]: { nom: 'Alice', n: 5, base: 100 } } });
    await X.pg.evaluate(m => { _lastSavedEmail = ''; _saveEmailRedundant(m); }, A); await X.pg.waitForTimeout(500);   // IndexedDB = A
    const avant = await X.pg.evaluate(async () => ({ flag: localStorage.getItem('ft4_restau_attendue'), idb: await (()=>new Promise(res=>{try{const q=indexedDB.open('ft_meta',1);q.onupgradeneeded=e=>{e.target.result.createObjectStore('meta',{keyPath:'key'});};q.onsuccess=e=>{try{const g=e.target.result.transaction('meta').objectStore('meta').get('email');g.onsuccess=()=>res(g.result?g.result.value:null);g.onerror=()=>res(null);}catch(x){res(null);}};q.onerror=()=>res(null);setTimeout(()=>res(null),1500);}catch(x){res(null);}}))(), cookie: document.cookie }));
    await versFin(X.pg); await X.pg.evaluate(() => obContinuerSansEmail()); await X.pg.waitForTimeout(800);
    X.st.horsligne = false;
    await X.pg.reload(); await X.pg.waitForTimeout(3500);
    const e = await X.pg.evaluate(async () => ({ email: S.email || '', ls: localStorage.getItem('ft4_email') || '', cookie: document.cookie, idb: await (()=>new Promise(res=>{try{const q=indexedDB.open('ft_meta',1);q.onupgradeneeded=e=>{e.target.result.createObjectStore('meta',{keyPath:'key'});};q.onsuccess=e=>{try{const g=e.target.result.transaction('meta').objectStore('meta').get('email');g.onsuccess=()=>res(g.result?g.result.value:null);g.onerror=()=>res(null);}catch(x){res(null);}};q.onerror=()=>res(null);setTimeout(()=>res(null),1500);}catch(x){res(null);}}))(),
      flag: localStorage.getItem('ft4_restau_attendue'), ob2: localStorage.getItem('ft4_ob2'), nbSess: (S.sessions || []).length }));
    t('AC-01 ⛔⛔ D1 : cookie A + IndexedDB A + attente → « continuer sans email » → rechargement : cookie A absent, IndexedDB vidé, A ne revient pas (ni email, ni attente, ni séances de A)',
      avant.flag === '1' && avant.idb === A && /ft_email=alice/.test(avant.cookie)
      && !/ft_email=/.test(e.cookie) && !e.idb && !e.email && !e.ls && !e.flag && e.ob2 === '1' && e.nbSess === 0, js({ avant, e }));
    await solliciter(X.pg);
    t('AC-02 ⛔⛔ D1 écriture : profil local nouveau + pesée + séance → 0 écriture vers A, A intact côté serveur (Alice, 5 séances)',
      X.st.envois.filter(v => v.email === A).length === 0 && X.st.worker.filter(w => w.compte === A).length === 0
      && X.srv.db[A].profile.name === 'Alice' && X.srv.db[A].sessions.length === 5, js({ envois: X.st.envois, A: { n: X.srv.db[A].profile.name, s: X.srv.db[A].sessions.length } }));
    await X.cx.close();
  }
  /* ═════════ AC-03 / AC-04 / AC-06 — T-JETON : téléphone de A (jeton A), on passe à B (sans code) par Profil → Restaurer ═════════ */
  {
    let tokA = '';
    /* A SANS code perso : son jeton vient de la vérification de l'email (`verifyConfirmCode`, 2ᵉ preuve S1). C'est le cas
       DANGEREUX — avec un code, le serveur refuserait l'écriture au code (« 5555 » n'est pas celui de A) et masquerait le défaut. */
    const X = await ouvrir({ comptes: { [A]: { nom: 'Alice', n: 5, base: 100 }, [B]: { nom: 'Bob', n: 8, base: 500 } },
      stock: srv => { tokA = srv.ctx._jetonPoser_(A, 'tel'); return { ft4_ob2: '1', ft4_email: A, ft4_name: 'Alice', ft4_devtoken: tokA,
        ft4_sessions: JSON.stringify(seances(5, 100)), ft4_guide_shown: '1', ft4_wn_seen: '999' }; } });
    const t0 = X.st.envois.length, w0 = X.st.worker.length;
    await X.pg.evaluate(m => { openRestoreAccount(); document.getElementById('restore-email-inp').value = m; doRestoreAccount(); }, B); await X.pg.waitForTimeout(2000);
    await proteger(X, '#restore-status button', '5555');
    await solliciter(X.pg);
    await X.pg.evaluate(() => fetch(AI_PROXY_URL, { method: 'POST', body: JSON.stringify({ action: 'coach', message: 'test' }) }).catch(() => {})); await X.pg.waitForTimeout(700);
    const apres = X.st.envois.slice(t0), wApres = X.st.worker.slice(w0);
    const e = await X.pg.evaluate(() => ({ email: S.email, jeton: localStorage.getItem('ft4_devtoken') || '', compte: localStorage.getItem('ft4_devtoken_compte') || '', nbSess: (S.sessions || []).length }));
    t('AC-03 ⛔⛔ T-JETON : après le passage à B, AUCUNE requête (Apps Script ou Worker) ne part avec le jeton de A',
      apres.length > 0 && apres.every(v => v.token !== tokA) && wApres.every(w => w.token !== tokA), js({ apres: apres.map(v => v.email + ':' + (v.token === tokA ? 'tokA' : (v.token ? 'autre' : '-'))), w: wApres.map(w => w.action + ':' + w.compte) }));
    t('AC-04 ⛔⛔ vrai Code.js : A INCHANGÉ (Alice, 5 séances) ; B reçoit SES données (Bob, ses 8 séances au moins)',
      X.srv.db[A].profile.name === 'Alice' && X.srv.db[A].sessions.length === 5 && X.srv.db[B].profile.name === 'Bob' && X.srv.db[B].sessions.length >= 8
      && X.srv.db[B].sessions.some(s => s.id === 500), js({ A: { n: X.srv.db[A].profile.name, s: X.srv.db[A].sessions.map(s => s.id) }, B: { n: X.srv.db[B].profile.name, s: X.srv.db[B].sessions.length } }));
    const idB = e.jeton ? X.srv.ctx._jetonIdentite_(e.jeton) : { ok: false };
    const coach = wApres.filter(w => w.action === 'coach').pop() || {};
    t('AC-06 protection de B sans redémarrage → jeton de B rangé avec B, synchro et Milo immédiatement sous l\'identité B',
      idB.ok && idB.email === B && e.compte === B && coach.compte === B && apres.filter(v => v.action === 'saveProfile').every(v => v.email === B) , js({ e: { email: e.email, compte: e.compte, idB }, coach, errs: X.errs }));
    await X.cx.close();
  }
  /* ═════════ AC-05 — même compte : A → A, le jeton valide n'est pas jeté ═════════ */
  {
    let tokA = '';
    const X = await ouvrir({ comptes: { [A]: { nom: 'Alice', n: 5, base: 100, code: 'aaaa' } },
      stock: srv => { tokA = srv.ctx._jetonPoser_(A, 'tel'); return { ft4_ob2: '1', ft4_email: A, ft4_name: 'Alice', ft4_authcode: 'aaaa', ft4_devtoken: tokA, ft4_devtoken_compte: A,
        ft4_sessions: JSON.stringify(seances(5, 100)), ft4_guide_shown: '1', ft4_wn_seen: '999' }; } });
    await X.pg.evaluate(m => { openRestoreAccount(); document.getElementById('restore-email-inp').value = m; doRestoreAccount(); }, A); await X.pg.waitForTimeout(2000);
    await solliciter(X.pg);
    const e = await X.pg.evaluate(() => ({ jeton: localStorage.getItem('ft4_devtoken') || '', compte: localStorage.getItem('ft4_devtoken_compte') || '' }));
    t('AC-05 même compte (A → A) : le jeton de A est gardé tel quel, les envois portent A + jeton A, A garde ses 5 séances',
      e.jeton === tokA && e.compte === A && X.st.envois.filter(v => v.action === 'saveProfile').length >= 1 && X.st.envois.every(v => v.email === A && (v.action !== 'saveProfile' || v.token === tokA))
      && X.srv.db[A].sessions.length === 5, js({ e: { same: e.jeton === tokA, compte: e.compte }, envois: X.st.envois.map(v => v.action + ':' + v.email + ':' + (v.token === tokA ? 'tokA' : v.token ? '?' : '-')) }));
    await X.cx.close();
  }
  /* ═════════ AC-07 / AC-08 — needsCode reste non destructif ; not_found reste le seul chemin « compte neuf » ═════════ */
  const commencerSur = async (X, m) => { await versFin(X.pg); await X.pg.evaluate(x => { document.getElementById('ob-email-final').value = x; }, m);
    const h = await X.pg.$('#ob-start-btn'); await h.scrollIntoViewIfNeeded(); await h.click(); await X.pg.waitForTimeout(2000); };
  {
    const X = await ouvrir({ comptes: { [B]: { nom: 'Bob', n: 8, base: 500 } } });   // lecture stricte : défaut de Code.js
    await commencerSur(X, B);
    const e = await X.pg.evaluate(() => ({ ob2: localStorage.getItem('ft4_ob2'), flag: localStorage.getItem('ft4_restau_attendue') }));
    await solliciter(X.pg);
    t('AC-07 needsCode (B existe, sans code, vrai Code.js en lecture stricte) → pas de compte neuf, 0 écriture vers B, B intact (8 séances)',
      e.ob2 === null && e.flag === '1' && X.st.envois.filter(v => v.email === B).length === 0 && X.srv.db[B].sessions.length === 8, js({ e, envois: X.st.envois }));
    await X.cx.close();
  }
  {
    /* ⚠️ LECTURE_STRICTE='off' ICI, et c'est mesuré : lecture stricte active (défaut de Code.js quand la propriété manque), un
       email INCONNU et sans code reçoit lui aussi `needsCode` — jamais `not_found`. On éprouve donc l'invariant CLIENT
       (« seul not_found crée un compte ») là où le serveur sait encore dire « introuvable ». Conséquence produit consignée. */
    const X = await ouvrir({ props: { LECTURE_STRICTE: 'off' }, comptes: { [B]: { nom: 'Bob', n: 8, base: 500 } } });
    await commencerSur(X, C);
    const e2 = await X.pg.evaluate(() => ({ ob2: localStorage.getItem('ft4_ob2'), email: S.email }));
    t('AC-08 not_found (C inconnu, vrai Code.js) → seul chemin « compte neuf » : inscription faite, profil de bienvenue pour C, rien vers B',
      e2.ob2 === '1' && e2.email === C && X.st.envois.some(v => v.email === C && v.action === 'saveProfile') && X.st.envois.filter(v => v.email === B).length === 0 && !!X.srv.db[C],
      js({ e2, envois: X.st.envois }));
    await X.cx.close();
  }
};
