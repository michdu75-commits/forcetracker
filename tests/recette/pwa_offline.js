#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════════════════════
   📴 RECETTE-01 — PREMIER TEST AVEC LE VRAI SERVICE WORKER : l'app s'ouvre-t-elle HORS LIGNE ?
   session-B · 28/09/2026 · règle d'or #4 (ouverture instantanée à la salle, même hors ligne)

   ⛔⛔ LE TROU QU'IL FERME, MESURÉ (TEST-MATRIX-01) : TOUS les parcours du dépôt ouvrent leurs
   contextes avec `serviceWorkers:'block'`. Le service worker n'avait donc JAMAIS été exercé par
   un test — seul un témoin de SOURCE vérifiait que chaque script servi est dans la liste de
   précache (bloc CLXXXIV). La règle d'or #4 reposait sur une relecture.

   CE QU'IL CONDUIT : un vrai Chromium, service worker AUTORISÉ, sur le dépôt servi en local ;
   l'installation et l'activation réelles de `sw.js` ; puis la COUPURE : le serveur HTTP est
   ARRÊTÉ (plus aucune route vers les fichiers) ET le contexte passe hors ligne ; puis un
   rechargement, et l'ouverture d'un NOUVEL onglet (un document neuf, rien en mémoire).
   CE QU'IL OBSERVE : que la réponse de navigation vient du service worker
   (`response.fromServiceWorker()`), que le serveur n'a reçu AUCUNE requête après la coupure, que
   l'app démarre réellement (`S`, écran Accueil, version lue dans le cache = `sw.js`), que la
   séance en cours enregistrée avant la coupure est toujours là, et qu'aucune erreur de script
   n'apparaît.
   ⛔ SON CONTRÔLE NÉGATIF EST INTÉGRÉ : le même parcours avec le service worker BLOQUÉ doit
   échouer à s'ouvrir hors ligne. Sans ce rouge attendu, un vert ne prouverait rien.
   CE QU'IL NE COUVRE PAS (et ne prétend pas couvrir) : Safari / WebKit iOS, l'app INSTALLÉE sur
   l'écran d'accueil (mode standalone), l'éviction du stockage par iOS, la mise à jour d'une
   version à la suivante (`updateViaCache`, `controllerchange`), le cache des images à la demande.
   Ces points restent au téléphone (registre de recette, TEL-VERSION-01 / PWA-IOS-01).
   Lancer : node tests/recette/pwa_offline.js   (~20 s)
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png',
           '.jpg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.wasm':'application/wasm'};
let ok = 0, ko = 0;
const t = (nom, cond, det) => { if (cond) { ok++; console.log('   OK  ' + nom); } else { ko++; console.log('❌ ROUGE ' + nom + (det ? '  >> ' + det : '')); } };
const CACHE_ATTENDU = (fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/const CACHE = '(ft-v\d+)'/) || [])[1];
const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
const SEED = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_tester_eq_v1: '1', ft4_lms: moisPrec, ft4_ok: '1', ft4_stmig1: '1',
  ft4_wkt: JSON.stringify({ date: require('../_jour.js').jourParis(), startHour: 10,
    exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, type: 'N', done: false, rm1: 0 }] }] }) };

