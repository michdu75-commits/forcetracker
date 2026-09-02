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

> **Version actuelle : `ft-v1105`** (prochaine : `ft-v1106`). Historique complet (ft-v128→574 + gouvernance
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

**ft-v1105 — ⚖️ LA PORTION PRÉ-REMPLIE N'EST PAS LA TIENNE** — Michel envoie **l'étiquette** de son pot (88 g de protéines / 100 g, dosette de **30 g**) et **corrige mon explication de la veille** : *« pourtant j'ai écrit le code barre, je n'ai rien recopié »*.

**⚠️⚠️ IL A RAISON, ET C'EST §12quater DEUX FOIS DANS LA MÊME JOURNÉE.** J'avais expliqué son cas par le mécanisme de **recopie** des suggestions. Ce mécanisme est **réel et mesuré** — l'app propose bien ses anciennes lignes — mais ***je ne l'ai pas vérifié contre ce qu'il a FAIT***. C'est exactement la famille où j'avais livré une version entière (ft-v965) sur une cause élégante et fausse : *une explication qui referme le sujet d'un coup est le signe qu'il faut aller mesurer, pas conclure.*

**⛔⛔ LE VRAI CHEMIN, REPRODUIT.** Le champ « Quantité » se remplit avec **`serving_quantity`** — **la portion que la FICHE PRODUIT déclare**, pas la dosette qu'on a dans la main — et **l'écran n'en disait rien**. Mesuré : une fiche annonçant **40 g** produit **156 kcal et 35 g de protéines** sur ce pot, c'est-à-dire ***les deux chiffres de sa capture, au chiffre près***. 👉 *Des valeurs parfaitement justes pour une portion que personne n'a mangée.*

**⛔ LE CODE LE SAVAIT, L'ÉCRAN NE LE DISAIT PAS.** Le commentaire de `_bcProposerDerniere` écrit déjà, en toutes lettres, *« le scan neuf (qui pose 100 g ou **la portion du fabricant**) »*. ***Un nombre qui a l'air d'un fait alors que c'est l'hypothèse d'un tiers*** — c'est **R32/R33** (ce qui est repris garde d'où il vient), et c'est la même famille que tout le reste de ces deux jours.

**⛔ ON NE RETIRE PAS LE PRÉ-REMPLISSAGE, ET C'EST UN ARBITRAGE.** Sans lui on retombe à **100 g**, ce qui est pire, et le chemin rapide disparaît pour tous ceux dont la dosette correspond. *On ne cache pas le nombre, on lui rend sa source.* ⭐ C'est **mot pour mot la décision de ft-v1051** — *« on donne le choix et pas imposer »*, la phrase de Michel — prise alors pour la quantité de **la dernière fois**, et **pas** pour celle-ci : **R8**, la jumelle, pour la **3ᵉ fois en deux jours**. ⛔ Et les **deux** chemins sont traités : le **scan** (`serving_quantity`) et la **photo d'étiquette** (`serving`) posent tous deux la portion d'un tiers.

**⛔ LE TEXTE INVITE, IL N'ACCUSE PAS (R29)** : *« 40 g est la portion déclarée par la fiche produit — **vérifie ta dosette**, elle peut être différente »*. L'app ne sait pas quelle mesure la personne emploie : elle **nomme la source** et laisse trancher. Sans portion déclarée, elle dit que **100 g est un défaut**, pas une mesure.

**⏭️⚠️ CE QUI RESTE NON ÉTABLI, ET IL FAUT LE DIRE PLUTÔT QUE DE CONCLURE UNE 2ᵉ FOIS.** ***Je ne sais pas quel chemin a produit SON entrée*** : elle porte `q=30` **sans** pour-100 g, ce qui ne correspond **pas** à un scan réussi. ⭐ Deux hypothèses ont été **éliminées par la mesure**, et c'est ce qui donne du prix au reste : ① le pour-100 g **survit** au rechargement (rien ne se perd) ; ② un scan qui trouve les valeurs enregistre bien **`q` ET `per100`**. 👉 **La réponse est dans son propre export CSV**, qui porte les colonnes **`saisie`** et **`source`** depuis ft-v1097 — *l'app a enregistré la provenance, il suffit de la lire.*

**📣 RÈGLE D'OR #11 — RIEN, et c'est argumenté.** Ce qui apparaît est **une ligne d'explication sous un champ qui existait déjà**, et seulement sur l'écran de scan. Aucun repère n'a bougé, rien n'est à faire, aucun chiffre affiché ne change. ⛔ Une pop-up dirait *« la quantité qu'on vous proposait n'était peut-être pas la vôtre »* — **une alarme rétroactive** (**R25**), et l'aide `?` de ft-v1103 couvre déjà le sujet des valeurs qui ne collent pas.

