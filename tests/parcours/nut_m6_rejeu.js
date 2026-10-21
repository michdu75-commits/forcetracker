/* ══════════════════════════════════════════════════════════════════════════════════════
   NUT-M6-REJEU-01 (21/10/2026, ordre de travail de Michel) — LE REJEU D'UN REPAS HABITUEL
   ET L'AJOUT RAPIDE NE LISENT PLUS L'ÉCRAN D'AJOUT.

   Le défaut M6 (mesuré le 20/10 sur ft-v1256, rejoué ici sur ft-v1257) : `rejouerRepas`
   (« Tes repas habituels ») passe par `_provFood`, qui lit l'état de l'écran d'ajout ; cet
   état survit à la fermeture de l'écran (« Annuler » ne remet rien à zéro), donc chaque
   aliment rejoué héritait de ce qui venait d'être choisi — par QUATRE lectures : le bloc
   grammes, l'ancre en grammes (un faux pour-100 g), la portion, la trace de fiabilité.

   ⭐ L'INVARIANT FIGÉ ICI (pas une implémentation) : une ligne rejouée est IDENTIQUE à
   l'aliment source — quantité, unité, pour-100 g, portion, provenance « reprise », 4 valeurs,
   aucune trace de fiabilité que la source n'a pas — QUEL QUE SOIT le dernier aliment affiché ;
   et un ajout fait DEPUIS l'écran continue de lire l'écran (rien n'est « fermé par défaut »).

   ⛔ PAR LE VRAI CHEMIN : vrais clics au pointeur (« À la main », « Mes aliments »,
   « Ajouter », « Annuler », le « + » de l'ajout rapide, la carte « Tes repas habituels » puis
   le moment). Données INVENTÉES « (test) », aucune identité. L'oracle compare à des valeurs
   écrites À LA MAIN ci-dessous — jamais à `_bcNutr` ni à `_provFood`.
   ⛔ FICHIER À PART (comme `journal_qty_guard.js`) : le contrôle négatif
   `tools/mut_nut_m6_rejeu.py` rejoue ces témoins en secondes ; la passe les appelle aussi.
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

/* ── LE JEU DE DONNÉES INVENTÉ — petit-déjeuner noté deux jours de suite (donc « habituel »),
   un dîner noté une fois (ses aliments sont dans « Mes aliments »). ─────────────────────── */
const PDJ = [
  { name: 'Banane (test)', kcal: 88, prot: 1, carbs: 20, fat: 0, q: 100, u: 'g', per100: { kcal: 88, prot: 1.1, carbs: 20, fat: 0.3 } },
  { name: 'Shake (test)', kcal: 156, prot: 26, carbs: 1, fat: 1, q: 1, u: 'portion', per100: null },
  { name: 'Pain (test)', kcal: 250, prot: 9, carbs: 48, fat: 2, q: null, u: null, per100: null },
  { name: 'Yaourt (test)', kcal: 75, prot: 5, carbs: 6, fat: 3, q: 125, u: 'g', per100: { kcal: 60, prot: 4, carbs: 4.8, fat: 2.4 } },
];
const DINER = [
  { name: 'Huile (test)', kcal: 90, prot: 0, carbs: 0, fat: 10, q: 10, u: 'g', per100: { kcal: 900, prot: 0, carbs: 0, fat: 100 } },
  { name: 'Riz (test)', kcal: 260, prot: 5, carbs: 57, fat: 1, q: 200, u: 'g', per100: null },
  /* pour-100 g INCOHÉRENT exprès (48 kcal annoncées, 127 par les macros) : c'est lui qui pose une trace de fiabilité */
  { name: 'Barre (test)', kcal: 24, prot: 10, carbs: 3, fat: 2, q: 50, u: 'g', per100: { kcal: 48, prot: 20, carbs: 5, fat: 3 } },
];
/* ⭐ CE QU'UNE LIGNE REJOUÉE DOIT PORTER — écrit à la main depuis le jeu de données, pas calculé par l'app. */
const ATTENDU = {
  'Banane (test)': { q: 100, u: 'g', per100: { kcal: 88, prot: 1.1, carbs: 20, fat: 0.3 }, kcal: 88, prot: 1, carbs: 20, fat: 0 },
  'Shake (test)': { q: 1, u: 'portion', per100: null, kcal: 156, prot: 26, carbs: 1, fat: 1 },
  'Pain (test)': { q: null, u: null, per100: null, kcal: 250, prot: 9, carbs: 48, fat: 2 },
  'Yaourt (test)': { q: 125, u: 'g', per100: { kcal: 60, prot: 4, carbs: 4.8, fat: 2.4 }, kcal: 75, prot: 5, carbs: 6, fat: 3 },
};
/* ⭐ LES 4 « AJOUTER » DEPUIS L'ÉCRAN — calculés à la main, identiques avant et après le correctif :
   Huile 5 g → 900 × 0,05 = 45 kcal, 100 × 0,05 = 5 g de lipides ;
   Riz repris à 200 g (sans pour-100 g) → pour-100 g dérivé 260/2 = 130 · 2,5 · 28,5 · 0,5 ;
   Gâteau 300/4/40/14 × 2 portions « part » de 80 g → 600/8/80/28, pour-100 g 600/160 = 375 · 5 · 50 · 17,5 ;
   Barre 50 g → 48 × 0,5 = 24 · 10 · 2,5 → 3 · 1,5 → 2, avec la trace de fiabilité NON_RESOLU. */
