/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   🖼️ SEANCE-UX-IMAGES — LES VIGNETTES ANATOMIQUES DE « CHOISIR UN EXERCICE » (blocs C-VIG-*) — session-C (Claude Séance),
   23/10/2026, paquet et consignes de Michel (docs/SEANCE-UX-IMAGES.md).
   ① 7 vignettes du paquet, copiées À L'OCTET (SHA-256 du manifeste), sous des noms NOUVEAUX (`muscles/vignettes/`) ;
   ② chacune sur SON groupe ; MOLLETS garde son image (le paquet n'en a pas ; « Corps complet » n'est utilisée nulle part) ;
   ③ cadre 88 × 51 ancré en bas : le liseré du haut (fond et bord de carte de la maquette, 3 à 17 lignes) est masqué, rien
     n'est étiré ; même cadre dans l'en-tête d'un groupe ouvert, sans rétrécir ;
   ④ libellés, catégories (`tags`), bouton « 🫀 Anatomie » et recherche : inchangés ; les autres écrans ne reçoivent pas ces
     vignettes ; un exercice INCONNU n'en reçoit jamais une ;
   ⑤ préchargées par le service worker : le sélecteur les affiche hors ligne.
   Ce que les témoins CONDUISENT : la vraie app servie en local, le vrai sélecteur (tap sur chaque tuile, retour, recherche,
   « Anatomie »), la création d'un exercice perso, un rechargement hors ligne servi par le vrai service worker, 3 largeurs.
   Ce qu'ils OBSERVENT : les tuiles, leurs images (source, chargement, taille native et affichée, recadrage calculé), l'en-tête
   d'un groupe ouvert, les lignes d'exercices, l'argument passé à `openAnatomyImg`, le cache `ft-images`, les fichiers du dépôt.
   Ce qu'ils NE COUVRENT PAS : Safari / l'iPhone réel, le jugement esthétique (captures avant / après fournies à Michel), le
   mode clair, la précision anatomique des illustrations (non validée médicalement — limite du paquet).
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const LABELS = ['Pectoraux', 'Dos / Dorsaux', 'Épaules / Trapèzes', 'Bras — Biceps / Triceps', 'Jambes',
  'Fessiers / Ischios / Lombaires', 'Abdominaux', 'Mollets'];
// la vignette attendue par groupe — et, pour les 7 du paquet, le nombre de lignes du liseré mesuré (22/10) et l'empreinte
const VIG = [
  { src: 'muscles/vignettes/01_pectoraux.png', liseré: 7, sha: '5c1dfa0399495cadeb217924deda4ab33fec1fa63db740015e31d9191c46188d' },
  { src: 'muscles/vignettes/02_dos_dorsaux.png', liseré: 12, sha: '58adf8c6d3e6336d2b7b865efd8baa93843e0c8411d16bc13d052d41d248366c' },
  { src: 'muscles/vignettes/03_epaules_trapezes.png', liseré: 3, sha: '5126daeac1ec384d4c0f160f71570ef32266ae0a0d54bb742409e06325ad1fb0' },
  { src: 'muscles/vignettes/04_bras_biceps_triceps.png', liseré: 9, sha: 'fd658288bdfe1aef785532ce03a38fe2acdd0562815d9b851c5c3200ddb8bd86' },
  { src: 'muscles/vignettes/05_jambes.png', liseré: 11, sha: 'd1c970d2fdf1eca5030f76d199ddef3c7710bcf1410d81fcf4ea116352f616f5' },
  { src: 'muscles/vignettes/06_fessiers_ischios_lombaires.png', liseré: 16, sha: 'c6000d133f51de5a186c2c2505862779e29383c870071b606c18d970964faa1f' },
  { src: 'muscles/vignettes/07_abdominaux.png', liseré: 17, sha: '046dfd4e6c75da34fcc8bc0cfc935e64f5b49733566bd2036a2aeb8491a33d0c' },
  { src: 'muscles/muscle mollet.png' } ];                                  // Mollets : son image d'avant, inchangée
// ce qui fait les catégories et le bouton « Anatomie » — figé tel qu'avant le lot (master f82a7c07)
const TAGS = [['Pectoraux'], ['Dos'], ['Épaules', 'Trapèzes'], ['Biceps', 'Triceps'], ['Jambes'], ['Fessiers', 'Lombaires'], ['Abdominaux'], ['Mollets']];
const ANAT = ['anatomy/pectoreaux/schema pectoreaux.png', 'anatomy/dos_dorsaux/schema dorsaux arriere + trapeze.png',
  'anatomy/epaules/schéma epaule arriere.png', 'anatomy/bras biceps triceps/schema muscles bras et avant bras.png',
  'anatomy/jambes/jambes avant/jambes face avant.png', 'anatomy/fessiers lombaires/schema lombaires fessiers.png',
  'anatomy/abdominaux/schema abdominaux.png', 'anatomy/jambes/jambes arrieres mollets/arriere cuisses mollets.png'];
