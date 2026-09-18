#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF du dossier « Miroir multi-appareils et concurrence ».

Chaque mutation casse UN fait dans un arbre CLONE et exige que le generateur REFUSE de
produire. Les [vert attendu] doivent passer : elles prouvent qu on mesure le CODE, pas la
documentation qui en parle.
"""
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J2 = 'supabase/migrations/20260917_0002_rpc_s2b.sql'

MUTATIONS = [
    # ── le corps de sauvegarde ────────────────────────────────────────────────────────
    ('un DEUXIEME champ devient omissible',
     'setup.js', 'prs:S.prs||{},', 'prs:S.prsVide?undefined:(S.prs||{}),', True),
    ('l omission volontaire des seances disparait',
     'setup.js', 'sessions:S.histTronque?undefined:(S.sessions||[]).slice(0,2000)',
     'sessions:(S.sessions||[]).slice(0,2000)', True),
    # ── la semantique Apps Script ─────────────────────────────────────────────────────
    ('Apps Script cesse de proteger un champ (weightLog)',
     'Code.js', 'if (body.weightLog !== undefined) {', 'if (true) {', True),
    ('l aide _pa_ cesse de conserver un champ absent',
     'Code.js', 'function _pa_(b, e){ if(b===undefined)return e;',
     'function _pa_(b, e){ if(b===undefined)return [];', True),
    ('l aide _pa_ cesse de refuser un tableau vide',
     'Code.js', 'return(bi.length>0||ei.length===0)?bi:ei;', 'return bi;', True),
    ('l aide _po_ change de contrat',
     'Code.js', 'function _po_(b, e){ if(b===undefined)return e;',
     'function _po_(b, e){ if(b===undefined)return {};', True),
    ('le garde anti-retrecissement des seances disparait',
     'Code.js', 'const SEUIL_MINI = 30, PART_MINI = 0.6;',
     'const SEUIL_MINI = 0, PART_MINI = 0;', True),
    ('un DEUXIEME champ gagne un garde anti-retrecissement',
     'Code.js',
     "      if (inWL.length === 0 && exWL.length > 0) {",
     "      if (inWL.length < exWL.length * PART_MINI) {", True),
    ('weightLog perd son garde anti-vidage',
     'Code.js', '      if (inWL.length === 0 && exWL.length > 0) {\n'
                "        Logger.log('[FT GARDE-FOU weightLog] refusé : ' + exWL.length + "
                "' entrées conservées');\n      } else { existing.weightLog = inWL; }",
     '      existing.weightLog = inWL;', True),
    # ── la semantique Supabase ────────────────────────────────────────────────────────
    ('le miroir se met a fusionner (l option B serait deja faite)',
     J2, 'set data = excluded.data, updated_at = now();',
     'set data = public.ft_comptes.data || excluded.data, updated_at = now();', True),
    ('un garde de version apparait dans le miroir',
     J2, '  on conflict (email) do update',
     '  on conflict (email) do update where excluded.updated_at > ft_comptes.updated_at', True),
    # ── un mecanisme de revision existerait deja ──────────────────────────────────────
    ('une revision existe deja cote client',
     'setup.js', 'const _corpsSync={', 'const revision=1; const _corpsSync={', True),
    # ── l etat du chantier ────────────────────────────────────────────────────────────
    ('V2 serait deja fermee', 'supabase.js', 'p_email: email', 'p_courriel: email', True),
    ('la voie servie redevient l ancienne',
     'supabase.js', "const SB_VOIE = 'worker'", "const SB_VOIE = 'direct'", True),
    ('la version servie devient illisible',
     'sw.js', "const CACHE = 'ft-v", "const CACHE = 'vX-", True),
    # ── [vert attendu] ───────────────────────────────────────────────────────────────
    ('[vert attendu] un COMMENTAIRE SQL cite « data || excluded.data »',
     J2, '-- ─── 2. INSCRIRE UN JETON',
     '-- piste etudiee : set data = public.ft_comptes.data || excluded.data (citee)\n'
     '-- ─── 2. INSCRIRE UN JETON', False),
    ('[vert attendu] un COMMENTAIRE de setup.js cite « revision »',
     'setup.js', 'const _corpsSync={',
     '// piste etudiee : une revision monotone cote client (citee, pas posee)\n'
     '  const _corpsSync={', False),
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
                        os.path.join(ROOT, 'tools', 'gen_miroir_concurrence_pdf.py')],
                       capture_output=True, text=True, env=env)
    d = (r.stdout + r.stderr).strip().splitlines()
    return r.returncode != 0, (d[-1][:76] if d else '')


def main():
    tmp = tempfile.mkdtemp(prefix='mut_mir_')
    ok = 0
    try:
        for libelle, fichier, motif, remp, doit in MUTATIONS:
            rouge, detail = une(tmp, fichier, motif, remp)
            if rouge is None:
                print('  !!   %-58s %s' % (libelle[:58], detail))
                continue
            conforme = (rouge == doit)
            ok += 1 if conforme else 0
            print('  %s %-58s %-8s %s' % ('OK  ' if conforme else '!!  ', libelle[:58],
                                          'ROUGE' if rouge else 'VERT', detail))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (ok, len(MUTATIONS)))
    return 0 if ok == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
