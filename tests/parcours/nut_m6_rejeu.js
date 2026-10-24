/* ══════════════════════════════════════════════════════════════════════════════════════
   NUT-M6-REJEU-01 (21/10/2026, ordre de travail de Michel) — LE REJEU D'UN REPAS HABITUEL
   ET L'AJOUT RAPIDE NE LISENT PLUS L'ÉCRAN D'AJOUT.

   Le défaut M6 (mesuré le 20/10 sur ft-v1256, rejoué sur ft-v1257) : `rejouerRepas`
   (« Tes repas habituels ») passait par `_provFood`, qui lisait l'état de l'écran d'ajout ; cet
   état survit à la fermeture de l'écran (« Annuler » ne remet rien à zéro), donc chaque
   aliment rejoué héritait de ce qui venait d'être choisi — par QUATRE lectures : le bloc
   grammes, l'ancre en grammes (un faux pour-100 g), la portion, la trace de fiabilité.

   🥗🔁 RÉÉCRIT AU JALON 4 DE NUTRITION V2 (22/10/2026) — LA GARANTIE EST LA MÊME, SON SUPPORT A CHANGÉ.
   ft-v1258 fermait M6 par un marqueur (`ecran:false`) dans `_provFood`. V2 RETIRE `_provFood` (R30, raison écrite
   dans `app.js`) : un aliment re-noté passe par `_n2Reajouter`, qui ne lit QUE la ligne d'origine et la donne au
   moteur (`NUT2.reprise` puis `NUT2.ligneNouvelle`). M6 est donc fermé PAR CONSTRUCTION, et ce fichier le prouve
   de deux façons : par la SOURCE (cliquet B-NM6-C : qui écrit, qui lit l'écran) et par l'ÉCRAN (B-NM6-S/A/Q/MQ :
   de vrais gestes, puis le rejeu).
   Ce que V2 change dans l'ATTENDU (décisions, pas des détails) :
     · une ligne reprise SANS fiche vérifiée (ni CIQUAL retrouvée à l'identique, ni ligne V2) garde son nom, ses
       valeurs et sa quantité TELS QUELS, mais ne transporte plus son pour-100 g (M1 : un pour-100 g non vérifié
       ne se propage plus) et le dit (`reprise-non-verifiee`) — contrat V2, `docs/NUTRITION-V2-ARCHITECTURE.md` §14 ;
     · un aliment sans quantité valide (aucune, ou « 1 portion » sans poids — D-099) n'est PLUS recopié : il n'est
       pas complété, et le message du rejeu le NOMME (contrat V2 : « une quantité absente n'enregistre rien ») ;
     · une saisie à la main exige son poids, une portion son nom ET son poids (D-099) ; le poids d'une reprise est
       une PASTILLE à toucher (garde-fou du 10/09, option A).

   ⭐ L'INVARIANT FIGÉ ICI (pas une implémentation) : ce qu'un rejeu écrit ne dépend QUE des lignes d'origine —
   le même résultat QUEL QUE SOIT ce que l'écran d'ajout retient (fiche chargée, grammes tapés, reprise figée,
   portions, trace de fiabilité) ; et un ajout fait DEPUIS l'écran continue de lire l'écran (rien n'est « fermé
   par défaut »). Le rejeu ne remet PAS l'écran à zéro (décision de Michel, 21/10).

   ⛔ PAR LE VRAI CHEMIN : vrais clics au pointeur (« Mes aliments », « Ajouter », « Annuler », le « + » de l'ajout
   rapide, les pastilles, la carte « Tes repas habituels » puis le moment), un code-barres tapé (Open Food Facts
   SIMULÉ, jamais joint). Données INVENTÉES « (test) » + une fiche CIQUAL publique (9810), aucune identité.
   L'oracle compare à des valeurs écrites À LA MAIN ci-dessous — jamais à ce que l'app calcule.
   ⛔ FICHIER À PART : le contrôle négatif `tools/mut_nut_m6_rejeu.py` rejoue ces témoins sur une copie mutée ;
   la passe les appelle aussi.
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

/* ── LE JEU DE DONNÉES INVENTÉ — petit-déjeuner noté deux jours de suite (donc « habituel »),
   un dîner noté une fois (ses aliments sont dans « Mes aliments »). Toutes des lignes d'AVANT V2. ─────── */
const PDJ = [
  /* pour-100 g noté mais NON vérifiable (aucune base ne le retrouve) */
  { name: 'Banane (test)', kcal: 88, prot: 1, carbs: 20, fat: 0, q: 100, u: 'g', per100: { kcal: 88, prot: 1.1, carbs: 20, fat: 0.3 } },
  /* « 1 portion » SANS poids : D-099, ce n'est pas une quantité */
  { name: 'Shake (test)', kcal: 156, prot: 26, carbs: 1, fat: 1, q: 1, u: 'portion', per100: null },
  /* sans quantité */
  { name: 'Pain (test)', kcal: 250, prot: 9, carbs: 48, fat: 2, q: null, u: null, per100: null },
  { name: 'Yaourt (test)', kcal: 75, prot: 5, carbs: 6, fat: 3, q: 125, u: 'g', per100: { kcal: 60, prot: 4, carbs: 4.8, fat: 2.4 } },
];
const DINER = [
  /* ⭐ une ancienne ligne VÉRIFIABLE : la fiche CIQUAL 9810 retrouvée à l'identique (140 g × 364 = 509,6 → 510 ·
     18,34 → 18 · 101,78 → 102 · 2,24 → 2). C'est elle qui charge une fiche de confiance dans le bloc « Quantité ». */
  { name: 'Pâtes (test)', kcal: 510, prot: 18, carbs: 102, fat: 2, q: 140, u: 'g', per100: { kcal: 364, prot: 13.1, carbs: 72.7, fat: 1.6 },
    sourceId: 'ciqual:9810', saisie: 'ciqual', origine: 'ciqual' },
  /* sans pour-100 g : une reprise FIGÉE (valeurs telles quelles, la quantité se choisit) */
  { name: 'Riz (test)', kcal: 260, prot: 5, carbs: 57, fat: 1, q: 200, u: 'g', per100: null },
];
/* Le scan (Open Food Facts SIMULÉ) : un pour-100 g INCOHÉRENT exprès (48 kcal annoncées, 4×20 + 4×5 + 9×3 = 127 par
   les macros) — c'est lui qui pose une TRACE de fiabilité à l'écran (`_bcNutr.fiab`, DERIVE_ESTIMABLE). */
