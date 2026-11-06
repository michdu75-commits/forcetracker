# Essai iPhone C1 — réseau mobile réel (branche d'essai, jamais publiée)

> Compte **fictif** (`…@example.invalid`), projet Apps Script de **TEST** : aucune donnée réelle, aucune vraie app touchée. Durée ≈ 15 min.
> Le serveur d'essai tourne sur **ton ordinateur** ; l'iPhone l'ouvre en Wi-Fi, puis on coupe le Wi-Fi : la page reste chargée et **tout ce qu'elle envoie à Google passe par la 4G/5G**.

## Sur l'ordinateur (une fois)
```
cd <ton dossier forcetracker>
git fetch origin test/c1-c5-2026-11-06
git worktree add ../ft-c1-test origin/test/c1-c5-2026-11-06
cd ../ft-c1-test
node p1/serveur_iphone.js https://script.google.com/macros/s/AKfycbxrPmpwVXltJCoRQngtla65DxzBQCrTGyKuxhyidz0hIMuowxqB6JZXONARmEWcNux-/exec
```
Il affiche `http://<adresse>:8080/`. (Windows peut demander d'autoriser Node sur le réseau privé : **Autoriser**.) Ne ferme pas la fenêtre.

## Sur l'iPhone
1. **En Wi-Fi** (même réseau que l'ordinateur) : Safari → l'adresse affichée. Attendre que l'app soit chargée. Un bandeau rouge **« C1 · 0 envois »** apparaît en haut à droite : touche-le pour ouvrir le panneau.
2. **Témoin Wi-Fi** : « ▶︎ les 5 en rafale » (≈ 30 s) → « Comparer avec le serveur » → doit dire *identique · aucun doublon* → « Copier le rapport ».
3. **Couper le Wi-Fi** (Réglages → Wi-Fi, ou Centre de contrôle), garder les données cellulaires. **Ne recharge pas la page.** Dans le panneau : *Réseau* = **5G** → « Nouvelle série » → « ▶︎ les 5 en rafale » → attendre ≈ 1 min → « Comparer avec le serveur » → « Copier le rapport ».
4. **4G** : Réglages → Données cellulaires → Options données → Voix et données → **4G** (si 5G n'est pas disponible, dis-le). *Réseau* = **4G** → « Nouvelle série » → rafale → comparer → copier.
5. **Coupure en plein envoi (facultatif, 2 min)** : « Nouvelle série », touche **① +Pâtes**, puis **dans les 2 secondes** active le **Mode avion**, attends 15 s, désactive-le, attends 2 min → comparer → copier.
6. Colle **chaque rapport** dans la conversation (un par essai).

## Ce que le rapport dit
Nombre d'envois · **réponses lisibles / illisibles** · échecs réseau · envois simultanés au maximum · durées · messages affichés · **téléphone ↔ serveur** (doublons, divergence).
Le point décisif : **« réponses LISIBLES = envois »** en 5G **et** en 4G. Des réponses *illisibles* alors que le serveur a bien enregistré = la panne redoutée (« Load failed » d'un POST dont on lit la réponse, `PLAN-SOLUTION-4G.md`).
