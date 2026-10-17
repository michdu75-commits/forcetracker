#!/usr/bin/env node
/* 🧪 BANC — ISOLEMENT DU CLONE DE TEST (D-084, conditions de Michel du 17/10/2026).
   Question unique : le clone peut-il LIRE, ÉCRIRE ou MODIFIER quoi que ce soit de la prod ?
   Le site est servi sous /forcetracker/ (comme GitHub Pages) avec les VRAIS service workers.
   ① une « prod » est remplie (stockage local, cookies, IndexedDB, caches du service worker) ;
   ② un instantané BRUT de la prod est pris depuis une page neutre (aucun script) ;
   ③ le clone est utilisé normalement PUIS agressivement (tout vider, vider le cache, réécrire
      cookies et IndexedDB, appeler le serveur, Milo, Supabase) ;
   ④ nouvel instantané brut : il doit être IDENTIQUE au premier ; aucune requête n'est partie ;
   ⑤ un navigateur où l'isolement échoue : le clone ne démarre pas ; un document sans isolement
      qui charge un script du clone : il s'en va sans rien exécuter.
   Usage : node tools/banc_clone_isolation.js [dossier-du-clone]   (défaut : clone/ du dépôt)
   Contrôle négatif : python3 tools/mut_clone_isolation.py */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
const CLONE = path.resolve(process.argv[2] || path.join(ROOT, 'clone'));
const M = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg',
  '.gif':'image/gif','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.ico':'image/x-icon','.wasm':'application/wasm','.txt':'text/plain'};
const VIDE = '<!doctype html><meta charset="utf-8"><title>vide</title><p>page neutre du banc</p>';
const SANS_SHIM = '<!doctype html><meta charset="utf-8"><title>sans-shim</title><body>document sans isolement<script src="clone/state.js"></script></body>';
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (!p.startsWith('/forcetracker/')) { r.writeHead(404); return r.end('404'); }
  p = p.slice('/forcetracker'.length);
  if (p === '/__vide.html') { r.writeHead(200, {'Content-Type': M['.html']}); return r.end(VIDE); }
  if (p === '/__sans-shim.html') { r.writeHead(200, {'Content-Type': M['.html']}); return r.end(SANS_SHIM); }
  if (p.endsWith('/')) p += 'index.html';
  const base = p.startsWith('/clone/') ? CLONE : ROOT, rel = p.startsWith('/clone/') ? p.slice('/clone'.length) : p;
  const f = path.join(base, rel);
  if (!f.startsWith(base) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
  fs.createReadStream(f).pipe(r);
});
let ok = 0, ko = 0;
const t = (nom, cond, det) => { if (cond) { ok++; console.log('   OK  ' + nom); } else { ko++; console.log('❌ ROUGE ' + nom + (det ? '  >> ' + String(det).slice(0, 300) : '')); } };
const attendre = ms => new Promise(r => setTimeout(r, ms));
/* Lecture d'une page qui peut se recharger sous nos pieds (une prod VIDÉE repart sur l'inscription et se recharge) :
   3 essais, puis {__err} — le témoin concerné ROUGIT avec la raison ; le banc ne plante jamais (un plantage ne prouve rien). */
async function lire(pg, fn) { let der = ''; for (let i = 0; i < 3; i++) { try { return await pg.evaluate(fn); } catch (e) { der = String(e && e.message || e); await attendre(1200); } } return { __err: der.slice(0, 200) }; }

