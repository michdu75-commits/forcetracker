#!/usr/bin/env node
/* 🔒 PHASE DE VERROUILLAGE — INSTRUMENT INDÉPENDANT.
   ⛔ LECTURE SEULE : aucun fichier servi n'est modifié, aucune version n'est posée.

   ⭐⭐ POURQUOI UN INSTRUMENT NEUF PLUTÔT QUE RELANCER LES PRÉCÉDENTS.
   Le brief dit : *« Ne suppose pas que le dossier précédent a raison : REPRODUIS les mesures
   importantes »*. Relancer `corpus_nutri.js` ne reproduirait rien — il rendrait le MÊME nombre
   par le MÊME chemin. Un deuxième passage sur la même route ne prouve pas la route.
   👉 Ici on construit un **MIROIR** du moteur, ré-écrit à la main à partir de la LECTURE de
   `state.js`, puis on le confronte à l'app SERVIE. Deux chemins, une seule vérité :
     · si le miroir et l'app disent la même chose sur un échantillon, alors ① ma lecture du
       moteur est juste, et ② le miroir peut porter les millions de profils que le navigateur
       ne peut pas porter ;
     · s'ils divergent, c'est ma LECTURE qui est fausse — et tout ce qui en découle avec elle.
   ⛔ Le miroir ne remplace jamais l'app : il est VALIDÉ par elle, à chaque exécution.

   ⚠️ PÉRIMÈTRE DU MIROIR, ÉCRIT PLUTÔT QUE SUPPOSÉ. Il couvre `bmrDetail` → `calcTDEE` →
   `_autoKcalBrut` → `_plancherKcal` → `macrosForKcal`. Il NE couvre PAS `cycleGlucides`
   (qui relit l'historique de séances, `_weeklyCounts`, `_semainesVecues`, `_calSessRegion`) :
   ce chemin-là est mesuré séparément, DANS le navigateur, sur un corpus plus petit.
   *Un miroir qui prétendrait tout couvrir mentirait sur la seule partie qu'il ne peut pas.* */

const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
  '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2',
  '.webp':'image/webp','.ico':'image/x-icon','.wasm':'application/wasm'};

/* ═══════════════════ A — LE MIROIR (ré-écrit depuis la lecture de state.js) ═══════════════ */

const WORK_EXTRA = { bureau: 0, debout: 200, actif: 325, physique: 450 };
const GOAL_DELTA = { muscle: 350, perte: -450, recomp: -250, force: 200, equilibre: 0, endurance: 100 };
const PROT_RATIO = { muscle: 2.2, perte: 2.5, recomp: 2.6, force: 2.0, equilibre: 2.0, endurance: 1.7 };
const FAT_RATIO  = { muscle: 0.9, perte: 0.8, recomp: 0.85, force: 1.0, equilibre: 0.85, endurance: 0.75 };
const PLANCHER   = { H: 1500, F: 1200 };

/* p = { gender, bw, height, age, activityLevel, workType, goal, phase, smoker,
         othersport, lm (masse maigre fraîche ou null), foodMode } */
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
function mKcalBrut(p) {
  const d = Object.prototype.hasOwnProperty.call(GOAL_DELTA, p.goal) ? GOAL_DELTA[p.goal] : 350;
  return mTDEE(p) + d + (p.phase === 'charge' ? 100 : -100);
}
function mKcal(p) {
  return Math.max(Math.round(mKcalBrut(p)), PLANCHER[p.gender === 'F' ? 'F' : 'H']);
}
function mMacros(p, kcal) {
  if (p.foodMode === 'keto') {
    const carbs_g = Math.max(0, Math.round(kcal * 0.05 / 4));
    const prot_g = Math.max(0, Math.round(kcal * 0.15 / 4), Math.round(p.bw * 0.8));
    const fat_g = Math.max(0, Math.round((kcal - prot_g * 4 - carbs_g * 4) / 9));
    return { prot_g, fat_g, carbs_g };
  }
  if (p.foodMode === 'lowcarb') {
    return { carbs_g: Math.max(0, Math.round(kcal * 0.25 / 4)),
             prot_g: Math.max(0, Math.round(kcal * 0.30 / 4)),
             fat_g: Math.max(0, Math.round(kcal * 0.45 / 9)) };
  }
  const prot_g = Math.round(p.bw * (PROT_RATIO[p.goal] || 2.2));
  const fat_g = Math.round(p.bw * (FAT_RATIO[p.goal] || 0.9));
  return { prot_g, fat_g, carbs_g: Math.max(0, Math.round((kcal - prot_g * 4 - fat_g * 9) / 4)) };
}
function mV0(p) { const kcal = mKcal(p); return Object.assign({ kcal }, mMacros(p, kcal)); }

/* ═══════════════════ B — LES VARIANTES CANDIDATES (hypothèses, pas recommandations) ═══════
   ⛔⛔ AUCUNE DE CES VARIANTES N'EST PROPOSÉE À LA PUBLICATION. Elles existent pour MESURER
   ce que chaque correction changerait, et pour que Michel arbitre sur des nombres.
   ⚠️ Chaque borne employée est tracée dans `docs/VERROU-NUTRITION-2026-09-22.md` avec sa
   source, son unité, sa population et son niveau de confiance. Aucune n'est choisie « pour
   faire passer un test » — et celles qui ne sont PAS assez établies sont dites comme telles. */

