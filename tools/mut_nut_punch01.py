#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — LOT 0 / NUT-PUNCH-01 (03/10/2026, session-B ; etendu le 14/10/2026, session-A) :
les temoins du CONTRAT savent-ils ROUGIR, et les OBSERVATIONS savent-elles se LEVER sans rougir ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais
     le comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord (pour la partie du banc concernee).
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE (conduit dans la page) rougit.
     Un rouge des seuls temoins de SOURCE (« B-NP01-x source ») ne suffit pas.
  MA* = contrat Seance -> Nutrition (B-NP01-A) : attendu GARDE (au moins un temoin EXECUTE rougit)
  MO* = OBSERVATION changee volontairement : attendu LEVEE:Ox — AUCUN rouge, et la ligne
        « LEVEE — A RECLASSER Ox » imprimee (une observation n'est jamais rouge, LOT 0 = contrat)
  [negatif] = commentaire seul (doit rester vert, sans aucune observation levee)
[!!] Point de depart : l'arbre sain doit donner 0 rouge ET 0 observation levee.
Usage : python3 tools/mut_nut_punch01.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ST, LO, SC, AP, TR, IX = 'state.js', 'log.js', 'screens.js', 'app.js', 'tracking.js', 'index.html'
FICHIERS = (ST, LO, SC, AP, TR, IX)

TDEE = "  return Math.round(calcBMR()*S.activityLevel+calcWorkExtra()+calcSportExtra()+calcPasExtra(refTs));\n"
_DU_JOUR = "(S.sessions||[]).filter(s=>s&&s.date===today())"
START = "  if(!ouverte) S.wkt={date:today(),exs:[],startHour:new Date().getHours()};\n"
ENCOURS = "    if(S.wkt && S.wkt.date===t) return {seance:true, heure:_heureSeance(S.wkt), source:'encours'};\n"
HONORE = "    if(lastDate&&lastDate>=np.date)return null;   // annonce honorée : la séance a été faite\n"
FIN_PR = "  const _oldPrs={};Object.keys(S.prs||{}).forEach(k=>{_oldPrs[k]={...S.prs[k]};});\n"
CARDIO_FIN = "  if(S.wkt?.cardio?.duration) sess.cardio={...S.wkt.cardio};\n"
MIGR = "      (S.sessions||[]).forEach(sess=>(sess.exs||sess.exercises||[]).forEach(ex=>(ex.sets||[]).forEach(_migSet)));\n"
MIGR_FLAG = "    if(!localStorage.getItem('ft4_stmig1')){\n"
ANNUL = "    stopRest();\n    S.wkt=null;\n    try{localStorage.setItem('ft4_wkt','null');"
RENDER = "function renderLog(){\n  if(!S.wkt) S.wkt={date:today(),exs:[]};\n"
REPOS = "    return {seance:false, heure:null, source:'repos'};\n  }catch(e){"
REGION = "      ? _facteurRegion((S.sessions||[]).find(s=>s&&s.date===t)||S.wkt||null)"
COMPTE = "    if(wk>=0&&wk<nWeeks)counts[wk]++;\n"

# (nom, remplacements, attendu, partie du banc)
MUT = [
    ('MA1 la DUREE de la seance du jour entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+" + _DU_JOUR + ".reduce((a,s)=>a+Math.round((s.duration||0)/60),0));"))], 'GARDE', 'contrat'),
    ('MA2 la METHODE (superset) entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+(" + _DU_JOUR + ".some(s=>(s.exs||[]).some(e=>e&&e.group))?50:0));"))], 'GARDE', 'contrat'),
    ('MA3 le VOLUME de la seance du jour entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+" + _DU_JOUR + ".reduce((a,s)=>a+Math.round((s.volume||0)/500),0));"))], 'GARDE', 'contrat'),
    ('MA4 la DISCIPLINE entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+(S.discipline==='powerlifting'?100:0));"))], 'GARDE', 'contrat'),
    ('MA5 le NIVEAU entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+(S.level==='confirme'?80:0));"))], 'GARDE', 'contrat'),
    ('MA6 la seance est datee en UTC au lieu du jour local',
     [(LO, START, START.replace("date:today()", "date:new Date().toISOString().slice(0,10)"))], 'GARDE', 'contrat'),
    ('MA7 la fin de seance efface les codes de serie (tout devient N)',
     [(LO, FIN_PR, "  sess.exs.forEach(e=>(e.sets||[]).forEach(x=>{x.type='N';}));\n" + FIN_PR)], 'GARDE', 'contrat'),
    ('MA8 la seance EN COURS n\'est plus un jour de seance',
     [(ST, ENCOURS, "")], 'GARDE', 'contrat'),
    ('MA9 une annonce n\'est jamais honoree par la seance faite',
     [(ST, HONORE, "")], 'GARDE', 'contrat'),
    ('MA10 la fin de seance perd le cardio APRES',
     [(LO, CARDIO_FIN, "")], 'GARDE', 'contrat'),
    ('MA11 la migration des anciens codes retire les series D',
     [(ST, MIGR, MIGR.replace("(ex.sets||[]).forEach(_migSet)", "(ex.sets=(ex.sets||[]).filter(x=>x.type!=='D')).forEach(_migSet)"))], 'GARDE', 'contrat'),
    ('MA12 une seance ANNULEE est enregistree dans l historique',
     [(LO, ANNUL, ANNUL.replace("    S.wkt=null;", "    if(S.wkt&&S.wkt.exs&&S.wkt.exs.length)S.sessions.unshift(Object.assign({},S.wkt,{ts:Date.now()}));\n    S.wkt=null;"))], 'GARDE', 'contrat'),
    ('MA13 afficher l ecran Seance ajoute une seance a l historique',
     [(LO, RENDER, RENDER.replace("exs:[]};\n", "exs:[]};\n  if(!(S.sessions||[]).some(x=>x&&x.date===today()))S.sessions.unshift({date:today(),ts:Date.now(),exs:[]});\n"))], 'GARDE', 'contrat'),
    ('MO1 la PREMIERE seance du jour donne la region (au lieu de la derniere)',
     [(ST, REGION, REGION.replace("(S.sessions||[]).find(s=>s&&s.date===t)", "(S.sessions||[]).filter(s=>s&&s.date===t).pop()"))], 'LEVEE:O1,O3', 'contrat'),
    ('MO2 le compteur de seances compte des JOURS distincts',
     [(TR, COMPTE, "    if(wk>=0&&wk<nWeeks&&!(counts['_'+ds]))counts[wk]++;\n    counts['_'+ds]=1;\n")], 'LEVEE:O2', 'contrat'),
    ('MO6 un programme actif fait un jour de seance meme sans annonce',
     [(ST, REPOS, "    if((S.programmes||[]).some(p=>{const q=progPeriode(p);return q&&q.start<=t&&t<=q.end;})) return {seance:true, heure:null, source:'annoncee'};\n" + REPOS)], 'LEVEE:O6', 'contrat'),
    ('MO8 la migration des anciens codes se rejoue a chaque chargement',
     [(ST, MIGR_FLAG, "    if(true){\n")], 'LEVEE:O8', 'contrat'),
    ('MO9 annuler la seance retire aussi l annonce du jour',
     [(LO, ANNUL, ANNUL.replace("    S.wkt=null;", "    S.wkt=null;S.nextPlanned=null;"))], 'LEVEE:O9', 'contrat'),
    ('MO10 (le futur LOT B) « en cours » suit la definition _seanceOuverte',
     [(ST, ENCOURS, ENCOURS.replace("S.wkt.date===t)", "S.wkt.date===t && _seanceOuverte())"))], 'LEVEE:O9,O10', 'contrat'),
    ('[negatif] commentaire citant la duree et le volume dans calcTDEE',
     [(ST, TDEE, "  // (duree, volume, methode : jamais dans la depense)\n" + TDEE)], 'OK', 'contrat'),
]


def banc(arbre, partie):
    env = dict(os.environ, TZ='Europe/Paris')
    r = subprocess.run(['node', 'tools/banc_nut_punch01.js', partie], cwd=arbre, capture_output=True, text=True, timeout=1200, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:170] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    levees = sorted(set(re.findall(r'LEVÉE — À RECLASSER (O\d+)', out)))
    return rouges, levees


def executes(rouges):
    return [x for x in rouges if re.match(r'❌ ROUGE B-NP01-[A-F] (?!source)', x) or x.startswith('PLANTAGE')]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_nut_punch01_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    choisies = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    parties = sorted(set(m[3] for m in choisies))
    for p in parties:
        tmp0, a0 = cloner()
        rouges, levees = banc(a0, p)
        shutil.rmtree(tmp0, ignore_errors=True)
        if rouges or levees:
            print('  !! ARBRE SAIN DEJA ROUGE OU OBSERVATION DEJA LEVEE (partie %s) — controle refuse :' % p, rouges[:3], levees); return 1
        print('  arbre sain, partie %s : 0 rouge, 0 observation levee (point de depart valide)' % p)
    print()
    conformes = total = 0
    for nom, remplacements, attendu, partie in choisies:
        total += 1
        tmp, arbre = cloner()
        srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
        invalide = []
        for f, av, ap in remplacements:
            if srcs[f].count(av) != 1:
                invalide.append('%s:%s (x%d)' % (f, av[:50], srcs[f].count(av)))
            else:
                srcs[f] = srcs[f].replace(av, ap, 1)
        if invalide:
            print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        for f in FICHIERS:
            open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges, levees = banc(arbre, partie)
        ex = executes(rouges)
        obtenu = 'GARDE' if ex else ('SOURCE' if rouges else ('LEVEE:' + ','.join(levees) if levees else 'OK'))
        if attendu.startswith('LEVEE:'):
            # une observation levee ne doit JAMAIS rougir, et les observations attendues doivent etre levees
            ok = not rouges and set(attendu[6:].split(',')) <= set(levees)
        else:
            ok = obtenu == attendu
        conformes += ok
        montre = (ex or rouges or [''])[0]
        print('  %s  DANS LA COPIE MUTEE — %-66s %-14s %2d rouge(s), %2d execute(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(ex), montre))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                if r != montre:
                    print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