const EAN_BARRE = '3000000000137';
const BARRE = { status: 1, product: { product_name_fr: 'Barre (test)', brands: 'Marque test', quantity: '50 g', product_quantity_unit: 'g',
  nutriments: { 'energy-kcal_100g': 48, proteins_100g: 20, carbohydrates_100g: 5, fat_100g: 3 } } };

/* ⭐ CE QU'UN REJEU DU PETIT-DÉJEUNER DOIT ÉCRIRE — écrit à la main depuis le jeu de données, pas calculé par l'app.
   Banane et Yaourt : TELS QUELS (valeurs, quantité, unité), sans pour-100 g, déclarés, « reprise-non-verifiee ».
   Shake (portion sans poids) et Pain (sans quantité) : RIEN — et le message les nomme. */
const ATTENDU = {
  'Banane (test)': { q: 100, u: 'g', per100: null, kcal: 88, prot: 1, carbs: 20, fat: 0 },
  'Yaourt (test)': { q: 125, u: 'g', per100: null, kcal: 75, prot: 5, carbs: 6, fat: 3 },
};
const NON_COMPLETES = ['Shake (test)', 'Pain (test)'];
/* ⭐ LES « AJOUTER » DEPUIS L'ÉCRAN — calculés à la main :
   A1  Pâtes (CIQUAL 9810) 5 g → 364 × 0,05 = 18,2 → 18 · 13,1 × 0,05 = 0,655 → 1 · 72,7 × 0,05 = 3,635 → 4 · 0,08 → 0 ;
   A2  Riz repris FIGÉ, pastille 200 g → tel quel : 260 · 5 · 57 · 1, sans pour-100 g, « reprise-non-verifiee » ;
   A2b Riz repris FIGÉ, 150 g tapés ET calories retouchées à 195 → 195 · 5 · 57 · 1 pour 150 g (déclaré) ;
   A3  Gâteau 300/4/40/14 × 2 portions « part » de 80 g → 600 · 8 · 80 · 28, pour-100 g 300/0,8 = 375 · 5 · 50 · 17,5 ;
   A4  Barre scannée (énergie dérivée des macros : 127 / 100 g) 50 g → 63,5 → 64 · 10 · 2,5 → 3 · 1,5 → 2, trace
       DERIVE_ESTIMABLE (Math.round : la moitié s'arrondit vers le haut). */
const AJOUTS = {
  A1: { name: 'Pâtes (test)', q: 5, u: 'g', per100: { kcal: 364, prot: 13.1, carbs: 72.7, fat: 1.6 }, kcal: 18, prot: 1, carbs: 4, fat: 0, fiab: null,
        m: 'p', src: 'ciqual', sourceId: 'ciqual:9810' },
  A2: { name: 'Riz (test)', q: 200, u: 'g', per100: null, kcal: 260, prot: 5, carbs: 57, fat: 1, fiab: null, m: 'd', note: 'reprise-non-verifiee' },
  A2b: { name: 'Riz (test)', q: 150, u: 'g', per100: null, kcal: 195, prot: 5, carbs: 57, fat: 1, fiab: null, m: 'd', note: 'reprise-non-verifiee' },
  A3: { name: 'Gâteau maison (test)', q: 2, u: 'portion', portionLabel: 'part', portionWeightG: 80,
        per100: { kcal: 375, prot: 5, carbs: 50, fat: 17.5 }, kcal: 600, prot: 8, carbs: 80, fat: 28, fiab: null, m: 'p', src: 'utilisateur' },
  A4: { name: 'Barre (test) (Marque test)', q: 50, u: 'g', per100: { kcal: 127, prot: 20, carbs: 5, fat: 3 }, kcal: 64, prot: 10, carbs: 3, fat: 2,
        fiab: 'DERIVE_ESTIMABLE', m: 'p', src: 'off', sourceId: EAN_BARRE },
};

function fixture() {
  return `(() => { try {
    if (sessionStorage.getItem('__m6')) return; sessionStorage.setItem('__m6', '1');
    localStorage.clear();
    localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
    const pad = n => String(n).padStart(2,'0');
    const J = k => { const t = new Date(); t.setDate(t.getDate()-k); return t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate()); };
    let n = 0; const L = [];
    const ligne = (date, meal, x) => { n++; L.push(Object.assign({ date, meal, ts: 1700000000000 + n * 1000,
      id: 'fx-m6-' + String(n).padStart(4,'0'), v: 1, saisie: 'manuel', origine: 'utilisateur', modifie: false }, x)); };
    const PDJ = ${JSON.stringify(PDJ)}, DINER = ${JSON.stringify(DINER)};
    [2, 1].forEach(k => PDJ.forEach(x => ligne(J(k), 'petitdej', JSON.parse(JSON.stringify(x)))));
    DINER.forEach(x => ligne(J(3), 'diner', JSON.parse(JSON.stringify(x))));
    localStorage.setItem('ft4_foodlog', JSON.stringify(L));
  } catch (e) {} })();`;
}

