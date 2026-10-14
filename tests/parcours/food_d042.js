/* ══════════════════════════════════════════════════════════════════════════════════════
   🍽️ NUT-D042-01 — D-042 : LE GÉNÉRIQUE PERTINENT AVANT LE FAST-FOOD, LA MARQUE QUAND ON LA NOMME
   (11/10/2026, session-B, mission de Michel) — blocs B-D42-A (structure) · B-D42-B (corpus par la VRAIE FRAPPE) ·
   B-D42-J (« Déjà noté par toi » : non-régression) · B-D42-T (le tout premier affichage, ordre stable).

   ⚖️ LA DÉCISION (Michel, 03/10, confirmée le 10/10, `docs/DECISIONS.md` D-042) :
     · requête GÉNÉRIQUE (« poulet », « fromage », « coca », « tenders »…) → un aliment générique PERTINENT passe
       AVANT le fast-food et les marques, QUAND il existe — on n'en invente jamais un ;
     · intention de MARQUE / de PRODUIT explicite (« Coca-Cola », « Big Mac », « Whopper », « KFC », « KFC tenders »,
       « O'Tacos ») → l'intention est conservée : la marque reste devant ;
     · « Coca-Cola » = marque · « coca » = générique ;
     · la FORME nommée est conservée (cru, cuit, séché, poudre…) — aucune règle universelle cuit > cru ;
     · « Déjà noté par toi » N'EST PAS MODIFIÉ : il reste au-dessus quand il répond, et ses faux amis connus
       (œuf → « Bœuf haché », lait → « Laitue », pomme → « Pomme de terre vapeur ») restent EXACTEMENT ceux de master
       (PRÉEXISTANT / INCHANGÉ — leur correction est un chantier séparé) ;
     · aucune pop-up.
   ⭐ CE QUI EST CONDUIT : le vrai champ `#af-desc`, notifié (`input`) — `_afSuggInput` comme sous le doigt — et ce
   qui est LU, c'est le HTML réellement rendu. Le harnais est celui de FS-05B (`food_multisource.js`), réutilisé (R2).
   ⛔ Open Food Facts n'est JAMAIS appelé pour de vrai (réponse figée « vide »). Contrôle négatif : `tools/mut_food_d042.py`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const MS = require('./food_multisource.js');

/* Le journal personnel amorcé pour la section « Déjà noté par toi » — des données fictives, aucun compte réel. */
const JOURNAL = [
  { id: 'd42j0001', name: 'Poulet rôti maison', kcal: 215, prot: 27, carbs: 0, fat: 12, ts: 1790000000000, date: '2026-10-08', meal: 'dej', grams: 150 },
  { id: 'd42j0002', name: 'Bœuf haché 5%', kcal: 125, prot: 21, carbs: 0, fat: 5, ts: 1790000100000, date: '2026-10-08', meal: 'din', grams: 100 },
  { id: 'd42j0003', name: 'Laitue', kcal: 15, prot: 1, carbs: 2, fat: 0, ts: 1790000200000, date: '2026-10-09', meal: 'dej', grams: 80 },
  { id: 'd42j0004', name: 'Pomme de terre vapeur', kcal: 80, prot: 2, carbs: 17, fat: 0, ts: 1790000300000, date: '2026-10-09', meal: 'din', grams: 200 },
  { id: 'd42j0005', name: 'Fromage blanc 0%', kcal: 45, prot: 8, carbs: 4, fat: 0, ts: 1790000400000, date: '2026-10-10', meal: 'pdj', grams: 100 },
];
MS.CTX.journal = { alias: true, off: true, marques: true, ciqual: true, journal: JOURNAL };

/* ⛔ « Déjà noté par toi », figé tel que MASTER `b280ea5d` le rend (mesuré le 11/10, vraie page, journal ci-dessus).
   Les trois faux amis sont des défauts CONNUS, hors de ce lot : ils doivent rester identiques — ni corrigés en passant,
   ni aggravés. */
