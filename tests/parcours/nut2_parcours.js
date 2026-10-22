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

/* ── LES GESTES — au pointeur ; un geste raté rend FAUX (il ne ressemble jamais à un vert) ── */
const clic = async (pg, sel) => { try { await pg.click(sel, { timeout: 4000 }); return true; } catch (e) { return false; } };
const taper = async (pg, sel, v) => { try { await pg.fill(sel, String(v)); await pg.waitForTimeout(140); return true; } catch (e) { return false; } };
const pause = (pg, ms) => pg.waitForTimeout(ms);
async function ouvrir(b, PORT, fix) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const pg = await cx.newPage();
  const erreurs = [];
  pg.on('pageerror', (e) => erreurs.push(String(e && e.message || e).slice(0, 160)));
  pg.on('dialog', (d) => d.accept());
  /* ⛔ Open Food Facts n'est JAMAIS joint : la fiche du jus est servie ici. */
  await pg.route(/openfoodfacts/, (r) => r.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify(r.request().url().indexOf(EAN_JUS) >= 0 ? JUS : { status: 0 }) }));
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
    t('B-NV2P P12 ② ⛔⛔ NON VÉRIFIÉE (code-barres d\'hier) : valeurs ET 150 g recopiés, statut « déclaré », la ligne le dit — pas de pour-100 g, pas de code-barres repris (D-101 ⑩)',
      !!c1 && memes(vals(c1), { kcal: 195, prot: 4, carbs: 42, fat: 1 }) && c1.q === 150 && c1.u === 'g' && c1.per100 === null && c1.sourceId === null && c1.etat === null &&
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
}

module.exports = { ecran };
