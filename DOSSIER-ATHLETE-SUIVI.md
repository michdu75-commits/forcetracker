# 🧠 Dossier Athlète / Milo — Journal de suivi

> Suivi **pas à pas** du projet « Dossier Athlète » (faire de Milo un coach qui
> apprend à connaître son utilisateur). Chaque évolution est notée ici avec **sa
> raison** et une **petite explication**, dans l'ordre chronologique.
>
> Objectif : garder une trace claire de POURQUOI on a fait chaque chose, pour
> Michel comme pour Claude, sans avoir à fouiller le gros `CLAUDE.md`.

---

## 🎯 La vision (rappel)

On sépare le cerveau de Milo en **couches** qui ont chacune un rôle :

| Couche | Rôle | Qui la remplit |
|---|---|---|
| **Profil** | Ce que tu déclares (âge, objectif, blessures…) | L'utilisateur |
| **Dossier Athlète** | Ce que Milo APPREND (faits, habitudes, préférences) | L'app + Milo (validé) |
| **État du jour** | L'instant (sommeil, humeur, douleurs, envie) | L'utilisateur, avant la séance |
| **Le Gardien** | Les RÈGLES DE SÉCURITÉ (ce qui est permis / interdit) | La logique de l'app (pas l'IA) |
| **Milo** | Explique, motive, adapte — DANS les limites du Gardien | L'IA |

**Principe : le Gardien protège, Milo accompagne.**
On avance **une brique à la fois, testée**, sans jamais casser l'existant.

**🧭 La colonne vertébrale — 8 briques (cadrage ChatGPT, gravé 19/07 dans la Vision).**
C'est LA carte du produit. Les six premières bâtissent la machinerie, **les deux
dernières sont la finalité** :

| # | Brique | Statut |
|---|---|---|
| 0 | Personnalité de Milo | ✅ clôturée |
| 1 | Mémoire de l'athlète (Registre) | ✅ clôturée |
| 2 | Cerveau (contexte / faits) | ✅ clôturée |
| 3 | État du jour (3A + 3B) | ✅ clôturée |
| 4 | ADN sportif (4A) | ✅ clôturée |
| 5 | Observations intelligentes (5A) | ⏳ à valider · 5B à venir |
| 6 | Le Gardien (6A + 6B) | ⏳ à valider |
| **7** | **🎯 Mémoire vivante** — relier les événements sur plusieurs années | 🔮 destination |
| **8** | **🎯 Synthèse** — prendre du recul sur toute son histoire sportive | 🔮 destination |

⚠️ **7 et 8 = miroir, jamais prophète** (décrire/aider à réfléchir, jamais
prescrire — sinon on trahit la Vision) ; **dernières par nécessité** (besoin de
temps + données accumulées → cerveau d'abord, puis une vraie base de données).
Tout ce qui est « en cours » (5B, « Milo construit ta séance »…) = **affinages À
L'INTÉRIEUR** d'une brique, PAS de nouvelles grandes briques.

> **🔮 Fiche de conception — BRIQUE 7 « Mémoire vivante » (design capturé, À
> CONSTRUIRE PLUS TARD).** *(Ne PAS développer maintenant : on est sur la validation
> de 5A/6A/6B — Principe 8. On capture juste la conception pendant qu'elle est
> fraîche, apport ChatGPT du 19/07.)*
>
> **Principe.** La brique 7 **ne montre pas de statistiques** — elle fait **revivre
> des SOUVENIRS utiles au bon moment**. C'est ce qui transforme une mémoire technique
> en mémoire *vivante*. Nom visible de la 1ʳᵉ fonctionnalité : **« Ton histoire
> sportive »**.
>
> **« Le Souvenir » = un vrai objet métier** (au même titre que l'État du jour, le
> Gardien, les Observations). Structure :
> - **type** : `anniversaire` · `contextuel` · `demandé`
> - **date** (l'événement d'origine)
> - **résumé** (le souvenir, en une ou deux phrases, DESCRIPTIF)
> - **lien avec la situation actuelle** (pourquoi c'est pertinent aujourd'hui)
> - **raison** (pourquoi Milo le fait remonter maintenant) → c'est le garde-fou
>   « moins mais mieux » : un souvenir sans raison ne remonte pas.
>
> **3 déclencheurs** (jamais au hasard) :
> 1. **Anniversaire** — « Il y a un an aujourd'hui… ».
> 2. **Contextuel** — une situation similaire réapparaît (même douleur, même
>    objectif, même reprise).
> 3. **Demandé** — l'utilisateur demande explicitement à revoir une période.
>
> **Garde-fous** : un souvenir **décrit**, il ne prescrit jamais (Principe 14) ; il
> respecte le **seuil d'intrusion** (« moins mais mieux »).
>
> **Décision d'architecture (ChatGPT) — le « détecteur d'anomalies ».** Les 3
> catégories d'anomalie (changement brutal / tendance progressive / événement
> marquant) recoupent ce que regardent déjà les Observations (5), le Gardien (6) et
> l'initiative de Milo. **On ne mutualise PAS tout de suite** : chaque brique garde
> sa logique tant qu'elles évoluent ; on extrait un **composant commun seulement
> quand le besoin est prouvé** (« factoriser après avoir prouvé le besoin, pas
> avant »).

