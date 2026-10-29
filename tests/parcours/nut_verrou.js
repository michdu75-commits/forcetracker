/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
   🔒 NUT-VERROU-01 (29/10/2026, GO développement de Michel) — LES VALEURS DE RÉFÉRENCE D'UNE FICHE IDENTIFIÉE SONT VERROUILLÉES,
   SEULE LA QUANTITÉ CONSOMMÉE CHANGE. Bloc : B-NVV. Banc : tools/banc_nut_verrou.js · contrôle négatif : tools/mut_nut_verrou.py.

   RÈGLE (Michel, définitive pour ce lot) : une fiche identifiée — CIQUAL, Open Food Facts, fiche d'enseigne (`fiab:'source'`) — a ses
   valeurs de référence verrouillées ; les calories et macros consommées = fiche × quantité, JAMAIS une correction à la main.
   ⛔ Une fiche déclarée (tapée) ou estimée (IA) n'est PAS identifiée : son parcours de saisie reste inchangé.

   DEUX NIVEAUX, deux modules d'appel :
     · `moteur(t)`  — nutrition-v2.js tel que livré (Node, aucune page) : le verrou vit ICI en dernier recours (l'écran peut être
                      contourné par un appel direct) ;
     · `ecran(t,b,PORT)` — les vraies fonctions de l'app dans une vraie page (Playwright), données inventées : champs en lecture seule,
                      anciennes fonctions de correction neutralisées, reprises (favori, repas habituel, ajout rapide), modification.
   ⛔ L'oracle est écrit À LA MAIN. ⛔ Données INVENTÉES, aucune donnée réelle, aucun réseau.
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const path = require('path');
const NUT2 = require(path.join(__dirname, '..', '..', 'nutrition-v2.js'));
const J = (x) => JSON.stringify(x);
const copie = (x) => JSON.parse(JSON.stringify(x));

/* La fiche d'un produit identifié (350 kcal · 25 g P · 40 g G · 10 g L pour 100 g) — l'exemple de Michel : 150 g → 525 kcal. */
const FICHE_OFF = { base: 'g', p100: { kcal: 350, prot: 25, carbs: 40, fat: 10 }, cle: '3000000000111', source: 'off', fiab: 'source', libelle: 'Produit test' };
const FICHE_CIQ = { base: 'g', p100: { kcal: 350, prot: 25, carbs: 40, fat: 10 }, cle: 'ciqual:9999', source: 'ciqual', fiab: 'source', version: 'CIQUAL-2025', libelle: 'Aliment test' };
const FICHE_MARQUE = { base: 'g', p100: { kcal: 350, prot: 25, carbs: 40, fat: 10 }, cle: 'marque:test-1', source: 'marque', fiab: 'source', libelle: 'Burger test' };
const FICHE_DECL = { base: 'g', p100: { kcal: 350, prot: 25, carbs: 40, fat: 10 }, source: 'utilisateur', fiab: 'declaree' };
const FICHE_EST = { base: 'g', p100: { kcal: 350, prot: 25, carbs: 40, fat: 10 }, source: 'ia', fiab: 'estimee' };
const ID = 'nvv-0000-0001';
function entree(fiche, val, extra) {
  return Object.assign({ id: ID, ts: 1760000000000, date: '2026-10-01', repas: 'dejeuner', nom: 'Produit test',
    origine: { saisie: 'recherche', origine: 'off' }, mode: 'pesee', fiche: fiche, quantite: { val: val, unite: 'g' } }, extra || {});
}
const vals = (l) => J({ kcal: l.kcal, prot: l.prot, carbs: l.carbs, fat: l.fat });

