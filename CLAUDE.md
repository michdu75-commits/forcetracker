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
| `sw.js` | Service Worker (cache-first HTML navigation, cache-first assets) — cache versionné `ft-vNN`, bumpé à chaque release (**actuel : `ft-v1206`** — voir le journal des versions) |
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

> **Version actuelle : `ft-v1213`** (prochaine : `ft-v1214`).
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

**ft-v1213 — 📱 LE BANC IPHONE RÉEL · UN MOTEUR INTERCHANGEABLE, PAS UN SECOND CHEMIN** — Michel ferme le banc synthétique et ouvre le vrai téléphone : ***« le banc a suffisamment tranché… la prochaine étape est le TEST IPHONE RÉEL »***. Deux comportements maximum : ① **caméra → zxing-wasm → `_eanValide` → déduplication → `_bcFusionnerCandidats` → 1 lookup** · ② échec → **capture fixe → Quagga2 EN MODE CADRE** → même validation, même fusion. ⛔⛔ ***« Je ne veux toujours PAS réactiver le bouton scanner pour les utilisateurs. »***

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

Tests : **parcours TOTAL/TOTAL sur l'arbre FINAL** (bloc **CCCXI**, 18 témoins). ⛔ **CONTRÔLE NÉGATIF : 16 mutations, 16 mordent**, contrôle sain à 0 rouge avant ET après, sur un arbre **copié**.

