# 🔴 ALERTE SÉCURITÉ — trois failles (1 corrigée, 2 restantes)

> **Trouvé le 04/08/2026.** La première (la boîte à idées) a été trouvée en cherchant à lire les
> idées depuis la session Claude ; **la seconde (les comptes entiers) en vérifiant la première** —
> et c'est la plus grave des deux.
> **État : NON CORRIGÉ.** Ce fichier se supprime le jour où c'est réglé.

---

# ✅ FAILLE N°0 — SEPT anciens déploiements en ligne *(la plus concrète — **CORRIGÉE le 04/08**)*

> **Trouvée le 04/08 au soir, en cherchant autre chose.** C'est la seule des trois qui ne demande
> **rien** : ni jeton, ni adresse connue — juste l'URL, qui ne change jamais.

## Ce qui a été constaté

Sur le compte **michdu75@gmail.com** (et non `forcetracker.app@gmail.com` qui porte la production),
**deux anciens projets Apps Script** sont restés en place :

| Projet | Identifiant | Déploiements ACTIFS |
|---|---|---|
| Force Tracker v3.1 | `1shyXEpGt4wS1jcyFafP6-9C9etXhXOIqZ0WFV1LaQdFgQrWOmutVwQK6` | **1** (« Force tracker », 12 juin 2026) |
| Force Tracker v3.2 | `1iXZo4_kiiYYJ8uPeJQuU18L8NZ3clf1d9lyo1k6FFHYywTvf4gQZGnSq` | **6** (v3.4, 2× « Sans titre », 3× « force tracker ») |

**Les deux contiennent des clés `u_…` — donc de vrais comptes utilisateurs.** (Moins que la v3.5 :
la plupart des comptes se sont créés après juin.)

## Pourquoi c'est pire que les deux autres

Le code de la v3.1 est visible sur la capture du 04/08 :

```js
if (p.action === 'loadProfile' && p.email) {
  const email = (p.email || '').toLowerCase().trim();
  const data = loadUserData_(email);      // ← AUCUN _authCheck_
```

Le **code d'accès personnel n'existait pas** en juin. Donc :

> ⚠️ **Un compte protégé aujourd'hui ne l'est PAS sur ces déploiements.** La protection vit dans les
> Script Properties du projet v3.5 ; ces projets-là ont les leurs, sans aucun verrou.

**Un déploiement Apps Script reste en ligne indéfiniment.** Personne ne le surveille, il n'apparaît
dans aucun tableau de bord, et il continue de répondre des années après qu'on l'a oublié.

## Ce qui limite la casse

Les données datent du **12-14 juin**. Les fonctions de santé sont arrivées en **juillet** (import de
bilan sanguin ft-v313 le 08/07 · bilan corporel @69 le 07/07). Ces projets **ne peuvent donc pas
contenir** de bilans sanguins, de bilans corporels ni de données de cycle : profil de base, séances,
records et poids de juin.

## Le correctif — 2 minutes, aucun risque

Aucune des 7 URL n'est celle de la production (`AKfycbwUsEFIlmx…`) : **les couper n'a aucun effet sur
l'application.**

Dans chaque projet : **Déployer → Gérer les déploiements → sélectionner un déploiement actif →
icône « archiver »**. Répéter pour les 7. *C'est l'archivage qui coupe l'URL* — la suppression du
projet vient après, si on veut.

## ✅ FERMÉE le 04/08/2026 au soir

| Projet | État |
|---|---|
| **v3.1** (`1shyXEpGt4…`) | ✅ **« Aucun déploiement actif »** — vérifié sur capture. L'URL est devenue une *Bibliothèque* au lieu d'une *Application Web*. |
| **v3.2** (`1iXZo4_kii…`) | ✅ **« Aucun déploiement actif »** — les 6 archivés un par un. |

**Les 7 URL sont coupées.** Aucune n'était celle de la production : l'application n'a pas bougé.

⚠️ **Les projets ne sont PAS supprimés, et c'est bien.** Ils gardent leurs Script Properties (des
comptes de juin) hors ligne. Si un jour on veut vraiment faire le ménage, on supprimera — mais rien
ne presse, et un projet supprimé emporte ses données avec lui.

### Les deux repères, pour ne pas s'y reprendre à quatre fois la prochaine fois

1. **Archiver le PROJET n'est pas archiver le DÉPLOIEMENT.** Le premier range, le second coupe le
   service. Seul le second ferme la porte.
2. **Google renvoie le même message** — *« Désolé, le fichier que vous avez demandé n'existe pas »* —
   pour une **URL invalide** et pour un **déploiement fermé**. Notre premier test a donc conclu
   « c'est fermé » alors que rien ne l'était : l'URL avait été recopiée **tronquée**. *Un test dont
   deux causes différentes produisent le même résultat ne teste rien.*

**Le repère qui, lui, ne ment pas** : la colonne **Actif** doit afficher *« Aucun déploiement actif »*.

## La leçon, plus large que le cas

