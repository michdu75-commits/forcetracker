'use strict';
/* section E de B-NS02 — LE VRAI CLIENT, dans des contextes navigateur indépendants, relié à de VRAIS PROCESSUS serveur (voir nut_sync02.js).
   Chaque appareil a son propre `localStorage`, son état `S`, sa mémoire ; ses requêtes de synchronisation partent vers un processus serveur (le sien) qui exécute le vrai Code.js sur les propriétés
   partagées : deux appareils qui synchronisent « en même temps » se disputent le même compte pour de bon. Le miroir Supabase est un MODÈLE du contrat d'écriture de la migration 0003
   (`data = data || p_data` : un champ PRÉSENT remplace le champ entier, un champ absent garde sa valeur) — le vrai Supabase n'est PAS joignable d'ici. */
const fs = require('fs');
const path = require('path');

const QUOTA = `(() => { if (window.__Qinst) return; window.__Qinst = 1; window.__Q = { limit: Infinity, refuse: [], refus: [] };
  const o = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    if (window.__Q.refuse.indexOf(k) >= 0) { window.__Q.refus.push(k); const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; }
    return o.apply(this, arguments);
  }; })();`;
/* On compte les synchronisations Apps Script en vol : une promesse de `fetch` qui se termine (réponse OU échec) fait avancer `termines`. */
const ESPION_RESEAU = `(() => { if (window.__net) return; const f = window.fetch; window.__net = { envoyes: 0, termines: 0 };
  window.fetch = function (u, o) {
    const sync = typeof u === 'string' && /script\\.google\\.com/.test(u) && o && typeof o.body === 'string' && /"action":"saveProfile"/.test(o.body);
    if (!sync) return f.apply(this, arguments);
    window.__net.envoyes++; const p = f.apply(this, arguments); const fin = () => { window.__net.termines++; }; p.then(fin, fin); return p;
  }; })();`;
const CORS = { 'access-control-allow-origin': '*' };

/* ⚙️ NUT-SYNC-02 phase A : la FABRIQUE d'appareils, sortie de la section E pour que `nut_phasea01.js` la réutilise telle quelle (R2) — le code du bloc est inchangé, sauf trois leviers de panne ajoutés (`corps` : les corps envoyés ;
   `sansTomb` : un accusé valide SANS `nut.tomb`, comme un serveur plus ancien ; `reponseFabriquee` : une réponse écrite par le test). */
function fabriquerAppareils(b, PORT, pool, O, erreursGlobales) {
  const { pause, J, CODE_PERSO } = O;
  /* ─── un APPAREIL : un contexte navigateur à lui ; `k` = le processus serveur qui répond à ses requêtes ─── */
  async function appareil(nom, k, mail, opt) {
    opt = opt || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const pg = await cx.newPage();
    const D = { nom, k, cx, pg, mail, horsLigne: false, perdreReponse: false, reponseIllisible: false, autreOperation: false, ancienServeur: false, sansTomb: false, reponseFabriquee: null, fabriqueSeul: false, corps: [], retenir: null, recus: 0, miroir: opt.miroir || null, miroirRecus: [], erreurs: [] };
    pg.on('pageerror', (e) => { const m = nom + ' : ' + String(e && e.message || e).slice(0, 160); D.erreurs.push(m); erreursGlobales.push(m); });
    pg.on('dialog', (d) => d.accept());
    const init = "localStorage.setItem('ft4_email','" + mail + "');localStorage.setItem('ft4_ok','1');localStorage.setItem('ft4_authcode','" + CODE_PERSO + "');";
    await pg.addInitScript({ content: "(() => { if (sessionStorage.getItem('__nsd')) return; sessionStorage.setItem('__nsd', '1'); localStorage.clear(); localStorage.setItem('ft4_ob2', '1'); localStorage.setItem('ft4_guide_shown', '1'); localStorage.setItem('ft4_wn_seen', '99'); " + init + " })();" });
    await pg.addInitScript(QUOTA);
    await pg.addInitScript(ESPION_RESEAU);
    await pg.route(/script\.google\.com/, async (route) => {
      if (D.horsLigne) return route.abort('internetdisconnected');
      const req = route.request();
      if (D.retenir) await D.retenir;                                    // l'ordre d'arrivée des requêtes est PILOTÉ par le test
      if (D.fabriqueSeul && D.reponseFabriquee && req.method() === 'POST') {          // NUT-SYNC-02 phase A : la réponse est ÉCRITE par le test et la requête n'atteint JAMAIS le serveur (un refus que le serveur n'a pas appliqué)
        let c = {}; try { c = JSON.parse(req.postData() || '{}'); } catch (e) { /* tant pis */ }
        D.recus++; D.corps.push(req.postData() || ''); if (D.corps.length > 40) D.corps.shift();
        const j = D.reponseFabriquee(c);
        if (j) return route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: J(j) });
      }
      let rep;
      try { rep = req.method() === 'POST' ? await pool.post(D.k, req.postData() || '') : await pool.get(D.k, Object.fromEntries(new URL(req.url()).searchParams)); }
      catch (e) { rep = { t: J({ status: 'error', error: 'harnais : ' + e.message }) }; }
      D.recus++;
      if (req.method() === 'POST') { D.corps.push(req.postData() || ''); if (D.corps.length > 40) D.corps.shift(); }          // les corps ENVOYÉS (phase A : on mesure ce qui part, octet pour octet)
      if (D.perdreReponse) { D.perdreReponse = false; return route.abort('connectionreset'); }          // APPLIQUÉ côté serveur, mais la réponse n'arrive jamais
      if (D.reponseIllisible) return route.fulfill({ status: 200, contentType: 'text/html', headers: CORS, body: '<html><body>Erreur temporaire</body></html>' });
      if (D.ancienServeur) return route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: '{"status":"ok"}' });   // la réponse d'un serveur d'AVANT ce lot : ni `ok`, ni `requestId`
      if (D.autreOperation) { let j = {}; try { j = JSON.parse(rep.t); } catch (e) { /* tant pis */ } j.requestId = 'une-autre-operation-00000000'; return route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: J(j) }); }
      if (D.sansTomb) { let j = {}; try { j = JSON.parse(rep.t); } catch (e) { /* tant pis */ } if (j.nut) delete j.nut.tomb; return route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: J(j) }); }   // un accusé VALIDE mais d'un serveur qui ne sait pas annoncer ses suppressions
      if (D.reponseFabriquee) { let c = {}; try { c = JSON.parse(req.postData() || '{}'); } catch (e) { /* tant pis */ } const j = D.reponseFabriquee(c); if (j) return route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: J(j) }); }   // une réponse écrite par le test
      await route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: rep.t });
    });
    /* le MIROIR : un modèle du contrat d'écriture (migration 0003). Tout ce que le client lui envoie est consigné. */
    await pg.route(/workers\.dev/, async (route) => {
      const req = route.request(); let corps = {}; try { corps = JSON.parse(req.postData() || '{}'); } catch (e) { /* tant pis */ }
      if (corps.action === 'cloudSave' && corps.data && typeof corps.data === 'object') {
        D.miroirRecus.push(corps.data);
        if (D.miroir) Object.assign(D.miroir, corps.data);                  // jsonb `||` : un champ PRÉSENT remplace le champ entier, un champ absent garde sa valeur
      }
      await route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: J({ status: 'ok', voie: 'directe' }) });
    });
    await pg.route(/supabase\.co/, (r) => r.abort());
    await pg.goto('http://localhost:' + PORT + '/index.html');
    await pause(1500);
    D.ev = (f, a) => pg.evaluate(f, a);
    D.journal = () => D.ev(() => JSON.parse(JSON.stringify(S.foodLog || [])));
    D.disque = () => D.ev(() => { try { return JSON.parse(localStorage.getItem('ft4_foodlog') || '[]'); } catch (e) { return null; } });
    D.registre = () => D.ev(() => JSON.parse(JSON.stringify(S.foodSupprimes || [])));
    D.registreDisque = () => D.ev(() => { try { return JSON.parse(localStorage.getItem('ft4_food_supprimes') || '[]'); } catch (e) { return null; } });
    D.toasts = () => D.ev(() => (window.__toasts || []).slice());
    D.espionner = () => D.ev(() => { window.__toasts = []; if (!window.toast.__esp) { const v = window.toast; const w = function (m) { window.__toasts.push(String(m)); try { return v.apply(this, arguments); } catch (e) {} }; w.__esp = 1; window.toast = w; } });
    D.graine = async (lignes) => { await D.ev((l) => { S.foodLog = l; persist(); }, lignes); };
    /* la VRAIE `_cloudSync` ; on attend que sa requête soit TERMINÉE (réponse reçue ou échec) puis que l'accusé ait été traité */
    D.sync = async () => {
      const n = await D.ev(() => window.__net.envoyes);
      await D.ev(() => { _cloudSync(); });
      for (let i = 0; i < 120; i++) { const r = await D.ev(() => window.__net); if (r.envoyes > n && r.termines >= r.envoyes) break; await pause(50); }
      await pause(150);
    };
    D.restaurer = async () => { await D.ev(async (m) => { const raw = await _fetchRestoreRaw(m); _applyRestoreData(raw); persist(); }, mail); };
    D.redemarrer = async () => { await pg.reload(); await pause(1800); await D.espionner(); };
    D.editerRepas = async (id, repas) => { await D.ev((i) => { openEditFood(i); }, id); await pause(250); await D.ev((m) => { _editFoodMeal = m; saveEditFood(); }, repas); await pause(300); };
    D.supprimer = async (id) => { await D.ev((i) => { removeFoodEntry(i); }, id); await pause(250); };
    D.fermer = () => cx.close();
    await D.espionner();
    return D;
  }
  return appareil;
}

