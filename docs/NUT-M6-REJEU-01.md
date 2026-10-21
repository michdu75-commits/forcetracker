# 🍽️ NUT-M6-REJEU-01 — le rejeu d'un repas habituel ne lit plus l'écran d'ajout (M6)

> **Ordre de travail prioritaire de Michel du 21/10/2026** (Nutrition = priorité n°1, M6 d'abord).
> Session-A (couloir Nutrition). Branche dédiée **`claude/nut-m6-rejeu-01`**, depuis master `bdfc6d27` (`ft-v1257`).
> ⏳ **Publication autorisée par Michel le 21/10 (ce lot seul) en `ft-v1258`, à exécuter par Claude Principal ; commit de version
> préparé par session-A, NON PUBLIÉ.** Le résultat réel du déploiement est consigné après coup, jamais avant. Pages seulement :
> ni Apps Script, ni Worker, aucune donnée réelle touchée.
> Décision : **D-094** · catalogue des bugs : **`BUGS.md` §90**.

## 1. Le défaut

« Tes repas habituels » (`rejouerRepas`) écrit ses lignes par `_provFood`, qui lisait **quatre** états de l'écran d'ajout.
Cet état survit à « Annuler » et à « Ajouter » : chaque aliment rejoué héritait de l'aliment affiché juste avant.
Mesuré sur le code de master (banc ci-dessous, vrais clics, données inventées) :

| Geste avant le rejeu | Ce que le rejeu écrivait (master) |
|---|---|
| Huile 5 g, « Ajouter » (S1) — ou « Annuler » (S5) | banane, shake, yaourt à **5 g** (le shake passe de « 1 portion » à « 5 g ») |
| Riz repris à 200 g, « Ajouter » (S2) | shake à **200 g** avec un faux pour-100 g de **78** ; pain avec un faux pour-100 g de **125** |
| Riz, 150 tapés (S2b) | shake à 150 g, pour-100 g **104** ; pain **166,7** |
| Saisie à la main, ×2 « part » de 80 g (S3) | pain en « part » de 80 g, pour-100 g **156,3** |
| Barre au pour-100 g incohérent, 50 g (S4) | 4 aliments sains marqués **NON_RESOLU**, et à 50 g |

## 2. Le correctif (G2, décision de Michel) — `app.js` seul

- `_provFood` lit un marqueur porté par la provenance, `_afSrc.ecran===false`, et garde ses **4** lectures de l'écran.
- `rejouerRepas` et `quickAddFood` posent `ecran:false` ; **`addFoodEntry` inchangé** (l'ajout depuis l'écran lit l'écran).
- La provenance est **rendue dans un `finally`** (rejeu) et **effacée dans un `finally`** (ajout rapide) : une panne
  au milieu ne laisse ni provenance ni marqueur posés. *Le second est un choix de Claude, mesuré : sans lui, une panne
  de l'ajout rapide laissait le marqueur posé écran ouvert, et la saisie suivante à la main perdait ses portions.*
- Ni remise à zéro de l'écran, ni « fermé par défaut », aucune donnée persistée, aucune ligne existante modifiée.
- Deux commentaires faux corrigés (« `rejouerRepas` tourne écran fermé », « la quantité vient de l'ITEM, jamais du DOM »).
- Taille : **+14 / −10 lignes de code** (+43 / −14 avec les commentaires).

## 3. Les tests

- **Banc `tools/banc_nut_m6_rejeu.js`** (32 témoins, vrais clics, données inventées, garde réseau en 1ʳᵉ instruction) :
  **15 OK / 17 rouges sur le code de master → 32 OK / 0 rouge** sur le code corrigé. Rouges sur master : S1, S2, S2b, S3,
  S4, S5 (contamination), MQ ③ et ⑤ (provenance qui fuit après une panne), 9 témoins du cliquet de source.
- **Branché dans la passe complète** (comportement dans la section navigateur, cliquet B-NM6-C dans la section synchrone)
  et **déclaré au registre de recette** (scénario NUTRI-JOURNAL-01, avec les 6 fonctions qui manquaient).
- **Contrôle négatif `tools/mut_nut_m6_rejeu.py` : 16 / 16 conformes**, sur des copies de l'arbre (arbre sain d'abord :
  32 / 0). Chaque mutation doit rougir **les témoins prévus**, pas seulement « un » témoin :

  | Mutation | Témoins qui rougissent |
  |---|---|
  | N1 → N4 : une des 4 gardes retirée | son scénario (S1+S5, S2+S2b, S3, S4) + sa ligne du cliquet (⑥ → ⑨) |
  | N5 : le rejeu ne pose plus le marqueur | les 6 scénarios contaminés + cliquet ② |
  | N5b : l'ajout rapide ne pose plus le marqueur | **cliquet ③ seul** (aucun changement de comportement : c'est son rôle) |
  | N6 : « fermé par défaut » | les 4 « Ajouter » + MQ ⑤ + cliquet ⑤ |
  | N7 : l'oracle lui-même (source semée à 120 g, attendu 125 g écrit à la main) | les 8 scénarios S0 → S6 |
  | N8 : remise à zéro de l'écran en tête du rejeu (interdite) | S⑦ |
  | N9 / N10 : les `finally` retirés | MQ ③ + cliquet ⑩ / MQ ④ ⑤ + cliquet ⑪ |
  | N11 : un 4ᵉ écrivain de `_provFood` | cliquet ① |
  | N12 : le marqueur descend dans la ligne | MQ ① + les 8 scénarios + Q ① ② + cliquet ⑤ |
  | N13 : `_provFood` ne lit plus le marqueur · N14 : `addFoodEntry` le pose | 6 scénarios + ⑤ · les 4 « Ajouter » + MQ ⑤ + ④ |
  | MC1 : un commentaire seul (contre-épreuve) | aucun (32 / 0) |
- **Bancs voisins** (désignés par `tools/recette_selecteur.py --diff`, lancés l'un après l'autre, sous garde) :
  `journal_qty_guard` **21 / 0** · `repas_actif` **24 / 0** · `pots_nutrition` **48 / 0** · `ia_ref100` **35 / 1 → 36 / 0**
  (voir ci-dessous) · `nut_m6_rejeu` **32 / 0**.
- **Le seul rouge voisin était un témoin de FORME, sans défaut.** `B-CCCXLVI ⑮` lisait le texte exact de la condition de la
  trace de fiabilité ; le correctif y ajoute la garde décidée `ecran&&`. Il suit désormais l'invariant (*une ligne cohérente
  ne grossit pas d'une trace*) : vert sur master, vert sur la branche, rouge quand l'exclusion de COHERENT est retirée. Son
  outil de mutations s'ancrait sur la même ligne (M12) : l'ancre suit, **22 / 22 conformes** (`tools/mut_ia_ref100.py`).
- **Instantanés master ↔ branche** : `instantane_1b23` **identique à l'octet** ; `instantane_douane` **identique une fois
  retirés les 21 identifiants de lignes** — des UUID tirés au hasard à chaque création de ligne (les 42 relevés sur les deux
  exécutions sont tous distincts).
- **Annexe de recette** (15 suites hors passe, isolement réseau du système) : **14 PASS + 1 défaut connu** (`discussions` :
  la taille du prompt de Milo, 71 630 / 76 549 caractères) — **identique sur master à l'unité près**, sans lien avec M6.
- **T0** : `git diff --check` propre · `check_regles.py` vert (seul avertissement : `PROMPT-MILO-REEL.txt` périmé, déjà
  signalé sur master) · `recette_selecteur.py --auto-test` 15 / 0.

- **Passe complète D-031 Sécurité : 7 823 ✅ / 0 ❌** sur `35bd9b11` (tree `6f7378e1`), **4 conditions vertes**
  (`tools/passe_valide.sh`, réseau coupé par l'isolement système ; ④ revérifiée hors isolement par un vrai fetch : master
  `bdfc6d27`, retard 0), 104 min, SORTIE = 0. Les 32 témoins M6 y sont verts. Depuis : documentation seulement (D-031).

**Statut (21/10, 10:50) : prêt à intégrer.** ↪️ **Publication autorisée par Michel le 21/10 pour ce lot seul** : voir §6 et §7.

## 4. Rejouer

```
node tools/banc_nut_m6_rejeu.js                 # le banc (se garde lui-même : garde réseau en 1re instruction)
python3 tools/mut_nut_m6_rejeu.py               # le contrôle négatif (16 mutations, sur des copies)
python3 tools/mut_nut_m6_rejeu.py N5            # une seule mutation
```

## 5. Ce que ce lot ne fait pas

- **Aucune ligne déjà contaminée n'est réparée.** Le patch d'historique v1.2 (21/10) reste une simulation, non appliquée.
- **Une source déjà contaminée** (favori, repas habituel noté avec une mauvaise quantité) **se recopie fidèlement** :
  le rejeu copie sa source, c'est le lot **M3**.
- Une panne au milieu d'un rejeu laisse les aliments déjà traités **en mémoire** (non enregistrés) : comportement d'avant,
  inchangé, hors périmètre.

## 6. Intégration et publication (feu vert conditionnel de Michel, 21/10 : ce lot seul, `ft-v1258`)

*Ce qui était prévu, gardé tel quel :*

Refusionner master s'il a bougé, rejouer le banc et la passe complète D-031 (4 conditions), poser le numéro de version
au moment du push seulement. ⚖️ **Pas de pop-up** : c'est un correctif, rien n'est à faire pour la personne et aucun
repère ne bouge. Aucune aide à réécrire (aucun texte ne décrivait le comportement fautif).

**Fait le 21/10** : master `bdfc6d27` inchangé depuis la création de la branche (vérifié sur le serveur, aucun run en cours,
aucune ligne 🟡 au journal de partage), donc **aucune refusion** ; depuis la passe complète, **documentation seulement**
(`35bd9b11` → tête : 4 fichiers `docs/`) ; fichiers intégrés : `app.js` (seul fichier applicatif) + bancs, outils, registre,
documents ; aucun fichier serveur (`Code.js`, `appsscript.json`, `.claspignore`, `worker.js`, `wrangler.toml`, `.github/`) ni
`state.js` ; aucune clé de stockage nouvelle ; aucune donnée personnelle (données de test inventées « (test) », aucune adresse).
Le numéro `ft-v1258` est posé au commit de publication seulement (clé de cache de `sw.js`, entête de `CLAUDE.md`).

## 7. Retour arrière (préparé ; À REJOUER À BLANC avant la publication — non rejoué le 21/10)

⛔ Jamais lancé sans décision de Michel, jamais par un push forcé, et **jamais avec une clé de cache déjà diffusée** :
`ft-v1257` est diffusée et `ft-v1258` le sera dès la publication : le retour arrière emploie **`ft-v1259`** (ou la suivante libre).
Il remet l'**ancien code** (le seul fichier applicatif du lot, `app.js`, tel qu'en `ft-v1257`) ; il ne touche à **aucune
donnée** — rien n'a été écrit dans les données par M6, il n'y a donc rien à défaire côté utilisateurs.