Tests : **parcours 2428/2428** (+7, bloc **CCXIV**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin qui porte la version est une REPRODUCTION EXACTE** : une portion déclarée à 40 g doit rendre **156 kcal · 35 g** — *si ce témoin cessait un jour de reproduire ses chiffres, c'est l'explication qui serait fausse, pas le code*. ⭐ **Et le cas JUSTE est épinglé à côté** : 30 g → **117 kcal · 26 g**, l'étiquette réelle. ⛔ Trois témoins de plus portent ce que le texte doit **faire** : nommer la source, **inviter sans accuser**, et **disparaître** sur un aliment sans fiche (pas de provenance orpheline — le défaut de ft-v1042 sur un autre objet). Fichiers : `app.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1105. |

**ft-v1104 — ♻️ UNE VALEUR FAUSSE QUI SE RECOPIE — LE MÉCANISME DU « TOUJOURS »** — Michel envoie **l'étiquette du pot** : *« c'est cette prot là, toujours le même souci »*. Le tableau donne la vérité : **88 g de protéines pour 100 g**, donc **30 g → 116,6 kcal · 26,4 g de protéines · <1 g de glucides · 1,0 g de lipides**. L'app portait **156 / 35** — soit **exactement 1,333× la vérité, sur les DEUX nombres indépendamment**. Et **1,333 = 40/30** : des valeurs pour une dosette de **40 g**, collées sur une portion de 30.

**⛔⛔ MAIS LE MOT QUI COMPTE DANS SA PHRASE EST « TOUJOURS », ET IL A UN MÉCANISME — DANS LE CODE.** Les suggestions de l'écran d'ajout ont pour **source ①** *« ce que la personne a déjà noté »* (ft-v989). Une estimation fausse notée **une fois** devient donc une **proposition qu'on reprend en un tap, indéfiniment**. 👉 ***Une valeur fausse qui se RECOPIE coûte plus cher que la valeur fausse d'origine : celle-là, au moins, ne se reproduit pas.*** Mesuré : sa ligne remonte bien dans la liste et réinjecte 156 / 35.

**⛔⛔ ET LE GARDE-FOU LIVRÉ HIER NE LA VOYAIT PAS SUR CE CHEMIN — pour DEUX raisons distinctes, dont une est entièrement la mienne.**
- **① Un champ CACHÉ porte encore sa valeur.** `af-bc-grams` est écrit `value="100"` dans le HTML : bloc masqué, il contient quand même « 100 ». Le contrôle comparait donc 37 g de macros à une portion de **100 g que personne ne voyait**. *Il ne rougissait pas — il mesurait un champ invisible.* On ne lit plus que ce qui est **affiché**.
- **② ⛔ R4, à trois lignes du commentaire qui l'explique.** `e.q` (30 g, **bien enregistré**) n'était lu que dans la branche `per100`. À la reprise d'un aliment **sans** pour-100 g — le cas de ce produit, dont la fiche Open Food Facts est incomplète, *et le code le nomme déjà* — la quantité **n'atteignait pas l'écran**. Sans référence affichée, le garde-fou de masse n'avait rien à quoi comparer.

**⚠️⚠️ ET UNE JUMELLE MANQUÉE PAR MOI, LA VEILLE (R8).** Le champ s'appelle `ef-grams` dans la modale de modification et **`af-bc-grams`** dans le formulaire d'ajout. Mon premier jet ne lisait que le premier : le contrôle était donc **aveugle sur tout le chemin code-barres / étiquette**, c'est-à-dire **précisément là où arrivent les valeurs d'un produit emballé**. 👉 *J'ai écrit la règle de la jumelle dans le journal la veille, et je l'ai manquée le lendemain.* **Le journal ne protège pas de ce qu'il documente.**

**⚠️⚠️ ET MON PROPRE CORRECTIF A CASSÉ LE BLOC DE LA VEILLE — 5 rouges, attrapés par les témoins de ft-v1103.** Le contrôle ne lit plus que des champs **visibles** ; or `openEditFood` appelait `_efCoherence()` **avant** `ov.classList.add('open')`. Il mesurait donc un écran **pas encore affiché** : la quantité tombait à 0 et l'alerte ne partait jamais. 👉 ***On ne peut pas lire ce qui est à l'écran avant qu'il y soit*** — on ouvre, puis on mesure. *Un durcissement de garde-fou peut désarmer le garde-fou d'à côté, et c'est le banc d'essai qui l'a dit, pas la relecture.*

**⭐ RIEN N'EST RÉINVENTÉ (R13)** : on emprunte le mécanisme du **poids déclaré** (`_afPoidsDeclare`), et son libellé *« que tu as indiqué »* reste **vrai** — elle l'a indiqué la fois d'avant. ⛔ Grammes seulement, et jamais par-dessus un pour-100 g, qui a déjà son propre champ (**R2**).

**⭐⭐ ET LE CHEMIN FIABLE EST MESURÉ, PAS SUPPOSÉ.** Le pour-100 g de la **vraie étiquette** (88 g/100 g) sur 30 g rend **117 kcal · 26 g · 1 g · 1 g** — au chiffre près, **et en silence**. C'est **R33** (l'échelle des sources) vérifiée sur son pot : *le code-barres ou la photo de l'étiquette battent l'estimation*, et le garde-fou ne gêne pas le chemin juste.

**⚠️ CE QUE ÇA NE PROUVE PAS, ET IL FAUT LE DIRE** : le garde-fou de masse n'attrape ce cas **que parce que la poudre titre 88 %**. La **même erreur de dosette** (valeurs pour 40 g sur une portion de 30) sur du **poulet** donnerait ~8,7 g de protéines dans 30 g — **aucune alerte**, et c'est normal : rien ne serait physiquement impossible. *La règle attrape l'impossible, pas le faux.* Détecter un décalage de portion en général demanderait une référence qu'on n'a pas.

**📣 RÈGLE D'OR #11 — RIEN DE NEUF, l'aide de ft-v1103 couvre déjà le sujet.** Aucun repère n'a bougé, rien n'apparaît : ce qui change, c'est qu'une **quantité déjà enregistrée s'affiche enfin** quand on reprend un aliment — donc un champ **manquant qui revient**, pas un repère déplacé. ⛔ Et l'annoncer reviendrait à dire *« vos aliments repris perdaient leur quantité »* : une alarme rétroactive sur un trou qu'on ferme (**R25**).

**⏭️ ET SA LIGNE À LUI RESTE FAUSSE.** L'app la lui signale désormais **à l'ouverture ET à la reprise** — elle ne la corrige pas (**R29**, elle ne sait pas lequel des deux nombres est faux). *Le plus sûr pour ce pot est le code-barres ou la photo de l'étiquette, qui donnent le pour-100 g exact.*

Tests : **parcours 2421/2421** (+9, bloc **CCXIII**) ⚠️ *mesuré sur l'arbre **FUSIONNÉ** avec les contre-audits de session-B*, calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le premier témoin du bloc est celui du mécanisme** : sa ligne doit **être re-proposée** — *sans lui, les suivants seraient verts en ne mesurant rien*. ⭐⭐ **Et deux témoins portent le chemin JUSTE, pas le défaut** : la vraie étiquette doit tomber sur **117 kcal / 26 g** et rester **muette** — *un garde-fou qu'on ne vérifie que sur ses prises est un garde-fou dont on ignore le coût*. Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1104. |

**ft-v1103 — ⚖️ UNE VALEUR PEUT ÊTRE COHÉRENTE AVEC ELLE-MÊME ET IMPOSSIBLE** — Michel, capture à l'appui : *« encore le souci avec la prot »*. Une ligne **Iso zero protein**, portion **30 g** : 156 kcal · **35 g de protéines** · 1 g · 1 g. **35 + 1 + 1 = 37 g de matière dans 30 g.** La masse ne se crée pas.

