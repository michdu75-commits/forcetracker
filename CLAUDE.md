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

> **Version actuelle : `ft-v1136`** (prochaine : `ft-v1137`). Historique complet (ft-v128→574 + gouvernance
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

**ft-v1136 — 📏 DEUX PORTES POUR UNE MENSURATION, UNE SEULE LA DATAIT — ET L'INVENTAIRE DES DONNÉES QUI EN A DÉCOULÉ** — Michel, après la livraison du ratio poids ↔ centimètres : *« la mesure qu'il y a sur mon appli là, du tour de cou et taille, elle est datée ou pas ? »*.

**⛔⛔ MESURÉ : NON, PAS TOUJOURS — ET C'EST LA FAMILLE DES DEUX PORTES, LA 3ᵉ FOIS DE LA SEMAINE** (le superset de Milo en ft-v1130, l'IMC de l'import en ft-v1129). L'écran **Progrès** (carte « Masse grasse ») passe par `_mensEnregistrerSaisie` → `mensAjouter` et **DATE** la valeur dans `S.mensLog`. **`saveProfile()`** (`setup.js`, champs `neck-inp`/`waist-inp`/`hip-inp`) écrivait `S.neck`/`S.waist`/`S.hip` **et rien d'autre**. 👉 ***La même mesure comptait ou ne comptait pas pour la courbe selon l'écran par lequel elle entrait.***

**⭐⭐ ET LE VRAI RISQUE N'ÉTAIT PAS L'OUBLI, C'ÉTAIT L'INVERSE — c'est ce qui a décidé de la forme du correctif.** Ces champs sont **PRÉ-REMPLIS** avec la valeur connue. Router bêtement vers le journal aurait stampé *« cou mesuré aujourd'hui »* **chaque fois que quelqu'un enregistre son profil pour corriger son POIDS** : ***on aurait fabriqué une mesure qu'il n'a pas prise***, exactement ce que ce journal existe pour éviter (**R29**). D'où la règle : **on ne date que ce qui a CHANGÉ**. ⚠️ **Le prix est assumé et écrit** : se remesurer et retrouver *exactement* la même valeur ne pose pas de date par cette porte. *Rater une confirmation coûte moins cher qu'inventer une mesure.*

**⭐ ET LES DEUX PORTES N'ONT PAS LE MÊME DÉCLENCHEUR, EXPRÈS.** La carte « Masse grasse » garde son comportement : y appuyer sur ✓ **EST** l'acte de déclarer ses mensurations. Les deux écrivent au **même endroit** (`mensAjouter`, propriétaire unique) ; seul le déclencheur diffère, *parce que les deux gestes ne veulent pas dire la même chose*.

**⛔ R2 — LES BORNES DIVERGEAIENT DÉJÀ, ET LE 65 PARTAIT EN SILENCE.** Le formulaire refusait un cou > 60 cm quand `MENS_DEFS` va jusqu'à 80 — *deux jeux de règles pour la même grandeur*. Mesuré au contrôle négatif : un cou de **65 cm tapé dans le Profil rendait `S.neck` à 0**, sans un mot. `MENS_DEFS` est désormais seul propriétaire de ce qui est impossible. 🏷️ Et la **provenance** est écrite (`s:'profil'`, **R33**) : on saura d'où vient une valeur douteuse.

**⛔ RÈGLE D'OR #3 — UN REPLI GARDE L'ÉCRITURE DIRECTE** si le journal est indisponible (ordre de chargement) ou refuse la valeur : *ce que la personne a tapé ne se perd pas parce qu'un journal n'a pas répondu.* Un champ vidé n'efface toujours rien.

**⛔⛔ AUCUNE REPRISE DE L'EXISTANT, ET C'EST UNE DÉCISION.** `ft4_neck`/`ft4_waist`/`ft4_hip` sont **une valeur unique écrasée, sans date** ; `ft4_mens` est né **vide** le 04/09. Une mesure d'avant-hier n'a donc aucun jour — et *on ne date pas après coup une mesure dont on ignore le jour* (**R29**). ⭐ **L'aide le DIT en toutes lettres** plutôt que de laisser quelqu'un chercher pourquoi sa courbe ne démarre pas.

**📊 ET LA QUESTION A OUVERT LA SUITE : L'INVENTAIRE DES DONNÉES** — Michel, dans la foulée : *« fais-moi un check de tout ce que l'on marque dans l'application, et tout ce qui est suivi et enregistré, on va passer aux choses sérieuses »*. ⚙️ **`tools/donnees.py` → `docs/INVENTAIRE-DONNEES.md`, GÉNÉRÉ depuis le code** (**R27** : un inventaire écrit à la main redevient faux en trois semaines et personne ne le voit). Il croise **trois questions indépendantes** — *la donnée est-elle **DATÉE** ? **survit-elle** à un changement de téléphone ? **Milo la reçoit-il** ?* — et c'est le croisement qui est utile : ***une donnée datée mais non sauvegardée est un historique qui disparaîtra sans prévenir.*** **107 données · 15 historiques (9 datés) · 70 survivent · 60 atteignent Milo.**

**⛔⛔ TROUVAILLE, ET ELLE EST SÉRIEUSE : `mensLog` ET `missedLog` NE QUITTENT JAMAIS LE TÉLÉPHONE.** Vérifié — `mensLog` est **absent de `_cloudSync` ET de `Code.js`**. Un changement de téléphone, un navigateur vidé, une restauration de compte, et **tout l'historique de centimètres disparaît** — avec la carte du ratio livrée la veille. C'est la **règle d'or #3** ailleurs que sur une séance. ⭐ **Corrigé dans une version à part, pas glissé ici** : *une seule chose à la fois, testée avant de continuer.*

**⚠️⚠️ ET MON PROPRE DÉTECTEUR M'A MENTI DEUX FOIS — la leçon vaut plus que l'outil.** ① Ma 1ʳᵉ version annonçait **« 0 historique daté hors sauvegarde »**, c'est-à-dire ***exactement la bonne nouvelle qu'on espère lire*** : elle ne regardait que `push({date:…})` et ratait `push(entree)`, la forme qu'emploie la moitié du projet. *Un détecteur qui ne trouve rien ressemble à un projet sans problème* — le vert qui ne peut pas rougir. ② Corrigée, elle a **CRIÉ AU LOUP** sur `weightLog` et `sleepLog` (« envoyée, jamais relue ») alors que `_applyRestoreData` les repose bien : ma règle n'acceptait que `S.x=d.x`, or la restauration passe par des variables locales. 👉 ***Un inventaire qui annonce une perte de données inexistante fait perdre confiance dans tous ses autres chiffres.*** Les deux causes sont écrites dans le script, et il **s'arrête net** si `_applyRestoreData` ou `_cloudSync` est renommée — *plutôt que de rendre une colonne vide qui aurait l'air rassurante.*

**📣 RÈGLE D'OR #11 — AIDE OUI, POINT ROUGE NON, POP-UP NON — et les trois sont argumentés.** ⭐ L'aide `?` du **PROFIL** porte **la question de Michel mot pour mot**, parce que d'autres se la poseront et qu'elle **ne se devine pas à l'écran** : deux champs identiques, deux comportements. Aide détaillée étendue. ⛔ **Pas de point rouge** : ce serait le **3ᵉ en deux jours** sur le même sujet (mensurations, ratio) — la définition du bruit (**R19**). ⛔ **Pas de pop-up** : rien ne bouge à l'écran, et annoncer un défaut que personne n'a vu est une **alarme rétroactive** (**R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **rien n'est recopié dans le journal**, voir plus haut — les valeurs d'avant le 04/09 restent sans date, et l'aide l'explique. ⛔ **La sauvegarde de `mensLog` n'est PAS dans cette version** : elle touche `Code.js` (donc le backend), elle mérite ses propres témoins. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests : **parcours 2807/2807** (+10, bloc **CCXXXIX**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⛔ **Contrôle négatif : 5 rouges sur l'ancien `setup.js`**, exactement les défauts corrigés — dont le cou de 65 cm. ⭐⭐ **Le témoin qui porte la version est un REFUS** : *enregistrer son profil sans toucher aux mesures ne fabrique AUCUNE date* — sans lui, « on date tout, tout le temps » serait vert et on aurait remplacé un oubli par une invention. ⛔ **Un contrôle empêche l'autre dérive** : l'impossible (un cou de 150 cm) doit rester refusé — *sinon « on accepte tout » passerait pour un assouplissement réussi.* ⛔ Un dernier fige la règle d'or #3 : un champ vidé n'efface pas la mesure connue. Fichiers : `setup.js`, `screens.js`, `coach.js`, `tools/donnees.py`, `docs/INVENTAIRE-DONNEES.md`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1136. |

**ft-v1135 — 🔇 LES MOTS « SOMMEIL / ÉNERGIE / MORAL » QUITTENT LES TUILES — ET DEUX CHOSES ONT ÉTÉ TROUVÉES EN VÉRIFIANT, PAS EN LISANT LE CODE** — Michel : *« je pense que les mots sommeil, énergie et moral on peut les supprimer, c'est logique avec les emojis »*.

**⭐ MESURÉ** : carte **130 → 112 px**, tuile **67 → 49** — soit **157 → 112 sur la journée (−45 px)**, identique sur les **4 formats**, aucun débordement, bouton central immobile.

**⛔⛔ MAIS L'INFORMATION N'EST PAS SUPPRIMÉE, ELLE CHANGE DE CANAL.** La légende devient l'`aria-label` de la tuile (plus un `title`). 👉 ***Un mot retiré de l'ÉCRAN ne doit pas disparaître pour un LECTEUR D'ÉCRAN*** : quelqu'un qui n'a que la voix entendrait « 8,3 h » sans jamais savoir de quoi il s'agit — et **rien ne l'aurait signalé**. Le témoin vérifie donc **les deux faces** : le mot ne doit plus être **vu**, et il doit toujours être **lu** (**R30** — un retrait volontaire s'écrit et se fige, sinon quelqu'un le « répare » dans six mois).

**⚠️⚠️ ① « MORAL : UNDEFINED » — ET L'HONNÊTETÉ ICI, C'EST DE DIRE QUE LE DÉFAUT ÉTAIT DANS MON TEST.** En relisant les `aria-label`, une tuile annonçait `undefined`. **C'était MA fixture** (`mood:4`, alors que l'échelle va de 0 à 3) ; l'app, elle, n'écrit que 0-3 via `setDayMood`. ⭐ **Le repli « — » est posé quand même**, pour deux raisons chiffrables : ces valeurs viennent **aussi du cloud** et d'anciens formats, et **ça coûte une ligne**. *C'est ft-v1126 : « undefined » est toujours pire qu'une absence* — et depuis que la valeur part dans l'`aria-label`, elle serait **annoncée à voix haute**. Deux témoins l'épinglent, à l'écran **et** dans l'annonce.

**⚠️⚠️ ② ET UNE PHRASE QUE J'AVAIS ÉCRITE LA VEILLE ÉTAIT FAUSSE.** En ft-v1134 j'ai justifié le plancher de 48 px par *« 44 px est le minimum d'Apple, et cette tuile SE TAPE »*. ⛔ **Vérifié depuis : `onclick="toggleCheckin()"` est sur la CARTE ENTIÈRE**, pas sur les tuiles — taper une tuile ne marche que parce que le clic **remonte**. La vraie cible tactile fait **~112 px**, et la règle d'Apple n'a jamais porté sur la tuile. ⭐ **Le plancher reste**, mais pour ce qu'il fait *vraiment* : empêcher les trois tuiles de s'écraser et garder la rangée lisible. Le **libellé du témoin** a été corrigé dans le même mouvement. 👉 ***Une règle dont la raison est fausse finit par être contournée — ou traitée comme intouchable.*** *C'est **R28** appliqué à moi-même pour la deuxième journée d'affilée.*

**📣 RÈGLE D'OR #11 — RIEN.** Trois mots disparaissent sous des icônes qui disent la même chose, rien n'est à faire, aucun chiffre enregistré ne change.

**⏱️ ET UNE REMARQUE DE MICHEL QUI VAUT D'ÊTRE GARDÉE : *« je trouve ça long »*.** Chiffré : **une passe de parcours = 16 minutes**, et **5 ont tourné aujourd'hui** (~80 min) pour des retouches de mise en page. ⛔ **La cause n'est pas la suite, ce sont deux passes de rattrapage de MES erreurs** (un bloc de test placé après la fermeture du navigateur, un texte périmé manqué) — ~32 min sur 80. ⭐ **Le levier qui coûte zéro : grouper les retouches en UNE version** (4 demandes → 4 passes aujourd'hui, contre 1 si groupées). ⛔ **Ce qu'on ne fera pas : sauter la passe** — c'est elle qui a attrapé, le jour même, un texte qui envoyait les testeurs vers un écran supprimé.

