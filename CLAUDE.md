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

> **Version actuelle : `ft-v1191`** (prochaine : `ft-v1192`). Historique complet (ft-v128→574 + gouvernance
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

**ft-v1191 — 🔢⚖️ L'AVERTISSEMENT kcal/macros ÉTAIT JUSTE ET HORS DE L'ÉCRAN · ET « PRODUIT SEC » SE DÉCLENCHAIT SUR UN MOT** — cas réel de Michel via GPT : **Lentilles Raynal & Roquelaure** (`3021690201123`), **410 g** → l'écran affiche **198 kcal** pour **25 P · 41 G · 13 L**, qui valent **381 kcal**.

**⭐⭐ CE QUE LA MESURE A DÉPLACÉ, ET C'EST TOUT LE SUJET : le contrôle de cohérence n'est NI absent NI muet.** Il se déclenche, ses deux seuils sont largement franchis (**183 kcal · 48 %**), il dit exactement ce qu'il faut et propose un bouton **« Mettre 381 kcal »** — donc **aucune correction silencieuse**, ce que Michel exigeait explicitement. 👉 *Le cahier demandait d'ajouter ce contrôle ; il existait déjà, avec sa formule 4/4/9 et ses tolérances.* (**R23** : vérifier avant d'affirmer qu'une chose manque.)

**⛔⛔ LE DÉFAUT EST UNE POSITION, PAS UN CALCUL** : la fiche fait **1 907 px** pour **775 visibles**, et l'alerte apparaît à `top 1734` — soit **1 132 px SOUS la zone visible**, pendant que le geste qui la déclenche (la pastille « paquet entier ») est tout en **HAUT**. Elle était atteignable en défilant, mais *un avertissement qu'on ne voit qu'en défilant ne protège que ceux qui défilaient déjà*. **C'est ft-v1182 sur un autre bloc** : calculé, correct, hors du champ de vision.

**⭐ R2/R13 — LA LOGIQUE N'EST PAS RECOPIÉE, ELLE EST SORTIE DE SA FONCTION.** Elle était **enfermée** dans `_afSuggVoir`, qui ne sait amener qu'**UN** élément. Michel : *« le mécanisme existe déjà ailleurs, il ne faut pas créer une nouvelle logique parallèle »*. Un seul propriétaire (`_amenerALaVue`), deux appelants — *un second `scrollIntoView` conditionnel aurait fabriqué deux règles de visibilité qui divergent, et c'est **toujours** la seconde qui oublie `visualViewport`*.

**⛔⛔⛔ ET LE CONTRÔLE NÉGATIF A TROUVÉ UN VRAI DÉFAUT QUE J'ALLAIS LIVRER.** En tapant **200/20/20/4** — une ligne **parfaitement COHÉRENTE à l'arrivée** — la saisie traverse un état **INTERMÉDIAIRE** incohérent : après le 2ᵉ champ, 200 kcal face à 80 théoriques dépasse les deux seuils. L'alerte s'affichait une fraction de seconde et **l'écran sautait AU MILIEU DE LA FRAPPE**, sur une ligne sans aucun problème. 👉 ***Le pire des deux mondes : le défaut disparaît, le dégât reste.*** D'où le garde sur le focus — si la personne tape dans l'un des quatre champs, elle **regarde son champ**, pas l'avertissement (**R24**).

**⚠️⚠️ ET UN TÉMOIN QUI MANQUAIT, ÉCRIT PARCE QUE LA MUTATION NE MORDAIT PAS.** Remplacer `visualViewport` par `innerHeight` rendait **0 rouge** : Playwright n'a **pas de clavier virtuel**, donc les deux valeurs sont égales ici et **aucun témoin ne pouvait distinguer les deux lectures** — *la consigne de Michel serait restée décorative*. Le témoin rétrécit désormais `visualViewport` de **350 px** : une alerte à `top 684` est « visible » selon `innerHeight` (844) et **cachée** sous le clavier (494). Elle remonte, et la mutation mord.

**🏷️ SECONDE MOITIÉ — « PRODUIT SEC » SUR UNE BOÎTE DE LENTILLES CUISINÉES.** Michel : *« pour une boîte prête à consommer, cet avertissement semble faux »*. ⛔ **Cause mesurée : une regex sur le NOM seul**, mot déclencheur **« Lentille »**, et **la règle ne contient aucun mot de cuisson** — elle ne pouvait pas voir le « Cuisinées » écrit juste à côté. *C'est la famille n°1 du dépôt, **le premier match gagnant*** (≥ 12 fois). Contre-épreuves : *riz cuit en sachet* · *poêlée de lentilles cuisinées* · *soupe de lentilles corail* · *salade de pois chiches* · *pâtes fraîches cuites* sortaient **tous** en SEC ; et *cassoulet aux haricots secs* restait **muet**, alors qu'il en contient.

**⛔⛔ ET LA DONNÉE QUI TRANCHERAIT N'ÉTAIT MÊME PAS DEMANDÉE** : `categories_tags` ne figurait dans **aucune** des deux requêtes Open Food Facts. *On ne peut pas reprocher à une règle d'ignorer la catégorie : personne ne la lui donnait* (**R8**). Elle est ajoutée aux **DEUX** requêtes — la fiche produit **et** la recherche par nom.

**⭐ DEUX SOURCES, DANS L'ORDRE VOULU PAR MICHEL** (*« je préfère ne pas rester sur une simple liste de mots »*) : la **catégorie** tranche quand elle parle, le **nom** reste le filet quand elle se tait — et elle se tait souvent. *Garder le nom n'est pas une faiblesse assumée : c'est le seul recours des produits que la base connaît mal.* **Ses 8 cas du §14 passent tous.**

**⭐⭐ L'ASYMÉTRIE EST VOULUE, ET ELLE SE MESURE AU COÛT DE L'ERREUR (R29)** : se taire à tort sur un vrai paquet sec coûte un facteur 2-3 **que la personne peut encore voir** (les chiffres sont à l'écran) ; crier à tort sur une conserve coûte la **crédibilité de TOUS les avertissements**, y compris les vrais. *Un message qui se trompe cesse d'être lu, et on perd alors les deux.*

**⛔ R15 — LA CATÉGORIE MEURT AVEC L'ALIMENT.** Sans ça, le « plat cuisiné » d'un produit ferait taire l'avertissement du **paquet de pâtes suivant** — le défaut exact que `_afOublierAliment` existe pour empêcher. Un témoin le fige.

**⚠️⚠️ ET UN TÉMOIN À MOI A ROUGI EN PASSE COMPLÈTE EN PASSANT 5/5 EN ISOLÉ — la cause était MA SONDE.** Le défilement de contrôle est **`smooth`**, donc **asynchrone** : un délai fixe suffit sur une machine au repos et pas sous charge, et je remettais `scrollTop` à zéro **pendant qu'il était encore en vol**. 👉 ***Un témoin qui parie sur une DURÉE mesure la machine ; un témoin qui attend une CONDITION mesure le produit.*** Il attend désormais la stabilité, et son **diagnostic reste dans la sortie** — *un témoin qui échoue sans dire ce qu'il a vu coûte une passe entière par hypothèse*.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun bouton n'apparaît : un avertissement qui existait déjà devient **visible**, et un autre cesse de crier à tort (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **ça ne choisit PAS entre 48,3 et 381** — les deux viennent de la **même fiche** Open Food Facts et aucun n'est absurde isolément ; le bouton reste la bonne réponse, l'app montre et la personne tranche (**R29**, demande explicite de Michel). ⛔ Ni le bug quantité, ni l'historique corrompu, ni la migration, ni les portions P1 — *son périmètre du §15, respecté*. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

**⚠️⚠️ DEUX LIMITES DITES PLUTÔT QUE TUES** : ① **les étiquettes de catégorie n'ont PAS pu être confrontées à la vraie base** — `openfoodfacts.org` répond **403 au CONNECT** depuis ce conteneur (vérifié dans l'état du proxy). Elles sont volontairement **larges**, et le repli par le nom couvre **à lui seul** les huit cas. ② **L'origine du 48,3 reste non tracée** : deux champs suffiraient (`energy-kcal_100g` existe-t-il ? sinon que vaut `energy_100g` ?), et il faut un téléphone pour les lire.

Tests : **parcours 3524/3524 sur l'arbre FINAL** (+11, bloc **CCLXXXVIII**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⛔ **CONTRÔLE NÉGATIF : 10 MUTATIONS, TOUTES MORDENT**, chacune sur son propre témoin — ① le correctif entier retiré · ② le garde « déjà affiché » retiré · ③ le garde du **focus** retiré · ④ `innerHeight` au lieu de `visualViewport` · ⑤ `_afSuggVoir` qui reprend sa propre copie (R2) · ⑥ le garde « déjà prêt » retiré (retour au premier match gagnant) → **2 rouges** · ⑦ la catégorie ignorée · ⑧ le nom ignoré · ⑨ la catégorie qui survit à l'aliment suivant · ⑩ `categories_tags` retiré des requêtes.

Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/BUG-KCAL-MACROS.pdf`, `tools/gen_kcal_macros_pdf.py`. sw.js ft-v1191. |

**ft-v1190 — ⚖️ LE GARDE-FOU LARGE, ET LA PASSE QUE J'AI FAUSSÉE MOI-MÊME** — Michel tranche la question ouverte de ft-v1189 : ***« Aucune ligne alimentaire ne peut être enregistrée sans une quantité réellement choisie par l'utilisateur »***, **indépendamment de l'origine technique de l'aliment**.

**⭐⭐ SA RAISON VAUT PLUS QUE LA DÉCISION, ET ELLE EST ARCHITECTURALE** : *« je préfère une règle métier unique à huit comportements différents »*. L'option étroite aurait donné `scan → une règle · CIQUAL → une autre · reprise → une autre · IA → une autre` — ***c'est-à-dire exactement les frontières techniques qui ont déjà produit plusieurs familles de bugs dans ce dépôt***. C'est **R19** énoncé par lui : *une section coûte zéro, une frontière coûte cher.*

**⛔ AUCUNE LIGNE DE PRODUCTION NE CHANGE** : le garde-fou couvrait **déjà** les huit portes qui posent `_bcNutr` (`_lookupBarcode` · `_calAppliquer` · `onFoodLabelFile` · `quickFillFood` · `_afSuggPrendreMarque` · `_afSuggPrendreCiqual` · `_afSuggPrendreLocale` · `_afSuggPrendreOff`). *La décision confirme le code au lieu de le corriger.*

**⚠️⚠️ SAUF UN COMMENTAIRE — LE MIEN, ET IL ÉTAIT FAUX.** Celui du garde-fou annonçait ⛔ *« N'IMPACTE QUE LE BLOC SCAN »* et citait nommément **l'estimation IA comme NON concernée** — alors que `_calAppliquer` pose bien `_bcNutr`. 👉 ***Un commentaire qui annonce une portée plus étroite que le code est pire qu'un commentaire absent : il dispense le lecteur suivant d'aller vérifier*** (**R23** appliqué au code). ⭐ Et le cas retourne l'argument : cette porte pose `serving_quantity:0` et affiche **déjà** *« tape ta quantité »* — le refus ne lui ajoute rien, il rend vraie une phrase qu'elle disait déjà.

**⭐⭐ 23 TÉMOINS, PAS 19** — mon chiffre ne couvrait que la passe parcours ; **4 autres** vivaient dans `tests/calculs`, même cause. Deux familles, **zéro vraie régression** :

| famille | combien | ce qu'on fait |
|---|---|---|
| **A — le geste a changé** | **16** | on ajoute la frappe ou le clic. ⛔ **Aucune valeur attendue ne bouge** — sa consigne mot pour mot : *« modifier le geste ; NE PAS affaiblir les assertions »* |
| **B — comportement périmé par lui** | **7** | le témoin figeait **le pré-remplissage lui-même**. Il se réécrit, en disant **qui a décidé et quand** |
| **C — vraie régression** | **0** | le seul candidat sérieux **écarté par la mesure** : `p.per100` (app.js @1170) est écrit **indépendamment** du drapeau |

**⭐⭐ LA GARANTIE NE SE SUPPRIME PAS, ELLE SE DÉPLACE — le bloc CCXIV est le cas d'école, parce que c'est ft-v1105 que Michel vient de PÉRIMER** (elle avait tranché ⛔ *« on ne retire pas le pré-remplissage : on le NOMME »*). *« Le nombre pré-rempli dit d'où il vient »* devient *« la **PASTILLE** le dit, et le champ est vide »* · *« il invite à vérifier ta dosette »* devient *« il **DEMANDE** au lieu d'affirmer »* · *« il dit que 100 g est un DÉFAUT »* devient *« il **n'invente RIEN** »*. ⭐ **Et les deux chiffres de sa capture — 155 kcal et 35 g — sont INCHANGÉS au caractère près** : ils s'obtiennent par un clic. ⭐ Sur CCLXXII et CCLXXVII la garantie est même **plus forte** : *« le champ ne vaut pas 250 »* tolérait un **100** que personne n'avait choisi ; *« le champ est VIDE »* ne tolère plus rien.

**⭐ LE POINT DÉLICAT EST UN ORDRE, PAS UNE VALEUR** : dans CII, le geste doit venir **AVANT** la correction manuelle des macros. Après, le recalcul depuis le pour-100 g écraserait le « 29 » — et le témoin d'en dessous mesurerait **l'inverse de ce qu'il dit**. *L'ordre des gestes fait partie du témoin, pas du décor.*

**⭐ J'AI MESURÉ MOI-MÊME SA CONTRAINTE D'UX** (*« je ne veux pas transformer Force Tracker en formulaire administratif »*) : la reprise « Mes aliments » tient en **UN SEUL TAP** — champ vide, pastille *« ↩ 150 g (la dernière fois) »*, un tap, enregistré.

**⛔⛔⛔ ET LE VRAI SUJET DE CETTE VERSION EST AILLEURS : J'AI FAUSSÉ MA PROPRE PASSE.** Elle a rendu **5 rouges** dans le bloc CII… **qui passe en isolé**. J'ai failli conclure qu'option A cassait quelque chose de réel, donc **« réparer » du code sain**.

**⭐ CE QUI L'A ÉVITÉ N'EST PAS UNE INTUITION — tester du moins cher au plus cher** : le bloc seul **6 fois → 6 verts** (pas instable) · **toute la passe rejouée jusqu'à lui → 1310 ✅ · 0 ❌** (pas l'état accumulé) · les 3 fonctions suspectes **lues dans le code** → toutes **synchrones**, et les 12 remises à zéro du drapeau sont **directes** (pas une course) · puis **les horodatages**, qui donnent la cause.

**⛔⛔ LA CAUSE, ET ELLE EST DE MOI** : **16:21:05** la passe démarre · **16:27:10** je **mute `index.html`** pour vérifier qu'un autre correctif mord (je retire `_bcQtyPose=true` du `oninput`) · **~16:29** la passe atteint CII · **16:39:57** elle finit, le fichier étant restauré depuis longtemps — d'où des blocs suivants **tous verts**. 👉 **Le serveur du banc relit le fichier à CHAQUE requête** (`fs.createReadStream`) : le contexte créé par CII a reçu **la version cassée**. *C'était exactement ma mutation ④, celle qui fait 12 rouges quand on la lance exprès.*

**⭐⭐ CE QUI REND LA FAMILLE VICIEUSE (`BUGS.md` §60, nouvelle)** : modifier les fichiers de **TEST** pendant une passe est **sans danger** (Node les lit une fois au démarrage). L'habitude est donc bonne, elle ne fait jamais de dégât… et **elle rend le piège invisible** le jour où on touche un fichier **servi à l'app**. ⛔ **La règle** : pendant une passe, aucun fichier servi ne bouge ; le contrôle négatif se fait **avant ou après, jamais pendant**. ✅ **CONFIRMÉ PAR LA MESURE** : la passe relancée sans rien toucher rend **3513 ✅ · 0 ❌**.

**⚠️ ET JE L'AI REFAITE EN PLUS PETIT DANS L'HEURE** — générateur de PDF et document écrits **pendant** la passe suivante. Vérifié après coup qu'aucun témoin ne les lit (celui qui scanne `tools/` ne retient que les générateurs contenant `.xlsx`), *mais la vérification vient après le geste, ce qui est l'ordre inverse du bon.*

**⭐ LE TÉMOIN EN EST SORTI MEILLEUR** : il rendait « faux » sans dire ce qu'il avait vu. Il rend désormais l'état du drapeau, du champ, du bloc et du nom. *Un témoin qui échoue sans dire ce qu'il a vu coûte une passe entière par hypothèse.*

**⚠️ UNE ERREUR DE SONDE, DITE PLUTÔT QUE TUE** : en mesurant la reprise, ma sonde a annoncé une dérive de **1 kcal** (251 au lieu de 250). Remesuré sur trois fixtures — avec un `per100` **exact**, reprendre à la même quantité ne change **RIEN** (200 → 200, 300 → 300). Ma fixture écrivait **167** là où la vraie valeur est **166,67** : *le code calculait juste depuis une référence que j'avais arrondie moi-même.* C'est le **plancher des totaux entiers** de ft-v1188, vu par l'autre bout. Écartée avec sa raison (**R30**).

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change dans cette version : le champ vide et les trois pastilles sont **déjà** l'annonce, livrés avec le code (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **l'historique abîmé n'est PAS touché** (chantier à part : backup · essai à blanc · rapport · retour arrière) · ⛔ **l'UNITÉ de la portion reste inconnue** — l'app demande `serving_quantity` à Open Food Facts, **jamais `serving_size`**, donc sur un liquide la pastille affiche « 250 g » pour ce qui peut être 250 ml ; *ce n'est pas une régression* (le champ pré-rempli faisait la même hypothèse **en silence**), et c'est un **sujet séparé** à sa demande · ⛔ ni cru/cuit, ni le journal du jour avec « 2 steaks », ni la provenance du `per100`, ni Milo, ni les programmes, ni les débriefs. ⚠️ **Michel doit vérifier sur Safari/iPhone** (les trois pastilles, le champ vide, la reprise en un tap).

Tests : **parcours 3513/3513 sur l'arbre FINAL**, **calculs 339/339** (elles portaient 4 des 23 témoins), muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⛔ **CONTRÔLE NÉGATIF : 6 mutations** — ② le champ redevient pré-rempli → **5 rouges**, exactement les 5 témoins du champ vide · ③ la pastille de portion retirée → **3**, exactement CCXIV · ④ la frappe qui ne lève plus le drapeau → **12**, exactement la famille A (*donc les témoins tapent pour de vrai au lieu de poser le drapeau à la main*) · ⑤ l'ancienne formulation de l'écran → **3**, dont un témoin de ft-v1114 qui interdisait **déjà** le mot « dosette » (R14). ⚠️ **Deux mutations ne mordent pas sur ces blocs, et je dis pourquoi** : ① le garde-fou retiré → **0**, *attendu* puisque ces blocs ont tous un geste désormais ; ⑥ le clic de pastille qui ne lève plus le drapeau → **0 ici**, parce qu'aucun de ces 6 blocs n'ENREGISTRE après un clic. ⭐ **Les deux sont couvertes par le bloc CCLXXXVII, et je l'ai VÉRIFIÉ au lieu de le supposer** : la ⑥ y fait **3 rouges**, exactement les trois témoins de clic.


✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1073**, `conclusion: success` à **19:08:12 UTC** sur `e066bd78`. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés).
⚠️⚠️ **ET IL A FALLU DÉBLOQUER LA FILE — UN RUN ÉTAIT COINCÉ DEPUIS 5 H 30, EN SILENCE.** Le run **#1072** (mon push de 13:34) avait son job `deploy` en **`waiting`** depuis `13:34:56`, et il bloquait tous les suivants : le mien restait en `pending`, horodatage **figé**. ⭐ Son commit `6fdd0661` étant **entièrement contenu** dans `e066bd78`, l'annuler ne perdait rien — il aurait seulement déployé un état plus ancien. **Effet mesuré dans la minute** : `pending` → `queued`, `updated_at` reparti (19:04:55 → 19:07:42), puis vert. 👉 *C'est encore la famille « déploiement silencieux » : rien ne prévient, et on ne le voit qu'en allant regarder.* ⛔ **Et ce n'est PAS la manœuvre interdite** — on n'a ni relancé les jobs échoués ni touché au workflow (leçon ft-v1090) : on a **retiré de la file un run périmé**.
⚠️ **Limite dite** : le proxy de ce conteneur refuse `github.io` (403), donc je **ne peux pas** lire le `sw.js` réellement servi. La vérification s'arrête à l'API — *le run est vert, l'app affichant ft-v1190 reste à confirmer par Michel.*

Fichiers : `app.js` (un commentaire), `tests/parcours/runner.js`, `tests/calculs/runner.js`, `.gitignore`, `sw.js`, `CLAUDE.md`, `BUGS.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-ARCHIVE.md`, `docs/GARDE-FOU-LARGE-ET-LA-PASSE-FAUSSEE.pdf`. sw.js ft-v1190. |

**ft-v1189 — 🔗📊 RENOMMER UN EXERCICE DANS UNE SÉANCE PASSÉE : UN RECORD ORPHELIN, ET UN GRAPHIQUE QUI CONTREDISAIT L'ÉCRAN** — Michel, en cherchant le bouton que je venais de livrer : ***« je ne trouve pas dans choisir un exercice tirage vertical »***.

**⭐⭐ MESURÉ, ET C'EST MOI QUI L'AVAIS ENVOYÉ AU MAUVAIS ENDROIT.** Il n'a **plus** d'exercice perso « Tirage vertical » — il les avait déjà remplacés. *Vérifié dans la page* : s'il en avait un, il sortirait **en tête** du sélecteur dès qu'on tape « tirage vertical ». Le nom ne vit plus que dans sa **séance du 9 sept**. 👉 **Mon bouton de ft-v1187 ne pouvait pas l'atteindre** : il ne travaille que sur `S.customExercises`.

**⭐ LE BON GESTE EXISTAIT DÉJÀ, ET IL ÉTAIT SUR L'ÉCRAN DE SA CAPTURE** : le **🔄** de la carte → `replaceSessEx` → `_replaceSessExPick` → **💾 Enregistrer**. Conduit de bout en bout : **séries gardées, volume inchangé (1220), record 81,4 kg créé sous le bon nom**.

**⛔⛔ MAIS IL LAISSAIT UN RECORD DERRIÈRE LUI.** `S.prs['Tirage vertical']` restait **intact** — donc un exercice **fantôme** continuait d'apparaître dans **Progrès**, avec un record dedans, alors que **plus aucune séance ne le portait**. 👉 **C'est R8 pour la 9ᵉ fois** : la porte jumelle (`_renameExEverywhere`, chemin exercice perso) déplace le record **depuis toujours** ; celle-ci, non.

**⛔⛔ ET LE CORRECTIF NE POUVAIT PAS ÊTRE « SUPPRIMER L'ANCIEN RECORD »** : le nom peut vivre dans **d'autres** séances — on n'en renomme qu'une. On ne déplace donc **que si plus aucune séance ne le porte** (**R29** : le coût de l'erreur est ici une **perte de donnée silencieuse**). Un témoin dédié fige ce garde-fou.

**⭐ AUCUNE RÈGLE NOUVELLE (R2/R13)** : on applique **celle de `_renameExEverywhere`** — garder le meilleur 1RM, puis supprimer la source. Mesuré : cible déjà à **120 kg** → elle n'est **pas** écrasée par les 81,4.

**⚠️⚠️ ET LE CONTRÔLE NÉGATIF A TROUVÉ UN VRAI DÉFAUT QUE J'ALLAIS LIVRER.** Trois de mes sept mutations ne mordaient pas. En cherchant pourquoi — au lieu de conclure à du code décoratif — **le repli des chaînes s'est révélé nécessaire, et mon témoin incomplet** : sur *A→B→C*, un traitement séquentiel déplace d'abord le record de A vers **B**, puis celui de **B** vers C. Si **B avait déjà un record à lui** (un orphelin d'avant), ***ce record-là partait avec***. Mon cas ④ ne le voyait pas parce que B n'avait rien. Cas **④bis** écrit — B porte 90 kg — et la mutation mord chirurgicalement : sans repli, les 90 kg de « Tirage Nuque » atterrissaient sur le lat pulldown.

**⛔ ET DEUX AUTRES « PROTECTIONS » ONT ÉTÉ MESURÉES INUTILES, DONC UNE A ÉTÉ RETIRÉE.** J'avais posé la remise à zéro des renommages **à l'ouverture ET à la fermeture** : chacune neutralisée seule, **0 rouge** — *elles se couvraient l'une l'autre*. La seconde est retirée (**R19**). ⚠️ **Et je dis ce que la mesure dit vraiment** : même celle qui reste **n'a aucun cas d'échec atteignable**, parce que le garde `encoreLa` fait déjà le travail — une séance fermée sans enregistrer porte encore l'ancien nom. Elle reste pour qu'une fenêtre s'ouvre **toujours** propre, **pas parce qu'un témoin l'exige** — c'est écrit dans le code. *Le contraire de ft-v1180, où j'avais failli retirer une vraie protection : ici j'ai cherché le cas, et il n'existe pas.*

**📊 ET LA SECONDE MOITIÉ VIENT DE MICHEL, UNE HEURE PLUS TARD : « ON A UNE PERTE D'HISTORIQUE ».** Capture à l'appui : il vient de taper le 🔄, la carte affiche « Tirage Poulie Haute (Lat Pulldown) », et le 📊 ouvert **depuis cette carte** montre 5 séances **sans la sienne du 9 sept**.

**⛔⛔ MESURÉ DANS SON PROPRE EXPORT — RIEN N'ÉTAIT PERDU.** Ses deux séries y sont, intactes : `2026-09-09 · Tirage vertical · 61 kg × 10` ×2, et la séance entière (Larsen 6 séries · Tirage 2 · Épaules 2 · Machine Oiseau 3 · 9 min de cardio). *L'export portait encore l'ANCIEN nom* — donc il n'avait pas encore tapé 💾 Enregistrer.

**⭐⭐ LA CAUSE EST UNE SOURCE, PAS UN CALCUL** : `_getExHistory` lit **`S.sessions`** (l'état ENREGISTRÉ) pendant que la carte qu'il regarde vit dans **`_sessEdits`** (l'état EN COURS D'ÉDITION). Le graphique était donc **exact** et **contredisait l'écran**. 👉 ***Un chiffre qui contredit l'écran est indiscernable d'une perte de données*** — et c'est exactement la conclusion qu'il en a tirée, à juste titre.

**⛔ ON NE MÉLANGE PAS LES DEUX SOURCES** : afficher l'édition non enregistrée dans une courbe d'historique fabriquerait un point qui n'existe pas encore (**R2**). On **DIT ce qui manque** — bandeau orange, avec **la date nommée** : *« Ta séance du 9 sept n'est pas encore enregistrée — elle n'apparaît donc pas dans cette courbe. Tape 💾 Enregistrer pour l'y voir. »* (**R29** : informer sans décider.)

**⛔ ET IL SE TAIT PARTOUT AILLEURS** — hors fenêtre de séance · fenêtre ouverte sans rien changer · sur un **autre** exercice que celui renommé. *Un avertissement permanent cesse d'être lu* (**R24/R25**). Trois témoins le figent.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun bouton n'apparaît : un record fantôme cesse d'apparaître (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **ça ne renomme rien tout seul** — c'est toujours la personne qui tape 🔄 puis Enregistrer. ⛔ Ni l'import, ni le rapprocheur, ni `_EX_EQUIV`, ni le bouton de ft-v1187 ne sont touchés. ⛔ **Et un exercice SUPPRIMÉ d'une séance passée laisse toujours son record** — c'est une **troisième** porte, non traitée ici, et je préfère l'écrire que la laisser se découvrir (**R30**). ⚠️ **Michel doit vérifier sur Safari/iPhone.**

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1064**, `conclusion: success` à **10:50:01 UTC** sur `7ec189ef`. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés). ⚠️ *Et l'API a de nouveau servi un état PÉRIMÉ* — la liste filtrée `status: completed` ignorait encore le run alors qu'il était clos ; c'est **`get_workflow_run` sur l'ID** qui a rendu l'état frais. 👉 **La leçon de ft-v1182 s'inverse selon les jours : ce n'est pas UNE requête qui est fiable, c'est d'en croiser DEUX.**

Tests : **parcours 3495/3495 sur l'arbre FINAL** (+14, bloc **CCLXXXVI**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⭐ **Le témoin CONDUIT le vrai chemin** (`openSessDetail` → `replaceSessEx` → le choix → `saveSessEdits`), jamais `_deplacerRecordsRenommes` en direct — *vérifier la fonction n'est pas vérifier l'appel* (`BUGS.md` §58). ⛔ **CONTRÔLE NÉGATIF : 9 mutations, TOUTES MORDENT** — ① le correctif entier retiré → **3 rouges** · ② le garde-fou « le nom vit ailleurs » retiré → **1**, exactement lui · ③ on écrase le record de la cible sans comparer → **1** · ④ le repli de chaîne retiré → **1**, exactement le cas ④bis · ⑤ le renommage plus noté du tout → **3** · ⑥ le bandeau non affiché → **1** · ⑦ le bandeau qui ne regarde plus QUEL exercice → **1**, exactement le témoin du silence · ⑧ le bandeau qui ne vérifie plus la séance ENREGISTRÉE → **2** · ⑨ la date retirée du bandeau → **1**.

**⚠️ UNE ERREUR DE SONDE À MOI, DITE PLUTÔT QUE TUE** : ma 1ʳᵉ mesure passait `openSessDetail(0)` — or elle prend le **ts/id**, pas l'index. Le renommage ne se produisait donc **pas**, et j'ai failli conclure que le chemin 🔄 était cassé. 👉 ***Un test qui n'emploie pas la signature de la production ne teste rien*** — la même famille que le `cardio.min`/`duration` de ft-v1184.

Fichiers : `setup.js`, `log.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1189. |

**ft-v1188 — 🔬 LES 3 VÉRIFICATIONS DE GPT AVANT VALIDATION DE P1 — DEUX TROUS RÉELS SUR TROIS, ET LE TROISIÈME DÉMONTRÉ SAIN** — cahier de GPT transmis par Michel : ***« je veux mesurer trois points précis. Ne touche à rien d'autre. »*** **Mesuré avant la moindre ligne de code, sur les trois.**

**⛔⛔ ① CORRIGER `portionWeightG` APRÈS COUP — LE DOC P1 DISAIT « CHEMIN NON TESTÉ » ; MESURÉ, IL N'EXISTAIT PAS.** Aucun champ de l'écran d'édition ne touchait `portionLabel` ni `portionWeightG`. **Et pire** : ouvrir « 2 steaks de 125 g » affichait ***« Quantité (g) = 250 »***, et **enregistrer SANS RIEN TOUCHER** réécrivait la ligne en **`q:250, u:'g'`**.

👉 ***C'est mot pour mot ce que Michel refuse au point ② de ses décisions*** — *« on perd alors l'information 2 steaks »* — et `portionLabel`/`portionWeightG` **survivaient à côté d'un `u:'g'`** : deux sources qui se contredisent.

**⛔⛔⛔ ET C'EST LA JUMELLE DE ft-v1186, RESTÉE OUVERTE.** J'avais corrigé *« le pour-100 g ne décide plus de l'unité »* sur les **deux** portes de l'écran d'**ajout**, avec témoin de non-régression et 15 mutations. **L'écran d'ÉDITION faisait exactement la même chose, dans la même version, à 900 lignes d'écart.** ⚠️ **Cette famille ne se voit NI à la relecture NI au banc d'essai** : le code corrigé est juste, les témoins verts le méritent, le contrôle négatif mord — *tout ce qui mesure dit vrai, et la moitié du bug est encore là.* **8ᵉ fois recensée** → nouvelle famille **`BUGS.md` §59**.

**⭐⭐ LE POINT DÉLICAT DU CORRECTIF, ET C'EST LUI QUI VALAIT LA MESURE** : redériver le pour-100 g **toujours** écraserait celui d'un produit **scanné** dès qu'on touche au poids (**R32** : mesuré > estimé > déclaré) ; ne **jamais** redériver laisserait un pour-100 g calculé pour 125 g survivre à un passage à 150 g — ce que GPT interdit. 👉 ***On ne devine pas, on vérifie*** : un pour-100 g dérivé vaut, **par construction**, `totaux × 100 / (q × poids)`. On refait le calcul avec l'**ancien** état ; s'il retombe dessus, il en venait, donc il suit. Sinon il vient d'ailleurs et **on n'y touche pas**. *C'est la redondance interne du document — l'idée de **R33** pour les bilans de balance, appliquée ici.* **Mesuré : 125 → 150 donne 166,7 / 13,3 / 0 / 12, la valeur exacte, `q=2` · `u=portion` · label intacts.**

**⭐ ② DEUX FAVORIS DE MÊME NOM : LE DOUBLON EST IMPOSSIBLE À CRÉER, ET C'EST MESURÉ PAR LA VRAIE PORTE.** `toggleFavFood` cherche `name.toLowerCase()` et **retire** au lieu d'ajouter quand il trouve — trois clics d'étoile donnent **1 favori, puis 0, puis 1**, casse comprise ; et une restauration cloud **remplace** la liste en bloc au lieu de concaténer. *Le nom EST l'identité d'un favori ici, par construction.* Le favori ne porte **aucun** autre identifiant (mesuré : pas de `sourceId`) — inventer un identifiant pour un cas que l'app ne sait pas produire serait du code sans producteur (**R3**).
⛔ **MAIS `.find()` REND LE PREMIER** : si l'état arrivait quand même, modifier A écrivait sur B (**mesuré** : 150 g atterrissaient sur le mauvais produit). On **refuse d'agir sur une identité ambiguë** plutôt que d'agir sur la mauvaise ligne (**R29**) — une ligne, un témoin.
**⭐ ET LE POINT ② A DÉCOUVERT AUTRE CHOSE** : le favori **ne suivait pas** une définition corrigée depuis l'édition (`_majDefFavori` n'était appelée qu'à l'**ajout**) — *la vieille copie silencieuse que ft-v1186 voulait justement empêcher*. La porte jumelle, encore (**R8/R13**) : aucun mécanisme neuf, **un appel**. Ses macros restent intactes (décision ⑤).

