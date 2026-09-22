/* 🧪 MOTEUR V9 — CANDIDATE EXPÉRIMENTALE NON SERVIE.
   ⛔⛔ AUCUN FICHIER SERVI NE LA CHARGE. Elle vit dans Node, et nulle part ailleurs.

   ⭐ V9 = V8 + ① plausibilité glucidique CONTEXTUELLE · ② déficit borné par la PHYSIOLOGIE au
   lieu d'un nombre fixe · ③ protéines dont l'UNITÉ dépend de la situation · ④ cible manuelle
   jamais falsifiée · ⑤ apprentissage longitudinal déterministe · ⑥ explication complète.

   ⛔ V8 n'est pas détruite : elle reste dans `moteur_v8.js`, et le banc les compare.

   🏷️ ÉTIQUETTES : [A] mesuré dans Force Tracker · [B] source externe · [C] inférence ·
   [D] choix produit · [E] incertain, mesuré dans les deux sens. */

'use strict';
const V8M = require('./moteur_v8.js');
const { mBMR, mTDEE, ffmDe } = V8M;

/* ═══════════════ 1. LES BORNES, ET D'OÙ ELLES VIENNENT ═══════════════════════════════════ */

/* ⭐⭐ [B] ALPERT 2005 — LA BORNE QUI MANQUAIT, ET ELLE EST PHYSIOLOGIQUE.
   « A limit on the energy transfer rate from the human fat store in hypophagia »
   (J. Theor. Biol.), dérivée de l'expérience de famine du Minnesota : le tissu adipeux ne peut
   céder qu'environ **290 ± 25 kJ par kg de masse grasse et par jour**, soit ≈ **31 kcal/kg/j**.
   Au-delà, *le déficit est nécessairement pris sur la masse maigre* — ce que le papier dit
   explicitement.
   👉 ***C'est exactement ce que le brief demandait : une borne qui s'adapte à la composition
   corporelle au lieu d'un nombre fixe pour tout le monde.*** Elle donne le bon gradient toute
   seule : 8 kg de gras ne peuvent fournir que ~248 kcal/j, 48 kg en fournissent ~1 488.
   ⚠️ [E] Alpert a lui-même signalé plus tard une erreur de calcul et proposé une valeur
   corrigée ; les extraits consultés la rapportent dans une unité incohérente avec la première
   (« 22 kcal/lb »), et je n'ai pas pu lire la source. **On garde donc la valeur CONSERVATRICE
   (31 kcal/kg), et une variante mesure ce que son absence change.** */
const ALPERT_KCAL_PAR_KG_GRAS = 31;

/* [B] Murphy & Koehler 2022 — plafond de 500 kcal/j pour préserver la masse maigre sous
   entraînement en résistance. ⛔⛔ MAIS SA POPULATION N'EST PAS L'OBÉSITÉ : ce sont des essais
   d'entraînement en résistance en déficit, pas des protocoles de perte de poids chez des
   personnes à forte masse grasse. L'appliquer à 150 kg est **l'extrapolation que le brief
   interdit**. ⭐ Et la littérature consultée le contredit dans ce cas précis : Longland 2016
   (déficit ~40 %, 2,4 g/kg de protéines, exercice intense) rapporte un **GAIN** de masse maigre,
   et les diètes très basses calories sont décrites comme viables dans l'obésité **à condition**
   d'entraînement en résistance et de protéines suffisantes.
   👉 On garde donc 500 kcal **là où il a été mesuré** — et l'IMC 30 (définition OMS de
   l'obésité, universellement publiée) est la frontière, pas un nombre choisi par moi. */
const MK_PLAFOND = 500, IMC_OBESITE = 30;

/* ⭐⭐ [B] LA BANDE GLUCIDIQUE EST UNE ÉCHELLE PUBLIÉE, PAS UN PLAFOND INVENTÉ.
   Les recommandations générales de nutrition sportive gradueent l'apport glucidique par la
   CHARGE d'entraînement — « light » 3-5 g/kg, ~1 h/j 5-7, 1-3 h/j 6-10, ≥ 4 h/j 8-12 g/kg.
   ⛔ Et c'est le point qui corrige mon erreur du 23/09 : **8 à 12 g/kg est une plage PUBLIÉE**
   pour une charge très élevée. Les 8,44 g/kg du cas « 717 g » ne sont donc **pas** hors norme
   — si la charge déclarée les justifie. *Le problème n'a jamais été le chiffre, c'est de savoir
   si la charge est réelle.*
   ⚠️ [E] Ces plages viennent de sources secondaires ; elles servent à CLASSER, jamais à couper. */
