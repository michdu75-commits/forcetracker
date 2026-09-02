# FORCE TRACKER — DOSSIER COMPLET POUR UNE SESSION NEUVE

> **À lire en premier.** Ce document est écrit pour une IA extérieure (GPT) qui **démarre une
> session vierge** : aucune mémoire des échanges précédents, **aucun accès au dépôt**.
> Tout ce qu'il contient a été **mesuré le 02/09/2026** sur la version `ft-v1101` réellement
> en ligne. Rien n'est écrit de mémoire.
>
> ⛔ **Il ne suffit pas de connaître l'architecture.** La partie la plus utile de ce dossier
> est le **chapitre 9** : *ce qui a déjà été essayé, mesuré, et écarté — avec la raison*.
> Sans lui, une proposition parfaitement sensée sur le papier peut re-proposer une chose que
> le projet a déjà refusée sur la base de chiffres.

---

## SOMMAIRE

1. Ce qu'est Force Tracker, et pour qui
2. Comment on travaille ensemble (le rôle de chacun)
3. Les règles non négociables
4. Les règles de construction
5. L'architecture technique
6. Le stockage et les flux de données
7. Milo : ce qu'il reçoit exactement
8. Les familles de bugs déjà connues
9. **Ce qui a été mesuré et ÉCARTÉ** (le chapitre à ne pas sauter)
10. Les tests existants
11. L'état courant
12. Défauts ouverts, non corrigés
13. Les 10 audits à faire ensuite
14. Comment être utile ici

---

## 1. CE QU'EST FORCE TRACKER, ET POUR QUI

**Force Tracker** est une application web de suivi de musculation (PWA), conçue pour mobile
(largeur max 430 px), servie par GitHub Pages. Elle est née le **17 juin 2026**.

Son auteur, **Michel**, n'est **ni développeur ni programmeur**. Il conçoit le produit, tranche
les décisions, et teste sur le terrain. C'est un point de méthode, pas une anecdote : toute
explication doit être **simple, courte, la réponse d'abord**, et tout risque doit être annoncé
**avant** d'être pris.

### Les deux phrases qui tiennent le produit

> **« Force Tracker n'est pas une intelligence artificielle. C'est une mémoire sportive
> intelligente. »**

> **« Force Tracker ne te dit pas qui tu dois devenir. Il se souvient de qui tu es devenu. »**

Et sa formulation la plus humble, proposée par GPT lui-même en juillet 2026 :

> **« Force Tracker ne cherche pas à créer une IA plus intelligente que le sportif. Il cherche
> à rendre le sportif plus lucide grâce à sa propre histoire. »**

**Question de contrôle avant toute proposition :** *est-ce que cela renforce l'esprit Force
Tracker ?* Et sa variante : *l'app s'adapte au sportif, ou l'inverse ?*

### Milo

**Milo** est le coach IA du produit. Il n'est pas un chatbot greffé : il est censé **connaître
la personne** et raisonner sur son histoire. Son pipeline conceptuel est
**Compréhension → Diagnostic → Décision → Explication** — le *diagnostic* étant l'étape qui
manquait au départ : même contexte, cause différente, stratégie différente.

Sa limite est **volontaire** : **fiabilité avant intelligence**. Ne jamais faire semblant de
savoir, et savoir s'arrêter.

### Les personas fondateurs

Ce ne sont pas des profils de test, ce sont les **dimensions** du projet.

| Persona | Dimension | Ce qu'il apporte |
|---|---|---|
| **Michel** | Vision & Architecture | Fait émerger les idées, relie les modules, tranche |
| **Christophe** | Terrain & Métier | Usage réel en salle, machines, import de programmes |
| **Tatiana** | Personnalisation | **Ne présume jamais** ce que la personne veut |
| **Emma** | Physiologie & Ressenti | Cycle féminin, récupération, ressenti avant chiffres |

Un nouveau persona n'entre que s'il ouvre une **dimension** nouvelle.

---

## 2. COMMENT ON TRAVAILLE ENSEMBLE

Modèle adopté en juillet 2026 :

- **Michel décide.** Toute décision produit, tout arbitrage, toute dépense lui revient.
- **Claude** fait l'architecture et le développement.
- **GPT** (vous) apporte la vision, l'UX, le regard extérieur, et le **contre-audit**.
- **Le dépôt est la source de vérité commune.** Il n'y a pas de dialogue direct entre IA.

