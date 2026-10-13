/* ══════════════════════════════════════════════════════════════════════════════════════
   🍽️ NUT-LOT-B — LA REQUÊTE DIT L'ALIMENT, PAS LA QUANTITÉ
   (13/10/2026, session-B, mission de Michel issue de l'audit de nuit du 12/10) — blocs B-LB-I (l'instantané : ce qui ne
   doit PAS bouger), B-LB-E (la VRAIE FRAPPE, en ligne et hors ligne, journal amorcé), B-LB-C (les compléments, par leur
   propre champ).

   ⚖️ LA RÈGLE (D2, brief de Michel) : *une quantité tapée sert UNIQUEMENT à retrouver l'aliment* — « riz 100g » trouve le
   riz de « riz ». Elle ne pré-remplit rien (le champ quantité reste une saisie séparée, garde LOT-C). Même chose pour un
   point final de saisie (« riz. ») et un compte en tête (« 2 oeufs »).
   ⛔ MAIS RIEN DE CE QUI MARCHAIT NE DOIT BOUGER : les 632 clés d'alias tapées sans quantité gardent leur tête (B1) ; les
   NOMS de la base gardent leur découpage (B2 : « Mimolette 12 mois », « Crème 12 à 25% MG », « Coca-Cola 500 ml ») ; un
   TAUX reste un taux (« fromage blanc 20% » ne rend toujours rien) ; « coca 0 » vaut « coca zéro » et ne réintroduit pas
   le cola sucré (D-070) — parce que la TABLE connaît « coca zéro » ; « lait 0 » et « yaourt 0 », qu'elle ne connaît pas,
   gardent la tête de la base (brief §8 : « 0 » n'est pas automatiquement « 0 % »).

   ⭐ CE QUI EST CONDUIT : le vrai champ `#af-desc` (harnais de FS-05B, `food_multisource.js`, réutilisé — R2) et le vrai
   champ `#compl-desc`. ⭐ CE QUI EST OBSERVÉ : le HTML rendu (sections CIQUAL, fast-food, « Déjà noté par toi »,
   compléments) ; et, en page, `_aliasCible` et `_fsTete` comparés à l'instantané de la base (`food_lot_b_instantane.json`,
   généré sur `205cd17b` par `tools/instantane_food_lot_b.js`).
   ⛔ CE QUI N'EST PAS COUVERT : Open Food Facts (jamais appelé pour de vrai) ; le pré-remplissage de la quantité
   (hors lot, D2) ; « coca light », la crème fraîche, les taux en fourchette (dettes séparées). ⚠️ DETTE NOMMÉE et figée
   (LB-D02) : « coca 0 » hors ligne SANS table d'alias reste « coca » (décision de Michel s'il faut lire 0 = zéro partout).
   Contrôle négatif : `tools/mut_nut_lot_b.py`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const fs = require('fs'), path = require('path');
const MS = require('./food_multisource.js');
const INST = JSON.parse(fs.readFileSync(path.join(__dirname, 'food_lot_b_instantane.json'), 'utf8'));

/* Un journal personnel FICTIF pour « Déjà noté par toi » — aucun compte réel. */
const JOURNAL = [
  { id: 'lbj1', name: 'Riz blanc, cuit, sans sel ajouté', kcal: 155, prot: 3, carbs: 34, fat: 0, ts: 1790000100000, date: '2026-10-09', meal: 'dej', grams: 150 },
  { id: 'lbj2', name: 'Whey Native Vanille (Myprotein)', kcal: 114, prot: 24, carbs: 2, fat: 1, ts: 1790000200000, date: '2026-10-09', meal: 'coll', grams: 30 },
  { id: 'lbj3', name: 'Banane, chair sans peau, crue', kcal: 90, prot: 1, carbs: 20, fat: 0, ts: 1790000300000, date: '2026-10-10', meal: 'pdj', grams: 120 },
];
MS.CTX['lotb-journal'] = { alias: true, off: true, marques: true, ciqual: true, journal: JOURNAL };

/* Chaque cas : `q` et, s'il y en a, `ref` — la requête SANS quantité dont il doit rendre la MÊME liste (« ≈ » au sens du
   brief : même intention, ici mesurée au plus strict, ligne pour ligne). `src` = la section comparée. */
