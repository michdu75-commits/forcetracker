#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-JOURNAL-QTY-GUARD-01 (LOT-C, 13/10/2026) : le banc sait-il ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE.
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
Une mutation GARDE est conforme si le banc `tools/banc_journal_qty_guard.js` rougit (code 1) ;
une mutation OK (commentaire) est conforme s'il reste vert. Un PLANTAGE n'est jamais un verdict.
Usage : python3 tools/mut_journal_qty_guard.py
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = 'app.js'
AJOUT = "&& !(_bcQtyPose && numFR((document.getElementById('af-bc-grams')||{}).value)>0)){"
MODIF = "if(gEl && !(numFR(gEl.value)>0)){"

MUT = [
    ('M1 garde d\'ajout ramenee au seul drapeau `_bcQtyPose` (le code d\'avant)', [(A, AJOUT, "&& !_bcQtyPose){")], 'GARDE'),
    ('M2 garde de modification neutralisee', [(A, MODIF, "if(false && gEl){")], 'GARDE'),
    ('M3 l\'ajout accepte de nouveau 0 (`>0` devient `>=0`)', [(A, AJOUT, AJOUT.replace('>0)){', '>=0)){'))], 'GARDE'),
    ('M4 la modification n\'exclut que le negatif (`<=0` devient `<0`, vide et 0 passent)', [(A, MODIF, "if(gEl && numFR(gEl.value)<0){")], 'GARDE'),
    ('M5 garde d\'ajout trop large : refuse aussi une quantite valide', [(A, AJOUT, "){")], 'GARDE'),
    ('MC1 [negatif] commentaire seulement', [(A, MODIF, "/* garde : vide, 0, illisible */ " + MODIF)], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_journal_qty_guard.js'], cwd=arbre, capture_output=True, text=True, timeout=600)
    last = [l for l in (r.stdout or '').split('\n') if ' OK / ' in l]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:])


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_jqg_')
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
