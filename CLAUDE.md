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
- ⚡ **`docs/REGLES-OR.md`** — **les 12 règles d'or EN ENTIER** (le pourquoi, les cas vécus, les garde-fous). `CLAUDE.md` n'en porte que la version d'une ligne depuis la scission du 28/07/2026 : ce fichier faisait **33 000 mots** relus à chaque session, dont **79 % de journal**. *Une règle noyée dans un fichier qu'on ne lit plus n'est plus une règle.* Cohérence des deux fichiers vérifiée par `python3 tools/check_regles.py`.
- 🌟 **`docs/VISION-FORCE-TRACKER.md`** — **l'ESPRIT / le POURQUOI du produit** : *« Force Tracker n'est pas une IA, c'est une mémoire sportive intelligente »* · *« il ne te dit pas qui tu dois devenir, il se souvient de qui tu es devenu »*. Le sportif ne repart jamais de zéro ; la vie avant le programme ; observer avant conseiller ; adapter avant interdire. **Question de référence avant toute feature : « est-ce que cela renforce l'esprit Force Tracker ? »** La Constitution dit le *comment*, la Vision dit le *pourquoi*.
- 👥 **`docs/PERSONAS-FONDATEURS.md`** — **à lire juste après la Vision** : les personas ne sont plus des profils de test, ce sont les **dimensions du projet**. **Michel** = Vision & Architecture (le fondateur, à part). **Christophe** = Terrain & Métier (→ VM). **Tatiana** = Personnalisation, pas de présupposés (→ VC). **Emma** = Physiologie & Ressenti (→ VC). Relie chaque évolution technique à un besoin humain concret. Règle : un nouveau persona n'entre que s'il ouvre une **dimension** nouvelle. *(Idée & conception : Michel.)*
- 🧩 **`docs/MODELE-METIER.md`** — **le LANGAGE COMMUN du produit** (v0.1, vivant) : les objets métier que TOUS les modules partagent (Athlète · Objectif · Programme · Cycle · Séance · Bloc · Exercice · Série · Exercice-bibliothèque) + transversaux (Méthode · Consigne · Notation) + la grammaire + le principe **PLANIFIÉ vs RÉALISÉ**. Cap posé par Michel (21/07/2026) : penser « objets métier », pas « fonctionnalités ». Se distille des vrais programmes, reste vivant. Lié au chantier structures (`PARSER-STRUCTURES.md`).
- 🔬 **`docs/SUIVI-AUDIT.md`** — **LE SCORE DE L'AUDIT** (créé 23/08/2026, demande de Michel : *« il faudra que tu écrives les journaux sur ce qui a été fait, à faire aussi, et les rapports d'audit pour savoir où on en est »*). ⚠️ **Il ne raconte rien — il tient le score.** Le journal dit *« que s'est-il passé et pourquoi »*, le contexte dit *« où on en est aujourd'hui »*, l'inventaire dit *« est-ce déjà construit »* ; celui-ci répond à la seule question qui restait : **« qu'est-ce qui reste de l'audit ? »**. Un sujet y **change d'état**, il ne s'y duplique jamais. ⛔ **Et un sujet ÉCARTÉ y reste avec sa raison** (**R30**) — sinon il revient dans six mois et quelqu'un le « répare ». Porte les **3 bloquants corrigés** (ft-v981/982/983), ce qui reste **par palier** (ouverture large · après prod · décisions produit), les **6 points écartés comme faux ou obsolètes**, et surtout les **5 leçons de méthode** de la session — qui valent plus que les correctifs parce qu'elles se rappliquent : *un test qui n'emploie pas le schéma de la production ne teste rien, il rassure* · *avant de PROMOUVOIR un essai parqué, chercher pourquoi il l'était* · *reproduire avant de conclure* · *compter les endroits* · *un contrôle négatif peut mentir*.
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

