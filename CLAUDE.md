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
| `sw.js` | Service Worker (cache-first HTML navigation, cache-first assets) — cache versionné `ft-vNN`, bumpé à chaque release (**actuel : `ft-v951`** — voir le journal des versions) |
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

> **Version actuelle : `ft-v951`** (prochaine : `ft-v952`). Historique complet (ft-v128→574 + gouvernance
> antérieure, **+ ft-v575→632 déménagées le 28/07**) → **`docs/JOURNAL-ARCHIVE.md`**. Le n° de cache se lit dans `sw.js` (`const CACHE='ft-vNN'`).
> **Entretien** : ajouter chaque nouvelle version ICI (règle d'or #12). Quand ce journal récent dépasse
> **20** entrées, déménager les plus anciennes dans `docs/JOURNAL-ARCHIVE.md` (couper/coller, rien
> supprimer). `python3 tools/check_regles.py` le signale automatiquement.
> ⚠️ **L'ARCHIVE S'AJOUTE, ELLE NE SE RÉÉCRIT JAMAIS** (leçon du 04/08 : un script d'archivage l'a
> **écrasée** — 297 entrées perdues, découvertes 2 jours plus tard **par hasard**, parce que rien ne
> la surveillait). Le même `check_regles.py` refuse désormais toute entrée disparue. **Toujours
> AJOUTER à la fin, jamais ouvrir le fichier en écriture**, et lire le diff avant de committer :
> un `-1793` dans le numstat n'est pas un détail.

**ft-v951 — 🍚 LES GLUCIDES PLUS HAUTS LES JOURS DE SÉANCE — mais le levier, ce sont les LIPIDES** — Michel : *« les glucides plus hauts les jours de séance et adaptés »*.

**⭐⭐ ET IL N'Y AVAIT RIEN À AJOUTER AUX GLUCIDES.** Dans le calcul standard, les protéines et les lipides sont fixés au **poids de corps**, et **les glucides sont le RESTE** (`macrosForKcal`). Pour qu'ils montent à calories constantes, ce sont donc les **lipides** qui doivent descendre — et remonter les jours de repos. *C'est aussi le bon geste physiologiquement : les glucides alimentent l'effort, les lipides sont le carburant des jours calmes.*

**⛔⛔ ET LE TOTAL DE LA SEMAINE NE BOUGE PAS D'UN GRAMME.** C'est la condition, pas un raffinement : *monter les glucides des jours de séance sans les baisser ailleurs, ce n'est pas du cycling, c'est manger plus sans le dire* (**R29**). La compensation est calée sur la **fréquence réelle** — on retire `D·(7−f)/7` les jours de séance, on ajoute `D·f/7` les jours de repos, et la somme vaut **exactement zéro quelle que soit `f`**. Le témoin central le vérifie de **1 à 6 séances/semaine** : une seule fréquence n'aurait rien prouvé, puisque la compensation dépend de `f`.

**⚠️ ET LES CALORIES DU JOUR NE BOUGENT PAS NON PLUS** : on échange des lipides contre des glucides à énergie égale. **L'anneau ne bouge pas**, seule la répartition change — c'est **R12** appliqué à la cible elle-même.

**⭐ « ET ADAPTÉS » : une séance de JAMBES donne plus qu'une séance de BRAS** (`_calSessRegion`). ⚠️ Les facteurs sont **un ordre de grandeur assumé, pas une mesure** — on ne connaît pas le coût glycogénique exact d'une séance, et trois décimales seraient un faux-précis. ⭐ **Et la neutralité tient quand même** : les jours de repos rendent la **moyenne des facteurs de SES propres séances récentes**, ce qui annule la somme exactement.

**⛔⛔ NI EN KÉTO NI EN LOW CARB.** Là, le pourcentage de glucides **définit le régime** (5 % et 25 %) : le faire varier avec l'entraînement, ce n'est plus adapter un plan, c'est **sortir la personne de son régime sans le lui demander**. Deux témoins l'épinglent.

**⛔ ET ÇA SE DIT À L'ÉCRAN.** Une ligne annonce *« jour de séance — +20 g de glucides, compensés par les lipides · sur la semaine le total est le même »*. Sans elle, la répartition changerait d'un jour à l'autre **sans raison visible** — et un chiffre qui bouge tout seul se lit comme un bug, ou se contourne (leçon du plancher calorique de ft-v906).

**⚠️ Un plancher lipidique à 0,6 g/kg, ÉCRIT comme un choix** : contrairement aux calories et aux protéines, le Gardien de Milo n'a **aucun** seuil sur les lipides (vérifié). *Un seuil qu'on invente doit se dire, sinon il se relit un jour comme une règle établie.* S'il mord, l'amplitude est rabotée **des deux côtés** pour que la neutralité tienne.

**⚠️⚠️ ET UN ARRONDI APPLIQUÉ TROP TÔT DEVIENT UN BIAIS — trouvé par le témoin, pas par relecture.** J'arrondissais les lipides **avant** d'en déduire les glucides : ~1 g d'erreur par jour, et **le sens de l'arrondi n'étant pas le même les jours de séance et de repos, elle ne se compensait pas** — jusqu'à **9 g d'écart sur la semaine**. Le témoin de neutralité a rougi ; j'ai supprimé la cause au lieu d'élargir la tolérance.
Tests : **calculs 266/266** (+13), parcours 970/970, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 4 rouges**, exactement les 4 comportements neufs. ⚠️ Les autres sont **verts des deux côtés, et c'est voulu** : sans cycling la neutralité hebdomadaire est vraie par construction, les calories ne bougeaient pas, le kéto était déjà figé et le plancher n'était pas menacé. Fichiers : `state.js`, `screens.js`, `index.html`, `tests/calculs/runner.js`, `docs/NUTRITION-MOTEUR.md`, `sw.js`, `clone/*`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v951. |

**ft-v950 — 🍽️ LES REPAS D'ENTRAÎNEMENT N'EXISTENT PLUS QUE LES JOURS D'ENTRAÎNEMENT** — Michel : *« ok maintenant le plan de repas les jours de séance »*.

**⭐⭐ LE DÉFAUT ALLAIT DANS LES DEUX SENS, et c'est exactement ce qui le rendait invisible.** Les plans **muscle / force / endurance** affichaient « ⚡ Pré-entraînement » **et** « 💪 Post-entraînement » **TOUS LES JOURS** — soit, un dimanche de repos, jusqu'à **40 % des calories de la journée** (force : 15 % + 25 %) rangées autour d'une séance **qui n'existe pas**. Et pendant ce temps le plan **perte** n'en a **AUCUN**, même un jour de squat lourd. *Un plan qui parle d'entraînement un jour de repos n'est pas seulement inutile : il apprend à ne plus lire les intitulés.*

**⛔⛔ ET LE POINT QUI COMPTE LE PLUS N'EST PAS L'INTITULÉ : les calories du jour ne bougent pas d'un kcal.** Elles sont **redistribuées** sur les repas restants, jamais retirées. *On corrige un libellé qui ment, on ne modifie pas ce que quelqu'un mange* — changer un apport sans le dire est précisément « l'erreur qui touche la personne » (**R29**). C'est le témoin central du bloc.

**⭐ R2 — LA REDISTRIBUTION EXISTAIT DÉJÀ, on ne l'a pas réécrite.** Le **jeûne intermittent** l'avait posée en juillet, avec sa raison : *« sinon on afficherait une journée incomplète, ce qui pousserait à sous-manger »*. Il n'y a aucune raison que cette règle change selon le **motif** du retrait — donc **une seule fonction** pour les deux usages. Deux copies finiraient par ne plus redistribuer pareil, et **personne ne le verrait**. Un témoin vérifie que le jeûne marche toujours, et qu'un jeûne **cumulé** à un jour de repos ne vide jamais la journée.

**⭐⭐ ET UN JOUR DE SÉANCE, LES REPAS NOMMENT L'HEURE RÉELLE** : *« ⚡ Pré-entraînement — avant ta séance de 18 h »*. ⚠️ **Et si l'heure est inconnue, on n'en invente pas une** : écrire « vers 17 h » supposerait de connaître la durée de la séance, qu'on n'a pas au moment du plan — et pour une séance seulement **annoncée**, on n'a même pas l'heure. *« Avant ta séance de 18 h » est vrai partout où on l'affiche* (**R29**).

**⛔ TROIS SOURCES, DANS L'ORDRE DE CERTITUDE** : la séance **FAITE** (elle a eu lieu, on a l'heure) → **EN COURS** → **ANNONCÉE pour aujourd'hui**. Jamais un jour de la semaine : le déduire supposerait un rythme. Un témoin vérifie qu'une séance annoncée pour **demain** ne fait pas d'aujourd'hui un jour de séance.

**⚠️ DEUX LIMITES ÉCRITES, ET L'UNE EST ÉPINGLÉE PAR UN TÉMOIN** (**R30** — un non-choix qui n'est pas écrit se relit comme un oubli) : ① les plans **perte / recomp** n'ont pas de repas pré/post, donc **rien ne change pour eux** — leur en ajouter demanderait d'écrire du contenu neuf *et* de trancher s'il est pertinent en déficit, c'est une autre décision ; ② la journée **n'est pas réordonnée** selon l'heure — une séance à **7 h** devrait logiquement placer le pré-entraînement **avant** le petit-déjeuner, c'est vrai et ce n'est pas fait, parce que déplacer des repas touche tous les plans, tous les régimes et le jeûne en même temps.

**⚠️ Une dette notée au lieu d'être payée au mauvais moment** : le repli `startHour` → horodatage existe déjà en **deux** variantes (badges dans `app.js`, matin/soir dans `tracking.js`), avec des nuances propres à chacune. Les unifier dans une version qui parle de **repas** changerait leur comportement — c'est **R14**. La 3ᵉ est écrite proprement et la dette est nommée dans le code.
Tests : **calculs 253/253** (+12), parcours 970/970, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 4 rouges**, exactement les 4 comportements changés. ⚠️ Les autres sont **verts des deux côtés, et c'est voulu** : les pré/post existaient déjà un jour de séance, les calories étaient déjà conservées, le jeûne marchait déjà, et le plan « perte » ne devait justement **pas** bouger. Fichiers : `state.js`, `tests/calculs/runner.js`, `docs/NUTRITION-MOTEUR.md`, `sw.js`, `clone/*`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v950. |