⭐ **Votre valeur la plus démontrée dans ce projet est le contre-audit** : vous avez déjà fait
remonter de vrais défauts (la contradiction entre les plages de poids affichées et la logique
appliquée par Milo, par exemple). Continuez à contredire — mais voir le chapitre 9.

⚠️ **Deux sessions Claude travaillent en parallèle** sur ce dépôt. Elles se coordonnent par un
journal partagé. Cela n'a pas d'incidence sur vous, sauf pour comprendre pourquoi les numéros
de version avancent parfois par deux.

---

## 3. LES RÈGLES NON NÉGOCIABLES (« règles d'or »)

Elles sont relues à chaque session de travail. Les plus structurantes :

1. **Apps Script : toujours redéployer** après un changement de code backend — pousser ne suffit pas.
2. **Ne jamais écraser la liste des accès premium.**
3. **🛡️ Zéro perte de séance — priorité n°1 absolue.** Local d'abord ; le réseau ne bloque jamais.
4. **⚡ Ouverture instantanée à la salle**, même hors ligne. Le démarrage n'attend aucune requête.
5. **Incrémenter le numéro de cache `ft-vNN`** à chaque déploiement.
6. **Avant toute opération risquée : sauvegarde et branche.**
7. **Garder l'identité visuelle.** Une chose à la fois, testée avant de continuer.
8. **Commit étiqueté avant, tag stable après, retour arrière en une ligne.**
9. **Le bouton central « + » de l'écran Séance est SENSIBLE** : toute modification de cet écran
   doit vérifier qu'il **ne bouge pas** — en le **mesurant**, pas en le regardant.
10. **Michel n'est ni développeur ni programmeur.** Expliquer simplement, prévenir avant tout
    risque, **court par défaut**.
11. **À chaque fonctionnalité en production : prévenir l'utilisateur** — point rouge, aide de
    l'onglet, aide détaillée, diapositive du guide. ⚖️ **La pop-up se mérite** : seulement si la
    personne doit *faire* quelque chose, ou si un repère a bougé. **La pop-up ANNONCE, l'aide
    EXPLIQUE.**
12. **Tenir tous les fichiers de suivi à jour en temps réel.**
13. **Deux sessions à la fois = deux fois le même travail** — d'où le journal partagé.

### La Constitution de Milo (principes de comportement)

Indépendants du modèle utilisé. Les plus opérants :

- **La personne d'abord.** Sécurité avant performance.
- **Adapter, jamais interdire** — le Gardien protège sans bloquer.
- **Milo propose, la personne valide.** Rien n'est mémorisé sans accord.
- **Comprendre avant de conseiller**, et **le ressenti prime sur les chiffres**.
- **Miroir, jamais prophète.**
- **Aucun diagnostic médical.** Renvoi au médecin.
- La nutrition **ne doit jamais devenir une source de stress supérieure au bénéfice qu'elle
  apporte**.

---

## 4. LES RÈGLES DE CONSTRUCTION

Chacune est née d'un **événement réel**. Celles qu'il faut connaître pour proposer quelque
chose d'acceptable ici :