const C = (id, q, ctx, o) => Object.assign({ id, q, ctx, sources: ['CIQ'], cat: 'lotb', kind: 'lotb' }, o);
const CAS = [
  /* ── A. QUANTITÉS ── */
  C('LB-A01', 'riz 100g', 'en', { ref: 'riz', raison: 'nombre + unité collés : le riz de « riz »' }),
  C('LB-A02', 'riz 100g', 'hors', { ref: 'riz', raison: 'idem hors ligne' }),
  C('LB-A03', 'riz 100 g', 'en', { ref: 'riz', raison: 'unité SÉPARÉE du nombre' }),
  C('LB-A04', 'poulet 200g', 'en', { ref: 'poulet', src: ['CIQ', 'FF'], raison: 'CIQUAL ET fast-food : la quantité n\'empêche plus de trouver' }),
  C('LB-A05', 'poulet 200g', 'hors', { ref: 'poulet', src: ['CIQ', 'FF'], raison: 'idem hors ligne (ordre D-042 compris)' }),
  C('LB-A06', 'lait 250ml', 'en', { ref: 'lait', raison: 'millilitres collés' }),
  C('LB-A07', 'lait 250 ml', 'hors', { ref: 'lait', raison: 'millilitres séparés, hors ligne' }),
  C('LB-A08', 'riz cuit 150 g', 'en', { ref: 'riz cuit', raison: 'forme ET quantité : la forme reste, la quantité part' }),
  C('LB-A09', '30g de whey', 'lotb-journal', { ref: 'whey', src: ['LOC'], raison: 'son journal : « 30g de » ne cache plus sa whey' }),
  C('LB-A10', 'riz 100g', 'lotb-journal', { ref: 'riz', src: ['LOC', 'CIQ'], raison: 'journal ET CIQUAL, avec la quantité' }),
  /* ── B. ALIAS (la partie alimentaire de la requête) ── */
  C('LB-B01', 'eau 1,5 l', 'en', { ref: 'eau', top: '^Eau du robinet', raison: 'l\'alias « eau » s\'applique malgré « 1,5 l »' }),
  C('LB-B02', '2 oeufs', 'en', { ref: 'oeufs', top: '^Oeuf cru', raison: 'un COMPTE en tête : l\'alias « oeufs », plus le dessert' }),
  C('LB-B03', '12 oeufs', 'en', { ref: 'oeufs', raison: 'un compte à deux chiffres' }),
  C('LB-B04', 'riz 100g', 'en', { top: '^Riz blanc, cuit', raison: 'l\'alias « riz » en tête' }),
  C('LB-B05', 'gruyère 30g', 'en', { ref: 'gruyère', top: '^Gruyère', raison: 'LOT-A non contourné : l\'alias corrigé s\'applique' }),
  C('LB-B06', 'confiture 20 g', 'en', { ref: 'confiture', top: '^Confiture ou marmelade, tout type de fruits', raison: 'LOT-A : la confiture générique en tête, jamais la confiture de lait' }),
  /* ── D. ZÉRO (D-070 : « coca zéro » n'a jamais le cola SUCRÉ) ── */
  C('LB-D01', 'coca 0', 'en', { ref: 'coca zéro', src: ['CIQ', 'FF'], top: '^Cola, sans sucres ajoutés', jamais: 'Cola, sucré', raison: '« 0 » = zéro : le cola sans sucres, jamais un sucré' }),
  /* ⚠️ DETTE NOMMÉE (figée, pas cachée) : hors ligne SANS table d'alias, rien ne dit que « coca 0 » veut dire « zéro » — le
     « 0 » reste ignoré comme sur la base. Le lire « zéro » partout changerait aussi « lait 0 » et « yaourt 0 » (brief §8) :
     c'est une décision de Michel, pas un correctif. Le jour où elle change, ce témoin DOIT rougir. */
  C('LB-D02', 'coca 0', 'hors', { ref: 'coca', topRef: true, raison: 'DETTE : hors ligne sans table, le « 0 » reste ignoré (= « coca »)' }),
  C('LB-D03', 'coca 0%', 'en', { ref: 'coca zéro', top: '^Cola, sans sucres ajoutés', jamais: 'Cola, sucré', raison: 'non vide, sans sucré' }),
  /* ⚠️ DETTE (D-075 ②, Michel) : hors ligne sans table, « coca 0% » reste vide comme sur la base — le corriger passera par
     la disponibilité hors ligne de l'alias Coca, jamais par une lecture générale « X 0% » = « X zéro » (D-075 ③). */
  C('LB-D04', 'coca 0%', 'hors', { vide: true, raison: 'DETTE D-075 ② : hors ligne sans table, vide comme sur la base' }),
  C('LB-D05', 'coca zéro', 'en', { top: '^Cola, sans sucres ajoutés', jamais: 'Cola, sucré', raison: 'D-070 tient' }),
  C('LB-D06', 'fromage blanc 0', 'en', { top: '^Fromage blanc, nature, 0% MG', compat: '(^|[^0-9,-])0% MG', incompat: '2-3% MG|7-8% MG', raison: 'la variante réellement 0 %, aucun 2-3 % au-dessus' }),
  C('LB-D07', 'fromage blanc 0%', 'en', { top: '^Fromage blanc, nature, 0% MG', compat: '(^|[^0-9,-])0% MG', incompat: '2-3% MG|7-8% MG', raison: 'inchangé' }),
  /* §8 — « 0 » n'est pas automatiquement « 0 % » : « yaourt 0 » garde la tête de la BASE (`205cd17b`, mesurée avant le code).
     D-075 ① (Michel, 13/10) : « lait 0 » et « lait 0% » = le LAIT ÉCRÉMÉ, par la table d'alias de la famille lait — le reste
     de la liste est celui de la base (aucun lait entier, demi-écrémé ou 1,2 % sous « lait 0% »). Hors ligne SANS table, la
     tête de la base reste : même dette que « coca 0 » (D-075 ②). */
  C('LB-D08', 'yaourt 0', 'en', { top: '^Yaourt à la grecque nature$', raison: '§8 : tête de la base gardée' }),
  C('LB-D09', 'lait 0', 'en', { top: '^Lait écrémé, UHT$', raison: 'D-075 ① : le lait écrémé en tête' }),
  C('LB-D10', 'yaourt 0', 'hors', { top: '^Yaourt à la grecque nature$', raison: '§8 : idem hors ligne' }),
  C('LB-D11', 'lait 0', 'hors', { top: '^Lait à 1,2% MG, UHT', raison: 'DETTE D-075 ② : hors ligne sans table, tête de la base' }),
  C('LB-D12', 'lait 0%', 'en', { top: '^Lait écrémé, UHT$', jamais: 'entier|demi-écrémé|1,2%', raison: 'D-075 ① : le lait écrémé en tête, aucun lait plus gras dessous' }),
  C('LB-D15', 'lait 0%', 'hors', { top: '^Lait fermenté type yaourt au bifidus, nature, 0% MG$', raison: 'DETTE D-075 ② : hors ligne sans table, tête de la base' }),
  /* D-075 ③ (Michel) : « X 0% » n'est pas lu « X zéro » si aucune donnée ni alias ne dit ce que 0 % veut dire — vide, comme
     sur la base. */
  C('LB-D16', 'compote 0%', 'en', { vide: true, raison: 'D-075 ③ : aucune interprétation particulière (vide, comme sur la base)' }),
  C('LB-D17', 'jus d\'orange 0%', 'en', { vide: true, raison: 'D-075 ③ : idem' }),
  C('LB-D13', 'yaourt 0%', 'en', { top: '^Yaourt ou lait fermenté, nature, 0% MG$', raison: '§8 + B2 : idem' }),
  C('LB-D14', 'fromage blanc 0', 'hors', { top: '^Fromage blanc, nature, 0% MG$', raison: '§8 : la variante réellement 0 % reste en tête hors ligne' }),
  /* ── E. PONCTUATION FINALE ── */
  C('LB-E01', 'riz.', 'en', { ref: 'riz', raison: 'le point de la saisie mobile' }),
  C('LB-E02', 'riz.', 'hors', { ref: 'riz', raison: 'idem hors ligne' }),
  C('LB-E03', 'pain complet.', 'en', { ref: 'pain complet', raison: 'point final après deux mots' }),
  C('LB-E04', 'banane.', 'lotb-journal', { ref: 'banane', src: ['LOC', 'CIQ'], raison: 'journal ET CIQUAL' }),
  C('LB-E05', 'lait demi-écrémé.', 'en', { ref: 'lait demi-écrémé', raison: 'point final après un mot composé' }),
  /* ── TAUX ET NOMBRES DU NOM : rien ne bouge ── */
  C('LB-P01', 'lait 1,2%', 'en', { top: '1,2% MG', raison: 'une décimale de taux reste un taux' }),
  C('LB-P02', 'fromage blanc 2%', 'en', { top: '2-3% MG', raison: 'un taux dans une fourchette' }),
  C('LB-P03', 'crème 15%', 'en', { top: '^Crème 12 à 2[05]% MG', raison: '15 % dans « 12 à 25 % »' }),
  C('LB-P04', 'beurre 60-62%', 'en', { top: '^Beurre à 60-62% MG', raison: 'une fourchette tapée' }),
  C('LB-P05', 'steak haché 5%', 'en', { top: '(^|[^0-9,])5% MG', jamais: '(^|[^0-9,])(10|15|20)% MG', raison: 'un taux n\'en vaut pas un autre' }),
  C('LB-P06', 'fromage blanc 20%', 'hors', { vide: true, raison: 'un taux absent de la base ne rend RIEN : le taux n\'est pas une quantité' }),
  C('LB-P07', 'lait 2%', 'hors', { vide: true, raison: 'idem' }),
  C('LB-P08', 'mimolette 12 mois', 'en', { top: '^Mimolette vieille \\(12 mois', raison: 'un nombre du NOM n\'est pas une quantité' }),
  C('LB-P09', 'crème 12 à 25%', 'en', { top: '^Crème 12 à 25% MG', raison: 'idem' }),
  C('LB-P10', 'beurre 80%', 'en', { top: '^Beurre à 80% MG', raison: 'idem' }),
  C('LB-P11', 'eau abatilles arcachon 33', 'en', { top: '^Eau minérale Abatilles', raison: 'un département dans le nom (« Arcachon, 33 »)' }),
  C('LB-P12', 'coca cola 500 ml', 'en', { src: ['FF'], ffTop: '^Coca-Cola 500 ml', raison: 'fast-food : la contenance FAIT partie du nom' }),
  C('LB-P13', 'fuze tea 350 ml', 'hors', { src: ['FF'], ffTop: '^Fuze Tea 350 ml', raison: 'idem' }),
  /* ── LOT-A ne régresse pas ── */
  C('LB-L01', 'confiture de fraise', 'en', { top: '^Confiture de fraise', raison: 'LOT-A' }),
  C('LB-L02', 'confiture d\'abricot', 'en', { top: '^Confiture d\'abricot', raison: 'LOT-A' }),
  C('LB-L03', 'confiture fruits rouges', 'en', { top: '^Confiture, autres fruits ou mélange de fruits', raison: 'LOT-A (D-074)' }),
  C('LB-L04', 'lieu noir', 'en', { top: '^Lieu noir', raison: 'LOT-A' }),
  C('LB-L05', 'potatoes', 'en', { top: '^Potatoes ou wedges.*, cuites$', raison: 'LOT-A (D-074)' }),
  C('LB-L06', 'riz thaï', 'en', { top: '^Riz thaï', raison: 'LOT-A' }),
  C('LB-L07', 'beurre salé', 'en', { top: '^Beurre à 80% MG, salé', raison: 'LOT-A' }),
];
/* les requêtes de RÉFÉRENCE, jouées dans le même contexte que leur cas */
const REFS = [];
CAS.filter(c => c.ref).forEach(c => { const id = 'REF:' + c.ctx + ':' + c.ref; if (!REFS.some(r => r.id === id)) REFS.push({ id, q: c.ref, ctx: c.ctx, sources: ['CIQ'], cat: 'lotb', kind: 'ref' }); });