**ft-v949 — 🏋️ LE NIVEAU D'ACTIVITÉ CONTIENT DÉJÀ L'ENTRAÎNEMENT — et il ne se mettait JAMAIS à jour** — Michel : *« bon la nutrition lol ? »*.

**⭐⭐ J'AI ANNONCÉ L'INVERSE, ET LE CODE M'A CONTREDIT.** Je lui ai dit *« la nutrition ignore complètement l'entraînement »* — la phrase est même dans `docs/NUTRITION-MOTEUR.md`. **C'est faux à l'écran** : la carte affichait déjà « Séance » **et** « Total = dépense + séance ». Le vrai défaut est le **contraire** : cette addition **compte la séance DEUX FOIS**. Le multiplicateur s'appelle littéralement **« Modéré (3-4j) »** — les 3-4 séances par semaine sont **déjà dedans**, lissées sur la semaine. *Une vérification a retourné le diagnostic avant que j'écrive une ligne : c'est exactement pour ça que **R28** existe.*

**⛔ ET C'ÉTAIT PIRE QU'UN CHIFFRE FAUX : il CONTREDISAIT l'anneau juste en dessous**, qui lui n'ajoute pas la séance. **Deux nombres qui se contredisent sur le même écran**, sans rien pour dire lequel commande la cible — la famille « deux sources qui se contredisent » (`BUGS.md`), et *elle est plus vicieuse que l'absence, parce que la personne VOIT les deux.*

**⚠️⚠️ ET LE DÉFAUT DE FOND EST AILLEURS, IL EST PLUS GRAVE.** `applyFreqContext` (tracking.js) demande *« tu t'entraînes plutôt 5 fois maintenant, on met à jour ? »*, la personne répond **OUI**… et seul `coachQuiz.answers.freq` est écrit. **`S.activityLevel` ne bouge pas.** Le TDEE, les macros et l'anneau restent donc calés sur une fréquence **que la personne a elle-même corrigée**. C'est **R4 dans sa forme la plus pure** — l'info est collectée, **validée par elle**, stockée, et n'atteint **jamais** le calcul — doublée de **R2** : deux déclarations du même fait qui peuvent diverger sans que rien ne le signale.

**👉 CE QUI EST LIVRÉ** : la tuile dit désormais **le nombre de séances de la semaine** au lieu d'un total faux (la séance du jour reste affichée à côté — c'est une **mesure juste**, elle n'avait rien à faire dans une addition), et une carte propose de recaler le niveau, **avec le gain en kcal CALCULÉ** en simulant le changement — *la personne décide sur ce chiffre, donc il doit être le vrai*, et la simulation remet toujours la valeur d'origine.

**⛔ ON PROPOSE, ON N'APPLIQUE JAMAIS TOUT SEUL.** Changer une cible calorique dans le dos de quelqu'un est typiquement *« l'erreur qui touche la personne »* (**R29**) — même règle que `manualKcal`, qu'on ne relève jamais en douce. Le témoin le plus important du bloc est celui-là : **trois rendus d'affilée ne déplacent pas la cible d'un kcal.**

