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
const fs = require('fs');
const path = require('path');
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

  /* ═══ N08 (retour de Claude Principal, 25/10) — UNE ENTRÉE VIDE (`null`) DANS LE JOURNAL. Préexistant (master) : elle faisait
     tomber le contexte de Milo (`_profilAlimentaire`) et le journal du jour (`renderFoodJournal`). La correction ne RÉÉCRIT rien :
     l'entrée vide est ignorée à la lecture. ⚠️ Ses erreurs de page sont SON verdict (N08 ①), pas celui du témoin Z ci-dessous. ═══ */
  { const N08_A = { id: 'n08-riz-000000001', date: jour(0), ts: ilya(0) - 3 * 3600e3, meal: 'dejeuner', name: 'Riz (test N08)', q: 150, u: 'g',
      kcal: 195, prot: 4, carbs: 42, fat: 0, per100: { kcal: 130, prot: 2.7, carbs: 28.2, fat: 0.3 }, v: 1, saisie: 'liste', origine: 'reprise' };
    const N08_B = { id: 'n08-yaourt-0000002', date: jour(0), ts: ilya(0) - 2 * 3600e3, meal: 'collation', name: 'Yaourt (test N08)', q: 125, u: 'g',
      kcal: 90, prot: 5, carbs: 12, fat: 2, per100: null, v: 1, saisie: 'manuel', origine: 'utilisateur' };
    const o = await ouvrir(b, PORT, fixture('n08', [N08_A, null, N08_B, null]), null); const pg = o.pg;
    const r = await pg.evaluate(() => {
      const out = { erreurs: [] };
      try { renderFoodJournal(); } catch (e) { out.erreurs.push('journal : ' + e.message); }
      out.lignes = document.querySelectorAll('#food-journal div[onclick^="openEditFood"]').length;
      const neutre = (s) => s && s.replace(/\b\d{1,2}[h:]\d{2}\b/g, 'HH:MM');
      const ctx = (L) => { const avant = S.foodLog; try { if (L) S.foodLog = L; const c = buildCoachContext(''); return neutre(typeof c === 'string' ? c : JSON.stringify(c)); }
        catch (e) { out.erreurs.push('milo : ' + e.message); return null; } finally { S.foodLog = avant; } };
      const avec = ctx(null), sans = ctx((S.foodLog || []).filter((e) => e));
      out.ctxLong = avec ? avec.length : 0; out.ctxEgal = !!avec && avec === sans;
      return out; });
    const ex = await pg.evaluate(async () => { const v = window._donnerFichier; let f = null; window._donnerFichier = async (c, nom) => { f = { c: String(c), nom }; return 'ok'; };
      try { await exportNutritionCsv(); } catch (e) { return { err: e.message }; } finally { window._donnerFichier = v; }
      const c = f ? f.c : ''; return { riz: c.indexOf('Riz (test N08)') >= 0, yaourt: c.indexOf('Yaourt (test N08)') >= 0 }; });
    const sy = await pg.evaluate(async () => { try { const p = _cloudSync(); if (p && p.then) await p.catch(() => {}); return 'ok'; } catch (e) { return 'ERREUR ' + e.message; } });
    await pause(pg, 300);
    const Lfin = await journal(pg);
    t('B-NFIAB N08 ① ⛔ UNE ENTRÉE VIDE (`null`) DANS LE JOURNAL NE FAIT PLUS RIEN TOMBER : aucune erreur au démarrage ni à l\'affichage, le journal du jour montre ses 2 vraies lignes, l\'export et la synchro passent',
      o.ok && o.erreurs.length === 0 && r.erreurs.length === 0 && r.lignes === 2 && !ex.err && ex.riz && ex.yaourt && sy === 'ok', J({ e: o.erreurs.slice(0, 3), r, ex, sy }));
    t('B-NFIAB N08 ② ce que Milo lit se construit, et c\'est EXACTEMENT ce qu\'il lirait sans les entrées vides — elles sont ignorées, rien n\'est réécrit (le journal garde ses 4 entrées, les 2 vraies à l\'octet)',
      r.ctxLong > 1000 && r.ctxEgal && Lfin.length === 4 && J(Lfin[0]) === J(N08_A) && Lfin[1] === null && J(Lfin[2]) === J(N08_B) && Lfin[3] === null,
      J({ ctxLong: r.ctxLong, ctxEgal: r.ctxEgal, n: Lfin.length }));
    await o.cx.close(); }
  /* ③ L'ORDRE DÉFAVORABLE — trouvé en ÉLARGISSANT le témoin de Principal (25/10) : ses conditions (aucun profil calorique, une ligne
     du jour AVANT les entrées vides) laissaient passer quatre lecteurs qui tombaient encore. Ici, un profil COMPLET (la carte « ce qu'il
     te reste » se calcule, et le journal du jour l'affiche), une entrée vide EN TÊTE, puis « Ajouter » (« Mes aliments », « Déjà noté
     par toi ») et les idées pour le reste. Mesuré avant correction : le journal du jour, la carte, « Ajouter » et la recherche tombaient. */
  { const N08_C = { id: 'n08-riz-000000003', date: jour(1), ts: ilya(1), meal: 'dejeuner', name: 'Riz (test N08)', q: 150, u: 'g',
      kcal: 195, prot: 4, carbs: 42, fat: 0, per100: { kcal: 130, prot: 2.7, carbs: 28.2, fat: 0.3 }, v: 1, saisie: 'liste', origine: 'reprise' };
    const N08_D = { id: 'n08-yaourt-0000004', date: jour(0), ts: ilya(0) - 3600e3, meal: 'collation', name: 'Yaourt (test N08)', q: 125, u: 'g',
      kcal: 90, prot: 5, carbs: 12, fat: 2, per100: null, v: 1, saisie: 'manuel', origine: 'utilisateur' };
    const o = await ouvrir(b, PORT, fixture('n08c', [null, N08_C, null, N08_D], [], { ft4_bw: '80', ft4_ht: '180', ft4_age: '40', ft4_act: '1.55' }), null);
    const pg = o.pg;
    const r = await pg.evaluate(() => { const err = [], essai = (nom, f) => { try { return f(); } catch (e) { err.push(nom + ' : ' + e.message); return null; } };
      const reste = essai('reste', () => _resteDuJour(today()));
      essai('journal', () => renderFoodJournal());
      const lignes = document.querySelectorAll('#food-journal div[onclick^="openEditFood"]').length;
      essai('ajout', () => openAddFood());
      const mes = (typeof _afQuickItems !== 'undefined' && _afQuickItems || []).map((it) => it.name);
      const deja = essai('deja', () => _afSuggLocales('riz').map((l) => l.id)) || [];
      const idees = essai('idees', () => _ideesPourLeReste(reste, 12));
      essai('fermer', () => closeAddFood());
      return { err, reste: !!reste, lignes, mes, deja, idees: Array.isArray(idees) }; });
    t('B-NFIAB N08 ③ ⭐ L\'ORDRE DÉFAVORABLE (profil calorique complet, entrée vide EN TÊTE) : la carte « ce qu\'il te reste », le journal du jour, « Ajouter » (« Mes aliments »), « Déjà noté par toi » et les idées se construisent — rien ne tombe',
      o.ok && o.erreurs.length === 0 && r.err.length === 0 && r.reste && r.lignes === 1 && r.mes.indexOf('Riz (test N08)') >= 0 && r.mes.indexOf('Yaourt (test N08)') >= 0
      && r.deja.indexOf(N08_C.id) >= 0 && r.idees, J({ e: o.erreurs, r }));
    await o.cx.close(); }

  /* ═══ ZÉRO — retour de Claude Principal (25/10) : une ANCIENNE saisie sans quantité NI valeurs ({kcal:0 … q:null, per100:null}).
     Avant : reprise (« + Ajouter », « Déjà noté par toi ») → 0 · 0 · 0 · 0, AUCUN champ ni issue, et « Ajouter » demandait
     « Combien pesait… » sans endroit où le dire — rien ne s'écrivait (sûr), mais c'était une impasse. Après : les issues d'une
     reprise sans fiche, et ses valeurs se tapent. ⛔ Toujours rien d'écrit sans un geste. ═══ */
  { const ZERO = { id: 'nfiab-zero-000001', date: jour(2), ts: ilya(2), meal: 'dejeuner', name: 'Gratin maison (test)', kcal: 0, prot: 0, carbs: 0, fat: 0,
      q: null, per100: null, v: 1, saisie: 'manuel', origine: 'utilisateur' };
    const ISSUES_Z = ['Retrouver l\'aliment', 'Scanner le code-barres', 'Saisir l\'étiquette'];
    const etat = (pg) => pg.evaluate(() => { const r = document.getElementById('af-prop-row'), v = (id) => { const x = document.getElementById(id); return !!x && x.offsetParent !== null; };
      return { ouvert: document.getElementById('ov-add-food').classList.contains('open'), vis: !!r && r.offsetParent !== null, txt: r ? r.innerText.replace(/\s+/g, ' ') : '',
        boutons: r ? [...r.querySelectorAll('button')].map((x) => x.textContent.trim()) : [], qte: v('af-prop') || v('af-bc-grams') || v('af-poids') }; });
    const sansImpasse = (st) => st.ouvert && st.vis && /ni quantité ni valeurs/.test(st.txt) && ISSUES_Z.every((x) => st.boutons.some((y) => y.indexOf(x) >= 0)) && !st.qte;
    const o = await ouvrir(b, PORT, fixture('zero', [ZERO, ANC_ISO]), null); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg);
    const M = await mesAliments(pg), iZ = (M.find((x) => x.nom === ZERO.name) || {}).i, iI = (M.find((x) => x.sid === EAN_ISO) || {}).i;
    const av = (await journal(pg)).map((x) => x && x.id);
    g = g && iZ >= 0 && await clic(pg, '#af-quick-list button[onclick="quickAddFood(' + iZ + ')"]'); await pause(pg, 700);
    const st1 = await etat(pg), toast1 = await dernierToast(pg);
    await ajouter(pg); const toastAj = await dernierToast(pg);
    const gEt = await clic(pg, '#af-prop-row button[onclick="_n2EtiquetteFige()"]'); await pause(pg, 250);
    const cal = await pg.evaluate(() => { const x = document.getElementById('af-cal-row'); return !!x && x.style.display !== 'none'; });
    const gRe = await clic(pg, '#af-prop-row button[onclick="_n2RetrouverRecherche()"]'); await pause(pg, 300); const toastRe = await dernierToast(pg);
    const rien1 = neuves(await journal(pg), av).length === 0;
    t('B-NFIAB ZÉRO ① ⭐ « + AJOUTER » SUR UNE ANCIENNE SAISIE SANS QUANTITÉ NI VALEURS N\'EST PLUS UNE IMPASSE : rien n\'est écrit, l\'écran dit pourquoi et donne les issues d\'une reprise sans fiche (🔎 Retrouver · 📷 Scanner · 🏷️ Étiquette — elles répondent), aucun champ « quantité » pour ces 0 ; « Ajouter » le redit au lieu de « Combien pesait… »',
      g && rien1 && sansImpasse(st1) && /^Rien n'a été ajouté\./.test(toast1) && /ni quantité ni valeurs/.test(toastAj) && !/Combien pesait/.test(toastAj)
      && gEt && cal && gRe && /Choisis l'aliment dans la liste/.test(toastRe), J({ st1, toast1, toastAj, cal, toastRe, rien1 }));
    /* ② la même ancienne saisie reprise depuis « Déjà noté par toi » (la recherche) */
    await pg.evaluate(() => { try { closeAddFood(); } catch (e) {} }); g = await ouvrirAjout(pg);
    g = g && await taper(pg, '#af-desc', 'gratin maison'); await pg.evaluate(() => { try { _afSuggInput(); } catch (e) {} });
    let k = -1; for (let n = 0; n < 16 && k < 0; n++) { await pause(pg, 250); k = await pg.evaluate((id) => (typeof _afSuggLoc !== 'undefined' && _afSuggLoc || []).findIndex((e) => e && e.id === id), ZERO.id); }
    g = g && k >= 0 && await clic(pg, '#af-sugg [onclick="_afSuggPrendreLocale(' + k + ')"]'); await pause(pg, 700);
    const st2 = await etat(pg); await ajouter(pg); const toastAj2 = await dernierToast(pg);
    t('B-NFIAB ZÉRO ② la même saisie reprise depuis « Déjà noté par toi » : les mêmes issues, aucun champ « quantité », « Ajouter » n\'écrit rien et dit pourquoi',
      g && sansImpasse(st2) && /ni quantité ni valeurs/.test(toastAj2) && neuves(await journal(pg), av).length === 0, J({ k, st2, toastAj2 }));
    /* ③ ce qui la marque meurt avec elle : un autre nom n'hérite pas de ses issues, un autre aliment repris non plus */
    g = g && await taper(pg, '#af-desc', 'Autre plat (test)'); try { await pg.locator('#af-desc').blur(); } catch (e) { g = false; } await pause(pg, 200);
    const st3 = await etat(pg);
    /* le nom effacé, « Mes aliments » revient ; on y reprend l'isolat (cas figé) — l'écran ne s'est pas fermé entre-temps */
    g = g && await taper(pg, '#af-desc', ''); try { await pg.locator('#af-desc').blur(); } catch (e) { g = false; } await pause(pg, 300);
    const gI = await clic(pg, '#af-quick-list div[onclick="quickFillFood(' + iI + ')"]'); g = g && gI; await pause(pg, 900);
    const st4 = await etat(pg), toast4 = await dernierToast(pg);
    t('B-NFIAB ZÉRO ③ ⛔ CE QUI LA MARQUE NE SURVIT PAS À SON SUJET : sous un autre nom, ses issues s\'effacent ; l\'isolat repris ensuite (cas figé) ne reçoit pas sa phrase — ni à l\'écran, ni dans le toast',
      g && !/ni quantité ni valeurs/.test(st3.txt) && !/ni quantité ni valeurs/.test(st4.txt) && !/ni quantité ni valeurs/.test(toast4) && /^Repris — choisis la quantité/.test(toast4), J({ gI, st3, st4, toast4 }));
    await fin(o); }
  /* ④ l'issue « tape ses valeurs » mène au journal : 300·20·30·10 pour 250 g, déclarées par la personne ; l'ancienne saisie intacte */
  { const ZERO = { id: 'nfiab-zero-000002', date: jour(2), ts: ilya(2), meal: 'dejeuner', name: 'Gratin maison (test)', kcal: 0, prot: 0, carbs: 0, fat: 0,
      q: null, per100: null, v: 1, saisie: 'manuel', origine: 'utilisateur' };
    const o = await ouvrir(b, PORT, fixture('zero4', [ZERO]), null); const pg = o.pg;
    let g = o.ok && await ouvrirAjout(pg);
    g = g && await clic(pg, '#af-quick-list div[onclick="quickFillFood(0)"]'); await pause(pg, 700);
    for (const [id, v] of [['#af-kcal', '300'], ['#af-prot', '20'], ['#af-carbs', '30'], ['#af-fat', '10']]) g = g && await taper(pg, id, v);
    try { await pg.locator('#af-fat').blur(); } catch (e) { g = false; }
    await pause(pg, 200); g = g && await taper(pg, '#af-poids', '250'); try { await pg.locator('#af-poids').blur(); } catch (e) { g = false; }
    const av = (await journal(pg)).map((x) => x.id); await ajouter(pg); const L = await journal(pg), l = neuves(L, av)[0] || null;
    t('B-NFIAB ZÉRO ④ ⭐ L\'ISSUE « TAPE SES VALEURS » MÈNE AU JOURNAL : 300·20·30·10 pour 250 g, gardées telles quelles (« déclarées ») — et l\'ancienne saisie à 0 est INTACTE',
      g && !!l && memes(vals(l), { kcal: 300, prot: 20, carbs: 30, fat: 10 }) && l.q === 250 && l.u === 'g' && l.n2 && l.n2.st === 'declaree'
      && J(L.find((x) => x.id === ZERO.id)) === J(ZERO), J({ l, toast: await dernierToast(pg) }));
    await fin(o); }

  /* ═══ E2b · NUT-VERIFY-01 (clôture ciblée du 25/10) — APRÈS LA REMISE À ZÉRO, D'ANCIENNES SAISIES FAUSSES NE FONT PLUS DOUTER
     D'UNE SAISIE JUSTE. Constat de Claude Principal (sonde indépendante, registre NUT-VERIFY-01) : remise à zéro hier ; deux anciennes
     saisies du steak à 200 g · 130 kcal (le pour-100 g FABRIQUÉ à 65, M1) à J-6 et J-5 ; une saisie NEUVE et juste, 258 · 42 · 0 · 10
     pour 200 g, même code-barres → « ⚠️ à vérifier ». Sans les deux anciennes : « déclaré ». La comparaison D-131 (`_n2Contradiction`)
     prenait TOUTES les saisies du produit, y compris celles que la remise à zéro (ou « ✕ ») a retirées des propositions.
     ⭐ Attendu (registre) : les ignorer POUR LA COMPARAISON — le journal intact (à l'octet), les contrôles légitimes gardés (deux
     saisies encore proposées qui se contredisent ⑤ ; une fiche vérifiée par la SOURCE, même d'avant la remise à zéro ⑥), un scan
     juste inchangé ⑦. ⛔ Données inventées ; Open Food Facts servi d'ici (⑦) ou coupé. ═══ */
  { const STK65 = { kcal: 65, prot: 11, carbs: 0, fat: 3 }, ANC6 = STK('nfiab-e2b-anc-j6', 6, 200, [130, 22, 0, 6], STK65, 'liste'),
      ANC5 = STK('nfiab-e2b-anc-j5', 5, 200, [130, 22, 0, 6], STK65, 'liste');
    /* une saisie NEUVE, déclarée par la personne (aucune fiche), avec le code-barres du produit — écrite par le vrai moteur */
    const DECL = (id, k, v) => N2.ligneNouvelle({ id, ts: ilya(k), date: jour(k), repas: 'dejeuner', nom: 'Steak haché 5% (test)',
      origine: { saisie: 'manuel', origine: 'utilisateur' }, mode: 'declaree', declare: v, quantite: { val: 200, unite: 'g', origine: 'tapee' },
      cle: EAN_STK, etat: 'tel-que-vendu' }).ligne;
    const RAZ = (k) => ({ ft4_hiddenfoods: J([{ k: '*', t: ilya(k) }]) });
    const steak = (M) => M.filter((x) => x.sid === EAN_STK);
    const juste = (s) => /^258 kcal · pour 200 g · P 42 · G 0 · L 10 · déclaré/.test(nb(s)) && !/à vérifier/.test(s);
    const intactes = (L, ...anc) => anc.every((a) => J(L.find((x) => x && x.id === a.id)) === J(a));
    /* ① ⭐ le cas du registre : remise à zéro hier, la saisie juste notée il y a 12 h — « Mes aliments », « Déjà noté par toi », « + Ajouter » */
    { const N = DECL('nfiab-e2b-neuve-01', 0.5, A.stk200);
      const o = await ouvrir(b, PORT, fixture('e2b1', [ANC6, ANC5, N], [], RAZ(1)), null); const pg = o.pg;
      let g = o.ok && await ouvrirAjout(pg);
      const M = steak(await mesAliments(pg)), D = await dejaNote(pg, 'steak');
      const av = (await journal(pg)).map((x) => x && x.id);
      g = g && M.length === 1 && await clic(pg, '#af-quick-list button[onclick="quickAddFood(' + M[0].i + ')"]'); await pause(pg, 800);
      const L = await journal(pg), nv = neuves(L, av), toast = await dernierToast(pg);
      t('B-NFIAB E2b ① ⭐⭐ NUT-VERIFY-01 — APRÈS LA REMISE À ZÉRO, DEUX ANCIENNES SAISIES FAUSSES (65 kcal / 100 g) NE FONT PLUS DOUTER DE LA SAISIE JUSTE : « 258 kcal · pour 200 g · P 42 · G 0 · L 10 · déclaré » dans « Mes aliments » ET « Déjà noté par toi », sans « à vérifier » ; les anciennes ne sont pas proposées',
        g && M.length === 1 && juste(M[0].txt) && D.length === 1 && juste(D[0]), J({ M, D }));
      t('B-NFIAB E2b ② « + Ajouter » la re-note telle qu\'elle s\'affiche (258·42·0·10 pour 200 g, son code-barres) — et les deux anciennes saisies restent dans le journal, À L\'OCTET',
        g && nv.length === 1 && memes(vals(nv[0]), A.stk200) && nv[0].q === 200 && nv[0].u === 'g' && nv[0].sourceId === EAN_STK && L.length === 4 && intactes(L, ANC6, ANC5, N),
        J({ nv, toast, n: L.length }));
      await fin(o); }
    /* ③ les repas habituels nés APRÈS la remise à zéro : la carte ne compte plus la saisie juste « à vérifier », et son « + » la re-note */
    { const N2a = DECL('nfiab-e2b-hab-0002', 2, A.stk200), N1a = DECL('nfiab-e2b-hab-0001', 1, A.stk200);
      const o = await ouvrir(b, PORT, fixture('e2b3', [ANC6, ANC5, N2a, N1a], [], RAZ(3)), null); const pg = o.pg;
      const carte = await pg.evaluate(() => { const x = [...document.querySelectorAll('button[onclick^="_habChoisirMoment"]')].find((y) => /Steak haché 5% \(test\)/.test(y.textContent));
        return x ? x.innerText.replace(/\s+/g, ' ') : ''; });
      const av = (await journal(pg)).map((x) => x && x.id);
      let g = o.ok && await clic(pg, 'button[onclick^="_habChoisirMoment"]'); await pause(pg, 200);
      g = g && await clic(pg, 'button[onclick^="rejouerRepas("][onclick*="\'dejeuner\'"]'); await pause(pg, 600);
      const L = await journal(pg), nv = neuves(L, av), toast = await dernierToast(pg);
      t('B-NFIAB E2b ③ ⭐ « TES REPAS HABITUELS » nés après la remise à zéro : la carte annonce « 258 kcal · 42 g de protéines · noté 2 fois », sans « à vérifier », et son « + » re-note 258·42·0·10 pour 200 g — les anciennes saisies intactes',
        /258 kcal · 42 g de protéines · noté 2 fois/.test(carte) && !/à vérifier/.test(carte) && g && nv.length === 1 && memes(vals(nv[0]), A.stk200) && nv[0].q === 200
        && !/à vérifier/.test(toast) && intactes(L, ANC6, ANC5, N2a, N1a), J({ carte, nv, toast }));
      await fin(o); }
    /* ④ le même cas, mais les anciennes retirées par « ✕ » (le masquage de CE produit) au lieu de la remise à zéro */
    { const N = DECL('nfiab-e2b-neuve-04', 0.5, A.stk200);
      const o = await ouvrir(b, PORT, fixture('e2b4', [ANC6, ANC5, N], [], { ft4_hiddenfoods: J([{ k: 'id:' + EAN_STK, t: ilya(1) }]) }), null); const pg = o.pg;
      const g = o.ok && await ouvrirAjout(pg);
      const M = steak(await mesAliments(pg)), D = await dejaNote(pg, 'steak');
      t('B-NFIAB E2b ④ les anciennes saisies retirées par « ✕ » (masquage de CE code-barres) ne font pas davantage douter de la saisie juste notée ensuite : « … · déclaré », sans « à vérifier »',
        g && M.length === 1 && juste(M[0].txt) && D.length === 1 && juste(D[0]), J({ M, D }));
      await fin(o); }
    /* ④b un ANCIEN FAVORI faux (mis avant la remise à zéro, encore sur l'appareil — p. ex. un téléphone pas encore resynchronisé) ne juge pas
       davantage la saisie juste : il n'est plus proposé, donc il ne compare plus */
    { const N = DECL('nfiab-e2b-neuve-4b', 0.5, A.stk200);
      const FAV = { name: 'Steak haché 5% (test)', kcal: 130, prot: 22, carbs: 0, fat: 6, per100: STK65, q: 200, u: 'g', sourceId: EAN_STK, t: ilya(8) };
      const o = await ouvrir(b, PORT, fixture('e2b4b', [N], [FAV], RAZ(1)), null); const pg = o.pg;
      const g = o.ok && await ouvrirAjout(pg);
      const M = steak(await mesAliments(pg)), D = await dejaNote(pg, 'steak');
      t('B-NFIAB E2b ④b un ANCIEN FAVORI faux (mis avant la remise à zéro, encore sur l\'appareil) ne fait pas douter de la saisie juste notée ensuite : il n\'est pas proposé, et la saisie dit « … · déclaré », sans « à vérifier »',
        g && M.length === 1 && !M[0].fav && juste(M[0].txt) && D.length === 1 && juste(D[0]), J({ M, D }));
      await fin(o); }
    /* ⑤ CONTRÔLE LÉGITIME GARDÉ — sans remise à zéro ni « ✕ », les trois saisies sont toutes proposées : elles se contredisent (D-131) */
    { const N = DECL('nfiab-e2b-neuve-05', 0.5, A.stk200);
      const o = await ouvrir(b, PORT, fixture('e2b5', [ANC6, ANC5, N]), null); const pg = o.pg;
      let g = o.ok && await ouvrirAjout(pg);
      const M = steak(await mesAliments(pg)), mN = M.find((x) => /^258 kcal/.test(nb(x.txt))) || {};
      const av = (await journal(pg)).map((x) => x && x.id);
      g = g && mN.i >= 0 && await clic(pg, '#af-quick-list button[onclick="quickAddFood(' + mN.i + ')"]'); await pause(pg, 900);
      const nv = neuves(await journal(pg), av);
      t('B-NFIAB E2b ⑤ CONTRÔLE LÉGITIME GARDÉ : SANS remise à zéro ni « ✕ », la même saisie juste et les deux anciennes sont toutes proposées — elles se contredisent, « ⚠️ à vérifier », et « + Ajouter » n\'écrit rien',
        g && /^258 kcal · pour 200 g · P 42 · G 0 · L 10 · ⚠️ à vérifier/.test(nb(mN.txt)) && nv.length === 0, J({ M, nv }));
      await fin(o); }
    /* ⑥ CONTRÔLE LÉGITIME GARDÉ — une fiche VÉRIFIÉE PAR LA SOURCE (le scan d'il y a 3 jours à 129 kcal / 100 g, d'avant la remise à zéro) juge
       encore une saisie neuve FAUSSE (130 kcal pour 200 g) : la remise à zéro retire des propositions, elle ne retire pas la fiche du produit */
    { const SCAN = N2.ligneNouvelle({ id: 'nfiab-e2b-scan-0001', ts: ilya(3), date: jour(3), repas: 'dejeuner', nom: 'Steak haché 5% (test)',
        origine: { saisie: 'camera-code-local', origine: 'off' }, mode: 'pesee', fiche: { base: 'g', p100: { kcal: 129, prot: 21, carbs: 0, fat: 5 }, cle: EAN_STK,
        source: 'off', fiab: 'source', etat: 'tel-que-vendu' }, quantite: { val: 200, unite: 'g', origine: 'tapee' } }).ligne;
      const FAUX = DECL('nfiab-e2b-fausse-01', 0.5, { kcal: 130, prot: 22, carbs: 0, fat: 6 });
      const o = await ouvrir(b, PORT, fixture('e2b6', [SCAN, FAUX], [], RAZ(1)), null); const pg = o.pg;
      const g = o.ok && await ouvrirAjout(pg);
      const M = steak(await mesAliments(pg));
      const ap = await pg.evaluate((id) => { const e = (S.foodLog || []).find((x) => x && x.id === id); const a = _n2Apercu(e, _n2FichesVerifiees());
        return { ok: !!(a && a.ok), code: a && a.raison ? a.raison.code : null, txt: a && a.raison ? a.raison.texte : '' }; }, FAUX.id);
      t('B-NFIAB E2b ⑥ CONTRÔLE LÉGITIME GARDÉ : la fiche VÉRIFIÉE PAR LA SOURCE (scan Open Food Facts d\'AVANT la remise à zéro) juge encore une saisie neuve FAUSSE — « 130 kcal · pour 200 g · … · ⚠️ à vérifier », cause « ta fiche vérifiée de ce produit (du …) donne d\'autres valeurs »',
        g && M.length === 1 && /^130 kcal · pour 200 g · P 22 · G 0 · L 6 · ⚠️ à vérifier/.test(nb(M[0].txt)) && ap.code === 'differe' && /ta fiche vérifiée de ce produit \(du \d\d\/\d\d\)/.test(ap.txt),
        J({ M, ap }));
      await fin(o); }
    /* ⑦ LE SCAN JUSTE, APRÈS LA REMISE À ZÉRO, AVEC LES ANCIENNES SAISIES FAUSSES DANS LE JOURNAL : ses valeurs, inchangées */
    { const o = await ouvrir(b, PORT, fixture('e2b7', [ANC6, ANC5], [], RAZ(1)), { produits: { [EAN_STK]: OFF_STK } }); const pg = o.pg;
      let g = o.ok && await ouvrirAjout(pg);
      const lu = await pg.evaluate(async (c) => { try { _bcSetEtat('SCANNING'); } catch (e) {} return await _bcTraiterCode(c); }, EAN_STK);
      await pause(pg, 500); g = g && await taper(pg, '#af-bc-grams', 200);
      const v = await ecran(pg), nom = await pg.evaluate(() => (document.getElementById('af-bc-name') || {}).textContent || '');
      const av = (await journal(pg)).map((x) => x && x.id); g = g && await ajouter(pg);
      const L = await journal(pg), l = neuves(L, av)[0] || null;
      t('B-NFIAB E2b ⑦ LE SCAN JUSTE, après la remise à zéro et avec les anciennes saisies fausses au journal : 200 g = 258·42·0·10, aucun « à vérifier », la ligne écrite garde la fiche (129·21·0·5, « source ») — les anciennes intactes',
        g && lu === true && v === T(A.stk200) && !/à vérifier/.test(nom) && !!l && memes(vals(l), A.stk200) && l.q === 200
        && memes(l.per100, { kcal: 129, prot: 21, carbs: 0, fat: 5 }) && l.n2 && l.n2.f.fiab === 'source' && intactes(L, ANC6, ANC5), J({ lu, v, nom, l }));
      await fin(o); }
  }

  /* Les sorties sont COUPÉES par construction (route) : on les liste ; aucune ne vise l'IA ni Milo (le Worker). */
  t('B-NFIAB Z aucune erreur de page ; aucune requête ne quitte la page (toutes coupées), et AUCUNE ne vise l\'IA ni Milo (le Worker)',
    ERR.length === 0 && !SORTIES.some((h) => /workers\.dev|anthropic/.test(h)), J({ ERR: ERR.slice(0, 4), SORTIES: [...new Set(SORTIES)] }));
}

