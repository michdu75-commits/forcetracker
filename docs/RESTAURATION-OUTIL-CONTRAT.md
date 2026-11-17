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
