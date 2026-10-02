/* ══════════════════════════════════════════════════════════════════════════════════════
   🔎 FOOD SEMANTICS V1 — FS-01 : CONTRAT DÉTERMINISTE + RÉSOLVEUR DE BASE
   (02/10/2026, session-B, demande de Michel) — blocs B-CDXXVIII (source) → B-CDXXX (écran).

   AVANT (mesuré sur master f31dc234, top 1) : « café » → Café, moulu · « thé » → Thé, feuille ·
   « pomme » → Pomme, sèche (ALIAS faux) · « fromage » → Fromage de tête · « omelette » → Omelette
   norvégienne · « crêpe » → Crêpe dentelle · « gaufre » → Gaufrette · « haricots verts » → purée
   (ALIAS faux) · « pomme séchée » → RIEN. Et la liste se rendait DEUX fois si CIQUAL arrivait avant la
   table d'alias (« riz » → Riz blanc, CRU puis CUIT).
   APRÈS : un résolveur (`_fsIntention`, `_fsCle`) — requête générique vs explicite, une forme NOMMÉE
   gagne toujours, clé de tri explicable sans ordre de fichier ; deux alias corrigés par la voie
   prévue (`tools/alias.py`, CORRECTIONS) ; UN rendu quand CIQUAL ET les alias sont là.
   ⛔ Mesuré en rejouant les témoins de recherche du runner : la clé garde l'APPROXIMATION en 2ᵉ (la
   forme tapée bat la forme dépluralisée : « pates » ≠ « Pâté »), n'a PAS de critère « aliment moyen »
   (il passait « Cola, sans précision » devant « Cola, sucré », ft-v1113) et connaît une 5ᵉ forme, la
   PARTIE « Oeuf, blanc (blanc d'oeuf) ». « eau » passe par la table (il tenait à la coupure à 400).
   ⛔ Curry reste « Curry, poudre » : les données ne le séparent pas proprement de cannelle / paprika
   (consigné pour FS-03). Ce témoin le FIGE pour qu'il ne change pas en passant.
   Contrôle négatif : `tools/mut_food_semantics.py`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');

/* Les premiers résultats attendus, MESURÉS sur la branche (jamais choisis). */
const TOP1 = {
  'café': 'Café, instantané, sans sucres ajoutés, prêt à boire',
  'café au lait': 'Café au lait, café crème ou cappuccino, instantané ou non, sans sucres ajoutés, prêt à boire',
  'cappuccino': 'Café au lait, café crème ou cappuccino, instantané ou non, sans sucres ajoutés, prêt à boire',
  'thé': 'Thé infusé, sans sucres ajoutés',
  'pomme': 'Pomme, chair sans peau, crue (aliment moyen)',
  'fromage': 'Fromage (aliment moyen)',
  'omelette': 'Omelette, garnitures diverses : légumes, fromages, viandes... (aliment moyen)',
  'crêpe': 'Crêpe, nature, préemballée, rayon frais',
  'gaufre': 'Gaufre bruxelloise ou liégeoise nature, artisanale',
  'curry': 'Curry, poudre',
  'haricots verts': 'Haricot vert, cuit',
};
const EXPLICITE = {
  'café moulu': 'Café, moulu',
  'café poudre': 'Café, poudre soluble',
  'thé feuilles': 'Thé, feuille',
  'pomme séchée': 'Pomme, sèche',
  'haricots verts purée': 'Haricots verts, purée',
};
const CONTROLES = {
  'spaghetti bolognaise': 'Pâtes à la bolognaise (spaghetti, tagliatelles…), préemballées',
  'carbonara': 'Pâtes à la carbonara (spaghetti, tagliatelles…), préemballées',
  'riz': 'Riz blanc, cuit, sans sel ajouté',
  'poulet': 'Poulet, filet sans peau cru',
  'eau': 'Eau du robinet',
  'coca': 'Cola, sucré',
  'pates': 'Pâtes sèches, standard, cuites, sans sel ajouté',
  'oeuf': 'Oeuf cru',
};