const LOC_MASTER = {
  poulet: ['Poulet rôti maison'],
  oeuf: ['Bœuf haché 5%'],
  lait: ['Laitue'],
  pomme: ['Pomme de terre vapeur'],
  fromage: ['Fromage blanc 0%'],
  coca: [],
  salade: [],
};

const G = (id, q, extra) => Object.assign({ id, q, cat: 'generique', kind: 'generique', sources: ['FF', 'CIQ'], ctx: 'en', niveau: 'MUST', source: 'D-042' }, extra);
const M = (id, q, extra) => Object.assign({ id, q, cat: 'marque', kind: 'marque-explicite', sources: ['FF', 'CIQ'], ctx: 'en', niveau: 'MUST', source: 'D-042' }, extra);
const F = (id, q, re1, raison) => ({ id, q, cat: 'forme', kind: 'explicite', sources: ['CIQ'], ctx: 'en', niveau: 'MUST', source: 'D-042 / FS-02', presents: ['CIQ'], ciq: { re1 }, raison });
const AVANT_GEN = [['CIQ', 'FF']], AVANT_MARQUE = [['FF', 'CIQ']];
/* ⚠️ Dans les expressions ci-dessous, jamais `\b` après une lettre accentuée : pour JavaScript, « é » n'est pas un
   caractère de mot, donc « ^Café\b » ne reconnaît JAMAIS « Café, … » (mesuré : un rouge d'oracle, pas de moteur). */

