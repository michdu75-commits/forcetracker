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
12. **📓 Tenir TOUS les fichiers de suivi à jour EN TEMPS RÉEL**, dans le même mouvement que le bump `sw.js` + commit : `CLAUDE.md` (1 ligne : quoi + pourquoi + `ft-vNN`), `docs/INVENTAIRE.md` régénéré, fichiers de chantier. → `docs/REGLES-OR.md#12`

**⚙️ CHARGEMENT AUTOMATIQUE** — la ligne ci-dessous n'est pas décorative : la syntaxe `@fichier` fait
**importer** le document par Claude Code au démarrage, comme s'il était écrit ici. Un seul fichier est
importé, volontairement : les **règles de construction**, qui s'appliquent à *toutes* les tâches.
⚠️ **Ne pas en ajouter par réflexe.** `CLAUDE.md` fait déjà ~25 700 mots ; importer les autres docs de
gouvernance ajouterait ~13 800 mots (+54 %) à chaque session — et **plus on charge, moins chaque règle
pèse** (c'est la règle R20 elle-même). Les autres docs se lisent **à la demande**, c'est le bon régime.

@docs/REGLES-ARCHITECTURE.md

**📜 Documents de gouvernance (à respecter) :**
- ⚡ **`docs/REGLES-OR.md`** — **les 12 règles d'or EN ENTIER** (le pourquoi, les cas vécus, les garde-fous). `CLAUDE.md` n'en porte que la version d'une ligne depuis la scission du 28/07/2026 : ce fichier faisait **33 000 mots** relus à chaque session, dont **79 % de journal**. *Une règle noyée dans un fichier qu'on ne lit plus n'est plus une règle.* Cohérence des deux fichiers vérifiée par `python3 tools/check_regles.py`.
- 🌟 **`docs/VISION-FORCE-TRACKER.md`** — **l'ESPRIT / le POURQUOI du produit** : *« Force Tracker n'est pas une IA, c'est une mémoire sportive intelligente »* · *« il ne te dit pas qui tu dois devenir, il se souvient de qui tu es devenu »*. Le sportif ne repart jamais de zéro ; la vie avant le programme ; observer avant conseiller ; adapter avant interdire. **Question de référence avant toute feature : « est-ce que cela renforce l'esprit Force Tracker ? »** La Constitution dit le *comment*, la Vision dit le *pourquoi*.
- 👥 **`docs/PERSONAS-FONDATEURS.md`** — **à lire juste après la Vision** : les personas ne sont plus des profils de test, ce sont les **dimensions du projet**. **Michel** = Vision & Architecture (le fondateur, à part). **Christophe** = Terrain & Métier (→ VM). **Tatiana** = Personnalisation, pas de présupposés (→ VC). **Emma** = Physiologie & Ressenti (→ VC). Relie chaque évolution technique à un besoin humain concret. Règle : un nouveau persona n'entre que s'il ouvre une **dimension** nouvelle. *(Idée & conception : Michel.)*
- 🧩 **`docs/MODELE-METIER.md`** — **le LANGAGE COMMUN du produit** (v0.1, vivant) : les objets métier que TOUS les modules partagent (Athlète · Objectif · Programme · Cycle · Séance · Bloc · Exercice · Série · Exercice-bibliothèque) + transversaux (Méthode · Consigne · Notation) + la grammaire + le principe **PLANIFIÉ vs RÉALISÉ**. Cap posé par Michel (21/07/2026) : penser « objets métier », pas « fonctionnalités ». Se distille des vrais programmes, reste vivant. Lié au chantier structures (`PARSER-STRUCTURES.md`).
- 📍 **`docs/CONTEXTE-ACTUEL.md`** — **À LIRE EN PREMIER avant toute nouvelle tâche** (1 page) : version, branche, brique active, dernières décisions, prochaine étape, blocages. Le raccourci pour reprendre le contexte sans tout relire.
- 🏛️ **`docs/REGLES-ARCHITECTURE.md`** — **COMMENT ON CONSTRUIT** (créé 27/07/2026 sur une proposition de GPT, qui pointait un vrai manque : les règles de conception existaient mais **éparpillées**). **31 règles** rassemblées, chacune née d'un **événement réel** (bug, décision, galère) : les **données** (source de vérité unique · ne jamais dupliquer · comportement observable *différé mais nommable* · **l'info doit descendre jusqu'à la DONNÉE pas rester dans le TEXTE** · l'audit à l'envers) · les **décisions** (une seule voix, construite **émergentiellement** · le cerveau distribué → **le prompt est le dernier levier** · un prompt ne compense jamais une donnée absente · le **modèle** est une variable structurelle · permissions **bornées** · sécurité > vitesse · cohérence > réactivité) · la **construction** (enrichir l'existant · un comportement copié peut devenir faux · tout chemin de fermeture pose son marqueur · local-first · chaque bug devient un test · vérifier le **déploiement** pas le push) · la **gouvernance** (légère · prompt maigre / doc jardinée · critère d'entrée · retours à 3 paliers). ⚠️ **Ne pas confondre avec la Constitution** : celle-ci dit comment Milo se comporte envers la **personne** (éthique) ; celui-là dit comment on **construit le système**. En cas de conflit, la Constitution l'emporte.
- **`docs/PROCESSUS-DEVELOPPEMENT.md`** — la **méthode officielle** : le cycle d'une brique (Réflexion → Spécification `Objectif/Critère/Hors périmètre` → Challenge → Développement → **Clôture obligatoire** → Validation Michel). Suivre ce processus pour CHAQUE brique, sans sauter d'étape.
- **`CONSTITUTION-MILO.md`** — les principes stables (la personne d'abord, sécurité, faits avant opinions, confidentialité…). Toute évolution doit les respecter.
- **`docs/PRESENCE-MILO.md`** — vision d'identité : Milo devient la **présence** / la porte d'entrée du produit (Milo → App), sans gadget, jamais un passage obligé. **Le cerveau d'abord, la présence ensuite.** Guide l'UX des futures briques.
- 🌱 **`docs/PROFIL-VIVANT.md`** — **le design du « profil vivant »** (prolonge Constitution P25) : Milo **apprend, vérifie, corrige et évolue** avec le sportif (*« plus tu utilises Force Tracker, plus Milo te connaît vraiment »*). Les **4 modes** (Compléter · Enrichir · Mettre à jour · **Confirmer**), le **déclaré vs réalisé** (la réalité prime sur une tendance stable, jamais auto), le principe **« Milo ne pilote jamais »** (observer → expliquer → proposer → décider), la **fiabilité par champ** (décroissance + écart observé ; blessures = sensible), le **ton humble anti-surveillance** (jamais 2× « je vois que »), l'**évolution perceptible mais méritée** (jauge « Ce que Milo sait de toi »). Backbone : confiance + date de dernière confirmation. Lié à `NUTRITION-PHILOSOPHIE.md` (autres sports → TDEE, changements de vie, manuel = propose, tout explicable).
- 🧠 **`docs/MOTEUR-RAISONNEMENT-MILO.md`** — **LE CADRE du « cerveau de Milo »** (réflexion fondatrice Michel 22/07) : le pipeline **Compréhension → Diagnostic → décision → Explication** (le DIAGNOSTIC = l'étape qui manquait : même contexte, cause différente, stratégie différente) ; les **2 cerveaux** (Comprendre = Registre/ADN/Observations/état du jour/mémoire · Décider = raisonnement + Gardien + générateur) ; et surtout la **limite volontaire (Principe 18)** : **fiabilité AVANT intelligence** — profil vivant, décider avec l'info d'aujourd'hui, **ne jamais faire semblant de savoir**, **savoir s'arrêter**. Chaque brique « cerveau » (ancre/accessoire, observations, profil conversationnel…) est une **PIÈCE de ce moteur**, jamais un ajout isolé.
- 🧠🫀 **`docs/ARCHITECTURE-CERVEAU-CERVELET.md`** — **LA PIÈCE MANQUANTE DU MOTEUR : décharger Milo sans le diluer** (créé 19/08/2026, sur une idée de Michel — *« pourquoi tout part d'un seul bloc ? dans une entreprise il y a le boss et la secrétaire »*, puis nommée par lui **« le cerveau et le cervelet »**). **Milo garde le jugement** (diagnostiquer, adapter, décider, expliquer) ; **une 2ᵉ IA exécute le mécanique** (convertir, lire, calculer, composer sous contraintes) — et ⚠️ **elle N'EXISTE PAS pour l'utilisateur** : deux IA, **une seule voix** (R6, non négociable). **Le critère tient en une phrase** : *« est-ce que ça a besoin de savoir QUI est la personne ? »* — oui → Milo, non → le cervelet. **Ce qui l'a déclenché est une MESURE** : 140 règles, **46 485 caractères pour un plafond de 46 500 — 15 de marge**, et un dégraissage qui **plafonne à 3-4 %** (la méthode marche, elle ne résout pas le problème). ⚠️ **Le plafond n'est PAS financier** (le bloc commun est mis en cache 1 h) : il existe parce que la taille **DILUE les règles entre elles**. Porte la **frontière chiffrée** (≈ 8 800 car., 19 % déchargeables), le principe ⭐ **« Milo parle, le cervelet traduit »** (et pourquoi c'est probablement **plus fiable** : un convertisseur qui n'a qu'un métier se trompe moins), les **3 contraintes** à ne pas redécouvrir (le cache veut des variantes **FIXES** pas une variation continue · **l'erreur d'aiguillage est SILENCIEUSE** · un **noyau ne se conditionne JAMAIS**), le **risque propre à la nutrition** (un service séparé peut AGGRAVER le fait qu'elle ignore l'entraînement), et **§8 le prérequis** : *Milo suit-il ses 140 règles aujourd'hui ?* — `tests/milo` prouve la **PRÉSENCE**, jamais l'**OBÉISSANCE**. ⚠️ **Écrit pour être PARTAGÉ** (GPT, Gemini, une autre instance) : autonome et chiffré, avec **5 questions ouvertes** en §7 — on ne demande pas *« faut-il le faire »*, mais *« où passe la frontière »*.
- 🍽️ **`docs/NUTRITION-PHILOSOPHIE.md`** — **L'ESPRIT de la nutrition** (cadre à respecter AVANT de coder une brique nutrition ; croisement Gemini + Mistral + Claude + synthèse Michel, 22/07). Phrase-boussole : *« la nutrition est un moyen d'améliorer la santé/récup/perf ; elle ne doit jamais devenir une source de stress supérieure au bénéfice qu'elle apporte »* (**Constitution · Principe 21**). Les principes (levier au service de l'objectif · optionnelle jamais bloquante · fiabilité > exhaustivité · cohérence > réactivité · local d'abord + fallback fait-maison · qualité gratuite via Nutri-Score/NOVA · adapter pas imposer · mémoire · anti-TCA) · **la précision au CHOIX (4 niveaux : qualitatif → portions → macros → suivi précis)** · **le Gardien nutrition** (seuils d'alerte) · **la 1ʳᵉ brique** (journal léger « à la portion » sur Open Food Facts) · la couche future (chronobiologie/montre connectée).
- 📋 **`docs/BRIEF-NUTRITION.md`** — **LE POINT D'ENTRÉE du chantier nutrition, et il parle d'abord de la 2ᵉ IA** (créé 19/08/2026 à la demande de Michel, pour une **autre instance** qui reprend le sujet ; **réécrit le même jour** — ma 1ʳᵉ version mettait l'historique devant et l'architecture en §3, Michel : *« je voulais que tu parles de la 2ᵉ ia et ce que l'on fait actuellement »*). ⚠️ **Autonome** : lisible sans le dépôt. **Son sujet est le chantier EN COURS**, pas l'histoire de la nutrition — le détail du moteur reste dans `NUTRITION-MOTEUR.md`. Porte : **pourquoi on fait ça** (140 règles, 15 caractères de marge, un dégraissage qui plafonne à 3-4 %, et un plafond **qui n'est pas financier** — la taille DILUE) · **la 2ᵉ IA** avec ses ⛔ **3 interdits** (elle n'existe pas pour l'utilisateur · elle ne sait RIEN de la personne — vérifié par un test, l'appel ne porte que **2 clés** · elle n'a **pas de mémoire**) · les **2 critères** (*« besoin de savoir QUI ? »* + *« transformation vérifiable ou JUGEMENT ? »*, le second venu d'une relecture extérieure — sans lui, composer une assiette végane sans arachide partirait au cervelet) · ⭐ **le code passe AVANT le cervelet** (code → base → cervelet → Milo, jamais l'inverse) · **ft-v919 comme patron** (la cascade à 3 étages, et les **deux honnêtetés** : ça coûte un appel, et on ne peut pas prouver localement que la traduction est BONNE) · 🔧 **§4 la recette exacte** pour ajouter une tâche au cervelet (les **4 endroits** à tenir alignés, et le test qui épingle leur nombre) · ⭐⭐ **§5 la frontière nutrition** (*le cervelet calcule ce qu'il y a dans l'assiette, Milo décide ce que cette assiette signifie*), la **règle de sécurité** (le modèle **propose**, le code **valide**), le **droit de dire « je ne peux pas »** (l'erreur d'aiguillage est SILENCIEUSE), et ⚠️ **la dérive à interdire** — un cervelet qui finit par conseiller **aggraverait** le défaut n°1 au lieu de le résoudre · **§6 la suite avec son état honnête** (brique 0 FAITE, ne pas la refaire ; briques 1/3/4 différées **exprès** de 2 semaines pour construire sur du vrai usage ; le **benchmark** comme prérequis ; les **DEUX bases** journal/générateur) · **8 règles du projet** qui vont lui tomber dessus.
- 🥗 **`docs/NUTRITION-MOTEUR.md`** — **le COMMENT de la nutrition** (créé 18/08/2026, pendant technique de `NUTRITION-PHILOSOPHIE.md` qui dit le *pourquoi*). La **chaîne complète mesurée dans le code** (BMR → TDEE → objectif → macros → plan → portions → substitutions), les **deux plans qui coexistent** dans l'écran Nutrition (le local gratuit et celui de l'IA — la confusion a failli me faire corriger le mauvais bloc le 18/08), et les **cinq trous** par ordre d'importance. ⭐⭐ **Le plus important n'est pas la variété, c'est que la nutrition IGNORE COMPLÈTEMENT L'ENTRAÎNEMENT** : l'app connaît `S.wkt`, `startHour`, les calories dépensées, la région travaillée, la discipline — et n'en fait **rien** côté nutrition. ⭐ **La synthèse qui décide de tout (§4.0) : DEUX BASES, pas une** — le *Journal* veut de la **couverture** (CIQUAL entier, 3 484 aliments, la personne choisit), le *générateur* veut de la **sûreté** (~300 aliments marqués `composable`, avec `regimes`/`allergenes` en **liste blanche** relue à la main, car c'est l'app qui choisit). ⚠️ Porte aussi l'**audit de la note technique v1.0** rédigée en parallèle par une autre instance sans accès au code : sa cascade de résolution et sa **provenance figée** (§8) sont adoptées — le trou est réel, `S.foodLog` ne stocke aujourd'hui **ni source ni version** — mais trois de ses affirmations sont fausses, vérifiées dans le code : Milo n'est **pas** dans la chaîne de saisie (3 actions distinctes, déjà plafonnées à 25 usages), une saisie alimentaire **n'invalide aucun cache** (`foodLog` est exclu du contexte), et le « seuil de rentabilité 1,39 » avait déjà été corrigé le 17/08 (vrai seuil 0,28 / 1,11 — le cache **rapporte** depuis le 08/08).
- 📱 **`docs/STRATEGIE-NATIF.md`** — **les principes DURABLES du passage en natif/hybride** (cadrage 22/07, croisement Gemini + Mistral + Claude + synthèse Michel). Principe directeur (Michel) : *« le natif ne doit apporter que ce que le web ne peut pas offrir »* (question de contrôle : la PWA suffit-elle déjà ?). Chemin : **coque Capacitor, zéro réécriture** (on garde Milo/EXLIB/modèle/local-first) ; RN/Flutter/Tauri/Cordova écartés ; TWA sur Android. **Approche progressive** des plugins (préparer l'archi, n'ajouter chaque plugin que sur un besoin réel — pas « tous en V1 »). Priorité : objets connectés > push > stores > (IAP en dernier). Monétisation : au lancement garder le premium **serveur** (rien vendu in-app → esquive la taxe Apple), bouton neutre « gérer sur le web » ensuite. ⚠️ **Aucune estimation de coût/délai** (décision Michel : un doc d'archi garde les principes durables).
- 🌱 **`docs/ORIGINE-DES-REGLES.md`** — **D'OÙ VIENT CHAQUE RÈGLE** (créé 27/07/2026). Les règles d'or et les principes de la Constitution étaient écrits partout, mais **leur raison d'être nulle part** — or *une règle dont on a oublié la raison finit toujours par être contournée*. Retrouvé dans les **transcriptions de conversation** (2→27 juillet, 1 292 messages de Michel), qui n'étaient dans **aucun fichier du projet**. On y apprend que la règle **#6** (backup) date du **tout premier message** (« je suis comme un bébé… avant tout test, un backup ») · la **#4** (ouverture instantanée) vient des **polices** (« supprimer toute dépendance internet au démarrage ») · la **#11** (checklist) est la mise en forme de **trois rappels séparés** du 4/07 · les principes **femmes** viennent d'un souci d'exactitude physiologique (« aucun cliché… mais le discours ne doit pas être le même », « les migraines, plus fréquentes chez les femmes ») · et l'**audit de sécurité du 10/07** existait bien. **Couvre les 26 jours** (2→27/07). ⭐ **La découverte majeure** : le 18/07, Michel avait explicitement demandé *« le suivi de chaque évolution ET SA RAISON »* (c'est la naissance de la règle #12) — 9 jours plus tard on mesurait que le *pourquoi* manquait pour **70 %** des versions. **La règle existait, elle n'a pas été tenue.** ⭐ **Le mécanisme des règles d'or**, constaté 3 fois : elles naissent le jour où le même rappel revient une fois de trop (*« mets-le dans les règles stp, pas que je te le dise à chaque fois »*, 18/07) → **quand Michel répète une consigne deux fois, ne pas la ré-appliquer : l'ÉCRIRE.** ⚠️ Les transcriptions ne sont pas garanties dans le temps.
- 🎨 **`docs/DESIGN-KIT.md`** — **le kit à coller dans un outil de maquettage** (créé 27/07/2026). **Le problème** : l'outil externe travaille **à l'aveugle** — il ne connaît ni les couleurs, ni les polices, ni les composants de Force Tracker → il **invente** une esthétique, belle chez lui et **intransposable** ici (échec du 21/07 : *« le cercle n'a rien à voir, pas de profondeur, les couleurs pas respectées »*, et du **Flutter** proposé pour une PWA). **Le fix** : un bloc prêt à coller avec les **vraies** variables (`--bg`/`--t1`/`--red`…), les polices, les composants (`.btn`, `.card`, `.modal`) et le motif d'**anneau SVG**. ⚠️ **Constat au passage** : l'app n'utilise **PAS canvas** pour l'interface — **104 `<svg>`**, et les 17 usages de canvas ne servent qu'à traiter des **images** (redimensionner, masquer le bilan, caméra). Donc **aucune limite** côté design : dégradés, ombres, profondeur, animations sont tous faisables. **Bon partage des rôles** : l'outil externe pour *explorer une direction*, Claude Code pour *la rendre réelle sur l'écran existant* (et envoyer une capture du rendu réel — zéro transposition).
- 🔬 **`docs/DOSSIER-MET-MESURES.md`** — **LE DOSSIER AUTONOME sur les calories de musculation** (créé 15/08/2026, à la demande de Michel pour son **appli MET indépendante**). Pendant *mesures* du kit de code `MOTEUR-MET-A-COLLER.md` : celui-ci dit **comment**, celui-là dit **pourquoi — et surtout ce qui ne marche pas**. Tout est chiffré sur **46 séances Garmin** (mai→août) croisées avec **31 séances de l'app**. Les points qui coûtent cher si on les ignore : ⚠️ **un MET de SÉANCE se multiplie par la durée totale, un MET d'EXERCICE par le temps actif** — les croiser donne +16 % d'erreur ; ⛔ **ne jamais caler un modèle sur les calories d'une montre** (r = 0,10-0,34 contre calorimétrie indirecte en résistance ; et mesuré ici, `r(FCmoy, kcal/min) = 0,968` — le chiffre de la montre EST une fonction du cardio) mais **son horloge est parfaite** ; ⭐ **la durée est la vraie source d'erreur, pas l'intensité** (le modèle était à 12 %, la durée à 300 %) ; les **3 causes d'une durée fausse** et le repère unique qui les trahit (min/série) ; les **4 approches de recalage mesurées** — la plus bête gagne ; les **pas de charge par matériel** tirés de 31 séances ; et **§9, ce qu'on ne sait toujours pas**, écrit pour que personne ne le redécouvre en croyant que c'est résolu. Le relevé détaillé reste dans `docs/CALORIES-SOURCES.md` (§16).
- 🔥 **`docs/MOTEUR-MET-A-COLLER.md`** — **le 3ᵉ kit pour outil extérieur** (créé 14/08/2026), après `DESIGN-KIT.md` (l'écran) et `CONTRAINTES-PDF.md` (le papier). Même problème, 3ᵉ support : Michel veut extraire le **moteur MET** en module réutilisable, dans Force Tracker **et** dans une app indépendante. Le fichier porte le **code réel** (pas une description), les contraintes (**JS vanilla, aucun framework, aucun build**) et surtout **la contrainte qui décide de tout** : `getExerciseMET()` **n'est pas autonome** — elle appelle `_mscScores()` (table de 324 exercices) et `_movPattern()`. Il ne faut ni les recopier ni les embarquer : le module doit devenir **PUR** et recevoir les muscles **en paramètre**, pour qu'il y ait *une seule logique de calcul et deux sources de données* (R1/R2). Liste aussi ce qu'il ne faut **pas** toucher — la règle « 3 muscles ou plus », les listes haltérophilie/cardio, les cas farmer's walk et charnière de hanche : chacune vient d'un bug mesuré, pas d'un choix esthétique.
- 📄 **`docs/CONTRAINTES-PDF.md`** — **le pendant papier du DESIGN-KIT** (créé 13/08/2026). Même problème, autre support : un outil extérieur (ChatGPT, Claude Design) ne sait pas avec quoi les PDF sont fabriqués, donc il propose de belles idées **intransposables**. Le fichier dit les **deux mécanismes** (feuille `window.print()` + CSS complet · jsPDF dessiné au point près), ce que chacun sait faire, la palette **mode CLAIR** en hex ET en RGB, les contraintes d'**usage** (la feuille va à la salle, on écrit au stylo, beaucoup d'imprimantes sont en noir et blanc), et surtout la liste ⛔ de **ce qui n'est pas possible**. ⚠️ **Vérifié en lisant les bibliothèques, pas de mémoire** — et deux idées reçues sont tombées : les **dégradés** et les **polices personnalisées** sont possibles en jsPDF (c'est le format `.woff2` de l'app qui bloque la 2ᵉ, pas la bibliothèque). §9 porte le bloc à coller dans **Claude Design** — ⚠️ **surtout pas celui de `DESIGN-KIT.md`**, qui impose le mode sombre en 430 px de large : sur papier, ces consignes-là sont fausses.
- 🐛 **`BUGS.md`** — **le catalogue des vrais bugs, rangé par FAMILLE et non par date** (créé 02/08/2026 à la demande de Michel). Répond à la seule question utile avant d'écrire du code : *« quels pièges ce projet a-t-il déjà rencontrés, et à quoi les reconnaît-on ? »* Le constat qui l'a motivé : sur ~730 versions, **les mêmes 5-6 bugs reviennent sans arrêt sous des déguisements différents** — le **premier match gagnant** (≥12 fois) · l'**info qui n'atteint jamais la donnée** (11 fois, R4) · les **fuseaux horaires** · le **déploiement silencieux** · les **seuils en marche d'escalier** · les **deux sources qui se contredisent** · et surtout les **erreurs de MÉTHODE** (un contrôle négatif à 0 rouge parce que le runner plantait, tester des archétypes au lieu du catalogue, croire une fausse limite). Chaque famille dit **à quoi on la reconnaît** et **ce qui la protège aujourd'hui**. Se termine par les **6 réflexes**. À compléter à chaque nouveau bug.
- 🧨 **`docs/GALERES-ET-LECONS.md`** — le **journal d'expérience** (« comment Force Tracker est devenu plus robuste ») : grosses galères résolues (son iOS, 4G, perte de données, backend qui tombe…), **décisions qu'on ne regrette pas** (§6), **fausses bonnes idées** (§7), problèmes **encore ouverts**, ce qui **manque**, et les **réflexes** pour ne pas re-tomber dedans. À consulter avant un chantier risqué, et à **compléter à chaque nouvelle galère / décision / fausse bonne idée**.
- 🧭 **`docs/BUGS-DE-PHILOSOPHIE.md`** — **NOUVEAU (23/07/2026), l'un des docs les plus précieux** : ne documente PAS des bugs de code, mais les **dérives de COMPORTEMENT de Milo** (une hypothèse présentée comme un fait, une mémoire créée d'une déduction, un interrogatoire, une sortie de rôle…) — le *raisonnement* est souvent bon, c'est la **SORTIE** qui trahit la Constitution. **Chaque bug de philosophie devient une règle de conception** (*« un bug n'est pas un échec, c'est une règle qui manquait »*, Michel). Distinction fondatrice **raisonnement vs comportement** + les cas PB-001→004. **À compléter à chaque dérive repérée** (souvent via un « piège » de testeur/Michel). Une règle mûre peut monter en Constitution.
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
| `sw.js` | Service Worker (cache-first HTML navigation, cache-first assets) — cache versionné `ft-vNN`, bumpé à chaque release (**actuel : `ft-v920`** — voir le journal des versions) |
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


### 🧪 Clone de test (`/clone/`) — bac à sable restylage (✅ 2026-07-04)
- **But** : copie fonctionnelle et LIVE de l'app pour faire le restylage complet **sans toucher la prod**. Stratégie « copie test en off » du fichier idées. URL : `https://michdu75-commits.github.io/forcetracker/clone/`.
- **⚠️ Impossible en repo séparé** (l'accès GitHub de Claude Code web est limité à `michdu75-commits/forcetracker`) → le clone vit dans un **sous-dossier `/clone/` du même repo**. La prod (racine) n'est jamais modifiée.
- **Contenu de `/clone/`** : copies de code uniquement (index.html, style.css, les 8 JS, manifest.json, sw.js). **Aucun asset dupliqué** — les images/polices lourdes (anatomy 22M, muscles 17M, exercises 6.7M…) sont référencées via `../` vers le parent (réécriture `sed` des chemins `anatomy/`→`../anatomy/`, etc.).
- **Isolation stockage** : un shim en tête de `clone/index.html` **redéfinit `window.localStorage`** pour préfixer toutes les clés en `cl_` → le clone a SES données, ne lit/écrit JAMAIS les `ft4_*` de l'app réelle. Vérifié en test (le clone voit `null` pour `ft4_name` de la prod, la prod reste intacte). *(Fallback si un navigateur refuse la redéfinition : partage — donc sur iPhone, considérer que le clone PEUT partager les données ; l'utiliser surtout pour le rendu.)*
- **Service Worker du clone** (`clone/sw.js`) : réseau natif pur (scope `/clone/`), **ne touche jamais** le Cache Storage de la prod (partagé par origine — ne PAS y faire `caches.delete`). Garantit toujours la dernière version pour tester. Un reload one-shot au 1er chargement (controllerchange) est normal.
- **Badge `🧪 CLONE`** injecté en haut pour ne jamais confondre avec l'app réelle.
- **⚠️ Réécriture `sed` — piège** : `machine/` a été remplacé à tort dans un **regex** `.../epaules machine/i` de `log.js` (le `/` était le délimiteur de regex, pas un chemin). Corrigé. **Règle** : si on régénère le clone, ne préfixer que les tokens précédés d'une quote/paren, jamais dans un regex.
- **Workflow** : restyler dans `/clone/`, Michel valide sur l'URL clone, puis on **promeut** vers la racine (copier les fichiers validés de `clone/` → racine + bump `sw.js`).


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

> **Version actuelle : `ft-v920`** (prochaine : `ft-v921`). Historique complet (ft-v128→574 + gouvernance
> antérieure, **+ ft-v575→632 déménagées le 28/07**) → **`docs/JOURNAL-ARCHIVE.md`**. Le n° de cache se lit dans `sw.js` (`const CACHE='ft-vNN'`).
> **Entretien** : ajouter chaque nouvelle version ICI (règle d'or #12). Quand ce journal récent dépasse
> **20** entrées, déménager les plus anciennes dans `docs/JOURNAL-ARCHIVE.md` (couper/coller, rien
> supprimer). `python3 tools/check_regles.py` le signale automatiquement.
> ⚠️ **L'ARCHIVE S'AJOUTE, ELLE NE SE RÉÉCRIT JAMAIS** (leçon du 04/08 : un script d'archivage l'a
> **écrasée** — 297 entrées perdues, découvertes 2 jours plus tard **par hasard**, parce que rien ne
> la surveillait). Le même `check_regles.py` refuse désormais toute entrée disparue. **Toujours
> AJOUTER à la fin, jamais ouvrir le fichier en écriture**, et lire le diff avant de committer :
> un `-1793` dans le numstat n'est pas un détail.

**ft-v920 — 🛡️ LE MODÈLE PROPOSE, LE CODE VALIDE — la règle existait, appliquée à UN SEUL des deux chemins** — Michel : *« bah non fait le comme ça je verrais de moi même si ça fonctionne »*.

**LE TROU** : on **DEMANDE** au cervelet de reprendre le nom d'exercice *« exactement tel que le coach l'a écrit »*. **Personne ne le VÉRIFIAIT.** S'il rendait *« Développé Incliné »* là où Milo avait écrit *« Développé Couché »*, la personne s'entraînait sur autre chose — **sans un message**.

**⚠️⚠️ ET LA RÈGLE EXISTAIT DÉJÀ DEPUIS LE 04/08, SUR L'AUTRE CHEMIN.** `_seanceDepuisTexte` refuse le rapprochement « par mots », et son commentaire porte la **mesure** qui l'a fait naître : il transformait *« Curl Biceps Haltères »* en *« Curl Barre »* et *« Élévations Latérales »* en *« Élévations Latérales Câble »*. La conclusion d'alors — *pour CONSTRUIRE une séance, on refuse le « à peu près »* — **n'a jamais été portée jusqu'au chemin du cervelet**, ouvert la veille. C'est **`BUGS.md` famille 15** (la règle juste, définie trop étroit), **3ᵉ fois en trois jours** — après la charge de 82,5 kg (ft-v914) et les sources inventées (ft-v918).

**👉 LA RÈGLE, volontairement simple et explicable** : chaque nom rendu doit se retrouver dans ce que Milo a écrit — au moins un mot significatif, et au moins la **moitié** de ses mots. *« Développé Couché Barre »* passe (une précision de catalogue n'est pas une invention, et jeter là-dessus coûterait une séance) · *« Développé Incliné Haltères »* non · *« Leg Extension »* absent du texte, non.

**⭐⭐ ET LA COMPARAISON SE FAIT LIGNE PAR LIGNE — corrigé par son propre témoin, qui a rougi.** Mon premier jet comparait au texte **entier** : *« développé »* venait de la ligne du couché, *« haltères »* de celle du curl → 2 mots sur 3, **le renommage passait**. Or un nom d'exercice vit dans **UNE** ligne, pas éparpillé dans le message. *Le cas qui compte le plus est précisément celui que la version large laissait filer.*

**⚠️ ON N'AVERTIT PAS LA PERSONNE, et c'est réfléchi** : ce qu'on retire, elle ne l'a **JAMAIS VU** — il n'était pas dans le texte de Milo. L'écarter **REMET** la séance en accord avec ce qu'elle a lu ; lui annoncer *« j'ai retiré X »* désignerait quelque chose qui n'a jamais existé pour elle. La trace part dans la console, pour pouvoir diagnostiquer.

**⚠️ ET SI LA TRADUCTION EST TROP ABÎMÉE** (moins de 2 survivants, ou plus d'un tiers écarté), on ne rafistole pas : on rend `null` et la cascade repart sur le **filet déterministe**, fidèle **par construction** puisqu'il lit les lignes de Milo. *Une séance à moitié juste est pire qu'une séance plus pauvre mais vraie* (R29).

**⚠️ ET MON TÉMOIN A DÛ ÊTRE RÉÉCRIT — 7ᵉ fois.** Écrit d'abord contre `_cerveletFidele`, une fonction **neuve**, il rendait **1 rouge** (« fonction absente ») au lieu de mesurer les six comportements : *il échouait, il ne prouvait rien*. Repassé par `_cerveletSeance` — présente des deux côtés — avec un `fetch` bouchonné qui décide exactement ce que le cervelet rend.
Tests : **parcours 793/793** (+6, bloc LX), calculs 241/241, muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 3 rouges**, et la sortie se lit toute seule — `Developpe couche | Rowing barre | Leg Extension | Curl biceps halteres`. ⚠️ Deux témoins sont **verts des deux côtés, et c'est voulu** : la traduction fidèle doit continuer de passer intacte, et rien ne doit devenir bloquant. Fichiers : `coach.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v920. |

**GOUVERNANCE + BACKEND — 📐 LA MESURE QUI CHANGE LE PLAN : décharger n'est PAS diluer moins · et 4 correctifs d'une lecture critique extérieure (19/08/2026, `worker.js`)** — Michel apporte un document de 8 pages écrit avec une autre instance : *« regarde je suis allé loin avec claude »*, puis *« vas y et essaie de voir d'autres solutions »*.

**⭐⭐ SA CRITIQUE PRINCIPALE EST JUSTE, ET ELLE EST MAINTENANT MESURÉE.** Il pose que *« la dilution n'est pas proportionnelle au VOLUME, elle est proportionnelle au nombre de règles CONCURRENTES et à leur proximité sémantique — 3 700 caractères de spécification JSON ne diluent rien, c'est un bloc technique sans concurrence avec "ne culpabilise jamais" »*. **Donc ft-v919 a libéré de la PLACE, pas réduit la DILUTION.** Découpé bloc par bloc sur les 44 157 caractères : **84 % sont des règles de COMPORTEMENT** (36 861 car.), 16 % portent encore de la mécanique — et là-dedans **~5 % seulement sont réellement déchargeables**, parce que la moitié des blocs restants est du **jugement** (*quand* poser une question rapide, *quoi* mérite d'être retenu). *Le déménagement technique est presque fini, et il n'a retiré aucune règle de comportement.* On a gagné de la **capacité**, pas de la **fiabilité**.

**⭐⭐ ET LA RAISON AFFICHÉE ÉTAIT LA MAUVAISE — c'est le point qui décide de l'avenir.** Le document justifiait le cervelet par *« le prompt est plein »*. Or **une justification par la CONTRAINTE rend le périmètre ÉLASTIQUE** : si le prompt se remplit à nouveau, la tentation sera de déménager davantage — mot pour mot la dérive que le document interdit lui-même. Reformulé : **le cervelet existe parce que TRANSFORMER et JUGER sont deux métiers différents ; le plafond a été le DÉCLENCHEUR, pas la RAISON.** *La nuance a l'air rhétorique — elle décide de ce qu'on lui confiera dans six mois.*

**⚠️ ET LE PLAFOND DE 46 500 EST UN CLIQUET, PAS UNE MESURE**, dit franchement : il était à 45 000 et a été relevé le 12/08 parce qu'une spécification n'entrait plus. **Personne n'a jamais mesuré qu'au-delà d'un certain volume une règle cesse d'être suivie.** L'architecture reste bonne indépendamment de sa cause — mais sa justification chiffrée ne l'était pas.

**👉 QUATRE CORRECTIFS LIVRÉS** : ① **la fourchette de reps** — *« 4 séries de 8 à 12 »* est une consigne normale, l'app ne stocke qu'un entier, et le convertisseur **tranchait EN SILENCE** ; il prend désormais la **borne basse** (se tromper vers le haut fait rater des reps, vers le bas ne coûte rien) **et écrit la fourchette dans la note** — rien n'est perdu · ② **le test des 4 listes d'actions compare des ENSEMBLES, plus un comptage** (voir ci-dessous) · ③ **le chemin de repli devient une RÈGLE** : *toute tâche confiée au cervelet doit avoir un repli, ou être non essentielle* — écrite pendant qu'il n'y a qu'une tâche, sinon la 2ᵉ arrivera sans filet et personne ne le verra avant la panne · ④ **la HIÉRARCHIE entre moteurs** est posée (Gardien → Milo → Observateur → cervelet) : *l'écrire coûte trois lignes, la reconstituer au 3ᵉ composant coûtera une refonte* — la leçon de la brique 0, appliquée aux composants au lieu des données.

**⭐⭐ LE TEST ÉPINGLAIT UN NOMBRE, PAS UNE COHÉRENCE — et le trou était réel.** Sa remarque : *« si quelqu'un ajoute une action dans trois listes sur quatre et en retire une autre ailleurs, le compte reste à 14 et l'incohérence passe »*. Vérifié : on comparait `constants ⊆ worker` et `constants ⊆ Code.js`, **jamais le sens inverse**, et **jamais les ROUTES du worker** — l'endroit où l'action est réellement exécutée. Les 4 listes sont maintenant comparées **dans les deux sens**, et le message **NOMME l'action fautive**. ⚠️ **Vérifié en le faisant rougir**, sinon il ne prouverait rien : un échange d'action à compte constant → 6 écarts ; une route manquante → 6 écarts. *L'ancien test passait au vert sur les deux.*

**⭐ ET UNE QUESTION OUVERTE DU DOCUMENT EST FERMÉE** : *« afficher le texte immédiatement et traduire en arrière-plan — est-ce déjà le comportement ? »* → **oui**, écrit dans le code avec sa raison (règle d'or #3 : une traduction lente ne doit jamais retarder ce que la personne est venue lire).

**⭐⭐ ET LA DEMANDE DE MICHEL — « essaie de voir d'autres solutions » — devient le §9 du document d'architecture** : 6 leviers qui s'attaquent à la **concurrence entre règles**, pas au volume. Le **rappel ciblé dans la queue non cachée** (le prompt part déjà en 3 blocs, le dernier n'est jamais mis en cache : une règle situationnelle peut y apparaître **courte, au moment où elle compte, et en fin de prompt** — ⚠️ avec une ligne gardée dans le noyau, sinon une détection ratée = règle absente en silence) · le **Gardien de SORTIE** au lieu de la règle d'entrée (**R7 appliqué au comportement**, alors qu'on ne l'avait appliqué qu'au calcul — 5 contrôles existent déjà, R13) · **nommer la hiérarchie UNE fois** pour supprimer les arbitrages éparpillés dans le texte (*la seule piste qui retire des caractères ET de la concurrence*) · **conditionner un bloc entier** (nutrition 6 668 car., méthode de coach 7 462 — ⚠️ déjà écartée à ft-v898, à rouvrir avec la même prudence, jamais sur la sécurité) · ⭐⭐⭐ **mesurer laquelle des 140 règles est réellement suivie** — le seul levier empirique, et le seul qui dise si la dilution est vraiment le problème · et à long terme **le cervelet qui finit par ne plus être une IA** (chaque appel produit une paire entrée/sortie qui rapproche du jour où le code déterministe le remplace — la cascade de ft-v919 **dans l'autre sens**).

Tests : **parcours 787/787** (le témoin des 4 listes en remplace un plus faible), calculs 241/241, muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. Fichiers : `worker.js`, `tests/parcours/runner.js`, `docs/ARCHITECTURE-CERVEAU-CERVELET.md` (§1.1, §3.1, §3.2, §5.3bis, §5.3ter, **§9**), `docs/BRIEF-NUTRITION.md`, `docs/CONTEXTE-ACTUEL.md`, `clone/worker.js`, `CLAUDE.md`. ⚠️ **Aucun fichier de l'app touché — pas de bump `sw.js`** (`worker.js` n'est pas un asset servi, même règle que `Code.js`). |

**GOUVERNANCE — 📋 LE BRIEF NUTRITION PARLE D'ABORD DE LA 2ᵉ IA · et le garde-fou des documents gagne une PORTE ÉTROITE (19/08/2026)** — Michel : *« fait un recap pour le claude nutrition »*, puis, en lisant ma 1ʳᵉ version : *« je voulais que tu parles de la 2ᵉ ia et ce que l'on fait actuellement »*.

**⚠️ J'AVAIS MIS L'HISTOIRE DEVANT ET LE SUJET DERRIÈRE.** Ma première version ouvrait sur *« les trois phrases qui décident »* puis un long §2 de ce qui avait été livré, et ne parlait de l'architecture qu'en **§3**. Or ce qu'on construit **en ce moment**, c'est le cervelet — et c'est ce qu'une autre instance doit comprendre avant toute chose, parce que ça décide de **ce qu'elle a le droit d'écrire**. Réordonné : §1 pourquoi on fait ça · §2 la 2ᵉ IA et ses **3 interdits** · §3 ft-v919 comme **patron** · **§4 la recette exacte** pour ajouter une tâche au cervelet (les 4 endroits à tenir alignés) · §5 la frontière nutrition. L'historique descend en **§6.2bis**, gardé entier — *ce qui protège contre le « je vais refaire ça » n'est pas décoratif.*

**⭐⭐ ET LE GARDE-FOU DES DOCUMENTS A REFUSÉ MA RÉÉCRITURE — c'est le moment le plus utile de la soirée.** Verdict : *« a PERDU 78 % de ses lignes de fond »*. J'ai listé les 138 lignes une par une : **aucune information perdue** — j'avais re-coupé presque toutes les lignes, et le contrôle compare du texte **à l'identique**. **Faux positif sur un geste parfaitement légitime**, et *un garde-fou qui crie pour rien finit désactivé* (**R19**).

**⛔ MAIS ON N'A PAS BAISSÉ LE SEUIL, ET C'EST LE POINT.** Ce contrôle existe parce qu'un script a **écrasé l'archive le 04/08** : 297 entrées perdues, découvertes **deux jours plus tard par hasard**. Assouplir le seuil rouvrirait exactement cette porte-là. À la place, une **porte ÉTROITE** : le document doit porter **lui-même** une ligne datée disant ce qui a été réécrit et pourquoi — **R30** (un geste volontaire s'écrit, sinon il redevient un bug) et **R27** (le pourquoi vit **à côté** de ce qu'il protège, pas dans un fichier qu'on n'ouvre plus).

**⚠️ ET LA PORTE NE REND PAS LE CONTRÔLE MUET** : il **affiche** la réécriture et sa raison (`🚪 … réécriture VOLONTAIRE déclarée le …`). *On la voit passer, on ne la découvre pas deux jours après* — c'est précisément ce qui avait manqué le 04/08.

**⭐ La porte a été testée dans les DEUX sens, sinon elle ne prouverait rien** : un document vidé **sans** marqueur rougit toujours (code 1) · un marqueur avec une raison **trop courte** ne l'ouvre pas (code 1) · la déclaration complète passe (code 0). *Une exception qu'on n'essaie pas de forcer soi-même n'est pas une exception, c'est un trou.*
Fichiers : `docs/BRIEF-NUTRITION.md` (réécrit, déclaré), `docs/NUTRITION-MOTEUR.md` (§7 : la brique 0 était annoncée « à faire » alors qu'elle est livrée depuis ft-v907), `tools/check_regles.py`, `docs/CONTEXTE-ACTUEL.md`, `CLAUDE.md`. ⚠️ **Aucun fichier de l'app touché — pas de bump `sw.js`.** |

**ft-v919 — 🫀 LE CERVELET : MILO PARLE, LE CERVELET TRADUIT — la 1ʳᵉ brique de l'architecture qu'il a nommée** — Michel, après qu'on ait écrit le document : *« bah donc c'est "simple" lol, milo est le cerveau et l'autre ia s'occupe du reste »*, puis *« vas y fait le stp »*.

**LE DÉFAUT, ET IL EST MESURÉ, PAS SUPPOSÉ** : Milo devait produire **EN MÊME TEMPS** une réponse lisible **et** un bloc JSON valide. La spécification de ce bloc pesait **~3 700 caractères dans le prompt COMMUN** — celui qui part à **tout le monde, à chaque conversation**, y compris à quelqu'un qui parle nutrition et n'aura jamais de séance à charger. Et quand le JSON sortait mal formé, la séance ne se chargeait pas.

**👉 IL ÉCRIT MAINTENANT SA SÉANCE EN FRANÇAIS, comme un coach.** Une 2ᵉ IA (Haiku, action `seanceJson` dans le worker) la convertit en données. **⭐ ELLE NE SAIT RIEN DE LA PERSONNE** — on ne lui envoie ni profil, ni records, ni historique, ni email, **rien que le texte** : c'est le critère qui la définit (*« est-ce que ça a besoin de savoir QUI est la personne ? »*), et **ne pas lui donner l'information est la garantie la plus simple qu'elle ne s'en servira pas**. ⚠️ Et **elle ne parle jamais** : sa sortie n'est pas affichée, elle remplit l'écran Séance (**R6**, une seule voix — le jour où elle parle en son nom, le produit a deux personnalités).

**⭐⭐ LA CASCADE A TROIS ÉTAGES, ET L'ORDRE COMPTE** : ① le **bloc caché** s'il est encore là — le prompt commun est en **cache 1 h**, donc pendant une heure après la livraison Milo peut encore l'émettre, et ce serait un bug de le refuser · ② le **cervelet** traduit · ③ la **lecture déterministe du texte** (écrite le 04/08) reste le **filet** : plus pauvre (ni repos, ni consigne, ni type de série) mais **gratuite et hors ligne**. *On ne remplace jamais un chemin qui marche : on en ajoute un meilleur devant.*

**⚠️ L'AIGUILLAGE EST DÉTERMINISTE ET VOLONTAIREMENT PLUS PERMISSIF QUE LE FILET** — ce n'est pas un oubli, c'est **R29**. Le filet **CONSTRUIT** la séance : une ligne mal lue ferait travailler la personne sur autre chose, donc il est strict. L'aiguillage ne fait qu'**ORIENTER** : au pire il dépense un appel pour rien, et le cervelet répond « ce n'est pas une séance ». *Deux coûts d'erreur différents, donc deux seuils — pas un seul.* Concrètement, l'ancre de fin de ligne saute : *« Développé couché 4×8 à 60 kg, repos 3 min »* est une vraie ligne de séance, et le filet la rejetait.

**⭐⭐ ET UN BUG LATENT ATTRAPÉ PAR SON PROPRE TÉMOIN** : la traduction revient **en différé**, une seconde après l'affichage. D'ici là la personne a pu envoyer un autre message — le bouton, qui visait « la dernière bulle », se serait collé **sous une réponse qui n'a rien à voir**. La bulle est désormais **capturée au moment du rendu**. Le contrôle négatif le montre en une ligne : `pose sur : [bulle2]`.

**⚠️ ET DEUX HONNÊTETÉS, ÉCRITES PARCE QU'ELLES COMPTENT.** ① La conversion **coûte maintenant un appel Haiku** par séance proposée, là où elle était incluse dans la réponse — c'est le prix du découplage, et il est assumé (le prompt commun, lui, est facturé au dixième mais **DILUE** les règles, et c'est ÇA qu'on achète). ② **On ne peut pas prouver localement que le cervelet traduit BIEN** : les témoins prouvent qu'il reçoit le bon texte, qu'il part au bon endroit et que sa sortie atteint l'écran — **la qualité de la traduction demande le vrai modèle**. C'est la même limite que `tests/milo`, et elle est écrite pour ne pas être oubliée.

**⚠️ Un témoin RETOURNÉ, avec sa raison** : *« Milo REÇOIT la clé `supersetGroup`, sinon il ne peut pas s'en servir (R8) »* était juste tant que Milo formatait lui-même. **R8 n'est pas abandonné, il change de destinataire** — la spécification doit atteindre *celui qui l'emploie*. Trois témoins couvrent désormais les trois maillons (la clé a quitté le prompt · Milo dit le superset en clair · le convertisseur connaît la clé) : *s'il en manquait un, le superset disparaîtrait sans qu'aucune erreur ne le signale.*

**Bloc commun : 46 485 → 44 157 caractères. Marge : 15 → 2 343.**
Tests : **parcours 787/787** (+13 : bloc LIX, 10 témoins ; 3 ajustés avec leur justification), calculs 241/241, muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 13 rouges**, exactement les 13 comportements changés. ⚠️ Deux témoins sont **verts des deux côtés, et c'est voulu** : le filet déterministe et le bloc caché doivent continuer de marcher — on n'a retiré aucun chemin. Fichiers : `coach.js`, `worker.js`, `constants.js`, `Code.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v919. |

**ft-v918 — 🔗 MILO NE PEUT PAS ALLER SUR INTERNET, MAIS IL POUVAIT PRÉTENDRE L'AVOIR FAIT** — Michel, en relisant le prompt règle par règle : *« je n'ai pas vu de protection pour éviter à Milo d'aller sur internet »*.

**⭐ VÉRIFIÉ AVANT DE RÉPONDRE, PAS SUPPOSÉ** : il ne **peut pas** y aller. L'appel API ne porte **aucun champ `tools`**, aucune recherche web (`worker.js` — 0 occurrence). Le modèle reçoit du texte et rend du texte. Ce n'est pas une consigne qu'on espère voir respectée, c'est **structurel** — et c'est exactement la bonne façon de le garantir (**R7** : ce qui doit être sûr ne passe pas par le prompt).

**⚠️ MAIS LE RISQUE VOISIN N'ÉTAIT PAS COUVERT, ET IL EST RÉEL.** Il ne peut pas y *aller* ; il peut très bien **inventer une étude, un organisme, un chiffre « officiel », un lien**. Or la règle qui s'appelle pourtant *« ne FABRIQUE jamais de source »* ne parlait, en la lisant en entier, **que des sources INTERNES** : *« ne dis pas je vois ça dans tes antécédents »*. Rien sur l'extérieur. **C'est `BUGS.md` famille 15 dans sa forme exacte** — la règle juste, définie trop étroit — et c'est d'autant plus sensible que Milo parle de **santé et de nutrition**, où un « selon l'ANSES » inventé coûterait la confiance d'un coup.

**👉 DEUX ÉTAGES, ET ILS NE FONT PAS LE MÊME TRAVAIL.** Le **prompt EMPÊCHE** : la règle couvre désormais l'extérieur, avec la raison écrite (*« tu n'as AUCUN accès à internet, tu ne peux rien vérifier — sans source sûre, parle en ton nom et dis que ça mérite vérification »*). Le **Gardien de sortie ATTRAPE** ce qui est détectable par motif : un **lien**. C'est le cas propre — Milo n'ayant aucun accès, il ne peut l'avoir vérifié, quelle qu'en soit l'origine.

**⛔ ET ON NE TENTE PAS DE REPÉRER « SELON L'ANSES », C'EST DÉLIBÉRÉ** : l'app **cite de vraies sources** (Open Food Facts, Nutri-Score) et Milo a parfaitement le droit de les nommer. Un motif là-dessus crierait sur des phrases justes — et *un garde-fou qui crie pour rien finit désactivé* (**R19**). Un témoin vérifie explicitement ce faux positif : c'est le plus important des quatre.

**⭐ RIEN DE NEUF CONSTRUIT (R13)** : le Gardien de la Constitution — Étage 1 existait déjà avec 4 contrôles (bloc technique, interrogatoire, diagnostic, promesse de mémoire vide). Il en a **5**. Et comme les autres, il **SIGNALE, il ne réécrit pas** — on ne charcute pas une phrase.

**⚠️ ET LA MARGE EST RETOMBÉE À 15 CARACTÈRES**, c'est dit sans enjoliver : les 241 gagnés à ft-v917 sont repartis dans cette seule règle. Elle est passée devant parce qu'elle protège contre une **désinformation santé dans un produit qui donne des conseils santé** (**R11** : la sécurité prime). Conséquence directe : **l'arbitrage sur les 140 règles n'est plus optionnel** — il est désormais le seul moyen de faire entrer la suivante.
Tests : **parcours 774/774** (+4, bloc LVIII), calculs 241/241, muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. Fichiers : `coach.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v918. |

**ft-v917 — 🧹 LE PROMPT DE MILO N'ÉTAIT PLUS QU'À 35 CARACTÈRES DE SON PLAFOND — et le témoin m'a appris où s'arrête la méthode** — Michel, après que je lui aie listé ce qui restait à faire : *« euh Milo là c'est le plus urgent »*. Il avait raison : **plus aucune règle générique ne pouvait entrer** dans le prompt commun sans qu'on en sorte une — je l'avais vécu deux heures plus tôt avec la règle de zone (ft-v914), qui a dû déménager faute de place.

**⭐ LA MÉTHODE QUI MARCHE, ET C'EST LA SEULE SÛRE** : on ne « compresse » pas de la prose — on **retire du prompt ce que le CODE garantit de façon DÉTERMINISTE** (R7 : le prompt est le dernier levier, et ce qui est déterministe ne doit pas dépendre d'un jour de fatigue du modèle). Deux cas nets :
· le **barème des paliers** (40-50 %, +10-15 %, reps 5→3→2→1, au-delà de 85 % c'est 1-2 reps) est calculé par `_monteeEnCharge` + `_repsPalier` + `_pasCharge` — Milo n'a pas à le détailler ;
· l'**explication physiologique du superset**, dont le refus dur vit déjà dans `_supersetInterdit`, avec son commentaire écrit le 12/08 : *« pourquoi le code et pas le prompt : le prompt est probabiliste, ce refus ne doit pas dépendre d'un jour de fatigue du modèle »*.

**⚠️⚠️ ET LA MÉTHODE A UNE LIMITE QUE JE N'AVAIS PAS VUE — C'EST LE TÉMOIN QUI ME L'A APPRISE.** J'avais aussi retiré la règle de **DOSE** (4-5 paliers sur le premier mouvement, 2-4 sur une 2ᵉ barre, 0-2 sur un accessoire), en croyant qu'elle relevait du même calcul. Le témoin de **ft-v887** est passé au **ROUGE**, et il avait raison : en relisant `_monteeCompletee`, le code **COMPLÈTE** une montée mais **ne RETIRE JAMAIS un palier en trop** (invariant du 11/08). C'est donc le prompt, et lui seul, qui empêche Milo d'écrire cinq paliers sur un accessoire — exactement le bug que ft-v887 avait corrigé. Règle restaurée, et désormais écrite **avec sa raison** pour que personne ne refasse la coupe.

**⭐ LE CRITÈRE EN SORT NET, ET IL EST RÉUTILISABLE** : *ce que le code **CALCULE** peut sortir du prompt ; ce que le code ne **CORRIGE** pas doit y rester.* La nuance n'est pas cosmétique — elle sépare « l'app fabrique le résultat » de « l'app accepte ce que Milo écrit ».

**⚠️ ET LE GAIN EST MODESTE, C'EST DIT HONNÊTEMENT** : **46 465 → 46 259 caractères**, marge passée de **35 à 241**. Ça débloque la prochaine règle, pas les dix suivantes. *La vraie question n'est pas de compresser du texte : c'est de décider lesquelles des **180 règles** peuvent partir* — et ça, c'est un arbitrage produit, pas une optimisation. ⚠️ Mesuré au passage : **38 % du bloc** touche à seulement **8 thèmes récurrents** (« au plus une question » revient sur **8 lignes**, ~4 000 caractères ; « n'invente rien » sur 8 lignes aussi). Mais la répétition d'une règle dans plusieurs contextes est peut-être **porteuse**, pas gaspillée — on ne coupe pas là-dedans sans preuve, et `tests/milo` est déterministe : il prouve la PRÉSENCE, jamais l'OBÉISSANCE.
Tests : **parcours 770/770**, calculs 241/241, muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. ⚠️ **Pas de contrôle négatif ici** : on ne retire aucun comportement, on retire du texte redondant — le contrôle utile était le témoin de ft-v887, et il a rougi au bon moment. Fichiers : `coach.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v917. |

**BACKEND — 😴🚶 LE SOMMEIL ET LES PAS PEUVENT ENFIN ARRIVER DE LA MONTRE — et un bug latent corrigé au passage (19/08/2026, ft-v916, Code.js)** — Michel : *« et bah voilà, y a plus qu'à automatiser le sommeil sur l'application »*, après qu'on ait comparé son `sleepLog` saisi à son export Garmin sur 10 semaines.

**⭐⭐ LA MESURE QUI DÉCLENCHE TOUT** : la saisie de Michel est bonne **en moyenne** (+12 min sur 10 semaines, sans biais de direction) — mais elle **aplatit ses mauvaises semaines**. Corrélation entre le sommeil réellement mesuré et l'erreur de sa saisie : **r = −0,96** sur les semaines complètes. Semaine du 6-12 août : Garmin disait **5 h 38**, l'app disait **6 h 43**. Or `S.sleepLog` part dans le contexte de Milo — il sous-estimait donc la dette de récupération **exactement les semaines où elle comptait le plus** (R4).

**⚠️⚠️ ET J'AI PROPOSÉ DE « CONSTRUIRE UN PONT » ALORS QU'IL EXISTAIT DÉJÀ** — R23 pour la 2ᵉ fois (après la prise de sang du 27/07). La route `pushHealth` tourne depuis le **16/08** (ft-v880 à ft-v884), Michel l'avait demandée lui-même, elle reçoit déjà les activités et la FC au repos, tous les soirs à 21 h, via son raccourci iOS. Il a fallu *« on a déjà créé un raccourci lol »* pour que j'aille lire le code au lieu de proposer à côté. **Une fonctionnalité non relue est une fonctionnalité qu'on re-propose.**

**⭐ VÉRIFIÉ AVANT DE CODER, PAS SUPPOSÉ** : Michel a ouvert Apple Santé et comparé à l'œil — sommeil ✅ (moyenne 7 jours identique au CSV Garmin au chiffre près), pas ✅ (données quotidiennes complètes), **VFC ⛔** (absente de la liste des types que Garmin Connect synchronise, sur son iPhone — vérifié dans les réglages, pas cherché sur le web). La VFC est donc écartée, et ce n'est pas une limite de la montre : Garmin ne la mesure même pas en instantané, seulement en synthèse hebdomadaire (« Statut VFC »), et cette synthèse ne sort jamais vers Santé.

**👉 CE QUI EST LIVRÉ** : `handlePushHealth_` accepte désormais `sleep` (en HEURES, même unité que `S.sleepLog[].hours` — R2) et `steps`, rangés dans `data.healthDaily` à côté de la FC au repos. **Le téléphone calcule, le serveur ne reçoit qu'un résultat** — jamais le flux d'échantillons bruts, qui referait exploser le stockage comme le 29/07 (réservoir plein à 102 %).

**⭐⭐ ET UN BUG LATENT CORRIGÉ EN CHEMIN, JAMAIS DÉCLENCHÉ JUSQU'ICI** : l'ancienne écriture de `healthDaily` **écrasait toute l'entrée du jour** à chaque appel — inoffensif tant qu'un seul champ (`rhr`) existait, mais un appel n'apportant que le sommeil aurait effacé la FC au repos déjà reçue le même jour, et réciproquement. Passé en **fusion par date** : chaque champ s'écrit sans toucher aux autres. Vérifié par simulation Node (5 cas : RHR seul → sommeil+pas sur le même jour sans effacer le RHR → jour différent → valeur aberrante rejetée sans polluer le reste → aucun champ valide sans exception).

**⚠️ ELLE NE REMPLACE PAS `sleepLog`, ELLE VIENT À CÔTÉ.** Écraser une saisie manuelle depuis un point d'entrée public serait exactement l'erreur que la note de sécurité de la route interdit déjà (règle d'or #3). L'écran de comparaison reste à construire — **volontairement pas ce soir** (R30) : `healthDaily.sleep/steps` sont reçus et stockés, mais rien côté app ne les affiche encore. Noté dans `state.js` pour que ça ne se perde pas.

**⚠️ Pas de bump `sw.js`** : Code.js seul, backend Apps Script (règle du projet). Déploiement automatique via `.github/workflows/deploy-appsscript.yml` dès le push sur `master`. Fichiers : `Code.js`, `state.js`, `CLAUDE.md`. |

**ft-v915 — ⚖️ LE CRU/CUIT EST ÉCRIT, JAMAIS CONVERTI — le biais que le moyennage hebdomadaire ne peut pas absorber** — Michel : *« c'est parti, on ajustera après au pire »*. Dernière brique avant qu'il commence à s'en servir lundi.

**LE DÉFAUT, mesuré le 18/08 et non corrigé jusqu'ici** : la table `_PORTIONS` (37 motifs, `state.js`) **mélangeait le cru et le cuit sans le dire**. Riz **350** kcal/100 g (cru), pâtes **350** (sèches), quinoa **368** (sec) — mais légumineuses **116** (**cuites**). Une ligne de plan *« Riz 80 g + lentilles 120 g »* demandait donc de peser l'un cru et l'autre cuit, **sans un mot**.

**⭐⭐ ET CE N'EST PAS DU BRUIT QUI S'ANNULE SUR LA SEMAINE.** C'est un biais **systématique**, toujours dans le même sens — donc il **survit au moyennage**. C'est la seule classe d'erreur que *« cohérence avant réactivité »* (P19/P20) ne peut pas absorber, et c'est exactement ce qui fait qu'on suit sa nutrition un mois sans comprendre pourquoi rien ne bouge.

**⛔ ON NE CONVERTIT PAS, ON NOMME.** Convertir supposerait un ratio d'absorption d'eau **qu'on n'a pas** — il dépend de la cuisson de chacun. Ce serait inventer un chiffre (**R29**). Écrire l'état coûte trois mots et rend la pesée **reproductible** : *« Riz 100 g (pesé cru) + lentilles 250 g (pesé cuit) »*.

**⚠️ ET LA CONVENTION SUIT L'ALIMENT, PAS UNE RÈGLE GLOBALE.** `docs/CONTEXTE-ACTUEL.md` notait *« protéine animale → cru, féculent → cuit »* ; à l'écriture, ça ne tient pas : le riz s'achète **sec** et se pèse cru, les lentilles arrivent souvent **cuites en boîte**. Forcer une convention unique obligerait à **mentir sur l'un des deux**. Chaque ligne porte donc SON état, modifiable seule — et l'incohérence apparente devient **visible et vraie** au lieu d'être silencieuse et fausse.

**⚠️ « pesé cru » est INVARIABLE, exprès** : accorder *« (cuites) »* pour les lentilles et *« (cru) »* pour le riz demanderait d'accorder en genre et en nombre un texte **déjà passé par les substitutions de régime** (`_adaptMealDesc`) — un accord faux se verrait plus qu'il n'aiderait. Et la forme verbale dit l'**ACTION**, pas seulement l'état.

**⭐⭐ ET LE MÊME PIÈGE EXISTAIT CÔTÉ JOURNAL, EN PIRE** : Open Food Facts donne les valeurs **« telles que vendues »**. Un paquet de pâtes scanné annonce 350 kcal/100 g — c'est du **sec**. Quelqu'un qui pèse ensuite 200 g de pâtes **cuites** enregistre **700 kcal au lieu de 260** : un facteur **×2,7**, tous les jours. Une note prévient désormais, **sans bloquer** (R24) et **uniquement sur les aliments qui gonflent vraiment** — une note qui s'affiche pour tout n'est plus lue.

**⭐ ET `etat` DESCEND ENFIN JUSQU'À LA DONNÉE** : le champ existait depuis la brique 0 (ft-v907) et valait **toujours `null`**. On *savait* que les valeurs d'OFF sont « telles que vendues » — c'était écrit en commentaire, à trois lignes de l'endroit qui ne l'enregistrait pas. **R4, dans le fichier qui documente R4.**

**⚠️ TROIS TÉMOINS DE ft-v899 ONT ÉTÉ ÉTENDUS, PAS AFFAIBLIS** — ils exigeaient *« Œufs brouillés 200 g à l'huile »* **collés**. La tolérance ajoutée ne porte **que** sur le libellé d'état (`( \(pesé (cru|cuit)\))?`) ; l'**adjacence** — ce qu'ils vérifient vraiment, à savoir qu'aucune substitution de régime n'a coupé la phrase — est intacte. *Assouplir un test pour faire passer son propre code est une faute ; l'étendre au format exact de ce qui a changé n'en est pas une — encore faut-il l'écrire.*

**⚠️ Et deux erreurs de ma part, gardées écrites** : mon témoin employait *« Oeufs »* (o+e) là où l'app écrit *« Œufs »* — il ne matchait donc pas l'œuf mais **l'huile d'olive**, et mesurait 10 ml au lieu de 150 g. Et mes regex d'extension portaient `\\(` au lieu de `\(` : un antislash littéral suivi d'une parenthèse ouvrante, donc un motif qui ne pouvait rien attraper. *Deux fautes d'échappement, deux témoins qui semblaient rouges pour une raison qui n'existait pas.*
Tests : parcours 770/770, **calculs 241/241** (+6, bloc 14 ; 3 témoins de ft-v899 étendus), muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 100 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 5 rouges.** ⚠️ Le 6ᵉ témoin est vert des deux côtés, et c'est voulu : il vérifie qu'un aliment où le cru/cuit n'a **aucun sens** (yaourt, amandes, banane) ne reçoit **pas** d'état — il ne surveille pas l'ancien code, il surveille la sur-étiquetage. Fichiers : `state.js`, `app.js`, `index.html`, `tests/calculs/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v915. |

**ft-v914 — ⚖️ MILO PRESCRIVAIT 82,5 kg, UNE CHARGE QUI N'EXISTE PAS DANS UNE SALLE — et c'est la DEUXIÈME fois que Michel le signale** — *« il ne compte pas le déplacement dans la salle, regarde quand il me met 82,5 faut le trouver les poids de 2,5 kilos »*. La première fois, c'était le **15/08**.

**⚠️⚠️ ET LA RÈGLE EXISTAIT DÉJÀ, ELLE EXCLUAIT SIMPLEMENT CELUI QUI ÉCRIT LES CHARGES.** Le 15/08 avait produit `_pasCharge()` (log.js), calibrée sur ses **31 séances** — haltères ×4, barres ×5, machines ×5. Bien faite. Mais sa définition portait cette ligne : *« ne s'applique QU'AUX CHARGES QUE L'APP FABRIQUE »*. Vérifié : **`_pasCharge` n'apparaissait pas une seule fois dans `coach.js`**. L'app avait donc cessé d'écrire 82,5 dans ses propres paliers, pendant que **Milo continuait**. C'est **`BUGS.md` famille 15** dans sa forme exacte — *la règle juste, définie trop étroit* — et **R4** : l'information existe, mesurée, et n'atteint pas l'endroit qui en a besoin.

**👉 ET LE CORRECTIF N'EST PAS D'ARRONDIR MILO APRÈS COUP** — ça, ce serait décider à la place de la personne, et **PB-008** tient toujours. C'est de lui **donner la table** pour qu'il écrive 80 ou 85 du premier coup. **⚠️ Une seule table (R2)** : `_PAS_CHARGE_TABLE` est lue par l'app **et** par le prompt — la dupliquer garantirait qu'un jour l'app arrondit à 4 pendant que Milo écrit des 2,5. Un témoin vérifie la concordance des deux.

**⭐⭐ ET LE 2ᵉ DÉFAUT EST STRUCTUREL, trouvé en cherchant pourquoi les séances débordent** — Michel, décrivant sa salle : *« les jambes sont ensemble, les bancs plus ou moins à côté ; quand je fais les jambes et hop après les épaules c'est pas au même endroit »*. La consigne *« construis autour des ancres, PUIS ajoute les accessoires »* **fabrique des zigzags** : squat → militaire → leg extension → élévations = **trois traversées** pour une séance qui n'en demande **qu'une**. Milo ne faisait rien de mal : il appliquait la seule règle d'ordre qu'on lui avait donnée, **sans savoir qu'une salle a une géographie**. On groupe désormais par zone, l'ancre avant ses accessoires **dans** chaque zone — **⚠️ sans toucher à « l'ancre la plus lourde reste en premier »** (physiologique, ça prime) ni au **superset antagoniste**, qui alterne exprès.

**⛔ ET ON NE MODÉLISE PAS LE PLAN DE SA SALLE**, écrit pour que personne ne le reproposse (R30) : ça marcherait pour Michel et pour personne d'autre — Tatiana ne cartographiera pas sa salle (`PERSONAS-FONDATEURS.md` : pas de présupposés). *« Groupe par zone »* marche partout **sans rien demander à personne**, et c'est meilleur à l'entraînement de toute façon.

**⚠️⚠️ ET LE GARDE-FOU DE TAILLE A REFUSÉ MA PREMIÈRE VERSION — c'est le moment le plus utile de la livraison.** Écrite à sa place « logique » (à côté de la définition ancre/accessoire), la règle de zone a fait passer le bloc commun de **46 466 à 47 286 caractères**, pour un plafond de **46 500**. Or ce garde-fou porte, depuis le 12/08, une consigne explicite : *« il mérite une relecture dédiée — **PAS un relèvement de seuil de plus** »*. **Le seuil n'a pas été relevé.** La règle a déménagé auprès du **budget de temps de séance**, où elle a d'ailleurs plus de sens : *une traversée coûte des minutes, sa place est auprès de ce qui compte les minutes.* Prix payé et écrit : générique dans un bloc personnel, elle est répétée par utilisateur au lieu d'être partagée (~300 caractères, sans conséquence mesurable) — elle a vocation à remonter le jour où le bloc commun sera dégraissé.

**⚠️ Et un renvoi directionnel supprimé au passage** : ma version intermédiaire laissait *« la règle d'ORDRE est donnée plus bas »*. C'est exactement ce que **ft-v898** interdit — une position écrite en toutes lettres se périme au premier déplacement. Retiré, pas corrigé.
Tests : **parcours 770/770** (+8, bloc LVII), calculs 235/235, muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 100 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 7 rouges**, exactement les 7 comportements ajoutés. ⚠️ Le 8ᵉ témoin est **vert des deux côtés, et c'est voulu** : il ne surveille pas une régression, il garde la table unique pour l'avenir (R30 — un test peut protéger un invariant, pas seulement un correctif). Fichiers : `coach.js`, `log.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v914. |

**ft-v913 — 💊 L'APP RECOMMANDAIT 20 g DE CRÉATINE PAR JOUR, ET AVERTISSAIT AU-DELÀ DE 5 — deux relectures extérieures du dossier UX** — Michel : *« fais-moi un UX complet de la section nutrition avec des screens pour que je voie avec GPT, voir si tout est cohérent, ainsi que l'autre Claude »*. Les deux revues sont revenues, et **elles convergent sur quatre points** — ce qui, à trois lecteurs indépendants, cesse d'être une question de goût (R22).

**⚠️⚠️ ET LE CONSTAT LE PLUS UTILE PORTE SUR MA MÉTHODE, PAS SUR L'ÉCRAN.** Mon dossier annonçait, en toutes lettres, *« vérifié en JOUANT le parcours, pas en le décrivant »* — la leçon de la veille (ft-v912). Et **trois de ses captures créatine étaient identiques** : je n'avais pas appliqué ce parcours à l'onglet Suppléments, j'avais photographié le même écran trois fois en changeant la légende. *Écrire la règle en tête d'un document ne la fait pas appliquer au bas de ce même document.*

**⭐⭐ C'EST EN CHERCHANT POURQUOI ELLES ÉTAIENT IDENTIQUES QUE LE VRAI DÉFAUT EST SORTI** : `creatPhase` démarrait sur **`'charge'`**. Quiconque ouvrait simplement l'onglet Suppléments lisait donc **20 g/jour, 4 × 5 g** — alors que **depuis la veille** (ft-v910) la même app **avertit au-delà de 5 g**, en expliquant qu'on sort de ce que décrivent les sociétés savantes. *Deux endroits du même écran qui se contredisent* (**R2**), et celui qui parlait le premier était celui qui n'avait rien demandé. **⚠️ La charge n'est pas retirée** — elle reste à un appui, et Michel l'a lui-même relativisée (*« la charge en créatine c'est pas très important »*). C'est le **défaut** qui change : il n'a jamais eu de raison d'être la dose la plus haute, la charge n'ayant jamais fait *mieux* que l'entretien, seulement plus *vite*.

**⚠️ ET LE DÉFAUT ÉTAIT INVISIBLE AUX TESTS, PAR CONSTRUCTION** : tous les témoins existants ouvraient la fiche **après** avoir choisi une phase. *Un test qui règle toujours l'état avant de mesurer ne verra jamais l'état par défaut* — c'est la fenêtre aveugle du témoin, pas son erreur.

**② LA MOYENNE COMPTAIT LA JOURNÉE EN COURS.** Le correctif de ft-v909 (diviser par les jours réellement notés, jamais par 7) était juste, et **le même défaut s'était simplement déplacé d'un cran** : une journée où l'on n'a noté que le petit-déjeuner est comptée comme une journée entière. *Aujourd'hui est, par construction, une journée incomplète* — la compter garantissait un chiffre faux **tous les matins**. La moyenne ne porte plus que sur les **jours terminés** ; tant qu'il n'y en a aucun, elle le dit (« elle apparaîtra dès qu'une journée entière sera derrière toi ») au lieu d'afficher un chiffre.

**③ L'ÉCART SE LISAIT COMME UN REPROCHE.** Avec **un seul** jour noté, la carte annonçait *« 2 367 kcal sous ta cible »* **en orange** à quelqu'un qui venait de faire son tout premier geste. C'est exactement ce qu'on croyait avoir supprimé avec le « 0 / 2 547 » de ft-v909, reporté sur la moyenne. Il faut désormais **3 jours terminés** pour qu'un écart soit affiché — et il est en **gris**, pas en orange : *un écart est un constat, pas une alerte* (P21 — la nutrition ne doit jamais devenir une source de stress).

**④ LE POURCENTAGE DE PROTÉINES ÉTAIT PLAFONNÉ À 100 %** — à deux endroits (la carte et la barre de l'onglet Suppléments). Quelqu'un à **149 %** lisait *« 100 % »* et se croyait exactement sur sa cible. Le plafond a du sens sur une **barre**, qui ne peut pas déborder ; aucun sur un **nombre**. Et le cas le pire est le **kéto**, précisément le régime où les protéines sont contraintes et où le dépassement **EST** l'information.

**⚠️ ET UN TÉMOIN FAIBLE TROUVÉ EN ÉCRIVANT LE CONTRÔLE NÉGATIF** : mon motif cherchait `1[0-9][0-9]` dans le rendu — il attrapait donc « **100** » dans « 100 % », et **passait au vert sur l'ancien code plafonné**. *Un test qui passe des deux côtés ne prouve rien tant qu'on n'a pas vérifié qu'il DOIT rougir d'un côté.* Remplacé par une lecture du nombre (`parseInt(…) > 100`).
Tests : **parcours 762/762** (+7, bloc LVI ; blocs LIII et LV ajustés, avec la justification écrite), calculs 235/235, muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 100 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 9 rouges**, dont celui qui se lit tout seul — `actif=Charge (5-7j) · Dose quotidienne 20g / jour`. Fichiers : `app.js`, `screens.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v913. |

**ft-v912 — 🔄 LA CARTE « OÙ TU EN ES » RESTAIT FIGÉE SUR SON INVITATION** — question de Michel devant l'écran : *« il y a marqué "note ton premier repas", et par la suite ça engendre quoi ? »*.

**⭐ C'EST EN JOUANT LE PARCOURS POUR LUI RÉPONDRE QUE LE BUG EST APPARU** — pas en le décrivant. On appuie sur le bouton (il emmène bien au Journal et ouvre la saisie), on note son shaker, on revient sur Macros… **et la carte dit toujours « note ton premier repas »**. *Un écran se juge le doigt dessus.*

**⚠️ LA CAUSE** : `switchNuTab` re-rendait le **Journal** et les **Suppléments**, jamais les **Macros**. Ce n'était pas un oubli à l'époque — jusqu'à ft-v909, cet onglet ne contenait que des chiffres qui ne bougent pas dans la journée (BMR, TDEE, cible). La carte a changé ça **la veille**, et personne n'a suivi. *La donnée avait changé, l'écran ne le savait pas.*

**👉 Deux chemins corrigés** : revenir sur l'onglet Macros le re-rend, et **noter un aliment rafraîchit la carte immédiatement**, sans même changer d'onglet.
Tests : **parcours 755/755** (+4, bloc LV), calculs 235/235, muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 100 classées 0 trou. **CONTRÔLE NÉGATIF : 2 rouges**, et la sortie montre exactement ce qu'il aurait vu — la carte encore sur *« Note un repas et cette carte te dira où tu en es »* après avoir noté. Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v912. |

**ft-v911 — ⚡ « TES REPAS HABITUELS » — UN APPUI, ZÉRO FORMULAIRE** — Michel, en décrivant sa vraie journée : *« le matin je prends mon shaker de prot, je prends une banane ; le midi deux steaks hachés 5 %, 300 g de viande rouge, 200 g de riz et de la ratatouille ; le soir à peu près la même chose »*.

**⭐ LE CONSTAT QUI DÉCIDE DE TOUT** : quelqu'un qui mange ça tous les jours n'a pas besoin d'un formulaire à cinq champs **trois fois par jour**. C'est le geste, pas le calcul, qui fait abandonner un suivi — et c'est exactement ce que disait son *« même moi ça me saoule de l'utiliser »*.

**⚠️ ON N'INVENTE RIEN ET ON NE STOCKE RIEN DE PLUS.** Un « repas habituel » n'est pas déclaré, il est **observé** dans le journal : les aliments notés **ensemble**, le même jour, sur le même repas. Pas de liste à gérer, pas de bouton « enregistrer ce repas » supplémentaire — *la donnée était déjà là*. Un appui rejoue le tout sur le bon moment de la journée.

**⚠️ AU MOINS DEUX FOIS POUR ÊTRE PROPOSÉ** : une fois c'est un repas, deux fois c'est une habitude. Proposer dès la première ferait de l'écran la liste de tout ce qu'on a mangé (R24).

**⚠️⚠️ ET QUI MANGE DIFFÉREMMENT CHAQUE JOUR NE VOIT RIEN DU TOUT** — pas une section vide, qui serait un reproche déguisé. C'est la limite que **Michel a lui-même posée** quand j'avais conçu la brique sur son seul profil : *« ça c'est moi qui le fais, les autres peut-être pas »* (`docs/PERSONAS-FONDATEURS.md` : Tatiana = absence de présupposés).

**⚠️ La provenance dit « reprise »** (brique 0) : ni une mesure fraîche, ni une saisie manuelle. Sans ça, un chiffre repris finirait par passer pour une mesure. Et un repas **déjà rejoué aujourd'hui** ne se re-propose pas.
Tests : **parcours 751/751** (+7, bloc LIV), calculs 235/235, muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 100 classées 0 trou. Fichiers : `app.js`, `screens.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v911. |

**ft-v910 — 💊 LA DOSE EST LIBRE, ET C'EST L'AVERTISSEMENT QUI REMPLACE LE PLAFOND** — décision de Michel, en une phrase : *« pour moi on laisse le champ libre et il n'y a pas de taux légal en France. Mais avec un avertissement au-delà de 3-5 grammes »*.

**⚠️⚠️ ET IL A RAISON SUR LE FOND — J'AVAIS ÉCRIT FAUX.** L'arrêté du 26/09/2016 fixe une dose journalière maximale de 3 g **pour les compléments alimentaires VENDUS en France** : ça engage le **fabricant** — ce qu'il a le droit de commercialiser et d'inscrire sur l'étiquette — **pas le consommateur**. *Personne n'est hors la loi en prenant 5 g.* Écrire « maximum légal » faisait passer un repère de **commercialisation** pour une **interdiction**, et l'app aurait sermonné quelqu'un qui ne fait rien d'illégal. **C'est exactement la dérive que la Constitution interdit** : on adapte, on n'interdit pas.

**DEUX SEUILS, DEUX TONS — et ne pas les confondre est le cœur du correctif (R11)** : au-dessus de **3 g**, un simple **repère** qui dit *que c'est une règle de commercialisation, pas une limite pour toi* · au-dessus de **5 g**, un **avertissement** — on sort de ce que décrivent les sociétés savantes (3-5 g/j, ISSN), les doses supérieures documentées portent surtout sur des **phases de charge** ou des périodes de 4 à 12 semaines, et les preuves au long cours y sont limitées. **⚠️ Écrit noir sur blanc dans les deux cas : ce n'est pas un risque démontré, c'est une zone peu étudiée.** En dessous de 3 g : ni l'un ni l'autre — *on n'encombre pas un écran pour rien* (R24).

**⚠️ ET LES BORNES DE SAISIE SONT VOLONTAIREMENT LARGES** (0,5 à 30 g) : elles n'existent que pour attraper une faute de frappe, **pas pour brider un choix**. 30 g/j pendant 5 ans est documenté comme toléré chez des sujets sains (Kreider 2017) — l'app n'a aucune raison de décider en dessous. Retour à la suggestion calculée en un geste, et la dose réglée à la main est **exclue du contexte de Milo** : c'est un choix personnel sur un complément, pas un fait sur la personne — le lui envoyer l'inviterait à commenter une décision qui ne lui appartient pas.
Tests : parcours 744/744, **calculs 235/235** (+5), muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données **100 classées 0 trou** (le garde-fou a exigé le classement de `creatDose` avant de laisser passer). **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 3 rouges** — la dose de 8 g n'était tout simplement pas affichable. ⚠️ Un témoin de ft-v908 a été **ajusté, pas affaibli** : la formule « pas un risque démontré » a déménagé vers le seuil des 5 g, et le témoin vérifie désormais ce qui compte vraiment — *que le repère des 3 g ne soit jamais dramatisé*. Fichiers : `app.js`, `state.js`, `tests/calculs/runner.js`, `tests/donnees/donnees-milo.json`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v910. |

**ft-v909 — 🥗 « OÙ TU EN ES » — L'ÉCRAN NUTRITION RÉPOND ENFIN À LA VRAIE QUESTION** — Michel, sur sa propre application : *« même moi ça me saoule de l'utiliser, c'est assez mal fait »* · *« ce n'est pas intuitif ; je veux commencer la semaine prochaine pour voir **où j'en suis** »*.

**⭐ LE DIAGNOSTIC N'EST PAS UN BUG, C'EST UNE QUESTION MAL POSÉE.** L'écran répondait à *« combien il te reste à manger aujourd'hui »* — une question qui n'a de sens **que si on a déjà tout noté**. Celui qui ouvre l'app veut savoir où il en est, pas ce qu'il lui reste à faire pour valider une journée parfaite. La carte est donc **la première chose affichée**, avant l'anneau des macros.

**⚠️⚠️ LA RÈGLE QUI TIENT TOUT LE RESTE : UNE SEMAINE INCOMPLÈTE PRODUIT UNE MOYENNE HONNÊTE.** On divise par le nombre de jours **réellement notés**, jamais par 7, et **on écrit combien il y en a** (« 3 jours notés sur 7 »). *Diviser par 7 quand 3 jours sont notés affiche une sous-alimentation qui n'existe pas* — et c'est exactement le genre de chiffre faux qui fait abandonner un suivi au bout d'une semaine (P21 : la nutrition ne doit jamais devenir une source de stress). Le témoin vérifie les deux : que **1 433** apparaît (4 300 / 3) et que **614** (4 300 / 7) n'apparaît **pas**.

**⚠️ ET ON N'AFFICHE RIEN QUAND ON NE SAIT RIEN** : zéro jour noté → une invitation à noter un premier repas, pas un « 0 / 2 600 kcal » qui se lit comme un reproche. Aujourd'hui non noté alors que la semaine l'est → *« Rien de noté pour l'instant »*, et la moyenne continue de porter sur les jours réels. **On ne fait pas dire à une absence de donnée ce qu'elle ne dit pas** (R29).

**⚠️ Et la carte ne peut pas casser l'écran** : elle est appelée dans un `try` — c'est un ajout, pas un pré-requis. Si elle échoue, la nutrition s'affiche comme avant.
Tests : **parcours 744/744** (+5, bloc LIII), calculs 230/230, muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 100 classées 0 trou. ⚠️ Le témoin a d'abord rougi **à tort** : il comparait du texte formaté, et `toLocaleString` insère une espace insécable étroite (U+202F) différente entre Node et le navigateur — *un test qui échoue sur un caractère d'espacement ne mesure pas ce qu'il annonce*. Fichiers : `screens.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v909. |

**ft-v908 — 💊 L'APP AFFIRMAIT QUELQUE CHOSE DE FAUX, ET TAISAIT CE QUI RELÈVE VRAIMENT DE LA SÉCURITÉ** — contre-audit **v1.2**, le premier écrit **avec accès au dépôt** : chaque constat porte son fichier et sa ligne, et **les cinq ont été revérifiés ici avant correction**.

**① LA SEULE AFFIRMATION FAUSSE DES TROIS FICHES CRÉATINE.** L'app disait : *« la caféine peut réduire l'absorption de la créatine, espace-les de 2 h minimum »*. **L'absorption n'est pas en cause** — la caféine ne modifie ni la captation musculaire ni la pharmacocinétique (Vandenberghe 1996 · Vanakoski 1998). Un antagonisme existe, mais **ailleurs** : sur le temps de relaxation musculaire (Hespel 2002), et les travaux **divergent** sur la perte de bénéfice (pour : Vandenberghe, Hespel ; contre : Doherty 2002, Trexler 2016). **⛔ Et l'espacement de 2 h n'a JAMAIS été testé** : les protocoles portent sur plusieurs jours de caféine quotidienne, pas sur un intervalle dans la journée — la demi-vie de la caféine étant d'environ 5 h, décaler de 2 h ne changerait rien de toute façon. *On imposait une contrainte d'observance pour rien.* **⭐ La leçon de méthode, qui vaut au-delà de la caféine** : les trois dérives du dossier (charge, caféine, glucides) ont la même structure — **un vide comblé par un mécanisme vraisemblable**. Dire *« personne n'a mesuré ça »* est une information, et c'est ce qui distingue l'app de celles qui comblent le vide par du plausible.

**⭐⭐ ② LES CONTRE-INDICATIONS N'ÉTAIENT AFFICHÉES NULLE PART.** L'ANSES déconseille la créatine en cas de **maladie rénale** (avis 2023-SA-0216), et son avis sur les compléments pour sportifs — renouvelé en 2024 — étend la réserve aux **facteurs de risque cardiovasculaire, cardiopathie, atteinte hépatique, troubles neuropsychiatriques, mineurs, grossesse et allaitement**. Elle recommande aussi de **ne pas cumuler les sources** et de choisir des produits conformes à **NF V 94-001 / EN 17444:2021**. *C'est le seul point de tout le dossier qui relève vraiment de la sécurité — donc le seul qui mérite d'être signalé fermement.* **⚠️ À ne pas confondre avec le dépassement des 3 g, qui est RÉGLEMENTAIRE et appelle un ton neutre** : mélanger les deux registres les affaiblit tous les deux (R11 — la hiérarchie compte plus que la présence). On renvoie au médecin, on n'interdit pas (Constitution), et ce n'est pas affiché en rouge (P21).

**③ LA BARRE DE PROTÉINES NE LISAIT PAS LE JOURNAL.** `prot-eaten` était une **saisie manuelle que rien n'alimentait** : deux systèmes de suivi protéique dans la même app, dont l'un ignorait l'autre (**R2** + **R4**). Mesuré par le témoin : avec **60 g déjà notés au journal**, l'app affichait *« il te reste 187 g »* sur une cible de 187. **⚠️ La saisie manuelle reste prioritaire quand elle est remplie** — quelqu'un qui ne tient pas son journal doit pouvoir donner son chiffre, et on ne l'écrase pas (même arbitrage que `manualKcal`).

**⛔ CE QUI N'EST PAS CHANGÉ, ET POURQUOI C'EST ÉCRIT** : la dose de créatine. La formule `0,05 g/kg plafonnée à 5 g` **n'apparaît dans aucune source** — c'est une troisième règle inventée entre deux référentiels qui existent (**3 000 mg/j**, dose journalière maximale française, arrêté du 26/09/2016 ; **3 à 5 g/j** selon l'ISSN). ⭐ **Et l'auditeur corrige ici sa propre v1.1** : il avait d'abord conclu que l'app plafonnait *trop bas*, sur les seules sources anglo-saxonnes — l'ajout des sources publiques françaises **retourne la conclusion**. Baisser la recommandation par défaut de tout le monde est une décision **produit ET de santé** : elle appartient à Michel, pas à une correction de nuit (R29). En attendant, **on affiche le repère réglementaire au lieu de le taire** — un chiffre sans son cadre laisse croire qu'il en est un.
Tests : parcours 739/739, **calculs 230/230** (+7, bloc 13), muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 100 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 6 rouges**, dont celui qui se lit tout seul — `reste=187g cible=187g` avec 60 g mangés. Fichiers : `app.js`, `tests/calculs/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v908. |

**ft-v907 — 🧾 BRIQUE 0 : CHAQUE LIGNE DU JOURNAL PORTE ENFIN SA PROVENANCE** — Michel : *« fais tout ce que tu peux faire »*. Première brique du chantier nutrition, et **la seule qui ne se rattrape jamais**.

**CE QU'UNE ENTRÉE ÉTAIT** : `{date, meal, name, kcal, prot, carbs, fat, ts}` — un **résultat** sans aucune trace de son origine. Ni la quantité mangée, ni la source du chiffre, ni la façon dont il a été saisi, ni l'état de l'aliment.

**⚠️⚠️ POURQUOI CELLE-CI D'ABORD** : tout le reste (base d'aliments, générateur, niveaux de précision) peut se construire dans six mois **sur les données existantes**. Une entrée écrite sans ces champs, elle, ne les retrouvera pas — et chaque jour qui passe en fabrique d'autres. *Le retard est le seul du chantier à être définitif.*

**⚠️ ET LE CHAMP LE PLUS COÛTEUX N'EST PAS LA SOURCE, C'EST LA QUANTITÉ.** Une ligne disait « 380 kcal » sans dire « 250 g de X » : même en connaissant plus tard la bonne valeur au 100 g, **on ne pouvait rien recalculer**. Or le scan et la photo d'étiquette **connaissaient le poids** (champ `af-bc-grams`) — ils ne l'enregistraient simplement pas. C'est **R4** : l'information existait et n'atteignait pas la donnée.

**⭐ DEUX AXES, PAS UN — correction apportée par le contre-audit extérieur** : `saisie` dit **comment** c'est entré (manuel · scan · photo-ia · ia-texte · liste), `origine` dit **d'où vient le chiffre** (utilisateur · off · étiquette · ia · reprise). Les fusionner perdrait l'information dans les deux sens, et « manuel » finirait par désigner deux choses différentes selon le contexte. S'y ajoutent `per100` (les valeurs au 100 g quand la source les donne — c'est ce qui permettra de recalculer) et **`modifie`**, qui dit si la personne a retouché les macros après un remplissage automatique : *une source ne peut plus expliquer un chiffre qu'on a changé à la main.*

**⚠️ ON N'INVENTE RIEN (R29)** : `etat` (cru/cuit) et `q` restent **`null`** quand on ne sait pas. L'état viendra de la base d'aliments (brique 1) — le champ existe dès maintenant pour que les entrées de demain puissent le porter, **pas pour être deviné aujourd'hui**.

**⚠️ ET LA PROVENANCE NE SURVIT PAS D'UNE SAISIE À L'AUTRE** : elle est remise à zéro à l'ouverture du formulaire **et** après l'enregistrement (R15 — le marqueur se pose et se rend). Sans ça, un scan laisserait sa source sur la saisie manuelle suivante : *une provenance fausse est pire que pas de provenance, parce qu'elle se présente comme un fait vérifiable.*

**⚠️ RÉTROCOMPATIBLE** : une entrée sans `v` est une entrée d'avant. On ne la réécrit pas et on ne lui suppose aucune provenance — on saura simplement qu'on ne sait pas.
Tests : parcours 739/739, **calculs 223/223** (+8, bloc 12), muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 100 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 7 rouges**, et la sortie montre exactement l'ancienne forme. ⚠️ Le témoin a dû être réécrit : il sortait d'abord sur `_provFood absente`, rendant **un** rouge au lieu de mesurer les huit comportements (6ᵉ fois — ft-v887, 890, 892, 901, 905, 906). Il passe maintenant par `openAddFood`/`addFoodEntry`, présents des deux côtés. Fichiers : `app.js`, `tests/calculs/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v907. |

**ft-v906 — 🛡️ L'APP PRESCRIVAIT UNE CIBLE QU'ELLE AURAIT SIGNALÉE SI ON L'AVAIT MANGÉE** — trouvé par un **contre-audit extérieur** (une autre instance de Claude, sans aucun accès au code, à partir des seuls `docs/NUTRITION-MOTEUR.md` et `NUTRITION-PHILOSOPHIE.md`), puis **vérifié ici dans le code avant d'y toucher**.

**LE DÉFAUT** : `autoKcal()` était une addition sans plancher — TDEE + objectif + phase + cycle. Le **Gardien** de Milo, lui, alerte sous **1 500 kcal/j chez un homme et 1 200 chez une femme** (`coach.js`, GARDE-FOUS SANTÉ). *Les deux ne se parlaient pas* : c'est **R2** — deux sources pour la même règle — sur un sujet de **santé**.

**⚠️ ET LA MESURE CORRIGE L'AUDIT AU PASSAGE** : il annonçait 947 kcal pour une femme de 55 kg sédentaire en perte ; refait avec nos règles, c'est **1 047** — il avait oublié le **+100 de la phase de charge**. En **décharge**, en revanche, on tombe bien à **847**. *Le défaut est réel, mais plus étroit que décrit* — il mord surtout en décharge et sur les profils sédentaires légers, pas sur les quatre cas de son tableau. On corrige ce qui existe, à la taille où il existe.

**⚠️⚠️ ET L'ASYMÉTRIE EST PIRE QUE LE CHIFFRE, c'est le vrai apport de l'audit** : le Gardien ne s'allume que si la personne **tient son journal**. Or le principe 4 de la philosophie assume qu'une bonne partie ne le tiendra pas. Ceux-là voyaient la cible et n'avaient **aucun** garde-fou. *Le Gardien protégeait exactement la population qui en avait le moins besoin.*

**⚠️ LE PLANCHER NE TOUCHE PAS `manualKcal`** : une cible saisie à la main est celle de la personne, et la lui relever en douce serait décider à sa place (R29 + Constitution : on adapte, on n'interdit pas). Il est en revanche **expliqué à l'écran** — *« ton calcul donnait 847 kcal, la cible est remontée à 1 200 : en dessous ce n'est plus un déficit, c'est une restriction »* — parce qu'une cible qui bouge sans raison visible est pire que pas de plancher (P21 : la nutrition ne doit jamais devenir une source de stress).

**⭐ ET LE MÊME DÉFAUT SUR UN AUTRE LEVIER — LE KÉTO GÉNÉRAIT SA PROPRE ALERTE** : 15 % de protéines passe sous **0,8 g/kg** dès que le poids est élevé par rapport aux calories (100 kg à 1 950 kcal → **0,73 g/kg**). Plancher posé, et ce sont les **lipides** qui absorbent : les 5 % de glucides sont la contrainte qui *définit* le régime, on n'y touche pas.

**⚠️ ET UNE ERREUR DE MON TÉMOIN, gardée écrite** : mon premier jet passait `phase=''` — **une valeur qui n'existe pas** (`nutritionPhase` est un interrupteur à deux positions, 'charge' ou 'decharge', jamais neutre). Il tombait donc dans la branche décharge et mesurait autre chose que ce qu'il annonçait. *Un témoin qui emploie une entrée impossible ne teste pas le produit, il teste une fiction.*
Tests : parcours 739/739, **calculs 215/215** (+9, bloc 11), muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 100 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 4 rouges** — 1 047 et 847 kcal prescrits, aucune explication possible, et le kéto à 0,73 g/kg. ⚠️ Le témoin a dû être réécrit **deux fois** : il plantait d'abord sur `plancherKcalActif is not defined` au lieu de rougir (5ᵉ fois — ft-v887, 890, 892, 901, 905). Fichiers : `state.js`, `screens.js`, `tests/calculs/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v906. |

**ft-v905 — 🎯 LES DEUX ERREURS DE MILO AVAIENT UNE CAUSE DANS LE CODE — et la 2ᵉ était la JUMELLE d'un garde-fou déjà posé** — Michel, captures à l'appui : *« Milo a fait 2 erreurs »*, et il a dû le reprendre **deux fois** dans la même conversation. ⚠️ **J'avais d'abord deviné deux AUTRES erreurs** (un bilan périmé, un record de variante) — plausibles, vérifiables… et fausses. C'est en demandant, puis en lisant ses captures, que les vraies sont apparues. *Deviner ce qu'un utilisateur a vu, c'est réparer ce qui n'est pas cassé* (BUGS.md 12ter).

**① IL S'EST TROMPÉ DE SÉRIE.** Michel avait noté *« barre raque à la 4ème »* sur sa **2ᵉ** série de Larsen ; Milo a débriefé la **3ᵉ**. Michel : *« c'est sur la deuxième série où j'ai posé la barre »* → Milo : *« c'est moi qui ai mal lu, sorry »*. **⚠️ IL NE POUVAIT PAS BIEN LIRE** : la ligne envoyée était une **suite non numérotée** où les paliers et les séries de travail se ressemblent — `40×5(É) 55×3(É) 70×2(É) 75×1(É) 85×5 85×5[💬 …] 85×5`. Pour dire « 2ᵉ série », il fallait compter **en écartant les É au passage**. *On demandait au modèle un travail d'index que le code fait sans se tromper.* **R4/R8 dans sa forme la plus simple** : quand une lecture est fausse, se demander d'abord si l'information était **LISIBLE** — l'app connaissait le numéro, elle ne l'écrivait pas. Les séries de travail sont désormais **numérotées** (`S1 · S2 · S3`) ; les paliers gardent leur `É` **sans numéro**, sinon on recrée la confusion qu'on vient de retirer.

**⭐⭐ ② IL A REPROCHÉ UNE MONTÉE EN CHARGE QU'IL AVAIT LUI-MÊME PRESCRITE.** *« La montée sur le Développé Incliné était trop courte — tu as démarré à 48 kg »* — Michel : *« c'est toi qui m'a dit de prendre ces charges là »* → Milo : *« c'était ma prescription »*. **⛔ ET LE GARDE-FOU EXISTAIT DÉJÀ, DEPUIS LE 15/08** : ce jour-là, exactement le même incident (*« j'ai pas trop compris, je sais pas ce qu'il a branlé »*) avait produit la règle *« on ne reproche pas à quelqu'un une montée que l'APP a écrite »*. **On avait corrigé UN SEUL des deux auteurs possibles.** R8 dit pourtant, noir sur blanc, de chercher les **jumelles** dès qu'on trouve un manque — il y en avait une, et elle a coûté le même incident trois jours plus tard.

**👉 ON NE SE TAIT PAS, ON DIT DE QUI ÇA VIENT.** Une séance chargée depuis le chat porte maintenant `_milo:true`, et le marqueur devient *« ces paliers viennent de TA propre prescription : corrige-les, ne les reproche PAS à la personne »*. La montée reste signalée — elle est vraiment trop courte, et c'est utile pour la fois d'après — mais la correction part sur la **prescription** au lieu de tomber sur la personne. **R29** : un conseil manqué coûte un conseil, un reproche injuste coûte la confiance dans l'outil.

**⚠️ PORTÉE HONNÊTE, écrite dans le code** : le marqueur n'existe que si la séance a été chargée **depuis le chat**. Passée par un **programme enregistré**, elle a perdu son auteur en route — c'était le cas ce jour-là. Seule la consigne du prompt peut alors rattraper, et elle a été amendée : *avant de le dire, regarde qui a choisi ces charges.*
Tests : **parcours 739/739** (+4, bloc LII), calculs 206/206, muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 100 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 3 rouges** — pas de numéro de série, paliers numérotés à tort, et aucune mention de l'auteur des paliers. ⚠️ Le 4ᵉ témoin est vert des deux côtés, et c'est voulu : sans marqueur d'auteur, le reproche normal doit rester — on n'a désactivé aucun contrôle. Fichiers : `coach.js`, `log.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v905. |

**ft-v904 — ⏭️ L'EXERCICE SUIVANT S'OUVRE ENFIN — c'est l'app qui créait les lignes qui l'empêchaient de conclure** — Michel, en décrivant précisément ce qu'il attend : *« je finis ma dernière de développé couché et après je fais les épaules, et quand je valide ma dernière série de couché ça se réduit et l'exercice d'épaule s'ouvre en grand »* — plus, dans le même message, *« j'ai fini ma séance et je n'ai pas vu le message »*. **Ses deux remarques n'en font qu'une** : le message « ⏭️ Ensuite : … » et la bascule sont posés par le **même** morceau de code, donc ils manquent toujours ensemble.

**⭐ REPRODUIT AVANT DE TOUCHER À QUOI QUE CE SOIT**, et c'est ce qui a évité de réparer au hasard : en cochant **toutes** les lignes, ça marche déjà (message + ouverture du suivant) ; en laissant **les paliers d'échauffement non cochés**, il ne se passe **rien du tout**.

**⚠️⚠️ LA CAUSE : « TERMINÉ » SE LISAIT « TOUTES LES LIGNES COCHÉES »** (`every(s=>s.done)`). Or **depuis ft-v887, c'est l'app qui AJOUTE elle-même les paliers d'échauffement**. Quelqu'un qui attaque directement à sa charge de travail — ou qui s'échauffe sans le noter — laisse donc forcément des lignes vides, et son exercice n'est **jamais** considéré comme fini. *L'app crée les lignes qui l'empêchent ensuite de conclure* : le correctif de ft-v887 a fabriqué, sans qu'on le voie, la condition d'échec de ft-v825.

**👉 ON REGARDE LES SÉRIES DE TRAVAIL, PAS LES LIGNES.** L'exercice est fini quand il n'en reste aucune à faire — c'est déjà la définition que le reste de l'app emploie : `finishWorkout` exclut É et W du décompte des séries **comme des records**. On ne change donc pas la règle, on cesse d'en avoir deux (R2).

**⚠️ ET ON NE BASCULE PAS TROP TÔT POUR AUTANT** : une **série de travail** non cochée bloque toujours (elle peut encore être faite), et un exercice qui n'aurait **que** des paliers n'avance pas non plus — sans série de travail validée, rien ne dit qu'on en a fini avec lui (R29 : le coût de l'erreur décide, et ici basculer à tort ferait perdre la série suivante de vue).
Tests : **parcours 735/735** (+3, bloc LI), calculs 206/206, muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 100 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 1 rouge**, exactement le sien — paliers laissés vides → `label:""`, aucune bascule. ⚠️ Les deux autres témoins sont verts des deux côtés, et c'est voulu : l'un fige le cas qui marchait déjà (pour que le correctif ne le casse pas), l'autre l'interdiction de basculer trop tôt. Fichiers : `log.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v904. |

**ft-v903 — 🛑 UNE MISE À JOUR NE TOMBE PLUS PENDANT UNE SÉANCE QUI COMMENCE PAR DU CARDIO — et c'est la DEUXIÈME fois qu'il le signale** — Michel, en séance : *« putain faut éviter de faire une mise à jour quand je suis en séance, ça me nique mon bilan de fin de séance »*. **La première fois, c'était le 15/08 — et elle avait créé ce garde-fou.** Il revient donc sur une règle qui existe et qui n'a pas tenu : *quand la même remarque revient, ce n'est pas la règle qu'il faut réécrire, c'est sa DÉFINITION qu'il faut aller regarder* (`docs/ORIGINE-DES-REGLES.md`).

**⚠️⚠️ LE TROU : « séance en cours » SE MESURAIT AU NOMBRE D'EXERCICES.** La condition lisait `S.wkt.exs.length`. Une séance **commencée mais sans exercice encore saisi** — typiquement **20 minutes de vélo AVANT la musculation, exactement sa séance de ce matin** (ft-v901) — ne comptait donc pas comme une séance. Le seul rempart qui restait était *« on n'applique la mise à jour que sur l'Accueil »* : un simple aller-retour par l'accueil pendant le cardio, et le rechargement tombait au milieu.

**👉 UNE SEULE DÉFINITION, LUE PAR TOUT LE MONDE (R2)** : `_seanceOuverte()` (log.js) — **démarrée** (`startTs`), **ou** avec des exercices, **ou** avec un cardio noté. **⚠️ Pause comprise** : une séance en pause n'est pas une séance finie, et la recharger coûterait exactement ce qu'il décrit — le récapitulatif de fin.

**⚠️ ET ELLE NE SE CONFOND PAS AVEC SA VOISINE, c'est écrit à côté des deux** : `_seanceOuverte()` répond à *« y a-t-il une séance non terminée ? »* (pause **comprise** → retient la mise à jour) ; `_wktEnCours()` répond à *« est-ce que je m'entraîne LÀ, maintenant ? »* (pause **exclue** → tient l'écran allumé, ft-v902). Deux questions voisines, deux réponses différentes, **une seule base** — les fusionner ferait éteindre l'écran d'une séance en pause *ou* recharger l'app pendant qu'elle est en pause, selon le côté choisi.

**⚠️ ET « OUVERTE » N'EST PAS « `S.wkt` EXISTE »** : `renderLog()` crée un objet de séance vide dès qu'on **affiche** l'écran Séance. Sans cette nuance, la mise à jour serait bloquée pour toujours dès que quelqu'un a jeté un œil à l'onglet Séance — un garde-fou qui ne se relâche jamais finit par être désactivé (R19).
Tests : **parcours 732/732** (+6, bloc L), calculs 206/206, muscles 232/232, croisés 50/50, dates 7/7, milo 10/10, données 100 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 2 rouges**, et ce sont précisément les deux siens — *« 20 min de cardio sans exercice »* et *« chrono démarré sans exercice saisi »* laissaient tous deux passer la mise à jour. Fichiers : `log.js`, `app.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v903. |

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
