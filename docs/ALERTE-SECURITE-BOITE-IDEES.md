# 🔴 ALERTE SÉCURITÉ — la boîte à idées est lisible par n'importe qui

> **Trouvé le 04/08/2026**, en cherchant comment lire les idées depuis la session Claude.
> **État : NON CORRIGÉ. Correctif prêt ci-dessous, à déployer depuis un poste qui peut vérifier.**
> Ce fichier se supprime le jour où c'est réglé.

---

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
