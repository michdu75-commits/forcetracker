# 🧾 CONTRAT FT → MILO — « Force Tracker calcule, Milo explique »

> Créé le 25/09/2026 (chantier « contrat FT → Milo », avant FT 2.0). **Mesuré dans le code**, pas
> reconstitué de mémoire. Répond à une seule question : *qu'est-ce que Force Tracker affirme à
> Milo, d'où vient chaque information, est-elle actuelle et valide, et qu'a-t-il le droit d'en
> faire ?* Témoins : `tests/parcours/contrat_milo.js` (CTX-01…08). Contrôle négatif :
> `tools/mut_contrat_milo.py`.

## 1. L'invariant

1. **Force Tracker calcule** (BMR, TDEE, cible, macros, phase, ajustements, objectifs, programme,
   historique, statut, provenance). **Milo lit, compare, explique**, pose une question, signale
   une incohérence.
2. **Valeur métier indisponible → aucune de ses composantes n'est envoyée.** Milo ne doit pas
   pouvoir reconstruire ce que l'app n'a pas calculé.
3. **Valeur métier disponible → son calcul est envoyé EN ENTIER**, tel que l'app l'a fait. Milo
   n'a rien à reconstruire (R8).
4. **Une donnée dit son statut** : présente / absente, actuelle / historique, déclarée / calculée /
   enregistrée d'office. Une valeur par défaut n'est jamais présentée comme un fait.

## 2. Cartographie des points d'entrée (mesurée le 25/09)

Tous les appels IA passent par le **Worker** (`AI_PROXY_ACTIONS`, constants.js) et la **même
garde** : jeton S1 injecté par `_ftPoserInjecteurJeton` (constants.js), vérifié par
`_identiteIA` (worker.js) pour toute action de `_ACTIONS_IA`.

| Point d'entrée | Fonction | Contexte | Action → modèle (max_tokens) | Différences |
|---|---|---|---|---|
| Chat Coach | `sendToCoach` (coach.js) | `buildCoachContext(msg)` + historique (8) + `coachMemory` + e-mail | `coach` → claude-sonnet-4-6 (1024) | 3 tentatives réseau ; image possible |
| Débrief de séance | log.js (`instr` du débrief) | `buildCoachContext(instr)` + historique + mémoire | `coach` → idem | consigne propre au débrief |
| Analyse d'un programme | `analyzeProgIa` (log.js) | `buildCoachContext(message)` ; **la structure du programme est dans le MESSAGE** (`_formatProgForAnalysis`, séries × reps × kg de la 1ʳᵉ série) | `coach` → idem | **pas d'e-mail, pas de mémoire, historique vide, aucun réessai** ; réservé Premium ; **seul à demander une suite bornée** (`suite:true`, MILO-PDF1) |
| Laboratoire PT-001 / personas VC / banc R34 | `_pt001Ask`, `_vcAsk` (coach.js) | `buildCoachContext` | `coach` | outils admin / tests |
| Résumé de conversation | `summarizeCoach` | la conversation seule | `summarizeCoach` → Haiku (250) | pas de contexte profil |
| Traduction séance → JSON | `seanceJson` | le texte de Milo seul | `seanceJson` → Haiku | « cervelet » : ne sait rien de la personne |
| Plan de repas IA | `generateMealPlan` (app.js) | mini-contexte propre (profil, macros, régime) | `generateMealPlan` → Haiku | **refusé si le profil calorique est incomplet** (`profilCaloriqueManquants`) |
| Imports (programme, historique, bilan, sang, étiquette, code-barres), morpho, étude du corps, estimation d'aliment | fonctions dédiées | prompts propres, pas `buildCoachContext` | Sonnet / Haiku selon l'action | hors contrat conversationnel |

⚠️ **Il n'existe qu'UN constructeur de contexte conversationnel** : `buildCoachContext`. Le contrat
se tient donc à cet endroit, et chaque point d'entrée « coach » en hérite.

## 3. Le contrat, champ par champ (ce qui compte pour ce chantier)