const CAS = [
  /* ── A. REQUÊTES GÉNÉRIQUES : le générique pertinent AVANT le fast-food (quand les deux répondent) ── */
  G('D42-001', 'poulet', { avant: AVANT_GEN, ciq: { re1: '^Poulet\\b' }, raison: 'le poulet générique avant les Tenders KFC' }),
  G('D42-002', 'fromage', { avant: AVANT_GEN, ciq: { re1: '^Fromage \\(aliment moyen\\)' }, raison: 'le fromage générique — jamais « Fromage de tête » — avant les pizzas Domino\'s (protection FS-01)' }),
  G('D42-003', 'salade', { avant: AVANT_GEN, ciq: { re1: '^Salade verte' }, raison: 'la salade verte avant les salades Quick' }),
  G('D42-004', 'pâtes', { avant: AVANT_GEN, ciq: { re1: '^Pâtes\\b' }, raison: 'les pâtes avant les pizzas « pâte fine » (correspondance lexicale fast-food)' }),
  G('D42-005', 'oeuf', { avant: AVANT_GEN, ciq: { re1: '^Oeuf\\b' }, raison: 'l\'œuf avant le « Qarré bœuf » (faux rapprochement fast-food)' }),
  G('D42-006', 'riz', { sources: ['CIQ'], presents: ['CIQ'], absents: ['FF'], ciq: { re1: '^Riz\\b' }, raison: 'riz : seul le générique répond' }),
  G('D42-007', 'pomme', { sources: ['CIQ'], presents: ['CIQ'], ciq: { re1: '^Pomme, chair' }, raison: 'pomme générique : la pomme fraîche, jamais la pomme séchée ni la pomme de terre (FS-01)' }),
  G('D42-008', 'café', { sources: ['CIQ'], presents: ['CIQ'], ciq: { re1: '^Café[ ,](?!.*(moulu|poudre|soluble))' }, raison: 'café générique : la boisson, pas la poudre ni le moulu (FS-01)' }),
  G('D42-009', 'thé', { sources: ['CIQ'], presents: ['CIQ'], ciq: { re1: '^Thé[ ,](?!.*feuille)' }, raison: 'thé générique : la boisson, pas la feuille (FS-01)' }),
  G('D42-010', 'coca', { avant: AVANT_GEN, ciq: { re1: '^Cola\\b' }, raison: '« coca » = générique (décision de Michel) : le cola avant le Coca-Cola de Quick' }),
  G('D42-011', 'tenders', { sources: ['FF'], presents: ['FF'], absents: ['CIQ'], raison: 'tenders : aucun générique en local — on n\'en invente pas, le fast-food s\'affiche seul' }),
  G('D42-012', 'tacos', { sources: [], vide: true, raison: 'tacos : rien en local — on n\'invente rien (Open Food Facts figé vide)' }),
  G('D42-013', 'burger', { avant: AVANT_GEN, ciq: { re1: '^Hamburger\\b' }, raison: 'burger générique avant les burgers d\'enseigne' }),
  G('D42-014', 'frites', { avant: AVANT_GEN, raison: 'les frites génériques avant les frites d\'enseigne' }),
  G('D42-015', 'pizza', { avant: AVANT_GEN, ciq: { re1: '^Pizza\\b' }, raison: 'la pizza générique avant Domino\'s' }),
  G('D42-016', 'cheeseburger', { avant: AVANT_GEN, raison: 'un nom de plat courant n\'est pas une marque' }),
  G('D42-017', 'hamburger', { avant: AVANT_GEN, raison: 'un nom de plat courant n\'est pas une marque' }),
  G('D42-018', 'nem', { avant: AVANT_GEN, raison: 'le nem générique avant les « accompagnements » Quick (faux rapprochement)' }),
  G('D42-019', 'mayonnaise', { avant: AVANT_GEN, raison: 'la mayonnaise générique avant la dosette Quick' }),
  G('D42-020', 'nuggets', { sources: ['CIQ'], presents: ['CIQ'], ciq: { re1: '^Nuggets\\b' }, raison: 'nuggets : le générique répond' }),
  /* ── B. INTENTION DE MARQUE / DE PRODUIT EXPLICITE : la marque reste devant ── */
  M('D42-030', 'Coca-Cola', { avant: AVANT_MARQUE, ff: { re1: '^Coca-Cola' }, raison: '« Coca-Cola » = marque (décision de Michel)' }),
  M('D42-031', 'coca cola', { avant: AVANT_MARQUE, ff: { re1: '^Coca-Cola' }, raison: 'la même marque, sans tiret' }),
  M('D42-032', 'Big Mac', { avant: AVANT_MARQUE, ff: { re1: '^Big Mac' }, raison: 'produit propre à une enseigne (décision de Michel)' }),
  M('D42-033', 'Whopper', { avant: AVANT_MARQUE, ff: { re1: '^Whopper' }, raison: 'produit propre à une enseigne (décision de Michel)' }),
  M('D42-034', 'KFC', { avant: AVANT_MARQUE, ff: { tous: '· KFC$' }, raison: 'l\'enseigne nommée' }),
  M('D42-035', 'KFC tenders', { sources: ['FF'], presents: ['FF'], absents: ['CIQ'], ff: { tous: '· KFC$' }, raison: 'exemple de Michel' }),
  M('D42-036', 'poulet KFC', { sources: ['FF'], presents: ['FF'], absents: ['CIQ'], ff: { tous: '· KFC$' }, raison: 'exemple de Michel (D-042)' }),
  M('D42-037', 'O’Tacos', { sources: [], vide: true, raison: 'enseigne sans produit dans la base : rien d\'inventé' }),
  M('D42-038', 'mcdo', { avant: AVANT_MARQUE, ff: { tous: '· McDonald\'s$' }, raison: 'l\'enseigne, dite comme on la dit' }),
  M('D42-039', 'quick', { avant: AVANT_MARQUE, ff: { tous: '· Quick$' }, raison: 'l\'enseigne nommée' }),
  M('D42-040', 'burger king', { avant: AVANT_MARQUE, ff: { tous: '· Burger King$' }, raison: 'l\'enseigne nommée' }),
  M('D42-041', 'mcchicken', { avant: AVANT_MARQUE, ff: { re1: '^McChicken' }, raison: 'produit propre à une enseigne' }),
  M('D42-042', 'frites mcdo', { sources: ['FF'], presents: ['FF'], ff: { tous: '· McDonald\'s$' }, raison: 'aliment + enseigne : l\'intention de marque' }),
  /* ── C. FORMES NOMMÉES : la forme demandée gagne, jamais écrasée ── */
  F('D42-050', 'riz cru', '^Riz\\b.*\\bcru\\b', 'riz cru reste cru'),
  F('D42-051', 'riz cuit', '^Riz\\b.*\\bcuit', 'riz cuit reste cuit'),
  F('D42-052', 'pâtes crues', '^Pâtes\\b.*\\bcrues\\b', 'pâtes crues restent crues'),
  F('D42-053', 'pâtes cuites', '^Pâtes\\b.*\\bcuites\\b', 'pâtes cuites restent cuites'),
  F('D42-054', 'poulet cru', '^Poulet\\b.*\\bcrue?s?\\b', 'poulet cru reste cru (pas de cuit > cru universel)'),
  F('D42-055', 'poulet cuit', '^Poulet\\b.*\\b(cuit|cuite|rôtie?)\\b', 'poulet cuit reste cuit'),
  F('D42-056', 'café poudre', '^Café[ ,].*\\b(poudre|soluble)\\b', 'la poudre demandée'),
  F('D42-057', 'café moulu', '^Café, moulu', 'le moulu demandé'),
  F('D42-058', 'thé infusé', '^Thé infusé', 'la boisson demandée'),
  F('D42-059', 'pomme séchée', '^Pomme, sèche', 'la pomme séchée demandée (FS-01)'),
  /* ── D. HORS LIGNE (table d'alias non chargée) : le fast-food est local, la règle tient ── */
  G('D42-070', 'poulet', { ctx: 'hors', avant: AVANT_GEN, ciq: { re1: '^Poulet\\b' }, raison: 'hors ligne aussi' }),
  G('D42-071', 'fromage', { ctx: 'hors', avant: AVANT_GEN, ciq: { re1: '^Fromage \\(aliment moyen\\)' }, raison: 'hors ligne : jamais « Fromage de tête » (FS-01)' }),
  G('D42-072', 'salade', { ctx: 'hors', avant: AVANT_GEN, raison: 'hors ligne aussi' }),
  G('D42-073', 'pâtes', { ctx: 'hors', avant: AVANT_GEN, ciq: { re1: '^Pâtes\\b' }, raison: 'hors ligne aussi' }),
  G('D42-074', 'oeuf', { ctx: 'hors', avant: AVANT_GEN, ciq: { re1: '^Oeuf\\b' }, raison: 'hors ligne aussi' }),
  G('D42-075', 'coca', { ctx: 'hors', avant: AVANT_GEN, ciq: { re1: '^Cola\\b' }, raison: 'hors ligne aussi' }),
  M('D42-076', 'Big Mac', { ctx: 'hors', avant: AVANT_MARQUE, ff: { re1: '^Big Mac' }, raison: 'hors ligne : la marque reste devant' }),
  /* ── E. SOURCE ABSENTE : rien n'est inventé ── */
  G('D42-080', 'poulet', { ctx: 'sans-ciqual', sources: ['FF'], presents: ['FF'], absents: ['CIQ'], raison: 'sans CIQUAL, on n\'invente pas de générique : le fast-food s\'affiche' }),
  G('D42-081', 'poulet', { ctx: 'sans-marques', sources: ['CIQ'], presents: ['CIQ'], absents: ['FF'], ciq: { re1: '^Poulet\\b' }, raison: 'sans fast-food, le générique seul' }),
  /* ── G. PERTINENCE (critère D) : le générique ne passe devant que s'il EST pertinent. Mesuré le 11/10 sur les 117
     requêtes tirées des noms du fast-food : la 1ʳᵉ version de D-042 (CIQUAL non vide et pas de marque) mettait
     27 fois devant un aliment qui ne porte même pas le mot tapé — ces cas sont verts sur master et rougissaient
     sur cette 1ʳᵉ version : ce sont les témoins de ce qui a été corrigé avant tout commit. ── */
  G('D42-100', 'wings', { avant: AVANT_MARQUE, ff: { re1: 'Hot Wings' }, raison: '« wings » : aucun générique pertinent (le 1ᵉʳ CIQUAL est un chewing-gum) — le fast-food reste devant' }),
  G('D42-101', 'rings', { avant: AVANT_MARQUE, ff: { re1: 'Rings' }, raison: '« rings » : le 1ᵉʳ CIQUAL est une meringue — pas un générique pertinent' }),
  G('D42-102', 'cheese', { avant: AVANT_MARQUE, ff: { re1: '^Cheeseburger' }, raison: '« cheese » : le 1ᵉʳ CIQUAL est un cheesecake — pas un générique pertinent' }),
  G('D42-103', 'big', { kind: 'partiel', avant: AVANT_MARQUE, ff: { re1: '^Big Mac' }, raison: 'en tapant « big mac » : un bigorneau ne passe pas devant le Big Mac' }),
  G('D42-104', 'mayo', { avant: AVANT_GEN, ciq: { re1: '^Mayonnaise\\b' }, raison: 'la table d\'alias a décidé que « mayo » est la mayonnaise : générique pertinent, il passe devant' }),
  G('D42-105', 'carottes', { avant: AVANT_GEN, ciq: { re1: '^Carotte\\b' }, raison: 'le pluriel retrouve le générique en mot entier (FS-01) : il passe devant les « Funny Carottes »' }),
  G('D42-106', 'fish burger', { avant: AVANT_GEN, ciq: { re1: '^Burger au poisson' }, raison: 'alias : le burger au poisson générique avant le Long Fish' }),
  /* ── F. « DÉJÀ NOTÉ PAR TOI » (journal amorcé) : au-dessus de tout quand il répond ; D-042 vient dessous ── */
  G('D42-090', 'poulet', { ctx: 'journal', avant: [['LOC', 'CIQ'], ['CIQ', 'FF']], presents: ['LOC'], loc: LOC_MASTER.poulet, raison: 'vraie correspondance : « Déjà noté » en tête, puis le générique, puis le fast-food' }),
  G('D42-091', 'oeuf', { ctx: 'journal', avant: [['LOC', 'CIQ'], ['CIQ', 'FF']], presents: ['LOC'], loc: LOC_MASTER.oeuf, raison: 'faux ami « Bœuf haché » : PRÉEXISTANT, INCHANGÉ (hors lot)' }),
  G('D42-092', 'lait', { ctx: 'journal', sources: ['CIQ'], avant: [['LOC', 'CIQ']], presents: ['LOC'], loc: LOC_MASTER.lait, raison: 'faux ami « Laitue » : PRÉEXISTANT, INCHANGÉ (hors lot)' }),
  G('D42-093', 'pomme', { ctx: 'journal', sources: ['CIQ'], avant: [['LOC', 'CIQ']], presents: ['LOC'], loc: LOC_MASTER.pomme, ciq: { re1: '^Pomme, chair' }, raison: 'faux ami « Pomme de terre vapeur » : PRÉEXISTANT, INCHANGÉ (hors lot)' }),
  G('D42-094', 'fromage', { ctx: 'journal', avant: [['LOC', 'CIQ'], ['CIQ', 'FF']], presents: ['LOC'], loc: LOC_MASTER.fromage, raison: 'journal en tête, puis D-042' }),
  M('D42-095', 'Coca-Cola', { ctx: 'journal', avant: AVANT_MARQUE, absents: ['LOC'], raison: 'marque : aucune ligne du journal ne répond, la marque devant' }),
];
const NOMS_CTX = ['en', 'hors', 'sans-ciqual', 'sans-marques', 'journal'];

