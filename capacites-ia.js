/* ══════════════════════════════════════════════════════════════════════════════
   🗂️ LE REGISTRE CENTRAL DES CAPACITÉS IA — LA SOURCE DE VÉRITÉ, ET LA SEULE
   ══════════════════════════════════════════════════════════════════════════════
   Créé le 18/09/2026 (phase 3), après deux passes de mesure : la phase 1 a ramené
   103 lignes d'appel à **21 capacités produit**, la phase 2 a mesuré, pour chacune,
   ce que l'interface DIT, ce que le client FAIT et ce que le serveur IMPOSE.

   ⭐⭐ POURQUOI CE FICHIER EXISTE — le défaut qu'il ferme est mesuré, pas supposé.
   La politique d'accès vivait à QUATRE endroits qui ne se parlaient pas :
     · le texte de vente (`PREMIUM_PERKS`, constants.js) ;
     · les gardes du client (`S.premium`, les compteurs, les murs) ;
     · le quota du serveur (`_aiQuotaBlock_`, Code.js) ;
     · et la documentation, écrite à la main.
   La phase 2 a prouvé **9 incohérences** entre ces quatre endroits — dont trois
   capacités *vendues Premium* et *gratuites dans le code*. Aucune n'était un oubli
   isolé : elles sont la conséquence mécanique d'une politique sans propriétaire.
   👉 **Une information, un propriétaire** (R2), appliqué à la politique d'accès.

   ⛔⛔ CE FICHIER NE POSE AUCUN VERROU, ET C'EST VOULU (décision de Michel, 18/09).
   Il DÉCRIT. Rien ici n'est encore lu par un garde : brancher l'autorisation est la
   passe suivante. *Poser les verrous et écrire leur source de vérité dans le même
   mouvement, c'est se priver du seul moment où l'on peut vérifier que la description
   est juste avant qu'elle ne devienne contraignante.*

   ⚠️ DEUX CHAMPS, PAS UN — et c'est la leçon la plus chère de la phase 2.
     · `politique`  = ce qui DOIT ÊTRE (la décision de Michel, ou NON_DECIDEE) ;
     · `etatCode`   = ce qui EST (ce que le navigateur applique réellement aujourd'hui).
   Les confondre était exactement le défaut d'origine. Tant qu'ils diffèrent, l'écart
   est **écrit dans `ecart`**, jamais masqué — *un registre qui affiche la politique
   souhaitée à la place de la politique appliquée ment plus efficacement qu'une
   documentation périmée, parce qu'il a l'air d'être du code.*

   ⚠️ `serveurApplique` vaut `false` pour LES 21, sans exception. Mesure de la phase 2 :
   `_moi.premium` est lu **0 fois** dans worker.js, et le mot `premium` a **0 occurrence**
   dans `_aiQuotaBlock_`. Le serveur ne connaît que QUI (le jeton), COMBIEN (un plafond
   d'abus identique pour tous) et D'OÙ (l'Origin). Ce champ existe pour que le jour où
   l'un d'eux passe à `true`, ce soit une décision visible et non un effet de bord.

   ⭐ ET UNE ACTION SERVEUR N'EST PAS UNE CAPACITÉ (règle actée) : `coach` porte **5**
   capacités, `bodyStudy` en porte 2, `generateMealPlan` en porte 2, `summarizeCoach`
   en porte 2. 21 capacités pour 14 actions — le registre est indexé par capacité.
   ══════════════════════════════════════════════════════════════════════════════ */

/* Les SEPT formes de quota. ⚠️ `par_evenement` n'existe nulle part dans le code
   aujourd'hui : c'est `milo.memory.backfill` qui l'exige (N périodes déclenchées par
   UN événement, pas N usages par jour). Il est déclaré ici parce que le registre doit
   pouvoir l'exprimer avant qu'on sache le compter.

   ⭐⭐ `non_decide` EST ARRIVÉ EN PHASE 3.1, ET IL NE DOUBLE PAS `par_evenement`.
   Les deux disent « je ne sais pas », mais pas la même chose :
     · `par_evenement` + `quotaValeur:null` = la FORME est connue, la TAILLE n'est pas
       mesurée (backfill : N périodes, mais on ignore ce que vaut N) ;
     · `non_decide`                         = la FORME elle-même n'est pas tranchée.
   Michel, 19/09, sur `nutrition.mealPlan.ai` : *« le nombre maximal de générations
   gratuites complètes n'est PAS décidé ici. Ne pas inventer 1/jour, 3/jour, 5/mois ou
   autre quota. »* ⛔ Écrire `illimite` aurait été **inventer une décision** (règle d'or
   15) : le code ne plafonne rien aujourd'hui, mais la politique, elle, reste ouverte.
   *Un registre qui n'a pas de mot pour « pas décidé » finit toujours par écrire une
   décision à la place.* */
