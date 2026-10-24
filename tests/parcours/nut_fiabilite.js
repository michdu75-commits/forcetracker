/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   🍽️ NUTRITION V2 · FIABILITÉ DES DONNÉES (mission P1 de Michel, 24/10/2026) — bloc B-NFIAB
   Banc : tools/banc_nut_fiabilite.js · contrôle négatif : tools/mut_nut_fiabilite.py · dossier : docs/NUT-V2-FIABILITE.md
   POURQUOI : sur son iPhone, Michel a vu l'isolat repris à 40 g ne plus rien recalculer à 35 g ni à 50 g (« la fiche n'est pas
     vérifiée »), un steak haché scanné proposé « 200 g · 130 kcal · 22 g », deux propositions contradictoires du même aliment, et un
     aliment retiré revenir. Il veut des chiffres EXACTS, pas des écrans qui s'ouvrent.
   CONDUIT : la vraie app (Chromium), ses vrais gestes — scan caméra simulé (`_bcTraiterCode`, le code décodé), code tapé, recherche
     (CIQUAL, Open Food Facts, « Déjà noté par toi »), « Mes aliments » (reprendre, « + Ajouter », étoile, « ✕ »), le champ quantité,
     la pastille « la dernière fois », « Ajouter au journal », « ⭐ Corriger ce favori », photo d'étiquette et estimation IA
     (réponses SIMULÉES, aucun appel réel), le rechargement ; puis, avec le VRAI Code.js en local (outils de B-NIX) : la synchro,
     « 🔄 Restaurer », un 2ᵉ et un 3ᵉ appareil, le démarrage, et la remise à zéro préparée (admin).
   OBSERVE : les 4 champs de l'écran, les lignes écrites dans `S.foodLog` (valeurs, quantité, unité, fiche, identité, provenance,
     notes), « Mes aliments » et « Déjà noté par toi » (texte affiché), les favoris, les masquages, le profil au serveur, le journal
     avant/après (empreinte), le contexte de Milo (le texte envoyé, partie nutrition).
   NE COUVRE PAS : le vrai Open Food Facts (fiches servies ici), la vraie IA, l'iPhone (recette de Michel), le vrai serveur.
   ⛔ DONNÉES INVENTÉES (« (test) », codes-barres 30000000007xx, comptes example.test) + la fiche CIQUAL publique 6250.
   ⚖️ SUR UN CODE PLUS ANCIEN (master, contrôle « rouge avant ») : une fonction absente rend « ABSENTE » / null — le témoin
     ROUGIT, le banc ne plante pas (un plantage cacherait les témoins suivants).
   ⛔ ORACLES À LA MAIN (jamais lus dans le moteur) :
     Isolat, fiche 388,5 · 88 · 2,8 · 3,3 pour 100 g → 40 g = 155,4 → 155 · 35,2 → 35 · 1,12 → 1 · 1,32 → 1 ;
       35 g = 135,975 → 136 · 30,8 → 31 · 0,98 → 1 · 1,155 → 1 ; 50 g = 194,25 → 194 · 44 · 1,4 → 1 · 1,65 → 2.
     L'ancienne ligne (fiche notée 389 · 88 · 3 · 3) à 40 g = 155,6 → 156 · 35 · 1 · 1 (les chiffres vus par Michel).
     CIQUAL 6250 « Boeuf, steak haché 5% MG cru » 130 · 21,9 · 0,3 · 4,6 → 100 g = 130 · 22 · 0 · 5 ;
       200 g = 260 · 43,8 → 44 · 0,6 → 1 · 9,2 → 9 ; 250 g = 325 · 54,75 → 55 · 0,75 → 1 · 11,5 → 12.
     Steak scanné (fiche 129 · 21 · 0 · 5) → 200 g = 258 · 42 · 0 · 10. L'historique fabriqué : 65 · 11 · 0 · 3 (né le « 01/09 »).
     Jus (fiche pour 100 ml 45 · 0,7 · 10 · 0,1) → 250 ml = 112,5 → 113 · 1,75 → 2 · 25 · 0,25 → 0.
     Étiquette (94 · 5,2 · 12 · 2,4) → 150 g = 141 · 7,8 → 8 · 18 · 3,6 → 4. IA (500 · 30 · 50 · 20 pour 400 g) → 200 g = 250 · 15 · 25 · 10.
   ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const N2 = require('../../nutrition-v2.js');
const CR = require('./nut_v2_p1_croise.js').outils;

