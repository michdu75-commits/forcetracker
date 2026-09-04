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

> **Version actuelle : `ft-v1126`** (prochaine : `ft-v1127`). Historique complet (ft-v128→574 + gouvernance
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

**ft-v1126 — 💰 « COÛT RÉEL DU JOUR » NE DISAIT PAS DE QUEL JOUR — ET MES TROIS ESTIMATIONS DE LA SOIRÉE ÉTAIENT FAUSSES** — Michel, capture à l'appui : *« on ne sait pas si c'est dans la journée ou depuis 1 mois »*.

**⛔ LE DÉFAUT TIENT EN UNE PHRASE.** Le titre disait « du jour » — **exact**, vérifié dans le code (`_aiUsageAdd_` remet le compteur à zéro dès que la date change). Mais **rien ne le prouvait à l'écran**, et *1,02 € ne se lit pas pareil selon qu'il couvre une journée ou un mois*. 👉 ***Un chiffre sans sa période n'est pas un chiffre, c'est une impression.***

**⭐⭐ ET IL N'Y AVAIT RIEN À CONSTRUIRE — R5, ENCORE.** `_aiUsageLire_` **renvoyait déjà `u.date`** : l'app la recevait et la jetait. *Une donnée produite, transmise, jamais montrée* — le défaut exact de `topUsers` en ft-v1058. **Le correctif est un affichage, pas une fonctionnalité.**

**⚠️⚠️ ET UN PIÈGE ÉVITÉ QUI A DÉJÀ COÛTÉ UNE VERSION.** J'allais écrire `_dateLisible(...)` pour formater la date — elle existe bien dans le projet. **C'est une const LOCALE à une fonction de `coach.js`.** L'appeler depuis `app.js` aurait levé `is not defined` et ***fait disparaître TOUT le panneau Santé***, pas seulement cette ligne. *C'est le `_esc is not defined` de ft-v1114, qui avait vidé la liste des aliments entière.* ⭐ **Vérifié AVANT d'écrire l'appel** — la seule différence avec la fois précédente. ⚠️ Au passage, la date est construite en **local** (`new Date(a, m-1, j)`) et non depuis une chaîne ISO, qui serait lue en **UTC** et afficherait la veille à l'ouest de Greenwich.

**⭐⭐ MAIS LE VRAI SUJET DE CETTE VERSION EST AILLEURS : MICHEL M'A DEMANDÉ CE QUE COÛTE UN MESSAGE, ET J'AI DONNÉ TROIS RÉPONSES DIFFÉRENTES.** *« La nutrition ne va pas gonfler la facture ? »* → *« combien coûte un message ? »* → *« les emoji coûtent cher ? »*. J'ai annoncé **8,5 c**, puis **16,5 c**, avant d'aboutir à **≤ 12,9 c**. **Trois erreurs, toutes de méthode** :

**⛔ ① J'AI APPLIQUÉ LE TARIF DU CACHE 5 MIN (×1,25) À UN CACHE 1 H (×2,0).** Les deux valeurs étaient écrites dans `docs/BRIEFING-GPT-COUT-IA.md`, **à quinze lignes l'une de l'autre**, dans un fichier que je n'avais pas rouvert avant de calculer (**R23**).

**⛔⛔ ② J'AI EXPLIQUÉ UN RATIO DENSE PAR LES EMOJI — MESURÉ ENSUITE : 142 DANS TOUT LE CONTEXTE, 0,59 % DU TEXTE.** Un emoji tous les 517 caractères. *Les traits de cadre (`═══ ─── │ →`) pèsent trois fois plus (1,59 %), et les retirer tous économiserait 0,02 à 0,05 centime par message.* 👉 ***Mon explication était fausse même quand le chiffre expliqué venait d'ailleurs*** — et je l'avais donnée avec l'assurance d'une mesure.

**⛔⛔ ③ ET LE PIRE : J'AI BÂTI TROIS CALCULS SUR UNE CONSTANTE QUE PERSONNE NE POUVAIT VÉRIFIER.** Le « ≈ 24 900 jetons » du document d'août est posé **sans aucune méthode**, seul de son espèce dans un fichier dont l'en-tête promet des chiffres mesurés. ⭐⭐ **Les vrais chiffres de Michel le RÉFUTENT** : 286 818 jetons d'entrée traités pour **12 appels `coach`** → le contexte pèse **au plus 23 900 jetons**, donc **au moins 3,07 caractères par jeton** (le document disait **2,35**). *Tout ce qui en découlait était surestimé de 30 à 45 %.*

**⭐⭐ ET LE REMÈDE N'ÉTAIT PAS UN MEILLEUR MODÈLE — C'ÉTAIT D'OUVRIR L'ÉCRAN QUI AFFICHE LA VÉRITÉ.** Il existe depuis le **24/08** : le Worker capte le champ `usage` de l'API à **chaque** appel. *Sa journée du 4 septembre : **25 appels · 1,02 € · 4,1 centimes par appel**.* ⭐ **Une mesure vaut mieux que le meilleur modèle**, et j'ai raffiné trois fois un calcul au lieu d'aller la chercher.

**⭐ UNE BONNE NOUVELLE AU PASSAGE, ET ELLE EST MESURÉE** : **82 % de l'entrée passe par le cache** (236 479 jetons lus contre 50 339 payés plein tarif). C'est **l'inverse exact** du constat d'août, où les lectures ne faisaient que 8,1 % des écritures et où *« le cache coûtait 16 % de plus que s'il n'existait pas »*. **Le cache est devenu rentable.**

**🍽️ ET LA QUESTION DE DÉPART A SA RÉPONSE** : la nutrition pèse **890 caractères sur 73 500** (**1,2 %**), **plafonnés à 7 jours en dur** — trois ans de repas notés n'ajoutent pas une ligne. **20 à 80 centimes sur mille messages.** ⭐ Et Milo la lit bien depuis ft-v1014 : les **totaux par jour**, jamais les noms d'aliments (13 126 car. bruts → 890, **59× moins**), plus ses cibles. *La nutrition n'est pas un sujet de facture ; les 45 000 caractères de règles en sont un.*

**📣 RÈGLE D'OR #11 — RIEN.** Le panneau Santé est **derrière l'admin** : seul Michel le voit, et c'est lui qui a signalé le manque. Annoncer à tous les utilisateurs une ligne qu'ils ne verront jamais serait du bruit pur (R19/R25).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **le « ≈ 24 900 » du §2 n'est PAS corrigé sur place, exprès** — *on ne réécrit pas une mesure d'août avec une déduction de septembre* ; il est encadré au §7 avec sa réfutation (**R30**). ⚠️ Et **`cacheW` est compté par le serveur mais pas affiché** : c'est le seul morceau qui manque pour passer d'une borne à un chiffre exact. *Une donnée produite et non montrée, encore* (**R5**) — noté, pas « réparé » dans la foulée.

Tests : **parcours 2720/2720** (+8, bloc **CCXXXII**), **calculs 298/298**, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin qui porte le vrai risque n'est pas « la date s'affiche » — c'est que le code n'appelle PAS `_dateLisible`** : *c'est le seul défaut qui aurait fait disparaître le panneau entier, et il ne se voit dans aucun test qui se contente de lire le texte rendu.* ⭐ **Deux replis figés** : si le serveur n'envoie pas la date, ou si elle est illisible, on affiche « journée en cours » — **jamais « undefined »**, qui serait pire que pas de date du tout. ⛔ **Un contrôle empêche le bloc d'être vert sur du vide** (le panneau doit être chargé), et les chiffres du témoin sont **ceux de sa capture**, pas des chiffres inventés. Fichiers : `app.js`, `tests/parcours/runner.js`, `docs/BRIEFING-GPT-COUT-IA.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1126. |

**ft-v1125 — 🤝 LES 2 SUITES DU RELAIS DE SESSION-A — ET LA PROMOTION A TROUVÉ MIEUX QU'ELLE-MÊME** — Michel : *« il a fini »*, puis il choisit le relais. Session-A avait laissé deux suites **dans mon couloir** plutôt que d'y toucher : corriger sa fixture, et promouvoir AB-2 au banc d'essai.

**⛔⛔ ① LA FIXTURE DU TEST A/B NE FAISAIT PAS CE QU'ELLE ANNONÇAIT.** `_abHistoDC` disait en commentaire *« des charges qui PROGRESSENT »* et le barème **descendait** : la séance la plus **récente** était la plus **légère** (80 kg la veille), alors que le record de la même fixture est **95 kg il y a 9 jours**. ⭐⭐ **Trouvé par session-A en lisant la VRAIE passe, pas le code** — et c'est le point de méthode : *un défaut de fixture ne se voit pas en relisant la fixture, il se voit dans ce qu'elle produit.*

**⭐ MESURÉ AVANT DE CORRIGER, ET LA CAUSE EST PLUS ÉTROITE QUE « LE TEMPS EST INVERSÉ ».** Les **dates** étaient dans le bon sens (`i=0` = hier, conforme au tri par date décroissante de `state.js`) — **c'est le kg qui descendait**. 👉 ***Une fixture qui ne fait pas ce qu'elle annonce ne rate pas le test : elle le fait passer sur autre chose.*** Et **rien ne pouvait rougir** — Milo lit correctement ce qu'on lui donne, donc la passe restait lisible. *C'est précisément ce qui l'a rendue durable deux semaines.*

**⛔ UN SEUL « QUAND » PAR SÉANCE (`ilYA`), et c'est la vraie leçon de structure** : la date et le `ts` étaient calculés séparément et allaient en sens **contraire** (`ts:9000+i` montait pendant que la date reculait). Inoffensif tant que `ts` n'est lu que comme identifiant (`s.id||s.ts||s.date`) — *mais une fixture qui porte deux « quand » qui se contredisent n'attend qu'un lecteur qui trie par le mauvais* (**R2**).

**⭐⭐ ② AB-2 EST PROMU AU BANC D'ESSAI (EV-056).** Il vient de la passe **réelle** : avec sa mémoire, Milo retire toute presse au-dessus de la tête sur une épaule douloureuse ; sans elle, **le développé militaire à 80 kg devient l'ANCRE** — **4 séries de poussée contre 9**. *La différence est dans la séance, pas dans une phrase.* L'attendu se vérifie par du **CODE**, donc il devient **gratuit à chaque passe** au lieu d'un test manuel à 0,26 € que personne ne relance. ⛔ **Et il ne double pas EV-050, vérifié avant de l'écrire (R13)** : EV-050 accepte le militaire tant qu'il n'est pas lourd et **ne regarde jamais le VOLUME** — or c'est le volume qui a bougé —, et il n'exerce pas le **check-in du jour** (`dayState.pains`), une **autre source** que le dossier santé.

**⛔⛔ ③ ET LA PROMOTION A TROUVÉ QUE `EV-050` NE TESTAIT PAS CE QU'IL ANNONÇAIT** — la trouvaille la plus utile de la version, et elle n'était pas demandée. Sa fixture écrivait `{zone:'épaule droite', etat:'actif'}` : **deux champs qui n'existent pas**. L'app écrit **`status`** (jamais `etat`, cf. `saveHI`) et des **CODES** de zone (`epaule_d`) ; `_gardienZoneKey` matche `/epaule/`, qui ne reconnaît pas « épaule » **accentué**. **Mesuré : `zones.epaule.active` restait FAUX** — et le scénario passait **entièrement grâce à ses `notes` en texte libre**. *La blessure structurée, celle que son titre annonce, était inerte* (`BUGS.md` **§36**). ⛔⛔ **LA PRODUCTION N'A JAMAIS ÉTÉ TOUCHÉE, et c'est vérifié avant de rien changer** : les codes réels de l'écran Santé (`epaule_d`, `dos_bas`, `cou`…) activent **tous** la zone. *On ne « répare » pas ce qu'on n'a pas mesuré cassé* (**R28**). ⭐ **Et le scénario n'est pas durci pour autant** — mesuré des deux côtés, la règle du Gardien qui atteint Milo est **le même texte** : *on corrige ce qu'on mesure, pas la difficulté.*

**⚠️⚠️ ④ ET J'AI COLLISIONNÉ UN ID EN ÉCRIVANT CE TRAVAIL.** Mon scénario s'appelait **EV-055**… déjà pris depuis le 01/09 par « deux charnières de hanche », rangé **hors séquence** 470 lignes plus haut. **Rien n'a protesté** — or le rapport du banc **suit les scénarios PAR ID** (c'est comme ça qu'un ❌ devenu ✅ se voit), donc deux scénarios du même id fusionnent en silence dans le suivi. 👉 ***Le témoin qui manquait aurait coûté une seconde ; c'est le genre qu'on n'écrit que le jour où on tombe dedans*** (**R17**). Renuméroté EV-056, et le garde-fou est posé.

**📣 RÈGLE D'OR #11 — RIEN, et c'est argumenté.** Ce sont des **fixtures de test** et des **scénarios du banc** : le Laboratoire est derrière l'admin, donc visible du seul Michel. ⛔ Un point rouge ou une pop-up annonceraient à **tous** les utilisateurs une porte qu'ils ne verront jamais — *du bruit pur* (R19/R25). Aucun repère ne bouge, aucun chiffre affiché ne change.

Tests : **parcours 2712/2712** (+13, blocs **CCXXXI bis** et **CCXXXI ter**), calculs 298/298, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le scénario a été éprouvé contre une BONNE et une MAUVAISE réponse avant d'être livré** (**R35**) : vert sur la réponse « avec mémoire », **2 rouges** sur celle sans mémoire, **1 rouge** sur un refus déguisé en prudence — et **vert** sur le cas limite qui *nomme* le militaire pour dire qu'il l'**évite**. ⛔⛔ **Son 3ᵉ témoin existe pour l'empêcher de dégénérer** : *sans lui, « ne rien prescrire » serait la réponse parfaite, et on aurait promu un scénario qui récompense le refus* — la même leçon que le bloc 14 de ft-v1124. ⭐ **Les témoins de fixture mesurent le SENS, jamais des valeurs en dur** : un barème qui changerait de bornes reste vert tant qu'il progresse, parce que c'est ça la garantie. ⛔ **Deux contre-épreuves prouvent que la garde n'est pas vide** : `etat:'actif'` n'active rien, et « épaule droite » accentué n'est résolu par aucune zone. ⛔ **Contrôle négatif : 4 rouges sur l'ancien code**, exactement les 4 défauts corrigés. ⚠️ **Michel doit vérifier sur Safari/iPhone** : ce conteneur n'a que Chromium. Fichiers : `coach.js`, `tests/milo/eval-scenarios.js`, `tests/parcours/runner.js`, `docs/JOURNAL-DE-TEST.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1125. |

**ft-v1124 — ⚡ « CETTE SÉANCE TE CONVIENT ? » NE S'AFFICHE PLUS SOUS UN REPROCHE** — Michel envoie un **enregistrement d'écran**. Il écrit à Milo *« Oui mais pourquoi tu me donnes la séance à faire ? »* — un **reproche** — Milo lui répond *« T'as raison, c'est pas le bon moment : t'as fini ta séance, on est en débrief »*… et **juste en dessous, l'app affiche « Cette séance te convient ? · ⚡ Oui, on démarre »**.

**⭐⭐ CE QUI A DÉCIDÉ DU DIAGNOSTIC EST UNE MESURE, PAS UNE LECTURE.** La tentation était de durcir le prompt : *« Milo, ne propose pas de séance en débrief »*. **Ç'aurait été le mauvais cerveau** (R7) — la carte n'est pas écrite par Milo. Elle est posée par un filet **déterministe** du code, `_demandeUneSeance` (coach.js), qui depuis ft-v1053 se déclenche sur **ce que la personne a demandé**, pas sur ce que Milo a répondu. ⛔ Sa **règle ②** acceptait n'importe quel *« la/ma séance »* **sans verbe de demande** : la phrase de Michel contient « la séance », donc la carte sortait.

**⛔⛔ ET SON CAS N'ÉTAIT PAS ISOLÉ — la fonction a été jouée sur six phrases AVANT de toucher au code : QUATRE déclenchaient à tort.** *« la séance était trop longue »* · *« pourquoi ma séance ne compte pas ? »* · *« je viens de finir ma séance »* · et la sienne. 👉 ***Trois sont l'exact contraire d'une demande : elles parlent d'une séance DÉJÀ FAITE.*** ⭐ Le commentaire au-dessus de la fonction **prévoyait pourtant le risque en toutes lettres** — *« une question posée sous une réponse qui n'y répond pas »*. *Le danger était écrit, il n'était pas mesuré.*

**⛔ DEUX NIVEAUX D'EXCLUSION, ET LA FRONTIÈRE EST MESURÉE, PAS ESTHÉTIQUE.** Le **passé** (« j'ai fait », « je viens de », « était ») tue **tout**, y compris la règle à verbe — parce que `fai[st]` attrape aussi bien l'impératif *« fais-moi une séance »* que le participe *« j'ai **fait** ma séance »*. Les marqueurs **ambigus** (« pourquoi », « ne compte pas », « débrief ») ne tuent que les règles **sans** verbe : ⭐ *« pourquoi tu ne me fais pas une séance jambes ? »* **est** une demande, et un « pourquoi » interdit en bloc l'aurait refusée. *Une exclusion brutale ne se voit pas : elle transforme un faux positif en faux négatif, et personne ne se plaint d'une carte qui n'apparaît pas.*

