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
- 🏛️ **`docs/REGLES-ARCHITECTURE.md`** — **COMMENT ON CONSTRUIT** (créé 27/07/2026 sur une proposition de GPT, qui pointait un vrai manque : les règles de conception existaient mais **éparpillées**). **38 règles** rassemblées (R1→R36, plus R4a/R4b), chacune née d'un **événement réel** (bug, décision, galère) : les **données** (source de vérité unique · ne jamais dupliquer · comportement observable *différé mais nommable* · **l'info doit descendre jusqu'à la DONNÉE pas rester dans le TEXTE** · l'audit à l'envers) · les **décisions** (une seule voix, construite **émergentiellement** · le cerveau distribué → **le prompt est le dernier levier** · un prompt ne compense jamais une donnée absente · le **modèle** est une variable structurelle · permissions **bornées** · sécurité > vitesse · cohérence > réactivité) · la **construction** (enrichir l'existant · un comportement copié peut devenir faux · tout chemin de fermeture pose son marqueur · local-first · chaque bug devient un test · vérifier le **déploiement** pas le push) · la **gouvernance** (légère · prompt maigre / doc jardinée · critère d'entrée · retours à 3 paliers) · et **R36 — ce qui décrit LE MONDE se récolte, ce qui décrit LA PERSONNE reste chez elle** (avec son compagnon : un texte libre ne se garde qu'à partir de 3 identifiants distincts). ⚠️ **Ne pas confondre avec la Constitution** : celle-ci dit comment Milo se comporte envers la **personne** (éthique) ; celui-là dit comment on **construit le système**. En cas de conflit, la Constitution l'emporte.
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
| `sw.js` | Service Worker (cache-first HTML navigation, cache-first assets) — cache versionné `ft-vNN`, bumpé à chaque release (**actuel : `ft-v1199`** — voir le journal des versions) |
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
| **Architecture (comment on construit)** | `docs/REGLES-ARCHITECTURE.md` | Les 38 règles de conception, chacune née d'un vrai événement. Le « comment on construit », distinct du « comment Milo se comporte » (Constitution). |
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

