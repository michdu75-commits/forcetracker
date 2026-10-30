/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
   📱 RECETTE MOBILE AUTOMATISÉE — NUTRITION V2 (publication ft-v1263, ordre de Michel du 30/10) — bloc B-NRM.
   Banc : tools/banc_nut_recette_mobile.js.

   ⛔ CE N'EST PAS UN ESSAI SUR UN IPHONE PHYSIQUE : c'est Chromium avec un viewport d'iPhone (390 × 844, tactile, agent iPhone). Il éprouve les
   GESTES (touchers sur les vrais boutons, pas des appels de fonction quand un bouton existe), les valeurs affichées AVANT et APRÈS l'enregistrement,
   l'absence de doublon, les erreurs JavaScript et la conservation des données au rechargement.
   ⛔ SANS PREUVE SIMULÉE : `_n2PreuveSource` n'est PAS surchargé ici — c'est le parcours de production. Open Food Facts est servi par `page.route`
   (aucun réseau réel) ; la table CIQUAL et la base d'enseignes sont les vraies (data/*.json servies en local).
   Données INVENTÉES, aucune donnée réelle.
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const J = (x) => JSON.stringify(x);

const CIQ = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'ciqual.json'), 'utf8'));
const RCIQ = CIQ.a.find((x) => x[3] > 100 && x[4] > 5 && x[6] > 2 && x[5] >= 0 && String(x[1]).length < 40);   // un aliment de la table : l'authentique
const SID_CIQ = 'ciqual:' + RCIQ[0];

const EAN_Z = '3000000000601', EAN_X = '3000000000602', EAN_N = '3000000000603', EAN_S = '3000000000604';
const NPV2_OFF = { s: 1, m: 'p', st: 'fiable', qo: 'tapee', manque: [], no: [], corr: [], f: { src: 'off', ver: null, fiab: 'source', base: 'g' } };
const v2 = (id, name, sid, p100, q, extra) => Object.assign({ id: id, meal: 'diner', name: name, kcal: Math.round(p100.kcal * q / 100), prot: Math.round(p100.prot * q / 100), carbs: Math.round(p100.carbs * q / 100), fat: Math.round(p100.fat * q / 100),
  q: q, u: 'g', per100: p100, v: 1, saisie: 'code-tape', origine: 'off', sourceId: sid, etat: 'tel-que-vendu', n2: NPV2_OFF }, extra || {});
const P_CIQ = { kcal: RCIQ[3], prot: RCIQ[4], carbs: RCIQ[5], fat: RCIQ[6] };
const L_CIQ = (id, jour) => v2(id, 'Aliment table (recette)', SID_CIQ, P_CIQ, 150, { saisie: 'ciqual', origine: 'ciqual', etat: null, date: jour, n2: Object.assign({}, NPV2_OFF, { f: { src: 'ciqual', ver: 'CIQUAL-2025', fiab: 'source', base: 'g' } }) });
const L_Z = (id, jour) => v2(id, 'Skyr ancien scan (recette)', EAN_Z, { kcal: 129, prot: 20, carbs: 2, fat: 5 }, 100, { date: jour });
const ANCIEN_X = { id: 'nrm-X-00000001', meal: 'collation', name: 'Barre très ancienne (recette)', kcal: 230, prot: 10, carbs: 25, fat: 9, q: 100, u: 'g', per100: null, v: 1, saisie: 'scan', origine: 'off', sourceId: EAN_X, etat: null };
const SUSPECT = v2('nrm-S-00000001', 'Skyr impossible (recette)', EAN_S, { kcal: 65, prot: 20, carbs: 2, fat: 4 }, 100);

const OFF = {
  [EAN_Z]: { product_name_fr: 'Skyr ancien scan (recette)', brands: 'Test', quantity: '150 g', code: EAN_Z, nutriments: { 'energy-kcal_100g': 129, proteins_100g: 20, carbohydrates_100g: 2, fat_100g: 5 } },
  [EAN_X]: { product_name_fr: 'Barre très ancienne (recette)', brands: 'Test', quantity: '45 g', code: EAN_X, nutriments: { 'energy-kcal_100g': 410, proteins_100g: 20, carbohydrates_100g: 45, fat_100g: 15 } },
  [EAN_N]: { product_name_fr: 'Nouveau produit scanné (recette)', brands: 'Test', quantity: '200 g', code: EAN_N, nutriments: { 'energy-kcal_100g': 90, proteins_100g: 6, carbohydrates_100g: 12, fat_100g: 2 } },
  [EAN_S]: { product_name_fr: 'Skyr impossible (recette)', brands: 'Test', quantity: '150 g', code: EAN_S, nutriments: { 'energy-kcal_100g': 110, proteins_100g: 20, carbohydrates_100g: 4, fat_100g: 1.5 } },
};