Tests : **parcours 2797/2797** (+4, bloc **CCXXXVIII** étendu), **calculs 339/339**, muscles 241/241, croisés 50/50, **dates 9/9**, données classées 0 trou. ⚠️ **Une honnêteté sur la méthode** : après cette passe verte, seul le **libellé affiché** d'un témoin a été réécrit (son seuil et son assertion sont inchangés) — *je n'ai pas relancé 16 minutes pour une chaîne de caractères imprimée, et je le dis plutôt que de laisser croire que la passe a tourné sur le fichier exact.* Fichiers : `screens.js`, `style.css`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1135. |

**ft-v1134 — 📏 LE CHECK-IN DU JOUR MAIGRIT DE 27 PX — ET LA GRAISSE N'ÉTAIT PAS OÙ ON LA CHERCHE** — Michel : *« essaye de diminuer la taille du checking en hauteur »*.

**⭐⭐ MESURÉ AVANT DE TOUCHER, ET C'EST LA MESURE QUI A CHOISI LA MÉTHODE.** La tuile faisait **94 px pour 57 px de contenu réel** — **37 px de blancs** (icône 24 + trois écarts de 6 + marges 10/9). ⛔ **La piste évidente a été simulée d'abord, et elle ne valait pas le coup** : resserrer toutes les marges ne rendait que **9 px** sur la carte. 👉 ***La graisse n'était pas dans les marges, elle était dans la DISPOSITION*** — quatre étages empilés (icône / jauge / valeur / légende). L'icône passe **à côté** de la valeur : trois étages.

