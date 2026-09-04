# 📋 Briefing GPT — le coût de Milo et le cache de prompt

> **À coller tel quel dans ChatGPT.** Écrit le 08/08/2026 par Claude Code, à la demande de Michel.
> Tous les chiffres ci-dessous sont **mesurés**, pas estimés : soit en exécutant l'application,
> soit en lisant les exports de facturation Anthropic. Aucune supposition n'est présentée comme un fait.
>
> ⚠️ **Consigne pour l'IA qui lit ceci** : si tu cites une règle, un chiffre ou un fichier, cite-le
> **depuis ce document**. Si une information te manque pour trancher, dis-le au lieu de la combler.
> (Un audit précédent avait produit 18 citations dont **0 exacte**, et une règle entièrement inventée.)

---

## 1. Le contexte en trois phrases

Force Tracker est une PWA de suivi de musculation (HTML/CSS/JS pur, sans framework). **Milo** est
son assistant conversationnel, branché sur l'API Anthropic via un Worker Cloudflare. L'app compte
aujourd'hui **5 utilisateurs réels** (le fondateur + 4 testeurs) et prépare une ouverture plus large.

**Modèle économique actuel** : 10 questions gratuites à vie (`COACH_FREE_LIMIT = 10`), puis premium
— **6,99 € / 1 mois**, **34,99 € / 6 mois**, 1,99 € / 3 jours d'essai (via Ko-fi).

---

## 2. Ce qui est mesuré (08/08/2026)

### Le prompt envoyé à chaque message

| Bloc | Caractères | Part | Mis en cache ? |
|---|---|---|---|
| Bloc **commun** (consignes, personnalité, règles) | 37 237 | 62 % | ✅ partagé par tous |
| Bloc **personnel** (profil, mémoire, records) | 4 592 | 8 % | ✅ par utilisateur |
| **Jamais cachable** (voir détail) | **17 527** | **30 %** | ❌ plein tarif |
| **TOTAL** | **58 470** | | ≈ 24 900 tokens |

> ⚠️ Le total de 58 470 est mesuré sur le compte **admin** (bloc commun 36 351). Un utilisateur
> normal reçoit **37 237** de bloc commun, soit **59 356** au total — 886 caractères de plus
> (1,5 %). Aucune conclusion ne change ; le chiffre exact est celui-ci.

Détail des 17 527 caractères jamais cachés :

| | Caractères | Part |
|---|---|---|
| 🏋️ Catalogue d'exercices (337 fiches) | **9 514** | 54 % |
| Blocs « séance » | 4 113 | 23 % |
| Bloc « programme » | 1 398 | 8 % |
| Consignes « premier moment Milo » | 1 148 | 7 % |
| Heure locale + récupération | 764 | 4 % |

