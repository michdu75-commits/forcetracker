# 🧠 Plan — Coach IA enrichi, export premium & optimisation

> Document de réflexion préparé pour Michel (nuit du 3→4 juillet), à sa demande :
> « Réfléchis comment améliorer le coach IA, l'enrichir — analyse complète pour les premium,
> analyse basique pour les freemium. Exporter les données que le coach donne (premium).
> Voir ce qui a été fait ou non dans le fichier idées. Voir si on peut encore optimiser. »
>
> ⚠️ **Rien ici n'est encore codé.** C'est un plan à valider. La plupart de ces points touchent
> soit à des **fonctions** (donc pas du restylage), soit au **backend `Code.js`** (déployable
> uniquement depuis ton PC via clasp), soit à la **logique premium** (sensible). On décide ensemble
> avant de coder, une chose à la fois, testée.

---

## 0. Ce qui est DÉJÀ fait (état réel du Coach dans le code, 4 juillet)

Pour ne pas réinventer ce qui existe, voici ce que le Coach fait **déjà** aujourd'hui :

| Fonction | État | Où |
|---|---|---|
| Chat Coach IA (Claude Haiku 4.5) | ✅ | `coach.js` `sendToCoach` → `Code.js` `handleCoach_` |
| Contexte riche injecté (profil, PRs, cycle, 3 dernières séances, récup/sommeil, poids, check-in, **profil santé**, morpho) | ✅ | `coach.js` `buildCoachContext` |
| 4 boutons d'analyse rapide (Programme perso, Analyse mes stats, Conseil nutrition, Analyse morpho) | ✅ | `coach.js` `coachAction` |
| Analyse morpho par photos (3 photos, Vision) | ✅ | `Code.js` `handleMorphoAnalysis_` |
| Analyse de programme par IA | ✅ | `log.js` `analyzeProgIa` |
| **Mémoire premium** (résumé des conversations, régénéré côté serveur) | ✅ | `_saveCoachMemory` + `Code.js` (résumé Haiku 250 tokens) |
| Quota gratuit = 10 questions, puis mur premium | ✅ | `COACH_FREE_LIMIT=10` |
| Plan de repas IA (jour/semaine) — **déjà codé côté backend** | ✅ backend | `Code.js` `handleGenerateMealPlan_` |
| Photo corporelle dans le chat | ✅ | `_coachImg` |

