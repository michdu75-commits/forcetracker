#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF du compteur anonyme de `ft_miroir`.

Chaque mutation casse UNE garantie dans une COPIE des migrations (BUGS.md §60 : jamais
l'arbre servi) et exige que LE temoin nomme tombe. *On exige le bon rouge, pas un rouge.*
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'supabase', 'migrations')
M4 = '20260919_0004_compteur_ft_miroir.sql'

MUTATIONS = [
    ('l increment est RETIRE de ft_miroir',
     "    update public.ft_miroir_usage\n       set appels_total = appels_total + 1,\n"
     "           dernier_appel = now()\n     where id;",
     '    perform 1;', ['T2a', 'T3', 'T4']),
    ('l increment cesse d etre atomique (lecture puis ecriture)',
     "       set appels_total = appels_total + 1,\n           dernier_appel = now()\n"
     "     where id;",
     "       set appels_total = (select appels_total from public.ft_miroir_usage where id) + 1,\n"
     "           dernier_appel = now()\n     where id;", []),
    ('le compteur bouge AUSSI sur la voie moderne',
     '  insert into public.ft_comptes (email, data, updated_at)\n  values (v_compte,',
     '  update public.ft_miroir_usage set appels_total = appels_total + 1 where id;\n'
     '  insert into public.ft_comptes (email, data, updated_at)\n  values (v_compte,',
     ['T5'], '20260918_0003_fusion_champ_absent.sql'),
    ('le compteur enregistre l adresse (fuite de donnee personnelle)',
     '  appels_total  bigint      not null default 0,',
     '  appels_total  bigint      not null default 0,\n  dernier_email text,', ['T6a']),
    ('l increment nomme p_email (anonymat casse par construction)',
     "           dernier_appel = now()\n     where id;",
     "           dernier_appel = now()\n     where id and p_email is not null;", ['T6c']),
    ('la table redevient lisible par l API',
     'revoke all on table public.ft_miroir_usage from anon;', '-- (retire)', ['T7a']),
    ('la securite au niveau ligne est desactivee',
     'alter table public.ft_miroir_usage enable row level security;', '-- (retire)', ['T7b']),
    # [!!] L ANCRE NE VISE QUE LE `check`, PAS LA CLE PRIMAIRE. Retirer `primary key` fait
    #      echouer la MIGRATION elle-meme (l `on conflict (id)` n a plus de contrainte sur
    #      quoi s appuyer) : le montage rougit, et le temoin T8a n est jamais atteint. On
    #      mute donc exactement la garantie qu on veut eprouver.
    ('la contrainte qui interdit une seconde ligne disparait',
     'id            boolean     primary key default true check (id),',
     'id            boolean     primary key default true,', ['T8a']),
    ('le compteur peut FAIRE ECHOUER une sauvegarde legacy',
     '  exception when others then\n    null;   -- ⛔ le compteur ne fait JAMAIS échouer une sauvegarde\n  end;',
     '  end;', ['T9a']),
    ('on compte AVANT l ecriture au lieu d apres (option A)',
     '  insert into public.ft_comptes(email, data, updated_at)\n'
     '  values (lower(trim(p_email)), p_data, now())',
     '  update public.ft_miroir_usage set appels_total = appels_total + 1 where id;\n'
     '  insert into public.ft_comptes(email, data, updated_at)\n'
     # [!!] ⭐⭐ ET CETTE MUTATION M A APPRIS QUELQUE CHOSE SUR POSTGRESQL, PAS SUR MON CODE.
     #      J attendais que T10a rougisse (« un appel qui echoue ne compte pas »). Il reste
     #      VERT, et c est correct : l increment pose avant l insert est ANNULE AVEC LA
     #      TRANSACTION quand l insert echoue. >> *La transaction donne deja gratuitement la
     #      moitie de l option B.* Le choix « compter apres » n en reste pas moins le bon —
     #      il rend l intention explicite et survivra a un futur ajout d instructions apres
     #      l insert — mais il ne porte pas, aujourd hui, le poids que je lui pretais.
     #      Ce que la mutation casse REELLEMENT : elle compte DEUX fois (l ancien bloc est
     #      toujours la), et elle sort l increment du gestionnaire d erreur.
     '  values (lower(trim(p_email)), p_data, now())', ['T2a', 'T9a']),
    # ── [vert attendu] ───────────────────────────────────────────────────────────────
    ('[vert attendu] un COMMENTAIRE cite les mots que les temoins cherchent',
     '-- ─── 1. LA TABLE',
     '-- rappel : p_email, p_data, dernier_email, row level security, check (id)\n'
     '-- ─── 1. LA TABLE', []),
]


def lancer(mig_dir, base):
    env = dict(os.environ, FT_MIG=mig_dir, FT_PGBASE=base,
               PATH='/usr/lib/postgresql/16/bin:' + os.environ.get('PATH', ''))
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools',
                                                     'test_compteur_ft_miroir.py')],
                       capture_output=True, text=True, env=env, timeout=600)
    return r.returncode, set(re.findall(r'^\s*!!\s+(\S+)', r.stdout, re.M)), r.stdout


def main():
    tmp = tempfile.mkdtemp(prefix='mut_cpt_')
    ok = 0
    try:
        print('=== CONTROLE SAIN ===')
        c, rouges, _ = lancer(SRC, 'cpt_sain')
        if not (c == 0 and not rouges):
            print('  !!   arbre sain : %s' % sorted(rouges))
            return 1
        print('  OK   arbre sain : aucun rouge')

        for i, mut in enumerate(MUTATIONS):
            libelle, motif, remp, attendus = mut[0], mut[1], mut[2], mut[3]
            fic = mut[4] if len(mut) > 4 else M4
            d = os.path.join(tmp, 'm%d' % i)
            shutil.copytree(SRC, d)
            p = os.path.join(d, fic)
            src = open(p, encoding='utf-8').read()
            if src.count(motif) != 1:
                print('  !!   %-58s ancre a %d occurrences (mutation invalide)'
                      % (libelle[:58], src.count(motif)))
                continue
            open(p, 'w', encoding='utf-8').write(src.replace(motif, remp))
            c, rouges, sortie = lancer(d, 'cpt_mut%d' % i)
            if attendus:
                conforme = c != 0 and set(attendus) <= rouges
                detail = 'rouges=%s' % (sorted(rouges) or 'AUCUN')
            else:
                conforme = (c == 0 and not rouges)
                detail = ('vert attendu' if conforme
                          else 'ATTENDU VERT mais rc=%d rouges=%s' % (c, sorted(rouges)))
            ok += 1 if conforme else 0
            print('  %s %-58s %s' % ('OK  ' if conforme else '!!  ', libelle[:58], detail))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (ok, len(MUTATIONS)))
    return 0 if ok == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
