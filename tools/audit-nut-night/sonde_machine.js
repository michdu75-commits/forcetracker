#!/usr/bin/env node
/* AUDIT NUTRITION DE NUIT (12/10/2026) — SONDE MACHINE. OUTIL D'AUDIT, HORS RUNTIME : ce fichier n'est chargé par aucune
   page de l'application ; il sert le dépôt en lecture, ouvre l'app dans Chromium et appelle les VRAIES fonctions de
   recherche (`_ciqualChercher`, `_marquesChercher`, `_afSuggLocales`, `_complChercher`) — celles que `_afSuggInput` appelle
   à la frappe. Il ne réimplémente pas le moteur. Les ORACLES (ce qui est compatible / contraire) sont écrits ici,
   indépendamment du moteur, sur le texte des noms CIQUAL.
   « en ligne » = table d'alias chargée ; « hors ligne » = table d'alias absente (`_alias = null`), comme les bancs FS.
   Usage : node tools/audit-nut-night/sonde_machine.js <dossier de sortie> [racine servie] */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const OUT = process.argv[2] || '.';
const ROOT = process.argv[3] || path.resolve(__dirname, '..', '..');
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.woff2':'font/woff2','.wasm':'application/wasm','.svg':'image/svg+xml','.webp':'image/webp'};
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });

/* ── Listes curées (ce qu'un utilisateur normal tape) ─────────────────────────────────────────────────────────── */
const MOTS_SEULS = ['eau','lait','riz','pain','oeuf','œuf','oeufs','thé','the','sel','ail','pois','poire','porc','thon','kiwi','orange','pomme','noix','coco',
  'cola','coca','café','cafe','vin','bière','biere','jus','miel','sucre','beurre','crème','creme','yaourt','yogourt','fromage','poulet','boeuf','bœuf','veau',
  'agneau','dinde','jambon','saumon','cabillaud','crevette','crevettes','moule','huître','avocat','banane','fraise','fraises','raisin','melon','pastèque','cerise',
  'abricot','pêche','peche','prune','figue','datte','mangue','ananas','citron','tomate','carotte','courgette','aubergine','poivron','oignon','salade','laitue',
  'épinard','epinards','brocoli','chou','haricot','lentille','lentilles','pâtes','pates','spaghetti','quinoa','semoule','boulgour','avoine','flocons','céréales',
  'muesli','granola','biscuit','gâteau','gateau','chocolat','bonbon','glace','pizza','burger','hamburger','frites','chips','soupe','sandwich','quiche','tarte',
  'crêpe','crepe','gaufre','croissant','brioche','baguette','olive','huile','vinaigre','mayonnaise','ketchup','moutarde','sauce','lardons','saucisse',
  'merguez','steak','escalope','côtelette','rôti','canard','lapin','sardine','maquereau','truite','colin','merlu','surimi','tofu','soja','amande','amandes',
  'noisette','cacahuète','pistache','graines','muscle','whey','protéine','proteine','compote','confiture','nutella','pâte','gruyère','emmental','camembert',
  'comté','mozzarella','feta','ricotta','parmesan','chèvre','skyr','kéfir','kefir','smoothie','soda','limonade','sirop','tisane','cappuccino','latte','bacon',
  'saucisson','pâté','rillettes','foie','oeuf dur','omelette','galette','wrap','tortilla','nems','sushi','kebab','tacos','couscous','paella','lasagne','raviolis',
  'gnocchi','risotto','purée','puree','patate','pomme de terre','frite','épeautre','maïs','mais','petit pois','pois chiche','houmous','guacamole','popcorn','barre',
  'cookie','muffin','donut','madeleine','financier','éclair','flan','mousse','yaourt grec','fromage blanc','petit suisse','lait de coco','lait d\'amande'];