> **Version actuelle : `ft-v1199`** (prochaine : `ft-v1200`). Historique complet (ft-v128→574 + gouvernance
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

**ft-v1199 — 🔢 3-ii : LA PASTILLE « TA DERNIÈRE QUANTITÉ » · ET UN DÉFAUT RÉEL TROUVÉ PAR LA SONDE, MESURÉ ET NON CORRIGÉ** — Michel valide 1b-iii et redemande la même méthode, avec le **test d'entrée** en tête.

**⭐ TEST D'ENTRÉE PASSÉ : 2 copies STRICTEMENT identiques** — `_bcProposerDerniere((+X.q>0 && (!X.u||X.u==='g')) ? +X.q : 0)` chez `quickFillFood` et `_afSuggPrendreLocale`, au nom de variable près → **`_qGrammes(src)`**.

**⭐⭐ ET LES 5 SITES « GRAMMES SEULS » ONT ÉTÉ MAPPÉS AVANT DE CHOISIR : ILS N'ONT PAS LA MÊME FORME.**

| ligne | forme | sous-étape |
|---|---|---|
| `_provFood` @1232 | `if(cond){ p.q=…; p.u='g' }` — **ÉCRIT** | 3-iv |
| **@2878 · @4033** | `(cond) ? +X.q : 0` — une **valeur** | **3-ii, livrée** |
| @2929 · @4089 | `if(!_bcNutr && cond){` | 3-iii |

👉 ***Ce qui est commun aux CINQ est la condition ; ce qui est commun aux DEUX de 3-ii est l'expression entière.*** ⭐ **Elle rend donc un NOMBRE, pas un booléen** — et ce n'est pas un détail : `_qGrammes(x) > 0` **est** exactement la condition, donc 3-iii et 3-iv lui ajouteront leurs appelants **sans réécrire la règle**. *Un seul propriétaire pour trois sous-étapes.*

**⛔⛔ CE N'EST PAS `_qReprenable`, ET LA DIFFÉRENCE EST LE POINT DE CONCEPTION.** Celle de 3-i **accepte les portions** ; celle-ci les **refuse**, parce que ses appelants alimentent un champ **en grammes**. Elles se ressemblent à un `||` près et ne disent pas la même chose — les fondre serait un **changement de comportement**. **Deux témoins figent qu'elles restent DEUX**, et les mutations qui les fusionnent *dans un sens comme dans l'autre* rougissent.

**⭐ LE TÉMOIN DE PÉRIMÈTRE DE 3-i SE DÉPLACE, IL N'EST PAS AFFAIBLI.** Il exigeait *« la règle est écrite **5 fois** »* — c'était le garde-fou qui empêchait 3-i de déborder. 3-ii ayant été faite **exprès**, c'est désormais **3 écritures + 2 appelants**, avec la raison écrite à l'endroit exact **et ce que deviendra le compte après 3-iii et 3-iv**. *Deuxième fois qu'un témoin de périmètre se déplace au lieu de disparaître.*

**⛔⛔ ET LA SONDE A TROUVÉ UN VRAI DÉFAUT, HORS PÉRIMÈTRE — MESURÉ, ÉCRIT, NON CORRIGÉ.** `_afOublierAliment` **ne rend PAS** la pastille « la dernière fois » : seule `openAddFood` le fait. Donc **entre deux aliments d'une même ouverture**, celle du précédent **reste affichée** quand le site est sauté — un aliment **en portions**, ou sans pour-100 g. Mesuré à la sonde : après un aliment à 150 g, un aliment en portions garde *« ↩ 150 g (la dernière fois) »* **sur le mauvais aliment**. 👉 ***C'est la JUMELLE EXACTE du défaut du PAQUET corrigé en ft-v1193*** — à cette date `_afOublierAliment` a reçu le rendu de `_bcProposerPaquet`, **et pas celui-ci**. **R8, à l'intérieur même du correctif qui a fermé sa sœur.** ⛔ **Non corrigé ici** : une extraction ne change **aucun** comportement, et son critère est un instantané identique — poser l'appel manquant changerait ce que l'écran affiche. *Écrit dans `docs/JOURNAL-DE-TEST.md` avec sa mesure et son correctif d'une ligne, et laissé à Michel.*

**⚠️⚠️ ET LA SONDE M'A APPRIS OÙ VIT LA LIGNE, À MES DÉPENS.** Le site de la pastille est **dans un garde** : `if(P && it.u!=='portion' && …)` où `P = it.per100`. **Mes 6 premiers cas n'avaient pas de `per100`** → le bloc était **sauté**, `_bcProposerDerniere` jamais appelée, et **les six rendaient la même valeur** — un reliquat. 👉 ***Une sonde qui n'atteint pas la ligne visée mesure l'écran d'avant, pas la règle.*** *Et elle est verte, ce qui est le pire des cas.*

**⭐ CRITÈRE BINAIRE ATTEINT** : l'instantané passe de **15 à 17 clés** — les deux portes étaient **conduites** depuis 1b-ii, mais **rien ne LISAIT `#af-bc-last`**, donc il serait resté identique quoi qu'on fasse à la pastille. ***Conduire n'est pas observer.*** Identique **octet pour octet** avant/après, sha256 **`b8f06e45d8c91fcc`**.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change : deux copies d'une règle deviennent une (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **la pastille périmée n'est PAS corrigée** (mesurée, écrite, décision de Michel) · ⛔ ni 3-iii, ni 3-iv, ni 1b-v · ⛔ ni le **hub** ni la **douane** · ⛔ `S.savedFoods`, l'écart **48,3 / 48**, l'historique et les migrations restent ouverts. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests : **parcours 3633/3633 sur l'arbre FINAL** (+13, bloc **CCXCVI**) — **total prédit = total obtenu** (3620 + 13). **Calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou nouveau. ⛔ **CONTRÔLE NÉGATIF : 11 MUTATIONS, TOUTES MORDENT, contrôle sain à 0 rouge sur 13 témoins** — ① rend toujours 0 → **3** · ② la règle ignorée → **3** · ③ le test `>0` retiré → **1** · ④ ⭐ **débordement : les portions acceptées (fusion avec `_qReprenable`)** → **2**, dont le témoin de périmètre · ⑤ les `ml` acceptés → **3** · ⑥ l'unité absente refusée → **3** · ⑦ elle rend un booléen → **3** · ⑧/⑨ une porte garde sa copie → **1** chacune · ⑩ ⭐ **débordement INVERSE : `_qReprenable` perd ses portions** → **1**, exactement le témoin qui protège les deux règles · ⑪ une porte appelle la mauvaise → **1**. ⭐ **Mutations ancrées sur la signature de `_qGrammes`** : `_qReprenable` porte un motif très proche et vit **juste après** dans le fichier — la leçon de la veille, appliquée d'avance.

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1112**, l'étape « Déployer sur GitHub Pages » **`success` à 19:16:04 UTC** sur `5f16740e`. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés). ⭐ *Lu sur les JOBS, pas sur le statut du run* — la leçon de ft-v1196. ⚠️ **Limite dite** : le proxy de ce conteneur refuse `github.io` (403), donc je ne peux pas lire le `sw.js` réellement servi — *l'étape est verte, l'app affichant ft-v1199 reste à confirmer par Michel.*

Fichiers : `app.js`, `tests/parcours/runner.js`, `tools/instantane_1b23.js`, `sw.js`, `CLAUDE.md`, `docs/SOUS-ETAPES-1B-3.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1199. |

**ft-v1198 — 📋 1b-iii : LE NOYAU D'UN ITEM DE LISTE · ET LE PLAN ANNONÇAIT DEUX DIVERGENCES, IL N'Y EN A QU'UNE** — Michel valide 1b-ii et pose le **test d'entrée** en consigne permanente : ***« avant toute extraction, vérifie d'abord qu'il y a réellement au moins deux copies »*** · ***« extrait uniquement ce qui est strictement identique »*** · ***« toute divergence métier reste visible chez les appelants »***.

**⭐ TEST D'ENTRÉE PASSÉ** : **3 sites réels** — `_buildFoodQuickItems` branche **favoris** et branche **récents**, plus `toggleFavFood` (le favori enregistré).

**⭐⭐ ET LE NOYAU A ÉTÉ MESURÉ CHAMP PAR CHAMP, PAS ESTIMÉ** : **9 champs strictement identiques aux trois** — `name` · `kcal`/`prot`/`carbs`/`fat` en `||0` · `per100` · `q` · `u` · `portionLabel`. Ils deviennent **`_itemListe(src)`**.

**⛔⛔ ET LE DOCUMENT SE TROMPE À MOITIÉ, POUR LA TROISIÈME SOUS-ÉTAPE D'AFFILÉE.** Il annonçait : *« `q` vaut `0` chez `_buildFoodQuickItems` et `null` chez `toggleFavFood` ; `portionWeightG` pareil »*, et en déduisait un propriétaire à **paramètre** — `_itemListe(src, {vide:0})` vs `{vide:null}`.

| champ | ce que le plan disait | ce que la MESURE dit |
|---|---|---|
| `q` | « `0` ici, `null` là » | ⛔ **`+X.q>0?+X.q:0` aux TROIS sites** — il ne diverge pas |
| `portionWeightG` | « pareil » | ⭐ **la SEULE vraie divergence** : `0` · `0` · **`null`** |

👉 ***Le paramètre était dimensionné pour deux écarts alors qu'il n'y en a qu'un.*** **Il n'a donc pas été écrit** : `portionWeightG` et `fav` restent **écrits chez chaque appelant**, où l'écart se lit à l'œil nu. *Un paramètre inutile déplace la divergence DANS le propriétaire au lieu de la laisser visible* — c'est exactement ce que la consigne interdit.

**⛔ ET `origine`/`sourceId`/`etat` NE BOUGENT PAS** : cette forme n'existe qu'**à la branche récents**, **une seule copie**. *On ne crée pas de propriétaire pour une forme unique* (la règle qui a fait écarter 1b-iv la veille) — et une mutation qui les y ferait entrer rougit.

**⚠️ SONDE : OUVERTE, PAS CRUE — et l'étiquette était juste cette fois.** `1b_buildFoodQuickItems` appelle **la production** avec les **deux** branches garnies (`savedFoods` ET `foodLog`), et `1b_toggleFavFood_complet`/`_nu` conduisent `toggleFavFood` deux fois, **dont le cas `null`**. ⭐ *Après deux étiquettes fausses de suite (3-i « couvert » alors que non, 1b-iv « aucune sonde » alors que si), celle-ci tient — vérifiée en l'ouvrant, pas en la lisant.*

**⭐ CRITÈRE BINAIRE ATTEINT** : instantané **identique octet pour octet** avant/après, **sha256 `7a52c37da93e17a3`**, diff vide.

**⚠️ MON TÉMOIN DE PÉRIMÈTRE ÉTAIT FAUX, ET LE CODE SAIN L'A DIT.** Le témoin ② listait les clés attendues du propriétaire : j'en avais écrit **8 au lieu de 9**, en oubliant `name`. Il rougissait sur du code parfaitement juste. 👉 ***Un témoin de source se vérifie d'abord contre le code SAIN*** — s'il rougit là, c'est l'attendu qui est faux, pas le code. *Corrigé avant toute mutation, sinon j'aurais cherché un bug qui n'existait pas.*

**⚠️⚠️ ET UNE MUTATION NE MORDAIT PAS — MAIS LA CAUSE N'ÉTAIT PAS UN TÉMOIN MANQUANT.** *« `per100` perdu »* rendait **0 rouge**. En cherchant pourquoi au lieu de conclure : **`_srcRepriseQ` porte le MÊME motif** (`per100: s.per100 || null,`) et **vient AVANT dans le fichier** — ma mutation frappait donc **l'autre fonction**, dont les témoins vivent dans un autre bloc. 👉 ***Une mutation mal placée est indiscernable d'un témoin aveugle.*** Réancrée sur deux lignes contiguës propres à `_itemListe` : **2 rouges, exactement les deux témoins du pour-100 g**. *C'est le piège de ft-v1195, repayé — et il resservira, parce que plus on extrait de propriétaires, plus les motifs se ressemblent d'une fonction à l'autre.*

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change : trois copies d'un objet deviennent une (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **la divergence `portionWeightG` n'est PAS harmonisée** — décision produit n°2, en attente · ⛔ ni le **hub** (4) ni la **douane** (5) · ⛔ `S.savedFoods`, l'écart **48,3 / 48**, l'historique et les migrations restent ouverts. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1108**, `conclusion: success` à **17:10:07 UTC** sur `7dd2bc45`. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés). ⚠️ **Limite dite** : le proxy de ce conteneur refuse `github.io` (403), donc je ne peux pas lire le `sw.js` réellement servi — *le run est vert, l'app affichant ft-v1198 reste à confirmer par Michel.*

Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/SOUS-ETAPES-1B-3.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1198. |

**ft-v1197 — 🏷️ 1b-ii : LA PROVENANCE REPRISE · ET UNE SOUS-ÉTAPE DE MON PROPRE PLAN QUI N'AVAIT RIEN À EXTRAIRE** — Michel : ***« continue selon le découpage, une sous-étape à la fois »***, puis ***« après avoir bossé, fais-moi un PDF direct pour GPT »***.

**⛔⛔ LE FAIT DE LA VERSION EST UNE SOUS-ÉTAPE SUPPRIMÉE, PAS LE CODE LIVRÉ.** La suivante dans l'ordre était **1b-iv** (l'export CSV), que mon propre document décrivait comme ⭐ *« la sous-étape la moins risquée du lot »*. **Mesuré avant la moindre ligne : elle est VIDE.**
- `NUTRI_COLONNES` et sa construction de ligne existent **une seule fois** dans tout le code servi ;
- **aucun import ne les relit** ;
- et le partage était **DÉJÀ fait au bon niveau** : `_csvFichier(colonnes, lignes, …)` est le propriétaire commun, appelé par l'export **nutrition ET poids**, bien avant ce chantier.

👉 ***Une extraction exige au moins DEUX copies.*** En sortir une créerait un propriétaire à **un seul appelant** — pas du rangement, de la complexité sans contrepartie (**R19**).

**⭐⭐ ET L'ERREUR QUI L'A FAIT ENTRER DANS LE PLAN VAUT PLUS QUE LA SOUS-ÉTAPE.** Sa justification écrite était *« c'est elle qui était invisible au compteur »* — **vrai**, c'est le cas d'école de `BUGS.md` §63 (ft-v1194). Mais j'en ai tiré la mauvaise conclusion : j'ai versé au découpage **tout ce que le compteur avait raté**, sans jamais demander, site par site, **s'il était DUPLIQUÉ**. 👉 ***Un site qu'un compteur défaillant a manqué n'est pas pour autant un site à extraire*** : *réparer l'instrument* et *refaire l'inventaire* sont deux gestes différents, et j'avais fait le premier en croyant avoir fait le second. **Le test d'entrée est désormais écrit : compter les copies AVANT de décrire une sous-étape.**

**⚠️ ET SON ÉTIQUETTE « INSTANTANÉ » ÉTAIT FAUSSE DES DEUX CÔTÉS** : elle annonçait *« AUCUNE sonde aujourd'hui — prérequis absolu »*, or le bloc **CCIV** conduit **vraiment** `exportNutritionCsv()`, intercepte la remise du fichier et **lit le CSV produit**. 👉 **C'est le miroir exact de ft-v1196**, où l'étiquette disait *« couvert »* pour une sonde qui ne couvrait rien. ***Dans les deux sens, l'étiquette ne remplace pas l'ouverture du fichier.*** ⛔ **1b-iv reste écrite à sa place AVEC SA RAISON** (**R30**) — une sous-étape effacée ressemble à un oubli, et quelqu'un la remettrait dans six mois. ⭐ **Les 8 autres ont été auditées au même test : toutes tiennent.** Une seule était vide sur dix.

**⭐ CE QUI EST DONC LIVRÉ : 1b-ii**, la provenance recopiée d'une ligne existante — `{sourceId, etat, per100}` → **`_srcProvenance(src)`**, 3 appelants.

**⛔⛔ ET LA COUPE EST DICTÉE PAR LES DIVERGENCES, PAS PAR LA RESSEMBLANCE.** `origine` et `saisie` sont sur la même ligne et ressemblent au reste — **ils ne disent pas la même chose aux trois portes** :

| porte | `origine` | `saisie` |
|---|---|---|
| « Mes aliments » | `it.origine\|\|'reprise'` | `'liste'` |
| recherche du journal | `e.origine\|\|'utilisateur'` | `'historique'` |
| ajout direct | **`'reprise'` en dur** | `'liste'` |

⭐ **Mesuré à la sonde** : une ligne venue d'un code-barres (`origine:'off'`) se réenregistre par la porte directe en **`'reprise'`**. ⛔ **Ce n'est pas un bug** — la source n'est pas conservée sur les favoris, donc en hériter **affirmerait une provenance qu'on n'a pas relue** (**R33**). 👉 **Les unifier changerait ce que le journal DIT DE LUI-MÊME** : décision produit n°4, **transportée et figée par 2 témoins de périmètre**. *Un écart qu'on lit dans le code ne se perd pas ; un écart absorbé dans un propriétaire, si.*

**⭐ ET LE PÉRIMÈTRE DU DOCUMENT ÉTAIT FAUX AUSSI, EN PLUS PETIT** : le 4ᵉ site qu'il citait (`_buildFoodQuickItems`) **n'en est pas un** — il construit un **item de liste**, pas une provenance (c'est 1b-iii) ; et `quickAddFood` ne porte que **la paire**, son `per100` lui venant de `_srcRepriseQ` depuis ft-v1195.

**⚠️⚠️ MA SONDE ÉTAIT MORTE, ET JE L'AI VU AVANT DE CAPTURER LE BEFORE — c'est le moment qui compte, pas l'erreur.** Ma 1ʳᵉ version appelait `_afSuggPrendreLocale(0)` après avoir garni `S.foodLog` : **elle lit `_afSuggLoc[i]`, pas `S.foodLog`**, donc elle sortait au 3ᵉ caractère (`if(!e) return`) et la sonde rendait **`ABSENT` partout**. 👉 ***Un BEFORE capturé avec une sonde morte est pire qu'aucun BEFORE, parce qu'il PRODUIT une preuve*** : il serait resté identique quoi qu'on fasse au code, donc il aurait **validé n'importe quelle extraction**. Corrigée en remplissant par `_afSuggLocales()`, la **vraie** fonction de production, **avec un garde qui LÈVE si la liste est vide**. *C'est le piège d'`openSessDetail(0)` de ft-v1189, repayé.*

**⭐ CRITÈRE BINAIRE ATTEINT** : la sonde passe de **12 à 15 clés** (3 portes réellement conduites), et l'instantané est **identique octet pour octet** avant/après — **sha256 `7a52c37da93e17a3`**, diff vide.

**⛔⛔ ET J'AI REFAIT §60 : J'AI MUTÉ DES FICHIERS SERVIS PENDANT MA PROPRE PASSE.** En éprouvant les gardes du PDF, j'ai muté `app.js` et `setup.js` **alors que la passe tournait** — exactement la faute que j'ai documentée en ft-v1190, dans le fichier qui la documente. ⭐ **Rien n'a été conclu à tort parce que je l'ai vu tout de suite** : passe **arrêtée**, fichiers vérifiés restaurés, **passe relancée de zéro sans rien toucher**. 👉 ***La règle ne suffit pas : il faut que le geste soit impossible au mauvais moment.*** Le contrôle négatif d'un PDF se fait **avant de lancer la passe, ou après** — jamais pendant, comme celui du code.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change : trois champs recopiés deviennent un propriétaire (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **les 6 sous-étapes restantes** ne sont pas faites · ⛔ **aucun défaut divergent n'est harmonisé** · ⛔ ni le **hub** (4) ni la **douane** (5) · ⛔ `S.savedFoods`, l'écart **48,3 / 48**, l'historique et les migrations restent ouverts. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1104**, job `deploy` **`success`** à **14:54:37 UTC** sur `a7d6e172` — l'étape « Déployer sur GitHub Pages » close à **14:54:35**. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés). ⭐ *Lu sur les JOBS, pas sur le statut du run* — la leçon de ft-v1196, où un `in_progress` avec `updated_at` figé cachait un déploiement déjà réussi. ⚠️ **Limite dite** : le proxy de ce conteneur refuse `github.io` (403), donc je ne peux pas lire le `sw.js` réellement servi — *le run est vert, l'app affichant ft-v1197 reste à confirmer par Michel.*

Fichiers : `app.js`, `tests/parcours/runner.js`, `tools/instantane_1b23.js`, `tools/gen_1bii_pdf.py`, `docs/SOUS-ETAPE-1BII.pdf`, `sw.js`, `CLAUDE.md`, `BUGS.md`, `docs/SOUS-ETAPES-1B-3.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1197. |

**ft-v1196 — 🔍 SOUS-ÉTAPE 3-i : UN PROPRIÉTAIRE POUR « CETTE QUANTITÉ EST-ELLE REPRENABLE ? » · ET LA SONDE QUI NE COUVRAIT RIEN** — Michel : ***« continue selon `docs/SOUS-ETAPES-1B-3.md`, une sous-étape à la fois, en gardant exactement les mêmes règles »*** — une seule chose · sonde/instantané avant si nécessaire · aucun changement de comportement · divergences transportées, pas harmonisées · mutations qui mordent · rollback simple.

**⭐ CE QUI EST LIVRÉ** : la suite naturelle de 1b-i, sur **le même couple de fonctions** (`rejouerRepas` · `quickAddFood`). Le bloc `{q, u, per100, …}` a son propriétaire depuis ft-v1195 ; le **TEST** qui décide si la quantité passe restait écrit deux fois → **`_qReprenable(src)`**. Elle rend un **booléen** et ne touche à rien : c'est `_srcRepriseQ` qui décide quoi en faire. Accepte les grammes, les **portions** et l'unité absente ; refuse `0`, le négatif, et les **ml** — *sans densité, un volume ne dit pas ce que PÈSE l'aliment, et on n'invente pas une densité* (**R29**).

**⛔⛔ MAIS LE FAIT DE CETTE VERSION EST AVANT LE CODE, ET IL PORTE SUR MON PROPRE DOCUMENT.** `docs/SOUS-ETAPES-1B-3.md` annonçait pour 3-i ⭐ *« instantané : couvert »*. **Ouvert la sonde : à moitié faux.**
- `3_regle_avec_portions` **RECOPIE la règle dans la sonde** (`const regleP = c => …`) et **n'appelle pas une seule ligne de production** → elle ne peut **rien** détecter d'une extraction. *C'est une table de vérité, pas une couverture.*
- et `3_via_quickAddFood` ne conduisait qu'**UNE** des deux portes — ⛔ **`rejouerRepas` n'était sondé par rien.**

👉 ***Une sonde qui recopie la règle mesure ce qu'on CROYAIT écrire, pas ce qui est exécuté.*** Le critère de chaque sous-étape étant **binaire** (l'instantané identique octet pour octet), un instantané qui ne conduit pas la production **ne peut pas remplir ce rôle** : il resterait identique quoi qu'on fasse au code. **`BUGS.md` §58 complétée côté SONDE** — le réflexe est d'**ouvrir la sonde et d'y chercher le nom de la fonction de production** ; s'il n'y est pas, elle ne couvre rien.

**⭐ CORRIGÉ AVANT TOUTE LIGNE DE CODE**, comme la règle de découpage l'exige : `3_via_rejouerRepas` écrite, l'instantané passe de **11 à 12 clés**, et le **BEFORE capturé avec la sonde étendue** — *l'étendre après l'extraction aurait donné un avant/après incomparable.*

**⚠️ ET LE SIGNE ÉTAIT DANS LE COMMENTAIRE LUI-MÊME** : il annonçait *« les six sites conduits par leur VRAIE porte »* pour une boucle qui n'en conduit qu'**une**. 👉 **C'est le miroir exact de ft-v1190**, dont le commentaire annonçait une portée plus **ÉTROITE** que le code. *Dans les deux sens, un commentaire qui décrit mal sa portée dispense le lecteur suivant d'aller vérifier.*

**⛔⛔ CE QUE 3-i N'A PAS FAIT, ET C'EST LA MOITIÉ QUI COMPTE : LES 5 SITES « GRAMMES SEULS » SONT INTACTS.** Ils refusent les portions **exprès** — ils alimentent un champ **en grammes**. Les deux règles se ressemblent à un `||` près et **ne disent pas la même chose** : les fondre serait un **changement de comportement**, pas une extraction (sous-étapes **3-ii/iii/iv**, et l'une des 4 décisions produit qui attendent Michel). **Un témoin de périmètre exige que ce compte reste à 5.**

**⭐ LE TÉMOIN DE PÉRIMÈTRE DE 1b-i SE DÉPLACE, IL N'EST PAS SUPPRIMÉ.** Il exigeait que *les deux portes calculent encore `qOk` chacune dans son corps* (le garde-fou qui empêchait 1b-i de déborder sur l'étape 3) ; il exige maintenant que *la règle vive à **UN SEUL** endroit et que les deux portes l'**APPELLENT*** — puisque 3-i est précisément la sous-étape qui retire le premier. ⭐ **Et la différence entre un témoin qu'on retire et un témoin qui se déplace se MESURE** : les deux mutations qui le faisaient rougir en 1b-i le font toujours rougir, par l'autre bout.

**⚠️⚠️ CRITÈRE BINAIRE ATTEINT — ET LA SHA QUE J'AVAIS PUBLIÉE ÉTAIT FAUSSE.** L'instantané des 12 sondes est **identique octet pour octet** avant/après, **diff vide** — mais sa sha256 est **`d5b0572cafcc4477`**, pas le `64099b39025027ec` annoncé dans mon message de commit, qui venait d'une **version intermédiaire de la sonde**. Vérifié en rejouant la sonde **actuelle** sur l'`app.js` d'**AVANT** 3-i : **même sha des deux côtés**. 👉 ***Une sha publiée qu'on ne peut pas reproduire est pire que pas de sha*** — elle transforme un critère vérifiable en affirmation d'autorité.

**⚠️⚠️ ET MON HARNAIS DE MUTATION ÉTAIT MORT — C'EST LE CONTRÔLE SAIN QUI L'A DIT, PAS UNE INTUITION.** Les 10 mutations rendaient toutes *« SONDE MORTE »*… **y compris le contrôle sur du code sain**. Cause : la sonde imprime un **JSON multi-ligne**, et mon harnais prenait la **DERNIÈRE LIGNE** — donc `}`, qui n'est pas du JSON. 👉 ***Un harnais uniforme ressemble à un code uniformément cassé.*** C'est **§61 pour la 4ᵉ fois** (le `tail -4` de ft-v1187 · le runner planté de ft-v1193 · la passe tronquée de ft-v1192). **Le contrôle sain n'est pas une formalité : il est le seul témoin du harnais lui-même.**

**⚠️ ET UN GARDE DE MON PROPRE PDF ÉTAIT AVEUGLE, TROUVÉ EN L'ÉPROUVANT.** Celui qui protège `3_via_rejouerRepas` cherchait le nom **n'importe où dans le fichier** — or il apparaît **aussi dans un commentaire**. Renommer la **clé** le laissait muet. Recorrigé pour lire l'**ensemble des clés réellement écrites**. *C'est le défaut de ft-v1193 (un témoin qui ne distingue pas le code de ce qui en PARLE), reposé par moi dans l'outil qui documente ce défaut.*

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun comportement ne bouge : un test écrit deux fois devient un propriétaire unique (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **les 8 autres sous-étapes ne sont pas faites** · ⛔ **aucun défaut divergent n'est harmonisé** · ⛔ ni le **hub** (étape 4) ni la **douane** (étape 5) · ⛔ `S.savedFoods`, l'écart **48,3 / 48**, l'historique et les migrations restent ouverts — *le périmètre de Michel, respecté*. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests : **parcours 3590/3590 sur l'arbre FINAL** — ⭐ **et le total a demandé une explication au lieu d'être accepté** : 3578 + 11 (bloc **CCXCIII**) = 3589 prédits, **3590 obtenus**. L'écart est la **réécriture du témoin de périmètre de CCXCII**, qui passe de 14 à 15 assertions (§61 : *le total est la seule chose qui trahit une passe tronquée* — encore faut-il expliquer un écart de +1). **Calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées — aucun trou nouveau. ⛔ **CONTRÔLE NÉGATIF : 10 MUTATIONS, TOUTES MORDENT, contrôle sain à 0 rouge** — ① le propriétaire rend toujours `true` → **4 rouges** · ② toujours `false` → **4** · ③ le test `>0` retiré → **2** · ④ les portions refusées → **4** · ⑤ les `ml` acceptés → **3** · ⑥ `rejouerRepas` garde sa copie → **2** · ⑦ `quickAddFood` garde sa copie → **2** · ⑧ **débordement : un site « grammes seuls » fondu dans la règle large** → **3**, dont le témoin de périmètre · ⑨ une 2ᵉ copie de la règle réapparaît → **1** · ⑩ le garde `src||{}` retiré (**celle qui TUAIT la sonde**) → **1 rouge nommé**, grâce au `try/catch` posé exprès.

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1100**, `conclusion: success` à **14:10:53 UTC** sur `175213ff`. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés). ⚠️ **Et l'API a d'abord montré le symptôme du run bloqué** — `status: in_progress` avec un `updated_at` **figé**, comme en ft-v1190. ⭐ *Ce sont les JOBS qui ont tranché* : l'étape « Déployer sur GitHub Pages » était **`success` à 14:10:51**, seul le nettoyage traînait. 👉 **Un run « en cours » n'est pas un déploiement en attente : l'étape qui compte peut être finie.** ⚠️ **Limite dite** : le proxy de ce conteneur refuse `github.io` (403), donc je ne peux pas lire le `sw.js` réellement servi — *le run est vert, l'app affichant ft-v1196 reste à confirmer par Michel.*

Fichiers : `app.js`, `tests/parcours/runner.js`, `tools/instantane_1b23.js`, `tools/gen_3i_pdf.py`, `docs/SOUS-ETAPE-3I.pdf`, `sw.js`, `CLAUDE.md`, `BUGS.md`, `docs/SOUS-ETAPES-1B-3.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1196. |

**ft-v1195 — ✂️ LE REDÉCOUPAGE DE 1b ET 3, ET LA PREMIÈRE SOUS-ÉTAPE · UNE PAIRE DE FONCTIONS QUE PERSONNE N'AVAIT COMPTÉE** — Michel tranche les deux questions laissées ouvertes par ft-v1194 : ⛔ ***« je ne veux pas traiter 1b et 3 en un seul gros chantier — redécoupe-les en sous-étapes plus petites, mesurables et réversibles »*** · ⛔⛔ ***« je ne veux pas harmoniser maintenant les défauts divergents (0, null, clé absente, origine différente) : à ce stade, on doit les TRANSPORTER explicitement sans les corriger »***.

**⭐⭐ ET LA MESURE A NOMMÉ CE QUI CHANGE LE DÉCOUPAGE, QUE NI LE PLAN NI MON BALAYAGE N'AVAIENT VU** : `quickFillFood` et `_afSuggPrendreLocale` partagent **36 lignes utiles IDENTIQUES** — diff normalisé, 81 et 99 lignes utiles, **40 % de squelette commun**. 👉 ***Ce ne sont pas quinze sites éparpillés : c'est LA REPRISE D'UN ALIMENT À L'ÉCRAN, ÉCRITE DEUX FOIS.*** L'une prend l'item dans « Mes aliments », l'autre dans la recherche du journal, et à partir de là elles font la même chose.

**⚠️ ET L'HISTORIQUE LE DISAIT DÉJÀ — on ne l'avait jamais COMPTÉ** : ft-v973, ft-v975, ft-v984 et ft-v1176 ont **chacune** porté un correctif d'une porte à l'autre, et les commentaires du code le répètent mot pour mot (*« le mécanisme existait, posé sur une seule des deux portes — pour la 6ᵉ fois dans ce fichier »*). **5 des 10 sous-étapes portent sur cette paire** : c'est là qu'est le gisement. Découpage complet dans **`docs/SOUS-ETAPES-1B-3.md`**.

**⭐ LIVRÉ : LA SOUS-ÉTAPE 1b-i SEULE**, la seule strictement extractive. Deux endroits recopiaient le même bloc **caractère pour caractère** pour dire à `_provFood` ce qu'une ligne déjà enregistrée portait comme quantité — `rejouerRepas` (rejouer un repas d'hier) et `quickAddFood` (ajouter depuis la liste) → **`_srcRepriseQ(src, qOk)`**, `{q, u, per100, portionLabel, portionWeightG}`.

**⛔⛔ `qOk` N'EST PAS CALCULÉ DEDANS, ET C'EST TOUT LE DÉCOUPAGE.** Le test *« cette quantité est-elle utilisable ? »* est le sujet de **l'étape 3**. L'absorber ferait deux extractions dans une seule sous-étape — donc *un retour arrière qui ne peut plus être partiel*. ⭐ **Une sous-étape réversible est une sous-étape qui ne fait qu'UNE chose**, et un témoin de périmètre l'exige explicitement.

**⛔⛔ ET CE QUI N'EST PAS DEDANS COMPTE AUTANT : `sourceId`/`etat` restent chez `quickAddFood` seul.** Le rejeu ne les a **jamais** posés. La divergence est **TRANSPORTÉE, pas corrigée** — les lui donner changerait la **provenance enregistrée** d'une ligne rejouée, qui affirmerait venir d'un code-barres qu'on n'a pas relu (**R33** : la provenance ne ment pas). **Deux témoins figent les deux moitiés** : l'un exige leur ABSENCE au rejeu, l'autre leur PRÉSENCE à la porte directe.

**⭐ LE CRITÈRE ÉTAIT BINAIRE, ET IL EST ATTEINT** : les **11 sondes** de `tools/instantane_1b23.js` sont **identiques octet pour octet** avant et après — **même sha256 `ace2a744dc89e6ec`**, le même qu'en ft-v1194.

**⚖️ ET LE DOCUMENT DIT MAINTENANT QUAND UNE HARMONISATION DEVIENT UNE DÉCISION PRODUIT**, avec un critère qui ne dépend pas du code : *est-ce que le changement modifie ce qui est ÉCRIT dans `S.foodLog` ou `S.savedFoods` ?* **Quatre cas nommés** — la provenance du rejeu · l'unification `0`/`null`/clé absente · faire accepter les portions aux 5 sites « grammes seuls » · les trois formulations d'`origine`. **Tant qu'elles ne sont pas tranchées, chaque sous-étape les transporte et les fige.** *C'est le seul moyen qu'une harmonisation future soit un CHOIX et pas un effet de bord découvert trois versions plus tard.*

**⚠️⚠️ UN TÉMOIN À MOI MESURAIT UN ÉTAT INATTEIGNABLE, ET LA SONDE L'A DIT AVANT LA PASSE.** Mon témoin du défaut appelait `_srcRepriseQ({name:'Nu'}, true)` : avec `qOk` vrai et pas de `q`, `+undefined` vaut **NaN** — que `JSON.stringify` sérialise en **`null`**. 👉 *Le témoin aurait été vert sur un NaN en croyant voir un `null`*, et sur un état que les deux portes ne peuvent pas produire (`qOk` n'est vrai que si `+q>0`). Réécrit avec `false`, le cas réel. **Un témoin qui fige un état inatteignable ne protège rien, et masque le type réel de ce qu'il mesure.**

**⚠️⚠️⚠️ ET LE CONTRÔLE NÉGATIF A CORRIGÉ MON TÉMOIN DE PÉRIMÈTRE — c'est la trouvaille de la version.** La mutation *« l'étape 3 faite au passage »* rendait **0 rouge**. Ma 1ʳᵉ version comptait les **LIGNES** portant le motif : extraire la règle dans un propriétaire laisse le motif écrit **une fois dans ce propriétaire, plus une fois chez l'autre appelant** — le compte restait à 2, et le témoin passait au **vert sur exactement ce qu'il devait interdire**. 👉 ***Compter les occurrences d'un motif ne dit pas QUI décide.*** Le témoin exige désormais que **les DEUX fonctions portent la règle chacune dans son propre corps** : si l'une délègue, elle ne la porte plus, et il rougit. **C'est `BUGS.md` §63 retourné contre mon propre témoin**, écrite la veille.

**⚠️ ET MA PREMIÈRE MUTERATION DE CE CAS ÉTAIT MAL FAITE, DIT PARCE QUE ÇA RESSERVIRA** : elle déclarait le helper **à l'intérieur** de `quickAddFood`, donc le motif restait dans son corps et le témoin corrigé ne rougissait toujours pas. *Une mutation mal placée ressemble trait pour trait à un témoin aveugle.* Refaite avec le helper posé **hors** de la fonction : **1 rouge, exactement lui** — et le contrôle inverse (la règle retirée du rejeu) rougit pareil.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun comportement ne bouge : deux copies d'un bloc deviennent une (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **les 8 autres sous-étapes ne sont pas faites** — elles sont écrites, ordonnées et dépendancées dans `docs/SOUS-ETAPES-1B-3.md` · ⛔ **aucun défaut divergent n'est harmonisé** · ⛔ ni le **hub** (étape 4) ni la **douane** (étape 5) · ⛔ `S.savedFoods` et l'écart **48,3 / 48** restent ouverts · ⛔ ni l'historique ni les migrations. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1096**, `conclusion: success` à **11:39:31 UTC** sur `2d6bcbcb`. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés). ⚠️ **Limite dite** : le proxy de ce conteneur refuse `github.io` (403), donc je ne peux pas lire le `sw.js` réellement servi — *le run est vert, l'app affichant ft-v1195 reste à confirmer par Michel.*

Tests : **parcours 3578/3578 sur l'arbre FINAL** (+14, bloc **CCXCII**) — ⭐ **total prédit = total obtenu** (3564 + 14, §61). **Calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées — **aucun trou nouveau**. ⛔ **CONTRÔLE NÉGATIF : 10 MUTATIONS, TOUTES MORDENT** — ① le propriétaire rend un objet vide → **7 rouges** · ② `qOk` ignoré → **3** · ③ `portionWeightG` rend `0` (la fausse harmonisation) → **2** · ④ `per100` retiré → **4** · ⑤ `portionLabel` retiré → **4** · ⑥ ⭐ **`sourceId`/`etat` donnés au rejeu** → **1 rouge, exactement le témoin qui protège l'écart** · ⑦ l'inverse, la porte directe les perd → **1** · ⑧ **débordement : l'étape 3 faite au passage** → **1** *(après réécriture du témoin — voir plus haut)* · ⑨ une 2ᵉ copie du bloc réapparaît → **2** · ⑩ la règle retirée du rejeu (contrôle) → **1**.

Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/SOUS-ETAPES-1B-3.md` (nouveau), `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1195. |

**ft-v1194 — 🧮 UN SEUL PROPRIÉTAIRE POUR LE POUR-100 g DÉRIVÉ · ET LE PÉRIMÈTRE DU PLAN ÉTAIT FAUX POUR LES DEUX AUTRES ÉTAPES** — Michel valide la phase 0a **sur iPhone** (la pastille « 410 g » ne survit pas au passage à un autre aliment) et donne le feu vert : ***« tu peux maintenant poursuivre le plan prévu : étape 1b ; étape 2 ; étape 3 »***, même méthode que 1a — *« extraction sans changement de comportement · témoins avant modification · instantané avant/après · aucune valeur attendue ne doit bouger · mutations négatives qui doivent mordre »*.

**⭐⭐ ET C'EST SA PROPRE CONSIGNE QUI DÉCIDE DE CETTE VERSION** : ***« si une régression ou une divergence réelle apparaît pendant l'extraction, mesure-la et ARRÊTE-TOI avant de la "corriger au passage" »***. La divergence est apparue **avant** la première ligne de code — et elle porte sur **le périmètre écrit dans le plan**, pas sur le code.

| étape | périmètre du plan | périmètre **mesuré** | fait ? |
|---|---|---|---|
| **1b** — la « forme aliment » | 5 sites | **≥ 15**, en **3 formes** | ⛔ **non** |
| **2** — le pour-100 g dérivé | 3 sites | **3** ✅ | ⭐ **livrée** |
| **3** — « quantité utilisable ? » | 6 sites | **7 écritures** en 2 formes · **+ 9 lignes** de la moitié PORTIONS, ignorée | ⛔ **non** |

**⛔⛔ CE NE SONT PAS DES ÉCARTS DE COMPTAGE, CE SONT DES DÉFAUTS QUI DIVERGENT** — et c'est ce qui interdit l'extraction mécanique : `q` vaut tantôt **0** tantôt **null** · `portionWeightG` vaut **0**, **null**, ou **la clé est absente** · `origine` vaut **null**, **`'utilisateur'`** ou **`'reprise'`**. 👉 *Choisir une valeur ne serait pas un rangement, ce serait une DÉCISION qui change des lignes enregistrées.*

**⚠️⚠️ ET J'AI FAILLI LIVRER, SUR L'ÉTAPE 3, EXACTEMENT LE GENRE DE CHIFFRE QUE JE REPROCHE AU PLAN.** Ma première rédaction annonçait *« ~17 sites, ≥ 3 écritures de la règle »*, en citant `_provFood` @1232 contre @1311 comme deux écritures non équivalentes. **Relu ligne à ligne avant de pousser : c'est faux.** @1311 ne pose pas la même question — elle interroge `_afRef` (l'état de l'écran), pas `_afSrc` (la provenance) — et son `===` strict y est **nécessaire** : `_afRef.u` vaut `''` dans l'état « portions », donc un `!u` permissif ferait tomber une portion dans la branche grammes. ⛔ **Le décompte mesuré** : la règle stricte est écrite **7 fois en 2 formes** (5 grammes seuls · 2 acceptant les portions) — *le « 6 » du plan était presque juste*. **Ce que le plan a raté, c'est la moitié PORTIONS** (`u==='portion'`, **9 lignes**, ajoutée en ft-v1183/1186 et jamais réintégrée à l'inventaire) : **16 décisions** sur l'unité au total. 👉 ***Un chiffre rond se vérifie ligne à ligne — surtout quand il sert à démontrer qu'un autre chiffre était faux.***

**⚠️⚠️ POURQUOI LE COMPTEUR S'EST TROMPÉ, ET ÇA RESSERVIRA** : `addFoodEntry` — **la porte la plus utilisée de l'écran** — construit ses macros en **raccourci ES6** : `{date:…, name:…, kcal, prot, carbs, fat, ts:…}`. Il n'y a **pas un seul `kcal:`** dans cette ligne, donc **aucun motif `kcal\s*:` ne peut la voir** — et il ne signale rien, puisqu'il trouve les autres. Même cause pour l'**export CSV** de `setup.js` (13 colonnes aux noms **français**, liste figée à part). 👉 ***Un motif qui suppose une syntaxe ne compte pas les endroits : il compte les endroits écrits comme on les imaginait.*** Nouvelle famille **`BUGS.md` §63** — sœur de §58 (*vérifier la fonction n'est pas vérifier l'appel*) et §61 (*un outil de mesure tronqué ressemble à un code sans défaut*) : **l'instrument fait partie de la mesure**.

**⭐ CE QUI EST DONC LIVRÉ : L'ÉTAPE 2 SEULE**, sur le seul périmètre **strictement vérifié**. Trois endroits retapaient `totaux × 100 / masse`, macro par macro, arrondi à la décimale — `_provFood` branche **grammes**, `_provFood` branche **portions**, `saveEditFood` quand la définition de portion change. Ils deviennent **`_per100Derive(vals, masse)`**.

**⛔ ET LA DUPLICATION AVAIT DÉJÀ COÛTÉ, SUR CES LIGNES-LÀ** : en **ft-v1188**, le passage de `Math.round` à `_per100d1` a dû être posé sur **deux** d'entre elles, après l'avoir été sur **7 autres portes** en ft-v1170 (§59, la porte jumelle). *La question n'était pas de savoir si la 3ᵉ copie serait oubliée, mais quand.*

**⛔⛔ `_per100SuitLaPortion` RESTE DEHORS, EXPRÈS — et c'est le point de conception de la version.** Elle porte **la même algèbre**, à 6 lignes du propriétaire : on est tenté de l'absorber. Mais elle **VÉRIFIE** (*« ce pour-100 g venait-il d'une portion ? »*, à 0,6 près), elle ne **DÉRIVE** pas. 👉 ***Ce qu'on factorise est l'INTENTION, jamais la ressemblance*** — deux fonctions qui calculent pareil ne font pas la même chose. Un témoin fige qu'elle est toujours là, avec sa tolérance.

**⭐ ELLE REND `null` QUAND ELLE NE SAIT PAS** (masse nulle, négative, illisible), et ce `null` n'est pas décoratif : c'est **lui** qui, dans `saveEditFood`, **efface** un pour-100 g devenu orphelin quand la personne retire le poids de sa portion (**R29** — un `null` ne se remplace jamais par un défaut).

**⭐ LE CRITÈRE ÉTAIT BINAIRE, ET IL EST ATTEINT** : l'instantané des **11 sondes** (`tools/instantane_1b23.js`, rejouable) est **identique octet pour octet** avant et après — **même sha256 `ace2a744dc89e6ec`**. ⭐ *Et il couvre aussi les sondes de 1b et 3, qui n'ont pas bougé non plus* : c'est la preuve que l'extraction n'a pas débordé.

**⚠️ UNE MUTATION A TUÉ MA SONDE AU LIEU DE LA FAIRE ROUGIR, ET C'EST §61 EN MINIATURE.** Le témoin des 4 macros écrivait `Object.keys(_per100Derive(…))` : avec le propriétaire muté pour rendre `null`, ça **lève**, l'`evaluate` entier est rejeté, et **le bloc disparaît de la passe sans qu'elle rougisse**. Rendu défensif (`un ? … : 'RIEN'`), la mutation fait désormais **7 rouges nommés**. *Un témoin qui MEURT ressemble à un témoin qui passe* — la raison est écrite à l'endroit exact.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun comportement ne bouge : trois copies d'une formule deviennent une (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **les étapes 1b et 3 ne sont PAS faites** — leur vrai périmètre attend l'arbitrage de Michel (écrit dans `docs/JOURNAL-DE-TEST.md`) · ⛔ ni le **hub** (étape 4) ni la **douane** (étape 5), qu'il a explicitement mis après · ⛔ `S.savedFoods` reste ouvert (décision produit) · ⛔ l'écart **48,3 vs 48** reste hors périmètre · ⛔ ni l'historique, ni les migrations, ni Milo, ni les séances. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1091**, `conclusion: success` à **08:02:02 UTC** sur `84125129`. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés). ⚠️ **Limite dite** : le proxy de ce conteneur refuse `github.io` (403), donc je ne peux pas lire le `sw.js` réellement servi — *le run est vert, l'app affichant ft-v1194 reste à confirmer par Michel.*

Tests : **parcours 3564/3564 sur l'arbre FINAL** (+15, bloc **CCXCI**) — ⭐ **et le total est le SEUL signal d'une passe tronquée : 3549 + 15 = 3564 attendus, 3564 obtenus** (§61, la leçon de ft-v1192 appliquée). **Calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées — **aucun trou nouveau** (les 2 connus, `badges` et `dayStateLog`, restent inchangés). ⛔ **CONTRÔLE NÉGATIF : 8 MUTATIONS, TOUTES MORDENT, chacune sur son témoin** — ① le propriétaire rend toujours `null` → **7 rouges** · ② le garde « pas de masse » retiré → **2**, exactement les deux témoins du `null` · ③ retour à `Math.round` (la régression ft-v1188 rejouée) → **7** · ④ site 1 nourri d'une mauvaise masse → **1**, exactement lui · ⑤ le garde `!p.per100` retiré → **1**, exactement le scan protégé (R32) · ⑥ le poids effacé n'efface plus → **1** · ⑦ la vérificatrice tolère tout → **2** · ⑧ une 2ᵉ copie de la formule réapparaît → **2**, exactement les deux compteurs de source.

Fichiers : `app.js`, `tests/parcours/runner.js`, `tools/instantane_1b23.js`, `sw.js`, `CLAUDE.md`, `BUGS.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/INVENTAIRE.md`. sw.js ft-v1194. |

**ft-v1193 — 🏗️ PHASE 0a + ÉTAPE 1a DU PLAN NUTRITION — UNE FUITE FERMÉE, UN CONSTRUCTEUR UNIQUE, ET UNE RÉGRESSION ATTRAPÉE PAR LE BANC** — Michel valide `docs/PLAN-NUTRITION.pdf` : ***« exécute la phase 0 puis l'étape 1a, avec les témoins et les critères écrits dans ce plan »***.

**⭐ PHASE 0a — LE POIDS DU PAQUET NE SE RENDAIT PAS.** Mesuré à la sonde (`tools/sonde_fuites_nutrition.js`, **rejouable**) : après un scan à **410 g**, reprendre un « Yaourt nature » par **Mes aliments sans fermer l'écran** laissait la pastille **« 📦 410 g (le paquet entier) »** affichée — *sur le yaourt*. ⛔ **Deux causes cumulées** : `_afOublierAliment` remettait à zéro `_bcNutr`, `_bcQtyPose`, `_bcCategories` et les grammes IA **mais pas `_bcPaquetG`** (nettoyé seulement dans `openAddFood`, donc jamais **entre** deux aliments d'une même ouverture), et la pastille n'est repeinte que par le **hub** — donc les 3 portes hors hub la laissaient telle quelle. 👉 ***C'est le défaut `_bcCategories` de ft-v1191, sur une autre variable*** (**R15**).

**⭐⭐ ÉTAPE 1a — UN SEUL CONSTRUCTEUR DE POUR-100 g.** Les **8** écritures `_bcNutr={…}` à la main et les **4** lignes `per100:{kcal:_bcNutr.kcal100,…}` **identiques au caractère près** deviennent `_ref100()` + `_per100De()`.

**⛔⛔ C'EST UNE EXTRACTION, PAS UNE UNIFORMISATION — et la nuance est tout le contrat.** **2 portes sur 8 n'arrondissent pas** (les reprises : « Mes aliments » et la recherche dans le journal, qui recopient un pour-100 g déjà stocké). Les faire traverser `_per100d1` **changerait une valeur enregistrée** : ce serait une **décision**, pas un rangement. D'où `{normaliser:false}` — *on extrait ce qui existe, on ne redresse rien au passage.*

**⭐ LE CRITÈRE ÉTAIT BINAIRE, ET IL EST ATTEINT** : un **instantané** de la sortie des 8 portes (`tools/instantane_ref100.js`) figé **avant**, rejoué **après** → **identique octet pour octet, même sha256** (`a8065e73…`). *Une passe verte prouve que ce que les témoins REGARDENT n'a pas bougé ; l'instantané prouve que RIEN n'a bougé.*

**⚠️⚠️ ET LE PLAN DISAIT « UN OBJET QUI PORTE LES DEUX FACES » — LA MESURE A DIT NON.** Poser `per100` **dans** `_bcNutr` aurait ajouté un champ à l'objet que l'instantané sérialise : le critère aurait été violé **par construction**, et on n'aurait plus pu distinguer *« rien n'a changé »* de *« tout a changé un peu »*. 👉 **Deux petites fonctions au lieu d'une maligne.** *Un critère qu'on est obligé d'assouplir pour faire passer son propre code n'est plus un critère.*

**⛔⛔⛔ ET LA PASSE COMPLÈTE A TROUVÉ UNE VRAIE RÉGRESSION DE MA PHASE 0a.** Les témoins **CCLXXII ⑧ et ⑨** (ft-v1174) sont devenus rouges : la ratatouille **trouvée mais sans valeurs** perdait son « 250 g » en partant au calibrage. 👉 ***`_bcPaquetTxt` n'était protégé que PAR ACCIDENT*** — parce que personne ne le nettoyait. *Un correctif juste peut casser ce qui ne tenait que par l'absence de ménage.* ⭐ **Et c'est le CONTRÔLE qui l'a attrapé, pas la relecture.**

**⚠️⚠️ MA PREMIÈRE RÉPONSE ÉTAIT FAUSSE, ET SA FORME VAUT PLUS QUE LE CORRECTIF.** J'ai recopié *« on prend, on oublie, on repose »* chez `_lookupBarcode`, puis chez `_calAppliquer` — **et le témoin est resté rouge**, parce qu'il existe une **TROISIÈME** porte sur ce chemin : `_bcSansValeurs`. 👉 ***R8, la porte jumelle, à l'intérieur même du correctif censé fermer une fuite — et pour la 3ᵉ fois dans la même heure.*** ⭐ **Un patron qu'on recopie à chaque porte EST la duplication que cette étape supprime ailleurs** : d'où un **paramètre nommé sur le propriétaire unique** (`{garderPaquet:true}`) pour les **2 appelants sur 13** qui poursuivent le **MÊME** aliment au lieu d'en changer. *Une distinction dite une fois, pas trois.*

**📣 PHASE 0b — MESURÉE, PAS CORRIGÉE (décision de Michel attendue).** `S.savedFoods` **se perd entre deux onglets** — mesuré, **avec un témoin de contrôle** : la même manœuvre sur `foodLog` (liste fusionnée) garde les deux entrées, `savedFoods` n'en garde qu'une. ⛔⛔ **Et le correctif évident est FAUX** : ajouter `savedFoods` à `_fusionListe` ferait une **union par nom**, donc **retirer une étoile dans un onglet serait annulé par la liste périmée de l'autre**. *Les 5 listes fusionnées sont des journaux qui ne font qu'AJOUTER ; les favoris se SUPPRIMENT.* Écrit dans `docs/JOURNAL-DE-TEST.md` avec sa raison (**R30**).

**⚠️ ET L'INSTANTANÉ A TROUVÉ UNE DIVERGENCE QUE PERSONNE NE CHERCHAIT** : sur **la même fiche**, le **scan** rend `48,3 kcal/100 g` et la **recherche par nom** rend `48`. Cause : `_afSuggKcal100` réécrit la formule de `_lookupBarcode` (`energy-kcal_100g || energy_100g/4.184`) **avec `Math.round`** au lieu de `_per100d1`. ⛔ **NON CORRIGÉ ICI, exprès** : corriger changerait une valeur enregistrée, donc ce n'est pas une extraction. 9ᵉ occurrence de la famille `BUGS.md` §59, écrite dans `docs/JOURNAL-DE-TEST.md`.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun bouton n'apparaît : une pastille cesse de mentir (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ l'historique · les migrations · la réécriture des 13 portes · le hub rendu obligatoire (étape 4) · la douane (étape 5) · ⛔ et **aucun changement de comportement** aux étapes 1-2-3, c'était le contrat. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

Tests : **parcours 3549/3549 sur l'arbre FINAL** (+14, bloc **CCXC**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⛔ **CONTRÔLE NÉGATIF : 8 MUTATIONS, TOUTES MORDENT** — ① `_ref100` rend `null` → **le runner MEURT** (elle mord au maximum) · ② `_per100d1` retiré · ③ `_per100De` rend un objet vide · ④ le poids du paquet n'est plus effacé → **3 rouges** · ⑤ la variable est propre mais **l'écran n'est pas repeint** → **2** · ⑥ `garderPaquet` ignoré → **2**, exactement les deux témoins de la ratatouille · ⑦ `{normaliser:false}` ignoré · ⑧ `maxNom` ignoré.

**⚠️⚠️ ET MON HARNAIS DE MUTATION M'A MENTI, AVEC LA MÊME FAMILLE QUE §61.** La mutation ① affichait **« 0 rouges »** — je l'ai lue comme *« elle ne mord pas »*. En regardant la sortie **complète** : le runner **plantait** (`TypeError` sur `null`), donc il n'affichait **rien**, et mon `grep -c "❌"` comptait 0 sur une sortie **vide**. 👉 ***Un harnais qui compte les rouges doit d'abord vérifier que le runner a FINI.*** Corrigé : il cherche la ligne de total et distingue *« 0 rouge »* de *« n'a pas tourné »*.

**⚠️ DEUX AUTRES PIÈGES D'OUTILLAGE, DITS PARCE QU'ILS RESSERVIRONT** : ① mon témoin « plus aucune traduction » comptait aussi **le commentaire qui CITE le motif supprimé** — *un témoin qui ne distingue pas le code de ce qui en PARLE finit par interdire d'écrire la documentation du correctif* ; ② `pgrep -f "node tests/parcours/runner.js"` **matche son propre shell** (le motif est dans sa ligne de commande) → boucle d'attente infinie sur une passe déjà terminée. C'est le piège de ft-v1189, repayé.

**⭐ ET UN TÉMOIN PLUS ANCIEN A FAIT SON TRAVAIL CONTRE MOI** : le contrôle *« les constructions de `_bcNutr` sont bien trouvées »* a rougi — parce que son voisin (*« aucune construction ne ré-arrondit »*) était passé **VERT sur une liste VIDE**. Sans lui, l'étape 1a aurait transformé une vraie garantie en vert décoratif, **en silence**. Réécrit sur le propriétaire unique ; la garantie ne s'affaiblit pas, elle se déplace.

Fichiers : `app.js`, `tests/parcours/runner.js`, `tools/instantane_ref100.js`, `tools/sonde_fuites_nutrition.js`, `sw.js`, `CLAUDE.md`, `BUGS.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1193. |

**ft-v1192 — 🅰️🅱️ L'ALTERNANCE SEMAINE A / SEMAINE B DANS LE SÉLECTEUR DE JOUR** — Michel, capture du sélecteur de son Powerbuilding (J3A « Semaine A » · J3B « Semaine B ») : ***« est-ce que la semaine A/B sont en charge ? »***, puis ***« À et b »***.

**⛔ MESURÉ AVANT DE CODER : NON, rien n'était géré.** `openDaySel` listait les jours **à plat**, sans aucune notion de variante — *c'est lui qui devait se souvenir où il en était.*

**⭐⭐ ET L'INFORMATION EXISTAIT DÉJÀ.** `getProgCurrentWeek(prog)` calcule la semaine en cours et s'affiche même en **« Semaine 2 / 4 »** sur la carte du programme. 👉 ***Elle ne descendait simplement pas jusqu'à la DÉCISION*** — **R4** en miniature : *une information qui reste dans un écran et n'atteint pas celui où l'on CHOISIT n'existe pas pour la personne.*

**⭐ CE QUI EST LIVRÉ** : le jour de la variante en cours porte un repère — *« 👉 ta semaine B (semaine 2 / 8) »*. Semaine 1 → **A**, 2 → **B**, 3 → **A**… (convention confirmée par Michel).

**⛔⛔ ON MET EN AVANT, ON NE CHOISIT PAS.** Le jour de l'autre variante reste **cliquable, au même endroit, avec la même apparence** : une semaine peut se décaler, on peut vouloir refaire la A (**R24** informer sans bloquer · **R29** on ne tranche pas à sa place). **Deux témoins figent cette garantie**, dont un qui **CHARGE vraiment** l'autre variante — et la mutation qui grise le bouton rougit exactement là.

**⚠️ LA LIMITE EST DITE PLUTÔT QUE CACHÉE** : l'app ne **sait** pas que « A » et « B » forment une paire, elle ne voit que des **libellés** — il faut le **deviner**. C'est acceptable ici parce que le **coût d'une erreur est faible** (un jour mis en avant à tort, on tape l'autre), et le garde-fou est l'**APPARIEMENT** : rien ne s'affiche tant qu'on n'a pas trouvé un **A et** un **B** portant **le même numéro de jour**. *Un « J3A » solitaire ne déclenche rien.*

