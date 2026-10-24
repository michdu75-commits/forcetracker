/* ════════════════════════════════════════════════════════════════════════════════════════════
   NUTRITION V2 — JALON 4 (22/10/2026) : LES PARCOURS, CONDUITS À L'ÉCRAN, AVEC LE MOTEUR BRANCHÉ.
   Feu vert de Michel (22/10) : *« tester tous les parcours : recherche, ajout, modification, favoris, repas
   habituels, scan, export et historique »*. Contrat V2 du 22/10, D-099 (grammes et ml d'abord ; une portion
   seulement avec son poids), garde-fou large du 10/09 (aucune ligne sans quantité réellement choisie).

   [*] CE QU'IL CONDUIT : la vraie app, de vrais clics (recherche CIQUAL, champ quantité, pastilles, « Ajouter »,
       « + Ajouter », étoile de favori, carte « Tes repas habituels », « Modifier »), un code-barres tapé.
   [*] CE QU'IL OBSERVE : les lignes écrites dans `S.foodLog` / `S.savedFoods` (valeurs, quantité, unité, fiche,
       provenance, statut, corrections, copie d'origine), l'écran du journal (« ? »), le total du jour, le CSV.
   [!] CE QU'IL NE COUVRE PAS : le vrai Open Food Facts et la vraie IA (simulés, sans réseau), le nuage, la
       restauration (chantier de Claude Principal), l'iPhone (recette de Michel).
   [*] DONNÉES INVENTÉES « (test) » (+ deux fiches CIQUAL réelles, publiques : 9810 et 15015), aucune identité.
   [*] ORACLE ÉCRIT À LA MAIN : chaque attendu est calculé ci-dessous, jamais lu dans le moteur.
   ⛔ Fichier à part (comme `nut_m6_rejeu.js`) : le contrôle négatif `tools/mut_nut2_parcours.py` le rejoue sur
      une copie mutée ; la passe complète l'appelle aussi.
   ════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

/* ── LE JOURNAL D'AVANT V2 (générations V1), GELÉ — chacune une forme réelle ── */
const PAD = (n) => String(n).padStart(2, '0');
const ANCIENNES = [
  /* L1 — CIQUAL 9810 retrouvée À L'IDENTIQUE : 140 g × 364 = 509,6 → 510 · 18,34 → 18 · 101,78 → 102 · 2,24 → 2 */
  { id: 'nv2p-L1-00000001', meal: 'dejeuner', name: 'Pâtes sèches, standard, crues', kcal: 510, prot: 18, carbs: 102, fat: 2,
    v: 1, saisie: 'ciqual', origine: 'ciqual', q: 140, u: 'g', etat: null, sourceId: 'ciqual:9810',
    per100: { kcal: 364, prot: 13.1, carbs: 72.7, fat: 1.6 }, modifie: false, k: 3 },
  /* L2 — un scan d'hier : sa fiche ne peut pas être VÉRIFIÉE (aucune base embarquée) */
  { id: 'nv2p-L2-00000002', meal: 'petitdej', name: 'Barre (test)', kcal: 210, prot: 4, carbs: 30, fat: 8,
    v: 1, saisie: 'scan', origine: 'off', q: 45, u: 'g', etat: 'tel-que-vendu', sourceId: '3000000000017',
    per100: { kcal: 467, prot: 9, carbs: 67, fat: 18 }, modifie: false, k: 2 },
  /* L3 — sans quantité */
  { id: 'nv2p-L3-00000003', meal: 'petitdej', name: 'Banane (test)', kcal: 106, prot: 1, carbs: 24, fat: 0,
    v: 1, saisie: 'liste', origine: 'reprise', q: null, u: null, etat: null, sourceId: null, per100: null, modifie: false, k: 2 },
  /* L4 — « 1 portion » SANS poids (D-099 : ce n'est pas une quantité) */
  { id: 'nv2p-L4-00000004', meal: 'petitdej', name: 'Shake (test)', kcal: 156, prot: 26, carbs: 1, fat: 1,
    v: 1, saisie: 'liste', origine: 'reprise', q: 1, u: 'portion', etat: null, sourceId: null, per100: null, modifie: false, k: 2 },
  /* le même petit-déjeuner, la veille : deux fois → « habituel » */
  { id: 'nv2p-L2b-0000005', meal: 'petitdej', name: 'Barre (test)', kcal: 210, prot: 4, carbs: 30, fat: 8,
    v: 1, saisie: 'scan', origine: 'off', q: 45, u: 'g', etat: 'tel-que-vendu', sourceId: '3000000000017',
    per100: { kcal: 467, prot: 9, carbs: 67, fat: 18 }, modifie: false, k: 1 },
  { id: 'nv2p-L3b-0000006', meal: 'petitdej', name: 'Banane (test)', kcal: 106, prot: 1, carbs: 24, fat: 0,
    v: 1, saisie: 'liste', origine: 'reprise', q: null, u: null, etat: null, sourceId: null, per100: null, modifie: false, k: 1 },
  { id: 'nv2p-L4b-0000007', meal: 'petitdej', name: 'Shake (test)', kcal: 156, prot: 26, carbs: 1, fat: 1,
    v: 1, saisie: 'liste', origine: 'reprise', q: 1, u: 'portion', etat: null, sourceId: null, per100: null, modifie: false, k: 1 },
  /* L5 — une portion AVEC nom et poids, pas de fiche vérifiable */
  { id: 'nv2p-L5-00000008', meal: 'diner', name: 'Steak (test)', kcal: 323, prot: 50, carbs: 0, fat: 13,
    v: 1, saisie: 'manuel', origine: 'utilisateur', q: 2, u: 'portion', portionLabel: 'steak', portionWeightG: 125,
    etat: null, sourceId: null, per100: { kcal: 129, prot: 20, carbs: 0, fat: 5 }, modifie: false, k: 3 },
];
const FAVORI_ANCIEN = { name: 'Yaourt (test)', kcal: 75, prot: 5, carbs: 6, fat: 3,
  per100: { kcal: 60, prot: 4, carbs: 4.8, fat: 2.4 }, q: 125, u: 'g', portionLabel: null, portionWeightG: null };
/* Le scan (Open Food Facts SIMULÉ) : une boisson vendue au litre → fiche pour 100 ml. */
const EAN_JUS = '3000000000120';
const JUS = { status: 1, product: { product_name_fr: 'Jus d\'orange (test)', brands: 'Marque test', quantity: '1 l',
  product_quantity_unit: 'ml', serving_quantity: 250,
  nutriments: { 'energy-kcal_100g': 45, proteins_100g: 0.7, carbohydrates_100g: 10, fat_100g: 0.1 } } };

/* ── LES ATTENDUS, À LA MAIN ── */
const A = {
  /* P2 — CIQUAL 9810, 140 g */
  pates140: { kcal: 510, prot: 18, carbs: 102, fat: 2 },
  /* P6a — la même ligne passée à 200 g : 728 · 26,2 → 26 · 145,4 → 145 · 3,2 → 3 */
  pates200: { kcal: 728, prot: 26, carbs: 145, fat: 3 },
  /* P6e — l'ancienne ligne vérifiée L1 passée à 70 g : 254,8 → 255 · 9,17 → 9 · 50,89 → 51 · 1,12 → 1 */
  pates70: { kcal: 255, prot: 9, carbs: 51, fat: 1 },
  /* P4 — CIQUAL 15015 (lipides « non déterminés »), 200 g : 204 · 5,4 → 5 · 45,6 → 46 · lipides ABSENTS */
  marrons200: { kcal: 204, prot: 5, carbs: 46 },
  /* P5 — jus 250 ml : 112,5 → 113 · 1,75 → 2 · 25 · 0,25 → 0 */
  jus250: { kcal: 113, prot: 2, carbs: 25, fat: 0 },
};

function fixture() {
  return `(() => { try {
    if (sessionStorage.getItem('__nv2p')) return; sessionStorage.setItem('__nv2p', '1');
    localStorage.clear();
    localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
    const pad = n => String(n).padStart(2,'0');
    const J = k => { const t = new Date(); t.setDate(t.getDate()-k); return t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate()); };
    const L = ${JSON.stringify(ANCIENNES)}.map((x, i) => { const o = Object.assign({}, x); o.date = J(o.k); delete o.k; o.ts = 1760000000000 + i * 60000; return o; });
    localStorage.setItem('ft4_foodlog', JSON.stringify(L));
    localStorage.setItem('ft4_savedfoods', JSON.stringify([${JSON.stringify(FAVORI_ANCIEN)}]));
  } catch (e) {} })();`;
}

/* ── P12 — LES PORTES JUMELLES DES REPRISES (jalon 4, 22/10) : six lignes, chacune deux jours de suite (« habituelle »).
   C4 est une ligne V2 (pesée sur une fiche Open Food Facts), écrite À LA MAIN comme le moteur l'écrit : 30 g × 380 · 75 ·
   8 · 5 pour 100 g = 114 · 22,5 → 23 · 2,4 → 2 · 1,5 → 2. Les autres sont des formes d'avant V2. ── */
const JUMELLES = {
  C1: { meal: 'petitdej', name: 'Riz (test)', kcal: 195, prot: 4, carbs: 42, fat: 1, q: 150, u: 'g', per100: { kcal: 130, prot: 2.7, carbs: 28, fat: 0.7 },
        v: 1, saisie: 'code-tape', origine: 'off', sourceId: '3000000000301', etat: 'tel-que-vendu' },
  C2: { meal: 'dejeuner', name: 'Steak (test)', kcal: 400, prot: 32, carbs: 0, fat: 28, q: 2, u: 'portion', portionLabel: 'steak', portionWeightG: 125,
        per100: { kcal: 160, prot: 12.8, carbs: 0, fat: 11.2 }, v: 1, saisie: 'manuel', origine: 'utilisateur', sourceId: null, etat: null },
  C3: { meal: 'diner', name: 'Lait (test)', kcal: 115, prot: 8, carbs: 12, fat: 4, q: 250, u: 'ml', per100: null, v: 1, saisie: 'manuel', origine: 'utilisateur', sourceId: null, etat: null },
  C4: { meal: 'collation', name: 'Whey (test)', kcal: 114, prot: 23, carbs: 2, fat: 2, q: 30, u: 'g', per100: { kcal: 380, prot: 75, carbs: 8, fat: 5 },
        v: 1, saisie: 'code-tape', origine: 'off', sourceId: '3000000000304', etat: 'tel-que-vendu',
        n2: { s: 1, m: 'p', st: 'fiable', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'off', ver: null, fiab: 'source', base: 'g' } } },
  C5: { meal: 'collation2', name: 'Pomme (test)', kcal: 52, prot: 0, carbs: 14, fat: 0, q: null, u: null, per100: null, v: 1, saisie: 'manuel', origine: 'utilisateur', sourceId: null, etat: null },
  C6: { meal: 'collation2', name: 'Shaker (test)', kcal: 156, prot: 26, carbs: 1, fat: 1, q: 1, u: 'portion', portionLabel: 'shaker', per100: null,
        v: 1, saisie: 'manuel', origine: 'utilisateur', sourceId: null, etat: null },
};
function fixtureJumelles() {
  return `(() => { try {
    if (sessionStorage.getItem('__nv2r')) return; sessionStorage.setItem('__nv2r', '1');
    localStorage.clear();
    localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
    const pad = n => String(n).padStart(2,'0');
    const J = k => { const t = new Date(); t.setDate(t.getDate()-k); return t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate()); };
    const C = ${JSON.stringify(JUMELLES)}, L = []; let i = 0;
    Object.keys(C).forEach(k => { [2, 1].forEach(j => { const o = Object.assign({}, C[k]); o.id = 'nv2r-' + k + '-' + j + '-0000'; o.date = J(j); o.ts = 1760000000000 + (i++) * 60000; L.push(o); }); });
    localStorage.setItem('ft4_foodlog', JSON.stringify(L));
    localStorage.setItem('ft4_savedfoods', '[]');
  } catch (e) {} })();`;
}

/* ── P13 — LES CORRECTIFS DE LA RÉVISION DU 22/10 (jalon 4) : quatre lignes d'avant V2, deux lignes V2 écrites par le
   moteur sur la page même. E3 est la forme exacte d'une ligne contaminée par M6 : 156 kcal · 26 g de protéines notés
   pour 5 g (28 g de macros ne tiennent pas dans 5 g). ── */
const CORRECTIFS = [
  { id: 'nv2s-E1-00000001', meal: 'petitdej', name: 'Barre P13 (test)', kcal: 210, prot: 4, carbs: 30, fat: 8, v: 1, saisie: 'scan', origine: 'off',
    q: 45, u: 'g', etat: 'tel-que-vendu', sourceId: '3000000000401', per100: { kcal: 467, prot: 9, carbs: 67, fat: 18 } },
  { id: 'nv2s-E3-00000003', meal: 'collation', name: 'Iso P13 (test)', kcal: 156, prot: 26, carbs: 1, fat: 1, v: 1, saisie: 'liste', origine: 'reprise',
    q: 5, u: 'g', etat: null, sourceId: null, per100: { kcal: 3120, prot: 520, carbs: 20, fat: 20 } },
  { id: 'nv2s-E4-00000004', meal: 'dejeuner', name: 'Riz P13 (test)', kcal: 195, prot: 4, carbs: 42, fat: 1, v: 1, saisie: 'manuel', origine: 'utilisateur',
    q: 150, u: 'g', etat: null, sourceId: null, per100: null },
];
function fixtureCorrectifs() {
  return `(() => { try {
    if (sessionStorage.getItem('__nv2s')) return; sessionStorage.setItem('__nv2s', '1');
    localStorage.clear();
    localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
    const pad = n => String(n).padStart(2,'0');
    const t = new Date(); t.setDate(t.getDate()-1); const hier = t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate());
    const L = ${JSON.stringify(CORRECTIFS)}.map((x, i) => Object.assign({}, x, { date: hier, ts: 1760000000000 + i * 60000 }));
    localStorage.setItem('ft4_foodlog', JSON.stringify(L));
    localStorage.setItem('ft4_savedfoods', '[]');
  } catch (e) {} })();`;
}

/* ── P14 — D-103 (Michel, 22/10, tranche D-101 ⑯) : « 3 portions (450 g) » partout où le poids d'une portion est connu ET
   fiable ; sans grammes sinon. Une ancienne ligne (V1) en portions, avec un poids noté qu'aucun critère ne peut vérifier
   (M6 : il a pu être hérité de l'écran). Les lignes V2 sont écrites par le moteur sur la page même (P14 ci-dessous). ── */
const D103_ANCIENNE = { id: 'nv2t-S1-00000001', meal: 'diner', name: 'Steak P14 (test)', kcal: 500, prot: 40, carbs: 0, fat: 36,
  v: 1, saisie: 'manuel', origine: 'utilisateur', q: 2, u: 'portion', portionLabel: 'steak', portionWeightG: 125, etat: null, sourceId: null,
  per100: { kcal: 200, prot: 16, carbs: 0, fat: 14.4 } };
function fixtureD103() {
  return `(() => { try {
    if (sessionStorage.getItem('__nv2t')) return; sessionStorage.setItem('__nv2t', '1');
    localStorage.clear();
    localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
    const pad = n => String(n).padStart(2,'0');
    const t = new Date(); t.setDate(t.getDate()-1); const hier = t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate());
    localStorage.setItem('ft4_foodlog', JSON.stringify([Object.assign({}, ${JSON.stringify(D103_ANCIENNE)}, { date: hier, ts: 1760000000000 })]));
    localStorage.setItem('ft4_savedfoods', '[]');
  } catch (e) {} })();`;
}

/* ── P15 — L'INCIDENT DU 23/10 (mission de Michel) : des valeurs CORROMPUES lors des REPRISES. Données INVENTÉES, inspirées
   des anomalies réelles : l'Iso Zero (un scan de 40 g juste, puis un couple 156 kcal / 26 g de protéines recopié de favori en
   historique), un favori affiché 400 kcal et ajouté 480, la copie d'origine perdue à la 2ᵉ modification, deux produits du
   même nom. ⛔ Oracles À LA MAIN :
   Iso (Open Food Facts SIMULÉ) pour 100 g 389 · 88 · 3 · 3 → 40 g = 155,6 → 156 · 35,2 → 35 · 1,2 → 1 · 1,2 → 1 ;
     50 g = 194,5 → 195 · 44 · 1,5 → 2 · 1,5 → 2.
   Yaourt A 80 · 4 · 10 · 3 pour 100 g, 1 pot de 125 g = 100 · 5 · 12,5 → 13 · 3,75 → 4 (redéfini à 150 g : 120 · 6 · 15 · 4,5 → 5) ;
   Yaourt B 120 · 3 · 15 · 5 pour 100 g, 1 pot de 150 g = 180 · 4,5 → 5 · 22,5 → 23 · 7,5 → 8.
   Pot : 1 pot de 125 g tapé 200 · 10 · 20 · 8 → fiche 160 · 8 · 16 · 6,4 pour 100 g ; 2 pots = 250 g = 400 · 20 · 40 · 16 ;
     la même fiche pour 2 pots de 150 g = 300 g = 480 · 24 · 48 · 19,2 → 19 (les 480 de « + Ajouter »). ── */
const EAN_ISO = '3000000000501', EAN_YA = '3000000000502', EAN_YB = '3000000000503';
const ISO = { status: 1, product: { code: EAN_ISO, product_name_fr: 'Iso P15 (test)', quantity: '1 kg', product_quantity_unit: 'g',
  nutriments: { 'energy-kcal_100g': 389, proteins_100g: 88, carbohydrates_100g: 3, fat_100g: 3 } } };
/* Un favori d'AVANT V2 (sans code-barres — mesuré : V1 n'en recopiait aucun) : le pour-100 g de la fiche, mais 26 g de protéines
   pour 40 g (une correction PARTIELLE, M4) — il se contredit lui-même. */
const P15_FAV_ISO = { name: 'Iso P15 (test)', kcal: 156, prot: 26, carbs: 1, fat: 1, per100: { kcal: 389, prot: 88, carbs: 3, fat: 3 },
  q: 40, u: 'g', portionLabel: null, portionWeightG: null };
/* Une copie d'AVANT V2 du même produit (son code-barres), au pour-100 g DÉRIVÉ de ses propres valeurs : cohérente en elle-même,
   fausse face à la fiche — seule une fiche VÉRIFIÉE du MÊME code-barres peut le dire. */
const P15_COPIE_ISO = { meal: 'collation', name: 'Iso P15 (test)', kcal: 156, prot: 26, carbs: 1, fat: 1, v: 1, saisie: 'liste', origine: 'reprise',
  q: 40, u: 'g', etat: 'tel-que-vendu', sourceId: EAN_ISO, per100: { kcal: 390, prot: 65, carbs: 2.5, fat: 2.5 } };
function fixtureIncident(cle, favoris) {
  return `(() => { try {
    if (sessionStorage.getItem('${cle}')) return; sessionStorage.setItem('${cle}', '1');
    localStorage.clear();
    localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
    localStorage.setItem('ft4_foodlog', '[]');
    localStorage.setItem('ft4_savedfoods', JSON.stringify(${JSON.stringify(favoris || [])}));
  } catch (e) {} })();`;
}