**⭐ ③ LA PRÉCISION DU `per100` : AUCUNE DÉRIVE CUMULATIVE, ET C'EST DÉMONTRÉ** — 10 cycles de reprise réels, chiffres **identiques au caractère près**, parce que le pour-100 g se redérive toujours des **TOTAUX**, jamais de lui-même. *C'est un point fixe, pas une cascade.*
⛔⛔ **Mais l'arrondi ENTIER coûtait cher EN AVAL** : 1 part de 140 g valant 355/30/44/6 donne un pour-100 g exact de **253,6 / 21,4 / 31,4 / 4,3** ; arrondi entier, les lipides tombent à **4**, et redemander 280 g affichait **11 g de lipides au lieu de 12 — −8,3 %**.
⭐⭐ **LA CORRECTION EXISTAIT DÉJÀ ET N'ÉTAIT PAS POSÉE ICI** : `_per100d1` (une décimale) sert **7 portes** depuis ft-v1170 — Open Food Facts, CIQUAL, marques, étiquette photo, scan — et les **deux** pour-100 g **dérivés** de `_provFood` étaient restés en `Math.round`. **La 8ᵉ porte, même famille §59.** ⭐ Et ça ne change **rien à l'écran** : `_qtyRescale` arrondit déjà les 4 champs à l'entier.

