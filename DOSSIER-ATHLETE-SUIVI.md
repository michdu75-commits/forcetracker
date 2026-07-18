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

### Brique 3 — L'état du jour (version 3A conversationnelle) · `ft-v462` · 19/07/2026
*(Version consolidée après échanges Michel / ChatGPT / Claude / Gemini.)*

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
   impératives » (sécurité) collée en haut du briefing de Milo. *(dépend des
   fiches exercices)*
7. **L'historique intelligent** — synthèses utiles (« +8 kg en 8 semaines,
   facteurs observés… »).

> ⚠️ Fondation transverse : la **fiche exercice structurée** (aujourd'hui un
> exercice = juste son nom) aide les briques 2, 5, 6. À prévoir quand on y sera.
