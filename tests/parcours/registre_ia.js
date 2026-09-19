/* ════════════════════════════════════════════════════════════════════════════════════════
   BLOCS B-CCCXXXI et B-CCCXXXII — LE REGISTRE CENTRAL DES 21 CAPACITÉS IA (session-A, phase 3)

   ⭐⭐ CE QUE CES TÉMOINS PROTÈGENT, ET POURQUOI ÇA VAUT LA PEINE.
   La phase 2 a mesuré **9 incohérences** entre quatre endroits qui décrivaient la même
   politique d'accès sans se parler : le texte de vente, les gardes du client, le quota du
   serveur, et la documentation écrite à la main. Le registre supprime la cause — un seul
   propriétaire (R2). Mais un propriétaire unique ne protège de rien s'il peut diverger en
   silence de ce qu'il décrit, ou si la documentation se remet à vivre sa vie.

   ⛔ DEUX BLOCS, DEUX MÉTIERS DIFFÉRENTS :
     · **B-CCCXXXI** éprouve le registre lui-même — sa FORME (21, pas de doublon, toutes les
       formes de quota exprimables) et sa FIDÉLITÉ au code servi (les actions déclarées
       existent vraiment, les capacités de la phase 1 sont toutes là).
     · **B-CCCXXXII** éprouve le lien registre → documentation. Il ne relit pas le texte : il
       RÉGÉNÈRE et compare. *Un témoin qui vérifierait que la doc « contient les bons mots »
       resterait vert sur une doc à moitié périmée.*

   ⚠️ CE QUE CES BLOCS NE MESURENT PAS, ET C'EST ÉCRIT EXPRÈS : ils ne vérifient **pas** que
   le code applique la politique. Il ne l'applique pas encore, et le registre le dit lui-même
   dans son champ `etatCode`. Un témoin qui exigerait la conformité ferait rougir un dépôt
   parfaitement conforme à la décision de Michel (« phase 3 ne pose pas encore les verrous »).
   ════════════════════════════════════════════════════════════════════════════════════════ */

