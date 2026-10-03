/* ══════════════════════════════════════════════════════════════════════════════════════
   📚 FOOD SEMANTICS V1 — FS-05 : LE BANC DU CORPUS DE RÉFÉRENCE
   (03/10/2026, session-B, demande de Michel) — blocs B-CDXXXVIII (structure du corpus) · B-CDXXXIX (le corpus
   conduit sur la vraie base, en ligne et hors ligne) · B-CDXL (déterminisme).

   Le corpus (`food_reference_corpus.js`) est de la DONNÉE ; ce fichier l'exécute. Il ne mesure que des
   fonctions déjà publiques du moteur — `_ciqualChercher`, `_fsFormesDuTexte`, `_fsBadgeForme` — et ne modifie
   rien. Les MUST et les SHOULD rougissent ; les KNOWN_LIMITATION ne rougissent JAMAIS : le banc dit
   « toujours observée » ou « LEVÉE — à reclasser » (une limite levée est une bonne nouvelle à décider, pas
   une régression). ⛔ Et une limite connue ne devient pas une règle : la liste ci-dessous les fige comme
   limites (contrôle négatif M14).
   Contrôle négatif : `tools/mut_food_reference.py`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const { CAS } = require('./food_reference_corpus.js');

/* ⛔ LES LIMITES CONNUES, NOMMÉES : elles doivent rester KNOWN_LIMITATION (jamais MUST / SHOULD). */
const LIMITES = ['riz sec|en', 'riz complet|hors', 'semoule|hors', 'pomme de terre|hors', 'lentilles|hors', 'raisin|hors',
  'fruits rouges|en', 'tomate|hors', 'eau|hors', 'jus d orange|en', 'thon en boite|hors', 'oeufs|hors', 'camembert|en',
  'crème fraîche|en', 'spaghetti bolognaise|hors', 'bolognaise|en', 'pomme cuite|en'];
/* Les cas OBLIGATOIRES de la demande (cas historiques) : chacun doit exister en MUST ou SHOULD. */
const HISTORIQUES = ['pomme', 'haricots verts', 'café', 'thé', 'courgette', 'poire', 'raisin', 'riz', 'pâtes', 'carbonara', 'curry'];
/* Le mapping FS-04 à préserver (aucune forme nouvelle). */
const MAPPING = { cru: 'Cru', cuit: 'Cuit', seche: 'Sec / séché', poudre: 'Poudre / moulu', feuille: 'Feuilles', boisson: 'Boisson',
  puree: 'Purée', sauce: 'Sauce', prepare: 'Préparé', partie: 'Blanc ou jaune d’œuf', surgele: 'Surgelé', conserve: 'Conserve' };

module.exports.source = function (t) {
  console.log('\n═══ B-CDXXXVIII. FS-05 — la structure du corpus (données) ═══');
  const ids = CAS.map(c => c.id), niveaux = { MUST: 0, SHOULD: 0, KNOWN_LIMITATION: 0 };
  CAS.forEach(c => { niveaux[c.niveau] = (niveaux[c.niveau] || 0) + 1; });
  const CHAMPS = ['nom', 're', 'pasNom', 'forme', 'formeContient', 'porte', 'top', 'jamais', 'vide'];
  t('B-CDXXXVIII ① ' + CAS.length + ' cas (100 → 150), identifiants uniques et stables (FR-nnn)',
    CAS.length >= 100 && CAS.length <= 150 && new Set(ids).size === ids.length && ids.every(i => /^FR-\d{3}$/.test(i)), String(CAS.length));
  t('B-CDXXXVIII ② chaque cas dit sa requête, sa catégorie, son type, son mode (en / hors), son niveau, sa source, sa raison — et contrôle au moins une chose',
    CAS.every(c => c.q && c.cat && c.kind && ['en', 'hors'].includes(c.mode) && ['MUST', 'SHOULD', 'KNOWN_LIMITATION'].includes(c.niveau)
      && c.source && c.raison && CHAMPS.some(k => k in c)),
    CAS.filter(c => !(c.q && c.cat && c.kind && c.source && c.raison && CHAMPS.some(k => k in c))).map(c => c.id).join(' '));
  t('B-CDXXXVIII ③ les libellés de forme attendus n\'emploient QUE le mapping FS-04 (aucune forme nouvelle)',
    CAS.every(c => ['forme', 'formeContient'].every(k => !(k in c) || c[k] === '' || c[k].split(' · ').every(l => Object.values(MAPPING).includes(l)))),
    '');
};