const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_sessions: '[]' };
const _det = o => JSON.stringify(o);

async function ecran(t, b, PORT) {
  const ouvrir = async (opts) => {
    opts = opts || {};
    const cx = await b.newContext({ serviceWorkers: opts.sw ? 'allow' : 'block', viewport: { width: opts.w || 390, height: 844 },
      timezoneId: 'Europe/Paris', locale: 'fr-FR', hasTouch: true });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    const init = Object.assign({}, BASE, opts.ls || {});
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_vig'))return; sessionStorage.setItem('_vig','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); }catch(e){} })();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const X = { cx, pg, errs };
    await nettoyer(X);
    return X;
  };
  const nettoyer = X => X.pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; });
  const selecteur = async X => { await X.pg.evaluate(() => { goScreen('log', document.getElementById('nb-log')); renderLog(); openExPicker(); }); await X.pg.waitForTimeout(700); };
  const attendreImages = X => X.pg.evaluate(async () => { const t0 = performance.now();
    while (performance.now() - t0 < 5000) { const im = [...document.querySelectorAll('#ex-list img')]; if (im.every(i => i.complete)) return true; await new Promise(r => setTimeout(r, 100)); }
    return false; });
  // l'état des tuiles : source, chargement, tailles, recadrage (calculé depuis le rendu : lignes source masquées en haut)
  const tuiles = X => X.pg.evaluate(() => [...document.querySelectorAll('#ex-list .ex-grp-tile')].map(el => {
    const im = el.querySelector('img'), r = im ? im.getBoundingClientRect() : null, cs = im ? getComputedStyle(im) : null, tr = el.getBoundingClientRect();
    const echelle = im && im.naturalWidth ? r.width / im.naturalWidth : 0;
    return { label: (el.querySelector('.ex-grp-label') || {}).textContent || '', src: im ? im.getAttribute('src') : null,
      charge: !!(im && im.complete && im.naturalWidth > 0), nat: im ? [im.naturalWidth, im.naturalHeight] : null,
      aff: r ? [Math.round(r.width), Math.round(r.height)] : null, fit: cs ? cs.objectFit : '', pos: cs ? cs.objectPosition : '',
      // ancré en bas : les lignes source masquées sont en HAUT — leur nombre = hauteur source − hauteur affichée / échelle
      masquees: (echelle && cs && cs.objectFit === 'cover' && cs.objectPosition === '50% 100%') ? im.naturalHeight - r.height / echelle : -1,
      hTuile: Math.round(tr.height) }; }));
  const debord = X => X.pg.evaluate(() => { const l = document.getElementById('ex-list');
    return l.scrollWidth > l.clientWidth + 1 || document.documentElement.scrollWidth > window.innerWidth + 1; });
  const fermer = X => X.cx.close();

  /* ── A. LES TUILES : 8 groupes, la bonne vignette sur le bon groupe, chargée, au bon cadre ───────────── */
  for (const w of [390, 320, 430]) {
    const X = await ouvrir({ w });
    await selecteur(X); await attendreImages(X);
    const T = await tuiles(X), dep = await debord(X);
    if (w === 390) {
      t('C-VIG-A1 les 8 groupes, dans le même ordre et avec les mêmes libellés qu\'avant (aucune catégorie ajoutée ni retirée — « Corps complet » n\'en devient pas une)',
        _det(T.map(x => x.label)) === _det(LABELS), _det(T.map(x => x.label)));
      t('C-VIG-A2 ⭐⭐ chaque tuile porte SA vignette (correspondance stricte du paquet) ; Mollets garde son image — ni « Corps complet », ni une vignette d\'un autre groupe',
        _det(T.map(x => x.src)) === _det(VIG.map(v => v.src)) && !T.some(x => /corps_complet/.test(x.src || '')) && !/vignettes\//.test(T[7].src || ''),
        _det(T.map(x => x.src)));
      t('C-VIG-A3 les 8 images se chargent ; les 7 du paquet à leur taille native (183 px de large : rien n\'a été redimensionné ni remplacé)',
        T.every(x => x.charge) && T.slice(0, 7).every(x => x.nat && x.nat[0] === 183), _det(T.map(x => [x.charge, x.nat])));
      t('C-VIG-A5 ⭐⭐ le liseré du haut est MASQUÉ sur chaque vignette du paquet (lignes masquées ≥ lignes du liseré mesurées), sans étirement (cover, ancré en bas)',
        T.slice(0, 7).every((x, i) => x.fit === 'cover' && x.pos === '50% 100%' && x.masquees >= VIG[i].liseré),
        _det(T.slice(0, 7).map((x, i) => ({ fit: x.fit, pos: x.pos, masquees: Math.round(x.masquees * 10) / 10, liseré: VIG[i].liseré }))));
    }
    t('C-VIG-A4 [' + w + ' px] chaque vignette s\'affiche en 88 × 51, aucune tuile sous 44 px de haut (zone tactile), aucun débordement horizontal',
      T.length === 8 && T.every(x => x.aff && x.aff[0] === 88 && x.aff[1] === 51 && x.hTuile >= 44) && !dep && !X.errs.length,
      _det({ tailles: T.map(x => x.aff), hTuiles: T.map(x => x.hTuile), debord: dep, errs: X.errs }));
    await fermer(X);
  }

  /* ── B. UN GROUPE OUVERT : même vignette en en-tête (sans rétrécir), même « Anatomie », des exercices ────── */
  {
    const X = await ouvrir();
    await selecteur(X);
    await X.pg.evaluate(() => { window.__anat = []; const o = window.openAnatomyImg; window.openAnatomyImg = function (src, lbl) { window.__anat.push(src); }; });
    const res = [];
    for (let i = 0; i < 8; i++) {
      await X.pg.evaluate(i => { const el = document.querySelectorAll('#ex-list .ex-grp-tile')[i]; el.click(); }, i);
      await X.pg.waitForTimeout(250); await attendreImages(X);
      const r = await X.pg.evaluate(() => { const h = document.querySelector('#ex-list .ex-grp-header'), im = h && h.querySelector('img');
        const ir = im ? im.getBoundingClientRect() : null;
        // le libellé est-il À CÔTÉ de l'image (et non dessous) ? le 1ᵉʳ caractère du texte, mesuré par une plage
        let cote = false; if (h && ir) { const tn = [...h.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (tn) {
          const rg = document.createRange(); const k = tn.textContent.search(/\S/); rg.setStart(tn, k); rg.setEnd(tn, k + 1); const lr = rg.getBoundingClientRect();
          cote = lr.left >= ir.right - 1 && lr.top < ir.bottom; } }
        const anat = [...document.querySelectorAll('#ex-list button')].find(bt => /Anatomie/.test(bt.textContent));
        return { label: h ? h.textContent.trim() : '', src: im ? im.getAttribute('src') : null, aff: ir ? [Math.round(ir.width), Math.round(ir.height)] : null, cote,
          lignes: document.querySelectorAll('#ex-list .ex-pick').length, vigLignes: document.querySelectorAll('#ex-list .ex-pick img[src*="muscles/vignettes/"]').length, anat: !!anat }; });
      await X.pg.evaluate(() => { const bt = [...document.querySelectorAll('#ex-list button')].find(b => /Anatomie/.test(b.textContent)); if (bt) bt.click(); });
      res.push(r);
      await X.pg.evaluate(() => { const bk = document.querySelector('#ex-list .ex-grp-back'); if (bk) bk.click(); }); await X.pg.waitForTimeout(200);
    }
    const anat = await X.pg.evaluate(() => window.__anat);
    t('C-VIG-B1 ⭐ un groupe ouvert montre en en-tête la MÊME vignette, en 88 × 51 (elle ne rétrécit pas — rétrécie, elle laissait revoir le liseré), le libellé À CÔTÉ',
      res.every((r, i) => r.src === VIG[i].src && r.aff && r.aff[0] === 88 && r.aff[1] === 51 && r.cote && r.label === LABELS[i]),
      _det(res.map(r => ({ src: r.src, aff: r.aff, cote: r.cote, label: r.label }))));
    t('C-VIG-B2 chaque groupe liste ses exercices, et aucune ligne d\'exercice ne porte une vignette de groupe',
      res.every(r => r.lignes > 0 && r.vigLignes === 0), _det(res.map(r => [r.lignes, r.vigLignes])));
    t('C-VIG-B3 ⛔ le bouton « 🫀 Anatomie » est là sur chaque groupe et ouvre EXACTEMENT le même schéma qu\'avant',
      res.every(r => r.anat) && _det(anat) === _det(ANAT), _det(anat));
    await fermer(X);
  }

  /* ── C. LA RECHERCHE : elle trouve toujours, et ne montre jamais une vignette de groupe ───────────────── */
  {
    const X = await ouvrir();
    await selecteur(X);
    const out = [];
    for (const q of ['squat', 'curl', 'mollet', 'développé couché', 'rowing', 'gainage']) {
      await X.pg.fill('#ex-search', q); await X.pg.evaluate(() => filterEx()); await X.pg.waitForTimeout(250);
      out.push(await X.pg.evaluate(q => ({ q, n: document.querySelectorAll('#ex-list .ex-pick').length,
        tuiles: document.querySelectorAll('#ex-list .ex-grp-tile').length, vig: document.querySelectorAll('#ex-list img[src*="muscles/vignettes/"]').length }), q));
    }
    t('C-VIG-C1 la recherche trouve toujours (6 requêtes, ≥ 1 résultat chacune), sans tuile de groupe ni vignette de groupe dans ses résultats',
      out.every(o => o.n > 0 && o.tuiles === 0 && o.vig === 0), _det(out));
    await fermer(X);
  }

  /* ── D. UN EXERCICE INCONNU, ET LES AUTRES ÉCRANS ────────────────────────────────────────────────────── */
  {
    const perso = [{ n: 'Zorglub Press Inconnu', g: 'Pectoraux', custom: true }];
    const X = await ouvrir({ ls: { ft4_cuex: JSON.stringify(perso) } });
    await selecteur(X);
    await X.pg.fill('#ex-search', 'zorglub'); await X.pg.evaluate(() => filterEx()); await X.pg.waitForTimeout(250);
    const rech = await X.pg.evaluate(() => { const r = [...document.querySelectorAll('#ex-list .ex-pick')].find(e => /Zorglub/.test(e.textContent));
      return { trouve: !!r, img: r ? [...r.querySelectorAll('img')].map(i => i.getAttribute('src')) : null }; });
    await X.pg.fill('#ex-search', ''); await X.pg.evaluate(() => { _exGrp = 0; filterEx(); }); await X.pg.waitForTimeout(250);
    const grp = await X.pg.evaluate(() => { const r = [...document.querySelectorAll('#ex-list .ex-pick')].find(e => /Zorglub/.test(e.textContent));
      return { trouve: !!r, img: r ? [...r.querySelectorAll('img')].map(i => i.getAttribute('src')) : null }; });
    t('C-VIG-D1 ⭐ un exercice INCONNU (perso, nom jamais vu) ne reçoit AUCUNE illustration — ni la vignette de son groupe, ni une autre — en recherche comme dans son groupe',
      rech.trouve && grp.trouve && _det(rech.img) === '[]' && _det(grp.img) === '[]', _det({ rech, grp }));
    // une séance avec cet exercice inconnu et un connu : les écrans hors sélecteur n'affichent aucune vignette de groupe
    await X.pg.evaluate(() => { closeExPicker && closeExPicker(); S.wkt = { date: '2026-10-23', exs: [{ name: 'Zorglub Press Inconnu', sets: [{ kg: 50, reps: 8, type: 'N', done: false }] },
      { name: 'Développé Couché', sets: [{ kg: 80, reps: 5, type: 'N', done: false }] }] }; goScreen('log', document.getElementById('nb-log')); renderLog(); });
    await X.pg.waitForTimeout(300);
    const ailleurs = await X.pg.evaluate(() => [...document.querySelectorAll('img[src*="muscles/vignettes/"]')]
      .filter(i => !i.closest('#ex-list')).map(i => i.getAttribute('src')));
    const autres = [];
    for (const ec of ['home', 'progress', 'nutrition', 'setup']) {
      await X.pg.evaluate(ec => { try { goScreen(ec); } catch (e) {} }, ec); await X.pg.waitForTimeout(250);
      autres.push(...await X.pg.evaluate(() => [...document.querySelectorAll('img[src*="muscles/vignettes/"]')].filter(i => !i.closest('#ex-list')).map(i => i.getAttribute('src'))));
    }
    t('C-VIG-D2 ⛔ hors du sélecteur (séance avec un exercice inconnu et un connu, accueil, progrès, nutrition, profil), AUCUNE vignette de groupe n\'apparaît',
      !ailleurs.length && !autres.length && !X.errs.length, _det({ seance: ailleurs, autres, errs: X.errs }));
    await fermer(X);
  }

  /* ── E. HORS CONNEXION : préchargées par le vrai service worker ─────────────────────────────────────── */
  {
    const X = await ouvrir({ sw: true });
    const pret = await X.pg.evaluate(async (srcs) => { const t0 = performance.now();
      while (performance.now() - t0 < 45000) { try { const c = await caches.open('ft-images'); let ok = 0;
        for (const s of srcs) if (await c.match('./' + s) || await c.match(s)) ok++;
        if (ok === srcs.length && navigator.serviceWorker.controller) return true; } catch (e) {} await new Promise(r => setTimeout(r, 300)); }
      return false; }, VIG.slice(0, 7).map(v => v.src)).catch(() => false);
    await X.cx.setOffline(true);
    let servi = null;
    try { const rep = await X.pg.reload({ waitUntil: 'load', timeout: 15000 }); servi = !!(rep && rep.fromServiceWorker()); }
    catch (e) { servi = 'erreur ' + String(e.message || e).slice(0, 60); }
    await X.pg.waitForTimeout(1200); await nettoyer(X); await selecteur(X); await attendreImages(X);
    const T = await tuiles(X);
    t('C-VIG-E1 ⭐ hors connexion (rechargement servi par le service worker) : les 8 vignettes du sélecteur s\'affichent — les 7 nouvelles sont préchargées',
      pret === true && servi === true && T.length === 8 && T.every(x => x.charge), _det({ precharge: pret, servi, charges: T.map(x => x.charge) }));
    await fermer(X);
  }
}

