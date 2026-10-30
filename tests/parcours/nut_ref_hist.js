/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
   🧪 NUT-REF-HIST-01 (30/10/2026, ordre de Michel) — UNE ANCIENNE FICHE NUTRITIONNELLE ERRONÉE NE SERT PLUS À RECALCULER UNE NOUVELLE SAISIE.
   Bloc : B-NRH. Banc : tools/banc_nut_ref_hist.js · contrôle négatif : tools/mut_nut_ref_hist.py.

   INVARIANT : `fiab:'source'` est la provenance DÉCLARÉE d'une ancienne ligne, pas la preuve que son `per100` est juste. Une fiche
   historique n'est utilisable que si (1) ses valeurs passent les contrôles structurels et de cohérence (`_n2ControlerReference`, qui réutilise
   `_nrjPrecision` / `_nrjPlancher`) ET (2) pour qu'une AUTRE ligne s'en serve, une source indépendante la confirme (table CIQUAL par identifiant,
   réponse Open Food Facts du code-barres) — jamais une autre ligne du journal ni un favori de même `sourceId`.

   ⛔ L'oracle est écrit À LA MAIN. ⛔ Données INVENTÉES, aucune donnée réelle, aucun réseau (Open Food Facts est bouchonné dans la page).
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const J = (x) => JSON.stringify(x);

const NPV2 = { s: 1, m: 'p', st: 'fiable', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'off', ver: null, fiab: 'source', base: 'g' } };
const v2 = (id, name, sid, p100, q, extra) => Object.assign({ id: id, meal: 'collation', name: name, kcal: Math.round(p100.kcal * q / 100), prot: Math.round(p100.prot * q / 100), carbs: Math.round(p100.carbs * q / 100), fat: Math.round(p100.fat * q / 100),
  q: q, u: 'g', per100: p100, v: 1, saisie: 'code-tape', origine: 'off', sourceId: sid, etat: 'tel-que-vendu', n2: NPV2 }, extra || {});
const ancien = (id, name, sid, kcal, prot, carbs, fat, q) => ({ id: id, meal: 'collation', name: name, kcal: kcal, prot: prot, carbs: carbs, fat: fat, q: q, u: 'g', per100: null, v: 1, saisie: 'code-tape', origine: 'off', sourceId: sid, etat: null });

const EAN_S = '3000000000401', EAN_C = '3000000000402', EAN_Y1 = '3000000000501', EAN_Y2 = '3000000000502';
const LIGNES = [
  /* S1 : une ligne V2 « fiable » dont le pour-100 g est IMPOSSIBLE (65 kcal pour 20 g de protéines et 4 g de lipides : plancher 116) */
  v2('nrh-S1-00000001', 'Skyr suspect (test)', EAN_S, { kcal: 65, prot: 20, carbs: 2, fat: 4 }, 100),
  /* L1 : un ancien scan (sans fiche) du MÊME code-barres — c'est lui qui héritait de la fiche impossible */
  ancien('nrh-L1-00000002', 'Skyr ancien (test)', EAN_S, 130, 40, 4, 8, 200),
  /* C1 : une ligne V2 « fiable », pour-100 g cohérent (129 · 20 · 2 · 5), mais SANS preuve indépendante */
  v2('nrh-C1-00000003', 'Skyr cohérent (test)', EAN_C, { kcal: 129, prot: 20, carbs: 2, fat: 5 }, 100),
  ancien('nrh-L2-00000004', 'Skyr cohérent ancien (test)', EAN_C, 258, 40, 4, 10, 200),
  /* N : la saisie JUSTE (129 pour 100 g) du produit de S1 — l'incident du 25/10 : elle se faisait dire « à vérifier » par la fiche impossible */
  ancien('nrh-N-00000005', 'Skyr juste (test)', EAN_S, 129, 20, 2, 5, 100),
  /* deux produits de MÊME NOM, deux codes-barres */
  v2('nrh-Y1-00000006', 'Yaourt nature (test)', EAN_Y1, { kcal: 60, prot: 4, carbs: 6, fat: 2 }, 125),
  v2('nrh-Y2-00000007', 'Yaourt nature (test)', EAN_Y2, { kcal: 95, prot: 5, carbs: 10, fat: 4 }, 125),
  ancien('nrh-Y3-00000008', 'Yaourt nature (test)', EAN_Y1, 75, 5, 8, 3, 125),
  /* D1 : une fiche DÉCLARÉE par la personne (ses propres valeurs pour 100 g) — elle ne prétend à aucune source : hors de la frontière */
  v2('nrh-D1-00000009', 'Maison déclarée (test)', null, { kcal: 200, prot: 10, carbs: 20, fat: 8 }, 50,
    { origine: 'utilisateur', saisie: 'manuel', n2: { s: 1, m: 'p', st: 'declaree', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'utilisateur', ver: null, fiab: 'declaree', base: 'g' } } }),
  /* M1 : une fiche d'ENSEIGNE (table livrée avec l'app) — hors de la frontière « Open Food Facts » */
  v2('nrh-M1-00000010', 'Burger enseigne (test)', 'marque:test:burger', { kcal: 250, prot: 12, carbs: 24, fat: 11 }, 200,
    { origine: 'marque', saisie: 'marque', n2: { s: 1, m: 'p', st: 'fiable', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'marque', ver: null, fiab: 'source', base: 'g' } } }),
];

