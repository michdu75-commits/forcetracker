/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🚪 ONBOARDING-QUICK-01 — l'inscription / première ouverture nettoyée (session-B · 06/10/2026)
   Blocs : B-OBQ-E (écran conduit, Worker et Apps Script simulés, requêtes comptées).
   CONDUIT : un vrai navigateur vierge, l'inscription jusqu'à « COMMENCER » (clic réel), la touche Entrée,
   un rechargement, deux tailles de petit iPhone, le Menu → Guide. SIMULÉ : Apps Script (loadProfile ok / introuvable /
   qui pend), Supabase coupé. ⛔ 0 appel réel. OBSERVE : la modale « Quoi de neuf », le Guide, la pop-up testeurs,
   `ft4_wn_seen`, `ft4_seen_ft`, chaque requête loadProfile / saveProfile, le message sous l'email, l'invitation
   d'installation. NE COUVRE PAS : Safari iOS réel, le cookie `ft_email` + profil introuvable (dette consignée).
   Banc : tools/banc_onboarding_quick.js · contrôle négatif : tools/mut_onboarding_quick.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-OBQ-E (session-B). ONBOARDING-QUICK-01 — première arrivée, email, réseau, petit écran ═══');
  const js = x => JSON.stringify(x).slice(0, 300);
  const RESTAURE = { status: 'ok', premium: false, profile: { name: 'Revenant', bw: 80, age: 40, height: 178, gender: 'H', goal: 'force' },
    sessions: [{ id: 1001, ts: 1001, date: '2026-09-01', volume: 500, exs: [{ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, type: 'N', done: true }] }] }], prs: {} };
  const ouvrir = async (o) => {
    o = o || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: o.vp || { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    const st = { load: 0, save: 0, autres: 0, reels: 0, mode: o.mode || 'introuvable' };
    await cx.route(/supabase\.co/, r => r.abort());
    await cx.route(/anthropic\.com|workers\.dev/, r => { st.reels++; return r.abort(); });
    await cx.route(/script\.google\.com/, async r => {
      if (/test=1/.test(r.request().url())) return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"online","version":"3.5"}' });
      let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
      const a = c.action || (r.request().url().match(/action=([a-zA-Z]+)/) || [])[1] || '';
      if (a === 'loadProfile') { st.load++;
        if (st.mode === 'pend') return;                                   // ne répond JAMAIS
        if (st.mode === 'lent') await new Promise(z => setTimeout(z, 1500));
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(st.mode === 'ok' ? RESTAURE : { status: 'not_found' }) }); }
      if (a === 'saveProfile') st.save++; else st.autres++;
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    if (o.stock) await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_obq'))return; sessionStorage.setItem('_obq','1'); localStorage.clear();
      const D=${JSON.stringify(o.stock)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(o.attente || 1500);
    return { cx, pg, st, errs };
  };
  const ouvert = (pg, id) => pg.evaluate(i => { const e = document.getElementById(i); return !!(e && e.classList.contains('open')); }, id);
  const obVisible = pg => pg.evaluate(() => { const o = document.getElementById('onboarding'); return !!o && getComputedStyle(o).display !== 'none' && !document.documentElement.classList.contains('ob-done'); });
  // Jusqu'à l'étape « C'est parti ! » sans tricher sur ce qu'on mesure : prénom et sexe posés, puis l'étape 5.
  const versFin = async (pg) => pg.evaluate(() => { try { obSetGender('H'); } catch (e) {} const n = document.getElementById('ob-name'); if (n) n.value = 'Nouveau'; obGoTo(5); });
  const taper = (pg, v) => pg.evaluate(x => { const f = document.getElementById('ob-email-final'); f.value = x; }, v);
  const commencer = async (pg) => { const h = await pg.$('#ob-start-btn'); await h.scrollIntoViewIfNeeded(); await h.click(); };
  const etat = pg => pg.evaluate(() => ({ wnSeen: localStorage.getItem('ft4_wn_seen'), max: WHATS_NEW_MAX, seenFt: localStorage.getItem('ft4_seen_ft'),
    nbFeat: (typeof NEW_FEATURES !== 'undefined' ? NEW_FEATURES.length : -1), btn: (document.getElementById('ob-start-btn') || {}).textContent || '',
    msg: (document.getElementById('ob-email-msg') || {}).textContent || '', email: S.email || '', nbSess: (S.sessions || []).length }));

  /* ═════════ OBQ-01 / 02 / 03 / 06 / 08 / 09 / 10 / 13 — l'inscription neuve, email vide ═════════ */
  {
    const X = await ouvrir({});
    await X.pg.waitForTimeout(2500);
    const wn0 = await ouvert(X.pg, 'ov-whatsnew'), ob0 = await obVisible(X.pg);
    t('OBQ-01 ⛔⛔ stockage vierge → l\'inscription s\'affiche, AUCUNE ancienne nouveauté par-dessus', ob0 && !wn0, js({ ob0, wn0 }));
    const label = await X.pg.evaluate(() => (document.querySelector('label[for="ob-email-final"]') || document.getElementById('ob-email-facultatif') || {}).textContent || '');
    t('OBQ-13 le champ email le DIT : facultatif, mais sans email pas de sauvegarde', /facultatif/i.test(label) && /sans email, pas de sauvegarde/i.test(label), label);
    await versFin(X.pg); await X.pg.waitForTimeout(300);
    let inst = 0; await X.pg.evaluate(() => { window.__inst = 0; const v = window.showInstallPrompt; window.showInstallPrompt = function () { window.__inst++; return v.apply(this, arguments); }; });
    await commencer(X.pg); await X.pg.waitForTimeout(3200);
    const e = await etat(X.pg);
    const wn = await ouvert(X.pg, 'ov-whatsnew'), guide = await ouvert(X.pg, 'ov-appguide'), eq = await ouvert(X.pg, 'ov-tester-eq'), ob = await obVisible(X.pg);
    inst = await X.pg.evaluate(() => window.__inst);
    t('OBQ-10 email vide → accepté (facultatif) : l\'inscription se termine, aucune vérification envoyée', !ob && X.st.load === 0, js({ ob, load: X.st.load }));
    t('OBQ-02 ⛔⛔ après COMMENCER : 0 ancienne nouveauté', !wn, String(wn));
    t('OBQ-03 le repère des nouveautés est posé au maximum ACTUEL (ft4_wn_seen = WHATS_NEW_MAX)', e.wnSeen === String(e.max) && e.max > 0, js(e));
    t('OBQ-06 ⛔ le Guide (≈ 50 diapos) ne s\'ouvre PAS tout seul', !guide, String(guide));
    t('OBQ-08 ⛔ la pop-up « 🧪 Test testeurs — Types de matériel » n\'apparaît pas', !eq, String(eq));
    const seen = JSON.parse(e.seenFt || '[]');
    t('OBQ-21 les points rouges des nouveautés DÉJÀ publiées sont considérés vus à la première arrivée', seen.length === e.nbFeat && e.nbFeat > 0, seen.length + '/' + e.nbFeat);
    t('OBQ-22 l\'invitation d\'installation n\'est pas montrée DEUX fois (l\'écran d\'accueil de l\'inscription l\'a déjà faite)', inst === 0, 'showInstallPrompt appelée ' + inst + ' fois');
    // OBQ-04 : une nouveauté publiée APRÈS l'arrivée s'affiche normalement (on ne coupe pas WHATS_NEW).
    await X.pg.evaluate(() => { WHATS_NEW.push({ v: WHATS_NEW_MAX + 1, icon: '🆕', t: 'NOUVEAUTÉ-APRÈS', d: 'publiée après la première arrivée' }); checkAnnouncements(); });
    await X.pg.waitForTimeout(1500);
    const apres = await X.pg.evaluate(() => ({ open: document.getElementById('ov-whatsnew').classList.contains('open'), txt: document.getElementById('ov-whatsnew').textContent.slice(0, 400) }));
    t('OBQ-04 ⭐ une nouveauté publiée APRÈS la première arrivée s\'affiche normalement (WHATS_NEW n\'est pas désactivé)', apres.open && /NOUVEAUTÉ-APRÈS/.test(apres.txt), js(apres));
    await X.pg.evaluate(() => closeWhatsNew());
    await X.pg.reload(); await X.pg.waitForTimeout(3500);
    t('OBQ-09 ⛔ rechargement : toujours ni pop-up testeurs, ni ancienne nouveauté', !(await ouvert(X.pg, 'ov-tester-eq')) && !(await ouvert(X.pg, 'ov-whatsnew')), '');
    // OBQ-07 : le Guide reste là, dans le Menu.
    const g = await X.pg.evaluate(() => { const r = document.getElementById('menu-row-appguide'); if (!r) return { r: false }; r.click(); return { r: true, open: document.getElementById('ov-appguide').classList.contains('open') }; });
    t('OBQ-07 le Guide reste accessible depuis le Menu (et s\'ouvre)', g.r && g.open, js(g));
    t('OBQ-0x aucune erreur de page, 0 appel réel', X.errs.length === 0 && X.st.reels === 0, X.errs.join(' | '));
    await X.cx.close();
  }
  /* ═════════ OBQ-11 / 14 / 17 — email valide, réseau normal, double tap + Entrée ═════════ */
  {
    const X = await ouvrir({ mode: 'lent' });
    await versFin(X.pg); await taper(X.pg, 'nouveau.sportif@gmail.com');
    await commencer(X.pg);
    await X.pg.evaluate(() => { obCheckEmailAndFinish(); document.getElementById('ob-email-final').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
    await X.pg.click('#ob-start-btn', { force: true, timeout: 1000 }).catch(() => {});
    await X.pg.waitForTimeout(3500);
    const e = await etat(X.pg), ob = await obVisible(X.pg);
    t('OBQ-17 ⛔⛔ double tap + Entrée + appel direct pendant la vérification → UNE seule vérification, UN seul enregistrement',
      X.st.load === 1 && X.st.save === 1, js({ load: X.st.load, save: X.st.save }));
    t('OBQ-11 / OBQ-14 email valide, réseau qui répond → l\'inscription se termine normalement (comportement conservé)', !ob && e.email === 'nouveau.sportif@gmail.com', js(e));
    await X.cx.close();
  }
  /* ═════════ OBQ-12 — email manifestement invalide : refusé AVANT tout appel ═════════ */
  {
    const X = await ouvrir({});
    await versFin(X.pg);
    const res = [];
    for (const v of ['pas un email', 'michel@gmail', 'michel.gmail.com', '@gmail.com', 'michel @gmail.com']) {
      if (!(await obVisible(X.pg))) { res.push({ v, ob: false, msg: 'inscription déjà terminée par l\'email précédent' }); break; }
      await taper(X.pg, v); await commencer(X.pg); await X.pg.waitForTimeout(300);
      res.push({ v, ob: await obVisible(X.pg), msg: (await etat(X.pg)).msg });
    }
    t('OBQ-12 ⛔⛔ email manifestement invalide → refusé AVANT tout appel serveur, avec une explication, l\'inscription reste ouverte',
      res.every(r => r.ob && /ne semble pas valide/.test(r.msg)) && X.st.load === 0 && X.st.save === 0, js({ res, load: X.st.load }));
    await X.cx.close();
  }
  /* ═════════ OBQ-15 / 16 — réseau qui pend ═════════ */
  {
    const X = await ouvrir({ mode: 'pend' });
    await versFin(X.pg); await taper(X.pg, 'quelqu.un@gmail.com');
    const t0 = Date.now(); await commencer(X.pg);
    let e = null;
    while (Date.now() - t0 < 12000) { e = await etat(X.pg); if (!/Vérification/.test(e.btn)) break; await X.pg.waitForTimeout(250); }
    const duree = Date.now() - t0;
    t('OBQ-15 ⛔⛔ réseau qui pend → « Vérification… » s\'arrête tout seul en moins de 9 s, avec un message clair',
      !/Vérification/.test(e.btn) && duree < 9000 && /Impossible de vérifier/.test(e.msg) && (await obVisible(X.pg)), js({ duree, e }));
    t('OBQ-15b ⛔ … et rien n\'est écrit à l\'aveugle dans le cloud (aucun saveProfile pour un compte peut-être existant)', X.st.save === 0, 'save=' + X.st.save);
    await X.pg.evaluate(() => { const s = [...document.querySelectorAll('#ob-email-msg span')].find(x => /continue sans email/.test(x.textContent)); if (s) s.click(); });
    await X.pg.waitForTimeout(1200);
    const fin = await etat(X.pg), ob = await obVisible(X.pg);
    t('OBQ-16 après le délai, « continue sans email » termine proprement (sans email, sans écriture cloud)', !ob && fin.email === '' && X.st.save === 0, js({ ob, fin, save: X.st.save }));
    await X.cx.close();
  }
  /* ═════════ OBQ-05 — restauration d'un compte : aucune ancienne nouveauté ═════════ */
  {
    const X = await ouvrir({ mode: 'ok' });
    await versFin(X.pg); await taper(X.pg, 'revenant@gmail.com');
    await commencer(X.pg); await X.pg.waitForTimeout(3500);
    const e = await etat(X.pg);
    t('OBQ-05 ⛔ compte restauré à l\'inscription → profil revenu, AUCUNE ancienne nouveauté, aucun Guide, aucun enregistrement par-dessus',
      e.nbSess === 1 && !(await ouvert(X.pg, 'ov-whatsnew')) && !(await ouvert(X.pg, 'ov-appguide')) && e.wnSeen === String(e.max) && X.st.save === 0, js({ e, save: X.st.save }));
    await X.cx.close();
  }
  /* ═════════ OBQ-18 / 19 — petit iPhone : « Passer » accessible tout de suite ═════════ */
  for (const vp of [{ width: 375, height: 667 }, { width: 320, height: 568 }]) {
    const X = await ouvrir({ vp, stock: { ft4_ob2: '1', ft4_guide_shown: '1', ft4_tester_eq_v1: '1', ft4_wn_seen: '0', ft4_name: 'Ancien' }, attente: 2600 });
    const r = await X.pg.evaluate(() => { const o = document.getElementById('ov-whatsnew'); if (!o.classList.contains('open')) return { open: false };
      const b = document.getElementById('wn-close-top'); if (!b) return { open: true, bouton: false };
      const rc = b.getBoundingClientRect(); return { open: true, bouton: true, visible: rc.top >= 0 && rc.bottom <= innerHeight && rc.left >= 0 && rc.right <= innerWidth && rc.width >= 30 }; });
    let ferme = false;
    if (r.bouton) { await X.pg.click('#wn-close-top', { timeout: 2000 }).catch(() => {}); await X.pg.waitForTimeout(300); ferme = !(await ouvert(X.pg, 'ov-whatsnew')); }
    const seen = await X.pg.evaluate(() => localStorage.getItem('ft4_wn_seen'));
    t('OBQ-' + (vp.width === 375 ? '18' : '19') + ' ⛔ ' + vp.width + '×' + vp.height + ' : « Passer » (✕) est visible dès l\'ouverture, un tap ferme et marque vu',
      r.open && r.visible && ferme && seen !== '0', js({ r, ferme, seen }));
    await X.cx.close();
  }
  /* ═════════ OBQ-20 — utilisateur existant : aucune régression ═════════ */
  {
    // le plafond dépend de WHATS_NEW_MAX : on le lit d'abord
    const Y0 = await ouvrir({ stock: { ft4_ob2: '1', ft4_guide_shown: '1', ft4_tester_eq_v1: '1', ft4_wn_seen: '9999' }, attente: 800 });
    const max = await Y0.pg.evaluate(() => WHATS_NEW_MAX); await Y0.cx.close();
    const Y = await ouvrir({ stock: { ft4_ob2: '1', ft4_guide_shown: '1', ft4_tester_eq_v1: '1', ft4_name: 'Ancien', ft4_wn_seen: String(max - 1) }, attente: 2800 });
    const wnY = await ouvert(Y.pg, 'ov-whatsnew'), seenFt = await Y.pg.evaluate(() => ({ n: JSON.parse(localStorage.getItem('ft4_seen_ft') || '[]').length, tot: NEW_FEATURES.length }));
    /* PACKAGE ft-v1251 (§6) : l'utilisateur à jour jusqu'à la version d'avant voit EXACTEMENT la dernière entrée, et le bouton
       final reste « C'est parti 💪 » (décision produit). Les conditionnelles ne s'invitent pas (aucune n'est vraie ici). */
    const pk = await Y.pg.evaluate(() => ({ items: (_wnItems || []).map(f => f.v), dernier: WHATS_NEW_MAX, bouton: (document.getElementById('wn-next') || {}).textContent || '',
      titre: (document.getElementById('ov-whatsnew') || {}).textContent.indexOf((WHATS_NEW.find(f => f.v === WHATS_NEW_MAX) || {}).t || '§§') >= 0 }));
    await Y.cx.close();
    const Z = await ouvrir({ stock: { ft4_ob2: '1', ft4_guide_shown: '1', ft4_tester_eq_v1: '1', ft4_name: 'Ancien', ft4_wn_seen: String(max) }, attente: 2800 });
    const wnZ = await ouvert(Z.pg, 'ov-whatsnew');
    await Z.cx.close();
    t('OBQ-20 ⛔⛔ utilisateur existant : une nouveauté qu\'il n\'a pas vue s\'affiche ENCORE ; à jour, rien ; et ses points rouges ne sont pas effacés',
      wnY && !wnZ && seenFt.n < seenFt.tot, js({ wnY, wnZ, seenFt }));
    t('OBQ-23 ⛔ package : un utilisateur à jour jusqu\'à la version précédente voit EXACTEMENT la nouvelle entrée, bouton final « C\'est parti 💪 »',
      wnY && pk.items.length === 1 && pk.items[0] === pk.dernier && pk.titre && /C'est parti 💪/.test(pk.bouton), js(pk));
    const W = await ouvrir({ stock: { ft4_ob2: '1', ft4_guide_shown: '1', ft4_name: 'Ancien', ft4_wn_seen: String(max) }, attente: 3200 });
    t('OBQ-08b ⛔ utilisateur existant qui n\'avait jamais fermé la pop-up testeurs : elle ne s\'ouvre plus non plus', !(await ouvert(W.pg, 'ov-tester-eq')), '');
    await W.cx.close();
  }
};
