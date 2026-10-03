/* ══════════════════════════════════════════════════════════════════════════════════════
   🧭 FOOD SEMANTICS V1 — FS-05B : LE BANC MULTI-SOURCE DE LA RECHERCHE D'ALIMENTS
   (03/10/2026, session-B, demande de Michel) — blocs B-CDXLI (structure du corpus) · B-CDXLII (le corpus
   conduit par la VRAIE FRAPPE, toutes sources) · B-CDXLIII (inter-sources : course, débit réseau, sources
   absentes, déterminisme).

   ⭐ CE QUI EST CONDUIT : le vrai champ « Ce que tu as mangé » (`#af-desc`) de l'écran « Ajouter un aliment »,
   rempli puis notifié par un événement `input` — donc `_afSuggInput` exactement comme sous le doigt — et ce qui
   est LU, c'est le HTML réellement rendu par `_afSuggRendu` (sections, lignes, mentions). Rien du moteur n'est
   appelé à la place de l'écran ; les fonctions `_ciqualChercher` / `_marquesChercher` ne sont lues qu'APRÈS,
   pour vérifier que l'écran montre bien ce que le moteur rend.
   ⭐ LES QUATRE SOURCES, par configuration de contexte (`CTX`) :
     · `en`           — CIQUAL, table d'alias, fast-food (`marques.json`) et Open Food Facts (réponse FIGÉE) ;
     · `hors`         — hors ligne : table d'alias non chargée, Open Food Facts injoignable (comme FS-05) ;
     · `sans-marques` — le fichier fast-food ne se charge pas (404) ;
     · `sans-ciqual`  — le fichier CIQUAL ne se charge pas (404).
   ⛔ OPEN FOOD FACTS N'EST JAMAIS APPELÉ POUR DE VRAI : `context.route` sert `food_multisource_off.js`, des
   réponses CONSTRUITES À LA MAIN (voir son en-tête). Ce banc teste Force Tracker, pas le serveur d'OFF.
   ⛔ Le journal personnel (« Déjà noté par toi ») est HORS PÉRIMÈTRE : le stockage est vidé, la section
   n'apparaît jamais (vérifié comme précondition, pas comme contrat).
   Les MUST et SHOULD rougissent ; KNOWN_LIMITATION et OBSERVATION ne rougissent JAMAIS (« toujours
   observée » / « a changé — à relire »). ⛔ L'ordre fast-food ↔ générique sur une requête GÉNÉRIQUE est
   un ÉCART À D-042 : il n'est figé qu'en KNOWN_LIMITATION (contrôle négatif).
   Contrôle négatif : `tools/mut_food_multisource.py`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const { CAS, ECARTS_D042, QUESTIONS } = require('./food_multisource_corpus.js');
const { REPONSES } = require('./food_multisource_off.js');

const CTX = {
  en: { alias: true, off: true, marques: true, ciqual: true },
  hors: { alias: false, off: false, marques: true, ciqual: true },
  'sans-marques': { alias: true, off: true, marques: false, ciqual: true },
  'sans-ciqual': { alias: true, off: true, marques: true, ciqual: false },
};
const NIVEAUX = ['MUST', 'SHOULD', 'KNOWN_LIMITATION', 'OBSERVATION'];
/* ⛔ LES LIMITES ET LES OBSERVATIONS, NOMMÉES PAR IDENTIFIANT — exprès en double avec le corpus : changer le niveau
   d'un de ces cas (en faire un contrat, ou l'inverse) doit se faire ICI AUSSI, sciemment. Sans cette liste, une
   limite promue en SHOULD passerait au vert sans que personne ne le voie (contrôle négatif M18 → M20). */