```
git fetch origin master && git checkout -B retour-m6 origin/master
git checkout bdfc6d27 -- app.js                        # app.js de ft-v1257 (tag local : avant-ft-v1258)
# sw.js : const CACHE = 'ft-v1258' → 'ft-v1259' (garder la ligne de description, en ajouter une) ;
# CLAUDE.md : entête « ft-v1259 (prochaine : ft-v1260) » + entrée ft-v1259 (journal > 8 entrées : déménager la plus
#   ancienne à la FIN de docs/JOURNAL-ARCHIVE.md) ; docs/CONTEXTE-ACTUEL.md : puce « Version en ligne »
python3 tools/check_regles.py                          # vert attendu
git commit -am "ft-v1259 — retour arrière de M6 : app.js de ft-v1257, nouvelle clé de cache"
git push origin HEAD:master                            # avance rapide uniquement, jamais --force
```

Ce qu'il faut savoir avant de le lancer : les **32 témoins M6 restent dans le dépôt** et rougiront dans la passe (attendu : 17 rouges,
ceux mesurés sur `ft-v1257` le 21/10 au matin — `app.js` y redevient identique à l'octet) — c'est attendu et honnête, le défaut M6 revient avec l'ancien code ; **on ne les débranche
pas**. Les lignes ajoutées entre-temps par l'app (`ft-v1258`) restent valides : elles ont le format d'avant (le marqueur
n'entre jamais dans une ligne — témoin B-NM6-MQ ①).