**⛔⛔ ET CE QU'ON NE SAIT PAS, ON SE TAIT** : sans `startDate` ni `weeks`, `_varianteDeLaSemaine` rend `null`. ⚠️ *Le piège était juste à côté* — `getProgCurrentWeek` rend **1 par défaut** dans ce cas, et s'en servir afficherait *« ta semaine A »* **avec l'aplomb d'un calcul** alors que ce serait une valeur de repli. **Une fonction qui ne sait pas doit rendre `null`, et ce `null` ne se remplace jamais par un défaut** (**R29**).

**⚠️ LES LIBELLÉS DES TÉMOINS SONT RECOPIÉS DE SA CAPTURE, PAS INVENTÉS** — *une détection qui marche sur des libellés fabriqués ne prouve rien sur les siens.*

**📣 RÈGLE D'OR #11 — LE REPÈRE EST L'ANNONCE**, à l'écran au moment où ça sert. Aucune pop-up, aucun point rouge, rien à faire (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **ça ne charge rien tout seul** · ⛔ ça ne renomme ni ne réordonne aucun jour · ⛔ ça ne gère que **A/B**, pas A/B/C · ⛔ et un programme **sans numéro de jour** (« Haut du corps A ») n'est **pas** apparié — la base est le numéro, c'est écrit et assumé. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1081**, `conclusion: success` à **08:31:05 UTC** sur `0c5643cc`. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés).

