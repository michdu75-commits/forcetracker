/* ═════════════════════════════════════════════════════════════════
   🧪 NUT-REF-HIST-02 (30/10/2026, arbitrage CTO) — « TES REPAS HABITUELS » : TOUT OU RIEN, ET UN CHOIX EXPLICITE.
   Bloc : B-NRH2. Banc : tools/banc_nut_ref_hist02.js. ⚠️ PRÉPARÉ, JAMAIS EXÉCUTÉ À CE JOUR (le GO TESTS n'est pas accordé).

   INVARIANTS (ordre N°1 + arbitrage CTO) :
     · un repas habituel dont UN aliment est bloqué (ancienne fiche non vérifiée / suspecte / sans quantité) n'écrit RIEN avant un choix ;
     · l'ajout partiel est un GESTE (« Ajouter seulement les autres »), jamais un effet de bord ;
     · l'écriture groupée passe par l'écrivain unique (`_n2Enregistrer` accepte un tableau) : TOUT est validé avant le premier effet
       (journal, douane, carnet), puis UNE SEULE insertion — aucun retour arrière ;
     · le panneau est retrouvé par `hab-m-<rang>` (vérifié), jamais par un sélecteur `onclick` ni par `window.event` ;
     · la réparation ouvre la saisie existante : nom prérempli, valeurs vides, quantité exigée, nouvelle ligne DÉCLARÉE, ancienne ligne intacte.

   ⛔ L'oracle est écrit À LA MAIN. ⛔ Données INVENTÉES, aucune donnée réelle, aucun réseau.
   ═════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const J = (x) => JSON.stringify(x);

/* ── les lignes : deux jours d'un même repas, pour que « Tes repas habituels » le propose ── */
const NPV2_OFF = { s: 1, m: 'p', st: 'fiable', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'off', ver: null, fiab: 'source', base: 'g' } };
const NPV2_DEC = { s: 1, m: 'p', st: 'declaree', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'utilisateur', ver: null, fiab: 'declaree', base: 'g' } };
const arr = (x) => Math.round(x);
/* un aliment déclaré par la personne (hors de la frontière : se re-note comme avant) */
const dec = (id, nom, meal, p100, q) => ({ id: id, meal: meal, name: nom, kcal: arr(p100.kcal * q / 100), prot: arr(p100.prot * q / 100), carbs: arr(p100.carbs * q / 100), fat: arr(p100.fat * q / 100),
  q: q, u: 'g', per100: p100, v: 1, saisie: 'manuel', origine: 'utilisateur', sourceId: null, etat: null, n2: NPV2_DEC });
/* une copie d'un ancien scan Open Food Facts, cohérente MAIS sans preuve indépendante : bloquée par la frontière non_verifiee */
const off = (id, nom, meal, sid, p100, q) => ({ id: id, meal: meal, name: nom, kcal: arr(p100.kcal * q / 100), prot: arr(p100.prot * q / 100), carbs: arr(p100.carbs * q / 100), fat: arr(p100.fat * q / 100),
  q: q, u: 'g', per100: p100, v: 1, saisie: 'code-tape', origine: 'off', sourceId: sid, etat: 'tel-que-vendu', n2: NPV2_OFF });

const P = { kcal: 129, prot: 20, carbs: 2, fat: 5 };           // cohérent
const R_ = { kcal: 130, prot: 3, carbs: 28, fat: 0.3 };        // riz
const EAN = { H1: '3000000000701', H2: '3000000000702', H3: '3000000000703', H4: '3000000000704', H5: '3000000000705' };

/* chaque repas existe sur DEUX jours qui lui sont PROPRES : `__D<n>__` = « il y a n jours ». ⚠️ Deux repas qui partagent un jour ET un moment seraient FUSIONNÉS par
   `_repasHabituels` (regroupement par jour + moment) en un seul repas géant, et la liste des habitudes est BORNÉE À 3 : le 1ᵉʳ passage du banc l'a révélé (16 lignes au lieu de 2,
   « Repas introuvable »). Chaque scénario charge donc au plus TROIS repas (`charger`). */
function jeux() {
  const IDX = { V: 0, W: 1, X: 2, Y: 3, P: 4, R: 5, Q: 6, T: 7, M: 8, N: 9, Z: 10, U: 11 };
  const J_ = {};
  const deux = (jeu, suffixe, fabrique) => { const k = IDX[jeu]; (J_[jeu] = J_[jeu] || []).push(fabrique('a' + suffixe, '__D' + (1 + 2 * k) + '__'), fabrique('b' + suffixe, '__D' + (2 + 2 * k) + '__')); };
  const valide = (jeu, [n1, n2]) => { deux(jeu, jeu + '1', (i, d) => Object.assign(dec('h02-' + i + '-0000000', n1, 'diner', R_, 150), { date: d })); deux(jeu, jeu + '2', (i, d) => Object.assign(dec('h02-' + i + '-0000000', n2, 'diner', R_, 150), { date: d })); };
  valide('V', ['Riz H02 valide', 'Lentilles H02 valide']);
  valide('W', ['Riz H02 double', 'Pois H02 double']);
  valide('X', ['Riz H02 faute', 'Mais H02 faute']);
  valide('Y', ['Riz H02 groupe', 'Orge H02 groupe']);
  valide('P', ['Riz H02 persist', 'Mais H02 persist']);
  valide('R', ['Riz H02 rendu', 'Mais H02 rendu']);
  valide('Q', ['Riz H02 panne', 'Mais H02 panne']);
  valide('T', ['Riz H02 prepa', 'Mais H02 prepa']);
  /* M : un aliment déclaré + UN bloqué (ancien scan OFF sans preuve) — déjeuner */
  deux('M', 'M1', (i, d) => Object.assign(dec('h02-' + i + '-0000000', 'Avoine H02 mixte', 'dejeuner', R_, 80), { date: d }));
  deux('M', 'M2', (i, d) => Object.assign(off('h02-' + i + '-0000000', 'Skyr H02 bloque', 'dejeuner', EAN.H1, P, 100), { date: d }));
  /* N : un aliment déclaré + DEUX bloqués — collation */
  deux('N', 'N1', (i, d) => Object.assign(dec('h02-' + i + '-0000000', 'Pain H02 multi', 'collation', R_, 60), { date: d }));
  deux('N', 'N2', (i, d) => Object.assign(off('h02-' + i + '-0000000', 'Thon H02 bloque un', 'collation', EAN.H2, P, 100), { date: d }));
  deux('N', 'N3', (i, d) => Object.assign(off('h02-' + i + '-0000000', 'Flan H02 bloque deux', 'collation', EAN.H3, P, 100), { date: d }));
  /* Z : TOUS bloqués — petit-déjeuner */
  deux('Z', 'Z1', (i, d) => Object.assign(off('h02-' + i + '-0000000', 'Skyr H02 tout bloque', 'petitdej', EAN.H4, P, 100), { date: d }));
  deux('Z', 'Z2', (i, d) => Object.assign(off('h02-' + i + '-0000000', 'Thon H02 tout bloque', 'petitdej', EAN.H5, P, 100), { date: d }));
  /* U : un aliment déclaré + UN bloqué — pour le test « l'état change entre le panneau et le choix » */
  deux('U', 'U1', (i, d) => Object.assign(dec('h02-' + i + '-0000000', 'Seigle H02 etat', 'dejeuner', R_, 80), { date: d }));
  deux('U', 'U2', (i, d) => Object.assign(off('h02-' + i + '-0000000', 'Flan H02 etat', 'dejeuner', '3000000000706', P, 100), { date: d }));
  Object.keys(J_).forEach((k) => { J_[k] = J_[k].map((x, i) => Object.assign({ ts: 1760000000000 + IDX[k] * 1000000 + i * 60000 }, x)); });
  return J_;
}

