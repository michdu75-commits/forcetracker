/* ══════════════════════════════════════════════════════════════════════════════════════
   🏷️ FOOD SEMANTICS V1 — FS-04 : AFFICHER LA FORME DE L'ALIMENT DANS LES RÉSULTATS
   (03/10/2026, session-B, demande de Michel) — blocs B-CDXXXV (source) · B-CDXXXVI (la projection sur la
   vraie base) · B-CDXXXVII (ce que la personne VOIT : vraie frappe, en ligne et hors ligne, 390 et 430 px).

   Un lot d'AFFICHAGE : la forme est une PROJECTION de `_fsFormesDuTexte` (FS-02) — `_FS_LIBELLES`,
   `_fsFormesAffichees`, `_fsBadgeForme` — et rien ne touche au classement, aux alias ni aux valeurs.
   ⛔ Aucune forme reconnue → aucun libellé. ⛔ La forme est du TEXTE, jamais une couleur seule.
   Contrôle négatif : `tools/mut_food_affichage.py`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');

/* A — un libellé CIQUAL RÉEL par forme → le libellé attendu (la partie n'existe jamais seule : avec son état). */
const PAR_FORME = {
  cru: ['Haricot vert, cru', 'Cru'], cuit: ['Haricot vert, cuit', 'Cuit'], seche: ['Pomme, sèche', 'Sec / séché'],
  poudre: ['Café, moulu', 'Poudre / moulu'], feuille: ['Thé, feuille', 'Feuilles'], boisson: ['Thé infusé, sans sucres ajoutés', 'Boisson'],
  puree: ['Haricots verts, purée', 'Purée'], sauce: ['Sauce (aliment moyen)', 'Sauce'], prepare: ['Crêpe, nature, préemballée, rayon frais', 'Préparé'],
  partie: ["Oeuf, blanc (blanc d'oeuf), cru", 'Blanc ou jaune d’œuf · Cru'], surgele: ['Palet ou galette de légumes, préfrit, surgelé', 'Surgelé'],
  conserve: ['Haricot vert, appertisé, égoutté', 'Conserve'],
};
/* D — les combinaisons réelles les plus fréquentes, et leur rendu exact (inventaire §11 de la doc). */
const MULTI = [
  ['Sauce tartare, préemballée', 'Sauce'],                                         // sauce + préparé (64)
  ['Boulettes au boeuf, cuites', 'Cuit'],                                          // forme seule
  ['Paupiette de veau, préemballée, rôtie/cuite au four', 'Cuit'],                 // cuit + préparé (43)
  ['Haricot vert, surgelé, cru', 'Cru · Surgelé'],                                 // cru + surgelé (33)
  ['Haricot vert, surgelé, cuit', 'Cuit · Surgelé'],                               // cuit + surgelé (14)
  ['Pâtes sèches, standard, cuites, sans sel ajouté', 'Cuit'],                     // cuit + sec (10) : l'état l'emporte
  ['Pâtes sèches, standard, crues', 'Cru'],                                        // cru + sec (8)
  ['Tomate, purée, appertisée', 'Purée · Conserve'],                               // purée + conserve
  ['Ail séché, poudre', 'Poudre / moulu · Sec / séché'],                           // sec + poudre
  ['Meloukhia, feuilles de corète séchées, en poudre', 'Poudre / moulu · Feuilles'], // 3 formes → 2 libellés
];
const AUCUNE = ['Fromage (aliment moyen)', 'Lait demi-écrémé, UHT', 'Soupe (aliment moyen)', 'Oeuf dur'];
/* E — requêtes EXPLICITES : le 1ᵉʳ résultat AFFICHE la forme demandée. */
const EXPLICITES = { 'riz cru': 'Cru', 'café moulu': 'Poudre / moulu', 'thé feuilles': 'Feuilles', 'pomme séchée': 'Sec / séché',
  'haricots verts purée': 'Purée', 'lait poudre': 'Poudre / moulu', 'sauce curry': 'Sauce', 'poulet cru': 'Cru', 'pâtes cuites': 'Cuit' };