**⭐ RÉSULTAT, MESURÉ SUR 4 FORMATS × 2 ÉTATS** : tuile **94 → 67 px**, carte **157 → 130** (remplie) et **183 → 156** (vierge) — **−27 px partout**, aucun débordement, bouton central identique. *Le même gain sur un iPhone SE que sur un 15 Pro : ce n'est pas un réglage qui marche sur un seul écran.*

**⛔ RIEN N'EST SUPPRIMÉ** — icône, jauge à 4 traits, valeur et légende sont toutes là. *On gagne de la place en RANGEANT, jamais en jetant de l'information* (**R24**).

**⚠️⚠️ ET UN PLANCHER A ÉTÉ POSÉ, PARCE QUE CETTE TUILE SE TAPE.** Elle ouvre le check-in déplié : sous **44 px** — le minimum d'Apple — elle devient difficile à viser **en salle, les mains moites**. `min-height:48px`, et un témoin l'exige. 👉 *Sans ce garde-fou, le prochain resserrage la rendrait intappable, et personne ne s'en apercevrait avant d'être devant un rack.* **Un gain de 6 px ne vaut pas un tap raté.**

**⭐⭐ ET LE TÉMOIN NE VÉRIFIE PAS « C'EST PLUS PETIT » — c'est le point de méthode.** N'importe quel resserrage futur referait ce vert-là ; il ne protégerait rien. Il protège **le plancher tactile**, **la présence des 4 éléments**, et **le fait que l'icône et la valeur soient sur la même ligne** — *une hauteur en dur, elle, bougerait au premier changement de police sans que rien n'ait bougé pour la personne.*

**📣 RÈGLE D'OR #11 — RIEN, et c'est argumenté.** Aucun repère ne disparaît, rien n'est à faire, aucun chiffre ne change : **une carte prend moins de place**. ⛔ Une pop-up dirait *« on a raccourci une carte de 2,7 cm »* — du bruit pur (R19/R25).

**⏭️ ET UNE IDÉE DE MICHEL EST NOTÉE POUR PLUS TARD, PAS TRAITÉE** : *« on verra par la suite pour supprimer le bouton commencer la séance »*. Écrite dans `IDEES-FUTURES.md` **tout de suite** — *une idée dite en conversation et non écrite disparaît avec la session* (**R27**). ⭐ Elle est sérieuse (le **FAB central** fait déjà la même chose et reste visible sur tous les formats), ⚠️ **mais le doc porte ce qu'il faudra vérifier avant** : le bouton devient **« ↩ Reprendre la séance »** quand une séance est en cours — *le FAB ne le dit pas*, donc le retirer ferait disparaître une **information**, pas seulement un raccourci. Et il pèse 54 px, quand il en manque 84 sur un 13 mini : *son retrait n'y suffirait même pas seul.*

Tests : **parcours 2793/2793** (+8, bloc **CCXXXVIII**), **calculs 339/339**, muscles 241/241, croisés 50/50, **dates 9/9**, données classées 0 trou. ⛔ **Un contrôle d'abord** : les 3 tuiles doivent être présentes — *sinon « la tuile fait au moins 44 px » serait vrai sur une liste vide.* ⛔ Un témoin vérifie qu'**aucun contenu ne déborde** de sa tuile : c'est le premier symptôme d'un resserrage allé trop loin, et il est **silencieux** tant qu'on ne regarde pas. 🔴 **Règle d'or #9** : bouton central mesuré **identique sur les 4 formats**. ⚠️ **Michel doit vérifier sur Safari/iPhone.** Fichiers : `screens.js`, `style.css`, `IDEES-FUTURES.md`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1134. |

**ft-v1133 — ⚡ LE CONSEIL 💡 PASSE SOUS LE BOUTON DE SÉANCE — ET C'EST UNE QUESTION DE MICHEL QUI A TROUVÉ LES 53 PX QUI MANQUAIENT** — Michel, après la livraison de ft-v1132 : *« le bouton commencer la séance, tu n'y as pas touché ? »*.

**⭐⭐ NON — ET C'EST TOUTE LA LEÇON DE CETTE VERSION.** ft-v1132 avait dégagé **136 px** en retirant ce qui était **au-dessus** de la carte de récup, et j'avais conclu, mesures à l'appui, qu'il était **impossible** d'aller plus loin sans déplacer le check-in ou la carte Milo — les deux que Michel avait écartés. ⛔⛔ **Ma mesure était juste et ma conclusion était fausse, parce que je n'avais regardé qu'AU-DESSUS de la carte.** Sa question a fait mesurer **l'intérieur** : le conseil 💡 pèse **54 px** et il était le **dernier** obstacle entre le score et le bouton. ***Les 53 px qui manquaient étaient DEDANS.*** 👉 *Quand on a mesuré et qu'on conclut « impossible », on a surtout mesuré le périmètre qu'on s'était donné.*

**⭐ LE RÉSULTAT, MESURÉ : 831 → 768**, c'est-à-dire **au-dessus de la barre de navigation (778)** — le bouton tient à l'écran sans faire défiler.

**⚠️⚠️ ET C'EST VRAI SUR SON TÉLÉPHONE, PAS PARTOUT — mesuré sur 4 formats × 2 profils, parce que promettre « visible » en général aurait été faux** : ✅ **iPhone 14/15 Pro** (marge **10 px** testeur, **58** normal) · ⚠️ **12/13/14** (✅ pour un utilisateur normal, **manque 17 px** pour un testeur) · ❌ **13 mini** (84) · ❌ **SE** (229). *C'est visible là où ça a été mesuré.*