module.exports.source = function (t, ROOT, fs, path) {
  const lire = f => _sansCommentaires(fs.readFileSync(path.join(ROOT, f), 'utf8')).replace(/\s+/g, '');
  const AP = lire('app.js');
  const corps = (src, nom) => { const i = src.indexOf('function' + nom + '('); if (i < 0) return '';
    let d = 0; for (let k = src.indexOf('{', i); k > 0 && k < src.length; k++) {
      if (src[k] === '{') d++; else if (src[k] === '}' && !--d) return src.slice(i, k + 1); }
    return src.slice(i); };
  console.log('\n═══ B-CDXXVIII. FS-01 — le résolveur et le pipeline (source) ═══');
  const une = corps(AP, '_ciqualChercherUne'), inp = corps(AP, '_afSuggInput');
  t('B-CDXXVIII ① un seul classement CIQUAL : `_ciqualChercherUne` lit l\'intention et trie par `_fsCle` / `_fsComparer`, plus de coupure à 400',
    une.includes('constit=_fsIntention(q);') && une.includes('out.push({k:_fsCle(a,it,r),a:a});')
    && une.includes('out.sort((x,y)=>_fsComparer(x.k,y.k));') && !/out\.length>400/.test(une)
    && (AP.match(/function_fsCle\(/g) || []).length === 1, 'classement modifié ou dupliqué');
  t('B-CDXXVIII ② la clé est explicable et finit par le nom puis le code (jamais l\'ordre du fichier)',
    corps(AP, '_fsCle').includes('return[r[0],forme,r[1],entier,teteExacte,teteSing,n.length,n,a[0]];'), 'clé modifiée');
  t('B-CDXXVIII ③ CIQUAL et alias : UN rendu, quand les deux sont chargés (plus de re-classement sous le doigt)',
    inp.includes('Promise.all([_ciqualCharger(),_aliasCharger()]).then(') && !inp.includes('_aliasCharger().then(')
    && (inp.match(/_afSuggCiq=_ciqualChercher\(q,6\);/g) || []).length === 1, 'deux rendus');
  const AL = fs.readFileSync(path.join(ROOT, 'tools', 'alias.py'), 'utf8');
  const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'alias.json'), 'utf8')).a;
  t('B-CDXXVIII ④ deux alias faux corrigés par la voie prévue (CORRECTIONS, raison écrite) : pomme → 13396, haricots verts → 20030',
    /'pomme':\s*\(13396,/.test(AL) && /'haricots verts':\s*\(20030,/.test(AL)
    && J['pomme'] === 13396 && J['pommes'] === 13396 && J['haricots verts'] === 20030 && J['haricot vert'] === 20030, 'alias non corrigés');
  t('B-CDXXVIII ⑤ « eau » ajouté dans le générateur (AJOUTS, raison écrite) → 18066 « Eau du robinet », le résultat de master',
    /'eau':\s*\(18066,/.test(AL) && J['eau'] === 18066, 'alias eau absent');
};

async function _page(b, PORT, route) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => rt.abort());
  if (route) await route(cx);
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_fs01'))return; sessionStorage.setItem('_fs01','1');
    localStorage.clear(); localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99'); }catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1800);
  return { cx, pg, errs };
}

