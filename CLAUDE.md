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

> **Version actuelle : `ft-v1176`** (prochaine : `ft-v1177`). Historique complet (ft-v128→574 + gouvernance
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

**ft-v1176 — ⏱️ LE TEMPS DE REPOS ÉCRIT SUR LE PDF N'ÉTAIT JAMAIS DEMANDÉ AU MODÈLE** — Michel : ***« l'application n'applique pas le temps de repos qui est marqué sur le pdf c'est un peu con, alors quand le temps est variable la je suis d'accord mais quand il est fixe il appliquait le temps »***.

**⭐⭐ MESURÉ, ET LE TUYAU ÉTAIT DÉJÀ COMPLET CÔTÉ APP — c'est ce qui rend la version courte.** `finalImportProg` lit `ex.rest` et `ex.restPerSet` **depuis toujours**, avec un commentaire qui dit noir sur blanc *« le backend PEUT fournir restPerSet[] ou rest unique »*. Vérifié de bout en bout : `rest:180` → **appliqué** · `restPerSet:[120,150,180]` → **par série** · `rest:"2 min"` → **120 s** · `rest:"90-120s"` → **0, rien d'inventé**. 👉 ***Le code tenait déjà la nuance de Michel avant qu'il la formule.***

**⛔⛔ CE QUI MANQUAIT VIVAIT DANS LE PROMPT SERVEUR.** Le schéma JSON de `handleImportProgram_` n'avait **aucun champ `rest`**, et le mot « Repos » n'y apparaissait **qu'une fois** — pour dire d'**ignorer** une page sommaire. *Le modèle voyait la colonne Repos et on ne lui demandait jamais de la lire.* **R8 à l'envers : un lecteur qui attend un champ que personne ne produit** — même famille que **ft-v1164** (le catalogue jamais envoyé) et **ft-v626** (le repos de Milo).

**⭐ LE CHAMP EST POSÉ DANS LE SCHÉMA**, pas seulement dans une règle en bas de page : c'est la leçon de **ft-v1158** — *le schéma est le signal le plus fort du prompt*.

**⛔ LA RÈGLE 9 DIT LES QUATRE CHOSES QUI COMPTENT** : reporte une colonne *Repos / Récup / Rest* · une valeur **ferme** va dans `rest` · une valeur **différente par série** va dans `restPerSet` · et surtout **N'INVENTE JAMAIS**. ⛔⛔ Une valeur **variable ou floue** (« 90-120s », « 1 à 2 min », « selon ressenti », « au feeling ») **n'est pas un repos** : on rend vide, et l'app applique **son** réglage — celui qui est adapté à la personne. *Inventer « 105 s » à partir de « 90-120s » serait une donnée fausse présentée comme une consigne du coach* (**R29**).

**⚠️⚠️ ET UN TROU TROUVÉ EN VÉRIFIANT MA PROPRE CONSIGNE — ça vaut plus que le correctif.** `_secRepos('1min30')` **collé** rendait **0**. Le `\b` du motif interdisait la forme sans espace — *entre le « n » de min et le « 3 » il n'y a aucune frontière de mot* — et c'est justement celle que les gens écrivent. Le chrono retombait sur le réglage par défaut, **sans erreur, sans message**. 👉 ***Promettre au modèle un format que l'app lit comme zéro, c'est fabriquer un silence.*** ⭐ Corrigé **côté app**, exactement comme le prescrit le commentaire de la fonction dix lignes plus haut : *« le bon geste n'est pas de durcir la consigne, c'est de rendre l'app tolérante »*. **Mesuré : 23 formats testés, 23 justes** — dont « 1m30 », « 1min30s » et « 2minutes30 » qui passent désormais aussi.

**📣 RÈGLE D'OR #11 — RIEN D'ANNONCÉ, MAIS LE COMPORTEMENT CHANGE** : un programme importé qui porte une colonne Repos verra son chrono démarrer sur **sa** valeur au lieu du réglage par défaut. Aucun écran ne bouge, rien n'est à faire, et **un programme sans colonne Repos se comporte exactement comme avant** (témoin de non-régression dédié) — **R19/R25**.

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **les programmes déjà importés ne sont pas réécrits** (**R29**) — il faut réimporter pour que le repos du document arrive. ⛔ **L'import d'HISTORIQUE n'est pas touché** : le repos d'une séance **passée** n'a rien à appliquer. ⚠️ **Et je dis ma limite, la 5ᵉ fois** : pas de clé API ici, donc **je prouve que le champ PART et que la consigne est juste** ; *c'est Michel qui prouve l'extraction en réimportant*. ⚠️ **`Code.js` modifié → déploiement backend automatique, à vérifier des DEUX côtés (R18).**

Tests : **parcours 3323/3323** (+11, bloc **CCLXXIV**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐⭐ **Les témoins CONDUISENT `finalImportProg`** et lisent le repos que les **séries** portent à l'arrivée — *vérifier `_secRepos` ne prouverait rien du chemin* (leçon de ft-v1158, payée trois fois). ⛔ Et le prompt serveur est **extrait de `Code.js` et lu** : *un `grep` sur « repos » attraperait la phrase qui parle d'ignorer une page sommaire*. ⚠️⚠️ **ET LA PASSE COMPLÈTE A ROUGI SUR UN TÉMOIN DE ft-v1158, QUI FAISAIT SON TRAVAIL.** Il vérifiait que `setTypePerSet` est dans le schéma d'exemple… avec un motif qui codait en dur le champ **suivant** (`,"note"`). Mon insertion de `rest`/`restPerSet` s'est glissée entre les deux : **rouge**, alors que la garantie — *le champ est dans le schéma, à vide* — restait parfaitement vraie. 👉 ***Un témoin qui fige plus que sa garantie rougit sur des changements légitimes, et on finit par le desserrer pour de mauvaises raisons.*** Motif resserré sur **exactement** sa garantie, et **éprouvé** : retirer le champ du schéma le fait toujours rougir. *Ce n'est pas un assouplissement, c'est une mise au point* — la différence se mesure, et je l'ai mesurée. ⛔ **CONTRÔLE NÉGATIF : 5 mutations, toutes mordent** — ① le `\b` remis → **2 rouges**, dont la forme collée · ② le champ retiré du **schéma** → **1 rouge** · ③ la règle 9 qui n'interdit plus d'inventer → **1 rouge** · ④ la règle qui ne nomme plus les valeurs variables → **1 rouge** · ⑤ ⭐ `_secRepos` qui **invente 90** au lieu de rendre 0 → **2 rouges**, exactement les deux témoins de la nuance de Michel. Fichiers : `constants.js`, `Code.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1176. |

**ft-v1175 — ⛔ UNE CIBLE DE SYNONYME QUI N'EXISTE PLUS, ET LE RAPPROCHEUR ÉTAIT SÛR À 95 %** — Michel conteste un de mes classements : ***« curl ischios c'est leg curl ischios et rien a voir avec poussée de hanche hein »***.

**⭐ IL AVAIT RAISON SUR LES DEUX POINTS.** ① Je les avais mis **dans la même ligne d'un tableau** — ils n'ont en commun que la *raison* pour laquelle je les avais écartés, pas le mouvement ; ça se lisait comme si je les rapprochais. ② Et cette raison était **fausse** pour le sien : mesuré, `leg curl` rendait **95 % en `auto`** quand `curl ischios` rendait **33 % en `confirm`**. ***Le même exercice, deux réponses différentes.*** C'est `abducteurs`/`adducteurs` une **2ᵉ fois** — **R8** sur le vocabulaire.

**⛔⛔ ET EN VÉRIFIANT SON POINT, JE SUIS TOMBÉ SUR BIEN PIRE — MESURÉ DE BOUT EN BOUT SUR UN VRAI IMPORT.** « Leg curl » était rapproché en **`auto` à 95 %** vers **« Curl Ischio-jambiers (Leg Curl) »** — un nom **renommé depuis** en « Leg Curl Couché Machine », donc **absent d'EXLIB**. Résultat : **un exercice perso créé**, sans photo ni figurine ni historique, et un nom sans aucune fiche écrit dans le programme.

**👉 C'EST LE PIRE DES DEUX CAS : l'app est SÛRE D'ELLE et elle a tort.** ⛔⛔ Et **la marque orange de ft-v1166 ne se déclenche pas**, puisque c'est `auto` : *ça passe entièrement sous le radar — personne ne peut le voir.*

**⚠️ POURQUOI LE FILET N'A PAS JOUÉ** : `exNomActuel` rattrape bien les anciens noms… mais il vit dans la **RECHERCHE** (`filterEx`), pas dans le rapprochement. `_matchExercise` rendait le nom mort **tel quel**, et c'est **lui** que l'import écrit. ***Un rattrapage posé sur un seul des deux lecteurs RESSEMBLE à un rattrapage*** (**R8**).

**⛔ ON CORRIGE LA DONNÉE, PAS LE MOTEUR** (la règle de ft-v1170) : `_matchExercise` n'est pas touchée. Les **4** clés qui désignent bien un leg curl machine/poulie pointent vers le **nom actuel** — *la destination ne change pas, c'est déjà là qu'`exNomActuel` menait ; seul le nom cesse d'être un fantôme.*

**⛔⛔ ET LES DEUX AUTRES SONT RETIRÉES, PAS REDIRIGÉES (R30).** Un **nordic curl** et un **ham curl TRX** sont au **poids du corps** ; les envoyer vers une machine **couchée** serait exactement le « synonyme FAUX » qu'on refuse partout ailleurs — *il fusionnerait en silence l'historique de deux exercices très différents*. Vérifié : le catalogue n'a ni l'un ni l'autre. Ils redeviennent une **QUESTION** (palier `confirm`), ce qui est honnête et **se voit**.

**⭐ LE POINT DE MICHEL EST APPLIQUÉ** : `curl ischios`, `curl ischio`, `curl ischio jambiers` et `leg curl ischios` rendent tous **95 % en `auto`**, la même réponse que `leg curl`. **Mesuré : 531 clés, 0 cible périmée.**

**⚠️⚠️ MON TÉMOIN DE COHÉRENCE DE ft-v1170 EST DURCI, ET C'EST LA VRAIE LEÇON.** Il acceptait `exNomActuel(cible)` — donc il vérifiait que la clé **mène quelque part**, pas que le nom **rendu** soit utilisable. **Il était VERT** pendant que « leg curl » écrivait un exercice fantôme dans les programmes. 👉 ***Un contrôle qui accepte le rattrapage ne voit pas que le rattrapage n'a pas lieu.*** On exige désormais que la cible existe **telle quelle**.

**⚠️ ET DEUX TÉMOINS DE ft-v1172 SONT RETOURNÉS, PAS ADOUCIS (R30).** Ce matin j'y avais figé *« curl ischios reste une question »* ; Michel a démontré le contraire **le jour même**. *Ce n'est pas un témoin qu'on assouplit pour faire passer du code : c'est la RÈGLE qu'il figeait qui a changé — et on écrit laquelle, par qui et quand.* ⛔ La « poussée de hanche », elle, garde ses **4 variantes sans générique** : elle reste une question, et son témoin reste.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change ; un import qui fabriquait un exercice fantôme tombe sur la bonne fiche (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS, ET DEUX PISTES MESURÉES EN CHEMIN** : ⛔ **les programmes déjà importés ne sont pas réécrits** (**R29**). ⛔ **Et ça ne résout pas le problème de fond que Michel soulève dans la foulée** : *« une personne qui connait va voir le truc mais une personne qui ne connait pas »*. ① **Son idée est exacte, vérifiée dans le code** : l'import ne lit pas le texte du PDF, `_pdfToImages` **rend chaque page en JPEG 1200 px** — *le modèle VOIT donc déjà les photos et les schémas*, on ne lui demande pas de s'en servir ; la consigne coûte quelques dizaines de jetons. ② ⭐⭐ **Plus fort parce que vérifiable** : l'aperçu n'affiche que le **nom** alors que `_exImg` existe — *« Curl Ischio-jambiers (Leg Curl) » sonne parfaitement juste, mais sa vignette aurait été VIDE*. **Une vignette absente est un signal qu'aucun texte ne donne**, et quelqu'un qui ne connaît aucun nom **reconnaît une machine sur une photo**. ③ **Et le TEMPS DE REPOS du PDF n'est pas appliqué** — mesuré : le tuyau est **complet** (`rest:180` → appliqué · `restPerSet` → par série · `rest:"2 min"` → 120 s · `rest:"90-120s"` → **0, rien d'inventé**, exactement la nuance de Michel). *Il ne manque QUE le champ dans le schéma du prompt serveur.* **R8 à l'envers : un lecteur qui attend un champ que personne ne produit.**

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1021**, conclusion `success` à **15:39:58 UTC** sur `16ee78ee`. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés).

Tests : **parcours 3312/3312 sur l'arbre FUSIONNÉ avec la ft-v1174 de session-A** (+8, bloc **CCLXXIII**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⛔ **CONTRÔLE NÉGATIF : 5 mutations** — ① la cible périmée remise → **3 rouges** · ② seules les formes anglaises corrigées → **1 rouge**, exactement le point de Michel · ③ les formes « poulie » oubliées → **1 rouge**, la porte jumelle · ④ le synonyme faux remis → **2 rouges** · ⑤ ⭐ une cible périmée **ailleurs** → **1 rouge**, exactement le témoin durci — *c'est celle qui prouve que le durcissement sert à quelque chose*. Fichiers : `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `IDEES-FUTURES.md`. sw.js ft-v1175. |

**ft-v1174 — 📦 LE POIDS DU PAQUET ÉTAIT DEMANDÉ À OPEN FOOD FACTS DEPUIS TOUJOURS, ET JETÉ À L'ARRIVÉE** — Michel, en une phrase : ***« mais normalement le code-barres donne le poids avec non ? »***

**⭐⭐ IL AVAIT RAISON, ET C'ÉTAIT PIRE QUE ÇA — MESURÉ DANS LE FICHIER.** Le champ `quantity` est **déjà** dans la liste des champs demandés à Open Food Facts, à **DEUX endroits** (`_offFetchProduct` pour le code-barres, `_offRechercher` pour la recherche par nom) — et **ZÉRO ligne de l'app ne le lisait**. Le seul poids employé était `serving_quantity`, la *portion* déclarée, souvent absente : on retombait alors sur **100 g par défaut**. 👉 ***On payait la bande passante d'une donnée qu'on jetait à l'arrivée.*** C'est **R5** (l'audit à l'envers — *« où cette information ressort-elle concrètement ? »*), et personne ne l'avait posée sur ce champ.

**⛔⛔ ET LA DÉCISION QUI TIENT TOUT LE RESTE EST DE NE PAS LE PRÉ-REMPLIR.** `quantity` est le poids **DU PAQUET**, pas de ce qui a été mangé : une boîte de ratatouille qu'on vide dans l'assiette → **c'est le bon chiffre** ; un pot d'isolat de **1 kg** → personne n'en mange 1 kg. *Un chiffre pré-rempli qu'on n'a pas choisi est un chiffre faux présenté comme un fait* (**R29**) — la phrase est déjà écrite **deux fois** ailleurs dans ce fichier, pour le champ de poids et pour le champ de portion. On **PROPOSE** donc une pastille tapable — **📦 250 g (le paquet entier)** — sur le patron exact de `_bcProposerDerniere` (**R13**, le mécanisme est éprouvé depuis ft-v1105).

**⭐ UNE SEULE DIFFÉRENCE AVEC SA JUMELLE, ET ELLE EST VOULUE** : *« la dernière fois »* **vide** le champ (elle remplace une proposition par une autre) ; le poids du paquet, lui, **s'ajoute** à ce qui est déjà là — la portion du fabricant, ou les 100 g par défaut. *Effacer le champ retirerait un repli valable pour le remplacer par une proposition qui n'a pas encore été acceptée.*

**⭐⭐ ET ÇA TRAVERSE LE CALIBRAGE — C'EST LE CAS EXACT DE SA RATATOUILLE.** Une fiche **trouvée mais sans valeurs** part à l'écran « recopie ton étiquette » (ft-v1165), et l'objet produit d'Open Food Facts disparaît avec elle. 👉 ***Sans report, le produit qui a le plus besoin de son poids serait le seul à le perdre.*** D'où **deux variables, deux métiers** (**R2**) : `_bcPaquetG` (les grammes du produit à l'écran) a **un propriétaire unique**, `_offRemplirFormulaire`, que **les cinq** remplissages traversent — scan, recherche par nom, CIQUAL, marque, étiquette — donc la pastille ne peut jamais survivre d'un aliment à l'autre ; et `_bcPaquetTxt` (le texte brut d'OFF) n'existe **que** pour ce report-là. Un témoin fige chacune des deux.

**⛔ CE QUI EST REFUSÉ EST ÉCRIT, PAS SILENCIEUX (R30)** : ⚠️ **les volumes** — *« 1 L » n'est pas « 1000 g »*, ça dépend de la densité (1,0 pour l'eau, **0,92** pour l'huile, **1,4** pour le miel) ; *convertir reviendrait à inventer une densité qu'on ne connaît pas*, et l'app afficherait un poids **crédible et faux** ; ⚠️ **les lots** — « 6 x 125 g » vaut 750 g en paquet et 125 g en unité, et c'est l'unité qu'on mange : *si l'expert hésite, on n'ajoute pas* ; ⚠️ **au-delà de 5 kg** — ce n'est plus une référence de portion mais un sac ou un format restauration.

**⚠️⚠️ ET LA LEÇON DE MÉTHODE EST À MOI, TROUVÉE PAR LE CONTRÔLE NÉGATIF : J'AVAIS ÉCRIT UNE GARDE QUI NE SERVAIT À RIEN.** Mon premier jet portait un `if(/[x×*]/.test(t)) return 0;` anti-lot, avec sa belle justification. ⛔⛔ **La mutation qui le retirait ne faisait rougir PERSONNE** — et pour cause : l'expression régulière est **ancrée `^…$`** sur *un* nombre et *une* unité, donc aucun lot ne pouvait la traverser de toute façon. 👉 ***Une garde qu'aucun témoin ne peut faire rougir n'est pas une sécurité, c'est de la décoration*** — et elle est pire que rien, parce qu'elle laisse croire que le sujet est traité. Elle est **retirée**, et c'est le **témoin** qui fige la règle : si quelqu'un desserre un jour cet ancrage, il rougit (mutation M4′, vérifiée). *C'est exactement le « GARDE (pas détecteur) » de ft-v1166, mais cette fois j'ai supprimé au lieu de renommer.*

**⚠️ ET JE DIS MA LIMITE PLUTÔT QUE DE LA MASQUER** : le réseau Open Food Facts est **bloqué depuis le conteneur de développement**, donc **la couverture réelle du champ n'est pas mesurée** — je ne sais pas sur quelle proportion des fiches `quantity` est rempli, ni lisible. Les témoins portent sur le **parseur** et sur le **chemin**, jamais sur un taux de remplissage. *C'est Michel qui le mesurera en scannant.*

**⭐ ET LE PARTAGE EST CLARIFIÉ AU PASSAGE, PARCE QUE JE LE MÉLANGEAIS** : les tables que Michel a fournies et corrigées — `marques.json` (**123 produits fast-food, 123/123 avec un poids de portion, déjà utilisé**), `alias.json` (632 alias → CIQUAL), `ciqual.json` (3 484 aliments), `complalim.json` — sont **locales, dans le dépôt, hors ligne**. **Open Food Facts n'en fait PAS partie** : c'est un **appel réseau en direct**, produit par produit. *Le trou était donc sur ce seul chemin, et pas sur ses tables.*

**📣 RÈGLE D'OR #11 — AIDE OUI, POINT ROUGE NON, POP-UP NON** — et c'est la décision de **ft-v1165 rejouée**, pas un raccourci : la pastille n'apparaît **que** sur un scan dont la fiche porte un poids lisible. ⛔ Un point rouge enverrait donc chercher **quelque chose d'invisible** tant qu'on n'a pas scanné le bon produit, et une pop-up annoncerait un bouton qu'on ne peut pas aller voir. ⭐ **L'aide détaillée du Journal, elle, dit ce que la pastille N'EST PAS** — le poids du **paquet**, pas celui de l'assiette — avec les trois chiffres qui le rendent parlant (1 L d'eau = 1 kg · d'huile = 920 g · de miel = 1,4 kg). *C'est ça qui évite de la taper les yeux fermés sur un pot de 1 kg* (**R25** : la pop-up annonce, l'aide explique).

⚠️ **Et cette ligne a été RÉÉCRITE avant d'être livrée** : mon premier jet annonçait « points 2 à 5 » — un point rouge, l'aide `?`, l'aide détaillée et une diapo — **que je n'avais pas posés**. 👉 ***C'est exactement la famille §54 que cette semaine vient de créer*** (*le journal dit vrai, le code ne le fait pas*), et je l'ai attrapée en relisant ma propre entrée. *Un journal qui annonce une checklist non faite est pire qu'un journal muet : il fait croire que c'est fait.*

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **ça ne remplit rien tout seul** — sans appui, le comportement est **exactement** celui d'hier (deux témoins de non-régression le figent). ⛔ **Les lignes déjà enregistrées ne changent pas** (**R29**). ⛔ **Et les volumes restent un trou connu** : une bouteille de 33 cl ne propose rien. *Noté, pas pris* — il faudrait une table de densités, donc une décision produit, pas une ligne de code. ⚠️ **Michel doit vérifier sur Safari/iPhone** en rescannant sa ratatouille.

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1018**, conclusion `success` à **15:15:36 UTC** sur `8de76d85` — ⛔ ni backend ni worker attendus (`Code.js`/`worker.js` non touchés).

Tests : **parcours 3303/3303** (+12, bloc **CCLXXII**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐⭐ **Les témoins CONDUISENT le vrai chemin** : `fetch` est intercepté avec une fausse fiche Open Food Facts, `_lookupBarcode` et `_calAppliquer` sont **réellement appelées**, et on **tape sur la pastille** — jusqu'au chiffre de bout en bout, **250 g → 180 kcal**. ⛔ **CONTRÔLE NÉGATIF : 8 MUTATIONS, TOUTES MORDENT** — ① l'arbre d'avant → **8 rouges** ; ② ⭐⭐ **la pastille qui pré-remplit le champ → 1 rouge, exactement la décision R29** — *c'est la mutation la plus utile du lot* ; ③ les volumes acceptés → **2 rouges** ; ④′ **l'ancrage desserré** (ce qui protège vraiment des lots) → **1 rouge** ; ⑤ les bornes retirées → **1** ; ⑥ **le poids qui ne traverse plus le calibrage** → **2 rouges**, exactement le cas de Michel ; ⑦ la réserve non remise à zéro → **1** ; ⑧ le propriétaire unique cassé (CIQUAL garde le poids d'avant) → **1** ; ⑨ le champ retiré de l'appel réseau → **1**, exactement le contrôle. ⚠️ **Et les sondes du parseur sont DÉFENSIVES** (`typeof`) : sur l'arbre d'avant la fonction n'existe pas, et un `ReferenceError` ferait sauter **tout le bloc** — *une mutation qui casse le fichier ne prouve rien, elle empêche de mesurer* (leçon de ft-v1173, appliquée d'emblée). ⚠️ **Un témoin a aussi rougi sur MA sonde, pas sur le code** : j'appelais `_offRemplirFormulaire` sans poser `_bcNutr`, ce que le vrai chemin CIQUAL fait toujours — *une sonde qui saute une étape de production ne teste pas le code, elle le fait planter*. Fichiers : `app.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1174. |

**ft-v1173 — ⚖️ LE CHOIX DE PORTIONS ÉTAIT JETÉ AU PASSAGE EN GRAMMES — ET C'EST UN TÉMOIN DE ft-v1061 QUI A ARRÊTÉ MON PREMIER CORRECTIF** — Michel, enregistrement d'écran à l'appui : ***« ça me fait péter un câble lol, pour ma prot iso quand je veux changer la valeur en gramme ça ne fonctionne pas, regarde la vidéo »***.

**⭐⭐ LU IMAGE PAR IMAGE, PAS DE MÉMOIRE — ET C'EST L'IMAGE QUI A DONNÉ LA CAUSE.** Il tape `100`, l'app écrit *« ✅ 100 g — les 4 valeurs ci-dessous correspondent à ce poids »*… et **divise ces valeurs par deux** : **312 → 156 kcal**, **52 → 26 g** de protéines, ***sans que le nombre `100` bouge d'un pixel***. 👉 Rien à l'écran ne dit ce qui vient d'arriver : *un chiffre qui change tout seul pendant que la cause reste identique est illisible*. Et **156 / 26 est exactement sa ligne d'origine** — son `×2` avait été jeté.

**🎯 LA CAUSE ÉTAIT ÉCRITE DANS LE FICHIER, TROIS LIGNES AU-DESSUS.** `_afSetUnite` rappelait `_afMajAncre()` **sans `srcChange`**, donc la fonction **préservait `_afRef.base`** — l'ancienne référence. Or son commentaire promet mot pour mot : *« Les 4 valeurs affichées deviennent la nouvelle référence, quelle qu'elle soit. »* ⛔⛔ ***Le commentaire disait vrai, le code ne le faisait pas.*** C'est **R4 retourné** — d'habitude l'information n'atteint pas la donnée ; ici l'**intention** n'atteignait pas le **code**, et le commentaire **endormait le lecteur** en décrivant un comportement inexistant. Nouvelle famille **`BUGS.md` §54**.

**⛔⛔⛔ ET LA VRAIE LEÇON DE CETTE VERSION EST QUE MON PREMIER CORRECTIF ÉTAIT FAUX — LE BANC L'A DIT, PAS MOI.** J'avais passé `true` **sans condition** : le mini-banc était à **16/16**, les mutations mordaient, tout allait bien. La passe complète a rendu **3 rouges**, tous dans le bloc **CLXVIII (ft-v1061)** — dont *« SA CAPTURE : 40 g redonne 156 / 35, plus jamais les 208 / 47 »*. 👉 ***Mon correctif rouvrait un bug que Michel avait signalé avec quatre captures d'étiquette.*** *Réparer le cas qu'on regarde en cassant celui d'à côté n'est pas un correctif, c'est un échange.*

**⭐⭐ ET LES DEUX CAS SE RESSEMBLENT COMME DEUX GOUTTES D'EAU — LE GESTE EST LE MÊME, LA QUESTION N'EST PAS LÀ.**
- **ft-v1061** : une référence en **grammes** existe (30 g → 117 kcal). L'écran montre alors les valeurs d'une **AUTRE** quantité (40 g → 156). Les reprendre désappaire `base` et `q`, et 40 g finit par afficher **208 kcal**.
- **ft-v1173** : **aucune** quantité n'a jamais été posée, la personne a seulement tapé `×2`. Les valeurs affichées sont **la seule expression** de ce qu'elle a mangé — les jeter, c'est jeter son choix.

👉 **LE DISCRIMINANT N'EST PAS LE GESTE, C'EST *« L'APP SAIT-ELLE DÉJÀ COMBIEN ÇA PÈSE ? »*** — un booléen, `_afPoidsPose`. **Tant qu'aucun poids réel n'est posé, l'écran fait foi ; dès qu'il y en a un, ft-v1061 reprend la main.** ⭐ C'est la même question que partout ailleurs dans ce fichier : *les valeurs affichées et la quantité affichée vont toujours ensemble* — sauf qu'ici, il n'y a pas de quantité.

**⭐ LE MOTIF EXISTAIT À CÔTÉ, DEPUIS TOUJOURS** : `af-kcal` passe `onchange="_afMajAncre(true)"` dans `index.html`. Changer d'unité **est** un changement de source — ça n'avait simplement jamais été classé comme tel.

**⛔⛔ POURQUOI AUCUN TÉMOIN NE L'AVAIT VU — MESURÉ, PAS SUPPOSÉ : `_afSetUnite('g')` EST CONDUIT PAR CINQ TÉMOINS EXISTANTS, ET LES CINQ LE FONT JUSTE APRÈS UN REMPLISSAGE NEUF.** Dans ce cas `base` et l'écran portent les **mêmes** valeurs, et le défaut est invisible. **Le déclencheur n'est pas une fonction, c'est un ORDRE** : *portions d'abord, grammes ensuite*. Aller directement en grammes marche — et c'est le seul chemin qui était testé. *Un banc d'essai qui n'exerce qu'un ordre ne couvre pas la fonctionnalité, il couvre son mode d'emploi.*

**⛔⛔ LA JUMELLE ÉTAIT LÀ, VÉRIFIÉE ET NON SUPPOSÉE (R8) — ET ELLE ÉTAIT SILENCIEUSE.** `_efQtyRender` (« Modifier l'aliment ») portait le même défaut sous une autre forme : **rien ne tombe à l'écran**, mais la **référence se désappaire** — l'app affiche 312 kcal en annonçant « 100 g » pendant que sa base vaut 156, et le **rescale suivant divise depuis la mauvaise base** : taper 50 g rendait **78 kcal au lieu de 156**. *Un défaut qui ne se voit pas est pire que celui qui se voit : personne ne peut le signaler.* Après ft-v1160, ft-v1161, ft-v1163, ft-v1164 et ft-v1166, c'est la **6ᵉ fois** qu'un correctif devait être posé sur les deux portes. **Le discriminant y est le même** (`_efPoidsPose`) — une règle, deux écrans (**R2**).

**⚠️⚠️ ET LE CORRECTIF DE LA JUMELLE FABRIQUAIT UN PIÈGE QU'IL A FALLU REFERMER AU MÊME ENDROIT.** Pour que le poids déclaré ne reparte pas de l'entrée du journal, `_efQtyRender` doit **préserver** `_efRef` au redessin. Or **`_efRef` survivait déjà d'un aliment au suivant** : la branche « pour-100 g » sort **avant** de le réécrire, donc ouvrir un produit emballé après un aliment saisi à la main laissait pointer sur le **précédent** (et `_efCorrigerKcal` écrivait alors dans la référence du mauvais aliment). 👉 **Inoffensif tant que `base` venait de l'entrée ; fatal dès que la référence est préservée.** `openEditFood` remet donc `_efRef` à `null`, et un témoin le fige. ⭐ *C'est mot pour mot ce que `_afPropCacher` fait pour l'unité, une porte plus loin* — **R13**, la moitié manquante d'un motif déjà écrit.

**📣 RÈGLE D'OR #11 — RIEN.** Un écran qui se contredisait cesse de se contredire : aucun bouton n'apparaît, aucun repère ne bouge, rien n'est à faire. Même famille que ft-v1163 et ft-v1170 (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **les lignes déjà enregistrées ne sont pas réparées** (**R29**) — une entrée validée à la mauvaise valeur reste à la mauvaise valeur ; il faut la reprendre **une fois**, et ensuite le chemin est droit. ⛔ **Aucun autre chemin n'est touché** : un aliment avec un **pour-100 g**, un poids **lu dans la phrase** ou **estimé par l'IA** n'a jamais eu ce défaut (ces branches n'ont pas d'onglets d'unité) — vérifié, et deux témoins de non-régression le figent. ⛔ **Et on n'a pas ajouté de re-synchronisation des 4 champs côté édition** : elle serait sans effet aujourd'hui, et *du code qu'aucun témoin ne peut faire rougir est du code qu'on ne saura pas maintenir*. ⚠️ **Michel doit vérifier sur Safari/iPhone**, en reprenant sa ligne d'isolat : `×2`, puis ⚖️ grammes, puis `100`.

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1015**, job `deploy` en `success`, **les 7 étapes** — « Déployer sur GitHub Pages » comprise — à **13:59:03 UTC** sur `a721a9ff` — ⛔ ni backend ni worker attendus (`Code.js`/`worker.js` non touchés).

Tests : **parcours 3291/3291 sur l'arbre FUSIONNÉ avec la ft-v1172 de session-B** (+17, bloc **CCLXXI**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐⭐ **LES TÉMOINS COMPTENT LES VRAIS NOMBRES DE LA VIDÉO** (312/52 · 156/26 · 624/104), jamais « a changé / n'a pas changé » — et le geste est le **vrai** : on tape dans le champ, puis on **ferme le clavier** (`input` puis `blur`), parce que c'est au `blur` que le bloc se range. ⛔⛔ **CONTRÔLE NÉGATIF : 7 MUTATIONS, TOUTES MORDENT** — ① l'arbre d'avant → **7 rouges** ; ② **l'écran d'AJOUT seul remis en arrière → 3 rouges**, exactement les siens, *la jumelle reste verte* ; ③ **la JUMELLE seule remise en arrière → 2 rouges**, exactement les siens — *ces deux-là, côte à côte, prouvent que les deux moitiés sont nécessaires et indépendantes* ; ④ `_efRef` non remis à `null` → **1 rouge**, exactement le piège ; ⑤ la préservation de la référence retirée → **2 rouges** ; ⑥ ⭐⭐ **MON PREMIER CORRECTIF, celui qui ignore le drapeau → 4 rouges, dont LES TROIS de sa capture d'étiquette de ft-v1061** — *c'est la mutation la plus utile du lot : elle rejoue mon erreur et prouve que le discriminant gagne sa place* ; ⑦ le drapeau jamais levé → **5 rouges**. ⚠️ **Et le témoin du drapeau est DÉFENSIF** (`typeof`) : sur l'arbre d'avant la variable n'existe pas, et un `ReferenceError` ferait sauter **tout le bloc** — *une mutation qui casse le fichier ne prouve rien, elle empêche de mesurer*. ⚠️⚠️ **UNE 2ᵉ LEÇON DE MÉTHODE, À MOI AUSSI : UN DE MES TÉMOINS ÉTAIT VERT PAR COÏNCIDENCE.** Mon étape ⑤ rescalait à **50 g** — or à 50 g, **l'erreur (÷2) et le rescale (÷2) se compensent** et donnent le **même nombre des deux côtés**. Passé à **200 g**, il rougit. *Un témoin vert par coïncidence ne mesure rien, il rassure* (ft-v1163, 3ᵉ fois). Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `BUGS.md`. sw.js ft-v1173. |
**ft-v1172 — 🔤 LES ACCENTS FABRIQUAIENT DES DOUBLONS INVISIBLES — ET LA RÉCOLTE DE SYNONYMES EST COURTE EXPRÈS** — Michel envoie une capture : **CINQ** exercices perso créés par UN import pour **UN SEUL** mouvement d'épaules. Puis la vraie question : ***« pk ne pas rentre tous ses noms la dans une base de données invisilbles pour faire directement le bon changement »***.

**⭐⭐ MESURÉ, ET LE DIAGNOSTIC S'EST SÉPARÉ EN DEUX — c'est ce qui a évité de « remplir la table ».**

**① Les 5 pointent TOUS vers « Développé Épaules Machine », à 50-67 %.** C'est le palier `confirm` : *l'app a **demandé**, personne n'a répondu, elle a créé.* ⛔ **Ce n'est donc PAS un trou de vocabulaire** — c'est la question qui ne se voyait pas, et **ft-v1166 l'a réparée avant-hier** (lignes orange + compteur + bouton « 🔗 Rattacher »).

**② ⛔⛔ MAIS DEUX D'ENTRE EUX SONT LE MÊME NOM** : « Développé Épaules Guide / Haltères » et « Développé épaules **guidé** / haltères ». Le test *« cet exercice existe-t-il déjà ? »* (`_catalogueConnu`/`_exerciceInconnu`, ft-v1166) comparait en **`toLowerCase()` SEUL, sans enlever les accents** → `guide` ≠ `guidé` → **deux exercices perso créés pour un**. 👉 ***Et un doublon d'accent ne se voit pas : il se lit comme un vrai exercice, avec son propre historique, et il coupe les charges en deux.***

**⭐⭐ ET L'APP SAVAIT DÉJÀ LE FAIRE.** `_normEx` (accents, ponctuation, espaces) rend le **même** texte pour ces deux noms — mesuré. C'était **R2** : *deux façons d'écrire la même question, celle qui décide de **créer** étant la moins fine des deux.* Un seul propriétaire désormais, **`_cleNom`**, employé aux **CINQ** endroits qui la posaient chacun à leur façon — le propriétaire, les **deux** compteurs d'aperçu (programme **et** historique) et les **deux** dédoublonnages de création (**R8**, les portes jumelles).

**⛔ LA GARANTIE QUI REND LE CHANGEMENT SÛR EST UNE MESURE, pas une intention** : sur les **322 noms du catalogue, ZÉRO collision** sous `_cleNom`. Deux exercices réellement différents ne peuvent donc pas se confondre — et « Développé Épaules Guide **(ECH)** » reste bien un nom distinct. **L'import écrit 2 exercices là où il en écrivait 3.**

**⭐ LA FUSION MANUELLE TOLÈRE ENFIN L'ACCENT, et ce n'est pas un détail de confort** : le geste qu'on demande à quelqu'un qui répare un import est de **RETAPER à la main** le nom du catalogue, sur un téléphone, avec des accents et un « ° ». **Mesuré avant** : renommer « SDT roumain » en « Souleve de Terre Roumain Barre » (sans l'accent) ne déclenchait **aucune** fusion — l'app renommait le perso **en silence** et il fallait recommencer. ⛔ Et un renommage qui ne change **que** l'accent reste un simple renommage.

**⭐ LA RÉCOLTE — 2ᵉ demande de Michel, ET ELLE EST COURTE EXPRÈS.** La base existe (`_EX_EQUIV`, **525 clés**) ; la question n'est pas *« peut-on la remplir »* mais *« qu'a-t-on le DROIT d'y mettre »*. **Mesuré sur du vocabulaire de salle réel**, `_matchExercise` exécuté dans la page : **sur 24 formes testées, QUATRE seulement ont UNE seule réponse possible**, chaque cible vérifiée **unique** dans le catalogue — `biceps marteau` → **Marteau** · `adducteurs machine` (+ `assis adducteurs machine`) → **Adduction Cuisses** · `presse à mollets` → **Presse Mollets**. Les quatre passent de **0 % ou 50 %** à **95 % en `auto`**. ⭐ **`adducteurs machine` est un R8 en miniature** : son jumeau `abducteurs machine` était là depuis toujours — l'un rendait 95 %, l'autre **0 %**.

**⛔⛔ CE QUI A ÉTÉ ÉCARTÉ COMPTE PLUS QUE CE QUI EST AJOUTÉ — ET DES TÉMOINS LE FIGENT.** `curl ischios` (33 %) et `poussée de hanche` (50 %) ont **4 à 5 variantes** chacun (barre / haltère / machine / unilatéral) · `développé épaules guidé` (67 %) est **LE cas de Michel** et il est **ambigu par nature** — machine guidée ou haltères ? · `tirage vertical nuque` parce que **SIX** exercices portent « nuque ». *Si l'expert hésite, on n'ajoute pas* (**R29**) : un synonyme **FAUX** tranche **en silence** et coupe un historique en deux. 👉 **Sans ces témoins, la prochaine session « complète » la table et personne ne voit qu'elle vient de faire trancher l'app à la place de la personne.**

**⛔⛔ ET LES QUATRE MACHINES DE CARDIO SURTOUT PAS** — `elliptique`, `vélo`, `rameur`, `tapis de course`. **Mesuré : `_estCreneauCardio` les rend TOUTES `true`** depuis ft-v1168. *Ce ne sont pas des exercices, ce sont des créneaux de cardio* — les mettre dans cette table les **retransformerait en musculation**, c'est-à-dire le défaut exact que ft-v1168 vient de réparer.

**⭐ LA RÉCOLTE MÉCANIQUE N'A RIEN DONNÉ, ET C'EST UN RÉSULTAT** : testé sur les **77** noms du catalogue qui portent une parenthèse, leur **forme nue** retombe **déjà** juste. 👉 ***Les vrais trous ne sont pas dans le catalogue, ils sont dans l'ARGOT DE SALLE*** — ce qui confirme que la bonne source est la **feuille récoltée par ft-v1167**, pas la devinette. *La mesure a raccourci la liste au lieu de l'allonger.*

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun bouton n'apparaît, rien n'est à faire : on **empêche** l'app de fabriquer des doublons invisibles, et une recherche qui ne rendait rien rend le bon exercice. Même famille que ft-v1163 et ft-v1170 (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **les 5 exercices déjà créés chez Michel ne sont PAS réécrits** (**R29**) — il les fusionne à la main avec le crayon violet, et l'accent oublié ne le bloque plus. ⛔ **Ça ne rend pas « développé épaules guidé » automatique** : c'est ambigu, et ça doit le rester. ⛔ **Et la feuille de ft-v1167 n'est pas encore exploitable** : elle a **un jour**, et elle se lit dans le Sheet. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1013**, job `deploy` — **les 7 étapes** en `success`, « Déployer sur GitHub Pages » comprise, à **13:34:25 UTC** sur `9bd06017`. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés).

Tests : **parcours 3274/3274 sur l'arbre FUSIONNÉ avec la ft-v1171 de session-A** (+15, bloc **CCLXX**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⛔⛔ **CONTRÔLE NÉGATIF : 7 MUTATIONS, TOUTES MORDENT** — ① la clé revenue à `toLowerCase()` → **3 rouges** · ② le dédoublonnage de création non corrigé → **1 rouge, chirurgical** · ③ les 4 clés récoltées retirées → **3 rouges** · ④ un synonyme **AMBIGU** glissé dans la table → **2 rouges**, exactement les écartés · ⑤ une machine de cardio traitée comme un exercice → **1 rouge** · ⑥ une clé **trop agressive** (1ᵉʳ mot seulement) → **3 rouges**, dont la garantie de zéro collision · ⑦ la fusion manuelle revenue à `toLowerCase()` → **1 rouge**. ⚠️⚠️ **ET LA LEÇON DE MÉTHODE EST À MOI, TROUVÉE PAR LA MUTATION ②** : mon premier témoin **rejouait le dédoublonnage DANS le test** (`toCreate.find(x=>_cleNom(x)===low)`) au lieu d'appeler `finalImportProg`. **La mutation ne faisait rougir PERSONNE.** 👉 ***Un contrôle qui recalcule la formule qu'il vérifie est un vert qui ne peut pas rougir.*** Le témoin appelle désormais la vraie fonction de production et lit ce que l'app **écrit** dans `S.customExercises`. ⚠️ **Et une de mes attentes était fausse, pas le code** : j'avais écrit qu'« Squat » devait être connu du catalogue — il n'existe aucun exercice nommé exactement « Squat » (c'est « Squat à la Barre »), donc le témoin a été écrit sur « Marteau ». Fichiers : `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `BUGS.md`. sw.js ft-v1172. |

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