module.exports.moteur = function moteur(t) {
  console.log('\n-- B-NVV M. Le moteur : une fiche identifiée ne se corrige plus --');
  t('B-NVV M0 le moteur expose le prédicat du verrou (`NUT2.verrouillee`)', typeof NUT2.verrouillee === 'function');
  const verr = typeof NUT2.verrouillee === 'function' ? NUT2.verrouillee : () => null;
  t('B-NVV M1 ⭐ identifiées = verrouillées : CIQUAL, Open Food Facts, enseigne ; déclarée, estimée, absente ne le sont PAS',
    verr(FICHE_CIQ) === true && verr(FICHE_OFF) === true && verr(FICHE_MARQUE) === true && verr(FICHE_DECL) === false && verr(FICHE_EST) === false && verr(null) === false && verr({}) === false,
    J([verr(FICHE_CIQ), verr(FICHE_OFF), verr(FICHE_MARQUE), verr(FICHE_DECL), verr(FICHE_EST), verr(null)]));

  /* ── les calculs : 100 → 150 → 200 → 100 g, depuis la fiche, jamais depuis un état précédent ── */
  [['CIQUAL', FICHE_CIQ], ['Open Food Facts', FICHE_OFF], ['enseigne', FICHE_MARQUE]].forEach(([nom, f]) => {
    const r100 = NUT2.ligneNouvelle(entree(f, 100)), r150 = NUT2.ligneNouvelle(entree(f, 150)), r200 = NUT2.ligneNouvelle(entree(f, 200)), r100b = NUT2.ligneNouvelle(entree(f, 100));
    t('B-NVV M2 ' + nom + ' : 100 → 150 → 200 → 100 g donne 350/25/40/10 · 525/38/60/15 · 700/50/80/20 · 350/25/40/10 (retour EXACT à la référence)',
      r100.ok && r150.ok && r200.ok && r100b.ok && vals(r100.ligne) === J({ kcal: 350, prot: 25, carbs: 40, fat: 10 }) && vals(r150.ligne) === J({ kcal: 525, prot: 38, carbs: 60, fat: 15 })
      && vals(r200.ligne) === J({ kcal: 700, prot: 50, carbs: 80, fat: 20 }) && vals(r100b.ligne) === vals(r100.ligne), J([r100.ligne, r150.ligne]));
    t('B-NVV M2b ' + nom + ' : la copie de la fiche portée par la ligne (`per100`) et l\'identité (`sourceId`, source) ne bougent pas avec la quantité',
      J(r150.ligne.per100) === J(f.p100) && J(r200.ligne.per100) === J(f.p100) && r150.ligne.sourceId === f.cle && r150.ligne.n2.f.src === f.source && r150.ligne.n2.f.fiab === 'source', J(r150.ligne.n2));
  });
  { let q = 100, cle = null, ok = true, pas = [];
    for (let i = 0; i < 60; i++) { q = [100, 150, 200, 75, 33, 100][i % 6]; const r = NUT2.ligneNouvelle(entree(FICHE_OFF, q)); const ref = NUT2.calcule(FICHE_OFF, { val: q, unite: 'g' }); if (!r.ok || vals(r.ligne) !== J({ kcal: ref.valeurs.kcal, prot: ref.valeurs.prot, carbs: ref.valeurs.carbs, fat: ref.valeurs.fat })) { ok = false; pas.push(q); } }
    t('B-NVV M3 60 changements de quantité enchaînés : aucune dérive (chaque ligne = fiche × quantité, jamais la ligne d\'avant)', ok, J(pas)); }
  t('B-NVV M4 une quantité nulle, négative ou illisible est refusée sur une fiche identifiée', ['QUANTITE_INVALIDE'].every((c) => [0, -5, NaN, Infinity].every((v) => { const r = NUT2.ligneNouvelle(entree(FICHE_OFF, v)); return !r.ok && r.erreur === c; })));

  /* ── le verrou : une correction sur une fiche identifiée est REFUSÉE, explicitement ── */
  const corr = [{ c: 'kcal', v: 999, le: 1760000000001 }];
  [['CIQUAL', FICHE_CIQ], ['Open Food Facts', FICHE_OFF], ['enseigne', FICHE_MARQUE]].forEach(([nom, f]) => {
    const r = NUT2.ligneNouvelle(entree(f, 150, { corrections: copie(corr) }));
    t('B-NVV M5 ⭐⭐ ' + nom + ' : une correction des calories est REFUSÉE par le moteur (FICHE_VERROUILLEE) — pas de ligne, pas de fausse réussite', r.ok === false && r.erreur === 'FICHE_VERROUILLEE', J(r));
  });
  ['prot', 'carbs', 'fat'].forEach((c) => {
    const r = NUT2.ligneNouvelle(entree(FICHE_OFF, 150, { corrections: [{ c, v: 1, le: 1760000000001 }] }));
    t('B-NVV M5b ⭐ une correction des ' + c + ' est REFUSÉE de la même façon', r.ok === false && r.erreur === 'FICHE_VERROUILLEE', J(r));
  });
  { const r = NUT2.ligneNouvelle(entree(FICHE_OFF, 150, { corrections: [] }));
    t('B-NVV M5c une liste de corrections VIDE n\'est pas une correction : la ligne s\'écrit', r.ok === true && r.ligne.n2.corr.length === 0); }
  [['déclarée', FICHE_DECL], ['estimée', FICHE_EST]].forEach(([nom, f]) => {
    const r = NUT2.ligneNouvelle(entree(f, 150, { corrections: copie(corr), origine: { saisie: 'manuel', origine: 'utilisateur' } }));
    t('B-NVV M6 ⭐ fiche ' + nom + ' (NON identifiée) : la correction à la main reste possible, gardée et tracée — le parcours des aliments sans fiche identifiée est inchangé',
      r.ok === true && r.ligne.kcal === 999 && r.ligne.n2.corr.length === 1 && r.ligne.n2.corr[0].v === 999 && r.ligne.n2.corr[0].avant === 525, J(r.ligne && r.ligne.n2));
  });

  /* ── les valeurs inconnues restent inconnues ── */
  { const f = { base: 'g', p100: { kcal: 204, prot: 3.4, carbs: 45.6 }, cle: 'ciqual:15015', source: 'ciqual', fiab: 'source', version: 'CIQUAL-2025' };
    const r = NUT2.ligneNouvelle(entree(f, 200));
    t('B-NVV M7 ⭐ fiche identifiée incomplète (lipides absents) : le champ reste ABSENT (jamais 0), `manque` le dit, et la fiche n\'est pas déverrouillée pour autant',
      r.ok && !('fat' in r.ligne) && J(r.ligne.n2.manque) === J(['fat']) && r.ligne.kcal === 408 && verr(f) === true
      && NUT2.ligneNouvelle(entree(f, 200, { corrections: [{ c: 'fat', v: 5, le: 1 }] })).erreur === 'FICHE_VERROUILLEE', J(r.ligne)); }

  /* ── unités : ml et portions suivent les règles existantes ── */
  { const fml = { base: 'ml', p100: { kcal: 45, prot: 3, carbs: 5, fat: 1.5 }, cle: '3000000000222', source: 'off', fiab: 'source' };
    const r1 = NUT2.ligneNouvelle(entree(fml, 250, { quantite: { val: 250, unite: 'ml' } }));
    const r2 = NUT2.ligneNouvelle(entree(fml, 250, { quantite: { val: 250, unite: 'g' } }));
    const r3 = NUT2.ligneNouvelle(entree(FICHE_OFF, 2, { quantite: { val: 2, unite: 'portion', portion: { libelle: 'part', poids: 60, unite: 'g' } } }));
    const r4 = NUT2.ligneNouvelle(entree(FICHE_OFF, 2, { quantite: { val: 2, unite: 'portion', portion: { libelle: 'part' } } }));
    t('B-NVV M8 ⭐ ml sur une fiche pour 100 ml : 250 ml → 113/8/13/4 ; ml↔g SANS densité sourcée refusé ; portion avec poids (2 × 60 g) → 420/30/48/12 ; portion SANS poids refusée',
      r1.ok && vals(r1.ligne) === J({ kcal: 113, prot: 8, carbs: 13, fat: 4 }) && r2.ok === false && r2.erreur === 'UNITE_INCOMPATIBLE' && r3.ok && vals(r3.ligne) === J({ kcal: 420, prot: 30, carbs: 48, fat: 12 }) && r4.ok === false && r4.erreur === 'PORTION_SANS_POIDS', J([r1.ligne, r2, r3.ligne, r4])); }

  /* ── les ANCIENNES corrections : conservées dans l'historique, jamais réécrites en silence ── */
  const V1 = { id: ID, date: '2026-10-01', meal: 'dejeuner', name: 'Produit test', kcal: 280, prot: 20, carbs: 32, fat: 8, q: 80, u: 'g', ts: 1760000000000, v: 1,
    saisie: 'recherche', origine: 'off', sourceId: '3000000000111', etat: null, per100: { kcal: 350, prot: 25, carbs: 40, fat: 10 } };
  const L1 = entree(FICHE_OFF, 100);   // ancienne ligne V2 corrigée à la main AVANT le verrou : on la fabrique comme le moteur l'écrivait
  const ancienne = NUT2.ligneNouvelle(entree(FICHE_DECL, 100, { origine: { saisie: 'recherche', origine: 'off' }, corrections: [{ c: 'kcal', v: 300, le: 1760000000500, avant: 350 }] }));
  const legacy = ancienne.ok ? copie(ancienne.ligne) : { n2: { corr: [], f: {}, s: 1 }, kcal: 0 }; legacy.sourceId = '3000000000111'; legacy.n2.f = { src: 'off', ver: null, fiab: 'source', base: 'g', lib: 'Produit test' }; legacy.n2.st = 'fiable';
  t('B-NVV M9 (préparation) l\'ancienne ligne corrigée est une ligne V2 pesée sur une fiche identifiée, avec sa correction tracée (300 au lieu de 350)', ancienne.ok && legacy.kcal === 300 && legacy.n2.corr.length === 1 && legacy.n2.f.fiab === 'source', J(legacy));
  { const rep = NUT2.reprise(legacy, null);
    t('B-NVV M10 ⭐ `reprise` d\'une ligne identifiée corrigée : la fiche est rendue, les corrections NE sont PLUS reprises (elles ne peuvent pas modifier la référence) et leur nombre est dit',
      rep.ok && rep.fiche && rep.fiche.fiab === 'source' && rep.corrections.length === 0 && rep.correctionsEcartees === 1, J(rep)); }
  { const nouvelle = NUT2.ligneNouvelle(entree(FICHE_OFF, 150, { remplace: legacy }));
    const n = (nouvelle.ligne && nouvelle.ligne.n2) || {};
    t('B-NVV M11 ⭐⭐ ancienne correction + autre quantité (150 g) : la ligne repart de la FICHE (525/38/60/15), `corr` est vide, l\'ancienne correction est GARDÉE dans l\'historique additif `n2.hc`, une note le dit, `n2.av` (copie d\'origine) ne bouge pas',
      nouvelle.ok && vals(nouvelle.ligne) === J({ kcal: 525, prot: 38, carbs: 60, fat: 15 }) && (n.corr || []).length === 0 && J(n.hc) === J([{ c: 'kcal', v: 300, avant: 350, le: 1760000000500 }]) && (n.no || []).indexOf('correction-ecartee') >= 0 && n.s === 1, J(n)); }
  { let l = legacy, hist = [];
    const a = NUT2.ligneNouvelle(entree(FICHE_OFF, 150, { remplace: l })); l = a.ok ? a.ligne : l;
    const lb = copie(l); lb.n2.corr = [{ c: 'prot', v: 99, avant: 38, le: 1760000000900 }];   // une 2ᵉ ancienne correction (forme d'avant le verrou)
    const b = NUT2.ligneNouvelle(entree(FICHE_OFF, 200, { remplace: lb }));
    const c = b.ok ? NUT2.ligneNouvelle(entree(FICHE_OFF, 100, { remplace: b.ligne })) : b;
    const h = c.ok ? (c.ligne.n2.hc || []).map((x) => x.c + ':' + x.v) : null;
    t('B-NVV M12 ⭐ TROIS remplacements successifs : l\'historique s\'ACCUMULE sans rien perdre (kcal:300 puis prot:99), la ligne finale revient EXACTEMENT à la fiche (350/25/40/10), `n2.s` inchangé',
      a.ok && b.ok && c.ok && J(h) === J(['kcal:300', 'prot:99']) && vals(c.ligne) === J({ kcal: 350, prot: 25, carbs: 40, fat: 10 }) && c.ligne.n2.s === 1 && c.ligne.n2.corr.length === 0, J(c.ligne && c.ligne.n2)); }
  { let l = legacy;
    for (let i = 0; i < 30; i++) { const lb = copie(l); lb.n2.corr = [{ c: 'kcal', v: 100 + i, avant: 350, le: 1760000001000 + i }]; const r = NUT2.ligneNouvelle(entree(FICHE_OFF, 100 + i, { remplace: lb })); if (!r.ok) break; l = r.ligne; }
    t('B-NVV M13 l\'historique est BORNÉ (20 entrées au plus, les plus récentes) : la ligne ne grossit pas sans fin', Array.isArray(l.n2.hc) && l.n2.hc.length === 20 && (l.n2.hc[19] || {}).v === 129, J(l.n2.hc && l.n2.hc.length)); }
  { const v1 = NUT2.ligneNouvelle(entree(FICHE_OFF, 80, { remplace: V1 }));
    t('B-NVV M14 une ancienne ligne d\'AVANT V2 (sans `n2`) modifiée : sa copie d\'origine intégrale est gardée dans `n2.av` (inchangé) et ses valeurs repartent de la fiche',
      v1.ok && v1.ligne.n2.av && v1.ligne.n2.av.kcal === 280 && v1.ligne.kcal === 280 && !('hc' in v1.ligne.n2), J(v1.ligne && v1.ligne.n2)); }
  { const rd = NUT2.ligneNouvelle(entree(FICHE_DECL, 100, { origine: { saisie: 'manuel', origine: 'utilisateur' }, corrections: [{ c: 'kcal', v: 300, le: 1, avant: 350 }] }));
    const repD = NUT2.reprise(rd.ligne, null);
    t('B-NVV M15 ⭐ une ligne DÉCLARÉE corrigée garde ses corrections à la reprise (parcours non identifié inchangé)', rd.ok && repD.corrections.length === 1 && repD.corrections[0].v === 300 && !('correctionsEcartees' in repD && repD.correctionsEcartees > 0)); }
  { const f0 = copie(FICHE_OFF), c0 = copie(legacy), r = NUT2.ligneNouvelle(entree(f0, 150, { remplace: c0 }));
    t('B-NVV M16 le moteur ne MODIFIE ni la fiche reçue ni la ligne remplacée (pas d\'effet de bord)', J(f0) === J(FICHE_OFF) && J(c0) === J(legacy) && r.ok); }
};