const BANDES_GLUC = [
  { cle: 'legere',     min: 3, max: 5,  lib: 'charge légère (0-2 séances)' },
  { cle: 'moderee',    min: 5, max: 7,  lib: 'charge modérée (~1 h/jour)' },
  { cle: 'elevee',     min: 6, max: 10, lib: 'charge élevée (1-3 h/jour)' },
  { cle: 'tres_elevee',min: 8, max: 12, lib: 'charge très élevée (≥ 4 h/jour)' }
];
/* [C] La charge se lit dans ce que Force Tracker MESURE déjà : séances/semaine et séries par
   groupe musculaire. ⛔ Le seuil de 10 séries vient de Henselmans 2022 — il ne sert pas de
   plafond (mon erreur du 23/09), il sert à savoir si la personne est dans le régime où les
   glucides comptent vraiment. */
function chargeDe(p) {
  const s = p.seancesSem || 0, ser = p.seriesParGroupe || 0;
  const metierDur = (p.workType === 'physique' || p.workType === 'actif');
  if (s >= 6 || ser > 20) return BANDES_GLUC[3];
  if (s >= 4 || ser > 10 || (s >= 3 && metierDur)) return BANDES_GLUC[2];
  if (s >= 3 || (s >= 1 && metierDur)) return BANDES_GLUC[1];
  return BANDES_GLUC[0];
}

/* [B] Protéines — les trois barèmes, chacun dans SA situation et SON unité.
   ⛔ On ne « choisit pas le plus haut » : on choisit celui dont la population correspond. */
const PROT_FFM_DEFICIT = { perte: 2.3, recomp: 2.4 };   // Helms 2014, g/kg de MASSE MAIGRE
const PROT_BW_HORS_DEFICIT = { muscle: 1.8, force: 1.8, equilibre: 1.6, endurance: 1.5 }; // Iraki/Morton, g/kg de POIDS
const PROT_BW_PLANCHER = 1.4;                            // bas de la plage générale ISSN
const PROT_FFM_PLAFOND = 3.1;                            // haut de Helms
/* ⚠️ [E] 2,2 g/kg de poids = limite de sécurité ANSES, **source française SECONDAIRE**.
   ⛔ Le brief interdit d'en faire un invariant dur avant vérification primaire. En V9 elle
   devient donc un **SIGNAL**, plus un plafond — et `V9dur` mesure ce que le plafond changeait. */
const ANSES_SIGNAL = 2.2;

const LIP_GKG_MIN = 0.5, LIP_GKG_MAX = 1.5, LIP_PCT_MIN = 0.15, LIP_PCT_MAX = 0.35;
const EA_MIN = 30, KCAL_PAR_KG = 7700, SURPLUS_MAX_PCT = 0.15;
const PLANCHER = { H: 1500, F: 1200 };
const BF_SEC = { H: 12, F: 20 }, BF_MOYEN = { H: 20, F: 28 }, BF_HAUT = { H: 30, F: 38 };

/* ═══════════════ 2. APPRENTISSAGE LONGITUDINAL (§11-§13) ════════════════════════════════
   ⛔ ENTIÈREMENT DÉTERMINISTE. Aucune IA, aucun hasard, aucun réglage caché. */

/* ⭐ [A/R13] LA PENTE EXISTE DÉJÀ DANS FORCE TRACKER — `penteKgParSemaine` (tracking.js),
   corrigée en son temps pour ne plus dépendre de la FRÉQUENCE des pesées : régression linéaire
   sur les JOURS, puis × 7. On réemploie sa logique au lieu d'en écrire une deuxième (R2).
   ⛔ Et c'est tout l'intérêt : *une tendance résiste à l'eau, au glycogène et au sodium ; une
   pesée du jour, non.* */
function penteKgParSemaine(pesees) {
  const pts = (pesees || []).filter(e => e && e.date && isFinite(+e.kg))
    .map(e => ({ j: Math.round(new Date(e.date + 'T12:00:00').getTime() / 864e5), y: +e.kg }));
  if (pts.length < 2) return null;
  const j0 = Math.min(...pts.map(p => p.j));
  const etendue = Math.max(...pts.map(p => p.j)) - j0;
  if (!(etendue > 0)) return null;
  const n = pts.length;
  let sx = 0, sy = 0, sxy = 0, sx2 = 0;
  pts.forEach(p => { const x = p.j - j0; sx += x; sy += p.y; sxy += x * p.y; sx2 += x * x; });
  const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
  if (!isFinite(slope)) return null;
  return Math.round(slope * 7 * 1000) / 1000;
}

