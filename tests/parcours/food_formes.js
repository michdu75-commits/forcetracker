/* ══════════════════════════════════════════════════════════════════════════════════════
   🧩 FOOD SEMANTICS V1 — FS-02 : TAXONOMIE DÉTERMINISTE DES FORMES ALIMENTAIRES
   (02/10/2026, session-B, demande de Michel) — blocs B-CDXXXI (source) · B-CDXXXII (vraie base).

   FS-02 répond à « quelle forme décrit ce candidat ? » — PAS à « quelle forme préférer ? » (FS-03).
   UNE table (`_FS_FORMES`, 12 formes), UNE fonction (`_fsFormesDuTexte`), lues par la requête ET par
   les candidats. Les comptes ci-dessous sont MESURÉS sur la vraie base et figés : si `data/ciqual.json`
   change, ils doivent être remesurés ET reportés dans `docs/FOOD-SEMANTICS.md` §9 (les deux ensemble).
   ⛔ Aucune équivalence entre formes (« riz sec » ≠ « Riz blanc, cru ») : les ambiguïtés sont FIGÉES ici
   pour qu'elles ne soient pas « réglées » en passant.
   Contrôle négatif : `tools/mut_food_formes.py`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');

/* Libellé CIQUAL RÉEL → formes attendues (exactes, dans l'ordre de la table). */
const CORPUS = [
  ['cru', 'Poulet, viande crue', ['cru']],
  ['cru', 'Pomme, chair et peau, crue', ['cru']],
  ['cru', 'Haricot vert, cru', ['cru']],
  ['cuit', 'Riz blanc, cuit, sans sel ajouté', ['cuit']],
  ['cuit', 'Haricot vert, cuit', ['cuit']],
  ['cuit', 'Pomme, chair sans peau, rôtie/cuite au four', ['cuit']],
  ['cuit', 'Champignon de Paris ou champignon de couche, sauté/poêlé, sans matière grasse', ['cuit']],
  ['seche', 'Pomme, sèche', ['seche']],
  ['seche', 'Abricot, dénoyauté, sec', ['seche']],
  ['seche', 'Lentille, sèche (aliment moyen)', ['seche']],
  ['poudre', 'Café, moulu', ['poudre']],
  ['poudre', 'Café, poudre soluble', ['poudre']],
  ['poudre', 'Lait en poudre, entier', ['poudre']],
  ['poudre', 'Curry, poudre', ['poudre']],
  ['poudre', 'Oeuf, en poudre', ['poudre']],
  ['feuille', 'Thé, feuille', ['feuille']],
  ['boisson', 'Café, instantané, sans sucres ajoutés, prêt à boire', ['boisson']],
  ['boisson', 'Thé infusé, sans sucres ajoutés', ['boisson']],
  ['boisson', 'Café au lait, café crème ou cappuccino, instantané ou non, sans sucres ajoutés, prêt à boire', ['boisson']],
  ['puree', 'Haricots verts, purée', ['puree']],
  ['puree', 'Tomate, purée, appertisée', ['puree', 'conserve']],
  ['puree', 'Courgette, purée', ['puree']],
  ['sauce', 'Sauce au curry, chaude, préemballée', ['sauce', 'prepare']],
  ['sauce', 'Sauce carbonara, préemballée', ['sauce', 'prepare']],
  ['prepare', 'Pâtes à la bolognaise (spaghetti, tagliatelles…), préemballées', ['prepare']],
  ['prepare', 'Poulet basquaise, préemballé', ['prepare']],
  ['prepare', 'Poulet au curry et au lait de coco, préemballé', ['prepare']],
  ['partie', "Oeuf, blanc (blanc d'oeuf), cru", ['cru', 'partie']],
  ['partie', "Oeuf, jaune (jaune d'oeuf), cuit", ['cuit', 'partie']],
  ['surgele', 'Haricot vert, surgelé, cru', ['cru', 'surgele']],
  ['surgele', 'Haricot vert, surgelé, cuit', ['cuit', 'surgele']],
  ['conserve', 'Haricot vert, appertisé, égoutté', ['conserve']],
];
/* Les PIÈGES mesurés : un mot de forme qui n'en est pas une (sous-chaîne, négation, nom de plat). */
const PIEGES = [
  ['« sans feuille » n\'est pas une feuille', 'Bette ou blette, côte (sans feuille), crue', ['cru']],
  ['« grille-pain » n\'est pas « grillé »', 'Pain blanc, passé au grille-pain', []],
  ['« Haricot plat » n\'est pas un plat préparé', 'Haricot plat, cru', ['cru']],
  ['« Riz blanc » n\'est pas une partie (pas d\'œuf)', 'Riz blanc, cru', ['cru']],
  ['« Fromage blanc » n\'est pas une partie', 'Fromage blanc, nature, 0% MG', []],
  ['« jaune » d\'un poivron n\'est pas une partie', 'Poivron, vert, jaune ou rouge, cru', ['cru']],
  ['un plat EN sauce n\'est pas une sauce', 'Ravioli au boeuf, sauce tomate, appertisé', ['conserve']],
  ['« Poêlée » de légumes est un plat, pas une cuisson', 'Poêlée de légumes assaisonnés sans champignon, surgelée, crue', ['cru', 'surgele']],
  ['« rôti » est un morceau', 'Porc, rôti cru', ['cru']],
  ['« Gaufrette » ne contient pas de forme', 'Gaufrette, fourrée vanille', []],
  ['« déshydratée reconstituée » : ni sèche ni boisson', 'Soupe à la tomate, déshydratée reconstituée', []],
];
/* Mesuré sur la vraie base (3 341 aliments proposables) — `docs/FOOD-SEMANTICS.md` §9. */
const COMPTES = { n: 3341, cru: 598, cuit: 526, seche: 164, poudre: 38, feuille: 11, boisson: 106, puree: 34,
                  sauce: 70, prepare: 571, partie: 6, surgele: 67, conserve: 114 };
