#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF DU BANC DE CHAOS.

*Un banc qu'on n'a jamais vu rougir n'est pas un banc, c'est une decoration.* Chaque mutation
casse UNE garantie dans une COPIE de l'arbre (BUGS.md §60 : jamais l'arbre servi), rejoue le
banc, et exige que LE temoin nomme tombe.

[!!] ON EXIGE LE BON ROUGE, PAS UN ROUGE. Une mutation qui ferait planter le montage rendrait
     elle aussi un code non nul, ce qui ne prouverait rien.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MUTATIONS = [
    # ── la migration 0003 elle-meme ──────────────────────────────────────────────────
    ('la migration 0003 est RETIREE (retour au remplacement integral)',
     '__SUPPRIMER__', 'supabase/migrations/20260918_0003_fusion_champ_absent.sql', None,
     ['S1b']),
    ('la fusion perd le retrait des justificatifs',
     'supabase/migrations/20260918_0003_fusion_champ_absent.sql',
     "|| excluded.data)\n                  - 'token' - 'authCode' - 'code' - 'confirmCode'"
     " - 'apikey' - 'authorization',",
     '|| excluded.data),', ['I2a']),
    # [!!] L ANCRE VISE 0003, PAS 0002 : la migration 0003 REDEFINIT la fonction, donc muter
    #      0002 est sans effet — elle est ecrasee juste apres. Ma premiere version mutait
    #      0002 et ne faisait rougir personne. *Muter une definition qu une migration
    #      ulterieure remplace ne mute rien du tout.*
    ('la resolution d identite accepte un jeton revoque',
     'supabase/migrations/20260918_0003_fusion_champ_absent.sql',
     '   where j.hachage = p_hachage\n     and j.revoque = false;',
     '   where j.hachage = p_hachage;', ['J2a']),
    ('le retrait des justificatifs disparait de l INSERT',
     'supabase/migrations/20260918_0003_fusion_champ_absent.sql',
     "p_data - 'token' - 'authCode' - 'code' - 'confirmCode' - 'apikey' - 'authorization'",
     # [!!] L ATTENDU A CHANGE APRES MESURE : la branche `insert` ne sert que sur une ligne
     #      NEUVE, donc I2c (ligne existante) restait vert. C'est le FUZZ qui l'a attrape en
     #      premier — puis le temoin I2e a ete ajoute pour couvrir cette branche.
     'p_data', ['I2e', 'FZ1']),
    # ── les garde-fous d Apps Script ─────────────────────────────────────────────────
    ('Apps Script perd son garde anti-retrecissement des seances',
     'Code.js', 'const SEUIL_MINI = 30, PART_MINI = 0.6;',
     'const SEUIL_MINI = 99999, PART_MINI = 0;', ['SR-a']),
    ('l aide _pa_ cesse de refuser un tableau vide',
     'Code.js', 'return(bi.length>0||ei.length===0)?bi:ei;', 'return bi;', ['M4c']),
    # ⭐⭐ [vert attendu] MUTANT EQUIVALENT, ET LA RAISON EST MESUREE, PAS SUPPOSEE.
    #     `_pa_` porte un garde `if(b===undefined) return e`. Mais ses 8 sites d'appel sont
    #     TOUS precedes de `if (body.X !== undefined)` : la branche est donc INATTEIGNABLE, et
    #     aucun test ne peut la faire rougir. Ce n'est pas un trou du banc, c'est de la defense
    #     en profondeur aujourd'hui morte — elle protegerait un futur appelant non garde.
    #     >> *Une mutation qu'aucun test ne peut detecter n'accuse pas les tests : elle dit que
    #        le code mute ne s'execute jamais.*
    ('[vert attendu] `_pa_` perd un garde INATTEIGNABLE (8 appels sur 8 deja gardes)',
     'Code.js', 'function _pa_(b, e){ if(b===undefined)return e;',
     'function _pa_(b, e){ if(b===undefined)return [];', []),
    ('weightLog perd son garde anti-vidage',
     'Code.js',
     "      if (inWL.length === 0 && exWL.length > 0) {\n"
     "        Logger.log('[FT GARDE-FOU weightLog] refusé : ' + exWL.length + "
     "' entrées conservées');\n      } else { existing.weightLog = inWL; }",
     '      existing.weightLog = inWL;', ['M4a']),
    # ── l identite cote Apps Script ──────────────────────────────────────────────────
    ('Apps Script reprend l e-mail de la charge au lieu du jeton',
     'Code.js', '    const email = _id.email;',
     '    const email = body.email || _id.email;', ['I4b']),
    # ── [vert attendu] : on mesure le comportement, pas la documentation ─────────────
    ('[vert attendu] un COMMENTAIRE cite les mots que les temoins cherchent',
     'Code.js', 'function _pa_(b, e){',
     '// rappel : set data = excluded.data ; revoque = false ; SEUIL_MINI\n'
     'function _pa_(b, e){', []),
]


def lancer(arbre, base):
    env = dict(os.environ,
               PATH='/usr/lib/postgresql/16/bin:' + os.environ.get('PATH', ''),
               FT_PGBASE=base,
               FT_GRAINES=os.environ.get('FT_MUT_GRAINES', '1,2'),
               FT_PAR_GRAINE=os.environ.get('FT_MUT_PAS', '25'))
    r = subprocess.run(['node', os.path.join(arbre, 'tools', 'chaos', 'banc.js')],
                       capture_output=True, text=True, env=env, cwd=arbre, timeout=900)
    rouges = set(re.findall(r'^\s*!!\s+(\S+)', r.stdout, re.M))
    return r.returncode, rouges, r.stdout


def main():
    tmp = tempfile.mkdtemp(prefix='chaos_mut_')
    ok = 0
    try:
        print('=== CONTROLE SAIN ===')
        c, rouges, _ = lancer(ROOT, 'chaos_sain')
        sain = (c == 0 and not rouges)
        print('  %s arbre sain : %s' % ('OK  ' if sain else '!!  ',
                                        'aucun rouge' if sain else sorted(rouges)))
        if not sain:
            print('\nARRET : le controle sain n est pas vert.')
            return 1

        for i, (libelle, fic, motif, remp, attendus) in enumerate(MUTATIONS):
            d = os.path.join(tmp, 'a%d' % i)
            shutil.copytree(ROOT, d, ignore=shutil.ignore_patterns(
                '.git', 'node_modules', '__pycache__', '*.pdf'))
            if fic == '__SUPPRIMER__':
                os.remove(os.path.join(d, motif))
            else:
                p = os.path.join(d, fic)
                src = open(p, encoding='utf-8').read()
                if src.count(motif) != 1:
                    print('  !!   %-60s ancre a %d occurrences (mutation invalide)'
                          % (libelle[:60], src.count(motif)))
                    shutil.rmtree(d, ignore_errors=True)
                    continue
                open(p, 'w', encoding='utf-8').write(src.replace(motif, remp))
            c, rouges, sortie = lancer(d, 'chaos_mut%d' % i)
            if attendus:
                conforme = c != 0 and set(attendus) <= rouges
                detail = 'rouges=%s' % (sorted(rouges) or 'AUCUN')
            else:
                conforme = (c == 0 and not rouges)
                detail = 'vert attendu (on mesure le comportement, pas les commentaires)'
            ok += 1 if conforme else 0
            print('  %s %-60s %s' % ('OK  ' if conforme else '!!  ', libelle[:60], detail))
            shutil.rmtree(d, ignore_errors=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (ok, len(MUTATIONS)))
    return 0 if ok == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
