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
| **Mémoire** | `DOSSIER-ATHLETE-SUIVI.md` · `S.registre`/`S.adn`/`S.coachMemory` · `docs/VISION` (mémoire 3 niveaux) | Registre, ADN sportif, observations validées, mémoire durable, faits mesurés. Modèle : essentielle (gratuite) → intelligente (premium) → vivante (briques 7-8). |
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

> **Version actuelle : `ft-v1099`** (prochaine : `ft-v1100`). Historique complet (ft-v128→574 + gouvernance
> antérieure, **+ ft-v575→632 déménagées le 28/07**) → **`docs/JOURNAL-ARCHIVE.md`**. Le n° de cache se lit dans `sw.js` (`const CACHE='ft-vNN'`).
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

**ft-v1099 — 🚪 LA TROISIÈME PORTE VERS L'EFFACEMENT — ET LA SEULE QUI NE DEMANDAIT RIEN** — Michel : *« on continue sur les incohérences ? »*. Six familles **neuves**, choisies **hors nutrition** (session-A y travaille) : la suppression et ses résidus · les bornes des champs saisis à la main · les 19 badges · le cycle de force · une séance en cours + une autre action · la navigation. **Deux ont mordu.**

**⛔⛔ ① CHARGER UN PROGRAMME EFFAÇAIT UNE SÉANCE EN COURS, SANS UN MOT.** `loadProg` fait `S.wkt = {…}` — un remplacement, pas une fusion. **Mesuré par les vraies fonctions** : **3 séries FAITES** sur 2 exercices → **0**, et `ft4_wkt` **réécrit sur le disque**. *Le rechargement ne les ramène pas.* C'est la **règle d'or #3** — la priorité n°1 absolue du projet — prise en défaut par le geste le plus banal : se tromper de programme.

**⭐⭐ ET LE TÉMOIN DE COMPARAISON EST À QUINZE LIGNES, DANS LE MÊME FICHIER.** *« Annuler la séance »* et *« Vider la séance »* détruisent **exactement la même chose** et **demandent toutes les deux** confirmation. 👉 ***Trois portes vers le même effacement, deux gardées*** — c'est **R8** dans sa forme la plus pure. ⛔⛔ **Et le texte de « Vider » dit lui-même** : *« pratique si tu as chargé le mauvais programme »*. **L'app avait PRÉVU l'erreur sans empêcher sa version destructrice** : elle offrait la sortie de secours et laissait la porte du danger grande ouverte.

**⛔ ON NE DEMANDE QUE S'IL Y A QUELQUE CHOSE À PERDRE (R29/R24).** Une séance ouverte mais vierge — *ouvrir l'app à la salle et charger son programme*, le geste de tous les jours — ne pose **aucune** question. *Un garde-fou qui parle tout le temps finit par ne plus être lu.* ⭐ Et un seul propriétaire de *« y a-t-il du travail à perdre ? »* (`_travailAPerdre`, **R2**) : `loadProg` et `loadProgDay` sont deux portes du même geste, elles ne doivent pas diverger — la jumelle a été **cherchée** (**R8**), pas attendue.

**⛔⛔ ② LE PROFIL RESTAURÉ N'AVAIT AUCUNE BORNE, ALORS QUE LA SAISIE MANUELLE EN A DEPUIS TOUJOURS.** Le même jeu de valeurs joué par les deux chemins : **à la main → REFUSÉ**, le profil ne bouge pas ; **restauré → ACCEPTÉ** — âge **500**, taille **20 cm**, repos **999 999 s**. Conséquence chiffrée : **TDEE = −2 433 kcal**. *Un TDEE négatif n'est pas une grosse erreur, c'est une valeur qui n'a plus de sens* — et Milo reçoit **« 500 ans »** comme un fait sur la personne. 👉 C'est la famille **§35** de `BUGS.md` pour la **5ᵉ fois**, et toujours dans le même sens : ***le chemin AUTOMATIQUE est le moins protégé que son équivalent manuel***.

**⚠️⚠️ ET LE PLUS VICIEUX EST QUE ÇA NE SE VOIT PAS.** Le **plancher** de `calcMacros` ramène la cible affichée à **1 500 kcal**. *L'écran montre donc un chiffre parfaitement plausible au-dessus d'un calcul qui n'a plus aucun sens* — il n'y a rien à remarquer, jamais. ⭐ **Les bornes ne sont pas inventées** : ce sont **exactement** celles que l'app affiche déjà à qui saisit à la main, et elles vivent **à côté de `_poidsValide`** posée par session-A la veille (**R2** — un seul propriétaire, pas une 2ᵉ famille à dix lignes de la première).

**⛔ ③ LE BADGE DISAIT « 5 PRs BATTUS » ; LE CODE COMPTE AUTRE CHOSE.** `prCount = Object.keys(S.prs).length` = le nombre d'**exercices ayant un record**, pas le nombre de records **battus**. Mesuré : **une seule séance** avec 5 exercices différents, **zéro** record amélioré → le badge tombe quand même. ⭐⭐ **On corrige le TEXTE, pas le code, et c'est un arbitrage (R29)** : durcir la condition **retirerait** le badge à tous ceux qui l'ont déjà. *Reprendre une récompense obtenue coûte plus cher qu'un libellé imprécis* — et le code, lui, mesure quelque chose de vrai et d'utile : la **variété travaillée**. On lui donne son vrai nom.

**⏭️ ET QUATRE FAMILLES ONT RENDU DU VIDE — écrit pour que personne ne refasse la chasse (R23).** La **navigation** : les 7 écrans sont atteignables, et un écran qui n'existe pas ne casse rien (0 erreur JS). Les **badges sur un compte vide** : **0 débloqué à tort**. Une **séance en cours survit intacte à une restauration** de compte. ⚠️ Le **cycle de force** n'a **pas** pu être mesuré proprement — voir ci-dessous.

**⚠️⚠️ ET QUATRE DE MES SONDES SE SONT TROMPÉES DE NOM, AVEC LE MÊME SIGNE À CHAQUE FOIS.** `exercises` pris pour `rm1s` · `S.wkt.start` pour `S.wkt.exs` · le drapeau `active` oublié · et un témoin visant `_COACH_HELP` quand le conteneur s'appelle **`_DRAWER_CONTENT`**. ⭐ **Ce dernier est le seul des quatre qui se VOIT** : il lève une `ReferenceError`. *Les trois autres rendent une valeur — et une valeur fausse ressemble à un défaut du code.* 👉 ***Les trois se reconnaissent au même signe : un résultat IDENTIQUE dans tous les cas*** — une `TypeError` qui tombe aussi sur le cas *normal* n'accuse pas le code, elle accuse la fixture. *C'est le réflexe que session-A a écrit après ses 4 faux positifs de la 4ᵉ passe, et il a servi trois fois en une heure.* ⛔ **Conséquence assumée** : je n'annonce **rien** sur le cycle de force — *une sonde qui ne mord pas ne prouve pas qu'il n'y a rien, elle prouve qu'elle n'a pas mesuré*.

**⏭️ ET UNE FAMILLE RESTE OUVERTE, MESURÉE MAIS PAS CORRIGÉE (R23/R30).** **Un record survit à la suppression de la séance qui l'a fait** : mesuré par le vrai chemin — la séance passe de 2 à 1, le record de 112,5 kg reste, et il **atteint le contexte de Milo**. ⛔ **Je ne le corrige pas à la légère, et la raison est écrite dans le code de ft-v1085** : *une BAISSE de record suppose que la séance qui l'a fait est encore dans l'historique* — recalculer automatiquement **détruirait** un vrai record venu d'un import ou d'un autre appareil. La bonne forme est de **dire** à la personne que la séance porte un record et de la laisser trancher (**R29**), pas de réécrire ses faits dans son dos. *C'est une décision produit, pas un correctif — donc elle attend Michel plutôt que d'être bâclée.*

**📣 RÈGLE D'OR #11 — L'AIDE, MAIS NI POP-UP NI POINT ROUGE, et ça s'argumente.** Une **question neuve** apparaît dans un geste familier, donc l'aide `?` de l'onglet Séance et l'**aide détaillée** la nomment — cette dernière porte ce que l'aide courte ne dit pas : la différence entre les **trois** façons de vider une séance, qui se ressemblent et ne font pas la même chose. ⛔ **Mais rien n'est à découvrir ni à faire** : c'est une porte qu'on ferme (**R25**). ⚠️ Et l'annoncer reviendrait à dire *« vos séances pouvaient disparaître »* — **une alarme rétroactive pour un trou qu'on vient de combler**, exactement le bruit que la règle #11 cherche à éviter. Les ② et ③ sont des réparations invisibles.