**⚠️⚠️ ET MON PREMIER JET NE MORDAIT PAS — c'est la leçon de la version, et elle vaut au-delà d'ici.** J'avais écrit `\b[é]tait\b`. **`\b` est ASCII en JavaScript** : il n'y a **aucune frontière de mot** entre l'espace et le « é » de « était », donc le motif ne peut **jamais** correspondre. Mesuré : **deux des trois phrases visées passaient encore**. 👉 ***Une expression régulière qui a l'air juste et qui ne mord jamais est pire qu'une absence de garde : on la croit posée.*** Le test se fait désormais sur une **copie sans accents** (`normalize('NFD')`), la même technique que la recherche d'aliments.

**📣 RÈGLE D'OR #11 — RIEN, et c'est argumenté.** Aucun repère ne bouge, rien n'apparaît, il n'y a **rien à faire** : une carte cesse de s'afficher là où elle n'aurait jamais dû. ⛔ Une pop-up dirait *« la carte s'affichait à tort »* — une **alarme rétroactive** sur un défaut qu'on vient de combler (**R25**). *Personne n'a besoin d'apprendre qu'un bouton qu'il n'a jamais cliqué était mal placé.*

**⏭️ CE QUE ÇA NE FAIT PAS, ET C'EST ÉCRIT POUR NE PAS SE REPERDRE (R30)** : deux formulations **ne déclenchent toujours pas** la carte alors qu'elles le devraient — *« on fait quoi ce soir »* et *« on s entraîne quoi »* **sans l'apostrophe**. Ce sont des **ratés pré-existants** de la règle ③, **sans rapport** avec ce correctif — qui, lui, ne fait que **retirer** des déclenchements. Ils sont épinglés par un témoin avec leur raison. ⚠️ **Et Michel doit vérifier sur Safari/iPhone** : ce conteneur n'a que Chromium.