> **💬 Note de conception — « MILO PROACTIF AVEC SA MÉMOIRE » (apport ChatGPT du
> 19/07, gravé, À CONSTRUIRE PLUS TARD).** *(Ne PAS développer maintenant — on
> valide 5A/6A/6B — Principe 8 ; on capture la conception à chaud.)*
> ChatGPT propose des interventions spontanées et SPÉCIFIQUES : « tu n'as pas
> travaillé les quadriceps depuis 8 jours », « ton développé couché progresse depuis
> 3 semaines », « ta douleur au genou droit semble diminuer », « vu ton sommeil cette
> semaine, allège la séance ». **C'est ce qui donne l'impression d'un vrai coach.**
> - **Où ça vit** : c'est un **affinage** de la carte proactive de Milo sur l'Accueil
>   (`_miloMessage`, brique 4 — présence) NOURRIE par les Faits (brique 2), les
>   Observations (5B) et les tendances (brique 7). **PAS une nouvelle grande brique.**
> - **4 familles de messages** : (a) *inactivité d'un groupe* → dernière date par
>   groupe musculaire (Faits) ; (b) *tendance de progression* → pente d'un 1RM sur
>   N semaines (`S.prs`/séances) ; (c) *évolution d'une douleur* → **nécessite
>   d'HISTORISER l'état du jour** (aujourd'hui il est remis à zéro chaque jour →
>   prérequis technique : garder un historique léger énergie/douleurs, cf. 3B+) ;
>   (d) *readiness* → sommeil/récup faible → alléger (existe déjà en partie : message
>   `recup` + le Gardien).
> - **Garde-fous NON négociables** (c'est ici qu'ils comptent le plus) :
>   **Principe 14 « miroir, jamais prophète »** → une douleur qui diminue se
>   *décrit* (« semble diminuer, non ? »), un conseil se *propose* (« je te
>   conseille d'alléger ») — jamais on ne prescrit ni ne prédit. **« Moins mais
>   mieux »** → une intervention à la fois, espacée (la carte le fait déjà).
>   **Méfiance des données incomplètes** (ft-v403) → « pas travaillé les quads
>   depuis 8 j » n'est vrai que si tout est loggé → formuler comme observation à
>   confirmer, pas comme un fait asséné.
> - **Prérequis identifié** : historiser l'état du jour (douleurs/énergie) pour la
>   famille (c) → petite extension de la 3B, à planifier.

**📏 Méthode par brique (adoptée 19/07, suggestion ChatGPT — anti « puisqu'on y est ») :**
chaque brique est décrite AVANT de coder avec **3 sections** :
- **Objectif** : ce que la brique apporte, en une phrase.
- **Critère de réussite** : comment on sait qu'elle est finie et validée.
- **Hors périmètre** : ce qui NE doit PAS être fait dans cette brique.
Puis : une branche/commit + un backup + des tests + validation → seulement ensuite la suivante.

📜 **Document fondateur : `CONSTITUTION-MILO.md`** — les 10 principes stables du
projet (à respecter à chaque brique).

Documents de réflexion liés (dans la boîte à idées / échangés avec ChatGPT) :
avis « MILO ENGINE », « Dossier Athlète », « Milo V3 / le Gardien ».

---

## 💾 Points de sauvegarde (restauration)

| Branche de backup | État | Restaurer |
|---|---|---|
| `backup-2026-07-19-dossier-athlete-brique1` | Briques 0 + 1 (ton de Milo + Registre socle) | `git reset --hard origin/backup-2026-07-19-dossier-athlete-brique1` |
| `backup-2026-07-19-dossier-athlete-brique2` | Briques 0 + 1 + 2 (faits mesurés) | `git reset --hard origin/backup-2026-07-19-dossier-athlete-brique2` |
| `backup-2026-07-19-milo-comprendre` | + amélioration « comprendre avant de conseiller » | `git reset --hard origin/backup-2026-07-19-milo-comprendre` |
| `backup-2026-07-19-brique3-etat-du-jour` | + brique 3 (état du jour, 3A conversationnel) | `git reset --hard origin/backup-2026-07-19-brique3-etat-du-jour` |
| `backup-2026-07-19-avant-brique4-adn` | **AVANT** la brique 4A (état = fin brique 3) | `git reset --hard origin/backup-2026-07-19-avant-brique4-adn` |
| `backup-2026-07-19-brique4a-adn-ok` | + brique 4A (ADN sportif) **validée** | `git reset --hard origin/backup-2026-07-19-brique4a-adn-ok` |
| `backup-2026-07-19-avant-brique5a` | **AVANT** la brique 5A (état = fin 4A + Constitution v1.3) | `git reset --hard origin/backup-2026-07-19-avant-brique5a` |
| `backup-2026-07-19-avant-gardien6a` | **AVANT** le Gardien 6A (état = 5A + points rouges simplifiés) | `git reset --hard origin/backup-2026-07-19-avant-gardien6a` |
| `backup-2026-07-19-avant-adn-sante-sep` | **AVANT** la séparation ADN/Santé (état = Gardien 6A) | `git reset --hard origin/backup-2026-07-19-avant-adn-sante-sep` |
| `backup-2026-07-19-avant-gardien6b` | **AVANT** le Gardien 6B précis (état = séparation ADN/Santé) | `git reset --hard origin/backup-2026-07-19-avant-gardien6b` |
| `backup-2026-07-19-avant-3b` | **AVANT** la brique 3B (état = Gardien 6B + séparation ADN/Santé) | `git reset --hard origin/backup-2026-07-19-avant-3b` |
| `backup-2026-07-19-avant-ressenti-score` | **AVANT** le branchement ressenti→score (état = 3B livrée) | `git reset --hard origin/backup-2026-07-19-avant-ressenti-score` |

---

## 🧪 Protocoles de validation (PT-xxx) — méthode reproductible

> Idée validée à 3 (Michel + GPT + Claude, 19/07/2026) : *« On ne construit plus
> seulement des fonctionnalités, on construit une **méthode de validation
> reproductible** »* (GPT). Chaque grande brique de Milo a (ou aura) son **protocole
> numéroté**, avec une grille d'observation et un **verdict archivable** (« Brique
> validée / à revoir ») → permet de **comparer les versions de Milo dans le temps**.

| Protocole | Cible | Outil | État |
|---|---|---|---|
| **PT-001** | **Continuité mémoire** (Étape 3 du débrief) | outil admin `ft-v497` | ✅ construit — ⏳ à jouer en réel (iPhone) |
| PT-002 | Le Gardien (6A/6B) | à concevoir | ⏳ |
| PT-003 | Observations IA (5A/5B) | à concevoir | ⏳ |
| PT-004 | ADN sportif (4A) | à concevoir | ⏳ |
| PT-005 | Onboarding (effet Waouh) | à concevoir | ⏳ |

### PT-001 · Continuité mémoire · `ft-v497` · 19/07/2026

- **Objectif** : prouver que Milo « suit vraiment le même sportif dans le temps » —
  il rappelle et vérifie l'objectif fixé la fois d'avant, séance après séance.
- **Critère de réussite** (reformulation GPT) : *« Après des dizaines de séances,
  l'utilisateur a-t-il l'impression d'avoir été suivi par le même coach ? »* — pas
  seulement « est-ce que ça marche techniquement ? ».
- **Comment (outil admin, `startPt001Test`)** : rejeu de **tout l'historique** dans
  l'ordre chrono → un débrief par séance (Milo fixe un objectif + vérifie le
  précédent) → puis la **question nue « Qui suis-je en tant que sportif ? »** (si Milo
  récite des stats = incomplet ; s'il décrit la personne = mémoire qui accompagne).
- **Ce qu'on mesure (rapport auto)** : erreurs · temps moy/min/max · **saturation**
  (1er tiers vs dernier tiers) · mémoire lue (objectifs captés) · continuité détectée
  (%) · « objectif tenu » capté · portrait descriptif vs chiffres.
- **Grille des 7 axes (GPT)** : continuité · cohérence · diversité · mémoire · vitesse
  · crédibilité · émotion → les axes qualitatifs se jugent à la **lecture** des
  débriefs (fournis dans l'export texte).
- **Verdict** : champ « Brique validée / à revoir » à trancher après lecture (Michel +
  Claude), **archivé** (texte + PDF) pour comparer les versions.
- **Hors périmètre** : l'outil ne tranche pas seul les axes qualitatifs (il fournit les
  signaux + les textes) ; il ne modifie pas le comportement de Milo (c'est un
  observateur). **Admin-only**, n'efface aucune donnée (les objectifs s'ajoutent au
  Registre comme après de vraies séances).
