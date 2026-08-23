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

> **Version actuelle : `ft-v975`** (prochaine : `ft-v976`). Historique complet (ft-v128→574 + gouvernance
> antérieure, **+ ft-v575→632 déménagées le 28/07**) → **`docs/JOURNAL-ARCHIVE.md`**. Le n° de cache se lit dans `sw.js` (`const CACHE='ft-vNN'`).
> **Entretien** : ajouter chaque nouvelle version ICI (règle d'or #12). Quand ce journal récent dépasse
> **20** entrées, déménager les plus anciennes dans `docs/JOURNAL-ARCHIVE.md` (couper/coller, rien
> supprimer). `python3 tools/check_regles.py` le signale automatiquement.
> ⚠️ **L'ARCHIVE S'AJOUTE, ELLE NE SE RÉÉCRIT JAMAIS** (leçon du 04/08 : un script d'archivage l'a
> **écrasée** — 297 entrées perdues, découvertes 2 jours plus tard **par hasard**, parce que rien ne
> la surveillait). Le même `check_regles.py` refuse désormais toute entrée disparue. **Toujours
> AJOUTER à la fin, jamais ouvrir le fichier en écriture**, et lire le diff avant de committer :
> un `-1793` dans le numstat n'est pas un détail.

**ft-v975 — ⚖️ « JE NE PEUX PAS METTRE DE POIDS » — la quantité sur une phrase libre** — Michel, capture à l'appui, devant une huile d'olive estimée par l'IA (135 kcal · 15 g de lipides) : *« Je ne peux pas mettre de poids »*.

**⛔⛔ ET C'EST LE MOTIF DE ft-v973, DEUX JOURS DE SUITE : le mécanisme EXISTAIT, posé d'un seul côté.** ft-v972 a donné le rescale par proportion à la modale « **Modifier** l'aliment » ; le formulaire d'**AJOUT**, lui, n'a de champ « Quantité » que si un **pour-100 g** est connu (scan, CIQUAL, recherche). Une phrase estimée par l'IA n'en a pas — donc **aucun réglage**, et quatre chiffres à recalculer soi-même. *Une correction faite d'un côté et pas de l'autre est un oubli, pas un arbitrage* (**R8**).

**⭐⭐ CE QUI REND LA CHOSE POSSIBLE EST CÔTÉ SERVEUR, ET C'EST UNE LIGNE DE CONSIGNE.** Le modèle **choisissait déjà une portion** — sa consigne dit *« si les quantités ne sont pas précisées, estime une portion normale »* — mais **en silence**. Il l'**annonce** désormais (`g`), et une estimation **aveugle** devient une estimation **ANCRÉE**. *Le repère existait dans la tête du modèle ; il ne sortait simplement pas.* C'est **R4** au mot près : l'information ne descendait pas jusqu'à la donnée.

**👉 TROIS SOURCES POUR LA RÉFÉRENCE, DE LA PLUS SÛRE À LA MOINS SÛRE** : ① le `per100` connu (bloc du scan, inchangé) · ② le **poids supposé par l'IA** · ③ le nombre écrit dans la phrase.

**⚠️⚠️ ET L'ORDRE ENTRE ② ET ③ N'EST PAS UN DÉTAIL.** Sur *« 3 œufs et 200 g de riz »*, le nombre écrit ne désigne **qu'un composant** — le prendre pour référence reviendrait à dire que toute l'assiette pèse 200 g. Le poids de l'IA, lui, porte sur le **total**. ⛔ **Mais il n'appartient qu'à LA PHRASE QUI A ÉTÉ ESTIMÉE** : si la phrase change, il est périmé et on ne s'en sert plus. *Une référence qui survit à son sujet est pire que pas de référence : elle a l'air d'un fait.*

**⛔ SANS AUCUN ANCRAGE, AUCUN POIDS INVENTÉ** (**R29**) : des **portions** (½ · 1½ · ×2 · ×3), vraies quelle que soit la portion de départ — *un « ×2 » est juste, un « 60 g » deviné est faux* — et l'écran dit **pourquoi**. ⚠️ Le poids de l'IA est **présenté comme une estimation**, pas comme une mesure (**R32**).

**⛔ ET IL EST BORNÉ CÔTÉ SERVEUR** : au-delà de 5 kg pour un repas, c'est une hallucination et non une portion — *mieux vaut aucun repère qu'un repère faux*. `g` absent reste absent.

**⚠️⚠️ UN DÉGÂT ÉVITÉ DE JUSTESSE, ET IL VAUT D'ÊTRE ÉCRIT** : en synchronisant le clone j'ai fait un `cp` un peu vite et **effacé 91 lignes de `clone/index.html`** — le shim qui isole ses données des vraies. Repéré et restauré. ⭐ **Or un script de synchro existait** (`build_clone.py`), avec justement un garde-fou *« shim clone introuvable — abandon, rien écrasé »*. *Un outil qu'on contourne ne protège rien.* C'est ce qui a mené à la question de Michel juste après — et à la décision de retirer le clone.
Tests : **parcours 1176/1176** (+12, bloc XCIV), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. ⚠️ **Le contrôle négatif serait peu instructif** (le bloc vit sous le garde « `_afMajAncre` absente »), **et il est ailleurs** : les témoins qui comptent sont ceux du **non-empilement** (20 → 30 donne ×2, pas ×2 sur ×2) et du **poids périmé** — deux défauts qui ne se voient qu'à la DEUXIÈME action, donc jamais en testant une fois. Fichiers : `app.js`, `index.html`, `Code.js`, `worker.js`, `clone/*`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v975. |

**ft-v974 — 🔤 LE RAPPORT DE BALANCE LU SUR LE TÉLÉPHONE — gratuit, hors ligne, zéro appel IA** — Michel : *« on construit, parce que je l'utilise souvent — il faut que je te sorte les données de mon ancienne balance »*.

**⭐ L'ÉCHELLE DES SOURCES (R33) MISE EN ŒUVRE POUR LA PREMIÈRE FOIS** : donnée structurée → texte → **OCR** → IA → échec propre. La lecture locale passe **avant** l'appel serveur ; l'appel reste intact derrière, pour tout ce que le lecteur ne sait pas lire.

**⭐⭐ ET LE POINT QUI DÉCIDE DE TOUT N'EST PAS « ÇA LIT », C'EST « ÇA REFUSE DE LIRE QUAND C'EST FAUX ».** Mesuré : en résolution réduite, la protéine de Michel (13,8) sort à **18,8** — faux, et parfaitement **crédible**. Aucune borne physique n'attrape ça. *Ce qui l'attrape, c'est le rapport lui-même* : `gras + eau + protéine + os = poids` tombe à **0,05 kg près** sur ses 5 rapports, et donne ici **90,1 pour 85,2**. Si l'arithmétique ne ferme pas, on ne propose **rien** et on passe la main.

**👉 MESURÉ DANS UN VRAI NAVIGATEUR, PAS ESTIMÉ** : chargement du moteur **0,3 s**, lecture **3,2 à 3,7 s** par rapport, **≈ 2 Mo** téléchargés **une seule fois** et **seulement au premier scan** (règle d'or #4 : rien au démarrage). Sur les 5 rapports : **14 valeurs lues sur 16**, la masse maigre retrouvée par soustraction, **les 4 contrôles verts 5 fois sur 5**.

**⛔⛔ ET LE PLUS IMPORTANT EST CE QU'ON NE LIT PAS.** ① **« Poids cible »** — c'est une valeur **propriétaire** (**R32**), sortie d'un modèle qu'on ne peut pas ouvrir : *le poids cible d'une balance ne devient jamais l'objectif de la personne.* ② **« Graisse sous-cutanée »** est retirée (**R30** — un retrait s'écrit) : mesuré, 13,5 / 14,0 / 14,3 / 14,0 sortent en **135 · 140 · 43 · 140** — la virgule est mangée par le tableau d'impédance voisin, **4 fois sur 5**, et le « 43 » tombe **dans** le domaine plausible. *Aucune équation ne la recoupe : rien ne pourrait la démentir.*

**⛔ UN TIROIR DE CACHE À PART, et c'est ce qui rend la chose viable** : le tiroir normal est **versionné**, donc vidé à chaque livraison — plusieurs par jour en ce moment. Les 2 Mo y seraient re-téléchargés à chaque fois. Ils vivent donc, comme les images, dans un tiroir **jamais vidé par une mise à jour**.

**⚠️⚠️ ET TROIS DÉFAUTS TROUVÉS EN ÉTENDANT MES PROPRES CONTRÔLES, pas en relisant le code :**
**① Un contrôle CIRCULAIRE.** Quand la masse maigre est **déduite** par soustraction, « maigre = poids − gras » se vérifie lui-même : il ne peut pas échouer, donc **il ne mesure rien**. Il n'est plus compté quand la valeur a été déduite. *C'était un vert qui ne prouvait rien.*
**② Une valeur écartée par ses bornes emportait l'équation qui l'aurait démasquée** : « Muscle 4.5 » passait pour une lecture **correcte**, parce que la valeur disparaissait et le contrôle avec. Les **8 valeurs du tableau principal sont désormais obligatoires** — un rapport incomplet est refusé.
**③ `_hideBsScan` attend 1,4 s avant de fermer** : l'écran de scan se serait refermé **en pleine lecture IA**. On ne le ferme plus entre les deux étages, on change son texte.

**⭐ R2 — UN SEUL ENDROIT QUI REMPLIT LE FORMULAIRE**, que la lecture vienne du téléphone ou du serveur. Deux copies auraient divergé, et le correctif d'ordonnancement de **ft-v971** (« `openBodyScanForm` est `async`, il faut l'attendre ») n'aurait plus tenu que d'un côté.

**⚠️ LE RAPPORT D'EXEMPLE DES TESTS EST FABRIQUÉ, ET C'EST VOLONTAIRE** : le lecteur est calibré sur **5 vrais rapports**, mais ceux-ci portent le prénom, l'âge, la taille et la composition corporelle de Michel — **et ce dépôt est public**. Ils restent hors du dépôt ; le témoin reprend la mise en forme exacte avec des chiffres inventés mais cohérents.
Tests : **parcours 1164/1164** (+17, bloc XCIII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : **pas de contrôle négatif séparé, et autant l'écrire** : tout le lecteur est neuf, donc contre l'ancien code le bloc ne dirait qu'une chose — *« la fonction n'existe pas »*. ⭐ **Ce qui tient lieu de contrôle négatif ici est ailleurs, et il est plus instructif** : les **7 erreurs injectées** (protéine, poids, %gras, muscle hors bornes, eau, ligne absente, texte vide) sont **toutes refusées**, et elles ont été jouées AVANT le correctif — deux d'entre elles passaient au vert, c'est ce qui a révélé le contrôle circulaire et le rapport incomplet. ⚠️ **Et un témoin existant a dû être RECIBLÉ** (celui de ft-v971) : le remplissage du formulaire a été sorti de `onBodyScanPhoto`, donc le `await` ne vit plus chez l'appelant. Il épingle désormais les **deux** moitiés — la fonction commune attend l'ouverture, **et** personne d'autre ne rouvre le formulaire dans son coin. *Sinon il aurait suffi de déplacer le code pour le rendre vert.* ⚠️⚠️ Au passage, il **accusait les COMMENTAIRES** : le gros commentaire de ft-v971 vit dans `onBodyScanPhoto` et y nomme `openBodyScanForm` — 4ᵉ fois cette semaine qu'un témoin désigne le mauvais coupable**. Fichiers : `lib/ocr/*` (neuf), `tracking.js`, `constants.js`, `screens.js`, `app.js`, `clone/*`, `sw.js`, `tests/parcours/runner.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v974. |

**ft-v973 — ⬇️ ON DOIT POUVOIR DÉFILER JUSQU'EN BAS — sur TOUS les écrans, pas seulement un** — Michel, capture du Journal à l'appui : *« Beug, je ne peux plus défiler en bas »*. Sa dernière ligne (Riz Basmati) restait coincée sous la barre de navigation.

**⚠️⚠️ ET MA PREMIÈRE HYPOTHÈSE ÉTAIT FAUSSE — c'est la mesure qui l'a dit, pas moi.** Je croyais que ft-v968 (le rangement par repas) avait créé le problème en allongeant la page. **Rejoué sur le code d'avant, avec exactement les mêmes entrées : la dernière ligne finissait déjà à 827 px pour une nav à 770.** *Elle était DÉJÀ cachée.* ft-v968 a ajouté 155 px — il a aggravé, il n'a rien créé. Ce qui a changé, c'est que Michel **utilise vraiment le Journal** depuis cette semaine.

**⛔⛔ LA CAUSE : Safari n'ajoute PAS le `padding-bottom` d'un conteneur flex qui défile à sa hauteur défilable.** Le correctif — *un vrai ÉLÉMENT, lui, est toujours compté* — **existait depuis ft-v670**… mais n'avait été posé que sur l'écran **Progrès**. Les cinq autres gardaient un padding que l'iPhone ignore. **C'est R8/R13 dans leur forme la plus bête** : le motif était bon, il n'avait été appliqué qu'à un seul côté — *une correction faite d'un côté et pas de l'autre est un oubli, pas un arbitrage.*

**⭐ CHROMIUM NE REPRODUIT RIEN**, et c'est le piège : il compte le padding, donc tout marchait déjà chez lui. Le défaut a été mesuré en **simulant** le comportement de Safari (padding annulé) — **4 écrans rouges avant, 0 après**, le contenu finissant partout **44 px au-dessus** de la nav.

**⛔ LES DEUX MÉCANISMES NE SE CUMULENT JAMAIS** : le padding tombe à 8 px partout, l'espaceur porte seul la place. Le laisser donnerait **280 px de vide** sur Chrome, et l'iPhone n'en verrait toujours qu'un — *deux correctifs pour un défaut, c'est un de trop* (**R2**).

**⭐⭐ LE TÉMOIN QUI PROTÈGE LE PLUS EST LE STRUCTUREL** : il lit le DOM, donc il vaut pour **n'importe quel moteur** — et **un écran FUTUR sans espaceur fera rougir la livraison**. *Le correctif de ft-v670 était juste ; ce qui manquait, c'est ce qui empêche de l'oublier ailleurs.*

**⚠️ ET MON PREMIER TÉMOIN DE MESURE ACCUSAIT UN BOUTON INVISIBLE** — un accordéon **replié** (`overflow:hidden`) garde des enfants de hauteur non nulle, donc « le dernier élément » désignait un bouton que personne ne voit. *3ᵉ fois cette semaine qu'un témoin désigne le mauvais coupable.* La mesure porte désormais sur **où finit le contenu**, pas sur un dernier élément à deviner.
Tests : **parcours 1147/1147** (+6, bloc XCII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : **5 rouges lus dans la sortie** (ma fenêtre de lecture a coupé le 6ᵉ témoin ; l'Accueil donne le même `844 > 770` dans la mesure autonome) — et le contrôle est **instructif**, pas un « la fonction n'existe pas » : les 6 témoins **tournent des deux côtés**, ils mesurent une disposition qui existait déjà, mal. Le seul vert des deux côtés est l'écran **Progrès**, et c'est exactement le but : *il portait déjà l'espaceur depuis ft-v670, il ne devait pas bouger***. Fichiers : `style.css`, `index.html`, `clone/*`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v973. |

**ft-v972 — ⚖️ LA QUANTITÉ POUR TOUTES LES ENTRÉES, ET LES CALORIES QUI NE COLLENT PAS** — Michel : *« en fait on ne peut pas modifier le poids, je modifie le nom ça ne change pas la valeur. Il faut rajouter une ligne poids qui va modifier la valeur des calories et des autres lignes »*, puis, découvrant une ligne à **1117 kcal** pour 26 P / 1 G / 1 L : *« putain je ne l'avais même pas vu, j'étais axé sur les calories »*, puis *« et en direct, pas au moment de l'enregistrer »*.

**⭐⭐ LE RESCALE NE DEMANDE AUCUN `per100`.** Ma limite de ft-v962 mordait : le champ n'apparaissait que pour un scan / CIQUAL / recherche. Une ligne tapée à la main — **la sienne** — restait 4 chiffres à recalculer soi-même. On ne rescale donc pas depuis une composition, mais **par PROPORTION** : `X × (nouvelle / référence)`. *Il suffit de connaître la référence, pas la composition pour 100 g.*

**⭐ ET LA RÉFÉRENCE EST DÉJÀ ÉCRITE — DANS LE NOM.** « 30**g** de protéines » porte son ancrage : on lit ce que Michel a mis, au lieu de le lui redemander. Trois sources dans l'ordre : `per100` → `q` enregistré → **le nom**. ⛔ Sans aucun ancrage, **aucun poids inventé** : des **portions** (½ · 1½ · 2 · 3), vraies quelle que soit la portion de départ.

**⛔⛔ ET LES CALORIES DOIVENT COLLER À LEURS PROPRES MACROS.** `4×26 + 4×1 + 9×1 = 117`. Sa ligne en affichait **1117** — un « 1 » de trop, **1 000 kcal** ajoutés à sa journée, et **rien ne le signalait**. ⭐ **Son étiquette réelle l'a confirmé au dixième** : 116,6 kcal et 26,4 g de protéines pour 30 g.

**⛔ ON NE CORRIGE JAMAIS TOUT SEUL** (**R29**) : on montre l'écart, un bouton propose, la personne tranche. *Réécrire un chiffre saisi, c'est décider à sa place.*

**⭐ EN DIRECT À CINQ MOMENTS** — chaque frappe · après un scan · après une estimation IA · en reprenant une entrée du journal · à l'ouverture de la modale. *Attraper à la SAISIE vaut mieux qu'à la relecture : il a vu son 1117 le lendemain, la journée était déjà faussée.* ⭐ **R2** : une **seule** définition de « ces calories sont impossibles », partagée par la saisie et la modification.

**⛔⛔ ET L'ALCOOL NE DÉCLENCHE RIEN.** 7 kcal/g sans champ dédié : une **bière réelle** afficherait **69 %** d'écart, un verre de vin **87 %**. *Un garde-fou qui se trompe sur la bière ne survit pas au premier apéro* (**R19**). Trouvé **en testant les cas limites sur son étiquette**, pas après coup. ⚠️ La liste se **tait** seulement : le même écart sur « blanc de poulet » **crie toujours**, et des calories **manquantes** crient **même sur une bière** — l'alcool ajoute des calories, il n'en retire pas.
Tests : **parcours 1141/1141** (+19, bloc XCI), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. Fichiers : `app.js`, `index.html`, `clone/*`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v972. |

**ft-v971 — 📷 LE SCAN DE BILAN PERDAIT LE POIDS À LA 1ʳᵉ ANALYSE — 4 appels IA au lieu de 2** — Michel : *« c'est la 2ᵉ fois que je scanne, mes poids ne prennent pas sur la première prise d'analyse, il faut que je remette une 2ᵉ fois pour qu'il la prenne en compte. Ça fait 4 appels API au lieu de 2 »*.

**⭐ MESURÉ DANS UN VRAI NAVIGATEUR, PAS DÉDUIT.** C'est la leçon de `BUGS.md` **12quater**, écrite la veille et appliquée cette fois : à la **1ʳᵉ passe, 0 champ sur 16** est trouvé ; à la 2ᵉ, les 16 sont remplis **puis effacés**.

**⛔⛔ LA CAUSE : `openBodyScanForm` est devenue `async` en ft-v758** — le verrou santé y a ajouté `await _healthGate()` — **et l'appelant ne l'attendait pas**. Elle rend donc la main **avant** de construire la grille de champs : `getElementById('bs-weight')` renvoie `null`, rien n'est écrit, puis la construction repart et remplace tout par des champs **vides**.

**⚠️⚠️ ET AUCUNE ERREUR N'ÉTAIT LEVÉE.** Le test `if(el && …)` avalait silencieusement l'absence, et le message **« Rapport lu ✅ »** s'affichait **devant un formulaire vide**. *Un appel vision déjà payé était jeté, et l'écran annonçait un succès.*

**⭐ C'EST R14 DANS SA FORME LA PLUS COÛTEUSE** : *rendre une fonction asynchrone change le CONTRAT DE TOUS SES APPELANTS.* Celui-ci n'avait pas été revu — et le défaut d'ordonnancement se payait en **quota IA**, pas seulement en confort.

**⛔ DEUXIÈME CORRECTIF, AUSSI IMPORTANT QUE LE PREMIER** : le message **compte** désormais les valeurs écrites (*« Rapport lu ✅ 12 valeurs »*) et dit *« aucune valeur reconnue »* quand il n'y en a pas. **C'est précisément ce silence qui a masqué le bug pendant deux imports** — rien ne signalait qu'un appel venait d'être gaspillé.

**⚠️ Et si le verrou santé refuse, on ne remplit pas des champs invisibles** et on ne prétend pas que le rapport est prêt.
Tests : **parcours 1122/1122** (+5, bloc XC), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. Fichiers : `tracking.js`, `clone/tracking.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v971. |

**ft-v970 — 📈 L'ÉVOLUTION DU BILAN CORPOREL ATTEINT MILO — et mon analyse de ce matin était fausse** — Michel envoie **5 rapports de balance pro** sur 27 jours, puis : *« tu avais fait un calcul approfondi sur mes mesures de balance comme quoi il y avait beaucoup de mytho dedans »*.

**⚠️⚠️ IL AVAIT RAISON, ET C'ÉTAIT ÉCRIT DANS LE DÉPÔT.** Deux fois : **ft-v323** (son propre retour — *« masse grasse qui saute de ~15 % à 20,6 % en changeant de balance »*) et **ft-v833** (*« on n'avale pas le chiffre de la balance : il sort d'une formule propre au fabricant, invérifiable »*). **Je ne l'avais pas relu avant de parler** — R23 dans sa forme la plus nette : *une connaissance qu'on ne consulte pas fait dire des bêtises à celui qui l'ignore.*

**⛔⛔ CE QUE J'AVAIS ANNONCÉ NE TENAIT PAS, ET C'EST MESURABLE SUR SES PROPRES CHIFFRES.** J'avais dit *« −1,4 kg de gras, soit 85 % de ce qu'il a perdu »*. Or sa masse maigre fait `69,0 · 68,3 · 69,1 · 69,2 · 68,7` : **jusqu'à 0,8 kg d'écart entre deux mesures consécutives**, quand ma « tendance » sur 27 jours en valait **0,3**. *Ma tendance était plus petite que le bruit.* Côté gras, 1,4 kg de « tendance » pour **1,3 kg** de bruit — un seul écart de mesure. **Ce qui reste vrai : le POIDS (−1,65 kg). Une balance pèse ; le partage gras/maigre, lui, est une déduction.**

**👉 CE QUI EST LIVRÉ** : Milo reçoit désormais les **3 bilans corporels antérieurs avec leurs dates**, exactement comme le **bilan sanguin** depuis ft-v943 (**R13** — le motif existait, il n'avait été appliqué qu'à un côté ; *une correction faite d'un côté et pas de l'autre est un oubli, pas un arbitrage*, corollaire de **R8**).

**⛔ SANS ÇA, CHEZ MICHEL, MILO AURAIT COMPARÉ LE 23/08 AU 22/08** — un jour d'écart, donc de l'eau et du contenu digestif (1,25 kg en 24 h demanderait ~9 000 kcal). *Il aurait commenté du bruit en croyant lire un progrès.* L'écart au bilan précédent est **gardé** — on ajoute l'historique daté, on ne remplace rien.

**⚠️ ET L'AVERTISSEMENT EST ÉCRIT DANS SON CONTEXTE** : deux mesures rapprochées diffèrent par l'**hydratation**, pas par la graisse ; ne jamais commenter une variation de quelques jours comme un progrès ou une régression.
Tests : **parcours 1117/1117** (+8, bloc LXXXIX), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 4 rouges**, exactement les 4 comportements neufs — et **4 verts des deux côtés** (l'écart au précédent, le cas « un seul bilan », le cas « aucun bilan ») : *ils devaient rester intacts.* Fichiers : `coach.js`, `clone/coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v970. |

**ft-v969 — 🧮 D'OÙ VIENT LE CHIFFRE DE PROTÉINES** — Michel, devant l'onglet Suppléments : *« sur cette image c'est la portion ou juste le nombre de protéine ? »*.

**⭐⭐ LA QUESTION ELLE-MÊME ÉTAIT LE DÉFAUT.** Le champ s'appelle « Protéines mangées (g) » et ne dit **jamais qui le remplit**. Quand le Journal porte des protéines, le champ reste **vide avec un placeholder « 0 »** pendant que la barre affiche le vrai total : *deux nombres qui se contredisent, et rien ne dit lequel commande.*

**⛔ MÊME FAMILLE QUE LE « 88 g » DE ft-v966** — aucun des deux n'est faux, c'est leur **voisinage muet** qui trompe. *Et c'est plus vicieux qu'une erreur : il n'y a rien à corriger, donc rien ne se signale.* Deux fois en deux jours, sur deux écrans différents.

**⭐ R2 — LA LIGNE NE CALCULE RIEN.** Elle **relit** le chiffre que `updateProteinBar()` vient d'utiliser et **nomme sa source**. Deux calculs du même nombre finiraient par diverger, et on ne saurait plus lequel croire.

**👉 TROIS ÉTATS, ET LE PREMIER RÉPOND EXACTEMENT À SA QUESTION** : rien de noté → *« ça se remplit tout seul depuis le Journal, ou tape ton total ici. **En grammes de protéines, pas en poids d'aliment.** »* · le Journal remplit → *« 🍽️ 46 g lus dans ton Journal du jour — tape un nombre ici pour le remplacer »* · saisie manuelle → *« ✍️ chiffre que **tu** as tapé — efface le champ pour reprendre ton Journal »*.

**⛔ ET ON NE DIT PAS « 0 g lus dans ton Journal » QUAND RIEN N'EST NOTÉ** : ça se lirait comme un constat alors que c'est simplement une journée qui commence (**R24**).

**⛔⛔ LE TÉMOIN QUI PROTÈGE LE PLUS EST CELUI D'AVANT** : la saisie manuelle n'est **jamais écrasée** par le Journal (**R29**, même arbitrage que `manualKcal`). *Il est vert des DEUX côtés — c'est le but : une correction d'affichage se juge à ce qui n'a pas bougé.*
Tests : **parcours 1109/1109** (+9, bloc LXXXVIII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 6 rouges**, exactement les 6 comportements neufs — et **3 verts des deux côtés**, qui sont les non-régressions (la barre lit le Journal, la saisie manuelle prime, elle n'est pas écrasée). Fichiers : `app.js`, `index.html`, `clone/*`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v969. |

**ft-v968 — 📋 LE JOURNAL RANGÉ PAR REPAS, ET UNE 2ᵉ COLLATION** — Michel, capture à l'appui : *« c'est un peu le foutoir là, il faudrait ranger tout ça. Là c'est une liste, il faut les ranger et créer des lignes déroulantes pour chaque section »*, puis *« pouvoir rajouter une collation aussi, il y en a qui prennent une collation le matin et le soir »*.

**⭐⭐ LE VRAI PROBLÈME N'ÉTAIT PAS L'AFFICHAGE, C'ÉTAIT LE TRI.** Sa capture montre dîner → dîner → collation → déjeuner → petit-déj dans le désordre, parce que la liste était triée par **heure de SAISIE**. *On note son petit-déjeuner à midi et sa collation le soir : l'ordre où l'on tape n'est pas l'ordre où l'on mange.* C'est désormais l'ordre du **repas** qui commande, et `FOOD_MEALS` suit l'ordre de la journée.

**⭐ R13 — MÊME MOTIF QUE LE MÉNAGE DU MENU ADMIN** (ft-v955) : `<details>` natif, donc **zéro JS** — ça tient même si un script tombe, et le clavier comme les lecteurs d'écran le gèrent gratuitement. Chaque section porte son **total kcal et protéines** : on voit d'un coup où partent les calories.

**⛔ UNE SECTION VIDE NE S'AFFICHE PAS.** Annoncer *« Collation 2 — 0 aliment »* tous les jours ferait de l'écran la liste de ce qu'on n'a **pas** mangé — un reproche déguisé (**R24**).

**⭐⭐ ET L'ÉTAT PLIÉ SURVIT AU RE-RENDU.** `renderFoodJournal()` reconstruit tout son HTML : sans mémoire, **ajouter un aliment redéplierait tout ce que la personne vient de replier**. *C'est un défaut qui ne se manifeste qu'à la DEUXIÈME action, donc jamais en testant une fois.* ⛔ En mémoire seulement, jamais dans `localStorage` : c'est un confort d'affichage, pas une donnée — le stockage a déjà saturé une fois (29/07).

**⛔⛔ LE PIÈGE ÉVITÉ, ET IL ÉTAIT SILENCIEUX.** Le repli de `_foodMealInfo` valait `FOOD_MEALS[1]`, qui **désignait le déjeuner**. En passant la liste en ordre de journée, l'index 1 devient la **collation** — et toute entrée au repas inconnu serait devenue une collation **sans que rien ne le signale**. *Un index qui dépend de l'ordre d'un tableau devient faux le jour où on trie ce tableau* (**R14**). Le repli est maintenant **nommé**, et un témoin l'épingle.

**⛔ `collation` GARDE SA CLÉ** : la renommer aurait orphelin toutes les entrées déjà notées, qui seraient tombées dans le repas par défaut en silence. **⚠️ Et les libellés restent NEUTRES** — « Collation 2 », pas « Collation du soir » : Michel dit *matin et soir*, quelqu'un d'autre prendra un goûter à 16 h, et étiqueter l'heure à sa place serait un **faux-précis** (**R29**).

**⭐ LES 5 BOUTONS DE REPAS N'ONT DEMANDÉ AUCUN CODE** : la modale d'ajout et celle de modification se génèrent déjà depuis `FOOD_MEALS`. *Une liste qui est la source de vérité (R1) fait apparaître la nouveauté partout d'un coup.*
Tests : **parcours 1100/1100** (+9, bloc LXXXVII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 1 rouge** — le regroupement n'existe pas. ⚠️ **Peu instructif, et autant l'écrire** : 7 témoins vivent sous le garde, donc ils **ne tournent pas** (1093 exécutées au lieu de 1100). ⭐⭐ **MAIS UN TÉMOIN EST SORTI DU GARDE EXPRÈS, et c'est le plus important du bloc** : *un repas inconnu retombe sur DÉJEUNER*. Il mesure un comportement qui **existait déjà**, il est donc **vert des deux côtés** — et c'est exactement ce qu'on veut voir : *un rangement se juge à ce qui n'a PAS bougé.* Derrière le garde, il n'aurait rien mesuré. ⚠️⚠️ **ET J'AI DÛ M'Y REPRENDRE À TROIS FOIS POUR OBTENIR CE CHIFFRE.** ① J'ai lancé le contrôle négatif **pendant qu'une autre passe tournait** : le `git stash` a échangé les fichiers **au milieu** du run, qui a planté — *une trace d'erreur qui n'accusait que ma propre concurrence.* ② Puis le bloc **tuait le runner** contre l'ancien code (`_journalPli` absente, exception hors de `pg.evaluate`) : **aucun verdict imprimé du tout**, pas même un rouge. C'est la leçon de ft-v957 repayée — *un témoin qui tue le harnais ne mesure rien*. Le garde couvre désormais la fonction réellement neuve. Fichiers : `app.js`, `screens.js`, `style.css`, `clone/*`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v968. |

**ft-v967 — 🛡️ « JE NOTE » PUIS LA SÉANCE : la note est HONORÉE, pas vide** — Michel envoie **la réponse exacte** qui levait le drapeau : *« Et le Butterfly (Pec Deck) en début de séance — **je note**, c'est ton choix, je le respecte »*.

**⛔ ET LE PEC DECK EST DANS LA SÉANCE QU'IL RECONSTRUIT DIX LIGNES PLUS BAS.** Il note **et applique dans le même message** : *il n'y a rien à différer, donc rien à enregistrer.* Ce n'est pas une promesse vide, c'est un **accusé de réception suivi de son exécution**.

**⭐ LE CRITÈRE EST OBSERVABLE, PAS UNE DEVINETTE** : *une SÉANCE est-elle produite ici* (au moins 3 blocs `N×N`) **et** *aucun mot de report* ? — alors la note est honorée. **⛔⛔ Et le report l'emporte toujours** : *« je note **pour la prochaine fois** »* suivi d'une séance **reste** un drapeau — *sinon il suffirait de joindre un tableau pour désarmer le garde-fou.*

**⭐ MESURÉ DANS LES DEUX SENS AVANT D'ÊTRE ÉCRIT** : sur ses 119 réponses, **3 drapeaux → 2**, et les 2 gardés sont exactement les vrais. Les **3 vraies de ft-v944 restent gardées** — dont *« le Leg Curl avant le Face Pull, c'est noté »*, qui n'a **aucun** mot de report, parce qu'elle **ne produit pas de séance**.

**⚠️⚠️ ET CETTE VERSION CORRIGE UN VERDICT QUE J'AVAIS ÉCRIT UNE HEURE PLUS TÔT.** J'ai titré *« ft-v923 NE TIENT PAS — mesuré »* à partir d'un compteur **dont je n'avais lu aucun des 5 textes**. **C'est exactement `BUGS.md` 12quater** — *conclure d'un nombre sans regarder ce qu'il compte* — **refaite deux heures après avoir écrit la famille qui la décrit.** 👉 Ce qui est réellement établi : **2 vraies promesses non tenues, toutes deux ANTÉRIEURES aux correctifs** (09/08 et 19/08). Les 5 en direct restent **non lus** : *on ne conclut ni « ça tient » ni « ça ne tient pas ».*

**⚠️ 2ᵉ CALIBRATION DE CE MOTIF SUR DE VRAIES CONVERSATIONS — et la 2ᵉ fois qu'elle vient de Michel** (**R19** : un garde-fou juste une fois sur deux ne survit pas à son premier mois).

**⭐⭐ ET LA SOIRÉE A PRODUIT 5 SCÉNARIOS DE PLUS** (journal de test à **36**), dont l'analyse de GPT sur cette même séance : ⛔ **ne pas attribuer à Milo les choix de l'utilisateur** (le superset ET le Pec Deck étaient **imposés par Michel** — Milo y fait bien son travail) · ⭐ la **provenance des décisions**, qui est le motif de `_provFood` transposé aux séances (**R13**) · ⚠️ le **repos qui ne suit pas l'intensité** — et **Michel a tranché lui-même** : *« un 3×5 avec 90 secondes de repos c'est IMPOSSIBLE »*, donc une prescription **inexécutable**, pas discutable. ⭐ **GPT se trompe sur un point, vérifié dans le code** (**R28**) : `exRestPref` est **déjà** transmis à Milo depuis le 12/08.
Tests : **parcours 1091/1091** (+2, bloc LXXVIII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. Fichiers : `coach.js`, `clone/coach.js`, `tests/parcours/runner.js`, `docs/JOURNAL-DE-TEST.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v967. |

**ft-v966 — 🧮 « POUR TES 30 G » — deux nombres de protéines, et rien ne disait lequel était le sien** — Michel : *« j'ai trouvé un bug mais pas vraiment un bug lol »*. **Il avait raison au mot près.**

**⭐ SA VIDÉO A MONTRÉ QUE L'APP AVAIT ENTIÈREMENT RAISON** : Quantité **30 g**, champs à **117 kcal · 26 g de protéines · 1 · 1** — exact au gramme près pour une poudre à 88 g/100 g. Le **88** qu'il lisait est la **carte Open Food Facts**, titrée *« Valeurs pour 100 g »*.

**⛔⛔ AUCUN DES DEUX NOMBRES N'EST FAUX — c'est leur VOISINAGE MUET qui trompe.** *Et c'est plus vicieux qu'une erreur : il n'y a rien à corriger, donc rien ne se signale.* Le 88 est **en vert vif et en gros** ; ses vrais 26 g vivaient beaucoup plus bas, **hors écran**. C'est la famille §7 de `BUGS.md` (deux sources qui se contredisent), à ceci près qu'ici **les deux disent vrai**.

**⭐ LA LIGNE VA DANS LA RANGÉE QUANTITÉ, PAS DANS LA CARTE** : c'est là que se porte l'attention au moment où l'on règle les grammes. La corriger dans la carte aurait déplacé la réponse loin de la question.

**⭐⭐ R2 — ELLE NE CALCULE RIEN.** Elle **relit** les champs que `_bcApplyGrams` vient d'écrire. *Deux calculs du même nombre finiraient par diverger, et on ne saurait plus lequel croire* — un témoin vérifie qu'elle **suit** quand on passe à 60 g (→ 53 g). ⛔ Elle n'affiche **jamais** la valeur pour 100 g (témoin dédié), et **disparaît** si la quantité est vide plutôt que d'annoncer « pour tes 0 g ».

**⚠️⚠️ ET CETTE VERSION CORRIGE UNE FAUSSE CAUSE DE LA MIENNE.** ft-v965 affirmait que *« la quantité était restée à 100 »*. **C'était faux.** J'avais **déduit le mécanisme d'un SEUL NOMBRE** — 88 = exactement 100 g d'une poudre titrant 88 g/100 g — **sans demander l'écran**, alors que Michel envoie des captures spontanément. *Une coïncidence parfaite est exactement ce qui rend une fausse cause crédible : il n'y a aucun frottement pour vous arrêter.* Le déplacement du champ reste bon ; **la raison écrite à côté était inventée**. Corrigé dans le journal **en le disant** (**R23/R27**), et nouvelle famille **`BUGS.md` 12quater — la cause déduite d'un seul nombre**.
Tests : **parcours 1089/1089** (+4, bloc LXXXVI), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. Fichiers : `app.js`, `index.html`, `clone/*`, `tests/parcours/runner.js`, `BUGS.md`, `docs/JOURNAL-DE-TEST.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v966. |

**ft-v965 — ⚖️ LA QUANTITÉ ÉTAIT AU-DESSUS DU CHAMP OÙ L'ON TAPE** — Michel : *« j'ai trouvé un bug mais pas vraiment un bug lol »*, puis : *« j'ai mis 30 grammes de protéine mais en fait c'est pas ça, j'ai voulu mettre 30 grammes de POUDRE de protéine, et ça fait 88 grammes de protéine »*.

**⚠️⚠️ CORRECTION DU 22/08 AU SOIR — MA CAUSE ÉTAIT FAUSSE, ET C'EST SA VIDÉO QUI L'A MONTRÉ.** J'avais écrit *« 88 g de protéine = exactement 100 g de poudre, donc la quantité était restée par défaut »*. **L'enregistrement d'écran dit le contraire** : la Quantité affichait bien **30 g**, et les champs enregistrés valaient **117 kcal · 26 g de protéines · 1 · 1** — c'est-à-dire **exactement juste** pour 30 g d'une poudre à 88 g/100 g. **Il n'y avait AUCUN bug de calcul, et aucune quantité restée à 100.** ⛔ **Le 88 qu'il lisait était la CARTE PRODUIT**, dont le titre dit pourtant *« Valeurs pour 100 g »* — mais le chiffre y est **en vert vif et en gros**, pendant que ses vrais 26 g vivent beaucoup plus bas, hors écran. *Michel avait raison au mot près : « un bug mais pas vraiment un bug ».*

**⭐ CE QUE ÇA APPREND, ET C'EST LA 3ᵉ FOIS EN DEUX JOURS (R28) :** j'ai **déduit un mécanisme d'un seul nombre** (88 = 100 g) au lieu de demander l'écran. La coïncidence était parfaite — la poudre titre justement 88 — et *une coïncidence parfaite est exactement ce qui rend une fausse cause crédible*. ⚠️ **Le déplacement du champ reste bon** (la quantité doit toucher les macros qu'elle pilote, et le témoin d'ordre est gardé), **mais il a été livré avec une raison inventée** — c'est le défaut, pas le code.

**⛔⛔ LE CALCUL N'A JAMAIS ÉTÉ FAUX — C'ÉTAIT LE PLACEMENT.** Le bloc « Quantité » vivait **AVANT** le champ de recherche. Conçu pour le **code-barres** (on scanne, *puis* on ajuste), il est devenu **à contresens** quand la recherche par nom est arrivée (ft-v956/957) : *on tape en bas, on choisit en bas, les macros se remplissent en bas* — et le réglage qui **commande tout ça** restait hors du regard, plus haut dans la page.

**⭐ DÉPLACÉ JUSTE AU-DESSUS DES MACROS QU'IL PILOTE**, il sert désormais les **deux** chemins : après un scan comme après une recherche, il apparaît là où l'attention est **déjà**.

**⚠️⚠️ ET LE COÛT ÉTAIT RÉEL ET SILENCIEUX** : 100 g de whey au lieu de 30, c'est **+64 g de protéine et ~250 kcal** enregistrés sans que rien ne le signale. *C'est la même famille que le pluriel de ft-v963 — une valeur **plausible** mais fausse, qu'on enregistre sans se méfier.* ⛔ Et c'est **un défaut de conception que j'ai introduit** en ajoutant la recherche : *déplacer l'entrée d'un formulaire déplace aussi le sens de son ordre* (**R14** — un comportement copié d'un contexte à l'autre peut devenir faux).

**⭐ LE TÉMOIN ÉPINGLE L'ORDRE DU DOM LUI-MÊME** (recherche < suggestions < quantité < macros). *Une disposition ne casse aucun test fonctionnel : sans ce témoin, rien d'autre ne l'aurait vue* — le formulaire « marchait » parfaitement.

**⚠️ RIEN D'AUTRE NE BOUGE** : ni le calcul, ni la valeur par défaut de 100 g. La corriger demanderait de **deviner une portion** — 30 g pour une whey, 250 g pour du riz ? — et ce serait un **faux-précis** (**R29**). *Rendre le réglage visible vaut mieux que deviner à la place de la personne.*
Tests : **parcours 1085/1085** (+1, bloc LXXXVI), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 1 rouge**, exactement l'ordre — et c'est ici un contrôle **instructif**, pas un « la fonction n'existe pas » : le témoin **tourne** des deux côtés et mesure une disposition qui existait déjà, mal. Fichiers : `index.html`, `clone/index.html`, `tests/parcours/runner.js`, `sw.js`, `clone/sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v965. |

**ft-v964 — 🔤 CES MOTS-LÀ NE S'ÉCRIVENT PAS** — Michel, **juste après** ft-v963 : *« oui j'ai mis ça, après je voulais mettre coquilette »*.

**⛔⛔ IL L'ÉCRIT AVEC UN SEUL L**, et ma liste de synonymes portait « coquillette ». **Sa graphie à lui rendait ZÉRO résultat.** *La correction de la veille marchait donc pour l'orthographe parfaite — c'est-à-dire pour ceux qui n'en avaient pas besoin.*

**⭐ MESURÉ, PAS DEVINÉ : 6 autres graphies plausibles échouaient aussi** — *spagetti · tagliatele · farfale · fusili · linguini · pene*. Toutes des variantes de **consonne doublée** ou de **h muet** : exactement là où ces mots italiens se trompent.

**⛔ LA TOLÉRANCE NE S'APPLIQUE QU'À LA LISTE FERMÉE DE 12 FORMES**, jamais à la base. On compare la frappe aux 12 mots connus — donc **aucun rapprochement hasardeux possible** sur 3 341 aliments. *C'est ce qui distingue une tolérance bornée d'une recherche floue, qui aurait ramené n'importe quoi.*

**⚠️⚠️ ET DEUX PIÈGES TROUVÉS EN LE MESURANT, PAS EN LE RELISANT :**
**① Ma 1ʳᵉ version retirait aussi la VOYELLE FINALE — et « macaroni » devenait « macaron ».** ⛔ **La pâtisserie serait partie sur les pâtes.** Le retrait de la voyelle finale a donc sauté, et *« linguini »* (graphie anglaise) est **simplement ajouté** à la liste : *plus honnête qu'une règle qui rabote au hasard pour rattraper un cas.*
**② « torsade » est RETIRÉ de la liste** (**R30** — un retrait s'écrit) : CIQUAL l'emploie pour un **biscuit apéritif feuilleté**, usage au moins aussi courant que la pâte. *Entre détourner un vrai aliment et rater une forme rare, on rate la forme rare.*

**⭐ VÉRIFIÉ SUR LES 2 261 MOTS DISTINCTS DE CIQUAL** : la seule collision restante est *« spaghetti »* (**la courge**), et elle est **voulue** — la courge garde sa correspondance EXACTE, donc elle reste trouvable. *On ajoute une porte, on n'en ferme aucune.*
Tests : **parcours 1084/1084** (+5, bloc LXXXVI), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. ⚠️ **Pas de contrôle négatif séparé** : la version corrige ft-v963, livrée il y a vingt minutes, et **ses 8 rouges couvrent déjà le mécanisme**. Ce qui compte ici est ailleurs — les **2 témoins qui protègent macaron et torsade** sont verts **des deux côtés**, et c'est le but : *ils gardent une absence, pas une nouveauté.* Fichiers : `app.js`, `clone/app.js`, `tests/parcours/runner.js`, `sw.js`, `clone/sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v964. |

**ft-v963 — 🔎 LE PLURIEL — 97 % DE LA BASE ÉTAIT INATTEIGNABLE** — Michel : *« c'est comme j'ai cherché les pâtes, j'ai pas trouvé — enfin si, mais pas ce que je voulais trouver, et je n'ai plus la boîte pour le code-barre »*.

**⚠️⚠️ ET SA PROPRE EXPLICATION ÉTAIT FAUSSE — c'est la première chose qu'il a fallu vérifier.** Il a ensuite pensé à l'accent : *« ah c'est pâtes et pas pates lol »*. **Mesuré : « pâtes » et « pates » rendent EXACTEMENT la même liste** depuis ft-v960 (`NFD` retire les accents). *Le croire aurait fermé le sujet sur un faux coupable et laissé le vrai en place* — **R28 coupe dans les deux sens**, y compris quand c'est Michel qui diagnostique.

**⛔⛔ LE VRAI DÉFAUT : CIQUAL NOMME AU SINGULIER, ON TAPE AU PLURIEL.** « Amande, grillée » · « Lentille verte, sèche » · « Tomate, crue » — mais personne ne mange *une* amande. **Mesuré sur toute la base : 97 % des 3 341 aliments étaient inatteignables au pluriel.**

**⭐⭐ ET LE PIRE N'EST PAS LE VIDE, C'EST LE FAUX.** Les **plats composés**, eux, emploient le pluriel : *« amandes »* rendait **Croissant aux amandes**, *« lentilles »* rendait **Soupe aux lentilles**, *« tomates »* rendait **Caviar de tomates**. *Une recherche qui rend le mauvais aliment coûte plus cher qu'une recherche vide : on l'enregistre sans se méfier.*

**⛔ MÊME TROU EN VOCABULAIRE POUR LES PÂTES** — et c'est très probablement ce qu'il a vu. CIQUAL ne connaît que « Pâtes sèches » : **penne, macaroni, coquillettes, fusilli, farfalle, rigatoni, conchiglie, linguine rendaient ZÉRO résultat**, et *« spaghetti »* rendait… **la courge spaghetti**. ⚠️ Ce ne sont pas des aliments différents, ce sont des **formes de la même semoule** : on n'invente aucune valeur, on ouvre une porte vers celles de CIQUAL. La liste reste courte et explicite — elle dit une équivalence de forme, elle ne juge rien (**R29**). ⛔ Et **la courge reste trouvable** : on ajoute une porte, on n'en ferme aucune.

**⭐⭐ L'ORDRE DE PRÉFÉRENCE EST CE QUI ÉVITE LES DÉGÂTS, ET IL A FALLU DEUX ESSAIS.** Mon 1ᵉʳ jet retirait le « s » sans plus de façons — et **fabriquait deux régressions en réparant** : *« pâtes »* rendait **Pâté breton**, *« pois »* rendait **Poireau**. 👉 On classe donc : ① le nom **commence** par le mot · ② la forme **EXACTE** avant la dépluralisée · ③ le nom le plus court. **Mesuré : 0 régression sur 50 requêtes courantes**, et les deux cassés sont devenus des témoins permanents (**R17**).

**⭐ R2 — UN SEUL PROPRIÉTAIRE DE « CHERCHER ».** Les **trois** recherches — CIQUAL, les compléments, et **son propre journal** — avaient le même défaut. Elles le corrigent donc **au même endroit** : sinon la prochaine correction n'en réparerait qu'une, et *personne ne le verrait*. Un témoin vérifie que *« amandes »* retrouve son *« Amande grillée »* à lui.

**⚠️ Le plafond de 400 reste tel quel, et c'est une décision mesurée** (**R30**) : il ne fausse qu'*« eau »* (*robinet* au lieu de *coco*), et les deux se valent — le relever échangerait un résultat correct contre un autre.
Tests : **parcours 1079/1079** (+16, bloc LXXXVI), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 8 rouges**, exactement les 8 comportements changés. ⭐ **Et cette fois les 16 témoins se sont TOUS exécutés** — mon 1ᵉʳ jet les mettait derrière un garde « `_afRang` absente », donc ils **ne tournaient pas** contre l'ancien code et le contrôle ne disait qu'une chose : *« la fonction n'existe pas »*. Le garde ne porte plus que sur `_ciqualChercher`, qui existe **des deux côtés**. *Un témoin qui ne tourne pas n'est pas un témoin vert* — 3ᵉ fois que ça se paie (ft-v949, ft-v953). ⚠️ Les **8 verts des deux côtés sont ici les plus importants** : l'accent, « pâtes », « pois », « pâté », œuf/riz/poulet, la courge et le singulier du journal **devaient rester intacts** — *une correction de recherche se juge à ce qui n'a PAS bougé*. Fichiers : `app.js`, `clone/app.js`, `tests/parcours/runner.js`, `sw.js`, `clone/sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v963. |

**ft-v962 — ⚖️ MODIFIER LE POIDS D'UNE ENTRÉE — au lieu de recalculer les 4 macros à la main** — Michel, devant un « Oeuf cru » dans son journal : *« ya œuf cru (lol) pas cuit. Et on ne peut pas modifier le poids »*.

**⭐⭐ DEUX QUESTIONS DANS LA MÊME PHRASE, ET UNE SEULE EST UN DÉFAUT** — vérifié avant de coder (**R28**), pas supposé.

**⚠️ ① L'ŒUF CRU N'EST PAS UN TROU DE LA BASE.** Mesuré : quand on tape « œuf », **« Oeuf dur » sort PREMIER**, avant « Oeuf cru » — et *poché*, *à la coque*, *brouillé*, *au plat* sont là aussi (141 résultats). **Il a pris le 2ᵉ de la liste.** ⭐ **Et l'écart est minuscule sur un œuf entier** : 140 contre 134 kcal/100 g, soit **12 kcal** sur ses 200 g. *Le cru/cuit compte énormément pour les féculents (×3 sur des pâtes, d'où l'avertissement de ft-v956), presque pas pour un œuf.* **On ne corrige donc RIEN côté base : la donnée était là, le choix aussi.** *Deuxième fois cette semaine qu'un « ça manque » se dissout en rejouant le cas exact — après le « poulet » de ft-v959.*

**⛔⛔ ② LE POIDS, LUI, ÉTAIT UN VRAI DÉFAUT.** La modale « Modifier l'aliment » ne montrait que les **4 macros brutes** : pour passer de 200 à 150 g, il fallait recalculer kcal, protéines, glucides **et** lipides soi-même — sur un écran qui sait pourtant faire exactement ce calcul. *Quelqu'un qui se pesait pour la première fois de sa vie le matin même n'allait pas faire quatre règles de trois pour corriger une portion.*

**⭐ R13 — ON NE RÉINVENTE RIEN.** `_bcApplyGrams()` fait déjà ce calcul à l'**AJOUT** (scan, CIQUAL, recherche) depuis ft-v956/957. On branche la **même** logique sur `e.per100`, le pour-100 g que `_provFood` enregistre depuis la **brique 0** (ft-v907).

**⭐⭐ ET C'EST R4 QUI PAYE, AVEC DEUX SEMAINES DE RETARD** : ce `per100` était **stocké sur chaque entrée** et n'atteignait **aucun écran**. *Il existait, il ne servait à rien* — la donnée morte que R5 demande justement de chercher à l'envers. Il n'y avait rien à collecter, seulement à brancher.

**⛔⛔ LE TÉMOIN CENTRAL EST UN REFUS : le champ n'apparaît QUE si `per100` existe.** Une entrée tapée à la main n'a pas de pour-100 g — en fabriquer un supposerait de deviner à quel poids correspondent ses 80 kcal, et ce serait un **faux-précis** (**R29**). *Sa modale ne bouge pas d'un pixel*, et deux témoins le vérifient : pas de champ, et **aucune quantité inventée** dans l'entrée sauvegardée.

**⚠️ ET LA QUANTITÉ SE RE-ENREGISTRE (`q`/`u`)** : sans ça, la modification **suivante** repartirait du poids d'origine et **annulerait la précédente en silence** — le genre de défaut qu'on ne voit qu'à la deuxième correction, donc jamais pendant un test écrit d'un seul jet.
Tests : **parcours 1063/1063** (+8, bloc LXXXV), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 1 rouge** — `_efApplyGrams` absente. ⚠️ **Peu instructif et autant l'écrire** : les 7 autres témoins vivent sous le garde « fonction absente », donc ils **ne tournent pas** contre l'ancien code. *Un témoin qui ne tourne pas n'est pas un témoin vert.* Fichiers : `app.js`, `clone/app.js`, `tests/parcours/runner.js`, `sw.js`, `clone/sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v962. |

**ft-v961 — 📅 NAVIGUER DANS LE JOURNAL — voir ET modifier un autre jour** — Michel : *« on ne sait pas ce que l'on a mangé dans la journée et on ne peut même pas le modifier de ce fait »*.

**⭐ VÉRIFIÉ AVANT DE CODER (R28)** : le Journal était câblé en dur sur `today()`, sans aucune navigation — impossible de voir **ou** de modifier un autre jour que celui du moment, exactement ce qu'il décrivait.

**⭐ MÊME REPÈRE VISUEL que le calendrier de l'Accueil** (flèches ‹ ›, **R13**) : *Aujourd'hui / Hier / date complète*, navigation illimitée vers le passé. **⛔⛔ Et on ne va jamais dans le futur** : demain n'a rien à montrer, y naviguer donnerait l'impression qu'on peut noter un repas à l'avance — la flèche avant est désactivée dès qu'on est sur aujourd'hui.

**⭐⭐ LE TÉMOIN CENTRAL : un jour passé est MODIFIABLE, pas seulement consultable.** On édite et supprime une entrée d'hier exactement comme aujourd'hui, sans toucher à l'entrée du jour présent.

**⭐ ET AJOUTER UN ALIMENT EN CONSULTANT LE PASSÉ LE DATE SUR CE JOUR-LÀ** (backfill), jamais sur aujourd'hui — sinon la navigation aurait servi à *regarder* mais pas à *corriger un oubli*, ce qui aurait raté la moitié de la demande.

**⚠️ UN JOUR CLOS N'A PLUS DE « restantes »** : le libellé passe en simple comparaison à l'objectif (on ne va pas manger davantage hier), et l'objectif affiché reste explicitement celui **d'aujourd'hui** — recalculer un objectif historique aurait été un faux-précis qu'on n'a pas les moyens de garantir (**R29**).
Tests : **parcours 1055/1055** (+9, bloc LXXXIV), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 1 rouge** — fonction absente (peu instructif, toute la brique est neuve). ⚠️ Un test existant (l'ordre des 3 méthodes d'ajout) a dû être **reciblé** : les nouvelles flèches précèdent désormais ces boutons dans le DOM, donc « premier bouton de la page » n'était plus la bonne question — « premier des 3 méthodes » l'est. Fichiers : `app.js`, `screens.js`, `clone/*`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v961. |

**ft-v960 — 🔤 MÊME BUG, SUR L'APOSTROPHE — Michel avait raison de creuser** — après la ligature du blanc d'œuf : *« faut aller voir aussi avec les accents, le E tréma, tous les caractères spéciaux quoi »*.

**⭐ VÉRIFIÉ SYSTÉMATIQUEMENT sur les ~132 000 noms des deux bases** (CIQUAL + Compl'Alim), plutôt que de deviner un caractère au hasard. **Accents, tréma (ë, ï, ü), cédille (ç) étaient déjà corrects** : `NFD` les décompose tous en lettre + accent, déjà retirés par le code précédent.

**⚠️⚠️ MAIS L'APOSTROPHE AVAIT EXACTEMENT LE MÊME DÉFAUT QUE LA LIGATURE DE LA VEILLE.** Le clavier iPhone convertit **automatiquement** l'apostrophe droite tapée en apostrophe **courbe** pendant la frappe. **238 aliments CIQUAL** en portent une (*« Soupe à l'oignon »*, *« Sauté d'agneau »*). Mesuré : *« aujourd'hui »* tapé (droite) et *« aujourd'hui »* stocké (courbe) ne se reconnaissaient **pas** comme le même mot.

**⛔ CORRIGÉ en RETIRANT l'apostrophe et ses variantes** (courbe droite/gauche, accent grave, accent aigu isolé) — elle ne porte aucun sens pour une recherche. Et ça a révélé un détail au passage : certaines entrées utilisent ces mêmes variantes comme **coquille d'origine** (*« PROBIO´DIET »*), pas seulement l'autocorrection du clavier — le retrait les couvre aussi.

**⭐ Toujours dans la même fonction, partagée par CIQUAL et les suggestions locales** (R2) — corriger une fois répare les deux recherches.
Tests : **parcours 1046/1046** (+2), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 1 rouge** exact. Fichiers : `app.js`, `clone/*`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v960. |

**ft-v959 — 🥚 UN BUG TROUVÉ EN CHERCHANT AUTRE CHOSE — la ligature Œ cassait la recherche CIQUAL** — Michel a montré une photo de blanc d'œuf liquide en demandant comment il serait nommé dans la base, après avoir signalé que *« poulet »* ne trouvait rien (ce second point n'était qu'une version pas encore rafraîchie sur son téléphone).

**⭐⭐ MAIS EN VÉRIFIANT LE PRODUIT D'ŒUF, UN VRAI BUG EST APPARU.** `normalize('NFD')` décompose les **accents** (é → e + accent), mais **jamais les ligatures œ/æ** — ce sont deux lettres fusionnées en une seule, pas une lettre accentuée. Or **le clavier iPhone en français corrige automatiquement** « oeuf » en « œuf » pendant la frappe, pendant que CIQUAL écrit tous ses noms en **oe séparé** (*« Oeuf, blanc… »*). Mesuré : taper le mot avec ligature rendait **zéro résultat** pour œuf, bœuf — donc quasiment **toujours sur iPhone**, pour un aliment qui existe pourtant dans la base.

**⛔ CORRIGÉ dans `_afNorm`** : deux remplacements supplémentaires (œ→oe, æ→ae) avant le NFD qui gère les accents. **Une seule fonction, partagée par CIQUAL et les suggestions locales** (R2) — la corriger une fois répare les deux recherches d'un coup.

**⚠️ Et « poulet » était un faux problème** : rejoué dans un navigateur avec le code déployé, il trouvait bien 69 résultats. La leçon reste utile : *toujours REJOUER le cas exact avant de conclure à un bug* — ici ça a évité de chasser un fantôme, et ça a laissé le temps de trouver le vrai.
Tests : **parcours 1044/1044** (+3), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 2 rouges** exactement (œuf et bœuf en ligature) — le mot sans ligature ne régresse pas. Fichiers : `app.js`, `clone/*`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v959. |

**ft-v958 — 🔍 UN AUTRE COMPLÉMENT — identification seulement, jamais un conseil** — Michel a fourni **Compl'Alim** (registre officiel data.gouv.fr, 5 fichiers, 142 928 déclarations), puis : *« je ne demande pas à ce que tout soit détaillé, mais peut-être simplifier l'approche »*.

**⛔⛔ APPROCHE VOLONTAIREMENT SIMPLIFIÉE** — on ne garde que l'**identification** : nom, marque, catégorie déclarée. **129 033 produits autorisés**, dédoublonnés. **Aucune dose, aucune mise en garde, aucune composition** : les afficher rapprocherait l'app du conseil sur des substances — seule la créatine a ce traitement aujourd'hui, avec des précautions écrites à la main et sourcées ANSES. C'est une fiche *« est-ce le bon produit ? »*, pas un moteur de recommandation. **Le témoin central du bloc vérifie qu'aucun mot de dose ou de mise en garde n'apparaît jamais à l'écran.**

**⚠️ CORRIGÉ AVANT DE CODER** : Michel avait supposé que cette base donnerait aussi *« les valeurs nutritives »*. **Vérifié dans le fichier : aucune colonne kcal/protéines/glucides/lipides.** Compl'Alim est un registre réglementaire (ce qui est déclaré et autorisé), pas une table de composition. Pour les valeurs nutritives d'un complément, c'est **Open Food Facts** — déjà branché (ft-v956).

**⛔ CE N'EST QU'UNE RECHERCHE, PAS UN JOURNAL** : rien n'est enregistré. Construire un suivi quotidien pour un complément arbitraire (dose, seuils, historique) est un autre chantier, **non demandé** — la créatine et la whey le font déjà pour ce qui est courant.

**⛔⛔ CHARGÉE À LA DEMANDE, JAMAIS AU DÉMARRAGE**, même règle que CIQUAL (règle d'or #4) : **6,5 Mo → 1,58 Mo gzippé**, mesuré avant de coder — 24× plus lourd que CIQUAL, mais toujours dans l'esprit « chargé à la première frappe ».

**⚠️ SOURCE** : Compl'Alim, data.gouv.fr — la licence exacte n'a pas pu être vérifiée depuis cette session (réseau bloqué), c'est écrit tel quel dans le code plutôt que de citer un texte inventé.
Tests : **parcours 1041/1041** (+6, bloc LXXXIII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 1 rouge** — fonction absente. Fichiers : `data/complalim.json` (neuf), `tools/complalim.py` (neuf), `app.js`, `index.html`, `sw.js`, `clone/*`, `tests/parcours/runner.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v958. |

**ft-v957 — 🥗 LA BASE CIQUAL : « banane » existe enfin comme ALIMENT, pas comme marque** — Michel a demandé *« mais comment trouver sur Internet, le téléchargement de la base alimentaire ? »*, puis a fourni le fichier de l'ANSES. **C'est la brique 1 du dossier nutrition**, différée depuis des semaines — et livrée le jour où l'usage réel l'a réclamée.

**⭐ 3 484 aliments génériques**, convertis par `tools/ciqual.py`. Là où Open Food Facts rend des *bananes de marque*, CIQUAL rend **« Banane, pulpe, crue »** — et les noms portent le **cru/cuit en toutes lettres**, ce qu'aucun code-barres ne sait faire.

**⚠️ SOURCE ET LICENCE, ET CE N'EST PAS UNE FORMALITÉ** : Licence Ouverte / Etalab — la réutilisation est libre **à condition de citer la source**. La mention *« Données aliments : table Ciqual 2025 — ANSES »* est **affichée dans la liste**, et un témoin vérifie qu'elle y est.

**⛔⛔ LE POINT QUI DÉCIDE DE TOUT : elle ne coûte RIEN au démarrage.** 250 Ko (68 Ko gzippés), chargés **à la première frappe** dans le champ d'aliment, jamais à l'ouverture. Un témoin le **mesure** — après 2 s d'app, la base n'est pas chargée — au lieu de le supposer, ce que le dossier demandait explicitement. ⛔ Elle n'est pas non plus dans le **PRECACHE** du service worker : ce serait 250 Ko re-téléchargés **à chaque version**, pour une base que beaucoup n'ouvriront jamais. *Retrait décidé, donc écrit* (**R30**) — elle est mise en cache à la demande, donc disponible hors ligne dès la 1ʳᵉ recherche.

**⛔⛔ ET LE POINT DE RIGUEUR : dans CIQUAL, « - » veut dire NON DÉTERMINÉ, pas zéro.** 143 aliments n'ont pas de calories déterminées. Le convertisseur les garde à **`null`** au lieu d'inventer un 0 — *transformer « on ne sait pas » en 0 fabriquerait un fait* (**R29** : un `null` ne doit jamais être remplacé par une valeur par défaut). Et l'affichage les **écarte**, parce qu'un aliment sans calories ne peut pas servir un journal alimentaire. ⭐ **La donnée reste dans le fichier, c'est la VUE qui filtre** — deux témoins l'épinglent, un pour chaque moitié. *« traces »* et *« < 0,55 »* valent **0**, eux, parce que c'est exactement ce qu'ils veulent dire.

**⭐ PROTÉINES N×6.25, PAS FACTEUR DE JONES** — elles diffèrent sur **711 aliments**. La colonne d'énergie retenue est celle du **Règlement UE 1169/2011**, c'est-à-dire celle que la personne lit sur ses emballages. *Mélanger deux conventions dans la même ligne donnerait des macros qui ne retombent pas sur leurs propres calories.*

**⭐ R2 — TROISIÈME CHEMIN, MÊME PORTE.** Un aliment CIQUAL remplit le formulaire par la fonction commune sortie à ft-v956 : grammes, provenance, note d'état. ⛔ Mais **pas d'état « tel-que-vendu »** : un produit emballé donne toujours ses valeurs sèches, alors que CIQUAL dit l'état **dans le nom**. Le marquer serait faux. ⚠️ Et **aucune carte de score santé** sur un aliment brut — une banane n'a ni Nutri-Score ni NOVA, et une carte vide se lirait comme un score absent.

**⚠️ DEUX FOIS MON TÉMOIN A ACCUSÉ LE CODE À TORT.** ① Il exigeait *« zéro appel réseau »* en tapant — devenu **faux** puisque la base se charge à la frappe. La garantie qui compte n'avait pas changé (les locales s'affichent **sans attendre**, et le seul appel est un **fichier**, jamais l'IA) : *j'ai rendu le témoin exact au lieu de l'affaiblir.* ② Puis mon décor **effaçait la base juste avant de la chercher** — 3ᵉ fois cette semaine qu'un témoin désigne le mauvais coupable. *Un décor se relit dans l'ORDRE.*
Tests : **parcours 1035/1035** (+14, bloc LXXXII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. ⚠️ **Contrôle négatif : le bloc est GARDÉ mais peu instructif** — sans le moteur, le témoin rend « CIQUAL absente » au lieu de mesurer. *Et sans ce garde il ne rougissait pas : il faisait PLANTER le runner avant tout verdict — un témoin qui tue le harnais ne mesure rien du tout.* Fichiers : `data/ciqual.json` (neuf), `tools/ciqual.py` (neuf), `app.js`, `sw.js`, `clone/*`, `tests/parcours/runner.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v957. |

**ft-v956 — 🔎 DES PROPOSITIONS QUAND ON TAPE UN ALIMENT — plus besoin de l'IA pour une banane** — Michel, après son **premier vrai repas noté** : *« pour rentrer les aliments il n'y a pas de choix de propositions donc je suis obligé de faire fonctionner l'IA »*.

**⭐⭐ IL A RAISON, ET C'EST LE TROU N°1 DU DOSSIER NUTRITION.** Le champ « à la main » était un **texte vide** : soit on connaît ses macros par cœur, soit on **dépense une estimation IA pour une banane**. Le code-barres, lui, ne sert que si on a l'emballage sous la main. *C'est exactement le défaut que les briques 1/3/4 devaient combler — et il est remonté par l'usage réel, ce pour quoi elles avaient été différées.*

**⭐ DEUX SOURCES, ET AUCUNE INVENTÉE.** ① **Ce qu'il a DÉJÀ noté** — instantané, hors ligne, **zéro invention** : ses propres entrées avec ses propres grammages, dédoublonnées, la **plus récente** gagnant (si la quantité a changé, c'est celle-là qui reflète ce qu'il mange). ② **La recherche Open Food Facts** — l'app lui parle **déjà** pour les codes-barres : même serveur, **gratuit, sans clé ni quota**, de vraies valeurs avec leur provenance enregistrée.

**⛔⛔ LE TÉMOIN CENTRAL EST LA RAISON D'ÊTRE DE LA VERSION : aucun essai IA n'est consommé.** Et il le **compte sur les appels réseau réels**, il ne le suppose pas — c'est la seule façon de prouver à la fois « zéro IA » et « zéro réseau pour les suggestions locales ».

**⭐⭐ R2 — UN RÉSULTAT DE RECHERCHE EST UN PRODUIT COMME UN AUTRE.** `_offRemplirFormulaire` est **sorti de `_lookupBarcode`** pour que les deux chemins partagent tout : grammes, provenance, score santé, et surtout **l'avertissement cru/cuit** (le piège du ×2,7 — le paquet de pâtes scanné puis pesé cuit). *Deux chemins séparés auraient fini par perdre cet avertissement d'un côté, et personne ne l'aurait vu.*

**⛔ RIEN AU DÉMARRAGE** (règle d'or #4) : tout part d'une frappe. Les locales sortent **sans réseau** ; la recherche distante attend une pause de frappe, et vérifie **deux fois** que la frappe n'a pas continué — avant l'appel et après, sinon un résultat périmé écraserait la liste du mot suivant. **Hors ligne**, elle rend une liste vide et **les locales continuent de marcher**.

**⚠️ ET DEUX GARDE-FOUS DE BRUIT** : moins de 2 lettres ne propose **rien** (tout matcherait), et les accents ne bloquent pas — *« pates »* retrouve *« Pâtes complètes »*.

**⛔ LA PROVENANCE DIT « historique », PAS UNE SAISIE NEUVE** : c'est la même personne, mais ce n'est pas une saisie — la brique 0 (ft-v907) sépare exprès *comment c'est entré* et *d'où vient le chiffre*, et confondre les deux rendrait ce champ inutile.

**⚠️ LIMITE ÉCRITE, PAS CONTOURNÉE** : Open Food Facts est une base de **produits de marque**. *« Banane »* y rend des bananes de marque, pas l'aliment générique — **CIQUAL** (3 484 génériques) reste le bon outil et **n'est pas là**. On ne fait pas semblant du contraire, et **on n'invente surtout pas de valeurs génériques nous-mêmes** (R29 : le faux-précis coûte plus cher que l'absence).
Tests : **parcours 1021/1021** (+13, bloc LXXXII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 1 rouge** — le moteur n'existe pas. ⚠️ **Peu instructif et autant l'écrire** : les 12 autres témoins vivent sous le garde « fonction absente », donc ils **ne tournent pas** contre l'ancien code. *Un témoin qui ne tourne pas n'est pas un témoin vert.* Ce qui est réellement prouvé ici l'est sur le code neuf : zéro appel IA, zéro réseau en local, hors ligne intact. Fichiers : `app.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `clone/*`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v956. |

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