Tests : **parcours 2328/2328** (+18, bloc **CCV**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **CONTRÔLE NÉGATIF joué contre l'ancien code : 8 rouges** — la question n'apparaît pas · la mémoire tombe à **0 série faite** · le **disque** est réécrit · la jumelle « à jours » ne demande rien · le profil restauré garde **500 / 20 / 999 999** · **TDEE −2 433** · Milo reçoit « 500 ans » · le badge dit « 5 PRs battus ». ⛔⛔ **Et les 6 verts de ce contrôle sont exactement ceux qui DEVAIENT rester verts** : les deux témoins de mise en place, le témoin de comparaison manuel, le profil valide, et la non-régression. *Un contrôle négatif où tout rougit ne prouve rien non plus — il prouve qu'on a cassé la fonction.* ⭐ **Trois témoins n'existent que pour empêcher les autres d'être verts sur du vide** : le cas sans travail ne doit poser **aucune** question, le témoin doit avoir **3 séries faites** à perdre, et un profil **valide** (42 ans, 181 cm, 150 s) doit toujours passer. Fichiers : `log.js`, `state.js`, `setup.js`, `app.js`, `screens.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `BUGS.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1099. |

**ft-v1098 — 🔭 LA CIBLE DU JOUR N'EST PAS LA CIBLE DE TOUS LES JOURS** — Michel : *« continue sur la nutrition stp »*. Suite de l'analyse GPT du matin, **et elle commence par me corriger moi-même.**

**⚠️⚠️ MON PROPRE DOCUMENT ÉTAIT FAUX, ET C'EST LA PREMIÈRE CHOSE QUE J'AI VÉRIFIÉE.** `docs/NUTRITION-ANALYSE-GPT.md` écrivait *« Lipides 56 g — plancher, ≈ 0,67 g/kg »*. **Faux des deux côtés** : les lipides sont une **CIBLE** (`bw × 0,9` = **76 g** à 84 kg, mesuré `0,905 g/kg`), **56 g** est la valeur **d'un jour de séance** après cyclage, et le vrai plancher vaut **50,4 g** — il ne sert qu'à borner l'amplitude, il n'est jamais affiché. 👉 ***La décision ④ que j'avais posée à Michel (« faut-il afficher le plancher lipidique autrement ? ») reposait donc sur MON erreur*** : elle est **retirée**, avec l'encadré daté dans le doc. *Un document d'analyse qu'on ne vérifie pas fait prendre des décisions sur du vent* (**R23**).

**⛔⛔ ① LA FRÉQUENCE ÉTAIT DIVISÉE PAR DES SEMAINES QUI N'EXISTAIENT PAS.** `cycleGlucides` faisait `f = round(somme / wk.length)` avec `wk.length` = **4, toujours** — y compris pour quelqu'un qui a l'app depuis quinze jours. **Mesuré** : 2 semaines à 3 séances/sem se lisaient **2** ; 1 semaine à 4 séances/sem se lisait **1**.

**⚠️⚠️ ET L'EFFET EST À L'ENVERS DE CE QU'IL FAUDRAIT** : l'amplitude du cyclage vaut `(7−f)/7`, donc **plus `f` est petit, plus l'écart imposé est GRAND**. 👉 ***Le pratiquant le plus récent, celui dont on sait le moins, recevait le cyclage le plus agressif*** — **52 g** de lipides un jour de séance, pour un plancher à 50,4. ⭐ Son voisin immédiat, `_pendingFreqContext`, **se protégeait déjà** (`<3 semaines non vides → null`) : le même piège, deux lecteurs, un seul gardé — **R8**, encore.

**⛔ LE PIÈGE DU CORRECTIF, ET IL EST INSTRUCTIF** : « diviser par les semaines **non vides** » est tentant et **faux** — une semaine **sautée** fait partie de la fréquence de quelqu'un. Le bon dénominateur est **l'étendue de l'historique**, pas son remplissage (mesuré : `[3,2,0,3]` doit rendre **2**, et il le rend). ⛔ Et **on ne moyenne pas sur moins d'une semaine complète** : sous 7 jours, on rend « je ne sais pas » et le cyclage reste éteint — *exactement le comportement d'avant, donc zéro régression.*

**⚠️⚠️ ET UN TÉMOIN EXISTANT M'A ATTRAPÉ SUR L'ARRONDI — c'est lui qui a rendu le correctif juste.** J'avais écrit `round(span/7)`. Or le numérateur vient de **casiers** de 7 jours : une séance vieille de 23 jours est dans le casier n° 3, donc **quatre** casiers sont en jeu, quand `round(23/7)` n'en comptait que 3. La neutralité hebdomadaire est partie à **−67 g** à 2 séances/semaine. 👉 ***Un dénominateur qui n'arrondit pas comme le découpage qu'il divise fabrique une fréquence trop haute.*** `ceil`, et un témoin fige la raison pour qu'on ne « simplifie » pas ça un jour.

**⛔⛔ ② LE SECOND DÉFAUT EST D'AFFICHAGE, ET C'EST ft-v1027 AILLEURS.** Le moteur prescrit à la **même** personne **368 à 478 g** de glucides et **56 à 82 g** de lipides selon le jour — **26 %** et **38 %** d'amplitude, mesurés. L'écran n'en montrait **qu'un**, sans dire lequel. *Deux valeurs justes, une seule affichée, et rien qui nomme la fenêtre.* Quelqu'un qui mange pareil tous les jours se voyait « en dessous » un jour et « au-dessus » le lendemain.

**⭐⭐ ET LA « ZONE » QUE GPT RÉCLAMAIT N'A AUCUN POURCENTAGE À INVENTER — ELLE ÉTAIT DÉJÀ CALCULÉE.** Je cherchais un ±5 % ou ±10 % à faire trancher par Michel ; **la zone, ce sont les deux bouts de sa propre semaine**. 👉 *La question était mal posée : il n'y avait pas une largeur à choisir, il y avait un calcul à regarder.* La **décision ①** est donc tranchée par la mesure, pas par un arbitrage.

**⛔ ET LES PROTÉINES N'EN ONT PAS : amplitude 0 g.** Le moteur les fixe au poids de corps, elles ne bougent jamais. *On n'invente pas une zone à une macro qui n'en a pas* (**R29**) — donc GPT avait raison pour les glucides et les lipides, et tort pour les protéines. **La mesure a tranché les deux dans le même geste.**

**⛔ OÙ ÇA S'AFFICHE, ET POURQUOI PAS AILLEURS (R25)** : la **carte du jour** *nomme* la fenêtre (« 🍚 Jour de séance » / « 😴 Jour de repos ») sans recopier **un seul chiffre** ; les **deux bouts** vivent dans « comment c'est calculé », la surface qui explique déjà. *Recopier les nombres aux deux endroits les ferait diverger* (**R2**) — et ils sont calculés par le **moteur**, jamais dérivés par l'écran. ⚠️ **Une limite est écrite plutôt que tue** : quand l'autre bout est un jour de séance, on ne sait pas **laquelle**, donc on prend la moyenne de ses séances récentes — l'écran dit *« estimé »*, il ne dit pas *« ta prochaine séance »*.

**⭐ ET UN DÉFAUT TROUVÉ À LA CAPTURE, que la mesure de données ne pouvait pas voir** : *« **1.5** × Amandes »* — un point décimal anglais, dans un écran qui écrit par ailleurs « 1 492 » et « ≈ 140 g », et dans une app dont les **boutons de quantité** disent `½ · 1 · 1½ · 2 · 3`. **Deux écritures pour la même quantité, c'est une de trop** (**R2**) : un seul propriétaire (`_portionLbl`), lu par les trois endroits.

**📣 RÈGLE D'OR #11 — les points 2 à 5, et PAS de pop-up.** Point rouge `zone-jour` sur l'onglet Nutrition · **deux** entrées d'aide `?` (pourquoi la cible change · pourquoi tes chiffres bougent si tu viens d'arriver) · aide détaillée · **30ᵉ diapo du Guide, sans image exprès** — une capture montrerait une cible chiffrée, donc des grammes qui ne sont pas ceux du lecteur, et la diapo se lirait comme une recommandation de macros (même raison qu'en ft-v1035). ⛔ **La pop-up ne se mérite pas** : rien à faire, **aucun repère ne bouge** (la carte garde son ordre, les trois anneaux et le bouton « noter » sont à la même place), et le seul chiffre qui change est celui de quelqu'un qui a moins de quatre semaines d'historique — de quelques grammes, vers le juste.
Tests : **parcours 2310/2310** (+19, bloc **CCV**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 12/12, données classées 0 trou. ⭐ **Le PREMIER témoin du bloc est un cas de contrôle** (4 semaines pleines à 3 séances/sem) : l'ancien et le nouveau calcul y tombent pareil — *sans lui, « tout change » et « je ne mesure rien » sont indistinguables* (leçon de ft-v1095). ⭐⭐ **Et la vraie preuve est une ÉGALITÉ** : à pratique égale, le nouveau venu reçoit désormais **exactement** la prescription de l'ancien (469/405 g de glucides, 60/88 g de lipides, au gramme près). **CONTRÔLE NÉGATIF : 2 rouges contre ft-v1097, et le détail imprimé EST le bug** — `f = 2` au lieu de 3, `f = 1` au lieu de 4, avec `52 g` de lipides ; et à l'écran, `1.5 × Amandes` et **aucune** ligne de bornes. ⭐ **4 témoins sont verts DES DEUX CÔTÉS** (4 semaines pleines · tout premier jour · assidu 5×/sem · semaine sautée) : ce sont les non-régressions, et ce sont elles qui empêchent le bloc d'être vert en disant simplement « tout a bougé ». ⭐ **Vérifié à l'écran** sur les deux jours (séance et repos), **0 erreur JS**, 🔴 **bouton central mesuré `[139, 792, 56, 44]` — identique des deux côtés**. ⏭️ **Ce que ça ne fait pas** : les décisions **②** (combien de jours avant un verdict) et **③** (l'app conclut-elle seule ou passe-t-elle la main à Milo) **restent ouvertes** — ce sont de vrais arbitrages produit, pas des questions que la mesure peut trancher. Fichiers : `state.js`, `tracking.js`, `screens.js`, `app.js`, `coach.js`, `constants.js`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/NUTRITION-ANALYSE-GPT.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1098. |

**ft-v1097 — 📤 DEUX EXPORTS DATÉS, ET UN DOUBLON QUE LE CORRECTIF DE LA VEILLE FABRIQUAIT** — Michel : *« il faudra aussi créer un export daté de la nutrition et aussi côté poids (nom de l'onglet à revoir peut-être aussi) »*, puis *« répare le dédoublement toi-même »*.

**📤 LES DEUX EXPORTS RÉUTILISENT LE PATRON EXISTANT, ILS N'EN ÉCRIVENT PAS UN SECOND (R13).** `exportHistoCsv` portait déjà tout : le séparateur `;` **et le BOM** (sans lui, Excel FR ouvre le `,` en **une seule colonne** et rend « Développé » en « DÃ©veloppÃ© »), la feuille de partage iOS (`_donnerFichier`), et le toast qui sait dire *« je ne sais pas »* quand le navigateur ne confirme rien. ⛔ **Un seul propriétaire de l'échappement** (`_csvEchappe`/`_csvFichier`, **R2**) au lieu de trois copies qui divergeront.

**⛔ LA NUTRITION EXPORTE AUSSI `saisie` ET `source`, et ce n'est pas décoratif** : sans la provenance, on ne sait plus si une valeur a été **scannée** au code-barres, **tapée** à la main ou **estimée** par l'IA — c'est **R33** (ce qui est normalisé garde d'où il vient). ⚠️ **Et le poids lit `kg`, PAS `bw`** : la doc du projet a écrit `bw` pendant des mois alors que l'app écrit `kg` partout — *une fixture de test écrite d'après cette ligne rendait `value="undefined"`*, corrigé le 30/08. **Les boutons sont posés à côté de ce qu'ils exportent**, pas dans un menu « Exporter » : le journal alimentaire pour l'un, les pesées pour l'autre.

**⛔⛔ LE DOUBLON EST LE POINT DUR, ET IL VENAIT D'UN CORRECTIF DE LA VEILLE.** La fusion multi-onglets de **ft-v1094** (session-A) signait une séance `date | nb exercices | volume` pour départager deux onglets ouverts — or ***corriger une charge change le volume***. La version corrigée et celle du disque avaient donc **deux signatures différentes**, et l'union **gardait les deux**. 👉 *Le correctif qui répare une perte de séance en fabriquait un doublon* — celui-là même que **ft-v1083** venait de nettoyer dans le classeur, déclenché par le geste le plus banal qui soit : rouvrir une séance passée et rectifier un poids. C'est la famille **§30** (`BUGS.md`) sous une forme neuve : *ce qu'un correctif ENLÈVE, ici la stabilité de la signature*.

**⭐⭐ LE PROPRIÉTAIRE EXISTAIT DÉJÀ, À TROIS ENDROITS (R2).** `openSessDetail`, la suppression et la mise à jour identifient toutes une séance par **`s.ts || s.id`**. La signature en avait inventé un **second**, et c'est le second qui se trompait. *On ne choisit pas entre deux identités : on constate qu'il y en avait déjà une.*

**⚠️⚠️ ET MON PROPRE CORRECTIF PORTAIT UN RISQUE SYMÉTRIQUE, MESURÉ AVANT D'ÊTRE ÉCRIT.** Il faut un repli pour les séances anciennes, sans `ts` ni `id`. Ma première idée — `date | nb exercices` — a été jouée : **deux VRAIES séances du même jour fusionnaient en UNE**. *On aurait échangé un doublon contre une **perte**, ce qui est le mauvais sens* (**R29** : une erreur qui efface coûte plus cher qu'une erreur qui duplique). ⭐ D'où le **nom du 1ᵉʳ exercice** dans le repli : il **ne change pas** quand on corrige un poids, contrairement au volume — c'est exactement la propriété qui manquait.

