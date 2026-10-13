/* ══════════════════════════════════════════════════════════════════════════════════════
   🍽️ NUT-LOT-A — LES TABLES GÉNÉRÉES : LE SENS AVANT LE CODE (alias + fast-food Quick)
   (13/10/2026, session-B, mission de Michel issue de l'audit de nuit du 12/10) — blocs B-AS-D (les données générées),
   B-AS-G (les générateurs eux-mêmes, sur une COPIE), B-AS-E (l'écran, par la VRAIE FRAPPE).

   ⚖️ LA RÈGLE (décision D1 de Michel, 13/10) : *une requête EXPLICITE privilégie l'aliment qu'elle nomme ; une requête
   GÉNÉRIQUE reste générique et n'invente pas de variante.* EXACT EXPLICITE > GÉNÉRIQUE COMPATIBLE > PAS DE RÉSULTAT —
   jamais un aliment nommé remplacé par une approximation quand l'aliment nommé existe dans CIQUAL.
   ⚖️ ET POUR LE FAST-FOOD (décision D4) : une donnée source suspecte mais non vérifiée est CONSERVÉE et MARQUÉE
   « doute » — jamais supprimée en silence, jamais remplacée par une valeur inventée.

   ⭐ CE QUI EST CONDUIT : les générateurs `tools/alias.py` et `tools/marques.py` (exécutés sur une copie de l'arbre,
   jamais sur le dépôt) et le vrai champ `#af-desc` (harnais de FS-05B, `food_multisource.js`, réutilisé — R2).
   ⭐ CE QUI EST OBSERVÉ : `data/alias.json` et `data/marques.json` tels que servis ; le code de sortie et le fichier
   écrit (ou non) par chaque générateur ; le HTML rendu par `_afSuggRendu` (1ʳᵉ ligne CIQUAL, ligne fast-food, ⚠️) ;
   la provenance posée au clic sur un produit douteux.
   ⛔ CE QUI N'EST PAS COUVERT : les 273 cibles « sans tous les mots » de l'audit (la plupart sont des traductions
   voulues — seules celles qu'un autre aliment proposable porte entièrement sont contrôlées) ; la recherche hors
   ligne (la table d'alias n'y joue pas) ; Open Food Facts (jamais appelé pour de vrai).
   Contrôle négatif : `tools/mut_food_alias_sens.py`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const MS = require('./food_multisource.js');
const ROOT = path.join(__dirname, '..', '..');

/* ── LES CIBLES ATTENDUES — une seule liste, lue par les trois blocs. Chaque code a été vérifié dans
      `data/ciqual.json` (proposable, nom relu) avant d'être écrit ici. ── */
const CORRIGES = {
  // la liste de l'audit de nuit, rejouée cas par cas
  'confiture': [30999, '^Confiture ou marmelade, tout type de fruits, sans précision', 'D1 : générique, ni « de lait », ni « non allégée » imposée'],
  'confiture de fraise': [31024, '^Confiture de fraise', 'l\'aliment nommé existe'],
  'confiture dabricot': [31037, '^Confiture d\'abricot', 'l\'aliment nommé existe (« confiture d\'abricot » tapée)'],
  'confiture fruits rouges': [31083, '^Confiture, autres fruits ou mélange de fruits', 'pas de confiture « fruits rouges » dans CIQUAL : le mélange de fruits correspondant'],
  'gruyere': [12114, '^Gruyère', 'un Gruyère existe — l\'Emmental n\'en est pas un'],
  'lieu noir': [26134, '^Lieu noir', 'le lieu noir existe — le lieu d\'Alaska est un autre poisson'],
  'pilon de poulet': [36022, '^Poulet, pilon', 'le pilon existe'],
  'pilons de poulet': [36022, '^Poulet, pilon', 'idem, au pluriel'],
  'riz semi-complet': [9113, '^Riz semi-complet', 'le semi-complet existe'],
  'pain aux cereales': [7255, '^Pain aux céréales', 'le pain aux céréales existe'],
  'jambon de bayonne': [28811, '^Jambon de Bayonne', 'le jambon de Bayonne existe'],
  'jambon sec': [28812, '^Jambon sec', 'le jambon sec existe'],
  'lentilles blondes': [20588, '^Lentille blonde', 'la lentille blonde existe'],
  'pates semi-completes': [9877, '^Pâtes sèches, semi-complètes', 'les pâtes semi-complètes existent'],
  'haut de cuisse de poulet': [36019, '^Poulet, haut de cuisse', 'le haut de cuisse existe'],
  'beurre sale': [16403, '^Beurre à 80% MG, salé', 'le beurre salé existe — le demi-sel est un autre beurre'],
  'riz thai': [9124, '^Riz thaï', 'le riz thaï existe'],
  // D1 : les salades — l'aliment exact quand CIQUAL le possède
  'laitue': [20031, '^Laitue, crue', 'D1 : la laitue existe'],
  'batavia': [20123, '^Batavia', 'D1 : la batavia existe'],
  'feuille de chene': [20295, '^Salade feuille de chêne', 'D1 : la feuille de chêne existe'],
  // D1, règle générale appliquée aux autres cas que le contrôle du générateur a trouvés
  'tradition': [7007, '^Pain de tradition française', 'D1 règle générale : le pain de tradition existe'],
  'baguette tradition': [7007, '^Pain de tradition française', 'idem'],
  'noix de veau': [6522, '^Veau, noix', 'D1 règle générale : la noix de veau crue existe'],
  'rosette': [30304, '^Rosette', 'D1 règle générale : la rosette existe'],
  'pomme de terre a leau': [4003, '^Pomme de terre, bouillie/cuite à l\'eau', 'D1 règle générale : trouvé par le contrôle de sens (l\'apostrophe cachait le mot « eau »)'],
};
/* Ce qui NE DOIT PAS bouger : les requêtes génériques et les traductions voulues (D1), plus « potatoes », figé par
   le témoin MS-105 (FS-05B) — une cible qu'un ancien témoin exige ne se change pas sans décision (brief §6). */
