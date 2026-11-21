/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🔔 SCFM — D-170, LOT M DE LA MISSION DE FERMETURE (Claude N°2, 17/11/2026) : AUCUN RECHARGEMENT AUTOMATIQUE DE MISE À JOUR, MÊME SUR L'ACCUEIL
   Blocs : B-SCFM-P (source : un seul appelant du rechargement, aucun minuteur de relance, aucun rechargement côté service worker / index.html) ·
           B-SCFM-F (écran conduit : une nouvelle version arrive PENDANT une opération · retour à l'Accueil sans opération · « Plus tard » ·
           « Mettre à jour » = UNE seule mise à jour · `APP_BUILD` et « À propos » disent la vraie version) · B-SCFM-H (D-176 : les accès au Menu).

   LA DÉCISION (Michel, mission de fermeture du 17/11/2026) : supprimer le rechargement AUTOMATIQUE même sur l'Accueil (ft-v1184). Une nouvelle version se PROPOSE (bandeau
   « Mettre à jour » / « Plus tard ») ; elle ne s'applique QUE par le choix explicite de la personne, quand toutes les opérations sont terminées en sécurité (séance, enregistrement,
   génération ou consultation du briefing, bilans). Pendant une opération, rien ne se recharge et la personne est prévenue par un toast (« après ta séance ou ton enregistrement »).
   « Plus tard » : aucune relance automatique (pas de minuteur) ; la proposition revient à un prochain lancement ou au retour à l'Accueil depuis un autre écran, sans recharger.
   CONSERVÉS : le verrou (`_majPeutSAppliquer`, `_finishing`, `_dbfActifs`…), le délai réseau et l'annulation effective (`_fetchBorne`), l'issue explicite.

   CONDUIT : le VRAI service worker, le VRAI code, des publications SIMULÉES (les outils de `maj_version.js` et de `seance_maj.js` sont réutilisés, R2). Un rechargement se lit à une chose : le
   MARQUEUR de la page disparaît (et le nombre de navigations de la page principale est compté pour « une seule mise à jour »).
   OBSERVE : le marqueur, les navigations, le bandeau tel qu'on le VOIT, les toasts, `APP_BUILD`, `.app-ver`, le badge « À propos », la séance en mémoire et dans le stockage local.
   NE COUVRE PAS : Safari iOS (Chromium n'est pas un iPhone : gel d'une page en arrière-plan, politique de cache de WebKit), un vrai déploiement, la reprise d'un lancement réel (le « prochain
   lancement » est simulé par un rechargement). ⛔ 0 appel réel (serveurs simulés). Données ENTIÈREMENT FICTIVES.
   Banc : tools/banc_seance_cf_m.js · contrôle négatif : tools/mut_seance_cf_m.py

   ❓ LOT A DE LA FINALE (17/11/2026, arbitrage de Michel — « l'aide contextuelle est importante et ne doit pas disparaître », D-176 inchangée) : blocs B-SCFM-AP (source) et B-SCFM-A (écran conduit, vrai Chromium mobile,
   serveur statique, 4 tailles d'écran, aucune donnée réelle). Un « ? » discret (`#ctx-help`, un bouton rond, pas une barre) sur Progrès, Nutrition, Coach, Profil, Séance (avant une séance) et Cycle, qui ouvre la
   MÊME aide qu'avant (`showHelp`) ; atteignable pendant une séance (sur l'écran Séance : ⋯ → « Aide de l'écran Séance », « Terminer » jamais gêné) ; l'en-tête global ne revient pas ; le « + » central ne bouge pas (mesuré).
   OBSERVE : le bouton tel qu'on le VOIT (visibilité calculée, rectangle, zone tactile, élément touché au centre, tout ce qu'il recouvrirait), l'aide qu'un vrai clic ouvre, l'en-tête global, la hauteur de l'écran, le « + », le
   défilement horizontal, la séance en mémoire. NE COUVRE PAS : un vrai iPhone (zone sûre, Safari), la lisibilité du dessin du « ? » à l'œil.
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const http = require('http'), fs0 = require('fs'), path0 = require('path');
const mv = require('./maj_version.js').aide;
const sm = require('./seance_maj.js').aide;
const { ouvrir, poser, publier, recue, calme, allerA, lireBandeau, voit, marquer, rechargee, dormir, attendre, cle } = mv;

const js = (x) => JSON.stringify(x).slice(0, 320);

