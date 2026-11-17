# 🔧 Outil de restauration (hors dépôt) — le CONTRAT v4 que le serveur exige

> **18/11/2026** — arbitrage de Michel : **P1 à P4 retenus** (« les propositions de code initiales ne le sont pas telles quelles »). Candidat `claude/f2a-prime-v4-2026-11-17` (depuis F2-A′ v3 `0a723a05`). ⛔ Rien ici n'est exécuté sur un vrai compte : le contrat est éprouvé **en local** (banc `B-F2A`, section P, vrai `Code.js` en mémoire).
> Ce document dit ce que `adminRestore` et `adminReadAccount` **exigent et refusent** ; l'outil réel (privé, hors dépôt) s'y conforme. **Contrat v4 ≠ production @195** : l'ancien contrat (v3, 17/11) n'est plus accepté par ce serveur.

## 1. Deux routes admin (POST seulement, `ADMIN_TOKEN` vérifié en premier, jamais dans une adresse)
### `adminReadAccount` — P2 (lecture seule)
Corps : `{action:"adminReadAccount", adminToken, email}`. Réponses :
| Réponse | Sens |
|---|---|
| `{status:"ok", u, h, etat}` | `u_` et `h_` **tels que stockés** (décompressés), séparés comme la sauvegarde ; `etat` = empreinte du **contenu** de `u_` **et** de `h_` (64 hex) |
| `{status:"not_found", etat:"VIDE"}` | **ni** `u_` **ni** `h_` : le compte n'existe pas (ce n'est pas une erreur) |
| `{status:"error", error:"u_illisible"\|"h_illisible"}` | une propriété est **présente mais illisible** (ungzip qui échoue, JSON invalide, ou contenu qui n'est pas un objet) : **jamais** traitée comme une absence (`loadUserData_`, lui, lit ce compte comme absent) |
| `{status:"error", error:"busy", code:"NUT_LOCK_BUSY", retryable:true}` | verrou occupé : rien n'est lu |
| `{status:"error", error:"unauthorized"}` | jeton absent ou faux : aucune donnée |
Prise **sous le même verrou** que tous les écrivains du compte (`saveProfile`, e-mail vérifié, code perso, `pushHealth`, résumé du coach, `adminRestore`) : l'instantané est cohérent. Aucune donnée n'est journalisée côté serveur.

### `adminRestore` — P1 + P3 + P4
| Champ | Obligatoire | Règle |
|---|---|---|
| `adminToken` | oui | vérifié en premier |
| `email` | oui | le compte restauré |
| `sourceEmail` | **oui (P1)** | l'adresse de l'**entrée** de la sauvegarde d'où viennent les données. Doit désigner le compte visé (minuscules, sans espaces) ; **jamais devinée** : absente ou illisible → `identite_source_absente` |
| `data` (avec `data.profile`) | oui | le contenu du fichier pour ce compte. `data.email` et `data.profile.email`, **s'ils existent**, doivent aussi désigner le compte visé (`identite_discordante`, champs nommés) |
| `etatAttendu` | **oui (P3)** | l'`etat` lu par `adminReadAccount` **juste avant** (`"VIDE"` pour un compte absent) |
| `sante` / `sansSante:true` / santé dans `data.profile` | l'une des trois | inchangé depuis le 17/11 (`sante: {}` ou absence de déclaration = refus) |
| `santePerdueConfirmee` | si des champs de santé vivants seraient retirés ou remplacés (P4) | la liste **exacte** (ordre libre) de ces champs |
**Ordre des gardes (toutes AVANT la moindre écriture)** : jeton → `email` → `data.profile` → **P1 identité** → type de `sante` → verrou (`busy`) → **P3** compte illisible (`u_illisible`/`h_illisible`) → `precondition_absente` → `etat_change` → déclaration de santé (`sante_non_precisee`, `sante_vide_ambigue`, `sans_sante_incoherent`) → **P4** → écriture.
Échecs après écriture (inchangés) : `restauration_echouee` (santé rétablie), `status:"partial"` + `manquants` (relecture de **contenu**). La réponse « ok » porte le **nouvel** `etat`.

## 2. P3 — la précondition d'état
- L'état couvre **le contenu de `u_` et de `h_`**, pas `updatedAt` : une santé modifiée sans changement de date, ou une séance ajoutée sans toucher la date, change l'état.
- Vérifiée **sous le verrou**, avant l'écriture : une saisie arrivée entre la lecture et l'écriture (par la vraie route `saveProfile`) fait refuser la restauration (`etat_change`) ; elle est **conservée**.
- **Obligatoire** : sans `etatAttendu` → `precondition_absente`. Un rejeu avec l'ancien état est refusé (la première restauration a changé l'état).
- Écrivains du compte hors verrou : `testGardeFou` seul (route de test, compte `TestGardeFou` créé puis supprimé). Tous les écrivains de production prennent le verrou (vérifié dans le code : `saveProfile`, `verifyConfirmCode`, `setAccessCode`, `pushHealth`, `summarizeCoach`, `adminRestore`).
- ⛔ **Un compte vivant illisible ne se restaure pas** (`u_illisible`/`h_illisible`) : on ne l'écrase pas sans avoir su le lire. **Décision à prendre par Michel** : une voie de secours explicite (hors périmètre de ce lot).

