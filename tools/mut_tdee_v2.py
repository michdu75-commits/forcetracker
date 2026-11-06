#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — TDEE V2, ETAPES 1 « DEPENSE DU JOUR » ET 2 « LES PAS NE MODIFIENT PLUS L'OBJECTIF » (06/11/2026, session-C, Claude N°2 Seance) : les temoins C-TDEE-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain (TOUS les blocs), mesure d'abord ; l'arbre sain est REJOUE a la fin (banc stable).
Chaque mutation vise une REGLE precise du moteur (les sept regles anti-doublon, l'objectif intact, l'affichage, l'absence d'effet de bord) et nomme SON temoin (4e champ) :
« GARDE » = au moins un rouge ET ce temoin present dans les rouges ; « OK » = la mutation est EQUIVALENTE (aucun rouge : le banc n'est pas sensible a ce qui ne change rien).
Un PLANTAGE du banc (code hors 0/1, ligne PLANTAGE, pas de ligne de total) n'est jamais « garde » : il n'attrape rien.
Pour aller vite, une mutation ne rejoue que les BLOCS qui peuvent la voir (5e champ, variable TDEE_BLOCS du banc) ; l'arbre sain, lui, rejoue tout (matrice comprise).
Une ancre est exacte et UNIQUE (sinon INVALIDE) ; `re:` en tete = expression reguliere qui doit correspondre exactement une fois.

[*] UN SEUL MECANISME (R2/R13) : la copie de l'arbre, l'application des ancres et la lecture des temoins viennent de `tools/mut_autre_activite.py` (importe, pas recopie) ; seuls les banc et les mutations sont propres a ce chantier.
Usage : python3 tools/mut_tdee_v2.py [PREFIXE[,PREFIXE...]]
        MUT_DETAIL=1 : tous les rouges · MUT_J=2 par defaut · MUT_SAIN=0 : saute l'arbre sain · MUT_VALIDE=1 : verifie seulement les ancres et la syntaxe (aucun banc)
"""
import importlib.util, os, re, subprocess, sys, tempfile, shutil
from concurrent.futures import ThreadPoolExecutor

_ICI = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('mut_autre_activite', os.path.join(_ICI, 'mut_autre_activite.py'))
m = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(m)
SRC, FICHIERS = m.SRC, m.FICHIERS
ST, SC, TR, IX, CO, AP = m.ST, m.SC, m.TR, m.IX, m.CO, m.AP
T = 'C-TDEE-'

# (nom, [(fichier, ancien, nouveau)], attendu, temoin, blocs)
MUT = [
    # ── ① ACTIF, PAS BRUT ─────────────────────────────────────────────────────────────────────────────────────────
    ('M01 ① le repos de la periode n\'est plus deduit : l\'estimation BRUTE s\'ajoute a la reference (le doublon central)',
     [(TR, "const estNet = brut == null ? null : Math.max(0, brut - kg * h);", "const estNet = brut;")], 'GARDE', T + 'D04', 'P,K,S,D'),
    ('M02 ① [deguisee] le repos est deduit sur la moitie de la duree seulement',
     [(TR, "const estNet = brut == null ? null : Math.max(0, brut - kg * h);", "const estNet = brut == null ? null : Math.max(0, brut - kg * h / 2);")], 'GARDE', T + 'P17', 'P,K,S,D'),
    # ── ② UNE SEULE PREUVE PAR INTERVALLE ─────────────────────────────────────────────────────────────────────────
    ('M03 ② la valeur de la montre S\'AJOUTE a l\'estimation de l\'app (deux preuves pour la meme plage)',
     [(TR, "return { net: v, brut, estNet, source: 'montre', alerte, u: P.INCERT.montre };", "return { net: v + (estNet || 0), brut, estNet, source: 'montre', alerte, u: P.INCERT.montre };")], 'GARDE', T + 'D05', 'P,K,S,D'),
    ('M04 ② l\'energie active mesuree sur la journee ne supplante plus entrainements et pas (ils s\'additionnent a elle)',
     [(TR, "if (ej != null && bEj.length >= P.PAS_MIN_JOURS) {", "if (false) {")], 'GARDE', T + 'P23', 'P'),
    # ── ③ LES PAS D'UN ENTRAINEMENT SONT DEJA PAYES PAR LUI ───────────────────────────────────────────────────────
    ('M05 ③ les pas d\'un entrainement ne sont plus retires du total du jour (pas et marche comptes deux fois)',
     [(TR, "const pasEntr = ws.reduce((a, w) => a + djPasEntrainement(w), 0);", "const pasEntr = 0;")], 'GARDE', T + 'D01', 'P,S,D'),
    ('M06 ③ l\'historique ne retire plus les pas des entrainements : l\'habitude de pas est gonflee par les randonnees',
     [(TR, "const ph = pasJ[d] - ws.reduce((a, w) => a + djPasEntrainement(w), 0);", "const ph = pasJ[d];")], 'GARDE', T + 'H08', 'H,D'),
    ('M07 ③ la randonnee ne retire plus aucun pas (cadence 0) : 36 000 pas payes deux fois',
     [(TR, "randonnee: 75,", "randonnee: 0,")], 'GARDE', T + 'D02', 'P,K,S,D'),
    ('M08 ③ la course ne retire que 100 pas/min au lieu de 165 : un reliquat de pas compte en plus',
     [(TR, "course: 165,", "course: 100,")], 'GARDE', T + 'D03', 'P,K,S,D'),
    ('M09 ③ les pas propres a l\'entrainement (importes) sont ignores au profit de la cadence',
     [(TR, "typeof w.pas === 'number' ? w.pas : Math.round(djCadence(w) * w.dureeMin)", "Math.round(djCadence(w) * w.dureeMin)")], 'GARDE', T + 'P29b', 'P'),
    # ── ④ LA MUSCULATION N'EST PAS ADDITIVE · L'HABITUDE EST DEJA DANS LA REFERENCE ───────────────────────────────
    ('M10 ④ la musculation est comptee comme un effort en plus (le niveau d\'activite la contient deja)',
     [(TR, "if (w.famille === 'muscu') {", "if (false) {")], 'GARDE', T + 'P20', 'P,S,D'),
    ('M11 ④ [deguisee] l\'adaptateur transmet la musculation sous une autre famille (elle redevient additive)',
     [(TR, "else out.push({ famille: 'muscu', dureeMin:", "else out.push({ famille: 'autre', dureeMin:")], 'GARDE', T + 'D06', 'S,D'),
    ('M12 ④ l\'habitude (sport declare, mediane des jours observes) n\'est plus deduite de l\'entrainement du jour',
     [(TR, "const alloc = Math.max(hab.length >= P.PAS_MIN_JOURS ? djMediane(hab) : 0, profil.sportExtra || 0);", "const alloc = 0;")], 'GARDE', T + 'P25', 'P,S,D'),
    ('M13 ④ l\'habitude et le sport declare SE SOMMENT (au lieu de retenir la plus grande des deux)',
     [(TR, "const alloc = Math.max(hab.length >= P.PAS_MIN_JOURS ? djMediane(hab) : 0, profil.sportExtra || 0);", "const alloc = (hab.length >= P.PAS_MIN_JOURS ? djMediane(hab) : 0) + (profil.sportExtra || 0);")], 'GARDE', T + 'P26b', 'P'),
    ('M14 ④ la fenetre de l\'habitude d\'entrainement passe de 28 a 5 jours (jamais assez de jours observes)',
     [(TR, "if (k <= 28 && (pasJ[d] || (idx[d] && idx[d].length)))", "if (k <= 5 && (pasJ[d] || (idx[d] && idx[d].length)))")], 'GARDE', T + 'D11', 'S,D,H'),
    # ── ⑤ LE MEME ENTRAINEMENT NE COMPTE QU'UNE FOIS ──────────────────────────────────────────────────────────────
    ('M15 ⑤ plus de dedoublonnage : un effort saisi ET importe est compte deux fois',
     [(TR, "const ws = djDedoublonner((jour.entrainements || []).filter(w => w && w.dureeMin > 0));", "const ws = (jour.entrainements || []).filter(w => w && w.dureeMin > 0);")], 'GARDE', T + 'D08', 'P,S,D'),
    ('M16 ⑤ la tolerance de debut devient immense : deux marches DISTINCTES (matin, soir) n\'en font plus qu\'une',
     [(TR, "TOL_DOUBLON_MIN: 10,", "TOL_DOUBLON_MIN: 100000,")], 'GARDE', T + 'D09', 'P,S,D'),
    ('M17 ⑤ le dedoublonnage ignore la famille : une marche et une course a la meme heure fusionnent',
     [(TR, "const d = out.find(x => x.famille === w.famille && Math.abs(x.debut - w.debut)", "const d = out.find(x => Math.abs(x.debut - w.debut)")], 'GARDE', T + 'D10', 'P,S,D'),
    ('M18 ⑤ [deguisee] le dedoublonnage depend de l\'ordre d\'arrivee (plus de tri total)',
     [(TR, "ws.slice().sort(_djCmp).forEach(w => {", "ws.slice().forEach(w => {")], 'GARDE', T + 'P29c', 'P'),
    ('M19 ⑤ [deguisee] la fusion garde la duree la plus COURTE (au lieu de la plus longue)',
     [(TR, "d.dureeMin = Math.max(d.dureeMin, w.dureeMin);", "d.dureeMin = Math.min(d.dureeMin, w.dureeMin);")], 'GARDE', T + 'P29d', 'P'),
    ('M20 ⑤ la fusion perd la valeur de la montre de la ligne retenue (la meilleure preuve disparait)',
     [(TR, "if (w.kcalMontreActive != null && (d.kcalMontreActive == null || meilleure)) d.kcalMontreActive = w.kcalMontreActive;", "")], 'GARDE', T + 'P29e', 'P'),
    ('M21 ⑤ [deguisee] la cle de tri n\'est plus un ordre TOTAL (origine et valeur de montre retirees)',
     [(TR, "return [w.debut, String(w.famille), -(w.dureeMin || 0), _djRangOrigine(w.origine), w.kcalMontreActive == null ? -1 : w.kcalMontreActive];", "return [w.debut, String(w.famille), -(w.dureeMin || 0)];")], 'GARDE', T + 'P29c', 'P'),
    # ── ⑥ UNE MONTRE N'EST PAS UN INSTRUMENT ──────────────────────────────────────────────────────────────────────
    ('M22 ⑥ le couloir de la montre disparait : une valeur aberrante est retenue telle quelle',
     [(TR, "if (estNet != null && estNet > 0) { const lo", "if (false) { const lo")], 'GARDE', T + 'P21', 'P,K,S'),
    ('M23 ⑥ le couloir haut passe de 2× a 20× l\'estimation active',
     [(TR, "COULOIR: Object.freeze([0.5, 2.0]),", "COULOIR: Object.freeze([0.5, 20.0]),")], 'GARDE', T + 'P21', 'P,K'),
    ('M24 ⑥ le couloir bas disparait : une montre saisie a 0 (capteur absent) vaut zero',
     [(TR, "COULOIR: Object.freeze([0.5, 2.0]),", "COULOIR: Object.freeze([0.0, 2.0]),")], 'GARDE', T + 'P22', 'P,K'),
    ('M25 ⑥ la fourchette d\'une valeur de montre devient nulle (± 0 %)',
     [(TR, "INCERT: Object.freeze({ montre: 0.20,", "INCERT: Object.freeze({ montre: 0.0,")], 'GARDE', T + 'P03d', 'P,K,S'),
    ('M26 ⑥ la fourchette d\'une estimation devient trop etroite (± 1 %) : elle ne contient plus la reference physiologique',
     [(TR, "met: 0.25, pas: 0.30,", "met: 0.01, pas: 0.30,")], 'GARDE', T + 'K06', 'P,K'),
    ('M27 ⑥ le cout de marche double (1,0 kcal/kg/km au lieu de 0,5) : la fourchette ne contient plus la reference ACSM',
     [(TR, "KCAL_KG_KM: 0.5,", "KCAL_KG_KM: 1.0,")], 'GARDE', T + 'K07', 'P,K'),
    ('M28 ⑥ le plafond de plausibilite (2 × le metabolisme de base) disparait',
     [(TR, "if (extra > plafond) {", "if (false) {")], 'GARDE', T + 'P15', 'P'),
    ('M29 ⑥ le plafond de plausibilite passe de 2× a 20× le metabolisme de base',
     [(TR, "PLAFOND_X_BMR: 2.0,", "PLAFOND_X_BMR: 20.0,")], 'GARDE', T + 'P15', 'P'),
    # ── ⑦ UN JOUR NE RECOIT QUE SES PROPRES DONNEES · RIEN N'EST INVENTE ──────────────────────────────────────────
    ('M30 ⑦ la facade reporte les pas d\'HIER sur aujourd\'hui (le dernier jour connu au lieu du meme jour)',
     [(TR, "((S.healthDaily || []).find(x => x && x.date === d && x.steps > 0)) || null;", "((S.healthDaily || []).slice().sort((a, b) => a.date < b.date ? 1 : -1).find(x => x && x.date <= d && x.steps > 0)) || null;")], 'GARDE', T + 'H01', 'H,A'),
    ('M31 ⑦ « aucune donnee » devient une donnee connue (« +0 » presente comme un fait)',
     [(TR, "const connu = sources.size > 0 || pas != null || ws.length > 0;", "const connu = true;")], 'GARDE', T + 'A01', 'P,A'),
    ('M32 ⑦ l\'absence de pas du jour n\'est plus dite',
     [(TR, "if (pas == null) manques.push('pas_du_jour');", "if (pas == null) { }")], 'GARDE', T + 'A02', 'P,A'),
    ('M33 ⑦ l\'absence d\'habitude de pas n\'est plus dite',
     [(TR, "} else manques.push('habitude_pas');", "} else { }")], 'GARDE', T + 'A04', 'P,A'),
    ('M34 ⑦ une habitude de pas est supposee des 3 jours (au lieu de 7) : 40 000 pas comptes sur 4 jours seulement',
     [(TR, "PAS_MIN_JOURS: 7,", "PAS_MIN_JOURS: 3,")], 'GARDE', T + 'A04', 'P,A'),
    ('M35 ⑦ le seuil de 1 500 pas redevient une falaise (le moteur actuel saute de 0 a 47 kcal)',
     [(TR, "const k = surplus > P.PAS_SEUIL ? ((surplus - P.PAS_SEUIL) / P.PAS_PAR_KM) * kg * P.KCAL_KG_KM : 0;", "const k = surplus > P.PAS_SEUIL ? (surplus / P.PAS_PAR_KM) * kg * P.KCAL_KG_KM : 0;")], 'GARDE', T + 'P19', 'P'),
    ('M36 ⑦ 1 000 pas par km au lieu de 1 300 : toutes les valeurs de pas changent',
     [(TR, "PAS_PAR_KM: 1300,", "PAS_PAR_KM: 1000,")], 'GARDE', T + 'P05', 'P,K'),
    ('M37 ⑦ [deguisee] la fenetre de l\'historique commence AUJOURD\'HUI : les pas du jour entrent dans leur propre habitude',
     [(TR, "for (let k = 1; k <= 30; k++) {", "for (let k = 0; k <= 30; k++) {")], 'GARDE', T + 'H13', 'H'),
    ('M38 ⑦ [deguisee] le decalage de jour se calcule a minuit local (le jour d\'avant devient avant-avant-hier a Paris)',
     [(TR, "function _djJourDecale(date, n) { const d = new Date(date + 'T12:00:00');", "function _djJourDecale(date, n) { const d = new Date(date + 'T00:00:00');")], 'GARDE', T + 'H11', 'H'),
    # ── non-negatif · les adaptateurs ─────────────────────────────────────────────────────────────────────────────
    ('M39 la cle « jamais negatif » disparait (un jour calme avec un sport declare retranche de la reference)',
     [(TR, "const netEntr = Math.max(0, netTot - alloc), kf", "const netEntr = netTot - alloc, kf"), (TR, "extra = Math.max(0, extra); lo = Math.max(0, lo); hi = Math.max(0, hi);", "")], 'GARDE', T + 'P25', 'P,A,S'),
    ('M40 la reference redevient fonction des pas : un ecart de pas notable s\'ajoute a la reference (elle ne vaut plus le TDEE du profil)',
     [(TR, "function depenseReference() { try { return calcTDEE(); } catch (e) { return null; } }", "function depenseReference() { try { const t = calcTDEE(), e = (typeof _pasEcart === 'function') ? _pasEcart() : null; return (t != null && e && e.depasse) ? t + 100 : t; } catch (e) { return null; } }")], 'GARDE', T + 'N08', 'N,S'),
    ('M41 l\'adaptateur ne transmet plus la valeur de montre saisie (elle est perdue, l\'estimation reprend)',
     [(TR, "kcalMontreActive: k.manuelle,", "kcalMontreActive: undefined,")], 'GARDE', T + 'S114', 'S,D'),
    ('M42 l\'adaptateur ignore le cardio fait AVANT la seance de musculation',
     [(TR, "[s.cardioAvant, s.cardio].forEach(b => {", "[s.cardio].forEach(b => {")], 'GARDE', T + 'S118', 'S'),
    # ── L'OBJECTIF NE DEPEND PLUS DES PAS (etape 2) — la reference est le TDEE du profil, le « reste » ne bouge pas, l'estimee n'est jamais une consigne ─────────────────────
    ('M43 ⛔ la CIBLE alimentaire est augmentee du « en plus » du jour (l\'estimee redevient une consigne)',
     [(ST, "  return tdee+goalDelta+phaseAdj+lutealBonus;\n}", "  return tdee+goalDelta+phaseAdj+lutealBonus+(typeof depenseEstimeeDuJour==='function'?((depenseEstimeeDuJour()||{}).extra||0):0);\n}")], 'GARDE', T + 'N01', 'N'),
    ('M44 ⛔ l\'etape 2 est DEFAITE en cachette : `calcTDEE` reprend le surplus de pas, plafonne a 500 (la cible monte de nouveau avec les pas)',
     [(ST, "return Math.round(calcBMR()*S.activityLevel+calcWorkExtra()+calcSportExtra());", "return Math.round(calcBMR()*S.activityLevel+calcWorkExtra()+calcSportExtra()+(()=>{const e=(typeof _pasEcart==='function')?_pasEcart():null;return (e&&e.depasse)?Math.min(500,Math.round((e.surplus/1300)*(S.bw||80)*0.5)):0;})());")], 'GARDE', T + 'N01', 'N,H,S'),
    ('M45 ⛔ le seuil « notable » de `_pasEcart` passe de 1 500 a 150 pas (tout ecart ordinaire devient un « effort »)',
     [(TR, "const PAS_SEUIL      = 1500;", "const PAS_SEUIL      = 150; ")], 'GARDE', T + 'N04', 'N'),
    ('M46 ⛔ [deguisee] le « reste » du jour (Accueil) ajoute le « en plus » estime : l\'estimee redevient une consigne (le reste monte avec les pas)',
     [(AP, "kcal:  r(cible.calories - tot.kcal),", "kcal:  r(cible.calories - tot.kcal + ((typeof depenseEstimeeDuJour === 'function') ? ((depenseEstimeeDuJour() || {}).extra || 0) : 0)),")], 'GARDE', T + 'N14', 'N,H'),
    ('M47 [deguisee] la fenetre de `_pasEcart` perd la veille (age maximal 1 → 0 jour) : une lecture directe ne rend plus les pas d\'hier avec leur date',
     [(TR, "if(!(age>=0)||age>1) return null;", "if(!(age>=0)||age>0) return null;")], 'GARDE', T + 'N04', 'N'),
    ('M47b [deguisee] la fenetre de `_pasEcart` accepte l\'avant-veille (age maximal 1 → 2 jours) : des pas de 2 jours pourraient etre pris pour recents',
     [(TR, "if(!(age>=0)||age>1) return null;", "if(!(age>=0)||age>2) return null;")], 'GARDE', T + 'N04', 'N'),
    # ── AUCUN EFFET DE BORD ───────────────────────────────────────────────────────────────────────────────────────
    ('M48 ⛔ le moteur lit l\'horloge (`Date.now`)',
     [(TR, "const P = DJ_PARAMS, U = P.INCERT;\n  if (!profil", "const P = DJ_PARAMS, U = P.INCERT; const _t0 = Date.now();\n  if (!profil")], 'GARDE', T + 'P30', 'P'),
    ('M49 ⛔ le moteur lit l\'etat global `S`',
     [(TR, "const P = DJ_PARAMS, U = P.INCERT;\n  if (!profil", "const P = DJ_PARAMS, U = P.INCERT; const _s = (typeof S !== 'undefined' ? S.bw : 0);\n  if (!profil")], 'GARDE', T + 'P30', 'P'),
    ('M50 ⛔ le moteur parle au reseau (appel garde par un `if (false)`, la source suffit a le trahir)',
     [(TR, "const P = DJ_PARAMS, U = P.INCERT;\n  if (!profil", "const P = DJ_PARAMS, U = P.INCERT; if (false) { fetch('/dj'); }\n  if (!profil")], 'GARDE', T + 'P30', 'P'),
    ('M51 ⛔ [deguisee] le moteur MODIFIE son entree (le nombre de pas du jour est remis a null apres usage)',
     [(TR, "const connu = sources.size > 0 || pas != null || ws.length > 0;", "const connu = sources.size > 0 || pas != null || ws.length > 0; jour.pas = null;")], 'GARDE', T + 'P27', 'P'),
    ('M52 ⛔ les parametres ne sont plus geles (un temoin ou un code peut les changer en route)',
     [(TR, "const DJ_PARAMS = Object.freeze({", "const DJ_PARAMS = ({")], 'GARDE', T + 'P31', 'P'),
    ('M53 ⛔ le moteur porte un bareme MET a lui (au lieu de l\'estimation du proprietaire `kcalBloc`)',
     [(TR, "function djCadence(w) {", "const _MET_PROPRE = { marche: 3.8 };\nfunction djCadence(w) {")], 'GARDE', T + 'P32', 'P'),
    ('M54 ⛔ la facade ECRIT dans l\'etat de l\'application',
     [(TR, "if (r) { r.date = d;", "if (r) { S._dj = r; r.date = d;")], 'GARDE', T + 'E04', 'E'),
    ('M55 ⛔ la facade PERSISTE (ecriture du stockage a chaque affichage)',
     [(TR, "if (r) { r.date = d;", "if (r) { persist(); r.date = d;")], 'GARDE', T + 'E03', 'E'),
    ('M56 ⛔ la facade declenche une SYNCHRONISATION',
     [(TR, "if (r) { r.date = d;", "if (r) { _cloudSyncDebounced(); r.date = d;")], 'GARDE', T + 'E03', 'E'),
    ('M57 ⛔ la facade parle au RESEAU',
     [(TR, "if (r) { r.date = d;", "if (r) { try { fetch('https://exemple.invalid/dj').catch(function () {}); } catch (e) {} r.date = d;")], 'GARDE', T + 'E02', 'E'),
    # ── L'AFFICHAGE · ne jamais laisser croire que ce sont des calories a manger ──────────────────────────────────────
    ('M58 la note d\'information disparait',
     [(SC, "À titre d\\'information. Ces calories ne s\\'ajoutent pas à ton objectif — ton niveau d\\'activité compte déjà ton entraînement habituel — et ce ne sont pas des calories en plus à manger.", "Information du jour.")], 'GARDE', T + 'U04', 'U'),
    ('M59 un mot de la carte invite a manger plus (« budget » dans la ligne de l\'estimee)',
     [(SC, "' · estimation, pas une mesure'", "' · estimation, pas une mesure · budget en plus'")], 'GARDE', T + 'U04', 'U'),
    ('M60 la fourchette n\'est plus affichee (un chiffre seul, presente comme une mesure)',
     [(SC, "('de ' + _fmtKcal(r.bande.lo) + ' à ' + _fmtKcal(r.bande.hi) + ' · estimation, pas une mesure')", "('estimation, pas une mesure')")], 'GARDE', T + 'U02', 'U'),
    ('M61 la provenance de chaque ligne n\'est plus affichee',
     [(SC, "(val ? src + u : src)", "''")], 'GARDE', T + 'U02', 'U'),
    ('M62 l\'estimee perd son « ≈ » (un chiffre presente comme exact)',
     [(SC, "(extra ? '≈ ' : '') + k(r.estime)", "k(r.estime)")], 'GARDE', T + 'U01', 'U'),
    ('M63 ⛔ l\'objectif affiche est l\'ESTIMEE (la cible reelle `calcMacros` n\'est plus montree)',
     [(SC, "(m && m.calories != null) ? k(m.calories) : '—'", "k(r.estime)")], 'GARDE', T + 'U03', 'U'),
    ('M65 la fenetre « 7 derniers jours » de la depense enregistree passe a 8 jours',
     [(SC, "d0.setDate(d0.getDate() - 6);\n  const d7", "d0.setDate(d0.getDate() - 7);\n  const d7")], 'GARDE', T + 'U19', 'U'),
    ('M66 ⛔ l\'affichage ECRIT (appel de `persist` dans la carte)',
     [(SC, "const k = n => _fmtKcal(n) + ' kcal';", "persist(); const k = n => _fmtKcal(n) + ' kcal';")], 'GARDE', T + 'U17', 'U'),
    ('M67 ⛔ l\'appel de la carte n\'est plus protege : une erreur de la carte bloquerait l\'ecran Nutrition',
     [(SC, "try{ _renderDepenseJour(); }catch(e){ /* jamais bloquant : le bloc est un ajout d'AFFICHAGE (TDEE V2, étape 1) */ }", "_renderDepenseJour();")], 'GARDE', T + 'U17', 'U'),
    ('M69 le conteneur de la carte disparait de la page Nutrition (la carte n\'existe plus)',
     [(IX, '<div id="nu-dj" style="display:none;margin-top:8px;"></div>', '')], 'GARDE', T + 'U01', 'U'),
    ('M73 ⛔ [deguisee] la facade cree une cle dans l\'etat UNE SEULE FOIS (au premier calcul seulement)',
     [(TR, "if (r) { r.date = d;", "if (r) { if (!S._dj) S._dj = 1; r.date = d;")], 'GARDE', T + 'E04', 'E'),
    ('M74 ⛔ la carte ecrit dans le stockage local au premier affichage',
     [(SC, "const k = n => _fmtKcal(n) + ' kcal';", "try { localStorage.setItem('ft4_dj_vu', '1'); } catch (e) {} const k = n => _fmtKcal(n) + ' kcal';")], 'GARDE', T + 'E01', 'E,U'),
    # ── ETAPE 2 (NUT-TDEE-02) · LES PAS ET LES ACTIVITES NE TOUCHENT PLUS L'OBJECTIF · LES TEXTES VIVANTS DISENT LA NOUVELLE REGLE ───────────────────────
    ('M75 ⛔ `calcTDEE` ajoute les calories de l\'activite enregistree du jour (la cible monte avec une marche ou une seance)',
     [(ST, "return Math.round(calcBMR()*S.activityLevel+calcWorkExtra()+calcSportExtra());", "return Math.round(calcBMR()*S.activityLevel+calcWorkExtra()+calcSportExtra()+(S.sessions||[]).filter(s=>s&&s.date===today()).reduce((a,s)=>a+(+s.calories||0),0));")], 'GARDE', T + 'N02', 'N'),
    ('M76 ⛔ R30 · l\'ancienne fonction `calcPasExtra` est RESSUSCITEE (code mort, mais rebranchable en un mot)',
     [(ST, "function calcTDEE(){\n  if(profilCaloriqueManquants().length) return null;", "function calcPasExtra(){ return 0; }\nfunction calcTDEE(){\n  if(profilCaloriqueManquants().length) return null;")], 'GARDE', T + 'N03', 'N'),
    ('M77 ⛔ `_pasEcart` redit des calories : une cle `kcal` reapparait (deuxieme proprietaire de la conversion pas → kcal)',
     [(TR, "depasse: surplus>=PAS_SEUIL};", "depasse: surplus>=PAS_SEUIL, kcal: 0};")], 'GARDE', T + 'N04', 'N'),
    ('M78 ⛔ la decomposition de la cible retrouve un terme « pas »',
     [(ST, "base:d.tdee-travail-sport,travail,sport,", "base:d.tdee-travail-sport,travail,sport,pas:0,")], 'GARDE', T + 'N10', 'N'),
    ('M79 [deguisee] la « base » de la decomposition oublie le sport (la somme des trois termes ne retombe plus sur le TDEE)',
     [(ST, "base:d.tdee-travail-sport,travail,sport,", "base:d.tdee-travail,travail,sport,")], 'GARDE', T + 'N10', 'N'),
    ('M80 ⛔ [deguisee] `calcTDEE` lit les pas du DERNIER jour connu (couplage cache : la cible d\'un jour passe bouge avec les pas d\'aujourd\'hui)',
     [(ST, "return Math.round(calcBMR()*S.activityLevel+calcWorkExtra()+calcSportExtra());", "return Math.round(calcBMR()*S.activityLevel+calcWorkExtra()+calcSportExtra()+(((S.healthDaily||[]).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]||{}).steps>20000?300:0));")], 'GARDE', T + 'H14', 'N,H'),
    ('M81 ⛔ Milo : les pas d\'HIER sont racontes comme ceux d\'AUJOURD\'HUI (la date n\'est plus verifiee)',
     [(CO, "if(!e||!e.depasse||e.date!==today()) return '';", "if(!e||!e.depasse) return '';")], 'GARDE', T + 'N11', 'N'),
    ('M82 ⛔ Milo reprend l\'ancienne phrase « DEJA ajoutees a son TDEE — ne les recompte pas » (un fait faux dit a Milo, R8)',
     [(CO, "⛔ Ces pas ne changent PAS son objectif calorique ni son TDEE : ils servent seulement à estimer sa dépense du jour, à titre d'information. Ne dis JAMAIS qu'ils lui donnent des calories en plus à manger. ", "DÉJÀ ajoutées à son TDEE — ne les recompte pas. ")], 'GARDE', T + 'N11', 'N'),
    ('M83 Milo : le detail du calcul de la cible cite de nouveau un terme « pas »',
     [(CO, "+' '+n(d.travail)+' travail '+n(d.sport)+' autre sport'", "+' '+n(d.travail)+' travail '+n(d.sport)+' autre sport '+n(0)+' pas'")], 'GARDE', T + 'N12', 'N'),
    ('M84 ⛔ Progres : la carte nomme les pas d\'hier « aujourd\'hui » (la veille est prise pour le jour)',
     [(TR, "(dernier.date===_veille?'hier':", "(dernier.date===_veille?'aujourd\\'hui':")], 'GARDE', T + 'N13', 'N'),
    ('M85 ⛔ Progres : la carte rechiffre des kcal a cote des pas',
     [(TR, "${nb(e.surplus)} de plus que ton habitude</span>", "${nb(e.surplus)} de plus que ton habitude · +290 kcal</span>")], 'GARDE', T + 'N13', 'N'),
    ('M86 ⛔ Progres : la carte depliee redit que les jours en vert s\'ajoutent a l\'objectif',
     [(TR, "ils comptent dans ta dépense estimée du jour (onglet Nutrition), pas dans ton objectif alimentaire. ", "ils s'ajoutent à ta dépense et à ton objectif. ")], 'GARDE', T + 'N13', 'N'),
    ('M87 ⛔ la ligne « 🚶 +K kcal » sous le TDEE revient dans la page Nutrition (son conteneur reapparait)',
     [(IX, "<!-- 🚶 RETRAIT (06/11/2026, NUT-TDEE-02) : la ligne `nu-tdee-pas` (provenance du surplus de pas sous le TDEE) n'existe plus — le TDEE ne contient plus de pas -->", '<div id="nu-tdee-pas"></div>')], 'GARDE', T + 'N15', 'N'),
    ('M88 ⛔ l\'aide « ? » de Nutrition redit que l\'objectif suit les pas (bonus borne a 500 kcal)',
     [(SC, "⛔ <b>Ton objectif ne bouge pas avec tes pas</b>", "⛔ <b>Ton objectif suit tes pas</b> (bonus borné à 500 kcal)")], 'GARDE', T + 'U18', 'U,N'),
    ('M89 ⛔ la diapo du Guide redit que les pas s\'ajoutent a la depense ET a l\'objectif',
     [(AP, "⛔ <b>Ça ne change pas ton objectif</b>", "⭐ <b>Ça s\\'ajoute à ta dépense et à ton objectif</b>")], 'GARDE', T + 'N15', 'N'),
    # ── ITEM 6 · L'INFORMATION PRUDENTE : ni faux positif, ni consigne, ni objectif releve ──────────────────────────────────────────
    ('M90 ⛔ l\'alerte se declenche SANS effort exceptionnel (la condition sur l\'effort disparait : une cible basse suffit)',
     [(TR, "alerte: r.extra >= P.ALERTE_EFFORT_KCAL && ecart >= P.ALERTE_ECART_KCAL }", "alerte: ecart >= P.ALERTE_ECART_KCAL }")], 'GARDE', T + 'P33', 'P,U'),
    ('M91 ⛔ l\'alerte se declenche pour un effort exceptionnel meme quand l\'ecart avec l\'objectif est faible (la condition sur l\'ecart disparait)',
     [(TR, "alerte: r.extra >= P.ALERTE_EFFORT_KCAL && ecart >= P.ALERTE_ECART_KCAL }", "alerte: r.extra >= P.ALERTE_EFFORT_KCAL }")], 'GARDE', T + 'P33', 'P,U'),
    ('M92 le seuil d\'effort exceptionnel est divise par dix (800 → 80 kcal)',
     [(TR, "ALERTE_EFFORT_KCAL: 800,", "ALERTE_EFFORT_KCAL: 80,")], 'GARDE', T + 'P33', 'P,U'),
    ('M93 le seuil d\'ecart avec l\'objectif est divise par dix (1 000 → 100 kcal)',
     [(TR, "ALERTE_ECART_KCAL: 1000,", "ALERTE_ECART_KCAL: 100,")], 'GARDE', T + 'P33', 'P,U'),
    ('M94 [deguisee] l\'ecart se calcule a l\'envers (objectif − estimee) : l\'alerte se declenche pour une journee CALME',
     [(TR, "ecart = Math.round(r.estime - objectif)", "ecart = Math.round(objectif - r.estime)")], 'GARDE', T + 'P33', 'P,U'),
    ('M95 ⛔ le texte de l\'alerte devient une consigne qui invite a manger plus',
     [(SC, "c\\'est une information, pas une consigne.", "tu peux donc manger davantage.")], 'GARDE', T + 'U22', 'U'),
    ('M96 ⛔ le texte de l\'alerte annonce que l\'objectif va changer',
     [(SC, "<b>Ton objectif ne change pas.</b>", "<b>Ton objectif va augmenter.</b>")], 'GARDE', T + 'U20', 'U'),
    ('M97 ⛔ [deguisee] l\'alerte RELEVE reellement l\'objectif affiche (+200 kcal quand elle se declenche)',
     [(SC, "(m && m.calories != null) ? k(m.calories) : '—',", "(m && m.calories != null) ? k(m.calories + ((djEcartObjectif(r, m.calories) || {}).alerte ? 200 : 0)) : '—',")], 'GARDE', T + 'U20', 'U'),
    # ── TD-C08 · une seule conversion brut → actif ─────────────────────────────────────────────────────────────────────────────────────
    ('M98 ⛔ la soustraction du repos (`kg × h`) est ECRITE UNE DEUXIEME FOIS dans le moteur (deux conversions brut → actif qui divergeront)',
     [(TR, "function djCadence(w) {", "const _djRepos2 = (brut, kg, h) => brut - kg * h;\nfunction djCadence(w) {")], 'GARDE', T + 'P34', 'P'),
    ('M99 ⛔ TD-C07 · une TROISIEME lecture brute de `S.sessions` apparait dans le code de la V2 (la facade compte les lignes de l\'historique sans passer par la vue des seances)',
     [(TR, "const kg = _nbUtil(S.bw), bmr = calcBMR();", "const kg = _nbUtil(S.bw), bmr = calcBMR(); const _nbrut = (S.sessions || []).length;")], 'GARDE', T + 'U24', 'U'),
    # ── equivalentes : le banc ne doit PAS rougir pour ce qui ne change rien ──────────────────────────────────────────
    ('M70 [equivalente] deux affectations independantes de la fusion sont inversees (meme resultat)',
     [(TR, "    if (meilleure) d.origine = w.origine;\n    d.fusion = (d.fusion || 1) + 1;", "    d.fusion = (d.fusion || 1) + 1;\n    if (meilleure) d.origine = w.origine;")], 'OK', None, 'P,S,D,H,A'),
    ('M71 [equivalente] `depenseReference` normalise un `undefined` eventuel en `null` (`calcTDEE` ne rend qu\'un nombre ou `null` : meme resultat)',
     [(TR, "function depenseReference() { try { return calcTDEE(); } catch (e) { return null; } }", "function depenseReference() { try { return calcTDEE() ?? null; } catch (e) { return null; } }")], 'OK', None, 'S,H,N'),
    ('M72 [equivalente] le texte de l\'avertissement du plafond change de forme (aucun calcul touche)',
     [(TR, "avert.push('plafond de plausibilité atteint (' + Math.round(plafond) + ' kcal)');", "avert.push('plafond de plausibilité (' + Math.round(plafond) + ' kcal) atteint');")], 'OK', None, 'P,S'),
]


def banc(arbre, blocs=None):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    env = dict(os.environ, TZ='Europe/Paris')
    env.pop('TDEE_BLOCS', None); env.pop('TDEE_MATRICE', None)
    if blocs: env['TDEE_BLOCS'] = blocs
    try:
        r = subprocess.run(['node', 'tools/banc_tdee_v2.js'], cwd=arbre, capture_output=True, text=True, timeout=1500, env=env)
    except subprocess.TimeoutExpired:
        return [], 'PLANTAGE (delai depasse)'
    out = r.stdout + r.stderr
    rouges = [l.strip()[:170] for l in out.split('\n') if 'ROUGE' in l]
    plantage = None
    if r.returncode not in (0, 1):
        plantage = 'PLANTAGE (code %d)' % r.returncode
    elif 'PLANTAGE' in out:
        plantage = 'PLANTAGE (' + next(l.strip()[:120] for l in out.split('\n') if 'PLANTAGE' in l) + ')'
    elif not any(l.startswith('────') and 'OK /' in l for l in out.split('\n')):
        plantage = 'PLANTAGE (aucune ligne de total)'
    return rouges, plantage


def _appliquer_tout(srcs, remplacements):
    return [e for e in (m.appliquer(srcs, f, av, ap) for f, av, ap in remplacements) if e]


def _syntaxe(arbre, fichiers):
    for f in fichiers:
        if f.endswith('.js'):
            chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync(process.argv[1],'utf8'))", os.path.join(arbre, f)], capture_output=True, text=True)
            if chk.returncode:
                return f
    return None


def valider(mut):
    """MUT_VALIDE=1 : l'ancre est-elle exacte et unique, la syntaxe reste-t-elle valide ? (aucun banc, aucune copie de l'arbre)"""
    nom, remplacements, attendu, temoin, blocs = mut
    srcs = {f: open(os.path.join(SRC, f), encoding='utf-8').read() for f in FICHIERS}
    invalide = _appliquer_tout(srcs, remplacements)
    if invalide:
        return nom, None, 'INVALIDE (ancre absente ou multiple : %s)' % invalide, []
    tmp = tempfile.mkdtemp(prefix='mut_tdee_val_')
    try:
        for f in {r[0] for r in remplacements}:
            open(os.path.join(tmp, f), 'w', encoding='utf-8').write(srcs[f])
        casse = _syntaxe(tmp, {r[0] for r in remplacements})
        if casse:
            return nom, None, 'INVALIDE (syntaxe cassee dans %s)' % casse, []
        return nom, True, 'ancres valides', []
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def une(mut):
    nom, remplacements, attendu, temoin, blocs = mut
    tmp, arbre = m.cloner()
    try:
        srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
        invalide = _appliquer_tout(srcs, remplacements)
        if invalide:
            return nom, None, 'INVALIDE (ancre absente ou multiple : %s)' % invalide, []
        for f in FICHIERS:
            open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        casse = _syntaxe(arbre, FICHIERS)       # une mutation qui casse la SYNTAXE ne prouve rien (elle rougit tout) : on la refuse
        if casse:
            return nom, None, 'INVALIDE (syntaxe cassee dans %s)' % casse, []
        rouges, plantage = banc(arbre, blocs)
        if plantage:
            return nom, False, 'PLANTAGE', [plantage] + rouges
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu
        if ok and temoin and not m.temoin_present(rouges, temoin):
            ok, obtenu = False, 'GARDE sans ' + temoin
        return nom, ok, obtenu, rouges
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    choix = [mu for mu in MUT if not filtres or any(mu[0].startswith(f) for f in filtres)]
    if os.environ.get('MUT_VALIDE'):
        res = [valider(mu) for mu in choix]
        mauvais = 0
        for nom, ok, obtenu, _ in res:
            if ok is None: mauvais += 1; print('  INVALIDE  %s %s' % (nom, obtenu))
        print('%d/%d mutations valides (ancres exactes et uniques, syntaxe saine)' % (len(res) - mauvais, len(res)))
        return 1 if mauvais else 0
    if os.environ.get('MUT_SAIN', '1') != '0':
        tmp0, a0 = m.cloner()
        rouges, plantage = banc(a0)
        shutil.rmtree(tmp0, ignore_errors=True)
        if rouges or plantage:
            print('  !! ARBRE SAIN DEJA ROUGE OU EN PLANTAGE — controle refuse :', ([plantage] if plantage else []) + rouges[:3]); return 1
        print('  arbre sain : 0 rouge (point de depart valide) · MUT_J=%s\n' % os.environ.get('MUT_J', '2'))
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '2'))) as ex:
        res = list(ex.map(une, choix))
    conformes = 0
    for (nom, ok, obtenu, rouges), mu in zip(res, choix):
        if ok is None:
            print('  INVALIDE  %s %s' % (nom, obtenu)); continue
        conformes += ok
        print('  %s  %-118s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0][:90] if rouges else ''))
        if not ok and mu[3]:
            print('        attendu : %s ; obtenu : %s' % (mu[3], ' | '.join(re.sub(r'^.*ROUGE\s+', '', r)[:26] for r in rouges[:12])))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges[1:]:
                print('        ' + r)
    if os.environ.get('MUT_SAIN', '1') != '0':
        # rejeu de l'arbre sain APRES la campagne : un banc instable aurait pu « attraper » par hasard
        tmp1, a1 = m.cloner()
        rouges1, plantage1 = banc(a1)
        shutil.rmtree(tmp1, ignore_errors=True)
        if rouges1 or plantage1:
            print('\n  !! ARBRE SAIN ROUGE AU REJEU FINAL — campagne refusee (banc instable) :', ([plantage1] if plantage1 else []) + rouges1[:3])
            return 1
        print('\n  arbre sain rejoue a la fin : 0 rouge (banc stable)')
    print('\n%d/%d conformes' % (conformes, len(choix)))
    return 0 if conformes == len(choix) else 1


if __name__ == '__main__':
    sys.exit(main())
