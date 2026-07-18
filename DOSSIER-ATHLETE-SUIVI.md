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

Documents de réflexion liés (dans la boîte à idées / échangés avec ChatGPT) :
avis « MILO ENGINE », « Dossier Athlète », « Milo V3 / le Gardien ».

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
