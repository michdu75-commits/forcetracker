/* ══════════════════════════════════════════════════════════════════════════════════════
   🧾 CCXXVIII bis — QUI EST UN GÉNÉRATEUR ? (13/10/2026, session-B, clôture technique Nutrition)
   Le bloc CCXXVIII du runner (« un fichier généré doit rester régénérable », 04/09/2026) exige que
   tout `tools/*.py` qui lit un classeur `.xlsx` soit DÉCLARÉ dans `data/sources/README.md`. Il
   reconnaissait un générateur à un seul signe : son texte CITE « .xlsx ».
   ⛔ MESURÉ (passe D-031 du 13/10 sur l'arbre `afe1e568`, son SEUL rouge) : l'outil de contrôle
   négatif de NUT-LOT-A, `tools/mut_food_alias_sens.py`, cite le classeur fast-food parce qu'il
   fait RÉGÉNÉRER `data/marques.json` sur une COPIE de l'arbre — il ne produit aucune donnée servie.
   Il était compté comme générateur non déclaré : un faux positif, pas un défaut de provenance.
   ⭐ LA RÈGLE : un OUTIL DE MUTATION (`tools/mut_*.py` qui travaille sur une copie — `copytree`)
   n'est pas un générateur. ⛔ Le nom seul ne suffit pas : un `mut_*.py` qui écrirait dans le
   dépôt reste compté. Et rien d'autre ne change — un vrai générateur non déclaré rougit comme avant.
   Une seule logique (`generateursXlsx`), lue par le bloc CCXXVIII ET par ces témoins (R2).
   Banc seul : `node tools/banc_gouv_generateurs.js` · contrôle négatif : `tools/mut_gouv_generateurs.py`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

/* Un outil de mutation : nommé `mut_*.py` ET travaillant sur une copie de l'arbre. */
function outilDeMutation(nom, texte) {
  return /^mut_.*\.py$/.test(nom) && /copytree/.test(texte);
}
/* Les générateurs qui lisent un classeur : les `.py` qui citent « .xlsx », hors outils de mutation. */
function generateursXlsx(fichiers, lire) {
  return fichiers.filter(f => f.endsWith('.py')).filter(f => {
    const s = lire(f);
    return /\.xlsx/i.test(s) && !outilDeMutation(f, s);
  });
}

module.exports = { outilDeMutation, generateursXlsx };

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n-- CCXXVIII bis. Qui est un générateur ? (13/10/2026) --');
  const dirTools = path.join(ROOT, 'tools');
  const lire = f => fs.readFileSync(path.join(dirTools, f), 'utf8');
  const fichiers = fs.readdirSync(dirTools);
  const gens = generateursXlsx(fichiers, lire);
  const doc = fs.readFileSync(path.join(ROOT, 'data', 'sources', 'README.md'), 'utf8');
  /* ① les VRAIS générateurs restent vus, et chacun est déclaré */
  const vrais = ['alias.py', 'ciqual.py', 'marques.py'];
  t('⛔ CONTRÔLE — les 3 vrais générateurs (alias, ciqual, marques) sont vus, et TOUT générateur vu est déclaré dans le tableau des sources',
    vrais.every(f => gens.includes(f)) && gens.every(f => doc.indexOf('tools/' + f) >= 0), 'vus : ' + gens.join(' · '));
  /* ② le faux positif mesuré : l'outil de mutation cite bien un .xlsx (le témoin mesure quelque chose) mais n'est pas compté */
  const mut = 'mut_food_alias_sens.py', sm = fichiers.includes(mut) ? lire(mut) : '';
  t('⭐ un OUTIL DE MUTATION qui cite un .xlsx (`tools/mut_food_alias_sens.py`, travail sur une copie) n\'est pas un générateur',
    /\.xlsx/i.test(sm) && /copytree/.test(sm) && !gens.includes(mut), 'compté : ' + gens.includes(mut));
  /* ③ contrôle négatif EN MÉMOIRE : un vrai générateur non déclaré rougit toujours ; le nom « mut_ » seul n'excuse rien */
  const faux = { 'gen_faux.py': "src = 'faux.xlsx'", 'mut_sur_depot.py': "open('data/sources/faux.xlsx')", 'mut_sur_copie.py': "shutil.copytree(SRC, a)  # faux.xlsx", 'autre.py': 'print(1)' };
  const g = generateursXlsx(Object.keys(faux), f => faux[f]), docFaux = '| `data/x.json` | `tools/autre.py` | `x.xlsx` |';
  const nonDeclares = g.filter(f => docFaux.indexOf('tools/' + f) < 0);
  t('⭐⭐ CONTRÔLE NÉGATIF — un générateur NON DÉCLARÉ reste détecté, et un `mut_*.py` qui ne travaille pas sur une copie reste compté',
    JSON.stringify(nonDeclares) === JSON.stringify(['gen_faux.py', 'mut_sur_depot.py']), 'non déclarés : ' + JSON.stringify(nonDeclares));
};