**⭐ L'ORDRE DEVIENT `score → pourquoi → ACTION → conseil`, ET IL SE DÉFEND.** Le conseil dit **comment remonter le score DEMAIN** ; il n'a pas à s'interposer entre le score d'aujourd'hui et le geste d'aujourd'hui. ⛔ **Et il est DÉPLACÉ, pas supprimé** — *on ne gagne pas de la place en jetant l'information* (R24). Sa mise en forme est inchangée : on le bouge, on ne le redessine pas.

**⛔ RIEN D'AUTRE NE BOUGE**, et c'était la contrainte : ni le **check-in**, ni la **carte Milo**. Michel les avait écartés en ft-v1132, et ce correctif-ci n'avait pas à rouvrir sa décision pour arriver au même résultat.

**📣 RÈGLE D'OR #11 — RIEN, et c'est argumenté.** Aucun repère ne disparaît, rien n'est à faire, aucun chiffre ne change : **un bouton devient plus facile à atteindre**. ⛔ Une pop-up dirait *« on a descendu un conseil de cinq centimètres »* — du bruit pur (R19/R25), et elle apprendrait surtout aux gens qu'ils devaient faire défiler avant.

**⏭️ CE QUE ÇA NE FAIT TOUJOURS PAS** : sur un **13 mini** ou un **SE**, le bouton reste hors écran (84 et 229 px). Pour ces formats-là il faudrait **déplacer un bloc**, et la décision reste celle de Michel — *écrit pour ne pas le reproposer dans un mois* (**R30**).

Tests : **parcours 2785/2785** (+6, bloc **CCXXXVII**), **calculs 339/339**, muscles 241/241, croisés 50/50, **dates 9/9**, données classées 0 trou. ⭐⭐ **Le témoin protège l'ORDRE DANS LE DOCUMENT, pas une position en pixels** — *une position deviendrait fausse au premier changement de police ou de viewport du banc, sans que rien n'ait bougé pour la personne.* ⛔⛔ **Et DEUX contrôles existent uniquement pour l'empêcher d'être vert sur du vide** : le bouton doit exister, **et un conseil doit être réellement affiché** — *sans le second, « le bouton vient avant le conseil » serait vrai le jour où il n'y a plus de conseil du tout.* ⛔ Un dernier vérifie que le conseil est **sous** le bouton et **non vide** : déplacé, pas jeté. 🔴 **Règle d'or #9** : bouton central mesuré **identique** sur les 4 formats. ⚠️ **Michel doit vérifier sur Safari/iPhone.** Fichiers : `screens.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1133. |

**ft-v1132 — 🧹 L'ACCUEIL DÉSENCOMBRÉ : LE PAVÉ « TESTEUR FONDATEUR » DEVIENT UN BOUTON — ET DEUX FOIS J'AI FAILLI JUSTIFIER UNE DÉCISION PAR UN FAIT NON VÉRIFIÉ** — Michel, deux captures à l'appui : *« retire de l'écran le truc énorme du super testeur ou juste un petit bouton, et commencer la séance sur la page d'accueil, en fait ça fait trop chargé »*.

**⭐⭐ MESURÉ AVANT DE PROPOSER, EN PIXELS — ET C'EST CE QUI A CHANGÉ LA CONVERSATION.** Sur un iPhone 393×852 : la zone visible s'arrête à **y = 778** (haut de la nav) et le bouton « Commencer une séance » finissait à **967**. ***Il manquait 189 px.*** Les blocs : carte testeur **166** · Milo **155** · check-in **187** · récup **367**. ⛔⛔ **Et les DEUX options que Michel proposait ont été simulées avant de lui répondre : aucune ne suffisait seule** — carte retirée → il manquait encore **23 px**, petit bouton → **71 px**. 👉 *C'est pour ça que la question lui a été posée avec les chiffres, au lieu de choisir à sa place et de livrer quelque chose qui ne règle qu'à moitié.*

**⛔⛔ POURQUOI UN BOUTON ET PAS UN RETRAIT — vérifié, pas supposé.** `openTesterSpace()` n'a **aucune autre porte permanente** : ses trois autres appelants sont le panneau **Admin** (Michel seul) et deux **pop-ups de bienvenue** qui ne s'affichent qu'une fois. Le retirer aurait fermé, pour Christophe · Eline · Emma · Tatiana, le seul chemin vers la **boîte à idées** — *le canal par lequel les retours arrivent*. C'est la leçon de ft-v1123 : **un outil sans porte d'entrée n'est pas un outil en attente, c'est un outil qui n'existe pas.** ⭐ **On enlève donc le REMERCIEMENT, qui a été lu une fois ; on garde l'ACCÈS, qui sert tous les jours.** 166 px → **48 px**.

**⛔⛔ ET UN VRAI DÉFAUT TROUVÉ EN MESURANT, QUI VAUT POUR TOUT LE MONDE.** Le bloc « souvenir » était **VIDE et occupait quand même 10 px**, tous les jours sans souvenir — c'est-à-dire presque tous. Sa marge est **en dur dans `index.html`**, et `_renderSouvenirCard` vide bien son contenu… sans y toucher, quand `_renderTesterCard`, deux lignes plus haut, pense à la remettre à zéro. ***Deux blocs voisins, deux comportements, un seul correct.*** ⭐ **Corrigé par UNE règle CSS propriétaire unique** (`#s-home > div:empty`) plutôt qu'en ajoutant la ligne oubliée dans chaque fonction de rendu — *sinon on la réoublie au bloc suivant* (**R2**).

**⚠️⚠️ ET DEUX FOIS DANS LA MÊME LIVRAISON J'AI FAILLI JUSTIFIER UNE DÉCISION PAR UN FAIT QUE JE N'AVAIS PAS VÉRIFIÉ — c'est la vraie leçon, et les deux ont été attrapées par la même discipline.**
- **① Le style orphelin.** J'avais écrit, **dans le CSS lui-même**, qu'on gardait les 9 règles `.tester-card` *« parce que le pavé vit encore dans deux pop-ups de bienvenue »*. **Faux.** En écrivant le témoin correspondant, il a fallu `grep` : `class="tester-card"` n'apparaît **nulle part** — les pop-ups emploient `.sw-feat`. *Le style était devenu orphelin au moment exact où j'écrivais qu'il ne l'était pas.* Retiré, **avec sa raison écrite** (**R30**) — *du CSS orphelin ressemble exactement à un oubli.*
- **② Le texte périmé.** La pop-up de bienvenue d'un **nouveau** testeur promet en toutes lettres *« tu vois maintenant une **carte dorée** tout en haut de ton Accueil »* — vrai hier, **faux à la seconde où ceci part en ligne**. Corrigée dans le même mouvement, et un témoin refuse désormais cette phrase. **§31, encore.**
👉 ***C'est R28 appliqué à moi-même, deux fois : une limite — ou une justification — qu'on n'a pas vérifiée n'est pas un fait, c'est une préférence déguisée.***

