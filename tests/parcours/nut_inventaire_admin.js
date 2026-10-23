/* ══════════════════════════════════════════════════════════════════════════════════════
   NUT-INVENTAIRE · A2 (22/10/2026, GO limité de Michel : PRÉPARÉ, NON PUBLIÉ) — LA CARTE ADMIN
   « 🍽️ Inventaire Nutrition » LIT LES DEUX ROUTES DE DIAGNOSTIC SANS RIEN EXPOSER.

   ⭐ LES INVARIANTS FIGÉS ICI (pas une implémentation) :
     · réservé à l'admin : sans déverrouillage, aucune requête ;
     · le jeton part dans le CORPS d'un POST, jamais dans l'adresse (consigne de Michel du 22/10) ;
     · on n'affiche qu'une liste blanche de NOMBRES : un champ inattendu renvoyé par le serveur
       (adresse, nom d'aliment) ne s'affiche jamais, et ce qui s'affiche est échappé ;
     · un jeton refusé est oublié (le mécanisme existant `_adminTokRefuse`), une panne réseau ne l'efface pas ;
     · le résultat n'est rangé nulle part sur l'appareil.
   ⛔ PAR LE VRAI CHEMIN : `_toggleAdminMode()` puis de vrais clics sur les boutons de la carte. Le
   serveur est SIMULÉ (`page.route`) et chaque requête est enregistrée ; données inventées, adresses
   `example.test`. L'oracle compare à des valeurs écrites à la main ci-dessous.
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const TOK = 'jeton-admin-test-0123456789';
const INV = { status: 'ok', genere: '2026-10-22T18:00:00.000Z', comptes: 12, avecFoodLog: 7, avecSavedFoods: 5,
  entreesTotal: 4321, entreesValides: 4300, joursCouverts: 210, borneMin: '2026-06-20', borneMax: '2026-10-22',
  entreesParAnnee: { 2026: 4300 }, histogrammeTailles: { '0': 5, '1-10': 1, '11-50': 2, '51-200': 1, '201-1000': 2, '1001-7999': 1, '8000+': 0 },
  anomalies: { sansDate: 3, sansId: 17, idsEnDouble: 0, foodLogVideAvecSavedFoods: 1, auPlafond8000: 0, datesAberrantes: 2, comptesJsonIllisible: 0 },
  /* ⛔ PIÈGES : la route ne rend PAS ces champs ; s'ils arrivaient un jour, la carte ne doit pas les montrer. */
  email: 'piege@example.test', foodLog: [{ name: 'Banane-PIEGE' }], name: 'Prenom-PIEGE' };
const AUD = { status: 'ok', dossierTrouve: true, nbFichiers: 118, fichiersLus: 80, fichiersNonLus: 38, arretParLeTemps: true,
  dernierDateISO: '2026-10-22T02:10:00.000Z', ageJours: 0, fichiersIllisibles: 1,
  fichiers: [{ nom: 'backup-PIEGE.json', dateISO: '2026-10-22T02:10:00.000Z', octets: 1, lisible: true, comptes: 1, avecFoodLog: 1, entrees: 1 }],
  comparaison: { comptesServeur: 12, comptesDansSauvegardes: 13, comptesSeulementDansSauvegardes: 1, comptesAvecLignesAbsentesDuServeur: 2,
    lignesDansSauvegardesAbsentesDuServeur: 9, lignesServeurAbsentesDesSauvegardes: 4 },
  email: 'piege@example.test' };
const PIEGES = ['piege@example.test', 'Banane-PIEGE', 'Prenom-PIEGE', 'backup-PIEGE'];

