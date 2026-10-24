/* ══════════════════════════════════════════════════════════════════════════════════════
   NUT-JOURNAL-QTY-GUARD-01 (LOT-C de l'audit de nuit du 12/10/2026) — UNE QUANTITÉ VIDE,
   NULLE OU ILLISIBLE NE S'ENREGISTRE PAS DANS LE JOURNAL NUTRITION.

   Mesuré la nuit du 12/10, puis confirmé de façon indépendante par la contre-vérification
   Nutrition :
   ① AJOUT — un aliment choisi (CIQUAL, fast-food…), quantité tapée puis vidée / « 0 » /
     « abc » → « Ajouter » enregistrait la ligne avec les valeurs POUR 100 g et `q:null`
     (riz : 155 kcal ; Big Mac : 228 kcal pour un sandwich de 530). La garde ft-v1051 lisait
     le GESTE (`_bcQtyPose`), pas la VALIDITÉ de la quantité.
   ② MODIFIER — la porte JUMELLE (R8), plus grave : une ligne de 250 g / 388 kcal, champ
     grammes vidé ou « 0 » → « Enregistrer » → 0 g / 155 kcal, et ça survivait au
     rechargement. Une donnée juste était ÉCRASÉE.

   ⭐ L'INVARIANT FIGÉ ICI (et pas une implémentation) : quand le bloc quantité fait autorité
   (un pour-100 g est connu), une quantité lue ≤ 0 ou illisible ne modifie JAMAIS le journal —
   ni ligne ajoutée, ni ligne existante réécrite, en mémoire comme dans le stockage.

   ⛔ PAR LE VRAI CHEMIN : vraie frappe dans le champ (`fill` déclenche l'`oninput` de
   production), vrai clic sur « Ajouter » / « Enregistrer ». Aucune fonction parallèle.
   ⛔ FICHIER À PART, comme `repas_actif.js` : le parcours est ASYNCHRONE (BUGS.md §61), et une
   mutation doit pouvoir être éprouvée en secondes.
   ══════════════════════════════════════════════════════════════════════════════════════ */