**⛔⛔ LE CONTRÔLE QUI EXISTAIT NE POUVAIT PAS LE VOIR, ET IL N'ÉTAIT PAS EN FAUTE.** `_coherenceKcal` (ft-v972) vérifie que **les calories collent aux macros** : `4×35 + 4×1 + 9×1 = 153` contre 156 affichées, **2 % d'écart** — il se tait, et il a raison. 👉 ***Un garde-fou ne protège que de la question qu'il pose.*** Le modèle avait produit un jeu de valeurs **cohérent avec lui-même**, c'est-à-dire exactement ce qui franchit un contrôle de cohérence. Il manquait la **seconde** question, physique : *est-ce que ça TIENT dans la portion ?* Nouvelle famille **§39** de `BUGS.md`, suite directe de **§34**.

**⭐⭐ REPRODUIT PAR LE VRAI CHEMIN AVANT D'ÉCRIRE UNE LIGNE — et ce n'est pas du zèle, c'est §12quater.** C'est la famille où j'avais **livré une version entière** (ft-v965) sur une cause déduite d'un seul nombre rapporté, sans jamais regarder l'écran ; la coïncidence était parfaite et la cause était fausse. Cette fois la capture était là, et j'ai quand même rejoué le cas **par les vraies fonctions** (seul `fetch` remplacé) : la réponse du modèle entre telle quelle dans `S.foodLog`, **sans une alerte**. Et une réponse à 150 P / 80 G / 70 L pour 100 g y entrait aussi — **300 g dans 100 g**.

