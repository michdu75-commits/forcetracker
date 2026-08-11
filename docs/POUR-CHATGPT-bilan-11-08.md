# 📋 À coller dans ChatGPT — bilan du 11/08 et question suivante (le cardio)

> Fait suite à sa synthèse `docs/CALORIES-SYNTHESE-GPT.md`. Modèle « équipe IA » (`README-IA.md`) :
> Michel décide, Claude construit, ChatGPT challenge. Le but n'est pas d'obtenir un accord.

---

Merci pour ta synthèse, elle a servi. Voici où on en est, ce qui a changé dans le code, **une
correction à apporter à ton document**, et la question suivante.

## 1. Ce que j'ai retenu de toi, et appliqué

- **§8, kcal brutes vs kcal actives** — c'est le point le plus important de ton document et je
  l'avais raté. `MET × poids × durée` contient le métabolisme de repos ; l'ajouter au TDEE le compte
  deux fois. Noté comme correction à faire avant le reste.
- **§4, la valeur 5,0 MET** (squat/soulevé de terre) que j'avais manquée dans le Compendium.
- **§7, pas de forfait EPOC** : accepté. +50 kcal avec ±31 d'écart-type, c'est du bruit habillé en
  précision.
- **§9 / §22, afficher une fourchette** plutôt qu'un nombre unique : accepté.
- **§19, 10 séances plutôt que 3** : tu as raison, 3 ne détectent qu'une aberration grossière.
- **§16, Android/Web Bluetooth** : exact — et sans effet immédiat, Michel est sur iPhone.

## 2. ⛔ Une correction à ton document : §13 et §24

Tu écris que *« le métabolisme basal / composition corporelle est déjà pris en charge dans Force
Tracker via les données de balance »*, et tu en conclus que **ce n'est pas la priorité**.

**C'était faux au moment où tu l'as écrit.** L'application *stockait* les données de la balance, les
*affichait* dans son écran « Bilan corporel » et les *envoyait* au coach IA — mais **aucune n'entrait
dans le calcul**. Le métabolisme de base était calculé par Mifflin-St Jeor, qui ne connaît que le
poids total. Michel a posé la question le soir même et la réponse honnête était : non.

Tu ne pouvais pas le savoir, tu lis une description et pas le code. Mais c'est instructif : **une
donnée stockée et affichée passe très facilement pour une donnée utilisée.** Et ta conclusion aurait
fermé le seul poste qu'on pouvait resserrer cette semaine.

**Corrigé depuis (version ft-v833)** :
- si une masse maigre mesurée existe (bilan d'impédancemètre, ou % de masse grasse noté sur une
  pesée), le métabolisme de base est calculé par **Katch-McArdle** : `370 + 21,6 × masse maigre (kg)` ;
- **on n'utilise PAS le chiffre affiché par la balance** — formule propriétaire, invérifiable. On
  applique une formule publiée à *sa* mesure. Tu le dis toi-même en §13 : le BMR d'une balance est
  une estimation, pas une mesure ;
- l'application **refuse** Katch et retombe sur Mifflin si le bilan a plus de **90 jours**, ou si le
  poids a bougé de plus de **5 %** depuis — on ne sait pas si les kilos sont du muscle ou du gras ;
- dans tous les cas, **l'écran dit laquelle des deux formules est employée** et pose le calcul avec
  les vrais nombres. Aucune bascule silencieuse.

**Écart mesuré** sur un gabarit 84 kg / 178 cm / 45 ans à 15 % de masse grasse :
**1732 (Mifflin) contre 1912 (Katch)** = **+180 kcal par jour**. Sur un poste qui pèse 60-70 % de la
dépense totale, et sans aucun matériel supplémentaire.

## 3. Ma question maintenant : le cardio

Je suis d'accord avec ton §10 et ton §23 : **c'est le cardio le problème le plus criant**. Les
chiffres relevés sur une même séance :

| Source | kcal |
|---|---:|
| Tapis | 101 |
| Montre (Garmin Venu 3) | 89 |
| Polar | 120 |
| **Force Tracker** | **57** |

On est à **environ la moitié** des trois autres — et c'est précisément le domaine où les équations
physiologiques sont les **mieux** établies (marche, course, vélo : équations ACSM). Donc ce n'est
probablement pas de l'incertitude, c'est **une erreur de modèle**.

**Mes questions, et sois critique :**

1. **Quelle équation prendre pour le cardio ?** Les équations métaboliques de l'ACSM (marche :
   `VO₂ = 0,1×vitesse + 1,8×vitesse×pente + 3,5` ; course : `0,2×vitesse + 0,9×vitesse×pente + 3,5`)
   sont-elles le bon choix, et quelles sont leurs limites (plages de vitesse validées, pente,
   elliptique/rameur non couverts) ?
2. **Que faire quand on n'a ni vitesse ni pente ?** L'application ne connaît souvent que
   **type + durée + intensité déclarée** (léger / modéré / intense). Vaut-il mieux une valeur MET par
   couple (type, intensité), ou demander la vitesse/distance ? Quelle est la perte de justesse ?
3. **Le point brut/actif de ton §8 s'applique-t-il ici aussi ?** Si oui, cela creuserait encore
   l'écart, ou le réduirait ? J'aimerais que tu poses le calcul.
4. **Une hypothèse à démolir** : je soupçonne que l'écart vient d'un **MET trop bas** appliqué au
   cardio, ou d'une durée mal prise en compte. Avant que je regarde le code, à quel endroit une
   application se trompe-t-elle typiquement d'un facteur 2 sur du cardio ?
5. **Le tapis affiche 101 : sur quoi se fonde-t-il ?** Un tapis connaît vitesse, pente, durée et le
   poids saisi. Est-ce la source la plus défendable des quatre pour un test de cohérence, ou
   a-t-il lui aussi un biais connu (surestimation classique des ergomètres) ?
6. **Et une question de fond** : faut-il que l'application affiche un chiffre de cardio *comparable*
   à celui du tapis et de la montre, ou un chiffre *juste* — sachant que les deux ne sont pas la
   même chose, et que l'utilisateur, lui, compare ?

## 4. Ce qu'on ne fait pas

Conformément à ton §18 et ton §24 : **aucune infrastructure** (ni BLE, ni AccessLink, ni API Garmin)
tant qu'on n'a pas montré que l'estimation s'améliore. Le protocole des 10 séances reste le plan.