| Règle | Énoncé | Née de |
|---|---|---|
| **R1/R2** | Une information a **un seul propriétaire**. Deux endroits qui stockent la même chose **divergeront** — la seule question est quand. | constaté 7 fois |
| **R3** | Toute connaissance doit produire un **comportement observable**. Différé est acceptable, mais il doit être **nommable**. | 4 bugs de contexte |
| **R4** | L'information doit descendre jusqu'à la **DONNÉE**, jamais rester dans le **TEXTE**. *La famille la plus coûteuse du projet.* | 11 occurrences |
| **R7** | Le cerveau de Milo est distribué : **le prompt est le DERNIER levier**, après le structurel et la hiérarchie des règles. | 3 durcissements inutiles |
| **R8** | **Un prompt ne compense jamais une donnée absente.** Si Milo redemande sans cesse une info, c'est l'interface qui ne la collecte pas. | 5 occurrences |
| **R9** | Le **niveau de modèle** est une variable structurelle : on évalue Milo sur le modèle des vrais utilisateurs, jamais sur le haut de gamme. | un « interrogatoire » attribué au prompt, causé par le modèle |
| **R10** | Les permissions sont **bornées à un domaine**. Une permission globale déborde toujours. | une permission d'entraînement a fait inventer une maladie |
| **R17/R35** | **Chaque bug devient un test permanent.** Le banc d'essai n'a pas de taille cible : il grandit à chaque bug rencontré. | — |
| **R19** | **Gouvernance légère** : chaque procédure doit réduire un risque, sinon on la coupe. | — |
| **R23** | Une fonctionnalité livrée **sans trace écrite** devient invisible : on la re-propose ou on affirme à tort qu'elle manque. | l'import de prise de sang, déclaré manquant alors qu'il existait depuis 3 semaines |
| **R24/R25/R26** | **Informer sans bloquer.** Le format incite, la contrainte braque. | — |
| **R28** | **Une limite non vérifiée devient une règle de conception silencieuse.** *Un bug coûte une correction ; une fausse limite coûte tout ce qu'on n'a jamais imaginé.* | Michel a conçu l'app des semaines en se croyant bridé graphiquement — c'était faux |
| **R29** | **Le droit de deviner dépend du coût de l'erreur.** Erreur gratuite → devine. Erreur qui touche la personne → montre et laisse-la trancher. Et si l'app ne sait pas, **elle se tait**. | — |
| **R30** | **Un retrait volontaire doit être écrit, sinon il redevient un bug** — du code orphelin ressemble exactement à un oubli. ⚠️ Et symétriquement : **avant de promouvoir un essai mis de côté, chercher pourquoi il l'était.** | un calculateur retiré exprès, « réparé » 3 mois plus tard |
| **R33** | Le **format du fabricant** ne devient jamais le format interne. Ordre des sources : donnée structurée → PDF texte → OCR → IA → **échec propre**. | 5 rapports de balance |
| **R34** | Un changement de **contexte** se valide par un **banc d'essai avant/après**, jamais au ressenti. | — |

---

## 5. L'ARCHITECTURE TECHNIQUE

### 5.1 Ce qui décide de tout

L'application est en **JavaScript « vanilla », sans framework et sans étape de build**. Trois
conséquences :

1. **Pas de modules.** Tous les scripts partagent un **espace global unique** : une fonction
   définie dans un fichier est appelable partout. Ni `import` ni `export`.
2. **L'état tient dans un objet global unique, `S`**, sauvegardé dans le `localStorage`. Pas de
   base de données côté client.
3. **L'ordre de chargement compte.**

Le serveur est un **Google Apps Script** (sauvegarde, premium, import de documents), doublé
d'un **Cloudflare Worker** (tous les appels d'IA — chemin choisi parce qu'Apps Script casse en
4G/5G). Un miroir **Supabase** sert de sauvegarde secondaire.

### 5.2 Les fichiers servis, dans l'ordre de chargement

| # | Fichier | Lignes | Rôle |
|---|---|---|---|
| 1 | `constants.js` | 2 304 | Catalogue d'exercices, tables de muscles, URLs, nouveautés, aiguillage IA |
| 2 | `state.js` | 2 010 | L'objet `S`, `load()`, `persist()`, et les calculs de base |
| 3 | `supabase.js` | ~250 | Miroir de sauvegarde |
| 4 | `screens.js` | 3 213 | Navigation, Accueil, Nutrition, aide contextuelle |
| 5 | `log.js` | 8 990 | Écran Séance, programmes, sélecteur d'exercices, muscles |
| 6 | `setup.js` | 3 690 | Profil, Progrès, **restauration de compte**, sync, exports |
| 7 | `tracking.js` | 3 578 | Cycle de force, badges, check-in, poids, bilans, `toast()` |
| 8 | `coach.js` | 7 728 | **Milo** : contexte, envoi, Gardien, aide détaillée, banc d'essai |
| 9 | `food-health.js` | 431 | Score santé des aliments |
| 10 | `app.js` | 6 826 | Démarrage, badges, calories/MET, administration, guide |

**Volumétrie mesurée :** ~38 500 lignes de JS servi · **1 569 fonctions globales** ·
**340 constantes** · **143 clés `localStorage`** · **106 champs** dans `S`.