| Donnée | Source (propriétaire) | Nature | Si dépendance absente | Milo peut |
|---|---|---|---|---|
| BMR | `bmrDetail` / `calcBMR` (state.js) | calculée, indépendante de l'activité | — | afficher, expliquer (ni dépense ni cible) |
| Niveau d'activité | `S.activityLevel` + `S.activitySrc`, `etatActivite()` | déclarée ; provenance choisi / à confirmer / hérité / absent | « NON RENSEIGNÉ » + consigne D-022/D-024 | demander ; ne rien chiffrer qui en dépend |
| TDEE | `calcTDEE` | calculée = BMR × niveau + travail + autre sport + pas | « — » | expliquer la décomposition envoyée |
| Cible | `calcMacros` ← `autoKcal` ← `_autoKcalBrut` ; ou `S.manualKcal` | calculée (ou fixée à la main) | « — » et **aucune composante** | expliquer la ligne « 🧮 CALCUL DE LA CIBLE » |
| Décomposition | **`cibleDecomposition(phase)`** (state.js, nouveau) | lit `_autoKcalBrut(phase, detail)` — **pas de 2ᵉ formule** — et se vérifie contre `calcMacros` (sinon `null`) | `null` → rien n'est écrit | la reprendre telle quelle |
| Phase nutrition | `S.nutritionPhase` | déclarée | le mot « Charge / Décharge » seul ; l'ajustement chiffré vit dans la décomposition | dire la phase |
| Type de travail | `S.workType` (**plus de défaut « bureau »**) | déclarée ; ancienne valeur = « enregistrée dans son profil » | « NON RENSEIGNÉ » | ne pas redemander s'il est connu |
| Objectifs chiffrés | `S.strengthGoals`, `S.targetWeight` | réglages ACTUELS (source de vérité), **sans date** | « Aucun objectif chiffré fixé » | s'appuyer dessus ; la mémoire des conversations ne les remplace pas |
| Historique de l'objectif | `S.goalLog` (`_goalSet`) | historique, daté | bloc absent | le citer comme un changement passé |
| Programmes | `S.programmes` (id, weeks, startDate, days[label, exs[name, note, sets[kg, reps, type, rest], group]]) | planifié | « AUCUN » | lire la structure ; **dire ce que l'app ne sait pas** |
| Lien réalisé → prévu | `session.progLabel` (texte) | libellé seulement | — | relier par le NOM, jamais plus |
| Mémoire des conversations | `S.coachMemory` (ajoutée par le Worker) | historique, résumé IA | — | contexte, jamais source d'un objectif actuel |

## 4. Ce que ce chantier a corrigé (défauts mesurés)