Ces blocs sont en bas **volontairement** : ils sont **conditionnels** (envoyés seulement quand le
sujet s'y prête), et un bloc qui apparaît puis disparaît invalide un cache de préfixe.

### Le partage du bloc commun — vérifié

Empreintes SHA-256 du bloc commun pour des profils volontairement opposés :

| Profil | Empreinte | Taille |
|---|---|---|
| Homme 45, prise de muscle, **admin** | `6db31d66` | 36 351 |
| Homme 42, prise de muscle | `e95a59ba` | 37 237 |
| Femme 30, perte de gras | `e95a59ba` | **identique** |
| Homme 28, sans objectif | `e95a59ba` | **identique** |

**Conclusion : 2 variantes seulement** (admin / non-admin). Le partage fonctionne comme prévu.

### Le coût réel

| | Juillet (31 j) | Août 1→6 |
|---|---|---|
| Total facturé | 25,25 $ | 20,26 $ |
| par jour | 0,81 $ | 3,38 $ |
| dont **écritures** de cache | 1,37 $ (5 %) | **16,41 $ (81 %)** |
| dont **lectures** de cache | 0,02 $ | 0,11 $ |

Rapport lectures / écritures sur tout août : **8,1 %**.

**Tarification Anthropic** (vérifiée) : écriture de cache **1,25×** le prix d'entrée pour une durée
de vie de 5 minutes, **2,0×** pour 1 heure ; lecture **0,1×**. D'où les seuils de rentabilité :

- cache **5 minutes** rentable si lectures > **28 %** des écritures ;
- cache **1 heure** rentable si lectures > **111 %** des écritures.

À 8,1 %, **le cache coûte actuellement 16 % de plus que s'il n'existait pas** (+2,29 $ sur 6 jours).

### Le coût par message et la projection

| | Aujourd'hui | Si le cache est relu |
|---|---|---|
| Un message à Milo | **10,2 centimes** | **3,7 centimes** |
| 5 utilisateurs (4 msg/j) | 61 $/mois | 22 $/mois |
| 100 utilisateurs | **1 228 $/mois** | 439 $/mois |
| 1 000 utilisateurs | 12 276 $/mois | 4 392 $/mois |

**Rentabilité de l'abonnement** (frais de paiement ~5 % déduits) :

| Offre | Net/mois | Rentable jusqu'à (auj.) | Avec cache relu |
|---|---|---|---|
| 6,99 € / 1 mois | 7,24 $ | **2,4 msg/jour** | 6,5 msg/jour |
| 34,99 € / 6 mois | 6,04 $ | 2,0 msg/jour | 5,4 msg/jour |

Un utilisateur **gratuit** coûte au maximum **1,02 $**, une seule fois (10 questions plafonnées).

---

## 3. Ce qu'on sait NE PAS savoir

Point d'honnêteté important : **le taux de 8,1 % est probablement faussé par notre propre travail.**

- Un **laboratoire de personas** existe dans le panneau admin (3 boutons). Chaque appui envoie le
  contexte **complet** (catalogue compris), avec un profil fabriqué différent et un historique vide
  → il écrit un cache qui **ne sera jamais relu**, par construction.
- La semaine du 1ᵉʳ au 6 août a été une semaine de développement intensif.
- Les tests automatisés, eux, **ne coûtent rien** (vérifié : ils tournent en local, sans clé API).

Un compteur d'appels séparant les essais de l'usage réel vient d'être mis en service (08/08). Il
faudra **2-3 jours d'usage normal** avant d'avoir un taux de lecture fiable.

---

## 4. Les options identifiées, et pourquoi aucune n'est tranchée

| Option | Gain | Risque |
|---|---|---|
| **A. Ne rien changer** | 0 | aucun ; on continue à payer ~16 % de trop |
| **B. Couper le cache** | ~16 % **certain** sur la partie concernée | perd le bénéfice à l'échelle (2,8×) |
| **C. Passer le cache à 1 h** | jusqu'à −73 % si l'usage se groupe | **pari** : si les lectures ne montent pas, l'écriture coûte 2× au lieu de 1,25× |
| **D. Rendre le catalogue cachable** (Anthropic autorise 4 points de coupure, on en utilise 2) | supprime le plus gros bloc plein tarif (9 514 car.) | même pari que C : si jamais relu, +25 % sur ce bloc |

Une 5ᵉ option a été **envisagée puis retirée** après calcul : « ne pas écrire le cache au premier
message d'une conversation ». Elle gagne sur les conversations d'un seul message mais **fait perdre**
sur toutes les autres (le cache serait écrit au 2ᵉ message au lieu du 1ᵉʳ → deux messages plein tarif).

---

## 5. Les questions posées à GPT

1. **Sur le prix** : 6,99 €/mois couvre un utilisateur jusqu'à ~2,4 messages/jour aujourd'hui.
   L'offre 6 mois est **moins** rentable par mois (5,83 €). Est-ce une structure tenable, ou
   faut-il repenser les paliers (par exemple un plafond d'usage plutôt qu'un prix plus élevé) ?
2. **Sur la stratégie de cache** : entre A, B, C et D — et sachant que la mesure actuelle est
   polluée — quel ordre recommandes-tu, et quel critère chiffré déclencherait chaque bascule ?
3. **Sur le catalogue d'exercices** (9 514 car. à chaque message d'entraînement) : vaut-il mieux
   le rendre cachable, ou le **réduire** (l'envoyer filtré selon le matériel déclaré) ? Le
   compromis connu est qu'un catalogue incomplet fait inventer des noms d'exercices à Milo,
   ce qui casse le suivi des records — c'est un bug déjà vécu.
4. **Angle mort** : qu'est-ce qui manque à cette analyse ? Y a-t-il un coût, un risque ou une
   option qu'on n'a pas vus ?

**Contrainte produit à respecter dans ta réponse** : Force Tracker n'est pas un produit qui
rationne. La règle d'or n°3 est « zéro perte de séance », la n°4 « ouverture instantanée même hors
ligne ». Toute proposition qui dégrade l'expérience du sportif pour économiser sera écartée — on
cherche des économies **invisibles pour l'utilisateur**.

---

## 6. ⚠️ REMESURÉ LE 04/09/2026 — LE CONTEXTE A GROSSI DE 35 % EN UN MOIS

> **Demande de Michel** : *« mais lire la nutrition ne va pas me faire gonfler la facture de
> l'api ? »*, puis *« oui combien coûte un message à Milo »*, puis *« note ça dans les
> journaux »*. Mesuré dans un vrai navigateur sur `buildCoachContext`, **0 appel API**.

### Ce qui a changé depuis le 08/08

| Bloc | 08/08 | 04/09 | écart |
|---|---|---|---|
| **commun** (règles de Milo, caché **1 h**) | 37 237 | **45 378** | +8 141 (+22 %) |
| **personnel** (profil, caché **5 min**) | 4 592 | **29 493** | +24 901 (**× 6,4**) |
| **l'instant** (jamais caché) | 17 527 | **4 010** | −13 517 (−77 %) |
| **TOTAL** | 58 470 | **78 881** | **+20 411 (+35 %)** |

⭐⭐ **LE VRAI CHANGEMENT N'EST PAS LA TAILLE, C'EST LA RÉPARTITION — et elle va dans le bon
sens.** Le bloc jamais cachable, celui qu'on paie **plein tarif à chaque message**, est passé de
**17 527 à 4 010 caractères**. C'est ce que le document du 08/08 appelait de ses vœux. La
croissance s'est faite dans les blocs **cachés**, qui coûtent 10 % à la relecture.
👉 ***Un contexte 35 % plus gros peut coûter MOINS cher qu'un contexte plus petit mal découpé.***

### Le coût d'un message aujourd'hui (Sonnet, calculé)

| | centimes |
|---|---|
| **1ᵉʳ message** d'une conversation (le cache s'écrit) | **16,5** |
| **messages suivants**, cache chaud | **2,4** |
| *(pour comparer : sans cache du tout)* | *10,3* |