**📣 RÈGLE D'OR #11 — RIEN À FAIRE.** Aucune pop-up, aucun point rouge : deux champs **facultatifs** apparaissent dans l'écran d'édition d'une portion, *là où on va justement pour corriger* (**R24/R25**). ⛔ **Pas de puces ici, exprès** : les puces existent parce qu'on saisit un repas tous les jours ; corriger une définition est un geste **rare et délibéré**, et le nom est déjà rempli (**R19**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ les lignes déjà abîmées **ne sont pas réparées**, la migration des 17 jours reste **intacte** · ⛔ ni cru/cuit, ni recherche CIQUAL, ni `alias.json`, ni scan, ni **I4**, ni `visualViewport`, ni Milo, ni programmes, ni débriefs de séance — *le périmètre interdit de GPT, respecté* · ⛔ le journal du jour n'affiche toujours **aucune** quantité (chantier ⑥, décidé séparé).
**⚠️ ET 4 TROUS RESTENT OUVERTS, ÉCRITS DANS `docs/JOURNAL-DE-TEST.md` PLUTÔT QUE TUS** : une ligne **sans aucune quantité** ne peut toujours pas recevoir de définition (l'état « boutons » de l'édition — **non élargi exprès**) · une étiquette fausse ne se retire que par l'édition · **la tolérance de 0,6 est un CHOIX**, qui ne sera propre que le jour où le `per100` portera sa **provenance** (**R33** la demande déjà) · et l'affichage de la quantité. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

