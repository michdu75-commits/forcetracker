#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01 : tout nouveau banc se garde lui-même)
/* Banc NUTRITION V2 — le moteur (jalon 2, 22/10/2026) : `nutrition-v2.js`, sans navigateur.
 *
 * [*] CE QU'IL CONDUIT : les trois fonctions du moteur (`calcule`, `ligneNouvelle`, `lireAncienne` + `lireJournal`,
 *     `ficheVerifiee`), chargées dans Node, sur des données FICTIVES écrites à la main.
 * [*] CE QU'IL OBSERVE : les valeurs rendues, les refus, les champs écrits ou absents, et l'état des lignes
 *     d'entrée (gelées, comparées octet par octet avant / après).
 * [!] CE QU'IL NE COUVRE PAS : l'app (le moteur n'y est pas branché à ce jalon), l'écran, le stockage, le nuage,
 *     les journaux réels (la récupération des anciens journaux est le chantier de Claude Principal).
 * [*] LES ATTENDUS SONT ÉCRITS À LA MAIN, jamais calculés par le code testé (oracle indépendant) ; la seule donnée
 *     lue est la table CIQUAL embarquée (`data/ciqual.json`), pour l'adaptateur.
 * [!!] UN PLANTAGE N'EST PAS UN VERT : il sort en code 2 avec « 0 OK / 1 rouge ».
 *
 * Usage : node tools/banc_nut2_moteur.js            (NUT2_CIBLE=<fichier> : éprouver une copie, contrôle négatif)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.dirname(__dirname);
const CIBLE = process.env.NUT2_CIBLE || path.join(ROOT, 'nutrition-v2.js');
let ok = 0;
const ko = [];

function t(nom, cond, detail) {
  if (cond) { ok++; console.log('  OK   ' + nom); }
  else { ko.push(nom); console.log('  !!   ' + nom + '   ' + (detail || '')); }
}
/* Un témoin dont l'appel lève est ROUGE (jamais vert, jamais un plantage du banc). */
function essai(nom, fn, detail) {
  let r;
  try { r = fn(); } catch (e) { t(nom, false, 'a levé : ' + (e && e.message)); return; }
  t(nom, r === true, typeof r === 'string' ? r : (detail || ''));
}
function geler(o) {                                   // gel PROFOND : une écriture lèverait (le moteur est en mode strict)
  if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(geler); }
  return o;
}
const J = (x) => JSON.stringify(x);

