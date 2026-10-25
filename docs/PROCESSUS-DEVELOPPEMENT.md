# 🏗️ Processus officiel de développement — Force Tracker

> Méthode de travail **officielle** de Force Tracker. Chaque évolution suit
> exactement ce processus. **L'objectif n'est pas de développer plus vite —
> c'est de développer mieux.**
>
> Cohérent avec la **Constitution de Milo** (`CONSTITUTION-MILO.md`, Principe 8
> « une brique à la fois ») et la **règle d'or #12** de `CLAUDE.md` (journal en
> temps réel).

---

## 🎯 Philosophie

Chaque brique doit être : **comprise · challengée · simplifiée · validée ·
développée · testée · documentée · puis clôturée.**

**Aucune étape ne doit être sautée.**

> Je préfère développer une fonctionnalité de moins mais conserver un projet
> parfaitement organisé. — Michel

---

## 🪶 Gouvernance légère — « la gouvernance sert le produit, jamais l'inverse » (Michel, 24/07/2026)

La phase **« cohérence »** (rendre Milo **fiable** avant de le rendre plus intelligent — de la
logique de *développement* à la logique de *gouvernance*) a un **piège** : une gouvernance si bien
pensée qu'elle **ralentit** le produit. Garde-fous :

- **La gouvernance est soumise à SA PROPRE loi.** Chaque règle, test ou étape de process doit
  *mériter sa place* en réduisant un **risque** OU une **charge mentale**. Sinon → on le coupe. Le
  « −10 % » ne vaut pas que pour le prompt : il vaut aussi pour le **framework et le process**.
- **La mesure du succès** n'est PAS le nombre de documents produits, mais que **valider la prochaine
  évolution de Milo soit plus simple, plus sûre et plus rapide qu'aujourd'hui.** Corollaire : si le
  framework nous fait réfléchir *davantage* à chaque évolution, c'est le signal qu'il est devenu trop
  complexe → on le simplifie lui aussi.
- **Prompt vs doc — deux natures d'objets :**
  - le **prompt** = objet **opérationnel** (lu par Milo à chaque message, les règles s'y
    concurrencent) → reste **maigre** : *une règle entre, une règle sort — ou on justifie clairement
    pourquoi elle reste*.
  - la **doc** = objet de **mémoire** (garde le *pourquoi* des décisions) → on ne la plafonne pas,
    mais on la **jardine** régulièrement (restructuration) pour qu'elle ne devienne pas un empilement
    que plus personne ne relit.

### 🎮 Garde-fou de priorisation : la gamification vient APRÈS les fondations (GPT + Michel, 27/07/2026)

