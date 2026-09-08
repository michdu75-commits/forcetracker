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

> **Version actuelle : `ft-v1171`** (prochaine : `ft-v1172`). Historique complet (ft-v128→574 + gouvernance
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

**ft-v1171 — 🏷️ LA COLONNE « SOURCE » SE REMPLISSAIT SOUS UNE CASE DE TITRE VIDE — ET LE DÉFAUT A ÉTÉ TROUVÉ EN EXPLIQUANT À MICHEL OÙ LIRE LE RÉSULTAT** — il me dit *« la vérif iPhone […] j'ai pas compris »* et *« tes deux feuilles du Sheet dans une semaine, ça non plus je n'ai pas compris »*.

**⭐⭐ CE N'EST PAS UNE RELECTURE DE CODE QUI L'A TROUVÉ, C'EST LA RÉDACTION DE LA RÉPONSE.** En écrivant *« tu verras une colonne Source »*, j'ai eu un doute et je suis allé lire `handleLogCustomExercise_`.

**⛔⛔ CONFIRMÉ : les titres ne sont écrits qu'à la CRÉATION de la feuille** (`if (!sheet)`), or celle de Michel existe depuis **ft-v714**. Les lignes écrivent bien **9 valeurs** → la colonne **I** se remplissait de `perso` / `import` / `milo` **sous une case de titre VIDE**.

**👉 UNE COLONNE DE DONNÉES SANS SON TITRE NE SE LIT PAS : ELLE S'IGNORE.** Le détecteur de ft-v1167 aurait fonctionné **parfaitement** et **n'aurait servi à personne**. *C'est `BUGS.md` §48 — la porte de secours pas proposée là où le chemin s'arrête — transposé à la **LECTURE** du résultat : le mécanisme est juste, c'est ce qui l'entoure qui le rend inutile.*

**⭐ CORRECTIF MINUSCULE, ET SES DEUX REFUS COMPTENT AUTANT QUE LUI.** Une branche `else if` écrit **la seule case manquante** si elle ne dit pas déjà « Source ». ⛔ **On ne réécrit JAMAIS toute la ligne de titres** — elles appartiennent à la feuille de Michel, et *rien ne dit qu'il ne les a pas renommées* (**R29**). ⛔ **Et c'est idempotent** : une feuille déjà à jour n'est pas retouchée à chaque signalement.

**⭐ LA 2ᵉ FEUILLE (« Recherches sans résultat ») N'A PAS LE PIÈGE — vérifié, pas supposé** : elle n'existe pas encore, donc elle naîtra avec ses 7 titres. *Un témoin le fige quand même*, pour que le jour où on lui ajoute une colonne, la même réparation soit exigée.

**📣 RÈGLE D'OR #11 — RIEN.** La feuille est dans le Google Sheet de l'admin, personne d'autre ne la voit (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **ça ne remplit pas les feuilles** — elles ne parlent que quand des gens utilisent l'app, et *c'est justement ce que Michel n'avait pas compris* : elles sont vides aujourd'hui parce qu'il n'y a **rien eu à noter**, pas parce que c'est cassé. ⛔ Et **il n'y a toujours pas d'écran dans l'app** pour les lire (ft-v714 → ft-v715 a mis un an d'écart pour les exercices). ⚠️ **`Code.js` modifié → déploiement backend automatique, à vérifier des DEUX côtés** (**R18**).