- **Limite honnête** : je (Claude) ne peux pas voir le test en direct (il tourne sur
  l'iPhone, mon environnement bloque Cloudflare/Google, un « espion » = porte dérobée
  à éviter) → **Michel exporte le rapport et me l'envoie** ; c'est le même canal que le
  chat, sans accès caché.

---

## 📒 Journal des évolutions

### Brique 0 — Le ton de Milo · `ft-v457` · 18/07/2026
**Ce qu'on a fait :** un réglage dans **Profil → Discipline → « Le ton de Milo »**
avec 4 choix — **Cool · Classique · Dynamique · Scientifique**.

**Pourquoi :** premier pas du projet, choisi parce qu'il est **minuscule et sans
risque** (bon échauffement). Il correspond à la section « Style de communication »
des propositions (le caractère de Milo ne change pas, seul le **ton** est choisi).

**Explication (comment ça marche) :**
- Le choix est stocké dans `S.coachTone` (`ft4_coachtone`) et **synchronisé sur
  le compte** (survit à une réinstallation).
- Il ajoute **une seule ligne** dans le briefing de Milo (`buildCoachContext`,
  coach.js) : « adopte le ton X — mais garde ton caractère et la qualité/sécurité
  de tes conseils ».
- **Par défaut (`''`)** : aucune ligne ajoutée → Milo se comporte **exactement
  comme avant**. Aucun impact pour les utilisateurs actuels tant qu'ils ne
  choisissent rien.
- Re-taper le ton actif = revenir au ton par défaut.

**Fichiers touchés :** `state.js` (load/persist), `setup.js` (UI + réglage + cloud),
`coach.js` (injection dans le prompt), `index.html` (les 4 boutons), `Code.js`
(persistance cloud, auto-déployée).

**Statut annonce (règle nouveauté) :** ⏸️ pop-up « Quoi de neuf » + point rouge
**volontairement mis en attente** — on groupera les annonces quand le Dossier
Athlète sera plus avancé (décision à confirmer avec Michel).

**Rollback :** `git reset --hard 9cbca6f`

**🔄 Décision d'évolution (19/07, retour Michel + ChatGPT) :** le réglage
manuel du ton « fait à l'envers » — dans l'esprit du projet, **Milo devrait
APPRENDRE le ton, pas se le faire configurer**. Décidé :
- Le **choix manuel reste** (il devient une **option / un repli** pour forcer un ton).
- On ajoutera **« 🎯 Laisse Milo choisir »** (mode auto), qui deviendra le **défaut**.
- En 2 temps : (1) au début, Milo **déduit** le ton de ce qu'il sait déjà (niveau,
  réponses ADN sportif) ; (2) plus tard, le « j'ai remarqué que tu préfères… je
  continue ? » = la **brique « observations validées »** du Dossier.
- → Rien de perdu dans la brique 0 : elle devient la base « manuelle » ; l'auto
  se pose par-dessus quand la mémoire (ADN sportif + Dossier) sera là.

**✅ Appliqué · `ft-v458` (19/07) :** « 🎯 Laisse Milo choisir » (auto) est
maintenant le **DÉFAUT** (bouton pleine largeur en tête). Les 4 tons deviennent
des **overrides manuels**. En mode auto, Milo reçoit la consigne de **choisir
lui-même** le ton adapté (d'après niveau, discipline, façon d'écrire) ; re-taper
un ton imposé = retour à l'auto. Les utilisateurs existants (`coachTone` vide)
sont traités comme « auto » → aucun réglage à faire. **Version 1 de l'auto =
Milo déduit** ; le « j'ai remarqué que tu préfères… » (proposition validée)
viendra avec la brique mémoire. **Rollback :** `git reset --hard 05a08a6`

---

### Brique 1 — Le Registre Athlète (le socle) · `ft-v459` · 19/07/2026
*(Nom retenu : « Registre Athlète » — mémoire officielle, fiable, évolutive, suggestion ChatGPT.)*

**Objectif :** créer une mémoire durable que Milo peut consulter (sauvegardée sur
le téléphone + le compte, et injectée dans son briefing).

**Critère de réussite :** une info écrite dans le Registre aujourd'hui est
**retrouvée** à la prochaine session (persistée, restaurée) **et visible par
Milo**. → ✅ **Vérifié (Playwright)** : registre vide = rien d'injecté ; info
écrite = apparaît dans le contexte ; après rechargement = retrouvée + visible ;
0 erreur JS.

**Hors périmètre (respecté) :** ❌ faits calculés automatiquement (brique 2) ·
❌ observations de Milo (brique 5) · ❌ Gardien · ❌ historique intelligent ·
❌ écran utilisateur. **Juste le tiroir + la persistance + l'injection.**

**Explication (comment ça marche) :**
- `S.registre = { facts:{}, observations:[], updatedAt:'' }` (`ft4_registre`),
  **vide pour l'instant** (les `facts` viendront à la brique 2, les
  `observations` à la brique 5).
- Persistance : localStorage + payload `_cloudSync` + restore `_applyRestoreData`
  + `Code.js` `handleSaveProfile_` (`_po_`, auto-déployé).
- Injection dans `buildCoachContext` (coach.js) : une section **« REGISTRE
  ATHLÈTE »** listée à Milo **UNIQUEMENT si elle contient quelque chose** →
  aucun bruit tant que c'est vide (donc **aucun changement visible** pour
  l'instant, normal : c'est un socle).

**Rollback :** `git reset --hard 05a08a6`

---

### Brique 2 — Les faits mesurés · `ft-v460` · 19/07/2026

**Objectif :** l'app calcule toute seule des faits FIABLES (séances, sommeil,
profil) et les range dans le Registre, pour que Milo s'appuie sur des chiffres
justes au lieu de deviner.

**Critère de réussite :** après une séance (et au démarrage), le Registre
contient des faits corrects, retrouvés à la session suivante et visibles par
Milo ; on peut refaire le calcul à la main → ça correspond. → ✅ **Vérifié
(Playwright)** : 7 faits corrects (contrôlés à la main), section « REGISTRE
ATHLÈTE » injectée, retrouvés après rechargement, 0 erreur JS.

**Hors périmètre (respecté) :** pas de déduction molle (brique 5), pas de niveau
de confiance, pas d'écran, pas de Gardien, pas d'historique intelligent.

**Règle d'or appliquée** (Constitution P4) : chaque fait sert une décision de
Milo ; si une donnée manque, le fait n'est pas produit (aucune invention).

