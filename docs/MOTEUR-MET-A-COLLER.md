# 🔥 Moteur MET de Force Tracker — code réel à reprendre

> À coller dans l'outil qui doit construire le module. **Ce n'est pas une description : c'est le
> code qui tourne aujourd'hui en production.**

## Le contexte technique (à respecter strictement)

- **JavaScript vanilla pur**, aucun framework, aucun build step, aucun npm.
- Un seul fichier `.js` chargé par `<script src="met-engine.js">`.
- Doit servir **deux consommateurs** : une PWA existante en JS vanilla (GitHub Pages) et une
  page HTML autonome.
- **Ni React, ni Next.js, ni Node côté serveur, ni bundler, ni TypeScript.**
- Des **fonctions pures** : elles prennent des données, elles rendent un nombre.

## ⚠️⚠️ LA CONTRAINTE QUI DÉCIDE DE TOUT

Le code ci-dessous **n'est PAS autonome**. `getExerciseMET()` appelle deux fonctions qui vivent
ailleurs dans l'application :

- `_mscScores(exercices)` → rend les muscles sollicités, à partir d'une table de **324 exercices**
- `_movPattern(nom)` → rend le schéma moteur (`hip-hinge`, `squat`, `push`, `pull`…)

**Il ne faut ni les recopier, ni les embarquer.** Le module doit devenir **PUR** : recevoir les
muscles et le schéma **en paramètres**, et ne connaître aucun catalogue d'exercices.

Interface visée :

```js
// AU LIEU DE : getExerciseMET('Squat à la Barre')   ← va chercher les muscles tout seul
// FAIRE      :
METEngine.metPourExercice({
  nom: 'Squat à la Barre',
  muscles: { quads: 2, glutes: 2, hamstrings: 1, 'lower-back': 1 },  // fourni par l'appelant
  schema: 'squat'                                                     // fourni par l'appelant
});
```

