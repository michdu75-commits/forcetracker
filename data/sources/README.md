# 📦 Les sources des fichiers générés

> **Pourquoi ce dossier existe** — 04/09/2026. `data/alias.json` a été généré depuis un classeur
> qui vivait dans un dossier **temporaire**. Le conteneur a redémarré, le classeur a disparu, et
> la table est devenue **impossible à régénérer** : plus moyen de corriger une entrée, d'en
> ajouter une, ni même de vérifier d'où venait un chiffre.
>
> 👉 ***Un fichier généré dont la source n'est pas versionnée est un fichier figé qui s'ignore.***
>
> La règle R27 dit *« ce qui est généré ne s'édite pas à la main »*. Elle devient **impossible à
> tenir** si la source n'est plus là : on est alors forcé, soit de retoucher la sortie à la main
> (ce qui est interdit), soit de renoncer. Ce dossier ferme ce piège.

## L'état réel, générateur par générateur

| Généré | Par | Source | Dans le dépôt ? |
|---|---|---|---|
| `data/alias.json` | `tools/alias.py` | `Force_Tracker_Alias_CIQUAL_V2_Elargie.xlsx` | ✅ **oui**, ici |
| `data/ciqual.json` | `tools/ciqual.py` | `Table_Ciqual_2025_complete.xlsx` (ANSES) | ⛔ **non** — 8 Mo, et **retéléchargeable** sur [ciqual.anses.fr](https://ciqual.anses.fr) : la source est publique et stable, la verser coûterait plus qu'elle ne protège |
| `data/marques.json` | `tools/marques.py` | `Base_Fast_Food_France_..._CONTROLEE.xlsx` | ⛔ **non — PERDU**, même cause que l'alias. Michel l'a fourni le 03/09 ; il n'a jamais été versé et le conteneur a redémarré depuis. **27 produits figés tant qu'il n'est pas redonné.** |

⚠️ **Le tableau ci-dessus est vérifié par un témoin permanent** (bloc CCXXVIII du parcours) : tout
générateur qui lit un `.xlsx` doit y figurer, et toute source annoncée « dans le dépôt » doit y
être vraiment. *Sans ça, la ligne redeviendrait fausse au premier générateur ajouté.*

## Ce qu'il faut faire en ajoutant un générateur

1. Verser sa source **ici**, sauf si elle est **publique et retéléchargeable** — auquel cas on
   écrit **où la retrouver**, ce qui revient au même : la sortie reste régénérable.
2. Ajouter sa ligne au tableau.
3. Ne **jamais** éditer la sortie à la main (R27) : la corriger dans le générateur et régénérer.

## Vérifier qu'une source produit bien la sortie en place

```bash
python3 tools/alias.py data/sources/Force_Tracker_Alias_CIQUAL_V2_Elargie.xlsx
git diff --stat -- data/alias.json      # ⛔ doit être VIDE
```

⭐ C'est ce contrôle qui a prouvé, le 04/09, que le classeur redonné par Michel était bien celui
qui avait produit la table : **régénéré, le fichier était identique au bit près**.