/* ═════ T07 · T08 · T12 — SYNCHRO, RESTAURATION, AUTRES APPAREILS, REMISE À ZÉRO (vrai Code.js en local) ═════ */
/* ⚖️ RETOUR DE CLAUDE PRINCIPAL (25/10) — LA SYNCHRO DES MASQUAGES DÉPEND DU CODE.JS SERVI, ET LE BANC LE DIT.
   Six témoins (T08 ① ② ③ ④ ⑤ ⑦) supposent un Code.js dont la liste blanche de `saveProfile` garde `hiddenFoods` — le commit
   séparé de cette branche, à déployer seulement sur GO de Michel. Sur un Code.js sans elle (celui de master), ils sont SANS OBJET :
   listés à part, JAMAIS comptés verts. Les garanties LOCALES (T08L : « ✕ » et la remise à zéro tiennent au rechargement et à
   « Restaurer » sur le MÊME téléphone) se jouent dans LES DEUX modes. ⛔ Un mode choisi par erreur ne passe pas en silence :
   T08 ⓪ compare ce que dit la liste blanche à ce que le serveur (le vrai Code.js, en local) FAIT d'un « ✕ » synchronisé. */
const RACINE_SRV = process.env.NUT2X_RACINE || path.join(__dirname, '..', '..');   // la même racine que le serveur simulé
function dansSaveProfile(re) {
  let src = ''; try { src = fs.readFileSync(path.join(RACINE_SRV, 'Code.js'), 'utf8'); } catch (e) { return false; }
  const i = src.indexOf('function handleSaveProfile_('); if (i < 0) return false;
  const j = src.indexOf('\nfunction ', i + 10);
  return re.test(src.slice(i, j < 0 ? src.length : j));
}
function masquesDansListeBlanche() { return dansSaveProfile(/\bbody\.hiddenFoods\b/); }