> **Version actuelle : `ft-v995`** (prochaine : `ft-v996`). Historique complet (ft-v128→574 + gouvernance
> antérieure, **+ ft-v575→632 déménagées le 28/07**) → **`docs/JOURNAL-ARCHIVE.md`**. Le n° de cache se lit dans `sw.js` (`const CACHE='ft-vNN'`).
> **Entretien** : ajouter chaque nouvelle version ICI (règle d'or #12). Quand ce journal récent dépasse
> **20** entrées, déménager les plus anciennes dans `docs/JOURNAL-ARCHIVE.md` (couper/coller, rien
> supprimer). `python3 tools/check_regles.py` le signale automatiquement.
> ⚠️ **L'ARCHIVE S'AJOUTE, ELLE NE SE RÉÉCRIT JAMAIS** (leçon du 04/08 : un script d'archivage l'a
> **écrasée** — 297 entrées perdues, découvertes 2 jours plus tard **par hasard**, parce que rien ne
> la surveillait). Le même `check_regles.py` refuse désormais toute entrée disparue. **Toujours
> AJOUTER à la fin, jamais ouvrir le fichier en écriture**, et lire le diff avant de committer :
> un `-1793` dans le numstat n'est pas un détail.

**ft-v995 — 🏃 LE CARDIO DE MILO VA DANS SON BLOC, PAS DANS LES EXERCICES** — Michel, **en salle**, capture à l'appui : *« il me rajoute le vélo elliptique alors qu'on a un onglet exprès pour le cardio »*.

**⭐⭐ SA RAISON DÉCIDE DE TOUT, et elle n'est pas esthétique** : *« si on fait une séance cardio toute seule, on veut qu'elle soit comptabilisée. Mais je ne veux pas que la course, le vélo elliptique ou peu importe arrive dans un exercice de musculation, **ça n'a strictement rien à voir**. »* Le cardio a sa place dans l'app — **dans SA fenêtre**, celle de ft-v720, qui distingue 🔥 avant et 🧊 après.

**⛔⛔ CE N'ÉTAIT PAS UN DÉFAUT DE JUGEMENT DE MILO — LES DEUX BOUTS DU CHEMIN MANQUAIENT** (vérifié dans le code, **R28**) : le prompt ne lui dit **nulle part** qu'un bloc cardio existe pour ce qu'il **propose** (il ne le **lit** que pour raconter le passé), et `_appliqueMiloSession` **ne regardait jamais** un champ cardio. *Milo n'avait aucun moyen de faire autrement.* Même forme que le pont blessure de **ft-v982**.

**⭐ R13 — RIEN N'EST RÉINVENTÉ** : `_exEquip()` range déjà elliptique, tapis, rameur, corde à sauter, air bike… dans un bac `'cardio'` depuis ft-v712. On lui demande, on ne redevine pas.

**⛔⛔ ET C'EST POSÉ DANS `_appliqueMiloSession`, LE SEUL POINT QUE LES DEUX PORTES TRAVERSENT** (leçon ft-v980). Une séance de Milo arrive soit par le **bloc JSON** (modèles capables), soit par le **repli de lecture du TEXTE** (modèles légers). *Corriger seulement le JSON n'aurait rien changé pour ELINE* — c'est le biais **R9** déjà vécu avec le bouton « Commencer cette séance », que Michel avait et sa fille **jamais**.

**⚠️ AVANT *ET* APRÈS** (précision de Michel le même soir : *« il peut y avoir une séance avec un cardio au tout début ET un cardio à la fin »*) : on tranche par **POSITION** — avant le 1ᵉʳ exercice de muscu → échauffement, après le dernier → cardio de fin. ⛔ **Au milieu, il reste un exercice** : on ne sait pas ce que la personne voulait, et deviner coûterait plus cher que ne rien faire (**R29**). ⛔ **Sans durée lisible, aucune durée n'est inventée.** ⛔ **Un cardio déjà noté par la personne n'est jamais écrasé.**

**⭐⭐ DEUX DÉFAUTS TROUVÉS PAR LA MESURE, invisibles à la relecture :**
**①** ma première pose écrivait le cardio **AVANT** que `S.wkt` soit reconstruit en mode « start » — l'elliptique sortait donc bien des exercices et **n'arrivait nulle part**. Mesuré : exercices `["Hip Thrust Barre"]` corrects, `cardioAvant` **`null`**. *C'est **R4** dans sa forme la plus bête : l'information était calculée et n'atteignait pas la donnée.*
**②** l'intensité tombait sur *« modéré »* alors que la note dit *« léger »* : `_naz()` désaccentue le **NOM**, pas la **NOTE**. ⭐ *Même famille que l'apostrophe courbe de ft-v994 — un caractère non normalisé rend un motif aveugle sans que rien ne le signale.* **Coût réel : 4,0 contre 6,0 MET, soit 50 % d'écart** sur les calories de ce cardio.
Tests : **parcours 1354/1354** (+16, bloc CIX), calculs 266/266, muscles 241/241, dates 7/7, données 102 classées 0 trou. ⭐ **Les 3 témoins qui comptent le plus sont des ABSENCES** : le cardio au milieu qui reste un exercice, la durée jamais inventée, et **la séance de muscu normale qui ne bouge pas d'un pouce**. 🗣️ **ET MILO EST MIS AU COURANT — la 2ᵉ moitié, demandée par Michel dans la foulée** : *« il faut que Milo soit au courant, il y a déjà une fenêtre où il y a le cardio avant et après, et ensuite il faut donner ce qu'il y a dans cette fenêtre »*. La consigne lui dit que le bloc existe, lui **interdit** de mettre le cardio dans les exercices, nomme **les deux moments**, et lui donne le **vocabulaire exact**. ⭐⭐ **Et ce vocabulaire n'est pas inventé — ce sont les 6 types et 3 intensités de `CARDIO_MET` (`app.js`)** : un témoin les épingle, donc ajouter un type au bloc sans le dire à Milo fait **rougir la livraison** (**R2**, la divergence interdite). ⭐ **La consigne RÉCLAME la durée**, et ce n'est pas décoratif : le correctif **refuse** de placer un cardio sans durée lisible (**R29**) — sans cette phrase, Milo produirait des cardios que l'app rejetterait **en silence**. *Les deux moitiés ne valent que posées ensemble* (leçon ft-v982). ⚠️ **+938 caractères, dans le bloc PERSONNEL** : mesuré, le **bloc commun ne bouge pas d'un caractère** (45 362 sain · 47 118 blessé) — **aucun effet sur le plafond** de 46 500, et le dépassement du profil blessé reste celui déjà documenté en ft-v988. Fichiers : `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`. sw.js ft-v995. |

**ft-v994 — 🧪 LE BANC D'ESSAI PASSE DE 21 À 50 SCÉNARIOS — et 6 des 23 premiers NE MORDAIENT PAS** — Michel : *« il n'y a pas assez de contrôle, on le monte à 50 »*, puis, aussitôt : *« et que les scénarios soient VIABLES hein, pas mettre tout et n'importe quoi »*.

**⛔⛔ CETTE SECONDE PHRASE EST LE VRAI CAHIER DES CHARGES** — et `docs/JOURNAL-DE-TEST.md` le disait déjà de lui-même : *« remplir pour atteindre le chiffre → des entrées inventées, or les bonnes viennent du vécu »*. Les **29 nouveaux scénarios viennent donc TOUS du journal de test**, c'est-à-dire de séances et de conversations réelles — aucun inventé pour faire nombre.

**⭐⭐ ET CHACUN A ÉTÉ ÉPROUVÉ UN PAR UN, contre une BONNE et une MAUVAISE réponse, avant d'être livré.** *Un scénario qui ne peut pas rougir ne mesure rien — il rassure.* **Résultat du premier jet : 6 sur 23 ne mordaient pas.** Le chiffre de 50 ne valait rien tant que ce contrôle n'était pas passé.

**⛔⛔ LE DÉFAUT LE PLUS GRAVE ÉTAIT PLUS ANCIEN QUE MES SCÉNARIOS — l'APOSTROPHE COURBE.** Milo écrit du français naturel, donc `’` (U+2019) ; `normalize('NFD')` ne la convertit pas, si bien qu'un motif écrit `c'est noté` **ne matche jamais**. **8 motifs du fichier** en portent une : *ils ne rougissaient pas, ils ne voyaient rien.* ⭐ Corrigé dans **`U.norm` et nulle part ailleurs** (**R2**) — les reprendre un par un aurait laissé passer le suivant.

**⭐ 2ᵉ DÉFAUT — trois vérificateurs comptaient des LIGNES**, alors que Milo écrit souvent toute la séance **sur une seule ligne**. Le témoin des *« 45 minutes, pas 30 exercices »* voyait alors **un** exercice et restait vert sur dix.

**⚠️ ET 4 DES 6 ÉCHECS VENAIENT DE MES PROPRES ESSAIS, pas du code** : je testais avec *« C est noté »* (une espace au lieu d'une apostrophe) et des noms d'exercices tronqués que le lexique refuse **volontairement** (*« uniquement des noms non ambigus, pour ne jamais rougir à tort »*). *Un banc d'essai se juge aussi sur la qualité de ce qu'on lui donne à juger.*

**👉 CE QUE LES 50 COUVRENT MAINTENANT, par famille** : l'info qui reste dans le texte (**R4** — superset, objectif changé) · ce qu'il ignore de ce que tu as dit (exercice demandé, exercice refusé, structure imposée, matériel) · ce qui déborde (60 min, 45 min, échauffement, déplacement, longueur) · **ce qu'il affirme sans le savoir** (graisse chiffrée, score propriétaire, poids cible, diagnostic, feu vert médical, source inventée, hypothèse donnée pour un fait) · ce qu'il oublie (mémoire longue, coupure de 4 mois, promesse vide, prénom) · ce qu'il juge (l'âge, une donnée isolée) · et la **sécurité** (blessure active respectée).
Tests : **parcours 1337/1337**, calculs 266/266, muscles 241/241, dates 7/7, données 102 classées 0 trou. ⚠️ **DEUX COÛTS À CONNAÎTRE, écrits plutôt que tus** : ① **50 scénarios = 50 appels API par passe** (contre 21) ; ② **la limite ne bouge pas** — ces vérificateurs mesurent ce qui est mesurable **par du code**. Le ton, le naturel, *« est-ce que Milo est agréable »* restent au **juge humain**, et aucun de ces 50 ne le remplace. Fichiers : `tests/milo/eval-scenarios.js`, `tests/parcours/runner.js`, `docs/JOURNAL-DE-TEST.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v994. |

**ft-v993 — 🧠 LA COURSE `_saveCoachMemory` : PROUVÉE, PUIS CORRIGÉE — et le ⑤ de l'audit MESURÉ puis NON construit** — deux points ouverts traités, dont un par la négative.

**⛔⛔ PROUVÉE AVANT DE TOUCHER AU CODE** — c'était la consigne explicite de `docs/SUIVI-AUDIT.md` (*« à prouver ou réfuter par un test avant de toucher au code »*), et la leçon de ft-v979. Mesurée dans un navigateur en remplaçant **le réseau et rien d'autre** : deux résumés déclenchés à **20 ms d'écart** envoient tous les deux `existingMemory:"MÉMOIRE DE DÉPART"`, et **le dernier REVENU écrase l'autre**. Résultat mesuré : *« FAIT-B » perdu, sans erreur, sans trace.*

**⭐ CE QUI REND LA COURSE POSSIBLE** : `S.coachMemory` est **lu au départ** de l'appel et **réécrit au retour** — entre les deux, n'importe quel autre appel lit la même valeur périmée. L'appelant (`coach.js:4251`) ne fait pas `await`, et **c'est voulu** : l'interface ne doit jamais attendre le réseau (règle d'or #3).

**⛔ LE CORRECTIF NE REND DONC PAS L'APPEL BLOQUANT** — il **sérialise dans une file**, exactement comme le débrief de ft-v979 (**R13/R2** : on ne réinvente pas un 2ᵉ mécanisme d'attente). Chaque résumé part quand le précédent est fini et **relit `S.coachMemory` à ce moment-là**. ⭐ Mesuré après correctif : l'appel 2 reçoit *« DÉPART | FAIT-A »* et **les deux faits survivent**.

**⚠️ LA FILE NE SE CASSE JAMAIS** : un appel en échec passe la main au suivant (2ᵉ argument de `.then`) — sinon **une seule panne réseau gèlerait la mémoire pour tout le reste de la session**, ce qui serait pire que le bug corrigé. Un témoin l'épingle.

**⭐⭐ ET LE ⑤ DE L'AUDIT (caches par lieu) EST MESURÉ PUIS *NON* CONSTRUIT — c'est la bonne réponse, pas un renoncement.** Les 5 variantes sont bien **réellement distinctes** (salle **11 446** · basique **8 544** · maison **6 493** · poids du corps **2 136** · non renseigné **11 475** car.), donc GPT a raison sur le fond : elles ne peuvent pas rejoindre le bloc commun telles quelles. ⛔ **Mais l'arithmétique du cache ne donne AUCUN gain sous ~6 personnes actives dans la même heure ET sur le même lieu** — le projet a une poignée de testeurs, donc le gain est aujourd'hui **zéro**. `SUIVI-AUDIT` et **R19/R34** disaient déjà *« approuvé, mais pas construit d'avance »*, *« ne pas commencer sans données d'usage »* : la mesure le confirme. *Construire maintenant, ce serait payer de la complexité pour un gain qui n'existe pas encore.* ⚠️ **Le modèle est grossier et c'est écrit** : il compte les écritures évitées, pas le prix exact — mais l'ordre de grandeur n'en dépend pas.
Tests : **parcours 1337/1337** (+6, bloc CVIII), calculs 266/266, muscles 241/241, dates 7/7, données 102 classées 0 trou. ⭐⭐ **Le contrôle décisif est la PREUVE elle-même** : le même témoin, joué contre le code d'avant, imprime la perte (`"DEPART|A"`, FAIT-B absent) et, après correctif, `"DEPART|A|B"`. *Un correctif de course qu'on ne voit pas échouer d'abord ne prouve rien.* Fichiers : `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/SUIVI-AUDIT.md`. sw.js ft-v993. |

**ft-v992 — 🧠 LA MÉMOIRE ÉLARGIE OUVERTE À TOUT LE MONDE — et le banc d'essai ne pouvait pas juger le changement** — priorité ④, tranchée par Michel après mesure.

**⛔⛔ LA RAISON D'AVANT RESTE ÉCRITE (R30)** : le résumé des séances anciennes était réservé à **michdu75 + christophe** depuis le 03/08, et ce n'était **pas un oubli** — c'était une prudence : *« on mesure le coût réel sur deux comptes bien remplis avant d'ouvrir à tout le monde »*.

**⭐⭐ CE COÛT A ÉTÉ MESURÉ, ET C'EST LUI QUI A PERMIS DE TRANCHER — il est AUTO-DÉGRESSIF**, parce que la fonction ne résume que ce qui a été **vécu** : **3 séances → 0 car. · 5 → 0 · 8 → 665 · 12 → 967 · 20 → 1 551 · 35 → 2 622** (borne MAX = 30 lignes). *Un débutant ne paie rien, et personne n'a de réglage à faire.*

**⛔⛔ ET LA CRAINTE DU PLAFOND NE TENAIT PAS — mesure à l'appui.** Ces caractères tombent **intégralement dans le bloc PERSONNEL** : le bloc commun est identique **au caractère près** (45 362 des deux côtés). *Ce n'était pas le bon bloc.* La note de cadrage disait *« sinon le contexte dépasse le plafond »* — c'est faux, et seul le fait de mesurer les deux frontières séparément le montre.

**⭐ POURQUOI ON OUVRE (R9)** : la mémoire longue **EST** la promesse du produit — *« le sportif ne repart jamais de zéro »*. La réserver revenait à ce que **Michel juge Milo sur une mémoire que personne d'autre n'a**, donc à corriger le mauvais Milo.

**⭐⭐ ET LA VRAIE TROUVAILLE EST AILLEURS, ELLE N'ÉTAIT PAS DANS LA COMMANDE.** En vérifiant que le rite **R34** pouvait juger ce changement : **aucun des 21 scénarios du banc d'essai n'avait plus d'UNE séance**. L'avant/après aurait donc comparé **deux contextes identiques** et rendu *« aucune régression »* — **un faux vert**. ⛔ Plus large que ce chantier : *la promesse centrale du produit n'était vérifiée par AUCUN scénario.* D'où **EV-022** (22ᵉ scénario) : Milo doit retrouver une séance d'il y a 27 jours **et n'en pas inventer la charge** — deux vérificateurs déterministes, dates **relatives** (une date en dur périmerait seule dans la fenêtre glissante de 60 jours) et calculées **à midi** (famille « fuseaux horaires »).

**⚠️⚠️ UN TÉMOIN EXIGEAIT LITTÉRALEMENT L'INVERSE — 2ᵉ fois de la journée après ft-v991.** *« TÉMOIN : personne d'autre ne l'a (réservé, le temps de mesurer) »*. Il est **retourné vers ce qui compte vraiment — l'ÉGALITÉ** — avec sa raison d'avant conservée. *Rien ne distingue de l'extérieur un test qui protège un correctif d'un test qui fige une décision périmée : seule la raison écrite à côté le dit.*

**⚠️⚠️ ET MA MESURE A ÉTÉ FAUSSE DEUX FOIS AVANT D'ÊTRE JUSTE.** `_vcApplyPersona` attend le **scénario entier** (elle fait `p.apply` elle-même) ; je lui passais le sous-objet `sc.apply` → elle remettait tout à zéro **sans erreur**. Mon *« aucun scénario n'a de séance »* était donc **faux** — EV-017 en a une. *La conclusion tenait, le chiffre non.* **3ᵉ fois cette session** qu'un levier qui n'est pas celui du code produit une mesure propre et fausse.
Tests : **parcours 1331/1331** (+8, bloc CVII, + 2 témoins existants réécrits), calculs 266/266, muscles 241/241, dates 7/7, données 102 classées 0 trou. **CONTRÔLE NÉGATIF (liste blanche rétablie) : rouge, et il est INSTRUCTIF** — le détail imprimé *est* l'inégalité : `{"inconnu":0,"michel":801}`. ⚠️⚠️ **CE QUI N'EST PAS PROUVÉ, ET IL FAUT LE LIRE** : **le benchmark n'a PAS été joué** — il demande une vraie clé API, indisponible dans cet environnement. *On livre de quoi le jouer, pas son résultat* : **R34 n'est honoré que le jour où Michel le lance.** Et personne ne sait encore si la mémoire élargie **améliore** les réponses — on sait seulement que l'information **arrive**. Fichiers : `coach.js`, `tests/milo/eval-scenarios.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/SUIVI-AUDIT.md`. sw.js ft-v992. |

**ft-v991 — ⚖️ « MESURÉE » DEVIENT « ESTIMÉE » — le vocabulaire Katch de Milo** — priorité ③ tranchée par Michel, dernier point ouvert du contre-audit du 24/08.

**⛔⛔ MESURÉ DANS UN VRAI NAVIGATEUR AVANT DE TOUCHER AU CODE, et le résultat est net** : les **trois** provenances possibles de la masse maigre — ① **lue** sur un rapport de balance · ② **DÉDUITE** par soustraction (poids − masse grasse) · ③ calculée depuis un **% de gras TAPÉ AU CLAVIER** — produisaient une phrase **IDENTIQUE MOT POUR MOT** dans le prompt : *« CALCULÉ SUR SA MASSE MAIGRE **MESURÉE** (…) C'est un chiffre **SOLIDE** (…) Tu peux t'appuyer dessus **sans réserve**. »*

**⚠️⚠️ ET LE BRIEF DE DÉPART SE TROMPAIT DE CAUSE — c'est la mesure qui l'a dit, pas ma relecture.** Il annonçait *« motif regex qui capture trop tôt, repositionner ou affiner le motif »*. **Faux** : aucun motif ne capture trop tôt, la provenance **n'atteint jamais la sortie**. C'est **R4** dans sa forme la plus classique — *l'information existe dans la donnée et reste dans la donnée.* Le drapeau `lmDeduite` était bien écrit par `tracking.js`, et `leanMassRecente()` ne le transportait pas.

**⛔⛔ POURQUOI C'EST PLUS QU'UN MOT — R32.** Une balance **MESURE** un poids et une impédance ; elle **ESTIME** tout le reste avec la formule de son fabricant. Dire *« mesurée »* d'un pourcentage de gras **tapé au clavier** n'est pas une approximation de langage : c'est **un fait faux sur la santé de quelqu'un**, présenté avec l'autorité d'un appareil. Trois phrases distinctes désormais, chacune nommant sa vraie source.

**⭐⭐ ET LE TÉMOIN PROTÉGEAIT LA MAUVAISE PHRASE — c'est tout l'intérêt du cas.** Il épinglait le mot `MASSE MAIGRE MESURÉE` : **toute correction de R32 le faisait rougir et ressemblait donc à une régression**. C'est exactement pour ça que `docs/SUIVI-AUDIT.md` disait de le **corriger D'ABORD**. *Un test peut figer un bug aussi solidement qu'il protège un correctif — et rien ne distingue les deux de l'extérieur.*

**⭐ KATCH N'EST PAS DÉVALUÉ POUR AUTANT, et c'était le vrai risque.** Le prompt garde *« un MEILLEUR point de départ que la formule habituelle »* et l'**écart chiffré** avec Mifflin. Corriger un excès par l'excès inverse aurait fait douter Milo d'un calcul qui **reste le bon** — mesuré en ft-v833 : **+180 kcal/jour** chez Michel. On retire l'aplomb, pas la formule.

**⭐ LE DRAPEAU DE ft-v978 ÉTAIT ÉCRIT PUIS JAMAIS LU.** Son commentaire disait lui-même *« comportement différé mais NOMMÉ (R3) : il existe pour la correction du vocabulaire de Milo »*. C'est fait — et le commentaire est **mis à jour**, sinon il annonce dans six mois une correction déjà livrée (**R23**).

**⚠️ COMPTÉ LES ENDROITS (famille #3 de `BUGS.md`)** : la phrase n'existait qu'à **UN seul endroit** en production — pas de jumelle posée d'un côté et pas de l'autre, contrairement à ft-v973/975/984.

**⭐ ET L'ÉCRAN ÉTAIT DÉJÀ PLUS HONNÊTE QUE LE PROMPT**, ce qui est le motif exact de ft-v978 : l'aide du BMR dit depuis toujours *« chaque marque a sa formule secrète, invérifiable »* pendant que Milo, lui, disait *« sans réserve »*. **Dans presque chaque cas, le bon comportement existe déjà à quelques lignes de là.**
Tests : **parcours 1315+8/1315+8** (bloc BMR étendu), et les témoins voisins (Katch par pesée, marqueur déduit, affichage écran) **verts sans modification**. ⚠️ **Ce qui n'est PAS prouvé ici, et autant l'écrire** : que Milo *obéisse* à la nuance. `tests/milo` prouve la **PRÉSENCE** d'une règle dans le contexte, jamais son **OBÉISSANCE** — seul un A/B sur le vrai modèle le dirait, et il coûte des appels. Fichiers : `state.js`, `coach.js`, `tracking.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/SUIVI-AUDIT.md`. sw.js ft-v991. |

**ft-v990 — 💰 INSTRUMENTATION DU COÛT RÉEL PAR APPEL API** — priorité 3 tranchée par Michel après le contre-audit du 24/08, **en parallèle** de la validation unique (①②, ft-v989) : *« instrumentation fine du coût réel par appel API »*.

**⛔⛔ NE CHANGE STRICTEMENT RIEN AU COMPORTEMENT DE MILO** : lecture seule de `data.usage`, un champ que l'API Anthropic renvoie déjà à **chaque** appel et que `worker.js` jetait jusqu'ici. Capturé au **seul** point commun, `callClaude` **et** `callClaudeDiag` — cette dernière est la fonction de **production** de la conversation (`coach()` l'appelle **toujours**), malgré un nom qui laisse croire à un chemin de test.

**⛔ MÊME CHEMIN QUE `_compterIA` (R2, pas un 2ᵉ canal de télémétrie)** : fire-and-forget vers Apps Script, repli **ouvert** — une panne de mesure ne bloque jamais Milo (règle d'or #3).

**⛔⛔ CÔTÉ `Code.js`, MÊME MÉCANIQUE QUE `ai_quota` (R2/R13)** : une propriété JSON **bornée**, remise à zéro chaque jour — jamais un historique qui grossit, c'est exactement la leçon du réservoir plein à 102 % du 29/07. Le jeton de sécurité est **factorisé** (`_countTokenArme_`) plutôt que dupliqué : la même empreinte protège désormais `aiCount` **et** `aiUsageLog`.

**💶 LE COÛT EN EUROS EST UNE ESTIMATION, ÉCRIT COMME TEL** (R29 — pas de fausse précision) : les tarifs sont repris de `tests/milo/eval.js` (seule source de prix du dépôt), et le coefficient de cache-écriture (1,25×) suppose une fenêtre 5 min — le bloc commun utilise parfois 1 h, donc l'estimation sous-estime légèrement les jours où il est réécrit. **Les tokens, eux, sont exacts.**

**⭐⭐ VÉRIFIÉ FONCTIONNELLEMENT, PAS SEULEMENT EN LECTURE** : le vrai `Code.js` exécuté dans un bac à sable Node (`PropertiesService`/`Utilities`/`Session` stubbés) confirme l'accumulation, la remise à zéro quotidienne, le rejet d'un modèle inconnu (jamais de prix inventé) et le refus d'un mauvais jeton.

**⚠️ CE QUI NE PEUT PAS ÊTRE VÉRIFIÉ ICI, ET C'EST ÉCRIT** : un vrai appel facturé à l'API Anthropic, indisponible dans cet environnement — la première vraie donnée arrivera au premier appel de Michel en production.
Tests : **parcours 1315/1315** (+10, bloc R), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. Fichiers : `worker.js`, `Code.js`, `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/SUIVI-AUDIT.md`. sw.js ft-v990. |

**ft-v989 — 🛡️ LA VALIDATION UNIQUE AVANT UNE SÉANCE DE MILO** — priorité n°1 tranchée par Michel après le contre-audit du 24/08 : *« une validation déterministe unique avant l'activation de la séance : blessures, exclusions, doublons »*.

**⛔⛔ POSÉE AU SEUL POINT QUE LES DEUX PORTES TRAVERSENT** — `_appliqueMiloSession`, exactement la même raison que le contrôle d'intensité (**ft-v980**) : `_startSessionFromMilo` (aucune séance en cours, **le cas normal**) et `_applyMiloSession` (une séance tourne déjà) y convergent tous les deux. La poser ailleurs l'aurait fait manquer dans le cas le plus fréquent — c'est très exactement l'erreur déjà commise et corrigée le 23/08 (**R2**).

**⛔ ELLE NE RÉINVENTE RIEN (R2/R13) — les trois catégories réutilisent chacune un mécanisme qui existait déjà pour un autre usage :**
- **DOUBLONS** : comparaison directe des noms dans la proposition (+ la séance déjà en cours si mode « ajouter »).
- **EXCLUSIONS** : `S.exSwaps` + `_EX_SWAP_RAISONS` — la case `durable` **existait déjà**, elle filtre déjà « il me gêne »/« trop long » d'une raison de circonstance comme « machine prise » dans le contexte de Milo. Aucune 2ᵉ liste créée.
- **BLESSURES** : `_gardienZones()` + `_GARDIEN_CONSTRAINTS` (`coach.js`) — la **même** mécanique qui construit déjà la note *« dans sa séance du jour : … sollicite ton épaule »* envoyée à Milo.

**⚠️ ON SIGNALE, ON NE BLOQUE PAS** (**R24**, Constitution P13 « adapter, jamais interdire »). La séance démarre normalement ; l'avertissement reste attaché à l'exercice — comme `intensiteWarn`, un toast seul aurait disparu avant la 1ʳᵉ série. ⛔ **Seul l'ACTIF ou AUJOURD'HUI déclenche une blessure ici** : une fragilité durable mais calme reste couverte par le Gardien de la conversation — la resignaler à chaque séance serait du bruit qui finit par ne plus être lu (**R19**).

**⛔ LES CHARGES DE MILO NE SONT JAMAIS MODIFIÉES**, vérifié par un témoin dédié (**R29** — on attache, on ne touche pas).

**🎨 L'AFFICHAGE ÉTEND LE BANDEAU EXISTANT, IL N'EN CRÉE PAS UN 2ᵉ** (`_intensiteBandeau`, R2/R13) : même mécanique, même style, trois icônes en plus de ⚡ (🚫 exclusion, 🛡️ blessure, 🔁 doublon). **Vérifié à l'écran, pas seulement en données** : capture sur les 4 cas réunis, les trois bandeaux s'affichent, la charge de Milo (40 kg) part intacte, le bouton central « + » n'a pas bougé (règle d'or #9).
Tests : **parcours 1305/1305** (+10, bloc CVI), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **Contrôle négatif** : 1 rouge (« la fonction n'existe pas ») — attendu pour une fonctionnalité neuve, pas instructif en soi ; la preuve tient dans les 9 autres témoins qui exercent chaque catégorie sur des données réelles (blessure active, exclusion durable **vs** non durable, doublon, mode ajout, cas neutre sans faux positif). Fichiers : `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/SUIVI-AUDIT.md`. sw.js ft-v989. |

**ft-v988 — 🏋️ EXPORTER SEULEMENT SES SÉANCES — et l'export « normal » DIT enfin ce qu'il emporte** — Michel demande l'option, puis, en découvrant le contenu du fichier : *« oui j'ai vu mes bilans dans l'export »*.

**⭐⭐ CE N'EST PAS UN CONFORT, C'EST DE LA CONFIDENTIALITÉ.** Le bouton « Exporter » emportait déjà **tout** — **bilan sanguin, bilan corporel, TRT, profil santé** — et la modale n'avertissait **que pour les conversations**. Or le fichier existe **pour être donné** (à ChatGPT, à un coach, à moi pour déboguer). *Le seul geste possible poussait donc à partager beaucoup plus que nécessaire.* **Un export tout-ou-rien n'est pas un problème d'ergonomie.**

**⛔⛔ LISTE BLANCHE, PAS LISTE NOIRE — et c'est la seule forme acceptable ici.** Avec une liste noire, **toute donnée ajoutée demain partirait toute seule** dans un fichier censé être étroit, sans que personne ne le décide. Avec une liste blanche, le pire cas devient *« il manque quelque chose »* au lieu de *« on a divulgué quelque chose »* (**R29** — le coût de l'erreur décide).

**⛔ ET UN SEUL EXPORTEUR (R2)** : même fonction, même format, donc fichier **réimportable** — et le retrait des photos d'exercices perso (**31 % du fichier** le 17/08) vaut **gratuitement** pour le nouveau mode. *Un 2ᵉ exporteur l'aurait perdu, sans que rien ne le signale* — un témoin l'épingle.

**⭐ LE CHOIX ÉTROIT EST EN PREMIER ET EN ROUGE** : l'option la moins exposante doit être la plus facile à prendre, pas celle qu'on trouve en dernier.

**⚠️⚠️ ET LA QUESTION SE POSE DÉSORMAIS MÊME SANS CONVERSATION — changement volontaire, la raison d'avant reste écrite (R30).** Le témoin exigeait **l'inverse**, au nom de **R24** (*« ne pas poser une question inutile »*) — et l'argument était juste **tant qu'il n'y avait qu'un seul vrai choix**. ⛔ Il ne tient plus à trois : *quelqu'un sans conversation n'avait aucun choix du tout et repartait avec ses bilans dans le fichier sans qu'on lui ait rien demandé.* **Ce qui reste de R24** : le bouton « avec mes discussions » **disparaît** quand il n'y en a aucune — on ne propose jamais d'inclure zéro chose.

**⛔ LE POIDS DE CORPS N'Y EST PAS, ET LE FICHIER LE DIT AVEC LA RAISON** (sans lui, une charge ne peut pas être jugée en relatif — pour ça, l'export complet). *Un export muet sur ses trous laisse croire qu'il est complet.* Et le **nom du fichier** dit ce qu'il contient : sinon on redonne le mauvais par erreur, et un export restreint ne sert plus à rien.

**📐 AU PASSAGE — LE GARDE-FOU DE TAILLE MESURE ENFIN UN PROFIL BLESSÉ** (§14.6 de `docs/AUDIT-CONTEXTE-MILO.md`). Il testait trois profils **en bonne santé**, donc il restait vert pendant que le plafond était franchi en production chez toute personne blessée. **Mesure imprimée à chaque passe** : *sain 45 362 · blessé 47 118 (+1 756) · plafond 46 500 → dépassement de 618*. ⛔ **On ne relève pas le seuil** — c'est exactement ce que le commentaire d'origine interdit. On **épingle** le plafond blessé à 47 500 pour qu'il ne dérive pas pendant que la décision de fond attend.
Tests : **parcours 1295/1295** (+15, blocs CV + la mesure du profil blessé), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. ⚠️ **Le contrôle négatif n'est PAS instructif ici, autant l'écrire** : `lancerExportSeances` n'existe pas de l'autre côté, il ne dit donc qu'une chose. ⭐⭐ **Ce qui tient lieu de preuve est ailleurs, et c'est plus fort** : `S` a été **délibérément rempli de vraies données de santé** (ferritine, tendinite, hypertension, `fatPct`), de nutrition, d'une phrase intime de conversation et d'une adresse e-mail — *un test qui n'a rien à fuir ne prouve pas qu'on ne fuit rien*. **Les cinq témoins d'absence cherchent dans le TEXTE BRUT**, pas dans les clés : une donnée peut fuir imbriquée sans que sa clé apparaisse au premier niveau. ⚠️ **Et trois témoins EXISTANTS ont rougi** — deux par ricochet, un **parce que j'ai changé son comportement exprès** ; les trois sont réécrits **avec la raison d'avant conservée**. Fichiers : `coach.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `IDEES-FUTURES.md`. sw.js ft-v988. |

**ft-v987 — 🔢 « CE N'ÉTAIT PAS UN SCAN, J'AI RENTRÉ LE CODE-BARRE MANUELLEMENT »** — Michel, en me corrigeant. **Il avait raison, et l'app se contredisait elle-même.**

**⛔⛔ SON PROPRE COMMENTAIRE DIT *« `saisie` dit COMMENT c'est entré »*** — et les **quatre** chemins de code-barres s'enregistraient tous en `'scan'` : la caméra, la photo décodée par ZXing, la photo lue par l'IA, et **les chiffres tapés au clavier**. *Taper treize chiffres n'est pas scanner.*

**⭐ MESURÉ SUR SES 23 ENTRÉES RÉELLES, PAS SUPPOSÉ** : ses **« 6 scans » comptaient des saisies clavier**. Donc la donnée censée trancher les questions produit — celle que `docs/SUIVI-AUDIT.md` désigne comme *« la donnée pour trancher existe déjà »* — **était fausse**. Quatre valeurs désormais : `scan` · `photo-code` · `photo-code-ia` · `code-tape`.

**⭐⭐ ET CE N'EST PAS COSMÉTIQUE — LES QUATRE N'ONT PAS LA MÊME FIABILITÉ.** `scan` et `photo-code` sont décodés par **ZXing, qui vérifie la clé de contrôle** ; `photo-code-ia` et `code-tape` sont des chiffres **non vérifiés**. *C'est l'échelle des sources de **R33** appliquée à un seul champ.*

**⛔⛔ D'OÙ LE VRAI APPORT : `_eanValide()`** — la clé de contrôle d'un EAN-8/12/13, de l'arithmétique pure, **zéro réseau**. ⭐ **Pourquoi elle compte ici et nulle part ailleurs** : le seul mode d'échec de ce chemin est **SILENCIEUX**. Un chiffre faux ne donne pas *« introuvable »*, il donne **le produit de quelqu'un d'autre**, avec un vrai nom et de vraies calories. *Une erreur qui ressemble à un succès ne se voit jamais.* **Mesuré** : un seul chiffre changé sur Nutella **et** sur Coca-Cola est refusé dans les deux cas.

**⛔ ON NE BLOQUE PAS (R24)** : les codes internes de magasin ne suivent pas la norme — on **prévient** et on cherche quand même, en laissant la trace dans la provenance. Et une longueur hors norme rend `null` : *« je ne sais pas » n'est pas « c'est faux »* (**R29**).

**⚠️ ET LE MESSAGE REMPLACE le « Recherche du produit… », il ne s'empile pas dessus** — sinon il serait écrasé en une demi-seconde et personne ne le lirait. *C'est la leçon de ft-v985 : un avertissement qu'on ne peut pas voir n'existe pas.*

**⚠️⚠️ ET MON PROPRE TÉMOIN A ATTRAPÉ MON PROPRE DÉFAUT.** `_provFood` construit une **liste blanche** : le drapeau `codeDouteux` s'arrêtait à cette fonction et **n'atteignait jamais l'entrée enregistrée** — sans erreur, sans test rouge. ***C'est R4 dans la fonction qui documente R4***, et c'est la **deuxième fois au même endroit** (la première, c'était `etat`, le 19/08).

