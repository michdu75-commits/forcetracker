# 🔀 Intégration Nutrition V2 × NUT-SECURISATION-P1 — rapport (23/10/2026)

> **Mission de Michel du 23/10/2026** (« Finalisation Nutrition V2 + Sécurisation P1 + Intégration globale »).
> **Claude Principal (session-B)** · branche isolée **`claude/nut-v2-p1-integration`** (depuis master `4ab7f860`).
> ⛔ **Rien n'est déployé, rien n'est publié, rien n'est fusionné dans master.** Apps Script reste en **@192**, l'app en
> **`ft-v1259`**. Aucune donnée réelle lue, modifiée ou restaurée ; aucun appel payant à Milo ; données de test **inventées**.

> ↪️ **24/10/2026** : sur GO de Michel, **P1 + `D-110` sont déployés seuls côté Apps Script (@193, 24/10/2026, 00:58 UTC)** — `Code.js`
> seul sur master (`9a72e107`) ; `D-110` VALIDÉ ; `D-111` = règle A ; `D-112` reportée. **La V2 reste à publier.**

---

## 1. En bref

| | |
|---|---|
| **Statut** | **PRÊT POUR VALIDATION DE PUBLICATION** — sous réserve de ta décision sur `D-110` (déploiement Apps Script) ; `D-111` reste sur la règle A ; `D-112` est une proposition à part. |
| **Ce qui est réuni** | P1 (`Code.js`, protection du journal et des favoris) + Nutrition V2 (l'app) + **`D-110` (FIX-A′)** + une phrase de la diapo du Guide (« à vérifier »). |
| **Passe complète D-031** | **7 920 ✅ / 0 ❌** sur `ce16ea6b` (arbre `d203dd36`), 4 conditions vertes (19:29 → 21:07 UTC) |
| **Recette croisée P1 × V2** | **16 / 0** (vraie app V2 ↔ vrai `Code.js`), contrôle négatif **8 / 8**. |
| **Perte de données** | **0** dans tous les scénarios mesurés jusqu'au plafond de `D-110` ; au-delà : risque résiduel **dit** (§4.3), fermé par `D-112` si tu la retiens. |
| **Décisions à prendre** | `D-110` (valider FIX-A′ avant tout déploiement) · `D-111` (ma recommandation : B restreint, §7.2) · `D-112` (FIX-B′, §7.3). |

---

## 2. Ce qui a été réuni

| Élément | Référence | Ce qu'il apporte |
|---|---|---|
| Prod (aujourd'hui) | Apps Script **@192** (`Code.js` blob `8430bf87`) · app **`ft-v1259`** · master `4ab7f860` | — |
| NUT-SECURISATION-P1 | `claude/nut-securisation-p1` @ `5ead88db` (code testé `db8699cc`) | `Code.js` : un envoi qui retire ou corrige des lignes du journal ou des favoris en garde une copie (zone `recupNut`, puis Drive), jamais renvoyée à l'app (`D-108`, `D-109`). |
| Nutrition V2 | `claude/nutrition-v2` @ `16a3fd2a` (code `f9e2eafe` + `47386fb7` + `12a55a54`) | L'app : un seul calcul (fiche × quantité), l'identité par code-barres, « à vérifier », l'inconnu jamais zéro (`D-096` → `D-103`, `D-111`). |
| **Intégration** | `e7e7a0fe` (P1) → `db12cf1d` (V2) → **`19b87ffb`** (`D-110`) → `c066e575` (recette croisée, NSP1-82, preuve de retour arrière) → **`04eb7bcb`** (Guide + témoins) → **`ce16ea6b`** (témoin CII ⑥ réécrit sur `D-096`, trouvé par la 1ʳᵉ passe complète) | Conflits de **documentation seulement** (BUGS, DECISIONS, journal de partage), tout gardé dans l'ordre. Code fusionné sans conflit : `Code.js` = P1 (V2 n'y touche pas), l'app = V2 (P1 n'y touche pas). |

**Fichiers applicatifs, intégration vs master** : `Code.js` (+144/−2) · `app.js` · `nutrition-v2.js` (nouveau) · `screens.js`
· `setup.js` · `coach.js` · `constants.js` · `index.html` · `sw.js` (précache de `nutrition-v2.js`) — 9 fichiers,
+1 811 / −1 080 lignes, presque tout venant de V2. **L'apport propre de l'intégration** : `Code.js` +26/−9 (FIX-A′) et une
ligne de `app.js` (la diapo du Guide).

