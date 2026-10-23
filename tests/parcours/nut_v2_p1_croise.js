/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   🔀 RECETTE CROISÉE NUTRITION V2 × NUT-SECURISATION-P1 (intégration du 23/10/2026, mission de Michel) — bloc B-NIX
   Banc : tools/banc_nut_v2_p1_croise.js · contrôle négatif : tools/mut_nut_v2_p1_croise.py
   POURQUOI : chacun des deux chantiers était vert sur sa branche ; un test sur une branche isolée ne valide pas leur
     réunion. Ici, la VRAIE app V2 (Chromium, ses vrais gestes) parle au VRAI Code.js (P1 + D-110) exécuté en local.
   CONDUIT : l'étoile (`toggleFavFood`, au pointeur), « ✕ » sur un favori (`deleteQuickFood` + confirmation), la
     redéfinition de portion par la vraie fonction que l'écran d'ajout appelle (`_majDefFavori`), la synchro
     (`_cloudSync`), le redémarrage, et « 🔄 Restaurer mon compte depuis le cloud » (Profil : `openRestoreAccount` +
     `doRestoreAccount`) sur un compte PROTÉGÉ par un code perso (sinon la lecture stricte refuse la restauration et
     le test passerait pour une mauvaise raison — vérifié : la restauration doit réellement s'appliquer, X1 ⑤).
   SIMULÉ : les services Google (propriétés en mémoire, vraie compression, Drive en mémoire avec panne), Open Food Facts
     absent (les lignes V2 sont écrites par le vrai moteur `NUT2.ligneNouvelle`, comme l'app les écrit).
   OBSERVE : favoris et journal de l'appareil, liste active du serveur, zone de récupération, fichiers Drive, événements.
   NE COUVRE PAS : le vrai Drive, deux envois simultanés, la saisie au clavier de l'écran d'ajout (couverte par P15),
     le clone, l'iPhone (recette de Michel).
   ⛔⛔ DONNÉES INVENTÉES SEULEMENT (example.test, « Yaourt X (test) », codes-barres 30000000009xx). Aucune sortie
     réseau : tout ce qui n'est ni localhost ni le serveur simulé est coupé ET compté.
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), vm = require('vm'), crypto = require('crypto'), zlib = require('zlib'), path = require('path');

const RACINE = process.env.NUT2X_RACINE || path.join(__dirname, '..', '..');
const ALICE = 'alice@example.test', FONDATEUR = 'fondateur@example.test', CODE_PERSO = '4827', SEL = 'selfictif0123456789';
const EAN_A = '3000000000901', EAN_B = '3000000000902', NOM = 'Yaourt X (test)';
const P100_A = { kcal: 80, prot: 4, carbs: 10, fat: 3 }, P100_B = { kcal: 120, prot: 3, carbs: 15, fat: 5 };
const J = x => JSON.stringify(x);
const pause = (pg, ms) => pg.waitForTimeout(ms);
const clic = async (pg, sel) => { try { await pg.click(sel, { timeout: 4000 }); return true; } catch (e) { return false; } };

/* ── Le vrai Code.js (liste premium en dur remplacée, remplacement COMPTÉ) + Drive en mémoire avec panne injectable ── */
function serveur(etat) {
  const brut = fs.readFileSync(path.join(RACINE, 'Code.js'), 'utf8'), RE = /const PREMIUM_HARDCODED_ = \[[^\]]*\];/g;
  if ((brut.match(RE) || []).length !== 1) throw new Error('harnais : liste premium en dur introuvable');
  const src = brut.replace(RE, "const PREMIUM_HARDCODED_ = ['" + FONDATEUR + "'];");
  const props = Object.create(null), journal = [], fichiers = [];
  Object.assign(props, { backup_set_tags_2026_06_29: '2026-06-29T00:00:00.000Z', triggers_purged_20260630: '2026-06-30T00:00:00.000Z',
    triggers_purged_log: 'AUCUN', PREMIUM_EMAILS: FONDATEUR });
  const sp = { getProperty: k => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v); }, deleteProperty: k => { delete props[k]; },
    getProperties: () => Object.assign({}, props), getKeys: () => Object.keys(props) };
  const blob = d => { const b = Buffer.isBuffer(d) ? d : Buffer.from(String(d), 'utf8'); return { getBytes: () => b, getDataAsString: () => b.toString('utf8'), setName() { return this; } }; };
  const iter = l => { let i = 0; return { hasNext: () => i < l.length, next: () => l[i++] }; };
  const fmt = (d, tz, f) => { const x = new Date(d), p = n => String(n).padStart(2, '0');
    return String(f || "yyyy-MM-dd'T'HH:mm:ss").replace('yyyy', x.getUTCFullYear()).replace('MM', p(x.getUTCMonth() + 1)).replace('dd', p(x.getUTCDate()))
      .replace('HH', p(x.getUTCHours())).replace('mm', p(x.getUTCMinutes())).replace('ss', p(x.getUTCSeconds())).replace(/'/g, ''); };
  let horloge = Date.now(); const sous = Object.create(null);
  const fichier = f => ({ getName: () => f.name, getDateCreated: () => new Date(f.updated), getLastUpdated: () => new Date(f.updated),
    getSize: () => Buffer.byteLength(f.content), getBlob: () => blob(f.content), getId: () => 'f_' + f.name });
  const dossier = (dir, nomD) => ({ getId: () => 'd_' + (dir || 'racine'), getName: () => nomD,
    getFiles: () => iter(fichiers.filter(x => x.dir === dir).map(fichier)), getFilesByName: nm => iter(fichiers.filter(x => x.dir === dir && x.name === nm).map(fichier)),
    getFoldersByName: nm => iter(!dir && sous[nm] ? [sous[nm]] : []), createFolder: nm => (sous[nm] = dossier(String(nm), String(nm))),
    createFile: (nom, contenu) => { if (etat.drivePanne) throw new Error('Drive indisponible (panne simulée)');
      const f = { name: String(nom), dir, updated: ++horloge, content: String(contenu) }; fichiers.push(f); return fichier(f); } });
  const racine = dossier('', 'ForceTracker-Backups');
  const refuse = nom => () => { throw new Error(nom + ' non doublé'); };
  const ctx = { console: { log() {}, warn() {}, error() {} }, PropertiesService: { getScriptProperties: () => sp },
    Utilities: { getUuid: () => crypto.randomUUID(), DigestAlgorithm: { SHA_256: 1 }, Charset: { UTF_8: 1 },
      computeDigest: (a, s) => [...crypto.createHash('sha256').update(String(s), 'utf8').digest()].map(x => (x > 127 ? x - 256 : x)),
      newBlob: d => blob(d), gzip: b => blob(zlib.gzipSync(b.getBytes())), ungzip: b => blob(zlib.gunzipSync(b.getBytes())),
      base64Encode: b => Buffer.from(b.getBytes ? b.getBytes() : b).toString('base64'), base64Decode: s => Buffer.from(String(s), 'base64'), formatDate: fmt, sleep() {} },
    Session: { getScriptTimeZone: () => 'Europe/Paris' }, Logger: { log: m => { journal.push(String(m)); } },
    MailApp: { sendEmail() {}, getRemainingDailyQuota: () => 100 }, GmailApp: { sendEmail() {} }, SpreadsheetApp: { openById: refuse('SpreadsheetApp') },
    DriveApp: { getFolderById: () => racine, getFoldersByName: () => iter([racine]), createFolder: refuse('DriveApp.createFolder') },
    UrlFetchApp: { fetch: refuse('UrlFetchApp') }, ScriptApp: { getProjectTriggers: () => [], newTrigger: refuse('newTrigger'), deleteTrigger: refuse('deleteTrigger') },
    ContentService: { createTextOutput: x => ({ t: x, setMimeType() { return this; } }), MimeType: { JSON: 1 } },
    CacheService: { getScriptCache: () => ({ get: () => null, put() {}, remove() {} }) }, LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock() {}, releaseLock() {} }) } };
  vm.createContext(ctx); vm.runInContext(src, ctx, { filename: 'Code.js' });
  /* Bornes RÉDUITES (même rapport que la vraie : plafond = 2 × borne) : un débordement en quelques favoris. */
  ctx.NUT_RECUP_BORNES_ = { foodLog: 3000, savedFoods: 900 };
  if (typeof ctx.NUT_RECUP_PLAFOND_FAVORIS_ === 'number') ctx.NUT_RECUP_PLAFOND_FAVORIS_ = 1800;
  const lire = r => String(r && r.t != null ? r.t : r);
  return { ctx, props, journal, fichiers,
    get: q => lire(ctx.doGet({ parameter: Object.assign({}, q || {}) })),
    post: c => lire(ctx.doPost({ postData: { contents: JSON.stringify(c) }, parameter: {} })),
    compte: e => ctx.loadUserData_(e) };
}

