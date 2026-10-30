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

/* chaque repas existe sur DEUX jours (J-1 et J-2) : `__J1__` / `__J2__` sont posés au chargement */
function jeux() {
  const L = [];
  const deux = (suffixe, fabrique) => { L.push(fabrique('a' + suffixe, '__J1__')); L.push(fabrique('b' + suffixe, '__J2__')); };
  /* V : repas ENTIÈREMENT admissible (deux aliments déclarés) — dîner */
  [['V1', 'Riz H02 valide'], ['V2', 'Lentilles H02 valide'], ['W1', 'Riz H02 double'], ['W2', 'Pois H02 double'], ['X1', 'Riz H02 faute'], ['X2', 'Mais H02 faute'], ['Y1', 'Riz H02 groupe'], ['Y2', 'Orge H02 groupe']]
    .forEach(([k, nom]) => deux(k, (i, d) => Object.assign(dec('h02-' + i + '-0000000', nom, 'diner', R_, 150), { date: d })));
  /* micro-correction A1/A2 : un repas valide par scénario (un repas déjà rejoué aujourd'hui à ce moment-là n'est pas rejoué dans la même seconde) */
  [['P1', 'Riz H02 persist'], ['P2', 'Mais H02 persist'], ['R1', 'Riz H02 rendu'], ['R2', 'Mais H02 rendu'], ['Q1', 'Riz H02 panne'], ['Q2', 'Mais H02 panne'], ['T1', 'Riz H02 prepa'], ['T2', 'Mais H02 prepa']]
    .forEach(([k, nom]) => deux(k, (i, d) => Object.assign(dec('h02-' + i + '-0000000', nom, 'diner', R_, 150), { date: d })));
  /* U : un aliment déclaré + UN bloqué — pour le test « l'état change entre le panneau et le choix » */
  deux('U1', (i, d) => Object.assign(dec('h02-' + i + '-0000000', 'Seigle H02 etat', 'dejeuner', R_, 80), { date: d }));
  deux('U2', (i, d) => Object.assign(off('h02-' + i + '-0000000', 'Flan H02 etat', 'dejeuner', '3000000000706', P, 100), { date: d }));
  /* M : un aliment déclaré + UN bloqué (ancien scan OFF sans preuve) — déjeuner */
  deux('M1', (i, d) => Object.assign(dec('h02-' + i + '-0000000', 'Avoine H02 mixte', 'dejeuner', R_, 80), { date: d }));
  deux('M2', (i, d) => Object.assign(off('h02-' + i + '-0000000', 'Skyr H02 bloque', 'dejeuner', EAN.H1, P, 100), { date: d }));
  /* N : un aliment déclaré + DEUX bloqués — collation */
  deux('N1', (i, d) => Object.assign(dec('h02-' + i + '-0000000', 'Pain H02 multi', 'collation', R_, 60), { date: d }));
  deux('N2', (i, d) => Object.assign(off('h02-' + i + '-0000000', 'Thon H02 bloque un', 'collation', EAN.H2, P, 100), { date: d }));
  deux('N3', (i, d) => Object.assign(off('h02-' + i + '-0000000', 'Flan H02 bloque deux', 'collation', EAN.H3, P, 100), { date: d }));
  /* Z : TOUS bloqués — petit-déjeuner */
  deux('Z1', (i, d) => Object.assign(off('h02-' + i + '-0000000', 'Skyr H02 tout bloque', 'petitdej', EAN.H4, P, 100), { date: d }));
  deux('Z2', (i, d) => Object.assign(off('h02-' + i + '-0000000', 'Thon H02 tout bloque', 'petitdej', EAN.H5, P, 100), { date: d }));
  return L.map((x, i) => Object.assign({ ts: 1760000000000 + i * 60000 }, x));
}

const BASE_FIX = `(() => { try {
  if (sessionStorage.getItem('__nrh2')) return; sessionStorage.setItem('__nrh2', '1');
  localStorage.clear();
  localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
  const pad = n => String(n).padStart(2,'0');
  const jour = (k) => { const t = new Date(); t.setDate(t.getDate()-k); return t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate()); };
  const L = __LIGNES__.map(x => Object.assign({}, x, { date: x.date === '__J1__' ? jour(1) : jour(2) }));
  localStorage.setItem('ft4_foodlog', JSON.stringify(L));
  localStorage.setItem('ft4_savedfoods', '[]');
} catch (e) {} })();`;

async function ouvrirPage(b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const pg = await cx.newPage();
  const erreurs = [];
  pg.on('pageerror', (e) => erreurs.push(String(e && e.message || e).slice(0, 160)));
  pg.on('dialog', (d) => d.accept());
  await pg.addInitScript(BASE_FIX.replace('__LIGNES__', J(jeux())));
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1500);
  await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); window.__toasts = []; const v = window.toast; window.toast = function (m) { window.__toasts.push(String(m)); try { return v.apply(this, arguments); } catch (e) {} }; });
  return { cx, pg, erreurs };
}