/* Poids de référence pour les PROTÉINES. La littérature exprime ses g/kg soit en poids de
   corps, soit en masse maigre — et les mélanger est précisément ce que le brief interdit.
   ⭐ Ici : si une masse maigre FRAÎCHE existe, on l'emploie avec son propre barème ; sinon on
   emploie le poids de corps, PLAFONNÉ au poids d'un IMC 30 (pratique de nutrition clinique
   pour l'obésité — NON VÉRIFIÉE à la source, voir le dossier). */
function poidsRefBrut(p) {
  const imc30 = 30 * (p.height / 100) * (p.height / 100);
  return Math.min(p.bw, imc30);
}
/* ⛔⛔ LE PLANCHER N'EST PAS UNE PRÉCAUTION D'ÉCRITURE : IL FERME UN DÉFAUT MESURÉ ICI.
   Sans lui, plafonner le dénominateur à l'IMC 30 fait tomber les protéines sous **0,8 g/kg de
   poids RÉEL** dans 2 048 profils — alors que V0 n'en produisait **aucun**. C'est mot pour mot
   le défaut qui avait tué V1/V2 sur les lipides : *une correction qui casse un invariant que
   la version d'avant tenait n'est pas une correction.*
   ⭐ Et le nombre employé n'est pas choisi : **0,8 g/kg est le seuil d'alerte du Gardien de
   Milo**, déjà servi, déjà cité par `macrosForKcal` dans la branche kéto. On réemploie une
   borne de la maison (R13) au lieu d'en inventer une pour faire passer un test. */
const PROT_MIN_GKG = 0.8;
function poidsRefProt(p) {
  const brut = poidsRefBrut(p);
  const ratio = PROT_RATIO[p.goal] || 2.2;
  return Math.max(brut, p.bw * PROT_MIN_GKG / ratio);
}
/* V4 — le DÉNOMINATEUR des protéines est corrigé ; les lipides restent sur le poids RÉEL.
   ⛔ C'est la leçon du contre-audit : appliquer le poids réduit AUX DEUX macros faisait
   tomber les lipides sous 0,5 g/kg (0 cas en V0 → 1 920 en V1). Une correction qui casse un
   invariant que la version d'avant tenait n'est pas une correction. */
function mV4(p) {
  const kcal = mKcal(p);
  if (p.foodMode === 'keto' || p.foodMode === 'lowcarb') return Object.assign({ kcal }, mMacros(p, kcal));
  const prot_g = Math.round(poidsRefProt(p) * (PROT_RATIO[p.goal] || 2.2));
  const fat_g = Math.round(p.bw * (FAT_RATIO[p.goal] || 0.9));
  return { kcal, prot_g, fat_g, carbs_g: Math.max(0, Math.round((kcal - prot_g * 4 - fat_g * 9) / 4)) };
}
/* V5 — V4 + l'écart calorique devient PROPORTIONNEL au TDEE au lieu d'être un nombre fixe.
   ⛔ Le défaut mesuré en V0 : −450 kcal fixes valent −0,53 %/sem à 60 kg et −0,24 %/sem à
   130 kg — l'INVERSE de ce que la littérature recommande (plus la personne est lourde, plus
   le déficit peut être grand). Les pourcentages employés ici sont ceux du dossier. */
const GOAL_PCT = { muscle: +0.12, perte: -0.20, recomp: -0.10, force: +0.07, equilibre: 0, endurance: +0.04 };
function mV5kcal(p) {
  const tdee = mTDEE(p);
  const pct = Object.prototype.hasOwnProperty.call(GOAL_PCT, p.goal) ? GOAL_PCT[p.goal] : 0.12;
  const brut = tdee * (1 + pct) + (p.phase === 'charge' ? 100 : -100);
  return Math.max(Math.round(brut), PLANCHER[p.gender === 'F' ? 'F' : 'H']);
}
function mV5(p) {
  const kcal = mV5kcal(p);
  if (p.foodMode === 'keto' || p.foodMode === 'lowcarb') return Object.assign({ kcal }, mMacros(p, kcal));
  const prot_g = Math.round(poidsRefProt(p) * (PROT_RATIO[p.goal] || 2.2));
  const fat_g = Math.round(p.bw * (FAT_RATIO[p.goal] || 0.9));
  return { kcal, prot_g, fat_g, carbs_g: Math.max(0, Math.round((kcal - prot_g * 4 - fat_g * 9) / 4)) };
}
/* V6 — V5 + les GLUCIDES cessent d'être un résidu sans borne : ils sont encadrés, et ce sont
   les LIPIDES qui absorbent l'écart — dans les deux sens, et jamais sous leur propre plancher.
   ⭐ C'est le seul point où le brief est explicite : *« Ne pas sacrifier les lipides uniquement
   pour faire rentrer protéines + glucides dans une cible »*. Donc le plancher lipidique est
   une CONTRAINTE DURE, et quand il mord, ce sont les glucides qui sortent de leur plage — et
   il faut pouvoir le DIRE, pas le masquer. */