/* ── Le compte au serveur : un profil, 3 séances (l'appareil en a aussi : pas de restauration automatique), un code perso ── */
const seance = i => ({ id: 3000 + i, ts: 1760000000000 + i, date: '2026-10-0' + (1 + i), volume: 400, exs: [{ name: 'Squat à la Barre', sets: [{ kg: 60, reps: 5, type: 'N', done: true }] }] });
function preparer(etat) {
  const X = serveur(etat);
  X.ctx.saveUserData_(ALICE, { email: ALICE, profile: { name: 'Alice', foodLog: [], savedFoods: [] }, prs: {}, sessions: [0, 1, 2].map(seance) });
  X.props['auth_' + ALICE] = SEL + '$' + X.ctx._sha256hex_(SEL + '|' + CODE_PERSO);
  return { X, tok: X.ctx._jetonPoser_(ALICE, 'tel') };
}

/* ── Un appareil : la vraie app, stockage semé UNE fois (les rechargements gardent l'état), réseau routé ── */
async function appareil(b, PORT, X, etat, tok, tag) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  const st = { sorties: [], envois: 0, chargements: 0 };
  const CONST = (() => { let s = fs.readFileSync(path.join(RACINE, 'constants.js'), 'utf8');
    for (const [re, rep] of [[/const ADMIN_EMAILS=\[[^\]]*\];/, "const ADMIN_EMAILS=['" + FONDATEUR + "'];"], [/const TESTER_EMAILS=\[[^\]]*\];/, "const TESTER_EMAILS=['" + FONDATEUR + "'];"],
      [/const SUPER_TESTER_EMAILS=\[[^\]]*\];/, "const SUPER_TESTER_EMAILS=['" + FONDATEUR + "'];"], [/const PREMIUM_CLIENT_EMAILS=\[[^\]]*\];/, "const PREMIUM_CLIENT_EMAILS=['" + FONDATEUR + "'];"],
      [/const TESTER_FEEDBACK_EMAIL='[^']*';/, "const TESTER_FEEDBACK_EMAIL='boite@example.test';"]]) {
      if ((s.match(new RegExp(re.source, 'g')) || []).length !== 1) throw new Error('harnais : constante introuvable ' + re.source); s = s.replace(re, rep); }
    return s; })();
  await cx.route('**/*', async r => {
    const u = new URL(r.request().url());
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
      if (/\/constants\.js$/.test(u.pathname)) return r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: CONST });
      return r.continue();
    }
    if (u.hostname === 'script.google.com') {
      if (etat.reseauCoupe) return r.abort();
      if (u.searchParams.get('test') === '1') return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"online","version":"3.5"}' });
      let rep = '{"status":"ok"}';
      try {
        if (r.request().method() === 'GET') rep = X.get(Object.fromEntries(u.searchParams.entries()));
        else { const c = JSON.parse(r.request().postData() || '{}'); if (c.action === 'saveProfile') st.envois++; if (c.action === 'loadProfile') st.chargements++;
          rep = c.action === 'logSession' ? '{"status":"ok","count":0}' : X.post(c); }
      } catch (e) { rep = J({ status: 'error', error: 'harnais:' + e.message }); }
      return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: rep });
    }
    st.sorties.push(u.hostname); return r.abort();
  });
  const pg = await cx.newPage(); const erreurs = []; pg.on('pageerror', e => erreurs.push(String(e && e.message || e).slice(0, 160))); pg.on('dialog', d => d.accept());
  const stock = { ft4_email: ALICE, ft4_name: 'Alice', ft4_devtoken: tok, ft4_devtoken_compte: ALICE, ft4_authcode: CODE_PERSO, ft4_ok: '1', ft4_ob2: '1',
    ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_sessions: J([0, 1, 2].map(seance)), ft4_foodlog: '[]', ft4_savedfoods: '[]' };
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('${tag}'))return; sessionStorage.setItem('${tag}','1'); localStorage.clear();
    const D=${J(stock)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pause(pg, 3500);
  await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); });
  return { cx, pg, st, erreurs };
}