**Les 7 faits calculés** (`computeRegistreFacts()` dans tracking.js) :
1. Nombre de séances (total + ce mois) · 2. Régularité (séances/sem, 28 j) ·
3. Durée moyenne d'une séance · 4. Exercices préférés (top 3) · 5. Groupe
musculaire le plus / le moins travaillé (30 j) · 6. Sommeil moyen (7 nuits) ·
7. Ancienneté calculée (depuis la 1re séance) — **≠ niveau déclaré** (déjà connu
de Milo, non dupliqué). ⏳ Sommeil↔perf reporté.

**Explication :** `computeRegistreFacts()` recalcule TOUT à chaque fois (remplace,
n'accumule pas) et écrit dans `S.registre.facts`. Appelée au **démarrage**
(state.js load), **après « Terminer la séance »** (log.js finishWorkout) et
**après un import de journal** (finalImportHist). Milo les lit via la section
« REGISTRE ATHLÈTE » (label lisible). Toujours INVISIBLE pour l'utilisateur.

**Rollback :** `git reset --hard 05a08a6`  *(ou branche backup brique 1)*

---

### Amélioration Milo — « Comprendre avant de conseiller » (l'âme) · `ft-v461` · 19/07/2026
*(Pas une brique numérotée : affinage du comportement de Milo, prompt-only.)*

**Déclencheur (retour Michel) :** face à « je n'irai pas m'entraîner
aujourd'hui », Milo validait puis fonçait sur la logistique — sans **s'intéresser
à la personne** ni **chercher à comprendre** pourquoi (« il n'a pas d'âme »).

**Ce qu'on a fait :** ajout d'une consigne dans `buildCoachContext` (coach.js),
qui regroupe 3 retours en un bloc « COMPRENDRE AVANT DE CONSEILLER » :
1. **La personne avant le programme** : sur une **rupture d'habitude** (séance
   sautée, sommeil, pesées, plans qui changent…), Milo cherche D'ABORD à
   comprendre avec **une** question douce et sincère, avant de conseiller.
