#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — MILO-SEANCE-01 : le temoin d'unicite (B-CCCLXXXVI) sait-il ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).
Les temoins U8 et U9 sont ROUGES sur le code servi (ils decrivent des defauts non encore
tranches) : le controle ne compte donc que les rouges des AUTRES temoins. Point de depart :
0 rouge hors U8/U9, mesure d'abord.
Usage : python3 tools/mut_seance_unicite.py
"""
import os, shutil, subprocess, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CO = 'coach.js'
GARDE = "  if(last&&last.querySelector('.coach-prog-save'))return true;   // déjà un bouton dessous\n"
MUT = [
    ('X1 rechargement : plus de break, chaque vieille seance recoit sa carte', CO,
     "        break;                 // la PLUS RÉCENTE des séances trouvées, jamais deux boutons\n", "", 'GARDE'),
    ('X2 garde retiree + repli pose AVANT la traduction (double pose)', CO,
     GARDE + "  if(!last){", "  if(!last){", 'GARDE_SI_X2'),
    ('[negatif] commentaire citant break, coach-prog-save, _appendStartSessionBtn', CO,
     "      _cerveletSeance(reply)\n",
     "      // jamais deux cartes : break ; .coach-prog-save ; _appendStartSessionBtn(_filet) une seule fois\n      _cerveletSeance(reply)\n", 'OK'),
]
X2_SUITE = ("      _cerveletSeance(reply)\n", "      _appendStartSessionBtn(_filet, _bulle);\n      _cerveletSeance(reply)\n")


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_seance_unicite.js'], cwd=arbre, capture_output=True, text=True, timeout=900,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:90] for l in out.split('\n') if ('ROUGE' in l or 'PLANTAGE' in l) and 'U8 ' not in l and 'U9 ' not in l]
    return rouges, out


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_su_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf'))
    return tmp, a


def main():
    tmp0, a0 = cloner()
    rouges, out = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE hors U8/U9 — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge hors U8/U9 (point de depart valide)\n')
    conformes = 0
    for nom, fic, avant, apres, attendu in MUT:
        tmp, arbre = cloner()
        cible = os.path.join(arbre, fic); src = open(cible, encoding='utf-8').read()
        if src.count(avant) != 1:
            print('  INVALIDE  %s (ancre %d fois)' % (nom, src.count(avant))); shutil.rmtree(tmp, ignore_errors=True); continue
        src = src.replace(avant, apres, 1)
        if attendu == 'GARDE_SI_X2':
            if src.count(X2_SUITE[0]) != 1:
                print('  INVALIDE  %s (2e ancre)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            src = src.replace(X2_SUITE[0], X2_SUITE[1], 1); attendu = 'GARDE'
        open(cible, 'w', encoding='utf-8').write(src)
        rouges, out = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-72s %-6s %d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    raise SystemExit(main())