module.exports.ecran = async function ecran(t, b, PORT) {
  console.log('\n-- B-NRH2. Tes repas habituels : tout ou rien, un choix explicite, une écriture groupée sans retour arrière --');
  const { cx, pg, erreurs } = await ouvrirPage(b, PORT);
  const E = (f, a) => pg.evaluate(f, a);
  const pause = (ms) => pg.waitForTimeout(ms);
  const snap = () => E(() => JSON.stringify([S.foodLog, S.savedFoods || [], S.hiddenFoods || []]));
  const nLog = () => E(() => (S.foodLog || []).length);
  const carnet = () => E(() => localStorage.getItem('ft4_douane_obs'));
  const toasts = () => E(() => (window.__toasts || []).slice());
  const razToasts = () => E(() => { window.__toasts = []; });
  const afficher = () => E(() => { goScreen('s-nutrition'); renderFoodJournal(); });
  const hab = (nom) => E((n) => { const h = _repasHabituels(); const i = h.findIndex((x) => x.items.some((it) => it.name === n)); return { i: i, sig: h[i] && h[i].sig, meal: h[i] && h[i].meal, nb: h.length, items: h[i] ? h[i].items.map((x) => x.name) : [] }; }, nom);
  const jouer = async (sig, mom, choix) => { await E((a) => { rejouerRepas(a[0], a[1], a[2]); }, [sig, mom, choix]); await pause(450); };
  const panneau = (i) => E((k) => { const c = document.getElementById('hab-m-' + k); const bx = c && c.querySelector('.hab-choix'); return bx ? { boutons: [...bx.querySelectorAll('button')].map((x) => x.textContent), attrsOnclick: [...bx.querySelectorAll('button')].some((x) => x.hasAttribute('onclick')), texte: bx.querySelector('div') ? bx.querySelector('div').textContent : '' } : null; }, i);
  const cliquer = (i, k) => E(([r, n]) => { const c = document.getElementById('hab-m-' + r); const bs = c && c.querySelectorAll('.hab-choix button'); if (bs && bs[n]) { bs[n].click(); return true; } return false; }, [i, k]);
  const neuves = async (avant) => E((ids) => (S.foodLog || []).filter((x) => x && ids.indexOf(x.id) < 0).map((x) => JSON.parse(JSON.stringify(x))), avant);
  const ids = () => E(() => (S.foodLog || []).map((x) => x.id));

  await afficher();
  const hW = await hab('Riz H02 double'), hX = await hab('Riz H02 faute'), hY = await hab('Riz H02 groupe'), hU = await hab('Seigle H02 etat');
  const hV = await hab('Riz H02 valide'), hM = await hab('Avoine H02 mixte'), hN = await hab('Pain H02 multi'), hZ = await hab('Skyr H02 tout bloque');
  t('B-NRH2 N00 la page est prête : 8 repas habituels inventés (4 valides · un bloqué · deux bloqués · tous bloqués · un dont l\'état changera) et leurs cartes sont affichées',
    hV.i >= 0 && hW.i >= 0 && hX.i >= 0 && hY.i >= 0 && hU.i >= 0 && hM.i >= 0 && hN.i >= 0 && hZ.i >= 0 && (await E(() => document.querySelectorAll('.hab-moments').length)) >= 8, J({ hV, hW, hX, hY, hU, hM, hN, hZ }));

  /* ── N01 : tout est admissible → ajout complet, UNE seule insertion, identités et ts distincts ── */
  const avant01 = await ids(); const j01 = await snap();
  await E(() => { window.__pushs = 0; const f = S.foodLog; const o = f.push; f.push = function () { window.__pushs++; return o.apply(this, arguments); }; });
  await jouer(hV.sig, 'collation2');
  const n01 = await neuves(avant01); const pushs01 = await E(() => window.__pushs);
  t('B-NRH2 N01 ⭐⭐ repas ENTIÈREMENT admissible : les 2 aliments sont ajoutés, en UNE SEULE insertion dans le journal (un seul `push`), avec des identités et des `ts` distincts',
    n01.length === 2 && pushs01 === 1 && new Set(n01.map((x) => x.id)).size === 2 && new Set(n01.map((x) => x.ts)).size === 2 && n01.every((x) => x.meal === 'collation2'), J({ n: n01.length, pushs: pushs01 }));
  t('B-NRH2 N12a les anciennes lignes sont intactes après un ajout complet (le journal d\'avant est un préfixe du journal d\'après)',
    (await E((a) => { const av = JSON.parse(a); return JSON.stringify(S.foodLog.slice(0, av[0].length)) === JSON.stringify(av[0]); }, j01)), '');

  /* ── N02 : un aliment bloqué → AUCUNE écriture, un panneau à 3 choix, retrouvé par hab-m-<rang> ── */
  await afficher();
  const avant02 = await snap(); const c0 = await carnet();
  await jouer(hM.sig, 'dejeuner');
  const p02 = await panneau(hM.i);
  t('B-NRH2 N02 ⭐⭐ repas avec UNE référence bloquée : RIEN n\'est écrit (journal, favoris, masquages et carnet de la douane identiques à l\'octet) et le panneau propose Réparer · Ajouter seulement l\'autre · Annuler',
    (await snap()) === avant02 && (await carnet()) === c0 && p02 && p02.boutons.length === 3 && /Réparer/.test(p02.boutons[0]) && /Ajouter seulement/.test(p02.boutons[1]) && /Annuler/.test(p02.boutons[2]), J({ p02, avantEgal: (await snap()) === avant02 }));
  t('B-NRH2 N13 ⭐ le panneau est rattaché à la carte `hab-m-<rang>` et ses boutons n\'ont AUCUN attribut `onclick` (écouteurs créés par le DOM) ; le code n\'emploie ni `window.event` ni sélecteur sur `onclick`',
    p02 && p02.attrsOnclick === false && await E(() => {
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
  await E(() => { _habChoisirMoment('hab-m-0'); renderFoodJournal(); }); await pause(200);
  t('B-NRH2 N14 ⭐ replier la carte ou re-rendre le journal sans choisir : aucun ajout involontaire, le panneau n\'existe plus', (await snap()) === avant02 && (await panneau(hM.i)) === null, '');

  /* ── N11 : l'état change entre l'affichage du panneau et le choix → le contrôle est REFAIT, rien n'est écrit sur un état périmé ── */
  await afficher(); await pause(1000);
  await jouer(hU.sig, 'dejeuner');
  const avant11 = await snap();
  await E(() => { const l = S.foodLog.filter((x) => x.name === 'Seigle H02 etat'); l.forEach((x) => { x.q = null; x.u = null; x.per100 = null; x.n2 = null; }); });
  const avant11b = await snap();
  await cliquer(hU.i, 1); await pause(700);
  t('B-NRH2 N11 ⭐ l\'aliment « admissible » a perdu sa quantité entre l\'affichage du panneau et le choix : le contrôle est refait à l\'écriture, RIEN n\'est écrit', (await snap()) === avant11b && avant11 !== avant11b, J({ toasts: (await toasts()).slice(-2) }));

  /* ── N03 : deux références bloquées → choix explicite, la réparation prend la première, aucune copie implicite ── */
  await afficher();
  await jouer(hN.sig, 'collation');
  const p03 = await panneau(hN.i);
  t('B-NRH2 N03 ⭐ repas avec DEUX références bloquées : rien n\'est écrit, le panneau dit « 2 aliments … sont à vérifier » et propose « Ajouter seulement l\'autre »',
    (await snap()) === avant02 && !!p03 && /2 aliments/.test(p03.texte) && /Ajouter seulement l'autre/.test(p03.boutons[1]), J(p03));
  await cliquer(hN.i, 2); await pause(150);

  /* ── tous bloqués : l'ajout partiel n'est PAS proposé ── */
  await jouer(hZ.sig, 'petitdej');
  const pZ = await panneau(hZ.i);
  t('B-NRH2 N03b ⭐ repas dont TOUS les aliments sont bloqués : le panneau ne propose que Réparer et Annuler (aucun ajout partiel possible)', !!pZ && pZ.boutons.length === 2 && /Réparer/.test(pZ.boutons[0]) && /Annuler/.test(pZ.boutons[1]), J(pZ));
  await cliquer(hZ.i, 1); await pause(150);

  /* ── N05 : « Ajouter seulement l'autre » → exactement les lignes choisies ── */
  await afficher();
  const avant05 = await ids(); const j05 = await snap();
  await jouer(hM.sig, 'dejeuner'); await cliquer(hM.i, 1); await pause(700);
  const n05 = await neuves(avant05); const th05 = (await toasts()).slice(-1)[0] || '';
  t('B-NRH2 N05 ⭐⭐ « Ajouter seulement l\'autre » : exactement 1 ligne (l\'aliment admissible), jamais l\'aliment bloqué, et le message nomme ce qui n\'a pas été ajouté',
    n05.length === 1 && n05[0].name === 'Avoine H02 mixte' && n05[0].sourceId == null && /non ajouté \(à vérifier\)/.test(th05) && /Skyr H02 bloque/.test(th05), J({ n05: n05.map((x) => x.name), th05 }));
  t('B-NRH2 N12b les anciennes lignes sont intactes après un ajout partiel choisi', await E((a) => { const av = JSON.parse(a); return JSON.stringify(S.foodLog.slice(0, av[0].length)) === JSON.stringify(av[0]); }, j05), '');

  /* ── N06 / N07 : Réparer → saisie existante, nom prérempli, valeurs vides, nouvelle ligne DÉCLARÉE ── */
  await afficher();
  await jouer(hM.sig, 'dejeuner');
  const avant06 = await ids(); const jOff = await E(() => JSON.stringify(S.foodLog.filter((x) => x.name === 'Skyr H02 bloque')));
  await cliquer(hM.i, 0); await pause(900);
  const ecr = await E(() => ({ ouvert: document.getElementById('ov-add-food').classList.contains('open'), nom: document.getElementById('af-desc').value, kcal: document.getElementById('af-kcal').value, prot: document.getElementById('af-prot').value, bcNutr: !!_bcNutr, sid: !!(_afSrc && _afSrc.sourceId) }));
  t('B-NRH2 N06a ⭐⭐ « Réparer » ouvre la saisie existante : nom prérempli, calories et macros VIDES (l\'ancienne fiche bloquée n\'est pas recopiée), aucune identité ni fiche empruntée, et rien n\'est écrit',
    ecr.ouvert && ecr.nom === 'Skyr H02 bloque' && ecr.kcal === '' && ecr.prot === '' && ecr.bcNutr === false && ecr.sid === false && (await neuves(avant06)).length === 0, J(ecr));
  /* valeurs INCOHÉRENTES (30 g de protéines pour 50 kcal : plancher 120) + un poids : jamais promues en référence vérifiée */
  const saisir = (v) => E((x) => { const ev = (id, val) => { const e = document.getElementById(id); e.value = val; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
    ev('af-kcal', x.k); ev('af-prot', x.p); ev('af-carbs', x.c); ev('af-fat', x.f); }, v);
  const poids = (g) => E((v) => { const e = document.getElementById('af-poids'); if (!e) return false; e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return true; }, g);
  await saisir({ k: '50', p: '30', c: '2', f: '5' }); await pause(300); const aPoids1 = await poids('100'); await pause(300);
  await E(() => { addFoodEntry(); }); await pause(500);
  const n07 = await neuves(avant06);
  t('B-NRH2 N07 ⭐ valeurs INCOHÉRENTES : ou bien refusées (aucune ligne), ou bien — si l\'écran les accepte — écrites comme DÉCLARÉES (`fiab:declaree`, source utilisateur, sans identité) et jamais comme référence vérifiée ; l\'ancien scan est intact',
    aPoids1 && (n07.length === 0 || (n07.length === 1 && n07[0].n2 && n07[0].n2.f && n07[0].n2.f.fiab === 'declaree' && n07[0].n2.f.src === 'utilisateur' && n07[0].sourceId == null)) && (await E(() => JSON.stringify(S.foodLog.filter((x) => x.name === 'Skyr H02 bloque')))) === jOff, J({ n07: n07.map((x) => [x.name, x.n2 && x.n2.f]) }));
  /* saisie COHÉRENTE */
  const avantV = await ids();
  await saisir({ k: '129', p: '20', c: '2', f: '5' }); await pause(300); await poids('100'); await pause(300);
  await E(() => { addFoodEntry(); }); await pause(600);
  const n06 = await neuves(avantV);
  const nouvelle = n06.length ? n06[n06.length - 1] : (n07[0] || null);
  t('B-NRH2 N06b ⭐⭐ saisie cohérente + quantité : UNE nouvelle ligne DÉCLARÉE (`fiab:declaree`, `src:utilisateur`, `sourceId:null`, pour-100 g TAPÉ), ancienne ligne OFF intacte à l\'octet',
    !!nouvelle && nouvelle.n2.f.fiab === 'declaree' && nouvelle.n2.f.src === 'utilisateur' && nouvelle.sourceId === null && nouvelle.per100 && nouvelle.per100.kcal === 129
    && (await E(() => JSON.stringify(S.foodLog.filter((x) => x.name === 'Skyr H02 bloque' && x.sourceId)))) === jOff, J({ nouvelle: nouvelle && [nouvelle.n2.f, nouvelle.sourceId, nouvelle.per100] }));

  /* ── N08 : double appui → aucun doublon ── */
  await E(() => { try { closeAddFood(); } catch (e) {} document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); });
  await afficher();
  const avant08 = await ids();
  const dbl = await E((s) => { rejouerRepas(s, 'collation2'); rejouerRepas(s, 'collation2'); return true; }, hW.sig); await pause(500);
  const n08 = await neuves(avant08);
  t('B-NRH2 N08 ⭐ double appui sur le même repas, au même moment, dans la même seconde : UN seul ajout (2 lignes), pas 4', dbl && n08.length === 2, J({ n: n08.length }));
  /* écrivain : les mêmes identités rejouées sont refusées */
  const rej = await E(() => { const l = S.foodLog[S.foodLog.length - 1]; const e = { id: l.id, ts: Date.now(), date: l.date, repas: l.meal, nom: 'Doublon', origine: { saisie: 'manuel', origine: 'utilisateur' }, mode: 'declaree', declare: { kcal: 100 }, quantite: { val: 100, unite: 'g', origine: 'tapee' } };
    const n0 = S.foodLog.length; const c = localStorage.getItem('ft4_douane_obs'); const r = _n2Enregistrer([e], 'test'); return { ok: r.ok, erreur: r.erreur, n: S.foodLog.length - n0, carnetIdentique: localStorage.getItem('ft4_douane_obs') === c }; });
  t('B-NRH2 N08b ⭐ l\'écrivain unique refuse une identité déjà au journal (`ID_EXISTANT`) : rien n\'est écrit, le carnet de la douane ne bouge pas', rej.ok === false && rej.erreur === 'ID_EXISTANT' && rej.n === 0 && rej.carnetIdentique === true, J(rej));

  /* ── N09 : exception pendant la PRÉPARATION → aucune écriture, aucun effet, et le rejeu suivant n'est pas bloqué ── */
  await afficher(); await pause(1000);
  const avant09 = await snap(); const c09 = await carnet();
  await E(() => { window.__apercuOrig = _n2Apercu; window._n2Apercu = function () { throw new Error('faute injectée (préparation)'); }; });
  await jouer(hX.sig, 'collation2');
  await E(() => { window._n2Apercu = window.__apercuOrig; });
  t('B-NRH2 N09 ⭐⭐ exception pendant la préparation : AUCUNE écriture, aucun compteur de douane, un message d\'erreur — et le verrou anti-double-appui est relâché',
    (await snap()) === avant09 && (await carnet()) === c09 && /erreur technique/.test(((await toasts()).slice(-1)[0]) || ''), '');
  const avant09b = await ids();
  await pause(1000); await jouer(hX.sig, 'collation2');
  t('B-NRH2 N09b après cette faute, le rejeu suivant fonctionne (le verrou n\'est pas resté bloqué)', (await neuves(avant09b)).length === 2, '');

  /* ── N10 : échec pendant l'ENREGISTREMENT → tout est validé AVANT le premier effet : rien n'est écrit, ni journal, ni douane ── */
  await afficher(); await pause(1000);
  const avant10 = await snap(); const c10 = await carnet();
  await E(() => {
    window.__ln = NUT2.ligneNouvelle; window.__eo = window._n2Enregistrer; window.__armee = false; window.__k = 0;
    window._n2Enregistrer = function () { window.__armee = true; window.__k = 0; return window.__eo.apply(this, arguments); };
    NUT2.ligneNouvelle = function (e) { if (window.__armee && ++window.__k === 2) return { ok: false, erreur: 'FAUTE_INJECTEE' }; return window.__ln.apply(this, arguments); };
  });
  await jouer(hY.sig, 'collation2');
  await E(() => { NUT2.ligneNouvelle = window.__ln; window._n2Enregistrer = window.__eo; window.__armee = false; });
  t('B-NRH2 N10 ⭐⭐ le moteur REFUSE la 2ᵉ ligne du groupe au moment d\'écrire : AUCUNE ligne écrite (pas même la 1ʳᵉ), carnet de la douane inchangé, aucun retour arrière nécessaire — la validation est entière AVANT le premier effet',
    (await snap()) === avant10 && (await carnet()) === c10, '');
  /* une douane qui lève une exception ne bloque ni ne perd rien */
  await pause(1000);
  const avant10b = await ids();
  await E(() => { window.__dl = window._douaneLigne; window._douaneLigne = function () { throw new Error('douane en panne'); }; });
  await jouer(hY.sig, 'collation2');
  await E(() => { window._douaneLigne = window.__dl; });
  t('B-NRH2 N10b la douane est de l\'observation : si elle lève une exception, le groupe est tout de même écrit en entier (2 lignes)', (await neuves(avant10b)).length === 2, '');

  /* ── N16 : un conteneur qui n'est pas CELUI du repas est refusé (aucune écriture, aucun panneau ailleurs) ── */
  await afficher();
  const inv = await E(([iN, iM, sigM]) => { const r = _repasHabituels().find((x) => x.sig === sigM); return { autre: _habConteneur(iN, r), horsBornes: _habConteneur(9999, r), negatif: _habConteneur(-1, r), bon: !!_habConteneur(iM, r) }; }, [hN.i, hM.i, hM.sig]);
  t('B-NRH2 N16 ⭐⭐ le panneau n\'est rattaché qu\'à la carte qui affiche BIEN ce repas : la carte d\'un autre repas, un rang hors bornes et un rang négatif donnent `null` (donc aucune écriture) ; la bonne carte est acceptée', inv.autre === null && inv.horsBornes === null && inv.negatif === null && inv.bon === true, J(inv));

  /* ── N17 : le message d'une fiche bloquée dit la vraie raison ── */
  await E(() => { openAddFood(); });
  const msg = await E(([nom]) => { const l = S.foodLog.find((x) => x.name === nom); _afOublierAliment(); _n2Reprendre(l, 'liste'); return { vide: !!_afRepriseVide, bloquee: !!(_afRepriseVide && _afRepriseVide.bloquee), texte: _afRepriseVide && _afRepriseVide.texte }; }, ['Thon H02 tout bloque']);
  t('B-NRH2 N17 ⭐ une reprise BLOQUÉE se déclare (`bloquee:true`, la phrase de la règle) : « ni quantité ni valeurs » n\'est plus dit à tort ; et le toast de refus ne finit plus par deux points', msg.vide && msg.bloquee && /Ancienne fiche non vérifiée/.test(msg.texte || ''), J(msg));
  await E(() => { try { closeAddFood(); } catch (e) {} document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); });

  /* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
     MICRO-CORRECTION A1 (le message dit la vérité après une insertion) et A2 (la douane et l'insertion groupée : la limite, caractérisée).
     ⚠️ PRÉPARÉS, JAMAIS EXÉCUTÉS (GO TESTS non accordé).
     ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
  await afficher(); await pause(300);
  const hP = await hab('Riz H02 persist'), hR = await hab('Riz H02 rendu'), hQ = await hab('Riz H02 panne'), hT = await hab('Riz H02 prepa');
  const MSG = await E(() => _HAB_MSG_NON_DURABLE);
  const stockage = () => E(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
  const durables = (noms) => E((ns) => { const l = JSON.parse(localStorage.getItem('ft4_foodlog') || '[]'); return ns.map((n) => l.filter((x) => x && x.name === n && x.date === today()).length); }, noms);
  const enMemoire = (noms) => E((ns) => ns.map((n) => (S.foodLog || []).filter((x) => x && x.name === n && x.date === today()).length), noms);
  const dernier = async () => ((await toasts()).slice(-1)[0] || '');
  const quotaOn = () => E(() => { window.__si = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'ft4_foodlog') { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; } return window.__si.apply(this, arguments); }; });
  const quotaOff = () => E(() => { if (window.__si) { Storage.prototype.setItem = window.__si; window.__si = null; } });

  /* ── A1-T01 : échec AVANT l'insertion → aucune ligne, le message « Rien n'a été ajouté » est VRAI, et rien ne reste verrouillé ── */
  await razToasts();
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

  /* ── A1-T01c : une exception qui tombe APRÈS l'insertion, dans l'étape d'écriture elle-même → le journal a grandi, donc les lignes existent : jamais « Rien n'a été ajouté », et le post-traitement a bien lieu ── */
  await afficher(); await pause(1000); await razToasts();
  const avantX = await ids();
  await E(() => { window.__rajOrig2 = window._n2Reajouter; window._n2Reajouter = function (a, b, c, d, apercu) { const r = window.__rajOrig2.apply(this, arguments); if (!apercu) throw new Error('exception APRÈS l\'insertion'); return r; }; });
  await jouer(hX.sig, 'collation');
  await E(() => { window._n2Reajouter = window.__rajOrig2; });
  const tousX = await toasts();
  t('B-NRH2 A1-T01c ⭐⭐ une exception tombe APRÈS que l\'écriture a inséré : on REGARDE le journal (il a grandi) — les 2 lignes existent, aucun « Rien n\'a été ajouté », le post-traitement a lieu (lignes durables), rien n\'est en attente, aucune ré-insertion',
    (await neuves(avantX)).length === 2 && J(await durables(['Riz H02 faute', 'Mais H02 faute'])) === J([1, 1]) && !tousX.some((m) => /Rien n'a été ajouté/.test(m)) && (await E(() => Object.keys(_habNonConfirme).length)) === 0, J({ toasts: tousX.slice(-2) }));

  /* ── A1-T02 : échec de la SAUVEGARDE durable après l'insertion → les lignes existent, le message est EXACT, jamais « Rien n'a été ajouté » ── */
  await afficher(); await pause(1000); await razToasts();
  const avantP = await ids();
  await E(() => { window.__enreg = 0; window.__eo2 = window._n2Enregistrer; window._n2Enregistrer = function () { window.__enreg++; return window.__eo2.apply(this, arguments); }; });
  await quotaOn();
  await jouer(hP.sig, 'collation2');
  const tousP = await toasts(); const nP = await neuves(avantP);
  const memP = await enMemoire(['Riz H02 persist', 'Mais H02 persist']), durP = await durables(['Riz H02 persist', 'Mais H02 persist']);
  const cleP = hP.sig + '|collation2|';
  const pend = await E((k) => (_habNonConfirme[k] || []).length, cleP);
  t('B-NRH2 A1-T02 ⭐⭐ la sauvegarde locale échoue APRÈS l\'insertion (stockage plein) : les 2 lignes EXISTENT en mémoire mais PAS dans le stockage, le message est EXACT (« l\'enregistrement local durable n\'est PAS confirmé »), jamais « Rien n\'a été ajouté », une seule insertion, aucune ligne supprimée',
    nP.length === 2 && J(memP) === J([1, 1]) && J(durP) === J([0, 0]) && tousP.includes(MSG) && !tousP.some((m) => /Rien n'a été ajouté/.test(m)) && /enregistrement local durable n'est PAS confirmé/.test(MSG) && pend === 2 && (await E(() => window.__enreg)) === 1, J({ memP, durP, pend, toasts: tousP.slice(-3) }));

  /* ── A1-T04 : nouvelle tentative → AUCUN doublon ; ni bloquée pour toujours, ni un autre repas empêché ── */
  await pause(1000); await razToasts();
  await jouer(hP.sig, 'collation2');
  const encore = await enMemoire(['Riz H02 persist', 'Mais H02 persist']);
  t('B-NRH2 A1-T04a ⭐⭐ nouvelle tentative PENDANT la panne de stockage : aucune ré-insertion (toujours 1 ligne de chaque), le même message exact', J(encore) === J([1, 1]) && (await dernier()) === MSG && (await E(() => window.__enreg)) === 1, J({ encore, toast: await dernier() }));
  const avantAutre = await ids();
  await jouer(hT.sig, 'diner');
  t('B-NRH2 A1-T04b ⭐⭐ un AUTRE repas (autre clé) n\'est pas empêché par la sauvegarde en attente : il est inséré normalement, et les DEUX attentes coexistent (une table, pas une case : aucune n\'est écrasée)', (await neuves(avantAutre)).length === 2 && (await E(() => Object.keys(_habNonConfirme).length)) === 2, '');
  await quotaOff(); await pause(1000); await razToasts();
  await jouer(hP.sig, 'collation2');
  t('B-NRH2 A1-T04c ⭐⭐ le stockage répond de nouveau : le geste RETENTE la sauvegarde sans rien ré-insérer (toujours 1 ligne de chaque en mémoire), les lignes sont maintenant DURABLES (le repas d\'à côté, en attente lui aussi, est confirmé du même coup), message « Enregistrement local confirmé », plus rien en attente',
    J(await enMemoire(['Riz H02 persist', 'Mais H02 persist'])) === J([1, 1]) && J(await durables(['Riz H02 persist', 'Mais H02 persist'])) === J([1, 1]) && /Enregistrement local confirmé/.test(await dernier()) && (await E(() => Object.keys(_habNonConfirme).length)) === 0 && (await E(() => window.__enreg)) === 2 /* 1 pour le repas P + 1 pour l'autre repas */, J({ toast: await dernier(), attente: await E(() => Object.keys(_habNonConfirme)) }));
  await pause(1000);
  await jouer(hP.sig, 'collation2');
  t('B-NRH2 A1-T04d ⭐ une fois la sauvegarde confirmée, un NOUVEAU geste sur le même repas est un vrai nouvel ajout (2 lignes de chaque) : les ajouts légitimes ultérieurs ne sont jamais bloqués',
    J(await enMemoire(['Riz H02 persist', 'Mais H02 persist'])) === J([2, 2]), '');
  await E(() => { window._n2Enregistrer = window.__eo2; });

  /* ── A1-T03 : échec du RENDU après l'insertion (sauvegarde réussie) → les lignes existent, durables, aucun faux message d'annulation ── */
  await afficher(); await pause(1000); await razToasts();
  const avantR = await ids();
  await E(() => { window.__rjOrig = window.renderFoodJournal; window.renderFoodJournal = function () { throw new Error('rendu en panne'); }; });
  await jouer(hR.sig, 'collation2');
  await E(() => { window.renderFoodJournal = window.__rjOrig; });
  const tousR = await toasts();
  t('B-NRH2 A1-T03 ⭐⭐ le rendu échoue APRÈS l\'insertion : les 2 lignes existent ET sont durables, le message parle d\'affichage (« rouvre l\'écran »), jamais « Rien n\'a été ajouté », rien en attente, aucune ré-insertion',
    (await neuves(avantR)).length === 2 && J(await durables(['Riz H02 rendu', 'Mais H02 rendu'])) === J([1, 1]) && tousR.some((m) => /l'affichage n'a pas pu se rafraîchir/.test(m)) && !tousR.some((m) => /Rien n'a été ajouté/.test(m)) && (await E(() => Object.keys(_habNonConfirme).length)) === 0, J({ toasts: tousR.slice(-2) }));

  /* ── A2-T01 / T02 : panne injectée DANS `S.foodLog.push` (l'insertion groupée elle-même) ── */
  await afficher(); await pause(1000); await razToasts();
  const avantQ = await snap(); const lsQ = await stockage(); const carnetQ = await E(() => { const c = JSON.parse(localStorage.getItem('ft4_douane_obs') || 'null'); return c ? c.n : 0; });
  await E(() => { window.__pushPanne = 0; S.foodLog.push = function () { window.__pushPanne++; throw new Error('push en panne'); }; });
  await jouer(hQ.sig, 'collation2');
  const apresQ = await snap(); const lsQ2 = await stockage(); const carnetQ2 = await E(() => { const c = JSON.parse(localStorage.getItem('ft4_douane_obs') || 'null'); return c ? c.n : 0; });
  const nPush = await E(() => window.__pushPanne);
  t('B-NRH2 A2-T01 ⭐⭐ panne dans l\'insertion groupée elle-même : le journal est INCHANGÉ à l\'octet, l\'insertion n\'est tentée qu\'UNE fois (aucune ré-insertion automatique), le message est « Rien n\'a été ajouté (erreur technique) » — vrai, rien n\'a été inséré — et rien n\'est en attente',
    apresQ === avantQ && nPush === 1 && /Rien n'a été ajouté \(erreur technique\)/.test(await dernier()) && (await E(() => Object.keys(_habNonConfirme).length)) === 0, J({ nPush, toast: await dernier() }));
  const autresCles = (o) => J(Object.keys(o).filter((k) => k !== 'ft4_douane_obs').sort().map((k) => [k, o[k]]));
  t('B-NRH2 A2-T02 ⭐⭐ LIMITE DÉCLARÉE, mesurée : la douane a DÉJÀ compté les 2 lignes (le carnet `ft4_douane_obs` passe de ' + '+0 à +2 alors que le journal n\'a rien reçu) ; tous les AUTRES effets de stockage sont nuls (journal local, favoris, masquages… identiques) — le compteur est de l\'observation, il ne contient aucune donnée de repas. L\'opération n\'est PAS présentée comme totalement atomique.',
    carnetQ2 - carnetQ === 2 && autresCles(lsQ2) === autresCles(lsQ), J({ avant: carnetQ, apres: carnetQ2, memeStockage: autresCles(lsQ2) === autresCles(lsQ) }));
  await E(() => { delete S.foodLog.push; });
  const avantQb = await ids();
  await jouer(hQ.sig, 'collation2');
  t('B-NRH2 A2-T02b après la panne, une nouvelle tentative (push rétabli) insère le repas UNE fois : 2 lignes, pas de doublon, rien n\'était verrouillé', (await neuves(avantQb)).length === 2, '');
  await E(() => { persist(); });

  /* ── A2-T03 / A1-T05 : les garanties de l'écrivain unique tiennent, aucune suppression, aucune ré-insertion dans le post-traitement (lecture de la source) ── */
  const srcM = fs.readFileSync(path.join(__dirname, '..', '..', 'app.js'), 'utf8');
  const corpsM = (nom) => { const i = srcM.indexOf('function ' + nom + '('); if (i < 0) return ''; let d = 0; for (let j = srcM.indexOf('{', i); j < srcM.length; j++) { if (srcM[j] === '{') d++; else if (srcM[j] === '}') { d--; if (d === 0) return srcM.slice(i, j + 1); } } return ''; };
  const EN2 = corpsM('_n2Enregistrer'), RJ2 = corpsM('rejouerRepas'), AP2 = corpsM('_habApresInsertion'), RE2 = corpsM('_habReessayer'), PU2 = corpsM('_habPurger');
  const iV = EN2.indexOf('N.ligneNouvelle(e)'), iD = EN2.indexOf('_douaneLigne('), iP = EN2.indexOf('foodLog.push(');
  t('B-NRH2 A2-T03 ⭐⭐ écrivain unique inchangé dans sa structure : un seul `foodLog.push(` dans app.js (le sien), validation → douane → insertion dans cet ordre, aucun retour arrière, trois appelants d\'origine + le groupe par `_n2Reajouter`',
    (srcM.match(/foodLog\.push\(/g) || []).length === 1 && iV > 0 && iD > iV && iP > iD && !/splice\(|\.pop\(|\.filter\(|rollback/i.test(EN2), J([iV, iD, iP]));
  const SUPPR = /foodLog\s*\.\s*(splice|pop|shift|unshift)\s*\(|foodLog\s*=[^=]/;
  t('B-NRH2 A1-T05 ⭐⭐ aucune suppression ni remplacement du journal dans `rejouerRepas`, `_habApresInsertion`, `_habReessayer` ni `_habPurger` ; aucune ré-insertion (ni `_n2Reajouter(`, ni `_n2Enregistrer(`) dans le post-traitement ; `persist()` n\'est plus appelé avant le constat d\'insertion',
    [RJ2, AP2, RE2, PU2].every((c) => c !== '' && !SUPPR.test(c)) && ![AP2, RE2, PU2].some((c) => /_n2Reajouter\(|_n2Enregistrer\(/.test(c)) && !/persist\(\)/.test(RJ2), '');
  const iPe = AP2.indexOf('persist()'), iDu = AP2.indexOf('_habDurable('), iRe = AP2.indexOf('renderFoodJournal()');
  t('B-NRH2 A1-T06 ⭐ le post-traitement : sauvegarde → RELECTURE du stockage (`persist()` avale ses erreurs, il ne lève rien) → rendu, chaque étape dans son `try` ; le message d\'échec de sauvegarde ne parle jamais de synchronisation',
    iPe > 0 && iDu > iPe && iRe > iDu && (AP2.match(/try\{/g) || []).length >= 4 && !/synchronis/i.test(MSG), J([iPe, iDu, iRe]));

  /* ── écrivain unique : le contrat du groupe (structure) ── */
  const src = fs.readFileSync(path.join(__dirname, '..', '..', 'app.js'), 'utf8');
  const corps = (nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; let d = 0, k = src.indexOf('{', i); const dep = k; for (let j = dep; j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}') { d--; if (d === 0) return src.slice(i, j + 1); } } return ''; };
  const EN = corps('_n2Enregistrer'), RA = corps('_n2Reajouter'), RJ = corps('rejouerRepas');
  t('B-NRH2 S1 ⭐ `_n2Enregistrer` reste l\'écrivain UNIQUE : exactement un `foodLog.push(` dans app.js, et c\'est le sien ; le groupe est un tableau du même chemin',
    (src.match(/foodLog\.push\(/g) || []).length === 1 && /foodLog\.push\(/.test(EN) && /Array\.isArray\(entree\)/.test(EN), '');
  const iVal = EN.indexOf('N.ligneNouvelle(e)'), iDou = EN.indexOf('_douaneLigne('), iIns = EN.indexOf('foodLog.push(');
  t('B-NRH2 S2 ⭐⭐ ORDRE des temps dans l\'écrivain unique : la validation du moteur PRÉCÈDE la douane, qui PRÉCÈDE l\'unique insertion — aucun effet avant la fin de la validation, aucun retour arrière (`splice`, `pop`, `filter`) dans la fonction',
    iVal > 0 && iDou > iVal && iIns > iDou && !/splice\(|\.pop\(|\.filter\(|rollback/i.test(EN), J([iVal, iDou, iIns]));
  t('B-NRH2 S3 ⭐ `_n2Reajouter` traite un groupe avant de lire l\'écran ni d\'écrire, refuse un aperçu de groupe, et ne remet à l\'écrivain qu\'un ensemble SANS refus',
    /Array\.isArray\(src\)/.test(RA) && /GROUPE_SANS_APERCU/.test(RA) && /if\(refus\.length\) return \{ok:false, groupe:true, refus:refus\}/.test(RA) && RA.indexOf('if(refus.length)') < RA.indexOf('return _n2Enregistrer(prets, porte)'), '');
  t('B-NRH2 S4 ⭐ `rejouerRepas` n\'écrit pas elle-même (ni `push`, ni `_n2Enregistrer(` direct, ni `_foodLineId(`), prépare par `_n2Apercu` (pur) et n\'ouvre pas l\'écran d\'ajout (la réparation est dans `_habReparer`)',
    RJ !== '' && !/foodLog\s*\.\s*(push|splice|unshift)|_n2Enregistrer\(|_foodLineId\(|openAddFood\(|_afSetSrc\(|_afOublierAliment\(/.test(RJ) && /_n2Apercu\(/.test(RJ) && /_n2Reajouter\([^\n]*'rejouerRepas'\)/.test(RJ), '');
  const QF = corps('quickFillFood'), QA = corps('quickAddFood');
  t('B-NRH2 S6 ⭐ les deux messages : `quickFillFood` lit `_afRepriseVide.bloquee` pour dire la vraie raison, `quickAddFood` retire le point final de la phrase de la règle avant d\'y ajouter le sien',
    /_afRepriseVide\.bloquee\s*\?\s*_afRepriseVide\.texte\s*:\s*_N2_VIDE/.test(QF) && /replace\(\/\[\.\\s\]\+\$\/,''\)/.test(QA), '');
  t('B-NRH2 S5 ⭐ la provenance n\'a pas bougé : `_n2Reprendre` ne pose toujours aucune identité sur une reprise bloquée, et aucune valeur d\'origine nouvelle n\'apparaît (`manuel` est une saisie, pas une origine)',
    /if\(_sid && _afSrc && !bloquee\) _afSrc\.sourceId/.test(src) && !/origine:\s*'manuel'/.test(RJ + corps('_habReparer') + corps('_habChoix')), '');

  /* ── N12 / persistance : après rechargement, rien n'a changé que ce qui a été choisi ── */
  const avantRel = await E(() => JSON.stringify(S.foodLog));
  await pg.reload(); await pause(1800);
  t('B-NRH2 N12c ⭐ persistance : après rechargement, le journal est identique à l\'octet (aucun ajout fantôme d\'un panneau ouvert ou annulé)', (await E(() => JSON.stringify(S.foodLog))) === avantRel, '');
  t('B-NRH2 N15 aucune erreur JavaScript pendant tout le banc', erreurs.length === 0, J(erreurs));
  await cx.close();
};