module.exports.source = function (t) {
  console.log('\n═══ B-D42-A. NUT-D042-01 — la structure du corpus D-042 (données) ═══');
  const ids = CAS.map(c => c.id);
  t('B-D42-A ① ' + CAS.length + ' cas, identifiants uniques (D42-nnn), tous MUST (une décision de Michel), chacun avec sa raison',
    new Set(ids).size === ids.length && ids.every(i => /^D42-\d{3}$/.test(i)) && CAS.every(c => c.niveau === 'MUST' && c.raison && NOMS_CTX.includes(c.ctx)), String(CAS.length));
  t('B-D42-A ② le corpus couvre le minimum demandé : génériques (poulet, fromage, salade, pâtes, oeuf, riz, pomme, café, thé, coca, tenders, tacos), marques (Coca-Cola, Big Mac, Whopper, KFC tenders, KFC, O\'Tacos), formes (cru / cuit / séché / poudre / infusé)',
    ['poulet', 'fromage', 'salade', 'pâtes', 'oeuf', 'riz', 'pomme', 'café', 'thé', 'coca', 'tenders', 'tacos', 'Coca-Cola', 'Big Mac', 'Whopper', 'KFC tenders', 'KFC', 'O’Tacos', 'riz cru', 'riz cuit', 'pomme séchée']
      .every(q => CAS.some(c => c.q === q)), '');
  t('B-D42-A ③ le critère D (« un résultat RÉELLEMENT pertinent ») a ses témoins dans les deux sens : un CIQUAL non pertinent ne passe jamais devant (wings, rings, cheese, big), un générique pertinent par alias ou par pluriel passe devant (mayo, carottes, fish burger)',
    ['wings', 'rings', 'cheese', 'big'].every(q => CAS.some(c => c.q === q && JSON.stringify(c.avant) === JSON.stringify(AVANT_MARQUE)))
      && ['mayo', 'carottes', 'fish burger'].every(q => CAS.some(c => c.q === q && JSON.stringify(c.avant) === JSON.stringify(AVANT_GEN))), '');
};