2. **Curiosité utile seulement**, **sans jugement ni culpabilisation** ; il
   respecte si la personne veut juste souffler (pas d'interrogatoire).
3. **Ne jamais inventer** ce qui a été fait récemment : s'appuyer sur le Registre
   et les vraies séances ; si l'info manque, demander (Principes 1, 3, 7).

**Décision d'archi (validée) :** le **comportement** va dans le raisonnement de
Milo MAINTENANT ; la **détection fiable** des ruptures d'habitude viendra avec le
**Gardien (brique 6)**. → *Le Gardien détecte, Milo accompagne.*

**Testé (Playwright) :** consigne bien présente dans le contexte, 0 erreur JS.
À valider en vrai par Michel (dire à Milo « je n'irai pas m'entraîner »).

**Rollback :** `git reset --hard origin/backup-2026-07-19-dossier-athlete-brique2`

---

### Brique 3 — L'état du jour (version 3A conversationnelle) · `ft-v462`/`ft-v463` · 19/07/2026 · ✅ CLÔTURÉE
*(Version consolidée après échanges Michel / ChatGPT / Claude / Gemini. **Validée officiellement** par Michel sur les 4 axes — fonctionnelle, technique, situation réelle (test iPhone), philosophie de Milo. Leçon élevée en Constitution : Principe 12 « écouter, comprendre, contextualiser — puis conseiller ».)*

**Objectif :** Milo comprend l'état du jour de la personne pour adapter son
accompagnement, via un **check-in CONVERSATIONNEL** (pas un formulaire) — c'est
son **premier geste de présence**.

**Critère de réussite :** Milo peut prendre le pouls (énergie/moral/douleur) de
façon naturelle, adapte ses réponses au contexte, sans que ce soit vécu comme un
questionnaire ; le check-in reste **facultatif** et la **navigation libre**
préservée. → ✅ Consigne présente dans le contexte (Playwright), 0 erreur JS. La
vraie validation = ressenti de Michel dans le Coach (c'est conversationnel).

**Hors périmètre (respecté) :** ❌ pas de formulaire/écran · ❌ pas de stockage
structuré (la version **3B** — capture invisible en `S.dayState` pour le Gardien —
viendra plus tard) · ❌ pas de garantie de sécurité auto (= Gardien, brique 6) ·
❌ présence globale / porte d'entrée Milo = gouvernance (`docs/PRESENCE-MILO.md`),
hors périmètre.

**Explication :** ajout d'une consigne « ÉTAT DU JOUR & CHECK-IN » dans
`buildCoachContext` (coach.js), à la suite de « comprendre avant de conseiller » :
- distinction stricte **Registre (qui tu es) / État du jour (comment tu vas
  aujourd'hui)** ;
- Milo peut **ouvrir** par un check-in bref et chaleureux (« comment tu te sens
  aujourd'hui ? ») — une conversation, pas une saisie ;
- il **dose sa présence** : si la personne veut juste agir, il s'efface (facultatif) ;
- il s'en sert pour adapter le conseil **du jour** (allège si fatigue, protège la
  zone si douleur + oriente vers un pro, soutient si moral bas, pousse si en forme).

**Rollback :** `git reset --hard origin/backup-2026-07-19-milo-comprendre`

**🔧 Renfort · `ft-v463` (retour Michel, capture) :** Milo avait répondu « t'es HS
mais ta récup est au top » à « je suis HS » → il **contredisait** le ressenti avec
le chiffre, et **fonçait sur le conseil** sans comprendre la cause. Ajout de 2
règles fortes dans la consigne : ① **le RESSENTI prime TOUJOURS sur les chiffres**
(ne jamais contredire « je suis HS » avec « ta récup est au top » ; le score de
récup est un indice calculé, pas la vérité — le boulot/stress/nuit blanche n'y
sont pas) ; ② sur un **signal d'état** (« je suis HS/crevé/j'ai mal »), **comprendre
la cause d'abord** (question douce) avant de conseiller. Testé Playwright, 0 erreur.
**Rollback :** `git reset --hard origin/backup-2026-07-19-brique3-etat-du-jour`

---

### Brique 4A — L'ADN sportif (socle déclaré) · `ft-v464` · 19/07/2026 · ✅ CLÔTURÉE

> **Validée officiellement par Michel sur les 4 axes** (fonctionnelle · technique
> · situation réelle · philosophie de Milo). Preuve en situation réelle : un
> « Conseil de Milo » (PDF du 18/07) où Milo **utilise les zones fragiles
> durables** de l'ADN (arthrose, genoux, cervicales, épaule) **et** le mode de
> vie (travaux physiques lourds) → il comprend avant de conseiller, contextualise
> (« ton corps s'entraîne déjà toute la journée ») et **protège** (« pas question
> de t'envoyer du squat lourd si t'as porté du parpaing toute la semaine »).
> L'ADN sportif remplit sa mission.

**Objectif.** Donner à Milo un « ADN sportif » durable — ce qui caractérise la
personne sur le long terme, différent du profil (déclaré général), des faits
(mesurés, brique 2) et de l'état du jour (ponctuel, brique 3). Répond à la
question directrice (ChatGPT) : *« qu'est-ce qui fait que cette personne
s'entraîne comme ELLE, et pas comme quelqu'un d'autre ? »*

**Découpage** (validé ChatGPT + Michel) :
- **4A (cette brique)** = ADN **DÉCLARÉ** par l'utilisateur (sûr, sous contrôle,
  Milo n'invente rien).
- **4B (plus tard)** = Milo **RETIENT tout seul** ce qu'on lui dit au fil des
  échanges (magique mais risqué → quand les fondations/le Gardien sont là).

**Ce qui a été fait (4A).** Section repliable **🧬 Mon ADN sportif** dans le
Profil (après Discipline), **5 champs optionnels** (texte libre, auto-extensible) :

| Champ (`S.adn.*`) | Ce que ça change chez Milo |
|---|---|
| `motivation` | la façon dont il te motive |
| `lifestyle` (« mode de vie ») | il propose du RÉALISTE (temps/lieu/matériel/rythme) |
| `preferences` | il joue sur ce que tu aimes, évite ce que tu détestes |
| `experience` | il calibre son niveau de discours |
| `fragile` (zones fragiles DURABLES) | il PROTÈGE ces zones (≠ douleur du jour) |

**Technique.**
- `S.adn` (`ft4_adn` = `{motivation,lifestyle,preferences,experience,fragile}`),
  persisté **local + cloud**, **rétrocompatible** (vide = comportement identique).
- Injecté dans `buildCoachContext` (coach.js) **section « ADN SPORTIF »**,
  uniquement les champs remplis.
- ⚠️ **Anti-perte cloud** : le frontend n'envoie `adn` que s'il a du contenu
  (`_adnFilled`) — car le garde-fou backend `_po_` compte les CLÉS, pas le
  contenu (l'ADN a toujours ses 5 clés) → sans ce filtre, un ADN vide écraserait
  un ADN rempli. Restauration = **merge par champ** (ne remplit que les champs
  locaux vides, ne réécrase jamais).
- Backend `handleSaveProfile_` : `if(body.adn!==undefined) profile.adn=_po_(...)`
  (auto-déployé via la GitHub Action).

**Retours ChatGPT intégrés** : « mode de vie » au lieu de « contraintes » ;
séparation expérience ≠ zones fragiles ; règle « une info = une décision » ;
**garde-fou Claude** : les habitudes MESURABLES (horaire/jour/durée) restent dans
les FAITS (brique 2), pas dans l'ADN déclaré (anti-doublon + anti-contradiction).

**Checklist nouveauté (règle #11)** : pop-up « Quoi de neuf » **v17** 🧬 +
`WHATS_NEW_MAX=17` ; red dot `adn-sportif` (Profil) ; aide `?` Profil ; aide
détaillée « Mon ADN sportif ». ⏳ Slide Guide de l'application = à faire quand
Michel fournit une capture.

**Fichiers** : `state.js`, `coach.js`, `setup.js`, `index.html`, `Code.js`,
`constants.js`, `screens.js`, `sw.js` (ft-v464).

**Tests Playwright** : 5 champs présents, save → `S.adn` + `ft4_adn`, restore au
reload dans les textareas, contexte Milo **inclut** l'ADN si rempli / **absent**
si vide, `_adnFilled` OK, 0 erreur JS ; visuel jour + nuit OK.

**Rollback :** `git reset --hard origin/backup-2026-07-19-avant-brique4-adn`

---

## 🧠 Brique 5A — « Observations à valider » · `ft-v465` · 19/07/2026 · ⏳ EN ATTENTE VALIDATION MICHEL

> Direction choisie par Michel (Option B). Cadrage validé par ChatGPT + Claude,
> **codé en `ft-v465`**. *« Le cœur, ce n'est pas la mémoire, c'est la confiance. »*

**Ce qui a été fait.** Milo repère une tendance ancrée dans les données →
**propose une hypothèse humble sur l'Accueil** (carte `#home-obs`) → l'utilisateur
**valide (« Oui, c'est vrai ») ou refuse (« Pas vraiment »)** → validée = rangée
en mémoire durable (`S.registre.observations`, `status:'validated'`) et **injectée
dans le briefing de Milo** (sous forme de FAIT confirmé, `o.fact`) → refusée =
`status:'rejected'`, plus jamais re-proposée. Menu → **« Ce que Milo sait de toi »**
(`#ov-milo-knows`) pour revoir/**effacer**. **Rien n'est mémorisé sans validation.**

**Générateurs d'observations (ancrés données, 5A)** — `_obsCandidates()` (tracking.js) :
semaine vs week-end · matin vs soir (startHour) · haut vs bas du corps (EXLIB) ·
très régulier (10+/28 j). Chaque candidate a `ask` (question montrée) + `fact`
(phrase injectée à Milo) + `confidence` (interne).

**Les 4 règles ChatGPT, implémentées :**
1. **Humilité** — formulé en question (« … c'est le cas ? »).
2. **Une à la fois** — `maybeProposeObservation` sort si une `pending` existe.
3. **Le bon moment** — ≥ 8 séances requises + **espacement ≥ 3 jours** (`lastObsAt`).
4. **Seuil de confiance interne** — ne propose que `confidence ≥ 0.7`, choisit la
   plus haute ; la confiance n'est **jamais** montrée ni à l'utilisateur ni à Milo.

**Anti-répétition** : une clé déjà décidée (validée/refusée/en attente) n'est
jamais re-proposée. **Injection** : seules les `validated` entrent dans Milo.

**Règle « observation REFUSÉE »** (question explicitement cadrée par ChatGPT,
19/07) : une observation refusée est **écartée durablement** — sa clé est bloquée,
Milo ne la re-propose **jamais** (zéro harcèlement ; la rareté donne de la valeur
à ses interventions). *Nuance déléguée à la 5B / plus tard :* on pourra autoriser
une **ré-évaluation** si le signal devient **nettement** plus fort qu'au moment du
refus — **pas en 5A** (on reste simple et non intrusif). Cas particulier : si
l'utilisateur **supprime** une observation validée (« Ce que Milo sait de toi »),
sa clé se libère → elle peut réapparaître si la tendance persiste (suppression =
choix volontaire, donc légitime).

**Fichiers** : `tracking.js` (générateurs + logique + validate/reject/delete),
`screens.js` (`_renderObsCard`/`openMiloKnows`/`_renderMiloKnows`), `coach.js`
(injection validated-only via `o.fact`), `index.html` (`#home-obs`, `#ov-milo-knows`,
ligne menu), `style.css` (`.obs-*`/`.mk-*`), `constants.js` (WHATS_NEW v18 🧠 +
red dot `milo-knows`), `screens.js` (aide `?` Accueil), `sw.js` (ft-v465).

**Tests Playwright** : 10 séances semaine/matin → 4 candidates (morning 1.0,
weekday 0.96, upper 0.75, regular 0.75) ; carte affiche l'hypothèse + 2 boutons ;
validate → fait injecté dans Milo + carte vidée ; reject → `rejected`, non
re-proposé (passe au suivant) ; « Ce que Milo sait de toi » liste + suppression ;
0 erreur JS ; visuels OK. **Découpage** : 5A = ancré données (fait) ; **5B** =
génération IA plus riche (plus tard).

**Rollback :** `git reset --hard origin/backup-2026-07-19-avant-brique5a`

**Principe.** Milo **remarque → propose → l'utilisateur VALIDE → c'est rangé en
mémoire (`S.registre.observations`, déjà câblé brique 1) → il réutilise.** Rien
n'entre sans validation (Principe 3). L'utilisateur peut **supprimer** à tout
moment (Principe 11). « Tu valides » = le dernier mot au sportif (cohérent avec
le futur Principe 14 en discussion).

**Découpage.**
- **5A** (à coder) = le MÉCANISME complet (proposer → valider → ranger →
  réutiliser → supprimer) avec des observations **ANCRÉES DONNÉES** (dérivées
  des faits/séances, zéro invention).
- **5B** (plus tard) = observations plus riches **générées par l'IA**.

**4 règles ajoutées par ChatGPT (validées, à respecter dans la 5A) :**
1. **Humilité** — formuler en HYPOTHÈSE (« j'ai *peut-être* remarqué… »), le ton
   invite à valider (Principe 7).
2. **Une observation à la fois** — jamais plusieurs propositions simultanées.
3. **Le bon moment** — pas au hasard : après plusieurs séances/échanges, quand
   une tendance devient claire.
4. **Seuil de confiance INTERNE** — chaque candidate a un niveau de confiance ;
   faible → attendre, élevé → proposer. Interne (ne complique pas l'UX).

**Modèle.** `S.registre.observations[]` = `[{text, confidence, status:'pending'|
'validated'|'rejected', source, proposedAt, validatedAt}]`. Injection Milo : déjà
en place (seules les `validated` comptent). Une `rejected` n'est pas re-proposée
en boucle.

**Décisions à trancher avant de coder (dans le cadrage détaillé) :**
- OÙ propose-t-on ? (carte Accueil « 💡 Milo a remarqué… » + espace « Ce que Milo
  sait de toi » — reco Claude, discret).
- Quelles observations candidates au départ (option A, ancrées données) : ex.
  week-end/semaine, haut vs bas du corps, sommeil↔énergie, régularité… — garder
  celles qui CHANGENT une décision de Milo.
- Format de validation : ✅ oui · ❌ non · ✏️ corriger (1 tap).

**Critère de réussite** : Milo propose UNE observation vraie/ancrée, humble, au
bon moment ; validée → mémoire durable réutilisée ; refusée → jetée, pas de
harcèlement ; supprimable ; rien sans validation ; rétrocompatible ; 4 axes OK.

---

## 🛡️ Brique 6A — LE GARDIEN (à partir de l'existant) · `ft-v468` · 19/07/2026 · ⏳ EN ATTENTE VALIDATION MICHEL

> Cadrage validé (ChatGPT + Claude). Michel : « on y va, tkt pour le réel » → codé
> sans attendre la validation réelle de la 5A. *« buildCoachContext rassemble les
> connaissances, le Gardien leur donne un cadre de décision. »* (ChatGPT)

**Ce qui a été fait.** `_gardienRules()` (coach.js) — une **vraie fonction** qui
produit une liste de **règles de sécurité explicites**, collées **EN TÊTE** du
briefing de Milo (avant « Tu es Milo… »), à partir de ce qu'on sait DÉJÀ :
- **Blessures structurées** (`S.healthProfile.injuries` : zone + statut) → règle
  par zone (épaule/genou/lombaires/dorsaux/cervicales/coude/poignet/hanche/cheville),
  taggée `[ACTIVE — protège fortement]` si le statut est actif.
- **Zones fragiles ADN** (`S.adn.fragile`, texte libre) → détection par mots-clés
  (accents ignorés) → même règle, taggée `[zone fragile durable]`.
- **Conditions santé** (`S.healthProfile.conditions`) : arthrose · hernie · HTA ·
  ostéoporose · migraines → consigne dédiée.

**Philosophie (Constitution v1.3, Principe 13) + raffinements ChatGPT :**
- **ADAPTER, jamais interdire bêtement** ; l'arrêt total est l'exception.
- **Chercher l'adaptation la MOINS restrictive** qui permet de continuer à
  progresser en sécurité.
- **Tenir compte de l'objectif du jour** (performance/entretien/reprise/défoulement).
- Catalogue = **repères CONTEXTUELS**, pas des interdictions rigides.
- Douleur du jour FORTE/aiguë → repos + professionnel de santé (jamais de diagnostic).

**Rétrocompatible** : si aucune blessure / zone fragile / condition → `_gardienRules()`
renvoie `''` (Gardien silencieux, contexte identique à avant).

**Découpage.** 6A = à partir des données existantes (fait). **6B** (plus tard) =
la **fiche exercice structurée** → règles précises par exercice.

**Backlog (idée ChatGPT, pas maintenant)** : un niveau interne de vigilance
Vert/Jaune/Orange/Rouge pour moduler la prudence de Milo.

**Checklist nouveauté (règle #11)** : pop-up « Quoi de neuf » **v19** 🛡️ +
`WHATS_NEW_MAX=19` ; red dot `gardien-securite` (Coach) ; aide `?` Coach ; aide
détaillée « Milo veille sur ta sécurité ».

**Fichiers** : `coach.js` (`_gardienRules` + prepend + aide détaillée), `constants.js`
(WHATS_NEW v19 + red dot), `screens.js` (aide `?` Coach), `sw.js` (ft-v468).

**Tests Playwright** : rien → Gardien vide (contexte démarre par « Tu es Milo ») ;
épaule D active + arthrose + genou (ADN) → règles en tête, tags ACTIVE/durable,
« adapter pas interdire » + « moins restrictive » + « contextuels » présents ;
lombaires depuis l'ADN OK ; 0 erreur JS.

**Rollback :** `git reset --hard origin/backup-2026-07-19-avant-gardien6a`

### 🔀 MàJ `ft-v469` — Séparation ADN sportif / Profil Santé (résout le doublon)

> Retour Michel (« ça fait doublon avec l'ADN et la Santé ? ») + proposition
> ChatGPT (séparer par **NATURE**, pas par thème). Validé.

- **Une « zone fragile » n'est pas l'identité sportive → c'est de la vigilance
  SANTÉ.** Donc : le champ **« zones fragiles » quitte l'ADN** (ADN = 4 champs :
  motivation · mode de vie · préférences · expérience) et vit dans **Profil →
  Santé**, qui devient **la seule source du Gardien**.
- **Le Gardien (6A)** ne lit plus `adn.fragile` : il lit la **Santé** — blessures
  structurées (`healthProfile.injuries`) + conditions + **`healthProfile.notes`**
  (détection texte libre).
- **Migration `_migrateFragileToHealth()`** (state.js, flag `ft4_fragmig1`) :
  `adn.fragile` → `healthProfile.notes` (« Zones fragiles : … »). **Idempotente
  + robuste au cloud** (re-jouée à la restauration : un vieil ADN cloud avec
  `fragile` est aussi migré → **rien perdu**).
- Bénéfice : **plus de doublon**, un **modèle mental clair** (chaque couche = une
  responsabilité), et le Gardien a **une seule source de vérité**. Rappel aussi :
  fréquence/récup/habitudes = **Faits mesurés**, jamais déclarés dans l'ADN.
- Testé Playwright (migration local + cloud, Gardien depuis notes Santé, ADN 4
  champs, contexte propre, 0 erreur JS).
- **Rollback :** `git reset --hard origin/backup-2026-07-19-avant-adn-sante-sep`

---

## 🛡️ Brique 6B — LE GARDIEN PRÉCIS · `ft-v470` · 19/07/2026 · ⏳ EN ATTENTE VALIDATION MICHEL

> Cadrage validé (ChatGPT + Claude). Approche « catégories de mouvement » plutôt
> que 255 fiches à la main. *« Le Gardien ne se demande pas si un exercice est bon
> ou mauvais, mais s'il est adapté à cette personne, aujourd'hui. »* (ChatGPT)

**Ce qui a été fait.** Le Gardien passe de « par zone » à « **par exercice** » :
- **`_GARDIEN_CONSTRAINTS`** (coach.js) = table des **contraintes du mouvement**
  (sollicitations articulaires) déduites du NOM : au-dessus de la tête · charge
  sur la colonne · flexion profonde du genou · grip lourd · impact/sauts ·
  curls/extensions du bras. Chaque contrainte → zones sollicitées + exemples à
  **alléger** + une **alternative plus douce**.
- **Par zone fragile**, le Gardien ajoute : « → sollicitée par … ; allège/mets de
  côté (surtout LOURD) : … ; alternatives plus douces : … ».
- **Séance du jour** : le Gardien scanne `S.wkt.exs` et **nomme les exercices en
  cours** qui sollicitent une zone fragile (« Développé Militaire → sollicite ton
  épaule »), en proposant d'alléger ou une alternative — sans interdire.

**Réglages retenus (retour ChatGPT) :**
- **Point 3 (terme neutre)** ✅ : « **sollicite** » / « contraintes du mouvement »,
  jamais « à risque » — le Gardien ne juge pas un exo bon/mauvais.
- **Point 1 (intensité)** ✅ léger : « la plupart de ces sollicitations ne posent
  problème qu'à **CHARGE LOURDE** → réduire la charge/les reps AVANT de changer
  d'exercice » (levier le moins restrictif).
- **Point 2 (état du jour)** ⏳ **reporté au 3B** (capture structurée de l'état du
  jour) — déjà géré en partie par la conversation ; on garde la 6B simple.

**Rétrocompatible** : aucune zone fragile / condition → Gardien silencieux.

**Fichiers** : `coach.js` (`_GARDIEN_CONSTRAINTS`/`_GARDIEN_ZLABEL`/`_gzNaz` +
`_gardienRules` enrichi), `sw.js` (ft-v470). *Nouveauté : couverte par le pop-up
v19 « Milo veille sur ta sécurité » (6B = même feature, plus précise) — pas de
nouveau pop-up.*

**Tests Playwright** : durable → sollicitations + exemples à alléger + alternative
+ intensité + « ne juge pas » ; séance en cours → exos du jour nommés (Militaire→
épaule, Squat→genou), Curl non signalé ; rien → silencieux ; 0 erreur JS.

**Rollback :** `git reset --hard origin/backup-2026-07-19-avant-gardien6b`

---

## 🌡️ Brique 3B — L'ÉTAT DU JOUR STRUCTURÉ · `ft-v471` · 19/07/2026 · ✅ CLÔTURÉE (validée Michel)

> Complète la brique 3 (état du jour conversationnel, 3A). La 3A laissait Milo
> *demander* comment on va ; la 3B laisse la personne le **noter en un geste** —
> et surtout donne au **Gardien** une **douleur du jour** à protéger en priorité.
> Cadrage validé : approche **hybride** — capture structurée légère et optionnelle
> maintenant ; extraction IA depuis la conversation = « 3B+ » plus tard.

**Ce qui a été fait.**
- **`S.dayState`** (`ft4_daystate`) = `{date, energy, mood, pains:[{zone,intensity}], note}`
  — **remis à zéro chaque jour** (si `date` ≠ aujourd'hui, on repart d'un état vide).
- **Petite carte optionnelle sur l'Accueil** (`_renderDayStateCard`, `#home-daystate`,
  CSS `.ds-*`) : 4 émojis d'énergie (😴😐🙂⚡) + puces des zones qui font mal
  aujourd'hui (épaule, genou, bas du dos, nuque, coude, poignet, hanche, cheville).
  Un tap suffit, rien d'obligatoire.
- **Le Gardien protège une douleur DU JOUR en PRIORITÉ** (`_gardienRules`, coach.js) :
  une zone marquée douloureuse aujourd'hui prend le tag **« DOULEUR AUJOURD'HUI —
  priorité, protège cette zone en PREMIER »** (avant même une blessure `[ACTIVE]`
  ou une zone fragile durable).
- **Milo reçoit un bloc « 📍 ÉTAT DU JOUR »** (`buildCoachContext`) : énergie du
  jour + zones qui font mal + note libre, avec le rappel « **le ressenti prime
  toujours sur les chiffres** ». Ponctuel (aujourd'hui seulement), distinct du
  Registre (« qui tu es ») et de l'ADN (« ton portrait durable »).

**Réglages retenus (cadrage) :**
- **Léger et optionnel** : une carte discrète, jamais un passage obligé (Vision :
  « la présence sans gadget »).
- **Structuré maintenant, IA plus tard** : la 3B capture ce que la personne coche ;
  faire *déduire* l'état du jour par Milo depuis la conversation = brique **3B+**.
- **Priorité absolue au jour** : une douleur du jour passe devant tout le reste
  dans le Gardien (Principe 12 : le ressenti prime).

**Rétrocompatible** : rien coché → carte neutre, Gardien silencieux, aucun bloc
« état du jour » injecté → contexte identique à avant.

**Fichiers** : `state.js` (load/persist `ft4_daystate`), `screens.js`
(`_renderDayStateCard`/`setDayEnergy`/`toggleDayPain` + appel dans `renderHome` +
aide `?`), `coach.js` (Gardien priorité douleur du jour + bloc « ÉTAT DU JOUR » +
aide détaillée 🌡️), `index.html` (`#home-daystate`), `style.css` (`.ds-*`),
`constants.js` (WHATS_NEW v20 🌡️ + `WHATS_NEW_MAX=20` + red dot `day-state`),
`sw.js` (ft-v471).

**Tests Playwright (5/5, 0 erreur JS)** : carte + énergie + douleur persistés ;
Gardien → tag « DOULEUR AUJOURD'HUI » actif sur l'épaule ; contexte Milo → bloc
état du jour (fatigue + douleur épaule + « ressenti prime ») ; reset quotidien
(date d'aujourd'hui, énergie/douleurs vidées) ; rien coché → Gardien vide + pas de
bloc.

**Rollback :** `git reset --hard origin/backup-2026-07-19-avant-3b`

**✅ VALIDÉE par Michel** (test réel iPhone : « 3B validé », « ça fonctionne
nickel »). Reste noté pour plus tard (IDEES-FUTURES) : **réduire la carte** en
version compacte repliée (elle encombre le haut de l'Accueil). Les **testeurs sont
prévenus** via un pop-up dédié (ft-v474) qui leur demande de vérifier le
comportement du score + la protection de Milo → retours via la Boîte à idées.

**Suite immédiate (ft-v472 → ft-v473) — le ressenti du jour et le score de récup.**
Retour de Michel en test réel : il coche « Bas du dos » + 🙂 mais le score reste
« 92/100 · Prêt à performer » → le score contredisait le ressenti. **Deux temps :**
- **ft-v472** (première réponse) : l'état du jour ajustait le score en douceur
  (énergie + douleur, −3/zone plafonné −8).
- **ft-v473** (affinage, réflexion ChatGPT validée) : on **sépare énergie et
  douleur**. L'**énergie** reste un signal de readiness → ajuste le score en
  douceur (😴 −10 · 😐 −4 · 🙂 0 · ⚡ +4, facteur « 🌡️ Forme du jour »). La
  **douleur/gêne n'est PAS un manque de récup** → elle **ne touche plus le
  chiffre** ; elle devient un **bandeau contextuel ⚠️** sous le score (« ton corps
  est récupéré, mais échauffe-toi bien et allège si besoin — tu peux t'entraîner »).
  → l'exemple de ChatGPT : « 92/100 · Prêt à performer » ⚠️ gêne au dos. Milo + le
  Gardien voient toujours la douleur du jour (inchangé). **Principe : distinguer le
  *score de récup* (physiologique) du *contexte du jour* (douleur/ressenti) —
  « adapter, pas interdire ».**
Rollback : `git reset --hard origin/backup-2026-07-19-avant-ressenti-score`.

---

## 🛡️ Note de conception — LE GARDIEN (référence 6A/6B) : « adapter, pas interdire »

> Réflexion posée le 19/07/2026 (ChatGPT + Claude + Michel), en amont de la
> brique 6. **Principe désormais gravé en Constitution (Principe 13 « l'adaptation
> avant l'interdiction », v1.3).** Cette note conserve le matériau de conception.

**Philosophie.** Le Gardien n'est **pas un système d'interdiction** mais un
**système d'adaptation**. Sa première question n'est jamais « faut-il empêcher
l'entraînement ? » mais **« comment permettre de continuer de la manière la plus
sûre et la plus adaptée ? »**. L'adaptation est le comportement **par défaut** ;
l'arrêt total est **l'exception**. Objectif : que l'utilisateur sente que Milo
**protège sa progression**, sans devenir **anxiogène** ou excessivement prudent.
La sécurité **guide** l'adaptation, elle n'en est pas un **frein systématique**.

**Arbre de décision** (à implémenter dans le Gardien) — avant de limiter une
séance, Milo se demande :
1. Le problème est-il **ponctuel ou durable** ? *(douleur du jour ≠ zone fragile durable — cf. ADN brique 4A)*
2. Quelle **intensité** ?
3. Quelles **zones** concernées ?
4. Peut-on **adapter** plutôt que supprimer ? *(charge, amplitude, exercice, séance, repos, protéger une zone en poursuivant le reste)*
5. Existe-t-il une **alternative sûre** ?

**Exemples.** Arthrose du genou → adapter le travail des jambes, pas le
supprimer. Épaule sensible → modifier exercices/prises/amplitude/charge.
Courbatures quadriceps → entraîner le haut du corps. Peu de temps → adapter la
séance, pas culpabiliser.

**Note d'architecture.** Le Gardien est **à la fois** le garde-fou sécurité **et**
le « moteur de décision » (priorisation des infos). → On ne crée donc **pas** de
brique « moteur de décision » séparée (elle doublonnerait le Gardien). L'ordre de
priorité (Sécurité > Ressenti du jour > Vie réelle > Préférences > Programme
idéal) pourra être posé plus tôt, en consigne de Milo, puis consolidé par le
Gardien.

---

## 🔜 Prochaines briques prévues (rappel, ordre indicatif)

1. **Le socle « Dossier »** — créer l'objet mémoire (tiroir sauvegardé + synchro)
   et l'injecter dans Milo. *(petit, sans risque)*
2. **Les faits mesurés** — l'app calcule des faits sûrs (durée moyenne des
   séances, régularité, exos préférés/évités, lien sommeil↔perf). *(fiable)*
3. **L'état du jour** — mini check-in avant la séance (humeur, stress, douleurs,
   envie 0-10). *(nouveau petit écran)*
4. **L'ADN sportif** — étoffer le questionnaire « Milo apprend à te connaître ».
5. **Les observations de Milo (à valider)** — Milo propose, tu valides. *(cœur)*
6. **Le Gardien** — une petite fonction qui sort une liste de « règles
   impératives » (sécurité) collée en haut du briefing de Milo. **Adapter, pas
   interdire** (voir la note de conception ci-dessus + Constitution Principe 13).
   *(dépend des fiches exercices)*
7. **L'historique intelligent** — synthèses utiles (« +8 kg en 8 semaines,
   facteurs observés… »).

> ⚠️ Fondation transverse : la **fiche exercice structurée** (aujourd'hui un
> exercice = juste son nom) aide les briques 2, 5, 6. À prévoir quand on y sera.