const GLUC_MAX_GKG = 7.0;   // borne haute retenue (Slater & Phillips, sports de force)
const GLUC_MIN_GKG = 2.0;   // borne basse retenue (bas de la plage « physique athletes »)
/* ⚠️⚠️ CE PLANCHER EST PROBABLEMENT TROP BAS, ET JE LE DIS AU LIEU DE LE CHANGER TOUT SEUL.
   Les sources secondaires consultées le 22/09 donnent un minimum de **0,8 à 1 g/kg** pour la
   fonction hormonale, et situent 0,5 g/kg comme une condition EXPÉRIMENTALE de diète très
   pauvre en lipides, pas comme une recommandation. ⛔ Aucune n'a pu être lue à la source (le
   proxy refuse le CONNECT), donc ni 0,5 ni 0,8 n'est établi ici. 👉 On MESURE les deux —
   V6 à 0,5 et V7 à 0,8 — et Michel tranche sur les nombres. *Choisir moi-même reviendrait à
   transformer un extrait de moteur de recherche en règle, ce que le brief interdit.* */
const LIP_MIN_GKG  = 0.5;
const LIP_MIN_GKG_HAUT = 0.8;
function mV6gen(p, LIPMIN) {
  const kcal = mV5kcal(p);
  if (p.foodMode === 'keto' || p.foodMode === 'lowcarb') return Object.assign({ kcal }, mMacros(p, kcal));
  const prot_g = Math.round(poidsRefProt(p) * (PROT_RATIO[p.goal] || 2.2));
  let fat_g = Math.round(p.bw * (FAT_RATIO[p.goal] || 0.9));
  let carbs_g = Math.max(0, Math.round((kcal - prot_g * 4 - fat_g * 9) / 4));
  /* ⛔⛔ `Math.ceil`, PAS `Math.round` — ET C'EST UN DÉFAUT QUE J'AI ÉCRIT PUIS MESURÉ.
     Avec `round`, un plancher n'est pas un plancher : à 70,5 kg, `round(70,5 × 0,5)` vaut 35,
     soit **0,4965 g/kg** — sous la borne que la ligne prétend tenir. Mesuré sur la population
     réaliste : **325 profils pour 100 000** passaient sous 0,5 g/kg de lipides, alors que V0
     n'en produit **aucun**. C'est exactement le défaut qui avait tué V1/V2, refait par moi sur
     une ligne d'arrondi. 👉 *Un plancher s'arrondit vers le HAUT, un plafond vers le BAS ;
     l'arrondi au plus proche transforme les deux en suggestions.*
     ⚠️ Le plafond des glucides descend donc au `floor` pour la même raison. */
  const cMax = Math.floor(p.bw * GLUC_MAX_GKG), cMin = Math.ceil(p.bw * GLUC_MIN_GKG);
  const fMin = Math.ceil(p.bw * LIPMIN);
  let borne = null;
  if (carbs_g > cMax) {                       // trop de glucides → on remonte les lipides
    carbs_g = cMax;
    fat_g = Math.max(0, Math.round((kcal - prot_g * 4 - carbs_g * 4) / 9));
    borne = 'gluc_plafonnes';
  } else if (carbs_g < cMin) {                // pas assez → on baisse les lipides, PAS sous fMin
    const dispo = Math.max(0, fat_g - fMin);
    const besoin = Math.ceil((cMin - carbs_g) * 4 / 9);
    const pris = Math.min(dispo, besoin);
    fat_g -= pris;
    carbs_g = Math.max(0, Math.round((kcal - prot_g * 4 - fat_g * 9) / 4));
    borne = (carbs_g < cMin) ? 'gluc_sous_borne_plancher_lipide' : 'gluc_releves';
  }
  return { kcal, prot_g, fat_g, carbs_g, borne };
}
const mV6 = p => mV6gen(p, LIP_MIN_GKG);
/* V7 — V6 avec le plancher lipidique haut (0,8 g/kg). Mesuré, pas recommandé. */
const mV7 = p => mV6gen(p, LIP_MIN_GKG_HAUT);


/* ═══════════════════ C — LES PROPRIÉTÉS TESTÉES (§9 : garde-fous absolus) ═════════════════
   ⛔ Chacune doit être VÉRIFIABLE PAR DU CODE et justifiée. Une propriété qu'on ne sait pas
   justifier est marquée « observation », pas « garde-fou ». */
/* ⛔⛔ UN RÉGIME CHOISI N'EST PAS UNE VIOLATION — ET MON INSTRUMENT LE COMPTAIT COMME TELLE.
   Le kéto est DÉFINI par 5 % des calories en glucides ; lui reprocher « moins de 1 g/kg » c'est
   lui reprocher d'être du kéto. Mesuré : sur la population réaliste, V6 affichait **4 357 pour
   100 000** sous 1 g/kg — dont l'écrasante majorité étaient des profils kéto parfaitement
   conformes. 👉 *Une propriété appliquée à une population qu'elle ne concerne pas ne mesure pas
   un défaut, elle mesure mon erreur de périmètre.*
   ⛔ On ne les EFFACE pas pour autant : elles sont comptées à part, suffixées `@regime`. Un
   nombre qui disparaît d'un tableau se relit comme un nombre à zéro (R30). */
