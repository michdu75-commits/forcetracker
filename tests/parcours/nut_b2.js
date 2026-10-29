/* ═════════════════════════════════════════════════════════════════════════════
   NUTRITION B2 (29/10/2026, GO tests de Michel) — LA LECTURE DES MASQUAGES ALIMENTAIRES EST NORMALISÉE, L'ÉCRITURE NE CHANGE PAS.

   « Crème fraîche » masquée doit aussi masquer « Creme fraiche » : les deux listes (« Déjà noté par toi », « Mes aliments ») regroupaient
   avec deux règles différentes. B2 compare les clés `nom:…` des DEUX côtés, normalisées par `_afNorm` (state.js `_nutDepart`), et donne
   aux deux listes la même clé de regroupement (app.js `_n2CleLue`).

   ⭐ CE QUE CE FICHIER FIGE (des invariants, pas une implémentation) :
     · N — la normalisation : accents, majuscules (É, Ç), espaces multiples / de bord / insécables, apostrophes typographiques ;
     · I — l'IDENTITÉ : deux produits ne se confondent jamais par un nom (D-111) ; 5 % ≠ 15 % ; `id:…` et `*` à l'IDENTIQUE ; un
           ancien nom nu (avant le 23/10) garde sa comparaison EXACTE ;
     · C — le plafond de 300 est INCHANGÉ et l'index mémorisé ne garde rien d'obsolète après un remplacement de liste ;
     · P — PERSISTANCE : l'ÉCRITURE (`_n2Cle`, « ✕ ») garde son format, aucune clé de stockage nouvelle, le journal est identique à
           l'octet, rien ne se perd après rechargement ; les favoris (`_majDefFavori`, « Rétablir ») ne bougent pas ;
     · H — hors ligne : mêmes réponses (SIMULATION navigateur — pas une certification PWA).
   ⛔ Données INVENTÉES, aucune donnée réelle. Aucun réseau (le garde réseau du banc coupe tout ce qui n'est pas local).
   ⛔ L'oracle est écrit À LA MAIN : jamais « ce que l'app calcule ».
   ⛔ UN SEUL PROPRIÉTAIRE (R2) : `tools/banc_nut_b2.js` et le contrôle négatif `tools/mut_nut_b2.py` appellent CE module.
   ═════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE_FIX = `(() => { try {
  if (sessionStorage.getItem('__b2')) return; sessionStorage.setItem('__b2', '1');
  localStorage.clear();
  localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
  const L = __LIGNES__;
  if (L) localStorage.setItem('ft4_foodlog', JSON.stringify(L));
  const H = __MASQUES__;
  if (H) localStorage.setItem('ft4_hiddenfoods', JSON.stringify(H));
} catch (e) {} })();`;

const clic = async (pg, sel) => { try { await pg.click(sel, { timeout: 4000 }); return true; } catch (e) { return false; } };

async function ouvrirPage(b, PORT, lignes, masques) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const pg = await cx.newPage();
  const erreurs = [];
  pg.on('pageerror', (e) => erreurs.push(String(e && e.message || e).slice(0, 160)));
  pg.on('dialog', (d) => d.accept());
  await pg.addInitScript(BASE_FIX.replace('__LIGNES__', JSON.stringify(lignes || null)).replace('__MASQUES__', JSON.stringify(masques || null)));
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1500);
  await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); });
  return { cx, pg, erreurs };
}

/* ── les helpers DANS la page : de vraies fonctions de l'app, des données inventées ── */
const INSTALLER = () => {
  const NOW = Date.now(), JOUR = 86400000;
  window.__b2 = {
    NOW, JOUR,
    ligne(id, name, jours, x) {
      return Object.assign({ id: 'fx-b2-' + id + '-0001', date: '2026-10-01', meal: 'diner', ts: NOW - jours * JOUR - (+id.replace(/\D/g, '') || 0),
        v: 1, saisie: 'manuel', origine: 'utilisateur', modifie: false, name, kcal: 100, prot: 5, carbs: 10, fat: 3, q: 100, u: 'g', per100: null }, x || {});
    },
    /* un masquage tel que l'app l'ÉCRIT (« ✕ ») : clé d'écriture historique + instant */
    masque(name, t) { return { k: _n2Cle({ name }).toLowerCase(), t: t || (NOW - 1000) }; },
    quick() { return _buildFoodQuickItems().map((i) => i.name); },
    sugg(q) { return _afSuggLocales(q).map((e) => e.name); },
    mise(lignes, masques, favs) { S.foodLog = lignes; S.hiddenFoods = masques || []; S.savedFoods = favs || []; },
  };
};

/* ── l'état de référence : le journal ne bouge JAMAIS à la lecture ── */
const SNAP = () => JSON.stringify({ log: S.foodLog, fav: S.savedFoods, ls: Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)]) });