**⚠️ MON 1ᵉʳ ESSAI DE MESURE N'A RIEN MESURÉ NON PLUS** : j'écrivais `window._bcNutr`, qui est une variable de **script** — les quatre appels plantaient sur `null.name` et le témoin accusait le mauvais coupable. **3ᵉ fois cette semaine** (`_afSuggLoc`, `_miloPendingIdx`). Le témoin passe désormais par le **vrai chemin**, en remplaçant le **réseau** et rien d'autre.

⚠️ **Comportement différé mais nommé (R3)** : personne ne lit encore `codeDouteux`. Il existe pour qu'un audit puisse un jour retrouver les entrées venues d'un code non vérifié — pas pour être affiché aujourd'hui.
Tests : **parcours 1279/1279** (+8, bloc CIV), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 4 rouges, et il est INSTRUCTIF** — le détail imprimé *est* le bug : **`reçu : scan,scan,scan,scan`**, et pour le cas de Michel **`reçu : scan`**. ⭐⭐ **Le témoin des quatre chemins a été sorti du garde EXPRÈS** : il mesure un comportement qui **existait déjà, mal**, donc il tourne des deux côtés — sinon le contrôle négatif n'aurait dit qu'une chose, *« la fonction n'existe pas »*, et n'aurait rien prouvé (leçon de ft-v968). ⚠️ **Et un vert est un FAUX vert, autant l'écrire** : *« le drapeau est ABSENT sur un chemin décodé »* passe tout seul contre l'ancien code, où le drapeau n'existe nulle part. Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v987. |

