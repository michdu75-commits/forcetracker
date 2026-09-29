# 🧪 La recette de Force Tracker — ce que Claude rejoue, et ce qui reste à Michel

> **Créé le 28/09/2026 (RECETTE-01)**, à partir de la cartographie TEST-MATRIX-01. Décision de Michel
> **D-030** : *maximiser volontairement les tests exécutés par Claude, même si ça coûte du temps de
> calcul ; un test manuel seulement quand aucune preuve automatique assez fidèle n'est possible.*
> ⛔ Ça ne veut pas dire que toute preuve terrain devient inutile : il en reste, **peu, et chacune dit pourquoi**.

## 1. Les trois commandes

| Question | Commande | Durée |
|---|---|---|
| « Qu'est-ce que je dois rejouer après ce changement ? » | `python3 tools/recette_selecteur.py --diff origin/master` (ou des noms de fonctions : `… saveAsProg persist`) · `--publication` ajoute la passe et T3 | 1 s |
| « Les suites hors passe sont-elles vertes ? » | `python3 tools/recette_annexe.py` (ou un sous-ensemble : `… dates,anneau`) | ~7 min |
| « Puis-je publier ? » | `bash tools/passe_valide.sh` — la passe complète et ses 4 conditions | ~25 min |

Les deux outils **s'éprouvent eux-mêmes** : `--auto-test` (sortie `──── N OK / 0 rouge ────`), et leur
contrôle négatif est `python3 tools/mut_recette01.py`.

## 2. Les niveaux

| | Contenu | Qui |
|---|---|---|
| **T0** | `git diff --check` · `check_regles.py` (version, archive, registre des décisions, empreinte du prompt) | Claude |
| **T1** | les témoins du lot + son banc (`tools/banc_*.js`) + son contrôle négatif (`tools/mut_*.py`) | Claude |
| **T2** | les bancs des dépendances directes · le **bloc annexe** · la **passe complète** avant publication | Claude |
| **T3** | publication : Pages + `pages_build_version` · Apps Script (vérifié par son workflow) · Worker (**non vérifié**, voir §6) | Claude |
| **T4** | téléphone, **seulement** si la zone touchée l'exige (§4) | Michel |
| **T5** | smoke périodique (12 parcours, dont 11 automatiques) | Claude + 1 minute de Michel |
| **T6** | recette lourde : inscription, gratuit → Premium, cloud réel, imports réels | compte de test / clone |

⛔ **La passe complète avant chaque publication est une décision actée** (protocole deux sessions du
13/09/2026, règle d'or #13, `docs/PROTOCOLE-DEUX-SESSIONS.md` §2) : le sélecteur ne la remplace pas.
⭐ **Clarifiée le 29/09 (D-031)** : elle doit avoir tourné sur le **dernier arbre portant un changement
fonctionnel ou du harnais**. Ajoutés après elle, documentation, journaux, numéro de version et numéro de
cache de `sw.js` ne la périment pas ; tout le reste (code, logique, service worker, persistance, harnais
pouvant changer son résultat) impose de la rejouer. Dans le doute, on relance.

## 3. Le bloc annexe — comment lire son résultat

`tools/recette_annexe.py` lance les suites listées dans `tests/recette/suites-annexes.json` (15 aujourd'hui :
les 11 suites historiques, `seance-unicite`, `nutri-proprietes`, `s2b-worker`, `pwa-offline`) et donne à
chacune UN statut :

| Statut | Signification | Bloque ? |
|---|---|---|
| `PASS` | aucun rouge, ligne de total présente | non |
| `DÉFAUT CONNU` | rouges, tous listés dans `tests/recette/defauts-connus.json`, avec raison et référence ; la valeur mesurée est réaffichée | non (visible à chaque fois) |
| `TÉMOIN PÉRIMÉ` | rouges listés comme témoins à réparer | non (dette déclarée) |
| `FAIL` | au moins un rouge **non listé** | **oui** (code 1) |
| `ERREUR D'INFRA` | plantage, délai dépassé, total absent, code incohérent, fichier suivi modifié par la suite | **oui** (code 2) |

⛔ Un libellé n'est accepté que s'il correspond **exactement** : aucune ressemblance. Un défaut connu qui
ne rougit plus est **signalé** (à retirer de la liste). Aujourd'hui : **2 défauts connus** (`discussions`,
taille du prompt, depuis `ft-v1239`), **0 témoin périmé**.