const AJOUTS = {
  A1: { name: 'Huile (test)', q: 5, u: 'g', per100: { kcal: 900, prot: 0, carbs: 0, fat: 100 }, kcal: 45, prot: 0, carbs: 0, fat: 5, fiab: null },
  A2: { name: 'Riz (test)', q: 200, u: 'g', per100: { kcal: 130, prot: 2.5, carbs: 28.5, fat: 0.5 }, kcal: 260, prot: 5, carbs: 57, fat: 1, fiab: null },
  A3: { name: 'Gâteau maison (test)', q: 2, u: 'portion', portionLabel: 'part', portionWeightG: 80,
        per100: { kcal: 375, prot: 5, carbs: 50, fat: 17.5 }, kcal: 600, prot: 8, carbs: 80, fat: 28, fiab: null },
  A4: { name: 'Barre (test)', q: 50, u: 'g', per100: { kcal: 48, prot: 20, carbs: 5, fat: 3 }, kcal: 24, prot: 10, carbs: 3, fat: 2, fiab: 'NON_RESOLU' },
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
  await pg.addInitScript(fixture());
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1500);
  await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); });
  const g1 = await clic(pg, '#nb-nutrition'); await pg.waitForTimeout(400);
  const g2 = await clic(pg, '#ntab-journal'); await pg.waitForTimeout(250);
  return { cx, pg, erreurs, ok: g1 && g2 };
}
async function ouvrirAjout(pg) { const ok = await clic(pg, 'button[onclick="addFoodVia(\'main\')"]'); await pg.waitForTimeout(300); return ok; }
async function indexListe(pg, nom) { return pg.evaluate((n) => (typeof _afQuickItems !== 'undefined' && _afQuickItems || []).findIndex((x) => x && x.name === n), nom); }
async function prendre(pg, nom) {
  const i = await indexListe(pg, nom); if (i < 0) return false;
  const ok = await clic(pg, '#af-quick-list div[onclick="quickFillFood(' + i + ')"]'); await pg.waitForTimeout(250); return ok;
}
async function ajoutRapide(pg, nom) {
  const i = await indexListe(pg, nom); if (i < 0) return false;
  const ok = await clic(pg, '#af-quick-list button[onclick="quickAddFood(' + i + ')"]'); await pg.waitForTimeout(300); return ok;
}
async function taper(pg, sel, v) { try { await pg.fill(sel, String(v)); await pg.waitForTimeout(120); return true; } catch (e) { return false; } }
async function ajouter(pg) { const ok = await clic(pg, 'button[onclick="addFoodEntry()"]'); await pg.waitForTimeout(300); return ok; }
async function annuler(pg) { const ok = await clic(pg, '#ov-add-food button[onclick="closeAddFood()"]'); await pg.waitForTimeout(200); return ok; }
async function saisieGateau(pg) {
  const r = [await taper(pg, '#af-desc', 'Gâteau maison (test)')];
  for (const [id, v] of [['#af-kcal', '300'], ['#af-prot', '4'], ['#af-carbs', '40'], ['#af-fat', '14']]) r.push(await taper(pg, id, v));
  try { await pg.locator('#af-fat').blur(); } catch (e) { r.push(false); }   /* le clavier se ferme : le « change » part avant le tap sur ×2 */
  await pg.waitForTimeout(200);
  r.push(await clic(pg, 'button[onclick="_afApplyPortion(2)"]')); await pg.waitForTimeout(100);
  r.push(await clic(pg, 'button[onclick="_afPortionNom(\'part\')"]')); await pg.waitForTimeout(100);
  r.push(await taper(pg, '#af-ppoids', '80'));
  return r.every(Boolean);
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
  await pg.waitForTimeout(300);
  return ok;
}
const journal = (pg) => pg.evaluate(() => JSON.parse(JSON.stringify(S.foodLog || [])));
const nouvelles = (avant, apres) => { const ids = new Set(avant.map((x) => x.id)); return apres.filter((x) => !ids.has(x.id)); };
/* ce que l'écran d'ajout retient — pour prouver que le rejeu n'y touche PAS (aucune remise à zéro) */
const ecranEtat = (pg) => pg.evaluate(() => JSON.stringify({
  bc: (document.getElementById('af-bc-row') || { style: {} }).style.display, g: (document.getElementById('af-bc-grams') || {}).value,
  nutr: (typeof _bcNutr !== 'undefined' && _bcNutr) ? _bcNutr.name || '?' : null, pose: (typeof _bcQtyPose !== 'undefined') ? _bcQtyPose : null,
  ref: (typeof _afRef !== 'undefined' && _afRef) ? [_afRef.q, _afRef.u] : null, prop: (document.getElementById('af-prop') || {}).value || null,
  unite: (typeof _afUnite !== 'undefined') ? _afUnite : null, ppose: (typeof _afPortionPose !== 'undefined') ? _afPortionPose : null,
  nport: (typeof _afPortions !== 'undefined') ? _afPortions : null }));