const BASE_FIX = `(() => { try {
  if (sessionStorage.getItem('__nrh')) return; sessionStorage.setItem('__nrh', '1');
  localStorage.clear();
  localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
  const pad = n => String(n).padStart(2,'0');
  const t = new Date(); t.setDate(t.getDate()-1); const hier = t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate());
  const L = __LIGNES__.map((x, i) => Object.assign({}, x, { date: hier, ts: 1760000000000 + i * 60000 }));
  localStorage.setItem('ft4_foodlog', JSON.stringify(L));
  localStorage.setItem('ft4_savedfoods', '[]');
} catch (e) {} })();`;

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
  console.log('\n-- B-NRH. Une ancienne fiche erronée ne sert plus à recalculer (vraies fonctions de l\'app) --');
  const { cx, pg, erreurs } = await ouvrirPage(b, PORT);
  const E = (f, a) => pg.evaluate(f, a);
  const ligne = (id) => E((i) => JSON.parse(JSON.stringify((S.foodLog || []).find((x) => x && x.id === i) || null)), id);
  const avant = await E(() => JSON.stringify([S.foodLog, S.savedFoods || [], S.hiddenFoods || []]));
  t('B-NRH P0 la page est prête avec 10 lignes inventées', (await E(() => (S.foodLog || []).length)) === 10);
  const ctl = (fiche, preuve) => E(([f, p]) => (typeof _n2ControlerReference === 'function') ? _n2ControlerReference(f, p) : { etat: 'ABSENT', raison: 'fonction absente' }, [fiche, preuve]);
  const F = (p100, base) => ({ base: base || 'g', p100: p100, source: 'off', fiab: 'source' });

  /* ── ① LE CONTRÔLE (fonction pure : aucune écriture) ── */
  const c1 = await ctl(F({ kcal: 65, prot: 20, carbs: 2, fat: 4 }), false);
  t('B-NRH C1 ⭐⭐ OFF historique 65 kcal · 20 g P · 4 g L : référence SUSPECTE (énergie impossible : le plancher des protéines et lipides seuls est de 116 kcal)', c1.etat === 'suspect' && c1.raison === 'energie_impossible', J(c1));
  const c2 = await ctl(F({ kcal: 129, prot: 20, carbs: 2, fat: 5 }), false), c2b = await ctl(F({ kcal: 129, prot: 20, carbs: 2, fat: 5 }), true);
  t('B-NRH C2 ⭐⭐ OFF historique 129 · 20 · 5 : cohérent, MAIS « non vérifiée » sans source indépendante ; « admissible » seulement avec une preuve', c2.etat === 'non_verifiee' && c2.raison === 'source_non_confirmee' && c2b.etat === 'admissible', J([c2, c2b]));
  const c3 = await ctl(F({ kcal: 300, prot: 20, carbs: 2, fat: 5 }), false);
  t('B-NRH C3 ⭐ des calories plausibles mais ERRONÉES (300 pour ces macros) passent la cohérence et restent « non vérifiée » — jamais « admissible » sur les seules macros', c3.etat === 'non_verifiee', J(c3));
  const c4 = await ctl(F({ prot: 20, carbs: 2, fat: 5 }), true), c4b = await ctl(F({ kcal: 0, prot: 0, carbs: 0, fat: 0 }), true), c4c = await ctl(F({ kcal: 0, prot: 20, carbs: 2, fat: 5 }), false);
  t('B-NRH C4 ⭐ calories ABSENTES = « non vérifiée » (jamais 0) ; un vrai zéro (eau : 0 · 0 · 0 · 0) est admissible avec preuve ; 0 kcal pour 20 g de protéines est impossible', c4.etat === 'non_verifiee' && c4.raison === 'energie_absente' && c4b.etat === 'admissible' && c4c.etat === 'suspect', J([c4, c4b, c4c]));
  const c5 = await ctl(F({ kcal: 129.4, prot: 20.1, carbs: 1.9, fat: 4.9 }), true), c5b = await ctl(F({ kcal: 116, prot: 20, carbs: 2, fat: 4 }), false), c5c = await ctl(F({ kcal: 115.6, prot: 20, carbs: 2, fat: 4 }), false);
  t('B-NRH C5 ⭐ décimales et tolérance DÉRIVÉE de la précision des chiffres (pas un seuil choisi) : 129,4 · 20,1 · 4,9 admissible ; pile au plancher (116) non suspect ; 115,6 (précision 0,1 : tolérance 0,5 + 4×0,5 + 9×0,5) non suspect', c5.etat === 'admissible' && c5b.etat !== 'suspect' && c5c.etat !== 'suspect', J([c5, c5b, c5c]));
  const c6 = await ctl(F({ kcal: -1, prot: 20, carbs: 2, fat: 5 }), true), c6b = await ctl(F({ kcal: 100, prot: NaN, carbs: 2, fat: 5 }), true), c6c = await ctl(F({ kcal: 100, prot: 'x', carbs: 2, fat: 5 }), true), c6d = await ctl(null, true), c6e = await ctl({ base: 'g' }, true);
  t('B-NRH C6 ⭐ valeurs négatives, non finies, textuelles ou fiche absente : « suspecte », même avec une preuve', [c6, c6b, c6c, c6d, c6e].every((x) => x.etat === 'suspect'), J([c6, c6b, c6c, c6d, c6e]));
  const c7 = await ctl(F({ kcal: 500, prot: 60, carbs: 30, fat: 20 }), false), c7b = await ctl(F({ kcal: 500, prot: 60, carbs: 30, fat: 20 }, 'ml'), false);
  t('B-NRH C7 ⭐ masse impossible en grammes (60 + 30 + 20 = 110 g pour 100 g) : suspecte ; en ml la somme ne prouve rien (densité inconnue)', c7.etat === 'suspect' && c7.raison === 'masse_impossible' && c7b.etat !== 'suspect', J([c7, c7b]));
  const c8 = await ctl(F({ kcal: 100, prot: 5, carbs: 20, fat: 1 }), false);
  t('B-NRH C8 ⭐ JAMAIS rejetée parce que les calories diffèrent de 4P + 4G + 9L (fibres, polyols, alcool, étiquetage : 100 kcal pour 5 · 20 · 1 → 109 « calculées ») : la formule est indicative, pas une preuve', c8.etat !== 'suspect', J(c8));
  const c8b = await ctl(F({ kcal: 83, prot: 0.1, carbs: 2.6, fat: 0 }), false), c8c = await ctl(F({ kcal: 70, prot: 0, carbs: 0, fat: 0 }), false);
  t('B-NRH C8b ⭐ idem pour l\'ALCOOL et les polyols : un vin à 83 kcal pour 0,1 · 2,6 · 0 g (la formule en donne 11) et 70 kcal sans aucune macro ne sont pas suspects — l\'énergie PLUS HAUTE que la formule n\'est jamais une preuve d\'erreur', c8b.etat !== 'suspect' && c8c.etat !== 'suspect', J([c8b, c8c]));
  const c9 = await ctl(F({ kcal: 0, prot: 0.1, carbs: 0, fat: 0.1 }, 'g'), true), c9b = await ctl(F({ kcal: 0, prot: 0.1, carbs: 0, fat: 0.1 }, 'g'), false);
  t('B-NRH C9 ⭐ une SOURCE indépendante fait foi sur l\'arithmétique : l\'entrée « Cola sans sucres » de la table CIQUAL (0 kcal · 0,1 · 0,1 — plancher 1,3, tolérance 1,15) reste admissible AVEC preuve ; la même copie sans preuve est suspecte', c9.etat === 'admissible' && c9b.etat === 'suspect', J([c9, c9b]));

  /* ── ② LA FICHE D'IDENTITÉ : plus de copie du journal ── */
  const idS = await E((s) => { const f = _n2FicheIdentite({ sourceId: s }); const o = _n2FichesVerifiees(); return { fiche: f && f.p100, dans: !!o[s] }; }, EAN_S);
  t('B-NRH P1 ⭐⭐ la fiche impossible (65 kcal) d\'un code-barres n\'est PLUS rendue comme fiche d\'identité, ni rangée parmi les fiches vérifiées du journal', idS.fiche === null && idS.dans === false, J(idS));
  const idC = await E((s) => { const f = _n2FicheIdentite({ sourceId: s }); const o = _n2FichesVerifiees(); return { fiche: f && f.p100, preuve: o[s] ? o[s].preuve : 'absente' }; }, EAN_C);
  t('B-NRH P2 ⭐⭐ une copie COHÉRENTE d\'un code-barres n\'est pas non plus une fiche d\'identité (une autre ligne du journal n\'est pas une preuve indépendante) ; elle reste connue comme simple copie (`preuve:false`)', idC.fiche === null && idC.preuve === false, J(idC));
  const idY = await E(([a, b2]) => ({ a: _n2FicheIdentite({ sourceId: a }), b: _n2FicheIdentite({ sourceId: b2 }), cand: _n2Candidats({ name: 'Yaourt nature (test)' }).map((c) => c.sid).sort() }), [EAN_Y1, EAN_Y2]);
  t('B-NRH P3 ⭐ deux produits de MÊME NOM et de deux codes-barres ne sont jamais confondus : aucune fiche n\'est empruntée de l\'un à l\'autre, et les deux restent deux candidats distincts', idY.a === null && idY.b === null && J(idY.cand) === J([EAN_Y1, EAN_Y2]), J(idY));

  const cd = await E((s0) => { const d = _n2CandDecrire({ sid: s0 }); return { dispo: d.dispo, kcal: d.kcal }; }, EAN_C);
  t('B-NRH P3b ⭐ la proposition d\'un candidat « code-barres » (NIDT) n\'annonce plus comme « fiche du produit » la copie d\'une ligne du journal : pas de kcal/100 g affichés, « fiche à récupérer en ligne »', cd.dispo === false && cd.kcal === null, J(cd));

  /* ── ③ L'ÉCRAN D'AJOUT : reprise d'un ancien scan du même code-barres ── */
  const ouvrirAjout = async () => { await E(() => { openAddFood(); }); await pg.waitForTimeout(250); };
  const reprendre = (id) => E((i) => { const l = (S.foodLog || []).find((x) => x.id === i); const ok = _n2Reprendre(l, 'historique'); return { ok: ok, bc: !!_bcNutr, kcal100: _bcNutr && _bcNutr.kcal100, sid: !!(_afSrc && _afSrc.sourceId), fige: !!(_afRef && _afRef.fige) }; }, id);
  await ouvrirAjout();
  await E(() => { window._offFetchProduct = async () => null; });   // hors ligne : Open Food Facts ne répond pas
  const rL1 = await reprendre('nrh-L1-00000002'); await pg.waitForTimeout(300);
  t('B-NRH P4 ⭐⭐ reprise d\'un ancien scan du code-barres de la fiche IMPOSSIBLE (hors ligne) : l\'écran ne se construit PAS sur 65 kcal/100 g (pas de fiche calculable)', rL1.ok === true && rL1.bc === false, J(rL1));
  const rC = await reprendre('nrh-L2-00000004'); await pg.waitForTimeout(300);
  t('B-NRH P5 ⭐⭐ reprise d\'un ancien scan du code-barres d\'une copie cohérente mais NON vérifiée (hors ligne) : pas de fiche empruntée au journal non plus', rC.ok === true && rC.bc === false, J(rC));
  const incN = await E(() => { const l = (S.foodLog || []).find((x) => x.id === 'nrh-N-00000005'); const a = _n2Apercu(l); return { ok: a.ok, raison: a.raison && a.raison.code }; });
  t('B-NRH P6 ⭐⭐ l\'incident du 25/10 : la saisie JUSTE (129 kcal pour 100 g) du même produit n\'est plus déclarée « à vérifier » par la fiche impossible (65) — une copie erronée ne juge plus personne', incN.raison !== 'differe', J(incN));

  /* ── ④ L'ancienne ligne à fiche impossible, ses propres portes ── */
  const reaS = await E(() => { const l = (S.foodLog || []).find((x) => x.id === 'nrh-S1-00000001'); const n0 = S.foodLog.length; const r = _n2Reajouter(l, 'dejeuner', today(), 'test', null); const ap = _n2Apercu(l); return { ok: r.ok, incoherente: r.incoherente === true, code: r.raison && r.raison.code, texte: r.raison && r.raison.texte, n0: n0, n1: S.foodLog.length, apOk: ap.ok, apCode: ap.raison && ap.raison.code }; });
  t('B-NRH P7 ⭐⭐ « + Ajouter » / repas habituel / aperçu d\'une ligne à fiche impossible : RIEN n\'est écrit, la liste dit « à vérifier » avec la phrase de la règle (ancienne fiche non vérifiée…)',
    reaS.ok === false && reaS.incoherente === true && reaS.code === 'suspecte' && /Ancienne fiche non vérifiée/.test(reaS.texte || '') && /ne peuvent pas servir à recalculer/.test(reaS.texte || '') && reaS.n1 === reaS.n0 && reaS.apCode === 'suspecte', J(reaS));
  const favS = await E(() => { const l = (S.foodLog || []).find((x) => x.id === 'nrh-S1-00000001'); const f = _favDepuisLigne(l); const n0 = S.foodLog.length; const r = _n2Reajouter(f, 'dejeuner', today(), 'test', null); return { ok: r.ok, code: r.raison && r.raison.code, n0: n0, n1: S.foodLog.length }; });
  t('B-NRH P8 ⭐ un FAVORI pris sur cette ligne obéit à la même règle (aucune autre porte)', favS.ok === false && favS.code === 'suspecte' && favS.n1 === favS.n0, J(favS));
  /* ── ④b LA FRONTIÈRE `non_verifiee` (correctif final, ordre de Michel du 30/10) : une ancienne fiche OFF COHÉRENTE mais sans preuve indépendante ne crée JAMAIS une ligne automatiquement ── */
  const FR = 'Ancienne fiche non vérifiée. Retrouve le produit en ligne avant de le réutiliser, ou saisis personnellement ses valeurs.';
  const reaC = await E(() => {
    const snap = () => JSON.stringify([S.foodLog, S.savedFoods || [], S.hiddenFoods || []]);
    const l = (S.foodLog || []).find((x) => x.id === 'nrh-C1-00000003'); const s0 = snap();
    const r = _n2Reajouter(l, 'dejeuner', today(), 'test', null);
    const ap = _n2Apercu(l);
    const fav = _favDepuisLigne(l); const rf = _n2Reajouter(fav, 'dejeuner', today(), 'quickAddFood', null);
    const rh = _n2Reajouter(l, 'diner', today(), 'rejouerRepas', null);
    const apF = _n2Apercu(fav);
    const hab = _habApercu({ items: [l] }, _n2FichesVerifiees());
    const txt = _n2TexteProposition(l, ap);
    return { ok: r.ok, incoherente: r.incoherente === true, aCompleter: r.aCompleter === true, code: r.raison && r.raison.code, texte: r.raison && r.raison.texte,
      apOk: ap.ok, apLigne: ap.ligne, apCode: ap.raison && ap.raison.code, favOk: rf.ok, favCode: rf.raison && rf.raison.code, habOk: rh.ok, habCode: rh.raison && rh.raison.code, apFavCode: apF.raison && apF.raison.code,
      verifiee: _n2Verifiee(ap), carte: { n: hab.n, kcal: hab.kcal, aVerifier: hab.aVerifier }, txt: txt, identique: snap() === s0, n: S.foodLog.length }; });
  t('B-NRH P9 ⭐⭐ (CORRIGÉ : l\'ancien P9 affirmait le contraire) une ancienne fiche OFF COHÉRENTE (129 · 20 · 2 · 5) SANS preuve indépendante : « + Ajouter » est REFUSÉ — `ok:false`, `raison.code:source_non_confirmee`, la phrase de la règle — et `S.foodLog`, les favoris et les masquages sont identiques à l\'octet (aucun identifiant généré, aucune ligne)',
    reaC.ok === false && reaC.incoherente === true && reaC.aCompleter === false && reaC.code === 'source_non_confirmee' && reaC.texte === FR && reaC.identique === true && reaC.n === 10, J(reaC));
  t('B-NRH P9b ⭐⭐ le favori et le repas habituel de la même ligne : MÊME refus (aucune autre porte)', reaC.favOk === false && reaC.favCode === 'source_non_confirmee' && reaC.habOk === false && reaC.habCode === 'source_non_confirmee', J(reaC));
  t('B-NRH P9c ⭐⭐ l\'APERÇU garde sa signalisation « à vérifier » sans fabriquer de ligne ni de fausse validation : `ok:true` avec `raison`, `ligne:null`, pas « vérifiée », « à vérifier » dans la liste, et la carte du repas habituel ne compte PAS ses calories (0 kcal, 1 à vérifier)',
    reaC.apOk === true && reaC.apLigne === null && reaC.apCode === 'source_non_confirmee' && reaC.apFavCode === 'source_non_confirmee' && reaC.verifiee === false && /à vérifier/.test(reaC.txt) && reaC.carte.n === 0 && reaC.carte.kcal === 0 && reaC.carte.aVerifier === 1, J({ apOk: reaC.apOk, apLigne: reaC.apLigne, verifiee: reaC.verifiee, txt: reaC.txt, carte: reaC.carte }));
  const hors = await E(() => {
    const out = {}; const test = (id) => { const l = (S.foodLog || []).find((x) => x.id === id); const n0 = S.foodLog.length; const r = _n2Reajouter(l, 'dejeuner', today(), 'test', null); if (r.ok) S.foodLog.pop(); return { ok: r.ok, code: r.raison && r.raison.code, aCompleter: r.aCompleter === true, n0: n0 }; };
    out.declaree = test('nrh-D1-00000009'); out.enseigne = test('nrh-M1-00000010'); return out; });
  t('B-NRH P9d ⭐ HORS de la frontière, rien ne change : une fiche DÉCLARÉE par la personne et une fiche d\'ENSEIGNE se re-notent comme avant (elles ne prétendent pas être une fiche Open Food Facts)', hors.declaree.ok === true && hors.enseigne.ok === true, J(hors));
  await ouvrirAjout();
  await E(() => { window._offFetchProduct = async () => null; });
  const contourne = await E(() => { const l = (S.foodLog || []).find((x) => x.id === 'nrh-C1-00000003'); const ok = _n2Reprendre(l, 'historique');
    return { ok: ok, bc: !!_bcNutr, kcal: document.getElementById('af-kcal').value, prot: document.getElementById('af-prot').value, sid: !!(_afSrc && _afSrc.sourceId), fige: !!(_afRef && _afRef.fige), pastille: !!document.getElementById('af-prop-pastille'), ref: _afRef, texte: (document.getElementById('ov-add-food') || document.body).innerText }; });
  t('B-NRH P9e ⭐⭐ AUCUN CONTOURNEMENT par l\'écran d\'ajout : reprendre cette ancienne fiche n\'hydrate PAS le bloc « Quantité » (pas de `_bcNutr`), ne recopie ni ses macros ni son identité, ne propose pas « la dernière fois », dit la phrase de la règle et laisse une saisie personnelle',
    contourne.ok === true && contourne.bc === false && contourne.kcal === '' && contourne.prot === '' && contourne.sid === false && contourne.fige === false && contourne.pastille === false && contourne.ref === null && /Retrouve le produit en ligne avant de le réutiliser, ou saisis personnellement ses valeurs/.test(contourne.texte), J({ bc: contourne.bc, kcal: contourne.kcal, sid: contourne.sid, fige: contourne.fige, pastille: contourne.pastille, ref: contourne.ref }));
  await ouvrirAjout();
  const viaListe = await E(() => { _renderFoodQuickList(); const i = (_afQuickItems || []).findIndex((it) => it.name === 'Skyr cohérent (test)'); const n0 = S.foodLog.length; if (i < 0) return { i: i }; quickAddFood(i); return { i: i, n0: n0, n1: S.foodLog.length, bc: !!_bcNutr, kcal: document.getElementById('af-kcal').value, ouvert: document.getElementById('ov-add-food').classList.contains('open') }; });
  await pg.waitForTimeout(300);
  t('B-NRH P9f ⭐ « + » de « Mes aliments » (`quickAddFood`) sur cette ligne : rien n\'est écrit, l\'écran s\'ouvre sans fiche empruntée', viaListe.i >= 0 && viaListe.n1 === viaListe.n0 && viaListe.bc === false && viaListe.kcal === '' && viaListe.ouvert === true, J(viaListe));
  await E(() => { window._offFetchProduct = async () => ({ product_name_fr: 'Skyr cohérent (source)', brands: 'Test', quantity: '150 g', code: '3000000000402', nutriments: { 'energy-kcal_100g': 129, proteins_100g: 20, carbohydrates_100g: 2, fat_100g: 5 } }); });
  await E(() => { const l = (S.foodLog || []).find((x) => x.id === 'nrh-C1-00000003'); _afOublierAliment(); _n2Reprendre(l, 'historique'); }); await pg.waitForTimeout(900);
  const frais = await E(() => { const gr = document.getElementById('af-bc-grams'); if (gr) { gr.value = '150'; _bcQtyPose = true; _bcApplyGrams(); } return { bc: !!_bcNutr, kcal: document.getElementById('af-kcal').value, verr: _n2VerrouEcran('af') }; });
  t('B-NRH P9g ⭐⭐ la réponse Open Food Facts obtenue EN LIGNE pour ce même code-barres redonne le calcul (la source indépendante) : 150 g = 194 kcal, fiche identifiée donc verrouillée', frais.bc === true && frais.kcal === '194' && frais.verr === true, J(frais));

  /* ── ⑤ « MODIFIER » ── */
  const ouvrirEf = async (id) => { await E(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); }); await E((i) => { openEditFood(i); }, id); await pg.waitForTimeout(450); };
  const champsEf = () => E(() => ({ v: ['kcal', 'prot', 'carbs', 'fat'].map((c) => document.getElementById('ef-' + c).value), ro: ['kcal', 'prot', 'carbs', 'fat'].map((c) => document.getElementById('ef-' + c).readOnly),
    note: (document.getElementById('ef-abandon') || {}).textContent || '', nomRo: document.getElementById('ef-name').readOnly }));
  await ouvrirEf('nrh-S1-00000001');
  const mS = await champsEf(); const avantS = await ligne('nrh-S1-00000001');
  t('B-NRH P10 ⭐⭐ « Modifier » la ligne à fiche impossible : ses valeurs ENREGISTRÉES restent consultables (65 · 20 · 2 · 4), en lecture seule, avec la phrase de la règle', J(mS.v) === J(['65', '20', '2', '4']) && J(mS.ro) === J([true, true, true, true]) && /Ancienne fiche non vérifiée/.test(mS.note), J(mS));
  await E(() => { const g = document.getElementById('ef-grams') || document.getElementById('ef-q'); if (g) { g.value = '250'; try { _efApplyFiche(); } catch (e) {} } try { saveEditFood(); } catch (e) {} }); await pg.waitForTimeout(350);
  const apresQ = await ligne('nrh-S1-00000001');
  t('B-NRH P11 ⭐⭐ changer la quantité d\'une ligne à fiche impossible n\'écrit RIEN (aucun recalcul à partir de 65 kcal/100 g) : la ligne est strictement celle d\'avant', J(apresQ) === J(avantS), J(apresQ));
  await ouvrirEf('nrh-S1-00000001');
  await E(() => { _setEditFoodMeal('diner'); saveEditFood(); }); await pg.waitForTimeout(350);
  const apresR = await ligne('nrh-S1-00000001'); const attS = JSON.parse(JSON.stringify(avantS)); attS.meal = 'diner';
  t('B-NRH P12 ⭐ le REPAS seul se change : la ligne est identique à l\'octet sauf le repas (valeurs, fiche, identité, correction : rien ne bouge)', J(apresR) === J(attS), J(apresR));
  /* ── L'EXCEPTION UNIQUE : « Modifier » la quantité de SA PROPRE ligne historique cohérente (Michel, 30/10) ── */
  const NV_Q = '⚠️ Fiche nutritionnelle non vérifiée. Ce recalcul utilise les anciennes valeurs de cet aliment, qui peuvent être incorrectes. Il modifiera uniquement cette ligne de ton journal. Les valeurs ne seront pas considérées comme vérifiées et ne pourront pas être réutilisées automatiquement ailleurs.';
  const NV_0 = '⚠️ Ancienne fiche nutritionnelle non vérifiée. Ses valeurs sont conservées.';
  const note = () => E(() => (document.getElementById('ef-abandon') || {}).textContent || '');
  await ouvrirEf('nrh-C1-00000003');
  const n0Note = (await note()).replace(/\s+/g, ' ').trim();
  const avF = await E(() => JSON.stringify([S.foodLog.length, S.savedFoods || [], S.hiddenFoods || []]));
  await E(() => { const g = document.getElementById('ef-grams'); if (g) { g.value = '150'; _efApplyFiche(); } });
  const n1Note = (await note()).replace(/\s+/g, ' ').trim();
  await E(() => { saveEditFood(); }); await pg.waitForTimeout(350);
  const apresC = await ligne('nrh-C1-00000003');
  const apF = await E(() => ({ n: S.foodLog.length, fav: JSON.stringify([S.savedFoods || [], S.hiddenFoods || []]), badge: _n2Badge((S.foodLog || []).find((x) => x.id === 'nrh-C1-00000003')),
    preuve: (_n2FichesVerifiees()['3000000000402'] || {}).preuve, rea: (() => { const r = _n2Reajouter((S.foodLog || []).find((x) => x.id === 'nrh-C1-00000003'), 'dejeuner', today(), 'test', null); return { ok: r.ok, code: r.raison && r.raison.code }; })() }));
  t('B-NRH P13a ⭐ l\'ancienne fiche cohérente ouverte dans « Modifier » (quantité inchangée) dit : ' + NV_0, n0Note === NV_0, J(n0Note));
  t('B-NRH P13b ⭐⭐ dès que la quantité change (150 g), l\'avertissement EXACT de la règle s\'affiche dans `#ef-abandon` (aucune nouvelle fenêtre)', n1Note === NV_Q, J(n1Note));
  t('B-NRH P13 ⭐⭐ (RENFORCÉ) l\'exception : « Modifier » 100 g → 150 g recalcule SA PROPRE ligne (194 kcal par sa propre fiche) — même `id`, même nombre de lignes au journal, la note `reprise-non-verifiee` est posée, le badge dit « non vérifié », favoris et masquages intacts',
    apresC.id === 'nrh-C1-00000003' && apresC.q === 150 && apresC.kcal === 194 && apF.n === JSON.parse(avF)[0] && (apresC.n2.no || []).indexOf('reprise-non-verifiee') >= 0 && /non vérifié/.test(apF.badge) && apF.fav === J([JSON.parse(avF)[1], JSON.parse(avF)[2]]), J({ apresC: apresC.n2, apF: apF }));
  t('B-NRH P13c ⭐⭐ AUCUNE PROMOTION : la ligne modifiée ne devient pas une fiche vérifiée (`preuve` reste faux dans les fiches du journal) et reste REFUSÉE par « + Ajouter » (`source_non_confirmee`)', apF.preuve === false && apF.rea.ok === false && apF.rea.code === 'source_non_confirmee', J(apF));

  /* ── ⑥ ENTRÉE PERSONNELLE INDÉPENDANTE, hors ligne ── */
  await ouvrirAjout();
  await E(() => { window._offFetchProduct = async () => null; });
  await E(() => { const l = (S.foodLog || []).find((x) => x.id === 'nrh-S1-00000001'); _n2Reprendre(l, 'historique'); }); await pg.waitForTimeout(350);
  const ecr = await E(() => ({ desc: document.getElementById('af-desc').value, kcal: document.getElementById('af-kcal').value, sid: !!(_afSrc && _afSrc.sourceId), fige: !!(_afRef && _afRef.fige), cle: !!(_afRef && _afRef.cle), pastille: !!document.getElementById('af-prop-pastille'), ro: ['kcal', 'prot', 'carbs', 'fat'].map((c) => document.getElementById('af-' + c).readOnly),
    texte: (document.getElementById('ov-add-food') || document.body).innerText.slice(0, 4000) }));
  t('B-NRH P14 ⭐⭐ reprise de la ligne à fiche impossible : l\'écran dit « Ancienne fiche non vérifiée », ne recopie PAS ses macros douteuses, n\'emporte pas son identité, ne propose PAS « la dernière fois » (pas de chemin « figé » qui re-noterait ses valeurs), et laisse les champs libres pour une saisie personnelle',
    /Ancienne fiche non vérifiée/.test(ecr.texte) && ecr.kcal === '' && ecr.sid === false && ecr.fige === false && ecr.cle === false && ecr.pastille === false && J(ecr.ro) === J([false, false, false, false]), J({ fige: ecr.fige, cle: ecr.cle, pastille: ecr.pastille, desc: ecr.desc, kcal: ecr.kcal, sid: ecr.sid, ro: ecr.ro, dit: /Ancienne fiche non vérifiée/.test(ecr.texte) }));
  const nS0 = await E(() => (S.foodLog || []).length);
  await E(() => { const d = document.getElementById('af-desc'); d.value = 'Mon skyr perso 150 g'; d.dispatchEvent(new Event('input', { bubbles: true })); d.dispatchEvent(new Event('change', { bubbles: true }));
    [['kcal', '160'], ['prot', '25'], ['carbs', '4'], ['fat', '5']].forEach(([c, v]) => { const el = document.getElementById('af-' + c); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }); });
  await pg.waitForTimeout(250);
  await E(() => { const pr = document.getElementById('af-prop'); if (pr) { pr.value = '150'; _afPropPoser('tapee'); } }); await pg.waitForTimeout(250);   // (garde : un plantage de test n'est pas un verdict)
  const clicAj = await pg.click('button[onclick="addFoodEntry()"]', { timeout: 4000 }).then(() => true, () => false); await pg.waitForTimeout(500);
  const perso = await E((n0) => { const L = S.foodLog || []; const l = L[L.length - 1]; return { n1: L.length, n0: n0, name: l && l.name, kcal: l && l.kcal, sid: l && l.sourceId, src: l && l.n2 && l.n2.f && l.n2.f.src, st: l && l.n2 && l.n2.st }; }, nS0);
  t('B-NRH P15 ⭐⭐ la saisie personnelle (mode avion) s\'enregistre avec SES valeurs (160 kcal), « déclarée », sans l\'identité ni les macros de la ligne douteuse', clicAj && perso.n1 === perso.n0 + 1 && perso.kcal === 160 && !perso.sid && perso.src === 'utilisateur' && perso.st === 'declaree', J(perso));
  await E(() => { S.foodLog = S.foodLog.filter((x) => x.name !== 'Mon skyr perso 150 g'); persist(); });

  /* ── ⑦ EN LIGNE : la source indépendante rend le calcul ── */
  await ouvrirAjout();
  await E(() => { window._offFetchProduct = async () => ({ product_name_fr: 'Skyr (source)', brands: 'Test', quantity: '150 g', code: '3000000000401', nutriments: { 'energy-kcal_100g': 110, proteins_100g: 20, carbohydrates_100g: 4, fat_100g: 1.5 } }); });
  await E(() => { const l = (S.foodLog || []).find((x) => x.id === 'nrh-L1-00000002'); _n2Reprendre(l, 'historique'); }); await pg.waitForTimeout(900);
  const enLigne = await E(() => { const gr = document.getElementById('af-bc-grams'); if (gr) gr.value = '150'; _bcQtyPose = true; _bcApplyGrams(); return { bc: !!_bcNutr, kcal100: _bcNutr && _bcNutr.kcal100, kcal: document.getElementById('af-kcal').value, verr: _n2VerrouEcran('af') }; });
  t('B-NRH P16 ⭐⭐ OFF VÉRIFIÉ À LA SOURCE (réponse du code-barres, 110 kcal/100 g) : le calcul est conservé — 150 g → 165 kcal, fiche identifiée donc verrouillée', enLigne.bc === true && enLigne.kcal100 === 110 && enLigne.kcal === '165' && enLigne.verr === true, J(enLigne));

  /* ── ⑧ CIQUAL par identifiant ── */
  await E(() => _ciqualCharger()); await pg.waitForTimeout(300);
  const ciq = await E(() => { const r = _ciqual.a.find((x) => x[3] > 50 && x[4] > 5 && x[6] > 1); const sid = 'ciqual:' + r[0];
    const fiche = _n2FicheIdentite({ sourceId: sid }); const preuve = (typeof _n2PreuveSource === 'function') ? _n2PreuveSource(fiche, sid) : false; const ctrl = (typeof _n2ControlerReference === 'function') ? _n2ControlerReference(fiche, preuve) : { etat: 'ABSENT' }; const reprise = (typeof _n2Reprise === 'function') ? _n2Reprise : ((x) => NUT2.reprise(x, _n2Ctx()));
    const ligne = { id: 'nrh-Q-00000009', meal: 'collation', name: 'Aliment table (test)', kcal: Math.round(r[3] * 1.5), prot: Math.round(r[4] * 1.5), carbs: Math.round(r[5] * 1.5), fat: Math.round(r[6] * 1.5), q: 150, u: 'g', per100: { kcal: r[3], prot: r[4], carbs: r[5], fat: r[6] }, v: 1, saisie: 'ciqual', origine: 'ciqual', sourceId: sid, etat: null, date: today(), ts: 1760000900000,
      n2: { s: 1, m: 'p', st: 'fiable', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'ciqual', ver: 'CIQUAL-2025', fiab: 'source', base: 'g' } } };
    S.foodLog.push(ligne); const R = reprise(ligne); const rea = _n2Reajouter(ligne, 'dejeuner', today(), 'apercu-test', { verifiees: undefined });
    S.foodLog.pop();
    return { fiche: !!fiche, ctrl: ctrl.etat, avecFiche: !!(R && R.fiche), rea: rea.ok, kcal: rea.ligne ? rea.ligne.kcal : null, attendu: Math.round(r[3] * 1.5) }; });
  t('B-NRH P17 ⭐⭐ CIQUAL avec identifiant vérifiable (table chargée) : la fiche est « admissible » (preuve = la table), la ligne garde sa fiche et se recalcule comme avant', ciq.fiche && ciq.ctrl === 'admissible' && ciq.avecFiche === true && ciq.rea === true && ciq.kcal === ciq.attendu, J(ciq));

  /* ── ⑨ ANCIENNES CORRECTIONS ET HISTORIQUE ── */
  const aprs = await E(() => JSON.stringify([S.foodLog, S.savedFoods || [], S.hiddenFoods || []]));
  const avP = JSON.parse(avant), apP = JSON.parse(aprs);
  const sans = (L) => L.filter((x) => x.id !== 'nrh-S1-00000001' && x.id !== 'nrh-C1-00000003');
  t('B-NRH P18 ⭐⭐ AUCUNE donnée historique n\'a été modifiée en silence : les 8 autres lignes, les favoris et les masquages sont identiques à l\'octet (seuls le repas de S1 et la quantité de C1 ont changé, par leurs gestes)',
    J(sans(avP[0])) === J(sans(apP[0])) && J(avP[1]) === J(apP[1]) && J(avP[2]) === J(apP[2]), '');
  const corr = await E(() => { const l = JSON.parse(JSON.stringify((S.foodLog || []).find((x) => x.id === 'nrh-C1-00000003'))); l.n2.corr = [{ c: 'kcal', v: 100, avant: 129, le: 1 }]; const R = (typeof _n2Reprise === 'function') ? _n2Reprise(l) : NUT2.reprise(l, _n2Ctx()); return { fiche: !!R.fiche, corr: R.corrections.length }; });
  t('B-NRH P19 ⭐ aucune ancienne correction ne revient sur une fiche identifiée (comme avant : `reprise` écarte `n2.corr`)', corr.fiche === true && corr.corr === 0, J(corr));
  t('B-NRH P20 aucune erreur de page', erreurs.length === 0, J(erreurs));
  await cx.close();
};
