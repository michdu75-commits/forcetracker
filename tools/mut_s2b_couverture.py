#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF du dossier « S2-B - couverture multi-appareils avant fermeture V2 ».

Chaque mutation casse UN fait dans un arbre CLONE et exige que le generateur REFUSE de
produire. Les mutations [vert attendu] doivent au contraire passer : elles prouvent qu on
mesure le CODE et non la documentation qui en parle.
"""
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J1 = 'supabase/migrations/20260917_0001_ft_jetons.sql'
J2 = 'supabase/migrations/20260917_0002_rpc_s2b.sql'

MUTATIONS = [
    # ── le multi-appareils casse par la FORME de la table ────────────────────────────
    ('compte devient UNIQUE (un seul appareil par compte)',
     J1, '  compte      text        not null,', '  compte      text        not null unique,', True),
    ('la cle primaire passe du hache au compte',
     J1, '  hachage     text        primary key,', '  hachage     text        not null,', True),
    ('l index par compte disparait',
     J1, 'create index if not exists ft_jetons_compte_idx on public.ft_jetons (compte);',
     '-- (retire)', True),
    ('la colonne revoque_le disparait',
     J1, '  revoque_le  timestamptz,', '  supprime_le timestamptz,', True),
    # ── la revocation cesse d etre par appareil ──────────────────────────────────────
    ('la revocation vise le COMPTE au lieu du hache',
     J2, '   where hachage = p_hachage\n     and revoque = false;',
     '   where compte = p_hachage\n     and revoque = false;', True),
    ('la resolution ne filtre plus les jetons revoques',
     J2, '   where j.hachage = p_hachage\n     and j.revoque = false;',
     '   where j.hachage = p_hachage;', True),
    # ── la cle de jointure ───────────────────────────────────────────────────────────
    ('ft_comptes n est plus alimentee par le compte du registre',
     J2, 'insert into public.ft_comptes (email, data, updated_at)\n  values (v_compte,',
     'insert into public.ft_comptes (email, data, updated_at)\n  values (p_hachage,', True),
    ('le Worker n inscrit plus l adresse resolue par le pont',
     'worker.js', 'p_compte: moi.email', 'p_compte: String(body.email||\'\')', True),
    ('le registre S1 cesse de normaliser l adresse',
     'Code.js', "var e = String(email || '').trim().toLowerCase();",
     "var e = String(email || '');", True),
    # ── la concurrence ───────────────────────────────────────────────────────────────
    ('le miroir cesse de remplacer l instantane en entier',
     J2, 'set data = excluded.data, updated_at = now();',
     'set data = public.ft_comptes.data || excluded.data, updated_at = now();', True),
    ('Apps Script cesse de fusionner champ par champ',
     'Code.js', 'if (body.sessions !== undefined) {', 'if (true) {', True),
    ('le garde-fou anti-retrecissement d Apps Script disparait',
     'Code.js', 'const SEUIL_MINI = 30, PART_MINI = 0.6;',
     'const SEUIL_MINI = 0, PART_MINI = 0;', True),
    ('l omission des seances tronquees disparait',
     'setup.js', 'sessions:S.histTronque?undefined:(S.sessions||[]).slice(0,2000)',
     'sessions:(S.sessions||[]).slice(0,2000)', True),
    # ── l etat du chantier ───────────────────────────────────────────────────────────
    ('V2 serait deja fermee', 'supabase.js', 'p_email: email', 'p_courriel: email', True),
    ('la voie servie redevient l ancienne',
     'supabase.js', "const SB_VOIE = 'worker'", "const SB_VOIE = 'direct'", True),
    ('la version servie devient illisible',
     'sw.js', "const CACHE = 'ft-v", "const CACHE = 'vX-", True),
    # ── [vert attendu] : on mesure le CODE, pas ce qui en PARLE ──────────────────────
    ('[vert attendu] un COMMENTAIRE SQL cite « unique » et « primary key »',
     J2, '-- ─── 2. INSCRIRE UN JETON',
     '-- rappel : compte text not null unique / hachage primary key (cite, pas execute)\n'
     '-- ─── 2. INSCRIRE UN JETON', False),
    ('[vert attendu] un COMMENTAIRE de supabase.js cite « p_email: email »',
     'supabase.js', 'let SB_URL  =', "// p_email: email (ancienne porte, citee)\nlet SB_URL  =",
     False),
]


def une(tmp, fichier, motif, remp):
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
    env = dict(os.environ, FT_ROOT=arbre, FT_OUT=os.path.join(tmp, 'sortie.pdf'))
    r = subprocess.run([sys.executable,
                        os.path.join(ROOT, 'tools', 'gen_s2b_couverture_pdf.py')],
                       capture_output=True, text=True, env=env)
    detail = (r.stdout + r.stderr).strip().splitlines()
    return r.returncode != 0, (detail[-1][:78] if detail else '')


def main():
    tmp = tempfile.mkdtemp(prefix='mut_couv_')
    ok = 0
    try:
        for libelle, fichier, motif, remp, doit in MUTATIONS:
            rouge, detail = une(tmp, fichier, motif, remp)
            if rouge is None:
                print('  !!   %-60s %s' % (libelle[:60], detail))
                continue
            conforme = (rouge == doit)
            ok += 1 if conforme else 0
            print('  %s %-60s %-8s %s' % ('OK  ' if conforme else '!!  ', libelle[:60],
                                          'ROUGE' if rouge else 'VERT', detail))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (ok, len(MUTATIONS)))
    return 0 if ok == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