const lignes = (o, s) => o.lignes.filter(l => l.src === s).map(l => l.titre + (s === 'FF' ? ' | ' + l.detail : ''));
function juger(c, o, P) {
  const ko = [], L = lignes(o, 'CIQ'), F = lignes(o, 'FF'), R = s => new RegExp(s);
  if (c.ref) {
    const r = P.obs['REF:' + c.ctx + ':' + c.ref];
    if (!r) ko.push('référence non jouée');
    else if (c.topRef) { if (!L[0] || L[0] !== lignes(r, 'CIQ')[0]) ko.push('tête ≠ « ' + c.ref + ' » : « ' + L[0] + ' » / « ' + lignes(r, 'CIQ')[0] + ' »'); }
    else for (const s of (c.src || ['CIQ'])) {
      const a = lignes(o, s), b = lignes(r, s);
      if (JSON.stringify(a) !== JSON.stringify(b)) ko.push(s + ' ≠ « ' + c.ref + ' » : ' + JSON.stringify(a.slice(0, 3)) + ' / ' + JSON.stringify(b.slice(0, 3)));
      if (s !== 'FF' && !b.length) ko.push('référence vide (le témoin ne prouverait rien) : ' + s);
    }
    if (!c.topRef && r && JSON.stringify(o.sections) !== JSON.stringify(r.sections)) ko.push('sections ≠ « ' + c.ref + ' » : ' + o.sections.join(',') + ' / ' + r.sections.join(','));
  }
  if (c.top && !(L[0] && R(c.top).test(L[0]))) ko.push('1ʳᵉ ligne CIQUAL ≠ /' + c.top + '/ : « ' + L[0] + ' »');
  if (c.jamais) { const x = L.concat(F).find(y => R(c.jamais).test(y)); if (x) ko.push('incompatible présent : « ' + x + ' »'); }
  if (c.compat) {
    const ic = L.map((x, i) => R(c.compat).test(x) ? i : -1).filter(i => i >= 0), ii = L.map((x, i) => R(c.incompat).test(x) && !R(c.compat).test(x) ? i : -1).filter(i => i >= 0);
    if (!ic.length) ko.push('aucun compatible'); else if (ii.length && Math.min(...ii) < Math.max(...ic)) ko.push('incompatible au-dessus d\'un compatible');
  }
  if (c.vide && L.length) ko.push('attendu vide, ' + L.length + ' ligne(s)');
  if (c.ffTop && !(F[0] && R(c.ffTop).test(F[0]))) ko.push('1ʳᵉ ligne fast-food ≠ /' + c.ffTop + '/ : « ' + F[0] + ' »');
  return ko;
}

