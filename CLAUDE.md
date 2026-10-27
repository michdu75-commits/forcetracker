# ⚡ RÈGLES D'OR — à lire à chaque session avant tout le reste

> **Version courte, une ligne par règle.** Le texte complet, le pourquoi et les cas vécus sont dans
> **`docs/REGLES-OR.md`** — à ouvrir quand une règle est contestée ou qu'on hésite à la contourner.
> *Une règle noyée dans un fichier qu'on ne lit plus n'est plus une règle.*

17. **🧹 COMPLEXITÉ — UNE FONCTION DE PLUS NE DOIT PAS CRÉER TROIS PROBLÈMES DE PLUS.** Cette règle s'active si un chantier ajoute une donnée persistée, une clé de stockage, un **nouveau fichier applicatif créé**, un nouveau chemin d'exécution/donnée, ou crée/modifie une fonction appelée depuis plusieurs endroits. Appliquer R1/R2/R13 ; chercher si un ancien chemin peut être supprimé ou fusionné en respectant R30/#15 ; si le bénéfice utilisateur est faible face au coût architectural, **STOP avant de coder et proposer plus simple**. **Un test protège un invariant, pas une implémentation** : tout témoin réécrit doit ensuite **rougir sous mutation volontaire**. Si un déclencheur est touché, le rapport final donne **4 compteurs sur le code applicatif uniquement** : données persistées ajoutées · fichiers applicatifs touchés · lignes ajoutées − lignes retirées · anciens chemins supprimés/fusionnés. → `docs/REGLES-OR.md#17`

1. **🚀 Apps Script : TOUJOURS redéployer** après un changement de code. `clasp push` ne met à jour que le brouillon. → `docs/REGLES-OR.md#1`
2. **💎 Premium : ne JAMAIS écraser `PREMIUM_EMAILS`.** Deux sources ; aucune fonction ne doit les réinitialiser. → `docs/REGLES-OR.md#2`
3. **🛡️ Zéro perte de séance — priorité n°1 absolue.** Local d'abord, le réseau ne bloque jamais. → `docs/REGLES-OR.md#3`
4. **⚡ Ouverture instantanée à la salle**, même hors ligne. Le démarrage n'attend aucune requête. → `docs/REGLES-OR.md#4`
5. **🏷️ Incrémenter `ft-vNN`** à chaque déploiement (visible dans « À propos »). → `docs/REGLES-OR.md#5`
6. **🔒 Avant toute opération risquée : backup + branche**, et la nuit. → `docs/REGLES-OR.md#6`
7. **🎨 Garder l'identité « figurines muscles ».** Une chose à la fois, testée avant de continuer. → `docs/REGLES-OR.md#7`
8. **💾 Commit étiqueté AVANT, tag stable APRÈS, rollback en 1 ligne** à la fin de chaque tâche. → `docs/REGLES-OR.md#8`
9. **🔴 Bouton central « + » Séance — SENSIBLE** : toute modif de l'écran Séance doit vérifier que le bouton central **ne bouge pas** (le mesurer, pas le regarder). → `docs/REGLES-OR.md#9`
10. **🗣️ Michel n'est ni développeur ni programmeur.** Expliquer simplement, prévenir avant tout risque, **court par défaut** — la réponse d'abord, le détail seulement s'il le demande. → `docs/REGLES-OR.md#10`
11. **📣 À CHAQUE feature en PROD : prévenir l'utilisateur** — points **2 à 5 toujours** (point rouge `NEW_FEATURES` · aide `?` de l'onglet · aide détaillée · diapo du Guide). ⚖️ **La pop-up `WHATS_NEW` se mérite** : seulement si la personne doit *faire* quelque chose, ou si un repère a bougé. **La pop-up ANNONCE, l'aide EXPLIQUE.** → `docs/REGLES-OR.md#11`
12. **📓 Tenir TOUS les fichiers de suivi à jour EN TEMPS RÉEL**, dans le même mouvement que le bump `sw.js` + commit : `CLAUDE.md` (1 ligne : quoi + pourquoi + `ft-vNN`), `docs/INVENTAIRE.md` régénéré, fichiers de chantier. 🧾 **ET `docs/JOURNAL-DE-TEST.md` — le RÉFLEXE : toute question ou tout doute sur le comportement de Milo s'y note TOUT DE SUITE, même sans réponse, même en pleine autre tâche** (une ligne, 10 secondes ; sinon elle disparaît avec la session — R27). ⏳ **Le benchmark est EN PAUSE jusqu'à AU MOINS 25 entrées** (décision Michel, 21/08 : *« on n'a pas assez de pièges pour Milo »*, puis *« quand je dis 25 c'est **au moins** »*). ⚠️ **25 est un PLANCHER, pas une cible** : on ne remplit pas pour atteindre le chiffre, et **on ne s'arrête pas en l'atteignant** — le fichier ne se ferme jamais. `python3 tools/check_regles.py` affiche le compte à chaque livraison. → `docs/REGLES-OR.md#12`

13. **🤝 DEUX SESSIONS À LA FOIS = DEUX FOIS LE MÊME TRAVAIL.** Avant TOUTE tâche : `git fetch origin --all`, lire **`docs/JOURNAL-DE-PARTAGE.md`**, y écrire sa ligne (date · heure UTC · sujet · fichiers) et **la pousser AVANT de coder** ; la clore avec la version à la fin. ⚠️ **Un fichier ne prévient pas — il faut aller le lire** : sans le `git fetch`, il donne une fausse sécurité, ce qui est pire que rien. ⭐ **Le vrai verrou reste git** (un push non-fast-forward échoue) : ce fichier évite le doublon de *travail*, git évite l'écrasement de *code*. → `docs/REGLES-OR.md#13`

⚙️ **PROTOCOLE DEUX SESSIONS — validé le 13/09/2026, appliqué** : ⛔ **aucun numéro de version pendant le travail** (posé au push seulement — le motif est `ft-v(\d+)`, un préfixe temporaire casserait les contrôles) · **nouveaux blocs de tests préfixés par session** (`B-CCCIII`), **jamais renommés ensuite** · ⛔ **aucun remplacement global** : borné au bloc ou à la fonction visée — *un remplacement global suppose un identifiant unique, ce qui est faux au moment même où l'on renumérote pour collision* · pendant le travail **harnais + mutations**, avant de proposer **petits bancs + gouvernance**, avant de publier **la passe complète ENTIÈRE** (⛔ un sous-ensemble ne remplace rien : mesuré, les petits bancs auraient attrapé **0 défaut sur 5** le 13/09) · ⭐ **une passe n'est valide qu'aux 4 conditions** — `tools/passe_valide.sh` : la **ligne de total** existe · **le runner lui-même** a fini · **l'arbre n'a pas changé** · **aucun commit concurrent** sur `origin/master` · **si l'autre session publie pendant la passe, la passe est PÉRIMÉE** (refusionner, vérifier les témoins, relancer) · **témoins de périmètre éprouvés sur code SAIN puis cassés par mutation** · **chaque instantané déclare ce qu'il conduit, ce qu'il observe et ce qu'il ne couvre pas** — *conduire n'est pas observer* · ⭐ **la session qui publie en DERNIER refusionne, vérifie, relance et pose le numéro final** (⚠️ panneau d'affichage, pas serrure : conteneurs séparés). ⏳ **Non tranché, donc non appliqué** : journaux append-only · les 10 min d'attente de la passe. → `docs/REGLES-OR.md#13`

⚡ **PASSE RÉPARTIE — adoptée le 24/10/2026 (`D-113`, VALIDÉE par Michel)** : la passe complète peut se jouer
**entière** en 3 processus (`python3 tools/passe_repartie.py 3`, ~37 min au lieu de ~96, **8 conditions**). ⛔ La
classique `tools/passe_valide.sh` reste **obligatoire** : **R1** requalification (un des 6 fichiers,
l'infrastructure du runner ou du garde, l'environnement, la répartition) · **R2** confirmer tout rouge ou anomalie ·
**R3** refus du découpeur · **R4** au moins **une fois par semaine où une publication intervient**. Aucun
rééquilibrage des 3 processus pour le moment. → `docs/D031-ACCELEREE.md`

14. **📄 Un PDF à CHAQUE fin de session** (étude · audit · plan · dossier · compte rendu) — **hors du dépôt** (il est public), **autonome**, **daté dans son nom**, et **vérifié après génération** (*un PDF muet ressemble à un PDF réussi*). ⛔ Il ne remplace **jamais** la réponse en clair : *le PDF est la mémoire, le message est la réponse*. → `docs/REGLES-OR.md#14`


15. **🔒 UNE DÉCISION ACTÉE RESTE ACTÉE.** Toute décision produit · UX · architecture · métier **explicitement validée par Michel devient une CONTRAINTE du projet** — pas un avis, pas un point de départ. ⛔ **Un audit ultérieur ne la retransforme JAMAIS en question**, et ne propose pas spontanément d'y revenir. ⚖️ **Le seul motif de réouverture est une PREUVE NOUVELLE ET MESURÉE** : techniquement impossible · dangereux · en contradiction avec une autre décision active · ou produisant un défaut réel. ⛔⛔ **Et même alors, on ne change rien seul** : on expose la preuve et l'impact, puis **on attend la décision de Michel**. ⛔ Une préférence technique, une « bonne pratique », une optimisation possible ou une idée neuve **ne suffisent jamais**. 💡 Les idées non demandées se **consignent à part** et ne deviennent pas un chantier sans accord explicite. ⭐ **La phrase qui tranche tout** : *« le code actuel et les mesures disent ce qui EST ; Michel décide ce qui DOIT ÊTRE. »* → `docs/REGLES-OR.md#15`

16. **🔍 AUCUNE IMPOSSIBILITÉ NI ACTION MANUELLE SANS PREUVE.** Avant d'affirmer qu'un test est **impossible** ou de demander une **manipulation manuelle** à Michel, vérifier d'abord si l'**accès existe réellement**, si l'action est **déjà automatisée** (workflow GitHub Actions · Cloudflare · Supabase · un script du dépôt), si l'**état demandé est déjà atteint**, et si l'impossibilité a été **mesurée**. ⛔ **Une supposition ne devient JAMAIS une contrainte.** ⚙️ La chaîne obligatoire est **TESTÉE → OBSERVÉE → EXPLIQUÉE**, jamais *supposée → transformée en décision* : un blocage se dit avec sa **cause technique précise** (« HTTP 403 même avec l'`Origin` attendu, domaine bloqué par le proxy »), jamais par « je ne peux pas ». ⭐ **Toute instruction donnée à Michel est une sortie critique** — nécessaire · pas déjà faite · pas automatisée · compatible avec l'état réel · réversible. ⚖️ **Elle complète la #15** : *Michel décide ce qui DOIT ÊTRE, le code dit ce qui EST — et Claude ne transforme jamais une supposition sur ce qui EST en contrainte sur ce qui DOIT ÊTRE.* → `docs/REGLES-OR.md#16`

18. **📁 DRIVE — ACCÈS TESTÉ AU DÉBUT, ET RIEN D'EXISTANT N'EST TOUCHÉ SANS L'ACCORD DE MICHEL.** Au **tout début** d'un chantier qui lit ou écrit sur Google Drive, **tester l'accès**, avant tout travail long (**une lecture non destructive suffit**) ; si une **permission interactive** est nécessaire : **STOP immédiat**, la demander à Michel avant tout calcul long. ⛔ **Ne jamais supprimer, mettre à la corbeille, renommer, déplacer ou remplacer un fichier Drive existant sans son autorisation EXPLICITE.** Si l'outil ne sait pas modifier un fichier existant, **créer une nouvelle version clairement nommée et laisser l'ancienne intacte.** ⛔ **Aucun nettoyage Drive autonome.** → `docs/REGLES-OR.md#18`