/* ── LES GESTES — au pointeur ; un geste raté rend FAUX (il ne ressemble jamais à un vert) ── */
const clic = async (pg, sel) => { try { await pg.click(sel, { timeout: 4000 }); return true; } catch (e) { return false; } };
const taper = async (pg, sel, v) => { try { await pg.fill(sel, String(v)); await pg.waitForTimeout(140); return true; } catch (e) { return false; } };
const pause = (pg, ms) => pg.waitForTimeout(ms);
async function ouvrir(b, PORT, fix, off) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const pg = await cx.newPage();
  const erreurs = [];
  pg.on('pageerror', (e) => erreurs.push(String(e && e.message || e).slice(0, 160)));
  pg.on('dialog', (d) => d.accept());
  /* ⛔ Open Food Facts n'est JAMAIS joint : les fiches sont servies ici (le jus par défaut ; un bloc peut servir les siennes,
     et une liste de résultats pour la recherche par nom — vide par défaut, comme avant). */
  const OFF = off || { produits: { [EAN_JUS]: JUS }, recherche: [] };
  await pg.route(/openfoodfacts/, (r) => { const u = r.request().url();
    if (/search/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: OFF.recherche || [] }) });
    const ean = Object.keys(OFF.produits || {}).find((e) => u.indexOf(e) >= 0);
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ean ? OFF.produits[ean] : { status: 0 }) }); });
  await pg.addInitScript(fix || fixture());
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pause(pg, 1500);
  await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); });
  const ok = (await clic(pg, '#nb-nutrition')) && (await pause(pg, 400), await clic(pg, '#ntab-journal'));
  await pause(pg, 250);
  return { cx, pg, erreurs, ok };
}
const journal = (pg) => pg.evaluate(() => JSON.parse(JSON.stringify(S.foodLog || [])));
const ligne = (L, id) => L.find((x) => x && x.id === id) || null;
const neuves = (L, avant) => L.filter((x) => x && avant.indexOf(x.id) < 0);
const J = (x) => JSON.stringify(x);
const vals = (l) => l ? { kcal: l.kcal, prot: l.prot, carbs: l.carbs, fat: l.fat } : null;
const memes = (a, b) => J(Object.keys(a).sort().reduce((o, k) => (o[k] = a[k], o), {})) === J(Object.keys(b).sort().reduce((o, k) => (o[k] = b[k], o), {}));
async function ouvrirAjout(pg) { const ok = await clic(pg, 'button[onclick="addFoodVia(\'main\')"]'); await pause(pg, 300); return ok; }
async function ajouter(pg) { const ok = await clic(pg, 'button[onclick="addFoodEntry()"]'); await pause(pg, 350); return ok; }
async function toastsDepuis(pg) { return pg.evaluate(() => (window.__toasts || []).slice()); }
async function capterToasts(pg) {
  await pg.evaluate(() => { window.__toasts = []; const v = window.toast; window.toast = function (m, t) { window.__toasts.push(String(m)); try { return v.apply(this, arguments); } catch (e) {} }; });
}

