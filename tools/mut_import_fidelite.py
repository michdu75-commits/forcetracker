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
FICHIERS = ('constants.js', 'log.js', 'index.html', 'style.css')
LO, CO, IX = 'log.js', 'constants.js', 'index.html'

MUT = [
    # ── la LECTURE d'un repos écrit (constants.js) ──
    ('M01 le pluriel « mins » n\'est plus lu (« 3 mins » → 0, le défaut mesuré sur le programme de septembre)',
     [(CO, "  if((m=s.match(/^(\\d+)\\s*(?:minutes?|mins?|mns?|m)\\.?$/))) return {sec:(+m[1])*60,u:'m'};",
           "  if((m=s.match(/^(\\d+)\\s*(?:minutes?|min|mn|m)\\.?$/))) return {sec:(+m[1])*60,u:'m'};")], 'GARDE'),
    ('M02 « 1.30 » se lit « 1,3 minute » (78 s) au lieu de 1 min 30',
     [(CO, "    if(m[2].length===2&&+m[2]<60) return {sec:(+m[1])*60+(+m[2]),u:'m'};      // 1.30 = 1 min 30\n", "")], 'GARDE'),
    ('M03 une PLAGE devient un repos chiffré (la borne basse est INVENTÉE comme durée)',
     [(CO, "if(d&&g&&g.sec>0&&d.sec>g.sec&&d.sec<=3600) return {sec:0,min:g.sec,max:d.sec,txt};", "if(d&&g&&g.sec>0&&d.sec>g.sec&&d.sec<=3600) return {sec:g.sec,min:g.sec,max:d.sec,txt};")], 'GARDE'),
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
    ('M12 « Squat » / « Squat Bulgare » : les mêmes mots n\'exigent plus d\'être identiques (le nom prolongé sans séparateur est proposé)',
     [(LO, "  const memesMots=!!mots(na)&&mots(na)===mots(nb);", "  const memesMots=!!mots(na)&&mots(nb).indexOf(mots(na))===0;")], 'GARDE'),
    ('M13 la preuve d\'échauffement par la note revient à l\'ancien motif (« Monté en charge », « Série de chauffe » ne comptent plus)',
     [(LO, "  return /^(ech\\b|echauff|warm[\\s-]?up|montee\\b|mont[e]{1,2}s? en charge|series? (longues? )?(de |d.)?e?chauff|chauffe\\b)/.test(",
           "  return /^(ech\\b|echauff|warm[\\s-]?up|montee\\b|series? d.?echauff)/.test(")], 'GARDE'),
    ('M14 deux jours « Semaine A » / « Semaine B » de même numéro sont de nouveau collés en une séance',
     [(LO, " && !(_va&&_vb&&_va!==_vb)){", "){")], 'GARDE'),
    ('M15 la proposition n\'est plus MARQUÉE (aucune carte ne la porte)',
     [(LO, "          ech._propGrp=pid; ech._propRole='ech'; nxt._propGrp=pid; nxt._propRole='travail'; props++;", "          props++;")], 'GARDE'),
    ('M16 « Regrouper » ne regroupe rien (les deux exercices sont remis tels quels)',
     [(LO, "  day.exercises.splice(ei-1,2,m);", "  day.exercises.splice(ei-1,2,prev,ex);")], 'GARDE'),
    ('M17 le type « É » d\'une série structurée n\'est plus traduit (les échauffements deviennent des séries normales)',
     [(LO, "  return v==='W' ? 'É' : (ex.setType||'N');          // 'W' est le mot du backend", "  return (ex.setType||'N');          // 'W' est le mot du backend")], 'GARDE'),
    # ── le CHRONO ──
    ('M18 le dropset importé n\'enchaîne plus : un repos entier ENTRE deux paliers',
     [(LO, "const _dsImporte=(!_exD.dropset&&set.type==='D'", "const _dsImporte=(false&&set.type==='D'")], 'GARDE'),
    ('M19 le repos de l\'exercice vaut pour CHAQUE palier d\'un dropset (pas seulement le dernier)',
     [(LO, "  if((ex.setType||'N')==='D'&&!proprio&&si<n-1)return null;\n", "")], 'GARDE'),
    ('M20 la consigne de plage n\'est plus montrée au démarrage du repos',
     [(LO, "  _restConsigneMontrer();        // IMPORT-IA-FIDELITE-01 : la consigne écrite (une plage) de la série dont le repos démarre\n", "")], 'GARDE'),
    ('M21 la consigne est montrée MÊME quand un repos chiffré a été choisi (contradiction à l\'écran)',
     [(LO, "    if(set&&!(set.rest>0)&&set.restTxt){ const r=_reposLire(set.restTxt);", "    if(set&&set.restTxt){ const r=_reposLire(set.restTxt);")], 'GARDE'),
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