const LIMITES_NOMMEES = ["MS-011", "MS-012", "MS-013", "MS-014", "MS-042", "MS-043", "MS-044", "MS-046", "MS-047", "MS-048", "MS-049", "MS-050", "MS-051", "MS-052", "MS-053", "MS-054", "MS-055", "MS-056", "MS-057", "MS-058", "MS-059", "MS-060", "MS-061", "MS-062", "MS-063", "MS-064", "MS-065", "MS-066", "MS-067", "MS-068", "MS-069", "MS-070", "MS-071", "MS-072", "MS-073", "MS-074", "MS-075", "MS-076", "MS-077", "MS-078", "MS-079", "MS-080", "MS-081", "MS-086", "MS-087", "MS-088", "MS-089", "MS-090", "MS-142", "MS-143", "MS-144", "MS-146", "MS-147", "MS-148", "MS-149", "MS-150", "MS-151", "MS-152", "MS-153", "MS-154", "MS-163", "MS-165", "MS-166", "MS-177", "MS-178", "MS-179", "MS-180", "MS-191", "MS-192", "MS-193", "MS-194", "MS-195"];
const OBSERVATIONS_NOMMEES = ["MS-015", "MS-017", "MS-018", "MS-024", "MS-025", "MS-026", "MS-027", "MS-045", "MS-137", "MS-138", "MS-139", "MS-140", "MS-145", "MS-155", "MS-169", "MS-170", "MS-196", "MS-197"];
const SOURCES = ['FF', 'CIQ', 'OFF'];
const ENSEIGNE = / · (KFC|Quick|Burger King|McDonald's|Domino's)$/;
const MENTION = 'Données aliments : table Ciqual 2025 — ANSES';