async function ecran(t, b, PORT) {
  console.log('\n-- B-NV2P. NUTRITION V2 — les parcours à l\'écran, moteur branché (jalon 4) --');
  const { cx, pg, erreurs, ok } = await ouvrir(b, PORT);
  t('B-NV2P ⓪ l\'app s\'ouvre sur le journal Nutrition, le moteur chargé', ok && await pg.evaluate(() => typeof NUT2 === 'object' && typeof NUT2.reprise === 'function'), 'ouverture ratée');
  await capterToasts(pg);
  const AV = await journal(pg);
  const ids0 = AV.map((x) => x.id);

  /* ═══ P1 HISTORIQUE — lire n'écrit rien ═══ */
  t('B-NV2P P1 ⛔⛔ HISTORIQUE : les 8 lignes d\'avant V2 sont chargées TELLES QUELLES (aucun `n2`, aucun champ ajouté)',
    AV.length === 8 && AV.every((l) => !('n2' in l)) && memes(vals(ligne(AV, 'nv2p-L1-00000001')), A.pates140), J(AV.map((l) => l.id)));

  /* ═══ P2 RECHERCHE → AJOUT (CIQUAL), quantité exigée ═══ */
  let g = await ouvrirAjout(pg);
  g = g && await taper(pg, '#af-desc', 'pâtes sèches');
  await pg.evaluate(() => { try { _afSuggInput(); } catch (e) {} });
  let iCiq = -1;
  for (let k = 0; k < 20 && iCiq < 0; k++) {
    await pause(pg, 250);
    iCiq = await pg.evaluate(() => (typeof _afSuggCiq !== 'undefined' && _afSuggCiq || []).findIndex((a) => a && a[0] === 9810));
  }
  g = g && iCiq >= 0 && await clic(pg, '#af-sugg [onclick="_afSuggPrendreCiqual(' + iCiq + ')"]');
  await pause(pg, 250);
  const avantRefus = (await journal(pg)).length;
  await ajouter(pg);
  const refus2 = (await journal(pg)).length === avantRefus;
  /* ⭐ LE MOTEUR EST LA SEULE RÉFÉRENCE : on compte ses appels pendant la frappe (l'app lit `NUT2` à chaque calcul). */
  await pg.evaluate(() => { const N = window.NUT2; window.__n2calc = 0;
    window.NUT2 = Object.assign({}, N, { calcule: function () { window.__n2calc++; return N.calcule.apply(N, arguments); } }); });
  g = g && await taper(pg, '#af-bc-grams', '140');
  const appels = await pg.evaluate(() => window.__n2calc);
  const affiche140 = await pg.evaluate(() => ['kcal', 'prot', 'carbs', 'fat'].map((c) => document.getElementById('af-' + c).value).join(','));
  await ajouter(pg);
  let L = await journal(pg);
  const p2 = neuves(L, ids0)[0] || null;
  t('B-NV2P P2 ① RECHERCHE : la fiche CIQUAL 9810 se trouve et se prend — et sans quantité, RIEN n\'est ajouté', g && refus2, 'geste ' + g + ' · refus ' + refus2);
  t('B-NV2P P2 ② ⭐⭐ AJOUT : 140 g de la fiche CIQUAL = 510 · 18 · 102 · 2 (calcul à la main), par le moteur',
    !!p2 && memes(vals(p2), A.pates140) && p2.q === 140 && p2.u === 'g', J(p2));
  t('B-NV2P P2 ③ la ligne dit d\'où viennent ses chiffres : fiche CIQUAL « source », pesée, quantité tapée, provenance ciqual',
    !!p2 && p2.n2 && p2.n2.s === 1 && p2.n2.m === 'p' && p2.n2.st === 'fiable' && p2.n2.qo === 'tapee' && p2.n2.f.src === 'ciqual' &&
    p2.n2.f.fiab === 'source' && /^CIQUAL-/.test(p2.n2.f.ver || '') && p2.sourceId === 'ciqual:9810' && p2.saisie === 'ciqual' && p2.origine === 'ciqual' &&
    memes(p2.per100, { kcal: 364, prot: 13.1, carbs: 72.7, fat: 1.6 }), J(p2 && p2.n2));
  t('B-NV2P P2 ④ ⭐⭐ LE MOTEUR EST LA SEULE RÉFÉRENCE : taper la quantité appelle `NUT2.calcule`, et l\'écran montre ce qu\'il rend',
    appels > 0 && affiche140 === '510,18,102,2', appels + ' appel(s) · écran ' + affiche140);

  /* ═══ P3 AJOUT À LA MAIN — grammes d'abord (D-099), poids exigé ═══ */
  g = await ouvrirAjout(pg);
  g = g && await taper(pg, '#af-desc', 'Plat maison (test)');
  for (const [id, v] of [['#af-kcal', '450'], ['#af-prot', '20'], ['#af-carbs', '40'], ['#af-fat', '18']]) g = g && await taper(pg, id, v);
  try { await pg.locator('#af-fat').blur(); } catch (e) { g = false; }
  await pause(pg, 200);
  const ong = await pg.evaluate(() => [...document.querySelectorAll('#af-prop-row button[onclick^="_afSetUnite"]')].map((x) => x.getAttribute('onclick') + (x.getAttribute('aria-pressed') === 'true' ? '*' : '')));
  const n3a = (await journal(pg)).length;
  await ajouter(pg);
  const refus3 = (await journal(pg)).length === n3a;
  const msg3 = (await toastsDepuis(pg)).slice(-1)[0] || '';
  g = g && await taper(pg, '#af-poids', '300');
  try { await pg.locator('#af-poids').blur(); } catch (e) { g = false; }
  await pause(pg, 200);
  await ajouter(pg);
  L = await journal(pg);
  const p3 = L.find((x) => x.name === 'Plat maison (test)') || null;
  t('B-NV2P P3 ① D-099 : l\'onglet GRAMMES est choisi par défaut, ml juste à côté, les portions en dernier', J(ong) === J(['_afSetUnite(\'g\')*', '_afSetUnite(\'ml\')', '_afSetUnite(\'portion\')']), J(ong));
  t('B-NV2P P3 ② ⛔⛔ des valeurs SANS poids ne s\'enregistrent pas, et l\'écran dit quoi faire', g && refus3 && /poids|quantit/i.test(msg3), msg3);
  t('B-NV2P P3 ③ avec 300 g : les valeurs tapées sont gardées telles quelles (450 · 20 · 40 · 18), « déclarées »',
    !!p3 && memes(vals(p3), { kcal: 450, prot: 20, carbs: 40, fat: 18 }) && p3.q === 300 && p3.u === 'g' && p3.n2.st === 'declaree' &&
    p3.saisie === 'manuel' && p3.origine === 'utilisateur', J(p3));

  /* ═══ P4 UNE VALEUR ABSENTE RESTE ABSENTE — et l'écran le dit ═══ */
  g = await ouvrirAjout(pg);
  g = g && await taper(pg, '#af-desc', 'purée de marrons');
  await pg.evaluate(() => { try { _afSuggInput(); } catch (e) {} });
  let iM = -1;
  for (let k = 0; k < 20 && iM < 0; k++) { await pause(pg, 250); iM = await pg.evaluate(() => (typeof _afSuggCiq !== 'undefined' && _afSuggCiq || []).findIndex((a) => a && a[0] === 15015)); }
  g = g && iM >= 0 && await clic(pg, '#af-sugg [onclick="_afSuggPrendreCiqual(' + iM + ')"]');
  await pause(pg, 200);
  g = g && await taper(pg, '#af-bc-grams', '200');
  const champLip = await pg.evaluate(() => document.getElementById('af-fat').value);
  await ajouter(pg);
  L = await journal(pg);
  const p4 = L.find((x) => x.sourceId === 'ciqual:15015') || null;
  await pause(pg, 300);
  const rangee = await pg.evaluate(() => { const r = [...document.querySelectorAll('[onclick^="openEditFood"]')].find((x) => /marrons/i.test(x.textContent)); return r ? r.textContent : ''; });
  const entete = await pg.evaluate(() => document.body.innerText.indexOf('Total partiel') >= 0);
  t('B-NV2P P4 ① ⛔⛔ les lipides « non déterminés » de la fiche restent VIDES à l\'écran (jamais 0)', g && champLip === '', 'champ lipides = « ' + champLip + ' »');
  t('B-NV2P P4 ② ⛔⛔ … et ABSENTS de la ligne (pas de clé), nommés dans n2.manque ; le reste calculé à la main (204 · 5 · 46)',
    !!p4 && !('fat' in p4) && J(p4.n2.manque) === J(['fat']) && memes(vals(p4), Object.assign({ fat: undefined }, A.marrons200)) && p4.q === 200, J(p4));
  t('B-NV2P P4 ③ le journal affiche « L ? » et le haut du jour dit que le total est PARTIEL', /L \?/.test(rangee) && entete, rangee + ' · entête ' + entete);

  /* ═══ P5 SCAN — une boisson est une fiche pour 100 ml ═══ */
  g = await ouvrirAjout(pg);
  g = g && await pg.evaluate((e) => typeof _eanValide === 'function' && _eanValide(e), EAN_JUS);
  g = g && await taper(pg, '#af-bc-manual', EAN_JUS);
  g = g && await clic(pg, 'button[onclick="_manualBarcode()"]');
  await pause(pg, 800);
  const unite5 = await pg.evaluate(() => (document.getElementById('af-bc-unite') || {}).textContent || '');
  const past5 = await pg.evaluate(() => (document.getElementById('af-bc-portion') || {}).textContent || '');
  g = g && await clic(pg, '#af-bc-portion');
  await ajouter(pg);
  L = await journal(pg);
  const p5 = L.find((x) => x.sourceId === EAN_JUS) || null;
  t('B-NV2P P5 ① SCAN : le champ dit « ml », et la portion du fabricant est une PASTILLE en ml (rien de pré-rempli)', g && unite5 === 'ml' && /250\s*ml/.test(past5), unite5 + ' · ' + past5);
  t('B-NV2P P5 ② ⭐⭐ 250 ml × fiche pour 100 ml = 113 · 2 · 25 · 0 (à la main) ; la ligne est en ml, quantité « proposée » puis choisie',
    !!p5 && memes(vals(p5), A.jus250) && p5.q === 250 && p5.u === 'ml' && p5.n2.f.base === 'ml' && p5.n2.qo === 'proposee' &&
    p5.saisie === 'code-tape' && p5.origine === 'off', J(p5));

  /* ═══ P6 MODIFICATION ═══ */
  const ouvrirModif = async (id) => { const ok2 = await pg.evaluate((i) => { try { openEditFood(i); return true; } catch (e) { return false; } }, id); await pause(pg, 250); return ok2; };
  const enregistrer = async () => { const ok2 = await clic(pg, '#ov-edit-food button[onclick="saveEditFood()"]'); await pause(pg, 300); return ok2; };
  /* (a) une ligne V2 pesée : la quantité recalcule */
  g = await ouvrirModif(p2.id);
  g = g && await taper(pg, '#ef-grams', '200');
  g = g && await enregistrer();
  L = await journal(pg);
  const p6a = ligne(L, p2.id);
  t('B-NV2P P6 ① ⭐ MODIFIER une ligne V2 : 200 g recalculés par la fiche (728 · 26 · 145 · 3), même identité, même place',
    g && !!p6a && memes(vals(p6a), A.pates200) && p6a.q === 200 && L.indexOf(p6a) === L.findIndex((x) => x.id === p2.id) && L.filter((x) => x.id === p2.id).length === 1, J(p6a));
  /* (b) une correction à la main est gardée et tracée */
  g = await ouvrirModif(p2.id);
  g = g && await taper(pg, '#ef-kcal', '700');
  g = g && await enregistrer();
  L = await journal(pg);
  const p6b = ligne(L, p2.id);
  t('B-NV2P P6 ② ⭐⭐ une CORRECTION À LA MAIN est gardée (700) et tracée avec le calcul d\'avant (728)',
    g && !!p6b && p6b.kcal === 700 && p6b.n2.corr.length === 1 && p6b.n2.corr[0].c === 'kcal' && p6b.n2.corr[0].v === 700 && p6b.n2.corr[0].avant === 728, J(p6b && p6b.n2));
  /* (c) une ancienne ligne NON vérifiée : modifiée à la demande, sa copie d'origine est gardée */
  const L2avant = ligne(AV, 'nv2p-L2-00000002');
  g = await ouvrirModif('nv2p-L2-00000002');
  const q6c = await pg.evaluate(() => (document.getElementById('ef-q') || {}).value);
  g = g && await taper(pg, '#ef-kcal', '220');
  g = g && await enregistrer();
  L = await journal(pg);
  const p6c = ligne(L, 'nv2p-L2-00000002');
  t('B-NV2P P6 ③ ⛔⛔ une ANCIENNE ligne modifiée à la main garde sa copie d\'origine INTÉGRALE (n2.av), sans fiche inventée',
    g && q6c === '45' && !!p6c && p6c.kcal === 220 && p6c.q === 45 && p6c.u === 'g' && p6c.n2.m === 'd' && p6c.per100 === null &&
    J(p6c.n2.av) === J(L2avant) && p6c.n2.no.indexOf('reprise-non-verifiee') >= 0, J(p6c));
  /* (d) une ancienne ligne SANS quantité : la modification exige la quantité, et ne touche à rien avant */
  const L3avant = ligne(L, 'nv2p-L3-00000003');
  g = await ouvrirModif('nv2p-L3-00000003');
  const q6d = await pg.evaluate(() => (document.getElementById('ef-q') || {}).value);
  await enregistrer();
  const L3refus = ligne(await journal(pg), 'nv2p-L3-00000003');
  g = g && await taper(pg, '#ef-q', '120');
  g = g && await enregistrer();
  L = await journal(pg);
  const p6d = ligne(L, 'nv2p-L3-00000003');
  t('B-NV2P P6 ④ ⛔⛔ une quantité ABSENTE n\'est jamais complétée : champ vide, refus sans rien toucher, puis 120 g tapés',
    g && q6d === '' && J(L3refus) === J(L3avant) && !!p6d && p6d.q === 120 && p6d.u === 'g' && memes(vals(p6d), { kcal: 106, prot: 1, carbs: 24, fat: 0 }), J([q6d, L3refus === null, p6d]));
  /* (e) une ancienne ligne VÉRIFIÉE (CIQUAL à l'identique) : la quantité recalcule par la fiche */
  g = await ouvrirModif('nv2p-L1-00000001');
  g = g && await taper(pg, '#ef-grams', '70');
  g = g && await enregistrer();
  L = await journal(pg);
  const p6e = ligne(L, 'nv2p-L1-00000001');
  t('B-NV2P P6 ⑤ ⭐ une ancienne ligne VÉRIFIÉE recalcule par sa fiche CIQUAL (70 g → 255 · 9 · 51 · 1), copie d\'origine gardée',
    g && !!p6e && memes(vals(p6e), A.pates70) && p6e.n2.m === 'p' && p6e.n2.f.src === 'ciqual' && J(p6e.n2.av) === J(ligne(AV, 'nv2p-L1-00000001')), J(p6e));

  /* ═══ P7 FAVORIS ═══ */
  const idxListe = async (nom) => pg.evaluate((n) => (typeof _afQuickItems !== 'undefined' && _afQuickItems || []).findIndex((x) => x && x.name === n), nom);
  g = await ouvrirAjout(pg);
  let iY = await idxListe('Yaourt (test)');
  const avant7 = (await journal(pg)).map((x) => x.id);
  g = g && iY >= 0 && await clic(pg, '#af-quick-list button[onclick="quickAddFood(' + iY + ')"]');
  await pause(pg, 300);
  L = await journal(pg);
  const p7a = neuves(L, avant7)[0] || null;
  t('B-NV2P P7 ① un ANCIEN favori (fiche non vérifiable) se ré-ajoute tel quel : valeurs ET 125 g recopiés, statut « déclaré », la ligne le dit',
    g && !!p7a && memes(vals(p7a), { kcal: 75, prot: 5, carbs: 6, fat: 3 }) && p7a.q === 125 && p7a.u === 'g' && p7a.n2.m === 'd' &&
    p7a.n2.qo === 'proposee' && p7a.n2.no.indexOf('reprise-non-verifiee') >= 0 && p7a.per100 === null, J(p7a));
  g = await ouvrirAjout(pg);
  const iP = await idxListe('Pâtes sèches, standard, crues');
  g = g && iP >= 0 && await clic(pg, '#af-quick-list button[onclick="toggleFavFood(' + iP + ')"]');
  await pause(pg, 200);
  const fav = await pg.evaluate(() => (S.savedFoods || []).find((x) => x && x.name === 'Pâtes sèches, standard, crues') || null);
  const iP2 = await idxListe('Pâtes sèches, standard, crues');
  const avant7b = (await journal(pg)).map((x) => x.id);
  g = g && iP2 >= 0 && await clic(pg, '#af-quick-list button[onclick="quickAddFood(' + iP2 + ')"]');
  await pause(pg, 300);
  L = await journal(pg);
  const p7b = neuves(L, avant7b)[0] || null;
  t('B-NV2P P7 ② ⭐ un favori pris sur une ligne V2 garde sa fiche et sa provenance (copiées), et se ré-ajoute PAR LA FICHE',
    g && !!fav && fav.n2 && fav.n2.f && fav.n2.f.src === 'ciqual' && !!p7b && p7b.n2.m === 'p' && p7b.n2.f.src === 'ciqual' && p7b.q > 0 && p7b.sourceId === 'ciqual:9810', J([fav, p7b]));

  /* ═══ P8 REPAS HABITUELS ═══ */
  const avant8 = (await journal(pg)).map((x) => x.id);
  const L4a = ligne(await journal(pg), 'nv2p-L4-00000004');
  await capterToasts(pg);
  const carte = await pg.evaluate(() => [...document.querySelectorAll('button[onclick^="_habChoisirMoment"]')].findIndex((x) => /Barre \(test\)/.test(x.textContent)));
  g = carte >= 0;
  let idMoments = null;
  if (g) {
    const el = (await pg.$$('button[onclick^="_habChoisirMoment"]'))[carte];
    try { await el.scrollIntoViewIfNeeded(); await el.click(); } catch (e) { g = false; }
    const m = String((el && await el.getAttribute('onclick')) || '').match(/'(hab-m-\d+)'/);
    idMoments = m ? m[1] : null;
  }
  await pause(pg, 300);
  g = g && !!idMoments && await clic(pg, '#' + idMoments + ' button[onclick$="\'petitdej\')"]');
  await pause(pg, 350);
  L = await journal(pg);
  const p8 = neuves(L, avant8);
  const msg8 = (await toastsDepuis(pg)).slice(-1)[0] || '';
  t('B-NV2P P8 ① REPAS HABITUEL : seul l\'aliment qui a une quantité valide est re-noté (Barre, 45 g, valeurs recopiées)',
    g && p8.length === 1 && p8[0].name === 'Barre (test)' && p8[0].q === 45 && memes(vals(p8[0]), { kcal: 210, prot: 4, carbs: 30, fat: 8 }) &&
    p8[0].n2.no.indexOf('reprise-non-verifiee') >= 0 && p8[0].meal === 'petitdej', J(p8));
  t('B-NV2P P8 ② ⛔⛔ « Banane » (sans quantité) et « Shake » (portion sans poids) ne sont PAS complétés — le message les nomme',
    /Banane/.test(msg8) && /Shake/.test(msg8) && J(ligne(L, 'nv2p-L4-00000004')) === J(L4a), msg8);

  /* ═══ P9 EXPORT ═══ */
  const csv = await pg.evaluate(async () => {
    const vrai = window._csvFichier; let pris = null;
    window._csvFichier = async (cols, rows) => { pris = { cols: cols.slice(), rows: JSON.parse(JSON.stringify(rows)) }; };
    try { await exportNutritionCsv(); } catch (e) { pris = { err: String(e && e.message || e) }; }
    window._csvFichier = vrai; return pris;
  });
  const rPates = csv && csv.rows ? csv.rows.find((r) => r.aliment === 'Pâtes sèches, standard, crues' && r.statut === 'fiable') : null;
  const rMarrons = csv && csv.rows ? csv.rows.find((r) => /marrons/i.test(r.aliment)) : null;
  const rAncien = csv && csv.rows ? csv.rows.find((r) => r.aliment === 'Steak (test)') : null;
  t('B-NV2P P9 ① EXPORT : deux colonnes en plus (statut, valeurs inconnues), les vrais noms de repas (plus de clé brute)',
    !!csv && csv.cols && csv.cols.slice(-2).join(',') === 'statut,valeurs_inconnues' && csv.rows.every((r) => ['petitdej', 'dejeuner', 'diner', 'collation', 'collation2'].indexOf(r.repas) < 0), J(csv && (csv.err || csv.cols)));
  t('B-NV2P P9 ② ⛔ une valeur absente sort VIDE (pas 0) et la colonne dit laquelle ; une ancienne ligne sort « ancienne »',
    !!rPates && !!rMarrons && rMarrons.lipides_g === '' && rMarrons.valeurs_inconnues === 'fat' && !!rAncien && rAncien.statut === 'ancienne', J([rMarrons, rAncien && rAncien.statut]));

  /* ═══ P10 HISTORIQUE — à la fin, ce qu'on n'a pas touché n'a pas bougé d'un octet ═══ */
  L = await journal(pg);
  const intactes = ['nv2p-L4-00000004', 'nv2p-L5-00000008', 'nv2p-L2b-0000005', 'nv2p-L3b-0000006', 'nv2p-L4b-0000007'];
  const bouge = intactes.filter((id) => J(ligne(L, id)) !== J(ligne(AV, id)));
  t('B-NV2P P10 ⛔⛔ HISTORIQUE : aucune ancienne ligne n\'a été modifiée sans un « Enregistrer » de la personne (5 témoins, octet par octet)',
    bouge.length === 0, 'modifiées : ' + bouge.join(', '));
  t('B-NV2P P10 ② aucune erreur de page sur tout le parcours', erreurs.length === 0, erreurs.join(' | '));
  await cx.close();

  /* ═══ P11 SUR UNE PAGE NEUVE — AVANT TOUTE RECHERCHE (deux défauts mesurés le 22/10, corrigés) ═══
     ① La table CIQUAL n'était chargée qu'à la 1ʳᵉ recherche : avant, une ancienne ligne CIQUAL vérifiable était traitée
       en NON vérifiée par « + », « Modifier » et « Mes aliments » (le même aliment se recalculait ou non selon un geste
       fait avant, invisible). ② Une reprise FIGÉE (sans fiche vérifiée) : retoucher une valeur effaçait la quantité
       tapée ; et une AUTRE quantité que celle notée, valeurs non retouchées, enregistrait des chiffres faux. */
  const p11 = await ouvrir(b, PORT);
  try {
    const pg2 = p11.pg;
    await capterToasts(pg2);
    const idx2 = async (nom) => pg2.evaluate((n) => (typeof _afQuickItems !== 'undefined' && _afQuickItems || []).findIndex((x) => x && x.name === n), nom);
    /* ① « + » sur l'ancienne ligne CIQUAL (L1), avant toute recherche → re-notée PAR SA FICHE */
    let g11 = p11.ok && await ouvrirAjout(pg2);
    const i1 = await idx2('Pâtes sèches, standard, crues');
    const av11 = (await journal(pg2)).map((x) => x.id);
    g11 = g11 && i1 >= 0 && await clic(pg2, '#af-quick-list button[onclick="quickAddFood(' + i1 + ')"]');
    await pause(pg2, 700);
    const n11 = neuves(await journal(pg2), av11)[0] || null;
    t('B-NV2P P11 ① ⭐ AVANT TOUTE RECHERCHE, « + » sur une ancienne ligne CIQUAL vérifiable la re-note PAR SA FICHE (140 g · 510 · 18 · 102 · 2)',
      g11 && !!n11 && n11.n2 && n11.n2.m === 'p' && n11.n2.f && n11.n2.f.src === 'ciqual' && n11.q === 140 && memes(vals(n11), A.pates140), J(n11));
    /* ② « Modifier » une ancienne ligne CIQUAL (L1), sur une page où rien n'a encore chargé la table → le champ grammes */
    const p11b = await ouvrir(b, PORT);
    let modif = null;
    try {
      await p11b.pg.evaluate(() => { try { openEditFood('nv2p-L1-00000001'); } catch (e) {} });
      await pause(p11b.pg, 700);
      modif = await p11b.pg.evaluate(() => ({ grams: !!document.getElementById('ef-grams'), statut: (typeof _efR !== 'undefined' && _efR) ? _efR.statut : null }));
    } finally { await p11b.cx.close(); }
    t('B-NV2P P11 ② ⭐ AVANT TOUTE RECHERCHE, « Modifier » une ancienne ligne CIQUAL vérifiable ouvre SA FICHE (champ grammes, statut vérifié)',
      p11b.ok && !!modif && modif.grams && modif.statut === 'verifiee', J(modif));
    /* ③④ la reprise FIGÉE de la barre (L2 : scan d'hier, fiche non vérifiable, 45 g · 210 · 4 · 30 · 8) */
    g11 = await ouvrirAjout(pg2);
    const i3 = await idx2('Barre (test)');
    g11 = g11 && i3 >= 0 && await clic(pg2, '#af-quick-list div[onclick="quickFillFood(' + i3 + ')"]');
    await pause(pg2, 400);
    const av13 = (await journal(pg2)).length;
    g11 = g11 && await taper(pg2, '#af-prop', '30');
    await ajouter(pg2);
    const refus13 = (await journal(pg2)).length === av13;
    const msg13 = (await toastsDepuis(pg2)).slice(-1)[0] || '';
    const note13 = await pg2.evaluate(() => (document.getElementById('af-prop-row') || {}).innerText || '');
    t('B-NV2P P11 ③ ⛔⛔ REPRISE FIGÉE : une AUTRE quantité (30 g) avec les valeurs de 45 g, non retouchées → RIEN n\'est ajouté, et l\'écran dit pourquoi',
      g11 && refus13 && /45/.test(msg13) && /corrige/i.test(msg13) && /recherche/i.test(note13), msg13 + ' · note : ' + note13.slice(0, 160));
    g11 = g11 && await taper(pg2, '#af-kcal', '140');
    try { await pg2.locator('#af-kcal').blur(); } catch (e) { g11 = false; }
    await pause(pg2, 250);
    const garde14 = await pg2.evaluate(() => (document.getElementById('af-prop') || {}).value);
    const av14 = (await journal(pg2)).map((x) => x.id);
    await ajouter(pg2);
    const n14 = neuves(await journal(pg2), av14)[0] || null;
    t('B-NV2P P11 ④ ⭐ … la personne corrige les calories (140) : la quantité tapée RESTE dans le champ, et la ligne est la sienne (30 g · 140 · 4 · 30 · 8, déclarée)',
      g11 && garde14 === '30' && !!n14 && n14.q === 30 && n14.u === 'g' && memes(vals(n14), { kcal: 140, prot: 4, carbs: 30, fat: 8 }) &&
      n14.n2.m === 'd' && n14.per100 === null && n14.n2.no.indexOf('reprise-non-verifiee') >= 0, J([garde14, n14]));
    t('B-NV2P P11 ⑤ aucune erreur de page sur les pages neuves', p11.erreurs.length === 0, p11.erreurs.join(' | '));
  } finally { await p11.cx.close(); }

  /* ═══ P12 LES PORTES JUMELLES DES REPRISES (jalon 4, 22/10) ═══
     Une même ligne passe par DEUX écrivains (« + Ajouter » dans « Mes aliments », « Tes repas habituels ») et par DEUX écrans
     (« Mes aliments », la recherche dans ton journal). En V1 ils divergeaient — et c'était TRANSPORTÉ exprès
     (`docs/SOUS-ETAPES-1B-3.md` §3, décisions produit n°1, n°3, n°4). Avec l'écrivain unique, ils disent la même chose :
     c'est D-101 ⑩ (PROPOSÉ) — ces témoins FIGENT ce que la V2 fait, pour qu'un changement redevienne un choix visible.
     ⛔ Les attendus sont écrits à la main (fixture `JUMELLES`), jamais lus dans le moteur. */
  const p12 = await ouvrir(b, PORT, fixtureJumelles());
  try {
    const R12 = await p12.pg.evaluate(async (CAS) => {
      const d = (ms) => new Promise((r) => setTimeout(r, ms));
      const champs = (l) => l ? { name: l.name, kcal: l.kcal, prot: l.prot, carbs: l.carbs, fat: l.fat, q: l.q, u: l.u, pl: l.portionLabel, pw: l.portionWeightG,
        per100: l.per100, sourceId: l.sourceId, etat: l.etat, saisie: l.saisie, origine: l.origine, m: l.n2 && l.n2.m, st: l.n2 && l.n2.st, no: l.n2 && l.n2.no } : null;
      const ecranEtat = () => { const v = (id) => (document.getElementById(id) || {}).value; const row = document.getElementById('af-bc-row');
        const last = document.getElementById('af-bc-last'), pp = document.getElementById('af-prop-pastille'), bc = !!(row && row.style.display !== 'none');
        return { desc: v('af-desc'), vals: [v('af-kcal'), v('af-prot'), v('af-carbs'), v('af-fat')].join('·'), bc: bc,
          dernier: (bc && last && last.style.display === 'inline-block') ? last.dataset.q : null, grams: bc ? v('af-bc-grams') : null,
          fige: !!(typeof _afRef === 'object' && _afRef && _afRef.fige), prop: bc ? null : v('af-prop'),
          proposee: (pp && pp.style.display !== 'none') ? pp.dataset.q : null, prov: _n2Provenance(),
          fiche: (bc && _bcNutr) ? (({ cle, etat, source, fiab }) => ({ cle, etat, source, fiab }))(_n2FicheBc()) : null }; };
      const out = { ecrivains: {}, ecrans: {} }, vt = window.toast;
      /* ⏰ Le repas de l'ajout rapide est FIXÉ (« Dîner ») : il suivait l'HEURE, et avant 11 h il tombait dans « Petit-déj », le
         repas de C1 — l'habitude notée aujourd'hui était alors écartée et ① rougissait la moitié de la journée (mesuré le 23/10
         à 00:05 UTC). Le soir, c'était déjà « Dîner » : ce témoin a toujours été vert dans cette configuration-là. */
      setFoodMeal('diner');
      for (const k of Object.keys(CAS)) {
        const nom = CAS[k].name, meal = CAS[k].meal;
        /* ① « + Ajouter » dans « Mes aliments » */
        openAddFood(); await d(150);
        const i = (_afQuickItems || []).findIndex((x) => x && x.name === nom);
        let n0 = S.foodLog.length, m1 = []; window.toast = (m) => m1.push(String(m));
        try { if (i >= 0) quickAddFood(i); } catch (e) { m1.push('ERR ' + e.message); }
        await d(250); window.toast = vt;
        const la = S.foodLog.length > n0 ? S.foodLog[S.foodLog.length - 1] : null;
        const ecranOuvert = !!(document.getElementById('ov-add-food') || {}).classList && document.getElementById('ov-add-food').classList.contains('open');
        try { closeAddFood(); } catch (e) {}
        /* ② « Tes repas habituels » — le même repas, re-noté */
        const h = (_repasHabituels() || []).find((x) => x && (x.items || []).some((it) => it && it.name === nom));
        n0 = S.foodLog.length; const m2 = []; window.toast = (m) => m2.push(String(m));
        try { if (h) rejouerRepas(h.sig, meal); } catch (e) { m2.push('ERR ' + e.message); }
        await d(250); window.toast = vt;
        const lr = S.foodLog.slice(n0).find((x) => x && x.name === nom) || null;
        out.ecrivains[k] = { trouve: i >= 0, habituel: !!h, ajout: champs(la), rejeu: champs(lr), demande: ecranOuvert,
                             msgAjout: m1.slice(-1)[0] || '', msgRejeu: m2.slice(-1)[0] || '' };
        /* ③ l'écran, par « Mes aliments » */
        openAddFood(); await d(150);
        const j = (_afQuickItems || []).findIndex((x) => x && x.name === nom);
        try { if (j >= 0) quickFillFood(j); } catch (e) {}
        await d(250); const e1 = ecranEtat(); try { closeAddFood(); } catch (e) {}
        /* ④ l'écran, par la recherche dans ton journal */
        openAddFood(); await d(150);
        _afSuggLoc = _afSuggLocales(nom); const nl = _afSuggLoc.length;
        try { if (nl) _afSuggPrendreLocale(0); } catch (e) {}
        await d(250); const e2 = ecranEtat(); try { closeAddFood(); } catch (e) {}
        out.ecrans[k] = { liste: e1, journal: e2, trouve: j >= 0 && nl > 0 };
      }
      return out;
    }, JUMELLES);
    const W = R12.ecrivains, E = R12.ecrans;
    const sans = (o, k) => { if (!o) return o; const c = Object.assign({}, o); delete c[k]; return c; };
    /* ① les deux écrivains écrivent LA MÊME ligne (hors identité, jour et repas) */
    t('B-NV2P P12 ① ⭐⭐ JUMELLES : « + Ajouter » et « Tes repas habituels » écrivent la MÊME ligne (valeurs, quantité, fiche, provenance, statut) pour les 4 lignes reprenables',
      ['C1', 'C2', 'C3', 'C4'].every((k) => W[k] && W[k].trouve && W[k].habituel && !!W[k].ajout && J(W[k].ajout) === J(W[k].rejeu)),
      J(['C1', 'C2', 'C3', 'C4'].map((k) => W[k] && [k, W[k].ajout, W[k].rejeu])).slice(0, 600));
    /* ② une ligne d'avant V2 NON vérifiable : recopiée telle quelle — aucune fiche fabriquée (M1), aucune provenance empruntée */
    const c1 = W.C1 && W.C1.ajout;
    /* 24/10 (NV2-FIAB, D-130 — remplace D-101 ⑩ n°1, sur l'IDENTITÉ seulement) : la copie garde le code-barres et l'état du
       PRODUIT — sans eux, sa fiche ne pouvait plus jamais être retrouvée (l'isolat figé de Michel) et la copie échappait aux
       contrôles de son produit (doublons, « ✕ »). ⛔ Toujours AUCUNE fiche, aucun pour-100 g : ses valeurs restent « déclarées »,
       « non vérifié » — l'identité dit QUEL produit, jamais d'où viennent les valeurs (R33). Mutations : MP17 (une fiche
       fabriquée) et MP85 (l'identité perdue). */
    t('B-NV2P P12 ② ⛔⛔ NON VÉRIFIÉE (code-barres d\'hier) : valeurs ET 150 g recopiés, statut « déclaré », la ligne le dit — pas de pour-100 g, aucune fiche ; l\'identité du produit gardée (D-130)',
      !!c1 && memes(vals(c1), { kcal: 195, prot: 4, carbs: 42, fat: 1 }) && c1.q === 150 && c1.u === 'g' && c1.per100 === null && c1.sourceId === '3000000000301' && c1.etat === 'tel-que-vendu' &&
      c1.m === 'd' && c1.st === 'declaree' && (c1.no || []).indexOf('reprise-non-verifiee') >= 0 && c1.saisie === 'liste' && c1.origine === 'reprise', J(c1));
    /* ③ D-099 : une portion avec son poids reste une portion ; des ml restent des ml — jamais convertis */
    const c2 = W.C2 && W.C2.ajout, c3 = W.C3 && W.C3.ajout;
    t('B-NV2P P12 ③ ⭐ « 2 × steak (125 g) » reste 2 portions de 125 g, et « 250 ml » reste 250 ml (D-099 : rien n\'est converti), valeurs recopiées',
      !!c2 && c2.q === 2 && c2.u === 'portion' && c2.pl === 'steak' && c2.pw === 125 && memes(vals(c2), { kcal: 400, prot: 32, carbs: 0, fat: 28 }) &&
      !!c3 && c3.q === 250 && c3.u === 'ml' && memes(vals(c3), { kcal: 115, prot: 8, carbs: 12, fat: 4 }), J([c2, c3]));
    /* ④ une ligne V2 pesée : recalculée PAR SA FICHE, et sa provenance (code, état) la suit — aux deux portes */
    const c4 = W.C4 && W.C4.ajout;
    t('B-NV2P P12 ④ ⭐⭐ LIGNE V2 (fiche Open Food Facts) : 30 g recalculés par la fiche (114 · 23 · 2 · 2), code-barres et état repris PARCE QU\'ILS VIENNENT DE LA FICHE, statut « fiable »',
      !!c4 && memes(vals(c4), { kcal: 114, prot: 23, carbs: 2, fat: 2 }) && c4.q === 30 && c4.u === 'g' && J(c4.per100) === J({ kcal: 380, prot: 75, carbs: 8, fat: 5 }) &&
      c4.sourceId === '3000000000304' && c4.etat === 'tel-que-vendu' && c4.m === 'p' && c4.st === 'fiable' && c4.origine === 'reprise', J(c4));
    /* ⑤ rien n'est complété : sans quantité, ou une portion sans poids */
    t('B-NV2P P12 ⑤ ⛔⛔ « Pomme » (sans quantité) et « Shaker » (portion sans poids) : « + Ajouter » n\'écrit rien et DEMANDE la quantité ; le repas habituel n\'écrit rien et les NOMME',
      ['C5', 'C6'].every((k) => W[k] && W[k].trouve && !W[k].ajout && !W[k].rejeu && /quantit/i.test(W[k].msgAjout)) &&
      /Pomme/.test((W.C5 || {}).msgRejeu || '') && /Shaker/.test((W.C5 || {}).msgRejeu || ''), J(['C5', 'C6'].map((k) => W[k])));
    /* ⑥ les deux écrans montrent LA MÊME chose ; seule la façon d'y arriver (`saisie`) diffère, et c'est voulu */
    t('B-NV2P P12 ⑥ ⭐⭐ JUMELLES À L\'ÉCRAN : « Mes aliments » et la recherche dans ton journal préparent le MÊME écran pour les 6 lignes — seule la saisie diffère (liste / historique), l\'origine est « reprise »',
      Object.keys(JUMELLES).every((k) => E[k] && E[k].trouve && J(sans(E[k].liste, 'prov')) === J(sans(E[k].journal, 'prov')) &&
        E[k].liste.prov.saisie === 'liste' && E[k].journal.prov.saisie === 'historique' && E[k].liste.prov.origine === 'reprise' && E[k].journal.prov.origine === 'reprise'),
      J(Object.keys(JUMELLES).map((k) => E[k] && [k, E[k].liste, E[k].journal])).slice(0, 700));
    /* ⑦ ce que l'écran propose — jamais imposé (ft-v1051, D-099) */
    const e = (k) => (E[k] || {}).liste || {};
    t('B-NV2P P12 ⑦ ⭐ À L\'ÉCRAN, LA QUANTITÉ D\'AVANT EST PROPOSÉE, JAMAIS POSÉE : non vérifiées → « 150 » · « 2 » · « 250 » en pastille, champ vide ; fiche V2 → « 30 g (la dernière fois) », champ vide ; sans quantité → rien',
      e('C1').fige && e('C1').proposee === '150' && e('C1').prop === '' && !e('C1').bc &&
      e('C2').proposee === '2' && e('C3').proposee === '250' &&
      e('C4').bc && !e('C4').fige && e('C4').dernier === '30' && e('C4').grams === '' && J(e('C4').fiche) === J({ cle: '3000000000304', etat: 'tel-que-vendu', source: 'off', fiab: 'source' }) &&
      e('C5').proposee === null && e('C6').proposee === null && !e('C5').bc && !e('C6').bc,
      J(['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map((k) => [k, e(k)])).slice(0, 700));
    t('B-NV2P P12 ⑧ aucune erreur de page sur les portes jumelles', p12.erreurs.length === 0, p12.erreurs.join(' | '));
  } finally { await p12.cx.close(); }

  /* ═══ P13 LES CORRECTIFS DE LA RÉVISION (jalon 4, 22/10) ═══
     En révisant les témoins V1 sur le contrat V2, la mesure a trouvé de VRAIS défauts du branchement, corrigés le jour même.
     Chacun a ici son témoin conduit à l'écran (et sa mutation dans `tools/mut_nut2_parcours.py`) — sinon le correctif
     n'est protégé par rien. ⛔ Attendus écrits à la main. */
  const p13 = await ouvrir(b, PORT, fixtureCorrectifs());
  try {
    const pg = p13.pg;
    await capterToasts(pg);
    /* deux lignes V2, écrites par le moteur : une pesée sur sa fiche (2 pots de 125 g · 82 kcal / 100 g = 205 · 10 · 30 · 5),
       une déclarée (2 parts de 140 g, valeurs notées 355 · 30 · 44 · 6) — chacune avec une quantité d'origine « portion » */
    const v2 = await pg.evaluate(() => {
      const t = today(), err = [];
      const r2 = NUT2.ligneNouvelle({ id: 'nv2s-E2-00000002', ts: Date.now() - 5e6, date: t, repas: 'dejeuner', nom: 'Pot P13 (test)',
        origine: { saisie: 'code-tape', origine: 'off' }, mode: 'pesee',
        fiche: { base: 'g', p100: { kcal: 82, prot: 4, carbs: 12, fat: 2 }, cle: '3000000000403', source: 'off', fiab: 'source' },
        quantite: { val: 2, unite: 'portion', origine: 'portion', portion: { libelle: 'pot', poids: 125, unite: 'g' } } });
      const r5 = NUT2.ligneNouvelle({ id: 'nv2s-E5-00000005', ts: Date.now() - 4e6, date: t, repas: 'diner', nom: 'Galette P13 (test)',
        origine: { saisie: 'manuel', origine: 'utilisateur' }, mode: 'declaree', declare: { kcal: 355, prot: 30, carbs: 44, fat: 6 },
        quantite: { val: 2, unite: 'portion', origine: 'portion', portion: { libelle: 'part', poids: 140, unite: 'g' } } });
      [r2, r5].forEach((r) => { if (r.ok) S.foodLog.push(r.ligne); else err.push(r.erreur); });
      persist(); renderFoodJournal(); return err;
    });
    const fermer = () => pg.evaluate(() => { try { closeAddFood(); } catch (e) {} document.querySelectorAll('.overlay.open').forEach((x) => x.classList.remove('open')); });
    const ouvrirModif = async (id) => { await fermer(); const ok2 = await pg.evaluate((i) => { try { openEditFood(i); return true; } catch (e) { return false; } }, id); await pause(pg, 260); return ok2; };
    const enregistrer = async () => { const ok2 = await clic(pg, '#ov-edit-food button[onclick="saveEditFood()"]'); await pause(pg, 320); return ok2; };
    const vider = () => pg.evaluate(() => { const v = (window.__toasts || []).slice(); window.__toasts = []; return v; });
    const coherence = (pfx) => pg.evaluate((p) => { const el = document.getElementById(p + '-coherence');
      return el ? { vu: el.style.display !== 'none', txt: el.textContent.replace(/\s+/g, ' ') } : { vu: false, txt: '(absent)' }; }, pfx);
    const champ = (id) => pg.evaluate((i) => (document.getElementById(i) || {}).value, id);
    const etatPortion = () => pg.evaluate(() => ({ kcal: (document.getElementById('af-kcal') || {}).value, n: _afPortions, pw: _afPortionPoids,
      def: (document.getElementById('af-pdef') || { textContent: '' }).textContent.replace(/\s+/g, ' ') }));
    let L13 = await journal(pg);

    /* ① ② D-101 ⑧ DANS « MODIFIER » (la jumelle de l'écran d'ajout) : des valeurs notées pour 45 g ne valent pas pour 90 g */
    const e1Avant = ligne(L13, 'nv2s-E1-00000001');
    let g = await ouvrirModif('nv2s-E1-00000001');
    const e1q = await champ('ef-q');
    g = g && await taper(pg, '#ef-q', '90'); await vider();
    g = g && await enregistrer();
    const e1Refus = await vider();
    const e1Intact = J(ligne(await journal(pg), 'nv2s-E1-00000001')) === J(e1Avant);
    g = g && await taper(pg, '#ef-kcal', '420');
    g = g && await enregistrer();
    const e1Apres = ligne(await journal(pg), 'nv2s-E1-00000001');
    t('B-NV2P P13 ① ⛔⛔ « MODIFIER » (D-101 ⑧, la jumelle) : 90 g sur des valeurs notées pour 45 g, SANS les retoucher, est REFUSÉ — le message dit « pour 45 g » et la ligne ne bouge pas d\'un octet',
      g && e1q === '45' && e1Refus.some((m) => /Ces valeurs valent pour 45 g/.test(m)) && e1Intact, J({ e1q, e1Refus, e1Intact }));
    t('B-NV2P P13 ② ⭐ … les valeurs RETOUCHÉES (420 kcal), les 90 g passent : « déclarée », copie d\'origine gardée (45 g)',
      g && !!e1Apres && e1Apres.q === 90 && e1Apres.u === 'g' && e1Apres.kcal === 420 && e1Apres.n2.m === 'd' && !!e1Apres.n2.av && e1Apres.n2.av.q === 45, J(e1Apres));

    /* ③ « Mettre X kcal » sur une ligne À FICHE : l'écran et la ligne disent la même chose */
    g = await ouvrirModif('nv2s-E2-00000002');
    const e2Prop = await champ('ef-prop');
    g = g && await taper(pg, '#ef-kcal', '999');
    const e2Coh = await coherence('ef');
    g = g && await clic(pg, '#ef-coherence button');
    await pause(pg, 200);
    const e2Ecran = await champ('ef-kcal');
    g = g && await enregistrer();
    const e2Apres = ligne(await journal(pg), 'nv2s-E2-00000002');
    t('B-NV2P P13 ③ ⭐⭐ « Mettre 205 kcal » sur une ligne À FICHE : l\'écran ET la ligne disent 205 (jamais les 999 tapés) — 205 est le calcul de la fiche, aucune correction ne reste tracée',
      g && e2Prop === '2' && e2Coh.vu && /Mettre 205 kcal/.test(e2Coh.txt) && e2Ecran === '205' && !!e2Apres && e2Apres.kcal === 205
      && e2Apres.q === 2 && e2Apres.u === 'portion' && Array.isArray(e2Apres.n2.corr) && e2Apres.n2.corr.length === 0, J({ e2Prop, e2Coh, e2Ecran, e2Apres: e2Apres && e2Apres.n2 }));

    /* ④ le contrôle de masse lit la quantité de « Modifier » (`ef-q`), À LA FRAPPE */
    g = await ouvrirModif('nv2s-E3-00000003');
    const e3Ouvert = await coherence('ef');
    g = g && await taper(pg, '#ef-q', '40'); const e3a40 = await coherence('ef');
    g = g && await taper(pg, '#ef-q', '20'); const e3a20 = await coherence('ef');
    t('B-NV2P P13 ④ ⭐⭐ « MODIFIER » : le contrôle de masse lit la quantité tapée — 28 g de macros dans 5 g : dit ; 40 g : se tait ; 20 g : le redit',
      g && e3Ouvert.vu && /ne tiennent pas dans 5 g/.test(e3Ouvert.txt) && !e3a40.vu && e3a20.vu && /ne tiennent pas dans 20 g/.test(e3a20.txt),
      J({ e3Ouvert, e3a40, e3a20 }));

    /* ⑤ la même ligne, REPRISE (figée) : toucher « ↩ 5 g » déclenche le même contrôle */
    await fermer();
    g = await ouvrirAjout(pg);
    const iIso = await pg.evaluate(() => { const i = (_afQuickItems || []).findIndex((x) => x && x.name === 'Iso P13 (test)'); if (i >= 0) quickFillFood(i); return i; });
    await pause(pg, 300);
    const fige5 = await pg.evaluate(() => ({ fige: !!(_afRef && _afRef.fige), q: (document.getElementById('af-prop-pastille') || { dataset: {} }).dataset.q }));
    const cohAvant = await coherence('af');
    g = g && iIso >= 0 && await clic(pg, '#af-prop-pastille');
    await pause(pg, 250);
    const cohApres = await coherence('af');
    t('B-NV2P P13 ⑤ ⭐⭐ REPRISE FIGÉE : toucher « ↩ 5 g (la dernière fois) » déclenche le contrôle — une valeur fausse de son journal ne se recopie pas EN SILENCE (ft-v1104)',
      g && fige5.fige && fige5.q === '5' && !cohAvant.vu && cohApres.vu && /ne tiennent pas dans 5 g/.test(cohApres.txt), J({ iIso, fige5, cohAvant, cohApres }));

    /* ⑥ portions : une valeur retouchée fait de l'écran « 1 portion » de ce qui valait DEUX — le poids d'avant ne vaut plus */
    await fermer();
    g = await ouvrirAjout(pg);
    g = g && await taper(pg, '#af-desc', 'Dose P13 (test)');
    for (const [id, v] of [['#af-kcal', '156'], ['#af-prot', '26'], ['#af-carbs', '1'], ['#af-fat', '1']]) g = g && await taper(pg, id, v);
    try { await pg.locator('#af-fat').blur(); } catch (e) { g = false; }
    await pause(pg, 200);
    g = g && await clic(pg, '#af-prop-row button[onclick="_afSetUnite(\'portion\')"]'); await pause(pg, 220);
    g = g && await clic(pg, '#af-prop-row button[onclick="_afApplyPortion(2)"]'); await pause(pg, 220);
    g = g && await clic(pg, '#af-prop-row button[onclick="_afPortionNom(\'dose\')"]'); await pause(pg, 220);
    g = g && await taper(pg, '#af-ppoids', '30'); await pause(pg, 200);
    const e6Avant = await etatPortion();
    g = g && await taper(pg, '#af-kcal', '310');
    try { await pg.locator('#af-kcal').blur(); } catch (e) { g = false; }
    await pause(pg, 250);
    const e6Apres = await etatPortion();
    const n6 = (await journal(pg)).length; await vider();
    await ajouter(pg);
    const e6Ajout = (await journal(pg)).length > n6, e6Msg = await vider();
    t('B-NV2P P13 ⑥ ⛔⛔ PORTIONS : « 2 doses de 30 g » puis une valeur retouchée — l\'écran devient « 1 portion » de ce qui valait DEUX, le poids de 30 g ne vaut plus : il est REDEMANDÉ, rien ne part sans lui',
      g && e6Avant.kcal === '312' && e6Avant.n === 2 && e6Avant.pw === 30 && e6Apres.kcal === '310' && e6Apres.n === 1 && e6Apres.pw === 0
      && /poids inconnu/.test(e6Apres.def) && /Indique le poids d'une portion/.test(e6Apres.def) && !e6Ajout
      && e6Msg.some((m) => /portions|poids|grammes/i.test(m)), J({ e6Avant, e6Apres, e6Ajout, e6Msg }));

    /* ⑪ (placé après ⑥, son voisin) D-101 ⑬ — RETOUR À L'ONGLET PORTIONS avec « ×1 » : le seul chemin où le garde de l'onglet (`_afSetUnite`)
       protège SEUL. Avec ×2, une valeur retouchée remet déjà le poids à zéro ; avec ×1, rien d'autre. Mesuré au contrôle
       négatif du 22/10 : sans ce témoin, retirer ce garde ne faisait rougir AUCUN témoin de la passe (MP35). */
    await fermer();
    g = await ouvrirAjout(pg);
    g = g && await taper(pg, '#af-desc', 'Dose1 P13 (test)');
    for (const [id, v] of [['#af-kcal', '156'], ['#af-prot', '26'], ['#af-carbs', '1'], ['#af-fat', '1']]) g = g && await taper(pg, id, v);
    try { await pg.locator('#af-fat').blur(); } catch (e) { g = false; }
    await pause(pg, 200);
    g = g && await clic(pg, '#af-prop-row button[onclick="_afSetUnite(\'portion\')"]'); await pause(pg, 220);
    g = g && await clic(pg, '#af-prop-row button[onclick="_afApplyPortion(1)"]'); await pause(pg, 220);
    g = g && await clic(pg, '#af-prop-row button[onclick="_afPortionNom(\'dose\')"]'); await pause(pg, 220);
    g = g && await taper(pg, '#af-ppoids', '30'); await pause(pg, 200);
    const e6bAvant = await etatPortion();
    g = g && await clic(pg, '#af-prop-row button[onclick="_afSetUnite(\'g\')"]'); await pause(pg, 220);
    g = g && await clic(pg, '#af-prop-row button[onclick="_afSetUnite(\'portion\')"]'); await pause(pg, 250);
    const e6bApres = await etatPortion();
    const n6b = (await journal(pg)).length; await vider();
    await ajouter(pg);
    const e6bAjout = (await journal(pg)).length > n6b, e6bMsg = await vider();
    t('B-NV2P P13 ⑪ ⛔⛔ RETOUR À L\'ONGLET PORTIONS (×1) : « 1 dose de 30 g » → grammes → portions — le poids de 30 g est REDEMANDÉ (D-101 ⑬), rien ne part sans lui',
      g && e6bAvant.n === 1 && e6bAvant.pw === 30 && e6bApres.n === 1 && e6bApres.pw === 0
      && /Indique le poids d'une portion/.test(e6bApres.def) && !e6bAjout && e6bMsg.some((m) => /portion|poids|grammes/i.test(m)),
      J({ e6bAvant, e6bApres, e6bAjout, e6bMsg }));

    /* ⑦ défense en profondeur : une reprise FIGÉE n'est jamais redimensionnée, même par les fonctions internes de rescale */
    await fermer();
    g = await ouvrirAjout(pg);
    const e7 = await pg.evaluate(() => {
      const i = (_afQuickItems || []).findIndex((x) => x && x.name === 'Riz P13 (test)'); if (i < 0) return { trouve: false };
      quickFillFood(i);
      const v = (id) => (document.getElementById(id) || {}).value, vals = () => [v('af-kcal'), v('af-prot'), v('af-carbs'), v('af-fat')].join('/');
      const f = document.getElementById('af-prop'); if (f) { f.value = '300'; f.dispatchEvent(new Event('input', { bubbles: true })); }
      const a = vals(); _afApplyProp(); const b2 = vals(); _afProp(2); const c = vals();
      return { trouve: true, fige: !!(_afRef && _afRef.fige), a, b: b2, c };
    });
    t('B-NV2P P13 ⑦ ⛔ DÉFENSE EN PROFONDEUR : une reprise FIGÉE n\'est jamais redimensionnée, même par les fonctions internes de rescale (195 · 4 · 42 · 1 restent, 300 g tapés)',
      g && e7.trouve && e7.fige && e7.a === '195/4/42/1' && e7.b === e7.a && e7.c === e7.a, J(e7));

    /* ⑧ un code-barres lu SANS origine dite : la provenance est la caméra, jamais l'ancien « scan » que le moteur refuse */
    await fermer();
    g = await ouvrirAjout(pg);
    const e8 = await pg.evaluate(async (ean) => { await _lookupBarcode(ean); await new Promise((r) => setTimeout(r, 300)); return _n2Provenance(); }, EAN_JUS);
    g = g && await taper(pg, '#af-bc-grams', '200');
    const n8 = (await journal(pg)).length;
    await ajouter(pg);
    const L8 = await journal(pg), e8l = L8.length > n8 ? L8[L8.length - 1] : null;
    t('B-NV2P P13 ⑧ ⛔ UN CODE-BARRES LU SANS ORIGINE DITE : provenance « caméra » (camera-code-local), jamais l\'ancien « scan » que le moteur refuse — la ligne s\'écrit (200 ml · 90 kcal)',
      g && !!e8 && e8.saisie === 'camera-code-local' && !!e8l && e8l.saisie === 'camera-code-local' && e8l.origine === 'off' && e8l.q === 200 && e8l.u === 'ml' && e8l.kcal === 90,
      J({ e8, e8l }));

    /* ⑨ « Modifier » puis « Enregistrer » sans rien toucher GARDE l'origine de la quantité */
    const origines = {};
    for (const id of ['nv2s-E2-00000002', 'nv2s-E5-00000005', 'nv2s-E4-00000004']) {
      const av = ligne(await journal(pg), id);
      let g9 = await ouvrirModif(id); g9 = g9 && await enregistrer();
      const ap = ligne(await journal(pg), id);
      origines[id.slice(5, 7)] = { g: g9, avant: av && av.n2 ? av.n2.qo : null, apres: ap && ap.n2 ? ap.n2.qo : null, q: ap && ap.q, u: ap && ap.u, kcal: ap && ap.kcal };
    }
    const o2 = origines.E2, o5 = origines.E5, o4 = origines.E4;
    t('B-NV2P P13 ⑨ ⭐ « MODIFIER » SANS RIEN TOUCHER GARDE L\'ORIGINE DE LA QUANTITÉ : « portion » reste « portion » (ligne à fiche ET ligne déclarée) ; une ancienne ligne devient « proposée » — jamais « tapée »',
      o2.g && o2.avant === 'portion' && o2.apres === 'portion' && o2.q === 2 && o2.kcal === 205
      && o5.g && o5.avant === 'portion' && o5.apres === 'portion' && o5.q === 2 && o5.u === 'portion' && o5.kcal === 355
      && o4.g && o4.avant === null && o4.apres === 'proposee' && o4.q === 150 && o4.kcal === 195, J({ v2, origines }));
    t('B-NV2P P13 ⑩ aucune erreur de page sur les correctifs', p13.erreurs.length === 0 && v2.length === 0, J({ erreurs: p13.erreurs, v2 }));
  } finally { await p13.cx.close(); }

  /* ═══ P14 D-103 — « 3 PORTIONS (450 G) » (Michel, 22/10, tranche D-101 ⑯) ═══
     Une quantité se dit d'UNE façon partout où l'app la montre ; le total en grammes n'apparaît que si le poids d'UNE
     portion est connu ET fiable (ligne V2 pesée dont la fiche redonne exactement ses valeurs). Les grammes restent la
     référence du calcul ; rien n'est pré-rempli ; AUCUNE ligne enregistrée ne bouge. ⛔ Attendus écrits à la main :
     riz 130 · 2,7 · 28 · 0,7 pour 100 g → 450 g = 585 · 12,15 → 12 · 126 · 3,15 → 3 ; 300 g = 390 · 8,1 → 8 · 84 · 2,1 → 2 ;
     2 portions de 150 g = 300 g (mêmes valeurs). Yaourt 80 · 4 · 10 · 3 pour 100 g, 1,5 × 125 g = 187,5 g. */
  const p14 = await ouvrir(b, PORT, fixtureD103());
  try {
    const pg = p14.pg;
    await capterToasts(pg);
    const RIZ = { kcal: 130, prot: 2.7, carbs: 28, fat: 0.7 };
    const v2 = await pg.evaluate((RIZ) => {
      const pad = (n) => String(n).padStart(2, '0'), J0 = (k) => { const x = new Date(); x.setDate(x.getDate() - k); return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()); };
      const err = [], L = [];
      const ecrire = (o) => { const r = NUT2.ligneNouvelle(o); if (r.ok) L.push(r.ligne); else err.push(o.nom + ':' + r.erreur); return r.ok ? r.ligne : null; };
      const pesee = (id, k, repas, nom, p100, q, extra) => Object.assign({ id: id, ts: Date.now() - 9e6 + k * 1000, date: J0(k), repas: repas, nom: nom,
        origine: { saisie: 'code-tape', origine: 'off' }, mode: 'pesee', fiche: { base: 'g', p100: p100, cle: '3000000000' + id.slice(5, 7).replace('F', '5') + '01', source: 'off', fiab: 'source' },
        quantite: q }, extra || {});
      const riz3 = { val: 3, unite: 'portion', origine: 'portion', portion: { libelle: 'part', poids: 150, unite: 'g' } };
      /* F1 « Riz » — 3 parts de 150 g, deux jours de suite (un repas habituel) */
      ecrire(pesee('nv2t-F1-00000002', 2, 'dejeuner', 'Riz P14 (test)', RIZ, riz3));
      ecrire(pesee('nv2t-F1-00000003', 1, 'dejeuner', 'Riz P14 (test)', RIZ, riz3));
      /* F6 « Yaourt » — 1,5 pot de 125 g */
      ecrire(pesee('nv2t-F6-00000004', 1, 'collation', 'Yaourt P14 (test)', { kcal: 80, prot: 4, carbs: 10, fat: 3 },
        { val: 1.5, unite: 'portion', origine: 'portion', portion: { libelle: 'pot', poids: 125, unite: 'g' } }));
      /* F5 « Thon » — 150 g */
      ecrire(pesee('nv2t-F5-00000005', 1, 'diner', 'Thon P14 (test)', { kcal: 110, prot: 26, carbs: 0, fat: 1 }, { val: 150, unite: 'g', origine: 'tapee' }));
      /* F4 « Galette » — 2 parts de 100 g, kcal CORRIGÉES à la main (300 au lieu de 360) : le poids reste fiable */
      ecrire(pesee('nv2t-F4-00000006', 1, 'diner', 'Galette P14 (test)', { kcal: 180, prot: 6, carbs: 30, fat: 4 },
        { val: 2, unite: 'portion', origine: 'portion', portion: { libelle: 'part', poids: 100, unite: 'g' } },
        { corrections: [{ c: 'kcal', v: 300, le: Date.now() - 9e6, avant: 360 }] }));
      /* F7 « Galette d » — 2 parts de 140 g DÉCLARÉES (une copie d'ancienne ligne : poids non fiable) */
      ecrire({ id: 'nv2t-F7-00000007', ts: Date.now() - 8e6, date: J0(1), repas: 'collation', nom: 'Crêpe P14 (test)',
        origine: { saisie: 'liste', origine: 'reprise' }, mode: 'declaree', declare: { kcal: 355, prot: 30, carbs: 44, fat: 6 },
        quantite: { val: 2, unite: 'portion', origine: 'proposee', portion: { libelle: 'part', poids: 140, unite: 'g' } } });
      /* F8 « Pâtes » — 450 g, en GRAMMES : la même masse que le riz (une portion proposée ne doit pas déborder sur elle) */
      ecrire(pesee('nv2t-F8-00000009', 1, 'diner', 'Pâtes P14 (test)', { kcal: 150, prot: 5.2, carbs: 30, fat: 1.2 }, { val: 450, unite: 'g', origine: 'tapee' }));
      /* F9 « Biscuit » — 1,5 biscuit de 33,3 g : 49,95 g, que le binaire écrit 49,949999999999996 */
      ecrire(pesee('nv2t-F9-00000010', 1, 'collation', 'Biscuit P14 (test)', { kcal: 360, prot: 9.015, carbs: 75, fat: 3.005 },
        { val: 1.5, unite: 'portion', origine: 'portion', portion: { libelle: 'biscuit', poids: 33.3, unite: 'g' } }));
      L.forEach((l) => S.foodLog.push(l));
      /* F3 un FAVORI V2 « Pot » dont la définition a été réécrite APRÈS coup (125 → 150 g, ses valeurs inchangées : ft-v1186 ⑤) */
      const pot = NUT2.ligneNouvelle(pesee('nv2t-F3-00000008', 3, 'collation', 'Pot P14 (test)', { kcal: 82, prot: 4, carbs: 12, fat: 2 },
        { val: 2, unite: 'portion', origine: 'portion', portion: { libelle: 'pot', poids: 125, unite: 'g' } }));
      if (pot.ok) { const f = { name: pot.ligne.name, kcal: pot.ligne.kcal, prot: pot.ligne.prot, carbs: pot.ligne.carbs, fat: pot.ligne.fat,
        per100: pot.ligne.per100, q: 2, u: 'portion', portionLabel: 'pot', portionWeightG: 150, sourceId: pot.ligne.sourceId,
        n2: { s: 1, m: 'p', f: pot.ligne.n2.f } }; S.savedFoods = [f]; } else err.push('pot:' + pot.erreur);
      persist(); renderFoodJournal(); return err;
    }, RIZ);
    const fermer = () => pg.evaluate(() => { try { closeAddFood(); } catch (e) {} document.querySelectorAll('.overlay.open').forEach((x) => x.classList.remove('open')); });
    const vider = () => pg.evaluate(() => { const v = (window.__toasts || []).slice(); window.__toasts = []; return v; });
    /* ⏰ Le repas des ajouts est FIXÉ (« Collation 2 », qu'aucune ligne de la fixture n'emploie) : à l'heure du déjeuner, un ajout
       de riz en « Déjeuner » aurait écarté l'habitude du riz (notée aujourd'hui) — la leçon de P12 ①, le 23/10. */
    await pg.evaluate(() => setFoodMeal('collation2'));
    const nb = (x) => String(x || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
    const avantTout = J({ log: await journal(pg), fav: await pg.evaluate(() => JSON.parse(JSON.stringify(S.savedFoods || []))) });
    const idsAvant = (await journal(pg)).map((x) => x.id);

    /* ① « Mes aliments » : la quantité dite sur chaque ligne de la liste */
    await fermer();
    let g = await ouvrirAjout(pg);
    const liste = await pg.evaluate(() => {
      const o = {}; (_afQuickItems || []).forEach((it, i) => { const el = document.querySelectorAll('#af-quick-list div[onclick^="quickFillFood"]')[i];
        o[it.name] = (el && el.children[1]) ? el.children[1].textContent : null; }); return o; });
    const L1 = (n) => nb(liste[n]);
    t('B-NV2P P14 ① ⭐⭐ « MES ALIMENTS » (favoris, récents) : « 3 portions (450 g) » · « 1,5 portion (187,5 g) » · « 150 g » — une portion au poids FIABLE dit ses grammes (le TOTAL entre parenthèses)',
      g && /^585 kcal · pour 3 portions \(450 g\) · P /.test(L1('Riz P14 (test)')) && /^[\d?]+ kcal · pour 1,5 portion \(187,5 g\) · P /.test(L1('Yaourt P14 (test)'))
      && /^165 kcal · pour 150 g · P /.test(L1('Thon P14 (test)')) && /^300 kcal · pour 2 portions \(200 g\) · P /.test(L1('Galette P14 (test)')), J(liste));
    t('B-NV2P P14 ② ⛔⛔ … une portion au poids NON FIABLE ne dit AUCUN gramme : ancienne ligne (« 2 portions », pas « 125 g » ni « 250 g »), ligne déclarée, favori dont la définition a été réécrite (« 2 portions », pas « 300 g »)',
      /^500 kcal · pour 2 portions · P /.test(L1('Steak P14 (test)')) && /^355 kcal · pour 2 portions · P /.test(L1('Crêpe P14 (test)'))
      && /^[\d?]+ kcal · pour 2 portions · P /.test(L1('Pot P14 (test)'))
      && !/\d g\)/.test(L1('Steak P14 (test)') + L1('Crêpe P14 (test)') + L1('Pot P14 (test)')), J(liste));

    /* ② ③ la REPRISE À L'ÉCRAN d'une ligne à fiche en portions fiables : proposée, jamais posée ; prise telle quelle, elle reste des portions */
    const prendre = (nom) => pg.evaluate((n) => { const i = (_afQuickItems || []).findIndex((x) => x && x.name === n); if (i >= 0) quickFillFood(i); return i; }, nom);
    const bcEtat = () => pg.evaluate(() => { const b = document.getElementById('af-bc-last'), t2 = document.getElementById('af-bc-total');
      return { vu: !!(b && b.style.display === 'inline-block'), txt: b ? b.textContent : '', q: b ? (b.dataset.q || null) : null,
        champ: (document.getElementById('af-bc-grams') || {}).value, total: t2 && t2.style.display !== 'none' ? t2.textContent : '' }; });
    g = (await prendre('Riz P14 (test)')) >= 0; await pause(pg, 300);
    const r2 = await bcEtat(), n2a = (await journal(pg)).length;
    t('B-NV2P P14 ③ ⭐⭐ REPRISE À L\'ÉCRAN (« Mes aliments ») : la pastille dit « ↩ 3 portions (450 g) (la dernière fois) » — champ VIDE, rien d\'ajouté (D-101 ①)',
      g && r2.vu && nb(r2.txt) === '↩ 3 portions (450 g) (la dernière fois)' && r2.q === '450' && r2.champ === '' && n2a === idsAvant.length, J(r2));
    /* ⑤ la même reprise par la recherche dans ton journal (« Déjà noté par toi », saisie « historique ») */
    await fermer(); g = await ouvrirAjout(pg);
    await pg.evaluate(() => { _afSuggLoc = _afSuggLocales('Riz P14'); if (_afSuggLoc.length) _afSuggPrendreLocale(0); }); await pause(pg, 300);
    const r7 = await bcEtat(), prov7 = await pg.evaluate(() => _n2Provenance());
    t('B-NV2P P14 ⑦ ⭐ HISTORIQUE (« Déjà noté par toi ») : la même pastille, la même forme — « ↩ 3 portions (450 g) (la dernière fois) », champ vide',
      r7.vu && nb(r7.txt) === '↩ 3 portions (450 g) (la dernière fois)' && r7.champ === '' && prov7 && prov7.saisie === 'historique', J({ r7, prov7 }));

    await fermer(); g = await ouvrirAjout(pg);
    g = g && (await prendre('Riz P14 (test)')) >= 0; await pause(pg, 300);
    await vider();
    g = await clic(pg, '#af-bc-last'); await pause(pg, 250);
    const r3 = await bcEtat();
    g = g && await ajouter(pg);
    const n3 = neuves(await journal(pg), idsAvant), l3 = n3[0] || null;
    const forme = (l) => l ? { q: l.q, u: l.u, pl: l.portionLabel, pw: l.portionWeightG, kcal: l.kcal, prot: l.prot, carbs: l.carbs, fat: l.fat,
      per100: l.per100, m: l.n2 && l.n2.m, qo: l.n2 && l.n2.qo, sourceId: l.sourceId } : null;
    t('B-NV2P P14 ④ ⭐⭐ … PRISE TELLE QUELLE, ELLE RESTE DES PORTIONS : champ 450, « pour tes 3 portions (450 g) », et la ligne est 3 parts de 150 g = 585 · 12 · 126 · 3 (à la main), pesée, quantité « proposée »',
      g && r3.champ === '450' && /pour tes 3 portions \(450 g\)/.test(nb(r3.total)) && n3.length === 1 && l3 && l3.q === 3 && l3.u === 'portion'
      && l3.portionLabel === 'part' && l3.portionWeightG === 150 && l3.kcal === 585 && l3.prot === 12 && l3.carbs === 126 && l3.fat === 3
      && l3.n2 && l3.n2.m === 'p' && l3.n2.qo === 'proposee', J({ r3, l3: forme(l3) }));
    /* la jumelle : « + Ajouter » et « Tes repas habituels » sur la même ligne */
    await fermer(); g = await ouvrirAjout(pg);
    const idsA = (await journal(pg)).map((x) => x.id);
    await pg.evaluate(() => { const i = (_afQuickItems || []).findIndex((x) => x && x.name === 'Riz P14 (test)'); if (i >= 0) quickAddFood(i); }); await pause(pg, 300);
    const lA = neuves(await journal(pg), idsA)[0] || null;
    const idsR = (await journal(pg)).map((x) => x.id);
    await pg.evaluate(() => { const h = (_repasHabituels() || []).find((x) => x && (x.items || []).some((it) => it && it.name === 'Riz P14 (test)')); if (h) rejouerRepas(h.sig, 'dejeuner'); });
    await pause(pg, 300);
    const lR = neuves(await journal(pg), idsR).find((x) => x && x.name === 'Riz P14 (test)') || null;
    const sansQo = (f) => { if (!f) return f; const c = Object.assign({}, f); delete c.qo; return c; };
    t('B-NV2P P14 ⑤ ⭐⭐ JUMELLES (D-103) : l\'écran, « + Ajouter » et « Tes repas habituels » écrivent LA MÊME FORME pour la même ligne (3 parts de 150 g, mêmes valeurs, même fiche)',
      !!(l3 && lA && lR) && J(forme(lA)) === J(forme(l3)) && J(sansQo(forme(lR))) === J(sansQo(forme(l3))), J({ ecran: forme(l3), ajout: forme(lA), rejeu: forme(lR) }));
    /* ⑤b la même chose sur une ligne CORRIGÉE à la main (Galette : 2 parts de 100 g = 360 kcal calculées, 300 corrigées) —
       relecture adverse du 22/10 : l'écran recalculait 360 sans la correction, quand « + Ajouter » écrit 300 avec elle. */
    await fermer(); g = await ouvrirAjout(pg);
    g = g && (await prendre('Galette P14 (test)')) >= 0; await pause(pg, 300);
    const r5b = await bcEtat();
    g = g && await clic(pg, '#af-bc-last'); await pause(pg, 250);
    const r5c = await bcEtat(), k5 = await pg.evaluate(() => (document.getElementById('af-kcal') || {}).value);
    const ids5 = (await journal(pg)).map((x) => x.id);
    g = g && await ajouter(pg);
    const lE = neuves(await journal(pg), ids5)[0] || null;
    await fermer(); g = g && await ouvrirAjout(pg);
    const ids5b = (await journal(pg)).map((x) => x.id);
    await pg.evaluate(() => { const i = (_afQuickItems || []).findIndex((x) => x && x.name === 'Galette P14 (test)'); if (i >= 0) quickAddFood(i); }); await pause(pg, 300);
    const lQ = neuves(await journal(pg), ids5b)[0] || null;
    const corr = (l) => (l && l.n2 && Array.isArray(l.n2.corr)) ? l.n2.corr.map((x) => [x.c, x.v, x.avant]) : null;
    t('B-NV2P P14 ⑤b ⭐⭐ JUMELLES SUR UNE LIGNE CORRIGÉE : la pastille « 2 portions (200 g) » prise, l\'écran dit 300 kcal (la correction, pas les 360 calculées) et la ligne est celle de « + Ajouter » : 2 parts de 100 g · 300 · 12 · 60 · 8, correction tracée (360 → 300)',
      g && nb(r5b.txt) === '↩ 2 portions (200 g) (la dernière fois)' && k5 === '300' && /300 kcal/.test(nb(r5c.total)) && !!(lE && lQ)
      && J(sansQo(forme(lE))) === J(sansQo(forme(lQ))) && lE.q === 2 && lE.u === 'portion' && lE.portionWeightG === 100 && lE.kcal === 300
      && lE.prot === 12 && lE.carbs === 60 && lE.fat === 8 && J(corr(lE)) === J([['kcal', 300, 360]]) && J(corr(lQ)) === J([['kcal', 300, 360]]),
      J({ r5b, r5c, k5, ecran: forme(lE), cE: corr(lE), ajout: forme(lQ), cQ: corr(lQ) }));

    /* ⑯ le riz PROPOSÉ « 3 portions (450 g) », non touché, puis — sans fermer — les pâtes notées 450 g la dernière fois : leur
       pastille prise donne 450 g de pâtes, jamais « 3 parts de 150 g » (la portion d'un aliment ne passe pas au suivant — M6).
       ⚠️ PLACÉ ICI, AVANT ⑥, exprès : ⑥ note 300 g de riz, après quoi la pastille du riz est en GRAMMES — la prémisse tombait et
       ⑯ restait vert sans rien éprouver (MP51 survivait, mesuré le 23/10 par le contrôle négatif complet : `BUGS.md` §96). La
       prémisse est désormais VÉRIFIÉE (r16a) : si un réordonnancement la casse, ⑯ rougit au lieu de mentir. */
    await fermer(); g = await ouvrirAjout(pg);
    g = g && (await prendre('Riz P14 (test)')) >= 0; await pause(pg, 250);
    const r16a = await bcEtat();
    g = g && (await prendre('Pâtes P14 (test)')) >= 0; await pause(pg, 300);
    const r16 = await bcEtat();
    g = g && await clic(pg, '#af-bc-last'); await pause(pg, 200);
    const r16b = await bcEtat(); const ids16 = (await journal(pg)).map((x) => x.id);
    g = g && await ajouter(pg);
    const l16 = neuves(await journal(pg), ids16)[0] || null;
    t('B-NV2P P14 ⑯ ⛔⛔ LA PORTION NE DÉBORDE PAS : riz proposé « 3 portions (450 g) », puis les pâtes (450 g la dernière fois) — 450 g de pâtes, 675 · 23 · 135 · 5 (à la main), aucune part',
      g && nb(r16a.txt) === '↩ 3 portions (450 g) (la dernière fois)' && nb(r16.txt) === '↩ 450 g (la dernière fois)'
      && /pour tes 450 g/.test(nb(r16b.total)) && !/portion/.test(nb(r16b.total))
      && l16 && l16.name === 'Pâtes P14 (test)' && l16.q === 450 && l16.u === 'g' && !l16.portionLabel && !('portionWeightG' in l16)
      && l16.kcal === 675 && l16.prot === 23 && l16.carbs === 135 && l16.fat === 5, J({ r16a, r16, r16b, l16: forme(l16) }));

    /* ④ la pastille prise, puis le champ RETOUCHÉ : c'est une quantité en grammes, comme avant */
    await fermer(); g = await ouvrirAjout(pg);
    g = g && (await prendre('Riz P14 (test)')) >= 0; await pause(pg, 250);
    g = g && await clic(pg, '#af-bc-last'); await pause(pg, 200);
    g = g && await taper(pg, '#af-bc-grams', '300'); await pause(pg, 200);
    const r6 = await bcEtat(); const ids6 = (await journal(pg)).map((x) => x.id);
    g = g && await ajouter(pg);
    const l6 = neuves(await journal(pg), ids6)[0] || null;
    t('B-NV2P P14 ⑥ ⛔ … la pastille prise PUIS le champ retouché (300) : une quantité en GRAMMES tapée — 300 g = 390 · 8 · 84 · 2 (à la main), « pour tes 300 g »',
      g && /pour tes 300 g/.test(nb(r6.total)) && l6 && l6.q === 300 && l6.u === 'g' && !l6.portionLabel && l6.kcal === 390 && l6.prot === 8
      && l6.carbs === 84 && l6.fat === 2 && l6.n2 && l6.n2.qo === 'tapee', J({ r6, l6: forme(l6) }));
    /* ⑥b la MÊME masse retapée : la personne a tapé — c'est une quantité en grammes (D-103 ③), pas « les portions de la dernière
       fois » (relecture du 22/10 : ⑥ retapait 300, qui diffère de 450, et ne voyait pas l'origine). ⚠️ Sur le YAOURT, dont la
       dernière ligne est en portions : le riz, à ce moment, a pour dernière ligne les 300 g de ⑥ — sa pastille serait en grammes,
       et le témoin vert sans rien éprouver (mesuré : MP52 et MP53 survivaient). Le champ est vidé puis retapé : deux frappes. */
    await fermer(); g = await ouvrirAjout(pg);
    g = g && (await prendre('Yaourt P14 (test)')) >= 0; await pause(pg, 250);
    const r6a = await bcEtat();
    g = g && await clic(pg, '#af-bc-last'); await pause(pg, 200);
    g = g && await taper(pg, '#af-bc-grams', ''); g = g && await taper(pg, '#af-bc-grams', '187.5'); await pause(pg, 200);
    const r6b = await bcEtat(); const ids6b = (await journal(pg)).map((x) => x.id);
    g = g && await ajouter(pg);
    const l6b = neuves(await journal(pg), ids6b)[0] || null;
    t('B-NV2P P14 ⑥b ⛔ … la pastille « 1,5 portion (187,5 g) » prise puis la MÊME masse retapée : TAPÉE, donc 187,5 g en grammes — 150 · 8 · 19 · 6 (à la main), « pour tes 187,5 g »',
      g && nb(r6a.txt) === '↩ 1,5 portion (187,5 g) (la dernière fois)' && /pour tes 187,5 g/.test(nb(r6b.total)) && !/portion/.test(nb(r6b.total))
      && l6b && l6b.q === 187.5 && l6b.u === 'g' && !l6b.portionLabel
      && l6b.kcal === 150 && l6b.prot === 8 && l6b.carbs === 19 && l6b.fat === 6 && l6b.n2 && l6b.n2.qo === 'tapee', J({ r6a, r6b, l6b: forme(l6b) }));

    /* ⑥ le favori à la définition réécrite : sa portion n'est pas fiable — aucune masse proposée, rien de posé */
    await fermer(); g = await ouvrirAjout(pg);
    await vider();
    g = g && (await prendre('Pot P14 (test)')) >= 0; await pause(pg, 300);
    const r8 = await bcEtat(), m8 = await vider();
    t('B-NV2P P14 ⑧ ⛔⛔ POIDS NON FIABLE À L\'ÉCRAN (favori réécrit 125 → 150 g sans ses valeurs) : AUCUNE masse proposée (ni 250 ni 300 g), champ vide — la personne tape ses grammes',
      g && !r8.vu && r8.champ === '' && !/\d/.test(nb(r8.txt)), J(r8));
    await fermer(); g = await ouvrirAjout(pg); await vider();
    g = g && (await prendre('Riz P14 (test)')) >= 0; await pause(pg, 300);
    const m8r = await vider();
    t('B-NV2P P14 ⑧b ⛔ LE MESSAGE NE MONTRE PAS UNE PASTILLE ABSENTE : « (tape-la) » pour le favori sans pastille, « (touche la pastille ou tape-la) » pour le riz',
      g && m8.some((m) => /Repris — choisis la quantité \(tape-la\)/.test(m)) && !m8.some((m) => /touche la pastille/.test(m))
      && m8r.some((m) => /\(touche la pastille ou tape-la\)/.test(m)), J({ m8, m8r }));
    /* ⑰ le biscuit : 1,5 × 33,3 g = 49,95 g — la pastille dit « 49,9 g » (au dixième), et l'écran montre EXACTEMENT ce que la
       ligne enregistrera : 49,95 × 9,015 = 4,503 → 5 g de protéines, 49,95 × 3,005 = 1,501 → 2 g de lipides (à la main ; à
       49,9 g ce serait 4 et 1 — relecture du 22/10) ; 180 kcal · 37 g de glucides */
    await fermer(); g = await ouvrirAjout(pg);
    g = g && (await prendre('Biscuit P14 (test)')) >= 0; await pause(pg, 300);
    const r17 = await bcEtat();
    g = g && await clic(pg, '#af-bc-last'); await pause(pg, 250);
    const r17b = await bcEtat(), e17 = await pg.evaluate(() => ['af-kcal', 'af-prot', 'af-carbs', 'af-fat'].map((id) => (document.getElementById(id) || {}).value).join('·'));
    const ids17 = (await journal(pg)).map((x) => x.id);
    g = g && await ajouter(pg);
    const l17 = neuves(await journal(pg), ids17)[0] || null;
    t('B-NV2P P14 ⑰ ⭐⭐ UNE MASSE INEXACTE EN BINAIRE (1,5 × 33,3 g) : pastille « 1,5 portion (49,9 g) », champ « 49.9 » — et l\'écran (180 · 5 · 37 · 2) est EXACTEMENT la ligne enregistrée (1,5 biscuit de 33,3 g)',
      g && nb(r17.txt) === '↩ 1,5 portion (49,9 g) (la dernière fois)' && r17.q === '49.9' && r17.champ === '' && r17b.champ === '49.9'
      && /pour tes 1,5 portion \(49,9 g\)/.test(nb(r17b.total)) && e17 === '180·5·37·2'
      && l17 && l17.q === 1.5 && l17.u === 'portion' && l17.portionWeightG === 33.3 && [l17.kcal, l17.prot, l17.carbs, l17.fat].join('·') === e17,
      J({ r17, r17b, e17, l17: forme(l17) }));

    /* ⑦ la reprise FIGÉE d'une ancienne ligne en portions : « 2 portions », jamais ses grammes */
    await fermer(); g = await ouvrirAjout(pg);
    g = g && (await prendre('Steak P14 (test)')) >= 0; await pause(pg, 300);
    const r9 = await pg.evaluate(() => { const pp = document.getElementById('af-prop-pastille'), row = document.getElementById('af-prop-row');
      return { fige: !!(_afRef && _afRef.fige), pastille: pp ? pp.textContent : '', q: pp ? pp.dataset.q : null, bloc: row ? row.textContent : '', champ: (document.getElementById('af-prop') || {}).value }; });
    await vider();
    g = g && await taper(pg, '#af-prop', '3'); const ids9 = (await journal(pg)).length;
    g = g && await ajouter(pg);
    const m9 = await vider(), a9 = (await journal(pg)).length > ids9;
    t('B-NV2P P14 ⑨ ⛔⛔ ANCIENNE LIGNE (FIGÉE) : « ↩ 2 portions (la dernière fois) », valeurs « pour 2 portions » — AUCUN gramme affirmé (ni 125 ni 250 g), champ vide',
      g && r9.fige && nb(r9.pastille) === '↩ 2 portions (la dernière fois)' && r9.q === '2' && /pour 2 portions\)/.test(nb(r9.bloc))
      && !/125|250/.test(nb(r9.pastille) + nb(r9.bloc)) && r9.champ === '', J(r9));
    t('B-NV2P P14 ⑩ ⛔ … une AUTRE quantité (3) sur ses valeurs non retouchées est refusée — le message dit « pour 2 portions », sans gramme',
      !a9 && m9.some((m) => /Ces valeurs valent pour 2 portions :/.test(nb(m))) && !m9.some((m) => /125 g|250 g/.test(m)), J(m9));

    /* ⑧ « Modifier » : la ligne à fiche en portions dit « 3 portions (450 g) » et suit le nombre tapé ; l'ancienne ligne n'affirme pas son poids */
    await fermer();
    const ouvrirModif = async (id) => { await fermer(); const ok2 = await pg.evaluate((i) => { try { openEditFood(i); return true; } catch (e) { return false; } }, id); await pause(pg, 280); return ok2; };
    const efTxt = () => pg.evaluate(() => (document.getElementById('ef-qty-row') || { textContent: '' }).textContent);
    g = await ouvrirModif('nv2t-F1-00000003');
    const m1 = nb(await efTxt());
    g = g && await taper(pg, '#ef-prop', '2'); await pause(pg, 200);
    const m2 = nb(await efTxt()), k2 = await pg.evaluate(() => (document.getElementById('ef-kcal') || {}).value);
    g = g && await taper(pg, '#ef-prop', ''); await pause(pg, 200);
    const m2v = nb(await efTxt()), k2v = await pg.evaluate(() => (document.getElementById('ef-kcal') || {}).value);
    t('B-NV2P P14 ⑪ ⭐⭐ « MODIFIER » (ligne à fiche, portions fiables) : « 3 portions (450 g) · 1 portion = 1 part (150 g) » — et 2 tapé : « 2 portions (300 g) », 390 kcal (à la main)',
      g && /3 portions \(450 g\) · 1 portion = 1 part \(150 g\)/.test(m1) && /2 portions \(300 g\)/.test(m2) && k2 === '390'
      && /^Quantité \(portions\).*3 portions \(450 g\) · 1 portion/.test(m2v) && k2v === '585', J({ m1, m2, k2, m2v, k2v }));
    g = await ouvrirModif('nv2t-S1-00000001');
    const m3 = nb(await efTxt());
    t('B-NV2P P14 ⑫ ⛔⛔ « MODIFIER » une ANCIENNE ligne en portions : « 1 portion = 1 steak — poids non vérifié » — le poids noté (125 g) n\'est pas affirmé à l\'écran',
      g && /1 portion = 1 steak — poids non vérifié/.test(m3) && !/125 g|250 g/.test(m3), m3);
    await vider();
    g = g && await taper(pg, '#ef-q', '3');
    g = g && await clic(pg, '#ov-edit-food button[onclick="saveEditFood()"]'); await pause(pg, 300);
    const m12 = await vider();
    t('B-NV2P P14 ⑫b ⛔ « MODIFIER » : 3 portions sur les valeurs NOTÉES pour 2 (non retouchées) est refusé — le message dit « pour 2 portions », sans gramme (la ligne ne bouge pas : ⑭)',
      g && m12.some((m) => /Ces valeurs valent pour 2 portions :/.test(nb(m))) && !m12.some((m) => /125 g|250 g/.test(m)), J(m12));
    await fermer();

    /* ⑨ l'écran de saisie, onglet portions : la même forme */
    g = await ouvrirAjout(pg);
    g = g && await taper(pg, '#af-desc', 'Plat P14 (test)');
    for (const [id, v] of [['#af-kcal', '300'], ['#af-prot', '20'], ['#af-carbs', '30'], ['#af-fat', '10']]) g = g && await taper(pg, id, v);
    try { await pg.locator('#af-fat').blur(); } catch (e) { g = false; }
    await pause(pg, 200);
    const def = () => pg.evaluate(() => (document.getElementById('af-pdef') || { textContent: '' }).textContent);
    g = g && await clic(pg, '#af-prop-row button[onclick="_afSetUnite(\'portion\')"]'); await pause(pg, 220);
    g = g && await clic(pg, '#af-prop-row button[onclick="_afApplyPortion(3)"]'); await pause(pg, 220);
    g = g && await clic(pg, '#af-prop-row button[onclick="_afPortionNom(\'part\')"]'); await pause(pg, 200);
    const d0 = nb(await def());
    g = g && await taper(pg, '#af-ppoids', '150'); await pause(pg, 220);
    const d1 = nb(await def());
    t('B-NV2P P14 ⑬ ⭐ ÉCRAN DE SAISIE (onglet portions) : sans poids « Tu notes 3 portions » (aucun gramme, le poids est DEMANDÉ) ; avec 150 g « Tu notes 3 portions (450 g) »',
      g && /^Tu notes 3 portions — 1 portion = 1 part, poids inconnu/.test(d0) && /Indique le poids d'une portion/.test(d0)
      && /^Tu notes 3 portions \(450 g\) — 1 portion = 1 part \(150 g\)/.test(d1), J({ d0, d1 }));
    await fermer();

    /* ⛔⛔ et RIEN de ce qui était enregistré n'a bougé : afficher n'écrit jamais */
    const apres = await journal(pg), favApres = await pg.evaluate(() => JSON.parse(JSON.stringify(S.savedFoods || [])));
    const anciennes = apres.filter((x) => idsAvant.indexOf(x.id) >= 0);
    t('B-NV2P P14 ⑭ ⛔⛔ AFFICHER N\'ÉCRIT JAMAIS : les 9 lignes et le favori d\'avant sont intacts octet par octet (calories, macros, quantités, identifiants, provenance)',
      J({ log: anciennes, fav: favApres }) === avantTout && anciennes.length === idsAvant.length, J({ n: anciennes.length, attendu: idsAvant.length }));
    /* ⑱ un favori pris par l'ÉTOILE sur une ligne corrigée garde sa correction : « 2 portions (200 g) · 300 kcal », comme sa ligne,
       et « + Ajouter » depuis lui écrit 300 (pas les 360 du calcul) — relecture du 22/10. */
    await fermer(); g = await ouvrirAjout(pg);
    const iG = await pg.evaluate(() => (_afQuickItems || []).findIndex((x) => x && x.name === 'Galette P14 (test)'));
    g = g && iG >= 0 && await clic(pg, '#af-quick-list button[onclick="toggleFavFood(' + iG + ')"]'); await pause(pg, 250);
    const f18 = await pg.evaluate(() => { const f = (S.savedFoods || []).find((x) => x && x.name === 'Galette P14 (test)');
      const i = (_afQuickItems || []).findIndex((x) => x && x.name === 'Galette P14 (test)'); const el = document.querySelectorAll('#af-quick-list div[onclick^="quickFillFood"]')[i];
      return { fav: !!f, corr: f && f.n2 && f.n2.corr ? f.n2.corr.map((x) => [x.c, x.v, x.avant]) : null, estFav: i >= 0 && !!(_afQuickItems[i] || {}).fav,
               ligne: (el && el.children[1]) ? el.children[1].textContent : '' }; });
    const ids18 = (await journal(pg)).map((x) => x.id);
    await pg.evaluate(() => { const i = (_afQuickItems || []).findIndex((x) => x && x.name === 'Galette P14 (test)'); if (i >= 0) quickAddFood(i); }); await pause(pg, 300);
    const l18 = neuves(await journal(pg), ids18)[0] || null;
    t('B-NV2P P14 ⑱ ⭐ FAVORI PAR L\'ÉTOILE sur une ligne corrigée : « 300 kcal · pour 2 portions (200 g) » (comme sa ligne), sa correction copiée — et « + Ajouter » écrit 300, correction tracée',
      g && f18.fav && f18.estFav && J(f18.corr) === J([['kcal', 300, 360]]) && /^300 kcal · pour 2 portions \(200 g\) · P /.test(nb(f18.ligne))
      && l18 && l18.kcal === 300 && l18.q === 2 && l18.u === 'portion' && J(corr(l18)) === J([['kcal', 300, 360]]), J({ f18, l18: forme(l18), c: corr(l18) }));
    /* ⑲ reprendre n'est pas redéfinir : un favori « Pizza » (2 parts de 200 g) et la DERNIÈRE ligne « Pizza » (2 parts de 150 g) —
       la pastille de la ligne prise depuis ton journal écrit 2 parts de 150 g, et le favori reste à 200 g, octet par octet. */
    const pz = await pg.evaluate(() => {
      const t2 = today(), err = [];
      const mk = (id, poids) => NUT2.ligneNouvelle({ id: id, ts: Date.now() - 3e6, date: t2, repas: 'diner', nom: 'Pizza P14 (test)',
        origine: { saisie: 'code-tape', origine: 'off' }, mode: 'pesee', fiche: { base: 'g', p100: { kcal: 250, prot: 10, carbs: 30, fat: 10 }, cle: '3000000000701', source: 'off', fiab: 'source' },
        quantite: { val: 2, unite: 'portion', origine: 'portion', portion: { libelle: 'part', poids: poids, unite: 'g' } } });
      const a = mk('nv2t-PZ-00000020', 200), b2 = mk('nv2t-PZ-00000021', 150);
      if (!a.ok || !b2.ok) return { err: [a.erreur, b2.erreur] };
      S.savedFoods.push({ name: a.ligne.name, kcal: a.ligne.kcal, prot: a.ligne.prot, carbs: a.ligne.carbs, fat: a.ligne.fat, per100: a.ligne.per100,
        q: 2, u: 'portion', portionLabel: 'part', portionWeightG: 200, sourceId: a.ligne.sourceId, n2: { s: 1, m: 'p', f: a.ligne.n2.f } });
      S.foodLog.push(b2.ligne); persist(); return { err: [] };
    });
    const favAvant = await pg.evaluate(() => JSON.stringify((S.savedFoods || []).find((x) => x && x.name === 'Pizza P14 (test)')));
    await fermer(); g = await ouvrirAjout(pg);
    await pg.evaluate(() => { _afSuggLoc = _afSuggLocales('Pizza P14'); if (_afSuggLoc.length) _afSuggPrendreLocale(0); }); await pause(pg, 300);
    const r19 = await bcEtat();
    g = g && await clic(pg, '#af-bc-last'); await pause(pg, 200);
    const ids19 = (await journal(pg)).map((x) => x.id);
    g = g && await ajouter(pg);
    const l19 = neuves(await journal(pg), ids19)[0] || null;
    const favApres19 = await pg.evaluate(() => JSON.stringify((S.savedFoods || []).find((x) => x && x.name === 'Pizza P14 (test)')));
    t('B-NV2P P14 ⑲ ⛔⛔ REPRENDRE N\'EST PAS REDÉFINIR : la pastille « 2 portions (300 g) » de ton journal écrit 2 parts de 150 g (300 g = 750 · 30 · 90 · 30, à la main) et le FAVORI « Pizza » reste à 200 g, octet par octet',
      g && pz.err.length === 0 && nb(r19.txt) === '↩ 2 portions (300 g) (la dernière fois)' && l19 && l19.q === 2 && l19.u === 'portion' && l19.portionWeightG === 150
      && l19.kcal === 750 && l19.prot === 30 && l19.carbs === 90 && l19.fat === 30 && favApres19 === favAvant && /"portionWeightG":200/.test(favAvant),
      J({ pz, r19, l19: forme(l19), favAvant, favApres19 }));
    t('B-NV2P P14 ⑮ aucune erreur de page sur D-103', p14.erreurs.length === 0 && v2.length === 0, J({ erreurs: p14.erreurs, v2 }));
  } finally { await p14.cx.close(); }

  await incident(t, b, PORT);
}

/* ═══ P15 L'INCIDENT DU 23/10 — UNE RÉFÉRENCE REPRISE NE S'ÉCRIT QUE TELLE QU'ELLE S'AFFICHE ═══
   Mission de Michel (23/10) : *« les valeurs affichées avant l'ajout doivent être exactement celles enregistrées dans le
   journal »* ; une référence ancienne ou incohérente n'écrase pas en silence une référence plus fiable ; jamais deux
   produits identifiés par leur seul nom ; la copie d'origine survit à la 2ᵉ modification ; une valeur inconnue n'est jamais
   0. ⛔ Ce bloc a été écrit et JOUÉ SUR LE CODE D'AVANT LE CORRECTIF (ses rouges sont consignés dans `BUGS.md` §98). */
async function incident(t, b, PORT) {
  console.log('\n-- B-NV2P P15. L\'INCIDENT DU 23/10 — les reprises ne corrompent plus les valeurs (données inventées) --');
  const OFFI = { produits: { [EAN_ISO]: ISO }, recherche: [ISO.product] };
  const nb = (x) => String(x || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const forme = (l) => l ? { q: l.q, u: l.u, kcal: l.kcal, prot: l.prot, carbs: l.carbs, fat: l.fat, sid: l.sourceId || null, m: (l.n2 && l.n2.m) || null } : null;
  /* Des lignes SEMÉES sur la page, chacune k jours avant (date ET heure cohérentes : l'ordre « le plus récent » en dépend).
     Une ligne d'avant V2 est posée telle quelle ; une ligne V2 est écrite par le moteur, comme l'app l'écrit. */
  const semer = (pg, spec) => pg.evaluate((spec) => {
    const pad = (n) => String(n).padStart(2, '0'), J0 = (k) => { const x = new Date(); x.setDate(x.getDate() - k); return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()); };
    const err = [];
    spec.forEach((s) => {
      const ts = Date.now() - s.k * 864e5;
      if (s.v2) { const r = NUT2.ligneNouvelle(Object.assign({}, s.v2, { ts: ts, date: J0(s.k) })); if (r.ok) S.foodLog.push(r.ligne); else err.push(s.v2.nom + ':' + r.erreur); }
      else S.foodLog.push(Object.assign({}, s.v1, { ts: ts, date: J0(s.k) }));
    });
    persist(); renderFoodJournal(); return err;
  }, spec);
  const items = (pg) => pg.evaluate(() => (_afQuickItems || []).map((it, i) => {
    const el = document.querySelectorAll('#af-quick-list div[onclick^="quickFillFood"]')[i], s = it._src || {};
    return { i: i, nom: it.name, fav: !!it.fav, sid: s.sourceId || null, id: s.id || null, m: (s.n2 && s.n2.s === 1) ? s.n2.m : null,
             txt: (el && el.children[1]) ? el.children[1].textContent : '' }; }));
  const fermer = (pg) => pg.evaluate(() => { try { closeAddFood(); } catch (e) {} document.querySelectorAll('.overlay.open').forEach((x) => x.classList.remove('open')); });
  const vider = (pg) => pg.evaluate(() => { const v = (window.__toasts || []).slice(); window.__toasts = []; return v; });
  const favoris = (pg) => pg.evaluate(() => JSON.parse(JSON.stringify(S.savedFoods || [])));
  const ids = async (pg) => (await journal(pg)).map((x) => x.id);
  const ajoutRapide = async (pg, it) => { if (!it) return false; const ok = await clic(pg, '#af-quick-list button[onclick="quickAddFood(' + it.i + ')"]'); await pause(pg, 400); return ok; };
  const etoile = async (pg, it) => { if (!it) return false; const ok = await clic(pg, '#af-quick-list button[onclick="toggleFavFood(' + it.i + ')"]'); await pause(pg, 300); return ok; };
  const supprimer = async (pg, it) => { if (!it) return false; let ok = await clic(pg, '#af-quick-list button[onclick="deleteQuickFood(' + it.i + ')"]'); await pause(pg, 250);
    ok = ok && await clic(pg, '#confirm-ok'); await pause(pg, 300); return ok; };
  const ecranOuvert = (pg) => pg.evaluate(() => { const o = document.getElementById('ov-add-food'), r = document.getElementById('af-bc-row'), p = document.getElementById('af-bc-last');
    return { ouvert: !!(o && o.classList.contains('open')), desc: (document.getElementById('af-desc') || {}).value || '', bloc: !!(r && r.style.display !== 'none'),
             pastille: !!(p && p.style.display === 'inline-block'), fige: (document.getElementById('af-prop-row') || { textContent: '' }).textContent,
             fiche: (document.getElementById('af-bc-name') || { textContent: '' }).textContent }; });
  const carte = (pg, re) => pg.evaluate((src) => { const r = new RegExp(src); const x = [...document.querySelectorAll('[onclick^="_habChoisirMoment"]')].find((e) => r.test(e.textContent)); return x ? x.textContent : ''; }, re);
  const rejouer = (pg, nom) => pg.evaluate((n) => { const h = (_repasHabituels() || []).find((x) => x && (x.items || []).some((it) => it && it.name === n)); if (h) rejouerRepas(h.sig, 'collation2'); return !!h; }, nom);

  /* ── page 1 : L'ISO — un favori d'avant V2 qui se contredit, deux copies d'avant V2 du même code-barres (la plus récente
     après les lignes justes), deux lignes V2 justes (le scan d'origine, comme le 23/08). ── */
  const p1 = await ouvrir(b, PORT, fixtureIncident('__nv2u1', [P15_FAV_ISO]), OFFI);
  try {
    const pg = p1.pg;
    await capterToasts(pg);
    await pg.evaluate(() => setFoodMeal('collation2'));   // ⏰ le repas des ajouts, qu'aucune ligne semée n'emploie (leçon de P12 ①)
    const v2iso = (id, k) => ({ k: k, v2: { id: id, repas: 'petitdej', nom: 'Iso P15 (test)', origine: { saisie: 'code-tape', origine: 'off' }, mode: 'pesee',
      fiche: { base: 'g', p100: { kcal: 389, prot: 88, carbs: 3, fat: 3 }, cle: EAN_ISO, source: 'off', fiab: 'source', etat: 'tel-que-vendu' },
      quantite: { val: 40, unite: 'g', origine: 'tapee' } } });
    const err1 = await semer(pg, [v2iso('nv2u-V4-00000004', 4), v2iso('nv2u-V3-00000003', 3),
      { k: 2, v1: Object.assign({ id: 'nv2u-I2-00000002' }, P15_COPIE_ISO) }, { k: 1, v1: Object.assign({ id: 'nv2u-I1-00000001' }, P15_COPIE_ISO) }]);
    const semees1 = J(await journal(pg));
    const iso = (L) => L.filter((x) => x.nom === 'Iso P15 (test)');
    const favIso = (L) => L.find((x) => x.nom === 'Iso P15 (test)' && x.fav && !x.sid) || null;
    const verif = (L) => L.find((x) => x.nom === 'Iso P15 (test)' && !x.fav && x.m === 'p') || null;
    const copie = (L) => L.find((x) => x.nom === 'Iso P15 (test)' && !x.fav && x.sid === EAN_ISO && x.m !== 'p') || null;

    let g = await ouvrirAjout(pg);
    let L1 = await items(pg);
    t('B-NV2P P15 ① ⛔⛔ UNE RÉFÉRENCE PLUS FIABLE N\'EST JAMAIS CACHÉE : sous un favori d\'avant V2 du même NOM et sous une copie plus RÉCENTE du même code-barres, la ligne V2 vérifiée est dans « Mes aliments » — 156 kcal · pour 40 g · P 35 · G 1 · L 1',
      g && err1.length === 0 && !!verif(L1) && /^156 kcal · pour 40 g · P 35 · G 1 · L 1/.test(nb(verif(L1).txt)), J({ err1, iso: iso(L1) }));
    t('B-NV2P P15 ② ⛔⛔ UNE RÉFÉRENCE QUI SE CONTREDIT N\'EST PAS PRÉSENTÉE COMME VÉRIFIÉE : le favori (26 g de protéines pour une fiche à 88 g/100 g) et la copie (≠ la fiche vérifiée du MÊME code-barres) disent « à vérifier » — la ligne vérifiée, non',
      !!favIso(L1) && /à vérifier/.test(nb(favIso(L1).txt)) && !!copie(L1) && /à vérifier/.test(nb(copie(L1).txt)) && !!verif(L1) && !/à vérifier/.test(nb(verif(L1).txt)), J(iso(L1)));
    /* ③ la recherche dans ton journal (« Déjà noté par toi ») : la même règle, et la même ligne affichée (quantité, valeurs, état) */
    const h3 = await pg.evaluate(() => { _afSuggLoc = _afSuggLocales('Iso P15'); _afSuggCiq = []; _afSuggOff = []; _afSuggMarq = []; _afSuggRendu();
      return { lignes: _afSuggLoc.map((e) => ({ id: e.id, m: (e.n2 && e.n2.s === 1) ? e.n2.m : null, prot: e.prot })),
               txt: [...document.querySelectorAll('#af-sugg [onclick^="_afSuggPrendreLocale"]')].map((x) => x.textContent) }; });
    t('B-NV2P P15 ③ ⛔⛔ « DÉJÀ NOTÉ PAR TOI » : la ligne vérifiée est proposée (pas seulement la copie la plus récente), et chaque proposition dit sa quantité et son état — « 156 kcal · pour 40 g · P 35 » sans réserve, « P 26 » « à vérifier »',
      h3.lignes.some((x) => x.m === 'p' && x.prot === 35) && h3.txt.some((x) => /156 kcal · pour 40 g · P 35 · G 1 · L 1/.test(nb(x)) && !/à vérifier/.test(nb(x)))
      && h3.txt.some((x) => /P 26/.test(nb(x)) && /à vérifier/.test(nb(x))), J(h3));

    /* ④ ⑤ « Tes repas habituels » : la dernière version de l'habitude est la copie — elle n'est pas re-notée en silence */
    await fermer(pg); await pg.evaluate(() => renderFoodJournal()); await pause(pg, 200);
    const hab = await carte(pg, 'Iso P15');
    const idsR = await ids(pg); await vider(pg);
    const gR = await rejouer(pg, 'Iso P15 (test)'); await pause(pg, 400);
    const nR = neuves(await journal(pg), idsR), mR = await vider(pg);
    t('B-NV2P P15 ④ ⛔⛔ « TES REPAS HABITUELS » : la copie qui contredit la fiche vérifiée n\'est PAS re-notée — rien n\'est écrit, et le message la nomme « à vérifier »',
      gR && nR.length === 0 && mR.some((m) => /à vérifier/i.test(m) && /Iso P15/.test(m)), J({ nR: nR.map(forme), mR }));
    t('B-NV2P P15 ⑤ ⭐ … et la carte le disait AVANT le geste : « 1 à vérifier », sans un total qui ne s\'écrirait pas (ni 156 kcal, ni 26 g)',
      /1 à vérifier/.test(nb(hab)) && !/156 kcal/.test(nb(hab)) && !/26 g/.test(nb(hab)), hab);

    /* ⑥ ⑦ ⑧ « + Ajouter » : ce qui se contredit ouvre l'écran (rien d'écrit) ; ce qui est vérifié s'écrit tel qu'affiché */
    g = await ouvrirAjout(pg); L1 = await items(pg);
    let av = await ids(pg); await vider(pg);
    const gF = await ajoutRapide(pg, favIso(L1));
    const nF = neuves(await journal(pg), av), eF = await ecranOuvert(pg), mF = await vider(pg);
    t('B-NV2P P15 ⑥ ⛔⛔ « + AJOUTER » SUR LE FAVORI QUI SE CONTREDIT : RIEN n\'est écrit (ni 156 · 26 recopiés, ni un calcul que la liste ne montrait pas) — l\'écran s\'ouvre sur l\'aliment, le message ET l\'écran disent « à vérifier »',
      gF && nF.length === 0 && eF.ouvert && eF.desc === 'Iso P15 (test)' && mF.some((m) => /à vérifier/i.test(m)) && /À vérifier : ses valeurs ne correspondent pas à la fiche pour 100 g/.test(nb(eF.fige)),
      J({ nF: nF.map(forme), eF, mF }));
    await fermer(pg); g = await ouvrirAjout(pg); L1 = await items(pg); av = await ids(pg);
    const gC = await ajoutRapide(pg, copie(L1));
    const nC = neuves(await journal(pg), av);
    t('B-NV2P P15 ⑦ ⛔⛔ « + AJOUTER » SUR LA COPIE (même code-barres, autres valeurs que la fiche vérifiée) : RIEN n\'est écrit',
      gC && nC.length === 0, J({ gC, nC: nC.map(forme) }));
    await fermer(pg); g = await ouvrirAjout(pg); L1 = await items(pg); av = await ids(pg);
    const gV = await ajoutRapide(pg, verif(L1));
    const nV = neuves(await journal(pg), av);
    t('B-NV2P P15 ⑧ ⭐⭐ « + AJOUTER » SUR LA LIGNE VÉRIFIÉE : exactement ce que la liste montrait — 40 g · 156 · 35 · 1 · 1 (à la main), par la fiche, code-barres gardé',
      gV && nV.length === 1 && J(forme(nV[0])) === J({ q: 40, u: 'g', kcal: 156, prot: 35, carbs: 1, fat: 1, sid: EAN_ISO, m: 'p' }), J({ gV, nV: nV.map(forme) }));

    /* ⑨b la RECHERCHE par nom (Open Food Facts simulé) : la même fiche, les mêmes valeurs */
    await fermer(pg); g = await ouvrirAjout(pg); av = await ids(pg);
    g = g && await taper(pg, '#af-desc', 'Iso P15');
    const gO = await pg.evaluate(async () => { _afSuggOff = await _offRechercher('Iso P15'); if (!_afSuggOff.length) return false; _afSuggPrendreOff(0); return true; });
    await pause(pg, 300);
    g = g && gO && await taper(pg, '#af-bc-grams', '40'); await pause(pg, 200);
    g = g && await ajouter(pg);
    const n9b = neuves(await journal(pg), av);
    t('B-NV2P P15 ⑨b ⭐ LA RECHERCHE PAR NOM (Open Food Facts simulé) : la même fiche — 40 g = 156 · 35 · 1 · 1, comme la ligne vérifiée et « + Ajouter »',
      g && n9b.length === 1 && J(forme(n9b[0])) === J({ q: 40, u: 'g', kcal: 156, prot: 35, carbs: 1, fat: 1, sid: EAN_ISO, m: 'p' }), J({ gO, n9b: n9b.map(forme) }));

    /* ⑨ un SCAN frais (code tapé, fiche simulée) — noté APRÈS la recherche (⑨b) : « Mes aliments » montre UN élément par produit,
       le plus récent vérifié, et c'est ce scan que l'étoile prendra (⑩) */
    await fermer(pg); g = await ouvrirAjout(pg); av = await ids(pg);
    g = g && await taper(pg, '#af-bc-manual', EAN_ISO);
    g = g && await clic(pg, 'button[onclick="_manualBarcode()"]'); await pause(pg, 800);
    g = g && await taper(pg, '#af-bc-grams', '50'); await pause(pg, 200);
    const e9 = await pg.evaluate(() => ['kcal', 'prot', 'carbs', 'fat'].map((c) => (document.getElementById('af-' + c) || {}).value).join('·'));
    g = g && await ajouter(pg);
    const n9 = neuves(await journal(pg), av), l9 = n9[0] || null;
    t('B-NV2P P15 ⑨ ⭐ UN SCAN FRAIS EST JUSTE : 50 g = 195 · 44 · 2 · 2 (à la main) — l\'écran les montrait, la ligne les porte',
      g && e9 === '195·44·2·2' && n9.length === 1 && J(forme(l9)) === J({ q: 50, u: 'g', kcal: 195, prot: 44, carbs: 2, fat: 2, sid: EAN_ISO, m: 'p' }), J({ e9, n9: n9.map(forme) }));
    /* ⑩ l'ÉTOILE sur le scan : elle agit sur CETTE ligne, pas sur un nom */
    await fermer(pg); g = await ouvrirAjout(pg); L1 = await items(pg);
    const frais = L1.find((x) => !x.fav && x.id === (l9 && l9.id)) || null;
    const gS = await etoile(pg, frais);
    const F10 = await favoris(pg);
    t('B-NV2P P15 ⑩ ⛔⛔ L\'ÉTOILE AGIT SUR CETTE LIGNE, PAS SUR UN NOM : le scan devient un favori (son code-barres, sa fiche, 50 g) — le favori d\'avant V2 du même nom n\'est ni retiré ni remplacé',
      gS && F10.length === 2 && F10.some((f) => f.sourceId === EAN_ISO && f.n2 && f.n2.m === 'p' && f.q === 50) && F10.some((f) => J(f) === J(P15_FAV_ISO)), J({ frais, F10 }));
    /* ⑪ ce que la liste affiche est ce qui s'écrit */
    L1 = await items(pg);
    const nouv = L1.find((x) => x.fav && x.sid === EAN_ISO) || null;
    const t11 = nouv ? nb(nouv.txt) : ''; av = await ids(pg);
    const g11 = await ajoutRapide(pg, nouv);
    const n11 = neuves(await journal(pg), av);
    t('B-NV2P P15 ⑪ ⭐⭐ CE QUE LA LISTE AFFICHE EST CE QUI S\'ÉCRIT : le favori dit « 195 kcal · pour 50 g · P 44 · G 2 · L 2 », « + Ajouter » écrit 50 g · 195 · 44 · 2 · 2',
      g11 && /^195 kcal · pour 50 g · P 44 · G 2 · L 2/.test(t11) && n11.length === 1 && J(forme(n11[0])) === J({ q: 50, u: 'g', kcal: 195, prot: 44, carbs: 2, fat: 2, sid: EAN_ISO, m: 'p' }), J({ t11, n11: n11.map(forme) }));
    /* ⑫ ⑬ « ✕ » sur le favori d'avant V2 : lui seul part — puis, l'étoile du scan retirée, ses lignes reviennent (rien ne les cache par le NOM) */
    const favAvant12 = J((await favoris(pg)).find((f) => !f.sourceId && f.name === 'Iso P15 (test)') || null);
    await fermer(pg); g = await ouvrirAjout(pg); L1 = await items(pg);
    const g12 = await supprimer(pg, favIso(L1));
    const F12 = await favoris(pg);
    t('B-NV2P P15 ⑫ ⛔ « ✕ » SUR LE FAVORI D\'AVANT V2 : lui seul disparaît — le favori du scan (même nom, autre aliment) reste ; et il était intact jusque-là',
      g12 && favAvant12 === J(P15_FAV_ISO) && !F12.some((f) => !f.sourceId && f.name === 'Iso P15 (test)') && F12.some((f) => f.sourceId === EAN_ISO), J({ g12, F12 }));
    L1 = await items(pg);
    const g13 = await etoile(pg, L1.find((x) => x.fav && x.sid === EAN_ISO) || null);
    L1 = await items(pg);
    t('B-NV2P P15 ⑬ ⛔⛔ … et RIEN NE CACHE PAR LE NOM ce qui appartient à un autre aliment : l\'étoile du scan retirée, les lignes de son code-barres reviennent dans « Mes aliments »',
      g13 && L1.some((x) => !x.fav && x.sid === EAN_ISO), J({ g13, iso: iso(L1) }));

    const apres1 = await journal(pg);
    t('B-NV2P P15 ⑭ ⛔⛔ AUCUNE LIGNE ENREGISTRÉE N\'A BOUGÉ : les 4 lignes semées sont intactes, octet par octet (afficher, vérifier, refuser n\'écrivent rien)',
      J(apres1.filter((x) => JSON.parse(semees1).some((y) => y.id === x.id))) === semees1, 'les lignes semées ont changé');
    t('B-NV2P P15 ⑮ aucune erreur de page (Iso)', p1.erreurs.length === 0, J(p1.erreurs));
  } finally { await p1.cx.close(); }

  /* ── page 2 : DEUX PRODUITS DU MÊME NOM, deux codes-barres (Yaourt A : 1 pot de 125 g ; Yaourt B : 1 pot de 150 g). Le favori
     du Yaourt A existe déjà, tel que l'étoile l'écrit sur sa ligne V2 (son code-barres, sa fiche, son pot de 125 g). ── */
  const FAV_YA = { name: 'Yaourt P15 (test)', kcal: 100, prot: 5, carbs: 13, fat: 4, per100: { kcal: 80, prot: 4, carbs: 10, fat: 3 }, q: 1, u: 'portion',
    portionLabel: 'pot', portionWeightG: 125, sourceId: EAN_YA, etat: 'tel-que-vendu', n2: { s: 1, m: 'p', f: { src: 'off', ver: null, fiab: 'source', base: 'g' } } };
  const p2 = await ouvrir(b, PORT, fixtureIncident('__nv2u2', [FAV_YA]), OFFI);
  try {
    const pg = p2.pg;
    await capterToasts(pg);
    await pg.evaluate(() => setFoodMeal('collation2'));
    const yaourt = (id, k, repas, ean, p100, poids) => ({ k: k, v2: { id: id, repas: repas, nom: 'Yaourt P15 (test)', origine: { saisie: 'code-tape', origine: 'off' },
      mode: 'pesee', fiche: { base: 'g', p100: p100, cle: ean, source: 'off', fiab: 'source', etat: 'tel-que-vendu' },
      quantite: { val: 1, unite: 'portion', origine: 'portion', portion: { libelle: 'pot', poids: poids, unite: 'g' } } } });
    const YA = { kcal: 80, prot: 4, carbs: 10, fat: 3 }, YB = { kcal: 120, prot: 3, carbs: 15, fat: 5 };
    const err2 = await semer(pg, [yaourt('nv2u-YA-00000003', 3, 'collation', EAN_YA, YA, 125),
      yaourt('nv2u-YB-00000002', 2, 'dejeuner', EAN_YB, YB, 150), yaourt('nv2u-YB-00000001', 1, 'dejeuner', EAN_YB, YB, 150)]);
    const semees2 = await journal(pg);
    const y = (L, sid, fav) => L.find((x) => x.nom === 'Yaourt P15 (test)' && x.sid === sid && !!x.fav === !!fav) || null;
    const ySid = (L, sid) => L.find((x) => x.nom === 'Yaourt P15 (test)' && x.sid === sid) || null;
    let g = await ouvrirAjout(pg);
    let L2 = await items(pg);
    t('B-NV2P P15 ⑯ ⛔⛔ DEUX PRODUITS DU MÊME NOM (deux codes-barres) : les DEUX sont dans « Mes aliments » — le favori « 100 kcal · pour 1 portion (125 g) » ne cache pas l\'autre, « 180 kcal · pour 1 portion (150 g) »',
      g && err2.length === 0 && !!ySid(L2, EAN_YA) && !!ySid(L2, EAN_YB) && /^100 kcal · pour 1 portion \(125 g\) · P /.test(nb(ySid(L2, EAN_YA).txt)) && /^180 kcal · pour 1 portion \(150 g\) · P /.test(nb(ySid(L2, EAN_YB).txt)),
      J(L2.filter((x) => x.nom === 'Yaourt P15 (test)')));
    const h16 = await pg.evaluate(() => _afSuggLocales('Yaourt P15').map((e) => e.sourceId));
    t('B-NV2P P15 ⑰ ⛔ … et « Déjà noté par toi » propose les deux (un par code-barres), pas le seul plus récent',
      h16.indexOf(EAN_YA) >= 0 && h16.indexOf(EAN_YB) >= 0, J(h16));
    /* ⑲ « Modifier » une ligne du Yaourt B (sans rien toucher), quand le SEUL favori de ce nom est celui du Yaourt A : ft-v1186 ⑤
       rafraîchit la définition DE CE PRODUIT, jamais celle d'un autre qui porte le même nom */
    await fermer(pg);
    g = await pg.evaluate(() => { try { openEditFood('nv2u-YB-00000001'); return true; } catch (e) { return false; } }); await pause(pg, 280);
    g = g && await clic(pg, '#ov-edit-food button[onclick="saveEditFood()"]'); await pause(pg, 300);
    const F19 = await favoris(pg);
    const fA = F19.find((f) => f.sourceId === EAN_YA) || F19.find((f) => f.name === 'Yaourt P15 (test)' && f.kcal === 100) || null;
    t('B-NV2P P15 ⑲ ⛔⛔ « MODIFIER » LE YAOURT B NE REDÉFINIT PAS LE FAVORI DU YAOURT A : son pot reste de 125 g (le nom est le même, le produit non)',
      g && !!fA && fA.portionWeightG === 125, J(F19));
    await fermer(pg); g = await ouvrirAjout(pg); L2 = await items(pg);
    const gB = await etoile(pg, y(L2, EAN_YB));
    const F18 = await favoris(pg);
    t('B-NV2P P15 ⑱ ⛔⛔ L\'ÉTOILE SUR LE YAOURT B : un 2ᵉ favori, avec SON code-barres et SON pot de 150 g — celui du Yaourt A (125 g) n\'est ni retiré ni remplacé',
      gB && F18.length === 2 && F18.some((f) => J(f) === J(FAV_YA)) && F18.some((f) => f.sourceId === EAN_YB && f.portionWeightG === 150), J(F18));
    /* ⑳ « + Ajouter » sur le favori du Yaourt A : la liste et la ligne disent la même chose */
    await fermer(pg); g = await ouvrirAjout(pg); L2 = await items(pg);
    const favA = L2.find((x) => x.fav && x.nom === 'Yaourt P15 (test)' && (x.sid === EAN_YA || /100 kcal/.test(x.txt))) || null;
    const t20 = favA ? nb(favA.txt) : ''; let av = await ids(pg);
    const g20 = await ajoutRapide(pg, favA);
    const n20 = neuves(await journal(pg), av);
    t('B-NV2P P15 ⑳ ⭐⭐ « + AJOUTER » SUR LE FAVORI DU YAOURT A : la liste dit « 100 kcal · pour 1 portion (125 g) · P 5 · G 13 · L 4 », la ligne écrit 1 pot de 125 g = 100 · 5 · 13 · 4 (à la main)',
      g20 && /^100 kcal · pour 1 portion \(125 g\) · P 5 · G 13 · L 4/.test(t20) && n20.length === 1 && n20[0].q === 1 && n20[0].portionWeightG === 125
      && J([n20[0].kcal, n20[0].prot, n20[0].carbs, n20[0].fat]) === J([100, 5, 13, 4]), J({ t20, n20: n20.map(forme) }));
    /* ㉑ l'habitude du Yaourt B (2 jours en déjeuner) : la carte dit ce qui s'écrit, et ça s'écrit */
    await fermer(pg); await pg.evaluate(() => renderFoodJournal()); await pause(pg, 200);
    const hab21 = await carte(pg, 'Yaourt P15');
    av = await ids(pg);
    const g21 = await rejouer(pg, 'Yaourt P15 (test)'); await pause(pg, 400);
    const n21 = neuves(await journal(pg), av);
    t('B-NV2P P15 ㉑ ⭐ « TES REPAS HABITUELS » (Yaourt B) : la carte dit « 180 kcal · 5 g de protéines », et c\'est ce qui s\'écrit — 1 pot de 150 g = 180 · 5 · 23 · 8 (à la main)',
      g21 && /180 kcal · 5 g de protéines/.test(nb(hab21)) && n21.length === 1 && n21[0].sourceId === EAN_YB && J([n21[0].kcal, n21[0].prot, n21[0].carbs, n21[0].fat]) === J([180, 5, 23, 8]),
      J({ hab21, n21: n21.map(forme) }));
    /* ㉒ « ✕ » sur le favori du Yaourt A : il part seul, rien ne cache le Yaourt B par son nom */
    g = await ouvrirAjout(pg); L2 = await items(pg);
    const g22 = await supprimer(pg, L2.find((x) => x.fav && x.sid === EAN_YA) || null);
    L2 = await items(pg); const F22 = await favoris(pg);
    const g22b = await etoile(pg, L2.find((x) => x.fav && x.sid === EAN_YB) || null);   // l'étoile du B retirée : ses lignes doivent rester visibles
    L2 = await items(pg);
    t('B-NV2P P15 ㉒ ⛔⛔ « ✕ » SUR LE FAVORI DU YAOURT A : lui seul part — le favori du Yaourt B reste, et (son étoile retirée) ses lignes restent dans « Mes aliments »',
      g22 && g22b && !F22.some((f) => f.sourceId === EAN_YA) && F22.some((f) => f.sourceId === EAN_YB) && L2.some((x) => !x.fav && x.sid === EAN_YB), J({ F22, L2: L2.filter((x) => x.nom === 'Yaourt P15 (test)') }));
    const apres2 = await journal(pg);
    t('B-NV2P P15 ㉓ ⛔ les lignes du Yaourt A et du 1ᵉʳ Yaourt B sont intactes (seule la ligne « modifiée » a été réécrite, par son geste)',
      J(apres2.filter((x) => x.id === 'nv2u-YA-00000003' || x.id === 'nv2u-YB-00000002')) === J(semees2.filter((x) => x.id === 'nv2u-YA-00000003' || x.id === 'nv2u-YB-00000002')), 'lignes changées');
    t('B-NV2P P15 ㉔ aucune erreur de page (deux produits du même nom)', p2.erreurs.length === 0, J(p2.erreurs));
  } finally { await p2.cx.close(); }

  /* ── page 3 : LE FAVORI 400 / 480 (par le vrai chemin), LA 2ᵉ MODIFICATION, UNE VALEUR INCONNUE, UNE CORRECTION GARDÉE,
     UNE QUANTITÉ ABSENTE, HORS LIGNE ── */
  const p3 = await ouvrir(b, PORT, fixtureIncident('__nv2u3', []), OFFI);
  try {
    const pg = p3.pg;
    await capterToasts(pg);
    await pg.evaluate(() => setFoodMeal('collation2'));
    const RIZ1 = { id: 'nv2u-R1-00000001', meal: 'diner', name: 'Riz P15 (test)', kcal: 195, prot: 4, carbs: 42, fat: 1, v: 1, saisie: 'manuel', origine: 'utilisateur',
      q: 150, u: 'g', per100: null, sourceId: null, etat: null };
    const err3 = await semer(pg, [
      { k: 3, v1: { id: 'nv2u-Q1-00000001', meal: 'collation', name: 'Pomme P15 (test)', kcal: 52, prot: 0, carbs: 14, fat: 0, v: 1, saisie: 'manuel', origine: 'utilisateur',
                    q: null, u: null, per100: null, sourceId: null, etat: null } },
      { k: 3, v1: { id: 'nv2u-S1-00000001', meal: 'collation', name: 'Shaker P15 (test)', kcal: 156, prot: 26, carbs: 1, fat: 1, v: 1, saisie: 'liste', origine: 'reprise',
                    q: 5, u: 'g', per100: { kcal: 3120, prot: 520, carbs: 20, fat: 20 }, sourceId: null, etat: null } },
      { k: 2, v1: RIZ1 },
      { k: 2, v1: { id: 'nv2u-B1-00000001', meal: 'collation', name: 'Barre P15 (test)', kcal: 230, carbs: 30, fat: 10, v: 1, saisie: 'manuel', origine: 'utilisateur',
                    q: 50, u: 'g', per100: null, sourceId: null, etat: null } },
      { k: 1, v2: { id: 'nv2u-G1-00000001', repas: 'diner', nom: 'Galette P15 (test)', origine: { saisie: 'code-tape', origine: 'off' }, mode: 'pesee',
                    fiche: { base: 'g', p100: { kcal: 180, prot: 6, carbs: 30, fat: 4 }, cle: '3000000000504', source: 'off', fiab: 'source' },
                    quantite: { val: 2, unite: 'portion', origine: 'portion', portion: { libelle: 'part', poids: 100, unite: 'g' } },
                    corrections: [{ c: 'kcal', v: 300, le: 1, avant: 360 }] } }]);
    const semees3 = await journal(pg);
    /* l'ÉCRAN DE SAISIE, onglet portions : un aliment tapé à la main, N portions de P g */
    const notePortions = async (nom, vals, n, poids) => {
      let ok = await ouvrirAjout(pg);
      ok = ok && await taper(pg, '#af-desc', nom);
      for (const [id, v] of [['#af-kcal', vals[0]], ['#af-prot', vals[1]], ['#af-carbs', vals[2]], ['#af-fat', vals[3]]]) ok = ok && await taper(pg, id, v);
      try { await pg.locator('#af-fat').blur(); } catch (e) { ok = false; }
      await pause(pg, 200);
      ok = ok && await clic(pg, '#af-prop-row button[onclick="_afSetUnite(\'portion\')"]'); await pause(pg, 220);
      ok = ok && await clic(pg, '#af-prop-row button[onclick="_afApplyPortion(' + n + ')"]'); await pause(pg, 220);
      ok = ok && await clic(pg, '#af-prop-row button[onclick="_afPortionNom(\'part\')"]'); await pause(pg, 200);
      ok = ok && await taper(pg, '#af-ppoids', String(poids)); await pause(pg, 250);
      const av2 = await ids(pg);
      ok = ok && await ajouter(pg);
      return { ok: ok, l: neuves(await journal(pg), av2)[0] || null };
    };
    /* ㉕ → ㉗ LE 400 / 480 : un pot de 125 g noté deux fois, mis en favori ; puis le même aliment noté en pots de 150 g */
    const P1 = await notePortions('Pot P15 (test)', [200, 10, 20, 8], 2, 125);
    await fermer(pg); let g = await ouvrirAjout(pg); let L3 = await items(pg);
    const gP = await etoile(pg, L3.find((x) => x.nom === 'Pot P15 (test)' && !x.fav) || null);
    await fermer(pg);
    const P2 = await notePortions('Pot P15 (test)', [240, 12, 24, 10], 2, 150);
    const F25 = (await favoris(pg)).find((f) => f.name === 'Pot P15 (test)') || null;
    t('B-NV2P P15 ㉕ ⭐ LE CHEMIN RÉEL DU 400 / 480 : 2 pots de 125 g = 400 · 20 · 40 · 16, mis en favori ; puis 2 pots de 150 g = 480 · 24 · 48 · 20 — et le favori a pris le nouveau poids (ft-v1186 ⑤ : sa définition suit, ses valeurs restent 400)',
      P1.ok && gP && P2.ok && !!P1.l && J([P1.l.kcal, P1.l.prot, P1.l.carbs, P1.l.fat, P1.l.q, P1.l.portionWeightG]) === J([400, 20, 40, 16, 2, 125])
      && !!P2.l && J([P2.l.kcal, P2.l.prot, P2.l.carbs, P2.l.fat, P2.l.q, P2.l.portionWeightG]) === J([480, 24, 48, 20, 2, 150])
      && !!F25 && F25.portionWeightG === 150 && F25.kcal === 400, J({ P1: forme(P1.l), P2: forme(P2.l), F25 }));
    await fermer(pg); g = await ouvrirAjout(pg); L3 = await items(pg);
    const favPot = L3.find((x) => x.fav && x.nom === 'Pot P15 (test)') || null;
    const t26 = favPot ? nb(favPot.txt) : ''; let av = await ids(pg); await vider(pg);
    const g26 = await ajoutRapide(pg, favPot);
    const n26 = neuves(await journal(pg), av), e26 = await ecranOuvert(pg), m26 = await vider(pg);
    t('B-NV2P P15 ㉖ ⛔⛔ LE 400 / 480 : le favori affiche 400 kcal — « + Ajouter » n\'écrit PAS 480 en silence : RIEN n\'est écrit, l\'écran s\'ouvre sur sa fiche (aucune quantité proposée), la liste et le message disent « à vérifier »',
      g26 && /^400 kcal · pour 2 portions · P /.test(t26) && /à vérifier/.test(t26) && n26.length === 0 && e26.ouvert && e26.bloc && !e26.pastille && m26.some((m) => /à vérifier/i.test(m))
      && /à vérifier : ses valeurs enregistrées ne correspondent plus à sa fiche/.test(nb(e26.fiche)),
      J({ t26, n26: n26.map(forme), e26, m26 }));
    /* ㉗ sur cet écran, la personne dit sa quantité : ce que l'écran montre est ce qui s'écrit */
    g = e26.ouvert && await taper(pg, '#af-bc-grams', '300'); await pause(pg, 200);
    const e27 = await pg.evaluate(() => ['kcal', 'prot', 'carbs', 'fat'].map((c) => (document.getElementById('af-' + c) || {}).value).join('·'));
    av = await ids(pg);
    g = g && await ajouter(pg);
    const n27 = neuves(await journal(pg), av);
    t('B-NV2P P15 ㉗ ⭐⭐ … la personne tape 300 g : l\'écran montre 480 · 24 · 48 · 19 (sa fiche, à la main) et la ligne est EXACTEMENT celle-là',
      g && e27 === '480·24·48·19' && n27.length === 1 && J([n27[0].kcal, n27[0].prot, n27[0].carbs, n27[0].fat, n27[0].q, n27[0].u]) === J([480, 24, 48, 19, 300, 'g']), J({ e27, n27: n27.map(forme) }));

    /* ㉘ C — la copie d'origine survit à la DEUXIÈME modification d'une ancienne ligne */
    await fermer(pg);
    const modifier = async (id) => { await fermer(pg); let ok = await pg.evaluate((i) => { try { openEditFood(i); return true; } catch (e) { return false; } }, id); await pause(pg, 280);
      ok = ok && await clic(pg, '#ov-edit-food button[onclick="saveEditFood()"]'); await pause(pg, 300); return ok; };
    const g28a = await modifier('nv2u-R1-00000001');
    const r1 = ligne(await journal(pg), 'nv2u-R1-00000001');
    const g28b = await modifier('nv2u-R1-00000001');
    const r2 = ligne(await journal(pg), 'nv2u-R1-00000001');
    const orig = J(Object.assign({}, RIZ1, { ts: (semees3.find((x) => x.id === 'nv2u-R1-00000001') || {}).ts, date: (semees3.find((x) => x.id === 'nv2u-R1-00000001') || {}).date }));
    const avJ = (l) => (l && l.n2 && l.n2.av) ? J(Object.keys(l.n2.av).sort().reduce((o, k) => (o[k] = l.n2.av[k], o), {})) : null;
    const origTri = J(Object.keys(JSON.parse(orig)).sort().reduce((o, k) => (o[k] = JSON.parse(orig)[k], o), {}));
    t('B-NV2P P15 ㉘ ⛔⛔ LA COPIE D\'ORIGINE SURVIT À LA 2ᵉ MODIFICATION : après deux « Enregistrer », `n2.av` est toujours l\'ancienne ligne d\'origine, octet par octet (saisie « manuel », 150 g · 195 kcal)',
      g28a && g28b && avJ(r1) === origTri && avJ(r2) === origTri, J({ av1: r1 && r1.n2 && r1.n2.av, av2: r2 && r2.n2 && r2.n2.av }));

    /* ㉙ ㉚ D — une valeur INCONNUE reste inconnue, par l'étoile et par « + Ajouter » */
    g = await ouvrirAjout(pg); L3 = await items(pg);
    const gD = await etoile(pg, L3.find((x) => x.nom === 'Barre P15 (test)' && !x.fav) || null);
    const fD = (await favoris(pg)).find((f) => f.name === 'Barre P15 (test)') || null;
    L3 = await items(pg);
    const tD = nb((L3.find((x) => x.fav && x.nom === 'Barre P15 (test)') || {}).txt);
    t('B-NV2P P15 ㉙ ⛔⛔ UNE PROTÉINE INCONNUE N\'EST PAS 0 : le favori pris par l\'étoile n\'a PAS de protéines (aucune clé), et la liste dit « P ? » — et « non vérifié » (une ancienne ligne qu\'aucune fiche ne confirme)',
      gD && !!fD && !('prot' in fD) && /230 kcal · pour 50 g · P \? · G 30 · L 10 · non vérifié/.test(tD), J({ fD, tD }));
    av = await ids(pg);
    const gD2 = await ajoutRapide(pg, L3.find((x) => x.fav && x.nom === 'Barre P15 (test)') || null);
    const nD = neuves(await journal(pg), av);
    t('B-NV2P P15 ㉚ ⛔⛔ … et « + Ajouter » depuis ce favori écrit une ligne SANS protéines (inconnues, jamais 0) : 50 g · 230 · ? · 30 · 10',
      gD2 && nD.length === 1 && !('prot' in nD[0]) && nD[0].kcal === 230 && nD[0].carbs === 30 && nD[0].fat === 10 && nD[0].q === 50, J(nD));

    /* ㉛ une CORRECTION volontaire n'est pas une incohérence : elle se garde, elle ne se signale pas « à vérifier » */
    await fermer(pg); g = await ouvrirAjout(pg); L3 = await items(pg);
    const gK = await etoile(pg, L3.find((x) => x.nom === 'Galette P15 (test)' && !x.fav) || null);
    L3 = await items(pg);
    const favG = L3.find((x) => x.fav && x.nom === 'Galette P15 (test)') || null, tG = favG ? nb(favG.txt) : '';
    av = await ids(pg);
    const gK2 = await ajoutRapide(pg, favG);
    const nK = neuves(await journal(pg), av);
    t('B-NV2P P15 ㉛ ⭐ UNE CORRECTION À LA MAIN N\'EST PAS « À VÉRIFIER » : « 300 kcal · pour 2 portions (200 g) » sans réserve, et « + Ajouter » écrit 300 (360 → 300 tracé)',
      gK && gK2 && /^300 kcal · pour 2 portions \(200 g\) · P /.test(tG) && !/à vérifier/.test(tG) && nK.length === 1 && nK[0].kcal === 300
      && nK[0].n2 && J((nK[0].n2.corr || []).map((x) => [x.c, x.v, x.avant])) === J([['kcal', 300, 360]]), J({ tG, nK: nK.map(forme) }));
    /* ㉜ une quantité ABSENTE : rien n'est écrit, rien n'est inventé, et ce n'est pas « à vérifier » */
    await fermer(pg); g = await ouvrirAjout(pg); L3 = await items(pg);
    const pom = L3.find((x) => x.nom === 'Pomme P15 (test)') || null; av = await ids(pg);
    const gQ = await ajoutRapide(pg, pom);
    const nQ = neuves(await journal(pg), av);
    t('B-NV2P P15 ㉜ ⛔ QUANTITÉ ABSENTE : « + Ajouter » n\'écrit rien et n\'invente aucune quantité — et la liste ne la dit pas « à vérifier » (elle est à compléter)',
      gQ && nQ.length === 0 && !!pom && !/à vérifier/.test(nb(pom.txt)), J({ pom, nQ }));
    /* ㉜b une valeur IMPOSSIBLE (28 g de macros dans 5 g — la forme exacte d'une ligne contaminée par M6) : « à vérifier », rien d'écrit,
       et l'écran le dit */
    await fermer(pg); g = await ouvrirAjout(pg); L3 = await items(pg);
    const shk = L3.find((x) => x.nom === 'Shaker P15 (test)') || null; av = await ids(pg); await vider(pg);
    const gS2 = await ajoutRapide(pg, shk);
    const nS = neuves(await journal(pg), av), eS = await ecranOuvert(pg);
    t('B-NV2P P15 ㉜b ⛔⛔ UNE VALEUR IMPOSSIBLE (156 kcal · 26 g de protéines notés pour 5 g) : la liste dit « à vérifier », « + Ajouter » n\'écrit RIEN, l\'écran dit « ne peuvent pas tenir dans 5 g »',
      gS2 && !!shk && /^156 kcal · pour 5 g · P /.test(nb(shk.txt)) && /à vérifier/.test(nb(shk.txt)) && nS.length === 0 && eS.ouvert
      && /À vérifier : ses valeurs ne peuvent pas tenir dans 5 g/.test(nb(eS.fige)), J({ shk, nS: nS.map(forme), eS }));
    /* ㉝ HORS LIGNE : la reprise ne dépend d'aucun réseau */
    await fermer(pg);
    await p3.cx.setOffline(true);
    g = await ouvrirAjout(pg); L3 = await items(pg); av = await ids(pg);
    const gH = await ajoutRapide(pg, L3.find((x) => x.fav && x.nom === 'Galette P15 (test)') || null);
    const nH = neuves(await journal(pg), av);
    await fermer(pg); g = await ouvrirAjout(pg);
    await pg.evaluate(() => { _afSuggLoc = _afSuggLocales('Galette P15'); if (_afSuggLoc.length) _afSuggPrendreLocale(0); }); await pause(pg, 300);
    const rH = await pg.evaluate(() => { const x = document.getElementById('af-bc-last'); return { vu: !!(x && x.style.display === 'inline-block'), txt: x ? x.textContent : '', champ: (document.getElementById('af-bc-grams') || {}).value }; });
    await p3.cx.setOffline(false);
    t('B-NV2P P15 ㉝ ⭐ HORS LIGNE : « + Ajouter » sur un favori écrit la même ligne (300 kcal, correction tracée), et la reprise depuis ton journal propose « ↩ 2 portions (200 g) », champ vide',
      gH && nH.length === 1 && nH[0].kcal === 300 && rH.vu && nb(rH.txt) === '↩ 2 portions (200 g) (la dernière fois)' && rH.champ === '', J({ nH: nH.map(forme), rH }));

    const apres3 = await journal(pg);
    t('B-NV2P P15 ㉞ ⛔⛔ AUCUNE AUTRE LIGNE N\'A BOUGÉ : la pomme, la barre, le shaker et la galette semés sont intacts, octet par octet (seul le riz a été modifié, par ses deux gestes)',
      J(apres3.filter((x) => /^nv2u-(Q1|B1|G1|S1)-/.test(x.id))) === J(semees3.filter((x) => /^nv2u-(Q1|B1|G1|S1)-/.test(x.id))), 'lignes changées');
    t('B-NV2P P15 ㉟ aucune erreur de page (favori 400/480, modifications, inconnues, hors ligne)', p3.erreurs.length === 0 && err3.length === 0, J({ erreurs: p3.erreurs, err3 }));
  } finally { await p3.cx.close(); }
}

module.exports = { ecran, incident };