/* ═════ Q15 · D-141 (clôture ciblée du 25/10) — LA SUPPRESSION RÉELLE DES ANCIENS FAVORIS AU SERVEUR ═════
   Le vrai Code.js en local, SANS navigateur (des envois tels que l'app les fait), deux comptes inventés : Carol (la remise à
   zéro) et Bob (un autre utilisateur, jamais touché). ⚖️ Comme T08 : sur un Code.js qui ne supprime pas (master, ou la branche
   d'avant D-141), les témoins de la suppression sont SANS OBJET — listés, jamais comptés verts ; ceux qui PROTÈGENT (journal,
   profil, séances, autre compte) se jouent dans tous les modes. ⛔ Données inventées ; aucune sortie réseau (aucun navigateur). */
function serveurQ15(t, tD) {
  const etat = { drivePanne: false };
  const { X } = CR.preparer(etat);   // bornes RÉDUITES du banc (favoris : zone 900 car., plafond 1 800) — le même rapport que la vraie
  const C = 'carol@example.test', D = 'dave@example.test', E = 'erin@example.test', BOB = 'bob@example.test', ADMIN = 'jeton-admin-fictif-q15-0001';
  const now = Date.now(), raz = now - 3600e3;
  const ANC_SANS_T = { name: 'Ancien sans date (test Q15)', kcal: 100, prot: 5, carbs: 10, fat: 3 };
  const ANC_DATE = { name: 'Ancien daté (test Q15)', kcal: 200, prot: 10, carbs: 20, fat: 6, t: now - 864e5 };
  const NEUF = { name: 'Neuf (test Q15)', kcal: 50, prot: 2, carbs: 5, fat: 1, t: now - 60e3 };
  const NEUF2 = { name: 'Neuf 2 (test Q15)', kcal: 60, prot: 3, carbs: 6, fat: 1, t: now - 30e3 };
  const LIGNE = { id: 'q15-ligne-0000001', date: jour(5), ts: ilya(5), meal: 'dejeuner', name: 'Riz (test Q15)', kcal: 130, prot: 3, carbs: 28, fat: 0, q: 100, u: 'g', v: 1 };
  const SEANCE = { id: 4001, ts: ilya(2), date: jour(2), volume: 400, exs: [{ name: 'Squat à la Barre', sets: [{ kg: 60, reps: 5, type: 'N', done: true }] }] };
  /* n anciens favoris (sans date : d'avant toute remise à zéro), assez longs pour remplir la zone réduite du banc */
  const anciens = (n, tag) => Array.from({ length: n }, (_, k) => ({ name: 'Ancien favori numéro ' + (k + 1) + ' du compte ' + tag + ' (test Q15)', kcal: 100 + k, prot: 5, carbs: 10, fat: 3 }));
  X.ctx.saveUserData_(C, { email: C, profile: { name: 'Carol', bw: 61, foodLog: [LIGNE], savedFoods: [ANC_SANS_T, ANC_DATE, NEUF] }, prs: {}, sessions: [SEANCE] });
  X.ctx.saveUserData_(D, { email: D, profile: { name: 'Dave', foodLog: [], savedFoods: anciens(8, 'Dave').concat([NEUF]) }, prs: {}, sessions: [] });
  X.ctx.saveUserData_(E, { email: E, profile: { name: 'Erin', foodLog: [], savedFoods: anciens(15, 'Erin').concat([NEUF]) }, prs: {}, sessions: [] });
  X.ctx.saveUserData_(BOB, { email: BOB, profile: { name: 'Bob', foodLog: [Object.assign({}, LIGNE, { id: 'q15-ligne-bob-0001' })], savedFoods: [ANC_SANS_T] }, prs: {}, sessions: [] });
  X.props.ADMIN_TOKEN = ADMIN;
  const bobAvant = J(X.compte(BOB)), avant = JSON.parse(J(X.compte(C)));   // `avant` : la « sauvegarde de la nuit » d'avant la remise à zéro
  const toks = { [C]: X.ctx._jetonPoser_(C, 'tel'), [D]: X.ctx._jetonPoser_(D, 'tel'), [E]: X.ctx._jetonPoser_(E, 'tel') };
  const post = (b, qui) => { const q = qui || C; try { return JSON.parse(X.post(Object.assign({ action: 'saveProfile', email: q, token: toks[q] }, b))); } catch (e) { return { status: 'ERREUR ' + e.message }; } };
  const prof = (qui) => ((X.compte(qui || C) || {}).profile || {});
  const noms = (l) => J((l || []).map((f) => f && f.name));
  const zone = (qui) => (((X.compte(qui || C) || {}).recupNut) || {});
  const evts = (qui) => (zone(qui).evts || []);
  /* les COPIES de la remise à zéro (motif « raz ») : dans la zone de récupération du compte, et ce qui en a déménagé dans Drive
     (le sous-dossier `recup-nut` des sauvegardes, relu) — jamais renvoyées à l'app */
  const copiesRaz = (qui) => {
    const q = qui || C, z = (zone(q).savedFoods || []).filter((x) => x && x.m === 'raz').map((x) => x.l && x.l.name);
    const d = X.fichiers.filter((f) => f.dir === 'recup-nut').map((f) => { try { return JSON.parse(f.content); } catch (e) { return null; } })
      .filter((x) => x && x.type === 'recupNut' && x.liste === 'savedFoods' && x.compte === q)
      .reduce((acc, x) => acc.concat((x.entrees || []).filter((y) => y && y.m === 'raz').map((y) => y.l && y.l.name)), []);
    return { zone: z.length, drive: d.length, noms: z.concat(d).sort() };
  };

  /* ① la remise à zéro arrive (l'app l'envoie aussitôt) avec un envoi de favoris VIDE */
  const r1 = post({ hiddenFoods: [{ k: '*', t: raz }], savedFoods: [] });
  const c1 = copiesRaz();
  tD('B-NFIAB-X Q15 ① ⭐⭐ D-141 — LA REMISE À ZÉRO SUPPRIME VRAIMENT LES ANCIENS FAVORIS DU SERVEUR, même sur un envoi VIDE (avant : « un envoi vide ne remplace jamais ») : il ne reste que le favori mis APRÈS ; les deux d\'avant (dont un sans date) sont d\'abord COPIÉS par la protection P1 (zone de récupération, motif « raz », jamais renvoyée à l\'app), puis retirés — l\'événement le dit (des nombres)',
    r1.status === 'ok' && noms(prof().savedFoods) === J([NEUF.name]) && J(c1.noms) === J([ANC_DATE.name, ANC_SANS_T.name].sort())
    && evts().some((e) => e.motif === 'raz' && e.retirees === 2 && e.copiees === 2), J({ r1, favs: noms(prof().savedFoods), c1, ev: evts().slice(-1) }));
  t('B-NFIAB-X Q15 ② ⛔ LA REMISE À ZÉRO NE TOUCHE NI LE JOURNAL, NI LE PROFIL, NI LES SÉANCES AU SERVEUR (tous les modes) : identiques à l\'octet, le journal compris',
    r1.status === 'ok' && J(prof().foodLog) === J(avant.profile.foodLog) && prof().name === 'Carol' && prof().bw === 61 && J((X.compte(C) || {}).sessions) === J(avant.sessions),
    J({ r1, journal: (prof().foodLog || []).length }));
  /* ② un appareil resté en retard renvoie un ancien favori, avec deux neufs */
  const r3 = post({ savedFoods: [ANC_SANS_T, NEUF, NEUF2] });
  tD('B-NFIAB-X Q15 ③ ⭐ UN APPAREIL EN RETARD RENVOIE UN ANCIEN FAVORI : le serveur ne le reprend pas, et ne le recopie pas (sa copie est déjà gardée : une seule) ; les favoris d\'APRÈS se synchronisent normalement',
    r3.status === 'ok' && noms(prof().savedFoods) === J([NEUF.name, NEUF2.name]) && J(copiesRaz().noms) === J(c1.noms), J({ favs: noms(prof().savedFoods), copies: copiesRaz() }));
  /* ③ Drive en panne, la zone DÉBORDE mais reste sous le plafond (8 anciens) : la suppression passe, la zone garde tout (D-110) */
  etat.drivePanne = true;
  const r4 = post({ hiddenFoods: [{ k: '*', t: raz }], savedFoods: [NEUF] }, D);
  const c4 = copiesRaz(D), ev4 = evts(D).slice(-1)[0] || null;
  tD('B-NFIAB-X Q15 ④ ⛔ DRIVE EN PANNE, LA ZONE DÉBORDE (8 anciens favoris, sous le plafond) : la suppression passe quand même et la zone garde les 8 copies au-delà de sa borne (D-110, validée par Michel : un envoi de favoris n\'est plus refusé pour une panne de Drive) — événement « differe »',
    r4.status === 'ok' && noms(prof(D).savedFoods) === J([NEUF.name]) && c4.zone === 8 && c4.drive === 0 && !!ev4 && ev4.differe === 'drive' && ev4.motif === 'raz',
    J({ favs: noms(prof(D).savedFoods), c4, ev4 }));
  /* ④ Drive en panne et la zone dépasserait son PLAFOND (15 anciens) : refus (D-109) — rien de supprimé, rien de repris, l'envoi attend */
  const NEUF3 = { name: 'Neuf 3 (test Q15)', kcal: 70, prot: 4, carbs: 7, fat: 2, t: now };
  const listeE = prof(E).savedFoods;
  const r5a = post({ hiddenFoods: [{ k: '*', t: raz }], savedFoods: [NEUF, NEUF3] }, E);
  const refus = { meme: J(prof(E).savedFoods) === J(listeE), c: copiesRaz(E), ev: evts(E).slice(-1)[0] || null };
  etat.drivePanne = false;
  const r5b = post({ savedFoods: [NEUF, NEUF3] }, E);
  const c5 = copiesRaz(E);
  tD('B-NFIAB-X Q15 ⑤ ⛔ DRIVE EN PANNE ET LA ZONE AU-DELÀ DE SON PLAFOND (15 anciens) : REFUS (D-109) — la liste du serveur reste telle quelle, aucune copie partielle, l\'envoi attend ; Drive revenu, le même envoi passe : les 15 copies gardées (zone + Drive, relu), seuls les favoris d\'après restent',
    r5a.status === 'ok' && refus.meme && refus.c.noms.length === 0 && !!refus.ev && refus.ev.refus === 'drive'
    && r5b.status === 'ok' && noms(prof(E).savedFoods) === J([NEUF.name, NEUF3.name]) && c5.noms.length === 15 && c5.drive > 0,
    J({ refus, apres: noms(prof(E).savedFoods), c5 }));
  /* ⑤ l'admin restaure la sauvegarde d'AVANT la remise à zéro (les anciens favoris dedans, aucune date `*`) */
  let r6 = null; try { r6 = JSON.parse(X.post({ action: 'adminRestore', adminToken: ADMIN, email: C, data: JSON.parse(J(avant)) })); } catch (e) { r6 = { status: 'ERREUR ' + e.message }; }
  tD('B-NFIAB-X Q15 ⑥ ⭐⭐ UNE SAUVEGARDE D\'AVANT RESTAURÉE PAR L\'ADMIN NE RAMÈNE PAS LES ANCIENS FAVORIS : la date de remise à zéro du compte est gardée (fusionnée), seuls les favoris d\'après restent actifs, le journal de la sauvegarde est restauré tel quel',
    !!r6 && r6.status === 'ok' && noms(prof().savedFoods) === J([NEUF.name]) && (prof().hiddenFoods || []).some((e) => e.k === '*' && e.t === raz) && J(prof().foodLog) === J(avant.profile.foodLog),
    J({ r6, favs: noms(prof().savedFoods), m: prof().hiddenFoods }));
  t('B-NFIAB-X Q15 ⑨ ⛔ UN AUTRE COMPTE N\'EST JAMAIS TOUCHÉ (tous les modes) : Bob, qui n\'a fait aucune remise à zéro, est identique à l\'octet — son ancien favori compris',
    J(X.compte(BOB)) === bobAvant, J({ bob: noms(((X.compte(BOB) || {}).profile || {}).savedFoods) }));
}

