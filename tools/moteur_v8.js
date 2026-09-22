/* 🧪 MOTEUR V8 — CANDIDATE NON SERVIE. Module partagé par le banc et le contrôle négatif.
   ⛔⛔ V8 N'EST PAS ACTIVE. Aucun fichier servi ne l'appelle, aucun écran ne l'affiche.
   ⛔ Ce fichier n'est PAS chargé par `index.html` : c'est un simulateur Node, rien d'autre.

   ⭐ IL CONTIENT AUSSI LE MIROIR DE V0 (production), ré-écrit depuis la lecture de `state.js`.
   Le banc revalide ce miroir contre l'app SERVIE à chaque exécution — *une candidate comparée à
   un adversaire mal reproduit ne prouve rien.*

   ═══════════════════════════════════════════════════════════════════════════════════════════
   ⚖️ D'OÙ VIENT CHAQUE NOMBRE DE V8 — et ce qui se passe quand la source est faible.
   Chaque constante porte son étiquette :
     [A] fait MESURÉ dans Force Tracker              [B] résultat scientifique externe
     [C] inférence                                    [D] choix produit
     [E] incertain — mesuré dans les deux sens, jamais tranché seul
   ⛔ Aucun nombre [E] ne décide seul : il existe une variante qui mesure son absence.
   ═══════════════════════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────── LE MIROIR DE V0 (production) ─────────────────── */
const WORK_EXTRA = { bureau: 0, debout: 200, actif: 325, physique: 450 };
const GOAL_DELTA = { muscle: 350, perte: -450, recomp: -250, force: 200, equilibre: 0, endurance: 100 };
const PROT_RATIO = { muscle: 2.2, perte: 2.5, recomp: 2.6, force: 2.0, equilibre: 2.0, endurance: 1.7 };
const FAT_RATIO = { muscle: 0.9, perte: 0.8, recomp: 0.85, force: 1.0, equilibre: 0.85, endurance: 0.75 };
const PLANCHER = { H: 1500, F: 1200 };

function mBMR(p) {
  const base = 10 * p.bw + 6.25 * p.height - 5 * p.age;
  const mifflin = Math.round(p.gender === 'F' ? base - 161 : base + 5);
  const fin = v => p.smoker ? Math.round(v * 1.07) : v;
  if (p.lm == null) return fin(mifflin);
  return fin(Math.round(370 + 21.6 * p.lm));
}
function mSportExtra(p) {
  if (!p.othersport || p.othersport === 'aucun') return 0;
  return (p.activityLevel || 1.55) >= 1.725 ? 0 : 150;
}
function mTDEE(p) {
  return Math.round(mBMR(p) * p.activityLevel + (WORK_EXTRA[p.workType] || 0) + mSportExtra(p));
}
function mMacrosRegime(p, kcal) {
  if (p.foodMode === 'keto') {
    const carbs_g = Math.max(0, Math.round(kcal * 0.05 / 4));
    const prot_g = Math.max(0, Math.round(kcal * 0.15 / 4), Math.round(p.bw * 0.8));
    const fat_g = Math.max(0, Math.round((kcal - prot_g * 4 - carbs_g * 4) / 9));
    return { prot_g, fat_g, carbs_g };
  }
  return { carbs_g: Math.max(0, Math.round(kcal * 0.25 / 4)),
           prot_g: Math.max(0, Math.round(kcal * 0.30 / 4)),
           fat_g: Math.max(0, Math.round(kcal * 0.45 / 9)) };
}
/* ⛔⛔ LA VERSION QUI FERME, POUR V8 SEULEMENT — ET C'EST UN DÉFAUT HÉRITÉ DE V0, PAS INVENTÉ ICI.
   Le low-carb de production calcule ses TROIS macros à partir de trois pourcentages
   indépendants : 25 % + 30 % + 45 % arrondis séparément ne retombent pas sur la cible, et la
   mesure le montre (jusqu'à 6 kcal d'écart). ⭐ La correction ne touche PAS à l'identité du
   régime : **25 % de glucides et 30 % de protéines sont ce qui DÉFINIT le low-carb**, donc ils
   restent ; ce sont les LIPIDES qui deviennent le reste — exactement ce que le kéto fait déjà
   dans le code servi. *On rend cohérente la branche qui ne l'était pas, sur le modèle de sa
   jumelle qui l'était.* */