module.exports.ecran = async function ecran(t, b, PORT) {
  console.log('\n-- B-NB2. Lecture normalisée des masquages alimentaires (B2) --');
  const E = (pg, f, a) => pg.evaluate(f, a);
  const { cx, pg, erreurs } = await ouvrirPage(b, PORT);
  await pg.evaluate(INSTALLER);
  const dispo = await E(pg, () => typeof _nutDepart === 'function' && typeof _n2CleLue === 'function' && typeof _afNorm === 'function' && typeof _nutMasquesNomIndex === 'function');
  t('B-NB2 ⓪ les fonctions de B2 existent dans la page (_nutDepart, _n2CleLue, _nutMasquesNomIndex, _afNorm)', dispo === true, String(dispo));
  if (!dispo) { await cx.close(); return; }

  /* ═══ N — LA NORMALISATION ═══ */
  const paire = async (nomLigne, nomMasque, attendu, titre, jours = 3) => {
    const r = await E(pg, ([nl, nm, j]) => {
      const B = window.__b2, l = B.ligne('1', nl, j);
      B.mise([l], [B.masque(nm)]);
      return { propose: _n2Propose(l, l.ts), quick: B.quick(), sugg: B.sugg('cr'), sugg2: B.sugg(nl.toLowerCase().slice(0, 4)) };
    }, [nomLigne, nomMasque, jours]);
    const masquee = r.propose === false && r.quick.indexOf(nomLigne) < 0;
    t(titre, masquee === attendu, JSON.stringify(r));
    return r;
  };
  /* témoin de non-vacuité : sans masquage, la ligne est bien proposée par LES DEUX listes */
  { const r = await E(pg, () => { const B = window.__b2, l = B.ligne('1', 'Creme fraiche', 3); B.mise([l], []); return { p: _n2Propose(l, l.ts), q: B.quick(), s: B.sugg('creme') }; });
    t('B-NB2 N0 (témoin de non-vacuité) sans masquage, « Creme fraiche » est proposée dans « Mes aliments » ET dans « Déjà noté par toi »',
      r.p === true && r.q.indexOf('Creme fraiche') >= 0 && r.s.indexOf('Creme fraiche') >= 0, JSON.stringify(r)); }
  await paire('Creme fraiche', 'Crème fraîche', true, 'B-NB2 N1 ⭐⭐ « Crème fraîche » masquée (clé historique accentuée) masque aussi « Creme fraiche »');
  await paire('Crème fraîche', 'Creme fraiche', true, 'B-NB2 N2 ⭐ et dans l\'autre sens : « Creme fraiche » masquée masque « Crème fraîche »');
  await paire('CRÈME FRAÎCHE', 'creme fraiche', true, 'B-NB2 N3a majuscules accentuées (È, Î) : « CRÈME FRAÎCHE » est masquée par « creme fraiche »');
  await paire('FAÇON ÉPICÉE', 'facon epicee', true, 'B-NB2 N3b majuscules accentuées (Ç, É) : « FAÇON ÉPICÉE » est masquée par « facon epicee »');
  await paire('  Crème   fraîche 5 %  ', 'creme fraiche 5%', true, 'B-NB2 N4 espaces multiples, de bord et « 5 % » : « "  Crème   fraîche 5 %  " » est masquée par « creme fraiche 5% »');
  { /* l'espace insécable : B2 doit suivre EXACTEMENT ce que dit `_afNorm` (pas plus, pas moins) — le comportement est constaté, pas supposé */
    const nbsp = await E(pg, () => ({ egal: _afNorm('Crème fraîche') === _afNorm('Crème fraîche'), fin: _afNorm('Crème fraîche ') === _afNorm('Crème fraîche') }));
    console.log('   constat _afNorm : espace insécable (U+00A0) = espace : ' + nbsp.egal + ' · fine insécable (U+202F) = espace : ' + nbsp.fin);
    await paire('Crème fraîche', 'Crème fraîche', nbsp.egal, 'B-NB2 N5 espace insécable : B2 suit EXACTEMENT `_afNorm` (constaté : ' + nbsp.egal + ')');
    await paire('Crème fraîche ', 'creme fraiche', nbsp.fin, 'B-NB2 N5b fine insécable de fin : B2 suit EXACTEMENT `_afNorm` (constaté : ' + nbsp.fin + ')'); }
  await paire('Huile d’olive', 'huile d\'olive', true, 'B-NB2 N6 apostrophe typographique : « Huile d’olive » est masquée par « huile d\'olive »');
  await paire('Poulet grillé', 'Poulet roti', false, 'B-NB2 N6b des noms PROCHES mais différents ne se confondent pas : « Poulet grillé » n\'est pas masqué par « Poulet roti »');

  /* ═══ I — L'IDENTITÉ (D-111) ═══ */
  await paire('Crème fraîche 15 %', 'Crème fraîche 5 %', false, 'B-NB2 I1 ⭐⭐ 5 % ≠ 15 % : « Crème fraîche 15 % » n\'est PAS masquée par « Crème fraîche 5 % »');
  await paire('Crème fraîche', 'Crème fraîche 5 %', false, 'B-NB2 I2 « Crème fraîche » (sans taux) n\'est pas masquée par « Crème fraîche 5 % »');
  await paire('creme fraiche 5%', 'Crème fraîche 5 %', true, 'B-NB2 I3 le MÊME taux écrit autrement est bien le même aliment : « creme fraiche 5% » est masquée par « Crème fraîche 5 % »');
  { const r = await E(pg, () => {
      const B = window.__b2, X1 = B.ligne('1', 'Yaourt nature', 4, { sourceId: '3000000000137', per100: { kcal: 60, prot: 4, carbs: 5, fat: 2 } }),
        X2 = B.ligne('2', 'Yaourt nature', 5, { sourceId: '3000000000144', per100: { kcal: 62, prot: 4, carbs: 5, fat: 2.2 } }), X3 = B.ligne('3', 'Yaourt nature', 6);
      const etat = (m) => { B.mise([X1, X2, X3], m); return [_n2Propose(X1, X1.ts), _n2Propose(X2, X2.ts), _n2Propose(X3, X3.ts)]; };
      return { sans: etat([]), quick0: (B.mise([X1, X2, X3], []), B.quick().filter((n) => n === 'Yaourt nature').length), sugg0: B.sugg('yaourt').length,
        nom: etat([B.masque('Yaourt nature')]), id1: etat([{ k: 'id:3000000000137', t: B.NOW - 1000 }]) };
    });
    t('B-NB2 I4 ⭐⭐ trois « Yaourt nature » (deux codes-barres, un sans identifiant) = TROIS propositions, dans les deux listes (D-111)',
      r.sans.every(Boolean) && r.quick0 === 3 && r.sugg0 === 3, JSON.stringify(r));
    t('B-NB2 I5 ⭐⭐ masquer le NOM sans identifiant ne masque PAS les deux produits identifiés du même nom', JSON.stringify(r.nom) === JSON.stringify([true, true, false]), JSON.stringify(r.nom));
    t('B-NB2 I6 ⭐ masquer UN code-barres ne masque ni l\'autre code-barres, ni la ligne sans identifiant', JSON.stringify(r.id1) === JSON.stringify([false, true, true]), JSON.stringify(r.id1)); }
  { const r = await E(pg, () => {
      const B = window.__b2, Y1 = B.ligne('1', 'Pate test', 4, { sourceId: 'ciqual:19000' }), Y2 = B.ligne('2', 'Pate test', 5, { sourceId: 'ciqual 19000' });
      B.mise([Y1, Y2], [{ k: 'id:ciqual:19000', t: B.NOW - 1000 }]);
      return [_n2Propose(Y1, Y1.ts), _n2Propose(Y2, Y2.ts)];
    });
    t('B-NB2 I7 ⭐⭐ une clé `id:` n\'est JAMAIS normalisée comme un nom : deux identifiants que `_afNorm` ramènerait l\'un sur l\'autre (ciqual:19000 / ciqual 19000) restent deux produits', JSON.stringify(r) === JSON.stringify([false, true]), JSON.stringify(r)); }
  { const r = await E(pg, () => {
      const B = window.__b2, Y1 = B.ligne('1', 'Pate test', 4, { sourceId: 'ciqual:19000' }), Y2 = B.ligne('2', 'Pate test', 5, { sourceId: 'ciqual 19000' });
      B.mise([Y1, Y2], []);
      return { q: B.quick().filter((n) => n === 'Pate test').length, s: B.sugg('pate').length };
    });
    t('B-NB2 I7b ⭐⭐ deux identifiants que `_afNorm` ramènerait l\'un sur l\'autre restent DEUX propositions dans les deux listes (le regroupement ne normalise jamais un identifiant)', r.q === 2 && r.s === 2, JSON.stringify(r)); }
  { const r = await E(pg, () => {
      const B = window.__b2, A = B.ligne('1', 'Crème fraîche', 4), C = B.ligne('2', 'Creme fraiche', 4);
      B.mise([A, C], [{ k: 'crème fraîche', t: B.NOW - 1000 }]);   /* un NOM NU d'avant le 23/10 */
      return [_n2Propose(A, A.ts), _n2Propose(C, C.ts)];
    });
    t('B-NB2 I8 ⭐⭐ un ancien NOM NU garde sa comparaison EXACTE : « crème fraîche » masque « Crème fraîche » (même nom en minuscules) mais PAS « Creme fraiche »', JSON.stringify(r) === JSON.stringify([false, true]), JSON.stringify(r)); }
  { const r = await E(pg, () => {
      const B = window.__b2, milieu = B.NOW - 2 * B.JOUR, av = B.ligne('1', 'Creme fraiche', 5), ap = B.ligne('2', 'Crème fraîche', 1), ap2 = B.ligne('3', 'Beurre test', 1);
      B.mise([av, ap, ap2], [{ k: '*', t: milieu }]);
      return [_n2Propose(av, av.ts), _n2Propose(ap, ap.ts), _n2Propose(ap2, ap2.ts)];
    });
    t('B-NB2 I9 `*` (remise à zéro) à l\'IDENTIQUE : ce qui est noté avant n\'est plus proposé, ce qui est noté après l\'est (variantes comprises)', JSON.stringify(r) === JSON.stringify([false, true, true]), JSON.stringify(r)); }
  { const r = await E(pg, () => {
      const B = window.__b2, A = B.ligne('1', 'Crème fraîche', 3), C = B.ligne('2', 'Creme fraiche', 3);
      B.mise([A, C], [B.masque('Crème fraîche', B.NOW - 10 * B.JOUR)]);   /* masquage ANTÉRIEUR aux lignes : elles renaissent (re-noter, c'est le vouloir) */
      return [_n2Propose(A, A.ts), _n2Propose(C, C.ts)];
    });
    t('B-NB2 I10 une ligne notée APRÈS le masquage revient d\'elle-même (la date de départ est respectée pour les variantes)', JSON.stringify(r) === JSON.stringify([true, true]), JSON.stringify(r)); }

  /* ═══ cohérence des DEUX listes, et clés ═══ */
  { const r = await E(pg, () => {
      const B = window.__b2, A = B.ligne('1', 'Crème fraîche', 4), C = B.ligne('2', 'Creme fraiche', 3);
      B.mise([A, C], []);
      const q = B.quick().filter((n) => /cr[eè]me fra[iî]che/i.test(n)), s = B.sugg('creme');
      return { q, s };
    });
    t('B-NB2 L1 ⭐⭐ les DEUX listes comptent pareil : « Crème fraîche » / « Creme fraiche » (sans identifiant) = UNE proposition dans « Mes aliments » ET dans « Déjà noté par toi »',
      r.q.length === 1 && r.s.length === 1, JSON.stringify(r)); }
  { const r = await E(pg, () => {
      const B = window.__b2, A = B.ligne('1', 'Crème fraîche', 4, { sourceId: 'ciqual:19000' }), C = B.ligne('2', 'Crème fraîche', 3);
      B.mise([A, C], []);
      return { q: B.quick().filter((n) => n === 'Crème fraîche').length, s: B.sugg('creme').length };
    });
    t('B-NB2 L2 ⭐⭐ une ligne AVEC identifiant et une ligne SANS, de même nom, restent DEUX propositions dans les deux listes (aucune fusion par le nom — D-111)', r.q === 2 && r.s === 2, JSON.stringify(r)); }
  { const r = await E(pg, () => ({
      ecr: _n2Cle({ name: ' Crème Fraîche ' }), idc: _n2Cle({ name: 'x', sourceId: ' 3000000000137 ' }),
      lue: _n2CleLue({ name: ' Crème   Fraîche ' }), lueId: _n2CleLue({ name: 'x', sourceId: ' 3000000000137 ' }),
      lueIdAcc: _n2CleLue({ name: 'x', sourceId: 'ciqual:19000' }) }));
    t('B-NB2 L3 ⭐⭐ `_n2Cle` (clé d\'ÉCRITURE) est INCHANGÉ : minuscules + bords, accents conservés ; `_n2CleLue` (lecture) normalise seulement les noms sans identifiant',
      r.ecr === 'nom:crème fraîche' && r.idc === 'id:3000000000137' && r.lue === 'nom:creme fraiche' && r.lueId === 'id:3000000000137' && r.lueIdAcc === 'id:ciqual:19000', JSON.stringify(r)); }
  { const r = await E(pg, () => {
      const B = window.__b2, L = [B.ligne('1', 'Crème fraîche', 4, { kcal: 123, prot: 7, carbs: 9, fat: 11, q: 150 }), B.ligne('2', 'Creme fraiche', 3, { kcal: 55, prot: 2, carbs: 4, fat: 1, q: 30 })];
      B.mise(L, [B.masque('Autre test')]);
      const avant = SNAP_F();
      B.quick(); B.sugg('creme'); _n2Propose(L[0], L[0].ts); _nutRazPerimetre(); _nutFavorisVivants(S.savedFoods, S.hiddenFoods, _n2Cle);
      return { egal: avant === SNAP_F(), q: _buildFoodQuickItems().map((i) => [i.name, i.kcal, i.prot, i.carbs, i.fat, i.q]) };
      function SNAP_F() { return JSON.stringify({ log: S.foodLog, fav: S.savedFoods, h: S.hiddenFoods, ls: Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)]) }); }
    });
    t('B-NB2 V1 ⭐⭐ LIRE ne modifie RIEN : journal, favoris, masquages et stockage identiques à l\'octet après toutes les lectures de B2', r.egal === true, JSON.stringify(r));
    t('B-NB2 V2 ⭐⭐ calories, protéines, glucides, lipides et quantités des propositions sont celles des lignes (123·7·9·11 pour 150 g ; 55·2·4·1 pour 30 g) — aucune valeur recalculée',
      JSON.stringify(r.q.map((x) => x.slice(1))) === JSON.stringify([[55, 2, 4, 1, 30]]) || JSON.stringify(r.q.map((x) => x.slice(1))) === JSON.stringify([[123, 7, 9, 11, 150]]), JSON.stringify(r.q)); }

  /* ═══ SANS `_afNorm` — le démarrage : state.js est chargé avant app.js ═══ */
  { const r = await E(pg, () => {
      const B = window.__b2, A = B.ligne('1', 'Crème fraîche', 4), C = B.ligne('2', 'Creme fraiche', 4), D = B.ligne('3', 'Beurre test', 4);
      B.mise([A, C, D], [B.masque('Creme fraiche')]);
      const sauve = window._afNorm; let erreur = null, res = null;
      try { window._afNorm = undefined; res = { typeofNorm: typeof _afNorm, lue: _n2CleLue({ name: 'Crème Fraîche' }), ecr: _n2Cle({ name: 'Crème Fraîche' }),
        c: _n2Propose(C, C.ts), a: _n2Propose(A, A.ts), d: _n2Propose(D, D.ts), idx: typeof _nutMasquesNomIndex }; }
      catch (e) { erreur = String(e && e.message || e); }
      window._afNorm = sauve;
      return { erreur, res, retabli: typeof _afNorm === 'function' };
    });
    t('B-NB2 S1 ⭐⭐ SANS `_afNorm` (démarrage) : aucune exception, ancienne lecture exacte (« Creme fraiche » masquée = elle seule), `_n2CleLue` retombe sur `_n2Cle`',
      r.erreur === null && r.res && r.res.typeofNorm === 'undefined' && r.res.c === false && r.res.a === true && r.res.d === true && r.res.lue === r.res.ecr && r.retabli === true, JSON.stringify(r)); }

  /* ═══ C — LE PLAFOND DE 300 ET L'INDEX MÉMORISÉ ═══ */
  { const r = await E(pg, () => {
      const base = Date.now() - 1e6, mk = (n, off = 0) => Array.from({ length: n }, (_, i) => ({ k: 'nom:aliment ' + (i + off), t: base + i * 10 }));
      const k = (l) => l.map((e) => e.k);
      const n299 = _nutMasquesNormaliser(mk(299)), n300 = _nutMasquesNormaliser(mk(300)), n301 = _nutMasquesNormaliser(mk(301));
      const raz299 = _nutMasquesNormaliser([{ k: '*', t: base - 5 }].concat(mk(299))), raz300 = _nutMasquesNormaliser([{ k: '*', t: base - 5 }].concat(mk(300)));
      const fus = _nutMasquesFusion(mk(300), [{ k: 'nom:nouveau', t: base + 99999 }]);
      return { n299: n299.length, n300: n300.length, n301: n301.length, plus_ancien_301: k(n301).indexOf('nom:aliment 0') >= 0, plus_recent_301: k(n301).indexOf('nom:aliment 300') >= 0,
        raz299: [raz299.length, raz299[0] && raz299[0].k], raz300: [raz300.length, raz300[0] && raz300[0].k, k(raz300).indexOf('nom:aliment 0') >= 0],
        fus: [fus.length, k(fus).indexOf('nom:nouveau') >= 0, k(fus).indexOf('nom:aliment 0') >= 0], max: _NUT_MASQUES_MAX };
    });
    t('B-NB2 C1 ⭐⭐ le plafond reste 300 : 299 → 299, 300 → 300, 301 → 300 (`_NUT_MASQUES_MAX` = 300)', r.n299 === 299 && r.n300 === 300 && r.n301 === 300 && r.max === 300, JSON.stringify(r));
    t('B-NB2 C2 CONSTATÉ, INCHANGÉ : au 301ᵉ, le plus ANCIEN est écarté et le plus récent gardé — le plafond ne « rejette » pas le 301ᵉ (comportement antérieur à B2, documenté)',
      r.plus_ancien_301 === false && r.plus_recent_301 === true && r.fus[0] === 300 && r.fus[1] === true && r.fus[2] === false, JSON.stringify(r));
    t('B-NB2 C3 avec la remise à zéro `*` : 299 masquages + `*` = 300 (la remise à zéro est TOUJOURS gardée, en premier) ; 300 + `*` → 299 + `*`',
      r.raz299[0] === 300 && r.raz299[1] === '*' && r.raz300[0] === 300 && r.raz300[1] === '*' && r.raz300[2] === false, JSON.stringify(r)); }
  { const r = await E(pg, () => {
      const t0 = Date.now() - 5000;
      const l = _nutMasquesNormaliser([{ k: 'nom:crème fraîche', t: t0 }, { k: 'nom:creme fraiche', t: t0 + 7 }, { k: 'nom:crème fraîche', t: t0 + 3 }]);
      return { n: l.length, ks: l.map((e) => e.k).sort(), tmax: Math.max.apply(null, l.map((e) => e.t)) - t0, depart: _nutDepart(l, 'nom:crème fraîche', 'crème fraîche') - t0 };
    });
    t('B-NB2 C4 ⭐⭐ doublons : une même clé exacte se réduit à la plus récente ; deux ORTHOGRAPHES restent deux entrées (B2 ne fusionne AUCUNE clé enregistrée) ; la lecture prend la plus tardive des deux',
      r.n === 2 && JSON.stringify(r.ks) === JSON.stringify(['nom:creme fraiche', 'nom:crème fraîche']) && r.depart === 7, JSON.stringify(r)); }
  { const r = await E(pg, () => {
      const B = window.__b2, C = B.ligne('1', 'Creme fraiche', 3), D = B.ligne('2', 'Beurre test', 3);
      const A = [B.masque('Crème fraîche')], Bq = [B.masque('Beurre test')], Cq = [B.masque('Crème fraîche'), B.masque('Beurre test')];
      const lit = (liste) => { S.hiddenFoods = liste; return [_n2Propose(C, C.ts), _n2Propose(D, D.ts)]; };
      const a1 = lit(A), a2 = lit(A), b1 = lit(Bq), c1 = lit(Cq), v1 = lit([]), a3 = lit(A);
      /* même longueur que A, autre contenu : l'index d'une AUTRE liste ne doit pas servir */
      const memeLong = lit([B.masque('Autre chose')]);
      const idx1 = _nutMasquesNomIndex(A), idx2 = _nutMasquesNomIndex(A);
      return { a1, a2, b1, c1, v1, a3, memeLong, memeObjet: idx1 === idx2 };
    });
    t('B-NB2 C5 ⭐⭐ L\'INDEX NE GARDE RIEN D\'OBSOLÈTE : après remplacement de la liste, les réponses suivent la NOUVELLE liste (A: variante masquée ; B: beurre masqué ; vide : rien ; même longueur, autre contenu : rien)',
      JSON.stringify(r.a1) === JSON.stringify([false, true]) && JSON.stringify(r.a2) === JSON.stringify([false, true]) && JSON.stringify(r.b1) === JSON.stringify([true, false])
      && JSON.stringify(r.c1) === JSON.stringify([false, false]) && JSON.stringify(r.v1) === JSON.stringify([true, true]) && JSON.stringify(r.a3) === JSON.stringify([false, true])
      && JSON.stringify(r.memeLong) === JSON.stringify([true, true]), JSON.stringify(r));
    t('B-NB2 C6 l\'index est RÉUTILISÉ pour une même liste (même objet rendu) — sans cela `_n2Propose`, appelé une fois par ligne du journal, normaliserait 300 clés à chaque appel', r.memeObjet === true, JSON.stringify(r)); }
  { const r = await E(pg, () => {
      const B = window.__b2, A = [B.masque('Autre chose')], l = B.ligne('1', 'Creme fraiche', 3);
      B.mise([l], A);
      const avant = _n2Propose(l, l.ts);
      A.push({ k: 'nom:crème fraîche', t: B.NOW - 1000 });   /* agrandie SUR PLACE (le code ne le fait jamais — voir C5c) : la taille change, l'index doit suivre */
      return { avant, apres: _n2Propose(l, l.ts) };
    });
    t('B-NB2 C5b ⭐ même objet-liste AGRANDI sur place : l\'index suit (il vérifie la taille de la liste, pas seulement son identité)', r.avant === true && r.apres === false, JSON.stringify(r)); }
  { const fs = require('fs'), path = require('path'), rx = /hiddenFoods\s*\.\s*(push|splice|pop|shift|unshift|sort|reverse|fill|length\s*=)|hiddenFoods\s*\[[^\]]*\]\s*=[^=]/;
    const hits = []; ['app.js', 'state.js', 'screens.js', 'setup.js', 'log.js', 'tracking.js', 'coach.js'].forEach((f) => {
      fs.readFileSync(path.join(__dirname, '..', '..', f), 'utf8').split('\n').forEach((l, i) => { if (rx.test(l)) hits.push(f + ':' + (i + 1)); }); });
    t('B-NB2 C5c ⭐ PRÉCONDITION de l\'index mémorisé : aucun fichier applicatif ne modifie `hiddenFoods` SUR PLACE (la liste est toujours REMPLACÉE par `_nutMasquesFusion` / `_nutMasquesNormaliser`)', hits.length === 0, hits.join(' · ')); }
  { const r = await E(pg, () => {
      const n = 3000, B = window.__b2, L = Array.from({ length: n }, (_, i) => B.ligne(String(i + 1), 'Aliment ' + (i % 40), 1 + (i % 9)));
      const M = Array.from({ length: 300 }, (_, i) => ({ k: 'nom:élément ' + i, t: Date.now() - 1000 - i }));
      B.mise(L, M);
      const t0 = performance.now(); let nb = 0; L.forEach((l) => { if (_n2Propose(l, l.ts)) nb++; }); const ms = performance.now() - t0;
      return { nb, ms: Math.round(ms) };
    });
    t('B-NB2 C7 performance : 3 000 lignes × 300 masquages = rendu des propositions rapide (< 500 ms ; mesuré ' + r.ms + ' ms) — l\'index mémorisé tient sa promesse', r.nb === 3000 && r.ms < 500, JSON.stringify(r)); }

  /* ═══ FAVORIS : ce que B2 touche (la lecture des masquages) et ce qu'il NE touche PAS ═══ */
  { const r = await E(pg, () => {
      const B = window.__b2, vieux = Date.now() - 5 * B.JOUR, recent = Date.now() - 100;
      const favs = [{ name: 'Creme fraiche', kcal: 100, prot: 3, carbs: 3, fat: 9, q: 100, u: 'g', t: vieux }, { name: 'Crème fraîche 15 %', kcal: 160, prot: 3, carbs: 3, fat: 15, q: 100, u: 'g', t: vieux },
        { name: 'Creme fraiche', kcal: 100, prot: 3, carbs: 3, fat: 9, q: 100, u: 'g', t: Date.now() }];
      const vivants = _nutFavorisVivants(favs, [B.masque('Crème fraîche', B.NOW - 1000)], _n2Cle);
      return vivants.map((f) => f.name + '|' + (f.t === vieux ? 'vieux' : (f.t === favs[2].t ? 'neuf' : '?')));
    });
    t('B-NB2 F1 ⭐ favoris : un favori d\'AVANT le masquage « Crème fraîche » sort (variante comprise), « Crème fraîche 15 % » reste, un favori re-posé APRÈS revient',
      JSON.stringify(r) === JSON.stringify(['Crème fraîche 15 %|vieux', 'Creme fraiche|neuf']), JSON.stringify(r)); }
  { const r = await E(pg, () => {
      const B = window.__b2, f1 = { name: 'Crème fraîche', u: 'portion', q: 1, kcal: 100, prot: 3, carbs: 3, fat: 9, portionLabel: 'pot', portionWeightG: 125, t: 1 },
        f2 = { name: 'Creme fraiche', u: 'portion', q: 1, kcal: 100, prot: 3, carbs: 3, fat: 9, portionLabel: 'pot', portionWeightG: 125, t: 2 };
      S.savedFoods = [f1, f2];
      _majDefFavori({ name: 'Crème fraîche', u: 'portion', portionLabel: 'grand pot', portionWeightG: 200 });
      return [f1.portionLabel, f1.portionWeightG, f2.portionLabel, f2.portionWeightG];
    });
    t('B-NB2 F2 ⭐⭐ `_majDefFavori` est INTACTE (comparaison exacte des favoris) : la définition de « Crème fraîche » suit, celle de « Creme fraiche » ne bouge pas',
      JSON.stringify(r) === JSON.stringify(['grand pot', 200, 'pot', 125]), JSON.stringify(r)); }
  { const fs = require('fs'), path = require('path'), src = fs.readFileSync(path.join(__dirname, '..', '..', 'app.js'), 'utf8');
    const i = src.indexOf('function nutRazRetablir'), bloc = i >= 0 ? src.slice(i, i + 2500) : '';
    t('B-NB2 F3 « Rétablir » des favoris est INTACT (SOURCE) : sa déduplication garde `_n2Cle(x)+\'|\'+_nutRazEmpreinte(…)` — la clé exacte, pas la clé de lecture',
      i >= 0 && (bloc.match(/_n2Cle\(x\)\+'\|'\+_nutRazEmpreinte/g) || []).length === 2 && bloc.indexOf('_n2CleLue') < 0, String(i)); }

  /* ═══ RESTAURATION / ANCIENNES SAUVEGARDES ═══ */
  { const r = await E(pg, () => {
      const B = window.__b2, C = B.ligne('1', 'Creme fraiche', 3), recent = [B.masque('Crème fraîche', B.NOW - 500)];
      B.mise([C], recent);
      const apresVide = _nutMasquesFusion(S.hiddenFoods, []), apresVieux = _nutMasquesFusion(S.hiddenFoods, [{ k: 'nom:crème fraîche', t: B.NOW - 30 * B.JOUR }]);
      const avant = JSON.stringify(recent);
      S.hiddenFoods = apresVide; const p1 = _n2Propose(C, C.ts);
      S.hiddenFoods = apresVieux; const p2 = _n2Propose(C, C.ts);
      /* une sauvegarde d'AVANT l'écriture historique (chaînes) : lue comme un nom nu, comparaison exacte */
      const anc = _nutMasquesNormaliser(['Crème fraîche']); S.hiddenFoods = anc; const exact = _n2Propose(B.ligne('2', 'Crème fraîche', 3), 0), variante = _n2Propose(C, 0);
      return { p1, p2, garde: JSON.stringify(apresVide) === avant, ancFormat: anc.map((e) => typeof e.k), exact, variante };
    });
    t('B-NB2 R1 ⭐⭐ restauration / ancienne sauvegarde : une liste vide ou plus ANCIENNE ne démasque rien (le plus tard gagne), la variante reste masquée', r.p1 === false && r.p2 === false && r.garde === true, JSON.stringify(r));
    t('B-NB2 R2 ⭐ une sauvegarde d\'AVANT (liste de chaînes) est lue comme un NOM NU : comparaison exacte (« Crème fraîche » masquée, « Creme fraiche » non) — aucune migration silencieuse',
      JSON.stringify(r.ancFormat) === JSON.stringify(['string']) && r.exact === false && r.variante === true, JSON.stringify(r)); }

  t('B-NB2 Z0 aucune erreur de page pendant les lectures en mémoire', erreurs.length === 0, JSON.stringify(erreurs.slice(0, 3)));
  await cx.close();

  /* ═══ P — PERSISTANCE : de VRAIS gestes (« ✕ » + confirmation), puis un RECHARGEMENT ═══ */
  { const L0 = (id, name, jours) => ({ id: 'fx-b2-p' + id + '-0001', date: '2026-10-01', meal: 'diner', ts: Date.now() - jours * 86400000, v: 1, saisie: 'manuel', origine: 'utilisateur',
      modifie: false, name, kcal: 111, prot: 6, carbs: 12, fat: 4, q: 100, u: 'g', per100: null });
    const LIGNES = [L0('1', 'Creme fraiche', 4), L0('2', 'Crème fraîche', 2), L0('3', 'Beurre test', 3)];
    const o = await ouvrirPage(b, PORT, LIGNES, null); const p = o.pg; await p.evaluate(INSTALLER);
    const g1 = await clic(p, '#nb-nutrition'); await p.waitForTimeout(400); const g2 = await clic(p, '#ntab-journal'); await p.waitForTimeout(250);
    const g3 = await clic(p, 'button[onclick="addFoodVia(\'main\')"]'); await p.waitForTimeout(400);
    // Référence = ce que persist() écrit SANS aucun geste (il écrit toutes les clés ft4_* à la 1re écriture) : on compare ensuite au geste.
    const cles0 = await p.evaluate(() => { persist(); return Object.keys(localStorage).sort(); });
    const journal0 = await p.evaluate(() => JSON.stringify(S.foodLog));
    const liste0 = await p.evaluate(() => (_afQuickItems || []).map((x) => x.name));
    const iCr = liste0.findIndex((n) => /cr[eè]me fra[iî]che/i.test(n));
    const gx = iCr >= 0 && await clic(p, '#af-quick-list button[onclick="deleteQuickFood(' + iCr + ')"]'); await p.waitForTimeout(250);
    const gc = gx && await clic(p, '#confirm-ok'); await p.waitForTimeout(400);
    const apres = await p.evaluate(() => ({ h: JSON.parse(JSON.stringify(S.hiddenFoods || [])), ls: localStorage.getItem('ft4_hiddenfoods'), quick: _buildFoodQuickItems().map((i) => i.name),
      sugg: _afSuggLocales('cre').map((e) => e.name), journal: JSON.stringify(S.foodLog), cles: Object.keys(localStorage).sort() }));
    t('B-NB2 P0 les gestes ont réellement eu lieu (Nutrition → Ajouter → « ✕ » sur la proposition « Crème fraîche » → Supprimer) et les deux orthographes n\'étaient qu\'UNE proposition',
      g1 && g2 && g3 && gx && gc && liste0.filter((n) => /cr[eè]me fra[iî]che/i.test(n)).length === 1, JSON.stringify({ g1, g2, g3, gx, gc, liste0 }));
    t('B-NB2 P1 ⭐⭐ L\'ÉCRITURE EST INCHANGÉE : « ✕ » écrit UNE entrée, à la clé historique (minuscules, accents conservés) de la proposition affichée (la plus récente, accentuée : « Crème fraîche »)',
      apres.h.length === 1 && apres.h[0].k === 'nom:crème fraîche' && apres.h[0].t > 0 && Object.keys(apres.h[0]).sort().join() === 'k,t', JSON.stringify(apres.h));
    t('B-NB2 P2 ⭐⭐ après « ✕ », les DEUX orthographes disparaissent des DEUX listes ; « Beurre test » reste',
      apres.quick.filter((n) => /cr[eè]me fra[iî]che/i.test(n)).length === 0 && apres.sugg.length === 0 && apres.quick.indexOf('Beurre test') >= 0, JSON.stringify({ q: apres.quick, s: apres.sugg }));
    t('B-NB2 P3 ⭐⭐ AUCUNE CLÉ DE STOCKAGE NOUVELLE : l\'ensemble des clés après le geste est celui d\'avant, au masquage près', apres.cles.filter((k) => cles0.indexOf(k) < 0).length === 0 && cles0.filter((k) => apres.cles.indexOf(k) < 0).length === 0, JSON.stringify({ nouvelles: apres.cles.filter((k) => cles0.indexOf(k) < 0) }));
    t('B-NB2 P4 ⭐⭐ le JOURNAL est identique à l\'octet (aucune ligne ajoutée, retirée ou recalculée) et le masquage enregistré = celui de la mémoire', apres.journal === journal0 && apres.ls === JSON.stringify(apres.h), String(apres.journal === journal0));
    await p.reload(); await p.waitForTimeout(1500);
    await p.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((x) => x.classList.remove('open')); }); await p.evaluate(INSTALLER);
    const rl = await p.evaluate(() => ({ h: JSON.stringify(S.hiddenFoods), journal: JSON.stringify(S.foodLog), quick: _buildFoodQuickItems().map((i) => i.name), sugg: _afSuggLocales('cre').map((e) => e.name), fav: JSON.stringify(S.savedFoods || []) }));
    t('B-NB2 P5 ⭐⭐ APRÈS RECHARGEMENT : masquage conservé, journal identique, les deux orthographes toujours absentes des deux listes, « Beurre test » toujours là',
      rl.h === JSON.stringify(apres.h) && rl.journal === journal0 && rl.quick.filter((n) => /cr[eè]me fra[iî]che/i.test(n)).length === 0 && rl.sugg.length === 0 && rl.quick.indexOf('Beurre test') >= 0, JSON.stringify(rl));
    /* hors ligne (SIMULATION navigateur) */
    await o.cx.setOffline(true); await p.waitForTimeout(200);
    const hl = await p.evaluate(() => ({ quick: _buildFoodQuickItems().map((i) => i.name), propose: _n2Propose(S.foodLog[1], S.foodLog[1].ts) }));
    t('B-NB2 H1 hors ligne (SIMULATION navigateur, pas une certification PWA) : mêmes réponses — variantes toujours masquées, aucune erreur', hl.propose === false && hl.quick.filter((n) => /cr[eè]me fra[iî]che/i.test(n)).length === 0 && o.erreurs.length === 0, JSON.stringify({ hl, err: o.erreurs.slice(0, 2) }));
    await o.cx.setOffline(false); await o.cx.close(); }

  /* ═══ ANCIEN FORMAT PERSISTÉ (chaînes) rechargé par la page ═══ */
  { const LIGNES = [{ id: 'fx-b2-q1-0001', date: '2026-10-01', meal: 'diner', ts: Date.now() - 4 * 86400000, v: 1, saisie: 'manuel', origine: 'utilisateur', modifie: false, name: 'Crème fraîche', kcal: 100, prot: 3, carbs: 3, fat: 9, q: 100, u: 'g', per100: null },
      { id: 'fx-b2-q2-0001', date: '2026-10-01', meal: 'diner', ts: Date.now() - 4 * 86400000 - 5, v: 1, saisie: 'manuel', origine: 'utilisateur', modifie: false, name: 'Creme fraiche', kcal: 100, prot: 3, carbs: 3, fat: 9, q: 100, u: 'g', per100: null }];
    const o = await ouvrirPage(b, PORT, LIGNES, ['crème fraîche', { k: 'nom:autre test', t: Date.now() - 2000 }]); const p = o.pg; await p.evaluate(INSTALLER);
    const r = await p.evaluate(() => ({ h: S.hiddenFoods.map((e) => e.k).sort(), quick: _buildFoodQuickItems().map((i) => i.name) }));
    t('B-NB2 R3 ⭐ une page rechargée avec un ANCIEN stockage (chaîne nue + clé `nom:`) lit la chaîne comme un nom nu EXACT : « Crème fraîche » masquée, « Creme fraiche » proposée',
      r.h.indexOf('crème fraîche') >= 0 && r.quick.indexOf('Crème fraîche') < 0 && r.quick.indexOf('Creme fraiche') >= 0, JSON.stringify(r));
    await o.cx.close(); }
};