**⛔ TROIS PIÈGES DANS LE CORRECTIF, CHACUN PAYÉ EN MESURANT.**
- **L'unité.** 100 ml de miel pèsent ~140 g et portent ~116 g de glucides : la règle appliquée aux **millilitres** hurlerait sur un sirop. ⚠️ Et l'unité **ne voyageait pas** avec la référence (`_efRef` ne portait que `{base, q}`) — sans la faire voyager, mon repli sur « grammes » aurait fabriqué exactement cette fausse alerte. *La leçon de la bière du contrôle voisin, deux mètres plus loin* (**R19**).
- **Le seuil : il n'y en a pas à choisir.** La limite est l'**ÉGALITÉ**. Mesuré : une huile (10 g pour 10 g de lipides) et du sucre (20 g pour 20 g de glucides) sont **à 100 % d'une seule macro** et parfaitement normales — *tout pourcentage de tolérance les aurait accusées*. La seule marge admise est l'**arrondi** des 4 champs à l'entier : **2 g au pire**, dérivés, pas choisis.
- **⛔⛔ LE BOUTON QU'IL NE FALLAIT PAS METTRE.** Le contrôle voisin en a un (*« Mettre 153 kcal »*) parce que la valeur juste **se calcule**. Ici l'app sait que l'un des deux nombres est faux et **ne sait pas lequel**. Chez Michel c'est la **portion qui est juste** (30 g d'isolat portent ~26 g de protéines) : un bouton *« mettre 37 g »* aurait **aggravé sa ligne au lieu de la réparer**. *On montre les deux nombres, la personne tranche* (**R29**).

**⛔ UN SEUL PROPRIÉTAIRE, DONC TROIS SURFACES D'UN COUP** (`_masseImpossible`, **R2**) : posé dans la boîte de cohérence qui existe déjà, il sert l'**estimation IA** (l'alerte tombe avant l'enregistrement), le **formulaire d'ajout** et la **modale de modification** — donc les lignes **déjà enregistrées** préviennent dès qu'on les ouvre. *Deux copies auraient fini avec deux seuils, et on ne saurait plus lequel croire.*

**⛔ ET ÇA PRÉVIENT SANS BLOQUER**, comme son voisin : on n'empêche pas d'enregistrer. *Perdre ce que quelqu'un a noté coûte plus cher qu'une ligne à corriger* (règle d'or #3, **R29**).

**📣 RÈGLE D'OR #11 — L'AIDE SEULE, ni pop-up ni point rouge, et c'est argumenté.** Rien n'apparaît en usage normal : l'alerte ne se montre que sur une ligne **déjà fausse**, et aucun repère n'a bougé. ⛔ Un point rouge enverrait chercher sur un onglet où il n'y a rien à voir (la décision de ft-v1099). ⛔ Et une pop-up dirait *« vos aliments pouvaient être impossibles »* — **une alarme rétroactive pour un trou qu'on vient de fermer** (**R25**). Mais l'aide `?` porte la question qu'on se posera **devant** l'alerte : pourquoi c'est de la physique et pas un avis, pourquoi l'IA produit ça, et pourquoi l'app ne corrige pas à sa place.

**⚠️⚠️ ET UN AVEU QUI COMPTE PLUS QUE LE CORRECTIF : LE CODE EST PARTI SUR `master` DANS UN COMMIT INTITULÉ « journal de partage ».** Un `git add -A`, lancé pour publier ma ligne du journal de partage, a emporté `app.js` avec lui — donc le correctif a été **poussé sans bump de `sw.js`**, sous un message qui **ment sur son contenu**, et **avant que la suite complète soit verte**. 👉 ***Un `git add -A` ne dit pas ce qu'il ajoute ; c'est à moi de le savoir.*** Corrigé ici (cache bumpé, message honnête), **et l'histoire n'est pas réécrite** : ce qui est poussé est poussé, on le dit (**R23**).

**⚠️ ET UN DE MES TÉMOINS A ROUGI SUR DU CODE SAIN — §31, encore.** Il vérifiait que l'alerte *« ne propose aucun chiffre de remplacement »* en testant la chaîne que ma sonde renvoyait **tronquée à 80 caractères** pour l'affichage : la phrase cherchée vit dans le **second paragraphe**, coupé. *Ce qu'on renvoie pour LIRE et ce qu'on renvoie pour MESURER ne sont pas la même chose* — les verdicts se calculent maintenant **dans la page**, sur le texte complet.

**⏭️ CE QUE ÇA NE COUVRE PAS, dit plutôt que sous-entendu** : l'alerte vit **dans les formulaires**, pas dans la **liste** du journal — une ligne impossible déjà enregistrée ne se signale que quand on l'ouvre. Mettre des avertissements dans la liste est une autre décision (bruit permanent, **R24**), non prise ici. ⚠️ Et la ligne de Michel, elle, **est toujours fausse dans son journal** : l'app la lui signale désormais, elle ne la corrige pas.

Tests : **parcours 2413/2413** (+12, bloc **CCXII**) ⚠️ *mesuré sur l'arbre **FUSIONNÉ** avec le contre-audit de session-B*, calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **CONTRÔLE NÉGATIF joué contre le code d'avant : 3 rouges** — le cas de Michel, les 300 g dans 100 g et les 33 g dans 30 g passaient **tous en silence**. ⛔⛔ **Et les 5 cas légitimes sont verts DES DEUX CÔTÉS** : c'est ce qui prouve que le bloc mesure le correctif et non « tout a changé ». ⭐ **Trois d'entre eux ne sont pas du remplissage** : l'huile (100 % lipides) et le sucre (100 % glucides) sont **à la limite physique** — ce sont eux qui interdisent d'écrire la règle avec un pourcentage ; le miel **en ml** est celui qui interdit d'oublier l'unité. ⭐ Un témoin de plus vérifie que le propriétaire **existe**, sinon les 8 cas seraient verts à vide ; un autre que le contrôle des **calories** n'a pas été désarmé au passage. Fichiers : `app.js`, `screens.js`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1103. |

**ft-v1102 — 📉 LA JOURNÉE D'ABORD, L'ÉVOLUTION ENSUITE — ET UNE PENTE QUI MESURAIT LA BALANCE, PAS LE CORPS** — décision produit relayée par Michel, en 20 points, se terminant par *« si aucune contradiction technique importante n'apparaît : implémenter la refonte »*. **Aucune n'est apparue — mais un défaut ancien, lui, est sorti en chemin, et il vaut plus que la refonte.**

**⛔⛔ LE DÉFAUT DU JOUR N'ÉTAIT PAS AU PROGRAMME, ET IL PARTAIT DANS LE CONTEXTE DE MILO.** `linearRegression` recevait, aux **trois** endroits qui l'appelaient, l'**INDEX** du point comme abscisse (`map((p,i)=>({x:i,…}))`), puis le code écrivait `slope*7` en croyant lire *« par semaine »*. Il lisait **« sur 7 PESÉES »**. Mesuré, à évolution réelle **strictement identique** (+0,20 kg/sem) : tous les jours → **+0,20** · tous les 2 jours → **+0,40** · tous les 3 jours → **+0,60** · **une fois par semaine → +1,40**. 👉 ***Le chiffre mesurait la fréquence de la balance, pas le corps*** — et quelqu'un qui se pèse le dimanche voyait sa tendance **multipliée par sept**, à l'écran **et** dans ce que Milo recevait.

**⭐⭐ ET ft-v1100 N'A PAS CRÉÉ CE DÉFAUT, IL L'A RÉVÉLÉ.** Tant que le juge disait *« ✓ dans la bonne direction »* dès que le poids montait, une pente ×7 restait **dans la bonne direction**, donc invisible. Depuis qu'on compare à une **plage chiffrée**, elle produit un `⚠ PLUS RAPIDE` sur quelqu'un de parfaitement dans sa cible. ⚠️ **Le premier réflexe devant ce rouge était d'aller « réparer » le nouveau juge** — c'est-à-dire le seul morceau du système qui venait de dire la vérité. *Un garde-fou juste révèle les mesures fausses qu'il consomme.* Nouvelle famille **§38** de `BUGS.md`.

**⛔ ON NE TOUCHE PAS À `linearRegression` : elle n'a jamais menti.** Quand on **trace** une droite, l'index EST la bonne abscisse ; c'est seulement quand on **annonce un rythme** qu'il devient faux. Un **seul propriétaire** (`penteKgParSemaine`, **R2**), lu par l'écran Progrès, le moteur de tendance **et** le contexte de Milo — et un témoin permanent refuse tout nouveau `slope*7` sur un index hors de ce propriétaire. ⚠️ Garde qu'on n'avait pas avant : **deux pesées le même jour** rendent `0`, pas une pente infinie.

**⛔⛔ LA REFONTE : « X KCAL RESTANTES » CESSE D'ÊTRE L'INFORMATION DOMINANTE — et le calcul ne change pas d'une virgule.** La formulation crée une **dette** (*« il me reste 800 → je dois manger 800 »*) et, surtout, **un nombre de calories ne se mange pas**. Le même reste continue d'alimenter *« ce qu'il te reste, en vrai »* juste dessous, qui le traduit en **aliments réels**. *On déplace le nombre là où il sert, on ne le supprime pas.* À sa place, en discret, le **type de journée** (*« 🍚 Jour de séance »*), qui explique pourquoi les cibles ne sont pas celles d'hier ; **rien** s'il n'y a pas de cyclage. ⭐ Et la **cible** n'est plus écrite qu'**une fois**, en en-tête : elle l'était **deux fois**, à deux endroits et dans deux mises en forme.

**⛔⛔ ET LE « PRATIQUEMENT ATTEINT » DEMANDÉ N'A PAS ÉTÉ ÉCRIT, exprès.** *« Pratiquement »* exige un **seuil** (95 % ? 98 %) qu'**aucune source du projet ne fournit** : le poser serait inventer la tolérance que la consigne interdisait par ailleurs. ⭐ Ce qui existe et répond à la vraie question (*« pourquoi ce chiffre-là aujourd'hui ? »*) est le **cyclage** mesuré en ft-v1098 : chaque anneau dit ce que le jour fait à SA macro — *cible haute · jour de séance*, *la même tous les jours* pour les protéines, ou **atteint**, seul état coloré. **Aucun rouge d'échec** en face d'une macro (P21).

**📈 LA CARTE « TON ÉVOLUTION » CROISE POIDS + CHARGES + REPAS SUR 14 JOURS, EN 0 APPEL API** — mesuré : **0 requête sortante** au rendu, dans les 4 états. ⛔ **Les charges se comparent à répétitions ÉGALES**, et c'est mesuré : un changement de schéma déplace le e1RM de **+26 %** à force identique, quand la quantification du matériel n'en produit que **1,78 %** — *aucun seuil en pourcentage ne peut donc trancher, seule la règle de comparaison le peut.* ⛔ Une **semaine allégée** est reconnue et dite, pas coloriée comme une régression.

**⛔⛔ ET DANS « DONNÉES INSUFFISANTES » : AUCUNE FLÈCHE, AUCUN POURCENTAGE.** *Une flèche est déjà une conclusion.* La carte **nomme ce qui manque** et s'arrête là — sans jamais réclamer de remplir (P21). ⛔ **Milo n'apparaît que dans l'état AMBIGU**, sur appui volontaire : s'il était là en permanence, il dirait que l'analyse locale ne suffit pas — or elle suffit **trois cas sur quatre**. Il reçoit alors les **tendances**, jamais le journal alimentaire.

**⚠️⚠️ ET J'AI RECRÉÉ DEUX FOIS LE DOUBLON QUE JE VENAIS DE RETIRER.** Sous la barre, j'ai réécrit `Cible du jour : …` alors que l'en-tête la porte déjà — puis, en corrigeant, je l'ai remise **en repli** pour le cas sans cyclage. *Le deuxième réflexe était le même que le premier : combler un vide.* Un espace vide n'est pas un défaut ; **une information écrite deux fois en est un** (**R2**).

**⭐ LA MESURE AVANT/APRÈS, SUR LA MÊME FIXTURE RICHE** : onglet **1 939 → 2 140 px** (le plafond posé était *« ne pas revenir à 2 600 »*) · *« Noter ce que je mange »* **525 → 525 px, inchangé au pixel** · carte du jour **445 → 445 px, inchangée**, en portant **4 informations de plus**. ⛔ La carte est placée **après** le bouton « noter » : en tête, elle l'aurait repoussé de **148 px** — *on ouvre Nutrition pour enregistrer un repas, pas pour relire une tendance de 14 jours à chaque aliment ajouté.*

**📣 RÈGLE D'OR #11 — les cinq points, et la pop-up est MÉRITÉE** : *un repère a bougé*, dans sa forme la plus nette. « X kcal restantes » était **le chiffre lu en premier depuis des mois**, et **la lecture la plus naturelle serait « ils ont supprimé mon compteur »**. `WHATS_NEW` **v67** · point rouge `nutri-evolution` · **4 entrées** d'aide `?` (où est parti le chiffre · les 14 jours et les reps égales · le coût nul · pourquoi pas de « presque ») · aide détaillée · **46ᵉ diapo du Guide, sans image exprès** — et pour **deux** raisons : une capture montrerait des grammes qui ne sont pas ceux du lecteur, **et** un seul des quatre états, or celui qu'il verra dépend de ce qu'il a noté. ⭐ **Les 4 surfaces mesurées à l'écran, pas relues dans le fichier** : pop-up ouverte pour un compte « a vu v66 », point rouge bien sur `nb-nutrition`, les 4 entrées d'aide rendues, diapo en position 1/46 sans image, **0 erreur JS**.

**⚠️⚠️ ET LA CAPTURE A ATTRAPÉ CE QU'AUCUN TEST NE REGARDAIT : MON AIDE NOMMAIT DES LIBELLÉS QUI N'EXISTENT PLUS.** La pop-up et l'aide `?` annonçaient *« cible haute · jour de séance »* et *« la même tous les jours »* — deux libellés d'une version **intermédiaire** de `_etatMacro`. L'écran, lui, affiche *« ↑ jour de séance »* et *« identique chaque jour »*. 👉 ***Une aide qui nomme un repère inexistant est pire qu'une aide absente, parce qu'on la croit*** (la leçon de ft-v1025, famille **§31**). ⛔ Le témoin ajouté **ne fige aucune formulation** : il extrait les libellés que `_etatMacro` produit **réellement** et refuse tout libellé cité entre guillemets qui n'y soit pas. ⚠️⚠️ **Et il a fallu le réparer DEUX FOIS avant qu'il vaille quelque chose** : ① sa fenêtre se fermait au **premier `};`** — celui de la 1ʳᵉ ligne — donc il ne voyait **qu'un libellé sur quatre** ; ② puis il comparait par **inclusion**, si bien que *« cible haute · jour de séance »* passait au vert en s'appuyant sur le *« jour de séance »* qu'il contient. *Une comparaison par inclusion laisse toujours passer le sur-texte, c'est-à-dire exactement ce qu'on cherche.* Éprouvé dans les deux sens : **0 orphelin** aujourd'hui, **2** dès que le libellé périmé est réinjecté.

**⚠️⚠️ DEUX TÉMOINS EXISTANTS ONT ROUGI SUR MA LIVRAISON, ET ILS N'AVAIENT PAS RAISON DE LA MÊME FAÇON — c'est ce qui rend la paire instructive.**
- **Le premier avait raison, et c'était ma faute** : *« les NOUVELLES pop-ups annoncent sans expliquer (≤ 600 caractères) »* — la mienne en faisait **662**. J'avais écrit **trois** points numérotés, dont un (les libellés sous les anneaux) qui **n'annonce aucun repère déplacé** : c'est exactement ce que l'aide `?` explique. Retiré → **497**. *La pop-up ANNONCE, l'aide EXPLIQUE* (**R25**) — et la règle a mordu sur moi le jour même où je l'invoquais.
- **Le second était un FAUX ROUGE, et sa cause est belle** : le témoin de ft-v1071 interdit qu'une pop-up postérieure à la v65 **reparle des pas**. Son motif était `\bpas\b` — qui attrape la **négation française**. Ma pop-up de nutrition nie **cinq fois** (*« il n'a **pas** disparu »*, *« ne se mange **pas** »*, *« **pas** assez de données »*) et **ne dit pas un mot des pas**. 👉 ***Un motif qui capture le mot le plus fréquent de la langue ne mesure pas un sujet, il mesure la longueur du texte.*** Re-visé sur le sens **nominal** (un nombre ou un déterminant devant « pas ») — ⛔ **et éprouvé pour ne pas être désarmé** : il reste rouge sur *« 15 000 pas »*, *« tes pas »*, *« 6 000 pas »*, *« podomètre »*, *« steps »*, et vert sur deux textes qui ne font que nier. ⚠️ **Il dormait depuis ft-v1071** : il fallait une pop-up assez longue et assez négative pour le réveiller.

**⚠️⚠️ ET LA FAMILLE §31 EST TOMBÉE TROIS FOIS DANS CETTE SEULE LIVRAISON — dont deux fois sur des témoins que je venais d'écrire.** Le 3ᵉ cas est le plus net : mon propre témoin *« aucune tolérance inventée sous les anneaux »* a rougi… sur l'**entrée d'aide** que je venais d'ajouter, laquelle **cite** *« presque atteint »* pour dire qu'on ne l'affiche jamais. Il retirait pourtant déjà les **commentaires** — ⚠️ *mais une CHAÎNE de texte peut expliquer une interdiction, elle aussi.* 👉 Sa garantie n'a jamais été *« ce mot n'apparaît nulle part dans le fichier »*, c'est *« aucune tolérance ne s'écrit SOUS LES ANNEAUX »* : il ne lit plus que `_etatMacro`, **le seul endroit qui écrit là**. ⛔ Et un témoin de plus vérifie que ce bloc est bien trouvé — sinon le premier serait vert en ne lisant rien.

**⚠️⚠️ ET MA SONDE DES SURFACES A ROUGI SUR MON PROPRE TEXTE — 9ᵉ fois de la semaine.** Elle cherchait le mot *« presque atteint »* dans l'aide… qui le **cite** pour dire qu'on ne l'affiche jamais. *Chercher un mot interdit dans le texte qui EXPLIQUE l'interdiction ne mesure rien.* Re-visée sur ce que l'aide doit **faire** (expliquer l'absence) ; la vraie garantie, elle, est épinglée dans le rendu des anneaux par le bloc CCX.

**⏭️ CE QUE CETTE LIVRAISON NE CONTIENT PAS, ET IL FAUT LE LIRE** : le **journal de mensurations** (§10 de la décision) et les **repas habituels** (§16) ne sont **pas** construits — ils n'ont pas été commencés, pas différés à moitié. ⚠️ **Et une vérification demandée n'a PAS pu être faite ici** : *« le déploiement réel sur Safari/iPhone »*. Le conteneur n'a que Chromium ; **c'est à Michel de l'ouvrir sur son téléphone**. *Une vérification annoncée mais non faite vaut moins que pas de vérification du tout.*
Tests : **parcours 2400/2400** (+21 de moi, bloc **CCXI** · +8 de session-B — ⚠️ **2ᵉ collision de numéro dans la même livraison** : réservé CCVII, renuméroté CCX, puis **CCXI** parce que session-B a publié son propre CCX pendant la fusion. *Le publié le premier garde son numéro* — c'est la seule règle qui ne demande de discuter avec personne — ⚠️ mesuré sur l'arbre **FUSIONNÉ** avec les ft-v1099/1101 **et la cartographie** de session-B ; ⚠️ **livrée en ft-v1102 et non 1101** : session-B avait publié la première, *le publié le premier garde son numéro*), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **Le témoin qui porte la demande est celui du COÛT** : 0 requête sortante au rendu, dans les 4 états — sinon la carte serait belle et la promesse fausse. ⭐⭐ **Les 4 états sortent de VRAIES fixtures**, jamais de HTML injecté : *si un état ne sort d'aucune donnée plausible, c'est que sa règle est inatteignable.* ⭐ **Et trois témoins n'existent que pour empêcher les autres d'être verts sur du vide** : l'état qui conclut porte bien des flèches (sinon « aucune flèche » serait vrai partout), le motif du « presque » sait attraper la formulation refusée, et l'état « atteint » existe bien. **CONTRÔLE NÉGATIF sur la pente : rouge, et le détail imprimé EST le bug** — même série de pesées, `+1,40 kg/sem` contre l'ancien code, `+0,20` contre celui-ci. Fichiers : `state.js`, `tracking.js`, `coach.js`, `screens.js`, `app.js`, `index.html`, `constants.js`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1102. |

**ft-v1101 — 🏁 UN CYCLE TERMINÉ NE LE DISAIT JAMAIS — NI À L'ÉCRAN, NI À MILO** — Michel : *« continue stp »*. 2ᵉ passe, **et elle commence par une dette** : j'avais annoncé le cycle de force *« non mesuré »* en ft-v1099 parce que mes sondes s'étaient trompées de champ. *Une sonde qui ne mord pas ne prouve pas qu'il n'y a rien.* Repris avec une fixture **lue dans `startCycle`**, pas devinée.

**⛔⛔ LE DÉFAUT TIENT DANS UNE LIGNE, ET ELLE EST JUSTE À MOITIÉ.** `getCurrentCycleWeek` plafonne à `weeks` — c'est **correct** pour dessiner une barre de progression, et **faux pour tout le reste** : passé la fin, la fonction rend **éternellement la dernière semaine**. 👉 **Mesuré** : un cycle fini depuis **1 jour**, **1 an** et **six ans** rend un écran ***rigoureusement identique*** à celui de la dernière semaine — *« Semaine 12 / 12 — Décharge, 55 % 1RM · 2 × 5 reps »*, présenté comme la consigne du jour.

**⛔⛔ ET CE N'EST PAS QU'UN AFFICHAGE — C'EST LÀ QUE ÇA DEVIENT SÉRIEUX.** La même valeur partait dans le contexte de Milo : *« Actif - Semaine 12/12 - Phase Décharge »*. ***Il prescrivait donc une semaine de décharge sur la foi d'un fait faux sur la personne*** — exactement ce que **R4** et **R10** interdisent. *Le cycle de force vit dans Menu → Outils : on n'y passe pas tous les jours, et c'est précisément le genre d'écran où un état faux peut durer des mois sans que personne le remarque.*

**⭐ UN SEUL PROPRIÉTAIRE DE LA QUESTION (R2)** — `cycleTermine()`, lu par **l'écran** et par **`buildCoachContext`**. *Deux copies de « ce cycle est-il fini ? » auraient divergé au premier retouchage*, et c'est déjà arrivé trois fois cette semaine.

**⚠️ ON NE CLÔTURE PAS TOUT SEUL (R29).** `S.cycle` porte les **1RM de départ** et les **objectifs** de la personne : c'est son travail. L'app le **dit** — *« il s'est achevé il y a 53 semaines »* — et lui laisse la décision, avec la phrase qui compte : *« rien n'est supprimé tant que tu ne clôtures pas »*.

**⛔⛔ ET LE TÉMOIN QUI PORTE TOUT LE RISQUE N'EST PAS CELUI DU CYCLE FINI.** C'est celui de la **DERNIÈRE SEMAINE**, qui ne doit **rien** afficher : *un bandeau « terminé » pendant la semaine de décharge serait faux, et décourageant au pire moment.* Un second témoin vérifie que les deux états **diffèrent** — sinon la mesure ne prouve rien.

**⏭️ CINQ FAMILLES ONT RENDU DU VIDE, et c'est écrit pour que personne ne refasse la chasse (R23).** ① Le **texte libre de la personne** est **bien échappé partout** : un nom d'exercice piégé rendu sur 5 écrans, **0 script exécuté**, 0 balise injectée — ⭐ *et le contrôle prouve que le nom était bien **affiché**, sans quoi le vert ne voudrait rien dire.* ② Le **timer de repos** s'appuie sur `Date.now()`, pas sur un compteur : il **résiste au sommeil de l'app**. ③ Les **séries spéciales** comptent pareil partout — échauffement et « W » hors volume, drop dedans, et un échauffement ne fait jamais record (1140 attendu, 1140 enregistré). ④ La **file de synchro** ne renvoie que les séances marquées `synced===false`. ⑤ Le **quota gratuit** reste gardé par `_premiumPending` depuis ft-v446.

**⚠️⚠️ ET QUATRE DE MES SONDES N'ONT RIEN MESURÉ AVANT D'ÊTRE RÉPARÉES — toujours au même signe.** `window._demoMode=true` **court-circuite `syncSheets`** dès sa première ligne · `S.connected` manquait, donc la fin de séance n'envoyait pas · la fixture du cycle employait `rm1s` là où le code lit `exercises` · et j'ai cherché le **mot** « cycle » dans le contexte de Milo — *qui en est plein* — au lieu de ses **valeurs**. 👉 ***Les quatre se reconnaissent au même signe : un résultat identique des deux côtés.*** ⭐ **Et la dernière a failli me faire annoncer un trou R4 qui n'existe pas** : le cycle **atteint bien** Milo (semaine et phase, vérifié avec un témoin de contrôle sur une donnée qu'on sait transmise). *Un détecteur mal visé ne rend pas un faux négatif : il rend un faux POSITIF, et celui-là se publie.*