## 4. Ce qui reste à Michel — et pourquoi

Chaque test manuel porte, dans `tests/recette/registre.json`, son champ **`manuel_si`** : la raison pour
laquelle l'automatique ne suffit pas. Sans raison, il n'a pas le droit d'être manuel.

| ID | Quand | Pourquoi pas automatique |
|---|---|---|
| `TEL-VERSION-01` | la **logique** de `sw.js` ou l'enregistrement du service worker change (pas un simple numéro) | seul l'iPhone prouve qu'une app **installée** passe à la nouvelle version |
| `PWA-IOS-01` | idem, ou le démarrage | le test automatique prouve le service worker dans Chromium, pas Safari iOS ni le mode installé |
| `AUDIO-TIMER-01` | un son apparaît dans le code (aujourd'hui la minuterie est muette) | iOS coupe la musique au premier contexte audio |
| `ECRAN-ALLUME-01` | le verrou d'écran change | dépend du navigateur et de l'énergie de l'appareil |
| `CAMERA-01` | le scanner change (⛔ sans bouton : décision attendue) | caméra, mise au point et permission réelles |
| `RENDU-IOS-01` | le rendu d'un écran change | WebKit iOS ≠ Chromium, et **ce conteneur n'a que Chromium** (mesuré) |

⛔ **Pas de « tester le dropset sur téléphone »** : ML-A est conduit bout à bout dans Chromium (rechargement
et repos compris). Un scénario prouvé automatiquement n'est jamais redemandé à Michel.

## 5. Le clone

`/clone/` **n'est plus dans master depuis `ft-v976`** (23/08, décision de Michel). Ça ne prouve pas qu'aucun
ancien clone n'existe ailleurs (installé sur un téléphone, par exemple) — mais un tel clone **ne représente
pas la production actuelle**, et les 12 gardes `window.__FT_CLONE__` du code y rallumeraient des essais
parqués. Le futur clone / QA est un **chantier séparé**, réservé aux parcours T6 : destructifs,
inscription / remise à zéro, gratuit / Premium, imports, cas pénibles sur le compte réel. **Pas de double
recette clone + production** sans un risque réellement différent.

## 6. Trous connus, écrits pour ne pas être redécouverts

- **Worker** : rien ne vérifie qu'il répond après son déploiement, et le workflow ne se modifie pas
  (décision du 27/08). Le contrôle est un appel réel, avec l'accord de Michel.
- **Supersets** (séance et éditeur de programme) : aucun témoin dédié ; le sélecteur le dit. Le lot qui y
  touche écrit son témoin.
- **Obéissance de Milo** : le local prouve la présence d'une règle, jamais qu'elle est suivie ; seul le banc
  réel (payant, sur accord) le mesure.
- **Fixtures de dates** : la suite `dates` couvre les formes `new Date().toISOString()…` et
  `new Date(Date.now()±…)…` dans **tous** les fichiers de test ; la forme en plusieurs instructions
  (`x=new Date(); x.setDate(…); x.toISOString()…`) lui échappe encore (elle est sûre quand elle part de midi).

## 6 bis. Dettes consignées pour RECETTE-02 (⛔ chantier NON ouvert)

- **Dette A — 12 formes UTC « en plusieurs instructions » restent dans les tests** (`x=new Date();
  x.setDate(…); x.toISOString()…`, dont `tests/anneau/runner.js` ligne 18). Non critiques aujourd'hui : elles
  datent des fixtures **décalées de plusieurs jours**, où un jour d'écart la nuit ne change pas ce que les
  témoins vérifient. La suite `dates` ne les voit pas encore.
- **Dette B — le sélecteur ignore en silence une entrée inconnue.** Le comportement est **conservateur**
  (aucune dépendance inventée, T0 seulement), mais il doit afficher explicitement « entrée inconnue : ni
  fonction du code servi, ni zone du registre ».

## 7. Tenir le registre à jour

- Un **nouveau banc** → une entrée dans `tests` du registre, et dans les `tests_associes` du scénario.
- Une **fonction qui devient importante** → ajoutée aux `declencheurs` d'un scénario (jamais un nom de fichier métier).
- Un **test manuel** → uniquement avec son `manuel_si`.
- Le sélecteur **refuse** un registre incohérent (déclencheur introuvable dans le code, test sans fichier) :
  un registre qui dérive en silence ment.