**⚠️ ET UN PIÈGE DE FIXTURE QUI M'A FAIT CONCLURE TROP VITE, DIT PARCE QU'IL RESSERVIRA** : ma première mesure du point ② annonçait « impossible de créer deux favoris » — **vrai, mais pour la mauvaise raison**. `toggleFavFood` finit par `_renderFoodQuickList()`, qui **reconstruit `_afQuickItems`** : ma liste posée à la main était écrasée et **mon 2ᵉ clic tapait dans le vide**. 👉 *Un test qui n'emploie pas le schéma de la production ne teste rien, il rassure.* Refait en reposant la fixture avant chaque clic — la conclusion tient, la mesure aussi.

**⚠️ COLLISION DE BLOC RÉGLÉE AU PASSAGE** : mon bloc ft-v1186 portait **CCLXXXI**, déjà pris par ft-v1184 de session-B, **qui l'avait signalée**. Convention du dépôt — *la première publiée garde le numéro* → le mien passe en **CCLXXXIV**. ⛔ Aucun témoin touché, **seulement son étiquette**.

**⚠️⚠️ ET LA PASSE COMPLÈTE A ROUGI SUR TROIS TÉMOINS PLUS ANCIENS — TOUS LES TROIS FIGEAIENT `Math.round`, PAS LEUR GARANTIE.** Un de ft-v1051, deux de ft-v1162. ⭐⭐ **Et le cas de ft-v1162 est le plus délicat de la version, parce que la décimale y a l'air MOINS précise** : la reprise à 180 g affiche **129** au lieu de **130**. Mesuré, chiffre par chiffre — vérité d'origine **129,79** · ce que l'app **stocke** : **79 kcal pour 110 g** (les totaux sont des **entiers**) · depuis cette donnée : **129,27** · chemin entier **129,60 → 130** · chemin décimal **129,24 → 129**. 👉 ***Le 130 venait d'une erreur d'arrondi qui pointait dans le bon sens.*** L'app ne **peut plus** connaître 129,79 : le 79 a été arrondi **avant** d'être écrit. **129 est la seule réponse juste au regard de la donnée.** ⛔ **Les interdits que ces témoins figent — 249, 448, 780 — n'ont pas bougé d'un pouce**, et les trois ont été **ÉPROUVÉS** : la mutation qui rétablit le défaut d'origine les fait rougir. *La différence entre une mise au point et un assouplissement se mesure, et je l'ai mesurée.* ⭐ **Au passage, la mesure a nommé une limite plus profonde que celle que GPT visait** : *le vrai plancher de précision n'est pas le pour-100 g, ce sont les TOTAUX ENTIERS* — écrit dans `docs/JOURNAL-DE-TEST.md`, chantier à part. ⚠️ **À savoir si Michel compare deux copies d'écran** : une même ligne reprise peut afficher **1 kcal de moins** qu'avant.

