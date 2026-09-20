# ⚡ RÈGLES D'OR — à lire à chaque session avant tout le reste

> **Version courte, une ligne par règle.** Le texte complet, le pourquoi et les cas vécus sont dans
> **`docs/REGLES-OR.md`** — à ouvrir quand une règle est contestée ou qu'on hésite à la contourner.
> *Une règle noyée dans un fichier qu'on ne lit plus n'est plus une règle.*

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

14. **📄 Un PDF à CHAQUE fin de session** (étude · audit · plan · dossier · compte rendu) — **hors du dépôt** (il est public), **autonome**, **daté dans son nom**, et **vérifié après génération** (*un PDF muet ressemble à un PDF réussi*). ⛔ Il ne remplace **jamais** la réponse en clair : *le PDF est la mémoire, le message est la réponse*. → `docs/REGLES-OR.md#14`


15. **🔒 UNE DÉCISION ACTÉE RESTE ACTÉE.** Toute décision produit · UX · architecture · métier **explicitement validée par Michel devient une CONTRAINTE du projet** — pas un avis, pas un point de départ. ⛔ **Un audit ultérieur ne la retransforme JAMAIS en question**, et ne propose pas spontanément d'y revenir. ⚖️ **Le seul motif de réouverture est une PREUVE NOUVELLE ET MESURÉE** : techniquement impossible · dangereux · en contradiction avec une autre décision active · ou produisant un défaut réel. ⛔⛔ **Et même alors, on ne change rien seul** : on expose la preuve et l'impact, puis **on attend la décision de Michel**. ⛔ Une préférence technique, une « bonne pratique », une optimisation possible ou une idée neuve **ne suffisent jamais**. 💡 Les idées non demandées se **consignent à part** et ne deviennent pas un chantier sans accord explicite. ⭐ **La phrase qui tranche tout** : *« le code actuel et les mesures disent ce qui EST ; Michel décide ce qui DOIT ÊTRE. »* → `docs/REGLES-OR.md#15`

