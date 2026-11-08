# 📄 Import PDF — ÉTUDE : exploiter le texte du PDF (08/11/2026)

> **Étude seule. Rien n'est implémenté par ce document, rien n'est déployé.** Demandée par Michel dans le « GO CORRECTIF IMPORT PDF » du 08/11/2026
> (*« Étudie séparément l'amélioration de la consigne IA et l'exploitation du texte du PDF »*). L'autre étude : `docs/IMPORT-PDF-ETUDE-CONSIGNE-IA-2026-11-08.md`.
> Cadre : **R33** (échelle des sources : donnée structurée → **PDF texte** → OCR → IA multimodale → échec propre ; *avant de descendre d'un cran, chercher ce qui, DANS le document,
> permet de vérifier la lecture*), **R29** (le droit de deviner dépend du coût de l'erreur), **R7** (le code décide, le prompt est le dernier levier), **R16** (local d'abord),
> **R19** (la gouvernance sert le produit : pas de pipeline dimensionné pour un volume qu'on n'a pas), **R34** (un changement de contexte se valide par un avant / après).
> Tout fait ci-dessous est **soit lu dans le dépôt (et dit tel, avec sa ligne), soit une ESTIMATION (et dite telle)**. Aucun appel à l'IA, aucune mesure sur le PDF réel de Michel
> (il n'est pas dans le dépôt, ni dans le Drive).

## 1. Où en est l'app (lu dans le code, branche `claude/import-pdf-fidelite-2026-11-08`)

| Maillon | Ce que fait le code aujourd'hui | Où |
|---|---|---|
| Import d'un programme (PDF) | `addImportFile` → **`_pdfToImages` seul** : 8 pages au plus, 1 200 px, JPEG 0,85. **La couche texte n'est jamais lue.** Au-delà de 8 pages, les suivantes sont **ignorées sans rien dire** (pas de message) | `log.js` `addImportFile`, `_pdfToImages` |
| Lecture de la couche texte | `_pdfToText` existe : 100 % local, 0 IA, contrat `COMPLETE / PARTIAL / UNKNOWN`, 15 pages au plus. **Un seul appelant** : le Mode Test VM (`_vmCustomPdf`), qui en tire des noms d'exercices pour un banc | `log.js` `_pdfToText` · `coach.js` `_vmCustomPdf` |
| Regroupement des fragments | par ordonnée (`|Δy| ≤ 3`), triés par abscisse, **joints par un espace** : les colonnes d'un tableau (« Barre · 40 · 10-15 · 4-5 min ») deviennent une seule ligne sans séparateur | `log.js` `_pdfToText` |
| Transport du texte vers l'IA | Le Worker **accepte déjà** une entrée `{isText:true, name, data}` : elle devient un bloc `text` « [Fichier : nom] … » placé avant les images. **Aucun code client ne la produit aujourd'hui** (recherche faite dans `app/log/setup/coach/tracking.js`) | `worker.js` `docContent` |
| Choix du modèle | plusieurs pages ou un texte joint → Sonnet (un PDF de 6 pages passe déjà par Sonnet : joindre du texte ne change pas le modèle) | `worker.js` `importDoc` |
| PDF protégé par mot de passe | `_pdfOuvrir` est la porte d'entrée **commune** aux deux lectures (R2) : le mot de passe ne quitte pas le téléphone | `log.js` `_pdfOuvrir` |

## 2. Ce que la couche texte apporte — et ce qu'elle ne sait pas faire

**Apporte** : les **caractères exacts** (« 10-15 », « 90 × 2 », « 4-5 min », les accents, un nom terminé par « - échauffement »), sans le flou d'un JPEG réduit à 1 200 px (une page A4
rendue ainsi fait ≈ 145 points par pouce : un petit corps de tableau peut se lire de travers) · une couverture **plus longue** (15 pages au lieu de 8) · un **état de lecture** déjà
écrit (`PARTIAL` dit « tout n'est pas lu ») · zéro coût d'IA, hors ligne, mot de passe compris.

**Ne sait pas faire** : (a) **un PDF sans texte** (capture d'écran, scan) rend `UNKNOWN` — l'app retombe sur les images, comme aujourd'hui ; *on ignore si le PDF de Michel a une couche
texte* (voir la question Q5) · (b) **la structure** : sans séparateur, on ne sait pas toujours à quelle colonne appartient un nombre (« 40 55 70 80 » : charges ou répétitions ?) ·
(c) **l'ordre de lecture** d'une mise en page à plusieurs blocs côte à côte peut être mélangé.
→ Le texte est **excellent pour VÉRIFIER** une lecture (« ce nombre est-il dans le document ? »), **médiocre pour la REMPLACER** (« quelle colonne ? »).

## 3. Trois usages, classés (bénéfice · risque · coût · comment on le mesure)

| # | Usage | Bénéfice | Risque | Coût | Mesure |
|---|---|---|---|---|---|
| **U1** | **Recoupement local** : après la réponse de l'IA, le client cherche chaque nom, charge, répétition et repos de la réponse **dans le texte du PDF**, et compte les séances et les lignes d'exercice du texte pour les comparer à ce qui est reçu. Il **signale** dans l'aperçu (« 3 valeurs de la réponse sont introuvables dans le PDF », « le PDF semble avoir 4 séances, 3 reçues »). **Il ne corrige rien** | repère une **séance perdue** (la facultative), une **coupure**, une **valeur mal lue** (« 10-15 » lu « 10-16 »), et les **pages au-delà de la 8ᵉ** — exactement les « à vérifier » de Michel — sans appeler l'IA une fois de plus | fausse alerte quand le texte est mal découpé (« Dév. couché » coupé sur deux fragments, ligatures) → signal **informatif**, jamais bloquant ni correctif (**R29**) | ≈ 100–150 lignes de client + témoins ; **0 jeton**, **0 changement de Worker**, **0 donnée persistée** ; fonctionne avec l'ancien comme avec le nouveau Worker | faux positifs sur la fidèle réponse du jumeau inventé = 0 · détections sur trois dégradations volontaires (valeur modifiée, séance retirée, document tronqué) |
| **U2** | **Joindre le texte aux images** (`isText:true`) + une phrase de consigne (« en cas de doute sur un chiffre, le texte joint fait foi ») | l'IA a les caractères exacts **et** la mise en page | le texte mélange les colonnes → l'IA peut **préférer le texte faux à l'image juste** ; deux sources dans un même prompt ; consigne plus longue (**R20**) ; **+ jetons d'entrée** : ≈ 2 000 à 4 000 pour 6 pages *(ESTIMATION, non mesurée ; l'image seule ≈ 9 000)* | changement du Worker **et** du client ; déploiement Worker = **GO distinct** ; **G5** de Michel | banc **réel** avant / après (R34), 3 répétitions, mêmes documents : séries exactes, noms gardés, jetons, latence |
| **U3** | **Lecture locale déterministe**, sans IA : un analyseur lit la couche texte et fabrique le programme | zéro IA, zéro coût, hors ligne | chaque coach a sa mise en page → analyseur fragile ; la structure manque (§2 b) ; **R33** : *« une architecture dimensionnée pour 1 000 imports qu'on n'a pas est une dette »* — le volume réel est faible (2 imports gratuits, illimité en premium) | élevé | **à ne pas lancer** sans volume mesuré |

## 4. Protocole de mesure (R34) — sur un jumeau INVENTÉ, jamais sur le PDF de Michel

À jouer **après** la fin de la passe d'« Autre activité » (la machine est réservée) ; hors dépôt pour les PDF.
1. **Fabriquer** un PDF inventé de la même forme (6 pages, 4 séances dont une facultative, lignes « X - échauffement » puis « X », repos « 4-5 min ») par impression Chromium d'un tableau HTML.
2. **Extraire** sa couche texte avec **la vraie bibliothèque** (`pdfjs-dist@3.11.174`, celle de l'app) en rejouant le regroupement de `_pdfToText`.
3. **Mesurer, avec des critères calculés par le code** : (M1) part des nombres, noms et repos du document retrouvés dans le texte extrait (attendu : 100 %) · (M2) part des lignes de tableau dont **toutes** les cellules sont dans **une seule** ligne extraite · (M3) pour U1 : détections sur trois dégradations volontaires (valeur modifiée, séance retirée, document tronqué) · (M4) faux positifs sur la réponse fidèle (attendu : 0) · (M5) durée d'extraction (poste de bureau — *un vieil iPhone sera plus lent, non mesuré ici*).
4. **Contrôle négatif** : le recoupement doit **rougir** quand on retire la séance 4 / quand on change un chiffre (**R35** : un scénario qui ne peut pas rougir ne mesure rien).
5. U2 : **non mesurable d'ici** (réseau limité à GitHub) → banc réel avec le Worker de test, **GO distinct**.

## 5. Recommandation

1. **U1 en premier, dans une étape à part, une fois le correctif de regroupement validé** : c'est le seul usage qui apporte ce que ni le code actuel ni le prompt ne peuvent faire seuls — **savoir combien de séances et de lignes le document contient** — pour zéro jeton et zéro Worker. Il n'exige pas **G5** (rien de plus n'est envoyé à l'IA).
2. **Appliquer la décision déjà prise sur les pages au-delà de la 8ᵉ** : aujourd'hui elles sont ignorées **sans un mot**, alors que Michel a tranché le 07/10 (numérotée D-056 sur la branche parquée `claude/import-programme-lot1-client` — *sur master D-056 désigne une autre décision*) : **« jamais silencieuse : un document qui dépasse la limite est refusé avec un message clair, jamais tronqué »**. Cette décision n'a jamais atteint master (le lot 1 est parqué). Le signal existe déjà : `pagesTotal` de `_pdfToText` contre les pages réellement envoyées. ⚠️ **Ne pas relever `MAX_PAGES`** : consigne de Michel du 13/09, *« pas de correction silencieuse du plafond de pages sans d'abord rendre la troncature observable »* — rendre observable d'abord, décider ensuite. *(Le PDF de Michel fait 6 pages : il n'est pas concerné ; un programme plus long perdrait ses dernières séances sans prévenir.)*
3. **U2 seulement après les mesures de U1 et un banc réel** ; il suppose un déploiement du Worker (GO distinct) et la décision **G5**.
4. **U3 : non.** (R33 / R19.)

## 6. Ce que cette étude ne couvre pas

Aucune mesure sur le PDF réel de Michel · on **ignore** s'il contient une couche texte (Q5) · les jetons sont des ordres de grandeur · aucune mesure sur iPhone · aucun appel à l'IA · aucun code n'est écrit.
**Q5 (optionnelle, pour Michel)** : *dans ton PDF, peux-tu surligner un mot du tableau avec le doigt ?* Oui → il a une couche texte, U1 s'applique ; non → c'est une image, seule la lecture par l'IA existe.