/* ── Les gestes et les lectures (mêmes sélecteurs que B-NV2P P15) ── */
const semer = (pg) => pg.evaluate(({ NOM, EAN_A, EAN_B, P100_A, P100_B }) => {
  const ligne = (id, k, ean, p100, poids) => ({ id, repas: 'collation', nom: NOM, origine: { saisie: 'code-tape', origine: 'off' }, mode: 'pesee',
    fiche: { base: 'g', p100, cle: ean, source: 'off', fiab: 'source', etat: 'tel-que-vendu' },
    quantite: { val: 1, unite: 'portion', origine: 'portion', portion: { libelle: 'pot', poids, unite: 'g' } }, ts: Date.now() - k * 864e5,
    date: (() => { const x = new Date(Date.now() - k * 864e5), p = n => String(n).padStart(2, '0'); return x.getFullYear() + '-' + p(x.getMonth() + 1) + '-' + p(x.getDate()); })() });
  const err = [];
  [ligne('nv2x-A-000000001', 2, EAN_A, P100_A, 125), ligne('nv2x-B-000000001', 1, EAN_B, P100_B, 150)].forEach(e => {
    const r = NUT2.ligneNouvelle(e); if (r.ok) S.foodLog.push(r.ligne); else err.push(r.erreur); });
  persist(); return err;
}, { NOM, EAN_A, EAN_B, P100_A, P100_B });
const ouvrirAjout = async pg => {                            // comme une personne : onglet Nutrition → Journal → « Ajouter »
  const ok = (await clic(pg, '#nb-nutrition')) && (await pause(pg, 350), await clic(pg, '#ntab-journal')) && (await pause(pg, 300),
    await clic(pg, 'button[onclick="addFoodVia(\'main\')"]'));
  await pause(pg, 350); return ok; };