**Ce qui MANQUE par rapport à ta vision (fichier idées) :**
1. ❌ Le coach **ne voit PAS la séance en cours** (`S.wkt` absent du contexte) → il ne peut pas t'aider *pendant* que tu t'entraînes.
2. ❌ Pas de **différence de qualité** freemium/premium sur les analyses (aujourd'hui la seule différence = le quota de 10 + la mémoire). L'analyse elle-même est identique.
3. ❌ Pas d'**export** des réponses du coach.
4. ❌ Pas de coach **proactif** (message avant/après séance, félicitations PR…).

---

## 1. 🎯 Coach IA : analyse COMPLÈTE (premium) vs BASIQUE (freemium)

### L'idée
Aujourd'hui, quand un gratuit et un premium cliquent sur « Analyse mes stats », ils reçoivent la
**même** analyse (juste, le gratuit épuise son quota de 10). Ta demande : que le **premium** ait une
analyse **complète et bluffante**, et le **gratuit** une version **basique** qui donne envie de passer premium.

### Comment faire ça proprement (recommandation)

Le levier, c'est **la richesse des données envoyées au modèle** + **la longueur/profondeur autorisée**.
On garde **une seule IA** (pas de 2ᵉ modèle), on la **nourrit différemment** selon le statut :

| | 🆓 Freemium (basique) | ⭐ Premium (complète) |
|---|---|---|
| Données envoyées | Profil + 3 dernières séances + PRs principaux | **Tout** : + tendances calculées (volume/semaine, déséquilibres par muscle, régularité), + récup/sommeil, + cycle de force, + profil santé, + mémoire |
| Longueur réponse | Courte (≈120 mots, 1 conseil clé) | Détaillée (≈300-400 mots, plan structuré) |
| Ton | Conseil général | Cite **tes chiffres exacts** (« ton bench +12% en 6 sem, plus vite que ton squat ») |
| Suivi | Réponse unique | Mémoire (se souvient des échanges précédents) |
| Bandeau | « 🔒 Analyse complète réservée au premium → active » | — |

**Techniquement** : dans `buildCoachContext()`, on passe déjà tout. Il suffit d'ajouter un paramètre
`niveau` (basique/complet) qui :
- pour le **basique** : tronque le contexte (moins de séances, pas de mémoire) + ajoute au system prompt « Réponds en 120 mots max, un seul conseil actionnable, termine en suggérant qu'une analyse complète est disponible ».
- pour le **complet** : contexte entier + « Analyse détaillée, cite les chiffres réels, structure en sections ».

C'est **peu risqué** (on ne touche pas la logique premium existante, juste le contenu du prompt), mais
ça **change une fonction** → donc à faire hors du restylage, avec ton accord, testé.

### 🔥 Le vrai game-changer : les TENDANCES calculées (effet « il est trop calé »)
Le fichier idées insiste là-dessus (ligne 550) : le coach paraît génial quand il **repère des tendances
invisibles**. Aujourd'hui on lui envoie les séances brutes ; il doit tout recalculer lui-même (coûteux + approximatif).
**Proposition** : calculer **côté app** (gratuit en tokens, précis) et lui servir tout mâché :
- progression 1RM par exercice sur 4/8 semaines (%),
- déséquilibres (ex. « pousser » vs « tirer », gauche/droite si dispo),
- régularité (séances/semaine en baisse ?),
- muscles négligés (pas travaillés depuis X jours).

→ Ces calculs existent déjà en partie (`renderChart`, `_mscScores`, régression poids). On les **résume
dans le contexte** premium. C'est **ça** qui fait la différence « waouh », plus que la longueur.

---

## 2. 📤 Export des réponses du Coach IA (premium)

### L'idée
Permettre au membre premium de **récupérer** ce que le coach lui a donné (un programme, une analyse,
des conseils) au lieu que ça se perde dans le fil du chat.

### Options (de la plus simple à la plus riche)

**A. Copier / Partager une réponse (SIMPLE, recommandé en 1er) — 100% frontend, faisable web**
- Petit bouton **📋 Copier** et **📤 Partager** sous chaque réponse du coach.
- Copier → presse-papier (comme `copyWeekSummary` qui existe déjà).
- Partager → `navigator.share()` (feuille de partage native : Notes, Mail, WhatsApp…).
- **Réservé premium** (le gratuit voit le bouton grisé + « ⭐ premium »).
- ✅ Aucun backend, aucune dépendance, testable tout de suite.

**B. Exporter toute la conversation en fichier (MOYEN) — frontend**
- Bouton « Exporter mes échanges avec le coach » → génère un **.txt ou .md** propre (daté) et le télécharge.
- Réutilise la logique de `exportData()` (menu Compte) qui existe déjà.
- Premium uniquement.

**C. « Ajouter à mes séances » un programme donné par le coach (RICHE) — frontend + un peu de backend**
- Quand le coach génère un programme, bouton **« ➕ Ajouter à mes programmes »** → le parse en JSON
  (comme l'import de programme existant) et l'ajoute à `S.programmes`.
- C'est l'idée forte du fichier (transformer la parole du coach en vraie donnée exploitable).
- Plus de travail (parsing fiable de la réponse), mais très gros bénéfice. À cadrer.

**Recommandation** : livrer **A** en premier (rapide, utile, premium-gated), puis **C** plus tard.

---

## 3. ⚡ Optimisation de l'app

### 3a. Coûts / tokens IA (impact direct sur ta facture Anthropic)
- ✅ Déjà bien : Haiku (pas cher) pour le chat, `max_tokens` adaptés, `history.slice(-8)`.
- 💡 **Contexte envoyé à CHAQUE message** = tout le profil + séances (gros). Sur une longue conversation,
  on renvoie ce pavé à chaque tour. **Piste** : n'envoyer le gros contexte **qu'au 1er message**, puis
  s'appuyer sur l'historique. Économie réelle. (À tester : Haiku garde bien le fil.)
- 💡 **Cache prompt Anthropic** : le system prompt (contexte) est réutilisé → activer le *prompt caching*
  côté API (`cache_control`) diviserait le coût des tokens de contexte répétés. Backend `Code.js`.
- 💡 **Freemium = contexte réduit** (cf. §1) → moins de tokens sur les gratuits (les plus nombreux).

### 3b. Performance perçue (ouverture, fluidité)
- ✅ Déjà très bon : SW cache-first, polices locales, timeout réseau 3s, local-first.
- 💡 **Images/GIF exercices** : le fichier idées le répète — **compression + lazy-load AVANT** d'ajouter
  d'autres visuels, sinon l'app s'alourdit. Le `PRECACHE` du SW grossit (beaucoup d'anatomie/muscles) →
  vérifier qu'on ne précache pas des images lourdes rarement vues (les charger à la demande plutôt).
- 💡 `index.html` volumineux : le **découpage** (priorité #2 du fichier idées) reste le meilleur
  investissement long terme — moins de régressions, modifs plus rapides.

### 3c. Robustesse données (le plus important — cf. incidents)
- Le fichier idées classe ça **priorité produit n°1** : **auto-restauration** au démarrage si iOS purge
  le localStorage, et **ne jamais écraser le cloud avec moins de données**. Une bonne partie est faite
  (garde-fous serveur @47-50, ft-v154-160), mais à **re-vérifier** que les `programmes` sont bien
  synchronisés partout (faille signalée ligne 354).

---

## 4. 📋 Fichier idées — ce qui est FAIT vs PAS FAIT (synthèse)

### ✅ Fait (repéré dans le code / historique)
- Chrono repos : gros affichage, pastille flottante, décompte 10s plein écran, silencieux (ft-v135/166).
- Commentaires libres par exercice (ft-v136).
- Superséries / dropsets UX (ft-v107-111).
- Tags de série É/N/X + échauffement exclu du volume (branche set-tags).
- Import programme (Word/Excel/PDF/image) + import historique par lots (@57/@58, ft-v161/167).
- Limite premium import journal (ft-v168).
- Badges & récompenses, résumé hebdo, popup PR.
- Profil santé (blessures/pathologies) **injecté dans le coach** (`buildCoachContext`).
- Morphologie + analyse photos.
- Backups Drive quotidiens (Code.js @51-54).
- Accessibilité : basse vision, gaucher/droitier, daltonien (design ne repose pas que sur la couleur).
- Swipe entre onglets.
- Détail : plan de repas IA **déjà codé backend** (`handleGenerateMealPlan_`).

### ⏳ Pas fait / partiel — candidats prioritaires (mon avis)
| Idée | Valeur | Coût | Où |
|---|---|---|---|
| **Coach voit la séance en cours (`S.wkt`)** | ⭐⭐⭐ | Faible (frontend) | « compagnon de séance » |
| **Analyse complète/basique premium** (§1) | ⭐⭐⭐ | Moyen (frontend) | monétisation |
| **Export réponses coach** (§2, option A) | ⭐⭐ | Faible (frontend) | premium |
| Coach **proactif** (mot avant/après séance, félicitations PR) | ⭐⭐⭐ | Moyen | addiction |
| Comparer **prévu vs réalisé** (programme vs séance) | ⭐⭐ | Moyen | surcharge progressive |
| Mode **Simple / Expert** (Expert = premium) | ⭐⭐ | Moyen | lisibilité + premium |
| **Découper index.html** | ⭐⭐⭐ | Gros | dette technique |
| Uniformité **icônes** (supprimer emojis → trait fin) | ⭐⭐ | Moyen | cohérence visuelle |
| Nutrition repas premium (semaine + historique) | ⭐⭐ | Moyen (backend déjà là !) | premium |
| Réduire présence du **rouge** | ⭐ | Faible | premium look |

### 🧱 Gros chantiers (long terme, décision produit)
Migration Supabase, paiement Stripe/stores (+ auto-entreprise), objets connectés (Garmin), logging vocal,
thème femme, social/communauté, fonds événementiels (14 juillet…).

---

## 5. ✅ Ma recommandation d'ordre (si tu es d'accord)

Petits pas, testés, une chose à la fois — en **frontend** (que je peux faire et tester ici) d'abord :

1. **Coach voit la séance en cours** (`S.wkt` dans le contexte) — petit, sans risque, gros effet compagnon.
2. **Export réponse coach — option A** (Copier/Partager, premium) — rapide, concret.
3. **Analyse basique vs complète** (§1) — le cœur de ta demande premium.
4. **Tendances calculées côté app** injectées au coach premium — l'effet « waouh ».

Puis, quand tu es sur ton PC (backend) : **prompt caching** + contexte au 1er message seulement (économie tokens).

> Dis-moi juste par quoi on commence, et si tu valides que ces points **modifient des fonctions**
> (donc hors « restylage pur »). Je fais chaque point sur une branche, testé jour + nuit, avec rollback.