const PROPS_REGIME = new Set(['gluc_sous_1_gkg', 'gluc_sur_7_gkg', 'gluc_sur_8_gkg',
  'gluc_sur_12_gkg', 'gluc_zero', 'lip_sur_40pct_cal', 'lip_sous_15pct_cal',
  'lip_sous_20pct_cal', 'lip_sous_0_5_gkg', 'lip_sous_0_8_gkg']);
function proprietes(p, r) {
  const brut = _proprietes(p, r);
  if (!p.foodMode) return brut;
  return brut.map(v => PROPS_REGIME.has(v) ? v + '@regime' : v);
}
function _proprietes(p, r) {
  const out = [];
  const bw = p.bw;
  const kcalMacros = r.prot_g * 4 + r.fat_g * 9 + r.carbs_g * 4;
  const ecart = kcalMacros - r.kcal;
  if (!(r.kcal > 0) || !isFinite(r.kcal)) out.push('kcal_invalide');
  if (r.prot_g < 0 || r.fat_g < 0 || r.carbs_g < 0) out.push('macro_negative');
  if (!isFinite(r.prot_g) || !isFinite(r.fat_g) || !isFinite(r.carbs_g)) out.push('macro_nan');
  if (r.kcal < PLANCHER[p.gender === 'F' ? 'F' : 'H']) out.push('sous_plancher');
  if (Math.abs(ecart) > 5) out.push('fermeture_>5kcal');
  if (Math.abs(ecart) > 50) out.push('fermeture_>50kcal');
  if (Math.abs(ecart) > 200) out.push('fermeture_>200kcal');
  if (r.prot_g / bw < 0.8) out.push('prot_sous_0_8_gkg');
  if (r.prot_g / bw > 3.1) out.push('prot_sur_3_1_gkg');
  if (r.prot_g * 4 / r.kcal > 0.40) out.push('prot_sur_40pct_cal');
  if (r.fat_g / bw < LIP_MIN_GKG) out.push('lip_sous_0_5_gkg');
  if (r.fat_g / bw < LIP_MIN_GKG_HAUT) out.push('lip_sous_0_8_gkg');
  if (r.fat_g * 9 / r.kcal < 0.20) out.push('lip_sous_20pct_cal');
  /* ⚠️ DÉNOMINATEUR MASSE MAIGRE — la borne 2,3-3,1 g/kg de la littérature est
     exprimée en MASSE MAIGRE, pas en poids de corps. Faute de mesure, on l'estime
     par Deurenberg (1991), équation publiée et très citée. ⛔ C'est un MODÈLE, pas
     une mesure : le chiffre qui en sort dit un ORDRE, jamais un diagnostic. */
  const imc = bw / ((p.height/100)*(p.height/100));
  const bfPct = Math.min(60, Math.max(3, 1.20*imc + 0.23*p.age - 10.8*(p.gender==='F'?0:1) - 5.4));
  const ffm = bw * (1 - bfPct/100);
  if (r.prot_g / ffm > 3.1) out.push('prot_sur_3_1_gkg_MM_estimee');
  if (r.prot_g / ffm < 1.4) out.push('prot_sous_1_4_gkg_MM_estimee');
  if (r.fat_g * 9 / r.kcal < 0.15) out.push('lip_sous_15pct_cal');
  if (r.fat_g * 9 / r.kcal > 0.40) out.push('lip_sur_40pct_cal');
  if (r.carbs_g === 0) out.push('gluc_zero');
  if (r.carbs_g / bw < 1) out.push('gluc_sous_1_gkg');
  if (r.carbs_g / bw > GLUC_MAX_GKG) out.push('gluc_sur_7_gkg');
  if (r.carbs_g / bw > 8) out.push('gluc_sur_8_gkg');
  if (r.carbs_g / bw > 12) out.push('gluc_sur_12_gkg');
  return out;
}

/* ═══════════════════ D — CORPUS ═══════════════════════════════════════════════════════════ */
const SEXE = ['H', 'F'];
const AGE = [18, 25, 35, 45, 55, 65, 75, 85];
const TAILLE = [148, 155, 162, 170, 178, 186, 195, 203];
const POIDS = [42, 50, 55, 60, 70, 80, 85, 95, 105, 120, 130, 150];
const ACT = [1.375, 1.55, 1.725, 1.9];
const WORK = ['bureau', 'debout', 'actif', 'physique'];
const GOAL = ['muscle', 'perte', 'recomp', 'force', 'equilibre', 'endurance'];
const PHASE = ['charge', 'decharge'];
const SMOKER = [false, true];
const SPORT = ['aucun', 'velo'];

function* corpus() {
  for (const gender of SEXE) for (const age of AGE) for (const height of TAILLE)
    for (const bw of POIDS) for (const activityLevel of ACT) for (const workType of WORK)
      for (const goal of GOAL) for (const phase of PHASE) for (const smoker of SMOKER)
        for (const othersport of SPORT)
          yield { gender, age, height, bw, activityLevel, workType, goal, phase,
                  smoker, othersport, lm: null, foodMode: '' };
}