/* ═══════════════════════════ LA PAGE ═══════════════════════════ */
const BASE_FIX = `(() => { try {
  if (sessionStorage.getItem('__nvv')) return; sessionStorage.setItem('__nvv', '1');
  localStorage.clear();
  localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
  const pad = n => String(n).padStart(2,'0');
  const t = new Date(); t.setDate(t.getDate()-1); const hier = t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate());
  const L = __LIGNES__.map((x, i) => Object.assign({}, x, { date: hier, ts: 1760000000000 + i * 60000 }));
  localStorage.setItem('ft4_foodlog', JSON.stringify(L));
  localStorage.setItem('ft4_savedfoods', '[]');
} catch (e) {} })();`;

/* Whey (test) : 30 g sur une fiche Open Food Facts 380/75/8/5 pour 100 g → 114 · 23 · 2 · 2 (22,5 → 23 · 2,4 → 2 · 1,5 → 2). */
const NPV2 = { s: 1, m: 'p', st: 'fiable', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'off', ver: null, fiab: 'source', base: 'g' } };
const LIGNES = [
  { id: 'nvv-A-00000001', meal: 'collation', name: 'Whey (test)', kcal: 114, prot: 23, carbs: 2, fat: 2, q: 30, u: 'g', per100: { kcal: 380, prot: 75, carbs: 8, fat: 5 },
    v: 1, saisie: 'code-tape', origine: 'off', sourceId: '3000000000304', etat: 'tel-que-vendu', n2: NPV2 },
  /* la même, CORRIGÉE à la main avant le verrou : 100 kcal saisies au lieu des 114 calculées */
  { id: 'nvv-B-00000002', meal: 'collation', name: 'Whey corrigée (test)', kcal: 100, prot: 23, carbs: 2, fat: 2, q: 30, u: 'g', per100: { kcal: 380, prot: 75, carbs: 8, fat: 5 },
    v: 1, saisie: 'code-tape', origine: 'off', sourceId: '3000000000305', etat: 'tel-que-vendu',
    n2: Object.assign({}, NPV2, { corr: [{ c: 'kcal', v: 100, avant: 114, le: 1760000000500 }] }) },
  /* une fiche DÉCLARÉE (tapée par la personne) : pas identifiée, donc pas verrouillée */
  { id: 'nvv-C-00000003', meal: 'dejeuner', name: 'Maison (test)', kcal: 100, prot: 5, carbs: 10, fat: 4, q: 50, u: 'g', per100: { kcal: 200, prot: 10, carbs: 20, fat: 8 },
    v: 1, saisie: 'manuel', origine: 'utilisateur', sourceId: null, etat: null,
    n2: { s: 1, m: 'p', st: 'declaree', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'utilisateur', ver: null, fiab: 'declaree', base: 'g' } } },
  /* une ancienne ligne tapée à la main, sans aucune fiche */
  { id: 'nvv-D-00000004', meal: 'diner', name: 'Pomme (test)', kcal: 52, prot: 0, carbs: 14, fat: 0, q: null, u: null, per100: null, v: 1, saisie: 'manuel', origine: 'utilisateur', sourceId: null, etat: null },
  /* une fiche identifiée dont les macros ne collent pas à l'énergie : l'avertissement proposait « Mettre X kcal » */
  { id: 'nvv-E-00000005', meal: 'collation', name: 'Incohérente (test)', kcal: 20, prot: 40, carbs: 40, fat: 40, q: 40, u: 'g', per100: { kcal: 50, prot: 100, carbs: 100, fat: 100 },
    v: 1, saisie: 'code-tape', origine: 'off', sourceId: '3000000000309', etat: 'tel-que-vendu', n2: NPV2 },
];

