# 🗄️ Schéma Supabase — versionné à partir de S2-B (17/09/2026)

> **La dette que ce dossier corrige** : `ft_comptes` et `ft_miroir` ont été créées **à la main
> dans le tableau de bord**, et n'existent nulle part dans le dépôt. Personne ne peut donc
> reconstruire la base, ni relire ce qui a été appliqué, ni savoir si ce qui tourne est bien ce
> qu'on croit. *Du SQL appliqué dans une console et oublié n'est pas une décision tracée, c'est
> une rumeur.*

## La règle, et elle n'a qu'une ligne

**Le SQL existe ICI avant d'être collé dans le tableau de bord**, et ce qui est collé est
**exactement** le contenu du fichier — pas une variante retapée, pas un extrait.

## Ce qui est versionné, et ce qui ne l'est pas

| | état |
|---|---|
| `ft_jetons`, `ft_enregistrer_instantane`, `ft_inscrire_jeton`, `ft_revoquer_jeton` | ✅ **versionnés** (S2-B) |
| `ft_comptes`, `ft_miroir` | ⛔ **non versionnés** — créées à la main avant S2-B |

⚠️ **Les deux anciennes ne sont PAS recréées ici, et c'est délibéré.** Écrire aujourd'hui un
fichier « voici sans doute ce qui a été appliqué en août » fabriquerait une source de vérité
**supposée** — le pire des deux mondes, parce qu'elle aurait l'air fiable. Leur définition
réelle a été **mesurée** le 17/09 et vit dans les dossiers d'audit ; elles entreront ici le jour
où on les modifiera vraiment.

## Convention de nommage

```
supabase/migrations/AAAAMMJJ_NNNN_sujet.sql
```

Numérotées, jamais réécrites. **Une migration appliquée ne se modifie plus** : on en ajoute une
autre. *Corriger un fichier déjà appliqué rend le dépôt et la base d'accord en apparence et
faux en réalité.*

## Chaque fichier porte son propre retour arrière

En commentaire, en fin de fichier, sous `-- RETOUR ARRIERE`. Il doit être **complet** et
**testé** : une migration dont on ne sait pas défaire l'effet ne se colle pas dans une base de
production.

## Vérification

```bash
python3 tools/test_migrations_s2b.py     # applique sur un PostgreSQL local et éprouve
python3 tools/mut_migrations_s2b.py      # contrôle négatif : chaque garantie doit pouvoir rougir
```

Le premier monte une vraie base (PostgreSQL 16 dans le conteneur), applique les fichiers **tels
quels**, joue les scénarios d'identité (T1→T10), la révocation, le multi-appareils, les droits,
puis le **retour arrière**. ⚠️ Les contrôles qui ne se voient pas à l'exécution — `search_path`
fixé, `security definer`, absence de SQL dynamique, signature sans adresse — sont lus dans la
**définition enregistrée par la base**, pas dans le fichier : *un fichier peut dire autre chose
que ce qui a été créé.*

⭐ *Une migration qu'on n'a jamais vue refuser un mauvais jeton n'a pas été testée, elle a été
relue.*

⚠️ **Ce que ce banc ne prouve pas** : PostgreSQL local n'est pas l'instance Supabase. Les rôles
y sont recréés, `ft_comptes` y est reconstruite d'après la définition **mesurée**, et le
propriétaire local est superutilisateur — ce qui masque certains effets de `FORCE ROW LEVEL
SECURITY` (le banc les prouve donc à part, avec un propriétaire ordinaire). C'est un banc de
**sémantique SQL**, pas une preuve de déploiement.
