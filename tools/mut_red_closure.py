#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-VARIANTS-03-RED-CLOSURE (R1, 13/10/2026) : le banc sait-il ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE.
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
Une mutation GARDE est conforme si le banc `tools/banc_food_variants.js` rougit (code 1) ;
une mutation OK (commentaire) est conforme s'il reste vert. Un PLANTAGE n'est jamais un verdict.
Usage : python3 tools/mut_red_closure.py
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = 'app.js'
GARDE = "      if(!r || (r!==true && !we.includes(r.t))) return null;"
CHEMIN = "const r=we.some(x=>x===mots[k] || _fsSing(x)===_fsSing(mots[k])) || _afMotDansNom(mots[k], n);"

MUT = [
    ('M1 la garde « mot entier » de VARIANTS-03 telle qu\'avant (chemin pates ferme : R1 reintroduit)',
     [(A, CHEMIN, "const r=we.some(x=>x===mots[k] || _fsSing(x)===_fsSing(mots[k]));")], 'GARDE'),
    ('M2 ce que _afMotDansNom trouve est accepte SANS exiger un mot entier (la garde V03 tombe : cola -> chocolat)',
     [(A, GARDE, "      if(!r) return null;")], 'GARDE'),
    ('M3 « zéro » redevient « édulcorants » (comportement d\'avant D-061 ① : le cola sucré revient sous le zéro)',
     [(A, "'zero':['0%','sans sucres'],", "'zero':['edulcorants'],")], 'GARDE'),
    ('MC1 [negatif] commentaire seulement', [(A, GARDE, "      /* garde : mot entier */\n" + GARDE)], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_food_variants.js'], cwd=arbre, capture_output=True, text=True, timeout=1500)
    last = [l for l in (r.stdout or '').split('\n') if ' OK / ' in l]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:])


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_rc_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    tmp0, a0 = cloner()
    rc, res = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rc != 0:
        print('  !! ARBRE SAIN DEJA ROUGE OU PLANTE — controle refuse :', res); return 1
    print('  arbre sain : %s (point de depart valide)\n' % res)
    conformes = 0
    for nom, rempl, attendu in MUT:
        tmp, arbre = cloner()
        for f, old, new in rempl:
            p = os.path.join(arbre, f)
            s = open(p, encoding='utf-8').read()
            if s.count(old) != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (s.count(old), nom)); shutil.rmtree(tmp, ignore_errors=True); return 1
            open(p, 'w', encoding='utf-8').write(s.replace(old, new))
        chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync('app.js','utf8'))"], cwd=arbre, capture_output=True)
        if chk.returncode != 0:
            print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        rc, res = banc(arbre)
        shutil.rmtree(tmp, ignore_errors=True)
        ok = (rc == 1) if attendu == 'GARDE' else (rc == 0)
        conformes += ok
        print('  %s %-80s attendu %-5s -> %s' % ('OK ' if ok else '!! ', nom[:80], attendu, res))
    print('\n%d/%d conformes' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    sys.exit(main())