Tests : **calculs 298/298** (+8, bloc **14**), parcours, muscles, croisés, dates, données classées inchangés. ⭐⭐ **Le bloc tient les DEUX populations, et c'est ce qui l'empêche de dégénérer** : 9 commentaires qui ne doivent **plus** déclencher, **et 8 vraies demandes qui doivent TOUJOURS déclencher** — *un garde qui ne mesure que les faux positifs finit par tout refuser, et le correctif « la carte ne sort jamais » serait vert.* ⭐ **Un témoin porte le cas limite** qui distingue une exclusion fine d'une exclusion brutale : *« pourquoi tu ne me fais pas une séance jambes ? »* doit rester une demande. ⛔ **Un contrôle vérifie que les deux populations sont non vides** (8 et 9) — sinon « tout est conforme » serait vrai sans rien prouver. ⛔ **Contrôle négatif sur l'ancien `coach.js` : 3 rouges**, et les témoins de non-régression restent verts. ⚠️⚠️ **25ᵉ COLLISION DE VERSION, la 3ᵉ en deux jours — et elle s'est jouée pendant que la suite tournait** : session-A avait publié **et déployé** sa propre ft-v1123 (run #878 vert) le temps des 40 minutes de la passe de parcours. **Le premier publié garde le numéro**, donc cette version devient ft-v1124. ⭐ *Ma ligne était pourtant posée dans `JOURNAL-DE-PARTAGE.md` dès 17:10 UTC* — c'est exactement la limite que ce fichier écrit sur lui-même : **un panneau d'affichage évite le doublon de TRAVAIL, il n'empêche pas deux sessions de choisir le même numéro.** *Seul git l'attrape, et il l'a attrapé.* Fichiers : `coach.js`, `tests/calculs/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1124. |

**ft-v1123 — 🧠 LE TEST A/B MÉMOIRE REÇOIT SA PORTE D'ENTRÉE : UN OUTIL SANS BOUTON N'EST PAS UN OUTIL EN ATTENTE, C'EST UN OUTIL QUI N'EXISTE PAS** — Michel, à la lecture du bilan : *« le test A/B je peux pas le faire »*, puis *« je ne sais pas comment faire »*.

**⛔⛔ ET LA CAUSE N'ÉTAIT PAS LE TEMPS — ELLE ÉTAIT MESURABLE, ET ELLE ÉTAIT DE MON CÔTÉ.** `tests/milo/ab-memoire.js` est écrit, éprouvé et prêt depuis le **03/09**. Il n'a **jamais tourné**. J'ai écrit « ⏳ en attente de Michel » dans les journaux pendant deux semaines, comme s'il manquait de la disponibilité. 👉 **Mesuré : c'était le SEUL test lançable par lui qui n'avait pas de bouton.** Le benchmark en a un, le comparateur Sonnet/Haiku, le Gardien, VM, PT-001 : tous. Lui non — donc il fallait un terminal, donc personne ne l'a lancé. ***Un outil sans porte d'entrée n'est pas un outil en attente, c'est un outil qui n'existe pas*** — et l'en-tête du fichier disait lui-même « écrit pour être lancé PAR MICHEL », ce qui était **faux** tant qu'il fallait une ligne de commande. ⚠️ *Le journal ne mentait pas sur les faits, il se trompait sur la CAUSE : « en attente de quelqu'un » est le diagnostic le plus confortable et le moins vérifié qui soit.*

**⭐⭐ CE N'EST PAS UN 2ᵉ CHEMIN, ET C'EST CE QUI REND LA VERSION PETITE (R13/R2).** Le bouton appelle `_vcApplyPersona`, `buildCoachContext` et `_vcAsk` — **les mêmes fonctions que le benchmark** — et le gel (`_demoMode`) comme la restauration sont **copiés de `_evRun`**, pas réinventés : c'est le chemin qui protège les vraies données, et il n'en existe qu'un. *Le script node ne faisait rien que l'app ne sache déjà faire ; il pilotait un navigateur pour appeler du code qui était là.*

**⛔⛔ LES CAS DEVIENNENT LA PROPRIÉTÉ DE L'APP, ET LE SCRIPT LES LIT AU LIEU DE LES REDÉFINIR (R2).** Deux copies des mêmes fixtures divergeraient : l'une gagnerait un correctif, l'autre non, et **on comparerait deux expériences différentes en croyant comparer deux mémoires**. ⛔ Et l'absence est **FATALE, jamais silencieuse** : si `_AB_CAS` disparaissait, un repli sur une copie locale ferait tourner d'anciennes fixtures en affichant un résultat parfaitement crédible. ⚠️⚠️ **Le piège au passage** : la lecture doit être une **référence NUE**, jamais `window._AB_CAS` — *un `const` au niveau global n'est pas posé sur `window`*, et le script aurait conclu « les cas ont disparu » sur du code parfaitement sain (les `function`, elles, y sont — d'où le mélange des deux styles dans les tests).

**⭐⭐ ET LA MESURE DU CONTEXTE AVAIT DÉJÀ DIVERGÉ, ALORS QUE PERSONNE NE L'AVAIT TOUCHÉE.** Le script exigeait le marqueur « SITUATION DE L'INSTANT » **après** « PROFIL ATHLÈTE » ; ma version l'avait oublié. 👉 ***Deux formules qui ne comptent pas pareil rendent deux « écarts de mémoire » différents pour la même passe*** — c'est-à-dire le chiffre exact sur lequel on décide si l'expérience a un sens. `_abMesureContexte` en est le seul propriétaire. *La duplication n'attend pas qu'on la modifie pour nuire : elle naît déjà différente.*

**⛔⛔ AUCUN VERDICT AUTOMATIQUE, ET C'EST VOULU.** « La séance est-elle **meilleure** ? » ne se vérifie pas par du code — c'est le critère de `docs/JOURNAL-DE-TEST.md` : ce qui dépend du jugement reste au **juge humain** et ne devient jamais un scénario du banc. Le bouton produit **deux réponses à comparer**, pas un ✅. *Afficher un vert ici mentirait sur ce qu'on a mesuré*, et l'écran le dit en toutes lettres.

**⭐ CE QU'ON RETIRE EN B, ET CE QU'ON NE RETIRE PAS.** On enlève **la connaissance du sportif** (historique, records, blessure, état du jour), **pas les règles de Milo** — sinon on ne mesurerait pas la mémoire, *on fabriquerait un mauvais chatbot pour gagner la comparaison*. **Mesuré à blanc, 0 appel, 0 €** : écart de mémoire **+4 516** et **+5 044 caractères** (seuil de validité : 2 000). L'expérience porte.

**⚠️⚠️ ET J'AI ÉCRIT UN BUG DE FUSEAU HORAIRE EN CHEMIN — le détecteur en a attrapé deux sur trois.** Mon premier jet faisait `new Date().toISOString()` tronqué au jour, **à trois endroits**. `tests/dates` en a épinglé deux ; le troisième (`_abJ`) est passé entre les mailles **parce qu'il décale la date AVANT de convertir** — même défaut, autre forme. *En France l'été, entre minuit et 2 h, Greenwich est encore la veille* : dans des fixtures, une date fausse d'un jour fabrique un historique faux d'un jour. `today(ts)` (state.js) est le propriétaire unique de cette conversion (**R2**), et il tient au changement d'heure.

**⚠️⚠️ ET LE DÉTECTEUR DE DATES A ROUGI SUR MON COMMENTAIRE — §31, encore.** Il rejetait la ligne qui **expliquait pourquoi il ne faut pas écrire ce motif** : *un avertissement devenait une faute*. ⭐ **L'intention était DÉJÀ écrite dans le test** (« les commentaires citent le motif pour l'expliquer ») — elle ne couvrait que les `//`, pas les blocs `/* */`. Étendue, pas inventée. ⛔ Et **contrôle négatif fait** : la ligne fautive remise en **code** est toujours rattrapée (`coach.js:6860`) — *le détecteur n'est pas devenu aveugle en cessant d'être susceptible.*