module.exports.ecran = async function (t, b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block' });
  await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, (rt) => rt.abort());
  const pg = await cx.newPage();
  const erreurs = [];
  pg.on('pageerror', (e) => erreurs.push(String(e).slice(0, 200)));
  pg.on('dialog', (d) => d.accept());
  await pg.addInitScript(`try{ if(!sessionStorage.getItem('__init')){ sessionStorage.setItem('__init','1'); localStorage.clear(); }
    localStorage.setItem('ft4_ob2','1');localStorage.setItem('ft4_guide_shown','1');localStorage.setItem('ft4_wn_seen','99');}catch(e){}`);
  const ouvrir = async () => {
    await pg.goto('http://localhost:' + PORT + '/index.html');
    await pg.waitForTimeout(1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); });
    await pg.evaluate(async () => { await Promise.all([_ciqualCharger(), _aliasCharger(), _marquesCharger()]); });
  };
  await ouvrir();

  /* Ouvrir « Ajouter un aliment », TAPER la recherche, CLIQUER la proposition voulue. */
  const choisir = async (q, fn, idx) => {
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); openAddFood(); });
    await pg.waitForTimeout(200);
    await pg.fill('#af-desc', q);
    await pg.waitForTimeout(250);
    const sel = '#af-sugg button[onclick="' + fn + '(' + idx + ')"]';
    await pg.waitForSelector(sel, { timeout: 4000 });
    await pg.click(sel);
    await pg.waitForTimeout(150);
    return pg.evaluate(() => ({
      per100: (typeof _bcNutr !== 'undefined' && _bcNutr) ? { kcal: _bcNutr.kcal100, p: _bcNutr.prot100, g: _bcNutr.carbs100, l: _bcNutr.fat100 } : null,
      visible: (document.getElementById('af-bc-row') || { style: {} }).style.display }));
  };
  const taper = async (v) => { await pg.fill('#af-bc-grams', String(v)); await pg.waitForTimeout(60); };
  const ajouter = async () => {
    const n0 = await pg.evaluate(() => { const el = document.getElementById('toast'); if (el) { el.textContent = ''; el.className = ''; } return (S.foodLog || []).length; });
    await pg.click('button[onclick="addFoodEntry()"]');
    await pg.waitForTimeout(150);
    return pg.evaluate((n0) => { const L = S.foodLog || []; const el = document.getElementById('toast');
      return { ajoutees: L.length - n0, ligne: L.length > n0 ? L[L.length - 1] : null, toast: el ? el.textContent : '', type: el ? el.className : '' }; }, n0);
  };
  const retirer = (id) => pg.evaluate((id) => removeFoodEntry(id), id);
  const attendu = (p, g) => ({ kcal: Math.round(p.kcal * g / 100), prot: Math.round(p.p * g / 100), carbs: Math.round(p.g * g / 100), fat: Math.round(p.l * g / 100) });
  const egal = (l, a) => !!l && ['kcal', 'prot', 'carbs', 'fat'].every((k) => l[k] === a[k]);

  console.log('\n═══ B-NJQG-A. Ajout : une quantité invalide ne crée aucune ligne ═══');

  /* A1 — non-régression : quantité valide */
  const riz = await choisir('riz blanc cuit', '_afSuggPrendreCiqual', 0);
  t('B-NJQG-A ⓪ le parcours choisit un aliment CIQUAL avec un pour-100 g (bloc quantité visible)',
    !!riz.per100 && riz.visible === 'block', JSON.stringify(riz));
  await taper('150');
  const a1 = await ajouter();
  t('B-NJQG-A ① 150 g → 1 ligne, valeurs = pour-100 g × 1,5, q = 150',
    a1.ajoutees === 1 && riz.per100 && egal(a1.ligne, attendu(riz.per100, 150)) && a1.ligne.q === 150, JSON.stringify(a1));
  if (a1.ligne) await retirer(a1.ligne.id);

  /* A2-A4 + -5 — quantité ENGAGÉE puis rendue invalide */
  for (const [k, v] of [['②', ''], ['③', '0'], ['④', 'abc'], ['⑤', '-5']]) {
    await choisir('riz blanc cuit', '_afSuggPrendreCiqual', 0);
    await taper('5'); await taper(v);
    const a = await ajouter();
    t('B-NJQG-A ' + k + ' CIQUAL, quantité engagée puis « ' + v + ' » → aucune ligne, refus affiché',
      a.ajoutees === 0 && /error/.test(a.type) && a.toast !== '', JSON.stringify({ ajoutees: a.ajoutees, toast: a.toast, q: a.ligne && a.ligne.q, kcal: a.ligne && a.ligne.kcal }));
    if (a.ligne) await retirer(a.ligne.id);
  }

  /* A6 — le cas « jamais touché » : déjà refusé (ft-v1051), doit le rester */
  await choisir('riz blanc cuit', '_afSuggPrendreCiqual', 0);
  const a6 = await ajouter();
  t('B-NJQG-A ⑥ champ jamais touché → refus inchangé (aucune ligne)', a6.ajoutees === 0 && /error/.test(a6.type), JSON.stringify(a6));
  if (a6.ligne) await retirer(a6.ligne.id);

  /* A7 — après un refus, le formulaire reste utilisable : on corrige et ça passe */
  await choisir('riz blanc cuit', '_afSuggPrendreCiqual', 0);
  await taper('5'); await taper('');
  const a7r = await ajouter();
  if (a7r.ligne) await retirer(a7r.ligne.id);
  /* ⚠️ Si le refus n'a pas eu lieu, le formulaire s'est FERMÉ : on ne tape pas dans un champ
     invisible (le banc planterait au lieu de rougir — un plantage n'est pas un verdict). */
  const ouvert = await pg.isVisible('#af-bc-grams');
  if (ouvert) await taper('200');
  const a7 = ouvert ? await ajouter() : { ajoutees: 0, ligne: null };
  t('B-NJQG-A ⑦ refus puis 200 g → 1 seule ligne, juste',
    a7r.ajoutees === 0 && a7.ajoutees === 1 && egal(a7.ligne, attendu(riz.per100, 200)) && a7.ligne.q === 200, JSON.stringify({ a7r: a7r.ajoutees, a7: a7.ligne && { kcal: a7.ligne.kcal, q: a7.ligne.q } }));
  if (a7.ligne) await retirer(a7.ligne.id);

  /* A8 / A9 — fast-food (portion publiée) : même règle, et la pastille marche toujours */
  const bm = await choisir('big mac', '_afSuggPrendreMarque', 0);
  await taper('5'); await taper('');
  const a8 = await ajouter();
  t('B-NJQG-A ⑧ fast-food, quantité engagée puis vidée → aucune ligne (avant : 228 kcal, q:null)',
    a8.ajoutees === 0, JSON.stringify({ ajoutees: a8.ajoutees, kcal: a8.ligne && a8.ligne.kcal, q: a8.ligne && a8.ligne.q }));
  if (a8.ligne) await retirer(a8.ligne.id);
  await choisir('big mac', '_afSuggPrendreMarque', 0);
  const past = await pg.evaluate(() => { const b = document.getElementById('af-bc-portion'); return b && b.style.display !== 'none' ? b.dataset.q : null; });
  if (past) await pg.click('#af-bc-portion');
  const a9 = await ajouter();
  t('B-NJQG-A ⑨ fast-food, pastille de portion publiée → 1 ligne cohérente (non-régression)',
    !!past && a9.ajoutees === 1 && bm.per100 && Math.abs(a9.ligne.kcal - attendu(bm.per100, +past).kcal) <= 1 && a9.ligne.q === +past,
    JSON.stringify({ past, ajoutees: a9.ajoutees, kcal: a9.ligne && a9.ligne.kcal, q: a9.ligne && a9.ligne.q }));
  if (a9.ligne) await retirer(a9.ligne.id);

  /* A10 — aliment tapé à la main (aucun pour-100 g).
     🥗 NUTRITION V2 (jalon 4, 22/10/2026) — CE TÉMOIN DISAIT « s'enregistre comme avant », SANS QUANTITÉ. C'est fini,
     par décision : D-099 (Michel, 22/10 : grammes et ml d'abord) et le contrat V2 (« une quantité absente, nulle ou
     illisible n'enregistre rien »). La garantie de ce bloc, elle, s'ÉTEND au lieu de changer : une saisie à la main
     sans poids ne crée aucune ligne et l'écran dit quoi faire ; avec son poids, elle s'enregistre, valeurs telles
     que tapées. Les valeurs partent par de vraies frappes (`fill` : les événements de production). */
  await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); openAddFood(); });
  await pg.waitForTimeout(150);
  await pg.evaluate(() => { document.getElementById('af-desc').value = 'Gâteau maison (test)';
    const sg = document.getElementById('af-sugg'); if (sg) sg.innerHTML = ''; });
  for (const [id, v] of [['#af-kcal', '320'], ['#af-prot', '5'], ['#af-carbs', '40'], ['#af-fat', '15']]) await pg.fill(id, v);
  await pg.locator('#af-fat').blur(); await pg.waitForTimeout(120);
  const a10 = await ajouter();
  t('B-NJQG-A ⑩ aliment tapé à la main SANS poids → aucune ligne, et l\'écran demande le poids (D-099, contrat V2)',
    a10.ajoutees === 0 && /error/.test(a10.type) && /poids|quantit/i.test(a10.toast), JSON.stringify({ ajoutees: a10.ajoutees, toast: a10.toast }));
  if (a10.ligne) await retirer(a10.ligne.id);
  const champPoids = await pg.isVisible('#af-poids');
  if (champPoids) { await pg.fill('#af-poids', '180'); await pg.locator('#af-poids').blur(); await pg.waitForTimeout(120); }
  const a10b = champPoids ? await ajouter() : { ajoutees: 0, ligne: null };
  t('B-NJQG-A ⑩b … avec 180 g → 1 ligne, valeurs telles que tapées (320 · 5 · 40 · 15), q = 180 g',
    a10b.ajoutees === 1 && a10b.ligne.kcal === 320 && a10b.ligne.prot === 5 && a10b.ligne.carbs === 40 && a10b.ligne.fat === 15
      && a10b.ligne.q === 180 && a10b.ligne.u === 'g', JSON.stringify({ champPoids, ajoutees: a10b.ajoutees, l: a10b.ligne && { kcal: a10b.ligne.kcal, q: a10b.ligne.q, u: a10b.ligne.u } }));
  if (a10b.ligne) await retirer(a10b.ligne.id);

  console.log('\n═══ B-NJQG-M. Modifier : une quantité invalide ne réécrit jamais la ligne ═══');

  /* La ligne de départ : 250 g de riz, créée par le vrai parcours */
  await choisir('riz blanc cuit', '_afSuggPrendreCiqual', 0);
  await taper('250');
  const base = await ajouter();
  const id = base.ligne && base.ligne.id;
  const att250 = riz.per100 ? attendu(riz.per100, 250) : null;
  t('B-NJQG-M ⓪ ligne de départ : 250 g, valeurs justes', base.ajoutees === 1 && egal(base.ligne, att250) && base.ligne.q === 250,
    JSON.stringify(base.ligne && { kcal: base.ligne.kcal, q: base.ligne.q }));
  const photo = () => pg.evaluate((id) => JSON.stringify((S.foodLog || []).find((x) => x && x.id === id) || null), id);
  const photoDisque = () => pg.evaluate((id) => { try { return JSON.stringify((JSON.parse(localStorage.getItem('ft4_foodlog') || '[]')).find((x) => x && x.id === id) || null); } catch (e) { return 'ILLISIBLE'; } }, id);
  const modifier = async (v) => {
    await pg.evaluate((id) => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); openEditFood(id); }, id);
    await pg.waitForTimeout(150);
    const champ = await pg.$('#ef-grams');
    if (!champ) return { champ: false };
    await pg.fill('#ef-grams', String(v));
    await pg.waitForTimeout(60);
    await pg.evaluate(() => { const el = document.getElementById('toast'); if (el) { el.textContent = ''; el.className = ''; } });
    await pg.click('#ov-edit-food button[onclick="saveEditFood()"]');
    await pg.waitForTimeout(150);
    return pg.evaluate(() => { const el = document.getElementById('toast');
      return { champ: true, toast: el ? el.textContent : '', type: el ? el.className : '',
               ouverte: (document.getElementById('ov-edit-food') || { classList: { contains: () => false } }).classList.contains('open') }; });
  };
  const fermer = () => pg.evaluate(() => { const ov = document.getElementById('ov-edit-food'); if (ov) ov.classList.remove('open'); });

  const avant = await photo();
  const avantDisque = await photoDisque();
  for (const [k, v] of [['①', ''], ['②', '0'], ['③', 'abc'], ['④', '-5']]) {
    const r = await modifier(v);
    const ap = await photo(); const apD = await photoDisque();
    t('B-NJQG-M ' + k + ' 250 g → « ' + v + ' » → refus, ligne STRICTEMENT inchangée (mémoire et stockage)',
      r.champ && /error/.test(r.type) && ap === avant && apD === avantDisque,
      JSON.stringify({ r, change: ap !== avant, changeDisque: apD !== avantDisque, apres: JSON.parse(ap || 'null') && { kcal: JSON.parse(ap).kcal, q: JSON.parse(ap).q } }));
    await fermer();
  }

  /* Rechargement après les tentatives invalides : la ligne initiale est intacte */
  await ouvrir();
  const apresReload = await photo();
  t('B-NJQG-M ⑤ rechargement après les tentatives invalides → ligne initiale inchangée',
    apresReload === avant, JSON.stringify({ avant: JSON.parse(avant || 'null') && JSON.parse(avant).kcal, apres: JSON.parse(apresReload || 'null') && { kcal: JSON.parse(apresReload).kcal, q: JSON.parse(apresReload).q } }));

  /* Non-régression : 250 → 200 fonctionne, et survit au rechargement */
  const r6 = await modifier('200');
  const att200 = attendu(riz.per100, 200);
  const l6 = JSON.parse(await photo());
  t('B-NJQG-M ⑥ 250 → 200 g → enregistré, valeurs justes (non-régression)',
    r6.champ && !/error/.test(r6.type) && egal(l6, att200) && l6.q === 200, JSON.stringify({ r6, kcal: l6 && l6.kcal, q: l6 && l6.q }));
  await ouvrir();
  const l7 = JSON.parse(await photo());
  t('B-NJQG-M ⑦ la modification valide survit au rechargement', egal(l7, att200) && l7.q === 200, JSON.stringify(l7 && { kcal: l7.kcal, q: l7.q }));

  /* Une ANCIENNE ligne tapée à la main, sans quantité (pas de champ grammes).
     🥗 NUTRITION V2 (jalon 4, 22/10/2026) — CE TÉMOIN DISAIT « se modifie comme avant » (kcal changées, aucune
     quantité). Une modification est désormais une ligne V2 qui prend la place de l'ancienne, et le moteur n'écrit
     jamais une ligne sans quantité (contrat V2) ; la quantité absente n'est pas déduite non plus (D-095). Donc :
     sans quantité → refus, ligne STRICTEMENT inchangée (la garantie de ce bloc) ; avec 300 g → enregistrée, et
     l'ancienne ligne garde sa copie d'origine (`n2.av`). */
  const idMain = await pg.evaluate(() => { const e = { date: today(), meal: 'diner', name: 'Soupe maison (test)', kcal: 120, prot: 4, carbs: 15, fat: 5, ts: Date.now(), id: _foodLineId() };
    S.foodLog.push(e); persist(); return e.id; });
  const photoMain = () => pg.evaluate((id) => JSON.stringify((S.foodLog || []).find((x) => x && x.id === id) || null), idMain);
  const avantMain = await photoMain();
  await pg.evaluate((id) => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); openEditFood(id); }, idMain);
  await pg.waitForTimeout(150);
  const sansChamp = await pg.evaluate(() => !document.getElementById('ef-grams'));
  const qVide = await pg.evaluate(() => (document.getElementById('ef-q') || { value: 'ABSENT' }).value);
  await pg.fill('#ef-kcal', '150');
  await pg.evaluate(() => { const el = document.getElementById('toast'); if (el) { el.textContent = ''; el.className = ''; } });
  await pg.click('#ov-edit-food button[onclick="saveEditFood()"]');
  await pg.waitForTimeout(150);
  const refus8 = await pg.evaluate(() => { const el = document.getElementById('toast'); return { type: el ? el.className : '', toast: el ? el.textContent : '' }; });
  const apresRefus = await photoMain();
  t('B-NJQG-M ⑧ ancienne ligne SANS quantité : modifier sans quantité → refus, ligne strictement inchangée (rien de déduit)',
    sansChamp && qVide === '' && /error/.test(refus8.type) && apresRefus === avantMain, JSON.stringify({ sansChamp, qVide, refus8, change: apresRefus !== avantMain }));
  const champQ = await pg.isVisible('#ef-q');
  if (champQ) { await pg.fill('#ef-q', '300'); await pg.click('#ov-edit-food button[onclick="saveEditFood()"]'); await pg.waitForTimeout(150); }
  const l8 = await pg.evaluate((id) => (S.foodLog || []).find((x) => x && x.id === id), idMain);
  t('B-NJQG-M ⑧b … avec 300 g → modification enregistrée (150 kcal, 300 g), copie d\'origine gardée',
    champQ && !!l8 && l8.kcal === 150 && l8.q === 300 && !!l8.n2 && JSON.stringify(l8.n2.av) === avantMain,
    JSON.stringify({ champQ, kcal: l8 && l8.kcal, q: l8 && l8.q, av: !!(l8 && l8.n2 && l8.n2.av) }));

  t('B-NJQG ⑨ aucune erreur de page pendant le parcours', erreurs.length === 0, erreurs.join(' | '));
  await cx.close();
};
