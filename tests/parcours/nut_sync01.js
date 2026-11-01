/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
   🔑🗑️ NUT-SYNC-01 — IDENTITÉS STABLES ET SUPPRESSIONS EXPLICITES DU JOURNAL ALIMENTAIRE (01/11/2026)
   Bloc : B-NS01. Banc : tools/banc_nut_sync01.js · contrôle négatif : tools/mut_nut_sync01.py

   CONDUIT : le VRAI client (index.html + les scripts de l'app) dans PLUSIEURS CONTEXTES NAVIGATEUR INDÉPENDANTS — chacun son `localStorage`, son état `S`, sa mémoire — et le VRAI Code.js
     (vm Node, services Google simulés, compression réelle : le serveur de `nut_secu_p1.js`). Les appels réseau de l'app (`_cloudSync`, `loadProfile` au démarrage, restauration) sont
     interceptés au niveau du navigateur et servis par ce Code.js : ce sont les VRAIES fonctions du client qui parlent au VRAI serveur, pas un tableau fusionné dans un test.
   SIMULÉ : le réseau (on peut mettre un appareil « hors ligne »), le quota du stockage (budget en caractères / clés qui refusent), les services Google.
   NE COUVRE PAS : le vrai déploiement Apps Script, les vraies Script Properties (plafond réel 512 Ko : la taille d'une suppression est MESURÉE), le miroir Supabase (le corps est le même ;
     aucune migration SQL dans cette brique), l'iPhone, deux envois SIMULTANÉS (aucun verrou dans Code.js — défaut préexistant).
   ⛔⛔ DONNÉES INVENTÉES SEULEMENT (domaine example.test, repas « … test »). */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const J = (x) => JSON.stringify(x);
const RACINE = path.join(__dirname, '..', '..');
const P1 = require('./nut_secu_p1.js');
const EMAIL = 'alice@example.test';
const COMMIT_AVANT = '22ccce77';
const CODE_PERSO = '4242';

const CODE_NEUF = P1.preparerCode(fs.readFileSync(path.join(RACINE, 'Code.js'), 'utf8'));
/* Le serveur d'AVANT (pour la compatibilité nouveau client ↔ ancien serveur). `FT_DEPOT_GIT` : le dépôt qui porte l'historique git (les contrôles négatifs tournent sur des copies sans .git). */
function codeAvant() {
  return P1.preparerCode(execSync('git show ' + COMMIT_AVANT + ':Code.js', { cwd: process.env.FT_DEPOT_GIT || RACINE, maxBuffer: 64 * 1024 * 1024 }).toString('utf8'));
}

/* Le quota simulé (le même geste que journal_ecriture.js) : des clés qui refusent, un budget total. */
const QUOTA = `(() => { if (window.__Qinst) return; window.__Qinst = 1; window.__Q = { limit: Infinity, refuse: [], refus: [] };
  const o = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    const faute = () => { window.__Q.refus.push(k); const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; };
    if (window.__Q.refuse.indexOf(k) >= 0) faute();
    if (window.__Q.limit !== Infinity) { let tot = 0; for (let i = 0; i < localStorage.length; i++) { const kk = localStorage.key(i); if (kk === k) continue; tot += kk.length + (localStorage.getItem(kk) || '').length; } tot += k.length + String(v).length; if (tot > window.__Q.limit) faute(); }
    return o.apply(this, arguments);
  }; })();`;

/* Une ligne du journal, avec la forme réelle d'une entrée V2 (voir journal_ecriture.js). `id` absent = ancienne ligne. */
const ligne = (nom, o) => Object.assign({ date: new Date().toISOString().slice(0, 10), meal: 'dejeuner', name: nom, q: 100, u: 'g', kcal: 130, prot: 3, carbs: 28, fat: 1, ts: 1760000000000,
  per100: null, v: 1, saisie: 'liste', origine: 'reprise', n2: { s: 1, m: 'd', no: [], st: 'declaree' } }, o || {});

module.exports.ecran = async function ecran(t, b, PORT) {
  console.log('\n-- B-NS01. Identités stables · suppressions explicites · plusieurs appareils indépendants · vrai client, vrai Code.js --');
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const erreursGlobales = [];

  /* ─── un APPAREIL : un contexte navigateur à lui, relié au serveur en mémoire ─── */
  async function appareil(nom, srv, opt) {
    opt = opt || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const pg = await cx.newPage();
    const D = { nom, srv, cx, pg, horsLigne: false, erreurs: [] };
    pg.on('pageerror', (e) => { const m = nom + ' : ' + String(e && e.message || e).slice(0, 160); D.erreurs.push(m); erreursGlobales.push(m); });
    pg.on('dialog', (d) => d.accept());
    /* le compte du banc est protégé par un code perso (la lecture du profil est stricte : sans code, `loadProfile` refuse) — chaque appareil le connaît */
    if (!srv.__compteBanc) { srv.compte(EMAIL, { code: CODE_PERSO }); srv.__compteBanc = true; }
    const init = (opt.sansEmail ? '' : "localStorage.setItem('ft4_email','" + EMAIL + "');localStorage.setItem('ft4_ok','1');") + "localStorage.setItem('ft4_authcode','" + CODE_PERSO + "');";
    await pg.addInitScript({ content: "(() => { if (sessionStorage.getItem('__nsd')) return; sessionStorage.setItem('__nsd', '1'); localStorage.clear(); localStorage.setItem('ft4_ob2', '1'); localStorage.setItem('ft4_guide_shown', '1'); localStorage.setItem('ft4_wn_seen', '99'); " + init + (opt.stockage ? "const st = " + J(opt.stockage) + "; Object.keys(st).forEach(k => localStorage.setItem(k, st[k]));" : '') + " })();" });
    await pg.addInitScript(QUOTA);
    /* `refuser` : clés dont l'écriture est REFUSÉE dès le premier chargement (stockage plein avant même que l'app ait pu sauvegarder quoi que ce soit) — le rechargement suivant n'a plus ce refus */
    if (opt.refuser) await pg.addInitScript({ content: "(() => { if (sessionStorage.getItem('__nsq')) return; sessionStorage.setItem('__nsq', '1'); window.__Q.refuse = " + J(opt.refuser) + "; })();" });
    /* le serveur Apps Script par défaut de l'app est servi par le Code.js en mémoire */
    await pg.route(/script\.google\.com/, async (route) => {
      if (D.horsLigne) return route.abort('internetdisconnected');
      const req = route.request();
      let rep;
      try { rep = req.method() === 'POST' ? D.srv.post(req.postData() || '') : D.srv.get(Object.fromEntries(new URL(req.url()).searchParams)); }
      catch (e) { rep = { t: J({ status: 'error', error: 'harnais : ' + e.message }) }; }
      D.srv.recus = (D.srv.recus || 0) + 1;
      await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: rep.t });
    });
    await pg.route(/workers\.dev|supabase\.co/, (r) => r.abort());
    await pg.goto('http://localhost:' + PORT + '/index.html');
    await pause(1500);
    D.ev = (f, a) => pg.evaluate(f, a);
    D.journal = () => D.ev(() => JSON.parse(JSON.stringify(S.foodLog || [])));
    D.disque = () => D.ev(() => { try { return JSON.parse(localStorage.getItem('ft4_foodlog') || '[]'); } catch (e) { return null; } });
    D.registre = () => D.ev(() => JSON.parse(JSON.stringify(S.foodSupprimes || [])));
    D.registreDisque = () => D.ev(() => { try { return JSON.parse(localStorage.getItem('ft4_food_supprimes') || '[]'); } catch (e) { return null; } });
    D.toasts = () => D.ev(() => (window.__toasts || []).slice());
    D.dernier = async () => ((await D.toasts()).slice(-1)[0] || '');
    D.espionner = () => D.ev(() => { window.__toasts = []; if (!window.toast.__esp) { const v = window.toast; const w = function (m) { window.__toasts.push(String(m)); try { return v.apply(this, arguments); } catch (e) {} }; w.__esp = 1; window.toast = w; } });
    /* graine : le journal EST ce tableau (écrit comme le ferait l'app : S puis persist) */
    D.graine = async (lignes) => { await D.ev((l) => { S.foodLog = l; persist(); }, lignes); };
    /* synchro cloud : la VRAIE `_cloudSync`, on attend que le serveur ait reçu l'envoi */
    D.sync = async () => {
      const n = D.srv.recus || 0;
      await D.ev(() => { _cloudSync(); });
      for (let i = 0; i < 60 && !D.horsLigne && (D.srv.recus || 0) <= n; i++) await pause(50);
      await pause(120);
    };
    /* restauration : la VRAIE `_fetchRestoreRaw` + `_applyRestoreData`, puis la sauvegarde que l'app fait */
    D.restaurer = async () => { await D.ev(async (email) => { const raw = await _fetchRestoreRaw(email); _applyRestoreData(raw); persist(); }, EMAIL); };
    /* redémarrage : on recharge la page (autoConnect relit le profil et applique les suppressions du compte) */
    D.redemarrer = async () => { await pg.reload(); await pause(1800); await D.espionner(); };
    D.fermer = () => cx.close();
    await D.espionner();
    return D;
  }
  const noms = (l) => (l || []).map((x) => x.name).sort();
  const sans = (l, ...ks) => (l || []).map((x) => { const o = Object.assign({}, x); ks.forEach((k) => delete o[k]); return o; });
  const compteServeur = (srv) => { const c = srv.lireCompte(EMAIL); return c && c.profile ? c : { profile: {} }; };
  const serveurJournal = (srv) => (compteServeur(srv).profile.foodLog || []);
  const serveurReg = (srv) => (compteServeur(srv).profile.foodSupprimes || []);

  /* ═══ A — IDENTITÉS ═══════════════════════════════════════════════════════════════════════════════════════ */
  {
    const srv = P1.serveur({ code: CODE_NEUF });
    const A = await appareil('A', srv);
    await A.graine([ligne('Riz source', { id: 'src-00000001' })]);
    // 1) deux repas VOULUS identiques par le vrai chemin d'ajout rapide : deux identités distinctes
    await A.ev(() => { openAddFood(); try { _renderFoodQuickList(); } catch (e) {} });
    const idx = await A.ev(() => (_afQuickItems || []).findIndex((it) => it.name === 'Riz source'));
    await A.ev((i) => { quickAddFood(i); }, idx); await pause(350);
    await A.ev(() => { try { closeAddFood(); } catch (e) {} openAddFood(); try { _renderFoodQuickList(); } catch (e) {} });
    await A.ev((i) => { quickAddFood(i); }, idx); await pause(350);
    const apresAjouts = await A.journal();
    const neufs = apresAjouts.filter((x) => x.id !== 'src-00000001');
    t('B-NS01 T01 ⭐ DEUX repas voulus identiques (deux ajouts du même aliment) : deux entrées, deux identités DISTINCTES, mêmes valeurs',
      neufs.length === 2 && neufs[0].id !== neufs[1].id && neufs.every((x) => x.id && x.id.length >= 8) && J(sans([neufs[0]], 'id', 'ts', 'n2')) === J(sans([neufs[1]], 'id', 'ts', 'n2')), J(neufs.map((x) => x.id)));
    // 2) modification : l'identité ne bouge pas
    const x0 = neufs[0];
    await A.ev((id) => { openEditFood(id); }, x0.id); await pause(250);
    const cible = x0.meal === 'diner' ? 'collation' : 'diner';
    await A.ev((m) => { _editFoodMeal = m; saveEditFood(); }, cible); await pause(300);
    const apresEdit = (await A.journal()).find((x) => x.id === x0.id);
    t('B-NS01 T02 ⭐ MODIFICATION d\'un repas (changement de moment) : la MÊME identité, le repas a bien changé, les macros sont inchangées',
      !!apresEdit && apresEdit.meal === cible && x0.meal !== cible && apresEdit.kcal === x0.kcal && apresEdit.prot === x0.prot && apresEdit.carbs === x0.carbs && apresEdit.fat === x0.fat, J(apresEdit));
    // 3) redémarrage : mêmes identités
    const avantRedemarrage = (await A.journal()).map((x) => x.id).sort();
    await A.redemarrer();
    const apresRedemarrage = (await A.journal()).map((x) => x.id).sort();
    /* ⚠️ « mêmes identités avant/après » ne suffit PAS : une régénération DÉTERMINISTE (`m1-…`) redonnerait les mêmes valeurs d'un redémarrage à l'autre et laisserait ce témoin vert (trouvé par mutation K04). Ce qui prouve qu'une identité DÉJÀ POSÉE n'est jamais régénérée, c'est qu'une identité qui NE DÉRIVE PAS du contenu — la graine `src-00000001` — traverse les ajouts, la modification ET le redémarrage telle quelle. */
    t('B-NS01 T03 ⭐ REDÉMARRAGE : exactement les mêmes identités (aucune régénérée, aucune perdue) — dont la graine `src-00000001`, qui ne dérive pas du contenu et traverse ajouts, modification et redémarrage sans changer', J(avantRedemarrage) === J(apresRedemarrage) && avantRedemarrage.length === 3 && avantRedemarrage.includes('src-00000001') && apresRedemarrage.includes('src-00000001') && apresRedemarrage.every((i) => i === 'src-00000001' || !/^m1-/.test(i)), J({ avantRedemarrage, apresRedemarrage }));
    await A.fermer();
  }

  /* ═══ B — MIGRATION DES ANCIENNES LIGNES (sans `id`) ══════════════════════════════════════════════════════════ */
  const ANCIENNES = [
    ligne('Pâtes vieilles', { ts: 1750000000001, kcal: 220.5, prot: 8.25, carbs: 40.75, fat: 2.5, q: 187.5 }),
    ligne('Pomme vieille', { ts: 1750000000002, kcal: 52.4, prot: 0.3, carbs: 13.8, fat: 0.2 }),
    ligne('Yaourt vieux', { ts: 1750000000003, kcal: 90, prot: 6, carbs: 8, fat: 3 }),
    ligne('Yaourt vieux', { ts: 1750000000004, kcal: 90, prot: 6, carbs: 8, fat: 3 }),          // même nom, mêmes macros, MÊME jour — autre instant : un autre repas
    ligne('Café vieux', { ts: 1750000000005, kcal: 2, prot: 0, carbs: 0, fat: 0 }),
    ligne('Café vieux', { ts: 1750000000005, kcal: 2, prot: 0, carbs: 0, fat: 0 }),             // INDISCERNABLE de la précédente (tous les champs égaux)
  ];
  const stockageAncien = (liste) => ({ ft4_foodlog: J(liste) });
  const champsMetier = (l) => sans(l, 'id').map((x) => J(x)).sort();
  {
    const srv = P1.serveur({ code: CODE_NEUF });
    const A = await appareil('A', srv, { stockage: stockageAncien(ANCIENNES) });
    const B = await appareil('B', srv, { stockage: stockageAncien(ANCIENNES) });
    const jA = await A.journal(), jB = await B.journal();
    const idsA = jA.map((x) => x.id), idsB = jB.map((x) => x.id);
    t('B-NS01 T04 ⭐⭐ MIGRATION : les 6 anciennes lignes (sans identité) reçoivent chacune une identité UNIQUE ; aucune donnée métier ne bouge (calories, macros, quantité, date, repas, nom, ts identiques à l\'octet)',
      jA.length === 6 && new Set(idsA).size === 6 && idsA.every((i) => /^m1-[0-9a-f]{32}(-\d+)?$/.test(i)) && J(champsMetier(jA)) === J(champsMetier(ANCIENNES)), J(idsA));
    t('B-NS01 T04b ⭐⭐ DEUX APPAREILS INDÉPENDANTS donnent les MÊMES identités à la même ancienne ligne (déterministe, sans coordination)', J(idsA.slice().sort()) === J(idsB.slice().sort()) && J(jA.map((x) => [x.name, x.ts, x.id])) === J(jB.map((x) => [x.name, x.ts, x.id])), J({ idsA, idsB }));
    const cafes = jA.filter((x) => x.name === 'Café vieux').map((x) => x.id).sort();
    const yaourts = jA.filter((x) => x.name === 'Yaourt vieux').map((x) => x.id);
    t('B-NS01 T04c ⭐ deux lignes INDISCERNABLES ne sont JAMAIS fusionnées (deux entrées, identités `…` et `…-2`) ; deux lignes qui ne diffèrent que par l\'instant restent distinctes (jamais le nom + les calories + la date seuls)',
      cafes.length === 2 && cafes[0] !== cafes[1] && /-2$/.test(cafes.find((i) => /-2$/.test(i)) || '') && cafes.filter((i) => /-2$/.test(i)).length === 1 && yaourts.length === 2 && yaourts[0] !== yaourts[1] && yaourts.every((i) => !/-\d$/.test(i)), J({ cafes, yaourts }));
    // 5) migration répétée : rien de plus
    const rep = await A.ev(() => { const n1 = _foodLogIdentifier(S.foodLog); const ids = S.foodLog.map((x) => x.id); const n2 = _foodLogIdentifier(S.foodLog); return { n1, n2, memes: JSON.stringify(ids) === JSON.stringify(S.foodLog.map((x) => x.id)), n: S.foodLog.length }; });
    t('B-NS01 T05 ⭐ MIGRATION RÉPÉTÉE : zéro identité de plus, aucun doublon, aucune ligne de plus', rep.n1 === 0 && rep.n2 === 0 && rep.memes && rep.n === 6, J(rep));
    // 6) migration INTERROMPUE : rien n'a été écrit sur le disque (le chargement ne sauvegarde pas) ; on « redémarre » : mêmes identités
    /* La migration elle-même n'écrit RIEN (l'app sauvegarde ensuite, au premier `persist()` naturel — très tôt : dès l'ouverture) : on le MESURE en espionnant `setItem` pendant l'appel. */
    const ecrit = await A.ev((anciennes) => { let n = 0; const o = Storage.prototype.setItem; Storage.prototype.setItem = function () { n++; return o.apply(this, arguments); };
      try { const copie = JSON.parse(anciennes); return { ids: _foodLogIdentifier(copie), ecritures: n, tousIdentifies: copie.every((x) => typeof x.id === 'string') }; } finally { Storage.prototype.setItem = o; } }, J(ANCIENNES));
    t('B-NS01 T06a ⭐ la migration (`_foodLogIdentifier`) n\'écrit RIEN d\'elle-même : 0 écriture de stockage pendant l\'appel, 6 identités posées en mémoire — la sauvegarde est un geste séparé, donc une interruption ne laisse rien de moitié écrit', ecrit.ecritures === 0 && ecrit.ids === 6 && ecrit.tousIdentifies, J(ecrit));
    /* VRAIE migration interrompue : un téléphone d'avant la brique dont le stockage REFUSE d'écrire dès l'ouverture. Les identités n'existent qu'en mémoire, le disque reste tel quel (aucun octet de moitié écrit) ;
       au redémarrage suivant elles sont recalculées : elles doivent être EXACTEMENT les mêmes (sinon une interruption ferait diverger l'appareil de ses jumeaux). */
    const E = await appareil('E', srv, { stockage: stockageAncien(ANCIENNES), refuser: ['ft4_foodlog'] });
    const idsE0 = (await E.journal()).map((x) => x.id).sort();
    const disqueE0 = await E.disque();
    t('B-NS01 T06b0 ⭐ migration INTERROMPUE (stockage qui refuse d\'écrire dès l\'ouverture) : les 6 identités existent en mémoire, le disque est RESTÉ celui d\'avant (6 lignes, aucune identité écrite, aucune donnée altérée)',
      idsE0.length === 6 && new Set(idsE0).size === 6 && Array.isArray(disqueE0) && disqueE0.length === 6 && disqueE0.every((x) => x.id === undefined) && J(champsMetier(disqueE0)) === J(champsMetier(ANCIENNES)), J({ idsE0, disque: (disqueE0 || []).length }));
    await E.redemarrer();
    const idsApres = (await E.journal()).map((x) => x.id).sort();
    t('B-NS01 T06b ⭐ migration INTERROMPUE puis REPRISE (rien n\'avait pu être sauvegardé) : exactement les mêmes identités qu\'avant l\'interruption ET que les autres appareils, aucun doublon', J(idsApres) === J(idsE0) && J(idsApres) === J(idsA.slice().sort()) && idsApres.length === 6, J(idsApres));
    await E.fermer();
    // 6c) migration à moitié PERSISTÉE : les 3 premières lignes ont déjà leur identité sur le disque, les 3 autres non
    const partielles = jA.map((x, k) => (k < 3 ? x : Object.assign({}, x, { id: undefined })));
    const C = await appareil('C', srv, { stockage: stockageAncien(partielles.map((x) => { const o = Object.assign({}, x); if (o.id === undefined) delete o.id; return o; })), refuser: ['ft4_foodlog'] });
    const jC = await C.journal();
    t('B-NS01 T06c ⭐ migration à MOITIÉ persistée : les identités déjà écrites ne changent pas, les autres sont complétées aux MÊMES valeurs, aucun doublon (6 lignes, 6 identités)',
      jC.length === 6 && new Set(jC.map((x) => x.id)).size === 6 && J(jC.map((x) => [x.name, x.ts, x.id]).sort()) === J(jA.map((x) => [x.name, x.ts, x.id]).sort()), J(jC.map((x) => x.id)));
    // 6d) la sauvegarde de la migration échoue (stockage plein) : les identités restent stables au redémarrage
    await C.ev(() => { persist(); });   // la sauvegarde ÉCHOUE (le refus de stockage est toujours actif)
    const disqueC = await C.disque();
    await C.redemarrer();
    const idsC2 = (await C.journal()).map((x) => x.id).sort();
    t('B-NS01 T06d ⭐ la sauvegarde de la migration ÉCHOUE (stockage plein) : le disque garde SES 3 identités d\'avant (rien de plus, rien de moins), et au redémarrage les 6 identités sont les mêmes que partout (déterministes), rien n\'est perdu', Array.isArray(disqueC) && disqueC.length === 6 && disqueC.filter((x) => x.id !== undefined).length === 3 && J(idsC2) === J(idsA.slice().sort()), J({ idsC2, surDisque: (disqueC || []).filter((x) => x.id !== undefined).length }));
    // 7) une identité DÉJÀ posée n'est jamais régénérée : on persiste, on recharge, on ajoute des lignes, on recharge
    await A.ev(() => { persist(); }); await A.redemarrer();
    const idsPersistees = (await A.disque()).map((x) => x.id).sort();
    await A.ev(() => { S.foodLog.push({ date: today(), meal: 'diner', name: 'Ligne sans id ajoutée', kcal: 1, prot: 0, carbs: 0, fat: 0, ts: 1760000000009 }); _foodLogIdentifier(S.foodLog); persist(); });
    await A.redemarrer();
    const ap = await A.journal();
    t('B-NS01 T07 ⭐ une identité DÉJÀ posée n\'est JAMAIS régénérée (persistée, rechargée, une autre ligne ajoutée, rechargée : les 6 premières identités sont intactes)', J(idsPersistees) === J(idsA.slice().sort()) && J(ap.filter((x) => x.name !== 'Ligne sans id ajoutée').map((x) => x.id).sort()) === J(idsA.slice().sort()) && ap.length === 7, J(ap.map((x) => x.id)));
    await A.fermer(); await B.fermer(); await C.fermer();
  }

  /* ═══ C — SUPPRESSIONS ═══════════════════════════════════════════════════════════════════════════════════════ */
  const X1 = ligne('Repas X1', { id: 'idx1-00000001', ts: 1760000000011 });
  const X2 = ligne('Repas X2', { id: 'idx2-00000002', ts: 1760000000012 });
  const X3 = ligne('Repas X3', { id: 'idx3-00000003', ts: 1760000000013 });
  {
    const srv = P1.serveur({ code: CODE_NEUF });
    const A = await appareil('A', srv);
    await A.graine([X1, X2, X3]);
    await A.ev(() => { removeFoodEntry('idx2-00000002'); }); await pause(250);
    const j1 = await A.journal(), d1 = await A.disque(), r1 = await A.registre(), rd1 = await A.registreDisque();
    t('B-NS01 T08 ⭐ SUPPRESSION normale : la ligne quitte le journal ET le disque, la suppression est ENREGISTRÉE (registre en mémoire et sur le disque), les autres lignes restent', noms(j1).join() === 'Repas X1,Repas X3' && noms(d1).join() === 'Repas X1,Repas X3' && r1.length === 1 && r1[0].i === 'idx2-00000002' && r1[0].t > 0 && J(rd1) === J(r1), J({ j1: noms(j1), r1 }));
    await A.redemarrer();
    const j2 = await A.journal();
    t('B-NS01 T08b ⭐ après REDÉMARRAGE la ligne supprimée est toujours absente, le registre est intact', noms(j2).join() === 'Repas X1,Repas X3' && (await A.registre()).length === 1, J(noms(j2)));
    await A.fermer();
  }
  {
    // 9) échec du REGISTRE : rien n'est supprimé, et on le dit
    const srv = P1.serveur({ code: CODE_NEUF });
    const A = await appareil('A', srv);
    await A.graine([X1, X2, X3]);
    await A.espionner();
    await A.ev(() => { window.__Q.refuse = ['ft4_food_supprimes']; removeFoodEntry('idx2-00000002'); }); await pause(250);
    const j = await A.journal(), d = await A.disque(), r = await A.registre(), msg = await A.toasts();
    t('B-NS01 T09 ⭐⭐ le REGISTRE ne peut pas être écrit (stockage plein) : la ligne est CONSERVÉE (mémoire et disque), aucune suppression fantôme, le message dit que la suppression n\'est PAS enregistrée — aucune réussite mensongère',
      noms(j).join() === 'Repas X1,Repas X2,Repas X3' && noms(d).join() === 'Repas X1,Repas X2,Repas X3' && r.length === 0 && msg.some((m) => /Suppression NON enregistrée/.test(m)) && !msg.some((m) => /supprimé|Supprimé|bien enregistrée/.test(m)), J({ msg, r }));
    await A.redemarrer();
    t('B-NS01 T09b … et après redémarrage la ligne est toujours là (une suppression non enregistrée n\'est pas devenue définitive)', noms(await A.journal()).join() === 'Repas X1,Repas X2,Repas X3', '');
    await A.fermer();
  }
  {
    // 9c) échec du JOURNAL seul : la suppression est définitive (le registre fait foi)
    const srv = P1.serveur({ code: CODE_NEUF });
    const A = await appareil('A', srv);
    await A.graine([X1, X2, X3]);
    await A.espionner();
    await A.ev(() => { window.__Q.refuse = ['ft4_foodlog']; removeFoodEntry('idx2-00000002'); }); await pause(250);
    const j = await A.journal(), d = await A.disque(), msg = await A.toasts();
    t('B-NS01 T09c ⭐ le registre est écrit mais le JOURNAL ne peut pas l\'être : la ligne quitte l\'écran, le disque porte encore l\'ancien journal, le message le dit (« bien enregistrée, mais le journal n\'a pas pu être réécrit ») — jamais de succès sans réserve',
      noms(j).join() === 'Repas X1,Repas X3' && noms(d).join() === 'Repas X1,Repas X2,Repas X3' && msg.some((m) => /Suppression bien enregistrée, mais le journal/.test(m)), J({ msg, disque: noms(d) }));
    await A.ev(() => { window.__Q.refuse = []; });
    await A.redemarrer();
    t('B-NS01 T09d ⭐⭐ … et au REDÉMARRAGE la ligne supprimée NE REVIENT PAS (le registre fait foi sur le journal resté ancien)', noms(await A.journal()).join() === 'Repas X1,Repas X3', J(noms(await A.journal())));
    await A.fermer();
  }

  /* ═══ D — PLUSIEURS APPAREILS ═════════════════════════════════════════════════════════════════════════════════ */
  {
    // 10) A supprime, B revient avec l'ancienne copie
    const srv = P1.serveur({ code: CODE_NEUF });
    const A = await appareil('A', srv), B = await appareil('B', srv), B2 = await appareil('B2', srv);
    await A.graine([X1, X2, X3]); await A.sync();
    await B.restaurer(); await B2.restaurer();
    t('B-NS01 T10a (préparation) A a synchronisé, B a restauré : les deux portent les 3 repas, avec les mêmes identités', noms(await B.journal()).join() === 'Repas X1,Repas X2,Repas X3' && J((await B.journal()).map((x) => x.id).sort()) === J([X1.id, X2.id, X3.id]), J(noms(await B.journal())));
    await A.ev(() => { removeFoodEntry('idx2-00000002'); }); await pause(250); await A.sync();
    t('B-NS01 T10b (serveur) la suppression de A est au compte : le registre la porte, le journal du compte n\'a plus X2', serveurReg(srv).some((e) => e.i === 'idx2-00000002') && noms(serveurJournal(srv)).join() === 'Repas X1,Repas X3', J({ reg: serveurReg(srv), j: noms(serveurJournal(srv)) }));
    await B.sync();   // B, qui n'a rien vu, renvoie SA copie (avec X2)
    t('B-NS01 T10 ⭐⭐ B (ancienne copie, avec le repas supprimé) synchronise : le repas supprimé NE REVIENT PAS dans le compte', noms(serveurJournal(srv)).join() === 'Repas X1,Repas X3', J(noms(serveurJournal(srv))));
    await B.redemarrer();
    t('B-NS01 T10c ⭐⭐ au démarrage de B, la suppression de A arrive avec le profil : X2 quitte le journal de B (sans appel réseau de plus), et B garde X1 et X3', noms(await B.journal()).join() === 'Repas X1,Repas X3' && (await B.registre()).some((e) => e.i === 'idx2-00000002'), J(noms(await B.journal())));
    const C = await appareil('C', srv, { sansEmail: false });
    await C.restaurer();
    t('B-NS01 T10d ⭐⭐ un appareil NEUF qui restaure le compte ne reçoit pas le repas supprimé', noms(await C.journal()).join() === 'Repas X1,Repas X3', J(noms(await C.journal())));
    await A.restaurer();
    t('B-NS01 T10e ⭐ la restauration sur A elle-même (qui a supprimé) ne ramène rien', noms(await A.journal()).join() === 'Repas X1,Repas X3', '');
    await B2.restaurer();   // l'appareil en retard qui RESTAURE (au lieu de redémarrer) : la restauration ne supprimait jamais — elle applique maintenant les suppressions du compte
    t('B-NS01 T10f ⭐⭐ un appareil en retard qui fait « Restaurer » : le repas supprimé sur A QUITTE son journal (la restauration additionne, mais le registre fait foi), X1 et X3 restent', noms(await B2.journal()).join() === 'Repas X1,Repas X3' && (await B2.registre()).some((e) => e.i === 'idx2-00000002'), J(noms(await B2.journal())));
    await A.fermer(); await B.fermer(); await B2.fermer(); await C.fermer();
  }
  {
    // 11) appareil resté hors ligne très longtemps
    const srv = P1.serveur({ code: CODE_NEUF });
    const A = await appareil('A', srv), B = await appareil('B', srv);
    await A.graine([X1, X2, X3]); await A.sync(); await B.restaurer();
    B.horsLigne = true;                                           // B quitte le réseau
    await A.ev(() => { removeFoodEntry('idx2-00000002'); }); await pause(250);
    await A.ev(() => { S.foodSupprimes.forEach((e) => { e.t = Date.now() - 400 * 86400000; }); persist(); });   // « il y a plus d'un an »
    // beaucoup d'autres suppressions ensuite (aucune expiration, aucune éviction)
    await A.ev(() => { const l = []; for (let i = 0; i < 300; i++) l.push({ id: 'zz' + String(100000 + i) + '-aaaa', date: today(), meal: 'diner', name: 'Z' + i, kcal: 1, prot: 0, carbs: 0, fat: 0, ts: 1760000100000 + i, v: 1, saisie: 'liste', origine: 'reprise', n2: { s: 1, m: 'd', no: [], st: 'declaree' } }); S.foodLog = S.foodLog.concat(l); persist(); });
    await A.sync();
    await A.ev(() => { const ids = S.foodLog.filter((x) => /^zz/.test(x.id)).map((x) => x.id); ids.forEach((id) => removeFoodEntry(id)); }); await pause(400);
    await A.sync();
    B.horsLigne = false;                                          // B revient, avec sa copie d'AVANT
    await B.sync();
    const regServeur = serveurReg(srv);
    t('B-NS01 T11 ⭐⭐ un appareil resté HORS LIGNE (suppression vieille de 400 jours + 300 suppressions depuis) revient avec l\'ancienne copie : la suppression est TOUJOURS respectée, aucune trace n\'a expiré',
      regServeur.length === 301 && regServeur.some((e) => e.i === 'idx2-00000002' && e.t < Date.now() - 300 * 86400000) && noms(serveurJournal(srv)).join() === 'Repas X1,Repas X3', J({ n: regServeur.length, j: noms(serveurJournal(srv)) }));
    await A.fermer(); await B.fermer();
  }
  {
    // 12) historique local incomplet après panne : aucune suppression cloud déduite
    const srv = P1.serveur({ code: CODE_NEUF });
    const A = await appareil('A', srv);
    await A.graine([X1, X2, X3]); await A.sync();
    await A.ev(() => { window.__Q.refuse = ['ft4_foodlog']; for (let i = 0; i < 3; i++) S.foodLog.push({ id: 'nouv' + i + '-0000000', date: today(), meal: 'diner', name: 'Nouveau ' + i, kcal: 5, prot: 0, carbs: 0, fat: 0, ts: 1760000200000 + i, v: 1, saisie: 'liste', origine: 'reprise', n2: { s: 1, m: 'd', no: [], st: 'declaree' } }); persist(); });
    await A.sync();   // en séance : le cloud reçoit les 3 lignes que le disque n'a pas pu garder
    await A.ev(() => { window.__Q.refuse = []; });
    await A.redemarrer();                                         // le téléphone ne relit que l'ancien journal : 3 lignes
    const raccourci = await A.journal();
    // simule en plus l'historique « raccourci » : on perd carrément une ligne locale (X3) sans suppression volontaire
    await A.ev(() => { S.foodLog = S.foodLog.filter((x) => x.id !== 'idx3-00000003'); persist(); });
    await A.sync();
    t('B-NS01 T12 ⭐⭐ HISTORIQUE LOCAL INCOMPLET après panne (3 repas jamais écrits au disque + 1 ligne absente sans suppression volontaire) : l\'envoi suivant ne retire RIEN du compte — les 6 lignes y restent (X1, X2, X3 + les 3 nouveaux), registre vide',
      raccourci.length === 3 && serveurJournal(srv).length === 6 && serveurReg(srv).length === 0 && ['Nouveau 0', 'Nouveau 1', 'Nouveau 2', 'Repas X3'].every((n) => noms(serveurJournal(srv)).includes(n)), J({ local: noms(raccourci), compte: noms(serveurJournal(srv)) }));
    const recup = (compteServeur(srv).recupNut || {}).foodLog || [];
    t('B-NS01 T12b … et rien n\'est « retiré vers la zone de récupération » : l\'absence n\'est pas une suppression', recup.length === 0, J(recup.length));
    await A.restaurer();
    const apres12 = await A.journal();
    t('B-NS01 T12c … la restauration RAMÈNE ensuite les repas que la panne avait empêché de garder (le compte les avait) : 6 lignes sur l\'appareil, aucun doublon', (await A.journal()).length === 6 && ['Nouveau 0', 'Nouveau 1', 'Nouveau 2', 'Repas X3'].every((n) => noms(apres12).includes(n)), J(noms(apres12)));
    // contrôle : un ANCIEN client (sans drapeau V2) qui envoie la même liste raccourcie retire bien les lignes (comportement d'avant, copié en zone de récupération)
    const srv2 = P1.serveur({ code: CODE_NEUF });
    srv2.compte(EMAIL, { foodLog: [X1, X2, X3].map((x) => Object.assign({}, x)) });
    srv2.envoi(EMAIL, { foodLog: [X1] });
    t('B-NS01 T12d (contrôle) un ANCIEN client (sans `foodLogV`) envoyant une liste plus courte garde le comportement d\'avant : les lignes absentes sont retirées du journal actif et COPIÉES en zone de récupération', serveurJournal(srv2).length === 1 && ((compteServeur(srv2).recupNut || {}).foodLog || []).length === 2, J({ j: serveurJournal(srv2).length, recup: ((compteServeur(srv2).recupNut || {}).foodLog || []).length }));
    await A.fermer();
  }
  {
    // 13) deux repas identiques, un seul supprimé
    const srv = P1.serveur({ code: CODE_NEUF });
    const A = await appareil('A', srv), B = await appareil('B', srv);
    const J1 = ligne('Jumeau', { id: 'jum1-00000001', ts: 1760000300001 }), J2 = ligne('Jumeau', { id: 'jum2-00000002', ts: 1760000300002 });
    await A.graine([J1, J2, X1]); await A.sync(); await B.restaurer();
    await A.ev(() => { removeFoodEntry('jum1-00000001'); }); await pause(250); await A.sync();
    await B.sync(); await B.redemarrer();
    t('B-NS01 T13 ⭐⭐ DEUX repas identiques, UN seul supprimé : l\'autre reste — sur A, au compte et sur B (qui l\'apprend au démarrage)',
      noms(await A.journal()).join() === 'Jumeau,Repas X1' && (await A.journal()).some((x) => x.id === 'jum2-00000002') && noms(serveurJournal(srv)).join() === 'Jumeau,Repas X1' && serveurJournal(srv).some((x) => x.id === 'jum2-00000002') && (await B.journal()).some((x) => x.id === 'jum2-00000002') && !(await B.journal()).some((x) => x.id === 'jum1-00000001'), J({ A: (await A.journal()).map((x) => x.id), B: (await B.journal()).map((x) => x.id) }));
    await A.fermer(); await B.fermer();
  }
  {
    // 14) modification et suppression concurrentes : la suppression gagne, dans les DEUX ordres
    for (const ordre of ['edition-puis-suppression', 'suppression-puis-edition']) {
      const srv = P1.serveur({ code: CODE_NEUF });
      const A = await appareil('A', srv), B = await appareil('B', srv);
      await A.graine([X1, X2, X3]); await A.sync(); await B.restaurer();
      const editerA = async () => { await A.ev((id) => { openEditFood(id); }, 'idx2-00000002'); await pause(250); await A.ev(() => { _editFoodMeal = 'diner'; saveEditFood(); }); await pause(300); await A.sync(); };
      const supprimerB = async () => { await B.ev(() => { removeFoodEntry('idx2-00000002'); }); await pause(250); await B.sync(); };
      if (ordre === 'edition-puis-suppression') { await editerA(); await supprimerB(); } else { await supprimerB(); await editerA(); }
      const compte = noms(serveurJournal(srv)).join();
      await A.redemarrer(); await B.redemarrer();
      t('B-NS01 T14 ⭐⭐ MODIFICATION (A) et SUPPRESSION (B) concurrentes, ordre « ' + ordre + ' » : la SUPPRESSION GAGNE partout — au compte, sur A (qui l\'apprend au démarrage) et sur B (règle documentée, déterministe)',
        compte === 'Repas X1,Repas X3' && noms(await A.journal()).join() === 'Repas X1,Repas X3' && noms(await B.journal()).join() === 'Repas X1,Repas X3', J({ compte, A: noms(await A.journal()), B: noms(await B.journal()) }));
      await A.fermer(); await B.fermer();
    }
  }

  /* ═══ E — COMPATIBILITÉ ════════════════════════════════════════════════════════════════════════════════════════ */
  {
    // 15) nouveau client ↔ ANCIEN serveur (celui d'avant la brique)
    const srv = P1.serveur({ code: codeAvant() });
    const A = await appareil('A', srv);
    await A.graine([X1, X2, X3]); await A.sync();
    await A.ev(() => { removeFoodEntry('idx2-00000002'); }); await pause(250); await A.sync();
    const compte = serveurJournal(srv);
    const B = await appareil('B', srv);
    let restauration = 'ok'; try { await B.restaurer(); } catch (e) { restauration = e.message; }
    t('B-NS01 T15 ⭐ NOUVEAU client + ANCIEN serveur : l\'envoi n\'échoue pas, les champs inconnus sont ignorés, le journal du compte est celui d\'avant la brique (remplacement), la restauration fonctionne ; la suppression se propage comme AVANT (par la liste), sans erreur',
      noms(compte).join() === 'Repas X1,Repas X3' && !((compteServeur(srv).profile || {}).foodSupprimes) && restauration === 'ok' && noms(await B.journal()).join() === 'Repas X1,Repas X3' && A.erreurs.length === 0 && B.erreurs.length === 0, J({ compte: noms(compte), restauration, ea: A.erreurs, eb: B.erreurs }));
    await A.fermer(); await B.fermer();
  }
  {
    // 16) ANCIEN client ↔ nouveau serveur : une liste sans drapeau, sans registre ; il ne peut pas faire revenir une ligne supprimée
    const srv = P1.serveur({ code: CODE_NEUF });
    const A = await appareil('A', srv);
    await A.graine([X1, X2, X3]); await A.sync();
    await A.ev(() => { removeFoodEntry('idx2-00000002'); }); await pause(250); await A.sync();
    const rep = srv.envoi(EMAIL, { foodLog: [X1, X2, X3], authCode: CODE_PERSO });         // un ancien appareil, resté sur sa copie (corps d'AVANT : ni foodLogV ni foodSupprimes)
    t('B-NS01 T16 ⭐ ANCIEN client (corps d\'avant, sans `foodLogV` ni `foodSupprimes`) + nouveau serveur : l\'envoi est accepté (statut ok), mais il ne peut pas faire revenir un repas supprimé', rep.j.status === 'ok' && noms(serveurJournal(srv)).join() === 'Repas X1,Repas X3', J({ status: rep.j.status, j: noms(serveurJournal(srv)) }));
    await A.fermer();
  }
  {
    // 17) journal MIXTE ancien (UUID + lignes sans identité) : tout reste accessible, rien ne change
    const mixte = [ligne('Avec UUID', { id: 'ab12cd34-ef56-4a78-9b01-23456789abcd', ts: 1750000001001 }), ligne('Sans identité', { ts: 1750000001002 }), ligne('Id trop court', { id: 'abc', ts: 1750000001003 })];
    const srv = P1.serveur({ code: CODE_NEUF });
    const A = await appareil('A', srv, { stockage: { ft4_foodlog: J(mixte) } });
    const j = await A.journal();
    t('B-NS01 T17 ⭐ ANCIEN journal mixte (UUID valide / sans identité / identité invalide de 3 caractères) : l\'UUID est conservé tel quel, les deux autres reçoivent une identité déterministe, aucune ligne perdue, aucune donnée métier modifiée',
      j.length === 3 && j[0].id === 'ab12cd34-ef56-4a78-9b01-23456789abcd' && /^m1-/.test(j[1].id) && /^m1-/.test(j[2].id) && J(champsMetier(j)) === J(champsMetier(mixte.map((x) => (x.id === 'abc' ? Object.assign({}, x, { id: undefined }) : x)))), J(j.map((x) => x.id)));
    await A.fermer();
  }
  {
    // 18) les macros des lignes conservées ne changent jamais : aller-retour complet (migration → synchro → restauration sur un autre appareil)
    const srv = P1.serveur({ code: CODE_NEUF });
    const A = await appareil('A', srv, { stockage: stockageAncien(ANCIENNES) });
    await A.sync();
    const B = await appareil('B', srv);
    await B.restaurer();
    const jB = await B.journal();
    const macros = (l) => l.map((x) => [x.name, x.ts, x.kcal, x.prot, x.carbs, x.fat, x.q, x.u, x.date, x.meal]).map(J).sort();
    t('B-NS01 T18 ⭐⭐ aller-retour complet (anciennes lignes → migration → synchro → compte → restauration sur un autre appareil) : calories, macros, quantités, dates, repas et noms IDENTIQUES à l\'octet pour les 6 lignes, et les mêmes identités sur les deux appareils',
      jB.length === 6 && J(macros(jB)) === J(macros(ANCIENNES)) && J((await A.journal()).map((x) => x.id).sort()) === J(jB.map((x) => x.id).sort()), J(macros(jB)));
    await A.fermer(); await B.fermer();
  }

  /* ═══ F — SERVEUR SEUL (Code.js réel) ═════════════════════════════════════════════════════════════════════════════ */
  {
    const srv = P1.serveur({ code: CODE_NEUF });
    const L = (i) => ligne('Serveur ' + i, { id: 'srv' + String(1000 + i) + '-aaaa', ts: 1760001000000 + i });
    srv.compte(EMAIL, { foodLog: [0, 1, 2, 3, 4].map(L) });
    // union V2 : une liste plus courte ne retire rien, ne copie rien en zone de récupération
    let r = srv.envoi(EMAIL, { foodLog: [L(0), L(1)], foodLogV: 2, foodSupprimes: [] });
    t('B-NS01 S01 ⭐ serveur V2 : une liste plus COURTE ne retire rien (les 5 lignes restent), rien n\'est copié en zone de récupération', r.j.status === 'ok' && serveurJournal(srv).length === 5 && (((compteServeur(srv).recupNut || {}).foodLog) || []).length === 0, J(serveurJournal(srv).length));
    // suppression déclarée : la ligne part, copie de sécurité, jamais plus acceptée
    r = srv.envoi(EMAIL, { foodLog: [L(0), L(1), L(2), L(3), L(4)], foodLogV: 2, foodSupprimes: [{ i: L(2).id, t: 111 }] });
    const zone = ((compteServeur(srv).recupNut || {}).foodLog) || [];
    t('B-NS01 S02 ⭐ suppression DÉCLARÉE : la ligne quitte le journal du compte même si l\'envoi la contient ; elle est copiée en zone de récupération (motif « supprimee ») ; le registre la porte',
      serveurJournal(srv).length === 4 && !serveurJournal(srv).some((x) => x.id === L(2).id) && zone.length === 1 && zone[0].m === 'supprimee' && serveurReg(srv).length === 1, J({ n: serveurJournal(srv).length, zone: zone.map((z) => z.m) }));
    // registre : union, idempotent, jamais de retrait, identités invalides ignorées
    /* ⚠️ l'union ne s'éprouve que par des envois qui NE REPRENNENT PAS les identités déjà au registre : renvoyer les mêmes identités ferait passer un registre « remplacé » pour un registre « additionné » (trouvé par mutation K16). */
    srv.envoi(EMAIL, { foodSupprimes: [] });
    const regVide = serveurReg(srv);
    srv.envoi(EMAIL, { foodSupprimes: [{ i: L(3).id, t: 222 }] });      // ne mentionne PAS L(2)
    const regUnion = serveurReg(srv);
    srv.envoi(EMAIL, { foodSupprimes: [{ i: L(2).id, t: 50 }, { i: 'court', t: 1 }, { i: "x'><script>", t: 2 }, 12345, null, { i: L(3).id, t: 222 }] });
    const reg = serveurReg(srv);
    t('B-NS01 S03 ⭐ registre : UNION (un envoi vide, ou qui ne reprend pas les identités déjà au registre, n\'efface rien), idempotent, identités invalides ignorées, l\'instant le plus ancien est conservé',
      regVide.length === 1 && regVide[0].i === L(2).id && regUnion.length === 2 && regUnion.some((e) => e.i === L(2).id) && regUnion.some((e) => e.i === L(3).id) && reg.length === 2 && reg.find((e) => e.i === L(2).id).t === 50 && reg.some((e) => e.i === L(3).id) && !reg.some((e) => /court|script/.test(e.i)), J({ regVide, regUnion, reg }));
    // vide : "le vide ne gagne jamais" mais les lignes supprimées partent bien
    r = srv.envoi(EMAIL, { foodLog: [], foodLogV: 2 });
    t('B-NS01 S04 ⭐ un envoi VIDE ne vide pas le compte (règle existante : il reste L0, L1, L4) et ne ramène pas les lignes supprimées (L2 et L3 sont au registre)', serveurJournal(srv).length === 3 && !serveurJournal(srv).some((x) => x.id === L(2).id || x.id === L(3).id), J(noms(serveurJournal(srv))));
    // tout supprimer à dessein : le journal peut devenir vide
    const srv3 = P1.serveur({ code: CODE_NEUF });
    srv3.compte(EMAIL, { foodLog: [L(0), L(1)] });
    srv3.envoi(EMAIL, { foodLog: [], foodLogV: 2, foodSupprimes: [{ i: L(0).id, t: 1 }, { i: L(1).id, t: 2 }] });
    t('B-NS01 S05 ⭐ tout supprimer À DESSEIN (deux suppressions déclarées pour deux lignes) vide bien le journal du compte', serveurJournal(srv3).length === 0 && serveurReg(srv3).length === 2, J(serveurJournal(srv3).length));
    // plafond du registre : les entrées connues sont toutes gardées, les nouvelles refusées au-delà, et c'est journalisé
    const srv4 = P1.serveur({ code: CODE_NEUF });
    srv4.compte(EMAIL, {});
    const mille = (a, b2) => Array.from({ length: b2 - a }, (_, k) => ({ i: 'tmb' + String(100000 + a + k) + '-aaaa', t: 1 + k }));
    srv4.envoi(EMAIL, { foodSupprimes: mille(0, 3000) });
    srv4.envoi(EMAIL, { foodSupprimes: mille(0, 3000).concat(mille(3000, 3010)) });
    t('B-NS01 S06 ⭐ plafond du registre (3000, protège le stockage partagé) : les 3000 entrées connues sont conservées, les 10 NOUVELLES sont refusées ET journalisées (jamais en silence)', serveurReg(srv4).length === 3000 && srv4.journal.some((m) => /foodSupprimes\] 10 suppression/.test(m)), J({ n: serveurReg(srv4).length }));
    // coût : octets stockés par suppression (mesure, pas une promesse)
    const srv5 = P1.serveur({ code: CODE_NEUF }); srv5.compte(EMAIL, {});
    const avant5 = (srv5.brut(EMAIL) || '').length;
    srv5.envoi(EMAIL, { foodSupprimes: Array.from({ length: 100 }, (_, k) => ({ i: crypto4(k), t: 1760000000000 + k })) });
    const parSupp = Math.round(((srv5.brut(EMAIL) || '').length - avant5) / 100);
    console.log('  ℹ️ MESURE : ' + parSupp + ' octets stockés par suppression (compression incluse, identités aléatoires)');
    t('B-NS01 S07 le coût de stockage d\'une suppression est MESURÉ et borné (≤ 80 octets par suppression, compression comprise)', parSupp > 0 && parSupp <= 80, J(parSupp));
  }

  /* ═══ G — LA BRIQUE NE TOUCHE PAS À CE QUI N'EST PAS ELLE ═════════════════════════════════════════════════════ */
  const src = (f) => fs.readFileSync(path.join(RACINE, f), 'utf8');
  const state = src('state.js'), app = src('app.js'), setup = src('setup.js'), code = src('Code.js');
  const corps = (s, nom) => { const i = s.indexOf('function ' + nom + '('); if (i < 0) return ''; let d = 0; for (let j = s.indexOf('{', i); j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (d === 0) return s.slice(i, j + 1); } } return ''; };
  t('B-NS01 G01 ⭐ un SEUL écrivain du registre (`ft4_food_supprimes` n\'est écrit que par `_ecrireSuppressionsLocal`), et `removeFoodEntry` ne retire la ligne qu\'APRÈS le registre',
    (['app.js', 'state.js', 'setup.js', 'screens.js', 'log.js', 'tracking.js', 'coach.js'].filter((f) => /setItem\(\s*'ft4_food_supprimes'/.test(src(f))).join() === 'state.js') && /setItem\('ft4_food_supprimes'/.test(corps(state, '_ecrireSuppressionsLocal')) &&
      corps(app, 'removeFoodEntry').indexOf('_foodSupprimer(') > 0 && corps(app, 'removeFoodEntry').indexOf('_foodSupprimer(') < corps(app, 'removeFoodEntry').indexOf('splice(i,1)'), '');
  t('B-NS01 G02 ⭐ `persist()` écrit le registre AVANT le journal (si le journal est écrit, les suppressions qu\'il suppose le sont aussi)',
    corps(state, 'persist').indexOf('_ecrireSuppressionsLocal()') > 0 && corps(state, 'persist').indexOf('_ecrireSuppressionsLocal()') < corps(state, 'persist').indexOf('_ecrireJournalLocal()'), '');
  t('B-NS01 G03 le corps envoyé au compte porte `foodSupprimes` et le drapeau `foodLogV:2` ; le serveur lit `body.foodSupprimes` AVANT `body.foodLog`',
    /foodSupprimes:_foodSupprimesNormaliser\(S\.foodSupprimes\)/.test(setup) && /foodLogV:2/.test(setup) && code.indexOf('body.foodSupprimes !== undefined') > 0 && code.indexOf('body.foodSupprimes !== undefined') < code.indexOf("body.foodLog       !== undefined"), '');
  t('B-NS01 G04 aucune erreur JavaScript inattendue pendant tout le banc', erreursGlobales.filter((e) => !/quota|refus|faute|écriture/i.test(e)).length === 0, J(erreursGlobales.slice(0, 3)));

  function crypto4(k) { return require('crypto').randomUUID(); }
};