/* Instantané BRUT de l'origine, lu depuis une page sans aucun script de l'app. */
async function instantane(cx, U) {
  const pg = await cx.newPage();
  await pg.goto(U + '/__vide.html');
  const s = await pg.evaluate(async () => {
    const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = localStorage.getItem(k); }
    const dbs = (await indexedDB.databases()).map(d => d.name).sort();
    const contenu = {};
    for (const n of dbs) {
      contenu[n] = await new Promise(res => { const rq = indexedDB.open(n); rq.onsuccess = () => { const db = rq.result; const o = {};
        const stores = [...db.objectStoreNames]; if (!stores.length) { db.close(); return res(o); }
        const tx = db.transaction(stores, 'readonly'); let reste = stores.length;
        stores.forEach(st => { const g = tx.objectStore(st).getAll(); g.onsuccess = () => { o[st] = g.result; if (--reste === 0) { db.close(); res(o); } }; });
      }; rq.onerror = () => res('erreur'); });
    }
    const caches_ = (await caches.keys()).sort();
    const regs = (await navigator.serviceWorker.getRegistrations()).map(r => r.scope).sort();
    return { ls, dbs, contenu, caches: caches_, cookie: document.cookie, regs };
  });
  s.cookiesCx = (await cx.cookies()).map(c => c.name + '|' + c.path + '|' + c.value).sort();
  await pg.close();
  return s;
}
const sansClone = s => ({
  ls: Object.fromEntries(Object.entries(s.ls).filter(([k]) => !k.startsWith('cl_'))),
  dbs: s.dbs.filter(n => !n.startsWith('cl_')),
  contenu: Object.fromEntries(Object.entries(s.contenu).filter(([k]) => !k.startsWith('cl_'))),
  caches: s.caches.filter(n => !n.startsWith('cl-')),
  cookie: s.cookie,
  cookiesProd: s.cookiesCx.filter(c => !c.startsWith('cl_')),
});

async function ouvrirApp(cx, url) {
  const pg = await cx.newPage();
  await pg.goto(url);
  await pg.waitForFunction(() => typeof S !== 'undefined' && typeof startWorkout === 'function', null, { timeout: 30000 }).catch(() => {});
  await attendre(1500);
  await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; }).catch(() => {});
  return pg;
}