19. **📋 SUIVI COMMUN — LE REGISTRE DRIVE ET LA PASSATION MAÎTRE SONT LES RÉFÉRENCES DE PILOTAGE** de Principal, Nutrition et Séance (consigne permanente de Michel, 25/10/2026) : le **registre des bugs et évolutions** « SUIVI DES BUGS — FORCE TRACKER » (Google Sheets `1pQFsSrDsosR4zpGHg1iwGMolr2vsjzSSeKxx4fQN_e4`, la vue « Consolidé ») est la **source de vérité des tickets** ; la **« PASSATION MAÎTRE — FORCE TRACKER »** (Google Docs `1fdkw2FgkUwu-AIqp8RxmZlrCUff7Z1n5W3Th9KUU1Tg`) est la synthèse qui y renvoie. ① **Avant toute mission, lire les tickets et le point les plus récents** ; Drive inaccessible → **le dire et demander un export, sans jamais supposer les avoir lus**. ② ⛔ **Un bug corrigé ne se rouvre jamais sans preuve nouvelle.** ③ **Quatre états jamais confondus** : *corrigé sur branche* (branche · commit · tests) · *intégré* · *publié* (version · date · preuve de déploiement) · *vérifié sur iPhone* (version · appareil · scénario · date · résultat). ④ **Tout rapport de livraison cite les IDs**, les preuves, les corrections, les limites et les décisions en attente. ⑤ **Il prévoit la mise à jour du registre puis de la passation** (mêmes IDs, même date, ancienne valeur → nouvelle, **rien d'effacé**) — ⚠️ le connecteur Drive ne modifie pas le contenu d'un fichier existant (règle 18) : le bloc se fournit dans le rapport. → `docs/REGLES-OR.md#19`

---

## 💬 LE TON QUI MARCHE ICI — pour tout Claude qui travaille sur Force Tracker

**Direct, sans formalités, honnête. C'est comme ça qu'on communique avec Michel.**

- **Reconnaître les erreurs tout de suite** — « ah oui t'as raison, je recompile » plutôt que des formules polies
- **Rigoler de la complexité** — si c'est compliqué, le dire et en rire avec Michel, pas le nier
- **Jamais faire semblant** — « je sais pas » vaut mieux que « probablement »
- **Pas de sur-explication** — court et direct, la réponse d'abord, le détail seulement si demandé
- **Changer d'avis sur la base des données** — on n'est pas attaché à une hypothèse, on la jette si elle n'est pas valide
- **Parler le même langage** — données avant tout, pas de bullshit, pas de « auriez-vous l'amabilité »
- **Admettre les limites** — « ce déconne » plutôt que « peut-être serait-ce judicieux de » — Michel parle direct, on lui répond pareil

---

**⚙️ CHARGEMENT AUTOMATIQUE** — la ligne ci-dessous n'est pas décorative : la syntaxe `@fichier` fait
**importer** le document par Claude Code au démarrage, comme s'il était écrit ici. Un seul fichier est
importé, volontairement : les **règles de construction**, qui s'appliquent à *toutes* les tâches.
⚠️ **Ne pas en ajouter par réflexe.** `CLAUDE.md` fait déjà ~25 700 mots ; importer les autres docs de
gouvernance ajouterait ~13 800 mots (+54 %) à chaque session — et **plus on charge, moins chaque règle
pèse** (c'est la règle R20 elle-même). Les autres docs se lisent **à la demande**, c'est le bon régime.

@docs/REGLES-ARCHITECTURE.md

**📜 Documents de gouvernance (à respecter) :**
> 📚 Une description courte par document ; **le texte complet de chacune** (le pourquoi, les cas vécus) est dans **`docs/CATALOGUE-GOUVERNANCE.md`** (§N = ordre ci-dessous). Les consignes ⛔ restent ici.
- 🤝 **`docs/JOURNAL-DE-PARTAGE.md`** — **QUI TRAVAILLE SUR QUOI, EN CE MOMENT** (protocole du 24/08/2026, après une collision réelle : ft-v991 et ft-v992 écrits deux fois). ⚡ **Le geste, avant toute tâche** : `git fetch origin` → lire le tableau → écrire SA ligne (date · heure UTC · sujet · fichiers) → **pousser AVANT de coder** → clore avec la version. ⛔ *Un fichier ne prévient pas, il faut aller le lire* : sans `git fetch` c'est une fausse sécurité ; **le vrai verrou est git** (un push non-fast-forward échoue). Limites écrites : fenêtre de course · ligne bloquante d'une session morte (péremption 3 h) · tout repose sur la discipline. Heures en **UTC**. → détail : `docs/CATALOGUE-GOUVERNANCE.md` §1.
- ⚡ **`docs/REGLES-OR.md`** — **les 12 règles d'or EN ENTIER** (le pourquoi, les cas vécus, les garde-fous). `CLAUDE.md` n'en porte que la version d'une ligne depuis la scission du 28/07/2026 : ce fichier faisait **33 000 mots** relus à chaque session, dont **79 % de journal**. *Une règle noyée dans un fichier qu'on ne lit plus n'est plus une règle.* Cohérence des deux fichiers vérifiée par `python3 tools/check_regles.py`.
- 🌟 **`docs/VISION-FORCE-TRACKER.md`** — **l'ESPRIT / le POURQUOI du produit** : *« Force Tracker n'est pas une IA, c'est une mémoire sportive intelligente »* · *« il ne te dit pas qui tu dois devenir, il se souvient de qui tu es devenu »*. Le sportif ne repart jamais de zéro ; la vie avant le programme ; observer avant conseiller ; adapter avant interdire. **Question de référence avant toute feature : « est-ce que cela renforce l'esprit Force Tracker ? »** La Constitution dit le *comment*, la Vision dit le *pourquoi*.
- 👥 **`docs/PERSONAS-FONDATEURS.md`** — **à lire juste après la Vision** : les personas ne sont plus des profils de test, ce sont les **dimensions du projet**. **Michel** = Vision & Architecture (le fondateur, à part). **Christophe** = Terrain & Métier (→ VM). **Tatiana** = Personnalisation, pas de présupposés (→ VC). **Emma** = Physiologie & Ressenti (→ VC). Relie chaque évolution technique à un besoin humain concret. Règle : un nouveau persona n'entre que s'il ouvre une **dimension** nouvelle. *(Idée & conception : Michel.)*
- 🧩 **`docs/MODELE-METIER.md`** — **le LANGAGE COMMUN du produit** (v0.1, vivant) : les objets métier que TOUS les modules partagent (Athlète · Objectif · Programme · Cycle · Séance · Bloc · Exercice · Série · Exercice-bibliothèque) + transversaux (Méthode · Consigne · Notation) + la grammaire + le principe **PLANIFIÉ vs RÉALISÉ**. Cap posé par Michel (21/07/2026) : penser « objets métier », pas « fonctionnalités ». Se distille des vrais programmes, reste vivant. Lié au chantier structures (`PARSER-STRUCTURES.md`).
- 🔬 **`docs/SUIVI-AUDIT.md`** — **LE SCORE DE L'AUDIT** (23/08/2026) : *qu'est-ce qui reste de l'audit ?* Il ne raconte rien, il tient le score ; un sujet y **change d'état**, il ne s'y duplique jamais. ⛔ Un sujet **écarté** y reste avec sa raison (**R30**). Porte les 3 bloquants corrigés (ft-v981/982/983), le reste par palier, les 6 points écartés et 5 leçons de méthode (un test sans le schéma de la production rassure sans tester · chercher pourquoi un essai était parqué avant de le promouvoir · reproduire avant de conclure · compter les endroits · un contrôle négatif peut mentir). → détail : `docs/CATALOGUE-GOUVERNANCE.md` §6.
- 📍 **`docs/CONTEXTE-ACTUEL.md`** — **À LIRE EN PREMIER avant toute nouvelle tâche** (1 page) : version, branche, brique active, dernières décisions, prochaine étape, blocages. Le raccourci pour reprendre le contexte sans tout relire.
- 🏛️ **`docs/REGLES-ARCHITECTURE.md`** — **COMMENT ON CONSTRUIT** (27/07/2026) : les règles de conception R1 → R38, chacune née d'un **événement réel** — données (source de vérité unique, ne jamais dupliquer, l'info descend jusqu'à la DONNÉE, R36 : le monde se récolte, la personne reste chez elle) · décisions (une seule voix, le prompt est le dernier levier, le modèle est une variable) · construction (enrichir l'existant, local-first, vérifier le déploiement) · gouvernance (légère, prompt maigre / doc jardinée). **Auto-importé** ci-dessus. ⚠️ Pas la Constitution : celle-ci dit comment Milo se comporte envers la **personne** ; en cas de conflit, **la Constitution l'emporte**. → détail : `docs/CATALOGUE-GOUVERNANCE.md` §8.
- **`docs/PROCESSUS-DEVELOPPEMENT.md`** — la **méthode officielle** : le cycle d'une brique (Réflexion → Spécification `Objectif/Critère/Hors périmètre` → Challenge → Développement → **Clôture obligatoire** → Validation Michel). Suivre ce processus pour CHAQUE brique, sans sauter d'étape. ⏱️ Il porte aussi **comment estimer** une tâche (**D-088**, Michel, 18/10 : durées **mesurées** · développement ≠ exécution des tests · risque de reprise dit **à part** · une estimation **centrale** · **estimé vs réel** comparé au rapport final), avec les repères mesurés et l'historique des écarts.
- **`CONSTITUTION-MILO.md`** — les principes stables (la personne d'abord, sécurité, faits avant opinions, confidentialité…). Toute évolution doit les respecter.
- 🎟️ **`docs/SEANCE-DESSAI.md`** — **LE PARCOURS DE DÉCOUVERTE, et là où Milo entre en jeu** (cadré le 25/08/2026 ; **rien n'est construit**, le doc fixe les décisions AVANT de coder). *Une séance d'essai en salle n'est PAS une version bridée* : on n'appauvrit pas l'exemple, ce que Milo vend c'est **la fois d'après**. ⛔ Milo juge **LA SÉANCE, pas la personne** ; le débrief **chiffré** est calculé en **LOCAL, toujours** (Milo ajoute le jugement, le ton, la recommandation). Beaucoup existe déjà (`DISC_LABELS`/`DISC_CADRE`, `openBeginnerSetup`, `editProg`, débrief ft-v979) ; seul vrai trou : les conseils d'échauffement. ⚠️ Non tranché : exemples permanents ou essai limité ; le tri « nécessaire / optionnel » pour Milo se mesure au banc (R34), qui n'a jamais tourné. → détail : `docs/CATALOGUE-GOUVERNANCE.md` §11.
- **`docs/PRESENCE-MILO.md`** — vision d'identité : Milo devient la **présence** / la porte d'entrée du produit (Milo → App), sans gadget, jamais un passage obligé. **Le cerveau d'abord, la présence ensuite.** Guide l'UX des futures briques.
- 🌱 **`docs/PROFIL-VIVANT.md`** — **le design du « profil vivant »** (prolonge Constitution P25) : Milo **apprend, vérifie, corrige et évolue** avec le sportif. 4 modes (Compléter · Enrichir · Mettre à jour · **Confirmer**) ; le **réalisé** prime sur le déclaré (jamais automatique) ; **« Milo ne pilote jamais »** (observer → expliquer → proposer → décider) ; fiabilité par champ (blessures = sensible) ; ton humble anti-surveillance. → détail : `docs/CATALOGUE-GOUVERNANCE.md` §13.
- 🧠 **`docs/MOTEUR-RAISONNEMENT-MILO.md`** — **LE CADRE du « cerveau de Milo »** (22/07) : pipeline **Compréhension → Diagnostic → décision → Explication** ; 2 cerveaux (Comprendre / Décider) ; ⭐ **Principe 18 : fiabilité AVANT intelligence** — décider avec l'info d'aujourd'hui, **ne jamais faire semblant de savoir**, **savoir s'arrêter**. Toute brique « cerveau » est une PIÈCE de ce moteur, jamais un ajout isolé. → détail : `docs/CATALOGUE-GOUVERNANCE.md` §14.
- 🧠🫀 **`docs/ARCHITECTURE-CERVEAU-CERVELET.md`** — **décharger Milo sans le diluer** (19/08/2026, idée de Michel). **Milo garde le jugement** ; **une 2ᵉ IA exécute le mécanique** et **n'existe PAS pour l'utilisateur** : deux IA, **une seule voix** (R6). Critère : *« a-t-on besoin de savoir QUI est la personne ? »* oui → Milo, non → cervelet. Déclencheur mesuré : 140 règles, 46 485 car. pour un plafond de 46 500 (la taille DILUE les règles). ⛔ À ne pas redécouvrir : le cache veut des variantes **FIXES** · l'erreur d'aiguillage est **SILENCIEUSE** · un **noyau ne se conditionne JAMAIS**. Prérequis : *Milo suit-il ses règles ?* (`tests/milo` prouve la PRÉSENCE, jamais l'OBÉISSANCE). → détail : `docs/CATALOGUE-GOUVERNANCE.md` §15.
- 🧭 **`docs/INDEPENDANCE-MOTEUR-MILO.md`** — **LE CAP LONG TERME** : *« Claude n'est pas Milo. Claude est actuellement l'un des moteurs que Milo utilise »* (Michel, 19/09/2026). ⛔⛔ **RIEN N'EST CONSTRUIT** : une **direction** (colonnes EXISTANT · DÉCIDÉ · DIRECTION). Milo = identité + mémoire + règles + capacités + contexte + droits + outils ; le LLM est un composant interchangeable. ⛔ **Le modèle ne décide jamais seul de ses permissions** (le serveur reste l'autorité) ; **interdit de dégrader Milo** pour obtenir l'indépendance (bascule progressive, mesurée au banc, réversible). Première marche : **R2** appliqué à l'adresse du fournisseur (`worker.js` : 1 constante ; `Code.js` : 13 fois en dur). Devenu **R37**. → détail : `docs/CATALOGUE-GOUVERNANCE.md` §16.
- ⚖️ **`docs/DECISIONS.md`** — **LE REGISTRE DES DÉCISIONS : qui a tranché quoi, et ce que ça a ÉCARTÉ** (19/09/2026). Un seul tableau : **Origine** (`Michel` · `Claude` · `GPT` · `contrainte technique`), alternative écartée, réponse à la **Vision** (`cohérent` · `neutre` · `cap validé` · `écart à soumettre`), **Statut** (`REMPLACÉE → D-0xx` obligatoire) ; `python3 tools/point_de_cap.py` en donne la lecture. ⚖️ ***Claude décide COMMENT réaliser une direction validée ; il ne décide pas seul QUELLE direction prennent Force Tracker et Milo.*** Le critère est l'impact sur la direction, jamais la taille du diff ; « écart à soumettre » n'est pas une faute ; `check_regles.py` contrôle la FORME, jamais le contenu ; il RÉFÉRENCE les sources spécialisées, il ne les recopie jamais (R2). → détail : `docs/CATALOGUE-GOUVERNANCE.md` §17.
- 🧠 **`docs/DECISIONS-MEMOIRE-LONGUE.md`** — **LES DÉCISIONS DE LA MÉMOIRE LONGUE (18/09), ET LE PIÈGE DE LEUR NUMÉROTATION** (20/09/2026). ⛔⛔ **À OUVRIR AVANT D'ÉCRIRE « M<n> » OÙ QUE CE SOIT** : « M1→M14 » invoqué comme un acquis est **faux**. 9 décisions prouvées ; ⛔ **5 INTROUVABLES, jamais reconstituées** (NON DÉCIDÉES jusqu'au jour où le cas se présente — décision de Michel, 20/09) ; **seules étiquettes `M` légitimes : M12, M13, M14**, là où elles sont déjà écrites — ailleurs, désigner une décision par son énoncé. Quatre « décisions de Michel » n'en sont pas (comportements attendus de cas adversariaux écrits par Claude) : *une PROPOSITION devenue décision en changeant de document.* → détail : `docs/CATALOGUE-GOUVERNANCE.md` §18.
- 🍽️ **`docs/NUTRITION-PHILOSOPHIE.md`** — **L'ESPRIT de la nutrition** (à respecter AVANT de coder une brique nutrition ; 22/07). Boussole : *« la nutrition est un moyen d'améliorer la santé/récup/perf ; elle ne doit jamais devenir une source de stress supérieure au bénéfice qu'elle apporte »* (**Constitution P21**). Levier au service de l'objectif · optionnelle jamais bloquante · fiabilité > exhaustivité · cohérence > réactivité · local d'abord · adapter pas imposer · anti-TCA ; précision au CHOIX (4 niveaux) ; Gardien nutrition. → détail : `docs/CATALOGUE-GOUVERNANCE.md` §19.
- 📋 **`docs/BRIEF-NUTRITION.md`** — **LE POINT D'ENTRÉE du chantier nutrition, et il parle d'abord de la 2ᵉ IA** (19/08/2026, autonome, pour une autre instance). ⛔ **3 interdits** : la 2ᵉ IA n'existe pas pour l'utilisateur · elle ne sait RIEN de la personne (l'appel ne porte que 2 clés) · elle n'a pas de mémoire. 2 critères (*« besoin de savoir QUI ? »* + *transformation vérifiable ou JUGEMENT ?*) ; ⭐ **le code passe AVANT le cervelet** (code → base → cervelet → Milo) ; recette pour ajouter une tâche (4 endroits alignés) ; *le cervelet calcule ce qu'il y a dans l'assiette, Milo décide ce qu'elle signifie* ; le modèle **propose**, le code **valide** ; ⚠️ dérive à interdire : un cervelet qui conseille. → détail : `docs/CATALOGUE-GOUVERNANCE.md` §20.
- 🥗 **`docs/NUTRITION-MOTEUR.md`** — **le COMMENT de la nutrition** (18/08/2026 ; pendant technique de `NUTRITION-PHILOSOPHIE.md`) : chaîne mesurée dans le code (BMR → TDEE → objectif → macros → plan → portions → substitutions), **deux plans qui coexistent** (local gratuit / IA — ne pas corriger le mauvais bloc), cinq trous. ⭐ Le plan de repas ignore l'entraînement (`S.wkt`, `startHour`, région, discipline) — ⚠️ « ignore COMPLÈTEMENT » était faux (corrigé le 21/08 : l'écran additionnait déjà la séance et la **comptait deux fois**, ft-v949). **Deux bases, pas une** : Journal = couverture (CIQUAL entier), générateur = sûreté (~300 aliments `composable`, listes blanches relues à la main). Contient l'audit de la note technique v1.0. → détail : `docs/CATALOGUE-GOUVERNANCE.md` §21.
- 📱 **`docs/STRATEGIE-NATIF.md`** — **principes DURABLES du passage en natif/hybride** (22/07). Directeur : *« le natif ne doit apporter que ce que le web ne peut pas offrir »* (la PWA suffit-elle déjà ?). **Coque Capacitor, zéro réécriture** ; RN/Flutter/Tauri/Cordova écartés ; plugins ajoutés sur besoin réel ; priorité objets connectés > push > stores > IAP ; premium **serveur** au lancement. ⚠️ **Aucune estimation de coût/délai.** → détail : `docs/CATALOGUE-GOUVERNANCE.md` §22.
- 🌱 **`docs/ORIGINE-DES-REGLES.md`** — **D'OÙ VIENT CHAQUE RÈGLE** (27/07/2026) : *une règle dont on a oublié la raison finit toujours par être contournée.* Retrouvé dans les transcriptions (2→27/07, 1 292 messages de Michel ; non garanties dans le temps). ⭐ **Quand Michel répète une consigne deux fois, ne pas la ré-appliquer : l'ÉCRIRE** (mécanisme constaté 3 fois). La règle #12 est née de « le suivi de chaque évolution ET SA RAISON » (18/07), non tenue (pourquoi manquant pour 70 % des versions). → détail : `docs/CATALOGUE-GOUVERNANCE.md` §23. ⭐ Depuis le 24/10/2026 : le **pourquoi du projet** (un outil pour Michel, sans ambition commerciale) y est aussi ; aucune date exacte de naissance retenue.
- 🎨 **`docs/DESIGN-KIT.md`** — **le kit à coller dans un outil de maquettage** (27/07/2026) : sinon l'outil externe invente une esthétique intransposable. Contient les vraies variables (`--bg`/`--t1`/`--red`…), polices, composants (`.btn`, `.card`, `.modal`), motif d'anneau SVG. L'app n'utilise **PAS canvas** pour l'interface (104 `<svg>`) : aucune limite de design. Partage : outil externe pour *explorer*, Claude Code pour *rendre réel* (envoyer une capture du rendu réel). → détail : `docs/CATALOGUE-GOUVERNANCE.md` §24.
- 🔬 **`docs/DOSSIER-MET-MESURES.md`** — **dossier autonome sur les calories de musculation** (15/08/2026) : le *pourquoi — et ce qui ne marche pas* (le kit `MOTEUR-MET-A-COLLER.md` dit le comment), chiffré sur 46 séances Garmin × 31 séances de l'app. ⚠️ Un MET de **séance** se multiplie par la durée **totale**, un MET d'**exercice** par le temps **actif** (les croiser : +16 %). ⛔ **Ne jamais caler un modèle sur les calories d'une montre** (sa FC est le signal ; son horloge, elle, est parfaite). La durée est la vraie source d'erreur. Relevé : `docs/CALORIES-SOURCES.md` §16. → détail : `docs/CATALOGUE-GOUVERNANCE.md` §25.
- 🔥 **`docs/MOTEUR-MET-A-COLLER.md`** — **3ᵉ kit pour outil extérieur** (14/08/2026) : le **code réel** du moteur MET (JS vanilla, sans build). `getExerciseMET()` n'est pas autonome (`_mscScores()`, `_movPattern()`) → le module doit devenir **PUR** et recevoir les muscles en paramètre (une logique, deux sources de données ; R1/R2). ⛔ Ne pas toucher : la règle « 3 muscles ou plus », les listes haltérophilie/cardio, farmer's walk et charnière de hanche (chacune vient d'un bug mesuré). → détail : `docs/CATALOGUE-GOUVERNANCE.md` §26.
- 📄 **`docs/CONTRAINTES-PDF.md`** — **le pendant papier du DESIGN-KIT** (13/08/2026) : les deux mécanismes (feuille `window.print()` + CSS · jsPDF dessiné au point près), la palette **mode CLAIR** en hex et RGB, les contraintes d'usage (papier, stylo, noir et blanc) et la liste ⛔ de ce qui n'est pas possible. §9 = bloc pour **Claude Design** — ⚠️ **surtout pas celui de `DESIGN-KIT.md`** (mode sombre 430 px : faux sur papier). → détail : `docs/CATALOGUE-GOUVERNANCE.md` §27.
- 🐛 **`BUGS.md`** — **le catalogue des vrais bugs, par FAMILLE et non par date** (02/08/2026) : *quels pièges ce projet a-t-il déjà rencontrés, et à quoi les reconnaît-on ?* Mêmes 5-6 bugs sous des déguisements : premier match gagnant · info qui n'atteint pas la donnée (R4) · fuseaux horaires · déploiement silencieux · seuils en marche d'escalier · deux sources qui se contredisent · erreurs de MÉTHODE. Chaque famille dit comment la reconnaître et ce qui la protège ; se termine par les **6 réflexes**. **À compléter à chaque nouveau bug.** → détail : `docs/CATALOGUE-GOUVERNANCE.md` §28.
- 🧨 **`docs/GALERES-ET-LECONS.md`** — le **journal d'expérience** (« comment Force Tracker est devenu plus robuste ») : grosses galères résolues (son iOS, 4G, perte de données, backend qui tombe…), **décisions qu'on ne regrette pas** (§6), **fausses bonnes idées** (§7), problèmes **encore ouverts**, ce qui **manque**, et les **réflexes** pour ne pas re-tomber dedans. À consulter avant un chantier risqué, et à **compléter à chaque nouvelle galère / décision / fausse bonne idée**.
- 🧭 **`docs/BUGS-DE-PHILOSOPHIE.md`** — **(23/07/2026, l'un des docs les plus précieux)** : les **dérives de COMPORTEMENT de Milo** (hypothèse présentée comme un fait, mémoire créée d'une déduction, interrogatoire, sortie de rôle…) — le raisonnement est souvent bon, c'est la **SORTIE** qui trahit la Constitution. Chaque dérive devient une règle de conception ; cas PB-001→004. **À compléter à chaque dérive repérée** ; une règle mûre peut monter en Constitution. → détail : `docs/CATALOGUE-GOUVERNANCE.md` §30.
- 🧾 **`docs/JOURNAL-DE-TEST.md`** — **la SALLE D'ATTENTE des scénarios** (21/08/2026) : *une ligne suffit*, on y met le **DOUTE** (« je ne sais pas si Milo fait ça bien »). Les 6 meilleurs scénarios du benchmark viennent de bugs VÉCUS. 5 états (à trier · prête · promue · **juge humain** · écartée AVEC LA RAISON). ⚠️ Critère de promotion unique : *l'attendu est-il vérifiable par du CODE ?* (le goût reste au juge humain). 25 entrées = un PLANCHER, pas une cible ; le fichier ne se ferme jamais (R12, R35). → détail : `docs/CATALOGUE-GOUVERNANCE.md` §31.
- 🧪 **`RETOURS-TESTEURS.md`** — **mémoire centralisée des retours des vrais testeurs** (Tatiana, Christophe, Emma, Eline…) : leur profil, ce qui leur plaît, ce qui manque, leurs bugs/idées, et ce que chaque retour a produit. **À compléter à chaque retour marquant** (réflexe, pas sur demande).
- 🤝 **`README-IA.md`** — **le mode d'emploi du dépôt pour TOUTE IA** (Claude, ChatGPT…). Modèle « équipe IA » (Michel décide · Claude archi/dev · ChatGPT vision/UX) adopté le 19/07/2026 : **le dépôt = source de vérité commune**, pas de dialogue direct IA↔IA, une **mémoire de projet partagée**. Explique l'ordre de lecture, où trouver quoi, et comment une IA externe (ChatGPT) lit le dépôt (liens GitHub raw / Custom GPT) — pour arrêter le copier-coller de contexte.
- **Organisation de la doc** : `CLAUDE.md` = **page d'accueil** (vision + les 12 règles d'or EN ENTIER + version/branche/brique + liens). Le **détail** vit dans les docs spécialisés (`/docs/`, `DOSSIER-ATHLETE-SUIVI.md`, `IDEES-FUTURES.md`…). ⚠️ Les **règles d'or restent dans CLAUDE.md** (seul fichier auto-chargé chaque session — les `/docs/` sont lus à la demande).

---

# Force Tracker — Contexte projet pour Claude

## Présentation

> 🌟 **L'esprit du produit (le cap) :** *« Force Tracker n'est pas une intelligence artificielle. C'est une mémoire sportive intelligente. »* — *« Il ne te dit pas qui tu dois devenir, il se souvient de qui tu es devenu. »* Détail : `docs/VISION-FORCE-TRACKER.md`.

PWA de suivi de musculation (Progressive Web App), conçue pour mobile (max-width 430 px). Single-page app HTML/CSS/JS pur, sans framework ni build step. Déployée sur GitHub Pages.

- **Repo GitHub** : https://github.com/michdu75-commits/forcetracker
- **App live** : https://michdu75-commits.github.io/forcetracker/
- **Auteur** : Michel — michdu75@gmail.com
- **🎂 Les débuts** : **au plus tard début juin 2026**, sans date de naissance exacte (consigne de Michel, 24/10/2026). Plus ancienne trace certaine : l'app en ligne le **8 juin** (« v2.2 ») ; dépôt GitHub depuis le **11 juin** (`52a6aa55`). Commencé par Michel **pour lui-même**, sans ambition commerciale. Conçu de bout en bout avec Claude (Design → réflexion → code). ↪️ *Corrigé le 24/10/2026 sur preuves* : cette ligne disait « né le 17 juin 2026 (première maquette Claude Design), suivi Git démarré au 30 juin » — le 17 juin n'est pas vérifiable et n'est pas le début, Git commence le 11 juin. Preuves : `docs/ORIGINE-DES-REGLES.md`. ⚠️ L'écran « À propos » affiche encore « Né le 17 juin 2026 » : affichage voulu par Michel (ft-v494), il ne change que sur sa décision.

## Backend Apps Script (v3.5 — actif · ~~@62~~ déploiement **@190** au 26/09/2026, ft-v1235 ; le numéro courant se lit dans le journal de `deploy-appsscript.yml`)

- **Compte Google** : forcetracker.app@gmail.com
- **URL déployée** : `https://script.google.com/macros/s/AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA/exec`
- **Script ID** : `1RwE46heNmZrykInYcrMgm1OZWt4NmS6NjTqttvAevZLuqo2v6EEb1Drw`
- **Sheet Google** : `1b0kuCk6kuNi26hMJq5Q5R6-mKFeXEexfm2P9SryJ-eg` (onglets Séances, Premium, etc.)
- **Fichier local** : `Code.js` (géré via clasp)
- **clasp** : toujours préfixer avec `NODE_TLS_REJECT_UNAUTHORIZED=0` (SSL Windows)
- **Déploiement web app** : Execute as = Me, Who has access = Anyone — ⚠️ à vérifier après chaque redéploiement UI

### Config Script Properties (script.google.com → Paramètres du projet)
| Propriété | Usage |
|---|---|
| `ANTHROPIC_API_KEY` | Clé API Claude pour le Coach IA |
| `PREMIUM_EMAILS` | Emails whitelist indéfinis, séparés par `,` |
| `PREMIUM_CODES` | Codes d'accès payants, séparés par `,` |
| `KOFI_TOKEN` | Token webhook Ko-fi (optionnel) |

### Commandes clasp utiles
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npx clasp push --force   # pousser Code.js
NODE_TLS_REJECT_UNAUTHORIZED=0 npx clasp deploy          # nouveau déploiement
NODE_TLS_REJECT_UNAUTHORIZED=0 npx clasp login           # (re)connexion
```

### ⚠️ Piège déploiement Apps Script — clasp push ≠ en ligne

`clasp push` met à jour le code source du projet Apps Script, mais **ne met PAS à jour la web app en production**. Le déploiement actif continue de tourner sur l'ancienne version jusqu'à la commande suivante :

```bash
# Mettre à jour le déploiement EXISTANT (obligatoire pour que l'app en prod soit à jour)
NODE_TLS_REJECT_UNAUTHORIZED=0 npx clasp deploy -i AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA
```

Sans `-i <deploymentId>`, `clasp deploy` crée un NOUVEAU déploiement avec une nouvelle URL — l'app ne le connaît pas. Toujours utiliser `-i` avec l'ID existant.  
Séquence systématique après chaque modif backend : **push → deploy -i → vérifier `?test=1` retourne `{"status":"online"}`**.

**Windows (cmd)** : la variable SSL se met en 2 temps (pas `VAR=0 cmd` comme sur Mac/Linux) :
```
set NODE_TLS_REJECT_UNAUTHORIZED=0
npx clasp push --force
npx clasp deploy -i AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA
```

### ⚠️⚠️ Piège `.claspignore` — ne JAMAIS pousser le frontend dans Apps Script (bug 2026-07-07)
`clasp push` envoie **tous** les fichiers `.js`/`.json`/`.html` du repo NON listés dans `.claspignore`. Le backend Apps Script ne doit contenir **QUE `Code.js` + `appsscript.json`**. Les fichiers frontend (`app.js`, `clone/**`, `lib/**`…) utilisent `window`/`document` → s'ils sont poussés, Apps Script refuse de charger le projet → **tout le backend tombe** (`ReferenceError: window is not defined`, `?test=1` cassé, Milo/sync HS pour tous).
- **Cause 2026-07-07** : le dossier `clone/` (créé après le `.claspignore` d'origine) et `lib/` (jsPDF) n'étaient pas ignorés → poussés → backend KO en @66/@67.
- **Fix** : `clone/**` et `lib/**` ajoutés au `.claspignore`. **Toujours vérifier que `clasp push` n'affiche QUE `appsscript.json` + `Code.js`.** Si d'autres fichiers apparaissent → les ajouter à `.claspignore`.
- **Piège dans le piège** : après avoir ignoré des fichiers, `clasp push` peut dire « Script is already up to date » et **ne PAS retirer** les fichiers déjà sur le serveur. Il faut un vrai diff dans `Code.js` (ex. un commentaire) pour forcer le re-push complet qui nettoie le projet.
- **🔴 Rechute 2026-07-21 (worker.js)** : le **déploiement backend auto échouait DEPUIS MI-JUILLET** sans qu'on le voie (`clasp push` → `Syntax error: Unexpected token 'export' file: worker.gs`). Cause : **`worker.js`** (le Cloudflare Worker, syntaxe ES module `export`) + `food-health.js` + `translations.js` (frontend, `window`) n'étaient PAS dans `.claspignore` → poussés dans Apps Script → push cassé → **les changements backend accumulés ne partaient plus** (persistance cloud de l'**ADN sportif** @ft-v464 et du **dayStateLog** @ft-v549 restées non déployées jusqu'au fix). **Fix** : `worker.js` + `food-health.js` + `translations.js` ajoutés à `.claspignore` → run **@36 vert** (push + deploy + `?test=1` online) → tout le backend accumulé déployé. **Leçon** : à chaque **nouveau fichier `.js` à la racine** (worker, module frontend…), l'ajouter à `.claspignore` IMMÉDIATEMENT (la liste est explicite, pas de wildcard `*.js` — sinon `Code.js` serait ignoré). Et **surveiller l'onglet Actions** : un déploiement backend rouge = silencieux, personne n'est prévenu.

## Architecture

| Fichier | Rôle |
|---|---|
| `index.html` | Structure HTML + balises `<script src>` — pas de JS inline |
| `style.css` | Tout le CSS (variables, composants, dark/light mode) |
| `constants.js` | EXLIB, BIG4, DEFAULT_URL, STD (niveaux de force), EX_YT, EX_EN, _MUSCLE_SVG |
| `state.js` | Objet `S`, `load()`, `persist()`, `calcTDEE()`, `calcMacros()`, `bz()` |
| `app.js` | Bootstrap (`autoConnect`, `onLoad`), nutrition, cardio, pilule repos, `_premiumPending` |
| `screens.js` | Navigation (`goScreen`, swipe), `renderHome()`, `renderNutrition()`, `updatePill()` |
| `log.js` | Séance : `startWorkout()`, `renderLog()`, `renderExBlocks()`, timer repos |
| `coach.js` | Chat IA : `sendToCoach()`, `buildCoachContext()`, `showPremiumWall()`, morpho |
| `setup.js` | Profil : `renderProgress()`, `renderChart()`, `_cloudSync()`, éditeur programmes |
| `tracking.js` | Cycle de force, badges, check-in, sommeil, `toast()` |
| `sw.js` | Service Worker (cache-first HTML navigation, cache-first assets) — cache versionné `ft-vNN`, bumpé à chaque release. ⚠️ **Le numéro courant se lit dans `sw.js` et dans l'en-tête du journal, jamais ici** : cette case en portait une **copie**, restée à `ft-v1224` alors que l'app servait `ft-v1226`. *Deux endroits qui portent le même nombre finissent par diverger — la seule question est quand* (**R2**). |
| `.github/workflows/deploy-pages.yml` | **Déploiement Pages via GitHub Actions** (depuis ft-v619) — remplace le « Deploy from a branch » qui se bloquait par intermittence. Se déclenche à chaque push sur `master` + relançable à la main (`workflow_dispatch`). |
| `Code.js` | Backend Google Apps Script v3.5 ~~@57~~ (déploiement @190 au 26/09/2026) (sync cloud, coach IA en repli, premium, import programme) |
| `manifest.json` | Config PWA (icône, couleurs, display:standalone) |
| `appsscript.json` | Manifest Apps Script (scopes OAuth, timezone, webapp config) |
| `female-body.png` | Silhouette féminine — présent mais non utilisé (voir Notes techniques) |

**État persistant** : `localStorage` — clés préfixées `ft4_*`  
**Objet global** : `S` (state) — chargé par `load()`, sauvé par `persist()`  
**URL Apps Script** : `DEFAULT_URL` dans `constants.js` (ligne ~110), jamais saisie par l'utilisateur  
⚠️ **Ne jamais changer DEFAULT_URL sans la mettre à jour dans constants.js ET redéployer**

### Carte des modules — grandes fonctions

| Fonction | Fichier | Rôle |
|---|---|---|
| `load()` / `persist()` | `state.js` | Chargement/sauvegarde localStorage |
| `autoConnect()` | `app.js` | Ping Apps Script + chargement statut premium au démarrage |
| `goScreen(id, btn)` | `screens.js` | Navigation entre écrans |
| `renderHome()` | `screens.js` | Rendu écran accueil (stats, PRs, récup) |
| `renderLog()` | `log.js` | Rendu écran séance |
| `renderExBlocks()` | `log.js` | Rendu des blocs exercice (collapse/expand) |
| `startWorkout()` | `log.js` | Démarrage séance + chrono |
| `finishWorkout()` | `log.js` | Fin séance → calcul PRs → cloud sync |
| `startRest(sec)` | `log.js` | Démarrage timer repos |
| `renderProgress()` | `setup.js` | Rendu onglet Progrès (graphiques, badges) |
| `renderChart()` | `setup.js` | Graphique 1RM par exercice |
| `_cloudSync()` | `setup.js` | Sync complète vers Apps Script |
| `renderNutrition()` | `screens.js` | Rendu onglet Nutrition |
| `calcTDEE()` | `state.js` | Calcul TDEE (Harris-Benedict adaptatif) |
| `calcMacros(phase)` | `state.js` | Calcul macros selon objectif + phase |
| `buildCoachContext()` | `coach.js` | Construction du system prompt Coach IA |
| `sendToCoach()` | `coach.js` | Envoi message + gestion quota/premium |
| `showPremiumWall()` | `coach.js` | Affichage mur payant (vérifie `_premiumPending`) |
| `checkBadges(silent)` | `tracking.js` | Vérification et déblocage des badges |
| `renderCycleScreen()` | `tracking.js` | Rendu écran cycle de force |
| `toast(msg, type)` | `tracking.js` | Notification toast (succès/erreur/info) |
| `bz(kg, reps)` | `state.js` | Formule Brzycki → 1RM estimé |
| `getLevel(ex, rm1, bw, gender, age)` | `constants.js` | Niveau de force (Débutant→Élite) — ⚠️ **plus appelée par l'app depuis ft-v385** (11/07). Code dormant, gardé : voir la note ci-dessous. |

## Écrans (navigation bas de page)

| ID | Onglet | Contenu |
|---|---|---|
| `s-home` | 🏠 Accueil | Stats du mois, bouton séance, récupération, calendrier mensuel, PRs — ⚠️ le **Cycle de force** et le **Niveau de force** en ont été RETIRÉS le 11/07 (ft-v385, remplacés par le calendrier). Le cycle reste dans Menu > Outils ; le niveau, lui, n'est plus affiché nulle part. |
| `s-log` | ⚡ Séance | Exercices actifs, sets/reps/kg, repos |
| `s-progress` | 📈 Progrès | Graphique 1RM par exercice, suivi du poids de corps, corrélations |
| `s-nutrition` | 🍽️ Nutrition | Macros TDEE adaptatif, plan de repas, suppléments (créatine, whey), calories brûlées |
| `s-setup` | 👤 Profil | Profil athlète (âge/taille/poids/sexe/objectif/activité), composition corporelle |
| `s-coach` | 🤖 Coach IA | Chat Milo ~~Claude Haiku via Apps Script~~ via le **Worker Cloudflare** (`claude-sonnet-4-6` par défaut, état au 26/09/2026), contexte profil injecté |
| `s-cycle` | — | Cycle de force (config + vue active), accès depuis s-home |

**Navigation** : Accueil · Progrès · **Séance** (centre, FAB rouge 54px) · Nutrition · Coach · Setup  
**Mode admin** : 5 taps sur le logo → onglet "Admin" caché dans Setup (email, test connexion, restaurer, réponse brute API)

## 🔎 Fonctionnalités PEU VISIBLES — celles qu'on oublie (et qui font dire des bêtises)

> **Pourquoi cette liste existe** : le 27/07, un audit a conclu que l'import de **prise de sang**
> manquait. **Il existait depuis le 8 juillet.** Michel a dû corriger de mémoire. Cause : la
> fonctionnalité n'était documentée que dans l'archive (lue à la demande), pas ici (lu à chaque
> session). ⚠️ **Avant d'affirmer qu'une chose n'existe pas, vérifier dans le code et dans
> `docs/INVENTAIRE.md`** (règle R23).

Ces fonctionnalités **existent** mais ne se voient pas dans la liste des écrans (elles vivent dans des
modales, des boutons secondaires ou des accès réservés) :

| Fonctionnalité | Où | Notes |
|---|---|---|
| 🩸 **Bilan sanguin** (import PDF/photo, lecture IA, injecté dans le contexte de Milo) | Profil → Santé | `#ov-blood-test` + `#ov-blood-redact` (**masquage de l'identité avant envoi** : on passe le doigt sur nom/date de naissance). Accès bêta (`_isBloodBeta()`). Backend `handleImportBloodTest_` / action `importBloodTest`. ⚠️ Garde-fou médical : aucun diagnostic, renvoie au médecin. Livré ft-v313, élargi ft-v320/321. |
| 🧪 **Bilan corporel** (balance pro / impédancemètre) | Profil | `#ov-bodyscan-form` — recopie ou **photo du rapport** lue par l'IA (`importBodyScan`), 12 valeurs + analyse segmentaire. Stocké dans `bodyScans`. Backend @69/@71. |
| 📸 **Suivi photos / séries** | Profil | `#ov-body-series` — séries de photos comparées dans le temps (`bodyStudy` mode `deep`/`compare`). Réservé super-testeurs. |
| 💪 **Muscles travaillés** | Séance | `#ov-mm` — détail des muscles primaires/secondaires d'un exercice. |
| 📅 **Sélecteur de jour de programme** | Séance | `#ov-day-sel` — « Quel jour aujourd'hui ? » au chargement d'un programme multi-jours. |
| ⚕️ **TRT** (traitement prescrit) | Profil → Santé | **Admin uniquement** (`_isAdminUnlocked()`). Milo adapte l'entraînement mais ne conseille JAMAIS sur le traitement. Livré ft-v581. |
| 📝 **Exercices manquants** (remontée auto des exercices perso créés par les utilisateurs) | Google Sheet, onglet « Exercices manquants » | `_reportCustomEx` (log.js) → `handleLogCustomExercise_` (Code.js). Agrège nom · groupe · **nb de signalements** · IDs anonymes · dates · **muscles cochés** (ajoutés ft-v714). Sert à décider quels exercices entrent au catalogue. **Se lit DANS l'app** : Profil → Admin → « 🏋️ Voir les exercices demandés » (ft-v715). |
| 🩺 **Santé du système** (stockage · sauvegardes · mails · IA) | Profil → Admin | `loadHealthAdmin()` (app.js) → routes `storeHealth`/`checkBackup`/`mailFails`/`aiUsage` + l'API publique GitHub pour les **mises en ligne** (ft-v717). **Les 4 alertes qui ne préviennent personne** : la panne du 29/07 (stockage plein à 102 %, plus aucune écriture pendant 2 j) y était lisible dès le 1ᵉʳ jour. Livré ft-v716. |
| 🎁 **Pop-ups testeurs** | démarrage | `#ov-emma-welcome`, `#ov-christophe-photos`, `#ov-tester-*`, `#ov-billoute` — messages personnels réservés (`TESTER_EMAILS`). Toutes doivent être dans `_OVERLAY_CLOSERS` (règle R15). |

---

## 🗺️ Carte de la connaissance (où vit quoi)

> Force Tracker n'accumule plus des *fonctionnalités* mais des *connaissances, principes, cas réels,
> décisions de conception*. Cet index dit **où trouver quoi** par DOMAINE. Le détail historique
> (catalogue des features + journal ft-v128→574) vit dans **`docs/JOURNAL-ARCHIVE.md`**.

| Domaine | Où | Quoi |
|---|---|---|
| **Fondamentales** | `CONSTITUTION-MILO.md` (v2.1) · `docs/VISION-FORCE-TRACKER.md` · `docs/PERSONAS-FONDATEURS.md` · `docs/MODELE-METIER.md` | Les principes stables, l'esprit/le pourquoi, les dimensions du projet, le langage métier commun. |
| **Conversation (Milo)** | `docs/MOTEUR-RAISONNEMENT-MILO.md` · `docs/ARCHITECTURE-CERVEAU-CERVELET.md` · `docs/PRESENCE-MILO.md` · `coach.js` (`buildCoachContext`, `_gardienRules`) | Le cerveau (Compréhension→Diagnostic→décision→Explication), **qui fait quoi entre Milo et une 2ᵉ IA**, la présence, le contexte injecté, le Gardien de sécurité (entrée). |
| **Mémoire** | `DOSSIER-ATHLETE-SUIVI.md` · `S.registre`/`S.adn`/`S.coachMemory` · `docs/VISION` (mémoire 3 niveaux) | Registre, ADN sportif, observations validées, mémoire durable, faits mesurés. Modèle : essentielle (gratuite) → intelligente (premium) → vivante (briques 7-8). |
| **Les 12 règles d'or** | `docs/REGLES-OR.md` (texte complet) · `CLAUDE.md` (une ligne par règle) | Le socle opérationnel : déploiement, premium, zéro perte, ouverture instantanée, backup, FAB, communication, checklist utilisateur, tenue des fichiers de suivi. |
| **Architecture (comment on construit)** | `docs/REGLES-ARCHITECTURE.md` | Les 38 règles de conception, chacune née d'un vrai événement. Le « comment on construit », distinct du « comment Milo se comporte » (Constitution). |
| **UX / produit** | `docs/PROCESSUS-DEVELOPPEMENT.md` · règles d'or #9-11 · `IDEES-FUTURES.md` · `A-FAIRE-SUR-PC.md` | Le cycle d'une brique, la checklist #11 (informer l'utilisateur), le FAB, les idées à venir, le backlog PC. |
| **Éthique / sécurité** | `CONSTITUTION-MILO.md` (P2/P13/P17/P22/P23) · `docs/BUGS-DE-PHILOSOPHIE.md` · `docs/GALERES-ET-LECONS.md` | Adapter pas interdire, accompagnement jamais thérapie, respect de la liberté, le récit ; les dérives de comportement corrigées ; les galères techniques. |
| **Ce qui EXISTE (inventaire)** | `docs/INVENTAIRE.md` (généré) + `tools/inventaire.py` | **Répond à « est-ce que c'est déjà construit ? »** — écrans, menus, modales, actions du serveur, nouveautés annoncées, avec une colonne qui signale ce qui est **dans le code mais absent de la doc**. ⚙️ **Généré depuis le code**, jamais écrit à la main (un inventaire manuel redevient faux en 3 semaines). À régénérer à chaque livraison : `python3 tools/inventaire.py`. |
| **Détail features + journal** | `docs/JOURNAL-ARCHIVE.md` | Le catalogue complet des fonctionnalités (ft-v128→441) + le journal des versions ft-v128→574 + la gouvernance antérieure. |

**🛡️ Gardien de la Constitution (sortie) — ⚠️ IL TOURNE EN PRODUCTION, cette case disait le contraire.**
Corrigé le 20/09/2026 : elle annonçait « en construction » alors que **`_gardienSortie` tourne pour tout le
monde depuis le 21/08** (`coach.js`, appelé par `renderCoachMsg` avant l'affichage). *Un document d'état qui
sous-déclare ce qui existe fait re-construire ce qui est déjà là* (**R23**). **L'étage 1 est LIVRÉ**, l'étage 2
(validation IA) reste une option future et coûteuse.
⭐ **Ce qu'il fait exactement, et les bornes comptent** : il lève **5 drapeaux** déterministes — `bloc_technique`
· `interrogatoire` · `diagnostic` · `promesse_vide` · `source_fabriquee`. ⛔ **Il ne réécrit JAMAIS une phrase**
(il commence par `_stripCoachTech`, ce que la prod faisait déjà, puis il **signale**). ⚖️ **Deux exceptions à
connaître** : sur `diagnostic` il **ajoute** chez tout le monde un rappel « Milo est un coach, pas un médecin » ;
et le **badge** qui nomme la dérive est **réservé** (clone + admin) — *afficher « promesse de mémoire sans rien
enregistrer » sous une réponse ferait douter n'importe qui de son coach, pour un défaut qui nous regarde*.
📊 **Il COMPTE chez tout le monde** (`_gardienCompter`, `ft4_gardienStats`) : **que des nombres**, jamais une
phrase (Constitution P3), avec le **dénominateur** (toute réponse est analysée) et une **version de règle** qui
remet le total à zéro quand un motif est recalibré. ⚠️ **Seuls 4 des 5 drapeaux comptent** comme dérive —
`bloc_technique` en est exclu. Cadre : `docs/MOTEUR-RAISONNEMENT-MILO.md`.

---

## 🔑 Références vivantes (extraits gardés au chaud)

> Blocs consultés en permanence — gardés ici pour éviter d'ouvrir l'archive. Version complète : `docs/JOURNAL-ARCHIVE.md`.

### Premium — mécanisme complet et pièges

#### Vérification côté backend (Code.js `getPremiumStatus_`)
Trois couches vérifiées dans l'ordre :
1. **`PREMIUM_HARDCODED_`** (tableau const dans Code.js) — priorité absolue, immune à tout trigger
2. **`PREMIUM_EMAILS`** Script Property — whitelist éditable, mais **peu fiable** (voir ci-dessous)
3. **`prem_{email}`** Script Property — accès daté (Ko-fi webhook)

```js
const PREMIUM_HARDCODED_ = [
  'michdu75@gmail.com',
  'elineazs32@gmail.com',
  'christophe@famillelanglois.fr'
];
```

#### ⚠️ PREMIUM_EMAILS — trigger fantôme
La Script Property `PREMIUM_EMAILS` est régulièrement réécrite à `michdu75@gmail.com,elineazs32@gmail.com` par un **trigger installable inconnu** créé manuellement dans l'UI Apps Script (invisible depuis clasp). Pour éditer la whitelist de façon fiable, ajouter les emails dans `PREMIUM_HARDCODED_` dans Code.js.

**Safeguard actif depuis @44** : `ensurePremiumEmails_()` est appelée à chaque `doPost` — si `PREMIUM_EMAILS` ne contient pas tous les hardcoded, elle les réécrit. Le trigger fantôme est ainsi rendu inoffensif.

#### Côté frontend (app.js / coach.js)
- `_premiumPending` (variable globale dans `app.js`) : `true` tant que `autoConnect()` n'a pas reçu la réponse serveur
- `showPremiumWall()` dans `coach.js` : retourne sans rien faire si `_premiumPending === true`
- `sendToCoach()` : affiche toast "Vérification premium en cours…" si quota dépassé mais `_premiumPending`
- `autoConnect()` : ping no-cors fire-and-forget, puis `loadProfile` avec await → applique `S.premium` → `_premiumPending = false`


### Protection de compte — code d'accès perso (le « mot de passe »)
- **Il EXISTE un vrai code perso par utilisateur** (≠ code admin, ≠ code premium). C'est le « mot de passe » qui protège la sauvegarde cloud.
- **Frontend** : `_authCode()`/`_setAuthCode()` (state.js) = clé localStorage `ft4_authcode`. Envoyé à CHAQUE `_cloudSync` (`authCode:_authCode()` dans le payload saveProfile). UI : overlay « protéger mon compte » (`#ec-code`, app.js `_protectPost({action:'setAccessCode',...})` pour poser/changer/retirer) ; restauration = champ `#restore-code-inp` (`_restoreSubmitCode`, setup.js).
- **Backend** (Code.js) :
  - `handleSetAccessCode_` (@ ~871) : pour poser un code il faut d'abord **vérifier l'email** (code 6 chiffres reçu par mail, `pending_confirms`). Code perso **min 4 caractères**. Stocké **haché+salé** `salt$SHA256(salt|code)` dans la Script Property `auth_{email}` — **jamais en clair** (même l'admin ne voit pas le code). `remove:true` retire la protection. Pose aussi `profile.emailVerified=true`.
  - `_authCheck_(email, code)` (@ ~52) : **INVARIANT ABSOLU** — un compte SANS `auth_{email}` se comporte exactement comme avant (aucune protection, rétrocompatible). Avec code → vérifie le hash. Appelé dans **saveProfile** (protège l'écriture) ET **loadProfile** (protège la restauration) → sans le code, impossible de lire/écrire un compte protégé.
  - `handleAuthStatus_` (@ ~903) : l'app demande juste si un compte est protégé → renvoie `{hasCode:bool, emailVerified:bool}`, **aucun secret divulgué**.
- **Limites honnêtes** : le code est optionnel (invariant ci-dessus) ; 4 chiffres = anti-curieux, pas anti-pirate déterminé. Solide (salt+SHA256, vérif email) mais court.
- ⚠️ **Ce code est la brique clé pour un futur « photos cryptées sur le Drive »** (chiffrement côté téléphone avec une clé dérivée du code perso → même l'admin ne voit que du charabia). Voir IDEES-FUTURES.md.


### 🧪 Clone de test (`/clone/`) — ⭐ REMIS EN ROUTE le 17/10/2026 (**D-084**), après son retrait du 23/08 (ft-v976)
- **Ce qu'il est aujourd'hui** (décision de Michel) : l'**environnement de test UX** — le code d'une BRANCHE servi sous https://michdu75-commits.github.io/forcetracker/clone/ pour les recettes iPhone, **gardé** jusqu'à ce que Michel décide qu'il ne sert plus.
- ⛔ **On ne l'édite JAMAIS à la main** : `python3 tools/clone_build.py <branche>` le régénère, relance le banc d'isolement (`tools/banc_clone_isolation.js`) et ne le **tamponne** que s'il est vert ; `check_regles` refuse un clone non tamponné. Contrôle négatif : `python3 tools/mut_clone_isolation.py`.
- ⛔ **Même domaine que la prod** : seul `tools/clone_shim.js` le sépare des vraies données (stockage local, IndexedDB, cookies sous `/clone/`, caches, événements, réseau vers le serveur / Milo / Supabase **coupé**). Il **refuse de démarrer** si un canal n'est pas vérifié. Conséquence assumée : dans le clone, Milo, la synchro et la restauration ne marchent pas, et les essais derrière `window.__FT_CLONE__` sont actifs.
- Ce qui suit est l'histoire de son **premier** retrait, gardée telle quelle (R30).

#### (Archive) ⛔ RETIRÉ le 23/08/2026 (ft-v976)
- **Ce qu'il était** : une copie fonctionnelle et live de l'app, dans un sous-dossier du même
  dépôt (un dépôt séparé m'étant impossible), pour essayer un restylage **sans toucher la prod**.
  Stockage isolé par un shim `cl_`, service worker propre, badge « 🧪 CLONE ».
- **Pourquoi il est parti** (décision de Michel : *« plus besoin des clones, ça permettra de
  gagner du temps »*) : **mesuré sur les 60 dernières versions, `clone/` a changé à chaque fois
  et zéro fois tout seul** — il ne servait plus de bac à sable, il recopiait. Coût réel : 8
  fichiers à dupliquer par version, un correctif propre au clone à re-poser, 2,8 Mo, et une
  deuxième source de vérité. Le jour même, un `cp` trop rapide a effacé 91 lignes de son shim
  d'isolation (restaurées) — le genre de dégât qu'il fabriquait en silence.
- ⛔ **Les gardes `window.__FT_CLONE__` restent dans le code, exprès** : des essais vivent
  derrière (voir le journal ft-v976). Ne pas les « réparer » ni les retirer sans décider de
  chaque essai.
- 👉 **Pour le refaire** : copier les fichiers servis dans un sous-dossier, réécrire les chemins
  d'assets vers `../`, poser le shim de stockage préfixé et un service worker réseau-first.

---

## Format de réponse Apps Script (v3.5)

```
GET ?test=1
→ {"status":"online","version":"3.5"}

GET ?action=loadProfile&email=...
→ {"status":"not_found"}
→ {"status":"ok","premium":bool,"premiumExpiry":"YYYY-MM-DD"|null,
   "profile":{name,bw,age,height,gender,goal,activityLevel,...},
   "prs":{},"sessions":[],"weightLog":[],"sleepLog":[],"cycle":null}

POST body JSON (Content-Type: text/plain;charset=utf-8)
{action:"saveProfile", email, name, bw, age, ..., sessions[], prs{}, weightLog[], sleepLog[], cycle}
→ {"status":"ok"}

POST {action:"logSession", rows:[...], bw, date, gender, age}
→ {"status":"ok","count":N}

POST {action:"coach", message, context, history}
→ {"reply":"..."}

POST {action:"validateCode", code, email}
→ {"status":"ok","type":"lifetime"} | {"status":"invalid"}

POST {action:"importProgram", images:[{type, data, name?, isText?}]}
→ {"status":"ok","data":{"name","weeks","startDate","days":[...]}}

POST {action:"importHistory", images:[{type, data, name?, isText?}]}
→ {"status":"ok","data":{"sessions":[{date,estimatedDate,label,exercises:[{name,sets:[{kg,reps,type,note}],note}]}]}}

POST x-www-form-urlencoded data={"email":"...","amount":"4.99",...}  ← Webhook Ko-fi
→ "OK"
```

## Conventions de code

- Pas de framework, pas de bundler — JS vanilla inline dans `index.html`
- State global `S` avec `persist()` / `load()` pour le localStorage
- Fonctions de rendu : `renderHome()`, `renderNutrition()`, `renderLog()`, etc.
- Navigation : `goScreen(id, navBtn)`
- Modals : `.overlay` + `.modal` + classe `.open`
- Toast : `toast(message, 'success'|'error'|'info')`
- **Appels réseau vers Apps Script** :
  - `_cloudSync()` (saveProfile) : `mode:'no-cors'` — ne pas changer, crash CORS historique
  - `syncSheets()` (logSession) : CORS + `redirect:'follow'` + `Content-Type: text/plain;charset=utf-8` — confirmation serveur nécessaire

## Variables clés

```javascript
const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA/exec'; // dans constants.js
S.url             // = DEFAULT_URL (jamais null)
S.email           // email utilisateur (stocké ft4_email)
S.connected       // bool (stocké ft4_ok)
S.bw              // poids corps kg
S.prs             // {exerciceName: {rm1, kg, reps, date}}
S.sessions        // [{date, exs:[{name, sets:[{kg,reps,done,type,rm1}]}], vol}]
S.weightLog       // [{date, kg}]  ⚠️ `kg`, PAS `bw` — corrigé le 30/08/2026 : la doc disait `bw` depuis toujours, l'app écrit `kg` PARTOUT (tracking.js, l'import de pesées, le restore). Une fixture de test écrite d'après cette ligne rend `value="undefined"` dans le champ de pesée — c'est arrivé, R23.
S.sleepLog        // [{date, hours, energy}]
S.cycle           // {startDate, weeks, rm1s:{...}} ou null
S.coachFree       // nb questions gratuites utilisées (ft4_coachFree)
S.premium         // bool — accès premium (ft4_premium)
S.programmes      // [{name, date, exs:[...]}] — templates séances (ft4_progs)
S.defRest         // durée repos par défaut en secondes (130)
S.badges          // {badgeId: {unlockedAt:'YYYY-MM-DD'}} (ft4_badges)
S.bday            // date anniversaire 'JJ/MM' (ft4_bday)
S.lastWeekSummary // date du dernier résumé hebdo affiché (ft4_lws)
_expandedEx       // index exercice ouvert dans s-log (ou -1)
_syncTimer        // handle setTimeout pour _cloudSyncDebounced
_exPickerMode     // 'workout' | 'prog' — intercept addExercise() pour éditeur programme
_editProgIdx      // index du programme en cours d'édition
_editProgData     // deep copy du programme en cours d'édition
_editDayIdx       // index du jour cible pour ajout d'exercice
_lastProgAnalysisProg // dernier programme analysé par IA
_lastProgAnalysisReply // dernière réponse IA analyse programme
```

## Notes techniques importantes

### Silhouette musculaire féminine
- `_mscSVG` et `_mscSVGmini` utilisent la **même silhouette masculine** pour les deux genres (décision 2026-06-16)
- `female-body.png` est présent dans le projet mais **non utilisé** — tentatives d'intégration échouées (SVG `<image>` ne supporte pas CSS filter sur iOS WebKit, overlays difficiles à positionner)
- Dead code présent dans index.html : `_MG_F_SHAPES`, `_BDY_F`, `_BDY_F_MINI`, `_fHl`, `_mscSVG_F` — inoffensif, utilisable pour une future implémentation

### Dark mode
- Dark mode = **défaut** (pas de classe sur `#root`)
- Light mode = classe `light-mode` sur `document.getElementById('root')`
- Détection JS : `document.getElementById('root')?.classList.contains('light-mode')`
- Persisté : `localStorage.getItem('ft4_theme')` = `'light'` ou `'dark'`

## Règles du projet

### Service Worker — bump du cache obligatoire
À chaque release (push sur master + GitHub Pages) qui modifie un asset statique (images, CSS, JS) :
1. Ouvrir `sw.js`
2. Incrémenter `const CACHE = 'ft-vN'` → `ft-v(N+1)`
3. Le `controllerchange` listener dans `index.html` rechargera l'app automatiquement chez les utilisateurs — pas besoin de vider le cache manuellement

Ne pas bumper si la modif ne concerne que `Code.js` (backend Apps Script uniquement).

## 🗓️ Journal des versions — récent (ft-v575 → ft-v590 + gouvernance récente)

> **Version actuelle : `ft-v1262`** (prochaine : `ft-v1263`).
> 📷 **LE SCANNER CAMÉRA N'A PAS DE BOUTON, ET C'EST UNE DÉCISION (Michel, 14/09)** : *« aucun
> bouton utilisateur tant que je n'ai pas tranché »*, le temps du banc d'essai des moteurs.
> **Le moteur reste en place et reste éprouvé** — ⛔ ne pas « réparer » cette absence : deux
> témoins la figent dans les deux sens. Verdict du banc : **`C — zxing-wasm en principal +
> Quagga2 en repli local`**, `docs/BANC-MOTEURS-CODEBARRES.md`. **Décision de Michel attendue.**
> 🧊🧊 ⚠️ **MIS À JOUR LE 19/10/2026 — LA SUITE N'EST PLUS L'ÉTAT DE LA NUTRITION, C'EST L'HISTOIRE D'UNE DÉCISION.** Depuis le 13/09, la nutrition a été **rouverte lot par lot, chaque fois sur feu vert explicite de Michel**, et publiée **cinq fois** : **ft-v1245** (30/09, B3 — l'écart entre la cible et les macros est dit, D-034) · **ft-v1246** (01/10, la cible du jour et la dépense) · **ft-v1247** (01/10, une restauration ne supprime plus de ligne du journal) · **ft-v1249** (02/10, **lipides = 25 % de la cible calorique**, D-035) · **ft-v1254** (14/10, recherche d'aliments, quantité illisible refusée). ⭐ **Chaque dégel était limité à son lot : la consigne du 13/09 tient toujours** — on ne modifie pas le comportement de la nutrition sans feu vert explicite. ⛔ *Ne plus résumer ce paragraphe par « nutrition gelée depuis le 13/09, rien n'a bougé » : c'est faux, et je l'ai dit à Michel le 19/10 pendant qu'il cherchait un bug de macros (**R23** : un document d'état faux fait dire des bêtises à celui qui le lit). Ce qui a changé se lit dans `git log` et `docs/JOURNAL-ARCHIVE.md`, pas ici.* ↪️ **21/10/2026 — ORDRE DE TRAVAIL PRIORITAIRE DE MICHEL : la Nutrition redevient la priorité n°1**, lot par lot, chacun sur branche dédiée et arrêté avant toute fusion ou publication. **M6** (le rejeu d'un repas habituel lisait l'écran d'ajout) est **corrigé** (**D-094**, `BUGS.md` §90) et sa **publication seule en `ft-v1258`** est autorisée par Michel (21/10, ce lot seul) et ✅ **publiée le 21/10 en `ft-v1258`** (master `da523380`, Pages n°1358 ; commit de version préparé par session-A, repris par Claude Principal après les contrôles restants : entrée `ft-v1258` ci-dessous) ; puis M1 → M4 ; le patch d'historique v1.2 reste une **simulation**, jamais appliqué sans Michel. ↪️ **24/10/2026 — NUTRITION V2 PUBLIÉE en `ft-v1260`** (GO de Michel, V2 seule : app uniquement, `Code.js` P1 + `D-110` déjà en ligne @193 depuis 00:58 UTC ; `D-111` = règle A ; `D-112` reportée ; aucune migration ni restauration de données).
> 🧊 *(La décision du 13/09, telle qu'écrite ce jour-là :)* **LE CHANTIER NUTRITION EST EN PHASE D'OBSERVATION RÉELLE — NE PAS Y TOUCHER (décision de Michel, 13/09/2026, après validation de l'étape 6).** *« Je ne veux pas lancer un nouveau chantier Nutrition pour l'instant. Ne modifie plus son comportement sans nouveau feu vert explicite. »* ⛔ **Ce qui est GELÉ, nommément** : les **21 règles** de la douane · aucune ne devient **bloquante** · aucun **seuil** · les **divergences déjà connues** (elles restent telles quelles) · `savedFoods` · l'écart **48,3 / 48** · l'historique et les migrations · **le format du carnet d'observation**. ⭐ **Ce qu'on attend** : ≥ **100 lignes** réellement observées · les **4 écrivains** vus au moins une fois (`addFoodEntry` · `quickAddFood` · `rejouerRepas` · `saveEditFood`) · idéalement **2 semaines** · et surtout une **couverture** suffisante des formes réellement rencontrées. ⚠️⚠️ **ET LA CONSIGNE QUI COMPTE LE PLUS QUAND LE RAPPORT ARRIVERA** : *« une règle qui n'a jamais mordu ne doit PAS être considérée automatiquement comme inutile — il faut vérifier que les formes capables de la déclencher ont réellement été rencontrées »*. 👉 *Sans cette vérification, « jamais mordu » se lit « à supprimer », et on retirerait un garde-fou parce que le cas ne s'est pas encore présenté.* Le rapport se lit dans **Profil → Admin → « 📊 Douane — observation du journal »**.
 Historique complet (ft-v128→574 + gouvernance
> antérieure, **+ ft-v575→632 déménagées le 28/07**) → **`docs/JOURNAL-ARCHIVE.md`**. Le n° de cache se lit dans `sw.js` (`const CACHE='ft-vNN'`).
> 📄 **UN PDF POUR GPT À CHAQUE LIVRAISON — consigne de Michel du 13/09/2026** : *« fais un PDF à
> chaque fois stp pour GPT »*. **Écrite ici plutôt que ré-appliquée** : il l'avait demandée **8 fois
> d'affilée** (ft-v1196 → ft-v1202), et le mécanisme des règles de ce projet dit exactement ça —
> *quand Michel répète une consigne, ne pas la ré-appliquer : l'ÉCRIRE* (`docs/ORIGINE-DES-REGLES.md`).
> ⚙️ **Le patron est fixe** : un générateur `tools/gen_NNNN_pdf.py`, un `docs/SOUS-ETAPE-*.pdf`, et
> ⛔ **des gardes qui RECOMPTENT chaque chiffre depuis le code servi et refusent de produire si un
> fait tombe** — y compris le total de la passe, qui se **lit dans son journal** et jamais à la main
> (leçon ft-v1201, où un PDF a publié un total pendant que la passe tournait encore). Les gardes
> s'éprouvent par mutations **sur un arbre copié** (`BUGS.md` §60 par construction). ⭐ *Ce ne sont
> pas des formalités : ils ont déjà attrapé un titre dupliqué, un pied de page périmé et deux
> chiffres faux — les miens.* ⚠️ **Contrainte de police** : WinAnsi/cp1252, aucun emoji.
>
> **Entretien** : ajouter chaque nouvelle version ICI (règle d'or #12). Quand ce journal récent dépasse
> 📉 **Depuis le 26/10/2026 (Michel, optimisation du contexte) : l'entrée ICI est un RÉSUMÉ COURT** (version · modification · raison · référence), dans la forme `**ft-vNNNN — TITRE** — …` que `check_regles.py` compte (seuil : 8). **Son texte complet s'écrit directement dans `docs/JOURNAL-ARCHIVE.md`** (même titre, AJOUT seulement, jamais de réécriture) — plus de « couper / coller » de l'entrée entière. Le journal complet ft-v1253 → ft-v1260 y est déjà.
> **8** entrées, déménager les plus anciennes dans `docs/JOURNAL-ARCHIVE.md` (couper/coller, rien
> supprimer). `python3 tools/check_regles.py` le signale automatiquement.
> 📉 **LE SEUIL EST PASSÉ DE 20 À 8 LE 02/09/2026, SUR UNE MESURE.** Michel : *« pourquoi il est plein
> d'après toi ? il n'arrête pas de compacter »*. Chiffré : chaque session charge **~58 000 jetons AVANT
> le premier mot** (ce fichier 48 k + `REGLES-ARCHITECTURE.md` 10 k, tous deux auto-importés), et
> **66 % de ce fichier était le journal** — 122 000 caractères pour 20 entrées, **6 000 de moyenne**,
> une à **24 000**. ⚠️ **Le fichier le documentait lui-même** : la scission du 28/07 a eu lieu parce
> qu'il faisait 33 000 mots dont **79 % de journal** ; il en faisait **29 900 dont 66 %** — *on était
> revenus au point qui avait déclenché la scission*. C'est **R20** (le prompt est opérationnel, la doc
> est de la mémoire) qui se rappelle tout seul. **Gain mesuré : ~18 000 jetons rendus à chaque session.**
> ⭐ **Et rien n'est perdu** : le journal complet vit dans l'archive, lue à la demande. *Ce qui coûte
> cher n'est pas d'écrire long, c'est de RELIRE long à chaque fois.*
> ⚠️ **L'ARCHIVE S'AJOUTE, ELLE NE SE RÉÉCRIT JAMAIS** (leçon du 04/08 : un script d'archivage l'a
> **écrasée** — 297 entrées perdues, découvertes 2 jours plus tard **par hasard**, parce que rien ne
> la surveillait). Le même `check_regles.py` refuse désormais toute entrée disparue. **Toujours
> AJOUTER à la fin, jamais ouvrir le fichier en écriture**, et lire le diff avant de committer :
> un `-1793` dans le numstat n'est pas un détail.

**ft-v1262 — 🥗 NUTRITION · UN ANCIEN ALIMENT RETROUVE SA FICHE (PROPOSÉE, JAMAIS CHOISIE À TA PLACE) · « MODIFIER » GARDE LE PRODUIT (D-143)** — ✅ publiée le 27/10/2026 (GO de Michel ; commit validé `492666e3`, sans le commit documentaire). **Quoi** : une ancienne ligne sans code-barres ni code CIQUAL propose les produits identifiés de même nom exact du journal ; tu choisis, les valeurs viennent de la fiche, ta quantité tapée est gardée, rien n'est écrit avant « Ajouter » ; « Modifier » garde le produit quand seuls le nom ou le repas changent. **Pourquoi** : « Modifier » faisait perdre l'identité d'une ligne (`sourceId:null`) et les anciennes saisies restaient sans fiche (`BUGS.md` §125). **Ne fait pas** : `Code.js` inchangé (Apps Script @193) ; aucune donnée persistée en plus, aucune migration ; D-144 reste à confirmer. Pas de pop-up (aide, point rouge et diapo du Guide). Tests : D-031 répartie 8 280 ✅ / 0 ❌ et classique 8 242 ✅ / 0 ❌ sur `492666e3` (navigateur substitué, pas une validation stricte). sw.js ft-v1262. Texte complet : `docs/JOURNAL-ARCHIVE.md` (même titre).

**ft-v1261 — 🥗🏋️ NUTRITION + SÉANCE · LA QUANTITÉ POSÉE SURVIT À LA FICHE RETROUVÉE (D-101), L'EXPORT DIT D'OÙ VIENT CHAQUE LIGNE, L'ÉCRAN SÉANCE ET SES CHIFFRES** — ✅ publiée le 27/10/2026 (GO de Michel ; master `7ad3330f`, Pages n°1361 réussi 10:46 UTC ; site réel non joignable depuis le conteneur, donc non vérifié en réel). **Quoi** : la quantité tapée sur une ancienne ligne (130 → 180 g) reste à l'écran quand la fiche CIQUAL / produit / marque est choisie, et les valeurs se recalculent pour elle (D-101, NUT-QTY-02) ; CIQUAL hors ligne dit « référence indisponible » (NUT-CIQ-HL-01) ; l'export Nutrition ajoute 5 colonnes (source_id, pour-100 g) ; deux favoris identiques = une proposition ; Séance : repos qui survit à la fermeture (D-102), vignettes anatomiques, mêmes chiffres partout. **Pourquoi** : POM'POTES et riz Taureau Ailé (iPhone, 26/10) ; audit Séance du 23/10. **Ne fait pas** : `Code.js` inchangé (Apps Script @193) ; D-141 et `hiddenFoods` NON déployés (les anciens favoris ne sont écartés que sur l'appareil qui a fait la remise à zéro) ; aucune migration, aucune suppression de données. Pas de pop-up. Tests : D-031 répartie 8 234 ✅ / 0 ❌, 13 « sans objet » non comptés (navigateur substitué, pas une validation stricte). sw.js ft-v1261. Texte complet : `docs/JOURNAL-ARCHIVE.md` (même titre).

**ft-v1260 — 🥗 NUTRITION V2 · LES GRAMMES D'ABORD, RIEN N'EST INVENTÉ, UNE REPRISE ÉCRIT CE QU'ELLE AFFICHE** — ✅ publiée le 24/10/2026 (GO de Michel, V2 seule ; master `1df57e4c`, Pages n°1360). **Quoi** : un seul moteur (`nutrition-v2.js`) calcule et écrit chaque ligne (D-096) ; ajout en grammes / ml d'abord, rien de pré-rempli, valeur inconnue = « ? » (total partiel), reprise = ce que l'écran affiche, correction à la main conservée. **Pourquoi** : incident du 23/10 (`BUGS.md` §98) — une reprise écrivait autre chose que l'écran. **Ne fait pas** : aucune migration d'ancien journal ; `Code.js` inchangé (@193). Pop-up v80. Tests : passe D-031 7 920 ✅ / 0 ❌. sw.js ft-v1260. Texte complet : `docs/JOURNAL-ARCHIVE.md` (même titre).

**ft-v1259 — 🍽️ ADMIN · CARTE « INVENTAIRE NUTRITION » (A2)** — ✅ publiée le 22/10/2026 (GO limité, master `3d6953c4`, Pages n°1359). **Quoi** : Profil → Admin → Surveillance lance les deux diagnostics en lecture seule (`nutInventory`, `nutBackupAudit`, Apps Script @192), jeton admin dans le corps d'un POST, que des nombres. **Pourquoi** : les routes étaient déployées sans aucun moyen de les lancer. Pas de pop-up (onglet Admin). `app.js` et `index.html` seulement. Tests : D-031 7 843 ✅ / 0 ❌. sw.js ft-v1259. Texte complet : `docs/JOURNAL-ARCHIVE.md` (même titre).

**ft-v1258 — 🍽️ NUTRITION M6 · LE REJEU D'UN REPAS HABITUEL ET L'AJOUT RAPIDE NE LISENT PLUS L'ÉCRAN D'AJOUT** — ✅ publiée le 21/10/2026 (GO limité à ce lot, master `da523380`, Pages n°1358). **Quoi** : marqueur `ecran:false` sur la provenance (D-094) ; `app.js` seul. **Pourquoi** : chaque aliment rejoué héritait de l'aliment affiché juste avant (quantité, faux pour-100 g, portion). **Ne fait pas** : les lignes déjà contaminées restent (patch d'historique = simulation, D-095). Pas de pop-up. Tests : D-031 7 823 ✅ / 0 ❌. sw.js ft-v1258. Texte complet : `docs/JOURNAL-ARCHIVE.md` (même titre).

**ft-v1257 — 🏋️ L'ÉCRAN SÉANCE REFAIT (D-083 → D-093) · « ÉCHEC » ET « 0 » SÉPARÉS · « TA SÉANCE JUSQU'ICI » FACE · CHIFFRES · DOS · TESTS SÛRS (D-031 SÉCURITÉ)** — ✅ publiée le 21/10/2026 (master `ab463fb1`, Pages n°1357). **Quoi** : « Séance libre / Programme » avant, en-tête de séance dans la barre, actions rares dans ⋯, pastille N / É / X, réserve Échec · 0 · 1 · 2 · 3 · 4+, « Précédent » sans série dupliquée, 35 explications d'aides corrigées, harnais de tests sûrs par construction. **Pourquoi** : écran empilé, « échec » enregistré comme RIR 0, aides fausses (audit du 17/10) ; S-01 et CC-01 reçoivent enfin leur clé de cache. Pop-ups v78 et v79. Tests : D-031 7 791 ✅ / 0 ❌. sw.js ft-v1257. Texte complet : `docs/JOURNAL-ARCHIVE.md` (même titre).

**ft-v1256 — 🔎 PROGRÈS → SÉANCES · LE FILTRE DE L'HISTORIQUE TIENT SUR UNE LIGNE ET PREND PLUSIEURS ZONES · « CE QUE TU TRAVAILLES » REPART REPLIÉ** — ✅ publiée le 15/10/2026 (feu vert de Michel). **Quoi** : filtre compact repliable, plusieurs zones en logique OU, en mémoire seulement (D-079) ; panneau « par semaine » replié à chaque lancement (D-080) ; aucune clé de stockage. **Pourquoi** : les pastilles prenaient 3 à 6 lignes ; la mémorisation de l'état était un choix de Claude, pas de Michel. Pas de pop-up. Tests : D-031 7 067 ✅ / 0 ❌. sw.js ft-v1256. Texte complet : `docs/JOURNAL-ARCHIVE.md` (même titre).

**ft-v1255 — 🗂️ PROGRÈS → SÉANCES · TOUT L'HISTORIQUE, PAR ANNÉE PUIS PAR MOIS · 🏅 LES BADGES PASSENT DANS LE MENU** — ✅ publiée le 15/10/2026 (feu vert de Michel). **Quoi** : Progrès = Séances · Exercices · Corps & santé, Séances d'abord (D-076) ; historique Année → Mois → Séance sans plafond de 20 (D-077) ; volume 14 | 28 jours (Milo garde 14) ; Badges dans Menu → Ton suivi (D-078). **Pourquoi** : l'historique n'en montrait que 20 et les entrées menaient à l'historique sans viser la séance. Pop-up v77. Tests : D-031 7 052 ✅ / 0 ❌. sw.js ft-v1255. Texte complet : `docs/JOURNAL-ARCHIVE.md` (même titre).
