#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — IMPORT-P0-2 (session-B, 11/10/2026) : les temoins B-P02 savent-ils ROUGIR ?

Le lot change trois VALEURS d'alias de `_EX_EQUIV` (log.js) : « triceps pushdown », « cable triceps pushdown » et
« extension triceps poulie » visaient « Extension Triceps » (l'extension a l'haltere), ils visent « Triceps Poulie ».
Les mutations sont celles du brief (M1 → M7), plus trois facons de contaminer l'historique (M6a/b/c) : la
pre-saisie (getPrev), le nom ecrit par l'import d'historique (_vmMatchHist) et le record (finalImportHist).
[!!] Chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60). Une mutation qui casse la
SYNTAXE est refusee, et un rouge qui n'est QU'un plantage ou une erreur de page ne compte pas : il faut au moins
un temoin semantique (B-P02-A / P / H, ou un temoin d'IMPORT-MAP-02). M00 = le log.js de master 7d7bb5a8.
Usage : python3 tools/mut_p02_triceps.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG = 'log.js'
BASE_AVANT = '7d7bb5a8'     # master avant IMPORT-P0-2
BANCS = ['tools/banc_p02_triceps.js', 'tools/banc_import_map2.js']

A_TP = "'triceps pushdown':'Triceps Poulie',"
A_CTP = "'cable triceps pushdown':'Triceps Poulie',"
A_ETP = "'extension triceps poulie':'Triceps Poulie',"
CORDE = "'push down':'Triceps Poulie','tri rope':'Triceps Corde Poulie',"
PREV = "function getPrev(name){\n"
VMH = ("  (_histExtracted.sessions||[]).forEach(sess=>(sess.exercises||[]).forEach(ex=>{\n"
       "    if(!ex||!ex.name)return;\n"
       "    delete ex._vmFrom; delete ex._vmSuggest; delete ex._vmConf;\n"
       "    let r; try{ r=_matchExercise(ex.name); }catch(e){ return; }\n"
       "    if(!r||!r.match||r.match===ex.name)return;\n"
       "    if(r.tier==='auto'){ ex._vmFrom=ex.name; ex._vmConf=r.confidence; ex.name=r.match; }\n")
PR = ("        const cur=S.prs[ex.name];\n"
      "        if(!cur||rm>cur.rm1)S.prs[ex.name]={kg:s.kg,reps:s.reps,rm1:rm,date:sess.date};\n")
COMM = "/* ⛔ IMPORT-P0-2 (11/10/2026) : ces trois clés visaient « Extension Triceps »"

MUT = [
    ("M00 le code d'AVANT (log.js de master 7d7bb5a8)", 'AVANT', 'GARDE'),
    ('M1 « triceps pushdown » remis vers Extension Triceps', [(A_TP, "'triceps pushdown':'Extension Triceps',")], 'GARDE'),
    ('M2 « cable triceps pushdown » remis vers Extension Triceps', [(A_CTP, "'cable triceps pushdown':'Extension Triceps',")], 'GARDE'),
    ('M3 « extension triceps poulie » remis vers Extension Triceps', [(A_ETP, "'extension triceps poulie':'Extension Triceps',")], 'GARDE'),
    ('M4 « triceps pushdown » envoye vers Triceps Corde Poulie', [(A_TP, "'triceps pushdown':'Triceps Corde Poulie',")], 'GARDE'),
    ('M5 « triceps corde » envoye vers Triceps Poulie (alias ajoute)', [(CORDE, "'triceps corde':'Triceps Poulie'," + CORDE)], 'GARDE'),
    ("M6a la pre-saisie de Triceps Poulie lit l'historique d'Extension Triceps (getPrev)",
     [(PREV, PREV + "  if(name==='Triceps Poulie')name='Extension Triceps';\n")], 'GARDE'),
    ("M6b l'import d'historique ecrit un pushdown sous Extension Triceps (_vmMatchHist)",
     [(VMH, VMH.replace("ex.name=r.match; }", "ex.name=(r.match==='Triceps Poulie'&&/push ?down|poulie/i.test(ex._vmFrom))?'Extension Triceps':r.match; }"))], 'GARDE'),
    ("M6c le record importe d'un pushdown monte sur Extension Triceps (finalImportHist)",
     [(PR, "        const _n=ex.name==='Triceps Poulie'?'Extension Triceps':ex.name; const cur=S.prs[_n];\n"
           "        if(!cur||rm>cur.rm1)S.prs[_n]={kg:s.kg,reps:s.reps,rm1:rm,date:sess.date};\n")], 'GARDE'),
    ('M7 (temoin de controle) un COMMENTAIRE modifie : les bancs doivent rester VERTS',
     [(COMM, "/* ⛔ IMPORT-P0-2 (11/10/2026, controle) : ces trois clés visaient « Extension Triceps »")], 'OK'),
]

NON_SEMANTIQUE = ('PLANTAGE', 'B-P02-∅', 'IMAP2-∅')   # plantage, erreur de page : ne prouvent rien


def banc(arbre):
    rouges = []
    for b in BANCS:
        r = subprocess.run(['node', b], cwd=arbre, capture_output=True, text=True, timeout=1800, env=dict(os.environ, TZ='Europe/Paris'))
        out = r.stdout + r.stderr
        rg = [os.path.basename(b)[5:-3] + ' · ' + l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
        if r.returncode not in (0, 1) and not rg:
            rg = ['%s · PLANTAGE (code %d)' % (b, r.returncode)]
        rouges += rg
    return rouges


def semantique(rouges):
    return [r for r in rouges if not any(k in r for k in NON_SEMANTIQUE)]


def syntaxe_ok(chemin):
    r = subprocess.run(['node', '-e', "new (require('vm').Script)(require('fs').readFileSync(process.argv[1],'utf8'))", chemin],
                       capture_output=True, text=True)
    return r.returncode == 0


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_p02_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = subprocess.run(['git', 'show', BASE_AVANT + ':' + LOG], cwd=SRC, capture_output=True, text=True).stdout
    tmp0, a0 = cloner()
    rouges = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge — point de depart valide\n')
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        tmp, arbre = cloner()
        cible = os.path.join(arbre, LOG); src = open(cible, encoding='utf-8').read()
        if remplacements == 'AVANT':
            if not avant or avant == src:
                print("  INVALIDE  %s (code d'avant introuvable ou identique)" % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            src = avant
        else:
            invalide = ['%s (x%d)' % (av[:50], src.count(av)) for av, _ in remplacements if src.count(av) != 1]
            if invalide:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            if any(av == ap for av, ap in remplacements):
                print('  INVALIDE  %s (remplacement identique)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            for av, ap in remplacements:
                src = src.replace(av, ap, 1)
        open(cible, 'w', encoding='utf-8').write(src)
        if not syntaxe_ok(cible):
            print('  INVALIDE  %s (syntaxe cassée par la mutation)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
        rouges = banc(arbre)
        sem = semantique(rouges)
        obtenu = 'GARDE' if sem else ('PLANTE' if rouges else 'OK')
        ok = obtenu == attendu
        conformes += ok
        print('  %s  %-84s %-6s %2d rouge(s), %2d semantique(s)  %s' % ('OK ' if ok else '!! ', nom[:84], obtenu, len(rouges), len(sem), sem[0] if sem else (rouges[0] if rouges else '')))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
