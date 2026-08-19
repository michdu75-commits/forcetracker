# 🧠 Cerveau / cervelet — décharger Milo sans le diluer

> **Créé le 19/08/2026**, sur une idée de Michel formulée ce soir-là : *« pourquoi tout part d'un
> seul bloc ? dans une entreprise il y a le boss et la secrétaire »*, puis nommée par lui —
> **« le cerveau et le cervelet »**.
>
> ⚠️ **Ce document est écrit pour être PARTAGÉ** (ChatGPT, Gemini, une autre instance Claude), donc
> il est **autonome** : tout ce qu'il faut pour challenger la décision est dedans, chiffré, sans
> accès au code. Même esprit que `DESIGN-KIT.md` ou `MOTEUR-MET-A-COLLER.md`.
> 📌 **On ne demande pas un avis sur « faut-il le faire »** — c'est décidé. On demande un challenge
> sur **où passe la frontière** et sur **les modes de panne** (§7).

---

## 1. Ce qui est décidé

**Milo est le CERVEAU.** Il garde le jugement : diagnostiquer, adapter, décider, expliquer, parler.

**Une seconde IA est le CERVELET.** Elle exécute ce qui est mécanique : convertir, lire, calculer,
composer sous contraintes.

**⚠️ Le cervelet N'EXISTE PAS POUR L'UTILISATEUR.** C'est un service : il reçoit une demande de
l'app, il rend une donnée. L'app l'affiche, ou Milo s'en sert. **Deux IA, une seule voix** —
c'est la règle **R6** (*« une seule mémoire, une seule VOIX »*), et elle n'est pas négociable :
le jour où le cervelet parle en son nom, le produit a deux personnalités.

---

## 2. Le critère, en une phrase

> ### Est-ce que ça a besoin de savoir QUI est la personne ?
> **Oui → Milo. Non → le cervelet.**

Il se teste en dix secondes sur n'importe quelle tâche, et il ne demande aucune connaissance du
code. C'est ce qui le rend utilisable par quelqu'un d'autre que son auteur.

---

## 3. Pourquoi maintenant — la mesure du 19/08

L'idée existait depuis des semaines (voir §6). Ce qui a changé, c'est qu'on l'a **chiffrée**.

| | |
|---|---|
| Règles dans le prompt commun de Milo | **140** |
| Taille | **46 485 caractères** |
| Plafond que le projet s'est fixé | 46 500 |
| **Marge restante** | **15 caractères** |

**Plus aucune règle générique ne peut entrer sans qu'on en sorte une.** C'est arrivé deux fois dans
la même soirée : une règle sur la géographie de la salle a dû déménager faute de place, et la règle
sur les sources inventées a consommé toute la marge qu'on venait de gagner.