/* ── LES GESTES — au pointeur ; chacun rend VRAI/FAUX : un geste raté ne doit pas ressembler à un vert ── */
const clic = async (pg, sel) => { try { await pg.click(sel, { timeout: 4000 }); return true; } catch (e) { return false; } };
async function ouvrirPage(b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const pg = await cx.newPage();
  const erreurs = [];
  pg.on('pageerror', (e) => erreurs.push(String(e && e.message || e).slice(0, 160)));
  pg.on('dialog', (d) => d.accept());
  /* ⛔ Open Food Facts n'est JAMAIS joint : la fiche de la barre est servie ici, rien d'autre. */
  await pg.route(/openfoodfacts/, (r) => r.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify(r.request().url().indexOf(EAN_BARRE) >= 0 ? BARRE : { status: 0 }) }));
  await pg.addInitScript(fixture());
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1500);
  await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open'));
    window.__toasts = []; const v = window.toast; window.toast = function (m) { window.__toasts.push(String(m)); try { return v.apply(this, arguments); } catch (e) {} }; });
  const g1 = await clic(pg, '#nb-nutrition'); await pg.waitForTimeout(400);
  const g2 = await clic(pg, '#ntab-journal'); await pg.waitForTimeout(250);
  return { cx, pg, erreurs, ok: g1 && g2 };
}
async function ouvrirAjout(pg) { const ok = await clic(pg, 'button[onclick="addFoodVia(\'main\')"]'); await pg.waitForTimeout(300); return ok; }
async function indexListe(pg, nom) { return pg.evaluate((n) => (typeof _afQuickItems !== 'undefined' && _afQuickItems || []).findIndex((x) => x && x.name === n), nom); }
/* « Mes aliments » → l'aliment. ⏳ 600 ms : une ancienne ligne CIQUAL attend la table (locale) avant d'être reprise. */
async function prendre(pg, nom) {
  const i = await indexListe(pg, nom); if (i < 0) return false;
  const ok = await clic(pg, '#af-quick-list div[onclick="quickFillFood(' + i + ')"]'); await pg.waitForTimeout(600); return ok;
}
async function ajoutRapide(pg, nom) {
  const i = await indexListe(pg, nom); if (i < 0) return false;
  const ok = await clic(pg, '#af-quick-list button[onclick="quickAddFood(' + i + ')"]'); await pg.waitForTimeout(600); return ok;
}
async function taper(pg, sel, v) { try { await pg.fill(sel, String(v)); await pg.waitForTimeout(120); return true; } catch (e) { return false; } }
async function quitter(pg, sel) { try { await pg.locator(sel).blur(); await pg.waitForTimeout(150); return true; } catch (e) { return false; } }
async function ajouter(pg) { const ok = await clic(pg, 'button[onclick="addFoodEntry()"]'); await pg.waitForTimeout(300); return ok; }
async function annuler(pg) { const ok = await clic(pg, '#ov-add-food button[onclick="closeAddFood()"]'); await pg.waitForTimeout(200); return ok; }
async function saisieGateau(pg) {
  const r = [await taper(pg, '#af-desc', 'Gâteau maison (test)')];
  for (const [id, v] of [['#af-kcal', '300'], ['#af-prot', '4'], ['#af-carbs', '40'], ['#af-fat', '14']]) r.push(await taper(pg, id, v));
  r.push(await quitter(pg, '#af-fat'));   /* le clavier se ferme : le « change » part (le bloc sous les valeurs se dessine) */
  /* D-099 : les grammes sont l'onglet par défaut — la portion se choisit, avec son nom ET son poids */
  r.push(await clic(pg, '#af-prop-row button[onclick="_afSetUnite(\'portion\')"]')); await pg.waitForTimeout(120);
  r.push(await clic(pg, 'button[onclick="_afApplyPortion(2)"]')); await pg.waitForTimeout(100);
  r.push(await clic(pg, 'button[onclick="_afPortionNom(\'part\')"]')); await pg.waitForTimeout(100);
  r.push(await taper(pg, '#af-ppoids', '80'));
  return r.every(Boolean);
}
async function scannerBarre(pg) {
  const r = [await taper(pg, '#af-bc-manual', EAN_BARRE), await clic(pg, 'button[onclick="_manualBarcode()"]')];
  await pg.waitForTimeout(900);
  return r.every(Boolean) && await pg.evaluate(() => !!(typeof _bcNutr !== 'undefined' && _bcNutr && _bcNutr.fiab));
}
async function rejouerPdj(pg) {
  /* la carte « Tes repas habituels » qui contient la banane, puis le moment « Petit-déj » */
  const idx = await pg.evaluate(() => [...document.querySelectorAll('button[onclick^="_habChoisirMoment"]')].findIndex((x) => /Banane \(test\)/.test(x.textContent)));
  if (idx < 0) return false;
  const carte = (await pg.$$('button[onclick^="_habChoisirMoment"]'))[idx];
  try { await carte.scrollIntoViewIfNeeded(); await carte.click(); } catch (e) { return false; }
  await pg.waitForTimeout(200);
  const m = String(await carte.getAttribute('onclick') || '').match(/'(hab-m-\d+)'/);
  if (!m) return false;
  const ok = await clic(pg, '#' + m[1] + ' button[onclick$="\'petitdej\')"]');
  await pg.waitForTimeout(350);
  return ok;
}
const journal = (pg) => pg.evaluate(() => JSON.parse(JSON.stringify(S.foodLog || [])));
const nouvelles = (avant, apres) => { const ids = new Set(avant.map((x) => x.id)); return apres.filter((x) => !ids.has(x.id)); };
const dernierToast = (pg) => pg.evaluate(() => (window.__toasts || []).slice(-1)[0] || '');
/* ce que l'écran d'ajout retient — pour prouver que le rejeu n'y touche PAS (aucune remise à zéro) */
const ecranEtat = (pg) => pg.evaluate(() => JSON.stringify({
  bc: (document.getElementById('af-bc-row') || { style: {} }).style.display, g: (document.getElementById('af-bc-grams') || {}).value,
  nutr: (typeof _bcNutr !== 'undefined' && _bcNutr) ? _bcNutr.name || '?' : null, pose: (typeof _bcQtyPose !== 'undefined') ? _bcQtyPose : null,
  ref: (typeof _afRef !== 'undefined' && _afRef) ? [_afRef.q, _afRef.u, !!_afRef.fige] : null, prop: (document.getElementById('af-prop') || {}).value || null,
  unite: (typeof _afUnite !== 'undefined') ? _afUnite : null, ppose: (typeof _afPortionPose !== 'undefined') ? _afPortionPose : null,
  nport: (typeof _afPortions !== 'undefined') ? _afPortions : null,
  src: (typeof _afSrc !== 'undefined' && _afSrc) ? [_afSrc.saisie, _afSrc.origine] : null }));