---

## 3. Les garanties de V2 (mission §4) — où elles sont prouvées

| Garantie | Preuve (rouge sur le code d'avant, verte maintenant) |
|---|---|
| **A** — ce qui s'affiche = ce qui s'enregistre (400/480 impossible ; scan, recherche, favoris, historique, récents, repas habituels) | B-NV2P (parcours P1–P15, 111 témoins ; P15 = l'incident, 37 témoins, dont ㉖ le 400/480) ; `_n2Apercu` = `_n2Reajouter` sans écriture (`D-111` ①) ; B-NIX X1 ⑥ (après restauration, l'aperçu de « + Ajouter » = 180 kcal pour le pot de 150 g) |
| **B** — un historique incohérent (156/26) → « à vérifier », jamais modifié en silence | P15 ②③④⑤ ; `_n2Incoherence` (4 causes démontrées) ; aucune ligne enregistrée réécrite (`D-111` ⑧) |
| **C** — l'identité = le code-barres (homonymes, favori modifié, suppression ciblée, restauration, synchro) | P15 ⑬ ㉒ (« ✕ ») ; **B-NIX X1 ①②④⑦** (deux produits du même nom, deux codes-barres : deux favoris, la portion de l'un change, l'autre intact, à travers panne, restauration et synchro) ; **X2** (une suppression volontaire ne revient pas) |
| **D** — l'inconnu n'est jamais zéro | P15, CCXCV ②③ ; moteur B-NV2-E ; ⚠️ Milo / Worker hors périmètre (`R34`) — voir §8 |
| **E** — la copie d'origine `n2.av` survit à 2 modifications et plus | B-NV2-E ㉑, mutation MN34 |

## 4. `D-110` — FIX-A′ éprouvé (mission §3)

### 4.1 Ce que c'est
`Code.js` seul (`19b87ffb`) : pour les **favoris**, quand la zone de récupération déborde et que Drive ne garde pas le
surplus, l'envoi n'est **plus refusé** — rien ne sort de la zone (`n = 0`), elle attend au-delà de sa borne (60 000
caractères) jusqu'à un **plafond** (`NUT_RECUP_PLAFOND_FAVORIS_ = 120 000`) ; l'événement dit `differe:'drive'` et le
journal du serveur dit « ACCEPTÉ » sans donnée personnelle. Au-delà du plafond, le refus de `D-109` revient. **Le journal
alimentaire garde `D-109`** : sa restauration fusionne, un refus n'y perd rien.

### 4.2 Les sept vérifications demandées
| Vérification (mission §3) | Résultat | Preuve |
|---|---|---|
| Saturation réelle du stockage | +≈ 14 500 octets par compte quand la zone des favoris double (pire cas, noms aléatoires) ; garde < 25 000 | NSP1-81 ; plafond total 512 000 (Michel : 54 % le 23/10) |
| Dépassements successifs de la borne | la zone monte jusqu'au plafond, jamais au-delà ; puis refus ; Drive revenu → tout déménage | NSP1-80 (8 lots) |
| Pannes Drive prolongées | 0 version perdue pendant ni après | NSP1-80, B-NIX X1 ⑦⑧ |
| Modifications concurrentes | deux envois simultanés pendant la panne : les deux passent, rien de ce qui était au serveur n'est perdu ; l'envoi écrasé manque jusqu'à la synchro suivante de son appareil (limite déjà dite de P1, NSP1-55) | **NSP1-82** (nouveau), NSP1-79 |
| Restaurations pendant et après la panne | les deux favoris homonymes reviennent tels quels, la restauration s'est **réellement** appliquée (pas un refus d'authentification) | **B-NIX X1 ④⑤⑨** |
| Intégrité de toutes les versions | chaque version passée par le serveur se retrouve (liste, zone, Drive), comparée champ par champ | B-NIX X1 ⑧, X2 ②, `perduesPartout` (B-NSP1) |
| Retour arrière sans perte | le `Code.js` de @192 relit (`loadProfile` ne renvoie pas la zone) et réécrit un compte à zone débordante en **gardant la zone à l'octet** ; redéployé en avant, rien de ce qu'elle gardait n'est perdu | `tools/preuve_retour_arriere_d110.js` 6/0, contrôles négatifs rouges |