**ft-v986 — ✏️ « À LA MAIN » EN PREMIER ET EN ROUGE — et deux témoins qui rougissaient à minuit** — Michel : *« intervertis, à la main en premier et en rouge »*.

**⚠️⚠️ CE CHANGEMENT REMPLACE UNE DÉCISION QUI AVAIT SA RAISON ÉCRITE (R30), et la raison d'avant reste lisible** : le code-barres était premier depuis le 15/08 parce qu'il est **gratuit, illimité et pas caché derrière l'IA**. Elle est conservée **dans le code ET dans le témoin** — *sinon quelqu'un « répare » ça dans six mois en croyant retrouver un oubli.*

**⛔ ET LA DONNÉE MESURÉE VA DANS LE SENS DE L'ANCIEN ORDRE, autant l'écrire.** Sur les **23 entrées réelles** de son journal : **scan 6 · ciqual 4 · historique 4 · ia-texte 3 · recherche 1 · manuel 1**. *Le chemin le plus emprunté passe en 3ᵉ position, le moins emprunté passe en rouge.* 👉 **On applique quand même** : c'est un arbitrage d'**usage**, pas un fait technique, et c'est Michel qui décide. **La mesure est là pour pouvoir revenir en arrière en connaissance de cause, pas pour contredire la consigne.**

**⚠️ ET LE VRAI COÛT EST AILLEURS** : *« à la main » n'est **pas** gratuit* — le champ libre part en **estimation IA** (c'est le chemin de son huile d'olive à 135 kcal). On met donc en rouge le bouton qui **consomme du quota**, à la place de celui qui n'en consomme pas. À surveiller dans `origine` : si `ia` grimpe, c'est ce bouton.

**⭐⭐ MAIS LE PLUS IMPORTANT DE CETTE VERSION N'EST PAS LE BOUTON : DEUX TÉMOINS SONT PASSÉS AU ROUGE TOUT SEULS, À 00 H 34, SANS QU'AUCUN CODE APPLICATIF N'AIT BOUGÉ.** ⭐ **Cause** : `today()` calcule le jour en heure **LOCALE** (`state.js:529` — *« l'heure du téléphone, pas Greenwich »*), et **six fixtures de test** le calculaient en **UTC**. Entre 22 h UTC et minuit, les deux ne désignent plus le même jour — et *« demain » en UTC vaut « aujourd'hui » à Paris*.

**⭐⭐ L'APP EST JUSTE ; CE SONT LES TÉMOINS QUI MENTAIENT.** Ils étaient **verts 22 heures par jour et rouges 2 heures**. *Un témoin qui dépend de l'heure à laquelle on le lance ne protège rien — il rassure.* C'est la famille **fuseaux horaires** de `BUGS.md`, cette fois **dans l'outil de mesure lui-même**.