**📣 RÈGLE D'OR #11 — L'AIDE DÉTAILLÉE, ni pop-up ni point rouge.** Un bandeau **apparaît**, et il propose une action — mais **uniquement** chez quelqu'un dont le cycle est déjà fini, c'est-à-dire là où l'écran disait quelque chose de faux. ⛔ Le cycle de force **n'est pas un onglet** : un point rouge n'a nulle part où se poser. Et une pop-up dirait *« votre cycle vous prescrivait n'importe quoi »* — **une alarme rétroactive pour un trou qu'on vient de combler** (**R25**).

Tests : **parcours 2365/2365** (+12, bloc **CCVIII**) ⚠️ *mesuré sur l'arbre **FUSIONNÉ** avec le ft-v1100 de session-A*, calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **CONTRÔLE NÉGATIF joué contre l'ancien code : 7 rouges** — la sonde ne distingue pas les deux états · le cycle fini ne dit rien · même un an après · Milo reçoit toujours « Actif - Semaine 12/12 » · il ne reçoit ni « TERMINÉ » ni la consigne · aucun propriétaire commun · aucune aide. ⛔ **Et les 5 verts de ce contrôle sont exactement ceux qui DEVAIENT rester verts** : les deux témoins « pas de bandeau », la non-régression du cycle **en cours** chez Milo, le fait que l'app ne clôture rien, et 0 erreur JS. Fichiers : `tracking.js`, `coach.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1101. |