(async () => {
  await new Promise(r => srv.listen(0, r));
  const U = 'http://localhost:' + srv.address().port + '/forcetracker';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const cx = await b.newContext({ serviceWorkers: 'allow', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });

  console.log('\n═══ B-CLONE ①② — la prod est remplie, puis photographiée brute ═══');
  const prod = await ouvrirApp(cx, U + '/index.html');
  await prod.evaluate(async () => {
    localStorage.setItem('ft4_email', 'michel.prod@example.test');
    localStorage.setItem('ft4_name', 'Prod');
    S.email = 'michel.prod@example.test';
    S.sessions = [{ id: 111, ts: Date.now() - 86400000, date: '2026-10-15', label: 'Push', exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }], vol: 500 }];
    persist();
    _saveEmailRedundant('michel.prod@example.test');
  });
  await attendre(1500);
  await prod.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 30000 }).catch(() => {});
  await attendre(1500);
  await prod.close();
  const P0 = await instantane(cx, U);
  t('B-CLONE-01 la prod a bien des données à protéger (stockage, cookie, IndexedDB, cache, service worker)',
    !!P0.ls.ft4_email && P0.cookie.includes('ft_email=') && P0.dbs.includes('ft_meta') && P0.caches.some(c => c.startsWith('ft-v')) && P0.regs.some(s => s.endsWith('/forcetracker/')),
    JSON.stringify({ email: P0.ls.ft4_email, cookie: P0.cookie, dbs: P0.dbs, caches: P0.caches, regs: P0.regs }));

  console.log('\n═══ B-CLONE ③ — le clone, utilisé normalement puis agressivement ═══');
  const sortantes = [];
  const clone = await cx.newPage();
  clone.on('request', rq => { const h = new URL(rq.url()).hostname; if (h !== 'localhost') sortantes.push(rq.url()); });
  await clone.goto(U + '/clone/');
  await clone.waitForFunction(() => navigator.serviceWorker.controller && /\/clone\/sw\.js$/.test(navigator.serviceWorker.controller.scriptURL), null, { timeout: 60000 }).catch(() => {});
  /* L'app se RECHARGE elle-même quand le service worker du clone prend la main (controllerchange) : notre rechargement peut
     croiser le sien (« navigation interrompue »). Ce n'est pas un défaut d'isolement — on attend simplement la page stable. */
  await clone.reload().catch(() => {}); await clone.waitForLoadState('load').catch(() => {});
  await clone.waitForFunction(() => typeof S !== 'undefined' && typeof startWorkout === 'function', null, { timeout: 30000 }).catch(() => {});
  await attendre(1500);
  const C1 = await clone.evaluate(() => ({ iso: window.__FT_CLONE_ISOLE__ === true, echecs: window.__FT_CLONE_ECHECS__ || null,
    sw: navigator.serviceWorker.controller ? navigator.serviceWorker.controller.scriptURL : null,
    email: (typeof S !== 'undefined' && S.email) || '', sessions: (typeof S !== 'undefined' && S.sessions) ? S.sessions.length : -1,
    lsEmail: localStorage.getItem('ft4_email'), cookie: document.cookie, bandeau: !!document.getElementById('clone-bandeau') }));
  t('B-CLONE-02 l\'isolement est VÉRIFIÉ au démarrage du clone (aucun canal en échec)', C1.iso && !C1.echecs, JSON.stringify(C1.echecs));
  t('B-CLONE-03 le clone est servi par SON service worker (portée /clone/)', /\/forcetracker\/clone\/sw\.js$/.test(C1.sw || ''), C1.sw);
  t('B-CLONE-04 le clone ne LIT rien de la prod : ni e-mail, ni séance, ni cookie', !C1.email && C1.sessions === 0 && C1.lsEmail === null && !/ft_email|michel\.prod/.test(C1.cookie), JSON.stringify(C1));
  t('B-CLONE-05 le bandeau « CLONE DE TEST » est affiché', C1.bandeau);

  // Usage normal : une séance commencée, une série validée, la séance terminée par la porte du chantier UX.
  await clone.evaluate(() => { startWorkout(); S.wkt.exs = [{ name: 'Squat', sets: [{ kg: 60, reps: 5, done: true, type: 'N' }] }]; persist(); terminerSeance(); });
  await attendre(400);
  await clone.evaluate(() => { const o = document.getElementById('ov-confirm'); if (o && o.classList.contains('open')) document.getElementById('confirm-ok').click(); });
  await attendre(2500);
  const C2 = await clone.evaluate(() => ({ sessions: S.sessions.length, cl: !!localStorage.getItem('ft4_sessions') }));
  t('B-CLONE-06 le clone FONCTIONNE avec son propre stockage : séance enregistrée chez lui', C2.sessions === 1 && C2.cl, JSON.stringify(C2));

  // Usage agressif : tout ce qui, dans le code, sait écrire ou effacer à l'échelle de l'origine.
  const C3 = await clone.evaluate(async () => {
    const r = {};
    _saveEmailRedundant('intrus.clone@example.test');                       // cookie ft_email + ft_had_data + IndexedDB ft_meta
    S.email = 'intrus.clone@example.test'; persist();
    document.cookie = 'ft_email=intrus@example.test;max-age=99999;path=/';
    document.cookie = 'ft_had_data=1;max-age=99999;path=/';
    await new Promise(res => { const rq = indexedDB.open('ft_meta', 1); rq.onupgradeneeded = e => e.target.result.createObjectStore('meta', { keyPath: 'key' });
      rq.onsuccess = e => { const tx = e.target.result.transaction('meta', 'readwrite'); tx.objectStore('meta').put({ key: 'email', value: 'intrus@example.test' }); tx.oncomplete = res; tx.onerror = res; }; rq.onerror = res; });
    await new Promise(res => { const d = indexedDB.deleteDatabase('ft_bodyphotos'); d.onsuccess = d.onerror = d.onblocked = res; });
    const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k)));  // ce que fait « Vider le cache »
    r.cachesVus = ks;
    try { new BroadcastChannel('ft').postMessage('intrus'); } catch (e) {}
    const essais = ['https://script.google.com/macros/s/AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA/exec?action=loadProfile&email=michel.prod%40example.test',
      'https://forcetracker.michdu75.workers.dev/', 'https://exemple.supabase.co/rest/v1/x'];
    r.fetch = [];
    for (const u of essais) { try { await fetch(u, { method: 'POST', body: '{}', mode: 'no-cors' }); r.fetch.push('PARTI ' + u); } catch (e) { r.fetch.push('coupé'); } }
    r.xhr = await new Promise(res => { const x = new XMLHttpRequest(); x.open('POST', essais[0]); x.onerror = () => res('erreur'); x.onload = () => res('PARTI'); x.send('{}'); setTimeout(() => res('rien'), 1500); });
    r.beacon = navigator.sendBeacon ? navigator.sendBeacon(essais[0], '{}') : false;
    try { _cloudSync(); } catch (e) {}
    localStorage.clear(); sessionStorage.clear();                          // ce que fait la remise à zéro du clone (app.js)
    r.apresVidage = localStorage.length;
    r.image = (await fetch('exercises/' + (Object.values(typeof EX_GIF !== 'undefined' ? EX_GIF : {})[0] || 'developpe-couche.webp'))).status;
    r.donnees = (await fetch('data/alias.json')).status;
    return r;
  });
  await attendre(3000);
  t('B-CLONE-07 « Vider le cache » dans le clone ne VOIT aucun cache de la prod', !(C3.cachesVus || []).some(k => /^ft-v|^ft-img|ocr/i.test(k)), JSON.stringify(C3.cachesVus));
  t('B-CLONE-08 serveur, Milo, Supabase : tout appel est COUPÉ (fetch, XHR, beacon)', C3.fetch.every(x => x === 'coupé') && C3.xhr === 'erreur' && C3.beacon === false, JSON.stringify(C3));
  /* Seule exception, et elle est nommée : l'image du QR code de l'adresse PUBLIQUE de l'app (index.html, déjà en prod) —
     elle ne porte aucune donnée de la personne. Toute autre requête sortante est un rouge. */
  const qrPublic = u => { try { const x = new URL(u); return x.hostname === 'api.qrserver.com' && x.searchParams.get('data') === 'https://michdu75-commits.github.io/forcetracker/'; } catch (e) { return false; } };
  t('B-CLONE-09 aucune requête n\'est partie vers l\'extérieur pendant tout l\'usage du clone (hors image publique du QR code)', sortantes.filter(u => !qrPublic(u)).length === 0, sortantes.filter(u => !qrPublic(u)).join(' | '));
  t('B-CLONE-10 le clone lit bien les images et données de la prod (lecture seule)', C3.image === 200 && C3.donnees === 200, JSON.stringify({ image: C3.image, donnees: C3.donnees }));
  await clone.close();

  console.log('\n═══ B-CLONE ④ — la prod, rephotographiée brute : rien n\'a bougé ═══');
  const P1 = await instantane(cx, U);
  const a = sansClone(P0), z = sansClone(P1);
  const trie = o => JSON.stringify(Object.keys(o).sort().map(k => [k, o[k]]));   // l'ordre d'itération du stockage n'est pas garanti
  t('B-CLONE-11 stockage local de la prod IDENTIQUE (clé par clé, valeur par valeur)', trie(a.ls) === trie(z.ls),
    Object.keys({ ...a.ls, ...z.ls }).filter(k => a.ls[k] !== z.ls[k]).join(', '));
  t('B-CLONE-12 cookies vus par la prod IDENTIQUES (aucun cookie du clone visible à la racine)', a.cookie === z.cookie && JSON.stringify(a.cookiesProd) === JSON.stringify(z.cookiesProd), JSON.stringify([a.cookie, z.cookie]));
  t('B-CLONE-13 les cookies du clone vivent sous /clone/ et portent le préfixe cl_', P1.cookiesCx.filter(c => !P0.cookiesCx.includes(c)).every(c => /^cl_[^|]*\|\/forcetracker\/clone\/\|/.test(c)),
    P1.cookiesCx.filter(c => !P0.cookiesCx.includes(c)).join(' ; '));
  t('B-CLONE-14 IndexedDB de la prod IDENTIQUE (bases et contenu)', JSON.stringify(a.dbs) === JSON.stringify(z.dbs) && JSON.stringify(a.contenu) === JSON.stringify(z.contenu), JSON.stringify([a.contenu, z.contenu]));
  t('B-CLONE-15 caches du service worker de la prod intacts', JSON.stringify(a.caches) === JSON.stringify(z.caches), JSON.stringify([a.caches, z.caches]));
  t('B-CLONE-16 service worker de la prod toujours en place, celui du clone limité à /clone/', P1.regs.some(s => s.endsWith('/forcetracker/')) && P1.regs.every(s => s.endsWith('/forcetracker/') || s.endsWith('/forcetracker/clone/')), JSON.stringify(P1.regs));

  console.log('\n═══ B-CLONE ④bis — la prod rouverte, et un clone qui écrit pendant qu\'elle est ouverte ═══');
  try {
  const prod2 = await ouvrirApp(cx, U + '/index.html');
  const clone2 = await ouvrirApp(cx, U + '/clone/');
  await lire(clone2, () => { localStorage.setItem('ft4_sessions', '[]'); localStorage.setItem('ft4_wkt', '{"exs":[]}'); persist(); });
  await attendre(800);
  const P2 = await lire(prod2, () => ({ email: S.email, sessions: S.sessions.length, autre: typeof _ftAutreOnglet !== 'undefined' ? _ftAutreOnglet : 'absent',
    reconnect: !!(document.querySelector('#ov-reconnect.open') || document.querySelector('.overlay.open[id*="reconnect"]')) }));
  t('B-CLONE-17 la prod rouverte retrouve ses données (e-mail, séance)', P2.email === 'michel.prod@example.test' && P2.sessions === 1, JSON.stringify(P2));
  t('B-CLONE-18 les écritures du clone ne se font pas passer pour un « autre onglet » de la prod', P2.autre === false, JSON.stringify(P2));
  await lire(prod2, () => { localStorage.setItem('ft4_evt_banc', '1'); localStorage.removeItem('ft4_evt_banc'); });   // la prod écrit pendant que le clone est ouvert
  await attendre(800);
  const C4 = await lire(clone2, () => (typeof _ftAutreOnglet !== 'undefined' ? _ftAutreOnglet : 'absent'));
  t('B-CLONE-22 le clone ignore les écritures de la prod (aucun « autre onglet » vu de son côté)', C4 === false, String(C4));
  await clone2.close().catch(() => {}); await prod2.close().catch(() => {});
  } catch (e) { t('B-CLONE-17b la phase « prod rouverte » est allée au bout', false, 'interrompue : ' + String(e && e.message || e).slice(0, 200)); }

  console.log('\n═══ B-CLONE ⑤ — fail-closed ═══');
  try {
  const casse = await cx.newPage();
  await casse.addInitScript(() => { try { Object.defineProperty(Storage.prototype, 'setItem', { writable: false, configurable: false }); } catch (e) {} });
  await casse.goto(U + '/clone/');
  await attendre(2000);
  const C5 = await lire(casse, () => ({ iso: window.__FT_CLONE_ISOLE__ === true, texte: document.body ? document.body.innerText : '', app: (() => { try { return typeof S; } catch (e) { return 'tdz'; } })() }));
  t('B-CLONE-19 isolement impossible → le clone NE DÉMARRE PAS et le dit', !C5.iso && /isolation non garantie/i.test(C5.texte) && C5.app !== 'object', JSON.stringify(C5).slice(0, 300));
  await casse.close().catch(() => {});
  const sans = await cx.newPage();
  await sans.goto(U + '/__sans-shim.html');
  await attendre(1500);
  t('B-CLONE-20 un document SANS isolement qui charge un script du clone est renvoyé ailleurs, sans l\'exécuter', !/__sans-shim\.html$/.test(sans.url()), sans.url());
  await sans.close().catch(() => {});
  } catch (e) { t('B-CLONE-19b la phase « fail-closed » est allée au bout', false, 'interrompue : ' + String(e && e.message || e).slice(0, 200)); }
  const P3 = await instantane(cx, U);
  const y = sansClone(P3);
  t('B-CLONE-21 après tout le banc (prod rouverte comprise), la prod n\'a perdu aucune donnée',
    y.ls.ft4_email === a.ls.ft4_email && JSON.parse(y.ls.ft4_sessions || '[]').length === 1 && JSON.stringify(y.contenu.ft_meta) === JSON.stringify(a.contenu.ft_meta) && y.cookie === a.cookie, JSON.stringify({ email: y.ls.ft4_email, cookie: y.cookie }));

  await b.close(); srv.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.stack || e)); process.exit(2); });
