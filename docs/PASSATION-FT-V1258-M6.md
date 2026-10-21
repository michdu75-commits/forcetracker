# 🤝 PASSATION À CLAUDE PRINCIPAL — publication `ft-v1258` (NUT-M6-REJEU-01 seul)

> **21/10/2026, 12:52 UTC — écrite par session-A (Claude Nutrition). RIEN N'EST PUBLIÉ.** origin/master = `bdfc6d27`,
> inchangé. Aucune fusion, aucun push sur master, aucun déploiement, aucune donnée réelle touchée.
> ⏸️ **En attente de l'instruction de transfert de Michel** : ce document ne vaut pas feu vert de publication.
>
> ↪️ **21/10/2026, 14:12 UTC — passation reprise et close par Claude Principal (session-B)**, sur feu vert conditionnel de Michel : contrôles restants conformes (§4), `ft-v1258` publiée (master `da523380`, Pages run n°1358 réussi). Détail : `docs/SUIVI-AUDIT.md` et `docs/JOURNAL-DE-PARTAGE.md`. *Le reste de ce document est gardé tel qu'écrit au moment de la passation.*

## 0. Pourquoi cette passation

Le prompt de Michel du 21/10 « **AUTORISATION DE PUBLICATION — NUT-M6-REJEU-01, version cible ft-v1258** » était destiné
à **Claude Principal** ; il a été envoyé par erreur à Claude Nutrition. Nutrition a commencé les étapes d'avant publication
(contrôles, requalification, préparation du commit de version), puis s'est arrêtée sur la correction de Michel :
*« Arrête-toi AVANT toute fusion dans master, tout push de publication ou tout déploiement. »*

## 1. Où est quoi

| | |
|---|---|
| origin/master | `bdfc6d27` (`ft-v1257` + documentation) — **inchangé** (vérifié sur le serveur à 12:20 et 12:52 UTC) |
| Candidat qualifié | **`claude/nut-m6-rejeu-01`** — code qualifié **`35bd9b11`** (arbre `6f7378e1`), passe complète D-031 **7 823 ✅ / 0 ❌**, 4 conditions (09:05 → 10:49 UTC) ; depuis : documentation seulement |
| Correctif | **`a9c69c39`** — `app.js` seul (seul fichier applicatif du lot) |
| Préparation `ft-v1258` | **`claude/nut-m6-prep-ft-v1258`** = tête du candidat (ce commit de passation) **+ 1 commit « BROUILLON NON PUBLIÉ »** |
| Tag | `avant-ft-v1258` → `bdfc6d27` (**local** à la session Nutrition, non poussé) |
| Passation du lot | `docs/NUT-M6-REJEU-01.md` · décisions **D-094**, **D-095** · `BUGS.md` §90 |

**Commits du candidat depuis master**, dans l'ordre : `dd83c61b` journal (ouverture) · `e3c88a10` banc AVANT (reproduit M6
sur `ft-v1257`) · **`a9c69c39` correctif** · `47c1fa89` banc branché dans la passe, registre, 16 mutations · `2f87c948`
D-094 / D-095, BUGS §90, passation · `9b192899` doc · `e60050be` témoin voisin ⑮ suit l'invariant · `28749c21` doc ·
`13f9c78f` doc · **`35bd9b11` arbre figé pour la passe** · `dbf24cfe` doc (passe valide) · `36ff06a4` journal (ligne de
publication 🟡, désormais ⏸️) · puis ce commit de passation.

## 2. Fichiers

- **Candidat ↔ master** : `app.js` · `tests/parcours/nut_m6_rejeu.js`, `tools/banc_nut_m6_rejeu.js`, `tools/mut_nut_m6_rejeu.py`
  (nouveaux) · `tests/parcours/runner.js` · `tests/recette/registre.json` · `tests/parcours/ia_ref100.js` · `tools/mut_ia_ref100.py`
  · `BUGS.md` · `CLAUDE.md` · `docs/CONTEXTE-ACTUEL.md` · `docs/DECISIONS.md` · `docs/JOURNAL-DE-PARTAGE.md` ·
  `docs/NUT-M6-REJEU-01.md` · `docs/SUIVI-AUDIT.md` · ce fichier. **Aucun** fichier serveur (`Code.js`, `appsscript.json`,
  `.claspignore`, `worker.js`, `wrangler.toml`, `.github/`), ni `state.js` ; aucune clé de stockage nouvelle.
