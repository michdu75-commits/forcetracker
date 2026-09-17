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
| `sw.js` | Service Worker (cache-first HTML navigation, cache-first assets) — cache versionné `ft-vNN`, bumpé à chaque release (**actuel : `ft-v1217`** — voir le journal des versions) |
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

**🛡️ Gardien de la Constitution (sortie, en construction)** — symétrique au Gardien de sécurité (entrée) :
une couche de **conformité AVANT l'affichage** qui vérifie que la réponse de Milo respecte les principes
(hypothèse présentée comme hypothèse, pas d'invention de fait/source, rôle tenu, rythme). **Étage 1** =
déterministe local (généralise `_stripCoachTech` : blocs qui fuient, interrogatoire, jargon médical) ;
**Étage 2** = validation IA (option future, coûteuse). Cadre : `docs/MOTEUR-RAISONNEMENT-MILO.md`.

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

> **Version actuelle : `ft-v1221`** (prochaine : `ft-v1222`).
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

**ft-v1221 — 🍽️ NUTRITION · LE SCANNER REDEVIENT LOCAL, LA PORTION REDEVIENT LA TIENNE, ET LES HABITUDES SE MESURENT AVANT DE SE DÉCIDER** — les trois correctifs de l'audit du matin, validés par Michel. Sa borne : ⛔ ***« pas de grand redesign · pas de changement de cible calorique glissé dans le même chantier »*** · et, pour les habitudes : ⭐ ***« je préfère un arrêt propre avec une mesure réelle à un seuil inventé »***.

**⭐⭐ A — LA PORTE DU SCANNER SE ROUVRE, ET LE MOT QUI DÉCIDE TIENT EN UN IDENTIFIANT.** Le bouton servi était *« photographier le code-barres (IA lit les chiffres) »* : on payait un appel IA pour lire **13 chiffres que le téléphone décode seul** — et ⚠️ ce que le modèle rend n'est **pas décodé**, aucune clé de contrôle n'a été vérifiée. Le moteur local existait **en entier** (23 fonctions, 4 bibliothèques, un banc de 4 moteurs) : sa porte était fermée exprès depuis le 14/09.

👉 ***`scanBarcode()` demandait encore `zxing-js` — le moteur que le banc avait ÉCARTÉ*** (77,5 % contre 86,2 %, et 25× plus lent). **Rouvrir la porte sans changer ce mot aurait servi le moins bon des quatre**, et personne ne l'aurait vu : *ça marche, juste moins bien.*

**⛔⛔ ET LE LIVE RESTE ÉTEINT, SUR LA FOI DU SEUL ESSAI IPHONE RÉEL.** La voie live y a fait **0 lecture juste et 1 code FAUX** — `3122632363883`, jamais présenté, lu sur **du tissu flou en mouvement**. Les deux lectures justes venaient des **captures**. *Un code faux est pire qu'une absence de lecture : sa clé de contrôle est valide, donc **rien** en aval ne peut le rattraper.* ⭐ Le flux vidéo reste ouvert (il sert à cadrer) et le diagnostic continue de **noter** ce que le live aurait lu : **on éteint la décision, pas la mesure**. ⭐⭐ Et le **banc Admin rallume le live** — *on ne désarme pas l'instrument qui a trouvé le défaut.*

| | avant | après |
|---|---|---|
| chemin par défaut | ⛔ **photo → IA** | ✅ **capture → `zxing-wasm` → clé → 1 recherche** |
| appels IA sur un scan réussi | 1 | **0** |
| voie live | — | ⛔ **éteinte** (rallumée au banc Admin) |
| saisie manuelle · étiquette IA · repas décrit | intacts | **intacts** — trois usages différents |

**⭐⭐ B — LE « 250 g DE BANANE » N'ÉTAIT PAS UN CALCUL, C'ÉTAIT UN PLAFOND ATTEINT.** `_RESTE_MAX_G = 250` : *« 250 g de banane »* et *« 250 g de pâtes sèches »* étaient **deux fois la même borne**. L'app avait calculé plus et s'était arrêtée. ⛔ **Et le défaut de conception est là** : un plafond unique **en grammes** traite tous les aliments comme si une portion pesait pareil — 250 g de banane ≈ 2 bananes, 250 g de pâtes **sèches** ≈ 2 portions et demie. *Le même chiffre, deux réalités sans rapport.*

La quantité part désormais de la **portion médiane réellement notée**, et la proposition est un **multiple simple** (1 · 1½ · 2 ; **1 le soir**). ⭐ **MÉDIANE et non moyenne** : mesuré, une grosse saisie isolée (600 g parmi trois 140 g) donnerait **255 g** en moyenne et **140** en médiane. ⚖️ **Trois seuils écrits plutôt que cachés** : **3 observations** pour oser dire « tes portions » · **1 ou 2** → on s'en sert **sans l'annoncer** · **0** → générique, **et on le dit**. ⛔ Une quantité **absente n'est pas un zéro**, et on ne mélange pas les unités.

⭐ **Et quand les portions plausibles ne couvrent pas la moitié du reste, l'écran le DIT** — ⛔ **jamais le soir** (anti-TCA, **P21**) : *la même phrase peut informer à 14 h et blesser à 21 h*. Le **calcul du manque reste exact** : c'est la suggestion qui s'arrête à ce qui est plausible, et qui cesse de prétendre le contraire.

**⛔⛔ C1 — LES HABITUDES : LA MESURE, PAS LA RÈGLE, ET C'EST VOLONTAIRE.** `s.n >= 2` **n'est pas touché**. Un outil Admin en **lecture seule** (aucune écriture, aucun envoi, aucun secret) rend par repas : total · **jours distincts** · semaines distinctes · fenêtres **14/28/56 j** · et le **dénominateur qui manquait** — les jours réellement **renseignés**. *Sans lui, quelqu'un qui note une semaine sur deux voit ses habitudes diluées par son propre silence.*

**⚠️⚠️ ET LA MESURE M'A APPRIS UN FAIT QUE L'AUDIT N'AVAIT PAS VU.** La signature d'un repas porte **tous** les aliments du couple `(date, repas)`. 👉 ***Deux pizzas dans le MÊME dîner ne font pas « pizza notée 2 fois » : elles font un repas DIFFÉRENT.*** Un aliment n'est candidat que s'il est **seul** dans son repas. ⚠️ Mes **deux premières fixtures rougissaient sur un outil parfaitement juste** — *elles testaient ma compréhension de la signature, pas la mesure*. Et un attendu figeait **une valeur** (« 140 g ») au lieu de la **règle** : le code proposait 280 = 2 × 140, ce qui est exactement le comportement voulu. *Un témoin qui fige une valeur mesure mon arithmétique mentale.*

**📣 RÈGLE D'OR #11** — un bouton **apparaît** (« 📷 Scanner le code-barres ») et un autre change de rang. ⚖️ **Pop-up : non** — rien n'est à *faire*, et le scanner fonctionnait déjà par la photo. ⭐ Mais **point rouge + aide de l'onglet + aide détaillée + diapo du Guide** sont dus, et je les pose à la demande de Michel plutôt que de moi-même : *c'est une vraie feature utilisateur, pas une correction.*

**⏭️ CE QUE ÇA NE FAIT PAS**, chacun figé par un témoin : ⛔ **l'Accueil est GELÉ** · ⛔ **la douane est GELÉE** (4 écrivains, aucune règle devenue bloquante) · ⛔ `calcTDEE`/`calcMacros` et **la cible** ne bougent pas — *la cible à 3 831 kcal explique pourquoi le plafond saturait, mais la corriger est un autre chantier* · ⛔ **Milo global**, Séance, Progrès, la palette · ⛔ **la règle des habitudes**, qui attend les chiffres réels. ⚠️ **Le défaut « compte neuf : 1 500 kcal, 0 g de protéines, 0 g de lipides » reste OUVERT** et hors de ce sous-chantier.

⚠️⚠️ **ET LE SCANNER N'EST PAS VALIDÉ TANT QUE MICHEL N'A PAS TESTÉ SUR IPHONE RÉEL.** *Le banc synthétique est précisément celui qui disait que tout allait bien.*

Tests : **blocs B-CCCXXI → B-CCCXXV, 45 témoins**, dans `tests/parcours/nutri_correctifs.js`. ⛔ **CONTRÔLE NÉGATIF : 29 mutations sur un arbre CLONÉ, 29 conformes**, contrôle sain **45 OK / 0 rouge avant ET après** — dont **quatre qui doivent RESTER VERTES** (les mots que les témoins cherchent, cités dans un commentaire JS, HTML, ou dans la doc), *parce que la raison de chaque décision est justement écrite à côté du code* (**R30**). ⭐ **Deux témoins ont été RETOURNÉS, pas supprimés** : ils figeaient la porte **fermée** — ils figent maintenant qu'elle est **ouverte sur la capture**.

Fichiers : `app.js`, `index.html`, `screens.js` (bloc **Nutrition** uniquement, justifié avant modification), `tests/parcours/nutri_correctifs.js` (nouveau), `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. ⛔ **Ni `state.js`, ni `log.js`, ni `coach.js`, ni `setup.js`, ni `tracking.js`, ni `style.css`, ni `supabase.js`, ni `Code.js`, ni `worker.js`.** sw.js ft-v1221. |

**ft-v1220 — 🚀 LA FINALISATION DE L'ACCUEIL · « PUSH SUR UNE BRANCHE ≠ VERSION EN LIGNE », ET UNE CORRECTION À MON PROPRE AUDIT** — Michel ouvre la passe sur le constat qui la motive, en majuscules : ⛔⛔ ***« PUSH SUR UNE BRANCHE ≠ VERSION EN LIGNE »***, puis borne le nettoyage : ⛔ ***« supprimer UNIQUEMENT le code mort prouvé »*** · ⛔ ***« ne pas toucher aux candidats seulement probables »*** · ⛔ ***« Aucun redesign. Aucune nouvelle fonctionnalité. »*** · et, pour finir : ***« Puis STOP. Pas de nouveau nettoyage opportuniste. »***

**⛔⛔ LE POINT QUI COMPTE AVANT TOUT LE RESTE : `ft-v1219` N'AVAIT JAMAIS ATTEINT `master`.** Les quatre corrections du 16/09 — le `NaN kg`, la carte de récup remontée, le silence sur un compte muet, la zone tapable — vivaient sur une branche. **GitHub Pages ne se déclenche que sur `master`** : elles n'étaient donc **en ligne nulle part**. C'est **R18** mot pour mot (*vérifier le DÉPLOIEMENT, pas le push*), et le journal du projet le porte déjà **deux fois**. *Un travail fini qui n'est pas servi n'est pas un travail fini.* Réconciliation faite d'abord : les **6 commits** de l'autre session (étapes B→E) ne touchent que `tools/`, **aucun fichier servi**, donc aucun conflit possible — fusionnés, puis les 4 corrections re-vérifiées une par une **après** la fusion.

**⛔⛔ ET LA CORRECTION À MON PROPRE AUDIT DE LA VEILLE, QUI EST LE POINT LE PLUS UTILE DE CETTE PASSE.** L'audit annonçait `#cycle-home-card` comme **ORPHELIN PROUVÉ** — *« aucun lecteur JS ni CSS, jamais rempli »*. **C'est faux.** `renderCycleHomeCard()` (tracking.js) écrit dans ses deux `<span>`, et `renderCycleScreen()` l'appelle — chemin **atteignable** par Menu > Outils > Cycle de force. 👉 ***L'audit ne l'avait pas vu parce qu'il ne mesurait QUE le chemin de l'Accueil : un élément vivant AILLEURS reste vert sur un banc borné à l'Accueil.*** ⚠️ **Et j'avais écrit cet avertissement mot pour mot dans mon propre outil de mutations**, avant de l'enfreindre dans mon tableau de verdicts. **Un vert est toujours borné à la portée de son banc, et ne conclut jamais seul.** Le conteneur **reste** : le retirer serait une **DÉCISION** (rendre son écrivain sans effet), pas un nettoyage prouvé — elle appartient à Michel.

**🧹 CE QUI EST RETIRÉ, ET RIEN D'AUTRE :**

| | ce que c'était | preuve |
|---|---|---|
| branche « Inline home pill » d'`updatePill` | **10 lignes** cherchant 3 conteneurs d'une ancienne pastille de synchro posée *dans* l'Accueil | les 3 ids **absents** de tout le dépôt ; **3 requêtes DOM sur 21 rendaient `null` À CHAQUE RENDU** |
| `#strength-levels` · `#pr-list` | deux conteneurs **vides**, `display:none` | **aucun lecteur** dans tout l'arbre (JS · HTML · CSS · tests) |
| ⛔ `#cycle-home-card` (+2 spans) | — | **GARDÉ** : il a un vrai écrivain (ci-dessus) |

⭐ **Les VRAIS identifiants — `sync-pill`, `sync-dot`, `sync-lbl`, la pastille de l'en-tête — sont intacts**, et deux témoins le figent : l'un vérifie qu'ils sont toujours nommés, l'autre **conduit la pastille dans ses deux états** et lit ce qu'elle affiche. *Une suppression voisine d'un code vivant se prouve sur le voisin, pas seulement sur le disparu.*

**📉 MESURE : 21 requêtes DOM → 18, dont 3 vaines → 0.** ⚠️ **Et le temps de rendu ne bouge pas de façon lisible** (4,9 → 4 ms à froid, 3 → 2 ms à chaud) : **on ne revendique aucun gain**, c'est dans la dispersion des mesures — consigne explicite de Michel.

**⭐⭐ LES TÉMOINS D'ABSENCE SONT DOUBLÉS D'UN TÉMOIN DE PRÉSENCE, ET CE N'EST PAS DÉCORATIF.** Un témoin qui vérifie qu'une chose *n'est plus là* reste **parfaitement vert si le rendu ne s'exécute pas du tout** — *un Accueil mort ressemble trait pour trait à un Accueil propre*. Chaque absence est donc appariée à une présence vivante : la carte de récup rendue, la pastille qui réagit, l'écrivain du conteneur cycle qui écrit encore vraiment.

**⚠️⚠️ ET LE CONTRÔLE NÉGATIF A TROUVÉ UNE ÉTIQUETTE FAUSSE — LA MIENNE, ENCORE.** J'avais classé « vert attendu » une mutation qui remet un nom mort dans une **`const` de premier niveau**. Elle est sortie **rouge**, et le témoin avait raison : *une `const` qui s'exécute est du CODE, pas de la documentation*. ⛔ **Rendre le témoin aveugle aux chaînes pour la faire passer l'aurait rendu aveugle à `getElementById('home-sync-dot')`**, qui vit exactement de la même façon — dans une chaîne. La preuve « on mesure le code, pas le texte » est portée par les **quatre vraies** : les noms retirés cités dans un commentaire **JS**, **HTML**, **CSS**, ou dans un fichier de **documentation**. ⭐ **Elle était indispensable ici** : la raison du retrait (**R30**) *nomme* justement les identifiants retirés — un témoin qui lirait le fichier brut resterait vert **pour toujours**, quoi qu'on remette dans le code. Le nettoyeur de commentaires a d'ailleurs dû apprendre `<!-- -->` : sans ça mon témoin rougissait sur un dépôt **parfaitement propre**, en mesurant ma propre documentation.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun bouton n'apparaît, aucune valeur affichée ne bouge : trois requêtes qui rendaient `null` cessent de partir, et deux conteneurs vides et invisibles disparaissent. ⚖️ *Ce qui change vraiment pour Michel — les quatre corrections de ft-v1219 — a déjà son entrée ; ici elles arrivent simplement **en ligne**.*

**⏭️ CE QUE ÇA NE FAIT PAS**, nommément, chacun figé par un témoin : ⛔ `_renderHomeHdr` et `#home-hdr` (orphelin **probable**, et un témoin en dépend → **passe R30 à part**) · ⛔ `renderRecoveryCard` et `#recovery-card` (la mesure manquante est une **vraie sauvegarde de sommeil par l'interface**) · ⛔ `openPlateCalc` · ⛔ les 47 fonctions de catégorie C · ⛔ `fmt()` · ⛔ la base neutre **70** · ⛔ `_nuitsRecentes` · ⛔ la dette « dernière pesée » · ⛔ les 55 classes CSS candidates · ⛔⛔ **la palette, `--t3` comprise** — son contraste de **3,70 < 4,5** sur les petits textes gris est une **recommandation séparée**, pas un correctif glissé ici · ⛔ **Nutrition, douane, journal alimentaire : 0 ligne**.

Tests : **bloc B-CCCXX** — 11 témoins au **rendu réel** (dont le comptage des requêtes DOM, mesuré en instrumentant `getElementById` pendant `renderHome`, *parce que la seule preuve qu'une requête ne PART plus se prend à l'exécution, pas dans un fichier*) et **6 témoins de source**, dans `tests/parcours/accueil_mini.js`. ⛔ **CONTRÔLE NÉGATIF : 19 mutations sur un arbre CLONÉ, 19 conformes**, contrôle sain **54 OK / 0 rouge avant ET après**.

Fichiers : `screens.js`, `index.html`, `tests/parcours/accueil_mini.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. ⛔ **Ni `app.js`, ni `state.js`, ni `tracking.js`, ni `coach.js`, ni `log.js`, ni `setup.js`, ni `style.css`, ni `supabase.js`, ni `Code.js`, ni `worker.js`.** sw.js ft-v1220. |

**ft-v1219 — 🏠 LE MINI-CHANTIER ACCUEIL · QUATRE CORRECTIONS D'INTERFACE, ZÉRO FONCTIONNALITÉ NOUVELLE** — Michel enchaîne sur l'audit du matin avec une borne nette : ⛔ ***« je ne veux PAS ajouter de nouvelle fonctionnalité »*** · ⛔ ***« ne déplace pas aveuglément tout l'écran, je veux un changement minimal »*** · et la phrase qui décide du point ② : ***« l'utilisateur doit voir son ÉTAT avant qu'on lui demande de répondre à quelque chose »***.

**⛔⛔ ① « NaN kg » S'AFFICHAIT SUR 100 % DES COMPTES NEUFS — ET LE TIRET ÉTAIT PRÉVU, IL N'ATTEIGNAIT JAMAIS L'ÉCRAN.** `bwDisp` vaut déjà `'—'` quand rien n'est pesé (`load()` fait `parseFloat(…)||0`) ; c'est `fmt('—')` qui fabriquait le NaN — `Math.round('—'*10)/10`. ⛔ **`fmt()` N'EST PAS TOUCHÉE**, et c'est la consigne explicite de Michel : elle arrondit un **nombre**, elle fait correctement son métier, et elle a beaucoup d'autres appelants. *Un garde posé chez le propriétaire change le contrat de tous ses lecteurs* — c'est **l'appel** qui est gardé. ⭐ Au passage il attrape une valeur non numérique venue d'un import (`'84,5'`), qui rendait NaN elle aussi.

| état du compte | avant | après |
|---|---|---|
| neuf, aucune pesée | ⛔ **NaN kg** | ✅ **— kg** |
| poids du profil seul | 84 kg | 84 kg |
| une pesée · plusieurs pesées | 79.4 kg | 79.4 kg |
| après suppression de toutes les pesées | ⛔ **NaN kg** | ✅ **— kg** |
| valeur importée « 84,5 » | ⛔ **NaN kg** | ✅ **— kg** |

**⭐⭐ ② LA CARTE DE RÉCUP PASSE DEVANT LES SOLLICITATIONS — UNE SEULE LIGNE DÉPLACÉE, ET LA RAISON EST EN PIXELS.** Mesuré sur iPhone 390 × 844, compte réaliste : `home-milo` **170 px** + `home-obs` **182 px** occupaient le haut, et la carte de récup commençait à **y = 573** — donc **coupée**. *Le chiffre qui répond à « est-ce que je peux m'entraîner aujourd'hui ? » n'était jamais visible sans faire défiler, pendant que deux demandes, elles, l'étaient entièrement.*

| bloc | top AVANT | top APRÈS |
|---|---|---|
| **`home-hero` (récup)** | ⛔ **573 — coupé** | ✅ **84 — entier** |
| `home-milo` | 84 | 392 |
| `home-obs` | 254 | 562 |
| `home-stats` · `home-secondary` | 878 · 967 | 881 · 970 |

⛔ **L'ordre relatif de TOUS les autres blocs est inchangé** — `home-souvenir` reste immédiatement sous `home-milo` (*« un souvenir ne passe pas devant une relance »*, sa propre décision), et les blocs du bas gardent leur suite. ⚠️ **CE QUE ÇA NE RÈGLE PAS, ET C'EST DIT** : `home-daystate` (« comment tu te sens aujourd'hui ? ») est lui aussi une question et reste **après** les sollicitations ; il devient coupé à son tour. Le déplacer était le geste **suivant**, pas celui-ci — décision rendue à Michel.

**⛔⛔ ③ L'ACCUEIL N'AFFIRME PLUS « BONNE RÉCUPÉRATION » À QUELQU'UN QUI NE LUI A JAMAIS RIEN DIT.** Mesuré sur un compte neuf : score **67**, et ses **seuls facteurs** sont `Récup de base 70` et `Âge -3`. *Rien du corps de la personne n'y entre* — la base neutre est une convention de calcul, l'âge une constante de profil. L'écran annonçait pourtant « Bonne récupération — séance normale possible » (**Principe 18** : ne jamais faire semblant de savoir).

⭐ **LE MOTEUR N'EST PAS TOUCHÉ, ET C'ÉTAIT LA CONSIGNE** : la base 70 est une décision écrite (*« le score reste fonctionnel pour tout le monde »*) que d'autres lecteurs emploient. On ne change pas le **calcul**, on change ce que l'Accueil ose **affirmer**. ⭐⭐ **Et le critère n'est pas inventé : c'est celui que l'app s'applique déjà ailleurs.** `recupHistorique` refuse de tracer un point avant la première nuit ou la première séance, pour cette raison mot pour mot (*« une invention présentée comme une mesure »*). ⚠️ **Avec une différence assumée** : on lit **`_nuitsRecentes`**, propriétaire unique de « que sait-on de cette nuit-là » (**R2**) — il voit **aussi** les nuits mesurées par la montre, que `recupHistorique` ignore encore. *Sans ça, quelqu'un dont la seule donnée est une nuit de sa montre (score 73, **mesuré**) aurait vu « — » : on aurait effacé une vraie mesure.* ⭐ Et le bandeau **« gêne du jour » survit au silence** : une douleur signalée est un **fait déclaré**, pas un score deviné.

**👆 ④ LA ZONE TAPABLE DE « POURQUOI CE SCORE ? » : 124 × 17 → 144 × 43.** On n'agrandit pas le texte, on agrandit la **zone** — `padding` pour la surface, `margin` négative de la même quantité pour que l'écran **ne bouge pas d'un pixel**. ⛔ **La marge haute est bornée à −9 px, et ce n'est pas un chiffre rond** : c'est exactement le `margin-top:9px` de la rangée, donc l'espace **vide**. Aller plus haut ferait déborder la zone sur la ligne des facteurs — *un bouton invisible par-dessus un texte qui n'en est pas un* : on taperait « 🏋️ Séance récente −3 » et une fiche s'ouvrirait. **On prend la place libre, jamais celle d'un voisin.**

**📌 ⑤ LA DETTE R2 DE « LA DERNIÈRE PESÉE » EST CONFIRMÉE — ET LAISSÉE OUVERTE EXPRÈS.** Michel : *« NE refactore pas automatiquement. D'abord, confirme la duplication »* · *« si ça peut être fait sans risque… sinon LAISSE OUVERT »*. **Confirmée** : `slice().sort(desc)[0]` est retapé **4 fois** (`screens.js` la tuile · `tracking.js` le pré-remplissage, le graphique, l'import), et un **cinquième** lecteur répond autrement (`S.weightLog[0].kg`, qui se fie au tri en place). ⛔ **Non centralisée, et la raison compte** : les 4 copies **n'ont pas le même contrat** — l'une rend l'entrée, l'autre le kilo, l'autre un repli sur `S.bw`, la dernière rien. *Un propriétaire qu'on crée sans éprouver ses lecteurs déplace le bug, il ne le corrige pas.* L'inventaire est **écrit dans le code**, à côté de ce qu'il concerne (**R27**), et un témoin fige qu'il y reste (**R30**).

**📣 RÈGLE D'OR #11 — RIEN, ET LA RAISON EST PESÉE PLUTÔT QU'EXPÉDIÉE.** Deux choses bougent pourtant à l'écran : un « NaN » devient un tiret, et la carte de récup **remonte**. ⚖️ Or les points 2 à 5 sont dus **à une FEATURE** : ici il n'y en a aucune — aucun écran, aucun bouton, aucun réglage, aucune donnée nouvelle. ⛔ **Et surtout rien ne DISPARAÎT et rien n'est à FAIRE** : la carte devient **plus** visible, pas moins, et le tiret remplace un défaut que personne n'a jamais demandé à comprendre. *Annoncer « votre carte de récup est maintenant plus haut » serait du bruit* (**R24/R25** : le format incite, il n'encombre pas) — et un point rouge qui pointe une chose qu'on voit déjà mieux use le mécanisme pour les fois où il compte. ⚠️ **Dit franchement, parce que c'est un jugement et pas une évidence** : si Michel préfère un mot dans le Guide, c'est une ligne à ajouter — mais je ne la pose pas de moi-même sur une correction.

**🔴 RÈGLE D'OR #9** : le bouton central est **mesuré**, pas regardé — `56 × 44` en `139,792`, **identique**. ⭐ Et le témoin le compare **à lui-même sur un autre onglet** plutôt qu'à une valeur en dur, *qui deviendrait fausse au premier changement de viewport du banc sans que le bouton ait bougé*.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **Nutrition, douane, `foodLog` : 0 ligne** (`app.js` n'est pas touché) · ⛔ le **moteur de récupération** est intact, base 70 comprise · ⛔ le **calendrier**, la tuile « Séances », le rappel des 90 min, le bouton « Reprendre la séance » : intacts, chacun figé par un témoin · ⛔ **aucune fonctionnalité ajoutée**, aucun écran nouveau, aucun réglage · ⛔ ni `state.js`, ni `coach.js`, ni `log.js`, ni `setup.js`, ni `Code.js`, ni `worker.js`. ⚠️ **Coût de rendu inchangé** : 6,1 → 6,7 ms à froid, 1,6 → 2,0 ms à chaud — *dans la dispersion des mesures, donc on ne revendique aucun gain ni aucune perte*.

**⚠️⚠️ ET UN TÉMOIN ÉTAIT AVEUGLE — QUATRIÈME FOIS DE CE PROJET, MÊME FAMILLE.** Mon garde de périmètre cherchait `im>=90` pour prouver que le rappel « ta séance est encore ouverte » n'avait pas bougé. La mutation qui porte le seuil à **`im>=9000`** — c'est-à-dire qui **éteint** le rappel — le laissait **parfaitement vert**, puisque *« im>=90 » est contenu dans « im>=9000 »*. 👉 ***Un motif qui cherche une PRÉSENCE ne mesure pas une VALEUR.*** Fermé par la parenthèse. (Familles `presentsX` de ft-v1207, `needsCode2` de ft-v1216, `BLOC CCCX` de ft-v1212.) ⚠️ Et une de mes mutations avait une **ancre à 3 occurrences** : elle s'annonçait « invalide » au lieu de mentir, ce qui est le bon comportement — *une mutation qui ne s'applique pas ressemble trait pour trait à une mutation qui ne mord pas*.

**⛔⛔ ET LA PASSE COMPLÈTE A ATTRAPÉ CE QU'AUCUN PETIT BANC NE POUVAIT VOIR — c'est l'argument du protocole, payé cash.** Le bloc **CCXXXVII** (ft-v1132, *« le conseil 💡 passe sous le bouton »*) fabriquait son conseil en **VIDANT le sommeil** : la base neutre 70 produisait alors un score, donc des facteurs, donc le conseil. Avec la correction ③, *aucune nuit ET aucune séance enregistrée* ne produit plus de chiffre — **le bloc rougissait sur du code parfaitement sain**, 4 rouges sur une passe de 4 237 témoins. ⭐ **Sa GARANTIE n'a pas bougé d'un pouce** (le bouton vient AVANT le conseil) : c'est la **recette** du conseil qui change — on ajoute une séance **ENREGISTRÉE**, ce qui décrit d'ailleurs un vrai cas, *quelqu'un qui s'entraîne et ne note jamais ses nuits*. ⚠️ **Et le piège est nommé sur place** : `S.wkt` (séance **en cours**) ne suffit pas — le score ne parle que de ce qui est **fini**. ⭐⭐ **Puis le bloc a été RE-ÉPROUVÉ par une 19ᵉ mutation** (le conseil remonte au-dessus du bouton) : **il mord toujours, 2 rouges**. 👉 ***Une fixture qu'on change doit être ré-éprouvée, sinon on transforme un témoin en vert qui ne peut plus rougir*** — c'est exactement la faute que ft-v994 avait payée, appliquée cette fois au test de quelqu'un d'autre.

Tests : **blocs B-CCCXVIII (21 témoins à l'écran) et B-CCCXIX (16 témoins de source)**, posés dans **`tests/parcours/accueil_mini.js`** — même patron que `identite_ligne.js` la veille, pour que le contrôle négatif les rejoue en **secondes** au lieu de relancer une passe de quarante minutes. ⛔ **CONTRÔLE NÉGATIF : 18 mutations sur un arbre CLONÉ, 18 conformes** (+ une **19ᵉ**, ciblée sur le bloc dont j'ai changé la fixture), contrôle sain **37 OK / 0 rouge avant ET après** — dont ⭐ **une qui doit RESTER VERTE** : ajouter un simple **commentaire** citant `fmt`, `NaN`, `wScore=70` et `home-hero`. *C'est la seule façon de prouver qu'on mesure le CODE et non la documentation* — et les commentaires de cette passe citent abondamment tout ce que les témoins cherchent. ⭐ **Et 18 des 37 témoins rougissent sur l'arbre d'avant** : chacune des quatre corrections est couverte des deux côtés.

Fichiers : `screens.js`, `index.html`, `tests/parcours/accueil_mini.js` (nouveau), `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. ⛔ **Ni `app.js`, ni `state.js`, ni `tracking.js`, ni `coach.js`, ni `log.js`, ni `setup.js`, ni `supabase.js`, ni `Code.js`, ni `worker.js`.** sw.js ft-v1219. |

**ft-v1218 — 🔑 L'IDENTITÉ D'UNE LIGNE DU JOURNAL ALIMENTAIRE · ON NE REND PAS `ts` UNIQUE, ON SÉPARE LE TEMPS DE L'IDENTITÉ** — Michel part du dossier `MESURE-T01-TS-REJOUER-REPAS` mesuré le matin même, et pose la borne qui décide de tout : ⛔ ***« je ne veux PAS uniquement : mettre `Date.now()+i` et passer à autre chose »*** · ***« je veux d'abord vérifier l'architecture de l'identité d'une ligne du journal »*** · ***« `ts` joue actuellement DEUX rôles : horodatage ; identifiant de ligne. Ces deux notions ne devraient probablement pas être confondues. »***

**⛔⛔ LE BUG N'EST PLUS UNE HYPOTHÈSE, ET SES DEUX MOITIÉS N'ÉTAIENT PAS D'ACCORD ENTRE ELLES.** `rejouerRepas` écrit ses lignes dans une boucle **synchrone** : plusieurs `Date.now()` tombent dans la même milliseconde, donc plusieurs lignes portent le **même `ts`** — **9 exécutions sur 9**, jusqu'à **5 lignes sur 5**. Or `ts` était la **seule poignée** de l'interface.

| geste, mesuré par clics réels | avant | après |
|---|---|---|
| cliquer la 2ᵉ ligne (« OEUF ») | ⛔ ouvre et modifie **« PAIN »** | ✅ **« OEUF »** |
| cliquer la croix de « JUS » | ⛔ annonce **« PAIN sera retiré »** | ✅ **« JUS sera retiré »** |
| …puis valider | ⛔ **3 lignes sur 3** supprimées | ✅ **1** |

⭐⭐ ***`confirmRemoveFood` ANNONÇAIT avec `find` (une ligne) pendant que `removeFoodEntry` AGISSAIT avec `filter` (toutes).*** Un écran de confirmation qui annonce une ligne et en efface trois est **plus dangereux qu'une suppression sans confirmation** : il fait valider en toute confiance.

**⭐⭐ LE CHOIX D'ARCHITECTURE EST TRANCHÉ PAR UN USAGE RÉEL, PAS PAR UNE PRÉFÉRENCE.** L'inventaire des **23 usages** de `foodLog[].ts` sépare nettement **8 usages temporels** (aucun ne suppose l'unicité) et **10 usages d'identité** (tous la supposent). 👉 ***C'est `_profilAlimentaire` qui décide*** : il lit **l'HEURE** du `ts` (`new Date(e.ts).getHours()`) pour deviner les horaires de repas. *Un `ts` gonflé d'un compteur serait un horodatage qui ment — et le mensonge, de quelques millisecondes, serait invisible donc jamais corrigé.* **Option A écartée**, avec la raison qui compte : *elle n'évite pas la migration des lignes déjà en collision, elle la laisse simplement non faite.*

**⭐ LE NOM DU CHAMP N'EST PAS CHOISI AU HASARD** (consigne explicite) : c'est **`id`**, déjà la convention du projet pour l'identité d'un enregistrement — `S.sessions` porte `{id, ts}` et ses lecteurs font `s.ts||s.id`. ⚠️ Et `sourceId` ne crée aucune ambiguïté : il identifie le **PRODUIT** (`off:3021690201123`), pas la ligne.

**⛔ FABRIQUÉ PAR `crypto.randomUUID`, SINON `crypto.getRandomValues` — JAMAIS `Math.random`.** ⭐ **Et aucun repli sur l'horloge** : sans source aléatoire on rend `null` et l'appelant s'en aperçoit, plutôt que d'inventer une identité qui pourrait percuter. *On échoue FERMÉ.* Le repli n'est pas décoratif : `crypto.randomUUID` demande **Safari 15.4+** et un contexte sécurisé.

**⛔⛔ L'IDENTITÉ NE PASSE PAS PAR `_provFood`, ET C'EST LA LEÇON LA MIEUX PAYÉE DU PROJET.** Cette fonction est une **liste blanche** qui porte **trois avertissements en majuscules** disant qu'un champ qu'elle ne recopie pas *n'atteint jamais l'entrée enregistrée* — c'est arrivé **trois fois** (`etat`, `codeDouteux`, `q`/`u`). *Une identité qui n'arrive pas est exactement le bug qu'on corrige.* Elle est donc posée **dans le littéral**, à côté de `ts`.

**⭐⭐ LA COMPATIBILITÉ DES ANCIENNES LIGNES N'EST PAS UN DRAPEAU « MIGRATION FAITE » — c'est la décision centrale du chantier.** La restauration cloud remplace `S.foodLog` **en entier**, **après** le chargement : de vieilles lignes peuvent revenir **des mois** plus tard. *C'est mot pour mot le piège de `ft4_stmig1` sur les types de série, écrit dans le journal de ft-v1213.* 👉 Le mécanisme est **idempotent** et rejoué **au chargement · à la fusion · avant CHAQUE RENDU du journal**. ⭐ ***L'identité est posée là où la ligne devient cliquable*** — le rendu est le dernier endroit par lequel toute ligne éditable ou supprimable doit passer ; sans lui, une ligne restaurée n'aurait **aucune poignée** : ni éditable, ni supprimable. ⛔ **Il écrit EXACTEMENT une chose, `l.id`** — un témoin compte les affectations. `ts` reste **123** sur les lignes historiques, aucune macro, aucune date, aucune portion, aucune provenance ne bouge.

**⭐ ET IL EXIGE L'UNICITÉ, PAS LA PRÉSENCE** : un `id` en double est **réattribué**. *Sans ça on rejouerait le bug exact qu'on corrige, avec une autre clé.* ⚠️ **Ce cas n'était couvert par AUCUN témoin** — c'est une mutation qui l'a trouvé.

**⭐ LA SUPPRESSION RETIRE UN ÉLÉMENT PAR CONSTRUCTION** : `findIndex` + `splice` au lieu de `filter`. *Un `filter` retire tout ce qui correspond — la leçon du bug est là : ne pas rendre la clé unique et garder l'outil qui suppose qu'elle ne l'est pas.*

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun bouton n'apparaît, aucune valeur ne bouge : **instantané identique octet pour octet** avant/après sur un journal représentatif de 8 lignes (manuelle · CIQUAL · code-barres · portion nommée · sans `per100` · ancien format · repas rejoué en collision) — données métier `986fa5dc5383b41b`, **ce que l'écran affiche** `05bf9e94932c2dc5`, totaux, verdict de la douane ligne par ligne, **empreinte globale `09d4c259481839b4`**. Seule différence : 0 → 8 identités.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **la douane est intacte** — 21 règles dont 9 `INVALID`, 4 écrivains, aucun seuil, aucune règle devenue bloquante · ⛔ **la signature de fusion multi-onglets n'emploie NI `ts` NI `id`**, et c'est une décision : deux onglets qui notent la même chose produisent deux `id` **différents**, donc une signature sur l'identité **créerait** le doublon que la fusion évite — *la preuve que le champ est une identité locale, pas une clé métier* · ⛔ `savedFoods`, Supabase, sécurité, scanner, Milo, `per100`, `ml`, `estimateFoodAI`, provenance du rejeu : **0 ligne** · ⛔ `saveEditFood` **ne fabrique pas** d'identité (il édite **en place**) — *une ligne qu'on corrige reste la même ligne*, figé par témoin (R30). ⚠️ **Non mesurable d'ici** : combien de lignes à `ts` double existent déjà chez Michel (c'est dans son `localStorage`) — mais elles sont **protégées**, c'est le cas 2.

**⚠️⚠️ ET LE CONTRÔLE NÉGATIF A TROUVÉ QUATRE VERTS, DONT UN SEUL ÉTAIT UN VRAI TROU — les quatre valent d'être dits.** ① *la compatibilité écrase une macro* → **verte parce que mes fixtures n'avaient que des entiers** (260, 150, 90) : un arrondi ne changeait rien. ***Ma MUTATION était faible, pas le témoin*** — les vraies données ont des virgules, fixtures corrigées. ② *un `id` en double n'est plus réattribué* → **vrai trou**, aucun témoin ne couvrait ce cas ; il existe maintenant. ③ *`removeFoodEntry` redevient un `filter`* → **sémantiquement équivalent sur des données saines**, et je le dis franchement : c'est de la défense en profondeur, donc c'est un témoin de **SOURCE** qui la fige, pas un témoin de comportement. ④ *un écrivain cesse de poser l'identité* → **le filet du rendu fait son travail**, ce qui est un bon résultat — mais la ligne part alors **au cloud sans identité** (`rejouerRepas` synchronise **avant** de rendre), d'où trois témoins de source par écrivain. 👉 ***Un contrat qu'aucun témoin ne tient finit par être oublié par le prochain écrivain.***

**⚠️⚠️ ET TROIS DÉFAUTS D'INSTRUMENT, TOUS À MOI.** ① ⭐⭐ **mon attendu venait du TABLEAU, pas de l'ÉCRAN** : le journal trie par `ts` décroissant, donc le rang dans `S.foodLog` n'est pas le rang affiché — **ma sonde annonçait « mauvaise ligne » sur un comportement juste**. ② **mon sélecteur de croix attrapait aussi le bouton « Supprimer » de la MODALE**, qui reste dans le DOM une fois refermée : *le banc mesurait mon sélecteur, pas le produit*. ③ ⛔ **une mutation faisait PLANTER la sonde au lieu de la faire rougir**, qui affichait « CRASH » — ***une passe interrompue ressemble trait pour trait à une passe verte*** (`BUGS.md` §61, ma propre règle) ; chaque geste rend désormais `false` et une étape interrompue compte un rouge.

**⭐ ET 25 TÉMOINS EXISTANTS DU BANC APPELAIENT `openEditFood(ts)` EN DIRECT.** La tentation était de faire accepter **les deux clés** à `openEditFood` pour ne rien toucher. ⛔⛔ **Refusé** : un repli sur `ts` rend la **PREMIÈRE** ligne du groupe — ç'aurait rouvert la porte exacte qu'on ferme. **Un convertisseur vit dans le BANC, pas dans le produit.**

**⚠️ ET J'AI ÉDITÉ UN FICHIER SERVI PENDANT QU'UNE PASSE TOURNAIT** — `BUGS.md` §60, la règle que j'ai moi-même écrite. La passe a été **jetée et relancée à neuf** : *une règle qu'on contourne parce qu'on a la preuve que c'était sans danger cette fois-ci n'est plus une règle.*

Tests : **blocs B-CCCXIV (21 témoins de source) et B-CCCXV (10 témoins par CLICS RÉELS)**, plus une sonde de 42 témoins hors dépôt couvrant les 15 tests demandés. ⛔ **CONTRÔLE NÉGATIF : 19 mutations sur un arbre CLONÉ, toutes mordent**, contrôle sain à 0 rouge **avant ET après** — dont **les 5 nommées par Michel** : ① deux lignes au même identifiant → **25** · ② `openEditFood` reprend `ts` → **8** · ③ `removeFoodEntry` supprime par `ts` → **4** · ④ `confirmRemoveFood` nomme une autre ligne → **3** · ⑤ la compatibilité retirée.

Fichiers : `app.js`, `screens.js`, `state.js`, `tests/parcours/runner.js`, `tools/instantane_foodlog_identite.js` (nouveau), `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. ⛔ **Ni `log.js`, ni `coach.js`, ni `tracking.js`, ni `setup.js`, ni `index.html`, ni `Code.js`, ni `worker.js`.** sw.js ft-v1218. |

**ft-v1217 — 🗄️ LES JUSTIFICATIFS NE FRANCHISSENT PLUS LA PORTE SUPABASE · ET LA FUITE LA PLUS ANCIENNE N'EST PAS CELLE QU'ON VIENT DE TROUVER** — S2-A, ouverte par Michel après le dossier d'audit : ⛔ ***« arrêter immédiatement toute NOUVELLE fuite de credential vers Supabase »*** · ⛔⛔ ***« je ne veux PAS deux snapshots métier séparés qui finiront par diverger »***.

**⭐⭐ LA CAUSE N'EST PAS UN OUBLI, C'EST UNE DÉCISION JUSTE APPLIQUÉE À UN ENDROIT DE TROP.** Le corps de sauvegarde est **construit une fois et servi aux DEUX destinations** — c'est **R2**, et c'est juste : deux constructions séparées divergeraient. S1 y a ajouté `token` et `authCode` pour authentifier Apps Script. 👉 ***Le miroir Supabase les a reçus par la même occasion.*** Apps Script, lui, ne les écrit jamais (liste blanche de **58 champs**) ; Supabase recevait le **blob entier**.

**⭐ LA CORRECTION NE CASSE PAS R2, ELLE LE PRÉCISE** : on ne duplique pas le corps métier, on en **retire** les justificatifs et on les ajoute au **seul transport qui en a besoin**. *Un justificatif de transport n'appartient pas aux données de la personne.*

| | transport Apps Script | miroir Supabase |
|---|---|---|
| jeton S1 · code perso | présents (justificatifs) | ⭐⭐ **absents** |
| persisté côté serveur | ⛔ **non** — 58 champs nommés | le blob est écrit tel quel |
| données métier | identiques | ⭐⭐ **identiques, à l'octet près** |

**⭐⭐ LA PREUVE EST UNE ÉGALITÉ STRICTE, PAS UNE INSPECTION** : le corps envoyé à Apps Script **privé des deux justificatifs** est égal caractère pour caractère au blob Supabase, et la seule différence entre les deux corps est exactement cette paire. Les **16 catégories métier** sont intactes, contenu compris.

**⚠️⚠️ ET LES DATES, LUES DANS GIT, INVERSENT L'INTUITION.** Le jeton — la trouvaille spectaculaire — n'a fuité que depuis **S1**, soit **une seule version servie**. Le **code perso**, lui, part en clair **depuis le 04/08**, jour de naissance du miroir : il était **déjà** dans le corps commun quand on a branché Supabase dessus. 👉 ***La fuite la plus ancienne n'est pas celle qu'on vient de trouver — six semaines contre une journée.*** ⭐ Borne honnête : l'exposition ne concerne que les comptes ayant **posé** un code (il est optionnel).

**⭐ TROIS VERROUS, ET ILS NE FONT PAS LE MÊME TRAVAIL** : la **cause** (`_cloudSync` ne porte plus rien) · le **filet** (`sbMirror`, porte UNIQUE, retire par **nom de clé** quel que soit l'appelant futur) · les **témoins de source** (bloc **B-CCCXIV**).

**⛔⛔ ET C'EST LE CONTRÔLE NÉGATIF QUI A PROUVÉ QUE LES TROIS SONT NÉCESSAIRES.** Quatre mutations — remettre le code perso dans le corps métier, le faire passer par un **alias**, vider la liste du filet, ne jamais appeler le filet — laissaient le banc de comportement **parfaitement vert** : le filet rattrape, donc la sortie reste juste. 👉 ***Un banc qui n'observe que la SORTIE ne peut pas voir la CAUSE regresser quand un filet la rattrape.*** Le harnais conduit désormais le banc **et** les témoins.

**⭐⭐ ET UNE MUTATION A SURVÉCU MÊME À ÇA.** Un `Object.assign` glissé **après** l'envoi Apps Script échappait à tout garde de **position**. L'invariant juste n'est pas « où », c'est **« combien »** : chaque justificatif est lu **exactement une fois** dans `_cloudSync`. *Un alias, une copie, un détour : le compte monte à 2 et le témoin rougit, quel que soit le déguisement.* ⚠️ Au passage, mon garde de transport figeait l'**ordre des clés** — il aurait rougi sur une permutation, donc sur du code juste.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucune valeur affichée ne bouge, aucune donnée métier ne disparaît : deux champs cessent de voyager vers une destination qui n'en avait pas besoin.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔⛔ **les lignes DÉJÀ écrites dans Supabase ne sont pas purgées** — le SQL de `ft_miroir` n'est **nulle part dans le dépôt** (aucune migration, créée à la main), donc *on ne sait pas s'il remplace la ligne ou empile un historique* ; si c'est un remplacement, la purge se fait seule à mesure que les gens sauvegardent. **Dashboard requis.** · ⛔⛔ **V2 (`p_email` libre) reste OUVERTE** — son témoin ⑧ est **volontairement NON retourné** : *on ne maquille pas une porte ouverte* (S2-B/S2-C) · ⛔ **aucune rotation de jeton décidée** : trois options chiffrées, le choix dépend des droits réels sur la table, et *décider maintenant serait deviner* · ⛔ Nutrition **0 ligne** (`app.js` et `index.html` non touchés), Worker et `Code.js` non touchés. ⚠️ **Michel doit vérifier sur Safari/iPhone** — en principe **rien** ne change côté écran.

Tests : **parcours 4161/4161 sur l'arbre FINAL** (blocs **B-CCCXIV** 11 témoins et **B-CCCXIII** 10, tous verts), **banc S2-A 22/22**, **banc S1 35/35**. ⛔ **CONTRÔLE NÉGATIF : 16 mutations sur arbre copié, toutes conformes — dont une qui doit RESTER VERTE** (le mot `token` dans un simple commentaire : la seule façon de prouver qu'on mesure le CODE, pas la documentation).

📄 **PDF POUR GPT** : `DOSSIER-S2A-CONFINEMENT-CREDENTIALS-16-09-2026.pdf` (**hors dépôt**, règle d'or #14), **37 gardes**, contrôle négatif **15/15**. ⚠️ **Gardé hors dépôt volontairement** : il décrit une exposition **non encore purgée**, et le dépôt est public.

Fichiers : `setup.js`, `supabase.js`, `tests/parcours/runner.js`, `tools/gen_s2_audit_pdf.py` (nouveau), `tools/gen_s2a_pdf.py` (nouveau), `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. ⛔ **Ni `app.js`, ni `index.html`, ni `worker.js`, ni `Code.js`, ni `coach.js`, ni `log.js`, ni `state.js`.** sw.js ft-v1217. |

**ft-v1216 — 🪪 L'IDENTITÉ CESSE D'ÊTRE UNE ADRESSE E-MAIL DÉCLARÉE · ET C'EST UN SEUL PROPRIÉTAIRE QUI SAUVE NUTRITION** — S1, la première correction nommée par l'audit sécurité du 15/09. Michel tranche les **4 décisions produit** qu'il s'était réservées et pose un interdit : ⛔⛔ ***« INTERDIT de faire : e-mail seul → émission automatique d'un credential fiable »*** · ⛔ ***« pas de `Math.random()` dans la chaîne d'identité »***.

**⭐⭐ LE DÉFAUT FERMÉ TIENT EN UNE PHRASE.** Partout — `saveProfile`, `pushHealth`, le Worker IA — un **e-mail fourni par le client** valait **identité authentifiée**. Conséquence mesurée à l'audit : on pouvait **écraser le compte d'autrui** si la victime n'avait pas posé de code, et **faire payer ses appels IA à quelqu'un d'autre**. Un **registre de jetons** côté serveur remplace ça.

| | avant | après |
|---|---|---|
| preuve d'identité | `email` dans la charge utile | **jeton opaque 256 bits** |
| ce que le serveur stocke | — | ⭐ **SHA-256 du jeton, jamais le brut** |
| `jeton A` + `email B` | décompté sur **B** | ⭐⭐ décompté sur **A** |
| jeton présent mais invalide | — | ⛔ **REFUSÉ** (pas de repli sur l'e-mail) |
| panne réseau du Worker | — | ⛔ **ferme** la porte |

**⭐ LE JETON N'EST ÉMIS QUE CONTRE UNE PREUVE, et l'interdit de Michel est tenu.** Deux portes seulement : la **vérification e-mail** déjà déployée et **bornée** (5 essais · expiration · 60 s de cooldown · 80/jour, soit ~400 tentatives/jour contre 10⁶) — la preuve est **consommée à l'instant même** où le jeton est émis — ou un **code perso déjà posé**. ⛔ Un e-mail seul n'en obtient **jamais**. ⭐ **Et la récupération emprunte la MÊME porte que le bootstrap** (décision de Michel) : pas de second chemin, donc pas de second trou.

**⛔ `Math.random()` SORT DE LA CHAÎNE D'IDENTITÉ.** L'audit l'avait signalé comme faiblesse *à corriger si ce chemin délivre un jeton* — il le délivre désormais. Le jeton vient de **trois `Utilities.getUuid()`**, et le code de confirmation d'un UUID lui aussi.

**⭐⭐ LA DÉCISION D'ARCHITECTURE EST CÔTÉ CLIENT, ET C'EST ELLE QUI PROTÈGE LA PROMESSE FAITE À MICHEL.** Les appels au Worker partent de **16 endroits dans 4 fichiers**, dont **5 sont Nutrition** (`foodLabel` · `readBarcode` · `estimateFood` · `generateMealPlan` · `importMealPlan`). Les modifier un par un aurait ouvert `app.js` en plein chantier Nutrition **gelé**. Un **injecteur unique** posé dans `constants.js` ajoute le jeton aux appels du Worker : ⛔⛔ **Nutrition = 0 ligne**, et un témoin épingle que `token:_ftToken()` n'apparaît **au plus qu'une fois** dans `app.js` — *si le chantier avait débordé, il rougirait*. C'est **R2** appliqué au transport : une information, un propriétaire.

**⏳ LA FENÊTRE DE TRANSITION EST UN CHOIX DE MICHEL (option B), PAS UN COMPROMIS TECHNIQUE.** Sans jeton, l'ancien chemin fonctionne encore ; un compteur **anonyme** (aucune adresse) mesure la bascule ; **`_MIG_FERME_ = false`** la fermera **à la date qu'il décidera**. 👉 *Personne n'est mis dehors* — et c'est **le seul interrupteur** à basculer pour clore S1.

**⛔⛔ `V2 RESTE OUVERTE JUSQU'À S2`, ET ON NE MAQUILLE PAS.** `ft_miroir` reçoit toujours un `p_email` **libre** depuis le navigateur : le fermer impose de faire entrer le Worker dans ce chemin, c'est **S2**. ⭐ Le témoin ③ est **volontairement NON retourné** pour le dire — *un témoin qui affirme ce qu'on aurait aimé lire ne protège rien*.

**⚠️⚠️ ET QUATRE DE MES GARDES ÉTAIENT FAUX — TROIS REFUSAIENT DU TRAVAIL JUSTE.** Le générateur du dossier a refusé de sortir **quatre fois sur du code parfaitement sain** : ① le garde `Math.random()` rougissait **à cause du commentaire qui DOCUMENTE son retrait** — R30 exige de l'écrire à sa place, donc le mot reste dans le fichier (*un garde qui ne distingue pas le CODE de ce qui en PARLE mesure la documentation*, famille ft-v1193/1203/1205/1210) · ② le garde « le jeton brut n'est pas stocké » attrapait le `brut` passé **à la fonction de hachage** (*un garde plus strict que la contrainte réelle refuse du travail juste*, ft-v1214) · ③ une borne en **caractères** ne pouvait pas franchir le `;` posé entre deux instructions (**§63**) · ④ ⭐⭐ **deux gardes AVEUGLES au piège de la SOUS-CHAÎNE** : renommer `_ftPoserInjecteurJeton` en `…JetonX` les laissait **parfaitement verts**, puisque l'ancien nom est contenu dans le nouveau — famille `presentsX`/`needsCode2`, **3ᵉ fois** dans ce projet, fermés sur leur forme déclarative.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun bouton n'apparaît, aucune valeur affichée ne bouge : le jeton est posé et transporté sans que la personne ait un geste à faire. ⚖️ **Pas de pop-up `WHATS_NEW`** — rien à *faire*, aucun repère n'a bougé.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **S2** (fermer le miroir Supabase) · ⛔ **S3** (l'idempotence du débrief, qui se construit DESSUS) · ⛔ `deleteAccount` · ⛔ la vérification **Premium serveur** · ⛔ les e-mails réels dans le dépôt · ⛔ **aucun `accountId`** (migration disproportionnée — la table de jetons sert de point d'indirection) · ⛔ Nutrition, `foodLog`, douane, scanner, `savedFoods`, migration Supabase principale, paiement, natif. ⚠️ **Michel doit vérifier sur Safari/iPhone** — en principe **rien** ne change côté écran, et c'est précisément ce qu'il y a à vérifier. ⚠️ **Fenêtre de déploiement dite plutôt que masquée** : `worker.js` et `Code.js` se déploient **en parallèle**, donc Milo peut répondre 401 pendant ~1 min si le Worker part le premier — bref, auto-résolu, **aucune perte**.

Tests : **parcours 4150/4150 sur l'arbre FINAL** (bloc **B-CCCXIII**, 10 témoins dont **5 RETOURNÉS** au lieu d'être supprimés — R30), **banc S1 35/35**. ⛔ **CONTRÔLE NÉGATIF : 20 mutations, 20 mordent par LEUR garde**, contrôle sain **0 rouge avant ET après**, sur un arbre **copié**.

📄 **PDF POUR GPT** : `DOSSIER-S1-IDENTITE-SERVEUR-FINAL-16-09-2026.pdf` (**hors dépôt**, règle d'or #14), **60 gardes**. ⭐ Le miroir exact du générateur précédent : celui-là refusait de produire si S1 était **déjà** fait, celui-ci refuse si une pièce **manque**.

Fichiers : `Code.js`, `worker.js`, `constants.js`, `app.js`, `setup.js`, `tests/parcours/runner.js`, `tools/gen_s1_final_pdf.py`, `sw.js`, `CLAUDE.md`, `docs/DOSSIER-S1-IDENTITE-SERVEUR-FINAL.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/INVENTAIRE.md`. ⛔ **Ni `index.html`, ni `log.js`, ni `coach.js`, ni `state.js`, ni `supabase.js`, ni `screens.js`, ni `tracking.js`.** sw.js ft-v1216. |

**ft-v1215 — 🔒 CE N'ÉTAIT PAS UN VERROU MANQUANT, C'ÉTAIT UN ÉTAT · ET LA SÉANCE CESSE D'ÊTRE DEVINÉE** — phase 1 du chantier débrief, validée par Michel après le dossier de mesures : ⛔ ***« pour CETTE passe, tu ne fais QUE l'étape 1 »***.

**⭐⭐ A — LE DOUBLE DÉBRIEF : LA CAUSE N'ÉTAIT PAS CELLE QU'ON CHERCHE D'HABITUDE.** Un rechargement PENDANT l'appel faisait débriefer la même séance **deux fois** (2 appels `coach` mesurés pour une séance). ⛔ Et le trou n'était pas un verrou : entre l'arrivée de la réponse et `_dbfFini`, **aucun état ne disait que c'était déjà payé** — `_dbfRecuperer` voyait un jeton « en cours », en déduisait un appel jamais abouti, et remettait la séance en file.

**⛔⛔ L'ÉTAT `recu` NE VAUT QUE PARCE QU'IL PORTE LA RÉPONSE.** Marquer « reçu » sans garder le texte aurait remplacé un doublon par une **perte silencieuse** — la personne n'aurait jamais su que son débrief avait existé (**R29** : le coût de l'erreur n'est pas symétrique). La réponse **et la consigne** sont donc persistées à l'instant même où elles arrivent, **avant** tout nettoyage, affichage ou écriture d'historique — c'est-à-dire avant toute opération interruptible. ⭐ *Et ça rejoint la cible produit de Michel : « résultat persisté / réutilisable ».*

**⭐ LE RATTRAPAGE TERMINE, IL NE REFAIT PLUS** : il pose la réponse gardée dans le fil du Coach, puis marque la séance livrée. ⛔ Et il sort **avant** de regarder le jeton « en vol » — l'ordre n'est pas cosmétique : lire « en vol » d'abord remettrait la séance en file et on repaierait exactement ce qu'on cherche à éviter.

| scénario (conduit par les vraies portes) | appels `coach` |
|---|---|
| appel normal · rechargement après affichage · app fermée/rouverte | **1** |
| rechargement AVANT le départ de l'appel | **0** |
| rechargement PENDANT `en_vol` | **2** — ⭐ **juste** : rien n'était payé |
| ⭐⭐ **rattrapage depuis la FENÊTRE EXACTE** | **0**, réponse **reposée** |
| échec réseau → jeton `en_file`, puis « Réessayer » | récupérable, livré |

**⭐⭐ B — LA SÉANCE EST NOMMÉE, PLUS DEVINÉE.** `_dbfPrendre` prenait la **plus ancienne** pendant que l'instruction disait « la plus **récente** » : avec deux séances en file, l'écran affichait l'une et Milo analysait l'autre. L'écran de fin cible désormais la séance **affichée**, par son identifiant (`_dbfPrendreCible`), et l'instruction la **nomme**. ⭐⭐ **L'ID CHOISIT, LA DATE DÉCRIT** — le contexte ne porte aucun identifiant interne, donc le donner au modèle ne l'aiderait pas ; la désignation est **dérivée** de la séance retrouvée par son id, au format exact du contexte. Mesuré sur 6 scénarios : les **4 identifiants** (affiché · pris · injecté · cité) coïncident, **y compris avec deux séances le même jour**.

**⚠️⚠️ UN DÉFAUT QUE J'AI INTRODUIT, TROUVÉ PAR LE BANC ET NON PAR RELECTURE.** Mon garde refusait toute séance présente dans `_dbfFaits` — or `_dbfRendre` (échec propre) y inscrit les séances **échouées** tout en les remettant en file. Conséquence mesurée : après un vrai échec réseau, **le bouton « Réessayer » ne déclenchait plus aucun appel** — *le débrief était perdu en silence, exactement ce que cette correction doit empêcher*. 👉 **La file fait foi pour « à faire » ; `_dbfFaits` ne sert que hors file.**

**⚠️ ET TROIS TÉMOINS ÉTAIENT AVEUGLES, MÊME FAMILLE** : ils cherchaient une **présence** (`return;`, `removeItem(_DBF_RECU)`, `_DBF_PEREMPTION`) alors que le même mot vit **ailleurs dans la fonction** — les retirer de leur branche les laissait verts. Resserrés par comptage. *Un motif qui cherche une présence ne mesure pas une absence locale.*

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun bouton n'apparaît, aucune valeur affichée ne bouge : mêmes appels sur le chemin normal, socle local **478 car.** inchangé, « Continuer avec Milo » toujours **0 appel**, **+51 octets** de désignation. ⛔ **0 `summarizeCoach` créé par la correction.**

**⏭️ CE QUE ÇA NE FAIT PAS** (périmètre nommé par Michel, chacun figé par un témoin) : ⛔ pas de `buildSessionDebriefContext` · ⛔ les blocs C+D ne sont pas retirés · ⛔ **le catalogue d'exercices ne bouge pas** · ⛔ **le Gardien ne bouge pas** · ⛔ **le cache ne bouge pas** · ⛔ Sonnet reste Sonnet · ⛔ la politique de mémoire ne bouge pas · ⛔ prévu vs réalisé, Nutrition, **règles RIR de ft-v1213** : intacts.

⚠️⚠️ **UNE LIMITE DITE PLUTÔT QUE MASQUÉE** : le chemin **Coach** (`_maybeAutoDebrief` → `sendToCoach`) garde une fenêtre analogue. ⭐ Elle est **bornée** — la réponse y est déjà écrite dans le fil avant que la main revienne, donc **rien n'est perdu**, au pire un appel est repayé. La fermer imposerait de modifier `sendToCoach`, le cœur de la conversation : **au-delà du périmètre de cette passe**, donc signalé au lieu d'être appliqué.

Tests : **parcours 4140/4140 sur l'arbre FINAL** (bloc **B-CCCXII**, 20 témoins). ⛔ **CONTRÔLE NÉGATIF : 20 mutations, 20 mordent**, chacune par son témoin, contrôle sain **20 OK / 0 rouge avant ET après**, sur un arbre **copié**.

📄 **PDF POUR GPT** : `DOSSIER-GPT-DEBRIEF-PHASE1-15-09-2026.pdf` (**hors dépôt**, règle d'or #14), **36 gardes**. ⭐ Il a été écrit **pendant** que la passe tournait et **refusait donc de publier un total** — la leçon ft-v1201 tenue par un garde plutôt que par la mémoire.

Fichiers : `coach.js`, `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. ⛔ **Ni `app.js`, ni `index.html`, ni `setup.js`, ni `state.js`, ni `worker.js`, ni `Code.js`.** sw.js ft-v1215. |

**ft-v1214 — 📱 LE BANC IPHONE RÉEL · UN MOTEUR INTERCHANGEABLE, PAS UN SECOND CHEMIN** — Michel ferme le banc synthétique et ouvre le vrai téléphone : ***« le banc a suffisamment tranché… la prochaine étape est le TEST IPHONE RÉEL »***. Deux comportements maximum : ① **caméra → zxing-wasm → `_eanValide` → déduplication → `_bcFusionnerCandidats` → 1 lookup** · ② échec → **capture fixe → Quagga2 EN MODE CADRE** → même validation, même fusion. ⛔⛔ ***« Je ne veux toujours PAS réactiver le bouton scanner pour les utilisateurs. »***

**⭐⭐ LE CHOIX QUI DÉCIDE DE TOUT, ET IL VIENT D'UNE LEÇON DE L'AUTRE SESSION : CE N'EST PAS UN SECOND CHEMIN.** Seul le **décodeur** devient un paramètre. La machine à états, `_bcPrendreLaMain`, `_bcTraiterCode`, `_bcFusionnerCandidats`, `_eanValide` et le lookup restent **exactement** ceux de la production. 👉 ***Un mode test qui n'emprunte pas le chemin de production valide le mode test, pas la production.*** Un témoin épingle que `_bcTraiterCode` passe toujours par la fusion, et la mutation qui la contourne mord.

**⭐ LA PORTE : `Profil → Admin`, ET RIEN D'AUTRE (R13).** `_isAdminUnlocked()` garde déjà **16 outils** de diagnostic — ⛔ aucun drapeau, aucune route de test, aucun mécanisme nouveau. ⭐⭐ **Et le garde vit DANS la fonction, pas sur le bouton** : *une porte gardée par son bouton n'est pas gardée*. La mutation qui retire le garde de `ouvrirBancScanner` mord.

**⛔⛔ AUCUN REPLI MOTEUR SILENCIEUX — la consigne §21, et c'est le piège le plus vicieux du chantier.** Si zxing-wasm ne charge pas sur Safari, l'écran écrit **« moteur demandé » / « moteur réellement actif » / « cause »**. *Croire qu'on teste WebAssembly alors que ZXing-js tourne est pire que ne pas tester du tout* — ça produirait un verdict faux sur la seule question que le conteneur ne pouvait pas trancher.

**⭐⭐ ET RIEN N'EST INVENTÉ SUR L'AUTOFOCUS — le trou mesuré ce matin.** `focusMode:'continuous'` était **demandé et JAMAIS vérifié** : une contrainte `advanced` est **ignorée en silence** si elle n'est pas supportée, et ⛔ **ni `getCapabilities()` ni `getSettings()` n'existaient nulle part dans `app.js`**. `_bcCapacitesCamera` lit désormais vraiment le navigateur (`getSettings` · `getCapabilities` · `getSupportedConstraints`) et écrit littéralement **« non observable »** partout où Safari ne répond pas. ⛔ *Michel : « n'invente pas un état focus = OK »* — et la mutation qui écrit `o.focus='continuous'` mord.

**⛔⛔ QUAGGA2 EST EN MODE CADRE, JAMAIS EN MODE SCÈNE.** En scène il rend des **EAN-8 de clé PARFAITEMENT VALIDE lus À L'INTÉRIEUR d'un EAN-13** (`3083681011791 → 11151791`, 12 occurrences mesurées) — *un code faux dont la clé est juste ne peut être attrapé par RIEN en aval*. Et il ne tourne **que sur la capture**, jamais en continu (16× le CPU pour un gain qui n'existe que sur les images ratées par le premier). Deux mutations, deux rouges.

**⭐⭐ LE NUMÉRO COMPLET EST AFFICHÉ, jamais « produit trouvé »** : c'est **le** premier critère du test réel, et c'est précisément ce que le défaut ci-dessus rend indispensable.

**⭐ CHARGEMENT — le précédent CIQUAL était déjà écrit dans `sw.js`.** Les moteurs (`zxing_reader.wasm` 931 Ko · `quagga.min.js` 152 Ko · la colle 36 Ko) sont **HORS du préchargement** : *« le préchargement tourne à CHAQUE mise à jour du cache »*, donc ce serait **~1,1 Mo re-téléchargé par tout le monde** pour des moteurs que personne n'atteint. Mis en cache **à la demande**, chargés **seulement à l'ouverture du banc** (règle d'or #4). La mutation qui les met dans la liste d'installation mord.

**⚠️⚠️ ET LE CONTRÔLE NÉGATIF A TROUVÉ DEUX GARDES AVEUGLES À MOI — puis ma correction était fausse à son tour.** ① Le garde des prétraitements cherchait un `0.7` **dans** le `drawImage`, or ma mutation le posait sur la **ligne d'avant** : *un garde qui cherche la FORME d'un prétraitement en ratera toujours une*. Remplacé par l'invariant juste et plus fort — **le décodeur ne FABRIQUE aucun canvas**. ② Le garde du numéro vérifiait la **présence** de `l.code`, qui survit parfaitement à `l.code ? 'produit trouvé' : …` — *mentionner une variable n'est pas l'afficher*. ⚠️⚠️ **Et ma correction interdisait alors TOUT `l.code ?`… qui sert légitimement à choisir la couleur du texte** : elle rougissait sur du code sain. *Un garde plus strict que la contrainte réelle refuse du travail juste* — payé deux fois en cinq minutes.

**📣 RÈGLE D'OR #11 — RIEN pour l'utilisateur.** Aucun écran ne change, aucun bouton n'apparaît : une carte de plus **derrière l'Admin** (R19/R25).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔⛔ **aucune réactivation** — le bouton utilisateur reste absent, un témoin rougit **dans les deux sens** · ⛔ **aucun 3ᵉ moteur** (le banc a mesuré +0,0) · ⛔ **Html5-QRCode n'entre pas** (régression mesurée, et un garde du PDF le bannit) · ⛔ **aucun prétraitement** · ⛔ **aucun repli IA automatique** · ⛔ périmètre §23 intact : Nutrition, Milo, Séance, RIR, programmes, import Séance, import historique, **étape 1b**, migrations, records. ⚠️ **Ce que je ne peux toujours pas mesurer d'ici** : Safari/iOS, WebAssembly sur iPhone, l'autofocus réel, le thermique — **c'est exactement ce que le banc existe pour aller chercher**.

Tests : **parcours 4120/4120 sur l'arbre FINAL** (bloc **CCCXI**, 18 témoins). ⛔ **CONTRÔLE NÉGATIF : 16 mutations, 16 mordent**, contrôle sain à 0 rouge avant ET après, sur un arbre **copié**.

📄 **PDF POUR GPT** : `DOSSIER-GPT-BANC-MOTEURS-CODEBARRES-14-09-2026.pdf` (**hors dépôt**, règle d'or #14), **45 gardes**. ⚠️ **Deux de ses gardes ont dû CHANGER, et c'est dit** : celui qui interdisait toute bibliothèque dans `lib/` devient plus **précis** (Html5-QRCode reste banni ; zxing-wasm et Quagga2 sont autorisés **mais jamais préchargés, jamais atteignables par un bouton utilisateur**). *Un garde qu'on assouplit sans dire pourquoi est un garde qu'on a contourné.*

Fichiers : `app.js`, `index.html`, `sw.js`, `lib/zxing-wasm.js` (nouveau), `lib/zxing_reader.wasm` (nouveau), `lib/quagga.min.js` (nouveau), `tests/parcours/runner.js`, `tools/gen_banc_pdf.py`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1214. |