Ainsi Force Tracker lui passe les muscles issus de sa table, et l'application indépendante lui
passe les siens (saisis, ou d'une autre source). **Une seule logique de calcul, deux sources de
données.**

## ⚠️ Ce qu'il ne faut PAS toucher

Les **valeurs** et les **règles** ci-dessous ne sont pas des choix esthétiques : chacune vient d'un
bug réel, corrigé et mesuré. Les commentaires du code l'expliquent — **les conserver**. En
particulier :

- la règle **« 3 muscles ou plus = polyarticulaire »** (57 % du catalogue était mal classé avant) ;
- les deux listes de mots-clés (haltérophilie, cardio) qui **échappent volontairement** à la
  déduction par muscles ;
- le cas explicite des **portés** (farmer's walk) et des **charnières de hanche**.

## Le code réel, tel qu'il tourne aujourd'hui

```js

// ─── CALORIES BRÛLÉES ─────────────────────────────────────────
const MET_LOWER = 6.5;  // Squat, Deadlift, Hip Thrust, Leg Press
const MET_UPPER = 5.5;  // Bench, OHP, Rowing, Pull-ups
const MET_OLYMPIC = 8.0; // Arraché, Épaulé-jeté
const MET_CARDIO  = 8.0; // Corde à sauter, burpees, air bike… (voir CARDIO_KW plus bas)
const MET_ISO = 4.0;    // Isolation: curl, extension...
const MET_REST = 2.0;   // Entre les séries (position debout/assis)

// ⚠️ L'INTENSITÉ SE DÉDUIT DES MUSCLES, PLUS D'UNE 2ᵉ LISTE DE MOTS-CLÉS (ft-v668).
// Avant : `LOWER_KW`/`UPPER_KW`, une liste de 16 mots-clés **parallèle** à `_MEX` — donc
// condamnée à divergter. Mesuré le 29/07/2026 : **142 exercices sur 249 (57 %)** tombaient
// sur la valeur par défaut « isolation », dont **56 gros mouvements** manifestement faux
// (toutes les fentes, toutes les presses à jambes, kettlebell swing, hyperextensions,
// good morning, pompes, Meadows/Seal row, thruster…). 4.0 au lieu de 6.5 = **38 % de
// calories en moins** sur une séance de fentes. Retour Michel : « le calcul des calories
// est bien respecté avec les anciens et nouveaux exercices ? » — non.
// MAINTENANT : une seule source de vérité, la table des muscles (R2).
//   · polyarticulaire = **3 muscles ou plus** sollicités (le développé couché en a 3,
//     un curl en a 2) — c'est ça qui distingue un gros mouvement d'un exercice d'isolation ;
//   · la région dominante décide ensuite entre bas du corps (6.5) et haut (5.5).
// L'haltérophilie garde sa liste de mots : ce qui la définit est le caractère EXPLOSIF
// du mouvement, pas les muscles qu'il utilise.
const OLYMPIC_KW = ['Arraché','Épaulé','Jeté','Snatch','Clean','Jerk','Thruster','Turkish','Get-Up'];
// ⚠️ LE CARDIO AUSSI garde sa liste, et pour la MÊME raison que l'haltérophilie : ce qui le
// définit n'est pas le nombre de muscles mais le caractère CONTINU et essoufflant.
// Mesuré à l'audit du 02/08 : « Sauts à la Corde » n'active que 2 muscles (mollets, quadriceps)
// → moins de 3 → il tombait sur MET_ISO = 4.0, **la valeur la plus basse du barème**, à égalité
// avec un curl biceps. C'est le même piège qu'en ft-v668, sur une autre famille : la règle
// « 3 muscles ou plus » distingue bien un polyarticulaire d'une isolation, mais elle ne sait
// rien de l'ESSOUFFLEMENT. Un burpee et une corde à sauter coûtent cher avec peu de muscles.
const CARDIO_KW = ['Corde à Sauter','Sauts à la Corde','Air Bike','Assault','Ski Erg','Ergomètre',
  'Burpee','Jumping Jack','Bear Crawl','Marche de l\'Ours','Mountain Climber','Grimpeur',
  'Battle Rope','Box Jump','Wall Ball','Rameur','Tapis','Elliptique'];
// Le CHARIOT (sled) n'est PAS dans cette liste, volontairement : c'est de la force-endurance
// lourde, déjà bien servie par la déduction (6,5 = bas du corps). Le bac « Cardio » du sélecteur
// répond à « où le trouver ? » ; le MET répond à « combien ça coûte ? » — deux questions.
const _MET_REGIONS = {
  bas: ['quads','hamstrings','glutes','calves','hip-flexors','tibialis'],
  haut:['pec','front-delt','side-delt','triceps','lats','traps','rear-delt','biceps','forearms']
};
function getExerciseMET(name) {
  const n = name || '';
  if (OLYMPIC_KW.some(k => n.toLowerCase().includes(k.toLowerCase()))) return MET_OLYMPIC;
  if (CARDIO_KW.some(k => n.toLowerCase().includes(k.toLowerCase()))) return MET_CARDIO;
  // ⚠️ Les PORTÉS (farmer's walk & co) : le MET se déduit de la région des muscles, or on a
  // corrigé le 02/08 le farmer's walk en « avant-bras + trapèzes » (c'est la PRISE qui lâche,
  // pas les jambes). Effet de bord : il serait passé de 6,5 à 5,5 — alors que marcher chargé
  // reste une dépense de tout le corps. On le fixe donc explicitement, au lieu de laisser la
  // correction musculaire déplacer les calories sans qu'on l'ait voulu.
  if (/farmer|fermier|\bcarry\b|porte lourd|suitcase carry/i.test(n)) return MET_LOWER;
  try {
    if (typeof _mscScores === 'function') {
      const sc = (_mscScores([{name:n, sets:[{done:true}]}]) || {}).sc || {};
      const noms = Object.keys(sc);
      // moins de 3 muscles sollicités → exercice d'isolation
      if (noms.length < 3) return MET_ISO;
      // ⚠️ UNE CHARNIÈRE DE HANCHE EST UN MOUVEMENT DU BAS DU CORPS, par définition — soulevés,
      // roumains, good morning, rack pull. Sans cette ligne, la déduction par région se trompe :
      // `lower-back` n'appartient à AUCUNE des deux régions ci-dessous, donc il gonfle le
      // dénominateur sans jamais compter côté « bas » et tire la moyenne vers le haut du corps.
      // Mesuré le 02/08 : en retirant le quadriceps du soulevé ROUMAIN (il n'y travaille pas,
      // les genoux restent tendus), les 6 roumains basculaient de 6,5 à 5,5 — le coût d'un
      // développé couché pour l'exercice de chaîne postérieure le plus lourd du catalogue.
      // Une correction ANATOMIQUE ne doit pas déplacer les calories par effet de bord (même
      // leçon que le farmer's walk, ft-v730). Touche exactement 7 exercices, tous des hinges.
      if (typeof _movPattern === 'function' && _movPattern(n) === 'hip-hinge') return MET_LOWER;
      let bas = 0, tot = 0;
      for (const m of noms) { tot += sc[m]; if (_MET_REGIONS.bas.indexOf(m) >= 0) bas += sc[m]; }
      return (tot > 0 && bas / tot >= 0.5) ? MET_LOWER : MET_UPPER;
    }
  } catch (e) {}
  return MET_ISO;   // exercice inconnu du moteur : on n'invente pas une grosse dépense
```