const INCHANGES = {
  'salade': [25604, '^Salade verte', 'D1 : « salade » reste le générique'],
  'blanc de poulet': [36017, '^Poulet, filet', 'D1 : la viande, pas la tranche de charcuterie'],
  'blanc de dinde': [36304, '^Dinde, escalope', 'D1 : la viande, pas la tranche de charcuterie'],
  'pomme de terre vapeur': [4048, '^Pomme de terre, cuite', 'D1 : cuite générique, pas « vapeur sous vide » imposée'],
  'pommes de terre vapeur': [4048, '^Pomme de terre, cuite', 'idem'],
  'potatoes': [4026, '^Pomme de terre, rôtie', 'NON TOUCHÉ : MS-105 fige cette cible — décision de Michel attendue'],
};
const FRAPPE = {   // la requête telle qu'on la tape, avec accents et apostrophe, pour la clé normalisée
  'confiture dabricot': 'confiture d\'abricot', 'gruyere': 'gruyère', 'pain aux cereales': 'pain aux céréales',
  'pates semi-completes': 'pâtes semi-complètes', 'beurre sale': 'beurre salé', 'riz thai': 'riz thaï', 'feuille de chene': 'feuille de chêne', 'pomme de terre a leau': 'pomme de terre à l\'eau',
};

/* ── FAST-FOOD : les 5 groupes de valeurs copiées (audit de nuit) et le Double Cheeseburger Bacon (CV-NUT-NEW-004) ── */
const DCB = 'Double Cheeseburger Bacon';
const groupesIdentiques = A => {
  const g = {}; A.forEach(r => { const k = JSON.stringify(r.slice(3, 8)); (g[k] = g[k] || []).push(r); });
  return Object.values(g).filter(v => new Set(v.map(r => r[0] + '|' + r[1])).size > 1);
};