/* ── L'ORACLE — une ligne comparée à ce qu'elle doit porter, champ par champ ─────────────────────── */
const nul = (v) => v === undefined || v === null;
const memeP100 = (x, a) => (nul(a) ? nul(x) : (!nul(x) && ['kcal', 'prot', 'carbs', 'fat'].every((k) => Math.abs(x[k] - a[k]) < 1e-9)));
const CHAMPS_ECRAN = ['ecran', '_src', 'fige', 'qte', 'n2f', 'attendu', 'base'];
function ecartsLigne(nom, x, a, attenduSaisie) {
  const e = [];
  const dit = (k, v, w) => e.push(nom + ' ' + k + ' ' + JSON.stringify(v) + ' au lieu de ' + JSON.stringify(w));
  for (const k of ['q', 'u']) if ((nul(x[k]) ? null : x[k]) !== a[k]) dit(k, x[k], a[k]);
  if (!memeP100(x.per100, a.per100)) dit('pour-100 g', x.per100, a.per100);
  for (const k of ['kcal', 'prot', 'carbs', 'fat']) if (x[k] !== a[k]) dit(k, x[k], a[k]);
  if ((nul(x.portionLabel) ? null : x.portionLabel) !== (a.portionLabel || null)) dit('portion', x.portionLabel, a.portionLabel || null);
  if ((nul(x.portionWeightG) ? null : x.portionWeightG) !== (a.portionWeightG || null)) dit('poids de portion', x.portionWeightG, a.portionWeightG || null);
  const fx = nul(x.fiab) ? null : x.fiab.etat;
  if (fx !== (a.fiab || null)) dit('fiabilité', fx, a.fiab || null);
  if (attenduSaisie && (x.saisie !== attenduSaisie[0] || x.origine !== attenduSaisie[1])) dit('provenance', [x.saisie, x.origine], attenduSaisie);
  const n2 = x.n2 || {};
  if (n2.s !== 1) dit('n2.s', n2.s, 1);
  if (a.m && n2.m !== a.m) dit('mode', n2.m, a.m);
  if (a.src && !(n2.f && n2.f.src === a.src)) dit('source de la fiche', n2.f && n2.f.src, a.src);
  if (a.sourceId !== undefined && (x.sourceId || null) !== a.sourceId) dit('sourceId', x.sourceId, a.sourceId);
  if (a.note && !(Array.isArray(n2.no) && n2.no.indexOf(a.note) >= 0)) dit('note', n2.no, a.note);
  CHAMPS_ECRAN.forEach((k) => { if (k in x) e.push(nom + ' porte le champ d\'écran « ' + k + ' » (il ne doit jamais atteindre la donnée)'); });
  return e;
}
/* Un REJEU du petit-déjeuner : Banane et Yaourt re-notés TELS QUELS, Shake et Pain non complétés, nommés. */
function ecartsRejeu(lignes, jour, msg) {
  const e = [];
  const noms = Object.keys(ATTENDU);
  if (lignes.length !== noms.length) e.push(lignes.length + ' ligne(s) rejouée(s) au lieu de ' + noms.length);
  const ids = new Set();
  for (const nom of noms) {
    const l = lignes.filter((x) => x.name === nom);
    if (l.length !== 1) { e.push(nom + ' : ' + l.length + ' ligne(s)'); continue; }
    const x = l[0];
    if (x.meal !== 'petitdej' || x.date !== jour) e.push(nom + ' rangé au ' + x.date + ' / ' + x.meal);
    if (!x.id || /^fx-m6-/.test(x.id) || ids.has(x.id)) e.push(nom + ' identifiant ' + x.id); ids.add(x.id);
    if (!nul(x.etat) || !nul(x.sourceId)) e.push(nom + ' état/source ' + JSON.stringify([x.etat, x.sourceId]));
    if (!(x.n2 && x.n2.qo === 'proposee')) e.push(nom + ' origine de la quantité ' + JSON.stringify(x.n2 && x.n2.qo));
    e.push(...ecartsLigne(nom, x, Object.assign({ fiab: null, m: 'd', note: 'reprise-non-verifiee' }, ATTENDU[nom]), ['liste', 'reprise']));
  }
  NON_COMPLETES.forEach((nom) => {
    if (lignes.some((x) => x.name === nom)) e.push(nom + ' a été écrit (quantité complétée ?)');
    if (msg.indexOf(nom) < 0) e.push('le message ne nomme pas ' + nom);
  });
  return e;
}
const court = (e) => e.slice(0, 6).join(' · ') + (e.length > 6 ? ' · … (' + e.length + ' écarts)' : '');

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-NM6-S. NUT-M6-REJEU-01 (V2) — le rejeu d\'un repas habituel ne lit pas l\'écran d\'ajout ═══');

  /* Un scénario = une page neuve, un geste avant le rejeu, le rejeu au pointeur, puis l'oracle. */
  const jourDe = (pg) => pg.evaluate(() => { const d = new Date(), p = (n) => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); });
  const AJ = {};   /* les lignes « Ajouter » relevées en route, jugées plus bas (B-NM6-A) */
  const scenario = async (code, libelle, avantRejeu) => {
    const { cx, pg, erreurs, ok } = await ouvrirPage(b, PORT);
    try {
      const gestes = [ok];
      const L0 = await journal(pg);
      if (avantRejeu) gestes.push(await avantRejeu(pg));
      const L1 = await journal(pg);
      const ajout = nouvelles(L0, L1);
      const e0 = await ecranEtat(pg);
      gestes.push(await rejouerPdj(pg));
      const msg = await dernierToast(pg);
      const e1 = await ecranEtat(pg);
      const L2 = await journal(pg);
      const ec = ecartsRejeu(nouvelles(L1, L2), await jourDe(pg), msg);
      t('B-NM6-S ' + code + ' ' + libelle + ' → le rejeu = les lignes d\'origine (Banane, Yaourt tels quels ; Shake, Pain non complétés et nommés)',
        gestes.every(Boolean) && ec.length === 0 && erreurs.length === 0,
        (gestes.every(Boolean) ? '' : 'GESTE RATÉ ' + JSON.stringify(gestes) + ' · ') + court(ec) + (erreurs.length ? ' · erreurs JS : ' + erreurs.join(' | ') : ''));
      return { ajout, ecranAvant: e0, ecranApres: e1, gestes };
    } finally { await cx.close(); }
  };

  await scenario('S0', 'aucun geste avant le rejeu (écran vierge)', null);
  const s1 = await scenario('S1', 'Pâtes (CIQUAL) prises dans « Mes aliments » AVANT toute recherche, 5 g tapés, « Ajouter »', async (pg) =>
    (await ouvrirAjout(pg)) && (await prendre(pg, 'Pâtes (test)')) && (await taper(pg, '#af-bc-grams', 5)) && (await ajouter(pg)));
  AJ.A1 = s1.ajout;
  const s2 = await scenario('S2', 'Riz repris FIGÉ (sans pour-100 g), pastille « 200 g », « Ajouter »', async (pg) =>
    (await ouvrirAjout(pg)) && (await prendre(pg, 'Riz (test)')) && (await clic(pg, '#af-prop-pastille')) && (await ajouter(pg)));
  AJ.A2 = s2.ajout;
  const s2b = await scenario('S2b', 'Riz repris FIGÉ, 150 tapés, calories retouchées à 195, « Ajouter »', async (pg) =>
    (await ouvrirAjout(pg)) && (await prendre(pg, 'Riz (test)')) && (await taper(pg, '#af-prop', 150))
    && (await taper(pg, '#af-kcal', 195)) && (await quitter(pg, '#af-kcal')) && (await ajouter(pg)));
  AJ.A2b = s2b.ajout;
  const s3 = await scenario('S3', 'saisie à la main 300/4/40/14, portions ×2 « part » de 80 g, « Ajouter »', async (pg) =>
    (await ouvrirAjout(pg)) && (await saisieGateau(pg)) && (await ajouter(pg)));
  AJ.A3 = s3.ajout;
  const s4 = await scenario('S4', 'Barre SCANNÉE (énergie incohérente : trace de fiabilité à l\'écran), 50 g, « Ajouter »', async (pg) =>
    (await ouvrirAjout(pg)) && (await scannerBarre(pg)) && (await taper(pg, '#af-bc-grams', 50)) && (await ajouter(pg)));
  AJ.A4 = s4.ajout;
  await scenario('S5', 'Pâtes, 5 g tapés, puis « Annuler » (rien n\'est ajouté)', async (pg) =>
    (await ouvrirAjout(pg)) && (await prendre(pg, 'Pâtes (test)')) && (await taper(pg, '#af-bc-grams', 5)) && (await annuler(pg)));
  await scenario('S6', 'Riz repris FIGÉ, 150 tapés, puis « Annuler » (la reprise reste en mémoire)', async (pg) =>
    (await ouvrirAjout(pg)) && (await prendre(pg, 'Riz (test)')) && (await taper(pg, '#af-prop', 150)) && (await annuler(pg)));

  /* ⛔ AUCUNE REMISE À ZÉRO DE L'ÉCRAN PAR LE REJEU (décision de Michel, 21/10 : « ne pas introduire de remise à zéro
     générale de l'écran ») : ce que l'écran retenait avant le rejeu est intact après. Mesuré sur S1 (fiche chargée). */
  t('B-NM6-S ⑦ le rejeu ne touche pas à l\'écran d\'ajout : ce qu\'il retenait avant est intact après (aucune remise à zéro)',
    s1.gestes.every(Boolean) && s1.ecranAvant === s1.ecranApres && s1.ecranAvant.indexOf('"nutr":"Pâtes') > 0,
    'avant ' + s1.ecranAvant + ' · après ' + s1.ecranApres);

  console.log('\n═══ B-NM6-A. Les « Ajouter » depuis l\'écran lisent toujours l\'écran (rien n\'est « fermé par défaut ») ═══');
  for (const [k, lib, saisie] of [
    ['A1', '⭐ Pâtes CIQUAL reprises AVANT toute recherche : 5 g = 18 · 1 · 4 · 0 par LA FICHE (pas figées)', ['liste', 'reprise']],
    ['A2', 'Riz figé, pastille 200 g = 260 · 5 · 57 · 1 tels quels, sans pour-100 g, « reprise-non-verifiee »', ['liste', 'reprise']],
    ['A2b', 'Riz figé, 150 g et 195 kcal retouchées = la saisie de la personne, déclarée', ['liste', 'reprise']],
    ['A3', 'Gâteau 2 portions « part » de 80 g = 600 · 8 · 80 · 28, pour-100 g 375 · 5 · 50 · 17,5', ['manuel', 'utilisateur']],
    ['A4', 'Barre scannée 50 g = 64 · 10 · 3 · 2, avec la trace DERIVE_ESTIMABLE de l\'écran', ['code-tape', 'off']]]) {
    const l = AJ[k] || [], a = AJOUTS[k];
    const ec = l.length === 1 ? ecartsLigne(a.name, l[0], a, saisie) : [l.length + ' ligne(s) ajoutée(s) au lieu d\'une'];
    if (l.length === 1 && l[0].name !== a.name) ec.push('nom ' + l[0].name);
    t('B-NM6-A ' + k + ' ' + lib, ec.length === 0, court(ec));
  }

  console.log('\n═══ B-NM6-Q. L\'ajout rapide (le « + » de « Mes aliments ») reste exact ═══');
  {
    const { cx, pg, erreurs, ok } = await ouvrirPage(b, PORT);
    try {
      /* Q1 — l'écran porte la fiche des pâtes à 5 g (bloc grammes), puis « + » sur la banane */
      const L0 = await journal(pg);
      const g1 = ok && (await ouvrirAjout(pg)) && (await prendre(pg, 'Pâtes (test)')) && (await taper(pg, '#af-bc-grams', 5)) && (await ajoutRapide(pg, 'Banane (test)'));
      const n1 = nouvelles(L0, await journal(pg));
      const e1 = n1.length === 1 ? ecartsLigne('Banane (test)', n1[0], Object.assign({ fiab: null, m: 'd', note: 'reprise-non-verifiee' }, ATTENDU['Banane (test)']), ['liste', 'reprise']) : [n1.length + ' ligne(s)'];
      t('B-NM6-Q ① « + » sur la banane alors que l\'écran porte les pâtes à 5 g → la ligne = l\'aliment source, tel quel',
        g1 && e1.length === 0, (g1 ? '' : 'GESTE RATÉ · ') + court(e1));
      /* Q2 — l'écran porte le riz figé à 150 g, puis « + » sur le pain (sans quantité) : RIEN n'est écrit, l'écran
         s'ouvre sur le PAIN (ses valeurs), quantité VIDE — ni les 150 g du riz, ni une quantité inventée. */
      const L1 = await journal(pg);
      const g2 = (await ouvrirAjout(pg)) && (await prendre(pg, 'Riz (test)')) && (await taper(pg, '#af-prop', 150)) && (await ajoutRapide(pg, 'Pain (test)'));
      const n2 = nouvelles(L1, await journal(pg));
      /* 🥗 V2 (jalon 4, 22/10) — un aliment SANS quantité se reprend comme une saisie à la main pré-remplie : l'écran DEMANDE
         le poids (champ `af-poids`, présent et vide) ; plus de ligne de proposition (`af-prop`) ni de référence nommée.
         ⛔ Rien de la reprise FIGÉE du riz ne survit : ni sa référence, ni ses 150 g, dans aucun champ. */
      const ecr = await pg.evaluate(() => ({ nom: (document.getElementById('af-desc') || {}).value, kcal: (document.getElementById('af-kcal') || {}).value,
        poids: (document.getElementById('af-poids') || { value: 'ABSENT' }).value, prop: (document.getElementById('af-prop') || { value: '' }).value,
        fige: !!(typeof _afRef !== 'undefined' && _afRef && _afRef.fige), refNom: (typeof _afRef !== 'undefined' && _afRef && _afRef.nom) || null }));
      t('B-NM6-Q ② « + » sur le pain (sans quantité) alors que l\'écran porte le riz à 150 g → aucune ligne ; l\'écran s\'ouvre sur le pain, quantité VIDE',
        g2 && n2.length === 0 && ecr.nom === 'Pain (test)' && ecr.kcal === '250' && ecr.poids === '' && ecr.prop === ''
        && !ecr.fige && ecr.refNom !== 'Riz (test)' && erreurs.length === 0,
        (g2 ? '' : 'GESTE RATÉ · ') + JSON.stringify({ lignes: n2.length, ecr }) + (erreurs.length ? ' · erreurs JS : ' + erreurs.join(' | ') : ''));
    } finally { await cx.close(); }
  }

  console.log('\n═══ B-NM6-MQ. Le rejeu ne touche pas à la provenance de l\'écran, même en panne ═══');
  {
    const { cx, pg, ok } = await ouvrirPage(b, PORT);
    try {
      /* MQ2 — la provenance posée avant le rejeu est intacte après (R15) : le rejeu n'en pose aucune */
      await pg.evaluate(() => _afSetSrc({ saisie: 'sentinelle-m6', origine: 'test' }));
      const g1 = ok && (await rejouerPdj(pg));
      const apres = await pg.evaluate(() => (_afSrc && _afSrc.saisie) || null);
      t('B-NM6-MQ ② la provenance posée avant le rejeu est intacte après (le rejeu n\'en pose aucune)', g1 && apres === 'sentinelle-m6', 'après le rejeu : ' + apres);
    } finally { await cx.close(); }
  }
  {
    /* ⚠️ PAGE NEUVE, EXPRÈS : une fois le repas rejoué aujourd'hui, sa carte ne se rejoue plus pareil — le geste ne
       partirait pas, et le témoin rougirait sans que la panne ait eu lieu (mesuré au 1ᵉʳ jet, 21/10). */
    const { cx, pg, erreurs, ok } = await ouvrirPage(b, PORT);
    try {
      /* MQ3 — y compris quand un aliment lève une erreur au milieu du rejeu (panne injectée au 2ᵉ aliment ré-noté) */
      await pg.evaluate(() => {
        _afSetSrc({ saisie: 'sentinelle-m6', origine: 'test' });
        window.__m6n = 0; window.__m6id = _foodLineId;
        window._foodLineId = function () { if (++window.__m6n === 2) throw new Error('panne injectée M6'); return window.__m6id(); };
      });
      const n0 = (await journal(pg)).length;
      const g2 = ok && (await rejouerPdj(pg));
      const r2 = await pg.evaluate(() => { const s = (_afSrc && _afSrc.saisie) || null;
        window._foodLineId = window.__m6id; return { s, n: (S.foodLog || []).length }; });
      const vuePanne = erreurs.some((x) => /panne injectée M6/.test(x));
      t('B-NM6-MQ ③ ⭐ une erreur au milieu du rejeu laisse la provenance de l\'écran intacte',
        g2 && vuePanne && r2.s === 'sentinelle-m6', JSON.stringify(r2) + ' · geste ' + g2 + ' · panne vue : ' + vuePanne);
      console.log('  ℹ️ panne injectée au 2ᵉ aliment : ' + (r2.n - n0) + ' ligne(s) écrite(s) EN MÉMOIRE avant l\'erreur, non enregistrée(s) '
        + '(comportement d\'avant, inchangé — hors périmètre M6)');
    } finally { await cx.close(); }
  }
  {
    const { cx, pg, erreurs, ok } = await ouvrirPage(b, PORT);
    try {
      /* MQ4 — l'ajout rapide qui plante ne laisse aucune provenance à lui au geste suivant de l'écran */
      const g0 = ok && (await ouvrirAjout(pg));
      await pg.evaluate(() => { window.__m6id = _foodLineId; window._foodLineId = function () { throw new Error('panne injectée M6'); }; });
      const g1 = await ajoutRapide(pg, 'Banane (test)');
      const r1 = await pg.evaluate(() => { const r = { s: (_afSrc && _afSrc.saisie) || null };
        window._foodLineId = window.__m6id; return r; });
      t('B-NM6-MQ ④ un ajout rapide qui lève une erreur ne laisse aucune provenance posée',
        g0 && g1 && r1.s === null && erreurs.some((x) => /panne injectée M6/.test(x)), JSON.stringify(r1));
      const L0 = await journal(pg);
      const g2 = (await saisieGateau(pg)) && (await ajouter(pg));
      const n = nouvelles(L0, await journal(pg));
      const ec = n.length === 1 ? ecartsLigne(AJOUTS.A3.name, n[0], AJOUTS.A3, ['manuel', 'utilisateur']) : [n.length + ' ligne(s)'];
      t('B-NM6-MQ ⑤ ⭐ après cette panne, la saisie suivante à la main garde SES portions et SA provenance (rien n\'a fui de l\'ajout raté)',
        g2 && ec.length === 0, (g2 ? '' : 'GESTE RATÉ · ') + court(ec));
    } finally { await cx.close(); }
  }
  /* MQ1 — aucun champ d'écran n'atteint la donnée : aucune ligne du journal ENREGISTRÉ n'en porte, après un rejeu ET un
     ajout rapide (S0 à S6 le vérifient aussi ligne par ligne, via l'oracle). */
  {
    const { cx, pg, ok } = await ouvrirPage(b, PORT);
    try {
      const g = ok && (await rejouerPdj(pg)) && (await ouvrirAjout(pg)) && (await ajoutRapide(pg, 'Riz (test)'));
      const r = await pg.evaluate((CH) => { let L = []; try { L = JSON.parse(localStorage.getItem('ft4_foodlog') || '[]'); } catch (e) {}
        return { n: L.length, marques: L.filter((x) => x && CH.some((k) => Object.prototype.hasOwnProperty.call(x, k))).length }; }, CHAMPS_ECRAN);
      t('B-NM6-MQ ① aucune ligne ENREGISTRÉE ne porte un champ d\'écran (après un rejeu et un ajout rapide)',
        g && r.n === 13 && r.marques === 0, JSON.stringify(r));   /* 10 lignes d'origine + 2 rejouées + 1 ajout rapide */
    } finally { await cx.close(); }
  }
};

