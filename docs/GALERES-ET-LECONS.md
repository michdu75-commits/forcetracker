# 🧨 Galères & leçons — Force Tracker  ·  *le Journal d'expérience*

> **À quoi sert ce fichier.** Ce n'est pas un journal de bugs : c'est la **mémoire
> d'expérience** du projet — *comment Force Tracker est devenu plus robuste*. Il
> raconte ce qui nous a fait galérer (pourquoi, la solution, le coût en versions),
> mais aussi les **décisions qu'on ne regrette pas**, les **fausses bonnes idées**,
> ce qui **reste ouvert** et ce qui **pourrait manquer**. But : que Claude (et
> Michel) ne re-tombent pas dans les mêmes trous — et se souviennent **pourquoi**
> telle architecture a été retenue ou abandonnée. *(Cadrage suggéré par ChatGPT,
> 19/07/2026 : « la mémoire des erreurs évitées vaut autant que celle des
> réussites ».)*
>
> ⚠️ Les « temps » sont **approximatifs** — mesurés en **nombre de versions
> `ft-vNN`** et de sessions, car on n'a pas de chrono précis. Un gros nombre de
> versions = un vrai combat.

---

## 1. Les GROSSES galères — RÉSOLUES

| Sujet | Le problème | Cause réelle | Solution | Ampleur | Statut |
|---|---|---|---|---|---|
| 🔇 **Son du timer coupait la musique iPhone** | Le décompte de repos coupait la musique de fond (Spotify…) et ne la relançait pas | Sur iOS, la **simple création d'un `AudioContext`** coupe la musique de fond | Timer rendu **100 % silencieux** (zéro audio, vibration + flash vert seulement) | **~10 versions** (v137→v166), 2 rollbacks | ✅ Résolu (v166) |
| 📵 **« Load failed » en 4G/5G** | Photos (bilan, code-barres, étiquette) + Coach échouaient hors wifi | Le POST vers **Google Apps Script casse sur cellulaire** (redirection vers `googleusercontent.com`) | **Cloudflare Worker** (worker.js) qui appelle l'API Anthropic en direct ; toutes les actions IA passent par lui | **~24 versions** (v411→v434), tests A/B sur le clone | ✅ Résolu (v434) |
| 📲 **App iOS collée à une vieille version** | Après un déploiement, l'iPhone gardait l'ancienne app | `sw.js` mis en **cache HTTP** par le navigateur (~10 min GitHub Pages) | `register('./sw.js',{updateViaCache:'none'})` | 1 version | ✅ Résolu (v191) — *mais le décalage existe encore le temps que l'update s'active (cf. §2)* |
| 💾 **Perte / écrasement de données cloud** | Un push « vide » pouvait écraser des données remplies | Pas de garde-fou côté backend | Garde-fous `_ps_/_pn_/_pa_/_po_` (une valeur vide n'écrase jamais une valeur remplie) | Plusieurs incidents (v154, v160) | ✅ Résolu + restaurations faites |
| 🧨 **Backend qui tombe entièrement** | Tout le backend HS (`window is not defined`), sync/Milo cassés pour tous | `clasp push` envoyait des **fichiers frontend** dans Apps Script (`clone/`, `lib/`) | `.claspignore` corrigé ; **ne pousser QUE `Code.js` + `appsscript.json`** | 1 grosse panne (2026-07-07) | ✅ Résolu |
| 🚀 **Déploiement Apps Script « fantôme »** | Le code poussé ne partait pas en prod | `clasp push` ≠ redéployer la web app | `deploy -i <ID>` + vérifier `?test=1` — **puis auto-déploiement GitHub Action** | Récurrent au début | ✅ Résolu + automatisé |
| 👻 **Trigger fantôme PREMIUM_EMAILS** | La whitelist premium se réinitialisait toute seule | Un **trigger installable inconnu** (invisible depuis clasp) réécrivait la propriété | `PREMIUM_HARDCODED_` (priorité absolue) + `ensurePremiumEmails_()` + purge des triggers | Plusieurs sessions d'enquête | ✅ Neutralisé |
| 🍎 **Séance coincée / erreurs invisibles iOS** | Écran figé, séance impossible à finir, bugs sans message | Erreurs **TDZ** (`_isIOS`/`_obGender`/`_premiumPending` doublons & ordre) propres à Safari | Passage en `window.*`, dé-doublonnage, try/catch par champ | **~8 versions** (v144→v153) | ✅ Résolu |
| 🖼️ **Images re-téléchargées à chaque MAJ** | 15 Mo d'images retéléchargés à chaque update (data mobile) | Code **et** images dans le **même** cache versionné (vidé à chaque bump) | **Deux caches** : code versionné (`ft-vNN`) + images stable (`ft-images`, jamais vidé) | 1 version | ✅ Résolu (v437) |
| 📦 **Le précache saturait la 4G** | Le téléchargement auto des images plombait la 4G → « Load failed » | Auto-précache de 15 Mo à chaque MAJ | Précache **résumable, en arrière-plan, 1×/version** (marqueur) | v421→v436 | ✅ Résolu |
| ⬜ **Écran blanc sur réseau faible** | L'app restait blanche en salle (sous-sol) | Polices **Google Fonts** en `@import` **bloquantes**, non mises en cache | Polices **hébergées en local** (`fonts/`) | 1 version | ✅ Résolu (v162) |
| 📄 **Import de journal tronqué** | Gros journal (18 séances) → « JSON invalide » | Réponse IA dépassait `max_tokens` → JSON coupé | Découpage en **lots de 3 pages**, fusion | 1 version | ✅ Résolu (v167) |
| 🔴 **Bouton FAB « + » capricieux** | Le « + » se décalait / recouvrait les séries / gênait le swipe | `position:absolute` + positionnement JS fragile | **Bouton docké dans la barre** (fini le FAB flottant) | Récurrent (règle d'or n°9) puis supprimé (v178) | ✅ Résolu |
| 👤 **Diagramme muscles faux** | Muscles mal coloriés sur les machines/imports | Reconnaissance **sensible aux accents** + vocabulaire trop court | Normalisation `_naz` (sans accents) + `_MEX` enrichi | 84/87 exos reconnus (avant 50) | ✅ Résolu (v169) |
| ☀️ **Mode jour illisible** | Textes jaunes sur fond clair, blanc qui « pète les yeux » | Couleurs **écrites en dur** (pas de variable thème) + blanc pur | `var(--gold/--t1…)` + blanc adouci | v181→v183 | ✅ Résolu |
| 🕵️ **Fuite d'email sur le clone (iOS)** | L'email prod apparaissait sur le clone de test | La redéfinition de `localStorage` **échoue sur Safari iOS** | Fallback : préfixe `cl_` sur `Storage.prototype` + `__FT_CLONE__` posé en premier | 1 session | ✅ Résolu |
| 🔴 **Point rouge « nouveauté » qui reste** | Le point ne disparaissait pas après ouverture d'une rubrique | Oubli d'appeler `_markAnchorSeen()` à l'ouverture | Ajouté dans `openMiloKnows()` | 1 version | ✅ Résolu (v466) |

---

## 2. Galères RÉCURRENTES / structurelles (le fond)

- **🍎 iOS Safari = bugs SILENCIEUX.** `position:fixed/sticky`, audio, `localStorage`,
  `getBoundingClientRect`, TDZ… Beaucoup de bugs n'apparaissent QUE sur iPhone et
  **sans erreur console**. → **Toujours faire valider par Michel sur iPhone** avant
  de dire « fini » (Playwright/Chromium ne suffit pas).
- **📡 Le réseau de Michel (La Réunion, 4G faible).** Le facteur aggravant de
  beaucoup de galères. Tout ce qui dépend du réseau doit être **local-first** et
  tolérant.
- **📲 Le décalage de version.** Les utilisateurs (dont Michel, **sur ft-v455**
  aujourd'hui) restent parfois plusieurs versions en arrière → ils testent des
  bugs **déjà corrigés**. Toujours **vérifier la version affichée** avant de
  débugger (Menu → bas de page).
- **📄 Un seul énorme `index.html`.** Tout le HTML dans un fichier géant → bugs
  collatéraux, coûteux à faire évoluer. (Priorité n°1 de la feuille de route.)
- **🏷️ Un exercice = juste un nom.** Pas de « fiche » (muscles, matériel,
  contre-indications) → tout est **deviné** (fragile). Fondation manquante.
- **🔴 Le système de points rouges** (onglet vs ligne) est **peu intuitif** : le
  point de l'onglet Menu s'additionne (reste tant qu'UNE nouveauté n'est pas
  ouverte), ce qui déroute (cf. la question de Michel du 19/07).

---

## 3. Problèmes ACTUELS (ouverts)

| Problème | Détail | Piste |
|---|---|---|
| 🔴 Point rouge onglet Menu | S'additionne → peut sembler « bloqué » | Simplifier (ex. s'efface dès qu'on ouvre le Menu) — **à décider** |
| 🛡️ Le Gardien pas construit | La sécurité « adapter pas interdire » est dans le prompt, pas encore un vrai moteur | Brique 6 (gros chantier) |
| 🏷️ Fiche exercice structurée | Manque — bloque faits/observations/Gardien fiables | Fondation transverse à prévoir |
| 🧱 `index.html` monolithe | Difficile à maintenir | Découpage en modules |
| 👤 Profil « usine à gaz » | Grossit (identité/objectif/discipline/niveau/ADN/santé…) | Hiérarchiser essentiel/avancé ; à terme profil conversationnel |
| 🎞️ Guide de l'app incomplet | Slides ADN & autres = captures manquantes | **Michel fournit les captures** |
| 💳 Offre débutant 15,99€ | Pas encore branchée (mur premium) | Tarif Ko-fi à créer + wiring |
| 🧪 Tests iOS = manuels | Seul Michel valide Safari | Pas d'automatisation Safari |

---

## 4. Ce qui pourrait MANQUER (risques / angles morts)

- **🧪 De vrais tests automatisés iOS/Safari** (aujourd'hui : Playwright/Chromium
  + validation manuelle Michel).
- **🗄️ Une vraie base de données.** Le stockage backend repose sur des **Script
  Properties** (limite ~9 Mo, pas fait pour grossir). À migrer quand le nombre
  d'utilisateurs le justifiera.
- **📊 Du monitoring / des alertes.** On découvre les pannes backend **par
  hasard** (ou via un utilisateur). Rien ne prévient si `?test=1` tombe.
- **🔄 Une restauration testée régulièrement.** Les backups Drive existent, mais
  on ne teste pas souvent qu'une **restauration complète** fonctionne.
- **📈 Des statistiques d'usage.** On ne sait pas quelles fonctions sont
  réellement utilisées → dur de prioriser objectivement.
- **🧭 Un onboarding « nouveaux » guidé** (au-delà du guide-film) et un « quoi de
  neuf » pour les anciens plus visible.

---

## 5. Leçons transverses (réflexes pour Claude)

1. **Toujours bumper `sw.js` (`ft-vNN`)** à chaque changement d'asset — et se
   souvenir que l'update iOS peut **traîner** (vérifier la version affichée).
2. **Jamais d'audio dans le timer** (coupe la musique iPhone).
3. **IA en 4G → passer par le Cloudflare Worker**, jamais Apps Script en direct.
4. **Garde-fous anti-perte** (`_ps_/_pn_/_pa_/_po_`) : une valeur vide n'écrase
   jamais une valeur remplie. Côté frontend, n'envoyer un objet que s'il a du
   contenu.
5. **`.claspignore`** : ne pousser QUE `Code.js` + `appsscript.json`. Vérifier la
   sortie de `clasp push`.
6. **Bumper `sw.js` avec un regex Python**, jamais `sed` (le `&` du remplacement
   corrompt la ligne — déjà arrivé).
7. **Deux caches SW** : code versionné (`ft-vNN`) / images stable (`ft-images`,
   jamais vidé).
8. **Tester sur iPhone avant de dire « fini ».** Les bugs iOS sont silencieux.
9. **Local-first** : enregistrer en local AVANT toute synchro ; le réseau ne doit
   jamais bloquer ni faire perdre une donnée.

---

## 6. ✅ Décisions qu'on ne regrette PAS (les choix structurants)

> Les choix qui ont **réellement** rendu Force Tracker meilleur / plus fiable.
> À **préserver** — ne pas défaire par confort ou par « puisqu'on y est ».

- **Local-first** (zéro perte de séance) — on enregistre en local AVANT toute
  synchro ; le réseau ne bloque jamais. C'est la priorité n°1 absolue.
- **La Constitution de Milo** — des principes stables, **indépendants du modèle
  d'IA**. Ils survivent aux changements de moteur.
- **La séparation des couches** — Profil (déclaré) / Faits (mesurés) / ADN
  (déclaré durable) / État du jour (ponctuel) / Observations (proposées→validées).
  Ne **jamais** les mélanger : c'est ce qui rend Milo clair et cohérent.
- **« Adapter plutôt qu'interdire »** (Principe 13) — le Gardien protège sans
  bloquer ; Milo ne devient jamais anxiogène.
- **« Milo propose, tu valides »** (brique 5A) — rien n'est mémorisé sans accord.
  Le cœur, c'est **la confiance**, pas la mémoire.
- **« Comprendre avant de conseiller » + le ressenti prime sur les chiffres** —
  ce qui a fait passer Milo de « chatbot » à « bras droit ».
- **Le Worker Cloudflare pour l'IA** — un chemin robuste (≠ Google) qui marche en
  4G/5G. A débloqué tout l'usage mobile.
- **Deux caches Service Worker** (code versionné / images stable) — plus de
  re-téléchargement des 15 Mo à chaque MAJ.
- **Les garde-fous anti-perte cloud** (`_ps_/_pn_/_pa_/_po_`) — une valeur vide
  n'écrase jamais une valeur remplie.
- **L'auto-déploiement backend** (GitHub Actions) — fini le PC + clasp à la main.
- **La méthode « une brique à la fois » + validation sur 4 axes** — la rigueur qui
  garde le projet propre et compréhensible.
- **`CLAUDE.md` relu à chaque session** — le contexte ne se perd jamais entre deux
  sessions.
- **Le bac à sable `/clone/`** — tester en conditions réelles sans casser la prod.
- **Vanilla JS, sans build** — simplicité, ouverture instantanée, zéro dépendance
  qui pourrit avec le temps.

---

## 7. ⛔ Fausses bonnes idées (séduisantes, mauvaises en vrai)

> Des idées qui semblaient bonnes… puis se sont révélées mauvaises **en
> conditions réelles**. Les garder ici évite de les re-tenter.

- **Mettre un son sympa dans le timer de repos** → sur iPhone, ça **coupe la
  musique de fond** (Spotify…). Abandonné : timer **100 % silencieux**.
- **Le « déblocage » audio iOS muet** (jouer un son muet au démarrage) → jouait le
  son **quand même** sur iOS récent + coupait la musique. Abandonné.
- **Faire passer toute l'IA par Google Apps Script** → **casse en 4G/5G**.
  Remplacé par le Worker Cloudflare.
- **Le FAB flottant « + »** (joli, au-dessus de la barre) → **recouvrait** les
  séries et **gênait le swipe**. Remplacé par un bouton **docké** dans la barre.
- **Précacher automatiquement toutes les images à chaque MAJ** → **saturait la
  4G** (« Load failed »). Rendu résumable / 1× par version.
- **L'auto-échec à l'import** (mettre la dernière série en « E » parce que le doc
  disait « à l'échec ») → **surprenait** l'utilisateur. Retiré (gardé en mémoire).
- **Un « moteur de décision » séparé** (comme une brique dédiée) → **doublonnerait
  le Gardien**. Décision : pas de brique séparée, c'est le rôle du Gardien.
- **Écrire une couleur de texte en dur** (hex) → **illisible en mode jour**.
  Toujours utiliser les variables de thème (`var(--…)`).
- **Charger les polices via `@import` Google Fonts** → **écran blanc** sur réseau
  faible. Polices **hébergées en local**.
- **Intégrer la silhouette féminine** (`female-body.png`) → échecs iOS WebKit
  (filtre CSS sur `<image>`). Laissé en code mort ; silhouette unique pour l'instant.
- **Les pistes XHR / AbortController** pour l'envoi du bilan corporel → abandonnées
  (code mort `_postBodyScan`/`_xhrPostText`). La vraie cause était le réseau (4G).
- **« Milo retient tout seul » sans validation** (aller direct à la 4B) → jugé trop
  risqué (il peut mémoriser du faux). On fait **5A (propose/valide)** d'abord.

---

*Fichier vivant — à compléter à chaque nouvelle galère (§1), décision structurante
(§6), fausse bonne idée (§7), et à chaque problème ouvert du §3 qui se résout.*