/* ── un générateur exécuté sur une COPIE de l'arbre (jamais sur le dépôt) ── */
function copie(fichiers) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'as_gen_'));
  fichiers.forEach(f => { const src = path.join(ROOT, f), dst = path.join(d, f); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); });
  return d;
}
const ALIAS_FICHIERS = ['tools/alias.py', 'data/ciqual.json', 'data/sources/Force_Tracker_Alias_CIQUAL_V2_Elargie.xlsx', 'app.js'];
const MARQUES_FICHIERS = ['tools/marques.py', 'data/sources/Base_Fast_Food_France_Force_Tracker_2.xlsx'];
function genAlias(injection) {
  const d = copie(ALIAS_FICHIERS), py = path.join(d, 'tools', 'alias.py');
  if (injection) {
    const s = fs.readFileSync(py, 'utf8'); if (s.split(injection.ancre).length !== 2) return { err: 'ancre d\'injection introuvable ou multiple : ' + injection.ancre };
    fs.writeFileSync(py, s.replace(injection.ancre, injection.ancre + injection.ligne));
  }
  const r = cp.spawnSync('python3', ['tools/alias.py'], { cwd: d, encoding: 'utf8', timeout: 180000 });
  const out = path.join(d, 'data', 'alias.json');
  const res = { code: r.status, sortie: (r.stdout || '') + (r.stderr || ''), ecrit: fs.existsSync(out) ? fs.readFileSync(out) : null };
  fs.rmSync(d, { recursive: true, force: true });
  return res;
}
function genMarques() {
  const d = copie(MARQUES_FICHIERS);
  const r = cp.spawnSync('python3', ['tools/marques.py', 'data/sources/Base_Fast_Food_France_Force_Tracker_2.xlsx'], { cwd: d, encoding: 'utf8', timeout: 180000 });
  const out = path.join(d, 'data', 'marques.json');
  const res = { code: r.status, sortie: (r.stdout || '') + (r.stderr || ''), ecrit: fs.existsSync(out) ? fs.readFileSync(out) : null };
  fs.rmSync(d, { recursive: true, force: true });
  return res;
}

module.exports.source = function (t) {
  const ciq = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'ciqual.json'), 'utf8')).a, by = {}; ciq.forEach(a => { by[a[0]] = a; });
  const A = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'alias.json'), 'utf8')).a;
  const M = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'marques.json'), 'utf8')).a;

  console.log('\n═══ B-AS-D. NUT-LOT-A — les données générées (alias.json, marques.json) ═══');
  const toutes = Object.assign({}, CORRIGES, INCHANGES);
  t('B-AS-D ⛔ CONTRÔLE — chaque cible attendue existe dans CIQUAL, est PROPOSABLE (kcal déterminées) et porte le nom que le témoin attend',
    Object.values(toutes).every(([c, re]) => by[c] && by[c][3] != null && new RegExp(re).test(by[c][1])),
    Object.entries(toutes).filter(([, [c, re]]) => !(by[c] && by[c][3] != null && new RegExp(re).test(by[c][1]))).map(([k]) => k).join(' '));
  for (const [k, [c, , raison]] of Object.entries(CORRIGES))
    t('B-AS-D « ' + k + ' » → ' + c + ' ' + (by[c] ? by[c][1].slice(0, 46) : '?') + ' — ' + raison, A[k] === c,
      'table : ' + A[k] + ' ' + (by[A[k]] ? by[A[k]][1].slice(0, 46) : ''));
  t('B-AS-D ⛔ NE BOUGE PAS : salade, blanc de poulet / de dinde, pomme(s) de terre vapeur (D1) et potatoes (MS-105)',
    Object.entries(INCHANGES).every(([k, [c]]) => A[k] === c), Object.entries(INCHANGES).filter(([k, [c]]) => A[k] !== c).map(([k]) => k + '→' + A[k]).join(' '));

  const G = groupesIdentiques(M);
  t('B-AS-D ⛔ CONTRÔLE — les groupes de produits DIFFÉRENTS aux valeurs identiques (kcal, P, G, L, portion) sont recomptés ICI, indépendamment du générateur (5 attendus)',
    G.length === 5, G.length + ' groupe(s)');
  const sansDoute = [].concat(...G).filter(r => !r[9]).map(r => r[1]);
  t('B-AS-D ⛔⛔ D4 — chaque produit de ces groupes porte un « doute » (dosette à 576 kcal, frites « supplément sauce » aux valeurs des frites seules…)',
    G.length > 0 && sansDoute.length === 0, sansDoute.join(' · '));
  const dcb = M.find(r => r[0] === 'Quick' && r[1] === DCB);
  t('B-AS-D ⛔⛔ CV-NUT-NEW-004 — « ' + DCB + ' » est CONSERVÉ, valeurs intactes (281,9 kcal/100 g, 996 g)…',
    !!dcb && dcb[3] === 281.9 && dcb[7] === 996, JSON.stringify(dcb));
  t('B-AS-D ⛔⛔ … et porte un « doute » qui dit d\'où il vient (la portion de la source)', !!dcb && /portion/i.test(String(dcb[9])), String(dcb && dcb[9]));
  const dosette = M.find(r => r[1] === 'Dosette salade fromage blanc ciboulette'), rust = M.find(r => r[1] === 'Grande Rustiques');
  t('B-AS-D ⛔ rien n\'est supprimé ni réécrit : 123 produits, la dosette et les Grande Rustiques gardent leurs valeurs (254,9 kcal/100 g, 226 g)',
    M.length === 123 && dosette && rust && dosette[3] === 254.9 && dosette[7] === 226 && rust[3] === 254.9 && rust[7] === 226, M.length + ' ' + JSON.stringify(dosette));
  const sains = ['Double Cheeseburger', 'Big Mac'].map(n => M.find(r => r[1] === n));
  t('B-AS-D ⛔ le doute est CIBLÉ : ni le Double Cheeseburger ni le Big Mac n\'en reçoivent un', sains.every(r => r && !r[9]), JSON.stringify(sains.map(r => r && r[9])));

  console.log('\n═══ B-AS-G. NUT-LOT-A — les générateurs, exécutés sur une COPIE de l\'arbre ═══');
  const g0 = genAlias(null);
  t('B-AS-G ① tools/alias.py, copie intacte : il produit, et EXACTEMENT data/alias.json (reproductible, aucune retouche à la main)',
    g0.code === 0 && g0.ecrit && g0.ecrit.equals(fs.readFileSync(path.join(ROOT, 'data', 'alias.json'))), 'code ' + g0.code + ' ' + g0.sortie.slice(-200));
  const g1 = genAlias({ ancre: 'AJOUTS = {\n', ligne: "    'pain de seigle': (7110, 'INJECTION DE TEST — vise le pain complet'),\n" });
  t('B-AS-G ② ⛔⛔ une clé fautive INJECTÉE (« pain de seigle » → pain complet, alors que « Pain de seigle et froment » existe) : le générateur REFUSE et n\'écrit rien',
    !g1.err && g1.code !== 0 && g1.ecrit === null && /pain de seigle/.test(g1.sortie), g1.err || ('code ' + g1.code + ' écrit=' + !!g1.ecrit + ' ' + g1.sortie.slice(-240)));
  const g2 = genAlias({ ancre: 'CORRECTIONS = {\n', ligne: "    'spaghetti': (9103, 'INJECTION DE TEST — une traduction voulue détournée'),\n" });
  t('B-AS-G ③ ⛔ une traduction VOULUE détournée vers une autre cible (« spaghetti » → riz complet) n\'est plus couverte par sa justification : REFUS',
    !g2.err && g2.code !== 0 && g2.ecrit === null && /spaghetti/.test(g2.sortie), g2.err || ('code ' + g2.code + ' écrit=' + !!g2.ecrit + ' ' + g2.sortie.slice(-240)));
  const m0 = genMarques();
  t('B-AS-G ④ tools/marques.py, copie intacte : il produit, et EXACTEMENT data/marques.json (reproductible)',
    m0.code === 0 && m0.ecrit && m0.ecrit.equals(fs.readFileSync(path.join(ROOT, 'data', 'marques.json'))), 'code ' + m0.code + ' ' + m0.sortie.slice(-200));
};