Tests : **parcours 3481/3481 sur l'arbre FINAL** (+18, bloc **CCLXXXV**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⛔⛔ **CONTRÔLE NÉGATIF : 13 MUTATIONS, TOUTES MORDENT, chacune chirurgicalement** — l'unité volée par le pour-100 g → **8 rouges** · la branche grammes qui reprend la main → **10** · les deux champs retirés → **6** · le pour-100 g qui ne suit plus → **2** · ⭐ la redérivation **à l'aveugle** → **1**, exactement le scan protégé · le refus d'agir sur une identité ambiguë retiré → **1** · le favori qui ne suit plus l'édition → **1** · l'arrondi entier côté portion → **1** · côté grammes → **1** · la frappe qui ne met plus à jour la définition → **1** · les macros du favori écrasées → **1** · le poids retiré qui laisse un pour-100 g orphelin → **1** · la définition non hydratée à l'ouverture → **4**.

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1060**, `conclusion: success` à **08:52:22 UTC** sur `fb392db4`. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés). ⭐ *Lu sur la liste filtrée `status: completed`* — la leçon de ft-v1182.

Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `BUGS.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-DE-TEST.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1188. |

**ft-v1187 — 🔗 RATTACHER UN EXERCICE PERSO AU CATALOGUE EN UN GESTE — L'APP SAVAIT LA RÉPONSE ET NE LA PROPOSAIT PAS** — Michel, capture de sa séance du 9 sept : ***« Tirage vertical c'est pas bon non plus »***.

**⭐⭐ MESURÉ AVANT DE CODER, ET LE RAPPROCHEUR N'EST PAS EN CAUSE.** `_matchExercise('Tirage vertical')` rend **« Tirage Poulie Haute (Lat Pulldown) » à 95 %, via « équivalence connue »** — c'est **ft-v1170, livrée le 08/09**. Son programme a été importé **avant**, donc le nom est figé dans son historique. 👉 *L'app ne réécrit pas le passé toute seule* (**R29**), et c'est voulu.

**⛔⛔ LE VRAI TROU EST DANS LA RÉPARATION, PAS DANS L'IMPORT.** La fusion existe depuis longtemps — `_saveCustomExEdit` → `_mergeCustomInto` → `_renameExEverywhere`, qui déplace **séances + records + programmes + séance en cours** — mais elle n'est atteinte que si le nom retapé tombe **PILE** sur un nom du catalogue. Or `_normEx` **aplatit** la ponctuation sans la supprimer :

| ce qu'on tape | clé obtenue | fusion ? |
|---|---|---|
| `Tirage Poulie Haute (Lat Pulldown)` | `tirage poulie haute lat pulldown` | ✅ |
| **`Tirage Poulie Haute`** (la forme naturelle) | `tirage poulie haute` | ⛔ **aucune** |

👉 ***Taper la forme naturelle ne fusionne rien : ça renomme le fantôme, et on en a DEUX.*** Sur un téléphone, avec un « (Lat Pulldown) » à écrire de mémoire. Et l'écran d'édition n'avait **aucun** bouton de rattachement — mesuré : 5 contrôles, le mot `rattach` absent du HTML.

**⭐ ON N'INVENTE NI MÉCANISME NI SEUIL (R13/R2).** La fusion est **celle qui existait** ; et *« est-ce assez sûr ? »* a **déjà un propriétaire** — le `tier` de `_matchExercise`. On propose **exactement** quand l'import aurait rattaché tout seul (`tier==='auto'`), jamais dans la zone grise.

**⛔⛔ ET LA ZONE GRISE RESTE MUETTE, C'EST LE GARDE-FOU DE LA VERSION** : « développé épaules guidé » — **le cas ambigu de Michel** en ft-v1172 — sort à **67 % / `confirm`**, et le bandeau ne dit rien. *Si l'expert hésite, l'app se tait* (**R29**). Un rattachement faux couperait un historique en deux, en silence.

**⚠️ LA SOURCE DE LA FUSION EST TOUJOURS `_editingCustomExName`, jamais le contenu du champ** : c'est l'historique de l'exercice **réel** qu'on déplace, pas celui d'un nom en cours de frappe. Le bandeau **nomme les deux côtés** — *« C'est « Tirage Poulie Haute (Lat Pulldown) » du catalogue. Rattacher déplace l'historique et les records de « Tirage vertical », puis supprime le doublon. »* — pour que la décision soit facile (**R29** : informer sans décider).

**⭐ EN CRÉATION ON INFORME, SANS BOUTON** : il n'y a aucun historique à déplacer, et on n'empêche personne de créer son exercice (**R24**). *C'est pourtant la porte par laquelle les fantômes NAISSENT, et elle était muette.*

**📣 RÈGLE D'OR #11 — LE BANDEAU EST L'ANNONCE**, à l'écran au moment où ça sert. Aucune pop-up, aucun point rouge : rien n'est à faire tant qu'on n'ouvre pas un exercice perso (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **ça ne répare RIEN tout seul** — c'est la personne qui tape « Rattacher », par choix. ⛔ Ni l'import, ni le rapprocheur, ni `_EX_EQUIV` ne sont touchés. ⛔ Et rien n'est proposé dans la zone grise, **exprès**. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1057**, `conclusion: success` à **07:13:56 UTC** sur `cdeb642f`. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés). ⭐ *Lu sur la LISTE filtrée `status: completed`* — la leçon de ft-v1182.

Tests : **parcours 3463/3463** (+12, bloc **CCLXXXIII**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⛔ **CONTRÔLE NÉGATIF : 6 mutations, TOUTES MORDENT** — ① le bandeau neutralisé → **7 rouges** · ② le seuil `auto` retiré (zone grise acceptée) → **2 rouges**, exactement l'exercice neuf et le cas ambigu · ③ le garde « c'est déjà ce nom-là » retiré → **1** · ④ le bouton de fusion affiché même en création → **1** · ⑤ le câblage `oninput` du champ retiré → **1** · ⑥ `_setCexFormMode` qui n'appelle plus le bandeau → **6**.

**⚠️⚠️ ET UN TROU DE TÉMOIN TROUVÉ PAR LA MUTATION ⑤, POUR LA TROISIÈME VERSION DE SUITE.** Ma 1ʳᵉ version **appelait `_majCexRattacher()` à la main** dans les témoins de silence : retirer le `oninput` du champ ne faisait alors rougir **personne**, et le câblage aurait ressemblé à de la décoration. Les témoins **tapent désormais pour de vrai** (événement `input` dispatché). ⭐ **Honnêteté sur cette mutation** : elle ne fait **qu'un** rouge, celui de la création — et c'est **structurel, pas un oubli** : *un témoin qui affirme « le bandeau est CACHÉ » ne peut pas distinguer « correctement muet » de « fil débranché »*. **Seul un témoin qui attend du VISIBLE attrape un câblage mort.**

**⚠️ ET MON HARNAIS DE MUTATION M'A MENTI AU PASSAGE** : il coupait la sortie à `tail -4`, donc un rouge en 8ᵉ position sur 12 était **invisible** — j'ai lu « 0 rouge » sur une mutation qui mordait, et j'ai failli en conclure que le câblage était mort. 👉 ***Un outil de mesure tronqué ressemble à un code sans défaut.***

Fichiers : `log.js`, `index.html`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1187. |

**ft-v1186 — 🏷️⚖️ LA PORTION NOMMÉE : `portionLabel` + `portionWeightG` — ET MON REFUS ÉTAIT MAL FONDÉ** — Michel, en relisant ft-v1183 : ***« 1 portion = 300 kcal, poids inconnu » ne suffit pas — je veux savoir si la portion représente 1 steak, 1 yaourt, 1 dose, 1 part***.

**⛔⛔⛔ IL A RAISON, ET LA FORME DE MON ERREUR VAUT PLUS QUE LE CORRECTIF.** J'avais refusé `portionWeightG` en écrivant *« cet état n'existe pas »*, mesure à l'appui : déclarer un poids fait basculer l'app en grammes, donc le champ ne se remplirait jamais. **Chaque maillon était vrai et la conclusion était fausse** — j'ai mesuré ce que l'app **FAIT** et conclu sur ce qu'elle **DOIT** faire.

👉 ***Une mesure du comportement actuel ne peut JAMAIS justifier un refus de BESOIN.*** Elle décrit ce qui est, pas ce qui manque. Le seul refus qu'elle autorise est *« ce champ est aujourd'hui inutile »* — jamais *« il ne servira jamais »*. ⚠️ Ce n'est pas **R28** (une limite non vérifiée) : ici la limite **était** vérifiée. C'est la **question** qui était mauvaise.

**⭐ SON CAS TRANCHE TOUT EN UNE LIGNE** : *« 1 steak = 125 g, 2 steaks = 250 g — je ne veux pas que ça devienne `q:250, u:'g'`, car on perd l'information « 2 steaks » »*. **Basculer en grammes est une PERTE, pas une simplification.**

**⭐⭐ CE QUI EST LIVRÉ, SUR SES 6 DÉCISIONS** :

| | décision | ce qui est fait |
|---|---|---|
| ① | `portionLabel` **stocké** | nom court au singulier, **jamais deviné** · 8 puces + champ libre |
| ② | `portionWeightG` **à part** | poids d'**UNE** portion · la **masse totale reste DÉRIVÉE** (`q × poids`) |
| ③ | référence **dérivée** | `totaux ÷ q` — sa mesure 601/3 a tranché |
| ④ | `per100` écrit **et recalculé** | depuis `q × portionWeightG`, jamais vérité indépendante |
| ⑤ | le **favori se rafraîchit** | sa **définition** seulement, jamais ses macros |
| ⑥ | « 2 steaks » dans le journal | **chantier séparé**, juste après |

**⛔ LES PUCES NE SONT PAS DU CONFORT** (steak · part · tranche · yaourt · dose · sachet · bol · assiette) : *taper une étiquette au clavier à chaque repas sur un téléphone ne tiendrait pas trois jours, et **un champ qu'on ne remplit plus est pire qu'un champ absent** — il donne l'illusion que l'information existe.* ⭐ Et **l'étiquette ne se saisit qu'une fois par ALIMENT** : la reprise la repropose, exactement comme le pour-100 g depuis ft-v1042.

**⛔⛔ LE PIÈGE STRUCTUREL, NOMMÉ AVANT D'ÊTRE COMMIS** : `_afPortionPoids` **n'est pas** `_afPoidsDeclare`. Le premier est le poids d'**une portion**, le second celui de **ce qui est affiché** (le total). *Deux notions, deux variables, jamais la même* — consigne écrite de Michel, et c'est la famille **« deux sources qui se contredisent »** de `BUGS.md`.

**⭐ ET LE POIDS D'UNE PORTION NE RESCALE RIEN** : savoir qu'un steak pèse 125 g ne change pas ce qu'on a mangé — les 4 valeurs ne bougent pas (mesuré : 240/16 avant **et** après). *C'est toute la différence avec `af-poids`*, et deux témoins la figent.

**⛔⛔⛔ LE SEUL ROUGE DE LA VERSION, TROUVÉ PAR LA MESURE AVANT LIVRAISON.** Reprendre « 2 steaks de 125 g » **rouvrait le champ GRAMMES** — parce qu'un pour-100 g existait — et l'écran perdait le « 2 ». ***La donnée était intacte, l'écran mentait***, et c'est mot pour mot ce que Michel refuse au point 2. ⭐ Corrigé sur **les deux portes** (R8) : **le pour-100 g ne décide plus de l'unité**. *L'unité appartient à la personne, pas à la richesse de la fiche.* ⛔ **ft-v1042 n'est pas touchée** (un aliment scanné n'est pas compté en portions) — un témoin de non-régression le fige.

**⚠️ ET LA LISTE BLANCHE DE `_provFood` A OUBLIÉ UN CHAMP POUR LA 4ᵉ FOIS** — c'est écrit **trois fois en majuscules juste au-dessus**. Cette fois un **témoin dédié** fige la traversée, au lieu de compter sur l'attention.

**📣 RÈGLE D'OR #11 — L'ANNONCE EST À L'ÉCRAN**, au moment où ça sert : le bloc portions gagne des puces et deux champs **visibles**, et la définition s'écrit dessous. Aucune pop-up, **rien n'est obligatoire** — la définition est facultative, et son absence se dit (**R24/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **les lignes déjà abîmées ne sont pas réparées**, la migration des 17 jours reste **intacte** · ⛔ ni cru/cuit, ni recherche/CIQUAL, ni scan · ⛔ le journal du jour n'affiche toujours **aucune** quantité — c'est le chantier ⑥, décidé séparé. ⚠️ **Michel doit vérifier sur Safari/iPhone.**

⚠️⚠️ **33ᵉ COLLISION DE VERSION** : session-B a publié **ft-v1184 et ft-v1185** pendant que je posais ma ligne de partage. **Mon push a échoué en non-fast-forward** — *le vrai verrou a encore joué, rien n'a été écrasé*. Convention du dépôt : **la première publiée garde le numéro** → je suis passé en ft-v1186.

**⚠️⚠️ ET LA PASSE COMPLÈTE A ROUGI SUR DEUX TÉMOINS DE ft-v1183 — QUI FIGEAIENT UNE FORMULATION, PAS LEUR GARANTIE.** Ils exigeaient le motif exact *« 1 portion = 300 kcal »* ; en ajoutant le NOM, la phrase devient *« 1 portion = portion non définie, poids inconnu · 300 kcal »*. ⭐ **La garantie — *une portion ne s'affiche jamais sans sa définition, et ce qu'on ignore est dit* — est intacte, et même plus forte** : l'écran annonce désormais aussi que le nom manque. ⛔ **Ce n'est pas un témoin qu'on desserre pour faire passer du code** : le comportement figé n'a pas changé, c'est le motif qui figeait plus que lui (le cas exact de **ft-v1176**). Motifs resserrés sur les trois exigences réelles, **et ÉPROUVÉS** — retirer la définition, taire le poids inconnu ou supprimer le nombre de portions les fait toujours rougir. *La différence entre une mise au point et un assouplissement se mesure, et je l'ai mesurée.*

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1054**, `conclusion: success` à **19:54:25 UTC** sur `fcab2a18`. ⛔ Ni backend ni worker attendus (`Code.js`/`worker.js` non touchés). ⭐ *Lu sur la liste filtrée `status: completed`* — la leçon de ft-v1182.

Tests : **parcours 3451/3451 sur l'arbre FINAL** (+14, bloc **CCLXXXI**), **calculs 339/339**, muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. ⛔ **CONTRÔLE NÉGATIF : 15 MUTATIONS, TOUTES MORDENT** — l'étiquette retirée · le poids retiré · ⭐ **le poids qui ferait basculer l'unité** (3 rouges, exactement ce que Michel refuse) · le `per100` dérivé supprimé · la définition qui ne revient pas à la reprise · ⭐ **le pour-100 g qui reprend la main sur l'unité** (le rouge d'origine, rejoué) · la définition qui traverse d'un aliment à l'autre (3 rouges) · le favori qui garde sa vieille définition · le favori dont on écrase les macros · l'export CSV amputé · le « poids inconnu » qui ne se dit plus · la liste « Mes aliments » qui perd la définition.

⚠️⚠️ **ET LA MÊME LEÇON POUR LA TROISIÈME FOIS DE SUITE** : une mutation **ne mordait pas** — écraser les macros du favori — et ce n'était **pas** du code inutile, c'était un **trou de témoin** : ma fixture mettait **600 des deux côtés**, donc l'écrasement était *invisible*. Fixture rendue discriminante (favori 600, repas 500), **14ᵉ témoin écrit**, la mutation mord. 👉 ***Une protection sans témoin n'est pas une protection*** — et une fixture où les deux valeurs coïncident ne peut rien voir.

Fichiers : `app.js`, `setup.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`. sw.js ft-v1186. |

**ft-v1185 — 🧾 LE DÉBRIEF SUR TOUTES LES COMBINAISONS DE SÉANCE : BALAYAGE, ET TÉMOINS PERMANENTS** — Michel, juste après ft-v1184 : ***« on est bien d'accord que le débrief il faut le faire pour une séance créée, ensuite une séance par rapport à un programme, et une séance avec Milo, et aussi le cardio, et aussi si il y a le cardio plus une séance — enfin toutes les possibilités qui peuvent y avoir, sans rien casser et en vérifiant bien que ça ne crée pas de bugs »***.

**⭐⭐ LA LISTE EST TIRÉE DU CODE, PAS INVENTÉE.** **SEPT portes** créent une séance : `startWorkout` · `lancerTypeSeance` · `renderLog` · `addExercise` · **`_appliqueMiloSession`** · **`_loadProgDayVraiment`** (multi-jours) · **`_loadProgVraiment`** (un seul jour). 👉 ***J'en avais testé DEUX sur sept*** — inventer la liste m'aurait fait rater les cinq autres.

**⛔ RÉSULTAT : LES 12 COMBINAISONS DONNAIENT DÉJÀ UN DÉBRIEF. Il n'y avait rien à réparer.** Cette version n'apporte donc **pas un correctif mais une garantie** (**R17/R35** — chaque cas vécu devient un témoin permanent). *Un balayage qu'on ne fige pas est un balayage à refaire.* ⛔ **Aucune ligne de production ne change.**

**Les 12 cas** : séance créée à la main · carte « type de séance » · ajout direct d'un exercice · **séance de Milo** · programme **multi-jours** · programme **un seul jour** · **cardio seul (après)** · **cardio seul (échauffement avant)** · cardio avant **+** après sans muscu · **cardio + muscu** · séance mise en **pause** puis terminée · **superset**.

**⚠️⚠️ ÉPROUVÉ AVANT D'ÊTRE CRU** : en neutralisant `_showSessionEnd`, **les 12 rougissent**. *Un contrôle tout vert qu'on n'a pas vu échouer ne mesure rien, il rassure* (ft-v994).

**⚠️⚠️⚠️ ET LA LEÇON DE LA VERSION EST QUE LE CONTRÔLE NÉGATIF A CORRIGÉ MON TÉMOIN DEUX FOIS.**
- **①** Ma 1ʳᵉ version mesurait **la longueur du texte**. En tuant le socle `_debriefLocal`, `_runSeDebrief` retombe sur un repli de trois lignes écrit à la main : le texte reste long, **le témoin restait VERT**. *Un témoin qui mesure la longueur mesure la longueur, pas le débrief.*
- **②** Ma 2ᵉ version **appelait `_debriefLocal` en direct** — verte aussi, parce que la fonction **existe toujours** : c'est son **usage par l'écran** qui avait disparu. 👉 ***C'est `BUGS.md` §58, que je venais d'écrire une heure plus tôt, et que j'ai refaite aussitôt.***
- **③** La bonne version vérifie que le texte **affiché** contient ce que le socle **produit** — le **chemin**, pas la fonction. La mutation fait alors **12 rouges**. *Écrire une famille de bugs ne vaccine pas contre elle ; seul le contrôle négatif attrape la rechute.* (§58 complétée.)

**📣 RÈGLE D'OR #11 — RIEN.** Aucun code de production ne change (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : ⛔ **ça ne juge pas la QUALITÉ du débrief**, seulement qu'il existe et qu'il **vient du socle calculé**. ⛔ Et le seul cas sans écran de fin reste **« aucune série cochée »**, qui est **voulu** : l'app refuse de terminer et le dit.

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1051**, conclusion `success` sur `9253161e`. ⛔ Ni backend ni worker attendus. ⚠️ *Au passage : l'API a rendu l'étape « Déployer sur GitHub Pages » comme `in_progress` pendant 13 minutes alors que le run était déjà terminé — un état périmé, pas un déploiement lent. **Vérifier le RUN, pas seulement l'étape.***

Tests : **parcours 3437/3437** (+13, bloc **CCLXXXII**), **calculs 339/339**, muscles, croisés, dates, données classées 0 trou. ⛔ **CONTRÔLE NÉGATIF : 5 mutations** — ① l'écran de fin non ouvert → **12 rouges** · ② le cardio non reconnu comme validant → **3 rouges**, exactement les trois cas de cardio seul · ③ l'échauffement **avant** qui ne compte plus → **1 rouge**, exactement ce cas · ④ le socle non employé → **12 rouges** (après mes deux corrections) · ⑤ la régression de ft-v1184 → **0 rouge ici**, mais elle mord dans le bloc **CCLXXXI** qui la couvre — *je le dis plutôt que de prétendre l'avoir testée*. Fichiers : `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `BUGS.md`. sw.js ft-v1185. |

