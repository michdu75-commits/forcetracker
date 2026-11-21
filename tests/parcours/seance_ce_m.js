/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════
   🧭 SCCM — CE LOT M (Claude N°2, contre-expertise + D-176, GO limité de Michel du 16/11/2026) : D-170 · D-173 · D-176.
   Blocs : B-SCCM-P (source) · B-SCCM-F (l'outil `_fetchBorne`, EXÉCUTÉ, horloge qui avance) · B-SCCM-U (D-170 : l'attente réseau se TERMINE, le verrou ne se lève jamais par un délai — vrai service worker,
           publications simulées, vrai serveur local qui fige le corps de la réponse) · B-SCCM-B (D-170 : le bandeau de mise à jour sur l'Accueil) · B-SCCM-S (D-173 : supprimer la série choisie dans les
           structures dégressives, le sens PDC en attente suit sa série) · B-SCCM-H (D-176 : l'en-tête global n'existe que sur l'Accueil).

   D-170 (Michel) : AUCUNE mise à jour tant que la séance, son enregistrement, la génération ou la consultation du briefing sont actifs ; un délai dépassé conduit à une issue EXPLICITE et SÛRE (séance gardée en local, suivi,
   relance contrôlée, fermeture explicite du briefing) — et l'opération se TERMINE vraiment (requête annulée, y compris pendant la lecture du corps) ; un verrou ne se lève JAMAIS par le seul écoulement de 90 / 120 s.
     Défauts démontrés par la contre-expertise (sondes U02 / U06 / U07) : le délai de `syncSheets` était coupé dès les EN-TÊTES, `resp.text()` attendait le CORPS sans délai ; à 120 s la page rechargeait par-dessus ;
     une analyse encore en vol était déclarée « non vive ». Ici : le corps est RÉELLEMENT figé par un serveur local (en-têtes envoyés, corps jamais fini), l'horloge de la page est décalée, la connexion est surveillée côté serveur.
   D-173 : « Supprimer une série… » vaut aussi pour un dropset / une pyramide — la série NORMALE qui précède la chaîne part, la chaîne et son réglage restent ; un PALIER ne se supprime pas isolément (le nombre de paliers
     fait loi) : la feuille le dit (ligne grisée + phrase) ; un dégressif IMPORTÉ (séries de type « D ») n'a pas de réglage : ses lignes sont des séries ; le sens PDC en attente (`_pdcAtt`) suit sa série.
   D-176 : l'en-tête global (logo, titre, date, « ? », partage, Sheets) n'est visible que sur l'Accueil — mécanisme générique (un écran futur inclus), sans bande vide ; l'en-tête de SÉANCE (Terminer…) reste ; la barre du bas
     et le bouton central ne bougent pas (règle d'or #9, MESURÉ sur 390×844 et 375×667) ; zone sûre, zoom, défilement, bandeau de mise à jour.
   CONDUIT : vrai Chromium mobile (390×844 dpr 2, 375×667), la vraie app servie en local, de vrais boutons ; serveurs locaux fictifs ; données ENTIÈREMENT FICTIVES, 0 appel réel.
   OBSERVE : `S.wkt` / `S.sessions` / stockage, les rectangles réels, `elementFromPoint`, le marqueur de page (rechargement), l'état des connexions côté serveur.
   NE COUVRE PAS ⛔ : Safari iOS (Chromium n'est pas un iPhone : gel d'une page en arrière-plan, politique de cache, vraie encoche — la zone sûre n'est qu'ÉMULÉE par le protocole de développement, quand il le permet),
   la vraie latence d'un Worker, un déploiement, M36 (vrais gestes iPhone). Banc : tools/banc_seance_ce_m.js · contrôle négatif : tools/mut_seance_ce_m.py
   ═════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const http = require('http');
const mvAide = require('./maj_version.js').aide;
const sm = require('./seance_maj.js').aide;
const { allerA, lireBandeau, voit, marquer, rechargee, dormir, attendre, cle, publier, recue, calme } = mvAide;
const js = (x) => JSON.stringify(x).slice(0, 420);
const REPONSE = { reply: 'Séance fictive régulière. Une piste pour la prochaine : ajoute une série au premier exercice.', complete: true };
const FIC = 'Zorglub inversé à la poulie', PERSO = 'Exo perso Zéta';              // FICTIF (absent du catalogue) · PERSONNALISÉ (S.customExercises)

/* ══ le serveur local FICTIF qui fait ce que les vrais réseaux font : figer le corps, répondre trop tard, couper ══ */
async function reseau() {
  const st = { mode: 'ok', delai: 0, vus: [], enTetes: 0 };
  const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' };
  const srv = http.createServer((q, r) => {
    if (q.method === 'OPTIONS') { r.writeHead(204, CORS); return r.end(); }
    let d = ''; q.on('data', (c) => { d += c; });
    q.on('end', () => {
      let c = {}; try { c = JSON.parse(d || '{}'); } catch (e) {}
      const v = { action: c.action || '?', mode: st.mode, coupe: false, fini: false }; st.vus.push(v);
      r.on('close', () => { v.coupe = !r.writableEnded; });
      const reponse = () => (c.action === 'coach' ? JSON.stringify(REPONSE) : '{"status":"ok"}');
      if (st.mode === 'ok') { r.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }, CORS)); v.fini = true; return r.end(reponse()); }
      if (st.mode === 'corps-fige') { r.writeHead(200, Object.assign({ 'Content-Type': 'application/json', 'Content-Length': '2000' }, CORS)); r.flushHeaders(); st.enTetes++; r.write('{"status":"o'); return; }   // les EN-TÊTES partent, le corps ne finit JAMAIS
      if (st.mode === 'lent') { setTimeout(() => { if (!r.destroyed && !v.coupe) { r.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }, CORS)); v.fini = true; r.end(reponse()); } }, st.delai); return; }
      if (st.mode === 'coupe') { q.socket.destroy(); return; }
      r.writeHead(500, CORS); r.end('{"error":"panne fictive"}');
    });
  });
  await new Promise((r) => srv.listen(0, r));
  st.url = 'http://localhost:' + srv.address().port + '/exec';
  st.nb = (a) => st.vus.filter((v) => v.action === a).length;
  st.fermer = () => { try { srv.closeAllConnections && srv.closeAllConnections(); srv.close(); } catch (e) {} };
  return st;
}

/* ══ la page de test D-173 / D-176 (serveur statique de la passe, vrai Chromium mobile) ══ */
const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 'sccm@example.test', ft4_devtoken: 'f'.repeat(64),
  ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_lms: moisPrec };
const PROGS = () => [{ id: 'p1', name: 'Push fictif', exs: [{ name: 'Développé Couché', sets: [{ kg: 0, reps: 8, type: 'N' }, { kg: 0, reps: 8, type: 'N' }] }] }];
const SESS = () => [{ id: 1760349600000, ts: 1760349600000, date: '2026-10-13', synced: true, volume: 2900, progLabel: 'Push', exs: [{ name: 'Développé Couché', sets: [{ kg: 90, reps: 8, done: true, type: 'N', rm1: 112 }] }] }];
let _mk = 0;
/* une série marquée : `mk` = son IDENTITÉ de test, `note` / `rest` = des champs que seule la série porte */
const SR = (kg, reps, done, type, extra) => Object.assign({ mk: 'm' + (++_mk), kg, reps, done: !!done, type: type || 'N', rm1: done ? Math.round(kg * (1 + reps / 30)) : 0, note: 'n' + _mk, rest: 60 + _mk },
  done ? { at: 100 + _mk, rir: 2, rirV: 2 } : {}, extra || {});
const exo = (name, sets, extra) => Object.assign({ name, sets }, extra || {});
const DROP = (paliers, dir) => ({ paliers, pct: 10, direction: dir || 'down' });
const J = (o) => JSON.stringify(o);
const sans = (arr, i) => arr.filter((_, k) => k !== i);