module.exports.source = function (t) {
  console.log('\n═══ B-LB-A. NUT-LOT-B — la structure du banc ═══');
  const ids = CAS.map(c => c.id);
  t('B-LB-A ① ' + CAS.length + ' cas, identifiants uniques, chaque cas a une raison et au moins un oracle',
    new Set(ids).size === ids.length && CAS.every(c => c.raison && (c.ref || c.top || c.vide || c.ffTop || c.compat)), '');
  t('B-LB-A ② l\'instantané de référence vient de la BASE de LOT-B (205cd17b) et couvre les 632 clés et les 3 341 noms',
    INST.base === '205cd17b' && INST.n_cles === 632 && INST.n_tetes === 3341, INST.base + ' ' + INST.n_cles + ' ' + INST.n_tetes);
};

module.exports.ecran = async function (t, b, PORT) {
  const P = await MS.executer(b, PORT, CAS.concat(REFS), false);
  console.log('\n-- B-LB-E. NUT-LOT-B — par la VRAIE FRAPPE (en ligne, hors ligne, journal amorcé) --');
  for (const c of CAS) {
    const o = P.obs[c.id], ko = o ? juger(c, o, P) : ['non joué'];
    const vu = o ? JSON.stringify((c.src || ['CIQ']).map(s => s + ':' + lignes(o, s).slice(0, 2).join(' / '))) : '';
    t('B-LB-E ' + c.id + ' ' + (c.ctx !== 'en' ? c.ctx.toUpperCase() + ' ' : '') + '« ' + c.q + ' » — ' + c.raison, ko.length === 0, JSON.stringify(ko) + ' ' + vu);
  }
  t('B-LB-E aucune erreur de page, aucune requête hors du cas en cours', !P.errs.length && !P.anomalies.length, JSON.stringify(P.errs.concat(P.anomalies).slice(0, 3)));

  /* ── B-LB-I : l'instantané de la base — ce qui ne doit PAS bouger ── */
  const cx = await b.newContext({ serviceWorkers: 'block' });
  await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => rt.abort());
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`try{localStorage.setItem('ft4_ob2','1');localStorage.setItem('ft4_guide_shown','1');localStorage.setItem('ft4_wn_seen','99');}catch(e){}`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
  const I = await pg.evaluate(async () => {
    await Promise.all([_ciqualCharger(), _aliasCharger(), _marquesCharger(), _complCharger()]);
    const cles = {}; Object.keys(_alias.a).sort().forEach(k => { cles[k] = _ciqualChercher(k, 3).map(a => a[0]); });
    const tetes = _ciqual.a.filter(a => a[3] != null).map(a => a[0] + '=' + _fsTete(a[1], false) + '|' + _fsTete(a[1], true));
    const seules = {};
    ['100g', '250ml', '200 g'].forEach(q => { seules[q] = { ciq: _ciqualChercher(q, 6).map(a => a[0]), ff: _marquesChercher(q, 4).map(i => _marques.a[i][1]), compl: _complChercher(q, 6).map(a => a[0]) }; });
    const cible = q => (_aliasCible(q) || [null])[0];
    const nomsSurQuantite = ['Coca-Cola 500 ml', 'Fuze Tea 200 ml'].map(n => { const i = _marquesChercher(n, 1)[0]; return i == null ? null : _marques.a[i][1]; });
    return { cles, tetes, seules, cibleEau: cible('eau 1,5 l'), cibleOeufs: cible('2 oeufs'), cibleFbz: cible('fromage blanc 0'), nomsSurQuantite,
      aliasSansQuantite: Object.keys(_alias.a).filter(k => cible(k) !== _alias.a[k]).length };
  });
  await cx.close();
  console.log('\n-- B-LB-I. NUT-LOT-B — l\'instantané de la base : ce qui ne doit PAS bouger --');
  const diffCles = Object.keys(INST.cles).filter(k => JSON.stringify(INST.cles[k]) !== JSON.stringify(I.cles[k]));
  /* D-075 ① : la table compte 2 clés de plus que la base (« lait 0 », « lait 0% »), et seulement elles. */
  const nouvelles = Object.keys(I.cles).filter(k => !(k in INST.cles)).sort();
  t('B-LB-I ① B1 — les 632 clés d\'alias de la base rendent les MÊMES 3 premiers aliments ; seules « lait 0 » et « lait 0% » s\'ajoutent (D-075 ①)',
    diffCles.length === 0 && Object.keys(I.cles).length === 634 && JSON.stringify(nouvelles) === JSON.stringify(['lait 0', 'lait 0%']),
    diffCles.slice(0, 4).map(k => k + ' ' + JSON.stringify(INST.cles[k]) + '→' + JSON.stringify(I.cles[k])).join(' · '));
  t('B-LB-I ② B1 — chaque clé désigne toujours SA cible (`_aliasCible`)', I.aliasSansQuantite === 0, String(I.aliasSansQuantite));
  const diffTetes = INST.tetes.filter((x, i) => I.tetes[i] !== x);
  t('B-LB-I ③ B2 — l\'empreinte `_fsTete` des 3 341 noms CIQUAL est identique : le nettoyage ne touche jamais un NOM de la base', diffTetes.length === 0 && I.tetes.length === INST.tetes.length, diffTetes.slice(0, 3).join(' · '));
  t('B-LB-I ④ B2 — un nom du fast-food qui PORTE sa contenance se retrouve lui-même (« Coca-Cola 500 ml », « Fuze Tea 200 ml »)',
    I.nomsSurQuantite[0] === 'Coca-Cola 500 ml' && I.nomsSurQuantite[1] === 'Fuze Tea 200 ml', JSON.stringify(I.nomsSurQuantite));
  /* ⚠️ CHANGEMENT DOCUMENTÉ (brief §11) : sur la base, « 200 g » proposait les boissons « 200 ml » (le « g » d'une lettre était
     jeté, « 200 » se trouvait seul) et des compléments nommés « 2000 ». Une quantité se lit désormais d'un bloc : seuls des
     noms qui PORTENT cette quantité répondent (« 250ml » ou « 250 ml »). CIQUAL reste vide — jamais tout le catalogue. */
  const portent = (q, L) => L.every(x => new RegExp('(^|[^0-9])' + q.replace(' ', '') .replace(/(\d)([a-z])/, '$1 ?$2') + '(?![a-z0-9])', 'i').test(x));
  t('B-LB-I ⑤ une requête faite d\'une QUANTITÉ SEULE (« 100g », « 250ml », « 200 g ») : rien en CIQUAL, jamais tout le catalogue ; ailleurs, seuls des noms qui PORTENT cette quantité',
    ['100g', '250ml', '200 g'].every(q => I.seules[q].ciq.length === 0 && portent(q, I.seules[q].ff) && portent(q, I.seules[q].compl)) && I.seules['100g'].compl.length > 0,
    JSON.stringify(I.seules).slice(0, 300));
  t('B-LB-I ⑥ l\'alias se lit sur la PARTIE ALIMENTAIRE : « eau 1,5 l » → Eau du robinet (18066), « 2 oeufs » → l\'alias « oeufs », « fromage blanc 0 » → le 0 % (alias « fromage blanc zéro »)',
    I.cibleEau === 18066 && I.cibleOeufs != null && I.cibleOeufs === I.cles['oeufs'][0] && I.cibleFbz != null && I.cibleFbz === I.cles['fromage blanc zero'][0], JSON.stringify([I.cibleEau, I.cibleOeufs, I.cibleFbz]));
  t('B-LB-I aucune erreur de page', !errs.length, errs.join(' | '));

  /* ── B-LB-C : les COMPLÉMENTS, par leur propre champ ── */
  await module.exports.complements(t, b, PORT);
};

