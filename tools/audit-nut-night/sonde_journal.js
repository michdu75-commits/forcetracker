#!/usr/bin/env node
/* AUDIT NUTRITION DE NUIT (12/10/2026) — PARCOURS RÉEL DU JOURNAL. OUTIL D'AUDIT, HORS RUNTIME.
   Conduit la VRAIE interface (champ de recherche, clic sur une proposition, champ quantité, bouton « Ajouter au journal »,
   rechargement, écran « Modifier », suppression) et OBSERVE ce qui est écrit dans `S.foodLog` puis dans le stockage.
   Open Food Facts est servi par des réponses FIGÉES (le réseau réel est injoignable d'ici) : elles sont déclarées non réelles.
   Usage : node tools/audit-nut-night/sonde_journal.js <dossier de sortie> [racine servie] */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const OUT = process.argv[2] || '.';
const ROOT = process.argv[3] || path.resolve(__dirname, '..', '..');
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.woff2':'font/woff2','.wasm':'application/wasm','.svg':'image/svg+xml','.webp':'image/webp'};
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
/* Réponses Open Food Facts FIGÉES — non réelles, construites pour éprouver la normalisation (kJ seul, portion seule) */
const OFF_RECH = { products: [
  { code: '0000000000001', product_name_fr: 'Skyr nature (fixture)', brands: 'TestMarque', quantity: '450 g', serving_quantity: 150,
    nutriments: { 'energy-kcal_100g': 64, proteins_100g: 11, carbohydrates_100g: 4, fat_100g: 0.2 } },
  { code: '0000000000002', product_name_fr: 'Barre kJ seulement (fixture)', brands: 'TestMarque', quantity: '40 g', serving_quantity: 40,
    nutriments: { energy_100g: 1674, proteins_100g: 20, carbohydrates_100g: 45, fat_100g: 15 } } ] };
const OFF_PROD = { '3000000000017': { status: 1, product: { product_name_fr: 'Boisson kJ (fixture)', brands: 'TestMarque', quantity: '330 ml', serving_quantity: 330,
  nutriments: { energy_100g: 176, proteins_100g: 0, carbohydrates_100g: 10.4, fat_100g: 0 } } },
  '3000000000024': { status: 1, product: { product_name_fr: 'Biscuit portion seule (fixture)', brands: 'TestMarque', quantity: '200 g', serving_quantity: 25,
  nutriments: { 'energy-kcal_serving': 120, proteins_serving: 1.5, carbohydrates_serving: 17, fat_serving: 5 } } } };

const res = { scenarios: [], erreurs: [] };
const note = (id, titre, attendu, observe, ok, extra) => { res.scenarios.push(Object.assign({ id, titre, attendu, observe, ok }, extra || {})); console.log((ok ? '  ok ' : '  ✗  ') + id + ' ' + titre + (ok ? '' : '  >> ' + JSON.stringify(observe).slice(0, 300))); };

