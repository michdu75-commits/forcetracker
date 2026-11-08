#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — « AUTRE ACTIVITE » + CALORIES PERSONNALISABLES (05/11/2026, session-C, Claude N°2 Seance) : les temoins C-ACT-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain (TOUS les blocs), mesure d'abord ; l'arbre sain est REJOUE a la fin (banc stable).
Chaque mutation vise un INVARIANT precis et nomme SON temoin (4e champ) : « GARDE » = au moins un rouge ET ce temoin present dans les rouges ;
« OK » = la mutation est EQUIVALENTE (aucun rouge : le banc n'est pas sensible a ce qui ne change rien).
Un PLANTAGE du banc (code hors 0/1, ligne PLANTAGE, pas de ligne de total) n'est jamais « garde » : il n'attrape rien.
Pour aller vite, une mutation ne rejoue que les BLOCS qui peuvent la voir (5e champ, variable ACT_BLOCS du banc) ; l'arbre sain, lui, rejoue tout.
Une ancre est exacte et UNIQUE (sinon INVALIDE) ; `re:` en tete = expression reguliere qui doit correspondre exactement une fois.
Un 5e champ « SRC:module.js » joue, au lieu du banc, la fonction `source` d'un module voisin de tests/parcours (aucun navigateur) : c'est ainsi que sont eprouves les temoins de SOURCE re-vises par ce chantier
(B-CCCXIX ⑥ dans accueil_mini.js, PS-S3 dans progres_seances.js) — un temoin re-ecrit doit rougir sous mutation volontaire (R17).
Usage : python3 tools/mut_autre_activite.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=2 par defaut · MUT_SAIN=0 : saute l'arbre sain)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AP, ST, LO, SE, SC, CO, TR, IX, DB = 'app.js', 'state.js', 'log.js', 'setup.js', 'screens.js', 'coach.js', 'tracking.js', 'index.html', 'dashboard.js'
FICHIERS = (AP, ST, LO, SE, SC, CO, TR, IX, DB)

# (nom, [(fichier, ancien, nouveau)], attendu, temoin, blocs)
MUT = [
    # ── B · le mecanisme commun des calories ───────────────────────────────────────────────────────────────────────
    ('M01 la valeur retenue ADDITIONNE la valeur de la montre a l\'estimation (255 + 312)',
     [(AP, 'retenue:man!=null?man:est,origine:', 'retenue:man!=null?(man+est):est,origine:')], 'GARDE', 'C-ACT-A6', 'A,B'),
    ('M02 [deguisee] « 0 » saisi est traite comme un champ vide (zero = absent)',
     [(AP, "if(t==='')return{etat:'vide'};", "if(t===''||t==='0')return{etat:'vide'};")], 'GARDE', 'C-ACT-A25', 'A'),
    ('M03 [deguisee] rouvrir une activite recalcule son estimation au POIDS DU JOUR au lieu du poids range',
     [(AP, 'let est, poids=(+a.kcalPoids>0?+a.kcalPoids:(+S.bw>0?+S.bw:80));', 'let est, poids=(+S.bw>0?+S.bw:80);')], 'GARDE', 'C-ACT-A19', 'A,G'),
    ('M04 la valeur de la montre n\'est plus enregistree (perdue a chaque « Enregistrer »)',
     [(AP, "if(typeof _au.kcalMan==='number')a.kcalMan=_au.kcalMan;", "")], 'GARDE', 'C-ACT-A7', 'A,B'),
    ('M05 « Revenir a l\'estimation » laisse une valeur saisie de 0 (au lieu de la retirer)',
     [(AP, "_au.kcalMan=(r.etat==='ok')?r.valeur:undefined;", "_au.kcalMan=(r.etat==='ok')?r.valeur:0;")], 'GARDE', 'C-ACT-A13', 'A'),
    ('M06 un cardio SEUL qui porte une valeur de montre recoit de nouveau le forfait d\'echauffement du moteur',
     [(LO, "  if(!(sess.exs||sess.exercises||[]).length && _kcalAvecSaisie(sess)) calData.total=cardioKcal;\n", "")], 'GARDE', 'C-ACT-B4', 'B'),
    ('M07 [deguisee] le cardio d\'une seance de musculation compte l\'estimation EN PLUS de la valeur de la montre',
     [(LO, 'const cardioKcal=kA.retenue+kB.retenue;', 'const cardioKcal=kA.retenue+kB.retenue+(kB.remplacee?kB.estimee:0)+(kA.remplacee?kA.estimee:0);')], 'GARDE', 'C-ACT-B6', 'B'),
    ('M08 [deguisee] le detail d\'un ANCIEN cardio affiche le calcul au poids du jour au lieu de la valeur rangee',
     [(AP, 'const totalAnc=(rangee>0&&sOrig>0)?Math.round(rangee*sCur/sOrig):null;', 'const totalAnc=null;')], 'GARDE', 'C-ACT-B10', 'B'),
    ('M34 le TYPE d\'activite ne change plus l\'estimation (tout est « autre »)',
     [(AP, '? (AUTRE_MET[b.type]||AUTRE_MET.autre)', '? AUTRE_MET.autre')], 'GARDE', 'C-ACT-A17', 'A'),
    # ── A · le formulaire, l'identite, l'ecriture ─────────────────────────────────────────────────────────────────
    ('M29 la suppression n\'attend plus de confirmation',
     [(AP, 'if(!_auDelConfirm){', 'if(false){')], 'GARDE', 'C-ACT-A20', 'A'),
    ('M30 l\'activite est ecrite avec une SERIE de musculation',
     [(AP, "Object.assign({},ancien||{},{id:ancien?ancien.id:id,ts:ancien?ancien.ts:id,date:v.date,exs:[],exercises:[],volume:0,", "Object.assign({},ancien||{},{id:ancien?ancien.id:id,ts:ancien?ancien.ts:id,date:v.date,exs:[{name:'Marche',sets:[{kg:0,reps:1,type:'N',done:true}]}],exercises:[],volume:0,")], 'GARDE', 'C-ACT-A7', 'A'),
    ('M35 la duree maximale (1 440 min) n\'est plus controlee',
     [(AP, '||duration>AU_DUREE_MAX||', '||')], 'GARDE', 'C-ACT-A26', 'A'),
    ('M36 une date FUTURE est acceptee',
     [(AP, "  if(date>today())return{ok:false,raison:'La date ne peut pas être dans le futur'};\n", "")], 'GARDE', 'C-ACT-A26', 'A'),
    ('M33 [deguisee] la tuile « Autre activite » remonte au-dessus de « Programme » (meme DOM, autre place)',
     [(IX, '<button class="la-cta2 ft-press" id="la-autre"', '<button class="la-cta2 ft-press" style="order:-1" id="la-autre"')], 'GARDE', 'C-ACT-A2', 'A'),
    ('M27 deux activites creees a la meme minute recoivent le MEME identifiant',
     [(AP, 'while(pris(t)) t++;', '')], 'GARDE', 'C-ACT-C14', 'C'),
    ('M28 [deguisee] la date par defaut d\'une activite est celle d\'UTC, pas celle du telephone',
     [(AP, "date:today(),heure:_auHeureMaintenant(),distTxt:''", "date:new Date().toISOString().slice(0,10),heure:_auHeureMaintenant(),distTxt:''")], 'GARDE', 'C-ACT-C16', 'C'),
    # ── C · les bilans ─────────────────────────────────────────────────────────────────────────────────────────────
    ('M14 le bilan compte une activite comme une SEANCE de musculation',
     [(AP, "if(g==='autre'){ r.nAutre++; r.kcal.autre+=cal; return; }", "if(g==='autre'){ r.nAutre++; r.nMuscu++; r.kcal.autre+=cal; return; }")], 'GARDE', 'C-ACT-C1', 'C'),
    ('M15 [deguisee] le total du bilan compte les calories d\'une activite DEUX fois',
     [(AP, "if(g==='autre'){ r.nAutre++; r.kcal.autre+=cal; return; }", "if(g==='autre'){ r.nAutre++; r.kcal.autre+=cal; r.kcal.total+=cal; return; }")], 'GARDE', 'C-ACT-A9', 'A,C'),
    ('M16 [deguisee] une semaine de musculation SEULE change de libelle (« Calories dépensées »)',
     [(AP, '<span class="week-sum-lbl">🔥 Calories</span><span class="week-sum-val">${totalCal} kcal</span></div>`:\'\'}', '<span class="week-sum-lbl">🔥 Calories dépensées</span><span class="week-sum-val">${totalCal} kcal</span></div>`:\'\'}')], 'GARDE', 'C-ACT-C7', 'C'),
    ('M17 une ancienne seance dont la part cardio n\'a jamais ete rangee n\'est plus signalee',
     [(AP, 'if(blocs&&!rangee){ r.cardioNonRepartie++; r.kcal.muscu+=cal; }', 'if(blocs&&!rangee){ r.kcal.muscu+=cal; }')], 'GARDE', 'C-ACT-C8', 'C'),
    ('M31 [deguisee] `_genreSeance` ne reconnait plus une activite (elle devient « musculation »)',
     [(ST, "  if(_estAutre(s)) return 'autre';\n", "")], 'GARDE', 'C-ACT-C1', 'A,C,F'),
    # ── D · les invariants : une activite n'est JAMAIS une seance ──────────────────────────────────────────────────
    ('M09 la frequence d\'entrainement (`_weeklyCounts`) compte les activites',
     [(TR, "_seancesTrain().forEach(s=>{   // 🚶 sans les activités (`_estAutre`) : la fréquence d'entraînement ne compte que l'entraînement", "(S.sessions||[]).forEach(s=>{")], 'GARDE', 'C-ACT-D2', 'D'),
    ('M10 [deguisee] une marche aujourd\'hui fait du jour un « jour de seance » (cycle des glucides)',
     [(ST, "const faite=_seancesTrain().find(s=>s&&s.date===t);", "const faite=(S.sessions||[]).find(s=>s&&s.date===t);")], 'GARDE', 'C-ACT-D2', 'D'),
    ('M11 la CIBLE alimentaire est augmentee des calories de l\'activite du jour (+255)',
     [(ST, "return Math.round(calcBMR()*S.activityLevel+calcWorkExtra()+calcSportExtra()+calcPasExtra(refTs));", "return Math.round(calcBMR()*S.activityLevel+calcWorkExtra()+calcSportExtra()+calcPasExtra(refTs)+(S.sessions||[]).filter(s=>s&&s.autre&&s.date===today()).reduce((a,s)=>a+(+s.calories||0),0));")], 'GARDE', 'C-ACT-D2', 'D'),
    ('M40 la tuile « Seance » de Nutrition additionne les calories d\'une activite du jour',
     [(SC, "const _sessJour=_seancesTrain().filter(s=>s&&s.date===todayStr);", "const _sessJour=(S.sessions||[]).filter(s=>s&&s.date===todayStr);")], 'GARDE', 'C-ACT-D3', 'D'),
    ('M12 une marche compte pour le badge « 10 seances »',
     [(AP, "case 'regular_10':return _seancesTrain().length>=10;", "case 'regular_10':return (S.sessions||[]).length>=10;")], 'GARDE', 'C-ACT-D7', 'D'),
    ('M13 [deguisee] la projection de recuperation prend une ACTIVITE pour la derniere seance',
     [(TR, "const ls=(S.sessions&&S.sessions.length)?_seancesTrain()[0]:null;", "const ls=(S.sessions&&S.sessions.length)?S.sessions[0]:null;")], 'GARDE', 'C-ACT-D5', 'D'),
    ('M38 le registre athlete (faits mesures) compte les activites comme des seances',
     [(TR, "if(!S.registre)S.registre={facts:{},observations:[],updatedAt:''};\n    const sess=_seancesTrain().filter(s=>s&&(s.date||s.ts));", "if(!S.registre)S.registre={facts:{},observations:[],updatedAt:''};\n    const sess=(S.sessions||[]).filter(s=>s&&(s.date||s.ts));")], 'GARDE', 'C-ACT-D5', 'D'),
    ('M39 [deguisee] une marche honore une seance ANNONCEE (`plannedSession`)',
     [(ST, "const sess=_seancesTrain().filter(s=>s.date);   // 🚶 sans les activités (`_estAutre`) : une marche n'honore pas une séance annoncée", "const sess=(S.sessions||[]).filter(s=>s.date);")], 'GARDE', 'C-ACT-D10', 'D'),
    # ── E · Milo ───────────────────────────────────────────────────────────────────────────────────────────────────
    ('M19 Milo ne distingue plus une valeur de montre d\'une estimation',
     [(CO, """(kb.remplacee?'valeur saisie par la personne, relevée sur sa montre':"estimation de l'app")""", '''"estimation de l'app"''')], 'GARDE', 'C-ACT-E2', 'E'),
    ('M20 l\'historique compact de Milo liste les activites comme des seances',
     [(CO, "const sess=(typeof _seancesTrain==='function'?_seancesTrain():(S_.sessions||[])).filter(s=>s&&s.date);   // 🚶 sans les activités (`_estAutre`)\n    // Les 5", "const sess=(S_.sessions||[]).filter(s=>s&&s.date);   // 🚶 sans les activités (`_estAutre`)\n    // Les 5")], 'GARDE', 'C-ACT-E4', 'E'),
    # ── F · Accueil · Agenda · Progres ─────────────────────────────────────────────────────────────────────────────
    ('M18 [deguisee] une activite enregistree APRES la seance masque la couleur de la region dans le calendrier (F11)',
     [(SC, "const sess=jourSeance?_seancesTrain().find(s=>s.date===ymd):null;", "const sess=jourSeance?(S.sessions||[]).find(s=>s.date===ymd):null;")], 'GARDE', 'C-ACT-F13', 'F'),
    ('M32 le « Total du jour » du calendrier compte les activites DEUX fois',
     [(SC, "const total=tout.reduce((a,s)=>a+kc(s),0);", "const total=tout.reduce((a,s)=>a+kc(s),0)+acts.reduce((a,s)=>a+kc(s),0);")], 'GARDE', 'C-ACT-F1', 'F'),
    # ── G · persistance, import, admin ─────────────────────────────────────────────────────────────────────────────
    ('M26 un refus d\'ecriture (stockage plein) ne remet PAS l\'etat d\'avant (l\'activite reste en memoire)',
     [(AP, "catch(e){ try{ retour(); }catch(e2){} toast('Stockage plein", "catch(e){ toast('Stockage plein")], 'GARDE', 'C-ACT-G9', 'G'),
    ('M25 un onglet perime n\'absorbe plus ce qu\'un autre onglet a ecrit (l\'activite de l\'autre onglet est ecrasee)',
     [(AP, "try{ if(typeof _ftAutreOnglet!=='undefined'&&_ftAutreOnglet&&typeof _fusionnerAvecLeDisque==='function'){ _ftAutreOnglet=false; _fusionnerAvecLeDisque(); } }catch(e){}", "")], 'GARDE', 'C-ACT-G7', 'G'),
    ('M23 « Remplacer » a l\'import d\'historique supprime une ACTIVITE (la premiere du jour)',
     [(LO, "findIndex(s=>s.date===sess.date&&!_estAutre(s))", "findIndex(s=>s.date===sess.date)")], 'GARDE', 'C-ACT-G14', 'G'),
    ('M24 l\'outil admin « recaler les anciennes seances » reecrit une activite',
     [(SE, "    if(_estAutre(s)) return;                            // 🚶 jamais une activité", "    // (garde retiree)                            // 🚶 jamais une activité")], 'GARDE', 'C-ACT-G15', 'G'),
    ('M41 [deguisee] un enregistrement etranger sans estimation figee est RECALCULE au poids du jour quand on le rouvre',
     [(AP, "if(man===undefined&&typeof s.calories==='number'&&isFinite(s.calories)&&s.calories>=0&&brut>0){ est=s.calories; poids=Math.round(1000*est/brut)/1000; }", "if(false){ est=s.calories; poids=Math.round(1000*est/brut)/1000; }")], 'GARDE', 'C-ACT-G18', 'G'),
    # ── H · exports ────────────────────────────────────────────────────────────────────────────────────────────────
    ('M21 l\'export CSV/PDF n\'a plus de ligne pour l\'activite',
     [(SE, "if(typeof _estAutre==='function'&&_estAutre(s)){\n        const a=s.autre;", "if(false){\n        const a=s.autre;")], 'GARDE', 'C-ACT-H2', 'H'),
    ('M22 l\'en-tete de l\'export compte les activites comme des SEANCES',
     [(SE, "const LS=L.filter(r=>r.type!=='ACTIVITE'), LA=L.filter(r=>r.type==='ACTIVITE');", "const LS=L, LA=L.filter(r=>r.type==='ACTIVITE');")], 'GARDE', 'C-ACT-H3', 'H'),
    ('M42 le message de fin de l\'export PDF relit de nouveau une variable inexistante (le defaut de la version publiee)',
     [(SE, "const _C=_histoCompte(L);\n    _toastFichier(etat, _C.seances,", "_toastFichier(etat, seances,")], 'GARDE', 'C-ACT-H4', 'H'),
    # ── I · la valeur de la montre tapee, le champ pas encore quitte (iPhone) ───────────────────────────────────────
    ('M43 « Enregistrer » (formulaire d\'activite) ne lit plus la valeur de la montre tapee a l\'instant',
     [(AP, "  if(!kcalValiderChampsEnAttente('#ov-autre'))return;   // la valeur de la montre tapée à l'instant compte ; une valeur invalide n'est jamais ignorée en silence\n", "")], 'GARDE', 'C-ACT-I1', 'I'),
    ('M44 « Terminer la seance » ne lit plus la valeur de la montre tapee a l\'instant (cardio de la seance en cours)',
     [(LO, "  if(typeof kcalValiderChampsEnAttente==='function'&&!kcalValiderChampsEnAttente('#log-cardio'))return;   // la valeur de la montre tapée à l'instant (champ pas encore quitté) est lue AVANT d'enregistrer\n", "")], 'GARDE', 'C-ACT-I3', 'I'),
    ('M45 « Enregistrer » du detail d\'une seance ne lit plus la valeur de la montre tapee a l\'instant',
     [(SE, "  if(typeof kcalValiderChampsEnAttente==='function'&&!kcalValiderChampsEnAttente('#sd-content'))return;   // la valeur de la montre tapée à l'instant (champ pas encore quitté) est lue AVANT d'enregistrer\n", "")], 'GARDE', 'C-ACT-I4', 'I'),
    ('M46 [deguisee] le champ en attente est detecte par `defaultValue` (que l\'app aligne sur chaque frappe) : plus rien n\'est jamais « en attente »',
     [(AP, "if(i.value.trim()===String(i.getAttribute('data-kcal-man')||'').trim())return;", "if(i.value===i.defaultValue)return;")], 'GARDE', 'C-ACT-I1', 'I'),
    ('M47 une valeur INVALIDE tapee a l\'instant est ignoree en silence (l\'assistant ne rend plus « faux »)',
     [(AP, "if(kcalSaisieValide(i.value).etat==='invalide')ok=false;", "")], 'GARDE', 'C-ACT-I2', 'I'),
    # ── re-vises apres la 1re passe repartie (3 rouges reels causes par ce chantier : champ entier, 2e producteur de carte, garde de silence) ───────────────────────────
    ('M48 le champ « Duree » redevient un champ texte (`type="text"`) : un champ entier hors liste blanche',
     [(IX, '<input type="number" inputmode="numeric" min="1" max="1440" step="1" autocomplete="off" id="au-duree"', '<input type="text" inputmode="numeric" autocomplete="off" id="au-duree"')], 'GARDE', 'C-ACT-A31', 'A'),
    ('M49 [deguisee] l\'enveloppe commune d\'une carte perd un point-virgule dans son style (la carte d\'une SEANCE change d\'un octet)',
     [(SE, 'style="cursor:pointer;padding:12px 14px;">${interieur}</div>', 'style="cursor:pointer;padding:12px 14px">${interieur}</div>')], 'GARDE', 'C-ACT-F12', 'F'),
    ('M50 [deguisee] l\'Accueil decide son silence sur `S.sessions` (une marche seule fait apparaitre un score de recuperation)',
     [(SC, '    && !(_seancesTrain().length);', '    && !((S.sessions||[]).length);')], 'GARDE', 'C-ACT-D9', 'D'),
    ('M51 [source] la clause « aucune seance » disparait de l\'instruction `_sansDonnee` (le silence ne dit plus que « aucune nuit »)',
     [(SC, '    && !(_seancesTrain().length);', ';')], 'GARDE', 'B-CCCXIX ⑥', 'SRC:accueil_mini.js'),
    ('M52 [source] la clause « aucune seance » est remplacee par une forme etrangere (`S.sessions.length>5`)',
     [(SC, '    && !(_seancesTrain().length);', '    && !(S.sessions.length>5);')], 'GARDE', 'B-CCCXIX ⑥', 'SRC:accueil_mini.js'),
    ('M53 [source] la carte d\'une activite ecrit sa PROPRE balise de carte (un 2e producteur de carte d\'historique)',
     [(SE, "  return _sessCarteEnveloppe(s,true,\n    '<div style=\"display:flex;align-items:flex-start;gap:10px;\"><div style=\"flex:1;min-width:0;\"><div class=\"sess-title\">'",
           "  return '<div class=\"sess-card sess-card-autre\" data-genre=\"autre\" onclick=\"openSessDetail('+(s.ts||s.id||0)+')\">'+(\n    '<div style=\"display:flex;align-items:flex-start;gap:10px;\"><div style=\"flex:1;min-width:0;\"><div class=\"sess-title\">'"),
      (SE, "+note+'</div></div>');\n}", "+note+'</div></div>')+'</div>';\n}")], 'GARDE', 'PS-S3', 'SRC:progres_seances.js'),
    # ── J · les gardes que rien ne testait (balayage des 52 sites de lecture `_seancesTrain()` : 29 survivaient aux blocs D, E, F) ───────────────────────────────────────
    ('M54 [deguisee] la repartition des repetitions de Milo prend les 25 premiers ENREGISTREMENTS (des marches chassent de vraies seances de sa fenetre)',
     [(CO, 'for(const se of _seancesTrain().slice(0,25))', 'for(const se of (S.sessions||[]).slice(0,25))')], 'GARDE', 'C-ACT-J4', 'J'),
    ('M55 le tableau de bord ordinateur compte les marches dans « N seances lues depuis ce navigateur »',
     [(DB, 'const nb=_seancesTrain().length;', 'const nb=(S_.sessions||[]).length;')], 'GARDE', 'C-ACT-J7', 'J'),
    ('M56 [source] une NOUVELLE lecture brute de `S.sessions` apparait sans etre classee',
     [(SE, 'function _sessCarteEnveloppe(s,autre,interieur){', 'function _fauxLecteur(){ return (S.sessions||[]).length; }\nfunction _sessCarteEnveloppe(s,autre,interieur){')], 'GARDE', 'C-ACT-J30', 'J'),
    ('M57 [source] une fonction de la liste blanche cesse de lire `S.sessions` en brut (liste perimee)',
     [(AP, "const av=(S.sessions||[]).filter(s=>s&&s.date&&String(s.date).slice(0,7)===_moisAvant(ym));", "const av=_seancesTrain().filter(s=>s&&s.date&&String(s.date).slice(0,7)===_moisAvant(ym));")], 'GARDE', 'C-ACT-J31', 'J'),
    ('M58 la serie de jours d\'entrainement (badges « 7 / 30 / 90 jours ») compte les marches',
     [(AP, 'const _tr=_seancesTrain();', 'const _tr=(S.sessions||[]);')], 'GARDE', 'C-ACT-J2', 'J'),
    ('M59 [deguisee] les observations de Milo (matin, semaine seulement, tres regulier) se fabriquent avec des marches',
     [(TR, "const out=[];\n  try{\n    const sess=_seancesTrain().filter(s=>s&&(s.date||s.ts));", "const out=[];\n  try{\n    const sess=(S.sessions||[]).filter(s=>s&&(s.date||s.ts));")], 'GARDE', 'C-ACT-J3', 'J'),
    ('M60 le rythme de Milo (12 seances mesurees) prend les 12 premiers ENREGISTREMENTS',
     [(CO, 'const sess=_seancesTrain().slice(0,12);', 'const sess=(S.sessions||[]).slice(0,12);')], 'GARDE', 'C-ACT-J4', 'J'),
    ('M61 la correlation « poids le lendemain d\'une seance » prend une marche pour une seance',
     [(TR, 'const sessDates=new Set(_seancesTrain().map(s=>s.date));', 'const sessDates=new Set((S.sessions||[]).map(s=>s.date));')], 'GARDE', 'C-ACT-J5', 'J'),
    ('M62 [deguisee] Milo croit qu\'une SEANCE a eu lieu aujourd\'hui parce qu\'une marche l\'a ete (ligne des pas)',
     [(CO, 'const seanceAuj=_seancesTrain().some(x=>x&&x.date===today());', 'const seanceAuj=(S.sessions||[]).some(x=>x&&x.date===today());')], 'GARDE', 'C-ACT-J6', 'J'),
    # ── T44 / D12 · un cardio saisi a 0 kcal (ecart relevé le 08/11/2026, correctif autorise par Michel) ───────────────────
    ('M63 [deguisee] un cardio saisi a 0 kcal sur une seance de MUSCULATION n\'est plus RANGE (la part cardio redevient « absente » : le bilan la dit « non separable »)',
     [(LO, 'if(cardioKcal||kA.remplacee||kB.remplacee){calData.total+=cardioKcal;calData.cardio=cardioKcal;}', 'if(cardioKcal){calData.total+=cardioKcal;calData.cardio=cardioKcal;}')], 'GARDE', 'C-ACT-B16', 'B'),
    ('M64 [deguisee] meme regle en MODIFIANT une seance passee : le 0 saisi retire la part cardio rangee (`delete calData.cardio`)',
     [(SE, 'if(cardio>0||kcA.remplacee||kcB.remplacee) calData.cardio=cardio; else delete calData.cardio;', 'if(cardio>0) calData.cardio=cardio; else delete calData.cardio;')], 'GARDE', 'C-ACT-B18', 'B'),
    # ── equivalente ────────────────────────────────────────────────────────────────────────────────────────────────
    ('M37 [equivalente] l\'ordre de trois affectations independantes est inverse (meme resultat)',
     [(AP, 'a.kcalEst=_au.kcalEst; a.kcalPoids=_au.kcalPoids; a.kcalMode=_au.kcalMode;', 'a.kcalMode=_au.kcalMode; a.kcalPoids=_au.kcalPoids; a.kcalEst=_au.kcalEst;')], 'OK', None, 'A'),
]


def banc_source(arbre, module):
    """Joue la fonction `source` d'un module de tests/parcours dans l'arbre (aucun navigateur) ; meme sortie que le banc : lignes ROUGE + ligne de total.
    Les dossiers lourds que `cloner()` n'a pas copies (guide, anatomy) sont relies en LECTURE au depot : certains temoins de source y lisent une image."""
    for d in ('guide', 'anatomy'):
        if os.path.isdir(os.path.join(SRC, d)) and not os.path.exists(os.path.join(arbre, d)):
            os.symlink(os.path.join(SRC, d), os.path.join(arbre, d))
    js = ("require('./tests/_garde_reseau.js');const fs=require('fs'),path=require('path');let ok=0,ko=0;"
          "const t=(n,c,d)=>{if(c)ok++;else{ko++;console.log('ROUGE '+n+(d?'  >> '+String(d).slice(0,200):''));}};"
          "(async()=>{await require('./tests/parcours/%s').source(t,process.cwd(),fs,path);console.log('──── '+ok+' OK / '+ko+' rouge ────');process.exit(ko?1:0);})()"
          ".catch(e=>{console.error('PLANTAGE : '+(e&&e.stack||e));process.exit(2);});" % module)
    try:
        r = subprocess.run(['node', '-e', js], cwd=arbre, capture_output=True, text=True, timeout=300, env=dict(os.environ, TZ='Europe/Paris'))
    except subprocess.TimeoutExpired:
        return [], 'PLANTAGE (delai depasse)'
    out = r.stdout + r.stderr
    rouges = [l.strip()[:170] for l in out.split('\n') if 'ROUGE' in l]
    plantage = None
    if r.returncode not in (0, 1): plantage = 'PLANTAGE (code %d)' % r.returncode
    elif 'PLANTAGE' in out: plantage = 'PLANTAGE (' + next(l.strip()[:120] for l in out.split('\n') if 'PLANTAGE' in l) + ')'
    elif not any(l.startswith('────') and 'OK /' in l for l in out.split('\n')): plantage = 'PLANTAGE (aucune ligne de total)'
    return rouges, plantage


def banc(arbre, blocs=None):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    if blocs and blocs.startswith('SRC:'): return banc_source(arbre, blocs[4:])
    env = dict(os.environ, TZ='Europe/Paris')
    env.pop('ACT_BLOCS', None)
    if blocs: env['ACT_BLOCS'] = blocs
    try:
        r = subprocess.run(['node', 'tools/banc_autre_activite.js'], cwd=arbre, capture_output=True, text=True, timeout=2400, env=env)
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


def temoin_present(rouges, temoin):
    pat = re.compile(re.escape(temoin) + r'(?![0-9A-Za-z])')
    return any(pat.search(l) for l in rouges)


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_act_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', 'clone', '*.pdf', '__pycache__', 'guide', 'anatomy'))
    return tmp, a


def appliquer(srcs, f, av, ap):
    if av.startswith('re:'):
        m = list(re.finditer(av[3:], srcs[f]))
        if len(m) != 1: return '%s:%s (x%d)' % (f, av[:50], len(m))
        srcs[f] = srcs[f][:m[0].start()] + ap + srcs[f][m[0].end():]
        return None
    if srcs[f].count(av) != 1:
        return '%s:%s (x%d)' % (f, av[:60], srcs[f].count(av))
    srcs[f] = srcs[f].replace(av, ap, 1)
    return None


def une(m):
    nom, remplacements, attendu, temoin, blocs = m
    tmp, arbre = cloner()
    try:
        srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
        invalide = [e for e in (appliquer(srcs, f, av, ap) for f, av, ap in remplacements) if e]
        if invalide:
            return nom, None, 'INVALIDE (ancre absente ou multiple : %s)' % invalide, []
        for f in FICHIERS:
            open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        # une mutation qui casse la SYNTAXE ne prouve rien (elle rougit tout) : on la refuse
        for f in FICHIERS:
            if f.endswith('.js'):
                chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync(process.argv[1],'utf8'))", os.path.join(arbre, f)], capture_output=True, text=True)
                if chk.returncode:
                    return nom, None, 'INVALIDE (syntaxe cassee dans %s)' % f, []
        rouges, plantage = banc(arbre, blocs)
        if plantage:
            return nom, False, 'PLANTAGE', [plantage] + rouges
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu
        if ok and temoin and not temoin_present(rouges, temoin):
            ok, obtenu = False, 'GARDE sans ' + temoin
        return nom, ok, obtenu, rouges
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    if os.environ.get('MUT_SAIN', '1') != '0':
        tmp0, a0 = cloner()
        rouges, plantage = banc(a0)
        for mod in sorted({m[4] for m in MUT if str(m[4]).startswith('SRC:')}):      # les temoins de source voisins : eux aussi doivent etre verts sur l'arbre sain
            r2, p2 = banc(a0, mod); rouges, plantage = rouges + r2, plantage or p2
        shutil.rmtree(tmp0, ignore_errors=True)
        if rouges or plantage:
            print('  !! ARBRE SAIN DEJA ROUGE OU EN PLANTAGE — controle refuse :', ([plantage] if plantage else []) + rouges[:3]); return 1
        print('  arbre sain : 0 rouge (point de depart valide) · MUT_J=%s\n' % os.environ.get('MUT_J', '2'))
    choix = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '2'))) as ex:
        res = list(ex.map(une, choix))
    conformes = 0
    for nom, ok, obtenu, rouges in res:
        if ok is None:
            print('  INVALIDE  %s %s' % (nom, obtenu)); continue
        conformes += ok
        print('  %s  %-112s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0][:90] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges[1:]:
                print('        ' + r)
    if os.environ.get('MUT_SAIN', '1') != '0':
        # rejeu de l'arbre sain APRES la campagne : un banc instable aurait pu « attraper » par hasard
        tmp1, a1 = cloner()
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