**Vérification 5 rejouée sur l'arbre intégré** (vraie app V2 + vrai `Code.js`, hors dépôt) : avec FIX-A′, **0 version
introuvable** (10 / 0) ; témoin Drive OK 9 / 0 ; même app avec le serveur de la **prod** : **5 + 5 anciennes versions
perdues** (7 / 2) — le défaut que P1 corrige.

### 4.3 Risque résiduel (démontré, dit)
Au-delà du plafond — panne de Drive **prolongée** ET **plusieurs centaines** de versions de favoris changées pendant ce
temps — un envoi de favoris est refusé ; si « Restaurer » est utilisé avant le retour de Drive, ce qu'il portait est perdu
(NSP1-80 atteint ce cas avec 8 lots de 120 favoris). Aujourd'hui : 1 compte a des favoris (inventaire réel INV-02 du
23/10, `docs/NUT-INVENTAIRE-LECTURE-SEULE.md`). **L'alternative qui le ferme
est côté appareil : `D-112`** (§7.3). Monter ou retirer le plafond ? Non : sans plafond, la zone grossit sans limite dans un
stockage commun déjà plein à 102 % le 29/07 — c'est la raison de `D-109`.

## 5. La recette croisée B-NIX (mission §7, bloc 3)
Vraie app V2 (Chromium, ses vrais gestes : étoile, « ✕ », redéfinition de portion, synchro, redémarrage, « 🔄 Restaurer »
avec code perso) ↔ vrai `Code.js` (P1 + `D-110`) exécuté en local, Drive simulé avec panne. Données : « Yaourt X (test) »,
deux codes-barres `30000000009xx`, `example.test`.

| Scénario | Ce qui est vérifié | Résultat |
|---|---|---|
| **X1** | 2 homonymes → favoris → portion de l'un redéfinie (125 → 150 g, « à vérifier ») → panne Drive → synchro → **Restaurer** pendant la panne → valeurs justes → Drive revenu → synchro → **Restaurer** après | 10 / 10 |
| **X2** | « ✕ » volontaire sur un favori pendant la panne → Restaurer → il **ne revient pas** ; sa copie est gardée à part, jamais réintroduite | 3 / 3 |
| **X3** · limite dite | hors ligne, la nouvelle définition n'atteint pas le serveur ; « Restaurer » remet l'ancienne (préexistant, `BUGS.md` §100) | 1 / 1 (la limite est **mesurée**) |
| **A** | règle d'or #11 : point rouge, aide « ? », aide détaillée **et diapo du Guide** disent « à vérifier » et « + Ajouter » ouvre l'écran | 2 / 2 (rouges avant la phrase du Guide) |

**Contrôle négatif 8 / 8** : le `Code.js` d'avant `D-110` (8 rouges), celui de la prod (3), l'identité retombée sur le nom
(8), la redéfinition par le nom (4), la restauration fusionnée par le nom (1 — la limite X3 bascule), `D-110` sans `n = 0`
(2), la diapo sans « à vérifier » (2), un commentaire modifié (0, le témoin de contrôle).

