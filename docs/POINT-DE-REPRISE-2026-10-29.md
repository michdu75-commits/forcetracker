# 📍 POINT DE REPRISE — 29/10/2026 (Claude Principal)

## PARTIE A — ÉTAT ACTUEL : après la FINALISATION de NUT-VERROU-01 (la plus récente, à lire en premier)

> **À relire en premier à la reprise, puis ATTENDRE le GO de Michel.** Aucun code, test lourd, fusion ni publication n'est autorisé par ce fichier.
> Il ne remplace ni `CLAUDE.md`, ni `docs/CONTEXTE-ACTUEL.md`, ni le registre/la passation maître Drive (non modifiés).
> **Historique** : écrit avant la compaction (état `712172f4`), puis mis à jour après le GO « Finalisation ciblée NUT-VERROU-01 » (même jour). Rien n'est effacé : la version d'avant est gardée telle quelle en PARTIE B (en bas), et les quatre points ouverts d'avant sont repris en §4 avec leur sort.

## 1. Références Git (vérifiées sur GitHub le 29/10/2026)

| Élément | Référence |
|---|---|
| `master` / production | `3d8d49ef` · `ft-v1262` — **inchangés** |
| Sauvegarde | `backup-prod-ft-v1262-avant-b2-b3-2026-10-29` = `3d8d49ef` |
| **B2** (lecture normalisée des masquages) | `claude/nut-b2-lecture-normalisee` = `integration/nut-b2-2026-10-29` = **`b015db75`** — validé en bancs, **non publié** |
| **NUT-VERROU-01** (finalisé) | `claude/nut-verrou-valeurs-01` — pointe = le commit « passation » le plus récent (son SHA figure dans le journal de partage et dans le rapport) ; **code applicatif = `09c1e80d`** (inchangé depuis), **tests = `eb63430d`** ; base `b015db75` — **non fusionné, non publié** |
| Étapes de la finalisation | `fc28e086` journal d'ouverture · `3fe46015` les 4 défauts REPRODUITS (28 témoins rouges) · `09c1e80d` corrections + tests · `eb63430d` témoins à l'épreuve des plantages + 42 mutations · passation (ce fichier + journal) |
| **D-141 minimal** (serveur, `Code.js`) | `claude/nut-d141-masquages-serveur-minimal-01` = `76639a52` — testé en simulation, **non publié, non déployé** |
| A2/A3 (études) | `claude/nut-d141-correctifs-a2-a3-01` = `7f40cf2b` — **aucun code**, rapports seulement |
| Avant la finalisation | `712172f4` (= `f0488553` code + passation) |

## 2. Décisions de Michel (définitives)
- **NUT-VERROU-01** : sur une fiche alimentaire **identifiée**, **toutes les informations du produit sont verrouillées** ; **seule la quantité consommée reste modifiable** (et le repas, qui appartient à la ligne du journal, pas au produit). Les calories/macros = fiche × quantité, jamais une correction.
- **Finalisation (GO du 29/10, après compaction)** : ① un produit Open Food Facts identifié reste verrouillé **même si son énergie est `NON_RESOLU`** (l'avertissement de fiabilité est conservé, rien n'est inventé) ; ② le **nom** d'un produit identifié est verrouillé (interface et enregistrement) ; ③ **aucune suppression silencieuse de trace historique** (`n2.hc`) ; ④ changer **uniquement le repas** ne recalcule rien ; une modification de quantité repart de la fiche et **avertit avant confirmation** si des chiffres enregistrés changent à cause de l'abandon d'une ancienne correction.
- **A2** (anciennes chaînes) : **option D** — rien ne change sans preuve nouvelle.
- **A3** (écritures concurrentes) : **reporté au chantier Sécurité** (rapports conservés : architecture 3A = verrou de script court sur les 6 écrivains ; prérequis non vérifié : sonde `LockService` dans un projet de test séparé). **Interrupteur de désactivation du verrou : refusé.**
- **D-141** : lot distinct, déploiement serveur sur GO explicite, non publié.
- Ne pas confondre : **NUT-B3 historique** (cible calorique/macros) = fermé, publié en `ft-v1245` ; le « B3 » récent = ce verrouillage des valeurs (`NUT-VERROU-01`).
- ⚠️ Aucun numéro `D-nnn` n'a été attribué à ces décisions dans `docs/DECISIONS.md` (numérotation partagée avec l'autre session, risque de collision) : à faire à la publication, sur le GO de Michel.

