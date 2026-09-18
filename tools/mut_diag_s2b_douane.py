#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Controle negatif du dossier « diagnostic S2-B + Douane ».

[!!] Arbre CLONE a chaque fois (BUGS.md §60), et JOURNAL clone aussi.
[!!] ⭐⭐ LA MUTATION LA PLUS IMPORTANTE CHANGE LE SEUIL DANS `CLAUDE.md` : elle prouve que le
     dossier LIT les criteres actes au lieu de les recopier de memoire. Sans elle, rien ne
     distinguerait un verdict fonde sur une decision de Michel d'un verdict fonde sur un
     seuil que j'aurais invente (regle d'or #15).
"""
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEN = 'tools/gen_diag_s2b_douane_pdf.py'
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
LOG = os.path.join(SCRATCH, 'diag_s2b_douane_1809.log')
W, SB, HT, GV = 'worker.js', 'supabase.js', 'index.html', 'CLAUDE.md'
M1 = 'supabase/migrations/20260917_0001_ft_jetons.sql'
M2 = 'supabase/migrations/20260917_0002_rpc_s2b.sql'
CT = 'supabase/verifications/20260917_phase1_controle.sql'
LG = '@@LOG@@'

MUTATIONS = [
    # ── LA CHAINE DE 4 FAITS ───────────────────────────────────────────────────────────
    ('le controle de phase 1 n attend plus un registre VIDE (fait 1)', CT,
     "( 7, 'lignes dans le registre',                  lignes_registre::text,    '0'),",
     "( 7, 'lignes dans le registre',                  lignes_registre::text,    '1'),", 'ROUGE'),
    ('la date d inscription disparait (la trace ne serait plus datee)', M1,
     'cree_le     timestamptz not null default now(),',
     'cree_le     timestamptz,', 'ROUGE'),
    ('l insertion ecrase la date (elle mentirait)', M2,
     'on conflict (hachage) do nothing;', 'on conflict (hachage) do update set cree_le = now();',
     'ROUGE'),
    ('l ecriture n exige plus un hache connu (fait 2)', M2,
     "    raise exception 'identite' using errcode = '28000';\n  end if;\n\n  -- ⭐ RETRAIT",
     "    null;\n  end if;\n\n  -- ⭐ RETRAIT", 'ROUGE'),
    ('l inscription precede le pont (fait 4)', W,
     "  const i = await _sbAppel(env, 'ft_inscrire_jeton',",
     "  const i0 = 1; const i = await _sbAppel(env, 'ft_inscrire_jeton',", 'VERT'),
    ('un role public recupere le droit d inscrire (fait 3)', M2,
     'revoke all on function public.ft_inscrire_jeton(text, text, text)    from anon;',
     '-- retire', 'ROUGE'),

    # ── ⭐⭐ LES CRITERES SONT LUS, PAS RECOPIES ───────────────────────────────────────
    ('le seuil de lignes de la Douane disparait de CLAUDE.md', GV,
     '≥ **100 lignes** réellement observées', 'beaucoup de lignes observées', 'ROUGE'),
    ('le seuil passe SOUS le nombre observe (le verdict deviendrait faux)', GV,
     '≥ **100 lignes** réellement observées', '≥ **50 lignes** réellement observées', 'ROUGE'),
    ('la consigne « jamais mordu n est pas inutile » disparait', GV,
     'jamais mordu ne doit PAS être considérée automatiquement comme inutile',
     'jamais mordu peut être retirée', 'ROUGE'),

    # ── L ETAT DU CHANTIER ─────────────────────────────────────────────────────────────
    ('V2 serait fermee', SB, 'p_email: email', 'p_email: "x"', 'ROUGE'),
    ('le defaut d affichage reviendrait', SB,
     "    return { ok:false, voie:'', info:'serveur indisponible (' + (r || '?') + ')' };",
     "    return { ok:false, voie:'', info:'identité refusée (' + (r || '?') + ')' };", 'ROUGE'),
    ('le texte de la carte reprend sa promesse', HT,
     'Le bouton <strong>teste la route sans rien écrire</strong>',
     'Le bouton écrit une ligne de test <strong>pour de vrai</strong>', 'ROUGE'),

    # ── LE RELEVE ──────────────────────────────────────────────────────────────────────
    ('le journal pretend que le pont a ete OBSERVE', LG,
     "voie:pont OBSERVEE A L'ECRAN          : NON",
     "voie:pont OBSERVEE A L'ECRAN          : OUI", 'ROUGE'),
    ('une ecriture directe disparait du releve', LG,
     'Ecriture miroir reussie, voie DIRECTE : 18/09/2026 14:15:43\n', '', 'ROUGE'),
    ('le journal annonce une cause prouvee pour la panne', LG,
     'Cause prouvee       : AUCUNE', 'Cause prouvee       : le backup', 'ROUGE'),
    ('le journal ne nomme plus l ecrivain manquant', LG,
     'quickAddFood  : 0 ligne — ECRIVAIN JAMAIS OBSERVE',
     'quickAddFood  : non renseigne', 'ROUGE'),
    ('un VRAI jeton se glisse dans le journal', LG,
     'Jeton                                 : present sur cet appareil',
     'Jeton : 9f3ac1d0e5b7248fa6c13e0d9b82577c4e61a0fd3b95c27ea814d60f7b23ce85', 'ROUGE'),

    # ── CONTROLES NEGATIFS : doivent rester VERTS ──────────────────────────────────────
    ('[negatif] un COMMENTAIRE de supabase.js cite « identite refusee »', SB,
     "const SB_VOIE = 'worker';",
     "// rappel : « identité refusée » a ete retire de ce fichier le 18/09\n"
     "const SB_VOIE = 'worker';", 'VERT'),
    ('[negatif] un COMMENTAIRE SQL cite « do update »', M2,
     '  insert into public.ft_jetons (hachage, compte, appareil)',
     "  -- note : surtout pas un « do update set cree_le = now() » ici\n"
     '  insert into public.ft_jetons (hachage, compte, appareil)', 'VERT'),
]


def main():
    conformes = 0
    for nom, fich, avant, apres, attendu in MUTATIONS:
        tmp = tempfile.mkdtemp(prefix='dia_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(ROOT, arbre, ignore=shutil.ignore_patterns(
            '.git', 'node_modules', '*.pdf'))
        journal = os.path.join(tmp, 'diag.log')
        shutil.copyfile(LOG, journal)
        cible = journal if fich == LG else os.path.join(arbre, fich)
        src = open(cible, encoding='utf-8').read()
        if src.count(avant) != 1:
            print('  INVALIDE  %-72s (ancre %s)'
                  % (nom, 'absente' if avant not in src else 'multiple'))
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        neuf = src.replace(avant, apres)
        if neuf == src:
            print('  INVALIDE  %-72s (mutation sans effet)' % nom)
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        open(cible, 'w', encoding='utf-8').write(neuf)
        env = dict(os.environ, FT_ROOT=arbre, FT_LOG=journal,
                   FT_OUT=os.path.join(tmp, 'essai.pdf'))
        r = subprocess.run([sys.executable, os.path.join(arbre, GEN)],
                           capture_output=True, text=True, env=env, cwd=arbre)
        sortie = (r.stdout + r.stderr).strip().split('\n')[-1][:62]
        rouge = r.returncode != 0 and (sortie.startswith('GARDE ROUGE')
                                       or sortie.startswith('POLICE'))
        plante = r.returncode != 0 and not rouge
        obtenu = 'PLANTAGE' if plante else ('ROUGE' if rouge else 'VERT')
        ok = (obtenu == attendu)
        conformes += ok
        print('  %s  %-72s %-8s %s'
              % ('OK ' if ok else '!! ', nom, obtenu, sortie if obtenu != 'VERT' else ''))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(MUTATIONS)))
    return 0 if conformes == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
