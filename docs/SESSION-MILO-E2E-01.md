# 🔬 SESSION-MILO-E2E-01 — audit forensique du parcours réel du 03/10/2026

> **Version canonique COMPACTE dans le dépôt** (créée le 03/10/2026 par DOC-SYNC-03OCT). Le rapport forensique
> complet reste sur Drive : *« FORCE TRACKER — SESSION-MILO-E2E-01 — AUDIT FORENSIQUE PARCOURS RÉEL 03-10-2026 »*
> (Google Doc `1r87XP42eUeojvi-UDTt3Na1pNSqecZZl6rv9yXCSWRk`) + son PDF.
> ⛔ **DIAGNOSTIC SEULEMENT — AUCUNE CORRECTION n'existe.** Tout ce qui suit décrit **master `ad172a87` (`ft-v1249`)**.

**Vocabulaire des niveaux de preuve** (à ne jamais mélanger) : **CAUSE DÉMONTRÉE** (code + reproduction) ·
**REPRODUIT** · **MÉCANISME CAPABLE** (le code *peut* le produire, le cas terrain n'est pas prouvé) ·
**NON DÉMONTRÉ** · **DÉCISION MICHEL VALIDÉE** (non implémentée) · **DIRECTION FUTURE** · **DETTE CONNUE**.

## 1. Base

- `origin/master` = `ad172a87a6296d57f055c55ffe243f18aff32d2b`, `sw.js` = `ft-v1249` — inchangé pendant l'audit.
- Diagnostic sur une **copie de master hors Git** (`git archive`), servie à Chromium. Branche NUT-PUNCH-01
  (non publiée) **non utilisée** : elle ne touche ni au remplacement, ni au débrief, ni aux discussions.
- **0 modification du dépôt, 0 commit, 0 publication, 0 passe D-031, 0 appel Milo / IA réel** : toutes les
  réponses de Milo des reproductions sont **simulées** par interception réseau.

## 2. Sources

Drive (lecture seule) : JOURNAL DE SUIVI (entrée « 03/10/2026 — RETOUR TERRAIN COMPLET — SÉANCE / REMPLACEMENT /
DÉBRIEF MILO »), HISTORIQUE CONSOLIDÉ DES DISCUSSIONS, CARTOGRAPHIE GLOBALE, CONTEXTE MOYEN TERME. Dépôt : `log.js`,
`coach.js`, `app.js`, `setup.js`, `screens.js`, `worker.js`, `constants.js`, `docs/JOURNAL-ARCHIVE.md`, témoins
existants. **Aucune contradiction Drive ↔ dépôt.**

## 3. Parcours terrain (Michel, 03/10, résumé)

Séance proposée par Milo → remplacement de la presse par **Rowing Hammer Strength** puis **Shoulder Press** : nom et
« précédent » corrects, mais séries actuelles **2×200 / 10×240 ×3** héritées, repos différent → fin de séance,
débrief en échec (~20:01) puis « Réessayer » réussi (~20:02) → débrief **introuvable** dans le Coach (~20:06) et
dans Progrès (~20:07) → « record personnel » annoncé sur une **première** occurrence (Rowing Yates 40×10) →
montée en charge 65 → 80 jugée dangereuse avec une formulation quasi médicale → une **nouvelle discussion**
semble créée → carte « Cette séance te convient ? » avant toute séance structurée → panneau maintenance
« INJOIGNABLE (HTTP 404) » pendant que Milo répond.

## 4. Cartographie des données (l'essentiel)

| Étape | Objet | Identifiant | Propriétaire / stockage |
|---|---|---|---|
| séance proposée / en cours | `S.wkt.exs[].sets[]` | aucun par exercice ni par série | `_appliqueMiloSession` → `ft4_wkt` |
| remplacement | `S.wkt.exs[i]` | index | `_replaceExInWorkout` (log.js:3350) |
| séance terminée | `S.sessions[]` | `id` (= `ts`) | `finishWorkout` → `ft4_sessions` + cloud |
| débrief | **message** du fil Coach courant | **aucun** | `_dbfPoserDansHistorique` (coach.js:6189) → `ft4_coach_hist` (local) |
| file des débriefs | jeton | id de séance, **détruit à la livraison** | `ft4_pending_debrief` |
| discussions rangées | conversation | `c<ts>` (fil courant : aucun) | `ft4_coach_convs` (local) |
| Progrès / exports | séance | `id` | **aucun lien** vers un débrief |

⭐ **Il n'y a qu'UN objet pour le prévu et le réalisé** : la prescription est écrite *dans* les séries, la saisie
l'écrase en place. Aucun identifiant d'exercice ni de série ; aucun lien `sessionId ↔ débrief`.

## 5. Causes DÉMONTRÉES (code + reproduction)

| | Constat | Où |
|---|---|---|
| **A** | Le remplacement **ne change que le nom** : séries (kg, reps, type, note, `rest`, `done`), `_milo`, note et groupe restent ; « précédent » (`getPrev`, par nom, log.js:1474) et repos (`set.rest` > `S.exRestPref[nom]` > `reposDefaut()`) suivent le **nouveau** nom ⇒ objet **hybride**. Reproduit : Presse 200/240/240/240 → Rowing Hammer → **mêmes séries** → Shoulder Press → **mêmes séries** ; repos 90 s → 130 s. | `_replaceExInWorkout` |
| **A-bis** | **Validé sans corriger** : la séance enregistre Shoulder Press 200×2, 240×10 ×3 ⇒ **record 240 kg (1RM 320)**, volume 7 200 kg ⇒ séance, volume, records, historique, Progrès, « précédent » suivant et contexte de Milo **contaminés**. Les séries déjà faites avant un remplacement changent aussi d'exercice. | idem + `finishWorkout` |
| **B** | Les charges **réellement saisies** partent au débrief (90×5, aucun 240) : c'est le seul point sain du parcours — parce qu'il n'existe qu'un seul objet. Mais `_milo` reste posé ⇒ le contexte peut attribuer la montée à « ta propre prescription ». | `finishWorkout`, contexte |
| **C-bis** | Un échec amont (surcharge, quota, réponse vide) devient côté Worker **HTTP 200 `{reply:'Désolé, réessaie.', complete:false}`** (worker.js:800). `_runSeDebrief` (log.js:4711) ne lit que `reply` ⇒ **affiché comme un débrief**, rangé dans le fil, séance marquée débriefée (**jeton détruit, plus de « Réessayer »**), `summarizeCoach` déclenché. | `_runSeDebrief`, `worker.js` |
| **D** | Un débrief **réussi** est écrit dans `coachHistory` **sans bulle à l'écran** ; l'ouverture du Coach ne redessine le fil **que s'il est vide** (coach.js:2845). Fil déjà affiché ⇒ débrief **absent de l'écran, présent dans le stockage**, visible après rechargement (reproduction locale). **Aucun lien canonique `sessionId ↔ texte du débrief`** ; rien dans Progrès. | `_dbfPoserDansHistorique`, `updateCoachHeader` |
| **E** | **Première occurrence = record** : `if(!old\|\|rm>old.rm1)` (log.js:4413) ; le contexte de Milo ne connaît pas la notion de « première référence ». | `finishWorkout` |
| **I** | `summarizeCoach` part après **chaque** réponse réussie de Milo dès que le fil compte **≥ 4 messages**, et après **chaque** débrief réussi (y compris le faux « Désolé »). Explique le delta d'appels observé. **Utilité / gaspillage : NON MESURÉ.** | `_saveCoachMemory` (coach.js), log.js |

## 6. Mécanismes CAPABLES (le cas terrain exact n'est pas prouvé)

- **F — montée en charge** : `_monteeDefauts` (log.js:2158) applique des seuils **fixes** (départ > 62 % ; saut
  > 18 % **et** > 15 kg ; > 2 reps au-delà de 85 %) sans expérience, RIR, %1RM ni type de séance ; le prompt impose
  un langage de risque affirmatif (« c'est là qu'on se blesse ») et décrit une règle « dernier palier 5-10 % sous la
  charge » que **le code ne calcule pas**. ⚠️ Le cas exact 65 → 80 terrain : **NON DÉMONTRÉ** (séries réelles inconnues ;
  en reproduction, 65 → 80 = exactement 15 kg, donc pas signalé comme saut).
- **H′ — ancien J1** : les **3 derniers programmes** partent dans le contexte sans statut actif / terminé, et la
  consigne demande de proposer « le jour qui vient, en le NOMMANT ». ⚠️ **Pas la cause certaine** du J1 terrain.
- **C — échec réel de 20:01** : aucun délai maximum côté client ni Worker (pas d'`AbortController`), 2 essais seulement
  sur exception réseau ; HTTP ≠ 2xx, 5xx plateforme ou coupure mobile sont capables. ⚠️ Aucun lien démontré avec
  l'ancien délai de 12 s.
- **Fragilités du fil** : fil **local seulement** (ni cloud, ni restauration), borné à 150 000 caractères ; discussions
  bornées (30, 500 000 car.) ; supprimer une discussion supprime ses débriefs ; `continueInCoach` **remplace** le fil
  sans le ranger.

## 7. Causes NON DÉMONTRÉES — ⛔ ne pas les écrire comme des faits

- cause de l'**échec réel** du débrief à 20:01 ;
- cause de la **nouvelle discussion** (non reproduite : aucune étape du parcours ne crée de discussion ; seuls « + »,
  la réouverture d'une discussion et `continueInCoach` touchent au fil) ;
- cause exacte de l'**ancien J1** ;
- **cas exact** de la montée en charge terrain ;
- que le débrief de Michel réapparaisse après rechargement **sur son téléphone** (vérifié en local seulement) ;
- « le corps est reposé » : interprétation de Milo, rien dans le code ne la produit.

## 8. Reproductions (11 scénarios : 9 reproduits entièrement, 2 partiellement)

| | Scénario | Résultat |
|---|---|---|
| R1 | remplacement → nouvel historique + anciennes séries | REPRODUIT |
| R2 | 2 remplacements → mêmes 200/240/240/240 | REPRODUIT |
| R3 | repos différent | REPRODUIT (90 s → 130 s) |
| R4 | charges corrigées → vraies charges au débrief | REPRODUIT |
| R5 | débrief → navigation → rechargement | REPRODUIT (variante fil déjà affiché) |
| R6 | échec puis retry ; variante HTTP 200 « Désolé » | REPRODUIT |
| R7 | 1ʳᵉ occurrence → record | REPRODUIT (données ; phrase de Milo non reproductible) |
| R8 | 65 → 80 → alerte | **PARTIEL** (règle du code ; cas réel inconnu) |
| R9 | « petite séance » → carte | REPRODUIT (détecteur) |
| R10 | discussions à chaque étape | **PARTIEL** : aucune création ⇒ symptôme terrain non reproduit |
| + | validation sans correction après remplacement | REPRODUIT (P0) |

**Observé dans le code, non scénarisé** : *intention → prescription* — « petite séance / reprise » reste du **texte
libre** ; aucune contrainte structurée sur le volume, la durée, le RIR ou le nombre de séries (les contrôles existants,
`_avertissementsSeance`, portent sur l'intensité vs 1RM, les exercices écartés, les zones protégées, les doublons).

## 9. Risques

- **P0** — A / A-bis : remplacement hybride ⇒ prescription aberrante, et donnée aberrante enregistrée si validée.
- **P1** — C-bis : faux débrief « Désolé, réessaie. » accepté (`complete:false` ignoré, retry détruit) · D : débrief
  enregistré mais invisible sans recharger, et non lié à la séance.
- **P2** — E : première occurrence = record · F : montée en charge rigide + phrase de risque imposée · H : carte
  « Cette séance te convient ? » avant toute séance structurée — **comportement CONÇU (ft-v1053), pas une régression
  FP-01** : « aujourd'hui j'ai envie de faire une petite séance de sport, histoire de me remettre dedans » est lue
  comme une demande, et la carte s'affiche même si Milo n'a produit qu'une question · H′ : programme ancien envoyé
  sans statut · 14 : intention « petite séance » non structurée.
- **P3** — I : `summarizeCoach` systématique (à mesurer) · J : export (le débrief n'existe que dans l'export « avec mes
  discussions », mêlé au chat, sans lien ; CSV/PDF d'historique : jamais) · K : panneau maintenance.
- **Chantier séparé — panneau maintenance** : `_healthServeur` (app.js) sonde Apps Script `?test=1` ; **toute** erreur,
  y compris un HTTP 404 **reçu**, s'affiche « INJOIGNABLE ». Milo passe par le **Worker** : un autre chemin.

## 10. Décisions de Michel déjà validées (NON implémentées) — registre : `docs/DECISIONS.md` D-043 → D-045 (D-036 → D-042 pris par les branches Food Semantics non publiées)

- Chaque séance ayant un débrief peut ouvrir **son** débrief : action « **Voir le débrief Milo** », principe
  `sessionId ↔ débrief`.
- Export de l'historique : choix explicite **sans / avec débriefs Milo**.
- Première occurrence = « **Première référence enregistrée** » ; « Nouveau record personnel » seulement s'il existe une
  référence antérieure comparable.

⛔ **NON tranché (aucune décision à inventer)** : seuils de montée en charge · architecture de stockage du débrief ·
délai maximum des appels · fréquence de `summarizeCoach` · politique de « programme actif » · seuils de « petite
séance » · comportement du remplacement (changer d'exercice vs corriger le nom — ft-v296 et un témoin figent
aujourd'hui « garder les séries »).

## 11. Lots de correction proposés (aucun n'est ouvert)

1. **DÉBRIEF-PERSISTANCE** — ① `complete:false` ou texte de repli = échec (jeton rendu, pas de `summarizeCoach`) ;
   ② débrief réussi affiché sans rechargement ; ③ stockage par séance + « Voir le débrief Milo » + export avec/sans.
   ①② = bugs factuels ; ③ = conception à valider.
2. **REMPLACEMENT** — distinguer « corriger le nom » et « changer d'exercice ». **Décision Michel requise.**
3. **VÉRITÉ MÉTIER DANS LE PAYLOAD MILO** — première référence vs record ; montée en charge alignée sur ce que le
   code calcule, sans phrase de risque imposée.
4. **CONVERSATION / CTA** — carte sous une question, statut des programmes, cycle de vie des discussions, journal
   minimal des statuts d'appel du débrief.
5. **COÛT** — mesurer `summarizeCoach` avant tout changement.
6. **Séparé** — panneau maintenance.

Ordre recommandé par l'audit : 1①② → 2 (après décision) → 1③ → 3 → 4 → 5.

## 12. Limites

Aucun appel réel (la formulation exacte de Milo n'est pas reproductible) · données réelles de Michel non accessibles
(séries exactes, fil réel, statut HTTP de 20:01) · Chromium, pas Safari iOS · clone Git partiel (depuis le 25/09).

## 13. Checkpoint autonome

```
SESSION-MILO-E2E-01 — 03/10/2026 — DIAGNOSTIC TERMINÉ, AUCUNE CORRECTION
BASE : origin/master ad172a87 (ft-v1249) · 0 commit pendant l'audit · 0 appel IA réel
DÉMONTRÉ : A remplacement = renommage seul · A-bis 240×10 + record 240 kg si validé ·
  B un seul objet prévu/réalisé · C-bis HTTP 200 « Désolé » (complete:false) pris pour un débrief ·
  D débrief rangé mais non redessiné, aucun lien séance ↔ débrief · E 1ʳᵉ occurrence = record ·
  I summarizeCoach après chaque réponse (fil ≥ 4) et chaque débrief
CAPABLE : F montée en charge à seuils fixes · H′ programmes sans statut · C absence de délai max
NON DÉMONTRÉ : échec de 20:01 · nouvelle discussion · ancien J1 · cas exact 65→80
RISQUES : P0 remplacement · P1 faux débrief, débrief invisible/non lié · P2 PR, montée, CTA, J1, intention
DÉCISIONS VALIDÉES : Voir le débrief Milo · export avec/sans · Première référence ≠ record
STATUT : PRÊT POUR CORRECTIONS APRÈS DÉCISIONS MICHEL
```

## 14. Suite — SESSION-INTEGRITY-01 (04/10/2026, branche `claude/session-integrity-01`, NON publiée)

| Constat de l'audit | État après SESSION-INTEGRITY-01 |
|---|---|
| A / A-bis remplacement hybride (P0) | **corrigé sur la branche** — Michel a tranché le 04/10 : « Remplacer » change d'EXERCICE ; séries faites gardées à l'exercice réel (**D-046**, ratifiée après contre-vérification) |
| B un seul objet prévu / réalisé | **inchangé** (dette structurelle, hors lot) |
| C-bis faux débrief `complete:false` (P1) | **corrigé sur la branche** (3 chemins) |
| D débrief invisible / sans lien (P1) | **corrigé sur la branche** (rendu immédiat, `ft4_debriefs`, « Voir le débrief Milo », export avec / sans) ; finition : aucun plafond, supprimé avec sa séance (**D-047**), PDF fidèle |
| E première occurrence = record | **corrigé sur la branche** (D-045) |
| F montée en charge · H carte · H′ ancien J1 · 14 intention · I summarizeCoach · G discussion · K maintenance | **non traités** |
| N-G2 (MILO-GHOST-01) séance jugée contre son propre record | **corrigé sur la branche** |
| N-G1 (MILO-GHOST-01) message courant envoyé deux fois | **non traité** — dette MILO / TRANSPORT / PAYLOAD |

Détail, preuves et limites : `docs/SESSION-INTEGRITY-01.md`. ⛔ Rien de cela n'est en production avant publication.
