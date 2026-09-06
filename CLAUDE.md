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

> **Version actuelle : `ft-v1152`** (prochaine : `ft-v1153`). Historique complet (ft-v128→574 + gouvernance
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

**ft-v1152 — 🏁 LE CARDIO SE DÉCLARE, IL NE SE DEVINE PLUS — ET C'EST LA PREMIÈRE FOIS QU'ON FERME CETTE FAMILLE AU LIEU DE L'ÉLARGIR** — Michel, après ft-v1150 : *« prends le, ferme ça définitivement »*. Je venais de lui dire, honnêtement, que je **ne pouvais pas** promettre « plus jamais ».

**⛔⛔ POURQUOI JE NE POUVAIS PAS LE PROMETTRE, ET POURQUOI ÇA CHANGE AUJOURD'HUI.** ft-v1147 puis ft-v1150 ont élargi une **devinette** : lire le nom du créneau, puis la machine nommée dans la note. Elle marche — **20 formulations sur 20** — mais elle reste une devinette : ***Milo n'a AUCUN endroit où dire « ceci est du cardio »***, il écrit une phrase française et l'app la décode. C'est **R4 dans sa forme pure** — l'information reste dans le **TEXTE** et n'atteint jamais la **DONNÉE**. *Tant qu'on devine, il restera un cas tordu, et une liste plus longue n'y changera rien.*

**⭐⭐ CE QUI FERME N'EST DONC PAS UNE LISTE PLUS LONGUE, C'EST UN CHAMP.** Le **cervelet** (`worker.js`, `seanceJson`) déclare désormais `cardio:{avant,apres}` et il lui est dit, en toutes lettres, de ne **JAMAIS** mettre le cardio dans `exs`. 👉 ***Celui qui SAIT où va le cardio le DIT, au lieu de laisser l'app le deviner à sa place.***

**⭐⭐ ET C'EST LE CERVELET, PAS MILO — ce qui décide de tout le reste, y compris de R34.** Le bloc caché `{"seance":…}` **a quitté le prompt de Milo en ft-v919** (re-mesuré par session-B en ft-v1130 : *« sa spec a quitté le prompt en ft-v919, donc l'étage 1 est structurellement mort »*). Le JSON est produit par la **2ᵉ IA**, celle qui ne sait **rien** de la personne. 👉 ***Le prompt de Milo n'a pas bougé d'un caractère, donc `R34` ne s'applique pas*** : ce qui change est l'instruction d'un **convertisseur**. Et ça reste une **transcription vérifiable**, jamais un jugement — le critère de `BRIEF-NUTRITION.md` §5 est respecté : *le cervelet ne décide pas qu'il faut du cardio, il recopie ce que le coach a écrit et à quel moment.*

**⛔ LE MODÈLE PROPOSE, LE CODE VALIDE — sans exception.** Type hors liste → « autre » · intensité inconnue → « modéré » · et surtout **durée absente ou absurde → le cardio est ANNULÉ**, jamais un nombre de minutes inventé (**R29**). ⭐ Les bornes sont **les mêmes** que celles de `_cardioDepuisEx` (1-180 min) : *un seul repère pour les deux chemins* (**R2**).

**⛔⛔ ET LA DEVINETTE DE ft-v1147/1150 RESTE — EN REPLI, PAS REMPLACÉE. C'est le témoin qui compte le plus.** Les **trois voies** vers une séance ne produisent pas toutes ce champ : le repli par lecture du texte (`_seanceDepuisTexte`) **ne le peut pas**, un cervelet en panne ou un worker pas encore déployé non plus. 👉 ***Un correctif qui REMPLACE le filet au lieu de s'ajouter dessus devient une régression le jour où il ne s'applique pas.*** Le champ déclaré gagne quand il est là ; sinon on devine exactement comme avant.

**⭐ LE POINT DE BRANCHEMENT EST CELUI QU'ON CONNAÎT DÉJÀ, ET C'EST LA 3ᵉ FOIS.** `_normalizeMiloSession` est le **SEUL écrivain** de `_pendingMiloSessions` en production : *un champ qu'un normaliseur ne recopie pas est un champ supprimé* — la leçon de `supersetGroup` (ft-v1130), payée deux fois.

**⭐⭐ ET `coach.js` N'A PAS ÉTÉ TOUCHÉ — MA PROPRE RÉSERVATION ANNONÇAIT 3 FICHIERS, IL N'EN A FALLU QUE 2.** J'avais écrit *« le champ TRANSITE par `coach.js` »* en pensant devoir l'y faire passer. **Mesuré en exécutant les deux fonctions, pas en les lisant** : `_cerveletFidele` rend `Object.assign({},sess,…)` et `_completerMonteeEnCharge` **mute sur place** → le champ traverse **tout seul**. ⛔ **Et c'est figé par un témoin**, parce que c'est exactement le genre de propriété qui se perd sans bruit : le jour où l'une des deux reconstruit son objet, le champ meurt en silence. *Vérifier une hypothèse a ici retiré un fichier du périmètre au lieu d'en ajouter un — et évité d'écrire dans le couloir de l'autre session.*

