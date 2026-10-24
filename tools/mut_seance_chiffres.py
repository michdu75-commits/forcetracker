#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — MISSION SEANCE DU 24/10/2026, les chiffres d'une seance (session-C, Claude Seance) : les temoins
C-NUM-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord ; l'arbre sain est REJOUE a la fin (banc instable = campagne refusee).
M00 remet les fichiers de l'app tels qu'ils etaient AVANT la mission (branche Seance 5a7b0a57 = master 999b7947 + repos +
vignettes), mot pour mot. Lots 1 (M1-M15, M33), 2 (M16-M32, M34, M35) 3 (M36-M49) et 4 (M50-M57).
Les mutations [deguisee] cassent l'invariant sans toucher a la ligne evidente ; [negatif] ne doit PAS faire rougir.
Chaque mutation GARDE exige un TEMOIN PRECIS (4e champ) parmi les rouges.
Un PLANTAGE du banc (code de sortie hors 0/1, ligne PLANTAGE, ou pas de ligne de total) n'est JAMAIS « garde ».
Une mutation qui casse la SYNTAXE est refusee (elle rougirait tout, elle ne prouve rien).
Usage : python3 tools/mut_seance_chiffres.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
        MUT_PARTS=N MUT_PART=k : ne joue que la k-ieme part (1..N) des mutations choisies.
Chaque resultat est imprime des qu'il tombe.
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '5a7b0a57'
LO, SE, AP, ST, SC, DA, CO, TR = 'log.js', 'setup.js', 'app.js', 'state.js', 'screens.js', 'dashboard.js', 'coach.js', 'tracking.js'
FICHIERS = (LO, SE, AP, ST, SC, DA, CO, TR)
FICHIERS_AVANT = (LO, SE, AP, ST, SC, DA, CO, TR)

