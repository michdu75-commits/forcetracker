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

> **Version actuelle : `ft-v1068`** (prochaine : `ft-v1069`). Historique complet (ft-v128→574 + gouvernance
> antérieure, **+ ft-v575→632 déménagées le 28/07**) → **`docs/JOURNAL-ARCHIVE.md`**. Le n° de cache se lit dans `sw.js` (`const CACHE='ft-vNN'`).
> **Entretien** : ajouter chaque nouvelle version ICI (règle d'or #12). Quand ce journal récent dépasse
> **20** entrées, déménager les plus anciennes dans `docs/JOURNAL-ARCHIVE.md` (couper/coller, rien
> supprimer). `python3 tools/check_regles.py` le signale automatiquement.
> ⚠️ **L'ARCHIVE S'AJOUTE, ELLE NE SE RÉÉCRIT JAMAIS** (leçon du 04/08 : un script d'archivage l'a
> **écrasée** — 297 entrées perdues, découvertes 2 jours plus tard **par hasard**, parce que rien ne
> la surveillait). Le même `check_regles.py` refuse désormais toute entrée disparue. **Toujours
> AJOUTER à la fin, jamais ouvrir le fichier en écriture**, et lire le diff avant de committer :
> un `-1793` dans le numstat n'est pas un détail.

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

**ft-v1070 — 🚶 LES PAS COMPTENT, SANS JAMAIS COMPTER DEUX FOIS** — Michel, en donnant le go : *« si on rajoute les pas ça rajoute forcément des calories dépensées dans la journée, et ça montre aussi l'activité en l'absence de données rentrées dans l'application. Exemple : on a marché 15 000 pas parce qu'on a fait une randonnée — à l'heure actuelle on ne peut pas le renseigner. **Attention il faut que ça soit cohérent** : la montre prend en compte aussi le nombre de pas si on fait du tapis à la salle, ou de la course, ou du vélo elliptique. »*

**⛔⛔ IL A NOMMÉ LE PIÈGE DE ft-v949 AVANT QUE JE LE TROUVE — ET IL EST PLUS LARGE QUE LE TAPIS.** Mesuré avant de concevoir : `calcTDEE = BMR × activityLevel + workExtra + sportExtra`, **aucun terme de séance** (ft-v949 l'a retiré, le multiplicateur s'appelant littéralement « Modéré (3-4j) »). Or il contient aussi **la marche ordinaire d'une journée normale**. 👉 ***Ajouter les pas BRUTS facturerait une deuxième fois la marche que le multiplicateur couvre déjà*** — le même défaut, sur une autre grandeur, et **tous les jours**.

**⭐⭐ D'OÙ LE SURPLUS SUR SA PROPRE BASE, ET C'EST LUI QUI RÉPOND AUX DEUX CAS D'UN SEUL COUP.** ① La **randonnée** ressort : 15 000 pas quand sa base est à 6 000 → **9 000 pas réellement non comptés**. ② Le **tapis** habituel est **DANS** sa base → surplus nul → rien n'est compté deux fois. ⭐ *Et c'est ce qui a fait écarter l'autre piste* — soustraire les pas des activités connues aurait demandé de deviner **combien de pas produit une séance de tapis**, question à laquelle personne ne sait répondre. *La base n'est pas une norme : c'est SA journée ordinaire à lui.*

**⭐ R13 — RIEN N'EST INVENTÉ** : c'est le motif de `_rhrEcart`, dix lignes plus haut dans le même fichier (médiane sur une fenêtre · minimum de jours avant de se prononcer · effet borné), et c'est la logique de `calcSportExtra`, qui refuse **déjà** le doublon à ≥ 1.725. ⛔ **Un seul propriétaire** (`_pasEcart`) lu par le **TDEE**, l'**écran Nutrition** et **Milo** (**R2**) — trois calculs séparés finiraient par annoncer trois dépenses différentes du même jour.

**⛔ QUATRE GARDE-FOUS, ET CHACUN A SA RAISON.** ① **7 jours minimum** — sans base connue, il n'y a pas de « en plus » : un surplus calculé sur deux jours est du bruit présenté comme un signal (**R29**). ② **Seuil de 1 500 pas** — une variation quotidienne normale n'est pas une information (**R12**). ③ **Une journée SOUS sa base ne se défalque pas** : le multiplicateur est une moyenne, il absorbe déjà les jours creux — retrancher reviendrait à **faire baisser une cible alimentaire un jour de repos**. ④ **Borné à 500 kcal** : un GPS qui déraille ou un trajet compté en pas ne doit pas faire exploser des macros. *Le coût de l'erreur porte sur ce que la personne mange.*

**⭐⭐ ET LE CONTRÔLE NÉGATIF CHIFFRE SON PIÈGE, ce qui vaut mieux que de le décrire** : avec les pas bruts, une journée **ordinaire** à 6 100 pas ajoutait **197 kcal qui n'existent pas** — et un jour de rando montait à 485 au lieu de 288. **Trois témoins rougissent** dans cette configuration, dont le ① qui porte exactement sa contrainte.

**⭐ LE 2ᵉ USAGE EST CELUI QUE JE N'AURAIS PAS TROUVÉ SEUL** — *« ça montre l'activité en l'absence de données rentrées »*. Sans ça, une journée entière d'effort est **invisible pour Milo**, qui la lit comme un jour de repos et peut proposer une grosse séance le lendemain (**R4**). ⛔ Mais il reçoit le **surplus**, jamais le total, **et le cadre qui va avec** : *« tu ne sais PAS de quoi il s'agit — des pas ne disent pas ce qui a été fait »*. Sans cette phrase, un modèle affirme « ta randonnée » alors qu'il n'en sait rien.

**⚠️ ET LA MOITIÉ QUI MANQUE EST ÉCRITE PLUTÔT QUE COMBLÉE** : on **voit** la dépense, on ne peut toujours pas **enregistrer** la sortie — vérifié, le cardio est accroché à `S.wkt`, il n'existe aucune entrée autonome. C'est dans `IDEES-FUTURES.md`, avec l'avertissement qui va avec : ça demandera de décider comment ça se combine au surplus, sinon on recompte une 3ᵉ fois ce qu'on vient d'apprendre à ne pas compter deux fois.

**⚠️ ET UNE CAPTURE FAUSSE M'A FAIT DOUTER DU CODE** : mon écran de contrôle affichait **BMR 0** et un TDEE réduit au seul surplus. La cause n'était pas le calcul — ma fixture posait `ft4_height` alors que l'app lit **`ft4_ht`**. *Une fixture qui ne parle pas la langue de l'app ne mesure pas l'app* — la même famille que la fixture `concat` de ft-v1069, deux fois dans la journée.

**📣 RÈGLE D'OR #11 — LES CINQ POINTS, ET LA POP-UP EST MÉRITÉE.** Ce n'est pas un bouton qui apparaît : c'est **un chiffre sur lequel la personne AGIT** — ses calories du jour — qui peut désormais bouger. `WHATS_NEW` **v65** · point rouge `pas-surplus` sur l'onglet Nutrition · aide `?` de Nutrition **en tête** (c'est la question qu'on se pose en voyant le chiffre changer) · aide détaillée · **diapo du Guide sans image exprès** (une capture montrerait les pas de quelqu'un d'autre, donc une dépense qui n'est pas la sienne). ⛔ **Les 5 points sont MESURÉS par un témoin**, pas affirmés — la leçon de ft-v1060.
Tests : **parcours 1992/1992** (+9, bloc **CLXXV**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⭐⭐ **Le témoin ① est celui qui porte sa contrainte** : une journée ordinaire n'ajoute **rien**. ⭐⭐ **Et le ② est celui qui l'empêche d'être vert en ne comptant jamais rien** : la rando ressort bien à ~290 kcal. ⛔ **Le ③ protège R2** : le TDEE monte **exactement** du surplus, pas d'autre chose. **CONTRÔLE NÉGATIF : deux essais ciblés** — pas bruts → **①②③⑤ rouges** avec les 197 kcal fantômes imprimés ; borne des 7 jours retirée → **④ rouge**. ⭐ **Vérifié à l'écran** : la ligne verte *« 🚶 +291 kcal · 9 000 pas de plus que d'habitude »* sous un TDEE de 2 954, **0 erreur JS**, 🔴 **bouton central `[139, 792, 56, 44]`**. Fichiers : `tracking.js`, `state.js`, `screens.js`, `coach.js`, `index.html`, `constants.js`, `app.js`, `tests/parcours/runner.js`, `IDEES-FUTURES.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1070. |

**ft-v1069 — 😴 LE SOMMEIL MESURÉ ATTEINT ENFIN LE SCORE ET MILO** — Michel, en voyant la liste de ce qui restait : *« ah oui les pas et le sommeil ça c'est hyper important »*.

**⛔⛔ LE DÉFAUT ÉTAIT MESURÉ ET ÉCRIT DEPUIS ONZE JOURS — DANS `Code.js`, PAR NOUS.** La saisie manuelle est bonne **en moyenne** (+12 min sur 10 semaines) mais elle **aplatit les mauvaises semaines** : corrélation sommeil réel / erreur de saisie **r = −0,96**. Du 6 au 12 août, Garmin disait **5 h 38**, l'app **6 h 43**. 👉 ***Or `S.sleepLog` est LA BASE du score de récup ET part chez Milo : le score et le coach étaient donc les plus optimistes exactement les semaines où la fatigue comptait le plus.*** Et la donnée qui corrige ça arrivait **depuis ft-v916** — `{date, rhr, sleep, steps}` — sans que rien ne la lise : **seul `rhr` était exploité**. ⚠️⚠️ **CORRECTION DU 30/08 AU SOIR, ET ELLE EST DE TAILLE.** J'ai écrit que *« la donnée arrivait depuis ft-v916 et rien ne la lisait »*. **C'est FAUX**, et c'est Michel qui l'a dit : *« mais on n'a pas fait le raccourci des pas ni le sommeil »*. Ce qui est vrai : le **serveur ACCEPTE** `sleep` et `steps` depuis ft-v916 (`handlePushHealth_`). Ce qui est faux : **rien ne les a jamais envoyés** — son raccourci iOS ne pousse que la **FC au repos**. 👉 ***Ce n'était donc pas une donnée qui dormait, c'était un TUYAU JAMAIS BRANCHÉ*** — et j'ai bâti trois versions (ft-v1069, 1070, 1071) sur une donnée qui n'est jamais arrivée. ⛔ **Le code reste juste et testé**, il est simplement **DORMANT** tant que le raccourci n'envoie pas les deux champs. *Une vérification que je n'ai pas faite : j'ai lu que le serveur acceptait, et j'en ai déduit que ça arrivait* — c'est **R28** appliqué à l'envers, une capacité prise pour un fait. La recette du raccourci est dans `A-FAIRE-SUR-PC.md`. C'est **R5** dans sa forme la plus pure, et il a fallu que Michel relise une liste pour qu'on la rouvre.

**⭐⭐ SA DÉCISION, ET ELLE A DEUX MOITIÉS** : *« la montre gagne, ET l'app le dit »*. La première est **R32** (mesuré > estimé > déclaré). La seconde n'est pas cosmétique : *un chiffre qu'on a donné soi-même et qui change tout seul, sans un mot, se lit comme une perte de données* — pas comme une correction.

**⛔ LA MESURE NE GAGNE QUE SUR LA DURÉE.** La montre sait combien de temps tu as dormi ; **elle ne sait pas comment tu t'es senti**. La qualité reste donc toujours celle que la personne a donnée, jamais dérivée d'une mesure — et un seul propriétaire répond à *« qu'est-ce qu'on sait de cette nuit-là ? »* (`_nuit`/`_nuitsRecentes`, **R2**), lu par le score, les tuiles, la carte, le registre **et** Milo. *Cinq lecteurs qui liraient chacun sa source finiraient par afficher deux durées pour la même nuit.*

**⛔⛔ ET LE PIÈGE QUI M'ATTENDAIT ÉTAIT DANS LE BARÈME, TROUVÉ EN LE LISANT AVANT D'ÉCRIRE.** Le scoreur faisait `e.quality||2` : une qualité **inconnue** valait silencieusement « Moyen », soit **45/100 sur un axe qui pèse 40 %**. Injecter des nuits mesurées sans qualité aurait donc **FAIT BAISSER le score de quelqu'un qui a bien dormi** — dans la version censée le rendre juste. **Chiffré par le contrôle négatif : 8 h mesurées tombaient à 72 au lieu de 90+, treize points perdus pour rien.** 👉 Une nuit sans qualité connue est notée **sur sa seule durée** : *on ne remplace pas une inconnue par une moyenne, c'est un fait inventé* (**R29**). ⛔ Et ça ne change **rien** à l'existant — vérifié, pas supposé : les deux seuls écrivains de `sleepLog` posent **toujours** une qualité.

**⚠️ UN DÉFAUT QUE JE CRÉAIS MOI-MÊME, ATTRAPÉ EN CHERCHANT LES JUMELLES (R8)** : `ciPickSleep` écrit `hours || 7.5` quand on ne répond qu'à la question de **qualité** du check-in. Inoffensif tant qu'il n'y avait rien d'autre — franchement nuisible dès qu'une mesure existe, puisque l'app aurait alors affiché *« tu avais noté 7,5 h »* en face de la montre : ***un écart entièrement fabriqué par un chiffre que personne n'a donné***. L'ordre est maintenant : ce qu'elle a saisi · sinon la mesure · sinon seulement 7,5.

**⭐⭐ R4a A FAIT SON TRAVAIL** : `healthDaily` était classée **exclue**, et cette exclusion ne portait en réalité que sur `rhr`. Reclassée **transmise**, ⛔ mais la nuance vit désormais **dans le code**, à côté de ce qu'elle protège (**R27**) : `sleep` part · **`rhr` reste dehors** (son effet atteint déjà Milo par le score — R2 — et une fréquence cardiaque est un chiffre à consonance **médicale** qu'il interpréterait) · `steps` **pas encore**, parce que rien ne les lit et qu'une donnée sans comportement observable n'a rien à faire dans le contexte (**R3**).

**⛔ L'ÉCART EST DIT À MILO, PAS SEULEMENT LA BONNE VALEUR.** Corriger le chiffre en silence réglerait le calcul et **perdrait l'information la plus utile** : *cette personne se croit plus reposée qu'elle ne l'est*. Encadré comme un **fait**, avec l'interdiction explicite d'en faire un reproche ou de le répéter — sans cette consigne, un modèle en fait vite une leçon de morale.

**⚠️ ET LA CAPTURE A CORRIGÉ CE QU'AUCUNE MESURE DE CHAÎNE NE VOIT** : l'écran annonçait *« l'écart est de **−65 min** »*. La chaîne était **parfaitement correcte** ; c'est sa **lecture** qui ne l'était pas — il faut décoder une convention (mesuré moins déclaré) pour comprendre le signe. Devenu *« tu as dormi 65 min de MOINS que ce que tu avais noté »* (règle d'or **#10**).

**🚶 LES PAS NE SONT PAS DANS CETTE VERSION, ET C'EST VOULU.** Michel a donné leurs **deux usages** et surtout **la contrainte qui décide de tout** : *« attention il faut que ça soit cohérent — la montre compte aussi les pas si on fait du tapis, de la course ou du vélo elliptique »*. ⭐⭐ ***Il a nommé le piège de ft-v949 avant que je le trouve*** : une séance de tapis déjà enregistrée produit aussi des pas, donc ajouter naïvement leurs calories la compterait **deux fois**. Son 2ᵉ usage est celui qu'on n'aurait pas trouvé seul : *« ça montre l'activité en l'absence de données rentrées — on a marché 15 000 pas parce qu'on a fait une randonnée, aujourd'hui on ne peut pas le renseigner »*. Tout est écrit **mot pour mot** dans `IDEES-FUTURES.md` (R27). ⛔ **Une chose à la fois, testée avant la suivante** — c'est la règle d'ordre de travail de ce fichier.

**⚠️⚠️ ET UN TÉMOIN DE ft-v1017 A ROUGI — SUR DU CODE CORRECT, ET SA FIXTURE EST LA COUPABLE.** Le témoin *« une nuit notée après coup compte bien pour aujourd'hui »* est tombé. ⛔ **Mesuré des deux façons AVANT de toucher à quoi que ce soit**, parce qu'un témoin rouge n'a pas toujours raison mais ne se désarme jamais : sa fixture faisait un **`concat`**, donc **deux entrées pour la même nuit** — un geste dont l'app est **incapable** (ses deux écrivains font `findIndex` puis **remplacent**). Tant que le scoreur prenait les 3 premières lignes du **tableau brut**, le doublon passait dans la moyenne et le témoin était vert. Depuis que les nuits sont dédoublonnées **par date**, la 2ᵉ ligne est ignorée. 👉 ***Une fixture qui écrit d'une façon dont l'app est incapable ne teste pas l'app.*** Chiffré : en doublon **76 → 76** (rien ne bouge), en remplacement **76 → 57**. **La règle testée était intacte** ; c'est le geste d'écriture qui ne l'était pas.

**⭐⭐ ET LE ROUGE A PRODUIT UNE GARANTIE QUI N'EXISTAIT PAS.** Le dédoublonnage était un **effet de bord** de ma réécriture — pas une décision. Or il corrige un vrai défaut latent : deux lignes pour la même nuit la comptaient **deux fois** dans une moyenne de **trois**, et **faisaient disparaître la 3ᵉ nuit**. Ça n'arrive pas dans l'app, mais un **restore cloud** écrit `S.sleepLog` en bloc sans aucun garde-fou. *Autant que ce soit vrai par construction plutôt que par chance* : un témoin le fige (4 lignes dont un doublon → même score que 3 lignes saines). ⛔ **Un effet de bord non nommé redevient un bug** (R30) — celui-ci est devenu une garantie testée.

**📣 RÈGLE D'OR #11 — LES CINQ POINTS, ET LA POP-UP EST MÉRITÉE.** C'est le cas *« un repère a bougé »* à l'état pur : le nombre d'heures de l'Accueil peut désormais **différer de celui qu'on a tapé**, et le score bouge avec. `WHATS_NEW` **v64** · point rouge `sommeil-mesure` sur l'Accueil · **aide `?` et diapo du Guide ENRICHIES, pas doublées** (une entrée sommeil existait — en écrire une seconde à côté aurait été le doublon que ce projet refuse, **R2/R25**).
Tests : **parcours 1983/1983** (+14 : bloc **CLXXIV** avec 13 témoins, +1 dans CXXIV), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, **données 106 classées 0 trou** (61 transmises · 45 exclues). ⭐⭐ **La fixture EST son cas réel** — 6,72 h notées contre 5,63 h mesurées : une fixture inventée aurait rendu ces témoins verts sans rien dire de sa semaine. ⛔ **Le témoin ① existe pour que les neuf autres mesurent quelque chose** : sans un vrai écart entre les deux sources, tout le bloc comparerait deux fois le même chiffre. **CONTRÔLE NÉGATIF : deux essais ciblés, et le second chiffre le piège évité.** ① la saisie remise en priorité → **①②⑦⑧⑨ rouges**, et ② imprime `avec mesure = 70 · sans = 70`, c'est-à-dire *la mesure ne change rien* ; ② le « Moyen » inventé remis → **④ rouge**, `score 8 h mesurées = 72` au lieu de ≥85. ⚠️ **Et un de mes témoins restait vert à tort** : ⑧ cherchait « 6,72 » n'importe où dans la carte, donc il passait quand ce 6,72 était devenu le chiffre **principal**. Re-visé sur l'**ordre** (5,63 devant, 6,72 derrière « tu avais noté ») — *un témoin qui cherche une valeur sans dire OÙ ne mesure pas ce qu'il croit*. ⭐ **Vérifié à l'écran** (2 captures : la tuile à 5,63 h, le détail du score qui nomme la montre), **0 erreur JS**, 🔴 **bouton central `[139, 792, 56, 44]`**. Fichiers : `tracking.js`, `coach.js`, `screens.js`, `constants.js`, `app.js`, `tests/donnees/donnees-milo.json`, `tests/parcours/runner.js`, `IDEES-FUTURES.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1069. |

**ft-v1068 — ⚖️ UN SEUL PROPRIÉTAIRE DE « COMBIEN J'EN AI PRIS ? »** — Michel, après une journée à trouver le même défaut sur des écrans différents : *« que ce soit le code-barres, manuel, avec l'IA ou avec l'étiquette, il faut qu'il y ait une **cohérence** quand on change la dose, peu importe le produit — même s'il faut qu'on crée un algorithme exprès »*.

**⭐⭐ L'ALGORITHME EXISTAIT DÉJÀ — QUATRE FOIS, ET C'EST EXACTEMENT LE PROBLÈME.** `valeurs = base × (saisie / référence)`. 👉 ***Un pour-100 g n'est pas un autre calcul : c'est CE calcul avec une référence de 100.*** Quatre écritures de la même formule, sur deux écrans, dont les comportements ont divergé **sans que personne ne le décide**. Mesuré avant d'y toucher : **6 fonctions de rescale, 6 champs de saisie, 3 états** pour une seule question.

**⛔⛔ LE MÊME GESTE DONNAIT TROIS RÉSULTATS — vider le champ de quantité :**

| route | avant | après |
|---|---|---|
| pour-100 g · ajout (code-barres, étiquette) | les 4 valeurs à **zéro** | référence |
| pour-100 g · modifier | **zéro**, et le contrôle de cohérence ne se rafraîchissait même pas | référence |
| proportion · ajout (IA, poids déclaré) | référence *(corrigé en ft-v1061)* | référence |
| proportion · modifier | **valeurs orphelines** | référence |

***Zéro est un mensonge — personne n'a mangé zéro — et une valeur orpheline en est un autre.*** ⚠️ **Et la ligne « proportion · modifier » est la jumelle de ft-v1061, encore vivante ce soir** : **4ᵉ fois de la journée** qu'un correctif était posé d'un seul côté (R8). Cette fois elle n'a pas été trouvée par Michel — elle est sortie de la mesure.

**⛔ ET LA VIRGULE D'ELINE MANQUAIT ENCORE UNE ROUTE.** `af-bc-grams` était le **seul** champ de quantité resté en `type="number"` — donc le seul à jeter *« 62,5 »*. C'est la route du **code-barres et de l'étiquette**, c'est-à-dire la plus fiable, et ft-v1057 l'avait manquée : son témoin refusait `inputmode="decimal"` sur un `type="number"`, or celui-ci était en `inputmode="numeric"` et passait à travers.

**⛔⛔ ET LE TÉMOIN DE ft-v966 M'A RATTRAPÉ EN PLEINE UNIFICATION**, sur une nuance qui vaut la version : mon repli faisait annoncer *« → pour tes 100 g »* au-dessus d'un champ **vide**. 👉 ***Les VALEURS se replient sur la référence — elles doivent bien correspondre à quelque chose, et « 100 g » est écrit juste au-dessus — mais la PHRASE, qui dit « pour TES n g », se tait.*** Annoncer un total pour une quantité que personne n'a tapée, c'est le voisinage muet retourné dans l'autre sens.

**⭐ CE QUE LE BLOC DE TÉMOINS VÉRIFIE N'EST PAS UN CHIFFRE, C'EST UNE ÉGALITÉ DE COMPORTEMENT.** Un témoin qui figerait *« 243 kcal »* deviendrait faux au premier changement de fixture ; celui-ci reste vrai — et c'est lui qui empêche les 4 routes de re-diverger. ⛔ Le repli est vérifié comme étant **la référence de chaque route** (100 g pour un pour-100 g, la dose déclarée sinon), jamais un nombre magique commun.

**⚠️ UNE DIFFÉRENCE SUBSISTE, ET ELLE EST LÉGITIME** : à 62,5 g, la route code-barres rend **243** kcal et la route proportion **244**. Ce n'est pas une incohérence — la première part du pour-100 g **exact** (388,5), la seconde des valeurs **arrondies** que la personne voit (117 pour 30 g). *La route du code-barres est simplement plus précise, et c'est un argument de plus pour elle.*

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Rien n'apparaît, rien ne bouge : des comportements qui différaient deviennent identiques. Il n'y a rien à apprendre — c'est précisément le but.
Tests : **parcours 1948/1948** (+6, bloc **CLXXII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⭐ **Le premier témoin est celui qui empêche les autres d'être verts sur du vide** : les 4 routes rendent bien des valeurs de départ non nulles. Fichiers : `app.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1068. |

**ft-v1067 — 🗂️ LE HAUT DE PROGRÈS : LES ONGLETS EN TÊTE, LES CARTES REPLIABLES** — Michel, capture à l'appui : *« ça prend vachement d'espace en haut non ? »*.

**⭐ LA MESURE AVANT, ET ELLE DONNE RAISON À SA CAPTURE.** Synthèse **216 px** + volume **345 px** (8 muscles) = **561 px**. Les sous-onglets tombaient à **y=699** sur un écran de 844, et le champ de recherche à **821 — au ras du bord**. 👉 ***Sur l'onglet Exercices, sa progression commençait hors écran.***

**⭐⭐ DEUX RAISONS, ET LA SECONDE EST DE FOND.** ① Les onglets sont de la **navigation** : elle doit être atteignable sans défiler — il fallait scroller pour aller sur Poids. ② Depuis ft-v1065, ces deux cartes n'appartiennent **qu'à** l'onglet Exercices : leur place est **dans son contenu**, pas au-dessus de la barre qui sert à en sortir. *La correction d'hier rendait celle-ci nécessaire.*

**⭐ APRÈS** : onglets **y=118**, les deux cartes repliées tiennent en **132 px**, « PROGRESSION » à **347** et la recherche à **392**. Tout l'onglet tient dans un écran. **Michel a choisi cette forme entre trois** (replier seulement · remonter les onglets seulement · les deux).

**⛔ L'ÉTAT EST RETENU, et c'est ce qui distingue un repli utile d'un repli qui enterre.** *Un accordéon qu'on doit rouvrir à chaque visite est un accordéon qu'on n'ouvre plus* — la leçon de **ft-v1024** (*« le rangement suit l'usage »*). Une seule clé pour les deux (`ft4_progAcc`) : c'est un réglage d'affichage, pas une donnée de la personne (**R2**). Et jamais bloquant : un stockage refusé laisse simplement les cartes repliées.

**⛔ ON MASQUE, ON NE VIDE NI NE RECALCULE** (R19/R2) : le contenu est peint une fois par `renderProgress`, et un témoin vérifie qu'il est **déjà là sous le repli**.

**⛔ R13 — ZÉRO LIGNE DE CSS AJOUTÉE.** On réutilise `details.acc`, le motif d'accordéon déjà employé dans l'onglet Macros ; la seule règle écrite **neutralise** l'encadré intérieur, elle n'en crée pas.

**⚠️ LE TITRE ÉTAIT DOUBLÉ — TROUVÉ À LA CAPTURE, INVISIBLE À TOUTE MESURE.** Le résumé de l'accordéon disait *« Ce que ton histoire montre »*, et la carte à l'intérieur le répétait, dans un second cadre emboîté. Aucun test ne pouvait le voir : le texte était *correct*, c'est sa **duplication à l'écran** qui ne l'était pas. Les deux fonctions de rendu ne peignent plus leur propre titre.

**⚠️ ET LE LISERÉ DE ft-v1047 EST RETIRÉ, AVEC SA RAISON (R30).** Il existait pour **distinguer deux cartes grises identiques** empilées sans titre propre. Chacune a maintenant son accordéon titré : la distinction est plus forte et vient d'ailleurs — le liseré n'était plus qu'un trait orphelin dans un cadre. *On ne garde pas un repère visuel dont la raison a disparu.* Son témoin est **re-visé sur la garantie** (les deux sections restent distinguables), pas supprimé.

**⚠️⚠️ HUIT TÉMOINS EXISTANTS ONT ROUGI, ET AUCUN NE SIGNALAIT UN DÉFAUT — trois causes, toutes instructives.** ① Ils lisaient `innerText` sur une carte désormais **repliée** : `innerText` respecte le rendu et rend une chaîne **vide** (3ᵉ fois cette semaine). ② Ils testaient `style.display` sur le `div` intérieur, alors que le masquage porte maintenant sur le `<details>` parent → re-visés sur `offsetParent`, c'est-à-dire sur **ce qu'on voit**, pas sur l'élément qui porte le `display:none`. ③ Et l'un des miens, d'hier, mesurait *« les onglets remontent sur Poids »* — ils ne bougent plus, puisqu'ils sont en tête partout. *Un témoin qui mesure un MOUVEMENT se périme quand le mouvement disparaît ; il fallait qu'il mesure le RÉSULTAT (le contenu commence en haut).*

**📣 RÈGLE D'OR #11 — les points 2 à 5, et PAS de pop-up.** Point rouge `progres-repli` sur l'onglet Progrès · aide `?` · aide détaillée · diapo du Guide **sans image exprès** (une capture montrerait l'historique de quelqu'un d'autre). ⛔ **La pop-up ne se mérite pas** : rien à faire, et le repère n'est pas perdu — les deux titres restent à l'écran, à un tap de leur contenu.
Tests : **parcours 1945/1945** (+6, bloc **CLXXIII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⛔ **Le témoin ① existe pour que les cinq autres mesurent quelque chose** : la carte volume doit être **pleine** (8 lignes) dans la fixture — sinon on mesurerait un écran plus court que le sien (famille **§24**). ⭐⭐ **Le ⑥ est celui qui compte le plus** : déplier est **retenu** et **survit à un re-rendu complet** — sans lui, le repli enterrerait les deux cartes. ⭐ **Vérifié à l'écran** (2 captures : repliées et dépliées), **0 erreur JS**, 🔴 **bouton central `[139, 792, 56, 44]`**. Fichiers : `index.html`, `setup.js`, `style.css`, `constants.js`, `screens.js`, `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1067. |

**ft-v1066 — 0️⃣ UN PROXY COMMODE QUI DEVIENT FAUX QUAND UNE VALEUR VAUT ZÉRO** — Michel : *« même quand je mets zéro il marque déjà 5 g de prot »*.

**⚠️⚠️ ET LE CAS QU'IL DÉCRIT N'A PAS ÉTÉ REPRODUIT — c'est écrit plutôt que comblé.** Mesuré sur les deux écrans, six chemins : un **0 posé à la main TIENT**. Il survit à un changement de quantité (les calories passent bien de 156 à 208 à côté, donc le témoin mesure quelque chose), il survit à la déclaration d'un poids, et il **s'enregistre à 0**. *Je ne sais pas encore d'où viennent ses 5 g, et l'inventer serait pire que de le dire.* ⭐ **Trois témoins figent quand même ce comportement** : le jour où un « recalcul » viendra réécrire un zéro en silence, la livraison rougira.

**⛔⛔ MAIS LA MESURE A TROUVÉ AUTRE CHOSE, ET C'EST RÉEL.** Le garde du bloc quantité testait `base.kcal>0` : mettre les **calories** à 0 faisait **disparaître tout le réglage de quantité** — alors que 35 g de protéines restaient à l'écran, parfaitement rescalables. 👉 ***Un proxy commode — les calories pour dire « il y a des valeurs » — devient faux dès qu'une valeur légitime vaut zéro.***

**⛔ ET ÇA TOUCHE DEUX SITUATIONS ORDINAIRES, PAS UN CAS DE BORD** : ① un aliment à **0 kcal** (boisson zéro, édulcorant) ou dont on ne connaît que les protéines ; ② **la frappe elle-même** — on efface les calories pour les retaper, et le réglage de quantité s'évapore sous les doigts au milieu de la saisie. *Le second est le plus fréquent, et le plus déroutant : rien n'explique la disparition.* Le garde regarde désormais **les quatre valeurs**.

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Un réglage cesse de disparaître : rien n'apparaît, rien à apprendre.
Tests : **parcours 1952/1952** (+3, dans le bloc **CLXXI**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⛔ **Le témoin du milieu est celui qui empêche les deux autres d'être verts pour rien** : il vérifie que le rescale a bien eu lieu à côté du zéro (156 → 208). Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1066. |

**ft-v1065 — 📊 LES CARTES D'ENTRAÎNEMENT NE S'AFFICHENT QUE SUR « EXERCICES »** — Michel, vidéo à l'appui : *« le haut de l'onglet exercice où l'on montre les séances moyennes de la semaine, mais sur le poids et le record on s'en fout un peu de ça non ? »*, puis, pendant que je mesurais : *« même les badges »*.

**⭐⭐ IL A RAISON, ET LA RAISON EST DE FOND.** *« Ce que ton histoire montre »* et *« Ce que tu travailles, par semaine »* parlent d'**entraînement**. Sur **Poids** (une pesée) et sur **Badges** (des récompenses), elles ne répondent à **aucune question qu'on vient y poser** — elles ne font que repousser le contenu hors de l'écran. Sur sa vidéo, l'onglet Poids est **entièrement** occupé par les deux cartes : sa pesée du jour est au ras du bas.

**⭐ LE COÛT EST CHIFFRÉ, PAS RESSENTI** : les deux cartes pèsent **216 + 191 = 407 px**. Sur Poids, les sous-onglets remontent de **y=545 à y=118** — **427 px rendus à l'écran** — et la pesée du jour passe de ~600 à **170**. Tout l'onglet tient désormais dans un écran.

**⚠️⚠️ ET C'EST UN RETOUR SUR MA PROPRE DÉCISION, AVEC UN TÉMOIN QUI LA FIGEAIT.** ft-v1041 disait noir sur blanc *« elle SURVIT au changement de sous-onglet »*, et j'avais posé un témoin dessus. L'**intention** était bonne — ne pas la faire clignoter quand on change d'onglet — mais sa **portée** était trop large : ***« ne pas clignoter » ne veut pas dire « être partout »***. 👉 *Un témoin qui fige une décision trop large la rend permanente.* Il est **re-visé, pas désarmé** : il vérifie maintenant qu'elle est **masquée** hors d'Exercices **et** qu'elle **revient intacte** — c'est ça, la garantie qui comptait vraiment.

**⛔ ON MASQUE, ON NE VIDE NI NE RECALCULE.** Le contenu est déjà peint par `renderProgress` ; le refabriquer à chaque bascule coûterait pour rien (**R19**), et le vider ferait perdre la garantie ci-dessus.

**⚠️ ET LA DOC M'A FAIT ÉCRIRE UN BUG PENDANT QUE JE MESURAIS.** Ma capture de contrôle affichait *« undefined »* dans le champ de pesée. Cause : `CLAUDE.md` documente `S.weightLog // [{date, bw}]` depuis toujours — **l'app écrit `kg` partout** (`tracking.js`, l'import de pesées, la restauration). ***Un document d'état faux ne se contente pas d'être inutile : il fabrique des erreurs chez celui qui le lit*** (**R23**). Ligne corrigée, avec la raison.

**⚠️ ET UN DE MES PROPRES TÉMOINS A ROUGI SUR DU CODE CORRECT** : il prenait sa référence avec `innerText` **pendant que la carte était masquée** — or `innerText` respecte le rendu et renvoie une chaîne **vide**. Il comparait donc « rien » à « quelque chose ». C'est le piège de **ft-v1046**, retrouvé par un autre chemin : la référence se prend maintenant *pendant que la carte est visible*, avec `textContent`.

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Rien de neuf, rien à apprendre : deux cartes cessent de s'afficher là où elles n'avaient rien à faire. ⚠️ **Et les aides ne mentent pas** : elles disent *« en haut de l'onglet Progrès »* — ce qui reste vrai, l'onglet Exercices étant celui qui s'ouvre par défaut.
Tests : **parcours 1939/1939** (+4, bloc **CLXXII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⛔ **Le témoin ① existe pour que les trois autres mesurent quelque chose** : sans les deux cartes rendues sur Exercices (38 séances dans la fixture — la leçon de la famille §24), *« masquée sur Poids »* serait vrai pour la mauvaise raison. ⭐ **Le ④ garde ce que l'ancienne décision protégeait** : elles reviennent **avec le même contenu**, pas recalculées. ⚠️ **7ᵉ collision de la semaine** : session-A a pris CLXX, CLXXI **et** ft-v1063/1064 pendant ce travail — ma version devient **ft-v1065**, mon bloc **CLXXII**. ⚠️ **Et l'accolade fermante de leur bloc a encore été avalée par la fusion — 4ᵉ fois aujourd'hui** : seul `node --check` le voit, le runner ne démarre plus. *Vérifier que le runner DÉMARRE fait partie de la fusion.* Fichiers : `setup.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1065. |

**ft-v1064 — ⚖️ LE CHOIX D'UNITÉ DANS « MODIFIER L'ALIMENT » — LE MÊME CORRECTIF, L'AUTRE ÉCRAN** — Michel, capture à l'appui : *« quand j'ajoute il ne me donne que le choix de la quantité »*. Son écran de modification n'offrait que des multiplicateurs (½ · 1 · 1½ · 2 · 3) et un cul-de-sac : *« Cette ligne n'a pas de quantité connue — on ne peut pas inventer un poids. Mets la quantité dans le nom. »*

**⛔⛔ CETTE PHRASE EST, À DEUX MOTS PRÈS, CELLE QUE ft-v1056 A SUPPRIMÉE DE L'ÉCRAN D'AJOUT.** Même refus, même argument, **l'autre écran** — et le correctif avait été posé **d'un seul côté** (**R8**, la jumelle). 👉 ***Demander à quelqu'un de réécrire le NOM de son aliment pour pouvoir en changer le poids, c'est lui faire faire le travail de l'app.*** ⚠️ **C'est la troisième fois de la journée que ce motif revient** — ft-v1061 (`_provFood`), ft-v1063 (le moment dans la signature), et maintenant celui-ci. *La leçon n'est pas « corriger mieux », c'est **chercher la jumelle avant de livrer**.*

**⭐ R13 — RIEN N'EST RÉINVENTÉ** : c'est `_afMajAncre` transposé. Deux onglets, **un seul champ actif à la fois** (la quantité garde un propriétaire, R2), et une fois le poids déclaré on retombe **exactement** sur le champ proportionnel qui existait déjà ici depuis ft-v972. Le bloc quantité devient re-rendable tout seul (`#ef-qty-row`) au lieu d'être figé dans la construction de la modale.

**⭐⭐ ET R4 EST LA MOITIÉ QUI MANQUAIT DEPUIS ft-v972.** Le poids déclaré **descend jusqu'à la donnée** (`q`/`u`). Sans ça, la personne le donne, les 4 valeurs se recalculent à l'écran… **et rien n'est retenu** : à la réouverture l'app redemande, et le cul-de-sac revient. Mesuré de bout en bout : après enregistrement, rouvrir l'entrée affiche **40** dans le champ, et plus aucun message de refus.

**⛔ DÉCLARER N'EST PAS RESCALER**, et c'est ce qui rend l'écran juste : dire *« ce que j'ai noté pèse 30 g »* ne change pas ce qui a été mangé — ça dit **à quoi correspondent** les 156 kcal affichées. Mesuré : les 4 valeurs **ne bougent pas** à la déclaration, et ne doublent qu'en passant à 40 g. ⛔ **Et le champ est VIDE, pas pré-rempli à 100** : *un chiffre qu'on n'a pas choisi et qui s'enregistre est un chiffre faux présenté comme un fait* (**R29**).

**⛔ LA LEÇON DE ft-v1061 EST APPLIQUÉE DÈS L'ÉCRITURE** : `base` vient de **l'entrée enregistrée**, jamais de l'écran. Relire des champs déjà rescalés ferait de la référence une valeur dérivée d'elle-même — le défaut corrigé trois versions plus tôt, qu'on ne réintroduit pas dans le code neuf.

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Un refus disparaît et deux onglets apparaissent là où il était : rien ne se déplace, rien de nouveau à apprendre — c'est le même geste que sur l'écran d'ajout, que l'aide décrit déjà.
Tests : **parcours 1949/1949** (+8, bloc **CLXXI**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⭐⭐ **La fixture EST son entrée** : estimée par l'IA, **aucun `per100`, aucun `q`, aucun poids dans le nom** — précisément le cas que l'ancien écran envoyait dans le cul-de-sac. ⭐⭐ **Le témoin qui compte le plus est celui de R4** : sans lui, les sept autres seraient verts sur un écran qui redemande le poids à chaque ouverture. ⛔ **Et la non-régression garde les 5 multiplicateurs** : ils restent la bonne réponse pour qui ne connaît pas le poids. Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1064. |

**ft-v1063 — 🍽️ « J'AI 2 FOIS LA MÊME PROT » — UN CRITÈRE DE REGROUPEMENT QUI A SURVÉCU À SON MOTIF** — Michel, capture à l'appui : son shaker apparaît **deux fois** dans « Tes repas habituels », deux lignes rigoureusement identiques à l'écran (même nom, 156 kcal, 35 g).

**⛔⛔ LA CAUSE TIENT À UN `+`** : la signature d'un repas habituel était `meal + '::' + aliments`. Noté **6 fois en Collation 2** et **2 fois en Petit-déj**, le même shaker faisait donc **deux habitudes**.

**⚠️⚠️ ET C'EST UNE RÉGRESSION DE ft-v1056, LA MIENNE.** Tant que la carte **appliquait** le moment, il faisait légitimement partie de l'identité de ce qu'on rejoue : deux lignes, deux résultats différents. Depuis que le moment **se demande au tap**, les deux lignes font **exactement la même chose** et posent la même question. 👉 ***Un critère de regroupement qui survit à la disparition de son motif ne trie plus rien : il fabrique des doublons.*** Le motif avait disparu six versions plus tôt, le critère est resté.

**⛔ ET LE COÛT N'EST PAS QUE VISUEL** : la liste est bornée à **3**. Une variante en double **chasse une vraie autre habitude** de l'écran — sur sa capture, ses 3 lignes ne sont en réalité que **2 repas**. Mesuré : après fusion, la 3ᵉ place rend une habitude qui n'avait jamais pu s'afficher.

**⭐⭐ ON FILTRE AVANT DE FUSIONNER, ET C'EST TOUT L'ARBITRAGE.** Michel prend ce même shaker **le matin ET l'après-midi** — c'est visible dans son journal. Fusionner d'abord ferait disparaître l'habitude **entière** dès qu'il l'a notée une fois dans la journée : *il perdrait le tap pour son 2ᵉ shaker, et le correctif serait devenu une gêne*. En filtrant variante par variante, celle de l'après-midi survit à celle du matin. Un témoin épingle exactement ce cas.

**⚠️⚠️ ET MON PROPRE TÉMOIN M'A REPRIS, SUR UNE ERREUR QUE JE N'AVAIS PAS VUE VENIR.** Mon premier jet affichait *« noté 6 fois »* pour un repas noté **9** fois : la variante du matin, écartée parce que déjà consommée aujourd'hui, emportait son compte avec elle. 👉 ***Le filtre décide de ce qu'on PROPOSE, jamais de ce qu'on a COMPTÉ.*** Le compte et le moment proposé portent désormais sur **toutes** les variantes.

**⛔ LE MOMENT PROPOSÉ EST LE PLUS FRÉQUENT, PAS LE PLUS RÉCENT** : il décrit l'habitude, pas le dernier écart. Et rien n'est appliqué sans son tap — la décision de ft-v1056 ne bouge pas.

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Réparation : une ligne en double disparaît, rien n'apparaît, rien à faire.
Tests : **parcours 1936/1936** (+7, bloc **CLXX**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⭐⭐ **La fixture EST son journal** (6 en Collation 2, 2 en Petit-déj, plus un 3ᵉ noté **ce matin**). **CONTRÔLE NÉGATIF : il rend sa capture au pixel** — contre ft-v1061, `[{n:6,meal:"collation2"},{n:3,meal:"dejeuner"},{n:2,meal:"petitdej"}]`, soit **deux lignes « Iso zero protein » identiques** et « Oeuf cru » chassé de la liste. Après : une seule, `n=8`, et « Oeuf cru » reprend sa place. ⛔ **Le témoin qui empêche le correctif d'être un recul** : shaker noté ce matin en Petit-déj → l'habitude **reste proposée**. Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1063. |

**ft-v1062 — 🪟 UNE MODALE ENFERMÉE DANS UN ÉCRAN QUI DÉFILE S'OUVRE HORS DE L'ÉCRAN** — Michel : *« ça clique bien mais rien ne se passe »*.

**⭐⭐ SES CINQ MOTS ONT CHANGÉ LE DIAGNOSTIC, ET C'EST EUX QU'IL FAUT RETENIR.** *« Ça clique bien »* dit que le bouton répond ; *« rien ne se passe »* dit que la **fenêtre ne s'ouvre pas**. Donc le défaut était **avant** la livraison du fichier — et ma version de la veille, qui corrigeait la livraison, ne pouvait pas le régler. 👉 *Une description précise du symptôme vaut mieux que n'importe quelle hypothèse : il m'a dit où chercher en cinq mots.*

**⛔⛔ LA CAUSE, MESURÉE, ET ELLE TIENT À UN MOT DE CSS.** `.overlay` est en **`position:absolute`** — elle se cale donc sur son **ancêtre positionné**. À la racine, c'est `.screens`, et `inset:0` couvre bien la fenêtre. Mais un `.screen` est lui aussi `position:absolute` **et** `overflow-y:auto` : enfermée dedans, `inset:0` désigne le **haut du CONTENU**, pas la fenêtre. 👉 Écran Progrès défilé à fond, la modale s'ouvrait à **y = −3102**, soit ***2 800 px au-dessus de l'écran***. La classe `open` était posée, la modale rendue, et il ne se passait rien.

**⚠️⚠️ ET C'EST CE QUI REND CETTE PANNE SI CHÈRE : elle est SILENCIEUSE, et elle DÉPEND DU DÉFILEMENT.** Aucune erreur, aucun test rouge. Un test dont la fixture n'a qu'une seule séance **ne défile pas** — donc il passe. ***Mon propre test de la veille reproduisait le chemin heureux***, et c'est pour ça que ft-v1059 a corrigé un vrai défaut sans corriger celui-là. **Nouvelle famille dans `BUGS.md`** : *une fixture sans profondeur ne teste pas le même écran.*

**⭐⭐ LA MESURE QUI TRANCHE : SUR 63 OVERLAYS, 61 ÉTAIENT DÉJÀ À LA RACINE.** Les deux fautives étaient l'**exception**, pas la norme — donc la correction n'invente rien, elle remet deux exceptions dans le rang (**R13** : faire ce que font celles qui marchent).

**⚠️ LA JUMELLE EST PLUS GRAVE QUE L'ORIGINALE, et elle a été trouvée en la cherchant (R8).** `ov-rest-edit`, dans l'écran Séance : le **réglage manuel du temps de repos**, en pleine séance. Même cause, antérieure à moi, jamais signalée — *parce qu'une panne silencieuse ne se signale pas, elle se subit.* Corrigée aussi.

**⭐⭐ LE TÉMOIN VAUT PLUS QUE LE CORRECTIF, et il a deux moitiés qu'aucune ne remplace.** ① **La règle, lisible dans le fichier** : aucune `.overlay` ne vit dans un `.screen` — il reconstruit la pile d'ancêtres de chacune. ② **Le comportement, écran DÉFILÉ À FOND** — 30 séances dans la fixture, exprès : *c'est la condition que mon test d'hier n'avait pas.* ⛔ Un troisième témoin vérifie que le premier **voit** bien les 63 overlays : sans lui, renommer la classe le rendrait vert en ne mesurant plus rien.

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Réparation : un bouton censé ouvrir une fenêtre l'ouvre. Rien de nouveau, rien à apprendre.

**⭐⭐ CONFIRMÉ PAR SA VIDÉO — et j'ai failli abandonner le bon diagnostic, pour la MÊME raison.** Sa vidéo montre le bouton qui s'allume à chaque tap et **rien d'autre** : ni modale, ni message. J'ai mesuré à sa position de défilement… **avec 8 séances**, et la modale ressortait **visible** — j'ai donc écrit que mon hypothèse était fausse. ⛔ **Elle ne l'était pas** : avec 8 séances les deux cartes du haut ne s'affichent pas, l'écran est plus court, et le défilement n'était que de **473 px**. 👉 Refait avec **38 séances sur 78 jours** — son profil réel : amener le bouton là où il est sur sa vidéo demande **905 px**, au-dessus du seuil de **742**. La modale sort à **y = −365 → −61**, `visible:false` ; après correctif, **540 → 844**. ⚠️ ***La famille §24 s'est appliquée à ma propre vérification*** : le seuil n'est pas « ça défile », c'est « ça défile AUTANT QUE CHEZ LA PERSONNE ».
Tests : **parcours 1909/1909** (+5, bloc **CLXIX**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. **CONTRÔLE NÉGATIF : la modale remise dans son écran → DEUX rouges**, et le premier **nomme la coupable** (`ov-histo-export`). ⭐ Mesuré des deux côtés : `overlayY` **−3540 → 0**, `modaleVisible` **false → true**, sur un écran défilé de 3 642 px. ⭐ **Vérifié à l'écran** : capture de la modale, écran défilé à fond, elle est là où elle doit être. ⚠️ **Et une correction que je me dois** : mon diagnostic de ft-v1059 (le `;charset` qui casse le partage iOS) était un **vrai** défaut et il reste corrigé — mais ce **n'était pas son bug**. *Je l'ai annoncé avec une réserve, elle a servi.* Fichiers : `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `BUGS.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1062. |

**ft-v1061 — ⚖️ LA QUANTITÉ ET LES VALEURS NE SE DÉSAPPAIRENT PLUS** — Michel, quatre captures dont **la photo de son étiquette d'Iso Zero Protein** : *« ça sent le bug »*. Il y en avait **deux**, et le second explique ses chiffres au chiffre près.

**⛔ ① LE CHAMP VIDÉ LAISSAIT UN CHIFFRE ORPHELIN.** Il tape *« 3 »* (début de 30), les 4 valeurs tombent à **12 kcal**, il efface pour recommencer — et **12 kcal restent affichés à côté d'un champ vide**, juste au-dessus du bouton rouge *« Ajouter au journal »*. Le garde d'origine était bien intentionné (*« champ vidé pendant la frappe : on ne touche à rien »*, écrit en ft-v970) : on ne voulait pas tout mettre à zéro pendant qu'on tape. Mais sa conséquence ne l'était pas — *aucun des deux nombres n'est faux, c'est leur **voisinage muet** qui trompe*. **4ᵉ fois que ce motif revient** (ft-v966, v1042, v1056). Le champ vidé ramène désormais les valeurs **à la référence**, donc à une quantité écrite juste en dessous.

**⛔⛔ ② LE VRAI DÉFAUT : LA RÉFÉRENCE DEVENAIT UNE VALEUR DÉRIVÉE D'ELLE-MÊME.** `_afMajAncre` relisait les 4 champs de l'écran **à chaque appel** pour en faire la nouvelle `base` — y compris quand elle n'était rappelée que pour **redessiner** le bloc (changement d'unité, déclaration de poids). Or après un rescale, ces champs ne portent plus `base`, ils portent **`base × facteur`**. 👉 ***`base` et `q` se désappairaient, et l'erreur se FIGEAIT*** — silencieusement, avec des nombres parfaitement crédibles.

**⭐⭐ ET C'EST MESURÉ SUR SON ÉTIQUETTE, PAS DÉDUIT.** Étiquette : **116,6 kcal · 26,4 g** de protéines pour 30 g. Référence 30 g, il tape 40 → **156 kcal / 35 g**, *juste*. Un geste redessine le bloc, `base` devient 156 pendant que `q` reste 30 — et 40 g affiche alors **208 kcal / 47 g**. 👉 ***C'est exactement ce que montre sa capture, sur les deux macros à la fois, et c'est 1,33× son étiquette*** — soit précisément 40/30. *Un écart identique sur deux grandeurs indépendantes ne vient pas d'une estimation approximative : il vient d'un facteur.*

**⭐ L'EN-TÊTE DE LA FONCTION DISAIT DÉJÀ LA RÈGLE — elle n'était vraie que de l'intention.** *« Appelée seulement quand la SOURCE des valeurs change »*, écrit noir sur blanc au-dessus du code qui, lui, relisait l'écran à tous les coups. Un argument **`srcChange`** rend la phrase **exécutable** : **vrai** quand les valeurs viennent d'ailleurs (estimation IA, reprise d'un aliment, macro corrigée à la main) → on relit ; **absent** quand on ne fait que redessiner → `base` est **préservée**. ⛔ Et le nom de l'aliment (`af-desc`) est **laissé exprès** en « préserve » : *changer le nom ne change pas ce qu'on a mangé.*

**⛔ CORRIGER LE CALCUL SANS RAFRAÎCHIR L'AFFICHAGE N'AURAIT RIEN CORRIGÉ DE CE QUE LA PERSONNE VOIT.** Mesuré à mi-parcours : `base` était bien préservée, et l'écran annonçait toujours *« Référence : 30 g »* **au-dessus des chiffres de 40 g**. Le voisinage muet une troisième fois dans la même version. L'écran se remet désormais d'accord avec la référence qu'il vient d'écrire.

**⚠️⚠️ ET LE DÉFAUT EST DE MOI, DE ft-v1056** (`git log -S`, pas de mémoire) — la version qui a introduit le poids déclaré. **Pire** : la leçon était déjà écrite dans cette même version, à propos de `_provFood`, mot pour mot — *« les valeurs affichées et la quantité affichée vont toujours ensemble : c'est le seul couple sur lequel on peut diviser sans se tromper »*. Je l'avais posée **d'un seul côté** (**R8**, la jumelle). *Une leçon écrite dans un fichier n'est pas une leçon appliquée dans l'autre chemin.*

**⛔ MON PREMIER CORRECTIF ÉTAIT INCOMPLET, ET LA MESURE ME L'A DIT.** Il appairait `base` avec la quantité affichée — ce qui règle le chemin *« macro corrigée à la main »* et **rate** l'aller-retour d'unité, où `af-prop` n'existe même plus. *Corriger le symptôme sur le chemin qu'on a sous les yeux laisse les autres ouverts* : c'est la préservation de `base` qui les ferme tous.

**⚠️⚠️ CORRECTION, LE JOUR MÊME — J'AI SUR-AFFIRMÉ LA CAUSE, ET C'EST LE GENRE D'ERREUR QUE CE FICHIER EXISTE POUR EMPÊCHER.** J'ai écrit que la désynchronisation explique *« exactement »* sa capture. **Elle l'explique — et une autre cause aussi, tout aussi bien.** Ce que la mesure établit vraiment : sa `base` valait **156 / 35** au moment des captures (les *« 16 / 4 »* du champ vidé ne sortent que de là ; l'étiquette aurait donné 12 / 3). ⛔ **Mais deux histoires produisent cette base, et le même écran** : ① l'IA a estimé 117 / 26 (juste) et mon bug l'a désappairée en 156 / 35 ; ② **l'IA a directement estimé ~156 / 35** — c'est-à-dire une dose de **40 g** — et l'app a fidèlement affiché 208 / 47 pour 40 g. 👉 ***Les captures ne les départagent pas, et je ne peux donc pas dire laquelle s'est produite chez lui.*** ⭐ **Un indice penche pour ②** : son écran dit *« Référence : 30 g (que tu as indiqué) »*, donc l'IA n'a **pas** renvoyé de poids exploitable — ce qui veut dire que `base` est l'estimation brute du modèle, sans rescale préalable possible (le champ de quantité n'existe qu'**après** la déclaration). L'histoire ① exige en plus un aller-retour d'unité ou une macro retouchée, que rien n'atteste. ⛔ **Le correctif reste entièrement justifié** : le bug est réel, reproduit, et il corrompait des valeurs justes. **Mais il ne répond pas à la question de Michel** — *« il faut que les valeurs soient bonnes sinon ça va être la merde »* — qui porte sur la **provenance**, pas sur le rescale. *Un correctif juste présenté comme l'explication d'un cas qu'il n'explique peut-être pas fait chercher au mauvais endroit la prochaine fois.*

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** C'est une **réparation** : rien n'apparaît, rien ne bouge de place, il n'y a rien à faire. Les valeurs cessent simplement d'être fausses. Annoncer reviendrait à dire *« on avait un bug »* à des gens qui, pour la plupart, ne l'ont pas vu — et l'aide existante **reste juste**, elle ne nommait aucun de ces nombres.
Tests : **parcours 1929/1929** (+8, bloc **CLXVIII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données 106 classées 0 trou. ⭐⭐ **La fixture EST son étiquette** (117 / 26 / 1 / 1 pour 30 g) — une fixture inventée aurait rendu le témoin vert sans rien dire de son cas. ⭐⭐ **Le témoin qui porte sa capture** vérifie que 40 g redonne **156 / 35** et plus jamais **208 / 47**. ⛔ **Et celui qui empêche le correctif d'être un recul** : une macro corrigée **à la main** devient bien la nouvelle référence (`base.kcal=200`, `q=40`) — sinon « préserver » aurait voulu dire « ignorer ce que la personne tape ». **CONTRÔLE NÉGATIF : mesuré contre ft-v1060 avant d'écrire une ligne**, sur la séquence exacte — champ vidé → `{"q":"","kcal":"12"}` ; aller-retour d'unité puis 30 g → `base={"kcal":156,"prot":35}` avec `q=30`, et l'écran à **156 / 35** au lieu de 117 / 26. Après : `base={"kcal":117,"prot":26}`, écran **117 / 26**. **0 erreur JS.** ⚠️ **Ce que ça ne répare PAS, et c'est écrit** : les entrées **déjà enregistrées** avec un total désynchronisé restent fausses dans le journal alimentaire — comme pour l'historique d'Eline, on ne touche pas aux données de quelqu'un sans son accord (**R29**). Fichiers : `app.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1061. |

**ft-v1060 — 👎 « MILO A RÉPONDU À CÔTÉ » : LE POUCE COMPTE, IL NE RACONTE RIEN** — Michel, et sa formulation vaut d'être gardée entière : *« j'aimerais savoir si Milo déconne quand les utilisateurs posent une question. Exemple : une personne pose une question, mais Milo répond à côté — 1 appel API qui sert à rien. Et s'il met 2 ou 3 réponses avant de tomber juste, **là ça me coûte de l'argent pour rien**. J'appelle ça améliorer le service. »*

**⛔⛔ ET C'EST LUI QUI A ÉCARTÉ LA SURVEILLANCE, AVANT MÊME QU'ON EN PARLE** : *« alors non je ne veux pas savoir ce qu'ils disent à Milo, je m'en fous, en tout cas pas comme tu peux le croire »*. 👉 ***Ce qu'il veut mesurer, c'est la QUALITÉ, pas le contenu*** — et cette phrase-là décide de toute la forme du correctif, pas seulement de son ton. Le pouce **compte**, il ne **raconte** rien.

**⭐ MESURÉ AVANT DE CHOISIR, ET LE CONSTAT EST NET** : **aucun retour de qualité n'existe** dans l'app — rien, nulle part, ne dit jamais si une réponse de Milo était bonne. En revanche **chaque message est horodaté**. Deux pistes étaient donc possibles : le **pouce** (la vérité, dite par la personne) et la **relance rapide** (un proxy — une question qui revient en 6 s sur une réponse de 2 000 caractères n'a pas été lue). Michel a tranché : *« ET on peut faire le 1 »*, puis *« oui vas y pour le A »*. **Le proxy reste ouvert, il n'est pas écarté.**

**⛔⛔ LA GARANTIE DE CONFIDENTIALITÉ EST MESURÉE, PAS AFFIRMÉE — c'est le témoin central du bloc.** Taper un motif fait **0 appel réseau** (compté sur le téléphone), et la trace locale ne contient **que deux clés : `motif` et `ts`** — jamais un texte. Envoyer sans cocher : le motif part, `« genou »` et `« pectoraux »` **restent**. ⛔ Et **« joindre ta question et la réponse » est DÉCOCHÉE par défaut**, ce qui n'est pas négociable : *un consentement pré-coché n'est pas un consentement* (Constitution **P3**).

**⛔ PAS DE POUCE VERT, ET C'EST DÉLIBÉRÉ.** Un 👍/👎 sous chaque réponse transforme une conversation en **formulaire de satisfaction**, et le taux de clic dirait surtout **qui est poli**. *On ne demande que ce dont on fera quelque chose* : un raté est actionnable, un « c'était bien » ne l'est pas (**R19/R24**).

**⭐ ET LES 4 MOTIFS SONT UNE LISTE FERMÉE, TIRÉE DE SES PROPRES MOTS** : *à côté* et *trop vague* viennent de son *« Milo répond à côté »*, *faux* de son *« 2 ou 3 réponses avant de tomber juste »*. ⛔ Le quatrième — **« il a oublié »** — n'est pas un motif de confort : c'est le seul qui, s'il revient souvent, dit que **la mémoire elle-même ne tient pas**, c'est-à-dire la promesse centrale du produit.

**⭐⭐ CE QUI LE REND PRÉCIEUX DÉPASSE LA MESURE** : chaque 👎 donne un **cas réel**, et le projet sait déjà quoi en faire — **R35**, *un bug rencontré devient un scénario permanent du banc d'essai*. Les 6 meilleurs scénarios actuels viennent de bugs **vécus en salle**, pas de cas inventés ; celui-ci ouvre le même robinet chez les testeurs.

**⭐ R13 — ZÉRO COMPOSANT NEUF, ZÉRO LIGNE DE CSS** : le pied de bulle et `.coach-share-btn` existent depuis le bouton Partager (le pouce s'y **ajoute**, les deux autres sont vérifiés intacts) ; les pastilles réutilisent `.ck-opt` du check-in ; l'envoi facultatif réutilise la **boîte à idées**. ⛔ Et la trace est **plafonnée à 40** — un registre sans fin des ratés grossirait pour rien (la leçon du réservoir plein du 29/07), et relire un « à côté » d'il y a six mois ne sert à personne.

**⚠️⚠️ ET LE SEUL ROUGE DE LA LIVRAISON ÉTAIT UN FAUX ROUGE, DONT LA CAUSE VAUT LA VERSION.** Le témoin anti-fuite du banc d'essai (bloc CXXII) a accusé `S.miloRates` d'échapper à la remise à zéro des personas. **Mesuré : il n'est pas lu par le contexte du tout.** Sa fenêtre de mesure va de `buildCoachContext` jusqu'à `_vcApplyPersona` — soit **238 675 caractères et 41 fonctions**, quand le corps réel de `buildCoachContext` en fait **129 483**. Mesuré des deux façons : le vrai corps lit **47 clés dont 4** non réinitialisées ; la fenêtre large en lit **55 dont 8**. 👉 ***Quatre des huit « fuites possibles » documentées depuis ft-v1014 ne sont pas des fuites*** — `gardienStats`, `coachConversations`, `url` et le mien vivent chez les 40 fonctions voisines. *Quelqu'un lisant cette liste croyait que les stats du Gardien de la personne partaient dans chaque persona du banc d'essai.* ⛔ **La fenêtre n'est PAS rétrécie ici, et c'est le point** : trop large elle attrape trop (des faux rouges), **jamais trop peu** — rétrécir un filet de sécurité mérite sa propre mesure, pas d'être fait en passant pendant la livraison d'autre chose (**R34**). Ce qui est corrigé, c'est le **mensonge de la liste** : les deux groupes sont désormais nommés séparément, et **2 témoins figent les deux comptes** pour que le débordement ne grossisse pas d'une fonction à chaque ajout dans `coach.js`. *C'est la leçon de ft-v1017 — une fenêtre de mesure qui déborde mesure autre chose — retrouvée dans un témoin écrit deux semaines plus tard.*

**⛔ ET LE GARDE-FOU R4a A FAIT SON TRAVAIL** : la livraison a échoué tant que `miloRates` n'était pas **classée** face à Milo. Elle est **exclue, avec sa raison écrite** — et la vraie raison n'est pas la confidentialité : *lui envoyer le compte de ses propres ratés changerait son comportement* (il s'excuserait, se sur-corrigerait, parlerait de lui). **C'est une mesure POUR MICHEL, pas une information sur le sportif.**

**📇 LIVRÉ UN COMMIT PLUS TÔT, SOUS LE CACHE ft-v1058 DE SESSION-B (pas de bump propre, et autant l'écrire)** : la ligne **« 👥 Qui a appelé Milo aujourd'hui »** dans Profil → Admin → Santé du système, qui répond à la question posée juste avant (*« est-il possible de savoir qui utilise Milo ? »*). ⭐⭐ **Il n'y avait rien à construire côté serveur** : `ai_quota.byEmail` compte déjà les appels par personne — c'est ce qui fait respecter le plafond de 50/jour — et la route `aiUsage` renvoyait **déjà** `topUsers` trié, `uniqueUsers` et `global`. Mesure avant d'écrire une ligne : **zéro occurrence de `topUsers` dans `app.js`**. *La donnée arrivait dans l'app et se perdait à chaque ouverture* — **R5** dans sa forme la plus pure. ⛔ **Et la limite est affichée à l'écran** : `ai_quota` compte des **APPELS**, pas des tokens, et `ai_usage` (les euros) ne porte **pas** l'email — donc *« christophe : 31 appels »* se dit, *« christophe : 0,40 € »* jamais (**R29**). ⛔ Seule la partie **avant l'arobase** s'affiche : reconnaître ses testeurs, pas tenir une liste d'adresses. ⛔ Et les emails viennent du serveur pour finir dans `innerHTML` : un email piégé est **échappé**, vérifié par un témoin. ⛔ Aucun appel du jour → la ligne le **DIT** (*« journée calme »*) au lieu de montrer une liste vide, qui se lirait comme une panne.

**📣 RÈGLE D'OR #11 — pas de pop-up, et c'est un cas limite qu'il faut argumenter.** Un bouton **apparaît** sous chaque réponse de Milo, donc un repère bouge — mais il ne **déplace** rien, ne cache rien, et **s'explique en un tap** : la lecture naturelle de « 👎 à côté » est exactement ce qu'il fait. *La pop-up se mérite* (**R25**) ; l'annoncer reviendrait à interrompre tout le monde pour dire qu'on a ajouté un bouton facultatif. Les points **2 à 5** sont faits : point rouge `milo-a-cote` sur l'onglet Coach · aide `?` de l'onglet · aide détaillée · diapo du Guide.
Tests : **parcours 1913/1913** (+17 : bloc **CLXVI** pour le pouce — dont **5 sur la règle d'or #11** —, **CLXVII** pour la ligne admin, +2 sur la fenêtre de CXXII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, **données 106 classées 0 trou** (60 transmises · 46 exclues). ⚠️ **7ᵉ PUIS 8ᵉ collision de la semaine, et la seconde est arrivée pendant que j'écrivais ce journal** : session-B avait pris **CLXIV** et **ft-v1058**, puis a publié **CLXV et ft-v1059** avant mon push. Mes blocs glissent donc **deux fois** — le pouce en **CLXVI**, la ligne admin en **CLXVII** — et ma version devient **ft-v1060**. *On ne fait jamais reculer le numéro de cache.* ⭐⭐ **Le témoin qui porte la demande est celui du RÉSEAU** : `fetch` est remplacé et on **compte ce qui part vraiment** — sans lui, la promesse « rien de ta conversation n'est envoyé » serait une intention écrite dans une modale, pas un fait. ⭐ **Et le contrôle dans l'autre sens est là aussi** : en cochant, la question **et** la réponse partent bien — sinon le premier témoin serait vert parce que rien ne part jamais. ⭐ **Non-régression mesurée** : les 2 boutons d'origine du pied de bulle sont toujours là (3 en tout). **CONTRÔLE NÉGATIF : le bloc ne peut pas tourner contre ft-v1058** (`_miloRaterOuvrir is not defined`) — la limite honnête habituelle, *une fonction neuve ne se juge pas contre du code où elle n'existe pas* ; ce qui tient lieu de preuve est la mesure réseau et l'écran. ⭐ **Vérifié à l'écran**, **0 erreur JS**. Fichiers : `coach.js`, `state.js`, `index.html`, `screens.js`, `constants.js`, `app.js`, `tests/parcours/runner.js`, `tests/donnees/donnees-milo.json`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1060. |

**ft-v1059 — 📤 L'EXPORT DE L'HISTORIQUE NE MENT PLUS SUR SA RÉUSSITE** — Michel : *« le bouton exporter dans historique ne fonctionne pas »*.

**⛔⛔ ON MESURE AVANT DE CHERCHER, ET ÇA A CHANGÉ OÙ CHERCHER.** Rejouée en Chromium, **toute la chaîne marche** : bouton visible et tappable, modale ouverte, CSV téléchargé, **0 erreur JS**. Le défaut était donc **spécifique à son iPhone** — et sans cette mesure j'aurais passé une heure dans le code de la modale.

**⭐⭐ LA CAUSE EST MESURABLE DANS LE CODE, PAS DEVINÉE.** Sur les **7 endroits** de l'app qui livrent un fichier, `_donnerFichier` (ft-v1048) était **le seul** à passer un type portant `;charset=utf-8`. Les six autres — le CSV du banc d'essai, les PDF de séance et de programme, l'export de conversation — passent des types **propres**, et **eux marchent sur son téléphone**. 👉 ***`navigator.canShare` d'iOS ne reconnaît pas un type paramétré et rend `false`*** → on tombait sur `<a download>`, **qu'iOS n'honore pas**, encore moins dans une PWA installée en plein écran. *Rien ne se passe, aucune erreur.* ⭐ C'est **R13 retourné** : la bonne question n'était pas « qu'est-ce qui cloche ? » mais *« qu'est-ce que font les exports qui MARCHENT déjà ? »*.

**⛔ ET LE CHARSET ÉTAIT DÉCORATIF — c'est ce qui rend le correctif sans risque.** Ce qui fait lire l'UTF-8 à Excel, c'est le **BOM dans les octets**, pas le type MIME d'un fichier qu'on partage : il n'y a **aucun en-tête HTTP** dans cette histoire. On ne perd donc rien, et un témoin lit le **vrai fichier téléchargé** pour le prouver — BOM, séparateur `;`, accents, échappement.

**⛔⛔ ET LE 3ᵉ DÉFAUT N'A RIEN À VOIR AVEC iOS : `return true` APRÈS `a.click()`, SANS RIEN SAVOIR.** `a.click()` ne rend rien et ne lève rien. Le toast annonçait donc *« 2 séries exportées »* alors que rien n'était parti. 👉 ***Un succès menteur est pire qu'un échec*** : il envoie chercher le problème au mauvais endroit — Michel a cru que le bouton ne « fonctionnait » pas, alors que c'est la **livraison** qui échouait en annonçant l'inverse. Quatre issues distinctes maintenant : réussite · **annulation muette** (fermer la feuille de partage n'est pas un échec, on ne crie pas « impossible » à qui vient de dire non) · **incertitude nommée** (*« Ouvre l'app dans Safari pour enregistrer le fichier »*) · échec.

**⛔ R2 — LE PDF PORTAIT LES MÊMES TROIS DÉFAUTS, parce qu'il recopiait la livraison.** Un correctif posé d'un seul côté les aurait laissés vivre — le motif que ce projet passe son temps à rattraper. Il passe par le même propriétaire, et un témoin **refuse toute 2ᵉ livraison recopiée à côté**.

**⛔ LE TÉMOIN ⑥ PROTÈGE LA RÈGLE, PAS LE CAS DU JOUR** : aucun `new File` des fichiers servis ne doit porter un type paramétré. Le prochain qui écrira `text/plain;charset=utf-8` cassera iOS de la même façon, en silence.

**📣 RÈGLE D'OR #11 — NI POP-UP NI POINT ROUGE.** Réparation : un bouton censé marcher marche. ⚠️ **Et l'honnêteté impose une réserve** : je ne peux pas tester iOS depuis ici. La cause est **fortement étayée** (le seul export de l'app à diverger, et les six autres marchent chez lui) mais elle n'est **pas prouvée sur son appareil** — c'est lui qui tranchera au prochain essai. *Écrit ici plutôt que présenté comme réglé.*
Tests : **parcours 1904/1904** (+8, bloc **CLXV**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin central lit le VRAI fichier téléchargé**, pas une chaîne construite à côté — c'est la seule façon de savoir que le BOM a survécu au changement de type. ⭐ **Les deux témoins de la cause éprouvés dans les deux sens** : charset réintroduit → **rouge**, avec le type fautif imprimé. ⭐ Le cas iPhone est **simulé** (`_iosStandalone` forcé) pour vérifier qu'on n'annonce plus une réussite qu'on ignore. ⚠️ **Mesuré sur l'arbre FUSIONNÉ** avec les ft-v1057 et ft-v1058 de session-A. ⚠️ **7ᵉ collision de la semaine** : ils ont pris **CLXIV**, déjà celui de ma version volume — mon bloc reste **CLXV**, et *on ne renumérote jamais celui de l'autre*. Fichiers : `setup.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1059. |

**ft-v1058 — 📊 LE VOLUME PAR MUSCLE : 14 JOURS, RAMENÉS À LA SEMAINE** — Michel, capture à l'appui : *« ce que tu as travaillé cette semaine c'est super mais ça ne serait pas mieux sur 2 semaines ? »*

**⭐⭐ SA CAPTURE PORTE SA PROPRE PREUVE, ET C'EST CE QUI REND LA DEMANDE INDISCUTABLE.** La carte du dessus annonce **3,4 séances par semaine** sur 78 jours ; celle du dessous en comptait **2**. 👉 ***Les deux cartes parlaient du même bonhomme et n'en donnaient pas la même image*** — non parce qu'un chiffre était faux, mais parce que **7 jours est un échantillon trop court pour un entraînement**. Une semaine chargée et une semaine creuse alternent normalement ; la fenêtre courte transformait ce va-et-vient en information.

**⛔⛔ MAIS LES CHIFFRES BRUTS NE SONT PAS DOUBLÉS — c'est TOUT l'arbitrage de cette version, et c'est ce qui distingue « élargir » de « gonfler ».** `DISC_CADRE.volume` dit *« 10 à 20 séries par groupe musculaire **et par semaine** »*. Afficher **24** sur 14 jours produirait un nombre **faux et crédible** en face d'un repère hebdomadaire : la personne — et Milo — le liraient comme un excès. 👉 **L'ÉCHANTILLON s'élargit, l'UNITÉ reste la semaine.** C'est la seule opération qui rende le chiffre plus robuste **sans le rendre incomparable**. ⭐ **Michel a choisi cette forme entre trois** (14 j bruts · 14 j ramenés à la semaine · les 2 semaines côte à côte).

**⭐ L'ARRONDI EST AU DEMI, PAS AU DIXIÈME (R29).** *« 4,5 séries/semaine »* se lit ; *« 4,3 »* laisserait croire qu'on mesure au dixième de série alors qu'on a divisé un **entier** par deux — une fausse précision. ⛔ Et le **tri se fait sur le brut** : trier sur l'arrondi mettrait à égalité deux muscles qui ne le sont pas.

**⛔ LE PRIX EST ÉCRIT, PAS CACHÉ : une moyenne NOIE une semaine à zéro.** C'est exactement pourquoi le **nombre de séances** reste affiché à côté — *il dit ce que la moyenne ne peut pas dire*. Sans lui, deux personnes très différentes afficheraient la même ligne : c'est le défaut de ft-v1027 sous une autre forme.

**⛔⛔ UN SEUL PROPRIÉTAIRE, ET LES DEUX LECTEURS SUIVENT (R2).** `_volumeParMuscle` porte la fenêtre (`VOL_FENETRE_JOURS`) et la moyenne (`parSem`) ; l'écran **et** le contexte de Milo lisent la même chose. *Deux chiffres pour la même grandeur — l'un affiché, l'autre envoyé — finiraient par se contredire dans la même phrase : la personne lirait « 6 » sur son écran et s'entendrait dire « tu en fais 12 ».* ⭐ Milo reçoit en plus l'interdiction explicite de parler de *« cette semaine »* à partir d'une moyenne.

**⚠️ LE TITRE ET LE PIED ONT DÛ SUIVRE, sinon le correctif n'était posé qu'à moitié.** *« Ce que ta semaine a travaillé »* au-dessus de chiffres calculés sur **deux** semaines, c'est le motif que ce projet passe son temps à rattraper — un changement appliqué d'un seul côté. Devenu *« Ce que tu travailles, par semaine »*.

**⚠️ ET LA CAPTURE A CORRIGÉ CE QUE LA MESURE NE VOYAIT PAS** : le pied débordait sur **deux lignes** et coupait *« · 4 séances »* de la phrase qu'il qualifie. Raccourci (*« sur 14 jours »*) — carte **305 → 291 px**, une seule ligne. 🔴 Bouton central `[139, 792, 56, 44]`, inchangé.

**⚠️⚠️ TROIS TÉMOINS DE ft-v1045 ONT ROUGI, ET AUCUN NE SIGNALAIT UN DÉFAUT.** Ils épinglaient la chaîne *« 7 derniers jours »* et la formule *« NE LUI REPROCHE PAS »* — **la fenêtre et la phrase du jour, pas leur règle**. Re-visés : *une durée est nommée **et** l'unité aussi* · *Milo sait sur quelle durée porte la mesure* · *Milo a l'interdiction de reprocher*. **7ᵉ fois cette semaine** — *on ne désarme pas un témoin, on le vise.* ⚠️ Et j'ai dû en re-viser un **deux fois** : j'avais raccourci le pied **après** l'avoir corrigé une première fois. *Un témoin visé sur une formulation se périme au raccourci suivant.*

**📣 RÈGLE D'OR #11 — les points 2 à 5, et PAS de pop-up.** Point rouge `volume-semaine` (déjà posé, la carte change de sens donc il se rallume) · **aide `?`, aide détaillée et diapo du Guide RÉÉCRITES, pas doublées** — les trois nommaient *« les 7 derniers jours »* et seraient devenues fausses (**R23** : un document d'état périmé fait dire des bêtises à qui le lit). ⛔ **La pop-up ne se mérite pas** : rien à faire, aucun repère déplacé, la carte est au même endroit et son pied dit lui-même ce qui a changé.
Tests : **parcours 1879/1879** (+9, bloc **CLXIV**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **La fixture est construite pour que les deux semaines DIFFÈRENT** (4 séries puis 8) — sinon la moyenne vaudrait le compte de chaque semaine et le témoin ne mesurerait **rien**. ⭐⭐ **Le témoin qui porte l'arbitrage** : 12 séries brutes sur la fenêtre s'affichent **« 6 »**. ⛔ **Et celui qui l'empêche d'être vert en ne mesurant rien** : 20 séries d'il y a 30 jours restent **dehors** (32 si la borne ne tenait pas). ⭐ Le demi s'affiche **« 4,5 »**, virgule française. ⛔ **La décision de ft-v1045 tient** : toujours aucune cible à l'écran. ⚠️ **Mesuré sur l'arbre FUSIONNÉ** avec les ft-v1056 ET ft-v1057 de session-A (arbre vert avant mon bloc). Fichiers : `log.js`, `setup.js`, `coach.js`, `constants.js`, `screens.js`, `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1058. |

**ft-v1057 — 🔢 LA VIRGULE DÉCIMALE — neuf mots d'Eline, et une corruption de données** — retour de **la fille de Michel** dans la boîte à idées des testeurs : *« impossible de mettre la virgule pour les poids »*.

**⛔⛔ ELLE DÉCRIT UN REFUS. LA MESURE DIT BIEN PIRE.** Dans un `<input type="number">`, taper `62,5` ne rend pas une valeur vide : ça rend **`"625"`** — *le navigateur jette la virgule et garde les chiffres*. Mesuré contre l'ancien code, en **tapant vraiment au clavier** sur le champ le plus utilisé de l'app : la série s'affiche **625**, s'enregistre à **625 kg**, et le 1RM sort à **776 kg**. ⚠️⚠️ **ET IL FAUT DIRE OÙ : c'est mesuré dans CHROMIUM** (identique en `en-US` et en `fr-FR`). Michel a corrigé le tir en une phrase — *« moi je mets aussi des virgules »* — et chez lui, sur **iPhone**, ça marche : **WebKit accepte la virgule et la convertit**. 👉 ***Un contrôle de saisie natif n'a pas UN comportement, il en a autant que de moteurs*** — et une phrase écrite sans dire où elle a été mesurée devient un fait faux dès qu'on la relit ailleurs. ⛔ Donc « tous les historiques sont pourris » serait **faux** : sur les iPhone de l'équipe, le pire cas est un **arrondi** (12 au lieu de 12,5). ⚠️ Et ce qui reste inexpliqué est écrit plutôt que comblé : *pourquoi* le champ refuse chez Eline alors qu'il accepte chez son père — appareil, version, région ? Sans son navigateur, toute réponse serait une invention (**R29**). ⭐ C'est d'ailleurs l'argument le plus fort pour le correctif : `type="text"` + un lecteur unique donnent le **même** comportement partout, au lieu de trois qu'on découvre un par un au fil des retours. Et l'autre moitié du défaut ailleurs : `parseFloat('62,5')` rend **62** — la moitié du kilo disparaît. **Deux façons de se tromper, toutes deux silencieuses.**

**⭐⭐ ET LE 776 kg NE SERAIT PAS RESTÉ À L'ÉCRAN** : il partait dans ses **records**, dans sa **courbe de progression** et dans le contexte de Milo. ***Un retour formulé comme une gêne d'ergonomie cachait une corruption de ses données.***

**⭐⭐ LE MOT DE LA PERSONNE DÉCRIT LE SYMPTÔME, JAMAIS LA CAUSE.** En s'arrêtant à *« impossible »*, on cherchait pourquoi le clavier ne propose pas la virgule — et on passait **à côté des séances déjà fausses**. *Un retour utilisateur est un point de départ à mesurer, pas un diagnostic à appliquer.* Nouvelle famille **§23** de `BUGS.md` : *un champ qui « refuse » une saisie peut en fait la MUTILER* — et un nombre faux mais **crédible** ne se voit jamais, quand un refus, lui, se voit tout de suite.

**⭐⭐ ET L'APP SAVAIT DÉJÀ LIRE UNE VIRGULE — À DIX ENDROITS.** Pour une phrase libre, pour un rapport de balance photographié, pour une réponse de Milo. **Jamais pour ce que la personne TAPE.** *Le mécanisme existait, posé d'un seul côté* — la famille la plus fréquente du projet, retrouvée sur le geste le plus banal qui soit.

**👉 LE CORRECTIF** : **22 champs décimaux** passent en `type="text"` + `inputmode="decimal"` — ⛔ **le pavé chiffré du téléphone RESTE**, seule la virgule devient tapable (*corriger un bug en supprimant le clavier numérique aurait été un deuxième bug*) — et **41 lectures de champ** passent par **un seul lecteur**, `numFR` (**R2** : 22 champs qui liraient chacun leur nombre à leur façon, et le 23ᵉ oublierait la virgule).

**⛔ VÉRIFIÉ AVANT DE CHANGER LE TYPE** : rien dans l'app ne dépendait de `type="number"` — ni `valueAsNumber`, ni `stepUp`, ni une règle CSS. ⛔ **Et les champs ENTIERS n'y touchent pas** (reps, kcal, secondes de repos, semaines) : une virgule n'y a aucun sens, les changer aurait élargi le diff sans rien corriger (**R19**).

**⚠️⚠️ LE PLUS CRITIQUE N'APPARAISSAIT PAS DANS LA RECHERCHE.** `upSet` — le kg de chaque série — reçoit sa valeur **en argument** depuis le HTML (`this.value`), pas via `.value` : elle échappait au motif qui a trouvé les 40 autres. *Une recherche par motif ne voit que la forme qu'on lui a décrite ; ce qui passe par un autre chemin reste invisible.*

**⛔ ET LE TÉMOIN PROTÈGE LE FUTUR, pas seulement le correctif** : il refuse qu'un champ `inputmode="decimal"` soit en `type="number"`. Le 23ᵉ champ ne pourra plus revenir en arrière en silence (**R30** — un retrait se fige par un test).
Tests : **parcours 1983/1983** (+9, bloc **CLXIII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **CONTRÔLE NÉGATIF, et le détail imprimé EST le bug** — contre ft-v1056 : `{"type":"number","affiche":"625","kg":625,"rm1":776}` sur la série, et un poids de corps à **62** sur la pesée. ⭐ **Le témoin le plus important est celui qui TAPE VRAIMENT AU CLAVIER** : poser `.value` à la main ne reproduit **pas** le filtrage à la frappe — il aurait montré un écran sain sur un code cassé. ⭐ **Trois non-régressions** : le pavé numérique reste (`inputmode` conservé) · les champs entiers gardent `type="number"` · le **point** marche toujours (80.5 reste 80.5). ⏭️ **Ce que ça ne répare PAS, et c'est écrit** : les séances **déjà enregistrées** avec un poids ×10 restent fausses dans l'historique d'Eline — proposé à Michel, **en attente de sa décision** (**R29** : on ne touche pas aux données de quelqu'un sans son accord). Fichiers : `state.js`, `index.html`, `log.js`, `setup.js`, `app.js`, `tracking.js`, `screens.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `BUGS.md`, `RETOURS-TESTEURS.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1057. |
**⛔⛔ L'ÉTAT MESURÉ AVANT DE COMMENCER : `signal 1, porte 0` — et le seul « signal » était un LEURRE.** `tools/briques.py` cherchait `startPt001Test`, c'est-à-dire un **outil d'administration**. La brique n'avait donc pas *« un socle sans porte »* : elle n'avait **rien**, et le tableau annonçait un socle qui n'existait pas. ⚠️ **2ᵉ correction de motif en deux jours** (la 7 cherchait `histoireSportive`, un nom que j'avais **supposé**) : *on vérifie les noms, on ne les devine pas* — et un motif écrit à l'époque où la brique n'existe pas se périme sans prévenir.

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
