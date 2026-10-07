/* ══════════════════════════════════════════════════════════════════════════════════════════
   📥 LOT 1 IMPORT PROGRAMME — client · document · identité · versionnage · bibliothèque
   (session-B · 07/10/2026, brief de Michel). Blocs B-L1-* ; témoins T-L1-01 → T-L1-15, conservation
   des champs (FC-*) et erreurs explicites (ERR-*).
   CONDUIT : les vraies fonctions de l'app — la vraie entrée de fichiers (setInputFiles), la vraie chaîne
   d'analyse avec une réponse du Worker SIMULÉE (forme exacte de `importDoc` 'program'), l'aperçu, la
   mise à jour versionnée, « Sauvegarder comme programme », la confirmation de suppression, le chargement
   d'un jour, la fin de séance, le rechargement de la page, le mode démo et l'application d'un persona.
   OBSERVE : `S.programmes`, `ft4_progs`, la base IndexedDB d'import, `S.wkt`, `S.sessions`, `S.prs`,
   les messages réellement montrés (toast), le contenu du corps envoyé au cloud (saveProfile simulé).
   ⛔ 0 appel réel (Worker et Apps Script simulés, Supabase et Anthropic coupés).
   NE COUVRE PAS : le modèle réel (ce qu'il lit d'un vrai document), le sélecteur de fichiers d'iOS
   (Photothèque / Prendre une photo / Choisir un fichier — T1 sur iPhone), le rendu pdf.js réel (simulé),
   le quota de stockage réel d'un téléphone.
   Banc : tools/banc_import_prog_lot1.js · contrôle négatif : tools/mut_import_prog_lot1.py
   ══════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-L1 (session-B). LOT 1 IMPORT PROGRAMME — identité, versionnage, document, bibliothèque ═══');
  const js = x => { try { return JSON.stringify(x).slice(0, 520); } catch (e) { return String(x); } };
  const L = (name, sets, reps, kg, note, extra) => Object.assign({ name, sets, reps, repsPerSet: [], kg, kgPerSet: [], supersetGroup: '', setType: '', note: note || '' }, extra || {});
  const PROG_V1 = { name: 'Powerbuilding test', weeks: 6, startDate: '', days: [
    { label: 'Séance 1 - Push', exercises: [L('Développé couché', 4, 6, 90, 'RIR 2'), L('Développé militaire', 3, 8, 50, '')] },
    { label: 'Séance 2 - Pull', exercises: [L('Tractions', 4, 6, 0, ''), L('Rowing barre', 3, 10, 70, '')] },
    { label: 'Séance 3 - Jambes', exercises: [L('Squat à la barre', 4, 6, 120, ''), L('Leg curl', 3, 12, 40, '')] },
  ] };
  const PROG_V2 = { name: 'Powerbuilding test', weeks: 6, startDate: '', days: [
    { label: 'Séance 1 - Push', exercises: [L('Développé couché', 5, 5, 95, 'RIR 1'), L('Développé militaire', 3, 8, 50, ''), L('Dips', 3, 10, 0, '')] },
    { label: 'Séance 2 - Pull', exercises: [L('Tractions', 4, 6, 0, ''), L('Rowing barre', 3, 10, 70, '')] },
    { label: 'Séance 3 - Jambes', exercises: [L('Squat à la barre', 5, 5, 125, '')] },
  ] };
  const PROG_AB = { name: 'Bloc AB', weeks: 4, startDate: '', days: [
    { label: 'Séance 1 - Dorsaux', exercises: [L('Tractions', 3, 8, 0, '')] },
    { label: 'Séance 1 - Biceps', exercises: [L('Curl biceps', 3, 10, 14, '')] },
    { label: 'J3 A', exercises: [L('Squat à la barre', 3, 5, 100, '')] },
    { label: 'J3 B', exercises: [L('Soulevé de terre', 3, 5, 140, '')] },
    { label: 'Jour 3 — Semaine A', exercises: [L('Développé couché', 3, 5, 85, '')] },
    { label: 'Jour 3 — Semaine B', exercises: [L('Développé incliné', 3, 8, 60, '')] },
  ] };

  /* ── Le Worker et Apps Script simulés. `cfg.mode` décide de la réponse de `importProgram`. ── */
  const cfg = { mode: 'ok', reponse: PROG_V1, appels: 0, saveProfile: [] };
  let reels = 0, enAttente = [];
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  await cx.route(/supabase\.co|anthropic\.com|cdn\.jsdelivr\.net/, r => { reels++; return r.abort(); });
  await cx.route(/workers\.dev|script\.google\.com/, async r => {
    let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
    if (c.action === 'importProgram') {
      cfg.appels++;
      cfg.dernierCorps = c;
      if (cfg.mode === 'jamais') { enAttente.push(r); return; }
      if (cfg.mode === 'erreur') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'error', error: 'Extraction échouée' }) });
      if (cfg.mode === 'vide') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: { name: 'Vide', weeks: 0, days: [] } }) });
      if (cfg.mode === 'videJours') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: { name: 'Vide', weeks: 0, days: [{ label: 'J1', exercises: [] }] } }) });
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: JSON.parse(JSON.stringify(cfg.reponse)) }) });
    }
    if (c.action === 'saveProfile') cfg.saveProfile.push(c);
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
  });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
  /* Graine : une seule fois par contexte (sessionStorage) — un rechargement ne ressème rien. */
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_l1'))return; sessionStorage.setItem('_l1','1'); localStorage.clear();
    const D={ft4_ob2:'1',ft4_name:'Testeur',ft4_premium:'true',ft4_guide_shown:'1',ft4_wn_seen:'999',ft4_email:'',ft4_ok:'0'}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  /* Les messages réellement montrés : on enveloppe `toast` (et on garde l'original). */
  const ouvrir = async () => {
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2300);
    await pg.evaluate(() => { window.__toasts = []; const o = window.toast; window.toast = function (m, ty) { window.__toasts.push(String(m)); try { return o.apply(this, arguments); } catch (e) {} }; S.premium = true; });
  };
  const recharger = async () => { await pg.reload(); await pg.waitForTimeout(2300);
    await pg.evaluate(() => { window.__toasts = []; const o = window.toast; window.toast = function (m, ty) { window.__toasts.push(String(m)); try { return o.apply(this, arguments); } catch (e) {} }; S.premium = true; }); };
  await ouvrir();
  const idbDocs = () => pg.evaluate(() => new Promise(res => {
    try {
      const rq = indexedDB.open('ft_import');
      rq.onupgradeneeded = () => { try { rq.transaction.abort(); } catch (e) {} res({ absent: true, n: 0, docs: [] }); };
      rq.onerror = () => res({ absent: true, n: 0, docs: [] });
      rq.onsuccess = () => { const db = rq.result;
        if (!db.objectStoreNames.contains('docs')) { db.close(); return res({ absent: true, n: 0, docs: [] }); }
        const g = db.transaction('docs', 'readonly').objectStore('docs').getAll();
        g.onsuccess = () => { const all = g.result || []; db.close(); res({ absent: false, n: all.length, docs: all.map(d => ({ id: d.id, etat: d.state, pages: (d.pages || []).length, hash: d.docHash || null, progId: d.progId || null })) }); };
        g.onerror = () => { db.close(); res({ absent: true, n: 0, docs: [] }); };
      };
    } catch (e) { res({ absent: true, n: 0, docs: [], err: String(e) }); }
  }));
  /* Images de test fabriquées par le navigateur lui-même (PNG réels, couleurs distinctes). */
  const images = await pg.evaluate(() => ['#d33', '#3a3', '#33d', '#cc3', '#3cc', '#c3c', '#999', '#f80', '#08f', '#555'].map((c, i) => {
    const cv = document.createElement('canvas'); cv.width = 300 + i * 7; cv.height = 180 + i * 3; const x = cv.getContext('2d');
    x.fillStyle = c; x.fillRect(0, 0, cv.width, cv.height); x.fillStyle = '#fff'; x.font = '40px sans-serif'; x.fillText('Page ' + (i + 1), 20, 90);
    return cv.toDataURL('image/png').split(',')[1]; }));
  const fichier = (i, nom) => ({ name: nom || ('page' + (i + 1) + '.png'), mimeType: 'image/png', buffer: Buffer.from(images[i], 'base64') });
  const ajouter = async (fs_) => {
    const sel = '#imp-add-inp';
    const ok = await pg.evaluate(s => !!document.querySelector(s), sel);
    if (!ok) return { pasDEntree: true };
    await pg.setInputFiles(sel, fs_); await pg.waitForTimeout(900);
    return { pasDEntree: false };
  };

  /* ════════ T-L1-04 / T-L1-12 / T-L1-14 / T-L1-15 — MIGRATION TECHNIQUE et ANCIENS FORMATS ════════ */
  const ANCIENS = [
    { name: 'Plat sans id', exs: [{ name: 'Développé couché', sets: [{ kg: 80, reps: 8, type: 'N', rest: 120 }, { kg: '82,5', reps: '6', type: 'N' }] }] },
    { id: 'pOld2', name: 'Multi ancien', weeks: '6', startDate: '2026-09-01', days: [{ label: 'Jour 1', exs: [{ name: 'Squat', sets: [{ kg: 100, reps: '5' }], note: 'tempo 3-1-1' }] }, { label: 'Jour 2', exs: [{ name: 'Rowing Hammer', sets: [{ kg: 60, reps: 10, maxi: true }] }] }], foo: { bar: 1 } },
    { id: 'pForce', name: 'Programme Force', force: true, days: [{ label: 'Jour 1', exs: [{ name: 'Soulevé de terre', sets: [{ kg: 150, reps: 3, type: 'W', rest: 180 }] }] }], weeks: 8 },
    { name: 'Premiers pas', beginner: true, exs: [{ name: 'Presse à cuisses', sets: [{ kg: 60, reps: 12 }] }], champInconnu: [1, 2, 3] },
  ];
  const M = await pg.evaluate(async (A) => {
   try {
    const o = {};
    localStorage.setItem('ft4_progs', JSON.stringify(A));
    const brut = localStorage.getItem('ft4_progs');
    o.empreinteAvant = A.map(p => JSON.stringify(p));
    load();
    o.disqueIntactApresLoad = localStorage.getItem('ft4_progs') === brut;   // pas d'écriture au simple chargement
    o.progs = S.programmes.map(p => ({ id: p.id, schema: p.schema, version: p.version, origine: p.origin && p.origin.type, name: p.name }));
    const meta = ['schema', 'status', 'version', 'versionAt', 'versionReason', 'origin', 'editedSinceImport', 'previousVersions', 'activeAt', 'archivedAt', 'id'];
    const contenu = p => { const c = JSON.parse(JSON.stringify(p)); meta.forEach(k => delete c[k]); return JSON.stringify(c); };
    o.contenuIdentique = S.programmes.every((p, i) => { const a = JSON.parse(o.empreinteAvant[i]); meta.forEach(k => delete a[k]); return contenu(p) === JSON.stringify(a); });
    const ids1 = S.programmes.map(p => p.id).join(',');
    if (typeof _progMigrerTous === 'function') _progMigrerTous();
    o.idempotent = S.programmes.map(p => p.id).join(',') === ids1 && S.programmes.every(p => p.schema === 1 && p.version === 1);
    persist();
    const relu = JSON.parse(localStorage.getItem('ft4_progs'));
    o.idsPersistes = relu.map(p => p.id);
    o.foo = relu[1] && relu[1].foo; o.champInconnu = relu[3] && relu[3].champInconnu; o.noteGardee = relu[1] && relu[1].days[0].exs[0].note;
    // T-L1-14 : chaque ancien format reste chargeable (plat ET jours)
    S.wkt = null; loadProg(0); o.platCharge = !!(S.wkt && S.wkt.exs && S.wkt.exs.length === 1 && S.wkt.exs[0].sets.length === 2);
    S.wkt = null; _loadProgDayVraiment(1, 1); o.jourCharge = !!(S.wkt && S.wkt.exs && S.wkt.exs[0].name === 'Rowing Hammer' && S.wkt.exs[0].sets[0].maxi === true);
    S.wkt = null; persist();
    return o;
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  }, ANCIENS);
  t('T-L1-04 ⛔ migration technique : tout programme a un id stable, schema 1, version 1 (dont les anciens SANS id)',
    (M.progs || []).length === 4 && M.progs.every(p => typeof p.id === 'string' && p.id.length > 2 && p.schema === 1 && p.version === 1), js(M.progs));
  t('T-L1-04b origine déduite UNIQUEMENT d\'un signal fiable : force → milo, beginner → generator, sinon unknown',
    (M.progs || [])[3] && M.progs[0].origine === 'unknown' && M.progs[1].origine === 'unknown' && M.progs[2].origine === 'milo' && M.progs[3].origine === 'generator', js((M.progs || []).map(p => p.origine)));
  t('T-L1-04c migration idempotente et SANS écriture disque au simple chargement (ft4_progs inchangé tant qu\'aucun persist naturel)',
    M.idempotent === true && M.disqueIntactApresLoad === true, js({ i: M.idempotent, d: M.disqueIntactApresLoad }));
  t('T-L1-12 ⛔⛔ contenu métier IDENTIQUE avant/après migration (empreinte hors métadonnées), id existant gardé tel quel',
    M.contenuIdentique === true && (M.idsPersistes || [])[1] === 'pOld2', js({ c: M.contenuIdentique, ids: M.idsPersistes }));
  t('T-L1-14 anciens formats toujours chargeables (programme à plat ET jour d\'un programme à jours, champs historiques tolérés)',
    M.platCharge === true && M.jourCharge === true, js({ plat: M.platCharge, jour: M.jourCharge }));
  t('T-L1-15 ⛔ champs inconnus conservés (programme, note d\'exercice) après migration + persist + relecture',
    M.foo && M.foo.bar === 1 && Array.isArray(M.champInconnu) && M.champInconnu.length === 3 && M.noteGardee === 'tempo 3-1-1', js({ foo: M.foo, ci: M.champInconnu, n: M.noteGardee }));

  /* ════════ T-L1-01 / T-L1-13 — « SAUVEGARDER COMME PROGRAMME » : JAMAIS D'ÉCRASEMENT PAR NOM ════════ */
  const SAP = await pg.evaluate(() => {
   try {
    const o = {};
    S.programmes = [{ id: 'pBlocX', name: 'Bloc X', weeks: 6, startDate: '2026-10-01', days: [
      { label: 'Jour 1', exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, type: 'N' }] }] },
      { label: 'Jour 2', exs: [{ name: 'Développé couché', sets: [{ kg: 80, reps: 5, type: 'N' }] }] },
      { label: 'Jour 3', exs: [{ name: 'Soulevé de terre', sets: [{ kg: 140, reps: 3, type: 'N' }] }] }] }];
    if (typeof _progMigrerTous === 'function') _progMigrerTous();
    persist();
    S.wkt = { date: today(), exs: [{ name: 'Curl biceps', sets: [{ kg: 14, reps: 10, type: 'N', done: false }] }, { name: 'Dips', sets: [{ kg: 0, reps: 10, type: 'N', done: false }] }] };
    openProgModal();
    document.getElementById('prog-name-inp').value = 'bloc x';
    saveAsProg();
    const bx = S.programmes.find(p => p.id === 'pBlocX');
    o.blocIntact = !!(bx && Array.isArray(bx.days) && bx.days.length === 3 && bx.weeks === 6 && bx.startDate === '2026-10-01' && !bx.exs);
    o.nbApresClic = S.programmes.length;
    o.choixOuvert = !!document.querySelector('#ov-prog-cible.open');
    /* ⛔ VU SUR CAPTURE : la question s'ouvrait DERRIÈRE « Mes Programmes ». On regarde ce qui est AU PREMIER PLAN. */
    { const el = document.elementFromPoint(195, 600); o.choixAuPremierPlan = !!(el && el.closest && el.closest('#ov-prog-cible')); }
    o.cibleMultiProposee = !!document.querySelector('#ov-prog-cible.open [data-cible="pBlocX"]');
    o.texteChoix = (document.querySelector('#ov-prog-cible') || {}).innerText || '';
    const nouveau = document.querySelector('#ov-prog-cible.open [data-cible="__nouveau"]');
    if (nouveau) nouveau.click();
    o.nbApresNouveau = S.programmes.length;
    const cree = S.programmes.find(p => p.id !== 'pBlocX');
    o.creeOrigine = cree && cree.origin && cree.origin.type;
    o.creeExs = cree && cree.exs && cree.exs.length;
    o.blocIntactApres = !!(S.programmes.find(p => p.id === 'pBlocX') || {}).days;
    // Cible PLATE de même nom : la mise à jour n'existe que si on la CHOISIT, et elle est versionnée.
    const plat = cree;
    S.wkt.exs.push({ name: 'Écarté poulie', sets: [{ kg: 15, reps: 12, type: 'N', done: false }] });
    document.getElementById('prog-name-inp').value = 'BLOC X';
    saveAsProg();
    o.nbAvantChoix2 = S.programmes.length;
    const btnMaj = plat ? document.querySelector('#ov-prog-cible.open [data-cible="' + plat.id + '"]') : null;
    o.majProposee = !!btnMaj;
    if (btnMaj) btnMaj.click();
    const plat2 = S.programmes.find(p => plat && p.id === plat.id);
    o.majVersion = plat2 && plat2.version; o.majExs = plat2 && plat2.exs && plat2.exs.length;
    o.majPrecedente = plat2 && (plat2.previousVersions || []).length && plat2.previousVersions[plat2.previousVersions.length - 1].content.exs.length;
    o.nbFinal = S.programmes.length;
    o.blocToujoursIntact = !!(S.programmes.find(p => p.id === 'pBlocX') || {}).days;
    try { document.querySelectorAll('.overlay.open').forEach(x => x.classList.remove('open')); } catch (e) {}
    S.wkt = null; persist();
    return o;
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  t('T-L1-01 ⛔⛔ « Bloc X » (3 jours, 6 semaines) + « bloc x » sauvegardé depuis une séance : le programme multi-jours n\'est NI détruit NI aplati',
    SAP.blocIntact === true && SAP.nbApresClic === 1, js(SAP));
  t('T-L1-01b le même nom ouvre un CHOIX explicite, VISIBLE au premier plan ; un programme à jours n\'est jamais proposé comme cible d\'une séance à plat',
    SAP.choixOuvert === true && SAP.choixAuPremierPlan === true && SAP.cibleMultiProposee === false && /Bloc X/.test(SAP.texteChoix || ''), js({ ouvert: SAP.choixOuvert, premierPlan: SAP.choixAuPremierPlan, multi: SAP.cibleMultiProposee, txt: String(SAP.texteChoix || '').slice(0, 200) }));
  t('T-L1-01c « Créer un nouveau programme » ajoute un programme (origine session), l\'ancien reste intact',
    SAP.nbApresNouveau === 2 && SAP.creeOrigine === 'session' && SAP.creeExs === 2 && SAP.blocIntactApres === true, js(SAP));
  t('T-L1-13 ⛔ deux programmes de même nom : aucun écrasement automatique ; la mise à jour d\'une cible PLATE n\'a lieu que si on la choisit, et elle est versionnée (v2, v1 gardée)',
    SAP.nbAvantChoix2 === 2 && SAP.majProposee === true && SAP.majVersion === 2 && SAP.majExs === 3 && SAP.majPrecedente === 2 && SAP.nbFinal === 2 && SAP.blocToujoursIntact === true, js(SAP));

  /* ════════ T-L1-02 / T-L1-03 — SUPPRESSION CONFIRMÉE, IDENTITÉ PAR ID (même nom, liste qui bouge) ════════ */
  const DEL = await pg.evaluate(() => {
   try {
    const o = {};
    S.sessions = [{ id: 1, ts: 1, date: '2026-10-01', exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }], progLabel: 'Push' }];
    S.prs = { Squat: { kg: 100, reps: 5, rm1: 112.5, date: '2026-10-01' } };
    S.programmes = [{ id: 'pA', name: 'Push', exs: [{ name: 'Développé couché', sets: [{ kg: 80, reps: 8 }] }] }, { id: 'pB', name: 'Push', exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5 }] }] }];
    if (typeof _progMigrerTous === 'function') _progMigrerTous();
    persist(); openProgModal();
    const cartes = [...document.querySelectorAll('#prog-list-modal .prog-card')];
    const btnDel = cartes[1] ? [...cartes[1].querySelectorAll('button')].find(x => /deleteProg/.test(x.getAttribute('onclick') || '')) : null;
    o.btnDelTrouve = !!btnDel;
    if (btnDel) btnDel.click();
    o.apresUnTap = S.programmes.map(p => p.id).join(',');
    o.confirmOuverte = !!document.querySelector('#ov-confirm.open');
    // La liste BOUGE pendant que la question est posée (une synchro, un autre onglet) :
    S.programmes.unshift({ id: 'pZ', name: 'Inséré', exs: [] });
    if (typeof confirmOk === 'function' && o.confirmOuverte) confirmOk();
    o.apresConfirm = S.programmes.map(p => p.id).join(',');
    o.seancesIntactes = S.sessions.length === 1 && S.sessions[0].exs[0].sets[0].kg === 100;
    o.prIntact = !!(S.prs.Squat && S.prs.Squat.rm1 === 112.5);
    // Édition : on ouvre pA (2ᵉ ligne maintenant), la liste bouge, on enregistre → c'est pA qui change.
    const idxA = S.programmes.findIndex(p => p.id === 'pA');
    editProg(idxA);
    S.programmes.splice(0, 1);                       // pZ disparaît pendant l'édition
    const ni = document.getElementById('prog-edit-name'); if (ni) ni.value = 'Push modifié';
    saveProgEdit();
    o.apresEdition = S.programmes.map(p => p.id + ':' + p.name).join(',');
    try { document.querySelectorAll('.overlay.open').forEach(x => x.classList.remove('open')); } catch (e) {}
    return o;
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  t('T-L1-02 ⛔⛔ supprimer un programme en un seul tap est impossible : la question est posée, rien n\'est supprimé avant la réponse',
    DEL.btnDelTrouve === true && DEL.apresUnTap === 'pA,pB' && DEL.confirmOuverte === true, js(DEL));
  t('T-L1-03 ⛔⛔ identité par id : même nom, liste qui bouge pendant la question → c\'est pB qui part, pas l\'élément qui a pris son index',
    DEL.apresConfirm === 'pZ,pA', js(DEL));
  t('T-L1-02b la suppression ne touche ni aux séances passées ni aux records', DEL.seancesIntactes === true && DEL.prIntact === true, js(DEL));
  t('T-L1-03b édition par id : la liste change pendant l\'édition, c\'est bien le programme ouvert qui est enregistré (aucun autre écrasé)',
    DEL.apresEdition === 'pA:Push modifié', js(DEL));

  /* ════════ T-L1-07 — VARIANTES A/B JAMAIS FUSIONNÉES PAR LEUR NUMÉRO ════════ */
  cfg.reponse = PROG_AB;
  const AB2 = await pg.evaluate(async () => {
   try {
    impRecommencer(true);
    _impPhotos = [{ type: 'text/plain', data: 'programme AB', name: 'ab.txt', isText: true }]; _impExtracted = null; _impMode = 'new'; S.premium = true;   // le quota gratuit n'est pas l'objet ici (ERR-05+)
    await analyzeImportPhotos();
    return { labels: ((_impExtracted || {}).days || []).map(d => d.label) };
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  cfg.reponse = PROG_V1;
  t('T-L1-07 ⛔⛔ « J3 A / J3 B » et « Jour 3 — Semaine A / B » restent quatre jours, libellés intacts (aucun croisement, aucune fusion)',
    (AB2.labels || []).filter(l => /J3 A|J3 B|Semaine A|Semaine B/.test(l)).length === 4 && (AB2.labels || []).indexOf('J3 A') >= 0 && (AB2.labels || []).indexOf('Jour 3 — Semaine B') >= 0, js(AB2));
  t('T-L1-07b non-régression : « Séance 1 - Dorsaux » + « Séance 1 - Biceps » (sections d\'une même séance) restent fusionnées',
    (AB2.labels || []).filter(l => /^S[ée]ance 1/.test(l)).length === 1, js(AB2));

  /* ════════ T-L1-13b — À L'IMPORT, LE MÊME NOM NE CHOISIT JAMAIS UNE CIBLE ════════ */
  cfg.reponse = PROG_V1; cfg.mode = 'ok';
  const NOM = await pg.evaluate(async () => {
   try {
    S.programmes = [{ id: 'pN1', name: 'Powerbuilding test', weeks: 6, days: [{ label: 'J1', exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5 }] }] }] },
                    { id: 'pN2', name: 'Powerbuilding test', exs: [{ name: 'Dips', sets: [{ kg: 0, reps: 10 }] }] }];
    persist(); impRecommencer(true);
    _impPhotos = [{ type: 'text/plain', data: 'meme nom', name: 'n.txt', isText: true }]; _impExtracted = null; S.premium = true;
    await analyzeImportPhotos();
    const o = { mode: _impMode, cible: _impCibleId, avert: ((document.getElementById('imp-cible') || {}).innerText || '') };
    _setImpMode('update');
    o.modeApres = _impMode; o.cibleApres = _impCibleId;
    o.candidats = [...document.querySelectorAll('#imp-cible [data-cible-imp]')].map(x => x.getAttribute('data-cible-imp'));
    o.distinctifs = [...document.querySelectorAll('#imp-cible [data-cible-imp]')].map(x => x.innerText.replace(/\s+/g, ' ').slice(0, 90));
    const avant = JSON.stringify(S.programmes);
    finalImportProg();
    o.refusSansCible = JSON.stringify(S.programmes) === avant;
    impRecommencer(true); try { closeImportProg(); } catch (e) {}
    S.programmes = []; persist();
    return o;
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  t('T-L1-13b ⛔⛔ import d\'un programme qui porte le nom de DEUX programmes existants : aucune cible choisie (mode nouveau), un avertissement est montré',
    NOM.mode === 'new' && NOM.cible === null && /déjà ce nom|porte/i.test(NOM.avert || ''), js(NOM));
  t('T-L1-13c en « Mettre à jour », les deux homonymes sont proposés avec ce qui les distingue, AUCUN n\'est présélectionné, et sans choix rien n\'est écrit',
    NOM.modeApres === 'update' && NOM.cibleApres === null && js((NOM.candidats || []).slice().sort()) === js(['pN1', 'pN2']) && (NOM.distinctifs || []).every(x => /v1/.test(x)) && NOM.refusSansCible === true, js(NOM));

  /* ════════ T-L1-05 / T-L1-06 — VERSIONNAGE et LIEN SÉANCE → VERSION ════════ */
  cfg.reponse = PROG_V1; cfg.mode = 'ok';
  const V = await pg.evaluate(async () => {
   try {
    const o = {};
    S.programmes = []; S.sessions = []; S.prs = {}; S.wkt = null; persist();
    impRecommencer(true);
    _impPhotos = [{ type: 'text/plain', data: 'v1', name: 'v1.txt', isText: true }]; _impExtracted = null; _impMode = 'new'; S.premium = true;   // le quota gratuit n'est pas l'objet ici (ERR-05+)
    await analyzeImportPhotos();
    finalImportProg();
    const p = S.programmes[S.programmes.length - 1];
    o.id = p && p.id; o.v1 = p && p.version; o.origine = p && p.origin && p.origin.type;
    // Séance sur la v1 (jour 1)
    S.wkt = null; loadProgDay(p.id, 0);
    o.refWkt = S.wkt && S.wkt.progRef ? JSON.parse(JSON.stringify(S.wkt.progRef)) : null;
    S.wkt.exs.forEach(e => e.sets.forEach(s => { s.done = true; }));
    S.connected = false; await finishWorkout();
    const sv1 = S.sessions[0]; o.refSeance1 = sv1 && sv1.progRef ? JSON.parse(JSON.stringify(sv1.progRef)) : null;
    o.empreinteSeance1 = JSON.stringify(sv1);
    try { document.querySelectorAll('.overlay.open').forEach(x => x.classList.remove('open')); } catch (e) {}
    return o;
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  /* CORPS-01 — ce qui part RÉELLEMENT au Worker. Écrit le 07/10 quand le témoin de source CCLXII (runner) a rougi :
     il épinglait `images:_impPhotos` alors que l'app envoie maintenant `_impPagesPourEnvoi()` (pages normalisées).
     La garantie de CCLXII — le catalogue part avec l'import — se prouve mieux en lisant le corps envoyé. */
  const corpsV1 = cfg.dernierCorps ? JSON.parse(JSON.stringify(cfg.dernierCorps)) : null;
  t('CORPS-01 le corps envoyé au Worker porte le CATALOGUE (liste non vide) et les pages du document, sans les champs internes (empreinte, rotation)',
    !!corpsV1 && corpsV1.action === 'importProgram' && Array.isArray(corpsV1.catalogue) && corpsV1.catalogue.length > 50
    && Array.isArray(corpsV1.images) && corpsV1.images.length === 1 && corpsV1.images[0].data === 'v1' && corpsV1.images[0].isText === true
    && !('hash' in corpsV1.images[0]) && !('rot' in corpsV1.images[0]),
    js(corpsV1 && { action: corpsV1.action, nCat: (corpsV1.catalogue || []).length, images: corpsV1.images }));
  cfg.reponse = PROG_V2;
  const V2 = await pg.evaluate(async (id) => {
   try {
    const o = {};
    impRecommencer(true);
    _impPhotos = [{ type: 'text/plain', data: 'v2', name: 'v2.txt', isText: true }]; _impExtracted = null; S.premium = true;
    await analyzeImportPhotos();
    if (typeof _setImpMode === 'function') _setImpMode('update');
    if (typeof _impChoisirCible === 'function') _impChoisirCible(id);
    o.avantApres = ((document.getElementById('imp-diff') || {}).innerText || '');
    o.msgs = (window.__toasts || []).slice(-4); o.extrait = !!_impExtracted; o.prem = S.premium; o.imports = S.progImports;
    finalImportProg();
    const p = S.programmes.find(x => x.id === id);
    o.nb = S.programmes.length; o.memeId = !!p; o.v = p && p.version;
    o.prec = p && (p.previousVersions || []).map(x => x.version + ':' + x.reason);
    o.precContenuJours = p && p.previousVersions && p.previousVersions[0] && p.previousVersions[0].content.days[2].exs.length;
    o.courantJours3 = p && p.days[2].exs.length;
    o.cmp = typeof _progComparer === 'function' && p && p.previousVersions ? _progComparer(p.previousVersions[0].content, _progContenu(p)) : null;
    // Nouvelle séance → v2
    S.wkt = null; loadProgDay(id, 0);
    o.refWkt2 = S.wkt && S.wkt.progRef ? S.wkt.progRef.version : null;
    S.wkt.exs.forEach(e => e.sets.forEach(s => { s.done = true; }));
    S.connected = false; await finishWorkout();
    o.refSeanceNouvelle = S.sessions[0] && S.sessions[0].progRef ? S.sessions[0].progRef.version : null;
    // Restauration de la v1 : nouvelle version, la v2 reste accessible
    if (typeof _progRestaurerVersion === 'function') _progRestaurerVersion(id, 1);
    const q = S.programmes.find(x => x.id === id);
    o.apresRestau = q && q.version; o.raisonRestau = q && q.versionReason;
    o.precApresRestau = q && (q.previousVersions || []).map(x => x.version);
    o.contenuRestaure = q && q.days[2].exs.length;
    try { document.querySelectorAll('.overlay.open').forEach(x => x.classList.remove('open')); } catch (e) {}
    return o;
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  }, V.id);
  const V3 = await pg.evaluate((args) => {
   try {
    const s1 = S.sessions.find(s => s.progRef && s.progRef.version === 1);
    return { seanceV1Intacte: !!s1 && JSON.stringify(s1) === args.emp, nbSeances: S.sessions.length };
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  }, { emp: V.empreinteSeance1 });
  t('T-L1-05 ⛔⛔ import v1 → mise à jour EXPLICITE : même id, version 2, v1 gardée dans les versions précédentes (contenu intact)',
    V.v1 === 1 && V.origine === 'import' && V2.nb === 1 && V2.memeId === true && V2.v === 2 && js(V2.prec) === js(['1:import']) && V2.precContenuJours === 2 && V2.courantJours3 === 1, js({ V, V2 }));
  t('T-L1-05b l\'Avant / Après est montré avant d\'appliquer, et la comparaison dit ce qui change',
    /v1|Avant/i.test(V2.avantApres || '') && /v2|Après/i.test(V2.avantApres || '') && !!V2.cmp && (V2.cmp.exercicesAjoutes || []).some(n => /dips/i.test(n)) && (V2.cmp.exercicesRetires || []).some(n => /leg curl/i.test(n)), js({ diff: String(V2.avantApres || '').slice(0, 240), cmp: V2.cmp }));
  t('T-L1-05c restaurer la v1 crée une NOUVELLE version (v3, raison restore) ; la v2 reste accessible',
    V2.apresRestau === 3 && V2.raisonRestau === 'restore' && js(V2.precApresRestau) === js([1, 2]) && V2.contenuRestaure === 2, js(V2));
  t('T-L1-06 ⛔⛔ progRef : séance chargée depuis la v1 → {id, version 1, jour} sur S.wkt PUIS sur la séance enregistrée',
    !!V.refWkt && V.refWkt.id === V.id && V.refWkt.version === 1 && V.refWkt.day && V.refWkt.day.index === 0 && !!V.refSeance1 && V.refSeance1.version === 1, js(V));
  t('T-L1-06b nouvelle séance après la v2 → progRef v2 ; la séance passée v1 reste OCTET POUR OCTET intacte (mise à jour puis restauration)',
    V2.refWkt2 === 2 && V2.refSeanceNouvelle === 2 && V3.seanceV1Intacte === true && V3.nbSeances === 2, js({ V2, V3 }));

  /* ════════ EC-01 → EC-04 — PROGRAMME « EN COURS » (D-053) ════════
     Ajoutés après le contrôle négatif : la mutation M20 (« plusieurs programmes peuvent être en cours ») n'avait
     rougi AUCUN témoin — FC-03 vérifiait l'unicité avec un seul programme actif possible. Ce bloc la vérifie là où
     elle peut casser : un 2ᵉ programme passé en cours, la case par défaut d'un import, et le chargement d'un jour. */
  cfg.reponse = PROG_V1; cfg.mode = 'ok';
  const EC = await pg.evaluate(async () => {
   try {
    const o = {};
    const actifs = () => S.programmes.filter(x => x && x.status === 'active').map(x => x.id);
    const scan = async (data) => { impRecommencer(true); _impPhotos = [{ type: 'text/plain', data: data, name: data + '.txt', isText: true }]; _impExtracted = null; _impMode = 'new'; S.premium = true; await analyzeImportPhotos(); };
    // ⛔ Le bloc FC qui suit relit les programmes versionnés du bloc précédent : on les remet à la fin.
    const sauveProgs = JSON.stringify(S.programmes || []), sauveSeances = JSON.stringify(S.sessions || []);
    S.programmes = []; S.sessions = []; S.wkt = null; persist();
    const A = _progNouveau({ name: 'Plat A', exs: [{ name: 'Développé Couché', sets: [{ kg: 60, reps: 8, type: 'N' }] }] }, 'manual', 'manual', null); S.programmes.push(A);
    const B = _progNouveau({ name: 'Plat B', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 80, reps: 5, type: 'N' }] }] }, 'manual', 'manual', null); S.programmes.push(B);
    _progDefinirEnCours(A.id); o.unA = actifs();
    _progDefinirEnCours(B.id); o.unB = actifs(); o.statutA = S.programmes.find(x => x.id === A.id).status;
    _progDefinirEnCours(null); o.aucun = actifs();
    // Case par défaut : aucun en cours → cochée ; décochée à la main ; NOUVEAU scan → de nouveau cochée (le choix d'avant ne colle pas)
    await scan('ec1');
    const ec = document.getElementById('imp-en-cours');
    o.coche1 = !!(ec && ec.checked);
    if (ec) { ec.checked = false; ec.dispatchEvent(new Event('change')); }
    await scan('ec2');
    o.coche2 = !!(ec && ec.checked);
    finalImportProg();
    const C = S.programmes[S.programmes.length - 1];
    o.apresImport = actifs(); o.idC = C && C.id;
    // Un programme est en cours → la case d'un nouvel import est décochée, et l'import ne vole pas le statut
    await scan('ec3');
    o.coche3 = !!(ec && ec.checked);
    finalImportProg();
    const D = S.programmes[S.programmes.length - 1];
    o.apresImport2 = actifs(); o.statutD = D && D.status;
    // Charger un jour (programme NON en cours) ou un programme à plat ne change JAMAIS le statut
    const avant = JSON.stringify(S.programmes.map(x => [x.id, x.status]));
    S.wkt = null; loadProgDay(D.id, 0); o.chargeD = !!(S.wkt && S.wkt.exs && S.wkt.exs.length);
    S.wkt = null; loadProg(A.id); o.chargeA = !!(S.wkt && S.wkt.exs && S.wkt.exs.length);
    o.statutsInchanges = JSON.stringify(S.programmes.map(x => [x.id, x.status])) === avant;
    S.wkt = null;
    try { document.querySelectorAll('.overlay.open').forEach(x => x.classList.remove('open')); } catch (e) {}
    o.A = A.id; o.B = B.id;
    S.programmes = JSON.parse(sauveProgs); S.sessions = JSON.parse(sauveSeances); persist();
    return o;
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  t('EC-01 ⛔⛔ 0 ou 1 programme « en cours » : passer B en cours retire A ; « aucun » est possible',
    js(EC.unA) === js([EC.A]) && js(EC.unB) === js([EC.B]) && EC.statutA === 'available' && js(EC.aucun) === js([]), js(EC));
  t('EC-02 import sans programme en cours : la case « en cours » est cochée par défaut, et un choix manuel ne colle PAS au scan suivant',
    EC.coche1 === true && EC.coche2 === true && js(EC.apresImport) === js([EC.idC]), js(EC));
  t('EC-03 import alors qu\'un programme est en cours : case décochée par défaut, le nouveau reste disponible, l\'ancien reste en cours',
    EC.coche3 === false && js(EC.apresImport2) === js([EC.idC]) && EC.statutD === 'available', js(EC));
  t('EC-04 charger un jour ou un programme à plat ne change JAMAIS le statut d\'aucun programme',
    EC.chargeD === true && EC.chargeA === true && EC.statutsInchanges === true, js(EC));

  /* ════════ T-L1-08 / T-L1-09 — DOCUMENT D'IMPORT LOCAL : pages, ordre, rotation, retrait, doublon, reprise ════════ */
  await pg.evaluate(async () => { impRecommencer(true); try { closeImportProg(); } catch (e) {} openImportProg(); await new Promise(r => setTimeout(r, 900));
    const bd = document.getElementById('imp-reprise'); if (bd && bd.style.display === 'flex' && bd.querySelector('[data-reset]')) bd.querySelector('[data-reset]').click();
    await new Promise(r => setTimeout(r, 300)); });
  const a1 = await ajouter([fichier(0), fichier(1), fichier(2)]);
  const P1 = await pg.evaluate(() => ({ n: (_impPhotos || []).length, dims: (_impPhotos || []).map(p => (p.w || 0) + 'x' + (p.h || 0)), hashes: (_impPhotos || []).map(p => p.hash || null), nums: [...document.querySelectorAll('#imp-thumbs .imp-page-num')].map(x => x.textContent.trim()) }));
  await pg.evaluate(() => { if (typeof impPageDeplacer === 'function') impPageDeplacer(2, -1); });
  await pg.evaluate(() => { if (typeof impPageTourner === 'function') return impPageTourner(0); });
  await pg.waitForTimeout(500);
  const P2 = await pg.evaluate(() => ({ ordre: (_impPhotos || []).map(p => p.hash || null), dims0: (_impPhotos[0] && (_impPhotos[0].w + 'x' + _impPhotos[0].h)), rot0: _impPhotos[0] && _impPhotos[0].rot }));
  await pg.evaluate(() => { removeImpPhoto(1); });
  await pg.waitForTimeout(300);
  const nAvantDoublon = await pg.evaluate(() => (_impPhotos || []).length);
  await pg.evaluate(() => { window.__toasts = []; });
  await ajouter([fichier(0, 'encore.png')]);
  const P3 = await pg.evaluate(() => ({ n: (_impPhotos || []).length, msgs: window.__toasts.slice() }));
  await pg.waitForTimeout(600);
  const docsAvantReload = await idbDocs();
  await recharger();
  const R8 = await pg.evaluate(async () => {
   try {
    openImportProg(); await new Promise(r => setTimeout(r, 900));
    const bd = document.getElementById('imp-reprise');
    return { n: (_impPhotos || []).length, hashes: (_impPhotos || []).map(p => p.hash || null), bandeau: !!bd && bd.style.display === 'flex', etape2: (document.getElementById('imp-s2') || {}).style && document.getElementById('imp-s2').style.display !== 'none' };
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  t('T-L1-09 pages ajoutées par la VRAIE entrée unique (#imp-add-inp), numérotées dans l\'ordre, avec une empreinte SHA-256 chacune',
    a1.pasDEntree === false && P1.n === 3 && (P1.hashes || []).every(h => typeof h === 'string' && h.length === 64) && js(P1.nums) === js(['1', '2', '3']), js({ a1, P1 }));
  t('T-L1-09b réorganisation (3ᵉ page remontée) et rotation de 90° (largeur ↔ hauteur)',
    !!P1.hashes[2] && P2.ordre[1] === P1.hashes[2] && P2.ordre[2] === P1.hashes[1] && P2.rot0 === 90 && P2.dims0 === String(P1.dims[0] || '').split('x').reverse().join('x'), js({ P1, P2 }));
  t('T-L1-09c retrait d\'une page ; un DOUBLON exact est refusé avec un message (rien d\'ajouté)',
    nAvantDoublon === 2 && P3.n === 2 && (P3.msgs || []).some(m => /déjà/i.test(m)), js({ nAvantDoublon, P3 }));
  t('T-L1-08 ⛔⛔ brouillon d\'import repris APRÈS rechargement de la page : mêmes pages, même ordre, bandeau de reprise',
    docsAvantReload.n >= 1 && R8.n === 2 && !!(R8.hashes || [])[0] && R8.hashes[0] === P2.ordre[0] && R8.hashes[1] === P2.ordre[2] && R8.bandeau === true, js({ docsAvantReload, R8 }));

  /* ════════ ERR-* — ERREURS JAMAIS SILENCIEUSES ════════ */
  // Limite explicite : 8 pages ; au-delà, REFUS (rien d'ajouté), jamais de troncature.
  await pg.evaluate(() => { window.__toasts = []; });
  await ajouter([3, 4, 5, 6, 7, 8, 9].map(i => fichier(i)));
  const LIM = await pg.evaluate(() => ({ n: (_impPhotos || []).length, msgs: window.__toasts.slice(), max: typeof IMP_MAX_PAGES !== 'undefined' ? IMP_MAX_PAGES : null }));
  t('ERR-01 ⛔⛔ dépasser la limite de pages est REFUSÉ avec un message clair (2 + 7 > 8) — rien n\'est ajouté, rien n\'est tronqué',
    LIM.max === 8 && LIM.n === 2 && (LIM.msgs || []).some(m => /limite|8 pages/i.test(m)), js(LIM));
  // Image indécodable : onerror réel, pas de blocage, message.
  await pg.evaluate(() => { window.__toasts = []; });
  await ajouter([{ name: 'cassee.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('ceci n est pas une image') }]);
  await pg.waitForTimeout(600);
  const IND = await pg.evaluate(() => ({ n: (_impPhotos || []).length, msgs: window.__toasts.slice() }));
  t('ERR-02 ⛔ image indécodable : message explicite, rien d\'ajouté, aucun blocage (onerror réel)',
    IND.n === 2 && (IND.msgs || []).some(m => /illisible|lire|corromp|image/i.test(m)), js(IND));
  // PDF trop long (pdf.js simulé) : refus clair au lieu des 8 premières pages en silence.
  const PDF = await pg.evaluate(async () => {
    window.__toasts = [];
    window.pdfjsLib = { GlobalWorkerOptions: {}, getDocument: () => ({ promise: Promise.resolve({ numPages: 22, getPage: async () => { throw new Error('ne doit pas rendre'); } }) }) };
    return null;
  });
  await ajouter([{ name: 'long.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 faux') }]);
  await pg.waitForTimeout(600);
  const PDFL = await pg.evaluate(() => ({ n: (_impPhotos || []).length, msgs: window.__toasts.slice() }));
  t('ERR-03 ⛔⛔ PDF de 22 pages : REFUSÉ avec message (limite), aucune page ajoutée — plus de troncature silencieuse aux 8 premières',
    PDFL.n === 2 && (PDFL.msgs || []).some(m => /22/.test(m) && /limite|pages/i.test(m)), js(PDFL));
  await pg.evaluate(() => { window.__toasts = []; window.pdfjsLib = { GlobalWorkerOptions: {}, getDocument: () => ({ promise: Promise.reject(Object.assign(new Error('Invalid PDF structure'), { name: 'InvalidPDFException' })) }) }; });
  await ajouter([{ name: 'casse.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF casse') }]);
  await pg.waitForTimeout(600);
  const PDFC = await pg.evaluate(() => ({ n: (_impPhotos || []).length, msgs: window.__toasts.slice() }));
  t('ERR-04 fichier PDF corrompu : message explicite, rien d\'ajouté', PDFC.n === 2 && (PDFC.msgs || []).some(m => /PDF/i.test(m)), js(PDFC));
  // Réponse vide / erreur / délai / annulation : jamais de programme vide, jamais d'import gratuit consommé.
  const ERR = {};
  for (const mode of ['vide', 'videJours', 'erreur']) {
    cfg.mode = mode;
    ERR[mode] = await pg.evaluate(async () => {
      window.__toasts = []; S.premium = false; S.progImports = 0;
      const nAvant = (S.programmes || []).length;
      await analyzeImportPhotos();
      const r = { compte: S.progImports, extrait: !!_impExtracted, msgs: window.__toasts.slice(), nProg: (S.programmes || []).length - nAvant, pages: (_impPhotos || []).length };
      S.premium = true; return r;
    });
  }
  t('ERR-05 ⛔⛔ réponse VIDE (aucun jour / jours sans exercice) : message, aucun programme, l\'import gratuit n\'est PAS consommé, les pages restent',
    ['vide', 'videJours'].every(m => ERR[m].compte === 0 && ERR[m].extrait === false && ERR[m].nProg === 0 && ERR[m].pages === 2 && (ERR[m].msgs || []).some(x => /aucun|vide|rien/i.test(x))), js(ERR));
  t('ERR-06 erreur d\'analyse : message, rien enregistré, import non consommé, pages gardées',
    ERR.erreur.compte === 0 && ERR.erreur.nProg === 0 && ERR.erreur.pages === 2 && (ERR.erreur.msgs || []).some(x => /erreur|échou/i.test(x)), js(ERR.erreur));
  cfg.mode = 'jamais';
  const TO = await pg.evaluate(async () => {
    window.__toasts = []; S.premium = false; S.progImports = 0;
    try { IMP_TIMEOUT_MS = 1200; } catch (e) {}
    const t0 = Date.now(); await Promise.race([analyzeImportPhotos(), new Promise(r => setTimeout(r, 7000))]);
    const r = { ms: Date.now() - t0, compte: S.progImports, extrait: !!_impExtracted, msgs: window.__toasts.slice(), pages: (_impPhotos || []).length };
    S.premium = true; return r;
  });
  t('ERR-07 ⛔ délai client dépassé : l\'analyse s\'arrête avec un message, import non consommé, pages gardées (pas d\'attente infinie)',
    TO.ms < 8000 && TO.compte === 0 && TO.extrait === false && TO.pages === 2 && (TO.msgs || []).some(x => /temps|délai|trop long/i.test(x)), js(TO));
  const AN = await pg.evaluate(async () => {
    window.__toasts = []; S.premium = false; S.progImports = 0;
    try { IMP_TIMEOUT_MS = 60000; } catch (e) {}
    const p = analyzeImportPhotos();
    await new Promise(r => setTimeout(r, 300));
    const btn = document.querySelector('#imp-s3 [data-annuler]');
    const vu = !!btn; if (btn) btn.click(); else if (typeof impAnnulerAnalyse === 'function') impAnnulerAnalyse();
    await Promise.race([p, new Promise(r => setTimeout(r, 5000))]);
    const r = { bouton: vu, compte: S.progImports, extrait: !!_impExtracted, msgs: window.__toasts.slice(), pages: (_impPhotos || []).length, etape2: document.getElementById('imp-s2').style.display !== 'none' };
    S.premium = true; return r;
  });
  enAttente.forEach(r => { try { r.abort(); } catch (e) {} }); enAttente = [];
  cfg.mode = 'ok';
  t('ERR-08 annulation pendant l\'analyse : bouton visible, retour aux pages, import non consommé, rien enregistré',
    AN.bouton === true && AN.compte === 0 && AN.extrait === false && AN.pages === 2 && AN.etape2 === true && (AN.msgs || []).some(x => /annul/i.test(x)), js(AN));
  // Un échec pendant une MISE À JOUR ne supprime pas la version en place.
  cfg.mode = 'erreur';
  const UPD = await pg.evaluate(async () => {
   try {
    const p = S.programmes[S.programmes.length - 1]; const avant = JSON.stringify(p);
    S.premium = true;
    if (typeof _setImpMode === 'function') _setImpMode('update');
    if (typeof _impChoisirCible === 'function') _impChoisirCible(p.id);
    await analyzeImportPhotos();
    return { intact: JSON.stringify(S.programmes.find(x => x.id === p.id)) === avant };
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  cfg.mode = 'ok';
  t('ERR-09 ⛔ un échec d\'analyse en mode « mettre à jour » ne touche pas au programme ni à ses versions', UPD.intact === true, js(UPD));

  /* ════════ T-L1-10 / T-L1-11 — DÉMO et PERSONAS ÉTANCHES ════════ */
  const docsNormal = await idbDocs();
  const avantDemo = await pg.evaluate(() => (_impPhotos || []).length);
  await pg.evaluate(() => { window._demoMode = true; try { closeImportProg(); } catch (e) {} openImportProg(); });
  await pg.waitForTimeout(700);
  const DEMO1 = await pg.evaluate(() => ({ pagesVisibles: (_impPhotos || []).length }));
  await ajouter([fichier(5, 'demo.png')]);
  await pg.waitForTimeout(700);
  const docsDemo = await idbDocs();
  const DEMO2 = await pg.evaluate(() => ({ pages: (_impPhotos || []).length }));
  t('T-L1-10 ⛔⛔ mode démo : aucune écriture dans la base d\'import (le mode normal, lui, y écrit bien), et le vrai brouillon n\'est pas repris',
    avantDemo === 2 && docsNormal.n >= 1 && docsDemo.n === docsNormal.n && js(docsDemo.docs.map(d => d.pages)) === js(docsNormal.docs.map(d => d.pages)) && DEMO1.pagesVisibles === 0 && DEMO2.pages === 1, js({ avantDemo, docsNormal, docsDemo, DEMO1, DEMO2 }));
  const PERS = await pg.evaluate(async () => {
   try {
    window._demoMode = true; impRecommencer(true);
    try { _vcApplyPersona({ id: 'P-L1', nom: 'Persona L1', apply: {} }); } catch (e) { return { err: String(e) }; }
    try { closeImportProg(); } catch (e) {}
    openImportProg(); await new Promise(r => setTimeout(r, 700));
    return { pages: (_impPhotos || []).length, progs: (S.programmes || []).length, bandeau: (document.getElementById('imp-reprise') || {}).style && document.getElementById('imp-reprise').style.display === 'flex' };
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  t('T-L1-11 ⛔⛔ persona : aucun document ni brouillon réel visible (0 page, pas de reprise), aucun programme réel',
    !PERS.err && PERS.pages === 0 && PERS.bandeau === false && PERS.progs === 0 && docsNormal.n >= 1, js({ PERS, docsNormal }));
  await recharger();          // sortie du persona : on recharge les vraies données

  /* ════════ FC-* — CONSERVATION DES CHAMPS sur tous les chemins qui reconstruisent un objet ════════ */
  cfg.saveProfile = [];
  const FC = await pg.evaluate(async () => {
   try {
    const o = {};
    const p = S.programmes.find(x => x.previousVersions && x.previousVersions.length);
    o.ok = !!p; if (!p) return o;
    const id = p.id;
    // ① persist / relecture du disque
    persist(); const disque = JSON.parse(localStorage.getItem('ft4_progs')).find(x => x.id === id);
    o.disque = !!disque && disque.version === p.version && (disque.previousVersions || []).length === p.previousVersions.length && !!disque.origin;
    // ② éditeur : ouvrir / enregistrer sans rien changer garde tout
    const avant = JSON.stringify(Object.assign({}, p, { editedSinceImport: undefined }));
    const vAvant = p.version, nPrevAvant = (p.previousVersions || []).length;
    editProg(id); saveProgEdit();                                   // enregistrer SANS rien changer
    const e0 = S.programmes.find(x => x.id === id);
    o.videSansVersion = e0.version === vAvant && (e0.previousVersions || []).length === nPrevAvant && e0.editedSinceImport !== true;
    editProg(id); document.getElementById('prog-edit-name').value = 'Powerbuilding modifié'; saveProgEdit();   // 1ʳᵉ VRAIE modification
    const e = S.programmes.find(x => x.id === id);
    o.editeurGarde = !!e && e.id === id && e.version === vAvant + 1 && (e.previousVersions || []).length === nPrevAvant + 1 && !!e.origin && e.origin.type === 'import' && e.name === 'Powerbuilding modifié';
    o.beforeEditUneFois = (e.previousVersions || []).filter(x => x.archivedFor === 'before-edit').length;
    editProg(id); document.getElementById('prog-edit-name').value = 'Powerbuilding modifié 2'; saveProgEdit();   // 2ᵉ modification
    const e2 = S.programmes.find(x => x.id === id);
    o.beforeEditToujoursUne = (e2.previousVersions || []).filter(x => x.archivedFor === 'before-edit').length;
    o.pasDeNouvelleVersion = e2.version === vAvant + 1 && e2.name === 'Powerbuilding modifié 2';
    o.edited = e2.editedSinceImport === true;
    // ③ « en cours » / archive / désarchive par la fonction propriétaire
    openProgModal(); ouvrirProgGerer(id);
    { const el = document.elementFromPoint(195, 600); o.gererAuPremierPlan = !!(el && el.closest && el.closest('#ov-prog-gerer')); }
    o.gererVersions = [...document.querySelectorAll('#prog-gerer-content [data-restaurer]')].length;
    fermerProgGerer(); closeProgModal();
    _progDefinirEnCours(id);
    o.unSeulEnCours = S.programmes.filter(x => x.status === 'active').length === 1;
    archiverProg(id); const ar = S.programmes.find(x => x.id === id);
    o.archiveGarde = !!ar && ar.status === 'archived' && (ar.previousVersions || []).length === (e2.previousVersions || []).length;
    desarchiverProg(id);
    o.desarchive = S.programmes.find(x => x.id === id).status !== 'archived';
    // ④ synchro simulée : le corps envoyé porte les champs, et une restauration les rend
    S.email = 'l1@test.local'; S.connected = true; S.url = S.url || DEFAULT_URL;
    try { _cloudSync(); } catch (e) {}
    await new Promise(r => setTimeout(r, 900));
    return o;
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  const corps = cfg.saveProfile[cfg.saveProfile.length - 1] || null;
  const progCloud = corps && (corps.programmes || []).find(x => x.previousVersions && x.previousVersions.length);
  t('FC-01 persist / relecture : version, versions précédentes et origine conservées sur le disque', FC.ok === true && FC.disque === true, js(FC));
  t('FC-02 éditeur : enregistrer sans changement ne crée rien ; la 1ʳᵉ VRAIE modification après import crée UNE version (l\'importée, « before-edit »), les suivantes aucune ; id, versions, origine gardés',
    FC.videSansVersion === true && FC.editeurGarde === true && FC.beforeEditUneFois === 1 && FC.beforeEditToujoursUne === 1 && FC.pasDeNouvelleVersion === true && FC.edited === true, js(FC));
  t('FC-03 programme en cours unique (fonction propriétaire) ; archiver puis désarchiver garde les versions ; la fiche « Gérer » s\'ouvre AU PREMIER PLAN avec ses versions restaurables',
    FC.unSeulEnCours === true && FC.archiveGarde === true && FC.desarchive === true && FC.gererAuPremierPlan === true && FC.gererVersions >= 2, js(FC));
  t('FC-04 synchro existante : le corps envoyé au cloud porte id, version, origine et versions précédentes (aucun champ perdu en route)',
    !!progCloud && !!progCloud.id && !!progCloud.origin && progCloud.version >= 2, js({ n: corps && (corps.programmes || []).length, p: progCloud && { id: progCloud.id, v: progCloud.version } }));
  const RST = await pg.evaluate((raw) => {
   try {
    const vrai = S.programmes; S.programmes = [];
    try { _applyRestoreData({ profile: { name: 'Testeur', bw: 80 }, programmes: raw }); } catch (e) { return { err: String(e) }; }
    const p = (S.programmes || []).find(x => x.previousVersions && x.previousVersions.length);
    const r = { ok: !!p && !!p.origin && p.version >= 2 };
    S.programmes = vrai; return r;
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  }, corps ? corps.programmes : []);
  t('FC-05 restauration depuis le cloud : versions et origine reviennent avec le programme', !RST.err && RST.ok === true, js(RST));
  const MILO = await pg.evaluate(() => {
   try {
    const n = _normalizeForceProg({ name: 'Force IA', days: [{ label: 'J1', exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5 }] }] }], weeks: 4 });
    const avant = S.programmes.length; _pendingForceProgs.push(n); _saveForceProgram(_pendingForceProgs.length - 1, null);
    const p = S.programmes[S.programmes.length - 1]; _progMigrerTous();
    return { ajoute: S.programmes.length === avant + 1, origine: p.origin && p.origin.type, force: p.force === true, id: !!p.id, version: p.version };
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  t('FC-06 programme Milo (_normalizeForceProg) : origine « milo » déduite du signal force, id et version posés', MILO.ajoute && MILO.origine === 'milo' && MILO.force && MILO.id && MILO.version === 1, js(MILO));
  const DOCP = await pg.evaluate(() => {
   try {
    const p = S.programmes.find(x => x.origin && x.origin.type === 'import' && x.doc);
    return { doc: p ? { pages: p.doc.pages, hash: !!p.doc.hash, id: !!p.doc.id } : null,
      ft4progsSansImages: !/iVBOR|\/9j\//.test(localStorage.getItem('ft4_progs') || '') };
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  t('FC-07 ⛔ le programme ne garde que les petites métadonnées du document (id, empreinte, nb de pages) — aucune image dans ft4_progs ni dans le cloud',
    !!DOCP.doc && DOCP.doc.id === true && DOCP.ft4progsSansImages === true && !/iVBOR|\/9j\//.test(JSON.stringify(corps || {})), js(DOCP));

  /* ════════ T-L1-13d — LE MÊME DOCUMENT (même empreinte) PROPOSE LA MISE À JOUR DU BON PROGRAMME ════════ */
  cfg.reponse = PROG_V1; cfg.mode = 'ok';
  await pg.evaluate(async () => { impRecommencer(true); try { closeImportProg(); } catch (e) {} openImportProg(); await new Promise(r => setTimeout(r, 900));
    const bd = document.getElementById('imp-reprise'); if (bd && bd.style.display === 'flex' && bd.querySelector('[data-reset]')) bd.querySelector('[data-reset]').click();
    await new Promise(r => setTimeout(r, 300)); });
  await ajouter([fichier(1, 'doc-a.png'), fichier(3, 'doc-b.png')]);
  const D1 = await pg.evaluate(async () => {
   try {
    S.premium = true; const h = _impDoc && _impDoc.docHash; await analyzeImportPhotos();
    const modeNeuf = _impMode; finalImportProg();
    const p = S.programmes[S.programmes.length - 1];
    return { h, modeNeuf, id: p && p.id, hProg: p && p.doc && p.doc.hash };
   } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  await pg.evaluate(async () => { impRecommencer(true); try { closeImportProg(); } catch (e) {} openImportProg(); await new Promise(r => setTimeout(r, 600)); });
  await ajouter([fichier(3, 'autre-nom-b.png'), fichier(1, 'autre-nom-a.png')]);
  const D2 = await pg.evaluate(async () => {
   try { S.premium = true; const h = _impDoc && _impDoc.docHash; await analyzeImportPhotos(); const o = { h, mode: _impMode, cible: _impCibleId }; impRecommencer(); try { closeImportProg(); } catch (e) {} return o; }
   catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
  });
  t('T-L1-13d ⭐ le même document réimporté (mêmes fichiers, autres noms, autre ordre) a la MÊME empreinte et propose « Mettre à jour » CE programme ; un document neuf part en « Nouveau »',
    !!D1.h && D1.modeNeuf === 'new' && D1.hProg === D1.h && D2.h === D1.h && D2.mode === 'update' && D2.cible === D1.id, js({ D1, D2 }));

  t('B-L1-00 0 appel réel (Worker, Apps Script, Supabase, Anthropic, CDN simulés ou coupés), 0 erreur de page',
    reels === 0 && errs.length === 0, js({ reels, errs }));
  await cx.close();
};
