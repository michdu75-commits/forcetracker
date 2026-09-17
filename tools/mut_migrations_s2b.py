#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Contrôle négatif des migrations S2-B : chaque garantie doit pouvoir ROUGIR.

[!!] On mute le SQL sur une COPIE des fichiers, on remonte une base neuve, et on rejoue le
     banc. Une garantie qu'on n'a jamais vue refuser n'a pas été testée, elle a été relue.

[!!] LA MUTATION LA PLUS IMPORTANTE EST LA N°5 : elle ajoute `force row level security` sur
     `ft_jetons` — exactement ce que mon dossier d'architecture recommandait. Si elle fait
     tomber le banc, c'est que le piège était réel et que la correction l'était aussi.
"""
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIG = os.path.join(ROOT, 'supabase', 'migrations')
F1 = '20260917_0001_ft_jetons.sql'
F2 = '20260917_0002_rpc_s2b.sql'

# (nom, fichier, avant, apres, temoins qui DOIVENT rougir)
MUTATIONS = [
    ('le jeton deja inscrit peut etre RE-POINTE vers un autre compte', F2,
     'on conflict (hachage) do nothing;',
     'on conflict (hachage) do update set compte = excluded.compte, revoque = false;',
     ['I3', 'R1']),
    ('un jeton REVOQUE est de nouveau accepte', F2,
     "     and j.revoque = false;", "     ;", ['T5']),
    ('l identite est reprise de la CHARGE UTILE au lieu du jeton', F2,
     "  select j.compte into v_compte\n"
     "    from public.ft_jetons j\n"
     "   where j.hachage = p_hachage\n"
     "     and j.revoque = false;",
     "  v_compte := coalesce(p_data->>'email', 'inconnu.test');",
     ['T2', 'T8b']),
    ('le retrait defensif des justificatifs disparait', F2,
     "          p_data - 'token' - 'authCode' - 'code' - 'confirmCode' - 'apikey' "
     "- 'authorization',",
     '          p_data,', ['T10']),
    ('FORCE ROW LEVEL SECURITY est ajoute sur ft_jetons (le piege de mon dossier)', F1,
     'alter table public.ft_jetons enable row level security;',
     'alter table public.ft_jetons enable row level security;\n'
     'alter table public.ft_jetons force row level security;',
     # [!!] W1 SEUL, et c'est une mesure et non une concession : ici `postgres` est
     #      SUPERUTILISATEUR, donc le comportement ne bouge pas. Le piege lui-meme est
     #      prouve a part, avec un proprietaire ordinaire (temoins X1/X2/X3 du banc).
     ['W1']),
    ('la cle publique recoit EXECUTE sur la nouvelle fonction', F2,
     'grant execute on function public.ft_enregistrer_instantane(text, jsonb) to service_role;',
     'grant execute on function public.ft_enregistrer_instantane(text, jsonb) to service_role;\n'
     'grant execute on function public.ft_enregistrer_instantane(text, jsonb) to anon;',
     ['P3']),
    ('le revoke a PUBLIC disparait (EXECUTE est accorde par defaut)', F2,
     'revoke all on function public.ft_enregistrer_instantane(text, jsonb) from public;',
     '-- revoke retire',
     ['P3']),
    ('le navigateur retrouve des droits directs sur ft_jetons', F1,
     'revoke all on table public.ft_jetons from anon;', 'grant select on table public.ft_jetons to anon;',
     ['P1']),
    ('les refus deviennent un ORACLE (inconnu et revoque se distinguent)', F2,
     "  if v_compte is null then\n    raise exception 'identite' using errcode = '28000';",
     "  if v_compte is null then\n    raise exception 'inconnu_ou_revoque' using errcode = '28000';",
     ['E1']),
    ('la contrainte de forme du hache disparait', F1,
     "check (hachage ~ '^[0-9a-f]{64}$');", 'check (hachage is not null);', ['F3']),
    ('la fonction passe en security invoker', F2,
     'returns void\nlanguage plpgsql\nsecurity definer',
     # meme raison qu'au-dessus : en local le proprietaire passe outre, donc seule la
     # propriete declarative peut mordre.
     'returns void\nlanguage plpgsql\nsecurity invoker', ['S2']),
    ('le search_path n est plus fixe', F2,
     'security definer\nset search_path = public, pg_temp\nas $$\ndeclare\n  v_compte text;',
     'security definer\nas $$\ndeclare\n  v_compte text;', ['S1']),
    ('la migration touche ft_comptes au passage', F1,
     'alter table public.ft_jetons enable row level security;',
     'alter table public.ft_jetons enable row level security;\n'
     'alter table public.ft_comptes force row level security;',
     ['W4']),
    # [!!] ON RENOMME LE PARAMETRE, ON N'EN AJOUTE PAS UN. Ma premiere version ajoutait un
    #      troisieme argument : la signature changeait, les `revoke`/`grant` qui la nomment ne
    #      trouvaient plus la fonction, et la migration echouait AVANT d'atteindre le temoin.
    #      Elle etait attrapee, mais par A1 — c'est-a-dire qu'elle ne prouvait rien sur S4.
    ('la fonction d ecriture reprend une adresse en parametre', F2,
     'public.ft_enregistrer_instantane(p_hachage text, p_data jsonb)\nreturns void',
     'public.ft_enregistrer_instantane(p_email text, p_data jsonb)\nreturns void',
     ['S4']),
    ('la contrainte de coherence de revocation disparait', F1,
     'check (revoque_le is null or revoque);', 'check (true);', ['F4']),
]


def main():
    conformes = 0
    for nom, fich, avant, apres, temoins in MUTATIONS:
        tmp = tempfile.mkdtemp(prefix='mig_')
        dst = os.path.join(tmp, 'migrations')
        shutil.copytree(MIG, dst)
        src = open(os.path.join(dst, fich), encoding='utf-8').read()
        if src.count(avant) != 1:
            print('  INVALIDE  %-68s (ancre %s dans %s)'
                  % (nom, 'absente' if avant not in src else 'multiple', fich))
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        open(os.path.join(dst, fich), 'w', encoding='utf-8').write(src.replace(avant, apres))

        r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools',
                                                         'test_migrations_s2b.py')],
                           capture_output=True, text=True,
                           env=dict(os.environ, FT_MIG=dst))
        sortie = r.stdout + r.stderr
        rouges = [l.split('!!')[1].strip().split(' ')[0]
                  for l in sortie.split('\n') if l.strip().startswith('!!')]
        attrapes = [w for w in temoins if any(x.startswith(w) for x in rouges)]
        ok = len(attrapes) == len(temoins)
        conformes += ok
        print('  %s  %-68s rouges: %s'
              % ('OK ' if ok else '!! ', nom,
                 ','.join(sorted(set(rouges))[:6]) or '(aucun)'))
        if not ok:
            manquants = [w for w in temoins if w not in attrapes]
            print('       temoins attendus et NON rouges : %s' % ', '.join(manquants))
        shutil.rmtree(tmp, ignore_errors=True)

    print('\n%d/%d conformes' % (conformes, len(MUTATIONS)))
    return 0 if conformes == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