const J = (x) => JSON.stringify(x);
const pause = (pg, ms) => pg.waitForTimeout(ms);
const clic = async (pg, sel) => { try { await pg.click(sel, { timeout: 4000 }); return true; } catch (e) { return false; } };
const taper = async (pg, sel, v) => { try { await pg.fill(sel, String(v)); await pg.waitForTimeout(160); return true; } catch (e) { return false; } };
const PAD = (n) => String(n).padStart(2, '0');
const jour = (k) => { const x = new Date(Date.now() - k * 864e5); return x.getFullYear() + '-' + PAD(x.getMonth() + 1) + '-' + PAD(x.getDate()); };
const ilya = (k) => Date.now() - k * 864e5;
const vals = (l) => l ? { kcal: l.kcal, prot: l.prot, carbs: l.carbs, fat: l.fat } : null;
const memes = (a, b) => !!a && !!b && ['kcal', 'prot', 'carbs', 'fat'].every((c) => a[c] === b[c]);
const nb = (s) => String(s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

/* ── Les produits (Open Food Facts SIMULÉ) et les oracles ── */
const EAN_ISO = '3000000000700', EAN_STK = '3000000000717', EAN_JUS = '3000000000724';
const ISO_P100 = { kcal: 388.5, prot: 88, carbs: 2.8, fat: 3.3 };
const OFF_ISO = { status: 1, product: { code: EAN_ISO, product_name_fr: 'Iso zero (test)', quantity: '1 kg', product_quantity_unit: 'g',
  nutriments: { 'energy-kcal_100g': 388.5, proteins_100g: 88, carbohydrates_100g: 2.8, fat_100g: 3.3 } } };
const OFF_STK = { status: 1, product: { code: EAN_STK, product_name_fr: 'Steak haché 5% (test)', quantity: '500 g', product_quantity_unit: 'g',
  nutriments: { 'energy-kcal_100g': 129, proteins_100g: 21, carbohydrates_100g: 0, fat_100g: 5 } } };
const OFF_JUS = { status: 1, product: { code: EAN_JUS, product_name_fr: 'Jus (test)', quantity: '1 l', product_quantity_unit: 'ml', serving_quantity: 250,
  nutriments: { 'energy-kcal_100g': 45, proteins_100g: 0.7, carbohydrates_100g: 10, fat_100g: 0.1 } } };
const A = {
  iso40: { kcal: 155, prot: 35, carbs: 1, fat: 1 }, iso35: { kcal: 136, prot: 31, carbs: 1, fat: 1 }, iso50: { kcal: 194, prot: 44, carbs: 1, fat: 2 },
  isoAncien40: { kcal: 156, prot: 35, carbs: 1, fat: 1 },
  ciq100: { kcal: 130, prot: 22, carbs: 0, fat: 5 }, ciq200: { kcal: 260, prot: 44, carbs: 1, fat: 9 }, ciq250: { kcal: 325, prot: 55, carbs: 1, fat: 12 },
  stk200: { kcal: 258, prot: 42, carbs: 0, fat: 10 }, jus250: { kcal: 113, prot: 2, carbs: 25, fat: 0 },
  etiq150: { kcal: 141, prot: 8, carbs: 18, fat: 4 }, ia200: { kcal: 250, prot: 15, carbs: 25, fat: 10 },
};
const T = (o) => o.kcal + '/' + o.prot + '/' + o.carbs + '/' + o.fat;

/* ── Le journal d'AVANT V2 (formes réelles, données inventées) ── */
const ANC_ISO = { id: 'nfiab-iso-anc-0001', date: jour(3), ts: ilya(3), meal: 'collation', name: 'Iso zero (test)', q: 40, u: 'g', kcal: 156, prot: 35, carbs: 1, fat: 1,
  per100: { kcal: 389, prot: 88, carbs: 3, fat: 3 }, sourceId: EAN_ISO, saisie: 'scan', origine: 'off', etat: 'tel-que-vendu', v: 1 };
const STK = (id, k, q, v, p100, saisie) => ({ id, date: jour(k), ts: ilya(k), meal: 'dejeuner', name: 'Steak haché 5% (test)', q, u: 'g',
  kcal: v[0], prot: v[1], carbs: v[2], fat: v[3], per100: p100, sourceId: EAN_STK, saisie, origine: saisie === 'scan' ? 'off' : 'reprise', etat: 'tel-que-vendu', v: 1 });
const STK_823 = STK('nfiab-stk-0000823', 60, 250, [323, 53, 0, 13], { kcal: 129, prot: 21, carbs: 0, fat: 5 }, 'scan');
const STK_901 = STK('nfiab-stk-0000901', 50, 300, [194, 32, 0, 8], { kcal: 65, prot: 11, carbs: 0, fat: 3 }, 'liste');
const STK_1016 = STK('nfiab-stk-0001016', 2, 200, [130, 22, 0, 6], { kcal: 65, prot: 11, carbs: 0, fat: 3 }, 'liste');
const RIZ_SANSQ = { id: 'nfiab-riz-sansq01', date: jour(4), ts: ilya(4), meal: 'diner', name: 'Riz (test)', kcal: 130, prot: 3, carbs: 28, fat: 0,
  per100: { kcal: 130, prot: 2.7, carbs: 28.2, fat: 0.3 }, q: null, u: null, v: 1, saisie: 'liste', origine: 'reprise' };
/* Une ligne V2 VÉRIFIÉE de l'isolat (un scan fait depuis V2), écrite par le vrai moteur. */
const V2_ISO = N2.ligneNouvelle({ id: 'nfiab-iso-v2-00001', ts: ilya(1), date: jour(1), repas: 'collation', nom: 'Iso zero (test)',
  origine: { saisie: 'camera-code-local', origine: 'off' }, mode: 'pesee',
  fiche: { base: 'g', p100: ISO_P100, cle: EAN_ISO, source: 'off', fiab: 'source', etat: 'tel-que-vendu' },
  quantite: { val: 40, unite: 'g', origine: 'tapee' } }).ligne;
/* Un favori de l'isolat, d'avant V2, qui porte son code-barres (l'étoile le copie depuis le 23/10) : 26 g de protéines, M4. */
const FAV_ISO_ID = { name: 'Iso zero (test)', kcal: 156, prot: 26, carbs: 1, fat: 1, per100: { kcal: 389, prot: 88, carbs: 3, fat: 3 }, q: 40, u: 'g', sourceId: EAN_ISO };
/* Le favori réel de Michel, dans sa forme (21/10) : sans code-barres, sans quantité. */
const FAV_ISO_NOM = { name: 'Iso zero protein (test)', kcal: 156, prot: 26, carbs: 1, fat: 1, per100: null, q: 0, u: null };
/* La ligne du journal notée DEPUIS ce favori (26 g de protéines pour 40 g) : corriger le favori ne doit jamais la réécrire. */
const ISO_PROT_J = { id: 'nfiab-isoprot-0001', date: jour(5), ts: ilya(5), meal: 'collation', name: 'Iso zero protein (test)', q: 40, u: 'g',
  kcal: 156, prot: 26, carbs: 1, fat: 1, per100: null, v: 1, saisie: 'liste', origine: 'reprise' };

function fixture(cle, lignes, favs, plus) {
  const D = Object.assign({ ft4_ob2: '1', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_foodlog: J(lignes || []), ft4_savedfoods: J(favs || []) }, plus || {});
  return `(() => { try { if (sessionStorage.getItem('${cle}')) return; sessionStorage.setItem('${cle}', '1'); localStorage.clear();
    const D = ${J(D)}; Object.keys(D).forEach((k) => localStorage.setItem(k, D[k])); } catch (e) {} })();`;
}
/* Une page : la vraie app ; Open Food Facts servi d'ici (`off` = {produits, recherche}) ou COUPÉ (`off` = null) ; tout le reste
   hors localhost est coupé ET compté. */
async function ouvrir(b, PORT, fix, off) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const pg = await cx.newPage(); const erreurs = [], sorties = [], servis = [];
  pg.on('pageerror', (e) => erreurs.push(String(e && e.message || e).slice(0, 160))); pg.on('dialog', (d) => d.accept());
  await pg.route('**/*', (r) => {
    const u = new URL(r.request().url());
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return r.continue();
    if (/openfoodfacts/.test(u.hostname) && off) {
      if (/search/.test(u.pathname)) return r.fulfill({ status: 200, contentType: 'application/json', body: J({ products: off.recherche || [] }) });
      const e = Object.keys(off.produits || {}).find((x) => u.pathname.indexOf(x) >= 0);
      const servir = async () => { await r.fulfill({ status: 200, contentType: 'application/json', body: J(e ? off.produits[e] : { status: 0 }) }); servis.push(Date.now()); };
      /* `delai` : une fiche qui arrive EN RETARD (réseau lent), pour vérifier qu'elle ne s'applique jamais à un autre aliment. */
      return off.delai ? new Promise((ok) => setTimeout(() => ok(servir()), off.delai)) : servir();
    }
    sorties.push(u.hostname); return r.abort();
  });
  await pg.addInitScript(fix);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pause(pg, 1500);
  await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open'));
    window.__toasts = []; const v = window.toast; window.toast = function (m) { window.__toasts.push(String(m)); try { return v.apply(this, arguments); } catch (e) {} }; });
  const ok = (await clic(pg, '#nb-nutrition')) && (await pause(pg, 350), await clic(pg, '#ntab-journal'));
  await pause(pg, 250);
  return { cx, pg, erreurs, sorties, servis, ok };
}
const journal = (pg) => pg.evaluate(() => JSON.parse(JSON.stringify(S.foodLog || [])));
const ecran = (pg) => pg.evaluate(() => ['kcal', 'prot', 'carbs', 'fat'].map((c) => document.getElementById('af-' + c).value).join('/'));
const dernierToast = (pg) => pg.evaluate(() => (window.__toasts || []).slice(-1)[0] || '');
/* Ouvrir l'écran d'ajout comme une personne (le bouton du journal) ; si un toast le recouvre encore, la MÊME fonction, appelée par le bouton. */
const ouvrirAjout = async (pg) => { let ok = await clic(pg, 'button[onclick="addFoodVia(\'main\')"]');
  if (!ok) ok = await pg.evaluate(() => { try { addFoodVia('main'); return document.getElementById('ov-add-food').classList.contains('open'); } catch (e) { return false; } });
  await pause(pg, 300); return ok; };
const ajouter = async (pg) => { const ok = await clic(pg, 'button[onclick="addFoodEntry()"]'); await pause(pg, 350); return ok; };
/* Le texte d'une proposition : seulement la ligne des valeurs (ni l'étoile, ni le nom, ni les boutons). */
const mesAliments = (pg) => pg.evaluate(() => (_afQuickItems || []).map((it, i) => { const el = document.querySelector('#af-quick-list div[onclick="quickFillFood(' + i + ')"]');
  return { i, nom: it.name, fav: !!it.fav, sid: (it._src || {}).sourceId || null, txt: (el && el.children[1]) ? el.children[1].innerText.replace(/\s+/g, ' ') : '' }; }));
const dejaNote = (pg, q) => pg.evaluate((q) => { _afSuggLoc = _afSuggLocales(q); _afSuggCiq = []; _afSuggOff = []; _afSuggMarq = []; _afSuggRendu();
  return [...document.querySelectorAll('#af-sugg [onclick^="_afSuggPrendreLocale"]')].map((x) => (x.children[1] && x.children[1].children[1]) ? x.children[1].children[1].innerText.replace(/\s+/g, ' ') : ''); }, q);
const neuves = (L, avant) => L.filter((x) => x && avant.indexOf(x.id) < 0);

async function choisirCiqual(pg, texte, code) {
  await taper(pg, '#af-desc', texte); await pg.evaluate(() => { try { _afSuggInput(); } catch (e) {} });
  let i = -1; for (let k = 0; k < 24 && i < 0; k++) { await pause(pg, 250); i = await pg.evaluate((c) => (typeof _afSuggCiq !== 'undefined' && _afSuggCiq || []).findIndex((a) => a && a[0] === c), code); }
  const txt = i < 0 ? '' : await pg.evaluate((i) => { const x = document.querySelector('#af-sugg [onclick="_afSuggPrendreCiqual(' + i + ')"]');
    return (x && x.children[1] && x.children[1].children[1]) ? x.children[1].children[1].innerText.replace(/\s+/g, ' ') : ''; }, i);
  const ok = i >= 0 && await clic(pg, '#af-sugg [onclick="_afSuggPrendreCiqual(' + i + ')"]'); await pause(pg, 250);
  return { ok, txt };
}

