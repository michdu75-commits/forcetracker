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

### 1 + 2. Persistance cloud « Discipline » (ft-v194) + compteur « imports journal » (ft-v168)
✅ **Code déjà ajouté dans `Code.js`** (fonction `handleSaveProfile_`, juste après `body.badges`) :
```js
if (body.discipline    !== undefined) profile.discipline    = _ps_(body.discipline,    profile.discipline);
if (body.histImports   !== undefined) profile.histImports   = _pn_(body.histImports,   profile.histImports);
```
`loadProfile` renvoie déjà tout `profile` → rien d'autre à changer.

**➡️ Il ne reste QUE le déploiement depuis ton PC** (3 commandes) :
```bash
git pull                                                   # récupérer le Code.js à jour
NODE_TLS_REJECT_UNAUTHORIZED=0 npx clasp push --force
NODE_TLS_REJECT_UNAUTHORIZED=0 npx clasp deploy -i AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA
```
Puis vérifier dans le navigateur que `…/exec?test=1` renvoie `{"status":"online"}`.
Une fois fait → déplacer ce point dans « ✅ Fait ».

### 3. Analyse morpho « la totale » (premium) + exploitation de la discipline — *plus gros*
Voir le plan détaillé dans le **fichier d'idées** (section « Analyse morpho par photo — 2 niveaux + insertions musculaires + Discipline »). À cadrer ensemble le moment venu :
- prompt d'analyse à 2 variantes (basique gratuit / complet premium avec insertions, contraction, positionnement),
- passer le niveau complet sur **Claude Sonnet**,
- ajouter 1 slot photo fléchie + guidage des poses.
Claude prépare le code ici, tu déploies depuis le PC.

---

## ✅ Fait
*(rien encore — Claude déplacera les points ici une fois déployés)*