function mMacrosRegimeFerme(p, kcal) {
  if (p.foodMode === 'keto') return mMacrosRegime(p, kcal);
  const carbs_g = Math.max(0, Math.round(kcal * 0.25 / 4));
  const prot_g = Math.max(0, Math.round(kcal * 0.30 / 4));
  const fat_g = Math.max(0, Math.round((kcal - prot_g * 4 - carbs_g * 4) / 9));
  return { prot_g, fat_g, carbs_g };
}
function mV0(p) {
  const d = Object.prototype.hasOwnProperty.call(GOAL_DELTA, p.goal) ? GOAL_DELTA[p.goal] : 350;
  const brut = mTDEE(p) + d + (p.phase === 'charge' ? 100 : -100);
  const kcal = p.manualKcal != null ? Math.round(p.manualKcal)
    : Math.max(Math.round(brut), PLANCHER[p.gender === 'F' ? 'F' : 'H']);
  if (p.foodMode === 'keto' || p.foodMode === 'lowcarb') return Object.assign({ kcal }, mMacrosRegime(p, kcal));
  const prot_g = Math.round(p.bw * (PROT_RATIO[p.goal] || 2.2));
  const fat_g = Math.round(p.bw * (FAT_RATIO[p.goal] || 0.9));
  return { kcal, prot_g, fat_g, carbs_g: Math.max(0, Math.round((kcal - prot_g * 4 - fat_g * 9) / 4)) };
}

/* ─────────────────── LES VARIANTES INTERMÉDIAIRES (dossier du 22/09) ───────────────────
   ⛔ Conservées telles quelles : les jeter empêcherait de voir si V8 fait mieux OU PIRE.
   ⚠️ Aucune n'est gagnante par défaut — et V5 va se faire réfuter par Murphy & Koehler. */
const PROT_MIN_GKG = 0.8;
function poidsRefBrut(p) { const h = p.height / 100; return Math.min(p.bw, 30 * h * h); }
function poidsRefProt(p) {
  return Math.max(poidsRefBrut(p), p.bw * PROT_MIN_GKG / (PROT_RATIO[p.goal] || 2.2));
}
function _v45(p, kcal) {
  if (p.foodMode === 'keto' || p.foodMode === 'lowcarb') return Object.assign({ kcal }, mMacrosRegime(p, kcal));
  const prot_g = Math.round(poidsRefProt(p) * (PROT_RATIO[p.goal] || 2.2));
  const fat_g = Math.round(p.bw * (FAT_RATIO[p.goal] || 0.9));
  return { kcal, prot_g, fat_g, carbs_g: Math.max(0, Math.round((kcal - prot_g * 4 - fat_g * 9) / 4)) };
}
function mV4(p) { return _v45(p, mV0(p).kcal); }
const GOAL_PCT = { muscle: +0.12, perte: -0.20, recomp: -0.10, force: +0.07, equilibre: 0, endurance: +0.04 };
function mV5kcal(p) {
  if (p.manualKcal != null) return Math.round(p.manualKcal);
  const pct = Object.prototype.hasOwnProperty.call(GOAL_PCT, p.goal) ? GOAL_PCT[p.goal] : 0.12;
  return Math.max(Math.round(mTDEE(p) * (1 + pct) + (p.phase === 'charge' ? 100 : -100)),
                  PLANCHER[p.gender === 'F' ? 'F' : 'H']);
}
function mV5(p) { return _v45(p, mV5kcal(p)); }
const GLUC_MAX_GKG = 7.0, GLUC_MIN_GKG = 2.0;
function mV6gen(p, LIPMIN) {
  const kcal = mV5kcal(p);
  if (p.foodMode === 'keto' || p.foodMode === 'lowcarb') return Object.assign({ kcal }, mMacrosRegime(p, kcal));
  const prot_g = Math.round(poidsRefProt(p) * (PROT_RATIO[p.goal] || 2.2));
  let fat_g = Math.round(p.bw * (FAT_RATIO[p.goal] || 0.9));
  let carbs_g = Math.max(0, Math.round((kcal - prot_g * 4 - fat_g * 9) / 4));
  const cMax = Math.floor(p.bw * GLUC_MAX_GKG), cMin = Math.ceil(p.bw * GLUC_MIN_GKG);
  const fMin = Math.ceil(p.bw * LIPMIN);
  if (carbs_g > cMax) {
    carbs_g = cMax;
    fat_g = Math.max(0, Math.round((kcal - prot_g * 4 - carbs_g * 4) / 9));
  } else if (carbs_g < cMin) {
    fat_g -= Math.min(Math.max(0, fat_g - fMin), Math.ceil((cMin - carbs_g) * 4 / 9));
    carbs_g = Math.max(0, Math.round((kcal - prot_g * 4 - fat_g * 9) / 4));
  }
  return { kcal, prot_g, fat_g, carbs_g };
}
const mV6 = p => mV6gen(p, 0.5);
const mV7 = p => mV6gen(p, 0.8);