## 6. Tests (manifeste)
| Banc | Résultat | Contrôle négatif |
|---|---|---|
| B-NIX (recette croisée, `tools/banc_nut_v2_p1_croise.js`) | **16 / 0** | **8 / 8** (`tools/mut_nut_v2_p1_croise.py`) |
| B-NSP1 (P1 + `D-110`, `tools/banc_nut_secu_p1.js`) | **82 / 0** | **45 / 45** (`tools/mut_nut_secu_p1.py`) |
| Moteur V2 (`tools/banc_nut2_moteur.js`) | **70 / 0** | **35 / 35** (`tools/mut_nut2_moteur.py`) |
| Garde de quantité du journal (`tools/banc_journal_qty_guard.js`) | **23 / 0** | — |
| Retour arrière `D-110` (`tools/preuve_retour_arriere_d110.js`) | **6 / 0** | 2 contrôles rouges (`CONTROLE=integ`, `CONTROLE=perd`) |
| Annexe de recette (15 suites) | **14 PASS + 1 défaut connu** | — |
| « discussions » (défaut connu, ses **2 rouges**) | ① « le coût reste borné : maison sous 57 000 et salle sous 62 000 caractères » → maison **71 544** · salle **76 463** ; ② « la partie mise en cache reste sous 44 000 caractères » → **68 781** | **identique à master le même jour** (`4ab7f860`, mêmes valeurs à l'unité) : la cause est la **taille du prompt de Milo**, connue depuis ft-v1239 (`tests/recette/defauts-connus.json`) — **pas** Nutrition ; le contexte de Milo n'est pas modifié par l'intégration |
| Passe complète D-031 — 1ᵉʳ passage (`04eb7bcb`, 17:48 → 19:27 UTC) | **7 919 ✅ · 1 ❌** — le seul rouge : CII ⑥, un témoin d'avant V2 (« la quantité efface la correction à la main ») — **rouge aussi sur la branche V2 seule, vert sur master** : la passe réduite de V2 ne le couvrait pas | réécrit sur `D-096` (la correction reste, le calcul pour 50 g se lit à côté, « ↺ Revenir au calcul » le remet) ; contrôle négatif **3 / 3** |
| Passe complète D-031 — passage final | **7 920 ✅ / 0 ❌** sur `ce16ea6b` (arbre `d203dd36`), 4 conditions vertes (19:29 → 21:07 UTC) | — |

Les bancs V2 de l'écran (B-NV2P, 111 témoins) et des voisins (journal, repas habituels, pots, recherche, M6, séance,
comptes, authentification, sauvegardes, Milo, hydratation…) tournent **dans la passe complète**. Le sélecteur de recette
(`--diff origin/master`) en a tiré 38 contrôles automatiques et 2 manuels (iPhone).

## 7. Les décisions
### 7.1 `D-110` — à valider avant tout déploiement
Proposé par Claude, écrit et éprouvé sur la branche d'intégration (§4), **non déployé**. *Ta validation explicite est
la condition de tout déploiement Apps Script.*