async function ecranFiab(t, b, PORT) {
  console.log('\n-- B-NFIAB. NUTRITION V2 · FIABILITÉ DES DONNÉES (mission P1 du 24/10) — à l\'écran --');
  const ERR = [], SORTIES = [];
  const fin = async (o) => { ERR.push(...o.erreurs); SORTIES.push(...o.sorties); await o.cx.close(); };

  /* ═══ T01 — ISOLAT, FICHE FIABLE : scan caméra (le code décodé), 40 g puis 35 g puis 50 g ═══ */
  { const o = await ouvrir(b, PORT, fixture('t01', []), { produits: { [EAN_ISO]: OFF_ISO } }); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg);
    const lu = await pg.evaluate(async (c) => { try { _bcSetEtat('SCANNING'); } catch (e) {} return await _bcTraiterCode(c); }, EAN_ISO);
    await pause(pg, 500);
    const v = {}; for (const q of [40, 35, 50]) { g = g && await taper(pg, '#af-bc-grams', q); v[q] = await ecran(pg); }
    const avant = (await journal(pg)).map((x) => x.id); g = g && await ajouter(pg);
    const L = await journal(pg), l = neuves(L, avant)[0] || null;
    t('B-NFIAB T01 ① ISOLAT, FICHE FIABLE (scan) : 40 g = 155·35·1·1, 35 g = 136·31·1·1, 50 g = 194·44·1·2 — chaque quantité recalcule les 4 valeurs',
      g && lu === true && v[40] === T(A.iso40) && v[35] === T(A.iso35) && v[50] === T(A.iso50), J({ lu, v }));
    t('B-NFIAB T01 ② (T11) ce qui s\'écrit est ce qui s\'affichait : 50 g, 194·44·1·2, la fiche pour 100 g gardée (388,5·88·2,8·3,3), le code-barres, provenance scan / Open Food Facts « source »',
      !!l && l.q === 50 && l.u === 'g' && memes(vals(l), A.iso50) && memes(l.per100, ISO_P100) && l.sourceId === EAN_ISO
      && l.saisie === 'camera-code-local' && l.origine === 'off' && l.n2 && l.n2.f.src === 'off' && l.n2.f.fiab === 'source', J(l));
    await fin(o); }

  /* ═══ T02 — ISOLAT HISTORIQUE : l'ancienne ligne scannée (40 g, 156·35·1·1, fiche notée NON vérifiable) ═══ */
  /* ② a — hors ligne : aucun calcul inventé, mais trois issues (plus une impasse) ; la copie garde son code-barres */
  { const o = await ouvrir(b, PORT, fixture('t02a', [ANC_ISO]), null); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg);
    g = g && await clic(pg, '#af-quick-list div[onclick="quickFillFood(0)"]'); await pause(pg, 1100);
    const st = await pg.evaluate(() => ({ fige: !!(_afRef && _afRef.fige), bc: !!_bcNutr,
      etat: (document.getElementById('af-retrouver-etat') || {}).textContent || '',
      boutons: [...document.querySelectorAll('#af-prop-row button')].map((x) => x.textContent.trim()) }));
    const v40 = await ecran(pg); g = g && await taper(pg, '#af-prop', '35'); const v35 = await ecran(pg);
    const n0 = (await journal(pg)).length; await ajouter(pg); const n1 = (await journal(pg)).length; const msg = await dernierToast(pg);
    t('B-NFIAB T02 ① HORS LIGNE, AUCUN CALCUL INVENTÉ : l\'ancienne ligne reste 156·35·1·1 « pour 40 g », une autre quantité ne la recalcule pas, et « Ajouter » le refuse en le disant',
      g && st.fige && !st.bc && v40 === T(A.isoAncien40) && v35 === T(A.isoAncien40) && n1 === n0 && /valent pour 40 g/.test(msg), J({ st, v40, v35, n0, n1, msg }));
    t('B-NFIAB T02 ② ⭐ LE CAS FIGÉ N\'EST PLUS UNE IMPASSE : « 🔎 Retrouver l\'aliment », « 📷 Scanner le code-barres », « 🏷️ Saisir l\'étiquette » à l\'écran, et la recherche de sa fiche dit qu\'elle a échoué',
      ['Retrouver l\'aliment', 'Scanner le code-barres', 'Saisir l\'étiquette'].every((x) => st.boutons.some((y) => y.indexOf(x) >= 0)) && /introuvable/i.test(st.etat), J(st));
    g = await taper(pg, '#af-prop', ''); g = g && await clic(pg, '#af-prop-pastille'); const av = (await journal(pg)).map((x) => x.id); await ajouter(pg);
    const c = neuves(await journal(pg), av)[0] || null;
    t('B-NFIAB T02 ③ ⭐ LA RECOPIE GARDE L\'IDENTITÉ DU PRODUIT : 40 g, 156·35·1·1 « non vérifié », et son code-barres (avant : `sourceId:null`, le produit redevenait un nom)',
      g && !!c && c.q === 40 && memes(vals(c), A.isoAncien40) && c.sourceId === EAN_ISO && c.n2 && c.n2.m === 'd' && (c.n2.no || []).indexOf('reprise-non-verifiee') >= 0, J(c));
    await fin(o); }
  /* ② b — en ligne : la fiche se retrouve par son code-barres, et la quantité recalcule */
  { const o = await ouvrir(b, PORT, fixture('t02b', [ANC_ISO]), { produits: { [EAN_ISO]: OFF_ISO } }); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg);
    g = g && await clic(pg, '#af-quick-list div[onclick="quickFillFood(0)"]'); await pause(pg, 1100);
    const st = await pg.evaluate(() => ({ bc: !!_bcNutr, nom: (document.getElementById('af-bc-name') || {}).textContent || '',
      past: (() => { const x = document.getElementById('af-bc-last'); return x && x.offsetParent !== null ? x.textContent : ''; })() }));
    const v = {}; for (const q of [35, 50]) { g = g && await taper(pg, '#af-bc-grams', q); v[q] = await ecran(pg); }
    const av = (await journal(pg)).map((x) => x.id); await ajouter(pg); const l = neuves(await journal(pg), av)[0] || null;
    t('B-NFIAB T02 ④ ⭐⭐ EN LIGNE, LA FICHE D\'ORIGINE SE RETROUVE PAR LE CODE-BARRES : 35 g = 136·31·1·1, 50 g = 194·44·1·2 ; l\'écran le dit, avec ce que disait l\'ancienne saisie, et propose « 40 g » (sans le poser)',
      g && st.bc && /fiche retrouvée par son code-barres/.test(st.nom) && /ta saisie disait 156 kcal · P 35 pour 40 g/.test(st.nom) && /40\s*g/.test(st.past)
      && v[35] === T(A.iso35) && v[50] === T(A.iso50), J({ st, v }));
    t('B-NFIAB T02 ⑤ (T11) la ligne écrite : 50 g, 194·44·1·2, fiche Open Food Facts « source », code-barres gardé — l\'ancienne ligne est INTACTE',
      !!l && l.q === 50 && memes(vals(l), A.iso50) && l.sourceId === EAN_ISO && l.origine === 'off' && l.n2.f.fiab === 'source'
      && J((await journal(pg)).find((x) => x.id === ANC_ISO.id)) === J(ANC_ISO), J(l));
    await fin(o); }
  /* ② c — hors ligne, mais un scan V2 du même code-barres existe, et un favori d'avant V2 (26 g de protéines) le contredit.
     ⛔ RÈGLE A DE D-111 (Michel, 24/10 : « conserver la règle A ») : dans la LISTE, rien n'est recalculé en silence — la ligne
     vérifiée reste visible, le favori se dit « à vérifier », « + Ajouter » n'écrit rien et ouvre l'écran. ⭐ DANS L'ÉCRAN, la
     fiche de son code-barres est retrouvée (D-130), l'écran dit ce que disait la saisie, et c'est « Ajouter » qui écrit. */
  { const o = await ouvrir(b, PORT, fixture('t02c', [V2_ISO], [FAV_ISO_ID]), null); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg);
    const M = await mesAliments(pg), f = M.find((x) => x.fav) || {}, ver = M.find((x) => !x.fav && x.sid === EAN_ISO) || {};
    const av = (await journal(pg)).map((x) => x.id);
    g = g && await clic(pg, '#af-quick-list button[onclick="quickAddFood(' + f.i + ')"]'); await pause(pg, 700);
    const rien = neuves(await journal(pg), av).length === 0;
    const st = await pg.evaluate(() => ({ ouvert: document.getElementById('ov-add-food').classList.contains('open'), bc: !!_bcNutr,
      nom: (document.getElementById('af-bc-name') || {}).textContent || '',
      past: (() => { const x = document.getElementById('af-bc-last'); return x && x.offsetParent !== null ? x.textContent : ''; })() }));
    g = g && await clic(pg, '#af-bc-last'); await pause(pg, 250); const v = await ecran(pg);
    await ajouter(pg); const l = neuves(await journal(pg), av)[0] || null;
    t('B-NFIAB T02 ⑥ (T10) ⛔ RÈGLE A (D-111) : dans la liste, la ligne vérifiée « 155 kcal · pour 40 g · P 35 » reste visible et le favori à 26 g se dit « ⚠️ à vérifier » ; « + Ajouter » sur lui n\'écrit RIEN et ouvre l\'écran',
      g && /^155 kcal · pour 40 g · P 35 · G 1 · L 1$/.test(nb(ver.txt)) && /^156 kcal · pour 40 g · P 26 · G 1 · L 1 · ⚠️ à vérifier/.test(nb(f.txt))
      && rien && st.ouvert, J({ M, rien, st }));
    t('B-NFIAB T02 ⑥b (T10) ⭐⭐ DANS L\'ÉCRAN, LA MÊME FICHE ET LA MÊME QUANTITÉ DONNENT LE MÊME RÉSULTAT : la fiche de son code-barres est retrouvée, l\'écran dit « ta saisie disait 156 kcal · P 26 pour 40 g », « 40 g » proposé (pas posé), puis « Ajouter » écrit 155·35·1·1 par la fiche',
      g && st.bc && /fiche du produit retrouvée par son code-barres/.test(st.nom) && /ta saisie disait 156 kcal · P 26 pour 40 g/.test(st.nom) && /40\s*g/.test(st.past)
      && v === T(A.iso40) && !!l && memes(vals(l), A.iso40) && l.q === 40 && l.sourceId === EAN_ISO && l.n2.m === 'p' && l.n2.f.fiab === 'source', J({ st, v, l }));
    await fin(o); }

  /* ② d — un résultat qui arrive TROP TARD ne s'applique jamais à un autre aliment : la fiche de l'isolat (réseau lent) arrive
     après que la personne a choisi le steak CIQUAL. */
  { const o = await ouvrir(b, PORT, fixture('t02d', [ANC_ISO]), { produits: { [EAN_ISO]: OFF_ISO }, delai: 4500 }); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg);
    g = g && await clic(pg, '#af-quick-list div[onclick="quickFillFood(0)"]'); await pause(pg, 300);
    const c = await choisirCiqual(pg, 'steak haché 5', 6250); g = g && c.ok;
    const choisi = Date.now();
    for (let k = 0; k < 40 && !o.servis.length; k++) await pause(pg, 250);   // on attend que la fiche de l'isolat soit servie…
    await pause(pg, 700);                                                      // …et que l'app ait pu la traiter
    const tard = o.servis.length > 0 && o.servis[0] > choisi;                  // ⚖️ le témoin n'a de sens que si elle arrive APRÈS le choix
    const st = await pg.evaluate(() => ({ nom: (document.getElementById('af-bc-name') || {}).textContent || '', k: _bcNutr ? _bcNutr.kcal100 : null }));
    g = g && await taper(pg, '#af-bc-grams', 100); const v = await ecran(pg);
    const av = (await journal(pg)).map((x) => x.id); await ajouter(pg); const l = neuves(await journal(pg), av)[0] || null;
    t('B-NFIAB T02 ⑦ ⛔ UNE FICHE QUI ARRIVE EN RETARD NE S\'APPLIQUE JAMAIS À UN AUTRE ALIMENT : celle de l\'isolat arrive après le choix du steak CIQUAL — l\'écran reste le steak (130 kcal pour 100 g), la ligne aussi',
      g && tard && st.k === 130 && !/Iso/.test(st.nom) && v === T(A.ciq100) && !!l && l.sourceId === 'ciqual:6250' && memes(vals(l), A.ciq100), J({ tard, st, v, l }));
    await fin(o); }

  /* ═══ T03 — CIQUAL : « Boeuf, steak haché 5% MG cru » (6250) pour 100, 200 et 250 g ═══ */
  { const o = await ouvrir(b, PORT, fixture('t03', []), null); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg);
    const c = await choisirCiqual(pg, 'steak haché 5', 6250); g = g && c.ok;
    const v = {}; for (const q of [100, 200, 250]) { g = g && await taper(pg, '#af-bc-grams', q); v[q] = await ecran(pg); }
    const av = (await journal(pg)).map((x) => x.id); await ajouter(pg); const l = neuves(await journal(pg), av)[0] || null;
    t('B-NFIAB T03 ① (§6) la référence CIQUAL se dit POUR 100 g, dans l\'ordre calories → quantité → P → G → L : « 130 kcal · pour 100 g · P 21,9 · G 0,3 · L 4,6 »',
      /^130 kcal · pour 100 g · P 21,9 · G 0,3 · L 4,6$/.test(nb(c.txt)), c.txt);
    t('B-NFIAB T03 ② ⭐ CIQUAL, CHIFFRES EXACTS : 100 g = 130·22·0·5, 200 g = 260·44·1·9, 250 g = 325·55·1·12 (43,8 → 44 et 54,75 → 55 : l\'app arrondit à l\'entier)',
      g && v[100] === T(A.ciq100) && v[200] === T(A.ciq200) && v[250] === T(A.ciq250), J(v));
    t('B-NFIAB T03 ③ (T09, T11) la ligne : 250 g, 325·55·1·12, la fiche CIQUAL INTACTE (130·21,9·0,3·4,6), `ciqual:6250`, provenance CIQUAL « source »',
      !!l && l.q === 250 && memes(vals(l), A.ciq250) && memes(l.per100, { kcal: 130, prot: 21.9, carbs: 0.3, fat: 4.6 }) && l.sourceId === 'ciqual:6250'
      && l.saisie === 'ciqual' && l.origine === 'ciqual' && l.n2.f.src === 'ciqual' && l.n2.f.fiab === 'source', J(l));
    await fin(o); }

  /* ═══ T04 + T05 — CODE-BARRES (tapé) : la fiche, le calcul, l'enregistrement — puis l'app fermée et rouverte ═══ */
  { const o = await ouvrir(b, PORT, fixture('t04', []), { produits: { [EAN_STK]: OFF_STK, [EAN_JUS]: OFF_JUS } }); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg);
    g = g && await taper(pg, '#af-bc-manual', EAN_STK); g = g && await clic(pg, 'button[onclick="_manualBarcode()"]'); await pause(pg, 800);
    const nom = await pg.evaluate(() => (document.getElementById('af-bc-name') || {}).textContent || '');
    const sansQ = await ecran(pg);
    g = g && await taper(pg, '#af-bc-grams', 200); const v200 = await ecran(pg);
    const av = (await journal(pg)).map((x) => x.id); await ajouter(pg); const l = neuves(await journal(pg), av)[0] || null;
    t('B-NFIAB T04 ① CODE-BARRES : la fiche du produit est celle d\'Open Food Facts (129 kcal pour 100 g), et 200 g = 258·42·0·10',
      g && /129 kcal\/100g/.test(nom) && v200 === T(A.stk200), J({ nom, sansQ, v200 }));
    t('B-NFIAB T04 ② (T09, T11) la ligne : 200 g, 258·42·0·10, la fiche 129·21·0·5, le code-barres, « code tapé » / Open Food Facts — ni CIQUAL ni l\'historique',
      !!l && l.q === 200 && memes(vals(l), A.stk200) && memes(l.per100, { kcal: 129, prot: 21, carbs: 0, fat: 5 }) && l.sourceId === EAN_STK
      && l.saisie === 'code-tape' && l.origine === 'off' && l.n2.f.src === 'off', J(l));
    /* T09 ml — une boisson est une fiche pour 100 ml */
    g = await ouvrirAjout(pg);
    g = g && await taper(pg, '#af-bc-manual', EAN_JUS); g = g && await clic(pg, 'button[onclick="_manualBarcode()"]'); await pause(pg, 800);
    g = g && await clic(pg, '#af-bc-portion'); const av2 = (await journal(pg)).map((x) => x.id); await ajouter(pg);
    const j = neuves(await journal(pg), av2)[0] || null;
    t('B-NFIAB T04 ③ ml : la boisson est une fiche pour 100 ml — 250 ml = 113·2·25·0, la ligne est en ml',
      g && !!j && j.q === 250 && j.u === 'ml' && memes(vals(j), A.jus250) && j.n2.f.base === 'ml', J(j));
    const avantRel = J((await journal(pg)).slice().sort((a, b) => a.id < b.id ? -1 : 1));
    await pg.reload(); await pause(pg, 1700);
    await pg.evaluate(() => document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')));
    const apresRel = J((await journal(pg)).slice().sort((a, b) => a.id < b.id ? -1 : 1));
    await clic(pg, '#nb-nutrition'); await pause(pg, 300); await clic(pg, '#ntab-journal'); await pause(pg, 300);
    const rangee = await pg.evaluate(() => { const r = [...document.querySelectorAll('[onclick^="openEditFood"]')].find((x) => /Steak haché 5% \(test\)/.test(x.textContent)); return r ? r.textContent.replace(/\s+/g, ' ') : ''; });
    t('B-NFIAB T05 ⭐ RÉOUVERTURE : l\'app fermée puis rouverte, le journal est identique à l\'octet (quantités, valeurs, fiches) et l\'écran redit 258 kcal pour le steak',
      avantRel === apresRel && /258/.test(rangee) && /P 42/.test(rangee), J({ rangee, n: JSON.parse(apresRel).length }));
    await fin(o); }

  /* ═══ T06 + T10 — L'HISTORIQUE DU STEAK : un pour-100 g FABRIQUÉ (65 au lieu de 129), recopié ═══ */
  { const o = await ouvrir(b, PORT, fixture('t06', [STK_823, STK_901, STK_1016, RIZ_SANSQ]), null); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg);
    const M = await mesAliments(pg), st = M.find((x) => /Steak/.test(x.nom)) || {}, riz = M.find((x) => /Riz/.test(x.nom)) || {};
    const D = await dejaNote(pg, 'steak');
    t('B-NFIAB T06 ① ⭐⭐ LE STEAK « 200 g · 130 kcal · 22 g » N\'EST PLUS PROPOSÉ EN SILENCE : « 130 kcal · pour 200 g · P 22 · G 0 · L 6 · ⚠️ à vérifier » dans « Mes aliments » ET « Déjà noté par toi »',
      /^130 kcal · pour 200 g · P 22 · G 0 · L 6 · ⚠️ à vérifier/.test(nb(st.txt)) && D.length >= 1 && /130 kcal · pour 200 g · P 22 · G 0 · L 6 · ⚠️ à vérifier/.test(nb(D[0])), J({ st, D }));
    t('B-NFIAB T06 ② (T06) une ancienne ligne SANS quantité ne présente jamais son pour-100 g comme mangé : « 130 kcal · quantité à préciser · … · non vérifié »',
      /^130 kcal · quantité à préciser · P 3 · G 28 · L 0 · non vérifié/.test(nb(riz.txt)) && !/pour 100/.test(riz.txt), J(riz));
    const av = (await journal(pg)).map((x) => x.id);
    g = g && await clic(pg, '#af-quick-list button[onclick="quickAddFood(' + st.i + ')"]'); await pause(pg, 900);
    const nv = neuves(await journal(pg), av);
    const fig = await pg.evaluate(() => ({ fige: !!(_afRef && _afRef.fige), txt: ((document.getElementById('af-prop-row') || {}).innerText || '').replace(/\s+/g, ' ') }));
    t('B-NFIAB T06 ③ ⭐ « + Ajouter » ne recopie pas l\'erreur : rien n\'est écrit, l\'écran s\'ouvre et dit POURQUOI — « tes saisies de ce produit ne concordent pas : 65 kcal pour 100 g ici, 129 le … »',
      g && nv.length === 0 && fig.fige && /ne concordent pas : 65 kcal pour 100 g ici, 129(,2)? le \d\d\/\d\d/.test(fig.txt), J({ nv, fig }));
    await fin(o); }
  { const o = await ouvrir(b, PORT, fixture('t06b', [STK_823, STK_901, STK_1016]), { produits: { [EAN_STK]: OFF_STK } }); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg);
    await dejaNote(pg, 'steak');
    const i = await pg.evaluate(() => (_afSuggLoc || []).findIndex((e) => e.id === 'nfiab-stk-0001016'));
    g = g && i >= 0 && await clic(pg, '#af-sugg [onclick="_afSuggPrendreLocale(' + i + ')"]'); await pause(pg, 1100);
    const nom = await pg.evaluate(() => (document.getElementById('af-bc-name') || {}).textContent || '');
    g = g && await taper(pg, '#af-bc-grams', 200); const v = await ecran(pg);
    const av = (await journal(pg)).map((x) => x.id); await ajouter(pg); const l = neuves(await journal(pg), av)[0] || null;
    t('B-NFIAB T06 ④ ⭐⭐ EN LIGNE, le steak repris de « Déjà noté par toi » retrouve la fiche de son code-barres : 200 g = 258·42·0·10 (et plus 130·22), l\'écran dit ce que disait l\'ancienne saisie',
      g && /fiche retrouvée par son code-barres/.test(nom) && /ta saisie disait 130 kcal · P 22 pour 200 g/.test(nom) && v === T(A.stk200)
      && !!l && memes(vals(l), A.stk200) && l.q === 200 && l.sourceId === EAN_STK && l.n2.f.fiab === 'source', J({ nom, v, l }));
    await fin(o); }

  /* ═══ N2 « ✕ » — masqué partout (« Déjà noté par toi » compris) ; re-noté, il revient de lui-même ═══ */
  { const o = await ouvrir(b, PORT, fixture('n2x', [ANC_ISO]), { produits: { [EAN_ISO]: OFF_ISO } }); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg);
    g = g && await clic(pg, '#af-quick-list button[onclick="deleteQuickFood(0)"]'); await pause(pg, 250); g = g && await clic(pg, '#confirm-ok'); await pause(pg, 300);
    const apres = { mes: (await mesAliments(pg)).length, deja: (await dejaNote(pg, 'iso zero')).length, masques: await pg.evaluate(() => S.hiddenFoods) };
    t('B-NFIAB N2 ① ⭐ « ✕ » MASQUE AUSSI DANS « DÉJÀ NOTÉ PAR TOI » (avant : la recherche l\'ignorait) — une date de départ par identité, le journal intact',
      g && apres.mes === 0 && apres.deja === 0 && apres.masques.length === 1 && apres.masques[0].k === 'id:' + EAN_ISO && apres.masques[0].t > ANC_ISO.ts
      && (await journal(pg)).length === 1, J(apres));
    await pg.evaluate(() => { document.getElementById('af-desc').value = ''; try { _afSuggVider(); } catch (e) {} });
    g = await taper(pg, '#af-bc-manual', EAN_ISO); g = g && await clic(pg, 'button[onclick="_manualBarcode()"]'); await pause(pg, 800);
    g = g && await taper(pg, '#af-bc-grams', 40); await ajouter(pg);
    await ouvrirAjout(pg);
    const revu = await dejaNote(pg, 'iso zero');
    t('B-NFIAB N2 ② re-noté APRÈS « ✕ », il revient de lui-même (re-noter, c\'est le vouloir) — seule la ligne nouvelle est proposée, à 155 kcal pour 40 g',
      g && revu.length === 1 && /^155 kcal · pour 40 g · P 35 · G 1 · L 1/.test(nb(revu[0])), J(revu));
    await fin(o); }

  /* ═══ QUANTITÉS VIDES, NULLES, INVALIDES — rien ne s'écrit ═══ */
  { const o = await ouvrir(b, PORT, fixture('qte', [ANC_ISO]), null); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg); const c = await choisirCiqual(pg, 'steak haché 5', 6250); g = g && c.ok;
    const refus = [];
    for (const q of ['', '0', '-5', 'abc']) { await taper(pg, '#af-bc-grams', q); const n0 = (await journal(pg)).length; await ajouter(pg); refus.push((await journal(pg)).length === n0); }
    await pg.evaluate(() => closeAddFood()); g = g && await ouvrirAjout(pg);
    g = g && await clic(pg, '#af-quick-list div[onclick="quickFillFood(0)"]'); await pause(pg, 900);
    for (const q of ['', '0']) { await taper(pg, '#af-prop', q); const n0 = (await journal(pg)).length; await ajouter(pg); refus.push((await journal(pg)).length === n0); }
    t('B-NFIAB Q ⛔ une quantité vide, nulle, négative ou illisible n\'écrit RIEN — fiche CIQUAL (4 cas) comme reprise figée (2 cas)', g && refus.length === 6 && refus.every(Boolean), J(refus));
    await fin(o); }

  /* ═══ T09 — LES 8 CHEMINS DE SAISIE, LEURS SOURCES SÉPARÉES (recherche OFF, favori, manuel, étiquette, IA) ═══ */
  { const o = await ouvrir(b, PORT, fixture('t09', [V2_ISO]), { produits: { [EAN_ISO]: OFF_ISO }, recherche: [OFF_ISO.product] }); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg);
    /* ② recherche Open Food Facts par nom */
    g = g && await taper(pg, '#af-desc', 'iso zero'); await pg.evaluate(() => { try { _afSuggInput(); } catch (e) {} });
    let iO = -1; for (let k = 0; k < 20 && iO < 0; k++) { await pause(pg, 250); iO = await pg.evaluate(() => (typeof _afSuggOff !== 'undefined' && _afSuggOff || []).findIndex((p) => p && p.code)); }
    const txtOff = iO < 0 ? '' : await pg.evaluate((i) => { const x = document.querySelector('#af-sugg [onclick="_afSuggPrendreOff(' + i + ')"]');
      return (x && x.children[1] && x.children[1].children[1]) ? x.children[1].children[1].innerText.replace(/\s+/g, ' ') : ''; }, iO);
    g = g && iO >= 0 && await clic(pg, '#af-sugg [onclick="_afSuggPrendreOff(' + iO + ')"]'); await pause(pg, 300);
    g = g && await taper(pg, '#af-bc-grams', 40); let av = (await journal(pg)).map((x) => x.id); await ajouter(pg);
    const lOff = neuves(await journal(pg), av)[0] || null;
    /* ⑥ saisie à la main : valeurs + poids → « déclarées » */
    const gOff = g; let gM = await ouvrirAjout(pg) && await taper(pg, '#af-desc', 'Plat maison (test)');
    for (const [id, v] of [['#af-kcal', '450'], ['#af-prot', '20'], ['#af-carbs', '40'], ['#af-fat', '18']]) gM = gM && await taper(pg, id, v);
    try { await pg.locator('#af-fat').blur(); } catch (e) { gM = false; }
    await pause(pg, 200); gM = gM && await taper(pg, '#af-poids', '300'); try { await pg.locator('#af-poids').blur(); } catch (e) { gM = false; }
    av = (await journal(pg)).map((x) => x.id); await ajouter(pg); const lMan = neuves(await journal(pg), av)[0] || null;
    /* ⑦ photo d'étiquette (lecture IA SIMULÉE) et ⑧ estimation IA (SIMULÉE) — aucun appel réel */
    await pg.evaluate(() => { S.premium = true; window.__vraiF = window.fetch; window._resizeToB64 = async () => 'BASE64FAKE';
      window.fetch = async (u, opt) => { const c = String((opt && opt.body) || '');
        if (c.indexOf('foodLabel') >= 0) return { ok: true, json: async () => ({ status: 'ok', name: 'Pot étiquette (test)', kcal100: 94, prot100: 5.2, carbs100: 12, fat100: 2.4, serving: 40 }) };
        if (c.indexOf('estimateFood') >= 0) return { ok: true, json: async () => ({ status: 'ok', name: 'Plat IA (test)', kcal: 500, prot: 30, carbs: 50, fat: 20, g: 400 }) };
        return window.__vraiF(u, opt); }; });
    let gE = await ouvrirAjout(pg);
    await pg.evaluate(async () => { const f = new File([new Uint8Array([1, 2, 3])], 'etiquette.jpg', { type: 'image/jpeg' }); await onFoodLabelFile({ files: [f] }); });
    await pause(pg, 400); gE = gE && await taper(pg, '#af-bc-grams', 150); const vEt = await ecran(pg);
    av = (await journal(pg)).map((x) => x.id); await ajouter(pg); const lEt = neuves(await journal(pg), av)[0] || null;
    /* Le vrai geste : le nom tapé, puis le BOUTON « 🤖 Estimer » (le toucher quitte le champ du nom, comme au doigt). */
    const pasI = {}; pasI.ouvert = await ouvrirAjout(pg); pasI.desc = await taper(pg, '#af-desc', 'plat test');
    pasI.bouton = await clic(pg, '#af-ai-btn'); await pause(pg, 500);
    const iaBloc = await pg.evaluate(() => (document.getElementById('af-bc-row') || {}).style.display !== 'none' && !!_bcNutr);
    pasI.qte = await taper(pg, iaBloc ? '#af-bc-grams' : '#af-prop', 200);
    let gI = pasI.ouvert && pasI.desc && pasI.bouton && pasI.qte;
    const vIa = await ecran(pg); av = (await journal(pg)).map((x) => x.id); await ajouter(pg); const lIa = neuves(await journal(pg), av)[0] || null;
    await pg.evaluate(() => { window.fetch = window.__vraiF; });
    /* ④ favori : l'étoile sur la ligne V2 vérifiée, puis « + Ajouter » depuis le favori */
    let gF = await ouvrirAjout(pg);
    let M = await mesAliments(pg); const iV = (M.find((x) => x.sid === EAN_ISO && !x.fav) || {}).i;
    gF = gF && iV >= 0 && await clic(pg, '#af-quick-list button[onclick="toggleFavFood(' + iV + ')"]'); await pause(pg, 300);
    const fav = await pg.evaluate(() => JSON.parse(JSON.stringify((S.savedFoods || []).slice(-1)[0] || null)));
    M = await mesAliments(pg); const iF = (M.find((x) => x.fav) || {}).i;
    av = (await journal(pg)).map((x) => x.id); gF = gF && iF >= 0 && await clic(pg, '#af-quick-list button[onclick="quickAddFood(' + iF + ')"]'); await pause(pg, 500);
    const lFav = neuves(await journal(pg), av)[0] || null;
    t('B-NFIAB T09 ① recherche Open Food Facts : « 388,5 kcal · pour 100 g · P 88 · G 2,8 · L 3,3 » (les macros et l\'unité de la fiche), 40 g = 155·35·1·1, provenance « recherche » / Open Food Facts',
      gOff && /^388,5 kcal · pour 100 g · P 88 · G 2,8 · L 3,3$/.test(nb(txtOff)) && !!lOff && memes(vals(lOff), A.iso40) && lOff.saisie === 'recherche' && lOff.origine === 'off' && lOff.sourceId === EAN_ISO, J({ txtOff, lOff }));
    t('B-NFIAB T09 ② saisie à la main : 450·20·40·18 pour 300 g, gardées TELLES QUELLES, « déclarées », provenance manuel / utilisateur',
      gM && !!lMan && memes(vals(lMan), { kcal: 450, prot: 20, carbs: 40, fat: 18 }) && lMan.q === 300 && lMan.n2.st === 'declaree' && lMan.saisie === 'manuel' && lMan.origine === 'utilisateur', J(lMan));
    t('B-NFIAB T09 ③ photo d\'étiquette (lecture simulée) : 150 g = 141·8·18·4, provenance photo / étiquette « estimée » — jamais « source »',
      gE && vEt === T(A.etiq150) && !!lEt && memes(vals(lEt), A.etiq150) && lEt.saisie === 'photo-ia' && lEt.origine === 'etiquette' && lEt.n2.f.fiab === 'estimee', J({ vEt, lEt }));
    t('B-NFIAB T09 ④ estimation IA (réponse simulée) : 200 g = 250·15·25·10, provenance IA « estimée »',
      gI && vIa === T(A.ia200) && !!lIa && memes(vals(lIa), A.ia200) && lIa.q === 200 && lIa.origine === 'ia' && lIa.n2.st === 'estimee', J({ pasI, iaBloc, vIa, lIa }));
    t('B-NFIAB T09 ⑤ favori : l\'étoile garde la fiche et l\'identité (et l\'instant), « + Ajouter » écrit 155·35·1·1 pour 40 g — la même chose que la ligne d\'origine',
      gF && !!fav && fav.sourceId === EAN_ISO && fav.n2 && fav.n2.f && fav.t > 0 && !!lFav && memes(vals(lFav), A.iso40) && lFav.q === 40 && lFav.n2.f.fiab === 'source', J({ fav, lFav }));
    await fin(o); }

  /* ═══ CORRIGER UN FAVORI — sans réécrire le journal (Q16, §5 de Michel) ═══ */
  { const o = await ouvrir(b, PORT, fixture('fav', [STK_823, ISO_PROT_J], [FAV_ISO_NOM]), { produits: { [EAN_ISO]: OFF_ISO } }); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg);
    const M = await mesAliments(pg), f = M.find((x) => x.fav) || {};
    t('B-NFIAB F ① le favori d\'avant V2 sans quantité se dit « non vérifié » (avant : aucun état) — « 156 kcal · quantité à préciser · P 26 · G 1 · L 1 · non vérifié »',
      /^156 kcal · quantité à préciser · P 26 · G 1 · L 1 · non vérifié/.test(nb(f.txt)), J(f));
    const J0 = J(await journal(pg));
    g = g && await clic(pg, '#af-quick-list div[onclick="quickFillFood(' + f.i + ')"]'); await pause(pg, 700);
    const btn = await pg.evaluate(() => { const b = document.getElementById('af-fav-maj'); return !!b && b.style.display !== 'none'; });
    g = g && await taper(pg, '#af-bc-manual', EAN_ISO); g = g && await clic(pg, 'button[onclick="_manualBarcode()"]'); await pause(pg, 800);
    /* ⛔ le scan d'un AUTRE produit fait oublier le favori repris : le bouton disparaît (le favori ne se corrige qu'avec ce qui le reprend) */
    const btn2 = await pg.evaluate(() => { const b = document.getElementById('af-fav-maj'); return !!b && b.style.display !== 'none'; });
    await pg.evaluate(() => closeAddFood()); g = g && await ouvrirAjout(pg);
    const M2 = await mesAliments(pg), f2 = M2.find((x) => x.fav) || {};
    g = g && await clic(pg, '#af-quick-list div[onclick="quickFillFood(' + f2.i + ')"]'); await pause(pg, 700);
    await pg.evaluate(() => { const r = document.getElementById('af-prop-row'); });
    for (const [id, v] of [['#af-kcal', '155'], ['#af-prot', '35'], ['#af-carbs', '1'], ['#af-fat', '1']]) g = g && await taper(pg, id, v);
    try { await pg.locator('#af-fat').blur(); } catch (e) { g = false; }
    await pause(pg, 200); g = g && await taper(pg, '#af-poids', '40'); try { await pg.locator('#af-poids').blur(); } catch (e) { g = false; }
    await pause(pg, 200);
    const okMaj = await pg.evaluate(() => (typeof majFavoriDepuisEcran === 'function' ? majFavoriDepuisEcran() : 'ABSENTE'));
    const favs = await pg.evaluate(() => JSON.parse(JSON.stringify(S.savedFoods || [])));
    t('B-NFIAB F ② ⭐ « ⭐ Corriger ce favori » n\'apparaît que pour un favori repris, et pas après le scan d\'un autre produit',
      g && btn && !btn2, J({ btn, btn2 }));
    t('B-NFIAB F ③ ⭐⭐ LE FAVORI SE CORRIGE (155·35·1·1 pour 40 g, « déclaré », daté) — il REMPLACE l\'ancien (un seul favori), et le JOURNAL N\'A PAS BOUGÉ (à l\'octet) : la ligne notée depuis lui garde ses 26 g',
      okMaj === true && favs.length === 1 && memes(vals(favs[0]), A.iso40) && favs[0].q === 40 && favs[0].t > 0 && J(await journal(pg)) === J0
      && J((await journal(pg)).find((x) => x.id === ISO_PROT_J.id)) === J(ISO_PROT_J), J({ okMaj, favs }));
    await fin(o); }

  /* ═══ R — LA REMISE À ZÉRO NE PART PAS AVEC UNE SAUVEGARDE PÉRIMÉE (un favori posé après le fichier n'y serait pas) ═══ */
  { const o = await ouvrir(b, PORT, fixture('raz', [ANC_ISO, STK_823], [FAV_ISO_NOM], { ft4_admin_ok: '1' }), null); const pg = o.pg;
    await pg.evaluate(() => { window.__fichiers = []; window._donnerFichier = async (c, nom) => { window.__fichiers.push({ c, nom }); return 'ok'; }; });
    const P0 = await pg.evaluate(() => (typeof nutRazPerimetre === 'function' ? nutRazPerimetre() : null));
    await pg.evaluate(async () => { if (typeof nutRazSauvegarder === 'function') await nutRazSauvegarder(); });
    let g = o.ok && await ouvrirAjout(pg);
    const M = await mesAliments(pg), iS = (M.find((x) => /Steak/.test(x.nom) && !x.fav) || {}).i;
    g = g && iS >= 0 && await clic(pg, '#af-quick-list button[onclick="toggleFavFood(' + iS + ')"]'); await pause(pg, 300);
    await pg.evaluate(() => { try { closeAddFood(); } catch (e) {} }); await pause(pg, 200);
    const nF = await pg.evaluate(() => (S.savedFoods || []).length);
    const refus = await pg.evaluate(() => (typeof nutRazExecuter === 'function' ? nutRazExecuter() : 'ABSENTE'));
    await pause(pg, 200);
    const nF2 = await pg.evaluate(() => (S.savedFoods || []).length);
    const dit = await pg.evaluate(() => ((document.getElementById('admin-nutraz') || {}).innerText || '').replace(/\s+/g, ' '));
    t('B-NFIAB R ① ⛔ UNE SAUVEGARDE PÉRIMÉE N\'EN EST PAS UNE : un favori étoilé APRÈS le fichier → la remise à zéro refuse, rien ne change, l\'écran dit de refaire la sauvegarde',
      g && !!P0 && P0.favoris === 1 && nF === 2 && refus === false && nF2 === 2 && /refais-la/.test(dit), J({ P0, nF, refus, nF2, dit }));
    await pg.evaluate(async () => { if (typeof nutRazSauvegarder === 'function') await nutRazSauvegarder(); });
    await pg.evaluate(() => { if (typeof nutRazExecuter === 'function') nutRazExecuter(); }); await pause(pg, 300);
    g = await clic(pg, '#confirm-ok'); await pause(pg, 700);
    const fic = await pg.evaluate(() => (window.__fichiers || []).map((f) => { try { return (JSON.parse(f.c).savedFoods || []).length; } catch (e) { return -1; } }));
    const nF3 = await pg.evaluate(() => (S.savedFoods || []).length);
    t('B-NFIAB R ② la sauvegarde refaite contient les 2 favoris (la 1ʳᵉ n\'en avait qu\'un) ; alors seulement la remise à zéro part — 0 favori, le journal intact (2 lignes)',
      g && J(fic) === J([1, 2]) && nF3 === 0 && J(await journal(pg)) === J([ANC_ISO, STK_823]), J({ fic, nF3 }));
    await fin(o); }

  /* Les sorties sont COUPÉES par construction (route) : on les liste ; aucune ne vise l'IA ni Milo (le Worker). */
  t('B-NFIAB Z aucune erreur de page ; aucune requête ne quitte la page (toutes coupées), et AUCUNE ne vise l\'IA ni Milo (le Worker)',
    ERR.length === 0 && !SORTIES.some((h) => /workers\.dev|anthropic/.test(h)), J({ ERR: ERR.slice(0, 4), SORTIES: [...new Set(SORTIES)] }));
}