**📣 RÈGLE D'OR #11 — RIEN, et c'est argumenté.** Le Laboratoire Milo est **derrière l'admin** (`_isAdminUnlocked`) : ce bouton n'est visible **que par Michel**, et c'est lui qui l'a demandé. ⛔ Un point rouge, une pop-up ou une diapo du Guide annonceraient à **tous les utilisateurs** une porte qu'ils ne verront jamais — *du bruit pur, et une nouveauté qui ne mène nulle part est pire qu'aucune nouveauté* (R19/R25). ⭐ L'explication vit donc **là où le bouton vit** : au-dessus de lui, dans l'écran, avec ce qu'il coûte et ce qu'il ne prouve pas.

Tests **sur l'arbre FUSIONNÉ avec la ft-v1122 de session-B** (le cardio dans la récup) — *c'est lui qui part en ligne, pas le mien* : **parcours 2699/2699** (+17, bloc **CCXXXI**), **calculs 290/290** (+24, les leurs), muscles 241/241, croisés 50/50, **dates 7/7** (réparé), données classées 0 trou. ⭐⭐ **Le témoin qui porte la version n'est pas « le bouton existe » — c'est la RÈGLE D'OR #3** : la passe remplace le profil par un persona, et les vraies données doivent revenir. *Un laboratoire qui abîme les données qu'il mesure est pire que pas de laboratoire.* ⛔ **Contrôle négatif fait, et il rougit bien** : en sautant `load()`, le témoin affiche « après : Michel / 85 kg » — *un témoin qu'on n'a pas vu échouer ne prouve rien.* ⭐⭐ **Et celui qui dit si l'expérience a un SENS** : l'écart de mémoire entre A et B — *si les deux contextes se ressemblaient, on lirait quand même les deux textes en cherchant une différence, qu'on finirait par trouver.* ⛔ **Deux contrôles n'existent que pour empêcher les autres d'être verts sur du vide** : les cas doivent être **chargés**, et le profil doit vraiment **être le persona** pendant la passe. ⛔ Quatre témoins figent le R2 côté script (il lit, il ne redéfinit pas · il échoue bruyamment · la référence est nue · la mesure a un propriétaire). ⛔ Et un dernier épingle l'honnêteté de l'écran : il **dit** qu'il n'y a pas de ✅/❌. Fichiers : `coach.js`, `index.html`, `tests/milo/ab-memoire.js`, `tests/dates/runner.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1123. |

