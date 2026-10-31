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
  console.log('\n-- B-NRH2. Tes repas habituels : tout ou rien, un choix explicite, une écriture groupée sans retour arrière --');
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
  const charger = async (cles) => { await E((cl) => { S.foodLog = cl.reduce((a, k) => a.concat(JSON.parse(JSON.stringify(window.__JEUX[k]))), []); S.savedFoods = []; S.hiddenFoods = []; _habDernier = { cle: '', t: 0 }; _habEnCours = 0; window.__toasts = []; persist(); goScreen('s-nutrition'); renderFoodJournal(); }, cles); await pause(300); };
  const hab = (nom) => E((n) => { const h = _repasHabituels(); const i = h.findIndex((x) => x.items.some((it) => it.name === n)); return { i: i, sig: h[i] && h[i].sig, meal: h[i] && h[i].meal, nb: h.length, items: h[i] ? h[i].items.map((x) => x.name) : [] }; }, nom);
  const jouer = async (sig, mom, choix) => { await E((a) => { rejouerRepas(a[0], a[1], a[2]); }, [sig, mom, choix]); await pause(450); };
  const panneau = (i) => E((k) => { const c = document.getElementById('hab-m-' + k); const bx = c && c.querySelector('.hab-choix'); return bx ? { boutons: [...bx.querySelectorAll('button')].map((x) => x.textContent), attrsOnclick: [...bx.querySelectorAll('button')].some((x) => x.hasAttribute('onclick')), texte: bx.querySelector('div') ? bx.querySelector('div').textContent : '' } : null; }, i);
  const cliquer = (i, k) => E(([r, n]) => { const c = document.getElementById('hab-m-' + r); const bs = c && c.querySelectorAll('.hab-choix button'); if (bs && bs[n]) { bs[n].click(); return true; } return false; }, [i, k]);
  const ids = () => E(() => (S.foodLog || []).map((x) => x.id));
  const neuves = (avant) => E((a) => (S.foodLog || []).filter((x) => x && a.indexOf(x.id) < 0).map((x) => JSON.parse(JSON.stringify(x))), avant);
  const enMemoire = (noms) => E((ns) => ns.map((n) => (S.foodLog || []).filter((x) => x && x.name === n && x.date === today()).length), noms);
  const stockees = (noms) => E((ns) => { const l = JSON.parse(localStorage.getItem('ft4_foodlog') || '[]'); return ns.map((n) => l.filter((x) => x && x.name === n && x.date === today()).length); }, noms);
  const stockage = () => E(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });

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
  t('B-NRH2 A1-T01c ⭐⭐ une exception tombe APRÈS que l\'écriture a inséré : on REGARDE le journal (il a grandi) — les 2 lignes existent, aucun « Rien n\'a été ajouté », le post-traitement a lieu (lignes écrites dans le stockage), aucune ré-insertion',
    (await neuves(avantX)).length === 2 && J(await stockees(['Riz H02 faute', 'Mais H02 faute'])) === J([2, 2]) && !tousX.some((m) => /Rien n'a été ajouté/.test(m)) , J({ toasts: tousX.slice(-2), mem: await enMemoire(['Riz H02 faute']), sto: await stockees(['Riz H02 faute']) }));

  /* ═══ F6 — A1 : échec avant insertion · sauvegarde en panne · rendu en panne · nouvelle tentative ═══ */
  await charger(['T', 'P', 'R']);
  const hT = await hab('Riz H02 prepa'), hP = await hab('Riz H02 persist'), hR = await hab('Riz H02 rendu');
  const avantT01 = await snap(); const ls01 = await stockage();
  await E(() => { window.__rajOrig = window._n2Reajouter; window._n2Reajouter = function (a, b, c, d, apercu) { if (apercu) return window.__rajOrig.apply(this, arguments); throw new Error('écriture en panne (avant insertion)'); }; });
  await jouer(hT.sig, 'collation2');
  await E(() => { window._n2Reajouter = window.__rajOrig; });
  const cle01 = hT.sig + '|collation2|';
  const etat01 = await E(() => ({ dernier: _habDernier.cle, enCours: _habEnCours }));
  t('B-NRH2 A1-T01 ⭐⭐ échec AVANT l\'insertion (l\'écriture lève une exception) : aucune ligne, journal et stockage identiques à l\'octet, « Rien n\'a été ajouté » (vrai ici), aucun verrou résiduel',
    (await snap()) === avantT01 && J(await stockage()) === J(ls01) && /Rien n'a été ajouté/.test(await dernier()) && etat01.dernier !== cle01 && etat01.enCours === 0, J({ etat01, toast: await dernier() }));
  const avantT01b = await ids();
  await jouer(hT.sig, 'collation2');
  t('B-NRH2 A1-T01b la nouvelle tentative immédiate fonctionne (rien n\'avait été inséré, rien n\'est bloqué) : 2 lignes, une seule fois', (await neuves(avantT01b)).length === 2, '');

  await afficher(); await pause(1000); await razToasts();
  const avantR = await ids();
  await E(() => { window.__rjOrig = window.renderFoodJournal; window.renderFoodJournal = function () { throw new Error('rendu en panne'); }; });
  await jouer(hR.sig, 'collation2');
  await E(() => { window.renderFoodJournal = window.__rjOrig; });
  const tousR = await toasts();
  t('B-NRH2 A1-T03 ⭐⭐ le rendu échoue APRÈS l\'insertion : les 2 lignes existent ET sont écrites dans le stockage, le message parle d\'affichage (« rouvre l\'écran »), jamais « Rien n\'a été ajouté », aucune ré-insertion',
    (await neuves(avantR)).length === 2 && J(await stockees(['Riz H02 rendu', 'Mais H02 rendu'])) === J([1, 1]) && tousR.some((m) => /l'affichage n'a pas pu se rafraîchir/.test(m)) && !tousR.some((m) => /Rien n'a été ajouté/.test(m)) , J({ toasts: tousR.slice(-2) }));

  /* ═══ F7 — A2 : panne DANS l'insertion groupée ═══ */
  await charger(['Q']);
  const hQ = await hab('Riz H02 panne');
  const avantQ = await snap(); const lsQ = await stockage(); const carnetQ = await nCarnet();
  await E(() => { window.__pushPanne = 0; S.foodLog.push = function () { window.__pushPanne++; throw new Error('push en panne'); }; });
  await jouer(hQ.sig, 'collation2');
  const apresQ = await snap(); const lsQ2 = await stockage(); const carnetQ2 = await nCarnet();
  const nPush = await E(() => window.__pushPanne);
  t('B-NRH2 A2-T01 ⭐⭐ panne dans l\'insertion groupée elle-même : le journal est INCHANGÉ à l\'octet, l\'insertion n\'est tentée qu\'UNE fois (aucune ré-insertion automatique), le message est « Rien n\'a été ajouté (erreur technique) » — vrai, rien n\'a été inséré — et rien d\'autre ne bouge',
    apresQ === avantQ && nPush === 1 && /Rien n'a été ajouté \(erreur technique\)/.test(await dernier()) , J({ nPush, toast: await dernier() }));
  const autresCles = (o) => J(Object.keys(o).filter((k) => k !== 'ft4_douane_obs').sort().map((k) => [k, o[k]]));
  t('B-NRH2 A2-T02 ⭐⭐ LIMITE DÉCLARÉE, mesurée : la douane a DÉJÀ compté les 2 lignes (le carnet `ft4_douane_obs` avance de 2 alors que le journal n\'a rien reçu) ; tous les AUTRES effets de stockage sont nuls — le compteur est de l\'observation, il ne contient aucune donnée de repas. L\'opération n\'est PAS présentée comme totalement atomique.',
    carnetQ2 - carnetQ === 2 && autresCles(lsQ2) === autresCles(lsQ), J({ avant: carnetQ, apres: carnetQ2, memeStockage: autresCles(lsQ2) === autresCles(lsQ) }));
  await E(() => { delete S.foodLog.push; });
  const avantQb = await ids();
  await jouer(hQ.sig, 'collation2');
  t('B-NRH2 A2-T02b après la panne, une nouvelle tentative (push rétabli) insère le repas UNE fois : 2 lignes, pas de doublon, rien n\'était verrouillé', (await neuves(avantQb)).length === 2, '');

  /* ═══ lecture de la source : l'écrivain unique, le post-traitement, la provenance ═══ */
  const src = fs.readFileSync(path.join(__dirname, '..', '..', 'app.js'), 'utf8');
  const corps = (nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; let d = 0; for (let j = src.indexOf('{', i); j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}') { d--; if (d === 0) return src.slice(i, j + 1); } } return ''; };
  const EN = corps('_n2Enregistrer'), RA = corps('_n2Reajouter'), RJ = corps('rejouerRepas'), AP = corps('_habApresInsertion');
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
  t('B-NRH2 A1-T05 ⭐⭐ aucune suppression ni remplacement du journal dans `rejouerRepas` ni `_habApresInsertion` ; aucune ré-insertion (ni `_n2Reajouter(`, ni `_n2Enregistrer(`) dans le post-traitement ; `persist()` n\'est appelé NI par `rejouerRepas` NI directement par le post-traitement (il passe par `_journalPersister`, qui dit si le journal a été écrit)',
    [RJ, AP].every((c) => c !== '' && !SUPPR.test(c)) && !/_n2Reajouter\(|_n2Enregistrer\(/.test(AP) && !/persist\(\)/.test(RJ) && !/[^_a-zA-Z]persist\(\)/.test(AP), '');
  const MSG = await E(() => _N_MSG_JOURNAL);
  const iPe = AP.indexOf('_journalPersister()'), iRe = AP.indexOf('renderFoodJournal()'), iMs = AP.indexOf('_N_MSG_JOURNAL');
  t('B-NRH2 A1-T06 ⭐ le post-traitement : sauvegarde (statut de l\'écrivain du journal) → rendu, le message d\'échec n\'est dit QUE si la sauvegarde a échoué, chaque étape de rendu dans son `try` ; le message d\'échec ne parle jamais de synchronisation, dit que ce sera PERDU, renvoie à « Réessayer » et ne demande JAMAIS de ressaisir ni de retoucher le repas',
    iPe > 0 && iRe > iPe && iMs > iRe && (AP.match(/try\{/g) || []).length >= 2 && !/synchronis/i.test(MSG) && /PERDU/.test(MSG) && /Réessayer/.test(MSG) && /ne le ressaisis pas/.test(MSG) && !/touche de nouveau|ré-ajoute|retouche/i.test(MSG), J([iPe, iRe, iMs, MSG]));

  /* ═══ F10 — deux témoins ajoutés après la 1ʳᵉ campagne de mutations (M03 et M09 survivaient : le garde existait, aucun témoin dynamique ne le touchait) ═══ */
  await charger(['Y']);
  const hY2 = await hab('Riz H02 groupe');
  const avant11c = await snap(); const c11c = await carnet();
  await E(() => {
    /* la préparation du 2ᵉ aliment REFUSE alors que l'aperçu de l'écran l'avait accepté (l'état a changé entre-temps) : on le provoque en rendant à `_n2Reajouter` une réponse « à compléter » */
    window.__rj = window._n2Reajouter; window.__kp = 0;
    window._n2Reajouter = function (src, repas, date, porte, apercu) { if (apercu && apercu.preparer && ++window.__kp === 2) return { ok: false, aCompleter: true }; return window.__rj.apply(this, arguments); };
  });
  await jouer(hY2.sig, 'collation2');
  await E(() => { window._n2Reajouter = window.__rj; });
  t('B-NRH2 N11b ⭐⭐ un aliment refusé À LA PRÉPARATION du groupe (alors que l\'écran l\'avait accepté) : AUCUNE ligne écrite, carnet de la douane inchangé, et le message dit que le repas a changé',
    (await snap()) === avant11c && (await carnet()) === c11c && /a changé depuis l'écran/.test(await dernier()), J({ toast: await dernier(), kp: await E(() => window.__kp) }));
  await charger(['M']);
  const gM = await E(() => { openAddFood(); try { _renderFoodQuickList(); } catch (e) {} return (_afQuickItems || []).findIndex((it) => it.name === 'Skyr H02 bloque'); });
  await razToasts();
  await E((i) => { quickFillFood(i); }, gM); await pause(700);
  const tM = await dernier();
  await E(() => { try { closeAddFood(); } catch (e) {} });
  t('B-NRH2 N17 ⭐ « Mes aliments » → un ancien scan à vérifier est repris : le message dit la VRAIE raison (« ancienne fiche non vérifiée »), pas « ni quantité ni valeurs » (cette saisie A des valeurs, on ne les recopie pas)',
    gM >= 0 && /Ancienne fiche non vérifiée/.test(tM) && !/ni quantité ni valeurs/.test(tM), J({ gM, tM }));
  t('B-NRH2 N15 aucune erreur JavaScript pendant tout le banc (hors les fautes injectées exprès, qui sont attrapées par l\'application)', erreurs.filter((e) => !/faute injectée|en panne|APRÈS l'insertion|illisible|quota|inaccessible/i.test(e)).length === 0, J(erreurs));
  await cx.close();
};
