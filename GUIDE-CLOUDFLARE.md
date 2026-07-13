# 📶 Guide — installer le petit serveur qui fait marcher la photo en 4G

> **Pour Michel.** À faire **une seule fois**, quand ta 4G est revenue. ~5-10 min, que du clic + copier-coller. **Aucun code, aucune clé secrète à taper.** Claude te guide étape par étape si besoin.

**Ce que ça fait** : ce petit serveur « relaie » les photos (bilan, programme) et répond **directement** à ton téléphone, sans le détour Google qui bloque en 4G. Une fois installé, la photo marche en 4G **pour toi ET tous tes utilisateurs**.

---

## Étape 1 — Créer un compte Cloudflare (gratuit)
1. Va sur **dash.cloudflare.com/sign-up**
2. Mets ton **email** + un **mot de passe** → « Sign Up ».
3. Valide l'email (Cloudflare t'envoie un mail de confirmation).

## Étape 2 — Créer le « Worker »
1. Une fois connecté, dans le menu de gauche : **« Workers & Pages »**.
2. Bouton **« Create application »** → onglet **« Create Worker »**.
3. Donne-lui un nom : **`forcetracker-ia`** (ou ce que tu veux).
4. Clique **« Deploy »** (il crée un exemple par défaut, on va le remplacer).

## Étape 3 — Coller le programme
1. Après le déploiement, clique **« Edit code »** (ou « Modifier le code »).
2. Dans l'éditeur, **efface TOUT** le texte présent.
3. **Colle** tout le contenu du fichier **`worker.js`** (Claude te le donnera en un bloc à copier).
4. Clique **« Deploy »** (en haut à droite).

## Étape 4 — Récupérer l'adresse (URL) du Worker
- En haut de la page du Worker, tu vois une adresse du genre :
  **`https://forcetracker-ia.TON-COMPTE.workers.dev`**
- **Copie-la.**

## Étape 5 — Brancher l'appli
- **Envoie cette adresse à Claude** → il la colle dans l'appli (dans `constants.js`, ligne `AI_PROXY_URL`) et déploie.
- *(Ou, si tu veux le faire toi-même : dans `constants.js`, remplace `const AI_PROXY_URL='';` par `const AI_PROXY_URL='https://forcetracker-ia.TON-COMPTE.workers.dev';`)*

## Étape 6 — Tester
- Ouvre l'appli **en 4G**, va au bilan corporel → **« photo »** → prends une photo de ton rapport.
- ✅ Si le bilan se lit → **c'est gagné**, on passe en prod pour tout le monde.
- ❌ Si ça rate encore → envoie la capture à Claude, on ajuste.

---

## Bon à savoir
- 💸 **Gratuit** : l'offre gratuite de Cloudflare = 100 000 requêtes/jour (des années d'avance).
- 🔒 **Aucune clé secrète** dans Cloudflare : ta clé API reste chez Google. Le serveur ne fait que relayer.
- 🛡️ **Zéro risque avant** : tant que `AI_PROXY_URL` est vide, l'appli marche exactement comme aujourd'hui. Le relais ne s'active QUE quand tu colles l'adresse.
- 🔁 **Réversible** : si un souci, on remet `AI_PROXY_URL=''` et tout revient comme avant, en 10 secondes.
- 🌍 Si Cloudflare ne suffisait pas, même principe avec un autre hébergeur (Vercel, Deno Deploy…).