/* ═══════════════════════════════ V8 ═══════════════════════════════════════════════════════ */

/* ⭐ [B] MASSE GRASSE ESTIMÉE — Deurenberg 1991, équation publiée et très citée.
   ⛔ C'est un MODÈLE, jamais une mesure. Quand un bilan corporel FRAIS existe, on emploie sa
   masse maigre RÉELLE et l'estimation ne sert pas. La provenance est rendue dans `src_ffm`
   parce que *Force Tracker écrit déjà d'où vient un chiffre de masse grasse* (ft-v1231). */
function ffmDe(p) {
  if (p.lm != null) return { ffm: p.lm, bf: 100 * (1 - p.lm / p.bw), src: 'mesure' };
  const h = p.height / 100, imc = p.bw / (h * h);
  const bf = Math.min(60, Math.max(3, 1.20 * imc + 0.23 * p.age - 10.8 * (p.gender === 'F' ? 0 : 1) - 5.4));
  return { ffm: p.bw * (1 - bf / 100), bf, src: 'estimee' };
}

/* ⭐ [B] SEC / GRAS — les bornes de « sec » diffèrent entre hommes et femmes, ce n'est pas un
   choix : la masse grasse essentielle n'est pas la même. */
const BF_SEC = { H: 12, F: 20 }, BF_MOYEN = { H: 20, F: 28 }, BF_HAUT = { H: 30, F: 38 };

/* ⭐⭐ [B] VITESSE CIBLE EN % DU POIDS PAR SEMAINE — et c'est le cœur du changement.
   · perte : Helms 2014 recommande **0,5 à 1 %/sem** ; Garthe 2011 mesure que **0,7 %/sem**
     conserve mieux la masse maigre que 1,4 %/sem (24 athlètes d'élite). On reste DANS cette
     plage, en modulant par la masse grasse — *plus quelqu'un est sec, plus vite il perd du
     muscle*, ce que Helms écrit explicitement.
   · muscle : Iraki 2019 donne **+0,25 à 0,5 %/sem** chez novice/intermédiaire, « plus
     conservateur » chez l'avancé. ⭐ Et Helms 2023 (8 semaines, entraînés, 5 % vs 15 % de
     surplus) mesure **5 × plus de gras pour AUCUN gain supplémentaire** de force ni de masse
     maigre. 👉 *On prend donc le BAS de la plage d'Iraki, pas son milieu.*
   · recomp : [D] choix produit — mais PAS inventé : `state.js` porte déjà une décision actée
     (`trendPourObjectif`), **−0,3 à 0 kg/semaine**. −0,25 %/sem y tombe pour un adulte moyen.
     *Une décision actée reste actée* (règle d'or #15).
   · force / équilibre / endurance : [D], petits, alignés sur l'esprit des écarts actuels. */
function vitesseCible(p, bf) {
  const sec = BF_SEC[p.gender === 'F' ? 'F' : 'H'], haut = BF_HAUT[p.gender === 'F' ? 'F' : 'H'];
  const avance = p.level === 'confirme';
  switch (p.goal) {
    /* ⛔⛔ INTERPOLÉE, PAS EN MARCHES — et c'est le contre-audit qui l'a exigé.
       Avec trois paliers (−0,5 / −0,7 / −1,0), passer de 12 % à 13 % de masse grasse faisait
       **sauter la cible de 136 kcal**. *Une marche d'escalier sur une entrée continue est un
       bug qui ne se voit que le jour où quelqu'un franchit le seuil* — c'est une famille connue
       de `BUGS.md`. ⛔ Aucune source ne dit que la transition est discontinue : l'interpolation
       ne change donc aucune borne publiée, elle supprime une discontinuité que j'avais
       introduite. Les EXTRÊMES restent exactement ceux de Helms (−0,5 à −1,0 %/sem). */
    case 'perte': {
      if (bf <= sec) return -0.5;
      if (bf >= haut) return -1.0;
      const t = (bf - sec) / (haut - sec);
      return -(0.5 + 0.5 * t);
    }
    case 'recomp':    return -0.25;
    case 'muscle':    return avance ? -0 + 0.125 : 0.25;
    case 'force':     return avance ? 0.05 : 0.1;
    case 'endurance': return 0.05;
    case 'equilibre': return 0;
    default:          return 0.25;
  }
}

