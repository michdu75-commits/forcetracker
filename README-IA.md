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