/* ── LE CLIQUET DE SOURCE (V2) — qui écrit le journal, et qui lit l'écran. Un futur écrivain doit se déclarer ici ;
   un écrivain hors écran qui se mettrait à lire l'écran fait rougir. ─────────────────────────────────────────── */
module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-NM6-C. Le cliquet (V2) : un seul écrivain, une seule porte qui lit l\'écran, le rejeu ne lit que la ligne ═══');
  const brut = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  /* commentaires neutralisés : les commentaires du pont citent `_provFood`, `_afSrc`, `document.` en toutes lettres */
  const A = brut.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:"'`])\/\/[^\n]*/gm, '$1');
  /* le corps d'une fonction, accolades équilibrées à partir de l'accolade ouvrante */
  const bloc = (i) => {
    let d = 0;
    for (let j = i; j < A.length; j++) {
      if (A[j] === '{') d++;
      else if (A[j] === '}') { d--; if (!d) return A.slice(i, j + 1); }
    }
    return '';
  };
  /* UN SEUL BALAYAGE : chaque fonction de premier niveau et son corps (le fichier fait près d'un mégaoctet) */
  const F = {};
  const re = /(?:^|\n)(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/g; let m;
  while ((m = re.exec(A))) { if (!(m[1] in F)) F[m[1]] = bloc(m.index + m[0].length - 1); }
  const corps = (n) => F[n] || '';
  const appelants = (fn) => Object.keys(F).filter((n) => n !== fn && new RegExp('\\b' + fn + '\\(').test(F[n])).sort();
  const NOMS = ['_n2Enregistrer', '_n2Reajouter', '_n2EntreeEcran', 'rejouerRepas', 'quickAddFood', 'addFoodEntry', 'saveEditFood'];
  t('B-NM6-C ⓪ les 7 fonctions sont trouvées dans le code (sinon aucun témoin ci-dessous ne vaut)',
    NOMS.every((n) => corps(n) !== ''), JSON.stringify(NOMS.map((n) => [n, corps(n).length])));
  /* ① L'ÉCRIVAIN UNIQUE : toute ligne du journal passe par `_n2Enregistrer` (le moteur la construit) */
  const ecr = appelants('_n2Enregistrer');
  t('B-NM6-C ① `_n2Enregistrer` a exactement 3 appelants : _n2Reajouter, addFoodEntry, saveEditFood (un 4ᵉ écrivain doit se déclarer ici)',
    JSON.stringify(ecr) === JSON.stringify(['_n2Reajouter', 'addFoodEntry', 'saveEditFood']), JSON.stringify(ecr));
  /* ② LES ÉCRIVAINS HORS ÉCRAN : le rejeu et l'ajout rapide, et eux seuls, re-notent par `_n2Reajouter`. ⭐ INCIDENT DU
     23/10 (D-111) : un 3ᵉ appelant, `_n2Apercu`, MONTRE la ligne que ces deux-là écriraient (une seule construction pour
     l'affichage et l'écriture — mesuré avant : 400 kcal affichées, 480 écrites) — et il n'écrit JAMAIS : il passe
     l'argument d'aperçu (un objet), et `_n2Reajouter` rend la ligne AVANT tout `_n2Enregistrer`. */
  const hors = appelants('_n2Reajouter');
  const RA2 = corps('_n2Reajouter'), AP = corps('_n2Apercu');
  const apObjet = /_n2Reajouter\([^;]*,\s*\{[^;]*\}\s*\)/.test(AP);
  const iAp = RA2.search(/if\s*\(\s*apercu\s*\)\s*return\b/), iEnr = RA2.indexOf('_n2Enregistrer(');
  t('B-NM6-C ② `_n2Reajouter` a exactement 3 appelants : _n2Apercu (l\'aperçu, qui ne peut pas écrire), quickAddFood, rejouerRepas',
    JSON.stringify(hors) === JSON.stringify(['_n2Apercu', 'quickAddFood', 'rejouerRepas']) && apObjet && iAp > 0 && iEnr > iAp,
    JSON.stringify({ hors: hors, apObjet: apObjet, iAp: iAp, iEnr: iEnr }));
  /* ③ LA SEULE PORTE QUI LIT L'ÉCRAN pour en faire une LIGNE DU JOURNAL : `_n2EntreeEcran`, appelée par « Ajouter ».
     24/10 (NV2-FIAB, D-134) : un 2ᵉ appelant DÉCLARÉ, `majFavoriDepuisEcran` (« ⭐ Corriger ce favori ») — un geste DE l'écran,
     qui le lit par construction pour en faire un FAVORI, et n'écrit JAMAIS le journal (ni `_n2Enregistrer`, ni `S.foodLog`).
     Un 3ᵉ appelant non déclaré, ou un journal écrit par la correction d'un favori, le font rougir (N20, N21). */
  const lit = appelants('_n2EntreeEcran'), MF = corps('majFavoriDepuisEcran') || '';
  const mfSansJournal = MF.length > 0 && MF.indexOf('_n2Enregistrer(') < 0 && !/S\.foodLog/.test(MF);
  t('B-NM6-C ③ `_n2EntreeEcran` (la lecture de l\'écran) a exactement 2 appelants : addFoodEntry (une ligne) et majFavoriDepuisEcran (un favori, qui n\'écrit jamais le journal)',
    JSON.stringify(lit) === JSON.stringify(['addFoodEntry', 'majFavoriDepuisEcran']) && mfSansJournal, JSON.stringify({ lit: lit, mfSansJournal: mfSansJournal }));
  /* ④ ⭐⭐ LE CŒUR DE M6 : `_n2Reajouter` ne lit RIEN de l'écran — ni le DOM, ni l'état de l'écran d'ajout, ni les
     fonctions qui le lisent — et sa provenance est écrite en dur (une reprise de la liste). */
  const RA = corps('_n2Reajouter');
  const ECRAN = ['document\\.', '_bcNutr', '_afRef', '_afSrc', '_afSetSrc', '_afUnite', '_afPortion', '_afFiab', '_bcQty', '_afCalc', '_afCorr',
    '_afValeursTapees', '_afProp', '_afPoids', '_afQte', '_n2Provenance', '_n2Extras', '_n2EntreeEcran', '_n2FicheBc', '_n2LireChamps', 'numFR\\('];
  const lus = ECRAN.filter((x) => new RegExp(x).test(RA));
  t('B-NM6-C ④ ⭐⭐ `_n2Reajouter` ne lit rien de l\'écran (DOM, état d\'ajout, lecteurs d\'écran) et pose une provenance « liste / reprise » écrite en dur',
    RA !== '' && lus.length === 0 && /origine:\s*\{\s*saisie:\s*'liste'\s*,\s*origine:\s*'reprise'\s*\}/.test(RA), JSON.stringify(lus));
  /* ⑤ le rejeu et l'ajout rapide n'écrivent pas eux-mêmes (ni `push`, ni `_n2Enregistrer` direct) */
  const RJ = corps('rejouerRepas'), QA = corps('quickAddFood');
  t('B-NM6-C ⑤ `rejouerRepas` et `quickAddFood` n\'écrivent pas eux-mêmes dans le journal (tout passe par `_n2Reajouter`)',
    RJ !== '' && QA !== '' && ![RJ, QA].some((c) => /foodLog\s*\.\s*(push|splice|unshift)|foodLog\s*\[[^\]]*\]\s*=|_n2Enregistrer\(/.test(c)), '');
  /* ⑥ le rejeu ne touche ni à la provenance de l'écran, ni à l'écran lui-même (décision de Michel : pas de remise à zéro) */
  t('B-NM6-C ⑥ `rejouerRepas` ne pose aucune provenance et ne remet pas l\'écran à zéro',
    RJ !== '' && !/_afSetSrc\(|_afOublierAliment\(|_afPropCacher\(|openAddFood\(/.test(RJ), '');
  /* ⑦ R30 — `_provFood` est RETIRÉ (raison écrite dans `app.js`) : il ne revient ni défini, ni appelé */
  t('B-NM6-C ⑦ `_provFood` reste retiré : ni défini, ni appelé (R30)', !/\b_provFood\s*\(/.test(A), '');
};