function pct(arr, q) { const a = arr.slice().sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(q * a.length))]; }

/* ═══════════════════ D2 — LA POPULATION RÉALISTE ═════════════════════════════════════════
   ⛔⛔ POURQUOI ELLE EXISTE, ET C'EST LE PIÈGE LE PLUS FACILE DE TOUT CE DOSSIER.
   Le quadrillage ci-dessus met sur le même plan « 85 kg pour 148 cm » et « 85 kg pour 178 cm ».
   Un pourcentage calculé dessus (« 24,6 % des profils dépassent 7 g/kg ») dit ce que fait le
   MOTEUR sur toutes les entrées possibles — il ne dit **rien** de ce que vivent les gens.
   👉 ***Un taux sur un quadrillage uniforme n'est pas une prévalence.*** Les deux nombres sont
   utiles et ne répondent pas à la même question : le quadrillage dit *« le moteur peut-il
   produire ça ? »*, la population dit *« combien de personnes le verraient ? »*.
   ⚠️ Et la population ci-dessous est un MODÈLE, pas un recensement : taille et poids tirés de
   lois normales grossières, objectifs et activité tirés selon des poids plausibles pour une app
   de musculation. Elle n'est pas calée sur les utilisateurs réels de Force Tracker — l'app ne
   remonte pas ces distributions. *Une population modélisée reste une hypothèse ; elle se dit.* */
