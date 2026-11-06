#!/usr/bin/env node
/* AUTO-CONTRÔLE LOCAL du serveur d'essai iPhone et de son panneau (jamais de réseau : faux Apps Script du dépôt, garde réseau des tests chargé par tools/lib_banc_reseau.js).
   Prouve : (1) la page se charge et le panneau C1 apparaît ; (2) la CSP est posée et REFUSE bien une sortie vers le Worker de Milo / Supabase / une image externe (événements `securitypolicyviolation`, pas le garde réseau) ;
   (3) DEFAULT_URL est bien remplacée par l'adresse d'essai (et une seule fois) ; (4) les gestes passent par les vrais écrivains du client et les envois sont mesurés (lisibles / illisibles) ;
   (5) « Comparer avec le serveur » voit un seul « Pates » des deux côtés ; (6) le rapport est complet ; (7) l'adresse de PRODUCTION est refusée. */
'use strict';
const path = require('path');
const RACINE = path.resolve(__dirname, '..');
const lib = require(path.join(RACINE, 'tools/lib_banc_reseau.js'));
const { demarrer } = require('./serveur_iphone.js');
let ok = 0, rouge = 0; const t = (n, c, d) => { c ? ok++ : rouge++; console.log((c ? '   OK  ' : '❌ ROUGE ') + n + (d !== undefined ? '   >> ' + (typeof d === 'string' ? d : JSON.stringify(d)).slice(0, 300) : '')); };
(async () => {
  const srv = lib.serveurDe({}); srv.props.LECTURE_STRICTE = 'off';
  const faux = await lib.fauxAppsScript(srv, {});
  const web = await demarrer({ exec: faux.url, port: 0, hote: '127.0.0.1', local: true, extraConnect: ['http://127.0.0.1:' + faux.port, 'http://127.0.0.1:' + faux.portEcho] });
  const b = await lib.chromium.launch({ executablePath: process.env.FT_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const pg = await cx.newPage(); const erreurs = [], violations = [];
  pg.on('pageerror', (e) => erreurs.push(String(e.message || e).slice(0, 160)));
  await pg.addInitScript(() => { window.__viol = []; document.addEventListener('securitypolicyviolation', (e) => window.__viol.push(e.blockedURI + ' | ' + e.violatedDirective)); });
  await pg.goto('http://127.0.0.1:' + web.port + '/index.html'); await new Promise((r) => setTimeout(r, 3500));
  t('(1) la page se charge sans erreur JavaScript et le panneau C1 apparaît', erreurs.length === 0 && (await pg.locator('#c1-bar').count()) === 1, { erreurs: erreurs.slice(0, 3) });
  const csp = await pg.evaluate(() => (document.querySelector('meta[http-equiv="Content-Security-Policy"]') || {}).content || '');
  t('(2a) la CSP est posée : connect-src limité à l\'adresse d\'essai, rien d\'autre', /connect-src 'self' http:\/\/127\.0\.0\.1:\d+ http:\/\/127\.0\.0\.1:\d+;/.test(csp) && !/workers\.dev|supabase/.test(csp), csp.slice(0, 200));
  const sortie = await pg.evaluate(async () => {
    const r = {}; try { await fetch('https://dry-field-e931.forcetracker-app.workers.dev/', { method: 'POST', body: '{}' }); r.worker = 'PARTI'; } catch (e) { r.worker = 'refusé'; }
    try { await fetch('https://example.supabase.co/rest/v1/x'); r.supabase = 'PARTI'; } catch (e) { r.supabase = 'refusé'; }
    const im = new Image(); im.src = 'https://api.qrserver.com/v1/create-qr-code/?data=x'; await new Promise((res) => setTimeout(res, 600)); r.image = im.complete && im.naturalWidth > 0 ? 'CHARGÉE' : 'refusée';
    r.violations = window.__viol.length; r.exemples = window.__viol.slice(0, 3); return r;
  });
  t('(2b) la CSP REFUSE (événements securitypolicyviolation) le Worker, Supabase et une image externe', sortie.worker === 'refusé' && sortie.supabase === 'refusé' && sortie.image === 'refusée' && sortie.violations >= 3, sortie);
  const cons = await pg.evaluate(() => (typeof DEFAULT_URL !== 'undefined' ? DEFAULT_URL : '?'));
  t('(3) DEFAULT_URL du client = l\'adresse d\'essai (pas la production)', cons === faux.url && !/AKfycbxWUsEFIlmx/.test(cons), cons);
  const email = await pg.evaluate(() => localStorage.getItem('ft4_email'));
  t('(3b) compte fictif @example.invalid posé', /^c1-iphone-[0-9a-f]{6}@example\.invalid$/.test(email), email);
  await pg.evaluate(() => { window.__C1.geste(1); }); await new Promise((r) => setTimeout(r, 6000));
  await pg.evaluate(() => { window.__C1.geste(2); }); await new Promise((r) => setTimeout(r, 6000));
  await pg.evaluate(() => { window.__C1.geste(4); }); await new Promise((r) => setTimeout(r, 6000));
  const st = await pg.evaluate(() => window.__C1.stats());
  t('(4) les gestes (vrais écrivains) déclenchent des envois mesurés : tous LISIBLES, aucun échec', st.n >= 2 && st.lis === st.n && st.ill === 0 && st.ech === 0, st);
  await pg.evaluate(() => window.__C1.comparer()); await new Promise((r) => setTimeout(r, 1500));
    await pg.locator('#c1-bar').click(); await new Promise((r) => setTimeout(r, 400));
  await pg.locator('button[data-a="cmp"]').click(); await new Promise((r) => setTimeout(r, 2000));
  const txt = await pg.locator('#c1-rap').inputValue();
  t('(5) « Comparer avec le serveur » : un seul « Pates » des deux côtés, aucun doublon', /Pates : téléphone 1 \/ serveur 1/.test(txt) && /aucun doublon/.test(txt) && /identique/.test(txt), txt.split('\n').find((l) => /Serveur ↔/.test(l)));
  t('(6) le rapport est complet (compte, réseau, envois lisibles, journal)', /^FT-C1 iPhone — /.test(txt) && /Envois saveProfile : \d+ · réponses LISIBLES : \d+/.test(txt) && /--- journal ---/.test(txt) && /saveProfile \d+Ko réponse reçue HTTP 200\/cors/.test(txt), txt.split('\n').slice(0, 2).join(' ¶ ').slice(0, 220));
  /* (8)(9) ISOLEMENT DE LA PRODUCTION, en vrai Chromium : la CSP posée pour une VRAIE adresse de TEST refuse l'Apps Script de PRODUCTION (même hôte, autre chemin) et laisse passer celui de TEST */
  const TEST = 'https://script.google.com/macros/s/AKfycbxdlCZcqOeKymoP5FDxMF9KdeWbNvqWI9h2vX0QCCMIJwSO3HYujOUdOR4KJ-x2qdMr/exec';
  const PROD = 'https://script.google.com/macros/s/AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA/exec';
  const web2 = await demarrer({ exec: TEST, port: 0, hote: '127.0.0.1' });
  const pg2 = await cx.newPage();
  await pg2.addInitScript(() => { window.__viol = []; document.addEventListener('securitypolicyviolation', (e) => window.__viol.push(e.blockedURI)); });
  await pg2.goto('http://127.0.0.1:' + web2.port + '/index.html'); await new Promise((r) => setTimeout(r, 3000));
  const iso = await pg2.evaluate(async ([P, T]) => {
    const essai = async (u) => { const av = window.__viol.length; try { await fetch(u + '?test=1'); } catch (e) {} await new Promise((r) => setTimeout(r, 300)); return window.__viol.slice(av).some((b) => String(b).startsWith(u.replace(/\/exec$/, ''))); };
    return { prodBloquee: await essai(P), testBloquee: await essai(T), defaut: DEFAULT_URL, email: localStorage.getItem('ft4_email') };
  }, [PROD, TEST]);
  t('(8) la CSP refuse l\'Apps Script de PRODUCTION (même hôte, autre chemin) et ne refuse PAS celui de TEST', iso.prodBloquee === true && iso.testBloquee === false, iso);
  t('(9) en vrai : DEFAULT_URL = TEST (jamais la production) et compte fictif', iso.defaut === TEST && /@example\.invalid$/.test(iso.email), { defaut: iso.defaut.slice(-12), email: iso.email });
  web2.s.close();
  let refus = ''; try { await demarrer({ exec: 'https://script.google.com/macros/s/AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA/exec', port: 0 }); refus = 'ACCEPTÉE'; } catch (e) { refus = String(e.message); }
  t('(7) l\'adresse de PRODUCTION est refusée', /PRODUCTION/.test(refus), refus);
  await b.close(); web.s.close(); faux.fermer();
  console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(rouge ? 1 : 0);
})().catch((e) => { console.error('PLANTAGE : ' + (e && e.stack || e)); process.exit(2); });
