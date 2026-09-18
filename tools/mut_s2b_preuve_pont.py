#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF du dossier « S2-B - preuve du pont avant fermeture V2 ».

*Un garde qu'on n'a jamais vu rougir n'est pas un garde, c'est une decoration.* Chaque
mutation casse UN fait dans un arbre CLONE, relance le generateur, et exige qu'il REFUSE de
produire. Les mutations marquees [vert attendu] doivent au contraire le laisser passer : ce
sont elles qui prouvent qu'on mesure le CODE et non la documentation qui en parle.

[!!] L ARBRE EST COPIE, JAMAIS MUTE SUR PLACE (BUGS.md §60).
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# (libelle, fichier, motif, remplacement, doit_rougir)
MUTATIONS = [
    ('la table redevient lisible par service_role',
     'supabase/migrations/20260917_0001_ft_jetons.sql',
     'revoke all on table public.ft_jetons from service_role;',
     '-- (retire)', True),
    ('la table redevient lisible par anon',
     'supabase/migrations/20260917_0001_ft_jetons.sql',
     'revoke all on table public.ft_jetons from anon;',
     '-- (retire)', True),
    ('la securite au niveau ligne est desactivee',
     'supabase/migrations/20260917_0001_ft_jetons.sql',
     'alter table public.ft_jetons enable row level security;',
     '-- (retire)', True),
    ('la colonne appareil disparait du schema',
     'supabase/migrations/20260917_0001_ft_jetons.sql',
     '  appareil    text', '  libelle     text', True),
    ('la colonne cree_le perd son horodatage',
     'supabase/migrations/20260917_0001_ft_jetons.sql',
     'cree_le     timestamptz not null default now()',
     'cree_le     timestamptz', True),
    ('l insertion ecrase la date au lieu de la garder',
     'supabase/migrations/20260917_0002_rpc_s2b.sql',
     'on conflict (hachage) do nothing', 'on conflict (hachage) do update set compte=excluded.compte', True),
    ('l ecriture accepte un hache INCONNU (branche v_compte)',
     'supabase/migrations/20260917_0002_rpc_s2b.sql',
     "  if v_compte is null then\n    raise exception 'identite' using errcode = '28000';\n  end if;",
     "  if v_compte is null then\n    v_compte := 'inconnu@local';\n  end if;", True),
    ('le controle de phase 1 n attend plus un registre vide',
     'supabase/verifications/20260917_phase1_controle.sql',
     "( 7, 'lignes dans le registre'", "( 7, 'lignes du registre'", True),
    ('sbEnvoyer retombe sur l ancienne porte quand le jeton manque',
     'supabase.js', 'function sbEnvoyer(payload){',
     'function sbEnvoyer(payload){ const p_email=1;', True),
    ('la voie servie redevient l ancienne',
     'supabase.js', "const SB_VOIE = 'worker'", "const SB_VOIE = 'direct'", True),
    ('V2 serait deja fermee',
     'supabase.js', 'p_email: email', 'p_courriel: email', True),
    ('une cle de service apparait dans le code servi',
     'supabase.js', "let SB_URL  =", "let SB_FUITE='sb_secret_abc'; let SB_URL  =", True),
    ('le pont disparait de la chaine (l inscription ne le suit plus)',
     'worker.js', 'const moi = await _identiteIA(brut, env);',
     'const moi = await _identiteIB(brut, env);', True),
    ('la version servie devient illisible',
     'sw.js', "const CACHE = 'ft-v", "const CACHE = 'vX-", True),
    # ── [vert attendu] : on mesure le CODE, pas ce qui en PARLE ───────────────────────
    ('[vert attendu] un COMMENTAIRE SQL cite « revoke all ... service_role »',
     'supabase/migrations/20260917_0002_rpc_s2b.sql',
     '-- ─── 2. INSCRIRE UN JETON',
     "-- revoke all on table public.ft_jetons from service_role; (cite, pas execute)\n"
     '-- ─── 2. INSCRIRE UN JETON', False),
    ('[vert attendu] un COMMENTAIRE de supabase.js cite « p_email: email »',
     'supabase.js', 'let SB_URL  =', "// p_email: email (ancienne porte, citee)\nlet SB_URL  =",
     False),
]


def une(tmp, fichier, motif, remp, doit_rougir, libelle):
    arbre = os.path.join(tmp, 'arbre')
    if os.path.exists(arbre):
        shutil.rmtree(arbre)
    shutil.copytree(ROOT, arbre, ignore=shutil.ignore_patterns(
        '.git', 'node_modules', '__pycache__', '*.pdf'))
    p = os.path.join(arbre, fichier)
    src = open(p, encoding='utf-8').read()
    if src.count(motif) != 1:
        return None, 'ancre a %d occurrences (mutation invalide)' % src.count(motif)
    open(p, 'w', encoding='utf-8').write(src.replace(motif, remp))
    env = dict(os.environ, FT_ROOT=arbre,
               FT_OUT=os.path.join(tmp, 'sortie.pdf'))
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools',
                                                     'gen_s2b_preuve_pont_pdf.py')],
                       capture_output=True, text=True, env=env)
    rouge = r.returncode != 0
    detail = (r.stdout + r.stderr).strip().splitlines()
    detail = detail[-1][:78] if detail else ''
    return rouge, detail


def main():
    tmp = tempfile.mkdtemp(prefix='mut_pont_')
    ok = 0
    try:
        for libelle, fichier, motif, remp, doit in MUTATIONS:
            rouge, detail = une(tmp, fichier, motif, remp, doit, libelle)
            if rouge is None:
                print('  !!   %-62s %s' % (libelle[:62], detail))
                continue
            conforme = (rouge == doit)
            ok += 1 if conforme else 0
            print('  %s %-62s %-8s %s' % ('OK  ' if conforme else '!!  ',
                                          libelle[:62],
                                          'ROUGE' if rouge else 'VERT', detail))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (ok, len(MUTATIONS)))
    return 0 if ok == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