⛔⛔ **ET LE PIÈGE EST LÀ, IL FAUT LE LIRE** : le 1ᵉʳ message coûte **PLUS CHER que si le cache
n'existait pas** (16,5 contre 10,3). *Écrire un cache d'1 h se paie **×2**.* Le cache n'est donc
pas une économie automatique — **il ne rapporte que s'il est RELU**, ce qui est exactement le sujet
du §2 de ce document (rapport lectures/écritures à 8,1 % en août).

À l'usage : une conversation de 10 messages ≈ **0,38 €** · 100 messages ≈ **2,53 €** ·
1000 messages ≈ **24 €**.

### ⚠️⚠️ DEUX ERREURS QUE J'AI FAITES, ÉCRITES POUR QU'ELLES NE SE REFASSENT PAS

J'ai d'abord annoncé **8,5 centimes** pour le 1ᵉʳ message et **1,9** pour les suivants. **Faux, sur
deux points** — et les deux corrections étaient **déjà écrites dans ce document**, que je n'avais
pas relu avant de calculer (**R23**) :

1. ⛔ **L'écriture d'un cache 1 h coûte ×2,0**, pas ×1,25. *×1,25, c'est le cache 5 minutes.*
   J'avais appliqué le tarif du petit au grand.
2. ⛔ **Le ratio caractères/jeton de CE contexte est ~2,35**, pas 3,6. J'avais pris le ratio de
   l'anglais courant pour un texte **bourré d'emoji, d'accents et de cadres** — chaque ⭐⛔⚠️ coûte
   plusieurs jetons. **Écart : +53 % de jetons.**

👉 ***Le chiffre le plus dangereux n'est pas celui qu'on ignore, c'est celui qu'on calcule avec
la mauvaise constante : il a l'air d'une mesure.*** Les deux constantes justes étaient à quinze
lignes de distance dans ce fichier.

### ⛔ Ce que ces chiffres ne sont PAS

**Un calcul, pas une facture.** Le §2 tirait ses nombres des **exports de facturation Anthropic** ;
ceux-ci viennent d'une mesure de **caractères** et d'une hypothèse de réponse (750 jetons de
sortie). Surtout, **le coût moyen réel dépend du taux de relecture du cache**, que je ne peux pas
mesurer depuis un conteneur. ⭐ Le vrai chiffre est dans la **console Anthropic**, et lui seul
tranche.

### 🍽️ La nutrition, puisque c'était la question de départ

Le journal alimentaire pèse **890 caractères** — **1,2 %** du contexte, et il est **plafonné à
7 jours en dur** (`coach.js`) : noter ses repas pendant trois ans n'ajoute pas une ligne.
⚠️ Il vit dans le bloc **jamais caché** (il change à chaque repas — le monter plus haut ferait
réécrire un cache d'1 h plusieurs fois par jour, ce qui coûterait **bien plus** que les 890
caractères qu'on économiserait). Coût propre : **~0,02 à 0,08 centime par message**, soit **20 à
80 centimes sur mille messages**.
👉 *La nutrition n'est pas un sujet de facture. Les 45 000 caractères de règles en sont un.*
