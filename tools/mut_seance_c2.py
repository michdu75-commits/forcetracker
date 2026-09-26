#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — MILO-SEANCE-03 / C2 : les temoins B-CCCLXXXIX / B-CCCXC savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
M01 remet coach.js tel qu'il est dans le dernier commit (le code d'AVANT C2), mot pour mot.
Usage : python3 tools/mut_seance_c2.py [PREFIXE]
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CO = 'coach.js'
G_BTN = "  if(last.querySelector('.coach-seance-carte'))return true;   // déjà une carte séance dessous\n"
C_BTN = "  wrap.className='coach-prog-save coach-seance-carte';   // C2 : la marque que lit la garde d'unicité\n"
G_Q = "    if(last.querySelector('.coach-seance-carte'))return false;     // déjà une carte séance dessous (C2)\n"
C_Q = "    wrap.className='coach-prog-save coach-seance-carte';\n    wrap.innerHTML=_carteSeanceHtml(lbl,'_construireSeanceAuTap("
C_MEM = "  wrap.className='coach-prog-save';\n  wrap.innerHTML=fresh.map("
ANCIENNE_POS = "  if(last&&!msgs.contains(last))last=null;          // bulle disparue (fil vidé) → on renonce\n"

MUT = [
    ('M01 code d\'AVANT C2 remis mot pour mot (coach.js du dernier commit)', 'AVANT', 'GARDE'),
    ('M02 garde large remise dans _appendStartSessionBtn', [(G_BTN, G_BTN.replace('.coach-seance-carte', '.coach-prog-save'))], 'GARDE'),
    ('M03 garde large remise dans _appendSeanceQuestion', [(G_Q, G_Q.replace('.coach-seance-carte', '.coach-prog-save'))], 'GARDE'),
    ('M04 garde d\'unicite supprimee dans _appendStartSessionBtn', [(G_BTN, '')], 'GARDE'),
    ('M05 la carte seance ne porte plus la marque (la garde ne la reconnait plus)', [(C_BTN, "  wrap.className='coach-prog-save';\n")], 'GARDE'),
    ('M06 la question « on demarre ? » ne porte plus la marque', [(C_Q, C_Q.replace(' coach-seance-carte', ''))], 'GARDE'),
    ('M07 la carte memoire porte la marque (elle bloque de nouveau)', [(C_MEM, C_MEM.replace("'coach-prog-save'", "'coach-prog-save coach-seance-carte'"))], 'GARDE'),
    ('M08 garde remise a l\'ancienne place (seulement avec cible)', [(G_BTN, ''), (ANCIENNE_POS, ANCIENNE_POS + "  if(last&&last.querySelector('.coach-seance-carte'))return true;\n")], 'GARDE'),
    ('M09 [deguisee] selecteur union : cartes seance OU toute carte', [(G_BTN, G_BTN.replace("'.coach-seance-carte'", "'.coach-seance-carte, .coach-prog-save'"))], 'GARDE'),
    ('M10 [deguisee] la garde lit `cible` au lieu de la bulle choisie', [(G_BTN, G_BTN.replace('if(last.querySelector', 'if(cible&&cible.querySelector'))], 'GARDE'),
    ('M11 [deguisee] la garde laisse passer une 2e carte (rend false)', [(G_BTN, G_BTN.replace('return true;', 'return false;'))], 'GARDE'),
    ('[negatif] commentaire citant l\'ancienne garde et la marque', [(G_BTN, "  // ancienne garde : if(last&&last.querySelector('.coach-prog-save'))return true; — marque coach-seance-carte\n" + G_BTN)], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_seance_c2.js'], cwd=arbre, capture_output=True, text=True, timeout=900,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:110] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_c2_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtre = sys.argv[1] if len(sys.argv) > 1 else ''
    avant = subprocess.run(['git', 'show', 'HEAD:' + CO], cwd=SRC, capture_output=True, text=True).stdout
    tmp0, a0 = cloner()
    rouges = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide)\n')
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
        if filtre and not nom.startswith(filtre):
            continue
        total += 1
        tmp, arbre = cloner()
        cible = os.path.join(arbre, CO); src = open(cible, encoding='utf-8').read()
        if remplacements == 'AVANT':
            if not avant or avant == src:
                print('  INVALIDE  %s (code d\'avant introuvable ou identique)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            src = avant
        else:
            invalide = [av[:50] for av, _ in remplacements if src.count(av) != 1]
            if invalide:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            for av, ap in remplacements:
                src = src.replace(av, ap, 1)
        open(cible, 'w', encoding='utf-8').write(src)
        rouges = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-78s %-6s %d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