Tests : **parcours PASSE/PASSE** (+6, bloc **CCLXIX**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐⭐ **LE TÉMOIN EXÉCUTE LA RÉPARATION, IL NE LA CHERCHE PAS DANS LE TEXTE** : la branche est **extraite de `Code.js` et rejouée** sur une fausse feuille Apps Script (trois cas — feuille ancienne à 8 titres, feuille déjà à jour, feuille inexistante). *Un `grep` dirait que la ligne existe, jamais qu'elle **répare*** — la leçon de ft-v1158, appliquée d'emblée cette fois. ⛔ **CONTRÔLE NÉGATIF : 5 mutations, toutes mordent, 4 sur UN SEUL témoin** — ① l'arbre d'avant → **1 rouge**, exactement le témoin qui porte la version · ② la réparation qui **réécrit toute la ligne** → **1 rouge**, exactement le garde **R29** · ③ la réparation **non idempotente** → **1 rouge**, le sien · ④ la **mauvaise colonne** (8 au lieu de 9) → **2 rouges**, *et c'est cohérent : écrire « Source » en 8 casse à la fois la réparation et l'intégrité des titres* · ⑤ la feuille **neuve** privée de sa colonne → **1 rouge**, exactement la non-régression. Fichiers : `Code.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1171. |

**ft-v1170 — 🔎 « TIRAGE VERTICAL » VISAIT L'ÉLASTIQUE — ET LA MESURE A DIT QUE LE RAPPROCHEUR N'ÉTAIT PAS EN CAUSE** — Michel : ***« vas-y lance la version pour tirage vertical »***.

**⭐⭐ MESURÉ AVANT DE TOUCHER À QUOI QUE CE SOIT, ET ÇA A CHANGÉ TOUT LE PÉRIMÈTRE.** `_matchExercise('Tirage vertical')` rendait **« Tirage Vertical Alterné ÉLASTIQUE » à 50 %**, via `mots`. ⛔ **Et il faisait son travail** : le catalogue ne contient **qu'UN SEUL** exercice portant « tirage vertical », et c'est l'élastique. Or en salle, *tirage vertical* = **lat pulldown** = « Tirage Poulie Haute ».

**👉 JE N'AI DONC PAS TOUCHÉ À `_matchExercise`** — le morceau risqué que j'avais annoncé la veille comme « le plus dangereux des trois » (il sert à Milo, l'import, la recherche et l'historique). ***On corrige la DONNÉE, pas le moteur.*** *La mesure a transformé une version risquée en quatre lignes de table.*

**⭐⭐ LE TROU EST SYSTÉMATIQUE ET CHIFFRÉ.** `_EX_EQUIV` porte **521 clés — 353 anglaises contre 55 françaises**, et **81 cibles du catalogue ne sont atteignables QUE par un mot anglais**. Les trois noms cassés de son programme le disent d'un coup : `lat pulldown` ✅ mais `tirage vertical` ⛔ · `leg press` ✅ mais `presse 45 degrés` ⛔ · `sdt` ✅ mais `sdt roumain` ⛔. ***La table connaît le terme anglais et pas son jumeau français*** — c'est **R8** appliqué au vocabulaire.

**⭐ ET PLUS FIN ENCORE** : `'tirage vertical POITRINE'` existait **déjà**. C'est la forme **NUE**, celle que les gens tapent, qui manquait. *Le concept était là, le mot non.*

**⭐ QUATRE CLÉS, ET SEULEMENT CELLES MESURÉES SUR UN VRAI DOCUMENT** (son PDF). Résultat : les quatre passent de **50 % ou 0 %** à **95 % en `auto`**, via *« équivalence connue »* — donc l'import les rattache **tout seul**.

**⚠️ LES DEUX FORMES DE LA PRESSE, parce que `_normEx` les rend DIFFÉREMMENT — mesuré, pas supposé** : « Presse 45° » **perd son °** et devient `presse 45`, tandis que « Presse 45 degrés » devient `presse 45 degres`. Une seule clé en raterait une. **Mutation P2 : 1 rouge, exactement le témoin de la forme longue.**

**⛔⛔ ON N'EN AJOUTE PAS 81, ET C'EST UNE DÉCISION.** Un synonyme **FAUX** redirige un exercice **en silence** et coupe un historique en deux — *bien pire qu'un synonyme manquant* (**R29**, le coût de l'erreur décide). ⚠️ Et mon comptage est à la **grosse maille** (une expression régulière) : *81 est un ordre de grandeur, pas une liste*. Le chiffre **et la méthode pour le reprendre proprement** sont écrits dans `IDEES-FUTURES.md` — *mesuré, pas deviné*.

**⛔⛔ ET LE CONTRE-TEST GAGNE SA PLACE** : *« soulevé de terre roumain »* écrit **en toutes lettres** tombait **DÉJÀ juste à 100 %**. Aucun synonyme n'a donc été ajouté pour lui — *un synonyme qui double un cas qui marche est du bruit, et il masquerait la mesure*. **Mutation P4** : l'ajouter fait rougir **exactement** ce contre-test.

**⭐ UNE DONNÉE, TROIS LECTEURS (R2)** : l'import, les séances de **Milo**, **et la recherche** (`filterEx` lit `_EX_EQUIV` depuis le 08/08) profitent de la même correction, sans une ligne de plus.

**⛔ UN TÉMOIN DE COHÉRENCE EN PLUS** : aucune des **525** clés ne doit viser un exercice inexistant. Le fichier documente déjà un cas de cible périmée (`leg curl`, rattrapé par `exNomActuel`) — *une table de 525 entrées pourrit en silence, sans erreur ni test rouge*. **Mesuré : 0 morte aujourd'hui**, donc il part d'un état propre et ne peut rougir que sur une **vraie** (condition de crédibilité, ft-v1145).

**📣 RÈGLE D'OR #11 — RIEN.** Une recherche qui rendait le mauvais exercice rend le bon : aucun écran ne change, aucun bouton n'apparaît, rien n'est à faire. **Même famille que ft-v1163** (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔⛔ **L'ORDRE de la recherche n'est PAS touché** — « tirage vertical » sort l'élastique en **1ᵉʳ** et la poulie haute en **2ᵉ**, parce que le nom de l'élastique contient littéralement ces deux mots. *Toucher à `_rang` changerait TOUTES les recherches, et **ft-v1163 documente une régression que j'avais moi-même créée en faisant exactement ça**.* Les deux sont visibles à une ligne d'écart, la personne choisit. ⛔ **Le programme déjà importé de Michel n'est pas réécrit** (**R29**) — mais taper « tirage vertical » dans le sélecteur trouve enfin la bonne fiche, donc le chemin ✎ → renommer → **Fusionner** (qui répare séances + records + programmes) devient praticable. ⛔ **Et *« Développé épaules guidé / haltères »* est laissé de côté EXPRÈS** : il désigne **deux** exercices (machine guidée **ou** haltères) — *si l'expert hésite, on n'ajoute pas* (**R29**).

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1007**, conclusion `success` à **06:24:39 UTC** sur `9f4cf957` — ⛔ ni backend ni worker attendus (`Code.js`/`worker.js` non touchés).

Tests : **parcours 3253/3253** (+11, bloc **CCLXVIII**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐⭐ **Les témoins comptent les VRAIS nombres, jamais « vide / pas vide »** — c'est la leçon de ft-v1163, où trois mutations sur quatre n'avaient pas mordu pour cette raison exacte : la non-régression de recherche est vérifiée sur ses **chiffres exacts** (*pec deck **2** · squat **43** · développé couché **8***). ⛔ **CONTRÔLE NÉGATIF : 5 mutations, toutes mordent, 4 chirurgicales** — ① l'arbre d'avant → **5 rouges**, exactement les témoins qui portent la version ; ② **une seule clé de presse au lieu de deux** → **1 rouge**, exactement la forme longue (*elle prouve que le double n'est pas du zèle*) ; ③ une clé visant un exercice **inexistant** → **2 rouges**, le témoin de cohérence **et** celui qui en dépend (*cohérent, je le dis, pas deux détections*) ; ④ **le synonyme redondant ajouté** → **1 rouge**, exactement le contre-test ; ⑤ la clé pointée vers **l'élastique** → **1 rouge** (*on vérifie la CIBLE, pas la présence d'une clé*). ⚠️ **ET UN PIÈGE D'OUTIL ATTRAPÉ EN CHEMIN** : les **backticks d'un message de commit passé en `-m`** sont interprétés par le shell — ma ligne *« perd son ° → `presse 45` »* est arrivée en *« perd son ° → . »*, **la valeur avalée sans erreur**, et le `push` a réussi juste après. *Encore une commande qui réussit en ayant supprimé quelque chose.* Corrigé, et les messages passent désormais par `git commit -F`. Fichiers : `log.js`, `tests/parcours/runner.js`, `IDEES-FUTURES.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1170. |

**ft-v1169 — 🔇 LES RECHERCHES QUI NE RENDENT RIEN — LE 2ᵉ POINT DE MESURE DU DÉTECTEUR** — Michel, dans la foulée de ft-v1167 : ***« prends aussi les recherches qui ne rendent rien »***.

**⭐ C'EST LA MÊME FAMILLE QUE ft-v1163** : *« biceps marteau »* rendait **zéro** alors que l'exercice s'appelle « Marteau » dans le groupe « Biceps » — les deux mots existaient, **pas ensemble**. 👉 ***Et ce bug-là non plus n'a été trouvé que parce que Michel l'a dit en passant.*** C'est exactement ce que ces deux versions cherchent à supprimer : *attendre qu'il tombe dessus*.

**⚠️⚠️ LE RISQUE DE CONCEPTION N'EST PAS CELUI D'HIER, ET C'EST LUI QUI DÉCIDE DE TOUT : UNE RECHERCHE SE TAPE LETTRE PAR LETTRE.** *« biceps marteau »* produit `b`, `bi`, `bic`, `bice`… qui rendent **tous** zéro à un moment. 👉 ***Signaler à chaque frappe noierait le signal sous ses propres préfixes*** — on mesurerait la **vitesse de frappe**, pas les mots qui manquent. D'où **l'anti-rebond** : rien ne part avant **1 200 ms sans frappe**, et seulement si la recherche est **encore** vide **et** que le champ porte **encore** ce terme.

**⛔ TROIS AUTRES GARDES, chacune pour une raison** : **3 caractères minimum** (en dessous, tout le monde tape les mêmes préfixes) · **40 maximum** (au-delà ce n'est plus un mot mais une phrase — et une phrase est bien plus susceptible d'être personnelle) · **dédoublonnage local** par `terme|genre`, comme `_reportCustomEx` (**R13**).

**⛔⛔ ET LA VIE PRIVÉE EST LE 2ᵉ SUJET, PARCE QU'UNE BARRE DE RECHERCHE EST DU TEXTE LIBRE.** Un nom d'exercice écrit par Milo décrit **le monde** ; ce que quelqu'un tape peut être *« gâteau anniversaire Léa »*. 👉 **Le serveur n'écrit le terme EN CLAIR qu'à partir de TROIS identifiants anonymes distincts** ; en dessous, la ligne ne porte qu'une **empreinte** (SHA-256 tronquée) et un compteur. *Un mot tapé par trois personnes sans lien cesse d'être identifiant — et c'est exactement le seuil à partir duquel il vaut la peine d'être traité.* **Un seul seuil, deux métiers : l'anonymat ET la pertinence.** ⭐ La ligne est **rétro-remplie** au 3ᵉ : *on ne perd pas les deux premières occurrences, on ne les nommait pas.*

**⚠️ ET LA LIMITE EST ÉCRITE PLUTÔT QUE SUR-VENDUE** : le serveur **reçoit** le terme à chaque appel, il ne le **conserve** qu'au 3ᵉ. C'est le motif k-anonyme standard, et le dire vaut mieux que laisser croire à autre chose.

**⭐ LES DEUX RECHERCHES, ET CHACUNE A UN POINT UNIQUE** : `filterEx` (log.js) là où `_html` est vide **après tous les élargissements** — familles, synonymes, anglais, anciens noms, et le repli à deux mots de ft-v1163 ; et `_afSuggRendu` (app.js) là où **les quatre sources** sont vides (son journal · CIQUAL · les marques · Open Food Facts). *Si même après tout ça il n'y a rien, le mot mérite d'être compté.*

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun comportement ne bouge : **on compte, on ne répare pas**. L'onglet est admin (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **ça ne corrige aucune recherche** — savoir que *« naan »* manque ne le fait pas apparaître. ⛔ **Aucun écran dans l'app pour le lire** : la feuille se lit dans le Google Sheet, comme les exercices manquants de ft-v714 à ft-v715. ⛔ Et **il faut de l'usage avant que ça parle** : à une seule personne, tout reste en empreintes. ⚠️ **`Code.js` modifié → déploiement backend automatique, à vérifier des DEUX côtés** (**R18**).

✅ **DÉPLOIEMENTS VÉRIFIÉS VERTS DES DEUX CÔTÉS** (R18) : **site run #1003** success et **backend Apps Script run #113** success, à **21:49:37 UTC** — ⛔ aucun worker attendu (`worker.js` non touché).

Tests : **parcours 3223/3223** (+13, bloc **CCLXVII**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐⭐ **Les témoins SIMULENT LA FRAPPE** — quatre préfixes tapés l'un après l'autre dans le vrai champ, `fetch` intercepté (l'envoi est `no-cors` fire-and-forget, donc *la seule façon de voir ce qui part est de le capter*). ⛔⛔ **CONTRÔLE NÉGATIF : 8 MUTATIONS** — ① l'arbre d'avant → **2 rouges** · ② ⭐⭐ **l'anti-rebond neutralisé (pause à 0) → 3 rouges**, dont **le témoin phare** · ③ la re-vérification du champ retirée → **1** · ④ la longueur minimale → **2** · ⑤ la maximale → **1** · ⑥ la jumelle aliments non posée → **1** · ⑦ le terme écrit en clair dès la 1ʳᵉ fois → **1**, exactement la garantie de vie privée · ⑧ le seuil compté en occurrences au lieu d'identifiants → **1**. ⚠️⚠️ **ET LE CONTRÔLE NÉGATIF A TROUVÉ TROIS DÉFAUTS DE MÉTHODE, TOUS À MOI.** ⓐ **Mon témoin phare était VERT POUR LA MAUVAISE RAISON** : mes préfixes étaient `bic`/`bice`/`bicep`, qui **trouvent des résultats** (le groupe « Biceps ») — donc un seul envoi partait de toute façon et la mutation ne mordait pas. *Un témoin qui ne peut pas rougir ne mesure rien, il rassure.* Remplacés par des préfixes qui rendent **réellement** zéro à chaque étape. ⓑ **Ma mutation ② était mauvaise** : ma substitution laissait `}, _RECH_PAUSE);`, ce qui transformait l'appel en **expression virgule** — l'envoi ne partait **jamais**, donc elle cassait large au lieu de viser l'anti-rebond. *Une mutation qui casse tout ne prouve pas la garantie visée.* Refaite en mettant la pause à **0**. ⓒ **Et mes tests de longueur mesuraient le mauvais garde-fou** : appelée à vide, la fonction sortait sur la **re-vérification du champ** avant même d'atteindre la garde de longueur. ⚠️ **Enfin un témoin est resté rouge une passe alors que la PRODUCTION marchait** (vérifié à la sonde avant de toucher au test) : `_afSuggInput` a **son propre** anti-rebond, donc il rappelle le rendu plus tard et **réarme** notre minuteur — le délai réel est « leur pause + la nôtre ». *Un test qui code en dur un délai mesure la machine, pas le comportement* : il sonde désormais jusqu'à l'événement. Fichiers : `log.js`, `app.js`, `Code.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `BUGS.md`. sw.js ft-v1169. |
**ft-v1168 — 🏃 LE CARDIO D'UN PROGRAMME PART DANS SON BLOC, ET LE FILET DE DATE PASSE CÔTÉ APP — parce que les DEUX correctifs du matin étaient côté serveur** — Michel, sur son programme réel : *« c'est quoi ce bordel de date, je l'ai mis ce matin »*, puis ***« euh oui mais on est pas en mars lol on est en septembre »***. Et sur sa capture : **« Cardio léger »** affiché comme un **exercice** — 1 série × 10 reps × 120 s de repos, **avec une figurine de JAMBES** — alors que sa note dit *« Échauffement général - 8 minutes »*.

**⭐⭐ MESURÉ, PDF EN MAIN (lu hors dépôt, jamais commité) : 336 lignes, ZÉRO date** — ni mois, ni année, ni format. Le « 23 mars » venait de **l'exemple du prompt serveur**, corrigé **deux fois** le matin même (l'exemple vidé **et** un garde-fou). Et il l'avait quand même.

**⛔⛔ POURQUOI, ET C'EST TOUT LE SUJET : LES DEUX CORRECTIFS VIVENT CÔTÉ SERVEUR, DONC LEUR EFFET DÉPEND DE *QUAND* ON IMPORTE.** Son import précède le déploiement — **run #109, 12 étapes vertes, 08:18 UTC**, c'est-à-dire **10h18 chez lui** (⚠️ *et j'ai passé une heure à lui répéter « 08:18 » comme si c'était son heure* — la famille « fuseaux horaires » de `BUGS.md`, appliquée à moi-même). Vérifié **deux fois** : par les logs du run **et** par l'ancêtre git du commit. 👉 C'est **`BUGS.md` §46** — *un correctif qu'on ne peut pas vérifier là où il s'applique n'en est pas un* — **2ᵉ fois de la journée**.

**⭐ TROIS PIÈCES, UN SEUL THÈME : *l'import ne fabrique plus de fausses données, et l'app rattrape ce qu'il a déjà fabriqué*.**

**① `_dateImportValide` — l'app applique elle-même le critère du serveur.** *Un cycle déjà terminé le jour de l'import n'est pas une date*, quel que soit le backend qui répond, quel que soit le cache du téléphone. ⛔ **On efface la DATE seulement, jamais `weeks`** : la durée vient du document et reste vraie. ⛔⛔ **Et une date passée dont le cycle COURT ENCORE est ACCEPTÉE** — quelqu'un qui importe un bloc commencé il y a deux semaines a **raison** de le dater ainsi. **Mesuré à la mutation N3** : un garde-fou qui refuserait *« toute date passée »* fait **2 rouges** et lui effacerait une information **vraie** (**R29**).

**② UNE LIGNE DE CARDIO N'EST PLUS UN EXERCICE — et ZÉRO détecteur n'a été écrit.** C'est le trou nommé en **ft-v1156** (*« manque de MODÈLE »*) et jamais comblé. ⭐⭐ **`_extraireCardioMilo` existe depuis ft-v1147/1150** — mesuré sur **20 formulations sur 20**, avec ses trois gardes (aucune charge · une durée réellement lisible · le nom n'est pas un exercice du catalogue). **On l'APPELLE depuis un nouvel endroit** (**R13/R2**). Un jour de programme gagne `cardioAvant`/`cardio`, comme une séance. ⭐ **Et « Cardio léger » n'entre plus dans son CATALOGUE** comme exercice perso.

**③ ⭐⭐ LE RATTRAPAGE SE FAIT AU CHARGEMENT, PAS PAR RÉÉCRITURE — et c'est la décision qui compte, elle vient de lui : *« si je remets mon programme je repars à 0 c'est n'importe quoi »*.** **Aucune donnée enregistrée n'est touchée** (**R29**) : un programme importé **avant** cette version est réparé au moment où on le **charge** — sans réimportation, sans bouton, sans migration. **Un témoin vérifie que le stockage est INTACT après chargement**, parce que c'était sa condition.

**⛔ LES DEUX PORTES (R8)** : `_loadProgDayVraiment` (multi-jours) **et** `_loadProgVraiment` (un seul jour). Le poser d'un seul côté aurait été **la 6ᵉ fois de la journée**.

**⛔⛔ ET ON NE RETOUCHE PAS L'AFFICHAGE DES PROGRAMMES ENREGISTRÉS, exprès (R30).** Une date de cycle passée peut être **VRAIE** — un bloc réellement terminé. *Après coup, rien ne distingue une date inventée d'une date vécue.* On n'efface donc pas une information peut-être exacte : la date de son programme actuel reste à corriger **à la main** (✏️ → CYCLE), et c'est **lui** qui tranche.

**📣 RÈGLE D'OR #11 — POINTS 2 À 5, PAS DE POP-UP.** Point rouge `NEW_FEATURES` sur l'écran **Séance** (c'est là que le bloc Cardio apparaît quand on charge un programme) · aide **?** · **aide détaillée** · **diapo du Guide**. ⭐ Les quatre disent **AUSSI les deux limites**, qui se devinent encore moins que la fonctionnalité : *un cardio au MILIEU reste un exercice* · *un exercice qui porte une CHARGE n'est jamais déplacé*. ⛔ Pas de pop-up : rien n'est à faire, aucun repère n'a bougé (**R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **le rapprochement de noms n'est PAS pris ici** — *« Tirage vertical »* → *« Tirage Vertical Alterné **Élastique** »* à **50 %** (mesuré), et *« Développé épaules guidé / haltères »* → *« Développé Épaules Machine »* à **67 %**. Michel l'a demandé, et je le ferai : mais `_matchExercise` sert **PARTOUT** (Milo, import, recherche, historique), c'est le morceau le plus risqué. *Une chose à la fois, testée avant de continuer* (**règle d'or #7**) → version suivante, séparée. ⛔ Un cardio au **milieu** reste un exercice (décision ft-v995, non rouverte). ⚠️ **Michel doit vérifier sur Safari/iPhone.**

**⛔⛔⛔ ET LA VRAIE LEÇON DE CETTE VERSION EST UNE ERREUR À MOI, QUE SEULE LA PASSE COMPLÈTE A VUE : J'AI ÉTEINT UN GARDE-FOU EXISTANT, EN SILENCE.** J'avais nommé mon filet `_dateImportValide`. ⛔ **Ce nom existait déjà dans `state.js`** (ft-v1095) et refusait les dates absurdes dans l'import d'**historique**. Or `log.js` charge **APRÈS** `state.js` → **ma déclaration a écrasé la sienne dans le même espace global**. ⭐⭐ **Mesuré** : `1900-01-01` et `2099-01-01` étaient **redevenues importables**. *Une collision de noms entre deux fichiers servis ne lève RIEN : le dernier chargé gagne, sans erreur, sans avertissement.* 👉 **Renommée `_dateProgValide`** — et **elles ne fusionnent pas** : l'une juge une date de **SÉANCE** (donc refuse le futur), l'autre une date de **DÉBUT DE PROGRAMME**, et un programme peut commencer lundi prochain. *Deux questions, deux noms* (**R2**).

**⭐⭐ ET CE QUI EN SORT VAUT PLUS QUE LE CORRECTIF : le CONTRÔLE 16 de `tools/check_regles.py`.** Il refait la même détection **en une seconde**, à chaque livraison, au lieu de 16 minutes de passe. ⭐ **Mesuré en l'écrivant : 1 532 fonctions de premier niveau, 0 collision** — il part d'un état propre, donc il ne peut rougir que sur une **vraie**, jamais sur du bruit hérité (c'est la condition pour qu'un détecteur reste crédible — ft-v1145). **Éprouvé en remettant la collision : il rougit exactement dessus.**

**⚠️⚠️ ET UN TÉMOIN A ÉTÉ RETOURNÉ, PAS ASSOUPLI (R30).** Celui de **ft-v1153** figeait une décision de Michel : *« sur un programme, le cardio NE sort PAS de la liste »* — *« dans un programme, la personne a écrit sa propre liste »*. **Il a changé d'avis le 07/09, en connaissance de cause**, capture à l'appui. *Ce n'est pas un témoin qu'on adoucit pour faire passer du code : c'est la RÈGLE qu'il figeait qui a changé, et on écrit laquelle, par qui et quand.* ⛔ **La moitié qui survit est dite juste à côté** : les **charges** d'un programme ne bougent toujours pas, et un cardio **au milieu** reste un exercice.

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1001**, conclusion `success` à **21:34:16 UTC** sur `0a98689f` — ⛔ ni backend ni worker attendus (`Code.js`/`worker.js` non touchés).

Tests : **parcours 3229/3229** (+19, bloc **CCLXVI**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐⭐ **Témoins FONCTIONNELS** : `finalImportProg` et les **deux** chargeurs sont réellement appelés, et on lit ce qui **sort**. ⛔⛔ **Le contrôle qui porte tout le reste** : les DEUX chargeurs doivent **APPELER** le rattrapage — *une extraction parfaite que personne n'appelle laisserait tous les autres témoins verts pendant que l'écran afficherait encore un faux exercice* (leçon de ft-v1158, rejouée exprès). ⛔ **CONTRÔLE NÉGATIF : 6 mutations** — ① l'arbre d'avant → **11 rouges** ; ② le rattrapage sur **une seule porte** → **2 rouges**, exactement la jumelle et son contrôle ; ③ le filet de date **trop large** (toute date passée refusée) → **2 rouges**, dont le contre-test — *la plus utile, elle prouve que ce contre-test gagne sa place* ; ④ le rattrapage qui **réécrit** le stockage → **1 rouge**, exactement la décision de Michel ; ⑤ le cardio non exclu de la création → **1 rouge** ; ⑥ la sonde qui passe l'objet **brut** → **1 rouge**, le piège. ⚠️⚠️ **ET LA LEÇON DE MÉTHODE EST LÀ : LA MUTATION ⑥ N'A PAS MORDU — DEUX FOIS DE SUITE.** Ma 1ʳᵉ fixture avait `kg:0` (le garde « aucune charge » n'avait rien à voir), ma 2ᵉ ne nommait **aucune machine cardio** (la voie 2 ne se déclenchait pas). Il a fallu le **vrai** cas — un exercice **chargé**, hors catalogue, dont la **note** nomme un vélo — pour que le témoin puisse rougir. 👉 ***Une mutation qui ne mord pas ne prouve pas que le code est sûr : elle prouve qu'il manque un témoin.*** Fichiers : `log.js`, `constants.js`, `screens.js`, `coach.js`, `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `BUGS.md`. sw.js ft-v1168. |

**ft-v1167 — 🔎 LE DÉTECTEUR DE NOMS : ARRÊTER D'ATTENDRE QUE MICHEL TOMBE DESSUS** — après avoir posé le principe *« tout sauvegarder et accessible du moment que ce n'est pas des données personnelles »*, il tranche : ***« vas-y prends le détecteur de noms »***.

**⭐⭐ CE QUI LE JUSTIFIE EST UNE MESURE, PAS UNE INTUITION : CINQ VERSIONS EN UNE SEMAINE ONT EU EXACTEMENT LA MÊME CAUSE** — *un nom n'a pas retrouvé sa donnée* : **ft-v1147** (le cardio) · **ft-v1148** (les doublons) · **ft-v1156** (l'import suffixait les noms en « (ECH) ») · **ft-v1160** (le contrôle d'intensité muet faute de record) · **ft-v1163** (la recherche à deux mots). 👉 ***Les cinq ont été trouvées par hasard ou par Michel. Aucune par une mesure.***

**⛔⛔ ET LE SIGNAL EXISTAIT DÉJÀ À MOITIÉ — c'est le plus instructif.** `_reportCustomEx` est appelée depuis **trois** endroits : la personne qui crée un exercice **exprès**, et les **deux** chemins d'import quand un nom lu dans un document ne correspond à rien. **Les trois écrivaient la MÊME ligne**, sans dire d'où elle venait.

**👉 OR UN NOM SIGNALÉ PAR UN IMPORT OU PAR MILO N'EST PAS UNE DEMANDE D'EXERCICE : C'EST UN BUG.** Quelqu'un qui tape *« Développé Michel »* veut un exercice de plus ; *« Développé couché (ECH) »* écrit **quatre fois** par un import veut dire que la chaîne est cassée. ***Même ligne, sens opposés*** — et c'est exactement pour ça que ft-v1156 est resté invisible jusqu'à ce que Michel envoie une capture.

**⛔ ET LE CHEMIN DE MILO NE SIGNALAIT RIEN DU TOUT.** `_nomMiloVersCatalogue` rend le nom **brut** quand elle ne reconnaît rien, **en silence**. *Le seul endroit du code qui SAIT que le nom n'a pas été reconnu était aussi le seul à ne rien en dire* — donc la famille de bugs la plus coûteuse du moment n'avait **aucun compteur**.

**⭐ R13 — ON N'INVENTE RIEN, IL MANQUAIT UN CHAMP.** Le mécanisme des « exercices manquants » est éprouvé depuis ft-v714 : dédoublonnage **local** · envoi **`no-cors` fire-and-forget** (donc jamais bloquant — règle d'or #3) · **`anonId` seul** · agrégation dans un onglet du Sheet avec un compteur de signalements. Les **quatre** appelants portent désormais leur **source** (`perso` · `import` · `milo`), et le Sheet gagne une colonne **Source** qui **s'accumule** au lieu de s'écraser — *un même nom peut être créé à la main PUIS écrit par Milo, et écraser la source ferait disparaître la moitié du signal*.

**⚠️ LE DÉDOUBLONNAGE PASSE À `nom|source`, ET C'EST STRUCTURANT** : sur le nom seul, **le premier chemin qui signale empêche les autres** — on ne saurait jamais que Milo écrit aussi ce nom-là. *Un dédoublonnage trop large ne réduit pas le bruit, il efface le signal.* ⛔ Conséquence assumée et écrite : les noms déjà signalés repartent **une fois** chacun ; le serveur agrège, donc c'est sans dommage.

**⛔ RIEN DE PERSONNEL NE PART, et c'est le critère de Michel lui-même** : un nom d'exercice décrit **le monde**, pas la personne. Ni e-mail, ni date de séance, ni charge. *C'est la même frontière que celle du cervelet : « est-ce que ça a besoin de savoir QUI est la personne ? »*

**⚠️⚠️ ET MON PROPRE TÉMOIN A TROUVÉ QUE J'AVAIS REPRODUIT DANS LE DÉTECTEUR LA FAUTE QU'IL EST CENSÉ DÉTECTER.** Mon premier jet comparait `exId(exNomCatalogue(nom))` **sans normaliser** — donc *« Developpe Couche »* sans accents ressortait **INCONNU** alors que l'exercice existe. C'est **exactement** le défaut corrigé par ft-v1160 **dix lignes plus haut**, dont le commentaire le dit noir sur blanc : *« la normalisation est indispensable, le résolveur NE SUFFIT PAS »*. 👉 ***Et pour un détecteur c'est la pire des fautes*** : il aurait crié sur des noms parfaitement valides, et on aurait appris à l'ignorer (la panne de ft-v1145). Corrigé en réemployant `_memeExercice`, le **propriétaire unique** — *on n'en écrit pas un second* (**R2**).

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun bouton n'apparaît, aucun comportement ne bouge : **on compte, on ne répare pas**. L'onglet est admin (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **ça ne corrige aucun nom** — le détecteur est muet pour l'utilisateur et rend exactement ce que l'app rendait avant (témoin de non-régression dédié). ⛔ **Ça ne couvre pas les RECHERCHES qui ne rendent rien** (le cas ft-v1163) : c'est la même famille, mais un autre point de mesure — *noté, pas pris*. ⛔ **Et il n'y a pas encore d'écran dans l'app pour le lire** : la colonne se lit dans le Google Sheet, comme les exercices manquants l'ont fait de ft-v714 à ft-v715. ⚠️ **`Code.js` modifié → déploiement backend automatique, à vérifier des DEUX côtés** (**R18**).

✅ **DÉPLOIEMENTS VÉRIFIÉS VERTS DES DEUX CÔTÉS** (R18) : **site run #998** success, et **backend Apps Script run #112** success — *« le backend répond VRAIMENT »* et *« authStatus »* verts à **17:39:23 UTC**. ⛔ Aucun worker attendu (`worker.js` non touché).

Tests : **parcours 3186/3186** (+15, bloc **CCLXV**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐⭐ **Les témoins INTERCEPTENT `fetch`** : l'envoi est `no-cors` fire-and-forget, donc *la seule façon de vérifier ce qui part est de le capter* — un `grep` dirait que la ligne existe, jamais que le corps porte la bonne source. Et le dernier témoin traverse `_normalizeMiloSession`, **la vraie fonction de production**. ⛔⛔ **CONTRÔLE NÉGATIF PAR MUTATIONS, 8 VARIANTES, et SIX mordent sur UN SEUL témoin chacune** : ① le chemin de Milo remis muet → **2 rouges** · ② ⭐⭐ **ma faute du premier jet (pas de normalisation) → 1 rouge**, exactement l'alias sans accents — *c'est la mutation qui compte, elle prouve que le témoin qui m'a attrapé garde sa place* · ③ le dédoublonnage revenu au nom seul → **2 rouges** · ④ un exercice perso signalé comme un défaut → **1** · ⑤ en cas de doute on crie au lieu de se taire → **1** · ⑥ une source libre transmise telle quelle → **1** · ⑦ le serveur qui accepte n'importe quelle source → **1** · ⑧ les sources qui s'écrasent → **1**. Fichiers : `log.js`, `Code.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `BUGS.md`. sw.js ft-v1167. |
**ft-v1166 — ⚠️ L'APERÇU D'IMPORT DIT ENFIN CE QU'IL VA INVENTER — ET LE DÉCLENCHEUR N'EST PAS UN BUG, C'EST UNE PHRASE DE MICHEL** — après lui avoir expliqué comment réparer son programme à la main : ***« ouais ok mais ça m'arrive à MOI, si ça arrive à d'autres personnes je fais comment moi ? Je passe pour un mec qui a créé une application à l'arrache »***.

**⭐⭐ IL A RAISON, ET C'EST LE VRAI SUJET.** Lui savait qu'un **✎ violet caché** dans le sélecteur permet de fusionner un exercice inventé dans sa vraie fiche. *Personne d'autre ne le sait — et personne n'ira le chercher.*

**⭐⭐ MESURÉ SUR SES 13 NOMS RÉELS, en exécutant `_matchExercise` dans la page, pas de mémoire** : **8 reconnus tout seuls** (`auto`) · **2 proposés** (`confirm`) · et **3 en `new`** — *Presse 45 degrés · SDT roumain · Biceps marteau* — **créés sans un mot**.

**⛔⛔ LE DÉFAUT N'EST DONC PAS LE RATTACHEMENT, C'EST LE SILENCE — et il se lit dans une seule fonction.** Dans `_renderImpConfirm`, un exercice `auto` affiche *« ↔ reconnu depuis X »* en vert, un `confirm` affiche sa ligne de choix… et un `new` **n'affiche RIEN**. 👉 ***Reconnu et inventé se ressemblaient EXACTEMENT à l'écran.*** Le seul signal était un `toast` **APRÈS** l'import, qui disparaît. *L'app décidait, puis elle informait* — **R29 à l'envers**, dont le corollaire dit précisément *« informer sans décider »*.

**⛔ ET UN EXERCICE INVENTÉ N'A NI PHOTO, NI FIGURINE, NI HISTORIQUE** : c'est le *« aucun repère dans ton historique »* qu'il a lu **en salle**, sur une presse où il avait fait **280 kg le 4 septembre**.

**⭐ CORRECTIF EN TROIS TEMPS, ET LE PREMIER EST LE MOINS VISIBLE.** ① **R2 — un seul propriétaire de la question *« cet exercice sera-t-il créé ? »***. Elle était calculée **EN DOUBLE** avec **deux comparaisons différentes** (`allEx.includes` côté programme, un `Set` côté historique), et l'aperçu ne la posait **nulle part**. `_exerciceInconnu` est extraite, et les deux créations l'appellent : *l'aperçu lit exactement ce que la création lira* — **un avertissement qui annonce autre chose que ce qui se produit serait pire que pas d'avertissement**. ⭐ Au passage la divergence tombe : côté programme, un nom **VIDE** fabriquait un exercice perso sans nom. ② L'aperçu **marque en orange**, avec un **bandeau qui donne le compte** et un bouton **« 🔗 Rattacher »** ouvrant le sélecteur (**6ᵉ mode `imp`** de `_exPickerMode` — motif établi, cinq modes existaient déjà : **R13**). ③ **LES DEUX IMPORTS**, programme **et** historique.

**⛔⛔ LE ③ N'EST PAS DU ZÈLE : `_renderHistPreview` PORTAIT LE DÉFAUT À L'IDENTIQUE — ET SANS MÊME LE TOAST** que l'import de programme affichait. Le poser d'un seul côté aurait été **la 5ᵉ fois de la journée** (ft-v1160 · ft-v1161 · ft-v1163 · ft-v1164) : *un correctif sur une porte et pas sur sa jumelle*.

**⭐⭐ ET LA MESURE A IMPOSÉ UNE RÈGLE QUE JE N'AVAIS PAS PRÉVUE : ON RATTACHE TOUTES LES LIGNES QUI PORTENT CE NOM.** Ma première version ne touchait que la ligne tapée. Or `finalImportProg` **dédoublonne par nom** avant de créer : rattacher *« Presse 45 degrés »* au J1 sans toucher au J2 produisait un programme où **le MÊME exercice existe sous DEUX noms** — le J1 sur la fiche du catalogue avec son historique, le J2 sur un exercice inventé. 👉 ***Un demi-rattachement est PIRE que pas de rattachement : il coupe l'historique en deux au lieu de le laisser d'un seul côté.*** ⭐ Et c'est bien ce que la personne dit : elle ne corrige pas *une ligne*, elle dit *« ce nom désigne cet exercice-là »*. ⛔ On l'applique dans **CE document** et nulle part ailleurs — ni ses séances, ni ses programmes déjà enregistrés (**R29**).

**⭐ ZÉRO MÉCANISME D'ANNULATION ÉCRIT** : le rattachement manuel pose `_vmFrom` **exactement comme** le rattachement automatique, donc la ligne verte *« ↔ reconnu depuis X · annuler »* et `impUndoMatch`/`histUndoMatch` marchent **sans une ligne de plus** (**R13**).

**📣 RÈGLE D'OR #11 — POINTS 2 À 5, PAS DE POP-UP.** Point rouge `NEW_FEATURES` sur l'écran **Séance** (c'est de là qu'on lance un import — la marque orange, elle, ne se voit qu'une fois l'aperçu ouvert) · aide **?** de l'onglet · **aide détaillée** · **diapo du Guide**. ⛔ **Pas de pop-up** : rien n'est à faire tant qu'on n'importe pas, aucun repère n'a bougé, aucune donnée ne change (**R25**). ⭐ Les quatre textes disent **ce que ça coûte** (*ni photo, ni figurine, ni historique*), pas seulement que le bouton existe — *sans l'enjeu, le bouton n'a pas de raison d'être tapé*.

**⚠️⚠️ LA LEÇON DE MÉTHODE EST À MOI, ET C'EST LE CONTRÔLE NÉGATIF QUI L'A TROUVÉE.** J'avais lu `.overlay{z-index:200}` (style.css l. 749), constaté que `#mod-ex` est déclaré **AVANT** les aperçus dans le DOM (2122 contre 2348 et 2665), et conclu à un piège : *le sélecteur s'ouvrirait DERRIÈRE, on taperait « Rattacher » et il ne se passerait rien*. J'ai donc posé un `style.zIndex='260'`. ⛔⛔ **La mutation qui le retirait n'a fait rougir PERSONNE** — et pour cause : **`#mod-ex{z-index:300;}` existe déjà, ligne 770 du MÊME fichier**, posé exactement pour ça. ***Mon « correctif » DESCENDAIT le sélecteur de 300 à 260*** — ça marchait encore (260 > 200), donc **rien ne l'aurait jamais signalé**. 👉 *C'est **R28** appliqué à moi-même : une règle générale lue sans chercher la règle **plus spécifique** qui la surcharge.* Code retiré ; le témoin de plan **reste mais change de nature** — il ne détecte plus mon changement, il **fige la règle CSS**, et je l'écris dans son libellé (`GARDE (pas détecteur)`).

**⚠️ ET UN 2ᵉ TÉMOIN A ROUGI SUR MON PROPRE COMMENTAIRE — 7ᵉ fois de cette famille.** Il cherchait `allEx.includes(` dans la source des deux fonctions pour prouver que l'ancienne comparaison avait disparu ; la chaîne **survit dans le commentaire qui explique le défaut réparé**. *Chercher un TEXTE n'est pas vérifier un COMPORTEMENT.* Remplacé par un témoin **de comportement** : un nom **vide** ne doit plus fabriquer d'exercice — c'est justement la divergence entre les deux anciennes comparaisons.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **les programmes DÉJÀ importés ne sont pas réparés** — il faut réimporter, ou fusionner à la main (**R29**). ⛔ **On ne BLOQUE pas l'import** : un exercice réellement inconnu a le droit d'exister (**R24**), et **on ne force aucun rattachement** (**R29** — remplacer un exercice par un autre coûte plus cher que d'en créer un ; c'est la même raison qui interdit *« uniquement ces noms »* dans le prompt de ft-v1164). ⛔ **Le trou CARDIO** d'un jour de programme reste. ⛔ **Et aucun chemin ne permet toujours de SUPPRIMER un exercice perso** — mesuré, noté, hors périmètre. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #996**, job `deploy` success, **5 étapes vertes** à **17:21:21 UTC** sur `cf4a7274` — ⛔ ni backend ni worker attendus (`Code.js`/`worker.js` non touchés).

Tests : **parcours 3195/3195 sur l'arbre FUSIONNÉ avec la ft-v1165 de session-A** (+24, bloc **CCLXIV**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐⭐ **Témoins FONCTIONNELS de bout en bout** : le vrai aperçu est **ouvert**, on lit ce qu'il **affiche**, on **tape** « Rattacher », et `finalImportProg` — la vraie fonction de production — est appelée pour vérifier que la presse **n'est plus créée**. ⭐ **Le témoin de plan demande au NAVIGATEUR** (`elementsFromPoint`) lequel il peindrait devant, au lieu de réimplémenter sa règle — *un contrôle qui recalcule la formule qu'il vérifie est un vert qui ne peut pas rougir*. ⛔⛔ **CONTRÔLE NÉGATIF : 10 MUTATIONS, 9 MORDENT — et la 10ᵉ est la plus utile puisqu'elle a révélé ma fausse précaution.** ① l'arbre d'avant → le bloc **ne peut pas tourner** (3 rouges) ; ⚠️ *je le dis : les 21 autres témoins ne sont pas verts, ils ne sont **pas joués***. ② le rehaussement de plan retiré → **0 rouge** (voir ci-dessus). ③ le rattachement ramené à **une seule ligne** → **4 rouges** — *ce sont quatre faces d'une même garantie, je le dis, pas quatre détections*. ④ la **jumelle historique** non corrigée → **1 rouge**, exactement le sien. ⑤ `_exerciceInconnu` qui répond toujours « inconnu » → **8 rouges** (mutation grossière, assumée). ⑥ le compte **en lignes** au lieu de noms distincts → **1 rouge**, chirurgical. ⑦ le garde du **nom vide** retiré → **1 rouge**, le sien. ⑧ **la ligne orange non rendue** → **1 rouge**, exactement le compteur de boutons. ⑨ le **bandeau** retiré → **3 rouges**. ⑩ la **diapo du Guide** qui n'annonce plus → **1 rouge**, exactement le témoin #11. Fichiers : `log.js`, `constants.js`, `screens.js`, `coach.js`, `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `BUGS.md`. sw.js ft-v1166. |

**ft-v1165 — 📷 LE SCAN TROUVE LE PRODUIT, N'A AUCUNE VALEUR, ET LAISSE LA PERSONNE DANS UN CUL-DE-SAC** — Michel, après trois versions passées sur la même ligne : *« c'est super chiant en fait, même la ratatouille ne change pas les valeurs sur l'onglet poids. Et même par portion, ça dépend de la boîte d'origine : **si je mets 1 comme portion je ne connais pas la valeur en gramme de départ** »*, puis *« c'est surtout que **c'est chiant de mettre ses aliments, alors si ça fonctionne pas** »*, et enfin la précision qui a tout recadré : ***« je l'ai rentré avec le code-barres »***.

**⭐⭐ REPRODUIT PAR LE VRAI CHEMIN** (fiche Open Food Facts avec un nom, une marque et `nutriments:{}` — **très fréquent sur les produits de marque**, et le code le dit déjà noir sur blanc pour *son isolat* **et** pour *un steak haché*). **L'app jetait TROIS choses qu'elle avait déjà** :

**① Le NOM du produit.** *« Ratatouille cuisinée (Bonduelle) »* était construit… puis perdu : le champ restait **vide**, il fallait le retaper.

**② ⛔⛔ `_bcNutr` restait posé AVEC DES ZÉROS — et c'est le défaut silencieux.** `_afMajAncre` croyait donc qu'un pour-100 g était connu (`if(_bcNutr){ _afPropCacher(); return; }`) et **cachait TOUT le réglage de quantité**, pendant que `af-bc-row` restait masqué faute de `_offRemplirFormulaire`. *Mesuré : ni grammes, ni portions, aucun réglage — et pas la moindre erreur.* 👉 ***Un pour-100 g de zéros n'est pas un pour-100 g : c'est une absence qui se fait passer pour une valeur.***

**③ Le bouton « ⚖️ Saisir les valeurs pour 100 g »**, à trois centimètres, jamais proposé.

**⛔ ET LE CUL-DE-SAC ÉTAIT DÉFINITIF, PAS UNE GÊNE** : la personne tape ses macros pour une quantité inconnue → l'entrée part avec `per100:null` **ET** `q:null` → plus rien ne peut la rescaler, **ni ce jour-là ni jamais**. *C'est le même défaut que sa protéine (ft-v1103/1104/1162) et que sa ratatouille — trois versions à poser des garde-fous en aval d'une porte qui manquait.*

**⭐ R13 — LA PORTE MANQUAIT, PAS LA FONCTIONNALITÉ.** Le calibrage de ft-v1110 fait exactement ce qu'il faut et **calibre le produit pour toujours** : le pour-100 g est enregistré avec l'aliment, donc la fois d'après le champ en grammes s'ouvre tout seul. *Zéro logique neuve, zéro nouveau calcul* — c'est mot pour mot le diagnostic de ft-v1155.

**⛔⛔ ET LA JUMELLE A ÉTÉ TROUVÉE PAR MICHEL, PAS PAR MOI (R8).** Pendant que j'écrivais le correctif : *« mais donc ça risque de merder aussi pour le scan du code-barres ou l'étiquette c'est pareil. **Si je mets des options et ça ne fonctionne pas ça en devient ridicule** »*. **Vérifié : `onFoodLabelFile` portait la ligne à l'identique** — même test des quatre zéros, même `return`, même `_bcNutr` laissé posé, même nom jeté (et là c'est un nom lu par l'IA). *Une porte de sortie posée sur un seul des deux chemins n'est pas un correctif, c'est un piège de plus.* **Un seul propriétaire, deux appelants.**

**⚠️⚠️ ET UN TÉMOIN A TROUVÉ UN TROISIÈME DÉFAUT QUE JE N'AVAIS PAS VU (R15).** `openAddFood` remettait **tout** à zéro — provenance, note, suggestions, cohérence, quantité, poids de l'IA — **sauf le bloc de calibrage**. Le défaut existait avant, mais il était **rare** (il fallait ouvrir le bloc à la main) ; ⭐ **depuis que le scan l'ouvre TOUT SEUL, il devient courant**, et le dégât est précis : on scanne un produit sans fiche, on renonce, on ajoute autre chose — et **l'étiquette du produit d'avant est encore à l'écran, prête à être appliquée au suivant**. *Un formulaire qui garde les chiffres de quelqu'un d'autre ne se voit pas : il se valide.*

**⛔ ON N'INVENTE TOUJOURS AUCUNE VALEUR (R29)** : ni un poids, ni un pour-100 g. On pose ce que le code-barres a **réellement identifié** — le nom et la provenance — et on ouvre le champ où la personne, **elle**, sait lire son étiquette.

**📣 RÈGLE D'OR #11 — AIDE OUI, POINT ROUGE NON, POP-UP NON.** ⭐ L'aide détaillée du Journal explique la porte **et le gain** (*recopier une fois suffit, ensuite tu ne tapes plus que tes grammes*) — c'est **ça** qui ne se devine pas. ⛔ Pas de point rouge : le comportement n'apparaît que quand un scan échoue, donc une pastille enverrait chercher quelque chose d'invisible. ⛔ Pas de pop-up : rien n'est à faire, aucun repère n'a bougé (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS — et Michel a posé exactement la bonne question : *« j'ai rentré pas mal de produits, je dois les rentrer encore une fois ? »*** ⭐⭐ **NON, et c'est MESURÉ sur les trois familles de lignes existantes** : ① un produit scanné avec une fiche **complète** rouvre son champ **grammes** — rien à faire ; ② une ligne où un **poids en grammes** avait été enregistré rouvre son champ **quantité** avec *« Référence : 250 g »* et les 4 valeurs suivent — **ça marche déjà** (ft-v1104) ; ③ seule la ligne **nue** (fiche incomplète + macros tapées, aucun poids) reste sur les portions. ⛔ **Et rien du journal n'est faux ni perdu** — les calories notées restent notées ; ce qui manquait était de pouvoir les **recalculer**. 👉 Pour la 3ᵉ famille : **on ne re-rentre rien, on rescanne le produit UNE fois** et le calibrage s'ouvre. ⛔ **Aucune reprise rétroactive n'est possible** : sans poids, aucun calcul n'existe, et l'inventer serait pire (**R29**). ⚠️ **Michel doit vérifier sur Safari/iPhone en rescannant sa ratatouille.**

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #991**, job `deploy` success à **16:39:30 UTC** — ⛔ ni backend ni worker attendus (`Code.js`/`worker.js` non touchés).

Tests : **parcours 3171/3171** (+19, bloc **CCLXIII**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐⭐ **Témoins FONCTIONNELS de bout en bout** : Open Food Facts **et** le Worker sont interceptés, `_lookupBarcode` et `onFoodLabelFile` sont **réellement conduites**, et on lit **la boucle entière** — calibrage à 72 kcal/100 g, puis 250 g → **180 kcal**, le chiffre exact de sa ratatouille. ⛔⛔ **CONTRÔLE NÉGATIF PAR MUTATIONS, 8 VARIANTES** : ① l'arbre d'avant → **9 rouges** · ② ⭐⭐ **le `_bcNutr` de zéros gardé → 3 rouges**, dont *« le bloc quantité redevient disponible »* — c'est la mutation qui prouve le défaut silencieux · ③ le nom non posé → **4 rouges** (*et c'est cohérent : sans nom, `_calAppliquer` refuse, donc la boucle tombe avec*) · ④ le calibrage non ouvert → **2** · ⑤ la bascule non gardée → **1**, exactement le garde · ⑥ un `per100` de zéros posé → **1**, exactement R29 · ⑦ la jumelle non posée → **2** · ⑧ le bloc non rendu → **1**. ⚠️⚠️ **ET DEUX LEÇONS DE MÉTHODE PAYÉES DANS LA VERSION MÊME.** ⓐ **La mutation ⑦ ne mordait PAS au premier jet** : mon témoin appelait `_bcSansValeurs` **en direct** au lieu de conduire `onFoodLabelFile` — *vérifier la fonction n'est pas vérifier l'appel*, la leçon de ft-v1158 payée une **2ᵉ** fois. Le témoin fabrique désormais une vraie image et traverse le vrai chemin (le Worker intercepté). ⓑ **Et une sonde de diagnostic m'a rendu un résultat FAUX et crédible** : `_afSuggLoc` est déclaré en `let` au niveau du script, donc `window._afSuggLoc=[…]` créait un **jumeau** que la fonction ne lisait pas — les trois familles de lignes rendaient un résultat identique et vide. *C'est le piège de ft-v1156, troisième fois : une sonde qui écrit à côté de sa cible ne rend pas « rien », elle rend un chiffre faux.* Corrigé en conduisant la vraie recherche. Fichiers : `app.js`, `screens.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `BUGS.md`. sw.js ft-v1165. |

**ft-v1164 — 📚 LE MODÈLE QUI LIT LE PDF N'AVAIT JAMAIS VU LE CATALOGUE — ET C'EST MICHEL QUI A POINTÉ LA BONNE CAUSE** — après sa séance, devant deux exercices sans photo, sans figurine et sans historique : ***« avant de faire quoi que ce soit on utilise l'IA pour lire le PDF, elle devrait être capable d'analyser tout ça »***.

**⛔⛔ IL AVAIT RAISON, ET MES DEUX PREMIÈRES PROPOSITIONS SOIGNAIENT LE SYMPTÔME.** Je partais sur un meilleur rattachement côté app et un avertissement dans l'aperçu. *Les deux traitaient ce qui arrive APRÈS.*

**⭐⭐ MESURÉ AVANT D'ÉCRIRE UNE LIGNE.** Le prompt de `handleImportProgram_` fait **8 577 caractères** et contient **ZÉRO** nom du catalogue ; l'app envoyait `{action:'importProgram', images}` — **la liste n'était jamais transmise**. 👉 ***Le modèle écrivait « Presse 45 degrés » parce que c'est ce qu'il y a sur la feuille, et personne ne lui avait dit que l'app appelle ça « Press Jambes 45° ».***

**⛔ CE QUE ÇA COÛTAIT, SUR SON IMPORT RÉEL : 4 EXERCICES CRÉÉS EN DOUCE** — *Presse 45 degrés · SDT roumain · Cardio léger · Elliptique/cardio léger*. Et un exercice hors catalogue n'a **ni photo, ni figurine, ni historique** : il a lu *« aucun repère dans ton historique »* sur une presse où il avait fait **280 kg le 4 septembre**. *Trois symptômes, une seule cause.*

**⭐⭐ ET C'EST R8, DÉJÀ CORRIGÉE AILLEURS — LA 4ᵉ FOIS DE LA JOURNÉE.** `coach.js:_catalogueContext()` envoie la liste à **Milo depuis ft-v713**, et la règle est écrite **mot pour mot dans `CLAUDE.md`** : *« une consigne qui NOMME une source sans que cette source soit dans le contexte »*. **Personne ne l'avait fait pour l'import.** Après `_repereDefauts`/`_intensiteDefauts` (ft-v1160), la version de règle du compteur (ft-v1161) et la recherche à deux mots (ft-v1163) : *un correctif posé sur une porte et pas sur sa jumelle.*

**⛔⛔ D'OÙ LES DEUX IMPORTS TRAITÉS ENSEMBLE.** `handleImportHistory_` portait **exactement le même trou** — le réparer d'un seul côté aurait été **la cinquième fois**. Un témoin exige les deux branchements, côté serveur **et** côté app.

**⛔⛔ LA CONSIGNE N'EST SURTOUT PAS « UNIQUEMENT CES NOMS », et c'est le cœur de la précaution.** Un programme peut légitimement porter un exercice que l'app ne connaît pas. Forcer un nom voisin **REMPLACERAIT un exercice par un autre** — *bien pire que d'en créer un nouveau* (**R29** : le coût de l'erreur décide). On dit donc : *emploie le nom **exact** quand c'est manifestement le même exercice · **sinon garde le nom du document** · et **dans le doute**, garde le document*.

**⛔ LES EXERCICES PERSO PARTENT AUSSI** : si la personne a déjà créé « Presse 45 degrés » à la main, le prochain import doit retomber **sur le sien** au lieu d'en fabriquer un deuxième (**R13** — on reprend le patron de `_catalogueContext`, on n'en invente pas un autre).

**⭐ ET LA RÈGLE EST POSÉE À CÔTÉ DU CHAMP `name`, pas seulement dans un bloc à part** — c'est la leçon de **ft-v1158** : *le schéma est le signal le plus fort du prompt, une consigne éloignée ne pèse pas contre lui.*

**⚠️ LE MODÈLE PROPOSE, LE CODE VALIDE** : liste bornée à **600 noms de 80 caractères**, dédoublonnée (EXLIB liste un squat 2×). ⛔ Et une charge utile **absente ou absurde rend `''`** → le prompt est **exactement** celui d'avant, donc un client pas encore à jour se comporte comme aujourd'hui.

**💰 LE COÛT, MESURÉ** : 319 noms, 8 526 caractères, prompt **×2,0**, ~2 400 jetons **par import**. *Un import, on en fait quelques-uns dans sa vie.*

**⚠️ R34 NE S'APPLIQUE PAS** : ce n'est pas le prompt de **Milo**, c'est celui d'un **lecteur de document** — même raisonnement qu'en ft-v1152 pour le cervelet.

**⛔⛔ ET JE DIS MA LIMITE, LA 4ᵉ FOIS** : pas de clé API ici, donc je ne peux **pas** prouver que le modèle obéira. **Je prouve que la liste PART et que la consigne est juste** ; ***c'est Michel qui prouve l'extraction en réimportant.***

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **les programmes déjà importés ne sont pas réparés** — il faut réimporter (**R29**). ⛔⛔ **Et l'aperçu ne DIT toujours pas qu'un exercice va être créé** : c'est le **filet** proposé à Michel, non pris pour l'instant. *Sans lui, rien ne rattrape un modèle qui n'écoute pas* — `BUGS.md` **§46**, et je le note plutôt que de faire comme si le prompt suffisait. ⚠️ **`Code.js` modifié → déploiement backend automatique, à vérifier des DEUX côtés** (**R18**).

Tests : **parcours 3152/3152** (+17, bloc **CCLXII**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐⭐ **Témoins** : `_blocCatalogue_` est **extraite de `Code.js` et EXÉCUTÉE** (patron de ft-v1157), et `_catalogueImport` est **appelée dans la page**. ⛔ **Contrôle négatif : 5 mutations.** ① l'arbre d'avant → **9 rouges** — ⚠️ *et je dis ce que ça vaut : les 8 témoins côté serveur ne sont **pas joués**, l'extraction échoue, ce ne sont pas des verts.* ② ⭐⭐ **le serveur ne branche que le PROGRAMME → 1 rouge, exactement le témoin de la jumelle** — *c'est la mutation la plus utile du lot : elle prouve que ce témoin-là gagne sa place.* ③ l'app n'envoie la liste que sur le programme → **1 rouge**. ④ la liste déclarée **FERMÉE** → **1 rouge**, exactement le garde-fou **R29**. ⑤ plus de dédoublonnage → **1 rouge**. ⚠️ **ET UN TÉMOIN A ROUGI SUR MON PROPRE COMPTAGE** : je cherchais `_blocCatalogue_(body)` et je ramassais **aussi** la ligne `function _blocCatalogue_(body) {` — 3 au lieu de 2. *Le témoin avait raison, c'est mon motif qui était faux* : on compte désormais les **appels** (`= _blocCatalogue_(body)`), pas la définition. Fichiers : `Code.js`, `log.js`, `tests/parcours/runner.js`, `BUGS.md`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1164. |

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
