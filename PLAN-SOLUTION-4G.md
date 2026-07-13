# 🛰️ Plan — Faire marcher la lecture photo (bilan + programme) en 4G/5G, pour TOUS

> Démarré 2026-07-13. Objectif : que l'import **photo** (bilan corporel, programme, historique, morpho, étude du corps, code-barres, étiquette) marche **sur réseau mobile**, pas seulement en wifi — pour **tous les utilisateurs** (règle d'or n°4 : marcher à la salle, réseau faible/absent).
> ⚠️ Michel n'a **pas de 4G pendant ~2 semaines** (à partir du 2026-07-13) → il ne peut pas tester d'ici là. Pendant ce temps : **tout préparer** (code + guide), prêt à déployer + tester dès que sa 4G revient.

## 1. Diagnostic (acquis, cf CLAUDE.md « bilan corporel »)
- **Envoi SANS lire la réponse** (`mode:'no-cors'`, ex. `_cloudSync`) → **passe en 4G**.
- **Envoi + LIRE la réponse** (les POST qui font `await r.json()/.text()` : bilan, programme, historique, coach…) → **« Load failed » en 4G**.
- Cause probable : Google Apps Script répond via une **redirection 302 → `script.googleusercontent.com`**. Suivre cette redirection cross-origin + lire la réponse CORS **casse sur certains réseaux mobiles / iOS** (La Réunion, Private Relay, filtrage opérateur…).
- Prouvé que ce n'est PAS une régression : la version du **8 juillet** (lancement) ET l'**import programme** échouent AUSSI en 4G (test A/B sur le clone).