/* F — requêtes GÉNÉRIQUES (FS-03), en ligne : libellé du 1ᵉʳ résultat ('' = aucun). */
const GENERIQUES = { 'riz': 'Cuit', 'pâtes': 'Cuit', 'spaghetti': 'Cuit', 'macaroni': 'Cuit', 'fusilli': 'Cuit', 'penne': 'Cuit',
  'haricot vert': 'Cuit', 'courgette': 'Cru', 'poire': 'Cru', 'raisin': 'Cru', 'pomme': 'Cru', 'café': 'Boisson', 'thé': 'Boisson',
  'curry': 'Poudre / moulu', 'poulet': 'Cru', 'fromage': '', 'lait': '', 'soupe': '', 'carbonara': 'Préparé' };
/* G — HORS LIGNE (table d'alias injoignable) : la limite connue reste VISIBLE — « raisin » → « Raisin sec », affiché sec. */
const HORS_LIGNE = { 'raisin': ['Raisin sec', 'Sec / séché'], 'riz': [null, 'Cuit'], 'pâtes': [null, 'Cuit'], 'fromage': ['Fromage (aliment moyen)', ''] };

module.exports.source = function (t, ROOT, fs, path) {
  const AP = _sansCommentaires(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8')).replace(/\s+/g, '');
  const CSS = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
  const corps = (nom) => { const i = AP.indexOf('function' + nom + '('); if (i < 0) return '';
    let d = 0; for (let k = AP.indexOf('{', i); k > 0 && k < AP.length; k++) {
      if (AP[k] === '{') d++; else if (AP[k] === '}' && !--d) return AP.slice(i, k + 1); }
    return AP.slice(i); };
  console.log('\n═══ B-CDXXXV. FS-04 — une projection d\'affichage, rien d\'autre (source) ═══');
  const aff = corps('_fsFormesAffichees');
  t('B-CDXXXV ① la forme affichée part de `_fsFormesDuTexte` (FS-02) — aucune 2ᵉ taxonomie, aucune lecture du nom à côté',
    aff.includes('letf=_fsFormesDuTexte(nom);') && !/\.test\(|indexOf\(['"][a-z]/.test(aff.replace(/f\.indexOf\('(cru|cuit)'\)/g, ''))
    && !/_afNorm|split\(/.test(aff) && AP.split('function_fsFormesAffichees(').length === 2, 'taxonomie recréée');
  t('B-CDXXXV ② le badge vit sur la LIGNE DE DÉTAIL (2ᵉ argument), jamais dans le nom (tronqué)',
    corps('_afSuggRendu').includes("h+=ligne('🥗',a[1],_fsBadgeForme(a[1])+") && !/ligne\('🥗',_fsBadge/.test(AP), 'badge mal placé');
  const RANG = ['_fsCle', '_fsPreference', '_fsPromouvoir', '_ciqualChercherUne', '_ciqualChercher', '_ciqualChercherSansAlias', '_fsProfil'];
  t('B-CDXXXV ③ le classement ne lit RIEN de l\'affichage, et le rendu ne réordonne pas les résultats',
    RANG.every(f => !/_FS_LIBELLES|_fsFormesAffichees|_fsBadgeForme|_FS_AFFICHAGE_ORDRE/.test(corps(f)))
    && !/_afSuggCiq\.(sort|reverse|filter|splice)\(/.test(corps('_afSuggRendu')), 'le classement lit l\'affichage ou le rendu réordonne');
  t('B-CDXXXV ④ la forme est du TEXTE lisible : `.af-forme` porte une couleur de texte et une bordure, ne se coupe pas, ne se cache pas',
    /\.af-forme\{[^}]*color:var\(--t2\)[^}]*border:1px solid var\(--sep\)[^}]*white-space:nowrap/.test(CSS.replace(/\s+(?=[a-z-]+:)/g, ''))
    && !/\.af-forme\{[^}]*(display:none|visibility:hidden|font-size:0)/.test(CSS.replace(/\s+/g, '')), 'badge illisible ou caché');
};

module.exports.ecran = async function (t, b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => rt.abort());
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_fs04'))return; sessionStorage.setItem('_fs04','1');
    localStorage.clear(); localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99'); }catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1800);
  console.log('\n-- B-CDXXXVI. FS-04 — la projection sur la vraie base CIQUAL --');
  const R = await pg.evaluate(async ({ PAR_FORME, MULTI, AUCUNE }) => {
    await _ciqualCharger(); await _aliasCharger();
    const A = _ciqual.a.filter(a => a[3] != null), noms = new Set(A.map(a => a[1]));
    const lib = n => _fsFormesAffichees(n).join(' · ');
    const o = { cles: Object.keys(_FS_LIBELLES), ordre: _FS_ORDRE.slice(), affOrdre: _FS_AFFICHAGE_ORDRE.slice(), libs: Object.values(_FS_LIBELLES),
      parForme: {}, multi: MULTI.map(([n, att]) => [n, att, lib(n)]), aucune: AUCUNE.map(n => [n, _fsBadgeForme(n)]), absents: [] };
    for (const f in PAR_FORME) { o.parForme[f] = lib(PAR_FORME[f][0]); if (!noms.has(PAR_FORME[f][0])) o.absents.push(PAR_FORME[f][0]); }
    MULTI.concat(AUCUNE.map(n => [n])).forEach(([n]) => { if (!noms.has(n)) o.absents.push(n); });
    let sansForme = 0, sansFormeBadge = 0, plusDeDeux = 0, multi = 0;
    for (const a of A) { const f = _fsFormesDuTexte(a[1]), l = _fsFormesAffichees(a[1]);
      if (!f.length) { sansForme++; if (_fsBadgeForme(a[1]) !== '') sansFormeBadge++; }
      if (f.length > 1) multi++; if (l.length > 2) plusDeDeux++; }
    o.comptes = { n: A.length, sansForme, sansFormeBadge, multi, plusDeDeux };
    /* ⭐ DÉTERMINISME : le libellé de chaque aliment, 3 fois puis sur 3 bases mélangées et l'inverse. */
    const carte = () => _ciqual.a.map(a => a[0] + ':' + _fsBadgeForme(a[1])).sort().join('|');
    const ref = carte(), rep = [carte(), carte()].every(x => x === ref);
    const orig = _ciqual.a.slice(); let graine = 31; const perm = [];
    const hasard = () => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine / 2147483648; };
    for (let k = 0; k < 3; k++) { const c = orig.slice(); for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(hasard() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
      _ciqual.a = c; perm.push(carte() === ref); }
    _ciqual.a = orig.slice().reverse(); perm.push(carte() === ref); _ciqual.a = orig;
    o.det = { rep, perm };
    return o;
  }, { PAR_FORME, MULTI, AUCUNE });
  const det = o => JSON.stringify(o);
  t('B-CDXXXVI ⛔ CONTRÔLE — tous les libellés des témoins existent VRAIMENT dans la base', R.absents.length === 0, R.absents.join(' · '));
  t('B-CDXXXVI A · le mapping couvre EXACTEMENT les 12 formes de FS-02 (ni plus, ni moins) ; 12 libellés distincts, en clair, sans code',
    det(R.cles.slice().sort()) === det(R.ordre.slice().sort()) && det(R.affOrdre.slice().sort()) === det(R.ordre.slice().sort())
    && new Set(R.libs).size === 12 && R.libs.every(l => /^[A-ZÀ-Ý]/.test(l) && !/[_{}]/.test(l)), det(R.cles));
  for (const f in PAR_FORME)
    t('B-CDXXXVI A · « ' + f + ' » → « ' + PAR_FORME[f][1] + ' » (' + PAR_FORME[f][0].slice(0, 34) + ')', R.parForme[f] === PAR_FORME[f][1], R.parForme[f]);
  t('B-CDXXXVI B · aucune forme → AUCUN libellé : ' + R.comptes.sansForme + ' aliments sans forme, 0 badge ; « Fromage », « Lait », « Soupe », « Oeuf dur » nus',
    R.comptes.sansForme === 1298 && R.comptes.sansFormeBadge === 0 && R.aucune.every(x => x[1] === ''), det(R.aucune));
  for (const [n, att, obt] of R.multi)
    t('B-CDXXXVI D · multi-formes « ' + n.slice(0, 40) + ' » → « ' + att + ' »', att === obt, obt);
  t('B-CDXXXVI D · ' + R.comptes.multi + ' aliments à plusieurs formes : jamais plus de 2 libellés',
    R.comptes.multi === 253 && R.comptes.plusDeDeux === 0, det(R.comptes));
  t('B-CDXXXVI I · DÉTERMINISME : le libellé de chaque aliment est identique 3 fois, sur 3 bases mélangées et l\'inverse',
    R.det.rep && R.det.perm.length === 4 && R.det.perm.every(Boolean), det(R.det));
  t('B-CDXXXVI aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};

/* ══ B-CDXXXVII — CE QUE LA PERSONNE VOIT : vraie frappe dans le champ, vraie liste, en ligne et hors ligne ══ */
module.exports.ecranVue = async function (t, b, PORT) {
  console.log('\n-- B-CDXXXVII. FS-04 — la forme à l\'écran (vraie frappe, en ligne / hors ligne, 390 et 430 px) --');
  const session = async (largeur, horsLigne, requetes) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: largeur, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => rt.abort());
    if (horsLigne) await cx.route(/data\/alias\.json/, rt => rt.abort());
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_fs04v'))return; sessionStorage.setItem('_fs04v','1');
      localStorage.clear(); localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99'); }catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html');
    await pg.waitForTimeout(1800);
    const out = await pg.evaluate(async (requetes) => {
      document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      openAddFood(); await new Promise(r => setTimeout(r, 300));
      await _ciqualCharger(); await _aliasCharger();   // l'ordre attendu se calcule sur la base CHARGÉE (hors ligne : alias absents, comme l'écran)
      const inp = document.getElementById('af-desc'), el = document.getElementById('af-sugg'), res = {};
      const lignes = () => [...el.querySelectorAll('button')].filter(x => /_afSuggPrendreCiqual/.test(x.getAttribute('onclick') || ''));
      for (const q of requetes) {
        inp.value = q; inp.dispatchEvent(new Event('input', { bubbles: true }));
        const attendu = _ciqualChercher(q, 6);                       // ⭐ l'ordre de la recherche, même état d'alias
        for (let k = 0; k < 40 && !(lignes().length && lignes()[0].textContent.includes(attendu[0] ? attendu[0][1] : '§')); k++) await new Promise(r => setTimeout(r, 75));
        const L = lignes();
        res[q] = { attendu: attendu.map(a => [a[1], a[3]]), rows: L.map(x => {
          const sp = x.querySelectorAll('span span'), titre = sp[0], detail = sp[1], badge = x.querySelector('.af-forme');
          const rb = badge ? badge.getBoundingClientRect() : null, rr = x.getBoundingClientRect();
          return { nom: titre ? titre.textContent : '', badge: badge ? badge.textContent : '', detail: detail ? detail.textContent : '',
                   badgeVisible: !!(rb && rb.width > 0 && rb.height > 0 && rb.left >= rr.left && rb.right <= rr.right + 0.5),
                   badgeDansTitre: !!(titre && titre.querySelector('.af-forme')), titreTronque: !!(titre && titre.scrollWidth > titre.clientWidth + 1),
                   badgeCouleurSeule: !!(badge && !badge.textContent.trim()) };
        }), html: el.innerHTML };
      }
      /* I — même recherche, même rendu : on retape la 1ʳᵉ requête et on compare le HTML. */
      const q0 = requetes[0]; inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true })); await new Promise(r => setTimeout(r, 200));
      inp.value = q0; inp.dispatchEvent(new Event('input', { bubbles: true })); await new Promise(r => setTimeout(r, 900));
      res.__rejoue = el.innerHTML === res[q0].html;
      return res;
    }, requetes);
    await cx.close();
    return Object.assign(out, { __errs: errs });
  };
  const det = o => JSON.stringify(o);
  const ordreOK = r => r.rows.length === r.attendu.length && r.rows.every((x, i) => x.nom === r.attendu[i][0] && x.detail.includes(r.attendu[i][1] + ' kcal/100 g'));
  const EN = await session(390, false, Object.keys(GENERIQUES).concat(Object.keys(EXPLICITES), ['café au lait', 'boisson']));
  for (const q in GENERIQUES)
    t('B-CDXXXVII F · en ligne, « ' + q + ' » → 1ᵉʳ résultat ' + (GENERIQUES[q] ? '« ' + GENERIQUES[q] + ' »' : 'SANS libellé'),
      EN[q].rows.length > 0 && EN[q].rows[0].badge === GENERIQUES[q], det(EN[q].rows.slice(0, 2).map(x => [x.nom, x.badge])));
  for (const q in EXPLICITES)
    t('B-CDXXXVII E · explicite « ' + q + ' » → le 1ᵉʳ résultat AFFICHE « ' + EXPLICITES[q] + ' » (il confirme la forme demandée)',
      EN[q].rows.length > 0 && EN[q].rows[0].badge.split(' · ').includes(EXPLICITES[q]), det(EN[q].rows.slice(0, 2).map(x => [x.nom, x.badge])));
  const tous = Object.keys(EN).filter(q => !q.startsWith('__'));
  t('B-CDXXXVII J · ' + tous.length + ' requêtes : l\'ORDRE affiché est exactement celui de la recherche, et chaque valeur kcal est celle de la base',
    tous.every(q => ordreOK(EN[q])), det(tous.filter(q => !ordreOK(EN[q])).map(q => [q, EN[q].rows.map(x => x.nom), EN[q].attendu.map(x => x[0])]).slice(0, 2)));
  t('B-CDXXXVII M10 · la forme est un TEXTE, jamais une couleur seule : tout badge affiché a un texte non vide, et c\'est le libellé attendu',
    tous.every(q => EN[q].rows.every(x => !x.badgeCouleurSeule)), '');
  t('B-CDXXXVII I · même recherche, même rendu (la 1ʳᵉ requête retapée rend le même HTML)', EN.__rejoue === true, '');
  const HL = await session(390, true, Object.keys(HORS_LIGNE));
  for (const q in HORS_LIGNE) {
    const [nom, l] = HORS_LIGNE[q], r0 = HL[q].rows[0] || {};
    t('B-CDXXXVII G · HORS LIGNE, « ' + q + ' » → ' + (nom ? '« ' + nom + ' » ' : '') + (l ? 'affiché « ' + l + ' »' : 'sans libellé') + (q === 'raisin' ? ' — la limite connue reste VISIBLE, honnêtement' : ''),
      (!nom || r0.nom === nom) && r0.badge === l && ordreOK(HL[q]), det(HL[q].rows.slice(0, 2).map(x => [x.nom, x.badge])));
  }
  /* H — NOMS LONGS, deux largeurs : le nom se tronque, la forme jamais. */
  for (const w of [390, 430]) {
    const V = w === 390 ? EN : await session(w, false, ['café au lait', 'boisson', 'haricots verts']);
    const L = ['café au lait', 'boisson'].flatMap(q => V[q].rows);
    const longs = L.filter(x => x.titreTronque && x.badge);
    t('B-CDXXXVII H · ' + w + ' px : un nom LONG (tronqué à l\'écran) garde sa forme entièrement visible, hors du nom',
      longs.length > 0 && longs.every(x => x.badgeVisible && !x.badgeDansTitre), det({ n: longs.length, ex: longs.slice(0, 1) }));
  }
  t('B-CDXXXVII aucune erreur de page (en ligne et hors ligne)', EN.__errs.length === 0 && HL.__errs.length === 0, EN.__errs.concat(HL.__errs).slice(0, 2).join(' | '));
};