**⛔ COMPTER LES ENDROITS — 6ᵉ fois cette semaine, et c'est ce qui a payé** : **5 fixtures dans `parcours` + 1 dans `calculs`**, dont **une seule rougissait ce soir**. *Les cinq autres étaient latentes* — elles auraient rougi un autre soir, sur un autre témoin, et on aurait cherché dans le code applicatif. Toutes repartent désormais du **`today()` de l'app** et marchent **à MIDI**, comme `journalNav` : **une seule définition du jour** (**R2**).

**🧪 ET LE BENCHMARK PASSE DE 16 À 21 SCÉNARIOS** — 5 pièges promus depuis `docs/JOURNAL-DE-TEST.md`, **tous vécus en salle, aucun inventé** : represcrire demain ce qui a été fait aujourd'hui (**EV-017**) · un repos inexécutable sur du lourd (**EV-018**) · une charge au-dessus du tenable (**EV-019**) · une variation de balance à 24 h lue comme du tissu (**EV-020**) · la récitation du contexte système (**EV-021**). ⚠️ **Motifs volontairement étroits** (**R19**) — et EV-017 ne rougit que si l'exercice est **prescrit** (ligne portant des séries), jamais s'il est **nommé pour dire qu'on l'évite : c'est le bon comportement, il devait rester vert.**
Tests : **parcours 1271/1271** (+2), calculs **266/266** (le rouge de minuit corrigé), muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. ⚠️ **Pas de contrôle négatif ici, et autant le dire** : un changement d'**ordre** ne se juge pas contre l'ancien code (le témoin d'avant exigeait l'inverse, il rougirait par construction) — il se juge à **ce qui n'a pas bougé**, et les 1 269 autres témoins sont restés verts sans le clone ni le catalogue. ⭐ **Le vrai contrôle de cette version est temporel** : les 6 fixtures corrigées ont été vérifiées **à l'heure exacte qui les faisait échouer**. Fichiers : `screens.js`, `tests/parcours/runner.js`, `tests/calculs/runner.js`, `tests/milo/eval-scenarios.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v986. |

**ft-v985 — 🗑️ LA CONFIRMATION PASSAIT DERRIÈRE — « le bouton supprimer ne fonctionne pas »** — Michel, capture à l'appui.

**⛔⛔ IL FONCTIONNAIT PARFAITEMENT.** Mesuré dans un navigateur : la question *« Supprimer l'aliment ? »* s'ouvrait bel et bien — **mais derrière la fenêtre de modification**. `document.elementsFromPoint` au centre de la confirmation rendait **`["EDIT", "CONFIRM"]`**. *La question existait, personne ne pouvait la voir — donc rien ne semblait se passer.*

**⭐⭐ ET MICHEL L'A CONFIRMÉ LUI-MÊME SANS LE SAVOIR** : *« ça a fonctionné après »*. En fermant la modale d'édition, la confirmation restée dessous devient visible et il a pu répondre. **La preuve terrain et la mesure disent exactement la même chose** — c'est le meilleur cas de figure qu'on puisse avoir.

**⭐ LA CAUSE EXACTE** : `#ov-confirm` valait **500**… et `#ov-edit-food` vaut **500 aussi**. **À z-index égal, c'est l'ordre du DOM qui tranche** — et `ov-edit-food` est créé dynamiquement puis **ajouté à la fin du body**, donc après le `ov-confirm` statique. *Deux règles à égalité, c'est le hasard du DOM qui décide.*

**⛔⛔ ET LE DÉFAUT ÉTAIT SYSTÉMIQUE, PAS PROPRE À CET ÉCRAN.** Compté : **25 appels** à `showConfirm` dans 5 fichiers, et **19 overlays** au-dessus ou à égalité — dont **13 à 9999**, plus le **toast** à 600. *Corriger le seul `ov-edit-food` aurait laissé les dix-huit autres* — c'est la 6ᵉ fois cette semaine que « compter les endroits » évite un correctif d'un seul côté.

**⭐ R2 — UN SEUL ENDROIT.** La confirmation est l'écran le plus prioritaire de l'app **par nature** : elle interrompt pour poser une question dont dépend une suppression. Elle passe donc au-dessus de tout le monde, toast compris. ⚠️ *Si un jour un overlay doit passer devant elle, c'est presque sûrement une erreur : ce qui se met devant une question bloquante empêche d'y répondre.*

**⭐⭐ ET LE TÉMOIN NE VÉRIFIE PAS LE CAS, IL VÉRIFIE LA RÈGLE** : *aucun overlay ne doit ATTEINDRE son niveau* — un `>=` et non un `>`, **parce que l'égalité est déjà le défaut**. Un futur overlay à 10000 fera rougir la livraison.
Tests : **parcours 1269/1269** (+6, bloc CIII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 3 rouges**, dont la liste complète des **19 overlays** fautifs et la pile `["EDIT","CONFIRM"]` — *le bug imprimé noir sur blanc*. ⭐⭐ **Et les 3 VERTS DES DEUX CÔTÉS sont ici la démonstration centrale** : le bouton ouvre bien la question, répondre « Supprimer » retire vraiment l'aliment, les deux fenêtres se referment. **C'est exactement ce qui prouve que le mécanisme n'a jamais été cassé — seule la visibilité l'était.** Fichiers : `style.css`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v985. |

**ft-v984 — ⚖️ LA QUANTITÉ SUIT L'ALIMENT QUAND ON LE REPREND — « sérieux c'est relou »** — Michel, trois captures à l'appui : *« Bah non beug, comment ça se fait que je ne peux pas mettre la quantité »*.

**⛔⛔ REPRODUIT DANS UN NAVIGATEUR AVANT DE TOUCHER AU CODE** — la leçon `BUGS.md` **12quater**, appliquée cette fois. Par le chemin **CIQUAL** : `blocQuantite: true`. Par le chemin de **son propre journal** — celui qu'on emprunte dès la 2ᵉ fois — `blocQuantite: false`, **alors que `per100` est bien présent dans la source**.

**⛔ `_afSuggPrendreLocale` CACHAIT LE BLOC SANS CONDITION… et transmettait `per100` deux lignes plus bas.** *C'est **R4** à deux lignes d'écart : l'information existait, et n'atteignait pas l'écran.*

**⚠️ LA CONSÉQUENCE VÉCUE EST CE QUI REND LE DÉFAUT VICIEUX** : le mécanisme de ft-v962/965 marchait **la première fois** qu'on note un aliment, et disparaissait **toutes les suivantes**. *Un défaut qui ne se manifeste qu'à la DEUXIÈME saisie ne se voit jamais en testant une fois.*

**⭐ R13/R2 — ON NE RÉINVENTE RIEN** : on reconstruit `_bcNutr` depuis le `per100` déjà enregistré, et le bloc existant fait le reste, exactement comme après un scan. Le libellé dit **d'où vient la référence** (*« ta dernière saisie »*), et la quantité reprend **celle de la fois d'avant**.

**⛔⛔ ET ON NE RECALCULE PAS LES MACROS EN ARRIVANT.** Elles sont déjà justes, et la personne a pu les **corriger à la main**. ⭐ **Mesuré** : son *29 kcal* corrigé reste **29**, pas 48. *Les réécrire aurait effacé sa correction sans le dire* (**R29**). Le recalcul part au **premier changement de quantité**, quand elle le demande : 50 g → 24 kcal · 6 g.

**⛔ Une entrée tapée À LA MAIN n'a pas de pour-100 g, donc pas de bloc** — aucun poids inventé.

**⚠️ ET CE QUI N'EST PAS EXPLIQUÉ EST ÉCRIT AUSSI** : sa 3ᵉ capture montre une **ratatouille sans pour-100 g** (*« cette ligne n'a pas de quantité connue »*). **Ce correctif ne la répare pas rétroactivement** — une entrée ancienne, ou entrée par un chemin qui n'enregistrait pas encore `per100`, reste sans quantité. *On ne prétend pas avoir tout couvert.*
Tests : **parcours 1263/1263** (+7, bloc CII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 3 rouges**, et il est **instructif** — les détails **sont la capture de Michel** : `{"bloc":false}`, et après avoir mis 50 g, `{"kcal":"29","prot":"7"}`, c'est-à-dire *rien ne bouge*. ⭐ **Et 3 des 4 verts sont de VRAIS verts** : le chemin CIQUAL, le `per100` enregistré et surtout **les macros corrigées non écrasées** ne devaient pas bouger — ils n'ont pas bougé. ⚠️ Le 4ᵉ (« pas de bloc sans `per100` ») est un demi-faux vert : avant, il n'y avait jamais de bloc. ⚠️ **Et mon 1ᵉʳ essai de mesure n'a rien mesuré** : j'écrivais `window._afSuggLoc`, qui est une variable de **script** et non `window` — le test lisait un libellé **resté de l'étape d'avant**. *Même famille que `_miloPendingIdx` deux heures plus tôt.* Le bloc passe désormais par le **vrai chemin** : on tape, le code remplit ses suggestions, on clique. Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v984. |

**ft-v983 — 🩺 LE DIAGNOSTIC MÉDICAL NE PASSE PLUS SEUL — « détecté » n'était pas « empêché »** — 3ᵉ et dernier bloquant de la contre-analyse.

**⛔⛔ CE QUE L'AUDIT DU GARDIEN DE SORTIE A DONNÉ, MESURÉ** : sur ses **5 contrôles, un seul retire vraiment** quelque chose — le bloc technique, via `_stripCoachTech`. Les quatre autres (**interrogatoire · diagnostic médical · promesse vide · source douteuse**) sont **comptés puis affichés tels quels**. *Détecté n'est pas empêché.*

**👉 POUR TROIS D'ENTRE EUX, UN COMPTEUR SUFFIT : ils nous regardent, nous. Pas pour le diagnostic.** La Constitution (**P13/P22**) dit que Milo ne diagnostique jamais et renvoie au médecin — *si la phrase sort quand même, c'est à l'app de poser le renvoi.*

**⛔⛔ ON N'A PAS RÉÉCRIT LA RÉPONSE, ET C'EST DÉLIBÉRÉ.** Le code disait déjà, à propos de ce contrôle précis : *« il attrape la FORMULE, pas l'intention — donc il SIGNALE, il ne réécrit pas (on ne charcute pas une phrase) »*. Charcuter produirait des phrases incompréhensibles sur les faux positifs, **et un faux positif est ici certain à terme**. On **ajoute** donc une ligne sous la réponse, sans en modifier un caractère — *additif, visible, réversible*. **Si le motif se trompe, le pire est un rappel de bon sens en trop, pas une phrase mutilée** (**R29** : le coût de l'erreur décide).

**⚠️ ET LE MOTIF EST DÉJÀ CALIBRÉ, c'est ce qui rend l'affichage supportable** : resserré le 21/08 après **3 faux positifs sur 3** sur de vraies réponses (*« tu es en Jour 2 »*, *« tu es en phase de charge »*). Il exige désormais une **pathologie nommée** et ne tirait sur **aucune** des 129 réponses mesurées. *Il est rare — donc il sera lu.*

