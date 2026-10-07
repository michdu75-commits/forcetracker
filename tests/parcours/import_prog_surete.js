/* ═════════════════════════════════════════════════════════════════════════════════════════════
   🛡️ LOT 1 IMPORT — FERMETURE DE SÛRETÉ (session-B · 07/10/2026, après le contre-audit Nutrition).
   Blocs B-L1S-* ; témoins SAFE-L1-01 → SAFE-L1-12 (+ leurs variantes).
   Deux risques, nommés par le contre-audit et reproduits ICI avant toute correction :
   ① CHANGEMENT DE COMPTE — la base IndexedDB d'import n'était rattachée à aucun compte : un brouillon
     créé sous A pouvait être proposé, repris, complété ou effacé sous B.
   ② STOCKAGE PLEIN — `ft4_sessions` s'écrit avant `ft4_progs` ; quand `ft4_progs` ne tient plus, le repli
     coupe les séances locales à 50, `ft4_progs` n'est pas réécrit, le programme reste en mémoire, le succès
     s'affiche et la synchro l'envoie au cloud ; au rechargement il disparaît du téléphone.
   CONDUIT : la vraie entrée de fichiers (`#imp-add-inp`) et la vraie base `ft_import` ; un changement de
     compte tel que le termine une inscription ou une restauration (`S.email` posé, puis `persist`) —
     ⚠️ le parcours d'authentification lui-même n'est PAS rejoué ; « continuer sans email »
     (`_oublierEmailLocal`) ; le vrai mode démo (`enterDemoMode` / `exitDemoMode`) ; un persona tel que
     `startVcTest` l'applique (gel `_demoMode` → `_vcApplyPersona` → dégel + `load()`), SANS l'appel à Milo ;
     le VRAI quota de localStorage de Chromium (≈ 5 Mio), rempli jusqu'au bord ; les vraies opérations
     programme (import en mise à jour, « Sauvegarder comme programme », restauration, éditeur, programme de
     Milo) ; la vraie synchro (`_cloudSync`, corps `saveProfile` intercepté) ; le rechargement.
   OBSERVE : la base IndexedDB brute (documents, portée, pages), le nombre d'ouvertures de `ft_import`,
     `ft4_progs` / `ft4_sessions` / `ft4_hist_tronque` sur le disque, `S.programmes`, les messages montrés,
     les corps envoyés au cloud, l'état après rechargement.
   NE COUVRE PAS : le quota d'un iPhone (Safari) ni l'éviction du stockage par iOS ; deux appareils
     (multi-appareils : hors lot, risque préexistant) ; le parcours d'authentification ; le serveur.
   ⛔ 0 appel réel (Worker et Apps Script simulés, Supabase et Anthropic coupés).
   Banc : tools/banc_import_prog_surete.js · contrôle négatif : tools/mut_import_prog_surete.py
   ═════════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-L1S (session-B). LOT 1 IMPORT — FERMETURE DE SÛRETÉ (compte, démo, personas, stockage plein) ═══');
  const js = x => { try { return JSON.stringify(x).slice(0, 700); } catch (e) { return String(x); } };
  const pause = ms => new Promise(r => setTimeout(r, ms));
  let reels = 0;
  const cfg = { reponse: null, saveProfile: [] };
  const L = (name, sets, reps, kg, note) => ({ name, sets, reps, repsPerSet: [], kg, kgPerSet: [], supersetGroup: '', setType: '', note: note || '' });
  const NOTE = 'Montée 50/65/80 % puis séries de travail · RIR 1-2 · repos 3 min entre les séries lourdes · tempo contrôlé, amplitude complète';
  const JOURS = [['Squat à la barre', 'Presse à cuisses', 'Fentes marchées', 'Leg curl assis', 'Leg extension', 'Mollets debout', 'Hip thrust barre', 'Abduction cuisses', 'Gainage'],
    ['Développé couché', 'Développé incliné haltères', 'Dips', 'Écarté poulie', 'Développé militaire', 'Élévations latérales', 'Extension triceps poulie', 'Barre au front', 'Pompes'],
    ['Soulevé de terre', 'Tractions', 'Rowing barre', 'Tirage vertical', 'Rowing haltère', 'Face pull', 'Curl barre', 'Curl marteau', 'Shrugs'],
    ['Squat avant', 'Développé couché prise serrée', 'Rowing poitrine appuyée', 'Développé épaules machine', 'Leg curl couché', 'Tirage poulie haute', 'Curl pupitre', 'Extension triceps haltère', 'Crunch poulie']];
  const GROS = (suffixe) => ({ name: 'Powerbuilding sûreté', weeks: 6, startDate: '', days: JOURS.map((j, d) => ({ label: 'Séance ' + (d + 1) + ' ' + suffixe, exercises: j.map((n, i) => L(n, 5, i < 2 ? 4 : 10, 60 + i * 5, NOTE + ' (' + suffixe + ')')) })) });

  const contexte = async (graine) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/anthropic\.com/, r => { reels++; return r.abort(); });          // un appel IA réel tenté = rouge
    await cx.route(/supabase\.co|cdn\.jsdelivr\.net/, r => r.abort());           // miroir et CDN coupés
    await cx.route(/workers\.dev|script\.google\.com/, async r => {
      let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
      if (c.action === 'importProgram') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: JSON.parse(JSON.stringify(cfg.reponse)) }) });
      if (c.action === 'saveProfile') cfg.saveProfile.push({ at: Date.now(), corps: c });
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
    });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_l1s'))return; sessionStorage.setItem('_l1s','1'); localStorage.clear();
      const D=${JSON.stringify(graine)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    const espion = () => pg.evaluate(() => {
      window.__toasts = []; const o = window.toast; window.toast = function (m) { window.__toasts.push(String(m)); try { return o.apply(this, arguments); } catch (e) {} };
      if (!window.__idbOuvertures) { window.__idbOuvertures = []; const ouvre = indexedDB.open.bind(indexedDB);
        indexedDB.open = function (n, v) { window.__idbOuvertures.push(String(n)); return v === undefined ? ouvre(n) : ouvre(n, v); }; }
    });
    const ouvrir = async () => { await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2300); await espion(); };
    const recharger = async () => { await pg.reload(); await pg.waitForTimeout(2300); await espion(); };
    return { cx, pg, errs, ouvrir, recharger };
  };
  /* La base IndexedDB BRUTE — lue sans passer par l'app (aucun filtre). */
  const brute = (pg) => pg.evaluate(() => new Promise(res => {
    try {
      const rq = indexedDB.open('ft_import');
      rq.onupgradeneeded = () => { try { rq.transaction.abort(); } catch (e) {} res([]); };
      rq.onerror = () => res([]);
      rq.onsuccess = () => { const db = rq.result;
        if (!db.objectStoreNames.contains('docs')) { db.close(); return res([]); }
        const g = db.transaction('docs', 'readonly').objectStore('docs').getAll();
        g.onsuccess = () => { const all = g.result || []; db.close(); res(all.map(d => ({ id: d.id, scope: d.scope === undefined ? '(aucune)' : d.scope, etat: d.state, pages: (d.pages || []).length, maj: d.updatedAt || '', h: (d.pages || []).map(p => (p.data || '').length).join(',') }))); };
        g.onerror = () => { db.close(); res([]); };
      };
    } catch (e) { res([]); }
  }));

  /* ════════════════ B-L1S-A — LE DOCUMENT D'IMPORT APPARTIENT À UN COMPTE ════════════════ */
  const A = await contexte({ ft4_ob2: '1', ft4_name: 'Testeur', ft4_premium: 'true', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_email: '', ft4_ok: '0', ft4_admin_ok: '1' });
  const pg = A.pg;
  await A.ouvrir();
  const images = await pg.evaluate(() => ['#d33', '#3a3', '#33d', '#cc3', '#3cc', '#c3c'].map((c, i) => {
    const cv = document.createElement('canvas'); cv.width = 320 + i * 9; cv.height = 200 + i * 5; const x = cv.getContext('2d');
    x.fillStyle = c; x.fillRect(0, 0, cv.width, cv.height); x.fillStyle = '#fff'; x.font = '38px sans-serif'; x.fillText('Page ' + (i + 1), 20, 90);
    return cv.toDataURL('image/png').split(',')[1]; }));
  const fichier = (i, nom) => ({ name: nom || ('page' + (i + 1) + '.png'), mimeType: 'image/png', buffer: Buffer.from(images[i], 'base64') });
  const ajouter = async (fs_) => { await pg.setInputFiles('#imp-add-inp', fs_); await pg.waitForTimeout(1100); };
  const compte = (email) => pg.evaluate(async (e) => {
    try { closeImportProg(); } catch (x) {}
    if (e) { S.email = e; } else { S.email = ''; try { _oublierEmailLocal(); } catch (x) {} }
    persist(); await new Promise(r => setTimeout(r, 300));
  }, email);
  const vue = () => pg.evaluate(async () => {
    try { closeImportProg(); } catch (e) {}
    openImportProg(); await new Promise(r => setTimeout(r, 1000));
    const bd = document.getElementById('imp-reprise');
    let lisibles = -1; try { lisibles = (await _impDocsTous()).length; } catch (e) {}
    return { pages: (_impPhotos || []).length, bandeau: !!(bd && bd.style.display === 'flex'), lisibles };
  });

  // ① A crée un brouillon de 2 pages
  await compte('a@test.local');
  await pg.evaluate(() => { impRecommencer(true); try { closeImportProg(); } catch (e) {} openImportProg(); });
  await pg.waitForTimeout(600);
  await ajouter([fichier(0), fichier(1)]);
  await pg.evaluate(async () => { try { await _impEcriture; } catch (e) {} });
  const base0 = await brute(pg);
  const docA = base0.find(d => d.pages === 2) || null;
  // ② A → B, SANS rechargement : le scan de A est encore en mémoire
  await compte('b@test.local');
  const vueB_memoire = await vue();
  // B ajoute une page à ce qu'il voit
  await ajouter([fichier(2)]);
  await pg.evaluate(async () => { try { await _impEcriture; } catch (e) {} });
  const base1 = await brute(pg);
  const docA1 = docA && base1.find(d => d.id === docA.id);
  // ③ B après RECHARGEMENT : la reprise ne doit rien proposer de A
  await pg.evaluate(() => { try { closeImportProg(); } catch (e) {} impRecommencer(true); });
  await A.recharger();
  await pg.evaluate(() => { S.email = 'b@test.local'; });
  const vueB_reprise = await vue();
  const lireA_parB = await pg.evaluate(async (id) => { try { const x = await _impDocLire(id); return x ? (x.pages || []).length : null; } catch (e) { return 'err'; } }, docA && docA.id);
  // ④ B tente d'effacer le document de A (même chemin que la suppression d'un programme qui le citerait)
  await pg.evaluate(async (id) => { try { await _impDocEffacer(id); } catch (e) {} }, docA && docA.id);
  // B fait « Nouveau scan » sur son propre brouillon
  await pg.evaluate(async () => { const bd = document.getElementById('imp-reprise'); if (bd && bd.style.display === 'flex' && bd.querySelector('[data-reset]')) bd.querySelector('[data-reset]').click(); else impRecommencer(false); await new Promise(r => setTimeout(r, 400)); try { await _impEcriture; } catch (e) {} });
  const base2 = await brute(pg);
  const docA2 = docA && base2.find(d => d.id === docA.id);
  // ⑤ retour à A : SON brouillon est là, intact
  await compte('a@test.local');
  const vueA = await vue();
  await pg.evaluate(() => { try { closeImportProg(); } catch (e) {} });
  t('SAFE-L1-01 ⛔⛔ un document créé sous A n\'est JAMAIS montré à B : ni le scan resté en mémoire, ni la reprise après rechargement, ni une lecture directe',
    !!docA && vueB_memoire.pages === 0 && vueB_memoire.bandeau === false && vueB_reprise.pages === 0 && vueB_reprise.bandeau === false && vueB_reprise.lisibles === 0 && lireA_parB === null,
    js({ docA, vueB_memoire, vueB_reprise, lireA_parB }));
  t('SAFE-L1-02 ⛔⛔ B ne complète, ne remplace ni n\'efface JAMAIS le document de A (ajout de page, effacement direct, « Nouveau scan ») — et A le retrouve intact',
    !!docA && !!docA1 && docA1.pages === 2 && docA1.h === docA.h && !!docA2 && docA2.pages === 2 && docA2.h === docA.h && vueA.pages === 2,
    js({ docA, docA1, docA2, vueA, base1: base1.map(d => [d.scope, d.pages, d.etat]), base2: base2.map(d => [d.scope, d.pages, d.etat]) }));

  // ⑥ SANS compte (« continuer sans email ») : une portée à part, dans les deux sens
  await compte('');
  const vueLocal0 = await vue();
  await ajouter([fichier(3)]);
  await pg.evaluate(async () => { try { await _impEcriture; } catch (e) {} });
  const base3 = await brute(pg);
  const docL = base3.find(d => d.pages === 1 && (!docA || d.id !== docA.id)) || null;
  await compte('a@test.local');
  const vueA2 = await vue();
  await compte('');
  const vueLocal1 = await vue();
  await pg.evaluate(() => { try { closeImportProg(); } catch (e) {} });
  t('SAFE-L1-03 ⛔ sans compte, une portée DISTINCTE : le brouillon de A n\'apparaît pas sans email, celui fait sans email n\'apparaît pas chez A, chacun retrouve le sien',
    vueLocal0.pages === 0 && vueLocal0.bandeau === false && !!docL && vueA2.pages === 2 && vueLocal1.pages === 1 && docL.scope !== (docA && docA.scope),
    js({ vueLocal0, docL, vueA2, vueLocal1 }));

  // ⑦ DÉMO : A réel → document A → démo → rien de visible, aucune lecture/écriture → sortie → document A intact
  await compte('a@test.local');
  await pg.evaluate(() => { try { closeImportProg(); } catch (e) {} });
  const avantDemo = await brute(pg);
  const DEMO = await pg.evaluate(async () => {
    const o = {};
    window.__idbOuvertures = [];
    try { enterDemoMode(); } catch (e) { o.err = String(e); }
    o.demo = !!window._demoMode;
    openImportProg(); await new Promise(r => setTimeout(r, 900));
    const bd = document.getElementById('imp-reprise');
    o.pages = (_impPhotos || []).length; o.bandeau = !!(bd && bd.style.display === 'flex');
    return o;
  });
  await ajouter([fichier(4, 'demo.png')]);
  const DEMO2 = await pg.evaluate(async () => {
    const o = { pagesDemo: (_impPhotos || []).length };
    try { await _impEcriture; } catch (e) {}
    o.ouverturesImport = (window.__idbOuvertures || []).filter(n => n === 'ft_import').length;
    try { closeImportProg(); } catch (e) {}
    try { exitDemoMode(); } catch (e) { o.err = String(e); }
    o.demo = !!window._demoMode;
    openImportProg(); await new Promise(r => setTimeout(r, 1000));
    o.pagesApres = (_impPhotos || []).length;
    try { closeImportProg(); } catch (e) {}
    return o;
  });
  const apresDemo = await brute(pg);
  t('SAFE-L1-04 ⛔⛔ démo : aucun document réel visible, ZÉRO ouverture de la base d\'import (lecture comme écriture) ; en sortant, le document de A est là, intact',
    DEMO.demo === true && DEMO.pages === 0 && DEMO.bandeau === false && DEMO2.pagesDemo === 1 && DEMO2.ouverturesImport === 0 && DEMO2.demo === false && DEMO2.pagesApres === 2
    && js(apresDemo.map(d => [d.id, d.pages, d.h, d.maj])) === js(avantDemo.map(d => [d.id, d.pages, d.h, d.maj])),
    js({ DEMO, DEMO2, avant: avantDemo.length, apres: apresDemo.length }));

  // ⑧ PERSONA : A réel → document A → persona (gel + profil fictif) → rien de visible ni de modifié → retour à A → intact
  const PERS = await pg.evaluate(async () => {
    const o = {};
    window.__idbOuvertures = [];
    try { closeImportProg(); } catch (e) {}
    try { persist(); } catch (e) {}
    window._demoMode = true;                                  // le gel que pose startVcTest
    try { _vcApplyPersona({ id: 'P-SAFE', nom: 'Persona sûreté', apply: {} }); } catch (e) { o.err = String(e); }
    o.emailPersona = S.email;
    openImportProg(); await new Promise(r => setTimeout(r, 900));
    const bd = document.getElementById('imp-reprise');
    o.pages = (_impPhotos || []).length; o.bandeau = !!(bd && bd.style.display === 'flex');
    return o;
  });
  await ajouter([fichier(5, 'persona.png')]);
  const PERS2 = await pg.evaluate(async () => {
    const o = { pagesPersona: (_impPhotos || []).length };
    try { await _impEcriture; } catch (e) {}
    o.ouverturesImport = (window.__idbOuvertures || []).filter(n => n === 'ft_import').length;
    try { closeImportProg(); } catch (e) {}
    window._demoMode = false; try { load(); } catch (e) {}   // le dégel que pose startVcTest
    o.email = S.email;
    openImportProg(); await new Promise(r => setTimeout(r, 1000));
    o.pagesApres = (_impPhotos || []).length;
    try { closeImportProg(); } catch (e) {}
    return o;
  });
  const apresPersona = await brute(pg);
  t('SAFE-L1-05 ⛔⛔ persona : aucun document réel visible ni modifié, ZÉRO ouverture de la base d\'import ; au retour, A retrouve son document intact',
    !PERS.err && PERS.pages === 0 && PERS.bandeau === false && PERS2.pagesPersona === 1 && PERS2.ouverturesImport === 0 && PERS2.email === 'a@test.local' && PERS2.pagesApres === 2
    && js(apresPersona.map(d => [d.id, d.pages, d.h, d.maj])) === js(avantDemo.map(d => [d.id, d.pages, d.h, d.maj])),
    js({ PERS, PERS2 }));
  t('B-L1S-A0 aucune erreur de page dans le bloc compte / démo / persona', A.errs.length === 0, js(A.errs.slice(0, 3)));
  await A.cx.close();

  /* ════════════════ B-L1S-B — STOCKAGE PLEIN : le VRAI quota de localStorage ════════════════ */
  const SESSIONS = Array.from({ length: 120 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 0, 1) + i * 86400000).toISOString().slice(0, 10);
    return { id: 's' + i, ts: 1767225600000 + i * 86400000, date: d, label: 'Séance ' + i, exs: [{ name: 'Développé couché', sets: [{ kg: 80, reps: 8, done: true, type: 'N' }, { kg: 80, reps: 8, done: true, type: 'N' }] }], vol: 1280 };
  });
  const Q = await contexte({ ft4_ob2: '1', ft4_name: 'Testeur', ft4_premium: 'true', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_email: 'q@test.local', ft4_ok: '1', ft4_sessions: JSON.stringify(SESSIONS) });
  const q = Q.pg;
  await Q.ouvrir();
  // Graine : un gros programme importé en DEUX versions (v1 → v2), et un petit programme à plat.
  cfg.reponse = GROS('v1');
  const SEED = await q.evaluate(async () => {
   try {
    S.premium = true; S.programmes = []; persist();
    const imp = async (data, maj, cible) => {
      impRecommencer(true);
      _impPhotos = [{ type: 'text/plain', data: data, name: data + '.txt', isText: true }]; _impExtracted = null; _impMode = 'new'; S.premium = true;
      await analyzeImportPhotos();
      if (maj) { _setImpMode('update'); _impChoisirCible(cible); }
      const ec = document.getElementById('imp-en-cours'); if (ec) { ec.checked = false; ec.dataset.touche = '1'; }
      finalImportProg();
      try { document.querySelectorAll('.overlay.open').forEach(x => x.classList.remove('open')); } catch (e) {}
    };
    await imp('surete-v1', false, null);
    const P = S.programmes[S.programmes.length - 1];
    return { id: P && P.id, v: P && P.version };
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  cfg.reponse = GROS('v2');
  const SEED2 = await q.evaluate(async (id) => {
   try {
    impRecommencer(true);
    _impPhotos = [{ type: 'text/plain', data: 'surete-v2', name: 'v2.txt', isText: true }]; _impExtracted = null; S.premium = true;
    await analyzeImportPhotos();
    _setImpMode('update'); _impChoisirCible(id);
    finalImportProg();
    try { document.querySelectorAll('.overlay.open').forEach(x => x.classList.remove('open')); } catch (e) {}
    _progEnregistrerNouveau({ name: 'Plat sûreté', exs: [{ name: 'Curl barre', sets: [{ kg: 30, reps: 10, type: 'N' }] }] }, 'session');
    try { closeProgModal(); } catch (e) {}
    const P = S.programmes.find(x => x.id === id), F = S.programmes.find(x => x.name === 'Plat sûreté');
    const disque = JSON.parse(localStorage.getItem('ft4_progs') || '[]');
    return { v: P && P.version, idF: F && F.id, nDisque: disque.length, sessions: JSON.parse(localStorage.getItem('ft4_sessions') || '[]').length };
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  }, SEED.id);
  /* Remplissage : la plus grande chaîne qui tient encore, MOINS une marge de 3 000 caractères — les petites
     écritures (compteurs, drapeaux) passent, une nouvelle version d'un gros programme (≈ 10 Ko) ne passe pas. */
  const remplir = () => q.evaluate(() => {
    try { localStorage.removeItem('zz_remplissage'); } catch (e) {}
    let lo = 0, hi = 6 * 1024 * 1024;
    while (hi - lo > 64) { const mid = Math.floor((lo + hi) / 2); try { localStorage.setItem('zz_remplissage', 'x'.repeat(mid)); lo = mid; } catch (e) { hi = mid; } }
    const garde = Math.max(0, lo - 3000);
    localStorage.setItem('zz_remplissage', 'x'.repeat(garde));
    return { max: lo, garde };
  });
  const etat = (id) => q.evaluate((pid) => {
    const disque = JSON.parse(localStorage.getItem('ft4_progs') || '[]');
    const dP = disque.find(x => x.id === pid), mP = (S.programmes || []).find(x => x.id === pid);
    return { disqueV: dP && dP.version, memoireV: mP && mP.version, nDisque: disque.length, nMemoire: (S.programmes || []).length,
             memoireEgaleDisque: localStorage.getItem('ft4_progs') === JSON.stringify(S.programmes || []),
             sessionsDisque: JSON.parse(localStorage.getItem('ft4_sessions') || '[]').length, tronque: localStorage.getItem('ft4_hist_tronque') === '1',
             toasts: (window.__toasts || []).slice() };
  }, id);
  const succes = /importé|mis à jour|sauvegardé|enregistré dans|restaurée|est prêt|✅|💪/i;
  const echec = /NON enregistré/i;
  const REMPLI = await remplir();
  cfg.reponse = GROS('v3');
  cfg.saveProfile = [];
  const t0 = Date.now();
  const IMPORT = await q.evaluate(async (id) => {
   try {
    window.__toasts = [];
    impRecommencer(true);
    _impPhotos = [{ type: 'text/plain', data: 'surete-v3', name: 'v3.txt', isText: true }]; _impExtracted = null; S.premium = true;
    await analyzeImportPhotos();
    _setImpMode('update'); _impChoisirCible(id);
    window.__toasts = [];
    finalImportProg();
    try { await _impEcriture; } catch (e) {}
    const ov = document.getElementById('ov-import-prog');
    return { etatDoc: _impDoc ? _impDoc.state : '(scan vidé)', ouvert: !!(ov && ov.classList.contains('open')), lecture: !!_impExtracted };
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  }, SEED.id);
  const E1 = await etat(SEED.id);
  await pause(4800);                              // la synchro différée (_cloudSyncDebounced = 4 s)
  const corps1 = cfg.saveProfile.filter(x => x.at >= t0).map(x => x.corps);
  const envoyeV3 = corps1.some(c => Array.isArray(c.programmes) && c.programmes.some(p => p && p.id === SEED.id && p.version === 3));
  t('B-L1S-B0 ⛔ CONTRÔLE — la graine tient (v2 + un programme à plat, 120 séances) et le stockage est réellement plein',
    !SEED.err && !SEED2.err && SEED2.v === 2 && !!SEED2.idF && SEED2.sessions === 120 && REMPLI.max > 1000000, js({ SEED, SEED2, REMPLI }));
  t('SAFE-L1-06 ⛔⛔ stockage plein : `ft4_progs` n\'a pas reçu la mise à jour → l\'opération est ÉCHOUÉE (mémoire = disque, document pas marqué importé, scan gardé pour réessayer)',
    !IMPORT.err && E1.disqueV === 2 && E1.memoireV === 2 && E1.memoireEgaleDisque === true && IMPORT.etatDoc !== 'imported' && IMPORT.lecture === true,
    js({ IMPORT, E1: Object.assign({}, E1, { toasts: undefined }) }));
  t('SAFE-L1-06b ⛔ un programme qui ne tient pas ne déclenche PAS le repli des 50 séances (historique local intact, aucun drapeau de troncature)',
    E1.sessionsDisque === 120 && E1.tronque === false, js({ sessions: E1.sessionsDisque, tronque: E1.tronque }));
  t('SAFE-L1-07 ⛔⛔ stockage plein : AUCUN message de succès ; un message explicite dit que le programme n\'est PAS enregistré',
    !E1.toasts.some(m => succes.test(m)) && E1.toasts.some(m => echec.test(m)), js(E1.toasts));
  t('SAFE-L1-08 ⛔⛔ stockage plein : le nouvel état (v3) ne part JAMAIS au cloud',
    envoyeV3 === false, js({ corps: corps1.length, versions: corps1.map(c => Array.isArray(c.programmes) ? c.programmes.map(p => p && p.version) : '(omis)') }));

  /* Les AUTRES portes qui écrivent un programme, toujours stockage plein. */
  const PORTES = await q.evaluate(async (ids) => {
    const res = {};
    const egal = () => localStorage.getItem('ft4_progs') === JSON.stringify(S.programmes || []);
    const essai = async (nom, fn) => {
      window.__toasts = []; const avant = localStorage.getItem('ft4_progs');
      let err = null; try { await fn(); } catch (e) { err = String(e).slice(0, 120); }
      try { document.querySelectorAll('.overlay.open').forEach(x => x.classList.remove('open')); } catch (e) {}
      res[nom] = { err, disqueInchange: localStorage.getItem('ft4_progs') === avant, memoireEgaleDisque: egal(), toasts: (window.__toasts || []).slice() };
    };
    const gros = (n) => ({ name: n, exs: Array.from({ length: 12 }, (_, i) => ({ name: 'Curl barre', note: 'Consigne longue '.repeat(30) + i, sets: Array.from({ length: 5 }, () => ({ kg: 30, reps: 10, type: 'N' })) })) });
    await essai('nouveau', () => _progEnregistrerNouveau(gros('Nouveau sûreté'), 'session'));
    await essai('miseAJourSeance', () => { _progCibleCtx = { nom: 'Plat sûreté', contenu: gros('Plat sûreté') }; _progCibleChoisir(ids.F); });
    await essai('restauration', () => { if (typeof restaurerVersionProg === 'function') restaurerVersionProg(ids.P, 1); else { _progRestaurerVersion(ids.P, 1); toast('Version 1 restaurée — rien n\'a été effacé', 'success'); } });
    await essai('editeur', () => { editProg(ids.P); _editProgData.days[0].exs[0].note = 'Nouvelle consigne '.repeat(400); saveProgEdit(); });
    await essai('milo', () => { _pendingForceProgs.length = 0; _pendingForceProgs.push(Object.assign(gros('Programme Milo sûreté'), { force: true })); const bt = document.createElement('button'); bt.id = '__btMilo'; document.body.appendChild(bt); _saveForceProgram(0, bt); res.__miloBouton = bt.textContent; });
    return res;
  }, { P: SEED.id, F: SEED2.idF });
  const portesKo = Object.keys(PORTES).filter(k => k !== '__miloBouton').filter(k => { const r = PORTES[k]; return r.err || !r.disqueInchange || !r.memoireEgaleDisque || r.toasts.some(m => succes.test(m)) || !r.toasts.some(m => echec.test(m)); });
  t('SAFE-L1-07b ⛔⛔ stockage plein, TOUTES les portes : « Sauvegarder comme programme » (nouveau / mise à jour), restauration de version, éditeur, programme de Milo — aucune ne dit « enregistré », toutes disent « non enregistré », la mémoire reste le disque',
    portesKo.length === 0 && !/Enregistré/.test(PORTES.__miloBouton || ''), js({ portesKo, detail: portesKo.map(k => [k, PORTES[k]]), bouton: PORTES.__miloBouton }));

  /* Rechargement après l'échec : ce qui était montré est ce qui existe ; le scan est repris pour réessayer. */
  const montre = await q.evaluate(() => JSON.stringify((S.programmes || []).map(p => [p.id, p.version, p.name])));
  await Q.recharger();
  const RECH = await q.evaluate(async () => {
    const o = { apres: JSON.stringify((S.programmes || []).map(p => [p.id, p.version, p.name])), sessions: (S.sessions || []).length };
    try { closeImportProg(); } catch (e) {}
    openImportProg(); await new Promise(r => setTimeout(r, 1100));
    const bd = document.getElementById('imp-reprise');
    o.reprise = !!(bd && bd.style.display === 'flex'); o.lecture = !!_impExtracted;
    try { closeImportProg(); } catch (e) {}
    return o;
  });
  t('SAFE-L1-09 ⛔⛔ rechargement après l\'échec : les programmes montrés juste après sont EXACTEMENT ceux du téléphone, et le document lu est repris (réessayer sans nouvelle analyse)',
    RECH.apres === montre && RECH.reprise === true && RECH.lecture === true && RECH.sessions === 120, js({ montre, RECH }));

  /* Une porte GÉNÉRIQUE (un programme changé en mémoire puis `persist`, hors des opérations ci-dessus) :
     même stockage plein, la synchro ne doit pas pousser l'état que le disque n'a pas. */
  const REMPLI2 = await remplir();                  // de nouveau plein (un repli de 50 séances a pu libérer de la place)
  cfg.saveProfile = [];
  const t1 = Date.now();
  const GEN = await q.evaluate((id) => {
    const p = (S.programmes || []).find(x => x.id === id); if (!p) return { err: 'programme absent' };
    p.noteGenerique = 'Ajout en mémoire seulement '.repeat(300);
    try { persist(); } catch (e) {}
    const disqueAPris = (localStorage.getItem('ft4_progs') || '').indexOf('Ajout en mémoire seulement') >= 0;
    _cloudSync();                                   // la synchro, À CET INSTANT — disque sans la note
    return { disqueAPris };
  }, SEED.id);
  await pause(1500);                                // le corps de CET envoi (le différé part à +4 s)
  const corps2 = cfg.saveProfile.filter(x => x.at >= t1).map(x => x.corps);
  const envoyeGen = corps2.some(c => Array.isArray(c.programmes) && c.programmes.some(p => p && p.noteGenerique));
  t('SAFE-L1-08b ⛔⛔ porte générique (mémoire changée, `persist` qui échoue) : la synchro n\'envoie JAMAIS un état de programmes absent du disque',
    !GEN.err && GEN.disqueAPris === false && corps2.length >= 1 && envoyeGen === false,
    js({ REMPLI2, GEN, corps: corps2.length, programmes: corps2.map(c => Array.isArray(c.programmes) ? c.programmes.length : '(omis)') }));

  /* Place libérée : tout redevient normal. */
  await Q.recharger();
  cfg.saveProfile = [];
  const t2 = Date.now();
  const NORMAL = await q.evaluate(async (id) => {
   try {
    localStorage.removeItem('zz_remplissage');
    window.__toasts = [];
    try { closeImportProg(); } catch (e) {}
    openImportProg(); await new Promise(r => setTimeout(r, 1100));
    if (!_impExtracted) return { err: 'pas de reprise' };
    if (_impMode !== 'update' || !_impCibleId) { _setImpMode('update'); _impChoisirCible(id); }
    window.__toasts = [];
    finalImportProg();
    try { await _impEcriture; } catch (e) {}
    const disque = JSON.parse(localStorage.getItem('ft4_progs') || '[]').find(x => x.id === id);
    return { disqueV: disque && disque.version, toasts: (window.__toasts || []).slice(), egal: localStorage.getItem('ft4_progs') === JSON.stringify(S.programmes || []) };
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  }, SEED.id);
  await pause(4800);
  const corps3 = cfg.saveProfile.filter(x => x.at >= t2).map(x => x.corps);
  t('SAFE-L1-10 ⭐ place disponible : comportement normal — la mise à jour reprise s\'enregistre (v3 sur le disque), le succès s\'affiche, la synchro l\'envoie',
    !NORMAL.err && NORMAL.disqueV === 3 && NORMAL.egal === true && NORMAL.toasts.some(m => /mis à jour/.test(m)) && corps3.some(c => Array.isArray(c.programmes) && c.programmes.some(p => p && p.id === SEED.id && p.version === 3)),
    js({ NORMAL, corps: corps3.length }));
  const RESTAU = await q.evaluate((id) => {
    window.__toasts = [];
    const n = _progRestaurerVersion(id, 1);
    const disque = JSON.parse(localStorage.getItem('ft4_progs') || '[]').find(x => x.id === id);
    return { n, disqueV: disque && disque.version, raison: disque && disque.versionReason, jour1: disque && disque.days && disque.days[0] && disque.days[0].label,
             precedentes: disque && (disque.previousVersions || []).map(v => v.version) };
  }, SEED.id);
  t('SAFE-L1-11 ⭐ versions et restauration fonctionnent toujours : restaurer la v1 crée la v4 (raison « restore »), toutes les versions restent',
    RESTAU.n === 4 && RESTAU.disqueV === 4 && RESTAU.raison === 'restore' && /v1/.test(RESTAU.jour1 || '') && js(RESTAU.precedentes) === js([1, 2, 3]), js(RESTAU));

  /* previousVersions FIGÉES : une migration de nom du catalogue (au chargement) ne réécrit que la version courante. */
  const FIG = await q.evaluate(() => {
    const p = _progNouveau({ name: 'Ancien nom', exs: [{ name: 'Câble Crunch', sets: [{ kg: 20, reps: 15, type: 'N' }] }] }, 'import', 'import', null);
    _progNouvelleVersion(p, { name: 'Ancien nom', exs: [{ name: 'Câble Crunch', sets: [{ kg: 25, reps: 12, type: 'N' }] }] }, 'update', null);
    S.programmes.push(p); persist();
    return { id: p.id, ok: localStorage.getItem('ft4_progs').indexOf('Câble Crunch') >= 0 };
  });
  await Q.recharger();
  const FIG2 = await q.evaluate((id) => {
    const p = (S.programmes || []).find(x => x.id === id);
    const o = { courant: p && p.exs && p.exs[0] && p.exs[0].name, archive: p && p.previousVersions && p.previousVersions[0] && p.previousVersions[0].content.exs[0].name };
    o.n = _progRestaurerVersion(id, 1);
    const q2 = S.programmes.find(x => x.id === id);
    o.restaure = q2 && q2.exs && q2.exs[0] && q2.exs[0].name; o.v = q2 && q2.version;
    return o;
  }, FIG.id);
  t('SAFE-L1-12 ⛔ previousVersions FIGÉES : la migration de nom du catalogue renomme la version courante (« Câble Crunch » → « Crunch Poulie ») et JAMAIS une version archivée ; la restauration marche',
    FIG.ok === true && FIG2.courant === 'Crunch Poulie' && FIG2.archive === 'Câble Crunch' && FIG2.n === 3 && FIG2.v === 3 && FIG2.restaure === 'Câble Crunch', js({ FIG, FIG2 }));
  t('B-L1S-00 0 appel réel (Worker / Apps Script simulés, Supabase / Anthropic coupés) et aucune erreur de page', reels === 0 && Q.errs.length === 0, js({ reels, errs: Q.errs.slice(0, 3) }));
  await Q.cx.close();
};