- **Préparation ↔ candidat** (étaient des modifications NON COMMITÉES dans la session Nutrition ; conservées sur la branche de
  préparation) : `sw.js` (clé `ft-v1258` ; la description de `ft-v1257` gardée en commentaire) · `CLAUDE.md` (entête
  `ft-v1258` / `ft-v1259`, entrée `ft-v1258`, entrée `ft-v1250` déménagée, phrase du 21/10) · `docs/JOURNAL-ARCHIVE.md`
  (entrée `ft-v1250` **ajoutée à la fin**, 0 ligne retirée) · `docs/CONTEXTE-ACTUEL.md` (version, puce M6, « Prochaine étape »,
  ancienne clé de retour arrière `ft-v1258` de `ft-v1257` désormais prise) · `docs/INVENTAIRE.md` (ligne de version seule) ·
  `docs/NUT-M6-REJEU-01.md` (§6 intégration, §7 retour arrière).
- **Fichiers servis par l'app** : préparation ↔ code qualifié `35bd9b11` → **`sw.js` seul** ; préparation ↔ `ft-v1257` →
  `app.js` + `sw.js`. `tests/` et `tools/` : identiques au code qualifié.

## 3. ✅ Déjà exécuté (session Nutrition, 21/10, 12:20 → 12:52 UTC)

1. **Contrôles avant fusion, tous conformes** : master `bdfc6d27` inchangé ; aucun run GitHub Actions en cours (dernier :
   Pages n°1357 sur `ab463fb1`) ; aucune ligne 🟡 ouverte sur master ; seule demande de fusion ouverte : n°204 (27/09, sans
   rapport) ; depuis la passe, 4 fichiers `docs/` seulement ; fichiers intégrés listés (§2) ; aucune donnée personnelle
   (données de test « (test) », aucune adresse) — ⚠️ **D-095** reprend les décisions de Michel sur SON historique (dose
   d'Iso Zero, favoris poulet / huile / steak) : pas une ligne d'export, déjà publique sur la branche depuis le 21/10 08:36.
2. **Workflows vérifiés** : sur un push vers master, seul **Pages** se déclenche (Apps Script : `Code.js`, `appsscript.json`,
   `.claspignore` ; Worker : `worker.js`, `wrangler.toml`, son workflow — aucun ne change ; banc Milo : manuel seulement).
   Aucun workflow sur une autre branche.
3. **Ligne du journal de partage** 🟡 poussée (`36ff06a4`) — passée ⏸️ par ce commit.
4. **Préparation `ft-v1258`** (fichiers au §2), puis corrigée de ce qui n'a PAS été fait (retour arrière non rejoué, annexe
   non relancée) avant d'être conservée sur la branche de préparation. La version brute est gardée localement (hors dépôt).
5. **Requalification ciblée sur l'arbre préparé** (code qualifié + clé de cache), sous garde réseau, l'un après l'autre :

   | Contrôle | Résultat |
   |---|---|
   | banc M6 `banc_nut_m6_rejeu` | **32 / 0** (70 s) |
   | voisins `journal_qty_guard` · `repas_actif` · `pots_nutrition` · `ia_ref100` | **21 / 0 · 24 / 0 · 48 / 0 · 36 / 0** |
   | garde réseau `banc_garde_reseau` | **38 / 0** (16 canaris bloqués ; 0 tentative de sortie dans les 5 bancs Nutrition) |
   | contrôle négatif `mut_nut_m6_rejeu.py` | **16 / 16 conformes** (arbre sain 32 / 0 ; contre-épreuve MC1 32 / 0) |
   | `check_regles.py` | code 0 · 15 ✅ · 0 ❌ · 1 ⚠️ connu (`docs/PROMPT-MILO-REEL.txt` périmé depuis `ft-v1257`, sans lien) ; entête `ft-v1258` / `ft-v1259` cohérente ; journal 8 entrées ; archive 0 perdue |
   | `recette_selecteur.py --auto-test` · `git diff --check` | **15 / 0** · propre |

## 4. ❌ PAS exécuté