try { (() => {
  delete require.cache[require.resolve(CIBLE)];
  const N = require(CIBLE);

  /* La table CIQUAL embarquée, lue ici (et non par le moteur) : code → pour 100 g, `null` = non déterminé. */
  const CQ = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ciqual.json'), 'utf8'));
  const IDX = {};
  CQ.a.forEach((r) => { IDX[String(r[0])] = { kcal: r[3], prot: r[4], carbs: r[5], fat: r[6] }; });
  const ctx = { ciqual: (code) => IDX[String(code)] || null };

  console.log('\n═══ B-NV2-C. LE CALCUL : fiche × quantité, une seule fonction ═══');
  const RIZ = geler({ base: 'g', p100: { kcal: 360, prot: 7.4, carbs: 79, fat: 0.6 }, cle: 'ciqual:9999', source: 'ciqual', fiab: 'source' });
  essai('B-NV2-C ① 150 g × fiche pour 100 g = 540 kcal · 11 P · 119 G · 1 L (attendus écrits à la main)', () => {
    const r = N.calcule(RIZ, { val: 150, unite: 'g' });
    return r.ok && J(r.valeurs) === J({ kcal: 540, prot: 11, carbs: 119, fat: 1 }) || J(r);
  });
  essai('B-NV2-C ② arrondi de l\'app : 12,5 → 13 (Math.round), 0,2 g de protéines → 0 (connu, pas absent)', () => {
    const a = N.calcule({ base: 'g', p100: { kcal: 25 } }, { val: 50, unite: 'g' });
    const b = N.calcule({ base: 'g', p100: { kcal: 52, prot: 0.2, carbs: 11.7 } }, { val: 100, unite: 'g' });
    return a.ok && a.valeurs.kcal === 13 && b.ok && b.valeurs.prot === 0 || J([a, b]);
  });
  essai('B-NV2-C ③ ⛔ un champ ABSENT de la fiche reste ABSENT du résultat (jamais 0) et il est nommé', () => {
    const r = N.calcule({ base: 'g', p100: { kcal: 52, prot: 0.2, carbs: 11.7 } }, { val: 100, unite: 'g' });
    return r.ok && !('fat' in r.valeurs) && J(r.manque) === J(['fat']) && r.valeurs.carbs === 12 || J(r);
  });
  essai('B-NV2-C ④ fiche pour 100 ml : 330 ml de cola fictif = 139 kcal · 35 G', () => {
    const r = N.calcule({ base: 'ml', p100: { kcal: 42, prot: 0, carbs: 10.6, fat: 0 } }, { val: 330, unite: 'ml' });
    return r.ok && J(r.valeurs) === J({ kcal: 139, prot: 0, carbs: 35, fat: 0 }) || J(r);
  });
  essai('B-NV2-C ⑤ ⛔ des ml sur une fiche pour 100 g SANS densité : REFUS (jamais « 1 ml = 1 g »)', () => {
    const r = N.calcule(RIZ, { val: 330, unite: 'ml' });
    return !r.ok && r.erreur === 'UNITE_INCOMPATIBLE' || J(r);
  });
  essai('B-NV2-C ⑥ avec une densité SOURCÉE : 250 ml × 1,03 g/ml = 257,5 g → 118 kcal · 8 P · 12 G · 4 L', () => {
    const r = N.calcule({ base: 'g', p100: { kcal: 46, prot: 3.3, carbs: 4.8, fat: 1.5 }, densite: { gParMl: 1.03, source: 'fictive' } },
      { val: 250, unite: 'ml' });
    return r.ok && J(r.valeurs) === J({ kcal: 118, prot: 8, carbs: 12, fat: 4 }) && r.masse.val === 257.5 || J(r);
  });
  essai('B-NV2-C ⑦ ⛔ une densité SANS source ne compte pas (refus), et l\'inverse g → ml marche (100 g / 1,25 = 80 ml → 32 kcal)', () => {
    const a = N.calcule({ base: 'g', p100: { kcal: 46 }, densite: { gParMl: 1.03 } }, { val: 250, unite: 'ml' });
    const b = N.calcule({ base: 'ml', p100: { kcal: 40 }, densite: { gParMl: 1.25, source: 'fictive' } }, { val: 100, unite: 'g' });
    return !a.ok && a.erreur === 'UNITE_INCOMPATIBLE' && b.ok && b.valeurs.kcal === 32 || J([a, b]);
  });
  essai('B-NV2-C ⑧ 2 portions « steak » de 125 g : 323 kcal · 50 P · 0 G · 13 L, la masse 250 g est RENDUE', () => {
    const r = N.calcule({ base: 'g', p100: { kcal: 129, prot: 20, carbs: 0, fat: 5 } },
      { val: 2, unite: 'portion', portion: { libelle: 'steak', poids: 125, unite: 'g' } });
    return r.ok && J(r.valeurs) === J({ kcal: 323, prot: 50, carbs: 0, fat: 13 }) && r.masse.val === 250 || J(r);
  });
  essai('B-NV2-C ⑨ ⛔ des portions SANS poids sur une fiche pour 100 g : REFUS (aucun poids deviné)', () => {
    const r = N.calcule(RIZ, { val: 1, unite: 'portion', portion: { libelle: 'dose' } });
    return !r.ok && r.erreur === 'PORTION_SANS_POIDS' || J(r);
  });
  essai('B-NV2-C ⑩ ⛔ D-099 : une fiche « par portion » (300 kcal la part, poids inconnu) N\'EXISTE PAS — refus, en portions comme en grammes', () => {
    const PART = { base: 'portion', libelle: 'part', pourUne: { kcal: 300, prot: 12, carbs: 30, fat: 14 } };
    const a = N.calcule(PART, { val: 2, unite: 'portion', portion: { libelle: 'part' } });
    const b = N.calcule(PART, { val: 150, unite: 'g' });
    return !a.ok && a.erreur === 'BASE_INCONNUE' && !b.ok && b.erreur === 'BASE_INCONNUE' || J([a, b]);
  });
  essai('B-NV2-C ⑪ ⛔ D-099 : une portion de volume (1 canette de 330 ml) sur une fiche pour 100 ml se calcule ; en ml sur une fiche pour 100 g, refus', () => {
    const COLA = { base: 'ml', p100: { kcal: 42, prot: 0, carbs: 10.6, fat: 0 } };
    const a = N.calcule(COLA, { val: 1, unite: 'portion', portion: { libelle: 'canette', poids: 330, unite: 'ml' } });
    const b = N.calcule(RIZ, { val: 1, unite: 'portion', portion: { libelle: 'bol', poids: 250, unite: 'ml' } });
    return a.ok && a.valeurs.kcal === 139 && !b.ok && b.erreur === 'UNITE_INCOMPATIBLE' || J([a, b]);
  });
  essai('B-NV2-C ⑫ ⛔ quantité 0, négative, NaN, infinie, texte, nulle, absente : REFUS à chaque fois', () => {
    const mauvaises = [0, -5, NaN, Infinity, '150', null, undefined];
    const r = mauvaises.map((v) => N.calcule(RIZ, { val: v, unite: 'g' }));
    const r2 = [N.calcule(RIZ, null), N.calcule(RIZ, {})];
    return r.concat(r2).every((x) => !x.ok && x.erreur === 'QUANTITE_INVALIDE') || J(r.concat(r2));
  });
  essai('B-NV2-C ⑬ ⛔ unité inconnue (« kg ») et fiches invalides (négative, texte, vide, base inconnue, absente) : REFUS', () => {
    const a = N.calcule(RIZ, { val: 1, unite: 'kg' });
    const f = [{ base: 'g', p100: { kcal: -1 } }, { base: 'g', p100: { kcal: 'abc' } }, { base: 'g', p100: {} },
               { base: 'kg', p100: { kcal: 1 } }, null];
    const r = f.map((x) => N.calcule(x, { val: 100, unite: 'g' }));
    return a.erreur === 'UNITE_INCONNUE' && r[0].erreur === 'FICHE_INVALIDE' && r[1].erreur === 'FICHE_INVALIDE' &&
      r[2].erreur === 'FICHE_INVALIDE' && r[3].erreur === 'BASE_INCONNUE' && r[4].erreur === 'FICHE_ABSENTE' || J([a].concat(r));
  });
  essai('B-NV2-C ⑭ ⭐ pas de dérive : 150 → 151 → 175 → 99 → 200 → 150 g, la valeur finale = la première, au chiffre près', () => {
    const suite = [150, 151, 175, 99, 200, 150].map((g) => N.calcule(RIZ, { val: g, unite: 'g' }).valeurs);
    return J(suite[0]) === J(suite[5]) && J(suite[0]) === J({ kcal: 540, prot: 11, carbs: 119, fat: 1 }) || J(suite);
  });

  console.log('\n═══ B-NV2-E. L\'ÉCRIVAIN DES NOUVELLES LIGNES ═══');
  const BASE = { id: 'nv2-00000001', ts: 1761120000000, date: '2026-10-22', repas: 'dejeuner', nom: 'Riz fictif',
                 origine: { saisie: 'ciqual', origine: 'ciqual' } };
  const ent = (o) => Object.assign({}, BASE, o);
  const PESEE = { mode: 'pesee', fiche: RIZ, quantite: { val: 150, unite: 'g' } };
  /* 🔒 NUT-VERROU-01 (29/10/2026, décision de Michel) — une fiche IDENTIFIÉE (`fiab:'source'`, comme RIZ) n'accepte plus aucune correction :
     le moteur la REFUSE (`FICHE_VERROUILLEE`). Le contrat des corrections tracées (CR-2) reste VRAI pour une fiche NON identifiée : ces
     témoins (⑩ ⑪ ⑫, R ②, R ⑩) le vérifient donc sur la MÊME fiche présentée comme DÉCLARÉE (tapée) — valeurs identiques, aucune assertion
     affaiblie ; le refus sur la fiche identifiée a son propre témoin (⑩b) et son banc (`tools/banc_nut_verrou.js`). */
  const RIZ_DECL = geler({ base: 'g', p100: { kcal: 360, prot: 7.4, carbs: 79, fat: 0.6 }, source: 'utilisateur', fiab: 'declaree' });
  const PESEE_DECL = { mode: 'pesee', fiche: RIZ_DECL, quantite: { val: 150, unite: 'g' } };
  essai('B-NV2-E ① une ligne pesée : champs de V1 (q, u, per100, sourceId, valeurs) + n2 (pesée, fiable)', () => {
    const r = N.ligneNouvelle(ent(PESEE)); const L = r.ligne;
    return r.ok && L.q === 150 && L.u === 'g' && J(L.per100) === J({ kcal: 360, prot: 7.4, carbs: 79, fat: 0.6 }) &&
      L.sourceId === 'ciqual:9999' && L.kcal === 540 && L.prot === 11 && L.carbs === 119 && L.fat === 1 &&
      L.v === 1 && L.saisie === 'ciqual' && L.origine === 'ciqual' && L.meal === 'dejeuner' &&
      L.n2.s === 1 && L.n2.m === 'p' && L.n2.st === 'fiable' || J(r);
  });
  essai('B-NV2-E ② `per100` est une COPIE de la fiche (la modifier ne touche pas la fiche)', () => {
    const f = { base: 'g', p100: { kcal: 360, prot: 7.4, carbs: 79, fat: 0.6 }, source: 'ciqual', fiab: 'source' };
    const L = N.ligneNouvelle(ent({ mode: 'pesee', fiche: f, quantite: { val: 150, unite: 'g' } })).ligne;
    L.per100.kcal = 1;
    return f.p100.kcal === 360 || 'la fiche a bougé';
  });
  essai('B-NV2-E ③ ⛔ pas de quantité, ou 0, ou illisible : RIEN n\'est construit (la fiche n\'est jamais « mangée »)', () => {
    const r = [ent({ mode: 'pesee', fiche: RIZ }), ent({ mode: 'pesee', fiche: RIZ, quantite: { val: 0, unite: 'g' } }),
               ent({ mode: 'pesee', fiche: RIZ, quantite: { val: 'abc', unite: 'g' } })].map(N.ligneNouvelle);
    return r.every((x) => !x.ok && x.erreur === 'QUANTITE_INVALIDE' && !x.ligne) || J(r);
  });
  essai('B-NV2-E ④ ⛔ un champ absent de la fiche est ABSENT de la ligne (pas de clé, pas de 0) et nommé dans n2', () => {
    const r = N.ligneNouvelle(ent({ mode: 'pesee', fiche: { base: 'g', p100: { kcal: 52, prot: 0.2, carbs: 11.7 }, source: 'ciqual', fiab: 'source' },
      quantite: { val: 100, unite: 'g' } }));
    return r.ok && !('fat' in r.ligne) && J(r.ligne.n2.manque) === J(['fat']) && !('fat' in r.ligne.per100) || J(r);
  });
  essai('B-NV2-E ⑤ ⛔ la provenance est EXIGÉE (absente : refus) et son vocabulaire vérifié (« scan », ancien : refus)', () => {
    const a = N.ligneNouvelle(Object.assign(ent(PESEE), { origine: undefined }));
    const b = N.ligneNouvelle(Object.assign(ent(PESEE), { origine: { saisie: 'ciqual' } }));
    const c = N.ligneNouvelle(Object.assign(ent(PESEE), { origine: { saisie: 'scan', origine: 'off' } }));
    const d = N.ligneNouvelle(ent({ mode: 'pesee', fiche: { base: 'g', p100: { kcal: 360 } }, quantite: { val: 150, unite: 'g' } }));
    return a.erreur === 'PROVENANCE_ABSENTE' && b.erreur === 'PROVENANCE_ABSENTE' && c.erreur === 'PROVENANCE_INCONNUE' &&
      d.erreur === 'FICHE_SANS_PROVENANCE' || J([a, b, c, d]);
  });
  essai('B-NV2-E ⑥ ⛔ id trop court, date impossible (30/02), date à la française, nom ou repas vides : REFUS', () => {
    const r = [ent({ id: 'abc' }), ent({ date: '2026-02-30' }), ent({ date: '22/10/2026' }), ent({ nom: '  ' }), ent({ repas: '' })]
      .map((e) => N.ligneNouvelle(Object.assign(e, PESEE)));
    return J(r.map((x) => x.erreur)) === J(['ID_INVALIDE', 'DATE_INVALIDE', 'DATE_INVALIDE', 'NOM_ABSENT', 'REPAS_ABSENT']) || J(r);
  });
  essai('B-NV2-E ⑦ des ml restent des ml (q 330, u « ml », fiche pour 100 ml)', () => {
    const r = N.ligneNouvelle(ent({ nom: 'Cola fictif', origine: { saisie: 'code-tape', origine: 'off' }, mode: 'pesee',
      fiche: { base: 'ml', p100: { kcal: 42, prot: 0, carbs: 10.6, fat: 0 }, cle: '3000000000024', source: 'off', fiab: 'source' },
      quantite: { val: 330, unite: 'ml' } }));
    return r.ok && r.ligne.q === 330 && r.ligne.u === 'ml' && r.ligne.n2.f.base === 'ml' && r.ligne.kcal === 139 || J(r);
  });
  essai('B-NV2-E ⑧ ⭐ « 2 steaks » restent 2 portions (`ft-v1186`) : q 2, u portion, libellé, 125 g la portion — 250 g nulle part', () => {
    const r = N.ligneNouvelle(ent({ nom: 'Steak fictif', origine: { saisie: 'ciqual', origine: 'ciqual' }, mode: 'pesee',
      fiche: { base: 'g', p100: { kcal: 129, prot: 20, carbs: 0, fat: 5 }, source: 'ciqual', fiab: 'source' },
      quantite: { val: 2, unite: 'portion', portion: { libelle: 'steak', poids: 125, unite: 'g' } } }));
    const L = r.ligne;
    const plats = r.ok ? Object.keys(L).filter((k) => k !== 'n2').map((k) => L[k]) : [];
    return r.ok && L.q === 2 && L.u === 'portion' && L.portionLabel === 'steak' && L.portionWeightG === 125 && L.kcal === 323 &&
      plats.indexOf(250) < 0 && J(L.n2).indexOf('250') < 0 || J(r);
  });
  essai('B-NV2-E ⑨ ⛔ une quantité en portions SANS libellé : REFUS (le libellé n\'est jamais deviné, `ft-v1186` ①)', () => {
    const r = N.ligneNouvelle(ent({ mode: 'pesee', fiche: RIZ, quantite: { val: 2, unite: 'portion', portion: { poids: 125, unite: 'g' } } }));
    return !r.ok && r.erreur === 'PORTION_SANS_LIBELLE' || J(r);
  });
  essai('B-NV2-E ⑩ ⭐ une correction à la main (30 g de protéines) est appliquée et TRACÉE (valeur calculée d\'avant : 11)', () => {
    const r = N.ligneNouvelle(ent(Object.assign({ corrections: [{ c: 'prot', v: 30, le: 1761120000500 }] }, PESEE_DECL)));
    return r.ok && r.ligne.prot === 30 && J(r.ligne.n2.corr) === J([{ c: 'prot', v: 30, avant: 11, le: 1761120000500 }]) &&
      r.ligne.n2.no.length === 0 && r.ligne.kcal === 540 || J(r);
  });
  essai('B-NV2-E ⑩b ⭐⭐ NUT-VERROU-01 : la MÊME correction sur la fiche IDENTIFIÉE (CIQUAL) est REFUSÉE (FICHE_VERROUILLEE), aucune ligne', () => {
    const r = N.ligneNouvelle(ent(Object.assign({ corrections: [{ c: 'prot', v: 30, le: 1761120000500 }] }, PESEE)));
    return !r.ok && r.erreur === 'FICHE_VERROUILLEE' && !('ligne' in r) || J(r);
  });
  essai('B-NV2-E ⑪ ⭐⭐ la quantité change (200 g) : la correction RESTE, le reste est recalculé, la ligne le signale', () => {
    const r = N.ligneNouvelle(ent({ mode: 'pesee', fiche: RIZ_DECL, quantite: { val: 200, unite: 'g' },
      corrections: [{ c: 'prot', v: 30, avant: 11, le: 1761120000500 }] }));
    return r.ok && r.ligne.prot === 30 && r.ligne.kcal === 720 && r.ligne.carbs === 158 &&
      r.ligne.n2.no.indexOf('correction-a-revoir') >= 0 && r.ligne.n2.corr[0].avant === 11 || J(r);
  });
  essai('B-NV2-E ⑫ ⛔ correction invalide (champ inconnu, négative, deux fois le même champ) : REFUS', () => {
    const r = [[{ c: 'sel', v: 1, le: 1 }], [{ c: 'prot', v: -1, le: 1 }], [{ c: 'prot', v: 1, le: 1 }, { c: 'prot', v: 2, le: 2 }]]
      .map((c) => N.ligneNouvelle(ent(Object.assign({ corrections: c }, PESEE_DECL))));
    return r.every((x) => !x.ok && x.erreur === 'CORRECTION_INVALIDE') || J(r);
  });
  essai('B-NV2-E ⑬ une ligne DÉCLARÉE (400 g, 800 kcal) : valeurs telles quelles, pas de fiche, macros inconnues ABSENTES', () => {
    const r = N.ligneNouvelle(ent({ nom: 'Repas au restaurant', origine: { saisie: 'manuel', origine: 'utilisateur' }, mode: 'declaree',
      declare: { kcal: 800 }, quantite: { val: 400, unite: 'g' } }));
    const L = r.ligne;
    return r.ok && L.kcal === 800 && !('prot' in L) && !('carbs' in L) && !('fat' in L) && L.per100 === null && L.sourceId === null &&
      L.q === 400 && L.u === 'g' && L.n2.m === 'd' && L.n2.st === 'declaree' && J(L.n2.manque) === J(['prot', 'carbs', 'fat']) || J(r);
  });
  essai('B-NV2-E ⑬b ⛔ D-099 : « 1 assiette » SANS poids n\'est pas une quantité — refus, en déclarée comme en pesée', () => {
    const a = N.ligneNouvelle(ent({ mode: 'declaree', declare: { kcal: 800 }, quantite: { val: 1, unite: 'portion', portion: { libelle: 'assiette' } } }));
    const b = N.ligneNouvelle(ent({ mode: 'pesee', fiche: RIZ, quantite: { val: 1, unite: 'portion', portion: { libelle: 'bol' } } }));
    return !a.ok && a.erreur === 'PORTION_SANS_POIDS' && !b.ok && b.erreur === 'PORTION_SANS_POIDS' || J([a, b]);
  });
  essai('B-NV2-E ⑭ ⛔ une ligne déclarée SANS quantité, ou à 0 : REFUS (garde-fou du 10/09 : une quantité réellement choisie)', () => {
    const r = [ent({ mode: 'declaree', declare: { kcal: 800 } }),
               ent({ mode: 'declaree', declare: { kcal: 800 }, quantite: { val: 0, unite: 'g' } })].map(N.ligneNouvelle);
    return r.every((x) => !x.ok && x.erreur === 'QUANTITE_INVALIDE') || J(r);
  });
  essai('B-NV2-E ⑮ le nom est coupé à 80 caractères (comme V1), le mode inconnu est refusé', () => {
    const a = N.ligneNouvelle(ent(Object.assign({ nom: 'x'.repeat(100) }, PESEE)));
    const b = N.ligneNouvelle(ent({ mode: 'devine', fiche: RIZ, quantite: { val: 1, unite: 'g' } }));
    return a.ok && a.ligne.name.length === 80 && !b.ok && b.erreur === 'MODE_INCONNU' || J([a, b]);
  });
  /* ── Jalon 4 : ce dont les écrans ont besoin ── */
  essai('B-NV2-E ⑯ les notes de l\'appelant : liste FERMÉE (« reprise-non-verifiee » acceptée, une autre ou un texte : refus)', () => {
    const a = N.ligneNouvelle(ent(Object.assign({ notes: ['reprise-non-verifiee'] }, PESEE)));
    const b = N.ligneNouvelle(ent(Object.assign({ notes: ['comme-je-veux'] }, PESEE)));
    const c = N.ligneNouvelle(ent(Object.assign({ notes: 'reprise-non-verifiee' }, PESEE)));
    return a.ok && a.ligne.n2.no.indexOf('reprise-non-verifiee') >= 0 && b.erreur === 'NOTE_INVALIDE' && c.erreur === 'NOTE_INVALIDE' || J([a, b, c]);
  });
  essai('B-NV2-E ⑰ ⛔⛔ une modification CONSERVÉE : une ancienne ligne remplacée garde sa copie intégrale (n2.av), et ne remplace qu\'ELLE-MÊME', () => {
    const vieille = geler({ id: 'vieille-0001', date: '2026-09-01', meal: 'diner', name: 'Pâtes du soir', kcal: 510, prot: 18, carbs: 102, fat: 3,
                            ts: 1756720000000, v: 1, saisie: 'scan', origine: 'off', q: 140, u: 'g', per100: { kcal: 364, prot: 13, carbs: 73, fat: 2 },
                            modifie: false, fiab: { etat: 'NON_RESOLU' } });
    const avant = J(vieille);
    const a = N.ligneNouvelle(Object.assign(ent(PESEE), { id: 'vieille-0001', remplace: vieille }));
    const b = N.ligneNouvelle(Object.assign(ent(PESEE), { id: 'autre-ligne-01', remplace: vieille }));
    const v2 = N.ligneNouvelle(ent(PESEE)).ligne;
    const c = N.ligneNouvelle(Object.assign(ent(PESEE), { remplace: v2 }));
    return a.ok && J(a.ligne.n2.av) === avant && a.ligne.n2.av !== vieille && J(vieille) === avant &&
      b.erreur === 'REMPLACE_AUTRE_LIGNE' && c.ok && !('av' in c.ligne.n2) || J([a.ligne && a.ligne.n2, b, c.ligne && c.ligne.n2]);
  });
  essai('B-NV2-E ⑱ le nom de l\'aliment de la fiche est gardé (n2.f.lib) — et seulement s\'il est donné', () => {
    const a = N.ligneNouvelle(ent({ nom: 'Mon riz', mode: 'pesee', fiche: Object.assign({}, RIZ, { libelle: 'Riz blanc, cuit' }), quantite: { val: 150, unite: 'g' } }));
    const b = N.ligneNouvelle(ent(PESEE));
    return a.ok && a.ligne.n2.f.lib === 'Riz blanc, cuit' && a.ligne.name === 'Mon riz' && b.ok && !('lib' in b.ligne.n2.f) || J([a, b]);
  });
  essai('B-NV2-E ⑲ la trace du résolveur suit la ligne (champ `fiab` de V1) — liste BLANCHE, copiée, rien d\'autre', () => {
    const tr = { etat: 'NON_RESOLU', methode: 'observation', brut: 48, retenu: 48, confiance: 'source', secret: 'ne-doit-pas-passer' };
    const a = N.ligneNouvelle(ent(Object.assign({ trace: tr }, PESEE)));
    const b = N.ligneNouvelle(ent(Object.assign({ trace: 'NON_RESOLU' }, PESEE)));
    return a.ok && J(a.ligne.fiab) === J({ etat: 'NON_RESOLU', methode: 'observation', brut: 48, retenu: 48, confiance: 'source' }) &&
      a.ligne.fiab !== tr && b.erreur === 'TRACE_INVALIDE' && !('fiab' in N.ligneNouvelle(ent(PESEE)).ligne) || J([a.ligne && a.ligne.fiab, b]);
  });
  essai('B-NV2-E ⑳ les signaux de saisie de V1 sont gardés tels quels (code douteux, doute d\'enseigne coupé à 90, kcal dérivées)', () => {
    const a = N.ligneNouvelle(ent(Object.assign({ signaux: { codeDouteux: true, doute: 'd'.repeat(120), kcalDerivee: true } }, PESEE)));
    const b = N.ligneNouvelle(ent(Object.assign({ signaux: { codeDouteux: 'oui', kcalDerivee: 1 } }, PESEE)));
    return a.ok && a.ligne.codeDouteux === true && a.ligne.kcalDerivee === true && a.ligne.doute.length === 90 &&
      b.ok && !('codeDouteux' in b.ligne) && !('kcalDerivee' in b.ligne) || J([a.ligne, b.ligne]);
  });
  /* Incident du 23/10 (D-101 ④) : la 1ʳᵉ modification faisait d'une ancienne ligne une ligne V2 — et la 2ᵉ ne recopiait plus
     sa copie d'origine (mesuré à l'écran, B-NV2P P15 ㉘). */
  essai('B-NV2-E ㉑ ⛔⛔ la copie d\'origine SURVIT aux modifications suivantes : 2ᵉ et 3ᵉ remplacement, `n2.av` est toujours l\'ancienne ligne, COPIÉE (jamais partagée, jamais la version intermédiaire)', () => {
    const vieille = geler({ id: 'vieille-0002', date: '2026-09-02', meal: 'collation', name: 'Iso fictif', kcal: 156, prot: 26, carbs: 1, fat: 1,
                            ts: 1756800000000, v: 1, saisie: 'liste', origine: 'reprise', q: 40, u: 'g', per100: null });
    const avant = J(vieille);
    const a = N.ligneNouvelle(Object.assign(ent(PESEE), { id: 'vieille-0002', remplace: vieille }));
    const b = a.ok ? N.ligneNouvelle(Object.assign(ent(PESEE), { id: 'vieille-0002', remplace: a.ligne })) : a;
    const c = b.ok ? N.ligneNouvelle(Object.assign(ent(PESEE), { id: 'vieille-0002', remplace: b.ligne })) : b;
    return a.ok && b.ok && c.ok && J(b.ligne.n2.av) === avant && J(c.ligne.n2.av) === avant
      && b.ligne.n2.av !== a.ligne.n2.av && c.ligne.n2.av !== b.ligne.n2.av && b.ligne.n2.av.saisie === 'liste' && J(vieille) === avant
      || J([a.ligne && a.ligne.n2, b.ligne && b.ligne.n2, c.ligne && c.ligne.n2]);
  });

  console.log('\n═══ B-NV2-A. L\'ADAPTATEUR DES ANCIENNES LIGNES — LECTURE SEULE ═══');
  /* Des lignes FICTIVES, une par génération du format (docs/NUTRITION-V2-ARCHITECTURE.md §3.2), GELÉES. */
  const G = geler({
    G0: { date: '2026-07-08', meal: 'diner', name: 'Plat maison fictif', kcal: 820, prot: 45, carbs: 85, fat: 28, ts: 1751990000000 },
    G1: { id: 'g1-aaaaaaaa', date: '2026-08-20', meal: 'collation', name: 'Barre fictive', kcal: 210, prot: 4, carbs: 30, fat: 8,
          ts: 1755690000000, v: 1, saisie: 'scan', origine: 'off', q: 45, u: 'g', etat: 'tel-que-vendu', sourceId: '3000000000017',
          per100: { kcal: 467, prot: 9, carbs: 67, fat: 18 }, modifie: false },
    G2: { id: 'g2-bbbbbbbb', date: '2026-09-01', meal: 'dejeuner', name: 'Pâtes sèches, standard, crues', kcal: 510, prot: 18, carbs: 102, fat: 3,
          ts: 1756720000000, v: 1, saisie: 'ciqual', origine: 'ciqual', q: 140, u: 'g', etat: null, sourceId: 'ciqual:9810',
          per100: { kcal: 364, prot: 13, carbs: 73, fat: 2 }, modifie: true },
    G3: { id: 'g3-cccccccc', date: '2026-09-05', meal: 'collation2', name: 'Banane fictive', kcal: 106, prot: 1, carbs: 24, fat: 0,
          ts: 1757070000000, v: 1, saisie: 'liste', origine: 'reprise', q: null, u: null, etat: null, sourceId: null, per100: null, modifie: false },
    G4: { id: 'g4-dddddddd', date: '2026-09-09', meal: 'diner', name: 'Steak fictif', kcal: 323, prot: 50, carbs: 0, fat: 13,
          ts: 1757440000000, v: 1, saisie: 'manuel', origine: 'utilisateur', q: 2, u: 'portion', portionLabel: 'steak', portionWeightG: 125,
          etat: null, sourceId: null, per100: { kcal: 129, prot: 20, carbs: 0, fat: 5 }, modifie: false },
    G4b: { id: 'g4-eeeeeeee', date: '2026-09-02', meal: 'petitdej', name: 'Dose fictive', kcal: 156, prot: 26, carbs: 1, fat: 1,
           ts: 1756800000000, v: 1, saisie: 'liste', origine: 'reprise', q: 1, u: 'portion', etat: null, sourceId: null, per100: null, modifie: false },
    G7: { id: 'g7-ffffffff', date: '2026-10-20', meal: 'petitdej', name: 'Dose fictive', kcal: 156, prot: 26, carbs: 1, fat: 1,
          ts: 1760940000000, v: 1, saisie: 'liste', origine: 'reprise', q: 5, u: 'g', etat: null, sourceId: null, per100: null, modifie: false },
    G8: { id: 'g8-gggggggg', date: '2026-10-21', meal: 'collation', name: 'Fiche enregistrée comme mangée', kcal: 364, prot: 13, carbs: 73, fat: 2,
          ts: 1761030000000, v: 1, saisie: 'ciqual', origine: 'ciqual', q: null, u: null, etat: null, sourceId: 'ciqual:9810',
          per100: { kcal: 364, prot: 13.1, carbs: 72.7, fat: 1.6 }, modifie: false },
    F7: { id: 'f7-hhhhhhhh', date: '2026-08-10', meal: 'midi', name: 'Quantité sans unité', kcal: 300, prot: 10, carbs: 40, fat: 10,
          ts: 1754820000000, v: 1, saisie: 'manuel', origine: 'utilisateur', q: 120, etat: null, sourceId: null, per100: null },
    BRUNCH: { id: 'br-iiiiiiii', date: '2026-10-11', meal: 'brunch', name: 'Repas d\'une collation renommée', kcal: 500, prot: 20, carbs: 60, fat: 15,
              ts: 1760180000000, v: 1, saisie: 'manuel', origine: 'utilisateur', q: null, u: null, per100: null },
    SANSREPAS: { id: 'sr-jjjjjjjj', date: '2026-10-12', name: 'Sans repas', kcal: 100, prot: 1, carbs: 20, fat: 1, ts: 1760260000000, v: 1 },
    ILLISIBLE: { id: 'il-kkkkkkkk', date: '2026-10-13', meal: 'diner', name: 'Valeur illisible', kcal: 'abc', prot: 10, carbs: 20, fat: 5,
                 ts: 1760350000000, v: 1, saisie: 'manuel', origine: 'utilisateur', q: 200, u: 'g', per100: null },
    VERIF: { id: 've-llllllll', date: '2026-10-14', meal: 'dejeuner', name: 'Pâtes sèches, standard, crues', kcal: 510, prot: 18, carbs: 102, fat: 2,
             ts: 1760430000000, v: 1, saisie: 'ciqual', origine: 'ciqual', q: 140, u: 'g', etat: null, sourceId: 'ciqual:9810',
             per100: { kcal: 364, prot: 13.1, carbs: 72.7, fat: 1.6 }, modifie: true },
    FABRIQUEE: { id: 'fa-mmmmmmmm', date: '2026-10-15', meal: 'dejeuner', name: 'Pâtes sèches, standard, crues', kcal: 420, prot: 14, carbs: 84, fat: 1,
                 ts: 1760520000000, v: 1, saisie: 'historique', origine: 'reprise', q: 140, u: 'g', etat: null, sourceId: 'ciqual:9810',
                 per100: { kcal: 300, prot: 10, carbs: 60, fat: 1 }, modifie: true },
    TAPEE: { id: 'ta-nnnnnnnn', date: '2026-10-16', meal: 'dejeuner', name: 'Pâtes sèches, standard, crues', kcal: 600, prot: 18, carbs: 102, fat: 2,
             ts: 1760610000000, v: 1, saisie: 'ciqual', origine: 'ciqual', q: 140, u: 'g', etat: null, sourceId: 'ciqual:9810',
             per100: { kcal: 364, prot: 13.1, carbs: 72.7, fat: 1.6 }, modifie: true },
    NULLS: { id: 'nu-oooooooo', date: '2026-10-17', meal: 'diner', name: 'Brochette de volaille, crue', kcal: 0, prot: 36, carbs: 2, fat: 0,
             ts: 1760700000000, v: 1, saisie: 'ciqual', origine: 'ciqual', q: 200, u: 'g', etat: null, sourceId: 'ciqual:25504',
             per100: { kcal: 0, prot: 18, carbs: 0.8, fat: 0 }, modifie: false }
  });
  const AVANT = J(G);
  const V = {};
  let crash = '';
  try { Object.keys(G).forEach((k) => { V[k] = N.lireAncienne(G[k], ctx); }); } catch (e) { crash = e && e.message; }
  t('B-NV2-A ① ⛔⛔ lire 16 anciennes lignes GELÉES ne lève pas (aucune écriture tentée) et ne change pas un octet', !crash && J(G) === AVANT,
    crash || 'les lignes ont changé');
  essai('B-NV2-A ② ⛔⛔ les valeurs de la vue = les valeurs ENREGISTRÉES, au chiffre près, pour chaque ligne lisible', () => {
    const faux = Object.keys(G).filter((k) => k !== 'ILLISIBLE').filter((k) => {
      const v = V[k].vue.valeurs, l = G[k];
      return ['kcal', 'prot', 'carbs', 'fat'].some((c) => v[c] !== l[c]);
    });
    return faux.length === 0 || 'différentes : ' + faux.join(', ');
  });
  essai('B-NV2-A ③ la vue ne partage AUCUN objet avec la ligne (la modifier ne touche pas l\'original)', () => {
    const l = JSON.parse(J(G.VERIF)); const v = N.lireAncienne(l, ctx).vue;
    v.ficheNotee.p100.kcal = 1; v.valeurs.kcal = 1; v.provenance.saisie = 'x';
    return l.per100.kcal === 364 && l.kcal === 510 && l.saisie === 'ciqual' || J(l);
  });
  essai('B-NV2-A ④ ⛔ G0 (avant `ft-v907`) : lue telle quelle, sans id ni version, sans quantité — rien d\'inventé', () => {
    const v = V.G0.vue;
    return V.G0.ok && v.id === null && v.qteNotee === null && v.ficheNotee === null && v.recalculable === false &&
      ['sans-id', 'sans-version', 'sans-quantite'].every((n) => v.notes.indexOf(n) >= 0) && v.repas === 'diner' || J(V.G0);
  });
  essai('B-NV2-A ⑤ ⛔ quantité absente (G3) : AUCUNE quantité inventée ; unité absente (F7) : jamais « g »', () => {
    const a = V.G3.vue, b = V.F7.vue;
    return a.qteNotee === null && a.notes.indexOf('sans-quantite') >= 0 &&
      b.qteNotee && b.qteNotee.val === 120 && b.qteNotee.unite === null && b.notes.indexOf('quantite-sans-unite') >= 0 || J([a, b]);
  });
  essai('B-NV2-A ⑥ ⛔ fiche sans quantité (G8, la fiche enregistrée comme mangée) : fiche notée, AUCUNE quantité (l\'ancien moteur écrivait 205 g)', () => {
    const v = V.G8.vue;
    return v.qteNotee === null && v.ficheNotee && v.ficheNotee.p100.kcal === 364 && v.notes.indexOf('fiche-sans-quantite') >= 0 &&
      v.recalculable === false || J(v);
  });
  essai('B-NV2-A ⑦ ⛔ « 1 portion » sans poids (G4b) reste UNE PORTION SANS POIDS ; « 2 steaks » pesés (G4) gardent libellé et poids', () => {
    const a = V.G4b.vue, b = V.G4.vue;
    return a.qteNotee.unite === 'portion' && a.qteNotee.val === 1 && a.qteNotee.portion.poids === null &&
      a.notes.indexOf('portion-sans-poids') >= 0 && b.qteNotee.val === 2 && b.qteNotee.portion.libelle === 'steak' &&
      b.qteNotee.portion.poids === 125 && b.notes.indexOf('portion-sans-poids') < 0 || J([a, b]);
  });
  essai('B-NV2-A ⑧ ⛔ signature M6 (G7 : 5 g, sans fiche) : quantité NOTÉE, jamais utilisée, ligne non recalculable', () => {
    const v = V.G7.vue;
    return v.qteNotee.val === 5 && v.qteNotee.unite === 'g' && v.ficheNotee === null && v.notes.indexOf('quantite-sans-fiche') >= 0 &&
      v.recalculable === false || J(v);
  });
  essai('B-NV2-A ⑨ ⛔ repas inconnu (« brunch ») et ancien (« midi ») gardés tels quels ; repas absent : null + noté, jamais « déjeuner »', () => {
    return V.BRUNCH.vue.repas === 'brunch' && V.F7.vue.repas === 'midi' && V.SANSREPAS.vue.repas === null &&
      V.SANSREPAS.vue.notes.indexOf('repas-absent') >= 0 || J([V.BRUNCH.vue.repas, V.F7.vue.repas, V.SANSREPAS.vue]);
  });
  essai('B-NV2-A ⑩ ⛔ une valeur illisible devient ABSENTE et notée, jamais 0', () => {
    const v = V.ILLISIBLE.vue;
    return !('kcal' in v.valeurs) && v.valeurs.prot === 10 && v.notes.indexOf('valeur-illisible:kcal') >= 0 || J(v);
  });
  essai('B-NV2-A ⑪ ⭐ fiche retrouvée À L\'IDENTIQUE dans CIQUAL 9810 et valeurs exactes : recalculable (seul cas)', () => {
    const v = V.VERIF.vue;
    return v.recalculable === true && v.notes.indexOf('fiche-non-verifiee') < 0 || J(v);
  });
  essai('B-NV2-A ⑫ ⛔ fiche arrondie de l\'époque (G2), fiche fabriquée, valeurs tapées à côté, fiche CIQUAL incomplète, code-barres : NON recalculables', () => {
    const ks = ['G2', 'FABRIQUEE', 'TAPEE', 'NULLS', 'G1'];
    const faux = ks.filter((k) => V[k].vue.recalculable !== false || V[k].vue.notes.indexOf('fiche-non-verifiee') < 0);
    return faux.length === 0 || 'recalculables à tort : ' + faux.join(', ');
  });
  essai('B-NV2-A ⑬ la provenance ancienne se lit (« scan », « tel-que-vendu », code-barres) sans être réécrite', () => {
    const p = V.G1.vue.provenance;
    return p.saisie === 'scan' && p.origine === 'off' && p.etat === 'tel-que-vendu' && p.sourceId === '3000000000017' && p.v === 1 || J(p);
  });
  essai('B-NV2-A ⑭ ⭐ une ligne recalculable repasse par LE calcul : mêmes chiffres à 140 g, 728 · 26 · 145 · 3 à 200 g', () => {
    const f = N.ficheVerifiee(V.VERIF.vue);
    const a = N.calcule(f, { val: 140, unite: 'g' }), b = N.calcule(f, { val: 200, unite: 'g' });
    return a.ok && J(a.valeurs) === J({ kcal: 510, prot: 18, carbs: 102, fat: 2 }) &&
      b.ok && J(b.valeurs) === J({ kcal: 728, prot: 26, carbs: 145, fat: 3 }) || J([a, b]);
  });
  essai('B-NV2-A ⑮ ⛔ une ligne NON recalculable n\'a pas de fiche à prêter (null) : on ne recalcule jamais une fiche non vérifiée', () => {
    return ['G2', 'FABRIQUEE', 'G7', 'G0', 'G4'].every((k) => N.ficheVerifiee(V[k].vue) === null) || 'une fiche non vérifiée a été prêtée';
  });

  console.log('\n═══ B-NV2-G. TOUT UN JOURNAL EN LECTURE : rien de perdu, rien de déplacé ═══');
  const LISTE = geler([G.G0, G.G1, null, G.G2, 'texte', G.G3, 42, G.G4, G.G4b, [], G.G7, G.G8, G.F7, G.BRUNCH, G.SANSREPAS,
                       G.ILLISIBLE, G.VERIF, G.FABRIQUEE, G.TAPEE, G.NULLS, G.G0]);
  const AV2 = J(LISTE);
  let LJ, crash2 = '';
  try { LJ = N.lireJournal(LISTE, ctx); } catch (e) { crash2 = e && e.message; }
  essai('B-NV2-G ① ⛔⛔ une vue par ligne, DANS L\'ORDRE : 21 entrées → 21 vues, les illisibles comprises (aucune ne disparaît)', () => {
    if (crash2) return 'a levé : ' + crash2;
    const enEchec = LJ.vues.map((v, i) => v.ok ? -1 : i).filter((i) => i >= 0);
    return LJ.ok && LJ.vues.length === LISTE.length && J(enEchec) === J([2, 4, 6, 9]) &&
      LJ.vues[0].vue.nom === G.G0.name && LJ.vues[20].vue.nom === G.G0.name || J(LJ && LJ.vues.map((v) => v.ok));
  });
  essai('B-NV2-G ② ⛔ deux copies identiques (G0 ×2, sans id) restent DEUX vues (un doublon vaut mieux qu\'une perte)', () => {
    return LJ.vues.filter((v) => v.ok && v.vue.nom === G.G0.name && v.vue.ts === G.G0.ts).length === 2 || 'doublon fusionné';
  });
  t('B-NV2-G ③ ⛔⛔ le journal entier n\'a pas changé d\'un octet', J(LISTE) === AV2, 'le journal a changé');
  essai('B-NV2-G ④ dates et repas de chaque vue = ceux de la ligne (aucun déplacement)', () => {
    const faux = LJ.vues.filter((v, i) => v.ok && (v.vue.date !== LISTE[i].date || v.vue.repas !== (LISTE[i].meal || null)));
    return faux.length === 0 || faux.length + ' déplacée(s)';
  });
  essai('B-NV2-G ⑤ ⛔ un journal qui n\'est pas une liste : échec dit, aucune vue inventée', () => {
    const r = N.lireJournal({ a: 1 }, ctx);
    return !r.ok && r.vues.length === 0 || J(r);
  });

  console.log('\n═══ B-NV2-R. CE QU\'UNE LIGNE PERMET DE REPRENDRE (jalon 4) — lecture seule ═══');
  const LV2 = N.ligneNouvelle(ent(PESEE)).ligne;
  const LV2C = N.ligneNouvelle(ent(Object.assign({ corrections: [{ c: 'kcal', v: 560, le: 1761120001000 }] }, PESEE_DECL))).ligne;
  const LV2P = N.ligneNouvelle(ent({ nom: 'Steak fictif', mode: 'pesee',
    fiche: { base: 'g', p100: { kcal: 129, prot: 20, carbs: 0, fat: 5 }, source: 'utilisateur', fiab: 'declaree' },
    quantite: { val: 2, unite: 'portion', origine: 'portion', portion: { libelle: 'steak', poids: 125, unite: 'g' } } })).ligne;
  const LV2D = N.ligneNouvelle(ent({ nom: 'Plat fictif', mode: 'declaree', declare: { kcal: 450, prot: 20 }, quantite: { val: 300, unite: 'g' } })).ligne;
  geler([LV2, LV2C, LV2P, LV2D]);
  const AV_R = J([LV2, LV2C, LV2P, LV2D, G]);
  essai('B-NV2-R ① une ligne V2 pesée rend SA fiche et SA quantité (attendus à la main : riz 360/7,4/79/0,6 · 150 g · 540/11/119/1)', () => {
    const r = N.reprise(LV2, ctx);
    return r.ok && r.statut === 'v2' && r.mode === 'p' &&
      J(r.fiche) === J({ base: 'g', p100: { kcal: 360, prot: 7.4, carbs: 79, fat: 0.6 }, cle: 'ciqual:9999', source: 'ciqual', version: null, fiab: 'source', etat: null }) &&
      J(r.quantite) === J({ val: 150, unite: 'g' }) && J(r.valeurs) === J({ kcal: 540, prot: 11, carbs: 119, fat: 1 }) || J(r);
  });
  essai('B-NV2-R ② une correction à la main suit la reprise (c, v, avant, le)', () => {
    const r = N.reprise(LV2C, ctx);
    return r.ok && J(r.corrections) === J([{ c: 'kcal', v: 560, avant: 540, le: 1761120001000 }]) && r.valeurs.kcal === 560 || J(r);
  });
  essai('B-NV2-R ③ une portion V2 rend « 2 × steak de 125 g » (nom ET poids), jamais « 250 g »', () => {
    const r = N.reprise(LV2P, ctx);
    return r.ok && J(r.quantite) === J({ val: 2, unite: 'portion', portion: { libelle: 'steak', poids: 125, unite: 'g' } }) || J(r);
  });
  essai('B-NV2-R ④ une ligne V2 déclarée : pas de fiche (rien à recalculer), sa quantité, ses valeurs telles quelles', () => {
    const r = N.reprise(LV2D, ctx);
    return r.ok && r.mode === 'd' && r.fiche === null && J(r.quantite) === J({ val: 300, unite: 'g' }) && J(r.valeurs) === J({ kcal: 450, prot: 20 }) || J(r);
  });
  essai('B-NV2-R ⑤ une ancienne ligne VÉRIFIÉE (CIQUAL 9810 à l\'identique) rend la fiche CIQUAL et sa quantité', () => {
    const r = N.reprise(G.VERIF, ctx);
    return r.ok && r.statut === 'verifiee' && r.fiche && r.fiche.source === 'ciqual' && r.fiche.cle === 'ciqual:9810' &&
      J(r.fiche.p100) === J({ kcal: 364, prot: 13.1, carbs: 72.7, fat: 1.6 }) && J(r.quantite) === J({ val: 140, unite: 'g' }) || J(r);
  });
  essai('B-NV2-R ⑥ ⛔⛔ une ancienne ligne NON vérifiée ne prête AUCUNE fiche (scan d\'hier, pour-100 g fabriqué) : nom, valeurs, quantité notée', () => {
    const a = N.reprise(G.G1, ctx), b = N.reprise(G.FABRIQUEE, ctx);
    return a.ok && a.statut === 'non-verifiee' && a.fiche === null && J(a.quantite) === J({ val: 45, unite: 'g' }) &&
      J(a.valeurs) === J({ kcal: 210, prot: 4, carbs: 30, fat: 8 }) && b.ok && b.fiche === null || J([a, b]);
  });
  essai('B-NV2-R ⑦ ⛔⛔ une quantité absente, sans unité, ou « 1 portion » sans poids n\'est JAMAIS complétée (null)', () => {
    const r = ['G3', 'G4b', 'F7', 'G8', 'G0'].map((k) => N.reprise(G[k], ctx));
    return r.every((x) => x.ok && x.quantite === null) || J(r.map((x) => x.quantite));
  });
  essai('B-NV2-R ⑧ une ancienne portion AVEC nom et poids reste une portion (2 × steak de 125 g), sans fiche prêtée', () => {
    const r = N.reprise(G.G4, ctx);
    return r.ok && r.fiche === null && J(r.quantite) === J({ val: 2, unite: 'portion', portion: { libelle: 'steak', poids: 125, unite: 'g' } }) || J(r);
  });
  essai('B-NV2-R ⑨ ⛔ un n2 trafiqué (fiabilité inconnue, version autre) ne prête pas de fiche', () => {
    const faux = JSON.parse(J(LV2)); faux.n2.f.fiab = 'parfaite';
    const autre = JSON.parse(J(LV2)); autre.n2.s = 99;
    const a = N.reprise(faux, ctx), b = N.reprise(autre, ctx);
    return a.ok && a.fiche === null && b.ok && b.statut !== 'v2' && b.fiche === null || J([a, b]);
  });
  essai('B-NV2-R ⑩ ⛔⛔ la reprise ne touche à rien (lignes gelées, JSON identique) et ne rend que des COPIES', () => {
    const r = N.reprise(LV2, ctx);
    return J([LV2, LV2C, LV2P, LV2D, G]) === AV_R && r.fiche.p100 !== LV2.per100 && r.valeurs !== LV2 || 'une ligne a bougé ou un objet est partagé';
  });

  console.log('\n═══ B-NV2-P. PURETÉ : aucune entrée modifiée, même résultat à chaque appel ═══');
  essai('B-NV2-P ① le calcul et l\'écrivain ne touchent pas à ce qu\'on leur passe (entrées gelées, JSON identique)', () => {
    const e = geler(JSON.parse(J(ent(Object.assign({ corrections: [{ c: 'prot', v: 30, le: 1 }] }, PESEE_DECL)))));
    const av = J(e);
    N.calcule(e.fiche, e.quantite); N.ligneNouvelle(e);
    return J(e) === av || 'entrée modifiée';
  });
  essai('B-NV2-P ② déterminisme : deux appels, deux résultats identiques à l\'octet (écrivain et adaptateur)', () => {
    const a = J(N.ligneNouvelle(ent(PESEE))), b = J(N.ligneNouvelle(ent(PESEE)));
    const c = J(N.lireJournal(LISTE, ctx)), d = J(N.lireJournal(LISTE, ctx));
    return a === b && c === d || 'résultats différents';
  });
  essai('B-NV2-P ③ le moteur n\'expose que ses 7 fonctions (les 6 d\'origine + `verrouillee`, NUT-VERROU-01), gelé (rien ne peut le remplacer en cours de route)', () => {
    const k = Object.keys(N).sort().join(',');
    return Object.isFrozen(N) && k === 'CHAMPS,VERSION,calcule,ficheVerifiee,ligneNouvelle,lireAncienne,lireJournal,reprise,verrouillee' || k;
  });
  essai('B-NV2-P ④ ⛔ le fichier ne lit ni écran, ni stockage, ni réseau, ni horloge (aucune de ces API dans son code)', () => {
    const src = fs.readFileSync(CIBLE, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const interdits = ['document.', 'localStorage', 'sessionStorage', 'indexedDB', 'fetch(', 'XMLHttpRequest', 'Date.now', 'new Date()', 'S.foodLog', 'persist('];
    const trouves = interdits.filter((x) => src.indexOf(x) >= 0);
    return trouves.length === 0 || 'trouvé : ' + trouves.join(', ');
  });

  console.log('\n' + ok + ' OK / ' + ko.length + ' rouge');
  ko.forEach((k) => console.log('  rouge : ' + k));
  process.exit(ko.length ? 1 : 0);
})(); } catch (e) {
  console.error('CRASH : ' + (e && e.stack || e));
  console.log('\n0 OK / 1 rouge');
  process.exit(2);
}