async function croiseFiab(t, b, PORT) {
  console.log('\n-- B-NFIAB-X. Synchro, restauration, autres appareils, remise à zéro (vrai Code.js en local) --');
  const SRV = masquesDansListeBlanche(), sansObjet = [];
  /* D-141 : le serveur SUPPRIME-t-il les favoris d'avant la remise à zéro (il faut aussi qu'il garde la date : SRV) ? */
  const SUPPR = SRV && dansSaveProfile(/_nutRazFavoris_\(/);
  console.log('   MODE : ' + (SRV ? 'le Code.js servi GARDE les masquages (`hiddenFoods` dans la liste blanche de saveProfile) — synchro entre appareils ET garanties locales'
    : 'le Code.js servi NE GARDE PAS les masquages (pas de `hiddenFoods` dans la liste blanche de saveProfile) — garanties LOCALES seulement ; les 6 témoins de synchro entre appareils sont SANS OBJET'));
  /* Un témoin de synchro entre appareils : joué si le serveur garde les masquages, sinon listé SANS OBJET (ni vert, ni rouge). */
  const tS = (nom, cond, detail) => { if (SRV) return t(nom, cond, detail);
    sansObjet.push(nom); console.log('  --   ' + nom + '   SANS OBJET (le Code.js servi ne garde pas les masquages)'); };
  /* Un témoin de la SUPPRESSION RÉELLE (D-141) : joué si le serveur supprime, sinon SANS OBJET (ni vert, ni rouge). */
  const tD = (nom, cond, detail) => { if (SUPPR) return t(nom, cond, detail);
    sansObjet.push(nom); console.log('  --   ' + nom + '   SANS OBJET (le Code.js servi ne supprime pas les anciens favoris : D-141 absent)'); };
  console.log('   D-141 : ' + (SUPPR ? 'le Code.js servi SUPPRIME les favoris d\'avant la remise à zéro (copie Drive relue d\'abord)' : 'le Code.js servi ne les supprime pas — témoins de la suppression SANS OBJET'));
  serveurQ15(t, tD);
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
  const loc1 = await p1.evaluate((e) => (S.hiddenFoods || []).some((h) => h && h.k === 'id:' + e), EAN_ISO);
  t('B-NFIAB-X T08 ⓪ LE MODE EST LE BON : la liste blanche de saveProfile ' + (SRV ? 'contient' : 'ne contient pas') + ' `hiddenFoods`, et le serveur (le vrai Code.js, en local) '
    + (SRV ? 'garde' : 'ne garde pas') + ' le « ✕ » synchronisé — ce que dit sa liste et ce qu\'il fait concordent',
    g && loc1 && SRV === srv1.length > 0, J({ SRV, loc1, srv1 }));
  tS('B-NFIAB-X T08 ① « ✕ » PART AU SERVEUR : la date de départ de l\'identité est dans le profil (avant : jamais synchronisée)',
    g && srv1.some((e) => e.k === 'id:' + EAN_ISO && e.t > 0), J({ g, i1, srv1, loc: await p1.evaluate(() => S.hiddenFoods) }));

  /* GARANTIES LOCALES (les deux modes) : sur le MÊME téléphone, « ✕ » tient au rechargement et à « 🔄 Restaurer » — rien de ce que
     renvoie le serveur ne le défait (la liste locale est FUSIONNÉE, jamais remplacée). */
  const masqueIso = (pg) => pg.evaluate((e) => { try { openAddFood(); } catch (x) {}
    const r = { m: (S.hiddenFoods || []).some((h) => h && h.k === 'id:' + e), deja: _afSuggLocales('iso zero').filter((l) => l.sourceId === e).length,
      fav: (_afQuickItems || []).some((it) => it.fav && (it._src || {}).sourceId === e) };
    try { closeAddFood(); } catch (x) {} return r; }, EAN_ISO);
  await CR.redemarrer(p1); const L1 = await masqueIso(p1), n1r = (await CR.journalApp(p1)).length;
  t('B-NFIAB-X T08L ① ⭐ SUR LE MÊME TÉLÉPHONE, « ✕ » TIENT AU RECHARGEMENT : sa date de départ est toujours là, l\'isolat n\'est plus proposé (ni favori, ni « Déjà noté par toi »), le journal entier',
    L1.m && L1.deja === 0 && !L1.fav && n1r === journalInit.length, J({ L1, n: n1r }));
  await CR.restaurer(p1); const L2 = await masqueIso(p1), n1s = (await CR.journalApp(p1)).length;
  t('B-NFIAB-X T08L ② ⭐ … ET À « 🔄 RESTAURER » : ce que renvoie le serveur ne fait pas revenir l\'isolat — le masquage local est gardé (fusionné, jamais remplacé), le journal arrive entier',
    L2.m && L2.deja === 0 && !L2.fav && n1s === journalInit.length, J({ L2, n: n1s }));

  /* Appareil 2 (téléphone neuf) : il DÉMARRE HORS LIGNE (le démarrage ne peut rien charger du serveur), puis « Restaurer » une fois
     le réseau revenu → l'isolat reste masqué ; le journal arrive entier. ⚠️ Démarré en ligne, le démarrage rapportait DÉJÀ les
     masquages (`autoConnect`) : le témoin restait vert même quand « Restaurer » les perdait (F21 ne mordait pas, 24/10). Ici, c'est
     bien « Restaurer » qui les rapporte — le démarrage a son propre témoin (T08 ④, F23). */
  etat.reseauCoupe = true;
  const D2 = await CR.appareil(b, PORT, X, etat, tok, 'nfiab-a2', { ft4_admin_ok: '1' }); const p2 = D2.pg;
  const masquesAvant2 = await p2.evaluate(() => (S.hiddenFoods || []).length);
  etat.reseauCoupe = false;
  await CR.restaurer(p2);
  const j2 = await CR.journalApp(p2), deja2 = await p2.evaluate((e) => { try { openAddFood(); } catch (x) {} const n = _afSuggLocales('iso zero').filter((l) => l.sourceId === e).length; try { closeAddFood(); } catch (x) {} return n; }, EAN_ISO);
  tS('B-NFIAB-X T08 ② ⭐ TÉLÉPHONE NEUF (démarré hors ligne) + « Restaurer » : aucun masquage avant, puis l\'isolat masqué sur l\'autre appareil ne réapparaît pas (« Déjà noté par toi » vide pour lui), le journal arrive entier (' + journalInit.length + ' lignes)',
    masquesAvant2 === 0 && deja2 === 0 && j2.length === journalInit.length, J({ masquesAvant2, deja2, n: j2.length }));

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
  const srvAvantRaz = JSON.parse(J(X.compte(CR.ALICE) || {}));
  etat.drivePanne = true;   // D-141 : la remise à zéro part pendant une panne de Drive — au serveur, rien ne doit partir sans copie
  await p1.evaluate(() => { try { if (typeof nutRazExecuter === 'function') nutRazExecuter(); } catch (e) {} }); await pause(p1, 300); g = await clic(p1, '#confirm-ok'); await pause(p1, 1500);
  const srvPanne = (X.compte(CR.ALICE) || {}).profile || {}, evPanne = ((((X.compte(CR.ALICE) || {}).recupNut) || {}).evts || []).slice(-1)[0] || null;
  /* la copie de l'ancien favori (motif « raz ») : dans la zone de récupération d'Alice, ou ce qui en a déménagé dans Drive */
  const copieIsoNom = () => (((((X.compte(CR.ALICE) || {}).recupNut) || {}).savedFoods || []).some((x) => x && x.m === 'raz' && x.l && x.l.name === 'Iso zero protein (test)'))
    || X.fichiers.filter((f) => f.dir === 'recup-nut').some((f) => { try { return (JSON.parse(f.content).entrees || []).some((x) => x && x.m === 'raz' && x.l && x.l.name === 'Iso zero protein (test)'); } catch (e) { return false; } });
  const copiePanne = copieIsoNom();
  etat.drivePanne = false;
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
  tD('B-NFIAB-X Q15 ⑦ la remise à zéro faite PENDANT UNE PANNE DE DRIVE : au serveur, la date est arrivée et l\'ancien favori est retiré quand même — copié d\'abord dans la zone de récupération (Drive n\'est nécessaire que si la zone déborde) : rien n\'est perdu, rien n\'attend',
    (srvPanne.hiddenFoods || []).some((e) => e.k === '*' && e.t > 0) && (srvPanne.savedFoods || []).length === 0 && copiePanne && !!evPanne && evPanne.motif === 'raz',
    J({ f: (srvPanne.savedFoods || []).length, copiePanne, ev: evPanne }));
  await CR.synchroniser(p1);   // Drive revenu : l'envoi suivant de l'app
  const compte2 = X.compte(CR.ALICE) || {}, srv2 = compte2.profile || {};
  if (SUPPR) t('B-NFIAB-X T08 ③ ⭐⭐ (D-141) la remise à zéro est au serveur (une seule date, `*`) ET ses anciens favoris en sont SUPPRIMÉS (0 favori) — après une copie gardée par la protection P1 (motif « raz » : zone de récupération, ou Drive relu si elle déborde)',
    (srv2.hiddenFoods || []).some((e) => e.k === '*' && e.t > 0) && (srv2.savedFoods || []).length === 0 && copieIsoNom(), J({ m: srv2.hiddenFoods, f: (srv2.savedFoods || []).length, copie: copieIsoNom() }));
  else tS('B-NFIAB-X T08 ③ (D-133, serveur sans D-141) la remise à zéro est au serveur (une seule date, `*`) ; ses favoris restent au serveur (un envoi vide ne remplace jamais sa liste) — c\'est la date qui les écarte',
    (srv2.hiddenFoods || []).some((e) => e.k === '*' && e.t > 0) && (srv2.savedFoods || []).length === 1, J({ m: srv2.hiddenFoods, f: (srv2.savedFoods || []).length }));
  t('B-NFIAB-X Q15 ⑧ ⛔ AU SERVEUR, LE JOURNAL, LE PROFIL ET LES SÉANCES D\'ALICE SONT IDENTIQUES À L\'OCTET après la remise à zéro et sa suppression (tous les modes)',
    J(srv2.foodLog) === J((srvAvantRaz.profile || {}).foodLog) && srv2.name === (srvAvantRaz.profile || {}).name && J(compte2.sessions) === J(srvAvantRaz.sessions) && (srv2.foodLog || []).length === journalInit.length,
    J({ n: (srv2.foodLog || []).length }));

  /* GARANTIE LOCALE (les deux modes) : sur ce téléphone, la remise à zéro tient au rechargement et à « 🔄 Restaurer ». Le serveur
     garde ses anciens favoris (un envoi vide ne remplace jamais sa liste) : « Restaurer » les rapporte, et c'est la date LOCALE qui
     les écarte. */
  await CR.redemarrer(p1); const propR = await propositions(p1);
  await CR.restaurer(p1); const propS = await propositions(p1), jS = empreinte(await CR.journalApp(p1));
  const favSrv = (((X.compte(CR.ALICE) || {}).profile || {}).savedFoods || []).length;
  t('B-NFIAB-X T08L ③ ⭐⭐ SUR CE TÉLÉPHONE, LA REMISE À ZÉRO TIENT AU RECHARGEMENT ET À « 🔄 RESTAURER » : aucun favori, aucune proposition ancienne — '
    + (SUPPR ? 'le serveur n\'a plus ses favoris d\'avant (D-141)' : 'alors que le serveur garde encore ses favoris d\'avant') + ' — et le journal identique à l\'octet',
    (SUPPR ? favSrv === 0 : favSrv >= 1) && [propR, propS].every((p) => p.mes === 0 && p.deja === 0 && p.hab === 0 && p.favs === 0) && jS === jAvant, J({ propR, propS, favSrv }));

  /* Appareil 2, resté HORS LIGNE pendant la remise à zéro : il « ✕ » un autre aliment et synchronise SA liste (sans la remise à
     zéro). Le serveur fusionne (le plus tard gagne) : la remise à zéro n'en sort jamais. */
  await p2.evaluate(() => { const n = { k: 'nom:autre aliment (test)', t: Date.now() };
    S.hiddenFoods = (typeof _nutMasquesFusion === 'function') ? _nutMasquesFusion((S.hiddenFoods || []).filter((e) => e && e.k !== '*'), [n])
      : (S.hiddenFoods || []).concat(['nom:autre aliment (test)']);
    persist(); });
  await CR.synchroniser(p2);
  const srv3 = ((X.compte(CR.ALICE) || {}).profile || {}).hiddenFoods || [];
  tS('B-NFIAB-X T08 ⑦ ⭐ UN TÉLÉPHONE RESTÉ SUR UNE ANCIENNE LISTE (hors ligne pendant la remise à zéro) SYNCHRONISE : le serveur garde la remise à zéro ET ajoute son « ✕ » — rien ne se perd, rien ne réapparaît',
    srv3.some((e) => e.k === '*' && e.t > 0) && srv3.some((e) => e.k === 'nom:autre aliment (test)'), J(srv3));
  const fav3 = await CR.favoris(p2), favSrv3 = ((((X.compte(CR.ALICE) || {}).profile) || {}).savedFoods || []);
  tD('B-NFIAB-X T08 ⑧ ⭐⭐ (D-141) CE TÉLÉPHONE EN RETARD AVAIT ENCORE L\'ANCIEN FAVORI ET L\'A RENVOYÉ : le serveur ne l\'a PAS repris (0 favori au serveur) — aucune réapparition par la synchro',
    fav3.some((f) => f && f.name === 'Iso zero protein (test)') && favSrv3.length === 0, J({ local: fav3.map((f) => f && f.name), serveur: favSrv3.map((f) => f && f.name) }));

  /* Appareil 2 : au DÉMARRAGE (sans « Restaurer »), la remise à zéro faite ailleurs s'applique */
  await CR.redemarrer(p2); await pause(p2, 1500);
  const prop2 = await propositions(p2), j2b = await CR.journalApp(p2);
  tS('B-NFIAB-X T08 ④ ⭐ L\'AUTRE APPAREIL, AU DÉMARRAGE : la remise à zéro faite ailleurs s\'applique — aucun favori, aucune proposition ancienne, son journal intact',
    prop2.mes === 0 && prop2.deja === 0 && prop2.favs === 0 && j2b.length === journalInit.length, J({ prop2, n: j2b.length }));

  /* Appareil 3 : un téléphone neuf restauré APRÈS la remise à zéro — rien ne revient */
  const D3 = await CR.appareil(b, PORT, X, etat, tok, 'nfiab-a3', {}); const p3 = D3.pg;
  await CR.restaurer(p3);
  const prop3 = await propositions(p3), j3 = await CR.journalApp(p3);
  tS('B-NFIAB-X T08 ⑤ ⭐⭐ UN 3ᵉ TÉLÉPHONE RESTAURÉ APRÈS : les favoris du serveur sont écartés par la date, aucune ancienne proposition ne revient, le journal est restauré ENTIER',
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

  /* T08L ④ (tous les modes) : le serveur RENVOIE un ancien favori — une sauvegarde restaurée telle quelle par un serveur d'avant
     D-141, ou un serveur pas encore à jour. « 🔄 Restaurer » sur le téléphone : la date locale l'écarte encore (défense de l'app). */
  { const brut = X.compte(CR.ALICE); brut.profile.savedFoods = (brut.profile.savedFoods || []).concat([Object.assign({}, FAV_ISO_NOM)]); X.ctx.saveUserData_(CR.ALICE, brut); }
  await CR.restaurer(p1); const favI = await CR.favoris(p1), propI = await propositions(p1);
  t('B-NFIAB-X T08L ④ ⭐ MÊME SI LE SERVEUR RENVOIE UN ANCIEN FAVORI (une sauvegarde d\'avant restaurée telle quelle, un serveur pas encore à jour), « 🔄 Restaurer » ne le reprend pas : seul le favori d\'après revient',
    favI.length === 1 && favI[0].name === 'Yaourt après (test)' && propI.favs === 1, J({ favI: favI.map((f) => f && f.name), propI }));

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
  if (sansObjet.length) console.log('   SANS OBJET (' + sansObjet.length + ', ni verts ni rouges) — le Code.js servi ne garde pas les masquages, ou ne supprime pas les anciens favoris (D-141) : ' + sansObjet.map((n) => n.replace(/^B-NFIAB-X (\S+ \S+).*$/, '$1')).join(' · '));
  for (const D of [D1, D2, D3]) await D.cx.close();
}

module.exports = { ecran: ecranFiab, croise: croiseFiab };