/* ── l'écran : la vraie frappe, en ligne (la table d'alias joue) ── */
const CAS = [];
let n = 1;
for (const [k, [, re, raison]] of Object.entries(CORRIGES))
  CAS.push({ id: 'AS-' + String(n++).padStart(2, '0'), q: FRAPPE[k] || k, ctx: 'en', top: re, raison });
for (const [k, [, re, raison]] of Object.entries(INCHANGES))
  CAS.push({ id: 'AS-' + String(n++).padStart(2, '0'), q: FRAPPE[k] || k, ctx: 'en', top: re, raison });
const FF = [
  { id: 'AS-FF1', q: 'dosette salade fromage blanc', ctx: 'en', ligne: 'Dosette salade fromage blanc ciboulette', detail: '^576 kcal la portion \\(226 g\\)', doute: true, raison: 'la dosette à 576 kcal reste, mais ⚠️ (valeurs d\'un autre produit)' },
  { id: 'AS-FF2', q: 'grande rustiques', ctx: 'en', ligne: 'Grande Rustiques ·', detail: '^576 kcal la portion \\(226 g\\)', doute: true, raison: 'les Grande Rustiques gardent leurs valeurs, avec leur ⚠️' },
  { id: 'AS-FF3', q: 'grande frites supplément sauce ranch', ctx: 'en', ligne: 'Grande Frites supplément Sauce Ranch ·', doute: true, raison: 'les frites « supplément sauce » aux valeurs d\'une petite frite : ⚠️' },
  { id: 'AS-FF4', q: 'double cheeseburger bacon', ctx: 'en', ligne: DCB, detail: '^2808 kcal la portion \\(996 g\\)', doute: true, raison: 'CV-NUT-NEW-004 : trouvable, valeurs intactes, ⚠️ visible' },
  { id: 'AS-FF5', q: 'double cheeseburger', ctx: 'en', ligne: 'Double Cheeseburger ·', doute: false, raison: 'contrôle : le doute n\'est pas étendu au Double Cheeseburger' },
  { id: 'AS-FF6', q: 'big mac', ctx: 'en', ligne: 'Big Mac', doute: false, raison: 'contrôle : pas de doute inventé' },
];