module.exports = async function sectionE(t, b, PORT, pool, O, erreursGlobales) {
  const { canon, metier, ligne, email, rid, mille, CODE_PERSO, pause, J } = O;
  console.log('\n-- B-NS02 (E). Le vrai client · des contextes indépendants · de vrais processus serveur --');
  const appareil = fabriquerAppareils(b, PORT, pool, O, erreursGlobales);

  const compte = (mail) => pool.lire(0, mail);
  const jr = async (mail) => ((await compte(mail)).profile.foodLog || []);
  const zone = async (mail) => (((await compte(mail)).recupNut || {}).foodLog || []);
  const SUCCES = /r[ée]ussi|synchronis[ée]e? ✅|sauvegard[ée]e? ✅|✅.*synchro/i;

  /* données de départ : six repas aux macros FRACTIONNAIRES, pour que la moindre altération se voie */
  const SEMENCE = [
    ligne('Pâtes test', 'sem1-00000001', { kcal: 131.4, prot: 4.6, carbs: 25.3, fat: 1.1, q: 135 }),
    ligne('Pomme test', 'sem2-00000002', { kcal: 52.3, prot: 0.3, carbs: 13.8, fat: 0.2, q: 180 }),
    ligne('Riz test', 'sem3-00000003', { kcal: 129.9, prot: 2.7, carbs: 28.2, fat: 0.3, q: 150 }),
    ligne('Yaourt test', 'sem4-00000004', { kcal: 59.0, prot: 3.9, carbs: 4.7, fat: 3.1, q: 125, meal: 'collation' }),
    ligne('Poulet test', 'sem5-00000005', { kcal: 165.2, prot: 31.0, carbs: 0, fat: 3.6, q: 120, meal: 'diner' }),
    ligne('Huile test', 'sem6-00000006', { kcal: 884.0, prot: 0, carbs: 0, fat: 100, q: 10 }),
  ];
  const copie = (x) => JSON.parse(JSON.stringify(x));
  /* ↪️ ADAPTÉ le 02/11/2026 (NUT-SYNC-02 phase A, R30) : avant la phase A, un envoi qui portait une suppression sans place était REFUSÉ EN ENTIER — le journal du compte restait donc dans le MÊME ordre. Désormais le reste du volet est APPLIQUÉ,
     et le serveur reconstruit la liste (lignes reçues, puis lignes protégées) : mêmes lignes, mêmes révisions, mêmes valeurs, ORDRE différent — mesuré (`sem2` passe en dernier). L'ordre n'est pas un invariant (les écrans trient) ; ce qui l'est : aucune ligne ni valeur ni révision modifiée. */
  const parId = (j) => (j || []).slice().sort((a, b) => (a.id < b.id ? -1 : 1));

  /* ═══ E01 — REGISTRE PLEIN, côté client (tests 4 et 2) ═══ */
  {
    const m = email('e01'); await pool.init(0, m, { code: CODE_PERSO, profile: { foodSupprimes: mille(0, 3000) } });
    const A = await appareil('A', 1, m);
    await A.graine(SEMENCE.slice(0, 3).map(copie)); await A.sync();
    const avantSuppr = await jr(m);
    await A.supprimer('sem2-00000002'); await A.sync();
    const c = await compte(m);
    const reg = await A.registre();
    const entree = reg.find((e) => e.i === 'sem2-00000002') || {};
    const toasts = await A.toasts();
    t('B-NS02 E01 ⭐⭐ (tests 2, 4 — vrai client, ADAPTÉ phase A) le registre du COMPTE est plein : la suppression locale est DIFFÉRÉE explicitement — l\'entrée reste sur le téléphone avec son état « différée » (code NUT_TOMBSTONE_LIMIT), pas confirmée, jamais effacée ; la ligne reste masquée du journal ; le message est clair et dit que les autres repas se synchronisent',
      !!entree.i && entree.x === 'NUT_TOMBSTONE_LIMIT' && !entree.c && !(await A.journal()).some((l) => l.id === 'sem2-00000002') && toasts.some((x) => /registre des suppressions/.test(x) && /Rien n'est perdu/.test(x) && /autres repas se synchronisent/.test(x)), J({ entree, toasts }));
    t('B-NS02 E01b ⭐ … et le serveur n\'a RIEN retenu DE CETTE SUPPRESSION (registre à 3 000 exactement, repas toujours vivant au compte, révisions inchangées) — pas de succès affiché',
      (c.profile.foodSupprimes || []).length === 3000 && (await jr(m)).some((l) => l.id === 'sem2-00000002') && canon(parId(await jr(m))) === canon(parId(avantSuppr)) && !toasts.some((x) => SUCCES.test(x)), J({ n: (c.profile.foodSupprimes || []).length, vivant: (await jr(m)).some((l) => l.id === 'sem2-00000002'), identique: canon(parId(await jr(m))) === canon(parId(avantSuppr)), succes: toasts.filter((x) => SUCCES.test(x)) }));
    await A.sync(); await A.sync();
    const reg2 = await A.registre(); const dsk = await A.registreDisque();
    await A.redemarrer();
    const reg3 = await A.registre();
    t('B-NS02 E01c ⭐⭐ (test 4) la suppression rejetée SURVIT à plusieurs nouvelles tentatives et au REDÉMARRAGE (stockage compris) : toujours là, toujours rejetée, toujours masquée du journal, jamais confondue avec une suppression confirmée',
      [reg2, dsk, reg3].every((r) => r.some((e) => e.i === 'sem2-00000002' && e.x === 'NUT_TOMBSTONE_LIMIT' && !e.c)) && !(await A.journal()).some((l) => l.id === 'sem2-00000002') && (await A.ev(() => _foodSupprimesEnAttente().length)) === 1, J({ reg3 }));
    /* E01e — ↪️ ADAPTÉ le 02/11/2026 (NUT-SYNC-02 phase A). Le lot FINAL MESURAIT ici une limite assumée : tant que l'appareil portait une suppression que le compte ne connaissait pas, TOUT son volet Nutrition était refusé à chaque synchronisation (un repas saisi après
       restait sur le téléphone sans rejoindre le compte). Cette limite est LEVÉE : la suppression est différée entrée par entrée, le reste du volet passe. Le témoin garde le même scénario et prouve l'inverse. */
    await A.ev((l) => { S.foodLog.push(l); persist(); }, ligne('Repas saisi après le rejet', 'apres-00000099'));
    await A.sync();
    t('B-NS02 E01e ⭐⭐ (ADAPTÉ phase A — la limite MESURÉE du lot FINAL est LEVÉE) tant que cet appareil porte une suppression DIFFÉRÉE, son volet Nutrition n\'est PLUS bloqué : un repas saisi APRÈS rejoint le compte (mémoire, disque ET compte), la suppression reste en attente (jamais effacée, jamais confirmée), aucun succès trompeur',
      (await A.journal()).some((l) => l.id === 'apres-00000099') && ((await A.disque()) || []).some((l) => l.id === 'apres-00000099') && (await jr(m)).some((l) => l.id === 'apres-00000099') && (await A.ev(() => _foodSupprimesEnAttente().length)) === 1 && !(await A.toasts()).some((x) => SUCCES.test(x)), J({ repasAuCompte: (await jr(m)).length }));
    /* la conséquence honnête, dite et figée : tant que le registre du compte est plein, un AUTRE appareil retrouve le repas au compte */
    const B = await appareil('B', 2, m); await B.restaurer();
    t('B-NS02 E01d (limite assumée, documentée) tant que le registre du compte est plein, la suppression ne se propage PAS : un autre appareil qui restaure retrouve le repas — c\'est le prix du refus explicite, et la personne en a été avertie (E01) ; les 3 000 suppressions DU COMPTE, elles, arrivent sur cet appareil déjà « confirmées »', (await B.journal()).some((l) => l.id === 'sem2-00000002') && (await B.registre()).length === 3000 && (await B.registre()).every((e) => !!e.c), '');
    await A.fermer(); await B.fermer();
  }

  /* ═══ E02 — DEUX APPAREILS MODIFIENT LE MÊME REPAS : les deux versions sont gardées (tests 6, 7, 8) — dans les deux ordres ═══ */
  for (const ordre of ['A-puis-B', 'B-puis-A']) {
    const m = email('e02'); await pool.init(0, m, { code: CODE_PERSO });
    const A = await appareil('A', 1, m), B = await appareil('B', 2, m);
    await A.graine(SEMENCE.map(copie)); await A.sync(); await B.restaurer();
    const revB = (await B.journal()).find((l) => l.id === 'sem1-00000001');
    await A.editerRepas('sem1-00000001', 'diner'); await B.editerRepas('sem1-00000001', 'collation');
    /* ce que CHAQUE appareil a réellement après SA modification, avant toute synchronisation : la référence pour prouver que la synchronisation ne change pas le contenu */
    const localA = (await A.journal()).find((l) => l.id === 'sem1-00000001'), localB = (await B.journal()).find((l) => l.id === 'sem1-00000001');
    const [P, Q] = ordre === 'A-puis-B' ? [A, B] : [B, A];
    await P.sync(); await Q.sync();
    const perdant = Q, gagnantRepas = P === A ? 'diner' : 'collation', perdantRepas = P === A ? 'collation' : 'diner';
    const jq = await perdant.journal(), tq = await perdant.toasts();
    const origine = jq.find((l) => l.id === 'sem1-00000001'), copieQ = jq.find((l) => l.name === 'Pâtes test' && l.id !== 'sem1-00000001');
    t('B-NS02 E02 ⭐⭐⭐ (tests 6, 7, 8 — vrai client, ordre « ' + ordre + ' ») deux appareils modifient le même repas à partir de la même révision (' + (revB && revB.rev) + ') : un seul changement est accepté ; le second reçoit un conflit EXPLICITE et garde les DEUX versions — la ligne d\'origine reprend la version gagnante (' + gagnantRepas + '), la sienne (' + perdantRepas + ') devient un repas à part, un message le dit',
      !!origine && origine.meal === gagnantRepas && origine.rev === 2 && !!copieQ && copieQ.meal === perdantRepas && copieQ.id !== origine.id && !copieQ.rev && tq.some((x) => /modifié sur un autre appareil en même temps/.test(x) && /deux versions/.test(x)), J({ origine: origine && [origine.meal, origine.rev], copieQ: copieQ && [copieQ.meal, copieQ.rev], tq }));
    const sansId = (l) => metier(Object.assign({}, l, { id: 'x' }));
    const [gagnantLocal, perdantLocal] = P === A ? [localA, localB] : [localB, localA];
    t('B-NS02 E02b ⭐ … la synchronisation n\'a changé AUCUNE valeur : la ligne d\'origine est exactement la version GAGNANTE telle qu\'elle était sur son appareil, la copie est exactement la version PERDANTE telle qu\'elle était sur le sien (octet pour octet, hors identité, révision et horodatage) ; les cinq autres repas sont STRICTEMENT ceux de départ',
      !!origine && !!copieQ && sansId(origine) === sansId(gagnantLocal) && sansId(copieQ) === sansId(perdantLocal) && SEMENCE.slice(1).every((s) => metier((jq.find((l) => l.id === s.id)) || {}) === metier(s)), '');
    await perdant.sync();                                                                   // la copie part au compte ; plus aucun conflit, plus de ping-pong
    await P.sync();
    const cj = await jr(m); const zn = await zone(m);
    t('B-NS02 E02c ⭐ … puis tout se stabilise : le compte porte les deux versions (7 repas), la zone de récupération a gardé la version perdante, une nouvelle synchronisation ne crée aucun nouveau conflit (pas de ping-pong), et l\'autre appareil retrouve les deux versions en restaurant',
      cj.length === 7 && cj.filter((l) => l.name === 'Pâtes test').length === 2 && zn.some((z) => z.m === 'conflit') && (await perdant.journal()).length === 7 && (await (async () => { await P.restaurer(); return (await P.journal()).length; })()) === 7 && (await P.toasts()).every((x) => !/modifié sur un autre appareil/.test(x)), J({ n: cj.length, zone: zn.map((z) => z.m) }));
    await A.fermer(); await B.fermer();
  }

  /* ═══ E03 — SUPPRESSION ET MODIFICATION CONCURRENTES (test 10, vrai client), dans les deux ordres ═══ */
  for (const ordre of ['suppression-d-abord', 'modification-d-abord']) {
    const m = email('e03'); await pool.init(0, m, { code: CODE_PERSO });
    const A = await appareil('A', 1, m), B = await appareil('B', 2, m);
    await A.graine(SEMENCE.slice(0, 3).map(copie)); await A.sync(); await B.restaurer();
    await A.supprimer('sem1-00000001'); await B.editerRepas('sem1-00000001', 'diner');
    if (ordre === 'suppression-d-abord') { await A.sync(); await B.sync(); } else { await B.sync(); await A.sync(); }
    await B.redemarrer(); await A.redemarrer();
    const cj = await jr(m); const zn = await zone(m);
    const tb = await B.toasts();
    t('B-NS02 E03 ⭐⭐ (test 10 — vrai client, ordre « ' + ordre + ' ») un appareil supprime pendant que l\'autre modifie le même repas : le repas est ABSENT partout (compte, A, B) — aucune résurrection —, la version modifiée reste récupérable côté serveur' + (ordre === 'suppression-d-abord' ? ', et B en est averti dès sa synchronisation' : ''),
      !cj.some((l) => l.id === 'sem1-00000001') && !(await A.journal()).some((l) => l.id === 'sem1-00000001') && !(await B.journal()).some((l) => l.id === 'sem1-00000001') && cj.length === 2
      && zn.some((z) => z.l.id === 'sem1-00000001' && z.l.meal === 'diner') && (await B.registre()).some((e) => e.i === 'sem1-00000001' && !!e.c) && (await A.registre()).some((e) => e.i === 'sem1-00000001' && !!e.c), J({ cj: cj.map((l) => l.name), zone: zn.map((z) => [z.m, z.l.meal]) }));
    if (ordre === 'suppression-d-abord') {
      /* le message n'est visible qu'AVANT le redémarrage : on rejoue le scénario court pour le lire */
      const m2 = email('e03b'); await pool.init(0, m2, { code: CODE_PERSO });
      const A2 = await appareil('A', 1, m2), B2 = await appareil('B', 2, m2);
      await A2.graine(SEMENCE.slice(0, 2).map(copie)); await A2.sync(); await B2.restaurer();
      await A2.supprimer('sem1-00000001'); await B2.editerRepas('sem1-00000001', 'diner'); await A2.sync(); await B2.sync();
      const t2 = await B2.toasts();
      t('B-NS02 E03b ⭐ B, qui venait de modifier un repas supprimé ailleurs, est PRÉVENU (« supprimé sur un autre appareil ») et la ligne est retirée de son journal — plus de modification fantôme',
        t2.some((x) => /supprimé sur un autre appareil/.test(x)) && !(await B2.journal()).some((l) => l.id === 'sem1-00000001') && (await B2.registre()).some((e) => e.i === 'sem1-00000001' && e.c), J(t2));
      await A2.fermer(); await B2.fermer();
      /* la RESTAURATION seule (sans redémarrage) : une suppression faite ailleurs arrive marquée « confirmée » et retire la ligne */
      const m3 = email('e03c'); await pool.init(0, m3, { code: CODE_PERSO });
      const A3 = await appareil('A', 1, m3), B3 = await appareil('B', 2, m3);
      await A3.graine(SEMENCE.slice(0, 2).map(copie)); await A3.sync(); await B3.restaurer();            // B est ouvert AVANT la suppression : son démarrage ne l'a pas vue
      await A3.supprimer('sem1-00000001'); await A3.sync();
      await B3.restaurer();
      t('B-NS02 E03c ⭐ une suppression faite sur un autre appareil arrive par la RESTAURATION (sans redémarrage) marquée « confirmée » (elle vient du compte) et retire la ligne du journal',
        (await B3.registre()).some((e) => e.i === 'sem1-00000001' && !!e.c) && !(await B3.journal()).some((l) => l.id === 'sem1-00000001'), J(await B3.registre()));
      await A3.fermer(); await B3.fermer();
      /* le DÉMARRAGE seul (sans restauration) : une suppression faite ailleurs arrive marquée « confirmée » et retire la ligne (découvert par la mutation K44 : aucun témoin ne regardait ce chemin) */
      const m4 = email('e03d'); await pool.init(0, m4, { code: CODE_PERSO });
      const A4 = await appareil('A', 1, m4), B4 = await appareil('B', 2, m4);
      await A4.graine(SEMENCE.slice(0, 2).map(copie)); await A4.sync(); await B4.restaurer();
      await A4.supprimer('sem1-00000001'); await A4.sync();
      await B4.redemarrer();
      t('B-NS02 E03d ⭐ une suppression faite sur un autre appareil arrive au DÉMARRAGE (sans restauration) marquée « confirmée » (elle vient du compte) et retire la ligne du journal',
        (await B4.registre()).some((e) => e.i === 'sem1-00000001' && !!e.c) && !(await B4.journal()).some((l) => l.id === 'sem1-00000001'), J(await B4.registre()));
      await A4.fermer(); await B4.fermer();
    }
    await A.fermer(); await B.fermer();
  }

  /* ═══ E04 — COUPURE DU RÉSEAU APRÈS L'ÉCRITURE (test 11, vrai client) ═══ */
  {
    const m = email('e04'); await pool.init(0, m, { code: CODE_PERSO });
    const A = await appareil('A', 1, m);
    await A.graine(SEMENCE.slice(0, 3).map(copie)); await A.sync();
    await A.ev(() => { S.foodLog.push({ id: 'neuf-0000000a', date: new Date().toISOString().slice(0, 10), meal: 'dejeuner', name: 'Repas neuf test', q: 100, u: 'g', kcal: 77.7, prot: 2, carbs: 10, fat: 1, ts: 1760000099999, v: 1, saisie: 'liste', origine: 'reprise', n2: { s: 1, m: 'd', no: [], st: 'declaree' } }); persist(); });
    await A.supprimer('sem3-00000003');
    A.perdreReponse = true;                                                                  // le serveur ÉCRIT, mais la réponse est perdue
    await A.sync();
    const apresCoupure = await A.registre(); const tc = await A.toasts(); const c1 = await compte(m);
    t('B-NS02 E04 ⭐⭐ (test 11 — vrai client) le serveur a écrit mais la réponse est perdue : le client ne la croit PAS — la suppression reste « en attente » (pas de confirmation), un message dit qu\'elle sera renvoyée, rien n\'est effacé, aucun message de succès',
      apresCoupure.some((e) => e.i === 'sem3-00000003' && !e.c && !e.x) && tc.some((x) => /pas encore confirmée par le serveur/.test(x) && /renvoyée/.test(x)) && !tc.some((x) => SUCCES.test(x))
      && (c1.profile.foodSupprimes || []).some((e) => e.i === 'sem3-00000003') && (c1.profile.foodLog || []).some((l) => l.id === 'neuf-0000000a'), J({ apresCoupure, tc }));
    const nAvant = (await jr(m)).length;
    await A.sync();                                                                          // le réseau est revenu : le client RENVOIE
    const reg = await A.registre(); const lj2 = await A.journal(); const c2 = await jr(m);
    t('B-NS02 E04b ⭐⭐ … la nouvelle tentative est confirmée SANS doublon : la suppression passe à « confirmée », le repas neuf n\'est pas dupliqué (une seule fois au compte, avec sa révision), le registre du compte n\'a qu\'une entrée',
      reg.some((e) => e.i === 'sem3-00000003' && !!e.c && !e.x) && c2.length === nAvant && c2.filter((l) => l.id === 'neuf-0000000a').length === 1 && lj2.find((l) => l.id === 'neuf-0000000a').rev === 1 && ((await compte(m)).profile.foodSupprimes || []).length === 1, J({ reg, n: c2.length, nAvant }));
    await A.fermer();
  }

  /* ═══ E05 — LE MIROIR SUPABASE NE REÇOIT JAMAIS UN INSTANTANÉ PARTIEL (test 14) ═══ */
  {
    const m = email('e05'); await pool.init(0, m, { code: CODE_PERSO });
    const miroir = {};                                                                       // le « blob » du compte côté Supabase
    const A = await appareil('A', 1, m, { miroir }), C = await appareil('C', 2, m, { miroir });
    await A.graine(SEMENCE.map(copie)); await A.sync(); await pause(200);
    const apresA = (miroir.foodLog || []).length;
    t('B-NS02 E05 ⭐ (test 14) l\'appareil A, dont le journal couvre tout le compte, voit son accusé dire `complet` : le miroir reçoit alors son journal (6 repas) et son registre — le filet continue de fonctionner',
      apresA === 6 && Array.isArray(miroir.foodSupprimes), J({ apresA }));
    /* C est un appareil NEUF, journal différent et court, qui n'a rien restauré */
    await C.graine([ligne('Seulement sur C', 'cseul-00000001')]);
    const avantC = canon(miroir.foodLog);
    await C.sync(); await pause(200);
    t('B-NS02 E05b ⭐⭐⭐ (test 14) l\'appareil C, au journal court et non restauré, synchronise : le compte garde tout (7 repas), l\'accusé dit `complet:false`, et le miroir NE REÇOIT PAS son journal partiel — il garde exactement les 6 repas de A (un instantané partiel ne remplace jamais l\'historique complet)',
      canon(miroir.foodLog) === avantC && (miroir.foodLog || []).length === 6 && (await jr(m)).length === 7 && !C.miroirRecus.some((d) => 'foodLog' in d || 'foodSupprimes' in d), J({ n: (miroir.foodLog || []).length, recus: C.miroirRecus.map((d) => Object.keys(d).filter((k) => /food/.test(k))) }));
    t('B-NS02 E05c ⭐ … et le miroir reçoit quand même le reste de la sauvegarde de C (profil, pesées… : le filet pour tout ce qui n\'est pas le journal ne dépend d\'aucun accusé « complet ») — UN seul envoi au miroir pour cette synchronisation (pas d\'accusé « complet », donc pas d\'envoi du journal)', C.miroirRecus.length === 1 && C.miroirRecus.every((d) => d.action === 'saveProfile') && C.miroirRecus.some((d) => 'bw' in d || 'name' in d), J(C.miroirRecus.map((d) => Object.keys(d).length)));
    await C.restaurer(); await C.sync(); await pause(200);
    t('B-NS02 E05d ⭐ … une fois C restauré (son journal couvre le compte : 7 repas), son accusé dit `complet` et le miroir reçoit le journal COMPLET (7 repas) — jamais moins que ce qu\'il avait',
      (miroir.foodLog || []).length === 7, J({ n: (miroir.foodLog || []).length }));
    /* réponse illisible (le serveur Apps Script est en panne) : pas d'accusé → le miroir ne reçoit AUCUN journal */
    const miroir2 = Object.assign({}, { foodLog: SEMENCE.map(copie) }); A.miroir = miroir2; A.miroirRecus.length = 0;
    A.reponseIllisible = true; await A.sync(); A.reponseIllisible = false; await pause(150);
    t('B-NS02 E05e ⭐ réponse du serveur ILLISIBLE (panne) : aucun accusé, donc le miroir ne reçoit AUCUN champ du journal ni du registre (il garde ses 6 repas)', !A.miroirRecus.some((d) => 'foodLog' in d || 'foodSupprimes' in d) && miroir2.foodLog.length === 6, J(A.miroirRecus.map((d) => Object.keys(d).filter((k) => /food/.test(k)))));
    /* le serveur Apps Script est INJOIGNABLE (réseau coupé vers lui) : pas d'accusé, mais le filet fonctionne pour tout le reste, tout de suite, sans journal */
    A.miroirRecus.length = 0; A.horsLigne = true; await A.sync(); A.horsLigne = false; await pause(200);
    t('B-NS02 E05f ⭐ Apps Script INJOIGNABLE : le miroir reçoit quand même la sauvegarde (profil, séances…) mais ni le journal ni le registre — le filet ne dépend pas du serveur principal, et ne devient pas une source d\'écrasement',
      A.miroirRecus.length === 1 && !('foodLog' in A.miroirRecus[0]) && !('foodSupprimes' in A.miroirRecus[0]) && ('bw' in A.miroirRecus[0] || 'name' in A.miroirRecus[0]), J(A.miroirRecus.map((d) => Object.keys(d).filter((k) => /food/.test(k)))));
    /* LA PORTE elle-même, appelée directement : par défaut elle retire le journal et le registre de tout envoi ; seule `sbEnvoyerJournal` les autorise */
    A.miroirRecus.length = 0;
    await A.ev(() => { sbEnvoyer({ action: 'saveProfile', bw: 80, foodLog: [{ id: 'x-00000001' }], foodSupprimes: [{ i: 'x-00000001', t: 1 }] }); });
    await pause(250);
    const parDefaut = A.miroirRecus.slice(); A.miroirRecus.length = 0;
    await A.ev(() => { sbEnvoyerJournal([{ id: 'y-00000001' }], [{ i: 'y-00000001', t: 2 }]); });
    await pause(250);
    t('B-NS02 E05g ⭐⭐ la PORTE du miroir (`sbEnvoyer`) retire le journal et le registre de TOUT envoi — même si l\'appelant les a mis dans le corps — ; seule `sbEnvoyerJournal` les laisse passer',
      parDefaut.length === 1 && parDefaut[0].bw === 80 && !('foodLog' in parDefaut[0]) && !('foodSupprimes' in parDefaut[0]) && A.miroirRecus.length === 1 && Array.isArray(A.miroirRecus[0].foodLog) && Array.isArray(A.miroirRecus[0].foodSupprimes), J({ parDefaut, avecJournal: A.miroirRecus }));
    await A.fermer(); await C.fermer();
  }

  /* ═══ E06 — REDÉMARRAGE ET RESTAURATION : les identités et les révisions sont conservées ; les macros des repas non modifiés ne bougent pas d'un octet (tests 15, 16) ═══ */
  {
    const m = email('e06'); await pool.init(0, m, { code: CODE_PERSO });
    const A = await appareil('A', 1, m), B = await appareil('B', 2, m);
    await A.graine(SEMENCE.map(copie)); await A.sync();
    await A.editerRepas('sem1-00000001', 'diner'); await A.sync();            // modifier un repas déjà synchronisé : PAS de faux conflit avec soi-même
    await B.restaurer(); await B.sync();
    const idsAvant = (await A.journal()).map((l) => l.id).sort(), idsB = (await B.journal()).map((l) => l.id).sort();
    await A.redemarrer(); await B.redemarrer();
    const jA = await A.journal(), jB = await B.journal(), sv = await jr(m);
    t('B-NS02 E06 ⭐ (test 15) après restauration puis REDÉMARRAGE de chaque appareil : les 6 identités sont exactement les mêmes partout (A, B, compte), aucune régénérée, aucune perdue, aucun doublon',
      J(jA.map((l) => l.id).sort()) === J(idsAvant) && J(jB.map((l) => l.id).sort()) === J(idsB) && J(idsAvant) === J(idsB) && sv.length === 6 && jA.length === 6 && jB.length === 6, J({ a: jA.length, b: jB.length, s: sv.length }));
    t('B-NS02 E06b ⭐ … et les révisions sont celles du serveur, sur A comme sur B (le repas modifié est à la révision 2, les autres à 1), sans faux conflit : modifier un repas déjà synchronisé n\'a produit AUCUNE copie',
      jA.find((l) => l.id === 'sem1-00000001').rev === 2 && jB.find((l) => l.id === 'sem1-00000001').rev === 2 && jA.filter((l) => l.id !== 'sem1-00000001').every((l) => l.rev === 1) && jB.every((l) => l.rev === sv.find((s) => s.id === l.id).rev), J({ a: jA.map((l) => [l.name, l.rev]), b: jB.map((l) => [l.name, l.rev]) }));
    t('B-NS02 E06c ⭐⭐ (test 16) les MACROS des repas non modifiés sont STRICTEMENT inchangées — octet pour octet, sur A, sur B et au compte, après création, synchronisation, restauration, redémarrage ; et le repas MODIFIÉ est le même partout (la synchronisation, la restauration et le redémarrage n\'y ont rien changé)',
      SEMENCE.slice(1).every((s) => metier(jA.find((l) => l.id === s.id)) === metier(s) && metier(jB.find((l) => l.id === s.id)) === metier(s) && metier(sv.find((l) => l.id === s.id)) === metier(s))
      && [jB, sv].every((j) => metier(j.find((l) => l.id === 'sem1-00000001')) === metier(jA.find((l) => l.id === 'sem1-00000001'))) && [jA, jB, sv].every((j) => j.find((l) => l.id === 'sem1-00000001').meal === 'diner'), '');
    await A.fermer(); await B.fermer();
  }

  /* ═══ E07 — PAS D'ACCUSÉ VALIDE = PAS DE CONFIRMATION (aucune réussite inventée) ═══ */
  {
    const m = email('e07'); await pool.init(0, m, { code: CODE_PERSO });
    const A = await appareil('A', 1, m);
    await A.graine(SEMENCE.slice(0, 2).map(copie)); await A.sync();
    await A.supprimer('sem2-00000002');
    A.reponseIllisible = true; await A.sync(); await A.sync(); A.reponseIllisible = false;
    const reg = await A.registre(), tc = await A.toasts();
    t('B-NS02 E07 ⭐⭐ une réponse qui n\'est PAS un accusé valide (page d\'erreur HTML, ni JSON ni requestId) ne confirme RIEN : la suppression reste en attente, jamais « confirmée » ; aucun message de succès ; un message honnête une seule fois (anti-spam)',
      reg.some((e) => e.i === 'sem2-00000002' && !e.c && !e.x) && !tc.some((x) => SUCCES.test(x)) && tc.filter((x) => /pas encore confirmée/.test(x)).length === 1, J({ reg, tc }));
    /* un accusé VALIDE en soi mais pour une AUTRE requête (réponse ancienne, mélangée) : il ne confirme rien non plus */
    A.autreOperation = true; await A.sync(); A.autreOperation = false;
    t('B-NS02 E07a ⭐⭐ un accusé bien formé (ok:true…) mais qui répond à une AUTRE opération (requestId différent) ne confirme RIEN : la suppression reste en attente',
      (await A.registre()).some((e) => e.i === 'sem2-00000002' && !e.c && !e.x) && ((await A.journal()).find((l) => l.id === 'sem1-00000001') || {}).rev === 1, '');
    await A.sync();
    t('B-NS02 E07b ⭐ … puis, avec un VRAI accusé (ok:true et le requestId de CETTE requête), elle est confirmée', (await A.registre()).some((e) => e.i === 'sem2-00000002' && !!e.c && !e.x), '');
    await A.fermer();
  }

  /* ═══ E10 — NOUVEAU CLIENT + ANCIEN SERVEUR : le serveur n'a pas encore été redéployé (l'ordre inverse de celui qu'on recommande) ═══
     L'ancien serveur répond `{"status":"ok"}` — ni `ok:true`, ni `requestId` : ce n'est PAS un accusé. Le cas le plus réaliste d'« accusé manquant » en production : un client publié avant son serveur. */
  {
    const m = email('e10'); await pool.init(0, m, { code: CODE_PERSO });
    const A = await appareil('A', 1, m);
    await A.graine(SEMENCE.slice(0, 2).map(copie)); await A.sync();
    await A.supprimer('sem2-00000002');
    A.ancienServeur = true; await A.sync(); await A.sync();
    const reg = await A.registre(), tc = await A.toasts(), jr10 = await A.journal();
    t('B-NS02 E10 ⭐⭐ NOUVEAU client + ANCIEN serveur (réponse `{"status":"ok"}`, sans `ok` ni `requestId`) : ce n\'est PAS un accusé — la suppression reste « en attente » (ni confirmée, ni rejetée, ni effacée), le repas reste retiré du journal, aucun message de succès, un seul message honnête',
      reg.some((e) => e.i === 'sem2-00000002' && !e.c && !e.x) && !jr10.some((l) => l.id === 'sem2-00000002') && !tc.some((x) => SUCCES.test(x)) && tc.filter((x) => /pas encore confirmée/.test(x)).length === 1, J({ reg, tc }));
    A.ancienServeur = false; await A.sync();
    t('B-NS02 E10b ⭐ … le serveur redéployé, la MÊME suppression est confirmée à la synchronisation suivante, sans aucun geste et sans doublon (une seule entrée au registre du compte)',
      (await A.registre()).some((e) => e.i === 'sem2-00000002' && !!e.c && !e.x) && ((await compte(m)).profile.foodSupprimes || []).filter((e) => e.i === 'sem2-00000002').length === 1, J(await A.registre()));
    await A.fermer();
  }

  /* ═══ E11 — ACCUSÉ PERDU PUIS MODIFICATION DU MÊME REPAS : limite assumée, MESURÉE (déduite du code avant ce témoin) ═══
     Le repas est créé et appliqué au compte (révision 1), mais l'appareil n'en reçoit jamais l'accusé : il ne connaît pas sa révision. S'il le MODIFIE avant la synchronisation suivante, sa base (0) n'est pas
     la révision du serveur (1) : le serveur ne peut pas distinguer cela d'un conflit. Il le déclare — les deux versions sont gardées. */
  {
    const m = email('e11'); await pool.init(0, m, { code: CODE_PERSO });
    const A = await appareil('A', 1, m);
    await A.graine(SEMENCE.slice(0, 2).map(copie)); await A.sync();
    await A.ev((l) => { S.foodLog.push(l); persist(); }, ligne('Repas à accusé perdu', 'perdu-00000042'));
    A.perdreReponse = true; await A.sync();                                                  // APPLIQUÉ au compte, accusé jamais reçu
    const sansRev = ((await A.journal()).find((l) => l.id === 'perdu-00000042') || {}).rev;
    const auCompte = (await jr(m)).find((l) => l.id === 'perdu-00000042');
    await A.editerRepas('perdu-00000042', 'diner');                                          // modifié AVANT la synchronisation suivante
    await A.sync();
    const jA = await A.journal(), versions = jA.filter((l) => l.name === 'Repas à accusé perdu'), tc = await A.toasts();
    t('B-NS02 E11 (limite assumée, MESURÉE) accusé perdu puis modification du MÊME repas avant la synchronisation suivante : l\'appareil ignore sa révision (base 0) alors que le compte est à 1 — le serveur déclare un conflit avec la propre création de l\'appareil ; les DEUX versions sont gardées (jamais de perte), mais il reste un doublon à supprimer à la main et le message parle d\'« un autre appareil »',
      sansRev === undefined && !!auCompte && auCompte.rev === 1 && versions.length === 2 && versions.some((l) => l.meal === 'diner') && versions.some((l) => l.meal !== 'diner') && tc.some((x) => /modifié sur un autre appareil en même temps/.test(x)), J({ sansRev, auCompte: auCompte && auCompte.rev, versions: versions.map((l) => [l.meal, l.rev]) }));
    await A.fermer();
  }

  /* ═══ E09 — LA REPRISE N'ATTEND AUCUN GESTE : une suppression non confirmée est renvoyée d'elle-même à l'ouverture suivante ═══ */
  {
    const m = email('e09'); await pool.init(0, m, { code: CODE_PERSO });
    const A = await appareil('A', 1, m);
    await A.graine(SEMENCE.slice(0, 2).map(copie)); await A.sync();
    await A.supprimer('sem2-00000002');
    A.reponseIllisible = true; await A.sync(); A.reponseIllisible = false;           // la suppression est en attente (pas d'accusé)
    const avant = (await A.registre()).some((e) => e.i === 'sem2-00000002' && !e.c);
    await A.redemarrer();                                                              // fermeture / réouverture de l'application, SANS rien toucher
    for (let i = 0; i < 40 && !(await A.registre()).some((e) => e.i === 'sem2-00000002' && !!e.c); i++) await pause(400);
    t('B-NS02 E09 ⭐⭐ (reprise, accusé perdu) une suppression que le serveur a APPLIQUÉE mais dont l\'accusé s\'est perdu est retrouvée au compte à l\'ouverture suivante de l\'application, sans aucun geste : elle est confirmée, le compte la porte, la ligne n\'est jamais revenue',
      avant && (await A.registre()).some((e) => e.i === 'sem2-00000002' && !!e.c) && ((await compte(m)).profile.foodSupprimes || []).some((e) => e.i === 'sem2-00000002') && !(await A.journal()).some((l) => l.id === 'sem2-00000002'), J(await A.registre()));
    await A.fermer();
  }

  /* ═══ E12 — LA REPRISE N'ATTEND AUCUN GESTE, cas où le serveur n'a JAMAIS reçu la suppression ═══
     E09 couvre une suppression APPLIQUÉE par le serveur dont l'accusé s'est perdu : l'ouverture suivante la retrouve au compte. Ici le réseau était COUPÉ : le compte l'ignore. Seul un renvoi AUTOMATIQUE peut la lui apprendre
     (découvert par la mutation K43 : sans ce cas, désactiver la synchronisation différée de `persist()` ne faisait rougir aucun témoin). */
  {
    const m = email('e12'); await pool.init(0, m, { code: CODE_PERSO });
    const A = await appareil('A', 1, m);
    await A.graine(SEMENCE.slice(0, 2).map(copie)); await A.sync();
    await A.supprimer('sem2-00000002');
    A.horsLigne = true; await A.sync(); A.horsLigne = false;                           // la requête n'atteint JAMAIS le serveur
    const avant = (await A.registre()).some((e) => e.i === 'sem2-00000002' && !e.c) && !((await compte(m)).profile.foodSupprimes || []).some((e) => e.i === 'sem2-00000002');
    await A.redemarrer();                                                                // fermeture / réouverture, SANS rien toucher
    for (let i = 0; i < 40 && !(await A.registre()).some((e) => e.i === 'sem2-00000002' && !!e.c); i++) await pause(400);
    t('B-NS02 E12 ⭐⭐ (reprise, réseau coupé) une suppression que le serveur n\'a JAMAIS reçue est RENVOYÉE d\'elle-même à l\'ouverture suivante, sans aucun geste : le compte l\'apprend, elle est confirmée, la ligne n\'est jamais revenue',
      avant && (await A.registre()).some((e) => e.i === 'sem2-00000002' && !!e.c) && ((await compte(m)).profile.foodSupprimes || []).some((e) => e.i === 'sem2-00000002') && !(await A.journal()).some((l) => l.id === 'sem2-00000002'), J(await A.registre()));
    await A.fermer();
  }

  /* ═══ E08 — VERROU INDISPONIBLE, côté client : réessayable, rien d'effacé, rien d'inventé ═══ */
  {
    const m = email('e08'); await pool.init(0, m, { code: CODE_PERSO });
    const A = await appareil('A', 1, m);
    await A.graine(SEMENCE.slice(0, 2).map(copie)); await A.sync();
    await A.supprimer('sem2-00000002');
    await pool.regler(1, 'NUT_VERROU_MS_', 300); fs.mkdirSync(path.join(pool.dir, 'verrou'));
    await A.sync();
    const regOccupe = await A.registre(), tOcc = await A.toasts();
    fs.rmdirSync(path.join(pool.dir, 'verrou')); await pool.regler(1, 'NUT_VERROU_MS_', 20000);
    await A.sync();
    t('B-NS02 E08 ⭐ (test 12 — vrai client) serveur OCCUPÉ (verrou indisponible) : réponse réessayable, la suppression reste en attente (ni confirmée, ni rejetée), pas de message de succès ni d\'alarme ; le verrou rendu, la tentative suivante la confirme',
      regOccupe.some((e) => e.i === 'sem2-00000002' && !e.c && !e.x) && !tOcc.some((x) => SUCCES.test(x)) && (await A.registre()).some((e) => e.i === 'sem2-00000002' && !!e.c) && ((await compte(m)).profile.foodSupprimes || []).length === 1, J({ regOccupe, tOcc }));
    await A.fermer();
  }
};
module.exports.fabriquerAppareils = fabriquerAppareils;
