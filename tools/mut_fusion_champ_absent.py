#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF de la migration 0003 (« champ absent = conserve »).

*Un banc qu'on n'a jamais vu rougir n'est pas un banc, c'est une decoration.* Chaque mutation
casse UNE garantie dans une COPIE des migrations (BUGS.md §60 : jamais l'arbre servi), rejoue
le banc sur un vrai PostgreSQL, et exige que LE test attendu rougisse.

[!!] ON EXIGE LE BON ROUGE, PAS UN ROUGE. Une mutation qui ferait planter le montage rendrait
     elle aussi un code non nul : on verifierait alors « le banc a echoue », ce qui ne prouve
     rien. Chaque ligne nomme donc le TEMOIN qui doit tomber.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'supabase', 'migrations')
M3 = '20260918_0003_fusion_champ_absent.sql'

LIGNE = ("     set data = (coalesce(public.ft_comptes.data, '{}'::jsonb) || excluded.data)\n"
         "                  - 'token' - 'authCode' - 'code' - 'confirmCode' - 'apikey' "
         "- 'authorization',")

MUTATIONS = [
    ('la fusion redevient un REMPLACEMENT INTEGRAL (le defaut d origine)',
     M3, LIGNE, "     set data = excluded.data,", ['T2a']),
    ('la fusion perd son coalesce (le piege du NULL a gauche)',
     M3, "coalesce(public.ft_comptes.data, '{}'::jsonb)", 'public.ft_comptes.data', ['T8']),
    ('le retrait des justificatifs ne suit plus la fusion (la fuite survivrait)',
     M3, "|| excluded.data)\n                  - 'token' - 'authCode' - 'code' - "
         "'confirmCode' - 'apikey' - 'authorization',",
     '|| excluded.data),', ['T9c']),
    ('les cotes de la fusion sont INVERSES (l ancien ecraserait le nouveau)',
     M3, "coalesce(public.ft_comptes.data, '{}'::jsonb) || excluded.data",
     "excluded.data || coalesce(public.ft_comptes.data, '{}'::jsonb)", ['T2b']),
    ('la precondition de type disparait',
     M3, "if v_type is distinct from 'jsonb' then", 'if false then', []),
    ('le retrait des justificatifs disparait de l INSERT',
     M3, "p_data - 'token' - 'authCode' - 'code' - 'confirmCode' - 'apikey' - 'authorization'",
     'p_data', ['T9a']),
]


def lancer(mig_dir, base):
    env = dict(os.environ, FT_MIG=mig_dir, FT_PGBASE=base,
               PATH='/usr/lib/postgresql/16/bin:' + os.environ.get('PATH', ''))
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools',
                                                     'test_fusion_champ_absent.py')],
                       capture_output=True, text=True, env=env)
    rouges = set(re.findall(r'^\s*!!\s+(T\d+[a-z]?|M\d+)', r.stdout, re.M))
    return r.returncode, rouges, r.stdout


def main():
    tmp = tempfile.mkdtemp(prefix='mut_fus_')
    ok = 0
    try:
        print('=== CONTROLE SAIN (aucune mutation) ===')
        c, rouges, _ = lancer(SRC, 'fusion_sain')
        sain = (c == 0 and not rouges)
        print('  %s arbre sain : %s' % ('OK  ' if sain else '!!  ',
                                        'aucun rouge' if sain else 'rouges=%s' % rouges))
        if not sain:
            print('\nARRET : le controle sain n est pas vert, aucune mutation n a de sens.')
            return 1

        for i, (libelle, fic, motif, remp, attendus) in enumerate(MUTATIONS):
            d = os.path.join(tmp, 'mig%d' % i)
            shutil.copytree(SRC, d)
            p = os.path.join(d, fic)
            src = open(p, encoding='utf-8').read()
            if src.count(motif) != 1:
                print('  !!   %-62s ancre a %d occurrences (mutation invalide)'
                      % (libelle[:62], src.count(motif)))
                continue
            open(p, 'w', encoding='utf-8').write(src.replace(motif, remp))
            c, rouges, sortie = lancer(d, 'fusion_mut%d' % i)
            if attendus:
                conforme = c != 0 and set(attendus) <= rouges
                detail = 'rouges=%s' % (sorted(rouges) or 'AUCUN')
            else:
                # la precondition de type : sur une base OU data EST jsonb, la retirer ne
                # change rien. C'est un vert ATTENDU, et il faut le dire plutot que de
                # fabriquer un faux rouge.
                conforme = (c == 0 and not rouges)
                detail = 'vert attendu (le type est deja jsonb ici)'
            ok += 1 if conforme else 0
            print('  %s %-62s %s' % ('OK  ' if conforme else '!!  ', libelle[:62], detail))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (ok, len(MUTATIONS)))
    return 0 if ok == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