const FIX = `(() => { try {
  if (sessionStorage.getItem('__nrm')) return; sessionStorage.setItem('__nrm', '1');
  localStorage.clear();
  localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
  const pad = n => String(n).padStart(2,'0');
  const jour = k => { const t = new Date(); t.setDate(t.getDate()-k); return t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate()); };
  const L = __LIGNES__.map((x, i) => { const o = Object.assign({}, x); if (!o.date) o.date = jour(__K__(o)); o.ts = 1760000000000 + i * 60000; return o; });
  localStorage.setItem('ft4_foodlog', JSON.stringify(L));
  localStorage.setItem('ft4_savedfoods', '[]');
} catch (e) {} })();`;

function lignes() {
  const jour = (k) => { const t = new Date(); t.setDate(t.getDate() - k); const p = (n) => String(n).padStart(2, '0'); return t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate()); };
  return [
    L_CIQ('nrm-K-00000001', jour(1)),                       // l'aliment de la table, authentique
    L_Z('nrm-Z-00000001', jour(1)),                         // un ancien scan OFF (cohérent, sans preuve)
    Object.assign({}, ANCIEN_X, { date: jour(2) }),         // un très ancien scan, sans fiche
    Object.assign({}, SUSPECT, { date: jour(2) }),          // une fiche impossible
    /* le même repas habituel sur deux jours : l'aliment de la table + l'ancien scan */
    L_CIQ('nrm-K-00000002', jour(3)), L_Z('nrm-Z-00000002', jour(3)),
    L_CIQ('nrm-K-00000003', jour(4)), L_Z('nrm-Z-00000003', jour(4)),
  ];
}

async function ouvrirPage(b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' });
  const pg = await cx.newPage();
  const erreurs = [], reseau = { coupe: false, delai: 0, appels: [] };
  pg.on('pageerror', (e) => erreurs.push(String(e && e.message || e).slice(0, 160)));
  pg.on('dialog', (d) => d.accept());
  await pg.route(/openfoodfacts/, async (r) => {
    const u = r.request().url(); reseau.appels.push(u);
    if (reseau.coupe) return r.abort();
    if (/search/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: J({ products: [] }) });
    const ean = Object.keys(OFF).find((e) => u.indexOf(e) >= 0);
    if (reseau.delai) await new Promise((ok) => setTimeout(ok, reseau.delai));
    return r.fulfill({ status: 200, contentType: 'application/json', body: J(ean ? { status: 1, code: ean, product: OFF[ean] } : { status: 0 }) });
  });
  const L = lignes();
  await pg.addInitScript(FIX.replace('__LIGNES__', J(L)).replace('__K__(o)', '1'));
  return { cx, pg, erreurs, reseau, L };
}