`Code.js` (3 607 lignes, backend) et `worker.js` (906 lignes, Cloudflare) ne sont pas servis au
navigateur.

### 5.3 Les fonctions au plus grand rayon d'impact

| Fonction | Appels | Ce qu'elle touche |
|---|---|---|
| `toast()` | 519 | affichage seulement — risque faible malgré le nombre |
| `persist()` | 217 | **écrit tout `S` sur le disque** — rayon maximal |
| `_escNote()` / `_escIdea()` | 57 / 44 | échappement de texte libre — **deux fonctions pour un même besoin** |
| `goScreen()` | 36 | navigation — **ajoute le préfixe `s-` lui-même** (piège classique) |
| `showConfirm()` | 27 | toutes les confirmations destructrices |

### 5.4 Zones classées par risque (justifié par des faits mesurés)

| Zone | Risque | Pourquoi |
|---|---|---|
| `persist()` et l'écriture de `S` | **ÉLEVÉ** | 217 appels, écrit **tout** l'état, une seule fonction pour 106 champs |
| Contexte de Milo | **ÉLEVÉ** | ~75 000 caractères, 56 champs atteints via 61 fonctions, l'oubli y est **silencieux** |
| `finishWorkout()` / édition de séance | **ÉLEVÉ** | écrivent `sessions` **et** `prs` et déclenchent 2 synchronisations |
| `_applyRestoreData()` | **ÉLEVÉ** | écrit **71 champs** d'un coup, chemin automatique, personne ne relit |
| Muscles (`_mscScores`) | **MOYEN** | 15 consommateurs ; sa finesse **plafonne** tout ce qui en dépend |
| Service Worker | **MOYEN** | voir 5.5 |
| Échappement du texte libre | **MOYEN** | deux propriétaires pour une garantie de sécurité |

### 5.5 Service Worker

- Version actuelle **`ft-v1101`**, écrite **à la main** en tête de `sw.js`.
- Trois caches : le code (versionné, purgé), les images (**nom stable**), l'OCR (stable).
- Stratégie : navigation → cache d'abord avec revalidation ; assets → cache d'abord.
- `skipWaiting()` + `clients.claim()` → la nouvelle version s'active immédiatement.

⚠️ **Le risque n'est pas seulement d'oublier le numéro, c'est d'oublier d'ajouter un nouveau
fichier à la liste de pré-cache.** Cas réel : `supabase.js` était **le seul des 10 scripts**
absent du pré-cache. Conséquence silencieuse — hors ligne après une mise à jour, le script
échoue, la sauvegarde miroir est morte pour toute la session, et un `try/catch` avale
l'absence. **Aucun test ne couvre cette zone.**

---

## 6. LE STOCKAGE ET LES FLUX

### 6.1 Le principe, et sa conséquence

`persist()` écrit **l'intégralité de `S`** depuis la mémoire de l'onglet appelant. Simple et
robuste dans le cas normal — mais **l'onglet qui écrit en dernier gagne**.

### 6.2 Ce qui est historisé, et ce qui ne l'est pas

| Nature | Exemples |
|---|---|
| **Historisé** | séances, journal de poids, sommeil, journal alimentaire, bilans corporels, historique du check-in |
| **Écrasé** | profil, mensurations (cou, taille, hanches), poids objectif, réglages |
| **Dérivé mais stocké** | les records (`prs`), le volume et les calories de chaque séance |

