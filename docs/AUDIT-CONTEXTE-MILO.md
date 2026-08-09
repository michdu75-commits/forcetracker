# 🔬 AUDIT — le contexte envoyé à Milo

> **Aucune modification de code.** Analyse seule, demandée par Michel le 09/08/2026.
> Tout ce qui suit est **mesuré en exécutant l'application**, jamais déduit du code à l'œil.

## Méthode

Le contexte est construit par `buildCoachContext(msg)` (`coach.js:1597`), qui rend
`_gardienRules()` + un gabarit unique. Trois mesures ont été faites dans un vrai navigateur,
sur un profil réaliste (40 séances, records, poids, sommeil, premium) :

1. **taille par différence** — on retire une donnée, on remesure le contexte ;
2. **découpe par en-tête** — le texte produit est recoupé sur ses titres réels ;
3. **variation du message** — le même profil avec 5 messages différents.

⚠️ **Deux erreurs de ma sonde, corrigées avant de conclure** (elles auraient produit un audit faux) :
- mes fausses données utilisaient `S.objectives`, `S.registre`, `S.checkins` — **ces champs
  n'existent pas** ; les vrais sont `S.priorities`, `S.strengthGoals`, `S.healthProfile`,
  `S.coachQuiz`. Six blocs mesuraient « 0 » à cause de moi, pas du code ;
- j'appelais `buildCoachContext()` **sans message**, ce qui force l'envoi du catalogue. La
  vraie prod passe le message (`coach.js:2534`) — le conditionnement existe déjà.

---

## Les 3 zones de facturation

Le worker Cloudflare coupe le prompt en trois au marqueur `═══ SITUATION DE L'INSTANT ═══`
(`worker.js:314`) :

