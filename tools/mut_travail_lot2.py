#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — LOT 2 (session-B) : les temoins B-CCCXCV / B-CCCXCVI savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
M00 remet log.js tel qu'il etait AVANT le lot 2 (master e1dcb91c, ft-v1239), mot pour mot.
M01 = le cardio (apres) ignore · M02 = l'echauffement (avant) ignore · M03 = exercice sans serie classe TRAVAIL.
Usage : python3 tools/mut_travail_lot2.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges, pas seulement le premier)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'e1dcb91c71641a403d48192a7efd80924f6dc16a'
CO, LO = 'coach.js', 'log.js'

CARDIO = "  if(_cardioNoteMin()>0 || exs.some(e=>e&&(e.sets||[]).some(s=>s&&s.done))) return 'TRAVAIL';\n"
PREP = "  return exs.length?'PREPARATION':'RIEN';\n"
PORTE_MILO = "  const active=_etatTravailWkt()!=='RIEN';\n"
TAP = "  return _etatTravailWkt()==='TRAVAIL';\n"
MSG = "  if(min>0) perdu.push(min+' min de cardio / échauffement');\n"
REPLACE = "    S.wkt.exs=newExs;\n    if(data.label)S.wkt.progLabel=data.label;\n"
LOADPROG = "  if(_travailAPerdre() && !(prog.days&&prog.days.length)){\n"

MUT = [
    ('M00 code d\'AVANT le lot 2 remis mot pour mot (log.js de e1dcb91c)', 'AVANT', 'GARDE'),
    ('M01 la nouvelle fonction ignore le CARDIO (apres)',
     [(LO, CARDIO, CARDIO.replace('_cardioNoteMin()>0', '(+S.wkt.cardioAvant?.duration||0)>0'))], 'GARDE'),
    ('M02 la nouvelle fonction ignore l\'ECHAUFFEMENT (avant)',
     [(LO, CARDIO, CARDIO.replace('_cardioNoteMin()>0', '(+S.wkt.cardio?.duration||0)>0'))], 'GARDE'),
    ('M03 exercice sans serie classe TRAVAIL partout', [(LO, PREP, "  return exs.length?'TRAVAIL':'RIEN';\n")], 'GARDE'),
    ('M04 [deguisee] le cardio compte par la PRESENCE de l\'objet (ligne fantome a 0 min)',
     [(LO, CARDIO, CARDIO.replace('_cardioNoteMin()>0', '!!(S.wkt.cardio||S.wkt.cardioAvant)'))], 'GARDE'),
    ('M05 la porte de Milo relit les seuls exercices (F01 rouvert)',
     [(LO, PORTE_MILO, "  const active=S.wkt&&Array.isArray(S.wkt.exs)&&S.wkt.exs.length;\n")], 'GARDE'),
    ('M06 le programme recompte les seules series faites (F02 rouvert)',
     [(LO, TAP, "  return (S.wkt&&S.wkt.exs||[]).reduce((n,e)=>n+((e&&e.sets||[]).filter(s=>s&&s.done).length),0);\n")], 'GARDE'),
    ('M07 la confirmation ne nomme plus les minutes de cardio', [(LO, MSG, '')], 'GARDE'),
    ('M08 [deguisee] « Remplacer » chez Milo jette le cardio (la question promet le contraire)',
     [(LO, REPLACE, REPLACE + "    S.wkt.cardio=null;S.wkt.cardioAvant=null;\n")], 'GARDE'),
    ('M09 [deguisee] le programme confirme aussi une PREPARATION (regle ft-v1099 cassee)',
     [(LO, LOADPROG, "  if(_etatTravailWkt()!=='RIEN' && !(prog.days&&prog.days.length)){\n")], 'GARDE'),
    ('[negatif] commentaire citant tous les mots cherches',
     [(LO, PORTE_MILO, "  // const active=S.wkt&&Array.isArray(S.wkt.exs)&&S.wkt.exs.length; _etatTravailWkt _cardioNoteMin()>0 .done\n" + PORTE_MILO)], 'OK'),
]

def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_travail_lot2.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:110] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_lot2_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = {f: subprocess.run(['git', 'show', AVANT + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in (CO, LO)}
    avant[CO] = open(os.path.join(SRC, CO), encoding='utf-8').read()   # coach.js hors lot : on ne remet que log.js
    tmp0, a0 = cloner()
    rouges = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide)\n')
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        tmp, arbre = cloner()
        if remplacements == 'AVANT':
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in (CO, LO)}
            if not avant[LO] or avant[LO] == cur[LO]:
                print('  INVALIDE  %s (code d\'avant introuvable ou identique)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in (CO, LO):
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(avant[f])
        else:
            srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in (CO, LO)}
            invalide = []
            for f, av, ap in remplacements:
                if srcs[f].count(av) != 1:
                    invalide.append('%s:%s' % (f, av[:50]))
                else:
                    srcs[f] = srcs[f].replace(av, ap, 1)
            if invalide:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in (CO, LO):
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-100s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges[1:]:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