### 7.2 `D-111` — la règle reste **A** ; ma recommandation : **B restreint**
Aujourd'hui (A) : un favori dont la définition de portion a été réécrite (pot 125 → 150 g, valeurs restées pour 125 g) est
« à vérifier » à chaque reprise. **Recommandation** : qu'un favori qui a une **fiche vérifiée du même produit** (code-barres
ou `ciqual:`) et **aucune correction à la main** suive sa définition — valeurs = sa fiche × le poids de sa portion,
calculées par le moteur au moment de la reprise, l'aperçu restant égal à l'écriture. Tous les autres restent A.
Pourquoi : c'est l'intention de ft-v1186 ⑤ (la définition suit le produit) et de `D-051` (le favori, raccourci vers le
modèle) ; le calcul est déterministe (rien n'est deviné) ; une question qui revient à chaque reprise alors que la réponse
est connue use la confiance. Ce que ça ne fait pas : **aucune donnée enregistrée n'est réécrite** (pas de migration) ; un
favori sans fiche ou corrigé à la main ne change pas. Risque : une fiche fausse se propage — c'est déjà vrai de tout ajout
depuis cette fiche. ⛔ *Rien n'est appliqué : c'est une règle métier, elle attend ton accord.*

### 7.3 `D-112` (nouveau, proposé) — « Restaurer » ajoute au lieu de remplacer
FIX-B′ : la restauration **ajoute** les favoris du serveur que l'appareil n'a pas, par **identité de produit** (`_n2Cle`),
le téléphone gagne — comme pour le journal. Mesuré sur un prototype hors dépôt :
| Scénario | Restauration actuelle (remplace) | FIX-B′ |
|---|---|---|
| Modification hors ligne puis Restaurer (X3) | **perdue** | **gardée** |
| Suppression hors ligne puis Restaurer | revient | revient (pareil) |
| Deux appareils : supprimé sur le 1, le 2 restaure puis synchronise | reste supprimé | **revient** au serveur |
| Restaurer pendant / après une panne (X1), suppression volontaire (X2) | OK | OK (inchangé) |

Le coût (ligne 3) existe déjà aujourd'hui dès que l'appareil 2 synchronise sans restaurer (dernier écrivain, `D-108`).
Ferme aussi le risque résiduel de `D-110` au-delà du plafond. Solution complète du multi-appareils : des marques de
suppression synchronisées — nouveau format et nouveau contrat de synchronisation, **non proposé ici**.

## 8. Hors périmètre (signalé à part, mission §10)
- Réparation des anciennes données, les **10 entrées** identifiées : **non touchées** (patch v1.2 jamais exécuté).
- Regroupement historique des repas habituels par **nom** : inchangé.
- Macros inconnues comptées **zéro** dans certains totaux, chez Milo et dans le Worker : non traité (`R34` : un changement de
  contexte de Milo se valide au banc avant/après).
- Restauration contrôlée des copies P1 (zone, fichiers `recup-nut/`) : **P2**, à faire avec ton accord ; aujourd'hui elles
  se lisent dans la sauvegarde de nuit.
- Copies lors de la suppression complète d'un compte : non traité.
- Audit exhaustif de la base alimentaire : plus tard, après Séance.
- **Trouvés en route (préexistants, prod comprise)** : ① « Restaurer » **remplace** les favoris (X3, `D-112`) ; ② seuls les
  **200 premiers** favoris partent au serveur (`savedFoods.slice(0,200)`, les plus récents étant à la fin) — `BUGS.md` §100.

## 9. Recette iPhone (données fictives, à faire par toi — le test automatique ne remplace pas le doigt)
Sur un compte **de test** (pas le tien) : ① scanner deux produits du **même nom** et de codes-barres différents (ou les
créer « (test) »), les étoiler — **deux** favoris ; ② noter l'un avec un autre pot — son favori se dit **« à vérifier »**,
l'autre non ; ③ « + Ajouter » sur celui « à vérifier » **ouvre l'écran**, rien ne s'écrit sans « Ajouter » ; ④ ce que
montre la pastille = ce qui s'écrit ; ⑤ « ✕ » sur l'un : **l'autre reste**, un scan du même produit reste visible ;
⑥ Guide (Menu → Guide) : la diapo « Ta nutrition : combien tu en as mangé » parle de « à vérifier » ; ⑦ hors ligne puis en
ligne : rien de noté ne disparaît ; ⑧ (`D-096`, le cas du témoin CII ⑥) corriger une valeur à la main puis changer la
quantité : la correction **reste**, signalée « ✏️ Corrigé à la main : … (calcul : …) », et « ↺ Revenir au calcul » remet le
calcul — *à toi de dire si ce comportement te convient à l'usage*. *Validé automatiquement : tout ce qui précède dans Chromium ; validé par toi seulement :
le rendu iPhone, les gestes au doigt, le clavier, le mode installé.*

## 10. Publication proposée (⛔ rien n'est fait sans ton GO)
⚠️ Un push sur master déclenche **les deux** déploiements : Pages (l'app) à chaque push, Apps Script quand `Code.js` change.
Deux façons de faire, à choisir :
- **(a) Serveur d'abord — conseillé.** Un commit sur master qui ne change **que** `Code.js` (P1 + `D-110`) : le workflow
  pousse `Code.js` et redéploie (**@193**), Pages republie la même app. Contrôles : run vert, `?test=1` « online »,
  `authStatus` (le workflow le fait). Lire **Santé du système** avant (≤ 55 %). L'app actuelle `ft-v1259` est protégée
  tout de suite (P1 ne dépend pas de V2). Puis, séparément, l'app V2.
- **(b) Tout ensemble.** Poser `ft-v1260` (clé de cache `sw.js`, entrée de journal), puis un seul push en avance rapide de
  master jusqu'à la branche : Apps Script **et** Pages. Plus court, mais un retour arrière toucherait les deux.
Pour l'app (dans les deux cas) : clé de cache `ft-v1260` (la V2 ajoute `nutrition-v2.js` au précache), « À propos » =
`ft-v1260` sur l'iPhone, recette iPhone (§9). La V2 apporte sa pop-up « Quoi de neuf » **v80** (« Nutrition : les grammes
d'abord » : un repère a bougé et un poids est demandé) — numéro **à reconfirmer à la publication** (libre aujourd'hui sur
master ; la branche Séance `dreamy-bell` n'en pose pas au 23/10, 18 h UTC).

**Retour arrière** : serveur — redéployer le `Code.js` de @192 (blob `8430bf87`) : il garde la zone sans la renvoyer
(prouvé, §4.2) ; app — revenir au commit `ft-v1259` + nouvelle clé de cache. Aucune migration, aucune donnée transformée.

## 11. Règle d'or #17 — compteurs (code applicatif de l'intégration seule)
Données persistées ajoutées : **0 clé** (un champ d'événement `differe` dans la zone existante) · fichiers applicatifs
touchés : **2** (`Code.js`, `app.js`) · lignes : **+27 / −10** · anciens chemins supprimés ou fusionnés : **0**.
