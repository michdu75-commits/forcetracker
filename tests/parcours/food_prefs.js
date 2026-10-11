/* ══════════════════════════════════════════════════════════════════════════════════════
   🎯 FOOD SEMANTICS V1 — FS-03 : PRÉFÉRENCES SÉMANTIQUES PAR DÉFAUT
   (02/10/2026, session-B, demande de Michel) — blocs B-CDXXXIII (source) · B-CDXXXIV (vraie base).

   « Une préférence générique n'est JAMAIS une correction d'une requête explicite. »
   « Il n'existe pas de règle universelle cuit > cru. »
   UNE couche (`_FS_EVITE_GENERIQUE`, `_FS_PREFS_GENERIQUES`, `_fsProfil`, `_fsPreference`, `_fsPromouvoir`)
   qui LIT la taxonomie FS-02 et n'y écrit rien. La préférence choisit le PREMIER résultat d'une requête
   générique ; elle ne rejoue pas un choix déjà fait par la table d'alias (R2), et le cru reste juste sous
   le cuit (décision de Michel du 03/09, ft-v1115).
   Chaque témoin est conduit AVEC la table d'alias (l'app en ligne) et, quand c'est le sujet, SANS (hors
   ligne : `_alias = null`, exactement comme le runner CCXXIII).
   Contrôle négatif : `tools/mut_food_prefs.py`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');

/* Requêtes explicites : le 1ᵉʳ résultat porte la forme nommée, et aucune préférence n'y touche. */
const EXPLICITES = ['café moulu', 'café poudre', 'thé feuilles', 'thé feuille', 'pomme séchée', 'haricots verts purée',
  'haricots verts crus', 'haricots verts cuits', 'riz cru', 'riz cuit', 'lait en poudre', 'sauce curry', 'poulet cru',
  'pâtes crues', 'pâtes sèches', 'pâtes cuites', 'courgette purée', 'raisin sec', 'riz sec'];
const GENERIQUES = ['café', 'thé', 'pomme', 'poire', 'raisin', 'riz', 'pâtes', 'spaghetti', 'macaroni', 'haricots verts',
  'courgette', 'curry', 'poulet', 'dinde', 'saumon', 'oeuf', 'fromage', 'lait', 'soupe', 'carbonara', 'pates bolognaise', 'riz au lait'];