/* Les contrôles propres à D-042, en plus de ceux du harnais FS-05B (`juger`) : le contenu EXACT de « Déjà noté ». */
function jugerD42(c, o) {
  const ko = MS.juger(c, o);
  if (c.loc) {
    const loc = o.lignes.filter(l => l.src === 'LOC').map(l => l.titre);
    if (JSON.stringify(loc) !== JSON.stringify(c.loc)) ko.push('« Déjà noté » ' + JSON.stringify(loc) + ' ≠ master ' + JSON.stringify(c.loc));
  }
  return ko;
}

module.exports.ecran = async function (t, b, PORT) {
  const P = await MS.executer(b, PORT, CAS, false);
  console.log('\n-- B-D42-B. NUT-D042-01 — D-042 par la VRAIE FRAPPE (génériques, marques, formes, hors ligne, sources absentes, journal) --');
  for (const c of CAS) {
    const o = P.obs[c.id], ko = o ? jugerD42(c, o) : ['non joué'];
    const vu = o ? JSON.stringify({ sections: o.sections, lignes: o.lignes.slice(0, 3).map(l => l.src + ':' + l.titre) }) : '';
    t('B-D42-B ' + c.id + ' ' + (c.ctx !== 'en' ? c.ctx.toUpperCase() + ' ' : '') + '« ' + c.q + ' » — ' + c.raison, ko.length === 0, JSON.stringify(ko) + ' ' + vu);
  }
  t('B-D42-B aucune erreur de page, aucune requête hors du cas en cours', !P.errs.length && !P.anomalies.length, JSON.stringify(P.errs.concat(P.anomalies).slice(0, 3)));
  await module.exports.journal(t, b, PORT);
  await module.exports.premierAffichage(t, b, PORT);
};

