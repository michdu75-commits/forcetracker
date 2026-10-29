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
/* FINALISATION (29/10, GO de Michel) : une fiche IDENTIFIÉE dont le résolveur d'énergie a conclu NON_RESOLU / DERIVE_ESTIMABLE descend à fiab:'estimee'
   (l'avertissement de fiabilité) — elle reste identifiée par sa SOURCE (off, ciqual, marque) et reste verrouillée. */
const FICHE_OFF_NR = Object.assign({}, FICHE_OFF, { fiab: 'estimee' });
const FICHE_CIQ_EST = Object.assign({}, FICHE_CIQ, { fiab: 'estimee' });
const FICHE_MARQUE_EST = Object.assign({}, FICHE_MARQUE, { fiab: 'estimee' });
const FICHE_ETIQ = { base: 'g', p100: { kcal: 350, prot: 25, carbs: 40, fat: 10 }, source: 'etiquette', fiab: 'declaree' };
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
  { let l = legacy, refus = null, n = 0;
    for (let i = 0; i < 30; i++) { const lb = copie(l); lb.n2.corr = [{ c: 'kcal', v: 100 + i, avant: 350, le: 1760000001000 + i }]; const r = NUT2.ligneNouvelle(entree(FICHE_OFF, 100 + i, { remplace: lb })); if (!r.ok) { refus = r; break; } l = r.ligne; n++; }
    t('B-NVV M13 ⭐⭐ (FINALISATION) l\'historique des anciennes corrections n\'efface JAMAIS en silence : arrivé à 20 entrées, la 21ᵉ modification est REFUSÉE (HISTORIQUE_PLEIN), les 20 entrées sont toutes là, de la première (kcal:100) à la dernière (kcal:119)',
      !!refus && refus.erreur === 'HISTORIQUE_PLEIN' && n === 20 && Array.isArray(l.n2.hc) && l.n2.hc.length === 20 && l.n2.hc[0].v === 100 && l.n2.hc[19].v === 119, J(refus) + ' n=' + n + ' ' + J(l.n2.hc && l.n2.hc.length)); }
  { const v1 = NUT2.ligneNouvelle(entree(FICHE_OFF, 80, { remplace: V1 }));
    t('B-NVV M14 une ancienne ligne d\'AVANT V2 (sans `n2`) modifiée : sa copie d\'origine intégrale est gardée dans `n2.av` (inchangé) et ses valeurs repartent de la fiche',
      v1.ok && v1.ligne.n2.av && v1.ligne.n2.av.kcal === 280 && v1.ligne.kcal === 280 && !('hc' in v1.ligne.n2), J(v1.ligne && v1.ligne.n2)); }
  { const rd = NUT2.ligneNouvelle(entree(FICHE_DECL, 100, { origine: { saisie: 'manuel', origine: 'utilisateur' }, corrections: [{ c: 'kcal', v: 300, le: 1, avant: 350 }] }));
    const repD = NUT2.reprise(rd.ligne, null);
    t('B-NVV M15 ⭐ une ligne DÉCLARÉE corrigée garde ses corrections à la reprise (parcours non identifié inchangé)', rd.ok && repD.corrections.length === 1 && repD.corrections[0].v === 300 && !('correctionsEcartees' in repD && repD.correctionsEcartees > 0)); }
  { const f0 = copie(FICHE_OFF), c0 = copie(legacy), r = NUT2.ligneNouvelle(entree(f0, 150, { remplace: c0 }));
    t('B-NVV M16 le moteur ne MODIFIE ni la fiche reçue ni la ligne remplacée (pas d\'effet de bord)', J(f0) === J(FICHE_OFF) && J(c0) === J(legacy) && r.ok); }

  /* ═══ FINALISATION (29/10, GO de Michel après compaction) ═══ */
  console.log('\n-- B-NVV M. FINALISATION : l\'identité décide du verrou (pas la fiabilité), le nom est verrouillé, l\'historique ne perd rien, le repas seul ne recalcule rien --');
  /* ① OFF NON_RESOLU / énergie douteuse : identifié = verrouillé, l'avertissement de fiabilité reste */
  t('B-NVV M17 ⭐⭐ une fiche IDENTIFIÉE (source off / ciqual / enseigne) dont la fiabilité est descendue à « estimée » (énergie NON_RESOLU ou dérivée) est VERROUILLÉE aussi ; étiquette recopiée et IA ne le sont pas',
    verr(FICHE_OFF_NR) === true && verr(FICHE_CIQ_EST) === true && verr(FICHE_MARQUE_EST) === true && verr(FICHE_ETIQ) === false && verr(FICHE_EST) === false && verr(FICHE_DECL) === false,
    J([verr(FICHE_OFF_NR), verr(FICHE_CIQ_EST), verr(FICHE_MARQUE_EST), verr(FICHE_ETIQ), verr(FICHE_EST), verr(FICHE_DECL)]));
  [['Open Food Facts', FICHE_OFF_NR], ['CIQUAL', FICHE_CIQ_EST], ['enseigne', FICHE_MARQUE_EST]].forEach(([nom, f]) => {
    const r = NUT2.ligneNouvelle(entree(f, 150, { corrections: copie(corr) }));
    t('B-NVV M18 ⭐⭐ ' + nom + ' « estimée » : une correction est REFUSÉE (FICHE_VERROUILLEE)', r.ok === false && r.erreur === 'FICHE_VERROUILLEE', J(r));
  });
  { const r = NUT2.ligneNouvelle(entree(FICHE_OFF_NR, 150, { trace: { etat: 'NON_RESOLU', methode: 'aucune', raison: 'energie_incoherente', brut: 350 } }));
    t('B-NVV M19 ⭐ l\'avertissement de fiabilité est CONSERVÉ : la ligne reste « estimée » (`n2.st`, `n2.f.fiab`), la trace du résolveur part avec elle, les valeurs sont la fiche × la quantité (525/38/60/15), sans rien inventer',
      r.ok && r.ligne.n2.st === 'estimee' && r.ligne.n2.f.fiab === 'estimee' && r.ligne.n2.f.src === 'off' && r.ligne.fiab && r.ligne.fiab.etat === 'NON_RESOLU' && vals(r.ligne) === J({ kcal: 525, prot: 38, carbs: 60, fat: 15 }), J(r.ligne && r.ligne.n2)); }
  { const ancEst = NUT2.ligneNouvelle(entree(FICHE_ETIQ, 100, { origine: { saisie: 'recherche', origine: 'off' }, corrections: [{ c: 'kcal', v: 300, le: 1760000000500, avant: 350 }] }));
    const lg = ancEst.ok ? copie(ancEst.ligne) : { n2: { corr: [], f: {}, s: 1 } }; lg.sourceId = '3000000000111'; lg.n2.f = { src: 'off', ver: null, fiab: 'estimee', base: 'g' }; lg.n2.st = 'estimee';
    const rep = NUT2.reprise(lg, null);
    t('B-NVV M20 ⭐ `reprise` d\'une ancienne ligne OFF « estimée » corrigée : fiche rendue (toujours « estimée »), corrections NON reprises, leur nombre dit',
      rep.ok && rep.fiche && rep.fiche.fiab === 'estimee' && rep.fiche.source === 'off' && rep.corrections.length === 0 && rep.correctionsEcartees === 1, J(rep));
    const nv = NUT2.ligneNouvelle(entree(FICHE_OFF_NR, 150, { remplace: lg }));
    t('B-NVV M20b ⭐ … et sa modification repart de la fiche, GARDE l\'ancienne correction dans l\'historique et reste « estimée »',
      nv.ok && vals(nv.ligne) === J({ kcal: 525, prot: 38, carbs: 60, fat: 15 }) && nv.ligne.n2.corr.length === 0 && J(nv.ligne.n2.hc) === J([{ c: 'kcal', v: 300, avant: 350, le: 1760000000500 }]) && nv.ligne.n2.st === 'estimee', J(nv.ligne && nv.ligne.n2)); }

  /* ② LE NOM d'un produit identifié est verrouillé ; le repas, non */
  { const base = NUT2.ligneNouvelle(entree(FICHE_OFF, 100, { nom: 'Produit test' })).ligne;
    const r1 = NUT2.ligneNouvelle(entree(FICHE_OFF, 150, { nom: 'Un autre nom', remplace: base }));
    const r2 = NUT2.ligneNouvelle(entree(FICHE_OFF, 150, { nom: 'Produit test', remplace: base, repas: 'diner' }));
    const r3 = NUT2.ligneNouvelle(entree(FICHE_OFF_NR, 150, { nom: 'Un autre nom', remplace: base }));
    const d = NUT2.ligneNouvelle(entree(FICHE_DECL, 100, { nom: 'Maison', origine: { saisie: 'manuel', origine: 'utilisateur' } })).ligne;
    const r4 = NUT2.ligneNouvelle(entree(FICHE_DECL, 150, { nom: 'Maison renommée', remplace: d, origine: { saisie: 'manuel', origine: 'utilisateur' } }));
    t('B-NVV M21 ⭐⭐ renommer une ligne sur fiche identifiée est REFUSÉ (NOM_VERROUILLE), même « estimée » ; garder le nom en changeant le REPAS et la quantité est accepté ; une fiche déclarée peut toujours être renommée',
      r1.ok === false && r1.erreur === 'NOM_VERROUILLE' && r3.ok === false && r3.erreur === 'NOM_VERROUILLE' && r2.ok === true && r2.ligne.meal === 'diner' && r2.ligne.name === 'Produit test' && r4.ok === true && r4.ligne.name === 'Maison renommée',
      J([r1, r2.ok && r2.ligne.meal, r3, r4.ok && r4.ligne.name])); }

  /* ③ L'historique n2.hc : ni troncature silencieuse, ni croissance sans borne */
  { const plein = copie(legacy); plein.n2.hc = []; for (let i = 0; i < 20; i++) plein.n2.hc.push({ c: 'kcal', v: 200 + i, avant: 350, le: 1760000002000 + i }); plein.n2.corr = [];
    const sans = NUT2.ligneNouvelle(entree(FICHE_OFF, 120, { remplace: plein }));
    const une = copie(plein); une.n2.corr = [{ c: 'prot', v: 9, avant: 25, le: 1760000003000 }];
    const avantJson = J(une);
    const refus = NUT2.ligneNouvelle(entree(FICHE_OFF, 120, { remplace: une }));
    const dix9 = copie(plein); dix9.n2.hc.pop(); dix9.n2.corr = [{ c: 'prot', v: 9, avant: 25, le: 1760000003000 }];
    const vingt = NUT2.ligneNouvelle(entree(FICHE_OFF, 120, { remplace: dix9 }));
    t('B-NVV M22 ⭐⭐ historique à 20 : sans nouvelle correction la ligne s\'écrit et garde ses 20 entrées ; avec une 21ᵉ elle est REFUSÉE (HISTORIQUE_PLEIN) sans toucher à la ligne d\'avant ; à 19 + 1 = 20 elle passe, rien n\'est perdu',
      sans.ok && sans.ligne.n2.hc.length === 20 && sans.ligne.n2.hc[0].v === 200 && refus.ok === false && refus.erreur === 'HISTORIQUE_PLEIN' && J(une) === avantJson && vingt.ok && vingt.ligne.n2.hc.length === 20 && vingt.ligne.n2.hc[0].v === 200 && vingt.ligne.n2.hc[19].c === 'prot', J([sans.ok, refus, vingt.ok && vingt.ligne.n2.hc.length])); }

  /* ④ Changer UNIQUEMENT le repas : la ligne telle quelle, sauf le repas */
  t('B-NVV M23 le moteur expose `changerRepas` (la ligne d\'avant, le seul repas qui change)', typeof NUT2.changerRepas === 'function');
  { const cr = typeof NUT2.changerRepas === 'function' ? NUT2.changerRepas : () => ({ ok: false, erreur: 'ABSENT' });
    const corrigee = copie(legacy); corrigee.meal = 'dejeuner'; const avantJson = J(corrigee);
    const r = cr(corrigee, 'diner');
    const attendu = copie(corrigee); attendu.meal = 'diner';
    t('B-NVV M24 ⭐⭐ `changerRepas` sur une ligne corrigée à la main (300 pour 350) : repas changé, TOUT le reste identique à l\'octet (valeurs 300 gardées, `n2.corr` gardée, pas de `n2.hc`), la ligne reçue n\'est pas modifiée et rien n\'est partagé',
      r.ok === true && J(r.ligne) === J(attendu) && r.ligne.kcal === 300 && r.ligne.n2.corr.length === 1 && !('hc' in r.ligne.n2) && J(corrigee) === avantJson && r.ligne !== corrigee && r.ligne.n2 !== corrigee.n2, J(r));
    const anc = { id: ID, date: '2026-10-01', meal: 'dejeuner', name: 'Vieille ligne', kcal: 52, prot: 0, carbs: 14, fat: 0, ts: 1760000000000, v: 1 };
    const ra = cr(anc, 'collation');
    t('B-NVV M25 une ancienne ligne SANS `n2` : seul le repas change, aucun `n2` n\'est ajouté (aucune migration)', ra.ok === true && ra.ligne.meal === 'collation' && !('n2' in ra.ligne) && ra.ligne.kcal === 52 && J(Object.assign({}, ra.ligne, { meal: 'dejeuner' })) === J(anc), J(ra));
    t('B-NVV M26 repas vide / absent / ligne illisible : refusé, rien n\'est inventé', [cr(corrigee, ''), cr(corrigee, '   '), cr(corrigee, undefined), cr(null, 'diner'), cr([], 'diner')].every((x) => x.ok === false), J([cr(corrigee, ''), cr(null, 'diner')])); }
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
const NPV2_EST = Object.assign({}, NPV2, { st: 'estimee', f: { src: 'off', ver: null, fiab: 'estimee', base: 'g' } });
const HC20 = []; for (let i = 0; i < 20; i++) HC20.push({ c: 'kcal', v: 200 + i, avant: 114, le: 1760000002000 + i });
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
  /* FINALISATION — F : un produit OFF identifié dont l'énergie est NON_RESOLU (la ligne garde son avertissement : « estimée ») */
  { id: 'nvv-F-00000006', meal: 'collation', name: 'Douteuse (test)', kcal: 140, prot: 10, carbs: 16, fat: 4, q: 40, u: 'g', per100: { kcal: 350, prot: 25, carbs: 40, fat: 10 },
    v: 1, saisie: 'code-tape', origine: 'off', sourceId: '3000000000310', etat: 'tel-que-vendu', fiab: { etat: 'NON_RESOLU', methode: 'aucune', raison: 'energie_incoherente', brut: 350 }, n2: NPV2_EST },
  /* G et H : identifiées, corrigées à la main AVANT le verrou (100 kcal enregistrées, 114 avec la fiche) — G pour le repas seul, H pour la quantité */
  { id: 'nvv-G-00000007', meal: 'collation', name: 'Whey G (test)', kcal: 100, prot: 23, carbs: 2, fat: 2, q: 30, u: 'g', per100: { kcal: 380, prot: 75, carbs: 8, fat: 5 },
    v: 1, saisie: 'code-tape', origine: 'off', sourceId: '3000000000311', etat: 'tel-que-vendu', n2: Object.assign({}, NPV2, { corr: [{ c: 'kcal', v: 100, avant: 114, le: 1760000000500 }] }) },
  { id: 'nvv-H-00000008', meal: 'collation', name: 'Whey H (test)', kcal: 100, prot: 23, carbs: 2, fat: 2, q: 30, u: 'g', per100: { kcal: 380, prot: 75, carbs: 8, fat: 5 },
    v: 1, saisie: 'code-tape', origine: 'off', sourceId: '3000000000312', etat: 'tel-que-vendu', n2: Object.assign({}, NPV2, { corr: [{ c: 'kcal', v: 100, avant: 114, le: 1760000000500 }] }) },
  /* J : déjà 20 corrections dans l'historique et une 21ᵉ à écarter */
  { id: 'nvv-J-00000009', meal: 'collation', name: 'Whey J (test)', kcal: 100, prot: 23, carbs: 2, fat: 2, q: 30, u: 'g', per100: { kcal: 380, prot: 75, carbs: 8, fat: 5 },
    v: 1, saisie: 'code-tape', origine: 'off', sourceId: '3000000000313', etat: 'tel-que-vendu', n2: Object.assign({}, NPV2, { corr: [{ c: 'kcal', v: 100, avant: 114, le: 1760000000500 }], hc: HC20 }) },
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
  t('B-NVV P0 la page est prête avec 9 lignes inventées (identifiée, identifiée corrigée, déclarée, sans fiche, incohérente, NON_RESOLU, deux corrigées à part, une à historique plein)', (await E(() => (S.foodLog || []).length)) === 9);

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
  const noteEf = () => E(() => { const e = document.getElementById('ef-abandon'); const b = document.getElementById('ef-save'); return { visible: !!e && e.style.display !== 'none' && e.textContent.trim().length > 0, txt: e ? e.textContent : '', bouton: b ? b.textContent : '' }; });
  const noteB = await noteEf();
  t('B-NVV P6 ⭐ (FINALISATION) ouvrir une ligne identifiée DÉJÀ corrigée (100 enregistrés pour 114 calculés) : l\'écran montre les valeurs ENREGISTRÉES (100 — rien n\'est recalculé en silence), en lecture seule, et DIT que la ligne a été corrigée et repartira de la fiche si la quantité change',
    cB.kcal === '100' && J(cB.ro) === J([true, true, true, true]) && noteB.visible && /100/.test(noteB.txt) && /114/.test(noteB.txt) && /fiche/.test(noteB.txt), J([cB, noteB]));
  const bAvant = await ligne('nvv-B-00000002');
  t('B-NVV P7 ouvrir ne modifie rien : la ligne enregistrée est toujours à 100 kcal avec sa correction tracée (aucune réécriture silencieuse)', bAvant.kcal === 100 && bAvant.n2.corr.length === 1 && bAvant.n2.corr[0].v === 100);
  await E(() => { const g = document.getElementById('ef-grams'); g.value = '60'; _efApplyFiche(); });
  const c60B = await champs(), n60B = await noteEf();
  t('B-NVV P7b ⭐⭐ la quantité change (60 g) : l\'écran montre la FICHE × 60 g (228) et AVERTIT avant toute confirmation — les chiffres enregistrés vont passer de 100 à 228, l\'ancienne correction est abandonnée (mais gardée dans l\'historique) ; le bouton demande de confirmer',
    c60B.kcal === '228' && n60B.visible && /100/.test(n60B.txt) && /228/.test(n60B.txt) && /abandonn/.test(n60B.txt) && /[Cc]onfirm/.test(n60B.bouton), J([c60B, n60B]));
  await E(() => { const g = document.getElementById('ef-grams'); g.value = '30'; _efApplyFiche(); });
  const c30B = await champs();
  t('B-NVV P7c ⭐ … revenir à la quantité d\'origine (30 g) remet les valeurs ENREGISTRÉES (100) et retire l\'avertissement de confirmation (rien ne changerait)', c30B.kcal === '100' && !/[Cc]onfirm/.test((await noteEf()).bouton), J([c30B, await noteEf()]));
  await E(() => { const g = document.getElementById('ef-grams'); g.value = '60'; _efApplyFiche(); saveEditFood(); }); await pg.waitForTimeout(300);
  const bSans = await ligne('nvv-B-00000002');
  t('B-NVV P7d ⭐⭐ un 1ᵉʳ « Enregistrer » à 60 g NE ÉCRIT RIEN : la ligne est toujours celle d\'avant (100 kcal, 30 g, correction tracée) — il faut confirmer', J(bSans) === J(bAvant), J(bSans));
  await E(() => { saveEditFood(); }); await pg.waitForTimeout(400);
  const bApres = await ligne('nvv-B-00000002');
  t('B-NVV P8 ⭐⭐ le 2ᵉ « Enregistrer » (confirmation) à 60 g : 228 (la fiche, pas 200 = la correction doublée), `corr` vide, l\'ancienne correction (100 kcal) est dans l\'historique `n2.hc`, la note « correction écartée » est posée',
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
  /* FINALISATION (ex-CONSTAT P17b, tranché par Michel) : un produit identifié dont l'énergie est NON_RESOLU est VERROUILLÉ aussi — il garde son avertissement
     de fiabilité (« estimée »), et la sortie est dite : choisir un autre produit, ou une saisie personnelle. */
  await E(() => { _afOublierAliment(); }); await pg.waitForTimeout(250);
  const exc = await E(() => { const l = (S.foodLog || []).find((x) => x.id === 'nvv-E-00000005'); _n2Reprendre(l, 'historique'); document.getElementById('af-bc-grams').value = '40'; _afCoherence();
    const el = document.getElementById('af-coherence');
    return { etat: _bcNutr && _bcNutr.fiab && _bcNutr.fiab.etat, fiab: _n2FicheBc().fiab, source: _n2FicheBc().source, ro: ['kcal', 'prot', 'carbs', 'fat'].map((c) => document.getElementById('af-' + c).readOnly), verr: _n2VerrouEcran('af'),
      avert: !!el && el.style.display !== 'none' && /ne sait pas laquelle croire/.test(el.textContent), bouton: !!el && /Mettre .* kcal/.test(el.innerHTML), sortie: !!el && /autre produit/.test(el.textContent) && /verrouillée/.test(el.textContent) }; });
  t('B-NVV P17b ⭐⭐ (FINALISATION) produit identifié à énergie NON_RESOLU : classé « estimé » (avertissement conservé) MAIS verrouillé — quatre champs en lecture seule, l\'avertissement « l\'app ne sait pas laquelle croire » s\'affiche, SANS « Mettre X kcal », et la sortie est dite (autre produit / saisie personnelle)',
    exc.etat === 'NON_RESOLU' && exc.fiab === 'estimee' && exc.source === 'off' && J(exc.ro) === J([true, true, true, true]) && exc.verr === true && exc.avert === true && exc.bouton === false && exc.sortie === true, J(exc));
  const sortie = await E(() => { openAddFood(); return { verr: _n2VerrouEcran('af'), ro: ['kcal', 'prot', 'carbs', 'fat'].map((c) => document.getElementById('af-' + c).readOnly), sid: !!(_afSrc && _afSrc.sourceId), ligneE: JSON.stringify((S.foodLog || []).find((x) => x.id === 'nvv-E-00000005')) }; });
  t('B-NVV P17c ⭐⭐ la sortie existe : rouvrir « Ajouter » (ou choisir un autre produit) libère les champs, l\'identité du produit OFF ne suit PAS, et la référence enregistrée de la ligne OFF n\'a pas bougé',
    sortie.verr === false && J(sortie.ro) === J([false, false, false, false]) && sortie.sid === false && sortie.ligneE === J(JSON.parse(avant).find((x) => x.id === 'nvv-E-00000005')), J(sortie));
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

  /* ── ⑦ FINALISATION (29/10) : OFF NON_RESOLU · le nom · l'historique plein · le repas seul · la quantité d'une ligne corrigée ── */
  await E(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); window.__toasts = []; const o = window.toast; window.toast = function (m, ty) { window.__toasts.push(String(m)); return o && o.apply(this, arguments); }; });
  const nom = () => E(() => ({ ro: document.getElementById('ef-name').readOnly, v: document.getElementById('ef-name').value }));
  /* ① Modifier un produit OFF NON_RESOLU */
  await ouvrir('nvv-F-00000006');
  const cF = await champs(), nF = await nom();
  t('B-NVV P27 ⭐⭐ « Modifier » un produit OFF identifié à énergie NON_RESOLU (ligne « estimée ») : les quatre champs ET le nom sont en lecture seule', J(cF.ro) === J([true, true, true, true]) && nF.ro === true, J([cF, nF]));
  const dF = await E(() => { const el = document.getElementById('ef-kcal'); el.value = '999'; _efSaisieValeur(el); return { corr: JSON.stringify(_efCorr), champ: el.value }; });
  t('B-NVV P27b ⭐ appel DIRECT de la saisie sur ce produit : aucune correction, le champ garde la valeur de la fiche (140)', dF.corr === '{}' && dF.champ === '140', J(dF));
  await E(() => { const g = document.getElementById('ef-grams'); g.value = '60'; _efApplyFiche(); saveEditFood(); }); await pg.waitForTimeout(400);
  const lF = await ligne('nvv-F-00000006');
  t('B-NVV P27c ⭐ « Enregistrer » à 60 g : 210 (fiche 350 × 0,6), toujours « estimée » (avertissement conservé), sa trace NON_RESOLU et son identité intactes, aucune correction',
    lF.kcal === 210 && lF.q === 60 && lF.n2.st === 'estimee' && lF.n2.f.fiab === 'estimee' && lF.n2.f.src === 'off' && lF.n2.corr.length === 0 && lF.sourceId === '3000000000310' && lF.fiab && lF.fiab.etat === 'NON_RESOLU' && J(lF.per100) === J({ kcal: 350, prot: 25, carbs: 40, fat: 10 }), J(lF));
  /* ② le nom */
  await ouvrir('nvv-A-00000001');
  const nA = await nom();
  const avantA = await ligne('nvv-A-00000001');
  t('B-NVV P28 ⭐⭐ « Modifier » un produit identifié : le champ NOM est en lecture seule', nA.ro === true && nA.v === 'Whey (test)', J(nA));
  await E(() => { document.getElementById('ef-name').value = 'Un autre nom'; _setEditFoodMeal('diner'); saveEditFood(); }); await pg.waitForTimeout(400);
  const apresA = await ligne('nvv-A-00000001');
  const attenduA = JSON.parse(JSON.stringify(avantA)); attenduA.meal = 'diner';
  t('B-NVV P28b ⭐⭐ un nom forcé par un appel direct n\'est PAS enregistré (le nom reste « Whey (test) »), le REPAS, lui, change (diner), et rien d\'autre ne bouge dans la ligne (quantité inchangée = valeurs enregistrées telles quelles)', J(apresA) === J(attenduA), J(apresA));
  await ouvrir('nvv-C-00000003'); const nC = await nom();
  await ouvrir('nvv-D-00000004'); const nD = await nom();
  t('B-NVV P28c ⭐ le nom d\'une fiche DÉCLARÉE et d\'une ancienne ligne sans fiche reste modifiable (parcours inchangé)', nC.ro === false && nD.ro === false, J([nC, nD]));
  /* … côté ÉCRAN D'AJOUT : le nom du produit identifié ne change pas à l'enregistrement */
  const aj2 = await E(() => { openAddFood(); const l = (S.foodLog || []).find((x) => x.id === 'nvv-A-00000001'); _n2Reprendre(l, 'historique'); return true; }); await pg.waitForTimeout(400);
  const nomAj = await E(() => { document.getElementById('af-bc-grams').value = '40'; const lire = () => _n2LireChamps('af');
    const autre = _n2EntreeEcran('Un autre nom', lire(), true), meme = _n2EntreeEcran('Whey (test)', lire(), true), casse = _n2EntreeEcran('  whey (TEST)  ', lire(), true);
    return { autre: { ok: autre.ok, message: autre.message }, meme: { ok: meme.ok, nom: meme.entree && meme.entree.nom }, casse: { ok: casse.ok, nom: casse.entree && casse.entree.nom } }; });
  t('B-NVV P29 ⭐⭐ écran d\'AJOUT, produit identifié : un autre nom est REFUSÉ avec une phrase (rien n\'est construit) ; le même nom (casse et espaces près) passe, enregistré sous le nom du PRODUIT',
    aj2 === true && nomAj.autre.ok === false && /produit/.test(nomAj.autre.message || '') && nomAj.meme.ok === true && nomAj.meme.nom === 'Whey (test)' && nomAj.casse.ok === true && nomAj.casse.nom === 'Whey (test)', J(nomAj));
  /* ③ l'historique plein */
  await ouvrir('nvv-J-00000009');
  const avantJ = await ligne('nvv-J-00000009');
  await E(() => { const g = document.getElementById('ef-grams'); g.value = '60'; _efApplyFiche(); saveEditFood(); saveEditFood(); }); await pg.waitForTimeout(400);
  const apresJ = await ligne('nvv-J-00000009'), toastsJ = await E(() => window.__toasts.slice(-3));
  t('B-NVV P30 ⭐⭐ ligne dont l\'historique des corrections est PLEIN (20) et qui porte encore une correction : « Enregistrer » est REFUSÉ avec une phrase, la ligne est strictement celle d\'avant, les 20 traces sont toutes là',
    J(apresJ) === J(avantJ) && apresJ.n2.hc.length === 20 && toastsJ.some((m) => /historique/.test(m) && /pas été modifiée/.test(m)), J([toastsJ, apresJ.n2.hc.length]));
  /* ④ le repas seul d'une ancienne ligne corrigée */
  await ouvrir('nvv-G-00000007');
  const cG = await champs(), avantG = await ligne('nvv-G-00000007'), nG = await noteEf();
  t('B-NVV P31 ⭐ ancienne ligne corrigée (G) ouverte : valeurs ENREGISTRÉES (100) en lecture seule, avec la note', cG.kcal === '100' && J(cG.ro) === J([true, true, true, true]) && nG.visible, J([cG, nG]));
  await E(() => { _setEditFoodMeal('diner'); saveEditFood(); }); await pg.waitForTimeout(400);
  const apresG = await ligne('nvv-G-00000007');
  const attenduG = JSON.parse(JSON.stringify(avantG)); attenduG.meal = 'diner';
  t('B-NVV P31b ⭐⭐ ne changer QUE le repas : la ligne est identique à l\'octet à l\'ancienne, sauf le repas — 100 kcal gardées (pas 114), correction tracée gardée, pas d\'historique ajouté, pas de note, aucune confirmation demandée', J(apresG) === J(attenduG) && apresG.kcal === 100 && apresG.n2.corr.length === 1 && apresG.n2.hc === undefined, J(apresG));
  /* ⑤ rien d'autre n'a bougé dans les lignes non visées */
  const autres7 = await E(() => JSON.stringify((S.foodLog || []).filter((x) => ['nvv-C-00000003', 'nvv-D-00000004', 'nvv-E-00000005', 'nvv-H-00000008', 'nvv-J-00000009'].indexOf(x.id) >= 0 && x.id !== 'nvv-J-00000009')));
  const att7 = J(JSON.parse(avant).filter((x) => ['nvv-C-00000003', 'nvv-D-00000004', 'nvv-E-00000005', 'nvv-H-00000008'].indexOf(x.id) >= 0));
  t('B-NVV P32 ⭐ les lignes non visées par ces gestes (déclarée, sans fiche, incohérente, H) sont identiques à l\'octet', autres7 === att7);

  /* ── ⑥ intégrité ── */
  const autres = await E(() => JSON.stringify((S.foodLog || []).filter((x) => ['nvv-C-00000003', 'nvv-D-00000004', 'nvv-E-00000005'].indexOf(x.id) >= 0)));
  const att = J(JSON.parse(avant).filter((x) => ['nvv-C-00000003', 'nvv-D-00000004', 'nvv-E-00000005'].indexOf(x.id) >= 0));
  t('B-NVV P22 ⭐ les lignes non touchées (déclarée, sans fiche, incohérente) sont identiques à l\'octet après tous ces gestes', autres === att);
  t('B-NVV P23 aucun favori créé ni effacé, aucun masquage touché', (await E(() => JSON.stringify([S.savedFoods || [], S.hiddenFoods || []]))) === '[[],[]]');
  t('B-NVV P24 aucune erreur de page', erreurs.length === 0, J(erreurs));
  await cx.close();
};
