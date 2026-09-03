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

> **Version actuelle : `ft-v1117`** (prochaine : `ft-v1118`). Historique complet (ft-v128→574 + gouvernance
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

**ft-v1117 — 🥤 LE PIÈGE DU COCA N'ÉTAIT PAS CELUI DU COCA : IL Y EN A NEUF** — Michel, après le correctif de la veille : *« et les autres boissons ? »*. **La bonne question**, et la réponse est plus large que le cas qui l'a déclenchée.

**⛔⛔ MESURÉ : CIQUAL porte NEUF PAIRES** « X, **sucré**, avec édulcorants » / « X, **sans sucres ajoutés**, avec édulcorants » — cola, limonade, tonic, boisson au thé, trois boissons gazeuses, boisson énergisante, fromage blanc. 👉 Et **« sucré » est TOUJOURS le nom le plus court** (29 caractères contre 43 pour le cola) : *le tri par longueur choisissait donc systématiquement la version sucrée dès qu'on tapait « light » ou « zéro ».* **Le Coca n'était pas un bug, c'était un symptôme sur neuf.**

**⚠️⚠️ ET LE CORRECTIF « PROPRE » A ÉTÉ REFUSÉ PAR LA MESURE — c'est la leçon de la version.** La correction élégante saute aux yeux : `zero`/`light` sont traduits en « édulcorants », il suffirait de les traduire en « sans sucres ajoutés » et les neuf paires tombent d'un coup. **Mesuré avant d'écrire une ligne, en remplaçant la table EN MÉMOIRE dans la page** : ça corrige **3 cas et en casse 3**. `yaourt light` ne rend **plus rien**, `soda light` tombe sur *« Boisson gazeuse **à la pomme** »* (30 kcal, **un autre produit**), `creme light` devient un cappuccino. 👉 ***« Light » ne veut pas dire « sans sucre » : un yaourt light est 0 % de matière grasse.*** ⭐ **Un mot qui a deux sens ne se traduit pas, il se DÉSIGNE** — c'est la frontière `FOOD_SYNONYMES` / table d'alias, éprouvée une troisième fois. *La solution qui a l'air structurelle n'est pas toujours la bonne ; seule la mesure le dit* (**R7**).

**⛔⛔ ET LE PIRE CAS N'ÉTAIT PAS UNE BOISSON LIGHT.** `lait amande` rendait **« Chocolat au lait aux fruits secs (noisettes, amandes) » à 559 kcal/100 g** — pour une boisson qui en fait **36**. ***× 15,5***, très au-delà du × 24 du Coca en valeur absolue. Et `lait soja`, `lait avoine` ne rendaient **rien**. Cause : *CIQUAL écrit « Boisson à… » là où on dit « lait de… ».*

**⛔⛔ CE QU'ON REFUSE DE FAIRE, ET C'EST UN TÉMOIN À PART ENTIÈRE : le LAIT DE COCO.** La table distingue le **lait de coco culinaire** (18041, **199 kcal**, celui des currys) de la **boisson à la noix de coco** (18907, **30 kcal**, celle du petit-déjeuner). *Les fusionner aurait refait exactement le dégât qu'on venait de réparer.* ⭐ Et il n'avait besoin d'aucun alias : **mesuré, « lait de coco » trouvait déjà le bon**. *Avant d'ajouter une porte, vérifier qu'elle n'est pas déjà ouverte.*

**⛔ ET « ROSÉ » RENDAIT DE LA ROSETTE** — le saucisson, **392 kcal** pour un vin qui en fait **69**. C'est la famille de `hampe` → « cham**pêtre** » : *la recherche compare des sous-chaînes, et « rose » vit dans « **Rose**tte ».* ⭐ Rien n'est fermé : la rosette reste trouvable en la tapant, et elle apparaît juste sous le vin.

**⭐ LE RÉSULTAT, SUR 80 BOISSONS COURANTES : 28 sans résultat → 9.** Ice tea, red bull, monster, orangina, sprite, fanta, oasis, schweppes, latte, bière blonde, panaché, eau pétillante et les quatre laits végétaux trouvent leur générique. ⛔ **Et aucun chiffre de marque n'est écrit** : le nom affiché dit *« Boisson énergisante »*, pas *« Red Bull »* — c'est le mécanisme de `mcdo` (R32/R33).

**⛔ CE QUI RESTE VIDE EST LISTÉ PLUTÔT QUE COMBLÉ AU JUGÉ** : `powerade`, `gatorade`, `isotonique` — **aucune boisson isotonique n'existe dans CIQUAL**, vérifié — plus `mojito`, `ginger beer`, `cream soda`, `whey`, `shaker`. *On préfère le dire que servir un aliment approchant* (**R29**).

**📣 RÈGLE D'OR #11 — POINT ROUGE + AIDE, PAS DE POP-UP.** Des dizaines de boissons répondent enfin, et un chiffre change chez qui note ses sodas light : il y a donc à **découvrir**. ⛔ Mais c'est une **correction**, pas un basculement — *les valeurs d'avant étaient fausses*, et une pop-up dirait *« vos boissons light étaient comptées trop cher »* : une **alarme rétroactive** (**R25**). ⭐ L'aide `?` et l'aide détaillée **étendent l'entrée du Coca** au lieu d'en créer une seconde sur le même sujet (**R2**).

⚠️⚠️ **ET UN DE MES TÉMOINS A ROUGI SUR DU CODE SAIN — §31, TROISIÈME FOIS DE LA JOURNÉE.** Il exigeait « Rosette » en **PREMIER** résultat ; or la garantie est qu'elle reste **TROUVABLE**. ⭐⭐ **Mesuré avant de toucher au code** : `rosette` rend « Saucisson sec » d'abord et « Rosette ou fuseau » juste après — ***et c'était déjà le cas avant cette version*** (tri par nom le plus court, 13 caractères contre 17). 👉 *Ce n'était pas une régression, et « réparer » le code aurait cassé quelque chose de sain.* Le témoin vérifie maintenant la vraie garantie, **des deux côtés** : la rosette sort en la tapant, **et** elle reste visible sous le vin quand on tape « rosé ».

Tests : **parcours 2603/2603** (+15, bloc **CCXXV**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin qui compte le plus n'est pas « les 9 paires sont corrigées » — c'est « `yaourt light` répond toujours »** : *c'est lui qui aurait disparu si j'avais appliqué le correctif structurel, et il est là pour que personne ne le réapplique dans six mois.* ⭐⭐ **Et deux témoins portent ce qu'on REFUSE de faire** : le lait de coco culinaire ne devient jamais la boisson, et `powerade`/`gatorade`/`mojito` ne rendent rien. ⛔ **La non-régression épingle les CHIFFRES, pas les noms** : soda 34, limonade 33, tonic 33, coca 40, bière 40, vin rouge 76 — *un témoin sur les noms resterait vert si les valeurs bougeaient sous lui.* ⚠️ **Michel doit vérifier sur Safari/iPhone.** Fichiers : `tools/alias.py`, `data/alias.json`, `constants.js`, `screens.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1117. |

**ft-v1116 — 🥤 LE COCA ZÉRO ÉTAIT COMPTÉ 24 FOIS TROP** — Michel, en notant son repas de midi, tombe dessus tout seul : *« corrige le coca zéro »*. **Le défaut a été trouvé en USANT de l'app, pas en la testant** — et c'est la meilleure façon.

**⛔⛔ MESURÉ.** `coca zéro` rendait **« Cola, SUCRÉ, avec édulcorants »** (18037, **24 kcal/100 g**) **AVANT** *« Cola, SANS SUCRES AJOUTÉS, avec édulcorants »* (18060, **1 kcal/100 g**). Deux libellés qui se ressemblent, **24 fois d'écart**. 👉 Sur une canette de 50 cl : ***120 kcal enregistrées au lieu de 5***.

**⭐⭐ LA CAUSE N'EST PAS UNE FAUTE DE LA TRADUCTION — C'EST SA LIMITE, ET C'EST CE QUI REND LE CAS INSTRUCTIF.** `zero` et `light` sont traduits en « édulcorants » (ft-v1113), ce qui est **exact** ; seulement **les DEUX lignes portent ce mot**, et c'est alors le **tri par nom le plus court** qui tranche. Il tranche mal. 👉 ***Un mot traduit désigne une FAMILLE, pas un aliment ; quand la famille contient le CONTRAIRE de ce qu'on cherche, il faut le CODE.*** ⭐ C'est **exactement la frontière** écrite la veille entre `FOOD_SYNONYMES` et la table d'alias — *elle avait été posée en théorie, elle est vérifiée ici sur un vrai cas, trouvé par l'usage.*

**⛔ ON NE RETIRE PAS L'AUTRE LIGNE, ET LE TÉMOIN LE VÉRIFIE.** « Cola, sucré, avec édulcorants » est le **bon** aliment pour un cola à la stévia. On l'empêche seulement de répondre **à la place** du zéro : il reste **juste en dessous** dans la liste (**R29**). *Réparer une proposition en supprimant sa voisine, c'est déplacer le problème.*

**⛔ ET CE QUI DIFFÈRE VRAIMENT NE SE FUSIONNE PAS** : CIQUAL distingue la version **sans caféine** (18068), elle garde sa propre entrée. 13 alias ajoutés (`coca`/`coke`/`cola`/`pepsi` × `zéro`/`light`/`max`/`sans sucre`).

**⛔⛔ ET ILS VIVENT DANS `tools/alias.py`, JAMAIS DANS `data/alias.json`** — le fichier est **généré** : une retouche à la main y disparaîtrait à la prochaine exécution, **sans bruit**. *C'est le genre de perte qu'on ne remarque que des semaines plus tard* (**R27**). Un témoin permanent l'épingle, et un second exige que **chaque ajout porte sa raison écrite** (**R30**).

**📣 RÈGLE D'OR #11 — L'AIDE SEULE, et c'est argumenté.** Ni pop-up ni point rouge : rien n'apparaît, aucun repère ne bouge, et **la valeur d'avant était fausse** — ce n'est pas un basculement, c'est une **correction**. ⛔ Une pop-up dirait *« vos Coca Zéro étaient comptés 24 fois trop »* : une **alarme rétroactive** sur un trou qu'on vient de combler (**R25**). ⭐ Mais l'aide gagne le cas, parce qu'il enseigne **un réflexe qui vaut partout** : *quand deux propositions se ressemblent, c'est le LIBELLÉ qui tranche* — « sucré » / « sans sucres ajoutés », « cru » / « cuit », « avec peau » / « sans peau ». ⚠️ Et elle dit que **les lignes déjà enregistrées ne changent pas toutes seules** : l'app ne réécrit jamais le journal derrière la personne.

Tests : **parcours 2589/2589** (+13, bloc **CCXXIV**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin qui porte la version épingle le CHIFFRE, pas seulement le code** : 1 kcal/100 g en tête — *un témoin qui ne vérifierait que « c'est 18060 » resterait vert si la base changeait sous lui.* ⭐⭐ **Et celui qui compte le plus est celui de la NON-RÉGRESSION** : `coca` doit toujours rendre le Cola **sucré** à 40 kcal — *c'est lui qui empêche de « réparer » le zéro en cassant le Coca normal, et il n'y avait rien de plus facile à casser ici.* ⛔ Un témoin de plus vérifie que le cola sucré aux édulcorants **est encore là, en dessous** : sans lui, « le bon est en tête » serait vrai même si on avait fait disparaître l'autre. ⚠️⚠️ **ET UN DE MES TÉMOINS A ROUGI SUR DU CODE SAIN, à la 1ʳᵉ passe — §31, sur un témoin écrit dix minutes plus tôt.** Il exigeait que chaque ajout porte une raison **d'au moins 8 caractères** ; or 8 des 13 disent `'idem'`, qui **est** une raison — elle renvoie à la ligne du dessus. *Il mesurait la LONGUEUR du texte, pas la présence d'un motif.* 👉 Re-visé sur la vraie garantie, qui est **double** : aucune raison vide, **et** `idem` n'est jamais le PREMIER (sinon il ne renverrait à rien). Fichiers : `tools/alias.py`, `data/alias.json`, `screens.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1116. |

**ft-v1115 — 🥗 LES MOTS QU'ON EMPLOIE ATTEIGNENT UN ALIMENT PRÉCIS (569 alias)** — Michel fournit la table d'alias V2 de GPT, **construite sur l'export CSV de notre propre base** — l'audit que je lui avais livré le matin même. *La boucle est fermée : on lui a donné la matière, il a rendu la table.*

**⭐⭐ ELLE NE CRÉE AUCUNE VALEUR NUTRITIONNELLE, ET C'EST VÉRIFIÉ, PAS PROMIS.** Un alias est une **porte** vers un code CIQUAL existant. À l'import, les 4 macros de chaque ligne sont comparées aux nôtres : **0 écart sur 569**, **0 libellé divergent**, **0 alias ambigu**. ⭐ Et il avait **repris la découverte cru/cuit** de l'audit : `pâtes` vise 9811 *cuites*, pas les crues.

**⛔⛔ CE QUE LA VERSION APPORTE EST MESURÉ, PAS ANNONCÉ — les 569 mots joués dans la vraie recherche AVANT de brancher :** **219 étaient déjà justes** · **135 trouvaient la bonne cible sans la mettre en tête** · ⭐ **153 ne rendaient RIEN** (*tortiglioni, fettuccine, pappardelle, riz jasmin, arborio, sticky rice*) · ⚠️ **62 rendaient un AUTRE aliment** — et ces trois-là valent d'être nommés : **`riz japonais` rendait un BISCUIT APÉRITIF**, **`patate` rendait une PATATE DOUCE**, **`tradition` rendait du CIDRE**. 👉 *Une recherche qui rend le mauvais aliment coûte plus cher qu'une recherche vide : on l'enregistre sans se méfier.*

**⭐⭐ LA DÉCISION EST DE MICHEL, ET ELLE N'ÉTAIT PAS ÉVIDENTE.** Sur les 13 cas où seul l'**état** change (`riz` cru 350 → cuit 155, `pâtes` 364 → 167), basculer double ou divise par deux **ce qui s'enregistre**. Question posée, réponse : ***« les deux, le cuit en premier »***. ⛔ La cible passe donc **devant**, la recherche habituelle continue **dessous** : `riz` rend *Riz blanc, cuit* puis *Riz blanc, cru* juste en dessous. **Personne ne perd son aliment**, et celui qu'on mange le plus souvent est en tête — **R29, informer sans décider**. *Celui qui pèse ses pâtes sèches avant cuisson les trouve à un doigt.*

**⛔⛔ POURQUOI UN CODE ET NON UNE REQUÊTE — c'est ce qui distingue cette table de `FOOD_SYNONYMES`, et ce n'est pas de l'esthétique.** Celle de ft-v1113 traduit une frappe en une **autre frappe**, puis laisse le classement trier : parfait pour ouvrir une **famille** (« mcdo »), **inutilisable pour désigner UN aliment**. *C'est le tri par longueur de nom qui fait remonter « Veau, steak haché 15 % » avant le bœuf.* Un alias qui porte le **CODE** ne subit aucun classement. ⛔ Et **R2 tient** : le générateur **refuse** qu'un même mot soit dans les deux tables.

**⛔ CORRESPONDANCE SUR LA REQUÊTE ENTIÈRE, jamais sur un mot** : `riz` est un alias, **`riz au lait` n'en est pas un** et suit la recherche normale. *Sans ça, tout ce qui contient « riz » basculerait sur du riz cuit* — un alias détournerait des recherches qu'il n'a jamais visées.

**⛔⛔ UNE ERREUR TROUVÉE CHEZ GPT, ET C'EST LE GARDE-FOU QUI L'A VUE.** `tomate` visait **`20189 · Tomate, séchée`**, dont les calories sont **« non déterminées »** dans CIQUAL — *l'app ne peut donc JAMAIS la proposer*. 👉 ***Un alias qui ouvre une porte fermée est pire qu'un alias absent : la personne croit avoir cherché.*** ⭐ La colonne `recherchable` de l'export existait exactement pour ça, et elle n'avait pas été lue. Corrigé vers l'**aliment moyen** (`20385`, la convention de CIQUAL pour un mot générique) — ⛔ **et la correction est NOMMÉE, imprimée par le générateur à chaque exécution**, jamais silencieuse (**R30**).

**⛔ ET LES 58 MOTS ABSENTS SONT LISTÉS PLUTÔT QUE TUS** — *whey, créatine, naan, chapati, biryani, dal*. Ce sont de **vrais trous de la table nationale**, pas des erreurs de GPT. *On les nomme au lieu de faire semblant.*

**📣 RÈGLE D'OR #11 — LES CINQ POINTS, ET LA POP-UP SE MÉRITE ICI.** C'est **« un repère a bougé » dans sa forme la plus coûteuse** : un chiffre que la personne **note tous les jours** change **du simple au double**. ⚠️⚠️ *Le danger n'est pas qu'elle le remarque — c'est qu'elle ne le remarque PAS et que tout son journal glisse.* `WHATS_NEW` **v68** (444 caractères) · point rouge `alias-aliments` · aide `?` · aide détaillée · **diapo du Guide sans image** (une capture figerait des chiffres et une liste qui dépend de ce qu'on tape). ⭐ Et la pop-up **dit où est parti l'ancien** : *« la version crue n'a pas disparu, elle est juste en dessous »* — *annoncer un basculement sans dire où est l'ancien fabrique l'inquiétude qu'on voulait éviter* (leçon de la v67).

**⏭️ CE QUE ÇA NE FAIT PAS** : les **2 défauts de moteur** trouvés à l'audit du matin restent **non corrigés** — la **ponctuation collée** au mot tapé (`Boulgour, cuit` → rien) et les **mots-outils exigés** (`filet de bœuf` → rien). ⚠️ La table d'alias les **contourne** là où elle passe, elle ne les **répare** pas. ⚠️ **Et Michel doit vérifier sur Safari/iPhone** : ce conteneur n'a que Chromium.

Tests : **parcours 2578/2578** (+24, blocs **CCXXIII** et **CCXXIII bis**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin qui porte la décision de Michel se vérifie DANS LES DEUX SENS** : le cuit doit être en tête **et** le cru doit être encore là, en dessous — *un témoin qui ne vérifierait que le premier laisserait passer la disparition du second, c'est-à-dire exactement ce qu'on a promis de ne pas faire.* ⭐⭐ **Et deux témoins portent la promesse de fond** : aucun alias ne vise un code absent de la base, aucun ne vise un aliment sans calories (le cas « tomate séchée »). ⛔ **Trois de non-régression** : ce qui n'est pas un alias suit la recherche habituelle · `riz au lait` n'est pas détourné · **sans la table (hors ligne), la recherche redevient celle d'avant**, jamais une erreur (règle d'or #4). ⭐ **Un témoin applique la leçon de ft-v1114** : chaque aliment donné en **exemple** par l'aide doit exister dans la table, et chaque mot annoncé comme **absent** doit l'être vraiment. Fichiers : `app.js`, `data/alias.json`, `tools/alias.py`, `constants.js`, `screens.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1115. |

**ft-v1114 — 🍔 ON MET TOUT ET ON MARQUE LE DOUTE, AU LIEU D'ÉCARTER** — Michel : *« il faut que je puisse trouver les noms comme big Mac ou pizza 4 fromages »* — et il a **fourni lui-même le classeur des valeurs officielles**, la source que ce conteneur ne peut pas atteindre (le proxy rend `mcdonalds.fr` en 403). 27 produits dans `data/marques.json`, générés par `tools/marques.py`.

**⭐⭐ LA DÉCISION QUI PORTE LA VERSION N'EST PAS LA MIENNE, ET ELLE EST MESURABLE.** Ma 1ʳᵉ version **ÉCARTAIT** les 4 lignes dont je ne pouvais rien garantir — le *Korean Whopper* (**752 kcal publiées, 616 calculées depuis ses propres macros**) et 3 lignes KFC en pièces (**146, 77 puis 38 kcal/pièce** : elles se divisent par deux, donc au moins deux sont fausses et on ne sait pas laquelle est juste). Michel : *« il faut tout mettre sinon autant rien mettre c'est logique »*. 👉 ***Une ligne ABSENTE pousse vers l'estimation IA, qui est PIRE qu'une valeur publiée douteuse*** — et ce n'est pas une opinion : *c'est exactement le mécanisme qui a fabriqué son pot de protéine faux* (ft-v1103/1104/1105, trois versions à courir après un chiffre que l'app avait estimé faute de fiche). ⭐ On montre donc la valeur **ET** ce qui cloche, avec **le chiffre qui permet de juger** (« 38 kcal/pièce »). **R29 : informer sans décider.** *Mon tri protégeait ma propre certitude, pas la personne.*

**⛔⛔ ET LE DOUTE DESCEND JUSQU'À LA DONNÉE — R4, TROISIÈME FOIS AU MÊME ENDROIT.** Il ne suffit pas de l'afficher : il s'affiche dans la liste, **se redit dans le formulaire** (le dernier écran avant « Ajouter »), **et reste attaché à la ligne enregistrée** — sinon on ne saura plus, dans trois mois, qu'un chiffre du journal était signalé le jour où on l'a pris. ⚠️⚠️ **Or `_provFood` construit une LISTE BLANCHE, et elle laissait tomber `doute` et `kcalDerivee`.** 👉 ***J'avais écrit « le doute descend jusqu'à la donnée (R4) » en commentaire, juste au-dessus de la ligne qui l'enfreignait.*** C'est la **mesure de l'entrée sauvegardée** qui l'a vu, pas la relecture — et l'avertissement était déjà en majuscules dans la fonction, posé lors des deux fois précédentes. *Un commentaire n'est pas un garde-fou.*

**⛔⛔ LES QUATRE POUR-100 g SONT DÉRIVÉS DE LA PORTION, JAMAIS RECOPIÉS.** Mon 1ᵉʳ jet **transcrivait** les colonnes de macros du classeur, et le Big Mac sortait à **28 g de protéines au lieu des 27 publiés** : ces colonnes sont **arrondies à l'entier**. ⚠️ **Et je l'avais validé avec un contrôle trop lâche** (« jamais plus de 1,5 g d'écart »), qui masquait exactement ça. 👉 *Un seuil de tolérance choisi pour passer est un seuil qui cache ce qu'il devait trouver.* En dérivant tout de la **portion** (le chiffre primaire publié) : **0 écart sur 23 produits**.

**⚠️⚠️ ET LE PREMIER CLASSEUR AVAIT UN DÉCALAGE nom ↔ LIGNE NUTRITIONNELLE — mon détecteur n'en voyait que le symptôme.** Sur le bloc Quick, les noms et les valeurs étaient désalignés ; ma sonde n'attrapait que **6 lignes** manifestement absurdes. 👉 ***J'aurais importé 85 lignes décalées en croyant le dégât borné à 6.*** Michel a renvoyé un fichier **CONTRÔLÉ**, qui passe tous les détecteurs. *Un détecteur qui trouve « quelques » anomalies dans un fichier structurellement décalé ne mesure pas l'ampleur du problème : il mesure sa propre portée.*

**⛔ ET LE TEXTE DE LA QUANTITÉ CHANGE DE SENS (R14).** *« Vérifie ta dosette »* — écrit en ft-v1105 pour un pot de poudre — est **absurde devant un Big Mac**. La phrase devient : *« 232 g est le poids de la portion publiée par McDonald's. Si tu n'as pas tout mangé, mets ton poids. »* *Un comportement copié d'un contexte à un autre peut devenir faux.*

**⭐ AUCUN NOUVEAU MÉCANISME (R13/R2)** : le chargeur, la recherche et le remplissage du formulaire sont **ceux de CIQUAL** ; seule la table change. Une **4ᵉ source** dans la liste de propositions, pas un 4ᵉ chemin. ⛔ Elle passe **avant** le générique — l'inverse du choix fait pour les bananes, et c'est voulu : *qui tape « big mac » ne cherche pas « un hamburger en général »*. ⛔ **4 propositions et non 6** : occuper l'écran de fast-food quand on tape « poulet » serait un remède pire que le mal.

**⚠️ ET UN `_esc is not defined` A FAIT DISPARAÎTRE TOUS LES ALIMENTS, alors que la recherche était parfaite.** La liste entière plantait au rendu, donc **plus une seule proposition** — ni marque, ni CIQUAL, ni journal. *Une erreur dans l'affichage d'une source neuve casse l'affichage de toutes les autres.* ⚠️ Au passage, le projet porte **cinq fonctions d'échappement sous cinq noms** (`_escIdea`, `_escFood`, `_escNote`, `_souvEsc`, `_obsEsc`) : un défaut **R2 ouvert**, noté, pas corrigé ici.

**📣 RÈGLE D'OR #11 — POINTS 2 À 5, PAS DE POP-UP, et c'est argumenté.** Une **section neuve** apparaît dans la liste, que personne n'ira chercher en tapant « big mac » puisque ça ne marchait pas hier → **point rouge** `fastfood-marques`. Mais **rien n'est à faire** et **aucun repère n'a bougé** : la section s'ajoute au-dessus des génériques, le champ où l'on tape ne se déplace pas. ⛔ Une pop-up dirait *« vos recherches de fast-food ne trouvaient rien »* — **une alarme rétroactive sur un trou qu'on vient de combler** (R25). ⭐ Et il y a **beaucoup à expliquer** (d'où viennent ces chiffres, pourquoi certaines lignes portent un ⚠️, pourquoi on ne les cache pas) : c'est le travail de l'aide, pas d'une interruption. **Diapo du Guide sans image, exprès** — une capture figerait une liste de 27 produits qui va grandir.

**⚠️⚠️ ET L'AIDE DE ft-v1113 A DÛ ÊTRE CORRIGÉE : ELLE PROMETTAIT CE QUI VENAIT DE DEVENIR FAUX.** Elle disait, en toutes lettres, *« les noms sont GÉNÉRIQUES, jamais des marques : tu verras "Hamburger, de restauration rapide", pas "Big Mac" »*. **Livrée la veille, fausse le lendemain.** 👉 ***Une aide qui nomme un repère inexistant est pire qu'une aide absente, parce qu'on la croit*** — **8ᵉ fois pour la famille §31** de `BUGS.md`. Elle explique maintenant les **deux familles** de résultats et pourquoi elles ne disent pas la même chose. ⛔ Un témoin refuse désormais ces deux promesses dans la zone d'aide nutrition.

**⏭️ CE QUE ÇA NE FAIT PAS, ET IL FAUT LE LIRE** : 27 produits, c'est **McDonald's, Burger King, KFC, Quick, Domino's** — et rien d'autre. Un produit absent se note toujours au **code-barres** ou à la **photo de l'étiquette**, qui restent les chemins les plus sûrs (**R33**, l'échelle des sources). ⚠️ Et je ne peux **pas** vérifier ces valeurs moi-même : elles viennent du classeur de Michel, l'app **le dit** à chaque ligne, et c'est tout ce qu'on peut honnêtement promettre.

Tests : **parcours 2554/2554** (+26, blocs **CCXXII** et **CCXXII bis**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin qui porte la décision de Michel** : la ligne douteuse doit être **PROPOSÉE** et **dire ce qui cloche** — pas écartée. ⭐⭐ **Et celui qui porte le risque est celui de R4** : après avoir pris un produit signalé et l'avoir ajouté, l'**entrée enregistrée** doit encore porter le doute (c'est lui qui a trouvé le trou de la liste blanche). ⭐ **Une REPRODUCTION exacte** : 232 g de Big Mac doivent redonner **530 kcal · 27 g** — *si ce témoin cessait un jour de retomber sur les chiffres publiés, c'est la base qui serait fausse, pas l'affichage.* ⛔ **Et deux contrôles n'existent que pour empêcher les autres d'être verts sur du vide** : la base doit être **chargée**, et les **deux populations** doivent exister (des lignes sûres **et** des lignes signalées) — *si toutes portaient un doute, « la ligne douteuse est proposée » serait vrai sans rien prouver.* ⛔ Non-régression mesurée : « riz » et « banane » ne ramènent **aucun** fast-food. ⚠️ **Michel doit vérifier sur Safari/iPhone** : ce conteneur n'a que Chromium. Fichiers : `app.js`, `data/marques.json`, `tools/marques.py`, `constants.js`, `screens.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1114. |

**ft-v1113 — 🍔 LES MOTS QU'ON DIT ATTEIGNENT ENFIN LES ALIMENTS QU'ILS NOMMENT** — Michel : *« il n'y a pas de fast food ? »*, puis *« vas-y fais les synonymes et Mac Donald, avec les sandwichs qui vont avec »*.

**⛔⛔ MESURÉ DANS LA VRAIE RECHERCHE, ET LE CONSTAT EST TÊTU** : `coca` ne rendait **RIEN** alors que **« Cola, sucré »** est dans le fichier — ***une lettre d'écart***. `soda` rien, alors que **94** « Boisson gazeuse… » y sont. `mcdo`, `macdo`, `fast food` rien, alors que **6 aliments « de restauration rapide »** y sont (5 burgers + milkshake), plus 13 frites, 7 nuggets, 26 pizzas, kebab, wrap, hot-dog, panini, donut. 👉 ***La donnée est là, la porte n'existe pas.***

**⚠️⚠️ ET LE TROU EST INVISIBLE AU BUREAU, BÉANT À LA SALLE** : avec du réseau, la recherche Open Food Facts finit par rattraper le coup — donc **personne ne voit le défaut en testant chez soi**. Hors ligne ou en 4G faible, on n'a **rien**, alors que l'aliment est **dans le téléphone**. *C'est la règle d'or #4 qui se joue ici, pas du confort.*

**⭐ R2 : LA RECHERCHE NE CHANGE PAS D'UNE LIGNE** — c'est la **REQUÊTE** qu'on traduit avant de la lancer (`FOOD_SYNONYMES` + `_foodSynonymes`, un seul propriétaire). Le classement, le « tous les mots doivent être présents », la tolérance aux accents : tout est inchangé, et un témoin de non-régression le vérifie (`riz`, `poulet`, `banane`, `cola`).

**⛔⛔ ON RÉPARTIT, ON N'EMPILE PAS — et c'est mesuré, pas esthétique.** En jouant les requêtes l'une après l'autre, `mcdo` rendait **six sandwichs** et coupait les frites et les nuggets à la limite d'affichage. Or ***qui tape « mcdo » compose un MENU*** : un tour à la fois — un sandwich, des frites, des nuggets, puis on recommence.

**⭐ `light` ET `zero` : UN GAIN SANS CONTREPARTIE, ET C'EST MESURÉ AVANT** — ces deux mots n'existent dans **aucun** des 3 484 noms (la table dit « avec édulcorants »). Les mapper ne pouvait donc casser **aucune** recherche qui marchait. *On vérifie qu'un ajout est gratuit avant de l'appeler gratuit.*

**⛔⛔ `tacos` N'EST PAS MAPPÉ, ET C'EST UN TÉMOIN À PART ENTIÈRE** : il n'est pas dans la table, et lui coller un kebab serait **inventer**. *On dit qu'on ne l'a pas plutôt que de servir autre chose* (**R29**). Un second témoin vérifie qu'il n'entre pas dans la table de synonymes — le retrait est **figé**, pas seulement décidé (**R30**).

**⚠️⚠️ ET LA VRAIE LEÇON DE LA VERSION EST UNE ERREUR À MOI, QUE MICHEL A CORRIGÉE : « bien sûr que si tu as accès à internet ».** J'avais refusé d'écrire les macros d'un Big Mac en disant *« je n'ai pas accès à internet »*. **C'était faux** : la recherche web fonctionne. ⛔ **Ce qui est bloqué par le proxy (403 vérifié trois fois)** est `openfoodfacts.org`, `mcdonalds.fr`, `informationsnutritionnelles.fr` — je peux donc recevoir un **résumé** de recherche, jamais **lire** une table publiée.

**⛔⛔ LA DÉCISION N'A PAS CHANGÉ, SA JUSTIFICATION EST DEVENUE UNE MESURE.** Même question posée **deux fois** :
- **1ʳᵉ réponse** : 510 kcal · **37 g** de protéines · 41 g de glucides · 26 g de lipides
- **2ᵉ réponse** : **580 kcal** · **25 g** de protéines · 45 g de glucides · **34 g** de lipides
— et la seconde **se contredit elle-même** (580 kcal pour 220 g, mais « 257 kcal/100 g » = 565). 👉 ***Un résumé de moteur de recherche n'est pas une source : c'est le bas de l'échelle de R33, et deux réponses incohérentes le prouvent mieux que n'importe quel principe.*** ⭐ *Une justification fausse pour une décision juste reste à corriger* : sans la remarque de Michel, le code aurait gardé une raison inexacte, et le suivant l'aurait crue.

**⭐ LE CHEMIN HONNÊTE POUR SON BIG MAC, ET IL EXISTE DÉJÀ** : taper `mcdo` → **« Hamburger, de restauration rapide »** (251 kcal/100 g, table nationale) → mettre **le poids de son burger**. Un Big Mac fait ~220 g → ~550 kcal, ce qui **tombe entre les deux réponses de recherche**. *La valeur vient de la table, le poids vient de la personne, rien n'est inventé.* Pour l'exact, le **calibrage à la main** de ft-v1110 est fait pour ça — les valeurs sont affichées en restaurant.

**📣 RÈGLE D'OR #11 — POINT ROUGE + AIDE `?` + AIDE DÉTAILLÉE, pas de pop-up.** ① Il y a bien quelque chose à **découvrir** : des mots qui ne marchaient pas marchent (personne ne réessaie un mot qui a échoué une fois). ② Mais **rien à faire** et **aucun repère déplacé** : la recherche a la même tête. ⛔ Une pop-up dirait *« vos recherches ne trouvaient rien »* — une alarme rétroactive (**R25**). ⭐ Ce que l'aide porte est ce qu'on ne devine pas : **les noms sont génériques, pas des marques**, et **`tacos` n'y est pas**.

**⏭️ CE QUI RESTE OUVERT, DIT PLUTÔT QUE SOUS-ENTENDU** : `tacos` (absent de la table) · les **poids de portion** des produits de marque (un Big Mac fait ~220 g, mais je ne peux pas le sourcer d'ici) · et une éventuelle base de marques, qui demanderait une **source lisible**, donc un accès que ce conteneur n'a pas. ⚠️ **Safari/iPhone non vérifié** (Chromium seulement).

Tests : **parcours 2527/2527** (+13, bloc **CCXXI**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin qui porte la version est « une lettre d'écart »** (`coca` → Cola). ⛔⛔ **Et celui qui dit ce qu'on REFUSE de faire en est un à part entière** : `tacos` doit rendre **zéro résultat**, et un second vérifie qu'il n'est pas dans la table de synonymes. ⛔ **Deux témoins gardent l'honnêteté du raccourci** : aucun nom rendu ne contient une marque, et **chaque** résultat de `mcdo` dit ce qu'il est (« de restauration rapide », « frites », « nuggets »). ⛔ Un contrôle ouvre le bloc (la base est-elle chargée ?), sinon les treize suivants seraient verts sur du vide. Fichiers : `app.js`, `screens.js`, `coach.js`, `constants.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1113. |

**ft-v1112 — 🔢 UNE SEULE PRÉCISION POUR LE POUR-100 g (six endroits, quatre comportements)** — Michel, après le calibrage à la main : *« ça va être comme ça sur tous les produits, c'est chiant ? »*. **La réponse est non — mais la vérification a trouvé bien pire que sa question.**

**⭐ LA RÉPONSE À SA QUESTION, CHIFFRÉE** : **3 484 aliments** sont embarqués dans l'app avec leurs valeurs pour 100 g (aucun réseau) · le **code-barres** remplit les produits emballés dont la fiche existe · la **photo de l'étiquette** fait déjà le travail du calibrage quand elle n'existe pas. **La saisie à la main est le dernier recours, pas la règle** — son pot est un cas où la fiche publique est trouée.

**⛔⛔ ET VOILÀ CE QUE LA VÉRIFICATION A SORTI : SIX ENDROITS construisent le pour-100 g, QUATRE l'arrondissaient à l'entier.** Le code-barres Open Food Facts, la recherche Open Food Facts, la base CIQUAL, et **les calories** de la photo d'étiquette. Seuls le calibrage à la main (ft-v1111) et les *macros* de la photo gardaient la décimale. *Six écritures de la même idée, quatre comportements — la seule question était quand on s'en apercevrait* (**R2**).

**⛔⛔ LE PLUS COÛTEUX EST LA BASE EMBARQUÉE, CELLE QUI SERT LE PLUS** : `data/ciqual.json` **CONTIENT** les décimales, et l'app les jetait **à la lecture**. Mesuré : **3 298 aliments sur 3 484** portent au moins une décimale, et **1 159 ont une macro entre 0 et 1 g/100 g** — arrondie, elle devient **0** ou **1**, soit **100 % d'erreur sur cette macro**. ⭐ Vérifié **par la vraie fonction** sur la salade de céleri rémoulade : **0,9 / 3,1 / 10,2** conservés là où l'ancien code rangeait **1 / 3 / 10**.

**⛔ ET LA PHOTO D'ÉTIQUETTE EST LE CAS LE PLUS PUR DE R4** : le serveur demande **explicitement** au modèle *« garde 1 decimale si presente »*… et l'app jetait les **calories** à l'arrivée. *L'information était produite, transmise, puis détruite au dernier mètre.*

**⭐ ET ÇA NE CHANGE RIEN À L'ÉCRAN** : `_qtyRescale` arrondit déjà les 4 champs à l'entier au moment de les écrire. **La décimale ne sert qu'à ce qui est CONSERVÉ et re-multiplié** — c'est-à-dire exactement là où l'erreur se propageait.

**⚠️⚠️ C'EST R8 (LA JUMELLE) POUR LA 5ᵉ FOIS CETTE SEMAINE, ET DANS SA FORME LA PLUS GÊNANTE** : le correctif de la **veille** (ft-v1111) avait été posé sur **1 endroit sur 6**, et **pas sur le plus utilisé**. *J'avais corrigé le chemin que je venais d'écrire, pas celui dont tout le monde se sert.*

**⚠️⚠️ ET DEUX TÉMOINS EXISTANTS ONT ROUGI — LES DEUX ÉTAIENT DES ATTENDUS CALÉS SUR L'ARTEFACT QU'ON VENAIT DE RETIRER.** ① **CCXIV** : la capture de Michel disait **156 kcal** pour 40 g ; la fiche porte **388,5** kcal/100 g, que l'ancien code arrondissait à **389 AVANT** de multiplier (389 × 0,4 = 155,6 → 156). La vraie valeur est **388,5 × 0,4 = 155,4 → 155**. ⭐ *Ce que le témoin garantit n'a pas changé* : les **35 g de protéines** restent reproduits au chiffre près. ② **CII** : le blanc d'œuf cru titre **10,9 g/100 g** ; ancien **10,9 → 11 → 5,5 → 6**, nouveau **5,45 → 5**. 👉 ***Un attendu calé sur un artefact d'arrondi rougit le jour où on retire l'artefact — c'est le témoin qu'on corrige, pas le code.*** ⛔ Et les deux ont été **vérifiés par l'arithmétique sur les vraies données**, pas déduits : le réflexe inverse (« mon changement a cassé quelque chose, je recule ») aurait annulé une version juste.

**📣 RÈGLE D'OR #11 — RIEN, et c'est argumenté.** Aucun repère ne bouge, rien n'apparaît, rien n'est à faire. Ce qui change est **la précision de ce qui est enregistré**, invisible à l'écran par construction. ⚠️ **Un seul effet perceptible, et il faut le dire** : un chiffre affiché peut bouger **d'une unité** (156 → 155) parce qu'un double arrondi a disparu. *Annoncer ça en pop-up ferait douter d'un chiffre qui vient de devenir plus juste* (**R19/R25**) ; le journal l'explique si quelqu'un le remarque.

**⏭️ INCHANGÉ ET DIT** : les lignes **déjà enregistrées** gardent leur `per100` arrondi — on ne réécrit pas l'historique de quelqu'un (**R29**) ; elles se corrigeront à la prochaine reprise du produit. ⚠️ Et **Safari/iPhone reste non vérifié** (Chromium seulement).

Tests : **parcours 2509/2509** (+8, bloc **CCXX**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin de CONTRÔLE passe avant celui qui porte la version** : *la base embarquée porte-t-elle vraiment des décimales ?* — sans lui, « la décimale est conservée » serait vrai **sans rien prouver**. ⭐ **Et le témoin central mesure un aliment dont une macro est SOUS 1 g**, avec un second témoin qui vérifie que c'est bien le cas : *un correctif dont on ne teste que le cas confortable ne teste pas la raison pour laquelle on l'a fait.* ⛔⛔ **Un témoin permanent refuse qu'un 7ᵉ chemin ré-arrondisse** — c'est la rechute à empêcher, et il est doublé d'un contrôle qui vérifie qu'il **trouve** bien les constructions (sinon il serait vert en ne lisant rien). ⚠️ **Et mon clone local s'est rembobiné TROIS fois aujourd'hui**, emportant une fois des corrections non commitées : *ce qui n'est pas poussé n'existe pas* — on committe au fur et à mesure. Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1112. |

**ft-v1111 — 🔢 LE CALIBRAGE GARDE LA DÉCIMALE DE L'ÉTIQUETTE** — Michel envoie enfin **le tableau complet** de son pot, lisible : **388,5 kcal · 88 g de protéines · 2,8 g de glucides · 3,3 g de lipides pour 100 g**, et **116,6 / 26,4 / <1 / 1,0 pour 30 g**.

**⭐ LE CALIBRAGE DE LA VEILLE TOMBE JUSTE, MESURÉ SUR SES VRAIS CHIFFRES** : 30 g rendent **117 kcal · 26 g de protéines · 1 · 1**, contre 116,6 / 26,4 sur l'étiquette. *La version d'avant était bonne — c'est en la vérifiant sur les vraies valeurs qu'un défaut est sorti.*

**⛔⛔ ET LE DÉFAUT EST DANS CE QUI EST CONSERVÉ, PAS DANS CE QUI EST AFFICHÉ** : `2,8` et `3,3` étaient **stockés arrondis à 3**. Sur une poudre de protéine, **invisible**. Ailleurs, destructeur : une huile à **0,4 g de glucides pour 100 g** aurait vu sa valeur devenir **0** — *l'app effaçant un chiffre que la personne venait de recopier sur son étiquette*. 👉 ***On transcrit ce que la personne a LU, on ne l'arrondit pas à sa place*** — c'est la leçon de **ft-v1100** (transcrire, pas décider) appliquée à une saisie manuelle. ⭐ Et ça ne change **rien** à l'écran : `_qtyRescale` arrondit déjà les 4 champs à l'entier au moment de les écrire. *La décimale ne sert qu'à ce qui survit.*

**⭐⭐ ET L'ÉTIQUETTE TRANCHE UNE QUESTION LAISSÉE OUVERTE DEPUIS ft-v1105** : elle déclare elle-même **« SERVING SIZE : 30 G / PORTION : 30 G »**. Les 40 g qui produisaient ses **156 kcal / 35 g** ne venaient donc **PAS** de la portion déclarée par la fiche produit — c'était bien une **valeur inventée** par l'estimation. ⚠️ **Mon explication de ft-v1105 ne s'applique donc pas à son cas** : le mécanisme décrit là-bas est réel et mesuré, mais ce n'est pas celui qui l'a touché. *La bonne nouvelle est que j'avais écrit, ce jour-là, ne pas savoir quel chemin avait produit son entrée — c'est la seule raison pour laquelle il n'y a rien à défaire aujourd'hui.*

**⚠️ ET UN ROUGE VENAIT DE MOI, PAS DU CODE** : le témoin réclamait **113 kcal**, calé sur mon chiffre **provisoire** de 375 kcal/100 g ; j'avais remplacé la fixture par les vraies valeurs **sans changer l'attendu**. 👉 ***Changer une fixture sans changer son attendu produit un rouge qui ACCUSE LE CODE*** alors qu'il ne décrit qu'un chiffre périmé dans le test. *Le réflexe de « corriger le code » devant ce rouge-là aurait cassé une version juste.*

**📣 RÈGLE D'OR #11 — RIEN, et c'est argumenté.** Aucun repère ne bouge, rien n'apparaît, rien n'est à faire : la seule chose qui change est **la précision de ce qui est enregistré**, et elle ne se voit sur aucun écran. Le bouton, son aide `?`, son aide détaillée et son point rouge datent de la veille et **couvrent déjà le sujet** (**R19/R25**).

**⏭️ INCHANGÉ ET DIT** : les lignes **déjà enregistrées** ne se corrigent toujours pas (le calibrage vit dans l'écran d'ajout) ; ⚠️ et **Safari/iPhone reste non vérifié** — le conteneur n'a que Chromium.

Tests : **parcours 2501/2501** (+2, bloc **CCXIX**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin qui porte la version n'est PAS celui du pot de Michel** — sur sa poudre l'arrondi ne se voyait pas. C'est celui de **l'huile à 0,4 g/100 g**, la valeur qui aurait disparu : *un correctif dont on ne teste que le cas qui l'a déclenché ne teste pas la raison pour laquelle on l'a fait.* ⭐ Et la fixture emploie la **virgule française** (`388,5`, `2,8`, `3,3`), exprès : c'est ainsi que Michel les tapera, et c'est ce qu'un témoin existant avait déjà attrapé la veille sur mes champs en `type="number"`. Fichiers : `app.js` (`_calAppliquer` uniquement), `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1111. |

**ft-v1110 — ⚖️ UN PRODUIT DEVIENT CALIBRABLE À LA MAIN** — Michel, **4ᵉ passe sur le même pot d'isolat** : *« il y a toujours le problème avec ma prot… comment on peut résoudre ce problème »*. **Le mot qui compte est encore « toujours », et cette fois il a une cause structurelle.**

**⛔⛔ MESURÉ AVANT DE CODER, ET CE N'ÉTAIT PAS UN GARDE-FOU MANQUANT** : sa ligne porte `per100 = null`, et **AUCUN champ de l'application ne permettait de saisir un pour-100 g à la main**. Ce chiffre n'arrivait **que** d'un scan ou de la base CIQUAL. 👉 ***Un produit dont la fiche Open Food Facts est incomplète était donc INCALIBRABLE À VIE*** — et sa vieille ligne fausse était re-proposée **en tête** de « Mes aliments » (mesuré : *« Iso zero protein · 156 kcal · P 35 »*), un tap et l'erreur recommençait.

**⛔⛔ ET C'EST LE PROCÈS DES TROIS VERSIONS PRÉCÉDENTES.** ft-v1103 (la masse impossible), ft-v1104 (la valeur qui se recopie), ft-v1105 (la portion d'un tiers) ont toutes **ajouté une ALERTE**. Aucune n'a rendu la personne capable de **RÉPARER** le produit. *Un garde-fou dit que c'est faux ; il ne corrige pas.* **Trois versions à décrire le symptôme de mieux en mieux, zéro à donner l'outil.**

**⭐⭐ ZÉRO NOUVEAU CALCUL, ET C'EST LE POINT DE CONCEPTION (R13/R2)** : la base CIQUAL appelle **déjà** `_offRemplirFormulaire` avec un produit **vide**. Une saisie à la main, c'est *exactement ce chemin-là* avec des valeurs tapées au lieu d'être lues dans une table — même bloc quantité, même recalcul, même `per100` enregistré. *Le trou n'était pas dans la machinerie, il était dans la porte d'entrée.*

**⭐ MESURÉ SUR SON ÉTIQUETTE** (88 g de protéines / 100 g) : **30 g rendent 26 g de protéines**, le `per100` **descend jusqu'à la donnée** (**R4**), et ⭐⭐ **la fois d'après la proposition le porte déjà** — *c'est le produit qui est réparé, pas le repas*, et c'est la seule chose qui répond au mot « toujours ».

**⛔ LA PROVENANCE NE MENT PAS (R33)** : ces valeurs s'enregistrent comme venant de l'**étiquette**, jamais de « off ». `origine` devient un paramètre de `_offRemplirFormulaire`, **défaut inchangé** pour les quatre appelants existants. *Une provenance fausse est pire que pas de provenance : elle se présente comme un fait vérifiable.*

**⛔ ET LA RÈGLE PHYSIQUE DE ft-v1103 EST RÉUTILISÉE, PAS RÉÉCRITE** : extraite sur des **valeurs** au lieu de champs (`_masseImpossibleVals`, un seul propriétaire). Elle attrape l'erreur la plus probable ici — **recopier la colonne « par portion » dans la colonne « pour 100 g »** : 120 g de macros pour 100 g de produit est refusé, **rien n'est calibré au passage**, et le texte **dit quoi faire au lieu d'accuser** (**R29**). Un calibrage **vide** est refusé aussi : *un produit « calibré » à zéro serait une fausse certitude propagée à tous les repas suivants.*

**⚠️⚠️ ET UN TÉMOIN EXISTANT A ATTRAPÉ UN VRAI DÉFAUT DE MON CODE — c'est la plus belle chose de la version.** Mes quatre champs étaient en `type="number"`, qui **filtre la virgule** sur un clavier français : *« 62,5 »* y devient vide ou *« 625 »* selon le navigateur, **en silence**. C'est le défaut déjà payé sur **22 champs** de l'app, et le 23ᵉ aurait recommencé. 👉 ***Un garde-fou écrit après un vrai bug vient de servir à celui qui l'avait écrit*** — et il n'a rien coûté à personne, contrairement au bug d'origine.

**📣 RÈGLE D'OR #11 — POINT ROUGE + AIDE `?` + AIDE DÉTAILLÉE, pas de pop-up.** ① Il y a bien quelque chose à **découvrir** : un bouton neuf, sur un écran utilisé tous les jours, que personne n'ira chercher seul → le point rouge se justifie. ② Mais **rien n'est à faire tant qu'un produit ne pose pas problème**, et **aucun repère n'a bougé** : le bouton s'ajoute *sous* les macros. ⛔ Une pop-up dirait *« vos produits pouvaient rester faux à vie »* — une **alarme rétroactive** sur un trou qu'on vient de combler (**R25**). ⭐ Ce que l'aide porte est ce qu'on ne devine pas : **c'est la colonne « pour 100 g », pas « par portion »**, et ces valeurs sont marquées comme venant de **ton** étiquette.

**⏭️ CE QUE ÇA NE FAIT PAS, ET IL FAUT LE LIRE** : ⛔ **les lignes DÉJÀ enregistrées ne se corrigent pas** — le calibrage vit dans l'écran d'**ajout**, pas dans la modale de modification. Michel devra donc calibrer **à son prochain ajout** ; ses anciennes lignes fausses restent fausses (l'app les signale depuis ft-v1103, elle ne les répare pas). *C'est une décision de périmètre, pas un oubli* : la porte d'entrée qui manquait est celle de l'ajout, et l'ouvrir aux deux endroits doublait la surface pour un gain qui n'a pas été mesuré. ⚠️ **Et je n'ai pas pu vérifier sur Safari/iPhone** : le conteneur n'a que Chromium.

Tests : **parcours 2499/2499** (+13, bloc **CCXIX**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin qui porte la version n'est pas « 30 g donnent 26 g » — c'est « LA FOIS D'APRÈS »** : la proposition doit **porter son pour-100 g**, sinon on aurait réparé un repas et pas un produit. ⛔ **Un contrôle ouvre le bloc** : aucun pour-100 g ne doit être connu au départ, sinon les douze suivants mesureraient un formulaire déjà rempli par autre chose. ⛔⛔ **Et trois témoins portent les REFUS**, pas les réussites : la colonne « par portion » recopiée, le fait que **rien n'est calibré** quand on refuse, et le calibrage vide. ⚠️ **J'ai retiré de mon propre bloc une branche qui ne pouvait pas s'exécuter** (elle appelait `reprendreAliment`, qui n'existe pas — le vrai nom est `_afSuggPrendreLocale`) : *une branche gardée par `typeof` qui ne s'exécute jamais est une sonde qui ne mord pas*, exactement la faute que ce bloc devait éviter. Fichiers : `index.html`, `app.js`, `screens.js`, `coach.js`, `constants.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1110. |

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