function juger(c, o) {
  const ko = [], L = o.lignes.filter(l => l.src === 'CIQ').map(l => l.titre), F = o.lignes.filter(l => l.src === 'FF');
  if (c.top && !(L[0] && new RegExp(c.top).test(L[0]))) ko.push('1ʳᵉ ligne CIQUAL ≠ /' + c.top + '/');
  if (c.ligne) {
    const l = F.find(x => x.titre.indexOf(c.ligne) === 0);
    if (!l) ko.push('ligne fast-food « ' + c.ligne + ' » absente');
    else {
      if (c.detail && !new RegExp(c.detail).test(l.detail)) ko.push('détail « ' + l.detail + ' »');
      if (c.doute === true && !/⚠️/.test(l.detail)) ko.push('⚠️ absent');
      if (c.doute === false && /⚠️/.test(l.detail)) ko.push('⚠️ inventé : « ' + l.detail + ' »');
    }
  }
  return ko;
}

module.exports.ecran = async function (t, b, PORT) {
  const tous = CAS.concat(FF);
  const P = await MS.executer(b, PORT, tous, false);
  console.log('\n-- B-AS-E. NUT-LOT-A — par la VRAIE FRAPPE, en ligne --');
  for (const c of tous) {
    const o = P.obs[c.id], ko = o ? juger(c, o) : ['non joué'];
    const vu = o ? JSON.stringify(o.lignes.filter(l => l.src === (c.ligne ? 'FF' : 'CIQ')).slice(0, 3).map(l => l.titre + (c.ligne ? ' | ' + l.detail : ''))) : '';
    t('B-AS-E ' + c.id + ' « ' + c.q + ' » — ' + c.raison, ko.length === 0, JSON.stringify(ko) + ' ' + vu);
  }
  t('B-AS-E aucune erreur de page, aucune requête hors du cas en cours', !P.errs.length && !P.anomalies.length, JSON.stringify(P.errs.concat(P.anomalies).slice(0, 3)));

  /* ── le choix du Double Cheeseburger Bacon : le doute descend jusqu'à la donnée (R4), et se redit au formulaire ── */
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => rt.abort());
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`try{localStorage.setItem('ft4_ob2','1');localStorage.setItem('ft4_guide_shown','1');localStorage.setItem('ft4_wn_seen','99');}catch(e){}`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
  const R = await pg.evaluate(async (nom) => {
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    openAddFood(); await new Promise(r => setTimeout(r, 300));
    await Promise.all([_ciqualCharger(), _marquesCharger()]);
    const inp = document.getElementById('af-desc'); inp.value = 'double cheeseburger bacon'; inp.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 900));
    const btn = [...document.querySelectorAll('#af-sugg button')].find(x => /_afSuggPrendreMarque/.test(x.getAttribute('onclick') || '') && x.textContent.indexOf(nom) >= 0);
    if (!btn) return { trouve: false };
    btn.click(); await new Promise(r => setTimeout(r, 200));
    const note = document.getElementById('af-etat-note');
    return { trouve: true, doute: (_afSrc && _afSrc.doute) || null, note: note ? note.textContent : null };
  }, DCB);
  await cx.close();
  t('B-AS-E ⛔⛔ choisir le « ' + DCB + ' » : le doute est posé sur la provenance ET redit au formulaire — jamais présenté comme certain',
    R.trouve && R.doute && /portion/i.test(R.doute) && /⚠️/.test(String(R.note)) && !errs.length, JSON.stringify(R) + ' ' + errs.join(' | '));
};

module.exports.CORRIGES = CORRIGES;
module.exports.INCHANGES = INCHANGES;
