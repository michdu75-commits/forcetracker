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

> **Version actuelle : `ft-v1217`** (prochaine : `ft-v1218`).
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
**ft-v1213 — 🎚️ LE RIR NE FUIT PLUS D'UN ÉCHAUFFEMENT · ET LE COMPTE CESSE DE MENTIR D'UN CRAN** — Michel passe du diagnostic au correctif, avec une borne : ***« une correction ciblée et rapide pour la mise en production, PAS une refonte de Séance/Milo »***.

**⛔⛔ TROIS CORRECTIONS À MON PROPRE AUDIT, MESURÉES AVANT D'ÉCRIRE UNE LIGNE — et la première est la plus gênante.**

**① LE CARDIO N'EST PAS UNE SÉRIE.** Il vit dans `S.wkt.cardio` / `cardioAvant`, jamais dans `exs[].sets[]` — il ne peut donc **jamais** atteindre `_rirDeSet`. Mon audit de la veille annonçait *« CARDIO (type vide) → 1 ⛔ »* : or `type:''` est une série **normale importée**, pas du cardio (le `type:'CARDIO'` de l'export est un **libellé** fabriqué pour la ligne CSV). 👉 ***Aucun garde cardio n'est donc ajouté*** — il ferait croire au suivant que le cas existe. *Un libellé faux sur une mesure juste est plus dangereux qu'une mesure fausse : personne ne revérifie une ligne qui a l'air d'avoir été testée.*

**② AUCUN PROPRIÉTAIRE « SÉRIE DE TRAVAIL » N'EXISTAIT** — mesuré : le test `type==='É'||type==='W'` est retapé **18 fois dans 4 fichiers**. ⛔ **Et aucun des 18 n'est rebranché** : hors périmètre. *Créer le propriétaire coûte une fonction ; refactorer 18 sites au milieu d'un correctif ciblé coûte un diff qu'on ne sait plus relire.*

**③ ⭐ LE TYPE `'E'` (SANS ACCENT) A TROIS LECTURES CONTRADICTOIRES**, et c'est le point de conception : migré en `X` (`state.js`), ignoré **comme un échauffement** (`state.js`, `coach.js`), et reposé **comme un `X`** (`log.js`, 240 s). 👉 ***L'ambiguïté ne change RIEN pour le RIR*** — échauffement **ou** échec, les deux sont non exploitables. Il est donc exclu **sans que sa sémantique soit tranchée** : la trancher ici serait décider à la place de Michel sur une donnée qu'on n'a pas mesurée. ⚠️ **Et `W`/`E` restent atteignables** : la migration est **one-time** (`ft4_stmig1`), donc une restauration cloud d'un vieux compte les réintroduit **après** la pose du drapeau. ⛔ La migration n'est pas touchée (ft-v1209).

**⭐⭐ LE DÉFAUT CORRIGÉ EST REPRODUCTIBLE EN DEUX GESTES, ET LE BANC LES CONDUIT** : on note un RIR sur une série `N` (`setRir`), on tape la pastille de type (`cycleType`) — qui change le type **sans toucher au `rir`**. La série devient `É` en gardant `rir:2`.

| | avant | après |
|---|---|---|
| `_rirDeSet({type:'É', rir:2})` | **2** | **null** |
| ligne envoyée à Milo | `É 60×10 **RIR2**` | `É 60×10` |
| export CSV | `É 60x10 rir=**2**` | `É 60x10 rir=""` |

**⭐ L'EXPORT SE CORRIGE TOUT SEUL** : `setup.js` appelle déjà le propriétaire, **aucune de ses lignes ne bouge**. *C'est exactement ce qu'achète un propriétaire.*

**⛔ ON N'EFFACE PAS LA VALEUR STOCKÉE, et c'est une décision.** `cycleType` reste intact. Un aller-retour `N → É → N` pour corriger une faute de frappe **restitue** le RIR — un témoin le prouve. *Effacer serait une perte SILENCIEUSE : la personne ne l'apprendrait jamais* (**R29**). La lecture suffit à fermer la fuite.

**⭐⭐ LE COMPTE NE MENT PLUS D'UN CRAN.** Il mesurait `_effortConnu()` — « sait-on ce que la série a coûté ? », un `X` y compte — sous le libellé *« portent un RIR »*. Trois séries notées + un `X` annonçaient donc **« 4 sur 4 »**, et la quatrième n'a aucun RIR. *Un calcul A sous un texte B est un mensonge poli.* ⭐ **Trois compteurs distincts** désormais, et ⛔ **le dénominateur EXCLUT les `X`** : une série allée à l'échec n'a pas de RIR **par définition**, la compter en « non renseignée » reprocherait une donnée qui n'existe pas. L'échec est **nommé à part**, parce que c'est l'effort le **mieux** connu.

**📣 CINQ GARDES D'INTERPRÉTATION AJOUTÉS AU PROMPT** (les règles existantes conservées, vérifié par 3 témoins de non-régression) : un RIR 0 **n'est pas une prédiction d'échec** · il est souvent **volontaire** · ⛔ **le rôle de série est INCONNU** — l'app ne le stocke pas, donc jamais *« la plus lourde = top set »* · un RIR 0 **peut être suivi d'une bonne série** · le RIR est une **estimation humaine** (0 puis 1 n'est pas une anomalie) · et la fatigue demande **plusieurs signaux**, avec le contre-exemple chiffré **100×3 RIR0 puis 102×3 RIR0** où la performance a **augmenté**.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **ft-v1211 intact** (le diagnostic d'import et `_empreinteDonnees` sont épinglés par témoin) · ⛔ ni `finalImportHist`, ni l'import historique, ni les migrations, ni les records · ⛔ **Nutrition, scanner : 0 ligne** — `app.js`, `index.html` et `setup.js` **ne sont pas touchés** · ⛔ **aucun rôle de série inventé**, aucun champ ajouté, aucune migration.

⚠️⚠️ **CE QUI N'EST PAS PROUVÉ, ET C'EST DIT** : les gardes du prompt prouvent la **PRÉSENCE**, jamais l'**OBÉISSANCE** — celle-ci se mesure au banc d'essai, qui demande une clé API (**R34**). ⚠️ **Michel doit vérifier sur Safari/iPhone** : côté écran, **rien** ne change.

Tests : **bloc B-CCCXI, 43 témoins**. ⛔ **CONTRÔLE NÉGATIF : 14 mutations — les 8 nommées par Michel + 6 miennes — TOUTES MORDENT**, contrôle sain **43 OK / 0 rouge avant ET après**, sur un arbre **copié** : ① `É` repasse → **6** · ② `X` repasse → **7** · ③ RIR absent devient 0 → **7** · ④ la couverture réinclut les `X` → **2** · ⑤-⑧ chaque garde du prompt retiré → **1** chacun · ⑨ le libellé ment de nouveau → **1** · ⑩ ⭐ **`cycleType` EFFACE le rir** → **4** · ⑪ le propriétaire recopie une liste → **4** · ⑫ le `W` redevient exploitable → **1** · ⑬ une série importée devient non exploitable → **2** · ⑭ ⛔ une règle **existante** du prompt perdue au passage (**R8**) → **1**.

Fichiers : `log.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. ⛔ **Ni `app.js`, ni `index.html`, ni `setup.js`, ni `state.js`, ni `Code.js`, ni `worker.js`.** sw.js ft-v1213. |

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