module.exports.ecran = async function (t, b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => rt.abort());
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_fs05'))return; sessionStorage.setItem('_fs05','1');
    localStorage.clear(); localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99'); }catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1800);
  /* ⭐ L'ÉVALUATION SE FAIT DANS LA PAGE, PAR LE CODE SERVI ; `_alias = null` = la table indisponible (hors ligne),
     exactement comme le runner CCXXIII. Aucun historique, aucun profil personnel : la page est vierge. */
  const R = await pg.evaluate(async (CAS) => {
    await _ciqualCharger(); await _aliasCharger();
    /* Garde de harnais : sur un code sans FS-02 / FS-04 (M00 = master), l'absence de la fonction rend « rien » au
       lieu de planter — les témoins du corpus rougissent alors un par un, ce qui est la vraie mesure. */
    const badge = n => typeof _fsBadgeForme === 'function' ? _fsBadgeForme(n).replace(/<[^>]+>/g, '') : '';   // le TEXTE affiché par FS-04
    const formesDe = n => typeof _fsFormesDuTexte === 'function' ? _fsFormesDuTexte(n) : [];
    const juger = (c) => {
      const r = (_ciqualChercher(c.q, 6) || []).map(a => a[1]); const p = r[0] || '', ko = [];
      if (c.vide) { if (r.length) ko.push('attendu vide'); }
      else if (!p) ko.push('aucun résultat');
      if ('nom' in c && p !== c.nom) ko.push('nom');
      if ('re' in c && !new RegExp(c.re).test(p)) ko.push('re');
      if ('pasNom' in c && p === c.pasNom) ko.push('pasNom');
      if ('forme' in c && badge(p) !== c.forme) ko.push('forme=' + badge(p));
      if ('formeContient' in c && !badge(p).split(' · ').includes(c.formeContient)) ko.push('formeContient');
      if ('porte' in c && !c.porte.every(f => formesDe(p).includes(f))) ko.push('porte');
      if ('top' in c && !r.slice(1, c.top.n).some(x => new RegExp(c.top.re).test(x))) ko.push('top');
      if ('jamais' in c && r.slice(0, c.jamais.n).some(x => new RegExp(c.jamais.re).test(x))) ko.push('jamais');
      return { ok: ko.length === 0, ko, top: r.slice(0, 3), forme: p ? badge(p) : '' };
    };
    const tout = () => { const o = {}; const g = _alias;
      for (const c of CAS) { _alias = c.mode === 'hors' ? null : g; try { o[c.id] = juger(c); } finally { _alias = g; } }
      return o; };
    const res = tout();
    /* ⭐ DÉTERMINISME : le corpus entier, rejoué 2 fois puis sur 3 bases mélangées et l'inverse. */
    const sig = o => Object.keys(o).sort().map(k => k + ':' + o[k].ok + ':' + o[k].top.join('|') + ':' + o[k].forme).join('\n');
    const ref = sig(res), rep = [sig(tout()), sig(tout())].every(x => x === ref);
    const orig = _ciqual.a.slice(); let graine = 41; const perm = [];
    const hasard = () => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine / 2147483648; };
    for (let k = 0; k < 3; k++) { const c = orig.slice(); for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(hasard() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
      _ciqual.a = c; perm.push(sig(tout()) === ref); }
    _ciqual.a = orig.slice().reverse(); perm.push(sig(tout()) === ref); _ciqual.a = orig;
    return { res, det: { rep, perm } };
  }, CAS);
  console.log('\n-- B-CDXXXIX. FS-05 — le corpus conduit sur la vraie base (en ligne et hors ligne) --');
  const det = o => JSON.stringify(o);
  for (const c of CAS) {
    const r = R.res[c.id], tag = c.id + ' [' + c.niveau + '] ' + (c.mode === 'hors' ? 'HORS LIGNE ' : '') + '« ' + c.q + ' » — ' + c.raison;
    if (c.niveau === 'KNOWN_LIMITATION') {
      console.log((r.ok ? '   ℹ️  LIMITE CONNUE, toujours observée — ' : '   🟢 LIMITE LEVÉE — à reclasser (pas un rouge) — ') + tag + (r.ok ? '' : '  >> ' + det(r.top)));
      continue;
    }
    t('B-CDXXXIX ' + tag, r.ok, det({ ko: r.ko, top: r.top }));
  }
  /* ⛔ M14 : une limite connue ne devient pas une règle — la liste nommée reste KNOWN_LIMITATION. */
  const parCle = {}; CAS.forEach(c => { (parCle[c.q + '|' + c.mode] = parCle[c.q + '|' + c.mode] || []).push(c.niveau); });
  t('B-CDXXXIX les ' + LIMITES.length + ' limites connues restent KNOWN_LIMITATION — aucune n\'est devenue MUST ou SHOULD',
    LIMITES.every(k => (parCle[k] || []).includes('KNOWN_LIMITATION'))
    && CAS.filter(c => c.niveau === 'KNOWN_LIMITATION').every(c => LIMITES.includes(c.q + '|' + c.mode))
    && CAS.filter(c => c.niveau !== 'KNOWN_LIMITATION').every(c => !LIMITES_INTERDITES(c)),
    det(LIMITES.filter(k => !(parCle[k] || []).includes('KNOWN_LIMITATION'))));
  t('B-CDXXXIX les ' + HISTORIQUES.length + ' cas historiques de la demande sont couverts : un contrat (MUST / SHOULD) en ligne, et un cas hors ligne',
    HISTORIQUES.every(q => (parCle[q + '|en'] || []).some(n => n !== 'KNOWN_LIMITATION') && (parCle[q + '|hors'] || []).length > 0),
    det(HISTORIQUES.filter(q => !((parCle[q + '|en'] || []).some(n => n !== 'KNOWN_LIMITATION') && (parCle[q + '|hors'] || []).length))));
  console.log('\n-- B-CDXL. FS-05 — déterminisme du corpus --');
  t('B-CDXL le corpus entier (' + CAS.length + ' cas, en ligne et hors ligne) rend le même verdict, le même top 3 et le même libellé : 2 fois de plus, sur 3 bases mélangées et l\'inverse',
    R.det.rep && R.det.perm.length === 4 && R.det.perm.every(Boolean), det(R.det));
  t('B-CDXL aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};

/* Une limite connue « déguisée » en contrat : le même cas (requête + mode) porterait le MÊME contrôle qu'une
   limite, mais au niveau MUST / SHOULD — c'est exactement la promotion silencieuse que M14 simule. */
function LIMITES_INTERDITES(c) {
  const lim = CAS.find(x => x.q === c.q && x.mode === c.mode && x.niveau === 'KNOWN_LIMITATION');
  if (!lim) return false;
  return ['nom', 're', 'vide', 'forme'].some(k => k in lim && k in c && JSON.stringify(lim[k]) === JSON.stringify(c[k]));
}