function serveur() {
  const s = { n: 0, ouvert: true };
  s.srv = http.createServer((q, r) => {
    s.n++;
    let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
    r.writeHead(200, { 'Content-Type': M[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(r);
  });
  return s;
}

async function scenario(b, avecSW) {
  const S1 = serveur();
  await new Promise(r => S1.srv.listen(0, r));
  const URL = 'http://localhost:' + S1.srv.address().port + '/index.html';
  const cx = await b.newContext({ serviceWorkers: avecSW ? 'allow' : 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  const R = { avecSW, erreurs: [] };
  // aucune sortie vers l'extérieur : Apps Script, Worker, Supabase, polices distantes — jamais de réseau réel
  await cx.route(u => !/^http:\/\/localhost/.test(String(u)), r => r.abort());
  await cx.addInitScript(`(()=>{try{ if(localStorage.getItem('_pwa'))return; localStorage.clear(); const D=${JSON.stringify(SEED)};
    Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); localStorage.setItem('_pwa','1'); }catch(e){}})();`);
  const pg = await cx.newPage();
  pg.on('pageerror', e => R.erreurs.push(e.message));
  await pg.goto(URL); await pg.waitForTimeout(1500);
  if (avecSW) {
    // installation + activation réelles ; l'activation peut recharger la page (SW_UPDATED) : on attend le calme
    R.controle = await pg.evaluate(async () => {
      const t0 = Date.now();
      while (Date.now() - t0 < 15000) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.active && navigator.serviceWorker.controller) break;
        await new Promise(r => setTimeout(r, 200));
      }
      return !!navigator.serviceWorker.controller;
    }).catch(() => false);
    await pg.waitForLoadState('load'); await pg.waitForTimeout(1500);
    R.caches = await pg.evaluate(async () => {
      const ks = await caches.keys(); const code = ks.find(k => /^ft-v\d+$/.test(k));
      const c = code ? await caches.open(code) : null;
      const scripts = [...document.querySelectorAll('script[src]')].map(s => s.getAttribute('src')).filter(s => !/^https?:/.test(s));
      const manquants = [];
      if (c) for (const s of scripts.concat(['index.html', 'style.css'])) { if (!(await c.match(s))) manquants.push(s); }
      return { cles: ks, code, scripts: scripts.length, manquants };
    }).catch(e => ({ erreur: String(e) }));
  }
  // ⛔ LA COUPURE : le serveur est ARRÊTÉ (plus aucune route) et le contexte passe hors ligne
  const avantCoupure = S1.n;
  await new Promise(r => S1.srv.close(r));
  S1.srv.closeAllConnections && S1.srv.closeAllConnections();
  await cx.setOffline(true);
  R.erreurs.length = 0;
  // ① rechargement de la page ouverte
  try {
    const rep = await pg.reload({ waitUntil: 'load', timeout: 15000 });
    R.rechargeSW = !!(rep && rep.fromServiceWorker());
    await pg.waitForTimeout(1800);
    R.apres = await pg.evaluate(() => ({
      app: typeof S === 'object' && typeof goScreen === 'function',
      accueil: !!document.getElementById('s-home'),
      seance: !!(S && S.wkt && S.wkt.exs && S.wkt.exs.length === 1 && S.wkt.exs[0].name === 'Squat'),
    }));
  } catch (e) { R.rechargeErreur = String(e.message || e).slice(0, 120); }
  // ② un NOUVEL onglet : un document neuf, rien en mémoire
  try {
    const pg2 = await cx.newPage();
    pg2.on('pageerror', e => R.erreurs.push(e.message));
    const rep2 = await pg2.goto(URL, { waitUntil: 'load', timeout: 15000 });
    R.ongletSW = !!(rep2 && rep2.fromServiceWorker());
    await pg2.waitForTimeout(1800);
    R.onglet = await pg2.evaluate(async () => {
      let cv = '?'; try { const ks = await caches.keys(); cv = ks.find(k => k.startsWith('ft-v')) || '?'; } catch (e) {}
      return { app: typeof S === 'object' && typeof goScreen === 'function' && !!document.getElementById('s-home'),
               version: cv, seance: !!(S && S.wkt && S.wkt.exs && S.wkt.exs.length === 1) };
    });
  } catch (e) { R.ongletErreur = String(e.message || e).slice(0, 120); }
  R.requetesApresCoupure = S1.n - avantCoupure;
  // les erreurs attendues hors ligne (réseau refusé) ne comptent pas ; une erreur de SCRIPT, si
  R.erreursScript = R.erreurs.filter(m => !/Failed to fetch|NetworkError|ERR_INTERNET_DISCONNECTED|net::|Load failed|aborted/i.test(m));
  await cx.close();
  return R;
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  console.log('\n═══ RECETTE-01. L\'app s\'ouvre hors ligne grâce au VRAI service worker ═══');
  const A = await scenario(b, true);
  const js = x => JSON.stringify(x).slice(0, 200);
  t('P1 le service worker s\'installe et CONTRÔLE la page', A.controle === true, js(A.controle));
  t('P2 le cache de code porte le numéro de sw.js (' + CACHE_ATTENDU + ')', A.caches && A.caches.code === CACHE_ATTENDU, js(A.caches));
  t('P3 tous les scripts servis par index.html sont dans le cache (+ index.html, style.css)',
    A.caches && A.caches.scripts >= 10 && A.caches.manquants && A.caches.manquants.length === 0, js(A.caches && A.caches.manquants));
  t('P4 hors ligne, serveur ARRÊTÉ : le rechargement est servi par le service worker', A.rechargeSW === true, A.rechargeErreur || js(A.rechargeSW));
  t('P5 … et l\'app démarre (S, navigation, écran Accueil)', A.apres && A.apres.app && A.apres.accueil, A.rechargeErreur || js(A.apres));
  t('P6 … et la séance en cours enregistrée avant la coupure est là', A.apres && A.apres.seance, js(A.apres));
  t('P7 un NOUVEL onglet (document neuf, rien en mémoire) s\'ouvre aussi, servi par le service worker',
    A.ongletSW === true && A.onglet && A.onglet.app && A.onglet.seance, A.ongletErreur || js(A.onglet));
  t('P8 la version lue hors ligne est celle de sw.js', A.onglet && A.onglet.version === CACHE_ATTENDU, js(A.onglet));
  t('P9 le serveur n\'a reçu AUCUNE requête après la coupure (rien n\'est venu du réseau)', A.requetesApresCoupure === 0, js(A.requetesApresCoupure));
  t('P10 aucune erreur de script hors ligne', A.erreursScript.length === 0, js(A.erreursScript));
  // ⛔ contrôle négatif intégré : sans service worker, la même ouverture hors ligne DOIT échouer
  const B = await scenario(b, false);
  const echoueSansSW = !(B.apres && B.apres.app) && !(B.onglet && B.onglet.app);
  t('P11 ⛔ CONTRÔLE : service worker BLOQUÉ → l\'ouverture hors ligne échoue (le test sait voir l\'absence)',
    echoueSansSW, js({ recharge: B.apres, onglet: B.onglet, erreur: B.rechargeErreur || B.ongletErreur }));
  await b.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
