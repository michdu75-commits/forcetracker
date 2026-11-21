/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🔒 SCMAJ — AUCUNE MISE À JOUR PENDANT LA SÉANCE, SON ENREGISTREMENT, LE BRIEFING DE MILO (D-170, GO LIMITÉ du 16/11/2026)
   Blocs : B-SCMAJ-P (source : le verrou, les chemins de rechargement) · B-SCMAJ-A (séance → sauvegarde → récapitulatif → fermeture) ·
           B-SCMAJ-B (génération du briefing : lente, puis rapide ; le récapitulatif fermé PENDANT l'attente) · B-SCMAJ-D (génération en erreur :
           l'issue est dite) · B-SCMAJ-E (génération sans réponse : le délai d'attente et le délai de sécurité) · B-SCMAJ-G (récapitulatif quitté vers Milo pendant l'écriture : la proposition paraît à la fin) · B-SCMAJ-F (les verrous se lèvent,
           même sur une exception) · B-SCMAJ-C (bilans de semaine / de mois ouverts sur l'Accueil ; briefing consulté depuis Progrès).

   LA DÉCISION (Michel, D-170) : aucun redémarrage de mise à jour PENDANT une séance, son enregistrement, la GÉNÉRATION du briefing de fin, ni sa
   CONSULTATION. Ordre : terminer → enregistrer → générer / montrer le briefing → la personne le lit et le FERME → alors seulement la mise à jour
   se PROPOSE (bandeau, jamais bloquant ; l'Accueil l'applique comme avant, décision de ft-v1184). Un échec de génération = une issue dite (message +
   « Réessayer », la séance est enregistrée), jamais de blocage définitif : chaque verrou se lève à la FIN de son opération (réponse, échec, exception, délai d'attente qui la TERMINE).
   ⛔ CE LOT M (16/11/2026) : plus de « dernier filet au bout de 120 s » — un verrou levé par le seul écoulement du temps laissait la page se recharger par-dessus une opération ENCORE active (P1, P2, P3, P8,
   A2b, E4, E5 réécrits, avant / après expliqués à chaque témoin ; le banc de l'attente réseau bornée : `seance_ce_m.js`).

   CONDUIT : le VRAI service worker, le VRAI code, des publications SIMULÉES (serveur de `maj_version.js`, ses outils sont réutilisés, R2) ; les appels
   « Milo » et « logSession » sont interceptés et RETENUS par le banc (une porte qu'il ouvre quand il veut : réponse lente, rapide, en erreur, jamais).
   Les chemins de rechargement sont attaqués pour de vrai : `persist()`, `goScreen('home')`, `_reloadForUpdate()`, l'évènement `controllerchange`, le
   message `SW_UPDATED` du service worker, « Mettre à jour ». Un rechargement se lit à une chose : le MARQUEUR de la page disparaît.
   OBSERVE : le marqueur, `S.wkt` / `S.sessions` / le stockage local, les verrous, le bandeau tel qu'on le VOIT, les textes visibles de l'écran de fin.
   NE COUVRE PAS : Safari iOS (Chromium n'est pas un iPhone : gel d'une page en arrière-plan, mémoire, politique de cache de WebKit), la vraie latence
   d'un Worker, un vrai déploiement. ⛔ 0 appel réel. Données ENTIÈREMENT FICTIVES (dates relatives : `today()`).
   Banc : tools/banc_seance_maj.js · contrôle négatif : tools/mut_seance_maj.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const { ouvrir, poser, publier, recue, calme, allerA, lireBandeau, voit, marquer, rechargee, dormir, attendre, cle } = require('./maj_version.js').aide;

const js = (x) => JSON.stringify(x).slice(0, 300);
const REPONSE = { reply: 'Séance fictive régulière. Une piste pour la prochaine : ajoute une série au premier exercice.', complete: true };

/* ── la porte des appels réseau : le banc RETIENT « logSession » (la sauvegarde) et « coach » (le briefing) tant qu'il ne les libère pas ── */
async function brancher(sc) {
  const g = { vus: [], sync: null, coach: null, mode: 'ok', libererSync: null, libererCoach: null };
  await sc.ctx.route(/workers\.dev|script\.google\.com|anthropic\.com|supabase\.co/, async (rt) => {
    const rq = rt.request(); let c = {}; try { c = JSON.parse(rq.postData() || '{}'); } catch (e) {}
    if (c.action === 'logSession') {
      g.vus.push('sync'); if (g.sync) await g.sync;
      return rt.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }).catch(() => {});
    }
    if (c.action === 'coach') {
      g.vus.push('coach'); if (g.coach) await g.coach;
      if (g.mode === 'erreur') return rt.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"panne fictive"}' }).catch(() => {});
      return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(REPONSE) }).catch(() => {});
    }
    return rt.fallback().catch(() => {});
  });
  g.retenirSync = () => { g.sync = new Promise((r) => { g.libererSync = r; }); };
  g.retenirCoach = () => { g.coach = new Promise((r) => { g.libererCoach = r; }); };
  return g;
}

/* ── les bilans qui s'ouvrent tout seuls (le lundi ; tout décembre) sont déjà « annoncés » : le piège de calendrier de B-MAJV-B ── */
const annoncerBilans = (pg) => pg.evaluate(() => {
  const t = today(), pm = new Date(Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 2, 15));
  S.lastWeekSummary = t; S.lastMonthSummary = pm.getUTCFullYear() + '-' + String(pm.getUTCMonth() + 1).padStart(2, '0'); persist();
});
/* une séance EN COURS, 100 % fictive (un exercice inventé, absent du catalogue ; un exercice perso en option) */
const seance = (pg, nom, perso) => pg.evaluate(([nom, perso]) => {
  if (perso) { S.customExercises = (S.customExercises || []).filter((e) => e && e.n !== nom).concat([{ n: nom, g: 'Dos', custom: true }]); }   /* le schéma de la production : `{n, g, custom}` */
  S.wkt = { date: today(), exs: [{ name: nom, sets: [{ kg: 60, reps: 8, type: 'N', done: true }, { kg: 60, reps: 8, type: 'N', done: true }] }], startTs: Date.now() - 1800000, startHour: 10 };
  persist();
}, [nom, !!perso]);
/* ce qu'une attaque de la mise à jour fait, par TOUS les chemins qui peuvent recharger (la page rechargée fait échouer `evaluate` : c'est le signal) */
const assaut = (pg) => pg.evaluate(() => {
  const r = {};
  try { persist(); } catch (e) { r.persist = String(e); }
  try { _reloadForUpdate(); } catch (e) { r.rfu = String(e); }
  try { navigator.serviceWorker.dispatchEvent(new Event('controllerchange')); } catch (e) {}
  try { navigator.serviceWorker.dispatchEvent(new MessageEvent('message', { data: { type: 'SW_UPDATED' } })); } catch (e) {}
  r.redemarrer = (typeof majRedemarrer === 'function') ? majRedemarrer() : 'ABSENTE';
  return r;
}).catch(() => ({ rechargee: true }));
const vivant = (pg) => pg.evaluate(() => window.__marqueur === 'avant').catch(() => false);
/* « la mise à jour n'est PAS tombée » = on attaque, on laisse le temps de tomber, la page est TOUJOURS la même */
async function tient(pg, ms) { const a = await assaut(pg); await dormir(ms || 1300); return { ok: !a.rechargee && a.redemarrer === false && await vivant(pg), a }; }
/* lot M (D-170, 17/11/2026) — la MÊME attaque SANS le choix de la personne : tous les chemins qui rechargeaient tout seuls (persist, `_reloadForUpdate`, `controllerchange`, `SW_UPDATED`) mais PAS « Mettre à jour ».
   Sur l'Accueil, rien en cours, c'est ce qui rechargeait avant : ici la page doit RESTER. Le clic explicite est `cliquerMaj`. */