const QUOTA_TYPES = ['usage_total', 'usage_par_jour', 'usage_par_mois',
                     'illimite', 'zero', 'par_evenement', 'non_decide'];

/* Les six politiques d'accès. ⭐ `NON_DECIDEE` reste une valeur de plein droit — même
   si, depuis la phase 3.1, PLUS AUCUNE capacité ne la porte. ⛔ On ne retire pas la
   valeur : elle devra resservir à la prochaine capacité déclarée avant d'être tranchée,
   et la supprimer forcerait le suivant à choisir « FREE » par défaut, c'est-à-dire
   exactement la faute qu'elle existe pour empêcher (règle d'or 15). */
const POLITIQUES = ['FREE', 'FREEMIUM', 'PREMIUM', 'ADMIN', 'INTERNE', 'NON_DECIDEE'];

const CAPACITES_IA = [

  // ── MILO ───────────────────────────────────────────────────────────────────
  {
    id: 'milo.chat', module: 'Milo', declenchement: 'manuel', emploieIA: true,
    politique: 'FREEMIUM', etatCode: 'FREEMIUM',
    gratuits: 10, quotaType: 'usage_total', quotaValeur: 10, quotaPeriode: null,
    actionServeur: 'coach', porteAppsScript: 'coach', serveurApplique: false,
    decisionSource: 'COACH_FREE_LIMIT (prod)', decisionDate: '2026-09-18',
    ecart: "un chip `.coach-qr` présent dans le DOM fait passer TOUT message tapé en " +
           "noQuota : la condition porte sur la présence d'un chip, pas sur le fait que " +
           "le message y réponde",
    notes: "compteur S.coachFree — le SEUL qui ne part jamais au cloud",
  },
  {
    id: 'milo.debrief', module: 'Milo', declenchement: 'automatique', emploieIA: true,
    politique: 'PREMIUM', etatCode: 'FREE',
    gratuits: 0, quotaType: 'zero', quotaValeur: 0, quotaPeriode: null,
    actionServeur: 'coach', porteAppsScript: 'coach', serveurApplique: false,
    decisionSource: 'Michel, phase 3.1 (arbitrage 1)', decisionDate: '2026-09-19',
    ecart: "AUCUN garde dans le code : le débrief part pour tout le monde. La décision " +
           "du 19/09 n'est pas encore appliquée — le verrou appartient à la phase " +
           "serveur. Défaut annexe inchangé : un jeton par séance empêche de payer deux " +
           "fois, mais une boucle de réessai peut émettre DEUX appels pour une seule fin " +
           "de séance.",
    notes: "⭐ LE SOCLE DÉTERMINISTE DE FIN DE SÉANCE RESTE DISPONIBLE SANS IA — c'est le " +
           "débrief CHIFFRÉ, calculé en local (décision `SEANCE-DESSAI`). Ce qui devient " +
           "Premium est le JUGEMENT de Milo par-dessus, pas les faits. " +
           "Part aussi sur la navigation vers l'onglet Coach et sur un rattrapage 3 s " +
           "après chaque chargement.",
  },
  {
    id: 'milo.memory', module: 'Milo', declenchement: 'automatique', emploieIA: true,
    politique: 'PREMIUM', etatCode: 'FREE',
    gratuits: 0, quotaType: 'zero', quotaValeur: 0, quotaPeriode: null,
    actionServeur: 'summarizeCoach', porteAppsScript: 'summarizeCoach', serveurApplique: false,
    decisionSource: 'Michel, arbitrage Q3 (M12)', decisionDate: '2026-09-18',
    ecart: "le code ne porte AUCUN garde : _saveCoachMemory part dès 4 messages, pour " +
           "tout le monde. La décision M12 n'est pas encore appliquée.",
    notes: "⭐ M12 : la CONSERVATION des faits reste FREE ; c'est l'ENTRETIEN IA de la " +
           "mémoire structurée qui devient Premium. Ne jamais confondre les deux.",
  },
  {
    id: 'milo.sessionToJson', module: 'Milo', declenchement: 'automatique', emploieIA: true,
    politique: 'INTERNE', etatCode: 'INTERNE',
    gratuits: null, quotaType: 'illimite', quotaValeur: null, quotaPeriode: null,
    actionServeur: 'seanceJson', porteAppsScript: null, serveurApplique: false,
    decisionSource: 'architecture cerveau/cervelet', decisionDate: '2026-08-19',
    ecart: null,
    notes: "le cervelet : il ne reçoit que du texte, ni profil ni e-mail. ⭐ SEULE " +
           "capacité sans seconde porte Apps Script.",
  },

  // ── NUTRITION ──────────────────────────────────────────────────────────────
  {
    id: 'nutrition.label.ai', module: 'Nutrition', declenchement: 'manuel', emploieIA: true,
    politique: 'FREEMIUM', etatCode: 'FREEMIUM',
    gratuits: 25, quotaType: 'usage_total', quotaValeur: 25, quotaPeriode: null,
    actionServeur: 'foodLabel', porteAppsScript: 'foodLabel', serveurApplique: false,
    decisionSource: 'FOOD_AI_FREE_LIMIT · pot séparé en phase 3.1', decisionDate: '2026-09-19',
    ecart: "le pot est désormais PROPRE (S.foodLabelAiUses) : la politique est appliquée " +
           "par le client, pas par le serveur — `serveurApplique` reste false",
    notes: "⭐ pot séparé le 19/09 : il ne partage plus son compteur avec le repas décrit " +
           "ni avec le repli code-barres. La saisie à la main reste gratuite et illimitée.",
  },
  {
    id: 'nutrition.barcode.aiFallback', module: 'Nutrition', declenchement: 'manuel',
    emploieIA: true,
    politique: 'PREMIUM', etatCode: 'FREEMIUM',
    gratuits: 0, quotaType: 'zero', quotaValeur: 0, quotaPeriode: null,
    actionServeur: 'readBarcode', porteAppsScript: 'readBarcode', serveurApplique: false,
    decisionSource: 'Michel, phase 1 · confirmé phase 3.1', decisionDate: '2026-09-19',
    ecart: "⚠️ LE CODE ACCORDE ENCORE 25 USAGES GRATUITS, sur un compteur qui lui est " +
           "PROPRE (S.foodBarcodeAiUses) depuis le 19/09. La séparation est faite, le " +
           "verrou Premium ne l'est pas : il appartient à la phase serveur. ⛔ Le " +
           "compteur propre n'est pas une demi-mesure, c'est le SEUL état sûr — retirer " +
           "le pot sans poser le verrou aurait rendu cette capacité ILLIMITÉE ET " +
           "GRATUITE, soit l'exact contraire de la décision (mesuré : deux portes " +
           "réelles, le bouton « 🆘 si la caméra n'y arrive pas » et le repli du " +
           "scanner).",
    notes: "⛔ le scanner LOCAL, zxing-wasm, la validation EAN, la saisie manuelle et la " +
           "recherche déterministe restent FREE : seul le repli IA est concerné",
  },
  {
    id: 'nutrition.mealEstimate.ai', module: 'Nutrition', declenchement: 'manuel',
    emploieIA: true,
    politique: 'FREEMIUM', etatCode: 'FREEMIUM',
    gratuits: 25, quotaType: 'usage_total', quotaValeur: 25, quotaPeriode: null,
    actionServeur: 'estimateFood', porteAppsScript: 'estimateFood', serveurApplique: false,
    decisionSource: 'FOOD_AI_FREE_LIMIT · pot séparé en phase 3.1', decisionDate: '2026-09-19',
    ecart: "le pot est désormais PROPRE (S.foodMealEstimateAiUses) : la politique est " +
           "appliquée par le client, pas par le serveur — `serveurApplique` reste false",
    notes: "⭐ pot séparé le 19/09 : consommer une estimation de repas ne retire plus rien " +
           "à la lecture d'étiquette, et réciproquement.",
  },
  {
    id: 'nutrition.mealPlan.ai', module: 'Nutrition', declenchement: 'manuel', emploieIA: true,
    politique: 'FREEMIUM', etatCode: 'FREEMIUM',
    gratuits: null, quotaType: 'non_decide', quotaValeur: null, quotaPeriode: null,
    /* ⭐⭐ LE PLUS PETIT CHAMP QUI DIT LA DÉCISION, ET LE SEUL DU REGISTRE (Michel, 19/09 :
       *« ajouter le PLUS PETIT champ descriptif nécessaire »*). ⛔ Surtout PAS deux
       capacités `mealPlan.day` et `mealPlan.week` : le jour et la semaine sont **le même
       besoin produit** vu à deux profondeurs — les séparer aurait fait une 22ᵉ capacité
       et cassé le compte acté. Aucune autre capacité ne porte ce champ, parce qu'aucune
       autre ne varie par PÉRIMÈTRE : son absence se lit « pas de variation », ce qui est
       le fait. */
    perimetre: { free: 'jour', premium: 'semaine' },
    actionServeur: 'generateMealPlan', porteAppsScript: 'generateMealPlan',
    serveurApplique: false,
    decisionSource: 'Michel, phase 3.1 (arbitrage 3)', decisionDate: '2026-09-19',
    ecart: "⚠️ `etatCode` passe de FREE à FREEMIUM et ce n'est PAS un adoucissement : le " +
           "client applique DÉJÀ la variation de périmètre (app.js, `scope: isPrem ? " +
           "'week' : 'day'`). Ce qui reste ouvert est ailleurs, et c'est écrit : ① le " +
           "serveur ne vérifie pas le `scope` reçu, donc un navigateur modifié demande la " +
           "semaine ; ② le NOMBRE de générations complètes n'a aucun plafond pour " +
           "personne — et il reste NON DÉCIDÉ, pas « illimité ».",
    notes: "⭐ le quota de nombre d'appels est NON DÉCIDÉ (quotaType `non_decide`) : " +
           "Michel a tranché le périmètre, pas le nombre. Inventer 1/jour ou 5/mois " +
           "serait inventer une décision (règle d'or 15).",
  },
  {
    id: 'nutrition.mealPlan.regen', module: 'Nutrition', declenchement: 'manuel',
    emploieIA: true,
    politique: 'FREEMIUM', etatCode: 'FREEMIUM',
    gratuits: 1, quotaType: 'usage_par_jour', quotaValeur: 1, quotaPeriode: 'jour',
    actionServeur: 'generateMealPlan', porteAppsScript: 'generateMealPlan',
    serveurApplique: false,
    decisionSource: 'écran Nutrition (« 1 régénération/jour en gratuit ») · inchangé en 3.1',
    decisionDate: '2026-09-18',
    ecart: "le compteur vit toujours DANS S.mealPlan (il n'a pas de propriétaire à lui), " +
           "et le serveur ne l'applique pas. ⭐ La porte de contournement, elle, est " +
           "FERMÉE le 19/09 : une génération complète ne remet plus `regenCount` à 0 le " +
           "jour même.",
    notes: "⭐ correctif 19/09, local et sans dépendance au verrou serveur : une " +
           "génération complète du plan REPORTE le compteur du jour au lieu de le " +
           "réinitialiser. Sans ça, « 1 régénération/jour » se levait en appuyant sur le " +
           "bouton voisin, qui n'a aucun plafond.",
  },
  {
    id: 'nutrition.mealPlanImport.ai', module: 'Nutrition', declenchement: 'manuel',
    emploieIA: true,
    politique: 'PREMIUM', etatCode: 'FREE',
    gratuits: 0, quotaType: 'zero', quotaValeur: 0, quotaPeriode: null,
    actionServeur: 'importMealPlan', porteAppsScript: 'importMealPlan', serveurApplique: false,
    decisionSource: 'Michel, phase 3.1 (arbitrage 2)', decisionDate: '2026-09-19',
    ecart: "ni l'ouvreur ni le porteur ne vérifient quoi que ce soit : l'import IA d'un " +
           "plan de diététicien reste gratuit dans le code. La décision du 19/09 attend " +
           "le verrou de la phase serveur.",
    notes: "⭐ la SAISIE MANUELLE du plan reste indépendante et gratuite : ce qui devient " +
           "Premium est la LECTURE IA d'une photo ou d'un PDF, pas le fait d'avoir un plan.",
  },

  // ── SÉANCE ─────────────────────────────────────────────────────────────────
  {
    id: 'training.programImport.ai', module: 'Séance', declenchement: 'manuel',
    emploieIA: true,
    politique: 'FREEMIUM', etatCode: 'FREEMIUM',
    gratuits: 2, quotaType: 'usage_total', quotaValeur: 2, quotaPeriode: null,
    actionServeur: 'importProgram', porteAppsScript: 'importProgram', serveurApplique: false,
    decisionSource: 'Michel, 31/07/2026', decisionDate: '2026-07-31',
    ecart: null,
    notes: "compteur S.progImports, synchronisé au cloud mais jamais vérifié par le serveur",
  },
  {
    id: 'training.historyImport.ai', module: 'Séance', declenchement: 'manuel',
    emploieIA: true,
    politique: 'FREEMIUM', etatCode: 'FREEMIUM',
    gratuits: 1, quotaType: 'usage_total', quotaValeur: 1, quotaPeriode: null,
    actionServeur: 'importHistory', porteAppsScript: 'importHistory', serveurApplique: false,
    decisionSource: 'décision produit', decisionDate: '2026-09-18',
    ecart: "l'incrément du compteur n'est PAS conditionné par !S.premium, contrairement " +
           "aux deux compteurs d'import jumeaux",
    notes: null,
  },
  {
    id: 'training.programAnalysis.ai', module: 'Séance', declenchement: 'manuel',
    emploieIA: true,
    politique: 'PREMIUM', etatCode: 'PREMIUM',
    gratuits: 0, quotaType: 'zero', quotaValeur: 0, quotaPeriode: null,
    actionServeur: 'coach', porteAppsScript: 'coach', serveurApplique: false,
    decisionSource: 'PREMIUM_PERKS', decisionDate: '2026-09-18',
    ecart: null,
    notes: "double garde côté client : le bouton n'est pas rendu, et la fonction refuse",
  },

  // ── PROFIL ─────────────────────────────────────────────────────────────────
  {
    id: 'profile.morphology.ai', module: 'Profil', declenchement: 'manuel', emploieIA: true,
    politique: 'PREMIUM', etatCode: 'PREMIUM',
    gratuits: 0, quotaType: 'zero', quotaValeur: 0, quotaPeriode: null,
    actionServeur: 'morphoAnalysis', porteAppsScript: 'morphoAnalysis', serveurApplique: false,
    decisionSource: 'PREMIUM_PERKS', decisionDate: '2026-09-18',
    ecart: null,
    notes: "le garde est sur l'ouvreur de la modale, pas sur la fonction qui appelle l'IA",
  },
  {
    id: 'profile.bodyStudy.ai', module: 'Profil', declenchement: 'manuel', emploieIA: true,
    politique: 'PREMIUM', etatCode: 'PREMIUM',
    gratuits: 0, quotaType: 'zero', quotaValeur: 0, quotaPeriode: null,
    actionServeur: 'bodyStudy', porteAppsScript: 'bodyStudy', serveurApplique: false,
    decisionSource: 'PREMIUM_PERKS', decisionDate: '2026-09-18',
    ecart: null, notes: "garde sur l'ouvreur",
  },
  {
    id: 'profile.bodySeries.ai', module: 'Profil', declenchement: 'manuel', emploieIA: true,
    politique: 'INTERNE', etatCode: 'INTERNE',
    gratuits: 4, quotaType: 'usage_par_mois', quotaValeur: 4, quotaPeriode: 'mois',
    actionServeur: 'bodyStudy', porteAppsScript: 'bodyStudy', serveurApplique: false,
    decisionSource: 'réservé aux super-testeurs', decisionDate: '2026-09-18',
    ecart: null,
    notes: "⭐ MÊME action serveur que profile.bodyStudy.ai, politique différente : c'est " +
           "« route technique != capacité produit » rendu visible. Le quota mensuel est " +
           "DÉDUIT des dates de S.bodySeries, il n'a pas de compteur séparé.",
  },
  {
    id: 'profile.bodyScanImport.ai', module: 'Profil', declenchement: 'manuel',
    emploieIA: true,
    politique: 'FREEMIUM', etatCode: 'FREEMIUM',
    gratuits: 2, quotaType: 'usage_total', quotaValeur: 2, quotaPeriode: null,
    actionServeur: 'importBodyScan', porteAppsScript: 'importBodyScan', serveurApplique: false,
    decisionSource: 'Michel, 31/07/2026', decisionDate: '2026-07-31',
    ecart: null,
    notes: "⭐ la lecture LOCALE du rapport (sans IA) passe AVANT le verrou, exprès",
  },

  // ── SANTÉ ──────────────────────────────────────────────────────────────────
  {
    id: 'health.bloodTest.ai', module: 'Santé', declenchement: 'manuel', emploieIA: true,
    politique: 'PREMIUM', etatCode: 'PREMIUM',
    gratuits: 0, quotaType: 'zero', quotaValeur: 0, quotaPeriode: null,
    actionServeur: 'importBloodTest', porteAppsScript: 'importBloodTest',
    serveurApplique: false,
    decisionSource: 'Michel, 31/07/2026', decisionDate: '2026-07-31',
    ecart: "le Premium n'est annoncé nulle part : la personne le découvre au lancement",
    notes: "la carte est visible par tous ; seule l'ANALYSE IA est fermée",
  },

  // ── ADMIN ──────────────────────────────────────────────────────────────────
  {
    id: 'admin.bench.milo', module: 'Admin', declenchement: 'manuel', emploieIA: true,
    politique: 'ADMIN', etatCode: 'ADMIN',
    gratuits: null, quotaType: 'illimite', quotaValeur: null, quotaPeriode: null,
    actionServeur: 'coach', porteAppsScript: 'coach', serveurApplique: false,
    decisionSource: 'outil interne', decisionDate: '2026-09-18',
    ecart: null,
    notes: "pose S.premium=true et S.coachFree=0 pendant le test — volontaire, écrit sur " +
           "place. Consomme le MÊME quota serveur que les utilisateurs.",
  },
  {
    id: 'admin.bench.pt001', module: 'Admin', declenchement: 'manuel', emploieIA: true,
    politique: 'ADMIN', etatCode: 'ADMIN',
    gratuits: null, quotaType: 'illimite', quotaValeur: null, quotaPeriode: null,
    actionServeur: 'coach', porteAppsScript: 'coach', serveurApplique: false,
    decisionSource: 'outil interne, gardé en ft-v976 (R30)', decisionDate: '2026-08-23',
    ecart: null,
    notes: "rejoue TOUT l'historique : n+1 appels pour n séances, annoncés avant",
  },

  // ── LA 21ᵉ, AJOUTÉE EN PHASE 3 ─────────────────────────────────────────────
  {
    id: 'milo.memory.backfill', module: 'Milo', declenchement: 'automatique', emploieIA: true,
    politique: 'PREMIUM', etatCode: 'INEXISTANT',
    gratuits: 0, quotaType: 'par_evenement', quotaValeur: null, quotaPeriode: 'evenement',
    actionServeur: 'summarizeCoach', porteAppsScript: 'summarizeCoach', serveurApplique: false,
    decisionSource: 'Michel, arbitrage Q2/Q3 (M13, M14)', decisionDate: '2026-09-18',
    ecart: "n'existe pas encore dans le code : la capacité est déclarée avant d'être " +
           "construite, exprès — le registre doit pouvoir porter une politique décidée " +
           "pour une chose non bâtie",
    notes: "⭐⭐ MÊME action serveur que milo.memory, capacité DIFFÉRENTE : l'une entretient " +
           "une mémoire qui existe (déclenchement diffus), l'autre en construit une qui " +
           "n'existe pas (rafale déclenchée par UN événement). ⚠️ quotaValeur est `null` " +
           "et ce n'est pas un oubli : la taille d'une période est NON MESURÉE, et " +
           "inventer un nombre serait inventer une décision (règle d'or 15).",
  },
];

