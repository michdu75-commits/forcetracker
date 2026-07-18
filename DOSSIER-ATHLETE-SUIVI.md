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

## 🛡️ Note de conception — LE GARDIEN (brique 6, à venir) : « adapter, pas interdire »

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