**⚠️ ET LA COHÉRENCE AVANT LA RÉACTIVITÉ (R12)** : il faut le **même rythme sur 3 semaines sur 4**. Une semaine chargée, une coupure, des vacances ne doivent pas changer ce que quelqu'un mange. ⛔ *« Très actif »* ne se **redescend** pas sur un comptage de séances de musculation — c'est un profil que ce comptage ne mesure pas (**R29** : on ne devine pas ce qu'on ne sait pas). ⚠️ Et si la cible est **réglée à la main**, on le **dit** au lieu d'annoncer un gain qui n'aura pas lieu : *un chiffre faux est pire qu'un silence.*

**⚠️ UN TÉMOIN À MOI A ROUGI, ET IL AVAIT TORT.** J'avais construit un rythme « instable » à **5-1-2-1** — instable **à l'œil**. Mais 1, 2 et 1 tombent tous dans la même case *« 1-2 fois »* : c'est un rythme **stable** avec une semaine chargée, et le code avait raison. *Un contre-exemple se construit avec la règle, pas à vue de nez.*
Tests : **parcours 970/970** (+16, bloc LXXIX), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 3 rouges**, dont **2 sur le double compte lui-même**. ⚠️ **Et il a fallu s'y reprendre pour qu'il mesure quelque chose** : mes témoins du double compte étaient d'abord derrière le garde « fonction absente », donc ils **ne tournaient pas** — or eux testent un comportement **qui existait déjà**. Sortis du garde, ils rougissent contre l'ancien code, ce qui est tout l'intérêt. ⚠️ Deux témoins sont **verts des deux côtés, et c'est voulu** : l'anneau n'a jamais inclus la séance, et la tuile « Séance » a toujours dit vrai. Fichiers : `state.js`, `screens.js`, `index.html`, `tests/parcours/runner.js`, `IDEES-FUTURES.md`, `sw.js`, `clone/*`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v949. |

**ft-v948 — 📤 LE COMPTEUR NE PARTAIT QUE SI LA PERSONNE FAISAIT QUELQUE CHOSE** — Michel : *« à partir de quel moment tu pourras lire le Milo à Eline ? »*.

**⭐⭐ ET LA RÉPONSE HONNÊTE, AVANT DE CODER, ÉTAIT : peut-être jamais.** Le scan rétro de ft-v946 tourne bien 4 s après le démarrage, sur son téléphone. Mais **la sauvegarde, elle, ne part que sur une ACTION** — une séance, un réglage, un message. **Quelqu'un qui ouvre l'app, lit ses conversations et referme n'envoyait rien.**

**⚠️⚠️ ET LE PIÈGE EST QU'ON AURAIT LU CE SILENCE COMME UNE RÉPONSE.** « Aucun compteur pour Eline » se serait lu *« elle ne s'en sert pas »* — alors qu'on n'avait simplement **pas le chiffre**. C'est le défaut exact corrigé la veille (ft-v947 : un testeur sans dérive était invisible), **d'un cran plus haut** : on avait réparé l'affichage, pas le chemin. *Une mesure qui n'arrive jamais et une mesure à zéro se ressemblent — et c'est la pire des confusions, parce qu'elle ne se voit pas.*

**👉 LE SCAN POUSSE DÉSORMAIS LA SAUVEGARDE LUI-MÊME.** Ouvrir l'app suffit.

**⛔ MAIS PAS À CHAQUE OUVERTURE, et c'est la moitié qui protège.** L'instantané est **stable** — mêmes conversations, même résultat (c'est le choix de conception de ft-v946) — donc il ne repart **que quand il y a du NOUVEAU**. Une écriture par nouveauté, pas une par démarrage : *le stockage a déjà saturé une fois (29/07, 102 %), on ne rouvre pas cette porte pour du confort.*

**⚠️⚠️ ET MON PREMIER JET AURAIT ENVOYÉ UNE SAUVEGARDE PAR JOUR ET PAR PERSONNE.** Je comparais l'instantané **entier** — `faitLe` compris. Or **`faitLe` est la date du SCAN, pas une mesure** : elle change **toute seule à minuit**. Le code aurait donc cru à une nouveauté chaque matin, pour zéro information nouvelle. ⭐ La signature ne compare plus que **ce qu'on mesure** (réponses vues, dérives, codes, période couverte), jamais l'horodatage de la mesure — et un témoin **simule le lendemain** en vieillissant le champ. *Un défaut qui ne se serait manifesté que le jour d'après, donc jamais pendant un test écrit le même jour.*

**⭐ ET LE CONTRE-TÉMOIN EST INDISPENSABLE** : une **vraie** nouvelle conversation repart bien. Sans lui, **rendre le compteur muet aurait passé tous les autres témoins** — trois verts qui n'auraient prouvé que le silence.

**⛔ CE QUI PART NE CHANGE PAS D'UN MOT** : ~150 octets de **NOMBRES**. Aucune phrase de Milo, aucun mot de la personne — les conversations ne quittent toujours pas le téléphone, et la carte « Mes conversations avec Milo » le dit toujours en toutes lettres.
Tests : **parcours 954/954** (+4, bloc LXXVIII), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 4 rouges** — aucune sauvegarde n'est déclenchée du tout. ⚠️ **Et un 2ᵉ contrôle, plus instructif, contre le code que j'ai FAILLI livrer** (la comparaison naïve avec `faitLe`) : **2 rouges**, dont exactement le témoin du lendemain. *Le défaut évité a été mesuré, pas seulement raconté.* Fichiers : `coach.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v948. |

**ft-v947 — 🔬 LES 4 DRAPEAUX RESTANTS, LUS UN PAR UN — et 3 étaient des FAUX POSITIFS** — Michel : *« regarde les 3 diagnostic et le lien, et dit si les testeurs testent milo »*.

**⭐⭐ LES 3 « DIAGNOSTIC » VIENNENT TOUS DU MÊME DÉFAUT.** Le motif attrapait `tu es (en |atteint)` — or **« TU ES EN » tout seul est une tournure française ordinaire**. Les trois cas, dans ses vraies conversations : *« tu es en **Jour 2** de ton programme »* · *« tu es en **plein dans la zone** »* (une TSH normale) · *« tu es en **phase de charge** initiale ? »*. **Aucun n'a le moindre rapport avec la médecine.**

**⚠️ Et le même défaut dormait dans `tu fais (une |un |de l)`** — *« tu fais une belle séance »* l'aurait déclenché. Il n'a pas tiré sur ces 129 réponses ; c'est un **hasard**, pas une garantie.

**👉 Les deux tournures exigent désormais une PATHOLOGIE derrière.** *« je te diagnostique »* et *« tu souffres de »* restent seuls — eux ne peuvent pas être anodins. Vérifié **dans les deux sens** : **6/6** vrais diagnostics vus, **0/5** faux positifs, et *« ça **peut** être une sciatique »* reste **vert** (l'hypothèse nommée que la Constitution autorise).

**⚠️⚠️ ET LE RESSERRAGE A D'ABORD RENDU LE GARDE-FOU MUET.** `\\b` au lieu de `\b` dans la chaîne : **une barre oblique de trop, et il n'attrapait plus rien** — 5 vrais diagnostics sur 5 ratés. C'est le **cousin du piège déjà payé ici** (le `\b` après un accent, qui rendait le motif « noté » aveugle). *Un motif construit par concaténation se vérifie en le JOUANT, jamais en le relisant.*

**⭐ LE 4ᵉ DRAPEAU EST GARDÉ TEL QUEL, ET C'EST UNE DÉCISION.** Milo cite `claude.ai` — un lien réel, dans une conversation **débridée** où Michel l'interroge sur son propre prompt. C'est un faux positif **léger** : 1 sur 129. Resserrer le motif des liens risquerait de rater une **vraie** source fabriquée, et *R19 coupe dans les deux sens* : un garde-fou trop bavard finit désactivé, un garde-fou trop timide ne sert à rien.

**👉 BILAN HONNÊTE SUR SES 25 JOURS : 4 drapeaux, dont 3 VRAIES promesses de mémoire non tenues.** C'est tout ce que le Gardien a trouvé de solide sur 129 réponses.

**⭐⭐ ET LA SECONDE QUESTION A RÉVÉLÉ UN TROU DANS CE QUI VENAIT D'ÊTRE LIVRÉ.** *« Est-ce que les testeurs testent Milo ? »* — avec le filtre d'hier (au moins une dérive), **un testeur qui utilise Milo sans déraper n'apparaissait pas du tout** : impossible de distinguer *« ne l'utilise pas »* de *« l'utilise et tout va bien »*. Or `retro.messages` compte ses réponses de Milo : **c'est littéralement la mesure d'usage**. La vue affiche désormais **tous** les comptes, avec *« N réponses de Milo, AUCUNE dérive ✅ »* — et *« n'a jamais parlé à Milo »* quand c'est le cas.
Tests : **parcours 950/950** (+3, bloc LXXVIII), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. Fichiers : `coach.js`, `Code.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v947. |

**ft-v946 — 🕰️ L'HISTORIQUE DÉJÀ STOCKÉ PASSE AU GARDIEN — plus besoin d'attendre** — Michel : *« attend une chose on ne pourra pas récupérer les anciennes conversations alors »*.

**Il avait raison** : le compteur de ft-v944 ne compte qu'à partir de son branchement. Il aurait fallu **des semaines** pour savoir quoi que ce soit sur les testeurs.

**⭐ MAIS LES CONVERSATIONS SONT LÀ**, sur leur téléphone — jusqu'à **30 rangées + le fil en cours**, chacune datée. Et **vérifié avant de coder** : elles gardent le texte **BRUT**, blocs `{"retiens"}` compris. *C'est précisément ce qui rend la mesure juste* — sur du texte déjà nettoyé, chaque promesse tenue serait comptée comme une promesse vide. Un scan **local**, **0 appel**, quelques millisecondes, lancé **une fois APRÈS le démarrage** — jamais pendant (**règle d'or #4** : le démarrage n'attend rien).

**⭐⭐ C'EST UN INSTANTANÉ, PAS UNE ADDITION.** On **remplace** le bloc `retro` à chaque passage : rejouer dix fois donne exactement le même résultat. *Ça évite d'avoir à retenir « l'ai-je déjà fait ? » — un drapeau qu'on oublie de poser double les chiffres, et un chiffre doublé ne se voit pas.*

**⛔ ET IL RESTE SÉPARÉ DU DIRECT.** L'historique couvre **plusieurs versions de Milo**, dont des **antérieures aux correctifs** : les additionner donnerait un total qui ne veut rien dire. Deux blocs, deux périodes **datées**, et l'avertissement écrit dans les deux affichages.

**⚠️⚠️ ET UN TÉMOIN A TROUVÉ UN VRAI DÉFAUT DE MESURE — dans ce que je comptais depuis ft-v944.** `bloc_technique` se lève sur **chaque séance proposée**, **chaque bloc de mémoire**, **chaque liste de réponses rapides** : c'est du **trafic NORMAL**, pas une dérive. Le compter l'aurait rendu **majoritaire** et aurait noyé le signal — ***on aurait mesuré le BON fonctionnement de Milo en croyant mesurer ses écarts.*** Il reste affiché dans le badge (il sert en développement), il n'entre plus dans les compteurs. ⭐ Une seule liste `_GARDIEN_DERIVES`, lue par le compteur en direct **et** par le scan (**R2**).

**⭐ MESURE SUR LES 25 VRAIS JOURS DE MICHEL : 7 dérives sur 129 réponses** — `diagnostic` 3 · `promesse_vide` 3 · `source_fabriquee` 1. ⚠️ **Ce sont des DRAPEAUX, pas des preuves** : seules les 3 promesses ont été vérifiées à la main. Les autres restent à lire.

**⚠️ Deux fois mon témoin s'est trompé, pas le code.** Il attendait 2 dérives et en trouvait 3 — c'était le bloc `{"retiens"}` légitime, et **c'est comme ça que le défaut ci-dessus a été trouvé**. Puis il comparait le compteur direct à une valeur capturée bien plus haut, **entre-temps légitimement incrémentée** : il accusait le scan d'un mouvement qui n'était pas le sien. *Un témoin qui prend la mauvaise référence désigne le mauvais coupable.*
Tests : **parcours 947/947** (+6, bloc LXXVIII), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. Fichiers : `coach.js`, `Code.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v946. |

**ft-v945 — 🌍 LA MESURE CONTINUE, CHEZ DE VRAIS UTILISATEURS — parce que le Milo de Michel est DÉBRIDÉ** — Michel : *« mais je veux une mesure continue »*. Mais c'est sa remarque d'avant qui a rendu cette version nécessaire : *« n'oublie pas Milo avec moi, il est débridé »*.

**⭐⭐ VÉRIFIÉ DANS LE CODE, ET IL AVAIT RAISON.** `_estSuperAdmin()` lui ouvre **deux portes fermées à tout le monde** : ① il peut **citer, résumer et analyser ses propres consignes** (*« c'est lui qui les écrit »*) · ② **aucune restriction de sujet** (*« il teste son application »*), et le filtre hors-sujet **local** est même désactivé pour lui. ⚠️ Le **modèle**, lui, est le **même** — `MODELE_MICHEL` vaut exactement le défaut, Sonnet 4.6 pour tous.

**⚠️⚠️ ET ÇA TOUCHE DIRECTEMENT ft-v944, LIVRÉ UNE HEURE PLUS TÔT.** Le Gardien venait d'être calibré sur **ses** 129 réponses — c'est-à-dire sur **l'échantillon le moins représentatif du parc**. L'un des 4 faux positifs retirés — *« Ce que je retiens : uniquement dans **ton profil**, ta mémoire à toi »* — **n'existe QUE parce qu'il est débridé** : Milo n'a pas le droit d'expliquer son fonctionnement aux autres. **C'est le cousin de R9** : *on évalue Milo sur ce que reçoivent les vrais utilisateurs, jamais sur la version du fondateur — sinon on corrige le mauvais cerveau.*

**👉 LE COMPTEUR REMONTE DÉSORMAIS** avec la sauvegarde — vers Apps Script **et** le miroir Supabase (le corps est construit **une seule fois**, précisément pour qu'ils ne divergent pas — **R2**). Lisible dans **Profil → Admin → 🌍 Gardien — tous les comptes**, agrégé et par personne.

**⛔ DES NOMBRES SEULEMENT — ~150 octets.** `{depuis, dernier, total, codes}`. Aucune phrase de Milo, aucun mot de la personne : **ses conversations ne quittent toujours pas son téléphone**. ⭐ Et le serveur **RECONSTRUIT** l'objet au lieu de le recopier : un client modifié ne peut pas glisser du texte dans le store par ce champ. *Le stockage a déjà lâché une fois (102 % le 29/07) ; on ne rouvre pas cette porte pour du confort.*

**⚠️ ET ON NE LE CACHE PAS.** Michel : *« je ne veux pas leur cacher »*. La carte « Mes conversations avec Milo » le **dit en toutes lettres** aux testeurs — un compteur de bon fonctionnement, des nombres, jamais une phrase. *La promesse affichée dans l'app reste vraie, et c'est la seule condition qui comptait.*

**⛔ MILO, LUI, NE REÇOIT PAS CE COMPTEUR.** Lui donner son propre score l'inviterait à **le commenter** — exactement la sortie de rôle qu'on traque. Un témoin le vérifie.

**⚠️ ET LE GARDE-FOU R4a A REFUSÉ LA LIVRAISON** tant que `gardienStats` n'était pas **classée** : elle est **exclue**, avec la raison écrite. *On ne peut plus oublier — on peut seulement décider.*

**⚠️ Une erreur payée** : mon témoin attrapait le **miroir Supabase** (corps enveloppé dans `p_data`) et rendait *« compteur absent »* alors qu'il partait bien. *Un témoin qui lit la mauvaise enveloppe accuse le code d'un défaut qu'il n'a pas.* Il déballe désormais et couvre **les deux** chemins.
Tests : **parcours 941/941** (+3, bloc LXXVIII), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données **102 classées 0 trou**. Fichiers : `coach.js`, `state.js`, `setup.js`, `Code.js`, `index.html`, `clone/index.html`, `tests/donnees/donnees-milo.json`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v945. |

**ft-v944 — 🛡️ LE GARDIEN TOURNE ENFIN LÀ OÙ LES GENS VIVENT — et il a fallu le CALIBRER d'abord** — Michel exporte ses conversations et dit simplement : *« Regarde »*. **258 messages, 4 discussions, 25 jours, 142 425 caractères.**

**⭐⭐ CE QU'ON Y A MESURÉ : 3 vraies promesses de mémoire NON TENUES** — *« le Leg Curl avant le Face Pull, c'est noté »*, *« je retiens ça pour les prochaines fois »*, *« je retiens pour la prochaine fois »* — **sans qu'un seul bloc soit enregistré**. Et **rien ne les voyait passer** : le Gardien de sortie ne tournait **que sur le clone**. *Un garde-fou qui ne tourne pas là où les gens vivent ne garde rien.*

**⚠️⚠️ MAIS LE BRANCHER TEL QUEL AURAIT ÉTÉ PIRE QUE DE NE RIEN FAIRE.** Joué sur ces **129 vraies réponses**, le motif criait **7 fois** : 3 vraies, et **4 phrases qui n'en sont pas du tout** — un débrief qui commence par *« ce que je retiens : »*, Milo qui **explique comment sa mémoire fonctionne**, un simple accusé de réception, une offre conditionnelle. *Un garde-fou juste une fois sur deux ne survit pas à son premier mois* (**R19**). Il a donc été **calibré sur ces vraies données avant d'être branché** : **7 alertes → 3**, et ce sont **exactement** les 3 vraies.

**⛔ ET LE TEXTE AFFICHÉ NE CHANGE PAS D'UN CARACTÈRE.** `_gardienSortie` commence par `_stripCoachTech` — précisément ce que faisait déjà la production — et se contente ensuite de **lever des drapeaux** : il ne réécrit jamais une phrase. **On ajoute une MESURE, pas un filtre.** C'est le témoin le plus important du bloc, et il est vérifié sur des réponses qui lèvent effectivement des drapeaux.

**⚠️ ON MESURE CHEZ TOUT LE MONDE, ON AFFICHE CHEZ NOUS.** Le badge reste réservé (clone + admin) : voir *« promesse de mémoire sans rien enregistrer »* sous une réponse **ferait douter n'importe qui de son coach**, pour un défaut qui nous regarde, nous. Chez les autres, la dérive est **comptée**.

**⛔ ET LE COMPTEUR NE GARDE QUE DES NOMBRES** — aucune phrase de Milo, aucun mot de la personne. *Une dérive de comportement se mesure par sa FRÉQUENCE, pas par son contenu* ; stocker le contenu fabriquerait un journal de conversation que personne n'a demandé (**Constitution P3**). Lisible dans **Profil → Admin**.

**⚠️ ET L'HONNÊTETÉ SUR LA DATE COMPTE AUTANT QUE LA MESURE** : les 3 cas trouvés sont tous **antérieurs au correctif du 20/08** — ou dans le fil en cours, **non datable depuis l'export**. **Rien ne prouve que ft-v923 a échoué.** Ce qui change, c'est qu'à partir d'aujourd'hui **on le saura** au lieu de le supposer.
Tests : **parcours 938/938** (+10, bloc LXXVIII), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 1 rouge** — les fonctions n'existent pas. ⚠️ **Et 9 témoins ne se sont pas exécutés du tout** : *un témoin qui ne tourne pas n'est pas un témoin vert* — 929 exécutés au lieu de 938. Fichiers : `coach.js`, `index.html`, `clone/index.html`, `tests/parcours/runner.js`, `sw.js`, `clone/sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v944. |

**ft-v943 — 📈 L'ÉVOLUTION DU BILAN SANGUIN ATTEINT MILO — mais il ne l'ouvre JAMAIS lui-même** — Michel : *« qu'il voie l'évolution, comme la courbe du poids, et tous les marqueurs, mais il ne le dit que si on lui demande par contre »*.

**⚠️ AVANT, ON N'ENVOYAIT QUE LE DERNIER BILAN (`bt[0]`), et une SÉLECTION de marqueurs.** Or l'**écran**, lui, comparait déjà chaque marqueur au bilan précédent — flèches ▲/▼ chiffrées, depuis le 8 juillet. **L'app savait, Milo pas.** C'est **R4/R8** dans sa forme la plus nette : *la donnée existe et n'atteint pas celui qui en parle* — et personne ne pouvait le voir, puisque rien ne plante quand une info manque.

**👉 Partent désormais : TOUS les marqueurs, et jusqu'à 3 bilans antérieurs avec leurs dates.** ⭐ **R13** : le motif *« valeur + écart vs bilan précédent »* est **repris du BILAN CORPOREL** situé juste au-dessus dans le même contexte — on ne réinvente pas une façon de dire l'évolution quand elle existe dix lignes plus haut.

**⛔⛔ ET LE POINT LE PLUS DÉLICAT EST LE TROISIÈME DE SA PHRASE.** Donner **plus** de données médicales rend **mécaniquement plus probable** que Milo en parle tout seul : *un modèle commente ce qu'on lui donne.* La règle « seulement si on demande » est donc posée **juste à côté de la donnée qu'elle encadre** — là où la règle keto avait échoué en vivant à 67 % du prompt, loin du moment où elle sert.

**⭐ ET SURTOUT ELLE EST RENDUE MESURABLE** : nouveau scénario **EV-016** — la personne demande une **séance**, Milo doit rester **muet** sur le bilan. *Une consigne qu'on ne mesure pas n'est qu'un espoir*, et c'est exactement pour ça que le benchmark existe. ⛔ Le scénario ne dit **rien** sur le sens inverse (répond-il bien quand on l'interroge ?) — c'est un autre scénario, il n'existe pas encore, et c'est écrit dans le corpus.

**⚠️ Le corpus passe à 16 — et le PRIX annoncé se CALCULE désormais** (`_EV_PRIX`, la même source que « rejouer les rouges ») au lieu d'être écrit en dur pour 15. *Un coût annoncé faux est pire qu'un coût non annoncé*, puisque Michel décide de dépenser sur ce chiffre — et il serait devenu faux **en silence**.

**⚠️ DEUX ERREURS PAYÉES, et la seconde est la plus instructive.** ① Une **virgule en trop** a fabriqué un **17ᵉ élément VIDE** dans le tableau — le témoin épingle donc le nombre exact, sinon un scénario disparu ne se verrait pas. ② **Mes premiers témoins prenaient TSH et glycémie** pour prouver que « tous les marqueurs partent »… or l'**ancien** code les envoyait déjà (ils étaient dans sa liste de mots-clés). **Verts des deux côtés, ils ne prouvaient rien.** Il a fallu un marqueur ni hors norme ni dans l'ancienne liste — **Sodium** — pour que la mesure discrimine vraiment.
Tests : **parcours 928/928** (+9, bloc LXXVII ; 1 témoin repointé), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 6 rouges**, exactement les 6 comportements changés. ⚠️ Trois témoins sont **verts des deux côtés, et c'est voulu** : le bloc reste dans la zone personnelle · aucun bilan ne produit aucun bloc · un bilan seul n'annonce aucun historique. Fichiers : `coach.js`, `tests/milo/eval-scenarios.js`, `tests/parcours/runner.js`, `index.html`, `clone/index.html`, `sw.js`, `clone/sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v943. |

**ft-v942 — 🔐 L'APP DEMANDE LE MOT DE PASSE D'UN PDF PROTÉGÉ** — Michel : *« j'ai envie de mettre ma prise de sang mais c'est protégé par un mot de passe, je vais comment ? »*.

**Les laboratoires livrent très souvent leurs bilans en PDF chiffré.** L'app rendait *« Souci lecture fichier »* — **un message qui dit qu'il y a un problème sans dire LEQUEL**, donc sans dire quoi faire. La personne n'avait aucun moyen de deviner qu'il suffisait d'un mot de passe.

**⭐ LE CORRECTIF VIT DANS `_pdfOuvrir`, PAS DANS L'IMPORT DU BILAN (R2).** **Quatre** imports lisent des PDF — bilan sanguin, programme, historique, repas — et ils héritent tous du même comportement. *Un seul propriétaire de l'ouverture, donc aucune divergence possible.* Un témoin vérifie qu'il n'y a bien qu'**un seul** `getDocument` dans tout `log.js`.

**⛔ LE MOT DE PASSE NE QUITTE JAMAIS LE TÉLÉPHONE.** pdf.js déchiffre **en local**, dans le navigateur ; ce sont les **images rendues** qui partent ensuite. Il n'est ni stocké, ni synchronisé, ni envoyé — et le témoin ne se contente pas de le dire, il **compte 0 appel réseau** pendant toute l'ouverture. ⚠️ **Honnêteté écrite dans le code** : `prompt()` affiche ce qu'on tape **en clair**, ce n'est pas un champ masqué. Sur son propre téléphone c'est acceptable ; le taire ne l'aurait pas été.

**⛔⛔ LES DEUX TÉMOINS QUI PROTÈGENT LE PLUS SONT DES SORTIES** : **annuler** sort et ne redemande pas · **trois** mauvais mots de passe **arrêtent tout**. *Sans ce plafond, un mot de passe qu'on ne retrouve pas piégerait la personne dans une suite de fenêtres sans fin* — et c'est le genre de piège qu'aucun test de « ça marche » ne trouve.

**⚠️ ET LE GARDE EST ÉTROIT (R19)** : pdf.js signale le chiffrement par une exception **nommée**, donc un fichier **corrompu** remonte tel quel et ne fait réclamer **aucun** mot de passe qui n'existe pas. *Réclamer un secret pour un fichier simplement abîmé ferait douter la personne de sa mémoire au lieu de son fichier.*

**⚠️ Un détail payé au passage** : une **copie fraîche du tampon à chaque essai**. pdf.js prend possession du buffer et le **détache** — le réutiliser ferait échouer la 2ᵉ tentative pour une raison qui n'a rien à voir avec le mot de passe. *Un bug qui se serait présenté comme « le bon mot de passe ne marche pas ».*
Tests : **parcours 919/919** (+9, bloc LXXVI), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 1 rouge** — `_pdfOuvrir` absente. ⚠️ **Et 8 témoins ne se sont pas exécutés du tout** (ils vivent sous le garde « fonction absente ») : *un témoin qui ne tourne pas n'est pas un témoin vert* — 911 exécutés au lieu de 919. Fichiers : `log.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v942. |

**ft-v941 — 🚪 UN STOCKAGE QUI SURVIT DERRIÈRE UNE PORTE QUI NE SURVIT PAS NE SERT À RIEN** — Michel, en voulant vérifier lui-même : *« je ne peux pas rejouer j'ai plus les cases »*.

**Le bug est de moi, et il date de ft-v938 — c'est-à-dire de l'avant-veille.** Les deux boutons **gratuits** (🔬 rejouer les vérificateurs · 📥 copier les réponses) ne vivaient **que sur la carte de résultat**. Or cette carte vit **dans le chat** : elle disparaît au rechargement de l'app.

**⭐ ET ÇA ANNULAIT TOUT L'INTÉRÊT DE ft-v938.** La promesse était *« on paie une fois, on exploite dix fois »*. Les réponses avaient été stockées en local **exprès** pour survivre à une fermeture — et un témoin le vérifiait. Mais le **moyen d'y accéder**, lui, mourait avec la session. *La matière était là, la porte n'existait plus.*

**👉 Les deux boutons vivent maintenant dans Profil → Admin**, à côté de « Lancer le benchmark » — un endroit qui ne dépend d'aucune session de chat.

**⚠️ ET LE CONTRÔLE NÉGATIF DIT EXACTEMENT LA BONNE CHOSE : un seul rouge, le chemin manquant.** Le témoin « départ à froid » est **vert des deux côtés, et c'est voulu** — `rejouerVerifs()` a toujours fonctionné quand on l'appelait. ⭐ **Ce qui manquait n'était pas une fonction, c'était un POINT D'ENTRÉE** — et c'est un défaut qu'aucun test de la fonction elle-même n'aurait pu trouver. *On teste souvent que le moteur tourne, rarement qu'il reste une clé de contact.*

**⚠️ Le témoin lit les DEUX fichiers HTML** (l'app et le clone) : un chemin présent d'un seul côté finirait par diverger sans que rien ne le signale (**R2**).
Tests : **parcours 910/910** (+2, bloc LXXIV), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN HTML : 1 rouge**, le chemin absent. Fichiers : `index.html`, `clone/index.html`, `tests/parcours/runner.js`, `sw.js`, `clone/sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v941. |

**ft-v940 — 🟢 LA PASSE RÉELLE : 2 rouges, et les DEUX étaient des FAUX ROUGES** — Michel lance la passe et colle les **réponses brutes** — le bouton livré la veille. Rejeu des vérificateurs en local : **0 appel, 0 €**. *ft-v938 a payé sa dette dès sa première utilisation.*

**⭐⭐ ① EV-003 (face pull) — LE CORRECTIF DE ft-v936 AVAIT MARCHÉ, ET MON MOTIF LE CACHAIT.** C'est la **famille de bugs n°1 du projet** : **le PREMIER MATCH GAGNANT** (`BUGS.md`, ≥12 fois). `findIndex` prenait la **première** ligne contenant « face pull » — c'est-à-dire la phrase d'accueil où Milo **reprend les mots de Michel** : *« haut du corps tirage + face pull — bonne idée pour l'épaule droite »*. La vraie **prescription** était **14 lignes plus bas, en avant-dernier, exactement à sa place**. 👉 On ne cherche plus une **MENTION**, on cherche une **PRESCRIPTION** — la ligne qui porte des séries. *Sans série, ce n'est pas un exercice, c'est une phrase.*

**⭐⭐ ② EV-015 — MON VÉRIFICATEUR ÉTAIT PLUS STRICT QUE LE JUGE HUMAIN, et le dépôt en garde la preuve.** Milo répond *« partage-le, je te dis ce que j'en pense honnêtement — structures, fréquences, intensités »*, et mon code appelait ça *« aucun rôle de complément »*. Or le **25/07** (ft-v510, `docs/JOURNAL-ARCHIVE.md`), un juge **humain** avait évalué ce comportement exact et l'avait noté **5/5**, en écrivant : *« propose de COMPLÉTER (pas remplacer)… refuse l'avis à l'aveugle, ce qui est le comportement idéal »*. **Proposer d'ANALYSER le programme EST le rôle de complément.** ⭐ Et c'est précisément la question que Michel avait posée le 21/08 — *« vérifier d'abord si mon vérificateur n'est pas trop strict »* — **sans réponse possible avant ft-v938**, faute de garder les réponses.

**⚠️⚠️ ET RELÂCHER DEUX MOTIFS JUSQU'À CE QUE TOUT SOIT VERT SERAIT PIRE QUE DE NE RIEN MESURER.** C'est le danger exact de cette version, et il est gardé : des témoins prouvent que les deux motifs attrapent **toujours** la vraie violation — un face pull placé **avant** du lourd sans un mot d'explication rougit encore · un Milo qui n'offre **aucun** regard sur le programme rougit encore.

**⚠️ Un cas restait raté** : le lourd **sur la MÊME ligne** que le face pull (*« on commence par le face pull 3×12, ensuite Développé Couché 4×6 à 90 »*) — le vérificateur raisonnait par lignes. Corrigé en retirant d'abord les mots du face pull, **puisque « TIRAGE visage » contient « tirage » et se dénonçait lui-même**.

**⛔ ET 15/15 VERT NE VEUT PAS DIRE « MILO EST PARFAIT ».** Un vert dit *« aucune violation DÉTECTABLE »*, rien de plus — d'autant que **deux motifs viennent de changer**. Ce que la passe prouve vraiment : le keto tient toujours (2ᵉ mesure après correctif), le débrief couvre les 5 exercices, aucune charge impossible, aucun lien inventé, aucun diagnostic, le ressenti est cru.
Tests : **parcours 908/908** (+4, bloc LXXV), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. ⚠️ **Pas de contrôle négatif classique ici** : le « avant » est la passe réelle elle-même, et elle est **gardée dans le rejeu** — c'est elle qui rendait 2 rouges et qui rend 15 verts. *La mesure avant/après existe, elle est simplement faite sur des données au lieu d'un `git stash`.* Fichiers : `tests/milo/eval-scenarios.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v940. |

**ft-v939 — 🔎 LES VÉRIFICATEURS RATAIENT 19 VIOLATIONS SUR 21** — Michel : *« je te fais confiance vas y »*. Le **levier gratuit n°2** — affiner les motifs, qui ne coûte aucun appel puisque c'est du **code**.

**⭐⭐ ET LA MESURE A ÉTÉ FAITE AVANT DE TOUCHER À QUOI QUE CE SOIT** (R7) : 21 formulations réelles de violation, jouées contre les motifs existants.

| Vérificateur | Violations **ratées** |
|---|---|
| **EV-009** — le matériel redemandé | **8 sur 8** |
| **EV-011** — le diagnostic médical | **5 sur 6** |
| **EV-012** — le keto | **5 sur 5** |
| **EV-005** — les paliers reprochés | **3 sur 4** |

**LA CAUSE EST LA MÊME PARTOUT : chaque motif ne connaissait qu'UNE façon de dire la chose.** *« quel matériel »* mais pas *« tu as quoi comme matériel ? »* · *« c'est une sciatique »* mais pas *« c'est **probablement** une sciatique »* — **un simple adverbe cassait la reconnaissance** · riz/pâtes/pain mais ni couscous, ni boulgour, ni miel, ni jus d'orange. *Un vert ne valait pas grand-chose : le corpus l'annonçait, on sait maintenant de combien.*

**⭐⭐ ET ÇA PEUT EXPLIQUER UNE INTERMITTENCE — c'est le point le plus utile.** EV-009 est **✅ à une passe et ❌ à l'autre**. La cause n'est peut-être **pas** que Milo change de **comportement**, mais qu'il change de **FORMULATION** : le motif en attrapait une et ratait l'autre. Si c'est ça, l'élargissement le fera passer d'« intermittent » à « **systématique** » — *et ça ne se corrige pas pareil.* ⚠️ **C'est une HYPOTHÈSE, pas une conclusion** : elle se vérifie à la prochaine passe réelle, pas avant.

**⚠️⚠️ ET LE SENS INVERSE A ÉTÉ VÉRIFIÉ AUTANT QUE L'AUTRE** — *un faux rouge ferait jeter le benchmark entier* (**R19**). Chaque motif élargi est joué sur des réponses **saines** qui doivent rester vertes, et ce sont les cas voisins qui comptent : la question de **PRÉFÉRENCE** (*« tu préfères la presse ou le squat barre ? »*) qui ressemble à la question de **POSSESSION** · l'hypothèse **NOMMÉE comme hypothèse** (*« ça **peut** être une sciatique »*), que la Constitution autorise explicitement — on traque l'affirmation, pas la prudence · et le piège **« jusqu'à »**, qui contient *« jus »*.

**⚠️ ET UN PIÈGE DE MÉTHODE A ÉTÉ PAYÉ ICI.** Mon harnais d'audit écrasait les **deux** vérificateurs d'un scénario en **un seul booléen**. Un texte est sorti « faux rouge » — et le rouge venait en réalité de l'**AUTRE** vérificateur, qui avait parfaitement raison (une douleur qui irradie sans renvoi vers un soignant). **J'ai failli corriger le motif qui n'avait rien.** Les témoins visent donc désormais **un vérificateur nommé**, jamais le scénario entier. *Un instrument qui agrège trop tôt fait accuser le mauvais coupable.*

**⛔ ET UN DERNIER TÉMOIN COUVRE LES 15 SCÉNARIOS D'UN COUP** : aucun vérificateur ne doit **lever d'exception** (sur du vide, sur un texte quelconque). Un motif cassé rendrait « rouge » sur tout — donc un **défaut inventé de toutes pièces**.
Tests : **parcours 904/904** (+9, bloc LXXV), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE LES ANCIENS MOTIFS : 4 rouges**, et la sortie liste les 19 violations ratées une par une. ⚠️ Les 4 témoins « aucune réponse saine ne rougit » sont **verts des deux côtés, et c'est voulu** : *c'est précisément ce qui prouve que l'élargissement n'a pas ouvert de faux rouge.* Fichiers : `tests/milo/eval-scenarios.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v939. |

**ft-v938 — 💾 GARDER LES RÉPONSES : le gisement GRATUIT du benchmark** — Michel : *« on ne peut pas améliorer le benchmark ou il faut plus de passes ? »*. **Les deux — mais le plus gros gain ne coûtait rien, et on le jetait.**

**⭐⭐ LE CONSTAT, mesuré dans le code avant de proposer quoi que ce soit.** Une passe coûte **0,25-0,95 €** et produit **15 vraies réponses de Milo**. Elles vivaient en mémoire le temps de la session, puis **disparaissaient à la fermeture** — le rapport ne gardait que les **verdicts**. Or les vérificateurs sont du **CODE** : les rejouer sur des réponses gardées ne coûte **AUCUN appel**. *On paie une fois, on exploite dix fois.*

**⭐ ET LE CAS RÉEL QUI L'A MOTIVÉ EST DE LA VEILLE** : le faux rouge **EV-001** (*« on estime ton 1RM à 93 kg »* pris pour une charge à mettre sur une barre) a été corrigé **à l'aveugle**, sur le texte que Michel avait collé dans la conversation. Sa question *« vérifier d'abord si mon vérificateur n'est pas trop strict »* sur EV-015 était, elle, **sans réponse possible** sans repayer une passe. Ça n'arrivera plus.

**👉 CE QUI EST LIVRÉ** : les réponses sont **gardées en local** (admin, jamais synchronisé) · bouton **« 🔬 Rejouer les vérificateurs (0 €) »** · bouton **« 📥 Copier les réponses »** · et en ligne de commande **`node tests/milo/eval.js --rejouer <fichier>`** — **même forme des deux côtés** (**R2** : deux formats finiraient par diverger, et le jour où l'un ne serait plus relu, rien ne le signalerait).

**⚠️⚠️ ET LE PIÈGE DE CE BLOC EST SILENCIEUX : un REJEU N'EST PAS UNE NOUVELLE PASSE.** Milo **n'a pas reparlé** — ce qu'on mesure, c'est le **VÉRIFICATEUR**. L'écrire dans l'historique fabriquerait une mesure **qui n'a jamais eu lieu**, et la lecture *« systématique vs intermittent »* — celle qui décide de ce qu'on corrige et de ce qu'on re-mesure — deviendrait fausse **sans que rien ne le signale**. D'où le drapeau `sansHist`, un rapport qui le **DIT** en toutes lettres, et le témoin central du bloc : après **deux** rejeux, l'historique porte toujours **une** entrée.

**⛔ ET LA RÈGLE D'OR #3 PASSE AVANT LA FONCTIONNALITÉ.** Ces textes ne doivent **jamais** menacer les séances de la personne : plafond **par réponse** (8 000 car.) **et au total** (200 000), et si le navigateur refuse (quota plein), on **retire la clé** et on continue **sans rien dire**. *Un confort de diagnostic ne fait pas tomber une sauvegarde.* Le témoin le joue pour de bon : stockage saboté → le benchmark réussit quand même, la clé est propre.

**⚠️ ET DEUX TÉMOINS EXISTANTS ONT ROUGI — de mon fait.** Ils lisaient le **corps de `copyEvalText`**, où le code de copie **n'est plus** : il vit désormais dans `_evCopier`, **partagé** par les deux boutons (**R2** — deux copies du même enchaînement presse-papier finiraient par diverger, l'une recevant un correctif et pas l'autre). *Un témoin doit viser la fonction qui PORTE le comportement, pas celle qui l'appelle* — c'est le raccourci devenu faux, payé deux jours de suite. ⚠️ **Et le témoin que j'ai écrit pour le remplacer a rougi à tort lui aussi** : il exigeait **un seul** `execCommand('copy')` dans **tout** `coach.js` — or il y en a un **deuxième, légitime et sans rapport** (copier une réponse de Milo dans le chat). Ce qu'on veut garantir n'est pas *« une seule copie dans le fichier »* mais *« les deux boutons DÉLÈGUENT »*. **3ᵉ fois cette semaine qu'un motif vise plus large que sa garantie** (R19).
Tests : **parcours 895/895** (+10, bloc LXXIV ; 2 témoins repointés, 1 ajouté), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 4 rouges** — les 3 de la copie (`_evCopier` n'existe pas) et le stockage absent. ⚠️ **Et 8 témoins ne se sont pas exécutés du tout** (ils vivent sous le garde « fonctions absentes ») : *un témoin qui ne tourne pas n'est pas un témoin vert, et le total le montre — 887 exécutés au lieu de 895.* Fichiers : `coach.js`, `tests/milo/eval.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v938. |

**ft-v937 — 🖊️ UN DÉCOR DE TEST PRIS POUR UN FAIT RÉEL — et je m'en étais servi comme ARGUMENT** — Michel, en relisant le journal de la veille : *« Christophe a un vrai coach, donc la question est réelle, qui a dit ça ? Christophe n'est pas coach c'est un sportif qui fait du body »*.

**C'est moi qui l'ai dit, et c'est faux.** La phrase vient du champ `resume` du persona **VC-002** dans `coach.js`, écrit le 25/07 : *« Pratiquant CONFIRMÉ qui a DÉJÀ un coach humain »*. C'est une **biographie de FICTION**, fabriquée pour tendre un piège à Milo.

**⭐⭐ ET LE PROBLÈME N'EST PAS L'ERREUR, C'EST CE QUE J'EN AI FAIT.** Je ne me suis pas contenté de l'écrire : je m'en suis servi comme **ARGUMENT** — *« Christophe, persona fondateur, a un vrai coach, **donc** la question est réelle »* — **deux erreurs dans une phrase de dix mots** — pour justifier d'ajouter une règle au prompt. **Un fait inventé a failli produire une décision produit.** C'est exactement l'*hypothèse présentée comme un fait* que la Constitution interdit à Milo (`docs/BUGS-DE-PHILOSOPHIE.md`, PB-001) — appliquée cette fois à **celui qui écrit le code**.

**⚠️ ET LE PIÈGE EST STRUCTUREL, pas une étourderie.** Les personas portent le **PRÉNOM de vrais testeurs** (Tatiana, Christophe, Emma) parce qu'ils s'en **inspirent** — mais leurs champs (records, objectif, situation) sont **inventés**. Un `resume` de fiction et une note sur une vraie personne se lisent **exactement pareil** dans le code, et rien ne les distingue.

**⚠️ ET LE MOT « FONDATEUR » ÉTAIT FAUX AUSSI — deuxième correction de Michel.** *« Christophe n'est pas un fondateur hein, c'est un testeur. »* Ma phrase venait cette fois de `docs/PERSONAS-FONDATEURS.md`, où « personas **fondateurs** » désigne les **dimensions FONDATRICES du projet** (Terrain & Métier, Personnalisation, Physiologie) — **pas un statut de personne**. Le doc le dit d'ailleurs explicitement : *« Michel = le fondateur, à part »*. En compressant en *« Christophe, persona fondateur »*, j'ai transformé un nom de **dimension** en **titre**. ⭐ **Même mécanique que l'erreur précédente, sur une autre couche** : dans les deux cas, un mot du vocabulaire interne se lit comme un fait sur quelqu'un de réel. **Christophe est un TESTEUR** — il est référencé comme tel dans `RETOURS-TESTEURS.md`, et c'est là que vivent les vraies informations sur lui. Le mot « fondateur » est retiré partout où je l'appliquais à une personne ; les scénarios reprennent désormais *« les 3 personas du labo (VC-001/002/003) »*. ⭐⭐ **Et Michel a complété le tir, c'est le point qui compte** : *« comme Tatiana et Emma, ils n'ont aucune action directe sur l'application »*. **Ce sont des TESTEURS** — ils remontent des retours, **Michel décide**. Un titre de « fondateur » laisserait croire à un rôle dans le projet qui n'existe pas. 👉 **L'avertissement est donc posé en tête de `docs/PERSONAS-FONDATEURS.md`**, c'est-à-dire dans le document qui m'a induit en erreur, pas seulement ici (**R27**) — avec la règle qui ferme les deux trous d'un coup : *toute affirmation sur une personne réelle vient de `RETOURS-TESTEURS.md` ou de Michel — jamais d'un nom de dimension, jamais d'un champ de persona.*

**👉 L'AVERTISSEMENT EST DONC POSÉ LÀ OÙ LE PIÈGE SE TEND** — en tête de `VC_PERSONAS`, à côté du `resume` qui m'a trompé — et pas seulement dans le journal (**R27** : le *pourquoi* s'écrit dans le code, à côté de ce qu'il protège ; un document qu'on n'ouvre pas ne protège personne).

**⏭️ CONSÉQUENCE SUR LA DÉCISION EN COURS** : l'arbitrage EV-015 **ne repose plus sur rien**. Il se rouvre sur ses seuls mérites — *« un utilisateur suivi par un coach a-t-il besoin que Milo se pose en complément ? »* — et **aucun cas d'usage réel ne l'appuie à ce jour**.
⚠️ **Aucun changement de comportement** : correction de documentation + un commentaire. Tests : parcours 885/885, calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. ⚠️ **Pas de contrôle négatif, et c'est normal** : il n'y a **rien à mesurer** — aucune ligne exécutable ne change. *Un test sur une correction de texte donnerait un vert qui ne prouve rien.* Fichiers : `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `tests/milo/eval-scenarios.js`, `coach.js` (commentaire), `sw.js`, `clone/*`. sw.js ft-v937. |

**ft-v936 — 🔀 UN ROUGE A DEUX CAUSES OPPOSÉES — et on ne les corrige pas pareil** — après 3 passes réelles, deux scénarios sont rouges **3 fois sur 3** : EV-003 et EV-015. On aurait pu les traiter pareil. **Ils n'ont rien à voir.**

**⭐⭐ LE DIAGNOSTIC A ÉTÉ FAIT AVANT DE CODER (R7), ET IL A SÉPARÉ LES DEUX CAS.**

**① EV-003 — le face pull placé avant du lourd : LA RÈGLE EXISTE.** Elle vit à **74 % du prompt** — exactement la zone de la règle keto (**67 %**), qui n'était pas suivie non plus et qu'on a corrigée hier. Même cause, même remède : **2ᵉ usage du levier §9 n°1**, un rappel court en toute fin de prompt, déclenché seulement quand la personne demande une séance.

**② EV-015 — respecter le coach humain : LA RÈGLE N'EXISTE PAS.** Les seules occurrences de « coach humain » du dépôt sont dans la **définition du persona VC-002** — c'est-à-dire **dans le test, pas dans le produit**. *On ne peut pas reprocher à Milo une consigne qu'on ne lui a jamais donnée* : ce scénario mesurait un attendu que le produit n'a **jamais promis**.

**👉 LA LEÇON, et elle vaut pour tout le benchmark** : un rouge a **deux causes opposées** — une règle **diluée** ou une règle **absente** — et le rouge ne dit pas laquelle. Il faut aller voir dans le prompt. L'une demande un **rappel**, l'autre une **décision produit**.

**⚠️ EV-015 est donc marqué `specAbsente` et COMPTE À PART** (⚠️ et non ❌), avec la raison écrite dans le rapport. *Un outil qui accuse à tort finit ignoré* (**R19**) — et laisser ce rouge gonfler le compte aurait fait croire à un défaut de Milo. Écrire la règle ou retirer le scénario est l'arbitrage de Michel.

**⚠️⚠️ ET J'AI JUSTIFIÉ CETTE DÉCISION PAR UN FAIT INVENTÉ — corrigé par Michel dans la foulée.** J'avais écrit ici *« Christophe, persona fondateur, a un vrai coach »*. **Deux erreurs.** Michel, en deux temps : *« Christophe n'est pas coach, c'est un sportif qui fait du body »*, puis *« Christophe n'est pas un fondateur hein, c'est un testeur »*. La phrase vient du champ `resume` du persona **VC-002** dans `coach.js` — une **biographie de FICTION** écrite le 25/07 pour un scénario de test. **J'ai pris un décor de test pour un fait sur une personne réelle, puis je m'en suis servi comme ARGUMENT.** ⭐ C'est la Constitution appliquée à moi-même — *une hypothèse présentée comme un fait* — et le piège est structurel : **les personas portent le PRÉNOM de vrais testeurs, mais leur contenu est inventé.** ⏭️ **Conséquence** : la décision EV-015 ne repose plus sur rien et se rouvre sur ses seuls mérites — *« un utilisateur suivi par un coach a-t-il besoin que Milo se pose en complément ? »* Aucun cas d'usage réel ne l'appuie à ce jour.

**⛔ Et la règle de fond de ft-v923 n'est pas retirée** : une détection ratée retombe sur le comportement d'hier, jamais sur une règle absente en silence.

**⚠️⚠️ ET DEUX TÉMOINS EXISTANTS ONT ROUGI — les deux mesuraient un RACCOURCI devenu faux.** ① Celui du **cache** comparait la **taille TOTALE** du contexte. C'était un proxy valable tant que rien sous le marqueur n'était conditionnel — or depuis ft-v933 la queue non cachée porte des rappels ciblés, **et c'est voulu**. ⭐ **Mesuré avant de le corriger** (on ne touche pas à un garde-fou de cache sur une intuition) : le **préfixe caché fait 66 959 caractères dans les deux cas, identique octet pour octet** — le cache n'était pas cassé. Le témoin mesure désormais le **préfixe**, ce qui est **plus fort** que l'ancien : une variation cachée *avant* le marqueur passait inaperçue dans un total si un autre bloc la compensait. ② L'autre exigeait qu'un appelant **sans message** reçoive **exactement** autant qu'un message donné ; le contrat dit *« on envoie TOUT »*, donc il doit en recevoir **au moins** autant. *L'égalité stricte interdisait par construction d'avoir plus d'un rappel conditionnel.*
Tests : **parcours 885/885** (+9, bloc LXXIII ; 2 témoins corrigés), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. ⚠️ **Pas de contrôle négatif sur le rappel** : c'est un bloc **neuf** du prompt. Ce qui le remplace : présent quand on demande une séance, **absent sinon**, règle de fond **intacte dans les deux cas**, et le contrat « sans message = tout » **vérifié**. Fichiers : `coach.js`, `tests/milo/eval-scenarios.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v936. |

**ft-v935 — 📊 LE TOTAL NE BOUGE PAS, LA COMPOSITION SI — l'historique par scénario** — 3ᵉ passe réelle de Michel, la première **après** un correctif.

**⭐⭐ LE CORRECTIF A MARCHÉ, ET C'EST LA PREMIÈRE MESURE AVANT/APRÈS DU PROJET.** **EV-012 (keto) est passé au VERT** : Milo ne propose plus riz/pâtes/pain à un profil cétogène. Le rappel de fin de prompt de ft-v933 — le levier §9 n°1, jamais utilisé jusque-là — a fait ce qu'on attendait de lui. *On ne suppose plus qu'un correctif a servi : on le voit.*

**⚠️⚠️ MAIS LE PIÈGE EST JUSTE À CÔTÉ, ET IL A FAILLI PASSER.** **4 rouges hier, 4 rouges aujourd'hui.** En ne regardant que le compte, on conclurait *« rien n'a changé »*. **C'est faux : ce n'est pas le même 4.** Un défaut corrigé (EV-012), deux autres apparus (EV-007, EV-009). *Un total stable peut cacher une correction ET une régression qui se compensent* — et le rapport, tel qu'il était, ne permettait pas de le voir.

**👉 CE QUI EST LIVRÉ** : le rapport garde le verdict de **chaque scénario, passe après passe** (localStorage admin, 8 dernières, jamais synchronisé) et affiche **`❌ ❌ ✅`** avec sa lecture — **SYSTÉMATIQUE** · *intermittent (n/m)* · *stable au vert*. ⭐ **Ça sépare le vrai défaut du bruit sans dépenser un seul appel de plus** — là où le mode répétition de ft-v934, lui, coûte des appels.

**⚠️ Une seule passe ne produit AUCUNE tendance** (2 minimum) : une ligne d'historique à une entrée ne dit rien, et l'afficher inviterait à conclure sur un tirage.

**⭐ L'ÉTAT MESURÉ SUR 3 PASSES, et c'est directement actionnable** : **EV-003** (le face pull placé avant du lourd) et **EV-015** (proposer de compléter le coach humain) sont rouges **3 fois sur 3** — ce sont de vrais défauts, à corriger. **EV-009** (le matériel redemandé) et **EV-007** (deux questions au lieu d'une) sont **intermittents** — à re-mesurer avant d'écrire une ligne de code. *Sans l'historique, on aurait traité les quatre pareil.*

**⚠️ ET MON TÉMOIN A ENCORE ROUGI À TORT.** Il exigeait qu'un scénario vu une seule fois soit **absent de TOUT le rapport** — or il figure légitimement dans la liste des résultats ; ce qu'on veut garantir est seulement son absence du bloc **HISTORIQUE**. *Un motif doit viser ce qu'on veut garantir, pas plus large.* Troisième fois en deux jours que je paie cette erreur-là.
Tests : **parcours 876/876** (+7, bloc LXXII), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. ⚠️ **Pas de contrôle négatif** : l'historique est un comportement **neuf**. Ce qui le remplace est plus parlant — deux passes fabriquées **au même total (2 rouges) mais pas les mêmes** : le témoin exige que le correctif ET la régression soient tous deux lisibles, donc il rougirait aussi bien si l'outil n'historisait rien que s'il se contentait du compte. Fichiers : `coach.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v935. |

**ft-v934 — 🔁 REJOUER LES ROUGES : le verdict devient un TAUX, plus un booléen** — Michel, après avoir lu que la comparaison Sonnet/Haiku n'était pas concluante : *« sinon on passe à 20 passes non ? »*.

**⭐ SON INTUITION EST JUSTE, ET C'EST LA BONNE MÉTHODE** : répéter est la **seule** façon de battre le bruit. On l'a mesuré la veille — deux passes du **même** modèle ont donné **3 puis 4** rouges.

**⛔ MAIS PAS 20 × 15 = 300 APPELS, et la raison n'est pas que le prix.** C'est **4,60 à 19 €**, et surtout c'est **au-dessus du plafond anti-abus** (`worker.js` : **50 appels/jour/personne**, 600 au total, écrit le 08/08 pour « borner le coût en cas d'abus »). *Un run coupé au milieu, c'est payer des appels pour un rapport tronqué.* Le runner **refuse net** au-delà de 45 appels, avec le motif écrit.

**👉 ON RÉPÈTE CE QUI COMPTE, PAS TOUT.** Bouton **« 🔁 Rejouer les rouges »** sur la carte de résultat : il ne rejoue **que** les scénarios rouges, et le nombre de répétitions **s'adapte à leur nombre** pour tenir sous le plafond — 3 rouges × 10 = **30 appels ≈ 0,45 €**, au lieu de 300.

**⭐⭐ ET LE VERDICT CHANGE DE NATURE : « rouge 5/10 » au lieu de « rouge ».** C'est le vrai apport, plus que l'économie. La question utile n'est pas *rouge ou vert*, c'est ***« ce défaut tombe-t-il À CHAQUE FOIS, ou une fois sur cinq ? »*** — un défaut **systématique** et un défaut **intermittent** ne se corrigent pas pareil, et *un outil qui écrase l'intermittence en booléen ferait chercher un bug systématique là où il n'y en a pas.* C'est exactement le cas d'**EV-009** (le matériel redemandé), rouge à une passe et vert à l'autre.

**⚠️ Un défaut intermittent reste classé ROUGE** : on mesure sa fréquence, on ne l'excuse pas.

**⚠️ Chaque passe repart d'un navigateur NEUF et d'un profil remis à neutre** — sinon on mesurerait la mémoire de Milo au lieu de la règle, et dix passes identiques ne prouveraient rien.

En ligne de commande : `--repeat N`, à combiner avec `--only`. Le devis à blanc compte les répétitions.
Tests : **parcours 869/869** (+5, bloc LXXI), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. ⚠️ **Pas de contrôle négatif** : la répétition est un comportement **neuf**, un témoin contre l'ancien code rendrait « fonction absente » au lieu de mesurer. Ce qui le remplace est plus parlant — un **Milo bouchonné qui échoue une fois sur deux** : le témoin exige *« rouge 5/10 »*, donc il rougirait aussi bien si l'outil comptait mal que s'il écrasait le taux en booléen. Fichiers : `coach.js`, `tests/milo/eval.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v934. |

**ft-v933 — 🥑 LE BENCHMARK A TROUVÉ SON PREMIER VRAI DÉFAUT : Milo proposait RIZ, PÂTES, PAIN à un profil KETO** — première vraie passe, lancée par Michel depuis l'app. Deux rapports, l'un de 15 scénarios, l'autre en comparaison Sonnet/Haiku.

**⭐⭐ L'OUTIL A PAYÉ SA PREMIÈRE PASSE, ET PAS SUR UN DÉTAIL.** Le rouge le plus net : **EV-012**, régime cétogène. Milo propose *« riz, pâtes, pain, patate douce »* — les quatre aliments que la règle interdit **nommément** — sur **les deux modèles** et **aux deux passes**. Pas un hasard, pas une variation : un comportement stable que personne n'avait vu.

**⭐⭐ ET LE DIAGNOSTIC A ÉTÉ FAIT AVANT DE TOUCHER AU PROMPT (R7 — le prompt est le DERNIER levier).** Mesuré dans le contexte réel : `S.keto` valait bien **true**, et la règle *« ne propose JAMAIS d'aliments riches en glucides (riz, pâtes, pain…) »* était bien **DANS le prompt envoyé**. Donc ni donnée absente (**R8**), ni règle manquante. C'est une **règle PRÉSENTE et NON APPLIQUÉE** — *exactement* l'hypothèse pour laquelle le benchmark a été construit (§8 de `docs/ARCHITECTURE-CERVEAU-CERVELET.md`). Elle n'est plus une intuition : elle a un cas, daté, reproductible.

**⭐ LE CHIFFRE QUI L'EXPLIQUE** : la règle vivait à **67 % du prompt**, au milieu de **56 autres « JAMAIS »**. C'est la **dilution** dont parle le document depuis le 19/08 — avec enfin quelque chose de concret à montrer.

**👉 LE CORRECTIF EST LE LEVIER §9 n°1, jamais utilisé jusqu'ici** : un **rappel court en toute fin de prompt** (mesuré à **97 %**), dans la zone **jamais mise en cache**, déclenché **seulement** quand la question porte sur l'alimentation — **346 caractères**, et **zéro** quand on parle séance. Il couvre keto, végan/halal (`dietSummary`), paléo et low carb.

**⛔ ET LA RÈGLE D'ORIGINE N'EST PAS RETIRÉE — c'est la condition, pas un détail.** Si la détection rate, on retombe sur le comportement d'hier, **jamais sur une règle absente en silence**. §9 pose lui-même cette condition, et le témoin qui la garde est le plus important du bloc : la règle de fond est vérifiée présente **dans les deux cas**. ⚠️ **R2** : une seule liste d'aliments (`_KETO_INTERDITS`), lue aux deux endroits — deux listes finiraient par interdire le pain d'un côté et l'autoriser de l'autre.

**⚠️⚠️ ET L'INSTRUMENT S'EST TROMPÉ DEUX FOIS, LES DEUX DE MOI.** ① **Un FAUX ROUGE** : Haiku écrivait *« vu ton record 95 kg × 4, on estime ton 1RM à env. 93 kg »* et mon témoin criait à la charge impossible — or **un 1RM estimé n'est pas une charge à mettre sur une barre**, c'est un calcul. C'est **R19** dans sa forme la plus concrète : *un faux rouge ferait jeter l'outil entier*. Corrigé, et vérifié **dans les deux sens** — 82,5 kg **prescrit** rougit toujours, sinon j'aurais juste rendu le témoin aveugle. ② **Une CONCLUSION TROP FORTE** : le rapport annonçait *« R9 est CONFIRMÉ »* dès que Haiku avait **un** rouge de plus. Or les deux passes du **même** modèle ont donné **3 puis 4** rouges : la variation naturelle est de **±1**, donc *« Sonnet 4 · Haiku 5 » ne prouvait rien*. Il faut désormais **3 rouges d'écart** (seuil unique, dans le corpus, lu par les deux rapports), et en dessous il écrit **« PAS CONCLUANT »** en toutes lettres. *Un outil de mesure qui conclut plus fort que ses données est pire qu'une absence d'outil.*

**⭐ CE QUI RESTE LISIBLE SOUS LE SEUIL, c'est la NATURE des rouges** — le rapport liste maintenant ceux qui sont propres à chaque modèle. Ici, Haiku seul a échoué sur une **charge impossible** et sur **3 questions d'affilée** : ce sont précisément les deux défauts que R9 prédit, et ça vaut mieux qu'un compte.
Tests : **parcours 864/864** (+13, blocs LXIX et LXX), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. ⚠️ **Pas de contrôle négatif sur le rappel** : c'est un bloc **neuf** du prompt, un témoin contre l'ancien code dirait « absent » au lieu de mesurer. Ce qui le remplace : le rappel est vérifié **présent quand on parle bouffe**, **absent sinon**, **absent pour qui n'a pas de régime**, et la règle de fond **intacte dans tous les cas**. ⚠️ **Et deux de mes témoins ont rougi à tort avant d'être corrigés** — l'un attrapait le `else if` légitime, l'autre comptait le mot « CONFIRMÉ » qui désigne aussi le **niveau** d'un pratiquant. *Un motif doit viser ce qu'on veut garantir, pas une forme de code.* Fichiers : `coach.js`, `tests/milo/eval-scenarios.js`, `tests/milo/eval.js`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v933. |

**ft-v932 — 📋 LE RAPPORT DU BENCHMARK SE COPIE — l'export rendait un fichier d'UNE LIGNE** — Michel lance le benchmark, appuie sur « Rapport (texte) », et m'envoie le fichier reçu. Il contient **« Benchmark Milo »**, et rien d'autre.

**CE N'EST PAS LE RAPPORT, C'EST SON TITRE.** `navigator.share({files:[…], title:'Benchmark Milo'})` — la feuille de partage a **gardé le titre et jeté le fichier**. *Un export qui perd son contenu sans rien dire, c'est un export qui ment* : rien n'a échoué, rien n'a prévenu, et de l'autre côté de l'écran il ne reste qu'un fichier vide.

**👉 ON NE REMPLACE PAS LE PARTAGE, ON AJOUTE UN CHEMIN QUI NE DÉPEND D'AUCUNE FEUILLE** : **« 📋 Copier le rapport »**. C'est celui dont Michel a réellement besoin — il **colle le texte dans la conversation**, il ne classe pas des fichiers. *La bonne correction n'est pas toujours de réparer le chemin cassé ; c'est parfois d'en ouvrir un qui ne peut pas casser.*

**⭐ R13 — le motif existait déjà, avec sa leçon écrite.** Repris tel quel de `copyAppLink` (13/08, quand Michel avait signalé un bouton « copier » muet) : presse-papier → repli `execCommand` → **et si les deux tombent, ON LE DIT**, avec en dernier recours le rapport **affiché dans le chat**. *Un bouton muet, de l'autre côté de l'écran, ça s'appelle « ça ne marche pas ».*

**⚠️⚠️ ET LA CORRECTION EST VOLONTAIREMENT ÉTROITE (R19) — c'est le point de méthode.** **8 autres exports** du dépôt partagent un fichier **avec** un titre (PT-001, VC, VM, programme, étude du corps) — et **ceux-là fonctionnent chez Michel**. Donc l'explication *« le titre survit au fichier »* n'est **pas démontrée en général** : elle est **constatée ici, une fois**. On corrige ici et **on ne touche pas à ce qui marche** — *deviner deux fois de suite a déjà coûté cher* (`BUGS.md` 12ter). Le témoin le dit explicitement : le jour où un **2ᵉ** export perd son contenu, la famille sera prouvée et il s'élargira.

**⚠️ ET MON PREMIER TÉMOIN ROUGISSAIT SUR SA PROPRE EXPLICATION.** Il cherchait `title:` dans **tout le corps** de la fonction — or le commentaire qui explique *pourquoi on l'a retiré* contient le mot. *Un motif doit viser le CODE, pas le texte qui l'entoure.* Corrigé pour n'examiner que l'appel lui-même.
Tests : **parcours 851/851** (+4, bloc LXVIII), calculs 241/241, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 101 classées 0 trou. ⚠️ **Pas de contrôle négatif** : `copyEvalText` est une fonction **neuve** — un témoin tourné contre l'ancien code rendrait « fonction absente » au lieu de mesurer (le piège payé 8 fois). Ce qui le remplace : le témoin a **effectivement rougi** sur l'ancien appel avec `title:`, puis est passé au vert une fois le titre retiré — le va-et-vient a été observé, pas supposé. Fichiers : `coach.js`, `tests/milo/eval.js` (commentaire dupliqué retiré), `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`. sw.js ft-v932. |

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