**📣 RÈGLE D'OR #11 — LA POP-UP SE MÉRITE, ET ELLE EST CIBLÉE.** ⭐⭐ **Elle se mérite** parce qu'un repère bouge **chez 4 personnes qui ne l'ont pas demandé** : leur carte dorée disparaît, et *une disparition muette se lit comme une punition* — quelqu'un peut conclure qu'il a perdu son statut, ou son accès à la boîte à idées. ⛔ **Et elle est CIBLÉE (`si:'testeur'`, mécanisme de ft-v1072)** : les autres n'ont **jamais vu** ce pavé, leur annoncer sa disparition serait du bruit pur. `WHATS_NEW` **v73** + point rouge `testeur-mini` sur l'Accueil, les deux filtrés. ⛔ **Rien dans l'aide `?` ni dans le Guide, et c'est argumenté** : ils sont lus par **tout le monde**, et 99 % des lecteurs n'ont jamais eu ce bloc. *L'aide qu'on corrige ici est celle qui MENTAIT, pas une nouveauté à expliquer.*

**⏭️ CE QUE ÇA NE FAIT PAS, ET IL FAUT LE LIRE — le résultat n'atteint PAS l'objectif, et c'est mesuré.** Le bouton remonte de **967 à 831**, soit **136 px rendus**… mais il reste **53 px sous la nav**. ⛔⛔ **Et les espacements ne pourront JAMAIS combler l'écart : mesuré, même à ZÉRO partout il manquait encore 13 px.** Pour finir le travail il faudrait **déplacer un bloc** — le check-in (187 px) ou la carte Milo (155 px) sous le score de récup — et Michel a **écarté les deux**. *On ne le fait donc pas, et on écrit pourquoi plutôt que de le refaire proposer dans un mois* (**R30**). ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests : **parcours** (bloc **CCXXXVI**, 15 témoins), **calculs 339/339**, muscles 241/241, croisés 50/50, **dates 9/9**, données classées 0 trou. ⭐⭐ **Le témoin qui porte la version n'est pas « le petit bouton est là » — c'est la POSITION du bouton « Commencer une séance »** : *un témoin qui vérifierait seulement la présence du bouton resterait vert le jour où un bloc de 200 px réapparaît au-dessus, c'est-à-dire le jour où le problème revient.* ⛔⛔ **Le témoin de l'annonce tient les DEUX moitiés** — le testeur la voit **ET** le non-testeur ne la voit pas : *vérifier seulement la première laisserait passer exactement le défaut que `si` existe pour empêcher* (la pop-up des pas, ft-v1072). ⛔ Un contrôle vérifie d'abord que le compte est **vraiment reconnu testeur**, sinon « pas de pavé » serait vert pour la mauvaise raison (**§36**). ⛔ **Contrôle négatif sur l'arbre d'avant (`git worktree`) : 4 rouges sur 8** — et ⚠️ **je dis lesquels ne mordent pas** : les 4 verts sont des contrôles et des non-régressions (compte reconnu · porte ouverte · FAB immobile · non-testeur propre), *ils gardent, ils ne détectent pas*. 🔴 **Règle d'or #9** : le bouton central mesuré **identique avant/après**, et le témoin compare avant/après au lieu d'une valeur en dur — *celle-ci deviendrait fausse au premier changement de viewport du banc, sans que le FAB ait bougé d'un pixel.* Fichiers : `screens.js`, `style.css`, `index.html`, `constants.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1132. |

**ft-v1131 — 📐 LE RATIO POIDS ↔ CENTIMÈTRES : UNE CARTE, PAS UNE COURBE — ET C'EST MICHEL QUI A TROUVÉ LA SORTIE** — sa question de départ : *« comment on pourrait intégrer les mensurations sur le graphique du poids et de la masse grasse sans que ce soit chargé visuellement ? »*, précisée en cours de route par *« surtout la taille et les hanches »*. Puis, sans attendre ma réponse : *« ou alors fais un ratio entre la perte de poids, la masse grasse et la perte de centimètre et le montrer dans un onglet supplémentaire »*.

**⭐⭐ SA DEUXIÈME IDÉE RÈGLE LE PROBLÈME DE LA PREMIÈRE, PAR CONSTRUCTION — et c'est ce qui a décidé de la version.** Mesuré avant de répondre : le graphique porte **déjà deux unités**, des **kg** sur l'axe de gauche et des **%** sur l'axe de droite en vue « Les 2 » (`renderCompareChart`). Des centimètres y seraient une **3ᵉ unité sur deux axes** — ***c'était ça, la surcharge qu'il voulait éviter***, et aucune astuce de dessin ne l'enlève. 👉 ***Un ratio n'a pas d'unité, donc il ne demande aucun axe.*** *La bonne réponse n'était pas de mieux dessiner la question de départ, c'était d'en changer.*

**⛔ ET LE RATIO SE FAIT EN VARIATION RELATIVE, JAMAIS EN VALEUR BRUTE.** « −3 kg » et « −4 cm » ne se comparent pas : ce sont deux grandeurs différentes, elles ne tiennent sur aucune règle commune. « **−2,6 % du poids** » et « **−5,4 % du tour de taille** », si — ce sont deux nombres sans dimension, donc **trois barres sur UNE seule échelle**, la plus grosse variation prenant toute la largeur. ⭐ La masse grasse rentre par la même porte : 20,6 % → 18,9 % vaut **−8,3 % de sa propre valeur**.

**⛔⛔ ET C'EST R8, LA 7ᵉ FOIS POUR CETTE FAMILLE — la carte qui promettait était à trente lignes de là.** `tracking.js`, carte « recomposition », **écrite depuis des mois** : *« la balance seule ne montre presque rien : le gras qui part et le muscle qui vient s'annulent dessus. **Ce sont tes charges et tes mensurations qui le disent.** »* 👉 ***On annonçait la lecture à l'utilisateur et rien dans l'app ne la produisait.*** Le signe qui aurait dû alerter est toujours le même : *une phrase qui NOMME une source (« tes mensurations ») sans que cette source soit exploitée nulle part.*

**⛔⛔ LE TÉMOIN QUI PORTE LA VERSION N'EST PAS UN CHIFFRE, C'EST UN REFUS.** Quand le poids baisse et que le tour de taille **ne bouge pas**, la carte dit ***« on ne peut pas dire ce qui part »*** — eau, muscle et gras se ressemblent tous sur une balance. *C'est le seul endroit de cette carte où il serait facile, crédible et faux d'annoncer une perte de gras* (**R29**). ⛔ **Contrôle négatif fait** : en remplaçant ce refus par « du gras », **4 témoins rougissent**. ⛔ **Et la phrase qu'on n'écrira jamais est nommée dans le code** : *« 72 % de ta perte était du gras »*. Un rapport cm/kg est un **indicateur**, le % d'une balance est **ESTIMÉ** par l'équation du fabricant (**R32**) — on montre les variations et le **SENS**, jamais un pourcentage de tissu.