**📣 RÈGLE D'OR #11 — RIEN.** Réparation d'un comportement **déjà annoncé en ft-v995**, rien de neuf à l'écran, rien à faire. *Une pop-up dirait « ce qui était censé marcher marche encore mieux »* (R19/R25).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **un cardio au MILIEU de la séance reste un exercice** — décision de ft-v995, non rouverte. ⛔ **Le prompt de Milo reste intact** (**R7** : il est le dernier levier, et ici la structure a suffi). ⛔ **Et l'honnêteté sur ce que « définitivement » veut dire** : un cervelet reste un modèle, il peut mal transcrire. Ce qui change, c'est qu'il a désormais **un endroit pour le dire** et que le code **vérifie** ce qu'il y met — au lieu qu'on décode une phrase. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests : **parcours 2983/2983** (+15, bloc **CCLI**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées **0 trou**. ⭐⭐ **Les témoins exécutent les VRAIES fonctions dans un navigateur**, y compris de bout en bout jusqu'à `S.wkt.cardioAvant`. ⛔ **Deux contrôles avant tout le reste, et le second est le plus important** : les 7 fonctions doivent exister **et le normaliseur doit RECOPIER le champ** — *un validateur parfait que le seul écrivain ne recopie pas laisserait tous les autres témoins verts pendant que le champ n'arrive jamais.* ⛔⛔ **CONTRÔLE NÉGATIF PAR MUTATIONS, 6 variantes — et 4 mordent sur UN SEUL témoin chacune** : ① le normaliseur ne recopie pas → **3 rouges** (le défaut de ft-v1130 rejoué ; c'est cohérent, rien n'arrive) · ② priorité inversée → **1** · ③ le déclaré **remplace** le filet → **1**, exactement la non-régression · ④ aucune validation de durée → **1** · ⑤ accents non retirés → **1** · ⑥ ⭐ **prompt du cervelet revenu en arrière → 4 rouges côté PRODUCTEUR et ZÉRO côté app** — *ce qui prouve que les deux moitiés sont protégées séparément, et qu'un worker pas encore déployé laisse l'app parfaitement fonctionnelle, en repli.* ⚠️ **Et un de mes témoins a rougi sur sa propre citation** : il cherchait la phrase du prompt telle qu'elle se **lit**, alors qu'il lit la **source**, où l'apostrophe est échappée. *Corrigé — 4ᵉ fois de cette famille dans le projet.* ⚠️⚠️ **31ᵉ COLLISION, ET SUR LES DEUX À LA FOIS** : session-B avait déjà poussé **ft-v1151** *et* le bloc **CCL** — je passe à **ft-v1152** / **CCLI**. Fichiers : `worker.js`, `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1152. |

**ft-v1150 — 🔥 ON NE DÉPEND PLUS DU NOM POUR RECONNAÎTRE UN CARDIO — ET LE MOT « VÉLO » ÉTAIT PIÉGÉ PAR « DÉVELOPPÉ »** — Michel, une heure après ft-v1147 : *« non mais pourquoi l'échauffement apparaît dans la séance, j'ai créé exprès le cardio avant et après, ça ne doit pas se reproduire »*.

**⭐⭐ IL AVAIT RAISON DE NE PAS SE CONTENTER DU CORRECTIF PRÉCÉDENT.** ft-v1147 reconnaissait un cardio par une **liste de noms** — et *une liste de noms a toujours des trous*. **Mesuré sur 20 formulations plausibles de Milo : 6 passaient encore** — `Warm-up` (le tiret !), `Mobilité`, `Activation`, `Préparation articulaire`, `Fin de séance`, et **`Vélo`**. Après : **20/20**.

**⛔⛔ LE CAS DU `Vélo` EST LE PLUS INSTRUCTIF, ET JE NE L'AURAIS JAMAIS DEVINÉ SANS LE MESURER.** Le mot le plus banal du cardio était **absent** de la liste de `_exEquip` — qui contient pourtant rameur, tapis, elliptique, corde à sauter. **Pas par oubli** : ***`développé` désaccentué CONTIENT `velo`*** (`_naz('Développé Couché')` = `developpe couche`). Un `/velo/` nu classerait donc **TOUS LES DÉVELOPPÉS EN CARDIO**. 👉 **Chiffré à la mutation de contrôle N2** : sans les bornes de mot, le catalogue passe de **21 à 45** exercices rangés en cardio — ***24 mouvements de musculation reclassés en silence***. *C'est « le premier match gagnant » de `BUGS.md` dans sa forme la plus vicieuse : le motif juste est piégé par un mot beaucoup plus fréquent qui le contient.* ⭐ `\bvelo\b` lève le piège, et **aucun nom du catalogue** ne contient `velo` en mot entier.

**⭐⭐ LE VRAI CORRECTIF N'EST PAS D'ALLONGER LA LISTE, C'EST D'ARRÊTER DE S'Y FIER.** *La MACHINE est le signal fiable, pas le titre du créneau* : si Milo écrit « 8 min d'elliptique », c'est du cardio quel que soit le nom qu'il met devant. **Trois gardes** rendent cet élargissement sûr, et chacun protège un cas réel : ① aucune **CHARGE** sur les séries (le garde de ft-v1147 — la ligne de paliers porte le même nom) · ② une **DURÉE** réellement lisible (on n'invente jamais un nombre de minutes) · ③ ⭐⭐ **et le nom ne doit pas être un exercice du CATALOGUE** — sans lui, un *« Gainage · 3 min, juste après le tapis »* partirait au bloc cardio et **disparaîtrait de la séance** (mesuré à la mutation N1). *Un exercice que le catalogue connaît est un exercice, point.*

**⚠️⚠️ ET L'HONNÊTETÉ DE FOND, ÉCRITE POUR QUE PERSONNE NE PROMETTE L'IMPOSSIBLE.** Michel demande *« ça ne doit pas se reproduire »* — et je ne peux pas le garantir, parce que ***l'app DEVINE***. Milo n'a **aucun champ** pour dire *« ceci est du cardio »* : il écrit une phrase, l'app la décode. C'est **R4** dans sa forme pure — *l'information reste dans le TEXTE et n'atteint jamais la DONNÉE*. **Tant qu'on devine, il restera un cas tordu.** Le « plus jamais » définitif est un **champ structuré**, qui touche le **prompt** (donc **R34** : un changement de contexte se valide au banc d'essai) et **`coach.js`** — **signalé à session-B, pas pris.**

**📣 RÈGLE D'OR #11 — RIEN.** Réparation d'un comportement **déjà annoncé en ft-v995**, le bloc Cardio est déjà décrit dans l'aide et le Guide. *Une pop-up dirait « ce qui était censé marcher marche mieux »* (R19/R25).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **un cardio au MILIEU de la séance reste un exercice** (décision ft-v995, non rouverte). ⛔ **Le prompt n'a pas bougé** — R7, il reste le dernier levier. ⛔ **Et le catalogue n'est pas élargi** : les 21 exercices cardio sont exactement les mêmes qu'avant, c'est **vérifié**, pas supposé. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests : **parcours 2968/2968** (+9, bloc **CCXLIX**), **calculs 339/339**, muscles 241/241, croisés 50/50, **dates 9/9**, données classées **0 trou**. ⭐⭐ **La non-régression qui compte le plus n'est pas dans le correctif, elle est à côté** : les **322 exercices du catalogue sont classés à l'identique** (21 en cardio, avant comme après) — *toucher `_exEquip` peut déplacer des exercices dans le sélecteur sans qu'aucun écran n'ait l'air faux.* ⛔ **Et un témoin FIGE LE PIÈGE** : il vérifie que `développé` contient bien `velo` **et** reste de la musculation — *il existe pour que personne ne « simplifie » le motif en retirant les `\b`.* ⛔ **Contrôle négatif en 4 variantes** : **arbre d'avant → 3 rouges sur 9** — ⚠️ **et je dis ce qu'il vaut** : les 6 verts sont les **gardes**, vrais **trivialement** puisque rien ne partait au cardio ; *ce ne sont pas des détecteurs*. **Garde catalogue retiré → 1 rouge**, le Gainage se fait manger. **Bornes de mot retirées → 2 rouges**, 21 → 45 exercices en cardio. **Voie « machine nommée » retirée → 1 rouge**, les trous se rouvrent. ⭐ *Chaque mutation casse UNE garantie et une seule.* Fichiers : `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1150. |

**ft-v1149 — 🔤 LES DEUX BOUTONS DE FUSION DISAIENT LA MÊME CHOSE — SUR UNE ACTION IRRÉVERSIBLE** — capture de Michel sur l'écran Admin, **le jour même** de ft-v1148 : ses 4 doublons sont tous détectés et correctement étiquetés (*« ↔ même exercice, un nom est raccourci — « … (Shoulder Press) » est celui du catalogue »*). Le correctif marchait.

**⛔⛔ MAIS LES DEUX BOUTONS DE CHOIX ÉTAIENT COUPÉS AUX 18 PREMIERS CARACTÈRES — MESURÉ SUR SES 4 PAIRES RÉELLES : 2 AFFICHAIENT DEUX FOIS LE MÊME BOUTON.** *« Garder "Développé Épaules …" »* à gauche **comme à droite**, idem pour le rowing ; et les deux autres ne se distinguaient que par un **« … »** ou une **parenthèse ouvrante**.

**⭐⭐ ET CE N'EST PAS UN HASARD DE LONGUEUR — C'EST LE VRAI ENSEIGNEMENT.** La famille « suffixe » que ft-v1148 venait d'ouvrir est **par définition** celle où les deux noms **partagent leur début**. 👉 ***Le correctif de la veille a rendu FRÉQUENT le cas que cette coupe ne savait pas afficher.*** *Un correctif peut fabriquer son propre défaut d'affichage sans qu'aucun test ne bouge* — celui-ci ne s'est vu que parce que Michel a envoyé sa capture.

**⛔⛔ CE QUE ÇA COÛTE, ET C'EST CE QUI DÉCIDE DE LA MÉTHODE.** `mergeExercises` est **IRRÉVERSIBLE**. Deux boutons jumeaux sur une fusion définitive **ne font pas renoncer** : ils font **taper au hasard une fois sur deux**. *Une action sans retour dont on ne peut pas lire les options est pire qu'une action absente* (**R29** — le coût de l'erreur décide de la méthode).

**⭐ LA RÈGLE DU CORRECTIF TIENT EN UNE PHRASE : on coupe là où c'est INFORMATIF.** Si les deux têtes se ressemblent, on garde la **FIN** — c'est-à-dire exactement ce qui les sépare : *« Garder "Abduction Cuisses" »* contre *« Garder "…uisses (Leg Abduction)" »*. Et en dernier recours **on ne coupe plus du tout**. ⛔ Un témoin exige que le **suffixe reste visible**, pas seulement que les deux étiquettes diffèrent : *« …e Machine » et « …s Machine » seraient distinctes et ne diraient rien* — distinct ne suffit pas, il faut que ce soit **l'élément qui permet de trancher** qui survive à la coupe.

**⛔⛔ ET LA SEULE ÉGALITÉ QUI COMPTE EST CELLE QUE L'ŒIL VOIT — sans ça, le garde-fou aurait été VERT sans rien protéger.** *« Hip Thrust Barre »* et *« Hip Thrust Barre ( »* sont deux chaînes **différentes** pour le code et **le même mot** pour la personne ; *« Squat »* et *« Squat »* ne diffèrent que d'une **espace de fin**. La comparaison ignore donc le « … » et la ponctuation de fin, et le dernier garde-fou compare les espaces **normalisées**. 👉 ***Un test d'égalité écrit sur les chaînes brutes aurait passé sur les deux cas où l'écran ment.***

**⛔ JE NE TOUCHE QU'À L'ÉTIQUETTE.** Ni le rapprochement, ni le seuil de **1 lettre**, ni `mergeExercises`. **Trois témoins de non-régression le figent** — sinon *« les boutons sont lisibles »* serait vrai le jour où **plus aucun doublon n'est détecté**.

**📣 RÈGLE D'OR #11 — RIEN.** L'écran est derrière l'admin, et c'est la réparation d'un affichage que **personne d'autre ne voit** (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **la réparation du passé reste derrière l'ADMIN** — inchangé depuis ft-v1148, et toujours une décision produit. ⛔ **Aucune fusion automatique** : on montre, Michel tranche. ⛔ Et la **recherche d'exercices ne découpe toujours pas les mots** (*« biceps marteau »* → 0 résultat) : mesuré, noté, pas dans cette version. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests : **parcours 2959/2959** (+12, bloc **CCXLVIII**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐⭐ **Les témoins exécutent la VRAIE fonction extraite de `setup.js`** — *un `grep` dirait que le code coupe autrement, jamais que les deux étiquettes **SE LISENT** différemment.* ⛔⛔ **Deux contrôles avant tout le reste, et le second est le plus important** : la fonction doit exister **et l'écran doit l'UTILISER** — *une fonction d'étiquetage parfaite jamais appelée laisserait tous les autres témoins verts pendant que l'écran continue d'afficher deux boutons identiques.* ⛔ **Contrôle négatif** — **4 variantes, et chacune mord sur UNE garantie et une seule.** ① **L'arbre d'avant : 3 rouges** — ⚠️ *et je dis ce qu'ils valent* : ce sont **les trois contrôles**, le bloc s'arrête là, donc les 9 témoins suivants ne sont pas *verts*, ils ne sont **pas joués**. ② **La fonction écrite mais jamais appelée par l'écran : 1 rouge**, exactement le contrôle n°2 — ⭐ *et c'est sa raison d'être : le témoin des 4 paires reste vert, puisqu'il interroge la fonction directement, pendant que l'écran continuerait d'afficher deux boutons identiques.* ③ **L'escalade vers la fin retirée : 1 rouge**, celui de la longueur — les étiquettes redeviennent lisibles mais **deux fois trop longues** pour deux boutons côte à côte. ④ **La comparaison faite sur les chaînes brutes : 1 rouge**, exactement le cas de l'espace de fin. ⚠️ **Et ma première version de cette 4ᵉ mutation n'a PAS mordu** : je n'avais changé qu'**un** des deux garde-fous, le second rattrapait — *une mutation qui ne casse rien ne prouve pas que le code est solide, elle prouve qu'on a mal visé.* Fichiers : `setup.js`, `tests/parcours/runner.js`, `BUGS.md` (famille **44**), `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1149. |

**ft-v1147 — 🔥 L'ÉCHAUFFEMENT CARDIO DE MILO ATTERRISSAIT DANS LA LISTE DES EXERCICES — ET MILO N'Y ÉTAIT POUR RIEN** — Michel, capture à l'appui : *« Milo me propose un échauffement en début de séance, ça ne va pas du tout, pourquoi ça arrive ? »*, puis *« essaye de voir ça avant de modifier quoi que ce soit »*.

**⛔⛔ SUR SA CAPTURE** : un exercice **« Échauffement »**, 0/1 série, 8 reps, note *« 8 min d'elliptique en intensité légère »* — pendant que le **bloc Cardio juste au-dessus reste vide**.

**⭐⭐ MILO A OBÉI À LA LETTRE, ET C'EST TOUT LE SUJET.** Son prompt lui dit noir sur blanc *« ⛔ NE METS JAMAIS le cardio dans la liste des exercices »*… et lui donne pour exemple, **mot pour mot** : *« Échauffement : 8 min d'elliptique en intensité légère »*. C'est **exactement** ce qu'il y a sur l'écran de Michel. 👉 ***Le prompt met la machine dans la NOTE, le lecteur la cherchait dans le NOM.*** Les deux bouts de la chaîne ne parlaient pas du même endroit — **la forme exacte de ft-v995**, dont le correctif n'avait bouché qu'un côté.

**⭐ MESURÉ DANS UN VRAI NAVIGATEUR, PAS LU** : `_exEquip('Elliptique')` → **`cardio`** ✅ · `_exEquip('Échauffement')` → **`autre`** ❌. Le filtre écartait donc l'entrée d'emblée. ⭐⭐ **Et le lecteur SAIT parfaitement lire cette ligne** : passé l'exercice tel quel, `_cardioDepuisEx` rend `{durée: 8, intensité: légère}` — ***il n'était simplement jamais appelé***. *Le mécanisme était bon ; c'est son point d'entrée qui était trop étroit.*

**⛔⛔ LE GARDE SUR LA CHARGE EST LE CŒUR DU CORRECTIF, PAS UN DÉTAIL — sans lui, cette réparation DÉTRUIRAIT des séances.** La ligne de **PALIERS** d'échauffement porte **le même nom** et une durée parfaitement lisible : *« Échauffement : 40×5 → 55×3 → 70×2 — repos 2 min »*. **Mesuré au contrôle négatif M1** : garde retiré, la montée en charge du squat **disparaît de la séance**, convertie en « 2 minutes de cardio ». 👉 ***Retirer un exercice réel coûte infiniment plus cher que laisser un échauffement dans la liste*** (**R29**) : une entrée dont une série porte des **kg** n'est **jamais** du cardio.

**⚠️ 2ᵉ DÉFAUT AU MÊME ENDROIT, ET IL COÛTE DES CALORIES** : le TYPE se cherchait dans le **nom seul**, donc il ressortait **« autre » au lieu d'« elliptique »** — or le type choisit le MET. ⛔ **Il se cherche désormais dans le NOM D'ABORD, puis dans la note, et l'ordre est une GARANTIE** : chercher dans « nom + note » d'un seul bloc ferait gagner **le premier motif de la table**, pas le plus juste — un *« Rameur »* dont la note dit *« comme sur le tapis »* deviendrait un **tapis**. *C'est « le premier match gagnant » de `BUGS.md`, retourné à notre avantage : on interroge la source fiable d'abord.*

**⛔ CE QUI N'A PAS BOUGÉ, ET POURQUOI.** ⛔ **Le prompt reste intact** : **R7** — le prompt est le **dernier** levier, on répare d'abord la structure ; et le changer se validerait au **banc d'essai** (**R34**), que je ne peux pas faire tourner. ⛔ **Rien dans `coach.js`** (session-B y travaillait) ni dans `Code.js` (aucun déploiement backend).

**⚠️ ET UNE CONFUSION ÉVITÉE DE JUSTESSE** : session-B m'avait laissé une note *« l'échauffement réduit »* le même jour. **Ce n'est pas le même sujet** — la leur porte sur la **montée en charge** (`_completerMonteeEnCharge`, les ancres), la mienne sur le **cardio mal aiguillé**. *Deux « échauffements » différents dans la même journée, et les confondre aurait fait corriger le mauvais code.*

**📣 RÈGLE D'OR #11 — RIEN, et c'est le précédent de ft-v1049.** C'est une **réparation** d'un comportement **déjà annoncé en ft-v995**, et le bloc Cardio est déjà décrit dans l'aide détaillée et le Guide. *Une pop-up dirait « ce qui était censé marcher marche » — du bruit* (R19/R25).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **un cardio au MILIEU de la séance reste un exercice** — décision de ft-v995 non rouverte : on ne sait pas ce que la personne voulait, et deviner coûterait plus cher que ne rien faire (R29). ⛔ **Un « Échauffement épaules — 5 min » sans charge part lui aussi dans le bloc**, avec le type « autre » : *limite écrite plutôt que découverte*, assumée — c'est bien un échauffement sans charge, et l'erreur de calories est petite et dans le bon sens. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests : **parcours 2929/2929** (+10, bloc **CCXLVI**), **calculs 339/339**, muscles 241/241, croisés 50/50, **dates 9/9**, données classées **0 trou**. ⛔ **Deux contrôles avant tout le reste** : les 4 fonctions doivent exister, **et la non-régression de ft-v995** (une machine NOMMÉE part toujours au bloc cardio) — *sans elle, « rien ne part au cardio » serait vert sur un extracteur mort.* ⭐⭐ **Et les témoins de REFUS comptent plus que ceux d'extraction** : la ligne de paliers, la note « repos 3 min », l'absence de durée. *Ce bloc protège deux choses opposées, et la seconde est la plus chère.* ⛔ **Contrôle négatif en 3 variantes** : **arbre d'avant → 3 rouges sur 10** — ⚠️ **et je dis ce qu'il vaut** : les 7 verts sont les **refus**, vrais **trivialement** puisque l'ancien code n'extrayait rien ; *ce sont des gardes, pas des détecteurs*. **Garde kg retiré → 1 rouge**, exactement celui des paliers. **Ordre nom>note supprimé → 1 rouge**, exactement celui du rameur. ⭐ *Chaque mutation casse UNE garantie et une seule — c'est ça qui prouve que les témoins visent le mécanisme.* Fichiers : `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1147. |

**ft-v1148 — 🔗 LES NOMS D'EXERCICES SE DÉDOUBLENT DEPUIS LE 24/08 — ET MICHEL A CRU À UNE PERTE DE DONNÉES** — en pleine séance, à la salle : *« Perte de données. Dans précédent j'ai déjà fait cet exercice et l'historique a disparu et je n'ai plus de stats non plus »*.

**⛔⛔ RIEN N'ÉTAIT PERDU — SON HISTORIQUE PORTAIT UN AUTRE NOM.** Et trois sondes le disaient déjà avant même de regarder le code : *« Historiques protégés : aucun rétrécissement refusé »*, stockage des comptes à **40 %**, sauvegarde du jour présente. *La panne était dans la LECTURE, pas dans la donnée.*

**⭐⭐ MESURÉ SUR SES 44 SÉANCES, ET LE MOTIF EST UNIQUE : 4 DOUBLONS, TOUS LE NOM PRIVÉ DE SON SUFFIXE.** `Abduction Cuisses` (1 séance) contre `… (Leg Abduction)` (6) · `Hip Thrust Barre` (2) contre `… (Poussée de Hanche)` (3) · `Rowing Poitrine Appuyée` (1) contre `… (Chest Supported)` (4) · `Développé Épaules Assis Machine` (1) contre `… (Shoulder Press)` (4). 👉 ***Dans les quatre cas le nom COMPLET vient d'abord, le tronqué suit — et jamais avant le 24 août.***

**⛔⛔ POURQUOI ÇA A DURÉ DEUX SEMAINES SANS QUE PERSONNE NE VOIE RIEN — c'est le vrai enseignement, et il est écrit dans le code qui l'a causé.** `ft-v996` (24/08) a branché le résolveur de noms sur **sept lectures d'AFFICHAGE** (animation, image de muscle, fiche, tutoriel, vidéo) et **volontairement pas** sur l'historique. Son propre commentaire le dit : *« elles lisent ce que la personne a rangé sous SON nom. Seul le catalogue est résolu. »* 👉 ***Le doublon n'est pas devenu plus fréquent : il est devenu INVISIBLE.*** Avant, un nom tronqué n'avait ni animation ni muscles — ça se voyait au premier coup d'œil. Depuis, il a **tout**, et seul l'historique manque. *Un choix argumenté dont personne n'a mesuré la conséquence.*

**⛔ ET LE DÉTECTEUR DE DOUBLONS NE POUVAIT PAS LES VOIR, structurellement.** `detectDuplicates` rapproche sur l'égalité normalisée ou une **distance de Levenshtein ≤ 1** — or ` (Shoulder Press)` fait **15 caractères d'écart**. *Il est fait pour les fautes de frappe, pas pour les suffixes* : deux familles, un seul critère. L'outil de réparation existait, il ne voyait simplement pas la panne.

**⭐ LE CORRECTIF EST EN DEUX MOITIÉS, ET AUCUNE NE SUFFIT SEULE.** ① Le nom est résolu **dans `_normalizeMiloSession`**, le **SEUL écrivain** de `_pendingMiloSessions` en production — donc le seul point que les trois voies traversent (bloc caché · cervelet · repli par lecture du texte). ⚠️ **Et AVANT `_intensiteDefauts`**, qui cherche `S.prs[nom]` et **se tait sans record** : *un nom qui ne colle pas n'éteint pas que l'affichage, il éteint un garde-fou.* ② `detectDuplicates` reconnaît la famille « suffixe », ce qui rend le passé réparable **en un tap** avec `mergeExercises`. *Fermer la porte sans réparer laisse les doublons ; réparer sans fermer les fait revenir à la séance suivante.*

**⭐ R13 — `exNomCatalogue` ET `mergeExercises` EXISTENT DÉJÀ ET MARCHENT**, vérifié en les lançant sur ses vrais noms : ils rattrapent les 4. On les **branche**, on n'en écrit pas de nouveaux — un second rapprochement finirait par diverger du premier (**R2**).

**⛔⛔ LE GARDE-FOU EST NON NÉGOCIABLE, ET IL EST MESURÉ DANS LES DEUX SENS.** On ne rapproche **que** sur un suffixe entre parenthèses, **jamais** sur une ressemblance : `Développé Épaules Machine` et `Développé Épaules Assis Machine` sont deux machines **réellement différentes**. *Afficher les charges de l'une sous l'autre serait pire que l'absence, parce qu'on le croirait* (**R29** — le coût de l'erreur décide de la méthode). ⛔ Et **le seuil de ressemblance reste à 1 lettre** : on ajoute une famille **nommée**, on n'élargit pas l'à-peu-près — l'assouplissement aurait « marché » aussi, et aurait proposé de fusionner ces deux machines.

**⛔ AUCUNE FUSION AUTOMATIQUE (R29).** `mergeExercises` est **irréversible** : on montre les doublons, on dit lequel est celui du catalogue, et la personne tranche. *Informer sans décider.*

**📣 RÈGLE D'OR #11 — AIDE OUI, POINT ROUGE NON, POP-UP NON.** ⭐ Une entrée d'aide détaillée répond mot pour mot à la question qu'il s'est posée : *« la colonne précédent est vide ? c'est un NOM, pas une perte »* — parce que d'autres se la poseront et que **ça ne se devine pas**. ⛔ **Pas de point rouge** : rien de neuf n'apparaît à l'écran, il n'y a rien à découvrir. ⛔ **Pas de pop-up** : rien n'est à faire, et annoncer *« vos exercices se dédoublaient »* à des gens qui n'ont rien perdu est une **alarme rétroactive** (**R25**).

**⏭️ CE QUE ÇA NE FAIT PAS, écrit pour ne pas le redécouvrir** : ⛔⛔ **la réparation du passé est derrière l'ADMIN** — la porte est fermée pour tout le monde, **le rattrapage ne l'est pas**. Quelqu'un d'autre qui aurait des doublons ne peut pas les fusionner. *Noté, pas construit* : exposer une action irréversible à tous est une décision produit. ⛔ **La recherche d'exercices ne découpe toujours pas les mots** : mesuré, *« biceps marteau »* rend **0 résultat** alors que *« biceps »* en rend 13 et que le Marteau y est — un défaut réel, séparé, pas dans cette version. ⛔ Et le tiret de la colonne « précédent » **ne dit toujours pas « 1ʳᵉ fois »** quand l'exercice est vraiment nouveau. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

**⚠️⚠️ ET IL A EU RAISON CONTRE MOI DEUX FOIS — c'est la leçon de méthode de la journée.** Mon extraction de son export PDF coupait les noms longs sur **trois lignes**, donc elle m'a rendu *« les deux noms sont identiques »* : ***j'ai fabriqué moi-même la preuve de mon erreur***, et je la lui ai annoncée avec assurance après avoir abandonné la bonne hypothèse. Il a insisté (*« j'en suis persuadé que non »*). Il avait raison. *Un outil de mesure défaillant ne rend pas « rien » : il rend une conclusion fausse et crédible.*

Tests : **parcours 2947/2947** (+18, bloc **CCXLVII**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐⭐ **LES TÉMOINS EXÉCUTENT LA VRAIE FONCTION DE `log.js`, extraite du fichier — et cette correction a été payée par un contrôle négatif RATÉ.** Ma 1ʳᵉ version reconstruisait le résolveur dans le bac à sable : en retirant le garde-fou de la vraie fonction, le bloc restait **vert 17/17**. 👉 ***Un témoin qui rejoue sa propre copie du code ne teste pas le code, il se teste lui-même*** (`BUGS.md` §36). ⛔ **Contrôle négatif : 5 rouges sur l'arbre d'avant, et 3 mutations ciblées qui mordent chacune sur UN SEUL témoin** — ① la garde « la cible doit exister » retirée · ② le seuil de ressemblance passé de 1 à 4 · ③ la résolution branchée ailleurs que dans le normaliseur. ⚠️ **Et je dis ce que vaut la garde n°①** : `_EX_BASE2NOM` étant construit **depuis** `EXLIB`, aucun cas actuel ne peut la déclencher — elle est **défensive**, figée par sa présence, et le témoin le dit plutôt que de laisser croire qu'elle a été vue mordre. Fichiers : `log.js`, `setup.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1148. |

**ft-v1146 — 📊 COMBIEN DE FOIS MILO ET L'APP SE CONTREDISENT-ILS ? — LE CHIFFRE QUI MANQUAIT AVANT DE CHOISIR UN REMÈDE** — Michel est à la salle (*« fais au mieux »*), après la capture du matin : Milo prescrit **3×3 à 100 kg** au développé couché, et l'app affiche **juste dessous** *« 93 % du 1RM estimé (108 kg) — tenable sur UNE série max, pas sur 3, viser ~95 kg »*.

**⛔⛔ POUR LA PERSONNE, FORCE TRACKER SE CONTREDIT LUI-MÊME — et l'audit du matin a montré que PERSONNE N'A TORT** (`docs/AUDIT-GARDIEN-PRESCRIPTION.md`). Les deux calculs sont justes et ils emploient **le même 1RM** : Milo répond à *« quelle progression ? »* (99 → 100, soit **+1 kg**), le contrôle répond à *« ce triple est-il tenable trois fois ? »* d'après une table de pourcentages. L'asymétrie n'est pas dans les **données**, elle est dans la **règle** et le **moment** — le contrôle tourne **après** Milo, avec l'historique récent qu'il ne lit pas, selon une règle que Milo n'a jamais reçue.

**⭐⭐ DONC LA QUESTION N'EST PAS « QUI A RAISON », C'EST « À QUELLE FRÉQUENCE » — et c'est elle qui décide du remède.** *Un conflit sur cent est un cas limite : on reformule une phrase. Un sur trois, c'est le prompt de Milo ou le coefficient qu'il faut revoir.* 👉 ***Personne ne l'avait mesurée***, et sans ce chiffre tout dimensionnement est une hypothèse (**R19** : une architecture faite pour un problème qu'on n'a pas est une dette).

**⛔⛔ ET LE BANC D'ESSAI NE PEUT PAS Y RÉPONDRE — c'est MESURÉ, pas supposé, et c'est la découverte la plus utile de la version.** Le contrôle commence par `if(!(rm1>0)) return out;` : **sans record, il se tait entièrement**. Or sur les **56 scénarios** du banc, **7 seulement portent un `rm1`**, et **6** demandent en plus une séance. 👉 ***Un dénominateur de 6 ne mesure pas une fréquence*** — il rendrait un chiffre plausible entre 0 % et 100 % par pas de 17 points, qu'on citerait ensuite comme s'il voulait dire quelque chose. *C'est le contrôle négatif à zéro rouge de `BUGS.md`, sous un autre déguisement.*

**⭐ D'OÙ UN COMPTEUR LOCAL, LÀ OÙ LE CONTRÔLE TOURNE DÉJÀ — et posé au POINT DE PASSAGE DES TROIS VOIES** (bloc caché · cervelet · repli par lecture du texte), pas sur une seule porte : *c'est l'erreur que le contrôle d'intensité, le cardio et le superset ont chacun faite avant lui*, et elle est écrite en toutes lettres dans `_appliqueMiloSession`. **R13** : on recopie le patron de `_gardienCompter` (une clé dédiée, un seul écrivain, une version de règle), on n'en invente pas un deuxième.

**⛔⛔ LE 2ᵉ DÉNOMINATEUR EST LE CŒUR DE LA VERSION, et c'était le plus facile à rater.** Une séance sur un exercice **sans record** ne peut PAS déclencher le contrôle. La compter comme *« pas de conflit »* ferait **baisser le taux sans qu'aucun conflit ait été évité** — c'est-à-dire un chiffre faux **dans le sens rassurant**, le pire des deux. Les séances **jugeables** sont donc comptées à part, et c'est sur elles que le taux se lit. Un témoin l'épingle dans les deux sens (avec record / sans record), et un autre refuse qu'un `rm1` à **0** passe pour un record — *exactement ce que le contrôle lui-même refuse*.

**⛔ IL RESTE LOCAL, ET C'EST ÉCRIT PLUTÔT QUE SUBI (R30).** Le Gardien, lui, voyage — parce que Michel voulait lire le Milo des autres. Ici la question posée est *« est-ce que ça m'arrive souvent, à MOI ? »* : un seul téléphone y répond. Le chemin pour le faire voyager est connu (`S.gardienStats` : miroir mémoire + `Code.js`), **il demande un déploiement backend et il n'est pas nécessaire pour trancher aujourd'hui** — d'autant que session-A travaillait au même moment sur l'échauffement.

**⛔⛔ R4a — MILO NE LE REÇOIT PAS, avec sa raison.** Lui dire *« tu as été contesté 12 fois »* le ferait prescrire **défensivement** : on ne mesurerait plus son jugement, on mesurerait **sa réaction à l'idée d'être contredit**. *C'est exactement l'argument qui tient `evalHist` hors de son contexte* — savoir qu'on est noté n'est pas connaître les réponses, et savoir qu'on compte n'est pas neutre quand c'est vous qu'on compte. Un témoin vérifie que ni la clé ni le nom n'entrent dans `buildCoachContext`.

**⭐ ET L'ÉCRAN NE DÉSIGNE PAS DE COUPABLE**, parce que c'est la première chose qu'on lira dedans : il dit en toutes lettres qu'une contradiction **n'est pas une faute de Milo**, et rappelle que sans record le contrôle se tait — *donc l'absence d'alerte ne prouve rien*. Sinon on « corrigerait » le mauvais bout de la chaîne, ce qui est précisément ce que l'audit interdit.

**📣 RÈGLE D'OR #11 — RIEN, et c'est argumenté.** L'écran est **derrière l'admin** (`_isAdminUnlocked`), aucune charge ne change, rien ne bouge à l'écran, rien n'est à faire. Un point rouge ou une pop-up annonceraient à **tous** une porte qu'ils ne verront jamais — du bruit pur (**R19/R25**). *L'explication vit là où le bouton vit.*

**⏭️ CE QUE ÇA NE FAIT PAS, écrit pour ne pas le redécouvrir** : ⛔ ça **ne corrige RIEN** — ni le coefficient `_INT_TENUE` (0,93), ni le prompt de Milo, ni l'ordre du pipeline ; les trois décisions restent à Michel (`docs/ADAPTATION-DES-SEANCES.md`). ⛔ Ça **ne remonte pas dans le passé** : les séances d'avant cette version n'ont jamais été comptées, et **l'écran vide le DIT** plutôt que d'afficher un « 0 » qui se lirait *« ça n'arrive jamais »* (**R29**). ⛔ Et le compteur ne voit que les séances proposées **par Milo dans le chat** — pas celles qu'on écrit soi-même, ce qui est voulu : la question porte sur *ses* prescriptions. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests : **parcours 2919/2919** (+15, bloc **CCXLV**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐⭐ **LES TÉMOINS SONT FONCTIONNELS, PAS DES `grep`** : la fonction est **réellement exécutée** dans un bac à sable avec un faux stockage et un faux `S`. *Un motif dirait seulement que le code **ressemble** à un compteur ; ici on vérifie qu'il **compte**, et surtout qu'il compte le bon dénominateur.* ⛔ **Deux contrôles avant tout le reste** : les fonctions doivent exister **et l'appel doit être posé** — *un compteur parfait qui n'est jamais appelé ne compterait jamais, et tous les autres témoins seraient verts sur du vide.* ⛔ **Contrôle négatif : **3 mutations ciblées du code NEUF, chacune touche exactement le bon témoin** — ① le comptage des « jugeables » retiré → **2 rouges** · ② le dénominateur remis dans le `if(lignes.length)` → **2 rouges** · ③ le compteur donné à Milo → **1 rouge (R4a)**. ⚠️ **Et je dis pourquoi ce n'est PAS « 15 rouges sur l'arbre d'avant »** : sans les deux fonctions, le bloc s'arrête à son contrôle d'ouverture — les 11 témoins suivants ne sont pas *verts*, ils ne sont **pas joués**. *Compter des témoins non exécutés comme une preuve serait exactement le contrôle négatif menteur de `BUGS.md`.* Le vrai contrôle négatif est donc celui des mutations : chacune casse **une** garantie et **une seule****. Fichiers : `coach.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1146. |

**ft-v1145 — 🌙 UN ÉTAT PARFAIT ANNONCÉ COMME UNE ANOMALIE — ET LE TROU TROUVÉ EN CHERCHANT LE TEXTE EST PIRE QUE LE TEXTE** — Michel lance `reparerSauvegardeNuit` depuis l'IDE Apps Script, à ma demande. **Tout marche** : ancien déclencheur supprimé, **2 posés (2h et 14h)**, sauvegarde immédiate écrite (`backup-2026-09-06-16-27.json`, **1102 Ko, 12 comptes**, 65 fichiers). Et le journal lui répond : ***« Déclencheurs de sauvegarde actifs : 2 (attendu : 1) »***.

**⛔⛔ LE « 1 » N'AVAIT PAS SUIVI LE PASSAGE À 2 SAUVEGARDES/JOUR DU 31/08.** La liste `[2, 14]` avait bien été changée dans la fonction… et **trois textes étaient restés à « 1 »** ailleurs : ce journal, la ligne de log de l'installation, et **l'écran Admin de l'app** (*« Programmée chaque nuit »*, alors qu'il y en a une le matin **et** une l'après-midi — la 2ᵉ existe exprès pour couvrir les séances de la journée). 👉 ***C'est le pire défaut possible pour une sonde : celui qui apprend à ignorer l'alarme*** — et c'est exactement ce qui a coûté **36 jours sans sauvegarde** en août, ce qui était **déjà écrit trois lignes plus haut dans le même fichier**.

**⭐⭐ MAIS LE VRAI SUJET N'EST PAS LE TEXTE — C'EST CE QUE J'AI TROUVÉ EN LE CHERCHANT, ET C'EST BEAUCOUP PLUS GRAVE.** L'écran Admin ne testait que `!bk.triggersInstalled` : **il ne rougissait qu'à ZÉRO**. ⛔⛔ **Mesuré au contrôle négatif** : avec **1 déclencheur sur 2**, la carte affichait **8 verts, 0 orange, la même phrase** qu'avec 2 sur 2 — ***écart ZÉRO***. 👉 ***La moitié des sauvegardes pouvait disparaître sans qu'aucun voyant ne bouge.*** *Un voyant qui ne peut pas passer au rouge n'est pas un voyant, c'est une décoration* — le mode de panne exact d'août, retrouvé intact ailleurs.

**⭐ LE CORRECTIF EST UNE SOURCE UNIQUE, PAS TROIS TEXTES RECORRIGÉS (R2).** `BACKUP_HOURS_ = [2, 14]` (dans `Code.js`) possède **les heures**, **le nombre attendu** (`.length`, plus jamais écrit à la main) **et la phrase française** (`_backupSchedLabel_`). `checkBackup` les **ENVOIE** (`triggersAttendus`, `backupHours`, `schedLabel`), et `app.js` **affiche ce que le serveur annonce** au lieu d'une phrase écrite en dur. 👉 ***Changer les heures met tout à jour, y compris l'écran*** — *une phrase recopiée dans un autre fichier ne suit pas le mécanisme qu'elle décrit*, et c'est précisément comme ça qu'on en est arrivés là.

**⛔ ET LE JOURNAL DIT SI ÇA CORRESPOND, au lieu de laisser lire deux nombres côte à côte** : `2/2 ✅ (2× par jour (2h et 14h UTC))`, ou `1/2 ⚠️ ÉCART`. *Michel n'a pas à faire la soustraction pour savoir si son installation a réussi.*

**⛔ REPLI PRÉVU** : si un serveur pas encore redéployé n'envoie pas `schedLabel`, l'app affiche « Programmée automatiquement » — **jamais une ligne vide**, et aucun faux rouge pendant les deux minutes de déploiement.

**📣 RÈGLE D'OR #11 — RIEN.** L'écran est derrière l'admin, rien ne change pour personne d'autre, rien n'est à faire. Un point rouge annoncerait à tout le monde une porte qu'ils ne verront jamais (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **aucune alerte ne PART toute seule** — il faut toujours ouvrir l'écran Admin pour voir l'écart. *Une sonde qu'on doit aller consulter reste une sonde qu'on peut oublier de consulter*, et c'est le vrai chantier restant sur ce sujet. ⛔ **La purge du dossier Drive n'est pas traitée** : append-only, ~730 fichiers/an, l'avertissement de quota tombe à 1000 — *décision à prendre, pas une découverte à faire* (c'était déjà écrit le 31/08). ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests : **parcours 2904/2904** (+3), **calculs 339/339**, muscles 241/241, croisés 50/50, **dates 9/9**, données classées **0 trou**. ⭐⭐ **Le témoin qui porte la version ne mesure pas un libellé** — n'importe quelle reformulation future le referait vert : il mesure que **l'app SAIT VOIR une programmation manquante** (7 verts + 1 orange, et la phrase « 1 programmation sur 2 »). ⛔ **Et un contrôle l'empêche de dégénérer** : un état **complet** ne doit déclencher **aucune** alerte — *sinon « on signale un écart » serait vrai en signalant tout le temps.* ⚠️ **La fixture « ok » a dû être recalée** : elle rendait `triggersInstalled:1`, ce qui décrit aujourd'hui un état **dégradé** tout en s'appelant « ok » — *une fixture qui n'emploie plus le schéma de la production ne teste rien, elle rassure.* ⛔ **Contrôle négatif : 2 rouges sur 3** — ⚠️ **et je dis lequel ne mord pas** : « un état complet ne déclenche aucune alerte » est **vert des deux côtés**, c'est un **garde**, pas un détecteur. ⚠️ **`Code.js` modifié → le backend part en prod tout seul**, à vérifier des DEUX côtés (R18). Fichiers : `Code.js`, `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1145. |

**ft-v1144 — 🤝 MILO EST MIS AU COURANT QU'ON LE TESTE — CHEZ MICHEL SEUL — ET J'AVAIS RECOMMANDÉ L'INVERSE** — Michel, après que je lui aie déconseillé, chiffres à l'appui : *« non, je veux que Milo soit au courant qu'on fait des tests. J'ai voulu le construire pour qu'il soit une sorte de compagnon, s'il n'est pas au courant qu'on bosse sur lui c'est injuste »*.

**⛔⛔ MON OBJECTION ÉTAIT TECHNIQUE, SA RAISON EST PRODUIT — ET C'EST ELLE QUI TRANCHE.** J'avais écrit qu'un modèle qui se sait noté *« joue pour la note »* : on ne mesurerait plus son comportement, on mesurerait sa réaction à l'idée d'être évalué. **Michel a maintenu, et son argument n'est pas dans le même registre** : *on ne teste pas un compagnon dans son dos.* 👉 ***C'est sa décision, écrite ici AVEC SA RAISON pour que personne ne la « répare » dans six mois*** (**R30**).

**⭐⭐ ET CE QUI REND LA CHOSE SÛRE EST UNE MESURE, PAS UNE INTENTION — c'est le cœur de la version.** Mon objection tombe pour une raison vérifiable dans le code, pas pour une promesse : **`_vcApplyPersona` efface `S.email`** avant chaque scénario du banc d'essai, donc `_estSuperAdmin()` y rend **toujours `false`** et ***le banc ne PEUT PAS voir ce bloc***. Vérifié dans un vrai navigateur : le contexte d'une passe de banc est **identique octet pour octet** à celui d'un utilisateur lambda. 👉 **Le banc continue de mesurer un Milo qui ne sait rien** ; c'est seulement dans les conversations de Michel que Milo le sait. *L'objection n'a pas été écartée, elle a été mesurée — et la mesure la contredit.*

**⛔⛔ ET R34 NE PEUT PAS JUGER CE CHANGEMENT. Je le dis plutôt que de faire semblant.** La règle veut *« état A → banc → état B → banc → comparaison »*. Ici le rite est **aveugle par construction** : le banc ne verra jamais ce bloc, donc il rendra **exactement le même résultat** avant et après — un vert qui ne peut pas rougir. *Le présenter comme une validation serait un mensonge de méthode.* **Le seul juge possible est Michel, dans ses propres conversations.**

**⛔ ON DONNE LA NOTE, JAMAIS LE CORRIGÉ — et la frontière est nette.** `evalPasses` (la **date** et le **total** de la dernière passe) part ; **`evalHist` reste exclu** — lui dire *quels* scénarios ont rougi l'inviterait à travailler ces pièges-là, et **un banc dont on connaît les réponses ne mesure plus rien**. 👉 ***Savoir qu'on est noté n'est pas connaître les réponses.*** Un témoin vérifie qu'aucun identifiant `EV-…` ne traverse le bloc.

**⛔ DANS LA PARTIE PERSONNELLE, ET SURTOUT PAS PLUS HAUT — c'est une contrainte de COÛT, pas d'esthétique.** Le bloc porte une **date** et un **total qui changent**. Le bloc COMMUN est mis en cache **1 h**, et `worker.js` porte la mesure du 09/08 : *allonger un cache ne sert que si le contenu est **STABLE** ; s'il bouge, un TTL long **AGGRAVE*** (0,12 € → 0,43 €, mesuré). Ici le contenu est **stable pendant une conversation** (on ne lance pas une passe en discutant) et change **d'un jour à l'autre** : la fenêtre de 5 min du bloc personnel est exactement son rythme. Deux témoins l'épinglent — la place **et** la stabilité.

**⏪ ET LES PASSES D'AVANT LE JOURNAL SONT RÉCUPÉRÉES** (*« et récupère tous les benchmark »*) : reconstituées depuis `ft4_evalHist`, qui porte une **date** et un **verdict par scénario**. ⛔⛔ **MAIS LE DÉNOMINATEUR N'EST PAS LE MÊME, et c'est le seul vrai piège** : `_evHistEcrire` ne retient que `vert`/`rouge` et **jette les `muet`/`spec`**. Une ligne reconstituée compte donc les scénarios **ayant reçu un verdict**, pas les scénarios **joués**. 👉 ***Les afficher pareil ferait lire une progression là où seul le dénominateur a rétréci.*** D'où le marquage **« reconstituée »** à l'écran, expliqué juste dessous. ⛔ Et **une vraie passe gagne toujours** : on n'ajoute que des jours **strictement antérieurs** à la plus ancienne ligne réelle (une vraie ligne sait les sans-verdict et le ×2, elle est plus riche).

**⚠️⚠️ MON PREMIER JET N'ÉTAIT PAS IDEMPOTENT, ET C'EST LA SONDE QUI L'A ATTRAPÉ — pas un test écrit après coup.** Ma règle de non-recouvrement était *« rien à partir du jour de la plus ancienne ligne RÉELLE »*. Or **après une première reconstruction, toutes les lignes portent `x:1`** — donc plus aucune ligne réelle, donc la borne redevenait `null`, donc **chaque ouverture de l'écran rejouait tout et dupliquait**. 👉 ***La déduplication ne se déduit PAS de la borne*** : ce sont deux règles, elles sont écrites séparément. *Mesurer avant d'écrire le témoin a coûté 40 secondes et évité un défaut qui grossissait à chaque ouverture.*

**⚠️ ET UN TEXTE QUE J'AI ÉCRIT HIER EST DEVENU FAUX EN 24 h.** L'état vide de ft-v1141 disait *« les passes lancées avant n'y sont pas — on ne va pas leur inventer un total »*. **Depuis qu'on reconstitue, c'est faux** : un total **dérivé de vrais verdicts** n'est pas inventé. Corrigé, et **figé par un témoin** qui refuse le retour de la phrase (**R23**). ⛔ Un autre témoin de ft-v1141 a dû être corrigé aussi : il vidait **un seul** des deux magasins pour prouver l'état vide — il ne le prouve plus, l'écran reconstitue. *Un témoin qui mesure autre chose que ce que son nom annonce est pire qu'un témoin absent.*

**📣 RÈGLE D'OR #11 — RIEN, et c'est le même argument qu'en ft-v1141.** Rien ne change pour qui que ce soit d'autre : le bloc ne part que chez Michel, l'écran est derrière l'admin. Un point rouge ou une pop-up annonceraient à tout le monde une porte qu'ils ne verront jamais (**R19**/**R25**). L'explication vit **là où le bouton vit**, dans l'écran lui-même.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **Milo n'apprend rien de tout ça** — il ne garde aucune trace d'une conversation à l'autre sur ce sujet, c'est un fait qu'on lui redonne à chaque fois. ⛔ **Le détail par scénario reste hors de sa portée**, décision non rouverte. ⛔ **Les `muet`/`spec` des passes anciennes sont perdus pour toujours** : ils n'ont jamais été enregistrés, et on ne les invente pas. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests : **parcours 2901/2901** sur l'arbre **FUSIONNÉ** avec la ft-v1143 de session-B — *c'est lui qui part en ligne* (+18, bloc **CCXLIV**), **calculs 339/339**, muscles 241/241, croisés 50/50, **dates 9/9**, données classées **0 trou**. ⭐⭐ **Le témoin qui porte la version ne mesure pas la présence du bloc** — n'importe quelle version future le referait vert sans rien protéger (**§31** de `BUGS.md`) : il mesure que **`_vcApplyPersona` efface l'e-mail**, c'est-à-dire *le mécanisme qui rend la décision sûre*. Si quelqu'un retirait cette ligne, le banc se mettrait à mesurer autre chose **sans que rien ne plante**. ⛔ **Deux contrôles avant tout le reste** : les 4 fonctions doivent exister, **et Michel doit réellement recevoir le bloc** — *sans le second, « personne d'autre ne le reçoit » serait vrai le jour où le bloc n'existe plus du tout.* ⭐ **Et l'inventaire des données le confirme sans que je le déclare** : `tools/donnees.py` fait passer `evalPasses` de « n'atteint pas Milo » à « ✅ oui », **60 → 61 données transmises** — *un outil qui LIT le code, pas une case cochée à la main.* ⛔ **Contrôle négatif : **V1 — la porte `_estSuperAdmin()` retirée : 3 rouges**, exactement les trois qui gardent le « chez Michel seul » (une autre adresse · une adresse vide · le banc). **V2 — l'effacement de `S.email` retiré de `_vcApplyPersona` : 1 rouge, et c'est LE témoin qui porte la version** — le banc redevient super-admin (`superAdmin: true`, `present: true`). ⭐⭐ *C'est le contrôle le plus utile des trois : il prouve que le témoin mord sur le mécanisme, pas sur le décor.* **V3 — l'arbre ft-v1141 entier : 17 rouges sur 18** — ⚠️ **mais je dis ce qu'il vaut** : le bloc y meurt à la première fonction manquante, donc la plupart de ces rouges sont **collatéraux**, pas des détections indépendantes ; et le seul vert est *« aucune erreur JS »*, **un garde, pas un détecteur**.** Fichiers : `coach.js`, `tests/donnees/donnees-milo.json`, `tests/parcours/runner.js`, `docs/INVENTAIRE-DONNEES.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1144. |

⚠️⚠️ **29ᵉ COLLISION DE VERSION** : ma passe était verte à 2893/2893 quand session-B a publié **et déployé** sa ft-v1143 (run #933). **Le premier publié garde le numéro** — ma version devient **ft-v1144**, et mon bloc de témoins **CCXLIII devient CCXLIV** (la collision porte aussi sur l'identifiant, comme le 24/08). ⭐ *C'est structurel et la discipline n'y peut rien : toute version bump la même ligne de `sw.js`, et une passe complète dure plus longtemps que l'intervalle entre deux livraisons.* Fusion en gardant **les deux côtés** partout. sw.js **ft-v1144**.

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