## 3. P4 — la santé du compte vivant, champ par champ (u_ ET h_), avant toute écriture
| Situation vivante | Refus |
|---|---|
| `h_` contient un champ qui n'est pas un champ de santé connu | `sante_h_champ_inconnu` (ambigu) |
| un même champ dans `u_` et `h_` avec des valeurs différentes | `sante_divergente_u_h` (on ne sait pas laquelle est la vraie) |
| `sansSante:true` alors qu'un champ de santé n'existe que dans `u_` (migration jamais faite, ou partielle) | `sante_non_migree` (`u_` va être remplacé, `h_` ne protège pas ce champ) |
| un champ de santé vivant serait **retiré ou remplacé** et n'est pas dans `santePerdueConfirmee` | `sante_supprimee_non_confirmee` (champs nommés) |
| `santePerdueConfirmee` n'est pas une liste | `sante_confirmation_invalide` |
Aucune valeur n'est jamais rendue, seulement des **noms de champs**. `sansSante:true` sur un compte dont la santé est dans `h_` : acceptée, `h_` n'est pas touché (D6) — le compte restauré n'est **pas identique** à la sauvegarde.

## 4. P1 — compatibilité des anciennes sauvegardes et cas historiques à qualifier
- Une ancienne sauvegarde **légitime** (entrée sans `data.email`, adresse d'entrée en majuscules ou avec des espaces) **passe** (témoin `F2A-P1f`).
- ⚠️ **À qualifier sur le corpus RÉEL de sauvegardes (lecture seule, GO distinct)** — ils seraient **refusés** (jamais corrigés) : une entrée dont l'adresse diffère de `data.email` ; une entrée dont `data.profile.email` est une autre adresse (contact) ; un compte renommé. Aucun n'est déduit sans lecture.
- **Limite dite** (témoin `F2A-P1g`) : si `data.email` est absent, le serveur ne peut pas prouver l'origine des données, il croit `sourceEmail` ; le contrôle de l'**entrée** (doublon, discordance) reste à l'outil.

## 5. Vérifications de compatibilité de l'outil réel (à cocher dans la mission d'adaptateur TEST)
1. Il envoie `sourceEmail` (l'adresse **de l'entrée**), `etatAttendu` (lu juste avant) et `santePerdueConfirmee` (ce qu'il a montré à Michel).
2. Il lit l'état par `adminReadAccount` et **s'arrête** sur `u_illisible`, `h_illisible`, `busy` (pas de réessai d'écriture), réponse sans `etat`.
3. Il traite `status !== "ok"` comme un échec (`partial` est un HTTP 200) et ne réessaie **jamais** une écriture ambiguë ; seul `busy` explicite avant écriture peut l'être (borné).
4. Il écrit un **instantané** de ce qu'il a lu **avant** et le relit.
5. Il relit après et compare le **contenu**, `hiddenFoods` compris, avec une fusion indépendante.
6. `ADMIN_TOKEN` n'est jamais dans une adresse, un fichier, un journal.

## 6. Preuves locales
`node tools/banc_f2_seances_union.js` (section `P`) : chaque témoin de refus est **rouge sur le `Code.js` v3** (`0a723a05`) et **vert sur v4** ; `python3 tools/mut_f2_seances_union.py M60,…,M83` : une neutralisation par protection, toutes détectées. **Rien n'a tourné sur un vrai Apps Script.**

---

# 📜 Historique — le contrat v3 du 17/11/2026 (REMPLACÉ par le v4 ci-dessus ; gardé tel quel, R30 : un retrait s'écrit, il ne s'efface pas)

> Pourquoi remplacé : le v3 ne faisait ni lire le compte vivant, ni vérifier l'identité source, ni protéger contre une saisie arrivée entre-temps, ni contrôler la santé vivante champ par champ. Les quatre trous ont été prouvés en local le 17/11 et fermés le 18/11 (P1–P4).

# 🔧 Outil de restauration (hors dépôt) — le CONTRAT que le serveur exige désormais

> **17/11/2026** — mission de fermeture (contre-expertise ciblée). ⛔ **Rien ici n'est exécuté sur un vrai compte, rien n'est lu dans une vraie sauvegarde, l'outil réel n'est ni consulté ni modifié.**
> Ce document dit ce que le **serveur** (`Code.js`, `handleAdminRestore_`, candidat `claude/f2a-prime-v3-2026-11-17`) accepte et refuse ; c'est la liste de vérification pour mettre l'outil réel en conformité **dans une mission distincte, après un GO dédié**.

## 1. Inventaire du chemin d'appel — et le blocage
- Dans le dépôt, `adminRestore` n'apparaît que dans `Code.js` (le serveur), dans les bancs de tests, et dans une ligne d'idée de `IDEES-FUTURES.md` (« outils d'admin / maintenance »). **L'outil qui lit les sauvegardes Drive puis appelle `adminRestore` n'est PAS dans le dépôt** : il vit chez l'administrateur.
- **BLOCAGE** : son code, sa forme exacte d'appel et son mode d'authentification (`ADMIN_TOKEN`) ne sont pas accessibles ici sans compte ni donnée réelle. **Éléments nécessaires** (sans aucune donnée réelle) : le code ou une description de l'outil (le corps JSON qu'il envoie, comment il lit le fichier de sauvegarde, comment il traite la section `sante`), en lecture seule. **Mission distincte à prévoir** : mettre l'outil en conformité avec ce contrat, puis le qualifier en local isolé sur des sauvegardes FICTIVES. **La qualification d'une restauration RÉELLE reste une condition de passage TEST.**

## 2. Le contrat exact (corps de `POST {action:"adminRestore"}`)
| Champ | Obligatoire | Règle |
|---|---|---|
| `adminToken` | oui | vérifié EN PREMIER (inchangé) |
| `email` | oui | le compte restauré |
| `data` | oui, avec `data.profile` | le contenu du fichier de sauvegarde pour ce compte (séances, records, profil…) — **sans** la section `sante` du fichier |
| `sante` | l'une de ces trois déclarations | la section `sante` du fichier pour ce compte : un OBJET **non vide** (au moins un champ de santé connu : `healthProfile`, `bloodTests`, `bodyScans`, `bodyScanImports`, `bodyStudy`, `bodyStudies`, `smoker`, `contraception`, `mensCycleStart`, `mensCycleDur`) |
| `sansSante: true` | (ou) | déclaration **explicite** que la sauvegarde n'a pas de santé ; refusée si une santé est présente (dans `sante` ou dans `data.profile`) |
| santé déjà dans `data.profile` | (ou) | acceptée comme déclaration (ancienne voie : santé fusionnée à la main) |

**Refusés AVANT toute écriture** (réponse `status:"error"`, rien d'écrit) : `sante_non_precisee` (aucune des trois déclarations — même sur un compte vivant qui porte déjà sa santé) · `sante_vide_ambigue` (`sante: {}` : une section vide ne prouve pas une sauvegarde complète) · `sans_sante_incoherent` (`sansSante: true` avec une santé présente) · `sante invalide` (pas un objet) · `data.profile required` · `busy` (verrou occupé, réessayable).
**Échecs après écriture** : `restauration_echouee` (écriture échouée : la santé écrite en premier est RÉTABLIE à son état d'avant, `sante_retablie` le dit) · `status:"partial"` + `restauration_incomplete` + `manquants` (la relecture ne retrouve pas le CONTENU écrit : même nombre d'éléments mais valeurs différentes comprises — noms des champs en écart : `sessions`, `prs`, `profile.<champ>`…). **Jamais « ok » dans ces cas** : l'outil doit lire `status` et s'arrêter.

## 2 bis. Vérifications de compatibilité pour l'outil réel (à cocher dans la mission distincte)
1. Il envoie `sante` (champs lus dans la section `sante` du fichier) **ou** `sansSante: true` pour un fichier dont le compte n'a pas de section `sante` — jamais ni l'un ni l'autre.
2. Il ne fabrique pas `sante: {}` pour « avoir quelque chose à envoyer ».
3. Il traite `status !== "ok"` comme un ÉCHEC et affiche `error`, `manquants`, `sante_retablie` ; aucun réessai aveugle.
4. Il ne passe **aucun** champ que le serveur interdit ou ignore (le serveur ne retient de `sante` que les champs de santé connus).
5. Il ne restaure pas deux fois le même compte en parallèle (le serveur sérialise par verrou, mais une relecture `partial` d'un 2ᵉ appel concurrent serait ambiguë).
6. Il garde la garantie existante : `ADMIN_TOKEN` jamais dans un fichier ni un journal.

## 3. Recette locale FICTIVE (déjà jouée, `tests/parcours/f2_seances_union.js`, sections S)
Serveur de test en mémoire (Drive et propriétés simulés), comptes inventés `@example.test` : `node tools/banc_f2_seances_union.js` (sections S04–S16e : restauration par les deux voies, piège fermé, `sante: {}`, `sansSante` cohérent/incohérent, échec partiel, relecture de contenu). **Cette recette prouve le comportement du serveur, pas celui de l'outil réel.**

## 4. Hors périmètre, dit une fois
Écarts « 10→12 lignes » et « 13/14 comptes » : causes **non établies** (il faut lire les vraies sauvegardes) ; diagnostic en lecture seule prêt (`tools/diag_sauvegardes.py`, jamais lancé sur du réel). ARCH-06 (écriture `u_` / `h_`) : lot distinct. F2-B et les six autres collections : hors périmètre.