/* Requête explicite → formes nommées attendues ; le 1ᵉʳ résultat doit les PORTER. */
const EXPLICITES = {
  'café moulu': ['poudre'], 'café poudre': ['poudre'], 'thé feuilles': ['feuille'], 'pomme séchée': ['seche'],
  'haricots verts purée': ['puree'], 'riz cuit': ['cuit'], 'riz cru': ['cru'], 'poulet cru': ['cru'],
  'haricots verts surgelés cuits': ['cuit', 'surgele'], 'lait en poudre': ['poudre'], 'sauce curry': ['sauce'],
};

module.exports.source = function (t, ROOT, fs, path) {
  const AP = _sansCommentaires(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8')).replace(/\s+/g, '');
  const corps = (nom) => { const i = AP.indexOf('function' + nom + '('); if (i < 0) return '';
    let d = 0; for (let k = AP.indexOf('{', i); k > 0 && k < AP.length; k++) {
      if (AP[k] === '{') d++; else if (AP[k] === '}' && !--d) return AP.slice(i, k + 1); }
    return AP.slice(i); };
  console.log('\n═══ B-CDXXXI. FS-02 — une table, une fonction (source) ═══');
  t('B-CDXXXI ① UNE table `_FS_FORMES` et UNE fonction `_fsFormesDuTexte` ; l\'ancienne `_fsFormesDuNom` (FS-01) a disparu',
    (AP.match(/const_FS_FORMES=/g) || []).length === 1 && (AP.match(/function_fsFormesDuTexte\(/g) || []).length === 1
    && !/_fsFormesDuNom/.test(AP), 'deux dictionnaires ou ancienne fonction');
  /* ↪️ FS-03 (02/10) : la préférence par défaut a quitté la clé pour sa propre couche (`_fsPreference`,
     `_fsPromouvoir`) — elle LIT toujours la taxonomie par `_fsFormesDuTexte`, et la table reste DESCRIPTIVE. */
  t('B-CDXXXI ② la requête ET les candidats passent par `_fsFormesDuTexte` (aucune autre lecture de forme)',
    corps('_fsIntention').includes('constformes=_fsFormesDuTexte(q);')
    && corps('_fsCle').includes('_fsFormesDuTexte(a[1])') && corps('_fsPreference').includes('_fsFormesDuTexte(nom,')
    && !/\.nom\.test\(/.test(AP), 'lecture de forme hors de la fonction canonique');
  t('B-CDXXXI ③ la taxonomie reste DESCRIPTIVE : aucune préférence dans `_FS_FORMES` ni dans `_fsFormesDuTexte` (elles vivent dans la couche FS-03)',
    !/prefere|evite|_FS_PREFS|_fsProfil/.test(AP.slice(AP.indexOf('const_FS_FORMES='), AP.indexOf('const_FS_ORDRE=')))
    && !/_FS_EVITE|_FS_PREFS|_fsProfil|_fsPreference/.test(corps('_fsFormesDuTexte')), 'préférence mêlée à la taxonomie');
};

module.exports.ecran = async function (t, b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => rt.abort());
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_fs02'))return; sessionStorage.setItem('_fs02','1');
    localStorage.clear(); localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99'); }catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1800);
  console.log('\n-- B-CDXXXII. FS-02 — la taxonomie sur la vraie base CIQUAL --');
  const R = await pg.evaluate(async ({ CORPUS, PIEGES, EXPLICITES }) => {
    await _ciqualCharger(); await _aliasCharger();
    const A = _ciqual.a.filter(a => a[3] !== null && a[3] !== undefined);
    const noms = new Set(A.map(a => a[1]));
    const o = { ordre: _FS_ORDRE.slice(), version: _FS_VERSION, corpus: [], pieges: [], absents: [], comptes: { n: A.length }, expl: {}, top: {} };
    for (const [f, txt, att] of CORPUS) { if (!noms.has(txt)) o.absents.push(txt); o.corpus.push([f, txt, att, _fsFormesDuTexte(txt)]); }
    for (const [d, txt, att] of PIEGES) { if (!noms.has(txt)) o.absents.push(txt); o.pieges.push([d, txt, att, _fsFormesDuTexte(txt)]); }
    for (const a of A) for (const f of _fsFormesDuTexte(a[1])) o.comptes[f] = (o.comptes[f] || 0) + 1;
    for (const q in EXPLICITES) { const r = _ciqualChercher(q, 3); o.expl[q] = { formes: _fsIntention(q).formes, top: r[0] ? r[0][1] : '', topFormes: r[0] ? _fsFormesDuTexte(r[0][1]) : [] }; }
    for (const q of ['poulet', 'curry', 'courgette', 'riz sec', 'riz', 'oeuf']) o.top[q] = (_ciqualChercher(q, 3) || []).map(a => a[1]);
    o.it = { poulet: _fsIntention('poulet'), curry: _fsIntention('curry'), rizSec: _fsIntention('riz sec') };
    o.amb = { rizBlancCru: _fsFormesDuTexte('Riz blanc, cru'), curryPoudre: _fsFormesDuTexte('Curry, poudre'),
              sauceCurry: _fsFormesDuTexte('Sauce au curry, chaude, préemballée'),
              pouletCurry: _fsFormesDuTexte('Poulet au curry et au lait de coco, préemballé'),
              courgettePuree: _fsFormesDuTexte('Courgette, purée'),
              aliasCourgette: (() => { const c = _alias.a['courgette']; const a = _ciqual.a.find(x => x[0] === c); return a ? [a[1], _fsFormesDuTexte(a[1])] : null; })() };
    /* ⭐ DÉTERMINISME : formes de TOUTE la base, 3 fois, puis sur la base mélangée et inversée ; la table
       n'est jamais modifiée par un appel ; les 1ᵉʳˢ résultats explicites ne dépendent pas de l'ordre. */
    const table = JSON.stringify(_FS_FORMES);
    const carte = () => _ciqual.a.map(a => a[0] + ':' + _fsFormesDuTexte(a[1]).join('+') + ':' + _fsFormesDuTexte(a[1], { qualificatifs: true, debut: true }).join('+')).sort().join('|');
    const tops = () => Object.keys(EXPLICITES).map(q => (_ciqualChercher(q, 6) || []).map(a => a[0]).join(',')).join('|');
    const ref = carte(), refTops = tops(), rep = [carte(), carte()].every(x => x === ref);
    const orig = _ciqual.a.slice(); let graine = 11;
    const hasard = () => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine / 2147483648; };
    const perm = [];
    for (let k = 0; k < 3; k++) { const c = orig.slice(); for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(hasard() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
      _ciqual.a = c; perm.push(carte() === ref && tops() === refTops); }
    _ciqual.a = orig.slice().reverse(); perm.push(carte() === ref && tops() === refTops);
    _ciqual.a = orig;
    o.det = { repete: rep, perm, tableIntacte: JSON.stringify(_FS_FORMES) === table };
    return o;
  }, { CORPUS, PIEGES, EXPLICITES });
  const det = o => JSON.stringify(o);
  t('B-CDXXXII ⛔ CONTRÔLE — tous les libellés des témoins existent VRAIMENT dans la base (aucun texte inventé)',
    R.absents.length === 0, R.absents.join(' · '));
  t('B-CDXXXII la taxonomie : 12 formes, dans cet ordre, moteur version 2 ou plus (la version exacte est figée par le banc FS-03)',
    det(R.ordre) === det(['cru', 'cuit', 'seche', 'poudre', 'feuille', 'boisson', 'puree', 'sauce', 'prepare', 'partie', 'surgele', 'conserve']) && R.version >= 2,
    det(R.ordre) + ' v' + R.version);
  for (const f of [...new Set(CORPUS.map(c => c[0]))]) {
    const L = R.corpus.filter(c => c[0] === f);
    t('B-CDXXXII forme « ' + f + ' » : ' + L.map(c => c[1].slice(0, 32)).join(' · '),
      L.every(c => det(c[2]) === det(c[3])), det(L.filter(c => det(c[2]) !== det(c[3])).map(c => [c[1], c[3]])));
  }
  for (const [d, txt, att, obt] of R.pieges)
    t('B-CDXXXII piège — ' + d, det(att) === det(obt), txt + ' → ' + det(obt));
  t('B-CDXXXII comptes mesurés sur la vraie base (§9 de la doc) : ' + Object.keys(COMPTES).map(k => k + ' ' + COMPTES[k]).join(' · '),
    Object.keys(COMPTES).every(k => R.comptes[k] === COMPTES[k]), det(R.comptes));
  for (const q in EXPLICITES)
    t('B-CDXXXII EXPLICITE « ' + q + ' » nomme ' + det(EXPLICITES[q]) + ' et le 1ᵉʳ résultat les porte',
      det(R.expl[q].formes) === det(EXPLICITES[q]) && R.expl[q].top && EXPLICITES[q].every(f => R.expl[q].topFormes.includes(f)),
      det(R.expl[q]));
  /* ⛔ LES AMBIGUÏTÉS, FIGÉES TELLES QUELLES — riz sec, curry et poulet restent sans préférence en FS-03 (voulu) ; courgette est tranchée. */
  t('B-CDXXXII AMBIGUÏTÉ « riz sec » : la requête nomme `seche`, « Riz blanc, cru » porte `cru` — AUCUNE équivalence inventée ; le 1ᵉʳ résultat n\'est pas cuit',
    det(R.it.rizSec.formes) === '["seche"]' && det(R.amb.rizBlancCru) === '["cru"]' && !/cuit/i.test(R.top['riz sec'][0] || 'cuit'),
    det({ it: R.it.rizSec.formes, riz: R.amb.rizBlancCru, top: R.top['riz sec'][0] }));
  t('B-CDXXXII AMBIGUÏTÉ « curry » : poudre / sauce / plat préparé sont CLASSÉS, rien n\'est décidé — « curry » rend toujours « Curry, poudre »',
    det(R.amb.curryPoudre) === '["poudre"]' && det(R.amb.sauceCurry) === '["sauce","prepare"]' && det(R.amb.pouletCurry) === '["prepare"]'
    && R.it.curry.generique === true && R.top.curry[0] === 'Curry, poudre', det({ a: R.amb, top: R.top.curry }));
  t('B-CDXXXII AMBIGUÏTÉ « poulet » : requête GÉNÉRIQUE, jamais transformée en « poulet cuit » — 1ᵉʳ résultat inchangé depuis FS-01 (cru)',
    R.it.poulet.generique === true && R.top.poulet[0] === 'Poulet, filet sans peau cru', det(R.top.poulet));
  /* ↪️ FS-03 (02/10) a TRANCHÉ ce que FS-02 avait figé : l'alias `courgette` → purée est RETIRÉ (tools/alias.py,
     RETRAITS) ; la purée reste classée `puree` et trouvable, elle n'est plus imposée. */
  t('B-CDXXXII AMBIGUÏTÉ « courgette » (tranchée par FS-03) : plus d\'alias ; « Courgette, purée » reste classée `puree`, et n\'est plus en tête',
    R.amb.aliasCourgette === null && det(R.amb.courgettePuree) === '["puree"]'
    && /^Courgette/.test(R.top.courgette[0] || '') && R.top.courgette[0] !== 'Courgette, purée', det({ a: R.amb.aliasCourgette, top: R.top.courgette }));
  t('B-CDXXXII DÉTERMINISME : formes de toute la base identiques 3 fois, sur 3 bases mélangées et l\'inverse ; requêtes explicites idem ; la table jamais modifiée',
    R.det.repete && R.det.perm.length === 4 && R.det.perm.every(x => x === true) && R.det.tableIntacte, det(R.det));
  t('B-CDXXXII aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};