**🧭 ET L'ONGLET « Poids » DEVIENT « Corps & santé »** (nom choisi par Michel) : il porte aussi les **corrélations**, le **bilan corporel** et le **bilan sanguin** — son ancien nom sous-vendait ce qu'il contient. **Mesuré à 3 largeurs** : identique à 390 et 375 px, **+18 px de haut à 320 px** (le libellé passe sur deux lignes, rien ne déborde, aucun autre onglet ne bouge).

**⚠️ ET MA PREMIÈRE SONDE MESURAIT `0` PARTOUT EN ANNONÇANT « ne déborde pas ».** `goScreen` **préfixe lui-même** par `s-` : l'appeler avec `'s-progress'` ne fait **rien**, en silence. Les mesures portaient donc sur un écran jamais affiché. *C'est le faux positif que session-A a nommé le matin même — retrouvé chez moi trois heures plus tard.* La sonde **vérifie désormais que l'écran est actif** avant de mesurer : sinon c'est un vert qui ne mesure rien.

**⛔⛔ ET RENOMMER UN ONGLET EST LE GESTE QUI PÉRIME LE PLUS DE TEXTES D'UN COUP — 9 phrases disaient « Progrès → Poids ».** L'aide `?`, l'**aide détaillée** (5 entrées), une **carte de nouveauté**, une **diapo du Guide**, et jusqu'au **contexte envoyé à Milo**. 👉 *Un texte qui envoie chercher un onglet qui n'existe plus est pire qu'un texte absent : il fait douter la personne d'elle-même.* C'est la famille des **textes qui annoncent ce que le code n'applique plus** (ft-v1086, ft-v1093), déclenchée cette fois par un **renommage** et non par un changement de calcul. ⚠️ **Et le `&` n'est pas un détail** : les aides sont posées en `innerHTML` (donc `&amp;`), le contexte de Milo est du **texte brut** (donc `&` en clair) — *le même nom, deux écritures, et se tromper affiche « Corps &amp;amp; santé » à l'écran*. Un témoin épingle les deux — **et il a trouvé un 10ᵉ texte que `grep` ne voyait pas**, écrit en séquences d'échappement (`Progr\u00e8s \u2192 Poids`) : *un détecteur qui lit le SOURCE et un témoin qui lit ce que l'app rend vraiment ne mesurent pas la même chose*. ⭐ **Et la nuance est nommée (R30)** : on ne réécrit **jamais** une pop-up `WHATS_NEW` datée — ce serait falsifier ce qui a été annoncé ce jour-là — mais une **carte de nouveauté** est un panneau indicateur permanent : la laisser pointer vers un onglet disparu enverrait chercher au mauvais endroit.