## 2. Solution retenue : petit **proxy IA sur Cloudflare Workers** (répond DIRECT, sans redirection)
Un Worker Cloudflare :
- Répond **directement** avec les bons en-têtes CORS (pas de détour `googleusercontent.com`) → devrait passer là où Apps Script casse.
- **Gratuit** (100k req/jour), **rapide** (edge mondial, bon pour La Réunion).
- Détient la **clé API Anthropic** (secrète, en variable d'environnement du Worker) — jamais dans le JS public.
- **Périmètre** : uniquement les actions **IA/vision**. Le reste (sauvegarde données, sheets, premium, backup Drive) **reste sur Apps Script**.

### Architecture
```
Appli (4G) ──POST direct──▶ Cloudflare Worker ──▶ API Anthropic ──▶ réponse JSON (CORS, sans redirection) ──▶ Appli
                                   (garde la clé API)
```

### Actions à router vers le Worker (IA/vision)
`importBodyScan`, `importProgram`, `importHistory`, `coach`, `morphoAnalysis`, `bodyStudy`, `readBarcode`, `foodLabel` (celles qui appellent Anthropic). **Commencer par `importBodyScan` + `importProgram`** (les 2 testés en échec), puis étendre.

## 3. Côté APPLI (à préparer sur le clone)
- Nouvelle constante `AI_PROXY_URL` (constants.js) = URL du Worker (vide par défaut).
- Helper `_aiFetch(action, payload)` :
  - si `AI_PROXY_URL` défini → POST vers le Worker (direct, lit la réponse).
  - **repli** : si `AI_PROXY_URL` vide OU le Worker échoue → POST vers Apps Script (comportement actuel). → **zéro régression** si le Worker n'est pas configuré.
- Router `onBodyScanPhoto`, l'import programme, etc. via `_aiFetch`.
- Réactiver le bouton **photo du bilan en prod** UNE FOIS que le Worker marche (aujourd'hui gaté `window.__FT_CLONE__`).

## 4. Côté WORKER (à écrire)
- `worker.js` : reçoit `{action, images, message, ...}`, lit `ANTHROPIC_API_KEY` (env), **reconstruit le prompt** de l'action (repris de `Code.js` `handleImportBodyScan_` / `handleImportProgram_`), appelle `https://api.anthropic.com/v1/messages`, renvoie `{status, data}` en JSON + en-têtes CORS (`Access-Control-Allow-Origin: *`, gérer `OPTIONS` preflight).
- Garder les prompts **synchronisés** avec Code.js (ou, mieux plus tard : Apps Script et Worker partagent une source — pour l'instant, dupliquer les 2 prompts).

## 5. Réglage pour Michel (UNE fois, ~5-10 min, guidé) — quand la 4G revient
1. Créer un compte **Cloudflare** gratuit.
2. Créer un **Worker**, coller `worker.js`.
3. Ajouter la variable secrète **`ANTHROPIC_API_KEY`** (sa clé actuelle).
4. Copier l'**URL du Worker** → la coller dans `AI_PROXY_URL` (constants.js) + déployer.
5. Tester le bilan photo **en 4G**.

## 6. Plan des 2 semaines (Michel sans 4G)
- [x] **Écrire `worker.js`** — relais générique (transmet à Apps Script, répond direct+CORS). ✅ 2026-07-13
      → Choix : **relais** (pas de duplication des prompts, aucune clé dans Cloudflare). Bien mieux que dupliquer les handlers.
- [x] **Ajouter `AI_PROXY_URL` + `_aiUrl()`** dans constants.js (vide par défaut = inerte). ✅
- [x] **Router bilan + programme + historique** via `_aiUrl()` (tracking.js, log.js). ✅
- [x] **Tester le repli** : `AI_PROXY_URL` vide → `_aiUrl()===S.url` (Apps Script), 0 erreur JS (Playwright). ✅ Prod strictement identique.
- [x] **Guide d'installation** → `GUIDE-CLOUDFLARE.md`. ✅
- [x] **Router TOUS les appels IA** via `_aiUrl()` (12 au total) — pas seulement bilan/programme : ✅ 2026-07-13
      `importBodyScan`, `importProgram`, `importHistory`, `importBloodTest`, `readBarcode` (code-barres photo), `foodLabel` (étiquette nutrition), `coach` (×2 : chat + analyse programme), `summarizeCoach`, `morphoAnalysis`, `bodyStudy` (×2 : étude + suivi photos). → le relais couvrira **tout ce qui échoue en 4G** (magasin = code-barres/étiquette compris).
      NON routés (volontaire) : `validateCode`, `loadProfile`, `saveProfile`(no-cors), `logSession`, `sendConfirmCode`… (auth/sync — petits ; à router aussi si besoin plus tard).
- [ ] (Quand 4G revient) Michel crée le Worker (coller `worker.js`) → me donne l'URL → je remplis `AI_PROXY_URL` → teste en 4G (bilan + code-barres + étiquette).
- [ ] Si OK en 4G : **réactiver le bouton photo bilan en prod** (retirer le gate `__FT_CLONE__`), promotion prod.

**État au 2026-07-13** : tout est PRÊT et ENDORMI. `worker.js` + guide à la racine. Les **12 appels IA** passent par `_aiUrl()` mais restent sur Apps Script tant que `AI_PROXY_URL=''` → aucun changement pour personne. Vérifié Playwright : `_aiUrl()===S.url`, 0 erreur JS. Il ne reste que les ~5 min de réglage Cloudflare de Michel (au retour de sa 4G) → et **code-barres + étiquette + bilan + coach + morpho** marcheront en 4G d'un coup.

## 7. Notes / risques
- **Pas testable en vrai avant le retour de la 4G de Michel** — on prépare, on ne promet pas que ça marche à 100 % tant que testé sur son réseau.
- Si Cloudflare ne suffisait pas → même principe avec Vercel/Deno Deploy (autre hébergeur direct).
- Coût : **0 €** (offre gratuite). Surveiller le quota si beaucoup d'utilisateurs (large marge).
- La lecture photo **exige un réseau** (IA distante) : hors-ligne total = « À la main » / CSV (déjà en place).