**⭐⭐ L'ÉTAT D'ATTENTE EXISTE EXPRÈS, ET C'EST LE DÉTAIL QUI ÉVITE UN FAUX BUG.** `S.mensLog` est né **la veille** (ft-v1129) : il est vide pour tout le monde, et il faut **2 tours de taille espacés de 14 jours** pour que la carte ait quoi que ce soit à dire. Une carte simplement absente pendant trois semaines **se lit comme une panne**. Avec **une seule** mesure, elle s'affiche donc et **dit à partir de quelle date** elle parlera (R29 : *quand l'app renonce à trancher, elle montre ce qu'elle a*). ⛔ **Avec ZÉRO mesure, rien du tout** : on n'explique pas à chaque ouverture, à quelqu'un qui ne mesure pas, ce qu'il rate (R24).

**⭐ 2ᵉ CARTE — TAILLE / HANCHES, ET ELLE RÉPARE UN OUBLI DE LA VEILLE (R3).** Les hanches ont été ouvertes aux hommes en ft-v1129 *« parce qu'un homme qui SUIT son tour de hanches n'avait aucun endroit où le noter »* — mais elles ne produisaient **aucun comportement observable** chez lui : le calcul US Navy ne les consomme que chez la femme. Le rapport taille/hanches leur en donne un, et c'est **le seul repère ici qui ne dépend d'AUCUNE balance**. ⛔⛔ **Aucun seuil de santé** : les bornes 0,90 / 0,85 existent, elles sont **médicales** — les poser transformerait une mensuration en **diagnostic**. On donne la valeur et le sens de variation, un test épingle l'absence de seuil.

**⛔ R2 — LE VERDICT PART AUSSI À MILO, ET CE N'EST PAS DU CONFORT.** L'écran affiche désormais une conclusion sur la question que la personne pose le plus souvent (*« est-ce que je perds du gras ? »*). Si Milo la recalculait de son côté à partir des chiffres bruts, ***l'écran et lui finiraient par répondre deux choses différentes***. Un propriétaire unique (`ratioCompo`), deux lecteurs. **Coût mesuré : 226 caractères, 0,31 %**, dans la partie **cachée** du contexte. ⭐ Et **le cas « on ne sait pas » part aussi** — c'est même le plus utile : sans lui, Milo choisirait une explication là où il n'y en a pas.