function source(t, ROOT, fs, path) {
  const R = require(path.join(ROOT, 'capacites-ia.js'));
  const C = R.CAPACITES_IA;

  /* Le code servi, commentaires neutralisés — on mesure le CODE, jamais ce qui en parle.
     ⚠️ Les commentaires de `capacites-ia.js` citent abondamment les noms d'actions et de
     capacités (R30 : la raison s'écrit à côté). Un témoin qui lirait le fichier brut
     resterait vert quoi qu'on retire du tableau. */
  const nu = (s) => String(s || '').replace(/\/\*[\s\S]*?\*\//g, '')
                                   .replace(/(^|[^:"'])\/\/[^\n]*/gm, '$1');
  const CONST = nu(fs.readFileSync(path.join(ROOT, 'constants.js'), 'utf8'));
  const WRK = nu(fs.readFileSync(path.join(ROOT, 'worker.js'), 'utf8'));

  const ids = C.map(c => c.id);
  const actions = [...new Set(C.map(c => c.actionServeur))];

  console.log('\n═══ B-CCCXXXI. Le registre central des capacités IA (forme et fidélité) ═══');

  // ── ① à ④ : la forme, ce que Michel a explicitement demandé de tester ────────────────
  t('B-CCCXXXI ① ⭐⭐ le registre porte EXACTEMENT 21 capacités',
    C.length === 21, 'trouvé ' + C.length);

  t('B-CCCXXXI ② ⛔ aucun identifiant en double',
    new Set(ids).size === ids.length,
    'doublons : ' + ids.filter((x, i) => ids.indexOf(x) !== i).join(', '));

  /* ⭐ LA LISTE, PAS LE NOMBRE. Un témoin qui ne compterait que 21 resterait vert si l'on
     remplaçait une capacité par une autre — exactement le genre d'échange silencieux que
     ce registre doit rendre impossible. */
  const PHASE1 = ['milo.chat', 'milo.debrief', 'milo.memory', 'milo.sessionToJson',
    'nutrition.label.ai', 'nutrition.barcode.aiFallback', 'nutrition.mealEstimate.ai',
    'nutrition.mealPlan.ai', 'nutrition.mealPlan.regen', 'nutrition.mealPlanImport.ai',
    'training.programImport.ai', 'training.historyImport.ai', 'training.programAnalysis.ai',
    'profile.morphology.ai', 'profile.bodyStudy.ai', 'profile.bodySeries.ai',
    'profile.bodyScanImport.ai', 'health.bloodTest.ai', 'admin.bench.milo',
    'admin.bench.pt001'];
  const perdues = PHASE1.filter(x => ids.indexOf(x) < 0);
  t('B-CCCXXXI ③ ⭐ aucune des 20 capacités de la phase 1 n\'a été perdue ni renommée',
    perdues.length === 0, 'manquantes : ' + perdues.join(', '));

  t('B-CCCXXXI ④ ⭐⭐ `milo.memory.backfill` est présente, et AJOUTÉE À LA FIN',
    ids[20] === 'milo.memory.backfill', 'dernière = ' + ids[ids.length - 1]);

  // ── ⑤ : le cœur de la règle actée — route technique != capacité produit ──────────────
  const mem = R.capaciteIA('milo.memory');
  const bkf = R.capaciteIA('milo.memory.backfill');
  t('B-CCCXXXI ⑤ ⭐⭐ `milo.memory` et `milo.memory.backfill` sont DISTINCTES malgré la '
    + 'MÊME action serveur',
    !!mem && !!bkf && mem.actionServeur === bkf.actionServeur
      && mem.id !== bkf.id && mem.declenchement === bkf.declenchement
      && mem.quotaType !== bkf.quotaType,
    mem && bkf ? (mem.quotaType + ' vs ' + bkf.quotaType) : 'capacité absente');

  // ── ⑥ à ⑩ : les formes de quota doivent TOUTES être exprimables ─────────────────────
  const parQuota = (q) => C.filter(c => c.quotaType === q);
  t('B-CCCXXXI ⑥ ⛔ une capacité Premium avec quota `zero` est représentable',
    parQuota('zero').some(c => c.politique === 'PREMIUM'),
    parQuota('zero').length + ' capacité(s) à quota zéro');
  t('B-CCCXXXI ⑦ ⭐ un freemium en TOTAL (et non par jour) est représentable',
    parQuota('usage_total').some(c => c.politique === 'FREEMIUM' && c.quotaValeur > 0), '');
  t('B-CCCXXXI ⑧ ⭐ un quota JOURNALIER est représentable',
    parQuota('usage_par_jour').length >= 1, '');
  t('B-CCCXXXI ⑨ ⭐ un quota MENSUEL est représentable',
    parQuota('usage_par_mois').length >= 1, '');
  t('B-CCCXXXI ⑩ ⭐⭐ un quota `par_evenement` est représentable — c\'est ce que '
    + '`milo.memory.backfill` exige et qu\'aucun compteur actuel ne sait exprimer',
    parQuota('par_evenement').length >= 1
      && parQuota('par_evenement')[0].id === 'milo.memory.backfill', '');

  /* ⛔ ET SA VALEUR EST `null`, CE QUI N'EST PAS UN OUBLI. La taille d'une période de
     rattrapage est NON MESURÉE : y écrire un nombre serait inventer une décision (règle
     d'or 15). Le témoin fige donc l'ABSENCE, pour qu'un chiffre glissé plus tard soit
     une décision visible et non un effet de bord. */
  t('B-CCCXXXI ⑪ ⛔ la taille d\'une période de backfill reste NON MESURÉE (`null`)',
    bkf && bkf.quotaValeur === null, bkf ? String(bkf.quotaValeur) : '(absente)');

  // ── ⑫ à ⑬ : automatique et Admin doivent se lire sans interprétation ────────────────
  const auto = C.filter(c => c.declenchement === 'automatique').map(c => c.id);
  t('B-CCCXXXI ⑫ ⭐ les capacités AUTOMATIQUES sont identifiables sans interprétation',
    auto.length === 4 && auto.indexOf('milo.debrief') >= 0
      && auto.indexOf('milo.memory') >= 0 && auto.indexOf('milo.sessionToJson') >= 0
      && auto.indexOf('milo.memory.backfill') >= 0, auto.join(', '));
  const adm = C.filter(c => c.politique === 'ADMIN').map(c => c.id);
  t('B-CCCXXXI ⑬ ⭐ les capacités ADMIN sont identifiables sans interprétation',
    adm.length === 2 && adm.indexOf('admin.bench.milo') >= 0
      && adm.indexOf('admin.bench.pt001') >= 0, adm.join(', '));

  // ── ⑭ à ⑯ : la fidélité au CODE SERVI ───────────────────────────────────────────────
  /* ⭐ LA MESURE QUI RELIE LE REGISTRE AU RÉEL. Une action déclarée qui n'existerait pas
     dans les deux listes du code ferait du registre une fiction cohérente avec elle-même.
     C'est le défaut que rien d'autre ne verrait. */
  const mProxy = /AI_PROXY_ACTIONS=\[([^\]]*)\]/.exec(CONST.replace(/\s/g, ''));
  const mWrk = /_ACTIONS_IA=newSet\(\[([^\]]*)\]/.exec(WRK.replace(/\s/g, ''));
  const listeProxy = mProxy ? (mProxy[1].match(/'(\w+)'/g) || []).map(s => s.slice(1, -1)) : [];
  const listeWrk = mWrk ? (mWrk[1].match(/'(\w+)'/g) || []).map(s => s.slice(1, -1)) : [];
  const inconnues = actions.filter(a => listeProxy.indexOf(a) < 0);
  t('B-CCCXXXI ⑭ ⭐⭐ toutes les actions déclarées existent VRAIMENT dans `AI_PROXY_ACTIONS`',
    listeProxy.length === 14 && inconnues.length === 0,
    inconnues.length ? 'inconnues : ' + inconnues.join(', ')
                     : listeProxy.length + ' actions dans le code');
  t('B-CCCXXXI ⑮ ⭐ le client et le Worker déclarent toujours la MÊME liste d\'actions',
    listeProxy.length > 0 && listeWrk.length === listeProxy.length
      && listeProxy.every(a => listeWrk.indexOf(a) >= 0),
    'client ' + listeProxy.length + ' / worker ' + listeWrk.length);

  /* ⭐ PLUSIEURS CAPACITÉS SUR UNE MÊME ROUTE — le fait qui justifie tout le registre.
     On ne fige pas un nombre : on fige qu'il EXISTE des routes partagées, et que l'action
     `coach` en porte le plus. Figer « 5 » rendrait le témoin faux le jour où une capacité
     bouge légitimement. */
  const parAction = {};
  C.forEach(c => { parAction[c.actionServeur] = (parAction[c.actionServeur] || 0) + 1; });
  const partagees = Object.keys(parAction).filter(a => parAction[a] > 1);
  t('B-CCCXXXI ⑯ ⭐⭐ plusieurs capacités partagent une même route, et c\'est représenté',
    partagees.length >= 3 && parAction['coach'] >= 4 && actions.length < C.length,
    C.length + ' capacités pour ' + actions.length + ' actions ; partagées : '
      + partagees.join(', '));

  // ── ⑰ à ⑲ : les cas que Michel a nommés ─────────────────────────────────────────────
  const sansPorte = C.filter(c => !c.porteAppsScript).map(c => c.id);
  t('B-CCCXXXI ⑰ ⭐ une capacité SANS seconde porte Apps Script est représentable',
    sansPorte.length === 1 && sansPorte[0] === 'milo.sessionToJson', sansPorte.join(', '));

  /* ⛔⛔ LE TÉMOIN LE PLUS IMPORTANT DE CE BLOC. Inscrire « FREE » à la place d'une décision
     non prise est exactement la faute que la règle d'or 15 interdit — et c'est une faute
     INVISIBLE, puisque le registre aurait l'air complet.

     ⚠️ RETOURNÉ LE 19/09/2026 (phase 3.1), PAS SUPPRIMÉ — et la nuance est tout le sujet.
     Michel a rendu les trois arbitrages : plus AUCUNE capacité ne porte `NON_DECIDEE`.
     Le témoin d'origine figeait la LISTE des trois ouvertes ; il serait devenu rouge sur un
     registre parfaitement à jour. Mais sa GARANTIE, elle, n'a pas bougé d'un pouce : *le
     registre doit rester capable de dire « pas décidé »*. On mesure donc désormais que la
     VALEUR reste déclarée, même inemployée — la retirer forcerait la prochaine capacité
     déclarée avant d'être tranchée à s'inscrire « FREE » par défaut, c'est-à-dire la faute
     exacte que ce témoin existe pour empêcher.
     ⛔ Et la contrepartie est mesurée juste à côté (bloc B-CCCXXXIV) : les trois ex-ouvertes
     portent ce que Michel a décidé, et aucune n'est devenue FREE en passant. */
  const ouvertes = C.filter(c => c.politique === 'NON_DECIDEE').map(c => c.id);
  t('B-CCCXXXI ⑱ ⭐⭐ « pas décidé » reste EXPRIMABLE même quand plus personne ne le porte',
    R.POLITIQUES.indexOf('NON_DECIDEE') >= 0 && ouvertes.length === 0,
    'déclarée : ' + (R.POLITIQUES.indexOf('NON_DECIDEE') >= 0)
      + ' · encore portée par : ' + (ouvertes.join(', ') || '(personne)'));

  /* ⭐ LA POLITIQUE ET L'ÉTAT DU CODE SONT DEUX CHAMPS, et l'écart est ÉCRIT. Un registre
     qui les confondrait afficherait la politique souhaitée comme si elle était appliquée. */
  const ecartsNonDits = C.filter(c => c.politique !== 'NON_DECIDEE'
    && c.politique !== c.etatCode && !c.ecart).map(c => c.id);
  t('B-CCCXXXI ⑲ ⭐⭐ tout écart entre la politique et le code est ÉCRIT, jamais masqué',
    ecartsNonDits.length === 0, 'écarts muets : ' + ecartsNonDits.join(', '));

  // ── ⑳ : le pot Nutrition doit pouvoir être séparé ───────────────────────────────────
  /* ⭐ Décision actée : `nutrition.barcode.aiFallback` est PREMIUM alors que les deux autres
     restent freemium. Le registre doit pouvoir porter trois politiques distinctes, même si
     le CODE les force encore à partager un compteur — c'est justement l'écart à combler. */
  const nutri = ['nutrition.label.ai', 'nutrition.barcode.aiFallback',
                 'nutrition.mealEstimate.ai'].map(x => R.capaciteIA(x));
  t('B-CCCXXXI ⑳ ⭐⭐ les trois capacités du pot Nutrition portent des politiques SÉPARÉES',
    nutri.every(Boolean)
      && nutri[1].politique === 'PREMIUM'
      && nutri[0].politique === 'FREEMIUM' && nutri[2].politique === 'FREEMIUM'
      && nutri[1].quotaType !== nutri[0].quotaType,
    nutri.map(c => c && c.id.split('.')[1] + '=' + c.politique).join(' · '));

  // ── ㉑ : le champ qui rend le verrouillage futur exprimable ──────────────────────────
  t('B-CCCXXXI ㉑ ⛔ aucune capacité ne prétend être appliquée par le serveur (mesure phase 2)',
    C.every(c => c.serveurApplique === false),
    C.filter(c => c.serveurApplique).map(c => c.id).join(', '));

  /* ⭐ LES VALEURS SONT CONTRAINTES. Sans ça, une faute de frappe (`PREMIM`) créerait une
     politique fantôme que personne ne verrait avant le jour du verrouillage. */
  const polInvalides = C.filter(c => R.POLITIQUES.indexOf(c.politique) < 0).map(c => c.id);
  const quoInvalides = C.filter(c => R.QUOTA_TYPES.indexOf(c.quotaType) < 0).map(c => c.id);
  t('B-CCCXXXI ㉒ ⛔ toutes les politiques et tous les quotas sont des valeurs DÉCLARÉES',
    polInvalides.length === 0 && quoInvalides.length === 0,
    'politiques : ' + polInvalides.join(',') + ' | quotas : ' + quoInvalides.join(','));

  // ══════════════════════════════════════════════════════════════════════════════════════
  console.log('\n═══ B-CCCXXXII. La documentation est GÉNÉRÉE, jamais écrite ═══');

  const DOC = path.join(ROOT, 'docs', 'IA-FREE-PREMIUM.md');
  let texte = '';
  let existe = false;
  try { texte = fs.readFileSync(DOC, 'utf8'); existe = true; } catch (e) {}

  t('B-CCCXXXII ① la documentation humaine existe', existe, DOC);

  t('B-CCCXXXII ② ⛔ elle annonce qu\'elle est générée ET dit où éditer à la place',
    /NE PAS ÉDITER À LA MAIN/.test(texte) && /capacites-ia\.js/.test(texte)
      && /gen_doc_ia\.js/.test(texte), '');

  /* ⭐⭐ LE TÉMOIN QUI PORTE LA DEMANDE DE MICHEL : *« je veux qu'une divergence future entre
     code et documentation fasse tomber un test »*. On ne relit pas des mots — on REGÉNÈRE
     et on compare caractère pour caractère. C'est la seule forme qui ne peut pas rester
     verte sur une documentation à moitié périmée. */
  let genere = null, erreur = '';
  try {
    const { execFileSync } = require('child_process');
    execFileSync(process.execPath, [path.join(ROOT, 'tools', 'gen_doc_ia.js'), '--check'],
                 { cwd: ROOT, stdio: 'pipe' });
    genere = true;
  } catch (e) {
    genere = false;
    erreur = String((e.stderr && e.stderr.toString()) || e.message || '').split('\n')[0];
  }
  t('B-CCCXXXII ③ ⭐⭐ la documentation est IDENTIQUE à ce que le registre produit',
    genere === true, erreur);

  /* ⭐ ET LE CONTRÔLE DOIT POUVOIR ÉCHOUER. Un `--check` qui rendrait toujours 0 serait un
     vert qui ne peut pas rougir (BUGS.md) : on l'éprouve sur un texte volontairement faux. */
  {
    let mordu = false;
    const sauve = texte;
    try {
      fs.writeFileSync(DOC, texte + '\nligne parasite\n', 'utf8');
      const { execFileSync } = require('child_process');
      try {
        execFileSync(process.execPath, [path.join(ROOT, 'tools', 'gen_doc_ia.js'), '--check'],
                     { cwd: ROOT, stdio: 'pipe' });
      } catch (e) { mordu = true; }
    } finally {
      try { fs.writeFileSync(DOC, sauve, 'utf8'); } catch (e) {}
    }
    t('B-CCCXXXII ④ ⭐⭐ le contrôle MORD vraiment (éprouvé sur une doc volontairement fausse)',
      mordu === true, '');
  }

  /* Les 21 capacités doivent être NOMMÉES dans la documentation : un tableau tronqué
     passerait la comparaison si le générateur tronquait des deux côtés. */
  const absentes = C.filter(c => texte.indexOf('`' + c.id + '`') < 0).map(c => c.id);
  t('B-CCCXXXII ⑤ ⭐ les 21 capacités sont nommées dans la documentation',
    absentes.length === 0, 'absentes : ' + absentes.join(', '));

  t('B-CCCXXXII ⑥ ⛔ la documentation ne prétend pas que le serveur applique la politique',
    /0 fois/.test(texte) && /navigateur/.test(texte), '');
}

module.exports = { source };