const PAIRES = [ // [A, B] doivent donner le même 1er résultat (normalisation)
  ['œuf','oeuf'],['bœuf haché','boeuf hache'],['crème fraîche','creme fraiche'],['pâtes','pates'],['thé vert','the vert'],['jus d\'orange','jus d orange'],
  ['jus d\'orange','jus dorange'],['jus d’orange','jus d\'orange'],['lait demi-écrémé','lait demi écrémé'],['lait demi-écrémé','lait demiecreme'],
  ['Riz Blanc Cuit','riz blanc cuit'],['riz  cuit','riz cuit'],['riz cuit','cuit riz'],['pomme de terre','pommes de terre'],['haricot vert','haricots verts'],
  ['oeuf','oeufs'],['lentille','lentilles'],['fraise','fraises'],['épinard','épinards'],['petit pois','petits pois'],['steak haché','steaks hachés'],
  ['yaourt nature','yaourts nature'],['poulet rôti','poulet roti'],['saumon fumé','saumon fume'],['pain complet','pain complet.'],['pâte à tartiner','pate a tartiner'],
  ['huile d\'olive','huile olive'],['huile d\'olive','l\'huile d\'olive'],['blanc de poulet','poulet blanc'],['filet de saumon','saumon filet'],
  ['coca zéro','coca zero'],['coca zéro','coca 0'],['lait 0%','lait 0 %'],['fromage blanc 0%','fromage blanc 0 %'],['lait 1,2%','lait 1.2%'],
  ['muesli','müesli'],['crêpe','crepe'],['chou-fleur','chou fleur'],['chou-fleur','choufleur'],['pomme-de-terre','pomme de terre'],['cacahuète','cacahuete'],
  ['cacahuète','cacahouète'],['yaourt','yoghourt'],['yaourt','yogourt'],['ketchup','ketchups'],['spaghetti','spaghettis'],['café','cafe'],['maïs','mais'],
  ['steak haché 5%','steak hache 5 %'],['jambon blanc','jambon cuit'],['oeuf dur','oeufs durs'],['pois chiche','pois chiches']];

const UNITES = ['riz 100g','riz 100 g','lait 1L','lait 250ml','eau 50cl','2 oeufs','200g de poulet','poulet 200g','pâtes 80g','un yaourt','1 banane','une pomme',
  '3 tranches de jambon','1 verre de lait','une canette de coca','30g de whey','banane x2','café 1 tasse','pain 1 tranche','riz cuit 150 g'];
const FAUTES = ['yaourht','chocolta','spagetti','brocolli','cacahouette','aubergines','courgete','poullet','saumonn','fromge','bananne','tomatte','yahourt',
  'mozarella','parmesant','croisant','brioches','omlette','lazagne','gnochi'];

