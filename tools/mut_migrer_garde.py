#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF de tools/migrer_garde.py --nouveau (D-031-SECURITE-01, 20/10/2026).

Pourquoi : le plan d'integration disait « les bancs crees par une autre session apres le 19/10 se gardent avec
migrer_garde.py, qui verifie avant/apres » — or l'outil REFUSAIT tout fichier non inscrit. Le mode --nouveau ferme ce trou.
Ce controle prouve, dans une COPIE de l'arbre et sur des bancs SYNTHETIQUES (aucun fichier reel n'est modifie) :
  N1 un nouveau banc STABLE est garde : une seule ligne ajoutee, en tete ; la liste des anciens n'est PAS touchee ;
     le cliquet ne le voit plus comme « nouveau sans garde »
  N2 un nouveau banc dont un VERDICT change sous le garde est REFUSE, et laisse tel quel
  N3 un ancien INSCRIT est refuse en mode --nouveau (il se migre sans l'option, et sort alors de la liste)
  N4 un banc DEJA garde est refuse
  N5 un fichier qui ne pilote pas Playwright est refuse
  N6 sans --nouveau, un nouveau banc est refuse (l'ancien comportement, garde exprès : l'option doit etre voulue)
Usage : python3 tools/mut_migrer_garde.py
"""
import json, os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PW = "const { chromium } = require('/opt/node22/lib/node_modules/playwright');\n"
STABLE = "'use strict';\n" + PW + "console.log('  ✅ temoin stable A');\nconsole.log('  ✅ temoin stable B');\n"
SENSIBLE = ("'use strict';\n" + PW + "const g = Object.keys(require.cache).some(k => /_garde_reseau\\.js$/.test(k));\n"
            "console.log((g ? '  ❌' : '  ✅') + ' temoin qui change sous le garde');\n")
SANS_PW = "'use strict';\nconsole.log('  ✅ temoin sans Playwright');\n"


def main():
    tmp = tempfile.mkdtemp(prefix='mut_migrer_garde_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'audits', 'worktrees'))
    liste = os.path.join(a, 'tests', 'garde_existants.json')
    for n, c in (('banc_zz_stable.js', STABLE), ('banc_zz_sensible.js', SENSIBLE), ('banc_zz_sans_pw.js', SANS_PW)):
        open(os.path.join(a, 'tools', n), 'w', encoding='utf-8').write(c)
    ancien = next(x['fichier'] for x in json.load(open(liste, encoding='utf-8'))['fichiers'] if x['etat'] == 'à migrer' and x['fichier'].endswith('.js'))
    liste0 = open(liste, encoding='utf-8').read()

    def lancer(*args):
        r = subprocess.run(['python3', os.path.join(a, 'tools', 'migrer_garde.py')] + list(args), cwd=a, capture_output=True, text=True, timeout=1800)
        return r.returncode, r.stdout + r.stderr

    def lire(f): return open(os.path.join(a, f), encoding='utf-8').read()

    def nouveaux():
        r = subprocess.run(['node', '-e', "process.stdout.write(JSON.stringify(require('./tests/parcours/garde_reseau.js').cliquet().nouveaux))"],
                           cwd=a, capture_output=True, text=True)
        return set(json.loads(r.stdout or '[]'))

    res = []
    def t(nom, ok, det=''):
        res.append(ok); print('  %s  %s%s' % ('OK ' if ok else '!! ', nom, ('  >> ' + det) if (det and not ok) else ''))

    t('N0 point de depart : le cliquet voit les 2 bancs synthetiques comme NOUVEAUX sans garde, et pas le fichier sans Playwright',
      {'tools/banc_zz_stable.js', 'tools/banc_zz_sensible.js'} <= nouveaux() and 'tools/banc_zz_sans_pw.js' not in nouveaux(), str(sorted(nouveaux())))
    c, out = lancer('tools/banc_zz_stable.js')
    t('N6 sans --nouveau, un nouveau banc est REFUSE (non inscrit)', 'REFUSE' in out and 'non inscrit' in out and lire('tools/banc_zz_stable.js') == STABLE, out[-300:])
    c, out = lancer('--nouveau', 'tools/banc_zz_stable.js')
    apres = lire('tools/banc_zz_stable.js')
    ajout = [l for l in apres.split('\n') if l not in STABLE.split('\n')]
    t('N1 un nouveau banc STABLE est garde : IDENTIQUE avant/apres, une seule ligne ajoutee (le garde, avant Playwright)',
      'IDENTIQUE' in out and len(ajout) == 1 and '_garde_reseau.js' in ajout[0] and apres.index('_garde_reseau.js') < apres.index('playwright'), out[-300:])
    t('N1b … la liste des anciens n\'est PAS touchee, et le cliquet ne le voit plus comme nouveau',
      lire('tests/garde_existants.json') == liste0 and 'tools/banc_zz_stable.js' not in nouveaux())
    c, out = lancer('--nouveau', 'tools/banc_zz_sensible.js')
    t('N2 un nouveau banc dont un VERDICT change sous le garde est REFUSE, et laisse tel quel',
      'ECART' in out and lire('tools/banc_zz_sensible.js') == SENSIBLE and c != 0, out[-300:])
    c, out = lancer('--nouveau', ancien)
    t('N3 un ancien INSCRIT est refuse en mode --nouveau [' + ancien + ']', 'REFUSE' in out and 'inscrit' in out and c != 0, out[-300:])
    c, out = lancer('--nouveau', 'tools/banc_garde_reseau.js')
    t('N4 un banc DEJA garde est refuse', 'REFUSE' in out and 'pas un nouveau banc' in out and c != 0, out[-300:])
    c, out = lancer('--nouveau', 'tools/banc_zz_sans_pw.js')
    t('N5 un fichier qui ne pilote pas Playwright est refuse', 'REFUSE' in out and 'pas un nouveau banc' in out and lire('tools/banc_zz_sans_pw.js') == SANS_PW, out[-300:])
    t('N7 aucun fichier du VRAI arbre n\'a bouge (tout s\'est passe dans la copie)',
      not os.path.exists(os.path.join(SRC, 'tools', 'banc_zz_stable.js')) and subprocess.run(['git', '-C', SRC, 'status', '--porcelain', '--', 'tests/garde_existants.json'], capture_output=True, text=True).stdout == '')
    shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (sum(res), len(res)))
    return 0 if all(res) else 1


if __name__ == '__main__':
    raise SystemExit(main())