const fermer = pg => pg.evaluate(() => { try { closeAddFood(); } catch (e) {} document.querySelectorAll('.overlay.open').forEach(x => x.classList.remove('open')); });
const items = pg => pg.evaluate(() => (_afQuickItems || []).map((it, i) => { const s = it._src || {}; return { i, nom: it.name, fav: !!it.fav, sid: s.sourceId || null }; }));
const etoile = async (pg, it) => { if (!it) return false; const ok = await clic(pg, '#af-quick-list button[onclick="toggleFavFood(' + it.i + ')"]'); await pause(pg, 300); return ok; };
const supprimer = async (pg, it) => { if (!it) return false; let ok = await clic(pg, '#af-quick-list button[onclick="deleteQuickFood(' + it.i + ')"]'); await pause(pg, 250);
  ok = ok && await clic(pg, '#confirm-ok'); await pause(pg, 300); return ok; };
const favoris = pg => pg.evaluate(() => JSON.parse(JSON.stringify(S.savedFoods || [])));
const journalApp = pg => pg.evaluate(() => JSON.parse(JSON.stringify(S.foodLog || [])));
/* Une synchro EXPLICITE : la synchro différée en attente (4 s, `_cloudSyncDebounced`) est annulée d'abord — sinon elle peut partir
   au milieu du scénario et brouiller l'ordre (mesuré le 23/10 sur un scénario à deux appareils, hors dépôt). */
