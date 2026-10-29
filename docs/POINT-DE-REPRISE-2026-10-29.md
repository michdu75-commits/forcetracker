# 📍 POINT DE REPRISE — 29/10/2026 (fin de session Claude Principal, avant compaction)

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