const clic = async (pg, sel) => { try { await pg.click(sel, { timeout: 4000 }); return true; } catch (e) { return false; } };
async function ouvrirPage(b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const pg = await cx.newPage();
  const erreurs = [];
  pg.on('pageerror', (e) => erreurs.push(String(e && e.message || e).slice(0, 160)));
  pg.on('dialog', (d) => d.accept());
  await pg.addInitScript(BASE_FIX.replace('__LIGNES__', J(LIGNES)));
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1500);
  await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); });
  return { cx, pg, erreurs };
}

module.exports.ecran = async function ecran(t, b, PORT) {
  console.log('\n-- B-NVV P. La page : les anciens chemins de correction sont fermés (vraies fonctions de l\'app) --');
  const { cx, pg, erreurs } = await ouvrirPage(b, PORT);
  const E = (f, a) => pg.evaluate(f, a);
  const ligne = (id) => E((i) => JSON.parse(JSON.stringify((S.foodLog || []).find((x) => x && x.id === i) || null)), id);
  const avant = await E(() => JSON.stringify(S.foodLog));
  t('B-NVV P0 la page est prête avec 5 lignes inventées (une identifiée, une identifiée corrigée, une déclarée, une sans fiche, une incohérente)', (await E(() => (S.foodLog || []).length)) === 5);

  /* ── ① MODIFIER une ligne identifiée ── */
  const ouvrir = async (id) => { await E((i) => { openEditFood(i); }, id); await pg.waitForTimeout(500); };
  const champs = () => E(() => ({ kcal: document.getElementById('ef-kcal').value, prot: document.getElementById('ef-prot').value, carbs: document.getElementById('ef-carbs').value, fat: document.getElementById('ef-fat').value,
    ro: ['kcal', 'prot', 'carbs', 'fat'].map((c) => document.getElementById('ef-' + c).readOnly) }));
  await ouvrir('nvv-A-00000001');
  const c1 = await champs();
  t('B-NVV P1 ⭐⭐ « Modifier » une ligne IDENTIFIÉE : les quatre champs de référence sont en LECTURE SEULE (pas seulement grisés : `readOnly`)', J(c1.ro) === J([true, true, true, true]), J(c1));
  const dir = await E(() => { const el = document.getElementById('ef-kcal'); el.value = '999'; _efSaisieValeur(el); return { corr: JSON.stringify(_efCorr), champ: el.value }; });
  t('B-NVV P2 ⭐⭐ appel DIRECT de la saisie (sans bouton) avec 999 kcal : aucune correction n\'est enregistrée et le champ retrouve le calcul de la fiche (114)', dir.corr === '{}' && dir.champ === '114', J(dir));
  const dk = await E(() => { _efRef = { base: { kcal: 380, prot: 75, carbs: 8, fat: 5 } }; _efCorrigerKcal(777); const ref = JSON.stringify(_efRef.base); _efRef = null; return { corr: JSON.stringify(_efCorr), champ: document.getElementById('ef-kcal').value, ref }; });
  t('B-NVV P3 ⭐⭐ appel DIRECT de `_efCorrigerKcal(777)` : sans effet (ni champ, ni correction, ni référence modifiée — la référence posée à 380 kcal reste à 380)', dk.corr === '{}' && dk.champ === '114' && /"kcal":380/.test(dk.ref), J(dk));
  await E(() => { const g = document.getElementById('ef-grams'); g.value = '60'; _efApplyFiche(); });
  const c60 = await champs();
  t('B-NVV P4 60 g : 228 · 45 · 5 · 3 (fiche 380/75/8/5 × 0,6 : 228 · 45 · 4,8 → 5 · 3), toujours en lecture seule', c60.kcal === '228' && c60.prot === '45' && c60.carbs === '5' && c60.fat === '3' && J(c60.ro) === J([true, true, true, true]), J(c60));
  await E(() => { saveEditFood(); }); await pg.waitForTimeout(400);
  const a1 = await ligne('nvv-A-00000001');
  t('B-NVV P5 « Enregistrer » à 60 g : la ligne est 228/45/5/3 ; sa fiche (`per100`), son identité (`sourceId`) et sa provenance (`n2.f`) sont INCHANGÉES ; aucune correction',
    a1 && a1.kcal === 228 && a1.q === 60 && J(a1.per100) === J({ kcal: 380, prot: 75, carbs: 8, fat: 5 }) && a1.sourceId === '3000000000304' && a1.n2.f.src === 'off' && a1.n2.f.fiab === 'source' && a1.n2.corr.length === 0 && a1.date === (JSON.parse(avant)[0].date) && a1.meal === 'collation', J(a1));

  /* ── ② une ligne identifiée DÉJÀ corrigée ── */
  await ouvrir('nvv-B-00000002');
  const cB = await champs();
  t('B-NVV P6 ⭐ ouvrir une ligne identifiée DÉJÀ corrigée (100 enregistrés pour 114 calculés) : l\'écran montre le calcul de la FICHE (114), lecture seule — l\'ancienne correction ne s\'applique plus',
    cB.kcal === '114' && J(cB.ro) === J([true, true, true, true]), J(cB));
  const bAvant = await ligne('nvv-B-00000002');
  t('B-NVV P7 ouvrir ne modifie rien : la ligne enregistrée est toujours à 100 kcal avec sa correction tracée (aucune réécriture silencieuse)', bAvant.kcal === 100 && bAvant.n2.corr.length === 1 && bAvant.n2.corr[0].v === 100);
  await E(() => { const g = document.getElementById('ef-grams'); g.value = '60'; _efApplyFiche(); saveEditFood(); }); await pg.waitForTimeout(400);
  const bApres = await ligne('nvv-B-00000002');
  t('B-NVV P8 ⭐⭐ « Enregistrer » à 60 g : 228 (la fiche, pas 200 = la correction doublée), `corr` vide, l\'ancienne correction (100 kcal) est dans l\'historique `n2.hc`, la note « correction écartée » est posée',
    bApres.kcal === 228 && bApres.n2.corr.length === 0 && bApres.n2.hc && bApres.n2.hc.length === 1 && bApres.n2.hc[0].v === 100 && bApres.n2.no.indexOf('correction-ecartee') >= 0 && bApres.n2.av === undefined, J(bApres.n2));
  const badge = await E((i) => _n2Badge((S.foodLog || []).find((x) => x.id === i)), 'nvv-B-00000002');
  t('B-NVV P9 la ligne le dit discrètement dans le journal (badge « ancienne correction écartée »)', /ancienne correction écartée/.test(badge), badge);

  /* ── ③ une fiche DÉCLARÉE n'est pas verrouillée ── */
  await ouvrir('nvv-C-00000003');
  const cC = await champs();
  t('B-NVV P10 ⭐ une fiche DÉCLARÉE : les champs restent éditables (non `readOnly`)', J(cC.ro) === J([false, false, false, false]), J(cC));
  const dC = await E(() => { _efCorrigerKcal(777); return { champ: document.getElementById('ef-kcal').value, corr: Object.keys(_efCorr) }; });
  t('B-NVV P11 ⭐ … et « Mettre X kcal » y garde son comportement (777 posé et tracé comme correction) — parcours hors fiche identifiée inchangé', dC.champ === '777' && J(dC.corr) === J(['kcal']), J(dC));
  await ouvrir('nvv-D-00000004');
  t('B-NVV P12 une ancienne ligne SANS fiche reste entièrement éditable', J((await champs()).ro) === J([false, false, false, false]));

  /* ── ④ l'ÉCRAN D'AJOUT ── */
  await E(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); });
  const g1 = await clic(pg, '#nb-nutrition'); await pg.waitForTimeout(400); const g2 = await clic(pg, '#ntab-journal'); await pg.waitForTimeout(250);
  const g3 = await clic(pg, 'button[onclick="addFoodVia(\'main\')"]'); await pg.waitForTimeout(500);
  const ouvAj = await E(() => { const l = (S.foodLog || []).find((x) => x.id === 'nvv-A-00000001'); return _n2Reprendre(l, 'historique'); }); await pg.waitForTimeout(400);
  const aj = () => E(() => ({ ro: ['kcal', 'prot', 'carbs', 'fat'].map((c) => document.getElementById('af-' + c).readOnly), kcal: document.getElementById('af-kcal').value }));
  t('B-NVV P13 l\'écran d\'AJOUT a bien repris la fiche identifiée (prérequis du banc)', g1 && g2 && g3 && ouvAj === true && !!(await E(() => _bcNutr)), J({ g1, g2, g3, ouvAj }));
  t('B-NVV P14 ⭐⭐ écran d\'ajout, fiche identifiée : les quatre champs sont en lecture seule', J((await aj()).ro) === J([true, true, true, true]), J(await aj()));
  const aSaisie = await E(() => { const el = document.getElementById('af-kcal'); const v0 = el.value; el.value = '999'; _afSaisieValeur(el); return { corr: JSON.stringify(_afCorr), champ: el.value, v0 }; });
  t('B-NVV P15 ⭐⭐ appel DIRECT de `_afSaisieValeur` : aucune correction, le champ revient au calcul', aSaisie.corr === '{}' && aSaisie.champ === aSaisie.v0, J(aSaisie));
  const aKcal = await E(() => { const sauve = _afRef; _afRef = { base: { kcal: 380, prot: 75, carbs: 8, fat: 5 }, q: 100, u: 'g' }; _afCorrigerKcal(555); const ref = JSON.stringify(_afRef.base); _afRef = sauve; return { corr: JSON.stringify(_afCorr), champ: document.getElementById('af-kcal').value, ref }; });
  t('B-NVV P16 ⭐⭐ appel DIRECT de `_afCorrigerKcal(555)` : sans effet — ni champ, ni correction, ni référence modifiée (posée à 380 kcal, elle reste à 380)', aKcal.corr === '{}' && aKcal.champ !== '555' && /"kcal":380/.test(aKcal.ref), J(aKcal));
  const ent = await E(() => { document.getElementById('af-bc-grams').value = '40'; _afCorr = { kcal: { v: 5, avant: 1, le: 1 } }; const r = _n2EntreeEcran('Whey (test)', _n2LireChamps('af'), true); return { ok: r.ok, corr: r.entree && r.entree.corrections }; });
  t('B-NVV P17 ⭐ l\'entrée que l\'écran donnerait au moteur ne porte AUCUNE correction, même si un état périmé (`_afCorr`) en contenait une', ent.ok === true && Array.isArray(ent.corr) && ent.corr.length === 0, J(ent));
  await E(() => { _afCorr = {}; });
  const cohDe = (vs) => E((v) => { ['kcal', 'prot', 'carbs', 'fat'].forEach((c, i) => { document.getElementById('af-' + c).value = v[i]; }); _afCoherence(); const el = document.getElementById('af-coherence');
    return { visible: !!el && el.style.display !== 'none' && el.innerHTML.length > 0, bouton: !!el && /Mettre .* kcal/.test(el.innerHTML), dit: !!el && /verrouillée/.test(el.innerHTML), texte: el ? el.textContent.slice(0, 100) : '' }; }, vs);
  const coh = await cohDe(['100', '10', '20', '10']);
  t('B-NVV P18 ⭐⭐ des valeurs en écart avec leurs macros (posées par un appel direct : 100 kcal pour 10/20/10 g) : l\'avertissement s\'affiche, SANS le bouton « Mettre X kcal », et dit que la fiche est verrouillée', coh.visible === true && coh.bouton === false && coh.dit === true, J(coh));
  const coh2 = await cohDe(['500', '1', '1', '1']);
  t('B-NVV P18b ⭐⭐ idem pour l\'énergie IMPOSSIBLE (500 kcal dans 40 g) : l\'avertissement s\'affiche, SANS bouton, et dit que la fiche est verrouillée', coh2.visible === true && coh2.bouton === false && coh2.dit === true, J(coh2));
  /* CONSTAT — l'exception à DÉCIDER : un produit Open Food Facts dont le résolveur d'énergie conclut NON_RESOLU est classé « estimé » (et non
     « source ») par le code existant : il n'est donc pas verrouillé et garde « Mettre X kcal ». C'est un parcours existant de lecture d'étiquette. */
  await E(() => { _afOublierAliment(); }); await pg.waitForTimeout(250);
  const exc = await E(() => { const l = (S.foodLog || []).find((x) => x.id === 'nvv-E-00000005'); _n2Reprendre(l, 'historique'); document.getElementById('af-bc-grams').value = '40'; _afCoherence();
    return { etat: _bcNutr && _bcNutr.fiab && _bcNutr.fiab.etat, fiab: _n2FicheBc().fiab, ro: document.getElementById('af-kcal').readOnly, verr: _n2VerrouEcran('af') }; });
  t('B-NVV P17b CONSTAT (exception à décider par Michel, NON modifiée ici) : un produit identifié dont l\'énergie est NON_RESOLU est classé « estimé » par le code existant → non verrouillé, champs éditables (lecture d\'étiquette conservée)', exc.etat === 'NON_RESOLU' && exc.fiab === 'estimee' && exc.ro === false && exc.verr === false, J(exc));
  await E(() => { const l = (S.foodLog || []).find((x) => x.id === 'nvv-A-00000001'); _n2Reprendre(l, 'historique'); }); await pg.waitForTimeout(250);
  /* … puis un aliment tapé à la main : tout redevient éditable, « Mettre X kcal » existe */
  await E(() => { _afOublierAliment(); }); await pg.waitForTimeout(250);
  const manuel = await E(() => { const set = (id, v) => { document.getElementById(id).value = v; }; set('af-kcal', '100'); set('af-prot', '10'); set('af-carbs', '20'); set('af-fat', '10'); _afSaisieValeur(document.getElementById('af-kcal'));
    const el = document.getElementById('af-coherence'); return { ro: ['kcal', 'prot', 'carbs', 'fat'].map((c) => document.getElementById('af-' + c).readOnly), bouton: !!el && /Mettre .* kcal/.test(el.innerHTML) }; });
  t('B-NVV P19 ⭐ changer volontairement d\'aliment (ici : saisie à la main) DÉVERROUILLE les champs, et « Mettre X kcal » est de nouveau proposé', J(manuel.ro) === J([false, false, false, false]) && manuel.bouton === true, J(manuel));

  /* ── ⑤ les REPRISES (favori, repas habituel, ajout rapide, « + Ajouter ») ne contournent pas le verrou ── */
  await E(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); });
  const rA = await E(() => { const src = JSON.parse(JSON.stringify((S.foodLog || []).find((x) => x.id === 'nvv-A-00000001'))); const n0 = (S.foodLog || []).length;
    const r = _n2Reajouter(src, 'dejeuner', today(), 'test', null); const l = (S.foodLog || [])[(S.foodLog || []).length - 1]; return { ok: r.ok, n0, n1: (S.foodLog || []).length, kcal: l && l.kcal, corr: l && l.n2 && l.n2.corr }; });
  t('B-NVV P20 ré-ajout rapide / repas habituel d\'une ligne identifiée NON corrigée : la nouvelle ligne est la fiche × la quantité reprise (60 g depuis P5 : 228), sans correction (ligne de contrôle)', rA.ok === true && rA.n1 === rA.n0 + 1 && rA.kcal === 228 && J(rA.corr) === '[]', J(rA));
  const rB = await E((src) => { const n0 = (S.foodLog || []).length;
    const r = _n2Reajouter(src, 'dejeuner', today(), 'test', null); const ap = _n2Apercu(src); const R = NUT2.reprise(src, _n2Ctx());
    return { ok: r.ok, incoherente: r.incoherente === true, texte: r.raison && r.raison.texte, n0, n1: (S.foodLog || []).length, corrReprise: R.corrections.length, ecartees: R.correctionsEcartees, apercu: ap && ap.ligne && ap.ligne.kcal }; }, Object.assign({}, LIGNES[1], { date: '2026-10-28', ts: 1760000060000 }));
  t('B-NVV P20b ⭐⭐ ré-ajout rapide / repas habituel / favori d\'une ligne identifiée DÉJÀ CORRIGÉE (100 pour 114) : l\'ancienne correction n\'est PAS réappliquée — la reprise ne la rend plus, rien n\'est écrit en silence (la liste dit « à vérifier »), et l\'aperçu montre la fiche (114)',
    rB.ok === false && rB.incoherente === true && rB.n1 === rB.n0 && rB.corrReprise === 0 && rB.ecartees === 1 && rB.apercu === 114 && /ne correspondent plus à sa fiche/.test(rB.texte || ''), J(rB));
  const refus = await E(() => { const fiche = { base: 'g', p100: { kcal: 380, prot: 75, carbs: 8, fat: 5 }, cle: '3000000000304', source: 'off', fiab: 'source' };
    const n0 = S.foodLog.length; const r = _n2Enregistrer({ id: 'nvv-direct-0001', ts: Date.now(), date: today(), repas: 'dejeuner', nom: 'Direct', origine: { saisie: 'recherche', origine: 'off' }, mode: 'pesee', fiche: fiche, quantite: { val: 30, unite: 'g' }, corrections: [{ c: 'kcal', v: 1, le: Date.now() }] }, 'test');
    return { ok: r.ok, erreur: r.erreur, n0, n1: S.foodLog.length, message: _n2Message(r) }; });
  t('B-NVV P21 ⭐⭐ l\'écrivain unique appelé DIRECTEMENT avec une correction sur une fiche identifiée : refusé, RIEN d\'écrit, et la phrase dit pourquoi (pas de code brut)', refus.ok === false && refus.erreur === 'FICHE_VERROUILLEE' && refus.n1 === refus.n0 && !/FICHE_VERROUILLEE/.test(refus.message) && /référence|verrouill|fiche/i.test(refus.message), J(refus));

  const fav = await E((src) => { const f = _favDepuisLigne(src); return { corr: f.n2 && f.n2.corr, sid: f.sourceId, f: f.n2 && f.n2.f && f.n2.f.fiab }; }, Object.assign({}, LIGNES[1], { date: '2026-10-28', ts: 1760000060000 }));
  t('B-NVV P25 ⭐ un FAVORI pris sur une ligne identifiée corrigée ne recopie PAS la correction (mais garde l\'identité et la fiche)', fav.corr === undefined && fav.sid === '3000000000305' && fav.f === 'source', J(fav));
  await ouvrir('nvv-A-00000001');
  const perime = await E(() => { _efCorr = { kcal: { v: 5, avant: 1, le: 1 } }; document.getElementById('ef-grams').value = '90'; _efApplyFiche(); saveEditFood(); const l = S.foodLog.find((x) => x.id === 'nvv-A-00000001'); return { kcal: l.kcal, q: l.q, corr: l.n2.corr.length }; });
  t('B-NVV P26 ⭐ « Enregistrer » avec un état périmé (`_efCorr`) sur une fiche identifiée : la ligne s\'écrit depuis la fiche (90 g → 342), sans correction — pas de refus, pas de valeur retouchée', perime.kcal === 342 && perime.q === 90 && perime.corr === 0, J(perime));

  /* ── ⑥ intégrité ── */
  const autres = await E(() => JSON.stringify((S.foodLog || []).filter((x) => ['nvv-C-00000003', 'nvv-D-00000004', 'nvv-E-00000005'].indexOf(x.id) >= 0)));
  const att = J(JSON.parse(avant).filter((x) => ['nvv-C-00000003', 'nvv-D-00000004', 'nvv-E-00000005'].indexOf(x.id) >= 0));
  t('B-NVV P22 ⭐ les lignes non touchées (déclarée, sans fiche, incohérente) sont identiques à l\'octet après tous ces gestes', autres === att);
  t('B-NVV P23 aucun favori créé ni effacé, aucun masquage touché', (await E(() => JSON.stringify([S.savedFoods || [], S.hiddenFoods || []]))) === '[[],[]]');
  t('B-NVV P24 aucune erreur de page', erreurs.length === 0, J(erreurs));
  await cx.close();
};