module.exports.ecran = async function (t, b, PORT) {
  const { cx, pg, errs } = await _page(b, PORT);
  console.log('\n-- B-CDXXIX. FS-01 — le résolveur conduit (vraie base CIQUAL + vraie table d\'alias) --');
  const R = await pg.evaluate(async ({ TOP1, EXPLICITE, CONTROLES }) => {
    await _ciqualCharger(); await _aliasCharger();
    const noms = (q, n) => _ciqualChercher(q, n || 6).map(a => a[1]);
    const o = { top: {}, sansAlias: {}, it: {} };
    for (const q of Object.keys(TOP1).concat(Object.keys(EXPLICITE), Object.keys(CONTROLES), ['lait poudre', 'haricot', 'sauce', 'riz sec', 'poulet cru']))
      o.top[q] = noms(q);
    for (const q of ['pomme', 'haricots verts', 'café', 'thé', 'oeuf', 'pates', 'cola']) o.sansAlias[q] = _ciqualChercherSansAlias(q, 6).map(a => a[1]);
    for (const q of ['oeuf blanc', 'jaune d oeuf']) o.top[q] = noms(q);
    o.it['oeuf blanc'] = _fsIntention('oeuf blanc');
    for (const q of ['café', 'café moulu', 'pomme séchée', 'thé feuilles', 'haricots verts purée']) o.it[q] = _fsIntention(q);
    /* ⭐ DÉTERMINISME : mêmes requêtes, 3 fois, puis sur la base MÉLANGÉE (3 permutations fixées + inverse).
       Le corpus prend les 1ᵉʳ et 2 premiers mots de tous les noms CIQUAL (≈ 2 500 requêtes). */
    const Q = new Set(Object.keys(TOP1).concat(Object.keys(EXPLICITE), Object.keys(CONTROLES)));
    for (const a of _ciqual.a) { const m = _afMots(String(a[1]).split(',')[0]); if (m[0]) Q.add(m[0]); if (m[1]) Q.add(m[0] + ' ' + m[1]); }
    const corpus = [...Q].sort();
    const photo = () => corpus.map(q => _ciqualChercher(q, 6).map(a => a[0]).join(',')).join('|');
    const ref = photo(), rep = [photo(), photo()].every(x => x === ref);
    const orig = _ciqual.a.slice(); let graine = 7;
    const hasard = () => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine / 2147483648; };
    const perm = [];
    for (let k = 0; k < 3; k++) { const c = orig.slice(); for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(hasard() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
      _ciqual.a = c; perm.push(photo() === ref); }
    _ciqual.a = orig.slice().reverse(); perm.push(photo() === ref);
    _ciqual.a = orig;
    o.det = { n: corpus.length, repete: rep, permutations: perm };
    return o;
  }, { TOP1, EXPLICITE, CONTROLES });
  const det = o => JSON.stringify(o);
  const premier = q => (R.top[q] || [])[0];
  const rang = (q, re) => (R.top[q] || []).findIndex(x => re.test(x));
  for (const q of Object.keys(TOP1))
    t('B-CDXXIX générique « ' + q + ' » → ' + TOP1[q], premier(q) === TOP1[q], det(R.top[q]));
  t('B-CDXXIX « café » : toute forme poudre / moulu passe APRÈS les boissons prêtes à boire',
    (rang('café', /moulu|poudre/) < 0 || rang('café', /moulu|poudre/) > rang('café', /prêt à boire/)) && rang('café', /prêt à boire/) === 0
    && (R.sansAlias['café'] || []).length > 0, det(R.top['café']));
  t('B-CDXXIX « thé » : « Thé, feuille » reste dans la liste, mais après l\'infusion', rang('thé', /^Thé, feuille$/) > 0, det(R.top['thé']));
  t('B-CDXXIX « gaufre » : aucune gaufrette avant une gaufre (mot entier)',
    rang('gaufre', /^Gaufrette/) < 0 || rang('gaufre', /^Gaufrette/) > rang('gaufre', /^Gaufre /), det(R.top['gaufre']));
  t('B-CDXXIX classement SANS alias : « pomme » → une pomme CRUE (l\'aliment moyen est le choix de la table, pas du tri), « haricots verts » → le légume, jamais la purée ni la forme séchée en tête',
    /^Pomme, chair .*crue/.test(R.sansAlias['pomme'][0]) && !/sèche|purée/.test(R.sansAlias['pomme'][0]) && !/purée/.test(R.sansAlias['haricots verts'][0])
    && /^Haricot vert/.test(R.sansAlias['haricots verts'][0]) && R.sansAlias['café'][0] === TOP1['café'] && R.sansAlias['thé'][0] === TOP1['thé'], det(R.sansAlias));
  t('B-CDXXIX SANS alias : la forme tapée bat la forme dépluralisée (« pates » → des pâtes, jamais « Pâté » dans les 3 premiers) ; « oeuf » → « Oeuf cru », aucune PARTIE (blanc/jaune) devant un œuf entier ; « cola » → « Cola, sucré »',
    /^Pâtes/.test(R.sansAlias['pates'][0]) && !R.sansAlias['pates'].slice(0, 3).some(x => /^Pâté/.test(x))
    && R.sansAlias['oeuf'][0] === 'Oeuf cru' && R.sansAlias['oeuf'].slice(0, 3).every(x => !/blanc d'oeuf|jaune d'oeuf/.test(x))
    && R.sansAlias['cola'][0] === 'Cola, sucré', det({ p: R.sansAlias['pates'].slice(0, 3), o: R.sansAlias['oeuf'].slice(0, 3), c: R.sansAlias['cola'][0] }));
  t('B-CDXXIX EXPLICITE « oeuf blanc » / « jaune d\'oeuf » → la partie nommée en tête (forme « partie »)',
    /^Oeuf, blanc/.test(premier('oeuf blanc') || '') && /^Oeuf, jaune/.test(premier('jaune d oeuf') || '')
    && det(R.it['oeuf blanc'].formes) === '["partie"]', det({ b: R.top['oeuf blanc'].slice(0, 2), j: R.top['jaune d oeuf'].slice(0, 2) }));
  for (const q of Object.keys(EXPLICITE))
    t('B-CDXXIX EXPLICITE « ' + q + ' » → ' + EXPLICITE[q] + ' (la forme nommée gagne)', premier(q) === EXPLICITE[q], det(R.top[q]));
  t('B-CDXXIX EXPLICITE « riz sec » / « poulet cru » : jamais forcés vers le CUIT (la préférence cuit est celle de la table, pas du tri)',
    !/cuit/i.test(premier('riz sec') || 'cuit') && /\bcru\b/.test(premier('poulet cru') || '') && !/cuit/i.test(premier('poulet cru') || ''),
    det({ r: (R.top['riz sec'] || []).slice(0, 2), p: (R.top['poulet cru'] || []).slice(0, 2) }));
  t('B-CDXXIX EXPLICITE « lait poudre » → Lait en poudre (une forme nommée se reconnaît aussi dans le 1ᵉʳ segment)',
    /^Lait en poudre/.test(premier('lait poudre') || ''), det(R.top['lait poudre']));
  t('B-CDXXIX intention : « café » générique ; « café moulu » poudre ; « pomme séchée » séché (cherche « sec ») ; « thé feuilles » feuille ; « haricots verts purée » purée',
    R.it['café'].generique === true && R.it['café'].formes.length === 0
    && det(R.it['café moulu'].formes) === '["poudre"]' && R.it['café moulu'].generique === false
    && det(R.it['pomme séchée'].formes) === '["seche"]' && R.it['pomme séchée'].mots.join(' ') === 'pomme sec'
    && det(R.it['thé feuilles'].formes) === '["feuille"]' && det(R.it['haricots verts purée'].formes) === '["puree"]'
    && typeof R.it['café'].version === 'number' && R.it['café'].version >= 1, det(R.it));   // la version elle-même est figée par B-CDXXXII (FS-02)
  for (const q of Object.keys(CONTROLES))
    t('B-CDXXIX non-régression « ' + q + ' » → ' + CONTROLES[q], premier(q) === CONTROLES[q], det(R.top[q]));
  t('B-CDXXIX DÉTERMINISME (' + R.det.n + ' requêtes) : même résultat 3 fois de suite, et sur la base mélangée (3 permutations + inverse)',
    R.det.n > 2000 && R.det.repete && R.det.permutations.every(x => x === true), det(R.det));
  t('B-CDXXIX aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};

/* ══ B-CDXXX — CE QUE LA PERSONNE VOIT : le PREMIER affichage est le bon, quel que soit l'ordre d'arrivée ══ */
module.exports.ecranVue = async function (t, b, PORT) {
  console.log('\n-- B-CDXXX. FS-01 — le premier affichage (vraie frappe, vraie liste, alias en retard ou absents) --');
  const frappe = async (route, q) => {
    const { cx, pg, errs } = await _page(b, PORT, route);
    const out = await pg.evaluate(async (q) => {
      openAddFood(); await new Promise(r => setTimeout(r, 300));
      const el = document.getElementById('af-sugg'), rendus = [];
      const obs = new MutationObserver(() => { if (_afSuggCiq && _afSuggCiq.length) rendus.push(_afSuggCiq.map(a => a[1])); });
      obs.observe(el, { childList: true, subtree: true });
      const inp = document.getElementById('af-desc'); inp.value = q; inp.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 3500));
      obs.disconnect();
      const liste = [...el.querySelectorAll('button')].map(x => (x.querySelector('span span') || {}).textContent || '');
      return { rendus, liste };
    }, q);
    await cx.close();
    return Object.assign(out, { errs });
  };
  const retarder = (motif, ms) => async (cx) => cx.route(motif, async rt => { await new Promise(r => setTimeout(r, ms)); await rt.continue(); });
  const det = o => JSON.stringify(o);
  const premiers = r => [...new Set(r.rendus.map(x => x[0]))];
  const a = await frappe(retarder(/data\/alias\.json/, 1500), 'riz');
  t('B-CDXXX alias ARRIVÉS APRÈS CIQUAL (1,5 s) : « riz » — le 1ᵉʳ affichage est déjà « Riz blanc, cuit », jamais « cru » puis « cuit »',
    a.rendus.length >= 1 && premiers(a).length === 1 && premiers(a)[0] === 'Riz blanc, cuit, sans sel ajouté' && a.errs.length === 0, det(a.rendus.map(x => x[0])));
  const c = await frappe(retarder(/data\/ciqual\.json/, 1500), 'riz');
  t('B-CDXXX CIQUAL arrivé APRÈS les alias : même 1ᵉʳ affichage', premiers(c).length === 1 && premiers(c)[0] === 'Riz blanc, cuit, sans sel ajouté', det(c.rendus.map(x => x[0])));
  const n = await frappe(null, 'café');
  t('B-CDXXX chargement normal : « café » → la boisson dès le 1ᵉʳ affichage, à l\'écran',
    premiers(n).length === 1 && premiers(n)[0] === TOP1['café'] && n.liste.some(x => x === TOP1['café']), det({ r: n.rendus.map(x => x[0]), l: n.liste.slice(0, 3) }));
  const h = await frappe(async (cx) => cx.route(/data\/alias\.json/, rt => rt.abort()), 'café');
  t('B-CDXXX alias INJOIGNABLES (hors ligne) : la liste sort quand même, une fois, sans erreur (non bloquant)',
    h.rendus.length >= 1 && premiers(h)[0] === TOP1['café'] && h.errs.length === 0, det(h.rendus.map(x => x[0])));
};