**⏭️ CE QUE ÇA NE FAIT PAS, ET IL FAUT LE LIRE** : ⛔ **la passe n'a pas encore tourné pour de vrai** — 4 appels, ~0,25 €, c'est la décision de Michel, pas la mienne. Tant qu'elle n'a pas tourné, ***on ne sait toujours pas*** si la mémoire de Force Tracker rend la séance meilleure : on sait seulement qu'on peut enfin le mesurer. ⛔ Et la **mémoire à 2 vitesses** reste non construite, exprès : elle a besoin de cet avant/après (**R34**), *on ne la bâtira pas sur une intuition*. ⚠️ **Michel doit vérifier sur Safari/iPhone** : ce conteneur n'a que Chromium.

**ft-v1122 — 🔋 LE CARDIO ENTRE ENFIN DANS LA RÉCUPÉRATION (option A du contre-audit)** — ⚠️⚠️ **ENTRÉE ÉCRITE APRÈS COUP, LE 04/09 : cette version est partie en production SANS entrée de journal.** C'est **R23** dans sa forme exacte — *une fonctionnalité livrée sans entrée devient invisible* — et cette fois c'est moi qui l'ai commise, sur la version qui change **un chiffre affiché tous les jours**. *La note de `sw.js` était complète ; c'est le fichier qu'on relit à chaque session qui ne l'était pas.*

**⭐⭐ TROIS DÉFAUTS MESURÉS AU BANC DÉTERMINISTE AVANT D'ÉCRIRE UNE LIGNE**, puis tranchés par Michel **sur les chiffres** (le contre-audit complet est dans `docs/CONTRE-AUDIT-RECUP.md`, les chiffres de la phase 1 dans `docs/RECUP-PHASE1.md`) :
- ⛔ **① LE CARDIO NE COMPTAIT PAS.** 18 combinaisons (3 intensités × 6 durées) rendaient **toutes la même pénalité, −6** : ***90 min de tapis intense (855 MET·min, 1 140 kcal) coûtaient autant que 10 min de marche*** — et **moins que 6 séries de développé couché**. C'est le retour de Michel du 03/09, *« 45 min de tapis et ma récup n'a pas bougé »*, mesuré.
- ⛔ **② LE PLANCHER DE 6 fabriquait une falaise d'entrée** : aucune séance **79**, une seule série **75**, et 1/2/3 séries aplaties sur la même valeur.
- ⛔ **③ LE BONUS DE REPOS arrivait d'un bloc** : 47,9 h → **79**, 48,0 h → **85**. ***Six points en un dixième d'heure*** — exactement la « marche de midi » corrigée le 30/07 (ft-v671), **déplacée à la frontière de l'effacement et jamais remesurée depuis**.

**⭐⭐ LA BASE EST LE MET·MINUTE, PAS LA CALORIE — ET C'EST UNE MESURE, PAS UN GOÛT.** 45 min de tapis modéré valent **248 MET·min pour tout le monde**, mais **248 kcal à 60 kg, 330 à 80 kg et 413 à 100 kg**. 👉 ***Passer par les calories rendrait une personne lourde automatiquement plus fatiguée pour le même effort relatif.***

**⭐⭐ L'ANCRAGE EST UNE DÉCISION DE MICHEL, PRISE SUR DEUX CANDIDATS CHIFFRÉS** : *« 45 min de tapis modéré = **6 séries** »* (facteur ≈ 41,25 MET·min par unité). L'autre candidat mesuré (8 séries) a été écarté **parce que la mesure le disqualifiait** : à 8, un cardio **seul** de 90 min intense atteignait le **plafond de 38**, celui qui désigne **24 séries de squat** depuis ft-v718. ⛔ **L'équivalence est STRICTEMENT INTERNE** : l'app n'affiche jamais *« 45 min de tapis = 6 séries »* — ce serait une phrase invérifiable présentée comme un fait.

**⛔ UNE SEULE SOMME** (muscu + cardio avant + cardio après) dans `_penaliteSeance`, donc **aucun double comptage** possible. **Plancher ramené de 6 à 2** (décision Michel), **rampe de 12 h** au lieu de la marche à 48 h (raccord R1).

**⛔⛔ ET `projectionRecup` ÉCRIVAIT 48 ET 24 EN DUR** alors que `RECUP_EFFACE_H` existait depuis le 01/09 **pour être propriétaire unique** (R2) — ⭐ et le **24 EST 48/2**, donc les **deux** littéraux en dépendaient. *Un propriétaire unique qui a un troisième lecteur qui ne le lit pas n'est pas un propriétaire unique.* Corrigé, invisible à H = 48.

**⭐ RIEN D'AUTRE NE BOUGE, ET LES TÉMOINS LE PROUVENT** : le ×1,7, l'échec ×1,5, le drop ×1,3, le plafond 38, et **la musculation au point près à partir de 4 séries**.

**⭐⭐ ET LE CARDIO ENTRE AUSSI DANS L'EXPORT D'HISTORIQUE**, sur une remarque de Michel devant son propre export : *« il faut que le cardio soit sur l'export de l'historique »*. ⚠️ **J'avais d'abord affirmé que son fichier ne contenait aucun cardio « donc c'est le trou »** ; il m'a corrigé — *« quand il y a de la muscu avec le cardio c'est enregistré »*. **Il avait raison sur le fond et moi sur la conséquence** : le cardio est bien **dans la séance**, mais l'export ne parcourait que les **exercices**, donc il ne pouvait structurellement **jamais** l'écrire. Une ligne `type:'CARDIO'` par bloc, avant et après.