**⛔ LE TON EST CELUI D'UN RAPPEL, PAS D'UNE ALARME** : *« Milo est un coach sportif, pas un médecin — il peut se tromper sur ce genre de sujet. Pour tout ce qui touche à ta santé, c'est ton médecin qui tranche. »* Trait plein et sobre, pour le distinguer du badge Gardien (pointillé rouge vif) qui, lui, est un outil interne réservé à l'admin.
Tests : **parcours 1256/1256** (+7, bloc CI), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 2 rouges**, exactement les 2 comportements neufs. ⭐⭐ **ET LES DEUX TÉMOINS QUI COMPTENT LE PLUS SONT VERTS DES DEUX CÔTÉS** : le texte de Milo **et** son `dataset.raw` (partage / PDF) sont **intacts avant comme après** — *c'est précisément ce qui prouve qu'on a AJOUTÉ et non charcuté*. ⚠️ Les 3 autres verts, eux, sont de **faux verts** : sans la fonction, « pas de rappel sur une réponse normale » passe tout seul. Fichiers : `coach.js`, `style.css`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v983. |

**ft-v982 — 🩹 UNE BLESSURE DITE À MILO ATTEINT ENFIN LE GARDIEN — et l'essai était parqué pour une bonne raison** — Michel : *« fais tout ce que tu peux, je veux que Milo soit fiable »*. C'était le point n°1 de la contre-analyse.

**⛔⛔ LE CHEMIN ÉTAIT ÉTEINT EN PRODUCTION**, derrière `window.__FT_CLONE__`. Une personne pouvait dire sa blessure à Milo, l'accepter en mémoire, **et le Gardien déterministe n'en savait rien**. ⭐ **Mesuré contre l'ancien code** : Profil Santé `""`, Gardien `[]`, consigne absente du contexte. *C'est exactement la question que Michel avait posée — la réponse était oui.*

**⚠️ L'AUDIT EXTÉRIEUR Y VOYAIT UNE RÉGRESSION du retrait du clone. C'est faux, et la nuance compte** : essai **jamais promu**, listé comme tel le jour même en ft-v976. *Personne n'avait rien cassé — une décision n'avait jamais été prise.*

**⭐⭐ ET EN LA PRENANT, ON A TROUVÉ POURQUOI L'ESSAI ÉTAIT PARQUÉ.** `_gardienZonesFromText` détecte des **NOMS DE MUSCLES**, pas des blessures. Mesuré sur 9 formes de mémoire parfaitement anodines : **7 faux positifs**. *« Michel veut prioriser le dos et les épaules »* produisait **deux zones fragiles** ; *« Travaille les biceps le jeudi »* en produisait une. **Le promouvoir tel quel aurait été PIRE que de ne rien faire** — Milo se serait mis à protéger des zones parfaitement saines, et à appauvrir les séances de gens qui n'ont rien.

**⛔ L'ESSAI N'ÉTAIT PAS OUBLIÉ, IL ÉTAIT INCOMPLET** — il lui manquait la moitié qui distingue *« parler de son dos »* de *« avoir mal au dos »*. 👉 D'où `_texteDitUneLimitation()` : **il faut DEUX choses**, une zone **et** un mot de limitation. Après : **0 faux positif et 0 raté sur 17 phrases**. *(C'est la forme du `_noteHonoree` de ft-v967 — un critère observable à deux conditions vaut mieux qu'une devinette.)*

**⭐ AU PASSAGE, « TALON » EST AJOUTÉ à la zone cheville** : c'est le mot que Michel emploie pour sa propre gêne (*« un point douloureux au talon qui réapparaît »*), et **rien ne l'attrapait**.

**⭐⭐ ET LA SECONDE MOITIÉ ÉTAIT ÉTEINTE AUSSI** : la consigne du prompt *« nomme toujours la ZONE »* vivait derrière le **même** garde. Sans elle, Milo ne nomme pas la zone — et le pont ne peut lire que ce qui est écrit. *Un garde-fou dont la moitié amont est débranchée n'est pas à moitié utile : il est inutile.*

**⛔ R2 — LE FILTRE VIT DANS LE PONT, PAS DANS `_gardienZonesFromText`** : l'autre lecteur de cette fonction, les **notes du Profil Santé**, ne contient QUE des blessures par construction. Y mettre le filtre ferait **rater de vraies limitations déjà déclarées à la main**. ⚠️ Et le mode d'échec choisi est la **sur-protection**, jamais la sous-protection : *une adaptation inutile coûte une séance prudente, une protection manquante coûte une blessure* (**R29**).

**⭐ UN TÉMOIN EXISTANT A ROUGI, ET IL AVAIT RAISON** : en activant la consigne, la règle *« accident de moto »* se retrouvait écrite **deux fois** dans le prompt. **Exemple dédoublonné plutôt que témoin désarmé** — le prompt y gagne (**R20**).

**👉 ET LA LEÇON MONTE EN R30, dans le sens inverse** : *avant de PROMOUVOIR un essai parqué, chercher pourquoi il était parqué.* Un garde d'essai est une **question non résolue**, pas un interrupteur — le retirer sans retrouver la question, c'est répondre au hasard.
Tests : **parcours 1249/1249** (+12, bloc C), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 8 rouges**, et il est **instructif** — les détails imprimés *sont* le trou : Profil Santé `""`, Gardien `[]`, `{"consigne":false,"zone":false}`. ⚠️ **Et 2 des 4 verts sont de FAUX VERTS, autant l'écrire** : *« une préférence n'ajoute rien à la santé »* et *« un Non n'alimente jamais la santé »* étaient verts avant **parce que rien n'ajoutait jamais rien**. Les 2 vrais verts sont ceux du registre, qui ne devait pas bouger. Fichiers : `coach.js`, `tests/parcours/runner.js`, `docs/REGLES-ARCHITECTURE.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v982. |

**ft-v981 — 🧮 LES DEUX BUGS DE CALCUL DE L'AUDIT — et les deux tests qui les protégeaient** — Michel, devant la contre-analyse : *« franchement j'en sais rien, il y a énormément d'information… je vois qu'il y a pas mal de problèmes que je n'avais pas vu »*, puis : *« fais tout ce que tu peux, je veux que Milo soit fiable »*.

**⛔⛔ 1ᵉʳ BUG — L'OBJECTIF « ÉQUILIBRE » RECEVAIT +350 KCAL.** La ligne s'écrivait `{…equilibre:0…}[goal]||350`, et **en JavaScript, 0 est considéré comme faux** : `0||350` rend **350**. ⭐ **Mesuré** sur un profil à 2 740 kcal de TDEE : « équilibre » rendait **3 190 kcal — exactement la valeur de « prise de muscle »**. *Quelqu'un qui choisit « maintien » recevait une cible de prise de masse*, +350 kcal par jour, sans que rien ne le signale. Corrigé à **2 840** = TDEE + phase, écart **0**.

**⚠️⚠️ ET LA TABLE ÉTAIT DUPLIQUÉE** — la même ligne, mot pour mot, dans `state.js:820` **et** `screens.js:1963`. *Corriger celle que l'audit nomme aurait laissé l'écran annoncer un écart et le moteur en appliquer un autre* — **deux sources qui se contredisent**, la famille la plus vicieuse du projet. Un seul propriétaire désormais, `goalDeltaKcal()` (**R2**). ⛔ **Le repli à 350 est conservé** pour un objectif inconnu : on teste l'**appartenance** à la table, ce qui distingue *« absent »* de *« vaut zéro »*.

**⛔⛔ 2ᵉ BUG — KATCH LISAIT UNE CLÉ QUI N'EXISTE PAS.** `leanMassRecente()` cherchait `w.bw` alors que **tous** les producteurs écrivent `kg` (`tracking.js` 421 · 668 · 729 · 938 · 1504). ⭐ **Mesuré** : avec `kg` → *mifflin, « aucune mesure de composition corporelle »* ; avec `bw` → *katch*. **La branche « pesée + % de gras → masse maigre » n'a jamais tourné en production.** ⚠️ Ce n'était pas un chiffre faux, c'était **un meilleur calcul jamais activé** — *une donnée morte ne plante pas, elle appauvrit en silence* (**R5**).

**⭐⭐ ET LES DEUX BUGS ÉTAIENT PROTÉGÉS PAR DES FIXTURES FAUSSES.** Les tests écrivaient `bw`, la production écrit `kg` : le témoin était vert **sur une forme de donnée que l'app ne produit pas**. 👉 **Les fixtures ont été corrigées AVANT le code, et elles ont rougi** — *c'est ce rouge qui prouve le bug, pas ma relecture.* **Un test qui n'emploie pas le schéma de la production ne teste rien : il rassure.**

**⭐ TROUVÉ EN VÉRIFIANT L'AUDIT, QUI NE L'AVAIT PAS VU** : un **2ᵉ lecteur cassé**. `_bilanMois()` (`app.js:3816`) lisait `pesees[0].bw` — donc la ligne *« ⚖️ Poids de corps 85 → 84 kg »* du **bilan mensuel ne s'affichait jamais**, protégée elle aussi par sa **propre fixture fausse**. *Une clé fausse ne se trouve jamais toute seule* (**R8**).

**⛔ ET LE REPLI `bw` RESTE LU** : une sauvegarde cloud ancienne peut en porter, et *perdre une mesure en corrigeant un bug serait un mauvais échange*.
Tests : **parcours 1237/1237** (+10, bloc XCIX), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 8 rouges**, exactement les 8 comportements corrigés — et **il est INSTRUCTIF, pas un « la fonction n'existe pas »** : les détails imprimés *montrent le bug lui-même* (`equilibre: 3190` à côté de `muscle: 3190`, `{"lm":null,"methode":"mifflin"}`, un bilan mensuel `{}`). ⭐ **Et les 3 verts des deux côtés sont les non-régressions** : le repli à 350 pour un objectif inconnu, le repli `bw` pour une vieille sauvegarde, et *aucune masse maigre inventée* sans % de gras — **ils ne devaient pas bouger, ils n'ont pas bougé**. Fichiers : `state.js`, `screens.js`, `app.js`, `tests/calculs/runner.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v981. |

**ft-v980 — ⚡ LE CONTRÔLE D'INTENSITÉ EN CODE — « 3 séries de 5 à 95, c'est impossible »** — Michel : *« comment il a pu déduire que je pouvais faire 3 séries de 5 reps à 95 ? je ne suis pas encore assez fort »*.

**⭐⭐ ET MILO NE L'AVAIT PAS DÉDUIT — IL L'AVAIT LUI-MÊME DÉMENTI.** Questionné (*« tu es sûr de toi ? »*), il répond : *« 105×2 → 1RM ~108 · 95×5 ≈ **88 %**, très lourd pour 3 séries de 5, on vise 80-85 %, soit 85-90 kg. **Je corrige : 3×5 à 90 kg.** »* Michel a dit *« ne corrige pas »* — Milo a obéi, **et c'est le bon comportement**. 👉 *Le défaut n'est donc pas son jugement : c'est que son contrôle ne se déclenche QUE SI ON LE QUESTIONNE.* **Il vérifie APRÈS, jamais AVANT.**

**⭐ LA RÉALITÉ A TRANCHÉ, ET ELLE EST DANS LES DONNÉES** : ce jour-là, **95×3 avec « pose de la barre à la rép. 2 », deux fois**, puis **90×3**. *Michel avait raison (infaisable), et le 90 corrigé de Milo est exactement là où il a fini.*

**⛔⛔ POURQUOI EN CODE ET PAS DANS LE PROMPT — R7 au pied de la lettre.** *« 88 % du 1RM sur 3×5, est-ce tenable ? »* est une question **arithmétique**. La confier à un modèle, c'est la faire dépendre d'un jour de fatigue — et **R9** rappelle qu'on évalue sur le modèle des **vrais** utilisateurs, pas sur celui du fondateur.