*Une version qu'on abandonne ne s'arrête pas toute seule.* On a migré de v3.1 → v3.2 → v3.5 en
laissant chaque étage allumé derrière soi. **À ajouter au rituel de migration : archiver l'ancien
déploiement fait partie du déménagement, pas des finitions.**

---

# ⚠️ FAILLE N°1 — n'importe qui peut télécharger un compte entier

## Ce qui est accessible

Un simple appel **GET, sans aucun jeton** :

```
…/exec?action=loadProfile&email=UNE_ADRESSE
```

renvoie **tout le compte** de cette personne : `profile`, `prs`, `sessions`, `weightLog`,
`sleepLog`, `dayStateLog`, `cycle`, `programmes`, `nutritionPhase`…

Et l'objet `profile` contient **54 champs**, dont :

| Catégorie | Champs |
|---|---|
| **Santé** | `bloodTests` (bilans sanguins) · `healthProfile` · `bodyScans` · `bodyStudies` · `smoker` |
| **Intime** | `contraception` · `mensCycleStart` · `mensCycleDur` · `gender` · `bday` |
| **Corps** | `bw` · `waist` · `hip` · `neck` · `morpho` · `targetWeight` |
| **Mémoire de Milo** | `registre` · `coachMemory` · `adn` · `coachQuiz` |
| **Identité** | `name` · `age` · `workType` |

## Pourquoi ce n'est pas protégé

`_authCheck_` (Code.js) applique cet invariant, écrit exprès pour la rétrocompatibilité :

```js
if (stored.length < 20) return {ok:true, opted:false};   // pas de code → accès libre
```

**Un compte sans code d'accès personnel n'a AUCUNE protection.** Le code perso est **optionnel** —
donc presque personne ne l'a posé. L'invariant était un choix assumé (« ne jamais casser un compte
existant ») ; ce qui n'a pas été vu, c'est qu'il laisse la **lecture** ouverte, pas seulement
l'écriture.

## Ce qui rend l'exploitation triviale

**Six adresses e-mail réelles sont écrites en clair dans le dépôt public** :

- `Code.js` → `PREMIUM_HARDCODED_` : michdu75, elineazs32, christophe@famillelanglois.fr, apollonone75
- `constants.js` → `TESTER_EMAILS` : + emma.david16, tanna.valery.studio

Il n'y a donc même pas à deviner : **le dépôt publie les adresses, et l'API sert les comptes
correspondants.**

## 🚑 CE QUE MICHEL PEUT FAIRE TOUT DE SUITE, SANS DÉPLOIEMENT

**Poser un code d'accès personnel sur chaque compte.** C'est la seule mesure qui ferme la porte
immédiatement, et elle existe déjà dans l'app :

> Profil → « protéger mon compte » → vérification de l'e-mail → code (4 caractères minimum)

Dès qu'un code existe, `_authCheck_` bascule en mode vérification et `loadProfile` refuse sans lui.

⚠️ **À faire compte par compte** : le sien, puis demander à Christophe, Eline, Emma et Tatiana de le
faire. Un compte sans code reste ouvert.

## Le vrai correctif (nécessite un déploiement vérifié)

Inverser l'invariant pour la **lecture** : un compte sans code ne doit plus être lisible par un
simple GET. Deux pistes, à trancher par Michel :

1. **Exiger un secret d'appareil** — l'app en pose un au premier lancement et l'envoie à chaque
   `loadProfile`. Transparent pour l'utilisateur, ferme la porte à un tiers.
2. **Rendre le code d'accès obligatoire** à la prochaine ouverture. Plus sûr, mais impose une
   action à tout le monde — et la règle d'or n°3 dit que rien ne doit bloquer l'accès à ses données.

⚠️ Dans les deux cas, prévoir le chemin de **récupération** (e-mail de vérification, déjà en place)
avant de fermer quoi que ce soit — sinon on protège les données en les rendant inaccessibles à leur
propriétaire.

---

# ⚠️ FAILLE N°2 — la boîte à idées est lisible par n'importe qui

## Ce qui fuit, exactement

La route `?action=getIdees&token=…` renvoie **le tableau complet** des idées envoyées par les
testeurs. Chaque entrée contient :

```js
{ date, name, email, text, photos }   // Code.js, handleTesterIdea_
```

Donc : **le nom, l'adresse e-mail et le message** de chaque personne qui a utilisé la boîte à idées.
Jusqu'à **300 entrées** conservées.

## Pourquoi c'est accessible

Le jeton de lecture est vérifié par un **hash en dur** dans `Code.js` — ce qui était censé le
protéger. Mais **le jeton en clair est écrit dans `app.js`**, à trois endroits :

| Fichier | Ligne (au 04/08) | Route |
|---|---|---|
| `app.js` | ~2727 | `getIdees` |
| `app.js` | ~2763 | `getCustomEx` |
| `app.js` | ~2842 | `mailFails` · `aiUsage` · `storeHealth` |

Or `app.js` est :
- **servi publiquement** par GitHub Pages (c'est un fichier de l'app, il DOIT être téléchargeable) ;
- **et** présent dans un dépôt GitHub **public**.