const assautAuto = (pg) => pg.evaluate(() => {
  const r = {};
  try { persist(); } catch (e) { r.persist = String(e); }
  try { _reloadForUpdate(); } catch (e) { r.rfu = String(e); }
  try { navigator.serviceWorker.dispatchEvent(new Event('controllerchange')); } catch (e) {}
  try { navigator.serviceWorker.dispatchEvent(new MessageEvent('message', { data: { type: 'SW_UPDATED' } })); } catch (e) {}
  return r;
}).catch(() => ({ rechargee: true }));
async function tientAuto(pg, ms) { const a = await assautAuto(pg); await dormir(ms || 1300); return { ok: !a.rechargee && await vivant(pg), a }; }
const cliquerMaj = (pg) => pg.click('#maj-restart', { timeout: 4000 }).then(() => true, () => false);
const etat = (pg) => pg.evaluate(() => {
  const ov = document.getElementById('ov-session-end'), sid = (S.sessions[0] && typeof _dbfCle === 'function') ? _dbfCle(S.sessions[0]) : '';
  return { fin: typeof _finishing === 'undefined' ? null : _finishing, wkt: S.wkt, n: S.sessions.length, nom: (S.sessions[0] && S.sessions[0].exs && S.sessions[0].exs[0] && S.sessions[0].exs[0].name) || null,
    stock: (() => { try { return JSON.parse(localStorage.getItem('ft4_sessions') || '[]').length; } catch (e) { return -1; } })(),
    recap: !!(ov && ov.classList.contains('open')), ecran: window._curScreen, enAttente: !!window._swReloadPending, version: window._majVersion || null,
    vol: sid ? _dbfEnVol(sid) : null, vive: typeof _dbfAnalyseVive === 'function' ? _dbfAnalyseVive() : null, debrief: sid ? !!_dbfTexteDe(sid) : null, sid };
});
/* la séance EN COURS est « vidée » : absente, ou la séance VIERGE que `renderLog()` recrée dès qu'on affiche l'écran Séance (sans exercice) */
const vide = (w) => w === null || (!!w && (!w.exs || w.exs.length === 0));
const slotTexte = (pg) => pg.evaluate(() => { const e = document.getElementById('se-debrief'); return e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''; });
/* un bouton « là » : présent, affiché, non désactivé, de taille réelle (il peut se trouver sous la ligne de flottaison d'une fenêtre qui défile : on ne compare pas à l'écran) */
const visibleSel = (pg, sel) => pg.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return false; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0 && !e.disabled; }, sel);

