/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🔄 MAJV — LA VERSION AFFICHÉE EST CELLE DU CODE QUI TOURNE ; UNE MISE À JOUR EN ATTENTE SE VOIT ;
   ON N'INTERROMPT JAMAIS UNE SÉANCE ET ON NE PERD RIEN (lot E, mission « import PDF fidèle », 15/11/2026)
   Blocs : B-MAJV-O (l'oracle sait dire non) · B-MAJV-W (W1-W3 × Séance / Profil / Accueil) · B-MAJV-A (séance ouverte) ·
           B-MAJV-B (aucune perte) · B-MAJV-C (le libellé ne ment jamais) · B-MAJV-D (le garde numéro ↔ cache, SOURCE) ·
           B-MAJV-E (l'avis se ferme et se rouvre) · B-MAJV-F (R24 : une sortie visible ; le bouton central ne bouge pas).

   LE DÉFAUT (démontré le 14/11 par rejeu) : le libellé « À propos » lisait la CLÉ DU CACHE du service worker. Après une
   publication, une app restée ouverte sur un autre écran que l'Accueil affichait la version NEUVE (ft-v1267) alors que
   l'ANCIEN code (ft-v1266) tournait encore en mémoire — import non regroupé, éditeur sans « Aujourd'hui ». La mise à jour
   n'est appliquée que sur l'Accueil (décision de ft-v1184, Michel : ne jamais arracher l'écran) et AUCUN avis visible ne
   disait qu'elle attendait. Un chiffre qui ne dit pas ce qui tourne est pire qu'un chiffre absent : il fait chercher le
   défaut dans le mauvais code.

   CONDUIT : un vrai Chromium 390×844, le VRAI service worker (`sw.js`), le VRAI code de l'app, servis par un petit serveur
   local qui SIMULE LES PUBLICATIONS : à chaque « release » i, le serveur rend la même arbre avec (1) `sw.js` portant la clé
   de cache de la release, (2) la constante de version du code portant la MÊME clé (c'est ce que fait la personne qui publie),
   (3) un ORACLE posé dans `index.html` (`window.__FT_ORACLE`) — l'identité de la release dont les octets sont EN MÉMOIRE,
   indépendante de tout ce que l'app affiche —, (4) pour la release 0 seulement, la reconnaissance « X - échauffement »
   retirée de `log.js` : c'est l'ANCIEN code, celui que Michel avait encore en mémoire (le banc d'origine servait deux vrais
   exports ; ici une seule arbre, et ce retrait en tient lieu — contrôlé en B-MAJV-O).
   OBSERVE : l'étiquette de version (Menu, À propos), les éléments réellement VISIBLES (opacité, visibilité, présence dans
   l'écran — `innerText` garde le texte d'un toast éteint), le marqueur de la page (un rechargement l'efface), `S.wkt` et
   le stockage local avant / après, la géométrie du bouton central.
   W1-W3 (témoins du diagnostic du 14/11, portés ici) : W1 l'étiquette dit le code qui TOURNE · W2 une mise à jour qui ne peut pas
   s'appliquer maintenant se VOIT · W3 un import regroupe « X - échauffement » + « X » en UN exercice de 8 séries. ⚠️ W3 sur Séance et
   Profil ne peut tenir qu'APRÈS l'action offerte (« Mettre à jour ») : sur ces écrans l'ancien code reste en mémoire tant que
   la personne ne redémarre pas — c'est voulu (ft-v1184 : on n'arrache jamais l'écran) ; le témoin touche donc le bouton quand il existe.
   Sur la base (avant ce lot) le bouton n'existe pas : W1, W2 et W3 y sont ROUGES sur Séance et Profil, VERTS sur l'Accueil (contrôle).
   NE COUVRE PAS : Safari iOS (Chromium n'est pas un iPhone : l'application standalone, le gel d'une page en arrière-plan
   et la politique de cache de WebKit ne sont pas conduits), la vraie latence d'un déploiement GitHub Pages, un vrai PDF, et DEUX
   publications à la seconde près (voir `calme` : un défaut du service worker, antérieur à ce lot).
   ⛔ 0 appel réel (Worker, Apps Script, Supabase, Anthropic simulés ou refusés). Données ENTIÈREMENT FICTIVES (autres
   libellés, autres chiffres que ceux de n'importe quel vrai programme ; e-mail `diag@example.test`).
   Banc : tools/banc_maj_version.js · contrôle négatif : tools/mut_maj_version.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const http = require('http'), fs0 = require('fs'), path0 = require('path');
const RACINE = path0.resolve(__dirname, '../..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.ico': 'image/x-icon', '.wasm': 'application/wasm' };
const RE_CACHE = /const CACHE\s*=\s*'ft-v(\d+)'/;
const RE_BUILD = /(^|\n)const APP_BUILD\s*=\s*'ft-v(\d+)'/;
const ANCRE_ANCIEN = 'function _echNomQueue(name){';      // la reconnaissance « X - échauffement » (ft-v1267) : retirée dans la release 0

/* ── la clé de cache de la release i : le numéro RÉEL de l'arbre + i (calculée, jamais écrite : aucun numéro de version dans ce fichier) ── */
const N0 = +(RE_CACHE.exec(fs0.readFileSync(path0.join(RACINE, 'sw.js'), 'utf8')) || [0, 0])[1];
const cle = (i) => 'ft-v' + (N0 + i);

/* ── le serveur qui PUBLIE : `etat.i` est la release servie à cet instant ── */
function lire(rel) { return fs0.readFileSync(path0.join(RACINE, rel)); }
function corpsDe(rel, i, memo) {
  const k = rel + '#' + i; if (memo[k]) return memo[k];
  let s = lire(rel).toString('utf8');
  if (rel === 'sw.js') s = s.replace(RE_CACHE, () => "const CACHE = '" + cle(i) + "'");
  else if (rel === 'app.js') s = s.replace(RE_BUILD, (m, d) => d + "const APP_BUILD='" + cle(i) + "'");
  else if (rel === 'index.html') s = s.replace('<head>', '<head><script>window.__FT_ORACLE=' + i + ';</script>');
  else if (rel === 'log.js' && i === 0) { if (s.indexOf(ANCRE_ANCIEN) < 0) throw new Error('ancre de l\'ancien code introuvable : ' + ANCRE_ANCIEN); s = s.replace(ANCRE_ANCIEN, ANCRE_ANCIEN + 'return null;'); }
  return (memo[k] = Buffer.from(s, 'utf8'));
}
function serveur(etat) {
  const memo = {};
  return http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
    const f = path0.join(RACINE, p);
    if (!f.startsWith(RACINE) || !fs0.existsSync(f) || fs0.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
    const rel = p.slice(1); let corps;
    try { corps = (['sw.js', 'app.js', 'index.html', 'log.js'].indexOf(rel) >= 0) ? corpsDe(rel, etat.i, memo) : lire(rel); }
    catch (e) { r.writeHead(500); return r.end(String(e.message)); }
    r.writeHead(200, { 'Content-Type': TYPES[path0.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    r.end(corps);
  });
}

/* ── utilitaires ── */
const dormir = (ms) => new Promise(r => setTimeout(r, ms));
async function attendre(cond, ms, pas) { const t0 = Date.now(); while (Date.now() - t0 < (ms || 30000)) { try { if (await cond()) return true; } catch (e) {} await dormir(pas || 200); } return false; }
const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 'diag@example.test',
  ft4_ok: '1', ft4_stmig1: '1', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_tester_eq_v1: '1', ft4_seen_ft: '[]', ft4_menu_ack: '[]' };

/* un programme ENTIÈREMENT INVENTÉ, à la FORME qui a fait le défaut : « X - échauffement » (5 séries) puis « X » (3 séries) */
const L = (name, reps, note, kg) => ({ name, sets: reps.length, reps: reps[0], repsPerSet: reps.slice(), specialSets: [], kg: 0, kgPerSet: kg || [], supersetGroup: '', setType: '', note: note || '' });
const PROG = { name: 'Cycle fictif', weeks: 0, startDate: '', days: [
  { label: 'JOUR 1 - ÉPAULES', exercises: [
    L('Développé militaire - échauffement', [12, 8, 5, 3, 2], '', [20, 30, 40, 47.5, 52.5]),
    L('Développé militaire', [5, 5, 5], 'RIR 2', [57.5, 57.5, 57.5]),
    L('Tractions', [6, 6, 6], 'RIR 2') ] },
  { label: 'JOUR 2 - JAMBES', exercises: [
    L('Squat à la barre - échauffement', [10, 6, 3], '', [40, 60, 80]),
    L('Squat à la barre', [4, 4, 4], 'RIR 2', [95, 95, 95]) ] } ] };

/* ── ouvrir un scénario : serveur + contexte (VRAI service worker) + page, posée sur la release 0 ── */
async function ouvrir(b, opts) {
  opts = opts || {};
  const etat = { i: 0 }, srv = serveur(etat);
  await new Promise(r => srv.listen(0, r));
  const url = 'http://localhost:' + srv.address().port + '/';
  const ctx = await b.newContext({ serviceWorkers: 'allow', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
  const dehors = [];
  await ctx.route(/supabase\.co|anthropic\.com|workers\.dev|script\.google\.com/, async rt => {
    const rq = rt.request(); let c = {}; try { c = JSON.parse(rq.postData() || '{}'); } catch (e) {}
    if (c.action === 'importProgram') return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: JSON.parse(JSON.stringify(PROG)) }) });
    if (/supabase\.co|anthropic\.com/.test(rq.url())) { dehors.push(rq.url().slice(0, 60)); return rt.abort(); }
    return rt.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
  });
  const pg = await ctx.newPage(); const erreurs = []; pg.on('pageerror', e => erreurs.push(String(e.message || e).slice(0, 160)));
  await pg.addInitScript(base => { try { if (!localStorage.getItem('ft4_ok')) for (const k in base) localStorage.setItem(k, base[k]); } catch (e) {} }, BASE);
  await pg.goto(url, { waitUntil: 'load' });
  const sc = { etat, srv, ctx, pg, url, erreurs, dehors, fermer: async () => { try { await ctx.close(); } catch (e) {} try { srv.close(); } catch (e) {} } };
  await poser(pg, 0);
  return sc;
}
/* la page est « posée » quand le service worker de la release `i` la contrôle, que son cache existe et qu'elle ne se recharge plus (la 1ʳᵉ installation recharge l'app UNE fois : voulu) */
async function poser(pg, i) {
  const ok = await attendre(() => pg.evaluate(async k => (await caches.keys()).indexOf(k) >= 0 && !!navigator.serviceWorker.controller && typeof S !== 'undefined' && typeof goScreen === 'function', cle(i)), 40000);
  if (!ok) return false;
  let origine = null, stable = 0;
  await attendre(async () => {
    let o; try { o = await pg.evaluate(() => performance.timeOrigin); } catch (e) { origine = null; stable = 0; return false; }
    if (o === origine) stable++; else { origine = o; stable = 0; }
    return stable >= 6;                                          // 6 lectures de 400 ms sur le même document : plus de rechargement en route
  }, 40000, 400);
  await attendre(() => pg.evaluate(() => { const t = document.getElementById('toast'); return !t || !/show/.test(t.className); }), 10000);
  return true;
}
const marquer = (pg) => pg.evaluate(() => { window.__marqueur = 'avant'; });
const rechargee = async (pg, ms) => attendre(async () => { try { return await pg.evaluate(() => window.__marqueur !== 'avant'); } catch (e) { return true; } }, ms || 15000, 250);
async function publier(sc) {
  sc.etat.i++;
  await sc.pg.evaluate(async () => { try { const r = await navigator.serviceWorker.getRegistration(); await r.update(); } catch (e) {} }).catch(() => {});
}
/* la publication i est « posée » côté navigateur : le service worker a fini d'activer (l'ancien cache est supprimé, le sien est le seul).
   ⚠️ DEUX PUBLICATIONS À LA SECONDE PRÈS sont un autre sujet, MESURÉ le 15/11 (diagnostic hors dépôt) : l'activation du 1ᵉʳ service worker supprime le cache que le 2ᵉ vient de
   créer, et le 2ᵉ supprime celui du 1ᵉʳ — plus AUCUN cache `ft-v…` (l'app se répare à l'ouverture suivante, `ENSURE_PRECACHE`). Antérieur à ce lot, et rare ; le banc attend donc
   la fin de chaque activation avant de publier la suivante (voir « risques résiduels » du rapport). */
async function calme(sc, i) {
  return attendre(async () => { const k = await sc.pg.evaluate(async () => (await caches.keys()).filter(x => x.indexOf('ft-v') === 0)); return k.length === 1 && k[0] === cle(i); }, 25000, 250);
}
/* la mise à jour est « reçue » : soit la page a reçu l'avis du service worker (elle l'attend), soit elle s'est déjà rechargée toute seule (Accueil) */
async function recue(sc, ms) {
  return attendre(async () => { try { return await sc.pg.evaluate(() => window.__marqueur !== 'avant' || !!window._swReloadPending); } catch (e) { return true; } }, ms || 40000, 250);
}
async function allerA(pg, ecran) { await pg.evaluate(e => { goScreen(e, document.getElementById('nb-' + e)); }, ecran); await dormir(350); }

/* ── ce qu'un humain voit : texte ET opacité ET visibilité ET présence dans l'écran (320 ms de transition comprises) ── */
async function lireEtat(pg) {
  return pg.evaluate(async () => {
    const visible = (el) => { for (let n = el; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.1) return false; }
      const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
    const avis = [...document.querySelectorAll('body *')].filter(el => el.children.length === 0 && /mise à jour|nouvelle version|redémarre|rouvre l.app/i.test(el.textContent || '')).filter(visible).map(el => (el.textContent || '').trim().slice(0, 90));
    const nb = document.getElementById('nb-log'), r = nb ? nb.getBoundingClientRect() : null;
    return { oracle: window.__FT_ORACLE, marque: window.__marqueur === 'avant', ecran: window._curScreen, enAttente: !!window._swReloadPending,
      versions: [...document.querySelectorAll('.app-ver')].map(e => (e.textContent || '').trim()), majTextes: [...document.querySelectorAll('.app-maj')].map(e => (e.textContent || '').trim()),
      avis, fab: r ? [Math.round(r.x * 10) / 10, Math.round(r.y * 10) / 10, Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10].join(',') : null,
      ftv: [...(await caches.keys())].filter(k => k.indexOf('ft-v') === 0) };
  });
}
const lireSur = async (pg) => { for (let k = 0; k < 4; k++) { try { return await lireEtat(pg); } catch (e) { await dormir(400); } } return null; };
/* l'étiquette du Menu telle qu'une personne la lit (on ouvre le Menu : c'est ce qui la rafraîchit) et le badge d'« À propos » */
async function lireEtiquettes(pg) {
  const r = { menu: [], apropos: null };
  try {
    await pg.evaluate(() => { try { openMenuDrawer(); } catch (e) {} }); await dormir(600);
    r.menu = await pg.evaluate(() => [...document.querySelectorAll('.app-ver')].map(e => (e.textContent || '').trim()));
    /* le pied du Menu tel qu'on le lit — SANS l'adresse de contact qui le suit (aucune adresse dans un journal de test) */
    r.menuPied = await pg.evaluate(() => { const e = document.querySelector('#menu-drawer .app-ver'); return e && e.parentElement ? e.parentElement.textContent.replace(/\S+@\S+/g, '(adresse)').replace(/\s+/g, ' ').trim() : null; });
    await pg.evaluate(() => { try { closeMenuDrawer(); openDrawerContent('about'); } catch (e) {} }); await dormir(700);
    r.apropos = await pg.evaluate(() => { const e = document.getElementById('_about-ver'); return e ? (e.textContent || '').trim() : null; });
    r.aproposMaj = await pg.evaluate(() => { const e = document.querySelector('#drawer-cnt-body .app-maj'); return e ? (e.textContent || '').trim() : null; });
    await pg.evaluate(() => { try { closeDrawerContent(); } catch (e) {} }); await dormir(250);
  } catch (e) { r.erreur = String(e.message || e).slice(0, 100); }
  return r;
}
/* un import de programme par la VRAIE chaîne (réponse du Worker simulée), jusqu'au programme ENREGISTRÉ */
async function importer(pg) {
  return pg.evaluate(async () => {
    S.premium = true; S.programmes = []; S.customExercises = []; persist();
    _impPhotos = [{ type: 'text/plain', data: 'programme', name: 'prog.txt', isText: true }]; _impMode = 'new';
    await analyzeImportPhotos(); finalImportProg();
    const p = S.programmes[S.programmes.length - 1];
    return (p.days || []).map(d => (d.exs || []).map(e => ({ nom: e.name, n: (e.sets || []).length, types: (e.sets || []).map(s => s.type || '').join('') })));
  });
}
const naz = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const groupe = (jours) => { const x = (jours && jours[0] || []).filter(e => /^developpe militaire/.test(naz(e.nom))); return x.length === 1 && x[0].n === 8 && x[0].types === 'ÉÉÉÉÉNNN'; };
const resume = (jours) => (jours && jours[0] || []).map(e => e.nom + '(' + e.n + ' ' + e.types + ')').join(' + ');

/* ═════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.pur = function (t, ROOT, fs, path) {
  console.log('\n═══ B-MAJV-D (source). LE NUMÉRO DU CODE QUI TOURNE = CELUI DU CACHE (R2 : deux endroits, un garde) ═══');
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'), app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const mc = RE_CACHE.exec(sw), mb = RE_BUILD.exec(app);
  t('MAJV-D1 le numéro de cache existe (sw.js) ET le code porte la constante de SA version (app.js : APP_BUILD)', !!mc && !!mb, 'cache : ' + (mc ? mc[1] : 'absent') + ' · constante : ' + (mb ? mb[2] : 'ABSENTE'));
  t('MAJV-D2 ⛔⛔ APP_BUILD (le code) = const CACHE (le service worker) : un nouveau numéro se pose aux DEUX endroits, sinon la livraison est refusée',
    !!mc && !!mb && mc[1] === mb[2], 'cache ft-v' + (mc ? mc[1] : '?') + ' · code ft-v' + (mb ? mb[2] : '?'));
  t('MAJV-D3 la constante n\'est déclarée qu\'UNE fois (une seconde copie divergerait en silence)', (app.match(/(^|\n)const APP_BUILD\b/g) || []).length === 1);
};


/* ── le bandeau tel qu'on le VOIT : présence réelle, taille, texte, et ce qu'il fait au reste de l'écran ── */
async function lireBandeau(pg) {
  try {
    return await pg.evaluate(() => {
      const mesure = (id) => { const e = document.getElementById(id); if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
        let vis = cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
        for (let n = e; vis && n && n !== document.body; n = n.parentElement) if (parseFloat(getComputedStyle(n).opacity) < 0.1) vis = false;
        return { vis, x: r.x, y: r.y, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, bas: r.bottom, txt: (e.textContent || '').replace(/\s+/g, ' ').trim() }; };
      /* lot M (D-176) : l'en-tête global n'existe que sur l'Accueil — ailleurs il est `display:none`. `hautSuite` = le haut de ce qui SUIT le bandeau dans le flux : l'en-tête quand il est affiché, sinon l'écran (`.screens`).
         Le « ? » de l'en-tête n'est mesuré que s'il est affiché (un bouton dans un en-tête masqué n'est « couvert » par rien : il n'existe pas à l'écran). */
      const tb = document.querySelector('.topbar'), tbVu = !!tb && getComputedStyle(tb).display !== 'none';
      const suite = tbVu ? tb.getBoundingClientRect().top : (document.querySelector('.screens') ? document.querySelector('.screens').getBoundingClientRect().top : null);
      const aide = tbVu ? document.querySelector('.topbar button[title="Aide"]') : null; let aideCouvert = null;
      if (aide) { const r = aide.getBoundingClientRect(); const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); aideCouvert = !(el && aide.contains(el)); }
      return { b: mesure('maj-banner'), txt: mesure('maj-txt'), go: mesure('maj-restart'), plus: mesure('maj-later'), hautTopbar: tbVu ? tb.getBoundingClientRect().top : null, hautSuite: suite, aideCouvert };
    });
  } catch (e) { return null; }
}
const voit = (bn) => !!(bn && bn.b && bn.b.vis);
const stockage = (pg) => pg.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
const differences = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => a[k] !== b[k]).sort();
const sansMaj = (v) => !/mise à jour/i.test(v || '');
/* le toast « ✅ Application mise à jour » qui suit un redémarrage est une CONFIRMATION, pas un avis d'attente : on ne le compte pas */
const sansConfirmation = (avis) => (avis || []).filter(x => !/^✅ Application mise à jour/.test(x));
/* les OUTILS de ce banc (le serveur qui publie, la page posée sur une release, la lecture du bandeau…) : le banc `seance_maj.js` (B-SCMAJ, D-170) les réutilise au lieu de les recopier (R2) */
module.exports.aide = { serveur, ouvrir, poser, publier, recue, calme, allerA, lireBandeau, voit, marquer, rechargee, dormir, attendre, cle, stockage };

/* ═════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-MAJV (écran conduit). LA VERSION AFFICHÉE EST CELLE DU CODE QUI TOURNE ; UNE MISE À JOUR EN ATTENTE SE VOIT ═══');
  const T = t;
  const js = (x) => JSON.stringify(x).slice(0, 320);
  const SEUL = (process.env.MAJV_SEUL || '').split(',').filter(Boolean);     // développement et contrôle négatif : « MAJV_SEUL=A,B » ne joue que ces scénarios ; vide (la passe) = tous
  const garde = async (nom, f) => { if (SEUL.length && SEUL.indexOf(nom) < 0) return; try { await f(); } catch (e) { T('MAJV-' + nom + ' ⛔ le scénario s\'est exécuté jusqu\'au bout', false, String(e && e.stack || e).slice(0, 500)); } };
  const NOM = { log: 'Séance', setup: 'Profil', home: 'Accueil' };
  /* aucune erreur JS non attrapée pendant tout le parcours — rechargements compris : une erreur dans l'écouteur de mise à jour ne casse rien de visible, sauf la mise à jour elle-même */
  const sansErreurJs = (nom, sc) => T('MAJV-X-' + nom + ' 0 erreur JS de page pendant tout le parcours (publications, bandeau, redémarrage compris)', sc.erreurs.length === 0, js(sc.erreurs));

  /* ── B-MAJV-O · L'ORACLE SAIT DIRE NON : sans lui, W3 ne mesurerait rien (un témoin qui ne peut pas rougir rassure) ── */
  await garde('O', async () => {
    const sortie = {};
    for (const i of [0, 1]) {
      const etat = { i }, srv = serveur(etat); await new Promise(r => srv.listen(0, r));
      const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
      await ctx.route(/supabase\.co|anthropic\.com|workers\.dev|script\.google\.com/, async rt => {
        let c = {}; try { c = JSON.parse(rt.request().postData() || '{}'); } catch (e) {}
        if (c.action === 'importProgram') return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: JSON.parse(JSON.stringify(PROG)) }) });
        return rt.abort();
      });
      const pg = await ctx.newPage();
      await pg.addInitScript(base => { try { if (!localStorage.getItem('ft4_ok')) for (const k in base) localStorage.setItem(k, base[k]); } catch (e) {} }, BASE);
      await pg.goto('http://localhost:' + srv.address().port + '/', { waitUntil: 'load' });
      await attendre(() => pg.evaluate(() => typeof S !== 'undefined' && typeof analyzeImportPhotos === 'function'), 20000); await dormir(1200);
      sortie[i] = { oracle: await pg.evaluate(() => window.__FT_ORACLE), jours: await importer(pg) };
      await ctx.close(); srv.close();
    }
    T('MAJV-O1 ⛔ l\'ANCIEN code simulé (release 0) NE regroupe PAS « X - échauffement » + « X » : l\'oracle sait dire non (sinon W3 ne mesure rien)',
      sortie[0].oracle === 0 && !groupe(sortie[0].jours), js(sortie[0]));
    T('MAJV-O2 le code courant (release 1) regroupe : « Développé militaire » = UN exercice de 8 séries (5 É puis 3 N)',
      sortie[1].oracle === 1 && groupe(sortie[1].jours), js(sortie[1]));
    T('MAJV-O3 deux releases = deux clés de cache différentes (c\'est ce qui déclenche une vraie mise à jour du service worker)', cle(0) !== cle(1), cle(0) + ' / ' + cle(1));
  });

  /* ── B-MAJV-W · W1, W2, W3 sur trois écrans : Séance (le cas de Michel), Profil, Accueil (le contrôle). Le parcours Profil porte aussi C, E et F. ── */
  for (const ecran of ['log', 'setup', 'home']) {
    await garde('W-' + ecran, async () => {
      const sc = await ouvrir(b);
      try {
        const { pg } = sc, plus = ecran === 'setup';
        await marquer(pg); await allerA(pg, ecran);
        /* AVANT toute publication : l'étiquette dit déjà la vérité, et rien n'annonce de mise à jour (C1, F0) */
        let et0 = null, e0 = null;
        if (plus) {
          e0 = await lireSur(pg); et0 = await lireEtiquettes(pg);
          /* « en attente » SANS rien de plus récent (la toute 1ʳᵉ installation du service worker, par exemple) n'est PAS une mise à jour : ni bandeau, ni phrase */
          await pg.evaluate(() => { _reloadForUpdate(); }); await dormir(900);
          const eN = await lireSur(pg), bnN = await lireBandeau(pg);
          await pg.evaluate(() => { window._swReloadPending = false; window._majVersion = null; if (typeof _majRefresh === 'function') _majRefresh(); });
          T('MAJV-C5 ⛔ une mise à jour « en attente » SANS version plus récente (1ʳᵉ installation du service worker) n\'annonce rien : ni bandeau, ni « mise à jour … prête »',
            !!eN && eN.enAttente && !voit(bnN) && eN.avis.length === 0 && eN.majTextes.every(x => !x), js({ enAttente: eN && eN.enAttente, bandeau: voit(bnN), avis: eN && eN.avis, maj: eN && eN.majTextes }));
        }
        await publier(sc);
        const recu = await recue(sc);
        /* ⭐ RÉÉCRIT le 17/11/2026 (lot M, D-170 : AUCUN rechargement automatique, même sur l'Accueil). AVANT : sur l'Accueil la page se rechargeait toute seule (`poser(pg, 1)` attendait le code NEUF en mémoire) — c'était « le contrôle »
           qui prouvait que la voie automatique marchait. L'INVARIANT GARDÉ : W1 (l'étiquette dit le code qui TOURNE), W2 (une mise à jour en attente se VOIT), W3 (un import sur le code qui tourne regroupe) valent aussi sur l'Accueil.
           CHANGÉ : sur l'Accueil le code reste l'ANCIEN en mémoire jusqu'au choix « Mettre à jour » (comme sur Séance et Profil) — c'est W4-home qui le dit. Ce qui rougirait : le retour du rechargement automatique. */
        {
          await attendre(async () => (await lireSur(pg) || { avis: [] }).avis.length > 0, 8000, 300);
          /* ⚠️ ON LIT APRÈS L'ACTIVATION, pas pendant : entre l'avis du service worker et la suppression de l'ANCIEN cache (~1 s), `caches.keys()` rend encore les DEUX clés, la
             première étant l'ancienne — l'ancien libellé (celui qui lisait le cache) y est juste PAR HASARD. Mesuré par le contrôle négatif (mutation « le libellé relit le cache »,
             verte quand on lisait trop tôt) : un témoin qui lit dans la fenêtre où le défaut ne se voit pas ne mesure rien. */
          await calme(sc, 1);
        }
        const e = await lireSur(pg), bn = (plus || ecran === 'home') ? await lireBandeau(pg) : null;
        const et = await lireEtiquettes(pg);
        if (ecran === 'home') {
          /* W4-home : sur l'ACCUEIL, rien en cours, version plus récente installée : la page n'est PAS rechargée (marqueur intact, code ancien en mémoire), le bandeau se PROPOSE et nomme la version */
          T('MAJV-W4-home ⛔⛔ sur l\'ACCUEIL, rien en cours : AUCUN rechargement automatique (le marqueur de la page est intact, le code en mémoire est l\'ancien) — la mise à jour est PROPOSÉE (bandeau visible, version nommée)',
            !!e && e.marque && e.oracle === 0 && e.enAttente && voit(bn) && new RegExp(cle(1)).test(bn.txt.txt), js({ marque: e && e.marque, oracle: e && e.oracle, bandeau: voit(bn), txt: bn && bn.txt && bn.txt.txt }));
        }
        const vrai = e ? cle(e.oracle) : '?';
        console.log('   ── ' + NOM[ecran] + ' : mise à jour reçue ? ' + recu + ' · code en mémoire : release ' + (e && e.oracle) + ' (' + vrai + ') · caches ' + (e && e.ftv.join(',')) + ' · Menu : ' + (et.menuPied || '?') + ' · À propos : ' + et.apropos + ' | ' + et.aproposMaj);
        T('MAJV-W1-' + ecran + ' [' + NOM[ecran] + '] l\'étiquette « À propos » dit la vérité : le code qui tourne EST celui qu\'elle annonce (Menu ET badge)',
          !!e && et.menu.length > 0 && et.menu.every(v => v === vrai) && et.apropos === vrai, 'code en mémoire ' + vrai + ' · Menu ' + js(et.menu) + ' · badge ' + et.apropos);
        T('MAJV-W2-' + ecran + ' [' + NOM[ecran] + '] si la mise à jour ne peut pas s\'appliquer maintenant, la personne le VOIT (élément réellement visible : texte, opacité, visibilité, dans l\'écran)',
          !!e && recu && (e.oracle === 1 || e.avis.length > 0), 'code en mémoire release ' + (e && e.oracle) + ' · en attente ' + (e && e.enAttente) + ' · textes visibles ' + js(e && e.avis));

        if (plus) {
          /* C · le libellé ne dit JAMAIS une version plus récente que le code qui tourne */
          T('MAJV-C1 avant toute publication : l\'étiquette (Menu et badge) dit le code qui tourne, et rien n\'annonce de mise à jour',
            !!e0 && et0.menu.length > 0 && et0.menu.every(v => v === cle(0)) && et0.apropos === cle(0) && sansMaj(et0.menuPied) && !(et0.aproposMaj || '') && e0.avis.length === 0, js({ e0: e0 && e0.avis, et0 }));
          T('MAJV-C2 ⛔ mise à jour en attente : `.app-ver` reste le code qui TOURNE (jamais le cache), et la version qui attend se dit À PART (« mise à jour ' + cle(1) + ' prête »)',
            et.menu.every(v => v === cle(0)) && et.apropos === cle(0) && et.menu.every(sansMaj)
            && new RegExp('mise à jour ' + cle(1) + ' prête').test(et.menuPied || '') && new RegExp('mise à jour ' + cle(1) + ' prête').test(et.aproposMaj || ''),
            'Menu ' + js(et.menu) + ' · pied « ' + et.menuPied + ' » · À propos « ' + et.apropos + ' | ' + et.aproposMaj + ' »');
          T('MAJV-C4 `.app-ver` ne porte QUE le numéro (l\'export et le banc de Milo le recopient tel quel) : jamais la phrase « mise à jour »',
            et.menu.length > 0 && et.menu.every(v => /^ft-v\d+$/.test(v)) && /^ft-v\d+$/.test(et.apropos || ''), js(et.menu) + ' · ' + et.apropos);

          /* F · R24 : une SORTIE visible ; le bandeau pousse, il ne recouvre pas ; le bouton central ne bouge pas (règle d'or #9, MESURÉ) */
          T('MAJV-F1 ⛔ R24 : la sortie « Plus tard » est VISIBLE, lisible, et se vise du pouce (≥ 40 × 40 px)',
            !!bn && !!bn.plus && bn.plus.vis && /plus tard/i.test(bn.plus.txt) && bn.plus.h >= 40 && bn.plus.w >= 40, js(bn && bn.plus));
          T('MAJV-F2 l\'action explicite « Mettre à jour » est visible et se vise du pouce (≥ 40 px de haut)',
            !!bn && !!bn.go && bn.go.vis && /mettre à jour/i.test(bn.go.txt) && bn.go.h >= 40, js(bn && bn.go));
          T('MAJV-F3 ⛔⛔ RÈGLE D\'OR #9 : le bouton central « + » NE BOUGE PAS quand le bandeau apparaît (position et taille MESURÉES avant / pendant)',
            !!e0 && !!e && !!e0.fab && e0.fab === e.fab, 'avant ' + (e0 && e0.fab) + ' · pendant ' + (e && e.fab));
          /* RÉÉCRIT le 16/11/2026 (CE lot M, D-176). AVANT : « il finit où l'EN-TÊTE commence, et le bouton « ? » de l'en-tête reste atteignable » — sur l'écran Profil, que la décision D-176 prive d'en-tête global (`display:none`, `hautTopbar`
             valait 0 : 80 ≤ 0 était faux). L'INVARIANT GARDÉ, tel quel : le bandeau POUSSE ce qui le suit, il ne le recouvre pas (il finit où commence l'élément SUIVANT du flux — l'en-tête quand il existe, sinon l'écran), et
             quand le « ? » de l'en-tête existe à l'écran il n'est pas couvert. Un bandeau posé PAR-DESSUS l'écran (position fixe) ou un « ? » recouvert le feraient toujours rougir. */
          T('MAJV-F4 le bandeau POUSSE le contenu au lieu de le recouvrir : il finit où commence ce qui le suit (l\'en-tête global quand il est affiché, sinon l\'écran), et le bouton « ? » de l\'en-tête, quand il existe, reste atteignable',
            voit(bn) && bn.hautSuite != null && bn.b.bas <= bn.hautSuite + 0.5 && bn.aideCouvert !== true, js({ bandeauBas: bn && bn.b && bn.b.bas, suiteHaut: bn && bn.hautSuite, enteteHaut: bn && bn.hautTopbar, aideCouvert: bn && bn.aideCouvert }));
          T('MAJV-F5 le bandeau dit ce qui attend (la version nommée) et tient dans l\'écran (390 px)',
            voit(bn) && new RegExp(cle(1)).test(bn.txt.txt) && bn.b.w <= 390 && bn.b.x >= 0, js(bn && bn.txt));

          /* E · l'avis se ferme et se rouvre (R15 : un seul chemin de fermeture, UN marqueur — lu par toute réévaluation) */
          const k0 = await stockage(pg);
          const ferme = await pg.click('#maj-later', { timeout: 4000 }).then(() => true, () => false);
          await dormir(500);
          const k1 = await stockage(pg), e2 = await lireSur(pg), bn2 = await lireBandeau(pg);
          T('MAJV-E1 ⛔ « Plus tard » ferme l\'avis : plus aucun texte de mise à jour à l\'écran', ferme && !voit(bn2) && !!e2 && e2.avis.length === 0, 'clic ' + ferme + ' · ' + js(e2 && e2.avis));
          await allerA(pg, 'progress'); const bn3 = await lireBandeau(pg);
          await allerA(pg, 'nutrition'); const bn4 = await lireBandeau(pg);
          await allerA(pg, 'coach'); const bn5 = await lireBandeau(pg);
          T('MAJV-E2 ⛔ R15 : fermé pour CETTE version, il ne revient pas à chaque changement d\'écran (Progrès, Nutrition, Coach) — le marqueur est lu par toute réévaluation',
            ferme && !voit(bn3) && !voit(bn4) && !voit(bn5), 'Progrès ' + voit(bn3) + ' · Nutrition ' + voit(bn4) + ' · Coach ' + voit(bn5));
          const et2 = await lireEtiquettes(pg);
          T('MAJV-E3 fermer l\'avis ne cache pas l\'INFORMATION : l\'étiquette dit toujours « mise à jour ' + cle(1) + ' prête »', ferme && new RegExp('mise à jour ' + cle(1) + ' prête').test(et2.menuPied || ''), 'pied « ' + et2.menuPied + ' »');
          const d = differences(k0, k1);
          T('MAJV-E4 fermer l\'avis n\'écrit RIEN sur l\'appareil (aucune clé de stockage ajoutée ni modifiée : le marqueur vit en mémoire)', ferme && d.length === 0, 'clés touchées : ' + js(d));
          await calme(sc, 1);
          await publier(sc);
          await attendre(async () => voit(await lireBandeau(pg)), 25000, 300);
          const bn6 = await lireBandeau(pg), e6 = await lireSur(pg);
          T('MAJV-E5 ⛔ une version PLUS RÉCENTE rouvre l\'avis, et il la nomme (' + cle(2) + ')', ferme && voit(bn6) && new RegExp(cle(2)).test(bn6.txt.txt), 'visible ' + voit(bn6) + ' · ' + js(bn6 && bn6.txt) + ' · caches ' + js(e6 && e6.ftv));
        }

        /* W3 : la voie offerte à la personne (« Mettre à jour ») puis un import sur le code qui tourne */
        let applique = !!e && e.oracle >= 1;
        if (e && e.oracle === 0) {
          const ok = await pg.click('#maj-restart', { timeout: 4000 }).then(() => true, () => false);
          if (ok) { await rechargee(pg); applique = await poser(pg, sc.etat.i); }
        }
        const jours = await importer(pg);
        T('MAJV-W3-' + ecran + ' [' + NOM[ecran] + '] un import sur le code qui tourne regroupe « Développé militaire - échauffement » + « Développé militaire » en UN exercice de 8 séries (É×5 puis N×3)',
          groupe(jours), 'mise à jour appliquée ? ' + applique + ' · ' + resume(jours));
        if (plus) {
          const e3 = await lireSur(pg), et3 = await lireEtiquettes(pg), vrai3 = e3 ? cle(e3.oracle) : '?';
          T('MAJV-C3 après le redémarrage : l\'étiquette dit le code NEUF (' + vrai3 + '), et plus aucune mise à jour n\'est annoncée',
            !!e3 && e3.oracle === sc.etat.i && et3.menu.every(v => v === vrai3) && et3.apropos === vrai3 && sansMaj(et3.menuPied) && !(et3.aproposMaj || '') && sansConfirmation(e3.avis).length === 0, 'oracle ' + (e3 && e3.oracle) + ' · ' + js(et3));
        }
      } finally { sansErreurJs('W-' + ecran, sc); await sc.fermer(); }
    });
  }

  /* ── B-MAJV-A · UNE SÉANCE OUVERTE N'EST JAMAIS INTERROMPUE (a) — l'invariant d'avant, éprouvé de bout en bout ── */
  await garde('A', async () => {
    const sc = await ouvrir(b);
    try {
      const { pg } = sc;
      await marquer(pg); await allerA(pg, 'setup');
      await pg.evaluate(() => { window.__toasts = []; const o = window.toast; window.toast = function (m, ty) { window.__toasts.push(String(m)); return o.apply(this, arguments); }; });
      /* une 1ʳᵉ mise à jour attend, l'avis est à l'écran : la personne n'est pas en séance */
      await publier(sc); await recue(sc);
      await attendre(async () => voit(await lireBandeau(pg)), 25000, 300);
      const bn0 = await lireBandeau(pg);
      T('MAJV-A0 hors séance, hors de l\'Accueil : l\'avis est à l\'écran (le contrôle qui rend les témoins suivants lisibles : ils éprouvent sa DISPARITION)', voit(bn0), js(bn0 && bn0.b));
      /* … puis elle COMMENCE une séance, série faite : l'avis s'efface AUSSITÔT (jamais un bandeau pendant une séance) */
      await pg.evaluate(() => {
        S.wkt = { date: today(), exs: [{ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, type: 'N', done: true }, { kg: 100, reps: 5, type: 'N', done: false }] }], startTs: Date.now() - 120000 };
        persist();
      });
      await dormir(500);
      const bnDebut = await lireBandeau(pg), eDebut = await lireSur(pg);
      T('MAJV-A1 ⛔⛔ la séance COMMENCE alors que l\'avis est affiché : il s\'efface aussitôt (jamais de bandeau pendant une séance)', !voit(bnDebut) && !!eDebut && eDebut.avis.length === 0 && eDebut.marque, 'bandeau ' + voit(bnDebut) + ' · textes ' + js(eDebut && eDebut.avis));
      const wkt0 = await pg.evaluate(() => JSON.stringify(S.wkt)), stock0 = (await stockage(pg)).ft4_wkt;
      /* une 2ᵉ mise à jour arrive PENDANT la séance : c'est le cas de Michel (15/08, 18/08) */
      await calme(sc, 1);
      await pg.evaluate(() => { window.__toasts = []; });
      await publier(sc);
      await attendre(async () => (await pg.evaluate(() => (window.__toasts || []).some(m => /Mise à jour disponible/.test(m)))), 25000, 300);
      await calme(sc, 2);
      await dormir(3500);                                    // le toast (2,8 s) est éteint : seul un avis PERMANENT pourrait encore se voir
      const e = await lireSur(pg), bn = await lireBandeau(pg);
      const wkt1 = e ? await pg.evaluate(() => JSON.stringify(S.wkt)) : null, stock1 = e ? (await stockage(pg)).ft4_wkt : null;
      T('MAJV-A2 ⛔⛔ séance ouverte, séries saisies, mise à jour reçue : AUCUN rechargement (le marqueur de la page est intact, la mise à jour attend)',
        !!e && e.marque && e.enAttente && e.oracle === 0, js(e && { marque: e.marque, enAttente: e.enAttente, oracle: e.oracle }));
      T('MAJV-A3 … et la séance est INTACTE, en mémoire comme dans le stockage (la série faite est toujours faite)',
        !!e && wkt1 === wkt0 && stock1 === stock0 && /"done":true/.test(wkt1 || ''), 'mémoire identique ' + (wkt1 === wkt0) + ' · stockage identique ' + (stock1 === stock0));
      const toasts = e ? await pg.evaluate(() => window.__toasts) : [];
      T('MAJV-A4 le toast prévient (« Mise à jour disponible — elle te sera proposée après ta séance ou ton enregistrement ») : pendant une séance, c\'est LUI qui prévient', toasts.some(m => /Mise à jour disponible — elle te sera proposée après ta séance ou ton enregistrement/.test(m)), js(toasts));
      await allerA(pg, 'log'); const bnLog = await lireBandeau(pg), eLog = await lireSur(pg);
      T('MAJV-A5 ⛔ pendant la séance, AUCUN bandeau, sur AUCUN écran (Profil comme Séance : le seul avis est le toast)',
        !voit(bn) && !voit(bnLog) && !!eLog && eLog.avis.length === 0, 'Profil ' + voit(bn) + ' · Séance ' + voit(bnLog) + ' · ' + js(eLog && eLog.avis));
      await pg.evaluate(() => { window.__toasts = []; });
      const refus = await pg.evaluate(() => (typeof majRedemarrer === 'function') ? majRedemarrer() : 'ABSENTE'); await dormir(800);
      const eRefus = await lireSur(pg), wkt2 = eRefus ? await pg.evaluate(() => JSON.stringify(S.wkt)) : null;
      const toastRefus = eRefus ? await pg.evaluate(() => window.__toasts) : [];
      T('MAJV-A6 ⛔⛔ « Mettre à jour » appelé PENDANT la séance REFUSE : rien ne se recharge, la séance est intacte, et la personne sait POURQUOI (« Pas maintenant — la mise à jour se propose après ta séance ou ton enregistrement »)',
        refus === false && !!eRefus && eRefus.marque && wkt2 === wkt0 && toastRefus.some(m => /Pas maintenant/.test(m)), 'retour ' + js(refus) + ' · marqueur ' + (eRefus && eRefus.marque) + ' · toasts ' + js(toastRefus));
      await pg.evaluate(() => { S.wkt.pausedAt = Date.now(); persist(); });
      const pause = await pg.evaluate(() => [_majPeutSAppliquer(true), (typeof majRedemarrer === 'function') ? majRedemarrer() : 'ABSENTE']); await dormir(600);
      const bnPause = await lireBandeau(pg), ePause = await lireSur(pg);
      T('MAJV-A7 une séance EN PAUSE n\'est pas une séance finie : ni bandeau, ni redémarrage', pause[0] === false && pause[1] === false && !voit(bnPause) && !!ePause && ePause.marque, js(pause) + ' · bandeau ' + voit(bnPause));
      /* la séance se termine (sans passer par l'écran de fin : on teste la DÉCISION, pas le récap — bloc XXII de la passe), en dehors de l'Accueil */
      await allerA(pg, 'setup');
      await pg.evaluate(() => { S.wkt = null; persist(); });
      await attendre(async () => voit(await lireBandeau(pg)), 8000, 300);
      const bnFin = await lireBandeau(pg), eFin = await lireSur(pg);
      T('MAJV-A8 la séance est finie, hors de l\'Accueil : l\'avis apparaît (il avait été retenu pendant la séance, il n\'était pas perdu)', voit(bnFin) && !!eFin && eFin.marque, 'visible ' + voit(bnFin) + ' · marqueur ' + (eFin && eFin.marque));
      await pg.evaluate(() => { goScreen('home', document.getElementById('nb-home')); });
      /* ⭐ A9 RÉÉCRIT le 17/11/2026 (lot M, D-170). AVANT : « de retour à l'ACCUEIL, rien en cours : la mise à jour s'applique TOUTE SEULE, comme avant (application automatique conservée) » — décision de ft-v1184 que Michel a RETIRÉE
         (« supprimer le rechargement automatique même sur l'Accueil »). L'INVARIANT GARDÉ : au retour à l'Accueil, la mise à jour en attente est prise en compte (elle n'est pas perdue) et finit par s'appliquer. CHANGÉ : elle se PROPOSE (bandeau)
         et s'applique par le choix « Mettre à jour » ; la page n'est PAS rechargée toute seule (marqueur intact). Ce qui rougirait : le retour du rechargement automatique au retour à l'Accueil. */
      await dormir(2500);
      const eHome = await lireSur(pg), bnHome = await lireBandeau(pg);
      T('MAJV-A9 ⛔⛔ de retour à l\'ACCUEIL, rien en cours : AUCUN rechargement automatique (le marqueur de la page est intact, l\'ancien code est en mémoire), la mise à jour se PROPOSE (bandeau, version nommée)',
        !!eHome && eHome.marque && eHome.ecran === 'home' && eHome.oracle < sc.etat.i && voit(bnHome) && new RegExp(cle(sc.etat.i)).test(bnHome.txt.txt), 'marqueur ' + (eHome && eHome.marque) + ' · oracle ' + (eHome && eHome.oracle) + ' · bandeau ' + voit(bnHome) + ' · ' + js(bnHome && bnHome.txt));
      const okA9 = await pg.click('#maj-restart', { timeout: 4000 }).then(() => true, () => false);
      const auto = okA9 && await rechargee(pg, 20000); await poser(pg, sc.etat.i);
      const eAuto = await lireSur(pg);
      const avisA9 = eAuto ? sansConfirmation(eAuto.avis) : ['?'];
      T('MAJV-A9b le choix « Mettre à jour » sur l\'Accueil : la page redémarre sur le code NEUF et plus rien n\'est annoncé', okA9 && auto && !!eAuto && eAuto.oracle === sc.etat.i && avisA9.length === 0, 'clic ' + okA9 + ' · rechargée ' + auto + ' · oracle ' + (eAuto && eAuto.oracle) + ' · textes ' + js(avisA9));
    } finally { sansErreurJs('A', sc); await sc.fermer(); }
  });

  /* ── B-MAJV-B · AUCUNE PERTE (b) — « Mettre à jour » enregistre D'ABORD, et le stockage ressort tel qu'il est entré ── */
  await garde('B', async () => {
    const sc = await ouvrir(b);
    try {
      const { pg } = sc;
      await pg.evaluate(() => {
        S.sessions = [{ id: 7001, ts: Date.now() - 86400000, date: '2026-11-13', label: 'Pousse', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 90, reps: 5, done: true, type: 'N' }] }], vol: 450 },
                      { id: 7002, ts: Date.now() - 172800000, date: '2026-11-12', label: 'Tire', exs: [{ name: 'Tractions', sets: [{ kg: 0, reps: 8, done: true, type: 'N' }] }], vol: 0 }];
        S.weightLog = [{ date: '2026-11-10', kg: 81.5 }];
        S.programmes = [{ name: 'Programme fictif', date: '2026-11-01', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 80, reps: 5, type: 'N', rest: 120 }] }] }];
        /* ⛔ LES DEUX BILANS QUI S'OUVRENT TOUT SEULS AU DÉMARRAGE sont déjà « annoncés » (la convention de `autre_activite.js`, qui dit pourquoi) : ils ne sont pas le sujet de ce bloc, et une fenêtre qui
           s'ouvre au démarrage RECOUVRE l'écran et intercepte le clic sur « Mettre à jour ».
           ⚠️ MESURÉ le 16/11/2026 (passe D-031, 02 h UTC) : B1 à B4 rouges, « clic false » — `checkWeeklySummary` n'agit que le LUNDI et résume la semaine lundi → dimanche PRÉCÉDENTE, et les 2 séances
           ci-dessus (12 et 13/11) y tombaient ; la veille (dimanche), 49/0. Le même piège attendait tout DÉCEMBRE : `checkMonthlySummary` annonce le mois écoulé (novembre) tant qu'il ne l'a pas été.
           Sonde et matrice de dates : `BUGS.md` §148 ⑩. */
        const t = today(), pm = new Date(Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 2, 15));
        S.lastWeekSummary = t; S.lastMonthSummary = pm.getUTCFullYear() + '-' + String(pm.getUTCMonth() + 1).padStart(2, '0');
        persist();
      });
      await allerA(pg, 'log');                                // « renderLog() crée une séance VIERGE dès qu'on affiche l'écran » : le seul état où l'on peut redémarrer
      await pg.evaluate(() => { persist(); });                // le stockage = la mémoire : sinon la séance vierge, créée en mémoire par l'écran, passerait pour une « différence »
      const norm = () => pg.evaluate(() => JSON.stringify(JSON.parse(JSON.stringify(S.wkt))));
      const wkt0 = await norm(), av = await stockage(pg);
      const nSess0 = await pg.evaluate(() => S.sessions.length), nProg0 = await pg.evaluate(() => S.programmes.length);
      /* le BRUIT d'un démarrage ordinaire : ce qu'un simple rechargement (sans mise à jour) change déjà — mesuré, pas supposé */
      await pg.reload({ waitUntil: 'load' }); await poser(pg, 0);
      const bruit = differences(av, await stockage(pg));
      await allerA(pg, 'log'); await marquer(pg);
      await pg.evaluate(() => { S.weightLog.push({ date: '2026-11-14', kg: 80.7 }); });       // ⛔ une écriture EN MÉMOIRE, volontairement NON enregistrée
      await publier(sc); await recue(sc);
      await attendre(async () => voit(await lireBandeau(pg)), 25000, 300);
      const ok = await pg.click('#maj-restart', { timeout: 4000 }).then(() => true, () => false);
      /* si le clic échoue, DIRE ce qui recouvre le bouton : « clic false » seul a coûté une passe entière à comprendre (16/11) */
      const recouvert = ok ? '' : await pg.evaluate(() => { try { const e = document.getElementById('maj-restart'); if (!e) return 'bouton absent'; const r = e.getBoundingClientRect(), h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return h ? 'recouvert par ' + ((h.closest('.overlay') || {}).id || h.id || h.tagName) : 'hors écran'; } catch (x) { return 'sonde impossible'; } }).catch(() => 'page fermée');
      let rech = false; if (ok) { rech = await rechargee(pg); await poser(pg, 1); }
      const ap = await stockage(pg), wkt1 = await norm();
      const nSess1 = await pg.evaluate(() => S.sessions.length), nProg1 = await pg.evaluate(() => S.programmes.length), kgMem = await pg.evaluate(() => S.weightLog.map(x => x.kg));
      /* ⚠️ `ft4_sb_last` n'est PAS une donnée de la personne : c'est la trace du DERNIER ESSAI de copie miroir (supabase.js), écrite quand une tentative réseau se TERMINE — donc selon le temps
         (mesuré le 15/11 : absente sur machine libre, présente sur machine chargée, 3 fois sur 3). Une clé qui dit « ce que le réseau a fait » ne dit pas « ce que la personne a perdu ». */
      const NON_DONNEES = ['ft4_sb_last'];
      const diff = differences(av, ap), inattendues = diff.filter(k => k !== 'ft4_wlog' && bruit.indexOf(k) < 0 && NON_DONNEES.indexOf(k) < 0);
      T('MAJV-B1 ⛔⛔ « Mettre à jour » ENREGISTRE D\'ABORD : une écriture en mémoire, jamais enregistrée, est dans le stockage ET dans l\'app après le redémarrage',
        ok && rech && /80\.7/.test(ap.ft4_wlog || '') && kgMem.indexOf(80.7) >= 0, 'clic ' + ok + (recouvert ? ' (' + recouvert + ')' : '') + ' · rechargée ' + rech + ' · stockage « ' + (ap.ft4_wlog || '').slice(0, 90) + ' » · mémoire ' + js(kgMem));
      T('MAJV-B2 ⛔ le reste du stockage ressort IDENTIQUE (seule la pesée ajoutée change ; le bruit d\'un démarrage ordinaire — ' + js(bruit) + ' — est mesuré, pas supposé)',
        ok && rech && inattendues.length === 0 && ap.ft4_just_updated === undefined, 'clés qui changent sans raison : ' + js(inattendues) + (ap.ft4_just_updated !== undefined ? ' · le drapeau de redémarrage est resté' : ''));
      T('MAJV-B3 la séance (`S.wkt`) est identique avant / après', ok && rech && wkt1 === wkt0, 'avant ' + wkt0.slice(0, 100) + ' · après ' + wkt1.slice(0, 100));
      T('MAJV-B4 aucune séance ni aucun programme perdu (2 séances, 1 programme avant ; autant après)', ok && rech && nSess0 === 2 && nSess1 === nSess0 && nProg0 === 1 && nProg1 === nProg0, nSess0 + '/' + nProg0 + ' → ' + nSess1 + '/' + nProg1);
    } finally { sansErreurJs('B', sc); await sc.fermer(); }
  });
};