const synchroniser = async pg => { await pg.evaluate(() => { try { clearTimeout(_syncTimer); } catch (e) {} _cloudSync(); }); await pause(pg, 1300); };
const redemarrer = async pg => { await pg.reload(); await pause(pg, 4200); await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); }); };
async function restaurer(pg) {                                 // le bouton « 🔄 Restaurer mon compte depuis le cloud » du Profil
  await pg.evaluate(() => { window.__restoreAvant = (S.savedFoods || []).length; openRestoreAccount(); }); await pause(pg, 350);
  await pg.evaluate(() => doRestoreAccount()); await pause(pg, 1400);
  return pg.evaluate(() => { const s = document.getElementById('restore-status'); return s ? s.textContent : ''; });
}
/* Une définition de portion qui change (ft-v1186 ⑤, D-111 A) : la vraie fonction que l'écran d'ajout appelle quand le même
   produit est noté avec un autre pot — la DÉFINITION suit, jamais les macros (« à vérifier » ensuite). */
const redefinirA = (pg, poids) => pg.evaluate(({ EAN_A, NOM, poids }) => { _majDefFavori({ u: 'portion', sourceId: EAN_A, name: NOM, portionLabel: 'pot', portionWeightG: poids });
  persist(); return (S.savedFoods || []).filter(f => f.sourceId === EAN_A).map(f => f.portionWeightG); }, { EAN_A, NOM, poids });
/* Ce que l'app montre d'une référence : l'aperçu de « + Ajouter » (`_n2Apercu`) — la même construction que l'écriture. */
const apercus = pg => pg.evaluate(() => (S.savedFoods || []).map(f => { const a = _n2Apercu(f, _n2FichesVerifiees());
  return { sid: f.sourceId || null, ok: !!(a && a.ok), raison: a && a.raison ? a.raison.code : null, kcal: a && a.ligne ? a.ligne.kcal : null }; }));
const parSid = (F, sid) => F.filter(f => f && f.sourceId === sid);
const canon = v => J((function tri(x) { if (Array.isArray(x)) return x.map(tri); if (x && typeof x === 'object') { const r = {}; Object.keys(x).sort().forEach(k => { r[k] = tri(x[k]); }); return r; } return x; })(v));
/** Toutes les versions de favoris gardées au serveur : liste active, zone, fichiers de débordement. */
function auServeur(X) {
  const c = X.compte(ALICE) || {}, out = [];
  ((c.profile || {}).savedFoods || []).forEach(f => out.push(canon(f)));
  (((c.recupNut || {}).savedFoods) || []).forEach(r => out.push(canon(r.l)));
  X.fichiers.forEach(f => { try { const o = JSON.parse(f.content); if (o.type === 'recupNut' && o.liste === 'savedFoods') (o.entrees || []).forEach(r => out.push(canon(r.l))); } catch (e) {} });
  return out;
}
const actifServeur = X => (((X.compte(ALICE) || {}).profile || {}).savedFoods || []);
const dernierEvt = X => ((((X.compte(ALICE) || {}).recupNut || {}).evts || []).filter(e => e.liste === 'savedFoods').slice(-1)[0]) || {};

/** Le parcours commun : deux produits du MÊME nom, deux codes-barres, étoilés tous les deux, synchronisés (Drive OK). */
async function socle(t, b, PORT, etiquette) {
  const etat = { drivePanne: false, reseauCoupe: false };
  const { X, tok } = preparer(etat);
  const A = await appareil(b, PORT, X, etat, tok, '__nv2x_' + etiquette);
  const err = await semer(A.pg);
  let g = await ouvrirAjout(A.pg); let L = await items(A.pg);
  g = g && await etoile(A.pg, L.find(x => !x.fav && x.sid === EAN_A)); await fermer(A.pg);
  g = g && await ouvrirAjout(A.pg); L = await items(A.pg);
  g = g && await etoile(A.pg, L.find(x => !x.fav && x.sid === EAN_B)); await fermer(A.pg);
  const F0 = await favoris(A.pg);
  await synchroniser(A.pg);
  /* Bornes calées sur la taille RÉELLE d'une copie de ces favoris V2 : UNE copie fait déborder la zone (Drive est donc
     sollicité), et reste sous le plafond (2 × la borne, le rapport du vrai code) — sinon la panne ne serait jamais éprouvée. */
  const tailles = F0.map(f => JSON.stringify({ t: new Date().toISOString(), m: 'modifiee', l: f }).length);
  X.ctx.NUT_RECUP_BORNES_ = { foodLog: 3000, savedFoods: Math.min.apply(null, tailles) - 10 };
  X.ctx.NUT_RECUP_PLAFOND_FAVORIS_ = 2 * X.ctx.NUT_RECUP_BORNES_.savedFoods;
  return { etat, X, A, g: g && err.length === 0 && tailles.length === 2 && Math.max.apply(null, tailles) < 2 * (Math.min.apply(null, tailles) - 10), F0 };
}