/* Oracles de variantes (texte NORMALISÉ par notre propre fonction, pas celle du moteur) */
const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/œ/g,'oe').replace(/['’`]/g,' ').replace(/[,;:()\[\]«»"]+/g,' ').replace(/\s+/g,' ').trim();
const DIMS = {
  forme:   [['cru', /\bcru(e|s|es)?\b/], ['cuit', /\bcuit(e|s|es)?\b/], ['sec', /\b(sec|secs|seche|seches)\b/]],
  laitage: [['entier', /\bentier\b/], ['demi', /\bdemi[- ]?ecreme\b/], ['ecreme', /(^|[^-i])\becreme\b/]],
  sucre:   [['sucre', /(^|[^s] )\bsucre(e|s|es)?\b(?! ajout)/], ['sans_sucre', /\b(sans sucres? ajoutes?|non sucre(e|s)?|sans sucre)\b/]],
  gout:    [['nature', /\bnature\b/], ['aromatise', /\b(aromatise(e|s)?|aux fruits|parfum|au chocolat|a la vanille|vanille|fruits rouges)\b/]],
  conserv: [['uht', /\buht\b/], ['pasteurise', /\bpasteurise(e)?\b/], ['frais', /\brayon frais\b/]],
  texture: [['epais', /\bepaisse?\b/], ['fluide', /\bfluide\b/]],
};
const CONTRAIRES = { cru:['cuit'], cuit:['cru','sec'], sec:['cuit'], entier:['demi','ecreme'], demi:['entier','ecreme'], ecreme:['entier','demi'],
  sucre:['sans_sucre'], sans_sucre:['sucre'], nature:['aromatise'], aromatise:['nature'], uht:['pasteurise','frais'], pasteurise:['uht'], frais:['uht'],
  epais:['fluide'], fluide:['epais'] };
const LABEL = { cru:'cru', cuit:'cuit', sec:'sec', entier:'entier', demi:'demi-écrémé', ecreme:'écrémé', sucre:'sucré', sans_sucre:'sans sucre',
  nature:'nature', aromatise:'aromatisé', uht:'UHT', pasteurise:'pasteurisé', frais:'frais', epais:'épais', fluide:'fluide' };
const valeurs = n => { const v = {}; for (const d in DIMS) for (const [k, re] of DIMS[d]) if (re.test(n)) (v[d] = v[d] || []).push(k); return v; };
const taux = n => { const out = []; const re = /(\d+(?:[.,]\d+)?) ?(?:(?:-|a) ?(\d+(?:[.,]\d+)?) ?)?%/g; let m;
  while ((m = re.exec(n))) out.push([+m[1].replace(',', '.'), +(m[2] || m[1]).replace(',', '.')]); return out; };

(async () => {
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const cx = await b.newContext({ serviceWorkers: 'block' });
  const reseau = [];
  await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => { reseau.push(rt.request().url().slice(0, 80)); return rt.abort(); });
  const pg = await cx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await pg.addInitScript(`try{localStorage.setItem('ft4_ob2','1');localStorage.setItem('ft4_guide_shown','1');localStorage.setItem('ft4_wn_seen','99');}catch(e){}`);
  await pg.goto('http://localhost:' + srv.address().port + '/index.html'); await pg.waitForTimeout(1500);
  await pg.evaluate(async () => { await Promise.all([_ciqualCharger(), _aliasCharger(), _marquesCharger(), _complCharger()]); });
  const T0 = Date.now();

  /* helpers dans la page */
  await pg.evaluate(() => {
    window.__top = (q, enLigne, max) => { const s = _alias; if (!enLigne) _alias = null;
      try { return _ciqualChercher(q, max || 6).map(a => [a[0], a[1], a[3]]); } finally { _alias = s; } };
    window.__ff = q => _marquesChercher(q, 4).map(i => { const a = _marques.a[i]; return [a[0], a[1]]; });
  });

  /* ── B1. ACCESSIBILITÉ : chaque aliment CIQUAL proposable, par son nom entier, par sa tête, par les premiers mots ── */
  const b1 = await pg.evaluate(() => {
    const res = [], items = _ciqual.a.filter(a => a[3] != null);
    const exclus = _ciqual.a.filter(a => a[3] == null).map(a => [a[0], a[1]]);
    for (const a of items) {
      const nom = a[1], tete = nom.split(',')[0].trim();
      const mots = _afNorm(nom).split(' ').filter(m => m.length > 1);
      const rang = (q, en) => window.__top(q, en, 6).findIndex(x => x[0] === a[0]);
      const plein = rang(nom, false), pleinEn = rang(nom, true);
      let k = 0;
      for (let i = 1; i <= mots.length; i++) { if (rang(mots.slice(0, i).join(' '), false) >= 0) { k = i; break; } }
      res.push({ c: a[0], n: nom, plein, pleinEn, tete, rTete: rang(tete, false), rTeteEn: rang(tete, true), kMots: k, nMots: mots.length });
    }
    return { res, exclus };
  });
  fs.writeFileSync(path.join(OUT, 'b1_accessibilite.json'), JSON.stringify(b1));
  console.log('B1 ok', b1.res.length, ((Date.now() - T0) / 1000).toFixed(0) + 's');

  /* ── B2. TÊTES : chaque tête de nom CIQUAL tapée seule — pertinence et faux amis ── */
  const tetes = [...new Set(b1.res.map(x => x.tete.toLowerCase()))];
  const b2 = await pg.evaluate(tetes => tetes.map(t => ({ q: t, en: window.__top(t, true, 6), hors: window.__top(t, false, 6), mots: _afMots(t) })), tetes);
  fs.writeFileSync(path.join(OUT, 'b2_tetes.json'), JSON.stringify(b2));
  console.log('B2 ok', b2.length);

  /* ── B3. VARIANTES : tête + qualificatif présent dans le nom (cru/cuit, laitage, sucre, goût, conservation, texture, taux) ── */
  const qv = new Map();
  for (const x of b1.res) {
    const n = norm(x.n), v = valeurs(n), tn = norm(x.tete);
    for (const d in v) for (const k of v[d]) {
      const q = (DIMS[d].find(z => z[0] === k)[1].test(tn) ? x.tete : x.tete + ' ' + LABEL[k]).toLowerCase();
      if (!qv.has(q)) qv.set(q, { q, dim: d, val: k, src: [] }); qv.get(q).src.push(x.c);
    }
    for (const [lo, hi] of taux(n)) {
      if (/%/.test(tn)) continue;
      for (const val of (lo === hi ? [lo] : [lo, hi])) {
        const q = (x.tete + ' ' + String(val).replace('.', ',') + '%').toLowerCase();
        if (!qv.has(q)) qv.set(q, { q, dim: 'taux', val, src: [] }); qv.get(q).src.push(x.c);
      }
    }
  }
  const b3q = [...qv.values()];
  const b3 = await pg.evaluate(L => L.map(o => Object.assign(o, { en: window.__top(o.q, true, 6), hors: window.__top(o.q, false, 6) })), b3q);
  fs.writeFileSync(path.join(OUT, 'b3_variantes.json'), JSON.stringify(b3));
  console.log('B3 ok', b3.length);

  /* ── B4. ADVERSARIAL : mots seuls, paires de normalisation, unités dans la requête, fautes ── */
  const adv = [...new Set([...MOTS_SEULS, ...PAIRES.flat(), ...UNITES, ...FAUTES])];
  const b4 = await pg.evaluate(L => L.map(q => ({ q, en: window.__top(q, true, 6), hors: window.__top(q, false, 6), ff: window.__ff(q), mots: _afMots(q),
    syn: (typeof _foodSynonymes === 'function') ? _foodSynonymes(q) : null, alias: !!_aliasCible(q) })), adv);
  fs.writeFileSync(path.join(OUT, 'b4_adversarial.json'), JSON.stringify({ b4, PAIRES, UNITES, FAUTES, MOTS_SEULS }));
  console.log('B4 ok', b4.length);

  /* ── B5. TABLE D'ALIAS : chaque clé → sa cible ; cible proposable ? qualificatifs de la clé respectés ? ── */
  const b5 = await pg.evaluate(() => { const out = [];
    for (const k in _alias.a) { const c = _alias.a[k]; const a = _ciqual.a.find(x => x[0] === c);
      out.push({ k, c, cible: a ? a[1] : null, kcal: a ? a[3] : null, existe: !!a, proposable: !!(a && a[3] != null),
        horsTop: window.__top(k, false, 6).map(x => x[0]).indexOf(c) }); }
    return out; });
  fs.writeFileSync(path.join(OUT, 'b5_alias.json'), JSON.stringify(b5));
  console.log('B5 ok', b5.length);

  /* ── B6. AUTRES SOURCES : fast-food (chaque produit retrouvé par son nom), compléments (coupure à 400), journal ── */
  const b6 = await pg.evaluate(() => {
    const ff = _marques.a.map((a, i) => { const r = _marquesChercher(a[1], 4); return { i, ens: a[0], nom: a[1], rang: r.indexOf(i), kcal: a[3], p: a[4], g: a[5], l: a[6], portion: a[7], derive: a[8], doute: a[9] }; });
    const qs = ['magnesium','vitamine d','omega 3','collagene','creatine','whey','fer','zinc','spiruline','melatonine','probiotique','vitamine c','proteine','bcaa','glutamine'];
    const compl = qs.map(q => { const mots = _afMots(q); let tot = 0; const tous = [];
      for (const a of _compl.a) { const n = _afNorm(a[0] + ' ' + (a[1] || '')); const r = _afRang(mots, n); if (r) { tot++; tous.push([r[0], r[1], a[0].length, a[0], a[1]]); } }
      tous.sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]);
      return { q, total: tot, affiches: _complChercher(q, 6).map(a => a[0] + ' · ' + (a[1] || '')), sansCoupure: tous.slice(0, 6).map(x => x[3] + ' · ' + (x[4] || '')) }; });
    return { ff, compl };
  });
  fs.writeFileSync(path.join(OUT, 'b6_sources.json'), JSON.stringify(b6));
  console.log('B6 ok');

  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ duree_s: Math.round((Date.now() - T0) / 1000), erreurs_page: errs, requetes_reseau_bloquees: reseau.length,
    n_ciqual: await pg.evaluate(() => _ciqual.a.length), n_alias: await pg.evaluate(() => Object.keys(_alias.a).length),
    n_marques: await pg.evaluate(() => _marques.a.length), n_compl: await pg.evaluate(() => _compl.a.length) }, null, 1));
  console.log('FIN', ((Date.now() - T0) / 1000).toFixed(0) + 's', 'erreurs page', errs.length);
  await b.close(); srv.close();
})().catch(e => { console.error('PLANTAGE ' + (e && e.stack || e)); process.exit(2); });