/* ══════════════════════════════════════ SOURCE ══════════════════════════════════════ */
function pur(t, ROOT, fs, path) {
  console.log('\n═══ B-SCCM-P (source). D-170 · D-173 · D-176 ═══');
  const lire = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const css = lire('style.css'), log = lire('log.js'), suivi = lire('tracking.js'), coach = lire('coach.js'), app = lire('app.js'), html = lire('index.html');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? src.length : j); };
  /* D-170 */
  const fb = /async function _fetchBorne\([\s\S]*?\n\}\n/.exec(suivi);
  t('B-SCCM-P1 ⛔⛔ l\'attente réseau est bornée de bout en bout par UN outil (`_fetchBorne`) : la lecture du corps est DANS le délai (course avec l\'annulation), le minuteur est levé en sortie (finally), la requête est annulée (AbortController)',
    !!fb && /Promise\.race\(\[fetch\(/.test(fb[0]) && /Promise\.race\(\[lire\(resp\)/.test(fb[0]) && /ctl\.abort\(\)/.test(fb[0]) && /finally\{ clearTimeout\(tId\); \}/.test(fb[0]), fb ? 'outil présent' : 'absent');
  t('B-SCCM-P2 ⛔ `syncSheets` (fin de séance) et `_runSeDebrief` (briefing) l\'emploient, et AUCUN `clearTimeout` ne précède plus la lecture du corps (le défaut de la sonde U07)',
    /_fetchBorne\(S\.url,/.test(corps(suivi, 'syncSheets')) && !/clearTimeout/.test(corps(suivi, 'syncSheets')) && /_fetchBorne\(_aiUrl\('coach'\)/.test(corps(log, '_runSeDebrief')) && !/new AbortController/.test(corps(log, '_runSeDebrief')));
  t('B-SCCM-P3 ⛔ une analyse « en vol » est vive tant que son OPÉRATION dure (mémoire de la page, retirée par le `finally` de `_runSeDebrief`) et le `try` s\'ouvre dès la pose du verrou : une exception de construction ne le laisse pas posé',
    /function _dbfAnalyseVive\(\)\{ return _dbfActifs\.size>0; \}/.test(coach) && /_dbfActifs\.delete\(String\(sid\)\);/.test(corps(log, '_runSeDebrief')) && /try\{\s*\n\s*_dbfVolPoser\(sid\);/.test(corps(log, '_runSeDebrief')));
  t('B-SCCM-P4 la fin de séance DIT l\'issue d\'un délai (« Réseau trop lent — ta séance est gardée ») au lieu d\'un faux « sauvegardée » ou d\'un silence', /res&&res\.timeout\) toast\(`⏳ Réseau trop lent — ta séance est gardée/.test(log));
  /* D-173 */
  t('B-SCCM-P5 ⛔ D-173 : un PALIER de dropset est protégé, pas tout le dropset (`_estPalierDrop` par INDEX, via `_dropDebut`) ; la règle ne porte aucun nom d\'exercice',
    /function _estPalierDrop\(ex,si\)\{ return !!\(ex&&ex\.dropset\)&&si>=_dropDebut\(ex\); \}/.test(log) && !/ex\.dropset&&Array\.isArray\(ex\.sets\)&&ex\.sets\.length>1/.test(log));
  t('B-SCCM-P6 D-173 : le sens PDC en attente (`_pdcAtt`) est recalé avec la question du RIR (une seule fonction `recaler`)', /_pdcAtt=recaler\(_pdcAtt\)\|\|null;/.test(corps(log, 'supprimerSerie')));
  /* D-176 */
  const rg = css.replace(/\/\*[\s\S]*?\*\//g, '');
  t('B-SCCM-P7 ⛔⛔ D-176 : UNE règle générique cache l\'en-tête global hors Accueil (`#root:not(.on-home) .topbar{display:none}`), sans liste d\'écrans, et seul l\'en-tête de SÉANCE fait exception',
    /#root:not\(\.on-home\) \.topbar\{display:none;\}/.test(rg) && /#root\.on-log\.seance-on \.topbar\{display:flex;\}/.test(rg) && !/#root\.on-(log|progress|nutrition|coach|setup|cycle)[^{]*\.topbar\{display:none/.test(rg));
  t('B-SCCM-P8 ⛔ D-176 : la zone sûre du haut est rendue à l\'écran quand l\'en-tête est masqué (`env(safe-area-inset-top)`), sans double marge sous le bandeau de mise à jour ni le mode démo, et sans rien ajouter sous l\'en-tête de séance',
    /#root:not\(\.on-home\):not\(\.maj-on\):not\(\.demo-on\) \.screens\{margin-top:env\(safe-area-inset-top,0px\);\}/.test(rg) && /html #root\.on-log\.seance-on:not\(\.on-home\) \.screens\{margin-top:0;\}/.test(rg));
  t('B-SCCM-P9 D-176 : la classe `on-home` est posée par UN seul endroit (`_applyScreen`) et `#root` démarre sur l\'Accueil', /classList\.toggle\('on-home',id==='home'\)/.test(lire('screens.js')) && /<div id="root" class="on-home">/.test(html));
  t('B-SCCM-P10 D-170 : le bandeau de mise à jour se montre aussi sur l\'Accueil (plus d\'exception `:not(.on-home)`), une seule règle', /#root\.maj-on #maj-banner\{ display:flex; \}/.test(rg) && !/maj-on:not\(\.on-home\)/.test(rg));
  t('B-SCCM-P11 D-174 / D-175 conservés : le zoom n\'est pas désactivé et le bloc chrono + RIR garde son rembourrage réduit (aucun retour en arrière)', /user-scalable\s*=\s*yes/.test(html) && /padding:4px 10px;border-radius:20px;background:var\(--bg2\);border:1px solid var\(--sea-a2\);/.test(css));
}

/* ══════════════════════════════════════ ÉCRAN (serveur statique) ══════════════════════════════════════ */
async function ecran(t, b, PORT) {
  const SEUL = (process.env.SCCM_SEUL || '').split(',').filter(Boolean);
  const garde = async (nom, f) => { if (SEUL.length && SEUL.indexOf(nom) < 0) return; try { await f(); } catch (e) { t('B-SCCM-' + nom + ' ⛔ le scénario s\'est exécuté jusqu\'au bout', false, String(e && e.stack || e).slice(0, 500)); } };
  const ouvrir = async (opts) => {
    opts = opts || {};
    const W = opts.w || 390, H = opts.h || 844;
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, timezoneId: 'Europe/Paris' });
    await cx.route((u) => !/^http:\/\/localhost:/.test(String(u)), (rt) => rt.abort());
    const init = Object.assign({}, BASE, { ft4_sessions: JSON.stringify(SESS()), ft4_progs: JSON.stringify(PROGS()), ft4_cuex: JSON.stringify([{ n: PERSO, g: 'Pectoraux', eq: 'Haltères', c: 'custom' }]) });
    if (opts.wkt !== undefined) { init.ft4_wkt = JSON.stringify(opts.wkt); init.ft4_wkt_draft = JSON.stringify(opts.wkt); }
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_sccm'))return; sessionStorage.setItem('_sccm','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', (x) => errs.push(String(x.message).slice(0, 160)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    await pg.evaluate((ecr) => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open'));
      const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none';
      const tt = today(), pm = new Date(Date.UTC(+tt.slice(0, 4), +tt.slice(5, 7) - 2, 15));     // le piège du lundi et du mois : les bilans automatiques recouvriraient l'écran
      S.lastWeekSummary = tt; S.lastMonthSummary = pm.getUTCFullYear() + '-' + String(pm.getUTCMonth() + 1).padStart(2, '0');
      if (S.wkt && S.wkt.date === '__TODAY__') S.wkt.date = tt; persist();
      goScreen(ecr, document.getElementById('nb-' + ecr)); }, opts.ecran || 'log');
    await pg.waitForTimeout(350);
    const cd = await cx.newCDPSession(pg);
    return { cx, pg, cd, errs, W, H };
  };
  const wkt = (exs, extra) => Object.assign({ date: '__TODAY__', startHour: 10, startTs: Date.now() - 600000, exs }, extra || {});
  const etat = (X) => X.pg.evaluate(() => ({ wkt: S.wkt ? JSON.parse(JSON.stringify(S.wkt)) : null, progs: JSON.parse(JSON.stringify(S.programmes || S.progs || [])), sess: JSON.parse(JSON.stringify(S.sessions || [])),
    disque: JSON.parse(localStorage.getItem('ft4_wkt') || 'null'), pdcAtt: typeof _pdcAtt === 'undefined' ? 'ABSENT' : (_pdcAtt ? JSON.parse(JSON.stringify(_pdcAtt)) : null) }));
  const fab = (X) => X.pg.evaluate(() => { const r = document.getElementById('nb-log').getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 10) / 10).join(','); });
  const confirmOuvert = (X) => X.pg.evaluate(() => { const o = document.getElementById('ov-confirm'); return !!(o && o.classList.contains('open')); });
  const ouvrirExo = async (X, ei) => { await X.pg.evaluate((ei) => { _expandedEx = ei; renderExBlocks(); }, ei); await X.pg.waitForTimeout(150); };
  const menu = async (X, ei) => { await ouvrirExo(X, ei);
    const ok = await X.pg.evaluate((ei) => { const bt = [...document.querySelectorAll('#ex-block-' + ei + ' .ex-hdr button')].filter((e) => (e.textContent || '').trim() === '⋯').pop(); if (!bt) return false; bt.click(); return true; }, ei);
    await X.pg.waitForTimeout(150); return ok; };
  const entree = (X) => X.pg.evaluate(() => { const o = document.getElementById('ov-ex-menu'); if (!o || !o.classList.contains('open')) return false; return [...o.querySelectorAll('button')].some((e) => /Supprimer une série/.test(e.textContent)); });
  const ouvrirFeuille = async (X, ei) => { if (!await menu(X, ei)) return false;
    const ok = await X.pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-ex-menu button')].find((e) => /Supprimer une série/.test(e.textContent)); if (!bt) return false; bt.click(); return true; });
    await X.pg.waitForTimeout(150); return ok; };
  const feuille = (X) => X.pg.evaluate(() => { const o = document.getElementById('ov-ex-menu'); if (!o) return null;
    return { boutons: [...o.querySelectorAll('button[onclick^="supprimerSerie("]')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()), cliquables: [...o.querySelectorAll('button[onclick^="supprimerSerie("]')].map((e) => +/supprimerSerie\(\d+,(\d+)\)/.exec(e.getAttribute('onclick'))[1]),
      verrouilles: [...o.querySelectorAll('div[style*="opacity:.55"]')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()), texte: (o.innerText || '').replace(/\s+/g, ' ') }; });
  const toucher = async (X, ei, si) => { const ok = await X.pg.evaluate(([ei, si]) => { const bt = document.querySelector('#ov-ex-menu button[onclick="supprimerSerie(' + ei + ',' + si + ')"]'); if (!bt) return false; bt.click(); return true; }, [ei, si]);
    await X.pg.waitForTimeout(220); return ok; };
  const confirmer = async (X, oui) => { await X.pg.evaluate((oui) => { document.getElementById(oui ? 'confirm-ok' : 'confirm-cancel').click(); }, !!oui); await X.pg.waitForTimeout(220); };

  /* ── B-SCCM-F · l'outil `_fetchBorne`, EXÉCUTÉ tel qu'écrit, horloge qui AVANCE (minuteurs simulés, annulation réelle d'un AbortController) ── */
  await garde('F', async () => {
    const fs = require('fs'), path = require('path');
    const src = fs.readFileSync(path.join(__dirname, '..', '..', 'tracking.js'), 'utf8'), m = /async function _fetchBorne\([\s\S]*?\n\}\n/.exec(src);
    if (!m) return t('B-SCCM-F0 l\'outil `_fetchBorne` est lisible', false, 'absent');
    const monde = () => { const ts = []; let now = 0; const w = { ts, appels: { clear: 0 } };
      w.setTimeout = (cb, ms) => { const o = { cb, at: now + ms, vif: true }; ts.push(o); return ts.length; };
      w.clearTimeout = (id) => { w.appels.clear++; if (ts[id - 1]) ts[id - 1].vif = false; };
      w.avancer = async (ms) => { now += ms; ts.filter((o) => o.vif && o.at <= now).forEach((o) => { o.vif = false; o.cb(); }); await new Promise((r) => setImmediate(r)); };
      w.vifs = () => ts.filter((o) => o.vif).length; return w; };
    const lancer = (w, fetchF, lire) => { const f = new Function('setTimeout', 'clearTimeout', 'fetch', 'AbortController', m[0] + '; return _fetchBorne;')(w.setTimeout, w.clearTimeout, fetchF, AbortController);
      let sortie = 'en cours'; const p = f('http://x.invalid/', { method: 'POST' }, 8000, lire).then((v) => { sortie = { ok: v }; }, (e) => { sortie = { err: e.name }; }); return { p, sortie: () => sortie }; };
    // ① en-têtes jamais reçus (la requête ne répond jamais, le signal est ignoré)
    { const w = monde(); let sig = null; const r = lancer(w, (u, o) => { sig = o.signal; return new Promise(() => {}); }, (x) => x.text());
      await w.avancer(7999); const avant = r.sortie(); await w.avancer(1); await Promise.race([r.p, new Promise((q) => setTimeout(q, 300))]);
      t('B-SCCM-F1 ⛔ en-têtes jamais reçus : l\'attente tient jusqu\'au délai (8 s) puis se TERMINE (AbortError) ; la requête est annulée ; plus aucun minuteur vivant', avant === 'en cours' && r.sortie().err === 'AbortError' && sig.aborted === true && w.vifs() === 0, js([avant, r.sortie(), sig && sig.aborted, w.vifs()])); }
    // ② en-têtes reçus, CORPS jamais fini ET qui ignore le signal (la sonde U07)
    { const w = monde(); let sig = null; const r = lancer(w, (u, o) => { sig = o.signal; return Promise.resolve({ status: 200, ok: true, text: () => new Promise(() => {}) }); }, (x) => x.text());
      await w.avancer(1000); const avant = r.sortie(); await w.avancer(7000); await Promise.race([r.p, new Promise((q) => setTimeout(q, 300))]);
      t('B-SCCM-F2 ⛔⛔ en-têtes reçus, CORPS qui ne finit jamais (et qui n\'obéit pas au signal) : l\'attente se TERMINE quand même au délai (AbortError), la requête est annulée, aucun minuteur ne reste — `clearTimeout` ne part plus avant la fin du corps', avant === 'en cours' && r.sortie().err === 'AbortError' && sig.aborted === true && w.vifs() === 0, js([avant, r.sortie(), w.vifs()])); }
    // ③ le corps obéit au signal (la lecture est coupée par le navigateur) : la fin reste une AbortError, pas une valeur de repli
    { const w = monde(); const r = lancer(w, (u, o) => Promise.resolve({ status: 200, ok: true, text: () => new Promise((_, rej) => o.signal.addEventListener('abort', () => { const e = new Error('coupé'); e.name = 'AbortError'; rej(e); })) }), (x) => x.text().catch(() => '(body illisible)'));
      await w.avancer(8000); await Promise.race([r.p, new Promise((q) => setTimeout(q, 300))]);
      t('B-SCCM-F3 le corps obéit au signal et la lecture est rattrapée par le repli (« body illisible ») : le DÉLAI, lui, reste une AbortError (il n\'est pas avalé)', r.sortie().err === 'AbortError', js(r.sortie())); }
    // ④ succès : le corps est rendu, le minuteur est levé, rien n'est annulé
    { const w = monde(); let sig = null; const r = lancer(w, (u, o) => { sig = o.signal; return Promise.resolve({ status: 200, ok: true, text: () => Promise.resolve('{"status":"ok"}') }); }, (x) => x.text());
      await w.avancer(1); await Promise.race([r.p, new Promise((q) => setTimeout(q, 300))]);
      t('B-SCCM-F4 succès : le corps est rendu, le minuteur est LEVÉ (aucun rechargement ni annulation tardive), la requête n\'est pas annulée', !!r.sortie().ok && r.sortie().ok.corps === '{"status":"ok"}' && w.vifs() === 0 && w.appels.clear === 1 && sig.aborted === false, js([r.sortie(), w.vifs(), w.appels.clear])); }
    // ⑤ une erreur de lecture qui n'est pas un délai (HTTP 500 refusé par `lire`) : propagée telle quelle, minuteur levé
    { const w = monde(); const r = lancer(w, () => Promise.resolve({ status: 500, ok: false, text: () => Promise.resolve('') }), (x) => { if (!x.ok) throw new Error('HTTP ' + x.status); return x.text(); });
      await w.avancer(1); await Promise.race([r.p, new Promise((q) => setTimeout(q, 300))]);
      t('B-SCCM-F5 une erreur qui n\'est pas un délai (HTTP 500) arrive telle quelle (pas confondue avec un délai) et le minuteur est levé', r.sortie().err === 'Error' && w.vifs() === 0, js(r.sortie())); }
  });

  /* ── B-SCCM-S · D-173 : supprimer la série CHOISIE dans les structures DÉGRESSIVES ── */
  await garde('S', async () => {
    const DS = () => [SR(60, 8, true), SR(60, 8, false), SR(50, 8, false), SR(45, 8, false)];                 // 2 séries normales, puis 2 PALIERS
    {
      const X = await ouvrir({ wkt: wkt([exo('Développé Couché', DS(), { dropset: DROP(2) }), exo('Tractions', [SR(0, 8, false), SR(0, 8, false)])]) });
      const av = await etat(X); const f0 = await fab(X);
      const ok = await ouvrirFeuille(X, 0); const f = ok ? await feuille(X) : null; const fm = await fab(X);
      /* RÉÉCRIT le 17/11/2026 (lot D de fermeture, arbitrage de Michel : D-173 autorise le palier isolé). AVANT : les 2 paliers étaient des lignes verrouillées. L'invariant gardé : la feuille propose LA série
         choisie, chaque ligne dit ce qu'elle est, rien n'est caché. Maintenant : les 2 séries normales ET les 2 paliers (2 restants : aucun n'est le dernier) sont cliquables, les paliers se disent « Palier », aucune ligne verrouillée. */
      t('B-SCCM-S1 ⭐ dropset [normale ✓, normale, palier, palier] : « Supprimer une série… » est PROPOSÉ ; les 4 lignes sont cliquables (les 2 paliers se disent « Palier », aucun n\'est le dernier) et aucune n\'est verrouillée',
        ok && !!f && J(f.cliquables) === J([0, 1, 2, 3]) && f.verrouilles.length === 0 && !/Dernier palier/.test(f.texte) && /^\d\s*Palier/.test(f.boutons[2]) && /^\d\s*Palier/.test(f.boutons[3]) && /^\d\s*Normal/.test(f.boutons[1]), js(f));
      await toucher(X, 0, 1);                                                                                       // la 2ᵉ série normale, NON pointée
      const ap = await etat(X);
      t('B-SCCM-S2 ⭐⭐ la série NORMALE choisie part tout de suite (non pointée), la CHAÎNE et son réglage restent intacts (paliers, pourcentage, sens), les autres séries sont les MÊMES objets dans le même ordre',
        !(await confirmOuvert(X)) && ap.wkt.exs[0].sets.length === 3 && J(ap.wkt.exs[0].dropset) === J(DROP(2)) && J(ap.wkt.exs[0].sets) === J(sans(av.wkt.exs[0].sets, 1)) && J(ap.wkt.exs[1]) === J(av.wkt.exs[1]),
        J(ap.wkt.exs[0].sets.map((s) => s.mk)));
      t('B-SCCM-S3 ⭐ le reste est inchangé : programme et ancien historique intacts, la suppression est sur le disque (zéro perte), et la chaîne se lit toujours comme 2 paliers (la 1ʳᵉ ligne est la seule série normale)',
        J(ap.progs) === J(av.progs) && J(ap.sess) === J(av.sess) && ap.disque && J(ap.disque.exs[0].sets.map((s) => s.mk)) === J(ap.wkt.exs[0].sets.map((s) => s.mk))
        && await X.pg.evaluate(() => _dropDebut(S.wkt.exs[0]) === 1 && _estPalierDrop(S.wkt.exs[0], 1) && _estPalierDrop(S.wkt.exs[0], 2) && !_estPalierDrop(S.wkt.exs[0], 0)), '');
      t('B-SCCM-S4 ⭐ règle d\'or #9 : le bouton central « + » ne bouge pas (avant · feuille ouverte · après)', f0 === fm && f0 === await fab(X), f0 + ' | ' + fm + ' | ' + await fab(X));
      /* RÉÉCRIT le 17/11/2026 (lot D, D-173) : AVANT « un palier isolé ne se supprime pas ». Invariant gardé : le réglage `dropset.paliers` dit TOUJOURS le vrai nombre de paliers (« 3 paliers sur 2 lignes » reste interdit) ;
         ce qui change : un palier non pointé part tout de suite et le réglage SUIT (2 → 1), les autres séries sont les mêmes objets ; seul le DERNIER palier restant est refusé (sémantique non décidée). */
      const av2 = await etat(X);
      await X.pg.evaluate(() => { supprimerSerie(0, 2); });                                                          // le palier n°3 (45 kg), non pointé, le dernier en position
      const ap2 = await etat(X);
      t('B-SCCM-S5 ⭐ un PALIER isolé non pointé se supprime tout de suite (aucune confirmation) ET le réglage suit : paliers 2 → 1, pourcentage et sens conservés, les autres séries sont les mêmes objets',
        !(await confirmOuvert(X)) && ap2.wkt.exs[0].sets.length === 2 && J(ap2.wkt.exs[0].sets) === J(sans(av2.wkt.exs[0].sets, 2)) && J(ap2.wkt.exs[0].dropset) === J(DROP(1)) && J(ap2.progs) === J(av2.progs) && J(ap2.sess) === J(av2.sess), J(ap2.wkt.exs[0].dropset));
      await X.pg.evaluate(() => { supprimerSerie(0, 1); });                                                          // le DERNIER palier restant : refusé, rien ne change
      const ap2b = await etat(X);
      t('B-SCCM-S5b ⭐ le DERNIER palier restant ne se supprime pas (laisserait un dropset sans palier : sémantique non décidée) : aucune confirmation, rien ne change', !(await confirmOuvert(X)) && J(ap2b.wkt) === J(ap2.wkt), '');
      await ouvrirFeuille(X, 0); const fl = await feuille(X);
      t('B-SCCM-S5c ⭐ la feuille DIT pourquoi le dernier palier reste : sa ligne est verrouillée (non cliquable), la phrase « Dernier palier du dropset … rien n\'est supprimé » est là, seule la série normale est proposée',
        !!fl && J(fl.cliquables) === J([0]) && fl.verrouilles.length === 1 && /^2\s*Palier/.test(fl.verrouilles[0]) && /Dernier palier du dropset/.test(fl.texte) && /rien n'est supprimé/.test(fl.texte), js(fl));
      await X.pg.evaluate(() => closeExMenu());
      // une série normale POINTÉE dans la chaîne : confirmation d'abord (comme toute série pointée)
      await ouvrirFeuille(X, 0); await toucher(X, 0, 0);
      const conf = await X.pg.evaluate(() => ({ ouv: document.getElementById('ov-confirm').classList.contains('open'), titre: document.getElementById('confirm-title').textContent }));
      const pend = await etat(X);
      await confirmer(X, false); const ann = await etat(X);
      t('B-SCCM-S6 ⭐ la série normale POINTÉE d\'un dropset demande confirmation (rien n\'est supprimé tant qu\'on n\'a pas confirmé ; « Annuler » ne touche à rien)', conf.ouv && /Supprimer la série 1/.test(conf.titre) && J(pend.wkt) === J(ap2.wkt) && J(ann.wkt) === J(ap2.wkt), js(conf));
      await ouvrirFeuille(X, 0); await toucher(X, 0, 0); await confirmer(X, true);
      const fin = await etat(X);
      /* RÉÉCRIT le 17/11/2026 (lot D) : l'état de départ est maintenant [normale ✓, palier] (le palier n°3 est parti en S5). Invariant gardé : confirmé, CETTE série pointée part et elle seule, le réglage de la chaîne est conservé
         (paliers 1) ; il ne reste que la chaîne (un seul palier, dernière série restante) : plus d'entrée « Supprimer une série… ». */
      t('B-SCCM-S7 ⭐ confirmé : CETTE série pointée part et elle seule ; il ne reste que le dernier palier, le réglage de la chaîne est conservé ; plus rien à proposer (pas d\'entrée « Supprimer une série… »)',
        fin.wkt.exs[0].sets.length === 1 && J(fin.wkt.exs[0].sets) === J(ap2.wkt.exs[0].sets.slice(1)) && J(fin.wkt.exs[0].dropset) === J(DROP(1)) && !(await menu(X, 0) && await entree(X)), J(fin.wkt.exs[0].sets.map((s) => s.mk)));
      t('B-SCCM-S8 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
      await X.cx.close();
    }
    // une PYRAMIDE (sens « up ») : même règle ; et « dernière série » : [normale, palier] → la normale part, le palier reste, plus d'entrée
    {
      const X = await ouvrir({ wkt: wkt([exo('Squat', [SR(60, 8, false), SR(70, 6, false), SR(80, 4, false)], { dropset: DROP(2, 'up') }), exo('Curl Biceps Haltères', [SR(20, 12, false), SR(22, 10, false)], { dropset: DROP(1) })]) });
      const av = await etat(X);
      await ouvrirFeuille(X, 0); await toucher(X, 0, 0); const ap = await etat(X);
      t('B-SCCM-S9 pyramide (sens « up », 1 normale + 2 paliers) : la série normale part, la pyramide et son réglage restent', ap.wkt.exs[0].sets.length === 2 && J(ap.wkt.exs[0].dropset) === J(DROP(2, 'up')) && J(ap.wkt.exs[0].sets) === J(av.wkt.exs[0].sets.slice(1)), '');
      /* RÉÉCRIT le 17/11/2026 (lot D) : AVANT « il reste [palier, palier] — plus d'entrée (jamais un palier isolé) ». Maintenant un palier isolé se supprime tant qu'il en reste un autre : l'entrée EXISTE avec 2 paliers ; elle disparaît
         quand il n'en reste qu'un (dernière série restante : `rmEx`). */
      t('B-SCCM-S10 il reste [palier, palier] : l\'entrée « Supprimer une série… » existe (un palier isolé se supprime tant qu\'il en reste un autre)', await menu(X, 0) && await entree(X), '');
      await X.pg.evaluate(() => closeExMenu());
      await ouvrirFeuille(X, 1); await toucher(X, 1, 0); const ap2 = await etat(X);
      t('B-SCCM-S11 [normale, palier] : la normale part, le palier (dernière série restante) reste avec son réglage ; la règle « jamais la dernière série » n\'est pas contournée (pas d\'entrée ensuite)',
        ap2.wkt.exs[1].sets.length === 1 && J(ap2.wkt.exs[1].dropset) === J(DROP(1)) && J(ap2.wkt.exs[1].sets[0]) === J(av.wkt.exs[1].sets[1]) && !(await menu(X, 1) && await entree(X)), '');
      await X.cx.close();
    }
    // tout est palier : aucune série à supprimer (l'entrée n'existe pas), le réglage « Modifier paliers » reste le moyen
    {
      const X = await ouvrir({ wkt: wkt([exo('Tractions', [SR(0, 8, false), SR(0, 6, false), SR(0, 4, false)], { dropset: DROP(3) })]) });
      const av = await etat(X);
      /* RÉÉCRIT le 17/11/2026 (lot D) : AVANT « tout est palier : pas d'entrée, la fonction refuse chaque palier ». Invariant gardé : « ⚙️ Modifier paliers » reste le moyen de régler le nombre et le réglage dit toujours le vrai nombre.
         Maintenant : l'entrée existe, le palier du milieu part (3 → 2), le suivant part (2 → 1), la dernière ligne restante est refusée. */
      const ent = await menu(X, 0) && await entree(X);
      await X.pg.evaluate(() => { closeExMenu(); supprimerSerie(0, 1); });
      const a1 = await etat(X);
      await X.pg.evaluate(() => { supprimerSerie(0, 1); });                                                          // [m1, m3] : deux paliers, donc m3 part (il reste m1, seul)
      const a2 = await etat(X);
      await X.pg.evaluate(() => { supprimerSerie(0, 0); });                                                          // 1 seule série restante : refusé (jamais la dernière série)
      const a3 = await etat(X);
      t('B-SCCM-S12 dropset où TOUTES les séries sont des paliers : l\'entrée existe ; chaque retrait recale le réglage (3 → 2 → 1) ; avec UNE seule ligne la fonction refuse (jamais la dernière série) ; « ⚙️ Modifier paliers » est là',
        ent && J(a1.wkt.exs[0].sets) === J(sans(av.wkt.exs[0].sets, 1)) && a1.wkt.exs[0].dropset.paliers === 2 && J(a2.wkt.exs[0].sets) === J([av.wkt.exs[0].sets[0]]) && a2.wkt.exs[0].dropset.paliers === 1 && J(a3.wkt) === J(a2.wkt)
        && await X.pg.evaluate(() => [...document.querySelectorAll('#ex-block-0 button')].some((e) => /Modifier paliers/.test(e.textContent))), js([a1.wkt.exs[0].dropset, a2.wkt.exs[0].dropset]));
      await X.cx.close();
    }
    // un palier DÉJÀ POINTÉ (lot D) : confirmation d'abord ; « Annuler » ne touche à rien
    {
      const X = await ouvrir({ wkt: wkt([exo('Squat', [SR(60, 8, true), SR(50, 8, true), SR(45, 8, false)], { dropset: DROP(2) })]) });
      const av = await etat(X);
      await ouvrirFeuille(X, 0); await toucher(X, 0, 1);
      const conf = await X.pg.evaluate(() => ({ ouv: document.getElementById('ov-confirm').classList.contains('open'), titre: document.getElementById('confirm-title').textContent }));
      await confirmer(X, false); const ann = await etat(X);
      t('B-SCCM-S5d ⭐ un PALIER déjà pointé demande confirmation (« Supprimer le palier 2 ? ») : rien ne part tant qu\'on n\'a pas confirmé, « Annuler » ne touche à rien', conf.ouv && /Supprimer le palier 2/.test(conf.titre) && J(ann.wkt) === J(av.wkt), js(conf));
      await X.cx.close();
    }
    // des exercices variés (catalogue, perso, fictif) : un PALIER part et le réglage suit — aucun nom codé en dur dans la règle des paliers
    for (const nom of ['Squat', 'Tractions', PERSO, FIC]) {
      const X = await ouvrir({ wkt: wkt([exo(nom, DS(), { dropset: DROP(2) })]) });
      const av = await etat(X); await ouvrirFeuille(X, 0); await toucher(X, 0, 2); const ap = await etat(X);
      t('B-SCCM-S24 ⭐ « ' + nom + ' » (dropset) : un PALIER part, les autres séries sont identiques et le réglage suit (2 → 1)', J(ap.wkt.exs[0].sets) === J(sans(av.wkt.exs[0].sets, 2)) && J(ap.wkt.exs[0].dropset) === J(DROP(1)), '');
      await X.cx.close();
    }
    // un dégressif IMPORTÉ : séries de type « D » + `dropChaine`, SANS réglage `dropset` — ses lignes sont des séries comme les autres (aucune donnée à tenir cohérente)
    {
      const X = await ouvrir({ wkt: wkt([exo('Développé Couché', [SR(70, 6, true), SR(60, 6, false, 'D'), SR(50, 6, false, 'D'), SR(40, 6, false, 'D')], { dropChaine: true })]) });
      const av = await etat(X);
      const ok = await ouvrirFeuille(X, 0); const f = await feuille(X); await toucher(X, 0, 2); const ap = await etat(X);
      t('B-SCCM-S13 dégressif IMPORTÉ (type « D », pas de réglage `dropset`) : chaque ligne est une série supprimable ; supprimer la 3ᵉ garde le marqueur de chaîne, l\'ordre et tous les autres objets', ok && f.cliquables.length === 4 && ap.wkt.exs[0].dropChaine === true && !ap.wkt.exs[0].dropset
        && J(ap.wkt.exs[0].sets) === J(sans(av.wkt.exs[0].sets, 2)), js(f));
      await X.cx.close();
    }
    // le sens PDC EN ATTENTE suit sa série : après · avant · la série supprimée elle-même (la sonde S05) — une page neuve par cas.
    // ⚠️ MESURÉ : dans l'interface RÉELLE, toucher « ⋯ » fait quitter le champ du montant, ce qui oublie le sens attendu (`_pdcFin`) AVANT la suppression ; cet état n'est donc atteignable que si le champ
    // garde le focus pendant la suppression. L'invariant est tenu au niveau de la FONCTION que la feuille appelle (`supprimerSerie`), appelée ici directement avec le sens en attente — comme la sonde S05.
    const pdc4 = () => wkt([exo('Tractions', [SR(0, 8, false), SR(0, 8, false), SR(0, 8, false), SR(0, 8, false)])]);
    {
      const X = await ouvrir({ wkt: pdc4() });
      const mk = await X.pg.evaluate(() => S.wkt.exs[0].sets.map((s) => s.mk));
      await X.pg.evaluate(() => { setPdcMode(0, 2, '+'); });                                                       // « lest » choisi sur la 3ᵉ série, montant pas encore tapé
      const att0 = (await etat(X)).pdcAtt;
      await X.pg.evaluate(() => { supprimerSerie(0, 0); });                                                          // on supprime la 1ʳᵉ : la 3ᵉ devient la 2ᵉ
      const att1 = (await etat(X)).pdcAtt;
      const champ = await X.pg.evaluate(() => { _pdcMajChamp(0, 1); const row = document.querySelectorAll('#ex-block-0 .set-row')[1]; const i = row && row.querySelectorAll('.sinp')[1]; return i ? i.placeholder : null; });
      await X.pg.evaluate(() => { _pdcSaisie(0, 1, '15'); });
      const ap = await etat(X);
      t('B-SCCM-S14 ⭐⭐ APRÈS : une sélection PDC (lest) en attente sur la 3ᵉ série suit sa série quand une série AU-DESSUS est supprimée (index recalé, sens conservé), le champ affiche « lest kg », et le montant tapé va à LA BONNE série (pas à sa voisine)',
        J(att0) === J({ ei: 0, si: 2, sg: '+' }) && J(att1) === J({ ei: 0, si: 1, sg: '+' }) && /lest/.test(champ || '') && ap.wkt.exs[0].sets[1].mk === mk[2] && ap.wkt.exs[0].sets[1].pdc === 15 && ap.wkt.exs[0].sets[0].pdc === undefined && ap.wkt.exs[0].sets[2].pdc === undefined, js({ att0, att1, champ }));
      t('B-SCCM-S17 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
      await X.cx.close();
    }
    {
      const X = await ouvrir({ wkt: pdc4() });
      await X.pg.evaluate(() => { setPdcMode(0, 0, '-'); });                                                       // « assistance » en attente sur la 1ʳᵉ série
      await X.pg.evaluate(() => { supprimerSerie(0, 2); });                                                          // on supprime la 3ᵉ : rien ne bouge au-dessus
      const att = (await etat(X)).pdcAtt;
      t('B-SCCM-S15 ⭐ AVANT : une sélection PDC en attente sur une série AU-DESSUS de celle qu\'on supprime ne bouge pas (sens conservé)', J(att) === J({ ei: 0, si: 0, sg: '-' }), js(att));
      await X.cx.close();
    }
    {
      const X = await ouvrir({ wkt: pdc4() });
      await X.pg.evaluate(() => { setPdcMode(0, 1, '+'); });
      await X.pg.evaluate(() => { supprimerSerie(0, 1); });                                                          // on supprime LA série dont le sens était en attente
      const att = (await etat(X)).pdcAtt;
      t('B-SCCM-S16 ⭐ la sélection PDC en attente sur la série SUPPRIMÉE disparaît avec elle (la voisine qui prend son index n\'hérite pas d\'un sens attendu)', att === null, js(att));
      await X.cx.close();
    }
    // la REPRISE de séance : la suppression est sur le disque, la page rechargée retrouve exactement la même séance et la poursuit
    {
      const X = await ouvrir({ wkt: wkt([exo('Squat', DS(), { dropset: DROP(2) })]) });
      await ouvrirFeuille(X, 0); await toucher(X, 0, 1);
      const av = await etat(X);
      await X.pg.reload({ waitUntil: 'load' }); await X.pg.waitForTimeout(1600);
      const ap = await X.pg.evaluate(() => ({ wkt: S.wkt ? JSON.parse(JSON.stringify(S.wkt)) : null }));
      t('B-SCCM-S18 ⭐ REPRISE : la page rechargée retrouve la séance SANS la série supprimée (mêmes objets, même ordre, même réglage de chaîne)', !!ap.wkt && J(ap.wkt.exs[0].sets.map((s) => s.mk)) === J(av.wkt.exs[0].sets.map((s) => s.mk)) && J(ap.wkt.exs[0].dropset) === J(DROP(2)), js(ap.wkt && ap.wkt.exs[0].sets.map((s) => s.mk)));
      t('B-SCCM-S19 la séance reprise se poursuit : on valide une série restante et on termine sans erreur', await X.pg.evaluate(async () => { try { _expandedEx = 0; const k = S.wkt.exs[0].sets.findIndex((s) => !s.done); toggleSet(0, k); stopRest(); return S.wkt.exs[0].sets[k].done === true; } catch (e) { return false; } }) && X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
      await X.cx.close();
    }
    // un SUPERSET puis un dropset : l'index `ei` du dropset n'est pas celui du superset ; une sélection PDC en attente sur l'exercice 0 ne bouge pas
    {
      const g = 'g-sccm';
      const X = await ouvrir({ wkt: wkt([exo('Développé Couché', [SR(60, 10, true), SR(60, 10, false), SR(60, 10, false)], { group: g, groupType: 'super' }), exo(FIC, [SR(0, 12, false), SR(0, 12, false), SR(0, 12, false)], { group: g, groupType: 'super' }),
        exo('Squat', DS(), { dropset: DROP(2) })]) });
      const av = await etat(X);
      await X.pg.evaluate(() => { setPdcMode(1, 2, '+'); });
      await ouvrirFeuille(X, 2); await toucher(X, 2, 1);
      const ap = await etat(X);
      t('B-SCCM-S20 ⭐ superset puis dropset : la normale du DROPSET (3ᵉ exercice) part ; les deux exercices du superset et leur LIEN (group, groupType) sont intacts ; la sélection PDC en attente de l\'exercice 1 ne bouge pas',
        J(ap.wkt.exs[2].sets) === J(sans(av.wkt.exs[2].sets, 1)) && J(ap.wkt.exs[0]) === J(av.wkt.exs[0]) && J(ap.wkt.exs[1].sets.map((s) => s.mk)) === J(av.wkt.exs[1].sets.map((s) => s.mk)) && ap.wkt.exs[1].group === g && ap.wkt.exs[0].groupType === 'super' && J(ap.pdcAtt) === J({ ei: 1, si: 2, sg: '+' }), js(ap.pdcAtt));
      await X.cx.close();
    }
    // des FAMILLES d'exercices, un exercice PERSONNALISÉ et un exercice FICTIF : même règle dans un dropset, aucun nom codé en dur
    for (const [fam, nom] of [['catalogue — poussée', 'Développé Couché'], ['catalogue — jambes', 'Squat'], ['catalogue — tirage', 'Tractions'], ['catalogue — isolation', 'Curl Biceps Haltères'], ['catalogue — abdominaux', 'Crunch'], ['PERSONNALISÉ (S.customExercises)', PERSO], ['FICTIF inédit, absent du catalogue', FIC]]) {
      const X = await ouvrir({ wkt: wkt([exo(nom, DS(), { dropset: DROP(2) })]) });
      const av = await etat(X); const ok = await ouvrirFeuille(X, 0); await toucher(X, 0, 1); const ap = await etat(X);
      t('B-SCCM-S21 ⭐ ' + fam + ' « ' + nom + ' » (dropset) : la série normale du MILIEU choisie part, la chaîne et les 2 autres séries restent identiques', ok && J(ap.wkt.exs[0].sets) === J(sans(av.wkt.exs[0].sets, 1)) && J(ap.wkt.exs[0].dropset) === J(DROP(2)) && J(ap.sess) === J(av.sess), '');
      await X.cx.close();
    }
    // 375×667 : le bouton central ne bouge pas non plus
    {
      const X = await ouvrir({ w: 375, h: 667, wkt: wkt([exo('Squat', DS(), { dropset: DROP(2) })]) });
      const f0 = await fab(X); await ouvrirFeuille(X, 0); const fm = await fab(X); await toucher(X, 0, 1); const fa = await fab(X);
      t('B-SCCM-S22 ⭐ règle d\'or #9 sur 375×667 : le bouton central « + » ne bouge pas (avant · feuille ouverte · après suppression)', f0 === fm && f0 === fa, f0 + ' | ' + fm + ' | ' + fa);
      await X.cx.close();
    }
    // aucun nom d'exercice codé dans la règle
    {
      const X = await ouvrir({ wkt: null });
      const r = await X.pg.evaluate(() => { const src = [window._estPalierDrop, window._serieSupprimable, window.openSerieSuppr, window.supprimerSerie].map((f) => (typeof f === 'function' ? f.toString() : '')).join('\n').toLowerCase();
        const noms = (typeof EXLIB !== 'undefined' ? EXLIB : []).map((e) => String(e.n || '').toLowerCase()).filter((n) => n.length >= 5);
        return { n: noms.length, trouves: noms.filter((n) => src.indexOf(n) >= 0).slice(0, 5), longueur: src.length }; });
      t('B-SCCM-S23 ⭐ GÉNÉRIQUE : aucun nom du catalogue dans le code de la suppression (palier compris)', r.n > 100 && r.trouves.length === 0 && r.longueur > 800, js(r));
      await X.cx.close();
    }
  });

  /* ── B-SCCM-H · D-176 : l'en-tête global n'existe que sur l'Accueil ── */
  const ECRANS = ['log', 'progress', 'nutrition', 'coach', 'setup', 'cycle'];
  const mesure = (X) => X.pg.evaluate(() => {
    const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, b: r.bottom, r: r.right }; };
    const vu = (e) => { if (!e) return false; for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const tb = document.querySelector('.topbar'), act = document.querySelector('.screen.active'), sc = document.querySelector('.screens');
    const nb = [...document.querySelectorAll('.nav .nb')].map((e) => { const r = e.getBoundingClientRect(), c = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { id: e.id, ok: vu(e) && !!c && (c === e || e.contains(c)), w: r.width, h: r.height }; });
    return { ecran: window._curScreen, tbAff: !!tb && getComputedStyle(tb).display !== 'none', tb: R(tb), screens: R(sc), actif: R(act), fab: R(document.getElementById('nb-log')), vh: document.documentElement.clientHeight, vw: document.documentElement.clientWidth, nb,
      marque: { logo: vu(document.getElementById('tb-logo')), titre: vu(document.querySelector('.tb-title')), date: vu(document.getElementById('tb-date')) && (document.getElementById('tb-date').textContent || '').trim().length > 0,
        aide: vu(document.querySelector('.topbar button[title="Aide"]')), partage: vu(document.querySelector('.topbar button[title="Partager l\'app"]')), sheets: vu(document.getElementById('sync-pill')) },
      scrollX: act ? act.scrollWidth - act.clientWidth : null, root: document.getElementById('root').className };
  });
  const bandeVide = (m) => m.screens && Math.abs(m.screens.y) < 0.6 && Math.abs(m.screens.b - m.vh) < 0.6 && m.actif && Math.abs(m.actif.y) < 0.6;
  await garde('H', async () => {
    for (const [W, H] of [[390, 844], [375, 667]]) {
      const X = await ouvrir({ w: W, h: H, ecran: 'home' });
      await X.pg.evaluate(() => { goScreen('home', document.getElementById('nb-home')); }); await X.pg.waitForTimeout(300);
      const h0 = await mesure(X);
      t('B-SCCM-H1 ⭐ ' + W + '×' + H + ' ACCUEIL : l\'en-tête global est là, complet (logo, « Force Tracker », date, « ? », partage, Sheets) et l\'écran commence juste dessous',
        h0.tbAff && h0.tb.h > 40 && Object.values(h0.marque).every(Boolean) && Math.abs(h0.screens.y - h0.tb.b) < 0.6 && h0.root.indexOf('on-home') >= 0, js(h0.marque));
      const ref = [];
      for (const e of ECRANS) {
        await X.pg.evaluate((e) => { goScreen(e, document.getElementById('nb-' + e)); }, e); await X.pg.waitForTimeout(450);
        const m = await mesure(X); ref.push(m);
        t('B-SCCM-H2 ⭐ ' + W + '×' + H + ' « ' + e + ' » : l\'en-tête global est MASQUÉ (display:none, 0 px), l\'écran commence tout en haut — AUCUNE bande vide — et occupe toute la hauteur',
          !m.tbAff && m.tb.h === 0 && bandeVide(m) && Object.values(m.marque).every((v) => v === false), js({ tbAff: m.tbAff, tbh: m.tb && m.tb.h, screens: m.screens && [m.screens.y, m.screens.b], vh: m.vh }));
        t('B-SCCM-H3 ⭐ ' + W + '×' + H + ' « ' + e + ' » : la barre du bas et le bouton central sont EXACTEMENT où ils étaient sur l\'Accueil (règle d\'or #9, mesuré), les 6 onglets visibles et atteignables du pouce',
          J(m.fab) === J(h0.fab) && m.nb.length === 6 && m.nb.every((x) => x.ok), js({ fab: m.fab, accueil: h0.fab, nb: m.nb.filter((x) => !x.ok) }));
        t('B-SCCM-H4 ' + W + '×' + H + ' « ' + e + ' » : aucun défilement horizontal parasite', m.scrollX === 0 || m.scrollX === null, 'dépassement ' + m.scrollX);
      }
      await X.pg.evaluate(() => { goScreen('home', document.getElementById('nb-home')); }); await X.pg.waitForTimeout(300);
      const h1 = await mesure(X);
      t('B-SCCM-H5 ⭐ ' + W + '×' + H + ' RETOUR à l\'Accueil : l\'en-tête global est RESTAURÉ à l\'identique (même rectangle, même contenu) et l\'écran recommence dessous', h1.tbAff && J(h1.tb) === J(h0.tb) && Object.values(h1.marque).every(Boolean) && J(h1.fab) === J(h0.fab), js(h1.tb));
      if (W === 390) {
        // les TITRES et les commandes de chaque écran sont toujours là (ce que l'en-tête ne portait pas)
        const titres = {};
        for (const [e, sel] of [['log', '#log-hdr .log-h1'], ['progress', '#s-progress'], ['nutrition', '#s-nutrition'], ['coach', '#s-coach'], ['setup', '#s-setup'], ['cycle', '#s-cycle']]) {
          await X.pg.evaluate((e) => { goScreen(e, document.getElementById('nb-' + e)); }, e); await X.pg.waitForTimeout(350);
          titres[e] = await X.pg.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), txt: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40) }; }, sel);
        }
        t('B-SCCM-H6 les écrans gardent leurs TITRES et leurs commandes propres : « Séance » (titre + date), Progrès (onglets), Nutrition (onglets), « Milo » (titre du Coach), Menu, Cycle — rien n\'a disparu avec l\'en-tête global',
          titres.log && /^Séance/.test(titres.log.txt) && !!titres.progress && !!titres.nutrition && !!titres.coach && !!titres.setup && !!titres.cycle
          && await X.pg.evaluate(() => { goScreen('progress', document.getElementById('nb-progress')); return [...document.querySelectorAll('#s-progress *')].some((e) => e.children.length === 0 && /^Séances$/.test((e.textContent || '').trim()) && e.getBoundingClientRect().height > 0); })
          && await X.pg.evaluate(() => { goScreen('coach', document.getElementById('nb-coach')); return /Milo/.test((document.getElementById('s-coach').innerText || '')); }), js(titres));
      }
      t('B-SCCM-H7 ' + W + '×' + H + ' aucune erreur de page pendant Accueil → chaque écran → Accueil', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
      await X.cx.close();
    }
    // un écran FUTUR (qui n'existe dans aucune liste) : masqué aussi, restauré au retour — la règle ne dépend d'aucune liste d'écrans
    {
      const X = await ouvrir({ ecran: 'home' });
      await X.pg.evaluate(() => { for (const id of ['futur', 'home2', 'accueil']) { const d = document.createElement('div'); d.className = 'screen'; d.id = 's-' + id; d.innerHTML = '<h2 id="titre-' + id + '">Écran futur ' + id + '</h2><div class="scroll-spacer"></div>'; document.querySelector('.screens').appendChild(d); } });
      const h0 = await mesure(X); const res = [];
      for (const id of ['futur', 'home2', 'accueil']) {
        await X.pg.evaluate((id) => { goScreen(id, null); }, id); await X.pg.waitForTimeout(300);
        const m = await mesure(X); res.push([id, m.tbAff, m.tb && m.tb.h, bandeVide(m), J(m.fab) === J(h0.fab)]);
        res.push(await X.pg.evaluate((id) => { const e = document.getElementById('titre-' + id); const r = e.getBoundingClientRect(); return r.height > 0 && r.top >= 0; }, id));
        await X.pg.evaluate(() => { goScreen('home', document.getElementById('nb-home')); }); await X.pg.waitForTimeout(250);
        const r = await mesure(X); res.push(r.tbAff && J(r.tb) === J(h0.tb));
      }
      t('B-SCCM-H8 ⭐⭐ ÉCRANS FUTURS (inventés par le banc : « futur », « home2 », « accueil » — aucun n\'est « home ») : en-tête MASQUÉ, aucune bande vide, bouton central immobile, titre visible ; au retour à l\'Accueil il est restauré',
        res.filter((x) => Array.isArray(x)).every((x) => x[1] === false && x[2] === 0 && x[3] === true && x[4] === true) && res.filter((x) => typeof x === 'boolean').every(Boolean) && X.errs.length === 0, js(res));
      await X.cx.close();
    }
    // la SÉANCE : l'en-tête de séance (état, chrono, ⋯, « Terminer ») reste ; l'en-tête global, lui, ne revient pas pendant la séance
    {
      const X = await ouvrir({ wkt: wkt([exo('Développé Couché', [SR(80, 8, true), SR(80, 8, false)])]), ecran: 'log' });
      await X.pg.waitForTimeout(400);
      const mk = () => X.pg.evaluate(() => {
        const vu = (e) => { if (!e) return false; for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
        const tb = document.querySelector('.topbar'), fin = document.querySelector('.topbar .tbs-fin'); let reach = false, taille = null, ouvert = false;
        if (fin && vu(fin)) { const r = fin.getBoundingClientRect(); const c = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); reach = !!c && (c === fin || fin.contains(c)); taille = [Math.round(r.width), Math.round(r.height)]; }
        const sc = document.querySelector('.screens').getBoundingClientRect(), tbr = tb.getBoundingClientRect();
        return { tbAff: getComputedStyle(tb).display !== 'none', seance: vu(document.getElementById('tb-seance')), marque: vu(document.getElementById('tb-logo')), fin: vu(fin), reach, taille, collé: Math.abs(sc.top - tbr.bottom) < 0.6, ecran: window._curScreen };
      });
      const a = await mk(); const f0 = await fab(X);
      t('B-SCCM-H9 ⭐⭐ pendant une séance, sur l\'écran Séance : l\'en-tête de SÉANCE reste (état, chrono, ⋯, « Terminer » visible, atteignable au toucher, ≥ 40 px), l\'en-tête GLOBAL (logo) est masqué, et l\'écran commence juste dessous',
        a.tbAff && a.seance && !a.marque && a.fin && a.reach && a.taille[1] >= 40 && a.collé, js(a));
      await X.pg.evaluate(() => { goScreen('progress', document.getElementById('nb-progress')); }); await X.pg.waitForTimeout(300);
      const p = await mk(); const fp = await fab(X);
      await X.pg.evaluate(() => { goScreen('log', document.getElementById('nb-log')); }); await X.pg.waitForTimeout(300);
      const r = await mk();
      t('B-SCCM-H10 ⭐ la séance continue sur un autre écran : en-tête global masqué, bouton central immobile ; de retour sur Séance l\'en-tête de séance et « Terminer » sont restaurés', !p.tbAff && p.ecran === 'progress' && fp === f0 && r.tbAff && r.seance && r.fin && r.reach, js([p, r]));
      // « Terminer » : un VRAI toucher sur le bouton termine la séance (récapitulatif ouvert), rien n'est perdu
      const pos = await X.pg.evaluate(() => { const r = document.querySelector('.topbar .tbs-fin').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await X.pg.mouse.click(pos.x, pos.y); await X.pg.waitForTimeout(500);
      const conf = await X.pg.evaluate(() => { const o = document.getElementById('ov-confirm'); return !!(o && o.classList.contains('open')) && /Il reste 1 série/.test(document.getElementById('confirm-title').textContent); });   // une série n'est pas faite : « Terminer quand même ? »
      if (conf) { await X.pg.click('#confirm-ok'); await X.pg.waitForTimeout(900); }
      const fin = await X.pg.evaluate(() => ({ recap: !!(document.getElementById('ov-session-end') && document.getElementById('ov-session-end').classList.contains('open')), n: S.sessions.length, stock: JSON.parse(localStorage.getItem('ft4_sessions') || '[]').length }));
      t('B-SCCM-H11 ⭐ un VRAI toucher sur « Terminer » (en-tête de séance, écran sans en-tête global) répond (« Il reste 1 série… Terminer quand même ? »), et confirmé termine la séance : le récapitulatif s\'ouvre, la séance est enregistrée (mémoire + stockage)', conf && fin.recap && fin.n === 2 && fin.stock === 2 && X.errs.length === 0, js([fin, X.errs.slice(0, 2)]));
      await X.cx.close();
    }
    // défilement, zoom, clavier : l'écran sans en-tête global reste utilisable
    {
      const X = await ouvrir({ ecran: 'setup' });
      const sc = await X.pg.evaluate(async () => { const a = document.querySelector('.screen.active'); const j = a.scrollHeight - a.clientHeight; a.scrollTop = 300; await new Promise((r) => setTimeout(r, 120)); return { defilable: j, top: a.scrollTop }; });
      t('B-SCCM-H12 le DÉFILEMENT fonctionne sur un écran sans en-tête global (Menu : contenu plus haut que l\'écran, la molette / le doigt le font défiler)', sc.defilable > 300 && sc.top >= 290, js(sc));
      await X.pg.evaluate(() => { goScreen('progress', document.getElementById('nb-progress')); }); await X.pg.waitForTimeout(300);
      const m1 = await mesure(X);
      await X.cd.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 }); await X.pg.waitForTimeout(400);
      const m2 = await mesure(X); const z = await X.pg.evaluate(() => ({ s: window.visualViewport.scale, meta: (document.querySelector('meta[name=viewport]') || {}).content }));
      await X.cd.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 }); await X.pg.waitForTimeout(300);
      const m3 = await mesure(X);
      t('B-SCCM-H13 ⭐ le ZOOM : page agrandie ×2 (le zoom n\'est pas désactivé), la mise en page CSS ne bouge pas (écran sans bande vide, bouton central au même endroit), et revenu à ×1 tout est identique', Math.abs(z.s - 2) < 0.01 && /user-scalable\s*=\s*yes/.test(z.meta) && bandeVide(m2) && J(m2.fab) === J(m1.fab) && J(m3.screens) === J(m1.screens) && J(m3.fab) === J(m1.fab), js([z, m1.screens, m2.screens]));
      await X.cx.close();
    }
    {
      const X = await ouvrir({ wkt: wkt([exo('Développé Couché', [SR(80, 8, false), SR(80, 8, false)])]), ecran: 'log' });
      await X.pg.evaluate(() => { _expandedEx = 0; renderExBlocks(); }); await X.pg.waitForTimeout(300);
      const f0 = await fab(X); const sc0 = await X.pg.evaluate(() => { const r = document.querySelector('.screens').getBoundingClientRect(); return [r.top, r.bottom].join(','); });
      const cl = await X.pg.evaluate(() => { const i = document.querySelector('#ex-block-0 .set-row .sinp'); if (!i) return null; i.focus(); return true; });
      await X.pg.waitForTimeout(400);
      const k = await X.pg.evaluate(() => ({ kbd: document.getElementById('root').classList.contains('kbd-serie'), nav: getComputedStyle(document.querySelector('.nav')).display, sc: (() => { const r = document.querySelector('.screens').getBoundingClientRect(); return [r.top, r.bottom].join(','); })(), tb: getComputedStyle(document.querySelector('.topbar')).display }));
      await X.pg.evaluate(() => { document.activeElement && document.activeElement.blur(); }); await X.pg.waitForTimeout(400);
      const f1 = await fab(X);
      if (!cl || !k.kbd) console.log('   (B-SCCM-H14 sans objet : Chromium ne déclenche pas la saisie de série par un simple focus — clavier NON rejoué, voir l\'en-tête)');
      else t('B-SCCM-H14 le CLAVIER : pendant la saisie d\'une série la barre du bas se retire (comportement existant), l\'en-tête de séance reste, l\'écran ne bouge pas de haut en bas ; la saisie finie, le bouton central revient exactement à sa place', k.nav === 'none' && k.tb !== 'none' && k.sc.split(',')[0] === sc0.split(',')[0] && f1 === f0, js([k, f0, f1]));
      await X.cx.close();
    }
    // la zone sûre du haut (encoche) : ÉMULÉE par le protocole de développement quand Chromium le permet — sinon dit « sans objet »
    {
      const X = await ouvrir({ ecran: 'progress' });
      const ok = await X.cd.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 47, bottom: 34 } }).then(() => true, () => false);
      if (!ok) console.log('   (B-SCCM-H15 sans objet : cette version de Chromium n\'émule pas les zones sûres — la règle `env(safe-area-inset-top)` est épinglée par B-SCCM-P8, la mesure sur un vrai iPhone reste à faire)');
      else {
        await X.pg.waitForTimeout(400);
        const e47 = await X.pg.evaluate(() => { const probe = document.createElement('div'); probe.style.cssText = 'position:fixed;top:0;height:env(safe-area-inset-top,0px);width:1px;'; document.body.appendChild(probe); const h = probe.getBoundingClientRect().height; probe.remove(); return h; });
        const m = await mesure(X);
        if (e47 < 40) console.log('   (B-SCCM-H15 sans objet : l\'émulation de zone sûre n\'a aucun effet mesurable dans cette version — env() = ' + e47 + ')');
        else {
          await X.pg.evaluate(() => { window._swReloadPending = true; window._majVersion = 'ft-v9999'; _majRefresh(); }); await X.pg.waitForTimeout(250);
          const mb = await mesure(X); const ban = await X.pg.evaluate(() => { const r = document.getElementById('maj-banner').getBoundingClientRect(); return { y: r.top, b: r.bottom, h: r.height }; });
          await X.pg.evaluate(() => { window._swReloadPending = false; window._majVersion = null; _majRefresh(); }); await X.pg.evaluate(() => { goScreen('home', document.getElementById('nb-home')); }); await X.pg.waitForTimeout(250);
          const mh = await mesure(X);
          await X.pg.evaluate(() => { S.wkt = { date: today(), exs: [{ name: 'Mouvement Inventé Bêta', sets: [{ kg: 50, reps: 8, type: 'N', done: false }] }], startTs: Date.now() - 600000, startHour: 10 }; persist(); goScreen('log', document.getElementById('nb-log')); }); await X.pg.waitForTimeout(400);
          const ms = await X.pg.evaluate(() => { const tbe = document.querySelector('.topbar'), tb = tbe.getBoundingClientRect(), sc = document.querySelector('.screens').getBoundingClientRect(); return { aff: getComputedStyle(tbe).display !== 'none', colle: Math.abs(sc.top - tb.bottom) < 1, haut: tb.top, bas: tb.bottom, ecranHaut: sc.top, marge: getComputedStyle(document.querySelector('.screens')).marginTop, root: document.getElementById('root').className }; });
          t('B-SCCM-H15 ⭐ ZONE SÛRE (encoche émulée : 47 px en haut) : sans en-tête global l\'écran descend de la zone sûre (le contenu ne passe pas sous l\'encoche) ; sous le bandeau de mise à jour il n\'y a PAS de double marge (le bandeau gère l\'encoche seul) ; l\'Accueil garde son en-tête qui la respecte ; sous l\'en-tête de SÉANCE aucune marge en plus (l\'écran le suit, collé)',
            Math.abs(m.screens.y - e47) < 1 && Math.abs(mb.screens.y - ban.b) < 1 && ban.h >= 47 && mh.tbAff && mh.tb.h >= 47 + 40 && ms.aff && ms.colle, js({ inset: e47, ecran: m.screens.y, avecBandeau: [mb.screens.y, ban.b, ban.h], accueilTb: mh.tb && mh.tb.h, seance: ms }));
        }
      }
      await X.cx.close();
    }
  });

  /* ── B-SCCM-B · D-170 : le bandeau de mise à jour sur l'ACCUEIL — discret, jamais bloquant, jamais pendant une opération active ── */
  await garde('B', async () => {
    const X = await ouvrir({ ecran: 'home' });
    await X.pg.evaluate(() => { goScreen('home', document.getElementById('nb-home')); }); await X.pg.waitForTimeout(300);
    const etatBandeau = () => X.pg.evaluate(() => { const bn = document.getElementById('maj-banner'), cs = getComputedStyle(bn), r = bn.getBoundingClientRect(), tb = document.querySelector('.topbar').getBoundingClientRect(); const fx = document.getElementById('maj-restart'), pl = document.getElementById('maj-later');
      return { vu: cs.display !== 'none' && r.height > 0, pos: cs.position, h: r.height, b: r.bottom, topbarY: tb.top, txt: (document.getElementById('maj-txt').textContent || '').trim(), root: document.getElementById('root').className,
        go: fx && fx.getBoundingClientRect().height, plus: pl && pl.getBoundingClientRect().height, fab: (() => { const q = document.getElementById('nb-log').getBoundingClientRect(); return [q.x, q.y, q.width, q.height].map((v) => Math.round(v * 10) / 10).join(','); })(),
        versions: [...document.querySelectorAll('.app-ver')].map((e) => (e.textContent || '').trim()).filter(Boolean) }; });
    const f0 = await fab(X);
    await X.pg.evaluate(() => { window._swReloadPending = true; window._majVersion = 'ft-v9999'; window._majFerme = null; _majRefresh(); }); await X.pg.waitForTimeout(250);
    const e1 = await etatBandeau();
    const attendu = await X.pg.evaluate(() => APP_BUILD);
    t('B-SCCM-B1 ⭐ une mise à jour DISPONIBLE et SÛRE (Accueil, rien en cours) : le bandeau discret est visible SUR L\'ACCUEIL, nomme la version, en flux (il pousse l\'en-tête vers le bas sans le recouvrir), « Mettre à jour » et « Plus tard » ≥ 40 px',
      e1.vu && e1.pos !== 'fixed' && e1.pos !== 'absolute' && /ft-v9999/.test(e1.txt) && Math.abs(e1.topbarY - e1.b) < 0.6 && /on-home/.test(e1.root) && e1.go >= 40 && e1.plus >= 40, js(e1));
    t('B-SCCM-B2 ⭐⭐ règle d\'or #9 : le bouton central « + » ne bouge pas quand le bandeau apparaît sur l\'Accueil, et la VRAIE version affichée (`.app-ver`) reste celle du code qui tourne (APP_BUILD), jamais « ft-v9999 »', e1.fab === f0 && e1.versions.length > 0 && e1.versions.every((v) => v === attendu), js({ f0, fab: e1.fab, versions: e1.versions, attendu }));
    // aucun pop-up : le bandeau n'est pas un overlay, rien ne le bloque ni ne bloque l'écran — un toucher sous le bandeau atteint bien l'écran
    const touche = await X.pg.evaluate(() => { const bn = document.getElementById('maj-banner').getBoundingClientRect(); const c = document.elementFromPoint(100, bn.bottom + 30); return { dansBandeau: !!(c && c.closest('#maj-banner')), overlay: !!document.querySelector('.overlay.open') }; });
    t('B-SCCM-B3 aucun pop-up bloquant : aucune fenêtre ouverte, et le contenu sous le bandeau reçoit le toucher (le bandeau ne recouvre rien)', !touche.dansBandeau && !touche.overlay, js(touche));
    // « Plus tard » : ferme pour CETTE version, en mémoire seulement
    await X.pg.evaluate(() => { document.getElementById('maj-later').click(); }); await X.pg.waitForTimeout(200);
    const e2 = await etatBandeau();
    t('B-SCCM-B4 « Plus tard » ferme l\'avis (pour cette version, en mémoire seulement : rien n\'est écrit)', !e2.vu && await X.pg.evaluate(() => Object.keys(localStorage).filter((k) => /maj|update/i.test(k) && k !== 'ft4_just_updated').length === 0), js(e2));
    // jamais pendant une opération active
    const cas = [
      ['séance en cours', () => { S.wkt = { date: today(), exs: [{ name: 'Mouvement Inventé Bêta', sets: [{ kg: 50, reps: 8, type: 'N', done: false }] }], startTs: Date.now() - 600000, startHour: 10 }; }, () => { S.wkt = null; }],
      ['enregistrement de la séance en cours (`_finishing`)', () => { _finishing = true; }, () => { _finishing = false; }],
      ['génération du briefing en cours', () => { _dbfActifs.add('s-fictive'); }, () => { _dbfActifs.delete('s-fictive'); }],
      ['récapitulatif ouvert', () => { document.getElementById('ov-session-end').classList.add('open'); }, () => { document.getElementById('ov-session-end').classList.remove('open'); }],
      ['briefing consulté', () => { document.getElementById('ov-debrief-milo').classList.add('open'); }, () => { document.getElementById('ov-debrief-milo').classList.remove('open'); }],
      ['bilan de la semaine ouvert', () => { document.getElementById('ov-week-summary').classList.add('open'); }, () => { document.getElementById('ov-week-summary').classList.remove('open'); }],
    ];
    const res = [];
    for (const [nom, pose, leve] of cas) {
      await X.pg.evaluate(() => { window._majFerme = null; });
      await X.pg.evaluate((p) => { eval('(' + p + ')()'); window._swReloadPending = true; window._majVersion = 'ft-v9999'; _majRefresh(); }, pose.toString()); await X.pg.waitForTimeout(150);
      const pendant = await etatBandeau();
      await X.pg.evaluate((l) => { eval('(' + l + ')()'); _majRefresh(); }, leve.toString()); await X.pg.waitForTimeout(150);
      const apres = await etatBandeau();
      res.push([nom, pendant.vu, apres.vu]);
    }
    t('B-SCCM-B5 ⭐⭐ JAMAIS pendant : une séance en cours · l\'enregistrement · la génération du briefing · le récapitulatif · la consultation du briefing · un bilan de semaine ouvert — AUCUN bandeau ; dès que l\'opération est finie il paraît (sans qu\'il faille changer d\'écran)',
      res.every((r) => r[1] === false && r[2] === true), js(res));
    t('B-SCCM-B6 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  });
}

/* ══════════════════════════════════════ D-170 : L'ATTENTE SE TERMINE (vrai service worker, vrai serveur qui fige le corps) ══════════════════════════════════════ */
async function maj(t, b) {
  console.log('\n═══ B-SCCM-U (D-170, réseau réel local). L\'ATTENTE SE TERMINE · LE VERROU NE SE LÈVE JAMAIS PAR UN DÉLAI ═══');
  const SEUL = (process.env.SCCM_SEUL || '').split(',').filter(Boolean);
  const garde = async (nom, f) => { if (SEUL.length && SEUL.indexOf(nom) < 0) return; try { await f(); } catch (e) { t('B-SCCM-' + nom + ' ⛔ le scénario s\'est exécuté jusqu\'au bout', false, String(e && e.stack || e).slice(0, 500)); } };
  const pret = async () => { const sc = await mvAide.ouvrir(b); const g = await sm.brancher(sc); await sm.annoncerBilans(sc.pg); const net = await reseau();
    await sc.pg.evaluate((u) => { S.url = u; S.connected = true; window.__toasts = []; const v = window.toast; window.toast = function (m, ty) { window.__toasts.push(String(m)); return v.apply(this, arguments); }; }, net.url);
    return { sc, g, net }; };
  const recevoir = async (sc, i) => { await marquer(sc.pg); await publier(sc); const r = await recue(sc); await calme(sc, i); return r && await sm.vivant(sc.pg); };
  const fin = async (sc, net) => { try { net.fermer(); } catch (e) {} await sc.fermer(); };
  const decaler = (pg, ms) => pg.evaluate((ms) => { if (!window.__nowReel) window.__nowReel = Date.now.bind(Date); Date.now = () => window.__nowReel() + ms; }, ms);
  const rendre = (pg) => pg.evaluate(() => { if (window.__nowReel) Date.now = window.__nowReel; });
  const toasts = (pg) => pg.evaluate(() => window.__toasts.slice());
  const synced = (pg) => pg.evaluate(() => (S.sessions[0] || {}).synced);
  const sansErreur = (nom, sc) => t('B-SCCM-U-X-' + nom + ' 0 erreur JS de page pendant tout le parcours', sc.erreurs.length === 0, js(sc.erreurs));
  /* ── U-A · la fin de séance : les EN-TÊTES arrivent, le CORPS ne finit jamais (la sonde U07) ── */
  await garde('A', async () => {
    const { sc, net } = await pret();
    try {
      const { pg } = sc;
      await allerA(pg, 'log'); await sm.seance(pg, 'Exercice Fictif Zéta');
      t('B-SCCM-U-A0 le contrôle : la mise à jour est reçue PENDANT la séance et attend', await recevoir(sc, 1), '');
      net.mode = 'corps-fige';
      await pg.evaluate(() => { window.__fin = finishWorkout(); });
      await attendre(async () => net.enTetes >= 1, 15000, 100);
      await dormir(400);
      const e1 = await sm.etat(pg), a1 = await sm.tient(pg, 600);
      t('B-SCCM-U-A1 ⛔⛔ les EN-TÊTES de la réponse sont arrivés, le CORPS est figé : la séance est DÉJÀ enregistrée (mémoire + stockage), le verrou est posé, l\'écran de fin n\'est pas ouvert, et AUCUN rechargement ne tombe',
        e1.fin === true && !e1.recap && e1.n === 1 && e1.stock === 1 && sm.vide(e1.wkt) && a1.ok, js({ fin: e1.fin, recap: e1.recap, n: e1.n, stock: e1.stock, attaque: a1.a }));
      await decaler(pg, 130000);                                                         // l'horloge de la page avance de 130 s : l'opération, elle, n'a PAS fini (la sonde U02)
      const a2 = await sm.tient(pg, 600), e2 = await sm.etat(pg);
      t('B-SCCM-U-A2 ⛔⛔ 130 s plus tard (l\'horloge avance, le corps est toujours figé) : le verrou n\'est PAS levé par le temps — il reste posé et aucun rechargement ne tombe (l\'ancien « filet » de 120 s rechargeait ici, sans récapitulatif)', e2.fin === true && !e2.recap && a2.ok, js({ fin: e2.fin, recap: e2.recap, attaque: a2.a }));
      await rendre(pg);
      const fini = await attendre(async () => (await sm.etat(pg)).recap, 25000, 200);
      const e3 = await sm.etat(pg), tx = await toasts(pg);
      const v = net.vus.filter((x) => x.action === 'logSession')[0] || {};
      t('B-SCCM-U-A3 ⛔⛔ le DÉLAI (8 s, lecture du corps comprise) TERMINE l\'opération : le verrou se lève, l\'écran de fin s\'ouvre, et la requête a été RÉELLEMENT annulée (le serveur a vu la connexion coupée avant la fin du corps)', fini && e3.fin === false && e3.recap && v.coupe === true && v.fini === false, js({ fini, fin: e3.fin, recap: e3.recap, serveur: v }));
      t('B-SCCM-U-A4 ⛔ l\'issue est DITE et la séance GARDÉE : message « Réseau trop lent — ta séance est gardée, on réessaiera », séance enregistrée (mémoire + stockage), marquée à renvoyer (`synced:false`)', tx.some((m) => /Réseau trop lent — ta séance est gardée/.test(m)) && e3.n === 1 && e3.stock === 1 && await synced(pg) === false, js({ toasts: tx, synced: await synced(pg) }));
      // la RELANCE CONTRÔLÉE (la séance reste dans la file `synced:false`) : une seule passe de la file = UN nouvel essai, aucune boucle cachée ; le récapitulatif est toujours ouvert
      net.mode = 'ok'; const avant = net.nb('logSession');
      await pg.evaluate(async () => { await _retrySheetQueue(); });
      await dormir(2500);
      const rel = net.vus.filter((x) => x.action === 'logSession');
      t('B-SCCM-U-A7 ⭐ relance contrôlée : UNE passe de la file = UN nouvel essai (2 au total : l\'annulé + celui-là), pas de boucle cachée ; il aboutit et la séance est marquée envoyée', net.nb('logSession') === avant + 1 && rel[rel.length - 1].fini === true && await synced(pg) === true, js({ avant, apres: net.nb('logSession'), synced: await synced(pg) }));
      const a3 = await sm.tient(pg, 800);
      t('B-SCCM-U-A5 le récapitulatif ouvert retient encore la mise à jour (rien ne tombe sur lui, même après la relance)', a3.ok, js(a3.a));
      await pg.evaluate(() => { closeSessionEnd('home'); });
      /* A6 RÉÉCRIT le 17/11/2026 (lot M, D-170 : plus de rechargement automatique, même sur l'Accueil). AVANT : « le récapitulatif fermé, sur l'Accueil : la mise à jour s'applique » (toute seule). INVARIANT GARDÉ : la séance (envoyée) est INTACTE
         après le redémarrage. CHANGÉ : fermé, la mise à jour se PROPOSE (bandeau) sans recharger ; elle part par le choix « Mettre à jour ». */
      await attendre(async () => voit(await lireBandeau(pg)), 10000, 200);
      const bnA6 = await lireBandeau(pg), ta6 = await sm.tientAuto(pg, 1500), okA6 = await sm.cliquerMaj(pg);
      const rech = okA6 && await rechargee(pg, 25000); await sc.pg.waitForTimeout(300); await mvAide.poser(pg, 1);
      const ap = await sm.etat(pg);
      t('B-SCCM-U-A6 ⛔ le récapitulatif fermé, sur l\'Accueil : la mise à jour est PROPOSÉE (bandeau) SANS rechargement automatique ; le choix « Mettre à jour » l\'applique ; la séance est INTACTE après le redémarrage (1 séance, mémoire et stockage, marquée envoyée)', voit(bnA6) && ta6.ok && okA6 && rech && ap.n === 1 && ap.stock === 1 && await synced(pg) === true, js({ bandeau: voit(bnA6), vivant: ta6.ok, clic: okA6, rech, n: ap.n, stock: ap.stock, synced: await synced(pg) }));
    } finally { sansErreur('A', sc); await fin(sc, net); }
  });

  /* ── U-B · la LATENCE dépasse le délai : la réponse arrive après l'abandon ── */
  await garde('B', async () => {
    const { sc, net } = await pret();
    try {
      const { pg } = sc;
      await allerA(pg, 'log'); await sm.seance(pg, 'Mouvement Inventé Bêta', true);
      net.mode = 'lent'; net.delai = 13000;
      await pg.evaluate(() => { window.__fin = finishWorkout(); });
      await attendre(async () => (await sm.etat(pg)).recap, 25000, 200);
      const e1 = await sm.etat(pg);
      t('B-SCCM-U-B1 ⛔ latence (13 s) > délai (8 s) : l\'opération se termine au délai — verrou levé, écran de fin ouvert, séance gardée à renvoyer', e1.recap && e1.fin === false && e1.n === 1 && await synced(pg) === false, js({ recap: e1.recap, fin: e1.fin, n: e1.n }));
      await dormir(7000);                                                                // le serveur répond maintenant (trop tard : la requête est annulée)
      const e2 = await sm.etat(pg), v = net.vus.filter((x) => x.action === 'logSession')[0] || {};
      t('B-SCCM-U-B2 ⭐ la réponse tardive n\'a AUCUN effet : pas de seconde séance, toujours `synced:false`, un seul écran de fin, aucune requête rejouée toute seule, la connexion avait bien été coupée', e2.n === 1 && await synced(pg) === false && e2.recap && v.coupe === true && v.fini === false && net.nb('logSession') === 1, js({ n: e2.n, v, nb: net.nb('logSession') }));
    } finally { sansErreur('B', sc); await fin(sc, net); }
  });

  /* ── U-C · échec DURABLE : la connexion est coupée à chaque essai ── */
  await garde('C', async () => {
    const { sc, net } = await pret();
    try {
      const { pg } = sc;
      await allerA(pg, 'log'); await sm.seance(pg, 'Exercice Fictif Zéta');
      t('B-SCCM-U-C0 le contrôle : la mise à jour est reçue PENDANT la séance et attend', await recevoir(sc, 1), '');
      net.mode = 'coupe';
      await pg.evaluate(() => { window.__fin = finishWorkout(); });
      await attendre(async () => (await sm.etat(pg)).recap, 20000, 200);
      const e1 = await sm.etat(pg), tx = await toasts(pg);
      t('B-SCCM-U-C1 ⛔ échec durable (connexion coupée) : l\'opération se termine tout de suite — verrou levé, écran de fin ouvert, séance enregistrée et gardée à renvoyer, issue DITE (« Séance sauvegardée »)', e1.recap && e1.fin === false && e1.n === 1 && e1.stock === 1 && await synced(pg) === false && tx.some((m) => /Séance sauvegardée/.test(m)), js({ recap: e1.recap, fin: e1.fin, toasts: tx }));
      await pg.evaluate(async () => { await _retrySheetQueue(); await _retrySheetQueue(); }); await dormir(800);
      t('B-SCCM-U-C2 ⭐ la relance reste CONTRÔLÉE : deux passes de la file = deux essais en plus (3 au total), jamais de boucle ; la séance reste `synced:false` et rien n\'est perdu', net.nb('logSession') === 3 && await synced(pg) === false && (await sm.etat(pg)).n === 1, js({ nb: net.nb('logSession') }));
      await pg.evaluate(() => { closeSessionEnd('home'); });
      /* C3 RÉÉCRIT le 17/11/2026 (lot M, D-170 : plus de rechargement automatique). AVANT : « le récapitulatif fermé, la mise à jour s'applique ». INVARIANT GARDÉ : l'échec ne laisse AUCUN verrou (la mise à jour n'est pas éteinte en silence)
         et la séance est intacte. CHANGÉ : « n'est pas éteinte » = elle se PROPOSE (bandeau) sans rechargement automatique, et le choix « Mettre à jour » l'applique. */
      await attendre(async () => voit(await lireBandeau(pg)), 10000, 200);
      const bnC3 = await lireBandeau(pg), taC3 = await sm.tientAuto(pg, 1500), okC3 = await sm.cliquerMaj(pg);
      const rech = okC3 && await rechargee(pg, 25000); await mvAide.poser(pg, 1);
      const ap = await sm.etat(pg);
      t('B-SCCM-U-C3 ⛔ l\'échec n\'a laissé AUCUN verrou : le récapitulatif fermé, la mise à jour est PROPOSÉE (bandeau ; pas de mise à jour éteinte en silence) sans rechargement automatique, le choix « Mettre à jour » l\'applique et la séance est intacte', voit(bnC3) && taC3.ok && okC3 && rech && ap.n === 1 && ap.stock === 1, js({ bandeau: voit(bnC3), vivant: taC3.ok, clic: okC3, rech, n: ap.n, stock: ap.stock }));
    } finally { sansErreur('C', sc); await fin(sc, net); }
  });

  /* ── U-D · le briefing de Milo : en-têtes reçus, corps figé ; PUIS une 2ᵉ séance se termine pendant ce temps (concurrence) ── */
  await garde('D', async () => {
    const { sc, net } = await pret();
    try {
      const { pg } = sc;
      await allerA(pg, 'log'); await sm.seance(pg, 'Exercice Fictif Zéta');
      t('B-SCCM-U-D0 le contrôle : la mise à jour est reçue PENDANT la séance et attend', await recevoir(sc, 1), '');
      await pg.evaluate(() => { window.__fin = finishWorkout(); });
      await attendre(async () => (await sm.etat(pg)).recap, 20000, 200);
      await pg.clock.install({ time: Date.now() });                                       // une horloge qui AVANCE : on la fait sauter plus bas
      net.mode = 'corps-fige';
      await pg.evaluate((u) => { window._aiUrl = () => u; window.__sidA = _dbfCle(S.sessions[0]); analyserSeanceMilo(window.__sidA); }, net.url);
      await attendre(async () => net.enTetes >= 1, 15000, 100); await dormir(300);
      const e1 = await sm.etat(pg), tx1 = await sm.slotTexte(pg), a1 = await sm.tient(pg, 500);
      t('B-SCCM-U-D1 ⛔ le briefing : les EN-TÊTES sont arrivés, le CORPS est figé — l\'analyse est en vol (« Milo analyse… »), la mise à jour attend', e1.vol === true && e1.vive === true && /Milo analyse/.test(tx1) && a1.ok, js({ vol: e1.vol, vive: e1.vive, texte: tx1.slice(-60), attaque: a1.a }));
      await pg.evaluate(() => { closeSessionEnd('home'); }); await dormir(900);
      await decaler(pg, 130000);                                                         // 130 s « passent » : l'analyse, elle, est TOUJOURS en vol (la sonde U06)
      const a2 = await sm.tient(pg, 600), e2 = await sm.etat(pg), d2 = await pg.evaluate(() => ({ vive: _dbfAnalyseVive(), peut: _majPeutSAppliquer(), enVol: _dbfEnVol(_dbfCle(S.sessions[0])) }));
      const bn2 = await lireBandeau(pg);
      t('B-SCCM-U-D2 ⛔⛔ 130 s plus tard, l\'analyse est TOUJOURS vive (elle n\'est pas déclarée « morte » par l\'horloge) : la décision reste « non », aucun bandeau, aucun rechargement (il aurait annulé la requête et perdu le briefing)', e2.ecran === 'home' && d2.vive === true && d2.peut === false && d2.enVol === true && a2.ok && !voit(bn2), js({ d2, ecran: e2.ecran, attaque: a2.a }));
      // CONCURRENCE : une seconde séance se termine pendant que la 1ʳᵉ analyse est en vol
      await sm.seance(pg, 'Autre Mouvement Fictif'); net.mode = 'ok';
      await pg.evaluate(() => { window.__fin2 = finishWorkout(); });
      await attendre(async () => (await sm.etat(pg)).recap, 20000, 200);
      await pg.evaluate(() => { closeSessionEnd('home'); }); await dormir(900);
      const a3 = await sm.tient(pg, 600), e3 = await sm.etat(pg), bn3 = await lireBandeau(pg);
      t('B-SCCM-U-D3 ⭐ concurrence : la 2ᵉ séance se termine (verrou de fin levé, récapitulatif fermé, sur l\'Accueil) alors que la 1ʳᵉ analyse court encore : la mise à jour ATTEND toujours (c\'est l\'analyse qui la retient), aucun bandeau, les 2 séances sont enregistrées',
        e3.n === 2 && e3.stock === 2 && e3.fin === false && !e3.recap && e3.vive === true && a3.ok && !voit(bn3), js({ n: e3.n, fin: e3.fin, vive: e3.vive, attaque: a3.a }));
      await rendre(pg);
      await pg.evaluate(() => { analyserSeanceMilo(window.__sidA); });   // un nouveau clic sur la séance déjà en vol ne relance rien
      const nCoach = net.nb('coach');
      await pg.clock.fastForward(95000);                                                  // le délai du briefing (90 s) passe : l'opération se TERMINE
      await attendre(async () => !(await sm.etat(pg)).vive, 15000, 200);
      const e4 = await sm.etat(pg), v = net.vus.filter((x) => x.action === 'coach')[0] || {};
      const dbfOuvert = await pg.evaluate(() => document.getElementById('ov-debrief-milo').classList.contains('open')), bnPre = await lireBandeau(pg);   // le clic sur la séance en vol a OUVERT la fenêtre du briefing (sa consultation retient la mise à jour)
      await pg.evaluate(() => { fermerDebriefMilo(); });                                  // fermeture EXPLICITE du briefing
      await attendre(async () => voit(await lireBandeau(pg)), 12000, 200);
      const bn4 = await lireBandeau(pg), vivante = await sm.vivant(pg);
      const diag = await pg.evaluate(() => ({ pend: !!window._swReloadPending, ver: window._majVersion, ferme: window._majFerme, peut: _majPeutSAppliquer(), seance: _seanceOuverte(), fin: _finishing, vive: _dbfAnalyseVive(), ecran: window._curScreen, ovs: [...document.querySelectorAll('.overlay.open')].map((o) => o.id), maj: document.getElementById('root').className }));
      t('B-SCCM-U-D4 ⛔⛔ le DÉLAI (90 s, lecture du corps comprise) TERMINE l\'analyse : plus en vol, la requête est RÉELLEMENT annulée côté serveur, l\'échec est DIT (« Milo n\'a pas pu analyser… ta séance est bien enregistrée » + « Réessayer »)',
        e4.vol === false && e4.vive === false && v.coupe === true && v.fini === false && e4.n === 2, js({ vol: e4.vol, vive: e4.vive, serveur: v }));
      t('B-SCCM-U-D5 ⭐ l\'opération finie, sur l\'Accueil : tant que la fenêtre du briefing est OUVERTE (consultation) aucun bandeau ; sa fermeture explicite fait paraître la proposition (bandeau discret, version nommée, sans rechargement automatique ni fenêtre bloquante) ; aucune analyse n\'a été relancée toute seule', dbfOuvert && !voit(bnPre) && voit(bn4) && new RegExp(cle(1)).test((bn4.txt || {}).txt || '') && vivante && net.nb('coach') === nCoach && net.nb('coach') === 1, js({ bandeau: voit(bn4), txt: bn4 && bn4.txt && bn4.txt.txt, vivante, coach: net.nb('coach'), diag }));
      const ok = await pg.click('#maj-restart', { timeout: 4000 }).then(() => true, () => false);
      const rech = ok && await rechargee(pg, 25000); await mvAide.poser(pg, 1);
      const ap = await sm.etat(pg);
      t('B-SCCM-U-D6 « Mettre à jour » (la personne décide) : la page redémarre, les 2 séances sont intactes (mémoire et stockage)', ok && rech && ap.n === 2 && ap.stock === 2, js({ ok, rech, n: ap.n, stock: ap.stock }));
    } finally { sansErreur('D', sc); await fin(sc, net); }
  });
}

module.exports = { pur, ecran, maj, reseau };   // `reseau` : le serveur local FICTIF qui fige le corps de la réponse — réutilisé par B-SCCX (tests/parcours/seance_ce_x.js)
