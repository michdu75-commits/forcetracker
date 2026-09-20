#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF de la PORTABILITE du banc de Milo (20/09/2026).

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).

CE QU'IL DOIT PROUVER, ET POURQUOI C'EST LE POINT DELICAT
    L'etape gratuite du workflow est censee ROUGIR quand l'infrastructure est cassee. Or
    une etape qui verifie une PRESENCE est exactement le genre de garde qui reste vert
    tout seul. Le 20/09, le banc a echoue en 34 s et RIEN, dans le depot, ne pouvait le
    voir venir : la dependance n'etait declaree nulle part.

    ⛔ Le piege propre a ce correctif : le repli vers le conteneur de developpement.
       Tant que `/opt/node22/lib/node_modules/playwright` existe ICI, retirer
       `node_modules` ne casse rien — le repli rattrape. Un controle negatif naif
       conclurait donc « le garde ne mord pas » alors qu'il n'a simplement jamais ete
       sollicite. C'est pour cela que la mutation M02 coupe LES DEUX voies.

    ⭐ Et deux mutations doivent rester VERTES : elles ne touchent que des COMMENTAIRES,
      en y citant les mots que les controles cherchent (`1.47.0`, `PLAYWRIGHT_BROWSERS_PATH`,
      `push:`, `schedule:`). C'est la seule facon de prouver qu'on mesure le MECANISME et
      non la phrase qui l'explique — et R30 exige justement qu'elle soit ecrite la.

Usage : python3 tools/mut_banc_portabilite.py
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WF = '.github/workflows/banc-milo.yml'

# Le controle joue l'etape GRATUITE telle que la CI l'ecrit : resolution + mode blanc.
CONTROLE = r'''
const path = require('path');
const ROOT = process.argv[2];
let pw;
try {
  pw = require(path.join(ROOT, 'tests/_playwright.js')).chargerPlaywright();
} catch (e) {
  console.log('ROUGE : ' + (e && e.code || '') + ' ' + String(e && e.message || e).split('\n')[0]);
  process.exit(1);
}
if (pw.voie !== 'node_modules') {
  console.log('ROUGE : resolu par ' + pw.voie + ' — la dependance declaree n a pas servi');
  process.exit(1);
}
console.log('VERT : ' + pw.chemin);
'''


def gardes_workflow(arbre):
    """Les garde-fous du §9, mesures sur le MECANISME (jamais sur un mot de commentaire)."""
    wf = open(os.path.join(arbre, WF), encoding='utf-8').read()
    code = '\n'.join(l for l in wf.split('\n') if not l.lstrip().startswith('#'))
    v = [('push', not re.search(r'^\s*push:', code, flags=re.M)),
         ('schedule', not re.search(r'^\s*schedule:', code, flags=re.M)),
         ('LANCER', bool(re.search(r'!=\s*"LANCER"\s*\]', code))),
         ('version figee', '1.47.0' not in code),
         ('npm ci', 'npm ci' in code),
         ('controle gratuit', '--n 3' in code)]
    return [n for n, ok in v if not ok]


MUT = [
    ('M01  `node_modules` disparait (cas du runner GitHub NU)', 'RM_NODE_MODULES', 'VERT_REPLI'),
    ('M02  les DEUX voies sont coupees (la vraie panne du 20/09)', 'RM_TOUT', 'ROUGE'),
    ('M03  le workflow n installe plus les dependances', 'WF_SANS_NPM_CI', 'GARDE'),
    ('M04  le workflow repart sur push', 'WF_PUSH', 'GARDE'),
    ('M05  la confirmation LANCER disparait', 'WF_SANS_LANCER', 'GARDE'),
    ('M06  une version de playwright revient en dur dans le CODE', 'WF_VERSION_DURE', 'GARDE'),
    ('M07  l etape gratuite disparait du workflow', 'WF_SANS_BLANC', 'GARDE'),
    ('[negatif] un COMMENTAIRE cite 1.47.0 et PLAYWRIGHT_BROWSERS_PATH', 'WF_COMMENT_1', 'OK'),
    ('[negatif] un COMMENTAIRE cite « push: » et « schedule: »', 'WF_COMMENT_2', 'OK'),
]