/* ⭐⭐ §12 — LE SCORE DE CONFIANCE, ET IL DÉCIDE DU DROIT D'APPRENDRE.
   ⛔ « Si seulement 5 repas sur 28 jours ont été renseignés : NE PAS apprendre » — consigne
   explicite. Le score est donc une PORTE, pas une décoration.
   ⚠️ [D] Les seuils ci-dessous sont un choix produit assumé. Ils ne sortent d'aucune source :
   ils sortent de la question *« à partir de quand une moyenne d'apport cesse d'être du bruit ? »*
   Chacun est couvert par une mutation, et chacun peut être déplacé sans rien casser d'autre. */
function confiance(h) {
  if (!h || !(h.jours > 0)) return { niveau: 'aucune', poids: 0, raisons: ['aucun historique'] };
  const r = [];
  const pctJours = (h.joursNutriRenseignes || 0) / h.jours;
  const pesees = (h.pesees || []).length;
  let pts = 0;
  if (h.jours >= 28) pts += 2; else if (h.jours >= 14) pts += 1; else r.push('moins de 14 jours');
  if (pctJours >= 0.8) pts += 2; else if (pctJours >= 0.5) pts += 1;
  else r.push('journal alimentaire rempli à ' + Math.round(pctJours * 100) + ' %');
  if (pesees >= 8) pts += 2; else if (pesees >= 4) pts += 1; else r.push('moins de 4 pesées');
  if (h.activiteStable) pts += 1; else r.push('activité instable sur la période');
  if (h.changementObjectif) { pts -= 2; r.push('objectif changé récemment'); }
  if (h.interruption) { pts -= 2; r.push('interruption déclarée (voyage, maladie)'); }
  /* ⛔⛔ LE POIDS ACCORDÉ À L'OBSERVATION NE MONTE JAMAIS À 1, ET LA RAISON EST MESURÉE
     AILLEURS : l'apport auto-déclaré est **systématiquement sous-estimé** dans la littérature
     nutritionnelle. *Un moteur qui croirait à 100 % le journal apprendrait un TDEE trop bas
     pour tout le monde.* [D] 0,7 est un plafond de prudence, pas une mesure. */
  const niveau = pts >= 6 ? 'forte' : (pts >= 4 ? 'moyenne' : (pts >= 2 ? 'faible' : 'aucune'));
  /* ⛔⛔ UNE PORTE, PAS UNE PENTE — et c'est le contre-audit de la simulation temporelle qui me
     l'a imposé. Ma première version donnait un poids de **0,15 à un journal rempli à 18 %**
     (5 repas sur 28 jours) : elle apprenait donc un peu de presque rien. Or la consigne est
     explicite — *« si seulement 5 repas sur 28 jours ont été renseignés : NE PAS apprendre »*.
     👉 ***Sous le seuil, le poids est ZÉRO, pas « un petit peu ».*** Les trois conditions sont
     cumulatives et chacune est nécessaire : sans durée on mesure du bruit, sans journal on ne
     sait pas ce qui a été mangé, sans pesées on ne sait pas ce que ça a donné. */
  const porte = (h.jours >= 14) && (pctJours >= 0.5) && (pesees >= 4)
             && !h.changementObjectif && !h.interruption;
  if (!porte && !r.includes('sous le seuil d\'apprentissage')) r.push('sous le seuil d\'apprentissage');
  const poids = porte ? ({ forte: 0.7, moyenne: 0.35, faible: 0.15, aucune: 0 }[niveau]) : 0;
  return { niveau, poids, points: pts, porte, raisons: r };
}

/* ⭐⭐ §11 — LE TDEE OBSERVÉ. Bilan énergétique, rien de plus :
   `TDEE_observé = apport moyen − (variation de poids × 7 700 / jours)`.
   ⛔ Il ne se calcule QUE si la confiance le permet, et il ne remplace jamais l'estimation :
   il la pondère. *Une estimation qu'on remplace d'un coup par une observation bruitée n'est pas
   un apprentissage, c'est une girouette.* */
