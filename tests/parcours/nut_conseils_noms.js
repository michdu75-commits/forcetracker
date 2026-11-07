/* ═════════════════════════════════════════════════════════════════
   🧪 NUT-CA-FAA'C (07/11/2026, GO CODE LIMITÉ de Michel après le contre-audit) — « CE QU'IL TE RESTE, EN VRAI » ET « TES REPAS HABITUELS ».
   Bloc : B-NCN. Banc : tools/banc_nut_conseils_noms.js. Contrôle négatif : tools/mut_nut_conseils_noms.py.

   TROIS DÉFAUTS, MESURÉS AVANT CORRECTION SUR LE CANDIDAT 866846b0 ET SUR MASTER e2b942f3 (identiques) :
     F  — le nom d'un aliment entre BRUT dans `onclick="rejouerRepas('…')"` : un guillemet droit casse le bouton (27 libellés de la table CIQUAL embarquée
          en ont un), un antislash change la signature, `\');…` / `&#39;);…` exécutent du JavaScript, et `"><img onerror=…>` injecte du HTML qui
          s'EXÉCUTE à l'affichage de la carte, sans aucun appui.
     A  — `_mesAliments` retenait la fiche d'une ancienne ligne que le moteur REFUSE de re-noter (copie OFF sans preuve, copie contredite par la table)
          et alimentait « Ce qu'il te reste » avec ; A' : un favori sans fiche utilisable, venu avant dans la liste, masquait par son NOM le produit
          vérifié du journal.
     C  — `_portionsNotees` mélangeait g et ml, comptait les lignes masquées / d'avant la remise à zéro et les lignes d'un AUTRE produit de même nom
          (« 600 g de Skyr » pour une prise masquée de 500 g) ; `freq` comptait aussi les lignes masquées.

   ⭐ CE BANC PROTÈGE DES COMPORTEMENTS, PAS DU TEXTE : il charge l'app RÉELLE, pose un journal INVENTÉ, appelle les fonctions réelles et clique les
   vrais boutons. (Les anciens témoins P0 / P11 de `nutri_correctifs` lisaient le texte du code — P11 verrouillait le défaut lui-même.)
   ⛔ L'oracle est écrit À LA MAIN. ⛔ Données INVENTÉES, aucune donnée réelle, aucun réseau. ⛔ Rien n'est écrit : chaque scénario vérifie que le
   journal, les favoris, les masquages et le stockage sont IDENTIQUES À L'OCTET avant / après.
   ═════════════════════════════════════════════════════════════════ */
'use strict';
const J = (x) => JSON.stringify(x);
const NBSP = / /g;
const sansNbsp = (s) => String(s).replace(NBSP, ' ');

/* ── fabrique de lignes INVENTÉES, au format réel d'une ancienne ligne du journal ── */
const FAB = `
window.__FAB = (() => {
  const pad = n => String(n).padStart(2, '0');
  const jour = k => { const t = new Date(); t.setDate(t.getDate() - k); return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()); };
  let seq = 0;
  const N_OFF = { s: 1, m: 'p', st: 'fiable', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'off', ver: null, fiab: 'source', base: 'g' } };
  const N_DEC = { s: 1, m: 'p', st: 'declaree', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'utilisateur', ver: null, fiab: 'declaree', base: 'g' } };
  const N_CIQ = { s: 1, m: 'p', st: 'fiable', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'ciqual', ver: null, fiab: 'source', base: 'g' } };
  const R = Math.round;
  /* o.base : 'off' (copie d'un scan, sans preuve indépendante) | 'dec' (déclarée par la personne) | 'ciq' (table CIQUAL) */
  function ligne(o) {
    const q = o.q, p = o.p100, u = o.u || 'g'; seq++;
    return { id: 'ncn-' + o.tag + '-' + String(seq).padStart(6, '0') + '-' + (10000000 + seq), ts: o.ts || (Date.now() - (o.k || 0) * 86400000 + seq),   /* l'instant RÉEL de « il y a k jours » : plus la ligne est ancienne, plus son ts est petit */
      date: jour(o.k), meal: o.meal || 'dejeuner', name: o.name,
      kcal: R(p.kcal * q / 100), prot: R(p.prot * q / 100), carbs: R(p.carbs * q / 100), fat: R(p.fat * q / 100),
      q: q, u: u, per100: p, v: 1,
      saisie: o.base === 'dec' ? 'manuel' : 'code-tape', origine: o.base === 'dec' ? 'utilisateur' : (o.base === 'ciq' ? 'ciqual' : 'off'),
      sourceId: o.sid === undefined ? null : o.sid, etat: o.base === 'dec' ? null : 'tel-que-vendu',
      n2: o.base === 'dec' ? N_DEC : (o.base === 'ciq' ? N_CIQ : N_OFF) };
  }
  return { ligne: ligne, jour: jour };
})();`;