Risque nommé clairement : la tentation d'ajouter **trop tôt** des **badges, succès, défis, animations,
gamification**. Ces éléments sont sympas mais **ne créent pas la valeur principale** de Force Tracker — qui
est son **intelligence personnalisée** (la connaissance progressive de l'utilisateur). Règle : *on ne pose
pas de vernis de gamification tant que les fondations (profil vivant, cerveau, cohérence) ne sont pas
solides.* La gamification viendra **naturellement** ensuite, et sera **meilleure** parce qu'ancrée sur une
vraie mémoire (un « défi » sur mesure vaut mille badges génériques). Cohérent avec l'identité « figurines
muscles » (on ne copie pas Hevy/JEFIT) et avec le filtre de priorisation (« est-ce que ça améliore les
décisions de Milo ? »).

### 👥 Retours des vrais utilisateurs — anti-sur-ajustement (3 paliers)

Ne jamais transformer un retour **isolé** en règle. Seule la **récurrence** fait monter d'un palier :

| Palier | Décision | Où ça vit |
|---|---|---|
| **1 retour isolé** | on **observe** | `RETOURS-TESTEURS.md` |
| **2-3 retours indépendants, même sujet** | on **enquête** | note / `docs/BUGS-DE-PHILOSOPHIE.md` |
| **problème reproductible / récurrent** | **scénario permanent** | `tests/milo/scenarios.js` |

> Angle mort à surveiller : à force de travailler notre propre logique, ne plus assez confronter Milo
> à de **vrais utilisateurs**. **Séparer les rôles** : les utilisateurs **génèrent la surprise**
> (→ le corpus de tests, via la récurrence ci-dessus) ; l'humain de l'équipe **juge le ressenti** (ce
> qu'aucun test déterministe ne capte). **La machine garde les régressions, l'humain garde le ressenti.**

---

## 🧠 Le prompt est le DERNIER levier, pas le premier (Michel, 25/07/2026)

Apprentissage majeur de la semaine : on a parfois essayé de résoudre **avec le prompt** des problèmes qui
étaient en réalité **structurels**. Le **cerveau de Milo est distribué** (onboarding · données · mémoire ·
`coach.js` · hiérarchie des règles · prompt) — cadre complet dans `docs/MOTEUR-RAISONNEMENT-MILO.md`.

**Discipline — avant TOUTE correction, répondre aux 3 questions** (du plus fiable au moins fiable) :
1. **STRUCTURE ?** (UI, onboarding, donnée manquante, **ET le NIVEAU DE MODÈLE**) — fix déterministe et définitif.
2. **HIÉRARCHIE ?** (deux règles qui se concurrencent) — fix déterministe (on réordonne).
3. **PROMPT seul ?** — fix probabiliste (le modèle peut obéir… ou pas).

**Tant qu'on n'a pas répondu aux trois, on ne touche pas au prompt.** Corollaire gravé : **un prompt ne
compense jamais une donnée absente** — si Milo redemande toujours le lieu/la durée/la fréquence parce qu'ils
ne sont jamais collectés, le vrai correctif est dans l'**interface**, pas dans le cerveau de Milo.

### 🎚️ Le NIVEAU DE MODÈLE est une variable STRUCTURELLE (26/07/2026 — la « variable cachée »)

Cas fondateur : on a durci le prompt anti-interrogatoire **trois fois** (ft-v602/603/606), le comportement
revenait. La vraie cause n'était pas le prompt mais le **modèle** : le coach tournait sur un modèle **léger
par défaut** (qui suit mal les consignes fines), alors que le fondateur testait sur un modèle **haut de
gamme**. Un modèle léger ne tient pas la nuance ; le prompt fin ne « prend » que sur un modèle capable.
Le **choix du modèle est donc une couche du cerveau distribué**, au même titre que les données ou la mémoire —
et c'est un fix **structurel** (déterministe), pas un énième patch de prompt.

**Règle de gouvernance qui en sort (Michel + ChatGPT) :** *« On évalue Milo sur le modèle réellement utilisé
par les VRAIS utilisateurs, pas sur le modèle premium du fondateur. »* Sinon on **corrige le mauvais cerveau**
— on optimise pendant des jours une expérience que la majorité ne voit pas. Corollaire : le **gratuit / la
découverte** (là où se joue la conversion) doit tourner sur un modèle **capable** ; les tâches **utilitaires**
(code-barres, résumés, lecture d'étiquette) peuvent rester sur le modèle léger.

**Et quand on doit VRAIMENT toucher au prompt** : pas de grand ménage. On garde le **noyau cardinal intact**,
on retire **uniquement les redondances évidentes, une par une, avec validation après chaque suppression**
(noyau dur + IA + test humain). *« Dix petites coupes validées valent mieux qu'une grosse simplification qui
changerait subtilement le comportement de Milo. »*

### 🎯 Le bon indicateur : « combien de valeur AVANT la première question ? » (Michel, 26/07/2026)

Raffinement du noyau cardinal ① (aider avant de questionner), né d'un vrai test (« je veux faire de la
force » → Milo pose 2 questions avant de proposer). **Le bon indicateur de qualité d'un échange n'est PAS
le nombre de questions posées, mais : *combien de valeur la personne a-t-elle reçue AVANT la première
question ?*** Chaque premier message doit contenir un conseil déjà **exploitable**. Corollaires (gravés
aussi dans le prompt, `buildCoachContext`) : **Milo n'a pas peur de faire un premier choix** quand il a
assez d'infos ; **une fois l'orientation crédible posée, les questions restantes ne débloquent plus rien —
elles ne font que PERSONNALISER** (différence fondamentale) ; sur une blessure connue, il **montre qu'il
sait quoi en faire** (« amplitude contrôlée, progression adaptée »), pas seulement qu'il s'en souvient.
C'est ce qui fait sentir un **coach** et non un assistant qui collecte des infos.

---

## 🔁 Le cycle d'une brique

### 1. Réflexion
- Définir le problème à résoudre.
- Vérifier que la brique respecte la **Constitution** de Force Tracker.
- Identifier clairement sa **valeur pour l'utilisateur** (règle d'or : « cela
  rend-il Milo/l'app réellement meilleur pour le sportif ? »).

### 2. Spécification
Toujours définir les **3 sections** :
- **Objectif** — ce que la brique apporte, en une phrase.
- **Critère de réussite** — comment on sait qu'elle est finie et validée.
- **Hors périmètre** — ce qui NE doit PAS être fait dans cette brique.

La brique doit rester **simple et indépendante** (anti « puisqu'on y est »).

### 3. Challenge
- La proposition est relue (Claude ↔ ChatGPT ↔ Michel).
- Les remarques sont discutées, les améliorations intégrées.
- **La validation finale appartient toujours à Michel.**

> **🧪 Les 3 critères d'évaluation d'une proposition** *(grille permanente, apport Michel 23/07/2026)* —
> avant de figer quoi que ce soit, toute proposition passe ces trois filtres :
> 1. **Améliore-t-elle réellement l'expérience utilisateur ?**
> 2. **Est-elle soutenable économiquement à grande échelle ?** (une excellente idée qui double les
>    coûts LLM n'est probablement pas une bonne idée produit.)
> 3. **Existe-t-il une solution plus simple qui apporte 80 % du bénéfice pour 20 % du coût ?**
>
> Corollaire décisif : **séparer le PRINCIPE de son IMPLÉMENTATION.** On grave un principe quand il
> est mûr ; on ne fige pas une architecture sur une simple intuition. Transformer trop vite une bonne
> intuition en implémentation est un piège récurrent.

> **🎯 4ᵉ filtre — le COMPORTEMENT OBSERVABLE** *(GPT + Michel, 27/07/2026 ; né des 4 bugs Milo→Séance)* —
> pour toute brique qui **ajoute une connaissance** au profil vivant, répondre AVANT de coder :
> **① qui la produit · ② qui l'exploite · ③ quel comportement CONCRET change dans l'app ?**
> Si on ne sait répondre à aucune → on n'ajoute pas (ou pas encore). *« Une connaissance qui ne change
> rien au comportement de l'app est une connaissance inutile. »*
> ⚠️ **Nuance** : le comportement peut être **différé**, mais il doit être **NOMMABLE** (« ça servira à la
> brique 7 dans quelques mois » = valide ; « on verra bien » = non) — sinon on tuerait la mémoire longue,
> qui est l'ADN du produit. Détail + contre-exemples : `docs/PROFIL-VIVANT.md`.
> 💡 Cette grille sert **aussi à l'envers**, en audit : *où cette info ressort-elle concrètement ?* — c'est
> comme ça qu'on a trouvé les 4 bugs de restitution (`ft-v625→628`).

### 4. Développement
- **Sauvegarde d'abord** (point de restauration — voir « Adaptation Force
  Tracker » ci-dessous).
- Implémentation, une chose à la fois.
- **Tests techniques** (Playwright / Chrome + Safari quand c'est de l'UI).

### 5. Clôture obligatoire
Une brique n'est **PAS terminée** tant que TOUT ceci n'est pas fait :

- [ ] Code terminé
- [ ] Tests réalisés
- [ ] **`CLAUDE.md` mis à jour** (fichier maître, prioritaire)
- [ ] Roadmap mise à jour (si nécessaire)
- [ ] Fichier de suivi dédié mis à jour (ex. `DOSSIER-ATHLETE-SUIVI.md`)
- [ ] **Journal des décisions mis à jour → `docs/DECISIONS.md`** ⚠️ *Cette case existait depuis le début et **pointait dans le vide** : aucun fichier ne portait ce nom avant le 19/09/2026. Elle a donc un destinataire, maintenant.*
- [ ] **⚖️ Les choix pris SEUL sont nommés** — chaque décision que Claude a tranchée sans demander entre au registre avec **l'alternative écartée**. 👉 *Mesuré le 19/09 : le journal nommait les décisions qu'on RENDAIT à Michel (5 fois) et **zéro** de celles qu'on prenait. Une direction ne dérive pas par grandes décisions, elle dérive par petites décisions que personne n'a vues passer.*
- [ ] **🌟 La question de la Vision est répondue, par écrit** — *« est-ce que cela renforce l'esprit Force Tracker ? »* (`docs/VISION-FORCE-TRACKER.md`). Trois réponses possibles : **renforce · neutre · tension**. ⚠️ **« tension » n'est pas une faute** — c'est un signal à relire, et *un registre où tout « renforce » ne mesure plus rien*. La réponse va dans la colonne `vision` du registre.
- [ ] Documentation (aides `?`, Aide détaillée, Guide…) mise à jour si feature visible
- [ ] Résumé des changements rédigé (message clair à Michel)
- [ ] Point de sauvegarde / rollback fourni

### 6. Validation finale — les 4 axes
Une brique n'est **réellement terminée** que lorsque les **4 validations** sont
obtenues (méthode adoptée à la clôture de la brique 3, 19/07/2026) :

1. **Validation fonctionnelle** — la fonction fait ce qu'elle doit faire.
2. **Validation technique** — code propre, tests OK, 0 erreur, rien de cassé.
3. **Validation en situation réelle** — Michel l'a essayée en vrai (iPhone) et
   ça tient dans l'usage.
4. **Validation de la philosophie de Milo** — le comportement respecte la
   Constitution (la personne d'abord, écouter/comprendre avant de conseiller…).

- **Michel valide** ces 4 axes → la brique est close ; on passe à la suivante.

---

## 📝 Résumé de fin de tâche (obligatoire, format standard)

À la fin de CHAQUE tâche, produire automatiquement un petit compte-rendu — **toujours
les mêmes 5 points** (fait partie de la « Clôture obligatoire », pas optionnel) :

1. **Ce qui a été modifié** (le quoi).
2. **Pourquoi** (le retour / la raison).
3. **Fichiers impactés.**
4. **Documentation mise à jour** (CLAUDE.md, CONTEXTE-ACTUEL, suivi, décisions…).
5. **Prochaine étape** (+ le rollback / point de sauvegarde).

> C'est ce compte-rendu que Michel lit pour comprendre l'état sans relire le code.
> La doc est donc TOUJOURS synchronisée avec le code — plus jamais de rappel
> « tu as oublié de mettre à jour le fichier… ».

---

## ⏱️ Estimer une tâche — la méthode validée (**D-088**, Michel, 18/10/2026)

**D'où ça vient** : D-086 avait été estimé **6 à 8 h** ; il a duré **3 h 44**. Michel : *« Je ne vais pas me plaindre
que ça soit moins long, par contre il va falloir être un peu plus juste. »* Une estimation trop prudente n'est pas
une précaution : elle fausse les arbitrages (on renonce à un lot « trop long », on bloque une soirée pour rien).

**Les cinq points, à chaque estimation :**

1. **Partir des durées MESURÉES**, avec leur contexte (quel banc, combien de témoins, en parallèle ou non) — jamais
   d'une impression.
2. **Séparer** le temps de **développement** (lire, coder, écrire les témoins, documenter) et le temps
   d'**exécution des tests** (bancs, mutations, passe complète), qui est mécanique et se mesure.
3. **Dire à part le risque de reprise** — p. ex. une 2ᵉ passe complète *si elle est nécessaire et autorisée*, un
   témoin à re-viser, une décision à attendre. Il ne gonfle pas le chiffre central : il s'ajoute, nommé.
4. **Donner une estimation centrale raisonnable** (« ≈ 2 h 45 ») plutôt qu'une fourchette trop prudente.
5. **Dans le rapport final, comparer estimé et réel**, et expliquer les écarts — c'est ce qui recale les repères.

**Repères mesurés** (conteneur de session, 4 processeurs ; un repère se remplace par une NOUVELLE mesure) :

| Étape | Durée mesurée | Contexte de la mesure |
|---|---|---|
| Passe complète D-031 (`tools/passe_valide.sh`) | **~80 min** (83 min le 18/10) | ~7 400 témoins, une seule à la fois |
| Passe complète D-031 **dans un espace réseau isolé** (`unshare -n` + puits, outil hors dépôt au 19/10) | **86 min** (19/10) | 7 582 témoins ; l'isolement ne coûte rien de mesurable (canaris : ~1 min avant, quelques secondes après) |
| Contrôle négatif (mutations) d'un lot | **12 à 16 min** (7 min en 2 files parallèles) · 12 min 30 (21 mutations, banc de 32 s) · 25 min 30 min (23 mutations, banc de 60 s) · **~17 min** (32 mutations, banc de ~75 s, 3 files, 19/10) — **≈ nombre de mutations × durée du banc ÷ files** | 20 à 27 mutations, arbre copié, banc rejoué à chaque fois |
| Bancs voisins choisis par `tools/recette_selecteur.py` | **~20 min** (5 min 30 en 2 files) | 6 à 8 bancs Playwright |
| Contrôle ciblé (un banc ou un témoin seul) | **1 à 2 min** | un banc de 30 à 120 témoins |
| Codage d'une correction d'écran bornée | **~40 min** (D-086) · **~12 min** (D-087) | code seul, hors tests et documentation |

**Historique estimé / réel** (à compléter à chaque tâche estimée) :

| Tâche | Estimé | Réel | Écart expliqué |
|---|---|---|---|
| D-086 — 7 corrections UX (18/10) | 6 à 8 h | **3 h 44** | fourchette « par sécurité » sur un travail en grande partie déjà cadré (code ≈ 40 min) ; la passe complète (83 min) était le vrai poste |
| D-087 — note de la dernière fois + contrôle de non-régression (18/10) | **≈ 2 h 45** (≈ 2 h de travail + ≈ 45 min de tests ; risques à part : +30 min si un témoin est à re-viser, +80 min si une passe complète est demandée) | **52 min** de travail et de contrôles (13:38 → 14:30), puis le PDF et le rapport | encore trop haut, ×3 : ① les tests (mutations 7 min, bancs voisins 5 min 30) ont tourné **en 2 files, pendant** l'écriture de la comparaison et des documents — compter leur durée murale, pas leur somme ; ② le code était petit (12 min) et la comparaison a été **automatisée** (le même script rejoué sur 3 versions) au lieu d'une inspection à la main ; ③ aucun des deux risques ne s'est produit |
| Brief « D-088 » — import d'historique pendant la séance, « Note de la dernière séance », outil du prompt confiné (18/10, D-089) | **≈ 1 h 40** (≈ 1 h 20 de travail + ≈ 20 min de tests en durée murale ; risques à part : +20 min pour piloter l'import dans le banc, +15 min si l'import touchait la séance ; passe complète non prévue, +80 min si demandée) | **73 min** de travail et de contrôles (15:27 → 16:40), puis le PDF et le rapport | ≈ −27 % : ① le moteur existait — 2 lignes de code et 3 libellés, aucune logique neuve ; ② les tests (mutations 12 min 30 puis 25 min 30, bancs voisins + annexe 22 min, comparaisons 3 min) ont tourné **en 2 files, pendant** l'écriture — durée murale, pas leur somme ; ③ le risque « piloter l'import dans le banc » s'est produit (capture du message, panneau de l'ancienne ligne qui se replie) et a été absorbé (≈ 10 min) ; « l'import touche la séance » ne s'est pas produit. Poste dominant de la fin : la campagne de mutations D-088 (banc de 60 s × 23) |
| Publication du clone D-091 + D-092 (19/10) | **≈ 15 min** (push 2 min, Pages ~30 s, contrôles par l'API 5 min, documents 5 min ; risque à part : refusion + 2ᵉ passe ≈ 1 h 45 si master bougeait) | **11 min** (17:07 → 17:18, documents compris ; PDF et rapport en plus), master inchangé | un peu moins que prévu : Pages 29 s comme mesuré, contrôles par l'API et documents préparés d'avance plus rapides que les 10 min prévues — malgré deux imprévus, le port du mandataire changé en cours de journée (puits replacé, garde durcie et éprouvée, banc d'isolement rejoué ≈ 4 min) et les vérifications du site et de l'artefact refusées par le mandataire (≈ 2 min) |
| SEANCE-REPOS-01 — le repos survit à la fermeture de l'app (22/10, session-C) | **≈ 2 h 15** de développement + **≈ 2 h** de tests (dont la passe complète ≈ 85 min) ; risques à part : +30 min (garantie d'`app.js`), +20 min (témoin à re-viser), +85 min (2ᵉ passe) | développement **≈ 30 min** (09:48 → 10:18 : enquête sur la garantie, banc, code, aides) + **≈ 35 min** de documentation ; tests : contrôle négatif 37 min, voisins ≈ 18 min et annexe 6 min 38 **en parallèle**, passe n°1 **92 min**, témoin re-visé **≈ 20 min**, passe n°2 **93 min** — **≈ 4 h 45** de bout en bout (09:48 → 14:31) | développement **×4 trop haut** : la garantie s'est éclaircie en ~10 min (le commit d'origine se retrouve par la recherche de commits GitHub), et le moteur du repos avait déjà une seule source de vérité ; les deux risques nommés se sont produits (un témoin périmé, donc une 2ᵉ passe : +1 h 50) — *le poste dominant reste la passe complète, deux fois* |
| SEANCE-REPOS-01, avenant 15 min (D-102) + protection des calories (22/10 après-midi, session-C) | ⚠️ **non estimé au démarrage** (écart à D-088) ; estimation donnée en cours de lot, sur question de Michel : passe vers 22 h 35, livraison « vers minuit » (Paris) | ≈ **5 h** de bout en bout (17:16 → ≈ 22:30 UTC) : constante + 5 aides + témoins 900 s ≈ 25 min ; témoins calories et deux onglets ≈ 1 h ; revue adverse ≈ 30 min (dont une relance après la limite de session) ; 2 défauts du matin corrigés ≈ 40 min ; passe complète **101 min** (en parallèle d'autres bancs) ; contrôle négatif : 1ʳᵉ campagne **perdue** à 2 h (limite des tâches de fond), rejouée en 3 parts ≈ 1 h 35 | livraison ≈ **minuit et demi** au lieu de minuit : le changement demandé tenait en une constante ; le temps est allé à la preuve calories (demandée), aux **deux défauts du matin** trouvés par la revue, et à la campagne perdue — *un outil qui n'écrit ses résultats qu'à la fin parie sur la durée de sa propre tâche* |
| SEANCE-UX-IMAGES — vignettes de « Choisir un exercice » (23/10 nuit, session-C) | ⚠️ **non estimé au démarrage** (écart à D-088, **2ᵉ fois de suite** après l'avenant) | ≈ 3 h 31 de bout en bout (00:22 → 03:53 UTC) : code, banc, 1ᵉʳ contrôle négatif et documentation ≈ 25 min (00:22 → 00:46) ; redémarrage du conteneur ≈ 40 min (la revue adverse en cours est perdue) ; contrôle négatif rejoué ≈ 6 min (2 files) ; revue indépendante ≈ 18 min, pendant les voisins (≈ 15 min, 2 files) ; débordement confirmé par mesure, corrigé, témoin et 3 casses ajoutés ≈ 30 min ; contrôle négatif ≈ 10 min ; voisins + annexe ≈ 8 min ; passe complète 90 min | le code tenait en une table et 5 règles de style ; le temps est allé à la preuve — et la revue indépendante a trouvé un vrai défaut que 18 témoins et 17 casses n'avaient pas vu : *un témoin ne voit que les largeurs où on le fait tourner* |
| Vignette Mollets (2ᵉ ZIP, 23/10 matin, session-C) | ⚠️ **non estimé au démarrage** (écart à D-088, **3ᵉ fois de suite**) | ≈ 28 min (07:17 → 07:45 UTC) : inspection du fichier, découverte du fond blanc, mesures du cadre et de l'ancrage, code et témoins ≈ 10 min ; contrôle négatif ≈ 10 min (2 files, pendant la documentation) ; voisins, comparateur, bouton ≈ 6 min ; puis captures, PDF et rapport | le changement demandé tenait en une ligne ; le temps est allé au fichier, qui n'était pas une vignette prête (fond blanc) — *une consigne « ne rien changer d'autre » ne dispense pas de regarder ce qu'on branche* |
| Contre-vérification de l'audit transversal Séance de ChatGPT (23/10 soir, session-C, analyse seule) | ⚠️ **non estimé au démarrage** (écart à D-088, **4ᵉ fois de suite** — il faut l'écrire avant la première commande, pas après) | ≈ **1 h** de bout en bout (≈ 17:55 → 18:55 UTC) : lecture des 3 documents, reproductions F01→F19 et contre-épreuves 17:55 → 18:11 ; cas P0 de la matrice 18:11 → 18:20 (dont une reprise : mon quota simulé ne mordait pas) ; en parallèle, **deux vérifications déléguées** (≈ 18:00 → 18:28) et **20 bancs rejoués en tâche de fond** (18:12 → 18:31) ; rejeu des preuves déléguées 18:28 → 18:40 ; rapport, suivi, PDF 18:40 → 18:55 | la délégation et les bancs en tâche de fond ont absorbé l'attente ; le temps perdu vient de mes propres scénarios mal posés (quota, `openSessDetail` appelé par `id`) et d'un PDF dont le titre sortait deux fois — *un scénario se vérifie sur le code qu'il conduit avant d'être cru, et un PDF se regarde, pas seulement se compte* |

---

## 🎯 Objectif

Le code n'est qu'une **partie** du travail. Une brique n'est terminée que
lorsque :
- le code fonctionne,
- la documentation est à jour,
- la traçabilité est complète,
- **l'état du projet est immédiatement compréhensible.**

## ❓ Pourquoi ?

Pour qu'à **tout moment** on puisse reprendre le projet **sans relire des
centaines de lignes de code**. Chaque décision doit rester compréhensible des
mois — ou des années — plus tard.

---

## 🔧 Adaptation Force Tracker (le vrai flux)

Force Tracker se **déploie sur `master`** (GitHub Pages met en ligne
directement ; le backend Apps Script + le Worker Cloudflare s'auto-déploient).
Le « branche → merge » classique se traduit donc ainsi :

- **Sauvegarde = point de restauration**, pas une branche de feature fusionnée :
  - commit clair **avant** la modif (rollback facile),
  - **branche de backup** poussée pour un jalon important (ex.
    `backup-AAAA-MM-JJ-sujet`) → restauration en 1 ligne
    (`git reset --hard origin/<branche-backup>`).
- **Gros chantier ou risqué** → on construit dans le **bac à sable `/clone/`**,
  Michel valide sur l'URL du clone, PUIS on **promeut** en prod.
- **Petite brique sûre** → commit + push sur `master`, **puis** Michel valide sur
  iPhone (le déploiement est réversible via le rollback).
- **Backend / migration / suppression** → branche + **tag/branche de backup**
  d'abord, et de préférence **la nuit** (0 utilisateur en séance).
- Toujours **bumper `sw.js` (`ft-vNN`)** à chaque release qui touche un asset,
  et **journaliser en temps réel** (règle d'or #12).

> En clair : la rigueur du cycle (spéc → challenge → tests → clôture → doc) est
> **identique** ; seule la mécanique Git est adaptée au fait qu'on déploie en
> continu sur `master` plutôt que via des PR.

---

## 🔭 Croiser les regards extérieurs (adopté le 20/07/2026)

Le projet avance à plusieurs IA (**Michel décide · Claude archi/dev · GPT
vision**) et fait ponctuellement appel à des **regards extérieurs** (Gemini,
Mistral…) pour un avis franc. La règle, proposée par GPT et validée :

- **Convergence** de plusieurs regards **indépendants** sur une même idée
  → **décision d'architecture** (on grave et on avance).
- **Divergence** → **débat technique** explicite **avant** d'implémenter.
- Un nouvel avis n'a de valeur que s'il ouvre une **dimension nouvelle**
  (règle des personas) — pas juste « un avis de plus » (sinon = bruit +
  contradictions qui ralentissent la décision).
- **Honnêteté du briefing** : quand on sollicite une IA extérieure, lui préciser
  ce qui **existe déjà** — sinon elle classera « urgent » des choses déjà faites
  (piège vécu : Mistral a cru la sauvegarde absente alors qu'elle est en place).

> Exemple fondateur (20/07) : Gemini + Mistral ont **convergé** sur « ne pas
> sur-modéliser le graphe biomécanique » et « la couche machine, le risque =
> les médias » → ces 2 convergences sont **devenues des décisions d'archi VM**.

---

*Ce document est la méthode officielle de Force Tracker. Il évolue si la méthode
elle-même évolue (rare) — la discipline, elle, reste stable.*