/* `window.__JEUX` : tous les repas, dates résolues, à chaque chargement ; le journal de départ est VIDE (`charger` choisit ce qui est visible). */
const BASE_FIX = `(() => { try {
  const pad = n => String(n).padStart(2,'0');
  const jour = (k) => { const t = new Date(); t.setDate(t.getDate()-k); return t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate()); };
  const J_ = __JEUX__; Object.keys(J_).forEach(k => { J_[k] = J_[k].map(x => Object.assign({}, x, { date: jour(parseInt(String(x.date).replace(/\\D/g, ''), 10)) })); });
  window.__JEUX = J_;
  if (sessionStorage.getItem('__nrh2')) return; sessionStorage.setItem('__nrh2', '1');
  localStorage.clear();
  localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
  localStorage.setItem('ft4_foodlog', '[]'); localStorage.setItem('ft4_savedfoods', '[]');
} catch (e) {} })();`;

async function ouvrirPage(b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const pg = await cx.newPage();
  const erreurs = [];
  pg.on('pageerror', (e) => erreurs.push(String(e && e.message || e).slice(0, 160)));
  pg.on('dialog', (d) => d.accept());
  await pg.addInitScript(BASE_FIX.replace('__JEUX__', J(jeux())));
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1500);
  return { cx, pg, erreurs };
}

