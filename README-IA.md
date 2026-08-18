# 🤝 Pour les IA qui travaillent sur Force Tracker (Claude, ChatGPT…)

> **Ce dépôt est la SOURCE DE VÉRITÉ COMMUNE du projet.** Toute IA qui aide sur Force
> Tracker raisonne à partir d'**ici** — pas de contexte à répéter, pas de recopier-coller.
> Idée de Michel (19/07/2026) : une **mémoire de projet partagée** plutôt qu'un dialogue
> direct entre IA. Chacun travaille avec la **même vision**.

---

## 👥 L'équipe
- **Michel** — vision, **décision finale**, arbitrage. Le seul à décider. Non-développeur : lui expliquer simplement, une chose à la fois, prévenir avant tout risque.
- **Claude (Claude Code)** — architecture, développement, tests, documentation, suivi Git. **Vit DANS le dépôt** (relit `CLAUDE.md` à chaque session).
- **ChatGPT** — vision produit, UX, expérience utilisateur, stratégie, remise en question. **Lit le dépôt** (liens plus bas).

## 📖 Par où commencer (ordre de lecture)
1. **`docs/CONTEXTE-ACTUEL.md`** — 1 page : où en est le projet **MAINTENANT** (version, branche, priorités, prochaine étape, blocages). **À LIRE EN PREMIER.**
2. **`CLAUDE.md`** — la page d'accueil : vision + les **12 règles d'or** + architecture + **journal des versions** (tout l'historique des features).
3. **`docs/VISION-FORCE-TRACKER.md`** — l'**esprit / le pourquoi** (« une mémoire sportive intelligente, pas une IA »).
4. **`CONSTITUTION-MILO.md`** — les **principes stables** de Milo (le coach IA).

## 🗺️ Où trouver quoi
| Tu cherches… | Fichier |
|---|---|
| Roadmap / priorités | `docs/CONTEXTE-ACTUEL.md` + `IDEES-FUTURES.md` |
| Décisions validées + features terminées | journal de `CLAUDE.md` |
| Idées **abandonnées + pourquoi**, bugs connus, galères | `docs/GALERES-ET-LECONS.md` |
| Règles de Milo (principes) | `CONSTITUTION-MILO.md` |
| Construction de Milo, brique par brique | `DOSSIER-ATHLETE-SUIVI.md` |
| Choix UX / présence de Milo | `docs/PRESENCE-MILO.md` |
| Méthode de travail (le cycle d'une brique) | `docs/PROCESSUS-DEVELOPPEMENT.md` |
| Retours des vrais testeurs | `RETOURS-TESTEURS.md` |
| Architecture technique / fichiers | `CLAUDE.md` (section Architecture) |

## 🧭 La règle qui fait que ça marche
**Chaque** décision, idée abandonnée, feature livrée, retour testeur → **GRAVÉ dans le bon fichier, en temps réel** (règle d'or #12 de `CLAUDE.md`). C'est ça, la mémoire partagée : on n'oublie rien, et personne n'a besoin de répéter le contexte.

## 🔬 UN AUDIT EXTÉRIEUR SE VÉRIFIE — TOUJOURS, ET DANS LES DEUX SENS (18/08/2026)

> Michel, quand on a mis en place le travail à deux instances : *« ouais mais moi je veux que tu
> vérifies ce qu'il dit »*. **C'est la règle, et elle n'est pas négociable.**

**Rien de ce qu'une IA extérieure affirme n'entre dans le code sans avoir été RE-MESURÉ ici.** Pas
par méfiance : parce qu'une instance qui n'exécute rien raisonne sur les documents, et **les
documents décrivent l'intention, le code décrit le comportement**. Les deux divergent toujours un
peu — c'est même exactement ce qu'un audit sert à trouver.

**Le cas qui a produit cette règle** — contre-audit nutrition v1.1, 10 points :

| | Résultat après vérification dans le code |
|---|---|
| **Confirmés et livrés le jour même** | le plancher calorique manquant (ft-v906) · le plancher protéines du kéto |
| **Confirmé, et PIRE que décrit** | le mélange cru/cuit — il ne pouvait pas voir que les deux états cohabitent dans la même table |
| **Ses chiffres corrigés** | 947 kcal annoncés → **1 047** mesurés (il avait oublié le +100 de la phase de charge) ; sa liste de 4 profils touchés se réduit à 2 |
| **MES chiffres corrigés par lui** | seuils de cache exprimés dans deux unités inverses **dans le même document** · chiffres CIQUAL cités de mémoire · plafond IA présenté comme s'il bornait tout le monde |

**⭐ La leçon tient en une ligne : aucun des deux ne fait autorité seul.** Il a trouvé trois erreurs
chez moi, j'en ai trouvé deux chez lui, et le résultat combiné vaut mieux que ce que l'un ou l'autre
aurait produit. **La vérification n'est pas un contrôle hiérarchique, c'est le mécanisme.**

**Comment ça se passe concrètement :**
1. L'audit arrive (PDF, message, peu importe).
2. **Chaque affirmation vérifiable est classée** : confirmée par la mesure · corrigée avec le bon
   chiffre · non vérifiable, et alors on le DIT plutôt que de trancher.
3. Ce qui est confirmé et touche à la **santé ou à la sécurité** passe devant le reste.
4. La réponse lui est renvoyée **point par point**, y compris mes propres erreurs — sinon il
   raisonnera la fois d'après sur les mêmes chiffres faux.

**⚠️ Et le piège symétrique, déjà payé** : ne pas *deviner* ce qu'un audit veut dire. Le 18/08,
j'ai cru identifier deux erreurs de Milo à partir des données — plausibles, vérifiables… et fausses.
Ce sont les captures de Michel qui ont donné les vraies. *Réparer ce qui n'est pas cassé coûte
autant que ne pas réparer* (`BUGS.md` famille 12ter).

## 🎨 Demander une MAQUETTE à une IA externe (Gemini, ChatGPT, un outil de design)
**Une seule chose à faire : coller le bloc de `docs/DESIGN-KIT.md`** en tête de la demande.
Il est **autosuffisant** — contraintes, couleurs réelles, composants existants, et surtout les
**pièges déjà payés** (filtres SVG sur un tracé qui disparaissent sur Safari iOS, `mask-composite`,
`color-mix` sans repli, dégradé SVG qui ne peut pas suivre un arc). Sans lui, l'outil travaille
**à l'aveugle** : il invente une esthétique belle chez lui et **intransposable** ici, et il
re-tombe dans des bugs qu'on a déjà corrigés.
⚠️ Ces pièges sont dans le **bloc à coller**, pas dans le prompt de session : ils ne servent qu'aux
demandes de maquette (règle **R20** — le prompt reste maigre, la doc se jardine).

## 🌐 Accès (pour une IA externe, ex. ChatGPT)
Le dépôt est **public** :
- **GitHub** : https://github.com/michdu75-commits/forcetracker
- **Lire un fichier directement (raw)** :
  `https://raw.githubusercontent.com/michdu75-commits/forcetracker/master/<chemin>`
  Ex. : `…/master/docs/CONTEXTE-ACTUEL.md` · `…/master/CLAUDE.md` · `…/master/CONSTITUTION-MILO.md`
- → Une IA qui peut **naviguer sur le web** lit ces fichiers **sans copier-coller**.
- **Encore mieux** : un **« GPT personnalisé »** (Custom GPT) avec ces docs en **base de connaissances** → il raisonne toujours à partir du même référentiel, mis à jour de temps en temps.

## ⚠️ Ce que ce dépôt N'EST PAS
- **Pas** un canal de **dialogue direct entre IA** — les IA ne se parlent pas ; elles **partagent une mémoire**.
- **Pas** un état **temps réel** — chaque IA lit indépendamment. La vérité = **ce qui est commité** dans `master`.
- **Pas** un remplacement de Michel — il **décide**, les IA **proposent et exécutent**.

---

*Ce fichier est référencé depuis `CLAUDE.md`. Le garder à jour si l'organisation de la doc change.*

---

## 🎭 Ce qu'on partage avec une IA extérieure — et ce qu'on garde (27/07/2026, décision Michel)

> **Tout n'est volontairement pas partagé.** Ce n'est pas de la rétention, c'est ce qui donne sa valeur
> à l'avis extérieur.

**Règle : retenir nos CONCLUSIONS, partager nos CONTRAINTES.**

| | Quoi | Pourquoi |
|---|---|---|
| 🔒 **On garde** | nos arbitrages, ce qu'on a déjà tranché et pourquoi | C'est ce qui préserve l'**indépendance**. Le 27/07, GPT est arrivé seul à *« informer sans bloquer »* — la valeur du signal venait **entièrement** du fait qu'il ignorait qu'on avait tranché pareil 3 h plus tôt. Lui dire aurait transformé une confirmation en acquiescement. |
| 📤 **On donne** | les faits : ce qui existe déjà, ce qui contraint techniquement | Un avis extérieur qui ignore les contraintes produit des propositions **élégamment fausses**. Sa réorganisation documentaire du 27/07 était à ~60 % une description de l'existant, faute de savoir qu'il y avait 28 documents. |

**Le risque à surveiller** : si on ne lui renvoie que nos objections, il finit par **s'aligner** — et on
perd le contrepoids. *Deux conseillers d'accord, ça n'en fait qu'un.* Le but n'est pas de le convaincre :
c'est Michel qui arbitre, et la divergence est **utile**, pas un problème à résoudre.

*(Même principe que ce qu'on demande à Milo depuis ft-v595 : ne jamais redemander ce qu'on sait déjà.)*