**⭐⭐ ET LA FORMULE REPRODUIT LA CORRECTION DE MILO, INDÉPENDAMMENT — c'est ce qui la valide.** On **inverse `bz()`** (Brzycki — **R2**, jamais une 2ᵉ formule de 1RM) pour obtenir la charge d'une série **maximale** à R répétitions, puis on applique un coefficient de tenue de **0,93**, parce que trois séries ne sont pas une série. Résultat : **89,5 kg conseillés** là où Milo disait **90**. ⚠️ Le coefficient est un **jugement**, vérifié sur toute la plage contre les barèmes : 3 reps → 88 % (barème 85-90) · 5 reps → **83 %** (*le chiffre que Milo a cité lui-même*) · 8 reps → 75 %.

**⛔⛔ ON SIGNALE, ON NE CORRIGE JAMAIS TOUT SEUL (R29).** Michel **voulait** ses 95 kg pour tester son max, et il en avait le droit : les charges partent **intactes**, l'avertissement est attaché à l'exercice et reste **lisible pendant la séance** — un toast aurait disparu avant la 1ʳᵉ série. ⛔ **Et sans record connu, la fonction SE TAIT** : jamais un 1RM inventé. Une **seule** série à 95 ne déclenche rien non plus.

**⛔ LE REPOS SUIT LA MÊME RÈGLE, ET C'EST MICHEL QUI L'A TRANCHÉE** : *« un 3×5 avec 90 secondes de repos c'est IMPOSSIBLE »* — donc une prescription **inexécutable**, pas discutable.

**⭐ R4 : LE CALCUL ATTEINT LE CONTEXTE DE MILO**, jumeau de `_verdictMontee` et posé **le même jour** que lui pour ne pas répéter le « correctif d'un seul côté » de la semaine (**R8**). Avec l'**auteur nommé**, et un **4ᵉ cas de figure** écrit noir sur blanc : *une charge assumée en connaissance de cause ne se juge pas.*