/* Témoins de SOURCE : les fichiers sont ceux du paquet, et rien d'autre ne les emploie. */
function source(t, ROOT, fs, path) {
  const crypto = require('crypto');
  const lit = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const sha = f => { try { return crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, f))).digest('hex'); } catch (e) { return 'absent'; } };
  const empreintes = VIG.slice(0, 7).map(v => sha(v.src));
  t('C-VIG-S1 ⭐⭐ les 7 fichiers du dépôt sont À L\'OCTET ceux du paquet de Michel (empreintes SHA-256 de son manifeste) ; « Corps complet » n\'est pas dans le dépôt',
    empreintes.every((h, i) => h === VIG[i].sha) && !fs.existsSync(path.join(ROOT, 'muscles/vignettes/08_corps_complet.png')),
    _det(empreintes.map((h, i) => h === VIG[i].sha ? 'ok' : VIG[i].src + ' ' + h.slice(0, 12))));
  const sw = lit('sw.js');
  t('C-VIG-S2 le service worker précharge les 7 vignettes (liste PRECACHE)',
    VIG.slice(0, 7).every(v => sw.indexOf("'./" + v.src + "'") >= 0));
  // les catégories et l'anatomie : extraites du vrai `EX_GROUPS` du fichier (évalué isolément)
  const log = lit('log.js'), i0 = log.indexOf('const EX_GROUPS=['), i1 = log.indexOf('\n];', i0);
  let G = null; try { G = new Function(log.slice(i0, i1 + 3) + '\nreturn EX_GROUPS;')(); } catch (e) { G = null; }
  t('C-VIG-S3 ⛔ catégories et schémas « Anatomie » inchangés : libellés, `tags` et `anatomy` de chaque groupe identiques à avant le lot',
    !!G && _det(G.map(g => g.label)) === _det(LABELS) && _det(G.map(g => g.tags)) === _det(TAGS) && _det(G.map(g => g.anatomy)) === _det(ANAT),
    G ? _det(G.map(g => [g.label, g.tags, g.anatomy])) : 'EX_GROUPS illisible');
  const fichiers = fs.readdirSync(ROOT).filter(f => /\.(js|html|css)$/.test(f) && f !== 'sw.js');
  const emploient = fichiers.filter(f => /muscles\/vignettes\/|corps_complet/.test(lit(f)));
  const mgImg = (log.match(/const _MG_IMG=\{[\s\S]*?\n\};/) || [''])[0];
  t('C-VIG-S4 ⛔ ces vignettes ne vivent QUE dans le sélecteur : seul `log.js` (EX_GROUPS) les nomme, la table des vignettes des autres écrans (`_MG_IMG`) ne les contient pas',
    _det(emploient) === '["log.js"]' && !!mgImg && !/vignettes\/|corps_complet/.test(mgImg) && (log.match(/src="muscles\/vignettes\//g) || []).length === 7 && !/corps_complet/.test(log),
    _det({ emploient, mgImg: mgImg.length, n: (log.match(/src="muscles\/vignettes\//g) || []).length }));
}

module.exports = { ecran, source };
