#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""BALAYAGE DES SITES DE GARDE (« AUTRE ACTIVITE », 05/11/2026, session-C — voir docs/AUTRE-ACTIVITE-CALORIES.md §6) — pour CHAQUE ligne qui lit `_seancesTrain()` (la vue « séances d'entraînement », sans les activités), on retire la garde dans une COPIE de l'arbre
(`_seancesTrain()` -> `(S.sessions||[])`, c'est-à-dire le défaut d'origine : une marche compte comme une séance) et on regarde si le banc rougit.
 · CAUGHT   : au moins un témoin rouge (la garde est protégée) ;
 · SURVIVOR : aucun rouge -> un trou : soit la garde n'est protégée par aucun témoin, soit la mutation est équivalente (à examiner ligne par ligne) ;
 · PLANTAGE : le banc a planté (ne prouve rien).
Usage : python3 tools/mut_sites_garde.py [blocs] [filtre]    (blocs par défaut D,E,F,J ; filtre = sous-chaîne de « fichier:ligne »)   — MUT_J=3 par défaut.
Chaque mutation est appliquée à un ARBRE COPIE, jamais au dépôt (BUGS.md §60). Un survivant n'est pas forcément un défaut (mutation équivalente) : il se LIT, ligne par ligne."""
import importlib.util, os, re, shutil, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
WT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('mut', os.path.join(WT, 'tools', 'mut_autre_activite.py')); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
BLOCS = sys.argv[1] if len(sys.argv) > 1 else 'D,E,F,J'
FILTRE = sys.argv[2] if len(sys.argv) > 2 else ''
FICH = ['app.js', 'coach.js', 'dashboard.js', 'log.js', 'screens.js', 'setup.js', 'state.js', 'tracking.js']
SKIP = {('state.js', 897), ('state.js', 913)}      # un commentaire d'explication et la DÉFINITION de la vue

sites = []
for f in FICH:
    for i, l in enumerate(open(os.path.join(WT, f), encoding='utf-8').read().split('\n'), 1):
        if '_seancesTrain()' in l and (f, i) not in SKIP and not l.lstrip().startswith(('/*', '//', '*')):
            sites.append((f, i))
sites = [s for s in sites if FILTRE in '%s:%d' % s]

def une(site):
    f, ligne = site
    tmp, a = m.cloner()
    try:
        p = os.path.join(a, f); L = open(p, encoding='utf-8').read().split('\n')
        avant = L[ligne - 1]; L[ligne - 1] = avant.replace('_seancesTrain()', '(S.sessions||[])')
        open(p, 'w', encoding='utf-8').write('\n'.join(L))
        chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync(process.argv[1],'utf8'))", p], capture_output=True, text=True)
        if chk.returncode: return site, 'INVALIDE', [], avant
        rouges, plantage = m.banc(a, BLOCS)
        return site, ('PLANTAGE' if plantage else ('CAUGHT' if rouges else 'SURVIVOR')), rouges, avant
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '3'))) as ex:
    res = list(ex.map(une, sites))
n = {'CAUGHT': 0, 'SURVIVOR': 0, 'PLANTAGE': 0, 'INVALIDE': 0}
for (f, ligne), verdict, rouges, avant in res:
    n[verdict] += 1
    print('%-9s %-14s %2d rouge(s)  %-34s  %s' % (verdict, '%s:%d' % (f, ligne), len(rouges), (re.search(r'C-ACT-[A-Z]+\d*|\S+', rouges[0].replace('❌ ROUGE ', '')) or [''])[0] if rouges else '', avant.strip()[:92]))
print('\nblocs joues : %s · %d sites · %s' % (BLOCS, len(sites), n))
