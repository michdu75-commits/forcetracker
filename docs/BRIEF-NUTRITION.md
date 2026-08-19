# 🥗 Brief nutrition — à lire avant d'écrire une ligne

> **Créé le 19/08/2026**, à la demande de Michel, pour une **autre instance** qui reprend le
> chantier nutrition. Il est **autonome** : on peut le lire sans le dépôt sous les yeux.
>
> ⚠️ **Ce document ne remplace pas `docs/NUTRITION-MOTEUR.md`** (le comment, 562 lignes) ni
> `docs/NUTRITION-PHILOSOPHIE.md` (le pourquoi). Il dit **où on en est**, **ce qui a été décidé
> depuis**, et **ce qui est à toi**. Le moteur a été écrit le 18/08 — **six versions sont passées
> depuis**, et une décision d'architecture avec. Sans ce brief, tu reconstruirais du déjà-fait.

---

## 1. Les trois phrases qui décident de tout

**① La nutrition est un LEVIER, jamais une finalité.** Principe 21 de la Constitution :
*« elle ne doit jamais devenir une source de stress supérieure au bénéfice qu'elle apporte »*.
Concrètement : optionnelle, jamais bloquante, jamais un reproche, jamais de micro-comptage imposé.

**② Le vrai défaut n'est pas la variété des repas — c'est que la nutrition IGNORE
COMPLÈTEMENT L'ENTRAÎNEMENT.** L'app connaît la séance du jour, son heure, les calories dépensées,
la région travaillée, la discipline — et n'en fait **rien** côté nutrition. C'est le manque le plus
important du produit, et c'est celui qui le différencierait.