module.exports.ecran = async function ecran(t, b, PORT) {
  console.log('\n-- B-NRH2. Tes repas habituels : tout ou rien, un choix explicite, une écriture groupée sans retour arrière ; redémarrage et fidélité du stockage --');
  const { cx, pg, erreurs } = await ouvrirPage(b, PORT);
  const E = (f, a) => pg.evaluate(f, a);
  const pause = (ms) => pg.waitForTimeout(ms);
  const prete = () => E(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); window.__toasts = []; const v = window.toast; if (!v.__enveloppe) { const w = function (m) { window.__toasts.push(String(m)); try { return v.apply(this, arguments); } catch (e) {} }; w.__enveloppe = true; window.toast = w; } });
  await prete();
  const snap = () => E(() => JSON.stringify([S.foodLog, S.savedFoods || [], S.hiddenFoods || []]));
  const carnet = () => E(() => localStorage.getItem('ft4_douane_obs'));
  const nCarnet = () => E(() => { const c = JSON.parse(localStorage.getItem('ft4_douane_obs') || 'null'); return c ? c.n : 0; });
  const toasts = () => E(() => (window.__toasts || []).slice());
  const razToasts = () => E(() => { window.__toasts = []; });
  const dernier = async () => ((await toasts()).slice(-1)[0] || '');
  const afficher = () => E(() => { goScreen('s-nutrition'); renderFoodJournal(); });
  /* un scénario = un jeu de repas (au plus 3), un état de module remis à zéro, les données persistées */
  const charger = async (cles) => { await E((cl) => { S.foodLog = cl.reduce((a, k) => a.concat(JSON.parse(JSON.stringify(window.__JEUX[k]))), []); S.savedFoods = []; S.hiddenFoods = []; _habNonConfirme = {}; _habDernier = { cle: '', t: 0 }; _habEnCours = 0; window.__toasts = []; persist(); goScreen('s-nutrition'); renderFoodJournal(); }, cles); await pause(300); };
  const hab = (nom) => E((n) => { const h = _repasHabituels(); const i = h.findIndex((x) => x.items.some((it) => it.name === n)); return { i: i, sig: h[i] && h[i].sig, meal: h[i] && h[i].meal, nb: h.length, items: h[i] ? h[i].items.map((x) => x.name) : [] }; }, nom);
  const jouer = async (sig, mom, choix) => { await E((a) => { rejouerRepas(a[0], a[1], a[2]); }, [sig, mom, choix]); await pause(450); };
  const panneau = (i) => E((k) => { const c = document.getElementById('hab-m-' + k); const bx = c && c.querySelector('.hab-choix'); return bx ? { boutons: [...bx.querySelectorAll('button')].map((x) => x.textContent), attrsOnclick: [...bx.querySelectorAll('button')].some((x) => x.hasAttribute('onclick')), texte: bx.querySelector('div') ? bx.querySelector('div').textContent : '' } : null; }, i);
  const cliquer = (i, k) => E(([r, n]) => { const c = document.getElementById('hab-m-' + r); const bs = c && c.querySelectorAll('.hab-choix button'); if (bs && bs[n]) { bs[n].click(); return true; } return false; }, [i, k]);
  const ids = () => E(() => (S.foodLog || []).map((x) => x.id));
  const neuves = (avant) => E((a) => (S.foodLog || []).filter((x) => x && a.indexOf(x.id) < 0).map((x) => JSON.parse(JSON.stringify(x))), avant);
  const enMemoire = (noms) => E((ns) => ns.map((n) => (S.foodLog || []).filter((x) => x && x.name === n && x.date === today()).length), noms);
  const stockees = (noms) => E((ns) => { const l = JSON.parse(localStorage.getItem('ft4_foodlog') || '[]'); return ns.map((n) => l.filter((x) => x && x.name === n && x.date === today()).length); }, noms);
  const stockage = () => E(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
  const attente = () => E(() => Object.keys(_habNonConfirme).length);
  const quotaOn = () => E(() => { if (window.__si) return; window.__si = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'ft4_foodlog') { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; } return window.__si.apply(this, arguments); }; });
  const quotaOff = () => E(() => { if (window.__si) { Storage.prototype.setItem = window.__si; window.__si = null; } });
  const MSG = await E(() => _HAB_MSG_NON_DURABLE);
  const redemarrer = async () => { await pg.reload(); await pause(1800); await prete(); };

  /* ═══ F1 — repas valide · un bloqué · deux bloqués ═══ */
  await charger(['V', 'M', 'N']);
  const hV = await hab('Riz H02 valide'), hM = await hab('Avoine H02 mixte'), hN = await hab('Pain H02 multi');
  t('B-NRH2 N00 la page est prête : 3 repas habituels inventés (un valide · un avec une référence bloquée · un avec deux) et leurs cartes sont affichées',
    hV.i >= 0 && hM.i >= 0 && hN.i >= 0 && hV.nb === 3 && (await E(() => document.querySelectorAll('.hab-moments').length)) === 3, J({ hV, hM, hN }));

  /* ── N01 : tout est admissible → ajout complet, UNE seule insertion, identités et ts distincts ── */
  const avant01 = await ids(); const j01 = await snap();
  await E(() => { window.__pushs = 0; const f = S.foodLog; const o = f.push; f.push = function () { window.__pushs++; return o.apply(this, arguments); }; });
  await jouer(hV.sig, 'collation2');
  const n01 = await neuves(avant01); const pushs01 = await E(() => window.__pushs);
  t('B-NRH2 N01 ⭐⭐ repas ENTIÈREMENT admissible : les 2 aliments sont ajoutés, en UNE SEULE insertion dans le journal (un seul `push`), avec des identités et des `ts` distincts',
    n01.length === 2 && pushs01 === 1 && new Set(n01.map((x) => x.id)).size === 2 && new Set(n01.map((x) => x.ts)).size === 2 && n01.every((x) => x.meal === 'collation2'), J({ n: n01.length, pushs: pushs01 }));
  t('B-NRH2 N12a les anciennes lignes sont intactes après un ajout complet (le journal d\'avant est un préfixe du journal d\'après)',
    (await E((a) => { const av = JSON.parse(a); return JSON.stringify(S.foodLog.slice(0, av[0].length)) === JSON.stringify(av[0]); }, j01)), '');
  await E(() => { delete S.foodLog.push; });

  /* ── N02 : un aliment bloqué → AUCUNE écriture, un panneau à 3 choix, retrouvé par hab-m-<rang> ── */
  await afficher();
  const avant02 = await snap(); const c0 = await carnet();
  await jouer(hM.sig, 'dejeuner');
  const p02 = await panneau(hM.i);
  t('B-NRH2 N02 ⭐⭐ repas avec UNE référence bloquée : RIEN n\'est écrit (journal, favoris, masquages et carnet de la douane identiques à l\'octet) et le panneau propose Réparer · Ajouter seulement l\'autre · Annuler',
    (await snap()) === avant02 && (await carnet()) === c0 && p02 && p02.boutons.length === 3 && /Réparer/.test(p02.boutons[0]) && /Ajouter seulement/.test(p02.boutons[1]) && /Annuler/.test(p02.boutons[2]), J({ p02 }));
  t('B-NRH2 N13 ⭐ le panneau est rattaché à la carte `hab-m-<rang>` et ses boutons n\'ont AUCUN attribut `onclick` (écouteurs créés par le DOM) ; le code n\'emploie ni `window.event` ni sélecteur sur `onclick`',
    !!p02 && p02.attrsOnclick === false && await E(() => {
      const src = [rejouerRepas, _habConteneur, _habChoix, _habReparer].map((f) => f.toString()).join('\n');
      return !/window\.event|\bevent\.target/.test(src) && !/querySelector(All)?\([^)]*onclick/.test(src);
    }), J(p02));
  t('B-NRH2 N02b le message nomme l\'aliment bloqué et dit « rien n\'a été ajouté »', !!p02 && /Skyr H02 bloque/.test(p02.texte) && /Rien n'a été ajouté/.test(p02.texte), J(p02));

  /* ── N04 : Annuler → aucun effet ── */
  await cliquer(hM.i, 2); await pause(150);
  t('B-NRH2 N04 ⭐ « Annuler » : le panneau disparaît et les données sont identiques à l\'octet (journal, favoris, masquages, carnet)',
    (await snap()) === avant02 && (await carnet()) === c0 && (await panneau(hM.i)) === null, '');

  /* ── N14 : fermer / re-rendre sans choisir → aucun ajout ── */
  await jouer(hM.sig, 'dejeuner');
  await E((i) => { _habChoisirMoment('hab-m-' + i); renderFoodJournal(); }, hM.i); await pause(200);
  t('B-NRH2 N14 ⭐ replier la carte ou re-rendre le journal sans choisir : aucun ajout involontaire, le panneau n\'existe plus', (await snap()) === avant02 && (await panneau(hM.i)) === null, '');

  /* ── N16 : un conteneur qui n'est pas CELUI du repas est refusé ── */
  await afficher();
  const inv = await E(([iN, iM, sigM]) => { const r = _repasHabituels().find((x) => x.sig === sigM); return { autre: _habConteneur(iN, r), horsBornes: _habConteneur(9999, r), negatif: _habConteneur(-1, r), bon: !!_habConteneur(iM, r) }; }, [hN.i, hM.i, hM.sig]);
  t('B-NRH2 N16 ⭐⭐ le panneau n\'est rattaché qu\'à la carte qui affiche BIEN ce repas : la carte d\'un autre repas, un rang hors bornes et un rang négatif donnent `null` (donc aucune écriture) ; la bonne carte est acceptée', inv.autre === null && inv.horsBornes === null && inv.negatif === null && inv.bon === true, J(inv));

  /* ── N03 : deux références bloquées → choix explicite ── */
  await jouer(hN.sig, 'collation');
  const p03 = await panneau(hN.i);
  t('B-NRH2 N03 ⭐ repas avec DEUX références bloquées : rien n\'est écrit, le panneau dit « 2 aliments … sont à vérifier » et propose « Ajouter seulement l\'autre »',
    (await snap()) === avant02 && !!p03 && /2 aliments/.test(p03.texte) && /Ajouter seulement l'autre/.test(p03.boutons[1]), J(p03));
  await cliquer(hN.i, 2); await pause(150);

  /* ── N05 : « Ajouter seulement l'autre » → exactement les lignes choisies ── */
  await afficher();
  const avant05 = await ids(); const j05 = await snap();
  await jouer(hM.sig, 'dejeuner'); await cliquer(hM.i, 1); await pause(700);
  const n05 = await neuves(avant05); const th05 = await dernier();
  t('B-NRH2 N05 ⭐⭐ « Ajouter seulement l\'autre » : exactement 1 ligne (l\'aliment admissible), jamais l\'aliment bloqué, et le message nomme ce qui n\'a pas été ajouté',
    n05.length === 1 && n05[0].name === 'Avoine H02 mixte' && n05[0].sourceId == null && /non ajouté \(à vérifier\)/.test(th05) && /Skyr H02 bloque/.test(th05), J({ n05: n05.map((x) => x.name), th05 }));
  t('B-NRH2 N12b les anciennes lignes sont intactes après un ajout partiel choisi', await E((a) => { const av = JSON.parse(a); return JSON.stringify(S.foodLog.slice(0, av[0].length)) === JSON.stringify(av[0]); }, j05), '');

  /* ═══ F2 — « Réparer » : la saisie existante, une nouvelle ligne DÉCLARÉE ═══ */
  await charger(['M']);
  const hM2 = await hab('Avoine H02 mixte');
  await jouer(hM2.sig, 'dejeuner');
  const avant06 = await ids(); const jOff = await E(() => JSON.stringify(S.foodLog.filter((x) => x.name === 'Skyr H02 bloque')));
  await cliquer(hM2.i, 0); await pause(900);
  const ecr = await E(() => ({ ouvert: document.getElementById('ov-add-food').classList.contains('open'), nom: document.getElementById('af-desc').value, kcal: document.getElementById('af-kcal').value, prot: document.getElementById('af-prot').value, bcNutr: !!_bcNutr, sid: !!(_afSrc && _afSrc.sourceId) }));
  t('B-NRH2 N06a ⭐⭐ « Réparer » ouvre la saisie existante : nom prérempli, calories et macros VIDES (l\'ancienne fiche bloquée n\'est pas recopiée), aucune identité ni fiche empruntée, et rien n\'est écrit',
    ecr.ouvert && ecr.nom === 'Skyr H02 bloque' && ecr.kcal === '' && ecr.prot === '' && ecr.bcNutr === false && ecr.sid === false && (await neuves(avant06)).length === 0, J(ecr));
  const saisir = (v) => E((x) => { const ev = (id, val) => { const e = document.getElementById(id); e.value = val; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
    ev('af-kcal', x.k); ev('af-prot', x.p); ev('af-carbs', x.c); ev('af-fat', x.f); }, v);
  const poids = (g) => E((v) => { const e = document.getElementById('af-poids'); if (!e) return false; e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return true; }, g);
  await saisir({ k: '50', p: '30', c: '2', f: '5' }); await pause(300); const aPoids1 = await poids('100'); await pause(300);
  await E(() => { addFoodEntry(); }); await pause(500);
  const n07 = await neuves(avant06);
  t('B-NRH2 N07 ⭐ valeurs INCOHÉRENTES : ou bien refusées (aucune ligne), ou bien — si l\'écran les accepte — écrites comme DÉCLARÉES (`fiab:declaree`, source utilisateur, sans identité) et jamais comme référence vérifiée ; l\'ancien scan est intact',
    aPoids1 && (n07.length === 0 || (n07.length === 1 && n07[0].n2 && n07[0].n2.f && n07[0].n2.f.fiab === 'declaree' && n07[0].n2.f.src === 'utilisateur' && n07[0].sourceId == null)) && (await E(() => JSON.stringify(S.foodLog.filter((x) => x.name === 'Skyr H02 bloque')))) === jOff, J({ n07: n07.map((x) => [x.name, x.n2 && x.n2.f]), refus: await toasts() }));
  const avantV = await ids();
  await saisir({ k: '129', p: '20', c: '2', f: '5' }); await pause(300); await poids('100'); await pause(300);
  await E(() => { addFoodEntry(); }); await pause(600);
  const n06 = await neuves(avantV);
  const nouvelle = n06.length ? n06[n06.length - 1] : (n07[0] || null);
  t('B-NRH2 N06b ⭐⭐ saisie cohérente + quantité : UNE nouvelle ligne DÉCLARÉE (`fiab:declaree`, `src:utilisateur`, `sourceId:null`, pour-100 g TAPÉ), ancienne ligne OFF intacte à l\'octet',
    !!nouvelle && nouvelle.n2.f.fiab === 'declaree' && nouvelle.n2.f.src === 'utilisateur' && nouvelle.sourceId === null && nouvelle.per100 && nouvelle.per100.kcal === 129
    && (await E(() => JSON.stringify(S.foodLog.filter((x) => x.name === 'Skyr H02 bloque' && x.sourceId)))) === jOff, J({ nouvelle: nouvelle && [nouvelle.n2.f, nouvelle.sourceId, nouvelle.per100] }));
  await E(() => { try { closeAddFood(); } catch (e) {} document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); });

  /* ═══ F3 — tous bloqués ═══ */
  await charger(['Z']);
  const hZ = await hab('Skyr H02 tout bloque');
  await jouer(hZ.sig, 'petitdej');
  const pZ = await panneau(hZ.i);
  t('B-NRH2 N03b ⭐ repas dont TOUS les aliments sont bloqués : le panneau ne propose que Réparer et Annuler (aucun ajout partiel possible)', !!pZ && pZ.boutons.length === 2 && /Réparer/.test(pZ.boutons[0]) && /Annuler/.test(pZ.boutons[1]), J(pZ));
  await E(() => { try { closeAddFood(); } catch (e) {} });
  await E(() => { window.__nl = 0; });
  t('B-NRH2 A1-T07 ⭐ tous bloqués : le journal ne reçoit rien non plus par un appel direct à l\'ajout partiel (`choix:autres` sans aliment admissible → « Rien n\'a été ajouté »)',
    await (async () => { const a = await snap(); await jouer(hZ.sig, 'petitdej', 'autres'); return (await snap()) === a && /Rien n'a été ajouté/.test(await dernier()); })(), '');

  /* ═══ F4 — l'état change entre le panneau et le choix · double appui ═══ */
  await charger(['U', 'W']);
  const hU = await hab('Seigle H02 etat'), hW = await hab('Riz H02 double');
  await jouer(hU.sig, 'dejeuner');
  const avant11 = await snap();
  await E(() => { (S.foodLog || []).filter((x) => x.name === 'Seigle H02 etat').forEach((x) => { x.q = null; x.u = null; x.per100 = null; x.n2 = null; }); });
  const avant11b = await snap();
  await cliquer(hU.i, 1); await pause(700);
  t('B-NRH2 N11 ⭐ l\'aliment « admissible » a perdu sa quantité entre l\'affichage du panneau et le choix : le contrôle est refait à l\'écriture, RIEN n\'est écrit', (await snap()) === avant11b && avant11 !== avant11b, J({ toasts: (await toasts()).slice(-2) }));
  await afficher();
  const avant08 = await ids();
  const dbl = await E((s) => { rejouerRepas(s, 'collation2'); rejouerRepas(s, 'collation2'); return true; }, hW.sig); await pause(500);
  const n08 = await neuves(avant08);
  t('B-NRH2 N08 ⭐ double appui sur le même repas, au même moment, dans la même seconde : UN seul ajout (2 lignes), pas 4', dbl && n08.length === 2, J({ n: n08.length }));
  const rej = await E(() => { const l = S.foodLog[S.foodLog.length - 1]; const e = { id: l.id, ts: Date.now(), date: l.date, repas: l.meal, nom: 'Doublon', origine: { saisie: 'manuel', origine: 'utilisateur' }, mode: 'declaree', declare: { kcal: 100 }, quantite: { val: 100, unite: 'g', origine: 'tapee' } };
    const n0 = S.foodLog.length; const c = localStorage.getItem('ft4_douane_obs'); const r = _n2Enregistrer([e], 'test'); return { ok: r.ok, erreur: r.erreur, n: S.foodLog.length - n0, carnetIdentique: localStorage.getItem('ft4_douane_obs') === c }; });
  t('B-NRH2 N08b ⭐ l\'écrivain unique refuse une identité déjà au journal (`ID_EXISTANT`) : rien n\'est écrit, le carnet de la douane ne bouge pas', rej.ok === false && rej.erreur === 'ID_EXISTANT' && rej.n === 0 && rej.carnetIdentique === true, J(rej));

  /* ═══ F5 — exceptions, panne du moteur, douane qui lève ═══ */
  await charger(['X', 'Y']);
  const hX = await hab('Riz H02 faute'), hY = await hab('Riz H02 groupe');
  const avant09 = await snap(); const c09 = await carnet();
  await E(() => { window.__apercuOrig = _n2Apercu; window._n2Apercu = function () { throw new Error('faute injectée (préparation)'); }; });
  await jouer(hX.sig, 'collation2');
  await E(() => { window._n2Apercu = window.__apercuOrig; });
  t('B-NRH2 N09 ⭐⭐ exception pendant la préparation : AUCUNE écriture, aucun compteur de douane, un message d\'erreur — et le verrou anti-double-appui est relâché',
    (await snap()) === avant09 && (await carnet()) === c09 && /erreur technique/.test(await dernier()), '');
  const avant09b = await ids();
  await pause(1000); await jouer(hX.sig, 'collation2');
  t('B-NRH2 N09b après cette faute, le rejeu suivant fonctionne (le verrou n\'est pas resté bloqué)', (await neuves(avant09b)).length === 2, '');
  const avant10 = await snap(); const c10 = await carnet();
  await E(() => {
    /* NUT2 est GELÉ (Object.freeze) : on ne peut pas y poser de faute. On corrompt à la place la 2ᵉ entrée du groupe juste avant l'écrivain unique (quantité négative) : c'est le moteur réel qui la refuse. */
    window.__eo = window._n2Enregistrer;
    window._n2Enregistrer = function (en) { if (Array.isArray(en) && en.length > 1) { en[1].quantite = { val: -5, unite: 'g', origine: 'proposee' }; } return window.__eo.apply(this, arguments); };
  });
  await jouer(hY.sig, 'collation2');
  await E(() => { window._n2Enregistrer = window.__eo; });
  t('B-NRH2 N10 ⭐⭐ le moteur REFUSE la 2ᵉ ligne du groupe au moment d\'écrire : AUCUNE ligne écrite (pas même la 1ʳᵉ), carnet de la douane inchangé, aucun retour arrière nécessaire — la validation est entière AVANT le premier effet',
    (await snap()) === avant10 && (await carnet()) === c10, J({ toast: await dernier() }));
  await pause(1000);
  const avant10b = await ids();
  await E(() => { window.__dl = window._douaneLigne; window._douaneLigne = function () { throw new Error('douane en panne'); }; });
  await jouer(hY.sig, 'collation2');
  await E(() => { window._douaneLigne = window.__dl; });
  t('B-NRH2 N10b la douane est de l\'observation : si elle lève une exception, le groupe est tout de même écrit en entier (2 lignes)', (await neuves(avant10b)).length === 2, J({ toast: await dernier() }));
  /* A1-T01c : exception APRÈS l'insertion */
  await pause(1000); await razToasts();
  const avantX = await ids();
  await E(() => { window.__rajOrig2 = window._n2Reajouter; window._n2Reajouter = function (a, b, c, d, apercu) { const r = window.__rajOrig2.apply(this, arguments); if (!apercu) throw new Error('exception APRÈS l\'insertion'); return r; }; });
  await jouer(hX.sig, 'collation');
  await E(() => { window._n2Reajouter = window.__rajOrig2; });
  const tousX = await toasts();
  t('B-NRH2 A1-T01c ⭐⭐ une exception tombe APRÈS que l\'écriture a inséré : on REGARDE le journal (il a grandi) — les 2 lignes existent, aucun « Rien n\'a été ajouté », le post-traitement a lieu (lignes durables), rien n\'est en attente, aucune ré-insertion',
    (await neuves(avantX)).length === 2 && J(await stockees(['Riz H02 faute', 'Mais H02 faute'])) === J([2, 2]) && !tousX.some((m) => /Rien n'a été ajouté/.test(m)) && (await attente()) === 0, J({ toasts: tousX.slice(-2), mem: await enMemoire(['Riz H02 faute']), sto: await stockees(['Riz H02 faute']) }));

  /* ═══ F6 — A1 : échec avant insertion · sauvegarde en panne · rendu en panne · nouvelle tentative ═══ */
  await charger(['T', 'P', 'R']);
  const hT = await hab('Riz H02 prepa'), hP = await hab('Riz H02 persist'), hR = await hab('Riz H02 rendu');
  const avantT01 = await snap(); const ls01 = await stockage();
  await E(() => { window.__rajOrig = window._n2Reajouter; window._n2Reajouter = function (a, b, c, d, apercu) { if (apercu) return window.__rajOrig.apply(this, arguments); throw new Error('écriture en panne (avant insertion)'); }; });
  await jouer(hT.sig, 'collation2');
  await E(() => { window._n2Reajouter = window.__rajOrig; });
  const cle01 = hT.sig + '|collation2|';
  const etat01 = await E(() => ({ attente: Object.keys(_habNonConfirme).length, dernier: _habDernier.cle, enCours: _habEnCours }));
  t('B-NRH2 A1-T01 ⭐⭐ échec AVANT l\'insertion (l\'écriture lève une exception) : aucune ligne, journal et stockage identiques à l\'octet, « Rien n\'a été ajouté » (vrai ici), aucun verrou résiduel',
    (await snap()) === avantT01 && J(await stockage()) === J(ls01) && /Rien n'a été ajouté/.test(await dernier()) && etat01.attente === 0 && etat01.dernier !== cle01 && etat01.enCours === 0, J({ etat01, toast: await dernier() }));
  const avantT01b = await ids();
  await jouer(hT.sig, 'collation2');
  t('B-NRH2 A1-T01b la nouvelle tentative immédiate fonctionne (rien n\'avait été inséré, rien n\'est bloqué) : 2 lignes, une seule fois', (await neuves(avantT01b)).length === 2, '');

  await afficher(); await pause(1000); await razToasts();
  const avantP = await ids();
  await E(() => { window.__enreg = 0; window.__eo2 = window._n2Enregistrer; window._n2Enregistrer = function () { window.__enreg++; return window.__eo2.apply(this, arguments); }; });
  await quotaOn();
  await jouer(hP.sig, 'collation2');
  const tousP = await toasts(); const nP = await neuves(avantP);
  const memP = await enMemoire(['Riz H02 persist', 'Mais H02 persist']), durP = await stockees(['Riz H02 persist', 'Mais H02 persist']);
  const cleP = hP.sig + '|collation2|';
  const pend = await E((k) => (_habNonConfirme[k] || []).length, cleP);
  t('B-NRH2 A1-T02 ⭐⭐ la sauvegarde locale échoue APRÈS l\'insertion (stockage plein) : les 2 lignes EXISTENT en mémoire mais PAS dans le stockage, le message est EXACT (« l\'enregistrement local durable n\'est PAS confirmé »), jamais « Rien n\'a été ajouté », une seule insertion, aucune ligne supprimée',
    nP.length === 2 && J(memP) === J([1, 1]) && J(durP) === J([0, 0]) && tousP.includes(MSG) && !tousP.some((m) => /Rien n'a été ajouté/.test(m)) && /enregistrement local durable n'est PAS confirmé/.test(MSG) && pend === 2 && (await E(() => window.__enreg)) === 1, J({ memP, durP, pend, toasts: tousP.slice(-3) }));
  await pause(1000); await razToasts();
  await jouer(hP.sig, 'collation2');
  t('B-NRH2 A1-T04a ⭐⭐ nouvelle tentative PENDANT la panne de stockage : aucune ré-insertion (toujours 1 ligne de chaque), le même message exact', J(await enMemoire(['Riz H02 persist', 'Mais H02 persist'])) === J([1, 1]) && (await dernier()) === MSG && (await E(() => window.__enreg)) === 1, J({ toast: await dernier() }));
  const avantAutre = await ids();
  await jouer(hT.sig, 'diner');
  t('B-NRH2 A1-T04b ⭐⭐ un AUTRE repas (autre clé) n\'est pas empêché par la sauvegarde en attente : il est inséré normalement, et les DEUX attentes coexistent (une table, pas une case : aucune n\'est écrasée)', (await neuves(avantAutre)).length === 2 && (await attente()) === 2, J({ attente: await attente() }));
  await quotaOff(); await pause(1000); await razToasts();
  await jouer(hP.sig, 'collation2');
  t('B-NRH2 A1-T04c ⭐⭐ le stockage répond de nouveau : le geste RETENTE la sauvegarde sans rien ré-insérer (toujours 1 ligne de chaque en mémoire), les lignes sont maintenant DURABLES (le repas d\'à côté, en attente lui aussi, est confirmé du même coup), message « Enregistrement local confirmé », plus rien en attente',
    J(await enMemoire(['Riz H02 persist', 'Mais H02 persist'])) === J([1, 1]) && J(await stockees(['Riz H02 persist', 'Mais H02 persist'])) === J([1, 1]) && /Enregistrement local confirmé/.test(await dernier()) && (await attente()) === 0 && (await E(() => window.__enreg)) === 2, J({ toast: await dernier(), attente: await E(() => Object.keys(_habNonConfirme)) }));
  await pause(1000);
  await jouer(hP.sig, 'collation2');
  t('B-NRH2 A1-T04d ⭐ une fois la sauvegarde confirmée, un NOUVEAU geste sur le même repas est un vrai nouvel ajout (2 lignes de chaque) : les ajouts légitimes ultérieurs ne sont jamais bloqués', J(await enMemoire(['Riz H02 persist', 'Mais H02 persist'])) === J([2, 2]), '');
  await E(() => { window._n2Enregistrer = window.__eo2; });

  await afficher(); await pause(1000); await razToasts();
  const avantR = await ids();
  await E(() => { window.__rjOrig = window.renderFoodJournal; window.renderFoodJournal = function () { throw new Error('rendu en panne'); }; });
  await jouer(hR.sig, 'collation2');
  await E(() => { window.renderFoodJournal = window.__rjOrig; });
  const tousR = await toasts();
  t('B-NRH2 A1-T03 ⭐⭐ le rendu échoue APRÈS l\'insertion : les 2 lignes existent ET sont durables, le message parle d\'affichage (« rouvre l\'écran »), jamais « Rien n\'a été ajouté », rien en attente, aucune ré-insertion',
    (await neuves(avantR)).length === 2 && J(await stockees(['Riz H02 rendu', 'Mais H02 rendu'])) === J([1, 1]) && tousR.some((m) => /l'affichage n'a pas pu se rafraîchir/.test(m)) && !tousR.some((m) => /Rien n'a été ajouté/.test(m)) && (await attente()) === 0, J({ toasts: tousR.slice(-2) }));

  /* ═══ F7 — A2 : panne DANS l'insertion groupée ═══ */
  await charger(['Q']);
  const hQ = await hab('Riz H02 panne');
  const avantQ = await snap(); const lsQ = await stockage(); const carnetQ = await nCarnet();
  await E(() => { window.__pushPanne = 0; S.foodLog.push = function () { window.__pushPanne++; throw new Error('push en panne'); }; });
  await jouer(hQ.sig, 'collation2');
  const apresQ = await snap(); const lsQ2 = await stockage(); const carnetQ2 = await nCarnet();
  const nPush = await E(() => window.__pushPanne);
  t('B-NRH2 A2-T01 ⭐⭐ panne dans l\'insertion groupée elle-même : le journal est INCHANGÉ à l\'octet, l\'insertion n\'est tentée qu\'UNE fois (aucune ré-insertion automatique), le message est « Rien n\'a été ajouté (erreur technique) » — vrai, rien n\'a été inséré — et rien n\'est en attente',
    apresQ === avantQ && nPush === 1 && /Rien n'a été ajouté \(erreur technique\)/.test(await dernier()) && (await attente()) === 0, J({ nPush, toast: await dernier() }));
  const autresCles = (o) => J(Object.keys(o).filter((k) => k !== 'ft4_douane_obs').sort().map((k) => [k, o[k]]));
  t('B-NRH2 A2-T02 ⭐⭐ LIMITE DÉCLARÉE, mesurée : la douane a DÉJÀ compté les 2 lignes (le carnet `ft4_douane_obs` avance de 2 alors que le journal n\'a rien reçu) ; tous les AUTRES effets de stockage sont nuls — le compteur est de l\'observation, il ne contient aucune donnée de repas. L\'opération n\'est PAS présentée comme totalement atomique.',
    carnetQ2 - carnetQ === 2 && autresCles(lsQ2) === autresCles(lsQ), J({ avant: carnetQ, apres: carnetQ2, memeStockage: autresCles(lsQ2) === autresCles(lsQ) }));
  await E(() => { delete S.foodLog.push; });
  const avantQb = await ids();
  await jouer(hQ.sig, 'collation2');
  t('B-NRH2 A2-T02b après la panne, une nouvelle tentative (push rétabli) insère le repas UNE fois : 2 lignes, pas de doublon, rien n\'était verrouillé', (await neuves(avantQb)).length === 2, '');

  /* ═══ F8 — A1-R : REDÉMARRAGE (rechargement réel de la page) APRÈS une panne de stockage ═══
     La table `_habNonConfirme` est en MÉMOIRE : elle disparaît au rechargement. Ces témoins MESURENT ce que cela change, ils ne l'espèrent pas. */
  await charger(['P', 'V']);
  const hP8 = await hab('Riz H02 persist'), hV8 = await hab('Riz H02 valide');
  const histP = await stockees(['Riz H02 persist']);  // l'historique des 2 jours précédents n'est pas daté d'aujourd'hui : 0
  const brutAvant = await E(() => localStorage.getItem('ft4_foodlog'));
  await quotaOn();
  await jouer(hP8.sig, 'collation2');
  const msgR1 = await toasts();
  const memR1 = await enMemoire(['Riz H02 persist', 'Mais H02 persist']);
  await quotaOff();   // (le rechargement remet de toute façon un stockage sain)
  await redemarrer();
  const apresR1 = await E(() => ({ aujourdhui: ['Riz H02 persist', 'Mais H02 persist'].map((n) => (S.foodLog || []).filter((x) => x.name === n && x.date === today()).length), total: (S.foodLog || []).length, attente: Object.keys(_habNonConfirme).length, brut: localStorage.getItem('ft4_foodlog') }));
  t('B-NRH2 A1-R1 ⭐⭐ PANNE TOTALE puis REDÉMARRAGE : les 2 lignes (présentes à l\'écran) sont PERDUES au rechargement — perte ANNONCÉE (le message disait « PAS confirmé… si tu fermes l\'application maintenant, il sera perdu »), jamais silencieuse ; le stockage est resté EXACTEMENT celui d\'avant (aucune corruption, aucune demi-ligne) ; la table d\'attente n\'existe plus',
    J(memR1) === J([1, 1]) && msgR1.includes(MSG) && /il sera perdu/.test(MSG) && J(apresR1.aujourdhui) === J([0, 0]) && apresR1.brut === brutAvant && apresR1.attente === 0, J({ memR1, apresR1: { a: apresR1.aujourdhui, att: apresR1.attente, memeBrut: apresR1.brut === brutAvant } }));
  await afficher(); await pause(400);
  const hP8b = await hab('Riz H02 persist');
  const avantR1b = await ids();
  await jouer(hP8b.sig, 'collation2');
  t('B-NRH2 A1-R2 ⭐⭐ après le redémarrage, ré-ajouter le même repas ne crée AUCUN doublon (l\'original est perdu, donc il n\'y a rien à doubler) : exactement 1 ligne de chaque, et cette fois DURABLES',
    J(await enMemoire(['Riz H02 persist', 'Mais H02 persist'])) === J([1, 1]) && J(await stockees(['Riz H02 persist', 'Mais H02 persist'])) === J([1, 1]) && (await neuves(avantR1b)).length === 2, '');

  /* DEUX repas en attente, puis redémarrage */
  await charger(['P', 'V']);
  const hP9 = await hab('Riz H02 persist'), hV9 = await hab('Riz H02 valide');
  await quotaOn();
  await jouer(hP9.sig, 'collation2'); await pause(1000); await jouer(hV9.sig, 'collation2');
  const att9 = await attente();
  await quotaOff(); await redemarrer();
  const ap9 = await E(() => ({ p: ['Riz H02 persist', 'Mais H02 persist'].map((n) => (S.foodLog || []).filter((x) => x.name === n && x.date === today()).length), v: ['Riz H02 valide', 'Lentilles H02 valide'].map((n) => (S.foodLog || []).filter((x) => x.name === n && x.date === today()).length) }));
  t('B-NRH2 A1-R3 ⭐ DEUX repas en attente (les deux annoncés « PAS confirmé ») puis redémarrage : les deux sont perdus ensemble (pas l\'un sans l\'autre, pas de demi-repas), table vide, journal d\'avant intact', att9 === 2 && J(ap9.p) === J([0, 0]) && J(ap9.v) === J([0, 0]), J({ att9, ap9 }));
  await afficher(); await pause(400);
  const h9p = await hab('Riz H02 persist'), h9v = await hab('Riz H02 valide');
  await jouer(h9p.sig, 'collation2'); await pause(1000); await jouer(h9v.sig, 'collation2');
  t('B-NRH2 A1-R4 ⭐ ré-ajouter les deux après redémarrage : exactement un de chaque (aucun doublon), durables', J(await stockees(['Riz H02 persist', 'Mais H02 persist', 'Riz H02 valide', 'Lentilles H02 valide'])) === J([1, 1, 1, 1]), '');

  /* panne PARTIELLE : un repas durable, puis un repas non durable, puis redémarrage */
  await charger(['P', 'V']);
  const hP10 = await hab('Riz H02 persist'), hV10 = await hab('Riz H02 valide');
  await jouer(hV10.sig, 'collation2'); await pause(1000);
  await quotaOn(); await jouer(hP10.sig, 'collation2');
  const att10 = await attente();
  await quotaOff(); await redemarrer();
  const ap10 = await E(() => ({ p: ['Riz H02 persist', 'Mais H02 persist'].map((n) => (S.foodLog || []).filter((x) => x.name === n && x.date === today()).length), v: ['Riz H02 valide', 'Lentilles H02 valide'].map((n) => (S.foodLog || []).filter((x) => x.name === n && x.date === today()).length) }));
  t('B-NRH2 A1-R5 ⭐⭐ panne PARTIELLE (un repas sauvegardé, le suivant non) puis redémarrage : le repas durable SURVIT en un exemplaire, celui qui n\'avait pas été confirmé est perdu — chacun conforme à ce que le message lui avait annoncé, aucun mélange',
    att10 === 1 && J(ap10.v) === J([1, 1]) && J(ap10.p) === J([0, 0]), J({ att10, ap10 }));

  /* récupération du stockage AVANT le redémarrage */
  await charger(['P']);
  const hP11 = await hab('Riz H02 persist');
  await quotaOn(); await jouer(hP11.sig, 'collation2');
  await quotaOff(); await pause(1000); await jouer(hP11.sig, 'collation2');
  const conf11 = /Enregistrement local confirmé/.test(await dernier());
  await redemarrer();
  const ap11 = await E(() => ['Riz H02 persist', 'Mais H02 persist'].map((n) => (S.foodLog || []).filter((x) => x.name === n && x.date === today()).length));
  t('B-NRH2 A1-R6 ⭐⭐ le stockage répond de nouveau AVANT le redémarrage et la personne retouche le repas : sauvegarde confirmée sans ré-insertion, et après redémarrage le repas existe EXACTEMENT une fois (ni perdu, ni doublé)', conf11 && J(ap11) === J([1, 1]), J({ conf11, ap11 }));

  /* FAUX NÉGATIF : la sauvegarde a RÉUSSI mais la relecture échoue → message d'alerte à tort ; la personne obéit au message APRÈS un redémarrage */
  await charger(['P']);
  const hP12 = await hab('Riz H02 persist');
  await E(() => { window.__gi = Storage.prototype.getItem; Storage.prototype.getItem = function (k) { if (k === 'ft4_foodlog' && window.__relecture) return '{illisible'; return window.__gi.apply(this, arguments); }; window.__relecture = true; });
  await jouer(hP12.sig, 'collation2');
  const alerte12 = (await toasts()).includes(MSG);
  await E(() => { window.__relecture = false; Storage.prototype.getItem = window.__gi; });
  await redemarrer();
  const ap12 = await E(() => ['Riz H02 persist', 'Mais H02 persist'].map((n) => (S.foodLog || []).filter((x) => x.name === n && x.date === today()).length));
  await afficher(); await pause(400);
  const h12 = await hab('Riz H02 persist');
  await jouer(h12.sig, 'collation2');
  const ap12b = await E(() => ['Riz H02 persist', 'Mais H02 persist'].map((n) => (S.foodLog || []).filter((x) => x.name === n && x.date === today()).length));
  t('B-NRH2 A1-R7 ⭐⭐ LIMITE DÉCLARÉE, mesurée : relecture impossible alors que l\'écriture a RÉUSSI (fausse alerte « PAS confirmé ») — après redémarrage le repas EST au journal (1 exemplaire, rien de perdu) ; si la personne suit alors le message et retouche le repas, la table d\'attente n\'existe plus : un DOUBLON est créé (2 exemplaires). L\'anti-doublon n\'est fiable que PENDANT la session ; après un redémarrage, c\'est le journal affiché qui fait foi.',
    alerte12 && J(ap12) === J([1, 1]) && J(ap12b) === J([2, 2]), J({ alerte12, ap12, ap12b }));

  /* ═══ F9 — A2-I : FIDÉLITÉ du stockage relu (`_habDurable` prouve-t-il un contenu, ou seulement une présence ?) ═══ */
  await charger(['V']);
  const base = [
    { id: 'i-0000001', ts: 1, date: '2026-10-30', meal: 'diner', name: 'Riz test', q: 150, u: 'g', kcal: 195, prot: 5, carbs: 42, fat: 0, sourceId: null, per100: { kcal: 130, prot: 3, carbs: 28, fat: 0.3 }, n2: { s: 1 } },
    { id: 'i-0000002', ts: 2, date: '2026-10-30', meal: 'diner', name: 'Pois test', q: 100, u: 'g', kcal: 80, prot: 5, carbs: 14, fat: 0.4, sourceId: null, per100: { kcal: 80, prot: 5, carbs: 14, fat: 0.4 }, n2: { s: 1 } },
  ];
  const verdict = (stocke, memoire) => E(([st, mem]) => { const o = localStorage.getItem('ft4_foodlog'); localStorage.setItem('ft4_foodlog', typeof st === 'string' ? st : JSON.stringify(st)); try { return _habDurable(mem); } finally { localStorage.setItem('ft4_foodlog', o); } }, [stocke, memoire]);
  const clone = () => JSON.parse(J(base));
  const modif = (i, k, v) => { const c = clone(); c[i][k] = v; return c; };
  t('B-NRH2 A2-I1 ⭐⭐ référence : un stockage FIDÈLE est confirmé ; l\'ordre différent des lignes, un `ts` différent et des métadonnées du moteur différentes ne comptent pas (détails volatils)',
    (await verdict(clone(), base)) === true && (await verdict(clone().reverse(), base)) === true && (await verdict(modif(0, 'ts', 999).map((x) => Object.assign(x, { n2: { s: 2, autre: true } })), base)) === true && (await verdict(clone().concat([{ id: 'autre-0000001', name: 'Autre', date: '2026-10-29', meal: 'diner', q: 1, u: 'g', kcal: 1 }]), base)) === true, '');
  t('B-NRH2 A2-I2 ⭐⭐ identité PRÉSENTE mais calories modifiées : NON confirmé (présence ≠ fidélité)', (await verdict(modif(0, 'kcal', 196), base)) === false, '');
  t('B-NRH2 A2-I3 ⭐⭐ identité présente mais protéines, glucides ou lipides modifiés : NON confirmé (les trois)', (await verdict(modif(0, 'prot', 6), base)) === false && (await verdict(modif(1, 'carbs', 15), base)) === false && (await verdict(modif(1, 'fat', 0.5), base)) === false, '');
  t('B-NRH2 A2-I4 ⭐⭐ identité présente mais quantité ou unité différente : NON confirmé', (await verdict(modif(0, 'q', 100), base)) === false && (await verdict(modif(0, 'u', 'ml'), base)) === false, '');
  t('B-NRH2 A2-I5 ⭐⭐ identité présente mais moment ou jour incorrects : NON confirmé', (await verdict(modif(0, 'meal', 'dejeuner'), base)) === false && (await verdict(modif(1, 'date', '2026-10-29'), base)) === false, '');
  t('B-NRH2 A2-I6 ⭐⭐ identité présente EN DOUBLE dans le stockage : NON confirmé (deux lignes de la même identité = journal ambigu)', (await verdict(clone().concat([clone()[0]]), base)) === false, '');
  t('B-NRH2 A2-I7 ⭐⭐ une seule ligne sauvegardée sur un repas de plusieurs aliments : NON confirmé (tout ou rien, jamais « à moitié durable »)', (await verdict(clone().slice(0, 1), base)) === false && (await verdict(clone().slice(1), base)) === false, '');
  t('B-NRH2 A2-I8 ⭐⭐ le stockage contient une ANCIENNE version de la ligne (même identité, anciennes valeurs) : NON confirmé', (await verdict(modif(0, 'name', 'Riz test (ancien nom)'), base)) === false && (await verdict(Object.assign(clone(), { 0: Object.assign(clone()[0], { per100: { kcal: 120, prot: 3, carbs: 26, fat: 0.3 } }) }), base)) === false, '');
  t('B-NRH2 A2-I9 ⭐⭐ stockage illisible : JSON invalide, valeur qui n\'est pas une liste, clé absente, liste vide → NON confirmé, sans lever d\'exception', (await verdict('{illisible', base)) === false && (await verdict('{"a":1}', base)) === false && (await verdict('[]', base)) === false && (await verdict('null', base)) === false, '');
  t('B-NRH2 A2-I10 ⭐ aucune ligne à confirmer → NON confirmé (une liste vide ne prouve rien) ; la lecture du stockage qui LÈVE une exception → NON confirmé', (await verdict(clone(), [])) === false && (await E((m) => { const g = Storage.prototype.getItem; Storage.prototype.getItem = function () { throw new Error('stockage inaccessible'); }; try { return _habDurable(m); } finally { Storage.prototype.getItem = g; } }, base)) === false, '');
  /* de bout en bout : une sauvegarde qui écrit une copie ALTÉRÉE n'est jamais annoncée « confirmée » */
  await charger(['P']);
  const hP13 = await hab('Riz H02 persist');
  await E(() => { window.__si3 = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'ft4_foodlog') { try { const l = JSON.parse(v); const x = l.find((y) => y && y.name === 'Riz H02 persist' && y.date === today()); if (x) x.kcal = (x.kcal || 0) + 1; v = JSON.stringify(l); } catch (e) {} } return window.__si3.call(this, k, v); }; });
  await jouer(hP13.sig, 'collation2');
  await E(() => { Storage.prototype.setItem = window.__si3; });
  t('B-NRH2 A2-I11 ⭐⭐ de bout en bout : une sauvegarde qui écrit la ligne avec des calories ALTÉRÉES (+1 kcal) n\'est jamais annoncée « confirmée » — l\'alerte « PAS confirmé » est affichée, et le repas est mis en attente', (await toasts()).includes(MSG) && (await attente()) === 1, J({ toasts: (await toasts()).slice(-2) }));

  /* ═══ lecture de la source : l'écrivain unique, le post-traitement, la provenance ═══ */
  const src = fs.readFileSync(path.join(__dirname, '..', '..', 'app.js'), 'utf8');
  const corps = (nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; let d = 0; for (let j = src.indexOf('{', i); j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}') { d--; if (d === 0) return src.slice(i, j + 1); } } return ''; };
  const EN = corps('_n2Enregistrer'), RA = corps('_n2Reajouter'), RJ = corps('rejouerRepas'), AP = corps('_habApresInsertion'), RE = corps('_habReessayer'), PU = corps('_habPurger'), DU = corps('_habDurable');
  const QF = corps('quickFillFood'), QA = corps('quickAddFood');
  t('B-NRH2 S1 ⭐ `_n2Enregistrer` reste l\'écrivain UNIQUE : exactement un `foodLog.push(` dans app.js, et c\'est le sien ; le groupe est un tableau du même chemin',
    (src.match(/foodLog\.push\(/g) || []).length === 1 && /foodLog\.push\(/.test(EN) && /Array\.isArray\(entree\)/.test(EN), '');
  const iVal = EN.indexOf('N.ligneNouvelle(e)'), iDou = EN.indexOf('_douaneLigne('), iIns = EN.indexOf('foodLog.push(');
  t('B-NRH2 S2 ⭐⭐ ORDRE des temps dans l\'écrivain unique : la validation du moteur PRÉCÈDE la douane, qui PRÉCÈDE l\'unique insertion — aucun effet avant la fin de la validation, aucun retour arrière (`splice`, `pop`, `filter`) dans la fonction',
    iVal > 0 && iDou > iVal && iIns > iDou && !/splice\(|\.pop\(|\.filter\(|rollback/i.test(EN), J([iVal, iDou, iIns]));
  t('B-NRH2 S3 ⭐ `_n2Reajouter` traite un groupe avant de lire l\'écran ni d\'écrire, refuse un aperçu de groupe, et ne remet à l\'écrivain qu\'un ensemble SANS refus',
    /Array\.isArray\(src\)/.test(RA) && /GROUPE_SANS_APERCU/.test(RA) && /if\(refus\.length\) return \{ok:false, groupe:true, refus:refus\}/.test(RA) && RA.indexOf('if(refus.length)') < RA.indexOf('return _n2Enregistrer(prets, porte)'), '');
  t('B-NRH2 S4 ⭐ `rejouerRepas` n\'écrit pas elle-même (ni `push`, ni `_n2Enregistrer(` direct, ni `_foodLineId(`), prépare par `_n2Apercu` (pur) et n\'ouvre pas l\'écran d\'ajout (la réparation est dans `_habReparer`)',
    RJ !== '' && !/foodLog\s*\.\s*(push|splice|unshift)|_n2Enregistrer\(|_foodLineId\(|openAddFood\(|_afSetSrc\(|_afOublierAliment\(/.test(RJ) && /_n2Apercu\(/.test(RJ) && /_n2Reajouter\([^\n]*'rejouerRepas'\)/.test(RJ), '');
  t('B-NRH2 S5 ⭐ la provenance n\'a pas bougé : `_n2Reprendre` ne pose toujours aucune identité sur une reprise bloquée, et aucune valeur d\'origine nouvelle n\'apparaît (`manuel` est une saisie, pas une origine)',
    /if\(_sid && _afSrc && !bloquee\) _afSrc\.sourceId/.test(src) && !/origine:\s*'manuel'/.test(RJ + corps('_habReparer') + corps('_habChoix')), '');
  t('B-NRH2 S6 ⭐ les deux messages : `quickFillFood` lit `_afRepriseVide.bloquee` pour dire la vraie raison, `quickAddFood` retire le point final de la phrase de la règle avant d\'y ajouter le sien',
    /_afRepriseVide\.bloquee\s*\?\s*_afRepriseVide\.texte\s*:\s*_N2_VIDE/.test(QF) && /replace\(\/\[\.\\s\]\+\$\/,''\)/.test(QA), '');
  const iV = EN.indexOf('N.ligneNouvelle(e)'), iD = EN.indexOf('_douaneLigne('), iP = EN.indexOf('foodLog.push(');
  t('B-NRH2 A2-T03 ⭐⭐ écrivain unique inchangé dans sa structure : un seul `foodLog.push(` dans app.js (le sien), validation → douane → insertion dans cet ordre, aucun retour arrière',
    (src.match(/foodLog\.push\(/g) || []).length === 1 && iV > 0 && iD > iV && iP > iD && !/splice\(|\.pop\(|\.filter\(|rollback/i.test(EN), J([iV, iD, iP]));
  const SUPPR = /foodLog\s*\.\s*(splice|pop|shift|unshift)\s*\(|foodLog\s*=[^=]/;
  t('B-NRH2 A1-T05 ⭐⭐ aucune suppression ni remplacement du journal dans `rejouerRepas`, `_habApresInsertion`, `_habReessayer` ni `_habPurger` ; aucune ré-insertion (ni `_n2Reajouter(`, ni `_n2Enregistrer(`) dans le post-traitement ; `persist()` n\'est plus appelé avant le constat d\'insertion',
    [RJ, AP, RE, PU, DU].every((c) => c !== '' && !SUPPR.test(c)) && ![AP, RE, PU].some((c) => /_n2Reajouter\(|_n2Enregistrer\(/.test(c)) && !/persist\(\)/.test(RJ), '');
  const iPe = AP.indexOf('persist()'), iDu = AP.indexOf('_habDurable('), iRe = AP.indexOf('renderFoodJournal()');
  t('B-NRH2 A1-T06 ⭐ le post-traitement : sauvegarde → RELECTURE du stockage (`persist()` avale ses erreurs, il ne lève rien) → rendu, chaque étape dans son `try` ; le message d\'échec de sauvegarde ne parle jamais de synchronisation',
    iPe > 0 && iDu > iPe && iRe > iDu && (AP.match(/try\{/g) || []).length >= 4 && !/synchronis/i.test(MSG), J([iPe, iDu, iRe]));

  t('B-NRH2 N15 aucune erreur JavaScript pendant tout le banc (hors les fautes injectées exprès, qui sont attrapées par l\'application)', erreurs.filter((e) => !/faute injectée|en panne|APRÈS l'insertion|illisible|quota|inaccessible/i.test(e)).length === 0, J(erreurs));
  await cx.close();
};