- **Annexe de recette** sur l'arbre préparé : complète (T2) et `pwa-offline` (T1) — **exigée par le sélecteur**, car `sw.js`
  change. (Dernière annexe : 21/10 au matin, code M6 avec `ft-v1257` : 14 PASS + 1 défaut connu identique à master.)
- **Répétition à blanc du retour arrière** (§6) et **contrôle de fumée de l'arbre exact** (service worker, « À propos »,
  6 écrans, 0 erreur JavaScript) : scripts écrits dans la session Nutrition, **jamais lancés**.
- `git push --dry-run`, **push sur master**, **déploiement Pages**, contrôles d'après, documents d'après, PDF de publication.
- Rien sur Apps Script, le Worker, les données réelles, le profil de Michel (jamais prévu).

## 5. Ce qui reste à faire par la session qui publiera (seulement sur instruction de Michel)

1. `git fetch` ; master doit être `bdfc6d27`. Sinon : refusionner, requalifier, et **le numéro peut monter** (« le second qui
   fusionne MONTE d'un numéro »).
2. Choisir : reprendre le commit de préparation (avance rapide de master jusqu'à la tête de `claude/nut-m6-prep-ft-v1258`),
   ou refaire le commit de version. ⚠️ Les textes de préparation disent « préparé par session-A, NON PUBLIÉ » (entrée
   `ft-v1258` de `CLAUDE.md`, puce « Version en ligne » de `docs/CONTEXTE-ACTUEL.md`, en-tête de `docs/NUT-M6-REJEU-01.md`) :
   à remplacer par l'état réel au moment de publier.
3. Avant le push : annexe complète sous isolement réseau, répétition à blanc du retour arrière, fumée sur l'arbre exact
   (`git archive`), `git push --dry-run`.
4. Un push en avance rapide sur master, jamais forcé ; Pages seulement.
5. Après : run Pages, aucun run Apps Script / Worker, arbre déployé contrôlé en local (le domaine public n'est pas joignable
   depuis une session : `CONNECT 403` au mandataire, `ENOTFOUND` en lecture web — mesuré le 21/10 à 12:2x UTC), documents
   d'après en `[skip ci]`, journal clos.
6. iPhone (Michel) : `TEL-VERSION-01`, `PWA-IOS-01` et sa recette minimale (À propos `ft-v1258` · ajout manuel · reprise
   d'un repas habituel · ajout rapide · Séance), **sans données fictives dans son vrai journal**.

## 6. Retour arrière (écrit, non rejoué)

Remettre l'**ancien code** (`app.js` de `ft-v1257`) avec une clé **jamais diffusée** (`ft-v1259`) ; aucune donnée à défaire
(M6 n'écrit rien dans les données existantes ; le marqueur n'entre jamais dans une ligne — témoin B-NM6-MQ ①).

```
git fetch origin master && git checkout -B retour-m6 origin/master
git checkout bdfc6d27 -- app.js
# sw.js : 'ft-v1258' → 'ft-v1259' (+ ligne de description) ; CLAUDE.md : entête ft-v1259 / ft-v1260 + entrée
# (journal > 8 : déménager la plus ancienne à la FIN de docs/JOURNAL-ARCHIVE.md) ; CONTEXTE : puce « Version en ligne »
python3 tools/check_regles.py
git commit -am "ft-v1259 — retour arrière de M6 : app.js de ft-v1257, nouvelle clé de cache"
git push origin HEAD:master        # avance rapide uniquement, jamais --force
```

À vérifier en le rejouant à blanc : `app.js` identique à l'octet à celui de `bdfc6d27` · seuls fichiers servis différents de
`ft-v1257` : `sw.js` · clé `ft-v1259` · `check_regles` vert · banc M6 = **15 OK / 17 rouges** (le résultat de `ft-v1257`,
attendu : les témoins M6 restent et rougissent, on ne les débranche pas) · fumée : service worker `ft-v1259`, 0 erreur.

## 7. Hors périmètre absolu (Michel, 21/10)

Patch d'historique des 517 entrées · ses 9 favoris · ses quantités d'Iso Zero · anciens repas et totaux · Milo · M1–M4 ·
anciennes routes de sauvegarde par e-mail · tout autre chantier.