/* ═════ T07 · T08 · T12 — SYNCHRO, RESTAURATION, AUTRES APPAREILS, REMISE À ZÉRO (vrai Code.js en local) ═════ */
async function croiseFiab(t, b, PORT) {
  console.log('\n-- B-NFIAB-X. Synchro, restauration, autres appareils, remise à zéro (vrai Code.js en local) --');
  const etat = { drivePanne: false, reseauCoupe: false };
  const { X, tok } = CR.preparer(etat);
  const journalInit = [ANC_ISO, STK_823, STK_901, STK_1016, Object.assign({}, V2_ISO)];
  const plus = { ft4_foodlog: J(journalInit), ft4_savedfoods: J([FAV_ISO_ID, FAV_ISO_NOM]), ft4_admin_ok: '1' };
  const empreinte = (L) => J((L || []).slice().sort((a, b) => (a.id < b.id ? -1 : 1)));
  const propositions = (pg) => pg.evaluate(() => { try { openAddFood(); } catch (e) {} const n = (_afQuickItems || []).length;
    const d = _afSuggLocales('iso').length + _afSuggLocales('steak').length; let h = 0; try { h = _repasHabituels().length; } catch (e) {}
    try { closeAddFood(); } catch (e) {} return { mes: n, deja: d, hab: h, favs: (S.savedFoods || []).length }; });
  /* Ce que Milo lit : le contexte entier, les heures neutralisées (deux appels à une seconde d'écart ne doivent pas différer pour ça). */
  const contexteNutri = (pg) => pg.evaluate(() => { try { const c = buildCoachContext(''); const s = typeof c === 'string' ? c : JSON.stringify(c);
    return s.replace(/\b\d{1,2}[h:]\d{2}\b/g, 'HH:MM'); } catch (e) { return 'ERREUR ' + e.message; } });
  const totaux = (pg) => pg.evaluate((dates) => { try { return JSON.stringify(dates.map((d) => _foodTotals(d))); } catch (e) { return 'ERREUR ' + e.message; } },
    [...new Set(journalInit.map((l) => l.date))]);

  /* Appareil 1 : le journal, deux favoris d'avant V2. « ✕ » sur l'isolat, synchro. */
  const D1 = await CR.appareil(b, PORT, X, etat, tok, 'nfiab-a1', plus); const p1 = D1.pg;
  await p1.evaluate(() => { try { openAddFood(); } catch (e) {} });
  await pause(p1, 300);
  /* « ✕ » sur le FAVORI de l'isolat (celui qui porte son code-barres) : il masque l'IDENTITÉ — favori, ligne vérifiée et copies. */
  const i1 = await p1.evaluate((e) => (_afQuickItems || []).findIndex((it) => it.fav && (it._src || {}).sourceId === e), EAN_ISO);
  let g = i1 >= 0 && await clic(p1, '#af-quick-list button[onclick="deleteQuickFood(' + i1 + ')"]'); await pause(p1, 250); g = g && await clic(p1, '#confirm-ok'); await pause(p1, 300);
  await CR.synchroniser(p1);
  const srv1 = ((X.compte(CR.ALICE) || {}).profile || {}).hiddenFoods || [];
  t('B-NFIAB-X T08 ① « ✕ » PART AU SERVEUR : la date de départ de l\'identité est dans le profil (avant : jamais synchronisée)',
    g && srv1.some((e) => e.k === 'id:' + EAN_ISO && e.t > 0), J({ g, i1, srv1, loc: await p1.evaluate(() => S.hiddenFoods) }));

  /* Appareil 2 (téléphone neuf) : « Restaurer » → l'isolat reste masqué ; le journal arrive entier */
  const D2 = await CR.appareil(b, PORT, X, etat, tok, 'nfiab-a2', { ft4_admin_ok: '1' }); const p2 = D2.pg;
  await CR.restaurer(p2);
  const j2 = await CR.journalApp(p2), deja2 = await p2.evaluate((e) => { try { openAddFood(); } catch (x) {} const n = _afSuggLocales('iso zero').filter((l) => l.sourceId === e).length; try { closeAddFood(); } catch (x) {} return n; }, EAN_ISO);
  t('B-NFIAB-X T08 ② ⭐ TÉLÉPHONE NEUF + « Restaurer » : l\'isolat masqué sur l\'autre appareil ne réapparaît pas (« Déjà noté par toi » vide pour lui), le journal arrive entier (' + journalInit.length + ' lignes)',
    deja2 === 0 && j2.length === journalInit.length, J({ deja2, n: j2.length }));

  /* Appareil 1 : la REMISE À ZÉRO préparée — périmètre, sauvegarde (fichier capté), exécution confirmée */
  const totalAvant = await totaux(p1);
  const ctxAvant = await contexteNutri(p1);
  const propAvant = await propositions(p1);
  const jAvant = empreinte(await CR.journalApp(p1));
  await p1.evaluate(() => { window.__fichier = null; window._donnerFichier = async (c, nom) => { window.__fichier = { c, nom }; return 'ok'; }; });
  /* Une erreur DANS la page se dit en rouge, jamais en plantage du banc (un plantage n'est pas un verdict — F15 l'a montré). */
  const refusSansSauve = await p1.evaluate(() => { try { return typeof nutRazExecuter === 'function' ? nutRazExecuter() : 'ABSENTE'; } catch (e) { return 'ERREUR ' + e.message; } });
  const P = await p1.evaluate(() => (typeof nutRazPerimetre === 'function' ? nutRazPerimetre() : null));
  await p1.evaluate(async () => { if (typeof nutRazSauvegarder === 'function') await nutRazSauvegarder(); });
  const fichier = await p1.evaluate(() => window.__fichier);
  await p1.evaluate(() => { try { if (typeof nutRazExecuter === 'function') nutRazExecuter(); } catch (e) {} }); await pause(p1, 300); g = await clic(p1, '#confirm-ok'); await pause(p1, 1500);
  const propApres = await propositions(p1), jApres = empreinte(await CR.journalApp(p1));
  const ctxApres = await contexteNutri(p1);
  const totalApres = await totaux(p1);
  let sauve = null; try { sauve = JSON.parse(fichier && fichier.c || 'null'); } catch (e) {}
  t('B-NFIAB-X T07 ① ⛔ la remise à zéro REFUSE de partir sans sauvegarde, puis montre le périmètre EXACT (1 favori — l\'autre est parti avec « ✕ » —, aliments proposés, repas habituels, journal gardé ' + journalInit.length + ' lignes)',
    refusSansSauve === false && !!P && P.favoris === 1 && P.journal === journalInit.length && P.aliments >= 1 && P.repas >= 1, J({ refusSansSauve, P }));
  t('B-NFIAB-X T07 ② la sauvegarde est un fichier rétablissable : le favori restant et les masquages (dont le « ✕ » de T08 ①), datée, avec le périmètre',
    !!sauve && sauve.type === 'ft-nutrition-propositions' && (sauve.savedFoods || []).length === 1 && (sauve.hiddenFoods || []).some((e) => e.k === 'id:' + EAN_ISO) && !!sauve.perimetre && /^forcetracker-propositions-\d{4}-\d{2}-\d{2}\.json$/.test(fichier.nom), J({ nom: fichier && fichier.nom, f: sauve && sauve.savedFoods, m: sauve && sauve.hiddenFoods, p: sauve && sauve.perimetre }));
  t('B-NFIAB-X T07 ③ ⭐⭐ APRÈS : plus aucun favori, rien dans « Mes aliments » ni « Déjà noté par toi », aucun repas habituel — et le JOURNAL EST IDENTIQUE À L\'OCTET',
    g && propAvant.mes > 0 && propApres.mes === 0 && propApres.deja === 0 && propApres.hab === 0 && propApres.favs === 0 && jApres === jAvant, J({ propAvant, propApres }));
  t('B-NFIAB-X T12 ① les totaux du journal et ce que Milo lit de la nutrition sont INCHANGÉS par la remise à zéro (les propositions ne sont pas des repas)',
    totalApres === totalAvant && !/ERREUR/.test(totalAvant) && ctxApres === ctxAvant && !/^ERREUR/.test(ctxAvant) && ctxAvant.length > 1000, J({ totalAvant, totalApres, n: ctxAvant.length }));
  const srv2 = (X.compte(CR.ALICE) || {}).profile || {};
  t('B-NFIAB-X T08 ③ la remise à zéro est au serveur (une seule date, `*`) ; ses favoris restent au serveur (un envoi vide ne remplace jamais sa liste) — c\'est la date qui les écarte',
    (srv2.hiddenFoods || []).some((e) => e.k === '*' && e.t > 0) && (srv2.savedFoods || []).length === 1, J({ m: srv2.hiddenFoods, f: (srv2.savedFoods || []).length }));

  /* Appareil 2, resté HORS LIGNE pendant la remise à zéro : il « ✕ » un autre aliment et synchronise SA liste (sans la remise à
     zéro). Le serveur fusionne (le plus tard gagne) : la remise à zéro n'en sort jamais. */
  await p2.evaluate(() => { const n = { k: 'nom:autre aliment (test)', t: Date.now() };
    S.hiddenFoods = (typeof _nutMasquesFusion === 'function') ? _nutMasquesFusion((S.hiddenFoods || []).filter((e) => e && e.k !== '*'), [n])
      : (S.hiddenFoods || []).concat(['nom:autre aliment (test)']);
    persist(); });
  await CR.synchroniser(p2);
  const srv3 = ((X.compte(CR.ALICE) || {}).profile || {}).hiddenFoods || [];
  t('B-NFIAB-X T08 ⑦ ⭐ UN TÉLÉPHONE RESTÉ SUR UNE ANCIENNE LISTE (hors ligne pendant la remise à zéro) SYNCHRONISE : le serveur garde la remise à zéro ET ajoute son « ✕ » — rien ne se perd, rien ne réapparaît',
    srv3.some((e) => e.k === '*' && e.t > 0) && srv3.some((e) => e.k === 'nom:autre aliment (test)'), J(srv3));

  /* Appareil 2 : au DÉMARRAGE (sans « Restaurer »), la remise à zéro faite ailleurs s'applique */
  await CR.redemarrer(p2); await pause(p2, 1500);
  const prop2 = await propositions(p2), j2b = await CR.journalApp(p2);
  t('B-NFIAB-X T08 ④ ⭐ L\'AUTRE APPAREIL, AU DÉMARRAGE : la remise à zéro faite ailleurs s\'applique — aucun favori, aucune proposition ancienne, son journal intact',
    prop2.mes === 0 && prop2.deja === 0 && prop2.favs === 0 && j2b.length === journalInit.length, J({ prop2, n: j2b.length }));

  /* Appareil 3 : un téléphone neuf restauré APRÈS la remise à zéro — rien ne revient */
  const D3 = await CR.appareil(b, PORT, X, etat, tok, 'nfiab-a3', {}); const p3 = D3.pg;
  await CR.restaurer(p3);
  const prop3 = await propositions(p3), j3 = await CR.journalApp(p3);
  t('B-NFIAB-X T08 ⑤ ⭐⭐ UN 3ᵉ TÉLÉPHONE RESTAURÉ APRÈS : les favoris du serveur sont écartés par la date, aucune ancienne proposition ne revient, le journal est restauré ENTIER',
    prop3.favs === 0 && prop3.mes === 0 && prop3.deja === 0 && j3.length === journalInit.length, J({ prop3, n: j3.length }));

  /* La vie continue : un aliment noté APRÈS la remise à zéro est proposé ; une étoile posée ensuite survit à « Restaurer » */
  await p1.evaluate(() => { const r = NUT2.ligneNouvelle({ id: 'nfiab-apres-raz-1', ts: Date.now(), date: today(), repas: 'collation', nom: 'Yaourt après (test)',
    origine: { saisie: 'manuel', origine: 'utilisateur' }, mode: 'declaree', declare: { kcal: 90, prot: 5, carbs: 12, fat: 2 }, quantite: { val: 125, unite: 'g' } });
    S.foodLog.push(r.ligne); persist(); });
  await p1.evaluate(() => { try { openAddFood(); } catch (e) {} }); await pause(p1, 250);
  const iY = await p1.evaluate(() => (_afQuickItems || []).findIndex((it) => it.name === 'Yaourt après (test)'));
  g = iY >= 0 && await clic(p1, '#af-quick-list button[onclick="toggleFavFood(' + iY + ')"]'); await pause(p1, 300);
  await CR.synchroniser(p1);
  await CR.restaurer(p3);
  const f3 = await CR.favoris(p3);
  t('B-NFIAB-X T08 ⑥ la vie continue : un aliment noté après la remise à zéro est proposé, et son étoile survit à « Restaurer » sur l\'autre téléphone (et elle seule)',
    g && f3.length === 1 && f3[0].name === 'Yaourt après (test)' && f3[0].t > 0, J(f3));

  /* ④ Rétablir les favoris depuis la sauvegarde (le fichier de T07) */
  const jAvantRet = empreinte(await CR.journalApp(p1));
  await p1.evaluate((contenu) => { const f = new File([contenu], 'sauvegarde.json', { type: 'application/json' }); if (typeof nutRazRetablir === 'function') nutRazRetablir({ files: [f], value: '' }); }, fichier ? fichier.c : '{}');
  await pause(p1, 400);
  const favR = await CR.favoris(p1);
  const jR = empreinte(await CR.journalApp(p1));
  t('B-NFIAB-X T07 ④ la sauvegarde se RÉTABLIT : son favori revient (daté d\'aujourd\'hui, donc proposé) à côté de celui posé après, sans doublon — et le journal n\'a pas bougé',
    favR.length === 2 && favR.filter((f) => f.t > 0).length === 2 && favR.some((f) => f.name === 'Iso zero protein (test)') && favR.some((f) => f.name === 'Yaourt après (test)') && jR === jAvantRet, J(favR.map((f) => f.name)));

  const errs = [].concat(D1.erreurs, D2.erreurs, D3.erreurs), sorties = [].concat(D1.st.sorties, D2.st.sorties, D3.st.sorties);
  /* Comme B-NIX : toute sortie hors du serveur simulé est COUPÉE (jamais réussie). Les appels au Worker viennent du démarrage de l'app
     (Milo, hors de ce banc) : coupés, comptés, jamais servis. */
  t('B-NFIAB-X Z aucune erreur de page ; aucune sortie réseau réussie (toutes coupées hors du serveur simulé)', errs.length === 0, J({ errs: errs.slice(0, 4), sorties: [...new Set(sorties)] }));
  for (const D of [D1, D2, D3]) await D.cx.close();
}

module.exports = { ecran: ecranFiab, croise: croiseFiab };