**📣 RÈGLE D'OR #11 — POINT ROUGE, PAS DE POP-UP, et les deux sont argumentés.** ⚠️ C'est le **2ᵉ point rouge en deux jours sur le même onglet**, ce qui est du bruit en soi (R19/R25) — mais **les deux n'annoncent pas la même chose** : celui de la veille disait *« tu peux enfin noter tes centimètres »*, celui-ci dit *« et voilà ce qu'on en LIT »*, et quelqu'un qui a suivi le premier n'a aucune raison de deviner qu'une lecture est apparue sous le graphique. ⛔ **Pas de pop-up en revanche** : la carte **ne s'affiche que si on a déjà mesuré**, aucun repère ne bouge, et il n'y a rien à *faire* que ce que la pop-up de la veille demandait déjà. *Une pop-up ne se répète pas.* Aide `?` de Progrès (« pourquoi des % et pas des kg et des cm ? ») + aide détaillée.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **pas d'onglet séparé**, alors que Michel l'avait proposé — la carte vit dans le bloc de cartes qui existe déjà sous le graphique : **zéro nouvel écran, zéro navigation en plus**, et elle s'efface toute seule quand il n'y a rien à dire (R13/R19). *Si dans un mois elle mérite d'être détaillée, elle prendra son onglet à ce moment-là, sur de l'usage réel.* ⛔ **La carte ignore le zoom du graphique, exprès** : la fenêtre par défaut est **1 semaine**, elle serait donc perpétuellement en attente — et *un corps ne devrait pas changer de diagnostic parce qu'on a bougé un curseur*. Elle affiche **ses propres dates**. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests : **parcours 2762/2762** (+12, bloc **CCXXXV**), **calculs 339/339** (+21, bloc **16**), muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⛔ **Un contrôle ouvre chaque bloc** parce que sans lui *« tout rend `null` »* serait vert et on aurait livré une carte qui ne s'affiche jamais. ⭐ **Les 9 lectures sont éprouvées une par une**, et un témoin vérifie qu'elles rendent **9 codes différents** — *une lecture qui en avale une autre ne se voit pas autrement*. ⛔ **Un témoin de non-régression garde le gabarit commun** : `c.html` a modifié la fabrique de **toutes** les cartes de corrélation, donc la carte de tendance en texte simple doit survivre. Fichiers : `tracking.js`, `constants.js`, `coach.js`, `screens.js`, `tests/calculs/runner.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1131. |

**ft-v1130 — 🔗 LE SUPERSET DE MILO N'ATTEIGNAIT JAMAIS LA SÉANCE — ET IL ÉTAIT ANNONCÉ AUX UTILISATEURS DEPUIS LE 12/08** — Michel : *« maintenant le seanceJson que l'autre claude m'a laissé »*.

**⛔⛔ LE DIAGNOSTIC RELAYÉ NE TENAIT PAS, ET C'ÉTAIT VÉRIFIABLE AVANT D'ÉCRIRE UNE LIGNE.** Session-A avait mesuré *« 5 `seanceJson` pour ~12 `coach` »* et conclu : *« la lecture LOCALE gratuite échoue ~40 % du temps »*. **Faux, et c'est lisible à `coach.js:5221-5231`** : la condition de l'appel payant est `!_ds`, et `_ds` n'est posé QUE par le **bloc JSON caché**. Une lecture de texte réussie remplit `_dsFilet`, **qui n'empêche rien**. ⭐⭐ Or la spec du bloc caché **a quitté le prompt de Milo en ft-v919** (vérifié : plus aucune occurrence dans `buildCoachContext`) — donc l'étage ① est **structurellement mort** et le cervelet part sur **chaque** réponse qui ressemble à une séance. 👉 ***Les 5/12 ne sont pas un taux d'échec : c'est la part des réponses qui ressemblent à une séance.*** *Rien n'échoue — c'est la conception.*

**⭐ ET CE N'EST PAS UN SUJET DE COÛT, CHIFFRÉ** : prompt fixe du convertisseur **2 726 caractères**, sortie ~450 jetons → **≈ 0,37 centime l'appel**, soit **1,9 c sur les 102 c** de sa journée du 04/09 — **1,8 % de la facture**. *Optimiser ça, c'est passer une journée sur 2 % pendant que les 45 000 caractères de règles font le reste* (R19).

**⛔⛔ MAIS EN CHERCHANT, UN VRAI DÉFAUT — ET IL A DEUX COUCHES, MESURÉES SUR LES DEUX PORTES.**
- **① `_normalizeMiloSession` JETAIT `supersetGroup`.** C'est le **seul écrivain** de `_pendingMiloSessions` en production (`_appendStartSessionBtn`) : un champ absent de cet objet n'existe pas pour la suite, **quoi que le cervelet ait transcrit et quoi qu'on ait payé pour l'obtenir**. *Un champ qu'un normaliseur ne recopie pas est un champ supprimé* — **R4**.
- **② Et le groupement vivait sur UNE SEULE des deux portes.** `_applyMiloSession` (une séance tourne déjà) le faisait ; **`_startSessionFromMilo` — le cas NORMAL, aucune séance en cours — ne le faisait pas.**

**⭐⭐ TROISIÈME FOIS QUE CE FICHIER APPREND ÇA — ET LA LEÇON ÉTAIT ÉCRITE EN TOUTES LETTRES À CÔTÉ DU CODE QUI LA VIOLAIT.** Le **contrôle d'intensité** (ft-v980) puis le **cardio** (ft-v995) ont été posés sur cette même mauvaise porte, puis déplacés vers `_appliqueMiloSession` — *« le SEUL point que les deux portes traversent »*, phrase présente deux fois dans `log.js`. Le superset y avait échappé. 👉 ***Une leçon écrite à côté du code qui la viole ne protège rien.*** Nouvelle famille **§43** de `BUGS.md`.

**⛔⛔ CONSÉQUENCE : LE CORRECTIF DU 12/08 N'A JAMAIS FONCTIONNÉ EN PRODUCTION — et l'annonce faite aux utilisateurs nomme EXACTEMENT le bouton cassé.** `WHATS_NEW` `milo-superset` promet : *« quand tu appuies sur ⚡ Commencer cette séance, les exercices qu'il a groupés arrivent liés »*. **« ⚡ Commencer cette séance » EST `_startSessionFromMilo`**, la porte qui ne groupait pas. *C'est la famille « la promesse écrite à l'utilisateur, et fausse » (§8), et personne ne l'a signalée — parce qu'un superset qu'on n'obtient pas ressemble à un superset que Milo n'a pas proposé.*

**⛔⛔ ET LE TÉMOIN DU BANC ÉTAIT VERT — IL ENTRAIT PAR LA PORTE DE SERVICE.** Il écrivait **à la main** dans `_pendingMiloSessions` une forme que la production ne produit jamais (avec `supersetGroup`, donc **après** le normaliseur qui le jette), et il n'exerçait **que la porte B**. Variante de **§36** : le nom du champ était juste, c'est le **chemin** qui était faux. *Un test qui n'emploie ni le schéma ni le chemin de la production ne teste rien, il rassure.* Re-visé : il part de la **forme exacte du cervelet**, traverse le **normaliseur**, et exerce **les DEUX portes**.

**⭐ LE TRANSPORT SE FAIT SUR L'OBJET, PAS PAR INDICE — et c'est R29 qui l'a décidé.** J'allais rezipper `data.exs` par position au point de croisement ; mais `_extraireCardioMilo` **retire** des exercices juste après, donc un alignement par indice poserait le superset sur le mauvais mouvement — au pire **sur un squat lourd**, exactement ce que le garde-fou existe pour interdire. *Le coût de l'erreur décide de la méthode.*

**📣 RÈGLE D'OR #11 — RIEN, et c'est argumenté.** ⛔ La fonctionnalité est **déjà annoncée** depuis le 12/08 (`milo-superset`) et son texte devient **vrai** — il n'y a rien à corriger et rien de neuf à apprendre. Une pop-up dirait *« le superset qu'on vous a annoncé marche vraiment cette fois »* : une **alarme rétroactive** sur un défaut qu'on vient de combler (**R25**), et elle apprendrait à des gens qui n'ont rien remarqué qu'ils ont été trompés. ⭐ Aucun repère ne bouge, rien n'est à faire, aucun chiffre enregistré ne change.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **on ne touche pas à la cascade du cervelet** — le sujet de départ. Elle est **volontaire** et sa richesse est **consommée** (vérifié : `note`, `rest`, `type`, `maxi` atteignent bien `S.wkt`), et surtout le cervelet sait dire *« ce n'est pas une séance »* sur un débrief, ce que `_ressembleASeance` ne sait pas faire. *Économiser l'appel en se fiant à la lecture gratuite rouvrirait le défaut de ft-v1124 : un bouton « on démarre » sous un bilan de séance passée.* ⚠️ Et **Michel doit vérifier sur Safari/iPhone.**

Tests **sur l'arbre FUSIONNÉ avec la ft-v1129 de session-A** (le journal des mensurations) — *c'est lui qui part en ligne* : **parcours 2750/2750** (bloc **VI** étendu), **calculs 318/318**, muscles 241/241, croisés 50/50, **dates 9/9**, données classées 0 trou. ⛔ **Contrôle négatif sur l'arbre d'avant (`git worktree`) : 3 rouges sur 4** — et ⚠️ **je dis lequel ne mord pas** : le témoin « le champ de transport ne fuit pas » est vert des deux côtés, parce que le champ n'existait pas avant ; *il garde le nouveau mécanisme, il ne détecte pas l'ancien défaut*, et le présenter comme une preuve serait un vert qui ne peut pas rougir. ⚠️⚠️ **ET LE DÉTECTEUR DE DATES A ATTRAPÉ MA PROPRE FIXTURE** : j'y avais écrit `new Date().toISOString().slice(0,10)` — **le bug de minuit que session-A a corrigé ce matin même**, réintroduit huit heures plus tard par celui qui avait étendu le détecteur la nuit d'avant. *Il a mordu sur son auteur, c'est exactement ce qu'on lui demandait.* Fichiers : `log.js`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1130. |

**ft-v1129 — 📏 LE JOURNAL DES MENSURATIONS — ET UNE MESURE QUI SE PERDAIT PARCE QU'UN CALCUL N'ABOUTISSAIT PAS** — Michel, trois demandes dans le même message : *« construis tout, par contre de visu on ne voit que les principales — cou, taille et hanches — et dépliable pour le reste »*, une **perte** (*« je viens de rentrer une valeur et juste après ma pesée, ma mesure n'a pas été enregistrée »*), et un manque à l'import (*« même document, même format, même provenance : il manque l'IMC qui peut être calculé, et le % de graisse »*).

**⛔⛔ ① LA PERTE EST RÉELLE, ET ELLE TIENT À L'ORDRE DE DEUX LIGNES.** Reproduite dans un vrai navigateur avant d'écrire un correctif : dans `saveBodyFat`, le `return` qui refuse un % invalide arrivait **AVANT** `S.neck=nk`. Taper **le cou SEUL** rendait *« Entre un % ou tes mesures »* et ***jetait les centimètres tapés*** ; la taille seule aussi. 👉 ***Les centimètres n'étaient enregistrés qu'en effet de bord d'un % réussi.*** C'est la **règle d'or #3** appliquée à autre chose qu'une séance : *ce que la personne a tapé ne se perd pas parce qu'un CALCUL n'a pas abouti.* Le % redevient une **conséquence**, jamais une condition — et le message **dit ce qui a été gardé**, parce qu'un « erreur » sec ferait tout retaper.

**⭐⭐ ② LE JOURNAL ÉTAIT SPÉCIFIÉ DEPUIS LE 03/09 ET NON CONSTRUIT** (`NUTRITION-MOTEUR-TENDANCE.md` §10). **9 mesures**, 3 visibles et 6 dépliables — *neuf cases à plat transformeraient une saisie de 15 secondes en formulaire, et un formulaire on ne le remplit pas* (R24/R26). ⛔ **Les bornes sont PAR mesure** : une borne unique accepterait un cou de 150 cm et refuserait un bras de 38. ⛔ **Une valeur par zone et par jour** : se remesurer **corrige**, ça n'empile pas — *deux chiffres du même tour de taille le même jour ne sont pas une tendance, c'est une hésitation.* ⚠️ **Les hanches deviennent visibles pour tout le monde** : le calcul US Navy ne les consomme que chez la femme, mais *un homme qui SUIT son tour de hanches n'avait aucun endroit où le noter*.

**⛔⛔ ③ ET R8 SE REFERME AU PASSAGE — 6ᵉ FOIS POUR CETTE FAMILLE.** Le prompt de Milo promettait **déjà**, en toutes lettres, *« si tu ajoutes tes mensurations, je pourrai mieux suivre ton évolution »* — **une source qu'il ne recevait pas**. *Construire la donnée en laissant Milo promettre dans le vide aurait été pire que de ne rien construire.* Il reçoit la **VARIATION**, pas la liste (*« Tour de taille 88 cm (−4 en 2 mois) »*), dans la partie **cachée** puisqu'une mensuration change une fois par mois. **Coût mesuré : +258 caractères, 0,35 %.** ⛔ Et une mesure notée **une seule fois** s'affiche **sans flèche** : on n'invente pas une tendance sur un point.

**⛔⛔ ④ ANTI-FUITE, TROUVÉE EN MESURANT ET NON EN RELISANT — 5ᵉ cas.** Ma sonde rendait un contexte **identique** avec et sans mensurations : `_vcApplyPersona` ne connaissait pas `mensLog`, donc ma fixture n'atterrissait pas… **et surtout les tours de taille RÉELS de la personne seraient partis dans chaque persona du banc d'essai.** L'obligation est écrite dans cette fonction depuis ft-v1106. 👉 ***Une donnée neuve qui atteint Milo doit être remise à zéro le jour même où elle naît*** — sinon personne ne saura, dans six mois, qu'elle a été oubliée.

**⛔⛔ ⑤ LE 3ᵉ POINT : LE FILET EXISTAIT, MAIS À UN SEUL ENDROIT (R2).** `saveBodyScan` calculait l'IMC manquant ; `_importScaleRows` (import de fichier) copiait les colonnes **et rien d'autre**. ***Le même document perdait donc son IMC selon la porte par laquelle il entrait.*** Un seul propriétaire désormais (`_scanCompleter`), appelé par les deux. ⭐⭐ **Et les deux manques ne se comblent PAS pareil, c'est le cœur de la décision** : l'**IMC se calcule sans rien supposer** (poids ÷ taille², et la taille ne bouge pas chez un adulte) ; le **% de gras a besoin des mensurations DE CETTE DATE-LÀ** — *prendre le tour de taille d'aujourd'hui pour un bilan de mars fabriquerait un fait sur la personne* (**R29**). Fenêtre de **21 jours**, sinon **on se tait**. 🏷️ **Et ce qui est calculé le DIT** (`calc`, **R32/R33**) : *un chiffre calculé qui se fait passer pour une mesure est pire qu'un chiffre absent.*

**📣 RÈGLE D'OR #11 — LA POP-UP SE MÉRITE, ET ICI DEUX FOIS** : il y a quelque chose à **faire** (noter ses mensurations, qui n'étaient conservées nulle part) **et** un repère a bougé (le champ Hanches apparaît chez les hommes). `WHATS_NEW` **v72** · point rouge `mensurations` sur **PROGRÈS** — *le poser sur l'Accueil enverrait chercher là où il n'y a rien à voir* (le défaut de ft-v1099) · aide `?` de l'onglet · **2 entrées** d'aide détaillée, dont une sur *« calculé n'est pas mesuré »*.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **pas de droite/gauche** — doubler les champs pour une information que presque personne ne suit des deux côtés fabriquerait des cases vides ; la clé deviendrait `bras_d`/`bras_g` si le besoin apparaît. ⛔ **Aucun graphique de mensurations** : le journal se remplit d'abord, *on ne trace pas une courbe sur un point.* ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests **sur l'arbre FUSIONNÉ avec le détecteur de dates étendu de session-B** — *c'est lui qui part en ligne* : **parcours 2746/2746** (+15, bloc **CCXXXIV**), **calculs 318/318**, muscles 241/241, croisés 50/50, **dates 9/9** (les leurs), données classées 0 trou. ⭐⭐ **Le témoin qui porte la version est celui de la RÈGLE D'OR #3** : le cou seul est enregistré, il n'est plus jeté — *et un second vérifie que le message le DIT.* ⛔ **Un contrôle empêche le correctif de dégénérer** : cou + taille doit **toujours** produire le % — *sans lui, « on garde tout et on ne calcule plus rien » serait vert.* ⛔ Deux témoins figent le 3ᵉ point (IMC calculé / % de gras **seulement** si daté), et un troisième qu'un bilan **déjà complet n'est jamais écrasé**. ⚠️⚠️ **Et un témoin existant a rougi sur MON commentaire** — celui qui interdit les vieux prix épinglait *« −4 cm en 2 mois »*, où il n'y a **aucun prix**. Sa garantie était écrite deux lignes au-dessus (*« le mur affichait 4,99€ / 2 mois »*) : re-visé sur **« 2 mois près d'un montant »**, commentaires retirés, **contrôle négatif fait** — un vrai vieux prix remis en code est toujours attrapé. **§31, encore.** Fichiers : `state.js`, `constants.js`, `tracking.js`, `coach.js`, `screens.js`, `tests/donnees/donnees-milo.json`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1129. |

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