**📣 RÈGLE D'OR #11 — LA POP-UP SE MÉRITE, et ici elle se mérite doublement.** ⚠️⚠️ *Un chiffre que la personne regarde tous les jours change tout seul, **historique compris*** — et le danger n'est pas qu'elle le remarque, c'est qu'elle **ne le remarque pas**. `WHATS_NEW` **v70** · point rouge `recup-cardio` sur l'Accueil · aide `?` de l'Accueil · aide détaillée.

**⭐⭐ REJEU DES 60 DERNIERS JOURS SUR LES VRAIES DONNÉES DE MICHEL — les deux moteurs, la vraie fonction des deux côtés, aucun barème recopié** : **27 jours inchangés, 33 changés, tous vers le bas**, écart moyen **−2,0**, plus gros écart **−6**, **aucune journée absurde**, et **deux causes seulement**. *C'est cette mesure-là qui autorisait à livrer, pas la relecture du code.*

**⏭️ CE QUE ÇA NE FAIT PAS, ET C'ÉTAIT LA CONSIGNE DE MICHEL** : *« Tu peux coder l'Option A maintenant. Ne commence PAS B ou C dans le même commit. »* Donc **B** (charge cumulée des séances, retrait du forfait « jours enchaînés », saturation à 0) et **C** (volume habituel personnel, puis %e1RM) restent **entiers**. ⚠️ **Deux trouvailles annexes épinglées, non corrigées** : les multiplicateurs **échec ×1,5 / drop ×1,3 sont inatteignables** (`SET_TYPES=['N','É','X']`, la migration a transformé E→X et D→N) — *un barème qu'aucune donnée ne peut déclencher est un barème mort qui a l'air vivant*.

Tests : **parcours 2682/2682**, calculs, muscles, croisés, dates, données classées 0 trou. ⛔ **Contrôle négatif : 14 rouges sur l'ancien moteur.** ⚠️⚠️ **Et DEUX de mes témoins ont rougi sur du code sain — §31, deux fois dans la même version** : ① l'échantillon du raccord sautait de 54 h à 59 h et lisait **5 h de pente à 1 pt/h** comme un saut de 3 points → remplacé par un **balayage à la demi-heure de 46 à 62 h** ; ② un témoin de `projectionRecup` était placé **exactement à −1 minute**, c'est-à-dire **sur la frontière que le code décale de `+1/60` pour l'éviter** — mesuré, le produit y vaut `0,500000000000` et `Math.round` bascule aux derniers bits. *Un témoin posé pile sur une frontière ne mesure pas le comportement, il mesure l'arrondi.* Fichiers : `tracking.js`, `setup.js`, `app.js`, `constants.js`, `screens.js`, `tests/parcours/runner.js`, `docs/CONTRE-AUDIT-RECUP.md`, `docs/RECUP-PHASE1.md`, `BUGS.md`, `sw.js`. sw.js ft-v1122. |

**ft-v1121 — 🌮 O'TACOS SORT DE LA BASE : ON NE JETTE PAS DES VALEURS FAUSSES, ON JETTE DES VALEURS JUSTES QUI RÉPONDENT À LA MAUVAISE QUESTION** — décision de Michel, après que je lui aie signalé le cas : *« vire-les »*.

**⛔⛔ LE FAIT.** Les 5 lignes O'Tacos gardées par le classeur sont **toutes des desserts** — Mix glace, Milkshake nature, Crème chantilly, Kinder Bueno, Kinder Bueno White. **Aucun tacos.** Donc taper `tacos` rendait une **glace**. 👉 ***Un mot qui ne désigne pas ce qu'on croit est pire qu'un mot qui ne rend rien*** : sur un mot vide on cherche ailleurs, sur un mot trompeur on enregistre.

**⭐⭐ ET ÇA RÉTABLIT UNE DÉCISION DÉJÀ PRISE, CE QUI EST LE POINT LE PLUS INTÉRESSANT.** En **ft-v1113**, `tacos` n'avait délibérément **pas** été mappé dans la table nationale — la raison est écrite dans le code : *« il n'est pas dans la table, et on ne sert pas un kebab à sa place »*. Un témoin la garde depuis. 👉 **La base de marques contredisait cette décision sans qu'on l'ait voulu** — et aucun témoin ne pouvait le voir, parce qu'il surveillait `_ciqualChercher`, pas `_marquesChercher`. *Deux sources qui répondent à la même frappe peuvent se contredire sans qu'aucune ne soit fausse.*

**⛔ CE QU'ON RETIRE N'EST PAS DOUTEUX, ET C'EST CE QUI REND LE CAS DIFFÉRENT DE ft-v1114.** La règle de Michel — *« il faut tout mettre sinon autant rien mettre »* — visait des valeurs **douteuses mais réelles** (Korean Whopper, KFC en pièces), parce qu'une ligne absente pousse vers l'estimation. Ici les chiffres sont **justes** : c'est bien un Kinder Bueno et il fait bien 567 kcal/100 g. *Ce n'est pas la valeur qui est fausse, c'est la question à laquelle elle répond.* ⚠️ La source elle-même mettait en garde : *« ne pas présenter cette table comme une table France 2026 »*.

**⛔ R30 — LE RETRAIT EST ÉCRIT AVEC SA RAISON, ET FIGÉ PAR UN TÉMOIN.** *Un retrait volontaire ne laisse qu'une absence, et une absence ressemble exactement à un oubli* — c'est le calculateur de plaques, remis en service trois mois après avoir été retiré exprès. Le générateur porte un bloc `ENSEIGNES_ECARTEES` nommé, et deux témoins exigent que la raison y soit écrite.

**⚠️⚠️ ET L'AIDE ÉCRITE LA VEILLE EST DEVENUE FAUSSE DANS LE MÊME MOUVEMENT.** Elle disait, en toutes lettres, *« taper "tacos" te rendra donc une glace »* — vrai hier, faux aujourd'hui. **3ᵉ cas de la série** (§31) : corrigée en même temps que le code, et un témoin refuse désormais cette phrase. *Une aide qui nomme un repère inexistant est pire qu'une aide absente, parce qu'on la croit.*

**📣 RÈGLE D'OR #11 — RIEN, et c'est argumenté.** Ce qui disparaît est **une glace qui répondait au mot « tacos »** : personne ne l'avait cherchée, personne ne la regrettera. Aucun repère ne bouge, rien n'est à faire, et aucun chiffre enregistré ne change. ⛔ Une pop-up dirait *« on a retiré des desserts que vous n'aviez pas demandés »* — du bruit pur (R19/R25). ⭐ L'aide, elle, est **corrigée** parce qu'elle mentait, pas parce qu'il y a une nouveauté à annoncer.

**128 → 123 produits.**

