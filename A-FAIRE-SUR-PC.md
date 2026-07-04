# 🖥️ À FAIRE SUR PC (backend Apps Script — clasp)

> **Pour Michel.** Ce fichier liste les modifs **backend** (`Code.js`) préparées côté web mais qui doivent être **déployées depuis ton PC** (via `clasp`, car ça demande le login Google impossible dans le cloud).
>
> À chaque fois que tu es sur ton PC pour une « session backend », ouvre ce fichier et fais les points cochables ci-dessous. Claude ajoutera ici tout nouveau point en attente.
>
> **Rappel de la séquence de déploiement backend** (voir CLAUDE.md) :
> ```
> NODE_TLS_REJECT_UNAUTHORIZED=0 npx clasp push --force
> NODE_TLS_REJECT_UNAUTHORIZED=0 npx clasp deploy -i AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA
> # puis vérifier : ?test=1 renvoie {"status":"online"}
> ```

---

## ⏳ En attente

### 1. Persistance cloud du champ « Discipline » (ft-v194)
Le champ Discipline (Profil) est enregistré en local et utilisé par le Coach, mais **pas encore sauvegardé dans le cloud**. Pour qu'il survive à une réinstallation :

Dans `Code.js`, fonction **`handleSaveProfile_`**, à côté de la ligne `body.badges` (~ligne 476) :
```js
if (body.discipline !== undefined) profile.discipline = _ps_(body.discipline, profile.discipline);
```
`loadProfile` renvoie déjà tout `profile` → **rien d'autre à changer**.

### 2. Persistance cloud du compteur « imports de journal » (ft-v168) — *si pas déjà fait*
Même endroit (`handleSaveProfile_`), à côté de `body.badges` :
```js
if (body.histImports !== undefined) profile.histImports = _pn_(body.histImports, profile.histImports);
```

> 👉 Les points 1 et 2 se déploient **ensemble** en une fois (2 lignes + 1 seul `push`/`deploy`).

### 3. Analyse morpho « la totale » (premium) + exploitation de la discipline — *plus gros*
Voir le plan détaillé dans le **fichier d'idées** (section « Analyse morpho par photo — 2 niveaux + insertions musculaires + Discipline »). À cadrer ensemble le moment venu :
- prompt d'analyse à 2 variantes (basique gratuit / complet premium avec insertions, contraction, positionnement),
- passer le niveau complet sur **Claude Sonnet**,
- ajouter 1 slot photo fléchie + guidage des poses.
Claude prépare le code ici, tu déploies depuis le PC.

---

## ✅ Fait
*(rien encore — Claude déplacera les points ici une fois déployés)*