function tdeeObserve(h) {
  if (!h || !(h.jours >= 14)) return null;
  if (!isFinite(h.apportMoyen) || !(h.apportMoyen > 0)) return null;
  const pente = penteKgParSemaine(h.pesees);
  if (pente == null) return null;
  const deltaKgParJour = pente / 7;
  return Math.round(h.apportMoyen - deltaKgParJour * KCAL_PAR_KG);
}

function tdeePersonnalise(p, h) {
  const est = mTDEE(p);
  const c = confiance(h);
  const obs = c.poids > 0 ? tdeeObserve(h) : null;
  if (obs == null || c.poids === 0) {
    return { tdee: est, estime: est, observe: null, poids: 0, confiance: c, source: 'formule' };
  }
  /* ⛔ Garde-fou : une observation absurde ne remplace rien. Au-delà de ±35 % de l'estimation,
     c'est le JOURNAL qui est faux, pas le métabolisme. [D], et une mutation le retire. */
  if (obs < est * 0.65 || obs > est * 1.35) {
    return { tdee: est, estime: est, observe: obs, poids: 0, confiance: c,
             source: 'formule', rejet: 'observation hors bornes plausibles (±35 %)' };
  }
  const w = c.poids;
  return { tdee: Math.round(est * (1 - w) + obs * w), estime: est, observe: obs, poids: w,
           confiance: c, source: 'mixte' };
}

/* ═══════════════ 3. PLAUSIBILITÉ GLUCIDIQUE (§4) ════════════════════════════════════════
   ⛔⛔ CE N'EST NI UN DIAGNOSTIC NI UN SEUIL. C'est un CLASSEMENT à quatre niveaux, qui regarde
   plusieurs dimensions à la fois — et surtout qui dit **pourquoi**. */
function plausibiliteGluc(p, r, ctx) {
  const gkg = r.carbs_g / p.bw;
  const bande = ctx.bande;
  const pctCal = r.carbs_g * 4 / r.kcal;
  const causes = [];
  /* Attribution de cause (§5) — on nomme ce qui a poussé le résidu vers le haut. */
  if (ctx.kcalKg > 45) causes.push('tdee_eleve');
  if (ctx.ecartPct > 0.10) causes.push('surplus_eleve');
  if (r.fat_g / p.bw <= LIP_GKG_MIN + 0.05) causes.push('lipides_au_plancher');
  if (r.prot_g / p.bw <= PROT_BW_PLANCHER + 0.05) causes.push('proteines_au_plancher');
  if (p.bw < 60 && ctx.kcalKg > 45) causes.push('petit_poids_tdee_haut');
  if ((p.activityLevel || 1.55) >= 1.725 && (p.seancesSem || 0) <= 2) causes.push('activite_declaree_sans_seances');
  if ((p.workType === 'physique') && (p.activityLevel || 1.55) >= 1.725) causes.push('metier_et_activite_cumules');
  if (!causes.length && gkg > bande.max) causes.push('residu_energetique');

  let niveau;
  if (gkg <= bande.max) niveau = 'NORMAL';
  else if (gkg <= 12) niveau = 'ELEVE_MAIS_COHERENT';
  else niveau = 'TRES_ELEVE_A_VERIFIER';
  /* ⛔ L'INCOHÉRENCE n'est PAS « beaucoup de glucides ». C'est **un apport que la charge
     déclarée ne peut pas justifier, sur un TDEE lui-même douteux**. *Une prescription élevée
     chez quelqu'un qui s'entraîne vraiment beaucoup n'a rien d'incohérent.* */
  if (gkg > bande.max && ctx.kcalKg > 55 &&
      (causes.includes('activite_declaree_sans_seances') || causes.includes('petit_poids_tdee_haut')))
    niveau = 'INCOHERENT_AVEC_LE_CONTEXTE';

  return { niveau, gkg: Math.round(gkg * 100) / 100, abs: r.carbs_g,
           pct_cal: Math.round(pctCal * 1000) / 10, bande: bande.cle, bande_lib: bande.lib,
           bande_min: bande.min, bande_max: bande.max, causes,
           /* §2 — 600 g reste, mais ÉTIQUETÉ pour ce qu'il est. */
           signal_praticabilite_absolue: r.carbs_g > 600 };
}