**ft-v1100 — ⚖️ UNE SEULE SOURCE POUR LES PLAGES DE POIDS** — GPT valide la direction du moteur de tendance et **tranche** : *« corriger la contradiction des plages AVANT de construire le moteur »*. **C'était un défaut mesuré, pas une brique à concevoir — donc c'est le seul code touché.**

**⛔⛔ CE QUI ÉTAIT CASSÉ, MESURÉ DANS UN NAVIGATEUR** : **+1,6 kg/semaine** en objectif « prise de muscle » partait vers Milo comme *« ✓ dans la bonne direction »*, pendant que l'écran affichait **juste à côté** que l'évolution attendue est *« +0.1 à +0.3 kg/sem »*. ***Cinq fois la borne haute.*** Et une **perte à −0,21** (plus lente que la plage −0.3/−0.7) recevait le même « ✓ ».

**👉 LA CAUSE EST STRUCTURELLE : une seule des six bornes était une DONNÉE.** `_GOAL_TREND_RECOMP` vivait dans `state.js` et était lue des deux côtés ; **les cinq autres n'existaient qu'en PROSE**, à l'intérieur de la chaîne `goalDir` d'un affichage — donc **aucun code ne pouvait les lire** — et `coach.js` appliquait des seuils **écrits ailleurs** (`>0.05`, `<-0.1`, `|x|<0.2`). C'est **R4** (l'info reste dans le TEXTE et n'atteint jamais la DONNÉE) doublé de **R2** (deux sources pour une même règle, qui ont divergé — la seule question était quand).