/* ⭐⭐ [B] LE PLAFOND DE DÉFICIT EST ABSOLU, PAS RELATIF — et il RÉFUTE ma V5.
   Murphy & Koehler 2022 (méta-analyse + méta-régression, entraînement en résistance ≥ 3
   semaines) : un déficit d'environ **500 kcal/j** empêche les gains de masse maigre, et leur
   recommandation est d'« éviter les déficits > 500 kcal/j » quand on veut préserver le muscle.
   ⛔⛔ Or **ma V5 rendait le déficit PROPORTIONNEL** (−20 % du TDEE) : à 150 kg, cela fait
   **−757 kcal/j**, bien au-delà. *Ma correction de la semaine dernière empirait ce qu'elle
   prétendait corriger, pour les profils lourds.* V8 prend donc le **minimum des deux
   contraintes**, et c'est une décision technique, pas un arbitrage rendu à Michel.
   ⚠️ [E] LES DEUX SOURCES SE CONTREDISENT CHEZ LES PROFILS LOURDS : 0,7 %/sem à 150 kg
   demande 1 155 kcal/j de déficit. Le conflit est réel et il est documenté, pas masqué. */
const DEFICIT_MAX_KCAL = 500;
/* ⭐ [B] Helms 2023 a testé **+15 %** et n'a trouvé que du gras. On ne monte donc jamais
   au-dessus de ce qui a été testé sans bénéfice démontré. */
const SURPLUS_MAX_PCT = 0.15;
const KCAL_PAR_KG = 7700;   // [B] équivalent énergétique usuel du tissu adipeux

/* ⭐⭐ [B] DISPONIBILITÉ ÉNERGÉTIQUE (CIO / RED-S) : EA = (apports − dépense d'exercice) / masse
   maigre. Sous **30 kcal/kg de masse maigre/j**, de nombreux systèmes sont perturbés ; 45 est
   décrit comme optimal. ⛔⛔ CE N'EST PAS UN DIAGNOSTIC : le consensus 2018 dit lui-même que ce
   seuil « ne prédit pas l'aménorrhée chez toutes les femmes » et que le tableau dépend des
   symptômes, de la durée et du sport. *Force Tracker n'est pas médecin* — le seuil sert ici de
   GARDE-FOU qui relève une prescription, jamais d'étiquette posée sur une personne. */
const EA_MIN = 30;
/* [C] Dépense d'exercice estimée : ~7 kcal/kg de poids par séance (ordre de grandeur d'une
   séance de musculation d'une heure). ⛔ C'est une INFÉRENCE, pas une mesure — et c'est
   pourquoi le garde-fou ne mord que lorsqu'il est franchement dépassé. */
function eeeParJour(p) { return (p.seancesSem || 0) * 7 * p.bw / 7; }

/* ⭐⭐ [B] PROTÉINES — LA QUESTION DU DÉNOMINATEUR EST TRANCHÉE PAR LE CONTEXTE, PAS PAR UN VOTE.
   Les deux sources ne se contredisent pas, elles ne parlent pas de la même situation :
     · Helms 2014 : **2,3–3,1 g/kg de MASSE MAIGRE**, chez des bodybuilders naturels
       **relativement secs, en déficit**, pour conserver le muscle. Et il écrit la règle de
       modulation : *plus la personne est sèche et plus le déficit est grand, plus haut dans la
       plage*. C'est exactement ce qu'on applique.
     · Morton 2018 : le bénéfice supplémentaire pour la masse maigre **plafonne vers 1,62 g/kg
       de POIDS DE CORPS** (méta-régression, > 1 800 sujets, entraînement en résistance).
       ⛔ Ce n'est PAS un plafond universel — c'est le point où le bénéfice MOYEN cesse de
       croître, dans des conditions qui ne sont pas celles d'un déficit chez un sujet sec.
   👉 ***Donc : un barème en MASSE MAIGRE, avec des bornes de bon sens en POIDS DE CORPS.***
   ⚠️ Et on ne mélange jamais les deux unités dans un même calcul (interdit explicite du brief). */