/* Ce qui se lit dans la page APRÈS la frappe : l'écran, puis le moteur (même état) pour comparer. */
function lire(q) {
  const el = document.getElementById('af-sugg');
  const SRC = { Marque: 'FF', Ciqual: 'CIQ', Off: 'OFF', Locale: 'LOC' };
  const lignes = [...el.querySelectorAll('button')].map(b => {
    const m = (b.getAttribute('onclick') || '').match(/_afSuggPrendre(\w+)\(/), col = b.children[1];
    return { src: m ? (SRC[m[1]] || m[1]) : '?', titre: col && col.children[0] ? col.children[0].textContent : '',
      detail: col && col.children[1] ? col.children[1].textContent : '' };
  });
  const sections = []; lignes.forEach(l => { if (sections[sections.length - 1] !== l.src) sections.push(l.src); });
  const entetes = [...el.querySelectorAll('div')].filter(d => d.childElementCount === 0).map(d => d.textContent.trim())
    .filter(x => /^(DÉJÀ NOTÉ PAR TOI|FAST-FOOD \(SOURCES OFFICIELLES\)|ALIMENTS \(CIQUAL · ANSES\)|PRODUITS DE MARQUE \(OPEN FOOD FACTS\))$/.test(x));
  let ciqAttendu, ffAttendu, doutes = 0, derivees = 0;
  try { ciqAttendu = (_ciqualChercher(q, 6) || []).map(a => a[1]); } catch (e) { ciqAttendu = 'ERREUR ' + e.message; }
  try {
    const idx = _marques ? _marquesChercher(q, 4) : [];
    ffAttendu = idx.map(i => _marques.a[i][1] + ' · ' + _marques.a[i][0]); doutes = idx.filter(i => _marques.a[i][9]).length;
    derivees = idx.filter(i => _marques.a[i][8]).length;
  } catch (e) { ffAttendu = 'ERREUR ' + e.message; }
  return { lignes, sections, entetes, mention: el.textContent.indexOf('Données aliments : table Ciqual 2025 — ANSES') >= 0,
    ciqAttendu, ffAttendu, doutes, derivees, alias: !!_alias, marques: !!_marques, ciqual: !!_ciqual };
}

/* Une session = un contexte de navigateur neuf, une configuration de sources, des cas joués dans l'ordre. */
async function session(b, PORT, nomCtx, cas) {
  const conf = CTX[nomCtx];
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  const J = { offReq: [], posts: [], anomalies: [] }; let courant = null;
  await cx.route(/script\.google\.com|workers\.dev|anthropic/, rt => {
    const d = rt.request().postData();
    if (d && /logSearchMiss/.test(d)) { try { J.posts.push(JSON.parse(d).terme); } catch (e) { J.posts.push('?'); } }
    rt.abort();
  });
  await cx.route(/openfoodfacts\.org/, async rt => {
    const url = rt.request().url(), terme = new URL(url).searchParams.get('search_terms');
    J.offReq.push({ terme, url, cas: courant ? courant.id : null });
    if (!conf.off) return rt.abort();
    const duCas = courant && courant.q.trim() === terme;
    if (!duCas) J.anomalies.push('requête Open Food Facts hors du cas courant : « ' + terme + ' »');
    const R = REPONSES[(duCas && courant.offCle) || 'vide'];
    if (R.delai) await new Promise(r => setTimeout(r, R.delai));
    if (R.panne) return rt.abort();
    try { await rt.fulfill({ status: R.status || 200, contentType: 'application/json', body: typeof R.body === 'string' ? R.body : JSON.stringify(R.body) }); } catch (e) {}
  });
  if (!conf.alias) await cx.route(/data\/alias\.json/, rt => rt.abort());
  if (!conf.marques) await cx.route(/data\/marques\.json/, rt => rt.fulfill({ status: 404, body: '' }));
  if (!conf.ciqual) await cx.route(/data\/ciqual\.json/, rt => rt.fulfill({ status: 404, body: '' }));
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_fs05b'))return; sessionStorage.setItem('_fs05b','1');
    localStorage.clear(); localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99'); }catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1800);
  await pg.evaluate(async () => {
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    openAddFood(); await new Promise(r => setTimeout(r, 300));
  });
  const obs = {};
  for (const c of cas) {
    courant = c; const n0 = J.offReq.length, p0 = J.posts.length;
    const lg = await pg.evaluate(q => {
      const inp = document.getElementById('af-desc'); inp.value = q; inp.dispatchEvent(new Event('input', { bubbles: true }));
      return _afNorm(q).length;
    }, c.q);
    if (lg >= 3) {                       // Open Food Facts part après la pause de frappe (450 ms) : on attend SA requête
      const t0 = Date.now();
      while (J.offReq.length === n0 && Date.now() - t0 < 3000) await pg.waitForTimeout(25);
      await pg.waitForTimeout(200 + ((REPONSES[c.offCle || 'vide'] || {}).delai || 0));
    } else await pg.waitForTimeout(700);  // sous 3 lettres : aucune requête attendue, on laisse passer la pause
    if ('signal' in c) await pg.waitForTimeout(1500);   // l'anti-rebond du signal « recherche vide » (1,2 s)
    const v = await pg.evaluate(lire, c.q);
    obs[c.id] = Object.assign(v, { offReq: J.offReq.slice(n0), posts: J.posts.slice(p0) });
  }
  await cx.close();
  return { obs, errs, anomalies: J.anomalies };
}

/* Joue tous les cas, chaque configuration dans son contexte ; `en` réparti sur 3 contextes en parallèle. */
async function executer(b, PORT, cas, inverse) {
  const groupes = [];
  const parCtx = {}; cas.forEach(c => { (parCtx[c.ctx] = parCtx[c.ctx] || []).push(c); });
  for (const k of Object.keys(parCtx)) {
    const L = inverse ? parCtx[k].slice().reverse() : parCtx[k];
    const n = k === 'en' ? 3 : 1;
    for (let i = 0; i < n; i++) groupes.push([k, L.filter((_, j) => j % n === i)]);
  }
  const res = await Promise.all(groupes.map(([k, L]) => session(b, PORT, k, L)));
  const obs = {}, errs = [], anomalies = [];
  res.forEach((r, i) => { Object.assign(obs, r.obs); r.errs.forEach(e => errs.push(groupes[i][0] + ' : ' + e)); anomalies.push(...r.anomalies); });
  return { obs, errs, anomalies };
}

/* Le jugement d'UN cas : la liste de ce qui ne tient pas (vide = le cas tient). */
function juger(c, o) {
  const ko = [], has = s => o.sections.includes(s), L = s => o.lignes.filter(l => l.src === s);
  if (c.vide && o.lignes.length) ko.push('attendu vide, ' + o.lignes.length + ' ligne(s)');
  (c.presents || []).forEach(s => { if (!has(s)) ko.push('section absente : ' + s); });
  (c.absents || []).forEach(s => { if (has(s)) ko.push('section présente : ' + s); });
  (c.avant || []).forEach(([a, z]) => { const i = o.sections.indexOf(a), j = o.sections.indexOf(z); if (i < 0 || j < 0 || i > j) ko.push('ordre ' + a + ' avant ' + z); });
  if (c.ff) {
    const f = L('FF');
    if ('n' in c.ff && f.length !== c.ff.n) ko.push('fast-food : ' + f.length + ' ligne(s)');
    if (c.ff.re1 && !(f[0] && new RegExp(c.ff.re1).test(f[0].titre))) ko.push('fast-food 1ʳᵉ ligne');
    if (c.ff.tous && !f.every(l => new RegExp(c.ff.tous).test(l.titre))) ko.push('fast-food : une ligne hors « ' + c.ff.tous + ' »');
    if (c.ff.contient && !f.some(l => new RegExp(c.ff.contient).test(l.titre))) ko.push('fast-food : « ' + c.ff.contient + ' » absent');
    if (c.ff.jamais && f.some(l => new RegExp(c.ff.jamais).test(l.titre))) ko.push('fast-food : « ' + c.ff.jamais + ' » présent');
    if (c.ff.ligne) { const l = f.find(x => x.titre.indexOf(c.ff.ligne) === 0); if (!l || (c.ff.detail && !new RegExp(c.ff.detail).test(l.detail))) ko.push('fast-food : ligne « ' + c.ff.ligne + ' » ' + (l ? '« ' + l.detail + ' »' : 'absente')); }
  }
  if (c.ciq) {
    const f = L('CIQ');
    if (c.ciq.re1 && !(f[0] && new RegExp(c.ciq.re1).test(f[0].titre))) ko.push('CIQUAL 1ʳᵉ ligne');
    if ('n' in c.ciq && f.length !== c.ciq.n) ko.push('CIQUAL : ' + f.length + ' ligne(s)');
  }
  if (c.off) {
    const f = L('OFF');
    if (c.off.titres && JSON.stringify(f.map(l => l.titre)) !== JSON.stringify(c.off.titres)) ko.push('Open Food Facts : titres ' + JSON.stringify(f.map(l => l.titre)));
    if (c.off.details && JSON.stringify(f.map(l => l.detail)) !== JSON.stringify(c.off.details)) ko.push('Open Food Facts : détails ' + JSON.stringify(f.map(l => l.detail)));
    if ('n' in c.off && f.length !== c.off.n) ko.push('Open Food Facts : ' + f.length + ' ligne(s)');
    if (c.off.jamais && f.some(l => new RegExp(c.off.jamais).test(l.titre))) ko.push('Open Food Facts : « ' + c.off.jamais + ' » présent');
    if (c.off.ordre) { let k = 0; f.forEach(l => { if (k < c.off.ordre.length && l.titre === c.off.ordre[k]) k++; }); if (k !== c.off.ordre.length) ko.push('Open Food Facts : ordre de la réponse non conservé'); }
  }
  if ('offReq' in c && o.offReq.length !== c.offReq) ko.push(o.offReq.length + ' requête(s) Open Food Facts');
  if ('signal' in c && (o.posts.length > 0) !== c.signal) ko.push('signal « recherche vide » ' + (o.posts.length ? 'envoyé' : 'non envoyé'));
  if (c.doute && !L('FF').some(l => /⚠️/.test(l.detail))) ko.push('doute non affiché');
  return ko;
}
const CHAMPS = ['vide', 'presents', 'absents', 'avant', 'ff', 'ciq', 'off', 'offReq', 'signal', 'doute'];
const signature = o => o.sections.join(',') + '|' + o.lignes.map(l => l.src + ':' + l.titre + ':' + l.detail).join('§');

module.exports.source = function (t) {
  console.log('\n═══ B-CDXLI. FS-05B — la structure du corpus multi-source (données) ═══');
  const ids = CAS.map(c => c.id);
  t('B-CDXLI ① ' + CAS.length + ' cas, identifiants uniques et stables (MS-nnn)',
    new Set(ids).size === ids.length && ids.every(i => /^MS-\d{3}$/.test(i)), String(CAS.length));
  t('B-CDXLI ② chaque cas dit sa requête, sa catégorie, son intention, ses sources attendues, sa configuration, son niveau, sa source, sa raison — et contrôle au moins une chose',
    CAS.every(c => typeof c.q === 'string' && c.cat && c.kind && Array.isArray(c.sources) && CTX[c.ctx] && NIVEAUX.includes(c.niveau)
      && c.source && c.raison && CHAMPS.some(k => k in c)),
    CAS.filter(c => !(c.q !== undefined && c.cat && c.kind && Array.isArray(c.sources) && CTX[c.ctx] && NIVEAUX.includes(c.niveau) && c.source && c.raison && CHAMPS.some(k => k in c))).map(c => c.id).join(' '));
  t('B-CDXLI ③ toute réponse Open Food Facts citée existe dans les réponses FIGÉES, et chacune se déclare non réelle',
    CAS.every(c => !c.offCle || (REPONSES[c.offCle] && CTX[c.ctx].off))
      && require('fs').readFileSync(require.resolve('./food_multisource_off.js'), 'utf8').indexOf('CE NE SONT PAS DES RÉPONSES RÉELLES') >= 0, '');
};

module.exports.ecran = async function (t, b, PORT) {
  const P1 = await executer(b, PORT, CAS, false);
  console.log('\n-- B-CDXLII. FS-05B — le corpus conduit par la VRAIE FRAPPE, toutes sources (CIQUAL · fast-food · Open Food Facts figé) --');
  const det = o => JSON.stringify(o);
  for (const c of CAS) {
    const o = P1.obs[c.id], ko = o ? juger(c, o) : ['non joué'];
    const tag = c.id + ' [' + c.niveau + '] ' + (c.ctx !== 'en' ? c.ctx.toUpperCase() + ' ' : '') + '« ' + c.q + ' » — ' + c.raison;
    const vu = o ? det({ sections: o.sections, lignes: o.lignes.slice(0, 3).map(l => l.src + ':' + l.titre), req: o.offReq.length, signal: o.posts.length }) : '';
    if (c.niveau === 'KNOWN_LIMITATION' || c.niveau === 'OBSERVATION') {
      console.log((ko.length ? '   🟢 ' + (c.niveau === 'OBSERVATION' ? 'OBSERVATION CHANGÉE — à relire' : 'LIMITE LEVÉE — à reclasser') + ' (pas un rouge) — '
        : '   ℹ️  ' + (c.niveau === 'OBSERVATION' ? 'OBSERVATION, toujours vraie' : 'LIMITE CONNUE, toujours observée') + ' — ') + tag + (ko.length ? '  >> ' + vu : ''));
      continue;
    }
    t('B-CDXLII ' + tag, ko.length === 0, det(ko) + ' ' + vu);
  }
  /* ── Les propriétés de TOUT le corpus (une ligne chacune, la liste des cas fautifs en détail) ── */
  const tous = CAS.filter(c => P1.obs[c.id]), O = c => P1.obs[c.id];
  const fautifs = f => tous.filter(c => !f(c, O(c))).map(c => c.id);
  const f1 = fautifs((c, o) => typeof o.ciqAttendu !== 'object' || JSON.stringify(o.lignes.filter(l => l.src === 'CIQ').map(l => l.titre)) === JSON.stringify(o.ciqAttendu));
  t('B-CDXLII [MUST] dans les ' + tous.length + ' cas, la section CIQUAL affichée est EXACTEMENT ce que rend la recherche (`_ciqualChercher`), dans le même ordre', !f1.length, det(f1.slice(0, 6)));
  const f2 = fautifs((c, o) => typeof o.ffAttendu !== 'object' || JSON.stringify(o.lignes.filter(l => l.src === 'FF').map(l => l.titre)) === JSON.stringify(o.ffAttendu));
  t('B-CDXLII [SHOULD] … et la section fast-food est exactement ce que rend `_marquesChercher` (4 au plus), dans le même ordre', !f2.length, det(f2.slice(0, 6)));
  const f3 = fautifs((c, o) => o.lignes.filter(l => l.src === 'FF').every(l => ENSEIGNE.test(l.titre)));
  t('B-CDXLII [SHOULD] chaque ligne fast-food NOMME son enseigne (« … · KFC ») : le chiffre ne se présente jamais tout nu (ft-v1114)', !f3.length, det(f3.slice(0, 6)));
  const f4 = fautifs((c, o) => o.mention === o.sections.includes('CIQ'));
  t('B-CDXLII [MUST] la mention « ' + MENTION + ' » est là SI ET SEULEMENT SI la section CIQUAL l\'est (Licence Ouverte : citer la source)', !f4.length, det(f4.slice(0, 6)));
  const f5 = fautifs((c, o) => o.lignes.filter(l => l.src === 'FF' && /⚠️/.test(l.detail)).length === o.doutes);
  const f5b = fautifs((c, o) => o.lignes.filter(l => l.src === 'FF' && /kcal calculées/.test(l.detail)).length === o.derivees);
  t('B-CDXLII [SHOULD] un produit fast-food dont les kcal sont CALCULÉES (et non publiées) le dit sur sa ligne (« kcal calculées »)', !f5b.length, det(f5b.slice(0, 6)));
  t('B-CDXLII [MUST] un produit fast-food DOUTEUX s\'affiche avec son ⚠️ et la raison du doute — jamais caché (décision de Michel, 03/09)', !f5.length, det(f5.slice(0, 6)));
  const f6 = fautifs((c, o) => new Set(o.sections).size === o.sections.length && JSON.stringify(o.entetes) === JSON.stringify(o.sections.map(s => ({ FF: 'FAST-FOOD (SOURCES OFFICIELLES)', CIQ: 'ALIMENTS (CIQUAL · ANSES)', OFF: 'PRODUITS DE MARQUE (OPEN FOOD FACTS)', LOC: 'DÉJÀ NOTÉ PAR TOI' }[s]))));
  t('B-CDXLII [SHOULD] chaque source forme UN bloc, sous SON en-tête, jamais coupé en deux ni mélangé', !f6.length, det(f6.slice(0, 6)));
  const f7 = fautifs((c, o) => o.lignes.filter(l => l.src === 'FF').length <= 4 && o.lignes.filter(l => l.src === 'CIQ').length <= 6 && o.lignes.filter(l => l.src === 'OFF').length <= 6);
  t('B-CDXLII [SHOULD] plafonds : 4 lignes fast-food, 6 CIQUAL, 6 Open Food Facts au plus', !f7.length, det(f7.slice(0, 6)));
  t('B-CDXLII précondition — journal personnel vide : la section « Déjà noté par toi » (hors périmètre) n\'apparaît dans aucun cas',
    tous.every(c => !O(c).sections.includes('LOC')), '');
  const reqs = tous.flatMap(c => O(c).offReq.map(r => ({ c, r })));
  const f8 = reqs.filter(({ c, r }) => !(r.terme === c.q.trim() && /[?&]page_size=6(&|$)/.test(r.url) && /sort_by=unique_scans_n/.test(r.url) && /[?&]json=1(&|$)/.test(r.url) && /fields=[^&]*nutriments/.test(r.url))).map(x => x.c.id);
  t('B-CDXLII [SHOULD] adaptateur Open Food Facts : ' + reqs.length + ' requêtes, chacune porte la frappe nettoyée, 6 produits, le tri par popularité et les seuls champs utiles (dont `nutriments`)', reqs.length > 0 && !f8.length, det(f8.slice(0, 6)));
  t('B-CDXLII aucune requête Open Food Facts hors du cas en cours, aucune erreur de page dans les 4 configurations (sans fast-food et sans CIQUAL compris)',
    !P1.anomalies.length && !P1.errs.length, det(P1.anomalies.concat(P1.errs).slice(0, 3)));

  console.log('\n-- B-CDXLIII. FS-05B — inter-sources : structure des limites, déterminisme, course, débit réseau --');
  /* ⛔ D-042 : l'écart « fast-food avant le générique » ne se fige QU'EN KNOWN_LIMITATION — et les questions
     ouvertes de Michel ne se tranchent pas ici : elles restent des OBSERVATION. */
  const kl = CAS.filter(c => c.d042);
  t('B-CDXLIII [D-042] les ' + ECARTS_D042.length + ' écarts nommés à D-042 (fast-food au-dessus du générique) restent KNOWN_LIMITATION — aucun n\'est devenu MUST ou SHOULD',
    ECARTS_D042.every(k => CAS.some(c => c.d042 && c.q + '|' + c.ctx === k)) && kl.every(c => c.niveau === 'KNOWN_LIMITATION' && ECARTS_D042.includes(c.q + '|' + c.ctx))
      && CAS.filter(c => c.niveau === 'MUST' || c.niveau === 'SHOULD').every(c => !((c.avant || []).some(([a, z]) => a === 'FF' && z === 'CIQ') && (c.kind === 'generique' || c.kind === 'partiel'))),
    det(kl.filter(c => c.niveau !== 'KNOWN_LIMITATION').map(c => c.id)));
  const nomme = (niv, L) => JSON.stringify(CAS.filter(c => c.niveau === niv).map(c => c.id)) === JSON.stringify(L);
  t('B-CDXLIII les ' + LIMITES_NOMMEES.length + ' limites connues et les ' + OBSERVATIONS_NOMMEES.length + ' observations sont EXACTEMENT celles nommées par le banc — aucune n\'a été promue en contrat, aucun contrat n\'a été rétrogradé',
    nomme('KNOWN_LIMITATION', LIMITES_NOMMEES) && nomme('OBSERVATION', OBSERVATIONS_NOMMEES),
    det(CAS.filter(c => (c.niveau === 'KNOWN_LIMITATION') !== LIMITES_NOMMEES.includes(c.id) || (c.niveau === 'OBSERVATION') !== OBSERVATIONS_NOMMEES.includes(c.id)).map(c => c.id + ':' + c.niveau)));
  t('B-CDXLIII [questions de Michel] les cas des ' + QUESTIONS.length + ' questions ouvertes restent des OBSERVATION — le corpus ne décide pas à sa place',
    QUESTIONS.every(qq => CAS.some(c => c.question === qq.id)) && CAS.filter(c => c.question).every(c => c.niveau === 'OBSERVATION'),
    det(CAS.filter(c => c.question && c.niveau !== 'OBSERVATION').map(c => c.id)));
  /* Déterminisme : même entrée, même version → même sortie, que l'on rejoue le corpus à l'endroit ou à l'envers. */
  const P2 = await executer(b, PORT, CAS, true);
  const diff = CAS.filter(c => P1.obs[c.id] && P2.obs[c.id] && signature(P1.obs[c.id]) !== signature(P2.obs[c.id])).map(c => c.id);
  t('B-CDXLIII [MUST] déterminisme : le corpus entier rejoué dans des contextes neufs, cas dans l\'ordre INVERSE → mêmes sections, mêmes lignes, mêmes valeurs (' + CAS.length + ' cas)',
    !diff.length && CAS.every(c => P2.obs[c.id]), det(diff.slice(0, 6)));
  await module.exports.course(t, b, PORT);
};

/* La course et la frappe au clavier : réponse Open Food Facts LENTE pour « whey », on tape « skyr » avant
   qu'elle arrive — l'écran ne doit jamais montrer la réponse périmée ; et une frappe lettre à lettre ne doit
   partir au réseau qu'une fois, après la pause. */
module.exports.course = async function (t, b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  const req = [];
  await cx.route(/script\.google\.com|workers\.dev|anthropic/, rt => rt.abort());
  await cx.route(/openfoodfacts\.org/, async rt => {
    const terme = new URL(rt.request().url()).searchParams.get('search_terms'); req.push(terme);
    const R = REPONSES[{ whey: 'wheyLent', skyr: 'skyr', poulet: 'poulet' }[terme] || 'vide'];
    if (R.delai) await new Promise(r => setTimeout(r, R.delai));
    try { await rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(R.body) }); } catch (e) {}
  });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_fs05c'))return; sessionStorage.setItem('_fs05c','1');
    localStorage.clear(); localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99'); }catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1800);
  await pg.evaluate(async () => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); openAddFood(); await new Promise(r => setTimeout(r, 300)); });
  await pg.click('#af-desc');
  await pg.keyboard.type('whey', { delay: 40 });          // lettre à lettre, plus vite que la pause de 450 ms
  await pg.waitForTimeout(700);                            // la requête « whey » est partie, sa réponse est lente
  await pg.fill('#af-desc', ''); await pg.keyboard.type('skyr', { delay: 40 });
  await pg.waitForTimeout(2600);                           // la réponse « whey » arrive APRÈS celle de « skyr »
  const vu = await pg.evaluate(lire, 'skyr');
  t('B-CDXLIII [SHOULD] course : la réponse Open Food Facts de « whey », arrivée APRÈS la frappe de « skyr », n\'est jamais affichée — l\'écran montre les produits de « skyr »',
    vu.lignes.some(l => l.src === 'OFF' && /^Skyr nature/.test(l.titre)) && !vu.lignes.some(l => /périmée/.test(l.titre)), JSON.stringify(vu.lignes.map(l => l.src + ':' + l.titre)));
  t('B-CDXLIII [SHOULD] une frappe lettre à lettre ne part au réseau qu\'APRÈS la pause : « whey » puis « skyr » = 2 requêtes, jamais « w », « wh », « whe »',
    JSON.stringify(req) === JSON.stringify(['whey', 'skyr']), JSON.stringify(req));
  /* La vraie frappe au clavier rend la même chose que le champ notifié : « poulet ». */
  await pg.fill('#af-desc', ''); await pg.keyboard.type('poulet', { delay: 40 }); await pg.waitForTimeout(1200);
  const clavier = await pg.evaluate(lire, 'poulet');
  const champ = await pg.evaluate(async () => { const inp = document.getElementById('af-desc'); inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 200)); inp.value = 'poulet'; inp.dispatchEvent(new Event('input', { bubbles: true })); await new Promise(r => setTimeout(r, 1200)); return true; });
  const champVu = champ && await pg.evaluate(lire, 'poulet');
  t('B-CDXLIII [SHOULD] la frappe AU CLAVIER et le champ notifié (méthode du corpus) affichent exactement la même liste pour « poulet »',
    signature(clavier) === signature(champVu) && clavier.lignes.length > 0, JSON.stringify([clavier.sections, champVu.sections]));
  /* Résultat PÉRIMÉ d'une source : après « poulet » (Open Food Facts a répondu), on tape « po » — 2 lettres, donc
     aucune requête : les produits Open Food Facts de « poulet » ne doivent plus être à l'écran. */
  await pg.fill('#af-desc', ''); await pg.keyboard.type('po', { delay: 40 }); await pg.waitForTimeout(900);
  const po = await pg.evaluate(lire, 'po');
  t('B-CDXLIII [SHOULD] résultat périmé : après « poulet » (Open Food Facts a répondu), « po » n\'affiche AUCUNE ligne Open Food Facts de la requête précédente',
    champVu.lignes.some(l => l.src === 'OFF') && !po.lignes.some(l => l.src === 'OFF'), JSON.stringify([champVu.sections, po.sections]));
  /* ℹ️ OBSERVATION (question ouverte, jamais rouge) : à score égal, l'ordre des lignes fast-food suit l'ordre
     PHYSIQUE de `marques.json` (le tri de `_marquesChercher` s'arrête à la longueur du nom). D-036 interdit ce
     départage pour CIQUAL ; s'applique-t-elle au fast-food ? Non tranché — mesuré à chaque passe. */
  const perm = await pg.evaluate(() => { const Q = ['poulet', 'salade', 'frites', 'burger', 'kfc', 'quick', 'tenders', 'coca', 'fromage', 'whopper'];
    const lis = () => Q.map(q => _marquesChercher(q, 4).map(i => _marques.a[i][1]).join('|')); const a = lis(), o = _marques.a;
    _marques.a = o.slice().reverse(); const z = lis(); _marques.a = o; return Q.filter((q, i) => a[i] !== z[i]); });
  console.log('   ℹ️  OBSERVATION (question ouverte) — fichier fast-food relu À L\'ENVERS : l\'ordre des lignes change pour ' + perm.length + ' requête(s) sur 10 (' + perm.join(', ') + ') — le départage à égalité suit l\'ordre du fichier');
  t('B-CDXLIII la course et la frappe : aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};

module.exports.executer = executer;
module.exports.juger = juger;