/* ═════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.pur = function (t, ROOT, fs, path) {
  console.log('\n═══ B-SCFM-P (source). UN SEUL CHEMIN DE RECHARGEMENT, SANS MINUTEUR, SANS EFFET CÔTÉ SERVICE WORKER ═══');
  const lire = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? src.length : j); };
  const app = lire('app.js');

  /* P1 — la mise à jour n'a qu'UN appelant : le choix explicite (`majRedemarrer`, le bouton). Un autre appelant, c'est le retour du rechargement automatique. */
  const appelants = [];
  ['app.js', 'state.js', 'screens.js', 'log.js', 'setup.js', 'coach.js', 'tracking.js', 'dashboard.js', 'supabase.js', 'translations.js', 'constants.js'].forEach((f) => {
    let c; try { c = sansCommentaires(lire(f)); } catch (e) { return; }
    const d = c.indexOf('function majRedemarrer('), e = d < 0 ? -1 : c.indexOf('\nfunction ', d + 10);
    let k = -1; while ((k = c.indexOf('_appliquerMaj(', k + 1)) >= 0) { if (/function\s+$/.test(c.slice(Math.max(0, k - 12), k))) continue; appelants.push(f + ':' + ((f === 'app.js' && d >= 0 && k > d && k < e) ? 'majRedemarrer' : 'AILLEURS')); }
  });
  t('SCFM-P1 ⛔⛔ `_appliquerMaj` (le SEUL rechargement de la mise à jour) n\'a qu\'UN appelant, et c\'est le choix explicite `majRedemarrer` : ni l\'arrivée d\'une version, ni `persist()`, ni le retour à l\'Accueil ne l\'appellent',
    appelants.length === 1 && appelants[0] === 'app.js:majRedemarrer', 'appelants : ' + js(appelants));

  /* P2 — « ce que sw.js déclenche » : le service worker ne recharge aucune page (ni `navigate`, ni `reload`, ni message qui le demande) ; index.html n'écoute pas `controllerchange` ; l'écouteur est unique, dans app.js, et ne fait que dire */
  const sw = sansCommentaires(lire('sw.js')), ix = sansCommentaires(lire('index.html'));
  const ecouteurs = []; ['app.js', 'state.js', 'screens.js', 'log.js', 'setup.js', 'coach.js', 'tracking.js', 'dashboard.js', 'supabase.js'].forEach((f) => { try { const n = (sansCommentaires(lire(f)).match(/controllerchange/g) || []).length; if (n) ecouteurs.push(f + ':' + n); } catch (e) {} });
  t('SCFM-P2 ⛔ côté page, rien ne recharge à l\'arrivée d\'une version : le service worker n\'ouvre ni ne recharge aucune page (`navigate`, `reload`), `index.html` n\'écoute pas `controllerchange`, l\'écouteur est UNIQUE (app.js) et rappelle `_reloadForUpdate` qui ne contient aucun rechargement',
    !/\.navigate\(|location\.reload|SW_RELOAD|type:\s*'RELOAD/.test(sw) && !/controllerchange/.test(ix) && js(ecouteurs) === js(['app.js:1'])
    && /addEventListener\('controllerchange',_reloadForUpdate\)/.test(app) && !/location\.reload|_appliquerMaj\(/.test(sansCommentaires(corps(app, '_reloadForUpdate'))), 'écouteurs : ' + js(ecouteurs));

  /* P3 — « Plus tard » ne relance rien : aucune fonction de la chaîne de mise à jour ne programme de minuteur */
  const chaine = ['_majPeutSAppliquer', '_majRefresh', '_majLireVersion', 'majPlusTard', '_majRepropose', '_reloadForUpdate', 'majRedemarrer', '_appliquerMaj'];
  /* le corps d'UNE fonction : de sa déclaration à la première accolade fermante en colonne 0 (`corps` ci-dessus va jusqu'à la fonction suivante, et `_reloadForUpdate` est suivie du bloc d'enregistrement du service worker, qui a ses propres minuteurs) */
  const corpsFn = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\n}', i); return j < 0 ? src.slice(i) : src.slice(i, j + 2); };
  const avecMinuteur = chaine.filter((n) => /setTimeout|setInterval|requestAnimationFrame|requestIdleCallback/.test(sansCommentaires(corpsFn(app, n))));
  t('SCFM-P3 ⛔⛔ AUCUNE relance automatique : aucune fonction de la chaîne de mise à jour (décision, avis, « Plus tard », retour à l\'Accueil, arrivée d\'une version, bouton) ne programme de minuteur — ' + chaine.length + ' fonctions lues, toutes présentes',
    chaine.every((n) => corpsFn(app, n).length > 20) && avecMinuteur.length === 0, 'minuteurs dans : ' + js(avecMinuteur));

  /* P4 — la décision ne lit plus l'écran (la personne choisit le moment) mais lit TOUJOURS les opérations ; le libellé du choix est celui de la mission */
  const pp = sansCommentaires(corps(app, '_majPeutSAppliquer'));
  t('SCFM-P4 la décision « peut-on appliquer ? » ne prend aucun paramètre et ne lit pas l\'écran affiché (`_curScreen`) : seules les opérations en cours l\'arrêtent',
    /function _majPeutSAppliquer\(\)\{/.test(app) && !/_curScreen|ecranLibre/.test(pp) && /_finishing/.test(pp) && /_dbfAnalyseVive/.test(pp) && /_seanceOuverte/.test(pp), pp.slice(0, 120));
  const ban = /<div id="maj-banner"[\s\S]*?<\/div>/.exec(lire('index.html'));
  t('SCFM-P5 le bandeau propose « Mettre à jour » et « Plus tard » (plus de « Redémarrer maintenant »)', !!ban && />Mettre à jour<\/button>/.test(ban[0]) && />Plus tard<\/button>/.test(ban[0]) && !/Redémarrer/.test(ban[0]), ban && ban[0].slice(0, 200));
  /* P6 — « Plus tard » reste en mémoire : aucune clé de stockage, et le retour à l'Accueil depuis un AUTRE écran seulement lève le marqueur (jamais un rechargement) */
  const sc = sansCommentaires(lire('screens.js')), mp = sansCommentaires(corps(app, 'majPlusTard')), rp = sansCommentaires(corps(app, '_majRepropose'));
  t('SCFM-P6 « Plus tard » n\'écrit rien sur l\'appareil ; le retour à l\'Accueil depuis un AUTRE écran le lève (`_majRepropose` : marqueur remis à zéro + réévaluation, rien d\'autre)',
    !/localStorage|sessionStorage|indexedDB/.test(mp + rp) && /_majFerme=null/.test(rp) && /_majRefresh\(\)/.test(rp) && /if\(id==='home'&&_prevScreen!=='home'\)\{[^}]*_majRepropose/.test(sc), mp + rp);

  /* ══ B-SCFM-AP · lot A de la finale : le « ? » d'écran, vu par la SOURCE ══ */
  console.log('\n═══ B-SCFM-AP (source). LE « ? » D\'ÉCRAN : UNE SEULE CLEF D\'AIDE, DES TEXTES À JOUR, UNE ZONE TACTILE ═══');
  const clefs = sansCommentaires(sc);
  const fn = (nom) => { const i = clefs.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = clefs.indexOf('\n}', i); return j < 0 ? clefs.slice(i) : clefs.slice(i, j + 2); };
  /* AP1 — R2 : « quelle aide pour quel écran ? » est écrit UNE fois (`_aideClef`) ; ni le bouton ni `showHelp` ne refont leur propre règle du Cycle */
  t('SCFM-AP1 ⛔ R2 : la clef d\'aide d\'un écran (le Cycle montre l\'aide de l\'Accueil) n\'est écrite qu\'UNE fois (`_aideClef`) ; `showHelp` et `_syncAideEcran` l\'appellent, aucun ne la refait',
    /function _aideClef\(id\)\{ return id==='cycle'\?'home'/.test(clefs) && /_aideClef\(/.test(fn('showHelp')) && /_aideClef\(/.test(fn('_syncAideEcran')) && !/'cycle'/.test(fn('showHelp')) && !/'cycle'/.test(fn('_syncAideEcran')) && (clefs.match(/==='cycle'\?'home'/g) || []).length === 1,
    'showHelp : ' + fn('showHelp').slice(0, 120));
  /* AP2 — le bouton n'ouvre que l'aide EXISTANTE : il appelle `showHelp()` (aucune seconde fenêtre d'aide), ne stocke rien, et la décision lit `_HELP_DATA` (aucune liste d'écrans) */
  const sy = fn('_syncAideEcran');
  t('SCFM-AP2 le « ? » d\'écran appelle `showHelp()` (R13 : l\'aide existante, pas une deuxième), ne stocke rien (aucune clé), ne tient aucune liste d\'écrans (il lit `_HELP_DATA`), et n\'existe pas sur l\'Accueil',
    /setAttribute\('onclick','showHelp\(\)'\)/.test(sy) && !/localStorage|sessionStorage|indexedDB|persist\(/.test(sy) && /_HELP_DATA\[_aideClef\(id\)\]/.test(sy) && /id!=='home'/.test(sy) && !/\['(progress|nutrition|coach|setup)'/.test(sy), sy.slice(0, 160));
  /* AP3 — la ZONE TACTILE (44 × 44) est déclarée, et le bouton reste SOUS les fenêtres (z-index < 200) */
  const rg = lire('style.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const rb = /#ctx-help\{([^}]*)\}/.exec(rg);
  t('SCFM-AP3 la zone tactile du « ? » d\'écran est de 44 × 44 px et il reste SOUS les fenêtres (z-index inférieur à celui de `.overlay`)',
    !!rb && /width:44px/.test(rb[1]) && /height:44px/.test(rb[1]) && +((/z-index:(\d+)/.exec(rb[1]) || [0, 999])[1]) < +((/\.overlay\{[^}]*z-index:(\d+)/.exec(rg) || [0, 0])[1]), rb && rb[1].slice(0, 160));
  /* AP4 — les explications DIRECTEMENT concernées sont à jour : l'Accueil dit où est le « ? » de chaque écran (et que l'en-tête n'a plus le sien ailleurs), l'écran Séance dit ce que devient un palier à la suppression */
  const tx = (re) => (re.exec(sc) || [''])[0];
  const dep = tx(/\{i:'🧭',t:'[^\n]*\n/), pal = tx(/\{i:'🧹',t:'[^\n]*\n/);
  t('SCFM-AP4 règle d\'or #11 : l\'aide de l\'Accueil dit que chaque écran a gardé son « ? » (et où est l\'aide pendant une séance : ⋯ → « Aide de l\'écran Séance »), et l\'aide « Supprimer une série précise » dit qu\'un palier se supprime, avec confirmation, et que le DERNIER reste — plus « les paliers se règlent ensemble »',
    /aide de chaque écran a gardé sa porte/.test(dep) && /Pendant une séance<\/b>[^\n]*Aide de l\\'écran Séance/.test(dep) && !/ce « \? » \(l\\'aide de l\\'écran\) est ici/.test(dep)
    && /chaque <b>palier<\/b> se supprime/.test(pal) && /confirmation/.test(pal) && /dernier palier<\/b> reste/.test(pal) && !/se règlent ensemble/.test(pal), 'accueil : ' + dep.slice(0, 80) + ' | série : ' + pal.slice(0, 80));
};

/* ═════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.ecran = async function (t, b) {
  console.log('\n═══ B-SCFM (écran conduit). UNE VERSION ARRIVE : ELLE SE PROPOSE, ELLE NE SE RECHARGE JAMAIS TOUTE SEULE ═══');
  const SEUL = (process.env.SCFM_SEUL || '').split(',').filter(Boolean);
  const garde = async (nom, f) => { if (SEUL.length && SEUL.indexOf(nom) < 0) return; try { await f(); } catch (e) { t('SCFM-' + nom + ' ⛔ le scénario s\'est exécuté jusqu\'au bout', false, String(e && e.stack || e).slice(0, 500)); } };

  /* ── B-SCFM-F · le fil complet : séance → version reçue PENDANT → enregistrement → Accueil → « Plus tard » → relance ? non → retour à l'Accueil → « Mettre à jour » ── */
  await garde('F', async () => {
    const sc = await ouvrir(b); const g = await sm.brancher(sc); await sm.annoncerBilans(sc.pg);
    try {
      const { pg } = sc;
      const lireVersions = () => pg.evaluate(() => ({ build: typeof APP_BUILD === 'undefined' ? null : APP_BUILD, ver: [...document.querySelectorAll('.app-ver')].map((e) => (e.textContent || '').trim()).filter(Boolean) }));
      const v0 = await lireVersions(), bn0 = await lireBandeau(pg);
      t('SCFM-F0 le contrôle : avant toute publication, `APP_BUILD` (le code qui tourne) = la version affichée = celle du service worker installé, et aucun bandeau', v0.build === cle(0) && v0.ver.length > 0 && v0.ver.every((v) => v === cle(0)) && !voit(bn0), js({ v0, bandeau: voit(bn0) }));
      await pg.evaluate(() => { window.__toasts = []; const o = window.toast; window.toast = function (m) { window.__toasts.push(String(m)); return o.apply(this, arguments); }; });
      await allerA(pg, 'log'); await sm.seance(pg, 'Exercice Fictif Zéta'); await marquer(pg);

      /* 1 · une nouvelle version arrive PENDANT la séance */
      await publier(sc); const r1 = await recue(sc); await calme(sc, 1);
      const t1 = await sm.tientAuto(pg, 2500), bn1 = await lireBandeau(pg), toasts1 = await pg.evaluate(() => window.__toasts.slice()), e1 = await sm.etat(pg);
      t('SCFM-F1 ⛔⛔ une version arrive PENDANT la séance : AUCUN rechargement (persist, `controllerchange`, `SW_UPDATED`, `_reloadForUpdate` rejoués), aucun bandeau, la mise à jour attend, et le toast dit QUAND elle se proposera (« après ta séance ou ton enregistrement »)',
        r1 && t1.ok && !voit(bn1) && e1.enAttente && toasts1.some((m) => /Mise à jour disponible — elle te sera proposée après ta séance ou ton enregistrement/.test(m)), js({ recue: r1, vivant: t1.ok, bandeau: voit(bn1), enAttente: e1.enAttente, toasts: toasts1 }));

      /* 2 · la séance se termine : PENDANT l'enregistrement (réponse du serveur retenue), rien ne se recharge, même sur demande */
      g.retenirSync();
      await pg.evaluate(() => { window.__fin = finishWorkout(); });
      await attendre(async () => g.vus.indexOf('sync') >= 0, 15000, 100);
      const t2 = await sm.tientAuto(pg, 1500), bn2 = await lireBandeau(pg), dem2 = await pg.evaluate(() => (typeof majRedemarrer === 'function') ? majRedemarrer() : 'ABSENTE').catch(() => 'rechargée'), e2 = await sm.etat(pg);
      t('SCFM-F2 ⛔⛔ PENDANT l\'enregistrement de la séance (le serveur n\'a pas répondu) : aucun rechargement, aucun bandeau, et même « Mettre à jour » demandé REFUSE (le verrou est conservé) ; la séance est déjà dans la mémoire ET le stockage local',
        t2.ok && !voit(bn2) && dem2 === false && e2.fin === true && e2.n === 1 && e2.stock === 1 && await sm.vivant(pg), js({ vivant: t2.ok, bandeau: voit(bn2), demande: dem2, verrou: e2.fin, n: e2.n, stock: e2.stock }));
      g.libererSync();
      await attendre(async () => (await sm.etat(pg)).recap, 15000, 150);

      /* 3 · retour à l'Accueil sans opération : le bandeau se propose, AUCUN rechargement (avant ce lot : il rechargeait ici) */
      await pg.evaluate(() => { closeSessionEnd('home'); });
      await attendre(async () => voit(await lireBandeau(pg)), 10000, 200);
      const bn3 = await lireBandeau(pg), t3 = await sm.tientAuto(pg, 4000), e3 = await sm.etat(pg);
      t('SCFM-F3 ⭐⭐ de retour sur l\'ACCUEIL, rien en cours : le bandeau est là (version nommée, « Mettre à jour » et « Plus tard »), et AUCUN rechargement — 4 s plus tard, après avoir rejoué tous les chemins qui rechargeaient — la séance est intacte',
        voit(bn3) && new RegExp(cle(1)).test((bn3.txt || {}).txt || '') && !!bn3.go && /mettre à jour/i.test(bn3.go.txt) && !!bn3.plus && /plus tard/i.test(bn3.plus.txt) && t3.ok && e3.ecran === 'home' && e3.n === 1 && e3.stock === 1 && e3.nom === 'Exercice Fictif Zéta',
        js({ bandeau: voit(bn3), txt: bn3 && bn3.txt && bn3.txt.txt, vivant: t3.ok, ecran: e3.ecran, n: e3.n }));

      /* 4 · « Plus tard » : rien — et l'horloge avance de 15 minutes sans qu'une relance, un rechargement ou un nouveau toast n'apparaisse */
      const nToast = await pg.evaluate(() => window.__toasts.length);
      /* ⚠️ l'horloge simulée est installée AVANT le clic : un minuteur programmé par « Plus tard » naîtrait sur l'horloge simulée et se déclencherait au saut de 15 minutes. Installée APRÈS, il naîtrait sur l'horloge réelle
         et ce témoin ne le verrait jamais (mesuré : la mutation « Plus tard programme une relance de 60 s » restait verte). */
      await pg.clock.install({ time: Date.now() });
      const clic4 = await pg.click('#maj-later', { timeout: 4000 }).then(() => true, () => false); await dormir(500);
      const bn4 = await lireBandeau(pg);
      await pg.clock.fastForward(15 * 60 * 1000); await dormir(600);
      const bn4b = await lireBandeau(pg), nToast4 = await pg.evaluate(() => window.__toasts.length), ferme = await pg.evaluate(() => window._majFerme), t4 = await sm.tientAuto(pg, 800);
      t('SCFM-F4 ⛔⛔ « Plus tard » : le bandeau disparaît, rien ne se recharge, et APRÈS 15 minutes d\'horloge avancée AUCUNE relance (pas de bandeau, pas de rechargement, pas de nouveau toast) — la mise à jour reste en attente',
        clic4 && !voit(bn4) && !voit(bn4b) && nToast4 === nToast && ferme === cle(1) && t4.ok && (await sm.etat(pg)).enAttente, js({ clic: clic4, apres: voit(bn4), apres15min: voit(bn4b), toasts: [nToast, nToast4], ferme, vivant: t4.ok }));

      /* … la proposition revient au retour à l'Accueil depuis un autre écran, SANS recharger */
      await allerA(pg, 'progress'); const bnP = await lireBandeau(pg);
      await allerA(pg, 'home'); await dormir(500); const bn5 = await lireBandeau(pg), t5 = await sm.tientAuto(pg, 2500);
      t('SCFM-F5 ⭐ la proposition fermée ne reparaît PAS d\'elle-même sur un autre écran (Progrès), mais revient au retour à l\'Accueil — sans rechargement ni minuteur',
        !voit(bnP) && voit(bn5) && new RegExp(cle(1)).test((bn5.txt || {}).txt || '') && t5.ok, js({ progres: voit(bnP), accueil: voit(bn5), vivant: t5.ok }));

      /* 5 · « Mettre à jour » : UNE seule mise à jour, sur le code neuf, séance intacte, « À propos » dit la vraie version */
      /* « une seule fois » se compte aux CHARGEMENTS DE PAGE : un script posé avant le clic incrémente un compteur de session à chaque nouveau document (la session survit au rechargement). Les évènements de navigation
         (`framenavigated`) ne conviennent pas : ils comptent aussi les changements d'adresse sans rechargement. */
      await pg.addInitScript(() => { try { if (window.top === window) sessionStorage.setItem('__cg', String(+(sessionStorage.getItem('__cg') || 0) + 1)); } catch (e) {} });
      const c0 = +(await pg.evaluate(() => sessionStorage.getItem('__cg') || 0));
      const clic5 = await pg.click('#maj-restart', { timeout: 4000 }).then(() => true, () => false);
      const rech = clic5 && await rechargee(pg, 25000); await poser(pg, 1); await dormir(6000);
      const nRech = +(await pg.evaluate(() => sessionStorage.getItem('__cg') || 0)) - c0;
      const v1 = await lireVersions(), e5 = await sm.etat(pg), bn6 = await lireBandeau(pg);
      await pg.evaluate(() => { try { closeMenuDrawer(); openDrawerContent('about'); } catch (e) {} }); await dormir(700);
      const apropos = await pg.evaluate(() => { const e = document.getElementById('_about-ver'); return e ? (e.textContent || '').trim() : null; });
      t('SCFM-F6 ⛔⛔ le choix « Mettre à jour » : la page redémarre UNE SEULE fois (le compteur de chargements de page monte de 1, et reste à 1 six secondes plus tard), sur le code NEUF — `APP_BUILD` réel, étiquette et badge « À propos » disent la vraie version — plus de bandeau, rien en attente, séance intacte (mémoire et stockage)',
        clic5 && rech && nRech === 1 && v1.build === cle(1) && v1.ver.length > 0 && v1.ver.every((v) => v === cle(1)) && apropos === cle(1) && !voit(bn6) && !e5.enAttente && e5.n === 1 && e5.stock === 1 && e5.nom === 'Exercice Fictif Zéta',
        js({ clic: clic5, rechargee: rech, chargements: nRech, build: v1.build, ver: v1.ver, apropos, bandeau: voit(bn6), enAttente: e5.enAttente, n: e5.n }));
      t('SCFM-X 0 erreur JS de page pendant tout le parcours', sc.erreurs.length === 0, js(sc.erreurs));
    } finally { await sc.fermer(); }
  });

  /* ── B-SCFM-H · D-176 (acquis, ne pas rouvrir) : l'en-tête global n'est que sur l'Accueil — et l'accès au Partage et à l'Aide détaillée existe dans le MENU ── */
  await garde('H', async () => {
    const sc = await ouvrir(b);
    try {
      const { pg } = sc;
      const visible = (sel) => pg.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return false; for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }, sel);
      await allerA(pg, 'home');
      const accueil = { aide: await visible('.topbar button[title="Aide"]'), partage: await visible('.topbar button[onclick*="openShareModal"]'), sheets: await visible('#sync-pill') };
      await allerA(pg, 'nutrition');
      const ailleurs = { aide: await visible('.topbar button[title="Aide"]'), partage: await visible('.topbar button[onclick*="openShareModal"]'), sheets: await visible('#sync-pill'), entete: await visible('.topbar') };
      await pg.evaluate(() => { try { openMenuDrawer(); } catch (e) {} }); await dormir(700);
      const menu = { partage: await visible('#menu-drawer [onclick*="openShareModal"]'), guide: await visible('#menu-row-appguide'), profil: await visible('#menu-row-profil') };
      /* RÉÉCRIT le 17/11/2026 (lot A de la finale). AVANT : « le « ? » d'onglet, « Partager » et la pastille Sheets sont visibles sur l'Accueil seulement » — la formule disait « le ? d'onglet » alors que le sélecteur ne mesure que celui de
         l'EN-TÊTE global (`.topbar button[title="Aide"]`) ; l'arbitrage de Michel (un « ? » discret par écran) rend le titre FAUX tel qu'écrit. INVARIANT GARDÉ : l'en-tête GLOBAL (son « ? », « Partager », la pastille Sheets) n'est que sur l'Accueil,
         l'accès au Partage / à l'Aide détaillée / à l'état Sheets existe dans le Menu. Le « ? » d'ÉCRAN (`#ctx-help`, un bouton distinct) est testé par B-SCFM-A. Le code de l'assertion est inchangé : seul le libellé disait plus que la mesure. */
      t('SCFM-H1 ⭐ D-176 conforme (acquis, non rouvert) : l\'en-tête GLOBAL (son « ? », « Partager », la pastille Sheets) n\'est visible que sur l\'Accueil et n\'existe pas ailleurs ; le Menu porte « Partager », l\'Aide détaillée (guide) et Profil (état Sheets)',
        accueil.aide && accueil.partage && accueil.sheets && !ailleurs.aide && !ailleurs.partage && !ailleurs.sheets && !ailleurs.entete && menu.partage && menu.guide && menu.profil, js({ accueil, ailleurs, menu }));
    } finally { await sc.fermer(); }
  });

  /* ── B-SCFM-A · lot A de la finale : le « ? » d'écran — visible, bon texte, rien de recouvert, atteignable pendant une séance, aucune barre, le « + » immobile ── */
  await garde('A', async () => {
    const ROOT = path0.join(__dirname, '..', '..');
    const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
    const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html'; const f = path0.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs0.existsSync(f) || fs0.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
      r.writeHead(200, { 'Content-Type': TYPES[path0.extname(f)] || 'application/octet-stream' }); fs0.createReadStream(f).pipe(r); });
    await new Promise((r) => srv.listen(0, r));
    const PORT = srv.address().port;
    const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 'cfma@example.test', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1',
      ft4_stmig1: '1', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_sessions: '[]' };
    /* une séance FICTIVE (valeurs atypiques) : un exercice inventé, une série faite et une à faire */
    const WKT = () => ({ date: '__TODAY__', startHour: 10, startTs: Date.now() - 600000, exs: [{ name: 'Exercice Fictif Zéta', sets: [{ kg: 17, reps: 8, done: true, type: 'N', rm1: 22 }, { kg: 17, reps: 8, done: false, type: 'N' }] }] });
    const ouvrirA = async (w, h, avecSeance, clair) => {
      const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
      await cx.route((u) => !/^http:\/\/localhost:/.test(String(u)), (rt) => rt.abort());
      const init = Object.assign({}, BASE); if (avecSeance) { init.ft4_wkt = JSON.stringify(WKT()); init.ft4_wkt_draft = JSON.stringify(WKT()); } if (clair) init.ft4_theme = 'light';
      await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_cfma'))return; sessionStorage.setItem('_cfma','1'); localStorage.clear(); const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); }catch(e){} })();`);
      const pg = await cx.newPage(); const errs = []; pg.on('pageerror', (x) => errs.push(String(x.message).slice(0, 160)));
      await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
      await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none';
        const tt = today(), pm = new Date(Date.UTC(+tt.slice(0, 4), +tt.slice(5, 7) - 2, 15)); S.lastWeekSummary = tt; S.lastMonthSummary = pm.getUTCFullYear() + '-' + String(pm.getUTCMonth() + 1).padStart(2, '0');
        if (S.wkt && S.wkt.date === '__TODAY__') S.wkt.date = tt; persist(); goScreen('home', document.getElementById('nb-home')); });
      await pg.waitForTimeout(400);
      return { cx, pg, errs, w, h };
    };
    const va = async (X, e) => { await X.pg.evaluate((e) => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); goScreen(e, document.getElementById('nb-' + e)); }, e); await X.pg.waitForTimeout(450); };
    const mes = (X) => X.pg.evaluate(() => {
      const vu = (e) => { if (!e) return false; for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, r: Math.round(r.right * 10) / 10, b: Math.round(r.bottom * 10) / 10 }; };
      const btn = document.getElementById('ctx-help'), tb = document.querySelector('.topbar'), act = document.querySelector('.screen.active'), sc = document.querySelector('.screens');
      const out = { ecran: window._curScreen, vu: !!btn && vu(btn), rect: R(btn), disque: btn ? R(btn.querySelector('span')) : null, centre: false, recouvre: [], vw: document.documentElement.clientWidth, vh: document.documentElement.clientHeight,
        tbAff: !!tb && getComputedStyle(tb).display !== 'none', tbH: tb ? Math.round(tb.getBoundingClientRect().height) : null, logo: vu(document.getElementById('tb-logo')), tbSeance: vu(document.getElementById('tb-seance')),
        entetePourAide: vu(document.querySelector('.topbar button[title="Aide"]')), screens: R(sc), actif: R(act), fab: R(document.getElementById('nb-log')), root: document.getElementById('root').className,
        scrollX: act ? act.scrollWidth - act.clientWidth : null, nbBtn: document.querySelectorAll('#ctx-help').length };
      out.nav = [...document.querySelectorAll('.nav .nb')].map((e) => { const r = e.getBoundingClientRect(), c = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!c && (c === e || e.contains(c)) && vu(e); });
      if (btn && out.vu) {
        const r = btn.getBoundingClientRect(), c = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); out.centre = !!c && (c === btn || btn.contains(c));
        const touche = (a) => a.width > 0 && a.height > 0 && a.left < r.right && a.right > r.left && a.top < r.bottom && a.bottom > r.top;
        for (const e of act.querySelectorAll('*')) {
          if (!vu(e)) continue;
          let rects = [];
          if (/^(BUTTON|INPUT|SELECT|TEXTAREA|A|LABEL|SUMMARY|IMG)$/.test(e.tagName) || e.hasAttribute('onclick')) rects = [e.getBoundingClientRect()];
          else for (const n of e.childNodes) if (n.nodeType === 3 && n.textContent.trim()) { const g = document.createRange(); g.selectNodeContents(n); rects.push(...g.getClientRects()); }
          if (rects.some(touche)) out.recouvre.push(e.tagName + '#' + e.id + ' « ' + (e.textContent || '').trim().slice(0, 18) + ' »');
        }
        const sp = btn.querySelector('span'), cs = getComputedStyle(sp);
        out.couleurs = { texte: cs.color, fond: cs.backgroundColor };
      }
      return out;
    });
    const cliquerAide = async (X) => {
      const c = await X.pg.evaluate(() => { const b = document.getElementById('ctx-help'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      if (!c) return null;
      await X.pg.mouse.click(c.x, c.y); await X.pg.waitForTimeout(350);
      const h = await X.pg.evaluate(() => { const o = document.getElementById('ov-help'); const k = window._curScreen === 'cycle' ? 'home' : window._curScreen, d = (typeof _HELP_DATA !== 'undefined' && _HELP_DATA[k]) || null;
        return { ouvert: !!(o && o.classList.contains('open')), titre: (document.getElementById('help-title').textContent || '').trim(), n: document.querySelectorAll('#help-content .help-item').length, attendus: d ? d.tips.length : -1, html: document.getElementById('help-content').innerHTML }; });
      /* la MÊME fenêtre que `showHelp()` appelée à la main */
      const direct = await X.pg.evaluate(() => { closeHelp(); showHelp(); return { titre: (document.getElementById('help-title').textContent || '').trim(), html: document.getElementById('help-content').innerHTML }; });
      await X.pg.evaluate(() => { closeHelp(); });
      return { ouvert: h.ouvert, titre: h.titre, n: h.n, attendus: h.attendus, memeAide: h.titre === direct.titre && h.html === direct.html };
    };
    const ECRANS = [['progress', /Progrès/], ['nutrition', /Nutrition/], ['coach', /Coach/], ['setup', /Profil/], ['log', /Séance/], ['cycle', /Accueil/]];
    try {
      /* ── 1 · AVANT UNE SÉANCE : chaque écran, 4 tailles ── */
      for (const [W, H] of [[390, 844], [375, 667], [360, 640], [430, 932]]) {
        const X = await ouvrirA(W, H, false);
        await va(X, 'home'); const h0 = await mes(X);
        t('SCFM-A0 ' + W + '×' + H + ' ACCUEIL : AUCUN « ? » d\'écran (l\'en-tête global y garde le sien, visible), l\'en-tête est complet, et le « ? » de l\'en-tête ouvre l\'aide de l\'Accueil',
          !h0.vu && h0.tbAff && h0.logo && h0.entetePourAide && h0.root.indexOf('aide-ecran') < 0 && await X.pg.evaluate(() => { document.querySelector('.topbar button[title="Aide"]').click(); const o = document.getElementById('ov-help'); const ok = o.classList.contains('open') && /Accueil/.test(document.getElementById('help-title').textContent); closeHelp(); return ok; }),
          js({ vu: h0.vu, tb: h0.tbAff, logo: h0.logo, aide: h0.entetePourAide, root: h0.root }));
        const ref = [];
        for (const [e, re] of ECRANS) {
          await va(X, e); const m = await mes(X); ref.push(m);
          const enHaut = m.rect && m.rect.y >= 0 && m.rect.y < 60 && m.rect.b <= 70, dedans = m.rect && m.rect.x >= 0 && m.rect.r <= m.vw + 0.5 && m.rect.b <= m.vh;
          t('SCFM-A1 ⭐ ' + W + '×' + H + ' « ' + e + ' » : le « ? » est VISIBLE, en haut à droite, dans la fenêtre, avec une zone tactile ≥ 44 × 44 (disque 32), c\'est lui qu\'on touche au centre, et il ne RECOUVRE rien (aucun bouton, aucun texte de l\'écran)',
            m.vu && m.nbBtn === 1 && m.rect.w >= 44 && m.rect.h >= 44 && enHaut && dedans && m.rect.r > m.vw - 20 && m.disque.w >= 30 && m.centre && m.recouvre.length === 0, js({ vu: m.vu, rect: m.rect, vw: m.vw, centre: m.centre, recouvre: m.recouvre }));
          t('SCFM-A2 ⭐ ' + W + '×' + H + ' « ' + e + ' » : AUCUNE barre n\'est revenue (D-176) — l\'en-tête global est masqué (0 px), l\'écran commence tout en haut (aucune bande vide), le « + » central est EXACTEMENT où il était sur l\'Accueil (règle d\'or #9, mesuré), les 6 onglets sont atteignables, aucun défilement horizontal',
            !m.tbAff && m.tbH === 0 && !m.logo && !m.entetePourAide && m.screens && Math.abs(m.screens.y) < 0.6 && Math.abs(m.screens.b - m.vh) < 0.6 && m.actif && Math.abs(m.actif.y) < 0.6
            && js(m.fab) === js(h0.fab) && m.nav.length === 6 && m.nav.every(Boolean) && (m.scrollX === 0 || m.scrollX === null), js({ tbAff: m.tbAff, tbH: m.tbH, screens: m.screens, fab: m.fab, ref: h0.fab, nav: m.nav, scrollX: m.scrollX }));
          if (W === 390 || W === 360) {
            const c = await cliquerAide(X);
            t('SCFM-A3 ⭐ ' + W + '×' + H + ' « ' + e + ' » : un VRAI toucher sur le « ? » ouvre la bonne aide (titre ' + re + ', toutes ses entrées) et c\'est exactement la fenêtre de `showHelp()` — mêmes textes qu\'avant D-176 —, puis elle se referme',
              !!c && c.ouvert && re.test(c.titre) && c.n > 0 && c.n >= c.attendus && c.memeAide, js(c));
          }
        }
        await va(X, 'home'); const h1 = await mes(X);
        t('SCFM-A4 ' + W + '×' + H + ' RETOUR à l\'Accueil : le « ? » d\'écran disparaît, l\'en-tête global est restauré à l\'identique, le « + » n\'a pas bougé', !h1.vu && h1.tbAff && h1.logo && js(h1.fab) === js(h0.fab) && h1.root.indexOf('aide-ecran') < 0, js({ vu: h1.vu, tb: h1.tbAff, fab: h1.fab, ref: h0.fab }));
        if (W === 390) {
          /* un écran SANS aide (inventé par le banc) n'a pas de « ? » : la règle lit `_HELP_DATA`, elle ne tient aucune liste */
          await X.pg.evaluate(() => { const d = document.createElement('div'); d.className = 'screen'; d.id = 's-futur'; d.innerHTML = '<h2>Écran futur</h2>'; document.querySelector('.screens').appendChild(d); });
          await va(X, 'futur'); const f = await mes(X);
          t('SCFM-A5 un écran futur SANS aide propre n\'a pas de « ? » (rien d\'inventé, aucun bouton vide) et n\'a pas non plus d\'en-tête global ; au retour sur un écran qui en a une, le « ? » revient', !f.vu && f.root.indexOf('aide-ecran') < 0 && !f.tbAff, js({ vu: f.vu, root: f.root, tb: f.tbAff }));
          await va(X, 'progress'); const bk = await mes(X);
          t('SCFM-A5b … et il est de retour sur Progrès (un seul bouton, jamais deux)', bk.vu && bk.nbBtn === 1, js({ vu: bk.vu, nb: bk.nbBtn }));
        }
        t('SCFM-A6 ' + W + '×' + H + ' aucune erreur de page pendant Accueil → chaque écran → Accueil', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
        await X.cx.close();
      }

      /* ── 2 · LE « ? » SE VOIT AUSSI EN MODE CLAIR ── (le mode Jour est SUSPENDU dans l'app — `LIGHT_MODE_PAUSED`, app.js — mais sa feuille de style est gardée : on pose la classe à la main, comme `toggleTheme` le ferait) */
      {
        const X = await ouvrirA(390, 844, false, false);
        await X.pg.evaluate(() => { document.getElementById('root').classList.add('light-mode'); document.documentElement.classList.add('light-mode'); });
        await va(X, 'progress'); const m = await mes(X);
        const lum = (c) => { const v = (/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c) || [0, 0, 0, 0]).slice(1, 4).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
        const cl = m.couleurs ? (Math.max(lum(m.couleurs.texte), lum(m.couleurs.fond)) + 0.05) / (Math.min(lum(m.couleurs.texte), lum(m.couleurs.fond)) + 0.05) : 0;
        const claire = await X.pg.evaluate(() => document.getElementById('root').classList.contains('light-mode'));
        t('SCFM-A7 mode CLAIR (classe posée à la main : le mode Jour est suspendu dans l\'app) : le « ? » est visible et son signe contraste avec son disque (rapport ≥ 3 : ce n\'est pas un « ? » blanc sur fond clair)', claire && m.vu && cl >= 3, js({ claire, couleurs: m.couleurs, contraste: Math.round(cl * 10) / 10 }));
        await X.cx.close();
      }

      /* ── 3 · PENDANT UNE SÉANCE ── */
      for (const [W, H] of [[390, 844], [375, 667]]) {
        const X = await ouvrirA(W, H, true);
        const avant = await X.pg.evaluate(() => JSON.stringify(S.wkt));
        await va(X, 'home'); const h0 = await mes(X);
        await va(X, 'log'); const l = await mes(X);
        const fin = await X.pg.evaluate(() => { const f = document.querySelector('.topbar .tbs-fin'); if (!f) return null; const r = f.getBoundingClientRect(); const c = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { h: Math.round(r.height), reach: !!c && (c === f || f.contains(c)), r: Math.round(r.right), vw: document.documentElement.clientWidth }; });
        t('SCFM-A8 ⭐ ' + W + '×' + H + ' PENDANT UNE SÉANCE, sur l\'écran Séance : l\'en-tête de SÉANCE est là (« Terminer » visible, atteignable au toucher, rien ne le recouvre), le « ? » d\'écran s\'efface (il ne double ni ne gêne l\'en-tête), l\'en-tête GLOBAL (logo) n\'est pas revenu, le « + » n\'a pas bougé',
          l.tbAff && l.tbSeance && !l.logo && !l.vu && !!fin && fin.reach && fin.h >= 40 && js(l.fab) === js(h0.fab), js({ l: { tb: l.tbAff, seance: l.tbSeance, logo: l.logo, vu: l.vu }, fin, fab: l.fab, ref: h0.fab }));
        /* l'aide de l'écran Séance : ⋯ → « Aide de l'écran Séance » (le chemin existant, D-083) — de vrais touchers */
        const pt = (sel) => X.pg.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height, w: r.width }; }, sel);
        const p1 = await pt('.topbar .tbs-btn[onclick="openWktMenu()"]');
        let aideSeance = null;
        if (p1) {
          await X.pg.mouse.click(p1.x, p1.y); await X.pg.waitForTimeout(400);
          const p2 = await pt('#ov-wkt-menu [onclick*="showHelp()"]');
          if (p2) { await X.pg.mouse.click(p2.x, p2.y); await X.pg.waitForTimeout(400);
            aideSeance = await X.pg.evaluate(() => ({ ouvert: document.getElementById('ov-help').classList.contains('open'), titre: (document.getElementById('help-title').textContent || '').trim(), n: document.querySelectorAll('#help-content .help-item').length })); await X.pg.evaluate(() => { closeHelp(); }); }
        }
        t('SCFM-A9 ⭐ ' + W + '×' + H + ' PENDANT UNE SÉANCE : l\'aide de l\'écran Séance reste atteignable par ⋯ → « Aide de l\'écran Séance » (vrais touchers) et ouvre l\'aide « Séance »',
          !!p1 && !!aideSeance && aideSeance.ouvert && /Séance/.test(aideSeance.titre) && aideSeance.n > 0, js({ bouton: p1 && [Math.round(p1.w), Math.round(p1.h)], aideSeance }));
        for (const [e, re] of ECRANS.filter((x) => x[0] !== 'log')) {
          await va(X, e); const m = await mes(X);
          const c = (e === 'progress' || e === 'coach') ? await cliquerAide(X) : null;
          t('SCFM-A10 ⭐ ' + W + '×' + H + ' PENDANT LA SÉANCE, sur « ' + e + ' » : le « ? » est là (≥ 44 × 44, c\'est lui qu\'on touche, rien de recouvert), aucune barre ni bande, le « + » n\'a pas bougé' + (c ? ', et un vrai toucher ouvre la bonne aide' : ''),
            m.vu && m.rect.w >= 44 && m.rect.h >= 44 && m.centre && m.recouvre.length === 0 && !m.tbAff && m.tbH === 0 && Math.abs(m.screens.y) < 0.6 && js(m.fab) === js(h0.fab) && (!c || (c.ouvert && re.test(c.titre) && c.memeAide)),
            js({ vu: m.vu, rect: m.rect, centre: m.centre, recouvre: m.recouvre, tbAff: m.tbAff, fab: m.fab, c }));
        }
        const apres = await X.pg.evaluate(() => JSON.stringify(S.wkt)), disque = await X.pg.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('ft4_wkt') || 'null')));
        t('SCFM-A11 ' + W + '×' + H + ' ouvrir l\'aide pendant la séance ne touche à RIEN : la séance en mémoire est identique (mêmes séries, mêmes charges) et celle du stockage local aussi', apres === avant && JSON.parse(disque).exs[0].sets.length === 2 && JSON.parse(disque).exs[0].sets[0].kg === 17, js({ pareil: apres === avant }));
        t('SCFM-A12 ' + W + '×' + H + ' aucune erreur de page pendant la séance', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
        await X.cx.close();
      }
    } finally { try { srv.close(); } catch (e) {} }
  });
};
