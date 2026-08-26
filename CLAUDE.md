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
- 🏛️ **`docs/REGLES-ARCHITECTURE.md`** — **COMMENT ON CONSTRUIT** (créé 27/07/2026 sur une proposition de GPT, qui pointait un vrai manque : les règles de conception existaient mais **éparpillées**). **31 règles** rassemblées, chacune née d'un **événement réel** (bug, décision, galère) : les **données** (source de vérité unique · ne jamais dupliquer · comportement observable *différé mais nommable* · **l'info doit descendre jusqu'à la DONNÉE pas rester dans le TEXTE** · l'audit à l'envers) · les **décisions** (une seule voix, construite **émergentiellement** · le cerveau distribué → **le prompt est le dernier levier** · un prompt ne compense jamais une donnée absente · le **modèle** est une variable structurelle · permissions **bornées** · sécurité > vitesse · cohérence > réactivité) · la **construction** (enrichir l'existant · un comportement copié peut devenir faux · tout chemin de fermeture pose son marqueur · local-first · chaque bug devient un test · vérifier le **déploiement** pas le push) · la **gouvernance** (légère · prompt maigre / doc jardinée · critère d'entrée · retours à 3 paliers). ⚠️ **Ne pas confondre avec la Constitution** : celle-ci dit comment Milo se comporte envers la **personne** (éthique) ; celui-là dit comment on **construit le système**. En cas de conflit, la Constitution l'emporte.
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
| `sw.js` | Service Worker (cache-first HTML navigation, cache-first assets) — cache versionné `ft-vNN`, bumpé à chaque release (**actuel : `ft-v973`** — voir le journal des versions) |
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
| **Mémoire** | `docs/DOSSIER-ATHLETE-SUIVI.md` · `S.registre`/`S.adn`/`S.coachMemory` · `docs/VISION` (mémoire 3 niveaux) | Registre, ADN sportif, observations validées, mémoire durable, faits mesurés. Modèle : essentielle (gratuite) → intelligente (premium) → vivante (briques 7-8). |
| **Les 12 règles d'or** | `docs/REGLES-OR.md` (texte complet) · `CLAUDE.md` (une ligne par règle) | Le socle opérationnel : déploiement, premium, zéro perte, ouverture instantanée, backup, FAB, communication, checklist utilisateur, tenue des fichiers de suivi. |
| **Architecture (comment on construit)** | `docs/REGLES-ARCHITECTURE.md` | Les 28 règles de conception, chacune née d'un vrai événement. Le « comment on construit », distinct du « comment Milo se comporte » (Constitution). |
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
S.weightLog       // [{date, bw}]
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

> **Version actuelle : `ft-v1015`** (prochaine : `ft-v1016`). Historique complet (ft-v128→574 + gouvernance
> antérieure, **+ ft-v575→632 déménagées le 28/07**) → **`docs/JOURNAL-ARCHIVE.md`**. Le n° de cache se lit dans `sw.js` (`const CACHE='ft-vNN'`).
> **Entretien** : ajouter chaque nouvelle version ICI (règle d'or #12). Quand ce journal récent dépasse
> **20** entrées, déménager les plus anciennes dans `docs/JOURNAL-ARCHIVE.md` (couper/coller, rien
> supprimer). `python3 tools/check_regles.py` le signale automatiquement.
> ⚠️ **L'ARCHIVE S'AJOUTE, ELLE NE SE RÉÉCRIT JAMAIS** (leçon du 04/08 : un script d'archivage l'a
> **écrasée** — 297 entrées perdues, découvertes 2 jours plus tard **par hasard**, parce que rien ne
> la surveillait). Le même `check_regles.py` refuse désormais toute entrée disparue. **Toujours
> AJOUTER à la fin, jamais ouvrir le fichier en écriture**, et lire le diff avant de committer :
> un `-1793` dans le numstat n'est pas un détail.

**ft-v1015 — ☁️ UN ÉCHEC DE SYNC GOOGLE SHEETS ÉTAIT COMPTÉ COMME UN SUCCÈS** — trouvé en creusant la question de Michel : *« j'ai l'impression qu'il n'y a pas d'historique ou c'est moi ? »*.

**⛔⛔ `syncSheets` REND UN OBJET, PAS UN BOOLÉEN — et un objet est TOUJOURS vrai.** `finishWorkout` faisait `const ok = await syncSheets(sess); if(ok)`. En cas de panne réseau, la fonction rend `{ok:false, error:'Timeout (8s)'}` — que ce `if` prenait pour un succès. *Une ligne, et elle était sur le chemin le plus fréquent de l'app.*

**⚠️⚠️ DEUX DÉGÂTS, ET LE SECOND EST LE VRAI.** ① Le toast annonçait *« Séance synchronisée ! »* alors que **rien n'était parti**. ② Surtout, `synced=true` était posé — or la file de rattrapage (`_retrySheetQueue`) filtre `s.synced===false`. 👉 ***Une séance perdue en route n'était JAMAIS reprise***, ni au retour du réseau, ni au démarrage suivant. *Le seul mécanisme de secours était désarmé par la ligne censée constater le succès.*

**⭐⭐ ET LA MACHINERIE DE SECOURS, ELLE, ÉTAIT CORRECTE** — c'est ce qui rend le défaut coûteux. `_retrySheetQueue` est branchée au **retour réseau** (`window.addEventListener('online')`) **et** au démarrage : elle attendait des séances que personne ne lui donnait jamais. **L'autre appelant lisait `res.ok` correctement depuis toujours** : *deux copies du même geste, une juste, une fausse* (**R2**) — et la fausse était en fin de séance, là où ça compte.

**⭐⭐ MESURÉ PAR LE VRAI CHEMIN, PAS RELU.** `finishWorkout` appelée pour de bon, **seul `fetch` remplacé** — un test qui appellerait `syncSheets` à la main ne mesurerait pas la ligne fautive, elle est chez l'**appelant** (leçon n°1 de `docs/SUIVI-AUDIT.md`). **AVANT** : toast *« Séance synchronisée ! »* · `synced:true` · **0** séance en file. **APRÈS** : *« Séance sauvegardée ! »* · `synced:false` · **1** en file, et la non-régression tient (réseau OK → `synced:true`, file vide, toast *« synchronisée »*).

**⚠️ ET LE TÉMOIN DOIT COUPER `_demoMode` — sans quoi il serait vert en ne mesurant rien.** `seedScript` le pose à `true`, et `syncSheets` rend alors `{ok:true}` **sans toucher au réseau**. *Même piège que le levier posé à côté du code (ft-v995, ft-v1003) : une mesure propre et fausse.* Le commentaire le dit, pour la prochaine fois.

**⛔ ET CE QU'ON FIGE EST UNE RÈGLE, PAS UNE MESURE** : l'appelant doit lire **le champ**, jamais l'objet — plus un témoin voisin qui vérifie que `syncSheets` rend **toujours** un objet, sans quoi la règle deviendrait vraie pour rien.

**⚠️ CE QUE ÇA NE RÉPARE PAS, ET IL FAUT LE LIRE** : les séances déjà perdues **ne reviennent pas** — elles portent `synced:true` en mémoire, donc la file ne les verra jamais. ⭐ **Rien n'est perdu côté données** (l'historique local est intact, la sauvegarde cloud `saveProfile` est un chemin distinct) : c'est le **classeur Google Sheets** qui peut avoir des trous. ⏭️ **Deux suites nommées** : ① la ligne du Sheet **ne porte aucun email** — toutes les séances de tous les testeurs s'empilent dans le même onglet `Sessions` ; ② l'**historique du score de récup** n'a jamais été écrit (mesuré : 44 → 56 dans la même journée, donc il faudra garder **le score ET l'heure**, jamais un score nu).
Tests : **parcours 1474/1474** après fusion avec ft-v1014 (+6, bloc CXXIII — CXXI était déjà pris par session-A), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 102 classées 0 trou, check_regles vert (13 règles, archive 529 entrées, 0 perdue). **CONTRÔLE NÉGATIF : 4 rouges, et le détail imprimé EST le bug** — joué dans un worktree sur l'ancien code : `reçu : synced=true` · `en attente = 0` · `reçu : "Séance synchronisée !"`. ⭐ **Et la non-régression est verte DES DEUX CÔTÉS** (réseau OK → `synced:true`, file vide) : c'est exactement ce qu'elle doit faire — le correctif n'a touché que la branche d'échec. ⚠️ **Un défaut de MON bloc trouvé en le lançant** : il était placé **après** `b.close()`, donc il plantait au lieu de mesurer — et `node … | tail` masquait le code de sortie, si bien que la suite avait l'air d'être passée. *Un test qui ne peut pas tourner ressemble à un test qui passe.* Fichiers : `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1015. |
**ft-v1014 — 🍽️ MILO VOIT ENFIN CE QU'ELLE A MANGÉ — et ça a ouvert une fuite** — Michel à Milo : *« As-tu assez de recul pour mon alimentation ? »* → *« Mon alimentation est **déjà** dans l'application. »* Milo, honnête : *« Je n'ai pas accès au journal alimentaire (…) **en l'état je travaille à l'aveugle sur la nutrition.** »*

**⭐ IL DISAIT VRAI, ET L'EXCLUSION ÉTAIT ÉCRITE** — avec la mention **« DÉCISION À CONFIRMER »**. *Elle ne l'a jamais été.* Un « à confirmer » qui traîne devient une limite permanente que personne n'a choisie (**R30**).

**⭐⭐ ET L'ARGUMENT D'ORIGINE (« volumineux ») ÉTAIT JUSTE**, mesuré sur son vrai journal : **13 126 caractères bruts**. Mais un **résumé par jour** en fait **221** — 59 fois moins — et il répond aux **quatre** questions que Milo avait listées lui-même. 👉 *Le sujet n'était pas « transmettre ou pas », c'était « transmettre QUOI ».*

**⛔⛔ LE CHIFFRE QUI AUTORISE LE CHANGEMENT (R34) N'EST PAS LA TAILLE, C'EST LE CACHE.** Le bloc commun est **identique octet pour octet** avant/après — **et il le reste après un repas ajouté à l'instant**. Parce que le bloc est posé **SOUS le marqueur de l'instant**, là où le code dit lui-même de mettre ce qui change : *« ne jamais insérer plus haut une valeur qui CHANGE »*. ⭐ **Le garde-fou de taille le confirme indépendamment** : *sain 45 362 · blessé 47 118*, **inchangés**. Coût réel : **+835 caractères**, sous le marqueur.

**⛔ CE QUI RESTE DEHORS, ET POURQUOI** : le **détail plat** aliment par aliment (c'est lui qui pesait 13 000 caractères) · au-delà de **7 jours** (on ne paie pas pour ce qu'on ne demande pas) · et **aucun journal → aucun bloc**, pas d'en-tête vide.

**⛔⛔ ANTI-TCA — Constitution P21.** Ces chiffres servent **quand on les demande** : la consigne interdit explicitement de commenter spontanément ce qu'elle a mangé, de relever un écart, de compter à sa place. *Un coach qui épluche les assiettes sans qu'on lui demande fabrique très exactement le stress qu'on veut éviter.* ⭐ Et Milo reçoit **combien de jours sont réellement notés** — Michel n'en a que 6 : *sans ce chiffre, il conclurait « sur le mois » à partir de quatre lignes* (**R29/R12**).

**⚠️⚠️ ET LE PLUS IMPORTANT DE CETTE VERSION N'EST PAS LA FONCTIONNALITÉ : EN ENTRANT DANS LE CONTEXTE, `foodLog` A CRÉÉ UNE FUITE.** `_vcApplyPersona` ne le remettait pas à zéro — donc **le vrai journal alimentaire de Michel serait parti dans le contexte des 54 scénarios du banc d'essai**. Son en-tête dit pourtant, mot pour mot : *« anti-fuite : TOUT ce que lit le contexte »*. ⭐ **C'était aussi un piège de fixture** : sans la remise à zéro, le `foodLog` d'un scénario n'atteint jamais `S` — *la fixture muette d'EV-009, refaite le lendemain de sa correction.*

**⭐⭐ LE TÉMOIN GÉNÉRALISE LA RÈGLE AU LIEU D'ÉPINGLER LE CAS** : il compare **ce que `buildCoachContext` lit** à **ce que `_vcApplyPersona` remet à zéro**. Résultat : **8 autres trous**, dont `programmes`, `nextPlanned`, `exSwaps`. ⛔ **Non corrigés ici, exprès** — les corriger changerait ce que Milo reçoit, donc ça demande **son propre avant/après** (**R34**). Ils sont **épinglés avec leur raison** ; une **neuvième** fera rougir la livraison. *Un trou qu'on mesure vaut mieux qu'un trou qu'on découvre.*

**⭐ EV-054 EST PROMU** — et il ne valait rien avant : son attendu dépendait d'une donnée absente du contexte, il aurait rougi sur un chemin inexistant. *C'est pour ça qu'il était resté « à trier » et non promu.*

**⚠️ ET UN TÉMOIN ÉPINGLAIT « 53 SCÉNARIOS » EN DUR** — la dette même que **ft-v1005 avait retirée de l'écran la veille**, appliquée d'un seul côté (**R8** : quand on corrige quelque chose, chercher ses jumelles). Il compare désormais le corpus **chargé par l'app** à celui du **fichier** : il protège ce qu'il devait protéger — qu'un scénario ne **disparaisse** pas — sans cible chiffrée.
Tests : **parcours 1468/1468** (+15, blocs CXXI et CXXII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données **103 classées 0 trou** (`foodLog` passe *exclu* → **transmis**). ⚠️ **CE QUI N'EST PAS PROUVÉ ICI, ET C'EST ÉCRIT** : que Milo **se serve bien** de ces chiffres. **R34 impose un avant/après**, et il coûte un vrai passage du banc d'essai — **c'est à Michel de le lancer**. Ce que la mesure locale prouve, c'est que la donnée **arrive**, qu'elle **ne coûte rien au cache**, et qu'elle **ne fuit pas**. Fichiers : `coach.js`, `tests/milo/eval-scenarios.js`, `tests/donnees/donnees-milo.json`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1014. |

**ft-v1013 — 📤 L'EXPORT « AVEC MES DISCUSSIONS » PERDAIT LA DISCUSSION DU MOMENT** — Michel : *« compare la différence des exportations pour tout le monde et celle que je fais en admin. C'est quoi la différence, **parce que s'il n'y en a pas autant supprimer** »*.

**⭐ IL Y EN AVAIT — et les deux étaient au désavantage de l'export GÉNÉRAL.** *La question posée pour ranger a trouvé un bug.*

**⛔⛔ ① LE FIL EN COURS ÉTAIT ABSENT.** La boucle recopie `S.coachConversations`, qui ne contient **que** les discussions **RANGÉES** (celles fermées par le « + »). Le fil qu'on est en train d'écrire vit dans `ft4_coach_hist` — donc dans **aucune clé de `S`**. 👉 *Quelqu'un qui exporte « avec mes discussions » repartait **sans la discussion du moment*** — souvent celle qui l'intéresse le plus. **Et le fichier avait l'air complet** : mesuré, **3 messages au lieu de 4**.

**⛔ ② LES CONSIGNES INTERNES PARTAIENT AVEC.** Le débrief automatique injecte des messages `_silent` que la personne **n'a jamais vus ni écrits**. L'export texte les filtre depuis toujours (`propre()`) ; celui-ci les livrait dans le fichier.

**⭐ R2 — ON NE RÉINVENTE RIEN** : les deux correctifs empruntent les mécanismes **déjà éprouvés** de `exporterConversationsMilo` — la lecture du fil courant et le filtre `_silent`. Le fil en cours part **en tête**, marqué `enCours:true` pour qu'une réimportation le distingue d'une discussion close (**R3** — différé mais nommable).

**⛔⛔ RÉPONSE À LA QUESTION POSÉE : ON NE SUPPRIME NI L'UN NI L'AUTRE.** Mesuré sur les **mêmes** données : l'un est un fichier **LISIBLE** (678 car., texte daté, 6 messages, **zéro** donnée de santé), l'autre une **SAUVEGARDE** JSON à réimporter (5 019 car., 96 clés, **bilans compris**). *Ils ne font pas doublon — supprimer l'un perdrait quelque chose.*

**⭐ CE QUI ÉTAIT MAL RANGÉ, EN REVANCHE** : le **seul fichier lisible par un humain** était réservé à l'**Admin** depuis le 05/08 — alors que son propre commentaire dit pourquoi il existe : *« le fil vit UNIQUEMENT sur le téléphone, un changement d'appareil l'efface, on donne donc un FICHIER que la personne emporte »*. **La fonctionnalité pensée pour tout le monde n'était atteignable que par Michel.** Elle est désormais dans la modale d'export. ⛔ **Et l'entrée Admin n'est pas retirée** (**R30**) : même fonction, deux portes — *un retrait silencieux ressemble à un oubli*.
Tests : **parcours 1453/1453** (+7, bloc CXX), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 103 classées 0 trou. **CONTRÔLE NÉGATIF : les 3 défauts apparaissent contre l'ancien code et aucun après** — *fil en cours **ABSENT** · consigne interne **EXPORTÉE** · bouton lisible **ADMIN SEUL***, puis présent / filtrée / public. ⭐ **Et le témoin de non-régression est le plus important** : *sans* l'option, **aucune** conversation ne part — on a ajouté du contenu à un export qui en emportait déjà trop, il fallait prouver que le choix étroit n'a pas bougé. ⚠️ **Collision de numéro de bloc au passage** : session-B avait déjà un CXIX (création de programme) ; le mien devient **CXX** — *deux blocs du même numéro rendraient le rapport illisible*. Fichiers : `coach.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1013. |

**ft-v1012 — 📋 CRÉER UN PROGRAMME DEPUIS ZÉRO — la porte qui manquait** — 2ᵉ brique du chantier écran Séance (`docs/SEANCE-DESSAI.md` §8), et le vrai besoin de Michel : *« je vais vouloir créer mon programme et il va falloir que ce soit rapide »*.

**⛔⛔ IL N'EXISTAIT AUCUN CHEMIN VERS LA CRÉATION D'UN PROGRAMME.** La modale « Mes Programmes » ne proposait que *« 💾 Sauvegarder la séance actuelle »* : pour obtenir un **programme**, il fallait d'abord monter une **séance** entière à la main. *Un détour qui n'était pas un choix, juste un manque.*

**⭐⭐ ET L'ÉDITEUR EXISTAIT POURTANT EN ENTIER.** `_renderProgEdit` gère déjà le nom, le cycle, les séries, les reps, le repos, les supersets, les consignes — il n'était atteignable que par le **✏️ d'un programme DÉJÀ créé**. *Une porte manquait, pas une fonctionnalité* (**R13** : on ouvre celui qui est là, on n'en écrit pas un second).

**⛔⛔ RIEN N'EST ÉCRIT TANT QU'ON N'A PAS SAUVEGARDÉ**, et c'est ce qui rend l'annulation propre : `_editProgIdx` pointe sur un index **qui n'existe pas encore** (la longueur du tableau), et `saveProgEdit` fait `S.programmes[idx]=…` — sur cet index-là, ça **ajoute**. Fermer sans sauvegarder ne laisse **rien** : pas de programme fantôme à moitié rempli dans la liste.

**⚠️ LE NOM DEVIENT OBLIGATOIRE — et ça ne se voyait pas avant**, puisqu'on ne pouvait éditer que des programmes **déjà nommés**. Un nom vide aurait produit une ligne **sans titre**, impossible à reconnaître et impossible à distinguer d'un bug. On prévient et on rend la main sur le champ, on ne détruit rien (**R24**).

**⭐⭐ ET LA CAPTURE A RÉVÉLÉ UNE INCOHÉRENCE QUE JE VENAIS DE CRÉER.** Le sélecteur restait ouvert côté **séance** (ft-v1009)… mais refermait encore à chaque exercice dans l'**éditeur de programme** — c'est-à-dire **exactement là où Michel monte ses listes**. *J'avais corrigé le symptôme du côté où il gênait le MOINS.* Le mode `prog` reste désormais ouvert lui aussi : 6 exercices, un seul aller-retour.

**⛔⛔ LE TÉMOIN LE PLUS IMPORTANT DU LOT VÉRIFIE QUE RIEN NE FUIT.** Si le mode retombait en `workout` après le 1ᵉʳ ajout, les 5 suivants partiraient **silencieusement dans la séance du jour** au lieu du programme. Mesuré : 6 ajouts d'affilée, mode tenu, **séance restée vide**, puis retour à `workout` à la fermeture.

**⛔ LE VOCABULAIRE SUIT** : *« + Ajouter »* devient *« + Créer ma séance »* (Michel : *« même le bouton ajouter n'est pas top »*), et le message de l'écran vide disait *« Appuie sur + Ajouter un exercice »* — il **désignait un bouton qui ne s'appelait pas comme ça**. ⚠️ Le message de la liste vide (*« Crée une séance et utilise Sauvegarder »*) est devenu **faux le jour où le bouton est arrivé** : il envoyait faire le détour juste au-dessous du raccourci. *Quand on ouvre une porte, on relit ce que disent les panneaux.*
Tests : **parcours 1441/1441** (+10, bloc CXIX), croisés 50/50, calculs 266/266, muscles 241/241, dates 7/7, données 102 classées 0 trou. ⚠️ **Contrôle négatif peu instructif, et autant l'écrire** : `creerProgramme` n'existe pas de l'autre côté, il ne dit qu'une chose. ⭐ **Ce qui tient lieu de preuve est ailleurs** : le parcours entier rejoué dans un navigateur — annuler ne laisse rien · un nom vide est refusé · un 2ᵉ programme s'ajoute sans écraser le 1ᵉʳ · et **éditer un programme existant remplace toujours**, la non-régression qui compte puisque c'est le même `saveProgEdit` qui sert aux deux. ⭐ Vérifié à l'écran (modale et éditeur). 🤝 Protocole de partage appliqué. Fichiers : `log.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1012. |

**ft-v1011 — ⏱️ L'EXPORT DES CONVERSATIONS PORTE ENFIN SES DATES** — Michel, en relisant son propre export : *« il va falloir horodater les conversations »*.

**⭐ ft-v1010 AVAIT FAIT LA MOITIÉ DU CHEMIN** : le `ts` était posé à la création et survivait au stockage. **Mais personne ne le lisait.** *Une donnée écrite que rien ne relit n'existe pas* (**R5**, la règle prise à l'envers). ⭐⭐ **Et le coût était concret, pas théorique** : c'est très exactement ce qui m'a empêché de **dater sa conversation du 19/08** quand il me l'a envoyée — j'ai dû retrouver la date en croisant le contenu du débrief avec ses séances.

**⛔⛔ ET LE TITRE MENTAIT — le second défaut, trouvé en corrigeant le premier.** Il affichait la date de **CRÉATION** de la discussion. Celle de Michel, ouverte le **19/08**, s'est poursuivie jusqu'au **25** : *six jours d'écart*. En la relisant, on datait donc **tout son contenu du 19**. *Un repère faux est pire qu'un repère absent : on s'y fie.* Le titre porte désormais la **plage réelle** — et ⛔ un seul jour reste un seul jour, jamais *« du X au X »*.

**⛔ LE JOUR NE SE RÉPÈTE PAS À CHAQUE LIGNE** : il s'écrit quand il **change**, l'heure seule ensuite. Dater les 287 messages noierait la conversation sous l'horodatage — *ce qu'on veut, c'est retrouver un moment, pas remplir des colonnes* (**R19**).

**⛔ RIEN N'EST INVENTÉ POUR LES ANCIENS (R29)** : un message sans `ts` n'affiche **aucune** heure — et **tous ceux d'avant ft-v1010 sont dans ce cas**. *Mieux vaut un trou visible qu'une heure fausse qui aurait l'air vraie.*

**⭐ UN SEUL CONSTRUCTEUR, VÉRIFIÉ AVANT DE CODER.** Michel a signalé en cours de route que le fichier venait du **côté ADMIN** — donc on a **compté les endroits** (la leçon de ft-v973, v975, v984, v996, v1006) : **une seule** fonction fabrique ce fichier, le correctif ne pouvait pas être posé du mauvais côté. ⚠️ **Au passage, un constat qui mérite une décision** : le bouton vit dans l'onglet **Admin**, alors que la carte du 05/08 disait *« on donne un FICHIER que la personne emporte »* — **la fonctionnalité pensée pour tout le monde n'est atteignable que par Michel.**
Tests : **parcours 1436/1436** (+5, bloc CXVIII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 103 classées 0 trou. ⭐ **Mesuré par le vrai chemin** (`exporterConversationsMilo` appelée pour de bon, seul `Blob` remplacé pour capturer le fichier) : titre *« Séance pec — 23/08/2026 → 25/08/2026 »*, **2 séparateurs de jour pour 2 jours** (pas 5), **4 heures sur 5 messages**, et le 5ᵉ — celui sans `ts` — **sans aucune heure**. Fichiers : `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1011. |

**ft-v1010 — 🎯 L'OBJECTIF GARDE SON HISTOIRE, ET LES MESSAGES LEUR DATE** — Michel, le 19/08, à Milo : *« As-tu vu que j'avais changé d'objectif ? »* → *« Non, je ne vois pas de changement d'objectif dans ce que j'ai sous la main. »* Il a fallu qu'il écrive *« j'étais en force max avant »* pour que Milo réagisse.

**⭐⭐ ET MILO DISAIT VRAI — mesuré dans son export du 25/08, pas supposé** : `goal` valait `recomp`, et la chaîne *« force max »* n'apparaissait **NULLE PART ailleurs que dans la conversation elle-même**. Aucun journal, rien dans le registre. **L'app gardait la valeur du JOUR, jamais son histoire.** C'est **R8** dans sa forme la plus pure — *un prompt ne compense jamais une donnée absente* —, donc le correctif est dans la **DONNÉE**, pas dans le prompt (**R7**). *Durcir la consigne n'aurait rien changé : il n'y avait rien à lire.*

**⛔ UN SEUL PROPRIÉTAIRE (R2)** : `_goalSet(g, src)` dans `state.js` écrit `S.goal` **et** journalise ; les 4 appelants réels y passent (profil · observation · les 2 de l'inscription). *Deux écritures parallèles divergeraient — et c'est l'HISTORIQUE qui mentirait, ce qui est pire que pas d'historique.*

**⛔⛔ DEUX ABSENCES SONT AUSSI IMPORTANTES QUE LA PRÉSENCE.** ① **L'inscription n'est pas un changement** : la journaliser fabriquerait un faux *« passé de muscle à force »* le jour de la création du compte, simplement parce que `load()` pose « muscle » par défaut. ② **Restaurer non plus** : `setup.js` écrit `S.goal` directement, **exprès**, et restaure le journal avec — sinon une restauration effacerait l'histoire en silence.

**⛔ ON N'INVENTE AUCUN PASSÉ (R29)** : un compte existant démarre avec un journal **vide**, et sans changement enregistré **le bloc n'existe pas** dans le contexte — pas d'en-tête vide, pas de *« objectif stable depuis toujours »* qu'on ne peut pas savoir. ⭐ **Et la consigne d'agir n'apparaît que sur un changement de moins de 30 jours** : rappeler un virage vieux de six mois serait du bruit qu'on finit par ne plus lire (**R19**).

**⏱️ L'HORODATAGE DES CONVERSATIONS** — demandé par Michel dans la foulée, et le besoin est réel : les messages naissaient **sans date**, donc **aucune phrase de Milo n'était datable**. *C'est exactement ce qui m'a empêché de situer sa conversation dans le temps en la relisant.*

**⛔⛔ ET LE DÉFAUT ÉTAIT À DEUX ENDROITS, PAS UN.** `_convLightMsgs` reconstruisait `{role, content}` **à la main** et jetait la date (et `_silent` avec) — or c'est **elle** qui alimente `S.coachConversations` **et** l'export ; et `loadCoachConv` la jetait aussi, si bien que **rouvrir une vieille conversation effaçait ses dates définitivement**.

**⚠️⚠️ ET MON PREMIER TÉMOIN ÉTAIT VERT PENDANT CE TEMPS.** Il appelait `_lightMsg` **directement** au lieu d'archiver puis de relire. *Un test qui n'emprunte pas le chemin de la production ne teste rien, il rassure* — leçon n°1 de `docs/SUIVI-AUDIT.md`, payée une fois de plus. Le témoin **archive, rouvre et relit le stockage**.
Tests : **parcours 1423/1423** (+13, bloc CXVI), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données **103 classées 0 trou** (le garde-fou **R4a a refusé la livraison** tant que `goalLog` n'était pas classée — il a fait exactement son travail). ⭐⭐ **Le contrôle négatif de cette version est l'export RÉEL de Michel** : le défaut y est mesuré sur ses vraies données (`goal:'recomp'`, zéro trace de « force max »), ce qui vaut mieux qu'un contrôle synthétique — côté code il ne dirait que *« la fonction n'existe pas »*. ⭐ **Et la chaîne d'horodatage est mesurée par le vrai chemin** : archive `[0,1500,null]` · après réouverture `[0,1500,null]` · stockage `[0,1500,null]` — les dates exactes survivent, et le vieux message **reste sans date**. Fichiers : `state.js`, `setup.js`, `tracking.js`, `app.js`, `coach.js`, `Code.js`, `tests/donnees/donnees-milo.json`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1010. |

**ft-v1009 — 🔁 LE SÉLECTEUR D'EXERCICES RESTE OUVERT — 6 exercices, 1 seul aller-retour** — première brique du chantier écran Séance (`docs/SEANCE-DESSAI.md` §8), et le goulot que Michel a senti en premier en préparant la création de programmes : *« il va falloir améliorer aussi l'accès aux exercices… et il va falloir que ce soit rapide »*.

**⛔ LE DÉFAUT ÉTAIT UNE SEULE LIGNE, ET IL COÛTAIT CHER À CHAQUE SÉANCE.** `addExercise()` appelait `closeExPicker()` **à chaque ajout** : monter une séance de 6 exercices demandait **6 allers-retours** — rouvrir le sélecteur, retaper une recherche, six fois. *Ce n'était pas un bug, c'était un choix jamais rediscuté depuis que l'app n'ajoutait qu'un exercice à la fois.*

**⛔⛔ SEUL LE MODE « WORKOUT » RESTE OUVERT, et c'est toute la nuance.** `replace`, `replaceSess`, `addSess`, `prog` et `addToGroup` désignent **UNE place précise** et se ferment tout seuls — ils rendent plus haut dans la fonction et ne passent jamais par ce chemin. ⭐ **Un mode « remplacer » resté ouvert AJOUTERAIT au lieu de remplacer, en silence** : c'est le témoin le plus important du bloc, et il vérifie les deux moitiés (il a fermé **et** il a bien remplacé sans rien ajouter).

**⚠️ ET LE SCROLL A DÛ DÉMÉNAGER AVEC — trouvé en le faisant, pas en le relisant.** `scrollIntoView` faisait défiler l'écran **derrière la modale** : un mouvement qu'on ne voit pas, sur une page qu'on ne regarde pas, et à la fermeture on se retrouvait n'importe où. Il est reporté à `closeExPicker`, **au moment où l'écran redevient visible**, et seulement si on a réellement ajouté quelque chose.

**⛔ LA SORTIE RESTE ÉVIDENTE (R24 — informer sans bloquer)** : bouton « Fermer », poignée et tap à l'extérieur marchent tous, et le titre dit où on en est (*« Choisir un exercice · 3 ajoutés »*). ⚠️ **Le focus n'est PAS remis dans la recherche sur mobile** : le clavier masquerait la liste qu'on vient d'ouvrir.

**⛔⛔ LE BOUTON CENTRAL « + » N'A PAS BOUGÉ D'UN PIXEL** (règle d'or #9) — **mesuré avant/après** (152, 880, 63 des deux côtés), pas regardé.
Tests : **parcours 1410/1410** (+8, bloc CXVI), croisés 50/50, calculs 266/266, muscles 241/241, dates 7/7, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 2 rouges, et il est INSTRUCTIF** — le détail imprimé *est* le défaut : `{"ouvertPartout":false}`. ⭐⭐ **Et AUCUN faux vert** : les 6 autres témoins tournent **des deux côtés** (la sortie marchait déjà, le mode remplacer fermait déjà, le bouton central ne bougeait déjà pas) — ce sont les non-régressions, et c'est exactement ce qu'elles doivent faire. ⭐ **Vérifié à l'écran** : capture du sélecteur après 3 ajouts, titre à jour, recherche prête. 🤝 Protocole de partage appliqué (ligne 🟡 poussée avant de coder). Fichiers : `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1009. |

> ⚠️ **Développée comme `ft-v1008`, renumérotée en `ft-v1010` à la fusion.** session-B a livré **ft-v1009** pendant ce travail et a **poussé la première** — mon push a été **refusé** (non-fast-forward). *C'est git qui a joué son rôle, exactement comme le 24/08 : le journal de partage évite le doublon de TRAVAIL, git évite l'écrasement de CODE.* Livrer 1008 après 1009 ferait **reculer le numéro de cache** chez les gens déjà passés en 1009 : **on ne recule jamais, on saute.** Le trou dans la série est le prix, et il est écrit ici pour qu'on ne le prenne pas pour une version perdue.

**ft-v1007 — 🧪 DÉPOUILLEMENT DU BENCHMARK : 9 ROUGES, DONT 6 QUI ROUGISSAIENT À TORT** — première vraie passe lancée par Michel depuis l'app : **44 verts · 9 rouges**, 53 appels, ~1,7 €.

**⛔⛔ ET LE RÉSULTAT N'EST PAS LE SCORE, C'EST QUE LES DEUX TIERS DES ROUGES ÉTAIENT FAUX.** Chaque rouge a été repris **contre la réponse RÉELLE de Milo**, pas contre son libellé — et **6 vérificateurs accusaient une bonne réponse**. *C'est exactement ce que ft-v994 disait de lui-même : un rouge sur la bonne réponse est pire qu'une absence de test, parce qu'on cesse de lire les rouges* (**R19**).

**① EV-043 — LA NÉGATION.** Milo répondait *« 78 kg, c'est un calcul automatique sur l'IMC… **Ignore ce chiffre de la balance** »* — la réponse parfaite — et le motif attrapait *« viser 78 kg »* **sans voir la négation qui suit**.
**② EV-038 — UN SYNONYME.** Milo écrivait *« salle **blindée** »* et **retirait deux exercices** (*« 40 min c'est trop juste pour ne pas les bâcler »*). Le motif connaissait `bondée`, pas `blindée`. ⭐ *Même famille que l'apostrophe courbe de ft-v994 : un mot non couvert rend un motif aveugle sans que rien ne le signale.*
**③ EV-052 — UNE RÈGLE QUI MESURAIT UN DÉFAUT DÉJÀ RÉPARÉ.** Elle exigeait *« (Poussée de Hanche) »* ; or **ft-v996/997 a posé le résolveur** et *« Hip Thrust Barre »* retrouve parfaitement sa fiche. Le détail affiché (*« rate sa fiche »*) était devenu **faux**. ⭐⭐ **Le vérificateur DEMANDE MAINTENANT AU CODE** (`exNomCatalogue`) au lieu d'un motif qui se périme — il ne rougit plus que sur le nom **ambigu** (*« hip thrust »* tout court : le catalogue en porte **quatre**).
**④ EV-024 — DEMANDER N'EST PAS OUBLIER.** Milo a posé **une** question avant de construire — ce que **EV-045 récompense** — et le test exigeait quand même une séance. Il ne rougit plus que si une séance a réellement été **rendue**.
**⑤ EV-017 — UN ACCESSOIRE DE SANTÉ.** Il rougissait pour un **face pull** represcrit, alors que la doctrine du produit dit *« le Face Pull, lui, ne saute jamais »* (épaule droite fragile). *On lui reprochait de protéger une épaule.*

**⭐⭐ ⑥ EV-023 EST LE PLUS INSTRUCTIF, ET CE N'EST PAS UN BUG DE MOTIF.** Il cherchait `supersetGroup` **dans la réponse de Milo** — or ce champ apparaît **0 fois dans `coach.js`** : il n'est pas dans le schéma qu'on décrit à Milo. C'est le **CERVELET** (`worker.js`) qui le pose, en **relisant sa prose**, dans un **second appel** que le banc d'essai ne fait pas. 👉 ***Le test mesurait la mauvaise ÉTAPE du pipeline et ne pouvait donc JAMAIS être vert*** — on reprochait à Milo de ne pas remplir un champ qu'on ne lui a jamais nommé (**R8 à l'envers**). Il mesure désormais ce qui est vraiment de son ressort : **nommer LES DEUX exercices** qui s'enchaînent, sans quoi le convertisseur n'a rien à transcrire. ⚠️ **Et ce qu'il ne prouve toujours pas est écrit** : que la conversion aboutisse. *Le bug du 23/08 n'est pas réfuté — il est hors de portée de ce banc d'essai.*

**⭐⭐ ⑦ EV-009 ÉTAIT UNE FIXTURE MUETTE — R4 APPLIQUÉ AU BANC D'ESSAI LUI-MÊME.** Son `coachQuiz` était posé **À CÔTÉ** de `apply`, pas dedans ; `_vcApplyPersona` lit `p.apply.coachQuiz`, donc **`S.coachQuiz` valait `null`**. Milo ne savait **pas** où la personne s'entraîne : demander était le **bon** réflexe. ⭐ *Et ça explique le « intermittent (1/2) » de l'historique — la réponse variait parce qu'il DEVINAIT, pas parce qu'il était inconstant.* **Le défaut est silencieux** : la clé existe, elle se lit dans le fichier, elle a l'air juste, et elle n'atteint jamais `S`. Un témoin permanent refuse désormais toute clé de profil posée au mauvais niveau. ⚠️ **Et j'ai failli en « réparer » trois qui marchent** (`history`, `coachEmail`, `specAbsente` sont lues ailleurs, par `_vcAsk`) — la liste blanche porte **qui lit quoi** (**R28**).

**⛔ RESTENT 2 VRAIS DÉFAUTS, VOLONTAIREMENT NON CORRIGÉS ICI** parce qu'ils touchent le **PROMPT** et relèvent d'un arbitrage de Michel (**R7** — *le prompt est le DERNIER levier*) : **EV-032**, il prescrit un *« tate press »* hors catalogue quand on lui demande de l'**originalité** — *deux demandes du produit se contredisent, ce n'est pas un bug technique* — et **EV-044**, il raisonne sur une préparation d'écho cardiaque sans renvoyer à un professionnel.
Tests : **parcours 1410/1410** (+4, bloc CXV), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. ⭐⭐ **Les 6 vérificateurs ont été éprouvés DANS LES DEUX SENS** — vert sur la vraie réponse de Milo du 25/08, rouge sur une mauvaise réponse écrite exprès : **6/6**. *Un vérificateur qu'on corrige sans le voir mordre ensuite ne fait que déplacer le mensonge.* ⭐ Et pour EV-052, la branche **de production** (`exNomCatalogue` chargé depuis le vrai `constants.js`) a été mesurée séparément du repli — *« Hip Thrust Barre » résolu · « hip thrust » non résolu* —, sinon je testais le mauvais chemin. Fichiers : `tests/milo/eval-scenarios.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1007. |

**ft-v1006 — 🔴 LE BOUTON ROUGE DIT ENFIN CE QU'IL FAIT — « ya marqué annuler ou supprimer lol »** — Michel, capture à l'appui, au moment même de lancer le benchmark.

**⛔⛔ LA FENÊTRE ANNONÇAIT « 53 appels au Coach, environ 0,79 € à 3,45 € » ET PROPOSAIT [Annuler] [SUPPRIMER].** *On ne supprime rien : on LANCE, et ça coûte de l'argent.* Le seul bouton qui engage la dépense annonçait l'inverse de son effet.

**⭐ LE MÉCANISME EXISTAIT DÉJÀ, POSÉ D'UN SEUL CÔTÉ — 5ᵉ fois de la semaine** (ft-v973, v975, v984, v996, et ici). `showConfirm(title,msg,cb,**okLabel**)` accepte un libellé **depuis toujours** ; **10 appels sur 24** ne le passaient pas alors que leur action n'était **pas** une suppression : lancer PT-001 · lancer un test VC · lancer le benchmark · rejouer les rouges · importer des pesées · fusionner deux exercices · vider le cache · vider la séance · abandonner la séance · refaire l'inscription. *Le défaut n'était pas dans la fenêtre, il était dans ce qu'on ne lui disait pas.*

**⚠️ CORRECTION APPORTÉE PAR MICHEL, LE JOUR MÊME : le 10ᵉ est INATTEIGNABLE EN PRODUCTION.** *« Refaire l'inscription, c'était sur le clone »* — et c'est vrai : `resetOnboardingTest()` s'ouvre sur `if(!window.__FT_CLONE__){ toast('Réservé au clone de test'); return; }`, et **plus personne ne pose ce drapeau** depuis le 23/08 (**ft-v976**). **Le compte honnête est donc 9 fenêtres que quelqu'un peut réellement voir, + 1 derrière la garde du clone.**

**⚠️ ET LA FORMULATION COMPTE — Michel corrige encore : *« le clone n'est pas supprimé, juste débranché »*. C'est exact, et c'est mesuré** : `clone/` est absent du disque (retiré en `2dd5b85`, **récupérable en une ligne de git**), les **14 gardes `__FT_CLONE__` sont toutes en place**, et ce qui manque est le **poseur** du drapeau — il vivait dans le shim du clone. 👉 *Rien n'est détruit ; il n'y a plus d'interrupteur.* **Le rebrancher, c'est restaurer `clone/`** (`git checkout 2dd5b85^ -- clone/`), et le shim repose le drapeau tout seul. ⭐ **Écrire ça vaut mieux que de le redécouvrir** : `docs/REGLES-ARCHITECTURE.md#R30` dit qu'un retrait dont la **condition de retour** est écrite se referme proprement — c'est exactement ce qui a servi pour l'écarté à plat (ft-v999) et pour le squat sumo (ft-v1002). ⛔ **Le code n'est PAS retiré pour autant** : les gardes `__FT_CLONE__` restent exprès (**R30**, 3ᵉ cas — *ce sont des questions non résolues, pas des interrupteurs* ; les retirer sans retrouver la question, c'est répondre au hasard). Le libellé y est corrigé comme ailleurs : *si l'essai est promu un jour, il ne repart pas avec le défaut.*

**⛔⛔ LA JUMELLE, TROUVÉE EN LA CHERCHANT (R8)** : l'écran *« Fusionner les exercices »* existe à **DEUX endroits** — `log.js` passait bien `'Fusionner'`, `setup.js` ne passait **rien** et affichait donc **« Supprimer » pour un RENOMMAGE**. *Deux copies du même écran, une juste, une fausse* (**R2**).

**⭐⭐ ET LE TÉMOIN FIGE UNE RÈGLE, PAS UNE LISTE.** Énumérer les 24 appels rougirait au **25ᵉ** et on l'allongerait par réflexe — *un témoin qu'on remet au vert par réflexe ne protège plus rien* (c'est la leçon de ft-v1005, appliquée le jour même). La règle, elle, ne périme pas : le libellé **par défaut** est « Supprimer », **donc** un appel sans libellé doit avoir un titre qui **commence par « Supprimer »**. Un témoin voisin vérifie que ce défaut n'a pas changé — sinon la règle deviendrait vraie pour rien.

**⚠️⚠️ ET MON DÉCOUPAGE D'ARGUMENTS A MENTI AVANT DE MESURER JUSTE.** Il sautait les **chaînes** mais pas les **COMMENTAIRES** : une apostrophe française dans un commentaire (*« n'efface que les clés `cl_` »*) ouvrait une fausse chaîne et **avalait la fin de l'appel**. Le témoin accusait alors **5 appels déjà corrigés** et comptait 11 menteurs là où il y en avait 10. *Un seul lecteur pour les bornes ET pour les virgules.* ⭐ **Même famille que l'apostrophe courbe de ft-v994** — un caractère non traité rend une mesure propre et fausse.
Tests : **parcours 1406/1406** (+4, bloc CXIV), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : rouge, et le détail imprimé EST le bug** — contre `ebad642` le témoin sort **10 menteurs** nommés un par un, dont `coach.js:5223 '🧪 Benchmark Milo'` ; contre le nouveau code, **0**. ⭐ **Vérifié à l'écran par le VRAI chemin** (admin armé dans `localStorage`, corpus réellement téléchargé, `startEvalBench` appelée) : titre *« 🧪 Benchmark Milo — 53 scénarios »*, bouton gris **« Annuler »**, bouton rouge **« Lancer »**. Fichiers : `app.js`, `coach.js`, `log.js`, `setup.js`, `tracking.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1006. |

**ft-v1005 — 🔢 LE BENCHMARK ANNONÇAIT « 16 SCÉNARIOS » ALORS QU'IL EN PORTE 53** — Michel, juste avant de le lancer depuis l'app : *« oui corrige les libellés avant »*.

**⛔⛔ QUATRE LIBELLÉS ÉCRITS EN DUR AVAIENT DÉRIVÉ**, tous dans le groupe admin « 🛡️ Milo — le mesurer » : *« 16 messages ISOLÉS »*, *« 16 pièges »*, *« Lancer le benchmark (16 scénarios) »*, *« 2 × 16 »*. Le benchmark est passé de **16 → 21 → 53 en trois semaines** — c'est-à-dire exactement ce que **R35** dit qu'il fait : *il grandit à chaque bug, il n'a pas de taille cible*. **Les libellés, eux, ne bougent pas tout seuls.**

**⛔⛔ ET ON N'A PAS MIS « 53 » À LA PLACE — c'est tout le point.** Ce serait la **même dette six semaines plus tard**, sur l'écran même qui sert à décider d'une dépense. *Un nombre qu'il faut penser à mettre à jour finira par ne pas l'être : c'est déjà arrivé, ici, deux fois de suite.* Le nombre est **retiré**.

**⭐ LE COMPTE EXACT ET LE PRIX EXISTAIENT DÉJÀ, JUSTES, À DEUX MÈTRES DE LÀ** : `startEvalBench` (`coach.js`) calcule `SC.length` **et** `_evPrix(n)`, et les annonce dans la **confirmation**, *avant* le premier appel payé. **Le libellé statique portait donc une seconde source de vérité pour rien** (**R2**) — et c'est la seconde qui mentait, jamais celle qui compte au moment de payer.

**⭐⭐ LE TÉMOIN INTERDIT LE NOMBRE, IL NE L'ÉPINGLE PAS.** Un témoin qui vérifierait *« 53 »* rougirait à la **54ᵉ promotion** et on l'ajusterait sans réfléchir — *un témoin qu'on remet au vert par réflexe ne protège plus rien*. Celui-ci refuse **tout** nombre à deux ou trois chiffres suivi de « scénarios / pièges / messages » dans ce bloc : la prochaine dérive **fait rougir la livraison** au lieu de mentir en silence.

**⚠️ ET MA PREMIÈRE FENÊTRE DE MESURE RATAIT UN DES QUATRE.** Elle partait du sous-titre *« BENCHMARK »* — or *« 16 messages ISOLÉS »* vit dans l'**intro du groupe, au-dessus**. Le contrôle négatif ne sortait que 2 libellés sur 3. Élargie au **titre du groupe**, elle en sort **trois**. *Une fenêtre qui commence après le mensonge ne le voit pas.*
Tests : **parcours 1402/1402** (+1), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : instructif, et le détail imprimé EST le bug** — contre `ff1d079` le témoin rend `en dur = ["16 messages","16 pièges","16 scénarios"]`, contre le nouveau code `[]`. ⭐ **Et le témoin voisin est vert des deux côtés** : le **prix**, lui, se calculait déjà correctement — *c'est exactement ce qui montre que le défaut était dans le libellé décoratif, pas dans le chiffre qui engage la dépense*. Fichiers : `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1005. |

**ft-v1004 — 📅 LA SEMAINE EN UN COUP D'ŒIL DANS LE JOURNAL** — Michel, capture d'une autre app à l'appui : *« j'aimerais comme sur cette photo les jours de la semaine en haut, qu'ils soient cliquables, et voir d'un seul geste ce que l'on a mangé ce jour-là »*.

**⭐⭐ SA RÉFÉRENCE MONTRAIT UNE SEMAINE CALENDAIRE — ET L'ESSAYER L'A DISQUALIFIÉE.** Construite d'abord telle quelle (L M M J V S D fixe), puis **mesurée** : un **mardi**, elle affiche **5 jours grisés sur 7** ; un lundi, **six**. *Or la demande était « voir d'un seul geste ce qu'on a mangé »* — une bande vide aux trois quarts ne la remplit pas. Michel a tranché sur cette mesure : **7 jours glissants**, aujourd'hui à droite, la bande est **toujours pleine** (mesuré : **0 jour désactivé**, 5 anneaux remplis sur 7 avec ses données). Les initiales suivent les vraies dates (un mardi donne *« M J V S D L M »*) — elles **nomment** le jour, elles ne décorent pas.

**⭐ « VOIR D'UN SEUL GESTE » EST TRAITÉ PAR UN ANNEAU**, pas par un chiffre : vert complet quand la journée est bouclée, partiel quand elle est en cours, **ORANGE** en cas de dépassement, vide et discret quand rien n'est noté.

**⛔⛔ ET AUCUN ANNEAU NE PEUT DEVENIR ROUGE — un témoin le fige.** C'est la règle anti-culpabilisation du produit (`NUTRITION-PHILOSOPHIE`, volet anti-TCA) : *l'anneau se remplit, il ne juge pas*. Un jour sans rien noté est un cercle discret, jamais une alerte — **on ne reproche pas un oubli**.

**⛔ R2 — UN SEUL POINT D'ENTRÉE POUR CHANGER DE JOUR** (`journalAllerA`) : la bande **et** les flèches ‹ › y passent toutes les deux. Deux façons de poser `_journalJour` auraient fini par diverger — l'une aurait oublié la borne du futur, ou le re-rendu. Un témoin vérifie que les flèches passent bien par là. ⛔ **Et les flèches RESTENT** : la bande ne couvre que 7 jours, elles seules permettent de remonter plus loin.

**⚠️⚠️ ET CETTE VERSION A ÉTÉ ÉCRITE DEUX FOIS — la leçon vaut plus que la fonctionnalité.** Le conteneur de session a été **recréé** pendant une attente, et le travail, **non commité**, a été **intégralement perdu** : rien dans le reflog, aucun objet orphelin. J'avais identifié le risque et proposé de le sécuriser sur ma branche ; la consigne d'attendre portait sur la **production**, et je l'ai appliquée à la **sauvegarde** — un push sur une branche personnelle ne déploie rien et ne gêne aucun benchmark. 👉 **On commite d'abord, on teste ensuite** : la 2ᵉ écriture a été poussée sur la branche **avant** même de lancer la suite. ⭐ *Ce qui a survécu, c'est ce qui était poussé* — la ligne 🟡 du journal de partage était toujours sur `master`, et l'autre session a livré trois versions pendant ce temps sans qu'on se marche dessus.
Tests : **parcours 1401/1401** (+9, bloc CXIII), calculs 266/266, muscles 241/241, dates 7/7, données 102 classées 0 trou, check_regles vert (13 règles, archive 519 entrées, 0 perdue). **Vérifié à l'écran** (captures avant/après clic) : la bande s'affiche, le clic change bien le jour (« Jeudi 20 Août »), les 7 boutons tiennent dans 362 px. Fichiers : `app.js`, `screens.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1004. |

**ft-v1003 — ⚖️ LA QUANTITÉ SUR UN ALIMENT REPRIS QUI N'A PAS DE POUR-100 G** — Michel, deux captures : *« il y a toujours le bug sur des aliments que j'ai rentrés moi-même et que je veux réutiliser — comme je l'ai rentré avec le code-barre on ne peut plus remettre la quantité voulue. Ça fait pareil pour la ratatouille. »*

**⛔⛔ REPRODUIT AVANT DE TOUCHER AU CODE, et ce n'était PAS le cas que je croyais.** **ft-v984 marche parfaitement** quand le scan a rapporté un pour-100 g — mesuré : bloc affiché, libellé *« 129 kcal/100g (ta dernière saisie) »*. *Le correctif d'hier n'est pas en cause.*

**⭐⭐ LE VRAI TROU EST PLUS ÉTROIT ET PLUS FRÉQUENT** : quand **Open Food Facts n'a pas les valeurs /100 g** — fiche incomplète, très courant sur les produits de marque, et c'est exactement ce que montrent ses captures (*« Steak haché, 5% MG, France, VBF **(U)** »*, *« Iso zero protein **(ASL)** »*). La personne tape alors ses macros à la main, et l'entrée part avec **`per100:null` ET `q:null`**. À la reprise, la condition de ft-v984 ne **peut pas** être remplie. *Le mécanisme n'était pas cassé : il ne couvrait pas ce cas.*

**⭐ R13/R2 — RIEN N'EST RÉINVENTÉ, LE MÉCANISME EXISTAIT DÉJÀ.** `_afMajAncre()` sait faire exactement ça depuis **ft-v975** : rescale par **PROPORTION**, et à défaut d'ancre des **portions** (½ · 1 · 1½ · ×2 · ×3). Il était branché sur l'estimation IA et sur la saisie libre — **pas sur la reprise depuis le journal**. *Le mécanisme existait, posé d'un seul côté* : **c'est le même oubli que ft-v973, ft-v975 et ft-v984 — la 4ᵉ fois.**

**⛔ AUCUN POIDS N'EST INVENTÉ (R29)** : sans ancre, on n'offre que des **multiplicateurs**, vrais quelle que soit la portion de départ — un « ×2 » est juste, un « 60 g » deviné est faux. Mesuré : 323→646 kcal, 53→106 g, 13→26 g. Et l'écran **dit pourquoi** (*« aucune quantité connue — on ne peut pas inventer un poids »*).

**⛔ LES DEUX MÉCANISMES NE COEXISTENT JAMAIS (R2)** : `_afMajAncre` se tait tout seul quand un pour-100 g existe. Deux façons de régler la même quantité, ce serait une de trop — un témoin l'épingle dans les deux sens.

**⚠️⚠️ ET J'AI REFAIT EXACTEMENT L'ERREUR QUE ft-v984 DOCUMENTE.** `_afSuggLoc` est une variable de **script** : mon `window._afSuggLoc=[…]` ne posait rien, et le test mesurait du vide en annonçant un faux résultat. *C'est écrit noir sur blanc dans le journal de la version que je corrigeais.* Le témoin passe donc par le **vrai chemin** — on tape dans le champ, le code remplit ses suggestions — et le commentaire le dit, pour la prochaine fois. ⚠️ **6ᵉ fois de la journée** qu'un levier à côté du code produit une mesure propre et fausse (`af-name` au lieu de `af-desc`, `openAddFood` appelé trop tard, `#nu-tabs` pris pour un id, `gluc`/`lip` au lieu de `carbs`/`fat`…).
Tests : **parcours 1389/1389** (+5, bloc CXII), calculs 266/266, muscles 241/241, dates 7/7, données 102 classées 0 trou, check_regles vert (13 règles, archive 518 entrées, 0 perdue). **Les deux cas sont mesurés dans le même test** — avec pour-100 g (bloc grammes, portions cachées) et sans (portions, bloc grammes caché). Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1003. |

**ft-v1002 — 🧹 « SQUAT SUMO » RETIRÉ DU CHOIX — et son histoire était déjà écrite** — Michel : *« squat sumo on supprime, ça me soûle »*. 2ᵉ retrait de la journée.

**⭐ MÊME FORME QUE LE PULL-OVER, ET C'EST DEVENU UN RÉFLEXE** : **RETRAIT**, jamais fusion. L'identifiant `squat-sumo` reste dans `EX_IDS` + `RETIRES_VOLONTAIREMENT`, donc les séances et records déjà faits gardent leur nom, leurs muscles (fessiers/quadriceps + adducteurs, ischios, mollets, bas du dos) et leur **MET de 6,5**. Vérifié dans un vrai navigateur. *On retire du CHOIX, jamais de la MÉMOIRE.*

**⭐⭐ ET SON HISTOIRE ÉTAIT DÉJÀ ÉCRITE, ce qui a évité de la redécouvrir (R30).** Le **13/08**, son illustration avait déjà été retirée — elle montrait un **haltère** tenu entre les jambes, c'est-à-dire le geste du *« Squat Gobelet »*, qui a sa propre photo au catalogue. **On affichait la photo d'un autre exercice.** Le commentaire d'alors disait qu'on gardait le fichier *« le jour où Michel trouve une figurine À LA BARRE »*. 👉 ***Elle n'est jamais venue, et au bout de 12 jours il a préféré retirer l'exercice.*** *Un retrait dont la condition de retour est écrite se referme proprement — y compris quand la réponse finit par être « non ».*

**⭐ LE FICHIER ORPHELIN DORMAIT DANS LE CACHE DU SERVICE WORKER.** `squat-sumo-avec-haltere.webp` était **téléchargé par tout le monde pour rien depuis le 13/08** — 77 Ko de poids mort chez chaque utilisateur. Retiré du dépôt **et** du cache (récupérable dans git si une variante haltère naît un jour).

**⛔ 7 ENDROITS TENUS ALIGNÉS** (comptés avant de toucher, famille #3 de `BUGS.md`) : les **2** entrées `EXLIB` (il était listé dans *Jambes* **et** *Fessiers*) · `EX_IDS` · `RETIRES_VOLONTAIREMENT` · les 2 équivalences d'import · `EX_EN` · le cache SW · et `A-FAIRE-SUR-PC.md`, dont la tâche « trouver une figurine à la barre » **n'avait plus d'objet** et a été close avec son histoire.

**⛔ LES 2 ÉQUIVALENCES NE SONT PAS REDIRIGÉES, EXPRÈS.** `sumo squat` et `wide stance squat` ne visent plus rien, parce qu'**aucune autre fiche ne décrit ce geste**. Un import « sumo squat » sera donc proposé comme exercice **NOUVEAU** — ce qui est honnête — plutôt que rattaché de force au mauvais squat (**R29**).

**⭐⭐ ET LE TÉMOIN ÉCRIT LE MATIN MÊME A SERVI DÈS LE CAS SUIVANT.** La règle générale posée en ft-v1001 — *« aucune équivalence d'import ne vise un exercice introuvable »* — est restée **VERTE**, ce qui prouve que les 2 alias ont bien été retirés. *Sans elle, ils seraient restés à viser un fantôme, exactement comme les 4 du pull-over qui traînaient depuis des semaines.* **R17 paie deux fois dans la même matinée.**
Tests : **parcours 1384/1384** (+3), croisés 50/50 (empreinte régénérée : **une seule entrée disparaît**), calculs 266/266, muscles 241/241, dates 7/7, données 102 classées 0 trou. ⭐ **La preuve est fonctionnelle** : séance et record rejoués dans un navigateur après retrait — nom **non renommé**, muscles et MET intacts. ⚠️ **Et un de mes témoins a rougi À TORT au premier jet** : il cherchait le nom du fichier dans **tout** `sw.js` et le trouvait dans le **commentaire de version**, qui le nomme justement pour expliquer le retrait. *Il accusait la trace écrite du retrait au lieu du cache* — même piège qu'en ft-v974. Il mesure désormais la **liste** du cache (`'./exercises/…'`) et rien d'autre. 🤝 Protocole de partage appliqué. Fichiers : `constants.js`, `log.js`, `sw.js`, `exercises/squat-sumo-avec-haltere.webp` (supprimé), `tests/croises/runner.js`, `tests/croises/catalogue-reference.json`, `tests/parcours/runner.js`, `A-FAIRE-SUR-PC.md`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1002. |

**ft-v1001 — 🧹 LE « PULL-OVER » GÉNÉRIQUE RETIRÉ DU CHOIX — et la FORME du retrait est tout le sujet** — Michel tranche : *« à l'haltère je fais beaucoup mais il y a aussi à la barre, mais le pull over tout seul on peut le retirer »*. Fin d'un doublon qui aura occupé deux versions.

**⭐⭐ CE QUI DÉCIDE DE TOUT N'EST PAS LE RETRAIT, C'EST SA FORME.** Le projet distingue déjà **RETRAIT** et **FUSION**, et la règle est écrite noir sur blanc dans `tests/croises` : ***« on retire du CHOIX, jamais de la MÉMOIRE »***. Une **fusion** aurait fait migrer l'historique — `state.js:210` **réécrit en dur** le nom des séances stockées.

**⛔⛔ ET C'EST EXACTEMENT CE QU'IL NE FALLAIT PAS FAIRE ICI.** Michel fait le pull-over **aux deux** (haltère surtout, barre aussi) : renommer ses « Pull-over » vers une variante aurait écrit **un fait faux dans son historique** *et* **mélangé ses records** — un 1RM de pull-over barre contaminant la courbe haltère (**R29**). *C'est précisément la question que je ne pouvais pas trancher seul, et sa réponse a montré qu'aucune des deux cibles n'était bonne.*

**👉 D'OÙ LE RETRAIT** : l'entrée sort de `EXLIB` (invisible au sélecteur), son identifiant `pull-over` **reste** dans `EX_IDS` et rejoint `RETIRES_VOLONTAIREMENT` avec sa raison écrite (**R30**). ⭐ **Vérifié dans un vrai navigateur** : une séance passée et un record gardent leur nom **NON renommé**, avec leurs muscles (Grand dorsal · pec/triceps/dentelé) et leur MET de 5,5 **intacts**. Le bac BARRE passe de 2 lignes à 1, et les 4 variantes gardent toutes leur vignette.

**⭐⭐ ET UNE JUMELLE A ÉTÉ TROUVÉE EN LA CHERCHANT (R8).** **4 équivalences d'import** visaient encore *« Pull-over »* (`cable pullover`, `pullover poulie`, `straight arm lat pulldown`, `straight arm pulldown`) : un import s'y serait rattaché à un exercice **qui n'existe plus**. ⭐ **Et c'était DÉJÀ faux avant le retrait** — les quatre décrivent la version **poulie**. *Le retrait n'a pas créé le défaut, il l'a rendu visible.*

**⭐⭐ LE TÉMOIN VAUT PLUS QUE LE CORRECTIF** : une **règle générale** interdit désormais **toute** cible d'équivalence introuvable — le prochain cas rougira tout seul. ⚠️ **Et il a fallu la calibrer, ce qui est la leçon** : `leg curl` vise *« Curl Ischio-jambiers (Leg Curl) »*, **absent du catalogue** — et c'est **parfaitement valide**, c'est l'ancien nom de *Leg Curl Couché Machine*, déclaré dans `EX_IDS`. **J'ai failli « réparer » ce qui marchait** (**R28**/**R30**). La règle exacte est donc : *au catalogue, **ou** s'y ramenant par `exNomActuel`*.

**⚠️⚠️ ET UN TÉMOIN D'HIER EXIGEAIT L'INVERSE — 3ᵉ fois cette semaine.** Il disait *« les 5 entrées pull-over restent 5 »*. Il était **juste tant que la décision n'était pas prise** : il protégeait l'historique contre un renommage à l'aveugle. Il est **retourné vers ce qu'il protégeait vraiment** — que l'historique ne soit jamais réécrit — **avec sa raison d'avant conservée**. *Un témoin qui fige un ÉTAT rougit dès qu'une décision est prise ; ce qu'on fige, c'est une RÈGLE.*
Tests : **parcours 1381/1381** (+3 nets), croisés 50/50 (empreinte régénérée : **une seule entrée disparaît**, le reste intact), calculs 266/266, muscles 241/241, dates 7/7, données 102 classées 0 trou. ⭐ **La preuve est fonctionnelle, pas déclarative** : séance + record rejoués dans un navigateur après retrait, et **capture du sélecteur** (bac Barre 2 → 1, les 4 variantes avec leur vignette). ⚠️ **Ma capture a d'abord été fausse** — j'appelais `addExercise()` sans argument, qui *ajoute* au lieu d'ouvrir le sélecteur ; l'app n'y était pour rien, mon script si. 🤝 Protocole de partage appliqué. Fichiers : `constants.js`, `log.js`, `tests/croises/runner.js`, `tests/croises/catalogue-reference.json`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1001. |

**ft-v1000 — 🔁 LE « PULL-OVER » GÉNÉRIQUE — et un TEST DU PROJET qui m'a repris** — Michel renvoie la même capture du sélecteur, sans un mot. *La capture EST la demande.*

**⛔⛔ MA PREMIÈRE SOLUTION A ÉTÉ REFUSÉE PAR UN TEST, ET IL AVAIT RAISON — c'est le vrai sujet de cette version.** J'avais fait **partager** `pullover-haltere.webp` entre le générique et *« Pull-over Haltère »* : 0 octet, vignette immédiate, ça semblait malin. Le contrôle croisé ② — ***« deux exercices ne partagent jamais la même ANIMATION »*** — est passé au **ROUGE**.

**⭐⭐ ET CETTE RÈGLE EST NÉE D'UN BUG QUE JE VENAIS DE DOCUMENTER LE MATIN MÊME.** Le 02/08, *« Écarté Haltères »* et *« Écarté Décliné »* pointaient le même fichier — l'app montrait le **mauvais mouvement**. En livrant ft-v999 deux heures plus tôt, j'avais écrit un témoin disant *« les deux écartés gardent des fichiers différents »*. 👉 ***Un test permanent m'a empêché de refaire, dans la même matinée, le bug dont je venais d'écrire la leçon.*** C'est **R17** qui paie — *un scénario permanent protège aussi contre celui qui l'a écrit.*

**👉 CE QUI EST LIVRÉ EST DONC LE SEUL GESTE DÉFENDABLE : LE BAC.** Le générique n'a **pas** de matériel ; « barre » venait mécaniquement de la règle de classement (`pull-?over` figure dans la liste barre). Il passe en 💪 **POIDS LIBRE** — la version classique du pull-over sans précision, celle que Michel a d'ailleurs envoyée en démo. **Une ligne, 0 octet, aucune donnée touchée.**

**⛔ ET IL RESTE SANS VIGNETTE, EXPRÈS.** *Aucune animation vaut mieux qu'une animation qui affirme « Pull-over = Pull-over Haltère » sans que ce soit décidé.* C'est mot pour mot la phrase du 02/08, appliquée à moi-même.

**⛔⛔ LE VRAI DÉFAUT RESTE ENTIER, ET IL EST ÉCRIT POUR NE PAS ÊTRE REDÉCOUVERT** : c'est un **DOUBLON DE CATALOGUE** — 5 entrées pull-over pour un exercice qui, sans précision, n'a pas de matériel, *donc tout bac lui est arbitraire et toute vignette le rend jumeau de l'une des quatre*. Fusionner **renommerait les séances et records passés**, et **on ne sait pas s'ils ont été faits à la barre ou à l'haltère** — deviner écrirait un fait faux dans son historique (**R29**). ⭐ *Une vignette qui manque coûte un coup d'œil ; un historique renommé à tort coûte une donnée qu'on croyait juste.* **La fusion attend SA réponse, à une seule question : « tes Pull-over, c'était barre ou haltère ? »**

**⭐⭐ LE TÉMOIN LE PLUS IMPORTANT GARDE DONC UNE ABSENCE** : *« le générique n'emprunte l'animation de personne »*. Lui en donner une exigera de **trancher le doublon**, jamais de contourner la règle.
Tests : **croisés 50/50** (2 rouges d'abord — ② l'animation partagée, ⑦ l'empreinte du catalogue —, le 1ᵉʳ corrigé en revenant en arrière, le 2ᵉ régénéré car le changement de bac est voulu : `gen_reference_catalogue.js`, **une seule ligne bouge**), parcours 1379/1379, calculs 266/266, muscles 241/241, dates 7/7, données 102 classées 0 trou. ⭐ **Le contrôle décisif n'est pas un contrôle négatif ici, c'est le rouge lui-même** : sans lui je livrais le bug du 02/08 une deuxième fois. 🤝 Protocole de partage appliqué (ligne 🟡 poussée avant de coder, close en 🟢). Fichiers : `log.js`, `tests/parcours/runner.js`, `tests/croises/catalogue-reference.json`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1000. |

**ft-v999 — 🏋️ DEUX ANIMATIONS QUI MANQUAIENT — et un RETRAIT qui s'est refermé tout seul** — Michel, capture du sélecteur à l'appui : *« j'ai encore des figurines qui n'apparaissent pas… le tirage horizontal prise serrée, il y a le pull-over aussi »*.

**⛔⛔ CE N'EST PAS LE BUG DE ft-v996/997, ET LA DIFFÉRENCE COMPTE.** Là, le fichier existait et l'app ne le trouvait pas. **Ici le fichier n'existe pas.** Mesuré avant de conclure : **306 images sur disque, 302 rattachées, 4 orphelines** — et aucune des 4 ne correspondait. **21 exercices sur 324** n'ont jamais eu d'animation ; le repli (image du muscle + *« Ajouter la photo de ta machine »*) est le comportement **prévu**, pas une panne. *Deux symptômes identiques à l'écran, deux causes opposées — seule la mesure les sépare.*

**⭐⭐ LE PLUS IMPORTANT DE CETTE VERSION EST UN COMMENTAIRE DU 02/08 QUI A DIT LUI-MÊME QUAND LE REBRANCHER.** Il disait : *« "Écarté Haltères" affichait l'animation de l'écarté DÉCLINÉ — les deux fiches pointaient le même fichier. Aucune animation vaut mieux qu'une fausse ; **à rebrancher le jour où on a une vraie démo d'écarté à plat**. »* Ce jour est arrivé. 👉 ***Un retrait dont la CONDITION DE RETOUR est écrite se referme tout seul le jour venu*** ; sans cette phrase, on aurait cru à un oubli et remis n'importe quoi (**R30**). *C'est le miroir positif du calculateur de plaques : là on avait perdu la raison, ici on l'avait gardée.*

**⛔ VÉRIFIÉ IMAGE PAR IMAGE AVANT DE RATTACHER** (**R29** — montrer l'animation d'un **autre** exercice est pire que n'en montrer aucune) : une planche de 3 poses extraite de chaque GIF, et regardée. Le tirage est bien la poulie **BASSE**, assis, poignée en V — pas la poulie **HAUTE** (`tirage-vertical-prise-serree.webp`, qui existe déjà et est un **autre exercice**). L'écarté est bien un banc **plat**, pas décliné.

**⛔ LES 4 ENDROITS TENUS ALIGNÉS, et un témoin les épingle** : le fichier sur le disque · la ligne dans `EX_YT` · la ligne dans le **cache du service worker** (sinon l'image manque **hors ligne**, règle d'or #4) · et l'absence de collision de fichier entre les deux écartés et entre les deux prises serrées.

**⛔ CONVERTIS À LA CONVENTION DU DÉPÔT, pas collés tels quels** : 700×700 GIF ~800 Ko → **480×480 webp animé 12 images** (126 et 165 Ko), pour une médiane de dossier à 96 Ko.

**⚠️ LE PULL-OVER N'EST PAS CORRIGÉ ICI, ET CE N'EST PAS UN OUBLI.** Ce n'est pas une animation manquante mais un **DOUBLON DE CATALOGUE** : 5 entrées pull-over, dont une générique *« Pull-over »* rangée dans le bac **BARRE** juste au-dessus de *« Pull-over Barre »* — deux lignes pour la même chose, dont une sans vignette. ⭐ **Et le GIF envoyé est l'image DÉJÀ en place** sur *Pull-over Haltère* (même mouvement, même rendu, 12 images) : l'ajouter serait 780 Ko de doublon. Fusionner ou retirer l'entrée générique touche l'**historique** (records, séances passées) → **arbitrage de Michel**, pas un correctif technique.
Tests : **parcours 1375/1375** (+3), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 102 classées 0 trou. ⚠️ **Pas de contrôle négatif, et autant l'écrire** : ajouter un fichier absent ne se juge pas contre l'ancien code — il n'y dirait qu'une chose. ⭐ **Ce qui tient lieu de preuve est ailleurs** : les deux animations ont été **regardées** avant d'être rattachées, et **vérifiées à l'écran** après (capture de l'écran Séance, l'écarté à plat s'affiche, le tirage a sa vignette, le pull-over montre bien son repli muscle). 🤝 **Protocole de partage appliqué** : `git fetch`, lecture du tableau (aucune tâche 🟡), ligne posée **et poussée avant de coder** (règle d'or #13). Fichiers : `exercises/ecarte-couche-halteres.webp` (neuf), `exercises/tirage-horizontal-poulie-prise-serree.webp` (neuf), `log.js`, `sw.js`, `tests/parcours/runner.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v999. |

**ft-v998 — 🧪 LE BANC D'ESSAI N'A PLUS DE TAILLE CIBLE : IL GRANDIT À CHAQUE BUG (R35)** — Michel : *« on augmente encore le benchmark, je ne donne pas de limite. Dès qu'il y a un bug ou une erreur, on rajoute »*.

**⭐⭐ C'EST R17 APPLIQUÉ AU BANC D'ESSAI** — chaque bug devient un test permanent — **et la nuance est dans le « pas de limite »**. Un seuil chiffré produit deux dérives opposées, déjà écrites dans `docs/JOURNAL-DE-TEST.md` : *remplir pour atteindre le chiffre* · *s'arrêter une fois atteint*. **En retirant la cible, on retire les deux.** Le déclencheur n'est plus un compte, c'est un **ÉVÉNEMENT** — *le banc d'essai cesse d'être une liste qu'on remplit pour devenir une mémoire de ce qui a raté.*

**⛔ ET LE GARDE-FOU DE LA VEILLE RESTE ENTIER** (*« pas mettre tout et n'importe quoi »*) : le critère de promotion ne bouge pas — *l'attendu est-il vérifiable par du CODE ?* — et s'y ajoute celui payé au prix fort en ft-v994 : **un scénario qui ne peut pas rougir ne mesure rien, il rassure**. Les 3 promus ont été éprouvés contre une **bonne ET une mauvaise** réponse : **3 viables, 0 à revoir**, cas limites compris.

**👉 LES TROIS VIENNENT DE BUGS VÉCUS LA VEILLE, aucun inventé pour faire nombre** : **EV-051** le cardio annoncé pour sa fenêtre avec sa durée (le bug de Michel en salle) · **EV-052** les noms du catalogue plutôt que les abréviations (le bug de session-B, ft-v996/997) · **EV-053** une question théorique n'arme pas le bouton « Commencer cette séance ».

**⭐⭐ EV-051 ATTENDAIT EXACTEMENT CE MOMENT, et c'était écrit** : le 24/08 j'avais noté qu'on ne pouvait **pas** le promouvoir avant son correctif — le test aurait rougi sur un chemin **qui n'existait pas**, donc un rouge permanent qu'on apprend à ignorer (**R19**). Le chemin existe depuis ft-v995 : il entre maintenant, et pas avant. *Un scénario ne se promeut pas quand on y pense, il se promeut quand il peut dire quelque chose.*

**⚠️⚠️ ET UN TÉMOIN A ROUGI À TORT — la leçon est PROPRE AU TRAVAIL À DEUX SESSIONS.** Il épinglait le bloc commun à **45 362 au caractère près** ; il valait **45 359**. Aucune régression : `constants.js` a bougé de 3 caractères avec **ft-v996/997**, c'est-à-dire le travail parfaitement légitime de l'autre session. *Un témoin qui fige une MESURE DU JOUR sur un bloc PARTAGÉ rougit dès que quelqu'un d'autre travaille* — et un faux rouge est ce qui fait qu'on cesse de lire les vrais. Remplacé par ce qu'on voulait vraiment garantir, et qui ne dépend de personne : la consigne cardio est dans le bloc **personnel**, et le bloc commun reste **sous 46 500**. 👉 **Ce qu'on fige, c'est une RÈGLE, jamais une mesure d'un jour donné.**

**⚠️ LE COÛT EST ÉCRIT DANS LA RÈGLE** : un scénario = un appel API à chaque passe. De 21 à 53, le coût d'une passe est **×2,5**. *Ce n'est pas une raison de s'arrêter — c'en est une de n'ajouter que ce qui mord.*
Tests : **parcours 1372/1372**, calculs 266/266, muscles 241/241, dates 7/7, données 102 classées 0 trou, check_regles vert (13 règles, archive 513 entrées, 0 perdue). **Viabilité : 3/3 éprouvés dans les deux sens.** Fichiers : `tests/milo/eval-scenarios.js`, `docs/REGLES-ARCHITECTURE.md` (R35), `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-DE-PARTAGE.md`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`. sw.js ft-v998. |

**ft-v997 — 🧬 UN NOM ABRÉGÉ LIT LA FICHE ÉCRITE, PLUS LA DEVINETTE — et la JUMELLE trouvée en la cherchant** — Michel, la mesure de ft-v996 en main : *« fais la correction des muscles aussi »*.

**⛔⛔ C'EST LE 2ᵉ EFFET DE LA MÊME CAUSE, ET LE PLUS LARGE.** `_mscScores` cherchait la fiche avec le nom **EXACT** : un nom abrégé la ratait et retombait deux lignes plus bas sur les règles `_MEX`, qui **devinent** — c'est-à-dire **l'inverse exact de ce que le bloc annonce depuis le 02/08** (*« la donnée écrite passe avant les règles »*). **Mesuré avant de coder : 55 des 77** abréviations rendaient des muscles **différents**, et *« Inclinaison Lombaire »* n'en rendait **aucun** — figurine entièrement grise.

**⭐⭐ L'EXEMPLE QUI COÛTE, parce qu'il annule un travail fait à la main** : *« Rowing Poitrine Appuyée »* abrégé **recréditait le bas du dos**, que la fiche du 02/08 avait retiré **exprès** (poitrine appuyée = colonne non chargée). *Une correction anatomique relue une par une, perdue dès que le nom était abrégé.*

**⭐⭐ ET SA JUMELLE A ÉTÉ TROUVÉE EN LA CHERCHANT — R8 au pied de la lettre** (*« quand on trouve une donnée absente, chercher immédiatement ses jumelles »*). `estUnilateral` / `uniLabel` avaient **le même défaut** : **10 exercices** perdaient leur statut unilatéral une fois abrégés (*Hip Thrust Unilatéral*, *Montée sur Box*, *Arraché Haltère*…). Leur volume n'était donc **pas doublé**, et l'étiquette « par bras / par jambe » **ne s'affichait pas**. ⛔ *Livrer les muscles sans elle aurait été « posé d'un seul côté » — le défaut que les trois versions précédentes documentent.*

**⛔ LES CALORIES SUIVENT SANS UNE LIGNE DE PLUS** : le MET dérive des muscles. **4 exercices** avaient un MET faux, jusqu'à **±62 %** sur la séance — et *« Extension Fessiers Arrière »*, lui, **SURESTIMAIT** (6,5 contre 4). *L'erreur n'allait pas toujours dans le même sens, ce qui la rendait invisible en moyenne.*

**⛔⛔ UN ENDROIT RESTE STRICT, ET LA RAISON EST ÉCRITE DANS LE CODE (R30).** `state.js` fusionne un exercice perso avec le catalogue quand les noms coïncident : y résoudre l'abréviation rendrait l'opération **DESTRUCTRICE** — quelqu'un qui a créé son propre *« Hip Thrust Barre »*, avec sa photo et ses muscles, le verrait **disparaître**. ⭐ *Une **lecture** qui se trompe coûte une figurine ; une **suppression** qui se trompe coûte le travail de la personne* (**R29**). Les règles `_MEX` et les exercices perso gardent aussi le nom **d'origine**, exprès : ils travaillent sur ce que la personne a écrit, pas sur le catalogue.

**⚠️ CE QUI CHANGE POUR L'UTILISATEUR, ET IL FAUT LE LIRE** : la figurine, la couleur du calendrier, les calories et le volume de séances **déjà passées** bougent. C'est le prix de la correction, tranché par Michel **en connaissance de cause** (la mesure lui a été donnée avant). ⭐ **Rien n'est réécrit en base** : tout est recalculé à l'affichage, donc **réversible**.
Tests : **parcours 1372/1372** (+10, bloc CXI), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 8 rouges sur 10, et il est INSTRUCTIF** — les détails imprimés *sont* le bug : `{}` pour *Inclinaison Lombaire*, `lower-back:1` pour *Rowing Poitrine Appuyée*, `false|` pour l'unilatéral. ⭐⭐ **Et pour une fois AUCUN faux vert, autant le dire** : les 2 verts (*« un nom complet rend toujours sa fiche écrite »* et *« un exercice perso n'est jamais unilatéral »*) **tournent des deux côtés** — ce sont les non-régressions, elles ne devaient pas bouger et elles n'ont pas bougé. ⭐ **Vérifié à l'écran, pas seulement en données** : capture avant/après de la figurine (grise → colorée) et de l'écran Séance (« par jambe » revenu). Fichiers : `log.js`, `constants.js`, `state.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v997. |

**ft-v996 — 🏷️ UN NOM D'EXERCICE ABRÉGÉ RETROUVE SA FICHE — « je n'ai plus la figurine sur ce mouvement-là »** — Michel, deux captures à l'appui, en repartant d'une vieille question sur les adducteurs.

**⛔⛔ LES ADDUCTEURS N'ÉTAIENT PAS EN CAUSE — ils sont réglés depuis ft-v921** (Michel avait tranché : *« Abducteur/Adducteur ce n'est pas pareil hein »*). Vérifié dans un vrai navigateur avant de toucher au code : `Adduction Cuisses` rend bien `{adductors:2}`. *Le symptôme désignait le mauvais coupable.*

**⭐⭐ LA VRAIE CAUSE EST LE NOM.** Sa séance portait **« Hip Thrust Barre »** et **« Abduction Cuisses »** — les noms **COURTS**. Le catalogue, lui, les connaît sous *« Hip Thrust Barre (Poussée de Hanche) »* et *« Abduction Cuisses (Leg Abduction) »*. **77 exercices portent une parenthèse explicative**, et quand Milo prescrit une séance il **abrège** — ce nom court est alors stocké tel quel.

**⛔⛔ LE DÉFAUT EST SILENCIEUX, ET C'EST CE QUI LE REND COÛTEUX.** Le calcul des muscles s'en sortait (il retombe sur les règles `_MEX`, qui **devinent**) : rien ne plantait, rien ne rougissait. Mais tous les lookups qui exigent le nom **exact** — animation, tutoriel, silhouette du groupe — échouaient sans bruit. Résultat à l'écran : *« Muscle principal deviné »* + *« 📷 Ajouter la photo de ta machine »*, alors que `hip-thrust-barre.webp` et `leg-abduction-machine-v2.webp` étaient **déjà dans le dépôt**. ⭐ ***L'app proposait d'ajouter une photo qu'elle avait sous la main.***

**⭐⭐ ET LE MÉCANISME EXISTAIT DÉJÀ, POSÉ D'UN SEUL CÔTÉ — 3ᵉ fois après ft-v973 et ft-v975 (R8/R13).** `_matchExercise` porte depuis le **09/08** une étape *« exact sans la parenthèse »*, écrite pour **exactement** ce cas (Michel, déjà, sur un vrai programme de Milo). Elle ne servait qu'à l'**import** ; l'affichage ne l'a jamais eue. *Une correction faite d'un côté et pas de l'autre est un oubli, pas un arbitrage.*

**⛔ UN SEUL PROPRIÉTAIRE (R2)** : `exNomCatalogue()` dans `constants.js`, à côté de `exNomActuel` — posé aux **6** lookups exacts de `log.js` (comptés avant de corriger, famille #3 de `BUGS.md`). ⛔ **Les lignes qui lisent ce que la personne a rangé sous SON nom restent exactes**, exprès : photo perso et `exPhotos` ne sont pas du catalogue.

**⛔ DÉTERMINISTE SEULEMENT — aucun rapprochement flou** (**R29**, le coût de l'erreur décide) : montrer l'animation d'un **autre** exercice est pire que n'en montrer aucune — la personne apprendrait un mouvement qu'elle n'a pas prescrit.

**⛔⛔ ET LE ZÉRO-COLLISION EST MESURÉ — c'est même la CONDITION de la table, pas un effet de bord.** Vérifié sur les **324** exercices : 77 parenthèses → **77 bases distinctes, 0 collision**, et aucune base qui soit déjà le nom complet d'un autre. Toute base ambiguë est **RETIRÉE** plutôt qu'arbitrée : si le catalogue grandit et crée une collision, l'abréviation **cesse d'être résolue** (retour à l'ancien comportement) — jamais elle ne pointe vers le mauvais exercice. *Le mode d'échec choisi est « je ne sais pas », jamais « voilà, tiens ».*

**⚠️⚠️ ET LA MÊME CAUSE A UN 2ᵉ EFFET, PLUS LARGE — NON CORRIGÉ ICI, ET LAISSÉ OUVERT EXPRÈS.** `_mscScores` appelle `exMuscles(ex.name)` en nom **exact** : un nom abrégé rate donc la **DONNÉE ÉCRITE** et retombe sur la **DEVINETTE**, alors que le bloc dit lui-même *« la donnée écrite passe avant les règles »*. **Mesuré : 55 des 77** abréviations donnent des muscles **différents**, et *« Inclinaison Lombaire »* n'en donne **aucun** (figurine entièrement grise). ⭐ **L'exemple qui coûte** : *« Rowing Poitrine Appuyée »* abrégé **recrédite le bas du dos**, alors que la fiche du 02/08 l'avait retiré **exprès** (poitrine appuyée = colonne non chargée). 👉 **Non livré parce que ça change la figurine, la couleur du calendrier et les calories de séances PASSÉES** — c'est un arbitrage de Michel (**R29** / règle d'or #10), pas un détail technique. **C'est R31** : la figurine est le vocabulaire, et l'imprécision se propage jusqu'au contexte de Milo.
Tests : **parcours 1362/1362** (+8, bloc CIX), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 4 rouges, et il est INSTRUCTIF** — le détail imprimé *est* la capture de Michel : **`reçu : null`** trois fois. ⭐ **Et 2 des verts sont de VRAIS verts** : le nom **complet** garde exactement la même image qu'avant (non-régression), et le contrôle de collisions tourne des **deux** côtés (il mesure `EXLIB`, pas le résolveur). ⚠️ **Les 2 autres sont de FAUX verts, autant l'écrire** : *« un exercice perso ne reçoit aucune image inventée »* et *« aucun nom du catalogue modifié »* passent tout seuls contre l'ancien code, où le résolveur n'existe pas. Fichiers : `constants.js`, `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v996. |

**ft-v995 — 🏃 LE CARDIO DE MILO VA DANS SON BLOC, PAS DANS LES EXERCICES** — Michel, **en salle**, capture à l'appui : *« il me rajoute le vélo elliptique alors qu'on a un onglet exprès pour le cardio »*.

**⭐⭐ SA RAISON DÉCIDE DE TOUT, et elle n'est pas esthétique** : *« si on fait une séance cardio toute seule, on veut qu'elle soit comptabilisée. Mais je ne veux pas que la course, le vélo elliptique ou peu importe arrive dans un exercice de musculation, **ça n'a strictement rien à voir**. »* Le cardio a sa place dans l'app — **dans SA fenêtre**, celle de ft-v720, qui distingue 🔥 avant et 🧊 après.

**⛔⛔ CE N'ÉTAIT PAS UN DÉFAUT DE JUGEMENT DE MILO — LES DEUX BOUTS DU CHEMIN MANQUAIENT** (vérifié dans le code, **R28**) : le prompt ne lui dit **nulle part** qu'un bloc cardio existe pour ce qu'il **propose** (il ne le **lit** que pour raconter le passé), et `_appliqueMiloSession` **ne regardait jamais** un champ cardio. *Milo n'avait aucun moyen de faire autrement.* Même forme que le pont blessure de **ft-v982**.

**⭐ R13 — RIEN N'EST RÉINVENTÉ** : `_exEquip()` range déjà elliptique, tapis, rameur, corde à sauter, air bike… dans un bac `'cardio'` depuis ft-v712. On lui demande, on ne redevine pas.

**⛔⛔ ET C'EST POSÉ DANS `_appliqueMiloSession`, LE SEUL POINT QUE LES DEUX PORTES TRAVERSENT** (leçon ft-v980). Une séance de Milo arrive soit par le **bloc JSON** (modèles capables), soit par le **repli de lecture du TEXTE** (modèles légers). *Corriger seulement le JSON n'aurait rien changé pour ELINE* — c'est le biais **R9** déjà vécu avec le bouton « Commencer cette séance », que Michel avait et sa fille **jamais**.

**⚠️ AVANT *ET* APRÈS** (précision de Michel le même soir : *« il peut y avoir une séance avec un cardio au tout début ET un cardio à la fin »*) : on tranche par **POSITION** — avant le 1ᵉʳ exercice de muscu → échauffement, après le dernier → cardio de fin. ⛔ **Au milieu, il reste un exercice** : on ne sait pas ce que la personne voulait, et deviner coûterait plus cher que ne rien faire (**R29**). ⛔ **Sans durée lisible, aucune durée n'est inventée.** ⛔ **Un cardio déjà noté par la personne n'est jamais écrasé.**

**⭐⭐ DEUX DÉFAUTS TROUVÉS PAR LA MESURE, invisibles à la relecture :**
**①** ma première pose écrivait le cardio **AVANT** que `S.wkt` soit reconstruit en mode « start » — l'elliptique sortait donc bien des exercices et **n'arrivait nulle part**. Mesuré : exercices `["Hip Thrust Barre"]` corrects, `cardioAvant` **`null`**. *C'est **R4** dans sa forme la plus bête : l'information était calculée et n'atteignait pas la donnée.*
**②** l'intensité tombait sur *« modéré »* alors que la note dit *« léger »* : `_naz()` désaccentue le **NOM**, pas la **NOTE**. ⭐ *Même famille que l'apostrophe courbe de ft-v994 — un caractère non normalisé rend un motif aveugle sans que rien ne le signale.* **Coût réel : 4,0 contre 6,0 MET, soit 50 % d'écart** sur les calories de ce cardio.
Tests : **parcours 1354/1354** (+16, bloc CIX), calculs 266/266, muscles 241/241, dates 7/7, données 102 classées 0 trou. ⭐ **Les 3 témoins qui comptent le plus sont des ABSENCES** : le cardio au milieu qui reste un exercice, la durée jamais inventée, et **la séance de muscu normale qui ne bouge pas d'un pouce**. 🗣️ **ET MILO EST MIS AU COURANT — la 2ᵉ moitié, demandée par Michel dans la foulée** : *« il faut que Milo soit au courant, il y a déjà une fenêtre où il y a le cardio avant et après, et ensuite il faut donner ce qu'il y a dans cette fenêtre »*. La consigne lui dit que le bloc existe, lui **interdit** de mettre le cardio dans les exercices, nomme **les deux moments**, et lui donne le **vocabulaire exact**. ⭐⭐ **Et ce vocabulaire n'est pas inventé — ce sont les 6 types et 3 intensités de `CARDIO_MET` (`app.js`)** : un témoin les épingle, donc ajouter un type au bloc sans le dire à Milo fait **rougir la livraison** (**R2**, la divergence interdite). ⭐ **La consigne RÉCLAME la durée**, et ce n'est pas décoratif : le correctif **refuse** de placer un cardio sans durée lisible (**R29**) — sans cette phrase, Milo produirait des cardios que l'app rejetterait **en silence**. *Les deux moitiés ne valent que posées ensemble* (leçon ft-v982). ⚠️ **+938 caractères, dans le bloc PERSONNEL** : mesuré, le **bloc commun ne bouge pas d'un caractère** (45 362 sain · 47 118 blessé) — **aucun effet sur le plafond** de 46 500, et le dépassement du profil blessé reste celui déjà documenté en ft-v988. Fichiers : `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`. sw.js ft-v995. |

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