**⛔ LES VALEURS NE SONT PAS INVENTÉES, ELLES SONT TRANSCRITES** — au caractère près, depuis les phrases que l'écran affiche depuis toujours. ⚠️ **Et j'avais « amélioré » au passage** : la prose écrit `(−0.3–0.7 kg/sem)` avec un seul signe moins, j'en avais mis deux. **Deux témoins existants l'ont vu.** *Transcrire, c'est copier — pas corriger en chemin.* Le texte de l'écran est désormais **dérivé** de la table, jamais réécrit à côté.

**⛔ ET LA COULEUR SUIVAIT SA PROPRE RÈGLE** : elle passait au vert dès que le poids montait en objectif « muscle ». Donc **+1,6 kg/sem s'affichait en VERT sous une phrase annonçant « +0.1 à +0.3 »**. *La couleur disait le contraire du texte qu'elle surlignait.*

**⭐⭐ ET DEUX DÉFAUTS DE MA PROPRE CORRECTION ONT ÉTÉ TROUVÉS PAR DES TÉMOINS EXISTANTS, pas par relecture.** C'est la vraie leçon de cette version :
- **①** Mon premier jet écrivait *« ⚠ PLUS RAPIDE »* pour une perte à −0,21. **Numériquement exact** (−0,21 > −0,3), **factuellement faux** : perdre 0,21 kg par semaine, c'est perdre **plus LENTEMENT**. 👉 ***Sur une plage négative, « au-dessus » veut dire « moins ».***
- **②** Puis, un cran plus profond : la plage de la **recomposition finit à ZÉRO**. À **+0,7 kg/sem**, la personne **PREND** du poids — elle ne « perd pas plus lentement ». *Au-delà de zéro, on n'est plus sur le même axe, on va dans l'autre sens.* Le vocabulaire « plus vite / plus lent » n'a de sens que si la valeur reste **du même côté de zéro** que la plage ; sinon on garde le mot géométrique, qui reste vrai.

👉 ***Le mot ne se lit pas sur le nombre, il se lit sur le SENS de l'objectif*** — et c'est précisément ce genre de phrase qu'on envoie ensuite à Milo comme un fait.