**ft-v1184 — ⏱️ LA MISE À JOUR VOLAIT LE DÉBRIEF DE FIN DE SÉANCE — ET C'EST MICHEL QUI A TROUVÉ LA CAUSE** — il signale d'abord le symptôme : ***« quand on fait la séance avec Milo à la fin on a un débrief, mais quand on intègre un programme ou on fait sa propre séance, il n'y en a pas »***.

**⭐ PREMIÈRE MESURE : LE DÉBRIEF NE DÉPEND PAS DE MILO.** Conduit de bout en bout — une séance chargée **depuis un programme** ouvre l'écran de fin et appelle Milo **exactement** comme les autres. Le seul critère est **au moins une série cochée**. *Son intuition « c'est lié à Milo » était fausse, et c'est lui qui a trouvé la vraie.*

**⭐⭐ SA CAUSE, ET ELLE EST JUSTE** : ***« il n'y a pas de mise à jour pendant une séance mais dès qu'on fait terminé la mise à jour se fait et donc on ne voit pas le débrief »***.

**⛔⛔ REPRODUIT.** Au moment où le rechargement part, `_majPeutSAppliquer` voit `écran=home · séance ouverte=false · récap ouvert=false` — ***les trois gardes tombent en même temps***. Parce que `finishWorkout` vide `S.wkt`, fait `goScreen('home')` (« évite le double-tap sur DOM stale »), puis **attend `syncSheets` pendant plusieurs SECONDES**, et n'ouvre l'écran de fin qu'**après**. 👉 **Le garde `ov-session-end` arrive trop tard : il protège une fenêtre qui n'est pas encore ouverte** — et chaque `persist()` de cette zone rappelle `_appliquerMaj()`.