module.exports.source = function (t, ROOT, fs, path) {
  const AP = _sansCommentaires(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8')).replace(/\s+/g, '');
  const corps = (nom) => { const i = AP.indexOf('function' + nom + '('); if (i < 0) return '';
    let d = 0; for (let k = AP.indexOf('{', i); k > 0 && k < AP.length; k++) {
      if (AP[k] === '{') d++; else if (AP[k] === '}' && !--d) return AP.slice(i, k + 1); }
    return AP.slice(i); };
  console.log('\n═══ B-CDXXXIII. FS-03 — une couche de préférences, séparée de la taxonomie (source) ═══');
  t('B-CDXXXIII ① UNE couche : `_FS_EVITE_GENERIQUE`, `_FS_PREFS_GENERIQUES`, `_fsProfil`, `_fsPreference`, `_fsPromouvoir` — déclarés une fois',
    ['const_FS_EVITE_GENERIQUE=', 'const_FS_PREFS_GENERIQUES=', 'function_fsProfil(', 'function_fsPreference(', 'function_fsPromouvoir(']
      .every(x => AP.split(x).length === 2), 'couche absente ou dupliquée');
  t('B-CDXXXIII ② un profil ne s\'applique qu\'à une requête GÉNÉRIQUE, à l\'identique (jamais par préfixe) ; une forme NOMMÉE n\'est jamais évitée',
    corps('_fsProfil').includes('if(!it.generique)returnnull;') && corps('_fsProfil').includes('if(q===r||q===pluriel)returnp;')
    && !/startsWith|indexOf\(r\)===0/.test(corps('_fsProfil'))
    && corps('_fsPreference').includes('_FS_EVITE_GENERIQUE.filter(f=>it.formes.indexOf(f)<0)'), 'profil ou évitement mal bornés');
  t('B-CDXXXIII ③ l\'explicite passe AVANT la préférence dans la clé ; la préférence ne choisit que le 1ᵉʳ résultat, et pas quand l\'alias l\'a déjà choisi',
    corps('_fsCle').includes('constforme=manque?3:_fsPreference(it,a[1]);')
    && corps('_ciqualChercherUne').includes('if(promouvoir!==false)_fsPromouvoir(it,out);')
    && corps('_ciqualChercher').includes('_ciqualChercherSansAlias(q,lim,false)'), 'ordre ou périmètre de la préférence modifié');
};

module.exports.ecran = async function (t, b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => rt.abort());
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_fs03'))return; sessionStorage.setItem('_fs03','1');
    localStorage.clear(); localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99'); }catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1800);
  console.log('\n-- B-CDXXXIV. FS-03 — les préférences par défaut, conduites sur la vraie base --');
  const R = await pg.evaluate(async ({ EXPLICITES, GENERIQUES }) => {
    await _ciqualCharger(); await _aliasCharger();
    const noms = (q, n) => (_ciqualChercher(q, n || 6) || []).map(a => a[1]);
    const sansAlias = (f) => { const g = _alias; _alias = null; try { return f(); } finally { _alias = g; } };
    const o = { version: _FS_VERSION, avec: {}, sans: {}, expl: {}, profils: _FS_PREFS_GENERIQUES.map(p => ({ r: p.requetes.slice(0, 3), prefere: p.prefere || null, ambigu: !!p.ambigu, raison: !!p.raison })) };
    for (const q of GENERIQUES) o.avec[q] = noms(q);
    sansAlias(() => { for (const q of GENERIQUES) o.sans[q] = noms(q); });
    for (const q of EXPLICITES) {
      const it = _fsIntention(q), r = _ciqualChercher(q, 6);
      o.expl[q] = { formes: it.formes, profil: _fsProfil(it), top: r[0] ? r[0][1] : '', topFormes: r[0] ? _fsFormesDuTexte(r[0][1]) : [],
        /* ⭐ le contrat lui-même : aucun candidat qui porte la forme nommée n'est « évité » */
        evitesNommes: r.filter(a => it.formes.every(f => _fsFormesDuTexte(a[1]).includes(f)) && _fsPreference(it, a[1]) === 2).map(a => a[1]) };
    }
    /* les aliments SANS forme reconnue restent admissibles : jamais « évités » */
    const A = _ciqual.a.filter(a => a[3] != null && !_fsFormesDuTexte(a[1]).length);
    o.sansForme = { n: A.length, evites: A.filter(a => _fsPreference(_fsIntention(_fsTete(a[1], false) || 'x'), a[1]) === 2).map(a => a[1]).slice(0, 5) };
    /* poulet : aucune préférence cru/cuit, ni par profil ni par évitement */
    const itP = _fsIntention('poulet');
    o.poulet = { profil: _fsProfil(itP), cru: _fsPreference(itP, 'Poulet, viande crue'), cuit: _fsPreference(itP, 'Poulet, filet sans peau grillé/poêlé') };
    o.curry = { profil: _fsProfil(_fsIntention('curry')) };
    o.aliasCourgette = _alias.a['courgette'] === undefined && _alias.a['courgettes'] === undefined;
    /* ⭐ DÉTERMINISME : les mêmes requêtes, avec et sans alias, 3 fois puis sur 3 bases mélangées et l'inverse. */
    const Q = GENERIQUES.concat(EXPLICITES);
    const photo = () => Q.map(q => noms(q).join('·')).join('|') + '#' + sansAlias(() => Q.map(q => noms(q).join('·')).join('|'));
    const ref = photo(), rep = [photo(), photo()].every(x => x === ref);
    const orig = _ciqual.a.slice(); let graine = 23;
    const hasard = () => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine / 2147483648; };
    const perm = [];
    for (let k = 0; k < 3; k++) { const c = orig.slice(); for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(hasard() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
      _ciqual.a = c; perm.push(photo() === ref); }
    _ciqual.a = orig.slice().reverse(); perm.push(photo() === ref);
    _ciqual.a = orig;
    o.det = { repete: rep, perm };
    return o;
  }, { EXPLICITES, GENERIQUES });
  const det = o => JSON.stringify(o);
  const un = (m, q) => (R[m][q] || [])[0] || '';
  t('B-CDXXXIV la couche : 4 profils exactement (riz · pâtes et leurs formes · haricot vert : cuit — curry : ambigu), chacun avec sa raison ; moteur version 3',
    det(R.profils.map(p => [p.r[0], p.prefere, p.ambigu])) === det([['riz', ['cuit'], false], ['pates', ['cuit'], false], ['haricot vert', ['cuit'], false], ['curry', null, true]])
    && R.profils.every(p => p.raison) && R.version === 3, det(R.profils) + ' v' + R.version);
  /* — café / thé : la boisson, par l'évitement des formes transformées — */
  t('B-CDXXXIV « café » générique → la boisson, avec et sans alias ; aucune poudre avant la dernière boisson du top 6',
    /prêt à boire/.test(un('avec', 'café')) && /prêt à boire/.test(un('sans', 'café'))
    && R.avec['café'].slice(0, 6).every(x => !/moulu|poudre/.test(x)), det(R.avec['café']));
  t('B-CDXXXIV « thé » générique → l\'infusion, avec et sans alias', /infusé/.test(un('avec', 'thé')) && /infusé/.test(un('sans', 'thé')), det(R.avec['thé'].slice(0, 4)));
  /* — fruits : non transformés — */
  t('B-CDXXXIV « pomme » générique → une pomme CRUE, jamais séchée ni en purée (avec et sans alias)',
    /^Pomme, chair.*crue/.test(un('avec', 'pomme')) && /^Pomme, chair.*crue/.test(un('sans', 'pomme')), det({ a: un('avec', 'pomme'), s: un('sans', 'pomme') }));
  t('B-CDXXXIV « poire » → le fruit (aliment moyen), plus « Poire belle Hélène » ; « raisin » → le fruit, plus « Raisin sec » (alias migrés)',
    un('avec', 'poire') === 'Poire, chair, crue (aliment moyen)' && un('avec', 'raisin') === 'Raisin cru (aliment moyen)'
    && /^Poire, chair/.test(un('sans', 'poire')), det({ p: un('avec', 'poire'), r: un('avec', 'raisin'), ps: un('sans', 'poire') }));
  /* — riz / pâtes / haricots verts : cuit en 1ᵉʳ, le cru JUSTE DESSOUS (décision de Michel, ft-v1115) — */
  t('B-CDXXXIV « riz » générique → CUIT en tête avec et sans alias, et le CRU reste dans les 3 premiers (ft-v1115)',
    /\bcuit\b/.test(un('avec', 'riz')) && /\bcuit\b/.test(un('sans', 'riz'))
    && R.avec.riz.slice(1, 3).some(x => /^Riz blanc, cru/.test(x)) && R.sans.riz.slice(1, 3).some(x => /\bcru\b/.test(x)),
    det({ a: R.avec.riz.slice(0, 3), s: R.sans.riz.slice(0, 3) }));
  t('B-CDXXXIV « pâtes », « spaghetti », « macaroni » génériques → CUITES en tête, avec et sans alias, les crues juste dessous',
    ['pâtes', 'spaghetti', 'macaroni'].every(q => /cuites/.test(un('avec', q)) && /cuites/.test(un('sans', q)) && R.sans[q].slice(1, 3).some(x => /crues/.test(x))),
    det(['pâtes', 'spaghetti', 'macaroni'].map(q => [q, un('sans', q), R.sans[q][1]])));
  t('B-CDXXXIV « haricots verts » générique → le légume ENTIER et CUIT, jamais la purée (avec et sans alias)',
    un('avec', 'haricots verts') === 'Haricot vert, cuit' && un('sans', 'haricots verts') === 'Haricot vert, cuit'
    && R.sans['haricots verts'].slice(0, 6).every(x => !/purée/.test(x)), det(R.sans['haricots verts'].slice(0, 6)));
  t('B-CDXXXIV « courgette » générique → plus de purée imposée : alias RETIRÉ, la courgette entière en tête (sans cru/cuit imposé par une règle)',
    R.aliasCourgette && /^Courgette, chair et peau/.test(un('avec', 'courgette')) && un('sans', 'courgette') === un('avec', 'courgette'),
    det({ a: R.avec.courgette.slice(0, 3) }));
  /* — les profils sont EXACTS, jamais par préfixe — */
  t('B-CDXXXIV aucun débordement : « riz au lait » rend le dessert, « pâtes bolognaise » (sans alias) le plat — pas des raviolis cuits',
    /^Riz au lait/.test(un('avec', 'riz au lait')) && /^Pâtes à la bolognaise/.test(un('sans', 'pates bolognaise')),
    det({ r: un('avec', 'riz au lait'), p: un('sans', 'pates bolognaise') }));
  t('B-CDXXXIV la SAUCE est évitée en générique : « carbonara » (sans alias) → le plat, pas la sauce',
    /^Pâtes à la carbonara/.test(un('sans', 'carbonara')) && /^Pâtes à la carbonara/.test(un('avec', 'carbonara')), det(R.sans.carbonara));
  /* — ambiguïtés assumées — */
  t('B-CDXXXIV AMBIGU « curry » : profil sans préférence, comportement de FS-01 conservé (« Curry, poudre »)',
    R.curry.profil && R.curry.profil.ambigu === true && un('avec', 'curry') === 'Curry, poudre' && un('sans', 'curry') === 'Curry, poudre', det(R.avec.curry));
  t('B-CDXXXIV AMBIGU « poulet » (et viandes, poissons) : AUCUNE préférence cru/cuit — pas de profil, cru et cuit également neutres, résultats de FS-02 inchangés',
    R.poulet.profil === null && R.poulet.cru === 1 && R.poulet.cuit === 1
    && un('avec', 'poulet') === 'Poulet, filet sans peau cru' && un('sans', 'poulet') === 'Poulet, pilon cru'
    && un('avec', 'dinde') === 'Dinde, escalope crue' && un('avec', 'saumon') === 'Saumon, élevage, cru', det({ p: R.poulet, a: R.avec.poulet.slice(0, 3), s: R.sans.poulet.slice(0, 3) }));
  t('B-CDXXXIV un aliment SANS forme reconnue reste admissible : jamais « évité » (' + R.sansForme.n + ' aliments) ; « fromage », « lait », « soupe » rendent leur aliment nu',
    R.sansForme.evites.length === 0 && un('avec', 'fromage') === 'Fromage (aliment moyen)' && un('avec', 'lait') === 'Lait demi-écrémé, UHT'
    && un('avec', 'soupe') === 'Soupe (aliment moyen)' && un('sans', 'fromage') === 'Fromage (aliment moyen)', det(R.sansForme));
  /* — l'explicite gagne TOUJOURS — */
  for (const q of EXPLICITES) {
    const e = R.expl[q];
    t('B-CDXXXIV EXPLICITE « ' + q + ' » : 1ᵉʳ résultat porte ' + det(e.formes) + ', aucun profil, aucune forme nommée évitée',
      e.formes.length > 0 && e.top && e.formes.every(f => e.topFormes.includes(f)) && e.profil === null && e.evitesNommes.length === 0, det(e));
  }
  t('B-CDXXXIV AMBIGU « riz sec » : forme nommée respectée (sec), AUCUNE équivalence avec « cru » — le riz cru n\'est pas proposé à sa place',
    det(R.expl['riz sec'].formes) === '["seche"]' && !/\bcuit/.test(R.expl['riz sec'].top) && R.expl['riz sec'].top !== 'Riz blanc, cru'
    && R.expl['raisin sec'].top === 'Raisin sec', det({ rs: R.expl['riz sec'].top, ra: R.expl['raisin sec'].top }));
  t('B-CDXXXIV DÉTERMINISME : génériques et explicites, avec ET sans alias — identiques 3 fois, sur 3 bases mélangées et l\'inverse',
    R.det.repete && R.det.perm.length === 4 && R.det.perm.every(x => x === true), det(R.det));
  t('B-CDXXXIV aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};
