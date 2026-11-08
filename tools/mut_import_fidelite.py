#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — IMPORT-IA-FIDELITE-01 (session-C, 02/11/2026) : les temoins B-IIF savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET UN DEFAUT que le lot a supprime (ou retire une protection qu'il a ajoutee) ; le banc `tools/banc_import_fidelite.js`
doit alors rougir AU MOINS UNE fois. Une mutation qui laisse le banc vert = un temoin qui ne protege rien (R17, « un test qui ne peut pas
rougir rassure sans rien mesurer »). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
Usage : python3 tools/mut_import_fidelite.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=M07 : une mutation)
A lancer sous le garde reseau : tools/sous_garde.sh python3 tools/mut_import_fidelite.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ('constants.js', 'log.js', 'index.html', 'style.css', 'coach.js')
LO, CO, IX, CJ = 'log.js', 'constants.js', 'index.html', 'coach.js'

MUT = [
    # ── la LECTURE d'un repos écrit (constants.js) ──
    ('M01 le pluriel « mins » n\'est plus lu (« 3 mins » → 0, le défaut mesuré)',
     [(CO, "  if((m=s.match(/^(\\d+)\\s*(?:minutes?|mins?|mns?|m)\\.?$/))) return {sec:(+m[1])*60,u:'m'};",
           "  if((m=s.match(/^(\\d+)\\s*(?:minutes?|min|mn|m)\\.?$/))) return {sec:(+m[1])*60,u:'m'};")], 'GARDE'),
    ('M02 « 1.30 » se lit « 1,3 minute » (78 s) au lieu de 1 min 30',
     [(CO, "    if(m[2].length===2&&+m[2]<60) return {sec:(+m[1])*60+(+m[2]),u:'m'};      // 1.30 = 1 min 30\n", "")], 'GARDE'),
    ('M03 une PLAGE devient un repos chiffré (la borne basse est INVENTÉE comme durée)',
     [(CO, "if(d&&g&&g.sec>0&&d.sec>g.sec&&d.sec<=3600&&d.sec<=g.sec*5) return {sec:0,min:g.sec,max:d.sec,txt};", "if(d&&g&&g.sec>0&&d.sec>g.sec&&d.sec<=3600&&d.sec<=g.sec*5) return {sec:g.sec,min:g.sec,max:d.sec,txt};")], 'GARDE'),
    ('M04 le TEXTE d\'une plage ou d\'une consigne floue est perdu (txt vidé)',
     [(CO, "  return {sec:0,min:0,max:0,txt};\n}\nfunction _secRepos", "  return {sec:0,min:0,max:0,txt:''};\n}\nfunction _secRepos")], 'GARDE'),
    ('M05 un entier seul (« 2 ») se lit en SECONDES au lieu de minutes',
     [(CO, "    if(n>=1&&n<=9) return {sec:n*60,u:''};               // 2 · 3 → des minutes", "    if(n>=1&&n<=9) return {sec:n,u:''};")], 'GARDE'),
    # ── le TRANSPORT du repos : document → programme → séance ──
    ('M06 le texte de la plage n\'est plus conservé dans le programme (restTxt perdu)',
     [(LO, "if(r.txt)o.restTxt=r.txt; return o; };", "return o; };")], 'GARDE'),
    ('M07 une valeur par série VIDE recouvre le repos de l\'exercice (rest « 2 min » ignoré)',
     [(LO, "  const plein=v=>v!=null&&String(v).trim()!=='';\n  if(ex&&ex.restPerSet&&plein(ex.restPerSet[s]))", "  const plein=v=>v!=null;\n  if(ex&&ex.restPerSet&&plein(ex.restPerSet[s]))")], 'GARDE'),
    ('M08 le repos de la ligne de travail DÉBORDE sur les échauffements fusionnés (o.rest non vidé)',
     [(LO, "  o.rest='';\n  if(SP.length)o.specialSets=SP;else delete o.specialSets;", "  if(SP.length)o.specialSets=SP;else delete o.specialSets;")], 'GARDE'),
    ('M09 la séance n\'a plus le restTxt (la consigne écrite ne suit pas la série jusqu\'au chrono)',
     [(LO, "        ...(s.restTxt?{restTxt:String(s.restTxt)}:{})   // IMPORT-IA-FIDELITE-01 : la consigne de repos écrite (une plage) suit la série\n", "")], 'GARDE'),
    # ── l'IDENTITÉ et le REGROUPEMENT échauffement / travail ──
    ('M10 AUCUNE PROPOSITION : une ressemblance de nom suffit à FUSIONNER d\'office (a-verifier → meme)',
     [(LO, "  return 'a-verifier';\n}\nlet _propSeq=0;", "  return 'meme';\n}\nlet _propSeq=0;")], 'GARDE'),
    ('M11 le matériel contradictoire (barre / haltères) n\'empêche plus la proposition',
     [(LO, "  if(ma.length&&mb.length&&!ma.some(x=>mb.includes(x))) return 'autre';   // barre ≠ haltères : deux mouvements, point\n", "")], 'GARDE'),
    ('M12 « Squat » puis « Squat Bulgare » : un MOT de plus (et non un séparateur) suffit de nouveau à prolonger un nom — le garde historique est retiré',
     [(LO, r"  return /^[\s]*[/\-(:,]/.test(n.slice(base.length));   // un séparateur, pas un mot de plus", "  return true;")], 'GARDE'),
    ('M13 la preuve d\'échauffement par la note revient à l\'ancien motif (« Monté en charge », « Série de chauffe » ne comptent plus)',
     [(LO, "  return /^(ech\\b|echauff|warm[\\s-]?up|montee\\b|mont[e]{1,2}s? en charge|series? (longues? )?(de |d.)?e?chauff|chauffe\\b)/.test(",
           "  return /^(ech\\b|echauff|warm[\\s-]?up|montee\\b|series? d.?echauff)/.test(")], 'GARDE'),
    ('M14 deux jours « Semaine A » / « Semaine B » de même numéro sont de nouveau collés en une séance',
     [(LO, " && !(_va&&_vb&&_va!==_vb) && _ma===_mb){", "){")], 'GARDE'),
    ('M15 la proposition n\'est plus MARQUÉE (aucune carte ne la porte)',
     [(LO, "          ech._propGrp=pid; ech._propRole='ech'; nxt._propGrp=pid; nxt._propRole='travail'; props++;", "          props++;")], 'GARDE'),
    ('M16 « Regrouper » ne regroupe rien (les deux exercices sont remis tels quels)',
     [(LO, "  day.exercises.splice(ei-1,2,m);", "  day.exercises.splice(ei-1,2,prev,ex);")], 'GARDE'),
    ('M17 le type « É » d\'une série structurée n\'est plus traduit (les échauffements deviennent des séries normales)',
     [(LO, "  return v==='W' ? 'É' : (ex.setType||'N');          // 'W' est le mot du backend", "  return (ex.setType||'N');          // 'W' est le mot du backend")], 'GARDE'),
    # ── le CHRONO ──
    ('M18 le dropset importé n\'enchaîne plus : un repos entier ENTRE deux paliers',
     [(LO, "const _dsImporte=(_exD.dropChaine===true&&!_exD.dropset&&set.type==='D'", "const _dsImporte=(false&&_exD.dropChaine===true&&!_exD.dropset&&set.type==='D'")], 'GARDE'),
    ('M19 le repos de l\'exercice vaut pour CHAQUE palier d\'un dropset (pas seulement le dernier)',
     [(LO, "  if((ex.setType||'N')==='D'&&!proprio&&si<n-1)return null;\n", "")], 'GARDE'),
    ('M20 la consigne de plage n\'est plus montrée au démarrage du repos',
     [(LO, "  _restConsigneMontrer();        // IMPORT-IA-FIDELITE-01 : la consigne écrite (une plage) de la série dont le repos démarre\n", "")], 'GARDE'),
    ('M21 ⚠️ DÉCISION DE MICHEL (08/11/2026) INVERSÉE : la consigne écrite ne s\'affiche de nouveau QUE si aucun repos chiffré n\'existe (elle disparaît quand le chrono est réglé sur la borne basse)',
     [(LO, "    if(set&&set.restTxt){ const r=_reposLire(set.restTxt);", "    if(set&&!(set.rest>0)&&set.restTxt){ const r=_reposLire(set.restTxt);")], 'GARDE'),
    ('M22 « Régler » ne propose plus les bornes de la consigne',
     [(LO, "    if(_restConsigne&&_restConsigne.min&&_restConsigne.max&&restStartTs){", "    if(false&&_restConsigne&&_restConsigne.min&&_restConsigne.max&&restStartTs){")], 'GARDE'),
    # ── l'APERÇU, le CALENDRIER, les HOMONYMES ──
    ('M23 l\'aperçu retombe sur la silhouette de muscle deviné quand il n\'y a pas d\'illustration',
     [(LO, "function _impIllu(name){\n  let src=''; try{ src=_exImg(name)||''; }catch(e){}", "function _impIllu(name){\n  let src=''; try{ src=_exImg(name)||_exMuscleImg(name)||''; }catch(e){}")], 'GARDE'),
    ('M24 un exercice inconnu est annoncé « Reconnu » (aucun avertissement « sera créé »)',
     [(LO, "  if(_exerciceInconnu(ex.name,connus))return {k:'new',lib:'Sera créé · exercice perso'};\n", "")], 'GARDE'),
    ('M25 le type d\'une série ne se corrige plus dans l\'aperçu (impBasculerType inerte)',
     [(LO, "  ex.setTypePerSet[si]=ex.setTypePerSet[si]==='W'?'':'W';", "  ex.setTypePerSet[si]=ex.setTypePerSet[si];")], 'GARDE'),
    ('M26 la carte annonce de nouveau « Semaine 1 / N » sans date de début',
     [(LO, "      const _sansDate=hasCycle&&!p.startDate;", "      const _sansDate=false;")], 'GARDE'),
    ('M27 « décaler d\'une semaine » pose de nouveau la date du jour sur un programme sans date',
     [(LO, "  if(!prog.startDate)return;   // IMPORT-IA-FIDELITE-01 : sans date,", "  if(!prog.startDate)prog.startDate=today();   // IMPORT-IA-FIDELITE-01 : sans date,")], 'GARDE'),
    ('M28 « Remplacer » repart au tap, sans confirmation de la cible',
     [(LO, "    if(cible&&!(_remplaceCible&&_remplaceCible.idx===idx&&_remplaceCible.id===cible.id)){", "    if(false&&cible&&!(_remplaceCible&&_remplaceCible.idx===idx&&_remplaceCible.id===cible.id)){")], 'GARDE'),
    ('M29 la liste de remplacement ne montre de nouveau que le nom (aucun numéro, aucune durée)',
     [(LO, "  return (p.name||'Programme')+' · '+duree+' · '+debut+' · '+nj+' séance'+(nj>1?'s':'')+' · n°'+n;", "  return (p.name||'Programme');")], 'GARDE'),
    ('M30 l\'éditeur ne propose plus le bouton explicite « Aujourd\'hui »',
     [(LO, 'id="prog-edit-today" class="btn-xs"', 'id="prog-edit-today-x" class="btn-xs"')], 'GARDE'),
    ('M31 ouvrir puis enregistrer l\'éditeur POSE une date d\'office quand le champ est vide',
     [(LO, "  if(startInp)_editProgData.startDate=startInp.value||'';", "  if(startInp)_editProgData.startDate=startInp.value||today();")], 'GARDE'),
    # ── les séries « en couleur », l'AMBIGUÏTÉ, le CONFORT téléphone ──
    ('M32 les séries « en couleur » du document sont de nouveau jetées en silence (la conservation n\'est plus appelée)',
     [(LO, "    _impConserverSpeciales();    // les séries « en couleur » du document ne sont plus jetées en silence\n", "")], 'GARDE'),
    ('M33 un exercice AMBIGU n\'est plus annoncé « À confirmer » (il passe pour reconnu ou nouveau)',
     [(LO, "  if(ex._vmSuggest)return {k:'conf',lib:'À confirmer'};\n", "")], 'GARDE'),
    ('M34 le bouton « Voir / corriger » redevient trop petit pour un pouce (24 px)',
     [('style.css', ".imp-det{width:100%;margin-top:7px;min-height:40px;", ".imp-det{width:100%;margin-top:7px;min-height:24px;")], 'GARDE'),
    ('M35 la croix ✕ d\'une carte redevient trop petite pour un pouce (24 px)',
     [('style.css', ".imp-x{background:none;border:none;color:var(--t3);font-size:17px;cursor:pointer;width:44px;height:44px;", ".imp-x{background:none;border:none;color:var(--t3);font-size:17px;cursor:pointer;width:24px;height:24px;")], 'GARDE'),
    ('M36 les pastilles de type (É / N) redeviennent trop petites (20 px)',
     [('style.css', ".imp-ty{width:34px;height:34px;", ".imp-ty{width:20px;height:20px;")], 'GARDE'),
    ('M37 les puces de repos de l\'aperçu redeviennent trop petites (20 px)',
     [('style.css', ".imp-rp{min-height:36px;padding:0 10px;", ".imp-rp{min-height:20px;padding:0 10px;")], 'GARDE'),
    # ── ce que les programmes de coachs ont révélé : la lecture des repos de coach, le matériel dans la note, les reps absentes, les pertes dites ──
    ('M38 un PLAFOND écrit (« 2 min max », « repos 30 sec maxi ») redevient du texte : aucun repos appliqué, la séance prend le réglage global',
     [(CO, r".replace(/\s*\b(?:au\s+)?max(?:i|imum)?\b\.?$/,'')", "")], 'GARDE'),
    ('M39 le blanc d\'extraction d\'un PDF (« 1 . 20 min ») n\'est plus recollé : illisible, donc aucun repos',
     [(CO, r".replace(/(\d)\s*\.\s*(\d)/g,'$1.$2')", "")], 'GARDE'),
    ('M40 « environ 90 s » / « ~2 min » ne sont plus lus (le mot d\'approximation bloque la lecture)',
     [(CO, r".replace(/^(?:environ|env\.?|~|\u2248)\s*/,'')", "")], 'GARDE'),
    ('M41 « 1.10/20 min » redevient une plage 70 s → 20 MINUTES (le garde des écarts absurdes est retiré)',
     [(CO, "&&d.sec<=3600&&d.sec<=g.sec*5) return {sec:0,min:g.sec,max:d.sec,txt};", "&&d.sec<=3600) return {sec:0,min:g.sec,max:d.sec,txt};")], 'GARDE'),
    ('M42 « Front Squat » + note « Smith machine » est de nouveau rattaché d\'office à l\'exercice à la barre',
     [(LO, "  if(r.tier==='auto'&&_materielNoteContredit(ex,r.match)){ ex._vmSuggest=r.match; ex._vmConf=r.confidence; return; }\n", "")], 'GARDE'),
    ('M43 des reps que le document n\'écrit PAS redeviennent un 10 inventé dans le programme (au lieu de « Non renseigné », null)',
     [(LO, "    reps.push(lu>0?lu:null);\n", "    reps.push(lu>0?lu:10);\n")], 'GARDE'),
    ('M44 ce que le serveur a dû écarter (séance sans exercice, ligne illisible, date refusée) n\'est plus dit dans l\'aperçu',
     [(LO, "  const n=d&&d.normalisation; if(!n||typeof n!=='object')return '';", "  const n=null; if(!n||typeof n!=='object')return '';")], 'GARDE'),
    ('M45 la simple CONSERVATION d\'une plage (compteur plagesReps) est annoncée comme une perte',
     [(LO, "  const j=+n.joursEcartes||0, e=+n.exercicesIllisibles||0,", "  const j=(+n.joursEcartes||0)+(+n.plagesReps||0), e=+n.exercicesIllisibles||0,")], 'GARDE'),
    ('M46 un import ÉCRIT dans les données de la personne (une séance fantôme dans l\'historique) : le témoin de protection des données doit rougir',
     [(LO, "  S.programmes.push(prog);\n  persist();\n  impRecommencer(true);                                  // ft-v1178 : scan consommé → on le vide", "  S.programmes.push(prog);\n  (S.sessions||[]).push({date:'2000-01-01',exs:[],vol:0});\n  persist();\n  impRecommencer(true);                                  // ft-v1178 : scan consommé → on le vide")], 'GARDE'),
    # ── CORRECTION C (02/11/2026) : les dropsets DÉJÀ ENREGISTRÉS gardent leur chrono ; seul le nouvel import écrit son marquage ──
    ('M47 la DÉDUCTION revient : le seul type « D » d\'un ANCIEN programme enchaîne ses paliers (le chrono d\'une donnée ancienne change en silence)',
     [(LO, "const _dsImporte=(_exD.dropChaine===true&&!_exD.dropset&&set.type==='D'", "const _dsImporte=(!_exD.dropset&&set.type==='D'")], 'GARDE'),
    ('M48 le nouvel import n\'ÉCRIT plus le marquage d\'enchaînement (dropChaine) sur un dropset',
     [(LO, "        if(_impDropEnchaine(ex))obj.dropChaine=true;      // correction C : l'enchaînement des paliers est un fait ÉCRIT à l'import, pas une déduction (voir `toggleSet`)\n", "")], 'GARDE'),
    ('M49 le marquage ne suit plus l\'exercice à travers la séance, la sauvegarde en programme et le rechargement (une seule recopie manquante)',
     [(LO, "  if(src.dropChaine===true)dst.dropChaine=true;\n", "")], 'GARDE'),
    ('M50 le marquage est posé sur N\'IMPORTE QUEL exercice importé (plus seulement le dropset) : une clé persistée en plus partout',
     [(LO, "  return !!ex&&(ex.setType||'N')==='D'&&_seriesImport(ex).n>1;", "  return !!ex;")], 'GARDE'),
    ('M51 un dropset réduit à UN SEUL palier reçoit quand même le marquage (rien à enchaîner)',
     [(LO, "  return !!ex&&(ex.setType||'N')==='D'&&_seriesImport(ex).n>1;", "  return !!ex&&(ex.setType||'N')==='D';")], 'GARDE'),
    ('M52 un repos ÉCRIT pour un palier ne gagne plus sur l\'enchaînement (le document est écrasé par le marquage)',
     [(LO, "&&set.type==='D'&&!(set.rest>0)&&_suivD&&_suivD.type==='D'&&!_suivD.done)?{direction:'down'}:null;", "&&set.type==='D'&&_suivD&&_suivD.type==='D'&&!_suivD.done)?{direction:'down'}:null;")], 'GARDE'),
    # ── CORRECTION D (02/11/2026) : des reps que le document n'écrit pas = « Non renseigné » (null), jamais un 10 inventé ──
    ('M53 l\'aperçu n\'affiche plus « Non renseigné » (une rep absente s\'écrit « null » dans la carte)',
     [(LO, "function _repsHtml(r){ return (r==null)?`<span class=\"imp-nr\">${REPS_NON_RENSEIGNE}</span>`:_escNote(String(r)); }", "function _repsHtml(r){ return _escNote(String(r)); }")], 'GARDE'),
    ('M54 une série sans reps retombe sur les reps UNIFORMES de son exercice (l\'aperçu matérialisé invente un 8)',
     [(LO, "    const brut=(Array.isArray(ex.repsPerSet)&&s<ex.repsPerSet.length)?ex.repsPerSet[s]:ex.reps;", "    const brut=(ex.repsPerSet&&ex.repsPerSet[s]!=null)?ex.repsPerSet[s]:ex.reps;")], 'GARDE'),
    ('M55 la séance (programme à jours) remplace de nouveau « Non renseigné » par un 10 d\'office',
     [(LO, "reps:s.maxi?0:(pp?pp.reps:(s.reps===null?null:(s.reps||10))),", "reps:s.maxi?0:(pp?pp.reps:(s.reps||10)),")], 'GARDE'),
    ('M56 la séance (programme à UN jour) remplace de nouveau « Non renseigné » par un 5 d\'office',
     [(LO, "reps:s.maxi?0:(pp?pp.reps:(s.reps===null?null:(s.reps||5))),", "reps:s.maxi?0:(pp?pp.reps:(s.reps||5)),")], 'GARDE'),
    ('M57 la validation n\'exige plus de nombre : une série « Non renseigné » se valide à vide (0 répétition enregistrée)',
     [(LO, "  if(set.reps===null&&!set.done){\n    const inp=row&&row.querySelector('.sinp'), lu=parseInt(inp?(inp.value||inp.placeholder):'');\n    if(!(lu>0)){ toast('Saisis les répétitions pour valider cette série','info'); if(inp){ inp.focus(); inp.select&&inp.select(); } return; }\n    set.reps=lu;\n  }\n", "")], 'GARDE'),
    ('M58 sans nombre, la validation prend un 10 d\'office au lieu de s\'arrêter',
     [(LO, "    if(!(lu>0)){ toast('Saisis les répétitions pour valider cette série','info'); if(inp){ inp.focus(); inp.select&&inp.select(); } return; }\n    set.reps=lu;", "    set.reps=lu>0?lu:10;")], 'GARDE'),
    ('M59 effacer ou mal saisir un champ « Non renseigné » l\'invente à 0 (upSet)',
     [(LO, "  s[f]=(f==='reps'&&s.reps===null&&!(n>0))?null:n;", "  s[f]=n;")], 'GARDE'),
    ('M60 la fin de séance laisse des `null` dans l\'HISTORIQUE (séries non faites)',
     [(LO, "  S.wkt.exs.forEach(ex=>(ex.sets||[]).forEach(s=>{ if(s&&s.reps===null)s.reps=0; }));\n", "")], 'GARDE'),
    ('M61 « Sauvegarder comme programme » enregistre de nouveau un 5 à la place de « Non renseigné »',
     [(LO, "reps:(s.reps===null?null:(s.reps||5)),maxi:!!s.maxi", "reps:s.reps||5,maxi:!!s.maxi")], 'GARDE'),
    ('M62 « + série » copie un 8 d\'office depuis une série « Non renseigné »',
     [(LO, "(last ? (last.reps===null?null:(last.reps||8)) : 8)", "(last ? (last.reps||8) : 8)")], 'GARDE'),
    ('M63 l\'éditeur transforme un champ vidé en 0 (que la séance remplace par 10) au lieu de « Non renseigné »',
     [(LO, "  ex.sets[si].reps=n>0?n:(ex.sets[si].maxi?0:null);", "  ex.sets[si].reps=n>0?n:0;")], 'GARDE'),
    ('M64 l\'éditeur, à « + série », copie un 10 d\'office depuis une série « Non renseigné »',
     [(LO, "reps:l?(l.reps===null?null:(l.reps||10)):10,", "reps:l?l.reps||10:10,")], 'GARDE'),
    ('M65 retirer « maxi » sans nombre laisse un 0 (que la séance remplace par 10) au lieu de « Non renseigné »',
     [(LO, "  else if(!(s.reps>0))s.reps=null;", "  else if(false)s.reps=null;")], 'GARDE'),
    ('M66 le papier / le PDF écrivent « null » pour une rep « Non renseigné »',
     [(LO, "  const reps=(sets||[]).map(x=>(x&&x.reps!=null)?x.reps:'?');", "  const reps=(sets||[]).map(x=>x.reps);")], 'GARDE'),
    ('M67 l\'analyse envoyée à Milo (programme à jours) écrit « 3×null »',
     [(LO, "      const exs=(day.exs||[]).map(ex=>{\n        const sets=ex.sets?ex.sets.length:3;\n        const reps=ex.sets&&ex.sets[0]?(ex.sets[0].reps!=null?ex.sets[0].reps:'?'):10;", "      const exs=(day.exs||[]).map(ex=>{\n        const sets=ex.sets?ex.sets.length:3;\n        const reps=ex.sets&&ex.sets[0]?ex.sets[0].reps:10;")], 'GARDE'),
    ('M68 l\'analyse envoyée à Milo (programme à plat) écrit « 2×null »',
     [(LO, "  return (prog.exs||[]).map(ex=>{\n    const sets=ex.sets?ex.sets.length:3;\n    const reps=ex.sets&&ex.sets[0]?(ex.sets[0].reps!=null?ex.sets[0].reps:'?'):10;", "  return (prog.exs||[]).map(ex=>{\n    const sets=ex.sets?ex.sets.length:3;\n    const reps=ex.sets&&ex.sets[0]?ex.sets[0].reps:10;")], 'GARDE'),
    ('M69 le contexte de Milo montre « 3×0 » pour des reps non renseignées',
     [(CJ, "(t[0].reps===null?'?':(+t[0].reps||0))", "(+t[0].reps||0)")], 'GARDE'),
    ('M70 le champ de la séance n\'est plus marqué « à compléter » (classe sinp-nr)',
     [(LO, "<input class=\"sinp${set.reps===null?' sinp-nr':''}\"", "<input class=\"sinp\"")], 'GARDE'),
    ('M71 le bandeau « Non renseigné dans le programme » n\'apparaît plus à la séance',
     [(LO, "    +_repsNrBandeau(ex)             // 🔢 correction D : « Non renseigné » — le programme n'écrit pas les reps, la personne les saisit\n", "")], 'GARDE'),
    ('M72 l\'aperçu n\'explique plus que les répétitions seront saisies à la séance',
     [(LO, "            ${v.some(x=>x.reps==null)?`<div class=\"imp-info\">🔢 Répétitions non écrites dans le document : rien n'est inventé, tu les saisiras pendant la séance.</div>`:''}\n", "")], 'GARDE'),
    ('M73 le libellé « Non renseigné » est changé (une seule source : constants.js)',
     [(CO, "const REPS_NON_RENSEIGNE='Non renseigné';", "const REPS_NON_RENSEIGNE='—';")], 'GARDE'),
    ('M74 l\'éditeur de programme ne dit plus « Non renseigné » au-dessus des séries',
     [(LO, "    ${sets.some(s=>s&&s.reps===null)?`<div style=\"font-size:11px;line-height:1.35;color:var(--gold);padding:0 2px 5px;\">${REPS_NON_RENSEIGNE} : le document n'écrit pas les répétitions — complète-les ici, ou à la séance.</div>`:''}\n", "")], 'GARDE'),
    ('M75 le champ de l\'éditeur n\'est plus marqué (classe reps-nr, « ? »)',
     [(LO, "${s.reps===null?` class=\"reps-nr\" placeholder=\"?\" title=\"${REPS_NON_RENSEIGNE} — le document n'écrit pas les répétitions\"`:''}", "")], 'GARDE'),
    ('M76 DONNÉES D\'AVANT : une série d\'un ancien programme SANS champ reps devient « Non renseigné » (nouveau comportement imposé à une donnée ancienne)',
     [(LO, "reps:s.maxi?0:(pp?pp.reps:(s.reps===null?null:(s.reps||10))),", "reps:s.maxi?0:(pp?pp.reps:(s.reps==null?null:(s.reps||10))),")], 'GARDE'),
    ('M77 DONNÉES D\'AVANT : un ancien `reps: 0` devient « Non renseigné » au lieu de charger 10 (nouveau comportement imposé par déduction)',
     [(LO, "reps:s.maxi?0:(pp?pp.reps:(s.reps===null?null:(s.reps||10))),", "reps:s.maxi?0:(pp?pp.reps:(!s.reps?null:s.reps)),")], 'GARDE'),
    ('M78 DONNÉES D\'AVANT : la garde « Non renseigné » bloque aussi les séries « maxi » et les anciens 0 (elles ne se valideraient plus)',
     [(LO, "  if(set.reps===null&&!set.done){", "  if(!set.reps&&!set.done){")], 'GARDE'),
    ('M80 ENTRÉE dans le champ de charge d\'une série refusée (« Non renseigné » sans nombre) fait quand même sauter le curseur à la suivante',
     [(LO, "  if(!_etaitFaite&&!_s0.done)return;   // refusée (série « Non renseigné » sans nombre, correction D) : le curseur reste sur elle, il ne saute pas à la suivante\n", "")], 'GARDE'),
    ('M79 la note « Répétitions non écrites : 10 proposées, à corriger » REVIENT (le signalement retiré est remis)',
     [(LO, "    _impConserverSpeciales();    // les séries « en couleur » du document ne sont plus jetées en silence\n", "    _impConserverSpeciales();    // les séries « en couleur » du document ne sont plus jetées en silence\n    ((_impExtracted&&_impExtracted.days)||[]).forEach(d=>(d.exercises||[]).forEach(e=>{ if(_seriesImport(e).reps.some(r=>r==null))e.note=(e.note?e.note+' | ':'')+'Répétitions non écrites dans le document : 10 proposées, à corriger'; }));\n")], 'GARDE'),
    # ── IMPORT PDF (08/11/2026, « GO CORRECTIF IMPORT PDF ») : « X - échauffement » + « X », plage = borne basse, séance facultative, commentaires ──
    ('M81 la forme « X - échauffement » (marqueur À LA FIN du nom) n\'est plus une preuve d\'échauffement : deux cartes, comme sur l\'iPhone de Michel',
     [(LO, "||_echNomTete(ex.name)!==null||_echNomQueue(ex.name)!==null||_noteEch(ex.note);", "||_echNomTete(ex.name)!==null||_noteEch(ex.note);")], 'GARDE'),
    ('M82 le nom de base ne perd plus son suffixe « - échauffement » : la clé d\'identité diffère, rien n\'est regroupé',
     [(LO, "function _nomBlocImport(ex){ return _nomSansEch(ex.name)||_echNomTete(ex.name)||_echNomQueue(ex.name)||String(ex.name||'').trim(); }", "function _nomBlocImport(ex){ return _nomSansEch(ex.name)||_echNomTete(ex.name)||String(ex.name||'').trim(); }")], 'GARDE'),
    ('M83 N\'IMPORTE QUELLE fin de nom devient un marqueur : « Squat - Bulgare » est pris pour un échauffement du squat classique',
     [(LO, "if(base&&_MARQUEUR_ECH_FIN.test(_naz(s.slice(seps[k].fin)).replace(/\\s+/g,' ').trim()))return base;", "if(base)return base;")], 'GARDE'),
    ('M84 une séance facultative / « bis » est de nouveau collée à sa voisine de même numéro (elle disparaît dans la précédente)',
     [(LO, " && _ma===_mb){", "){")], 'GARDE'),
    ('M85 une plage n\'a plus de durée proposée (`prop` vaut 0) : le chrono retombe sur le réglage de la personne devant un « 4-5 min » écrit',
     [(CO, "  r.prop=r.sec>0?r.sec:(r.min>0?r.min:0);", "  r.prop=r.sec>0?r.sec:0;")], 'GARDE'),
    ('M86 une plage est lue à sa borne HAUTE (5 min) et non à sa borne basse (4 min)',
     [(CO, "  r.prop=r.sec>0?r.sec:(r.min>0?r.min:0);", "  r.prop=r.sec>0?r.sec:(r.max>0?r.max:0);")], 'GARDE'),
    ('M87 le programme enregistré n\'écrit plus la durée proposée (rest = sec) : la borne basse ne part pas dans les séries',
     [(LO, "type:_typeAt(si) /* échec auto à l'import désactivé (ft-v292) — ex.specialSets plus converti en 'E' */,rest:r.prop};", "type:_typeAt(si) /* échec auto à l'import désactivé (ft-v292) — ex.specialSets plus converti en 'E' */,rest:r.sec};")], 'GARDE'),
    ('M88 le chrono ne dit plus « chrono réglé sur 4:00 » sous la consigne d\'origine',
     [(LO, "(_restConsigne.reglee?' · chrono réglé sur '+_fmtMmSs(_restConsigne.reglee):'')+", "'' +")], 'GARDE'),
    ('M89 l\'éditeur de programme ne montre plus la consigne d\'origine sous les séries (le texte écrit n\'est visible nulle part)',
     [(LO, "    </div>${_hintReposEcrit(sets,si)}`).join('')}", "    </div>`).join('')}")], 'GARDE'),
    ('M90 un commentaire importé de plus de 300 caractères est de nouveau COUPÉ par la première frappe dans l\'éditeur',
     [(LO, "  const cap=String(ex.note||'').length>300?2000:300;", "  const cap=300;")], 'GARDE'),
    ('M91 l\'aperçu ne montre plus la borne basse proposée (il affiche seulement le texte écrit, sans chiffre)',
     [(LO, "  if(r.prop)return _fmtReposDit(r.prop);  // une PLAGE", "  if(false)return _fmtReposDit(r.prop);  // une PLAGE")], 'GARDE'),
    ('M92 l\'aperçu ne rappelle plus la consigne d\'origine à côté du chiffre proposé',
     [(LO, "function _impReposEcrit(r){ return (r&&r.txt&&r.prop)?r.txt:''; }", "function _impReposEcrit(r){ return ''; }")], 'GARDE'),
    ('M93 la fusion de deux sections d\'une même séance facultative perd le mot « facultative » de son libellé',
     [(LO, "+(_ma==='facultative'?' (facultative)':(_ma==='bis'?' bis':''));", "+'';")], 'GARDE'),
    ('M94 « Montée en charge » n\'est plus un marqueur à la fin du nom',
     [(LO, "|mont[e]{1,2}s? en charge|montee|series? (?:longues? )?(?:de |d')?e?chauff\\w*|chauffe)(?:\\s+(?:leger", "|series? (?:longues? )?(?:de |d')?e?chauff\\w*|chauffe)(?:\\s+(?:leger")], 'GARDE'),
    ('M95 le nombre de plages écrites n\'est plus annoncé dans le décompte de l\'aperçu (⚑ N repos écrits en plage)',
     [(LO, "if(x.repos.txt)nPlage++; }); }));", "if(false)nPlage++; }); }));")], 'GARDE'),
    ('M96 le balayage des séparateurs ne regarde que le DERNIER : « Squat | warm-up » (le mot contient lui-même un tiret) n\'est plus reconnu',
     [(LO, "for(let k=seps.length-1;k>=0;k--){", "for(let k=seps.length-1;k>=seps.length-1;k--){")], 'GARDE'),
]