def appliquer(arbre, quoi):
    wf = os.path.join(arbre, WF)
    s = open(wf, encoding='utf-8').read()
    if quoi == 'RM_NODE_MODULES':
        shutil.rmtree(os.path.join(arbre, 'node_modules'), ignore_errors=True)
    elif quoi == 'RM_TOUT':
        # ⛔ LES DEUX VOIES. Sans couper aussi le repli, on ne mesure rien ici : le
        #    conteneur de developpement rattraperait, et le controle dirait « vert ».
        shutil.rmtree(os.path.join(arbre, 'node_modules'), ignore_errors=True)
        p = os.path.join(arbre, 'tests/_playwright.js')
        t = open(p, encoding='utf-8').read().replace(
            "const REPLI_CONTENEUR = '/opt/node22/lib/node_modules/playwright';",
            "const REPLI_CONTENEUR = '/opt/node22/lib/node_modules/playwright_ABSENT';")
        open(p, 'w', encoding='utf-8').write(t)
    elif quoi == 'WF_SANS_NPM_CI':
        s = s.replace('        run: npm ci --no-audit --no-fund',
                      '        run: echo "on n installe rien"')
    elif quoi == 'WF_PUSH':
        s = s.replace('on:\n  workflow_dispatch:',
                      'on:\n  push:\n    branches: [master]\n  workflow_dispatch:')
    elif quoi == 'WF_SANS_LANCER':
        s = s.replace('!= "LANCER" ]; then', '!= "OKOK" ]; then')
    elif quoi == 'WF_VERSION_DURE':
        s = s.replace('        run: npx playwright install --with-deps chromium',
                      '        run: npx --yes playwright@1.47.0 install --with-deps chromium')
    elif quoi == 'WF_SANS_BLANC':
        s = s.replace('          node tests/milo/eval.js --n 3 2>&1 | tee /tmp/blanc.log',
                      '          echo "on saute le controle gratuit"')
    elif quoi == 'WF_COMMENT_1':
        s = s.replace('on:\n  workflow_dispatch:',
                      '# rappel : on n epingle plus playwright@1.47.0 et on ne pose plus\n'
                      '# PLAYWRIGHT_BROWSERS_PATH — voir tests/_playwright.js\n'
                      'on:\n  workflow_dispatch:')
    elif quoi == 'WF_COMMENT_2':
        s = s.replace('on:\n  workflow_dispatch:',
                      '# volontairement AUCUN declencheur push: ni schedule: — une passe coute\n'
                      'on:\n  workflow_dispatch:')
    open(wf, 'w', encoding='utf-8').write(s)


def main():
    conformes = 0
    for nom, quoi, attendu in MUT:
        tmp = tempfile.mkdtemp(prefix='port_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(SRC, arbre, ignore=shutil.ignore_patterns('.git', '*.pdf'))
        appliquer(arbre, quoi)

        manquants = gardes_workflow(arbre)
        banc = os.path.join(tmp, 'c.js')
        open(banc, 'w', encoding='utf-8').write(CONTROLE)
        r = subprocess.run(['node', banc, arbre], capture_output=True, text=True,
                           cwd=arbre, timeout=120)
        sortie = (r.stdout + r.stderr).strip().split('\n')[0][:66]

        if manquants:
            obtenu = 'GARDE'
        elif r.returncode:
            obtenu = 'ROUGE'
        else:
            obtenu = 'VERT_REPLI' if 'conteneur' in r.stdout else 'OK'
        # M01 : la voie normale tombe, le repli rattrape → le controle du workflow ROUGIT
        # quand meme (il exige `voie === 'node_modules'`), et c'est voulu.
        if quoi == 'RM_NODE_MODULES' and r.returncode and 'resolu par conteneur' in r.stdout:
            obtenu = 'VERT_REPLI'

        ok = (obtenu == attendu)
        conformes += ok
        print('  %s  %-62s %-11s %s' % ('OK ' if ok else '!! ', nom, obtenu,
                                        (', '.join(manquants) or sortie)[:56]))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    sys.exit(main())