**📣 RÈGLE D'OR #11 — POINT ROUGE + AIDE, mais PAS de pop-up.** Les exports sont **deux boutons neufs** : il y a quelque chose à découvrir, donc un point rouge et l'aide de l'onglet le disent. ⛔ **Mais rien n'oblige à agir et aucun repère n'a bougé** — la pop-up `WHATS_NEW` se mérite, et elle n'est pas méritée ici (**R25** : la pop-up annonce, l'aide explique). ⚠️ Le doublon, lui, est une **réparation** : l'annoncer reviendrait à dire *« le correctif d'hier dédoublait vos séances »*, ce que le journal dit et qui n'a pas à interrompre.

Tests : **parcours 2291/2291** (+18, bloc **CCIV**) ⚠️ *mesuré sur l'arbre **FUSIONNÉ** avec les ft-v1095 ET ft-v1096 de session-A*, calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **SIX CAS pour le doublon, et trois d'entre eux n'existent que pour empêcher les autres d'être verts sur du vide** : correction **avec** `id` → **1** · correction **sans** `id` → **1** · deux vraies séances aux `id` différents → **2** · deux séances sans `id` et 1ᵉʳ exercice différent → **2** (c'est celui qui interdit la perte) · **témoin de contrôle sans édition** → **1** · correction sans `id` et même exercice → **1**. ⛔ **CONTRÔLE NÉGATIF** : avec la signature de ft-v1094, la correction d'une charge rend **2 séances** de volumes `[1100, 1000]`. ⚠️ **20ᵉ collision** : session-A a publié **ft-v1094, ft-v1095 puis ft-v1096** pendant ce travail, et leurs blocs **CCII** et **CCIII** étaient déjà sur `master` — ma version devient **ft-v1097** et mon bloc **CCIV** ; *un numéro de cache ne recule jamais, et on ne renumérote pas le travail de l'autre*. Fichiers : `setup.js`, `state.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1097. |

**ft-v1096 — ⚖️ LE POIDS LU PAR L'IA A LES MÊMES BORNES QUE LE POIDS SAISI À LA MAIN** — Michel : *« continue avec les autres imports mais regarde ce que j'ai vu avec gpt »*. **Deux chantiers distincts** : la suite des imports (ci-dessous) et l'analyse du document nutrition de GPT, **qui ne touche aucune ligne de code** (il demande explicitement de ne rien implémenter) — elle vit dans `docs/NUTRITION-ANALYSE-GPT.md`.

**⛔⛔ CE QUI PASSAIT, MESURÉ PAR LE VRAI CHEMIN** (la lecture IA remplit le formulaire, puis on Enregistre) : un rapport de balance mal lu à **3 000 kg** entrait dans `S.bodyScans`, **dans le journal de poids** et **dans le profil**. Conséquence chiffrée : **TDEE 47 900 kcal**, et tous les objectifs de nutrition faux ensuite. Un **% de gras à 300 %** entrait pareil.

**⭐⭐ ET LE TÉMOIN DE COMPARAISON EST CE QUI REND LE DÉFAUT LISIBLE : la saisie MANUELLE du même chiffre était refusée depuis toujours.** `saveWeightEntry` borne à **20–300 kg** et le dit. 👉 ***Deux portes vers la même donnée, une seule fermée*** — c'est **R8** pour la **4ᵉ fois cette semaine**, et le motif est constant : **le chemin AUTOMATIQUE est toujours le moins protégé que son équivalent manuel** (ft-v1086 le sexe, ft-v1089 un élément d'écran, ft-v1095 charge et reps, celui-ci le poids). *Le manuel a une personne devant lui qui voit ce qu'elle tape ; l'automatique n'a personne.* Nouvelle famille **§35** de `BUGS.md`, avec les quatre cas en table — pour qu'on cherche la porte automatique **avant** qu'un cinquième cas ne se présente.

**⛔ UN SEUL PROPRIÉTAIRE DES BORNES (R2)** : `_poidsValide` et `_pctGrasValide` vivent dans `state.js`, à côté de `_serieValide` posée hier. *Répliquer « 20–300 » dans `tracking.js` aurait fait diverger les deux le jour où quelqu'un touche l'une des deux.*

**⛔ ON ÉCARTE LA VALEUR, PAS LE BILAN — sauf pour le poids, et la différence est argumentée.** Un **% de gras** hors 3–70 est mis de côté : les **11 autres** mesures du rapport restent, et le refus est nommé dans le message de fin. Un **poids** aberrant, lui, refuse l'enregistrement entier — *il ne salit pas une ligne, il contamine le profil, le journal de poids, le TDEE et toute la nutrition.* La granularité suit le coût de l'erreur (**R29**).

**⭐ ET LE REFUS DIT OÙ REGARDER**, parce qu'un message générique n'aide personne : *« la lecture de la photo s'est trompée — corrige avant d'enregistrer »* quand ça vient de l'IA, *« corrige la valeur »* quand c'est saisi à la main. Même borne, deux causes, deux phrases.

**⏭️ CE QUI N'EST PAS COUVERT, DIT PLUTÔT QUE SOUS-ENTENDU** : l'import de **PROGRAMME** et le **CODE-BARRES** n'ont **pas** été passés au banc. Le **bilan sanguin** non plus. *La famille n'est pas fermée* — trois portes restent à instruire, et le dire évite qu'on la croie close (**R23**).

**⚠️⚠️ ET MA SONDE A INVENTÉ UN NOM DE CHAMP TROIS FOIS DANS LA MÊME PASSE** — `ft4_weight` pour `ft4_wlog`, `fatPct` pour `bf`, `p/c/f` pour `prot/carbs/fat`. **Chacun rend ZÉRO**, et *zéro ressemble exactement à une perte de données* : j'ai failli annoncer trois bugs qui n'existent pas. 👉 ***Une sonde qui invente un nom de champ mesure toujours zéro, et zéro est le résultat le plus crédible qui soit.*** Le réflexe qui coûte trois secondes : lire la clé dans le code **avant** d'écrire la sonde. Nouvelle famille **§36** de `BUGS.md`.

**⚠️ ET UN DE MES TÉMOINS A ROUGI SUR DU CODE SAIN — 6ᵉ fois pour la famille §31.** Je l'avais épinglé sur `bw===84`, la valeur de **ma sonde d'atelier**, alors que le harnais du runner amorce le profil à **80 kg**. *Un témoin qui fige une valeur venue d'une autre fixture ne mesure pas la règle, il mesure ma fixture.* Re-visé sur la règle — le poids aberrant n'entre nulle part **et celui du profil n'a pas bougé, quel qu'il soit** — avec un second témoin qui compare au poids **capturé avant** l'import.

**🍽️ LE SECOND CHANTIER, ZÉRO CODE : `docs/NUTRITION-ANALYSE-GPT.md`.** Le document de GPT est traité comme un **audit**, donc **mesuré avant d'être accepté** — les passes précédentes ont montré que **2 constats d'audit sur 4** étaient faux ou périmés. ⭐⭐ **Et c'est encore le cas** : son **§3** (*« les calories d'entraînement sont-elles ajoutées à l'objectif ? »*) décrit un défaut **corrigé en ft-v949** — et le défaut réel était l'**inverse** de ce qu'il décrit (la séance était comptée **deux fois**). Ses **§4** et **§10** décrivent un écran **antérieur au rangement de ft-v1025**. ⛔ **En revanche ses §1, §2 et §9 sont FONDÉS, et je l'ai vérifié en mesurant** — ⚠️ ma **première** mesure était trompeuse : faite **sans aliment noté**, elle ne montrait aucune ligne « restantes », et j'ai failli lui répondre qu'il décrivait un écran disparu. *Re-mesuré avec des aliments : les deux lignes sont bien là.* Le doc porte la chaîne de calcul chiffrée (BMR 1743 → TDEE 2702 → objectif 3152), la table du cycle glucidique, les réponses aux 7 questions, et **4 décisions laissées à Michel** — largeur de la zone, seuil de tendance, droit de conclure, plancher lipidique. **Aucune implémentation avant validation.**

**📣 RÈGLE D'OR #11 — RIEN, ET C'EST ARGUMENTÉ.** Le correctif est **invisible pour qui importe un rapport correct** : rien à faire, aucun repère déplacé, aucune nouveauté à découvrir. Une pop-up dirait *« on a ajouté une borne »* — du bruit (**R19/R25**). *La pop-up se mérite ;* celle-ci ne se mérite pas.
Tests : **parcours 2256/2256** (+9, bloc **CCIII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 12/12, données classées 0 trou. ⭐⭐ **Le témoin qui porte la version est celui de COMPARAISON** : il vérifie que la saisie **manuelle** refuse bien 3 000 kg — *sans lui, on répliquerait une borne qu'on croit exister*. ⭐ **Et le cas VALIDE est le PREMIER du banc** (leçon de ft-v1095) : un rapport plausible passe entier, 12 valeurs, poids au journal. *Sans lui, « l'app refuse tout » et « je ne mesure rien » sont indistinguables.* **CONTRÔLE NÉGATIF : rouge, et le détail imprimé EST le bug** — contre ft-v1095, `{"bilans":1,"poids":[3000],"bw":3000,"tdee":47900}`. Fichiers : `state.js`, `tracking.js`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/NUTRITION-ANALYSE-GPT.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1096. |

**ft-v1095 — 📥 CE QU'UN MODÈLE HALLUCINE N'ENTRE PLUS DANS L'HISTORIQUE** — Michel : *« vas-y attaque les imports »*. **Dernière famille non instruite** des quatre passes précédentes.

**⛔⛔ LA QUESTION QUI DÉCIDE** (**R33**) : quand un document est partiel, illisible ou aberrant, l'app **échoue-t-elle proprement** — ou **fabrique-t-elle une donnée** ? Mesuré en rendant à l'app, **par ses vraies fonctions**, ce qu'un modèle peut lui renvoyer (seul `fetch` est remplacé). ⭐ *Le piège n'est pas qu'il se trompe : c'est que ce qu'il invente est **plausible**. Une charge de 500 kg ressemble à une charge, une date de 1900 ressemble à une date. Rien ne plante, rien n'alerte, et la valeur s'installe.*

**⛔ CE QUI PASSAIT, MESURÉ** : `500 kg × 50 reps` → un record de **1 060 kg de 1RM**, accepté et annoncé *« importée ✅ »* · une charge **négative** → un record de **−90 kg** · les dates `1900-01-01`, `2099-01-01` et même la chaîne **« le mardi »** → entrées telles quelles · et un `exercises` rendu comme une **chaîne** faisait **planter** l'import, avec la trace technique affichée à la personne.

**⛔⛔ ET UN FAUX RECORD COÛTE PLUS CHER QU'IL N'EN A L'AIR** : vers le **haut**, il ne sera **jamais battu** — donc il est **éternel**. Et il ne dort pas : il sert de **référence aux charges que Milo propose**. *Une seule ligne mal lue déforme les prescriptions pendant des mois* (famille du faux record de ft-v1085).

**⭐⭐ LE CAS `500 × 50` EST CELUI QUI APPREND QUELQUE CHOSE.** Chaque valeur franchissait les bornes qui existaient déjà dans `coach.js` (500 ≤ 500, 50 ≤ 100). **C'est la COMBINAISON qui est impossible** : `bz()` plafonne les répétitions à **20**, donc *toute* charge × 20 vaut **2,1 fois elle-même**. 👉 ***Borner les entrées ne suffit pas — il faut borner ce qui SORT.*** Le 1RM produit est désormais plafonné à 600 kg : au-dessus de toute barre humaine, en gardant de la marge pour une presse à cuisses (240 × 20 = 509 passe encore).

**⛔ ET LES BORNES ONT MAINTENANT UN SEUL PROPRIÉTAIRE** (`_serieValide`, **R2**) — partagé avec `coach.js`, **qui les avait déjà**. *Le même garde-fou sur un chemin et pas sur l'autre, c'est **R8**, et c'est la 3ᵉ fois cette semaine.* Deux témoins figent la règle : les deux chemins l'emploient, et aucun ne réécrit les bornes en dur à côté.

**⛔ L'ARBITRAGE : ON ÉCARTE LA SÉRIE, PAS LA SÉANCE.** Une ligne mal lue ne doit pas faire perdre les neuf autres (**règle d'or #3**). Une **date** invalide, elle, écarte la séance — *l'aperçu ne permet pas de la corriger*, et une date fausse pollue durablement les graphes et le contexte de Milo. ⚠️ **La borne basse (1990) est assumée** : un import sert justement à récupérer un carnet **antérieur** à l'app, donc on ne refuse pas « vieux », on refuse « impossible ». ⭐ **Et on le DIT** — *« 1 série hors limites mise de côté »* — parce qu'un **rejet silencieux est indiscernable d'un import réussi** (**R29**).

**⭐ LA NORMALISATION SE FAIT À L'ENTRÉE, UNE FOIS.** Il y a **une dizaine** de lecteurs de `sess.exercises` en aval : *les rustiner un par un, c'est en oublier un.* Ce qui entre doit être de la bonne **forme**, et ça se décide au seul endroit où la réponse est lue. ⚠️ Au passage, un message devenu **vide** : depuis la normalisation, une réponse bien formée mais sans séance exploitable ne lève plus d'exception, et le toast se terminait sur *« Erreur analyse : »* suivi de rien — *un message tronqué se lit comme un bug de l'app alors que le problème est la page*.

**⚠️⚠️ ET MA SONDE A MENTI DEUX FOIS AVANT DE MESURER QUOI QUE CE SOIT.** ① elle appelait `_histAnalyzeBatch`, qui ne fait que **rendre** le tableau, au lieu de `analyzeHistPhotos`, qui **remplit** l'état — elle lisait donc un état jamais écrit ; ② et elle n'avait **aucun cas valide**. Les quatorze réponses hostiles rendaient **le même résultat**, et j'aurais pu conclure « l'app refuse tout, c'est parfait ». 👉 ***Le témoin de contrôle doit être le PREMIER cas d'un banc de réponses hostiles, pas le dernier*** — sans lui, « tout est refusé » et « je ne mesure rien » sont indistinguables. C'est la même signature que les quatre faux positifs de ft-v1094 : **un résultat identique partout**. Nouvelle famille **§34** de `BUGS.md`.

**⚠️ ET UN DE MES TÉMOINS A ROUGI SUR DU CODE PARFAITEMENT SAIN — 5ᵉ fois pour cette famille (§31).** Je l'avais visé sur une **forme** — la chaîne `reps<=100` — au lieu de sa **garantie**. Or `coach.js` porte deux bornes `nb>=1&&nb<=12 || reps>=1&&reps<=100` qui encadrent une **prescription** (« 3×8 » : un nombre de séries et de répétitions), pas une série **exécutée avec une charge**. *Rien à voir, et rien à corriger.* La règle vraie est : **personne ne réécrit la borne de CHARGE d'une série faite** — et un second témoin vérifie maintenant que le premier ne se trompe pas de cible.

**⏭️ CE QUE ÇA NE COUVRE PAS, dit plutôt que sous-entendu** : seul l'import d'**historique** a été instruit à fond. Le programme, le bilan sanguin, le bilan corporel et le code-barres partagent la même mécanique (une réponse de modèle consommée telle quelle) mais n'ont **pas** été passés au banc — c'est la suite, pas une conclusion.

**📣 RÈGLE D'OR #11 — ni pop-up ni point rouge.** Rien n'apparaît, rien ne bouge. Le seul changement visible est un import qui **dit ce qu'il a mis de côté** — et il ne se voit que si quelque chose l'a été. *Annoncer « vos imports pouvaient inventer des records » alarmerait rétroactivement pour un défaut qu'on vient de fermer.*
Tests : **parcours 2245/2245** (+15, bloc **CCII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou, noyau Milo 12/12. ⭐⭐ **Contrôles négatifs mesurés avant correctif**, cas par cas : record **1 060 kg → aucun** · record **−90 kg → aucun** · dates 1900 / 2099 / « le mardi » **acceptées → refusées avec la raison** · `exercises` en chaîne **plantait → refusé proprement**. ⛔ **Et le premier témoin du bloc est le contrôle** : une réponse **valide** reste acceptée avec son record (113 kg) — sans lui, tout le bloc serait vert en refusant tout. Fichiers : `state.js`, `log.js`, `coach.js`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1095. |

**ft-v1094 — 🪟 DEUX ONGLETS OUVERTS, ET LE DERNIER QUI ÉCRIT EFFACE L'AUTRE** — Michel : *« on continue avec les incohérences ? »*. 4ᵉ passe, **six familles neuves** (celles des passes 1-3 sont vidées et leurs vides sont écrits). **Une seule a mordu — et elle touche la règle d'or #3.**

**⛔⛔ LE DÉFAUT.** `persist()` écrit **tout `S`** d'un coup, depuis la mémoire de l'onglet qui l'appelle. Or l'app est une **PWA** : elle est très souvent ouverte à **deux endroits** — l'icône de l'écran d'accueil **et** un onglet du navigateur — qui partagent le **même** stockage. Mesuré par les vraies fonctions, dans deux pages du même contexte : l'onglet **B** termine une séance (**1 séance + 1 record** sur le disque), l'onglet **A** règle son **temps de repos** — *le geste le plus banal qui soit* — et il reste **0 séance, 0 record**. ***Le rechargement ne les ramène pas.*** Même chose pour une pesée notée dans un onglet, effacée par la série validée dans l'autre.

**⚠️ ET RIEN NE PROTÉGEAIT** : aucun écouteur `storage`, aucun `BroadcastChannel` — vérifié, **zéro occurrence** dans tout le dépôt. Le symptôme est **silencieux et différé** : rien ne plante, la donnée est simplement absente la fois d'après, et on croit ne l'avoir jamais saisie. Nouvelle famille **§33** de `BUGS.md`.

**👉 LE CORRECTIF S'APPUIE SUR CE QUE LE NAVIGATEUR DIT DÉJÀ** : l'événement `storage` ne se déclenche **que dans les autres onglets** — c'est exactement le signal qu'il faut, sans sondage. Quand il a été reçu, le `persist()` suivant prend l'**union** des collections datées au lieu de remplacer. Les records se départagent par **date**, sinon un onglet resté ouvert écraserait par son ancienne valeur un record battu ailleurs — *c'est-à-dire la perte qu'on répare*.

**⛔⛔ ET LA PROPRIÉTÉ QUI REND CE CORRECTIF SÛR EST CELLE-CI : LE CAS NORMAL NE CHANGE PAS D'UN CARACTÈRE.** Un seul onglet → le drapeau reste faux → **aucune fusion**. *On ne touche pas à la fonction la plus critique de l'app pour 99,9 % des ouvertures afin d'en réparer une.* Deux témoins l'épinglent, dont celui qui vérifie qu'une **suppression volontaire** reste possible (2 → 1) — sinon on aurait échangé un bug contre un autre. ⚠️ **Limite écrite** : supprimer une entrée pendant qu'un autre onglet écrit peut la faire revenir. *On échange une suppression rare et refaisable contre une séance perdue pour toujours* (**R29**).

**⚠️ LES CINQ AUTRES FAMILLES ONT RENDU DU VIDE, ET C'EST ÉCRIT POUR NE PAS REFAIRE LA CHASSE.** **Hors ligne** : une séance terminée sans réseau est sur le disque, mise **en file**, et les 5 écrans rendent — 0 erreur JS. **Les 8 dates rares** (1ᵉʳ janvier, 31 décembre, 1ᵉʳ du mois, lundi, 29 février, changement d'heure, minuit) ne cassent rien : ni erreur, ni `NaN` à l'écran, récup/TDEE/contexte calculés. **Les « seuils écrits deux fois »** étaient **tous** des nombres égaux par hasard — *180 secondes contre 180 minutes, 120 kg contre 120 cm*. ⭐ *L'égalité numérique n'est presque jamais une parenté : ce détecteur-là a une précision quasi nulle, autant le savoir avant de le réécrire.* **Les imports** n'ont pas été instruits — dit plutôt que sous-entendu.

**⚠️⚠️ ET QUATRE FAUX POSITIFS VENAIENT DE MES PROPRES SONDES — c'est la leçon de méthode de la passe.** ① une **clé inventée** (`ft4_weight` au lieu de `ft4_wlog`) : elle rendait **toujours zéro**, *et zéro ressemble à une perte* ; ② `goScreen('s-home')` alors que la fonction **préfixe elle-même** — les 6 écrans mesuraient 0 **des deux côtés** ; ③ un détecteur qui **supprimait les commentaires** avant de mesurer, donc **décalait tous les numéros de ligne** et désignait des emplacements qui n'existent pas — il a annoncé un doublon que la vraie ligne dément ; ④ un témoin « en ligne » qui n'en était pas un : le vrai serveur répond **403** ici, donc `synced` était faux **des deux côtés**. 👉 ***Trois de ces quatre se reconnaissent au même signe : un résultat IDENTIQUE dans les deux cas.*** C'est le réflexe déjà écrit en ft-v1086 — *si votre contrôle négatif donne la même chose des deux côtés, c'est votre sonde qui est cassée, pas le code* — et il vient de servir trois fois en une soirée.

**⚠️ ET UNE SUSPICION ABANDONNÉE AVANT D'ÊTRE DITE** : le contexte de Milo mesuré à **78 000 caractères** alors que le projet documente un plafond de **46 500**. Vérifié : le plafond porte sur le **bloc commun** (la part mise en cache), pas sur le contexte entier — **et il est déjà mesuré** par le bloc Q du runner (`< 46 500`). *Rien à signaler ; le garde-fou existait.*

**📣 RÈGLE D'OR #11 — ni pop-up ni point rouge.** C'est une réparation invisible : rien n'apparaît, rien ne bouge, il n'y a rien à apprendre. *Annoncer « vos séances pouvaient disparaître » alarmerait rétroactivement pour un défaut qu'on vient de fermer.*
Tests : **parcours 2230/2230** (+14, bloc **CCI**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou, noyau Milo 12/12. ⭐⭐ **Contrôles négatifs mesurés avant correctif** : séance 1 → **0** et record 1 → **0** avant, **1 et 1** après · pesée 1 → **0** avant, **1** après. ⛔ **Cinq témoins n'existent que pour empêcher les autres d'être verts sur du vide** : l'onglet A doit avoir chargé **avant** que B ne travaille, la séance de B doit avoir atteint le disque, A doit avoir **vu** l'écriture de l'autre, le drapeau doit rester **faux** en solo, et la suppression volontaire doit **encore** fonctionner. ⭐ **Et la sonde des dates a été prouvée capable de rougir** : un défaut injecté qui ne casse que le 1ᵉʳ du mois est détecté sur les 3 dates concernées et sur aucune autre — elle a même dû être rendue **résistante**, parce que sa 1ʳᵉ version mourait au premier défaut et cachait les 7 autres cas. Fichiers : `state.js`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1094. |

**ft-v1093 — 🔙 LE BOUTON RETOUR ÉTAIT LA 3ᵉ PORTE — ET LA SEULE ENCORE OUVERTE** — Michel : *« continue à chercher des incohérences »*. 3ᵉ passe, même méthode qu'en ft-v1089/1091 : **des détecteurs, pas des avis**, et on privilégie ceux qui **mesurent un comportement** plutôt que ceux qui lisent du texte. Six familles cherchées en parallèle, **27 candidats**, chacun re-vérifié à la main avec un contrôle qui doit pouvoir **rougir**.

**⛔⛔ ① LE PLUS GROS : SUR ANDROID, LE GESTE DE FERMETURE LE PLUS COURANT NE FERMAIT RIEN PROPREMENT.** ft-v1091 a fait passer le **glissement du doigt** par `_closeOverlayProper` — la fonction qui appelle le vrai `close…()` d'un écran : celle qui **coupe la caméra**, **pose le marqueur « déjà vu »**, **arrête les minuteurs**. Le gestionnaire `popstate`, lui, faisait `ov.classList.remove('open')` **en direct**. 👉 ***Le bouton/geste retour est LE geste de fermeture sur Android*** : c'est la porte la plus empruntée de toutes, et c'était la seule encore ouverte.

**⛔⛔ ET LA MÊME LIGNE PORTAIT QUATRE DÉFAUTS, TOUS MESURÉS AVANT CORRECTIF.** ① `closeBarcodeScanner` appelée **0 fois** → ***la caméra continue de filmer***, voyant vert allumé, rien à l'écran pour le dire — *c'est le dégât de ft-v1091, par une porte que le correctif n'avait pas fermée*. ② `ft4_wn_seen` toujours **`null`** → les **18 écrans à marqueur** (pop-ups « une seule fois », guides, messages testeurs) **reviennent à chaque démarrage** : le bug de **ft-v629**, rejoué (**R15**). ③ les **3 écrans `data-no-dismiss` se fermaient quand même** — dont « analyse en cours », marqué non-fermable **exprès**, dont le minuteur repeint ensuite un écran caché pour le reste de la session. ④ et il fermait **le mauvais écran**.

**⭐⭐ LE ④ EST CELUI QU'ON NE VOIT PAS EN LISANT.** `[...document.querySelectorAll('.overlay.open')].pop()` rend le dernier **dans le fichier HTML**, pas celui que la personne regarde. Mesuré : `ov-confirm` porte **`z-index:10000`** et se trouve **AVANT** `ov-sess-detail` (z-index 200) dans `index.html`. 👉 ***Avec un détail de séance ouvert et « Supprimer ? » par-dessus, le retour fermait le détail et laissait la question flotter au-dessus de rien*** — et si on confirmait, l'action s'appliquait sur un contexte déjà fermé. ⛔ La question *« qui est au-dessus ? »* a maintenant **un seul propriétaire** (`_overlayDuDessus`, **R2**), et le `>=` n'est pas une coquille : **à z-index égal, c'est le dernier du HTML qui est peint au-dessus** — il reproduit l'ordre de peinture du navigateur.

**⚠️⚠️ ET MA PREMIÈRE SONDE MESURAIT AUTRE CHOSE — c'est le témoin de contrôle qui l'a dit.** Une pop-up de **démarrage** (`ov-whatsnew`) reste ouverte au chargement. Elle était donc **« celle du dessus »**, et toutes mes mesures la visaient **elle**, pas ma cible. Pire : mon overlay de test, ajouté en fin de `body`, était systématiquement celui que `.pop()` retenait — ***ma sonde était biaisée en faveur de l'ancien code***. La version juste **repart d'un écran propre et le vérifie** (témoin ⓪). *La leçon de ft-v1091 (« une sonde qui mesure ses propres variables »), retrouvée sous une autre forme : ici elle mesurait le bon objet, mais pas la bonne cible.*

**⛔⛔ ② LE RÉGIME ALIMENTAIRE ET LE JEÛNE N'ÉTAIENT STOCKÉS NULLE PART.** `foodMode` (cétogène · paléo · low carb · méditerranéen) et `fasting` sont **envoyés** par l'app depuis le 02/08 et **attendus au retour** (`setup.js` les lit) — mais **aucune ligne de `Code.js` ne les écrivait** : `grep body.foodMode` rendait **0** sur 3 500 lignes. Aller-retour joué en vrai (le **vrai** `Code.js` dans un bac à sable) : keto + jeûne 16/8 partent, **reviennent vides**. Sur le même compte : **glucides 39 g → 432 g**, lipides 280 → 76, et Milo cesse de savoir qu'il ne faut proposer ni pain, ni riz, ni petit-déjeuner. ⚠️ **Rien à l'écran ne le dit** : les cases sont simplement revenues à blanc, *ce qui ressemble à un compte neuf, pas à une perte*. Et comme la donnée n'a **jamais atteint le serveur**, elle n'est dans **aucune sauvegarde nocturne** : non récupérable, seulement re-saisissable.

**⛔⛔ ET LE CORRECTIF ÉVIDENT AURAIT FABRIQUÉ UN BUG PIRE.** La convention de `handleSaveProfile_` est `_ps_` — *« le vide ne gagne jamais sur du rempli »*. L'appliquer ici aurait été **faux** : ces deux réglages se **décochent** (`S.foodMode=(S.foodMode===v?'':v)`), donc **`''` est une décision de la personne**, pas un envoi vide. 👉 ***Arrêter le cétogène ne serait jamais reparti, et un changement de téléphone l'aurait fait revenir*** — on aurait remplacé une perte par un réglage qu'on ne peut plus retirer. *C'est la famille §30 (`BUGS.md`) prise à l'envers : le garde-fou du voisin n'est pas forcément le bon garde-fou.* Un témoin mesure les **deux sens** : keto revient, et décocher part vraiment.

**⛔ ③ `goalLog` ÉTAIT CASSÉ DES DEUX CÔTÉS — la panne que ft-v1010 disait avoir réparée.** Le serveur ne l'écrivait nulle part (donc les deux réponses de `loadProfile` rendaient un `[]` **constant**), **et** la restauration le lisait dans `raw.profile` alors que la réponse le met **à la racine**. ⭐ **La jumelle était à portée de regard (R8)** : `raw.cycle`, `raw.programmes`, `raw.exSwaps`, quatre lignes plus bas, avaient déjà la bonne forme. Le commentaire du code annonçait pourtant noir sur blanc : *« sans ça, changer de téléphone perdrait l'histoire de l'objectif (R4) »*. **Mesuré : elle la perdait.** ⛔ Garde-fou identique à `weightLog` : un journal **vide** n'écrase jamais un journal rempli.

**⛔ ④ CINQ TEXTES ANNONÇAIENT UN CHIFFRE QUE LE CODE N'APPLIQUE PLUS** (la famille du *« ~36 h »* de ft-v1086, cherchée partout) : l'aide « Types de série » promettait **« Timer 45 s »** pour un échauffement — *le chrono affiche 1:30 puis 2:00 depuis ft-v1082*, et **`coach.js` porte même un commentaire disant que ce texte est devenu faux** : le correctif avait été posé sur **5 surfaces sur 6** · le **Drop** promettait *« repos 20 s automatique entre chaque palier »* quand le code dit lui-même *« on passe direct au suivant »*, et *« ~10 % »* quand le défaut appliqué est **−20 %** — ⚠️ *la modale de configuration écrit l'inverse de l'aide, dans la même app* · l'aide décrivait un bouton **« 📉 −10% »** qui **n'existe plus** (le pied d'un exercice en porte trois : ⚡ Super · 📉 Drop · 📈 +%) · l'**aide détaillée** comptait le volume par muscle sur **7 jours** quand le code compte sur **14** et que l'écran affiche 14 · et deux surfaces annonçaient **« 18 badges »** pour **19**.

**⛔ ET LE BARÈME D'ÉCHAUFFEMENT A ÉTÉ MESURÉ, PAS RECOPIÉ.** La carte de nouveauté disait *« 3 paliers sous 80 kg, 4 au-delà »*. Mesuré sur 14 charges : **2 paliers jusqu'à 50 kg · 3 de 60 à 80 · 4 à partir de 90**. ⭐ Et l'aide détaillée, elle, avait **raison** depuis le début (*« 2 à 50 kg, 3 à 70, 4 à 130 »*) — *trois surfaces, une seule juste* (**R2**). ⚠️ Un **commentaire du code** disait même *« 5 à 110 »* : faux aussi, mesuré à 4.

**⭐ LE COMPTEUR DE BADGES NE SE PÉRIMERA PLUS TOUT SEUL.** On ne se contente pas d'écrire 19 : un témoin compare l'**annonce** au **contenu réel** de `BADGES` — il rougira au prochain badge ajouté. *C'est exactement le témoin du compteur de cartes du menu Admin (ft-v1081), qui existe parce qu'un nombre écrit à la main se périme au premier ajout.*

**⛔ ⑤ LE DRAPEAU « SÉANCE ENVOYÉE » S'ÉCRIVAIT DANS UN `catch` VIDE — aux DEUX endroits (R8).** La fin de séance et la file de rattrapage posaient `synced=true` puis `localStorage.setItem('ft4_sessions',…)` **sans jamais regarder si l'écriture avait eu lieu**. Si le stockage est plein — *ce projet l'a déjà vécu côté serveur, à 102 % de son réservoir* — le drapeau ne vit qu'**en mémoire** : l'app annonce **« Séance synchronisée ! »**, et au démarrage suivant la séance **repart** et s'écrit une **deuxième fois** dans le classeur. 👉 ***C'est un mécanisme de doublons distinct de celui de ft-v1077*** (le délai de 8 s), et plus vicieux : il se répète **à chaque lancement** tant que le disque est plein. ⛔ Un seul propriétaire de cette écriture (`_ecrireSessionsLocal`), et **elle dit si elle a réussi** : l'échec cesse d'être muet.

**🧾 ⑥ ET NOS PROPRES FICHIERS DE SUIVI SE CONTREDISAIENT — R2 appliqué à nous-mêmes.** Les cellules **Version de ft-v1089 et ft-v1090 étaient inversées** dans le journal de partage (chaque ligne pointait le travail de l'autre session) · une **ligne entière était collée derrière la cellule Version d'une autre**, invisible à l'affichage mais bien là pour `grep` et pour la prochaine fusion · `CONTEXTE-ACTUEL` donnait **deux réponses** à *« quelle version est en ligne ? »* · le **corps de l'entrée ft-v1041** était resté **orphelin** dans `CLAUDE.md` (son en-tête était parti à l'archive) — 13 lignes qu'un lecteur attribuait à ft-v1072 · et **l'archive portait 7 entrées écrites deux fois** (123 lignes).

**⭐⭐ ET LE GARDE-FOU DE L'ARCHIVE NE POUVAIT PAS LES VOIR — c'est le vrai livrable de ce point.** Le contrôle 4 garde l'archive contre la **disparition** d'une entrée : il est né du script qui l'avait écrasée en perdant 297 entrées. Il ne sait pas voir le défaut **symétrique** : la même entrée écrite **deux fois** — ce que fabrique une **fusion par union**. **Il était vert pendant tout ce temps.** D'où le **contrôle 12**, et il est **éprouvé dans les deux sens** (sortie 1 avec un doublon injecté, 0 sans). ⛔ **Aucune ligne n'a été retirée sans preuve** : les 7 doublons sont identiques **à des lignes vides près** (vérifié ligne à ligne avant suppression), et les 13 lignes de l'orphelin existent **toutes** dans l'archive. ⭐ **Et l'exception est nommée plutôt qu'ignorée (R30)** : `ft-v887` a bien deux entrées, mais ce ne sont **pas des copies** — l'une porte les mots de Michel, l'autre le récit restitué le 19/08. *Les fusionner perdrait les citations.* ⚠️ **Et mon propre détecteur avait annoncé un 8ᵉ doublon qui n'existait pas** : une simple **référence en gras** en début de ligne (`**ft-v1009** pendant ce travail…`) comptait comme une entrée — le motif exige désormais le tiret cadratin.

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE, et ça s'argumente.** Ce sont **des réparations** : rien n'apparaît, rien ne bouge, il n'y a rien à apprendre. ⚠️ Les seuls textes qui changent sont des **aides qui cessent de dire quelque chose de faux** — *annoncer « l'aide que tu lisais était fausse » serait exactement le bruit que la règle #11 cherche à éviter*, et le point rouge existe pour faire **découvrir**, pas pour s'excuser. ⛔ **La caméra mériterait une annonce si elle était neuve** ; c'est une fuite qu'on ferme, et le dire alarmerait rétroactivement. ⭐ **Le seul cas discutable est le régime perdu** : il concerne quelqu'un qui a **déjà** changé de téléphone et dont le réglage est parti — mais l'app ne peut pas savoir qui, et une pop-up *« ton régime a peut-être été perdu »* inquiéterait tout le monde pour un cas qu'on ne sait pas identifier. C'est écrit ici, et le réglage se repose en deux taps.

**🧾 ET DEUX FICHIERS DE SUIVI ONT ÉTÉ COMPLÉTÉS APRÈS COUP, sur la question de Michel — *« tu as tout noté sur les journaux ? »*.** ⛔ `docs/JOURNAL-DE-TEST.md` avait été **oublié**, alors que la règle d'or #12 l'appelle *le réflexe* : la passe a soulevé un vrai doute sur Milo — son régime lui **arrive** enfin après une restauration, mais **on n'a jamais mesuré qu'il le SUIT** (`tests/milo` prouve la présence, jamais l'obéissance, §8 de `ARCHITECTURE-CERVEAU-CERVELET`). L'attendu est vérifiable par du code (ni pain, ni riz, ni pâtes, aucun petit-déjeuner), donc l'entrée est promouvable — et sa **symétrique** vaut autant : *Milo cesse-t-il de parler cétogène quand la personne décoche ?* ⛔ Et le **vide mesuré** n'était écrit nulle part : sur **69 champs réellement envoyés**, 3 cassés et **66 qui bouclent** — `cycle`/`programmes`/`exRestPref`/`exSwaps` sont **sains** (faux positifs d'un détecteur statique d'une passe précédente, *à ne pas « réparer »*), `gardienStats` est une **absence volontaire** (compteur par appareil), et `healthDaily`/`healthInbox` accusent un **retard d'un démarrage**, pas une perte. *Écrire ce qui n'a rien rendu coûte trois lignes et évite qu'une 4ᵉ passe refasse le travail* (**R23**). Porté par `BUGS.md` §32.

Tests : **parcours 2216/2216** (+15, bloc **CXCIX**) ⚠️ *mesuré sur l'arbre **FUSIONNÉ** avec le ft-v1092 de session-B*, calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **CONTRÔLES NÉGATIFS mesurés avant d'écrire une ligne** : retour → `closeBarcodeScanner` **0 fois** avant, **1** après · `data-no-dismiss` **FERMÉ ×3** avant, **reste ×3** après · l'écran du dessous **fermé** avant, **gardé** après · marqueur `ft4_wn_seen` **null** avant, **66** après · `foodMode` **(absent)** avant, `keto` après · `goalLog` **0** avant, **2** après · `nutritionPhase` **« charge » constante** avant, **la vraie phase** après · un `goalLog` vide **effaçait** celui en base (0), il ne l'efface plus (2). ⛔ **Cinq témoins n'existent que pour empêcher les autres d'être verts sur du vide** : l'écran doit être **propre** au départ, la fermeture **officielle** doit couper la caméra et poser le marqueur, `.pop()` et « au-dessus » doivent désigner **deux écrans différents**, des champs voisins du même envoi doivent **revenir intacts**, et le corpus des textes doit avoir été **vraiment lu**. ⚠️ **18ᵉ collision, et sur DEUX choses** : session-B a publié **sa ft-v1092** (la santé dans sa propre clé) **et** un bloc **CXCVIII** pendant ce chantier — ma version devient **ft-v1093**, mon bloc **CXCIX**, et leur ancien bloc en double glisse en **CC** ; *un numéro de cache ne recule jamais, et deux blocs du même nom masqueraient une disparition future*. ⚠️ Et leur nouveau bloc annonçait **« ft-v1091 »** au lieu de ft-v1092 — corrigé, c'est exactement le défaut ④ de cette version. Fichiers : `app.js`, `screens.js`, `state.js`, `log.js`, `tracking.js`, `setup.js`, `coach.js`, `constants.js`, `index.html`, `Code.js`, `tools/check_regles.py`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `BUGS.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1093. |

**ft-v1092 — 🔐 LES DONNÉES DE SANTÉ VIVENT DANS LEUR PROPRE CLÉ DE STOCKAGE** — Michel, une heure après avoir lu la nouvelle politique de confidentialité : *« on peut pas créer une section santé pour éviter justement que tout se trouve dans le même JSON ? »*, puis *« go pour la section santé »*.

**⭐⭐ SON IDÉE EST PLUS FORTE QUE LA PROMESSE QU'ON VENAIT D'ÉCRIRE, ET C'EST TOUT L'INTÉRÊT.** La politique dit que les outils de diagnostic ne montrent *que le nécessaire* : c'est une garantie de **COMPORTEMENT** — l'outil **choisit** de ne pas montrer. Avec deux clés (`u_` et `h_`), elle devient une garantie de **CONSTRUCTION** : ***l'outil ne l'a pas en main***. *C'est toujours la seconde qui tient.* ⭐ Et le détecteur livré deux heures plus tôt en est la preuve immédiate : il ne lit que `u_`, donc il est désormais **aveugle à la santé sans avoir été modifié**.

**⛔⛔ LE GARDE-FOU TIENT EN UNE PHRASE, ET C'EST LUI QUI REND L'OPÉRATION FAISABLE : la santé est écrite dans `h_` ET RELUE avant d'être retirée de `u_`.** Script Properties n'a **pas de transaction** — deux écritures peuvent réussir l'une sans l'autre. Avec cet ordre : `h_` échoue → **on ne retire rien**, l'ancien état est intact ; `u_` échoue après un `h_` réussi → la santé existe **aux deux endroits**, et la lecture préfère `h_`. 👉 ***Il n'existe aucun ordre où la santé est retirée avant d'être confirmée ailleurs.*** C'est la prudence de `_packUser_`, qui ne rend un paquet que s'il se relit — appliquée un cran plus haut.

**⛔ ET LE REPLI SUR L'ANCIEN REND LA MIGRATION SANS EFFET DE BORD** : un compte pas encore migré garde sa santé **dans `u_`** et se charge exactement comme avant. `h_` ne fait que **recouvrir** ce qu'il contient. Tant qu'il n'existe pas, **rien ne change pour personne** (règle d'or **#3**).

**⛔⛔ ET LE VRAI RISQUE N'ÉTAIT PAS LA SÉPARATION, C'ÉTAIT LES TROIS ENDROITS QUI SERAIENT DEVENUS FAUX SANS ÊTRE TOUCHÉS.** ① La **suppression de compte** aurait laissé la santé derrière — ***la séparation aurait CRÉÉ une fuite en prétendant en fermer une***. ② La **sauvegarde Drive** aurait perdu bilans sanguins et corporels **dès le lendemain**, en silence, découvert au moment d'en avoir besoin. ③ La **compression** aurait laissé `h_` en clair — le réservoir plein à 102 % du 29/07. *Quand on range une donnée ailleurs, on déplace aussi tout ce qui la lisait et tout ce qui la faisait disparaître.*

**⚠️ DEUX VÉRIFICATIONS ONT CORRIGÉ LA LISTE AVANT D'ÉCRIRE UNE LIGNE.** ⛔ `cycle` est le **cycle de FORCE** (`startDate`/`weeks`/`rm1s`), pas le menstruel : le déplacer aurait cassé l'écran Cycle de force — le menstruel, ce sont `mensCycleStart`, `mensCycleDur`, `contraception`. ⛔ Et `exPhotos` (photos d'**exercices**) et `morpho` (silhouette **déclarée**) ne sont pas des données de santé. 👉 ***Une liste écrite de mémoire aurait emporté le cycle de force et laissé le tabac.***

**⚠️ CE QUE ÇA NE FAIT PAS, ET IL FAUT LE DIRE** : ça ne retire pas l'accès à l'auteur — il reste propriétaire du stockage. Ça supprime l'exposition **incidente** : une sauvegarde ouverte pour autre chose, un outil de diagnostic, un export. *Vendre ça comme « personne ne peut plus voir » serait un mensonge de plus dans un fichier qui vient d'en corriger un.*

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Rien ne bouge à l'écran, rien à faire, rien à apprendre : c'est du rangement dans le stockage. ⚠️ *Et l'annoncer obligerait à expliquer que tout était dans le même fichier avant — une inquiétude pour un progrès que personne ne peut vérifier.* La politique de confidentialité, elle, le dit déjà.

Tests : **parcours 2190/2190** (+12, bloc **CXCVIII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou, **noyau Milo 12/12**. ⭐⭐ **Le témoin qui porte tout le risque n'est pas celui qui vérifie la séparation, c'est celui qui SIMULE SON ÉCHEC** : écriture de `h_` refusée → *la santé est restée dans `u_`*, et le compte se recharge entier. **C'est le seul scénario où on perdrait des données, donc c'est celui qu'il faut jouer.** ⭐ **Le ① existe pour que les autres mesurent quelque chose** (2 clés réellement écrites) et le **rétrocompatible** joue un compte **jamais migré**. ⛔ **Trois témoins lisent le SOURCE**, parce que c'est le seul moyen de figer qu'aucun chemin n'a été oublié : suppression de compte, sauvegarde Drive, compression. ⚠️⚠️ **ET TROIS ROUGES SONT TOMBÉS, AUCUN NE SIGNALANT UN DÉFAUT DE CODE** — tous des témoins visés sur une **forme** : le mien comparait deux **chaînes** (la santé est réappliquée à la fin, donc l'ORDRE des clés change, le contenu non — *« rien n'est perdu » n'est pas « même ordre de clés »*), et un témoin **existant** figeait les **expressions littérales** de la lecture ET de l'écriture du compte. 👉 **4ᵉ fois cette semaine** : c'est devenu la famille **§31** de `BUGS.md`. Les trois sont **re-visés sur leur garantie et éprouvés dans les deux sens** — lecture brute → rouge, écriture non compressée → rouge. ⚠️ **17ᵉ collision** : session-A avait aussi nommé son bloc **CXCVII**, le mien glisse en **CXCVIII**. Fichiers : `Code.js`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1092. |





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