Il n'y a donc aucun secret : le hash côté serveur ne protège rien, puisque la clé est distribuée
avec l'application. **C'est le défaut de conception, pas un oubli de configuration.**

> ⚠️ `CLAUDE.md` affirmait le contraire (« le token en clair n'est PAS dans le repo public, seul son
> hash ») depuis le 12/07. La phrase est corrigée. *Une note de sécurité fausse est pire que pas de
> note : elle clôt la question.*

## Ce que ça expose aussi

Le même jeton ouvre `storeHealth`, `mailFails`, `aiUsage` et `getCustomEx` — soit l'état du
stockage, les échecs d'envoi de mail et la consommation d'IA. Moins grave que les données
personnelles, mais ce sont des informations d'exploitation.

---

## Pourquoi ce n'est pas corrigé tout de suite

Décision prise le 04/08 au soir, Michel absent :

1. **Impossible de vérifier un déploiement backend depuis la session Claude web** — le domaine
   `script.google.com` est bloqué par la politique réseau de l'environnement (403 du proxy).
   Or la règle d'or n°1 et **R18** disent la même chose : on vérifie le *déploiement*, pas le push.
   Déployer une modification d'**authentification** sans pouvoir appeler `?test=1` derrière, c'est
   accepter de couper le backend pour tout le monde sans le savoir.
2. **Le risque de verrouillage** : une erreur ferme aussi l'accès de Michel à ses propres outils
   d'administration.
3. La fuite existe **depuis le 12/07** ; une nuit de plus ne change pas l'ordre de grandeur du
   risque, alors qu'un correctif bâclé, si.

*Ce n'est pas une raison de laisser traîner : c'est une raison de le faire éveillé.*

---

## Le correctif recommandé (≈ 20 min, à faire depuis le PC)

**Le principe** : aucun secret ne doit vivre dans le frontend. Le jeton se **tape une fois** et
reste sur le téléphone de Michel.

### 1. Côté serveur (`Code.js`)

Remplacer la vérification par hash en dur par une lecture de Script Property, avec repli explicite :

```js
// Le secret ne vit QUE dans les Script Properties — jamais dans le repo, jamais dans app.js.
function _checkIdeesTok_(t) {
  const want = PropertiesService.getScriptProperties().getProperty('IDEES_TOKEN2');
  if (!want) return false;              // pas de propriété = route FERMÉE (et non « ouverte »)
  return String(t || '') === want;      // plus de hash : le secret n'est plus distribué
}
```

⚠️ **Le repli doit être `false`.** Le réflexe habituel (« si la config manque, on laisse passer »)
transformerait une propriété effacée en porte ouverte — c'est exactement le problème d'aujourd'hui.

### 2. Poser la propriété

`script.google.com` → Paramètres du projet → Propriétés du script →
`IDEES_TOKEN2` = une chaîne longue et aléatoire (30+ caractères, générée au hasard).

### 3. Côté app (`app.js`)

Retirer les 3 `FT_IDEES_2026` et lire un jeton saisi une seule fois :

```js
function _adminTok(){
  let t = localStorage.getItem('ft4_admin_tok') || '';
  if(!t){ t = (prompt('Jeton admin (une seule fois sur cet appareil)')||'').trim();
          if(t) localStorage.setItem('ft4_admin_tok', t); }
  return t;
}
```

### 4. Vérifier — dans cet ordre

1. `?test=1` renvoie `{"status":"online"}` (le backend n'est pas tombé) ;
2. `?action=getIdees&token=LE_NOUVEAU` renvoie les idées ;
3. `?action=getIdees&token=FT_IDEES_2026` renvoie `{"error":"token"}` — **c'est ce test-là qui
   prouve que la fuite est fermée**, les deux autres ne prouvent rien ;
4. dans l'app : Profil → Admin → « 📥 Voir les idées reçues » demande le jeton, puis fonctionne.

### 5. Après coup

- Supprimer ce fichier et l'entrée correspondante de `CLAUDE.md` ;
- Ajouter un test qui refuse la présence de la chaîne `FT_IDEES_2026` (ou de tout jeton en clair)
  dans les fichiers frontend — *ce qui a manqué ici, c'est un contrôle, pas une idée.*

---

## Faut-il prévenir les testeurs ?

**À trancher par Michel.** Les faits utiles pour décider :

- Les données concernées sont **le nom, l'e-mail et le texte** des idées envoyées — pas les séances,
  pas les photos (qui ne sont jamais stockées côté serveur), pas les données de santé.
- L'accès demandait de **lire `app.js` et d'y repérer le jeton** : rien d'automatique, mais rien de
  difficile non plus.
- Rien n'indique que quelqu'un l'ait fait — **et rien ne permet de dire le contraire** : la route ne
  journalise pas les appels. *L'absence de trace n'est pas une preuve d'absence.*

---

*Écrit le 04/08/2026 pendant que Michel dormait, à lire au réveil.*