/* B-D42-J — LA COUCHE « DÉJÀ NOTÉ PAR TOI » N'EST PAS MODIFIÉE : `_afSuggLocales` rend, requête par requête, exactement
   ce que master rendait (faux amis compris). Lu dans la page, au niveau du propriétaire. */
module.exports.journal = async function (t, b, PORT) {
  console.log('\n-- B-D42-J. NUT-D042-01 — « Déjà noté par toi » : non-régression (PRÉEXISTANT / INCHANGÉ) --');
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => rt.abort());
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_d42j'))return; sessionStorage.setItem('_d42j','1'); localStorage.clear();
    localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
    localStorage.setItem('ft4_foodlog', ${JSON.stringify(JSON.stringify(JOURNAL))}); }catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1800);
  const vu = await pg.evaluate(Q => { const o = {}; Q.forEach(q => { o[q] = _afSuggLocales(q).map(e => e.name); }); return o; }, Object.keys(LOC_MASTER));
  const diff = Object.keys(LOC_MASTER).filter(q => JSON.stringify(vu[q]) !== JSON.stringify(LOC_MASTER[q]));
  t('B-D42-J ⛔ `_afSuggLocales` rend EXACTEMENT ce que master rendait pour poulet, oeuf, lait, pomme, fromage, coca, salade — les faux amis (œuf → « Bœuf haché », lait → « Laitue », pomme → « Pomme de terre vapeur ») restent PRÉEXISTANTS / INCHANGÉS',
    diff.length === 0 && !errs.length, JSON.stringify(diff.map(q => q + ' → ' + JSON.stringify(vu[q]))) + ' ' + errs.join(' | '));
  await cx.close();
};