/* ── LECTURE SEULE — aucun appelant aujourd'hui, et c'est volontaire ──────────
   ⛔ Ces deux fonctions ne DÉCIDENT rien : elles lisent. Le mécanisme central
   d'autorisation viendra s'appuyer dessus à la passe suivante. Les poser maintenant
   donne au registre un point d'entrée unique dès le premier jour — sans quoi chaque
   appelant futur irait chercher le tableau lui-même, et on reconstruirait la
   dispersion qu'on vient de supprimer (R2). */
function capaciteIA(id) {
  try {
    for (var i = 0; i < CAPACITES_IA.length; i++) {
      if (CAPACITES_IA[i].id === id) return CAPACITES_IA[i];
    }
  } catch (e) {}
  return null;                     // ⛔ on rend `null`, jamais un objet par défaut :
}                                  //    une capacité inconnue doit se voir (R29).

function capacitesParAction(action) {
  var out = [];
  try {
    for (var i = 0; i < CAPACITES_IA.length; i++) {
      if (CAPACITES_IA[i].actionServeur === action) out.push(CAPACITES_IA[i]);
    }
  } catch (e) {}
  return out;
}

/* Rend le registre lisible depuis Node (les témoins et le générateur de la
   documentation), sans rien changer pour le navigateur. */
try {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CAPACITES_IA: CAPACITES_IA, QUOTA_TYPES: QUOTA_TYPES,
                       POLITIQUES: POLITIQUES, capaciteIA: capaciteIA,
                       capacitesParAction: capacitesParAction };
  }
} catch (e) {}
