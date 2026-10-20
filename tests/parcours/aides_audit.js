/* ════════════════════════════════════════════════════════════════════════════════════════════════════════
   ❓ AIDES — CE QU'ELLES AFFIRMENT CONTRE CE QUE L'ÉCRAN FAIT (blocs B-AID-*) — lot final ft-v1257, 20/10/2026 : consigne de
   Michel « prendre en compte l'audit des aides du clone du 17/10 » (159 points « ? » + 87 cartes d'aide détaillée), vérifié sur
   le code D-093 avant toute correction. Une aide fausse ne casse rien et ne fait rougir aucun test : elle envoie quelqu'un
   chercher un bouton qui n'est plus là. Chaque témoin met donc UNE affirmation des aides en face du FAIT mesuré dans la même page.
   Ce que les témoins CONDUISENT : la vraie app servie en local, une séance en cours (2 exercices, des séries cochées), les vraies
   fonctions d'ouverture (showHelp sur chaque écran, openDrawerContent('help'), openExMenu, openWktMenu, openRestEdit,
   openDropsetConfig, renderProgModal, le Menu).
   Ce qu'ils OBSERVENT : le texte de chaque aide « ? » (6 écrans), de chaque carte de l'Aide détaillée et de chaque diapo du Guide,
   et en face : les lignes des menus ⋯, les boutons de la carte ouverte, la colonne « 1RM », les préréglages de « Régler », la
   couleur calculée du « Terminer » du bas, l'ordre du bloc Cardio, les fichiers acceptés par l'import, le Menu et ses rayons,
   les sections du Profil, le « + » central, l'Accueil.
   Ce qu'ils NE COUVRENT PAS : l'iPhone réel, la qualité rédactionnelle, et ⛔ les aides NUTRITION (hors périmètre, décision de
   Michel du 20/10 : signalées, jamais réécrites ici — les témoins d'affichage les excluent nommément).
   ════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999' };
const IA = ['coach', 'analyzeSession', 'summarizeCoach', 'importProgram', 'importHistory', 'bodyStudy', 'analyzeProgram'];
const _det = o => JSON.stringify(o);
const S_ = (kg, reps, done, type) => ({ kg, reps, done: !!done, type: type || 'N' });
const WKT = { date: '__TODAY__', startTs: Date.now() - 20 * 60e3, progLabel: 'Haut',
  exs: [ { name: 'Développé Couché', sets: [S_(50, 8, 1, 'É'), S_(80, 8, 1), S_(80, 8, 0)] },
         { name: 'Squat à la Barre', sets: [S_(100, 5, 0), S_(100, 5, 0)] } ] };
const PROG = [{ name: 'Haut A', date: '2026-10-01', exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 8 }] }] }];
/* ⛔ Les aides NUTRITION sont hors périmètre (décision de Michel, 20/10) : les témoins d'affichage les excluent PAR NOM. */
const NUTRI = /^(Nutrition|Journal alimentaire|Code-barres|Score santé|Importer un plan alimentaire|D'où vient ton métabolisme)/;

async function ecran(t, b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris', locale: 'fr-FR', hasTouch: true });
  const req = [];
  await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => { const pd = String(rt.request().postData() || '');
    const m = /"action":"([A-Za-z]+)"/.exec(pd) || /[?&]action=([A-Za-z]+)/.exec(rt.request().url());
    req.push({ url: rt.request().url().slice(0, 70), action: m ? m[1] : '' }); return rt.abort(); });
  const init = Object.assign({}, BASE, { ft4_sessions: '[]', ft4_progs: JSON.stringify(PROG), ft4_wkt: JSON.stringify(WKT), ft4_wkt_draft: JSON.stringify(WKT) });
  await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_aid'))return; sessionStorage.setItem('_aid','1'); localStorage.clear();
    const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); }catch(e){} })();`);
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
  const nettoyer = () => pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; if (typeof closeMenuDrawer === 'function') try { closeMenuDrawer(); } catch (e) {} });
  await nettoyer();
  await pg.evaluate(() => { if (S.wkt && S.wkt.date === '__TODAY__') { S.wkt.date = today(); persist(); }
    goScreen('log', document.getElementById('nb-log')); renderLog(); });
  await pg.waitForTimeout(300);

  /* ── ① CE QUE DISENT LES AIDES : chaque « ? » (tel qu'affiché par showHelp), l'Aide détaillée, le Guide ─────────────────── */
  const A = await pg.evaluate(async () => {
    const txt = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
    const out = { q: [], ad: [], guide: [] };
    const garde = S.gender;
    for (const g of ['H', 'F']) {
      S.gender = g;
      for (const k of Object.keys(_HELP_DATA)) {
        window._curScreen = k; showHelp();
        document.querySelectorAll('#help-content .help-item').forEach((e, i) => out.q.push({ ecran: k, genre: g, i,
          icone: e.querySelector('.help-item-icon').textContent.trim(), texte: e.querySelector('.help-item-text').textContent.replace(/\s+/g, ' ').trim() }));
        closeHelp();
      }
    }
    S.gender = garde; window._curScreen = 'log';
    openDrawerContent('help'); await new Promise(r => setTimeout(r, 200));
    const body = document.getElementById('drawer-cnt-body');
    [...body.querySelectorAll('div[style*="border-radius:12px"]')].forEach(c => out.ad.push({
      icone: ((c.querySelector('span') || {}).textContent || '').trim(), titre: ((c.querySelector('strong') || {}).textContent || '').trim(),
      texte: ((c.querySelector('p') || {}).textContent || '').replace(/\s+/g, ' ').trim() }));
    if (typeof closeDrawerContent === 'function') closeDrawerContent();
    (typeof APP_GUIDE_SLIDES !== 'undefined' ? APP_GUIDE_SLIDES : []).forEach(s => out.guide.push({ titre: txt(s.t || ''), texte: txt(s.cap || ''), icone: s.icon || '' }));
    out.nf = (typeof NEW_FEATURES !== 'undefined' ? NEW_FEATURES : []).map(f => ({ id: f.id, ecran: f.screen, texte: txt(f.desc || '') }));   // les textes des points rouges
    return out; });
  await nettoyer();
  /* Toutes les aides en une liste homogène { ou, icone, texte } ; `nutri` marque ce qui est hors périmètre. */
  const TOUT = A.q.map(x => ({ ou: '?' + x.ecran + (x.genre === 'F' ? '(F)' : '') + '#' + (x.i + 1), icone: x.icone, texte: x.texte, nutri: x.ecran === 'nutrition' }))
    .concat(A.ad.map((x, i) => ({ ou: 'AD#' + (i + 1) + ' ' + x.titre, icone: x.icone, texte: x.titre + ' : ' + x.texte, nutri: NUTRI.test(x.titre) })))
    .concat(A.guide.map((x, i) => ({ ou: 'Guide#' + (i + 1) + ' ' + x.titre, icone: x.icone, texte: x.titre + ' : ' + x.texte, nutri: /^Ta (cible|nutrition)/.test(x.titre) })));
  /* L'AFFICHAGE couvre aussi les textes des points rouges (NEW_FEATURES) : un code d'émoji brut y est le même défaut. */
  const NF = A.nf.map(x => ({ ou: 'Point rouge ' + x.id, icone: '', texte: x.texte, nutri: x.ecran === 'nutrition' }));
  const HORS_NUTRI = TOUT.filter(x => !x.nutri);
  const ou = (re, L) => (L || TOUT).filter(x => re.test(x.texte)).map(x => x.ou + ' « ' + (x.texte.match(re) || [''])[0] + ' »');

  /* ── ② CE QUE FAIT L'ÉCRAN (mesuré dans la même page) ────────────────────────────────────────────────────────────── */
  const F = await pg.evaluate(async () => {
    const z = ms => new Promise(r => setTimeout(r, ms));
    const f = {};
    // menu ⋯ d'un exercice
    openExMenu(0, false); await z(150);
    f.menuEx = [...document.querySelectorAll('#ov-ex-menu button')].map(x => x.textContent.replace(/\s+/g, ' ').trim());
    document.getElementById('ov-ex-menu').classList.remove('open');
    // la carte OUVERTE (1er exercice, hors groupe) : ses boutons d'action, et aucun 📊 sur aucune carte
    _expandedEx = 0; renderExBlocks(); await z(150);
    const bloc = document.getElementById('ex-block-0');
    f.carteBoutons = bloc ? [...bloc.querySelectorAll('button')].filter(x => /createSupersetFrom|openDropsetConfig/.test(x.getAttribute('onclick') || '')).map(x => x.textContent.replace(/\s+/g, ' ').trim()) : null;
    f.cartesStats = [...document.querySelectorAll('#wkt-exs button')].filter(x => /📊/.test(x.textContent)).length;
    f.colonnes = bloc ? [...bloc.querySelectorAll('.sets-hdr span')].map(x => x.textContent.trim()) : [];
    // les réglages par défaut de « 📉 Drop » et « 📈 +% »
    openDropsetConfig(0, 'down'); f.dropBas = _dropCfgPct; closeDropCfg();
    openDropsetConfig(0, 'up'); f.dropHaut = _dropCfgPct; closeDropCfg();
    // menu ⋯ de la séance
    openWktMenu(); await z(150);
    f.menuSeance = [...document.querySelectorAll('#ov-wkt-menu .wm-row b')].map(x => x.textContent.trim());
    if (typeof closeWktMenu === 'function') closeWktMenu();
    // « Régler » (toucher le temps du repos)
    openRestEdit(); await z(100);
    f.presets = [...document.querySelectorAll('.re-presets button')].map(x => x.textContent.replace(/ /g, ' ').trim());
    if (typeof closeRestEdit === 'function') closeRestEdit();
    // le « Terminer » du bas : sa couleur calculée, contre le jeton Cobalt de la séance
    if (typeof renderLogFinish === 'function') renderLogFinish(); await z(100);
    const fin = document.querySelector('#log-finish .lf-fin');
    const sonde = document.createElement('div'); sonde.style.background = 'var(--sea-fill)'; document.body.appendChild(sonde);
    f.fin = fin ? { fond: getComputedStyle(fin).backgroundColor, img: getComputedStyle(fin).backgroundImage, txt: fin.textContent.trim() } : null;
    f.cobalt = getComputedStyle(sonde).backgroundColor; sonde.remove();
    // le bloc Cardio : APRÈS la liste des exercices
    const ce = document.getElementById('log-cardio'), le = document.getElementById('wkt-exs');
    f.cardioApres = !!(ce && le && (le.compareDocumentPosition(ce) & Node.DOCUMENT_POSITION_FOLLOWING)) && ce.innerHTML.length > 0;
    // l'import d'un programme : les fichiers acceptés
    f.accepte = ['imp-cam-inp', 'imp-gal-inp', 'imp-file-inp', 'imp-more-inp', 'imp-more-file-inp'].map(id => { const e = document.getElementById(id); return e ? e.getAttribute('accept') : null; });
    // le « + » central
    const nb = document.getElementById('nb-log');
    f.plus = nb ? { svg: !!nb.querySelector('svg'), texte: nb.textContent.trim() } : null;
    // l'Accueil : aucun badge, aucun « Big 3 »
    const home = document.getElementById('s-home');
    f.accueilBadges = home ? [...home.querySelectorAll('*')].filter(e => /badge/i.test((e.id || '') + ' ' + (typeof e.className === 'string' ? e.className : ''))).length : -1;
    f.accueilBig3 = home ? /Big ?3/i.test(home.textContent) : null;
    // le Menu : ses rayons, ses entrées
    const secs = [...document.querySelectorAll('.sec')].filter(s => s.nextElementSibling && s.nextElementSibling.classList.contains('menu-group'));
    f.rayons = secs.map(s => ({ titre: s.textContent.trim(), entrees: [...s.nextElementSibling.querySelectorAll('.menu-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()) }));
    f.entrees = f.rayons.reduce((n, r) => n + r.entrees.length, 0);
    // les sections du Profil
    f.sectionsProfil = [...document.querySelectorAll('#s-setup details.acc > summary.acc-h')].map(s => s.textContent.replace(/\s+/g, ' ').trim());
    // l'analyse IA d'un programme (🤖) : visible pour qui ?
    const robot = prem => { S.premium = prem; renderProgModal(); return [...document.querySelectorAll('#prog-list-modal button')].filter(x => /🤖/.test(x.textContent)).length; };
    const p0 = S.premium; f.robotGratuit = robot(false); f.robotPremium = robot(true); S.premium = p0;
    return f; });
  await nettoyer();

  /* ── ③ LES TÉMOINS ─────────────────────────────────────────────────────────────────────────────────────────────────── */
  const sansVS = s => String(s || '').replace(/️/g, '').trim();
  const doublees = HORS_NUTRI.filter(x => x.icone && x.ou[0] === '?' && sansVS(x.texte).indexOf(sansVS(x.icone)) === 0).map(x => x.ou + ' [' + x.icone + ']');
  const etoiles = ou(/\*\*/, HORS_NUTRI.concat(NF.filter(x => !x.nutri))), echap = TOUT.concat(NF).filter(x => /U0{2,}[0-9A-F]{4}/.test(x.icone + ' ' + x.texte)).map(x => x.ou);
  t('B-AID-①a ⭐ affichage (hors Nutrition) : aucune aide n\'affiche d\'astérisques « ** » (gras écrit en Markdown), d\'icône doublée en tête de texte ni de code d\'émoji brut (« U0001F4C5 ») — aides « ? », Aide détaillée, Guide et points rouges',
    TOUT.length > 200 && NF.length > 20 && !etoiles.length && !doublees.length && !echap.length, _det({ n: TOUT.length, etoiles, doublees, echap }));
  const nn = ou(/\bNN\b/, HORS_NUTRI);
  t('B-AID-①b affichage : plus de gabarit « NN » à la place d\'un nombre (le score de récup se dit « sur 100 »)', !nn.length, _det(nn));

  const rouge = ou(/bouton rouge du bas|seul bouton rouge|bouton du bloc était rouge/i);
  const finCobalt = !!F.fin && F.fin.fond === F.cobalt && F.fin.img === 'none';
  t('B-AID-②a ⭐ le bouton qui ENREGISTRE la séance (« Terminer » du bas) est Cobalt — et aucune aide ne le dit rouge (« gros bouton rouge du bas », « un seul bouton rouge »)',
    finCobalt && !rouge.length, _det({ fin: F.fin, cobalt: F.cobalt, rouge }));

  const stats = TOUT.filter(x => /graphique du poids max/.test(x.texte));
  t('B-AID-②b ⭐ « 📊 » est dans le ⋯ de l\'exercice (« Statistiques »), sur aucune carte — et les aides le disent : plus de « Bouton 📊 sur chaque exercice »',
    F.menuEx.some(l => /Statistiques/.test(l)) && F.cartesStats === 0 && !ou(/Bouton 📊 sur chaque exercice/).length && stats.length >= 2 && stats.every(x => /Statistiques/.test(x.texte)),
    _det({ menu: F.menuEx, cartes: F.cartesStats, faux: ou(/Bouton 📊 sur chaque exercice/), stats: stats.map(x => x.ou) }));

  const rm = TOUT.filter(x => /Brzycki/.test(x.texte) && /temps réel/.test(x.texte));
  t('B-AID-②c le 1RM a SA colonne (« 1RM ») et les types de série sont dans le ⋯ de l\'exercice — plus de « 1RM sous le type », plus de « Appuie sur ℹ️ »',
    F.colonnes.indexOf('1RM') >= 0 && F.menuEx.some(l => /Types de série/.test(l)) && !ou(/sous le type|Appuie sur ℹ️/).length && rm.length >= 1 && rm.every(x => /colonne/.test(x.texte)),
    _det({ colonnes: F.colonnes, faux: ou(/sous le type|Appuie sur ℹ️/), rm: rm.map(x => x.ou) }));

  const dropFaux = ou(/−10%|📈 \+10%|Pyramide −/, HORS_NUTRI);
  const dropAD = TOUT.filter(x => /par palier par défaut/.test(x.texte));
  const nbAD = dropAD.map(x => [+((x.texte.match(/−(\d+) % par palier par défaut/) || [])[1]), +((x.texte.match(/\+(\d+) % par défaut/) || [])[1])]);
  t('B-AID-②d ⭐ la carte ouverte porte « ⚡ Super · 📉 Drop · 📈 +% » — aucune aide ne décrit de bouton « −10% », « 📈 +10% » ni « Pyramide − », et les réglages par défaut annoncés sont ceux du code',
    _det(F.carteBoutons) === _det(['⚡ Super', '📉 Drop', '📈 +%']) && !dropFaux.length && dropAD.length >= 1 && nbAD.every(([d, u]) => d === F.dropBas && u === F.dropHaut),
    _det({ carte: F.carteBoutons, dropFaux, nbAD, code: [F.dropBas, F.dropHaut] }));

  const docs = F.accepte.filter(a => a !== null);
  const importFaux = ou(/import[^.]{0,120}(Word|Excel|\.docx|\.xlsx)|Bouton 📸[^.]{0,40}import/i);
  t('B-AID-②e ⭐ l\'import d\'un programme prend une photo ou un PDF (rien d\'autre) — aucune aide ne promet Word / Excel ni un « Bouton 📸 » d\'import',
    docs.length === 5 && docs.every(a => /^(image\/\*|\.pdf,application\/pdf)$/.test(a)) && !importFaux.length, _det({ docs, importFaux }));

  t('B-AID-②f le bloc Cardio est SOUS les exercices — aucune aide ne le dit « en haut de séance »',
    F.cardioApres && !ou(/cardio[^.]{0,30}en haut de (la )?séance/i).length, _det({ apres: F.cardioApres, faux: ou(/cardio[^.]{0,30}en haut de (la )?séance/i) }));

  const listesMenu = TOUT.filter(x => /tout dérouler, grouper/.test(x.texte));
  t('B-AID-②g le ⋯ de la séance contient « Importer un historique » — et chaque aide qui énumère ce menu le nomme',
    F.menuSeance.indexOf('Importer un historique') >= 0 && listesMenu.length >= 2 && listesMenu.every(x => /importer un historique/i.test(x.texte)),
    _det({ menu: F.menuSeance, listes: listesMenu.map(x => x.ou + ' ' + /importer un historique/i.test(x.texte)) }));

  const listesRegler = TOUT.filter(x => /1:30/.test(x.texte) && /[Rr]égler/.test(x.texte));
  t('B-AID-②h « Régler » propose 30 s · 45 s · 1:00 · 1:30 · 2:00 — et chaque aide qui liste ces durées les donne TOUTES',
    _det(F.presets) === _det(['30 s', '45 s', '1:00', '1:30', '2:00']) && listesRegler.length >= 3 && listesRegler.every(x => F.presets.every(p => x.texte.indexOf(p) >= 0)),
    _det({ presets: F.presets, listes: listesRegler.map(x => x.ou + ' ' + F.presets.filter(p => x.texte.indexOf(p) < 0).join(',')) }));

  t('B-AID-②i le « + » central affiche un « + » (pas d\'éclair) — aucune aide ne parle d\'un « bouton rouge central ⚡ »',
    !!F.plus && F.plus.svg && !/⚡/.test(F.plus.texte) && !ou(/central ⚡|⚡ en bas de l/).length, _det({ plus: F.plus, faux: ou(/central ⚡|⚡ en bas de l/) }));

  const accueil = TOUT.filter(x => /^\?home/.test(x.ou));
  t('B-AID-③a l\'Accueil n\'affiche aucun badge — son aide ne dit plus qu\'ils « apparaissent ici » ; elle dit où ils sont (Menu → Ton suivi → Badges)',
    F.accueilBadges === 0 && F.rayons.some(r => r.titre === 'Ton suivi' && r.entrees.some(e => /Badges/.test(e)))
      && !ou(/badges?[^.]{0,60}apparaissent ici/i, accueil).length && accueil.some(x => /Ton suivi → Badges/.test(x.texte)),
    _det({ badgesAccueil: F.accueilBadges, faux: ou(/badges?[^.]{0,60}apparaissent ici/i, accueil) }));
  t('B-AID-③b l\'Accueil n\'affiche aucun total « Big 3 » (retiré le 05/09) — son aide ne le présente plus comme ton indicateur de force',
    F.accueilBig3 === false && !ou(/Big 3[^.]{0,80}indicateur/i, accueil).length, _det({ big3: F.accueilBig3, faux: ou(/Big 3[^.]{0,80}indicateur/i, accueil) }));
  const outils = F.rayons.find(r => r.titre === 'Tes outils');
  t('B-AID-③c le cycle de force est dans Menu → Tes outils (pas dans le Profil) — aucune aide ne l\'envoie dans « Profil → Cycle de force »',
    !!outils && outils.entrees.some(e => /Cycle de force/.test(e)) && F.sectionsProfil.every(s => !/Cycle de force/.test(s))
      && !ou(/Profil → Cycle de force/).length && accueil.some(x => /Tes outils → Cycle de force/.test(x.texte)),
    _det({ outils, faux: ou(/Profil → Cycle de force/) }));

  const robots = TOUT.filter(x => /[Bb]outon 🤖/.test(x.texte));
  t('B-AID-④a l\'analyse IA d\'un programme (🤖) n\'apparaît qu\'en Premium — et chaque aide qui la cite le dit',
    F.robotGratuit === 0 && F.robotPremium >= 1 && robots.length >= 2 && robots.every(x => /Premium/.test(x.texte)),
    _det({ gratuit: F.robotGratuit, premium: F.robotPremium, aides: robots.map(x => x.ou + ' ' + /Premium/.test(x.texte)) }));
  const nbDit = TOUT.map(x => (x.texte.match(/les (\d+) entrées sont toutes là/) || [])[1]).filter(Boolean).map(Number);
  t('B-AID-④b le nombre d\'entrées du Menu annoncé par l\'aide est le nombre réel',
    F.entrees >= 15 && nbDit.length >= 1 && nbDit.every(n => n === F.entrees), _det({ reel: F.entrees, dit: nbDit, rayons: F.rayons.map(r => r.titre + ' ' + r.entrees.length) }));
  const listeProfil = TOUT.filter(x => /sections repliables \(/.test(x.texte) && /^\?setup/.test(x.ou));
  t('B-AID-④c l\'aide du Profil nomme TOUTES ses sections (dont « Mon ADN sportif » et « Cycle menstruel »)',
    F.sectionsProfil.length >= 8 && listeProfil.length >= 1 && listeProfil.every(x => F.sectionsProfil.every(s => x.texte.indexOf(s) >= 0)),
    _det({ sections: F.sectionsProfil, manque: listeProfil.map(x => F.sectionsProfil.filter(s => x.texte.indexOf(s) < 0)) }));

  t('B-AID-⑤ aucune erreur de page, aucun appel d\'IA', errs.length === 0 && req.filter(r => IA.includes(r.action)).length === 0,
    errs.concat(req.filter(r => IA.includes(r.action)).map(r => r.action)).join(' | ').slice(0, 200));
  await cx.close();
}

module.exports = { ecran };