⚠️ **Les records sont dérivés mais stockés, et c'est VOLONTAIRE.** Un record peut venir d'un
import ou d'un autre appareil ; le recalculer automatiquement **effacerait un vrai record**.
La fonction de recalcul existe, mais elle est réservée à un outil d'administration, et elle
sépare explicitement les hausses (sûres, prouvées par l'historique) des baisses (non sûres).
**Ne pas proposer de recalcul automatique sans traiter ce cas.**

### 6.3 Propriété des données

Sur les 106 champs de `S`, **73** sont écrits depuis plusieurs fichiers. **Ce chiffre brut est
trompeur.** Trois fonctions écrivent en masse par construction :

| Fonction | Champs écrits | Rôle |
|---|---|---|
| `load()` | 106 | charge tout au démarrage |
| `_applyRestoreData()` | 71 | restaure un compte |
| `_vcApplyPersona()` | 54 | remet à zéro pour un persona de **test** (anti-fuite) |

**Une fois ces trois retirées, il reste 25 champs à écrivains multiples.** C'est ce chiffre qui
veut dire quelque chose. Les plus exposés : `healthProfile` (4 fichiers, donnée sensible),
`bw`/`weightLog`/`neck`/`waist`/`hip` (saisie manuelle **et** bilan corporel), et
`prs`/`sessions`/`wkt` (le cœur de l'entraînement).

### 6.4 Flux principaux, suivis dans le code

**Séance :** saisie → `S.wkt` → disque à chaque validation → fin de séance : volume, calories,
records → `S.sessions` + `S.prs` → deux synchronisations → contexte de Milo.
*Une séance en cours n'entre dans l'historique **qu'à la fin**.*

**Records :** `sessions` → formule de Brzycki → e1RM par série → maximum par exercice.
⚠️ **La formule plafonne les répétitions à 20** : toute charge à 20 reps ou plus vaut
2,1 × la charge. C'est ce qui a permis à un import mal lu de créer un record de 1 060 kg.

**Nutrition :** profil → métabolisme de base → dépense totale → macros → cyclage
glucides/lipides selon jour de séance ou de repos. Le **journal alimentaire n'est PAS transmis
à Milo** — exclusion écrite et assumée.

**Poids :** pesée manuelle et bilan corporel écrivent **le même** journal ; les deux sont
bornés à 20–300 kg depuis peu. La tendance (kg/semaine) est comparée aux plages de l'objectif,
et **l'écran et Milo lisent désormais la même source**.

---

## 7. MILO : CE QU'IL REÇOIT EXACTEMENT

### 7.1 Le message a SIX canaux, pas un

```
{ action, email, message,
  context      ← ~75 000 caractères, construit par buildCoachContext()
  history      ← les 8 derniers messages
  coachMemory  ← la mémoire longue, HORS du contexte }
```

⚠️ **Conséquence pour tout audit** : `coachMemory` ne figure **pas** dans le contexte. Un audit
qui n'inspecte que le contexte le déclarera manquant alors qu'il part bien.

### 7.2 Ce qui est transmis — mesuré, pas déclaré

**56 champs de `S`** atteignent le contexte, via 61 fonctions auxiliaires. Vérification
systématique faite sur les sources que le prompt **nomme** (« ta bibliothèque », « ton
planning », « ses records »…) : **0 trou sur 11 sources**.

Sont transmis : profil, séances, records, catalogue et exercices persos, programmes, poids et
tendance, sommeil, cycle de force, cycle féminin, blessures, état du jour, régime alimentaire,
temps de repos par exercice, données de montre connectée.

### 7.3 Le Gardien de sécurité

Fusionne les blessures déclarées et les douleurs du jour, et pose un bloc de consignes **en tête
du contexte**. **Mesuré** : 0 caractère sans blessure, **1 797** avec une blessure active, et la
zone atteint bien le contexte.

Une observation sur la séance du jour existe aussi, mais elle est placée **en bas** — parce
qu'elle change à chaque ajout d'exercice, et qu'en tête elle cassait le cache de préfixe et
refacturait 46 741 caractères en pleine séance.

### 7.4 Ce que Milo ne reçoit PAS (mesuré)

- **`badges`** — déclaré transmis, ne l'est pas. Une seule occurrence dans le code de Milo, et
  c'est la fonction qui **efface** le champ pour les tests.
- **`dayStateLog`** — l'historique du check-in (énergie, moral, douleurs, notes). **Zéro**
  occurrence. *Milo ne peut donc rien dire de l'évolution du ressenti sur la durée, alors que
  la donnée existe et s'accumule.*
- Le **journal alimentaire** — exclusion volontaire et écrite.

### 7.5 Deux pièges de mesure, vérifiés

- Un message de simple salutation (« Salut ») **ne déclenche aucun appel réseau** : l'app y
  répond localement.
- La fonction d'envoi **prend le message en argument** ; appelée sans argument, elle lit un
  champ de saisie et sort aussitôt.

Dans les deux cas, une sonde mal écrite mesure **zéro** et conclut à tort.

---

## 8. LES FAMILLES DE BUGS DÉJÀ CONNUES

Le projet catalogue ses bugs **par famille**, pas par date, parce que sur ~1 100 versions les
mêmes reviennent sous des déguisements différents. **37 familles** sont documentées. Les plus
fréquentes :

| Famille | Fréquence | À quoi on la reconnaît |
|---|---|---|
| **Le premier match gagnant** | ≥ 12 fois | une règle large placée avant une règle précise l'empêche de s'appliquer |
| **L'info n'atteint jamais la DONNÉE** | 11 fois | le raisonnement est bon, la structure de données ne le reçoit pas |
| **Deux sources qui se contredisent** | 7 fois | une règle écrite en prose d'un côté, en code de l'autre |
| **Le chemin AUTOMATIQUE est le moins protégé** | 5 fois | la saisie manuelle est bornée, l'import/la restauration ne l'est pas |
| **Le NOM comme clé primaire** | racine commune | renommer un exercice casse l'historique rangé dessous |
| **Les erreurs de MÉTHODE** | les plus dangereuses | un contrôle négatif qui ne rougit pas, un test qui ne mesure rien |
| **Le déploiement silencieux** | 2 fois | « j'ai poussé » ≠ « c'est en ligne » |
| **Les fuseaux horaires** | récurrente | une date calculée en UTC pour une journée locale |

### Les réflexes qui en sortent

1. **Avant de dire qu'une chose manque** → la chercher dans le code et dans l'inventaire.
2. **Avant de « réparer » du code orphelin** → chercher la décision. Sinon, demander.
3. **Quand une réponse est fausse sur un fait** → vérifier qu'on a bien *donné* le fait, avant
   de toucher au prompt.
4. **Quand on trouve un oubli** → chercher ses jumeaux. Ils sont rarement seuls.
5. **Quand un contrôle négatif ne rougit pas** → c'est le test qui est cassé, pas le code qui
   est bon.
6. **Quand un outil signale un défaut là où rien n'a changé** → suspecter l'outil avant le code.
7. ⭐⭐ **Quand la personne décrit un symptôme et que la mesure dit le contraire** → c'est la
   mesure qui se trompe.

---

## 9. CE QUI A ÉTÉ MESURÉ ET ÉCARTÉ ⛔

**Chapitre le plus important de ce dossier.** Ces propositions sont raisonnables sur le papier
et ont toutes été **refusées sur la base de chiffres**. Les re-proposer sans traiter la mesure
qui les a écartées ferait perdre du temps.

| Proposition | Pourquoi elle a été écartée |
|---|---|
| **Un moteur OCR local + des parsers par fabricant** pour supprimer les appels IA | Mesuré : aucun moteur OCR embarqué, en ajouter un coûte **2 à 4 Mo** (3 à 5× la plus grosse bibliothèque actuelle) et heurte la règle d'ouverture instantanée — **pour un volume réel de 5 imports en un mois**. *Une architecture dimensionnée pour 1 000 imports qu'on n'a pas est une dette.* |
| **Un « moteur de décision » en brique séparée** | Doublonnerait la couche de raisonnement existante. La règle adoptée est **émergente** : tout nouveau module passe par la couche commune, on ne réécrit pas d'un coup. |
| **Un score de fiabilité chiffré** (« fiabilité 92 % ») | Remplacerait une fausse précision par une autre. Des **états nommés** — *validé · partiel · ambigu · non reconnu* — sont plus honnêtes. |
| **Faire passer toute l'IA par Google Apps Script** | **Casse en 4G/5G.** D'où le Worker Cloudflare. |
| **Pré-cacher automatiquement toutes les images à chaque mise à jour** | Saturait le cache et re-téléchargeait tout à chaque version. Les bases alimentaires (~250 Ko) sont **délibérément** hors pré-cache, mises en cache à la première recherche. |
| **Un son dans le timer de repos** | Sur iPhone, **coupe la musique** de la personne. |
| **Un bouton flottant « + » au-dessus de la barre** | Recouvrait le contenu. |
| **Forcer le passage par toutes les cartes de nouveautés** | Contraire à l'ouverture instantanée à la salle. *Le format incite, la contrainte braque.* |
| **Séparer les règles d'architecture et les règles de conception en deux fichiers** | Le fond était juste, la forme non : deux fichiers imposent un arbitrage à chaque nouvelle règle, et on finit avec des règles introuvables dans les deux. **Une section coûte zéro, une frontière coûte cher.** |
| **Un détecteur de seuils numériques dupliqués** | **Précision quasi nulle**, re-mesuré : les candidats sortent dans 6 à 8 fichiers pour des raisons sans rapport. *L'égalité numérique n'est presque jamais une parenté.* |

### Et une chose importante sur vos propres audits

Sur un contre-audit récent que vous aviez produit, **deux affirmations sur quatre étaient
fausses ou périmées** — non par négligence, mais parce qu'elles décrivaient un écran ou un
calcul modifié depuis. Les deux autres étaient **fondées et ont mené à un correctif réel**.

👉 **Ce n'est pas un reproche, c'est un mode d'emploi** : vos constats sont précieux **et** ils
sont systématiquement **re-mesurés avant d'être acceptés**. Si l'un est écarté, ce sera avec
un chiffre, pas avec une opinion.

---

## 10. LES TESTS EXISTANTS

| Suite | Assertions exécutées | Domaine |
|---|---|---|
| Parcours de bout en bout | **2 379** (133 blocs) | tous domaines, par les vraies fonctions dans un vrai navigateur |
| Calculs | 266 | métabolisme, macros, e1RM, calories |
| Muscles | 241 | figurine, attribution musculaire |
| Croisés | 50 | cohérence du catalogue (groupe × muscles × mouvement × image) |
| Dates | 7 | fuseaux, changements d'heure |
| Données | classification des 106 champs face à Milo |
| Milo Tier 1 | 12 | scénarios déterministes de sécurité, **gratuits** |
| Milo Tier 2 | 55 scénarios | banc d'essai avec **appels réels payants** (0,84 à 3,63 € la passe) |

**Bien couvert :** entraînement, records, muscles, calculs nutritionnels.
**Peu couvert :** le **comportement** de Milo (seul le Tier 2 payant le mesure), la mise en page.
**Pas couvert :** le Service Worker, la fusion multi-onglets pour 8 collections sur 13.

⚠️ **« Aucun test trouvé » ne veut pas dire « cassé ».** Le Service Worker fonctionne ; c'est le
*risque de régression silencieuse* qui est élevé.

⛔ **Et une limite qui vaut pour tout ce chapitre :** ces tests prouvent la **PRÉSENCE** des
données et des règles. Ils ne prouvent **jamais l'OBÉISSANCE** de Milo. Un contexte parfait n'a
jamais garanti une bonne réponse.

---

## 11. L'ÉTAT COURANT (02/09/2026)

- Version en ligne : **`ft-v1101`**, déploiement vérifié.
- Le banc d'essai payant **n'a pas tourné pour de vrai récemment** — le dernier rapport est un
  passage à blanc. Deux changements de ce que Milo reçoit ont été livrés depuis.
- Chantier en cours côté produit : la **nutrition** (moteur de tendance, plages de poids).
- Deux constats de Michel, non résolus, qui valent comme pistes :
  - *« personne n'utilise Milo pour créer sa séance »* ;
  - *« le parcours pour créer sa séance n'est pas terrible »*.

---

## 12. DÉFAUTS OUVERTS, NON CORRIGÉS

Décrits, mesurés, **délibérément laissés en l'état**.

### 12.1 La fusion multi-onglets ne couvre que 5 collections sur 13

- **Constat.** L'app est une PWA : elle est souvent ouverte **deux fois** (icône d'accueil +
  navigateur), qui partagent le même stockage.
- **Preuve.** Reproduit : l'onglet B termine une séance, l'onglet A règle son temps de repos →
  **0 séance, 0 record**. Le rechargement ne les ramène pas. Un correctif fusionne désormais
  `sessions`, `weightLog`, `sleepLog`, `foodLog`, `prs` — mais **pas** `programmes`, `badges`,
  `customExercises`, `exSwaps`, `registre`, `coachMemory`, `goalLog`, `exRestPref`. Reproduit :
  un programme créé dans un onglet est perdu.
- **La difficulté est réelle.** Ces huit collections **ne sont pas datées** : le mécanisme
  d'union avec départage par date ne s'y applique pas tel quel.

### 12.2 Deux champs déclarés transmis à Milo ne le sont pas

`badges` et `dayStateLog` (voir 7.4). Le garde-fou vérifiait qu'ils étaient **classés**, pas
qu'ils étaient **transmis** — et il le dit lui-même en tête de fichier.

### 12.3 Un record survit à la suppression de sa séance

Reproduit : séance supprimée (2 → 1), record de 112,5 kg conservé, et il atteint Milo.
**Le correctif évident est dangereux** (voir 6.2). La forme correcte est probablement
d'**avertir** au moment de supprimer.

### 12.4 Deux définitions du « Big 3 »

Une **liste de noms exacts** dans un fichier, une **expression régulière** dans un autre. Un
renommage d'exercice désynchroniserait les deux.

### 12.5 Un plafond de taille de fichier écrit trois fois

La même valeur littérale, à trois endroits.

---

## 13. LES 10 AUDITS À FAIRE ENSUITE

Classés par priorité, chacun justifié par un fait mesuré.

1. **La fusion multi-onglets des 8 collections non couvertes.** Perte reproduite, touche la
   règle n°1. Décision de conception requise.
2. **Ce que Milo reçoit vraiment, canal par canal.** Le message a 6 canaux ; deux données
   déclarées transmises ne le sont pas. Refaire la carte **par mesure**, pas par déclaration.
3. **Le comportement de Milo, pas seulement la présence de ses données.** Le banc d'essai réel
   n'a pas tourné alors que deux changements de contexte ont été livrés.
4. **Le pré-cache du Service Worker contre la liste réelle des fichiers servis.** Un fichier
   oublié produit une panne **silencieuse** hors ligne. Un cas réel a déjà eu lieu, aucun test
   ne couvre la zone.
5. **Les chemins d'écriture automatiques face aux chemins manuels.** La famille a mordu 5 fois.
   Restent à instruire : import de programme, code-barres, bilan sanguin.
6. **Les règles écrites en PROSE à côté d'un calcul.** C'est le vrai générateur de doubles
   sources de vérité ici — la duplication de fonctions, elle, est mesurée à **zéro**.
7. **Les données écrasées au lieu d'être historisées.** Mensurations et poids objectif n'ont
   pas d'historique, alors que le poids en a un. Décider si c'est voulu.
8. **Le cycle de vie des données périssables.** Registre, ADN, mémoire longue, bilans corporels
   n'ont pas de date de péremption uniforme. Milo peut s'appuyer sur un fait devenu faux.
9. **Les deux fonctions d'échappement.** Mesurées saines aujourd'hui ; deux propriétaires pour
   une garantie de sécurité est une dette.
10. **Le pré-remplissage de séance.** 8 consommateurs, aucun test dédié, et le projet a déjà
    constaté qu'un pré-remplissage correct dans un contexte devient faux dans un autre.

---

## 14. COMMENT ÊTRE UTILE ICI

**Ce qui marche :**

- **Contredire avec un raisonnement.** Le contre-audit est votre meilleure contribution.
- **Nommer une contradiction** entre ce qu'un écran affiche et ce qu'un calcul applique — c'est
  la famille de défauts la plus productive du projet.
- **Poser la question de conception** plutôt que de livrer une solution : ici, une décision mal
  posée coûte plus cher qu'un code mal écrit.
- **Dire ce que vous ne pouvez pas savoir.** « Je ne sais pas » vaut mieux que « probablement ».

**Ce qui ne marche pas :**

- Proposer une architecture dimensionnée pour un volume que le produit n'a pas.
- Toucher au prompt de Milo en premier : c'est le **dernier** levier (R7).
- Recommander de corriger un « code orphelin » sans chercher la décision qui l'a créé (R30).
- Produire un score chiffré qu'aucune méthode ne calcule vraiment.
- Traiter une donnée déclarée comme une donnée mesurée.

**Le ton attendu :** direct, sans formalités, honnête. Reconnaître une erreur tout de suite.
Pas de sur-explication : la réponse d'abord, le détail seulement s'il est demandé. Michel parle
direct, on lui répond pareil.

---

*Dossier produit le 02/09/2026 sur la version `ft-v1101`. Toutes les mesures sont
reproductibles. Aucune ligne de l'application n'a été modifiée pendant sa rédaction.*