**⛔ UN TÉMOIN PERMANENT REFUSE TOUTE PLAGE RÉÉCRITE EN DUR hors de `state.js`.** C'est la rechute à empêcher : sans lui, quelqu'un remettra un jour « +0.1–0.3 » dans une phrase, et on y retournera (**R30** — un retrait se fige par un test).

**⚠️ CE QUE ÇA NE PROUVE PAS, ET IL FAUT LE DIRE** : ce correctif change ce que Milo **reçoit**. Le drapeau est vérifié en local — c'est fait — mais **ce que Milo en DIT** demanderait une passe du **banc d'essai**, qui coûte des appels réels (**R34**). C'est une décision de Michel, pas la mienne.

**📐 ET CINQ LIVRABLES DE SPÉCIFICATION, SANS UNE LIGNE DE CODE** (`docs/NUTRITION-MOTEUR-TENDANCE.md`, + un PDF autonome) :
- **⭐⭐ LE SEUIL DE BRUIT DU e1RM — la mesure retourne la question.** GPT demandait *« ±1 %, ±2 % ou ±3 % ? — mesure »*. Mesuré : **le e1RM ne peut pas varier de moins de 1,8 %** (la charge bouge par pas de 2,5 kg, les reps sont des entiers), donc **un seuil à ±1 % ne filtre rien**. ⛔⛔ **Et le vrai bruit n'est pas la granularité, c'est le SCHÉMA DE REPS** : à force identique, passer de `100×3` à `100×10` fait bouger le e1RM de **+26 %**. *Le bruit est 3 à 6 fois plus grand que le signal cherché.* 👉 ***Aucun seuil en pourcentage ne peut marcher*** : assez grand pour rejeter un changement de format, il rejetterait toutes les vraies progressions. La règle qui marche — mesurée — est de **comparer à nombre de répétitions ÉGAL** (bruit **0,0 %** ; ±1 rep en introduit déjà 4 %), et elle ne demande **aucun seuil**.
- **⭐ LA PROPOSITION VISUELLE EST L'ÉCRAN RÉEL**, pas une maquette dessinée à côté : les 4 états sont **injectés dans l'app** avec sa feuille de style et capturés. ⚠️ **Une pop-up de démarrage couvrait la première série d'images** — on ferme les overlays **et on vérifie qu'il n'en reste aucun**, sinon on photographie une pop-up en croyant juger une carte.
- **⭐⭐ ET GPT AVAIT RAISON DE REFUSER MON AFFIRMATION SUR LA HAUTEUR.** Mesuré : la carte **pleine** pousse « Noter ce que je mange » de **+220 px** (525 → 745). La **compacte** coûte **+85 px**, la version d'une ligne **+58 px** mais perd la fenêtre et le remplissage — *on retombe sur un verdict sans preuve*. **La compacte est retenue**, avec « Voir le détail » pour la version longue.
- **Le journal des mensurations** : modèle minimal (date · quoi · cm · source), la valeur courante **reste où elle est** (elle est lue par la composition corporelle, le profil et Milo), **rien n'est rétro-daté** — donner une date à une valeur qui n'en a pas serait fabriquer un fait.
- **« 800 kcal restantes »** : 3 alternatives **rendues dans la vraie carte**, comparées. Recommandation : *« il te reste 1 462 kcal **de marge** »* — *une marge est une permission, un reste est une obligation* — parce qu'elle traite le **mot** sans casser la ligne du dessous, qui traduit ce nombre en aliments réels. ⚠️ **Et c'est un jugement, pas une mesure** : aucune mesure ne dit comment une phrase est lue.

**📣 RÈGLE D'OR #11 — RIEN, ET C'EST ARGUMENTÉ.** Aucune nouveauté à découvrir, rien à faire, aucun repère déplacé : le seul changement visible est **une phrase de l'écran Progrès qui devient exacte** et une couleur qui cesse de contredire son texte. *Une pop-up disant « on a corrigé une incohérence interne » serait du bruit* (R19/R25). ⚠️ **Un cas mérite d'être surveillé** : quelqu'un en prise de muscle rapide verra sa tendance passer du vert à l'orange — elle était fausse, elle devient juste ; si Michel le remarque, c'est le journal qui l'explique.
Tests : **parcours 2353/2353** (+16, bloc **CCVI**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 12/12, données classées 0 trou. ⭐⭐ **Le témoin qui porte la version n'est pas « 1,6 est hors plage » — c'est l'ACCORD** : sur la même pente, l'écran et Milo doivent dire la même chose. ⭐ **Et 4 témoins de ft-v1044 ont été RE-VISÉS, sans qu'une seule exigence soit affaiblie** : ils figeaient la formulation (« dans la bonne direction »), ils exigent maintenant l'accord des deux côtés — c'est **plus fort**. **7ᵉ fois pour la famille §31 de `BUGS.md`.** ⚠️ **Un de mes propres témoins était faux aussi** : il attendait `pos==='en-dessous'` pour une perte à −0,05, alors que −0,05 est **géométriquement au-dessus** de −0,3 — *je confondais déjà la position et le rythme, c'est-à-dire exactement le défaut que ce bloc a servi à trouver.* Fichiers : `state.js`, `tracking.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/NUTRITION-MOTEUR-TENDANCE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1100. |

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

Tests : **parcours 2328/2328** (+18, bloc **CCVII**), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, données classées 0 trou. ⭐⭐ **CONTRÔLE NÉGATIF joué contre l'ancien code : 8 rouges** — la question n'apparaît pas · la mémoire tombe à **0 série faite** · le **disque** est réécrit · la jumelle « à jours » ne demande rien · le profil restauré garde **500 / 20 / 999 999** · **TDEE −2 433** · Milo reçoit « 500 ans » · le badge dit « 5 PRs battus ». ⛔⛔ **Et les 6 verts de ce contrôle sont exactement ceux qui DEVAIENT rester verts** : les deux témoins de mise en place, le témoin de comparaison manuel, le profil valide, et la non-régression. *Un contrôle négatif où tout rougit ne prouve rien non plus — il prouve qu'on a cassé la fonction.* ⭐ **Trois témoins n'existent que pour empêcher les autres d'être verts sur du vide** : le cas sans travail ne doit poser **aucune** question, le témoin doit avoir **3 séries faites** à perdre, et un profil **valide** (42 ans, 181 cm, 150 s) doit toujours passer. Fichiers : `log.js`, `state.js`, `setup.js`, `app.js`, `screens.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `BUGS.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-DE-PARTAGE.md`. sw.js ft-v1099. |

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