**③ Le calcul est DÉTERMINISTE, gratuit et hors ligne.** Le générateur de repas ne doit appeler
aucune IA : à la salle, sans réseau, l'écran doit s'ouvrir et fonctionner (règle d'or #4). Un « Plan
de repas IA » existe déjà, séparément, pour ceux qui en veulent un.

---

## 2. Où on en est vraiment — ce qui a été LIVRÉ depuis l'écriture du moteur

⚠️ **Le tableau des briques de `NUTRITION-MOTEUR.md` §7 est périmé sur sa première ligne.**

| | État | Ce qu'il faut savoir |
|---|---|---|
| **Brique 0 — la provenance** | ✅ **FAITE** (ft-v907, 18/08) | Chaque entrée du journal porte désormais **deux axes** : `saisie` (comment c'est entré : manuel · scan · photo-ia · ia-texte · liste) et `origine` (d'où vient le chiffre : utilisateur · off · étiquette · ia · reprise), plus `q` (la quantité), `per100` (les valeurs au 100 g quand la source les donne) et `modifie` (la personne a-t-elle retouché après un remplissage automatique). **Ne la refais pas.** Une entrée sans `v` est une entrée d'avant : on ne la réécrit pas et on ne lui suppose aucune provenance. |
| **Brique 1 — la base d'aliments (CIQUAL)** | ⛔ à faire | C'est le gros morceau. Voir §4 ci-dessous : **deux bases, pas une**. |
| **Brique 3 — le générateur** | ⛔ à faire | Branché **derrière** l'existant d'abord, on compare les deux sorties avant de basculer. |
| **Brique 4 — les 4 niveaux de précision** | ⛔ à faire | qualitatif → portions → macros → suivi précis. La précision est un **choix**, jamais une obligation. |

**Et ce qui a été livré autour, qu'il ne faut ni défaire ni refaire :**

- **ft-v906 — un PLANCHER sur la cible calorique.** `autoKcal()` était une addition sans plancher et
  pouvait prescrire **847 kcal** (femme 55 kg sédentaire, perte, décharge) — pendant que le Gardien de
  Milo alerte sous 1 500 (H) / 1 200 (F). *Deux sources pour la même règle de santé.* Le plancher est
  posé **et expliqué à l'écran** (une cible qui bouge sans raison visible est pire que pas de plancher).
  ⚠️ Il ne touche **pas** `manualKcal` : une cible saisie à la main est celle de la personne.
  Même défaut corrigé sur le **kéto** (15 % de protéines passait sous 0,8 g/kg) : ce sont les
  **lipides** qui absorbent, jamais les glucides — les 5 % de glucides *définissent* le régime.
- **ft-v908 — la barre de protéines lit enfin le journal.** `prot-eaten` était une saisie manuelle que
  rien n'alimentait : avec 60 g déjà notés, l'app affichait « il te reste 187 g » sur une cible de 187.
  ⚠️ La saisie manuelle reste **prioritaire quand elle est remplie** (même arbitrage que `manualKcal`).
- **ft-v909 / 912 / 913 — la carte « où tu en es ».** Elle répond à *« où j'en suis »*, pas à
  *« combien il me reste à manger aujourd'hui »* (qui n'a de sens que si on a déjà tout noté).
  **La règle qui tient tout : une semaine incomplète produit une moyenne HONNÊTE** — on divise par les
  jours **réellement notés**, jamais par 7, et **on écrit combien il y en a**. La moyenne ne porte que
  sur les **jours terminés** (aujourd'hui est par construction incomplet). Un écart n'apparaît qu'à
  partir de **3 jours terminés**, et **en gris, pas en orange** : *un écart est un constat, pas une
  alerte*. Zéro jour noté → une invitation, pas un « 0 / 2 600 » qui se lit comme un reproche.
- **ft-v910 / 913 — la créatine.** La dose est **libre** (0,5 à 30 g, bornes anti-faute-de-frappe),
  avec **deux seuils et deux tons** : au-dessus de **3 g** un simple **repère** (c'est une règle de
  *commercialisation* française, arrêté du 26/09/2016 — **pas** une limite légale pour le
  consommateur : écrire « maximum légal » était faux) ; au-dessus de **5 g** un **avertissement** (on
  sort de ce que décrivent les sociétés savantes). ⚠️ Dans les deux cas c'est écrit noir sur blanc :
  **ce n'est pas un risque démontré, c'est une zone peu étudiée.** Les **contre-indications ANSES**
  (rein, facteurs cardiovasculaires, foie, troubles neuropsychiatriques, mineurs, grossesse) sont
  affichées — c'est le seul point du dossier qui relève vraiment de la sécurité. La phase de **charge**
  n'est plus le défaut (elle affichait 20 g/j pendant que la même app avertissait au-delà de 5).
  ⛔ Et une affirmation a été **retirée parce qu'elle était fausse** : la caféine ne réduit pas
  l'absorption de la créatine, et l'espacement de 2 h n'a jamais été testé.
- **ft-v911 — « tes repas habituels ».** Observés dans le journal (les aliments notés **ensemble**, le
  même jour, sur le même repas), **jamais déclarés** : pas de liste à gérer. Il en faut **deux** pour
  qu'un repas soit proposé. ⚠️ Qui mange différemment chaque jour **ne voit rien du tout** — pas une
  section vide, qui serait un reproche déguisé.
- **ft-v915 — le cru/cuit est ÉCRIT, jamais converti.** La table de portions mélangeait le cru et le
  cuit sans le dire (riz 350 kcal/100 g = cru ; légumineuses 116 = **cuites**). C'est un biais
  **systématique**, donc il **survit au moyennage hebdomadaire** — la seule classe d'erreur que
  « cohérence avant réactivité » ne peut pas absorber. ⛔ **On ne convertit pas, on nomme** :
  convertir supposerait un ratio d'absorption d'eau qu'on n'a pas. Chaque ligne porte SON état
  (*« Riz 100 g (pesé cru) + lentilles 250 g (pesé cuit) »*) — pas de convention globale, parce que le
  riz s'achète sec et les lentilles souvent cuites en boîte. Côté journal, Open Food Facts donne les
  valeurs **« telles que vendues »** : 200 g de pâtes *cuites* saisies au chiffre du paquet, c'est
  **700 kcal au lieu de 260**. Une note prévient, **sans bloquer**, et **seulement** sur les aliments
  qui gonflent vraiment.

---

## 3. ⭐⭐ LA DÉCISION D'ARCHITECTURE DU 19/08 — elle te concerne directement

Le prompt commun de Milo touchait son plafond (140 règles, 46 485 caractères pour 46 500). Michel a
posé l'architecture, et il l'a nommée : **le cerveau et le cervelet**.

> **Milo est le CERVEAU** : il comprend, diagnostique, adapte, décide, explique, **parle**.
> **Une 2ᵉ IA est le CERVELET** : elle extrait, convertit, normalise, structure, compose sous
> contraintes explicites.
> ⚠️ **Le cervelet n'existe PAS pour l'utilisateur.** Deux IA, **une seule voix** (règle R6, non
> négociable). Le jour où il parle en son nom, le produit a deux personnalités.

Détail complet : `docs/ARCHITECTURE-CERVEAU-CERVELET.md`. **1ʳᵉ brique livrée** (ft-v919) : la
conversion séance→JSON est sortie du prompt de Milo (46 485 → 44 157 caractères).

### 3.1 Les DEUX critères — le second est indispensable en nutrition

**Critère 1 (Michel)** — *« Est-ce que ça a besoin de savoir QUI est la personne ? »*
Oui → Milo. Non → question suivante.

**Critère 2 (ajouté le 19/08 par une relecture extérieure, et il corrige un angle mort réel)** —
*« Est-ce une TRANSFORMATION vérifiable, ou un JUGEMENT ? »*
Transformation → cervelet. Jugement → Milo.

**Pourquoi le second est indispensable ICI** : composer une journée végane sans arachide à 2 400 kcal
n'a **pas** besoin de l'historique de la personne. Le critère 1 seul l'enverrait donc au cervelet.
Or cette tâche porte des contraintes de **sécurité**. *Générique ne veut pas dire mécanique.*

**La phrase qui résume la frontière nutrition :**
> **Le cervelet calcule ce qu'il y a dans l'assiette.
> Milo décide ce que cette assiette signifie pour cette personne.**

### 3.2 Le partage, concrètement

| Va au **CERVELET** | Reste chez **MILO** |
|---|---|
| lire une étiquette photographiée | définir/interpréter l'objectif |
| structurer *« 200 g de riz cuit, 150 g de poulet, 2 œufs »* | dire si la personne mange assez pour progresser |
| estimer un plat décrit en texte libre | relier nutrition ↔ séance ↔ récupération |
| rechercher / normaliser un aliment | adapter selon l'historique |
| **proposer** une combinaison sous contraintes déjà fixées | **fixer** ces contraintes (combien de kcal, quelle cible protéique, faut-il vraiment un déficit) |

### 3.3 ⛔⛔ CE QUI NE DOIT PAS DÉPENDRE D'UN MODÈLE — la règle de sécurité

**Une contrainte critique vérifiable par du code ne doit JAMAIS dépendre uniquement d'un LLM.**

Allergies, régimes, exclusions : ce sont des contraintes **dures**. L'architecture est :

```
contraintes fixées (Milo ou le profil)
        ↓
le cervelet PROPOSE une combinaison
        ↓
un VALIDATEUR DÉTERMINISTE contrôle   ← allergène ? produit animal ? exclusion ?
        ↓
rejet  ou  validation
```

Le précédent est réel et daté : **le 02/08, une testeuse ayant déclaré « fruits à coque » a vu des
amandes.** Et le 19/08 le garde-fou d'une *autre* fonctionnalité a trouvé deux bugs qui traînaient
depuis des mois : **« Thon » seul n'était couvert par aucune substitution** (un végétarien voyait du
thon) et **le miel n'était remplacé nulle part**. C'est pour ça que le générateur d'aujourd'hui
n'emploie **que des aliments déjà présents dans les plans** : *le risque est nul par construction,
pas par vigilance.*

