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

> **Version actuelle : `ft-v1090`** (prochaine : `ft-v1091`). Historique complet (ft-v128→574 + gouvernance
> antérieure, **+ ft-v575→632 déménagées le 28/07**) → **`docs/JOURNAL-ARCHIVE.md`**. Le n° de cache se lit dans `sw.js` (`const CACHE='ft-vNN'`).
> **Entretien** : ajouter chaque nouvelle version ICI (règle d'or #12). Quand ce journal récent dépasse
> **20** entrées, déménager les plus anciennes dans `docs/JOURNAL-ARCHIVE.md` (couper/coller, rien
> supprimer). `python3 tools/check_regles.py` le signale automatiquement.
> ⚠️ **L'ARCHIVE S'AJOUTE, ELLE NE SE RÉÉCRIT JAMAIS** (leçon du 04/08 : un script d'archivage l'a
> **écrasée** — 297 entrées perdues, découvertes 2 jours plus tard **par hasard**, parce que rien ne
> la surveillait). Le même `check_regles.py` refuse désormais toute entrée disparue. **Toujours
> AJOUTER à la fin, jamais ouvrir le fichier en écriture**, et lire le diff avant de committer :
> un `-1793` dans le numstat n'est pas un détail.

**ft-v1089 — 🔌 ON A APPUYÉ SUR LES 166 BOUTONS DE L'APP, UN SEUL PLANTAIT** — Michel : *« lis le code et trouve des incohérences, parce que je ne suis pas développeur, moi non plus je risque pas de lire le code pour voir si il y a des trucs qui vont pas »*.

**⛔⛔ ON N'ÉCRIT PAS D'AVIS SUR LE CODE, ON ÉCRIT DES DÉTECTEURS.** La journée venait de montrer que **2 lignes d'audit sur 4 étaient fausses ou périmées** : un avis sur du code se périme, une mesure se rejoue. Sept familles cherchées, toutes tirées de `BUGS.md` et des règles.

**⭐⭐ ET LE DÉTECTEUR QUI A TOUT TROUVÉ NE LIT PAS LE CODE — IL APPUIE.** 166 boutons sans argument, joués dans un vrai navigateur : **165 marchent, 1 plante**. Le bouton **« 🔌 Tester la connexion »** (Profil → Admin) s'arrêtait à sa **première ligne** — `getElementById('setup-dot').className` sur un élément **retiré du HTML**. `Cannot set properties of null`, et donc **aucun test, aucun message, rien**. *Pour la personne, le bouton était mort ; pour le reste de l'app, tout allait bien.*

**⚠️ CE QUI RENDAIT LE DÉFAUT INVISIBLE EST À DEUX LIGNES DE LÀ** : sa voisine `updSetup()` lit le **même** élément avec un `if(!d)return;`. *Le même trou, deux lectures, une seule protégée* — donc aucune erreur ailleurs, aucun test rouge, et rien à voir tant qu'on n'appuie pas.

**⛔ POURQUOI L'ÉLÉMENT AVAIT DISPARU, CHERCHÉ AVANT DE RÉPARER (R30)** : la pastille de statut a été retirée du HTML — **son CSS `.sdot` est resté, orphelin** — et une carte **« Santé du système »** fait ce test bien mieux depuis (elle appelle vraiment `?test=1`). 👉 On **garde** le bouton et on le rend fonctionnel : son vrai retour a toujours été le **toast**, pas la pastille. *Le supprimer serait une décision produit, pas un correctif* (R29).

**⭐⭐ LE VRAI LIVRABLE N'EST PAS LE CORRECTIF, C'EST LE BALAYAGE DEVENU PERMANENT** (bloc **CXCIV**). Il rejouera les 166 boutons à chaque livraison. ⛔ Il ne teste que les appels **sans argument** (on ne saurait pas quoi passer) et **saute tout ce qui pourrait détruire, envoyer ou payer** — liste noire volontairement large. ⚠️ **Et le NOMBRE est épinglé** : sans ça, un témoin qui ne trouverait plus aucun bouton passerait au vert en ne mesurant rien.

**⚠️⚠️ CE QUE LES AUTRES DÉTECTEURS ONT RENDU — ET C'EST SURTOUT DU VIDE, ce qui est une bonne nouvelle qu'il faut savoir dire** : **1473 fonctions déclarées, 1454 atteignables**, **19 orphelines** — dont **5 faux positifs** (appelées par `setTimeout` ou un écouteur `load` : `_dbfRattraper`, `_gardienRetroDiffere`, `_logErr`…), **2 retraits volontaires documentés** (`openPlateCalc`, l'anniversaire archivé) et **~7 vraies fonctions mortes**, toutes inoffensives. **Zéro bouton pointant vers une fonction inexistante.** Et les 3 « données mortes » étaient des **faux positifs de mon propre compteur** — `S.lastIndex` venait de `_TEMPO_SECONDES.lastIndex`, *un bout de mot pris pour un champ*.

**⭐ UN CONTRE-EXEMPLE UTILE AU PASSAGE** : `S.halo` est comparé à trois valeurs ('blue', 'none', 'on') — et c'est **exemplaire**, pas un défaut : il **migre** l'ancien nom (`if(S.halo==='blue')S.halo='on'`) puis **normalise tout le reste**. *C'est précisément ce qui manquait à `S.gender` et qu'on a corrigé ce matin.*

**📣 RÈGLE D'OR #11 — RIEN, ET C'EST ARGUMENTÉ.** Un bouton qui ne faisait rien se remet à fonctionner : il n'y a **rien de neuf à découvrir**, rien à apprendre, aucun repère déplacé. Annoncer « le bouton marche à nouveau » supposerait qu'on ait annoncé qu'il était cassé.

Tests : **parcours 2138/2138** (+3, bloc **CXCIV**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le contrôle négatif est le balayage lui-même** : avant correctif il imprime `testConn() → Cannot set properties of null`, après il rend **166/166**. ⛔ **Aucune ligne de l'app touchée en dehors des deux gardes** — la chasse était en lecture seule. Fichiers : `setup.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1089. |
**ft-v1090 — 🩹 « null » DANS LE CHAMP KG : LE CORRECTIF DE LA VIRGULE AVAIT RETIRÉ LA PROTECTION SANS METTRE LA SIENNE** — Michel, capture du compte d'Eline : son Pec Deck affichait **`10 reps × null kg`** sur deux séries.

**⛔⛔ ET C'EST SA LECTURE QUI A TROUVÉ LA CAUSE, pas la mienne.** J'avais écrit honnêtement *« je ne sais pas comment ces séries ont été validées sans poids »*. Lui : *« ah bah non, Eline avait mis des valeurs — et si je dis pas de bêtises, c'est en mettant la virgule »*. ***Il avait raison, et le coupable est mon propre correctif du 30/08.***

**🔗 LA CHAÎNE, MAILLON PAR MAILLON — établie dans le code, pas déduite :**
① **ft-v1057** (*« la virgule décimale : 22 champs et un seul lecteur de nombre »*) fait passer CE champ de `type="number"` à **`type="text"`**… ⛔⛔ **en laissant `+this.value`**. Or ***`type="number"` était la SEULE chose qui le protégeait*** : le navigateur refusait la virgule, `.value` rendait `''`, donc `+'' = 0`.
② À partir de là, `+'62,5'` = **`NaN`**.
③ `persist()` fait `JSON.stringify`, et ***`JSON.stringify(NaN)` vaut `null`***.
④ Au rechargement, `value="${s.kg}"` écrit le mot **« null »** à l'écran.

**⚠️⚠️ SA VALEUR EST PERDUE, PAS MASQUÉE.** Elle a tapé un poids, il n'existe plus. ⛔ **On ne le devine pas à sa place** (**R29**) : le champ marche maintenant, elle peut le retaper si elle s'en souvient.

**⭐⭐ LA LEÇON VAUT PLUS QUE LE CORRECTIF, ET ELLE DEVIENT LA FAMILLE §30 DE `BUGS.md`** : ***un correctif qui retire un garde-fou sans mettre le sien fabrique un bug PIRE que celui qu'il répare***. Un champ simplement **oublié** garde son ancien comportement — imparfait mais stable. Celui-là a été **rendu plus fragile qu'avant**. 👉 *Le danger n'est pas dans ce qu'un correctif ajoute, il est dans ce qu'il ENLÈVE.* ⚠️ **Et le corollaire est un signal d'alerte concret** : se méfier d'un correctif qui annonce un **nombre** dans son titre (« 22 champs ») — *le nombre dit ce qui a été traité, jamais ce qui a été manqué*.

**⭐ LA JUMELLE CHERCHÉE (R8) EXISTAIT, ET ELLE ÉTAIT SAINE** : l'écran de séance rend `value="${set.kg||''}"` et lit par `numFR` depuis ft-v1057. *C'est le détail d'une séance PASSÉE qui n'avait reçu que la moitié du correctif.*

**⛔ ET UN CHAMP VIDÉ REND « JE NE SAIS PAS », JAMAIS 0.** Écrire 0 dirait *« elle a poussé zéro »*, ce qui est faux — et ce 0 partirait ensuite dans le volume, les records et le contexte de Milo comme s'il avait été mesuré.

**🩹 ET LE MÊME DÉFAUT EST CHERCHÉ CHEZ TOUT LE MONDE — demande de Michel, et elle était urgente.** *« Ce que j'ai eu moi les autres peuvent l'avoir aussi, faut absolument qu'on puisse vérifier le compte des autres utilisateurs. »* ⛔⛔ **Il a raison, et la raison est une DATE** : le défaut a vécu du **30/08** au correctif. ***Personne ne peut le remarquer seul*** — le champ affiche « null », ce qui ressemble à un bug d'affichage, pas à une donnée détruite. La route `setsCorrompus` **regarde** tous les comptes et rend, par personne, un **nombre**, une **date** et un **nom d'exercice** — le minimum pour pouvoir les prévenir.

**⛔⛔ ET CE QU'ELLE NE FAIT PAS EST OÙ VIVENT LES TÉMOINS** : **0 écriture de compte** · **ni charges, ni profil, ni santé** dans la réponse · **elle ne répare pas** (la valeur d'origine est perdue, seule la personne la connaît, **R29**) · une série **non faite** sans poids est normale et n'est pas comptée — *sinon l'outil accuserait tout le monde et on ne le croirait plus* (**R19**) · un compte **illisible** est annoncé, jamais compté comme sain · **jeton admin obligatoire**.

**⚖️ ET LA POLITIQUE DE CONFIDENTIALITÉ A DÛ SUIVRE, PARCE QU'ELLE ÉTAIT DEVENUE FAUSSE.** Michel : *« oui il faut être transparent […] au départ je t'ai dit que les données ne m'intéressaient pas, et plus le temps passe plus je remarque des petits bugs par-ci par-là […] si moi j'ai un bug les autres l'ont peut-être — eux vont se dire c'est pas grave, pour moi c'est grave. Et je ne vais surtout pas utiliser ces données, et encore moins les revendre. En plus c'est illégal. »* ⛔⛔ **Le défaut était écrit noir sur blanc** : la page promettait que les données servent *« **UNIQUEMENT** à faire fonctionner l'app pour toi »* — or on a lu les séances de **8 comptes** le matin même, et on livre l'après-midi un outil qui les ouvre tous. ***Une promesse qu'on ne tient plus est pire qu'une promesse qu'on n'a jamais faite.***

**⭐⭐ ET LA SECTION NE DIT PAS SEULEMENT « ON REGARDE », ELLE DIT LA RÈGLE QU'ON S'IMPOSE** : *le minimum nécessaire*, pas *tout ce qui est disponible* — avec le détecteur en exemple, et les données **sensibles** (sang, bilans, cycle) explicitement **hors du diagnostic technique**. ⛔ Plus le refus de revente **adossé au RGPD** et le droit de s'y opposer, avec l'adresse.

**⚠️ ET LE TÉMOIN QUI VA AVEC PROTÈGE UN ENGAGEMENT, PAS UN COMPORTEMENT.** *Un engagement peut disparaître d'une réécriture sans que rien ne plante* — c'est exactement le cas où plus rien ne le rattrape (**R30**). Il vérifie les 4 points, **que la vieille phrase ne revienne pas**, que la page reste lisible **hors ligne** (règle d'or #4 : une politique qu'on ne peut pas ouvrir n'informe personne) et que la **date** ait bougé.

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Un champ qui affichait un mot incompréhensible affiche un poids. Rien n'apparaît, rien à apprendre. ⚠️ *Et l'annoncer reviendrait à dire « le correctif d'avant-hier détruisait vos saisies » — ce que le journal dit, et qui n'a pas à interrompre les autres.*

Tests : **parcours 2133/2133** (+24, blocs **CXCIII · CXCV · CXCVI**) ⚠️ *mesuré sur mon arbre avant la fusion avec leur ft-v1089*, calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou, **noyau Milo 12/12**. ⭐ **La fixture EST sa séance** : série 1 renseignée, série 2 à `null`, série 3 **sans la clé `kg` du tout** — les deux formes que produit la chaîne. ⛔ **Le témoin ① existe pour que les autres mesurent quelque chose** : les 3 champs doivent être rendus, sinon « aucun null » serait vrai sur un écran vide. ⭐⭐ **Le témoin de l'ALLER-RETOUR est celui qui touche la cause** : il mesure `JSON.stringify`, pas la valeur en mémoire — sans lui on prouverait seulement que le champ n'affiche plus NaN, pas que la donnée **survit au rechargement**. ⭐⭐ **Et le dernier protège la RÈGLE, pas le cas** : aucun champ décimal en `type="text"` ne lit par `+this.value` — il rougira au prochain champ converti en texte dont on oubliera le lecteur de nombre, c'est-à-dire exactement ce qui est arrivé ici. **CONTRÔLE NÉGATIF, deux fois** : ① les gardes retirées, sa capture revient au caractère près — `["12","null","undefined"]` et « 62,5 » ressort en NaN ; ② le champ remis dans l'état de ft-v1057, le témoin de règle **nomme le coupable** (`updateSessSet(…,'kg',+this.value)`). 🧾 Famille **§30** de `BUGS.md`. Fichiers : `setup.js`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `Code.js`, `app.js`, `index.html`, `confidentialite.html`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1090. ⚠️ **16ᵉ collision, et elle porte sur DEUX choses** : session-A a publié SA ft-v1089 pendant ce travail *et* nommé son bloc de test **CXCIV**, déjà pris par le mien. Ma version devient **ft-v1090** et mes deux blocs glissent en **CXCV · CXCVI** — *un numéro de cache ne recule jamais, on ne renumérote pas le travail de l'autre, et deux blocs du même nom masqueraient une disparition future* (§25). |


**ft-v1088 — 🧹 LA SUITE DU LOT D'AUDIT — et l'un des quatre est RÉFUTÉ, pas corrigé** — Michel : *« vas-y continue »*.

**⛔⛔ ① LA PROJECTION DE FORCE NE REGARDAIT QUE LE SQUAT.** Le niveau se lisait sur `S.prs['Squat à la Barre']` **et sur rien d'autre**, avec des ratios écrits en dur. Mesuré sur 12 semaines depuis 100 kg : un **soulevé de terre à 180 kg** (2,25 × le poids de corps) était projeté à **+10,8 %** — *exactement comme un débutant total*. Idem pour un développé couché à 120 kg, et pour une femme qui ne squatte pas. ⛔ **Et l'indice 4 de la table était MORT** : la branche ne pouvait rendre que 0..3, donc le taux le plus prudent n'était **jamais** atteint. ⭐ **On réveille `getLevel` au lieu d'écrire une 3ᵉ échelle** (R13) : elle juge **par exercice**, **par sexe**, **corrigée par l'âge**, et couvre exactement le `BIG3`. ⚠️ **On a cherché pourquoi elle dormait avant de la promouvoir (R30)** : débranchée en ft-v385 parce que l'AFFICHAGE du niveau a quitté l'Accueil, pas parce qu'elle était fausse. **Résultat : 180 kg passe de +10,8 % à +2,4 %.** ⛔ **Sans aucun record du BIG3, rien ne change** : c'est un inconnu, pas une mesure.

**⛔⛔ ② « FEMME = FESSIERS » — une supposition là où la donnée existait.** Le générateur ajoutait une abduction et un hip thrust sur le seul test `gender==='F'`. Or `S.priorities` existe (Profil → Objectif), part au cloud et **atteint même Milo** — le générateur ne la lisait **nulle part** (**R4**). 👉 Une priorité déclarée décide désormais **quel que soit le sexe** : *un homme qui coche « Fessiers » reçoit enfin le hip thrust*, ce qui n'arrivait jamais. ⛔ **Et on ne retire rien à celles qui n'ont rien déclaré** : *changer ce que reçoivent les femmes qui n'ont rien demandé serait décider à leur place dans l'autre sens*. C'est un **arbitrage produit**, écrit dans `IDEES-FUTURES.md` plutôt que tranché ici (R29, **P4**).

**⭐⭐ ③ LA COURSE `_saveCoachMemory` : RÉFUTÉE PAR LA MESURE, ET C'EST LA BONNE ISSUE.** La consigne d'audit était explicite — *« à prouver ou réfuter par un test AVANT de toucher au code »*. Mesuré : **3 appels concurrents sont sérialisés** (la file `_memFile` de ft-v993 tient), un **échec réseau ne détruit pas** la mémoire existante, et le jeton de débrief a **déjà** deux propriétaires distincts (`_dbfFaits` séparé du Registre) — *« un débrief a été LIVRÉ » et « Milo a produit une mémoire » sont deux faits différents*, et c'est **écrit dans le code comme une décision**. 👉 **Aucune ligne modifiée** ; trois témoins figent la décision pour que personne ne la « répare » dans six mois (**R30**).

**⛔ ④ UNE ÉTAPE 1 QUI NE FINIT JAMAIS.** `beginnerJourney.phase` est posée à **1** et **rien, nulle part, ne l'avance** — une seule affectation dans tout le dépôt. Or le contexte de Milo annonçait *« Objectif : tenir 3 semaines »* **et** *« prépare-le/la à la suite du parcours »*. 👉 ***Trois mois plus tard, il redemandait de « tenir 3 semaines » à quelqu'un qui s'entraîne depuis douze, et le préparait à une suite qui n'existe pas.*** Un fait faux sur la personne, doublé d'une promesse intenable. ⭐ La `startDate` était **déjà stockée et lue par personne** (R4) : passé 3 semaines, Milo dit que l'objectif est derrière et **n'annonce plus aucune étape suivante**. ⛔ **On n'invente pas l'étape 2** — c'est une brique produit, elle est notée, pas construite.

**⚠️⚠️ ET MON TÉMOIN A ROUGI SUR DU CODE JUSTE — il attrapait sa propre négation.** Il cherchait *« tenir 3 semaines »* dans le contexte ; or la nouvelle branche dit à Milo *« **Ne lui redemande plus** de "tenir 3 semaines" »*. **Le motif matchait l'interdiction.** *C'est la 3ᵉ fois* (ft-v1006, ft-v1017) : **on cherche la CONSIGNE, pas les mots**. Re-visé sur `Objectif: tenir 3 semaines` — et un témoin de plus exige que la **négation soit présente**, sinon on « corrigerait » en supprimant la ligne, ce qui n'est pas la même chose.

**📣 RÈGLE D'OR #11 — RIEN, ET C'EST ARGUMENTÉ.** Quatre corrections invisibles : une projection plus juste, un exercice qui suit ce qu'on a coché, une phrase de Milo qui cesse d'être fausse. Rien de neuf à découvrir, rien à faire, aucun repère déplacé. ⚠️ **Un seul cas mérite d'être surveillé** : la projection d'un cycle de force **baisse** pour quelqu'un de costaud (elle était fausse, elle devient prudente) — si Michel le remarque, c'est le journal qui l'explique, pas une pop-up.

⚠️ **Livrée en ft-v1088 et non 1087** : session-B a publié la sienne pendant ce chantier — *14ᵉ collision, et un numéro de cache ne recule jamais*. Tests : **parcours 2135/2135** (⚠️ mesuré sur l'arbre **FUSIONNÉ** avec le ft-v1087 de session-B, pas sur le mien seul) (+11, bloc **CXCIII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐ **Les non-régressions sont ce qui rend le lot sûr** : sans record du BIG3 la projection est **inchangée au chiffre près** · une femme sans priorité garde exactement ce qu'elle avait · un homme sans priorité ne reçoit toujours rien. Fichiers : `tracking.js`, `log.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/SUIVI-AUDIT.md`, `docs/CONTEXTE-ACTUEL.md`, `IDEES-FUTURES.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1088. |
**ft-v1087 — 🛡️ UN RECORD PLUS VIEUX QUE L'HISTORIQUE DE SON EXERCICE EST INTOUCHABLE** — Michel, deux heures après la livraison de l'outil, aperçu à l'appui : **6 records à corriger**, dont 4 en baisse. C'est en lisant SES lignes que le trou est sorti — pas en relisant le code.

**⛔⛔ LA RÈGLE ③ ÉTAIT JUSTE, ET TROP ÉTROITE.** Elle protégeait *« aucune séance DU TOUT »*. Or son **`Développé Décliné`** porte un record du **14/06** — et ***l'app est née le 17 juin***. La séance qui l'a fait ne **peut pas** être dans l'historique : elle vient d'un import ou d'une saisie. Mais l'exercice, lui, a des séances **plus récentes** → il échappait à la protection et tombait dans la liste rouge. 👉 ***Appliquer aurait effacé un vrai record*** — exactement le dégât que l'outil est censé empêcher.

**⭐⭐ ET LE DISCRIMINANT ÉTAIT DANS LA DONNÉE, PAS DANS UN JUGEMENT.** L'app connaît la **plus ancienne apparition** de chaque exercice dans l'historique. *Un record antérieur à cette date est **invérifiable par construction*** — comme un record **sans date**. Les deux sont désormais gardés tels quels. ⚠️ **Et la plus ancienne apparition se compte sur TOUTES les séries, échauffement compris** : on ne cherche pas une performance ici, on cherche **depuis quand l'app voit cet exercice** — un échauffement le prouve autant qu'une série de travail.

**⛔ LA PROTECTION NE VAUT QUE POUR UNE BAISSE, et c'est ce qui l'empêche de tout bloquer.** Une **montée** est prouvée par l'historique lui-même : elle ne détruit rien. Mesuré : son `Pec Deck`, dont le record est **tout aussi ancien** que le Décliné, **monte toujours** à 100 kg. *Sans cette nuance, la correction aurait gelé l'outil au lieu de le border.*

**⛔ ET LE REFUS SE VOIT, AVEC SA DATE ET CELLE DE LA 1ʳᵉ SÉANCE CONNUE.** Le cacher aurait été pire que de corriger : la personne croirait que l'outil n'a **rien trouvé** là, alors qu'il a trouvé **et refusé**. ***Un refus muet ressemble à une absence de problème.***

**⚠️ CE QUE ÇA DIT DE LA 1ʳᵉ VERSION.** Le garde-fou existait, il était nommé, il était testé — et il ne couvrait qu'**un** des deux chemins par lesquels un record devient invérifiable. *Une protection qui porte le bon nom n'est pas une protection complète* : c'est l'aperçu, montré à quelqu'un qui connaît ses données, qui a trouvé le second (**R29** — montrer avant d'écrire n'est pas une politesse, c'est un contrôle).

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Outil **réservé à l'admin**, et c'est une **réparation** : un outil de correction cesse de pouvoir détruire. Rien n'apparaît pour les autres.

Tests : **parcours 2124/2124** (+4 dans le bloc **CLXXXIX**) ⚠️ *mesuré sur l'arbre **FUSIONNÉ** avec le ft-v1086 de session-A*, calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou, **noyau Milo 12/12**. ⭐⭐ **Le témoin qui compte porte SON cas** : `Développé Décliné`, record du 14/06, plus ancienne séance connue le 28/08 → **intouchable**, et l'écran imprime **les deux dates**. ⛔ **Et celui qui l'empêche de tout bloquer** : le `Pec Deck`, tout aussi « ancien », **monte quand même** — sans lui, la correction aurait gelé l'outil au lieu de le border. ⚠️⚠️ **ET MON PROPRE TÉMOIN ① A ROUGI SUR MON PROPRE AJOUT** : il figeait « 3 exercices » et la fixture en porte 4 depuis que j'y ai mis son Décliné. 👉 *Un témoin visé sur un COMPTE se périme au premier ajout légitime* — **3ᵉ fois cette semaine**, après le R2 du Gardien et le bloc LXXXI. Re-visé sur les **noms attendus** : il rougit si l'un cesse d'être recalculé, pas si la fixture s'enrichit. ⚠️ **14ᵉ collision** : session-A avait nommé son bloc **CLXXXIX**, déjà pris par mon ft-v1085 publié avant (run #750 à 12:36 · le leur #752 à 13:33) — il glisse en **CXCII**, contenu intact, seul le libellé bouge ; *deux blocs du même nom masqueraient une disparition future*. Et leur bump à ft-v1086 avait gardé **mon** commentaire ft-v1085 dans `sw.js` : remplacé par celui de ft-v1087, avec un renvoi vers leur récit ici. Fichiers : `setup.js`, `sw.js`, `tests/parcours/runner.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1087. |


**ft-v1086 — 🧹 LES QUATRE PETITS DÉFAUTS DE L'AUDIT, EN LOT** — Michel : *« lance tout ce que tu peux, il faut avancer »*. Quatre points du palier 🔵 de `docs/SUIVI-AUDIT.md`, tous **mesurés avant d'être corrigés** — et **deux n'étaient pas ce que l'audit décrivait**.

**⛔⛔ ① DEUX CONVENTIONS DE SEXE OPPOSÉES — la personne était CALCULÉE en femme et PROTÉGÉE en homme.** Le BMR testait `gender==='H'` (donc *tout ce qui n'est pas 'H'* partait en femme) et le plancher calories `gender==='F'` (donc *tout ce qui n'est pas 'F'* partait en homme). Tant que la valeur vaut 'H' ou 'F' les deux tombent d'accord ; **dès qu'elle vaut autre chose, elles se contredisent**. Mesuré sur 60 kg / 165 cm / 40 ans : `"Homme"` → **TDEE 1524 (femme) + plancher 1500 (homme)**.
**⭐⭐ ET LE CHEMIN EST RÉEL, PAS THÉORIQUE** : `setup.js` restaurait `S.gender = d.gender` **sans aucune garde**. *« Homme » est exactement ce qu'un fichier de sauvegarde venu d'ailleurs peut contenir.* ⭐ Correctif en deux temps : **on normalise à l'entrée** (R33 — *le format d'une source ne devient jamais le format interne*), et **un seul propriétaire** (`sexeAthlete`) que le BMR et le plancher lisent tous les deux. ⛔ **Et le défaut par défaut n'est pas un choix neuf** : `load()` écrit déjà `…||'H'` — le bug n'était pas d'avoir un défaut, c'est que **deux lecteurs sur trois ne le suivaient pas**. C'est aussi le plus protecteur (plancher 1500 > 1200). ⛔ **Une valeur non reconnue ne remplace rien** : mieux vaut garder l'ancienne que poser un fait faux sur la personne (**R29**).

**⛔⛔ ② ROUVRIR UN BILAN LU PAR L'IA LE FAISAIT PASSER POUR UNE SAISIE À LA MAIN.** `openBodyScanForm` remettait `_bsSource='manuel'` **inconditionnellement**, alors que `saveBodyScan` **remplace l'objet entier** et ne réécrit `src` que s'il vaut autre chose. *L'ouvrir et le ré-enregistrer sans rien changer suffisait à effacer sa provenance* — et `lmDeduite` partait avec, donc Milo cessait d'être prévenu que la masse maigre était une **soustraction** et non une mesure (ft-v978/991). ⚠️ **Défaut CRÉÉ par le correctif qui l'entoure** : la remise à zéro était juste, elle était simplement posée **avant qu'on sache quel bilan on ouvre**.

**⚠️⚠️ ③ L'AUDIT ÉTAIT PÉRIMÉ — le contrôle EXISTAIT.** Il annonçait *« `exSwaps` n'est qu'une consigne de prompt »* ; en vérifiant, `_validationSeance` porte déjà une catégorie `exclusions`. **Le vrai défaut est ailleurs, et c'est le piège de ft-v1035 retrouvé** : `sw[o.name]` est une correspondance de **chaîne exacte**. Mesuré, avec un remplacement enregistré sur « Développé Couché » : *« Developpe Couche »* → **0 signalement** · *« développé couché »* → **0** · avec des espaces → **0**. *L'app se taisait exactement là où elle devait parler.* ⭐ Réparé en réutilisant ce qui existe (**R13**) — `exNomCatalogue` pour les alias, `_normEx` pour accents/casse/espaces — les **deux côtés** passant par la même clé. ⛔ **On normalise pour COMPARER, jamais pour écrire** : ce que la personne a désigné reste écrit comme elle l'a désigné.

**⛔ ④ L'ÉCRAN EXPLIQUAIT UN CALCUL QUE L'APP N'APPLIQUAIT PLUS DEPUIS LE 02/08.** *« parti au bout de ~36 h »*, quand le code efface la fatigue sur **48 h**. *Deux sources pour la même règle, et c'est celle que la personne LIT qui avait tort* (**R2**). Une seule constante (`RECUP_EFFACE_H`) désormais, lue par le calcul **et** par la phrase. **④bis** — une contraception hormonale n'a pas de jour de cycle (`day:null`) et la bannière affichait **« Contraception hormonale — Jour null/0 »**.

**⚠️⚠️ ET DEUX DE MES SONDES N'ONT RIEN MESURÉ AVANT D'ÊTRE RÉPARÉES — c'est la leçon de la version.** ① Celle du bilan sortait par le **verrou santé** : `openBodyScanForm` rendait la main avant d'agir, `saveBodyScan` sortait sur *« le poids est obligatoire »*, et l'objet restait donc **intact** — le contrôle négatif donnait *le même résultat des deux côtés*, c'est-à-dire **un vert qui ne pouvait pas rougir**. ② Celle du sexe **recopiait les formules** au lieu de lire le comportement : après correctif elle criait encore à l'incohérence en mesurant sa propre copie. *Une sonde qui réimplémente la règle mesure la sonde, pas le code* (ft-v994/1016). Les deux versions corrigées portent un témoin dédié (`formOuvert`, `refDiffere`) dont le seul rôle est d'empêcher un vert muet.

**📣 RÈGLE D'OR #11 — RIEN, ET C'EST ARGUMENTÉ.** Ce sont **quatre corrections**, pas des fonctionnalités : rien de neuf à découvrir, rien à faire, aucun repère déplacé. Deux textes changent (*36 h → 48 h*, et « Jour null » qui disparaît) — mais dans les deux cas l'écran **cesse de dire quelque chose de faux**. *Annoncer « on a corrigé une phrase qui était fausse » serait du bruit* (**R19/R25**), et le point rouge existe pour faire découvrir, pas pour s'excuser.

Tests : **parcours 2121/2121** (+11, bloc **CXCII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **CONTRÔLES NÉGATIFS en worktree, et ils impriment les bugs** : provenance `(perdue)` → `ia` · phrase de récup `~36 h` → `~48 h` · bannière `Contraception hormonale — Jour null/0` → `Contraception hormonale` · remplacements sans accents `0` → `1`. ⭐ **Et 3 témoins sont verts DES DEUX CÔTÉS** — H et F se comportent différemment, le formulaire s'ouvre vraiment, un exercice jamais remplacé n'est pas signalé : ce sont eux qui empêchent les autres d'être verts en ne mesurant rien. Fichiers : `state.js`, `setup.js`, `tracking.js`, `log.js`, `screens.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/SUIVI-AUDIT.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1086. |

**ft-v1085 — 🏅 RECALCULER LES RECORDS DEPUIS L'HISTORIQUE · ET LE 429 QUI DISAIT « VÉRIFIE TA CONNEXION »** — deux demandes du même soir : *« et l'histoire de changer l'exercice, c'est réglé ça ? »* → *« fait le 1 »*, puis, en pleine séance, *« Merde »* avec la capture de Milo répondant deux fois **« Erreur : HTTP 429. Vérifie ta connexion et réessaie »** — en 5G, avec 97 % de batterie.

**⛔⛔ ① LE FANTÔME ÉTAIT DANS SES DONNÉES, ET IL ÉTAIT ÉTERNEL.** Mesuré : son `Rowing Hammer Strength` portait **66 kg × 8 → 81,9 kg**, c'est-à-dire ***exactement les chiffres de son Tirage Poulie Haute, même date***. C'est le résidu du sélecteur qui renommait (ft-v1073) : il a réparé la séance, le bon record du Tirage est revenu — **mais le fantôme est resté**. Sa vraie perf ce jour-là : 60 kg × 8, soit ~74,5. **Surévalué de 7,4 kg.** 👉 ***Et comme il est faux VERS LE HAUT, il ne pouvait plus jamais être battu*** : il serait resté pour toujours, en servant de référence aux charges que Milo propose, à la montée en charge que l'app ajoute et au % du max dans le calcul des calories. *Un record faux vers le bas se corrige tout seul à la séance suivante ; un record faux vers le haut est définitif.*

**⛔⛔ LA RÈGLE QUI DÉCIDE DE TOUT N'EST PAS CE QUE L'OUTIL CORRIGE, C'EST CE QU'IL REFUSE DE TOUCHER.** Un exercice qui n'a **aucune série dans l'historique** (import ancien, autre appareil, séance effacée) garde son record **tel quel** et est listé à part. *Recalculer, c'est corriger ce qu'on peut prouver — pas effacer ce qu'on ne retrouve pas.* Sans cette règle, l'outil détruirait des records légitimes **en silence**, ce qui est bien pire que le fantôme qu'il vient réparer. **Les quatre premiers témoins mesurent ça, pas la correction.**

**⭐⭐ ET MONTER N'EST PAS DESCENDRE — c'est la MESURE sur ses 39 séances qui l'a dit.** 6 corrections, dont **2 vers le HAUT** (son Pec Deck passe de 93,1 à 119,2 : son historique contient mieux que son record) et **4 vers le BAS**. ⭐ Une **montée** est sûre, l'historique en porte la preuve. ⚠️ Une **baisse** suppose que la séance qui a fait le record est **encore là**. 👉 Les deux sont **séparées à l'écran**, et la baisse porte son avertissement. *Un outil de correction qui ne distingue pas « je complète » de « j'efface » finit par effacer.*

**⛔ APERÇU D'ABORD, ET LA RÈGLE D'ÉLIGIBILITÉ EST CELLE DE LA PRODUCTION.** Rien n'est écrit tant que la personne n'a pas vu ce qui changerait (**R29**), et le bouton rouge **n'existe pas** avant l'aperçu. ⛔ Et `_serieFaitFoiPourPR` — extraite de `finishWorkout` — est le **propriétaire unique** partagé par les deux (**R2**) : *un recalcul qui appliquerait sa propre règle ne corrigerait pas l'historique, il en fabriquerait un second.* Mesuré : un échauffement à 200 kg et une série non faite à 120 kg sont ignorés des deux côtés.

**⚠️⚠️ ② ET SUR LE 429, J'AI DIT UNE BÊTISE À MICHEL — corrigée par trois de ses mots.** Le défaut de fond est réel et c'est **R4** : le Worker écrit la vraie raison **dans le corps** de la réponse (*« Tu as atteint ta limite d'IA pour aujourd'hui 👍 »*), et l'app la **jetait** pour n'afficher que le code HTTP. *L'information existe, elle est envoyée, elle n'atteint pas l'écran* — et le message générique **envoie chercher au mauvais endroit** : il fait retenter dix fois une chose qui ne peut pas marcher.

**⛔⛔ MAIS J'AI ANNONCÉ « TON QUOTA DU JOUR EST ÉPUISÉ », ET C'ÉTAIT FAUX.** Michel : *« il a répondu après »*. 👉 Le plafond du Worker (`_plafondAtteint`) est un drapeau tenu **en mémoire de chaque isolat Cloudflare**, et le fichier l'écrit lui-même : *« approximatif par construction (plusieurs isolats), et c'est assumé »*. Un isolat avait levé le sien pendant les **52 appels du banc d'essai** ; la requête suivante est tombée sur un autre. ***Un compteur approximatif ASSUMÉ produit un refus qui n'est pas reproductible*** — et le lire comme un quota atteint fait chercher une solution là où il n'y a pas de problème. *La raison est écrite dans le code, à côté de ce qu'elle explique (**R27**) : sans ça, le prochain relira « quota » et refera la même déduction.*

**⛔ CE ROUGE A PRODUIT UN GARDE-FOU QUE JE N'AVAIS PAS ÉCRIT.** Mon correctif affichait le message du serveur **tel quel**. Or le corps porte **deux sortes de textes** : des phrases écrites pour la personne, et des jetons écrits pour le code (`quota`, `rate_limit`, `api_error 500`). ***Les afficher aurait remplacé un message faux par un message incompréhensible*** — ce qui n'est pas un progrès. `_phraseServeur` est désormais le **seul propriétaire** de *« ce texte est-il adressé à un humain ? »* (**R2**), et **en cas de doute on n'affiche rien** : l'ancien message est vague, mais il est honnête sur ce qu'il ne sait pas.

**⭐ ET DEUX CORRECTIFS DE LA MÊME SOIRÉE PARTENT AVEC.** ① Le **compteur du Gardien** affichait *« 126 réponses portant au moins un drapeau »* — un **numérateur sans dénominateur** : rien ne comptait les réponses **saines**. J'ai failli répondre « 98 % » à Michel. Il compte désormais **toute** réponse, et il **repart propre quand la règle change** — sinon on additionne deux époques, dont une antérieure aux correctifs. ② Une **mise à jour ne peut plus tuer un banc d'essai en cours** : une passe coûte **52 appels API réels**, et un rechargement au milieu aurait jeté l'argent avec.

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** L'outil des records est **réservé à l'admin** : personne d'autre ne le verra jamais (le défaut corrigé en ft-v1072). Et le message du 429 est un **message d'erreur qui devient juste** : rien n'apparaît, rien à apprendre. ⚠️ *Annoncer « on vous envoyait vérifier votre connexion pour rien » serait exactement le bruit que la règle #11 cherche à éviter.*

Tests : **parcours 2110/2110** (+18, blocs **CLXXXIX · CXC · CXCI**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou, **noyau Milo 12/12**. ⭐ **La fixture EST son cas** : le Rowing Hammer porte les chiffres du Tirage, le Pec Deck a un historique MEILLEUR que son record, et le Squat n'a **aucune séance**. ⛔ **Le témoin ① existe pour que les autres mesurent quelque chose** : les 3 exercices doivent vraiment être recalculés. ⭐⭐ **Le ② est celui qui compte le plus, et il ne mesure pas une correction mais un REFUS** : `Squat Barre` reste à 112,6. **CONTRÔLE NÉGATIF : les deux garde-fous retirés, et il imprime les deux dégâts** — sans le refus, `sansSeance` tombe à `[]` et **`Squat Barre` DISPARAÎT de `S.prs`** (un vrai record détruit en silence) ; sans le filtre, `quota` s'affiche « quota », `rate_limit` « rate_limit », `api_error 500` tel quel. ⚠️⚠️ **ET UN DE MES PROPRES TÉMOINS A ROUGI SUR DU CODE CORRECT** : le R2 du Gardien figeait « exactement 2 écritures » de la clé du compteur — il y en a **3**, la troisième étant `_gardienRetroDiffere`, qui n'écrit que l'instantané `retro`, **séparé du direct exprès depuis ft-v946**. 👉 *Un témoin visé sur un nombre se périme au premier ajout légitime* — le piège du bloc **LXXXI**, retrouvé tel quel. Re-visé sur la garantie (aucun autre écrivain de `analysees`/`total`), **et éprouvé dans les deux sens** : avec un 2ᵉ écrivain injecté, il rougit **et le nomme**. ⚠️ Et mon bloc navigateur était posé **après** `b.close()` — il ne pouvait pas tourner du tout : *un bloc de témoins qui ne démarre pas est un vert qu'on n'a jamais mesuré.* ⭐ **Vérifié à l'écran** : l'aperçu rend ses deux sections (⬆️ verte, ⬇️ rouge avec son avertissement) et sa ligne « 1 gardé tel quel — jamais supprimé », **0 erreur JS**. Fichiers : `setup.js`, `log.js`, `coach.js`, `app.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1085. |


**ft-v1084 — 🦴 UNE SÉANCE A UN SUJET : MILO EST ENFIN PRÉVENU** — Michel, après une nuit de mesures : *« mais j'ai pas envie que Milo me repropose une séance bizarre »*, puis *« ça me fait dépenser de l'API en lui disant »* et *« si un mec demande à Milo une séance et qu'il sort ça, ça fait pas sérieux »*.

**⭐⭐ SES TROIS PHRASES ONT DÉPLACÉ LE SUJET, ET C'EST ELLES QUI ONT RAISON.** On mesurait depuis la veille un **détecteur** — un avertissement affiché *après coup*. 👉 ***Il ne demandait pas qu'on lui signale une mauvaise séance, il demandait qu'elle n'existe pas.*** Et ses deux arguments ferment la discussion : corriger après **coûte un appel de plus**, et une mauvaise proposition **abîme la crédibilité du produit** avant même qu'on l'explique.

**⛔⛔ ET LA CAUSE EST R8 DANS SA FORME LA PLUS PURE — L'APP SAVAIT, MILO NON.** `_movPattern()` classe le soulevé de terre **et** le roumain en `hip-hinge` **depuis toujours** (ça sert au calcul des calories), et `_validationSeance` le signale depuis ft-v1080. Mais **rien, dans les 46 000 caractères que Milo reçoit, ne lui disait de ne pas l'écrire**. *6ᵉ fois que le prompt réclame un fait qu'on ne lui donne pas* (prénom, dates, catalogue…).

**⛔ LA RÈGLE EST POSÉE OÙ VIT DÉJÀ LA RÈGLE D'ORDRE — dans le bloc PERSONNEL**, pour la raison écrite en ft-v1030 : le bloc commun est plafonné à **46 500 caractères** et *on ne relève pas le seuil pour se faire de la place*. **0 dilution, 0 appel API en plus** — c'est du texte dans ce qui part déjà.

**⭐⭐ ET LA 3ᵉ LIGNE — CELLE QUI NOMME CE QUI RESTE PERMIS — VIENT D'UNE MESURE, PAS D'UNE PRUDENCE.** Sur **140 séances réelles de 8 comptes**, un critère « deux familles lourdes » sans filtre accusait **9 séances parfaitement normales**, dont un `poussée×2 + tirage×2` **cinq fois de suite chez la même personne** — son programme. 👉 Sans cette ligne, Milo **sur-corrigerait** et refuserait un dos complet ou une séance jambes ordinaire. *Une règle qui interdit trop large coûte plus cher que le défaut qu'elle vise* (**R19/R24**).

**⚠️⚠️ ET C'EST LA DEUXIÈME FOIS — LA PREMIÈRE A LAISSÉ UN SCÉNARIO QUI NE POUVAIT PAS L'ATTRAPER.** Même plainte le **22/08** (*« on est retourné sur les jambes, c'est normal ? »*), et **EV-041 existe depuis**. Mais il compte les **bascules d'ORDRE** : ⭐ ***la séance du 31/08, simplement réordonnée, le passerait — en gardant ses deux charnières de hanche.*** Il mesure la géographie, pas la composition. D'où **EV-055**, et son piège est dans la demande (*« séance dos, avec du soulevé de terre »* — la situation exacte où le roumain vient en second).

**⛔ ET LE VÉRIFICATEUR NE COMPTE QUE LES CHARNIÈRES LOURDES** : un leg curl ou un hip thrust ne comptent pas — mesuré, **24 exercices `hip-hinge` chargent le bas du dos, 12 non**. Sans cette distinction, une séance fessiers ordinaire rougirait.

**⛔ CE QU'ON N'A PAS FAIT, ET POURQUOI** : l'app pourrait **réécrire la proposition de Milo** avant de l'afficher — ce serait déterministe au lieu de probabiliste. ⛔ Refusé : Milo annoncerait **4 exercices dans son texte** pendant que l'écran en montrerait **3**. *Le texte et la donnée se contrediraient* — la famille de bugs la plus coûteuse du projet (**R4**), et la personne conclurait que l'app a perdu un exercice.

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Rien n'apparaît, rien ne bouge, il n'y a rien à faire : Milo écrit simplement de meilleures séances. *Annoncer « il ne te proposera plus n'importe quoi » reviendrait à annoncer qu'il le faisait.*
Tests : **parcours 2092/2092** (inchangé — les témoins de cette version vivent dans `tests/milo/`), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou, **noyau Milo 12/12** (+2 : **CORE-011/012**). ⭐ **Tier 1 prouve que la règle ARRIVE** dans le contexte réel ; ⛔ **le CORE-012 est celui qui protège de la sur-correction** (la règle doit nommer ce qui reste normal). ⭐⭐ **EV-055 est éprouvé DANS LES DEUX SENS** avant livraison (leçon de ft-v994) : vert sur une séance saine, **rouge sur la sienne**, en nommant les deux charnières. ⚠️⚠️ **CE QUI MANQUE, ET C'EST ÉCRIT PLUTÔT QUE MAQUILLÉ : le banc d'essai N'A PAS TOURNÉ.** Vérifié trois fois — le Worker est en **403** depuis le conteneur, Apps Script aussi, et **aucune clé API** dans l'environnement. On sait que la règle **arrive** à Milo ; on ne sait **pas** qu'il la **suit**. *Un « avant/après » (R34) est impossible de mon côté : seul Michel peut lancer la passe, et on n'aura que l'après.* Fichiers : `coach.js`, `tests/milo/scenarios.js`, `tests/milo/eval-scenarios.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1084. |

**ft-v1083 — 🧹 NETTOYER LES DOUBLONS DU CLASSEUR — la seule route de l'app qui SUPPRIME** — Michel, après avoir vu le constat : *« Go »*. ⭐ **Son go est venu APRÈS le constat, jamais avant** (**R29**) : sa séance du 31/08 **écrite 7 fois**, celle du 28/08 **en double**, **157 lignes en trop**.

**⭐⭐ ET SA MESURE DIT PLUS QUE LE NETTOYAGE À FAIRE : LE DÉFAUT ÉTAIT PLUS VIEUX QU'AUJOURD'HUI.** La séance du **28/08** est en double — donc le délai dépassé de ft-v1077 mordait **déjà la semaine dernière**, en silence, sans que rien ne le dise. *Le détecteur n'a pas seulement compté des lignes : il a daté la panne.*

**⛔⛔ TROIS GARDE-FOUS, ET AUCUN N'EST DÉCORATIF.** ① **Aperçu par défaut** — sans confirmation explicite, la route ne supprime **rien** et ne copie rien ; le bouton rouge **n'existe pas** tant qu'on n'a pas vu le nombre. ② **Copie de l'onglet AVANT la première suppression**, et si la copie échoue **on s'arrête net** — *la sauvegarde nocturne garde les COMPTES, pas le classeur* : sans elle, il n'y aurait aucun retour arrière. ③ Un plafond, mais pas celui que j'avais écrit.

**⭐⭐ ET C'EST LE TEST QUI A CORRIGÉ MA CONCEPTION, PAS UNE RELECTURE.** Mon 1ᵉʳ plafond refusait au-delà de **la moitié** des lignes de la personne — ça *sonnait* prudent. Or sa séance est écrite **7 fois** : **6 lignes sur 7 sont des doublons parfaitement légitimes**. 👉 ***Le garde-fou aurait refusé exactement le seul cas pour lequel on écrit cette route.*** *Un ratio ne distingue pas « je me trompe en grand » de « il y a vraiment beaucoup de doublons ».* Plafond devenu **absolu**, et la vraie protection est ailleurs : l'aperçu, et le fait qu'on ne supprime **jamais** la première occurrence d'une signature — **garanti par construction, pas par un seuil**.

**⛔ ON NE TOUCHE QUE CE QUI PORTE SON EMAIL.** Ni les lignes des autres testeurs, ni les **~3000 lignes sans email** (écrites avant ft-v1018), qui ne sont attribuables à personne. Deux témoins le figent — *un nettoyage qui range trop est pire que pas de nettoyage*.

**⚠️⚠️ LA SUPPRESSION SE FAIT PAR BLOCS, ET DE BAS EN HAUT.** 157 `deleteRow` referaient **exactement** le bug de ft-v1077 — un aller-retour par ligne, et le téléphone abandonne à 8 s. Et de **bas en haut** parce que supprimer une ligne décale toutes celles du dessous : en descendant, les index non encore traités deviendraient faux **en silence**. *Le même défaut que celui qu'on répare, retourné dans l'autre sens.*

**⚠️ ET UNE SIGNATURE VÉRIFIÉE PLUTÔT QUE DEVINÉE M'A ÉVITÉ UN BOUTON MORT** : `showConfirm` prend un **callback**, pas une promesse (lu dans `log.js`). Un `await` dessus aurait rendu `undefined`, donc « annulé » **quoi qu'il arrive** — le bouton n'aurait **jamais** supprimé, et rien ne l'aurait dit. *3ᵉ fois que « on vérifie les propriétés, on ne les devine pas » paie cette semaine.*

**📣 RÈGLE D'OR #11 — RIEN.** Outil **réservé à l'admin** : personne d'autre ne le verra jamais. Annoncer à tous un bouton qu'ils ne peuvent pas ouvrir est le défaut corrigé en ft-v1072.
Tests : **parcours 2092/2092** (+11, bloc **CLXXXVIII** — ⚠️ **CLXXXVII était déjà pris** par le ft-v1082 de session-A, publié pendant ce travail ; **13ᵉ collision**, ma version devient **ft-v1083**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⭐⭐ **Les quatre premiers témoins ne mesurent pas ce que la route supprime, mais ce qu'elle NE supprime PAS.** ⭐⭐ **Et le ⑦ porte la leçon** : une séance écrite **7 fois** (86 % de doublons) doit passer — *un ratio l'aurait refusée*. ⛔ **Le ⑩ fige la forme en deux temps** : aucun bouton de suppression dans l'écran, il naît de l'aperçu. ⛔ **Le ⑪ protège R2** : aperçu et suppression passent par **le même appel**, sinon on finirait par supprimer autre chose que ce qui a été montré. ⚠️ Le bloc ne peut pas tourner contre `HEAD` (`sessionNettoyer` n'y existe pas) — limite honnête habituelle. 🧾 Famille **§29** de `BUGS.md` — *un garde-fou calibré sur un RATIO refuse le cas qu'il vise*. Fichiers : `Code.js`, `app.js`, `index.html`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1083. |

**ft-v1082 — 🔥 LE REPOS D'UN PALIER SUIT SA CHARGE · ET LE PLAFOND DE PALIERS AUSSI** — Michel relaie un document de revue de ses échauffements, puis tranche : *« vas-y go »* (correctifs A **et** B).

**⛔⛔ LA PREMIÈRE LIVRAISON EST UNE MESURE QUI DIT « C'EST DÉJÀ RÉPARÉ ».** Les **4 cas « priorité haute »** du document ont été rejoués dans un navigateur sur le code d'aujourd'hui — pas relus dans le journal : **Tirage Poulie Haute** du 16/08 (5 paliers signalés) → l'app **n'ajoute plus rien** ; **Pec Deck** → **0** palier (`_exRole` le classe *accessoire*) ; **Développé Épaules** → **1** série d'approche, pas 3 ; **RDL après squat** → **0 ajout**. 👉 ***La question centrale du document — « pourquoi 5 chauffes le 16 août et 1 seule le 20 ? » — a pour réponse une DATE, pas une règle instable : le correctif est sorti le 17/08 (ft-v887), et la séance du 16 est justement celle qui l'a déclenché.*** *Un document d'audit écrit sans accès au dépôt date ses symptômes, pas ses correctifs* (**R23**).

**⛔⛔ CE QUI RESTAIT, LUI, ÉTAIT RÉEL — ET MESURÉ AVANT DE TOUCHER AU CODE.** ① `restByType` rendait **45 s à plat** entre paliers : sur sa montée vers 130 kg, `100×2 → 115×1` — un passage à **88 % de la charge du jour** — donnait **45 secondes**. ⚠️ **La moitié du problème était déjà réglée et il faut le dire** : le dernier palier suivi d'une **série de travail** prenait déjà 130 s (règle du 17/08). Le trou était *entre deux paliers, quand le second est déjà lourd*.

**⭐⭐ ET LE ② N'ÉTAIT PAS DANS LE DOCUMENT — c'est la mesure qui l'a sorti, et il est plus gros.** Le plafond de `_monteeCompletee` était un **5 en dur**. Or Milo écrit presque toujours 3 paliers avec des écarts de ~22 %, donc l'app en insérait 2 **à chaque fois** : mesuré sur 8 charges, **5 paliers et 19 répétitions d'échauffement, de 60 kg à 150 kg, à l'identique**. 👉 ***Un squat à 60 kg recevait exactement le protocole d'un squat à 150.*** Pendant que le barème qui fabrique une montée **de zéro**, lui, sait doser : 2 paliers à 50 kg, 3 à 70, 4 à 130. *Deux réponses à la même question « combien de paliers cette charge mérite-t-elle ? » — c'était ça, le défaut* (**R2**). Le plafond vaut désormais **ce que le barème produirait**, jamais moins que ce que Milo a écrit.

**⛔ AUCUN CHIFFRE NEUF (R2/R13)** : le repos réutilise les **mêmes zones** que les répétitions (`_PALIER_ZONES` — 0,85 / 0,75), sorties en constante pour que les deux ne puissent plus diverger ; 45 s existait déjà, 90 et 120 sont les presets de la barre de repos. Et le plafond n'invente rien, il **appelle le barème**.

**⛔ DEUX BORNES, ET ELLES FONT LA MOITIÉ DU TRAVAIL** : on ne **raccourcit** jamais (45 s reste le plancher) et on ne dépasse **jamais le repos de travail de la personne** — mesuré, un profil réglé à 60 s voit son palier lourd à **60 s, pas 120**. ⭐ Et la portée reste bornée par ft-v1030 : *ce chrono est un **maximum***, donc on corrige une suggestion par défaut, on n'impose rien.

**⚠️⚠️ J'AI POSÉ MON ÉTIQUETTE DANS UN ENDROIT MORT — trouvé à l'écran, pas en relisant.** `startRest()` appelle `stopRest()`, **qui vide `#rest-label`**. Ma phrase était écrite ~150 lignes trop haut : elle sortait **vide**. ⭐⭐ **Et la mesure des deux côtés a montré que ce n'est pas ma régression** : « Échauffement », « Récup. à l'échec » et « Abdos » sont muets **depuis toujours** sur ce chemin. *Un libellé qui ne s'affiche jamais ne lève aucune erreur et ne casse aucun test.* ⛔ **Non réparé exprès** : le remplir ferait disparaître le voisin « ⏭️ Ensuite : … », qui ne s'écrit que si le libellé est vide — c'est un autre chantier, il est noté plutôt que bricolé au milieu de celui-ci (**R30**).

**⚠️⚠️ ET MA 1ʳᵉ ÉTIQUETTE AFFIRMAIT UN FAIT FAUX.** Elle écrivait *« palier lourd »* **dès que le repos montait** — donc à **77 %** de la charge de travail aussi. *Une mesure juste peut produire une phrase fausse* (la leçon de ft-v1035, retrouvée telle quelle). L'étiquette suit désormais la **zone réellement appliquée** : rien · *« ça monte »* · *« palier lourd »*, avec **un seul propriétaire** pour la zone, le repos et le mot.

**⚠️ LA JUMELLE, CHERCHÉE ET TROUVÉE (R8)** : `_defRestForType`, le placeholder de l'éditeur de programmes, annonçait **90 s** pour une série normale quand la séance applique le repos **réglé** (130 s chez Michel). *Deux endroits pour la même règle, et ils avaient déjà divergé.*

**📣 RÈGLE D'OR #11 — les cinq points, et la pop-up est MÉRITÉE** : *un repère a bougé deux fois*. Le chrono d'échauffement affichait 45 s depuis toujours et peut afficher 2 min ; et sur les charges légères **la montée compte MOINS de séries qu'avant** — *« il a supprimé mes séries »* est la lecture la plus naturelle, c'est exactement ce que la pop-up doit empêcher. `WHATS_NEW` **v66** · point rouge `repos-palier` sur l'onglet Séance · aide `?` — **l'astuce du timer est ENRICHIE, pas une ligne de plus** · aide détaillée · **31ᵉ diapo du Guide, sans image exprès** (une capture montrerait des kilos et un chrono précis : elle se lirait comme une recommandation de charge, or tout est **relatif** au maximum du lecteur). ⚠️ **Et une aide devenue FAUSSE a été corrigée au passage** : *« Timer : É 45s »* dans « Tags de série » — *une aide qui annonce un chiffre que l'app n'applique plus est pire qu'une aide absente, parce qu'on la croit* (**R23**).

Tests : **parcours 2081/2081** (+15, bloc **CLXXXVII** — ⚠️ mesuré sur l'arbre **FUSIONNÉ** avec le ft-v1081 de session-B, pas sur le mien seul ; ⚠️ **livrée en ft-v1082 et non 1081** : session-B a publié la sienne pendant ce chantier, et *un numéro de cache ne recule jamais* — 13ᵉ collision de la semaine, sur la version **et** sur le numéro de bloc), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **CONTRÔLE NÉGATIF en worktree sur ft-v1080, et il imprime le bug** : repos `45 · 45 · 45` avant → `45 · 90 · 120` après · complétion `60 kg → 5 paliers, 19 reps` avant → `3 paliers, 12 reps` après · placeholder `N = 90` avant → `130` après. ⭐ **Et les non-régressions sont vertes DES DEUX CÔTÉS** — le repos vers une série de travail (130 s), le barème de zéro **inchangé au chiffre près** sur 13 charges, et l'invariant du 11/08 (Milo écrit 5 paliers → on n'en retire aucun) : ce sont elles qui empêchent les autres d'être vertes en ne mesurant rien. ⚠️⚠️ **DEUX DE MES PROPRES TÉMOINS ONT ROUGI, ET LES DEUX FIGEAIENT UNE FORME AU LIEU D'UNE RÈGLE** : ① le mien comptait « au moins 4 lectures de `_REPOS_PALIER` » — en rendant le code **vraiment** mono-source (une seule lecture indexée), je l'ai fait rougir sur une amélioration ; ② un témoin **existant** exigeait *« aucune pop-up au-delà de la v65 »* pour dire *« on n'annonce pas les pas deux fois »* — il figeait donc l'état de toute la liste et **rougissait à la première feature suivante, quel qu'en soit le sujet**. Les deux sont **visés sur leur règle, sans être affaiblis**. ⭐ **Vérifié à l'écran** : chrono **2:00** et *« Échauffement · palier lourd »* sur le palier à 88 %, *« ça monte »* à 77 %, **0 erreur JS**, 🔴 **bouton central mesuré `[139, 792, 56, 44]` — identique avant et après** (règle d'or #9). ⏭️ **Ce que ça ne fait pas, et il faut le lire** : quand deux trous sont **à égalité**, l'insertion prend toujours le plus **bas** (mesuré : à 90 kg elle bouche 40→60 et laisse 60→80). C'est un comportement d'avant ce chantier, pas une régression — il est écrit ici plutôt que corrigé au milieu d'autre chose. Fichiers : `log.js`, `constants.js`, `coach.js`, `screens.js`, `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1082. |

**ft-v1081 — 🔁 VOIR LES DOUBLONS DU CLASSEUR, SANS RIEN SUPPRIMER** — Michel, après la synchro réparée : *« et voir pour réparer ma sauvegarde, ou comment vérifier si ma séance a été écrite plusieurs fois ? »*.

**⚠️ POURQUOI CES DOUBLONS EXISTENT, ET C'EST NOUS.** Avant ft-v1077, `handleLogSession_` écrivait **une ligne par série** : une grosse séance dépassait les **8 s** d'attente du téléphone, qui abandonnait — *pendant que le script Google, lui, finissait d'écrire*. La séance restait donc marquée « non synchronisée », et **chaque nouvel essai re-collait les mêmes lignes**. La cause est corrigée ; ce qui a déjà été écrit, non.

**⛔⛔ ET LE TÉMOIN CENTRAL N'EST PAS LE COMPTAGE, C'EST QUE LA ROUTE N'ÉCRIT RIEN (R29).** Le classeur porte **ses** données. On lui **montre** ce qu'on voit, il décide ensuite. 👉 ***Un détecteur qui nettoie d'office est exactement le geste qu'on refuse*** — le même que « réparer » sa séance sans lui demander. Le témoin compte **0 écriture** sur un faux classeur, et vérifie que les lignes de départ sont toutes encore là.

**⛔ UNE SEULE LECTURE DU CLASSEUR** (`getDataRange`), pas une par ligne : c'est la leçon de ft-v1077 appliquée au code neuf, deux versions plus tard. *Ce qui grandit avec les données finit toujours par dépasser un délai fixe.*

**⛔ ET IL DIT CE QU'IL NE PEUT PAS VOIR.** Les lignes écrites **avant ft-v1018** n'ont pas de colonne `email` : elles ne sont attribuables à personne, donc elles ne sont **ni comptées ni accusées** — mais leur nombre est **affiché**. Sans ça, un total qui ne colle pas passerait pour une erreur de l'outil, et on chercherait un bug là où il n'y en a pas. ⛔ Les lignes des **autres testeurs** ne sont ni lues ni comptées, et un témoin vérifie qu'aucun de leurs noms ne ressort. ⛔ **Jeton admin obligatoire** : cette route lit l'entraînement de quelqu'un.

**⚠️ ET UN TÉMOIN DE RÈGLE EST NÉ D'UNE ERREUR QUE J'AI FAILLI LIVRER.** Le menu Admin annonce le nombre de cartes de chaque groupe ; j'ai ajouté la mienne et le compteur disait toujours **« 4 »** pour un groupe qui en porte **5**. Un témoin compare désormais **l'annonce au contenu réel**, pour tous les groupes. *Un compteur écrit à la main se périme au premier ajout — celui-là ne peut plus.*

**⚠️⚠️ ET UN TÉMOIN EXISTANT A ROUGI SUR UN AJOUT PARFAITEMENT LÉGITIME — la nuance vaut d'être gardée.** Le témoin du rangement du menu admin (bloc LXXXI) figeait une **égalité** : *19 cartes, 34 boutons*. Or sa garantie écrite est *« rien n'a été **perdu** »*, pas *« rien n'a bougé »*. 👉 ***Un témoin visé sur un nombre exact se périme au premier ajout*** — et un témoin qui rougit pour rien finit désactivé (**R19**). Il devient un **plancher**, posé exactement là où il était : perdre une seule carte le fait toujours rougir, en ajouter une non. *On ne désarme pas un témoin, on le vise — encore faut-il le viser sur la garantie, pas sur le chiffre du jour.*

**📣 RÈGLE D'OR #11 — RIEN, ET C'EST ARGUMENTÉ.** L'outil est **réservé à l'admin** (`_isAdminUnlocked`) : personne d'autre ne le verra jamais. Une pop-up ou un point rouge pour tout le monde annoncerait une chose que personne ne peut ouvrir — exactement le défaut corrigé en ft-v1072. Et la carte porte son explication.
Tests : **parcours 2066/2066** (+9, bloc **CLXXXV**) ⚠️ *mesuré sur l'arbre **FUSIONNÉ** avec le ft-v1080 de session-A, pas sur le mien seul* — ⚠️ **12ᵉ collision** : ils ont publié ft-v1080 pendant ce travail, ma version devient **ft-v1081** (*un numéro de cache ne recule jamais*), et **leur bloc de test s'appelait CLXXXIV, déjà pris par mon ft-v1079 publié AVANT** : il glisse en **CLXXXVI**, contenu intact, seul le libellé bouge — *deux blocs du même nom masqueraient une disparition future* (§25), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⭐⭐ **La fixture EST son cas** : une séance de 3 séries écrite **trois fois** (ses trois essais avant ft-v1077), à côté d'une séance saine, d'une ligne d'un autre testeur et d'une vieille ligne sans email. ⛔ **Le ① existe pour que les autres mesurent quelque chose** : la route doit **vraiment** lire les 11 lignes. ⭐⭐ **Le ② est celui qui compte** : **0 écriture**. ⛔ **Le ④ empêche l'outil de crier sur tout** : la séance saine n'est pas signalée. **CONTRÔLE NÉGATIF sur le témoin de règle** : compteur du menu remis à « 4 » → **rouge**, et il **nomme le coupable** (`🔧 Le compte et la connexion : annonce 4, porte 5`). ⚠️ Le bloc entier ne peut pas tourner contre `HEAD` (`sessionDoublons` n'y existe pas) — la limite honnête habituelle. Fichiers : `Code.js`, `app.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1081. |

**ft-v1080 — 🦴 LA SÉANCE BIZARRE DE MILO : DEUX CHARNIÈRES DE HANCHE DANS LA MÊME SÉANCE** — Michel, en relayant le sujet vu avec l'autre session : *« répare la séance bizarre de Milo — soulevé de terre, dos, puis soulevé de terre roumain »*. Un **soulevé de terre**, puis le dos, puis un **soulevé de terre roumain** : deux charnières de hanche lourdes, la seconde sur des lombaires déjà cuites par les deux premiers.

**⛔⛔ ET L'APP LE SAVAIT DÉJÀ — C'EST R4 DANS SA FORME LA PLUS PURE.** Mesuré avant d'écrire une ligne : `_movPattern()` rend **`hip-hinge` pour les DEUX** — elle sert au calcul des calories depuis toujours — et `_validationSeance` rendait pourtant **`doublons: []`**. 👉 ***L'information existait, elle n'atteignait pas la validation***, qui ne comparait que des **NOMS**.

**⛔⛔ MAIS « DEUX CHARNIÈRES » AURAIT CRIÉ AU LOUP, et c'est la mesure qui l'a dit.** Le catalogue compte **43 exercices** en `hip-hinge`, et la famille mélange le soulevé de terre avec le **Hip Thrust**, le **Pont Fessier** et les **Kickbacks**. *Une séance fessiers parfaitement normale aurait été signalée* — et **un avertissement qui se trompe souvent finit par ne plus être lu** (R19).

**⭐⭐ LE DISCRIMINANT EST DANS LA DONNÉE, PAS DANS UNE LISTE ÉCRITE À LA MAIN (R13)** : le muscle **`lower-back`** de `_mscScores`. Mesuré sur les 43 — **24 le chargent à 2** (toute la famille soulevé de terre, Good Morning, Rack Pull, Zercher, Reeves, hyperextensions lestées) et **12 non** (Hip Thrust ×4, Pont Fessier, Kickback ×2, Cable Pull Through, Glute Ham Raise, Kettlebell Swing, Reverse Hyper). 👉 ***Une liste écrite de mémoire se périmerait au prochain exercice ajouté au catalogue ; celle-ci se recalcule.***

**⛔ ON INFORME, ON NE BLOQUE PAS, ET ON NE CORRIGE RIEN** (**R24/R29**) : un soulevé de terre lourd suivi d'un roumain léger en accessoire est un **schéma classique**. L'app **nomme le fait et l'autre exercice** — *sans le nom de l'autre, la phrase serait vraie et inutilisable* — puis la personne tranche.

**⛔ ET DEUX FOIS LE MÊME NOM RESTE UN « DOUBLON », PAS UNE CHARNIÈRE** : `doublons` le dit déjà, et mieux. *On ne dit pas la même chose deux fois avec deux mots différents* (**R2**).

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** L'avertissement apparaît **là où le problème est**, sur l'exercice concerné, dans une surface qui porte déjà les 🚫 exclusions et les 🛡️ blessures. Rien de nouveau à apprendre, rien de déplacé.
Tests : **parcours 2057/2057** (+7, bloc **CLXXXVI** — mesuré sur l'arbre **fusionné** avec le détecteur de doublons de session-B), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐ **Le premier témoin empêche les « rien » d'être verts sur du vide** : il vérifie que l'app classe bien les deux en `hip-hinge`. ⛔⛔ **Et celui qui compte le plus est le FAUX POSITIF ÉVITÉ** : Hip Thrust + Kickback + Pont Fessier ne déclenche rien — sans lui, on aurait livré un avertissement qui hurle sur une séance fessiers ordinaire. ⚠️ **12ᵉ collision de numéro** : session-B avait aussi pris ft-v1079. Fichiers : `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1080. |

**ft-v1079 — 🪞 LE MIROIR DE SAUVEGARDE POUVAIT MOURIR EN SILENCE — 10 scripts servis, 9 en cache** — Michel, en enchaînant sur la synchro : *« on a la sauvegarde qui fonctionne sur le miroir supabase ? »*. **C'est en vérifiant pour lui répondre que le trou est sorti** — pas en le cherchant.

**⛔⛔ LA MESURE, ET ELLE EST NETTE.** `index.html` sert **10** scripts ; `PRECACHE` en portait **9**. 👉 ***`supabase.js` était le seul absent*** — et **sans raison écrite**, contrairement à `data/ciqual.json`, dont l'exclusion est argumentée trois lignes plus haut (**R30**). C'est **R8** dans sa forme la plus simple : neuf jumeaux présents, un manquant.

**⚠️⚠️ ET LA PANNE EST SILENCIEUSE, SUR LE SEUL SUJET OÙ ELLE NE DOIT PAS L'ÊTRE.** App ouverte **hors ligne juste après une mise à jour** → la balise `<script>` échoue → `sbMirror` n'existe pas → le `try/catch` de `_cloudSync` **avale l'absence** (il est là pour que le réseau ne bloque jamais, règle d'or #3) → la copie miroir est morte **pour toute la session**, y compris quand le réseau revient. Rien à l'écran, rien dans le journal d'erreurs. *Ce n'est pas une fonctionnalité qui tombe, c'est un filet.*

**⭐⭐ ET LE FICHIER SE DÉCRIVAIT LUI-MÊME SANS LE SAVOIR.** Son propre en-tête dit, à propos du bouton de test : *« un miroir de sauvegarde qui n'écrit pas est PIRE que pas de miroir, parce qu'on croit être couvert »*. La phrase était écrite en août pour justifier un bouton ; elle décrivait aussi, à son insu, le défaut de sa propre mise en cache.

**⛔ LE TÉMOIN PROTÈGE LA RÈGLE, PAS LE CAS** : il compare la liste des scripts **réellement servis** par `index.html` à la liste **préchargée**. Le prochain fichier ajouté et oublié dans `sw.js` le fera rougir — *et c'est la seule chose qui rende cet oubli visible, puisque rien d'autre ne le voyait, ni test, ni erreur, ni retour utilisateur* (**R28** : une panne qui ne se manifeste par rien n'est pas mesurée).

**⛔ ET UN 4ᵉ TÉMOIN VÉRIFIE QUE LE MIROIR EST TOUJOURS APPELÉ** : un fichier bien mis en cache que plus personne n'appelle ne sauvegarderait rien (**R5**). *Mettre en cache un module mort aurait été un vert parfait sur une sauvegarde morte.*

**⚠️ ET LA LEÇON DE LA VEILLE A SERVI LE JOUR MÊME** : les commentaires sont retirés **avant** la mesure — celui qui explique ce correctif **nomme `supabase.js`**, il aurait rendu le témoin vert pour rien. C'est exactement ce qui avait fait rougir le témoin ⑥ de ft-v1078, deux heures plus tôt. *Une leçon appliquée le jour où elle est écrite est une leçon qui tient.*

**⚠️ CE QUE ÇA NE DIT TOUJOURS PAS, ET C'EST LA VRAIE RÉPONSE À SA QUESTION** : que le miroir soit **branché** et **en cache** ne prouve pas qu'il **écrive**. Supabase est injoignable depuis ce conteneur — *« c'est poussé » ne veut pas dire « ça marche »* (**R18**). Le seul verdict est le bouton **Profil → Admin → 🪞 Tester la copie miroir**, qui écrit pour de vrai et rend le code HTTP. Écrit ici plutôt que sous-entendu.

**✅ ET MICHEL A LEVÉ LA RÉSERVE LUI-MÊME, CAPTURE À L'APPUI** : *« Écriture réussie (HTTP 204). La ligne « test@forcetracker.test » est dans la table »*, avec une **dernière copie miroir au 31/08 18:15:33**. 👉 Le miroir **écrit pour de vrai** — ce que je ne pouvais pas savoir d'ici. *Le bouton a servi exactement à ce pour quoi il avait été écrit en août : donner un verdict à celui qui a l'appareil, pas à celui qui a le code.*

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Rien n'apparaît, rien ne bouge : un filet qui pouvait se décrocher tient. Il n'y a rien à faire et rien à apprendre — *annoncer « ta sauvegarde de secours est maintenant vraiment de secours » inquiéterait plus que ça n'informe*.
Tests : **parcours 2050/2050** (+4, bloc **CLXXXIV**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⛔ **Le ① existe pour que le ② mesure quelque chose** : les deux listes doivent avoir été **lues** — sinon « aucun absent » serait vrai sur une lecture ratée. **CONTRÔLE NÉGATIF : mesuré contre `HEAD` avant d'écrire une ligne** — le témoin **nomme le coupable** (`["supabase.js"]`) avant, liste **vide** après, sur les mêmes 10 scripts. Fichiers : `sw.js`, `tests/parcours/runner.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1079. |

**ft-v1078 — 📤 « LA DERNIÈRE SÉANCE N'APPARAÎT PAS DANS MON EXPORT » — elle y était, tout en bas** — Michel, dans la foulée de la synchro : *« quand je fais exporter mes séances, la dernière séance n'apparaît pas dans mon export — dans l'historique, je parle »*.

**⭐ ON MESURE AVANT DE CHERCHER, ET ÇA CHANGE LE DIAGNOSTIC.** Rejoué avec trois séances (avant-hier, hier, aujourd'hui) : l'export contient bien les **3**, et sa dernière séance est **la toute dernière ligne du fichier**. 👉 ***Elle n'était pas absente, elle était à l'autre bout*** — et une donnée qu'on doit aller chercher au bout d'un fichier se lit exactement comme une donnée absente.

**⛔⛔ LA CAUSE : LE CSV ÉTAIT LE SEUL À L'ENVERS DE TOUT LE RESTE.** L'écran Historique empile par le haut (`unshift`, la plus récente d'abord) et le **PDF** trie `.sort().reverse()` — la plus récente d'abord aussi. Le **CSV**, lui, triait `localeCompare(a, b)` : **du plus ancien au plus récent**. *Deux exports du même historique ne racontaient pas la même chose dans le même ordre.*

**⛔ ET LE DÉFAUT DE FOND N'EST PAS LE SENS DU TRI, C'EST QU'IL Y AVAIT TROIS PROPRIÉTAIRES DE L'ORDRE** — l'écran, le PDF, le producteur — pour une seule question : *dans quel ordre se lit un historique ?* 👉 L'ordre appartient désormais à **`_histoLignes`** seul (**R2**), et les deux formats le **suivent** au lieu de le refaire. Le PDF a perdu son `.sort()` : il groupe par date **dans l'ordre où les lignes arrivent**. *Un tri de moins, c'est une divergence de moins à surveiller.*

**⛔ ET LE TRI NE PORTE QUE SUR LES SÉANCES.** À l'intérieur d'une séance, les séries restent **1, 2, 3** : c'est l'ordre dans lequel elles ont été faites, il n'a aucune raison de s'inverser. Un témoin l'épingle — *inverser un fichier est le genre de correctif qui emporte plus que ce qu'on visait*.

**⛔ ON RÉORDONNE, ON NE PERD RIEN** : mesuré avant/après sur la même fixture — **4 lignes des deux côtés**, mêmes trois exercices, même nombre de dates. Seul l'ordre a bougé.

**⚠️⚠️ ET MON PROPRE TÉMOIN ⑥ A ROUGI SUR DU CODE CORRECT — la cause vaut la version.** Il vérifie qu'aucun des deux exports ne re-trie dans son coin, en lisant le source. Il est tombé sur… **le commentaire qui EXPLIQUE le retrait** (*« il triait ses dates lui-même (`.sort().reverse()`) »*). 👉 ***Un témoin qui lit du texte source ne distingue pas le code de ce qui le raconte*** — et dans ce projet, ce qui le raconte est plus long que le code. Les commentaires sont donc retirés **avant** la mesure. *Le témoin n'est pas désarmé, il est visé* — et il reste le seul à protéger la cause plutôt que le cas.

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE, et ça se discute donc ça s'argumente.** Un repère a bougé — l'ordre d'un fichier — mais il a bougé **vers** celui que la personne a déjà sous les yeux : son écran Historique et son PDF. *Annoncer « ton export est maintenant dans le même ordre que ton écran » reviendrait à interrompre tout le monde pour dire qu'une incohérence a disparu.* Et il n'y a rien à faire : le fichier s'ouvre pareil, il commence simplement par la séance qu'on vient de faire.
Tests : **parcours 2046/2046** (+6, bloc **CLXXXIII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⛔ **Le témoin ① existe pour que le ② mesure quelque chose** : sans 3 séances distinctes dans la fixture, « la plus récente d'abord » serait vrai sur un export d'une seule ligne. ⭐ **Le ③ est celui qui vaut le plus** : l'ordre de l'export est **exactement** celui de l'écran — pas « décroissant », mais *le même que ce qu'il voit*. ⛔ **Le ⑥ protège la cause, pas le cas** : ni le CSV ni le PDF ne re-trient dans leur coin — sinon un quatrième propriétaire réapparaîtra. **CONTRÔLE NÉGATIF : mesuré contre `HEAD` avant d'écrire une ligne** — première ligne `2026-08-29` (la plus ancienne) avant, `2026-08-31` après, **4 lignes des deux côtés**. Fichiers : `setup.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1078. |

**ft-v1077 — ☁️ LA SÉANCE QUI NE PARTAIT PAS, MÊME EN WIFI — 25 allers-retours vers le classeur pour UNE séance** — Michel, capture à l'appui : *« J'ai testé en wifi il fallait que je fasse un truc sur Google ? »*, et l'Admin affichait toujours **« 1 séance non synchronisée / 39 »**.

**⭐ LA RÉPONSE À SA QUESTION EST NON, ET IL FALLAIT LA DONNER EN PREMIER** : rien ne lui était demandé côté Google pour la synchro. La seule manip en attente (`installDailyBackupTrigger_`) concerne les **sauvegardes**, pas l'envoi des séances. *Une manip en attente au même moment ressemble à une cause — elle ne l'était pas, et le dire évite qu'il cherche là où il n'y a rien.*

**⛔⛔ LA CAUSE, TROUVÉE EN LISANT LE CODE PLUTÔT QU'EN ACCUSANT LE RÉSEAU.** `handleLogSession_` faisait **un `appendRow` PAR SÉRIE** — et un `appendRow` est un **aller-retour complet** vers le classeur. Mesuré contre `HEAD` : **3 séries → 3 écritures · 25 → 25 · 60 → 60**. 👉 ***C'est le seul endroit de `Code.js` dont la durée grandit avec les données*** (tous les autres écrivent une ligne, une fois). Le téléphone, lui, abandonne à **8 secondes**. *Une lenteur qui dépend de la taille finit toujours par franchir un seuil fixe : la question n'est pas si, c'est quand.*

**⭐⭐ ET LE PLUS IMPORTANT N'EST PAS LA LENTEUR, C'EST CE QUE L'ABANDON NE FAIT PAS.** `AbortController` coupe **l'attente du téléphone**, il n'arrête **pas** le script Google : *les lignes s'écrivaient quand même*. La séance restait donc marquée « non synchronisée », et **chaque nouvel essai re-collait les mêmes lignes**. 👉 ***Un délai dépassé n'est pas un échec — c'est une réponse qu'on n'a pas attendue.*** ⚠️ La conséquence est écrite plutôt que cachée : son onglet `Sessions` porte probablement **plusieurs exemplaires** de cette séance. **Rien n'est touché** — c'est son classeur, et on ne modifie pas les données de quelqu'un sans son accord (**R29**).

**👉 LE CORRECTIF : LES LIGNES PARTENT EN BLOC** (`setValues`). **1 séance = 1 écriture**, qu'elle fasse 3 ou 60 séries. ⛔ **Et le contenu ne change pas d'un octet** — mesuré avant/après sur la même séance, ligne par ligne : mêmes 12 colonnes, même email en 12ᵉ, l'ancienne ligne intacte. *Corriger une lenteur en changeant ce qui est écrit aurait été un deuxième bug.*

**⛔ UNE CASE ABSENTE NE DOIT PLUS POUVOIR FAIRE TOMBER TOUTE LA SÉANCE.** `appendRow` acceptait un `undefined` (case vide) ; l'écriture en bloc est **plus stricte**. Une vieille version de l'app, ou une séance importée, peut envoyer une série sans `rm1` — elle passe désormais, avec une case vide, et un témoin l'épingle. *Le comportement ne change pas ; il cesse de dépendre du mode d'écriture.*

**⛔ ET LA MOITIÉ FRONTEND : « ❌ Sync : Timeout (8s) » ANNONÇAIT UNE PERTE QU'IL N'AVAIT PAS CONSTATÉE.** Michel l'a lu comme ça, et il a eu peur pour ses données — *« fait gaffe à mes données stp, créé une sauvegarde au cas où »*. Or **rien n'était perdu** : tout est en local (**R16**), la séance reste en file et repasse toute seule. Un réseau lent n'a donc plus ni croix ni rouge : **« ⏳ Réseau trop lent — ta séance est gardée, on réessaiera »**, et la ligne de l'Admin le dit aussi. ⛔ **Mais une VRAIE erreur garde sa croix rouge** — sinon on effacerait la différence entre *« c'est plus long que prévu »* et *« le serveur a refusé »*. Un témoin l'interdit.

**⭐ R8 VÉRIFIÉ, ET IL DIT DE NE RIEN TOUCHER AILLEURS** : sur les 8 écritures de classeur de `Code.js`, **une seule était dans une boucle** — celle-ci. *Une jumelle qu'on cherche et qui n'existe pas est une mesure, pas une absence de travail.*

**⚠️ CE QUE JE NE PEUX PAS PROUVER, ET C'EST ÉCRIT PLUTÔT QUE MAQUILLÉ** : la sortie réseau est bloquée depuis ce conteneur, **je n'ai pas pu chronométrer son serveur**. La cause est établie **par le code** — le seul écrivain dont la durée grandit, et un symptôme qui est littéralement un délai dépassé — pas par un chronomètre chez lui. *C'est la même réserve qu'en ft-v1059 sur iOS, et elle avait servi.*

**✅ CONFIRMÉ PAR MICHEL LE SOIR MÊME, ET C'EST LA MESURE QUI MANQUAIT** — *« ma séance a été synchronisée apparemment »*. Le paragraphe ci-dessus disait honnêtement que la cause était établie **par le code** et non chronométrée chez lui ; son essai est le chaînon manquant. ⭐ **Et la variable est isolée** : entre son échec de 17:28 et sa réussite, rien n'a changé d'autre que **25 allers-retours vers le classeur devenus 1** — même téléphone, même wifi, même séance. *Une réserve écrite plutôt que maquillée est une réserve qu'on peut lever proprement.*

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Une séance qui devait partir part. Rien n'apparaît, rien ne bouge, il n'y a rien à apprendre. ⚠️ Le seul texte qui change est un **message d'erreur**, et il devient **moins** alarmant — *annoncer « on vous faisait peur pour rien » serait le bruit que la règle #11 cherche à éviter*.
Tests : **parcours 2040/2040** (+10, bloc **CLXXXII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⭐⭐ **Le témoin qui compte est celui qui compte les ALLERS-RETOURS vers le classeur, pas les lignes** — c'est la grandeur qui produisait le délai. ⛔ **Le ① existe pour que le ② mesure quelque chose** : les 25 séries doivent **vraiment** être écrites, sinon « 1 écriture » serait vert sur du vide. ⛔ **Le ⑩ empêche le correctif d'être un recul** : une vraie erreur garde sa croix rouge. **CONTRÔLE NÉGATIF : mesuré contre `HEAD` avant d'écrire une ligne** — `3 → 3 · 25 → 25 · 60 → 60` écritures avant, `1 · 1 · 1` après, **et contenu identique** (comparé octet pour octet). ⚠️ **Le faux classeur du bloc CXXV a dû apprendre `setValues` et `getLastRow`** : *le levier change, la garantie ne change pas — on ne désarme pas un témoin, on le vise.* 🧾 Famille **§28** de `BUGS.md`. Fichiers : `Code.js`, `tracking.js`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1077. |

**ft-v1076 — 🔢 LES SÉRIES NUMÉROTÉES « 1, 2… 5 » — le compteur d'affichage et l'index d'écriture ne sont pas le même nombre** — Michel, vidéo à l'appui : dans le détail de sa séance, son Rowing Hammer affiche **1, 2, 5**, quand le Face Pull juste en dessous est bien 1-2-3.

**⛔ LA CAUSE, EN UNE LIGNE.** Les séries **non faites sont masquées** (`!s.done?'':`), mais le numéro affiché restait **`si+1`** — l'index dans le tableau **COMPLET**. Cinq séries dont deux non faites donnent donc *« 1, 2, 5 »*. ⭐ *Le trou n'était pas dans ses données, il était dans le comptage.*

**⭐⭐ ET MICHEL A CORRIGÉ MA LECTURE AVANT QUE JE ME TROMPE** : *« attention il ne manque rien, j'ai mis exactement ce que j'ai fait »*. Il a raison, et c'est cohérent : les deux séries invisibles sont celles de la **montée en charge ajoutée par l'app** (sa carte le dit : *« ⚡ Montée en charge ajoutée par l'app »*) — proposées, jamais faites, donc `done:false`. **Rien n'a été perdu ; deux séries qu'il n'a pas faites décalaient la numérotation des autres.**

**⛔⛔ LE PIÈGE ÉVITÉ EST PLUS GRAVE QUE LE BUG.** Ce même `si` est passé à **`updateSessSet(ei, si, …)`** : c'est lui qui dit **quelle série écrire** quand on corrige une valeur. Renuméroter l'index aurait fait taper la bonne valeur dans la **mauvaise série** — ***un correctif d'affichage qui abîme les données***, exactement le contraire de ce qu'on répare depuis ce matin. Le numéro affiché est donc un **compteur séparé**, et un témoin épingle que l'index d'écriture reste **0, 1, 4**.

**⭐ R8 VÉRIFIÉ, ET IL DIT DE NE RIEN TOUCHER AILLEURS** : les 3 autres endroits qui numérotent des séries (`log.js`, pendant la séance) affichent **toutes** les séries, faites ou non — leur `si+1` est donc **juste**. *Une jumelle qui n'en est pas une : on la vérifie, et on la laisse.*

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Des numéros qui se suivent se suivent. Rien n'apparaît, rien à apprendre.
Tests : **parcours 2030/2030** (+3, bloc **CLXXXI**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⭐ **La fixture EST son cas** : 5 séries dont les n°3 et 4 non faites. ⛔ **Le témoin ① existe pour que les deux autres mesurent quelque chose** (3 lignes visibles, pas 5). ⭐⭐ **Le ③ est celui qui protège les données**, pas l'affichage. **CONTRÔLE NÉGATIF : le numéro remis à `si+1` → ② rouge**, et le détail rend **`["1","2","5"]`** — sa vidéo au chiffre près. Fichiers : `setup.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1076. |

**ft-v1075 — 🔁 UN RÉCAP N'EST PAS UNE PROPOSITION · ⏱️ ET LE DÉPASSEMENT S'AFFICHE ENFIN** — deux retours de sa séance du 31/08 : *« pour le récap de ma séance il me met une nouvelle séance lol »* et *« le chrono négatif ne fonctionne pas »*.

**⛔⛔ ① LE RÉCAP LU COMME UNE PROPOSITION, ET LE TEXTE NE PERMET PAS DE LES DISTINGUER.** Le débrief de fin de séance **récapitule** ce qu'il vient de faire — avec les exercices ET les charges. `_extractDaySession` y lit donc une séance parfaitement valide, et la carte « Cette séance te convient ? » lui propose de ***refaire celle qu'il vient de terminer***. 👉 *Le texte est le même ; c'est l'INTENTION qui diffère — et elle ne se lit pas dans le texte, mais dans le VOISIN* : une réponse à une consigne interne (`_silent`) n'est jamais une proposition.

**⚠️ ET C'EST MA RÉGRESSION, POSÉE D'UN SEUL CÔTÉ.** ft-v1055 corrigeait **exactement ce défaut**… sur l'**autre** branche (celle de la demande, dix lignes plus bas). **R8**, le motif que ce fichier passe son temps à rattraper — refait par celui qui venait de l'écrire dans le journal.

**⛔ ET LE CORRECTIF N'EST PAS UN RECUL** : une **vraie** demande de séance garde sa carte. Un témoin le fige, sinon « ne plus jamais proposer » serait vert pour la mauvaise raison.

**⏱️ ② LE CHRONO NÉGATIF FONCTIONNAIT — L'ÉCRAN GO LE CACHAIT.** L'overlay remplace le nombre par **« GO »** et **reste jusqu'au tap** (c'est voulu : c'est le filet visuel en mode silencieux). Résultat : téléphone dans la poche, on revient, on lit « GO » — ***sans savoir si ça fait 20 secondes ou 4 minutes***. Or c'est précisément ce que le dépassement devait dire. Le « GO » reste (c'est le signal qu'on cherche du coin de l'œil) et le temps s'écrit à côté : **« C'EST REPARTI · +2 min 15 »**. *On ajoute une information, on n'en retire aucune.*

**⚠️ ET LA CAPTURE A CORRIGÉ CE QU'AUCUN TEST NE VOYAIT** : glissé après le « GO », le chiffre tombait **à gauche, par-dessus l'anneau**. Le texte était correct, sa **position** ne l'était pas. Reversé dans le libellé, il est centré **par construction** — *un élément de moins, c'est une mise en page de moins à se tromper.*

**⚠️⚠️ ET MON PROPRE TÉMOIN ⑤ A TROUVÉ UN DÉFAUT QUE J'AVAIS SUPPOSÉ ABSENT.** J'avais écrit que le libellé était « repeint à chaque tick » : **faux** — il ne l'est que dans la branche `left<=0`. Un repos **neuf** le laissait donc tel quel, affichant *« +2 min 15 »* sur un décompte qui vient de démarrer. **C'est la famille de ft-v1073 à deux jours d'intervalle** : *un état qui survit à son geste ment sur le suivant*. Remis à zéro à l'ouverture, à côté du fond, qui est là pour la même raison.

**⛔ UN SEUL PROPRIÉTAIRE DU FORMAT** (`_fmtDepassement`, **R2**) : l'écran GO et la pilule doivent annoncer la **même** durée — deux compteurs du même dépassement finiraient par diverger.

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE pour le récap** (c'est une réparation : ce qui n'aurait jamais dû s'afficher ne s'affiche plus). ⛔ **Et pas davantage pour le dépassement** : il apparaît sur un écran qu'on ne regarde que quelques secondes, il se lit tout seul, et il ne déplace rien. *Interrompre tout le monde pour annoncer un compteur de retard serait exactement le bruit que la règle #11 cherche à éviter.*
Tests : **parcours 2027/2027** (+6, bloc **CLXXX**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⛔ **Le témoin ① existe pour que le ② mesure quelque chose** : le récap doit **vraiment** contenir une séance extractible — sinon « plus de carte » serait vrai parce qu'il n'y a rien à extraire. ⭐ **Le ③ empêche le correctif d'être un recul.** ⭐⭐ **Le ⑤ a mordu sur du code que je croyais bon.** **CONTRÔLE NÉGATIF : les deux correctifs retirés → ②④ rouges**, `carte sous le débrief = true` et `{"num":"GO","over":""}`. ⭐ **Vérifié à l'écran** (l'overlay GO avec son « +2 min 15 » centré), **0 erreur JS**. Fichiers : `coach.js`, `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1075. |

**ft-v1074 — 🔤 UN GUILLEMET DOUBLE DANS UN ATTRIBUT EN GUILLEMETS DOUBLES — et ses DEUX bugs n'en font qu'un** — Michel : *« l'image quand je veux changer d'exercice a un beug »*, et son journal d'erreurs portait **4 × `SyntaxError: Unexpected token '}'`**, dont **3 en 11 secondes** à 12:55.

**⛔⛔ LA CAUSE, REPRODUITE DANS UN NAVIGATEUR.** `'onclick="f('+JSON.stringify(v)+')"'` rend `onclick="f("gene")"` : ***l'attribut se referme au 1ᵉʳ guillemet double***. Le navigateur compile alors `function onclick(event){ f( }` — **d'où l'accolade « inattendue » de son message**. Le handler reçoit `undefined` et rien n'est enregistré. 👉 *`JSON.stringify` échappe parfaitement pour **JavaScript**. Il ne sait rien de l'**HTML**, qui est la couche du dessus.* **Deux couches, deux échappements — en oublier un ne casse pas le texte, ça casse le CODE.**

**⭐⭐ ET SES DEUX BUGS N'EN FONT QU'UN.** Le « Pourquoi ce changement ? » et le bouton **photo** d'un exercice (`changeExImg`) partagent la même ligne de faute : avec un nom comme *« Tirage Poulie Haute (Lat Pulldown) »*, l'attribut casse pareil. *Un seul correctif ferme les deux.*

**⛔ LE COÛT ÉTAIT SILENCIEUX ET IL DURAIT DEPUIS LE 28/08.** Aucune réponse à « Pourquoi ce changement ? » n'a **jamais** été enregistrée → `S.exSwaps` est resté **vide** → la promesse *« dis-moi pourquoi et Milo ne te le repropose plus »* n'a **jamais tenu**. Ses **4 erreurs sont ses 4 appuis** : il a répondu quatre fois, quatre fois dans le vide.

**⭐⭐ ET LE DÉPÔT CONTENAIT DÉJÀ LA BONNE RÉPONSE — À UN SEUL ENDROIT.** `oublierExSwap` (setup.js) faisait `.replace(/"/g,'&quot;')`. **R8 dans sa forme la plus pure** : 5 sites, 1 juste, 4 faux. ⛔ Les cinq passent maintenant par **un seul propriétaire**, `_argAttr` (**R2**) — sinon le 6ᵉ site réinventera un 6ᵉ échappement. ⛔ **Et le nom est explicite exprès** : `_argAttr` se lit *« argument pour un attribut »* ; un `_esc()` générique se serait fait employer là où il ne fallait pas.

**💾 ET LA 2ᵉ DEMANDE DE MICHEL EST LIVRÉE AVEC** : *« on verra si on peut pas faire 2 sauvegardes par jour »*. ⭐ **Rien à construire côté fichier** — `backupAllUserData_` gère **déjà** un 2ᵉ passage le même jour (suffixe `-HH-mm`). ⛔ **2h ET 14h, pas 2h et 3h** : ce qu'on réduit est la **fenêtre de perte** — avec une seule sauvegarde nocturne, une séance faite à 13h et abîmée à 14h n'a jamais été sauvegardée. Les deux passages **encadrent la journée d'entraînement**. ⚠️ **Le coût est écrit plutôt que découvert** : le dossier est en **append-only**, on passe de ~365 à **~730 fichiers/an** pour une alerte de quota posée à **1000** — *elle tombera dans ~16 mois*, et la purge devra être une décision. ⚠️ **Un déploiement ne recrée PAS les déclencheurs** : la manip (1 clic sur `installDailyBackupTrigger_`) est dans `A-FAIRE-SUR-PC.md`.

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Des boutons qui ne faisaient rien font ce qu'ils annoncent. Rien n'apparaît, rien à apprendre. ⚠️ *Et l'annoncer reviendrait à dire « la question qu'on te posait depuis trois jours ne servait à rien » — ce que le journal dit, et qui n'a pas à interrompre les autres.*
Tests : **parcours 2021/2021** (+5, bloc **CLXXIX**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⭐⭐ **Le témoin ② va jusqu'au VRAI CLIC** et vérifie que la raison est **enregistrée** — lire l'attribut n'aurait prouvé qu'une chaîne bien formée, pas un bouton qui marche. ⭐ **Le ④ prend le pire nom possible** (espaces **et** parenthèses), c'est-à-dire le sien. ⛔ **Le ⑤ compte les erreurs JS de tout le parcours** : c'était son symptôme visible. **CONTRÔLE NÉGATIF : l'échappement retiré → 4 rouges**, et le détail imprime sa situation — `attribut=repondreExSwap(` et **`enregistré={}`**. 🧾 Famille **§27** de `BUGS.md`. Fichiers : `log.js`, `setup.js`, `Code.js`, `tests/parcours/runner.js`, `BUGS.md`, `A-FAIRE-SUR-PC.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1074. |

**ft-v1073 — 🔴 LE SÉLECTEUR RENOMMAIT AU LIEU D'AJOUTER — et il abîmait l'historique** — Michel, capture à l'appui : *« je rajoute le rowing hammer… et en regardant de plus près je vois que mon tirage a été remplacé par le rowing hammer »*.

**⛔⛔ LA CAUSE EST R15, ET C'EST LA 3ᵉ FOIS — MAIS LA PREMIÈRE QUI TOUCHE AUX DONNÉES.** Le sélecteur d'exercices garde un **mode** (`_exPickerMode`) et un **index** (`_replaceEi`), tous deux remis à zéro par `closeExPicker()`. Or **`mod-ex` n'était pas déclaré dans `_OVERLAY_CLOSERS`** : fermé **en glissant, à côté ou par Échap**, on tombait sur le repli et `closeExPicker()` n'était **jamais appelé**. 👉 ***Le mode restait « remplacer » avec son index — et l'ouverture suivante, faite pour AJOUTER, RENOMMAIT l'exercice mémorisé.***

**⛔ LE DÉGÂT EST RÉEL ET IL EST PARTI LOIN.** Son Tirage Poulie Haute est devenu « Rowing Hammer Strength » **en gardant ses séries et sa consigne** — d'où un **1RM fabriqué de 81,9 kg** dans ses records, dans Sheets, et dans le débrief de Milo, qui a commenté *« le saut vers 66 kg était trop brutal »* **sur le mauvais exercice**. *Son tirage n'existe plus dans son historique.* ⛔ **Aucune donnée n'est touchée par ce correctif** : il est préventif, et la réparation de sa séance lui sera proposée à part (**R29**).

**⭐⭐ DEUX CORRECTIFS, ET LE SECOND EST CELUI QUI COMPTE.** ① `mod-ex` déclaré dans les fermetures propres — ça ferme **le chemin connu**. ② Mais ***le défaut de fond n'est pas la fermeture, c'est qu'un état pouvait SURVIVRE à son geste*** : `openExPicker(mode)` **impose** désormais son mode (défaut `'workout'`) au lieu de l'hériter. Un mode oublié par **n'importe quelle** voie retombe donc sur « ajouter », le geste sans conséquence. 👉 ***Quand un état se perd, il doit se perdre du bon côté.***

**⛔ ET L'INDEX PART AVEC LE MODE** : ils décrivent la **même intention**, ils vivent et meurent ensemble (**R2**). *Un index d'exercice qui survit à son mode est une cible qui attend.*

**⚠️ LES 5 MODES SPÉCIAUX ONT DÛ SUIVRE, sinon je les cassais tous.** `replace` · `prog` · `addToGroup` · `addSess` · `replaceSess` posaient leur mode **juste avant** l'ouverture ; ils passent maintenant par le **paramètre**, et leur affectation d'avant est retirée — sinon deux sources décriraient le même état (**R2**). Un témoin vérifie que les cinq restent atteignables **et** que le défaut est bien « workout ».

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** C'est une **réparation** : « ajouter » ajoute. Rien n'apparaît, rien ne bouge, il n'y a rien à apprendre.
Tests : **parcours 2016/2016** (+7, bloc **CLXXVIII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⭐⭐ **Le témoin ② rejoue SON cas à l'identique** — ouvrir « Remplacer », fermer **au doigt**, rouvrir pour ajouter. ⛔ **Le ① existe pour que les autres mesurent quelque chose** (la séance de départ porte bien ses 2 exercices). ⭐ **Deux non-régressions** : le vrai remplacement garde ses séries (65 kg intacts), et les 5 modes spéciaux répondent toujours. **CONTRÔLE NÉGATIF : l'ancien code REPRODUIT son bug** — `{"apresDoigt":"replace","idx":1}` et **2 exercices au lieu de 3**, le troisième n'ayant jamais été ajouté. 🧾 Famille **§26** de `BUGS.md` — *à chaque fois, le chemin oublié était le glisser du doigt*. ⭐ Point de retour : `0ca1335`. Fichiers : `screens.js`, `log.js`, `setup.js`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1073. |

**ft-v1072 — 🔒 ON N'ANNONCE QU'À CEUX QUI PEUVENT S'EN SERVIR** — Michel, en voyant partir la pop-up des pas : *« sauf que les pas ne sont que pour moi attention »*.

**⛔⛔ IL AVAIT RAISON, ET LE DÉFAUT ÉTAIT DANS L'ANNONCE, PAS DANS LE COMPORTEMENT.** Mesuré : `WHATS_NEW` et `NEW_FEATURES` n'avaient **aucun filtre par personne** — seulement « déjà vu ». Or le sommeil mesuré (**v64**, ft-v1069) et les pas (**v65**, ft-v1070) exigent un **raccourci iOS que seul Michel a installé**. 👉 ***Christophe, Eline, Emma et Tatiana recevaient donc une pop-up et trois points rouges pour une fonctionnalité qu'ils ne peuvent pas avoir.*** ⭐ **Le code, lui, était déjà correct** — carte masquée, aucune ligne sous le TDEE, TDEE inchangé : *ce n'est pas la fonctionnalité qui débordait, c'est sa publicité.*

**⭐⭐ ET LE DÉFAUT ÉTAIT DOUBLE, DONC IL VENAIT DE MOI DEUX FOIS.** Sa remarque portait sur les pas ; en cherchant la jumelle (**R8**), le **sommeil mesuré de ft-v1069 avait exactement le même défaut**, livré la veille. *Une remarque sur un cas révèle une famille — c'est le réflexe le plus rentable de ce projet.*

**👉 UN PRÉDICAT OPTIONNEL `si`**, résolu par `_featSi` — **seul propriétaire** de *« cette personne peut-elle s'en servir ? »* (**R2**), et les **8 lecteurs** de `NEW_FEATURES` y passent tous (sans quoi le correctif serait posé d'un seul côté, le motif que ce fichier passe son temps à rattraper). ⛔ **Sans `si`, le comportement est EXACTEMENT celui d'avant** : les **121 entrées existantes ne bougent pas d'un pixel**, et c'est ce qui rend le changement sûr (**R13**, comme `refTs` en ft-v1017).

**⛔ ET C'EST UN NOM, PAS UNE FONCTION** : ces tableaux partent dans le cloud et sont relus par des outils — une fonction n'y survivrait pas. Le registre `FEAT_SI` les résout.

**⛔ LA CONDITION EST UN FAIT VÉRIFIABLE, PAS UNE DÉCLARATION.** On ne demande pas *« as-tu une montre ? »* — l'app ne le sait pas : on regarde si **la donnée est arrivée** (`healthDaily[].sleep` / `.steps`). ⭐ Et les deux conditions sont **distinctes** : recevoir le sommeil n'ouvre pas l'annonce des pas.

**⛔⛔ ET LE PIÈGE ÉTAIT DANS LE MARQUEUR « VU », TROUVÉ EN LISANT LE CODE AVANT D'ÉCRIRE.** `ft4_wn_seen` est un **plafond numérique** : le fermer marque vues **toutes** les entrées jusqu'au maximum. Une conditionnelle **jamais affichée** aurait donc été **enterrée pour toujours** — le jour où la personne branche son raccourci, elle n'aurait **jamais** vu l'annonce. 👉 Les conditionnelles se suivent **une par une, par leur numéro** (`ft4_wn_cond`), comme les points rouges. ⭐ **Le témoin ⑤ fige exactement ça** : sans montre, on ferme un « Quoi de neuf », puis on branche la montre → les deux pop-ups sont **toujours annonçables**.

**⛔ UN NOM INCONNU LAISSE PASSER, IL NE CACHE PAS.** Une faute de frappe dans `si` doit produire l'**ancien** comportement (trop d'annonces), jamais un silence que personne ne verrait : *un bug visible se corrige, un bug muet se subit.*

**⚠️ ET UN DE MES PROPRES TÉMOINS A ROUGI SUR DU CODE CORRECT** : le ⑦ mesurait la rétrocompatibilité **après** avoir posé une montre — les 3 conditionnées y étaient donc **légitimement** visibles, et il comparait 124 à 124, c'est-à-dire **rien**. *Un témoin doit CONSTRUIRE l'état qu'il affirme*, pas hériter de celui du témoin précédent. (Même leçon qu'en ft-v1054, où j'épinglais une heure impossible.)

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE, et c'est le seul choix cohérent.** *Annoncer un correctif dont l'objet est de moins annoncer serait une contradiction.* Pour ceux qui n'ont pas de montre, du bruit disparaît ; pour Michel, rien ne change.
Tests : **parcours 2009/2009** (+8, bloc **CLXXVII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⛔ **Le témoin ① existe pour que les sept autres mesurent quelque chose** : les 2 pop-ups et les 3 points rouges concernés doivent **exister** — sinon « aucune annonce » serait vrai pour la mauvaise raison. ⭐⭐ **Le ② porte sa remarque** (sans montre : rien) et le **③ l'empêche d'être vert en n'annonçant plus jamais rien** (avec la montre : tout revient). ⛔ **Le ⑤ est le plus important** : le plafond n'enterre plus les conditionnelles. **CONTRÔLE NÉGATIF : le résolveur remis à `return true` (l'état d'avant)** → **②④ rouges**, et le détail imprime exactement sa plainte : `{"popups":[65,64],"feats":["pas-courbe","pas-surplus","sommeil-mesure"]}` chez quelqu'un **sans montre**. Fichiers : `constants.js`, `screens.js`, `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1072. |

**ft-v1071 — 🚶📈 LA COURBE DES PAS : ILS S'AFFICHENT ENFIN QUELQUE PART** — Michel, dix minutes après ft-v1070 : *« les pas vont s'afficher où ? »*

**⛔⛔ LA RÉPONSE HONNÊTE ÉTAIT « NULLE PART », ET C'EST MOI QUI AI DÛ LE DIRE.** Vérifié plutôt que répondu de mémoire : le surplus n'apparaissait qu'en **petit sous le TDEE**, et **seulement les jours de grosse marche**. Son **nombre de pas n'était affiché nulle part** — ni Accueil, ni Progrès. 👉 ***L'app recevait la donnée, s'en servait pour ses calories, la donnait à Milo — et ne la lui montrait jamais.*** C'est **R5** sous une forme atténuée, et la plus traître : la donnée produisait bien un comportement, mais **pas celui qu'il attendait**. *Sa question en quatre mots a trouvé le trou que ma propre livraison de la veille avait laissé.*

**⭐ SON CHOIX ENTRE QUATRE EMPLACEMENTS** : *« dans Progrès, avec une courbe »*. ⭐ **Et l'endroit a été mesuré, pas supposé** : ni les pas ni la FC au repos n'avaient d'écran, et l'onglet **Poids** est le seul qui porte les **MESURES** (poids, masse grasse, bilan corporel, prise de sang). Les pas viennent de la même montre.

**⛔⛔ LE PIÈGE ÉTAIT DANS L'ACCROCHE, ET IL SE LIT DANS LE CODE AVANT DE CODER.** `renderWeightTab` sort par un **`return`** quand il y a **moins de 2 pesées**. Accrochée en bas, la carte des pas ***n'apparaîtrait JAMAIS chez quelqu'un qui ne se pèse pas*** — une dépendance invisible entre deux données qui n'ont rien à voir, et une panne parfaitement silencieuse. Elle se rend donc **en premier**. ⭐ **Le témoin ③ fige exactement ça** : contrôle négatif avec l'accroche remise à la fin → `{"affichee":false}`.

**⭐ R13 — C'EST `_sleepChartHtml` TRANSPOSÉ** (barres SVG · ligne repère · moyenne · fenêtre 7/30), pas un composant neuf. ⛔ **Et `_pasEcart` reste le SEUL propriétaire du surplus** (**R2**) : la carte l'**affiche**, elle ne le recalcule jamais — un témoin vérifie que la base montrée est **exactement** celle qui sert aux calories.

**⛔⛔ LE TRAIT VERT EST SON HABITUDE, PAS UN OBJECTIF — et c'est une décision, pas un détail.** Dessiner « 10 000 pas » aurait été une **cible que personne n'a choisie**, sur un écran qui ne fait que décrire. *L'app ne dit pas qui tu dois devenir, elle se souvient de qui tu es devenu* (la Vision, **R29**). Un témoin refuse tout objectif imposé. ⛔ Et les journées **sous** la base sont en **gris**, jamais en rouge : *un jour de repos n'est pas un échec* (**R24**).

**⛔ LA CARTE DIT CE QU'ELLE IGNORE**, comme le contexte de Milo : *« des pas ne disent pas CE QUE tu as fait »*. La même honnêteté doit valoir en vert et joliment dessiné que dans un prompt.

**⛔ ET ELLE NE S'AFFICHE PAS DU TOUT SANS MONTRE** : une carte vide chez quelqu'un qui n'a rien branché est du bruit permanent qui lui parle d'une chose qu'il n'a pas (**R24**). ⛔ Sans 7 jours, elle **le dit** (*« habitude pas encore connue »*) au lieu d'afficher un surplus qu'elle ne sait pas calculer — sinon la personne croirait que sa journée n'a rien valu (**R29**).

**⚠️ ET UN DÉFAUT TROUVÉ À LA CAPTURE, INVISIBLE À TOUTE MESURE** : le libellé *« ton habitude »*, posé **dans** le graphique, tombait **par-dessus une barre verte**. Le texte était correct ; c'est sa **position** qui ne l'était pas. Sorti en légende — où il porte en plus **le chiffre** (*« ton habitude, 6 450 pas/jour »*), ce que le trait seul ne disait pas.

**📣 RÈGLE D'OR #11 — LES POINTS 2 À 5, ET PAS DE 2ᵉ POP-UP.** Point rouge `pas-courbe` sur Progrès · aide `?` de Progrès **en tête** · aide détaillée · **diapo du Guide ENRICHIE, pas doublée**. ⛔ **La pop-up ne se mérite pas ici, et c'est argumenté** : `WHATS_NEW` **v65** vient d'annoncer que les pas comptent — une seconde pop-up le lendemain pour dire *« et voilà où les voir »* serait du bruit (**R25**). ⛔ **Et on ne RÉÉCRIT pas la v65** : *réécrire une annonce datée falsifie ce qui a été annoncé ce jour-là.* L'absence de pop-up est **figée par un témoin**, parce que c'est une décision.
Tests : **parcours 2001/2001** (+9, bloc **CLXXVI**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⭐⭐ **Le témoin ③ est celui qui compte le plus** — il vient d'un piège lu dans le code **avant** d'accrocher la carte, pas d'un bug subi. ⛔ **Le ① existe pour que les autres ne soient pas verts partout** : sans montre, rien ne s'affiche. **CONTRÔLE NÉGATIF : l'accroche remise à la fin de `renderWeightTab`** → ③ **rouge**, `{"affichee":false,"txt":""}`. ⭐ **Vérifié à l'écran** (2 captures : la carte repliée, puis la courbe dépliée avec le trait d'habitude), **0 erreur JS**, 🔴 **bouton central `[139, 792, 56, 44]`**. Fichiers : `tracking.js`, `index.html`, `screens.js`, `constants.js`, `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1071. |

**⭐⭐ LA FRONTIÈRE AVEC LA BRIQUE 7 EST ÉCRITE DANS LA VISION, ET C'EST ELLE QUI DÉCIDE DE TOUT** : la **7** répond à *« que s'est-il passé ? »* — elle **relie** des événements (le souvenir d'hier) ; la **8** répond à ***« qu'est-ce que cette histoire m'apprend ? »*** — elle **prend du recul**. Tournures autorisées noir sur blanc : *« ton historique semble montrer que… »*, *« une constante apparaît… »*. ⛔⛔ **Jamais *« tu devrais »*** — sinon la brique cesse d'être un miroir et devient un coach qui prescrit (**P14**). Un témoin refuse tout verbe de prescription dans le rendu.

**⛔ UNE CONSTANTE EST UN FAIT COMPTÉ, PAS UN JUGEMENT.** *« Tes séances sont le plus souvent dominées par le haut du corps — 11 sur 14 »* se vérifie ; *« tu négliges tes jambes »* est un reproche, et personne n'a demandé d'avis. ⛔ **Et aucune comparaison à une norme** : écrire *« il faudrait 3 fois par semaine »* serait une prescription déguisée en statistique. **La personne tire sa propre conclusion — c'est tout l'objet de la brique**, et le pied de section le dit : *« Des faits tirés de ton historique — à toi d'en tirer ce que tu veux. »*

**⛔ CHAQUE LIGNE NOMME SA FENÊTRE** (*« sur 14 séances étalées sur 31 jours »*). Sans ça, deux constantes calculées sur des périodes différentes se contredisent à l'écran **sans que rien ne le dise** — c'est exactement le défaut de **ft-v1027**, qu'on ne refait pas.

**⚠️⚠️ ET DEUX NOMS SUPPOSÉS M'ONT COÛTÉ UNE CONSTANTE CHACUN.** ① `_calSessMix` rend `{reg, pc}` — j'avais écrit `m.region` : la constante d'équilibre ne sortait **jamais**, **en silence**, sans erreur ni test rouge. ② Et mon libellé disait *« le tronc revient **0 fois** »* — or `_calSessMix` rend la région **DOMINANTE** d'une séance, pas la liste de ce qui a été travaillé : ça se lit *« tu ne travailles jamais ton tronc »*, et **c'est faux**. 👉 *Une mesure juste peut produire une phrase fausse* — la leçon de **ft-v1035**, retrouvée le lendemain. Le texte dit *« dominées par »*, et la seconde moitié ne sort que si la région apparaît **au moins une fois** ; un témoin interdit le mot *« jamais »*.

**⛔ SOUS LE SEUIL, ELLE DIT QU'ELLE NE SAIT PAS — elle ne se tait pas.** Il faut **8 séances sur 21 jours** : *une « constante » sur 5 séances, c'est du hasard*, et il faut aussi de la **durée** (8 séances en une semaine ne montrent aucun rythme). Mais un cadre vide se lit comme un chargement qui a échoué (leçon de **ft-v1021**) — alors elle affiche où on en est. ⛔ **Aucune séance du tout → la section n'existe pas** : elle ne prend pas un pixel.

**⛔ RIEN N'EST CALCULÉ DE NEUF (R13/R2)** : l'équilibre réutilise `_calSessMix`, qui range déjà via `_mscScores`. Une 2ᵉ façon de classer un exercice divergerait de la figurine, du calendrier et des calories. ⛔ **Et un seul propriétaire de *« que montre ton historique ? »*** (`_synthConstantes`) : la section et un futur message de Milo doivent lire la même chose.

**📣 RÈGLE D'OR #11 — les points 2 à 5, et PAS de pop-up.** Point rouge `synthese-constantes` sur l'onglet Progrès · aide `?` · aide détaillée · **32ᵉ diapo du Guide, sans image exprès** (les constantes dépendent de l'historique du lecteur — une capture montrerait des chiffres qui ne sont pas les siens). ⛔ **La pop-up ne se mérite pas** : rien à faire, aucun repère déplacé, et la section porte son titre et son pied d'explication.

**⭐⭐ ET LE TABLEAU DES BRIQUES EST COMPLET — mesuré depuis le code, pas déclaré** : la 8 passe de **🟠 socle seul** (qui était faux) à **✅ branchée** (`3` de signal, `4` de porte). **Les 8 briques du socle sont branchées**, pour la première fois depuis que le tableau est généré.

**⚠️⚠️ UN TÉMOIN EXISTANT A ROUGI — TROIS FOIS — ET LA CAUSE ÉTAIT LA MONTRE, PAS LE CODE.** Le bloc **CXXXVII** (session-A, ft-v1034) tombait à `lignes de reste = 0`. Mesuré : **20:12 à Paris**, c'est-à-dire **après la bascule de ft-v1029**, où *« ce qu'il te reste »* se tait exprès (garde-fou anti-TCA). ⛔ **C'est mon propre défaut, retrouvé un cran plus loin** : ft-v1029 avait épinglé les appels **directs** à 14 h, mais ces deux témoins-là lisent l'**écran rendu** — et `renderNutrition()` appelle la chaîne sans heure. *Épingler l'appel direct ne suffit pas quand on mesure le RENDU.* 👉 L'horloge du navigateur est figée à 14 h, **aucune exigence n'est affaiblie**, et un témoin de plus **nomme l'heure de mesure** : sans lui, un décrochage futur ferait tomber trois témoins et on chercherait la régression dans le CSS.

**⭐⭐ ET CE TÉMOIN SENTINELLE A SERVI TOUT DE SUITE — CONTRE MOI, À LA PASSE SUIVANTE.** Mon épinglage faisait `new Date().setHours(14)` **côté Node**, dont le fuseau est **UTC** : la page voyait **16 h à Paris**. Les trois témoins repassaient au vert (16 h < 20 h), donc **l'épinglage était faux ET vert** — exactement ce qu'on ne voit jamais. Seul le témoin qui **nomme l'heure** l'a dit : `heure mesurée = 16 h`. 👉 *Un témoin qui affirme une condition doit la MESURER, pas la supposer remplie parce que les autres passent.* L'instant est maintenant calculé depuis le **décalage réel du jour** (jamais un « +2 » en dur, faux six mois par an) — **c'est la famille « fuseaux horaires » de `BUGS.md`, retrouvée dans le test écrit pour s'en protéger.**

**🧾 ET UN DOUBLON DE GOUVERNANCE, DE LA MÊME CAUSE QUE D'HABITUDE.** Ma ligne 🟢 de ft-v1032 était **écrite deux fois** dans le journal de partage, les deux exemplaires ne différant que d'un mot (`ft-v1031` / `ft-v1035`) sur **1 400 caractères** — invisible à l'œil, invisible à un `diff`. 👉 *Une fusion par union ne ressuscite pas seulement ce qu'on a retiré : elle **dédouble** ce qu'on a modifié.* Le **contrôle 7** de `check_regles.py` attrapait 🟡+🟢 ; il lui manquait 🟢+🟢. Complété et **éprouvé dans les deux sens** (sortie 1 avec le doublon, 0 sans).

**⭐⭐ ET LA FUSION A RÉVÉLÉ QUE LES DEUX SESSIONS AVAIENT TROUVÉ CE DÉFAUT D'HORLOGE LE MÊME SOIR, SÉPARÉMENT** — session-A en ft-v1040, moi ici. Git a donc empilé **deux épinglages** sur le même bloc : un sur le contexte, un sur la page. ⛔ *Deux propriétaires de la même horloge finiraient par dire deux heures différentes* (**R2**) — il n'en reste **qu'un**. ⭐ **Et c'est le CALCULÉ qui reste, pas le mien par principe** : le leur figeait la date en dur (`'2026-08-27T14:00:00+02:00'`) et avec elle le décalage d'**été** — faux six mois par an. Les deux commentaires sont fusionnés en un seul, comme pour le `.sw-feat b` du 27/08 au matin : *deux découvertes indépendantes valent mieux qu'une, et effacer l'une effacerait la trace.*
Tests : **parcours 1694/1694** ⚠️ *(mesuré sur l'arbre **FUSIONNÉ** avec le ft-v1040 de session-A, pas sur le mien seul — 1687 avant fusion)* (+11, bloc **CXLV** — ⚠️ session-A avait pris CXLIV pour son ft-v1040, poussé le premier : **4ᵉ collision de la semaine**, on paie un numéro plutôt que deux blocs répondant au même nom), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin qui protège la Vision est celui de la PRESCRIPTION** : aucun *« tu devrais / il faudrait / augmente / réduis »* dans tout le rendu — c'est la seule chose qui distingue la brique 8 d'un coach, et rien d'autre ne la garde. ⭐⭐ **Et celui qui protège la personne est celui du mot « jamais »** : la région mesurée est la **dominante**, pas ce qui a été travaillé. ⭐ **Deux témoins empêchent les silences d'être verts en ne mesurant rien** : sous le seuil la section **dit** qu'elle ne sait pas encore, et l'historique complet fait bien **sortir les trois constantes**. **CONTRÔLE NÉGATIF : le bloc entier ne peut pas tourner contre ft-v1039** (`_synthConstantes is not defined`) — la limite habituelle. ⭐⭐ **Alors un CIBLÉ sur ce qui existait des deux côtés** : même historique, même onglet Progrès rendu — contre ft-v1039 `#prog-synth` **n'existe pas** et l'écran ne dégage **rien** ; contre ft-v1041, la section est en tête avec ses trois lignes. ⭐ **Vérifié à l'écran** : la section au-dessus des sous-onglets, sobre, **sans aucune couleur de statut** (une constante n'est ni un succès ni un échec) et elle **survit au changement de sous-onglet**. **0 erreur JS**, 🔴 **bouton central inchangé**. Fichiers : `setup.js`, `index.html`, `style.css`, `constants.js`, `screens.js`, `coach.js`, `app.js`, `tools/briques.py`, `tools/check_regles.py`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `DOSSIER-ATHLETE-SUIVI.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1041. |


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
