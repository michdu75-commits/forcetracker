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

> 💡 **Note Windows (cmd)** : la syntaxe `NODE_TLS_REJECT_UNAUTHORIZED=0 npx …` (une ligne) est du Mac/Linux. Sur **cmd Windows**, faire d'abord `set NODE_TLS_REJECT_UNAUTHORIZED=0` (ligne à part), puis la commande clasp. Pour récupérer juste le backend sans toucher aux fichiers locaux : `git checkout origin/master -- Code.js`.

## ⏳ En attente

### 3. Analyse morpho « la totale » (premium) + exploitation de la discipline — *plus gros*
Voir le plan détaillé dans le **fichier d'idées** (section « Analyse morpho par photo — 2 niveaux + insertions musculaires + Discipline »). À cadrer ensemble le moment venu :
- prompt d'analyse à 2 variantes (basique gratuit / complet premium avec insertions, contraction, positionnement),
- passer le niveau complet sur **Claude Sonnet**,
- ajouter 1 slot photo fléchie + guidage des poses.
Claude prépare le code ici, tu déploies depuis le PC.

---

## ✅ Fait

### 1 + 2. Persistance cloud « Discipline » (ft-v194) + compteur « imports journal » (ft-v168) — ✅ déployé @59 (2026-07-04)
Ajout dans `handleSaveProfile_` (Code.js) : `body.discipline` (`_ps_`) et `body.histImports` (`_pn_`). Déployé depuis le PC de Michel (clasp push + deploy -i → **@59**). Les deux champs sont désormais sauvegardés dans le cloud (survivent à une réinstallation).