**Un modèle léger (Haiku) est un candidat sérieux comme extracteur, normalisateur, générateur de
candidats. Il ne doit jamais être l'autorité finale d'une contrainte de sécurité.**

### 3.4 ⚠️ Le risque propre à ce chantier : le cervelet qui devient un 2ᵉ coach

La dérive se fait par petits pas, et elle est plausible :

> lire une étiquette → estimer un plat → composer un repas → composer une journée → **conseiller** →
> **adapter à l'entraînement**

Arrivé là, il y a deux cerveaux, et le défaut n°2 du §1 (*la nutrition ignore l'entraînement*) est
**aggravé**, pas résolu : le lien avec la séance serait perdu pour de bon.

**La règle anti-dérive, et elle est testable** : *si une nouvelle tâche oblige à charger le profil
de la personne dans le cervelet, la frontière est franchie.* Elle est déjà **verrouillée par un
test permanent** — un témoin vérifie que l'appel au cervelet ne contient **que** `{action, texte}`,
deux clés, pas trois. Une dérive ferait rougir la livraison.

---

## 4. ⭐⭐ DEUX BASES, PAS UNE — la synthèse qui décide de tout le §4 du moteur

C'est le point le plus important de la brique 1, et l'erreur naturelle est d'en faire une seule.

| | **Le JOURNAL** | **Le GÉNÉRATEUR** |
|---|---|---|
| Ce qu'il veut | la **COUVERTURE** | la **SÛRETÉ** |
| Taille | CIQUAL entier, **3 484 aliments** | **~300** marqués `composable` |
| Régimes / allergènes | pas besoin | **liste blanche relue à la main** |
| Qui choisit | **la personne** | **l'app** |

*C'est le « qui choisit » qui justifie les deux bases* : quand la personne cherche un aliment, elle
sait ce qu'elle mange — il faut de la couverture. Quand l'**app** compose son assiette, elle engage
sa responsabilité — il faut de la sûreté.

⚠️ Et **Open Food Facts et CIQUAL ne sont pas concurrents** : OFF = les **produits emballés**
(codes-barres, Nutri-Score, NOVA), CIQUAL = les **aliments bruts** (ANSES, référence française,
gratuit). Le journal a besoin des deux ; le générateur, de CIQUAL.

---

## 5. Les pièges déjà payés — ne pas les redécouvrir

1. **Ne jamais inventer un chiffre pour combler un vide.** Les trois dérives du dossier créatine
   avaient toutes la même forme : *un vide comblé par un mécanisme vraisemblable*. Dire
   « personne n'a mesuré ça » **est** une information.
2. **L'information doit descendre jusqu'à la DONNÉE, pas rester dans le TEXTE** (règle R4). C'est la
   famille de bugs la plus coûteuse du projet. Exemples nutrition : `etat` (cru/cuit) existait comme
   champ et valait **toujours `null`** ; le poids scanné était connu (`af-bc-grams`) et **pas
   enregistré**.
3. **Une information a UN propriétaire** (règle R2). Deux endroits qui stockent la même chose
   divergeront — la seule question est quand. Vécu 3 fois en nutrition en deux semaines.
4. **Le droit de deviner dépend du COÛT de l'erreur** (règle R29). Une couleur de calendrier : devine.
   Un fait sur la personne, sa santé, son allergie : **demande**, ou tais-toi. Et une fonction qui ne
   sait pas doit pouvoir rendre `null` — un `null` qu'on ne remplace **jamais** par une valeur par défaut.
5. **Informer sans bloquer** (règle R24). Une note qui s'affiche pour tout n'est plus lue ; un
   garde-fou qui crie pour rien finit désactivé (R19).
6. **Tester la BASE ENTIÈRE, pas des archétypes.** Le test de compatibilité régime/allergie doit
   parcourir **tous** les aliments et **toutes** les variantes de jour — sinon un cas dangereux ne
   sortirait que certains jours, et personne ne le verrait avant qu'un utilisateur le mange.
7. **Un contrôle négatif est obligatoire** : les nouveaux témoins tournés contre l'**ancien** code
   doivent rougir. Un témoin qui **plante** ne prouve rien — il doit **échouer**, pas s'interrompre.
   (Piège payé 6 fois : appeler une fonction neuve dans un témoin la fait planter sur l'ancien code.)

---

## 6. ⏭️ Ce qui t'attend, dans l'ordre, avec l'état honnête

| Priorité | Quoi | État / blocage |
|---|---|---|
| **1** | **Brique 1 — la base CIQUAL** (`tools/aliments.py` + `aliments.js`, avec les ~300 `composable` et leurs champs de sécurité) | Prêt à démarrer. ⚠️ **Mesurer le poids** sur l'ouverture instantanée (règle d'or #4), ne pas le supposer négligeable. |
| **2** | **Brique 3 — le générateur** (`composerRepas()`), branché **derrière** l'existant | Dépend de 1. Le validateur déterministe du §3.3 **fait partie de la brique**, pas d'une suite. |
| **3** | **Brique 4 — les 4 niveaux de précision** | Dépend de 1. |
| **4** | **Le jour de séance** (glucides ± selon séance/repos, à calories hebdomadaires égales), puis l'**heure réelle** de la séance | C'est le défaut n°2 du §1 — **le vrai gain produit**. Dépend de la bascule du générateur. |
| ⏸️ | **La contradiction sur les protéines** : la fiche whey annonce **1,6-2 g/kg**, le moteur calcule **2,0-2,6** | **BLOQUÉ**, et volontairement : trancher demande des références vérifiées. Ne pas « harmoniser » au jugé — ce serait inventer une troisième valeur, exactement la faute du §5.1. |
| ❓ | Les **micronutriments** (CIQUAL les donne gratuitement) | ⚠️ Dès qu'on en affiche un, on entre dans un domaine où l'app doit **renvoyer au médecin** et jamais interpréter. À traiter comme le bilan sanguin, **ou pas du tout**. |

**⚠️ Un point de calendrier qui compte** : Michel **commence à s'en servir pour de vrai** cette
semaine (*« je veux commencer la semaine prochaine pour voir où j'en suis »*). Les briques 1/3/4 sont
**délibérément différées** de deux semaines pour qu'on construise sur du **vrai usage** plutôt que
sur des suppositions. C'est un choix, pas un retard.

---

## 7. Qui est en face

Michel — auteur et unique décideur du produit. **Il n'est ni développeur ni programmeur.**

- **Explications simples, la réponse d'abord, le détail seulement s'il le demande.**
- **Prévenir avant tout risque.** Backup et branche avant une opération sensible.
- Quand il répète une consigne deux fois, **l'écrire** au lieu de la ré-appliquer.
- Ses retours viennent du terrain, souvent en pleine séance ou devant son écran — ils sont précis et
  ils ont presque toujours raison sur le **symptôme**, même quand la cause est ailleurs.
- Les personas ne sont pas des profils de test, ce sont les **dimensions du projet** :
  **Christophe** = terrain/métier · **Tatiana** = personnalisation, **aucun présupposé** ·
  **Emma** = physiologie & ressenti (c'est elle qui a vu les amandes).

---

## 8. Où lire le reste

| Sujet | Document |
|---|---|
| **Le COMMENT de la nutrition** (chaîne complète, 5 trous, schéma d'aliment, générateur en 10 lignes) | `docs/NUTRITION-MOTEUR.md` |
| **L'ESPRIT** (les principes, les 4 niveaux de précision, le Gardien nutrition, l'anti-TCA) | `docs/NUTRITION-PHILOSOPHIE.md` |
| La frontière cerveau/cervelet en entier | `docs/ARCHITECTURE-CERVEAU-CERVELET.md` |
| Comment on construit (les 31 règles, chacune née d'un vrai bug) | `docs/REGLES-ARCHITECTURE.md` |
| Comment Milo se comporte envers la personne | `CONSTITUTION-MILO.md` (P21 = la nutrition) |
| Les familles de bugs de ce projet, et à quoi on les reconnaît | `BUGS.md` |
| Ce qui EXISTE déjà (généré depuis le code, jamais écrit à la main) | `docs/INVENTAIRE.md` |
| L'état du jour : version, branche, chantier actif | `docs/CONTEXTE-ACTUEL.md` |

**⚠️ Avant d'affirmer qu'une chose n'existe pas : vérifier dans le code ET dans l'inventaire**
(règle R23). C'est arrivé deux fois — un audit a conclu que l'import de prise de sang manquait, il
existait depuis trois semaines ; et j'ai proposé de « construire un pont » vers la montre alors que
Michel l'avait fait lui-même trois jours plus tôt. *Une fonctionnalité non relue est une
fonctionnalité qu'on re-propose.*