MUT = [
    ("M00 code d'AVANT la mission remis mot pour mot (5a7b0a57)", 'AVANT', 'GARDE', 'C-NUM-A1'),
    # ── F21 : les calories d'une seance passee ─────────────────────────────────────────────────────────────────────
    ('M1 meme effort : le detail des calories est recalcule au lieu d\'etre garde',
     [(SE, "  if(cA.total===cN.total) return {calories:avant.calories, calData:avant.calData};   // même effort : rien ne bouge\n", "")],
     'GARDE', 'C-NUM-A7'),
    ('M2 [deguisee] effort change : le calcul du jour est pris tel quel (poids du jour)',
     [(SE, "  if(!(ref>0) || !(cA.total>0)) return {calories:cN.total, calData:cN};", "  return {calories:cN.total, calData:cN};")],
     'GARDE', 'C-NUM-A3'),
    ('M3 [deguisee] l\'echelle d\'origine est inversee (cA / ref)',
     [(SE, "  const k=ref/cA.total, sc=v=>Math.round(v*k);", "  const k=cA.total/ref, sc=v=>Math.round(v*k);")],
     'GARDE', 'C-NUM-C3'),
    ('M4 « Enregistrer » recalcule les calories avec le moteur seul (l\'ancien chemin)',
     [(SE, "  const _k=_kcalApresEdition(_avant,_sessEdits);   // F21 : rien ne bouge si l'effort n'a pas bougé",
           "  const _k=(()=>{const c=_calDataSeance(_sessEdits);return {calories:c.total,calData:c};})();")],
     'GARDE', 'C-NUM-A1'),
    ('M5 la fin de seance oublie le cardio (calcul commun ampute)',
     [(LO, "  if(cardioKcal){calData.total+=cardioKcal;calData.cardio=cardioKcal;}\n  return calData;",
           "  return calData;")],
     'GARDE', 'C-NUM-A6'),
    # ── F02 / Q5 : le volume ───────────────────────────────────────────────────────────────────────────────────────
    ('M6 « Enregistrer » revient a la copie sans convention unilaterale',
     [(SE, "  _sessEdits.volume=Math.round(_workVol(_sessEdits));",
           "  let vol=0; _sessEdits.exs.forEach(ex=>ex.sets.forEach(s=>{if(s.done&&s.type!=='É'&&s.type!=='W')vol+=(s.kg||0)*(s.reps||0);})); _sessEdits.volume=Math.round(vol);")],
     'GARDE', 'C-NUM-B1'),
    ('M7 [deguisee] _volTravail lit d\'abord la copie rangee',
     [(LO, "  return Math.round(w>0 ? w : (+sess.volume||+sess.vol||0));", "  return Math.round((+sess.volume||+sess.vol||0) || w);")],
     'GARDE', 'C-NUM-B5'),
    ('M8 la carte de l\'historique relit la copie rangee',
     [(SE, "parts.push('<span class=\"sess-vol2\">'+_volTravail(s)+' kg de travail</span>');",
           "parts.push('<span class=\"sess-vol2\">'+Math.round(s.volume||0)+' kg de travail</span>');")],
     'GARDE', 'C-NUM-B5'),
    ('M9 l\'en-tete du detail relit la copie rangee',
     [(SE, "  const _vTrav=_volTravail(sess), _vEch=", "  const _vTrav=Math.round(sess.volume||0), _vEch=")],
     'GARDE', 'C-NUM-B6'),
    ('M10 [deguisee] l\'affichage reecrit la seance au passage (correction silencieuse)',
     [(SE, "  const _vTrav=_volTravail(sess), _vEch=", "  sess.volume=_volTravail(sess); persist();\n  const _vTrav=_volTravail(sess), _vEch=")],
     'GARDE', 'C-NUM-B7'),
    # ── K1 / K2 : la duree ─────────────────────────────────────────────────────────────────────────────────────────
    ('M11 corriger la duree ne recalcule plus les calories',
     [(SE, "  s.calories=_k.calories; s.calData=_k.calData;\n  persist();", "  persist();")],
     'GARDE', 'C-NUM-C1'),
    ('M12 corriger la duree rouvre le detail (efface ce qui est tape)',
     [(SE, "  if(_sessEdits && (_sessEdits.ts||_sessEdits.id)===(s.ts||s.id)){", "  if(false){")],
     'GARDE', 'C-NUM-C4'),
    ('M13 [deguisee] la duree n\'est pas reportee dans le detail ouvert (« Enregistrer » la remet)',
     [(SE, "    if(s.duration){ _sessEdits.duration=s.duration; _sessEdits.durationDite=true; }", "    if(s.duration){ }")],
     'GARDE', 'C-NUM-C5'),
    ('M14 l\'en-tete n\'est pas redessine apres la duree',
     [(SE, "    _sdEntete(s);\n  }else openSessDetail(s.ts||s.id);", "  }else openSessDetail(s.ts||s.id);")],
     'GARDE', 'C-NUM-C2'),
    ('M33 confirmer la meme duree reecrit la seance (garde retiree)',
     [(SE, "  if(t && s.duration && m===Math.round(s.duration/60)){ toast('Durée inchangée','info'); return; }\n", "")],
     'GARDE', 'C-NUM-C11'),
    # ── LOT 2 : les memes chiffres partout ──────────────────────────────────────────────────────────────────────────
    ('M16 le calendrier recalcule sans la convention (ancienne copie)',
     [(SC, "  return _volTravail(s);", "  let v=0;(s.exs||[]).forEach(ex=>{(ex.sets||[]).forEach(st=>{if(!st.done||!st.kg||!st.reps||st.type==='É'||st.type==='W')return;v+=st.kg*st.reps;});});return v;")],
     'GARDE', 'C-NUM-D1'),
    ('M17 la tendance recompte toutes les series faites, sans convention',
     [(ST, "      v[m]+= (typeof _volTravail==='function') ? _volTravail(sess) : 0;",
           "      (sess.exs||[]).forEach(e=>(e.sets||[]).forEach(x=>{ if(x && x.done!==false && +x.kg>0 && +x.reps>0) v[m]+= (+x.kg)*(+x.reps); }));")],
     'GARDE', 'C-NUM-D3'),
    ('M18 l\'export oublie le facteur unilateral',
     [(SE, "volume:Math.round(kg*reps*_facteurUni(s, ex.name))", "volume:Math.round(kg*reps)")],
     'GARDE', 'C-NUM-D4'),
    ('M19 Milo relit la copie rangee dans la liste des seances',
     [(CO, "${exStr} — ${(typeof _volTravail==='function'?_volTravail(s):(+s.volume||+s.vol||0))}kg vol total", "${exStr} — ${s.volume}kg vol total")],
     'GARDE', 'C-NUM-D5'),
    ('M20 la fiche du debrief relit la copie rangee',
     [(CO, "    const vol=(typeof _volTravail==='function'?_volTravail(sess):(+sess.volume||+sess.vol||0));", "    const vol=sess.volume||sess.vol||0;")],
     'GARDE', 'C-NUM-D6'),
    ('M21 le tableau de bord relit la copie rangee (charge sur 30 jours)',
     [(DA, "    if(best>0)rm.push(best); vol.push((typeof _volTravail==='function'?_volTravail(s):(+s.volume||+s.vol||0))); });",
           "    if(best>0)rm.push(best); vol.push(+s.volume||+s.vol||0); });")],
     'GARDE', 'C-NUM-D8'),
    ('M34 [deguisee] le facteur unilateral ignore la convention de la seance (x2 meme avant le 11/08)',
     [(LO, "  return (sess&&sess.uniConv&&typeof estUnilateral==='function'&&estUnilateral(nom))?2:1;", "  return (sess&&typeof estUnilateral==='function'&&estUnilateral(nom))?2:1;")],
     'GARDE', 'C-NUM-D2'),
    ('M22 les anciennes series W recomptent dans le volume par muscle',
     [(LO, "st.type!=='É'&&st.type!=='W').length;", "st.type!=='É').length;")],
     'GARDE', 'C-NUM-E1'),
    ('M23 la cle du cache de couleur revient aux seuls noms',
     [(SC, "  const key=s.date+'|'+(s.exs||[]).map(e=>((e&&e.name)||'')+':'+((e&&(e.sets||[]).some(x=>x&&x.done))?1:0)+_cex(e&&e.name)).join('~');",
           "  const key=s.date+'|'+(s.exs||[]).map(e=>(e&&e.name)||'').join('~');")],
     'GARDE', 'C-NUM-F1'),
    ('M24 la tuile Nutrition ne prend que la premiere seance du jour',
     [(SC, "  const sessCals=_sessJour.reduce((a,s)=>a+(+s.calories||0),0);", "  const sessCals=(_sessJour[0]&&+_sessJour[0].calories)||0;")],
     'GARDE', 'C-NUM-G1'),
    ('M25 [deguisee] la tuile additionne mais ne dit pas combien de seances',
     [(SC, "_l.textContent=_sessJour.length>1?_sessJour.length+' séances':'Séance';", "_l.textContent='Séance';")],
     'GARDE', 'C-NUM-G1'),
    ('M26 l\'en-tete du PDF compte les dates comme des seances',
     [(SE, "  const seances=new Set(L.map(r=>r.seance_id||r.date)).size, jours=", "  const seances=new Set(L.map(r=>r.date)).size, jours=")],
     'GARDE', 'C-NUM-H1'),
    ('M27 le conseil de recuperation ignore l\'absence de sommeil',
     [(TR, "  if(!sansSommeil) return r;", "  return r;")],
     'GARDE', 'C-NUM-I1'),
    ('M28 Milo relit « JOUR IDEAL pour PRs » sans sommeil note',
     [(CO, "(_sansS&&score>=60)?", "(false)?")],
     'GARDE', 'C-NUM-I3'),
    ('M29 l\'Accueil redit « Pret a performer » sans sommeil note',
     [(SC, "detail.sansSommeil?'Estimation sans sommeil':", "")],
     'GARDE', 'C-NUM-I5'),
    ('M30 l\'activite de la montre s\'affiche avec sa cle brute',
     [(LO, "${L[c.type]||M[c.type]||c.type||'cardio'}", "${L[c.type]||c.type||'cardio'}")],
     'GARDE', 'C-NUM-J1'),
    ('M31 le tapis de course retombe sur « course » (bareme Autre)',
     [(SE, "  if(/tapis|treadmill/.test(n))                   return 'tapis';\n", "")],
     'GARDE', 'C-NUM-J4'),
    ('M32 le detail affiche « Elliptique » pour une marche',
     [(SE, "${(c&&c.type&&!CARDIO_LABELS[c.type]&&CARDIO_NOMS_MONTRE[c.type])?", "${(false)?")],
     'GARDE', 'C-NUM-J3'),
    # ── LOT 3 : records et muscles ──────────────────────────────────────────────────────────────────────────────────
    ('M36 [deguisee] l\'origine du record n\'exige plus la meme date (un 100 x 5 d\'un autre jour suffit)',
     [(SE, "    if(!pr||pr.date!==avant.date||out.indexOf(ex.name)>=0) return;", "    if(!pr||out.indexOf(ex.name)>=0) return;")],
     'GARDE', 'C-REC-D2'),
    ('M37 le recalcul est applique sans attendre la reponse (ecriture automatique)',
     [(SE, "  showConfirm(props.length>1?'Records à vérifier':'Record à vérifier',",
           "  props.forEach(p=>{ if(p.apres) S.prs[p.nom]=p.apres; else delete S.prs[p.nom]; }); persist();\n  showConfirm(props.length>1?'Records à vérifier':'Record à vérifier',")],
     'GARDE', 'C-REC-A2'),
    ('M38 la suppression d\'une seance ne propose plus rien',
     [(SE, "  const _rec=[]; _parties.forEach(s=>_recordsVenantDe(s,null).forEach(n=>{ if(_rec.indexOf(n)<0)_rec.push(n); }));\n  _proposerRecordsRecalcules(_rec);",
           "  const _rec=[];")],
     'GARDE', 'C-REC-A1'),
    ('M39 « Enregistrer » ne propose plus rien apres une baisse',
     [(SE, "  toast('Séance mise à jour ✓','success');\n  _proposerRecordsRecalcules(_rec);", "  toast('Séance mise à jour ✓','success');")],
     'GARDE', 'C-REC-C1'),
    ('M40 l\'affichage oublie les muscles coches du perso (retour aux regles du nom)',
     [(LO, "    const c=_musclesCoches(ex.name);\n    if(c){", "    const c=null;\n    if(c){")],
     'GARDE', 'C-MUS-B1'),
    ('M41 _mscNiveau ignore les moteurs (retour au score >= 2)',
     [(LO, "  if(o&&o.prim) return o.prim[g]?2:(v>=1?1:0);", "  if(false) return 0;")],
     'GARDE', 'C-MUS-A1'),
    ('M42 [deguisee] la mini-figurine relit le score cumule',
     [(SE, "const nv=_mscNiveau(o,g);const[f,k]=nv>=2", "const nv=_mscNiveau(o,g);const[f,k]=v>=2")],
     'GARDE', 'C-MUS-A3'),
    ('M43 Progres revient a la fiche du catalogue d\'abord',
     [(LO, "  return _musclesCoches(nom) || ((typeof exMuscles==='function')",
           "  return ((typeof exMuscles==='function')&&exMuscles((typeof exNomCatalogue==='function')?exNomCatalogue(nom):nom)) || _musclesCoches(nom) || ((typeof exMuscles==='function')")],
     'GARDE', 'C-MUS-B4'),
    ('M45 les calories suivent les muscles coches en silence (getExerciseMET lit l\'affichage)',
     [(AP, "      const sc = (_mscScores([{name:n, sets:[{done:true}]}]) || {}).sc || {};",
           "      const sc = (_mscScoresVus([{name:n, sets:[{done:true}]}]) || {}).sc || {};")],
     'GARDE', 'C-MUS-B3'),
    ('M46 [deguisee] le moteur gele lit les muscles coches d\'abord (F05 applique aux calories par la bande)',
     [(LO, "    const _ecrit=(typeof exMuscles==='function')\n      ?exMuscles((typeof exNomCatalogue==='function')?exNomCatalogue(ex.name):ex.name):null;",
           "    const _ecrit=_musclesCoches(ex.name)||((typeof exMuscles==='function')\n      ?exMuscles((typeof exNomCatalogue==='function')?exNomCatalogue(ex.name):ex.name):null);")],
     'GARDE', 'C-MUS-B3'),
    ('M47 la carte de l\'historique relit le moteur des calories',
     [(SE, "    const sc=_mscScoresVus(s.exs||s.exercises||[]);\n    const mini=_mscSVGmini(sc)", "    const sc=_mscScores(s.exs||s.exercises||[]);\n    const mini=_mscSVGmini(sc)")],
     'GARDE', 'C-MUS-C2'),
    ('M48 [deguisee] la couleur du calendrier relit le moteur des calories',
     [(SC, "      const sc=(_mscScoresVus(s.exs||[])||{}).sc||{};", "      const sc=(_mscScores(s.exs||[])||{}).sc||{};")],
     'GARDE', 'C-MUS-C1'),
    ('M49 [deguisee] un secondaire seul compte comme moteur dans l\'affichage',
     [(LO, "if(o.sc[m]>=2) prim[m]=true;", "if(o.sc[m]>=1) prim[m]=true;")],
     'GARDE', 'C-MUS-A1'),
    # ── lot 4 : le repos par défaut depuis la séance (C-REG) ─────────────────────────────────────────────────────────
    ('M50 la liste commune perd 130 s (le Profil redevient vide pour le reglage d\'installation)',
     [(LO, "const REPOS_DEFAUT_CHOIX=[60,90,120,130,180,300];", "const REPOS_DEFAUT_CHOIX=[60,90,120,180,300];")],
     'GARDE', 'C-REG-A1'),
    ('M51 le menu de la seance n\'a plus la ligne « Repos par defaut »',
     [(LO, "  g1+='<button class=\"wm-row\" id=\"wm-repos\" onclick=\"openWktMenuRepos()\">'", "  if(0)g1+='<button class=\"wm-row\" id=\"wm-repos\" onclick=\"openWktMenuRepos()\">'")],
     'GARDE', 'C-REG-B1'),
    ('M52 [deguisee] choisir le repos par defaut efface les durees propres aux exercices',
     [(LO, "function choisirReposDefaut(sec){ const v=parseInt(sec,10); if(!_reposValide(v)) return false; S.defRest=v; return true; }",
           "function choisirReposDefaut(sec){ const v=parseInt(sec,10); if(!_reposValide(v)) return false; S.defRest=v; S.exRestPref={}; return true; }")],
     'GARDE', 'C-REG-C2'),
    ('M53 [deguisee] choisir le repos par defaut change aussi le repos en cours',
     [(LO, "    if(!choisirReposDefaut(choix)) return;\n", "    if(!choisirReposDefaut(choix)) return;\n    if(restStartTs) restTot=reposDefaut();\n")],
     'GARDE', 'C-REG-C1'),
    ('M54 le Profil garde sa propre liste figee (sans 130)',
     [(SE, "  if(restEl){ if(typeof reposDefautChoix==='function') restEl.innerHTML=reposDefautChoix()", "  if(restEl){ if(typeof reposDefautChoix!=='function') restEl.innerHTML=reposDefautChoix()")],
     'GARDE', 'C-REG-A1'),
    ('M56 le choix fait dans la seance n\'est pas enregistre sur l\'appareil',
     [(LO, "    persist(); try{ if(typeof _cloudSyncDebounced==='function') _cloudSyncDebounced(); }catch(e){}\n    closeWktMenu();",
           "    try{ if(typeof _cloudSyncDebounced==='function') _cloudSyncDebounced(); }catch(e){}\n    closeWktMenu();")],
     'GARDE', 'C-REG-B3'),
    ('M57 [equivalente] le Profil ecrit S.defRest sans le seul ecrivain (son selecteur ne propose que des valeurs valides : rien d\'observable)',
     [(SE, "  if(rest){ if(typeof choisirReposDefaut==='function') choisirReposDefaut(rest); else S.defRest=rest; }",
           "  if(rest){ S.defRest=rest; }")],
     'OK', None),
    ('M55 [negatif] le sous-titre de la feuille du repos est reformule',
     [(LO, "<span>Pour toutes tes séances · le même réglage que dans ton Profil</span>", "<span>Le même réglage que dans ton Profil · pour toutes tes séances</span>")],
     'OK', None),
    ('M44 [negatif] le texte d\'aperçu des records est reformule',
     [(SE, ". Rien ne change si tu le gardes.'", ". Si tu le gardes, rien ne change.'")],
     'OK', None),
    # ── negatif : ne doit rien faire rougir ─────────────────────────────────────────────────────────────────────────
    ('M35 [negatif] le commentaire de la tuile Nutrition est reformule',
     [(SC, "libellé plutôt que la valeur, pour que « 600 kcal » tienne dans la tuile à 320 px.", "libellé plutôt que la valeur : « 600 kcal » tient ainsi dans la tuile à 320 px.")],
     'OK', None),
    ('M15 [negatif] un commentaire de la regle des calories est reformule',
     [(SE, "  if(cA.total===cN.total) return {calories:avant.calories, calData:avant.calData};   // même effort : rien ne bouge",
           "  if(cA.total===cN.total) return {calories:avant.calories, calData:avant.calData};   // effort identique : on garde tout")],
     'OK', None),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_seance_chiffres.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                           env=dict(os.environ, TZ='Europe/Paris'))
    except subprocess.TimeoutExpired:
        return [], 'PLANTAGE (delai depasse)'
    out = r.stdout + r.stderr
    rouges = [l.strip()[:160] for l in out.split('\n') if 'ROUGE' in l]
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
    tmp = tempfile.mkdtemp(prefix='mut_num_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def une(m, avant):
    nom, remplacements, attendu = m[0], m[1], m[2]
    temoin = m[3] if len(m) > 3 else None
    tmp, arbre = cloner()
    try:
        if remplacements == 'AVANT':
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS_AVANT}
            if any(not avant[f] for f in FICHIERS_AVANT) or all(avant[f] == cur[f] for f in FICHIERS_AVANT):
                return nom, None, "INVALIDE (code d'avant introuvable ou identique)", []
            for f in FICHIERS_AVANT:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(avant[f])
        else:
            srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            invalide = []
            for f, av, ap in remplacements:
                if srcs[f].count(av) != 1:
                    invalide.append('%s:%s (x%d)' % (f, av[:50], srcs[f].count(av)))
                else:
                    srcs[f] = srcs[f].replace(av, ap, 1)
            if invalide:
                return nom, None, 'INVALIDE (ancre absente ou multiple : %s)' % invalide, []
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
            for f in FICHIERS:
                chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync(process.argv[1],'utf8'))", os.path.join(arbre, f)], capture_output=True, text=True)
                if chk.returncode:
                    return nom, None, 'INVALIDE (syntaxe cassee dans %s)' % f, []
        rouges, plantage = banc(arbre)
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
    avant = {f: subprocess.run(['git', 'show', AVANT + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in FICHIERS_AVANT}
    tmp0, a0 = cloner()
    rouges, plantage = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges or plantage:
        print('  !! ARBRE SAIN DEJA ROUGE OU EN PLANTAGE — controle refuse :', ([plantage] if plantage else []) + rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide) · MUT_J=%s\n' % os.environ.get('MUT_J', '1'), flush=True)
    choix = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    parts, part = int(os.environ.get('MUT_PARTS', '1')), int(os.environ.get('MUT_PART', '1'))
    choix = [m for i, m in enumerate(choix) if i % parts == part - 1]
    print('  part %d/%d : %d mutation(s)' % (part, parts, len(choix)), flush=True)
    conformes = 0
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '1'))) as ex:
        futs = [ex.submit(une, m, avant) for m in choix]
        for fu in as_completed(futs):
            nom, ok, obtenu, rouges = fu.result()
            if ok is None:
                print('  INVALIDE  %s %s' % (nom, obtenu), flush=True); continue
            conformes += ok
            print('  %s  %-100s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''), flush=True)
            if os.environ.get('MUT_DETAIL'):
                for r in rouges[1:]:
                    print('        ' + r, flush=True)
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
    raise SystemExit(main())