| Zone | Taille | Part | Cache | Prix réel |
|---|---:|---:|---|---|
| **Commun** — identique pour tous | 36 352 | 57 % | 1 h | ~10 % s'il est relu |
| **Personnel** — les données de la personne | 7 650 – 9 960 | 13-16 % | 5 min | ~10 % s'il est relu |
| **Instant** — après le marqueur | 17 339 | **27 %** | ❌ **jamais** | **100 %, à chaque message** |
| **TOTAL** (message d'entraînement) | **60 775** | | | |

**Le chiffre qui cadre tout l'audit : un profil totalement VIDE produit déjà 58 381 caractères,
soit 92 % du prompt d'un utilisateur complet.** Les données personnelles d'un athlète avec
40 séances ne pèsent que ~5 300 caractères. **Ce n'est pas la personne qui coûte cher, ce sont
les instructions.**

---

## Tableau d'audit

Colonnes : **T** = taille · **Chaque msg ?** = indispensable à chaque message · **Code ?** =
calculable par le code · **Déplaçable ?** = peut passer dans une zone cachée · **Gain** = gain
potentiel par message.

### ZONE « INSTANT » — jamais cachée, payée plein tarif (17 339 car.)

| # | Bloc | T | Condition d'injection | Pourquoi Milo en a besoin | Chaque msg ? | Code ? | Redondant ? | Déplaçable ? | Gain | Risque si retiré | Classe |
|---|---|---:|---|---|---|---|---|---|---:|---|:--:|
| 1 | 🏋️ **Catalogue d'exercices** | 9 264 | **déjà conditionné** : message OU 4 derniers tours contenant un mot d'entraînement, message < 25 car., < 2 tours, aucune séance → envoi complet (`_ctxEntrainement`, `coach.js:2128`). Filtré par **lieu** si renseigné | nommer un exercice que l'app **reconnaît** — sinon la démo, les records et le suivi tombent (R8, bug ft-v713) | Non — et c'est **déjà** géré | Non | Non | Partiellement : la liste bouge quand la personne crée un exercice perso ou change de lieu | 0 (déjà pris) | **Élevé** — Milo invente des noms d'exercices | **D** |
| 2 | **INTÉGRER LA SÉANCE DANS L'APP** | 2 286 | **aucune** — toujours | format du bloc technique que l'app relit pour créer la séance | Non — utile seulement s'il propose une séance | Non | Non | **Oui** — texte 100 % fixe | 2 286 | Moyen — le bloc séance peut être mal formé | **C** |
| 3 | **MODÈLE DE PROGRAMME PRO** | 1 396 | **aucune** — toujours | niveau de détail attendu quand on demande un programme | Non — sert sur une demande de programme | Non | Non | **Oui** — texte 100 % fixe | 1 396 | Faible — programmes moins détaillés | **B** |
| 4 | 🌟 **CRÉER LE PREMIER MOMENT MILO** | 1 151 | **aucune** — toujours | soigner le tout premier échange | **Non** — le texte dit lui-même « surtout au TOUT PREMIER échange » | **Oui** (`coachHistory.length`) | Non | **Oui** | 1 151 | Faible — hors du 1ᵉʳ échange | **B** |
| 5 | **SE SOUVENIR DE LA PROCHAINE SÉANCE** | 921 | **aucune** — toujours | cohérence avec une séance annoncée | Non — seulement si `S.nextPlanned` existe | **Oui** | Partiel (le fait est ailleurs) | **Oui** | 921 | Faible | **B** |
| 6 | **ORDRE ET EXHAUSTIVITÉ du bloc** | 915 | **aucune** — toujours | le bloc séance doit refléter la réponse | Non — lié au bloc n°2 | Non | **Oui — avec n°2** | **Oui** | 915 | Moyen | **C** |
| 7 | Note « au-dessus de cette ligne = identique » | 860 | **aucune** — toujours | explique le découpage du cache | **Non** — c'est une note d'architecture | — | Non | **Oui** | 860 | **Aucun connu** | **B** |
| 8 | **RÉCUPÉRATION & SOMMEIL** | 515 | si `S.sleepLog` / check-ins | l'état du jour réel | **Oui** | Déjà calculé (score) | Non | Non — change chaque jour | 0 | Élevé | **D** |
| 9 | **MOMENT PRÉSENT** (heure) | 301 | toujours | saluer et conseiller selon l'heure | **Oui** | Déjà calculé | Non | **Non** — change à chaque message | 0 | Moyen | **D** |
| 10 | En-tête `SITUATION DE L'INSTANT` | 31 | toujours | marqueur de coupure de cache | Oui | — | Non | Non | 0 | **Critique** — casse le cache | **D** |

> **Total réellement variable dans cette zone : ~816 caractères** (n°8 + n°9).
> **~6 500 caractères y sont strictement fixes** (n°2, 3, 4, 5, 6, 7) et payés plein tarif à
> chaque message **uniquement à cause de leur position dans le fichier**.

### ZONE « COMMUN » — cachée 1 h (36 352 car.)

| # | Bloc | T | Condition | Chaque msg ? | Code ? | Déplaçable ? | Risque si retiré | Classe |
|---|---|---:|---|---|---|---|---|:--:|
| 11 | Personnalité, méthode de coach, raisonnement, sécurité, mémoire, ancre/accessoire, pertinence, cohérence | ~24 000 | aucune | Oui | Non | déjà au bon endroit | **Critique** | **D** |
| 12 | **NUTRITION** (bloc complet) | ~9 350 | **aucune** | Non — inutile sur une question d'entraînement pur | Non | déjà caché | Faible/moyen | **C** |
| 13 | **CALENDRIER** (hier/aujourd'hui/demain + 14 j) | ~600 | toujours | Oui (1×/jour) | **Déjà fait par le code** — c'est son rôle | déjà caché ; **change à minuit**, donc stable dans une fenêtre de cache | **Élevé** — bugs ft-v658/660 | **D** |
| 14 | Bloc **admin** (`_estSuperAdmin()`) | ~1 000 | **admin uniquement** | — | — | **crée 2 empreintes de cache** au lieu d'1 | Aucun pour les autres | **C** |

### ZONE « PERSONNEL » — cachée 5 min (7 650 – 9 960 car.)

| # | Bloc | T mesurée | Condition | Code ? | Risque si retiré | Classe |
|---|---|---:|---|---|---|:--:|
| 15 | 40 dernières séances (détail) | **3 559** | `S.sessions` | non | Élevé | **D** |
| 16 | Historique compact | 1 461 | `_historiqueCompact()` | non | Élevé | **D** |
| 17 | Bilan corporel | 961 | `S.bodyScans` | non | Moyen | **D** |
| 18 | Mémoire longue | 946 | `_memoireLongue()` | non | Élevé | **D** |
| 19 | Prochaine séance annoncée | 477 | `S.nextPlanned` | oui (le fait) | Moyen | **D** |
| 20 | Séance **en cours** | 323 | `S.wkt` | non | Élevé | **D** |
| 21 | Statut premium | 258 | toujours | oui | Faible | **C** |
| 22 | Records (PRs) | 147 | `S.prs` | non | Élevé | **D** |
| 23 | Niveau | 96 | `S.level` | non | Moyen | **D** |
| 24 | Exercices perso | 66 | `S.customExercises` | non | Moyen | **D** |
| 25 | Poids / sommeil | 57 / 33 | logs | déjà agrégé | Moyen | **D** |
| 26 | `_gardienRules()` — blessures | **0 ici** | **uniquement si blessure déclarée** | non | **Critique** (sécurité) | **D** |
| 27 | `_coachQuizContext()` | **0 ici** | uniquement si questionnaire rempli | non | Moyen | **D** |

⚠️ **26 et 27 mesurent 0 sur mon profil de test parce que les données sont absentes, pas parce
que le code ne les envoie pas.** Non démontrable autrement sans un profil réel.

---

## Ce que le conditionnement fait DÉJÀ (mesuré)

| Message | Taille | Catalogue |
|---|---:|:--:|
| « je fais quoi comme séance aujourd'hui ? » | 60 775 | ✅ |
| « salut » (< 25 car. → on envoie tout, exprès) | 60 775 | ✅ |
| « je me sens fatigué, j'ai mal dormi » | **45 996** | ❌ |
| « qu'est-ce que je mange ce soir ? » | **45 996** | ❌ |
| + lieu = « maison sans matériel » | 52 985 | ✅ (filtré) |

**Le levier le plus gros est déjà en place et fonctionne : −14 779 caractères (−24 %) sur un
message hors entraînement.**

---

## Classement demandé

**A — CERTAIN (démontré par la mesure)**
- Le prompt fait **60 775 car.** sur un message d'entraînement, **45 996** sinon.
- **92 % du prompt part même vers un profil vide** — le coût n'est pas dans les données de la personne.
- **27 % du prompt n'est jamais caché**, dont **~6 500 car. strictement fixes**.
- Le catalogue (9 264 car.) est **déjà conditionné** au message et au lieu.
- Seuls **~816 car.** de la zone non cachée changent réellement d'un message à l'autre.

**B — PROBABLEMENT INUTILE À CHAQUE MESSAGE**
- n°7 note d'architecture du cache (860) — aucun effet sur le comportement identifié.
- n°4 « Moment Milo » (1 151) — le texte lui-même le limite au premier échange.
- n°5 « prochaine séance annoncée » (921) — n'a de sens que si `S.nextPlanned` existe.
- n°3 « Modèle de programme pro » (1 396) — ne sert que sur une demande de programme.

**C — MÉRITE UNE ÉTUDE**
- n°2 + n°6 « intégrer la séance » (3 201 ensemble) : conditionnables comme le catalogue, **mais
  même risque asymétrique** — sans eux, le bloc que l'app relit peut être mal formé.
- n°12 bloc nutrition (9 350) : gros, mais **déjà caché** → gain réel faible, risque de dilution non mesuré.
- n°14 bloc admin : **coupe le cache commun en deux empreintes**. À mesurer.
- n°21 statut premium (258) : reformulable en une ligne.

**D — INDISPENSABLE**
- Tout le socle de comportement, sécurité et raisonnement (n°11).
- Le calendrier (n°13) — il **corrige** deux bugs réels ; le retirer les ramène.
- Toutes les données réelles de la personne (n°15→27), y compris le Gardien blessures.
- L'heure et la récupération (n°8, 9) — ce sont les seules choses qui changent vraiment.

---

## Conclusions

1. **Le vrai sujet n'est pas la longueur, c'est la POSITION.** ~6 500 caractères parfaitement
   fixes vivent après le marqueur de cache et sont donc payés **plein tarif** à chaque message,
   alors que le même texte placé 20 lignes plus haut coûterait **10 %**. À qualité de réponse
   **strictement identique**.

2. **Réduire le prompt rapporterait peu.** 57 % est déjà caché 1 h ; y retirer du texte ne fait
   économiser que 10 % de ce qu'on retire. L'effort utile porte sur les 27 % non cachés.

3. **Le conditionnement au message marche déjà** (−24 %) et il est bien conçu : il lit les
   4 derniers tours, pas seulement le message, et penche toujours du côté de l'inclusion.

4. **Rien ne suggère de toucher au comportement de Milo.** Aucun bloc de personnalité,
   sécurité ou raisonnement n'apparaît comme superflu ; le socle est cohérent et chaque règle
   y est reliée à un incident réel.

5. **Ce que je ne peux PAS démontrer depuis le code :** l'effet d'un prompt plus court sur la
   **qualité** des réponses. Le code dit ce qui est envoyé, pas ce que le modèle en fait.
   Toute affirmation du type « alléger rendra Milo plus obéissant » est une hypothèse — elle
   demanderait une comparaison à l'aveugle sur des cas réels.

6. **Question ouverte, non tranchée ici :** le bloc admin crée une **seconde empreinte de cache**.
   Sur peu d'utilisateurs, ça peut coûter plus cher que ce qu'il économise. Mesurable.