const PROT_FFM = { equilibre: 1.9, endurance: 1.8, force: 2.0, muscle: 2.0, recomp: 2.4, perte: 2.3 };
/* [B/E] BORNES EN POIDS DE CORPS. La basse (1,4) est le bas de la plage générale ISSN pour les
   sportifs. La haute (2,2) est la **limite supérieure de sécurité de l'ANSES** — ⚠️ retrouvée
   uniquement via des sources FRANÇAISES SECONDAIRES, le rapport lui-même étant inaccessible.
   ⛔ Elle ne décide donc pas seule : la variante `V8nc` mesure exactement ce qu'elle change. */
const PROT_BW_MIN = 1.4, PROT_BW_MAX = 2.2;

/* ⭐ [B] LIPIDES. Deux sources confirmées, et elles se recouvrent :
     · Helms 2014 : **15–30 % des calories** en préparation.
     · Iraki 2019 : **0,5–1,5 g/kg/j** hors saison.
   ⚠️⚠️ ET ÇA CORRIGE MA PROPRE RÉTRACTATION DU 22/09. J'avais écrit que « 0,5 g/kg n'est pas
   une recommandation mais une condition expérimentale ». **C'est faux** : 0,5 g/kg est la borne
   BASSE d'une plage publiée et revue par les pairs, pour cette population exacte.
   ⭐ Conséquence : les ratios actuels de Force Tracker (0,75 à 1,0 g/kg) sont **à l'intérieur**
   d'Iraki, et le « 33 % de la population sous 20 % des calories » de mon dossier précédent
   n'est **pas une violation** face à Helms (15–30 %). *Mon dossier avait tort sur ce point.* */
const LIP_GKG_MIN = 0.5, LIP_GKG_MAX = 1.5, LIP_PCT_MIN = 0.15, LIP_PCT_MAX = 0.35;

/* ⭐⭐ [B] GLUCIDES — LE SEUL CRITÈRE MESURABLE QUE LA LITTÉRATURE DONNE EST UN NOMBRE DE SÉRIES.
   Henselmans et al. 2022 (revue systématique, 49 études, entraînement en résistance) :
   **aucun effet ergogénique des glucides dans les protocoles NOURRIS à ≤ 10 séries par groupe
   musculaire** ; les bénéfices apparaissent surtout à jeun et au-delà de 10 séries par groupe.
   Et à long terme, aucune différence de force dans 15 études sur 17.
   👉 ***Force Tracker COMPTE les séries par groupe musculaire.*** Le seuil n'est donc pas
   inventé : il est publié ET mesurable ici. ⛔ Mais il ne devient PAS un plafond : il devient
   le niveau au-delà duquel une prescription glucidique élevée cesse d'être justifiée par
   l'entraînement — donc un SIGNAL, jamais une troncature (consigne explicite de Michel).
   ⚠️ [E] La plage 4–7 g/kg (Slater & Phillips, citée partout) n'a pas pu être lue à la source.
   Les « recommandations russes » n'ont **pas** été retrouvées, et les « recommandations
   japonaises » sont en réalité un **relevé de consommations** (5,0 à 8,3 g/kg chez des athlètes
   japonais réels) — une observation, pas une recommandation. Elles ne fondent aucune borne. */
const SERIES_SEUIL = 10;
/* [C] Bande glucidique JUSTIFIÉE par la charge : elle ne coupe rien, elle sert à dire
   « au-dessus, l'entraînement déclaré ne justifie plus ce niveau ». */
function bandeGlucides(p) {
  const s = p.seriesParGroupe || 0;
  if (s > SERIES_SEUIL) return 8;
  if ((p.seancesSem || 0) >= 4) return 6;
  if ((p.seancesSem || 0) >= 1) return 5;
  return 4;
}
/* ⭐ [B] Iraki 2019 : les bodybuilders consomment **~45 kcal/kg** hors saison et la
   recommandation tombe vers **42–48 kcal/kg**. Au-delà de 55, on n'est plus dans ce qui
   s'observe : le SIGNAL vise alors le TDEE et le niveau d'activité, pas l'assiette. */
const KCAL_KG_SIGNAL = 55;