**⚠️⚠️ ET MA PASSE COMPLÈTE ÉTAIT FAUSSE — ELLE S'EST ARRÊTÉE EN ROUTE SANS AUCUN ROUGE.** J'avais posé le bloc **après** `b.close()`, dans la zone des blocs qui **n'ouvrent pas de navigateur** (ils lisent les fichiers source avec `fs`). Il a demandé une page déjà fermée → *« Target page, context or browser has been closed »* → **toute la fin de la passe est tombée** : **56 témoins n'ont jamais tourné**, les 11 miens **et les 45 d'après**.
👉 ***Et elle affichait « 3479 ✅ · 0 ❌ ».*** **Aucun rouge.** *Un runner qui s'interrompt ne rougit pas : il ressemble trait pour trait à une passe verte.* ⛔ **Le TOTAL est la seule chose qui trahit une passe tronquée — et il ne se lit pas seul, il se COMPARE à la passe précédente** (3524 + 11 = **3535** attendus ; j'en avais **3479**). Bloc remis avant `b.close()`, **avec la raison écrite à l'endroit exact** pour que le prochain ne le repose pas là. C'est la même famille que le harnais coupé à `tail -4` en ft-v1187 : *un outil de mesure tronqué ressemble à un code sans défaut* — nouvelle famille **`BUGS.md` §61**.

Tests : **parcours 3535/3535 sur l'arbre FINAL** (+11, bloc **CCLXXXIX**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⛔ **CONTRÔLE NÉGATIF : 6 mutations, TOUTES MORDENT** — ① le repère non calculé → **3 rouges** · ② l'alternance figée sur A → **1**, exactement la semaine 2 · ③ on invente une semaine qu'on ne connaît pas → **2**, exactement les deux cas sans donnée · ④ l'appariement retiré → **1**, exactement le J3A solitaire · ⑤ le badge non affiché → **3** · ⑥ ⭐ **on BLOQUE l'autre variante** → **1 rouge**, exactement le témoin qui protège ce droit.

Fichiers : `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `BUGS.md`. sw.js ft-v1192. |

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
