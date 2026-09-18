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

/* Les six formes de quota. ⚠️ `par_evenement` n'existe nulle part dans le code
   aujourd'hui : c'est `milo.memory.backfill` qui l'exige (N périodes déclenchées par
   UN événement, pas N usages par jour). Il est déclaré ici parce que le registre doit
   pouvoir l'exprimer avant qu'on sache le compter. */
const QUOTA_TYPES = ['usage_total', 'usage_par_jour', 'usage_par_mois',
                     'illimite', 'zero', 'par_evenement'];

/* Les six politiques d'accès. ⭐ `NON_DECIDEE` est une valeur de plein droit, pas un
   trou : la phase 2 a laissé trois arbitrages ouverts, et les inscrire comme « FREE »
   reviendrait à inventer une décision que Michel n'a pas prise (règle d'or 15). */
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
    politique: 'NON_DECIDEE', etatCode: 'FREE',
    gratuits: null, quotaType: 'illimite', quotaValeur: null, quotaPeriode: null,
    actionServeur: 'coach', porteAppsScript: 'coach', serveurApplique: false,
    decisionSource: null, decisionDate: null,
    ecart: "vendu Premium par PREMIUM_PERKS, aucun garde dans le code ; un jeton par " +
           "séance empêche de payer deux fois, mais une boucle de réessai peut émettre " +
           "DEUX appels payants pour une seule fin de séance",
    notes: "part aussi sur la navigation vers l'onglet Coach et sur un rattrapage 3 s " +
           "après chaque chargement",
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
    decisionSource: 'FOOD_AI_FREE_LIMIT', decisionDate: '2026-09-18',
    ecart: "le compteur S.foodAiUses est PARTAGÉ avec deux autres capacités : tant qu'il " +
           "l'est, ces trois-là ne peuvent pas recevoir trois politiques distinctes",
    notes: "la saisie à la main reste gratuite et illimitée",
  },
  {
    id: 'nutrition.barcode.aiFallback', module: 'Nutrition', declenchement: 'manuel',
    emploieIA: true,
    politique: 'PREMIUM', etatCode: 'FREEMIUM',
    gratuits: 0, quotaType: 'zero', quotaValeur: 0, quotaPeriode: null,
    actionServeur: 'readBarcode', porteAppsScript: 'readBarcode', serveurApplique: false,
    decisionSource: 'Michel, phase 1 (acté)', decisionDate: '2026-09-18',
    ecart: "le code le laisse dans le pot freemium de 25, partagé avec l'étiquette et le " +
           "repas décrit. Séparer le pot est le préalable technique à cette décision.",
    notes: "⛔ le scanner LOCAL, zxing-wasm, la validation EAN, la saisie manuelle et la " +
           "recherche déterministe restent FREE : seul le repli IA est concerné",
  },
  {
    id: 'nutrition.mealEstimate.ai', module: 'Nutrition', declenchement: 'manuel',
    emploieIA: true,
    politique: 'FREEMIUM', etatCode: 'FREEMIUM',
    gratuits: 25, quotaType: 'usage_total', quotaValeur: 25, quotaPeriode: null,
    actionServeur: 'estimateFood', porteAppsScript: 'estimateFood', serveurApplique: false,
    decisionSource: 'FOOD_AI_FREE_LIMIT', decisionDate: '2026-09-18',
    ecart: "même pot partagé que nutrition.label.ai et nutrition.barcode.aiFallback",
    notes: null,
  },
  {
    id: 'nutrition.mealPlan.ai', module: 'Nutrition', declenchement: 'manuel', emploieIA: true,
    politique: 'NON_DECIDEE', etatCode: 'FREE',
    gratuits: null, quotaType: 'illimite', quotaValeur: null, quotaPeriode: null,
    actionServeur: 'generateMealPlan', porteAppsScript: 'generateMealPlan',
    serveurApplique: false,
    decisionSource: null, decisionDate: null,
    ecart: "la génération complète n'a AUCUN plafond, et le périmètre (jour/semaine) est " +
           "choisi par le navigateur — le serveur ne le vérifie pas",
    notes: null,
  },
  {
    id: 'nutrition.mealPlan.regen', module: 'Nutrition', declenchement: 'manuel',
    emploieIA: true,
    politique: 'FREEMIUM', etatCode: 'FREEMIUM',
    gratuits: 1, quotaType: 'usage_par_jour', quotaValeur: 1, quotaPeriode: 'jour',
    actionServeur: 'generateMealPlan', porteAppsScript: 'generateMealPlan',
    serveurApplique: false,
    decisionSource: 'écran Nutrition (« 1 régénération/jour en gratuit »)',
    decisionDate: '2026-09-18',
    ecart: "le compteur vit DANS S.mealPlan, que la génération complète réécrit avec " +
           "regenCount:0 — le plafond se lève donc en utilisant la capacité voisine, qui " +
           "n'en a aucun",
    notes: null,
  },
  {
    id: 'nutrition.mealPlanImport.ai', module: 'Nutrition', declenchement: 'manuel',
    emploieIA: true,
    politique: 'NON_DECIDEE', etatCode: 'FREE',
    gratuits: null, quotaType: 'illimite', quotaValeur: null, quotaPeriode: null,
    actionServeur: 'importMealPlan', porteAppsScript: 'importMealPlan', serveurApplique: false,
    decisionSource: null, decisionDate: null,
    ecart: "vendu Premium par PREMIUM_PERKS ; ni l'ouvreur ni le porteur ne vérifient rien",
    notes: null,
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