function source(t, ROOT, fs, path) {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const n = (html.match(/id="admin-nutinv"/g) || []).length;
  const grp = html.indexOf('🩺 Surveillance'), carte = html.indexOf('id="admin-nutinv"'), suivant = html.indexOf('<details class="adm-grp"', grp + 10);
  t('B-NIA-S ① la carte « Inventaire Nutrition » existe une fois, dans le groupe Admin « Surveillance »', n === 1 && grp > 0 && carte > grp && (suivant < 0 || carte < suivant), 'occurrences ' + n);
  const f = (app.match(/async function _nutInvAppel[\s\S]*?\n}\n/) || [''])[0];
  t('B-NIA-S ② l\'appel est un POST vers l\'adresse nue du serveur (aucun paramètre dans l\'URL)', /fetch\(S\.url,\{method:'POST'/.test(f) && !/S\.url\s*\+/.test(f) && !/token=/.test(f), f.slice(0, 120));
}

async function ecran(t, b, PORT) {
  const BASE = { ft4_ob2: '1', ft4_guide_shown: '1', ft4_wn_seen: '999' };
  async function ouvrir(stock, reponses) {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 900 } });
    const pg = await cx.newPage();
    const errs = [], req = [], prompts = [];
    pg.on('pageerror', (e) => errs.push(String(e && e.message || e).slice(0, 160)));
    await pg.route(/script\.google\.com\/macros\//, async (route) => {
      const r = route.request(); let corps = {};
      try { corps = JSON.parse(r.postData() || '{}'); } catch (e) {}
      const action = corps.action || (new URL(r.url()).searchParams.get('action')) || '';
      req.push({ m: r.method(), url: r.url(), corps, ct: (r.headers()['content-type'] || ''), action });
      const rep = reponses[action];
      if (rep === 'ABORT') return route.abort();
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(rep || { status: 'ok' }) });
    });
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_nia'))return; sessionStorage.setItem('_nia','1'); localStorage.clear();
      const D=${JSON.stringify(Object.assign({}, BASE, stock))}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2200);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); const ip = document.getElementById('install-popup'); if (ip) ip.classList.add('hidden'); });
    return { cx, pg, errs, req, prompts };
  }
  const reqNut = (X) => X.req.filter((r) => r.action === 'nutInventory' || r.action === 'nutBackupAudit');
  const lire = (X) => X.pg.evaluate(() => { const z = document.getElementById('admin-nutinv'); return { html: z ? z.innerHTML : '', txt: z ? z.innerText.replace(/[  ]/g, ' ').replace(/\n+/g, ' ') : '' }; });
  const instant = (X) => X.pg.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
  async function cliquer(X, action, promptRendu) {
    await X.pg.evaluate((v) => { window.prompt = (q) => { (window.__prompts = window.__prompts || []).push(q); return v; }; if (!window._adminMode) _toggleAdminMode(); }, promptRendu === undefined ? null : promptRendu);
    await X.pg.waitForTimeout(400);
    const sel = 'button[onclick="loadNutInventaireAdmin(\'' + action + '\')"]';
    let ok = true;
    try { await X.pg.locator(sel).scrollIntoViewIfNeeded({ timeout: 4000 }); await X.pg.click(sel, { timeout: 4000 }); } catch (e) { ok = false; }
    await X.pg.waitForTimeout(900);
    return ok;
  }
  const court = (s, n) => String(s || '').slice(0, n || 160);

  // ── ② non déverrouillé : aucune requête, aucun jeton demandé ──
  {
    const X = await ouvrir({}, { nutInventory: INV });
    const r = await X.pg.evaluate(async () => { window.prompt = () => { window.__p = 1; return 'x'; }; await loadNutInventaireAdmin('nutInventory'); const z = document.getElementById('admin-nutinv'); return { txt: z ? z.innerText : '', p: !!window.__p }; });
    t('B-NIA ② sans déverrouillage admin : « Réservé à l\'admin », aucune requête, aucun jeton demandé', /Réservé à l'admin/.test(r.txt) && reqNut(X).length === 0 && !r.p, court(r.txt) + ' req=' + reqNut(X).length);
    await X.cx.close();
  }
  // ── ③-⑦ + ⑫ comptage : POST, jeton dans le corps, nombres seulement, échappement, rien de rangé ──
  {
    const X = await ouvrir({ ft4_admin_ok: '1', ft4_admin_tok: TOK }, { nutInventory: INV });
    const avant = await instant(X);
    const clic = await cliquer(X, 'nutInventory');
    const v = await lire(X), apres = await instant(X), R = reqNut(X);
    const r0 = R[0] || { corps: {}, url: '', m: '', ct: '' };
    t('B-NIA ③ un vrai clic sur « Compter les journaux » envoie UNE requête POST, jeton dans le corps, adresse sans paramètre',
      clic && R.length === 1 && r0.m === 'POST' && r0.corps.action === 'nutInventory' && r0.corps.token === TOK && r0.url.indexOf('?') < 0 && /text\/plain/.test(r0.ct),
      'clic=' + clic + ' n=' + R.length + ' ' + r0.m + ' ' + court(r0.url, 60));
    t('B-NIA ④ les nombres s\'affichent (comptes, journaux, lignes, jours, période)',
      /12 comptes/.test(v.txt) && /7 avec un journal/.test(v.txt) && /4 321 lignes/.test(v.txt) && /4 300 utilisables/.test(v.txt) && /210 jours couverts/.test(v.txt) && /du 2026-06-20 au 2026-10-22/.test(v.txt), court(v.txt, 220));
    t('B-NIA ④b les anomalies non nulles sont nommées, les nulles ne le sont pas',
      /3 sans date lisible/.test(v.txt) && /17 sans identifiant/.test(v.txt) && /2 datées hors période/.test(v.txt) && /1 compte\(s\) sans journal mais avec des favoris/.test(v.txt) && !/identifiants en double/.test(v.txt) && !/illisible/.test(v.txt), court(v.txt.split('Anomalies')[1], 200));
    t('B-NIA ⑤ un champ inattendu du serveur (adresse, aliment, prénom) ne s\'affiche JAMAIS', PIEGES.every((p) => v.html.indexOf(p) < 0), PIEGES.filter((p) => v.html.indexOf(p) >= 0).join(','));
    t('B-NIA ⑥ le jeton n\'apparaît ni dans la page ni dans aucune adresse de requête',
      await X.pg.evaluate((k) => document.documentElement.outerHTML.indexOf(k) < 0, TOK) && X.req.every((r) => r.url.indexOf(TOK) < 0), '');
    const ajoutees = Object.keys(apres).filter((k) => apres[k] !== avant[k]);
    t('B-NIA ⑫ le résultat n\'est rangé nulle part sur l\'appareil (aucune clé écrite qui le contienne)',
      ajoutees.every((k) => !/avecFoodLog|entreesTotal|nbFichiers|4321/.test(apres[k] || '')), ajoutees.join(','));
    t('B-NIA ⑮ aucune erreur JavaScript', X.errs.length === 0, X.errs.join(' | '));
    await X.cx.close();
  }
  // ── ⑦ échappement : une date piégée ne crée aucun élément ──
  {
    const X = await ouvrir({ ft4_admin_ok: '1', ft4_admin_tok: TOK }, { nutInventory: Object.assign({}, INV, { borneMin: '<img src=x onerror="window.__xss=1">' }) });
    await cliquer(X, 'nutInventory');
    const r = await X.pg.evaluate(() => { const z = document.getElementById('admin-nutinv'); return { img: z ? z.querySelectorAll('img').length : -1, xss: !!window.__xss, html: z ? z.innerHTML : '' }; });
    t('B-NIA ⑦ ce qui vient du serveur est échappé : une valeur piégée ne crée aucun élément', r.img === 0 && !r.xss && /&lt;img/.test(r.html), 'img=' + r.img + ' xss=' + r.xss);
    await X.cx.close();
  }
  // ── ⑧ comparaison avec les sauvegardes ──
  {
    const X = await ouvrir({ ft4_admin_ok: '1', ft4_admin_tok: TOK }, { nutBackupAudit: AUD });
    const clic = await cliquer(X, 'nutBackupAudit');
    const v = await lire(X), R = reqNut(X), r0 = R[0] || { corps: {}, url: '' };
    t('B-NIA ⑧ « Comparer avec les sauvegardes » : un POST, jeton dans le corps, adresse sans paramètre',
      clic && R.length === 1 && r0.m === 'POST' && r0.corps.action === 'nutBackupAudit' && r0.corps.token === TOK && r0.url.indexOf('?') < 0, 'n=' + R.length);
    t('B-NIA ⑧b la couverture partielle est DITE, et les lignes ambiguës ne sont jamais présentées comme à restaurer',
      /118 fichiers/.test(v.txt) && /80 lus/.test(v.txt) && /38 non lus/.test(v.txt) && /couverture PARTIELLE/.test(v.txt) && /1 fichier\(s\) illisible/.test(v.txt)
      && /9 ligne\(s\) des sauvegardes absente\(s\) du serveur/.test(v.txt) && /jamais restaurées d'office/.test(v.txt), court(v.txt, 260));
    t('B-NIA ⑧c aucun nom de fichier ni adresse renvoyés par le serveur ne s\'affichent', PIEGES.every((p) => v.html.indexOf(p) < 0), '');
    await X.cx.close();
  }
  {
    const X = await ouvrir({ ft4_admin_ok: '1', ft4_admin_tok: TOK }, { nutBackupAudit: { status: 'ok', dossierTrouve: false } });
    await cliquer(X, 'nutBackupAudit'); const v = await lire(X);
    t('B-NIA ⑬ dossier de sauvegardes absent : la carte le dit', /Dossier des sauvegardes introuvable/.test(v.txt), court(v.txt));
    await X.cx.close();
  }
  // ── ⑨ jeton refusé : oublié ; ⑩ panne réseau : gardé ; ⑭ erreur serveur : code fixe ──
  {
    const X = await ouvrir({ ft4_admin_ok: '1', ft4_admin_tok: 'jeton-faux-0000' }, { nutInventory: { status: 'error', error: 'token' } });
    await cliquer(X, 'nutInventory'); const v = await lire(X);
    const reste = await X.pg.evaluate(() => localStorage.getItem('ft4_admin_tok'));
    t('B-NIA ⑨ jeton refusé : « Jeton refusé », et le jeton est oublié (redemandé au prochain essai)', /Jeton refusé/.test(v.txt) && !reste, court(v.txt) + ' tok=' + !!reste);
    await X.cx.close();
  }
  {
    const X = await ouvrir({ ft4_admin_ok: '1', ft4_admin_tok: TOK }, { nutInventory: 'ABORT' });
    await cliquer(X, 'nutInventory'); const v = await lire(X);
    const reste = await X.pg.evaluate(() => localStorage.getItem('ft4_admin_tok'));
    t('B-NIA ⑩ panne réseau : message clair, le jeton n\'est PAS effacé', /Pas de réponse exploitable/.test(v.txt) && /réseau/.test(v.txt) && reste === TOK, court(v.txt));
    await X.cx.close();
  }
  {
    const X = await ouvrir({ ft4_admin_ok: '1', ft4_admin_tok: TOK }, { nutInventory: { status: 'error', error: 'nut_inventory' } });
    await cliquer(X, 'nutInventory'); const v = await lire(X);
    t('B-NIA ⑭ erreur serveur : le code fixe est montré, et la carte dit que rien n\'a été modifié', /nut_inventory/.test(v.txt) && /Rien n'a été modifié/.test(v.txt), court(v.txt));
    await X.cx.close();
  }
  // ── ⑪ aucun jeton enregistré : demandé une fois par le mécanisme existant ; refusé de le donner → aucune requête ──
  {
    const X = await ouvrir({ ft4_admin_ok: '1' }, { nutInventory: INV });
    await cliquer(X, 'nutInventory', 'jeton-saisi-abcdef');
    const R = reqNut(X), garde = await X.pg.evaluate(() => localStorage.getItem('ft4_admin_tok'));
    t('B-NIA ⑪ jeton absent : demandé UNE fois (mécanisme existant), envoyé dans le corps, gardé sur l\'appareil',
      R.length === 1 && R[0].corps.token === 'jeton-saisi-abcdef' && R[0].url.indexOf('jeton-saisi') < 0 && garde === 'jeton-saisi-abcdef', 'n=' + R.length);
    await X.cx.close();
  }
  {
    const X = await ouvrir({ ft4_admin_ok: '1' }, { nutInventory: INV });
    await cliquer(X, 'nutInventory', null); const v = await lire(X);
    t('B-NIA ⑪b jeton non donné : « Jeton admin requis », aucune requête', /Jeton admin requis/.test(v.txt) && reqNut(X).length === 0, court(v.txt));
    await X.cx.close();
  }
}

module.exports = { source, ecran };