/* ═════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.pur = function (t, ROOT, fs, path) {
  console.log('\n═══ B-SCMAJ-P (source). LE VERROU ET LES CHEMINS DE RECHARGEMENT ═══');
  const lire = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const app = lire('app.js'), coach = lire('coach.js'), log = lire('log.js');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? src.length : j); };

  const pp = corps(app, '_majPeutSAppliquer'), ap = corps(app, '_appliquerMaj'), rfu = corps(app, '_reloadForUpdate');
  /* ⭐ P1, P2, P3 RÉÉCRITS le 16/11/2026 (CE lot M, D-170 — contre-expertise U02 / U06 / U07).
     AVANT : P1 « le verrou a une durée (≤ 120 s) et une fonction qui le lit » · P2 « un verrou plus vieux que sa durée est PÉRIMÉ » (calcul d'âge exécuté) · P3 « le délai d'attente du briefing est plus COURT que la durée du verrou ».
     Ces trois témoins APPROUVAIENT l'expiration : un verrou se levait au bout de 120 s par le seul écoulement du temps, donc la mise à jour rechargeait PAR-DESSUS une opération encore active (fin de séance dont la
     réponse du serveur n'arrivait pas, analyse encore en vol) — contraire à la décision (« aucun rechargement tant que la séance, son enregistrement, la génération ou la consultation du briefing sont actifs »).
     L'INVARIANT GARDÉ — « un verrou qui ne se lève pas éteindrait toutes les mises à jour » — est tenu AUTREMENT : un verrou se lève à la FIN de son opération, et chaque opération SE TERMINE (attente réseau bornée de
     bout en bout, `_fetchBorne`). CE QUI ROUGIT maintenant : toute durée de vie de verrou, tout âge lu dans la décision. Banc de l'outil lui-même (réel, horloge qui avance) : `seance_ce_m.js`. */
  t('SCMAJ-P1 ⛔⛔ AUCUN verrou de mise à jour n\'expire au bout d\'un délai : ni constante de durée, ni fonction d\'âge, et la décision « peut-on appliquer ? » ne lit pas l\'heure (un verrou ne se lève QUE quand son opération se termine)',
    !/_MAJ_VERROU|_majVerrouVif/.test(app + coach + log) && !/Date\.now|new Date|performance\.now/.test(pp), 'durée ou âge encore lus : ' + js([/_MAJ_VERROU|_majVerrouVif/.test(app + coach + log), /Date\.now/.test(pp)]));
  /* le comportement, EXÉCUTÉ tel qu'écrit : `_majPeutSAppliquer` (app.js) et le verrou du briefing (coach.js) — dix minutes plus tard, un verrou posé retient TOUJOURS ; il se lève quand l'opération FINIT */
  /* lot M (D-170, 17/11/2026) : la décision ne prend plus de paramètre d'écran (`ecranLibre` supprimé) — l'extraction suit la signature, rien d'autre ne change dans ce témoin */
  const mp = /function _majPeutSAppliquer\(\)\{[\s\S]*?\n\}\n(?:\/\*[\s\S]*?\*\/\n)?function _appliquerMaj/.exec(app), mv = /const _dbfActifs\s*=\s*new Set\(\);\nfunction _dbfAnalyseVive\(\)\{[^\n]*\}\nfunction _dbfVolPoser\(id\)\{[^\n]*\}/.exec(coach);
  let api = null;
  try {
    if (mp && mv) api = new Function('window', 'document', 'S', 'let _finishing=false; let _evRunning=false; function _seanceOuverte(){return false;} function _dbfVolLire(){return {};} function _dbfVolEcrire(){} const _DBF_PAGE="p";\n'
      + mv[0] + '\n' + mp[0].replace(/\nfunction _appliquerMaj$/, '') + '\n; return {peut:_majPeutSAppliquer, poser:_dbfVolPoser, vive:_dbfAnalyseVive, actifs:_dbfActifs, fin:(x)=>{ _finishing=x; }};')({ _swReloadPending: true, _curScreen: 'home' }, { getElementById: () => null }, { wkt: null });
  } catch (e) { api = null; }
  if (api) {
    const r = {}; r.libre = api.peut(true);
    api.fin(true); r.fin = api.peut(true); r.finLevee = (api.fin(false), api.peut(true));
    api.poser('s1'); r.vive = api.vive(); r.analyse = api.peut(true); api.actifs.delete('s1'); r.viveFin = api.vive(); r.apresFin = api.peut(true);
    t('SCMAJ-P2 ⛔⛔ EXÉCUTÉ : un verrou de fin de séance et une analyse « en vol » retiennent la mise à jour TANT QUE leur opération dure (aucune horloge n\'est consultée : dix minutes ou une heure plus tard, rien ne change), et la rendent dès que l\'opération se TERMINE ; sans verrou la décision n\'est pas figée sur « non »',
      r.libre === true && r.fin === false && r.finLevee === true && r.vive === true && r.analyse === false && r.viveFin === false && r.apresFin === true, js(r));
  } else t('SCMAJ-P2 la décision et le verrou du briefing s\'exécutent tels qu\'écrits (app.js, coach.js)', false, 'non exécutables');
  const dc = /const _DBF_DELAI_MS\s*=\s*(\d+)/.exec(coach), suivi = lire('tracking.js');
  t('SCMAJ-P3 ⛔ chaque opération qu\'un verrou protège SE TERMINE : l\'attente réseau de la fin de séance (`syncSheets`) et celle du briefing (`_runSeDebrief`) passent par la MÊME fonction bornée de bout en bout (`_fetchBorne`, corps de la réponse compris), avec un délai fini ; plus d\'attente de corps hors délai',
    !!dc && +dc[1] > 0 && +dc[1] <= 180000 && /_fetchBorne\(S\.url,[\s\S]{0,600}?,8000,/.test(suivi) && /_fetchBorne\(_aiUrl\('coach'\)[\s\S]{0,600}?_DBF_DELAI_MS/.test(log)
    && !/await resp\.(text|json)\(\)/.test(corps(suivi, 'syncSheets')) && !/await resp\.json\(\)/.test(corps(log, '_runSeDebrief')), 'délai briefing ' + (dc && dc[1]));

  /* UN SEUL entonnoir : tout rechargement de mise à jour passe par `_appliquerMaj`, qui passe par `_majPeutSAppliquer` */
  /* lot M (D-170, 17/11/2026) : P4 gardé tel quel (le SEUL rechargement est dans `_appliquerMaj`, derrière la décision) ; seule la signature suit (`demande` → plus de paramètre). Le nouveau « appelé par UN SEUL chemin, le choix explicite » est P6. */
  t('SCMAJ-P4 ⛔ le SEUL rechargement de la mise à jour est dans `_appliquerMaj`, derrière la décision `_majPeutSAppliquer`', /_majPeutSAppliquer\(\)/.test(ap) && /location\.reload\(\)/.test(ap) && !/location\.reload/.test(pp) && !/location\.reload/.test(rfu));
  const rl = [];
  fs.readdirSync(ROOT).filter((f) => /\.js$/.test(f)).forEach((f) => { const n = (lire(f).match(/location\.reload\s*\(/g) || []).length; if (n) rl.push(f + ':' + n); });
  const reset = corps(app, 'resetOnboardingTest'), setLang = /window\.setLang\s*=\s*function\(l\)\{[\s\S]{0,200}location\.reload/.test(lire('translations.js'));
  t('SCMAJ-P5 ⛔ la LISTE des rechargements de l\'application est CONNUE et ne s\'allonge pas en silence : `_appliquerMaj` (mise à jour) · le clone de test (garde `__FT_CLONE__`) · le changement de langue demandé par la personne — rien d\'autre',
    js(rl.sort()) === js(['app.js:2', 'translations.js:1']) && /__FT_CLONE__/.test(reset) && /location\.reload/.test(reset) && setLang, 'trouvés : ' + js(rl));
  /* ⭐ P6 RÉÉCRIT le 17/11/2026 (lot M, D-170 : plus AUCUN rechargement automatique, même sur l'Accueil). AVANT : « les déclencheurs (controllerchange, SW_UPDATED, persist(), retour à l'Accueil) rappellent TOUS `_appliquerMaj()` »
     — il approuvait précisément le rechargement automatique que Michel a supprimé. L'INVARIANT GARDÉ : un seul entonnoir, aucun déclencheur ne recharge de son côté et tous lisent la MÊME décision. CE QUI CHANGE : `_appliquerMaj` n'a plus qu'UN appelant,
     le choix explicite (`majRedemarrer`, bouton « Mettre à jour ») ; les déclencheurs ne font que MONTRER (`_majRefresh` / `_majLireVersion`). Ce qui rougit : un déclencheur qui rappelle `_appliquerMaj` (retour du rechargement automatique). */
  const appelantsAppliquer = []; ['app.js', 'state.js', 'screens.js', 'log.js', 'setup.js', 'coach.js', 'tracking.js'].forEach((f) => { const c = lire(f); let k = -1; while ((k = c.indexOf('_appliquerMaj(', k + 1)) >= 0) appelantsAppliquer.push(f + ':' + (c.slice(0, k).match(/\n/g) || []).length); });
  const rm = corps(app, 'majRedemarrer');
  t('SCMAJ-P6 ⛔⛔ AUCUN rechargement automatique : `controllerchange` / `SW_UPDATED` ne rappellent que `_reloadForUpdate`, qui MONTRE (bandeau, toast) sans recharger ; `persist()` et le retour à l\'Accueil ne rappellent PAS `_appliquerMaj` ; son SEUL appelant est le choix explicite `majRedemarrer`',
    /addEventListener\('controllerchange',_reloadForUpdate\)/.test(app) && /SW_UPDATED'\)_reloadForUpdate\(\)/.test(app) && !/_appliquerMaj\(/.test(rfu) && /_majLireVersion\(\)/.test(rfu)
    && !/_appliquerMaj\(/.test(lire('state.js').replace(/\/\/[^\n]*/g, '')) && !/_appliquerMaj\(/.test(lire('screens.js').replace(/\/\/[^\n]*/g, '')) && /_appliquerMaj\(\)/.test(rm) && !/location\.reload/.test(lire('state.js')) && !/location\.reload/.test(lire('screens.js')),
    'appelants : ' + js(appelantsAppliquer));
  const attendu = ['_seanceOuverte', '_finishing', 'ov-session-end', '_dbfAnalyseVive', 'ov-debrief-milo', 'ov-week-summary', 'ov-month-summary', '_evRunning'];
  const manque = attendu.filter((k) => pp.indexOf(k) < 0);
  t('SCMAJ-P7 ⛔ la décision « peut-on appliquer ? » lit TOUTES les raisons d\'attendre : séance · fin de séance · récapitulatif · génération du briefing · briefing consulté · bilans de semaine / de mois · banc payant', manque.length === 0, 'absentes : ' + js(manque));
  /* ⭐ RÉÉCRIT (CE lot M, D-170) : AVANT, P8 exigeait que « le délai de sécurité est LU dans la décision » (`_finishing && !_majVerrouVif(_finishing)) _finishing=false` : le balayage par l'ÂGE) et que le verrou porte `Date.now()` — il approuvait
     la levée du verrou par l'écoulement du temps. L'INVARIANT GARDÉ : la fin de séance lève son verrou sur TOUTE sortie (try / finally) — c'est ce qui garantit qu'il ne reste jamais posé. RETIRÉ : le balayage par le temps ; la décision LIT le verrou,
     elle ne l'écrit plus, et il ne porte plus d'heure. */
  t('SCMAJ-P8 ⛔ le verrou de fin de séance se lève sur TOUTE sortie (try / finally), n\'est JAMAIS levé par la décision au bout d\'un délai (elle le lit, sans l\'écrire) et ne porte plus d\'heure',
    !/_finishing\s*=[^=]/.test(pp) && /_finishing\) return false/.test(pp) && /_finishing=true;\s*\n(?:[^\n]*\n)*?\s*try\{/.test(log) && !/_finishing=Date\.now\(\)/.test(log) && /\}finally\{ _finishing=false; \}/.test(log));
};

/* ═════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-SCMAJ (écran conduit). AUCUNE MISE À JOUR PENDANT LA SÉANCE, SON ENREGISTREMENT, LE BRIEFING ═══');
  const SEUL = (process.env.SCMAJ_SEUL || '').split(',').filter(Boolean);
  const garde = async (nom, f) => { if (SEUL.length && SEUL.indexOf(nom) < 0) return; try { await f(); } catch (e) { t('SCMAJ-' + nom + ' ⛔ le scénario s\'est exécuté jusqu\'au bout', false, String(e && e.stack || e).slice(0, 500)); } };
  const sansErreurJs = (nom, sc) => t('SCMAJ-X-' + nom + ' 0 erreur JS de page pendant tout le parcours', sc.erreurs.length === 0, js(sc.erreurs));
  /* une page prête : posée sur la release 0, bilans annoncés, appels réseau retenus par le banc */
  const pret = async () => { const sc = await ouvrir(b); const g = await brancher(sc); await annoncerBilans(sc.pg); return { sc, g }; };
  /* une mise à jour REÇUE (publiée, installée) et qui ATTEND : la page ne s'est pas rechargée */
  const recevoir = async (sc, i) => { await marquer(sc.pg); await publier(sc); const r = await recue(sc); await calme(sc, i); return r && await vivant(sc.pg); };

  /* ── B-SCMAJ-A · séance → SAUVEGARDE → récapitulatif → fermeture. Le trou de ft-v1184 (la fenêtre où `S.wkt` est vide et le récap pas encore ouvert) rejoué avec une VRAIE réponse lente ── */
  await garde('A', async () => {
    const { sc, g } = await pret();
    try {
      const { pg } = sc;
      await allerA(pg, 'log'); await seance(pg, 'Exercice Fictif Zéta');
      t('SCMAJ-A0 le contrôle : la mise à jour est reçue PENDANT la séance et attend (la page n\'est pas rechargée)', await recevoir(sc, 1), '');
      const s1 = await tient(pg);
      t('SCMAJ-A1 ⛔⛔ PENDANT la séance : persist(), l\'évènement `controllerchange`, le message `SW_UPDATED`, `_reloadForUpdate()` et « Mettre à jour » ne rechargent RIEN', s1.ok, js(s1.a));
      /* la SAUVEGARDE : `finishWorkout` enregistre en local PUIS attend le serveur ; le banc retient cette réponse */
      g.retenirSync();
      await pg.evaluate(() => { window.__fin = finishWorkout(); });
      await attendre(async () => g.vus.indexOf('sync') >= 0, 15000, 100);
      const sv = await etat(pg), sa = await tient(pg, 1500), bnS = await lireBandeau(pg);
      t('SCMAJ-A2 ⛔⛔ PENDANT LA SAUVEGARDE (la séance est déjà enregistrée sur le téléphone, le serveur n\'a pas répondu, l\'écran de fin n\'est PAS encore ouvert) : AUCUN rechargement',
        sv.fin && !sv.recap && vide(sv.wkt) && sa.ok, js({ verrou: !!sv.fin, recap: sv.recap, wkt: sv.wkt, attaque: sa.a }));
      /* RÉÉCRIT (CE lot M, D-170). AVANT : « le verrou porte l'HEURE de sa pose (un nombre récent) : sans elle il ne pourrait pas se périmer » — il approuvait la péremption par le temps. L'INVARIANT GARDÉ : le verrou est POSÉ pendant tout
         l'enregistrement (vrai, tant que la fin de séance n'a pas fini) ; il ne se périme plus (voir SCMAJ-P1/P2 et B-SCCM-U), il se lève à la FIN de `finishWorkout` (A5 : levé quand le récapitulatif s'ouvre). */
      t('SCMAJ-A2b ⛔ le verrou de fin de séance est POSÉ (vrai) pendant tout l\'enregistrement et ne porte plus d\'heure : il ne se périme pas, il se lève à la fin de l\'opération', sv.fin === true, js({ fin: sv.fin }));
      t('SCMAJ-A3 ⛔ zéro perte : à ce même instant la séance est dans la mémoire ET dans le stockage local, avec son exercice', sv.n === 1 && sv.stock === 1 && sv.nom === 'Exercice Fictif Zéta', js({ n: sv.n, stock: sv.stock, nom: sv.nom }));
      t('SCMAJ-A4 pendant la sauvegarde, AUCUN bandeau de mise à jour (la personne n\'a rien à décider tant que son enregistrement n\'est pas fini)', !voit(bnS));
      g.libererSync();
      await attendre(async () => (await etat(pg)).recap, 15000, 150);
      const rc = await etat(pg), bnR = await lireBandeau(pg);
      t('SCMAJ-A5 le récapitulatif s\'ouvre, le verrou de fin de séance est LEVÉ (il ne reste que le récapitulatif ouvert), la mise à jour attend toujours',
        rc.recap && !rc.fin && rc.enAttente && await vivant(pg), js({ recap: rc.recap, verrou: rc.fin, enAttente: rc.enAttente }));
      const sr = await tient(pg);
      await pg.evaluate(() => { _seSetMood(2); }); await dormir(900);
      t('SCMAJ-A6 ⛔⛔ PENDANT LA CONSULTATION du récapitulatif (et en notant son ressenti, qui enregistre) : AUCUN rechargement, AUCUN bandeau', sr.ok && await vivant(pg) && !voit(bnR), js(sr.a));
      await pg.evaluate(() => { closeSessionEnd('home'); });
      /* ⭐ A7 RÉÉCRIT le 17/11/2026 (lot M, D-170 : plus de rechargement automatique, même sur l'Accueil). AVANT : « le récapitulatif fermé, sur l'Accueil, rien en cours : la mise à jour s'applique (comme avant) » — ce rechargement
         automatique est SUPPRIMÉ par décision de Michel. L'INVARIANT GARDÉ : la séance enregistrée traverse intacte la mise à jour. CE QUI CHANGE : la mise à jour se PROPOSE (bandeau) et ne part que par le choix « Mettre à jour » (A7b) ;
         elle ne part JAMAIS toute seule (A7 : tous les chemins qui rechargeaient avant sont rejoués, la page reste). Ce qui rougirait : le retour du rechargement automatique. */
      await attendre(async () => voit(await lireBandeau(pg)), 10000, 200);
      const bnA7 = await lireBandeau(pg), ta7 = await tientAuto(pg, 2500), ap0 = await etat(pg);
      t('SCMAJ-A7 ⛔⛔ le récapitulatif FERMÉ, sur l\'Accueil et rien en cours : AUCUN rechargement automatique (persist, `controllerchange`, `SW_UPDATED`, `_reloadForUpdate` rejoués) — la mise à jour est PROPOSÉE (bandeau, version nommée) et la séance est INTACTE',
        voit(bnA7) && new RegExp(cle(1)).test((bnA7.txt || {}).txt || '') && ta7.ok && ap0.ecran === 'home' && ap0.n === 1 && ap0.stock === 1 && ap0.nom === 'Exercice Fictif Zéta', js({ bandeau: voit(bnA7), ecran: ap0.ecran, vivant: ta7.ok, n: ap0.n }));
      const okA7 = await cliquerMaj(pg), rech = okA7 && await rechargee(pg, 25000); await poser(pg, 1);
      const ap = await etat(pg), ver = await pg.evaluate(() => [...document.querySelectorAll('.app-ver')].map((e) => (e.textContent || '').trim()).filter(Boolean));
      t('SCMAJ-A7b le choix « Mettre à jour » (la personne décide) : la page redémarre UNE fois et la séance est INTACTE après le redémarrage (mémoire et stockage)',
        okA7 && rech && ap.n === 1 && ap.stock === 1 && ap.nom === 'Exercice Fictif Zéta' && vide(ap.wkt), js({ clic: okA7, rechargee: rech, n: ap.n, stock: ap.stock, nom: ap.nom }));
      t('SCMAJ-A8 la version affichée après le redémarrage est la VÉRITABLE version installée (le code neuf), et rien n\'annonce plus de mise à jour', ver.length > 0 && ver.every((v) => v === cle(1)) && !ap.enAttente, js(ver));
    } finally { sansErreurJs('A', sc); await sc.fermer(); }
  });

  /* ── B-SCMAJ-B · la GÉNÉRATION du briefing : lente (la personne ferme le récapitulatif en attendant), puis rapide ── */
  await garde('B', async () => {
    const { sc, g } = await pret();
    try {
      const { pg } = sc;
      await allerA(pg, 'log'); await seance(pg, 'Mouvement Inventé Bêta', true);
      t('SCMAJ-B0 le contrôle : la mise à jour est reçue pendant la séance et attend', await recevoir(sc, 1), '');
      await pg.evaluate(() => { window.__fin = finishWorkout(); });
      await attendre(async () => (await etat(pg)).recap, 15000, 150);
      g.retenirCoach();                                                       // réponse LENTE : le banc ne la libère qu'après avoir tout essayé
      await pg.evaluate(() => { analyserSeanceMilo(_dbfCle(S.sessions[0])); });
      await attendre(async () => g.vus.indexOf('coach') >= 0, 10000, 100);
      const e1 = await etat(pg), tx = await slotTexte(pg), s1 = await tient(pg);
      t('SCMAJ-B1 ⛔ la génération est EN COURS (une analyse « en vol », le texte d\'attente est à l\'écran) et la mise à jour ATTEND', e1.vol === true && e1.vive === true && /Milo analyse/.test(tx) && s1.ok, js({ vol: e1.vol, vive: e1.vive, texte: tx.slice(-60), attaque: s1.a }));
      /* la personne N'ATTEND PAS : elle ferme le récapitulatif pendant que Milo écrit → l'Accueil s'affiche, c'est exactement le moment où l'ancienne règle rechargeait */
      await pg.evaluate(() => { closeSessionEnd('home'); }); await dormir(1800);
      const e2 = await etat(pg), a2 = await tient(pg, 1800);
      t('SCMAJ-B2 ⛔⛔ le récapitulatif est FERMÉ, la personne est sur l\'Accueil, Milo écrit encore : AUCUN rechargement (il aurait annulé la requête et perdu le briefing)',
        !e2.recap && e2.ecran === 'home' && e2.vive === true && a2.ok, js({ recap: e2.recap, ecran: e2.ecran, vive: e2.vive, attaque: a2.a }));
      g.libererCoach();                                                       // … la réponse arrive
      await attendre(async () => (await etat(pg)).debrief === true, 15000, 150);
      const e3 = await etat(pg);
      t('SCMAJ-B3 la réponse arrive : le briefing est RANGÉ avec sa séance, le verrou de génération est LEVÉ (plus d\'analyse en vol)', e3.debrief === true && e3.vol === false && e3.vive === false, js({ debrief: e3.debrief, vol: e3.vol, vive: e3.vive }));
      await pg.evaluate(() => { persist(); });                               // le prochain enregistrement : la mise à jour peut enfin se proposer
      /* ⭐ B4 RÉÉCRIT le 17/11/2026 (lot M, D-170 : plus de rechargement automatique). AVANT : « la génération finie, l'Accueil libre : la mise à jour s'applique ». INVARIANT GARDÉ : le briefing et la séance traversent la mise à jour INTACTS.
         CHANGÉ : la mise à jour se PROPOSE (B4) et ne part que par le choix « Mettre à jour » (B4b). */
      await attendre(async () => voit(await lireBandeau(pg)), 12000, 200);
      const bn4 = await lireBandeau(pg), ta4 = await tientAuto(pg, 1500), e4a = await etat(pg);
      t('SCMAJ-B4 la génération finie, l\'Accueil libre : AUCUN rechargement automatique, la mise à jour est PROPOSÉE (bandeau), le briefing et la séance sont là', voit(bn4) && ta4.ok && e4a.n === 1 && e4a.debrief === true && e4a.vol === false, js({ bandeau: voit(bn4), vivant: ta4.ok, n: e4a.n, debrief: e4a.debrief }));
      const ok4 = await cliquerMaj(pg), rech = ok4 && await rechargee(pg, 25000); await poser(pg, 1);
      const e4 = await etat(pg);
      t('SCMAJ-B4b le choix « Mettre à jour » : la page redémarre — et le briefing comme la séance sont INTACTS après le redémarrage', ok4 && rech && e4.n === 1 && e4.debrief === true && e4.vol === false, js({ clic: ok4, rechargee: rech, n: e4.n, debrief: e4.debrief }));
      /* variante RAPIDE : la réponse arrive tout de suite, le récapitulatif est resté ouvert */
      await calme(sc, 1);                                                      // deux publications à la seconde près sont un autre sujet (voir `calme`, maj_version.js) : la 1ʳᵉ finit d'activer
      g.coach = null; g.libererCoach = null;
      await marquer(pg); await allerA(pg, 'log'); await seance(pg, 'Mouvement Inventé Bêta', true);
      t('SCMAJ-B5 le contrôle (2ᵉ publication) : la mise à jour est reçue pendant la séance et attend', await recevoir(sc, 2), '');
      await pg.evaluate(() => { window.__fin = finishWorkout(); });
      await attendre(async () => (await etat(pg)).recap, 15000, 150);
      await pg.evaluate(() => { analyserSeanceMilo(_dbfCle(S.sessions[0])); });
      await attendre(async () => (await etat(pg)).debrief === true, 15000, 150);
      const e5 = await etat(pg), tx5 = await slotTexte(pg), s5 = await tient(pg);
      t('SCMAJ-B6 ⛔ réponse RAPIDE, récapitulatif toujours ouvert (la personne LIT le briefing) : le texte de Milo est à l\'écran et AUCUN rechargement ne tombe', e5.recap && e5.debrief === true && /Séance fictive régulière/.test(tx5) && s5.ok, js({ recap: e5.recap, texte: tx5.slice(-70), attaque: s5.a }));
      await pg.evaluate(() => { closeSessionEnd('home'); });
      /* B7 RÉÉCRIT (lot M, D-170) : AVANT « elle FERME le briefing : alors seulement la mise à jour s'applique ». INVARIANT GARDÉ : pas avant la fermeture ; CHANGÉ : la fermeture la PROPOSE, c'est le clic qui l'applique. */
      await attendre(async () => voit(await lireBandeau(pg)), 12000, 200);
      const bn7 = await lireBandeau(pg), ta7 = await tientAuto(pg, 1500);
      const ok7 = await cliquerMaj(pg), rech2 = ok7 && await rechargee(pg, 25000); await poser(pg, 2);
      t('SCMAJ-B7 elle FERME le briefing : alors seulement la mise à jour se PROPOSE (rien ne se recharge tout seul) ; le choix « Mettre à jour » l\'applique', voit(bn7) && ta7.ok && ok7 && rech2, js({ bandeau: voit(bn7), vivant: ta7.ok, clic: ok7, rechargee: rech2 }));
    } finally { g.libererCoach && g.libererCoach(); sansErreurJs('B', sc); await sc.fermer(); }
  });

  /* ── B-SCMAJ-D · la génération ÉCHOUE : une issue dite, la séance enregistrée, rien de bloqué ; PUIS la proposition ── */
  await garde('D', async () => {
    const { sc, g } = await pret();
    try {
      const { pg } = sc;
      await allerA(pg, 'log'); await seance(pg, 'Exercice Fictif Zéta');
      t('SCMAJ-D0 le contrôle : la mise à jour est reçue pendant la séance et attend', await recevoir(sc, 1), '');
      await pg.evaluate(() => { window.__fin = finishWorkout(); });
      await attendre(async () => (await etat(pg)).recap, 15000, 150);
      g.mode = 'erreur';
      await pg.evaluate(() => { analyserSeanceMilo(_dbfCle(S.sessions[0])); });
      await attendre(async () => /n'a pas pu analyser/.test(await slotTexte(pg)), 15000, 150);
      const tx = await slotTexte(pg), e = await etat(pg), bnE = await lireBandeau(pg), s = await tient(pg);
      t('SCMAJ-D1 ⛔ l\'échec est DIT : un message clair qui rassure sur la séance (« bien enregistrée »), et un bouton « Réessayer »',
        /Milo n'a pas pu analyser ta séance/.test(tx) && /bien enregistrée/.test(tx) && !/Rien n'est enregistré/.test(tx) && await visibleSel(pg, '#se-debrief .se-dbf-retry'), tx.slice(-120));
      t('SCMAJ-D2 ⛔ aucun blocage définitif : plus d\'analyse « en vol », aucun verrou posé, la séance est enregistrée ; le récapitulatif se ferme (« Terminer », « Continuer avec Milo ») ; le récapitulatif ouvert retient encore la mise à jour',
        e.vol === false && e.vive === false && !e.fin && e.n === 1 && e.stock === 1 && await visibleSel(pg, '#ov-session-end .se-fin') && await visibleSel(pg, '#ov-session-end .btn-bg2') && s.ok && !voit(bnE),
        js({ vol: e.vol, vive: e.vive, verrou: e.fin, n: e.n, stock: e.stock, attaque: s.a }));
      /* la personne ferme VERS MILO (pas l'Accueil) : c'est maintenant que la mise à jour se PROPOSE — bandeau, non bloquant */
      await pg.evaluate(() => { closeSessionEnd('coach'); });
      await attendre(async () => voit(await lireBandeau(pg)), 8000, 200);
      const bn = await lireBandeau(pg), e2 = await etat(pg);
      t('SCMAJ-D3 ⛔⛔ le récapitulatif FERMÉ : la mise à jour est PROPOSÉE (bandeau visible, version nommée, « Plus tard » visible) — et NE s\'applique PAS toute seule hors de l\'Accueil',
        voit(bn) && new RegExp(cle(1)).test((bn.txt || {}).txt || '') && bn.plus && bn.plus.vis && bn.go && bn.go.vis && await vivant(pg), js({ bandeau: voit(bn), txt: bn && bn.txt && bn.txt.txt, ecran: e2.ecran }));
      const ok = await pg.click('#maj-restart', { timeout: 4000 }).then(() => true, () => false);
      const rech = ok && await rechargee(pg, 25000); await poser(pg, 1);
      const ap = await etat(pg);
      t('SCMAJ-D4 « Mettre à jour » (la personne décide) : la page redémarre et la séance est INTACTE (mémoire et stockage)', ok && rech && ap.n === 1 && ap.stock === 1 && ap.nom === 'Exercice Fictif Zéta', js({ ok, rech, n: ap.n, stock: ap.stock }));
    } finally { sansErreurJs('D', sc); await sc.fermer(); }
  });

  /* ── B-SCMAJ-G · la personne quitte le récapitulatif VERS MILO pendant que le briefing s'écrit : aucun bandeau pendant l'attente, la proposition PARAÎT d'elle-même quand il est écrit ── */
  await garde('G', async () => {
    const { sc, g } = await pret();
    try {
      const { pg } = sc;
      await allerA(pg, 'log'); await seance(pg, 'Mouvement Inventé Gamma');
      t('SCMAJ-G0 le contrôle : la mise à jour est reçue pendant la séance et attend', await recevoir(sc, 1), '');
      await pg.evaluate(() => { window.__fin = finishWorkout(); });
      await attendre(async () => (await etat(pg)).recap, 15000, 150);
      g.retenirCoach();
      await pg.evaluate(() => { analyserSeanceMilo(_dbfCle(S.sessions[0])); });
      await attendre(async () => g.vus.indexOf('coach') >= 0, 10000, 100);
      await pg.evaluate(() => { closeSessionEnd('coach'); }); await dormir(1500);
      const bn1 = await lireBandeau(pg), e1 = await etat(pg), a1 = await assaut(pg);
      t('SCMAJ-G1 ⛔ le récapitulatif est fermé vers Milo, mais le briefing S\'ÉCRIT encore : AUCUN bandeau (on ne propose pas pendant la génération), rien ne se recharge',
        e1.ecran === 'coach' && e1.vive === true && !voit(bn1) && !a1.rechargee && a1.redemarrer === false && await vivant(pg), js({ ecran: e1.ecran, vive: e1.vive, bandeau: voit(bn1), attaque: a1 }));
      g.libererCoach();
      await attendre(async () => voit(await lireBandeau(pg)), 12000, 200);
      const bn2 = await lireBandeau(pg), e2 = await etat(pg);
      t('SCMAJ-G2 ⛔ le briefing écrit, le verrou se lève et la mise à jour se PROPOSE d\'elle-même (bandeau, version nommée) — sans rechargement automatique hors de l\'Accueil',
        e2.debrief === true && e2.vive === false && voit(bn2) && new RegExp(cle(1)).test((bn2.txt || {}).txt || '') && await vivant(pg), js({ debrief: e2.debrief, vive: e2.vive, bandeau: voit(bn2), txt: bn2 && bn2.txt && bn2.txt.txt }));
    } finally { g.libererCoach && g.libererCoach(); sansErreurJs('G', sc); await sc.fermer(); }
  });

  /* ── B-SCMAJ-E · la génération ne répond JAMAIS : le délai d'attente DIT l'échec ; le délai de sécurité lève tout verrou périmé ── */
  await garde('E', async () => {
    const { sc, g } = await pret();
    try {
      const { pg } = sc;
      await allerA(pg, 'log'); await seance(pg, 'Exercice Fictif Zéta');
      t('SCMAJ-E0 le contrôle : la mise à jour est reçue pendant la séance et attend', await recevoir(sc, 1), '');
      await pg.evaluate(() => { window.__fin = finishWorkout(); });
      await attendre(async () => (await etat(pg)).recap, 15000, 150);
      g.retenirCoach();                                                       // jamais libérée (avant la fin du banc) : une requête suspendue
      await pg.clock.install({ time: Date.now() });                           // une horloge qui AVANCE (elle ne gèle rien) : on la fait sauter plus loin plus bas
      await pg.evaluate(() => { analyserSeanceMilo(_dbfCle(S.sessions[0])); });
      await attendre(async () => g.vus.indexOf('coach') >= 0, 10000, 100);
      const e1 = await etat(pg);
      t('SCMAJ-E1 la requête est suspendue : l\'analyse est en vol, elle retient la mise à jour', e1.vol === true && e1.vive === true && (await assaut(pg)).redemarrer === false, js({ vol: e1.vol, vive: e1.vive }));
      await pg.clock.fastForward(60000); await dormir(400);
      const e2 = await etat(pg), tx2 = await slotTexte(pg);
      t('SCMAJ-E2 60 s plus tard (avant le délai d\'attente) : toujours en attente, pas d\'échec prématuré', e2.vol === true && !/n'a pas pu analyser/.test(tx2), tx2.slice(-80));
      await pg.clock.fastForward(40000);                                      // 100 s au total : le délai d'attente est passé
      await attendre(async () => /n'a pas pu analyser/.test(await slotTexte(pg)), 8000, 150);
      const e3 = await etat(pg), tx3 = await slotTexte(pg);
      t('SCMAJ-E3 ⛔ passé le délai d\'attente : l\'échec est DIT (message + « Réessayer »), l\'analyse n\'est plus « en vol », le verrou « briefing » est levé — sans que rien ne soit perdu',
        /n'a pas pu analyser/.test(tx3) && e3.vol === false && e3.vive === false && e3.n === 1 && await visibleSel(pg, '#se-debrief .se-dbf-retry'), js({ texte: tx3.slice(-80), vol: e3.vol, vive: e3.vive, n: e3.n }));
      /* ⭐ E4 / E5 RÉÉCRITS (CE lot M, D-170 — contre-expertise U02 / U06). AVANT : E4 « une analyse « en vol » PÉRIMÉE (plus vieille que le verrou, 130 s) ne retient plus la mise à jour » et E5 « un verrou de fin de séance
         PÉRIMÉ (130 s) se lève et la mise à jour redevient possible » — ils approuvaient la levée par le seul écoulement du temps (une opération ENCORE active déclarée « morte » : la page se rechargeait par-dessus).
         L'INVARIANT GARDÉ : un verrou se lève (jamais de blocage définitif) — mais à la FIN de son opération, jamais au bout d'un délai ; et celui d'une AUTRE page (rechargée) ne retient jamais. L'horloge de la page
         est DÉCALÉE de 130 s sans que l'opération finisse : la décision reste « non ». Ce qui rougirait : un balayage par l'âge, ou un verrou qui survit à la fin de son opération. */
      await pg.evaluate(() => { closeSessionEnd('coach'); });                 // le récapitulatif fermé : rien d'autre que le verrou ne peut retenir la décision
      const filet = await pg.evaluate(() => {
        const sid = _dbfCle(S.sessions[0]), r = {}, vraiNow = Date.now.bind(Date);
        _dbfVolPoser(sid); r.pose = _dbfAnalyseVive();
        Date.now = () => vraiNow() + 130000; r.apres130s = _dbfAnalyseVive(); r.decision130s = (window._swReloadPending = true, _majPeutSAppliquer());
        Date.now = () => vraiNow() + 3600000; r.apres1h = _dbfAnalyseVive();
        Date.now = vraiNow; _dbfActifs.delete(String(sid)); r.operationFinie = _dbfAnalyseVive();
        _dbfVolEcrire({ [sid]: { ts: Date.now() - 1000, page: 'autre-page' } }); r.autrePage = _dbfAnalyseVive();
        _dbfVolRetirer(sid); return r;
      });
      t('SCMAJ-E4 ⛔ une analyse « en vol » reste VIVE tant que son opération dure — 130 s, une heure plus tard (l\'horloge avance, l\'opération n\'a pas fini) — et la mise à jour attend ; elle ne l\'est plus quand l\'opération FINIT ; celle d\'une AUTRE page (rechargée) ne retient jamais',
        filet.pose === true && filet.apres130s === true && filet.decision130s === false && filet.apres1h === true && filet.operationFinie === false && filet.autrePage === false, js(filet));
      /* le verrou de fin de séance : l'horloge avance, l'opération non — il tient ; l'opération finit — il se lève */
      const fin = await pg.evaluate(() => {
        const r = {}, vraiNow = Date.now.bind(Date); window._swReloadPending = true;
        _finishing = true; Date.now = () => vraiNow() + 130000; r.tient130s = _majPeutSAppliquer(); r.apres = _finishing;
        Date.now = () => vraiNow() + 3600000; r.tient1h = _majPeutSAppliquer(); Date.now = vraiNow;
        _finishing = false; r.libre = _majPeutSAppliquer(); return r;
      });
      t('SCMAJ-E5 ⛔ un verrou de FIN DE SÉANCE n\'est jamais levé par le temps (130 s, une heure : la décision reste « non », le verrou reste posé) ; il se lève à la FIN de l\'opération et alors la mise à jour redevient possible (la décision n\'est pas figée sur « non »)',
        fin.tient130s === false && fin.apres === true && fin.tient1h === false && fin.libre === true, js(fin));
    } finally { g.libererCoach && g.libererCoach(); sansErreurJs('E', sc); await sc.fermer(); }
  });

  /* ── B-SCMAJ-F · une EXCEPTION pendant la fin de séance ne laisse pas le verrou posé : la séance est enregistrée, la suivante se termine ── */
  await garde('F', async () => {
    const { sc } = await pret();
    try {
      const { pg } = sc;
      await allerA(pg, 'log');
      const r = await pg.evaluate(async () => {
        const o = {}, vrai = window.checkBadges;
        const faire = (nom) => { S.wkt = { date: today(), exs: [{ name: nom, sets: [{ kg: 50, reps: 10, type: 'N', done: true }] }], startTs: Date.now() - 900000, startHour: 9 }; persist(); };
        window.checkBadges = function () { throw new Error('panne fictive après l\'enregistrement'); };
        faire('Exercice Fictif Zéta');
        try { await finishWorkout(); o.leve = false; } catch (e) { o.leve = true; }
        o.verrou1 = _finishing; o.n1 = S.sessions.length; o.stock1 = JSON.parse(localStorage.getItem('ft4_sessions') || '[]').length; o.wkt1 = S.wkt;
        window.checkBadges = vrai;
        const ov = document.getElementById('ov-session-end'); if (ov) ov.classList.remove('open');
        faire('Autre Mouvement Fictif');
        await finishWorkout();
        o.n2 = S.sessions.length; o.stock2 = JSON.parse(localStorage.getItem('ft4_sessions') || '[]').length; o.verrou2 = _finishing;
        return o;
      });
      t('SCMAJ-F1 ⛔ une exception APRÈS l\'enregistrement : la séance est enregistrée (mémoire + stockage), la séance en cours est close, et le verrou « fin de séance » n\'est PAS resté posé',
        r.leve === true && r.verrou1 === false && r.n1 === 1 && r.stock1 === 1 && vide(r.wkt1), js(r));
      t('SCMAJ-F2 ⛔ et la séance SUIVANTE se termine normalement (un verrou resté posé faisait ignorer « Terminer » en silence)', r.n2 === 2 && r.stock2 === 2 && r.verrou2 === false, js({ n2: r.n2, stock2: r.stock2, verrou: r.verrou2 }));
    } finally { sansErreurJs('F', sc); await sc.fermer(); }
  });

  /* ── B-SCMAJ-C · les bilans de semaine / de mois ouverts sur l'ACCUEIL ; le briefing consulté depuis PROGRÈS ── */
  await garde('C', async () => {
    const { sc } = await pret();
    try {
      const { pg } = sc;
      await pg.evaluate(() => {
        const d = today(); S.sessions = [{ id: 8101, ts: Date.now() - 3600000, date: d, label: 'Fictif', exs: [{ name: 'Exercice Fictif Zéta', sets: [{ kg: 40, reps: 10, done: true, type: 'N' }] }], volume: 400 }];
        _dbfEnregistrer(_dbfCle(S.sessions[0]), 'Briefing fictif rangé : séance régulière.', 'progres'); persist();
      });
      await allerA(pg, 'home');
      /* le bilan de SEMAINE s'ouvre tout seul sur l'Accueil (la classe `open`, comme `checkWeeklySummary`), PUIS la mise à jour arrive */
      await pg.evaluate(() => { document.getElementById('ov-week-summary').classList.add('open'); });
      await marquer(pg); await publier(sc);
      await attendre(async () => (await pg.evaluate(() => !!window._swReloadPending).catch(() => true)), 40000, 250);
      await calme(sc, 1); await dormir(800);
      const a1 = await tient(pg, 1800), e1 = await etat(pg);
      t('SCMAJ-C1 ⛔⛔ le bilan de la SEMAINE est ouvert sur l\'Accueil (« annoncé » : refermé, il ne reviendrait pas) : la mise à jour REÇUE attend, la page n\'est pas rechargée', e1.enAttente && a1.ok, js({ enAttente: e1.enAttente, attaque: a1.a }));
      await pg.evaluate(() => { document.getElementById('ov-week-summary').classList.remove('open'); openMonthReports(); });
      const a2 = await tient(pg, 1500), ov2 = await pg.evaluate(() => document.getElementById('ov-month-summary').classList.contains('open'));
      t('SCMAJ-C2 ⛔ le bilan du MOIS ouvert (rouvert à la main) retient aussi la mise à jour', ov2 && a2.ok, js({ ouvert: ov2, attaque: a2.a }));
      await pg.evaluate(() => { document.getElementById('ov-month-summary').classList.remove('open'); persist(); });
      /* C3 RÉÉCRIT (lot M, D-170) : AVANT « les bilans FERMÉS, sur l'Accueil : la mise à jour s'applique (au prochain enregistrement) ». INVARIANT GARDÉ : les bilans ouverts retiennent (C1, C2) et la mise à jour est possible une fois fermés ;
         CHANGÉ : « possible » = PROPOSÉE (bandeau) et appliquée par le choix « Mettre à jour », jamais toute seule. */
      await attendre(async () => voit(await lireBandeau(pg)), 10000, 200);
      const bnC3 = await lireBandeau(pg), taC3 = await tientAuto(pg, 1500);
      const okC3 = await cliquerMaj(pg), rech = okC3 && await rechargee(pg, 25000); await poser(pg, 1);
      t('SCMAJ-C3 les bilans FERMÉS, sur l\'Accueil et rien en cours : la mise à jour est PROPOSÉE (aucun rechargement automatique) et le choix « Mettre à jour » l\'applique', voit(bnC3) && taC3.ok && okC3 && rech, js({ bandeau: voit(bnC3), vivant: taC3.ok, clic: okC3, rechargee: rech }));
      /* le briefing CONSULTÉ depuis Progrès : la fenêtre « Débrief Milo » */
      await marquer(pg); await allerA(pg, 'progress');
      await publier(sc); await recue(sc); await calme(sc, 2);
      await pg.evaluate(() => { voirDebriefMilo(_dbfCle(S.sessions[0])); }); await dormir(600);
      const lec = await pg.evaluate(() => ({ ouvert: document.getElementById('ov-debrief-milo').classList.contains('open'), pend: !!window._swReloadPending, peut: _majPeutSAppliquer(), redem: majRedemarrer(), texte: (document.getElementById('dbf-milo-body') || {}).innerText || '' }));
      const bnC = await lireBandeau(pg), vC = await vivant(pg);
      t('SCMAJ-C4 ⛔⛔ le briefing est CONSULTÉ (fenêtre « Débrief Milo », depuis Progrès) : la mise à jour ne peut pas s\'appliquer, « Mettre à jour » REFUSE, aucun bandeau, rien ne se recharge',
        lec.pend === true && lec.ouvert && /Briefing fictif rangé/.test(lec.texte) && lec.peut === false && lec.redem === false && !voit(bnC) && vC, js({ ouvert: lec.ouvert, peut: lec.peut, redem: lec.redem, bandeau: voit(bnC), vivant: vC }));
      await pg.evaluate(() => { fermerDebriefMilo(); });
      await attendre(async () => voit(await lireBandeau(pg)), 8000, 200);
      const bn = await lireBandeau(pg);
      t('SCMAJ-C5 ⛔ le briefing FERMÉ : la mise à jour est PROPOSÉE (bandeau, version nommée), non bloquante, et ne s\'applique pas toute seule hors de l\'Accueil', voit(bn) && new RegExp(cle(2)).test((bn.txt || {}).txt || '') && await vivant(pg), js({ bandeau: voit(bn), txt: bn && bn.txt && bn.txt.txt }));
    } finally { sansErreurJs('C', sc); await sc.fermer(); }
  });
};

/* les outils de ce banc, réutilisés TELS QUELS par `seance_ce_m.js` (CE lot M, D-170 : attente réseau bornée — R2, pas de seconde copie) */
module.exports.aide = { brancher, annoncerBilans, seance, assaut, assautAuto, tientAuto, cliquerMaj, vivant, tient, etat, vide, slotTexte, visibleSel };