BANC = os.path.join('tools', 'banc_import_fidelite.js')


def banc(arbre):
    r = subprocess.run(['node', BANC], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    ok = re.search(r'(\d+) OK / (\d+) rouge', out)
    return rouges, (ok.group(0) if ok else '?')


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_iif_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'exercises', 'anatomy', 'muscles'))
    # le banc lit les images du catalogue : on les lie (lecture seule) plutôt que de les copier
    for d in ('exercises', 'anatomy', 'muscles'):
        if os.path.isdir(os.path.join(SRC, d)) and not os.path.exists(os.path.join(a, d)):
            os.symlink(os.path.join(SRC, d), os.path.join(a, d))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    seul = os.environ.get('MUT_SEUL')
    tmp0, a0 = cloner()
    rouges, bilan = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge (%s) — point de depart valide\n' % bilan)
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        if seul and not nom.startswith(seul):
            continue
        total += 1
        tmp, arbre = cloner()
        srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
        invalide = []
        for f, av, ap in remplacements:
            if srcs[f].count(av) != 1:
                invalide.append('%s:%s (x%d)' % (f, av[:60], srcs[f].count(av)))
            else:
                srcs[f] = srcs[f].replace(av, ap, 1)
        if invalide:
            print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        for f in FICHIERS:
            open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges, bilan = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-110s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0][:90] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