module.exports.complements = async function (t, b, PORT) {
  console.log('\n-- B-LB-C. NUT-LOT-B — les compléments (`#compl-desc`, vraie frappe) --');
  const cx = await b.newContext({ serviceWorkers: 'block' });
  await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => rt.abort());
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`try{localStorage.setItem('ft4_ob2','1');localStorage.setItem('ft4_guide_shown','1');localStorage.setItem('ft4_wn_seen','99');}catch(e){}`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
  const frappe = async q => pg.evaluate(async q => {
    await _complCharger();
    const inp = document.getElementById('compl-desc'); inp.value = q; inp.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 250));
    return [...document.querySelectorAll('#compl-sugg > div > div')].map(d => (d.children[0] || {}).textContent || '').filter(Boolean);
  }, q);
  const R = {};
  for (const q of ['whey', 'whey.', '30g de whey', 'vitamine c 250g', 'magnesium', 'magnésium 20 g']) R[q] = await frappe(q);
  await cx.close();
  t('B-LB-C ① « whey. » rend la même liste que « whey » (point final)', R['whey'].length > 0 && JSON.stringify(R['whey.']) === JSON.stringify(R['whey']), JSON.stringify(R['whey.'].slice(0, 2)));
  t('B-LB-C ② « 30g de whey » rend une whey (le nom qui porte « 30g » reste trouvé)', R['30g de whey'].length > 0 && R['30g de whey'].every(x => /whey/i.test(x)), JSON.stringify(R['30g de whey'].slice(0, 3)));
  t('B-LB-C ③ B2 — « vitamine c 250g » : le complément dont le NOM porte « 250G » reste en tête', /250G/i.test(R['vitamine c 250g'][0] || ''), JSON.stringify(R['vitamine c 250g'].slice(0, 2)));
  t('B-LB-C ④ « magnésium 20 g » (aucun nom ne porte « 20 g ») ≈ « magnesium »', R['magnesium'].length > 0 && JSON.stringify(R['magnésium 20 g']) === JSON.stringify(R['magnesium']), JSON.stringify(R['magnésium 20 g'].slice(0, 2)));
  t('B-LB-C aucune erreur de page', !errs.length, errs.join(' | '));
};

module.exports.CAS = CAS;