function mV8gen(p, opts) {
  opts = opts || {};
  const sexe = p.gender === 'F' ? 'F' : 'H';
  const sig = [];

  /* ① données insuffisantes → on ne devine pas (R29, comportement déjà servi). */
  if (!(p.bw > 0) || !(p.height > 0) || !(p.age > 0)) return null;

  const tdee = mTDEE(p);
  const M_TDEE_CACHE = tdee;
  const { ffm, bf, src } = ffmDe(p);

  /* ② cible énergétique : une VITESSE, puis deux bornes, puis les planchers. */
  let kcal, vit = 0, deltaBrut = 0, borne = null;
  if (p.manualKcal != null) {
    kcal = Math.round(p.manualKcal);                     // [D] décision actée : le chiffre est le sien
    sig.push('cible_manuelle');
  } else {
    vit = vitesseCible(p, bf);
    deltaBrut = vit / 100 * p.bw * KCAL_PAR_KG / 7;
    /* ⭐ [D] LA PHASE CHARGE/DÉCHARGE EST UNE DÉCISION ACTÉE DU PRODUIT (±100 kcal), et ma
       première V8 la faisait disparaître **en silence**. ⛔ Une candidate n'a pas le droit de
       retirer une fonctionnalité décidée sans le dire (règle d'or #15) : elle est reprise telle
       quelle, et elle passe sous les mêmes bornes que le reste. */
    let delta = deltaBrut + (p.phase === 'charge' ? 100 : -100);
    if (delta < -DEFICIT_MAX_KCAL) { delta = -DEFICIT_MAX_KCAL; borne = 'deficit_plafonne'; }
    const maxSurp = tdee * SURPLUS_MAX_PCT;
    if (delta > maxSurp) { delta = maxSurp; borne = 'surplus_plafonne'; }
    kcal = Math.round(tdee + delta);
    /* ③ garde-fou disponibilité énergétique (CIO/RED-S) — il RELÈVE, il n'abaisse jamais. */
    const eaMini = Math.round(EA_MIN * ffm + eeeParJour(p));
    if (kcal < eaMini) { kcal = eaMini; sig.push('disponibilite_energetique'); }
    kcal = Math.max(kcal, PLANCHER[sexe]);
  }

  /* ④ régimes explicitement choisis : leur définition EST la règle (décision actée). */
  if (p.foodMode === 'keto' || p.foodMode === 'lowcarb') {
    /* ⭐ Le plafond de deficit est une contrainte de CALORIES : il vaut donc aussi pour un
       regime choisi, dont seule la REPARTITION est decidee par la personne. */
    if (p.manualKcal == null) kcal = Math.max(kcal, tdee - DEFICIT_MAX_KCAL);
    const m = mMacrosRegimeFerme(p, kcal);
    const kM = m.prot_g * 4 + m.fat_g * 9 + m.carbs_g * 4;
    return Object.assign({ kcal: kM, kcal_vise: kcal, vitesse: vit, ffm, bf, src_ffm: src, signaux: sig.concat('regime'), borne, faisable: true }, m);
  }

  /* ⑤ PROTÉINES — barème en masse maigre, bornes en poids de corps, jamais mélangés. */
  let gFFM = PROT_FFM[p.goal] != null ? PROT_FFM[p.goal] : 2.0;
  if (p.goal === 'perte' || p.goal === 'recomp') {
    /* Helms : plus sec ET plus gros déficit → plus haut dans la plage 2,3–3,1. */
    if (bf <= BF_SEC[sexe]) gFFM += 0.5;
    else if (bf <= BF_MOYEN[sexe]) gFFM += 0.2;
    const sev = Math.min(1, Math.abs(Math.min(0, kcal - tdee)) / DEFICIT_MAX_KCAL);
    gFFM += 0.3 * sev;
    gFFM = Math.min(gFFM, 3.1);                          // borne haute de Helms, jamais dépassée
  }
  let prot_g = Math.round(ffm * gFFM);
  /* ⛔⛔ LE PIÈGE DE L'ARRONDI, REFAIT PAR MOI UNE SEMAINE APRÈS L'AVOIR DOCUMENTÉ.
     Avec `Math.round`, `round(83 × 2,2) = 183`, soit **2,205 g/kg** — au-dessus du plafond que
     la ligne prétend tenir. Mesuré : 5 121 profils pour 100 000 le franchissaient. *Un plafond
     s'arrondit vers le BAS, un plancher vers le HAUT ; l'arrondi au plus proche transforme les
     deux en suggestions.* */
  const pMin = Math.ceil(p.bw * PROT_BW_MIN);
  const pMax = opts.sansPlafondProt ? Infinity : Math.floor(p.bw * PROT_BW_MAX);
  if (prot_g < pMin) prot_g = pMin;
  if (prot_g > pMax) { prot_g = pMax; sig.push('prot_plafonnee'); }

  /* ⑥ LIPIDES — g/kg d'abord, puis la fenêtre en % de l'énergie (Helms 15–30 %, élargie à 35 %
     pour laisser de la place à l'arbitrage du ⑧ sans jamais descendre sous le plancher). */
  let fat_g = Math.round(p.bw * (FAT_RATIO[p.goal] || 0.9));
  const fMinAbs = Math.ceil(p.bw * LIP_GKG_MIN);
  const fMinPct = Math.ceil(kcal * LIP_PCT_MIN / 9);
  const fMin = Math.max(fMinAbs, fMinPct);
  const fMax = Math.floor(kcal * LIP_PCT_MAX / 9);
  /* ⛔⛔ L'ORDRE DÉCIDE, ET MA PREMIÈRE VERSION LE DÉCIDAIT DANS LE MAUVAIS SENS.
     À cible très basse, le plancher (0,5 g/kg, santé) et le plafond (35 % des calories,
     répartition) deviennent **incompatibles** : chez 150 kg à 700 kcal, le plancher demande
     75 g et le plafond en autorise 27. Appliquer le plafond EN DERNIER faisait gagner le
     plafond — mesuré : **0,45 g/kg**, sous une borne de santé publiée.
     👉 ***Une borne de santé prime sur une préférence de répartition.*** Le plafond s'applique
     d'abord, le plancher tranche ensuite ; et quand les deux ne peuvent pas tenir, la
     prescription est déclarée INFAISABLE plus bas, au lieu de choisir en silence. */
  if (fMin > fMax) sig.push('bornes_lipides_en_conflit');
  fat_g = Math.max(fMin, Math.min(fat_g, fMax));
  /* ⛔⛔ DEUX BORNES PUBLIÉES PEUVENT SE CONTREDIRE, ET ON LE DIT AU LIEU DE CHOISIR EN SILENCE.
     · Helms 2014 : au moins **15 % des calories** en lipides.
     · Iraki 2019 : au plus **1,5 g/kg** de lipides.
     Elles ne peuvent pas tenir ensemble au-delà de ~120 kcal/kg de poids : chez quelqu'un de
     42 kg visant 5 000 kcal, 15 % de l'énergie font **2,0 g/kg**. ⛔ Aucune des deux n'est
     « la bonne » — c'est l'ENTRÉE qui est absurde, et c'est ça qu'il faut dire à la personne.
     👉 *Un moteur qui choisirait silencieusement laquelle des deux abandonner transformerait un
     conflit scientifique en décision invisible.* Le signal part avec la prescription. */
  if (fat_g / p.bw > LIP_GKG_MAX + 0.001 || fat_g * 9 / kcal > LIP_PCT_MAX + 0.001)
    sig.push('bornes_lipides_en_conflit');

  /* ⑦ GLUCIDES = le reste. ⛔ On ne jette JAMAIS les calories excédentaires. */
  let carbs_g = Math.round((kcal - prot_g * 4 - fat_g * 9) / 4);
  let faisable = true;

  /* ⑧ ARBITRAGE — deux directions, et aucune ne tronque.
     (a) le reste est NÉGATIF : protéines + lipides dépassent la cible. On redescend dans un
         ordre écrit — lipides d'abord vers leur plancher (ils sont le poste le plus dense),
         puis protéines vers le leur — et si ça ne suffit toujours pas, on le DIT.
     (b) le reste est très AU-DESSUS de ce que l'entraînement justifie : on rééquilibre vers
         les lipides jusqu'à leur plafond, puis on SIGNALE. */
  if (carbs_g < 0) {
    fat_g = Math.max(fMinAbs, Math.floor((kcal - prot_g * 4) / 9));
    carbs_g = Math.round((kcal - prot_g * 4 - fat_g * 9) / 4);
    if (carbs_g < 0) {
      prot_g = Math.max(pMin, Math.floor((kcal - fat_g * 9) / 4));
      carbs_g = Math.round((kcal - prot_g * 4 - fat_g * 9) / 4);
    }
    if (carbs_g < 0) {
      /* ⛔⛔ AUCUNE SOLUTION : les minimums de sécurité dépassent la cible. On ne fabrique pas
         une prescription fausse — on remonte la cible au minimum réalisable et on le déclare.
         *Un écran qui affiche deux totaux contradictoires ment ; un écran qui dit « ta cible
         est plus basse que tes besoins minimaux » informe.* */
      kcal = prot_g * 4 + fat_g * 9;
      carbs_g = 0;
      faisable = false;
      sig.push('cible_infaisable');
    }
  } else {
    const bande = bandeGlucides(p);
    if (carbs_g / p.bw > bande) {
      const cible = Math.floor(p.bw * bande);
      const besoin9 = Math.floor((carbs_g - cible) * 4 / 9);
      /* ⛔⛔ ET LA BASCULE EST BORNÉE PAR IRAKI, PAS SEULEMENT PAR LE % D'ÉNERGIE.
         Sans cette borne, plafonner les glucides poussait les lipides à **2,27 g/kg** au p99 —
         au-dessus de la borne haute publiée (1,5 g/kg). *On aurait déplacé l'absurdité au lieu
         de la résoudre*, ce que Michel avait annoncé mot pour mot. */
      const place = Math.max(0, Math.min(fMax, Math.floor(p.bw * LIP_GKG_MAX)) - fat_g);
      const bouge = Math.min(besoin9, place);
      if (bouge > 0) { fat_g += bouge; carbs_g = Math.round((kcal - prot_g * 4 - fat_g * 9) / 4); }
      if (carbs_g / p.bw > bande) sig.push('gluc_au_dela_de_la_charge');
    }
  }
  if (kcal / p.bw > KCAL_KG_SIGNAL) sig.push('tdee_a_reexaminer');

  /* ⑨ FERMETURE EXACTE — la cible retenue EST la somme des macros, au gramme près.
     ⭐ C'est le seul invariant de ce moteur qui ne dépend d'AUCUNE source externe. */
  let kcalMacros = prot_g * 4 + fat_g * 9 + carbs_g * 4;
  /* ⛔ LE PLAFOND DE DÉFICIT SE VÉRIFIE SUR CE QUI EST RÉELLEMENT PRESCRIT. La fermeture décale
     la cible de ±2 kcal, et un plafond vérifié sur la valeur VISÉE laissait donc 2 713 profils
     pour 100 000 franchir les 500 kcal de Murphy & Koehler — de 1 à 2 kcal, mais le franchir.
     *Une borne qui se mesure sur une valeur intermédiaire ne borne pas ce qu'on sert.* */
  if (p.manualKcal == null && faisable) {
    const mini = M_TDEE_CACHE - DEFICIT_MAX_KCAL;
    if (kcalMacros < mini) {
      carbs_g += Math.ceil((mini - kcalMacros) / 4);
      kcalMacros = prot_g * 4 + fat_g * 9 + carbs_g * 4;
    }
  }
  return { kcal: kcalMacros, kcal_vise: kcal, vitesse: vit, ffm: Math.round(ffm * 10) / 10,
           bf: Math.round(bf * 10) / 10, src_ffm: src, prot_g, fat_g, carbs_g,
           signaux: sig, borne, faisable };
}
const mV8 = p => mV8gen(p, {});
/* ⭐ `V8nc` = V8 SANS le plafond protéique de 2,2 g/kg. Il existe parce que ce plafond vient
   d'une source française SECONDAIRE : on mesure exactement ce qu'il change plutôt que de le
   défendre ou de l'abandonner à l'aveugle. */
const mV8nc = p => mV8gen(p, { sansPlafondProt: true });

module.exports = {
  VARIANTES: { V0: mV0, V4: mV4, V5: mV5, V6: mV6, V7: mV7, V8: mV8, V8nc: mV8nc },
  mBMR, mTDEE, mV0, mV8, ffmDe, vitesseCible, bandeGlucides,
  CONST: { DEFICIT_MAX_KCAL, SURPLUS_MAX_PCT, EA_MIN, PROT_FFM, PROT_BW_MIN, PROT_BW_MAX,
           LIP_GKG_MIN, LIP_GKG_MAX, LIP_PCT_MIN, LIP_PCT_MAX, SERIES_SEUIL, KCAL_KG_SIGNAL, KCAL_PAR_KG,
           PLANCHER, BF_SEC, BF_MOYEN, BF_HAUT }
};