/* ── L'ORACLE — une ligne comparée à ce qu'elle doit porter, champ par champ ─────────────────────── */
const nul = (v) => v === undefined || v === null;
const memeP100 = (x, a) => (nul(a) ? nul(x) : (!nul(x) && ['kcal', 'prot', 'carbs', 'fat'].every((k) => x[k] === a[k])));
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
  if ('ecran' in x) e.push(nom + ' porte le marqueur « ecran » (il ne doit jamais atteindre la donnée)');
  return e;
}
function ecartsRejeu(lignes, jour) {
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
    e.push(...ecartsLigne(nom, x, Object.assign({ fiab: null }, ATTENDU[nom]), ['liste', 'reprise']));
  }
  return e;
}
const court = (e) => e.slice(0, 6).join(' · ') + (e.length > 6 ? ' · … (' + e.length + ' écarts)' : '');

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-NM6-S. NUT-M6-REJEU-01 — le rejeu d\'un repas habituel ne lit plus l\'écran d\'ajout ═══');

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
      const e1 = await ecranEtat(pg);
      const L2 = await journal(pg);
      const ec = ecartsRejeu(nouvelles(L1, L2), await jourDe(pg));
      t('B-NM6-S ' + code + ' ' + libelle + ' → les 4 lignes rejouées = l\'aliment source (quantité, unité, pour-100 g, portion, fiabilité, 4 valeurs)',
        gestes.every(Boolean) && ec.length === 0 && erreurs.length === 0,
        (gestes.every(Boolean) ? '' : 'GESTE RATÉ ' + JSON.stringify(gestes) + ' · ') + court(ec) + (erreurs.length ? ' · erreurs JS : ' + erreurs.join(' | ') : ''));
      return { ajout, ecranAvant: e0, ecranApres: e1, gestes };
    } finally { await cx.close(); }
  };

  await scenario('S0', 'aucun geste avant le rejeu (écran vierge)', null);
  const s1 = await scenario('S1', 'Huile prise dans « Mes aliments », 5 g tapés, « Ajouter »', async (pg) =>
    (await ouvrirAjout(pg)) && (await prendre(pg, 'Huile (test)')) && (await taper(pg, '#af-bc-grams', 5)) && (await ajouter(pg)));
  AJ.A1 = s1.ajout;
  const s2 = await scenario('S2', 'Riz repris à 200 g (sans pour-100 g), « Ajouter »', async (pg) =>
    (await ouvrirAjout(pg)) && (await prendre(pg, 'Riz (test)')) && (await ajouter(pg)));
  AJ.A2 = s2.ajout;
  await scenario('S2b', 'Riz repris, 150 tapés dans « Quantité », « Ajouter »', async (pg) =>
    (await ouvrirAjout(pg)) && (await prendre(pg, 'Riz (test)')) && (await taper(pg, '#af-prop', 150)) && (await ajouter(pg)));
  const s3 = await scenario('S3', 'saisie à la main 300/4/40/14, ×2, « part », 80 g, « Ajouter »', async (pg) =>
    (await ouvrirAjout(pg)) && (await saisieGateau(pg)) && (await ajouter(pg)));
  AJ.A3 = s3.ajout;
  const s4 = await scenario('S4', 'Barre au pour-100 g incohérent, 50 g, « Ajouter »', async (pg) =>
    (await ouvrirAjout(pg)) && (await prendre(pg, 'Barre (test)')) && (await taper(pg, '#af-bc-grams', 50)) && (await ajouter(pg)));
  AJ.A4 = s4.ajout;
  await scenario('S5', 'Huile, 5 g tapés, puis « Annuler » (rien n\'est ajouté)', async (pg) =>
    (await ouvrirAjout(pg)) && (await prendre(pg, 'Huile (test)')) && (await taper(pg, '#af-bc-grams', 5)) && (await annuler(pg)));
  const s6 = await scenario('S6', 'comme S1, puis l\'écran rouvert et refermé (témoin : l\'ouverture remet déjà à zéro)', async (pg) =>
    (await ouvrirAjout(pg)) && (await prendre(pg, 'Huile (test)')) && (await taper(pg, '#af-bc-grams', 5)) && (await ajouter(pg))
    && (await ouvrirAjout(pg)) && (await annuler(pg)));

  /* ⛔ AUCUNE REMISE À ZÉRO DE L'ÉCRAN PAR LE REJEU (décision de Michel, 21/10 : « ne pas introduire de remise à zéro
     générale de l'écran ») : ce que l'écran retenait avant le rejeu est intact après. Mesuré sur S1 (écran chargé). */
  t('B-NM6-S ⑦ le rejeu ne touche pas à l\'écran d\'ajout : ce qu\'il retenait avant est intact après (aucune remise à zéro)',
    s1.gestes.every(Boolean) && s1.ecranAvant === s1.ecranApres && s1.ecranAvant.indexOf('"nutr":"Huile') > 0,
    'avant ' + s1.ecranAvant + ' · après ' + s1.ecranApres);
  void s6;

  console.log('\n═══ B-NM6-A. Les 4 « Ajouter » depuis l\'écran ne changent pas (l\'écran est toujours lu) ═══');
  for (const [k, lib] of [['A1', 'Huile 5 g = 45 kcal, pour-100 g 900'], ['A2', 'Riz repris à 200 g, pour-100 g dérivé 130 / 2,5 / 28,5 / 0,5'],
    ['A3', 'Gâteau 2 portions « part » de 80 g = 600/8/80/28, pour-100 g 375 / 5 / 50 / 17,5'], ['A4', 'Barre 50 g = 24/10/3/2 avec la trace NON_RESOLU']]) {
    const l = AJ[k] || [], a = AJOUTS[k];
    const ec = l.length === 1 ? ecartsLigne(a.name, l[0], a, null) : [l.length + ' ligne(s) ajoutée(s) au lieu d\'une'];
    if (l.length === 1 && l[0].name !== a.name) ec.push('nom ' + l[0].name);
    t('B-NM6-A ' + k + ' ' + lib, ec.length === 0, court(ec));
  }

  console.log('\n═══ B-NM6-Q. L\'ajout rapide (le « + » de « Mes aliments ») reste exact ═══');
  {
    const { cx, pg, erreurs, ok } = await ouvrirPage(b, PORT);
    try {
      /* Q1 — l'écran porte l'ancre du riz (200 g, sans pour-100 g), puis « + » sur le pain (sans quantité) */
      const L0 = await journal(pg);
      const g1 = ok && (await ouvrirAjout(pg)) && (await prendre(pg, 'Riz (test)')) && (await ajoutRapide(pg, 'Pain (test)'));
      const n1 = nouvelles(L0, await journal(pg));
      const e1 = n1.length === 1 ? ecartsLigne('Pain (test)', n1[0], Object.assign({ fiab: null }, ATTENDU['Pain (test)']), ['liste', 'reprise']) : [n1.length + ' ligne(s)'];
      t('B-NM6-Q ① « + » sur un aliment sans quantité alors que l\'écran porte l\'ancre du riz → la ligne = l\'aliment source',
        g1 && e1.length === 0, (g1 ? '' : 'GESTE RATÉ · ') + court(e1));
      /* Q2 — l'écran porte l'huile à 5 g (bloc grammes), puis « + » sur le shake (1 portion) */
      const L1 = await journal(pg);
      const g2 = (await ouvrirAjout(pg)) && (await prendre(pg, 'Huile (test)')) && (await taper(pg, '#af-bc-grams', 5)) && (await ajoutRapide(pg, 'Shake (test)'));
      const n2 = nouvelles(L1, await journal(pg));
      const e2 = n2.length === 1 ? ecartsLigne('Shake (test)', n2[0], Object.assign({ fiab: null }, ATTENDU['Shake (test)']), ['liste', 'reprise']) : [n2.length + ' ligne(s)'];
      t('B-NM6-Q ② « + » sur le shake alors que l\'écran porte l\'huile à 5 g → la ligne = l\'aliment source',
        g2 && e2.length === 0 && erreurs.length === 0, (g2 ? '' : 'GESTE RATÉ · ') + court(e2) + (erreurs.length ? ' · erreurs JS : ' + erreurs.join(' | ') : ''));
    } finally { await cx.close(); }
  }

  console.log('\n═══ B-NM6-MQ. Le marqueur « ecran:false » : jamais dans la donnée, toujours rendu ═══');
  {
    const { cx, pg, erreurs, ok } = await ouvrirPage(b, PORT);
    try {
      /* MQ2 — la provenance d'avant est rendue après le rejeu (R15) */
      await pg.evaluate(() => _afSetSrc({ saisie: 'sentinelle-m6', origine: 'test' }));
      const g1 = ok && (await rejouerPdj(pg));
      const apres = await pg.evaluate(() => (_afSrc && _afSrc.saisie) || null);
      t('B-NM6-MQ ② la provenance posée avant le rejeu est rendue après (R15)', g1 && apres === 'sentinelle-m6', 'après le rejeu : ' + apres);
    } finally { await cx.close(); }
  }
  {
    /* ⚠️ PAGE NEUVE, EXPRÈS : une fois le repas rejoué aujourd'hui, sa carte ne se rejoue plus pareil — le geste ne
       partirait pas, et le témoin rougirait sans que la panne ait eu lieu (mesuré au 1ᵉʳ jet). */
    const { cx, pg, erreurs, ok } = await ouvrirPage(b, PORT);
    try {
      /* MQ3 — y compris quand un aliment lève une erreur au milieu du rejeu (panne injectée au 2ᵉ aliment) */
      await pg.evaluate(() => {
        _afSetSrc({ saisie: 'sentinelle-m6', origine: 'test' });
        window.__m6n = 0; window.__m6id = _foodLineId;
        window._foodLineId = function () { if (++window.__m6n === 2) throw new Error('panne injectée M6'); return window.__m6id(); };
      });
      const n0 = (await journal(pg)).length;
      const g2 = ok && (await rejouerPdj(pg));
      const r2 = await pg.evaluate(() => { const s = (_afSrc && _afSrc.saisie) || null, e = !!(_afSrc && _afSrc.ecran === false);
        window._foodLineId = window.__m6id; return { s, e, n: (S.foodLog || []).length }; });
      const vuePanne = erreurs.some((x) => /panne injectée M6/.test(x));
      t('B-NM6-MQ ③ ⭐ une erreur au milieu du rejeu rend quand même la provenance d\'avant (aucun marqueur laissé posé)',
        g2 && vuePanne && r2.s === 'sentinelle-m6' && !r2.e, JSON.stringify(r2) + ' · geste ' + g2 + ' · panne vue : ' + vuePanne);
      console.log('  ℹ️ panne injectée au 2ᵉ aliment : ' + (r2.n - n0) + ' ligne(s) écrite(s) EN MÉMOIRE avant l\'erreur, non enregistrée(s) '
        + '(comportement d\'avant, inchangé — hors périmètre M6)');
    } finally { await cx.close(); }
  }
  {
    const { cx, pg, erreurs, ok } = await ouvrirPage(b, PORT);
    try {
      /* MQ4 — l'ajout rapide qui plante ne laisse pas sa provenance (ni le marqueur) au geste suivant de l'écran.
         ⛔ C'EST LE RISQUE PROPRE AU MARQUEUR : resté posé, il ferait ignorer l'écran au prochain « Ajouter ». */
      const g0 = ok && (await ouvrirAjout(pg));
      await pg.evaluate(() => { window.__m6id = _foodLineId; window._foodLineId = function () { throw new Error('panne injectée M6'); }; });
      const g1 = await ajoutRapide(pg, 'Pain (test)');
      const r1 = await pg.evaluate(() => { const r = { s: (_afSrc && _afSrc.saisie) || null, e: !!(_afSrc && _afSrc.ecran === false) };
        window._foodLineId = window.__m6id; return r; });
      t('B-NM6-MQ ④ un ajout rapide qui lève une erreur ne laisse pas le marqueur posé',
        g0 && g1 && !r1.e && erreurs.some((x) => /panne injectée M6/.test(x)), JSON.stringify(r1));
      const L0 = await journal(pg);
      const g2 = (await saisieGateau(pg)) && (await ajouter(pg));
      const n = nouvelles(L0, await journal(pg));
      const ec = n.length === 1 ? ecartsLigne(AJOUTS.A3.name, n[0], AJOUTS.A3, ['manuel', 'utilisateur']) : [n.length + ' ligne(s)'];
      t('B-NM6-MQ ⑤ ⭐ après cette panne, la saisie suivante à la main garde SES portions et SA provenance (rien n\'a fui de l\'ajout raté)',
        g2 && ec.length === 0, (g2 ? '' : 'GESTE RATÉ · ') + court(ec));
    } finally { await cx.close(); }
  }
  /* MQ1 — le marqueur n'atteint jamais la donnée : aucune ligne du journal enregistré ne porte « ecran » (S0 à S6 ci-dessus
     le vérifient ligne par ligne via l'oracle ; ici, le stockage lui-même, après un rejeu ET un ajout rapide). */
  {
    const { cx, pg, ok } = await ouvrirPage(b, PORT);
    try {
      const g = ok && (await rejouerPdj(pg)) && (await ouvrirAjout(pg)) && (await ajoutRapide(pg, 'Pain (test)'));
      const r = await pg.evaluate(() => { let L = []; try { L = JSON.parse(localStorage.getItem('ft4_foodlog') || '[]'); } catch (e) {}
        return { n: L.length, marques: L.filter((x) => x && Object.prototype.hasOwnProperty.call(x, 'ecran')).length }; });
      t('B-NM6-MQ ① aucune ligne ENREGISTRÉE ne porte le marqueur « ecran » (après un rejeu et un ajout rapide)',
        g && r.n >= 12 && r.marques === 0, JSON.stringify(r));
    } finally { await cx.close(); }
  }
};