16. **🔍 AUCUNE IMPOSSIBILITÉ NI ACTION MANUELLE SANS PREUVE.** Avant d'affirmer qu'un test est **impossible** ou de demander une **manipulation manuelle** à Michel, vérifier d'abord si l'**accès existe réellement**, si l'action est **déjà automatisée** (workflow GitHub Actions · Cloudflare · Supabase · un script du dépôt), si l'**état demandé est déjà atteint**, et si l'impossibilité a été **mesurée**. ⛔ **Une supposition ne devient JAMAIS une contrainte.** ⚙️ La chaîne obligatoire est **TESTÉE → OBSERVÉE → EXPLIQUÉE**, jamais *supposée → transformée en décision* : un blocage se dit avec sa **cause technique précise** (« HTTP 403 même avec l'`Origin` attendu, domaine bloqué par le proxy »), jamais par « je ne peux pas ». ⭐ **Toute instruction donnée à Michel est une sortie critique** — nécessaire · pas déjà faite · pas automatisée · compatible avec l'état réel · réversible. ⚖️ **Elle complète la #15** : *Michel décide ce qui DOIT ÊTRE, le code dit ce qui EST — et Claude ne transforme jamais une supposition sur ce qui EST en contrainte sur ce qui DOIT ÊTRE.* → `docs/REGLES-OR.md#16`

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
- 🤝 **`docs/JOURNAL-DE-PARTAGE.md`** — **QUI TRAVAILLE SUR QUOI, EN CE MOMENT** (protocole établi par Michel le 24/08/2026, après une collision réelle : *deux sessions Claude ont écrit ft-v991 et ft-v992 chacune de son côté*, même travail deux fois, découvert au moment de pousser). ⚡ **Le geste, avant toute tâche** : `git fetch origin --all` → lire le tableau → écrire SA ligne (une seule : date · heure UTC · sujet · fichiers) → **pousser AVANT de coder** → clore avec la version. ⛔⛔ **LA FAILLE EST NOMMÉE DANS LE FICHIER, et il faut la connaître** : les sessions travaillent sur des **clones séparés**, donc *un fichier ne prévient pas — il faut aller le lire*. Sans le `git fetch`, le protocole donne une **fausse sécurité**, ce qui est pire que pas de protocole. ⭐⭐ **Et le vrai verrou n'est pas ce fichier, c'est GIT** : un push non-fast-forward **échoue** — c'est ce qui a sauvé le travail de l'autre session le 24/08. *Le journal est un panneau d'affichage, pas une serrure* : il évite le doublon de **travail**, git évite l'écrasement de **code**. Porte aussi les 3 autres limites écrites plutôt que découvertes (la **fenêtre de course** entre lire et écrire — la même que `_saveCoachMemory` en ft-v993 · une session qui **meurt** laisse une ligne bloquante, d'où la **péremption à 3 h** · et le fait que tout repose sur la **discipline**). ⚠️ Heures en **UTC** : deux conteneurs peuvent être réglés différemment (famille « fuseaux horaires » de `BUGS.md`, appliquée à nous-mêmes).
- ⚡ **`docs/REGLES-OR.md`** — **les 12 règles d'or EN ENTIER** (le pourquoi, les cas vécus, les garde-fous). `CLAUDE.md` n'en porte que la version d'une ligne depuis la scission du 28/07/2026 : ce fichier faisait **33 000 mots** relus à chaque session, dont **79 % de journal**. *Une règle noyée dans un fichier qu'on ne lit plus n'est plus une règle.* Cohérence des deux fichiers vérifiée par `python3 tools/check_regles.py`.
- 🌟 **`docs/VISION-FORCE-TRACKER.md`** — **l'ESPRIT / le POURQUOI du produit** : *« Force Tracker n'est pas une IA, c'est une mémoire sportive intelligente »* · *« il ne te dit pas qui tu dois devenir, il se souvient de qui tu es devenu »*. Le sportif ne repart jamais de zéro ; la vie avant le programme ; observer avant conseiller ; adapter avant interdire. **Question de référence avant toute feature : « est-ce que cela renforce l'esprit Force Tracker ? »** La Constitution dit le *comment*, la Vision dit le *pourquoi*.
- 👥 **`docs/PERSONAS-FONDATEURS.md`** — **à lire juste après la Vision** : les personas ne sont plus des profils de test, ce sont les **dimensions du projet**. **Michel** = Vision & Architecture (le fondateur, à part). **Christophe** = Terrain & Métier (→ VM). **Tatiana** = Personnalisation, pas de présupposés (→ VC). **Emma** = Physiologie & Ressenti (→ VC). Relie chaque évolution technique à un besoin humain concret. Règle : un nouveau persona n'entre que s'il ouvre une **dimension** nouvelle. *(Idée & conception : Michel.)*
- 🧩 **`docs/MODELE-METIER.md`** — **le LANGAGE COMMUN du produit** (v0.1, vivant) : les objets métier que TOUS les modules partagent (Athlète · Objectif · Programme · Cycle · Séance · Bloc · Exercice · Série · Exercice-bibliothèque) + transversaux (Méthode · Consigne · Notation) + la grammaire + le principe **PLANIFIÉ vs RÉALISÉ**. Cap posé par Michel (21/07/2026) : penser « objets métier », pas « fonctionnalités ». Se distille des vrais programmes, reste vivant. Lié au chantier structures (`PARSER-STRUCTURES.md`).
- 🔬 **`docs/SUIVI-AUDIT.md`** — **LE SCORE DE L'AUDIT** (créé 23/08/2026, demande de Michel : *« il faudra que tu écrives les journaux sur ce qui a été fait, à faire aussi, et les rapports d'audit pour savoir où on en est »*). ⚠️ **Il ne raconte rien — il tient le score.** Le journal dit *« que s'est-il passé et pourquoi »*, le contexte dit *« où on en est aujourd'hui »*, l'inventaire dit *« est-ce déjà construit »* ; celui-ci répond à la seule question qui restait : **« qu'est-ce qui reste de l'audit ? »**. Un sujet y **change d'état**, il ne s'y duplique jamais. ⛔ **Et un sujet ÉCARTÉ y reste avec sa raison** (**R30**) — sinon il revient dans six mois et quelqu'un le « répare ». Porte les **3 bloquants corrigés** (ft-v981/982/983), ce qui reste **par palier** (ouverture large · après prod · décisions produit), les **6 points écartés comme faux ou obsolètes**, et surtout les **5 leçons de méthode** de la session — qui valent plus que les correctifs parce qu'elles se rappliquent : *un test qui n'emploie pas le schéma de la production ne teste rien, il rassure* · *avant de PROMOUVOIR un essai parqué, chercher pourquoi il l'était* · *reproduire avant de conclure* · *compter les endroits* · *un contrôle négatif peut mentir*.
- 📍 **`docs/CONTEXTE-ACTUEL.md`** — **À LIRE EN PREMIER avant toute nouvelle tâche** (1 page) : version, branche, brique active, dernières décisions, prochaine étape, blocages. Le raccourci pour reprendre le contexte sans tout relire.
- 🏛️ **`docs/REGLES-ARCHITECTURE.md`** — **COMMENT ON CONSTRUIT** (créé 27/07/2026 sur une proposition de GPT, qui pointait un vrai manque : les règles de conception existaient mais **éparpillées**). **38 règles** rassemblées (R1→R36, plus R4a/R4b), chacune née d'un **événement réel** (bug, décision, galère) : les **données** (source de vérité unique · ne jamais dupliquer · comportement observable *différé mais nommable* · **l'info doit descendre jusqu'à la DONNÉE pas rester dans le TEXTE** · l'audit à l'envers) · les **décisions** (une seule voix, construite **émergentiellement** · le cerveau distribué → **le prompt est le dernier levier** · un prompt ne compense jamais une donnée absente · le **modèle** est une variable structurelle · permissions **bornées** · sécurité > vitesse · cohérence > réactivité) · la **construction** (enrichir l'existant · un comportement copié peut devenir faux · tout chemin de fermeture pose son marqueur · local-first · chaque bug devient un test · vérifier le **déploiement** pas le push) · la **gouvernance** (légère · prompt maigre / doc jardinée · critère d'entrée · retours à 3 paliers) · et **R36 — ce qui décrit LE MONDE se récolte, ce qui décrit LA PERSONNE reste chez elle** (avec son compagnon : un texte libre ne se garde qu'à partir de 3 identifiants distincts). ⚠️ **Ne pas confondre avec la Constitution** : celle-ci dit comment Milo se comporte envers la **personne** (éthique) ; celui-là dit comment on **construit le système**. En cas de conflit, la Constitution l'emporte.
- **`docs/PROCESSUS-DEVELOPPEMENT.md`** — la **méthode officielle** : le cycle d'une brique (Réflexion → Spécification `Objectif/Critère/Hors périmètre` → Challenge → Développement → **Clôture obligatoire** → Validation Michel). Suivre ce processus pour CHAQUE brique, sans sauter d'étape.
- **`CONSTITUTION-MILO.md`** — les principes stables (la personne d'abord, sécurité, faits avant opinions, confidentialité…). Toute évolution doit les respecter.
- 🎟️ **`docs/SEANCE-DESSAI.md`** — **LE PARCOURS DE DÉCOUVERTE, et là où Milo entre en jeu** (cadré le 25/08/2026 avec Michel ; **rien n'est construit**, le doc fixe les décisions AVANT de coder). ⭐⭐ **La métaphore qui tranche tout** : *« comme dans une salle de sport, on te propose une séance gratuite »* — or une séance d'essai en salle **n'est PAS une version bridée**. Donc **on n'appauvrit pas l'exemple** : ce que Milo vend n'est pas *une séance*, c'est **ce qui se passe la fois d'après**. *Un exemple parfait ne cannibalise pas Milo, parce qu'un exemple ne se souvient de rien.* ⛔⛔ **Milo juge LA SÉANCE, pas la personne** (il ne la connaît pas encore) — puis il propose *lui-même* d'en apprendre plus : **le manque devient l'accroche au lieu d'être caché**, au lieu de faire semblant de savoir. ⭐⭐ **La décision structurante** : le **débrief CHIFFRÉ est calculé en LOCAL, toujours** ; Milo n'ajoute pas les faits, il ajoute le **jugement, le ton, la recommandation**. *C'est la même ligne de code qui règle la panne réseau ET la consommation d'API* — et c'est `ARCHITECTURE-CERVEAU-CERVELET` appliquée à un nouvel endroit. ⭐ **Beaucoup existe déjà** (à rebrancher, pas à construire) : `DISC_LABELS`/`DISC_CADRE` (les types de séances et leur cadre chiffré), `openBeginnerSetup` (le questionnaire 2 questions **sans IA** + le générateur, enfermé derrière « parcours débutant »), l'éditeur de programme (`editProg`, **sans porte d'entrée**), le débrief (ft-v979). **Le seul vrai trou : les conseils d'échauffement.** ⚠️ **Ce qui n'est PAS tranché** : les exemples restent-ils pour toujours ou est-ce un essai limité · et surtout **ce qui est « absolument nécessaire » à Milo vs optionnel — qui se MESURE au banc d'essai (R34), lequel n'a jamais tourné faute de clé API**. Tant qu'il n'a pas tourné, tout tri est une hypothèse.
- **`docs/PRESENCE-MILO.md`** — vision d'identité : Milo devient la **présence** / la porte d'entrée du produit (Milo → App), sans gadget, jamais un passage obligé. **Le cerveau d'abord, la présence ensuite.** Guide l'UX des futures briques.
- 🌱 **`docs/PROFIL-VIVANT.md`** — **le design du « profil vivant »** (prolonge Constitution P25) : Milo **apprend, vérifie, corrige et évolue** avec le sportif (*« plus tu utilises Force Tracker, plus Milo te connaît vraiment »*). Les **4 modes** (Compléter · Enrichir · Mettre à jour · **Confirmer**), le **déclaré vs réalisé** (la réalité prime sur une tendance stable, jamais auto), le principe **« Milo ne pilote jamais »** (observer → expliquer → proposer → décider), la **fiabilité par champ** (décroissance + écart observé ; blessures = sensible), le **ton humble anti-surveillance** (jamais 2× « je vois que »), l'**évolution perceptible mais méritée** (jauge « Ce que Milo sait de toi »). Backbone : confiance + date de dernière confirmation. Lié à `NUTRITION-PHILOSOPHIE.md` (autres sports → TDEE, changements de vie, manuel = propose, tout explicable).
- 🧠 **`docs/MOTEUR-RAISONNEMENT-MILO.md`** — **LE CADRE du « cerveau de Milo »** (réflexion fondatrice Michel 22/07) : le pipeline **Compréhension → Diagnostic → décision → Explication** (le DIAGNOSTIC = l'étape qui manquait : même contexte, cause différente, stratégie différente) ; les **2 cerveaux** (Comprendre = Registre/ADN/Observations/état du jour/mémoire · Décider = raisonnement + Gardien + générateur) ; et surtout la **limite volontaire (Principe 18)** : **fiabilité AVANT intelligence** — profil vivant, décider avec l'info d'aujourd'hui, **ne jamais faire semblant de savoir**, **savoir s'arrêter**. Chaque brique « cerveau » (ancre/accessoire, observations, profil conversationnel…) est une **PIÈCE de ce moteur**, jamais un ajout isolé.
- 🧠🫀 **`docs/ARCHITECTURE-CERVEAU-CERVELET.md`** — **LA PIÈCE MANQUANTE DU MOTEUR : décharger Milo sans le diluer** (créé 19/08/2026, sur une idée de Michel — *« pourquoi tout part d'un seul bloc ? dans une entreprise il y a le boss et la secrétaire »*, puis nommée par lui **« le cerveau et le cervelet »**). **Milo garde le jugement** (diagnostiquer, adapter, décider, expliquer) ; **une 2ᵉ IA exécute le mécanique** (convertir, lire, calculer, composer sous contraintes) — et ⚠️ **elle N'EXISTE PAS pour l'utilisateur** : deux IA, **une seule voix** (R6, non négociable). **Le critère tient en une phrase** : *« est-ce que ça a besoin de savoir QUI est la personne ? »* — oui → Milo, non → le cervelet. **Ce qui l'a déclenché est une MESURE** : 140 règles, **46 485 caractères pour un plafond de 46 500 — 15 de marge**, et un dégraissage qui **plafonne à 3-4 %** (la méthode marche, elle ne résout pas le problème). ⚠️ **Le plafond n'est PAS financier** (le bloc commun est mis en cache 1 h) : il existe parce que la taille **DILUE les règles entre elles**. Porte la **frontière chiffrée** (≈ 8 800 car., 19 % déchargeables), le principe ⭐ **« Milo parle, le cervelet traduit »** (et pourquoi c'est probablement **plus fiable** : un convertisseur qui n'a qu'un métier se trompe moins), les **3 contraintes** à ne pas redécouvrir (le cache veut des variantes **FIXES** pas une variation continue · **l'erreur d'aiguillage est SILENCIEUSE** · un **noyau ne se conditionne JAMAIS**), le **risque propre à la nutrition** (un service séparé peut AGGRAVER le fait qu'elle ignore l'entraînement), et **§8 le prérequis** : *Milo suit-il ses 140 règles aujourd'hui ?* — `tests/milo` prouve la **PRÉSENCE**, jamais l'**OBÉISSANCE**. ⚠️ **Écrit pour être PARTAGÉ** (GPT, Gemini, une autre instance) : autonome et chiffré, avec **5 questions ouvertes** en §7 — on ne demande pas *« faut-il le faire »*, mais *« où passe la frontière »*.
- 🧭 **`docs/INDEPENDANCE-MOTEUR-MILO.md`** — **LE CAP LONG TERME : *« Claude n'est pas Milo. Claude est actuellement l'un des moteurs que Milo utilise »*** (note d'architecture de Michel, 19/09/2026). ⛔⛔ **RIEN N'EST CONSTRUIT** — c'est une **direction**, pas un chantier, et le fichier se lit en **trois colonnes qui ne se confondent jamais** : **EXISTANT** (mesuré) · **DÉCIDÉ** (une contrainte) · **DIRECTION** (le cap, sans date). ⭐ **La définition cible** : *Milo = identité + mémoire + règles + capacités + contexte + droits + outils* — le LLM est un **composant interchangeable**, jamais le sujet. ⭐⭐ **Et la chronologie est le point le plus utile** : ce n'est pas un virage, c'est l'extension d'un principe **déjà écrit le 20/07/2026** (*« cœur métier indépendant du modèle d'IA »*) — il passait sur le **cœur métier**, il passe maintenant sur **Milo lui-même**. 🫀 **Les trois organes sont RÉCONCILIÉS, pas dupliqués** : *cerveau* = le Cerveau, *cervelet* = le **Système nerveux** déjà nommé, *estomac* = la **Digestion** dont le **régime s'élargit** (historique, nutrition, santé, documents, statistiques, Internet). ⛔ **Le cerveau ne manipule pas les données brutes et ne « mange pas Internet brut »** — il reçoit un résultat, jamais un entrepôt. 🌐 **Internet doit appartenir à l'architecture**, pas être une capacité louée au fournisseur ; ⛔ *il n'est pas question de copier Internet*. 🛠️ **Et la borne non négociable des futurs outils** : *le modèle ne décide jamais seul de ses permissions — le serveur/cervelet reste l'autorité* (observer · analyser · proposer · demander confirmation · exécuter). ⚠️ **Interdit de dégrader Milo pour obtenir artificiellement l'indépendance** : toute bascule est progressive, mesurée au banc, réversible. 📏 **La seule mesure du fichier** : `worker.js` tient l'adresse du fournisseur dans **une** constante, `Code.js` l'écrit **13 fois en dur** — *la première marche n'est pas une interface abstraite, c'est **R2** appliqué à l'adresse*. Devenu **R37** dans `docs/REGLES-ARCHITECTURE.md`.
- ⚖️ **`docs/DECISIONS.md`** — **LE REGISTRE DES DÉCISIONS : qui a tranché quoi, et ce que ça a ÉCARTÉ** (créé 19/09/2026, demande de Michel : *« il faut trouver une solution pour éviter que la direction de Force Tracker et Milo ne me convienne pas »*). ⛔⛔ **LE DÉFAUT QU'IL FERME EST MESURÉ** : le journal enregistrait les décisions que Claude **n'a PAS** prises (« non tranché », « rendue à Michel » — **5 fois**) et **ZÉRO** de celles qu'il a prises. 👉 ***Une direction ne dérive pas par grandes décisions : elle dérive par petites décisions que personne n'a vues passer.*** 🧩 **UN SEUL TABLEAU, QUATRE USAGES** (les 4 protections retenues par Michel) : la colonne **Origine** (`Michel` · `Claude` · `GPT` · `contrainte technique`) nomme les choix pris **seul** avec leur **alternative écartée** · le tableau **est** le registre, ce qui rend la règle d'or **#15** vérifiable par machine · la colonne **Vision** répond obligatoirement *« est-ce que cela renforce l'esprit Force Tracker ? »* (`cohérent` · `neutre` · `cap validé` · `écart à soumettre`) et la colonne **Statut** suit le cycle de la **décision** — distinct de l'état du **code** — avec le lien obligatoire `REMPLACÉE → D-0xx` · et `python3 tools/point_de_cap.py` en donne une **lecture générée**, jamais un exercice refait à la main. ⭐ *Quatre mécanismes séparés auraient quadruplé la charge au lieu de la réduire* (**R19**) — le modèle vient de `capacites-ia.js` (ce qui DOIT être / ce qui EST). ⛔ **Il RÉFÉRENCE une source de vérité spécialisée, il ne la recopie jamais** (**R2**) — apport de GPT qui a corrigé une faute commise le jour même. 🚧 **Et la FRONTIÈRE est écrite** : *le critère est l'impact sur la DIRECTION, jamais la taille du diff* — un choix local et réversible n'y entre pas, *le mécanisme protège la direction, il ne fabrique pas de la bureaucratie*. ⚖️ La séparation qu'il rend explicite : ***Claude décide COMMENT réaliser une direction validée ; il ne décide pas seul QUELLE direction prennent Force Tracker et Milo.*** ⚠️ **« écart à soumettre » n'est PAS une faute** : c'est un signal à relire, et *un registre où tout « renforce » ne mesure plus rien*. ⛔ **Le contrôle vérifie la FORME, jamais le contenu** — *un contrôle qui jugerait si une décision est bonne déciderait à la place de Michel, exactement ce que le mécanisme existe pour empêcher*. Branché dans `check_regles.py` (refuse la livraison si une décision ne dit pas qui a tranché, ce qu'elle a écarté, ou sa réponse à la Vision). ⚠️ **Il commence le 19/09 et ne prétend pas être complet** : rapatrier les décisions anciennes de mémoire fabriquerait de fausses attributions. ⚠️ **Et la limite est dite** : il ne décide rien et n'empêche rien — *il rend visible ce qui était enterré, pour que Michel puisse objecter.*
- 🧠 **`docs/DECISIONS-MEMOIRE-LONGUE.md`** — **LES DÉCISIONS DE LA MÉMOIRE LONGUE (18/09), ET LE PIÈGE DE LEUR NUMÉROTATION** (créé 20/09/2026). ⛔⛔ **À OUVRIR AVANT D'ÉCRIRE « M<n> » OÙ QUE CE SOIT.** Plusieurs documents invoquaient **« M1→M14 »** comme un acquis : **c'est faux**, et c'est mesuré. **9 décisions sont prouvées** — 8 citées textuellement dans le tableau *« DÉCISIONS DÉSORMAIS ACTÉES »* de `tools/gen_memoire_archi_pdf.py`, avec une numérotation par position **corroborée quatre fois** (les renvois « décision 3, 4, 6, 7 » tombent sur les rangs 3, 4, 6, 7), plus une neuvième prouvée par deux renvois convergents. ⛔ **5 restent INTROUVABLES** — ni dans git, ni dans les journaux, ni dans aucun générateur — et **elles ne sont PAS reconstituées** : *reconstituer une décision de mémoire fabriquerait une fausse attribution*. ⚠️⚠️ **TROIS NUMÉROTATIONS COEXISTENT ET DEUX SONT DÉMONTRABLEMENT INCOMPATIBLES** : `capacites-ia.js` inscrit *« arbitrage Q3 (M12) »*, or **Q3 a été posée le SOIR comme question encore ouverte** — `M12` ne peut donc pas être la 12ᵉ des 14 décisions de l'après-midi. ⭐ **Les seules étiquettes `M` légitimes sont M12, M13 et M14**, là où elles sont déjà écrites ; partout ailleurs on désigne une décision par **son énoncé**, qui est vérifiable. ⚠️⚠️ **ET QUATRE « DÉCISIONS DE MICHEL » N'EN SONT PAS** : ce sont les *« comportements attendus »* des cas adversariaux, écrits par Claude — la cellule du cas 9 dit mot pour mot *« mémoire gelée, faits accumulés, delta seul au retour »*, **un seul attendu de test découpé en trois décisions par une passation**. 👉 ***Le défaut n'est pas une décision prise sans être vue : c'est une PROPOSITION devenue décision en changeant de document.*** ⛔ **Décision de Michel (20/09)** : les 5 introuvables restent **NON DÉCIDÉES** jusqu'au jour où le cas se présente ; on ne renumérote pas pour refaire une belle série — *la vérité historique vaut plus qu'une numérotation propre*.
- 🍽️ **`docs/NUTRITION-PHILOSOPHIE.md`** — **L'ESPRIT de la nutrition** (cadre à respecter AVANT de coder une brique nutrition ; croisement Gemini + Mistral + Claude + synthèse Michel, 22/07). Phrase-boussole : *« la nutrition est un moyen d'améliorer la santé/récup/perf ; elle ne doit jamais devenir une source de stress supérieure au bénéfice qu'elle apporte »* (**Constitution · Principe 21**). Les principes (levier au service de l'objectif · optionnelle jamais bloquante · fiabilité > exhaustivité · cohérence > réactivité · local d'abord + fallback fait-maison · qualité gratuite via Nutri-Score/NOVA · adapter pas imposer · mémoire · anti-TCA) · **la précision au CHOIX (4 niveaux : qualitatif → portions → macros → suivi précis)** · **le Gardien nutrition** (seuils d'alerte) · **la 1ʳᵉ brique** (journal léger « à la portion » sur Open Food Facts) · la couche future (chronobiologie/montre connectée).
- 📋 **`docs/BRIEF-NUTRITION.md`** — **LE POINT D'ENTRÉE du chantier nutrition, et il parle d'abord de la 2ᵉ IA** (créé 19/08/2026 à la demande de Michel, pour une **autre instance** qui reprend le sujet ; **réécrit le même jour** — ma 1ʳᵉ version mettait l'historique devant et l'architecture en §3, Michel : *« je voulais que tu parles de la 2ᵉ ia et ce que l'on fait actuellement »*). ⚠️ **Autonome** : lisible sans le dépôt. **Son sujet est le chantier EN COURS**, pas l'histoire de la nutrition — le détail du moteur reste dans `NUTRITION-MOTEUR.md`. Porte : **pourquoi on fait ça** (140 règles, 15 caractères de marge, un dégraissage qui plafonne à 3-4 %, et un plafond **qui n'est pas financier** — la taille DILUE) · **la 2ᵉ IA** avec ses ⛔ **3 interdits** (elle n'existe pas pour l'utilisateur · elle ne sait RIEN de la personne — vérifié par un test, l'appel ne porte que **2 clés** · elle n'a **pas de mémoire**) · les **2 critères** (*« besoin de savoir QUI ? »* + *« transformation vérifiable ou JUGEMENT ? »*, le second venu d'une relecture extérieure — sans lui, composer une assiette végane sans arachide partirait au cervelet) · ⭐ **le code passe AVANT le cervelet** (code → base → cervelet → Milo, jamais l'inverse) · **ft-v919 comme patron** (la cascade à 3 étages, et les **deux honnêtetés** : ça coûte un appel, et on ne peut pas prouver localement que la traduction est BONNE) · 🔧 **§4 la recette exacte** pour ajouter une tâche au cervelet (les **4 endroits** à tenir alignés, et le test qui épingle leur nombre) · ⭐⭐ **§5 la frontière nutrition** (*le cervelet calcule ce qu'il y a dans l'assiette, Milo décide ce que cette assiette signifie*), la **règle de sécurité** (le modèle **propose**, le code **valide**), le **droit de dire « je ne peux pas »** (l'erreur d'aiguillage est SILENCIEUSE), et ⚠️ **la dérive à interdire** — un cervelet qui finit par conseiller **aggraverait** le défaut n°1 au lieu de le résoudre · **§6 la suite avec son état honnête** (brique 0 FAITE, ne pas la refaire ; briques 1/3/4 différées **exprès** de 2 semaines pour construire sur du vrai usage ; le **benchmark** comme prérequis ; les **DEUX bases** journal/générateur) · **8 règles du projet** qui vont lui tomber dessus.
- 🥗 **`docs/NUTRITION-MOTEUR.md`** — **le COMMENT de la nutrition** (créé 18/08/2026, pendant technique de `NUTRITION-PHILOSOPHIE.md` qui dit le *pourquoi*). La **chaîne complète mesurée dans le code** (BMR → TDEE → objectif → macros → plan → portions → substitutions), les **deux plans qui coexistent** dans l'écran Nutrition (le local gratuit et celui de l'IA — la confusion a failli me faire corriger le mauvais bloc le 18/08), et les **cinq trous** par ordre d'importance. ⭐⭐ **Le plus important n'est pas la variété, c'est que le PLAN DE REPAS ignore l'entraînement** : l'app connaît `S.wkt`, `startHour`, la région travaillée, la discipline — et n'en fait **rien** côté repas (ni pré/post les jours de séance, ni glucides déplacés, ni heure réelle). ⚠️ **Formulation corrigée le 21/08** : le doc disait « la nutrition ignore COMPLÈTEMENT l'entraînement », **et cette phrase m'a fait dire une bêtise à Michel en la citant**. L'écran affichait déjà « Total = dépense + séance » — le défaut réel était le **contraire**, cette addition **comptait la séance deux fois** (le multiplicateur s'appelle « Modéré (3-4j) »), et elle **contredisait l'anneau**. Le vrai trou était ailleurs : une fréquence corrigée par la personne n'atteignait pas `S.activityLevel` (**R4**). Corrigé en **ft-v949** ; l'encadré daté est dans le doc. ⭐ **La synthèse qui décide de tout (§4.0) : DEUX BASES, pas une** — le *Journal* veut de la **couverture** (CIQUAL entier, 3 484 aliments, la personne choisit), le *générateur* veut de la **sûreté** (~300 aliments marqués `composable`, avec `regimes`/`allergenes` en **liste blanche** relue à la main, car c'est l'app qui choisit). ⚠️ Porte aussi l'**audit de la note technique v1.0** rédigée en parallèle par une autre instance sans accès au code : sa cascade de résolution et sa **provenance figée** (§8) sont adoptées — le trou est réel, `S.foodLog` ne stocke aujourd'hui **ni source ni version** — mais trois de ses affirmations sont fausses, vérifiées dans le code : Milo n'est **pas** dans la chaîne de saisie (3 actions distinctes, déjà plafonnées à 25 usages), une saisie alimentaire **n'invalide aucun cache** (`foodLog` est exclu du contexte), et le « seuil de rentabilité 1,39 » avait déjà été corrigé le 17/08 (vrai seuil 0,28 / 1,11 — le cache **rapporte** depuis le 08/08).
- 📱 **`docs/STRATEGIE-NATIF.md`** — **les principes DURABLES du passage en natif/hybride** (cadrage 22/07, croisement Gemini + Mistral + Claude + synthèse Michel). Principe directeur (Michel) : *« le natif ne doit apporter que ce que le web ne peut pas offrir »* (question de contrôle : la PWA suffit-elle déjà ?). Chemin : **coque Capacitor, zéro réécriture** (on garde Milo/EXLIB/modèle/local-first) ; RN/Flutter/Tauri/Cordova écartés ; TWA sur Android. **Approche progressive** des plugins (préparer l'archi, n'ajouter chaque plugin que sur un besoin réel — pas « tous en V1 »). Priorité : objets connectés > push > stores > (IAP en dernier). Monétisation : au lancement garder le premium **serveur** (rien vendu in-app → esquive la taxe Apple), bouton neutre « gérer sur le web » ensuite. ⚠️ **Aucune estimation de coût/délai** (décision Michel : un doc d'archi garde les principes durables).
- 🌱 **`docs/ORIGINE-DES-REGLES.md`** — **D'OÙ VIENT CHAQUE RÈGLE** (créé 27/07/2026). Les règles d'or et les principes de la Constitution étaient écrits partout, mais **leur raison d'être nulle part** — or *une règle dont on a oublié la raison finit toujours par être contournée*. Retrouvé dans les **transcriptions de conversation** (2→27 juillet, 1 292 messages de Michel), qui n'étaient dans **aucun fichier du projet**. On y apprend que la règle **#6** (backup) date du **tout premier message** (« je suis comme un bébé… avant tout test, un backup ») · la **#4** (ouverture instantanée) vient des **polices** (« supprimer toute dépendance internet au démarrage ») · la **#11** (checklist) est la mise en forme de **trois rappels séparés** du 4/07 · les principes **femmes** viennent d'un souci d'exactitude physiologique (« aucun cliché… mais le discours ne doit pas être le même », « les migraines, plus fréquentes chez les femmes ») · et l'**audit de sécurité du 10/07** existait bien. **Couvre les 26 jours** (2→27/07). ⭐ **La découverte majeure** : le 18/07, Michel avait explicitement demandé *« le suivi de chaque évolution ET SA RAISON »* (c'est la naissance de la règle #12) — 9 jours plus tard on mesurait que le *pourquoi* manquait pour **70 %** des versions. **La règle existait, elle n'a pas été tenue.** ⭐ **Le mécanisme des règles d'or**, constaté 3 fois : elles naissent le jour où le même rappel revient une fois de trop (*« mets-le dans les règles stp, pas que je te le dise à chaque fois »*, 18/07) → **quand Michel répète une consigne deux fois, ne pas la ré-appliquer : l'ÉCRIRE.** ⚠️ Les transcriptions ne sont pas garanties dans le temps.
- 🎨 **`docs/DESIGN-KIT.md`** — **le kit à coller dans un outil de maquettage** (créé 27/07/2026). **Le problème** : l'outil externe travaille **à l'aveugle** — il ne connaît ni les couleurs, ni les polices, ni les composants de Force Tracker → il **invente** une esthétique, belle chez lui et **intransposable** ici (échec du 21/07 : *« le cercle n'a rien à voir, pas de profondeur, les couleurs pas respectées »*, et du **Flutter** proposé pour une PWA). **Le fix** : un bloc prêt à coller avec les **vraies** variables (`--bg`/`--t1`/`--red`…), les polices, les composants (`.btn`, `.card`, `.modal`) et le motif d'**anneau SVG**. ⚠️ **Constat au passage** : l'app n'utilise **PAS canvas** pour l'interface — **104 `<svg>`**, et les 17 usages de canvas ne servent qu'à traiter des **images** (redimensionner, masquer le bilan, caméra). Donc **aucune limite** côté design : dégradés, ombres, profondeur, animations sont tous faisables. **Bon partage des rôles** : l'outil externe pour *explorer une direction*, Claude Code pour *la rendre réelle sur l'écran existant* (et envoyer une capture du rendu réel — zéro transposition).
- 🔬 **`docs/DOSSIER-MET-MESURES.md`** — **LE DOSSIER AUTONOME sur les calories de musculation** (créé 15/08/2026, à la demande de Michel pour son **appli MET indépendante**). Pendant *mesures* du kit de code `MOTEUR-MET-A-COLLER.md` : celui-ci dit **comment**, celui-là dit **pourquoi — et surtout ce qui ne marche pas**. Tout est chiffré sur **46 séances Garmin** (mai→août) croisées avec **31 séances de l'app**. Les points qui coûtent cher si on les ignore : ⚠️ **un MET de SÉANCE se multiplie par la durée totale, un MET d'EXERCICE par le temps actif** — les croiser donne +16 % d'erreur ; ⛔ **ne jamais caler un modèle sur les calories d'une montre** (r = 0,10-0,34 contre calorimétrie indirecte en résistance ; et mesuré ici, `r(FCmoy, kcal/min) = 0,968` — le chiffre de la montre EST une fonction du cardio) mais **son horloge est parfaite** ; ⭐ **la durée est la vraie source d'erreur, pas l'intensité** (le modèle était à 12 %, la durée à 300 %) ; les **3 causes d'une durée fausse** et le repère unique qui les trahit (min/série) ; les **4 approches de recalage mesurées** — la plus bête gagne ; les **pas de charge par matériel** tirés de 31 séances ; et **§9, ce qu'on ne sait toujours pas**, écrit pour que personne ne le redécouvre en croyant que c'est résolu. Le relevé détaillé reste dans `docs/CALORIES-SOURCES.md` (§16).
- 🔥 **`docs/MOTEUR-MET-A-COLLER.md`** — **le 3ᵉ kit pour outil extérieur** (créé 14/08/2026), après `DESIGN-KIT.md` (l'écran) et `CONTRAINTES-PDF.md` (le papier). Même problème, 3ᵉ support : Michel veut extraire le **moteur MET** en module réutilisable, dans Force Tracker **et** dans une app indépendante. Le fichier porte le **code réel** (pas une description), les contraintes (**JS vanilla, aucun framework, aucun build**) et surtout **la contrainte qui décide de tout** : `getExerciseMET()` **n'est pas autonome** — elle appelle `_mscScores()` (table de 324 exercices) et `_movPattern()`. Il ne faut ni les recopier ni les embarquer : le module doit devenir **PUR** et recevoir les muscles **en paramètre**, pour qu'il y ait *une seule logique de calcul et deux sources de données* (R1/R2). Liste aussi ce qu'il ne faut **pas** toucher — la règle « 3 muscles ou plus », les listes haltérophilie/cardio, les cas farmer's walk et charnière de hanche : chacune vient d'un bug mesuré, pas d'un choix esthétique.
- 📄 **`docs/CONTRAINTES-PDF.md`** — **le pendant papier du DESIGN-KIT** (créé 13/08/2026). Même problème, autre support : un outil extérieur (ChatGPT, Claude Design) ne sait pas avec quoi les PDF sont fabriqués, donc il propose de belles idées **intransposables**. Le fichier dit les **deux mécanismes** (feuille `window.print()` + CSS complet · jsPDF dessiné au point près), ce que chacun sait faire, la palette **mode CLAIR** en hex ET en RGB, les contraintes d'**usage** (la feuille va à la salle, on écrit au stylo, beaucoup d'imprimantes sont en noir et blanc), et surtout la liste ⛔ de **ce qui n'est pas possible**. ⚠️ **Vérifié en lisant les bibliothèques, pas de mémoire** — et deux idées reçues sont tombées : les **dégradés** et les **polices personnalisées** sont possibles en jsPDF (c'est le format `.woff2` de l'app qui bloque la 2ᵉ, pas la bibliothèque). §9 porte le bloc à coller dans **Claude Design** — ⚠️ **surtout pas celui de `DESIGN-KIT.md`**, qui impose le mode sombre en 430 px de large : sur papier, ces consignes-là sont fausses.
- 🐛 **`BUGS.md`** — **le catalogue des vrais bugs, rangé par FAMILLE et non par date** (créé 02/08/2026 à la demande de Michel). Répond à la seule question utile avant d'écrire du code : *« quels pièges ce projet a-t-il déjà rencontrés, et à quoi les reconnaît-on ? »* Le constat qui l'a motivé : sur ~730 versions, **les mêmes 5-6 bugs reviennent sans arrêt sous des déguisements différents** — le **premier match gagnant** (≥12 fois) · l'**info qui n'atteint jamais la donnée** (11 fois, R4) · les **fuseaux horaires** · le **déploiement silencieux** · les **seuils en marche d'escalier** · les **deux sources qui se contredisent** · et surtout les **erreurs de MÉTHODE** (un contrôle négatif à 0 rouge parce que le runner plantait, tester des archétypes au lieu du catalogue, croire une fausse limite). Chaque famille dit **à quoi on la reconnaît** et **ce qui la protège aujourd'hui**. Se termine par les **6 réflexes**. À compléter à chaque nouveau bug.
- 🧨 **`docs/GALERES-ET-LECONS.md`** — le **journal d'expérience** (« comment Force Tracker est devenu plus robuste ») : grosses galères résolues (son iOS, 4G, perte de données, backend qui tombe…), **décisions qu'on ne regrette pas** (§6), **fausses bonnes idées** (§7), problèmes **encore ouverts**, ce qui **manque**, et les **réflexes** pour ne pas re-tomber dedans. À consulter avant un chantier risqué, et à **compléter à chaque nouvelle galère / décision / fausse bonne idée**.
- 🧭 **`docs/BUGS-DE-PHILOSOPHIE.md`** — **NOUVEAU (23/07/2026), l'un des docs les plus précieux** : ne documente PAS des bugs de code, mais les **dérives de COMPORTEMENT de Milo** (une hypothèse présentée comme un fait, une mémoire créée d'une déduction, un interrogatoire, une sortie de rôle…) — le *raisonnement* est souvent bon, c'est la **SORTIE** qui trahit la Constitution. **Chaque bug de philosophie devient une règle de conception** (*« un bug n'est pas un échec, c'est une règle qui manquait »*, Michel). Distinction fondatrice **raisonnement vs comportement** + les cas PB-001→004. **À compléter à chaque dérive repérée** (souvent via un « piège » de testeur/Michel). Une règle mûre peut monter en Constitution.
- 🧾 **`docs/JOURNAL-DE-TEST.md`** — **la SALLE D'ATTENTE des scénarios** (créé 21/08/2026, idée de Michel : *« on remplit ce fichier, 1 semaine, 1 mois et un jour on aura plus questions »*). Le constat qui l'a motivé : **les 6 meilleurs scénarios du benchmark viennent de bugs VÉCUS en salle**, pas de cas inventés — capturer le réel bat l'invention. Avant, une question soulevée en conversation avait deux issues et une seule était bon marché : devenir un scénario **tout de suite** (il faut écrire un vérificateur, et ça coûte un appel à chaque passe) ou **disparaître avec la session** (R27). ⭐ **Une ligne suffit**, rien ne coûte tant que ce n'est pas promu, et **on y met le DOUTE** (*« je ne sais pas si Milo fait ça bien »* est l'entrée la plus utile). **5 états** (à trier · prête · promue · **juge humain** · écartée AVEC LA RAISON — R30). ⚠️ **Critère de promotion unique** : *l'attendu est-il vérifiable par du CODE ?* — le benchmark n'a aucun juge IA, donc ce qui dépend du goût (le ton, le naturel, « est-ce que Milo est agréable ? ») reste au **juge humain** et ne devient jamais un scénario. ⚠️ **Et le fichier dit lui-même ce qui tue ce genre de fichier** : un fichier qu'on ne remplit pas cesse d'être rempli.
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
- **🎂 Date de naissance** : **17 juin 2026** (première maquette Claude Design). Le suivi Git n'a démarré qu'au 30 juin 2026 — la période « Claude Design / Claude.ai » d'avant n'est pas dans le dépôt. Conçu de bout en bout avec Claude (Design → réflexion → code).

## Backend Apps Script (v3.5 @62 — actif)

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
| `Code.js` | Backend Google Apps Script v3.5 @57 (sync cloud, coach IA, premium, import programme) |
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
| `s-coach` | 🤖 Coach IA | Chat Claude Haiku via Apps Script, contexte profil injecté |
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


### 🧪 Clone de test (`/clone/`) — ⛔ RETIRÉ le 23/08/2026 (ft-v976)
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

> **Version actuelle : `ft-v1230`** (prochaine : `ft-v1231`).
> 📷 **LE SCANNER CAMÉRA N'A PAS DE BOUTON, ET C'EST UNE DÉCISION (Michel, 14/09)** : *« aucun
> bouton utilisateur tant que je n'ai pas tranché »*, le temps du banc d'essai des moteurs.
> **Le moteur reste en place et reste éprouvé** — ⛔ ne pas « réparer » cette absence : deux
> témoins la figent dans les deux sens. Verdict du banc : **`C — zxing-wasm en principal +
> Quagga2 en repli local`**, `docs/BANC-MOTEURS-CODEBARRES.md`. **Décision de Michel attendue.**
> 🧊🧊 **LE CHANTIER NUTRITION EST EN PHASE D'OBSERVATION RÉELLE — NE PAS Y TOUCHER (décision de Michel, 13/09/2026, après validation de l'étape 6).** *« Je ne veux pas lancer un nouveau chantier Nutrition pour l'instant. Ne modifie plus son comportement sans nouveau feu vert explicite. »* ⛔ **Ce qui est GELÉ, nommément** : les **21 règles** de la douane · aucune ne devient **bloquante** · aucun **seuil** · les **divergences déjà connues** (elles restent telles quelles) · `savedFoods` · l'écart **48,3 / 48** · l'historique et les migrations · **le format du carnet d'observation**. ⭐ **Ce qu'on attend** : ≥ **100 lignes** réellement observées · les **4 écrivains** vus au moins une fois (`addFoodEntry` · `quickAddFood` · `rejouerRepas` · `saveEditFood`) · idéalement **2 semaines** · et surtout une **couverture** suffisante des formes réellement rencontrées. ⚠️⚠️ **ET LA CONSIGNE QUI COMPTE LE PLUS QUAND LE RAPPORT ARRIVERA** : *« une règle qui n'a jamais mordu ne doit PAS être considérée automatiquement comme inutile — il faut vérifier que les formes capables de la déclencher ont réellement été rencontrées »*. 👉 *Sans cette vérification, « jamais mordu » se lit « à supprimer », et on retirerait un garde-fou parce que le cas ne s'est pas encore présenté.* Le rapport se lit dans **Profil → Admin → « 📊 Douane — observation du journal »**.
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

**ft-v1230 — 📏 LES MENSURATIONS S'ENREGISTRENT · LE `persist()` MANQUANT SUR LA SORTIE « PAS DE POIDS »** — cas réel rapporté par Michel, Progrès → Corps & santé, carte « Masse grasse du jour » : poids 85,9 · objectif 85 · cou **40,7** · taille **92,4** · hanches **vide** · % auto ~19,6 — *« il renseigne ses mensurations et il ne peut pas les enregistrer »*. Ses bornes : ⛔ ***« ne profite PAS de cette session pour refaire l'écran, changer l'algorithme de masse grasse, le design, la nutrition, les quotas IA, Milo, ni rouvrir une décision actée »*** · ⛔ ***« petit bug → correction ciblée, R19 »*** · ⭐ ***« reproduire AVANT de corriger »***.

**⛔⛔ REPRODUIT AVANT D'ÊTRE CORRIGÉ — ET LES CINQ CAS NOMINAUX PASSAIENT TOUS.** C'est ce qui a obligé à chercher ce qui DIFFÈRE chez lui plutôt qu'à corriger au jugé. Mesuré en conduisant l'app servie, horloge gelée :

| état de départ | message | mémoire | ⭐ **disque** |
|---|---|---|---|
| poids du jour connu | « Masse grasse enregistrée ✅ » | 2 mesures | ✅ **2 mesures** |
| ⛔ **aucun poids connu** | « Enregistre d'abord ton poids » | 2 mesures | ⛔ **RIEN** |
| ⛔ **pesée sans kilo** (un bilan corporel qui n'a écrit qu'un %) | idem | 2 mesures | ⛔ **RIEN** |
| ⛔ **pesée à `kg:0`** | idem | 2 mesures | ⛔ **RIEN** |

👉 ***Trois états d'entrée, une seule racine*** — et la forme du défaut est la pire qui soit : la valeur existe en mémoire, l'écran ne dit rien d'elle, et le rechargement suivant l'efface.

**⭐⭐ LA CAUSE EST UN `persist()` MANQUANT SUR **UN SEUL** CHEMIN DE SORTIE, ET ft-v1129 AVAIT DÉJÀ CORRIGÉ SON JUMEAU.** Cette version-là avait inversé l'ORDRE pour le `return` du **%** (*« ce que la personne a tapé ne se perd pas parce qu'un CALCUL n'a pas abouti »*) — et son commentaire le dit encore, fièrement, deux lignes au-dessus du second `return` resté intact, celui du **poids**. 👉 ***Un correctif d'ORDRE doit être posé sur TOUS les chemins de sortie, pas seulement sur celui qui a servi à le trouver*** (**R15** : tout chemin de fermeture pose son marqueur, 3ᵉ fois dans ce projet).

**⛔ SECOND DÉFAUT, DANS LES MÊMES TROIS LIGNES, ET C'EST LUI QUE MICHEL VOYAIT.** `last ? last.kg : (S.bw||0)` n'atteignait le repli sur le poids du profil que s'il n'existait **AUCUNE** pesée. Or une pesée peut parfaitement ne porter aucun kilo utilisable — un **bilan corporel** qui n'a écrit qu'un %, une ligne importée, un `kg` à 0. ***On disait « Enregistre d'abord ton poids du jour » à quelqu'un dont l'écran affiche 85,9 kg deux centimètres plus haut.*** On cherche désormais le premier poids **réellement utilisable**, du plus récent au plus ancien, `S.bw` restant le dernier recours — et lu avec `numFR`, parce qu'une valeur importée peut être la chaîne « 85,9 ».

**⭐ TROISIÈME, TROUVÉ EN MESURANT LE SÉPARATEUR DÉCIMAL AU LIEU DE LE SUPPOSER** (c'est la consigne de Michel, mot pour mot). `_bfNavy` lisait ses nombres avec `parseFloat`, et `_recalcNavyBf` lui passe la valeur **brute** des champs : `parseFloat('40,7')` rend **40**. Taper une virgule — *ce que fait un clavier français* — calculait donc le % sur des centimètres **tronqués** : **20,1 % au lieu de 19,9**, et c'est ce chiffre faux qui était **ENREGISTRÉ**. ⛔ **Le calcul ne bouge pas d'une virgule** : seule la LECTURE change, et elle change **chez le propriétaire unique** (**R2**) — corriger le seul appelant fautif aurait laissé le piège armé pour le suivant. Deux témoins épinglent les quatre constantes de la formule US Navy.

**⭐ LES 6 AUTRES MENSURATIONS N'ONT PAS EU DE CORRECTIF À ELLES** — mesuré : elles passent par la même racine (`_mensEnregistrerSaisie` → `mensAjouter`). *Six correctifs séparés auraient traité six symptômes d'une seule cause.* Un témoin le figent, poids connu **et** poids inconnu.

**📣 RÈGLE D'OR #11 — RIEN, et c'est pesé.** Aucun écran n'apparaît, aucun bouton ne bouge, aucun réglage n'est ajouté, aucune donnée n'est perdue : une gêne disparaît. ⚖️ **Pop-up : non** — rien n'est à *faire*, et le changement ne peut que soulager. ⚠️ **Dit franchement parce que c'est un jugement** : quelqu'un qui a perdu des mesures ne saura pas qu'il peut les retaper. Si Michel veut une ligne dans le Guide, c'est une ligne à ajouter — je ne la pose pas de moi-même sur une correction.

**⏭️ CE QUE ÇA NE FAIT PAS**, nommément : ⛔ **l'écran n'est pas refait**, aucun redesign, aucune fonctionnalité · ⛔ **la formule de masse grasse est intacte**, homme et femme, figée par deux témoins · ⛔ **`mensAjouter` reste le seul écrivain** d'une mensuration (R2) · ⛔ **un champ VIDE ne vaut toujours pas « efface »** · ⛔ **le ✓ garde son rôle décidé** — y appuyer EST l'acte de déclarer ses mensurations, donc il re-date les champs pré-remplis ; c'est écrit et assumé depuis ft-v1129, et ce n'était pas à moi de le rouvrir (**R30**, règle d'or 15) · ⛔ **aucune migration** : un % enregistré à la virgule avant aujourd'hui reste tel quel — *on ne peut pas savoir lequel a été tapé avec une virgule, donc on n'invente pas* · ⛔ Nutrition, douane, `foodLog`, Accueil, Séance, Milo, quotas IA, V2, le miroir : **0 ligne** · ⛔ ni `app.js`, ni `state.js`, ni `screens.js`, ni `coach.js`, ni `setup.js`, ni `log.js`, ni `constants.js`, ni `index.html`, ni `Code.js`, ni `worker.js`, ni `supabase.js`.

**⚠️⚠️ ET DEUX DE MES PROPRES INSTRUMENTS ONT ROUGI SUR DU CODE PARFAITEMENT SAIN.** ① Mon témoin central coupait sur `\breturn\b` pour compter les chemins de sortie — il comptait donc aussi les `return` des **fonctions fléchées** que mon correctif venait d'ajouter : **4 « sorties » au lieu de 2**. *Un motif qui cherche un mot-clé ne distingue pas la SORTIE d'une fonction du RETOUR d'une lambda* ; seul un `return;` **nu** quitte une fonction sans valeur. ② Ma fixture appelait `localStorage.clear()` dans un `addInitScript` — **qui rejoue à CHAQUE navigation, rechargement compris**. Le témoin du rechargement effaçait donc lui-même ce qu'il venait mesurer. 👉 ***Une fixture qui se rejoue pendant la mesure mesure la fixture, pas le produit*** (même famille que le témoin de ft-v1225 qui relisait sa propre fixture).

**⭐⭐ ET LE CONTRÔLE NÉGATIF A TROUVÉ UN TROU DANS MES TÉMOINS — c'est exactement ce à quoi il sert.** La mutation `M04` remplace le lecteur de poids par `x => (x&&x.kg)||0` et restait **VERTE** : ni `{bf:19.9}` ni `{kg:0}` ne la distinguent. Or une valeur **non numérique** est *truthy* — la pesée du jour aurait été créée avec `kg:'abc'`, un poids qui n'en est pas un, et qui serait parti dans les courbes et au cloud. **Le trou est devenu le témoin ⑧bis.** ⚠️ Et une de mes mutations visait à côté : `M02` retirait un message du cas où il n'y a **rien** à garder, donc elle ne cassait aucune garantie — *une mutation doit défaire ce que les témoins PROMETTENT, pas ce qui se trouve à côté*. Re-visée, elle mord.

**📉 ET LE MÊME BLOC A LIVRÉ UN SECOND RETOUR, CELUI DE CHRISTOPHE — « MA MASSE GRASSE REVIENT À 20,7 LE LENDEMAIN ».** *« Quand je saisis la masse grasse du jour, je n'ai pas la valeur précédente. J'ai systématiquement 20.7. Après avoir saisi ma valeur et fermé l'application, quand je reviens elle semble bien présente. Mais le lendemain elle revient à 20.7. »* Michel : ⛔ ***« ne suppose pas que la cause est identique : le vérifier »***.

**⭐⭐ VÉRIFIÉ — CE N'EST PAS LA MÊME CAUSE.** Conduit sur **deux jours**, horloge gelée :

| | jour J | jour J **+1** |
|---|---|---|
| à l'ouverture | Estimée ~21,8 % (calcul) | ⛔ **21,8 %** |
| il saisit sa valeur de balance | **19,1** → « ✓ Enregistrée » | — |
| après rechargement | ✅ **19,1 revient** | — |
| **sa dernière valeur enregistrée** | 19,1 | **19,1** — et elle n'apparaît **nulle part** |

**⛔⛔ ET LA PRÉMISSE DU BRIEF EST PARTIELLEMENT FAUSSE — je le dis plutôt que de coder dessus (R38).** 20,7 n'est **ni** une constante en dur, **ni** une valeur par défaut, **ni** un décalage d'index, **ni** un mauvais tri : c'est le **calcul US Navy** des mensurations stockées, qui ne bouge pas tant qu'elles ne bougent pas. 👉 ***Elle ressemble à une vieille valeur figée parce qu'elle en est la SOURCE, pas parce qu'on la relit.***

**⭐ LA CAUSE À EFFET PRESSENTIE PAR MICHEL EST RÉELLE — POUR LUI.** Ses mensurations de ce matin n'étaient pas enregistrées (le défaut ci-dessus), donc le calcul restait calé sur les **anciennes** : 20,7 survivait à une nouvelle mesure. ⛔ **Mais ça n'explique pas Christophe**, qui saisit une valeur de **balance** : chez lui les mensurations ne changent pas, donc le calcul est simplement **constant**. *Deux symptômes identiques, deux causes différentes — et seule la mesure permet de le voir.*

**⭐⭐ CE QUI MANQUAIT N'ÉTAIT DONC PAS LE BON CHIFFRE.** L'écran ne montrait **nulle part** la dernière mesure réelle, ni d'où venait celui qu'il proposait. ⚠️ **Et l'incohérence était sous le nez** : les trois champs voisins (cou, taille, hanches) affichent, eux, la **dernière valeur connue** — *quatre champs de la même carte, deux règles différentes, et rien ne le disait.* `bfDerniere()` devient le **propriétaire unique** de « quelle est sa dernière mesure » (**R2**) : il **TRIE par date** au lieu de se fier à l'ordre du tableau (*un `[0]` qui suppose un tri est un bug qui n'apparaît que chez les autres — après une restauration, un import, une fusion*) et rend **`null`, jamais 0** (**R29**). Le sous-titre dit désormais : *« Estimée ~21,8 % **d'après tes mesures** · **dernière notée : 19,1 % le 20/09** »*.

**⛔⛔ ET LE CHIFFRE PRÉREMPLI NE CHANGE PAS — c'est une décision rendue à Michel (`D-013`, À TRANCHER).** Les deux options ont un piège **mesuré** : ① proposer la valeur d'hier et laisser appuyer sur ✓ **daterait d'aujourd'hui une mesure d'hier** — *exactement ce que le brief interdit dans sa propre liste « dans tous les cas »* ; ② partir vide **casserait le parcours US Navy**, où l'on tape ses centimètres et où le % apparaît prêt à valider. 👉 *Trancher, c'est choisir qui de l'utilisateur-balance ou de l'utilisateur-mètre-ruban est le cas normal — et ça, le code ne peut pas le dire.* ⭐ Un témoin **fige le préremplissage actuel**, pour qu'on ne prenne pas cette décision « en passant » à la prochaine version.

⚠️ **Un défaut mesuré et NON corrigé, dit plutôt que masqué** : une valeur manuelle **est** remplacée par le calcul si l'on corrige ensuite une mensuration. ⛔ Ce n'est pas un écrasement « par un défaut » — le champ change **visiblement** avant qu'on valide, et c'est l'utilisateur qui a déclenché le recalcul. Noté, pas corrigé.

Tests : **blocs B-CCCXXXVIII (17 témoins de source) et B-CCCXXXIX (23 conduits dans le navigateur)**, dans `tests/parcours/mensurations.js` — le cas exact de Michel, les trois états de poids qui bloquaient, le point **et** la virgule comparés l'un à l'autre, un champ vidé qui ne détruit rien, deux jours qui coexistent, et **le rechargement complet**. ⛔ **CONTRÔLE NÉGATIF : 24 mutations sur un arbre CLONÉ, 24 conformes**, contrôle sain **40 OK / 0 rouge avant ET après**, dont **deux qui doivent RESTER VERTES** (les mots cherchés cités dans un commentaire — indispensable ici, les commentaires du correctif citent `persist`, `numFR` et `S.bw` en toutes lettres). ⭐ **Passe complète : 4546 ✅ / 0 ❌** sur l'arbre **fusionné** `5fdd7541`, **les 4 conditions vertes** — y compris la ④, pour la première fois de la journée.

**⛔⛔ ET LA PUBLICATION A COÛTÉ TROIS COLLISIONS DE NUMÉRO D'AFFILÉE — LA VERSION EST `ft-v1230`, PAS `ft-v1228`, ET CE N'EST PAS UN CAPRICE.** Pendant que je mesurais, **session-B a publié `ft-v1228`** (l'identité S1 du banc), puis **`ft-v1229`** (le message « réseau indisponible ») — **et les deux sont réellement SERVIS** : leurs déploiements Pages sont verts, exécutions n° 1280 et n° 1282, vérifiées par l'API GitHub. 👉 ***Republier un contenu DIFFÉRENT sous un numéro de cache DÉJÀ SERVI est précisément ce que la règle d'or #5 existe pour empêcher*** — les service workers qui portent déjà `ft-v1228` n'auraient vu **aucun changement de clé**, donc **aucune mise à jour**, et le correctif ne serait jamais arrivé sur les téléphones qui avaient ouvert l'app entre-temps. ⚖️ **Dit franchement parce que Michel attendait `ft-v1228`** : le numéro a changé, le contenu livré est exactement celui qu'il a validé.

**⛔ LA RÉCONCILIATION EST UNE VRAIE FUSION, PAS UN ÉCRASEMENT.** `master` n'était plus un ancêtre (**16 en avance / 5 en retard**) : le « fast-forward possible » annoncé la veille était **périmé**, exactement comme Michel l'avait anticipé. Les **cinq** commits de session-B sont **conservés intégralement** (`app.js`, `index.html`, `tests/milo/eval.js`, le workflow du banc, ses deux générateurs) ; les cinq conflits sont résolus **par union**, et la renumérotation est **bornée à mon seul bloc** — ⛔ *aucun remplacement global, puisqu'au moment même où l'on renumérote pour une collision l'identifiant n'est par définition plus unique*. ⚠️⚠️ **Et l'arbre AYANT RÉELLEMENT CHANGÉ, l'ancienne passe `4546 ✅` est déclarée PÉRIMÉE et n'est citée nulle part comme preuve de cet arbre-ci** : tout a été **relancé sur l'arbre fusionné** — témoins, banc ciblé, contrôle négatif, passe complète.

⚠️ **Historique des collisions, parce qu'il dit quelque chose du protocole** : la condition ④ est tombée **trois fois** pendant les mesures initiales (2 passes refaites en entier, la 1ʳᵉ portant déjà une collision sur `ft-v1227`), puis **une quatrième fois à la publication**. 👉 ***Le journal de partage évite le doublon de TRAVAIL ; il n'évite pas la collision de NUMÉRO, parce qu'un numéro ne se pose qu'au push*** — et c'est git, pas le fichier, qui a tenu le verrou à chaque fois. ⚠️⚠️ **ET IL FAUT DIRE LE COÛT RÉEL, PARCE QU'IL EST STRUCTUREL** : une passe complète dure **~25 minutes**, or session-B a publié **cinq fois** pendant cette journée — donc **cinq fois** la condition ④ est tombée, et **cinq fois** il a fallu refusionner, renuméroter et relancer. 👉 ***Tant que le rythme de publication de l'autre session est plus court que la durée d'une passe, la règle « la session qui publie en DERNIER relance » ne converge pas d'elle-même.*** ⛔ **Ce n'est PAS une raison de contourner la condition ④** — elle a raison à chaque fois, l'arbre change vraiment. C'est un fait mesuré rendu à Michel : si les deux sessions doivent continuer en parallèle, il manque un signal « je publie, tenez 30 minutes », et `docs/JOURNAL-DE-PARTAGE.md` n'en a pas (il dit qui TRAVAILLE sur quoi, pas qui est en train de PUBLIER).

Fichiers : `tracking.js`, `tests/parcours/mensurations.js` (nouveau), `tests/parcours/runner.js`, `tools/banc_mensurations.js`, `tools/mut_mensurations.py` et `tools/gen_mensurations_pdf.py` (nouveaux), `docs/DECISIONS.md` (**D-013**), `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. ⛔ **Un seul fichier servi : `tracking.js`.** sw.js ft-v1230. |
**ft-v1229 — 🩹 « RÉSEAU INDISPONIBLE » NE DISAIT RIEN · ET C'EST LE MÊME DÉFAUT QUE J'AVAIS CORRIGÉ LE MATIN MÊME** — Michel : *« je ne peux pas créer le jeton, il me marque réseau indisponible »*.

**⭐ MESURÉ AVANT DE TOUCHER QUOI QUE CE SOIT : la fonction est SAINE.** Conduite dans un navigateur avec un **faux serveur** — charge utile correcte (`issueTokenByCode` · `appareil:'banc-milo'`), rendu correct, **zéro erreur de page**. L'échec était donc réellement dans le réseau ou la réponse… *et mon message était incapable de dire lequel*.

**⛔⛔ LE DÉFAUT ÉTAIT DANS MON `catch`, ET C'EST LA MÊME FAUTE QUE LE MATIN.** Un **seul** `try` entourait **trois** choses : l'**envoi**, la **lecture** de la réponse, et l'**analyse du JSON**. Les trois rendaient la même phrase. 👉 ***C'est mot pour mot le défaut corrigé quelques heures plus tôt dans `tests/_playwright.js`*** — où un `catch` écrasait « paquet non installé » par « chemin de conteneur absent ». **J'ai refait la faute dans la même journée, dans l'autre sens.** *Un `catch` qui avale le diagnostic fait chercher au mauvais endroit.*

| l'étape qui échoue | avant | après |
|---|---|---|
| l'envoi ne part pas | ⛔ « Réseau indisponible » | ✅ **« L'envoi n'est pas parti (1/3) »** + le message du navigateur |
| la réponse est illisible | ⛔ la même phrase | ✅ **« Réponse illisible (2/3) »** + le **code HTTP** |
| le serveur répond, mais pas en JSON | ⛔ la même phrase | ✅ **« pas en JSON (3/3) »** + HTTP + **le début de la réponse** |
| le compte n'a pas de code perso | déjà distinct | inchangé |

**⭐ LE CAS LE PLUS INSTRUCTIF EST LE TROISIÈME** : une **page d'erreur Apps Script** ressemblait jusqu'ici à une panne de réseau. Sans l'extrait, on cherchait un problème de connexion là où le serveur avait parfaitement répondu — *autre chose que ce qu'on attendait, mais répondu*.

**⛔ ET LE TEXTE DU SERVEUR EST ÉCHAPPÉ AVANT D'ÊTRE AFFICHÉ.** Une page d'erreur contient du **HTML** : l'insérer brut dans la page l'**exécuterait**. ⛔ Et rien de sensible ne sort — **jamais le jeton, jamais le code perso**.

**📣 RÈGLE D'OR #11 — RIEN.** L'outil est dans **Profil → Admin**, réservé. Aucun écran public ne change.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **`worker.js` : 0 ligne** · ⛔ **`Code.js` : 0 ligne** · ⛔ aucune route, aucun quota, aucun garde-fou du banc touché · ⛔ ni `state.js`, ni `screens.js`, ni `log.js`, ni `coach.js`, ni `setup.js`, ni `tracking.js`, ni `constants.js`, ni `index.html` · ⛔ **la cause réelle chez Michel n'est PAS encore connue** — c'est justement pour ça que le message la dira.

Tests : éprouvé sur les **quatre chemins** dans un navigateur réel — envoi qui échoue · réponse **non-JSON** · refus `no_code` · **succès**. Chacun rend un message **différent**, et l'échappement est vérifié (le HTML s'affiche au lieu de s'exécuter).

Fichiers : `app.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1229. |

**ft-v1228 — 🔑 UNE IDENTITÉ S1 DÉDIÉE AU BANC D'ESSAI · *le banc reçoit un badge, aucune porte n'est ouverte dans le bâtiment*** — décision de Michel : ⭐ ***« créer une identité / un jeton S1 dédié au banc d'essai GitHub, révocable, stocké dans GitHub Secrets, sans créer de porte spéciale permettant de contourner la sécurité S1 des vrais utilisateurs »*** · ⛔⛔ ***« je ne veux PAS d'un mode benchmark qui bypass l'authentification normale du Worker »***.

**⛔⛔ LE DÉFAUT FERMÉ EST MESURÉ.** Le workflow du banc recevait **HTTP 401** et ne mesurait **rien** : un runner GitHub ouvre un navigateur **neuf**, donc sans jeton — *« Origin correct + aucun token → refus »* (ft-v1216), **une protection voulue**. 👉 ***Le banc n'avait donc jamais pu appeler Milo depuis S1***, et personne ne l'avait vu parce qu'**aucune passe réelle n'avait jamais tourné** (le rapport était « blanc » depuis toujours).

**⭐⭐ RIEN DE NEUF N'A ÉTÉ CONSTRUIT CÔTÉ AUTHENTIFICATION, ET C'EST LE POINT.** Mesuré avant d'écrire une ligne : S1 savait **déjà** tout faire.

| ce qu'il fallait | ce qui existait déjà |
|---|---|
| une identité **étiquetée** | `_jetonPoser_(email, **libelle**)` — l'étiquette était prévue |
| un refus sûr | `_jetonIdentite_` **fail-closed** (absent · inconnu · illisible · révoqué) |
| une **révocation** | `_jetonRevoquer_` **marque** au lieu de supprimer — *un jeton révoqué doit rester distinguable d'un jeton inconnu* |
| une **route** pour en créer un | **`issueTokenByCode`**, celle que le téléphone de chacun utilise déjà |

⛔ **Aucune route neuve, aucun `if benchmark then allow`, aucune ligne touchée dans `worker.js`.** L'outil Admin appelle la route **existante** avec l'étiquette `banc-milo`. Le jeton produit est un jeton S1 **ordinaire** : le Worker le vérifie comme les autres, il se révoque comme les autres.

**⛔ IL N'EST AFFICHÉ QU'UNE FOIS, ET RANGÉ NULLE PART.** Le serveur ne garde qu'une **empreinte** (`sha256`) : le jeton brut n'existe qu'à l'instant où il est rendu. On ne le stocke donc ni dans `localStorage`, ni dans l'état, ni dans un journal. *Un secret gardé « pour le retrouver plus tard » est un secret de plus à protéger.* Perdu → on en refait un et on révoque l'ancien.

**⭐ LE BANC EMPRUNTE LE CHEMIN DU VRAI CLIENT**, ce qui est précisément ce qui rend la mesure honnête : le jeton est posé dans la **même clé** de `localStorage`, **lue à la source** dans `constants.js`. ⛔ **R2** — *la recopier la ferait diverger en silence le jour d'un renommage : le banc poserait son jeton dans une clé que plus personne ne lit, et repartirait en 401 sans qu'on comprenne pourquoi.*

**⛔⛔ ON REFUSE AVANT DE DÉPENSER, PAS APRÈS.** Sans secret, le workflow échoue **avant le checkout** ; `eval.js` refuse `--go` sans jeton, et refuse aussi un jeton **mal recopié** — ⚠️ en disant la **forme** (« 3 caractères, 64 attendus »), **jamais la valeur**. *Un secret tronqué au copier-coller est l'erreur la plus banale, et sans ce mot elle ressemble à un refus d'identité.*

**⚖️ ET LE QUOTA A DÉCIDÉ DE L'ARCHITECTURE — dit franchement parce que c'est un arbitrage.** Le quota est **par e-mail** : 50/jour, **150** pour un compte dev (`michdu75@gmail.com` seul). Or une passe fait **57 appels** : ***un e-mail neuf serait bloqué à 50***. Le jeton est donc **dédié et révocable seul**, mais il **résout vers le compte de Michel**. ⛔ Un compte séparé exigerait de le créer, lui poser un code perso et l'ajouter à `AI_EMAILS_DEV_` — **chemin d'évolution écrit, non pris ici** (R19, et §4 du brief : *Michel ne doit pas devenir administrateur sécurité*).

**📣 RÈGLE D'OR #11 — RIEN POUR L'UTILISATEUR.** Un outil apparaît dans **Profil → Admin**, réservé (`_isAdminUnlocked()`, qui garde déjà 16 outils — R13). Aucun écran public ne change, aucun quota ne bouge, aucun comportement de Milo n'est touché. ⚖️ **Pop-up : non.**

**⏭️ CE QUE ÇA NE FAIT PAS**, nommément : ⛔ **`worker.js` : 0 ligne** · ⛔ **`Code.js` : 0 ligne** (tout existait) · ⛔ ni `coachMemory`, ni la fréquence du résumé, ni l'ADN, ni le prompt, ni le contexte, ni le cervelet, ni le multi-moteurs, ni la Nutrition, ni le QR, ni la voix · ⛔ ni `state.js`, ni `screens.js`, ni `log.js`, ni `coach.js`, ni `setup.js`, ni `tracking.js`, ni `constants.js`, ni `supabase.js` · ⛔ **la passe complète n'est PAS lancée** : le déclenchement manuel reste à Michel.

**⚠️⚠️ ET DEUX DE MES PROPRES GARDES MESURAIENT UN MOT AU LIEU DU MÉCANISME — le piège n°1 de `BUGS.md`, deux fois dans le même outil.** ① J'interdisais le mot **« benchmark »** dans `worker.js` : il a rougi sur l'arbre **sain**, car `MODELES_BENCHMARK` y existe depuis longtemps et ne parle **pas d'identité** — c'est une liste blanche de **modèles**. *L'invariant juste n'est pas « le mot n'apparaît pas », c'est **« l'identité ne peut venir que de `_identiteIA` »*** — mesuré : une seule affectation de `_moi` dans tout le fichier. ② Mon garde « aucun jeton en dur » cherchait **64 caractères hexadécimaux** : `'a'.repeat(64)` passait tranquillement. *Un garde qui décrit à quoi **ressemble** un secret ne dit rien de sa **provenance*** — on exige désormais la **source** (`process.env`). ⭐ **Et c'est mon propre contrôle de départ qui a attrapé le premier** : il refuse de mesurer sur un arbre déjà rouge, *parce qu'un contrôle négatif dont le point de départ est faux ne prouve rien* (leçon payée le matin même).

Tests : **contrôle négatif `tools/mut_identite_banc.py`, 14 mutations sur arbre CLONÉ, 14 conformes** — les trois familles qui comptent : **ouvrir une porte** (mode benchmark dans le Worker, refus désactivé, jeton en dur), **faire fuir le secret** (l'afficher dans le journal, recopier la clé), **retirer un garde-fou** (secret non vérifié, refus avant dépense supprimé, `LANCER`, « au moins une réponse », étiquette, révocation). ⭐ Dont **deux qui doivent RESTER VERTES** : des commentaires citant « benchmark », « banc » et le nom du secret — *la seule façon de prouver qu'on mesure le code et non la phrase qui l'explique* (**R30**).

Fichiers : `index.html`, `app.js`, `tests/milo/eval.js`, `.github/workflows/banc-milo.yml`, `tools/mut_identite_banc.py` *(nouveau)*, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. ⛔ **Ni `worker.js`, ni `Code.js`, ni aucun autre fichier servi.** sw.js ft-v1228. |

**ft-v1227 — 🧾 LA PROVENANCE DE `S.coachMemory` · ET LA BORNE QUI COMPTE EST *PROVENANCE ≠ VALIDATION*** — arbitrage de Michel, **option B** : ⭐ ***« conserver `S.coachMemory`, mais lui ajouter une provenance et une structure minimale »***. Ses deux bornes, citées mot pour mot : ⛔ ***« ne jamais inventer une provenance que nous ne connaissons pas »*** · ⛔⛔ ***« ne donne surtout pas à `coachMemory` le statut `validated` simplement parce qu'elle existe »***.

**⛔⛔ LA DÉCISION DE CONCEPTION EST QUE `coachMemory` RESTE UNE CHAÎNE — mesuré AVANT d'écrire une ligne.** Elle traverse **19 lignes de code** — ⚠️ **32 occurrences**, *un `grep` ne rend donc pas le même nombre* — dont **deux contrats qui n'appartiennent pas au client** : `worker.js` la lit en `body.coachMemory || ''` et la **concatène dans le prompt de Milo**, et `Code.js` la passe au nettoyeur de **chaîne** d'Apps Script. 👉 ***En faire un objet aurait injecté « [object Object] » dans le prompt de Milo*** — c'est-à-dire exactement le recul que l'arbitrage interdit. La provenance vit donc **À CÔTÉ**, dans `coachMemoryMeta`. ⭐ **Ce n'est pas une duplication (R2)** : `coachMemory` porte **le texte**, `coachMemoryMeta` porte **d'où il vient** — deux informations, deux propriétaires.

**⭐⭐ ET LA BORNE DE MICHEL N'EST PAS UNE PRÉCAUTION DE VOCABULAIRE, ELLE DÉCIDE DU SCHÉMA.** `registre.observations` porte `validated` **parce que quelqu'un a répondu OUI**. Un résumé produit par une IA n'a rien à voir. D'où **deux valeurs seulement**, et aucune qui prétende à l'accord de qui que ce soit :

| statut | ce qu'il dit | moteur · date · source |
|---|---|---|
| `generated` | produite par le format actuel | **on sait par quoi, et quand** |
| `legacy` | elle existait avant le 20/09 | ⛔ **`null`** — *on ne sait pas, et on l'écrit* |

👉 ***Une fausse précision est pire qu'un trou déclaré*** (**règle d'or #16**) : pour une mémoire ancienne, on n'écrit pas un moteur « plausible », on écrit `null`.

**⭐ LE MOTEUR EST MESURÉ, PAS DEVINÉ — et c'est une correction côté SERVEUR.** Le client ne peut pas savoir quel modèle a résumé sa conversation. `worker.js` **renvoie désormais `_model`** (même patron que `coach()`, qui le faisait déjà) **et `Code.js` fait pareil sur son chemin de repli** — ⛔ *sinon la provenance dépendrait de la route empruntée*, ce qui est exactement le genre d'écart qui ne se voit jamais. Si le serveur se tait, le client écrit **`null`**.

**⛔⛔ LA MIGRATION EST UNE RÈGLE REJOUÉE, JAMAIS UN DRAPEAU.** `_coachMemProvenance()` (`state.js`) est le **propriétaire unique** de *« cette mémoire a-t-elle une provenance ? »*, **idempotente par construction**, rejouée au **chargement** *et* **après chaque restauration cloud**. 👉 ***Une restauration remplace l'état APRÈS le chargement et peut ramener un profil d'avant des mois plus tard*** — c'est mot pour mot le piège de `ft4_stmig1` (ft-v1213) et celui des trois pots (ft-v1225). *Un drapeau « migration faite » serait faux exactement le jour où ça arrive.*

**⭐⭐ ET LE DÉFAUT TROUVÉ EN ÉCRIVANT EST LE PLUS INSTRUCTIF : la provenance ne doit JAMAIS survivre au texte.** Première version : la restauration reprenait le texte du nuage et **gardait la fiche locale**. Or un profil d'avant le 20/09 n'apporte **pas** de provenance — l'ancienne fiche, qui décrivait un texte **qui n'existe plus**, serait restée collée au nouveau. 👉 ***On aurait fabriqué une fausse provenance avec le mécanisme construit pour l'empêcher.*** Règle posée : **texte différent → on jette la fiche**, puis celle du nuage la remplace si elle existe, sinon la règle reclasse en `legacy`.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran n'apparaît, aucun bouton ne bouge, aucun réglage n'est ajouté, aucun quota ne change : un champ technique s'ajoute à côté d'un autre. ⚖️ **Pop-up : non** — rien n'est à *faire*, et rien de ce qui est visible ne bouge.

**⏭️ CE QUE ÇA NE FAIT PAS**, nommément : ⛔⛔ **aucune conversation n'est enregistrée** · ⛔ **la fréquence du résumé n'est PAS touchée** — mesuré pourtant, et le fait est rendu à l'arbitrage de Michel : `worker.js` compte **toute** action, résumé inclus, donc ***une conversation consomme DEUX unités de quota par message au-delà du 4ᵉ échange — les 50 appels quotidiens ne valent qu'environ 26 messages, pas 50*** ; ⛔ on ne change rien, consigne explicite (*« ne change pas la fréquence uniquement pour économiser de l'argent, le but principal reste la continuité de Milo »*) · ⛔ **le résumé de résumé n'est pas corrigé** — mesuré à **17 itérations** sur une conversation de 20 messages, fenêtre de 16 messages, sortie plafonnée à 250 jetons, et ⚠️ **la dérive est invisible** (aucun témoin ne compare la mémoire à ce qui a été dit) · ⛔ **aucun tombstone, aucune révision causale** : deux téléphones, le dernier qui sauvegarde gagne — *exactement comme avant, et la fiche ne prétend pas le résoudre* · ⛔ ni `app.js`, ni `screens.js`, ni `log.js`, ni `tracking.js`, ni `constants.js`, ni `supabase.js`, ni `index.html`.

**⚠️ UNE CORRECTION À UN RAPPORT DE LA VEILLE.** L'étude du 20/09 au matin disait que `coachMemory` *« double le nombre d'appels IA »*. **Vrai pour les APPELS** (2 au lieu de 1 dès le 4ᵉ échange) ; ⛔ **faux pour le COÛT** — le résumé pèse **0,0033 $** contre **0,0189 $** pour un message de Milo, soit **15 % du prix**. *Haiku est bon marché et le contexte de Milo est énorme : c'est lui qui coûte.* 👉 ***Le quota, lui, compte les appels et pas le prix*** — et c'est là que ça double vraiment.

**⚠️⚠️ ET LE CONTRÔLE NÉGATIF A TROUVÉ UN TÉMOIN AVEUGLE — le mien, et d'une famille que ce dépôt connaît.** La mutation `M19` fait **tomber le chargement** sur une provenance illisible : le témoin `B-CCCXLI ⑩` restait **parfaitement vert**. Cause : la fixture appelait `load()` sans vider la mémoire vive, et `S.coachMemoryMeta` portait encore le `legacy` posé par l'étape **précédente**. 👉 ***Un témoin qui lit une variable que l'étape d'avant a remplie mesure l'étape d'avant.*** Une vraie page démarre à vide ; la fixture fait désormais pareil, et `M19` mord.

Tests : **blocs B-CCCXL (15 témoins de source) et B-CCCXLI (13 conduits dans le navigateur)**, dans `tests/parcours/coach_memoire.js` — la mémoire ancienne, l'idempotence rejouée **trois fois**, un résumé neuf, un serveur muet, une provenance **abîmée** puis **illisible**, l'aller-retour `persist()` → `load()`, la mémoire vide, et ce qui part au nuage. ⛔ **CONTRÔLE NÉGATIF : 26 mutations sur un arbre CLONÉ, 26 conformes**, banc sain **28 OK / 0 rouge avant ET après** — dont ⭐ **quatre qui doivent RESTER VERTES** : des **commentaires** citant `validated`, `legacy`, `generated`, `coachMemoryMeta` et `_model`. *C'est la seule façon de prouver qu'on mesure le CODE et non la documentation* — et les commentaires de cette passe les citent tous, parce que **R30** exige que la raison soit écrite à côté du code.

**⛔⛔ ET LE CONTRÔLE NÉGATIF DU GÉNÉRATEUR DE PDF NE MESURAIT **RIEN** — la faute la plus instructive de la journée.** Ses **20 mutations** « refusaient » toutes pour la **même** raison — *« HEAD illisible »* — parce qu'un arbre **cloné n'a pas de `.git`** et que l'interrupteur de contrôle négatif ne couvrait pas ce garde-là. Vérifié en lançant le générateur sur un clone **NON MUTÉ** : il refusait à l'identique. 👉 ***Un contrôle négatif dont toutes les mutations échouent au même endroit ne prouve pas que les gardes mordent : il prouve qu'on n'est jamais arrivé jusqu'à eux.*** ⭐ **Et ce sont les trois mutations attendues VERTES qui l'ont révélé** — c'est exactement pour ça qu'elles existent (famille *« un contrôle négatif peut mentir »*, `docs/SUIVI-AUDIT.md`).

**⚠️ UNE FOIS LES GARDES ENFIN ATTEINTS, QUATRE ÉTAIENT FAUX — dont un qui aurait refusé de produire sur un arbre parfaitement sain.** ① `'schedule' not in wf` : or le **commentaire** du workflow *explique* son absence (*« Pas de `push`, pas de `schedule` »*) — ***un garde qui interdit un MOT punit la phrase qui explique la décision***, et **R30** exige justement qu'elle soit écrite là ; ② `'LANCER' in wf` restait vert alors que le test qui **REFUSE** avait disparu, le mot vivant aussi dans la description et le message d'erreur ; ③ la clé `source:` était cherchée dans **tout `state.js`** au lieu de la fiche, donc la retirer de la fiche ne se voyait pas ; ④ le branchement dans le runner était vérifié **une fois** alors qu'il y en a **deux** (`.ecran` et `.source`) — la moitié des témoins pouvait cesser de tourner en silence. **Les quatre sont la famille du piège de la sous-chaîne (`BUGS.md` n°1) : on mesure désormais le MÉCANISME, jamais le mot.** ⛔ **Et le garde de relecture avait raison lui aussi** : la page décrivait *« un champ neuf »* sans jamais le **nommer** — *un dossier de passation qui ne donne pas le nom oblige son lecteur à le chercher dans le code, c'est-à-dire à refaire le travail que le dossier existe pour lui épargner.*

**⚠️ DEUX CHIFFRES PUBLIÉS RENDUS PRÉCIS (ils étaient ambigus, pas faux).** ① *« 19 sites »* = **19 lignes de code** ; un `grep` en rend **32** (occurrences) — et c'était **17 lignes AVANT** ce chantier, donc le nombre publié n'était pas celui qui a justifié la décision ; ② *« 15 % du prix d'un message »* = 15 % du **coût total d'un échange** (0,0033 / 0,0222 $), soit **17 % du message de Milo seul**. *Les deux dénominateurs donnent deux nombres justes : celui qu'on publie doit dire lequel il emploie.*

Fichiers : `state.js`, `coach.js`, `setup.js`, `Code.js`, `worker.js`, `tests/parcours/coach_memoire.js` (nouveau), `tests/parcours/runner.js`, `tests/donnees/donnees-milo.json`, `tests/milo/eval.js`, `tools/banc_coach_memoire.js`, `tools/mut_coach_memoire.py`, `tools/gen_banc_reference.py`, `tools/gen_memoire_baseline_pdf.py` et `tools/mut_memoire_baseline.py` (nouveaux), `.github/workflows/banc-milo.yml` (nouveau), `docs/COACHMEMORY-PROVENANCE.md`, `docs/DECISIONS-MEMOIRE-LONGUE.md` et `docs/MILO-CARTOGRAPHIE-IDENTITE.md` (nouveaux), `tools/check_regles.py`, `tools/dump_prompt.js`, `docs/PROMPT-MILO-REEL.txt`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md` (en-tête de version), `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1227. |

**ft-v1226 — 🍽️ NUTRITION UX · LE REPAS CHOISI À LA MAIN RESTE ACTIF, ET LA DONNÉE LE SUIT** — cas réel rapporté par Michel : *« je rentre ma journée en retard, je choisis Dîner, j'ajoute un aliment… et l'app revient toute seule sur Petit-déjeuner »*. Ses bornes : ⛔ ***« pas d'UltraCode, passe courte »*** · ⛔ ***« je veux corriger LA CAUSE, pas ajouter dix booléens, un timer, un hack setTimeout ou une exception écran par écran »*** · ⭐ ***« si un état existant peut porter le repas sélectionné, utiliser cet état »***.

**⛔⛔ CE N'ÉTAIT PAS UNE GÊNE D'AFFICHAGE : LA DONNÉE PARTAIT AILLEURS.** Mesuré en conduisant l'app servie, horloge gelée, choix manuel = **Déjeuner** :

| heure | 1ᵉʳ aliment | 2ᵉ | 3ᵉ |
|---|---|---|---|
| **09 h** | `dejeuner` ✅ | ⛔ **`petitdej`** | ⛔ **`petitdej`** |
| 16 h | `dejeuner` ✅ | ⛔ `collation` | ⛔ `collation` |
| 21 h | `dejeuner` ✅ | ⛔ `diner` | ⛔ `diner` |

👉 ***Une journée rentrée après coup s'éparpillait dans des repas que personne n'avait choisis*** — et la ligne du matin est exactement le cas que Michel décrit.

**⭐⭐ LA CAUSE TIENT EN UNE LIGNE, ET C'ÉTAIT LE SEUL RECALCUL DU DÉPÔT.** `openAddFood` recalculait `_afMeal` depuis `new Date().getHours()` **à chaque ouverture** de l'écran d'ajout. Or **on rouvre cet écran pour CHAQUE aliment** : le choix manuel ne survivait donc jamais au premier ajout. *Le geste qui casse tout est celui qu'on refait le plus souvent.*

**⭐⭐ LA CORRECTION EST UNE ABSENCE, PAS UN DRAPEAU.** `_afMeal` ne porte plus que le **choix EXPLICITE** — `null` veut dire « personne n'a choisi », et c'est la seule information dont on a besoin. ⛔ **Zéro booléen, zéro timer, zéro exception écran par écran** : c'est la consigne, et c'est aussi ce qui rend la règle lisible — ***l'heure décide du DÉFAUT, jamais de ce qui a été DÉCIDÉ***. Priorité : **choix de la personne > suggestion horaire**.

**⛔ UN SEUL PROPRIÉTAIRE (R2)** : `_afMealActif()` répond seul à « dans quel repas écrit-on ? », et ses **quatre lecteurs** y passent tous — les puces, les **DEUX écrivains** du journal, le message de confirmation. *Une seule porte restée sur la variable brute écrirait `null` dans le journal*, et ça ne se verrait qu'en relisant ses repas des jours plus tard. ⭐ **Échec fermé** : un repas absent de `FOOD_MEALS` retombe sur la suggestion horaire, jamais sur une valeur inventée.

**📣 RÈGLE D'OR #11 — RIEN À ANNONCER, et c'est pesé.** Aucun écran n'apparaît, aucun bouton ne bouge, aucun réglage n'est ajouté : une gêne disparaît. ⚖️ **Pop-up : non** — rien n'est à *faire*, et le changement ne peut que soulager. *Annoncer « l'app ne change plus de repas toute seule » reviendrait à faire de la place dans le mécanisme d'annonce pour un défaut qu'on vient de réparer.*

**⏭️ CE QUE ÇA NE FAIT PAS**, nommément : ⛔ **aucune remise à zéro inventée** — la question *« faut-il oublier le choix en changeant de JOUR dans le journal ? »* n'est **pas tranchée**, donc pas décidée à la place de Michel (**règle d'or 15**) · ⛔ la **persistance longue** n'est pas touchée : le choix vit tant que l'app est ouverte, un rechargement complet repart sur la suggestion horaire, **comportement actuel inchangé** · ⛔ les politiques FREE/PREMIUM, les 21 capacités, les compteurs IA et leur migration, TDEE/macros, les plans alimentaires, les quotas, Milo, le Worker, Apps Script, Supabase, V2, **la Douane**, le miroir : **0 ligne** · ⛔ ni `state.js`, ni `screens.js`, ni `index.html`, ni `log.js`, ni `coach.js`, ni `setup.js`, ni `tracking.js`, ni `constants.js`, ni `Code.js`.

**⚠️⚠️ ET TROIS DE MES PROPRES TÉMOINS ONT ROUGI SUR DU CODE PARFAITEMENT SAIN — trois défauts d'instrument que ce dépôt connaît déjà.** ① un témoin **figeait un NOMBRE** de lectures brutes (« au plus 4 ») : *un témoin qui fige une valeur mesure mon arithmétique mentale* — l'invariant juste n'est pas « combien » mais **« OÙ »**, toute lecture brute doit vivre chez le propriétaire · ② un **compteur d'écritures comptait la DÉCLARATION** (`let _afMeal=null`), donc il annonçait 2 au lieu de 1 — exactement le défaut de mon compteur d'appels de ft-v1224 · ③ ⛔ **le piège de l'espace, 8ᵉ fois — et dans le commit même où je le corrigeais ailleurs** : le motif cherchait `function setFoodMeal` **avec un espace** dans une source dont je venais de retirer tous les espaces. *Quand on nettoie la source, on nettoie le motif du même geste, sinon le garde mesure sa propre mise en forme.*

**⭐ ET LA MUTATION QUI COMPTE EST LA DÉGUISÉE.** `M02` remet le recalcul **en passant par le propriétaire du défaut** (`_afMealDefautHoraire()`) au lieu d'écrire l'heure à la main : un témoin qui ne chercherait que `getHours()` serait resté **vert** dessus. Elle mord.

⚖️ **DEUX OBSERVATIONS UX, NOTÉES ET NON CORRIGÉES** (consigne §11, *« une gêne observée une fois ne doit pas devenir une refonte »*) : ① le choix **survit à un changement de jour** dans le journal — mesuré, non tranché ; ② il **ne survit pas à un rechargement complet** de la PWA — comportement actuel, aucune preuve qu'il faille le changer.

Tests : **blocs B-CCCXXXVI (10 témoins de source) et B-CCCXXXVII (14 conduits dans le navigateur)**, dans `tests/parcours/repas_actif.js` — les **8 cas U1→U8** plus **la journée entière** de Michel : 4 repas, 9 aliments, chacun ajouté en **ROUVRANT** l'écran. ⭐ L'horloge du banc est **gelée à 09 h exprès** : c'est l'heure où le défaut horaire diffère du choix manuel — *un banc calé sur une heure où les deux coïncident serait resté vert sur le code d'avant*. ⛔ **CONTRÔLE NÉGATIF : 19 mutations sur un arbre CLONÉ, 19 conformes**, contrôle sain **24 OK / 0 rouge avant ET après**, dont **deux qui doivent RESTER VERTES** (les mots cherchés cités dans un commentaire).

Fichiers : `app.js`, `tests/parcours/repas_actif.js` (nouveau), `tests/parcours/runner.js`, `tools/banc_repas_actif.js` et `tools/mut_repas_actif.py` (nouveaux), `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1226. |

**ft-v1225 — ⚖️ PHASE 3.1 · LES TROIS DERNIERS ARBITRAGES IA RENDUS, ET LE POT DE 25 SÉPARÉ EN TROIS** — Michel enchaîne sur la phase 3 avec une borne de format : ⛔ ***« PASSE MOYENNE. Pas besoin d'UltraCode ni d'une passe de nuit. Cette passe doit rester ciblée. »*** · ⛔ ***« Ne pas encore : appliquer les verrous Premium serveur, fermer les routes Apps Script, toucher V2, toucher la Douane. »*** · et la phrase qui décide du pot : ⭐ ***« OUI, séparer le pot `S.foodAiUses`. »***

**📣 RÈGLE D'OR #11 — UN SEUL CHANGEMENT VISIBLE, ET IL EST EN FAVEUR DE L'UTILISATEUR.** Le pot de 25 usages IA de la Nutrition était **COMMUN** aux trois capacités ; il devient **trois pots séparés**. Quelqu'un qui avait épuisé ses 25 en lisant des étiquettes retrouve donc ses estimations de repas. ⚖️ **Pop-up : non** — rien n'est à *faire*, rien ne disparaît, aucun repère ne bouge, et le changement ne peut que soulager. ⚠️ **Dit franchement parce que c'est un jugement** : si Michel veut une ligne dans le Guide, c'est une ligne à ajouter — je ne la pose pas de moi-même sur un élargissement qu'il a décidé.

**⭐⭐ POURQUOI UN COMPTEUR COMMUN ÉTAIT UN DÉFAUT, ET PAS UN RACCOURCI.** Tant que les trois capacités partagent `S.foodAiUses`, elles **ne peuvent pas** recevoir trois politiques distinctes : lire une étiquette retire un essai au repas décrit, qui n'a rien demandé. 👉 ***Un compteur commun n'est pas une simplification, c'est une politique implicite*** — celle qui dit « ces trois choses sont la même », ce que la phase 2 a mesuré comme faux.

| | avant | après |
|---|---|---|
| étiquette IA | ⛔ **pot commun de 25** | ✅ `foodLabelAiUses`, 25 à elle |
| repas décrit IA | ⛔ **le même pot** | ✅ `foodMealEstimateAiUses`, 25 à lui |
| repli code-barres IA | ⛔ **le même pot** | ✅ `foodBarcodeAiUses`, à lui seul |
| le nombre `25` | 1 constante | **1 constante** (inchangé) |

**⛔⛔ ET LE REPLI CODE-BARRES GARDE UN POT DE 25 ALORS QUE SA POLITIQUE EST « PREMIUM, 0 » — C'EST DÉLIBÉRÉ, ET C'EST LE SEUL ÉTAT SÛR.** Michel : *« si le verrou Premium réel appartient à la prochaine phase serveur, ne construis pas ici une fausse sécurité uniquement client »*. Or lui retirer son pot **sans** poser ce verrou l'aurait rendu **illimité et gratuit** — l'exact contraire de la décision. 👉 ***Mesuré avant de trancher : la capacité a deux portes réelles*** (le bouton « 🆘 si la caméra n'y arrive pas » et le repli du scanner). La **séparation** est faite, l'**écart** est écrit dans le registre, le **verrou** viendra.

**⭐⭐ LA MIGRATION EST CONSERVATRICE, ET C'EST SON SEUL MÉRITE.** Chaque pot neuf hérite du **TOTAL** de l'ancien : quelqu'un qui a consommé 10 essais démarre à **10 sur chaque capacité**, pas à 0. ⛔ On ne sait pas comment ces 10 se répartissaient — *l'information n'a jamais été enregistrée, donc elle n'existe pas, donc on ne l'invente pas* (règle d'or 15). L'erreur qui reste est bornée et va dans le bon sens : on peut sur-compter, jamais offrir 25 essais neufs à quelqu'un qui en avait consommé 20.

**⛔⛔ CE N'EST PAS UN DRAPEAU « MIGRATION FAITE », ET C'EST LA DÉCISION CENTRALE.** Une restauration cloud remplace l'état **APRÈS** le chargement, et peut ramener un profil d'**avant** cette version des mois plus tard — c'est mot pour mot le piège de `ft4_stmig1` (ft-v1213) et celui de l'identité des lignes du journal (ft-v1218). La migration est donc une **RÈGLE rejouée** au chargement **et** après chaque restauration, **idempotente par construction** : un pot déjà numérique n'est jamais retouché.

**⚠️ ET LE SIGNAL EST L'ABSENCE, PAS LA VALEUR.** `_lsNombreOuNull` rend `null` quand la clé n'a jamais été écrite. *Si elle rendait 0, un pot jamais écrit serait indiscernable d'un pot légitimement à zéro* — la migration ne partirait **jamais**, et un compte à 20 essais consommés recevrait 25 essais neufs, en silence.

**⭐ LES TROIS ARBITRAGES, RENDUS PAR MICHEL** : `milo.debrief` → **PREMIUM** (le débrief **chiffré** de fin de séance reste local et gratuit ; c'est le *jugement* de Milo qui devient Premium) · `nutrition.mealPlanImport.ai` → **PREMIUM** (la **saisie manuelle** d'un plan reste gratuite) · `nutrition.mealPlan.ai` → **FREEMIUM par PÉRIMÈTRE**, le **jour** en gratuit et la **semaine** en Premium.

**⛔ UNE 22ᵉ CAPACITÉ AURAIT ÉTÉ LA FAUTE FACILE.** Le jour et la semaine sont **le même besoin produit** vu à deux profondeurs : les séparer en `mealPlan.day` / `mealPlan.week` aurait cassé le compte acté de 21. Un **seul** champ nouveau est ajouté, `perimetre`, porté par **une seule** capacité — son absence ailleurs se lit « pas de variation », ce qui est le fait.

**⭐⭐ ET UNE SEPTIÈME FORME DE QUOTA EST NÉE, `non_decide`, PARCE QU'ÉCRIRE « ILLIMITÉ » AURAIT ÉTÉ INVENTER UNE DÉCISION.** Michel a tranché le **périmètre**, pas le **nombre** : *« Ne pas inventer 1/jour, 3/jour, 5/mois ou autre quota. »* ⚠️ Et elle ne double pas `par_evenement` : celle-là dit « la forme est connue, la taille n'est pas mesurée » (le backfill), celle-ci dit « la forme elle-même n'est pas tranchée ». 👉 ***Un registre qui n'a pas de mot pour « pas décidé » finit toujours par écrire une décision à la place.***

**⭐ ZÉRO POLITIQUE OUVERTE, ET LA DOCUMENTATION LE DIT SANS MENTIR.** Les trois `NON_DECIDEE` disparaissent. ⛔ Mais la **valeur** reste déclarée alors que plus personne ne la porte : la retirer forcerait la prochaine capacité déclarée avant d'être tranchée à s'inscrire « FREE » par défaut — exactement la faute qu'elle existe pour empêcher. ⛔ Et le texte généré prévient : *« zéro politique ouverte ne veut pas dire zéro travail »* — **12 écarts** restent écrits.

**🩹 CORRECTION DOCUMENTAIRE — M12 N'A JAMAIS ÉTÉ UNE QUESTION, ET C'EST MON ERREUR.** Le dossier de la phase 3 listait *« `milo.memory` devient-elle Premium ? »* parmi les décisions attendues. **Elle était déjà actée** — et le registre l'inscrivait correctement dans le même fichier (`politique: PREMIUM` / `etatCode: FREE`). 👉 ***Un rapport qui rouvre une décision déjà prise ne se contente pas d'être faux : il fait RE-ARBITRER, c'est-à-dire qu'il COÛTE une décision au lieu d'en rappeler une*** (règle d'or 15). Le générateur de ce dossier porte désormais l'explication sur place et **refuse de produire** (ses gardes exigent « 3 politiques ouvertes »), comme les deux générateurs périmés de S2-B.

**🔧 UNE PORTE DE CONTOURNEMENT FERMÉE AU PASSAGE, LOCALE ET SANS DÉPENDANCE AU SERVEUR.** Le plafond « 1 régénération/jour en gratuit » vit **dans** `S.mealPlan` — que la génération complète réécrivait avec `regenCount:0`. 👉 ***Le plafond se levait en appuyant sur le bouton d'à côté***, qui n'a lui aucun plafond. Le compteur du jour est désormais **REPORTÉ** au lieu d'être effacé ; un jour différent repart bien à zéro, et le plafond lui-même ne bouge pas d'un chiffre.

**⏭️ CE QUE ÇA NE FAIT PAS**, nommément : ⛔ aucun **verrou Premium serveur** · ⛔ aucune route Apps Script fermée · ⛔ **ni V2, ni `ft_jetons`, ni le miroir multi-appareils, ni la Douane** · ⛔ aucun quota de génération complète inventé · ⛔ aucune 22ᵉ capacité · ⛔ aucun tombstone, aucun backfill réel · ⛔ **ni `screens.js`, ni `log.js`, ni `coach.js`, ni `tracking.js`, ni `constants.js`, ni `supabase.js`, ni `worker.js`, ni `index.html`.**

Tests : **blocs B-CCCXXXIV (23 témoins de source) et B-CCCXXXV (24 témoins conduits dans le navigateur)**, dans `tests/parcours/pots_nutrition.js` — les **8 cas N1→N8** de Michel plus les **8 états de migration** (absent · 0 · 5 · 24 · 25 · 40 · « abc » · −3), l'idempotence éprouvée en rejouant la règle **trois fois**, et un pot déjà migré qui **ne bouge plus** même quand l'ancien pot remonte plus haut. ⭐ Le témoin **B-CCCXXXI ⑱ a été RETOURNÉ, pas supprimé** : il figeait la **liste** des trois politiques ouvertes et serait devenu rouge sur un registre parfaitement à jour ; sa **garantie** n'a pas bougé — *le registre doit rester capable de dire « pas décidé »*.

**ft-v1224 — 🗂️ LA SOURCE DE VÉRITÉ CENTRALE DES 21 CAPACITÉS IA · ET LE DOUBLE COMPTAGE FERMÉ, TEST-FIRST** — phase 3, après que Michel a arbitré Q1→Q5 et acté **M1→M14**. ⚠️⚠️ **CETTE PHRASE EST HISTORIQUE, ET SA NUMÉROTATION N'EST PAS FIABLE — vérifié le 20/09/2026.** *« M1→M14 » n'est énuméré nulle part* ; **9** décisions seulement sont prouvées (dans `tools/gen_memoire_archi_pdf.py`), **5 sont introuvables**, et **`M12` désigne la réponse à une question posée APRÈS les 14** — donc les deux numérotations sont incompatibles. ⛔ **Ne pas s'appuyer sur une étiquette `M<n>` ailleurs que dans `capacites-ia.js`** (M12/M13/M14, les seules prouvées). 👉 **La restitution, avec ses sources : `docs/DECISIONS-MEMOIRE-LONGUE.md`.** Ses bornes : ⛔ ***« phase 3 ne doit pas encore poser tous les verrous »*** · ⛔ ***« la documentation humaine ne doit pas devenir une deuxième source de vérité »*** · ⛔ ***« ne compense pas le bug en doublant artificiellement les plafonds »***.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun bouton n'apparaît, aucun quota ne bouge, aucune route n'est fermée. Un fichier de données est servi, et **personne ne le lit encore**.

**⭐⭐ LE DÉFAUT FERMÉ EST MESURÉ, PAS SUPPOSÉ.** La politique d'accès vivait à **QUATRE endroits qui ne se parlaient pas** : le texte de vente (`PREMIUM_PERKS`), les gardes du client, le quota du serveur, et la documentation écrite à la main. La phase 2 y avait prouvé **9 incohérences**, dont **trois capacités vendues Premium et gratuites dans le code**. 👉 ***Ce n'était pas une série d'oublis : c'est la conséquence mécanique d'une politique sans propriétaire*** (**R2**). `capacites-ia.js` devient ce propriétaire.

**⭐⭐ DEUX CHAMPS, PAS UN — la leçon la plus chère de la phase 2.** `politique` dit ce qui **DOIT ÊTRE**, `etatCode` dit ce qui **EST**, et tant qu'ils diffèrent l'écart est **ÉCRIT** (12 le sont). 👉 ***Un registre qui affiche la politique souhaitée à la place de la politique appliquée ment plus efficacement qu'une documentation périmée, parce qu'il a l'air d'être du code.***

**⭐ LA DOCUMENTATION EST GÉNÉRÉE, JAMAIS ÉCRITE.** `docs/IA-FREE-PREMIUM.md` sort de `tools/gen_doc_ia.js` ; son mode `--check` **RÉGÉNÈRE et compare caractère pour caractère**. ⛔ Et le contrôle est lui-même **éprouvé sur une documentation volontairement fausse** — *un contrôle qui ne peut pas rougir ne protège rien*. C'est **R27** appliqué ici : l'inventaire est généré depuis le code pour cette raison exacte.

**⛔ `NON_DECIDEE` EST UNE VALEUR DE PLEIN DROIT.** Trois politiques restent ouvertes (`milo.debrief`, `nutrition.mealPlan.ai`, `nutrition.mealPlanImport.ai`) : les inscrire « FREE » reviendrait à **inventer une décision** que Michel n'a pas prise (**règle d'or 15**). ⭐ Six formes de quota, dont **`par_evenement`** que `milo.memory.backfill` exige et qu'aucun compteur actuel ne sait exprimer — sa valeur reste **`null`**, parce que la taille d'une période est **NON MESURÉE**.

**🔧 UNE SEULE CORRECTION DE CODE, ET ELLE EST TEST-FIRST.** Un appel IA venu du Worker traversait **deux** routes Apps Script (`authIdentity` puis `aiCount`) qui appelaient toutes deux `_aiQuotaBlock_` — laquelle **n'est pas une lecture, elle ÉCRIT**. Chaque appel consommait **deux unités** : plafonds réels **25/jour/e-mail au lieu de 50**, **300 au lieu de 600**.

⭐ La correction **sépare LIRE de CONSOMMER** : `_aiQuotaEtat_` n'écrit rien, `_aiQuotaBlock_` reste le **seul propriétaire de l'écriture**. ⭐⭐ **Un second défaut tombe avec** : un appel **REFUSÉ** consommait quand même — *un garde-fou qui se déclenche en consommant la ressource qu'il protège travaille contre lui-même*, et quelqu'un déjà bloqué creusait son propre plafond en réessayant. ⛔ **Les plafonds ne bougent pas d'un chiffre** : *doubler un plafond pour absorber un double comptage, c'est graver le bug dans la configuration et le rendre indétectable.*

⭐ **Le témoin a été écrit AVANT le correctif** et mesuré **ROUGE à 7 défauts** sur le code d'avant. ⚠️ **Et il a fallu le corriger d'abord** : mon compteur d'appels attrapait aussi la **déclaration** de la fonction — *un compteur d'appels qui compte la définition mesure autre chose que ce qu'il annonce*, et serait resté rouge sur une correction parfaitement juste.

**⏭️ CE QUE ÇA NE FAIT PAS**, nommément : ⛔ aucun garde Premium **serveur** · ⛔ aucune route Apps Script fermée · ⛔ aucun tombstone, aucun journal de profil, aucun backfill réel · ⛔ aucune synchro multi-appareils · ⛔ **ni V2, ni Douane** · ⛔ le **pot de 25 usages Nutrition n'est pas séparé dans le code** — seul le registre porte désormais trois politiques distinctes pour ses trois capacités, ce qui est le préalable et non la correction.

Tests : **blocs B-CCCXXXI (22 témoins), B-CCCXXXII (6) et B-CCCXXXIII (12)**, dans `tests/parcours/registre_ia.js` et `tests/parcours/quota_double.js`.

Fichiers : `capacites-ia.js` (nouveau), `docs/IA-FREE-PREMIUM.md` (généré), `tools/gen_doc_ia.js` (nouveau), `Code.js` (**uniquement autour du quota**), `index.html` (**une balise**), `sw.js`, `tests/parcours/registre_ia.js` et `quota_double.js` (nouveaux), `tests/parcours/runner.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/INVENTAIRE.md`. ⛔ **Ni `app.js`, ni `state.js`, ni `screens.js`, ni `log.js`, ni `coach.js`, ni `setup.js`, ni `tracking.js`, ni `constants.js`, ni `worker.js`, ni `supabase.js`.** sw.js ft-v1224. |

**ft-v1223 — 🩹 LES DEUX DÉFAUTS D'AFFICHAGE DU MIROIR · ET ILS ONT ÉTÉ VUS À L'ÉCRAN, PAS EN RELECTURE** — feu vert de Michel : ⭐ ***« corrige les deux défauts d'affichage »***.

**⚠️⚠️ CE QUI LEUR DONNE LEUR POIDS : ILS SE SONT PRODUITS POUR DE VRAI, L'APRÈS-MIDI MÊME.** Apps Script est devenu injoignable (*« Le serveur répond : INJOIGNABLE, trop lent »*), et la carte Admin a annoncé **« identité refusée »** à quelqu'un dont le compte allait parfaitement bien. *Le chantier entier repose sur la phrase « dire à quelqu'un que son appareil est révoqué alors que le cloud est simplement tombé est une erreur qu'il va essayer de réparer lui-même » — et je l'avais commise un cran plus bas que là où je l'avais corrigée.*

**⭐⭐ LA CORRECTION EST UNE LISTE BLANCHE, PAS UNE LISTE DE PANNES — et c'est tout le sujet.** La branche 401 ne traitait à part que `revoque` et `forme` ; `reseau`, `refus`, `erreur`, `illisible` tombaient dans un fourre-tout qui parlait d'identité. On énumère désormais ce qui **EST** un refus, et **tout le reste** est « serveur indisponible ».

| raison rendue par le pont | avant | après |
|---|---|---|
| `reseau` · `refus` · `erreur` · `illisible` | ⛔ **« identité refusée »** | ✅ **« serveur indisponible »** |
| une raison **jamais vue** | ⛔ « identité refusée » | ✅ **« serveur indisponible »** |
| `revoque` | « appareil révoqué » | **inchangé** |
| `forme` · `absent` · `inconnu` | partiel | **dits en clair, un par un** |

👉 ***Une raison NOUVELLE est bien plus probablement une anomalie qu'un refus légitime***, et le coût de l'erreur n'est pas symétrique (**R29**) : dire « serveur indisponible » à un appareil vraiment révoqué est bénin — il verra que ça ne marche pas ; dire « identité refusée » pendant une panne envoie quelqu'un réparer ce qui n'est pas cassé. ⛔ Et `revoque` reste dit **en clair** : sans ça, la personne ne comprend pas pourquoi ses sauvegardes ont cessé de partir.

**⭐ LA SONDE PORTAIT LE MÊME DÉFAUT, ET C'EST PIRE QU'UN SILENCE.** Elle affichait un **✅ triomphant** sur `raison : refus`, c'est-à-dire *pendant* la panne. *Un instrument qui annonce « tout va bien » pendant une panne est pire qu'un instrument muet.* Le ✅ n'est désormais mérité que sur un **vrai** refus.

**⛔ DÉFAUT 2 — LE TEXTE DE LA CARTE (R23).** Il promettait encore *« le bouton écrit une ligne de test pour de vrai »* : vrai de l'**ancien** bouton, faux depuis la bascule où la sonde **n'écrit rien** — ce qui est précisément ce qui la rend sûre pendant une mesure. *J'avais changé le comportement sans changer le texte qui le décrit.*

**⚠️⚠️ ET LE TROU DE MON BANC EST LA VRAIE LEÇON DE CETTE PASSE.** J'avais conduit 401/révoqué, 401/sans-jeton, 503, et la coupure réseau **du téléphone**. ⛔ **Jamais le 401 dont la raison est une panne du PONT.** 👉 ***Un cas qu'on n'écrit pas reste vert pour toujours*** — et celui-là a été trouvé par un vrai téléphone, pas par une relecture. Le bloc **B-CCCXXIX** le comble, **y compris avec une raison qu'on n'a pas prévue**.

**⚠️ ET UN TÉMOIN A ROUGI SUR DU CODE PARFAITEMENT SAIN — DEUXIÈME FOIS, MÊME PIÈGE, MÊME FICHIER.** `B-CCCXXVI ⑮` cherchait le libellé de la révocation **dans la fonction**, or il a déménagé dans une table **au niveau du fichier**. La leçon était écrite **juste à côté**, dans `B-CCCXIV ③` de ft-v1217 : *« la LISTE vit au niveau du fichier, seul l'APPEL vit dans la fonction »*. 👉 ***Un garde doit chercher le fait LÀ OÙ IL SE TROUVE — et quand un fait déménage, c'est le garde qui suit, pas le code qui revient.***

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran utilisateur ne change : un texte d'**Admin** devient exact, et un message d'erreur d'**Admin** cesse de mentir.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔⛔ **V2 n'est toujours pas fermée** · ⛔ les **deux voies réelles** (`pont` puis `directe`) restent à mesurer — elles attendent le retour d'Apps Script · ⛔ Nutrition, scanner, douane, `foodLog`, Accueil, Séance, Progrès, Milo : **0 ligne** · ⛔ ni `app.js`, ni `screens.js`, ni `state.js`, ni `log.js`, ni `coach.js`, ni `tracking.js`, ni `constants.js`, ni `worker.js`, ni `Code.js`. Dans `index.html`, ma **seule** empreinte est la carte du miroir.

**⛔ ET LES DEUX GÉNÉRATEURS DE PDF DES DOSSIERS PRÉCÉDENTS REFUSENT DÉSORMAIS DE PRODUIRE — C'EST VOULU.** Leurs **gardes à l'envers** interdisent de publier un dossier qui décrit un défaut **déjà corrigé** : *un dossier qui décrit un défaut réparé fait chercher quelque chose qui n'existe plus*. L'en-tête de chaque fichier le dit, pour que personne ne les « répare » (**R30**).

**🕐 ET UNE TROISIÈME CORRECTION, TROUVÉE EN VÉRIFIANT UNE HYPOTHÈSE DE MICHEL PLUTÔT QU'EN CHERCHANT UN BUG.** Il propose que les échecs tombent *« au moment de la sauvegarde »*. ⛔ **Les horaires ne collent pas** — la sauvegarde démarre à **14:08**, les échecs sont à 13:40-13:59 — mais en le vérifiant, un vrai défaut apparaît : l'écran annonce **« 2× par jour (2h et 14h UTC) »**, et **c'est faux**. `appsscript.json` déclare `Europe/Paris`, et `.atHour()` suit le fuseau du **projet** : écart réel de **2 heures** en été.

👉 ***Un libellé faux ne se contente pas d'être faux : il fait raisonner de travers ceux qui le lisent.*** En lisant « 14h UTC », j'avais d'abord placé ce passage à **16 h** — donc très loin des faits. C'est le **nom du fichier** (`backup-2026-09-18-14-08.json`, formaté en `Europe/Paris`) qui m'a rattrapé. Famille « fuseaux horaires » de `BUGS.md`, appliquée cette fois à un **message d'écran** et non à un calcul.

⭐ **Et le fuseau est LU, jamais écrit à la main** (`Session.getScriptTimeZone`, **R2**) : poser « Paris » en dur reproduirait exactement le défaut un cran plus loin, en silence, le jour où la configuration change. ⛔ Repli honnête si le fuseau est illisible (« heure du serveur »), et ⛔ **les heures elles-mêmes ne bougent pas** — *on corrige ce qui est DIT, pas ce qui est FAIT*. ⚠️ **Pas de bump pour cette partie** : `Code.js` est du backend, déployé par `deploy-appsscript.yml`.

Tests : **blocs B-CCCXXVIII (11 témoins de source) et B-CCCXXIX (11 témoins de comportement)**, dans `tests/parcours/s2b_bascule.js` — banc ciblé **71 OK / 0 rouge**. ⛔ **CONTRÔLE NÉGATIF : 28 mutations sur un arbre CLONÉ, 28 conformes**, dont **deux qui doivent RESTER VERTES**. ⭐ Plus le **bloc B-CCCXXX** (7 témoins, `tests/parcours/backup_fuseau.js`) et son contrôle négatif **9/9**, dont **deux vertes attendues** — un commentaire qui cite « UTC » et « Paris », *parce que R30 exige que la raison soit écrite juste à côté du code*.

Fichiers : `supabase.js`, `index.html` (**la seule carte du miroir**), `Code.js` (**uniquement autour de `BACKUP_HOURS_`**), `tests/parcours/backup_fuseau.js` (nouveau), `tools/mut_backup_fuseau.py` (nouveau), `tests/parcours/s2b_bascule.js`, `tools/mut_s2b_bascule.py`, `tools/gen_s2b_essai_iphone_pdf.py` et `tools/gen_s2b_panne_appsscript_pdf.py` (en-tête « périmé »), `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1223. |