(async () => {
  await new Promise(r => srv.listen(0, r));
  const PORT = srv.address().port;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const cx = await b.newContext({ serviceWorkers: 'block' });
  await cx.route(/script\.google\.com|workers\.dev|anthropic/, rt => rt.abort());
  await cx.route(/openfoodfacts\.org\/cgi\/search/, rt => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(OFF_RECH) }));
  await cx.route(/openfoodfacts\.org\/api\/v[02]\/product\/(\d+)/, rt => { const m = /product\/(\d+)/.exec(rt.request().url()); const p = OFF_PROD[m[1]];
    return p ? rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(Object.assign({ code: m[1] }, p)) }) : rt.fulfill({ status: 200, contentType: 'application/json', body: '{"status":0}' }); });
  const pg = await cx.newPage();
  pg.on('pageerror', e => res.erreurs.push(String(e).slice(0, 200)));
  pg.on('dialog', d => d.accept());
  await pg.addInitScript(`try{ if(!sessionStorage.getItem('__init')){ sessionStorage.setItem('__init','1'); localStorage.clear(); }
    localStorage.setItem('ft4_ob2','1');localStorage.setItem('ft4_guide_shown','1');localStorage.setItem('ft4_wn_seen','99');}catch(e){}`);
  const ouvrir = async () => { await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); }); };
  await ouvrir();
  await pg.evaluate(async () => { await Promise.all([_ciqualCharger(), _aliasCharger(), _marquesCharger()]); });

  /* taper → attendre le rendu des sources locales (et Open Food Facts figé) → cliquer la proposition N de la section */
  const taperChoisir = (q, fn, idx, attendreOff) => pg.evaluate(async ([q, fn, idx, attendreOff]) => {
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    openAddFood(); await new Promise(r => setTimeout(r, 200));
    const inp = document.getElementById('af-desc'); inp.value = q; inp.dispatchEvent(new Event('input', { bubbles: true }));
    await Promise.all([_ciqualCharger(), _aliasCharger(), _marquesCharger()]); await new Promise(r => setTimeout(r, 60));
    if (attendreOff) await new Promise(r => setTimeout(r, 900));
    const boutons = [...document.querySelectorAll('#af-sugg button')];
    const lignes = boutons.map(x => (x.getAttribute('onclick') || '') + ' | ' + x.innerText.replace(/\s+/g, ' ').slice(0, 90));
    const bt = boutons.find(x => (x.getAttribute('onclick') || '') === fn + '(' + idx + ')');
    if (!bt) return { ok: false, lignes };
    const sp = bt.querySelectorAll('span'); const titre = sp.length > 1 ? sp[1].querySelector('span').innerText : bt.innerText;
    bt.click(); await new Promise(r => setTimeout(r, 120));
    return { ok: true, titre, lignes, per100: (typeof _bcNutr !== 'undefined' && _bcNutr) ? { kcal: _bcNutr.kcal100, p: _bcNutr.prot100, g: _bcNutr.carbs100, l: _bcNutr.fat100 } : null,
      grams: (document.getElementById('af-bc-grams') || {}).value, rowVisible: (document.getElementById('af-bc-row') || {}).style ? document.getElementById('af-bc-row').style.display : null,
      form: ['af-kcal', 'af-prot', 'af-carbs', 'af-fat'].map(i => (document.getElementById(i) || {}).value) };
  }, [q, fn, idx, attendreOff]);
  const quantite = g => pg.evaluate(g => { const el = document.getElementById('af-bc-grams'); el.value = String(g); el.dispatchEvent(new Event('input', { bubbles: true }));
    return ['af-kcal', 'af-prot', 'af-carbs', 'af-fat'].map(i => document.getElementById(i).value); }, g);
  const ajouter = () => pg.evaluate(async () => { const n0 = (S.foodLog || []).length;
    const bt = [...document.querySelectorAll('button')].find(x => (x.getAttribute('onclick') || '') === 'addFoodEntry()'); bt.click();
    await new Promise(r => setTimeout(r, 150)); const L = S.foodLog || []; return { ajoutees: L.length - n0, ligne: L.length > n0 ? L[L.length - 1] : null }; });
  const stock = () => pg.evaluate(() => { try { return JSON.parse(localStorage.getItem('ft4_foodlog') || '[]'); } catch (e) { return 'ILLISIBLE'; } });
  const attendu = (p100, g) => ({ kcal: Math.round(p100.kcal * g / 100), prot: Math.round(p100.p * g / 100), carbs: Math.round(p100.g * g / 100), fat: Math.round(p100.l * g / 100) });
  const egal = (l, a) => l && ['kcal', 'prot', 'carbs', 'fat'].every(k => l[k] === a[k]);

  /* J1 — CIQUAL : recherche → 1ʳᵉ proposition → 150 g → ajouter → stockage → rechargement → modifier 200 g → supprimer */
  const c1 = await taperChoisir('riz blanc cuit', '_afSuggPrendreCiqual', 0);
  await quantite(150); const a1 = await ajouter();
  const at1 = c1.per100 ? attendu(c1.per100, 150) : null;
  note('J1a', 'CIQUAL « riz blanc cuit » 150 g → ligne du journal = pour-100 g × 1,5', at1, a1.ligne && { nom: a1.ligne.name, kcal: a1.ligne.kcal, prot: a1.ligne.prot, carbs: a1.ligne.carbs, fat: a1.ligne.fat, q: a1.ligne.q, u: a1.ligne.u, per100: a1.ligne.per100, src: a1.ligne.src || a1.ligne.source || a1.ligne.saisie },
    a1.ajoutees === 1 && egal(a1.ligne, at1) && a1.ligne.q === 150, { choix: c1.titre });
  const id1 = a1.ligne && a1.ligne.id;
  const st1 = await stock(); note('J1b', 'la ligne est dans le stockage local', 'présente', Array.isArray(st1) ? st1.filter(x => x.id === id1).length : st1, Array.isArray(st1) && st1.filter(x => x.id === id1).length === 1);
  await ouvrir();
  const apres = await pg.evaluate(id => { const e = (S.foodLog || []).find(x => x.id === id); return e ? { kcal: e.kcal, prot: e.prot, carbs: e.carbs, fat: e.fat, q: e.q } : null; }, id1);
  note('J1c', 'après rechargement : la ligne est identique', at1, apres, !!apres && egal(apres, at1) && apres.q === 150);
  const ed = await pg.evaluate(async id => { openEditFood(id); await new Promise(r => setTimeout(r, 150));
    const g = document.getElementById('ef-grams'); if (!g) return { champ: false };
    g.value = '200'; g.dispatchEvent(new Event('input', { bubbles: true }));
    const bt = [...document.querySelectorAll('#ov-edit-food button')].find(x => (x.getAttribute('onclick') || '') === 'saveEditFood()'); bt.click();
    await new Promise(r => setTimeout(r, 150)); const e = S.foodLog.find(x => x.id === id); return { champ: true, kcal: e.kcal, prot: e.prot, carbs: e.carbs, fat: e.fat, q: e.q, u: e.u }; }, id1);
  const at1b = c1.per100 ? attendu(c1.per100, 200) : null;
  note('J1d', 'Modifier → 200 g : les 4 valeurs suivent', at1b, ed, ed.champ && egal(ed, at1b) && ed.q === 200);
  await ouvrir();
  const ed2 = await pg.evaluate(id => { const e = S.foodLog.find(x => x.id === id); return e ? { kcal: e.kcal, q: e.q } : null; }, id1);
  note('J1e', 'la modification survit au rechargement', at1b && { kcal: at1b.kcal, q: 200 }, ed2, !!ed2 && ed2.kcal === at1b.kcal && ed2.q === 200);

  /* J2 — reprise depuis « Déjà noté par toi » : quantité proposée, valeurs recalculées */
  const c2 = await taperChoisir('riz blanc', '_afSuggPrendreLocale', 0);
  const pre2 = await pg.evaluate(() => ({ grams: (document.getElementById('af-bc-grams') || {}).value, visible: document.getElementById('af-bc-row').style.display }));
  await quantite(100); const a2 = await ajouter();
  note('J2', 'reprise d\'une ligne déjà notée → 100 g → valeurs = pour-100 g', c1.per100 && attendu(c1.per100, 100), a2.ligne && { kcal: a2.ligne.kcal, prot: a2.ligne.prot, carbs: a2.ligne.carbs, fat: a2.ligne.fat, q: a2.ligne.q },
    c2.ok && a2.ajoutees === 1 && egal(a2.ligne, attendu(c1.per100, 100)), { choix: c2.titre, avant_saisie: pre2 });

  /* J3 — CIQUAL avec une macro INCONNUE (null) : que devient-elle au journal ? */
  const c3 = await taperChoisir('merguez crue', '_afSuggPrendreCiqual', 1);
  await quantite(100); const a3 = await ajouter();
  const brut3 = await pg.evaluate(t => { const a = _ciqual.a.find(x => x[1] === t); return a; }, c3.titre);
  note('J3', 'CIQUAL à glucides NON DÉTERMINÉS (null) → ce qui est écrit au journal', { liste: 'G ?', journal: 'glucides inconnus, pas 0' },
    { choix: c3.titre, ciqual: brut3, ligne: a3.ligne && { kcal: a3.ligne.kcal, prot: a3.ligne.prot, carbs: a3.ligne.carbs, fat: a3.ligne.fat, per100: a3.ligne.per100 } },
    !(a3.ligne && brut3 && brut3[5] == null && a3.ligne.carbs === 0));

  /* J4 — fast-food : portion publiée pré-remplie, kcal = pour-100 g × portion */
  const c4 = await taperChoisir('big mac', '_afSuggPrendreMarque', 0);
  const f4 = await pg.evaluate(() => ({ grams: document.getElementById('af-bc-grams').value, pose: typeof _bcQtyPose !== 'undefined' ? _bcQtyPose : null }));
  let a4 = await ajouter(); let ajoute4 = a4.ajoutees;
  const past = await pg.evaluate(() => { const bt = [...document.querySelectorAll('#af-bc-row button')].find(x => /232/.test(x.innerText)); if (!bt) return null; const t = bt.innerText; bt.click(); return t; });
  if (!ajoute4) a4 = await ajouter();
  f4.pastille = past; f4.grams = await pg.evaluate(() => document.getElementById('af-bc-grams').value);
  note('J4', 'fast-food « big mac » : portion publiée → ligne cohérente', c4.per100 && attendu(c4.per100, +f4.grams),
    a4.ligne && { kcal: a4.ligne.kcal, prot: a4.ligne.prot, q: a4.ligne.q, u: a4.ligne.u, src: a4.ligne.src },
    a4.ajoutees === 1 && c4.per100 && Math.abs(a4.ligne.kcal - attendu(c4.per100, +f4.grams).kcal) <= 1,
    { choix: c4.titre, portion_preremplie: f4.grams, ajout_sans_toucher_quantite: ajoute4 === 1 });

  /* J4b — LE GARDE « COMBIEN EN AS-TU MANGÉ ? » : champ quantité touché puis VIDÉ (ou 0) avant d'ajouter */
  for (const [id, val] of [['J4b', ''], ['J4c', '0'], ['J4d', 'abc']]) {
    const c = await taperChoisir('big mac', '_afSuggPrendreMarque', 0);
    await quantite('5'); await quantite(val); const a = await ajouter();
    note(id, 'fast-food, quantité tapée puis remplacée par « ' + val + ' » → refus (pas d\'enregistrement sans quantité)', { ajoutees: 0 },
      { ajoutees: a.ajoutees, ligne: a.ligne && { kcal: a.ligne.kcal, prot: a.ligne.prot, q: a.ligne.q, u: a.ligne.u, per100: a.ligne.per100 } }, a.ajoutees === 0, { choix: c.titre });
    if (a.ajoutees) await pg.evaluate(id => removeFoodEntry(id), a.ligne.id);
  }
  {
    const c = await taperChoisir('riz blanc cuit', '_afSuggPrendreCiqual', 0);
    await quantite('150'); await quantite(''); const a = await ajouter();
    note('J4e', 'CIQUAL, quantité tapée puis VIDÉE → refus (pas de ligne « pour 100 g » sans quantité)', { ajoutees: 0 },
      { ajoutees: a.ajoutees, ligne: a.ligne && { kcal: a.ligne.kcal, q: a.ligne.q, u: a.ligne.u } }, a.ajoutees === 0, { choix: c.titre });
    if (a.ajoutees) await pg.evaluate(id => removeFoodEntry(id), a.ligne.id);
  }

  /* J4f / J4g — la porte JUMELLE : « Modifier » une ligne de 250 g, vider le champ grammes (ou 0), enregistrer */
  {
    await taperChoisir('riz blanc cuit', '_afSuggPrendreCiqual', 0); await quantite('250'); const a = await ajouter();
    for (const [id, val] of [['J4f', ''], ['J4g', '0']]) {
      const r = await pg.evaluate(async ([id, val]) => { openEditFood(id); await new Promise(r => setTimeout(r, 150));
        const g = document.getElementById('ef-grams'); g.value = val; g.dispatchEvent(new Event('input', { bubbles: true }));
        [...document.querySelectorAll('#ov-edit-food button')].find(x => (x.getAttribute('onclick') || '') === 'saveEditFood()').click();
        await new Promise(r => setTimeout(r, 150)); const e = S.foodLog.find(x => x.id === id);
        const out = { kcal: e.kcal, prot: e.prot, q: e.q, u: e.u };
        openEditFood(id); await new Promise(r => setTimeout(r, 150)); const g2 = document.getElementById('ef-grams'); g2.value = '250'; g2.dispatchEvent(new Event('input', { bubbles: true }));
        [...document.querySelectorAll('#ov-edit-food button')].find(x => (x.getAttribute('onclick') || '') === 'saveEditFood()').click(); await new Promise(r => setTimeout(r, 150));
        return out; }, [a.ligne.id, val]);
      note(id, 'Modifier une ligne de 250 g, champ grammes remplacé par « ' + val + ' » → refus ou ligne inchangée', { kcal: a.ligne.kcal, q: 250 }, r, r.kcal === a.ligne.kcal && r.q === 250);
    }
    await pg.evaluate(id => removeFoodEntry(id), a.ligne.id);
  }

  /* J5 — Open Food Facts (réponse FIGÉE) : produit en kJ seulement → kcal/100 g = kJ ÷ 4,184 */
  const c5 = await taperChoisir('barre test', '_afSuggPrendreOff', 1, true);
  if (c5.ok) { await quantite(40); }
  const a5 = c5.ok ? await ajouter() : { ajoutees: 0 };
  note('J5', 'OFF (figé) énergie en kJ seulement : 1674 kJ → 400 kcal/100 g ; 40 g → 160 kcal', { kcal100: 400, kcal40g: 160 },
    { choix: c5.titre, per100: c5.per100, ligne: a5.ligne && { kcal: a5.ligne.kcal, q: a5.ligne.q } }, c5.ok && a5.ligne && Math.abs(a5.ligne.kcal - 160) <= 1, { lignes_proposees: c5.lignes });

  /* J6 — code-barres (fiche FIGÉE) : énergie en kJ seulement, puis valeurs « par portion » seulement */
  const scan = ean => pg.evaluate(async ean => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    openAddFood(); await new Promise(r => setTimeout(r, 150));
    const f = (typeof _lookupBarcode === 'function') ? _lookupBarcode : null; if (!f) return { fonction: false };
    try { await f(ean); } catch (e) { return { erreur: String(e).slice(0, 120) }; }
    await new Promise(r => setTimeout(r, 300));
    return { fonction: true, per100: _bcNutr ? { kcal: _bcNutr.kcal100, p: _bcNutr.prot100, g: _bcNutr.carbs100, l: _bcNutr.fat100 } : null,
      grams: (document.getElementById('af-bc-grams') || {}).value, form: ['af-desc', 'af-kcal', 'af-prot', 'af-carbs', 'af-fat'].map(i => (document.getElementById(i) || {}).value),
      note: ((document.getElementById('af-note') || document.getElementById('af-bc-note') || {}).innerText || '').slice(0, 160) }; }, ean);
  const s6a = await scan('3000000000017');
  note('J6a', 'scan : énergie en kJ seulement (176 kJ/100 ml) → ~42 kcal/100', { kcal100: 42 }, s6a, !!(s6a.per100 && Math.abs(s6a.per100.kcal - 42) <= 1));
  const s6b = await scan('3000000000024');
  note('J6b', 'scan : valeurs PAR PORTION seulement (120 kcal / 25 g) → jamais présentées comme pour 100 g', { kcal100: 480, ou: 'refus / saisie demandée' }, s6b,
    !(s6b.per100 && Math.abs(s6b.per100.kcal - 120) <= 1));

  /* J7 — un autre jour : la ligne va au jour affiché, pas à aujourd'hui */
  const j7 = await pg.evaluate(async () => { const hier = new Date(Date.now() - 864e5); const iso = hier.toISOString().slice(0, 10);
    if (typeof _journalJour === 'undefined') return { nav: false };
    try { _journalJour = iso; } catch (e) { return { nav: false, err: String(e) }; }
    return { nav: true, iso, actif: _journalJourActif() }; });
  if (j7.nav) {
    await taperChoisir('pomme', '_afSuggPrendreCiqual', 0); await quantite(150); const a7 = await ajouter();
    note('J7', 'journal positionné sur HIER : la ligne ajoutée porte la date d\'hier', j7.iso, a7.ligne && a7.ligne.date, a7.ligne && a7.ligne.date === j7.iso);
    await pg.evaluate(() => { _journalJour = null; });
  }

  /* J8 — suppression d'UNE ligne parmi plusieurs, puis rechargement */
  const avant8 = await pg.evaluate(() => (S.foodLog || []).map(e => e.id));
  await pg.evaluate(id => confirmRemoveFood(id), avant8[0]);
  await pg.waitForTimeout(150);
  await pg.evaluate(() => { const bt = [...document.querySelectorAll('button')].filter(x => /Supprimer/.test(x.innerText) && x.offsetParent); if (bt.length) bt[bt.length - 1].click(); });
  await pg.waitForTimeout(150); await ouvrir();
  const apres8 = await pg.evaluate(() => (S.foodLog || []).map(e => e.id));
  note('J8', 'supprimer UNE ligne : seule elle disparaît, et ça survit au rechargement', { retiree: avant8[0], restantes: avant8.length - 1 }, { restantes: apres8.length, encore: apres8.includes(avant8[0]) },
    apres8.length === avant8.length - 1 && !apres8.includes(avant8[0]));

  /* J9 — totaux du jour = somme des lignes du jour (carte « Où tu en es ») */
  const j9 = await pg.evaluate(() => { const t = today(); const L = (S.foodLog || []).filter(e => e.date === t);
    const s = L.reduce((a, e) => a + (+e.kcal || 0), 0); let affiche = null;
    try { if (typeof _journalTotaux === 'function') affiche = _journalTotaux(t); } catch (e) {}
    return { somme: s, lignes: L.length, affiche }; });
  note('J9', 'somme des kcal du jour (lignes) — relevé', 'information', j9, true);

  fs.writeFileSync(path.join(OUT, 'journal.json'), JSON.stringify(res, null, 1));
  console.log('FIN', res.scenarios.filter(s => !s.ok).length + ' écart(s) / ' + res.scenarios.length, 'erreurs page', res.erreurs.length);
  await b.close(); srv.close();
})().catch(e => { console.error('PLANTAGE ' + (e && e.stack || e)); fs.writeFileSync(path.join(OUT, 'journal.json'), JSON.stringify(res, null, 1)); process.exit(2); });
