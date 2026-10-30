# NUT-REF-HIST-02 — Rapport GO TESTS (audit architectural et fiabilité) — 30/10/2026

**Branche** `claude/nut-ref-hist-02` · **SHA initial** `f54cfe6f` (base master `e2b942f3`) · **SHA final code + tests** `18b0cfa9` (le commit de ce rapport vient après).
**Conclusion : 🟠 ORANGE.** Aucune perte silencieuse, aucun doublon dans le parcours normal ; une limite de doublon mesurée (A1-R7, très improbable) et deux limites déclarées (compteurs de la douane, D-031 complète non jouée).

## 1. Tests exécutés (conteneur, données fictives, aucune panne injectée sur du stockage réel)

| Banc | Résultat |
|---|---|
| `nut_ref_hist02` (N + A1-T + A1-R + A2-T + A2-I + S + F10) | **66 ✅ / 0 ❌** |
| `nut_recette_mobile` (R6a/b/c) | 20 ✅ / 0 ❌ |
| `nut_m6_rejeu` | 29 ✅ / 0 ❌ |
| `nut2_parcours` | 111 ✅ / 0 ❌ |
| `nut_fiabilite` · `nut_ref_hist` · `nut_verrou` · `nut_v2_p1_croise` · `nut_b2` · `nut2_moteur` · `nut_punch01` · `nut_secu_p1` | 140 · 50 · 90 · 16 · 51 · 71 · 36 · 82, tous 0 ❌ |
| `identite_ligne` (statique) | 32 ✅ / 0 ❌ |
| Blocs `runner.js` qui appellent `rejouerRepas` (24 blocs) | 1034 ✅ / 0 ❌ |

Pas de D-031 complète (non autorisée). Navigateur : Chromium de l'environnement (pas un iPhone).