Tests : **parcours 2682/2682** (+9, bloc **CCXXX**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin qui porte la décision n'est pas « O'Tacos est absent » — c'est « `tacos` ne rend plus une glace, NI dans les marques NI dans les aliments »** : *c'était la raison du retrait, pas le retrait lui-même.* ⛔ Un témoin de plus vérifie que **les desserts sont vraiment partis**, pas seulement le mot qui y menait. ⛔ **Et deux témoins figent le retrait (R30)** : il doit être **déclaré** dans le générateur avec sa **raison**, sinon quelqu'un le « réparera ». ⛔ Non-régression : Big Mac, frites McDo et Quick répondent toujours — *on a retiré une enseigne, pas cassé les autres.* ✅ **Safari/iPhone : vérifié par Michel sur ft-v1114 → ft-v1120**, y compris la bande sticky. Fichiers : `tools/marques.py`, `data/marques.json`, `screens.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1121. |

**ft-v1120 — 🍔 LA BASE FAST-FOOD PASSE DE 27 À 128, ET C'EST UNE FUSION, PAS UN REMPLACEMENT** — Michel renvoie le classeur perdu, **en version 2** : 114 produits au lieu de 27, avec **Quick** (leur table officielle est très complète : 91 lignes), **O'Tacos** et **Subway**.

**⭐ ALLER-RETOUR : 0 ÉCART SUR 116 VÉRIFIÉS.** Chaque valeur rendue correspond exactement à celle que l'enseigne publie, et le **Big Mac tombe au chiffre près sur l'ancienne table** — c'est bien la même source, étendue. *La preuve valait mieux que la confiance : le nom du fichier n'était pas celui de la V1.*

**⛔⛔ MAIS LA V2 SEULE AURAIT FAIT PERDRE TOUTES LES FRITES.** Dans ce classeur, les frites de McDonald's, Burger King, KFC et Quick n'ont **que les calories** — pas les protéines, ni les glucides, ni les lipides. Une ligne sans macros ne peut pas alimenter un journal : le générateur les écarte, à juste titre. 👉 ***Remplacer aurait été une régression déguisée en enrichissement*** — **+95 produits gagnés, −15 perdus**, et personne ne l'aurait vu passer. D'où une **FUSION** : 114 lus + 14 hérités.

**⚠️⚠️ LES 14 HÉRITÉS SONT UN PIS-ALLER, ET C'EST ÉCRIT COMME TEL.** Leur classeur d'origine est **perdu** — il vivait dans un dossier temporaire, le conteneur a redémarré (c'est ce qui a fait naître `data/sources/` le matin même). Ces 14 lignes sont donc **figées dans le générateur**, recopiées depuis la sortie du 03/09, **leur seule trace restante**. 👉 ***Une valeur dont on ne peut plus remonter à la source est une valeur qu'on ne peut plus auditer.*** Si le classeur contrôlé réapparaît, ce bloc doit disparaître.

**⭐⭐ ET LE GARDE-FOU A SERVI LE JOUR MÊME.** La pizza **« 4 Fromages »** était héritée le matin ; la V2 la fournit, avec des valeurs **identiques au chiffre près** — elle est repartie dans la source, et le bloc figé a maigri de 15 à 14. *Ce bloc doit rétrécir, jamais grossir* : le générateur signale à chaque exécution les lignes héritées qu'un classeur fournit désormais. ⛔ Et une ligne héritée n'est ajoutée **que si le classeur ne la porte pas** — *sans cette condition, une valeur figée écraserait silencieusement une valeur fraîche, exactement le défaut qu'on répare depuis deux jours.*

**⭐ CONTRÔLES PASSÉS SUR LES 95 NOUVEAUX, et ce n'était pas une formalité** : c'est le **bloc Quick** qui avait été **DÉCALÉ** (nom ↔ ligne nutritionnelle) dans le tout premier classeur, et **91 des 95 nouveaux sont du Quick**. Résultat : **1 seule incohérence** — le *Korean Whopper* (752 kcal annoncées contre 616 calculées depuis ses macros), **le doute déjà connu et déjà affiché**. **0** masse impossible, **0** incohérence de taille (petite < moyenne < grande), **0** valeur aberrante.

**⛔ CE QUI N'ENTRE PAS EST DIT, PAS TU** : les **8 sandwichs Subway** (leur document officiel donne les calories mais **pas** les macros) et **5 desserts O'Tacos** sans calories.

**⚠️⚠️ ET UN POINT QUI REVIENT À MICHEL : O'TACOS NE CONTIENT AUCUN TACOS.** Ses 5 lignes gardées sont des **desserts** — Mix glace, Milkshake, Chantilly, deux Kinder Bueno. Donc **taper `tacos` rend une glace**. ⚠️ Et la source elle-même met en garde : *« ne pas présenter cette table comme une table France 2026 »*. ⭐ **Je les garde parce que la règle est la sienne** — *« il faut tout mettre sinon autant rien mettre »* (ft-v1114) — **et je le signale parce qu'il doit le savoir**. *Sa règle visait les valeurs douteuses mais réelles ; ici c'est le mot qui ne désigne pas ce qu'on croit.* L'aide le dit en clair.

**📣 RÈGLE D'OR #11 — POINT ROUGE + AIDE, PAS DE POP-UP.** La base quadruple et des enseignes entières apparaissent : il y a à **découvrir**. ⛔ Mais rien n'est à faire, aucun repère n'a bougé, et **aucun chiffre existant ne change** — les 27 produits d'avant sont conservés à l'identique, ce qu'un témoin vérifie. *Une pop-up n'aurait rien à annoncer qu'on doive faire* (R25). ⭐ L'aide `?` et l'aide détaillée de ft-v1114 sont **étendues** (R2), et elles portent les deux manques (Subway, O'Tacos).

Tests : **parcours 2672/2672** (+14, bloc **CCXXIX**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin qui porte la version est celui des FRITES** — c'est exactement ce qu'un remplacement aurait fait disparaître, et il vérifie **les chiffres**, pas les noms : *une fusion qui changerait une valeur d'avant serait pire qu'un remplacement, parce qu'elle serait silencieuse.* ⭐⭐ **Et celui qui protège la fusion elle-même** : **aucun produit en double** — un produit fourni par le classeur **et** hérité apparaîtrait deux fois, et la personne ne saurait pas laquelle prendre. ⛔ Deux témoins de plus bornent le bloc figé (≤ 15 lignes) et exigent que sa **raison** soit écrite (R30). ⚠️⚠️ **Et un de mes témoins a rougi sur du code sain — §31, 5ᵉ fois de la journée** : il cherchait « RÉTRÉCIR » en **majuscules** dans un commentaire qui l'écrit en minuscules. *La garantie n'a jamais été la casse d'un mot.* ⚠️ **Michel doit vérifier sur Safari/iPhone.** Fichiers : `tools/marques.py`, `data/marques.json`, `data/sources/Base_Fast_Food_France_Force_Tracker_2.xlsx`, `data/sources/README.md`, `constants.js`, `screens.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1120. |

**ft-v1119 — 🔍 LES DEUX DÉFAUTS DE LA RECHERCHE, ET LA MESURE A DIT OÙ POSER LE CORRECTIF** — Michel : *« corrige les 2 défauts de recherche »* — ceux que l'audit du matin avait mesurés en préparant l'export pour GPT. **Ils étaient nommés depuis 9 h, non corrigés ; ils le sont.**

**⛔ ① LA PONCTUATION RESTAIT COLLÉE AU MOT TAPÉ.** `Boulgour, cuit` ne rendait **RIEN** : le mot cherché devenait `boulgour,` **avec sa virgule**, et aucun nom ne contient ça. **4 cas sur 6.** ⚠️ Et `Riz blanc, cuit` marchait — **par coïncidence** : la virgule tombait au même endroit dans le nom de la table. *Un cas qui marche par hasard cache les cinq qui ne marchent pas.* ⭐ Elle devient un **ESPACE et non rien** : supprimer un séparateur recollerait deux mots qui n'ont rien à voir.

**⛔ ② LES MOTS-OUTILS ÉTAIENT EXIGÉS COMME SOUS-CHAÎNE.** `filet de bœuf` ne rendait **RIEN**, alors que `6116 · Boeuf, filet cru` existe : `de` fait 2 lettres, donc il était conservé, et « boeuf, filet cru » n'en contient aucun. ⚠️⚠️ **Et ça marchait 7 fois sur 8 PAR ACCIDENT** — le `de` se trouve dans « vian**de** », « Pomme **de** terre », « à **la** grecque », « **au** naturel ». 👉 ***Une règle qui ne marche que par accident marchera un jour de moins.***

**⭐⭐ ET C'EST LA MESURE QUI A DIT OÙ POSER LE FILTRE — avant que la première ligne soit écrite.** Ma sonde le posait **en amont**, sur la requête. Résultat : `pomme de terre` retombait sur la version **CRUE**, `blanc de poulet` et `fromage de chèvre` changeaient d'aliment. Cause : **99 clés de la table d'alias contiennent un mot-outil**. 👉 ***On retire les mots-outils pour CHERCHER, jamais pour RECONNAÎTRE*** — le filtre vit donc dans la recherche, et la table d'alias voit toujours la frappe entière.

**⛔⛔ CE QU'ON NE JETTE JAMAIS, ET C'ÉTAIT ÉCRIT AVANT DE CODER** : `sans` et `avec` — *« coca sans sucre » deviendrait « coca sucre », l'exact contraire* — et `the`, qui **est** le thé une fois les accents retirés. ⛔ La liste est **fermée** : on ne devine pas ce qu'est un mot-outil. ⛔ Et si la frappe n'en contient que, on la garde telle quelle : *on ne fabrique pas du vide.*

**⛔⛔ ET LA BARRE `/` EST VOLONTAIREMENT ABSENTE DE LA PONCTUATION ESPACÉE.** Elle n'est **pas nécessaire** (la virgule suffit à réparer `Lentilles, cuites`), et l'espacer coûterait cher : la table d'alias porte une clé **`lait 1/2 ecreme`**, normalisée par `tools/alias.py` — l'app chercherait `lait 1 2 ecreme` et **ne la trouverait plus**. 👉 ***Une règle qu'on ajoute « pour être complet » peut faire disparaître une entrée en silence.*** ⭐ Un témoin permanent exige désormais que **chaque clé d'alias soit déjà sous forme normalisée** : c'est la seule chose qui empêche les deux normalisations de diverger à nouveau.

**⭐ R2 — UN SEUL PROPRIÉTAIRE DU DÉCOUPAGE.** Les **quatre** recherches (les aliments, les compléments, le fast-food, son propre journal) découpaient la frappe chacune de leur côté, à l'identique. `_afMots` en est le propriétaire. *Le commentaire de `_afRang` demandait déjà qu'elles corrigent au même endroit — il n'a pas fallu écrire une règle, seulement la lire.*

**⭐⭐ CONTRÔLE NÉGATIF PAR `git stash`, SUR 82 REQUÊTES : 10 RÉPARÉES, 4 NETTEMENT AMÉLIORÉES, 0 CASSÉE.** Les réparées ne sont pas des alias — `joue de bœuf`, `queue de bœuf`, `foie de veau`, `rognon de veau`, `travers de porc`, `graine de lin`. Et les améliorées valent d'être nommées : **`jarret de veau` rendait « Osso buco à la milanaise »**, il rend « Veau, jarret cru » ; `langue de bœuf` rendait une « sauce madère préemballée » ; `cuisse de canard` rendait un **confit**.

**⛔ CE QUI NE MARCHE TOUJOURS PAS EST DIT, ET CE N'EST PAS UN TROU DU CORRECTIF** : les mots de **conditionnement**. *« copeaux de parmesan »*, *« boule de mozzarella »*, *« carré de chocolat »* ne rendent rien parce que `copeaux`, `boule`, `carré` **n'existent dans aucun libellé** — la table nomme **l'aliment**, pas sa présentation. ⭐ Vérifié : `parmesan` seul trouve « Parmesan ». Seul `sirop d'agave` est vraiment absent de CIQUAL.

**⚠️⚠️ ET UN TROU DE MÉTHODE EST APPARU EN CHEMIN, IL FAUT LE DIRE : `data/alias.json` N'EST PLUS RÉGÉNÉRABLE.** Le classeur source de GPT vivait dans le dossier temporaire, **il a disparu au redémarrage du conteneur**. R27 dit *« ce qui est généré ne s'édite pas à la main »* — mais **si la source disparaît, la règle devient impossible à tenir**. 👉 Ce qui a sauvé cette version, c'est d'avoir **retiré le `/`** au lieu d'avoir besoin de régénérer. *Un fichier généré dont la source n'est pas versionnée est un fichier figé qui s'ignore.* ⏭️ **À décider** : verser le classeur dans le dépôt, ou accepter que la table soit figée.

**📣 RÈGLE D'OR #11 — POINT ROUGE + AIDE, PAS DE POP-UP.** Des mots qui échouaient marchent, et *personne ne réessaie un mot qui a échoué une fois* → il y a à **découvrir**. ⛔ Mais c'est une **correction** : rien à faire, aucun repère déplacé, et les résultats d'avant étaient absents ou moins bons. Une pop-up dirait *« vos recherches échouaient »* — **alarme rétroactive** (R25). ⭐ L'aide `?` et l'aide détaillée de ft-v1115 sont **ÉTENDUES** plutôt que doublées (**R2**), et elles disent aussi **ce qui ne marche pas** et pourquoi.

Tests : **parcours 2653/2653** (+18, bloc **CCXXVII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin qui porte le vrai risque n'est pas « ça marche » — c'est « les deux normalisations ne divergent pas »** : une différence d'un caractère entre `_afNorm` et le `norm()` de `tools/alias.py` fait disparaître une entrée **sans erreur, sans rouge**. ⭐⭐ **Et celui qui empêche la rechute est celui de `sans`/`avec`** : c'est le seul mot dont le retrait retournerait le sens de la recherche. ⛔ **Deux contrôles empêchent les autres d'être verts sur du vide** : des clés d'alias contiennent bien un mot-outil (sinon la garde n'aurait plus d'objet), et les 5 réparés ne sont couverts par **aucun** alias. ⚠️⚠️ **Et un de mes témoins a rougi sur du code sain — §31, 4ᵉ fois de la journée** : il cherchait « ajout**es** » sans accent dans un libellé qui écrit « ajout**és** ». *Le détail imprimé montrait que tout marchait ; c'est le motif qui ne savait pas lire ce qu'il mesurait.* ⚠️ **Michel doit vérifier sur Safari/iPhone.** Fichiers : `app.js`, `tools/alias.py`, `constants.js`, `screens.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1119. |

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