📄 **PDF POUR GPT** : `DOSSIER-GPT-BANC-MOTEURS-CODEBARRES-14-09-2026.pdf` (**hors dépôt**, règle d'or #14), **45 gardes**. ⚠️ **Deux de ses gardes ont dû CHANGER, et c'est dit** : celui qui interdisait toute bibliothèque dans `lib/` devient plus **précis** (Html5-QRCode reste banni ; zxing-wasm et Quagga2 sont autorisés **mais jamais préchargés, jamais atteignables par un bouton utilisateur**). *Un garde qu'on assouplit sans dire pourquoi est un garde qu'on a contourné.*

Fichiers : `app.js`, `index.html`, `sw.js`, `lib/zxing-wasm.js` (nouveau), `lib/zxing_reader.wasm` (nouveau), `lib/quagga.min.js` (nouveau), `tests/parcours/runner.js`, `tools/gen_banc_pdf.py`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1213. |

**ft-v1212 — 🏁 QUATRE MOTEURS DE DÉCODAGE AU BANC · ET LE BOUTON QUE J'AVAIS REMIS LA VEILLE EST RETIRÉ** — Michel repart du dossier `SCANNER-CAMERA-LOCAL-1.pdf` et change de stratégie : ⛔ ***« je ne veux PAS partir du principe que ZXing actuel est forcément la meilleure solution »*** — comparer **ZXing actuel · Html5-QRCode · zxing-wasm · Quagga2** sur des fixtures plus dures, avec un tableau comparatif. ⛔⛔ ***« NE RÉACTIVE PAS le scanner dans l'interface utilisateur… Aucun bouton utilisateur tant que je n'ai pas tranché. »*** Dossier : **`docs/BANC-MOTEURS-CODEBARRES.md`** · mesures : **`docs/banc-moteurs-mesures.json`**.

**⛔⛔ LA PREMIÈRE CHOSE FAITE EST DE DÉFAIRE LA VEILLE.** ft-v1210 avait remis le bouton « 📷 Scanner le code-barres avec la caméra » en tête de l'écran d'ajout. **Il est retiré**, avec sa raison écrite sur place (**R30**). ⭐ **Et le moteur reste entier** : `openBarcodeScanner`, `scanBarcode`, la machine à états, les 31 témoins des blocs CCCVIII/CCCIX. *C'est la porte qui est fermée, pas le moteur* — deux témoins le figent **dans les deux sens** : ils rougissent si le bouton revient **et** si le moteur disparaît. ⚠️ **Le témoin ⑩ de CCCVIII disait exactement l'inverse la veille** ; il a été retourné plutôt que supprimé, parce qu'un témoin qui disparaît ne laisse aucune trace de la décision.

**📊 LE TABLEAU, sur 23 cas × 6 codes réels × 3 passes = 414 mesures par moteur, MÊME image pour tous :**

| | ZXing-js (servi) | Html5-QRCode | **zxing-wasm** | Quagga2 (cadré) | Quagga2 (scène) |
|---|---|---|---|---|---|
| réussite | 77,5 % | 68,8 % | **86,2 %** | **87,0 %** | 18,8 % |
| cas durs | 75,5 % | 63,7 % | 81,4 % | **88,2 %** | 17,6 % |
| temps moyen | 28,1 ms | 13,2 ms | **1,1 ms** | 17,0 ms | 49,1 ms |
| p95 | 131,6 ms | 28,3 ms | **3,5 ms** | 28,3 ms | 69,0 ms |
| **EAN valides mais FAUX** | 0 | 0 | 0 | 0 | ⛔ **12** |
| octets (gzip) | 97 Ko | 106 Ko | 13 + **403** Ko | 42 Ko | 42 Ko |

**⭐⭐ LA RÉPONSE À LA QUESTION DE MICHEL SUR HTML5-QRCODE EST *LUE DANS SON CODE*, pas supposée.** *« Si Html5-QRCode utilise essentiellement le même moteur ZXing, dis-le clairement »* — **oui** : `code-decoder.ts` importe `ZXingHtml5QrcodeDecoder`, qui importe **`../third_party/zxing-js.umd`**, un fork de la bibliothèque que nous servons déjà. ⛔⛔ **Et il la bride** : `zxing-html5-qrcode-decoder.ts` ligne 80 écrit **`TRY_HARDER, false`** en dur, sans aucun moyen de le rallumer depuis son API. Il échoue exactement là où TRY_HARDER sert — **faible lumière 0/18, faible contraste 0/18, cumul réaliste 0/18**. ⭐ **La preuve par le prétraitement** : un étirement des niveaux lui rend **+18** — *le prétraitement ne l'améliore pas, il compense un réglage qu'on lui a retiré*, et même compensé il reste **sous zxing-wasm brut**. **Ce qu'il apporte vraiment est sa couche caméra — que nous avons déjà, écrite et éprouvée en ft-v1210.**

**⭐⭐ LE DANGER QUE LE BANC A TROUVÉ N'EST PAS UN TAUX, C'EST UN CODE FAUX QUI PASSE TOUT.** Quagga2 en mode « scène » rend des **EAN-8 de clé de contrôle PARFAITEMENT VALIDE, lus à l'INTÉRIEUR d'un EAN-13** (sa localisation trouve un sous-morceau et le lit comme un code entier) : `3083681011791 → 11151791`, `3021690201123 → 90171123`. 👉 ***Un code faux dont la clé est juste ne peut être attrapé par RIEN en aval*** — ni par le validateur, ni par la recherche produit, qui rendra « inconnu » ou **un autre produit**.

**⭐ D'OÙ LE PROPRIÉTAIRE DU §7, CONSTRUIT ET ÉPROUVÉ MAINTENANT.** `MOTEUR(S) → candidat → `_eanValide` → déduplication → `_bcFusionnerCandidats` → **1 seule recherche**. Trois états : `aucun` (0) · `valide` (1) · ⛔ **`conflit`** — deux codes valides différents ⇒ **0 recherche**, les deux candidats **nommés**, on redemande une capture. *« Jamais prendre le premier et continuer. Aucune invention. »* ⭐ **La déduplication passe AVANT le conflit** : deux moteurs sur le même code ne se contredisent pas, ils se **confirment**. ⭐ **Aucun propriétaire n'a été créé** — `_eanValide` existait et reste le seul à connaître la clé (**R2**). ⚠️ **Le `conflit` est inatteignable en production aujourd'hui, et c'est assumé** : *le garde-fou s'écrit AVANT le second moteur, jamais après.*

**⭐⭐ LE VRAI PLAFOND N'EST PAS LE MOTEUR, C'EST LA MISE AU POINT — et c'est la mesure la plus utile pour l'iPhone.** Seuil de lecture selon la netteté (largeur d'un module en pixels) :

| | net (capture après mise au point) | direct légèrement flou | direct flou |
|---|---|---|---|
| famille ZXing | module ≥ **1** | module ≥ **3** | module ≥ **6** |
| Quagga2 | module ≥ **1** | module ≥ **2** | module ≥ **3** |

👉 ***Le flou coûte 3 à 6 fois la résolution.*** Une image nette se lit à **1 pixel par module** : la résolution n'est presque jamais le problème. **Une capture haute définition APRÈS la mise au point bat le décodage continu d'un flux flou**, et *monter la résolution sans régler la mise au point est la façon chère d'acheter ce que la mise au point donne gratuitement*. ⭐ **Et les 12 images que PERSONNE ne lit sont TOUTES des flous** (2 px et 3 px) : le plafond du banc n'est pas un plafond d'algorithme.

**⛔ PRÉTRAITEMENTS (§11) : PRESQUE TOUS REJETÉS PAR LA MESURE.** Seul l'**agrandissement ×2** mérite sa place (**+5** pour zxing-wasm, 1,4 ms). La **netteté est une PERTE nette** pour les deux meilleurs (**−12** et **−26**) : elle accentue le bruit autant que les barres. ⛔⛔ **Et le recadrage central détruit TOUT** (−100 % sur les quatre moteurs) : il **mange la zone de silence**, sans laquelle aucun décodeur ne peut délimiter le code — *c'est le prétraitement qui semble le plus évident, et c'est le pire*.

**⭐ CASCADES (§8/§14)** : zxing-wasm seul **86,2 %** · + Quagga2 cadré **91,3 %** · ⛔ **un 3ᵉ moteur : +0,0**. *« Le but n'est pas d'empiler les librairies »* — la mesure lui donne raison.

**⚠️ FORMATS (§13) — RECOMMANDATION MESURÉE, ET ELLE NE SUIT PAS LE CHIFFRE BRUT.** Retirer l'EAN-8 ramène les désaccords de **12 à 0**… mais **les 12 viennent exclusivement du mode « scène »**, que je ne propose pas d'utiliser : **toute combinaison sans lui donne 0 désaccord, EAN-8 compris**. Et l'EAN-8 est un vrai format des petits emballages. 👉 **Garder les quatre** ; et **si un jour le mode scène tourne**, exiger qu'un EAN-8 soit **confirmé par un second moteur** — la fusion sait déjà le faire.

**⚠️⚠️ ET LE CONTRÔLE NÉGATIF A TROUVÉ UN GARDE AVEUGLE À MOI, POUR LA TROISIÈME FOIS LA MÊME FAMILLE.** ① Mon garde du PDF cherchait `'BLOC CCCX' not in RUN` : or **« BLOC CCCX » est contenu dans « BLOC CCCXZ »**, donc renommer le bloc le laissait vert — *le piège de `presentsX` de ft-v1207, repayé*. ② Et un autre refusait de produire **à cause du COMMENTAIRE d'`index.html` qui explique le chantier** et nomme les quatre candidats : *un garde qui ne distingue pas le CODE de ce qui en PARLE mesure la documentation* (famille ft-v1193/1203/1205/1210). ③ ⭐⭐ **Enfin mon VÉRIFICATEUR de PDF annonçait « 0 caractère dessiné » sur un PDF parfaitement bon** — il ne gérait que Flate, pas l'ASCII85 que reportlab emploie. 👉 ***Un vérificateur cassé ressemble trait pour trait à un PDF muet*** : c'est exactement le piège que la règle d'or #14 demande d'éviter, retourné contre elle.

**⚠️ ET MON PREMIER ADAPTATEUR MESURAIT MON ERREUR, PAS LE MOTEUR** : il appelait `decodeFromCanvas`, **qui n'existe pas** dans le build servi — **0 % en 0,1 ms**, un chiffre qui ressemble à un verdict. Corrigé vers `decodeFromImageUrl`, *exactement ce qu'appelle `_bcCaptureFrame`*. **Idem pour Quagga2** : mesuré avec `locate:true` seul, il faisait **0/6 sur un code NET** — je mesurais **mon cadrage**, pas le moteur ; les **deux** configurations sont donc mesurées, et leur écart est un résultat en soi.

**📣 RÈGLE D'OR #11 — RIEN, ET C'EST LE SUJET.** Un bouton disparaît de l'écran d'ajout (il n'y avait vécu qu'un jour, sans annonce), aucune valeur ne bouge, aucune donnée ne change.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔⛔ **aucune réactivation, aucun bouton** — décision de Michel attendue · ⛔ **aucun second moteur n'entre dans le dépôt** : les trois candidats vivent hors dépôt, et un garde du PDF refuse de produire si l'un d'eux apparaît dans `lib/` ou dans un fichier servi · ⛔ périmètre §16 intact : `_lookupBarcode`, `_offFetchProduct`, `_ref100`, le résolveur, la **douane**, le journal, `savedFoods`, les portions, les quantités, les migrations, **Milo**, l'import historique, l'**étape 1b**. ⚠️ **Non mesurable d'ici** : WebAssembly sur Safari/iOS, l'autofocus réel, l'arrière-plan, le thermique — d'où le **protocole iPhone en 6 produits et 6 gestes**.

**⛔⛔ VERDICT : `C — ZXING + FALLBACK LOCAL SECONDAIRE`**, avec **zxing-wasm en moteur principal** (et non le ZXing d'aujourd'hui), **Quagga2 cadré** en second **uniquement sur la frame capturée**, puis le **bouton** de repli IA. **Coût dit franchement : +306 Ko** à l'ouverture du scanner, **rien au démarrage** (règle d'or #4 intacte). **AUCUNE RÉACTIVATION UTILISATEUR AVANT TEST IPHONE.**

Tests : **parcours TOTAL/TOTAL sur l'arbre FINAL** (bloc **CCCX**, 10 témoins). ⛔ **CONTRÔLE NÉGATIF : 12 mutations sur le banc + 25 sur les gardes du PDF, toutes mordent**, contrôle sain à 0 rouge avant ET après, sur un arbre **copié**.

📄 **PDF POUR GPT** : `DOSSIER-GPT-BANC-MOTEURS-CODEBARRES-14-09-2026.pdf` (**25ᵉ** de la série, **hors dépôt** — règle d'or #14), généré par `tools/gen_banc_pdf.py`, **37 gardes**. ⭐ Ses plus utiles protègent des **décisions** : que la porte soit restée fermée, que le **moteur** soit resté là, que le conflit ne soit pas avalé, que les bibliothèques candidates ne soient pas entrées dans le dépôt, et que le verdict ne monte pas d'un cran.

Fichiers : `index.html`, `app.js`, `tests/parcours/runner.js`, `tools/gen_banc_pdf.py` (nouveau), `tools/gen_scanner_pdf.py`, `docs/BANC-MOTEURS-CODEBARRES.md` (nouveau), `docs/banc-moteurs-mesures.json` (nouveau), `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1212. |

**ft-v1210 — 📷 LE SCANNER CAMÉRA LOCAL REVIENT · ET LA CONTRE-ENQUÊTE CORRIGE MA PROPRE CONCLUSION DE LA VEILLE** — Michel apporte une information qui oblige à rouvrir l'historique : *« au moment où l'ancien scanner avait été testé puis retiré, la base Open Food Facts telle qu'on l'utilise aujourd'hui n'existait pas encore »* · ⛔ ***« ne considère pas comme acquis que le mauvais fonctionnement historique venait d'un lookup cassé »*** · ⛔⛔ ***« ne remets PAS immédiatement le bouton en production »***. Objectif produit : ***« caméra → décodage LOCAL → EAN → chemin de lookup ACTUEL → même résultat que le code tapé → 0 appel IA »***, et **LOCAL D'ABORD, IA EN SECOURS**. Dossier : **`docs/SCANNER-CAMERA-LOCAL.md`**.

**⛔⛔ MA CONCLUSION D'HIER ÉTAIT TROP FORTE, ET JE LA CORRIGE EXPLICITEMENT.** J'avais écrit que la panne de lookup pouvait expliquer le jugement négatif sur le scanner. **Vérifié dans git, c'est faux pour le scanner live** :

| fait mesuré | conséquence |
|---|---|
| Open Food Facts entre le **08/07** (ft-v331), 3 jours avant le scanner live | ⚠️ la prémisse de Michel est inexacte **sur la lettre** |
| **ft-v377 (15:29) est un ANCÊTRE du retrait (17:10)** — `git merge-base` | ⛔ le lookup était **réparé** |
| le clone **réellement testé sur iPhone à 16:47** contenait **ft-v377 ET ft-v378** | ⛔ **le bug de lookup n'explique PAS le retrait** |

⭐ **Mais sur le fond Michel vise juste** : tout ce qui ENTOURE ce lookup est postérieur — `_ref100`, le résolveur, la douane, CIQUAL, le hub. En juillet, `_lookupBarcode(ean)` ne prenait **même pas** d'argument de provenance.

**⭐⭐ ET LE BUG DE LOOKUP EXPLIQUE L'AUTRE JUGEMENT — celui qui a tout déclenché.** La note *« photo unique trop fragile, vérifié en test »* (11/07 10:20) a été écrite pendant les **2 jours et 19 heures** où le lookup rejetait **TOUS** les produits. 👉 ***C'est ce jugement-là qui a motivé la construction du scanner live*** — l'erreur de confusion a bien eu lieu, **un cran plus tôt que je ne l'avais écrit**.

**⭐⭐ LA TROUVAILLE DE LA CONTRE-ENQUÊTE : LA COURSE EST NÉE DU CORRECTIF CENSÉ SAUVER LE SCANNER.** `_bcCaptureFrame` (le bouton « Capturer ») est arrivé en **ft-v378 à 15:40**, désarmement posé **après** son `await` ; le scanner a été retiré **1 h 30 plus tard**. *Deux lookups = deux « Recherche du produit… » et un formulaire rempli deux fois — ça ressemble beaucoup à « capricieux ».* ⚠️ **Mécanisme mesuré, cause NON prouvée** — et c'est dit ainsi.

**⭐⭐ LA COURSE EST FERMÉE PAR UNE MACHINE À ÉTATS, PAS PAR UN BOOLÉEN DE PLUS.** Michel : *« pas plusieurs booléens indépendants impossibles à raisonner »*. **`IDLE → SCANNING → CODE_TROUVE → LOOKUP → TERMINE`**, et **un seul verrou** : tout code décodé passe par `_bcPrendreLaMain`. Le premier lecteur prend la main, le second trouve la porte fermée. ⭐ **Mesuré SOUS COURSE PROVOQUÉE** — le banc martèle « Capturer » pendant toute la lecture continue : **1 lookup, 1 requête OFF, 0 appel IA**, trois passes identiques.

**⭐⭐ §16 — « CODE NON LU » NE PEUT PLUS SE CONFONDRE AVEC « PRODUIT NON TROUVÉ ».** Dès qu'un code est accepté, **avant** la recherche : le statut dit **« ✅ Code lu : 3083681011791 »** et le **champ de saisie est rempli**. 👉 *Même si la base ne connaît pas le produit, le numéro reste à l'écran.* **C'est l'erreur de juillet rendue impossible à refaire.**

**⛔⛔ LE TRAITEMENT D'IMAGE N'APPORTE RIEN — MESURÉ, ET C'EST LA RÉPONSE AU §8.** Sur **18 cas durs** : aucun **3/18** · contraste ×2,2 **3/18** · netteté **3/18** · **binarisation d'Otsu** (seuil calculé, pas un 128 arbitraire) **3/18** · agrandissement ×2 **3/18 pour +70 % de temps**. 👉 ***Aucun traitement ne fait passer un seul cas de plus.*** **Pas d'usine à gaz** : le facteur limitant est l'autofocus.

**⭐ §9 — LA LISTE DE FORMATS N'EST PAS UN CAPRICE, ET LES DEUX FACTEURS ONT ÉTÉ SÉPARÉS** : TRY_HARDER seul lit le paysage mais coûte **436 ms** par frame ratée ; les 4 formats seuls coûtent **8 ms** mais **ne lisent pas le paysage** ; ensemble : **140 ms** et le paysage. 👉 ***C'est la liste qui rend TRY_HARDER abordable*** (÷3), soit ~7 tentatives/seconde. **EAN-13 · EAN-8 · UPC-A · UPC-E, pas un de plus** — chaque format en trop rallonge **chaque** frame ratée.

**⛔ AUCUN BOUTON MORT** (consigne explicite) : `scanBarcodePhoto`, `_bcPhotoFallback` et `onBarcodeFile` sont **supprimées** — orphelines depuis ft-v388, et rien à rebrancher puisque « Capturer » décode **la frame que la personne vise**. Retrait **écrit avec sa raison** (**R30**), et `photo-code` reste **nommée** dans la table : *une provenance qu'on ne sait plus lire est pire qu'une provenance qu'on ne produit plus.*

**⛔⛔ LE REPLI IA EST UN BOUTON, JAMAIS UN BASCULEMENT** : ni minuteur, ni compteur d'échecs, ni déclenchement « parce que le code est flou ». *Un code flou restera flou — on paierait un appel pour échouer deux fois.* Et il **coupe la caméra avant** de passer la main.

**📣 RÈGLE D'OR #11 — POINTS 2 À 5.** L'écran d'ajout gagne **« 📷 Scanner le code-barres avec la caméra »**, **en premier** : *la porte d'entrée par défaut ne doit jamais être celle qui coûte* (**R24**). ⚖️ **Pas de pop-up `WHATS_NEW`** : rien à FAIRE, la nouveauté se comprend en la voyant.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔⛔ **le verdict est `PRÊT POUR TEST IPHONE`, et pas plus fort** — *« ne déclare pas le scanner définitivement réactivé avant mon retour iPhone »* (un garde du PDF refuse de produire si le document monte d'un cran) · ⛔ périmètre nommé par Michel intact : `_lookupBarcode`, `_offFetchProduct`, `_ref100`, le résolveur, la **douane**, le journal, `savedFoods`, les portions, les quantités, les migrations, **Milo**, l'import historique, l'étape 1b, les programmes, les records. ⚠️ **La fiabilité iPhone n'est PAS mesurée d'ici** (ni caméra ni Safari), ni l'autofocus réel, ni le passage en arrière-plan : un **protocole en 6 produits et 5 gestes** attend Michel.

Tests : **parcours TOTAL/TOTAL sur l'arbre FINAL** (blocs **CCCVIII** 19 témoins et **CCCIX** 12 témoins). **Calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou nouveau. ⛔ **CONTRÔLE NÉGATIF : 20 MUTATIONS, TOUTES MORDENT, contrôle sain à 0 rouge avant ET après, sur un arbre COPIÉ** — **les 13 nommées par Michel** : ① le scanner appelle le Worker IA → **2** · ② deux lookups → **2** · ③ Capturer contourne le verrou → **2** · ④ le continu contourne le verrou → **1** · ⑤ un autre lookup que le code tapé → **7** · ⑥ résultat divergent → **3** · ⑦ provenance = `code-tape` → **4** · ⑧ ⭐ **repli IA automatique** → **3** · ⑨ le quota IA n'est plus décompté → **1** · ⑩ le bouton mort revient → **3** · ⑪ la caméra reste allumée → **1** · ⑫ un doublon relance le lookup → **1** · ⑬ un échec déclenche un lookup → **3** · **et 7 miennes** : ⑭ ⭐ **le numéro lu n'est plus montré avant la recherche** → **2** · ⑮ la porte re-murée → **1** · ⑯ R24 inversée → **1** · ⑰ la fermeture écrase un traitement → **1** · ⑱ le scanner fait de la nutrition → **1** · ⑲ le flux vidéo n'est plus coupé → **1** · ⑳ ZXing depuis un CDN → **11**.

**⚠️⚠️ ET LE CONTRÔLE NÉGATIF A TROUVÉ DEUX TÉMOINS AVEUGLES À MOI — dont un que j'avais déjà payé.** ① Le témoin qui exige que la caméra soit coupée cherchait `stopStreams` **n'importe où dans le corps** — or le mot vit aussi dans **le commentaire qui l'explique**. Retirer l'appel le laissait vert. 👉 ***Un garde qui ne distingue pas le CODE de ce qui en PARLE mesure la documentation*** — famille ft-v1193/1203, reposée par moi ; tous les gardes de source du bloc lisent désormais le corps **sans ses commentaires**. ② Le témoin du quota IA **n'existait pas dans ce bloc** : la mutation ne faisait rougir que CCCVII, absent du harnais. *Un témoin qui vit dans un autre bloc ne protège pas celui-ci.*

**⚠️ ET UN TÉMOIN À MOI MESURAIT MON PROPRE MARTEAU** : en martelant « Capturer », le statut affiché restait « Lecture… » au lieu du message d'aide. La sonde **arrête le marteau** avant de lire. *On mesurait l'instrument, pas l'écran.*

📄 **PDF POUR GPT** : `docs/SCANNER-CAMERA-LOCAL.pdf` (**24ᵉ** de la série), généré par `tools/gen_scanner_pdf.py` — **42 gardes**, **22 mutations éprouvées sur un arbre COPIÉ**, toutes refusent, contrôle sain vert avant ET après, arbre revérifié identique au dépôt. ⭐⭐ **Ses gardes les plus utiles protègent des DÉCISIONS** : que la course reste fermée, que le repli IA reste volontaire, que le numéro lu reste montré avant la recherche, et ⛔ **que le verdict ne monte pas d'un cran sans le retour iPhone**. ⚠️⚠️ **Et deux gardes à moi étaient faux** : ① celui du verdict refusait le document **à cause de la citation de Michel qui dit de ne pas le faire** — *un garde qui ne voit pas la négation refuse exactement la phrase qui l'interdit* ; il exige désormais un « ne / pas / jamais » dans les 60 caractères précédents. ② Celui du marteau se laissait satisfaire par **une sous-chaîne** (`o.marteauX` contient `o.marteau`) — *le piège de `presentsX` de ft-v1207, reposé*.

Fichiers : `app.js`, `index.html`, `tests/parcours/runner.js`, `tools/gen_scanner_pdf.py`, `docs/SCANNER-CAMERA-LOCAL.md`, `docs/SCANNER-CAMERA-LOCAL.pdf`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1210.

⚠️ **RENUMÉROTÉE ft-v1209 → ft-v1210 À LA FUSION** : session-B avait publié sa ft-v1209 pendant que je travaillais. **C'est git qui l'a dit, pas le journal de partage** — le push a été refusé en non-fast-forward. *Le journal évite le doublon de travail, git évite l'écrasement de code* (règle d'or #13). Les deux versions sont conservées, la sienne en premier dans `sw.js`. |

**ft-v1211 — 🔬 LE PROTOCOLE DE VALIDATION DE L'ÉTAPE 1b EST FERMÉ · ET CE QUI A ÉTÉ CONSTRUIT EST UN REFUS** — Michel refuse les deux seules façons de tester qui restaient : ***« je ne veux PAS réimporter des séances déjà présentes juste pour faire un test »*** · ***« je ne veux pas non plus importer une fausse séance puis la supprimer ensuite »***. Sa demande : ***« éprouver la chaîne production réelle de `typesNormalises` SANS écrire quoi que ce soit dans `S.sessions` »***.

**⭐⭐ L'AUDIT A ÉTÉ FAIT AVANT TOUTE LIGNE, ET IL A RENDU LE CHANTIER PRESQUE VIDE.** Fermeture transitive sur **168 fonctions** atteintes depuis le chemin d'import — pas une lecture à l'œil, un découpage du **corps réel** de chaque fonction (comptage d'accolades, en ignorant chaînes et commentaires) :

| fonction | ce qu'elle écrit |
|---|---|
| `openImportHist` · `addHistPhoto` · `addHistFile` · `histGoStep` | **rien** |
| `analyzeHistPhotos` | **rien** |
| `_histAnalyzeBatch` | **le seul appel réseau**, rien d'autre |
| `_vmMatchHist` · `_renderHistPreview` · `closeImportHist` · `histRecommencer` | **rien** |
| **`finalImportHist`** | `S.sessions` · `S.prs` · `S.histImports` · `persist()` · sync cloud · badges · signalement d'exercice |

👉 ***L'aperçu (étape 4) est DÉJÀ un point d'arrêt non destructif***, et `closeImportHist` ne fait que retirer une classe CSS.

**⛔⛔ DONC AUCUN MODE TEST N'A ÉTÉ CRÉÉ, ET C'EST LA DÉCISION DE LA VERSION.** Un bouton « Tester le transport » serait un **second chemin** — précisément ce que Michel interdit (*« pas de test qui contourne le Worker, pas d'autre route que l'import réel »*). *Un mode test qui n'emprunte pas le chemin de production ne valide pas le chemin de production : il valide le mode test.* Le chemin **réel** devient auto-témoin. ⭐ Bénéfice mesuré : les mutations *« un mode test devient persistant »* et *« un fallback transforme le test en vrai import »* deviennent **sans objet** — il n'y a rien à détourner.

**⚠️⚠️ LE SEUL VRAI TROU, ET IL EST SÉRIEUX** : `_aiUrl` **RETOMBE sur Apps Script** si `AI_PROXY_URL` est vide. Donc *« le Worker a répondu »* n'était **pas prouvable** — il était **supposé**. Or c'est exactement la question que ce test doit fermer. La destination est désormais relevée **AVANT** le `fetch` (une tentative qui échoue doit dire où elle allait, sinon un Worker injoignable est indiscernable d'un Worker jamais appelé) et affichée : `OUI` / `NON (Apps Script)` / `MIXTE`.

**⭐ `_empreinteDonnees()` — UN SEUL PROPRIÉTAIRE, APPELÉ DES DEUX CÔTÉS (R2).** C'est le point de conception : *la capture et la comparaison doivent employer exactement la même projection*. Si l'avant regardait les dates et l'après les volumes, la comparaison dirait « identique » sur deux états différents. ⭐ **Et c'est une empreinte, pas un compteur** : *un import qui remplacerait une séance au lieu d'en ajouter une laisserait le NOMBRE inchangé.* Un témoin le prouve — même nombre, empreinte différente.

**📋 L'ÉCRAN ADMIN PORTE LES 7 LIGNES DEMANDÉES**, dont ⭐ **« Écriture dans `S.sessions` : NON » RECALCULÉE** à l'affichage, jamais un drapeau posé en partant : *un drapeau dit ce qu'on CROYAIT faire, une empreinte dit ce qui EST*.

**⚠️⚠️ DEUX ERREURS D'INSTRUMENT, ET LA PREMIÈRE EST UNE RÉCIDIVE À 24 HEURES.** ① Mon témoin du repli faisait `Object.defineProperty(window,'AI_PROXY_URL',{value:''})` — **il était VERT EN NE MESURANT RIEN** : `AI_PROXY_URL` est un `const` de premier niveau, donc il vit dans l'environnement lexical global et **n'est pas une propriété de `window`**. J'ai créé une seconde variable que `_aiUrl` ne lit jamais, et le témoin se rabattait sur sa clause de sortie *« non rejouable »*. 👉 ***C'est le piège de `window._histExtracted`, que j'avais documenté moi-même la veille dans ft-v1209.*** Le banc sert désormais un `constants.js` à constante vide — le vrai `_aiUrl` retombe pour de bon. ⛔ **Et la clause de sortie est supprimée** : *un témoin qui a le droit de ne pas mesurer finit par ne pas mesurer.*

**⭐⭐ ② ET LE TÉMOIN CORRIGÉ A ROUGI POUR UNE VRAIE RAISON, QUI COMPTE POUR LE PROTOCOLE** : `analyzeHistPhotos` commence par le **mur premium**. Sur un compte **gratuit** ayant déjà importé une fois, le document **n'atteint JAMAIS le Worker** — le diagnostic afficherait « aucun import observé » et on conclurait à tort à une panne de transport. *Deux causes opposées, deux correctifs opposés.*

**⭐⭐ ET UNE MUTATION N'A MORDU SUR RIEN AU PREMIER JET — elle a révélé un vrai trou.** *« Le mode test fabrique `typesNormalises` »* : **0 rouge**. Cause mesurée — `d.data.typesNormalises` est lu **DEUX FOIS** dans `_histAnalyzeBatch`, pour **deux consommateurs** : le diagnostic Admin (`_histDiag.valeur`) et le **total transporté** (`_histExtracted.typesNormalises`), lequel produit le message *« N séries au type non reconnu »* **montré à la personne**. Fabriquer l'un laissait l'autre parfaitement sincère. 👉 ***Un champ lu deux fois est deux champs tant que rien ne vérifie qu'ils sont d'accord.*** Trois témoins le font désormais (comportement × 2 valeurs + source). ⛔ **Non refactorisé** : les deux expressions sont identiques aujourd'hui, il n'y a pas de défaut à corriger — seulement une divergence à rendre impossible en silence.

**⚠️ ET UNE ÉCRITURE RESTE ATTEIGNABLE, DITE PLUTÔT QUE MASQUÉE** : depuis l'aperçu, taper « rattacher » puis chercher un exercice inexistant déclenche `_signalerRechercheVide`, qui écrit `S.reportedRechVide` et `ft4_rep_rech` (la liste anti-doublon des recherches vides, **R36**). ⛔ Ni séance, ni record, ni historique — et il faut un geste délibéré de plus. *Le chemin d'appel est nommé, pas deviné* : `_renderHistPreview → histRattacher → _impPickOuvre → openExPicker → filterEx → _signalerRechercheVide`.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran utilisateur ne change, aucune donnée ne bouge : la carte Admin livrée en ft-v1209 dit simplement plus de choses (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **l'ÉTAPE 2 n'est pas ouverte** — prompt `importHistory` inchangé des deux côtés, aucun `setTypePerSet` historique, `_typeAt` non branché, normalisation `D`/`''` intacte, records intacts, aucune migration · ⛔ **Nutrition, Milo, programmes, scanner : 0 ligne** — `app.js` et `index.html` ne sont **pas touchés**, la carte Admin existait déjà · ⛔ `_signalerRechercheVide` n'est pas modifiée (**R30** : c'est une décision de ft-v1169, pas un oubli).

⚠️⚠️ **ET LE TEST QUI COMPTE N'EST TOUJOURS PAS FAIT** : le Worker déployé reste injoignable depuis le conteneur (`403`). Verdict tant que Michel n'a pas fait son import iPhone : ***ÉTAPE 1B PUBLIÉE MAIS TEST PRODUCTION NON DESTRUCTIF EN ATTENTE***.

Tests : **bloc B-CCCX, 33 témoins**, verts sur l'arbre final. ⛔ **CONTRÔLE NÉGATIF : 14 mutations — les 10 nommées par Michel + 4 miennes — contrôle sain à 0 rouge avant ET après, sur un arbre COPIÉ** (`BUGS.md` §60 par construction).

Fichiers : `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. ⛔ **Ni `app.js`, ni `index.html`, ni `coach.js`, ni `tracking.js`, ni `setup.js`, ni `Code.js`, ni `worker.js`.** sw.js ft-v1211. |

**ft-v1209 — 🔬 LE TYPE DE SÉRIE NE DISPARAÎT PLUS EN SILENCE · ET UN CHEMIN QUI N'ÉTAIT JUSTE QUE PAR ACCIDENT** — six chantiers menés un par un, chacun mesuré avant d'être touché, tous publiés dans **le même bump** parce qu'aucun n'avait été déployé.

**⭐⭐ LE FIL QUI LES RELIE : ON NE CORRIGE QUE CE QU'ON A MESURÉ, ET LA PRÉMISSE DU CHANTIER ÉTAIT FAUSSE.** Michel a ouvert le sujet sur *« l'import écrase le type, donc un échauffement peut devenir un record »*. ⛔ **Mesure : le type n'est pas PERDU, il n'est jamais ÉMIS** — le prompt `importHistory` interdit `W` et `E`, et la normalisation serveur l'applique. La ligne du client n'était pas la cause : c'était la **3ᵉ copie** d'un contrat serveur, donc un **filet**. *Avant de corriger une perte, vérifier que la chose perdue a seulement été émise.*

**① LE RYTHME DES QUESTIONS DE MILO — une règle de COMPORTEMENT écrite 4 fois.** *« Au plus une question par semaine, pas avant 3 séances »* protège la personne de l'interrogatoire. Le plafond hebdo était retapé **4 fois** (pas 3, recompté le jour même), le garde des séances **3 fois**. ⛔ Une divergence n'aurait été visible **dans aucun test de calcul et sur aucun écran** — le symptôme aurait été *« Milo me demande trop de trucs »*. Deux propriétaires : `_plafondHebdoAtteint()` · `_assezDeSeancesPourDemander()`. ⛔ **Ce qui N'est PAS une copie reste dehors** : le seuil `<4` des observations (sa raison est écrite) et le report « Plus tard » à 30 j. **Constat B** : deux commentaires annonçaient « 3 jours » là où le code dit 7.

**② C1 · C2 — LES RECORDS : une copie, et une dépendance accidentelle.** `_serieFaitFoiPourPR` était le propriétaire, mais `saveSessEdits` recopiait la règle à la main, et `finalImportHist` n'avait **aucun filtre de type** — il n'était juste que parce que l'import **écrase** le type deux lignes plus haut. ⛔ *Un chemin qui n'est juste que grâce à une contrainte posée ailleurs n'est pas sûr : il est en sursis* (`BUGS.md` §62). ⭐⭐ **LE CAS FUTUR EST CONDUIT, PAS ARGUMENTÉ** : la boucle des records relit **toutes** les séances déjà importées, donc une séance portant un `'É'` traverse la vraie fonction — **avant C2 elle posait un record d'échauffement de 250 kg, après c'est la série de travail 150×8**. ⚠️ Et « conserver le type brut » aurait été **pire**, c'est mesuré : le propriétaire n'exclut que `'É'` et `'W'`, donc un type inconnu gardé tel quel devient **éligible au record** — `'ECH'` compris, qui *signifie* échauffement. *Un type préservé mais incompris est plus dangereux qu'un type normalisé, parce qu'il a l'air d'avoir été préservé.*

**③ L'INVENTION SILENCIEUSE S'ARRÊTE — en deux couches DISJOINTES.** Tout type autre que `'D'` devenait `''` sans compteur, sans message, sans trace. Le compteur client seul ne suffisait pas : **le chemin vivant passe d'abord par le Worker, qui normalise déjà** — mesuré, **5 valeurs inconnues sur 5** arrivaient au client en `''` et comptaient **0**. Le compteur est donc posé **là où le type brut existe encore**, dans `worker.js` **avant** la normalisation, et à l'identique dans `Code.js` (le repli — *s'il répondait un jour sans ce compteur, le trou reviendrait en silence*). ⭐ **Aucun double comptage, et c'est une PROPRIÉTÉ** : le backend rend `''` pour ce qu'il a compté, donc le filet client ne voit rien. *Les deux couches ne se recouvrent pas : elles se relaient.* R13 : l'annonce passe par le mécanisme `_ecarts` qui existait déjà.

**④ ET LE DIAGNOSTIC ADMIN, PARCE QUE `0` NE PROUVE RIEN.** Sur un vrai document le compteur vaudra **0** (le modèle n'a pas le droit d'émettre un type inconnu) — or le client retombe **aussi sur 0** quand le champ est **absent**. *Les deux cas sont indiscernables par la valeur.* La présence est donc constatée par `hasOwnProperty`, ⛔ **jamais par un `>0`**, et affichée **séparément** : `Aucun import observé` / `NON` / `OUI` / **`PARTIEL`** (plusieurs lots, un seul porte le champ — un booléen le cacherait). Non persisté, remis à zéro **avant** le premier appel réseau, **aucune donnée du document** dedans. ⭐ Le diagnostic et son affichage vivent tous deux dans `log.js` : **`app.js` n'est pas approché**, donc la garantie Nutrition est triviale à prouver.

**📣 RÈGLE D'OR #11 — RIEN pour l'utilisateur.** Aucun écran ne change, aucune donnée ne bouge : instantané des records **identique octet pour octet** (sha `345d3db35bebb9d2`) avant et après les six chantiers. La seule nouveauté visible est une carte **derrière l'Admin** (R19/R25).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **l'ÉTAPE 2 n'est pas commencée** — le prompt interdit toujours `W` et `E` des deux côtés, aucun `setTypePerSet` pour l'historique, `_typeAt` non branché · ⛔ **aucune migration** : la conversion `D→N` de `state.js` reste one-time, figée par témoin, et le nombre de séries historiques touchées **n'est pas mesurable** depuis un conteneur · ⛔ Nutrition, Milo, programmes : **0 ligne** · ⛔ `MAX_PAGES` reste à 15, `_pdfToImages` non migrée (c'est A2, il attend le feu vert nutrition).

⚠️⚠️ **ET LE TEST QUI COMPTE N'EST PAS FAIT** : le Worker déployé n'est pas joignable depuis le conteneur (`CONNECT tunnel failed, 403`) et aucune clé API n'y existe. **Michel doit faire un vrai import sur iPhone puis ouvrir Admin.** Verdict tant qu'il ne l'a pas fait : *ÉTAPE 1B PUBLIÉE MAIS TEST PRODUCTION EN ATTENTE*.

⚠️ **LES ERREURS D'INSTRUMENT DE LA SÉRIE, parce qu'elles resserviront** : une sonde **verte en ne mesurant rien** (`window._histExtracted` créait une 2ᵉ variable, un `let` de premier niveau n'étant pas une propriété de `window`) · un témoin qui ne conduisait que **la moitié du chemin** (`analyzeHistPhotos` extrait, `finalImportHist` écrit) · un attendu **écrit de mémoire** (`bz(110,4)=120` bat `bz(100,5)`) · une mutation qui faisait **planter** au lieu de rougir, affichant « 0 rouge » — *indiscernable d'un vert* (§61) · et **trois gardes de proximité** qui confondaient deux choses voisines. *L'instrument fait partie de la mesure.*

Tests : **B-CCCIII 18 · B-CCCIV 19 · B-CCCV 24 · B-CCCVI 20 · B-CCCVII 24 · B-CCCVIII 26 · B-CCCIX 19**, tous verts sur l'arbre refusionné. ⛔ **CONTRÔLE NÉGATIF : 39 mutations rejouées APRÈS refusion, 39 mordent**, contrôle sain à 0 rouge avant ET après. Calculs 339/339, muscles 241/241, croisés 50/50, dates 9/9, données classées.

Fichiers : `tracking.js`, `log.js`, `setup.js`, `app.js`, `worker.js`, `Code.js`, `index.html`, `state.js`, `coach.js`, `tests/parcours/runner.js`, `tools/instantane_rythme_questions.js`, `tools/instantane_records.js`, `sw.js`, `CLAUDE.md`, `BUGS.md`, `docs/*`. sw.js ft-v1209. |

---

### 📐 A1 — UNE LECTURE DE PDF DIT ENFIN QU'ELLE EST TRONQUÉE — `COMPLETE` / `PARTIAL` / `UNKNOWN`** — Michel valide le plan et ses 4 décisions produit, puis ouvre **A1 SEUL** : ***« d'abord formaliser le contrat de résultat d'un import »*** · ***« une lecture partielle n'est PAS une exception technique et ne doit jamais être assimilée à un succès complet »***.

**⭐⭐ LE DÉFAUT CORRIGÉ A ÉTÉ MESURÉ LE MATIN MÊME, AVEC LA VRAIE BIBLIOTHÈQUE, SUR SES VRAIS FICHIERS.** `_pdfToText` rendait **682 lignes d'un document de 22 pages — sans le moindre signal** (`MAX_PAGES=15`, **31 % du contenu jamais lu** ; et `_pdfToImages`, le chemin qui part à l'IA, plafonne à **8**, soit **64 %**). 👉 ***Une lecture partielle était indiscernable d'une lecture complète*** — pour une cascade de crans, c'est **un succès qui ment**, plus dangereux qu'un échec : le cran s'arrête sur un résultat incomplet et le suivant n'est jamais appelé.

**⭐ POURQUOI A1 EST LE CHANTIER LE MOINS RISQUÉ DU PROJET, ET C'EST UNE MESURE QUI LE DIT** : `_pdfToText` n'a **qu'UN appelant**, `_vmCustomPdf` — et c'est un **outil admin** (Mode Test VM). **Aucun chemin utilisateur n'est touché.**

**⛔⛔ ET LA FORME LA PLUS COMPATIBLE ÉTAIT LA MAUVAISE.** Les 5 appelants de la famille ne lisent que `.length` et l'itération : un **tableau avec propriétés attachées** aurait demandé **0 migration**… et un appelant qui ignore `.etat` se serait comporté **exactement comme avant**. 👉 ***La compatibilité parfaite est ici le défaut, pas la qualité.*** D'où un vrai objet `{etat, lignes, pagesLues, pagesTotal, raison}`. ⚠️ **Sa faiblesse est dite** : un appelant non migré échoue **fermé** (aucune donnée fausse n'entre) mais avec un message **trompeur** — *« PDF vide »* sur un PDF lisible. **Ce n'est pas bruyant, c'est muet-mais-sûr**, et le garde-fou n'est donc pas la forme : c'est le **témoin de SOURCE** qui exige que chaque appelant lise `.etat`. *Sans lui, une migration incomplète serait VERTE.*

**⛔ `raison` EST UN CODE, JAMAIS UNE PHRASE** (`plafond_pages` · `aucune_couche_texte`) — décision de Michel : un texte affichable dans une fonction de lecture serait un **second propriétaire de ce que voit la personne** (**R2**). *L'affichage se décide chez l'appelant*, et il annonce désormais **« N pages lues sur M »**.

**⭐ L'ORDRE DES TESTS EST UN CHOIX, FIGÉ PAR UN TÉMOIN (R30)** : *« rien lu »* l'emporte sur *« tronqué »*. Un 22 pages **sans aucun texte** rend `UNKNOWN`, pas `PARTIAL` — parce que la seule chose utile à en faire est de **descendre d'un cran** vers l'OCR. `PARTIAL` annoncerait *« lu en partie »* avec **zéro ligne** : la cascade s'arrêterait sur un résultat vide en croyant avoir réussi à moitié.

**⛔⛔ LE PÉRIMÈTRE, FIGÉ PAR 3 TÉMOINS, PARCE QUE MICHEL L'A ÉCRIT NOIR SUR BLANC** : **`MAX_PAGES` reste à 15** (*« pas de correction silencieuse du plafond sans d'abord rendre la troncature observable »*) · **`_pdfToImages` n'est PAS migrée** — c'est **A2**, et son 4ᵉ appelant est `addMealImportFile` (**nutrition**) : *« je ne veux aucune casse temporaire de l'import repas »*, donc **A2 attend le feu vert de l'autre session** · ses 4 appelants sont intacts.

**⚠️ TÉMOINS PAR STUB DE `pdfjsLib`, ET C'EST UN CHOIX** : aucun binaire (1,34 Mo) ni PDF personnel n'entre dans le dépôt, et le nombre de pages est **contrôlé** — donc les 3 états sont **déterministes et rejouables partout**, ce qu'un vrai PDF de 22 pages ne serait pas. ⛔ **Ce qui est éprouvé est NOTRE logique de contrat, pas pdf.js** ; la vraie bibliothèque a été mesurée séparément le matin même. *Dire ce qu'un test ne couvre pas fait partie du test.*

**⚠️⚠️ ET UN DE MES TÉMOINS ÉTAIT FAUX SUR DU CODE SAIN — la cause resservira.** Le garde de périmètre *« `_pdfToImages` n'est pas migrée »* bornait sa recherche à **1 400 caractères après la déclaration**. Or ce corps fait **836 caractères**, et `_pdfToText` — qui rend bel et bien le contrat — commence juste après : **le garde débordait sur la fonction VOISINE et rougissait sur du code parfaitement juste**. 👉 ***Une borne en distance de caractères n'est pas une borne de fonction*** (`BUGS.md` §63, reposé). Il découpe désormais le **corps réel**. ⭐ *Et c'est le contrôle sur le code sain qui l'a dit, pas une relecture* — la règle de ft-v1198 appliquée.

**⚠️⚠️ ET J'AI RENUMÉROTÉ LE TRAVAIL DE SESSION-A PAR ACCIDENT.** Deux blocs portaient **CCXCVI** dans mon arbre — le mien (l'audit Séance) et le leur (3-ii, `_qGrammes`), arrivé par la fusion. Mon `sed` global a renommé **les deux**. 👉 *Un renommage global suppose que le numéro est unique — c'est précisément faux au moment où l'on renumérote pour cause de collision.* Leurs **13 témoins** reprennent `CCXCVI`, mes **19** restent `CCCII`.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran utilisateur ne change : seul le Mode Test VM (admin) annonce désormais une lecture partielle (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **A2 n'est pas commencé** (feu vert nutrition attendu) · ⛔ **le lecteur CSV d'historique (B) n'est pas écrit** — Michel : *« arrête-toi avant B »* · ⛔ ni la cascade, ni pdf.js embarqué, ni `MAX_PAGES` · ⛔ nutrition, contexte de Milo et règles de progression intacts. ⚠️ **Michel doit vérifier sur Safari/iPhone** — en principe **rien** ne change côté utilisateur.

Tests : **bloc CCCIII, 18 témoins, 18 ✅ · 0 ❌.** ⛔ **CONTRÔLE NÉGATIF : 12 MUTATIONS, TOUTES MORDENT, contrôle sain à 0 rouge AVANT ET APRÈS** — ① le contrat rend toujours `COMPLETE` → **2** · ② le plafond n'est plus compté → **3** · ③ `pagesTotal` recopié depuis `pagesLues` → **2** · ④ une raison posée sur un succès → **1** · ⑤ ⭐ l'ordre s'inverse (`PARTIAL` gagne sur `UNKNOWN`) → **1** · ⑥ la raison devient un message d'interface → **1** · ⑦ le tri par X perdu → **1** · ⑧ ⛔ `MAX_PAGES` relevé en douce → **4** · ⑨ ⛔ `_pdfToImages` migrée au passage → **1** · ⑩ l'appelant revient à la liste nue → **2** · ⑪ ⭐ **l'appelant IGNORE le `PARTIAL`** (le défaut du jour, revenu) → **1** · ⑫ un littéral `'PARTIAL'` recopié à la main → **2**.

Fichiers : `log.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CHANTIER-IMPORTS.md`, `docs/PLAN-CONTRAT-IMPORTS.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1206. |

### 🔧 LES 3 CONSTATS DE L'AUDIT « ONGLET SÉANCE », CORRIGÉS — ET AUCUN N'ÉTAIT VISIBLE À L'ÉCRAN** — Michel lève lui-même l'ordre qu'il avait posé le matin (*« on refera un état des lieux quand j'aurai fini les bugs de la nutrition »*) : ***« vas-y corrige tout »***.

**⛔⛔ LE CONTRAT EST DONC CELUI DES EXTRACTIONS NUTRITION, ET POUR LA MÊME RAISON** : les trois constats sont **des pièges pour plus tard, pas des bugs qu'on subit** — donc *aucune valeur affichée ne doit bouger*. Une passe verte ne prouve pas ça (elle prouve que ce que les témoins **regardent** n'a pas bougé) : d'où un **instantané** avant/après, `tools/instantane_seance_audit.js`, rejouable.

**⭐ ① LA FONCTION ÉCRITE POUR EMPÊCHER UNE RECOPIE AVAIT ÉTÉ RECOPIÉE.** `_rpeDeRir` portait ce commentaire : *« la conversion n'a qu'un seul endroit… c'est justement pour ça qu'elle serait recopiée partout — **puis un jour l'une des copies dirait 9** »*. Mesuré : **appelée 0 fois**, et `10−n` retapée à la main dans **3 fonctions / 6 occurrences**. 👉 *L'avertissement était écrit juste au-dessus du code qui l'ignore* (**R2**). Un seul propriétaire désormais, et un **témoin de SOURCE** refuse toute nouvelle copie.

**⛔⛔ UN GARDE AJOUTÉ AU PASSAGE, ET IL EST DE LA FAMILLE ft-v1154** : hors de l'échelle, un cran `null` sortait **« 10 »** en RPE — c'est-à-dire l'affirmation *« série à l'échec »* pour une série que **personne n'a notée**. C'est exactement la confusion que Michel a fait corriger partout ailleurs (*« X et RIR 0 ne doivent surtout pas être considérés comme la même donnée »*). Il rend `''`. ⚠️ **Inatteignable aujourd'hui** (les appelants bornent le cran) : rendu inoffensif **plutôt que confié à eux pour toujours** — *un blanc se voit, un chiffre crédible et faux ne se voit pas* (**R29**).

**⭐ ② UNE FONCTION MORTE, ET UN TÉMOIN QUI RASSURAIT SUR ELLE.** `_rirTxt` n'était appelée par **aucun** fichier servi — seulement par un témoin du banc, qui croyait vérifier le libellé d'échec en RPE alors que l'écran passe par `_reserveEchecTxt` (**`BUGS.md` §58**). ⛔ **Et elle était PÉRIMÉE DEUX FOIS** : elle rendait *« échec »* pour un RIR 0 et *« RPE 10 (échec) »* — précisément ce que **ft-v1154** a corrigé. 👉 ***Une fonction morte ne se met pas à jour : elle attend qu'on la rebranche pour dire une chose fausse.*** Retirée **avec sa raison à sa place** (**R30**) ; le témoin remis sur le vrai chemin, celui qui **lit l'écran**.

**⭐ ③ TROIS RÉPONSES À UNE SEULE QUESTION.** *« Combien de repos si la personne n'a rien réglé ? »* valait **130** (`state.js`), **120** (`app.js` ×2) et **90** (`log.js` ×3). ⚠️ **Dormant** — `load()` pose toujours `S.defRest` — **mais déjà mordu** : en **ft-v1080**, l'éditeur de programme annonçait *90 s* quand la séance appliquait *130*. Un propriétaire (`reposDefaut()`), **6 sites rebranchés**, et un témoin de source interdit tout repli numérique recollé à `S.defRest`.

**⭐⭐ LE CORRECTIF DIT EN UNE SEULE MESURE** : dans l'instantané, le bloc **« vraie vie »** (le réglage posé) est **identique octet pour octet** avant/après — et le bloc **« état impossible »** (réglage absent) rend désormais **exactement le même sha** que lui (`f393110eb9c5c1d7`). *Le repli a cessé de changer quoi que ce soit.* ⛔ Les **4 seules cellules** qui bougent dans tout l'instantané sont le cran `null`, documenté ci-dessus.

**⚠️⚠️ ET DEUX FOIS MON PROPRE TÉMOIN S'EST TROMPÉ DE CIBLE — LA MÊME FAMILLE QUE §61/§63.** ① il comptait **7 copies pour 6** : la ligne du **propriétaire** contient forcément la conversion, c'est son métier ; ② puis il comptait comme copie **le commentaire R30 qui CITE `10-n` pour expliquer le retrait** — *un témoin qui ne distingue pas le code de ce qui en PARLE finit par interdire d'écrire la documentation du correctif*. C'est le piège de **ft-v1193**, repayé à trois semaines d'écart. 👉 ***L'instrument fait partie de la mesure.***

**⚠️⚠️ ET J'AI CASSÉ DEUX DE MES PROPRES RÈGLES D'OUTILLAGE DANS LA MÊME MINUTE — dit parce que ça resservira.** ① J'ai corrigé un **commentaire** de `state.js` — un fichier **servi** — *pendant* que la passe tournait : c'est **§60** mot pour mot. ⭐ Prouvé inerte (le fichier **débarrassé de ses commentaires** est identique au caractère près avant/après), **mais la passe a quand même été relancée à neuf** : *une règle qu'on contourne parce qu'on a la preuve que c'était sans danger cette fois-ci n'est plus une règle.* ② En voulant l'arrêter, `pgrep -f "…runner.js" | xargs kill` a **tué mon propre shell** — le motif est dans sa propre ligne de commande. C'est le piège de **ft-v1189 et ft-v1193**, payé une **troisième** fois ; le remède est de filtrer sur `/proc/<pid>/cmdline` au lieu du motif. ⛔⛔ **Et le résultat de cette passe avortée est le pire des trois** : elle s'est arrêtée à mi-parcours en affichant **0 rouge** — *exactement §61*, une passe interrompue ressemble trait pour trait à une passe verte.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun bouton n'apparaît, rien n'est à faire : trois pièges de maintenance sont désamorcés (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **la nutrition n'est PAS touchée** — consigne de Michel le même jour (*« tu ne touches surtout pas à la nutrition »*), c'est le chantier de l'autre session · ⛔ aucun autre orphelin de `log.js` n'est retiré (les 11 documentés restent, **R30**) · ⛔ ni le RIR lui-même, ni le RPE, ni le stockage, ni Milo. ⚠️ **Michel doit vérifier sur Safari/iPhone** — en principe **rien** ne doit avoir changé, et c'est précisément ce qu'il y a à vérifier.

Tests : **parcours 3583/3583 sur l'arbre FINAL** (+19, bloc **CCCII**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées — aucun trou nouveau. ⛔ **CONTRÔLE NÉGATIF : 11 MUTATIONS, TOUTES MORDENT, chacune sur son témoin** — ① le propriétaire rend un chiffre au lieu de `null` → **2** · ② une copie de la conversion réapparaît → **1** · ③ le propriétaire redevient décoratif → **1** · ④ le garde « pas un cran » retiré → **2** · ⑤ `_rirTxt` remise en place → **1** · ⑥ l'écran n'affiche plus le libellé du propriétaire → **1** · ⑦ le repos ignore le réglage de la personne → **1** · ⑧ un site garde son propre repli → **2** · ⑨ le repli n'est plus celui de l'installation → **1** · ⑩ les règles par TYPE avalées → **1** · ⭐ ⑪ **une copie qui ÉCHAPPE au motif** (`10 - +n`) → **1 rouge, exactement le second verrou** — *c'est elle qui prouve que le témoin « le propriétaire est vraiment appelé » n'est pas décoratif.*

Fichiers : `log.js`, `state.js`, `app.js`, `coach.js`, `tests/parcours/runner.js`, `tools/instantane_seance_audit.js`, `sw.js`, `CLAUDE.md`, `BUGS.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/SUIVI-AUDIT.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1205. |
**📷 LE SCANNER CAMÉRA LOCAL, RÉÉVALUÉ AVANT RÉACTIVATION — ET LA VRAIE CAUSE DU RETRAIT TIENT DANS UN APRÈS-MIDI · 14/09/2026, SANS NOUVELLE VERSION** — Michel ouvre un chantier séparé après le dossier réseau : ⛔ ***« lire un code-barres sans appel IA, puis utiliser exactement le même lookup Open Food Facts que le code tapé »*** · ***« je ne veux PAS réactiver aveuglément un ancien bouton jugé peu fiable. Je veux comprendre exactement pourquoi il avait été retiré et mesurer si ce problème existe encore »*** · ⛔⛔ ***« ne remets PAS immédiatement le bouton en production »***.

**⚠️ AUCUN FICHIER SERVI N'EST MODIFIÉ — `sw.js` N'EST DONC PAS BUMPÉ.** Seuls `tests/`, `tools/` et la doc changent. ⛔ **Aucun comportement touché, aucun bouton remis.** Dossier complet : **`docs/SCANNER-CAMERA-LOCAL.md`**.

**⭐⭐ LA CHRONOLOGIE, LUE DANS GIT — ET C'EST ELLE QUI DÉCIDE DE TOUT.** Le scanner live est né et mort **le même après-midi** :

| heure (11/07/2026) | version | ce qui s'est passé |
|---|---|---|
| **14:33** | **ft-v376** | le scanner caméra live est **créé** |
| 15:29 | ft-v377 | ⛔⛔ **la recherche produit était CASSÉE** — *« v2 renvoie `success` pas 1 → **tout était rejeté introuvable** »* |
| 15:40 | ft-v378 | correctif *« **caméra ouverte mais ne lit pas** »* (1080p, bouton « Capturer », mise au point continue) |
| 16:57 | ft-v384 | saisie manuelle ajoutée — *« **repli quand le scan galère** »* |
| **17:10** | — | **retrait** : *« **trop capricieux iPhone** »* |

**⭐⭐ TROIS FAITS QU'AUCUN RÉSUMÉ NE DONNAIT** : ① le scanner live a vécu **2 h 37** · ② pendant **~1 h** de ces 2 h 37, **la recherche produit rejetait TOUS les produits** — donc *un code parfaitement décodé affichait « produit introuvable »*, ce qui ressemble trait pour trait à un scanner qui ne marche pas · ③ le retrait **n'a tenté aucune correction** : le commit touche **`index.html` seulement, 6 lignes**, et son message le dit — *« Fonctions scan conservées (inertes) »*. 👉 ***Le jugement a été porté en moins de trois heures, sur une fenêtre qui contenait une panne de lookup.***

**⛔ MAIS ÇA NE BLANCHIT PAS LE SCANNER, ET JE NE LE PRÉTENDS PAS** : ft-v378 nomme un vrai symptôme iPhone, et **1 h 17 plus tard** ft-v384 parle encore d'un *« scan qui galère »*. **Un problème iPhone réel persistait après le correctif.**

**⭐⭐ LE DÉCODEUR, LUI, EST MESURÉ — 17 CAS SUR 20 À 3/3.** Trois vrais codes-barres encodés en EAN-13 selon la norme, dégradés, décodés par le **ZXing réellement servi**. Passent : net · petit · éloigné · **vu de près** · incliné 5-20° · **incliné 90°** · flou 1 px · **faible lumière 25 %** · contraste écrasé · **reflet métal 75 %** · cumul réaliste. Échouent : **incliné 45°**, **flou dès 2 px**, reflet quasi opaque. ⭐⭐ **Le flou est le seul vrai ennemi, et brutalement : 1 px passe, 2 px ne passe plus.** 👉 ***Sur un téléphone, « flou » s'appelle « mise au point »*** — c'est exactement le symptôme de ft-v378, et **la cause la plus probable du retrait est donc l'autofocus**, mesurée et non devinée. ⭐ Et les réglages servent : un code en **paysage** est lu **3/3 avec** `_bcHints()` et **0/3 sans**.

**⚠️ ET MA PREMIÈRE MESURE ÉTAIT FAUSSE — MA FIXTURE, PAS ZXing.** Elle concluait *« code vu de près : 0/3 »*. Je laissais une marge blanche de **20 pixels**, alors que la norme EAN-13 exige une zone de silence de **9 à 11 MODULES** : à 8 px par module, 20 px ne valent que **2,5 modules**. Corrigé → **3/3**. 👉 ***Un paramètre exprimé dans la mauvaise unité ne mesure pas le code, il mesure le test*** (`BUGS.md` §63). Un garde du PDF refuse désormais que la zone de silence repasse en pixels.

**⭐⭐ LE BANC CONDUIT MAINTENANT UNE VRAIE CAMÉRA.** Le bloc **CCCVIII** lance un **second navigateur** avec une **caméra factice** (un Y4M fabriqué à la volée, qui *filme* un vrai EAN-13) et intercepte `fetch` par domaine. 👉 *Sans elle, on n'éprouve que le DÉCODEUR ; or la question porte sur la CHAÎNE* — c'est la leçon de ft-v1208 appliquée d'avance.

**✅ LE RÉSULTAT RÉSEAU, MESURÉ** : scanner caméra → **0 appel IA**, **quota inchangé**, **même `_lookupBarcode`**, **même objet produit** que le code tapé. ⭐⭐ **Le scanner ne crée AUCUN chemin nutrition nouveau** : le résolveur, la douane et le journal ne voient aucune différence. Sur un code illisible : **0 lookup, 0 appel IA**, un message qui dit quoi faire, et la caméra **reste ouverte** pour réessayer — *le repli n'est PAS un appel IA automatique*.

**⛔⛔ QUATRE DÉFAUTS TROUVÉS DANS LE CODE ORPHELIN — MESURÉS, ÉCRITS, NON CORRIGÉS** (règle du projet depuis ft-v1200) : ① ⭐⭐ **une COURSE** — le décodage continu et le bouton « Capturer » peuvent lire le même code à **28 ms d'intervalle** et tirer **chacun** son lookup ; cause structurelle : la capture ne désarme le continu qu'**après** son `await` (~500 ms) · ② le bouton de repli photo cherche `af-bc-input`, **retiré avec ft-v388** : il ne fait rien · ③ le décodage **LOCAL** d'une photo (`onBarcodeFile`, `photo-code`) est orphelin lui aussi — *c'est le seul chemin photo sans IA* · ④ le scanner ne dit pas sa provenance explicitement.

**⚠️⚠️ ET LA COURSE A PRODUIT UN MAUVAIS TÉMOIN — LE MIEN, ATTRAPÉ PAR LE CONTRÔLE NÉGATIF.** Elle est **intermittente** : selon qui gagne, on observe **1 ou 2** lookups. Ma première version comptait *« exactement 2 »* et **est passée au rouge dès que la machine était moins chargée**. 👉 ***Un témoin qui dépend du vainqueur d'une course ne mesure pas la course, il mesure la charge de la machine.*** C'est un **témoin de SOURCE** qui la fige. ⛔ **Et ce témoin-là était aveugle à son tour** : il cherchait *« un désarmement APRÈS l'await »* — or il en existe un de toute façon, donc **corriger la course le laissait vert**. Il mesure désormais qu'**aucun désarmement n'existe AVANT**. *Un motif qui cherche une présence ne peut pas mesurer un ORDRE.*

**⭐ DEUX CORRECTIFS SONT ARRIVÉS PENDANT QUE LE SCANNER ÉTAIT ORPHELIN** — ft-v1091 (l'écran dans la table de fermeture) et ft-v1092 (le bouton retour) : *le code orphelin d'aujourd'hui est meilleur que celui qui a été retiré en juillet.*

**⚠️ LA PROVENANCE `camera-code-local` QUE MICHEL DEMANDE EXISTE DÉJÀ — SOUS LE NOM `scan`.** Renommer coûterait des lignes de journal portant un nom disparu (**l'historique est hors périmètre**) et un **cinquième** nom pour une chose qui en a un. **Recommandation : garder `scan`, rendre l'appel explicite. Décision de Michel.**

**⭐ UX PROPOSÉE — LOCAL D'ABORD, IA EN SECOURS.** Un **seul** bouton de plus dans l'écran d'ajout, et le repli IA **dans l'écran du scanner, après un échec** — là où la personne est bloquée. ⛔ **Pas de basculement automatique** : ce serait un appel payant sans geste, et *un code flou restera flou* — on paierait un appel pour échouer deux fois.

**⭐⭐ VERDICT : RÉACTIVER AVEC FALLBACK IA** — sous quatre conditions (la course, le bouton mort, le repli contextuel) **et après validation iPhone**. ⛔ Pas *« ne pas réactiver »* : la mesure ne soutient pas le jugement de juillet. ⛔ Pas *« réactiver »* tout court : le flou casse tout dès 2 px. ⚠️ **La cause Safari/iPhone n'est PAS mesurable d'ici** — ce conteneur n'a ni caméra ni Safari, et je ne présente pas la fiabilité mobile comme validée. Un **protocole iPhone** (5 produits, 5 gestes) attend Michel dans le dossier.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucune ligne de code servi ne change.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **aucune réactivation**, aucun bouton remis · ⛔ **aucun des 4 défauts corrigé** (feu vert séparé) · ⛔ périmètre de Michel intact : le résolveur énergie/macros, la **douane**, `savedFoods`, les quantités, les portions, l'historique, les migrations, **Milo**, l'estimation libre d'un repas.

Tests : **parcours TOTAL/TOTAL sur l'arbre FINAL** (bloc **CCCVIII**, 19 témoins). **Calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou nouveau. ⛔ **CONTRÔLE NÉGATIF : 14 MUTATIONS, TOUTES MORDENT, contrôle sain à 0 rouge avant ET après, sur un arbre COPIÉ** — **les 7 nommées par Michel** : ① le scanner appelle le Worker IA → **1** · ② il boucle sur le lookup → **2** · ③ il produit un numéro faux → **2** · ④ il court-circuite `_lookupBarcode` → **5** · ⑤ la provenance locale devient celle de l'IA → **1** · ⑥ ⭐ **repli IA automatique sans geste** → **1** · ⑦ la caméra reste allumée → **1** · **et 7 miennes** : ⑧ ⭐⭐ **le scanner retrouve une porte d'entrée** (R30) → **1** · ⑨ ZXing depuis un CDN → **9** · ⑩ les réglages du décodeur sautent → **1** · ⑪ ⭐ **la course est CORRIGÉE** → **1, exactement le témoin qui la fige** · ⑫ le scanner sort de la table de fermeture → **1** · ⑬ la caméra ne demande plus l'arrière → **1** · ⑭ hors périmètre : le repli mort est « réparé » → **1**. ⚠️ **Et 5 de mes mutations étaient invalides au premier jet** : deux remplaçaient le code par un commentaire **contenant le mot cherché** (`stopStreams`, `TRY_HARDER`), deux visaient **un seul des deux lecteurs** alors que la course décide lequel s'exécute, et une testait un arbre non rafraîchi. *Une mutation qui ne fait pas ce qu'elle annonce est indiscernable d'un garde aveugle* — le mode `ALL` du harnais l'interdit désormais.

📄 **PDF POUR GPT** : `docs/SCANNER-CAMERA-LOCAL.pdf` (**23ᵉ** de la série), généré par `tools/gen_scanner_pdf.py` — **36 gardes**, **15 mutations éprouvées sur un arbre COPIÉ**, toutes refusent, contrôle sain vert avant ET après, arbre revérifié identique au dépôt. ⭐ Ses gardes les plus utiles protègent des **décisions** : que le scanner **n'ait pas retrouvé de porte**, que la **course n'ait pas été corrigée en silence** (le document la décrit comme ouverte), que le banc **conduise encore une vraie caméra**, et que la **zone de silence reste en MODULES**. ⚠️ **Et mon validateur de police refusait du travail juste** : il testait la plage **latin-1** et rejetait le tiret cadratin, que cp1252 code pourtant en `0x97`. *Un contrôle plus strict que la contrainte réelle refuse du travail juste* — il **encode** désormais au lieu de deviner.

Fichiers : `tests/parcours/runner.js`, `docs/SCANNER-CAMERA-LOCAL.md` (nouveau), `tools/gen_scanner_pdf.py` (nouveau), `docs/SCANNER-CAMERA-LOCAL.pdf` (nouveau), `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/INVENTAIRE.md`. ⛔ **`sw.js` inchangé : aucun fichier servi modifié.** |

**🔌 LE CHEMIN RÉSEAU DU CODE-BARRES, PROUVÉ — ET LA QUESTION ÉTAIT MAL POSÉE, PAS LA RÉPONSE · 14/09/2026, SANS NOUVELLE VERSION** — Michel : ⛔ ***« prouver exactement ce qui se passe quand un utilisateur scanne un code-barres, et vérifier que ce chemin n'appelle ni Milo, ni Anthropic, ni aucun autre service IA »*** · ***« je veux une preuve, pas une hypothèse »***.

**⚠️ AUCUN FICHIER SERVI N'EST MODIFIÉ — `sw.js` N'EST DONC PAS BUMPÉ.** Seuls `tests/` et les journaux changent. ⛔ **Et aucun comportement n'a été touché.**

**⭐⭐ LA MESURE : `fetch` INTERCEPTÉ ET CLASSÉ PAR DOMAINE, sur le code-barres `3083681011791`.** Aucune requête ne part : on compte ce que l'app **DEMANDE**, pas ce que le réseau laisse passer.

| porte | appels | domaines | appels IA |
|---|---|---|---|
| **code-barres TAPÉ** | **1** | `world.openfoodfacts.org` | **0** |
| **photo du code-barres** | **2** | `dry-field-e931.forcetracker-app.workers.dev` + `world.openfoodfacts.org` | **1** |

**⛔⛔ ET LA VRAIE RÉPONSE EST PLUS NUANCÉE QUE LA QUESTION — c'est le fait de la journée.** Michel demandait *« le scan appelle-t-il l'IA ? »* en supposant qu'un scan caméra existe. **Mesuré : il n'y en a pas.** Le scanner **ZXing** (décodage **100 % local**, bibliothèque servie depuis le dépôt, **zéro réseau**) est bien dans le code — `openBarcodeScanner`, `scanBarcode` — mais ⛔ **aucun bouton ne l'appelle**. 👉 ***Le seul « scan » atteignable depuis l'écran est la photo lue par l'IA***, et c'est écrit dans le libellé de son bouton : *« 📷 Ou photographier le code-barres (**IA lit les chiffres**) »*.

**⛔ CE N'EST PAS UN DÉFAUT, ET JE NE L'AI PAS « RÉPARÉ » (R30).** Deux entrées d'archive le disent : **ft-v388** (11/07/2026) — *« Ancien bouton 📷 scanner caméra (**peu fiable**) **RETIRÉ**, remplacé par la saisie du numéro (rapide et fiable) »* — et **ft-v871**, qui avait déjà reposé la question à Michel **sans rien toucher**. *La décision existe et elle est écrite ; ce n'était pas à moi de la renverser.*

**⚠️ UNE CONSÉQUENCE MESURÉE AU PASSAGE, NON CORRIGÉE** : `scanBarcodePhoto` cherche l'élément `af-bc-input`, **retiré avec ft-v388**. Donc le bouton *« 🖼️ Prendre une photo à la place »* du scanner caméra ferme l'overlay et **ne fait rien** — **0 appel mesuré**. ⭐ **Invisible aujourd'hui** puisque le scanner lui-même est inatteignable : *un bouton mort derrière une porte murée ne dérange personne, mais il redevient un bug le jour où on rouvre la porte.* Figé par un témoin, rendu à Michel.

**⭐⭐ LES DEUX PORTES CONVERGENT, ET C'EST VÉRIFIÉ SUR L'OBJET ENTIER** : `_manualBarcode` et `onBarcodePhotoIA` appellent toutes deux **`_lookupBarcode`** → `_offFetchProduct` → `_ref100` → le résolveur. **Même objet final**, comparé en entier. ⭐ Et la **provenance** les distingue quand même : `code-tape` contre `photo-code-ia` — *le résultat est le même, la façon dont il est entré ne l'est pas, et la seconde n'a **pas** de clé de contrôle vérifiée* (**R33**).

**📊 LE COÛT DE L'UNIQUE APPEL IA, MESURÉ DANS LE WORKER** : modèle **Claude Haiku 4.5**, **`max_tokens: 100`**, **une** image redimensionnée à **1 100 px / qualité 0,85**, prompt d'une quinzaine de lignes. Décompté sur les **25 essais gratuits** (`FOOD_AI_FREE_LIMIT`), illimité en Premium. ⚠️ **Je ne chiffre pas un prix** : les tarifs ne se devinent pas, ils se lisent sur la facture.

**⛔ CE QUE COÛTERAIT SON RETRAIT — mesuré, pas proposé** (§6 de sa demande, *« je déciderai ensuite »*) : ① **le scan peut fonctionner sans IA** — ZXing est **déjà dans le dépôt** et décode en local ; ② mais il a été retiré **parce qu'il était jugé peu fiable** en juillet ; ③ et ⭐ **ZXing vérifie la clé de contrôle du code-barres, l'IA non** — d'où le garde `_eanValide` posé exprès après la lecture IA. 👉 ***Retirer l'appel IA ne coûte rien techniquement ; ça coûte le confort de photographier au lieu de taper treize chiffres.*** **Aucune décision prise.**

**⛔⛔ ET ON NE FIGE PAS « le scan ne fait aucun appel IA » — ce serait figer un contrat FAUX.** Le témoin fige le contrat **réel** : la photo fait **exactement un** appel IA, **annoncé** dans le libellé et **décompté** du quota. *Un témoin qui affirme ce qu'on aurait aimé lire ne protège rien.*

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucune ligne de code servi ne change.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **aucun correctif** — rien n'a été trouvé de cassé dans le chemin mesuré · ⛔ le **scanner caméra orphelin** et son **bouton de repli mort** sont **figés en l'état**, pas réparés (**R30**, décision de Michel attendue) · ⛔ périmètre Nutrition intact : la douane, `savedFoods`, l'historique, les migrations, les `ml`, `saveEditFood`, `rejouerRepas`, l'estimation IA.

Tests : **parcours 3834/3834 sur l'arbre FINAL** (bloc **CCCVII**, 15 témoins). **Calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou nouveau. ⛔ **CONTRÔLE NÉGATIF : 8 MUTATIONS SUR LE BANC, TOUTES MORDENT, contrôle sain à 0 rouge avant ET après, sur un arbre COPIÉ** — ① **la photo passe par `estimateFoodAI`** → **5** · ② **le code TAPÉ appelle le Worker IA** → **3** · ③ ⭐⭐ **le LOOKUP COMMUN appelle le Worker IA** (un appel posé là toucherait les deux portes) → **5** · ④ **scan et saisie divergent** (la photo n'utilise plus le même lookup) → **4** · ⑤ la recherche produit change de destination → **4** · ⑥ ZXing part d'un CDN au lieu du dépôt → **1, exactement lui** · ⑦ l'appel IA n'est plus décompté du quota → **1, exactement lui** · ⑧ la provenance ne distingue plus l'IA d'un décodage vérifié → **1, exactement lui**. ⚠️ **Et ma mutation ⑦ était invalide au premier jet** : la ligne de décompte existe **trois fois** (étiquette · photo du code · estimation), je n'en changeais qu'une. Ré-ancrée sur le commentaire qui la précède, unique à cette porte — *une mutation qui ne fait pas ce qu'elle annonce est indiscernable d'un garde aveugle*, écrit en ft-v1205 et repayé ici.

📄 **PDF POUR GPT** : `docs/CHEMIN-RESEAU-CODEBARRES.pdf` (**22ᵉ** de la série), généré par `tools/gen_reseau_pdf.py` — **78 gardes** qui recomptent chaque fait depuis le code servi, **13 mutations éprouvées sur un arbre COPIÉ**, toutes refusent, contrôle sain vert avant ET après, arbre revérifié identique au dépôt à la fin. ⭐ Ses gardes les plus utiles protègent une **ABSENCE** : que le scanner caméra n'ait pas retrouvé de porte d'entrée (*« relire ft-v388 et ft-v871 avant de republier ce document »*), qu'aucun appel IA ne se soit glissé dans le lookup commun, et que la recherche produit n'ait pas changé de destination. ⚠️⚠️ **ET LE CONTRÔLE NÉGATIF A TROUVÉ UN GARDE AVEUGLE À MOI, sur le fait le plus délicat du document.** Celui du quota était écrit `'FOOD_AI_FREE_LIMIT' not in C and 'foodAiUses' not in C` : ***un `and` entre deux ABSENCES est un `ou` entre deux PRÉSENCES*** — il suffisait qu'un des deux mots reste pour qu'il se taise. **Mesuré : retirer l'INCRÉMENT en laissant les deux contrôles de mur le laissait parfaitement vert.** 👉 ***Lire un plafond n'est pas le décompter*** — il cherche désormais l'**écriture** `S.foodAiUses = (S.foodAiUses||0)+1`, seule preuve du décompte, et la lecture du plafond **séparément** : deux faits, deux gardes. *Un garde qu'on n'éprouve pas est une affirmation, pas une garantie.*

Fichiers : `tests/parcours/runner.js`, `tools/gen_reseau_pdf.py` (nouveau), `docs/CHEMIN-RESEAU-CODEBARRES.pdf` (nouveau), `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/INVENTAIRE.md`. ⛔ **`sw.js` inchangé : aucun fichier servi modifié.** |

**📱 VALIDATION iPHONE RÉELLE DU CAS RAYNAL — VÉRIFIÉ, FIGÉ, RIEN CHANGÉ · 13/09/2026, SANS NOUVELLE VERSION** — Michel donne sa capture comme **témoin iPhone réel** du chemin complet et demande de le **vérifier et figer sans ouvrir de chantier** : ⛔ ***« Ne change rien au comportement si tout correspond au contrat actuel. »***

**⚠️ AUCUN FICHIER SERVI N'EST MODIFIÉ — `sw.js` N'EST DONC PAS BUMPÉ.** Seuls `tests/`, `tools/` et la doc changent. ⛔ **Et aucun comportement n'a été touché** : tout correspondait déjà.

**✅ LES 7 POINTS, MESURÉS EN RUNTIME SUR LE CODE DÉPLOYÉ** — en conduisant les **vraies portes**, pas en appelant les fonctions à la main :

| question | réponse mesurée |
|---|---|
| état | **`ALTERNATIVE_FIABLE`** — et non `DERIVE_ESTIMABLE` |
| méthode / confiance | `autre_champ_source` · **`source`** |
| champ retenu | **`energy-kj_100g`** — 415 / 4,184 = **99,187…** → **99,2** |
| champ d'origine du brut | **`energy-kcal_100g`** (`champSource`) |
| valeur brute | **48,3**, conservée avec la ligne |
| 410 g | **407 kcal** · 25 · 41 · 13 |
| scan = tapé | **oui** — écran, résolution et ligne identiques |

**⭐⭐ ET LA QUESTION « RIEN N'EST RECALCULÉ INUTILEMENT » EST MESURÉE, PAS AFFIRMÉE.** L'estimation depuis les macros est appelée **une seule fois**, elle rend **93,2** — et c'est **99,2** qui est retenu. 👉 ***Elle sert de JUGE de crédibilité, jamais de source*** : c'est elle qui refuse un second champ absurde (un champ à 3 000 kJ deviendrait sinon notre valeur de confiance). ⛔ **On ne la supprime donc pas « pour économiser »** — trois produits et une addition ferment une vraie faille.

**⛔⛔ ET UN DÉFAUT DE TÉMOIN A ÉTÉ TROUVÉ EN ÉCRIVANT CETTE VALIDATION.** Mon témoin « scan = tapé » passait `saisie:'manuel'` — **une valeur qui n'existe pas en production** : la vraie porte `_manualBarcode` enregistre **`'code-tape'`**. **Le témoin était vert par accident.** 👉 ***Vérifier la fonction n'est pas vérifier l'appel*** (`BUGS.md` §58). Il remplit désormais le champ et appelle la porte, comme la personne — et un témoin frère vérifie que la **provenance**, elle, distingue bien les deux (`scan` contre `code-tape`, contrat posé le 23/08 après un retour de Michel).

**📄 LE CAS EST ÉCRIT : `docs/VALIDATION-IPHONE-RAYNAL.md`** — la transcription exacte de la capture, la conclusion factuelle en 8 points, la mesure de l'estimation-juge, et la liste des témoins qui figent chaque fait. ⚠️ **La capture est TRANSCRITE, pas embarquée** : c'est une photo de son écran et le dépôt est **public** ; ce qui doit être figé, ce sont les **valeurs**. *Une image ne peut pas rougir ; un témoin, si.*

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucune ligne de code servi ne change.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **aucun correctif** — tout était conforme · ⛔ périmètre nommé par Michel intact : la **douane**, `savedFoods`, l'historique, les migrations, les `ml`, `saveEditFood`, `rejouerRepas`, l'**estimation IA**, les autres règles Nutrition. ⚠️ **Et la donnée reste fausse chez Open Food Facts** : la corriger à la source profiterait à tous ceux qui scannent ce produit — geste que Michel peut faire, pas l'app.

Tests : **parcours 3819/3819 sur l'arbre FINAL** (bloc **CCCVI** porté à **22** témoins). **Calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou nouveau. ⛔ **CONTRÔLE NÉGATIF : 4 MUTATIONS, TOUTES MORDENT, contrôle sain à 0 rouge avant ET après** — ① ⭐⭐ **la valeur d'Atwater est retenue au lieu du candidat de la source** → **7** · ② la porte tapée change d'étiquette de provenance → **1, exactement ③bis** · ③ les deux portes divergent → **1, exactement ③** · ④ la méthode ment (« dérivé » alors qu'on a pris la source) → **2**.

📄 **PDF POUR GPT** : `docs/CAPTURE-IPHONE-TRANCHEE.pdf` régénéré (**60 gardes**, **5 mutations** de plus, toutes refusent) — dont quatre qui protègent le **document de validation** lui-même : il doit exister, et porter ses 8 faits. ⚠️ **Et j'ai cassé mon propre générateur en l'écrivant** : j'ai nommé une variable `_v`, qui **écrase le validateur de police** du même nom — un `'str' object is not callable` à 170 lignes de là. *Un nom court réutilisé coûte plus cher qu'un nom long.*

Fichiers : `tests/parcours/runner.js`, `docs/VALIDATION-IPHONE-RAYNAL.md` (nouveau), `tools/gen_1208_pdf.py`, `docs/CAPTURE-IPHONE-TRANCHEE.pdf`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/INVENTAIRE.md`. ⛔ **`sw.js` inchangé : aucun fichier servi modifié.** |

**📱 2ᵉ CAPTURE : ÇA MARCHE — ET ELLE RÉPOND ENFIN À LA QUESTION DU 48,3 · 13/09/2026, SANS NOUVELLE VERSION** — Michel renvoie une capture à 23:23, une fois passé par l'Accueil : **407 kcal** pour 410 g, et l'avertissement 🔬 qui dit *« l'app utilise 99.2 kcal/100 g, l'autre valeur de la fiche (`energy-kj_100g`) »*.

**⚠️ AUCUN FICHIER SERVI N'EST MODIFIÉ — `sw.js` N'EST DONC PAS BUMPÉ** : seuls `tests/`, `tools/` et les journaux changent. *Un bump gratuit fait re-télécharger l'app à tout le monde pour rien.*

**⭐⭐ LA QUESTION OUVERTE DEPUIS ft-v1207 EST TRANCHÉE, ET PAS PAR MOI : PAR SON ÉCRAN.** La fiche Open Food Facts porte **DEUX** valeurs énergétiques qui se contredisent :

| champ de la fiche | valeur | verdict |
|---|---|---|
| `energy-kcal_100g` | **48,3 kcal** | ⛔ **fausse** — ses protéines et lipides valent déjà 53,2 |
| `energy-kj_100g` | **≈ 415 kJ = 99,2 kcal** | ✅ **cohérente** — à 6,4 % des macros |

👉 ***C'est l'hypothèse A : le 48,3 est une erreur DANS LA BASE, pas une conversion ratée de l'app.*** ⭐ **Et le correctif de la veille a servi immédiatement** : la ligne enregistrée porte `champSource: 'energy-kcal_100g'` — sans lui, ce champ aurait été écrasé et la réponse serait repartie avec.

**⭐⭐ ET L'APP A PRIS LE BON CHEMIN SANS QU'ON LUI DISE** : elle a préféré **une valeur de la source** (99,2) à une **estimation** depuis les macros (93,2). *L'ordre de priorité — une donnée avant un calcul — vérifié sur un vrai produit et non sur une fixture.* Reproduction **exacte** en runtime : même nom (« · 99.2 kcal/100g »), même 407 kcal, même message au caractère près.

**⛔⛔ ET CETTE CAPTURE A MONTRÉ UN DÉFAUT DANS MON BANC, PAS DANS L'APP — c'est le fait du jour.** Ma fixture de ft-v1208 **inventait une fiche plus pauvre que la vraie** (sans le second champ), donc elle éprouvait la **dérivation** pendant que le vrai produit passe par l'**alternative**. J'avais écrit dans le journal *« la capture est rejouée à chaque passe »* — **c'était faux**. 👉 ***Un test qui n'emploie pas le schéma de la production ne teste rien, il rassure*** (`docs/SUIVI-AUDIT.md`, repayée sur une fixture que j'avais moi-même appauvrie). Les **deux** branches sont désormais éprouvées sur le même produit.

**⛔⛔ ET LE CONTRÔLE NÉGATIF A TROUVÉ DEUX GARDES QUE RIEN N'ÉPROUVAIT** — ni CCCVI, ni CCCV : *« le second champ viole aussi la loi »* et *« le second champ est absurde »*. Les retirer laissait le banc **entièrement vert**, parce que le vrai produit a un second champ **valide** et **proche des macros**. ⭐⭐ **Et le premier a demandé un AUTRE ALIMENT** : sur les lentilles, un candidat sous le plancher (52,5) est **forcément** à plus de 30 % sous les macros (65,2) — *l'autre garde l'attrape toujours en premier, donc celui-ci y est inatteignable*. Il fallait un aliment où plancher et estimation coïncident : une **huile** (0 g de glucides, plancher 900 = macros 900). 👉 ***Deux gardes qui se recouvrent sur un produit ne se recouvrent pas sur tous*** — et c'est la seule façon de les éprouver séparément.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucune ligne de code servi ne change.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ rien n'est corrigé dans l'app — **elle faisait déjà ce qu'il fallait** · ⛔ le garde de mise à jour reste intact (**R30**), la question « prévenir hors séance ? » est toujours rendue à Michel · ⛔ `savedFoods`, l'historique, les migrations, les `ml`, `saveEditFood`, `rejouerRepas`, les 21 règles de la douane et `estimateFoodAI` restent hors périmètre. ⚠️ **Une donnée fausse dans Open Food Facts reste fausse** : la corriger à la source est un geste que Michel peut faire sur le site, et qui profiterait à tout le monde.

Tests : **parcours 3817/3817 sur l'arbre FINAL** (bloc **CCCVI** porté à **20** témoins). **Calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou nouveau. ⛔ **CONTRÔLE NÉGATIF : 4 MUTATIONS CIBLÉES, TOUTES MORDENT, contrôle sain à 0 rouge avant ET après** — ① les valeurs de la source sont ignorées (on estime toujours) → **6** · ② la conversion du second champ est fausse → **6** · ③ un second champ qui **viole aussi la loi** est accepté → **1** (éprouvé sur l'huile) · ④ un second champ **absurde** est accepté → **1**.

📄 **PDF POUR GPT** : `docs/CAPTURE-IPHONE-TRANCHEE.pdf` régénéré (**56 gardes**) — il porte désormais la vraie fiche et la réponse au 48,3. ⚠️ **Et deux de ses nouveaux gardes se laissaient satisfaire par une SOUS-CHAÎNE** (`FICHE_SANS_KJ` est contenu dans `FICHE_SANS_KJx`) : *le piège de `presentsX` de la veille, reposé le lendemain*. Fermés sur la déclaration **et** l'usage.

Fichiers : `tests/parcours/runner.js`, `tools/gen_1208_pdf.py`, `docs/CAPTURE-IPHONE-TRANCHEE.pdf`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/INVENTAIRE.md`. ⛔ **`sw.js` inchangé : aucun fichier servi modifié.** |
**ft-v1208 — 📱 LA CAPTURE iPHONE TRANCHÉE PAR LA MESURE · LE CODE ÉTAIT JUSTE, LA VERSION SERVIE NE L'ÉTAIT PAS** — Michel envoie une capture de son iPhone (13/09, 20:02) : lentilles Raynal à 410 g, **198 kcal**, l'ancien encadré *« ne colle pas à ces macros »* et son bouton *« Mettre 381 kcal »* — soit exactement le comportement que ft-v1207 était censé avoir supprimé. ⛔ **Sa consigne décide de tout** : ***« ne corrige rien avant d'avoir tranché A / B / C »***, ***« ne considère pas la capture comme une preuve que ft-v1207 est cassée tant que tu n'as pas d'abord vérifié qu'elle est réellement exécutée »***.

**⭐⭐ VERDICT : B — ET CHAQUE BRANCHE EST FERMÉE PAR UNE MESURE, PAS PAR UN RAISONNEMENT.**

| branche | ce qui la ferme |
|---|---|
| **A** — pas déployée | ⛔ **tombe** : déploiement Pages `success` sur `7e8d3ea9` à **16:32:51 UTC**, soit **1 h 30 avant** la capture |
| **C** — exécutée mais le résolveur n'atteint pas le code-barres | ⛔ **tombe** : trace runtime complète du chemin réel sur le code servi — **410 g → 382 kcal**, avertissement 🔬 présent, trace posée sur la ligne, **0 erreur JS** |
| **B** — déployée mais version périmée servie | ✅ **retenue** |

**⭐⭐ ET LA PREUVE QUE C'EST B EST DANS LA CAPTURE ELLE-MÊME — c'est le geste qui a tout décidé.** Mesuré sur les **8 origines** : sous ft-v1207, **toutes** font parler l'avertissement 🔬 ; seule la **RÉÉCRITURE** de la valeur diffère (externes → 382, utilisateur → 198). Or la capture ne montre **aucun** 🔬, mais l'**ancien** encadré. 👉 ***Donc ce code n'a pas été exécuté, quelle que soit la porte employée*** — la démonstration ne dépend plus de savoir par quelle porte l'aliment est entré.

**⭐ ET LE PAYLOAD NE PEUT PAS SAUVER L'HYPOTHÈSE INVERSE** : balayage exhaustif des **54 pour-100 g** qui affichent exactement `198 / 25 / 41 / 13` à 410 g — **la loi mord sur les 54**. *Il n'existe aucune fiche compatible avec la capture que ft-v1207 aurait laissée passer.*

**⭐⭐ LA CAUSE EST MESURÉE, PAS DÉDUITE.** `_majPeutSAppliquer` retient le rechargement tant que `_curScreen !== 'home'` :

| écran | la mise à jour s'applique ? |
|---|---|
| **Accueil** | ✅ oui |
| **Nutrition · Séance · Progrès · Profil · Coach** | ⛔ **non — retenue** |

Michel était sur l'écran **Nutrition**. La version était **téléchargée et activée** (`skipWaiting`), le rechargement **retenu**, et ⚠️ **hors séance la personne n'est prévenue de RIEN** : le message *« Mise à jour disponible »* n'existe que pendant une séance. ⛔⛔ **CE GARDE N'A PAS ÉTÉ TOUCHÉ** — c'est la décision de **ft-v1184** (*ne pas arracher l'écran sous les doigts de quelqu'un*), pas un oubli, et la « réparer » sans feu vert serait exactement ce que **R30** interdit. *Mesurée, figée par un témoin de hors-périmètre, rendue à Michel dans `docs/JOURNAL-DE-TEST.md`.*

**⛔⛔ CE QUI EST CORRIGÉ EST UN AUTRE DÉFAUT, ET C'EST LA TRACE QUI L'A TROUVÉ — contre le §3 de sa demande.** Il écrivait : *« le nouveau code est censé tracer le champ source utilisé »*. **Il ne le fait pas dans le seul cas qui l'intéresse** : en `DERIVE_ESTIMABLE`, `res.champ` est **écrasé** par `'P/G/L'` (et par le nom de l'autre champ en `ALTERNATIVE_FIABLE`). 👉 ***Le code calculait l'information, la transportait, puis la jetait exactement là où on la cherchait.*** `champSource` survit désormais à **toutes** les branches et part **avec la ligne** — la question *« d'où vient le 48,3 »* devient mesurable au prochain scan. ⭐ **Correctif générique** : aucun test sur le code-barres, aucun 93,2 en dur, aucun nom de produit dans la décision (un témoin l'épingle).

**⭐⭐ LE BANC GAGNE CE QUI LUI MANQUAIT, ET C'EST LA LEÇON QUI SERVIRA LE PLUS.** Le bloc CCCV éprouve `_ref100` **isolément**, cas par cas — il ne conduit **jamais** la chaîne *code-barres → formulaire → 410 g → valeurs affichées*. Or c'est **exactement** cette chaîne que la capture montre. 👉 ***Un banc qui teste la PIÈCE ne répond pas à une question posée sur la MACHINE*** : il a fallu une sonde jetable pour trancher, là où un témoin permanent aurait répondu en une passe. Le bloc **CCCVI** la conduit désormais de bout en bout, avec le code-barres réel et les 410 g réels — **la capture est rejouée à chaque passe**.

**⚠️⚠️ ET UN TÉMOIN ÉTAIT AVEUGLE — LE JUMEAU EXACT D'UN GARDE CORRIGÉ LA VEILLE.** Celui des 8 origines cherchait `origine:'X'` **n'importe où** dans le fichier ; or ces noms vivent **aussi** dans `_afSetSrc` (la provenance de la ligne). **Mesuré : débrancher l'origine `ciqual` de `_ref100` le laissait parfaitement vert.** 👉 ***J'avais corrigé ce garde dans le générateur du PDF la veille, et pas son jumeau dans le banc*** — **R8**, la porte jumelle, à l'intérieur du banc d'essai lui-même. Il lit désormais les **appels** de `_ref100`, et la liste est **FERMÉE** : il rougit sur une origine en moins **comme** sur une origine en trop.

**⚠️ CE QUE JE NE PEUX TOUJOURS PAS FAIRE, DIT PLUTÔT QUE DEVINÉ** (§3) : Open Food Facts reste injoignable depuis ce conteneur — **403 sur les trois domaines essayés**. **L'origine exacte du 48,3 n'est donc toujours pas mesurable d'ici.** ⭐ Mais elle le devient **sur le téléphone** : `champSource` est maintenant enregistré avec la ligne au prochain scan.

**⭐ INSTANTANÉ IDENTIQUE OCTET POUR OCTET** (sha `226a7e9c523cae3f`, le même depuis ft-v1205) : **aucune ligne déjà écrite ne change** — le correctif n'ajoute qu'un champ de traçabilité aux lignes déjà signalées.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucune valeur affichée ne bouge : un champ de traçabilité cesse d'être écrasé, et le banc gagne un témoin bout en bout.

**⏭️ CE QUE ÇA NE FAIT PAS** (périmètre de Michel, §6) : ⛔ `S.savedFoods` · l'historique · les migrations · les `ml` · `saveEditFood` · les lignes à zéro · la provenance de `rejouerRepas` · **les 21 règles de la douane** · `estimateFoodAI` (chantier séparé). ⛔ **Et le garde de mise à jour reste tel quel** : la question *« faut-il prévenir hors séance ? »* est **écrite et rendue à Michel**, pas tranchée par moi. ⚠️ **Michel doit vérifier sur Safari/iPhone** — et le geste est nommé : **revenir sur l'Accueil 🏠**, l'app se recharge seule et affiche « Application mise à jour ».

Tests : **parcours 3813/3813 sur l'arbre FINAL** (bloc **CCCVI**, 16 témoins). **Calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou nouveau. ⛔ **CONTRÔLE NÉGATIF : 10 MUTATIONS, TOUTES MORDENT SUR LEUR PROPRE TÉMOIN, contrôle sain à 0 rouge avant ET après, sur un arbre COPIÉ** — ① ⭐⭐ **LA CAPTURE RÉINTRODUITE** (la valeur résolue n'est plus appliquée : 198 revient, l'ancien encadré aussi) → **4** · ② `champSource` écrasé comme `champ` → **2** · ③ la trace ne porte plus le champ source → **2** · ④ ⭐ **une origine débranchée de `_ref100`** → **1, exactement le témoin refermé** · ④bis ⭐ **une origine inventée en trop** → **1, le même** (la liste est fermée dans les deux sens) · ⑤ un cas particulier Raynal → **1** · ⑥ ⛔ **hors périmètre : le garde de mise à jour « réparé »** → **1, exactement lui** · ⑦ ⛔ hors périmètre : la douane perd une règle → **1** · ⑧ la loi devient trop stricte (le produit sain est réécrit) → **1** · ⑨ scanné ≠ tapé → **3**.

📄 **PDF POUR GPT** : `docs/CAPTURE-IPHONE-TRANCHEE.pdf` (**21ᵉ** de la série), généré par `tools/gen_1208_pdf.py` — **53 gardes**, **13 mutations éprouvées sur un arbre COPIÉ**, toutes refusent, contrôle sain vert avant ET après. ⭐ Ses gardes les plus utiles protègent des **absences** : que le champ source ne soit jamais réécrit, que le garde de mise à jour n'ait pas été « réparé », qu'aucun cas particulier ne se soit glissé dans la décision, et que le témoin des 8 origines ne redevienne pas aveugle. ⚠️⚠️ **ET LE CONTRÔLE NÉGATIF A ENCORE TROUVÉ DEUX GARDES FAIBLES À MOI** — dont un qui n'était pas ce qu'il paraissait. ① *« la branche de dérivation écrase bien `champ` »* : mesuré, `res.champ = 'P/G/L'` existe **deux fois** (dérivation normale **et** énergie absente), donc n'en exiger qu'une laissait l'autre satisfaire le garde — 👉 **et c'est ma MUTATION qui était invalide, pas le garde** : elle n'en retirait qu'une. *Une mutation qui ne fait pas ce qu'elle annonce est indiscernable d'un garde aveugle* — je l'avais écrit en ft-v1205, je viens de le repayer. ② Le garde qui vérifie que le bloc conduit la vraie chaîne se satisfaisait du **second** scan (celui du produit sain) quand on retirait le premier : il **compte** désormais, et le bloc est **borné** au lieu d'être « tout ce qui suit ».

Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1208. |

**ft-v1207 — 🔬 LA FIABILITÉ ÉNERGIE / MACROS EN ENTRÉE · UNE LOI, PAS UN SEUIL — ET LE POINT COMMUN EXISTAIT DÉJÀ** — Michel lève le gel Nutrition **pour ce seul chantier**, avec ⛔ **la borne qui décide de tout** : ***« je ne veux pas un correctif spécifique aux lentilles Raynal. Je veux que le problème soit traité pour TOUS les aliments et toutes les sources concernées »***, ***« ne recrée pas huit variantes du même contrôle »***, ***« ne jamais écraser la source et perdre la trace de ce qui s'est passé »***, ***« les données explicitement saisies par l'utilisateur ne doivent pas être réécrites arbitrairement comme une donnée externe »***. ⛔ **Comportement explicitement interdit après ce chantier** : *« 48,3 utilisé normalement + simple warning »*.

**⚠️⚠️ CE QUE JE NE PEUX PAS FAIRE, DIT PLUTÔT QUE DEVINÉ** (§1 de sa demande) : le proxy de ce conteneur **refuse Open Food Facts** (`CONNECT tunnel failed, 403`), donc **je ne peux pas lire le payload réel du 3021690201123**. Et les deux hypothèses les plus probables sont **indiscernables d'ici par construction** — mesuré dans le code : `n['energy-kcal_100g'] || (n['energy_100g'] ? n['energy_100g']/4.184 : 0)` fait converger A et B vers la même valeur. ⛔ **L'hypothèse E est en revanche ÉCARTÉE par la mesure** : la chaîne de normalisation conserve 48,3 à l'unité près, l'app n'a rien fabriqué. ⭐⭐ **Et la question devient MESURABLE au lieu de rester une supposition** : le résolveur **enregistre désormais le champ qui a servi** — au prochain scan, A et B se distingueront tout seuls. *On ne devine pas, on instrumente.*

**⭐⭐ LE POINT COMMUN N'A PAS EU À ÊTRE INVENTÉ : `_ref100` EXISTAIT.** C'est le normaliseur du pour-100 g, il a **8 appelants** (code-barres · calibrage étiquette · « Mes aliments » · photo d'étiquette · marques · CIQUAL · journal local · recherche OFF), et sa sortie `_bcNutr` est *exactement* ce que l'écran affiche et ce que la ligne enregistrée multiplie. 👉 ***Résoudre là, c'est résoudre partout*** — un témoin épingle que `_resoudreNutrition` n'est appelée qu'**une seule fois** dans tout le code servi, et **aucun appelant ne recopie une once de logique** : chacun dit seulement **d'où il vient**.

**⭐⭐ UNE LOI, PAS UN SEUIL — ET ELLE EST MESURÉE AVANT D'ÊTRE ÉCRITE.** Le Règlement UE 1169/2011 (annexe XIV) fixe les facteurs : **protéines 4 kcal/g, lipides 9**. **Tous** les autres contributeurs sont **positifs ou nuls** (glucides 4 · polyols 2,4 · érythritol 0 · fibres 2 · alcool 7 · acides organiques 3). Donc, quelle que soit la composition du reste :

> **E ≥ 4·P + 9·L** — un **plancher physique**, pas une comparaison approximative.

👉 ***C'est exactement l'argument que Michel demandait*** : les composants énergétiques supplémentaires ne peuvent pas expliquer une énergie **PLUS BASSE**. Rien ne retire d'énergie. **La loi ne dit jamais « c'est bizarre », elle dit « c'est impossible ».** ⭐ **Et la tolérance est DÉRIVÉE de la précision réellement reçue, pas choisie** : une valeur écrite « 6,1 » est connue à ±0,05, « 6 » à ±0,5 — elle s'élargit toute seule quand la source est moins précise, au lieu de prétendre à une exactitude qu'elle n'a pas. ⛔⛔ **MESURÉ : 0 faux positif sur 3 607 aliments** (CIQUAL 3 484 + marques 123), le protocole exact de ft-v1162 — **et le chiffre n'est pas recopié : le générateur du PDF relit les deux tables et REJOUE la loi à chaque fois.** Sur le cas témoin : plancher **53,2 kcal**, tolérance **0,7**, il en **manque 4,9** — *même si les 10 g de glucides ne valaient RIEN*. ⚠️ **Et la limite est dite** : avec une source en **entiers** (6 / 3) la tolérance monte à 7 kcal et la loi ne mord plus. **La force de la loi dépend de la précision de la source** — une propriété de la donnée, pas un défaut du contrôle ; un témoin l'épingle pour qu'on ne la « répare » pas en serrant la tolérance.

**📊 QUATRE ÉTATS, ET L'ORDRE EST LE SUJET** : `COHERENT` (on ne touche à rien) → `ALTERNATIVE_FIABLE` (une **autre valeur énergétique de la MÊME source** tient debout : on la prend, **et on enregistre quel champ**) → `DERIVE_ESTIMABLE` (macros **complètes** : on estime) → `NON_RESOLU` (on ne sait pas, **et on le dit**). ⭐ **Une donnée de la source passe AVANT une estimation** : on préfère toujours une donnée à un calcul, et la mutation qui inverse cette priorité fait rougir un témoin précis.

**⛔⛔ ET « COMPLÈTES » VEUT DIRE *PRÉSENTES*, PAS « SUPÉRIEURES À ZÉRO » — c'est un vrai défaut trouvé à la mesure.** Le normaliseur transforme une macro **absente** en **0** *avant* que le résolveur la voie : une fiche sans glucides déclarés ressemblait donc trait pour trait à une **huile**, qui a 0 g de glucides *pour de vrai* (**R29**). On aurait dérivé une valeur depuis une donnée qu'on n'avait pas. **La présence est désormais mesurée sur les arguments BRUTS**, avant toute normalisation.

**⛔⛔ AUCUNE CORRECTION SILENCIEUSE — les deux moitiés de la consigne.** ① **La trace part avec la ligne** : valeur **brute** reçue, valeur **retenue**, **méthode**, **raison**, **champ** d'origine, **confiance**, **origine** — et ⭐ **une ligne cohérente ne gagne rien du tout** (une ligne normale ne grossit pas). ② **L'écran le dit** : il affiche la valeur annoncée par la fiche **ET** la valeur retenue, et en `NON_RESOLU` il dit ***« l'app ne sait pas laquelle croire »*** au lieu de présenter un chiffre douteux comme sûr.

**⛔⛔ CE QUE LA PERSONNE A SAISI NE SE RÉÉCRIT JAMAIS** : `manuel` · `reprise` · `historique` sont **classées**, pas remplacées. *Réécrire ce que quelqu'un a tapé, c'est lui retirer la main sur sa propre donnée.* Et le **même code-barres scanné ou tapé** donne **exactement la même résolution** (exigence nommée par Michel) — comparé **objet entier**, pas seulement la valeur.

**⭐⭐ UN VRAI DÉFAUT QUE J'AI INTRODUIT, ET C'EST LE BANC QUI L'A DIT — SUR LE CAS RÉEL DE MICHEL.** Mon avertissement s'affiche dès le scan, donc `etaitVu` était **déjà vrai** au clic « paquet entier » : la garantie de **ft-v1191** (*un avertissement qu'on ne voit qu'en défilant ne protège que ceux qui défilaient déjà*) **tombait en silence**, l'alerte restant à **1 284 px** sous la zone visible. 👉 Deux corrections, chacune figée par un témoin : ① **« apparaître » = le MESSAGE a changé**, pas seulement « `display` est passé à `block` » ; ② **la remontée se CONFIRME une fois**, parce que `scrollIntoView({smooth})` est **asynchrone** et que l'écran continue de se remplir après un scan — ***un défilement demandé n'est pas un défilement arrivé***. ⛔ Les deux gardes de ft-v1191 tiennent entiers (pas de remontée à chaque appel, pas sous les doigts de quelqu'un qui tape).

**⛔⛔ ET MA PREMIÈRE VERSION ÉCRASAIT UNE DÉCISION DÉJÀ PRISE.** J'avais mis la fiabilité **devant tout**, y compris devant la masse impossible — or **ft-v1103 a tranché** que *« la masse d'abord, c'est le défaut le plus grave des deux »*, et **cette décision n'était pas la mienne à renverser** (**R30**). La masse parle de ce que la personne fait **maintenant** ; la fiabilité parle de la **fiche**. Ordre final figé par témoin : **masse → fiabilité → plafond → écart**. ⚠️ **Conséquence assumée et dite** : quand la source est signalée, le bouton « Mettre N kcal » de l'écart ne s'affiche pas — en `NON_RESOLU` c'est voulu (*« lis l'étiquette » vaut mieux qu'un bouton qui applique une supposition*), et dans les deux autres états l'écart a disparu de lui-même.

**📊 LA DOUANE N'A PAS BOUGÉ — ET LA MESURE AVANT / APRÈS EST LE FAIT DU §10.** Ses **21 règles** dont **9 `INVALID`** sont intactes, elle n'appelle pas le résolveur, aucune ne bloque, les 4 écrivains ne lisent toujours pas son verdict. Sur une ligne de ce type à 100 g, les `energie_incoherente` qui l'atteignent passent de **7 à 2** — ⭐ **et les 2 restantes sont EXACTEMENT les origines utilisateur, par conception**. *Ce n'est pas un reste à nettoyer : c'est la consigne de Michel qui se voit dans un chiffre.*

**⭐ INSTANTANÉ IDENTIQUE OCTET POUR OCTET** (sha `226a7e9c523cae3f`, le même qu'en ft-v1206) : **aucune ligne déjà écrite ne change** — et la raison est dite plutôt que présentée comme un exploit, la sonde conduit `quickFillFood`, une origine **utilisateur** que le résolveur laisse intacte par construction.

**📣 RÈGLE D'OR #11 — POINT 2 À 5.** L'écran d'ajout gagne un avertissement qui **explique une fiche douteuse et nomme les deux valeurs**. Ce n'est pas une pop-up : c'est le bloc d'avertissement qui existait déjà, enrichi (**R13/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** (périmètre strict, §11) : ⛔ `S.savedFoods` multi-onglets · la traçabilité de `saveEditFood` · les lignes entièrement à zéro · `rejouerRepas` et sa provenance · les `ml` · l'écart **48,3 / 48** · l'historique · les migrations · les autres harmonisations produit. ⚠️ **Une mesure de plus, faite en chemin et NON corrigée** : `estimateFoodAI` **ne passe pas par `_ref100`** (il écrit les champs de l'écran directement et n'a volontairement pas de pour-100 g) — il échappe donc au résolveur. *Mesuré, écrit, laissé à Michel.* ⛔ **Le gel Nutrition reprend** dès cette version livrée. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests : **parcours 3797/3797 sur l'arbre FINAL** (bloc **CCCV**, 30 témoins). **Calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou nouveau. ⛔ **CONTRÔLE NÉGATIF : les 8 MUTATIONS NOMMÉES PAR MICHEL, TOUTES MORDENT sur leur propre témoin, contrôle sain à 0 rouge avant ET après, sur un arbre COPIÉ** — ① mauvaise conversion kJ/kcal → **2** · ② ⭐ **priorité inversée** (on dérive avant de regarder la source) → **1, exactement lui** · ③ seuil trop permissif → **8** · ④ seuil trop strict → **1, exactement lui** · ⑤ valeur source écrasée (une saisie réécrite) → **2** · ⑥ provenance perdue → **1, exactement lui** · ⑦ dérivation sur macros incomplètes → **1, exactement lui** · ⑧ le cas témoin redevient 48,3 comme valeur de confiance → **3**. ⚠️ **Et la mutation ① n'aurait mordu sur RIEN au premier jet** : la sonde fabriquait ses candidats **à la main**, laissant la conversion hors de portée. Corrigée pour passer par le **vrai propriétaire** `_nrjCandidats` **avant** de conclure — *un contrôle négatif qui teste un tableau écrit par le test ne teste pas le code*.

📄 **PDF POUR GPT** : `docs/FIABILITE-ENERGIE-MACROS.pdf` (**20ᵉ** de la série), généré par `tools/gen_fiab_pdf.py` — **38 gardes**, **22 mutations éprouvées sur un arbre COPIÉ**, toutes refusent, contrôle sain vert avant ET après. ⭐⭐ **Son garde central ne recompte pas un chiffre : il REJOUE la loi sur les 3 607 aliments** et refuse de produire au moindre faux positif. *Un document qui affirme « zéro faux positif » sans le remesurer affirme un souvenir.* ⚠️⚠️ **ET LE CONTRÔLE NÉGATIF A TROUVÉ QUATRE GARDES AVEUGLES À MOI — dont le plus intéressant du lot.** ① `origine:'ciqual'` existe **deux fois** dans le code servi (une passée à `_ref100`, une dans la provenance) : le garde se satisfaisait de la mauvaise — il lit désormais les **appels** de `_ref100`. ② `NON_RESOLU` est **assigné deux fois**, donc en renommer un laissait la chaîne présente ; la liste des états est maintenant **fermée**. ③ `presentsX` contenait `presents`. ⭐⭐ ④ **Et le vrai trou** : la loi rejouée sur les 3 607 aliments est une **réimplémentation Python** — élargir la tolérance **dans le code servi** ne la changeait donc pas, et le PDF continuait d'annoncer « le cas témoin mord » pendant qu'il ne mordait plus. 👉 ***Un contrôle qui remesure avec sa PROPRE copie de la règle ne mesure pas la règle du produit.*** Les trois lignes de la loi sont désormais épinglées au caractère près.

Fichiers : `app.js`, `tests/parcours/runner.js`, `tools/gen_fiab_pdf.py`, `docs/FIABILITE-ENERGIE-MACROS.pdf`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1207. |

**ft-v1206 — 📊 ÉTAPE 6 : L'OBSERVATION RÉELLE DE LA DOUANE · ELLE NE GARDE QUE DE LA STRUCTURE, ET C'EST UN CANARI QUI LE PROUVE** — Michel valide le mode observation et demande de le faire tourner pour de vrai : ***« faire tourner `_douaneLigne(...)` sur les vraies lignes réellement produites par l'application et obtenir un rapport agrégé des WARN / INVALID rencontrés en usage réel, SANS STOCKER le contenu des repas ni les valeurs nutritionnelles personnelles »***. ⛔ **Toujours aucun blocage, aucune correction, aucune modification de donnée** — et ⛔ **aucune des 21 règles ne change** (un témoin les épingle, avec leurs 9 `INVALID`). Conception : **`docs/DOUANE-NUTRITION.md` §Étape 6**.

**⭐ RIEN N'EST REBRANCHÉ.** Les 4 écrivains appellent déjà `_douaneLigne` depuis ft-v1205 ; c'est **elle** qui, après avoir rendu son verdict, appelle `_douaneCompter`. ⭐ **Et l'appel est enveloppé dans un `try` qui avale tout** : même si le comptage plantait, la ligne serait enregistrée pareil. *Un observateur qui peut faire échouer ce qu'il observe n'en est plus un* — la mutation qui retire l'enveloppe fait rougir exactement ce témoin.

**⭐⭐ CE QUI EST GARDÉ, ET LA LISTE EST FERMÉE** : l'**écrivain** (4 valeurs) · le **verdict** · les **noms** des règles qui ont mordu · la **forme** (`grammes`/`portion`/`ml`/`sans_quantite`/`autre`, déduite de `u` et `q` **seuls**) · un **booléen** « la ligne avait-elle un identifiant de source » · des compteurs. ⛔⛔ **JAMAIS** : nom d'aliment · quantité réelle · kcal · protéines · glucides · lipides · commentaire · description de repas · **identifiant source** · date d'un repas. 👉 ***Rien qui permette de reconstruire ce que la personne a mangé*** — c'est **R36** appliqué à notre propre diagnostic (Constitution **P3**).

**⭐⭐ LE CATALOGUE DES 21 RÈGLES N'EST RECOPIÉ NULLE PART** : il se remplit tout seul au premier appel (`dit()` enregistre chaque nom, et toutes les règles sont évaluées à chaque fois — seul leur booléen diffère). Une règle ajoutée ou renommée suit donc sans divergence (**R2**). 👉 ***Et une liste recopiée aurait menti EN SILENCE*** : *« cette règle n'a jamais mordu »* est exactement ce qu'on lit quand elle a simplement **disparu du catalogue**.

**⛔⛔ LA PREUVE DE CONFIDENTIALITÉ EST UN CANARI, PAS UNE INTENTION.** On enregistre **par un vrai écrivain** un aliment `ZZCANARIMICHELXY` avec des valeurs reconnaissables (`7777` · `6666` · `5555` · `4444` · `3333` · `9999` · `8888` · `2222` · `1111`) et `off:ZZCANARISOURCE`, puis on cherche ces **11 chaînes** dans ce qui a été stocké : **aucune n'y est**. ⭐ **Et le même témoin exige que le carnet ait bien enregistré** — *sans ça, un carnet vide passerait le test sans rien prouver*, et la promesse deviendrait un vert qui ne peut pas rougir (ft-v994).

**⭐⭐ ET LES TROIS MUTATIONS DE FUITE NE CHANGENT RIEN À L'ÉCRAN** — garder le **nom** · garder les **calories** · garder l'**identifiant de source** au lieu du booléen. Aucune ne modifie ce que l'app affiche ni ce qu'elle enregistre. **Sans le canari, elles passeraient toutes les trois.** *C'est exactement le genre de dérive qu'aucun parcours ne peut voir.*

**⛔ OÙ IL VIT** : sa **propre clé** `ft4_douane_obs`, **hors de `S`** — donc hors de la sauvegarde, hors de la synchronisation cloud, hors de tout export (**3 témoins**, dont un qui lit `setup.js`). **Borné à 40 combinaisons.** Remise à zéro d'un bouton, et un témoin vérifie qu'elle **ne touche pas au journal alimentaire**. ⭐ Il **survit au rechargement** : c'est tout l'intérêt d'observer un usage réel sur plusieurs jours.

**📋 LE RAPPORT** se lit dans **Profil → Admin → « 📊 Douane — observation du journal »** (boutons *Copier* et *Repartir de zéro*) : lignes observées + période · verdicts · détail **par écrivain** (verdicts, formes, avec/sans source) · règles qui ont mordu · ⭐ **règles qui n'ont JAMAIS mordu** · combinaisons fréquentes. ⛔ **Il POSE les trois questions produit de Michel et n'y répond pas à sa place.**

**⚠️⚠️ DEUX ERREURS À MOI, TOUTES DEUX ATTRAPÉES PAR LE CONTRÔLE NÉGATIF.** ⓵ Un garde laissait passer `E.src = String(ligne.sourceId)` : mon motif refusait `ligne.sourceId` suivi d'un caractère « parlant », et **la parenthèse fermante le désamorçait**. Il compte désormais les **occurrences** (une seule, celle du booléen) et refuse toute forme qui **range** la valeur. ⭐ *Le canari, lui, l'avait attrapée* — **un test de comportement et un témoin de source ne se remplacent pas, ils se complètent.** ⓶ ⭐⭐ **Et j'ai testé l'ancien témoin en croyant tester le nouveau** : mon mini-harnais n'avait pas été régénéré après la correction, donc il rejouait la version d'avant et rendait 21 verts. 👉 ***Un harnais périmé est indiscernable d'un témoin aveugle*** — c'est §61 sous un troisième visage : *le contrôle sain n'est pas une formalité, il est le seul témoin du harnais*.

**⚠️ ET LA PASSE A ÉTÉ RELANCÉE DE ZÉRO DEUX FOIS, EXPRÈS.** Une fois pour un mot mal orthographié dans le commentaire de `sw.js` — **que le runner lit** (§60) ; une fois parce que j'avais corrigé un témoin en cours de route. Dans les deux cas elle ne testait plus l'arbre final. *« Passe verte sur l'arbre FINAL » est une affirmation vérifiable ou ne vaut rien* — ~25 minutes pour qu'elle reste vraie.

**📣 RÈGLE D'OR #11 — UNE CARTE ADMIN.** Aucun écran utilisateur ne change ; le rapport vit dans **Profil → Admin**, à côté des autres sondes de diagnostic. *Une mesure qu'on ne peut pas consulter n'existe pas* (la leçon du Google Sheet, ft-v715).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **aucune règle ne devient bloquante** — *« ne prends aucune décision de blocage à ma place »* · ⛔ **les 2 divergences de ft-v1205 ne sont pas harmonisées** · ⛔ `S.savedFoods` multi-onglets, l'écart **48,3 / 48**, l'historique, les migrations et les harmonisations produit restent ouverts · ⛔ le garde `!_bcNutr` non bloquant attend toujours son feu vert. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

⚠️ **COMBIEN OBSERVER — JE NE TRANCHE PAS, VOICI LES REPÈRES** : **≥ 100 lignes** (en dessous, une règle qui mord 1 fois sur 20 peut ne jamais apparaître par hasard) · **les 4 écrivains vus au moins une fois** (`rejouerRepas` et `saveEditFood` sont rares, et c'est chez eux que vivent les divergences) · **≥ 2 semaines**. ⭐⭐ **Mais le vrai critère n'est pas le temps, c'est la COUVERTURE** : une règle ne peut être déclarée « purement théorique » que si les formes qui la déclencheraient ont **réellement été produites**. ***Une règle qui n'a jamais mordu parce que le cas ne s'est jamais présenté n'est pas inutile — elle est NON ÉPROUVÉE.*** Le rapport liste les formes rencontrées précisément pour faire cette différence.

📄 **PDF POUR GPT** : `docs/ETAPE6-OBSERVATION.pdf` (19ᵉ de la série), généré par `tools/gen_obs_pdf.py` — **25 gardes**, et ⭐ **ceux qui comptent ne protègent pas un chiffre, ils protègent une PROMESSE** : ils lisent le code **champ par champ** et refusent de produire si le compteur garde un champ de repas, touche à l'identifiant de source autrement que par son existence, écrit dans `S`, modifie la ligne, ou cesse d'être borné. **19 mutations éprouvées sur un arbre COPIÉ**, toutes refusent, contrôle sain vert avant ET après.

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1133**, l'étape « Déployer sur GitHub Pages » **`success` à 14:49:37 UTC** sur `6cf90400`. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés). ⭐ *Lu sur les JOBS, pas sur le statut du run*. ⚠️ **Limite dite** : le proxy de ce conteneur refuse `github.io` (403), donc je ne peux pas lire le `sw.js` réellement servi — *l'étape est verte, l'app affichant ft-v1206 reste à confirmer par Michel.*

Tests : **parcours 3767/3767 sur l'arbre FINAL** (+21, bloc **CCCIV**) — **total prédit = total obtenu** (3746 + 21, §61). **Calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou nouveau. ⭐ **Instantané de ce qui est ÉCRIT dans `S.foodLog` identique octet pour octet** — `226a7e9c523cae3f`, le même qu'en ft-v1205. ⛔ **CONTRÔLE NÉGATIF : 18 MUTATIONS, TOUTES MORDENT SUR LEUR PROPRE TÉMOIN, contrôle sain à 0 rouge avant ET après** — ① ⭐⭐ **FUITE : le carnet garde le NOM** → **2** · ② ⭐⭐ **FUITE : il garde les CALORIES** → **2** · ③ ⭐⭐ **FUITE : il garde l'IDENTIFIANT DE SOURCE** → **3** · ④ le total n'est jamais incrémenté → **2** · ⑤ le verdict n'est pas compté → **2** · ⑥ les écrivains ne sont pas distingués → **5** · ⑦ les règles ne sont pas comptées → **1** · ⑧ les formes ne sont plus classées → **1** · ⑨ le catalogue est recopié à la main → **1** · ⑩ les combinaisons ne sont plus bornées → **1** · ⑪ le carnet entre dans l'état persisté → **2** · ⑫ ⭐ **le carnet part dans la SAUVEGARDE CLOUD** → **1**, exactement le témoin qui lit `setup.js` · ⑬ il ne survit pas au rechargement → **4** · ⑭ la remise à zéro efface **aussi** le journal → **1** · ⑮ le compteur modifie la ligne → **1** · ⑯ ⭐⭐ **le comptage peut BLOQUER une écriture** → **1** · ⑰ une **règle** de la douane a changé → **2** · ⑱ le rapport ne pose plus la question ① → **1**.

Fichiers : `app.js`, `index.html`, `tests/parcours/runner.js`, `tools/gen_obs_pdf.py` (nouveau), `docs/ETAPE6-OBSERVATION.pdf`, `sw.js`, `CLAUDE.md`, `docs/DOUANE-NUTRITION.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1206. |

> **+ ft-v712** : le **rangement des exercices par MATÉRIEL** dans le sélecteur (8 bacs : Barre · Poids libre · Guidé · Poids du corps · Élastique · TRX/Sangles · Cardio · Polyvalent). `_eqTestOn()` (log.js) = `return true;`, gardée en fonction comme `_isNutriBeta()`.
> Réglage manuel des calories/macros · Objectif « Perte de gras + muscle » (recomposition) · « maxi » dans les reps · pointeur Journal — **ouverts à TOUS** le 27/07/2026 (décision Michel « tout pour tout le monde »). `_isNutriBeta()` (screens.js) = `return true;` (gardée en fonction pour ne pas chasser les usages). Annoncés via WHATS_NEW **v46/47/48** + red dots `reps-maxi`/`manual-kcal`/`goal-recomp`.
> **Ce qui RESTE réservé (statut, pas des features)** : carte dorée « Testeur Fondateur » + Espace testeur (`_isTester()`, `TESTER_EMAILS` : christophe/eline/emma/tanna) · suivi photos approfondi (`_isSuperTester()`) · outils de test clone-only (badge Gardien, questions illimitées).

### Backend Apps Script — historique déploiements récents
| Version | Contenu |
|---------|---------|
| @51 | backup quotidien auto + test garde-fou `?action=testGardeFou` |
| @52 | suppression rétention 60j — append-only pur |
| @53 | backups → Google Drive (DriveApp) + migration Sheet→Drive + scope `drive` |
| @54 | warning quota Drive dans `backupAllUserData_()` — log si > 1000 fichiers |
| @55 | fix import : découpage séances (SÉANCE N only) + PDF natif + superset général |
| @56 | import : unilatéral NxN×2, +M sur partenaire superset, setType défaut '' |
| @57 | import : Ramping reps → repsPerSet[séquence], setType = '' ou 'D' seulement (jamais E/W) |
| @58 | import historique : action importHistory → handleImportHistory_ (Sonnet) |
| @59 | persistance cloud `discipline` (ft-v194) + `histImports` (ft-v168) dans `handleSaveProfile_` |
| @60 | premium à vie : ajout `emma.david16@gmail.com` (testeuse) dans `PREMIUM_HARDCODED_` |
| @61 | Étude du corps : `handleBodyStudy_` (Sonnet, bilan posture/insertions/équilibre/santé/exercices) + route `bodyStudy` + persistance `bodyStudy` dans `handleSaveProfile_` ; embarque aussi `exPhotos` (ft-v212) |
| @62 | persistance cloud `targetWeight` (poids objectif, ft-v229) dans `handleSaveProfile_` |
| @63 | `handleBodyStudy_` enrichi (ft-v262) : mode `deep`/`compare` — ajoute les photos de la série précédente, renvoie une clé JSON `evolution` (comparaison d'évolution), `max_tokens` 3072. Active le « Suivi photos » du Super Testeur (Christophe) |
| @65 | Boîte à idées lisible côté backend (`?action=getIdees&token=FT_IDEES_2026` → `handleTesterIdea_`/`TESTER_IDEAS`, ft-v273) + persistance cloud du **niveau** (`body.level` → `_ps_` dans `handleSaveProfile_`, ft-v240). Déployé depuis le PC de Michel (2026-07-06) |
| @68 | **Milo — modèle du Coach selon l'utilisateur** : `handleCoach_` lit `body.email` (envoyé par le frontend, coach.js `sendToCoach`) et choisit le modèle via **Script Properties** (`COACH_MODEL_MICHEL` → Opus pour michdu75@gmail.com, `COACH_MODEL_CHRISTOPHE` → Sonnet, défaut Haiku 4.5). **⚠️ OBSOLÈTE DEPUIS LE WORKER (constaté le 04/08/2026)** : `'coach'` fait partie de `AI_PROXY_ACTIONS` (constants.js), donc **toutes** les conversations avec Milo passent par le **Worker Cloudflare** — ce mécanisme de Script Properties n'est plus jamais consulté pour la conversation. Le modèle réel est **en dur** dans `worker.js` (constante `MODELE_MICHEL`), et le **défaut y est Sonnet, pas Haiku**. Modèles en config (pas en dur dans le code). @66/@67 = tentatives cassées (voir piège ci-dessous), @68 = version propre. Déployé PC (2026-07-07) |
| @69 | **Bilan corporel — import photo** : `handleImportBodyScan_` (Sonnet vision, route `action:'importBodyScan'`) lit une photo de rapport de balance pro/impédancemètre → JSON des 12 valeurs (ft-v302). + persistance cloud `bodyScans` (`_pa_` dans `handleSaveProfile_`). Déployé PC (2026-07-07). |
| @71 | **Bilan corporel — lecture photo enrichie** : prompt `handleImportBodyScan_` amélioré (ft-v303/304) — ignore les plages entre parenthèses (prend le 1er nombre), lit les sections annexes + l'**analyse segmentaire** (10 clés bras/tronc/jambes G-D). Déployé PC (2026-07-08). |
| @auto (2026-07-12) | **`readBarcode`** (ft-v393) : `handleReadBarcode_` (Haiku vision, route `action:'readBarcode'`) lit le NUMÉRO d'un code-barres sur une photo (les chiffres imprimés sous les barres) → renvoie les chiffres, que l'app cherche gratuitement dans Open Food Facts. Ajout **isolé** (aucune action existante modifiée) + ajouté à `AI_ACTIONS_` (quota IA). **⚠️ Déployé AUTOMATIQUEMENT** via la GitHub Action `deploy-appsscript.yml` (voir ci-dessous) — le n° de version @NN est auto-assigné (non connu précisément). |
| @auto (2026-07-12 bis) | **Boîte à idées — token robuste + photos en pièces jointes** (ft-v397). `handleTesterIdea_` : ① token de lecture `getIdees`/`aiUsage` vérifié par **HASH en dur** (`_checkIdeesTok_` + `IDEES_TOKEN_HASH_` = SHA-256 de `FT_IDEES_2026`) au lieu de la Script Property `IDEES_TOKEN` **qui ne persiste pas** sur ce projet (⚠️ **CETTE AFFIRMATION ÉTAIT FAUSSE — corrigée le 04/08/2026** : le hash est bien dans `Code.js`, mais **le token en CLAIR est dans `app.js`** (3 fois), qui est servi publiquement sur GitHub Pages depuis un dépôt public. N'importe qui peut donc lire `getIdees` → **nom, e-mail et message de tous les testeurs**. Voir `docs/ALERTE-SECURITE-BOITE-IDEES.md`. ✅ **FERMÉE le 07/08/2026** (ft-v787) : le jeton ne vit plus dans `app.js`, le serveur lit la Script Property `IDEES_TOKEN2` avec **repli FERMÉ** si elle manque, et un **test permanent** refuse tout secret en clair dans les fichiers servis. ⚠️ **Cette ligne est restée périmée dix jours**, et le 17/08 elle m'a fait annoncer à Michel une faille déjà réparée — *un document d'état qu'on ne met pas à jour fait dire des bêtises à celui qui le lit* (R23).) ; ② chaque idée est **envoyée par mail** à forcetracker.app@gmail.com **avec les photos en pièces jointes** (`Utilities.newBlob` + `GmailApp` attachments), photos non stockées dans la propriété. Déployé AUTO. |
| @auto (2026-07-13) | **Persistance cloud `manualKcal`** (calories réglées à la main, ft-v409) : `handleSaveProfile_` → `if(body.manualKcal!==undefined) profile.manualKcal=_pn_(...)`. `loadProfile` renvoie déjà tout `profile`. Déployé AUTO. |
| @auto (2026-07-30) | **Bilan corporel — repli déterministe `leanMass`** (retour Eline via la boîte à idées : « Milo a tout lu sauf le taux de masse maigre »). Le modèle de lecture (léger) rate parfois la masse maigre dans « Autres indicateurs » → si `leanMass` manque mais `weight` et `fatMass` sont lus, `handleImportBodyScan_` la CALCULE (poids − masse grasse, vérifié sur son rapport : 51.85 − 14.1 ≈ 37.8). Jamais d'IA là où une soustraction suffit. Déployé AUTO. |
| @auto (2026-07-31) | **Boîte à idées — panne de mail rendue VISIBLE** (message de Christophe jamais reçu, confirmé par Michel sur les deux boîtes) : ① le mail part vers **les 2 boîtes** (appli + perso, en dur comme `PREMIUM_HARDCODED_`) ; ② l'échec d'envoi n'est plus avalé par un `catch` vide → **`_logMailFail_`** (Script Property `MAIL_FAILS`, 50 derniers) ; ③ nouvelle route de diagnostic **`?action=mailFails&token=…`** (même token que `getIdees`) qui renvoie les échecs + le quota mail restant. L'idée reste de toute façon stockée dans `TESTER_IDEAS` même si le mail plante. |
| @auto (2026-07-31 soir) | **🚨 LA VRAIE PANNE DU 29/07 : le réservoir Script Properties PLEIN à 102 %** (524 Ko / 512 Ko — sonde `storeHealth`) → depuis le 29/07, **plus AUCUNE écriture n'aboutissait** : sync des gros comptes figée (Christophe = 278 Ko à lui seul), boîte à idées muette, mails morts (la révocation Gmail était une 2ᵉ panne, réparée par `authorizeMail`). **Fix** : ① comptes stockés **gzip+base64** (préfixe `GZ:`, ≈ 5× plus petit) via `_packUser_`/`_unpackUser_` — pack **auto-vérifié** (jamais écrit s'il ne se relit pas à l'identique), rétrocompatible (un compte en clair reste lisible, se compresse à sa prochaine sauvegarde) ; les 3 lecteurs équipés (chargement, backup nocturne, liste admin) ; ② migration one-shot `?action=compressStore&token=…` + **suppression du compte de test `michdu75+test`** (décision Michel) ; ③ routes de diagnostic `storeHealth` (remplissage + test d'écriture). ⏭️ **Vrai fix à venir** : déménager le stockage des comptes vers le Drive (pas de plafond). ← **actuel**. |

> ⚠️⚠️ **SI LE DÉPLOIEMENT DU SITE ÉCHOUE : LANCER UN NOUVEAU RUN, JAMAIS « relancer les jobs échoués »** (mesuré le 01/09/2026, ft-v1090). Le workflow Pages a lâché sur un **délai dépassé de 10 min**, et la relance des jobs échoués **du même run** a rejoué l'empaquetage : deux artefacts `github-pages` dans le même run, et l'action de déploiement refuse de départager (*« Artifact count is 2 »*, échec en 0 seconde). 👉 **`workflow_dispatch` sur `master`** — vert du premier coup. *Une relance qui aggrave la panne ressemble à une panne qui s'aggrave toute seule.*

> **🚀 DÉPLOIEMENT BACKEND MAINTENANT AUTOMATIQUE (depuis 2026-07-08, workflow `.github/workflows/deploy-appsscript.yml`)** : dès qu'un push sur `master` modifie `Code.js` ou `appsscript.json`, GitHub fait tout seul `clasp push --force` + `clasp create-deployment -i <ID>` (redéploie la web app existante) + vérifie `?test=1`. **Plus besoin du PC de Michel ni de clasp en local.** Claude peut désormais modifier `Code.js`, pousser sur master, et le backend part en prod automatiquement (~1-2 min). Vérifier le run via GitHub MCP (`actions_list`/`actions_get`, workflow `deploy-appsscript.yml`). L'auth clasp vit dans le secret GitHub `CLASPRC_JSON`. ⚠️ `.claspignore` toujours respecté (seuls `Code.js` + `appsscript.json` partent). Les mentions « Déployé PC » ci-dessus sont l'ancien mode (historique).

**Dossier Drive backups** : `ForceTracker-Backups/` (ID : `1iQ6xFuG10d4qCE1Jz8d8lOodrUsV36Fq`)  
**Trigger quotidien** : `backupAllUserData_()` à 2h du matin, 1 actif  
**Fichiers créés** : `backup-YYYY-MM-DD.json` (ou `-HH-mm` si 2e exec le même jour)  
**Migration** : ancien onglet Sheet `Backup 2026-06-29 20:03` → `backup-migration-2026-06-29-2003.json`

### Tests — Chrome ET Safari
Tester toute modif UI sur **les deux navigateurs** avant de reporter la tâche comme terminée :
- **Chrome** (DevTools > mobile, ou vrai Android) — comportement de référence
- **Safari iOS** — différences connues : `position:fixed/sticky` dans les scroll containers, `getBoundingClientRect()` requis pour positionner des éléments flottants (CSS `%` non fiable), `<input type=file>` capture photo

Les bugs iOS Safari sont souvent silencieux (pas d'erreur console) — tester impérativement.

### Ordre de travail
- Une seule fonctionnalité modifiée → testée → validée avant de passer à la suivante
- Toujours vérifier que les écrans adjacents n'ont pas régressé (ex : modifier `s-log` → vérifier aussi `s-home` et `s-progress`)
- Ne jamais merger sur `master` sans avoir testé sur l'app déployée (GitHub Pages) ou en local avec un serveur HTTP