/* ── LE CLIQUET DE SOURCE — ce que le marqueur laisse ouvert à l'exécution (un futur écrivain qui l'oublierait relirait
   l'écran) est fermé au moment des tests. Prototype éprouvé le 20/10 (9 mutations sur 9), porté ici. ─────────────── */
module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-NM6-C. Le cliquet : tout écrivain hors écran porte « ecran:false », les 4 lectures de l\'écran sont gardées ═══');
  const brut = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  /* commentaires neutralisés : le commentaire du correctif cite le marqueur en toutes lettres */
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
  const P = corps('_provFood'), RJ = corps('rejouerRepas'), QA = corps('quickAddFood'), AF = corps('addFoodEntry');
  t('B-NM6-C ⓪ les 4 fonctions sont trouvées dans le code (sinon aucun témoin ci-dessous ne vaut)',
    P !== '' && RJ !== '' && QA !== '' && AF !== '', JSON.stringify({ _provFood: P.length, rejouerRepas: RJ.length, quickAddFood: QA.length, addFoodEntry: AF.length }));
  /* ① LES APPELANTS : toute fonction de premier niveau dont le corps appelle `_provFood(` */
  const appelants = Object.keys(F).filter((n) => n !== '_provFood' && /\b_provFood\(/.test(F[n])).sort();
  t('B-NM6-C ① `_provFood` a exactement 3 appelants : addFoodEntry, quickAddFood, rejouerRepas (un 4ᵉ écrivain doit se déclarer ici)',
    JSON.stringify(appelants) === JSON.stringify(['addFoodEntry', 'quickAddFood', 'rejouerRepas']), JSON.stringify(appelants));
  /* ②③ les deux écrivains hors écran posent le marqueur dans la provenance qui PRÉCÈDE l'appel */
  const avant = (c) => { const i = c.indexOf('_provFood('); const av = i >= 0 ? c.slice(0, i) : ''; const s = av.match(/_afSetSrc\(\s*Object\.assign\(\s*\{[^}]*\}/g); return s ? s[s.length - 1] : ''; };
  t('B-NM6-C ② `rejouerRepas` pose `ecran:false` dans la provenance posée juste avant `_provFood`',
    RJ !== '' && /ecran\s*:\s*false/.test(avant(RJ)), avant(RJ).slice(0, 120));
  t('B-NM6-C ③ `quickAddFood` pose `ecran:false` dans la provenance posée juste avant `_provFood`',
    QA !== '' && /ecran\s*:\s*false/.test(avant(QA)), avant(QA).slice(0, 120));
  t('B-NM6-C ④ `addFoodEntry` ne pose PAS le marqueur : l\'ajout depuis l\'écran lit l\'écran (rien n\'est « fermé par défaut »)',
    AF !== '' && /_provFood\(/.test(AF) && !/ecran\s*:\s*false/.test(AF), '');
  t('B-NM6-C ⑤ `_provFood` lit le marqueur `_afSrc.ecran===false` et ne le recopie jamais dans la ligne',
    P !== '' && /_afSrc\.ecran\s*===\s*false/.test(P) && !/\bp\.ecran\b|\becran\s*:/.test(P), '');
  for (const [k, nom, motif] of [['⑥', 'bloc grammes', /ecran\s*&&\s*row\s*&&/], ['⑦', 'ancre en grammes (pour-100 g dérivé)', /ecran\s*&&\s*!p\.per100/],
    ['⑧', 'portions', /ecran\s*&&\s*!p\.q\s*&&\s*_afPortionPose/], ['⑨', 'trace de fiabilité', /ecran\s*&&\s*_z\s*&&/]]) {
    t('B-NM6-C ' + k + ' la lecture « ' + nom + ' » de l\'écran est gardée par le marqueur', P !== '' && motif.test(P), '');
  }
  /* ⑩⑪ la provenance est rendue dans un `finally` : une erreur au milieu ne laisse pas le marqueur posé */
  t('B-NM6-C ⑩ `rejouerRepas` rend la provenance d\'avant dans un `finally`',
    RJ !== '' && /finally\s*\{[^}]*_afSetSrc\(\s*av\s*\)/.test(RJ), '');
  t('B-NM6-C ⑪ `quickAddFood` efface sa provenance dans un `finally`',
    QA !== '' && /finally\s*\{[^}]*_afSetSrc\(\s*null\s*\)/.test(QA), '');
};