/* B-D42-T — LE TOUT PREMIER AFFICHAGE : à la première recherche après l'ouverture, les fichiers locaux arrivent dans
   un ordre quelconque. Pour une requête générique, le fast-food ne doit JAMAIS s'afficher sans le générique pertinent
   au-dessus de lui — sinon la liste « saute » sous le doigt (le défaut que FS-01 a fermé pour la table d'alias). On
   enregistre CHAQUE rendu de `#af-sugg` (MutationObserver), fichier CIQUAL ralenti exprès. */
module.exports.premierAffichage = async function (t, b, PORT) {
  console.log('\n-- B-D42-T. NUT-D042-01 — le premier affichage : jamais le fast-food seul avant le générique --');
  for (const [q, delai] of [['poulet', 700], ['coca', 700], ['Big Mac', 700]]) {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => rt.abort());
    await cx.route(/data\/ciqual\.json/, async rt => { await new Promise(r => setTimeout(r, delai)); try { await rt.continue(); } catch (e) {} });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_d42t'))return; sessionStorage.setItem('_d42t','1'); localStorage.clear();
      localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99'); }catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const etats = await pg.evaluate(async q => {
      document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); openAddFood();
      await new Promise(r => setTimeout(r, 200));
      const el = document.getElementById('af-sugg'), etats = [];
      const lis = () => { const SRC = { Marque: 'FF', Ciqual: 'CIQ', Off: 'OFF', Locale: 'LOC' }, s = [];
        [...el.querySelectorAll('button')].forEach(b => { const m = (b.getAttribute('onclick') || '').match(/_afSuggPrendre(\w+)\(/);
          const x = m ? SRC[m[1]] : '?'; if (s[s.length - 1] !== x) s.push(x); }); return s.join(','); };
      new MutationObserver(() => { const v = lis(); if (v && etats[etats.length - 1] !== v) etats.push(v); }).observe(el, { childList: true, subtree: true });
      const inp = document.getElementById('af-desc'); inp.value = q; inp.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 2500));
      return etats;
    }, q);
    const marque = q === 'Big Mac';
    const fautifs = marque ? etats.filter(e => e.split(',').indexOf('CIQ') >= 0 && e.split(',').indexOf('FF') >= 0 && e.split(',').indexOf('CIQ') < e.split(',').indexOf('FF'))
      : etats.filter(e => { const s = e.split(','), i = s.indexOf('FF'), j = s.indexOf('CIQ'); return i >= 0 && (j < 0 || j > i); });
    t('B-D42-T « ' + q + ' » (1ʳᵉ recherche, CIQUAL arrivé ' + delai + ' ms après) — ' + (marque ? 'marque : le fast-food reste devant à CHAQUE rendu' : 'générique : aucun rendu ne montre le fast-food sans le générique au-dessus') + ', et l\'état final est ' + (marque ? 'FF puis CIQ' : 'CIQ puis FF'),
      fautifs.length === 0 && etats.length > 0 && etats[etats.length - 1] === (marque ? 'FF,CIQ' : 'CIQ,FF') && !errs.length, JSON.stringify(etats) + ' ' + errs.join(' | '));
    await cx.close();
  }
};

module.exports.CAS = CAS;
module.exports.LOC_MASTER = LOC_MASTER;
