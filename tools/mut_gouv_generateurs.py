#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — CCXXVIII bis (13/10/2026) : le banc `gouv_generateurs` sait-il ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE.
Point de depart : la copie intacte doit etre VERTE. Une mutation GARDE est conforme si le banc rougit (code 1) ; une
mutation OK (commentaire) l'est s'il reste vert. Un PLANTAGE (code 2) n'est jamais un verdict.
Usage : python3 tools/mut_gouv_generateurs.py
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOD = 'tests/parcours/gouv_generateurs.js'
EXCL = "  return /^mut_.*\\.py$/.test(nom) && /copytree/.test(texte);"

MUT = [
    ('M1 reintroduire le faux positif (aucun outil de mutation exclu)',
     [(MOD, EXCL, "  return false;")], 'GARDE'),
    ('M2 vrai defaut de provenance : tools/marques.py n\'est plus declare dans le tableau des sources',
     [('data/sources/README.md', '| `tools/marques.py` |', '| `marques.py` |')], 'GARDE'),
    ('M3 vrai defaut de provenance : un NOUVEAU generateur lit un .xlsx sans etre declare',
     [('tools/gen_nouveau_faux.py', None, "SRC = 'data/sources/nouveau.xlsx'\n")], 'GARDE'),
    ('M4 exclusion trop large (tout script est excuse)',
     [(MOD, EXCL, "  return true;")], 'GARDE'),
    ('M5 exclusion par le seul nom (un mut_*.py qui ecrit dans le depot serait excuse)',
     [(MOD, EXCL, "  return /^mut_.*\\.py$/.test(nom);")], 'GARDE'),
    ('MC1 [negatif] commentaire seulement',
     [(MOD, "function generateursXlsx(fichiers, lire) {", "/* (commentaire de controle) */\nfunction generateursXlsx(fichiers, lire) {")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_gouv_generateurs.js'], cwd=arbre, capture_output=True, text=True, timeout=300)
    out = (r.stdout or '').split('\n')
    last = [l for l in out if ' OK / ' in l]
    rouges = [l.replace('❌ ROUGE ', '').split('  >> ')[0][:80] for l in out if l.startswith('❌ ROUGE')]
    return r.returncode, (last[-1].strip(' ─') if last else (r.stderr or '')[-160:]), rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_gouv_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    tmp0, a0 = cloner()
    rc, res, _ = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rc != 0:
        print('  !! ARBRE SAIN : banc %s (code %d) — controle refuse' % (res, rc)); return 1
    print('  arbre sain : %s (point de depart valide)\n' % res)
    conformes = 0
    for nom, rempl, attendu in MUT:
        tmp, arbre = cloner()
        for f, old, new in rempl:
            p = os.path.join(arbre, f)
            if old is None:                       # un fichier NOUVEAU dans la copie
                if os.path.exists(p):
                    print('  !! FICHIER DEJA PRESENT : %s' % f); shutil.rmtree(tmp, ignore_errors=True); return 1
                open(p, 'w', encoding='utf-8').write(new); continue
            s = open(p, encoding='utf-8').read()
            if s.count(old) != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (s.count(old), nom)); shutil.rmtree(tmp, ignore_errors=True); return 1
            open(p, 'w', encoding='utf-8').write(s.replace(old, new))
        chk = subprocess.run(['node', '--check', os.path.join(arbre, MOD)], capture_output=True)
        if chk.returncode != 0:
            print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        rc, res, rouges = banc(arbre)
        shutil.rmtree(tmp, ignore_errors=True)
        if rc not in (0, 1):
            print('  !! PLANTAGE (pas un verdict) : %s -> %s' % (nom, res)); return 1
        ok = (rc == 1) if attendu == 'GARDE' else (rc == 0)
        conformes += ok
        print('  %s %-86s attendu %-5s -> %s' % ('OK ' if ok else '!! ', nom[:86], attendu, res))
        for l in rouges:
            print('        · ' + l)
    print('\n%d/%d conformes' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    sys.exit(main())