module.exports.ecran = async function ecran(t, b, PORT) {
  console.log('\n-- B-NRM. Recette mobile automatisée (iPhone simulé, SANS preuve simulée) --');
  const { cx, pg, erreurs, reseau } = await ouvrirPage(b, PORT);
  const E = (f, a) => pg.evaluate(f, a);
  const pause = (ms) => pg.waitForTimeout(ms);
  const tap = async (sel) => { try { await pg.tap(sel, { timeout: 4000 }); return true; } catch (e) { try { await pg.click(sel, { timeout: 2000 }); return true; } catch (e2) { return false; } } };
  const journal = () => E(() => JSON.parse(JSON.stringify(S.foodLog || [])));
  const neuves = (L, av) => L.filter((x) => x && av.indexOf(x.id) < 0);
  const vals = (l) => l ? [l.kcal, l.prot, l.carbs, l.fat].join('/') : null;
  const ecr = () => E(() => ['kcal', 'prot', 'carbs', 'fat'].map((c) => document.getElementById('af-' + c).value).join('/'));
  const toasts = () => E(() => (window.__toasts || []).slice());
  const dernier = () => E(() => (window.__toasts || []).slice(-1)[0] || '');
  const fermer = async () => { await E(() => { try { closeAddFood(); } catch (e) {} document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); }); await pause(200); };

  await pg.goto('http://localhost:' + PORT + '/index.html'); await pause(1500);
  await E(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); window.__toasts = []; const v = window.toast; window.toast = function (m) { window.__toasts.push(String(m)); try { return v.apply(this, arguments); } catch (e) {} }; });
  const nav = (await tap('#nb-nutrition')) && (await pause(350), await tap('#ntab-journal')); await pause(250);
  const ouvrirAjout = async () => { await fermer(); const ok = await tap('button[onclick="addFoodVia(\'main\')"]'); await pause(450); return ok; };
  const depart = await journal();
  t('B-NRM R0 la page est prête (iPhone simulé 390×844, tactile) avec 8 lignes inventées ; la preuve de source n\'est PAS surchargée', nav && depart.length === 8 && (await E(() => String(_n2PreuveSource).indexOf('_n2RefTable') >= 0)), J({ nav, n: depart.length }));

  /* ── ① AJOUT D'UN ALIMENT CIQUAL ── */
  let ok = await ouvrirAjout();
  await pg.fill('#af-desc', RCIQ[1].split(',')[0].slice(0, 14)); await pg.dispatchEvent('#af-desc', 'input');
  await pg.waitForSelector('[onclick="_afSuggPrendreCiqual(0)"]', { timeout: 8000 }).catch(() => {});
  ok = ok && await tap('[onclick="_afSuggPrendreCiqual(0)"]'); await pause(400);
  const choisi = await E(() => ({ bc: !!_bcNutr, k100: _bcNutr && _bcNutr.kcal100, nom: _bcNutr && _bcNutr.name, ro: document.getElementById('af-kcal').readOnly }));
  await pg.fill('#af-bc-grams', '150'); await pg.dispatchEvent('#af-bc-grams', 'input'); await pause(300);
  const avant1 = await ecr(); const ro1 = await E(() => document.getElementById('af-kcal').readOnly); const av1 = (await journal()).map((x) => x.id);
  ok = ok && await tap('button[onclick="addFoodEntry()"]'); await pause(600);
  const L1 = await journal(), n1 = neuves(L1, av1);
  t('B-NRM R1 ⭐ ajout d\'un aliment CIQUAL (toucher sur la proposition, 150 g) : l\'écran affiche les valeurs de la FICHE × 150 g, verrouillées ; « Ajouter » écrit EXACTEMENT ces valeurs, avec l\'identifiant CIQUAL ; une seule ligne',
    ok && choisi.bc && ro1 === true && n1.length === 1 && vals(n1[0]) === avant1 && /^ciqual:/.test(n1[0].sourceId) && n1[0].q === 150, J({ choisi, avant1, tt: await dernier(), ro2: await E(() => document.getElementById('af-kcal').readOnly), n: n1.map((x) => [vals(x), x.sourceId, x.q]) }));

  /* ── ② SCAN D'UN PRODUIT OPEN FOOD FACTS (nouveau) ── */
  await ouvrirAjout();
  await E((e) => { _lookupBarcode(e, 'code-tape', false); }, EAN_N); await pause(900);
  const scan = await E(() => ({ bc: !!_bcNutr, k100: _bcNutr && _bcNutr.kcal100, ro: document.getElementById('af-kcal').readOnly }));
  await pg.fill('#af-bc-grams', '80'); await pg.dispatchEvent('#af-bc-grams', 'input'); await pause(300);
  const avant2 = await ecr(); const ro2a = await E(() => document.getElementById('af-kcal').readOnly); const av2 = (await journal()).map((x) => x.id);
  await tap('button[onclick="addFoodEntry()"]'); await pause(600);
  const n2 = neuves(await journal(), av2);
  t('B-NRM R2 ⭐ scan d\'un produit Open Food Facts : fiche fraîche appliquée au bon produit (90 kcal/100 g), 80 g = 72 kcal affichés avant ET enregistrés, code-barres gardé, une seule ligne',
    scan.bc && scan.k100 === 90 && ro2a === true && avant2.split('/')[0] === '72' && n2.length === 1 && vals(n2[0]) === avant2 && n2[0].sourceId === EAN_N && n2[0].origine === 'off', J({ scan, avant2, tt: await dernier(), ro2: await E(() => document.getElementById('af-kcal').readOnly), n: n2.map((x) => [vals(x), x.sourceId]) }));

  /* ── ③ REPRISE D'UN ANCIEN ALIMENT SCANNÉ (sans fiche) : la fiche se retrouve EN LIGNE ── */
  await ouvrirAjout();
  const iX = await E(() => (_afQuickItems || []).findIndex((it) => it.name === 'Barre très ancienne (recette)'));
  const appelsAvant = reseau.appels.length;
  const tapX = iX >= 0 && await tap('#af-quick-list div[onclick="quickFillFood(' + iX + ')"]'); await pause(1300);
  const rep = await E(() => ({ bc: !!_bcNutr, k100: _bcNutr && _bcNutr.kcal100, nom: (document.getElementById('af-bc-name') || {}).textContent || '', last: (() => { const x = document.getElementById('af-bc-last'); return x && x.offsetParent !== null ? x.textContent : ''; })(), grams: (document.getElementById('af-bc-grams') || {}).value }));
  const tapLast = await tap('#af-bc-last'); await pause(250);
  const avant3 = await ecr(); const av3 = (await journal()).map((x) => x.id);
  await tap('button[onclick="addFoodEntry()"]'); await pause(600);
  const L3 = await journal(), n3 = neuves(L3, av3);
  t('B-NRM R3 ⭐⭐ reprise d\'un très ancien scan (sans fiche) : l\'app retrouve sa fiche EN LIGNE par le code-barres (410 kcal/100 g), dit l\'écart avec l\'ancienne saisie, propose l\'ancienne quantité SANS la poser (champ vide), puis « Ajouter » écrit ce que l\'écran montrait (100 g = 410) ; l\'ancienne ligne est intacte',
    tapX && reseau.appels.length > appelsAvant && rep.bc && rep.k100 === 410 && /fiche retrouvée par son code-barres/.test(rep.nom) && /ta saisie disait 230 kcal/.test(rep.nom) && /100\s*g/.test(rep.last) && rep.grams === '' && tapLast
      && n3.length === 1 && vals(n3[0]) === avant3 && avant3.split('/')[0] === '410' && n3[0].sourceId === EAN_X && J(L3.find((x) => x.id === ANCIEN_X.id)) === J(depart.find((x) => x.id === ANCIEN_X.id)), J({ rep, avant3, n: n3.map((x) => vals(x)) }));

  /* ── ④ « MES ALIMENTS » : le « + » ── */
  await ouvrirAjout();
  const liste = await E(() => (_afQuickItems || []).map((it, i) => ({ i: i, nom: it.name, txt: ((document.querySelector('#af-quick-list div[onclick="quickFillFood(' + i + ')"]') || {}).innerText || '').replace(/\s+/g, ' '), ok: !!(it._ap && it._ap.ok && !it._ap.raison), kc: it._ap && it._ap.ligne ? it._ap.ligne.kcal : null })));
  const iK = liste.find((x) => x.nom === 'Aliment table (recette)' || /^Salade de thon/.test(x.nom)), iZ = liste.find((x) => x.nom === 'Skyr ancien scan (recette)');
  const avK = (await journal()).map((x) => x.id);
  const tapK = !!iK && await tap('#af-quick-list button[onclick="quickAddFood(' + iK.i + ')"]'); await pause(700);
  const nK = neuves(await journal(), avK);
  const kcalListe = iK && String(iK.kc);   // la ligne annoncée par l'aperçu (la liste dédouble par identifiant CIQUAL : la ligne ajoutée en R1 a pris la place de la ligne de départ)
  t('B-NRM R4a ⭐ « + » de l\'aliment CIQUAL de « Mes aliments » (table chargée au besoin) : la liste annonçait ses calories, et c\'est ce qui s\'écrit (une seule ligne)', tapK && iK.kc > 0 && iK.ok && nK.length === 1 && String(nK[0].kcal) === kcalListe && /^ciqual:/.test(nK[0].sourceId), J({ iK, noms: liste.map((x) => x.nom), n: nK.map((x) => vals(x)) }));
  await ouvrirAjout();
  const liste2 = await E(() => (_afQuickItems || []).map((it, i) => ({ i: i, nom: it.name, ok: !!(it._ap && it._ap.ok && !it._ap.raison), txt: ((document.querySelector('#af-quick-list div[onclick="quickFillFood(' + i + ')"]') || {}).innerText || '').replace(/\s+/g, ' ') })));
  const iZ2 = liste2.find((x) => x.nom === 'Skyr ancien scan (recette)');
  const avZ = (await journal()).map((x) => x.id); await E(() => { window.__toasts = []; });
  const tapZ = !!iZ2 && await tap('#af-quick-list button[onclick="quickAddFood(' + iZ2.i + ')"]'); await pause(900);
  const nZ = neuves(await journal(), avZ), ouvert = await E(() => document.getElementById('ov-add-food').classList.contains('open'));
  const tz = (await toasts()).join(' | ');
  t('B-NRM R4b ⭐⭐ « + » d\'un ancien scan OFF sans preuve : la liste le dit « à vérifier », le toucher n\'écrit RIEN, l\'écran s\'ouvre (la fiche est cherchée en ligne), le message explique en une phrase',
    tapZ && iZ2 && !iZ2.ok && /à vérifier/.test(iZ2.txt) && nZ.length === 0 && ouvert && /Ancienne fiche non vérifiée/.test(tz), J({ iZ2, n: nZ.length, ouvert, tz }));
  await pause(800);
  const apresZ = await E(() => { const g = document.getElementById('af-bc-grams'); if (g) { g.value = '100'; g.dispatchEvent(new Event('input', { bubbles: true })); } return { bc: !!_bcNutr, k100: _bcNutr && _bcNutr.kcal100, ro: document.getElementById('af-kcal').readOnly, kcal: document.getElementById('af-kcal').value }; });
  t('B-NRM R4c ⭐ … et la fiche retrouvée EN LIGNE (129 kcal/100 g) s\'applique au bon produit : le calcul existant reprend (champs verrouillés), toujours rien d\'écrit avant « Ajouter »', apresZ.bc === true && apresZ.k100 === 129 && apresZ.ro === true && (await journal()).length === avZ.length + 0, J(apresZ));

  /* ── ⑤ FAVORIS ── */
  await E(() => { const K = S.foodLog.find((x) => x.id === 'nrm-K-00000001'), Z = S.foodLog.find((x) => x.id === 'nrm-Z-00000001'); S.savedFoods = [_favDepuisLigne(K), _favDepuisLigne(Z)].map((f, i) => Object.assign(f, { name: i ? 'Favori OFF (recette)' : 'Favori table (recette)', t: Date.now() })); persist(); });
  await ouvrirAjout();
  const fav = await E(() => (_afQuickItems || []).map((it, i) => ({ i: i, nom: it.name, fav: it.fav, ok: !!(it._ap && it._ap.ok && !it._ap.raison) })));
  const fK = fav.find((x) => x.nom === 'Favori table (recette)'), fZ = fav.find((x) => x.nom === 'Favori OFF (recette)');
  const avF = (await journal()).map((x) => x.id);
  await pg.tap('#af-quick-list button[onclick="quickAddFood(' + fK.i + ')"]'); await pg.tap('#af-quick-list button[onclick="quickAddFood(' + fK.i + ')"]', { timeout: 800 }).catch(() => {}); await pause(800);
  const nF = neuves(await journal(), avF);
  t('B-NRM R5a ⭐ favori authentique (CIQUAL) : « + » écrit UNE ligne, et un second toucher immédiat n\'en ajoute pas une deuxième (pas de double ajout)', nF.length === 1 && nF[0].sourceId === SID_CIQ, J({ fav, n: nF.length }));
  await ouvrirAjout();
  const fav2 = await E(() => (_afQuickItems || []).map((it, i) => ({ i: i, nom: it.name })));
  const fZ2 = fav2.find((x) => x.nom === 'Favori OFF (recette)'); const avFZ = (await journal()).map((x) => x.id);
  await pg.tap('#af-quick-list button[onclick="quickAddFood(' + fZ2.i + ')"]'); await pause(800);
  t('B-NRM R5b ⭐ favori issu d\'un ancien scan OFF sans preuve : rien n\'est écrit, l\'écran s\'ouvre', neuves(await journal(), avFZ).length === 0 && (await E(() => document.getElementById('ov-add-food').classList.contains('open'))), J({ fZ }));

  /* ── ⑥ REPAS HABITUEL ── */
  await fermer();
  const hab = await E(() => { const r = _repasHabituels(); return { n: r.length, sig: r[0] && r[0].sig, items: r[0] && r[0].items.map((x) => x.name), carte: r[0] ? _habApercu(r[0], _n2FichesVerifiees()) : null }; });
  /* ↪️ RÉÉCRIT LE 30/10/2026 (NUT-REF-HIST-02, arbitrage CTO) — l'ancien R6 attendait l'AJOUT PARTIEL d'office (« le rejeu écrit exactement cet aliment ») : c'est le comportement que
     ce lot supprime. Le contrat est maintenant « tout ou rien » : rien n'est écrit tant que la personne n'a pas choisi ; l'ajout de l'aliment de la table SEUL reste possible, mais
     comme un GESTE (« Ajouter seulement l'autre »). Les garanties de sécurité ne baissent pas : elles montent (rien d'écrit sans décision). Texte d'avant : `git show e2b942f3:tests/parcours/nut_recette_mobile.js`. */
  await E(() => { renderFoodJournal(); }); await pause(300);   // les cartes « Tes repas habituels » sont affichées (le panneau se rattache à `hab-m-<rang>`)
  const avH = (await journal()).map((x) => x.id); const jH = JSON.stringify(await journal());
  await E((s) => { rejouerRepas(s, 'diner'); }, hab.sig); await pause(900);
  const nH0 = neuves(await journal(), avH);
  const pan = await E(() => { const c = document.getElementById('hab-m-0'); const bx = c && c.querySelector('.hab-choix'); return bx ? [...bx.querySelectorAll('button')].map((x) => x.textContent) : null; });
  t('B-NRM R6a ⭐⭐ repas habituel (aliment de la table + ancien scan OFF) : la carte annonce l\'aliment de la table SEUL dans ses totaux et 1 « à vérifier » ; le toucher n\'écrit RIEN et pose le choix (Réparer · Ajouter seulement l\'autre · Annuler)',
    hab.n >= 1 && hab.carte && hab.carte.n === 1 && hab.carte.aVerifier === 1 && nH0.length === 0 && !!pan && pan.length === 3, J({ hab, pan }));
  await E(() => { const bs = document.querySelectorAll('#hab-m-0 .hab-choix button'); bs[bs.length - 1].click(); }); await pause(200);
  t('B-NRM R6b ⭐ « Annuler » : le journal est identique à l\'octet', JSON.stringify(await journal()) === jH, '');
  await E((s) => { rejouerRepas(s, 'diner'); }, hab.sig); await pause(700);
  await E(() => { const bs = document.querySelectorAll('#hab-m-0 .hab-choix button'); bs[1].click(); }); await pause(900);
  const nH = neuves(await journal(), avH), th = await dernier();
  t('B-NRM R6c ⭐⭐ « Ajouter seulement l\'autre » : exactement l\'aliment de la table, une seule fois, et le message dit que l\'autre est à vérifier',
    nH.length === 1 && nH[0].sourceId === SID_CIQ && /à vérifier/.test(th), J({ nH: nH.map((x) => [x.name, vals(x)]), th }));

  /* ── ⑦ MODIFIER : quantité et repas ── */
  await fermer();
  const ouvrirModif = async (id) => { await fermer(); await E((i) => openEditFood(i), id); await pause(550); };
  const champsEf = () => E(() => ({ v: ['kcal', 'prot', 'carbs', 'fat'].map((c) => document.getElementById('ef-' + c).value).join('/'), note: (document.getElementById('ef-abandon') || {}).textContent || '', ro: document.getElementById('ef-kcal').readOnly }));
  await ouvrirModif('nrm-K-00000001');
  await pg.fill('#ef-grams', '200'); await pg.dispatchEvent('#ef-grams', 'input'); await pause(300);
  const mK = await champsEf();
  await tap('#ef-save'); await pause(500);
  const lK = (await journal()).find((x) => x.id === 'nrm-K-00000001');
  t('B-NRM R7a ⭐ « Modifier » la quantité d\'un aliment CIQUAL (150 → 200 g) : calories et macros recalculées par la fiche, affichées avant et enregistrées après, même ligne', mK.ro === true && vals(lK) === mK.v && lK.q === 200 && Math.round(P_CIQ.kcal * 2) === lK.kcal, J({ mK, lK: vals(lK) }));
  await ouvrirModif('nrm-Z-00000001');
  const mZ0 = await champsEf(); const avZZ = (await journal()).length; const zAvant = (await journal()).find((x) => x.id === 'nrm-Z-00000001');
  await pg.fill('#ef-grams', '150'); await pg.dispatchEvent('#ef-grams', 'input'); await pause(300);
  const mZ1 = await champsEf();
  await tap('#ef-save'); await pause(500);
  const LZ = await journal(), zApres = LZ.find((x) => x.id === 'nrm-Z-00000001');
  t('B-NRM R7b ⭐⭐ « Modifier » la quantité d\'un ancien scan OFF sans preuve : l\'avertissement dit qu\'il n\'est pas vérifié, le recalcul (100 → 150 g = 194 kcal) ne touche QUE cette ligne (même id, aucun ajout), qui reste « non vérifié »',
    /Ancienne fiche nutritionnelle non vérifiée/.test(mZ0.note) && /Fiche nutritionnelle non vérifiée\. Ce recalcul/.test(mZ1.note) && zApres.kcal === 194 && zApres.q === 150 && LZ.length === avZZ && (zApres.n2.no || []).indexOf('reprise-non-verifiee') >= 0, J({ mZ0: mZ0.note, mZ1: mZ1.note, z: zApres && vals(zApres), n: [LZ.length, avZZ] }));
  await ouvrirModif('nrm-Z-00000002');
  const zA2 = (await journal()).find((x) => x.id === 'nrm-Z-00000002');
  await E(() => { _setEditFoodMeal('collation'); }); await tap('#ef-save'); await pause(500);
  const zB2 = (await journal()).find((x) => x.id === 'nrm-Z-00000002'); const att = JSON.parse(JSON.stringify(zA2)); att.meal = 'collation';
  t('B-NRM R7c ⭐ « Modifier » seulement le REPAS : les valeurs nutritionnelles et toute la ligne restent identiques à l\'octet (seul le repas change)', J(zB2) === J(att), J(zB2));

  /* ── ⑧ FICHE ERRONÉE ── */
  await fermer();
  await ouvrirAjout();
  const iS = await E(() => (_afQuickItems || []).findIndex((it) => it.name === 'Skyr impossible (recette)')); const avS = (await journal()).map((x) => x.id);
  await tap('#af-quick-list button[onclick="quickAddFood(' + iS + ')"]'); await pause(900);
  const nS = neuves(await journal(), avS);
  await ouvrirModif('nrm-S-00000001');
  const mS = await champsEf(); const sAv = (await journal()).find((x) => x.id === 'nrm-S-00000001');
  await pg.fill('#ef-q', '300').catch(() => {}); await tap('#ef-save'); await pause(400);
  const sAp = (await journal()).find((x) => x.id === 'nrm-S-00000001');
  t('B-NRM R8 ⭐⭐ fiche physiquement impossible (65 kcal pour 20 g P + 4 g L) : « + » n\'écrit rien, « Modifier » montre ses valeurs enregistrées en lecture seule avec la phrase de la règle, et aucune quantité ne la recalcule (ligne identique)',
    nS.length === 0 && mS.ro === true && /Ancienne fiche non vérifiée/.test(mS.note) && mS.v === vals(sAv) && J(sAp) === J(sAv), J({ nS: nS.length, mS: mS.note.slice(0, 60) }));

  /* ── ⑨ RÉSEAU INDISPONIBLE / RÉPONSE RETARDÉE ── */
  await fermer(); reseau.coupe = true;
  await ouvrirAjout();
  const iZ3 = await E(() => (_renderFoodQuickList(), (_afQuickItems || []).findIndex((it) => /^(Skyr ancien scan|Favori OFF) \(recette\)/.test(it.name))));
  await tap('#af-quick-list div[onclick="quickFillFood(' + iZ3 + ')"]'); await pause(1300);
  const hors = await E(() => ({ bc: !!_bcNutr, kcal: document.getElementById('af-kcal').value, etat: (document.getElementById('af-retrouver-etat') || {}).textContent || '', libre: !document.getElementById('af-kcal').readOnly, texte: (document.getElementById('ov-add-food') || document.body).innerText }));
  await E(() => { const d = document.getElementById('af-desc'); d.value = 'Ma saisie perso 120 g'; d.dispatchEvent(new Event('input', { bubbles: true })); d.dispatchEvent(new Event('change', { bubbles: true }));
    [['kcal', '150'], ['prot', '12'], ['carbs', '10'], ['fat', '6']].forEach(([c, v]) => { const el = document.getElementById('af-' + c); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }); });
  await pause(250);
  await E(() => { const pr = document.getElementById('af-prop'); if (pr) { pr.value = '120'; _afPropPoser('tapee'); } }); await pause(250);
  const avP = (await journal()).map((x) => x.id);
  await tap('button[onclick="addFoodEntry()"]'); await pause(600);
  const nP = neuves(await journal(), avP);
  t('B-NRM R9a ⭐⭐ RÉSEAU COUPÉ : pas de fiche empruntée, l\'écran dit « introuvable » et laisse une saisie personnelle indépendante, qui s\'enregistre avec SES valeurs (150 kcal), sans l\'identité de l\'ancien scan',
    iZ3 >= 0 && hors.bc === false && hors.kcal === '' && /introuvable/i.test(hors.etat) && hors.libre === true && /Ancienne fiche non vérifiée/.test(hors.texte) && nP.length === 1 && nP[0].kcal === 150 && !nP[0].sourceId, J({ hors: { bc: hors.bc, kcal: hors.kcal, etat: hors.etat, libre: hors.libre, texte: (hors.texte || '').replace(/\s+/g, ' ').slice(0, 700) }, nP: nP.map((x) => [x.name, vals(x), x.sourceId]) }));
  await fermer(); reseau.coupe = false; reseau.delai = 1800;
  await ouvrirAjout();
  const iZ4 = await E(() => (_renderFoodQuickList(), (_afQuickItems || []).findIndex((it) => /^(Skyr ancien scan|Favori OFF) \(recette\)/.test(it.name))));
  await tap('#af-quick-list div[onclick="quickFillFood(' + iZ4 + ')"]'); await pause(300);
  await E(() => { const d = document.getElementById('af-desc'); d.value = 'Autre chose'; d.dispatchEvent(new Event('input', { bubbles: true })); d.dispatchEvent(new Event('change', { bubbles: true })); });
  await pause(2600);
  const tard = await E(() => ({ bc: !!_bcNutr, nom: document.getElementById('af-desc').value }));
  t('B-NRM R9b ⭐⭐ RÉPONSE EN RETARD : la personne a changé d\'aliment entre-temps (« Autre chose ») — la fiche qui arrive ensuite n\'est PAS appliquée à un autre aliment', iZ4 >= 0 && tard.bc === false && tard.nom === 'Autre chose', J(tard));
  reseau.delai = 0;

  /* ── ⑩ RECHARGEMENT : les données sont conservées ── */
  await fermer();
  const avRel = await journal(); const favRel = await E(() => JSON.stringify(S.savedFoods || []));
  await pg.reload(); await pause(2000);
  const apRel = await journal(); const favApres = await E(() => JSON.stringify(S.savedFoods || []));
  const ids = apRel.map((x) => x.id);
  t('B-NRM R10 ⭐⭐ après rechargement : le journal est identique à l\'octet, les favoris aussi, aucun doublon d\'identifiant', J(apRel) === J(avRel) && favApres === favRel && new Set(ids).size === ids.length, J({ avant: avRel.length, apres: apRel.length }));
  t('B-NRM R11 aucune erreur JavaScript pendant toute la recette', erreurs.length === 0, J(erreurs));
  await cx.close();
};
