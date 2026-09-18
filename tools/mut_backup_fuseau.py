#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Controle negatif du bloc B-CCCXXX (le fuseau des sauvegardes).

[!!] Arbre CLONE a chaque fois (BUGS.md §60). Deux mutations doivent rester VERTES : un
     COMMENTAIRE qui cite « UTC » et « Paris » — la seule facon de prouver qu'on mesure le
     CODE et non la note qui EXPLIQUE la correction (R30 exige qu'elle soit ecrite la).
"""
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CJ, MAN = 'Code.js', 'appsscript.json'
BANC = '''const fs=require('fs'), path=require('path');
const ROOT=process.argv[2];
let ok=0; const ko=[];
const t=(n,c,d)=>{ if(c)ok++; else ko.push(n); };
require(path.join(ROOT,'tests/parcours/backup_fuseau.js')).source(t,ROOT,fs,path);
console.log(ok+' OK / '+ko.length+' rouge');
ko.forEach(k=>console.log('rouge : '+k));
process.exit(ko.length?1:0);
'''

MUTATIONS = [
    ('le libelle reannonce « UTC »', CJ,
     "  return h.length + '× par jour (' + h.join(' et ') + ', ' + fz + ')';",
     "  return h.length + '× par jour (' + h.join(' et ') + ' UTC)';", 'ROUGE'),
    ('le libelle singulier reannonce « UTC »', CJ,
     "  if (h.length === 1) return 'Programmée chaque jour à ' + h[0] + ' (' + fz + ')';",
     "  if (h.length === 1) return 'Programmée chaque jour à ' + h[0] + ' UTC';", 'ROUGE'),
    ('le journal du declencheur reannonce « UTC »', CJ,
     "             + ' (' + _fuseauLisible_() + ').');",
     "             + ' UTC.');", 'ROUGE'),
    ('« Paris » est reecrit a la main au lieu d etre lu', CJ,
     "    const tz = Session.getScriptTimeZone();",
     "    const tz = 'Europe/Paris';", 'ROUGE'),
    ('le repli invente un fuseau au lieu de dire qu il ne sait pas', CJ,
     "  } catch (e) { return 'heure du serveur'; }",
     "  } catch (e) { return 'heure de Paris'; }", 'ROUGE'),
    ('les heures de sauvegarde sont deplacees (hors perimetre)', CJ,
     'const BACKUP_HOURS_ = [2, 14];', 'const BACKUP_HOURS_ = [3, 15];', 'ROUGE'),
    ('le projet passe en UTC (la phrase deviendrait vraie, le temoin doit le dire)', MAN,
     '"timeZone": "Europe/Paris"', '"timeZone": "Etc/UTC"', 'ROUGE'),

    # ── CONTROLES NEGATIFS : doivent rester VERTS ───────────────────────────────────────
    ('[negatif] un COMMENTAIRE de Code.js cite « UTC » et « Paris »', CJ,
     'const BACKUP_HOURS_ = [2, 14];',
     "// rappel : ce n'est PAS de l'UTC, c'est Europe/Paris — voir la note ci-dessus\n"
     'const BACKUP_HOURS_ = [2, 14];', 'VERT'),
    ('[negatif] un COMMENTAIRE cite le libelle fautif mot pour mot', CJ,
     'function _fuseauLisible_() {',
     "// avant : « 2× par jour (2h et 14h UTC) » — faux, et ca faisait raisonner de travers\n"
     'function _fuseauLisible_() {', 'VERT'),
]


def main():
    conformes = 0
    for nom, fich, avant, apres, attendu in MUTATIONS:
        tmp = tempfile.mkdtemp(prefix='fus_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(ROOT, arbre, ignore=shutil.ignore_patterns(
            '.git', 'node_modules', '*.pdf'))
        cible = os.path.join(arbre, fich)
        src = open(cible, encoding='utf-8').read()
        if src.count(avant) != 1:
            print('  INVALIDE  %-70s (ancre %s)'
                  % (nom, 'absente' if avant not in src else 'multiple'))
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        neuf = src.replace(avant, apres)
        if neuf == src:
            print('  INVALIDE  %-70s (mutation sans effet)' % nom)
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        open(cible, 'w', encoding='utf-8').write(neuf)
        banc = os.path.join(tmp, 'banc.js')
        open(banc, 'w', encoding='utf-8').write(BANC)
        r = subprocess.run(['node', banc, arbre], capture_output=True, text=True, cwd=arbre)
        sortie = (r.stdout + r.stderr).strip().split('\n')
        plante = 'OK / ' not in (r.stdout or '')
        obtenu = 'PLANTAGE' if plante else ('ROUGE' if r.returncode else 'VERT')
        ok = (obtenu == attendu)
        conformes += ok
        rouges = [l.split('rouge : ')[1][:42] for l in sortie if l.startswith('rouge : ')]
        print('  %s  %-70s %-8s %s'
              % ('OK ' if ok else '!! ', nom, obtenu, ' · '.join(rouges[:2])))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(MUTATIONS)))
    return 0 if conformes == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