**⚠️⚠️ ET UN TÉMOIN M'A FAIT CORRIGER MA PROPRE POSE — la 4ᵉ fois de la semaine.** J'avais branché le contrôle sur `_applyMiloSession` seul, **la porte « une séance tourne déjà »** : il n'aurait **jamais** tourné dans le cas normal, celui de Michel. Il vit désormais dans `_appliqueMiloSession`, **le seul point que les DEUX portes traversent** (**R2**). ⛔ **Et ça a révélé un 2ᵉ défaut** : `_milo:true` **manquait** sur cette porte — une séance chargée en mode « remplacer » perdait son **auteur**, donc Milo pouvait reprocher à la personne des charges qu'il avait prescrits. *C'est l'incident du 18/08, par une porte qu'on n'avait pas regardée.*
Tests : **parcours 1227/1227** (+18, bloc XCVIII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : 13 rouges sur 18 — ⚠️ ET LES 5 « VERTS » SONT DE FAUX VERTS, autant l'écrire** : sans la fonction, les témoins de *silence* (« ne déclenche rien », « se tait ») testent `undefined` et passent tout seuls. *Un témoin qui ne tourne pas n'est pas un témoin vert* — **4ᵉ fois que ça se paie** (ft-v949, ft-v953, ft-v963). Ce qui est réellement démontré, ce sont les 13 comportements neufs ; les silences ne sont prouvés que par la passe **normale**. Fichiers : `log.js`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v980. |

**ft-v979 — 📋 LE DÉBRIEF NE SE PERD PLUS — « je n'ai pas eu de briefing à cause de la mise à jour »** — Michel, en découvrant que sa séance du jour n'avait laissé aucune trace : *« je n'ai pas eu de briefing parce qu'il y a eu la mise à jour de l'application »*. **Il avait raison, et le mécanisme est dans le code.**

**⛔⛔ LE DÉBRIEF ÉTAIT DÉCROCHÉ AVANT D'ÊTRE LIVRÉ.** L'ancien code retirait le jeton **avant** l'appel et ne le remettait que `if(!ok)` — donc **seulement quand l'appel échoue proprement**. Si l'app se recharge pendant ces quelques secondes, cette ligne ne s'exécute jamais : *le débrief n'est pas reporté, il est **perdu**, sans message et sans trace.*

**⚠️⚠️ ET LE MOMENT N'EST PAS UN HASARD.** Une mise à jour en attente **refuse de s'appliquer pendant une séance** (`_majPeutSAppliquer`) — c'est voulu — et s'applique **dès l'Accueil**… où `finishWorkout` dépose justement la personne. *La mise à jour attend sagement la fin de la séance pour tomber précisément dans la fenêtre du débrief.* Six versions ont été déployées le 23/08.

**⭐ MESURÉ DANS SES DONNÉES, PAS SUPPOSÉ** : **5 séances sur 36 sans aucun débrief** (08, 10, 15, 18 et 23/08), **toutes complètes** — 18 à 29 séries validées. Et une séance d'**un exercice et 3 séries**, elle, débriefée. *L'app débriefait 3 séries et ratait 29.* C'est **R4a** dans sa forme la plus coûteuse : rien ne plante, rien ne rougit, Milo répond juste un peu moins bien.

**⛔ ON NE POUVAIT PAS SIMPLEMENT « RETIRER LE JETON APRÈS LA RÉPONSE »** : prendre le jeton en amont est un **correctif voulu** (le double débrief du 22/08, deux objectifs mémorisés contradictoires). Le défaire ici l'aurait fait revenir de l'autre côté (**R30** — *un correctif dont on a oublié la raison finit par être contourné*). Le jeton n'est donc plus **détruit** : il passe **« en cours »**, horodaté, et un « en cours » retrouvé au démarrage retourne dans la file. *Il n'est plus jamais nulle part.*

**⛔ ET C'EST UNE FILE, PLUS UN EMPLACEMENT UNIQUE** : `setItem` n'avait **qu'une place** — deux séances sans ouvrir Milo entre les deux, et la seconde écrasait la première **en silence**.

**⭐⭐ 3ᵉ FILET, ET IL NE DÉPEND D'AUCUN DRAPEAU** : on compare ce qu'on a **fait** (`S.sessions`) à ce qui a été **débriefé**. *C'est R5 à l'envers : au lieu de « où cette donnée ressort-elle ? », on demande « qu'est-ce qui aurait dû laisser une trace et n'en a pas laissé ? ».* ⛔ **Une seule séance, la plus récente**, et **périmée à 36 h** : la consigne commence par *« je viens de terminer ma séance »* — le faire dire d'une séance vieille de deux semaines serait un **mensonge sur le QUAND**, et un débrief qui ment sur sa date vaut moins que pas de débrief (**R29**). ⚠️ **Ses séances du 08 au 18/08 ne reviendront donc pas** — c'est délibéré, et c'est écrit pour que personne ne « répare » ça plus tard (**R30**).

**⭐⭐ ET UN TÉMOIN EXISTANT A ATTRAPÉ UN DÉFAUT DE MA PROPRE CONCEPTION.** Mon rattrapage prenait `S.registre.sessionLog` pour preuve qu'une séance était débriefée. **Le témoin est passé au rouge, et il avait raison** : ce registre n'est écrit que si Milo termine par son **bloc technique caché**. Une réponse sans bloc aurait donc fait re-débriefer la **même séance à chaque lancement**, **en payant un appel au modèle à chaque fois**, sans que rien ne le signale. *Le filet destiné à rattraper un oubli serait devenu une fuite silencieuse.* 👉 *« un débrief a été LIVRÉ »* et *« Milo a produit une mémoire »* sont deux faits différents : ils ont désormais chacun leur propriétaire (**R2**).

**⛔ CORRIGÉ AU PASSAGE, ET C'EST LA CAUSE D'UN VIEUX SYMPTÔME** : la déduplication comparait `sessId===sid` en **strict**, alors que les deux chemins ne passent pas le même **type** (`id` numérique côté séance, **chaîne** côté Coach). `"1787227670282" === 1787227670282` est faux → le doublon n'était pas vu. Mesuré : **4 dates en double** dans son registre (30/07, 31/07, 03/08, 05/08) — *et c'est ce qui lui a fait dire « on avait pas dit samedi les pecs ? »*. Le correctif de course du 22/08 fermait la porte ; le type laissait la fenêtre ouverte.
Tests : **parcours 1209/1209** (+18, bloc XCVII), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF CONTRE L'ANCIEN CODE : 16 rouges**, exactement les 16 comportements neufs. ⚠️ **Peu instructif en soi** (la file n'existe pas de l'autre côté) — **et ce qui compte est ailleurs, dans les 2 VERTS DES DEUX CÔTÉS** : *« la séance n'est débriefée QU'UNE FOIS même si le Coach s'ouvre pendant l'appel »* et *« le jeton est consommé »*. **C'est exactement ce qu'il fallait voir** : le correctif anti-double-débrief du 22/08 ne devait pas bouger d'un pouce, et il n'a pas bougé. Fichiers : `coach.js`, `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v979. |

**ft-v978 — 🔍 LES TROIS CORRECTIONS DE L'AUDIT — et le PDF n'était pas cassé, c'est la livraison** — Michel envoie un dossier d'audit de **200 pages**, avec une consigne explicite : *« ne rien coder immédiatement, lire, classer, dédoublonner et confronter au code »*. Puis, le rapport lu : *« il n'y a que ça comme conclusion ? »*, et enfin *« vas-y fais les 3 corrections de vingt minutes »*.

**⭐⭐ LE DOSSIER MET LE PDF DE MILO EN P0, ET SES DEUX HYPOTHÈSES SONT FAUSSES.** Il proposait ① le PDF ne contient que le titre (bug d'extraction) ou ② le PDF est correct mais trop pauvre. **Mesuré dans un vrai navigateur : `_coachPdfText` rend 81 caractères sur 81, 323 sur 345, 9 769 sur 9 769** selon le format. *Le contenu est intact — c'est la LIVRAISON qui échoue.*

**⛔⛔ LA VRAIE CAUSE ÉTAIT LITTÉRALE** : `navigator.share({files:[file], title:'Conseil de '+coach})`. *« Conseil de » + « Milo »* = **mot pour mot ce que Michel voyait**. Il ne recevait pas un PDF amputé : il recevait le **titre de la feuille de partage**, le fichier ayant été jeté.

**⭐⭐ ET LE CORRECTIF EXISTAIT DÉJÀ DANS LE DÉPÔT — POSÉ D'UN SEUL CÔTÉ.** Le 20/08, même symptôme sur le rapport du benchmark (*« Benchmark Milo »*, une ligne), avec cette note écrite ce jour-là : *« ⚠️ PAS DE title: DANS LE PARTAGE. La feuille iOS a gardé le titre et jeté le fichier. »* **Un seul export l'avait reçue ; neuf le gardaient.** C'est la **3ᵉ fois en deux jours** (ft-v973, ft-v975), d'où la leçon appliquée ici : *compter les endroits, deux nombres et pas un.* **0 des 10 partages de fichier garde un titre**, contre 1 sur 10 avant. ⛔ Les partages de **LIEN** gardent le leur : c'est là qu'un titre sert.

**⚠️ ET CE QUI N'EST PAS PROUVÉ EST ÉCRIT AUSSI** : l'échec lui-même n'a pas pu être reproduit (il demande un vrai Safari iOS), et la note du 20/08 relevait que d'autres exports passaient un titre **en fonctionnant** — le titre seul n'explique donc probablement pas tout, l'application choisie dans la feuille compte. *On corrige avec ce qui a marché une fois, en disant ce qu'on ne sait pas.*

**⛔ 2ᵉ CORRECTION — « ON Y PERD DU MUSCLE AVANT DU GRAS » EST RETIRÉE.** La phrase s'affichait sous le plancher calorique. Le corps n'a pas d'interrupteur qui basculerait de la graisse au muscle. Remplacée par ce qui est **vrai** : *plus le déficit est fort et long, plus il devient difficile de garder son muscle — les protéines et la muscu aident, sans compenser tout.* ⛔ **Et aucun seuil n'est inventé en échange** (**R29**) : *« sous X kcal le muscle part »* n'existe pas sous cette forme, un témoin refuse tout chiffre de ce genre.

**⛔⛔ 3ᵉ CORRECTION — LE MARQUEUR « VALEUR DÉDUITE » QUE J'AVAIS JETÉ MOI-MÊME.** En ft-v974, le lecteur marquait `_maigreDeduite` quand la masse maigre est retrouvée par **soustraction**… puis je **supprimais ce marqueur** avant de remplir le formulaire. Elle arrivait donc indiscernable d'une valeur **lue**. *Six mois plus tard, 68,7 kg ne dirait plus s'il a été lu, calculé ou tapé* (**R33**). Le drapeau est conservé et **enregistré avec le bilan**, à côté de sa provenance.

**⚠️ COMPORTEMENT DIFFÉRÉ MAIS NOMMÉ (R3)** : personne ne lit encore ce drapeau. Il existe pour la correction suivante — le prompt de Milo présente aujourd'hui cette valeur comme *« MASSE MAIGRE MESURÉE … chiffre SOLIDE … tu peux t'appuyer dessus sans réserve »*, y compris quand elle vient d'une pesée dont le **% de gras a été tapé à la main**.

**👉 CE QUE L'AUDIT A VRAIMENT MONTRÉ, et c'est le plus utile** : il n'y a pas 25 problèmes, il y en a **un, vingt-cinq fois** — *une phrase écrite par une version antérieure du produit, restée en place pendant que le moteur, lui, a appris.* `bmrDetail()` nomme sa méthode ET sa raison avec soin, la phrase qui le décrit dit « sans réserve ». `calcSportExtra()` justifie ses +150 sur huit lignes, `calcWorkExtra()` juste au-dessus n'en justifie aucune. La branche **contraception** dit *« entraîne-toi selon ta forme du jour »*, la branche **cycle naturel**, dans la MÊME fonction, dit *« c'est le meilleur moment pour tenter des PR »*. **Dans presque chaque cas, le bon comportement existe déjà à quelques lignes de là.**

**⭐ ET UNE TROUVAILLE QUE LE DOSSIER N'AVAIT VUE QU'À MOITIÉ** : il signale *« tout ce qui n'est pas F devient un homme »*. **Les deux défauts coexistent** — le BMR Mifflin s'écrit `gender==='H'` (donc un sexe absent est traité en **femme**, −161 kcal), le plancher calorique s'écrit `gender==='F'` (donc en **homme**, 1500). *Un profil abîmé serait calculé comme l'une et plafonné comme l'autre.* Une seule porte n'est pas validée : `setup.js:2390`, à la restauration cloud. **Non corrigé ici** — c'est un P2 et il demande de décider ce que « inconnu » veut dire.
Tests : **parcours 1192/1192** (+10, bloc XCVI), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. **CONTRÔLE NÉGATIF : **6 rouges lus** (mes 2 derniers témoins sont tombés hors de ma fenêtre de lecture ; ils portent sur un drapeau qui n'existe pas dans l'ancien code, donc rouges aussi). ⭐⭐ **Les 3 VERTS DES DEUX CÔTÉS sont ici les plus importants**, et l'un d'eux est la démonstration centrale : *« l'extraction du texte du PDF ne perd rien »* est vert **avant comme après** — c'est exactement ce qui prouve que **le contenu n'a jamais été le problème**, et que les deux hypothèses de l'audit étaient fausses. Les deux autres gardent une absence : aucun seuil chiffré n'était inventé, et les partages de LIEN n'ont pas perdu leur titre au passage.**. Fichiers : `screens.js`, `coach.js`, `tracking.js`, `app.js`, `log.js`, `setup.js`, `tests/parcours/runner.js`, `constants.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v978. |

**ft-v977 — 📐 LE HEADER COMPACTÉ SORT DU PLACARD — et trois de ses quatre règles n'auraient RIEN fait** — Michel, aussitôt après le retrait du clone : *« le header compacté oui, promeus-le »*.

**⭐ C'EST LE PREMIER DES CINQ ESSAIS PARQUÉS À ÊTRE TRANCHÉ.** Il attendait derrière `html.is-clone` depuis **ft-v610**, marqué *« à promouvoir si Michel valide »* — et le retrait du clone (ft-v976) venait de lui enlever son dernier moyen d'être essayé. *Un essai parqué sans porte de sortie finit oublié, pas décidé* (**R30**).

**⚠️⚠️ ET LA PROMOTION AURAIT ÉTÉ UN NO-OP SILENCIEUX.** En retirant `html.is-clone`, les quatre règles **perdent leur spécificité** — or **trois d'entre elles sont redéfinies PLUS BAS** dans `style.css` (`.coach-header` l. 798, `.coach-header-sub` l. 800, `.coach-quota` l. 897). Empilées en haut du fichier, elles auraient été **écrasées**, et « c'est promu » aurait été faux **sans qu'aucun test ne rougisse**. Les quatre valeurs sont donc écrites **dans la règle d'origine** : *deux règles qui se disputent la même propriété, c'est une de trop* (**R2**).

**⭐⭐ D'OÙ LE TÉMOIN : il ne vérifie pas que les règles EXISTENT, il vérifie qu'elles GAGNENT.** Il lit le style **calculé** par le navigateur, pas le fichier — la seule mesure qui distingue « écrit » de « appliqué ».

**🔴 RÈGLE D'OR #9 — MESURÉ, PAS REGARDÉ** : le bouton central « + » est à **792 px avant et 792 px après**, hauteur **44 → 44**, et il ne bouge pas non plus après une navigation. La barre de navigation reste à 770.

**👉 LE GAIN EST RÉEL ET IL VA AU BON ENDROIT** : le header de Milo passe de **83 à 50 px**, ce qui rend **+45 px** au fil de discussion et **+12 px** à l'Accueil. La barre de saisie ne bouge pas. ⛔ **Et l'identité ne bouge pas non plus** : le titre reste à 21 px, son sous-titre à 13,5 px — *le gain vient des ESPACEMENTS seuls*, un témoin l'épingle. ⛔ La marge **haute** n'est pas réductible davantage : au-dessus du logo, c'est la barre d'état de l'iPhone.

**⛔⛔ ET UN SECOND ESSAI EST DÉLIBÉRÉMENT **NON** PROMU (ft-v611), avec sa raison écrite dans le code** : il raccourcissait *« 8 questions gratuites »* en *« 8 questions »*. Ça gagne quelques pixels **sur le dos de ce que la personne comprend de son compte** — *« 8 questions » se lit comme un plafond définitif*. On ne prend pas de la place à la clarté. *Un maintien sous garde s'écrit comme un retrait* (**R30**), sinon le suivant « répare » une décision.
Tests : **parcours 1182/1182** (+7, bloc XCV), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. Fichiers : `style.css`, `coach.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v977. |

**ft-v976 — 🧪 LE CLONE DE TEST EST RETIRÉ** — Michel : *« ai-je encore besoin du clone ? »*, puis, la mesure en main : *« plus besoin des clones, ça permettra de gagner du temps »*.

**⭐ MESURÉ AVANT DE COUPER (R30 — un retrait se décide, il ne se constate pas), et le chiffre est net** : sur les **60 dernières versions**, le dossier `clone/` a changé **à chaque fois**… et **zéro fois tout seul**. *Il n'a donc jamais servi de bac à sable sur cette période — il recopiait la prod.* Sa raison d'être (04/07/2026) était d'essayer un restylage complet **avant** la prod, parce qu'un dépôt séparé m'était impossible. Cette raison n'a plus de cas actuel.

**⛔ CE QU'IL COÛTAIT ÉTAIT RÉEL** : 8 fichiers à dupliquer par version, un correctif propre au clone à re-poser (les chemins `../data/`), son `sw.js` à synchroniser, 2,8 Mo, et une **deuxième source de vérité** qui peut diverger sans rien casser.

**⚠️⚠️ ET LE PIÈGE S'EST DÉCLENCHÉ LE JOUR MÊME, C'EST CE QUI A DÉCLENCHÉ SA QUESTION** : en synchronisant, un `cp` un peu vite a **effacé 91 lignes de `clone/index.html`** — le shim qui isole ses données des vraies. Repéré et restauré. ⭐ **Or un script de synchro existait** (`build_clone.py`), avec justement un garde-fou *« shim clone introuvable — abandon, rien écrasé »*. *Un outil qu'on contourne ne protège rien.*

**⛔⛔ LES GARDES `window.__FT_CLONE__` SONT CONSERVÉES EXPRÈS, ET LA RAISON EST ÉCRITE DANS LE CODE** : plusieurs **essais** vivent derrière elles, et les débrancher les rendrait soit **universels**, soit **perdus** — deux changements de comportement que personne n'a demandés. *On a supprimé le clone, pas arbitré ses expériences.*

**👉 CE QUI SE RETROUVE DONC PARQUÉ SANS MOYEN DE L'ESSAYER, et c'est à trancher séparément** : ① les **zones de santé lues dans le texte** d'une mémoire acceptée (`coach.js`) · ② le **header compacté** (`style.css`, marqué *« à promouvoir si Michel valide »* depuis ft-v610) · ③ la **« promesse » d'inscription** (`.ob-clone-only`) · ④ la consigne de **mémoire des blessures** (retenir la conséquence durable, pas l'anecdote) · ⑤ les outils de test (questions illimitées, refaire l'inscription). ⚠️ **Le badge du Gardien, lui, ne se perd pas** : il est aussi ouvert à l'admin.

**⛔ DEUX TÉMOINS ONT DÛ ÊTRE TRAITÉS, ET DIFFÉREMMENT** : celui des boutons de rejeu est **reciblé** (la garantie ne change pas, elle ne porte plus que sur un fichier) ; celui qui vérifiait que *« le clone a exactement le même menu »* est **retiré avec sa raison écrite à sa place** — *ce qu'il protégeait, deux copies qui dérivent, a disparu avec la seconde copie.*

**👉 ET SI UN BAC À SABLE REDEVIENT NÉCESSAIRE**, il se refabrique depuis la prod en quelques minutes — c'est exactement comme ça qu'il est né.
Tests : **parcours 1175/1175** (−1, exactement le témoin de parité du clone retiré), calculs 266/266, muscles 241/241, croisés 50/50, dates 7/7, milo 10/10, données 102 classées 0 trou. ⚠️ **Un retrait ne se juge pas à un contrôle négatif mais à ce qui n'a PAS bougé** : les 1 176 témoins de la version précédente doivent rester verts sans le clone. Fichiers : `clone/*` (supprimé), `build_clone.py` (supprimé), `app.js`, `tests/parcours/runner.js`, `tests/milo/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`. sw.js ft-v976. |

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