async function croise(t, b, PORT) {
  console.log('\n-- B-NIX. RECETTE CROISÉE NUTRITION V2 × P1 : deux produits du même nom, panne, restauration (données inventées) --');

  /* ═══ X1 — LE SCÉNARIO DE MICHEL, PANNE DE DRIVE (D-110) : modifier la portion de l'un, la synchro passe pendant la panne,
         restaurer avec le code perso, tout revient tel quel, puis Drive revient ═══ */
  {
    const S0 = await socle(t, b, PORT, 'x1'); const { etat, X, A } = S0;
    try {
      t('B-NIX X1 ① deux produits du même NOM et de deux codes-barres, étoilés : DEUX favoris, chacun son code-barres et son pot (125 g · 150 g) — au serveur aussi',
        S0.g && S0.F0.length === 2 && parSid(S0.F0, EAN_A).length === 1 && parSid(S0.F0, EAN_B).length === 1
        && parSid(S0.F0, EAN_A)[0].portionWeightG === 125 && parSid(S0.F0, EAN_B)[0].portionWeightG === 150
        && canon(actifServeur(X)) === canon(S0.F0), J({ F0: S0.F0.map(f => [f.name, f.sourceId, f.portionWeightG]), srv: actifServeur(X).length }));
      const defs = await redefinirA(A.pg, 150);
      const F1 = await favoris(A.pg), ap1 = await apercus(A.pg), jAvant = await journalApp(A.pg);
      t('B-NIX X1 ② la portion de l\'un change (pot 125 → 150 g, ft-v1186 ⑤) : SEUL son favori bouge, et il se dit « à vérifier » (D-111 A) — l\'homonyme est intact',
        J(defs) === J([150]) && canon(parSid(F1, EAN_B)) === canon(parSid(S0.F0, EAN_B)) && (ap1.find(a => a.sid === EAN_A) || {}).raison === 'perime'
        && (ap1.find(a => a.sid === EAN_B) || {}).raison === null, J(ap1));
      etat.drivePanne = true;
      await synchroniser(A.pg);
      const e2 = dernierEvt(X);
      t('B-NIX X1 ③ pendant la panne de Drive, la synchro des favoris PASSE (D-110 : zone au-delà de sa borne, événement « différé ») — le serveur a la version modifiée',
        e2.differe === 'drive' && !e2.refus && canon(actifServeur(X)) === canon(F1), J(e2));
      await redemarrer(A.pg);
      const statut = await restaurer(A.pg);
      const F3 = await favoris(A.pg), ap3 = await apercus(A.pg);
      t('B-NIX X1 ④ ⭐⭐ RESTAURER (code perso vérifié) PENDANT LA PANNE : les DEUX favoris existent toujours, chacun avec SON code-barres, SON pot et SES valeurs — rien de fusionné, rien de perdu',
        canon(F3) === canon(F1) && parSid(F3, EAN_A).length === 1 && parSid(F3, EAN_B).length === 1, J({ statut, F3: F3.map(f => [f.sourceId, f.portionWeightG, f.kcal]) }));
      t('B-NIX X1 ⑤ … et la restauration s\'est RÉELLEMENT appliquée (le serveur a répondu au code perso, l\'écran l\'a dit) — un refus d\'authentification ne passe pas pour un vert',
        /Cloud : Alice/.test(statut) && A.st.chargements >= 2, J({ statut, chargements: A.st.chargements }));
      t('B-NIX X1 ⑥ les valeurs correspondent aux bonnes références : l\'aperçu de « + Ajouter » de B donne 180 kcal (1 pot de 150 g à 120 kcal/100 g), A reste « à vérifier » (rien d\'écrit en silence)',
        (ap3.find(a => a.sid === EAN_B) || {}).kcal === 180 && (ap3.find(a => a.sid === EAN_A) || {}).raison === 'perime', J(ap3));
      etat.drivePanne = false;
      await synchroniser(A.pg);
      const F4 = await favoris(A.pg), jApres = await journalApp(A.pg);
      t('B-NIX X1 ⑦ Drive revenu, synchro : serveur et appareil identiques, aucun favori modifié ni supprimé en route, le journal n\'a pas bougé d\'un octet',
        canon(F4) === canon(F1) && canon(actifServeur(X)) === canon(F1) && canon(jApres) === canon(jAvant), J({ F4: F4.length, srv: actifServeur(X).length }));
      const garde = auServeur(X);
      t('B-NIX X1 ⑧ toutes les versions passées par le serveur se retrouvent (liste, zone, Drive) : l\'ancienne définition du favori A (pot de 125 g) comprise',
        [S0.F0, F1].every(L => L.every(f => garde.includes(canon(f)))), 'versions gardées=' + garde.length);
      const ch0 = A.st.chargements, statut2 = await restaurer(A.pg), F5 = await favoris(A.pg);
      t('B-NIX X1 ⑨ RESTAURER APRÈS la panne (Drive revenu, surplus déménagé) : les deux favoris reviennent tels quels — la restauration s\'est appliquée',
        canon(F5) === canon(F1) && /Cloud : Alice/.test(statut2) && A.st.chargements > ch0, J({ statut2, F5: F5.map(f => [f.sourceId, f.portionWeightG]) }));
      t('B-NIX X1 ⑩ aucune erreur de page, aucune sortie réseau réussie', A.erreurs.length === 0, J({ erreurs: A.erreurs, sorties: [...new Set(A.st.sorties)] }));
    } finally { await A.cx.close(); }
  }

  /* ═══ X2 — L'INVERSE : un favori supprimé VOLONTAIREMENT pendant la panne ne réapparaît pas en silence ═══ */
  {
    const S0 = await socle(t, b, PORT, 'x2'); const { etat, X, A } = S0;
    try {
      let g = await ouvrirAjout(A.pg); const L = await items(A.pg);
      g = g && await supprimer(A.pg, L.find(x => x.fav && x.sid === EAN_B)); await fermer(A.pg);
      const F1 = await favoris(A.pg);
      etat.drivePanne = true;
      await synchroniser(A.pg);
      await redemarrer(A.pg);
      await restaurer(A.pg);
      const F2 = await favoris(A.pg);
      t('B-NIX X2 ① « ✕ » sur le favori B, synchro pendant la panne, puis RESTAURER : B ne revient PAS, A est intact (même nom, autre produit)',
        g && parSid(F1, EAN_B).length === 0 && parSid(F2, EAN_B).length === 0 && canon(parSid(F2, EAN_A)) === canon(parSid(S0.F0, EAN_A)), J(F2.map(f => [f.sourceId, f.portionWeightG])));
      etat.drivePanne = false; await synchroniser(A.pg);
      const actif = actifServeur(X), garde = auServeur(X);
      t('B-NIX X2 ② ⭐ Drive revenu : B reste absent de la liste active (suppression respectée) mais sa copie est GARDÉE à part (zone ou Drive), jamais réintroduite d\'office',
        parSid(actif, EAN_B).length === 0 && garde.includes(canon(parSid(S0.F0, EAN_B)[0])), 'actifs=' + actif.length + ' versions gardées=' + garde.length);
      t('B-NIX X2 ③ aucune erreur de page', A.erreurs.length === 0, J(A.erreurs));
    } finally { await A.cx.close(); }
  }

  /* ═══ X3 — LIMITE DITE, PRÉEXISTANTE (ni P1 ni V2) : HORS LIGNE, une modification de favori jamais partie est remplacée par
         « Restaurer ». Ce témoin la rend VISIBLE ; il basculera le jour où la restauration fusionnera (FIX-B′, D-112 proposé). ═══ */
  {
    const S0 = await socle(t, b, PORT, 'x3'); const { etat, X, A } = S0;
    try {
      etat.reseauCoupe = true;
      await redefinirA(A.pg, 150);
      const F1 = await favoris(A.pg);
      await synchroniser(A.pg);                               // l'envoi ne part pas (hors ligne)
      etat.reseauCoupe = false;
      await restaurer(A.pg);
      const F2 = await favoris(A.pg);
      t('B-NIX X3 · LIMITE DITE (préexistante) : hors ligne, la nouvelle définition du favori A n\'atteint pas le serveur ; « Restaurer » remet la version du serveur (pot de 125 g) — la modification locale est perdue, l\'homonyme B intact',
        (parSid(F1, EAN_A)[0] || {}).portionWeightG === 150 && parSid(F2, EAN_A).length === 1 && (parSid(F2, EAN_A)[0] || {}).portionWeightG === 125
        && canon(parSid(F2, EAN_B)) === canon(parSid(S0.F0, EAN_B)), J(F2.map(f => [f.sourceId, f.portionWeightG])));
    } finally { await A.cx.close(); }
  }

  /* ═══ A — RÈGLE D'OR #11 (points 2 à 5) : les QUATRE supports disent « à vérifier » de la même façon — point rouge, aide
         « ? » de l'onglet, aide détaillée, diapo du Guide. Mission du 23/10, §8 : la diapo du Guide ne le disait pas. ═══ */
  {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
    try {
      await cx.route('**/*', r => { const u = new URL(r.request().url()); return (u.hostname === 'localhost' || u.hostname === '127.0.0.1') ? r.continue() : r.abort(); });
      const pg = await cx.newPage(); await pg.goto('http://localhost:' + PORT + '/index.html'); await pause(pg, 1500);
      const S4 = await pg.evaluate(() => {
        const txt = v => String(v == null ? '' : v).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
        const nf = (typeof NEW_FEATURES !== 'undefined' ? NEW_FEATURES : []).find(x => x && x.id === 'nutri-v2-quantites');
        const gd = (typeof APP_GUIDE_SLIDES !== 'undefined' ? APP_GUIDE_SLIDES : []).find(s => s && /combien tu en as mangé/.test(s.t || ''));
        const plat = o => { const out = []; (function f(x) { if (typeof x === 'string') out.push(x); else if (x && typeof x === 'object') Object.keys(x).forEach(k => f(x[k])); })(o); return out; };
        const aide = plat(typeof _HELP_DATA !== 'undefined' ? _HELP_DATA : null).map(txt).filter(s => /Reprendre un aliment déjà noté/.test(s));
        const tiroir = plat(typeof _DRAWER_CONTENT !== 'undefined' ? _DRAWER_CONTENT : null).map(txt).filter(s => /Les grammes d'abord/.test(s));
        return { point: nf ? txt(nf.desc) : '', guide: gd ? txt(gd.cap) : null, aide: aide.join(' ¦ '), tiroir: tiroir.join(' ¦ ') };
      });
      const dit = s => /«\s?à vérifier\s?»/i.test(s || '') && /contredisent/.test(s || '');   // \s : espace normale OU insécable
      t('B-NIX A ① RÈGLE D\'OR #11 : point rouge, aide « ? », aide détaillée ET diapo du Guide disent qu\'un aliment dont les valeurs se contredisent est « à vérifier » (il ne se recopie plus en silence)',
        dit(S4.point) && dit(S4.aide) && dit(S4.tiroir) && dit(S4.guide), J({ point: !!dit(S4.point), aide: !!dit(S4.aide), tiroir: !!dit(S4.tiroir), guide: S4.guide === null ? 'diapo introuvable' : !!dit(S4.guide) }));
      t('B-NIX A ② … et l\'aide, l\'aide détaillée et le Guide disent que « + Ajouter » ouvre alors l\'écran (rien ne s\'écrit sans « Ajouter »)',
        [S4.aide, S4.tiroir, S4.guide].every(s => /«\s\+\sAjouter\s»\souvre/.test(s || '')), J({ guide: (S4.guide || '').slice(-260) }));
    } finally { await cx.close(); }
  }
}

module.exports = { croise };