1. **R8** — la cible (TDEE + objectif + phase) n'arrivait qu'en morceaux (« Phase: Charge (+100 kcal) »,
   pas de delta d'objectif) → Milo écrivait « 2663 + 100 = 2963 ». Désormais : ligne de calcul complète.
2. **Fragments sans cible** — « (+100 kcal) », « (+0 kcal NEAT) », « déjà ajoutées à son TDEE »
   sortaient sans TDEE ni cible. Retirés quand la cible est indisponible.
3. **Travail** — `S.workType` valait « bureau » par défaut **et** `persist()` l'écrivait sur le
   disque (ouvrir le Profil suffisait) : un défaut se lisait comme un fait, et la question
   « métier » du questionnaire se croyait déjà répondue. Calories inchangées (bureau = absent = +0).
4. **Programme** — les jours s'appellent `label` ; le contexte lisait `name` → Milo voyait
   « Jour 1, Jour 2 ». Il reçoit maintenant les vrais noms, la charge prévue, les supersets, la
   durée, et **la liste de ce que l'app ne sait pas**. Un nom de séance sans programme enregistré
   est annoncé « NOM SEUL ».
5. **Objectifs** — statut explicite : réglages actuels, source de vérité, priment sur la mémoire.

## 5. Règles du prompt qui poussent à « compléter » (classement §16, rien supprimé)

| Règle (bloc commun) | Classe | Note |
|---|---|---|
| « N'INVENTE JAMAIS de faits sur la personne » | A — légitime | déjà le principe du contrat |
| « NE REDEMANDE JAMAIS CE QUE TU SAIS DÉJÀ » | A | rendue applicable au travail par le statut |
| PERMISSIONS BORNÉES — hypothèses par défaut sur la **fréquence** | C — repli historique | voulue pour proposer une séance ; **bornée** pour les calories par D-022/D-024 |
| « Un profil INCOMPLET n'est JAMAIS une raison d'interroger… 3 séances/sem » | C | idem |
| ANTI-FAUX-PRÉCIS — « donne des FOURCHETTES (~1900 kcal ± 200) » | D — ambiguë | écrite pour l'estimation des APPORTS ; peut être lue comme « chiffre ta cible en fourchette ». Neutralisée ici par la ligne de calcul (« explique CE détail, ne le recalcule pas ») et par D-024 quand la cible manque |
| CALENDRIER — « ne calcule JAMAIS un jour » | A | modèle à suivre : la donnée est fournie, pas calculée |

Aucune règle de classe **B** (calcul métier explicitement demandé à Milo) n'a été trouvée : le
défaut venait des **données** (fragments, défauts silencieux), pas d'une consigne de calcul.

## 6. Ce qui reste ouvert (tickets)

- **MILO-AUTH1** — ✅ **CORRIGÉ ET TESTÉ (déterministe + contrôle négatif), le 25/09 — PAS
  encore vérifié en réel** (aucun incident réel reproduit ; le Worker se déploie avec master).
  Cause : toute identité non prouvée rendait **le même 401** « Reconnecte ton appareil » —
  `reseau` (Apps Script muet), page d'erreur HTML (JSON illisible), `erreur` (stockage), réponse
  sans raison (`catch` de `handleAuthIdentity_`, traduit `refus`), `illisible`. Le chat relaie la
  phrase du serveur : une panne passagère se lisait « appareil déconnecté ».
  Correction (ft-v1223 appliqué un étage plus haut) : **liste blanche** des vrais refus
  (`revoque` · `forme` · `absent` · `inconnu`, identique à `_SB_REFUS_REELS` de supabase.js) →
  **401** « Reconnecte » ; **tout le reste → 503** `identite_indisponible` « Milo est
  momentanément indisponible… réessaie dans un instant ». ⛔ **Fail-closed dans tous les cas :
  aucun appel IA.** Pas de réessai (garde épinglée ; la distinction était prioritaire).
  Client : l'analyse de programme relaie désormais la phrase du serveur comme le chat ; aucun
  code client n'efface le jeton. Témoins `tests/parcours/auth_ia.js`, contrôle
  `tools/mut_auth_ia.py`, banc `tools/banc_auth_ia.js`.
  ⚠️ Reste : les autres écrans IA (nutrition, imports) affichent leur message générique, sans
  jamais dire « reconnecte » ; la route `cloudSave` rend encore 401 sur une panne, mais le
  client du miroir la classe déjà par la même liste blanche (ft-v1223).
  ↪️ **État au 26/09/2026** : **publié en `ft-v1235`**, Worker redéployé. **Chemin authentifié vérifié en réel**
  (tous les appels réels du banc, jeton S1, acceptés). **Refus sans jeton : protégé par les témoins**
  (`tools/banc_auth_ia.js` 25/0), **non rejoué en production**.
- **MILO-PDF1** — ✅ **CORRIGÉ ET TESTÉ (déterministe + contrôle négatif), le 25/09 — PAS vérifié
  en réel** (le Worker de prod date du 20/09, `e77060c3`, sans `stop_reason`). Cause : plafond
  1024 jetons et `stop_reason` jeté par le Worker → une coupure ressortait comme une réponse finie.
  ⚠️ « Analyse complète » était un titre écrit par **Milo** dans son texte, pas par l'app.
  Correction : le Worker rend `stopReason` · `truncated` · `complete` · `continued` (en plus de
  `reply`, inchangé) ; l'analyse de programme demande **une** suite bornée (`suite:true`), le chat
  reste à **un** appel ; une réponse restée coupée est marquée dans la fenêtre, la bulle, le fil,
  le PDF (« … INCOMPLÈTE — génération interrompue ») et le partage. Budget 1024 inchangé.
  Détail : `docs/MILO-PDF1.md` · témoins `tests/parcours/milo_pdf1.js` · contrôle
  `tools/mut_milo_pdf1.py` (26/26).
  ↪️ **MILO-PDF1B (25/09, soir) — la contre-vérification du principal a démontré trois défauts,
  corrigés, NON publiés** : ① la couture heuristique perdait ou fusionnait des mots et dupliquait
  une réponse redémarrée → remplacée par un **raccord à ancre exacte** (`<FT_SUITE>` + ancre
  recopiée ; sans preuve, la 1ʳᵉ partie reste **incomplète**) ; ② **fail-closed** : seul `end_turn`
  est complet, toute autre raison (ou un serveur sans le signal) est marquée « non confirmée » ;
  ③ **décision Michel** : aucune séance depuis une réponse non confirmée complète, et le marqueur
  est posé **avant** le texte de Milo. Détail : `docs/MILO-PDF1.md` (section MILO-PDF1B).
  ↪️ **État au 26/09/2026** : MILO-PDF1 et MILO-PDF1B **publiés en `ft-v1235`**, **Worker redéployé** (avant
  l'app), **vérification réelle faite** : V1, V2, V4 vérifiés ; V3 (suite réelle) non observée, à surveiller.
  ⚠️ Défaut actif connu : « Mes discussions » peut perdre le marqueur « coupée » (réouverture ÉTROITE de
  D-025, non corrigée). Détail : `docs/MILO-PDF1.md` (en-tête et §C).
- **Programme versionné** (principe validé par Michel) : l'app n'a ni programme actif, ni version,
  ni phase, ni RIR cible, ni lien structuré séance → version (seulement le libellé). À construire
  comme brique à part ; le contrat dit aujourd'hui honnêtement ce qui manque.
- **`analyzeProgIa`** : n'envoie ni e-mail, ni mémoire, ni historique, ni le RIR réalisé, et ne
  réessaie pas ; la structure ne porte que la 1ʳᵉ série. À aligner sur le chat si l'analyse doit
  croiser programme et performances.
- **Travail hérité** : un « bureau » écrit d'office par l'ancienne app reste indiscernable d'un vrai
  choix (même situation que l'ancien 1,55 de D-021). **Décision Michel** : faut-il le faire
  confirmer une fois ?
- **Objectifs sans date** : `S.strengthGoals` / `S.targetWeight` ne portent pas leur date de
  réglage ; la fraîcheur n'est pas mesurable. Évolution possible (horodater au réglage).

## 7. Vérification réelle (25/09, run 36131403113, claude-sonnet-4-6, 3 appels, 0 retry)

- **Activité absente** : ni TDEE, ni cible, ni fourchette ; BMR seul ; il demande les séances et
  reconnaît le travail déjà connu (« tu m'as déjà dit bureau, donc c'est noté »). ⚠️ Limite : « l'écart
  peut dépasser **plusieurs centaines** de calories » — un ordre de grandeur en MOTS, sans chiffre
  (D-024 interdit l'ordre de grandeur chiffré). Consigné au journal de test, à trancher.
- **Cible valide (R8)** : « 1 718 × 1,55 = 2 663 → +200 objectif force → +100 phase de charge
  → 2 963 ». Plus de « 2663 + 100 = 2963 ».
- **Programme structuré + performances** : jours Push/Pull et charges prévues ; réalisé séparé
  (87,5 → 90 kg au couché, 140×5/4 au soulevé, militaire et tractions pas encore faits) ; il dit
  ce qui manque (aucun RIR) et n'invente ni semaine en cours ni phase.
