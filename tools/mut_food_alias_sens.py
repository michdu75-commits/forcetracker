#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-LOT-A (13/10/2026) : le banc `food_alias_sens` sait-il ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE.
Les mutations touchent les GENERATEURS ; la copie est donc REGENEREE (tools/alias.py, tools/marques.py) avant le banc,
comme le ferait la personne qui modifie la table. Un generateur qui REFUSE laisse l'ancienne table en place : c'est
alors le temoin « la copie intacte produit exactement data/*.json » qui doit rougir.
Point de depart : arbre sain regenere = identique au depot, et banc vert. Une mutation GARDE est conforme si le banc
rougit (code 1) ; une mutation OK (commentaire) l'est s'il reste vert. Un PLANTAGE n'est jamais un verdict.
Usage : python3 tools/mut_food_alias_sens.py
"""
import os, shutil, subprocess, sys, tempfile, filecmp

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AL, MQ = 'tools/alias.py', 'tools/marques.py'
XLSX = 'data/sources/Base_Fast_Food_France_Force_Tracker_2.xlsx'

MUT = [
    ('M1 retablir « confiture » -> Confiture de lait (31040)',
     [(AL, "    'confiture':                (30999,", "    'confiture':                (31040,")], 'GARDE'),
    ('M2 desactiver le controle semantique du generateur',
     [(AL, "    refus, blanchis, inutiles = controle_semantique(out, brut, base)\n",
           "    refus, blanchis, inutiles = [], [], []\n")], 'GARDE'),
    ('M3 une mauvaise cle non blanchie passe en silence (le refus n\'arrete plus la generation)',
     [(AL, "            print(f'   · « {a} » → {c} {lib}\\n     alors que {c2} « {lib2} » porte tous ses mots ({n} aliment(s))')\n        sys.exit(1)\n",
           "            print(f'   · « {a} » → {c} {lib}\\n     alors que {c2} « {lib2} » porte tous ses mots ({n} aliment(s))')\n")], 'GARDE'),
    ('M4 supprimer le controle Quick des valeurs copiees',
     [(MQ, "    copies = [g for g in par_valeurs.values() if len({(a[0], a[1]) for a in g}) > 1]\n",
           "    copies = []\n")], 'GARDE'),
    ('M5 remettre « gruyere » -> Emmental (12115)',
     [(AL, "    'gruyere':                  (12114,", "    'gruyere':                  (12115,")], 'GARDE'),
    ('M6 retirer le doute du Double Cheeseburger Bacon',
     [(MQ, "    ('Quick', 'Double Cheeseburger Bacon'): 'portion suspecte dans la source : 996 g, 3 fois celle du Double Cheeseburger',\n", "")], 'GARDE'),
    ('MC1 [negatif] commentaire seulement',
     [(AL, "def controle_semantique(out, brut, base):\n", "# (commentaire de controle)\ndef controle_semantique(out, brut, base):\n")], 'OK'),
]


def regenerer(arbre):
    a = subprocess.run(['python3', AL], cwd=arbre, capture_output=True, text=True, timeout=300)
    m = subprocess.run(['python3', MQ, XLSX], cwd=arbre, capture_output=True, text=True, timeout=300)
    return a.returncode, m.returncode


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_food_alias_sens.js'], cwd=arbre, capture_output=True, text=True, timeout=900)
    last = [l for l in (r.stdout or '').split('\n') if ' OK / ' in l]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:])


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_las_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    tmp0, a0 = cloner()
    ra, rm = regenerer(a0)
    ident = all(filecmp.cmp(os.path.join(a0, f), os.path.join(SRC, f), shallow=False) for f in ('data/alias.json', 'data/marques.json'))
    rc, res = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if ra or rm or not ident or rc != 0:
        print('  !! ARBRE SAIN : regeneration %s/%s, identique=%s, banc %s — controle refuse' % (ra, rm, ident, res)); return 1
    print('  arbre sain : regenere a l\'identique, %s (point de depart valide)\n' % res)
    conformes = 0
    for nom, rempl, attendu in MUT:
        tmp, arbre = cloner()
        for f, old, new in rempl:
            p = os.path.join(arbre, f)
            s = open(p, encoding='utf-8').read()
            if s.count(old) != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (s.count(old), nom)); shutil.rmtree(tmp, ignore_errors=True); return 1
            open(p, 'w', encoding='utf-8').write(s.replace(old, new))
            chk = subprocess.run(['python3', '-c', 'import ast,sys;ast.parse(open(sys.argv[1]).read())', p], capture_output=True)
            if chk.returncode != 0:
                print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        ra, rm = regenerer(arbre)
        rc, res = banc(arbre)
        shutil.rmtree(tmp, ignore_errors=True)
        if rc not in (0, 1):
            print('  !! PLANTAGE (pas un verdict) : %s -> %s' % (nom, res)); return 1
        ok = (rc == 1) if attendu == 'GARDE' else (rc == 0)
        conformes += ok
        print('  %s %-78s attendu %-5s -> gen %s/%s, %s' % ('OK ' if ok else '!! ', nom[:78], attendu, ra, rm, res))
    print('\n%d/%d conformes' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    sys.exit(main())