let _seed = 20260922;
function rnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return _seed / 0x7fffffff; }
function gauss(mu, sd) { const u = Math.max(1e-9, rnd()), v = rnd();
  return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function tire(tab) { const t = tab.reduce((a, x) => a + x[1], 0); let r = rnd() * t;
  for (const [v, p] of tab) { r -= p; if (r <= 0) return v; } return tab[tab.length - 1][0]; }
function profilRealiste() {
  const gender = rnd() < 0.72 ? 'H' : 'F';       // musculation : population majoritairement masculine
  const height = Math.round(Math.min(205, Math.max(145, gauss(gender === 'H' ? 176 : 164, 7))));
  const imc = Math.min(45, Math.max(16, gauss(25.5, 4.2)));
  const bw = Math.round(imc * (height / 100) * (height / 100) * 10) / 10;
  const age = Math.round(Math.min(80, Math.max(16, gauss(34, 12))));
  return { gender, height, bw, age,
    activityLevel: +tire([[1.375, 25], [1.55, 45], [1.725, 25], [1.9, 5]]),
    workType: tire([['bureau', 55], ['debout', 20], ['actif', 17], ['physique', 8]]),
    goal: tire([['muscle', 38], ['perte', 30], ['recomp', 14], ['force', 8], ['equilibre', 8], ['endurance', 2]]),
    phase: tire([['charge', 75], ['decharge', 25]]),
    smoker: rnd() < 0.18, othersport: rnd() < 0.35 ? 'velo' : 'aucun',
    lm: null, foodMode: tire([['', 92], ['keto', 4], ['lowcarb', 4]]) };
}

/* ═══════════════════ E — EXÉCUTION ════════════════════════════════════════════════════════ */
(async () => {
  const T = {}; const t0 = Date.now();

  /* ── E1. VALIDATION DU MIROIR CONTRE L'APP SERVIE ──────────────────────────────────────
     Échantillon stratifié : un profil sur N du corpus complet, plus les cas limites connus. */
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(r);
  });
  await new Promise(r => srv.listen(0, r));
  const PORT = srv.address().port;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`try{localStorage.clear();}catch(e){}`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  // échantillon : 1 profil sur 47 (nombre premier → balaye toutes les dimensions)
  const ech = []; let i = 0;
  for (const p of corpus()) { if (i++ % 47 === 0) ech.push(p); }
  /* ⛔⛔ LES BRANCHES RARES SONT AJOUTÉES EN NOMBRE, ET C'EST LE CONTRÔLE NÉGATIF QUI L'A EXIGÉ.
     Première version : 2 profils avec masse maigre, 1 kéto, 1 low-carb. Les mutations qui
     visaient ces branches rougissaient bien — mais avec **1 ou 2 écarts**. 👉 *Un témoin qui ne
     tient qu'à un seul profil rougit aujourd'hui et devient muet le jour où ce profil bouge.*
     On ne mesure pas « est-ce que ça rougit », on mesure « est-ce que ça rougit ROBUSTEMENT ». */
  for (const gender of ['H', 'F']) for (const mgPct of [10, 18, 25, 32, 40])
    for (const goal of ['muscle', 'perte', 'recomp', 'force', 'equilibre', 'endurance'])
      for (const bw of [55, 75, 95, 120]) {
        ech.push({ gender, age: 40, height: gender === 'H' ? 178 : 165, bw,
          activityLevel: 1.55, workType: 'bureau', goal, phase: 'charge', smoker: false,
          othersport: 'aucun', lm: Math.round(bw * (1 - mgPct / 100) * 10) / 10, foodMode: '' });
      }
  /* ⛔⛔ ET L'ACTIVITÉ FAIT PARTIE DE LA COUVERTURE — LE CONTRÔLE NÉGATIF ME L'A APPRIS.
     En « élargissant » l'échantillon kéto (plus de poids, plus d'objectifs) j'avais fixé
     l'activité à 1,55 — et le plancher protéique kéto (0,8 g/kg) **ne mord que chez quelqu'un
     de lourd ET peu actif**, là où les calories sont basses par rapport au poids. La mutation
     M15 est donc passée de **rouge à VERT en agrandissant le corpus**.
     👉 ***Élargir un échantillon n'est pas couvrir un régime*** : j'avais ajouté des profils et
     retiré la seule condition qui activait la règle que je prétendais mesurer. */
  for (const foodMode of ['keto', 'lowcarb']) for (const bw of [50, 70, 90, 110, 130])
    for (const goal of ['muscle', 'perte', 'recomp', 'equilibre'])
      for (const phase of ['charge', 'decharge'])
        for (const [activityLevel, age] of [[1.55, 35], [1.375, 55], [1.375, 75]]) {
          ech.push({ gender: 'H', age, height: 178, bw, activityLevel,
            workType: 'bureau', goal, phase, smoker: false, othersport: 'aucun', lm: null, foodMode });
        }
  ech.push({ gender: 'F', age: 78, height: 148, bw: 120, activityLevel: 1.375, workType: 'bureau', goal: 'perte', phase: 'decharge', smoker: false, othersport: 'aucun', lm: null, foodMode: '' });

  const tMiroir0 = Date.now();
  const APP = await pg.evaluate((profils) => {
    const j = n => { const d = new Date(Date.now() - n * 864e5);
      return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
    const out = [];
    for (const p of profils) {
      S.gender = p.gender; S.bw = p.bw; S.height = p.height; S.age = p.age;
      S.activityLevel = p.activityLevel; S.workType = p.workType; S.goal = p.goal;
      S.smoker = !!p.smoker; S.nutritionPhase = p.phase; S.manualKcal = null;
      S.foodMode = p.foodMode || ''; S.keto = false;
      S.sessions = []; S.weightLog = []; S.mensLog = []; S.stepsLog = [];
      S.coachQuiz = { answers: { othersport: p.othersport } };
      S.bodyScans = p.lm != null ? [{ date: j(3), leanMass: p.lm, weight: p.bw }] : [];
      S.mensCycleStart = null; S.contraception = '';
      const tdee = calcTDEE();
      const m = calcMacros(p.phase);
      out.push({ bmr: calcBMR(), tdee: tdee, kcal: m.calories,
                 prot_g: m.prot_g, fat_g: m.fat_g, carbs_g: m.carbs_g });
    }
    return out;
  }, ech);
  T.validation_ms = Date.now() - tMiroir0;

  const ecarts = [];
  ech.forEach((p, k) => {
    const a = APP[k];
    const bmr = mBMR(p), tdee = mTDEE(p), v0 = mV0(p);
    const diff = [];
    if (a.bmr !== bmr) diff.push(`bmr ${a.bmr}≠${bmr}`);
    if (a.tdee !== tdee) diff.push(`tdee ${a.tdee}≠${tdee}`);
    if (a.kcal !== v0.kcal) diff.push(`kcal ${a.kcal}≠${v0.kcal}`);
    if (a.prot_g !== v0.prot_g) diff.push(`prot ${a.prot_g}≠${v0.prot_g}`);
    if (a.fat_g !== v0.fat_g) diff.push(`lip ${a.fat_g}≠${v0.fat_g}`);
    if (a.carbs_g !== v0.carbs_g) diff.push(`gluc ${a.carbs_g}≠${v0.carbs_g}`);
    if (diff.length && ecarts.length < 15) ecarts.push({ p, diff });
    else if (diff.length) ecarts.push({ p: null, diff: ['…'] });
  });

  /* ── E2. LE CHEMIN QUE LE MIROIR NE COUVRE PAS : cycleGlucides ──────────────────────── */
  const tCyc0 = Date.now();
  const CYC = await pg.evaluate(() => {
    const j = n => { const d = new Date(Date.now() - n * 864e5);
      return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
    const mk = (parSem) => { const s = [];
      for (let k = 0; k < 4; k++) for (let i = 0; i < parSem; i++)
        s.push({ date: j(k * 7 + i), exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, done: true }] }], vol: 6000 });
      return s; };
    const out = [];
    for (const bw of [55, 70, 85, 100, 130]) for (const goal of ['muscle', 'perte', 'recomp', 'equilibre'])
      for (const f of [0, 1, 3, 5, 6, 7]) {
        S.gender = 'H'; S.bw = bw; S.height = 178; S.age = 35; S.activityLevel = 1.55;
        S.workType = 'bureau'; S.goal = goal; S.smoker = false; S.nutritionPhase = 'charge';
        S.manualKcal = null; S.foodMode = ''; S.keto = false; S.weightLog = []; S.bodyScans = [];
        S.stepsLog = []; S.coachQuiz = { answers: {} }; S.sessions = mk(f);
        const m = calcMacros('charge');
        out.push({ bw, goal, f, kcal: m.calories, prot_g: m.prot_g, fat_g: m.fat_g,
                   carbs_g: m.carbs_g, autre: m.autreJour || null });
      }
    return out;
  });
  T.cycle_ms = Date.now() - tCyc0;
  const errsPage = errs.slice();
  await b.close(); srv.close();

  /* ⭐ MODE RAPIDE — n'existe QUE pour le contrôle négatif, qui relance l'instrument 22 fois
     et n'a besoin que de la VALIDATION. ⛔ Il ne raccourcit jamais une mesure publiée : le
     rapport, lui, se lit dans une exécution SANS cet interrupteur. */
  if (process.env.VERROU_RAPIDE) {
    console.log('MIROIR vs APP SERVIE : ' + ech.length + ' profils, ' + ecarts.length + ' écart(s), ' + errsPage.length + ' erreur(s) de page');
    if (ecarts.length) ecarts.slice(0, 5).forEach(e => console.log('  ⛔ ' + JSON.stringify(e.diff)));
    return;
  }

  /* ── E3. SIMULATION MASSIVE (miroir) ─────────────────────────────────────────────────── */
  const tSim0 = Date.now();
  /* ⭐ `V4nu` = V4 SANS le plancher protéique. Il n'est pas candidat : il existe pour que le
     défaut qu'il produit (2 048 profils sous 0,8 g/kg) reste MESURÉ dans le rapport, au lieu
     d'être corrigé en silence. *Une correction dont on efface la trace du défaut qu'elle
     ferme se relit un jour comme une précaution gratuite, et se fait retirer.* */
  const mV4nu = p => { const kcal = mKcal(p);
    if (p.foodMode === 'keto' || p.foodMode === 'lowcarb') return Object.assign({ kcal }, mMacros(p, kcal));
    const prot_g = Math.round(poidsRefBrut(p) * (PROT_RATIO[p.goal] || 2.2));
    const fat_g = Math.round(p.bw * (FAT_RATIO[p.goal] || 0.9));
    return { kcal, prot_g, fat_g, carbs_g: Math.max(0, Math.round((kcal - prot_g * 4 - fat_g * 9) / 4)) }; };
  const VAR = { V0: mV0, V4nu: mV4nu, V4: mV4, V5: mV5, V6: mV6, V7: mV7 };
  const res = {};
  for (const k of Object.keys(VAR)) res[k] = { n: 0, viol: {}, ex: {}, gkg: { prot: [], lip: [], gluc: [] }, kcal: [], pctCal: { prot: [], lip: [], gluc: [] } };
  let n = 0, ech2 = 0;
  for (const p of corpus()) {
    n++;
    const garde = (n % 101 === 0);          // 1 % échantillonné pour les distributions
    if (garde) ech2++;
    for (const k of Object.keys(VAR)) {
      const r = VAR[k](p); const R = res[k]; R.n++;
      for (const v of proprietes(p, r)) {
        R.viol[v] = (R.viol[v] || 0) + 1;
        if (!R.ex[v]) R.ex[v] = [];
        if (R.ex[v].length < 3) R.ex[v].push({ p: `${p.gender} ${p.age}a ${p.height}cm ${p.bw}kg act${p.activityLevel} ${p.workType} ${p.goal} ${p.phase}${p.smoker ? ' fumeur' : ''}`,
                                               r: `${r.kcal}kcal P${r.prot_g} L${r.fat_g} G${r.carbs_g}` });
      }
      if (garde) {
        R.gkg.prot.push(r.prot_g / p.bw); R.gkg.lip.push(r.fat_g / p.bw); R.gkg.gluc.push(r.carbs_g / p.bw);
        R.kcal.push(r.kcal);
        R.pctCal.prot.push(r.prot_g * 4 / r.kcal); R.pctCal.lip.push(r.fat_g * 9 / r.kcal); R.pctCal.gluc.push(r.carbs_g * 4 / r.kcal);
      }
    }
  }
  T.simulation_ms = Date.now() - tSim0;

  /* ── E3bis. LA MÊME MESURE SUR LA POPULATION RÉALISTE ──────────────────────────────── */
  const tPop0 = Date.now();
  const POPN = 1000000;
  const pop = {}; for (const k of Object.keys(VAR)) pop[k] = { viol: {}, gkg: { prot: [], lip: [], gluc: [] }, kcal: [] };
  for (let z = 0; z < POPN; z++) {
    const p = profilRealiste(); const garde = (z % 101 === 0);
    for (const k of Object.keys(VAR)) {
      const r = VAR[k](p), P = pop[k];
      for (const v of proprietes(p, r)) P.viol[v] = (P.viol[v] || 0) + 1;
      if (garde) { P.gkg.prot.push(r.prot_g / p.bw); P.gkg.lip.push(r.fat_g / p.bw);
                   P.gkg.gluc.push(r.carbs_g / p.bw); P.kcal.push(r.kcal); }
    }
  }
  T.population_ms = Date.now() - tPop0;

  const dist = a => ({ p01: +pct(a, 0.01).toFixed(3), p05: +pct(a, 0.05).toFixed(3), p25: +pct(a, 0.25).toFixed(3),
    med: +pct(a, 0.50).toFixed(3), p75: +pct(a, 0.75).toFixed(3), p95: +pct(a, 0.95).toFixed(3),
    p99: +pct(a, 0.99).toFixed(3), min: +Math.min(...a).toFixed(3), max: +Math.max(...a).toFixed(3) });

  const OUT = {
    horodatage: new Date().toISOString(),
    temps_ms: T,
    profils_corpus: n, echantillon_distributions: ech2,
    validation_miroir: { taille: ech.length, ecarts: ecarts.length, detail: ecarts.slice(0, 15) },
    erreurs_page: errsPage,
    cycle_glucides: CYC,
    variantes: {}
  };
  for (const k of Object.keys(VAR)) {
    const R = res[k];
    OUT.variantes[k] = { n: R.n, violations: R.viol, exemples: R.ex,
      distributions: { prot_gkg: dist(R.gkg.prot), lip_gkg: dist(R.gkg.lip), gluc_gkg: dist(R.gkg.gluc),
                       kcal: dist(R.kcal), prot_pct: dist(R.pctCal.prot), lip_pct: dist(R.pctCal.lip), gluc_pct: dist(R.pctCal.gluc) } };
  }
  OUT.population_realiste = { n: POPN, variantes: {} };
  for (const k of Object.keys(VAR)) OUT.population_realiste.variantes[k] = { violations: pop[k].viol,
    distributions: { prot_gkg: dist(pop[k].gkg.prot), lip_gkg: dist(pop[k].gkg.lip),
                     gluc_gkg: dist(pop[k].gkg.gluc), kcal: dist(pop[k].kcal) } };
  OUT.temps_ms.total = Date.now() - t0;
  fs.writeFileSync('/tmp/verrou_nutri.json', JSON.stringify(OUT, null, 1));

  /* ── SORTIE LISIBLE ───────────────────────────────────────────────────────────────── */
  console.log('MIROIR vs APP SERVIE : ' + ech.length + ' profils, ' + ecarts.length + ' écart(s), ' + errsPage.length + ' erreur(s) de page');
  if (ecarts.length) ecarts.slice(0, 10).forEach(e => console.log('  ⛔ ' + JSON.stringify(e.diff) + (e.p ? ' | ' + JSON.stringify(e.p) : '')));
  const NV = Object.keys(VAR).length;
  console.log('QUADRILLAGE : ' + n.toLocaleString('fr-FR') + ' profils × ' + NV + ' variantes = ' + (n * NV).toLocaleString('fr-FR') + ' évaluations en ' + Math.round(T.simulation_ms / 1000) + ' s');
  console.log('POPULATION  : ' + POPN.toLocaleString('fr-FR') + ' profils × ' + NV + ' variantes = ' + (POPN * NV).toLocaleString('fr-FR') + ' évaluations en ' + Math.round(T.population_ms / 1000) + ' s');
  const cles = new Set(); for (const k of Object.keys(VAR)) Object.keys(res[k].viol).forEach(v => cles.add(v));
  const ordre = [...cles].sort();
  console.log('\nPROPRIÉTÉ'.padEnd(34) + ['V0','V4nu','V4','V5','V6','V7'].map(x => x.padStart(9)).join(''));
  for (const v of ordre) console.log(v.padEnd(34) + ['V0','V4nu','V4','V5','V6','V7'].map(k => String(res[k].viol[v] || 0).padStart(9)).join(''));
  console.log('\n--- POPULATION RÉALISTE (' + POPN.toLocaleString('fr-FR') + ' profils, taux pour 100 000) ---');
  const cles2 = new Set(); for (const k of Object.keys(VAR)) Object.keys(pop[k].viol).forEach(v => cles2.add(v));
  console.log('PROPRIÉTÉ'.padEnd(34) + ['V0','V4nu','V4','V5','V6','V7'].map(x => x.padStart(9)).join(''));
  for (const v of [...cles2].sort()) console.log(v.padEnd(34) + ['V0','V4nu','V4','V5','V6','V7'].map(k => String(Math.round((pop[k].viol[v] || 0) / POPN * 1e5)).padStart(9)).join(''));
  console.log('\nGLUCIDES g/kg (quadrillage, méd/p99)  ' + ['V0','V4','V5','V6','V7'].map(k => k + ':' + dist(res[k].gkg.gluc).med + '/' + dist(res[k].gkg.gluc).p99).join('  '));
  console.log('GLUCIDES g/kg (population,   méd/p99)  ' + ['V0','V4','V5','V6','V7'].map(k => k + ':' + dist(pop[k].gkg.gluc).med + '/' + dist(pop[k].gkg.gluc).p99).join('  '));
  console.log('LIPIDES  g/kg (population,   méd/p99)  ' + ['V0','V4','V5','V6','V7'].map(k => k + ':' + dist(pop[k].gkg.lip).med + '/' + dist(pop[k].gkg.lip).p99).join('  '));
  console.log('PROTÉINES g/kg (population,  méd/p99)  ' + ['V0','V4','V5','V6','V7'].map(k => k + ':' + dist(pop[k].gkg.prot).med + '/' + dist(pop[k].gkg.prot).p99).join('  '));
  console.log('temps : validation ' + T.validation_ms + ' ms · cycle ' + T.cycle_ms + ' ms · simulation ' + T.simulation_ms + ' ms · total ' + T.total + ' ms');
  console.log('→ /tmp/verrou_nutri.json');
})();