const BASE_FIX = `(() => { try { if (sessionStorage.getItem('__ncn')) return; sessionStorage.setItem('__ncn', '1'); localStorage.clear();
  localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
  localStorage.setItem('ft4_foodlog','[]'); localStorage.setItem('ft4_savedfoods','[]'); } catch (e) {} })();` + FAB;

async function ouvrirPage(b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const pg = await cx.newPage();
  const erreurs = [];
  pg.on('pageerror', (e) => erreurs.push(String(e && e.message || e).slice(0, 160)));
  pg.on('dialog', (d) => d.accept());
  await pg.addInitScript(BASE_FIX);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1500);
  return { cx, pg, erreurs };
}

module.exports.ecran = async function ecran(t, b, PORT) {
  console.log('\n-- B-NCN. Conseils « ce qu\'il te reste » et boutons des repas habituels : fiche refusée, portion, nom d\'aliment --');
  const { cx, pg, erreurs } = await ouvrirPage(b, PORT);
  const E = (f, a) => pg.evaluate(f, a);
  const pause = (ms) => pg.waitForTimeout(ms);
  await E(async () => { await _ciqualCharger(); });
  const mk = (o) => E((o2) => window.__FAB.ligne(o2), o);
  const charger = (lignes, favoris) => E((a) => { S.foodLog = a[0]; S.savedFoods = a[1] || []; S.hiddenFoods = []; try { _habDernier = { cle: '', t: 0 }; _habEnCours = 0; } catch (e) {} window.__ncn_pwn = 0; }, [lignes, favoris || []]);
  /* tout ce qui est PERSISTÉ ou affiché comme donnée : doit rester identique à l'octet */
  const instantane = () => E(() => J2());
  await E(() => { window.J2 = () => JSON.stringify([S.foodLog, S.savedFoods, S.hiddenFoods, (() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; })()]); });
  const ideesTexte = (reste, heure) => E((a) => _ideesPourLeReste(a[0], a[1]).map((i) => i.idee), [reste, heure == null ? 12 : heure]);
  const RESTE_PROT = { prot: 70, carbs: 0, fat: 0, kcal: 400 };
  const SHAKE = { kcal: 380, prot: 85, carbs: 3, fat: 2 };
  const tableCiq = () => E(() => { const a = _ciqual.a; const x = a.find((y) => y[4] >= 18 && y[4] <= 30 && y[3] > 0 && y[3] < 220); const r = _n2Ctx().ciqual(String(x[0])); return { code: x[0], p: { kcal: r.kcal, prot: r.prot, carbs: r.carbs, fat: r.fat } }; });
  const CIQ = await tableCiq();

  /* ═══ A — « Ce qu'il te reste » ne s'appuie JAMAIS sur une fiche que le moteur refuse de re-noter ═══ */
  {
    /* A1 : copie d'un ancien scan OFF, cohérente mais SANS preuve indépendante (« + Ajouter » la refuse : source_non_confirmee) + un témoin DÉCLARÉ */
    const L = [await mk({ tag: 'A1', k: 1, name: 'Isolat OFF sans preuve', base: 'off', sid: '3000000000901', p100: SHAKE, q: 30 }),
               await mk({ tag: 'A1b', k: 2, name: 'Isolat OFF sans preuve', base: 'off', sid: '3000000000901', p100: SHAKE, q: 30 }),
               await mk({ tag: 'A0', k: 1, name: 'Skyr declare', base: 'dec', p100: { kcal: 60, prot: 11, carbs: 4, fat: 0.2 }, q: 150 })];
    await charger(L);
    const av = await instantane();
    const r = await E((nom) => { const vf = _n2FichesVerifiees(); const l = S.foodLog.find((x) => x.name === nom); const a = _n2Apercu(l, vf); return { refus: a.raison && a.raison.code }; }, 'Isolat OFF sans preuve');
    const idees = (await ideesTexte(RESTE_PROT)).map(sansNbsp);
    const mes = await E(() => _mesAliments(40).map((a) => a.name));
    t('B-NCN A00 base : « + Ajouter » REFUSE bien cette copie OFF (source_non_confirmee) — c\'est le verdict que les idées doivent suivre', r.refus === 'source_non_confirmee', J(r));
    t('B-NCN A01 ⭐⭐ aucune idée ne s\'appuie sur la copie OFF sans preuve (refusée par « + Ajouter »)', !idees.some((x) => /Isolat OFF sans preuve/.test(x)), J(idees));
    t('B-NCN A01b ⭐ ni `_mesAliments` ne la propose', mes.indexOf('Isolat OFF sans preuve') < 0, J(mes));
    t('B-NCN A01c ⭐ et la fiche DÉCLARÉE reste proposée : on n\'a pas vidé la liste (300 g de Skyr = 2 x la prise observée de 150 g, mesuré à la main : 70/11x100 = 636 g ≥ 300)', idees.length === 1 && /^300 g de Skyr declare$/.test(idees[0]), J(idees));
    t('B-NCN A01d ⛔ RIEN n\'est écrit : journal, favoris, masquages et stockage identiques à l\'octet', (await instantane()) === av, '');
  }
  {
    /* A2 : une copie CIQUAL la plus RÉCENTE qui CONTREDIT la table ; l'ancienne ligne du même nom est conforme à la table */
    const bon = await mk({ tag: 'A2ok', k: 3, name: 'Poulet table', base: 'ciq', sid: 'ciqual:' + CIQ.code, p100: CIQ.p, q: 100 });
    const mauvais = await mk({ tag: 'A2bad', k: 0, name: 'Poulet table', base: 'ciq', sid: 'ciqual:' + CIQ.code, p100: { kcal: Math.round(CIQ.p.kcal * 0.62), prot: Math.round(CIQ.p.prot * 0.62 * 10) / 10, carbs: CIQ.p.carbs, fat: Math.round(CIQ.p.fat * 0.62 * 10) / 10 }, q: 100 });   // k:0 = la plus RÉCENTE
    await charger([bon, mauvais]);
    const av = await instantane();
    const r = await E(() => { const vf = _n2FichesVerifiees(); return S.foodLog.map((x) => { const a = _n2Apercu(x, vf); return { kcal: x.per100.kcal, refus: a.raison && a.raison.code }; }); });
    const cand = await E(() => _mesAliments(40).filter((a) => a.name === 'Poulet table').map((a) => ({ kcal100: a.per100 && a.per100.kcal, prot100: a.per100 && a.per100.prot })));
    t('B-NCN A02a base : « + Ajouter » refuse la copie contredite par la TABLE et accepte la ligne conforme', r.some((x) => x.kcal !== CIQ.p.kcal && x.refus === 'source_non_confirmee') && r.some((x) => x.kcal === CIQ.p.kcal && !x.refus), J(r));
    t('B-NCN A02 ⭐⭐ la copie contredite ne nourrit AUCUNE idée : le pour-100 g proposé est celui de la TABLE (A\' : l\'ancienne ligne conforme prend la place de la variante refusée)', cand.length === 1 && cand[0].kcal100 === CIQ.p.kcal && cand[0].prot100 === CIQ.p.prot, J({ cand, table: CIQ.p }));
    t('B-NCN A02d ⛔ rien n\'est écrit ni recalculé en silence (octet pour octet)', (await instantane()) === av, '');
  }
  {
    /* A3 / A' : un ancien FAVORI sans fiche utilisable (venu avant dans la liste) ne masque pas, par son nom, le produit vérifié du journal */
    const ver = await mk({ tag: 'A3', k: 1, name: 'Poulet favori', base: 'ciq', sid: 'ciqual:' + CIQ.code, p100: CIQ.p, q: 100 });
    const fav = { name: 'Poulet favori', kcal: 200, prot: 20, carbs: 1, fat: 8, t: 1760000000000, q: 100, u: 'g', per100: { kcal: 200, prot: 20, carbs: 1, fat: 8 }, v: 1 };
    await charger([ver], [fav]);
    const av = await instantane();
    const cand = await E(() => _mesAliments(40).filter((a) => a.name === 'Poulet favori').map((a) => ({ fav: a.fav, fiche: !!a._fiche, kcal100: a.per100 && a.per100.kcal })));
    const idees = (await ideesTexte(RESTE_PROT)).map(sansNbsp);
    t('B-NCN A03 ⭐⭐ un ancien favori sans fiche utilisable ne masque PAS le produit vérifié du même nom : la référence admissible reste candidate', cand.length === 1 && cand[0].fiche === true && cand[0].kcal100 === CIQ.p.kcal, J(cand));
    t('B-NCN A03b ⭐ et l\'idée existe (avant : aucune)', idees.length === 1 && /Poulet favori/.test(idees[0]), J(idees));
    t('B-NCN A03c ⛔ le favori n\'est ni supprimé ni modifié (octet pour octet)', (await instantane()) === av, '');
  }
  {
    /* A4 : une ligne SANS quantité mais avec une fiche saine n'est PAS un refus de fiche : elle reste proposable (le moteur dit seulement « à compléter ») */
    const sq = await mk({ tag: 'A4', k: 2, name: 'Sans quantite', base: 'dec', p100: SHAKE, q: 30 });
    sq.q = null; sq.u = null;
    await charger([sq]);
    const r = await E(() => { const a = _n2Apercu(S.foodLog[0], _n2FichesVerifiees()); return { ok: a.ok, aCompleter: !!a.aCompleter }; });
    const mes = await E(() => _mesAliments(40).map((a) => ({ n: a.name, fiche: !!a._fiche })));
    t('B-NCN A04 ⭐ une ligne avec fiche saine mais sans quantité (« à compléter ») reste proposable : pas de régression des anciennes lignes', r.aCompleter === true && mes.length === 1 && mes[0].fiche === true, J({ r, mes }));
  }
  {
    /* A5 : nominal — des fiches saines (déclarée, CIQUAL conforme) donnent exactement ce que le candidat 866846b0 donnait (oracle MESURÉ sur 866846b0 avant correction) */
    const L = [];
    for (const [k, q] of [[4, 80], [3, 100], [2, 120]]) L.push(await mk({ tag: 'A5r', k, name: 'Riz nominal', base: 'dec', p100: { kcal: 350, prot: 7, carbs: 78, fat: 1 }, q }));
    L.push(await mk({ tag: 'A5p', k: 1, name: 'Poulet nominal', base: 'ciq', sid: 'ciqual:' + CIQ.code, p100: CIQ.p, q: 100 }));
    await charger(L);
    const idees = (await ideesTexte({ prot: 60, carbs: 150, fat: 0, kcal: 700 })).map(sansNbsp);
    /* oracle écrit À LA MAIN : glucides — manque 150 g / 78 g pour 100 g = 192 g ; portion observée (médiane) 100 g ; multiples 0,5 · 1 · 1,5 · 2 : 150 g est le plus grand qui ne dépasse pas 192 g.
       protéines — manque 60 g / 20,4 g pour 100 g (table) = 294 g ; une seule prise de 100 g ; 2 x 100 = 200 g ≤ 294 g */
    t('B-NCN A05 ⭐ nominal inchangé (oracle calculé à la main) : « 150 g de Riz nominal » (1,5 x la médiane 100 g) et « 200 g de Poulet nominal » (2 x la prise de 100 g, fiche CIQUAL conforme)', idees.length === 2 && idees.indexOf('150 g de Riz nominal') >= 0 && idees.indexOf('200 g de Poulet nominal') >= 0, J(idees));
  }

  {
    /* A6 : si l'aperçu du moteur ÉCHOUE (exception), c'est un refus — le repli sûr : « Ce qu'il te reste » ne casse pas l'écran et ne conseille pas avec une fiche qu'on n'a pas pu juger */
    await charger([await mk({ tag: 'A6', k: 1, name: 'Skyr aperçu en panne', base: 'dec', p100: { kcal: 60, prot: 11, carbs: 4, fat: 0.2 }, q: 150 })]);
    const r = await E(() => { const orig = window._n2Apercu; window._n2Apercu = () => { throw new Error('aperçu en panne (essai)'); }; let err = null, mes = null, idees = null; try { mes = _mesAliments(40).length; idees = _ideesPourLeReste({ prot: 70, carbs: 0, fat: 0, kcal: 400 }, 12).length; } catch (e) { err = String(e); } window._n2Apercu = orig; return { err, mes, idees }; });
    t('B-NCN A06 ⭐ un aperçu du moteur qui ÉCHOUE est un refus (repli sûr) : aucune exception, aucune idée', r.err === null && r.mes === 0 && r.idees === 0, J(r));
  }

  /* ═══ C — la portion observée : UNE unité, UNE identité, ni masquée ni d'avant la remise à zéro ═══ */
  {
    /* C1 : 40 g et 200 ml sous le même nom */
    await charger([await mk({ tag: 'C1a', k: 3, name: 'Shake mixte', base: 'dec', p100: { kcal: 380, prot: 80, carbs: 5, fat: 4 }, q: 40, u: 'g' }),
                   await mk({ tag: 'C1b', k: 2, name: 'Shake mixte', base: 'dec', p100: { kcal: 60, prot: 12, carbs: 1, fat: 1 }, q: 200, u: 'ml' })]);
    const o = await E(() => ({ obs: _portionObservee('Shake mixte', 'g'), idees: _ideesPourLeReste({ prot: 70, carbs: 0, fat: 0, kcal: 400 }, 12).map((i) => i.idee) }));
    t('B-NCN C01 ⭐⭐ aucune médiane commune g/ml : la portion d\'une fiche en grammes vient des seules lignes en grammes (40 g, et non (40+200)/2 = 120)', o.obs && o.obs.grammes === 40 && o.obs.n === 1, J(o.obs));
    t('B-NCN C01b ⭐ et l\'idée proposée part de 40 g : manque 70 g / 80 g pour 100 g = 87,5 g ; 2 x 40 = 80 g est la plus grande portion plausible qui ne dépasse pas le besoin', o.idees.length === 1 && /^80 g de Shake mixte$/.test(sansNbsp(o.idees[0])), J(o.idees));
    const mlSeul = await E(() => _portionObservee('Shake mixte', 'ml'));
    t('B-NCN C01c ⭐ l\'échelle « ml » existe toujours, séparément (200 ml, une observation)', mlSeul && mlSeul.grammes === 200 && mlSeul.n === 1, J(mlSeul));
  }
  {
    /* C2 : une ancienne prise de 500 g, MASQUÉE depuis (« ✕ ») + une seule prise normale de 100 g notée ensuite */
    const vieille = await mk({ tag: 'C2a', k: 9, name: 'Skyr masque', base: 'dec', p100: { kcal: 60, prot: 11, carbs: 4, fat: 0.2 }, q: 500, u: 'g' });
    const neuve = await mk({ tag: 'C2b', k: 0, name: 'Skyr masque', base: 'dec', p100: { kcal: 60, prot: 11, carbs: 4, fat: 0.2 }, q: 100, u: 'g', ts: Date.now() + 1000 });
    await charger([vieille, neuve]);
    await E(() => { S.hiddenFoods = [{ k: 'nom:skyr masque', t: Date.now() - 100000 }]; });
    const av = await instantane();
    const o = await E(() => ({ propose: S.foodLog.map((x) => _n2Propose(x, x.ts)), obs: _portionObservee('Skyr masque', 'g'), idees: _ideesPourLeReste({ prot: 70, carbs: 0, fat: 0, kcal: 400 }, 12).map((i) => i.idee) }));
    t('B-NCN C02a base : la règle existante dit bien « ancienne = masquée, nouvelle = proposée »', o.propose[0] === false && o.propose[1] === true, J(o.propose));
    t('B-NCN C02 ⭐⭐ l\'ancienne prise masquée (500 g) ne pèse plus : médiane = 100 g, une observation', o.obs && o.obs.grammes === 100 && o.obs.n === 1, J(o.obs));
    t('B-NCN C02b ⭐ et plus de « 600 g de Skyr » : 2 x 100 g = 200 g', o.idees.length === 1 && /^200 g de Skyr masque$/.test(sansNbsp(o.idees[0])), J(o.idees));
    t('B-NCN C02c ⛔ la ligne masquée N\'EST NI supprimée NI modifiée : le journal est intact à l\'octet', (await instantane()) === av, '');
  }
  {
    /* C3 : DEUX produits de même nom, deux identités (l'un sans code-barres, l'autre avec) — la médiane ne mélange pas leurs portions. Produit riche en protéines
       (80 % des calories) pour que l'idée existe ; oracle écrit à la main : manque 40 g / 20 g pour 100 g = 200 g */
    const P = { kcal: 100, prot: 20, carbs: 2, fat: 1 };
    const L = [];
    for (const k of [6, 5, 4]) L.push(await mk({ tag: 'C3a', k, name: 'Fromage jumeau', base: 'dec', sid: null, p100: P, q: 50 }));
    for (const k of [3, 2]) L.push(await mk({ tag: 'C3b', k, name: 'Fromage jumeau', base: 'dec', sid: '3000000000955', p100: P, q: 100 }));
    await charger(L);
    const o = await E(() => { const a = _mesAliments(40).find((x) => x.name === 'Fromage jumeau'); return { cle: a && a._cle, sans: _portionObservee('Fromage jumeau', 'g', 'nom:fromage jumeau'), avec: _portionObservee('Fromage jumeau', 'g', 'id:3000000000955'), idees: _ideesPourLeReste({ prot: 40, carbs: 0, fat: 0, kcal: 300 }, 12).map((i) => i.idee) }; });
    t('B-NCN C03 ⭐ identité : la médiane d\'un produit SANS code-barres (50 g) ne mélange pas les portions d\'un produit AVEC code-barres de même nom (100 g) — « jamais deux produits par leur nom », D-111', o.sans && o.sans.grammes === 50 && o.sans.n === 3 && o.avec && o.avec.grammes === 100 && o.avec.n === 2, J(o));
    t('B-NCN C03b ⭐ et `_mesAliments` porte l\'identité du candidat retenu (le plus récent : celui au code-barres)', o.cle === 'id:3000000000955', J(o));
    t('B-NCN C03c ⭐⭐ de bout en bout : l\'idée part de la portion du produit RETENU (2 x 100 g = 200 g, le plus grand multiple qui ne dépasse pas 200 g), pas d\'une médiane mêlant les deux produits (qui aurait donné 100 g)', o.idees.length === 1 && /^200 g de Fromage jumeau$/.test(sansNbsp(o.idees[0])), J(o.idees));
  }
  {
    /* C4 : nominal — trois prises 80 / 100 / 120 g d'un même produit, mêmes unité et identité : médiane 100 g, « perso » (3 observations) */
    await charger([await mk({ tag: 'C4a', k: 4, name: 'Riz median', base: 'dec', p100: { kcal: 350, prot: 7, carbs: 78, fat: 1 }, q: 80 }), await mk({ tag: 'C4b', k: 3, name: 'Riz median', base: 'dec', p100: { kcal: 350, prot: 7, carbs: 78, fat: 1 }, q: 120 }), await mk({ tag: 'C4c', k: 2, name: 'Riz median', base: 'dec', p100: { kcal: 350, prot: 7, carbs: 78, fat: 1 }, q: 100 })]);
    const o = await E(() => _portionObservee('Riz median', 'g', 'nom:riz median'));
    t('B-NCN C04 ⭐ nominal inchangé : médiane 100 g sur 3 observations, personnalisée', o && o.grammes === 100 && o.n === 3 && o.perso === true, J(o));
  }
  {
    /* C5 : le classement par fréquence ne compte pas les lignes masquées */
    const L = [];
    for (const k of [9, 8, 7, 6, 5]) L.push(await mk({ tag: 'C5a', k, name: 'Avoine frequente', base: 'dec', p100: { kcal: 380, prot: 13, carbs: 60, fat: 7 }, q: 50 }));
    L.push(await mk({ tag: 'C5b', k: 0, name: 'Avoine frequente', base: 'dec', p100: { kcal: 380, prot: 13, carbs: 60, fat: 7 }, q: 50, ts: Date.now() + 1000 }));
    for (const k of [3, 2]) L.push(await mk({ tag: 'C5c', k, name: 'Pain regulier', base: 'dec', p100: { kcal: 250, prot: 9, carbs: 49, fat: 3 }, q: 60 }));
    await charger(L);
    await E(() => { S.hiddenFoods = [{ k: 'nom:avoine frequente', t: Date.now() - 100000 }]; });
    const f = await E(() => _mesAliments(40).map((a) => ({ n: a.name, freq: a.freq })));
    t('B-NCN C05 ⭐ `freq` ne compte que les lignes encore PROPOSÉES (une seule pour l\'avoine : les cinq anciennes sont masquées) — le classement ne se laisse plus piloter par ce que la personne a masqué', f.find((x) => x.n === 'Avoine frequente').freq === 1 && f.find((x) => x.n === 'Pain regulier').freq === 2, J(f));
  }

  /* ═══ F — le nom d'un aliment ne devient JAMAIS ni du code ni du HTML dans le bouton d'un repas habituel ═══ */
  {
    const reel = await E(() => { const a = _ciqual.a; const x = a.find((y) => String(y[1]).indexOf('"') >= 0 && y[3] > 0); const r = _n2Ctx().ciqual(String(x[0])); return { code: x[0], nom: String(x[1]), p: { kcal: r.kcal, prot: r.prot, carbs: r.carbs, fat: r.fat } }; });
    const HOST = '"><img src=x onerror=window.__ncn_pwn=(window.__ncn_pwn||0)+1> \'" onmouseover="window.__ncn_pwn=9';
    const cas = [
      ['guillemet', 'Lait "Bio" fictif'], ['apostrophe', 'Pain d\'Anaïs fictif'], ['plus', 'Whey+Creatine fictif'], ['antislash', 'Dos\\Ligne fictif'],
      ['antislash_apostrophe', 'Faux\\\');window.__ncn_pwn=(window.__ncn_pwn||0)+1;//'], ['entite_apostrophe', 'Faux&#39;);window.__ncn_pwn=(window.__ncn_pwn||0)+1;//'],
      ['balise_et_attribut', HOST], ['caracteres_html', '<b>gras</b> & <i>x</i> &amp; fictif'], ['retour_ligne', 'Ligne1\nLigne2 fictif'], ['retour_chariot', 'Ligne1\rLigne2 fictif'],
      ['gabarit', '`${1+1}` fictif'], ['source_externe_entites', 'L&#39;Atelier &quot;Bio&quot; &amp; Cie fictif'],
      ['ciqual_reel', reel.nom]
    ];
    for (const [cle, nom] of cas) {
      const sid = cle === 'ciqual_reel' ? 'ciqual:' + reel.code : null;
      const p100 = cle === 'ciqual_reel' ? reel.p : { kcal: 130, prot: 3, carbs: 28, fat: 0.3 };
      const L = [await mk({ tag: 'F' + cle, k: 3, name: nom, base: sid ? 'ciq' : 'dec', sid: sid, p100: p100, q: 100 }), await mk({ tag: 'F' + cle + 'b', k: 2, name: nom, base: sid ? 'ciq' : 'dec', sid: sid, p100: p100, q: 100 })];
      await charger(L);
      await E(() => { if (!window.__rejouerOrig) { window.__rejouerOrig = window.rejouerRepas; window.rejouerRepas = function () { window.__appels.push(Array.prototype.slice.call(arguments).map(String)); return window.__rejouerOrig.apply(this, arguments); }; } window.__appels = []; document.querySelectorAll('img[src="x"]').forEach((x) => x.remove()); });
      const av = await instantane();
      const rendu = await E(() => { goScreen('s-nutrition'); renderFoodJournal(); const bs = [...document.querySelectorAll('.hab-moments button')]; return { boutons: bs.length, attendus: FOOD_MEALS.length, cartes: document.querySelectorAll('.hab-moments').length }; });
      await pause(450);
      const apresRendu = await E(() => ({ pwn: window.__ncn_pwn || 0, img: document.querySelectorAll('img[src="x"]').length, souris: document.querySelectorAll('[onmouseover]').length, faux: document.querySelectorAll('.hab-moments b, .hab-moments i').length }));
      let erreur = null;
      erreur = await E(() => { window.__e = null; const h = (ev) => { window.__e = String(ev.message || ev); }; window.addEventListener('error', h); try { document.querySelectorAll('.hab-moments button')[0].click(); } catch (x) { window.__e = String(x); } window.removeEventListener('error', h); return window.__e; });
      await pause(450);
      const clic = await E((nomA) => ({ appels: window.__appels, pwn: window.__ncn_pwn || 0, ajoutes: S.foodLog.filter((x) => x.date === today()).map((x) => x.name), attendu: nomA }), nom);
      const sigAttendue = nom.toLowerCase().trim();
      const ok = rendu.boutons === rendu.attendus && rendu.cartes === 1 && apresRendu.pwn === 0 && apresRendu.img === 0 && apresRendu.souris === 0 && apresRendu.faux === 0
        && !erreur && clic.pwn === 0 && clic.appels.length === 1 && clic.appels[0][0] === sigAttendue && clic.ajoutes.length === 1 && clic.ajoutes[0] === nom.slice(0, 80);   // le moteur écrit le nom sur 80 caractères au plus (`_n2Reajouter`, comportement existant)
      t('B-NCN F-' + cle + ' ⭐⭐ « ' + nom.slice(0, 40).replace(/[\r\n]/g, '↵') + ' » : 5 boutons, aucun HTML ni code injecté (ni à l\'affichage ni au clic), le bouton appelle rejouerRepas avec la signature EXACTE et le repas est re-noté sous son vrai nom',
        ok, J({ rendu, apresRendu, erreur, appels: clic.appels, pwn: clic.pwn, ajoutes: clic.ajoutes.length }));
      void av;
    }
    {
      /* le PANNEAU DE CHOIX (repas dont un aliment est refusé) : un nom hostile n'y devient ni HTML ni code */
      const nomH = '"><img src=x onerror=window.__ncn_pwn=(window.__ncn_pwn||0)+1>';
      const L = [];
      for (const k of [3, 2]) { L.push(await mk({ tag: 'FPn' + k, k, name: nomH, base: 'off', sid: '3000000000977', p100: { kcal: 380, prot: 85, carbs: 3, fat: 2 }, q: 30 })); L.push(await mk({ tag: 'FPo' + k, k, name: 'Riz panneau ok', base: 'dec', p100: { kcal: 130, prot: 3, carbs: 28, fat: 0.3 }, q: 100 })); }
      await charger(L);
      await E(() => { goScreen('s-nutrition'); renderFoodJournal(); document.querySelectorAll('img[src="x"]').forEach((x) => x.remove()); });
      const r = await E(async () => { const sig = _repasHabituels()[0].sig; rejouerRepas(sig, 'dejeuner'); await new Promise((q) => setTimeout(q, 500)); return { panneau: !!document.querySelector('.hab-choix'), pwn: window.__ncn_pwn || 0, img: document.querySelectorAll('img[src="x"]').length, boutons: [...document.querySelectorAll('.hab-choix button')].length }; });
      t('B-NCN F-panneau ⭐ le panneau de choix s\'ouvre (3 boutons) et un nom d\'aliment hostile n\'y devient ni HTML ni code', r.panneau && r.boutons === 3 && r.pwn === 0 && r.img === 0, J(r));
    }
    t('B-NCN F-fin aucune erreur JavaScript de page pendant tout le banc (hors la faute que le défaut provoquait)', erreurs.length === 0, J(erreurs.slice(0, 3)));
  }

  await cx.close();
};
