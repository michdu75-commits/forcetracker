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
| 🔴 **Bouton FAB « + » capricieux** | Le « + » se décalait / recouvrait les séries / gênait le swipe | `position:absolute` + positionnement JS fragile | **Bouton docké dans la barre** (fini le FAB flottant) | Récurrent (règle d'or n°9) puis supprimé (v178) | ✅ **Résolu — revérifié par la mesure le 11/08/2026, voir ci-dessous** |
| 👤 **Diagramme muscles faux** | Muscles mal coloriés sur les machines/imports | Reconnaissance **sensible aux accents** + vocabulaire trop court | Normalisation `_naz` (sans accents) + `_MEX` enrichi | 84/87 exos reconnus (avant 50) | ✅ Résolu (v169) |
| ☀️ **Mode jour illisible** | Textes jaunes sur fond clair, blanc qui « pète les yeux » | Couleurs **écrites en dur** (pas de variable thème) + blanc pur | `var(--gold/--t1…)` + blanc adouci | v181→v183 | ✅ Résolu |
| 🕵️ **Fuite d'email sur le clone (iOS)** | L'email prod apparaissait sur le clone de test | La redéfinition de `localStorage` **échoue sur Safari iOS** | Fallback : préfixe `cl_` sur `Storage.prototype` + `__FT_CLONE__` posé en premier | 1 session | ✅ Résolu |
| 🔴 **Point rouge « nouveauté » qui reste** | Le point ne disparaissait pas après ouverture d'une rubrique | Oubli d'appeler `_markAnchorSeen()` à l'ouverture | Ajouté dans `openMiloKnows()` | 1 version | ✅ Résolu (v466) |
| 🎚️ **On optimisait un Milo que personne ne voyait** | L'« interrogatoire » revenait malgré **3 durcissements de prompt** (ft-v602/603/606) | **La variable cachée = le MODÈLE** : coach en modèle **léger par défaut** (suit mal les consignes fines), mais le fondateur testait sur le **haut de gamme** → on peaufinait une expérience que la majorité n'avait pas | **Défaut de la conversation coach monté au modèle intermédiaire** (worker.js) ; tâches utilitaires laissées sur le léger + **règle : évaluer Milo sur le modèle des VRAIS utilisateurs, pas celui du fondateur** | Plusieurs jours de prompt « pour rien » | ✅ Résolu (26/07) |
| 🤖 **La séance de Milo écrasée par l'ancienne** | Milo annonce « 4×6 — 60/70/80/85 kg », le bouton « Commencer cette séance » ouvre l'écran Séance **avec les valeurs de la séance précédente** (3×10 à 50 kg) → sa prescription était perdue | **Comportement copié d'un contexte à un autre** : `_startSessionFromMilo` reprenait le pré-remplissage de `loadProgDay` (`pp ? pp.kg : s.kg`) → l'historique gagnait TOUJOURS. Juste pour un **programme** (« 4×8 » sans charge → on reprend ta dernière perf), **faux pour Milo** qui choisit ses charges exprès (reprise, blessure à protéger) | **Inversion de priorité** : ce que Milo précise PRIME, l'historique n'est qu'un repli pour ce qu'il n'a pas précisé (+ défaut reps 10→0 pour distinguer « dit » de « pas dit »). Test négatif à l'appui (ancien code = 6/14) | 1 version | ✅ Résolu (ft-v625, 27/07) |
| 🚧 **GitHub Pages qui cesse de déployer, en silence** | Le site restait bloqué sur une vieille version (**ft-v600**, puis **ft-v616**) alors que les commits étaient bien poussés — aucune alerte | Le mode **« Deploy from a branch »** de Pages **arrête de construire** par intermittence (après beaucoup de pushes rapprochés) : les commits partent sur `master` mais **aucun run « pages build and deployment »** n'est créé. Symptôme trompeur : on croit que c'est le **cache du téléphone**, alors que c'est le serveur | **Bascule en déploiement par GitHub Actions** : workflow `.github/workflows/deploy-pages.yml` (`configure-pages` + `upload-pages-artifact` + `deploy-pages`) → build **fiable à chaque push** + **relançable à la main** (`workflow_dispatch`). Diagnostic clé : **vérifier le run Actions** (API `actions_list`), ne jamais se fier à « j'ai poussé » | 2 blocages (24/07 ft-v600, 26/07 ft-v616), ~2 jours perdus | ✅ Résolu pour de bon (ft-v619, 26/07) |
| 🫙 **Le réservoir plein — plus AUCUNE écriture serveur, en silence** | Depuis le 29/07 : boîte à idées muette (le signalement de Christophe perdu), mails morts, **sync cloud des gros comptes figée** — pendant que l'app affichait « envoyé ✅ » et « connecté ✓ » partout | **Les comptes vivent dans les Script Properties, plafonnées à 512 Ko AU TOTAL** : le réservoir a débordé (524 Ko, dont Christophe 278 Ko à lui seul) → tout `setProperty` échouait, avalé par des `catch` vides et le no-cors. **Pannes gigognes** : une révocation d'autorisation Gmail (réparée par `authorizeMail`) masquait la vraie panne, découverte seulement en remontant « pourquoi la boîte est figée au 29/07 ? » | **Sondes d'abord** (`storeHealth` : remplissage + test d'écriture réelle + top des clés), **puis compression** : comptes stockés gzip+base64 (`GZ:`, ~4×), pack **auto-vérifié** (jamais écrit s'il ne se relit pas à l'identique), rétrocompatible, les 3 lecteurs équipés (load, backup nocturne, liste admin) + migration one-shot `compressStore`. 414 Ko → 99 Ko. **Leçons** : ① un stockage borné SANS jauge finit toujours par déborder en silence — poser la jauge AVANT le mur ; ② le local-first a sauvé les données (les téléphones avaient tout) ; ③ quand deux pannes se superposent, réparer la première ne clôt pas l'enquête tant que le symptôme d'origine n'est pas revenu au vert | 2 jours de panne invisible, 1 soirée d'enquête | ✅ Résolu (31/07) — ⏭️ vrai fix : déménager les comptes sur le Drive (pas de plafond) |

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
| 🚨 **Worker IA GRAND OUVERT** (audit 27/07) | Aucune vérif d'origine (CORS `*`), aucun quota sur ce chemin (celui d'Apps Script est contourné) → **n'importe qui avec l'URL peut consommer l'API Anthropic aux frais de Michel** (coach = Sonnet, imports 8192 tokens). Le quota « 10 questions » est côté client seulement | **✅ VERROU DÉPLOYÉ (27/07, Michel présent)** : allowlist d'origine (`ALLOWED_ORIGIN` = github.io, couvre prod + clone), testé en local 9/9 (curl/origine inconnue → 403 avant tout appel payant ; app légitime passe). Validé sur device par Michel. Complément recommandé (plus tard) : règle de rate-limiting dans le dashboard Cloudflare + rollback 1 ligne (`git revert`) |
| 🐌 `persist()` lourd et fréquent (audit 27/07) | Re-sérialise TOUT l'historique (≤1500 séances) à chaque appel (~180 sites, dont chaque série validée) → micro-freezes possibles sur vieux iPhone + gros historique | Fix futur : séparer clés « chaudes » (séance en cours) / « froides » (historique, débounce) |
| 🧠 **Le prompt de Milo NOIE la personne** (mesuré le 28/07) | Contexte ≈ **45 400 caractères** : **91 % de consignes**, **9 % de connaissance sur la personne** (144 lignes d'instructions, **42 « JAMAIS »**). Le problème n'est pas les 4 000 caractères de données, ce sont les 41 400 de consignes qui les **noient** — c'est **R20** appliqué à Milo lui-même. ⚠️ Ne pas mal lire : **48 des 90 données SONT transmises**, le 9 % est un volume de *texte* | **Le régime du prompt** (spécifié, pas commencé) : rendre les consignes **conditionnelles à la mission en cours**, avec un **plancher inconditionnel** — les règles de **sécurité** (blessures, contre-indications, Gardien) partent toujours |
| 🕳️ **3 trous de données connus** (garde-fou, 28/07 — le pire comblé en ft-v654) | ✅ `nextPlanned` **réglé** (Milo reçoit la séance annoncée ; l'Accueil et le chat lisent la même règle). Restent : ① `programmes` (il ne connaît pas ton planning) ② `customExercises` ③ `exRestPref` (240 s au squat, ignoré) | Les brancher un par un. Le garde-fou `node tests/donnees/runner.js` les compte à chaque livraison → ils ne peuvent plus être oubliés |
| 👁️ **Milo ne voit que les 5 dernières séances** (`S.sessions.slice(0, 5)`) | Contradiction directe avec la promesse « mémoire sportive » | À rouvrir **après** le régime du prompt (c'est la place gagnée qui permettra d'en envoyer plus) |
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

- **🔁💣 J'ai retapé DEUX FOIS dans le même piège, le lendemain de l'avoir gravé** (ft-v670, au lendemain de ft-v669). En ajoutant des mots-clés de schémas de mouvement : `'l sit'` (pour le L-Sit) attrapait **« wa·ll sit »** → `Chaise (Wall Sit)`, un squat isométrique, devenait du gainage ; et `'epaule'` (pour l'épaulé-jeté) faisait d'une **mobilité d'épaule** un mouvement d'haltérophilie **ancre**. Exactement le bug `t.?bar` → « poignet barre » corrigé la veille. → **Connaître la règle ne suffit pas.** Ce qui a sauvé la livraison, c'est que le **test mesurait « 0 exercice déjà classé ne change »** — il a signalé les deux avant le push. *La leçon n'est pas « faire attention », c'est « écrire le test qui compte les changements inattendus AVANT de toucher la table ».*

- **💣 Un motif sans limite de mot est une bombe à retardement** (ft-v669). `t.?bar`, écrit pour le « Rowing T-Bar », attrapait **« poigne·t bar·re »** : `Extension Poignet Barre` et `Curl Poignet Barre` étaient classés en **dorsaux/trapèzes** depuis des mois — figurine fausse, calories fausses, Milo mal informé. Aucun test n'a bronché, parce que **personne ne regarde la figurine d'un curl de poignet**. → Dans un motif de reconnaissance, **toujours borner** (`\b`) ; et se demander quel autre mot du catalogue pourrait contenir la séquence par accident.

- **🔁 On mesure en appelant la VRAIE fonction, jamais une copie de sa logique** (ft-v669 — 3ᵉ fois cette semaine). Pour auditer la couverture de `_MOV_PATTERNS` j'ai réimplémenté la recherche de motif ; la vraie fonction passe par `_movNorm` (un radical par mot, donc tolérante aux pluriels). Résultat : **34 manques annoncés, 27 réels**. Même erreur que l'audit des données du 28/07 (19 faux positifs sur 25). → Un audit qui ne passe pas par le chemin de code réel produit un chiffre faux — et un chiffre faux annoncé coûte plus cher que pas de chiffre.

- **♊ Deux listes qui décrivent le MÊME monde divergent toujours** (ft-v667 → ft-v668). Il y avait `_MEX` (quels muscles travaille un exercice) **et** `LOWER_KW`/`UPPER_KW` (quelle intensité pour les calories) — deux façons parallèles de dire « ce mouvement est un gros mouvement du bas du corps ». La seconde a été oubliée pendant que le catalogue triplait : **142 exercices sur 249 tombaient sur la valeur par défaut**, dont 56 franchement faux (`Curl Incliné` compté comme un développé incliné parce qu'il contient « Incliné »). → Le remède n'est pas de **tenir à jour** la seconde liste, c'est de la **supprimer** et de dériver de la première (R2). Deux tables jumelles, c'est un bug à retardement, pas une redondance utile.

- **⏳ Un correctif « suffisant » à sa date se périme EN SILENCE** (ft-v667). En ft-v169 on avait enrichi la table des muscles : *« 84/87 exercices reconnus »* — vrai **ce jour-là**. Le catalogue a ensuite grossi jusqu'à 287 exercices, et personne n'a re-mesuré : **86 (30 %) n'avaient plus aucune correspondance**, figurine vide, sans qu'aucun test ne bronche. Michel : *« on en avait déjà parlé mais on n'est pas allé au fond des choses. »* → Le remède n'est pas de mieux corriger, c'est de laisser derrière soi un **compteur qui refuse de remonter** (ici `tests/muscles/runner.js`, seuil 0). **Tout correctif chiffré doit repartir avec sa mesure automatisée**, sinon le chiffre devient un souvenir.

- **🛡️ « Zéro régression par construction » vaut mieux que « zéro régression vérifiée »** (ft-v667). Les ~25 règles de rattrapage sont placées **à la fin** de la liste, et le moteur s'arrête au premier motif qui correspond : une règle générique **ne peut pas** voler un exercice à une règle précise. La vérification (0 exercice modifié sur 249) n'a fait que **confirmer** ce que la structure garantissait déjà. → Quand c'est possible, choisir un agencement où le bug est **impossible** plutôt qu'un agencement qu'on teste.

- **🗂️ Tester des ARCHÉTYPES n'est pas tester le CATALOGUE** (ft-v665 → ft-v666). Après avoir reclassé les érecteurs du rachis, j'avais comparé **9 types de séances** et annoncé « aucune couleur de calendrier ne change ». Michel : *« sur tous les mouvements tu as vérifié ? »* — non. Sur les **287 exercices** réels, **4 changeaient** (les mouvements de fessiers passaient de « full body » à « bas du corps » — un correctif, mais un changement quand même), et le passage complet a révélé au passage que **86 exercices (30 %) n'ont aucune correspondance musculaire**. → Quand une modification touche une **table de classification**, la passer sur **toutes les entrées réelles**, pas sur un échantillon choisi par soi-même. L'échantillon reflète ce qu'on imagine ; le catalogue reflète ce qui existe.

- **📚 Un mot de métier ne se choisit pas au jugé : on va voir comment le DOMAINE le dit** (ft-v665). Notre découpage musculaire (`haut`/`dos`/`bas`/`tronc`) venait d'un besoin d'**affichage** — colorier un calendrier — pas d'une classification du métier. Résultat : les érecteurs du rachis étaient rangés dans « dos », et une séance de jambes affichait « 15 % dos ». Les références du domaine sont pourtant claires : au squat ce sont des **stabilisateurs**, ils *participent du gainage*. → Quand un terme technique s'affiche à l'utilisateur, **vérifier le vocabulaire de référence** avant de le figer. Michel : *« je veux qu'on se rapproche le plus possible de sites reconnus »*. **Et mesurer l'impact avant de reclasser** : ici les 9 archétypes de séance ont été comparés avant/après, aucune couleur de calendrier ne bougeait.

- **📊 Quand on connaît le chiffre, on DONNE le chiffre** (ft-v664). L'app affichait « plutôt bas du corps » alors qu'elle calcule la répartition **au pourcentage près**. Michel : *« ça fait genre il ne connaît pas l'anatomie »*. Un adverbe (« plutôt », « environ », « globalement ») posé à la place d'une donnée qu'on possède ne rassure pas — **il fait douter de la compétence**. → Résumer une mesure exacte en mot vague, c'est l'abîmer. Réserver le flou aux cas où on est vraiment incertain (et là, se taire est souvent mieux : R29).

- **🏷️ Un nom de classe CSS se choisit comme un nom de fonction : en vérifiant qu'il n'existe pas déjà** (ft-v661). J'ai nommé les nouveaux boutons du check-in `.ds-opt` — nom **déjà pris** par le `(optionnel)` du titre. Résultat : un simple mot est devenu un gros bouton pleine largeur. Rien n'a planté, aucun test existant n'a bronché : **c'est la capture d'écran qui l'a montré**. → `grep` le nom avant de l'utiliser, et préfixer par famille (`ck-`, `ds-`, `cconv-`).

- **🔀 Deux chemins vers le MÊME écran doivent se comporter pareil** (ft-v657). La série avancée du questionnaire reprenait à la 1ʳᵉ question non répondue ; la série gratuite repartait de zéro. Même carte, même modale, deux règles — et c'est la version « gratuite » (donc celle que tous les utilisateurs voient) qui était la mauvaise. → Quand deux variantes partagent un écran, **vérifier qu'elles partagent aussi la règle**. C'est R2 appliqué au comportement, pas seulement aux données.

- **🚨 Un retour qui arrive juste après une livraison n'est pas forcément causé par elle** (ft-v657). Le bug est tombé au lendemain de la correction des dates, à 00 h 01 — la tentation de conclure « c'est ma faute » était forte. **Vérifié avant de coder** : le questionnaire ne s'ouvre jamais seul (testé à 00 h 01 et à midi) et la fonction touchée enregistre correctement. C'était un défaut présent depuis toujours. → **Écarter la régression par la mesure, pas par l'intuition** — dans les deux sens : ne pas s'accuser à tort, ne pas s'innocenter non plus.

- **👁️ Ce qui est AFFICHÉ n'est pas ce qui est GARDÉ** (ft-v656). Le fil de Milo était coupé à 20 messages **en direct**, mais les bulles restaient à l'écran (elles vivent dans la page, pas en mémoire) — donc la perte était **invisible jusqu'à la réouverture**. → Quand on cherche une perte de données, **ne jamais se fier à ce que montre l'écran** : lire ce qui est réellement stocké. Corollaire : mon diagnostic de la veille (« c'est fermer l'app qui coupe ») était faux, et je ne l'ai vu qu'en lisant le code ligne à ligne au lieu de raisonner sur le symptôme.

- **🤫 Un `catch(e){}` sur une écriture de stockage, c'est une perte totale programmée** (ft-v656). Si le téléphone manque de place, l'ancien code avalait l'erreur : **tout le fil disparaissait**, sans un mot. → Toute écriture qui peut échouer doit **dégrader** (réduire et réessayer), jamais abandonner en silence.

- **🕛 L'heure de Greenwich n'est pas l'heure de l'utilisateur** (ft-v655). `new Date().toISOString()` donne la date **UTC** : en France l'été, entre minuit et 2 h du matin, une séance était datée de **la veille**. Rien ne plante, la date est juste fausse. → **Un jour calendaire se calcule TOUJOURS à l'heure de l'appareil.** Figé par `tests/dates/runner.js` (horloge gelée sur les instants pièges + garde-fou de motif).

- **🧨 Un `const` de haut niveau n'est PAS sur `window`** (ft-v655, piège évité de justesse). En corrigeant une variable locale qui **masquait** la fonction globale `today()`, j'ai d'abord écrit `window.today()` — ça aurait planté la validation du questionnaire. Seuls `var` et les déclarations de fonction créent une propriété de `window`. → **Ne jamais « déshadower » avec `window.x` : renommer la variable locale.** Et ce genre de piège **ne se voit pas à la relecture, il se voit en exécutant**.

- **🧪 Un test doit être VÉRIFIÉ CONTRE LE CODE CASSÉ avant d'être cru** (ft-v655, leçon de ft-v646 enfin appliquée *avant* la livraison). J'ai remis l'ancienne version fautive : le test est passé de 7/7 à **2/7**. Sans cette étape, un test vert ne prouve rien — j'ai déjà écrit deux fois des tests qui passaient sans rien tester (des marqueurs qu'ils trouvaient dans mes propres commentaires).

- **🕳️ Le pire bug est celui qui ne se voit pas** (28/07/2026, le prénom → le garde-fou). Ajouter une donnée dans l'app **sans la transmettre à Milo** ne plante pas, ne lève aucune erreur, ne casse aucun test : Milo répond juste un peu moins bien. C'est arrivé **cinq fois** (charges, repos, ordre, consignes, prénom) avant qu'on comprenne que ce n'était pas de la négligence mais un **angle mort structurel**. → La parade n'est pas « faire plus attention », c'est un **garde-fou automatique** (`tests/donnees/runner.js`) qui refuse toute donnée **non classée** face à Milo. *On ne peut plus oublier — on peut seulement décider.*

- **🔍 Un audit qui cherche des NOMS dans le code se trompe ; un audit qui MESURE le résultat ne se trompe pas** (28/07/2026). Mon premier audit annonçait « 25 données manquantes » ; **19 étaient des faux positifs** — mes objets de test n'avaient pas la bonne forme, donc je concluais qu'une donnée n'était pas transmise alors qu'elle l'était. Le chiffre n'est devenu fiable qu'en **construisant le contexte réellement envoyé et en le lisant**. Même leçon la veille sur l'audit « données mortes » (4 tentatives, des dizaines de faux positifs — seul le motif non ambigu `S.objet.champ` était fiable). → **Ne jamais annoncer un chiffre d'audit obtenu par recherche de motifs : le vérifier sur la sortie réelle.** Et le dire quand on s'est trompé, tout de suite.

- **📣 Un même symptôme peut avoir QUATRE causes différentes** (ft-v640→644, « je ne vois pas le gris de l'anneau »). J'ai corrigé successivement un filtre SVG, une largeur, un empilement de calques — trois fois la **mécanique** — avant de remettre en cause la **matière** (du gris opaque sur un fond sombre est invisible sur un iPhone, quelle que soit la géométrie). Et c'est Michel, pas moi, qui a nommé la vraie solution (*« pourquoi pas mettre un léger blanc »*). → **Quand quelqu'un répète le même symptôme après trois correctifs différents, arrêter de raffiner et CHANGER D'HYPOTHÈSE.**

- **🖥️ Sur un rendu, seul l'écran de l'utilisateur fait foi.** Mes captures d'ordinateur montraient un anneau correct pendant que Michel ne voyait rien sur son iPhone. L'ordinateur ne sert qu'à vérifier qu'on **n'a rien cassé** — jamais à valider un rendu.

- **✅ Un test de PRÉSENCE passe très bien sur une carte qui affiche « NaN »** (ft-v646). 36 tests vérifiaient que les éléments existaient, aucun ne vérifiait que le **texte affiché est propre**. → Tout écran testé doit avoir au moins un test « ne contient ni `NaN`, ni `undefined`, ni `[object` ».

- **📋 Un comportement COPIÉ d'un contexte à un autre peut devenir FAUX** (ft-v625). Le pré-remplissage par l'historique est *juste* pour un programme générique (« 4×8 » sans charge) et *absurde* pour une prescription réfléchie de Milo (charges choisies exprès). → Avant de copier un bout de logique, se demander **« l'hypothèse de départ tient-elle encore ici ? »**.

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

### 🔁 Leçon croisée avec le projet de Tatiana (01/08/2026) — les mises à jour de PWA, vues deux fois

En aidant l'autre projet (même symptôme que nous en juillet : « il faut vider le cache pour
mettre à jour »), l'échange avec l'IA d'en face a produit **trois idées qui nous manquent ou
qu'on ne fait qu'à moitié** :

1. **Le cache se règle aussi CÔTÉ SERVEUR** (`Cache-Control: no-cache` sur `sw.js` et
   `index.html` uniquement — le reste garde son cache long). `updateViaCache:'none'` ne protège
   que les appareils qui ont DÉJÀ la version qui le porte ; l'en-tête serveur protège tout le
   monde. ⚠️ **GitHub Pages ne permet PAS d'en-têtes personnalisés** (cache ~10 min imposé) —
   c'est une des raisons de considérer Cloudflare Pages si on migre un jour l'hébergement.
2. **« Prouvé par sabotage »** : chaque protection doit avoir un test qu'on a VU échouer en
   cassant le code exprès — une vérification qui n'a jamais crié ne vérifie rien. (Nous : c'est
   notre « contrôle négatif », à maintenir systématique.)
3. **Un écran ne doit jamais mentir** : liste vide ≠ échec de lecture ; une erreur doit se voir
   (même un simple ⚠ à côté du numéro de version) ; un écran muet est pire qu'un écran qui se
   trompe. À garder en tête pour chaque nouvel écran.

**Et l'anti-mythe, dit honnêtement** : « c'est la dernière fois qu'on vide le cache » n'est vrai
que pour LA panne couverte (le cache HTTP de `sw.js`). Un appareil coincé sur une version
d'AVANT le correctif doit être débloqué à la main UNE fois — aucun nouveau code ne peut sauver
un appareil qui refuse d'aller le chercher. Et il reste des cas hors de portée : iOS qui purge
le stockage, un service worker cassé livré par erreur, quelqu'un qui re-casse les en-têtes plus
tard (d'où le n° de version toujours visible + les tests par sabotage).

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

---

## 🎨 La contrainte IMAGINAIRE — « je pensais qu'on était limité en graphisme » (27/07/2026)

**La galère la plus coûteuse du projet, et personne ne l'avait vue** — parce qu'elle ne produisait
aucun bug, aucune erreur, aucun symptôme.

**Ce qui s'est passé.** Michel a conçu Force Tracker pendant des semaines en croyant que l'app était
**bridée graphiquement** (« on est vachement limité avec canvas »). Conséquence, dans ses mots :
*« depuis le début je pensais que j'étais limité, et donc je me limitais dans mon idée du graphisme »*.
Une maquette a même été rejetée le 21/07 (*« le cercle n'a rien à voir, il n'y a pas de profondeur »*)
en attribuant l'échec à une limite technique.

**La vérité, vérifiée le 27/07 :** l'app n'utilise **pas** `<canvas>` pour son interface.
**104 `<svg>`** dans `index.html` ; les 17 `getContext('2d')` servent uniquement à **traiter des images**
(redimensionner une photo, masquer le bilan sanguin, la caméra, le logo). Dégradés, ombres, halos,
profondeur, flou d'arrière-plan, animations, formes organiques : **tout était faisable depuis le début**,
en CSS et SVG, pour un coût nul.

**Pourquoi ça n'a pas été détecté plus tôt** : une contrainte imaginaire ne casse rien. Elle ne remonte
ni dans les tests, ni dans les retours utilisateurs, ni dans les audits. **Elle se manifeste uniquement
par ce qui n'est PAS demandé** — et ça, aucun outil ne le mesure.

### ➡️ Le réflexe à garder
Quand quelqu'un dit *« on ne peut pas »*, *« on est limité par… »* ou *« ça, c'est pas possible avec
notre techno »* — **vérifier dans le code avant d'accepter**. Une limite non vérifiée devient une règle
de conception silencieuse, et elle ne coûte pas une heure : elle coûte tout ce qu'on n'a jamais imaginé.

*(Même famille que les 8 détecteurs trop grossiers de la même soirée, mais bien plus grave : là, c'est
une croyance qui a orienté le produit, pas un chiffre faux dans un rapport.)*

---

## 🔴 Le bouton « + » de la barre — vérification de clôture (11/08/2026)

**Michel** : *« confirme-moi qu'il est bien fixé à la barre en bas avec Accueil, Progrès etc. ; si
c'est le cas ce problème est résolu. »* **Vérifié, et par la mesure — pas à l'œil :**

| Ce qu'on a vérifié | Résultat |
|---|---|
| Le « + » appartient-il à la barre ? | ✅ **Oui** — c'est un enfant du `<nav>`, exactement comme Accueil et Progrès |
| Est-il encore positionné en JavaScript ? | ✅ **Non** — `position: relative`, plus aucun calcul (avant : `absolute` recalculé à la main) |
| Est-il aligné avec les autres ? | ✅ **3ᵉ de 6**, tous larges de 56 px, régulièrement espacés : `26 · 82 · 139 · 195 · 251 · 308` |
| Déborde-t-il de la barre ? | ✅ **Non** — la barre va de 770 à 844, le bouton de 792 à 836. Entièrement dedans. |
| Bouge-t-il quand on fait défiler l'écran ? | ✅ **Non** — `139,792,56,44` avant, `139,792,56,44` après 600 px de défilement |

*(Il est 3 px plus haut que ses voisins — 792 contre 795 — parce qu'il fait 44 px de haut contre 41 :
c'est le relief voulu, pas un décalage.)*

**➡️ La galère est close pour de bon.** Les trois symptômes d'origine — il recouvre les séries, il
gêne le swipe, il se décale — ne peuvent plus revenir : ils venaient tous du **flottement**, et il ne
flotte plus. Un élément posé dans une rangée ne peut pas recouvrir ce qui est au-dessus de lui.

### ⚠️ La vraie leçon : **la règle a survécu à son propre bug pendant des mois**

Le problème a été réglé **à la racine en v178** (suppression du bouton flottant). La **règle d'or n°9**,
elle, a continué d'exiger de vérifier `_positionFab()` — une fonction qui cherche `#fab-session`,
un élément **qui n'existe plus**, et qui **sort donc immédiatement sans rien faire**.

Pendant tout ce temps, à chaque modification de l'écran Séance, la consigne était d'aller vérifier
**un fantôme**. Personne ne s'en est aperçu, parce qu'une règle qui ne sert à rien ne casse rien :
elle coûte juste de l'attention, et — plus grave — elle **rassure à tort**. On croyait vérifier.

*Une règle née d'un bug doit être relue le jour où le bug est supprimé à la racine* : soit elle
disparaît avec lui, soit elle change de moyen. Ici c'est le second cas — le bouton central reste le
repère le plus sensible de l'écran Séance — alors on garde la règle et on change **comment** on la
vérifie : **relever la position réelle avant/après, et exiger l'égalité** (témoin permanent dans les
tests de parcours depuis ft-v825).

*(Retiré de la règle sur décision de Michel, 11/08/2026. `_positionFab()` reste dans `app.js`,
inoffensif — le supprimer est une décision séparée.)*

---

### ⏱️ Une séance REJOUÉE a une durée qui ne veut rien dire (confirmé le 15/08/2026)

**Le cas.** Séance du 04/07 : l'app affichait **19 min pour 16 séries validées** — 1,2 minute par
série, physiquement impossible. Sa montre, elle, avait relevé **31 min**.

**La cause, donnée par Michel lui-même** : *« c'est quand j'ai perdu la séance, et j'ai
recommencé »*. Il a **ressaisi** ses séries après coup. Le chrono a donc mesuré le temps de la
**saisie**, pas celui de l'entraînement.

**Ce qu'on en retient.** Il existe **trois** façons pour une durée d'être fausse, et elles ne se
ressemblent pas :

| Cause | Symptôme | Exemple vécu |
|---|---|---|
| Le chrono **continue** de tourner | durée énorme | 12/07 — 4 h 14 pour 14 séries |
| Le chrono **démarre en retard** | durée courte | 10/07 — 124 min affichées, 47 réelles |
| La séance est **rejouée** après une perte | durée = temps de saisie | 04/07 — 19 min pour 16 séries |

**Le même repère les trahit toutes** : le **temps par série**. C'est pour ça que le garde-fou de
ft-v868/869 est bâti dessus et pas sur la durée brute.

⚠️ **Et une séance rejouée ne peut PAS être devinée** : personne ne sait ce qu'elle a duré. C'est
exactement le cas pour lequel la **saisie manuelle de la durée** (ft-v852) avait été construite —
on demande, on n'invente pas (R8).