**⭐ R13 — ON N'INVENTE PAS DE VERROU.** `_finishing` existe dans `log.js`, posé au tout début de `finishWorkout` et **levé sur ses 5 sorties**, y compris les trois refus. **Il manquait un LECTEUR, pas un mécanisme** : le correctif fait **une ligne**, protégée par `typeof` parce que `_finishing` vit dans un autre fichier chargé après.

**⭐ LA RÈGLE DE SORTIE EST DE MICHEL AUSSI** : *« à partir du moment où on valide / on sort de la fenêtre du débrief, là on peut faire la mise à jour »*. **Vérifié** : sortie vers l'**Accueil** → appliquée **tout de suite** · sortie vers le **Coach** → elle **attend**, exprès (on ne recharge pas quelqu'un au milieu d'une conversation avec Milo — règle existante, non touchée, et un témoin la fige).

**⚠️⚠️ ET LA VRAIE LEÇON EST AILLEURS — LE BANC ÉTAIT VERT PENDANT UN MOIS SUR CE BUG.** Le **bloc XXII** existe depuis le **15/08** et porte **exactement le même symptôme** de Michel (*« la mise à jour s'est faite au moment où j'ai terminé ma séance, donc j'ai pas vu mon récapitulatif »*). ⛔⛔ **Et son commentaire NOMMAIT déjà la cause** : *« le garde-fou se relâchait à la milliseconde où S.wkt se vide, c'est-à-dire juste avant que l'écran de fin s'ouvre. »* **Mais son témoin pose les états à la main** (`S.wkt=null` ; `ov.classList.add('open')`) : il teste l'**état final**, l'écran **déjà** ouvert, et **ne conduit jamais `finishWorkout`**. 👉 ***Un témoin qui pose l'état final à la main ne voit pas le chemin qui y mène.*** *La cause était écrite en août ; le correctif n'a couvert que l'APRÈS ; le témoin a figé l'APRÈS ; la fenêtre d'avant est restée ouverte un mois.* C'est « vérifier la fonction n'est pas vérifier l'appel » (ft-v1158) appliqué au **TEMPS** au lieu de l'espace — nouvelle famille **`BUGS.md` §58**.

**📣 RÈGLE D'OR #11 — RIEN.** Aucun écran ne change, aucun bouton n'apparaît : un écran qui disparaissait reste (**R19/R25**).

**⏭️ CE QUE ÇA NE FAIT PAS** : rien d'autre — et ⚠️⚠️ **CORRECTION, LE JOUR MÊME — IL N'Y A PAS DE BUG CARDIO, C'ÉTAIT MA FIXTURE.** J'avais signalé à Michel qu'un cardio seul n'ouvrait pas d'écran de fin. **Faux** : ma sonde écrivait `cardio:{min:30}` alors que le champ de production est **`duration`**. Remesuré avec le vrai schéma : **écran de fin ouvert, séance enregistrée, débrief présent, appel à Milo parti**. 👉 ***Un test qui n'emploie pas le schéma de la production ne teste rien — il fabrique un faux bug*** (`docs/SUIVI-AUDIT.md`). J'ai failli faire creuser Michel sur un problème inexistant, et une fausse piste laissée dans un journal coûte encore plus cher six mois plus tard (**R30**). ⛔ **Le seul cas sans écran de fin reste « aucune série cochée », et il est VOULU** : l'app refuse de terminer et le dit — *« Valide une série ou ajoute un cardio ! »*. 

✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : **run #1049**, « Déployer sur GitHub Pages » en `success` à **16:09:35 UTC** sur `a771f323`. ⛔ Ni backend ni worker attendus.

Tests : **parcours 3424/3424** (+9, bloc **CCLXXXI**), **calculs 339/339**, muscles, croisés, dates, données classées 0 trou. ⭐⭐ **Le témoin CONDUIT `finishWorkout`** — c'est toute la différence avec celui d'août. ⛔ **CONTRÔLE NÉGATIF : 4 mutations** — ① le lecteur retiré → **5 rouges** · ② le garde du récap retiré → **1 rouge chirurgical** · ③ le verrou non levé sur le refus « aucune série validée » → **2 rouges** · ④ le garde « accueil seulement » retiré → **0 rouge chez moi**, mais il **mord dans le bloc XXII** qui le couvre déjà — *je le dis plutôt que de prétendre l'avoir testé*. ⚠️ **Et la mutation ② a exigé un témoin que je n'avais pas écrit** : aucun des miens ne tentait une mise à jour **pendant** que l'écran est affiché. Or le cas est réel et fréquent — *taper son ressenti sur l'écran de fin appelle `setDayEnergy` → `persist()` → `_appliquerMaj()`*. **Les deux gardes se relaient** (`_finishing` avant l'ouverture, `ov-session-end` après), **et il fallait un témoin pour chacun**. Fichiers : `app.js`, `tests/parcours/runner.js`, `sw.js`, `CLAUDE.md`, `docs/CONTEXTE-ACTUEL.md`, `docs/JOURNAL-DE-PARTAGE.md`, `docs/JOURNAL-ARCHIVE.md`, `BUGS.md`. sw.js ft-v1184. |




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