## 3. Ce que NUT-VERROU-01 fait (branche seulement)
- **Moteur `nutrition-v2.js`** — `verrouillee(f)` : c'est l'**identité** qui verrouille (**source** `ciqual` / `off` / `marque`), plus la seule fiabilité (`fiab:'source'`) ; une fiche identifiée dont l'énergie est douteuse (`fiab:'estimee'`) est donc verrouillée aussi et **garde son avertissement** (`n2.st`, `n2.f.fiab`, trace du résolveur). Toute correction est refusée (`FICHE_VERROUILLEE`) ; renommer une ligne sur fiche identifiée est refusé (`NOM_VERROUILLE`) ; `reprise` ne rend plus les anciennes corrections (`correctionsEcartees`) ; historique additif `n2.hc` + note `correction-ecartee`.
- **Moteur — nouveau** : `changerRepas(ligne, repas)` (copie de la ligne, seul `meal` change : valeurs enregistrées, ancienne correction, `n2` — ou son absence — gardés à l'octet).
- **Historique `n2.hc`** : plus de troncature. Au-delà de 20 entrées la modification est **refusée** (`HISTORIQUE_PLEIN`, la ligne d'avant n'est pas touchée, la phrase dit quoi faire). Voir l'arbitrage restant (§4).
- **Écrans `app.js`** : champs ET nom en lecture seule sur une fiche identifiée ; plus de « Mettre X kcal » ; ouverture d'une ligne identifiée = **ses valeurs enregistrées** (rien n'est recalculé en silence), avec une note si elle avait été corrigée à la main ; quantité changée = fiche × quantité, et **si cela change les chiffres enregistrés parce qu'une ancienne correction est abandonnée, la note montre les chiffres (100 → 228) et « Enregistrer » demande une confirmation** (1ᵉʳ toucher : bouton « Confirmer : 228 kcal au lieu de 100 », 2ᵉ toucher : écrit) ; repas seul : `changerRepas`, aucune confirmation ; écran d'ajout : un autre texte que le nom du produit identifié est refusé avec une phrase (rien n'est construit) ; avertissement NON_RESOLU d'un produit verrouillé : dit la sortie (« choisis un autre produit, ou ferme puis rouvre Ajouter pour créer ta propre saisie ») ; un favori ne recopie jamais l'ancienne correction (identité, « estimée » comprise).
- **Tests** : `tests/parcours/nut_verrou.js` + `tools/banc_nut_verrou.js` (**90 OK / 0 rouge**, dont 28 témoins qui étaient rouges sur `712172f4`), `tools/mut_nut_verrou.py` (**42/42 tuées**, V01–V23 d'avant (anciennes ancres corrigées) + V24–V42 de la finalisation). Voisins : `nut2_moteur` 71/0 · `nut2_parcours` 111/0 · `nut_b2` 51/0 · `nut_v2_p1_croise` 16/0 · `nut_m6_rejeu` 29/0 · `foodlog_restore` 35/0 · `nut_secu_p1` 82/0 · `nut_fiabilite` 139/0 (dont 13 « sans objet » liés à D-141 absent, non comptés) · contrôle négatif `mut_nut2_moteur` 35/35.
- **Témoins anciens adaptés, jamais supprimés** (la règle a changé, le motif est écrit dans chaque fichier) : `banc_nut2_moteur` ⑰ ㉑ (« Modifier » garde le **nom** de la ligne) et ③ (8 fonctions, `changerRepas`) ; `nut2_parcours` fixtures « Galette » (une fiche *déclarée* a la source `utilisateur`, plus `off`) ; `nut_verrou` M13 (la borne devient un refus), P6/P7/P8 (valeurs enregistrées à l'ouverture, confirmation), P17b (le CONSTAT devient une règle).
- **Compteurs règle d'or 17 (code applicatif seul, cette finalisation)** : données persistées ajoutées **0** (le champ `n2.hc` existait déjà) · fichiers applicatifs touchés **2** (`app.js`, `nutrition-v2.js`) · lignes **+140 / −19** · anciens chemins supprimés/fusionnés **1** (la troncature silencieuse de `n2.hc`).

## 4. Les quatre points ouverts d'avant — leur sort
1. **OFF `NON_RESOLU` modifiable** → **TRANCHÉ ET CORRIGÉ** (identité par la source, avertissement conservé, sortie dite). Témoins M17–M20b, P17b/P17c/P17d, P27.
2. **Nom du produit modifiable** → **TRANCHÉ ET CORRIGÉ** (interface, moteur, écran d'ajout). Témoins M21, P28–P29.
3. **Borne de 20 de `n2.hc`** → **corrigé a minima, ARBITRAGE RESTANT pour Michel.** Reproduit : au-delà de 20 les plus anciennes traces disparaissaient sans un mot (M13 rouge, P30 rouge « Modifié ✅ »). Maintenant : refus explicite, aucune trace perdue, stockage borné. **Mesuré** : une correction ne peut entrer dans `n2.hc` que depuis `n2.corr`, qui ne se remplit plus que par un appareil resté sur une ancienne version ou une restauration ; chaque passage ajoute au plus 4 entrées (une par champ) — atteindre 20 demande au moins 5 passages de ce type sur la même ligne. **Options** : (A) *garder le refus à 20* — ce qui est livré, aucun nouveau stockage ; (B) *relever la borne* (40 ou 100) — même refus au-delà, plus de marge, ~60 octets par entrée et par ligne dans le pire cas ; (C) *archive dédiée* (nouvelle donnée persistée, ex. `S.corrArchive` par `id` de ligne) — conservation complète, mais nouveau stockage à synchroniser/sauvegarder/restaurer (règle d'or 17, hors périmètre sans ton arbitrage) ; (D) *exporter la trace avant de refuser* (même coût de stockage que C côté export). **Recommandation : A**, l'événement est improbable et sans perte.
4. **Seul le repas d'une ancienne ligne corrigée change** → **TRANCHÉ ET CORRIGÉ** : la ligne reste identique à l'octet sauf le repas (valeurs enregistrées, correction tracée, aucun historique ajouté, aucune confirmation). Témoins M24–M26, P31/P31b.

## 5. Non réalisé / risques
- **D-031 complète** non lancée (réservée à un arbre final figé, sur GO écrit) ; contrôle négatif du banc de parcours (`mut_nut2_parcours`) non rejoué ; **recette iPhone non faite** ; mode avion réel non testé.
- **Identité par la source** : toute ligne dont la fiche porte la source `off` / `ciqual` / `marque` est verrouillée, quelle que soit sa fiabilité. Le code actuel ne fabrique pas de fiche « déclarée » avec une de ces sources (les fixtures de test qui le faisaient ont été corrigées) ; **aucune donnée réelle n'a été lue** pour vérifier qu'aucune ancienne ligne n'est dans ce cas.
- **Écran d'ajout** : un nom différent est **refusé** (rien n'est écrit) plutôt que remplacé en silence — choix de mise en œuvre, à confirmer à la recette iPhone (le champ du haut sert aussi à chercher).
- **La confirmation est en deux touchers** (1ᵉʳ : demande, 2ᵉ : écrit) et seulement pour une ancienne ligne corrigée dont les chiffres changent.
- Anciens appareils non mis à jour peuvent encore écrire une correction (champ `n2.hc` ignoré chez eux).
- **À la publication** (règle d'or 11) : point rouge, aide « ? », aide détaillée, diapo du Guide, pop-up probablement (les champs et le nom ne se modifient plus ; une confirmation apparaît). **B2 doit être publié avec ce lot ou avant** (c'est sa base). D-141 = GO serveur distinct (poussée de `Code.js` sur master = déploiement automatique).
- `tools/mut_nut_b2.py`, `tools/mut_nut_d141_minimal.py`, `tools/mut_nut_verrou.py` : contrôles négatifs sur copies jetables, rien de résiduel.

## 6. Prochaine opération (après le GO de Michel, dans cet ordre suggéré)
1. Arbitrer l'option pour `n2.hc` (A recommandée). 2. GO D-031 sur arbre figé. 3. GO publication (B2 + verrou, `ft-v1263`) avec aide/guide, puis recette iPhone. 4. D-141 (serveur) et A3 (Sécurité) : lots séparés.

## 7. Garde-fous à conserver
Jamais de fusion/publication/déploiement/version sans GO distinct ; aucune donnée réelle ; Drive : lecture seule (règle d'or 18) ; journal de partage tenu (règle d'or 13) ; R16 : aucune supposition érigée en contrainte.

---

## PARTIE B — VERSION D'AVANT LA FINALISATION (état `712172f4`, avant compaction) — GARDÉE TELLE QUELLE, PÉRIMÉE sur les points signalés en PARTIE A

> **À relire en premier à la reprise, puis ATTENDRE le GO de Michel.** Aucun code, test lourd, fusion ni publication n'est autorisé par ce fichier.
> Il ne remplace ni `CLAUDE.md`, ni `docs/CONTEXTE-ACTUEL.md`, ni le registre/la passation maître Drive (non modifiés).

## 1. Références Git (vérifiées sur GitHub le 29/10/2026)

| Élément | Référence |
|---|---|
| `master` / production | `3d8d49ef` · `ft-v1262` — **inchangés** |
| Sauvegarde | `backup-prod-ft-v1262-avant-b2-b3-2026-10-29` = `3d8d49ef` |
| **B2** (lecture normalisée des masquages) | `claude/nut-b2-lecture-normalisee` = `integration/nut-b2-2026-10-29` = **`b015db75`** — validé en bancs, **non publié** |
| **NUT-VERROU-01** | `claude/nut-verrou-valeurs-01` = **`f0488553`** (base `b015db75`, + journal `4e8707d2`) — **non fusionné, non publié** |
| **D-141 minimal** (serveur, `Code.js`) | `claude/nut-d141-masquages-serveur-minimal-01` = `76639a52` — testé en simulation, **non publié, non déployé** |
| A2/A3 (études) | `claude/nut-d141-correctifs-a2-a3-01` = `7f40cf2b` — **aucun code**, rapports seulement |

## 2. Décisions de Michel (définitives)
- **NUT-VERROU-01** : sur une fiche alimentaire **identifiée**, **toutes les informations du produit sont verrouillées** ; **seule la quantité consommée reste modifiable**. Les calories/macros = fiche × quantité, jamais une correction.
- **A2** (anciennes chaînes) : **option D** — rien ne change sans preuve nouvelle.
- **A3** (écritures concurrentes) : **reporté au chantier Sécurité** (rapports conservés : architecture 3A = verrou de script court sur les 6 écrivains ; prérequis non vérifié : sonde `LockService` dans un projet de test séparé). **Interrupteur de désactivation du verrou : refusé.**
- **D-141** : lot distinct, déploiement serveur sur GO explicite, non publié.
- Ne pas confondre : **NUT-B3 historique** (cible calorique/macros) = fermé, publié en `ft-v1245` ; le « B3 » récent = ce verrouillage des valeurs (`NUT-VERROU-01`).

## 3. Ce que NUT-VERROU-01 a fait (branche seulement)
- **Moteur `nutrition-v2.js`** : prédicat `verrouillee` (`fiab:'source'` = CIQUAL, Open Food Facts, enseigne) ; toute correction refusée (`FICHE_VERROUILLEE`) ; `reprise` ne rend plus les anciennes corrections (`correctionsEcartees`) ; historique additif `n2.hc` (≤ 20) + note `correction-ecartee` lors d'une modification.
- **Écrans `app.js`** : champs en lecture seule ; `_afSaisieValeur`/`_efSaisieValeur`/`_afCorrigerKcal`/`_efCorrigerKcal` neutralisées ; plus de bouton « Mettre X kcal » ; calcul de la fiche montré à l'ouverture de « Modifier » ; un favori ne recopie plus la correction.
- **Tests** : `tests/parcours/nut_verrou.js` + `tools/banc_nut_verrou.js` (**59 OK / 0 rouge**), `tools/mut_nut_verrou.py` (**23/23 tuées**). Bancs voisins verts (`nut2_moteur` 71, `nut2_parcours` 111, `nut_b2` 51, `nut_v2_p1_croise` 16, `nut_m6_rejeu` 29, `foodlog_restore` 35, `nut_secu_p1` 82, `nut_fiabilite` 139 dont 13 « sans objet » liés à D-141 absent, non comptés). `mut_nut2_moteur` 35/35.
- **Témoins anciens adaptés (aucun supprimé)** : banc moteur ⑩ ⑪ ⑫ R② R⑩ rejoués sur fiche *déclarée* + ⑩b ajouté + test « 7 fonctions » ; `nut2_parcours` P6 ② et P13 ③ réécrits pour la nouvelle règle ; fixtures « Galette » (P14, P15) sur fiche déclarée.
- Compteurs règle d'or 17 : données persistées +1 champ additif (`n2.hc`, 0 clé de stockage) · fichiers applicatifs 2 · lignes +82/−8 · anciens chemins supprimés 0.

## 4. Points OUVERTS — non validés, non corrigés (à reprendre après GO)
1. **OFF identifié avec énergie `NON_RESOLU`** : classé « estimé » par le code existant → **encore modifiable**, « Mettre X kcal » proposé (lecture d'étiquette). Figé par le témoin de constat `P17b`. Décision : le laisser éditable, ou le verrouiller aussi (alors plus de correction d'une énergie douteuse). *Conflit avec la règle « aucune exception ».*
2. **Nom du produit identifié** : le champ nom (`ef-name`) reste modifiable ; la règle dit « nom et identité du produit verrouillés ». À trancher/traiter.
3. **Historique `n2.hc`** plafonné à 20 entrées : confirmer que c'est la bonne conservation (ou autre borne).
4. **Modifier uniquement le repas d'une ancienne ligne corrigée** : « Enregistrer » repart de la fiche (la correction passe dans `n2.hc`, la ligne le dit). À vérifier/confirmer que c'est le comportement voulu.

## 5. Non réalisé / risques
- **D-031 complète** non lancée (réservée à un arbre final figé, sur GO écrit) ; contrôle négatif du banc de parcours (`mut_nut2_parcours`) non rejoué ; **recette iPhone non faite** ; mode avion réel non testé.
- Anciens appareils non mis à jour peuvent encore écrire une correction (champ `n2.hc` ignoré chez eux).
- **À la publication** (règle d'or 11) : point rouge, aide « ? », aide détaillée, diapo du Guide, pop-up probablement (les champs ne se modifient plus). **B2 doit être publié avec ce lot ou avant** (c'est sa base). D-141 = GO serveur distinct (poussée de `Code.js` sur master = déploiement automatique).
- `tools/mut_nut_b2.py`, `tools/mut_nut_d141_minimal.py`, `tools/mut_nut_verrou.py` : contrôles négatifs sur copies jetables, rien de résiduel.

## 6. Prochaine opération (après le GO de Michel, dans cet ordre suggéré)
1. Trancher les 4 points ouverts (§4). 2. GO correction éventuelle sur `claude/nut-verrou-valeurs-01`. 3. GO D-031 sur arbre figé. 4. GO publication (B2 + verrou, `ft-v1263`) avec aide/guide, puis recette iPhone. 5. D-141 (serveur) et A3 (Sécurité) : lots séparés.

## 7. Garde-fous à conserver
Jamais de fusion/publication/déploiement/version sans GO distinct ; aucune donnée réelle ; Drive : lecture seule (règle d'or 18) ; journal de partage tenu (règle d'or 13) ; R16 : aucune supposition érigée en contrainte.
