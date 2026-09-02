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

> **Version actuelle : `ft-v1093`** (prochaine : `ft-v1094`). Historique complet (ft-v128→574 + gouvernance
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


**ft-v1091 — 👆 CE QU'UNE FERMETURE AU DOIGT EMPORTE — dont la CAMÉRA, qui restait allumée** — Michel : *« continue à chercher des incohérences »*. Même méthode qu'en ft-v1089 : **des détecteurs, pas des avis** — et on privilégie ceux qui **mesurent un comportement** plutôt que ceux qui lisent du texte.

**⛔⛔ ① LE PLUS GROS : FERMER LE SCANNER DE CODE-BARRES AU DOIGT LAISSAIT LA CAMÉRA ALLUMÉE.** `closeBarcodeScanner()` est la **seule** chose qui coupe le flux vidéo (`_bcReader.reset()` puis `stopStreams()`). Or `#ov-bc-scan` n'était déclaré **nulle part** dans `_OVERLAY_CLOSERS`, et il n'a même **pas** de fermeture au clic sur le fond. 👉 Fermé en glissant, on tombait sur le repli `classList.remove('open')` : ***l'écran disparaît, la caméra continue de tourner*** — voyant vert allumé sur iOS, batterie qui file, et **rien à l'écran pour le dire**. ⭐⭐ **C'est la 4ᵉ fois pour cette famille** (ft-v466, ft-v629, ft-v1073 — §26 de `BUGS.md`) et **la première qui touche un CAPTEUR** : les trois précédentes coûtaient un marqueur, une pop-up, un exercice ; celle-ci laisse un micro-ordinateur filmer dans une poche.

**⛔⛔ ② LE BANDEAU « SAUVEGARDE EN LIGNE EN PAUSE » ÉTAIT EFFACÉ PAR L'ÉCRAN QUI LE PORTE.** Deux fonctions écrivaient dans `#email-verify-card` — `_renderAuthRefusCard()` et `_renderEmailVerifyCard()` — et c'est `renderSetup()` qui appelle la seconde. 👉 ***Ouvrir l'onglet Profil remplaçait l'alerte rouge par le rappel jaune « confirme ton e-mail »***, c'est-à-dire exactement l'écran où le bandeau vit. **R2 dans sa forme la plus pure** : deux propriétaires d'un emplacement, et c'est celui qui dit la chose la plus importante qui perd. ⚠️ **Et le remplaçant est pire que rien** : il envoie chercher au **mauvais endroit** — confirmer un e-mail, quand le vrai problème est un **code perso absent**. *ft-v788 avait rendu ce refus visible ; il redevenait muet au premier changement d'écran, et la copie en ligne s'arrêtait sans un mot.*

**⭐⭐ ET LE DRAPEAU QUI DEVAIT LE SAUVER DORMAIT DEPUIS ft-v788.** `ft4_auth_refus` était **écrit** à chaque refus et **relu par personne** (**R5**, donnée morte) — or il existe précisément pour survivre à un rechargement, quand `window._ftAuthRefusee` a disparu. Il sert enfin, **et sa valeur (`'new'` / `'1'`) aussi** : sans elle on réclamerait « ton code » à quelqu'un qui n'en a **jamais posé**, le défaut que ft-v789 avait corrigé. ⛔ **Rendre un drapeau visible oblige à écrire comment il s'éteint** : il est effacé dès que le serveur accepte, et **ignoré dès que l'appareil a le code**. *Sans ces deux guérisons, on aurait remplacé un silence par un cri qui ne s'arrête plus* — le piège que ft-v788 nommait déjà.

**⛔ ③ LA RÉPONSE « COMMENT AS-TU DORMI ? » ÉTAIT PERDUE — ET DE FAÇON ALÉATOIRE, CE QUI EST PIRE.** Le check-in a deux étapes ; seule la seconde (`ciPickEnergy`) appelait `persist()`. `mod-checkin` se ferme au doigt et **rien ne tourne à sa fermeture** : répondre puis refermer laissait l'entrée **en mémoire seulement**. ⚠️ Mais `persist()` écrit **tout** `S` — donc n'importe quelle action ultérieure la rattrapait. ***Parfois gardée, parfois perdue, sans que rien ne distingue les deux cas.*** ⭐ `sleepLog` est un journal **à part** du `checkin` de la séance : sauver ici n'enregistre pas un demi check-in, ça garde la réponse qui a été **donnée** (**R29**).

**⛔ ④ ET LE GUIDE FERMÉ AU DOIGT PERDAIT LA PROPOSITION D'INSTALLATION, DÉFINITIVEMENT.** `closeAppGuide()` enchaîne `_afterAppGuide` — le « installe l'app » d'un nouvel inscrit. Le clic sur le fond était géré, le **glisser** et **Échap** non. Or `ft4_guide_shown` est **déjà posé** à ce moment-là : le guide ne revient jamais, donc la proposition était **perdue pour toujours** pour qui referme d'un geste.

**⚠️⚠️ ET C'EST UN TÉMOIN DE CONTRÔLE QUI A SAUVÉ MA PREMIÈRE SONDE — elle mesurait ses PROPRES variables.** Pour prouver que la caméra reste allumée, j'avais remplacé `window._bcReader` par un faux lecteur qui compte ses arrêts. Or `_bcReader` et `_bcScanning` sont des **`let` de portée fichier** : ils ne sont **pas** sur `window`. Ma sonde créait donc deux variables **à elle**, que le code ne lit jamais. 👉 ***Mon contrôle est rouge des deux côtés — et c'est exactement ce qui m'a dit que je ne mesurais rien.*** La version juste espionne `closeBarcodeScanner` (une déclaration de fonction, elle, est bien sur `window`), et le bouton « Annuler » doit l'appeler : sans ce contrôle, un « 0 appel » ne prouverait **rien**. *C'est la leçon de ft-v994 et de ft-v1086, retrouvée une fois de plus.*

**⚠️⚠️ ET UN TÉMOIN DE ft-v789 A ROUGI SUR MON CORRECTIF — j'avais confondu deux questions.** Pour choisir le message (*« protège ton compte »* vs *« saisis ton code »*), ma 1ʳᵉ version mettait `_ftAuthRefusee` en garde. Or ce drapeau répond à *« y a-t-il un refus ? »*, pas à ***« de quel refus s'agit-il ? »*** — deux questions distinctes, une seule variable pour les départager. 👉 Résultat : le message *« protège ton compte »* **disparaissait**, et on serait revenu au défaut que ft-v789 avait corrigé — *réclamer son code à quelqu'un qui n'en a jamais posé*. ⭐ **Le témoin qui m'a arrêté a un an de moins que le bug qu'il protège** : il a été écrit pour la version qui a créé la règle, et c'est lui qui a empêché de la défaire en croyant l'améliorer. *La mémoire vive gagne dès qu'elle a été renseignée ; le stockage n'est le repli que lorsqu'il n'y a rien en mémoire* — et le cas du **rechargement**, celui qui a motivé tout le correctif, a désormais son propre témoin.

**⚠️ DEUX FAUX POSITIFS DE MES PROPRES DÉTECTEURS, À SAVOIR AVANT DE REFAIRE LA CHASSE.** ① Un `id=` annoncé « en double » (`#m-kcal`) : le second exemplaire était **dans un commentaire HTML** que je ne retirais pas — *le défaut de ft-v1078/1079, refait par celui qui l'avait écrit*. ② **24 clés `ft4_*` « écrites jamais relues »** : elles sont lues par un **helper** (`_lsJson('ft4_prs',…)`) ou via une **constante** (`_GARDIEN_CLE`), pas par un `getItem('…')` littéral. Après correction : **0 id en double, 1 seule clé vraiment morte** — celle du ② ci-dessus.

**⚠️⚠️ ET LE RESTE A RENDU DU VIDE, CE QU'IL FAUT SAVOIR DIRE.** **68 overlays**, **23 qui posent un état** : tous **repositionnent cet état à l'ouverture suivante** (`openSessDetail` remet même `_sdDelConfirm=false` et purge son minuteur) — *c'est le correctif de ft-v1073 appliqué partout ailleurs, et il tient*. **0 usage d'une `async` sans `await`** dans un test ou une affectation (le défaut du 26/08 ne s'est pas reproduit). **8 paires de fonctions « identiques »** — toutes **parallèles par construction** (`tryOpenSafari`/`tryOpenChrome`, `readFoodLabel`/`scanBarcodeIA`) : mon détecteur normalise les chaînes, or *la chaîne EST la différence*. ⭐ **Et `getUserMedia` n'a qu'un seul utilisateur dans tout le dépôt** : la jumelle du ① a été **cherchée et n'existe pas** (**R8**).

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE, et ça s'argumente.** Quatre **réparations** : rien n'apparaît, rien ne bouge, il n'y a rien à apprendre. ⚠️ Le seul changement visible est un bandeau rouge qui **cesse de disparaître** — et *annoncer « l'avertissement qu'on t'affichait s'effaçait tout seul » serait exactement le bruit que la règle #11 cherche à éviter*. ⛔ **La caméra mériterait une annonce si elle était neuve** ; c'est une fuite qu'on ferme, et le dire alarmerait rétroactivement sur toutes les fois où elle a tourné.

Tests : **parcours 2175/2175** (+11, bloc **CXCVII**) ⚠️ *mesuré sur l'arbre **FUSIONNÉ** avec le ft-v1090 de session-B, pas sur le mien seul — 2149 avant fusion*, calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **CONTRÔLE NÉGATIF mesuré avant d'écrire une ligne** : fermeture au doigt → `closeBarcodeScanner` appelée **0 fois** avant, **1 fois** après · bandeau `en pause` **peint puis remplacé par `openEmailConfirm`** avant, **conservé** après · réponse sommeil **`1` en mémoire / `0` en stockage** avant, `1/1` après. ⛔ **Trois témoins n'existent que pour empêcher les autres d'être verts sur du vide** : le bandeau doit vraiment être peint, la question sommeil vraiment répondue, et le bouton « Annuler » vraiment couper la caméra. ⭐ **Et un témoin de GUÉRISON** : un appareil qui a le code ne voit plus rien de rouge — sans lui, on livrerait un bandeau permanent. ⚠️ **17ᵉ collision** (leur compte, pas le mien : session-B a numéroté la 16ᵉ — *deux comptes concurrents du même événement finiraient par se contredire*, **R2**) : ils ont publié **leur** ft-v1090 pendant ce chantier, et **leurs blocs s'appellent CXCV et CXCVI**. Ma version devient **ft-v1091** et mon bloc **CXCVII** — *un numéro de cache ne recule jamais, et deux blocs du même nom masqueraient une disparition future*. Fichiers : `screens.js`, `app.js`, `tracking.js`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1091. |

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

Tests : **parcours 2133/2133** (+24, blocs **CXCIII · CXCV · CXCVI**) ⚠️ *mesuré sur mon arbre avant la fusion avec leur ft-v1089*, calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou, **noyau Milo 12/12**. ⭐ **La fixture EST sa séance** : série 1 renseignée, série 2 à `null`, série 3 **sans la clé `kg` du tout** — les deux formes que produit la chaîne. ⛔ **Le témoin ① existe pour que les autres mesurent quelque chose** : les 3 champs doivent être rendus, sinon « aucun null » serait vrai sur un écran vide. ⭐⭐ **Le témoin de l'ALLER-RETOUR est celui qui touche la cause** : il mesure `JSON.stringify`, pas la valeur en mémoire — sans lui on prouverait seulement que le champ n'affiche plus NaN, pas que la donnée **survit au rechargement**. ⭐⭐ **Et le dernier protège la RÈGLE, pas le cas** : aucun champ décimal en `type="text"` ne lit par `+this.value` — il rougira au prochain champ converti en texte dont on oubliera le lecteur de nombre, c'est-à-dire exactement ce qui est arrivé ici. **CONTRÔLE NÉGATIF, deux fois** : ① les gardes retirées, sa capture revient au caractère près — `["12","null","undefined"]` et « 62,5 » ressort en NaN ; ② le champ remis dans l'état de ft-v1057, le témoin de règle **nomme le coupable** (`updateSessSet(…,'kg',+this.value)`). 🧾 Famille **§30** de `BUGS.md`. Fichiers : `setup.js`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `Code.js`, `app.js`, `index.html`, `confidentialite.html`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-DE-PARTAGE.md`. ✅ **DÉPLOIEMENTS : les DEUX sont verts** — backend Apps Script (run #102) et site (run **#759**), vérifiés sur le commit, pas seulement poussés (**R18**). ⚠️⚠️ **ET IL A FALLU TROIS TENTATIVES, dont une que J'AI CASSÉE** : le run automatique a tourné **10 minutes exactes** sur « Déployer sur GitHub Pages » puis a lâché (délai dépassé — les 4 étapes précédentes vertes) ; ⛔⛔ ma relance par **`rerun_failed_jobs`** a échoué en **0 seconde** — *« Multiple artifacts named github-pages […] Artifact count is 2 »* : ***relancer les jobs échoués du MÊME run rejoue l'empaquetage et dépose un SECOND artefact***, que l'action refuse de départager. ⭐ **La bonne voie est un NOUVEAU run** (`workflow_dispatch`) — vert du premier coup. *Sans la vérification, Michel aurait ouvert l'app le soir même sur ft-v1089 en croyant avoir le correctif.* sw.js ft-v1090. ⚠️ **16ᵉ collision, et elle porte sur DEUX choses** : session-A a publié SA ft-v1089 pendant ce travail *et* nommé son bloc de test **CXCIV**, déjà pris par le mien. Ma version devient **ft-v1090** et mes deux blocs glissent en **CXCV · CXCVI** — *un numéro de cache ne recule jamais, on ne renumérote pas le travail de l'autre, et deux blocs du même nom masqueraient une disparition future* (§25). |


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
