#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — IMPORT PDF, LA CHAINE FIDELE (Claude N°2, 15/11/2026) : les temoins B-ICF savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET UN DEFAUT que le lot a supprime (ou retire une protection qu'il a ajoutee) ; le banc `tools/banc_import_chaine.js`
doit alors rougir AU MOINS UNE fois. Une mutation qui laisse le banc vert = un temoin qui ne protege rien (R17 / R35, « un test qui ne peut pas
rougir rassure sans rien mesurer »). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
Usage : python3 tools/mut_import_chaine.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=M07 : une mutation)
A lancer sous le garde reseau : tools/sous_garde.sh python3 tools/mut_import_chaine.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANC = os.path.join('tools', 'banc_import_chaine.js')
FICHIERS = ('constants.js', 'log.js', 'index.html', 'style.css', 'coach.js', 'app.js', 'setup.js')
LO, CO, IX, CJ, SJ = 'log.js', 'constants.js', 'index.html', 'coach.js', 'setup.js'

MUT = [
    # ── A. les CHARGES : jamais comblées, jamais décalées, « à vide » ≠ non renseignée ──
    ('M01 une charge manquante est de nouveau comblée par `kg` de l\'exercice (le défaut du 15/11 : la barre disparaît, tout est décalé, la dernière est répétée)',
     [(LO, "    const c=K.kgs[s];                      // nombre > 0 · 'vide' · null — JAMAIS comblé (IMPORT PDF 15/11)\n    kgs.push(c>0?c:(c==='vide'?0:null)); vides.push(c==='vide');",
           "    kgs.push((ex.kgPerSet&&ex.kgPerSet[s]!=null&&ex.kgPerSet[s]!=='vide')?ex.kgPerSet[s]:(ex.kg||0)); vides.push(false);")], 'GARDE'),
    ('M02 un tableau de la MAUVAISE longueur est de nouveau aligné par le début (les 4 charges prennent les 4 premières séries)',
     [(LO, "    if(brut.length!==n)                                                  // ⛔ jamais aligné : on ne sait pas QUELLE série manque\n      return {kgs:Array(n).fill(null),partiel:lus.filter(x=>x.n>0||x.vide).map(x=>x.vide?'à vide':x.n)};\n",
           "")], 'GARDE'),
    ('M03 « à vide » n\'existe plus : la barre redevient une charge non renseignée',
     [(LO, "return {kgs:lus.map(x=>x.n>0?x.n:((x.vide||(x.n===0&&positif))?'vide':null)),partiel:null};", "return {kgs:lus.map(x=>x.n>0?x.n:null),partiel:null};")], 'GARDE'),
    ('M04 un tableau de zéros SEULS (remplissage du modèle) devient « à vide » partout',
     [(LO, "(x.vide||(x.n===0&&positif))?'vide':null", "(x.vide||x.n===0)?'vide':null")], 'GARDE'),
    ('M05 la virgule décimale est perdue (« 137,5 » → 137)',
     [(LO, "  const x=numFR(s.replace(/kg/ig,''));                                  // « 137,5 kg » → 137.5", "  const x=parseFloat(s.replace(/kg/ig,''));                                  // « 137,5 kg » → 137.5")], 'GARDE'),
    ('M06 la consigne d\'une fourchette n\'est plus conservée dans la note',
     [(LO, "    vus.forEach(x=>{ const note=String(ex.note||''); if(note.indexOf(x.m)<0)ex.note=(note?note+' | ':'')+x.lib+' : '+x.m; });\n", "")], 'GARDE'),
    ('M07 la consigne d\'une fourchette est posée au DÉBUT de la note (la preuve d\'échauffement « note » ne la reconnaît plus)',
     [(LO, "ex.note=(note?note+' | ':'')+x.lib+' : '+x.m;", "ex.note=x.lib+' : '+x.m+(note?' | '+note:'');")], 'GARDE'),
    ('M08 l\'aperçu ne dit plus qu\'une lecture de charges est incomplète',
     [(LO, "            ${(ex._kgPartiel&&ex._kgPartiel.length)?`<div class=\"imp-info\" style=\"color:var(--gold);\">⚠️ Charges incomplètes", "            ${false?`<div class=\"imp-info\" style=\"color:var(--gold);\">⚠️ Charges incomplètes")], 'GARDE'),
    ('M09 l\'aperçu n\'écrit plus « à vide » (la barre redevient un tiret ou 0 kg)',
     [(LO, "const kgTxt=s[0].vide?' · à vide':(s[0].kg?' @ '+s[0].kg+' kg':'');", "const kgTxt=(s[0].kg?' @ '+s[0].kg+' kg':'');"),
      (LO, "_escNote(x.vide?'à vide × ':(x.kg?x.kg+' kg × ':(avecCharges?'? × ':'')))", "_escNote(x.kg?x.kg+' kg × ':(avecCharges?'? × ':''))"),
      (LO, "${x.vide?'à vide':(x.kg?x.kg+' kg':'—')} × ${_repsHtml(x.reps)}", "${x.kg?x.kg+' kg':'—'} × ${_repsHtml(x.reps)}")], 'GARDE'),
    ('M10 le programme enregistré perd le marqueur `vide` (la barre redevient une charge non renseignée dans les données)',
     [(LO, "if(_SI.vides[si])o.vide=true; return o; });", "return o; });")], 'GARDE'),
    ('M11 le regroupement échauffement + travail perd « à vide » (les charges fusionnées ne sont plus canoniques)',
     [(LO, "R.push(...x.reps);K.push(..._kgPerSetDe(x));RE.push(...x.rests);", "R.push(...x.reps);K.push(...x.kgs);RE.push(...x.rests);")], 'GARDE'),
    ('M12 les charges ne sont plus lues à la réception (ni forme canonique, ni fourchettes conservées)',
     [(LO, "    _impLireCharges();     // IMPORT PDF 15/11 : les charges sont LUES une fois", "    // _impLireCharges();     // IMPORT PDF 15/11 : les charges sont LUES une fois")], 'GARDE'),
    ('M13 la signalisation d\'une lecture incomplète se perd au regroupement (l\'exercice fusionné ne la porte plus)',
     [(LO, "  if(PK.length)o._kgPartiel=PK; else delete o._kgPartiel;", "  delete o._kgPartiel;")], 'GARDE'),
    # ── A (suite) : le remplissage du modèle ne devient jamais une barre à vide, même après le regroupement ──
    ('M14 les zéros de remplissage d\'une ligne d\'échauffement deviennent des barres « à vide » une fois fusionnés au travail (la forme canonique est perdue)',
     [(LO, "R.push(...x.reps);K.push(..._kgPerSetDe(x));RE.push(...x.rests);", "R.push(...x.reps);K.push(...x.kgs);RE.push(...x.rests);")], 'GARDE'),
    # ── B. l'HISTORIQUE ne remplace plus les prescriptions d'un programme importé à son 1er usage ──
    ('M15 `prescrit` n\'est plus lu : l\'historique de l\'exercice remplace de nouveau charges ET répétitions du document (le défaut du 15/11)',
     [(LO, "  const _jour=_seancesDuJour(prog,_lbl,day);", "  const _jour=null;")], 'GARDE'),    # ⚠️ ancre mise a jour le 16/11/2026 (D-163 : la regle vaut pour TOUS les programmes)
    ('M16 « déjà suivi » se décide sur le LIBELLÉ seul : une séance d\'un AUTRE programme (progId différent) rend le jour « suivi »',
     [(LO, "  return _seancesTrain().filter(s=>s&&s.progId&&s.progId===prog.id&&(!day||(s.progDayId?(!!day.id&&s.progDayId===day.id):(unique&&s.progLabel===label)))).sort(_cmpSeances);\n}", "  return _seancesTrain().filter(s=>s&&s.progLabel===label);\n}")], 'GARDE'),
    ('M17 « déjà suivi » se décide sur le PROGRAMME seul : les séances d\'un AUTRE jour du même programme servent de repère (le couché secondaire reprend le top set du couché lourd)',
     [(LO, "  return _seancesTrain().filter(s=>s&&s.progId&&s.progId===prog.id&&(!day||(s.progDayId?(!!day.id&&s.progDayId===day.id):(unique&&s.progLabel===label)))).sort(_cmpSeances);\n}", "  return _seancesTrain().filter(s=>s&&s.progId&&s.progId===prog.id);\n}")], 'GARDE'),
    ('M18 un programme déjà suivi ne reprend plus ses adaptations (la dernière séance DE CE JOUR n\'est plus lue)',
     [(LO, "    const h=_prevDuJour(jour||[],e,exs), prev=h.sets, ts=h.ts;", "    const h={sets:[],ts:0}, prev=h.sets, ts=h.ts;")], 'GARDE'),
    ('M19 un programme d\'AVANT (sans `prescrit`) ne reprend plus sa derniere seance (D-163 : tous les programmes suivent la regle — la reprise du jour disparait pour lui) — SURVIT ICI A DESSEIN : ce banc ne rejoue que des programmes importes (« prescrits ») ; la protection vit dans le banc B-SCCH (mut_seance_ce_h M04, 18 rouges)',
     [(LO, "  const _jour=_seancesDuJour(prog,_lbl,day);", "  const _jour=prog.prescrit?_seancesDuJour(prog,_lbl,day):null;")], 'OK'),
    ('M20 la séance ne porte plus le `progId` du programme',
     [(LO, "S.wkt={date:today(),progLabel:_lbl,progId:prog.id,progDayId:day.id,exs:", "S.wkt={date:today(),progLabel:_lbl,progDayId:day.id,exs:")], 'GARDE'),
    ('M21 la séance ENREGISTRÉE ne porte plus le `progId` (le « déjà suivi » ne peut jamais se déclencher)',
     [(LO, "progLabel:S.wkt.progLabel||'',...(S.wkt.progId?{progId:S.wkt.progId}:{}),...(S.wkt.progDayId?{progDayId:S.wkt.progDayId}:{})};", "progLabel:S.wkt.progLabel||'',...(S.wkt.progDayId?{progDayId:S.wkt.progDayId}:{})};")], 'GARDE'),
    ('M22 l\'import ne pose plus `prescrit:true`',
     [(LO, "  const prog={id:'p'+Date.now(),name,prescrit:true,", "  const prog={id:'p'+Date.now(),name,")], 'GARDE'),
    ('M23 la barre « à vide » ne suit plus la série jusqu\'à la séance',
     [(LO, "        ...((s.vide&&!_avecPdc&&!(ppKg&&ppKg.kg>0))?{vide:true}:{}),", "        ...({}),")], 'GARDE'),
    ('M24 le grisé de la barre n\'est plus « à vide » (la charge d\'une série d\'historique s\'y propose et se valide à sa place)',
     [(LO, "<input class=\"sinp\" type=\"text\" value=\"${set.kg||''}\" placeholder=\"${set.vide?'à vide':(p&&_kgConnu(p.kg)?p.kg:'')}\" inputmode=\"decimal\" step=\"0.5\" enterkeyhint=\"done\"", "<input class=\"sinp\" type=\"text\" value=\"${set.kg||''}\" placeholder=\"${p&&_kgConnu(p.kg)?p.kg:''}\" inputmode=\"decimal\" step=\"0.5\" enterkeyhint=\"done\"")], 'GARDE'),
    # ── F. le REMPLACEMENT : aucune présélection, cible explicite, début de cycle dit et conservé ──
    ('M25 la liste de remplacement présélectionne de nouveau le 1er programme (plus d\'option « Choisir… »)',
     [(LO, "    sel.innerHTML='<option value=\"\" selected disabled>Choisir le programme à remplacer</option>'+progs.map(", "    sel.innerHTML=''+progs.map(")], 'GARDE'),
    ('M26 sans cible choisie, l\'import n\'est plus bloqué (il retombe sur « enregistrer comme nouveau »)',
     [(LO, "    if(!cible){\n      toast('Choisis d\\'abord le programme à remplacer','error');", "    if(false&&!cible){\n      toast('Choisis d\\'abord le programme à remplacer','error');")], 'GARDE'),
    ('M27 le début de cycle du programme remplacé est de nouveau perdu en silence',
     [(LO, "      prog.startDate=_debutRemplacement(S.programmes[idx]).date;   // IMPORT PDF 15/11", "      // prog.startDate=_debutRemplacement(S.programmes[idx]).date;   // IMPORT PDF 15/11")], 'GARDE'),
    ('M28 la confirmation ne dit plus le sort du début de cycle',
     [(LO, "+'). '+_debutRemplacementTxt(cible)+' Tes séances déjà faites", "+'). Tes séances déjà faites")], 'GARDE'),
    ('M29 un cycle déjà TERMINÉ est de nouveau conservé (une date inventée)',
     [(LO, "  const old=cible&&cible.startDate?_dateProgValide(cible.startDate,(_impExtracted&&_impExtracted.weeks)||cible.weeks):'';", "  const old=cible&&cible.startDate?cible.startDate:'';")], 'GARDE'),
    ('M30 la date écrite par le document ne l\'emporte plus sur celle du programme remplacé',
     [(LO, "  const doc=_dateProgValide(_impExtracted&&_impExtracted.startDate,_impExtracted&&_impExtracted.weeks);\n  if(doc)return {date:doc,src:'document'};", "  const doc='';\n  if(doc)return {date:doc,src:'document'};")], 'GARDE'),
    # ── échauffement ≠ cardio ; traits d'union typographiques ──
    ('M31 un échauffement de musculation SANS charge redevient du « vélo léger » (le garde sur le nom de base est retiré)',
     [(LO, "      if(_b&&(_nomEstUnExerciceConnu(_b)||_nomBaseEquivalentConnu(_b)))return false;\n", "")], 'GARDE'),   # ré-ancré (nuit n°2) : la ligne gardée a gagné l'équivalence connue (M58 retire seulement celle-ci)
    ('M32 les traits d\'union typographiques (U+2010/2011/2012/2212) ne comptent plus dans « X - échauffement »',
     [(LO, "re=/\\s*[-–—‐‑‒−:|\\/]\\s*/g, seps=[];", "re=/\\s*[-–—:|\\/]\\s*/g, seps=[];")], 'GARDE'),
    ('M33 « 2 x 30 kg » est de nouveau lu « 2 kg » (la garde d\'ambiguïté « n x m » est retirée)',
     [(LO, "  if(/\\d\\s*[x×*]\\s*\\d/i.test(s))return {n:null,vide:false};             // « 2 x 30 kg » : deux haltères ou deux séries ? on ne devine pas (R29) — jamais « 2 kg »\n", "")], 'GARDE'),
    # ── A (suite) : les valeurs LUES d'une lecture incomplète restent écrites dans la note ──
    ('M35 les charges lues d\'un tableau incomplet ne sont plus gardées dans la note (elles disparaissent à « Enregistrer »)',
     [(LO, "      if(note.indexOf(lues)<0&&!/\\d+ pour \\d+ s[ée]ries?/i.test(note))ex.note=(note?note+' | ':'')+lues;", "      if(false)ex.note=(note?note+' | ':'')+lues;")], 'GARDE'),
    ('M36 l\'app réécrit « Charges lues » alors que le Worker a déjà écrit « (4 pour 5 séries) » (la garde d\'idempotence est retirée)',
     [(LO, "      if(note.indexOf(lues)<0&&!/\\d+ pour \\d+ s[ée]ries?/i.test(note))ex.note=(note?note+' | ':'')+lues;", "      if(note.indexOf(lues)<0)ex.note=(note?note+' | ':'')+lues;")], 'GARDE'),
    # ── B × C : l'éditeur de programme ne retire jamais `prescrit` ──
    ('M37 l\'éditeur réécrit le programme SANS `prescrit` à l\'enregistrement (un programme importé redevient « d\'avant » dès qu\'on l\'ouvre : l\'historique reprend la main)',
     [(LO, "  S.programmes[_editProgIdx]=_editProgData;", "  S.programmes[_editProgIdx]=Object.assign({},_editProgData,{prescrit:undefined});")], 'GARDE'),
    # ── « Sauvegarder comme programme » : le seul copieur de séries d'une séance ──
    ('M38 `saveAsProg` ne recopie plus « à vide » ni la consigne de repos écrite (un champ qu\'un copieur ne recopie pas est un champ supprimé)',
     [(LO, "rest:_secRepos(s.rest),...(s.vide&&_pdcDe(s)===null?{vide:true}:{}),..._pdcRepris(s),...(s.restTxt?{restTxt:String(s.restTxt)}:{}),...(s.note?{note:String(s.note)}:{})}))};", "rest:_secRepos(s.rest),..._pdcRepris(s),...(s.note?{note:String(s.note)}:{})}))};")], 'GARDE'),    # ancre mise a jour le 16/11/2026 (lot 1 : le commentaire de serie voyage aussi)
    ('M39 `saveAsProg` coupe de nouveau la consigne à 300 caractères, en silence',
     [(LO, "if(ex.note)o.note=String(ex.note).slice(0,Math.max(_NOTE_PROG_MAX,String(ex.note).length));", "if(ex.note)o.note=String(ex.note).slice(0,300);")], 'GARDE'),
    # ── B (suite) : l'appui ✓ sur une série dont le champ porte le TEXTE « à vide » ──
    ('M34 l\'appui ✓ sur la barre « à vide » écrit NaN (le texte du champ n\'est plus ramené à 0 kg)',
     [(LO, "if(!set.kg&&inps[1])set.kg=numFR(inps[1].value||inps[1].placeholder)||0;}\n  set.done=!set.done;", "if(!set.kg&&inps[1])set.kg=numFR(inps[1].value||inps[1].placeholder);}\n  set.done=!set.done;")], 'GARDE'),
    # ── G. D1 / D4 (nuit du 15 au 16/11) : l'identité d'un jour, la charge précédente inconnue, le serveur, la restauration, Milo ──
    ('M40 l\'identité d\'un jour n\'est que son libellé : deux jours du même programme qui portent le MÊME libellé se confondent (faire l\'un rend l\'autre « suivi », la prescription est remplacée)',
     [(LO, "(s.progDayId?(!!day.id&&s.progDayId===day.id):(unique&&s.progLabel===label))", "s.progLabel===label")], 'OK'),    # SURVIT A DESSEIN depuis le 16/11/2026 : l'identite d'EXERCICE (`exId`) interdit seule le melange (defense en profondeur) ; la mutation du jour est tuee par B-SCCH (mut_seance_ce_h M20/M21)

    ('M41 la prudence déborde : TOUT jour d\'un programme à plusieurs jours devient « ambigu » (un jour au libellé unique ne reprend plus ses adaptations)',
     [(LO, ".filter((d,i)=>(d&&d.label||('Jour '+(i+1)))===label).length", ".filter((d,i)=>true).length")], 'GARDE'),
    ('M42 la colonne « Précédent » écrit de nouveau la charge brute (« 8×null »)',
     [(LO, "${pv.reps}×${_kgConnu(pv.kg)?pv.kg:'?'}", "${pv.reps}×${pv.kg}")], 'GARDE'),
    ('M43 le grisé du champ de charge écrit de nouveau la charge brute (« null »)',
     [(LO, "placeholder=\"${set.vide?'à vide':(p&&_kgConnu(p.kg)?p.kg:'')}\" inputmode=\"decimal\" step=\"0.5\" enterkeyhint=\"done\"", "placeholder=\"${set.vide?'à vide':(p?p.kg:'')}\" inputmode=\"decimal\" step=\"0.5\" enterkeyhint=\"done\"")], 'GARDE'),
    ('M44 la synchronisation n\'envoie plus le `progId` des séances (un champ qu\'un copieur ne recopie pas est un champ supprimé)',
     [(SJ, "sessions:S.histTronque?undefined:(S.sessions||[]).slice(0,2000), // ~8-10 ans de séances", "sessions:S.histTronque?undefined:(S.sessions||[]).slice(0,2000).map(function(s){var o=Object.assign({},s);delete o.progId;return o;}), // ~8-10 ans de séances")], 'GARDE'),
    ('M45 la synchronisation n\'envoie plus « à vide » des programmes',
     [(SJ, "programmes:S.programmes||[],", "programmes:JSON.parse(JSON.stringify(S.programmes||[],function(k,v){return k==='vide'?undefined:v;})),")], 'GARDE'),
    ('M46 Milo reçoit de nouveau « 0×10 » pour une charge inconnue (le « ? » est retiré de ses séances)',
     [(CJ, "return `${num}${x.kg||'?'}×${x.reps||'?'}${(x.type&&x.type!=='N'&&!ech)", "return `${num}${x.kg}×${x.reps||'?'}${(x.type&&x.type!=='N'&&!ech)")], 'GARDE'),
    ('M47 la restauration perd « à vide » des programmes',
     [(SJ, "{S.programmes=raw.programmes;console.log('[FT restore] programmes:',raw.programmes.length);}", "{S.programmes=JSON.parse(JSON.stringify(raw.programmes,function(k,v){return k==='vide'?undefined:v;}));console.log('[FT restore] programmes:',raw.programmes.length);}")], 'GARDE'),
    # ── H. la chaîne CHAMP PAR CHAMP : programme → éditeur → séance chargée → séance enregistrée ──
    ('M48 la séance chargée ne reprend plus la consigne de repos écrite (une plage) du programme',
     [(LO, "        ...(s.restTxt?{restTxt:String(s.restTxt)}:{})   // IMPORT-IA-FIDELITE-01 : la consigne de repos écrite (une plage) suit la série", "        // (retiré)")], 'GARDE'),
    ('M49 la séance chargée remet toutes les séries en type « N » (les échauffements deviennent des séries de travail)',
     [(LO, "type:s.type||'N',done:false,rm1:0,rest:_secRepos(s.rest),\n        ...((s.vide&&!(ppKg&&ppKg.kg>0))?{vide:true}:{}),", "type:'N',done:false,rm1:0,rest:_secRepos(s.rest),\n        ...((s.vide&&!(ppKg&&ppKg.kg>0))?{vide:true}:{}),")], 'GARDE'),
    ('M50 la séance chargée ne reprend plus le superset du programme',
     [(LO, "    if(e.group){obj.group=e.group;obj.groupType=e.groupType||'super';} // propage le superset\n    _recopierDropset(e,obj);                                              // LOT 6 / ML-A\n    return obj;\n  });\n}", "    // (retiré)\n    _recopierDropset(e,obj);                                              // LOT 6 / ML-A\n    return obj;\n  });\n}")], 'GARDE'),
    ('M51 l\'éditeur, à l\'ouverture, ne recopie plus la consigne de repos écrite (elle disparaît à « Enregistrer » sans rien changer)',
     [(LO, "  _editProgData=JSON.parse(JSON.stringify(prog));\n  _renderProgEdit();\n  _ouvrirProgEdit();", "  _editProgData=JSON.parse(JSON.stringify(prog,function(k,v){return k==='restTxt'?undefined:v;}));\n  _renderProgEdit();\n  _ouvrirProgEdit();")], 'GARDE'),
    # ── D4 « préserver l'information source » : une charge écrite mais illisible ──
    ('M53 le texte d\'une charge écrite mais illisible (« 2 x 30 kg ») n\'est plus gardé dans la note (il disparaît en silence)',
     [(LO, "    nonLus.forEach(m=>{ const note=String(ex.note||''); if(note.indexOf(m)<0)ex.note=(note?note+' | ':'')+'Charge non lue : '+m; });\n", "")], 'GARDE'),
    ('M54 l\'aperçu ne dit plus qu\'une charge écrite n\'a pas pu être lue',
     [(LO, "${(ex._kgNonLue&&ex._kgNonLue.length)?`<div class=\"imp-info\" style=\"color:var(--gold);\">⚠️ Charge écrite non lue", "${false?`<div class=\"imp-info\" style=\"color:var(--gold);\">⚠️ Charge écrite non lue")], 'GARDE'),
    ('M55 le texte d\'une charge illisible est écrit même quand la note le porte déjà (doublon)',
     [(LO, "if(note.indexOf(m)<0)ex.note=(note?note+' | ':'')+'Charge non lue : '+m;", "ex.note=(note?note+' | ':'')+'Charge non lue : '+m;")], 'GARDE'),
    ('M56 le regroupement échauffement + travail perd la charge illisible de la ligne d\'échauffement',
     [(LO, "  if(NL.length)o._kgNonLue=NL; else delete o._kgNonLue;\n", "  delete o._kgNonLue;\n")], 'GARDE'),
    # ── I. ÉCHAUFFEMENTS — conservation exacte : une ligne de musculation n'est jamais prise pour du cardio ni typée « W » ──
    ('M57 une barre « à vide » n\'est plus une charge pour le garde du cardio (l\'échauffement à la barre seule + une durée en note repart au bloc cardio et SES SÉRIES DISPARAISSENT)',
     [(LO, "    if(sets.some(s=>s&&(s.vide||parseFloat(String(s.kg).replace(',','.'))>0)))return false;", "    if(sets.some(s=>s&&parseFloat(String(s.kg).replace(',','.'))>0))return false;")], 'GARDE'),
    ('M58 le nom de base d\'un échauffement connu par ÉQUIVALENCE (« Squat », « Bench Press ») n\'est plus reconnu comme exercice : « Warm-up - Squat » + une durée en note devient du cardio',
     [(LO, "      if(_b&&(_nomEstUnExerciceConnu(_b)||_nomBaseEquivalentConnu(_b)))return false;", "      if(_b&&_nomEstUnExerciceConnu(_b))return false;")], 'GARDE'),
    ('M59 `setType:\'W\'` (ancien format) d\'une ligne non regroupée s\'enregistre de nouveau avec la LETTRE « W » (hors N / É / X)',
     [(LO, "  return (v==='W'||String(ex.setType||'').toUpperCase()==='W') ? 'É' : (ex.setType||'N');", "  return v==='W' ? 'É' : (ex.setType||'N');")], 'GARDE'),
    ('M52 la séance ENREGISTRÉE perd « à vide » (un champ qu\'un copieur ne recopie pas est un champ supprimé)',
     [(LO, "date:S.wkt.date||today(),exs:S.wkt.exs,volume:Math.round(vol)", "date:S.wkt.date||today(),exs:S.wkt.exs.map(function(e){return Object.assign({},e,{sets:e.sets.map(function(s){var o=Object.assign({},s);delete o.vide;return o;})});}),volume:Math.round(vol)")], 'GARDE'),
]


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
    tmp = tempfile.mkdtemp(prefix='mut_icf_')
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
        srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS if os.path.exists(os.path.join(arbre, f))}
        invalide = []
        for f, av, ap in remplacements:
            if srcs[f].count(av) != 1:
                invalide.append('%s:%s (x%d)' % (f, av[:60], srcs[f].count(av)))
            else:
                srcs[f] = srcs[f].replace(av, ap, 1)
        if invalide:
            print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        for f in srcs:
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