/* ═══════════════ 4. LE MOTEUR ═══════════════════════════════════════════════════════════ */
function mV9gen(p, opts) {
  opts = opts || {};
  const h = p.historique || null;
  const sexe = p.gender === 'F' ? 'F' : 'H';
  const sig = [], expl = [];
  if (!(p.bw > 0) || !(p.height > 0) || !(p.age > 0)) return null;

  const T = tdeePersonnalise(p, h);
  const tdee = T.tdee;
  const { ffm, bf, src } = ffmDe(p);
  const fm = p.bw - ffm;
  const imc = p.bw / ((p.height / 100) ** 2);
  expl.push('TDEE ' + (T.source === 'mixte'
    ? 'personnalisé ' + tdee + ' kcal (formule ' + T.estime + ', observé ' + T.observe +
      ', confiance ' + T.confiance.niveau + ' → poids ' + T.poids + ')'
    : 'estimé ' + tdee + ' kcal (formule seule, confiance ' + (T.confiance.niveau) + ')'));

  /* ── cible énergétique ── */
  let kcal, vit = 0, borne = null, conflitManuel = null;
  const vitesse = (function () {
    const sec = BF_SEC[sexe], haut = BF_HAUT[sexe];
    const avance = p.level === 'confirme';
    switch (p.goal) {
      case 'perte': return bf <= sec ? -0.5 : (bf >= haut ? -1.0 : -(0.5 + 0.5 * (bf - sec) / (haut - sec)));
      case 'recomp': return -0.25;
      case 'muscle': return avance ? 0.125 : 0.25;
      case 'force': return avance ? 0.05 : 0.1;
      case 'endurance': return 0.05;
      case 'equilibre': return 0;
      default: return 0.25;
    }
  })();

  /* ⭐⭐ §8 — LE PLAFOND DE DÉFICIT EST DÉSORMAIS PHYSIOLOGIQUE, PUIS CONTEXTUEL.
     ① Alpert : le gras ne peut céder que ~31 kcal/kg/j — au-delà, c'est du muscle.
     ② Murphy & Koehler : 500 kcal/j, **dans la population où il a été mesuré**. L'IMC 30 (OMS)
        marque la sortie de cette population. ⛔ Au-delà, l'appliquer serait l'extrapolation que
        le brief interdit, et la littérature des diètes très basses calories la contredit. */
  const plafondAlpert = Math.round(ALPERT_KCAL_PAR_KG_GRAS * fm);
  /* ⛔⛔ ET LA TRANSITION EST INTERPOLÉE, PARCE QUE MON PREMIER JET EN AVAIT FAIT UNE FALAISE.
     Mesuré par mon propre témoin de continuité : à **95 → 96 kg**, l'IMC franchissait 30, le
     plafond de Murphy & Koehler cessait de s'appliquer d'un coup, et la cible **sautait de
     243 kcal pour un kilo**. 👉 ***L'IMC 30 est une convention de CLASSEMENT, pas une falaise
     physiologique*** — en faire un interrupteur, c'est la famille « seuils en marche d'escalier »
     de `BUGS.md`.
     ⭐ Et l'interpolation n'invente aucun nombre : elle va du seuil de SURPOIDS (IMC 25) à celui
     d'OBÉSITÉ (IMC 30), **deux bornes OMS publiées**. En dessous de 25, Murphy & Koehler
     s'applique pleinement ; au-dessus de 30, c'est Alpert qui commande ; entre les deux, on
     glisse. */
  const IMC_SURPOIDS = 25;
  const t = opts.mkPartout ? 0 : Math.max(0, Math.min(1, (imc - IMC_SURPOIDS) / (IMC_OBESITE - IMC_SURPOIDS)));
  const plafondMixte = MK_PLAFOND + t * Math.max(0, plafondAlpert - MK_PLAFOND);
  const mkApplicable = t < 1;
  const plafondDeficit = Math.round(Math.min(plafondAlpert, plafondMixte));

  if (p.manualKcal != null) {
    /* ⭐⭐ §10 — LA TROISIÈME VOIE. La valeur saisie reste INTACTE. Si elle est irréalisable,
       le moteur le DÉCLARE avec l'écart chiffré, et laisse la personne trancher.
       ⛔ *Ne jamais falsifier silencieusement la valeur saisie* — et V8 le faisait. */
    kcal = Math.round(p.manualKcal);
    sig.push('cible_manuelle');
    expl.push('cible saisie par la personne : ' + kcal + ' kcal (conservée telle quelle)');
  } else {
    vit = vitesse;
    let delta = vit / 100 * p.bw * KCAL_PAR_KG / 7 + (p.phase === 'charge' ? 100 : -100);
    if (delta < -plafondDeficit) {
      delta = -plafondDeficit;
      borne = plafondDeficit >= plafondAlpert ? 'deficit_plafonne_alpert'
            : (t <= 0 ? 'deficit_plafonne_murphy' : 'deficit_plafonne_mixte');
      expl.push('déficit plafonné à ' + plafondDeficit + ' kcal/j (' +
        (borne === 'deficit_plafonne_alpert'
          ? 'Alpert : ' + Math.round(fm) + ' kg de masse grasse × 31 kcal'
          : borne === 'deficit_plafonne_murphy'
            ? 'Murphy & Koehler, IMC ' + imc.toFixed(1) + ' ≤ 25'
            : 'transition Murphy & Koehler → Alpert, IMC ' + imc.toFixed(1)) + ')');
    }
    const maxSurp = tdee * SURPLUS_MAX_PCT;
    if (delta > maxSurp) { delta = maxSurp; borne = 'surplus_plafonne'; expl.push('surplus plafonné à 15 % du TDEE (Helms 2023)'); }
    kcal = Math.round(tdee + delta);
    /* ⛔⛔ LE GARDE-FOU DE DISPONIBILITÉ ÉNERGÉTIQUE A ÉTÉ REFAIT, ET C'EST MON PROPRE TÉMOIN
       QUI L'A EXIGÉ — la première version rendait la perte de poids IMPOSSIBLE aux profils
       lourds. Mesuré : à 150 kg et 10 % de masse grasse, `30 × 135 kg de masse maigre + dépense
       d'exercice` valait **4 500 kcal** pour un TDEE de 4 518 → déficit plafonné à **−18 kcal**.
       ⭐⭐ LA CAUSE EST LA MÊME QUE POUR MURPHY & KOEHLER : le seuil de 30 kcal/kg de masse
       maigre du CIO a été calibré sur des ATHLÈTES, dont la masse maigre tourne autour de
       40-70 kg — là, `30 × masse maigre` ≈ le métabolisme de repos, et le consensus le dit
       lui-même (« an EA of 30 kcal/kg FFM roughly equates to the average RMR »). À 135 kg de
       masse maigre, `30 × 135 = 4 050` alors que le métabolisme de repos vaut **3 286** : le
       seuil cesse de vouloir dire ce qu'il veut dire.
       👉 ***On garde donc le SENS et pas le nombre*** : le garde-fou DUR devient
       « après la dépense d'exercice, il reste au moins le métabolisme de repos », qui
       s'échelonne tout seul ; et le seuil publié de 30 kcal/kg devient un **SIGNAL**, parce
       qu'il reste juste dans sa population d'origine. C'est exactement la distinction
       borne / signal que le §7 du brief demande. */
    const eee = (p.seancesSem || 0) * 7 * p.bw / 7;
    const plancherRepos = Math.round(mBMR(p) + eee);
    if (kcal < plancherRepos) { kcal = plancherRepos; sig.push('plancher_metabolisme_repos');
      expl.push('relevée à ' + plancherRepos + ' kcal : après la dépense d\'exercice il doit rester au moins le métabolisme de repos (' + mBMR(p) + ' kcal)'); }
    if ((kcal - eee) / ffm < EA_MIN) { sig.push('signal_disponibilite_energetique');
      expl.push('⚠ disponibilité énergétique ' + Math.round((kcal - eee) / ffm) + ' kcal/kg de masse maigre, sous le repère de 30 du CIO (signal, pas un diagnostic)'); }
    if (kcal < PLANCHER[sexe]) { kcal = PLANCHER[sexe]; sig.push('plancher_calorique'); }
  }

  /* ── régimes explicitement choisis ── */
  if (p.foodMode === 'keto' || p.foodMode === 'lowcarb') {
    const carbs_g = Math.max(0, Math.round(kcal * (p.foodMode === 'keto' ? 0.05 : 0.25) / 4));
    const prot_g = p.foodMode === 'keto'
      ? Math.max(0, Math.round(kcal * 0.15 / 4), Math.round(p.bw * 0.8))
      : Math.max(0, Math.round(kcal * 0.30 / 4));
    const fat_g = Math.max(0, Math.round((kcal - prot_g * 4 - carbs_g * 4) / 9));
    const kM = prot_g * 4 + fat_g * 9 + carbs_g * 4;
    return { kcal: kM, kcal_vise: kcal, prot_g, fat_g, carbs_g, vitesse: vit, ffm, bf, src_ffm: src,
             signaux: sig.concat('regime'), borne, faisable: true, tdee: T,
             plausibilite: { niveau: 'REGIME_CHOISI', causes: [] }, explication: expl.concat('régime choisi : sa répartition EST la règle') };
  }

  /* ── ⭐ §9 PROTÉINES : L'UNITÉ DÉPEND DE LA SITUATION ──────────────────────────────────
     ⛔ Pas « 2,2 g/kg pour tout le monde », pas « 3,1 g/kg de masse maigre pour tout le monde ».
     · En DÉFICIT → barème de Helms, **en masse maigre** (c'est sa population et son unité).
     · HORS déficit → barème d'Iraki/Morton, **en poids de corps** (c'est leur unité).
     *Deux situations, deux littératures, deux unités — et jamais mélangées dans un calcul.* */
  const enDeficit = (kcal < tdee - 50);
  let prot_g, unite;
  if (enDeficit && PROT_FFM_DEFICIT[p.goal] != null) {
    let g = PROT_FFM_DEFICIT[p.goal];
    if (bf <= BF_SEC[sexe]) g += 0.5; else if (bf <= BF_MOYEN[sexe]) g += 0.2;
    g += 0.3 * Math.min(1, (tdee - kcal) / MK_PLAFOND);
    g = Math.min(g, PROT_FFM_PLAFOND);
    prot_g = Math.round(ffm * g);
    unite = 'masse maigre';
    expl.push('protéines ' + g.toFixed(2) + ' g/kg de MASSE MAIGRE (Helms 2014, déficit, ' +
      (bf <= BF_SEC[sexe] ? 'sujet sec' : bf <= BF_MOYEN[sexe] ? 'sujet moyen' : 'masse grasse élevée') + ')');
  } else {
    const g = PROT_BW_HORS_DEFICIT[p.goal] != null ? PROT_BW_HORS_DEFICIT[p.goal] : 1.8;
    prot_g = Math.round(p.bw * g);
    unite = 'poids de corps';
    expl.push('protéines ' + g.toFixed(2) + ' g/kg de POIDS DE CORPS (hors déficit — Iraki/Morton)');
  }
  const pMin = Math.ceil(p.bw * PROT_BW_PLANCHER);
  if (prot_g < pMin) { prot_g = pMin; expl.push('relevées au plancher de 1,4 g/kg de poids'); }
  if (prot_g / ffm > PROT_FFM_PLAFOND) { prot_g = Math.floor(ffm * PROT_FFM_PLAFOND);
    expl.push('ramenées au plafond de 3,1 g/kg de masse maigre (Helms)'); }
  /* ⚠️ ANSES devient un SIGNAL, plus un plafond (§9). `V9dur` mesure l'autre choix. */
  if (opts.plafondAnsesDur && prot_g > Math.floor(p.bw * ANSES_SIGNAL)) {
    prot_g = Math.floor(p.bw * ANSES_SIGNAL); sig.push('prot_plafonnee_anses');
  } else if (prot_g / p.bw > ANSES_SIGNAL) {
    sig.push('prot_au_dela_du_repere_anses');
  }

  /* ── lipides ── */
  let fat_g = Math.round(p.bw * ({ muscle:0.9, perte:0.8, recomp:0.85, force:1.0, equilibre:0.85, endurance:0.75 }[p.goal] || 0.9));
  const fMin = Math.max(Math.ceil(p.bw * LIP_GKG_MIN), Math.ceil(kcal * LIP_PCT_MIN / 9));
  const fMax = Math.min(Math.floor(kcal * LIP_PCT_MAX / 9), Math.floor(p.bw * LIP_GKG_MAX));
  if (fMin > fMax) sig.push('bornes_lipides_en_conflit');
  fat_g = Math.max(fMin, Math.min(fat_g, fMax));

  /* ── glucides = résidu, et arbitrage SANS troncature ── */
  let carbs_g = Math.round((kcal - prot_g * 4 - fat_g * 9) / 4);
  let faisable = true;
  if (carbs_g < 0) {
    fat_g = Math.max(Math.ceil(p.bw * LIP_GKG_MIN), Math.floor((kcal - prot_g * 4) / 9));
    carbs_g = Math.round((kcal - prot_g * 4 - fat_g * 9) / 4);
    if (carbs_g < 0) { prot_g = Math.max(pMin, Math.floor((kcal - fat_g * 9) / 4));
      carbs_g = Math.round((kcal - prot_g * 4 - fat_g * 9) / 4); }
    if (carbs_g < 0) {
      /* ⭐⭐ §10 — LA TROISIÈME VOIE, ET ELLE NE TOUCHE PAS À LA VALEUR SAISIE.
         On DÉCLARE le conflit avec son écart chiffré ; la cible de la personne reste la sienne. */
      const mini = prot_g * 4 + fat_g * 9;
      conflitManuel = { demande: kcal, minimum_calculable: mini, ecart: mini - kcal,
        pourquoi: 'les minimums de sécurité (protéines ' + prot_g + ' g, lipides ' + fat_g +
                  ' g) valent déjà ' + mini + ' kcal' };
      carbs_g = 0; faisable = false; sig.push('cible_infaisable');
      expl.push('⛔ objectif macro impossible sous les contraintes actuelles : demandé ' + kcal +
                ' kcal, minimum calculable ' + mini + ' kcal (écart +' + (mini - kcal) + ')');
    }
  }
  const kcalMacros = prot_g * 4 + fat_g * 9 + carbs_g * 4;

  /* ── plausibilité + explication ── */
  const bande = chargeDe(p);
  const ctx = { bande, kcalKg: kcalMacros / p.bw, ecartPct: (kcalMacros - tdee) / tdee };
  const pl = plausibiliteGluc(p, { kcal: kcalMacros, prot_g, fat_g, carbs_g }, ctx);
  if (pl.niveau !== 'NORMAL') sig.push('gluc_' + pl.niveau.toLowerCase());
  expl.push('glucides ' + carbs_g + ' g = ' + pl.gkg + ' g/kg (' + pl.pct_cal + ' % des calories) · ' +
            bande.lib + ' → plage ' + bande.min + '-' + bande.max + ' g/kg · ' + pl.niveau +
            (pl.causes.length ? ' [' + pl.causes.join(', ') + ']' : ''));
  /* ⛔ §6 — quand la plausibilité est mauvaise, on ne coupe PAS : on dit QUOI réexaminer. */
  const aReexaminer = [];
  if (pl.niveau === 'TRES_ELEVE_A_VERIFIER' || pl.niveau === 'INCOHERENT_AVEC_LE_CONTEXTE') {
    if (pl.causes.includes('activite_declaree_sans_seances')) aReexaminer.push('le niveau d\'activité déclaré');
    if (pl.causes.includes('metier_et_activite_cumules')) aReexaminer.push('le cumul métier + niveau d\'activité');
    if (pl.causes.includes('tdee_eleve') || pl.causes.includes('petit_poids_tdee_haut')) aReexaminer.push('le TDEE');
    if (pl.causes.includes('surplus_eleve')) aReexaminer.push('le surplus');
    if (!aReexaminer.length) aReexaminer.push('la cohérence globale du profil');
  }

  return { kcal: kcalMacros, kcal_vise: kcal, prot_g, fat_g, carbs_g, vitesse: vit,
           ffm: Math.round(ffm * 10) / 10, bf: Math.round(bf * 10) / 10, src_ffm: src,
           unite_proteines: unite, plafond_deficit: plafondDeficit, plafond_alpert: plafondAlpert,
           signaux: sig, borne, faisable, conflit_manuel: conflitManuel,
           plausibilite: pl, a_reexaminer: aReexaminer, tdee: T, explication: expl };
}

const mV9 = p => mV9gen(p, {});
/* Variantes de mesure — ⛔ elles existent pour CHIFFRER ce que chaque borne discutable change,
   jamais pour être servies. */
const mV9dur = p => mV9gen(p, { plafondAnsesDur: true });   // ANSES redevient un plafond
const mV9mk = p => mV9gen(p, { mkPartout: true });          // Murphy & Koehler partout, obésité comprise

module.exports = { mV9, mV9dur, mV9mk, mV9gen, chargeDe, plausibiliteGluc, confiance,
  tdeeObserve, tdeePersonnalise, penteKgParSemaine,
  CONST: { ALPERT_KCAL_PAR_KG_GRAS, MK_PLAFOND, IMC_OBESITE, BANDES_GLUC, PROT_FFM_DEFICIT,
           PROT_BW_HORS_DEFICIT, PROT_BW_PLANCHER, PROT_FFM_PLAFOND, ANSES_SIGNAL,
           LIP_GKG_MIN, LIP_GKG_MAX, LIP_PCT_MIN, LIP_PCT_MAX, EA_MIN, KCAL_PAR_KG,
           SURPLUS_MAX_PCT, PLANCHER, BF_SEC, BF_MOYEN, BF_HAUT } };