**⚠️ Et le dégraissage plafonne.** Mesuré le même soir : ce qui peut réellement sortir du prompt
*parce que le code le garantit déjà* représente **3 à 4 %**. La méthode marche (on l'a appliquée),
mais elle ne résout pas le problème.

**⚠️ Le plafond n'est PAS financier.** Le bloc commun est mis en cache 1 h et facturé ~10× moins.
Le seuil existe pour une seule raison, écrite dans le code : *« sa taille coûte peu, mais elle
DILUE les règles entre elles, et c'est ÇA le vrai prix »*.

---

## 4. La frontière proposée — avec les poids réels

### 4.1 Ce qui part au cervelet

| Tâche | Poids actuel dans le prompt | Pourquoi elle part |
|---|---|---|
| **Convertir une séance en JSON** pour l'app | **4 194 car.** | c'est un format, pas du coaching |
| **Proposer des réponses rapides** à taper | **1 655 car.** | idem |
| **Mémoriser la prochaine séance annoncée** | **825 car.** | idem |
| **Nutrition-outil** : lire une étiquette, estimer un plat, composer un plan sous contraintes, chercher un aliment | **2 126 car.** *(et les briques 1/3/4 à venir)* | ça demande une base et des règles, pas un historique |
| **Total** | **≈ 8 800 car. — 19 % du prompt** | |

### 4.2 Ce qui reste chez Milo

- **Décider** quels exercices, quelles charges, quel ordre, quelle progression.
- **Diagnostiquer** : deux personnes au même objectif peuvent avoir besoin de l'inverse.
- **Dire** si elle mange assez pour progresser — ça n'a de sens qu'en croisant séances, sommeil et apports.
- **Choisir** la question à poser, et quand.
- **Tout le noyau non négociable** (§5.3).

### 4.3 ⭐ Le principe qui résume : **Milo parle, le cervelet traduit**

Milo écrit sa séance **en français**, comme un coach. Le cervelet la convertit en données pour l'app.

**Et ce n'est pas qu'un gain de place — c'est probablement plus fiable.** Aujourd'hui Milo doit
produire *simultanément* une réponse lisible **et** un JSON valide ; quand le JSON est mal formé,
la séance ne se charge pas. Un convertisseur qui n'a qu'un seul métier se trompe moins.

---

## 5. Les trois contraintes — trouvées le 19/08, à ne pas redécouvrir

### 5.1 ⚠️ Le cache : des variantes FIXES, jamais une variation continue

Le bloc commun est **identique pour tous les utilisateurs** → mis en cache 1 h, facturé ~10× moins.
Un contexte **différent à chaque message** ferait sauter le cache : plein tarif à chaque question.

⭐ **Mais un petit nombre de configurations FIXES fonctionne** : 4 variantes = 4 caches chauds.
*Ce qui tue le cache, c'est la variation continue, pas la pluralité.*

### 5.2 ⚠️ L'erreur d'aiguillage est SILENCIEUSE

Un message d'entraînement classé « nutrition », et Milo répond sans les règles dont il a besoin.
**Aucune erreur, aucun test rouge, juste une réponse moins bonne.** C'est la famille de bugs que ce
projet collectionne — celle qu'on ne voit pas.

👉 Toute conception doit répondre à : *comment sait-on qu'un aiguillage s'est trompé ?*

### 5.3 ⚠️ Un noyau ne se conditionne JAMAIS

Partent **toujours**, quel que soit l'aiguillage : la sécurité, les zones fragiles déclarées,
« n'invente rien », l'identité et le ton de Milo. Seuls les modules spécialisés tournent.

### 5.4 ⚠️ Et le risque propre à la nutrition

`docs/NUTRITION-MOTEUR.md` identifie le **plus gros défaut actuel** :

> *« Le plus important n'est pas la variété, c'est que la nutrition IGNORE COMPLÈTEMENT
> L'ENTRAÎNEMENT : l'app connaît la séance, l'heure, les calories dépensées, la région travaillée
> — et n'en fait rien côté nutrition. »*

**Un service nutrition séparé peut AGGRAVER exactement ça.** D'où le partage strict du §4 :
l'**outillage** part, la **conversation** reste. Si le cervelet se met à conseiller, le lien avec
l'entraînement est perdu pour de bon.

---

## 6. Ce n'est pas une idée neuve — elle était écrite deux fois

- **`docs/CONTEXTE-ACTUEL.md`** la listait comme *« archi cerveau/cervelet — **pas encore
  envoyé** »* à Gemini/Mistral pour challenge. Le cross-review n'est jamais parti.
- **L'architecture hybride** actée le 20/07/2026 la contient déjà, nommée : le **niveau ③
  Orchestration** — *« décide quel composant intervient, dans quel ordre, avec quelles données »*,
  explicitement marqué **« couche encore IMPLICITE aujourd'hui : routage + assemblage du contexte »*.

**Le cervelet = rendre le niveau ③ explicite.** La pièce manquante d'une architecture déjà décidée.

### ✅ Et le patron existe déjà en production
Le worker appelle **déjà** des modèles légers (Haiku) en service, sans contexte personnel :
lecture d'un code-barres, import d'un bilan corporel, résumés. **L'utilisateur ne leur parle
jamais.** Le mécanisme est éprouvé — il s'agit de l'étendre, pas de l'inventer.

---

## 7. ❓ Ce qu'on demande à un regard extérieur

1. **La frontière du §4 est-elle au bon endroit ?** Y a-t-il une tâche classée « cervelet » qui a en
   réalité besoin de connaître la personne — ou l'inverse ?
2. **Comment détecte-t-on un aiguillage raté** (§5.2), sachant qu'il ne produit aucune erreur ?
3. **Combien de variantes de contexte** avant que le cache ne devienne contre-productif ?
4. **Le convertisseur séance→JSON** est-il vraiment plus fiable que le tout-en-un actuel, ou
   déplace-t-on simplement le point de casse ?
5. **Quel modèle pour le cervelet ?** Un Haiku suffit-il pour composer un plan alimentaire sous
   contraintes de régime et d'allergies — sachant qu'une erreur y est une erreur de **sécurité**
   (un végan qui reçoit de la viande, une allergie ignorée) ?

---

## 8. ⏭️ Le prérequis, et il n'est pas un détail

**Est-ce que Milo suit ses 140 règles aujourd'hui ?**

Si oui, l'orchestration est une optimisation. Si non, elle est urgente.

**On ne peut pas trancher localement** : `tests/milo` est déterministe — il prouve qu'une règle est
**PRÉSENTE** dans le contexte, jamais qu'elle est **SUIVIE**. Il faut des cas réels sur le vrai
modèle. C'est le prérequis de tout le reste.

---

*Lié à : `docs/MOTEUR-RAISONNEMENT-MILO.md` (le pipeline de raisonnement) · `docs/REGLES-ARCHITECTURE.md`
(R6 une seule voix, R7 le prompt est le dernier levier, R9 le modèle est une variable structurelle) ·
`docs/NUTRITION-MOTEUR.md` (§5.4) · `README-IA.md` (comment une IA extérieure lit ce dépôt).*