## 2. Mutations
- `mut_nut_ref_hist02` : **30/30 tuées** (M01–M21 + 9 ajoutées : M22–M30 sur `_habDurable`, le message de panne, le stockage vide).
- `mut_nut_m6_rejeu` : **22/22 tuées** (après refonte de 8 ancres devenues périmées par ce lot ; N12 et N16 l'étaient déjà sur master).
- Survivantes au 1ᵉʳ jet, toutes corrigées côté **témoin**, jamais en affaiblissant : M03 (nouveau N11b), M09 (nouveau N17), M07 (faute d'espace dans mon script), N2 (le chemin muté n'était plus atteint par le rejeu → mutation re-ancrée), N18 (le témoin C② ne regardait que la garde du groupe → renforcé sur les DEUX chemins d'écriture de `_n2Reajouter`).

## 3. Redémarrage après panne de stockage (A1)
Reproduit (A1-R1…R7) : repas à plusieurs aliments rejoué, `localStorage` en panne, lignes présentes à l'écran seulement, rechargement.
- **Les lignes non enregistrées sont perdues au redémarrage** — mais **annoncé** : le message dit « PAS confirmé… si tu fermes l'application maintenant, il sera perdu ». Jamais silencieux, jamais de demi-repas (R3 : deux repas en attente → perdus ensemble ; R5 : panne partielle → le repas durable survit en un exemplaire).
- Stockage resté **exactement** celui d'avant (aucune corruption).
- Le message ne parle jamais de synchronisation.

## 4. Intégrité des lignes relues (A2)
`_habDurable` ne vérifiait que la présence des identifiants. Il compare maintenant, ligne par ligne, jour · moment · nom · quantité · unité · kcal · P · G · L · identité de produit · pour-100 g. Refusés (NON confirmé) : calories ou macros modifiées, quantité/unité différente, jour ou moment faux, identité en double, une seule ligne d'un repas de plusieurs, ancienne version, JSON invalide / clé absente / liste vide / lecture qui lève. Ignorés (volatils) : ordre, `ts`, métadonnées du moteur. De bout en bout (A2-I11) : +1 kcal altéré → jamais annoncé « confirmé ».

## 5. Risques de perte / de doublon
- **Perte** : possible uniquement stockage en panne **et** fermeture avant retentative — annoncée (§3).
- **Doublon, parcours normal** : aucun. Retentative = on retente la sauvegarde des lignes existantes, on ne ré-insère pas (A1-T04, R2, R4, R6). Un nouveau geste légitime après confirmation n'est jamais bloqué (A1-T04d).
- **Doublon, cas limite A1-R7 (mesuré)** : la relecture échoue alors que l'écriture a **réussi** (fausse alerte « PAS confirmé »). Après redémarrage la table d'attente (en mémoire) n'existe plus : si la personne suit le message et retouche le repas, **un doublon** est créé. Gravité faible (une ligne visible, supprimable) ; probabilité très basse (il faut une écriture réussie *et* une relecture en échec).

## 6. Garanties effectivement démontrées
Validation de tout le groupe avant le moindre effet (N10/N10b/N11b) · insertion unique (`S.foodLog.push(...)` une fois, M02) · aucun retour arrière nécessaire · exception après insertion jamais présentée comme « rien ajouté » (A1-T01c, T03) · anti double-appui · panneau retrouvé par `hab-m-<rang>` vérifié, sans sélecteur `onclick` ni `window.event` (M08/M13) · écrivain unique conservé (C①/C②, identite_ligne) · provenance inchangée.

## 7. Limites architecturales restantes
- **Table d'attente en mémoire seulement** (§5, A1-R7). Un marqueur persisté échouerait dans la même panne que ce qu'il protège.
- **A2 — douane** : `_douaneLigne` écrit son carnet (`ft4_douane_obs`) **avant** l'insertion ; si l'insertion ou la sauvegarde échoue ensuite, les compteurs ont avancé (observation seulement, aucun effet sur l'utilisateur ni le journal). **Non corrigé** : le déplacer demande un arbitrage.
- **`persist()` n'est pas atomique entre clés** (préexistant) : il écrit ~110 clés une à une et s'arrête à la première panne ; la relecture ne couvre que `ft4_foodlog`.
- **Synchro distante** : différée, jamais confirmée ici, jamais annoncée comme faite.

## 8. Corrections faites (dans le périmètre, justifiées)
- `app.js` (`3efd76fd`) : `_habDurable` fidélité de contenu + `_habCourantes` ; message de panne explicite ; adaptations de `_habPurger` / `_habReessayer` / `_habApresInsertion`.
- Témoins erronés corrigés : fixture (habitudes fusionnées, plafond de 3 habitudes), faute injectée sur `NUT2` (gelé), `nut_recette_mobile` (un changement d'écran faisait perdre le bouton « + » → R9a/R9b rouges, **erreur de témoin**, prouvé en croisant ancien/nouveau test avec le nouveau code), `nut_m6_rejeu` + `nut2_parcours` (anciens témoins du contrat partiel, adaptés en prenant le choix du panneau — la garantie testée est la même), bloc runner CLXII (horloge du banc figée → fenêtre anti-double-appui à refermer).
- Aucun fichier hors périmètre touché (`log.js`, `nutrition-v2.js`, `Code.js`, `sw.js` intacts).

## 9. Recommandation argumentée
**Intégrer en l'état est défendable** : le contrat « tout ou rien » est démontré, l'échec de stockage est annoncé et non silencieux, et le seul doublon possible est un cas rarissime et bénin. **Option à arbitrer, pas faite** : fermer A1-R7 en détectant, à la retentative, une ligne identique (jour · moment · nom · quantité) déjà présente au journal *d'un geste de reprise* — avantage : couvre le redémarrage ; coût : peut bloquer un deuxième vrai repas identique le même jour (arbitrage produit). Alternative : ne rien faire et garder la limite écrite. Pour la douane : déplacer le comptage après l'insertion obligerait à toucher au contrat « la douane ne bloque jamais » — à n'envisager qu'avec décision de Michel.

## 10. Risques résiduels avant intégration
D-031 complète (classique obligatoire, R1/R4) à jouer sur l'arbre fusionné · recette iPhone non faite (Chromium seulement) · A1-R7 · compteurs douane · le numéro de version `ft-vNN` n'est pas posé (règle : au push final).

## 11. État Git
Branche poussée, **aucun merge, aucun rebase, aucun déploiement** ; master = `e2b942f3`, inchangé. STOP : aucun GO INTÉGRATION ni DÉPLOIEMENT.
