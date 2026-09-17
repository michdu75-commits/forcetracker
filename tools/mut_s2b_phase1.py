#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Controle negatif du dossier S2-B phase 1. Mutations sur un arbre CLONE.

[!!] Les mutations du DOCUMENT sont bornees entre @@DEBUT@@ et @@FIN@@ : sans cette borne,
     une mutation reecrirait la GARDE en meme temps que le texte, et se prouverait elle-meme.

[!!] Les mutations de JOURNAL sont ecrites dans une copie du journal, pas dans l'original :
     un dossier doit refuser de publier un total tronque ou faux, et c'est ce qu'on eprouve.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEN = 'tools/gen_s2b_phase1_pdf.py'
MIG1 = 'supabase/migrations/20260917_0001_ft_jetons.sql'
MIG2 = 'supabase/migrations/20260917_0002_rpc_s2b.sql'
LOG_BANC = '/tmp/banc_s2b.log'
LOG_MUT = '/tmp/mut_s2b.log'

# (nom, quoi, avant, apres, attendu) ; quoi = fichier du depot, ou '@@BANC@@' / '@@MUT@@'
MUTATIONS = [
    # ── le SQL versionne ─────────────────────────────────────────────────────────────
    ('FORCE RLS revient dans la migration', MIG1,
     'alter table public.ft_jetons enable row level security;',
     'alter table public.ft_jetons force row level security;', 'ROUGE'),
    ('un revoke de table disparait', MIG1,
     'revoke all on table public.ft_jetons from service_role;', '-- retire', 'ROUGE'),
    ('la migration modifie la table des comptes', MIG1,
     'create index if not exists ft_jetons_compte_idx on public.ft_jetons (compte);',
     'alter table public.ft_comptes add column x int;', 'ROUGE'),
    ('la migration detruit quelque chose', MIG1,
     'create index if not exists ft_jetons_compte_idx on public.ft_jetons (compte);',
     'drop table if exists public.ft_jetons_vieux;', 'ROUGE'),
    ('la cle publique recoit le droit d executer', MIG2,
     'grant execute on function public.ft_revoquer_jeton(text)                to service_role;',
     'grant execute on function public.ft_revoquer_jeton(text)                to anon;',
     'ROUGE'),
    ('une adresse revient dans la signature de la fonction d ecriture', MIG2,
     'public.ft_enregistrer_instantane(p_hachage text, p_data jsonb)\nreturns void',
     'public.ft_enregistrer_instantane(p_email text, p_data jsonb)\nreturns void', 'ROUGE'),
    ('le retrait defensif perd une cle', MIG2,
     "- 'apikey' - 'authorization',", "- 'authorization',", 'ROUGE'),
    ('les deux refus cessent d etre identiques', MIG2,
     "  if v_compte is null then\n    raise exception 'identite'",
     "  if v_compte is null then\n    raise exception 'inconnu'", 'ROUGE'),
    ('l inscription autorise le re-pointage', MIG2,
     'on conflict (hachage) do nothing;',
     'on conflict (hachage) do update set compte = excluded.compte;', 'ROUGE'),
    ('une fonction perd son chemin de recherche fixe', MIG2,
     'security definer\nset search_path = public, pg_temp\nas $$\ndeclare\n  n int;\nbegin\n'
     "  if p_hachage is null or p_hachage !~ '^[0-9a-f]{64}$' then\n"
     "    raise exception 'hachage' using errcode = '22023';\n  end if;\n\n  update",
     'security definer\nas $$\ndeclare\n  n int;\nbegin\n'
     "  if p_hachage is null or p_hachage !~ '^[0-9a-f]{64}$' then\n"
     "    raise exception 'hachage' using errcode = '22023';\n  end if;\n\n  update", 'ROUGE'),

    # ── le code servi ────────────────────────────────────────────────────────────────
    ('V2 refermee dans le client', 'supabase.js', 'p_email: email', 'p_email: "x"', 'ROUGE'),

    # ── les journaux : un total tronque n'est jamais vert ────────────────────────────
    ('@@BANC@@ le journal du banc perd sa ligne de total', '@@BANC@@',
     ' OK / 0 rouge', ' temoins joues', 'ROUGE'),
    ('@@BANC@@ le banc porte un rouge', '@@BANC@@', ' OK / 0 rouge', ' OK / 1 rouge', 'ROUGE'),
    ('@@BANC@@ le retour arriere n a pas ete joue', '@@BANC@@',
     'Z1 le retour arriere s execute', 'Z1 autre chose', 'ROUGE'),
    ('@@BANC@@ la mesure du piege FORCE a disparu', '@@BANC@@', 'X2 FORCE', 'X2 autre', 'ROUGE'),
    ('@@MUT@@ une mutation ne mord pas', '@@MUT@@', '15/15 conformes', '14/15 conformes',
     'ROUGE'),
    ('@@MUT@@ une mutation ne s est pas appliquee', '@@MUT@@',
     '15/15 conformes', 'INVALIDE quelque chose\n15/15 conformes', 'ROUGE'),

    # ── le document lui-meme ─────────────────────────────────────────────────────────
    ('@@DOC@@ le document annonce que V2 est fermee', GEN,
     "H.append(P('5. Ce que ce banc ne prouve pas', 'h1'))",
     "H.append(P('V2 est fermee.', 'p'))\n"
     "H.append(P('5. Ce que ce banc ne prouve pas', 'h1'))", 'ROUGE'),
    ('@@DOC@@ le document annonce le SQL deja applique chez Supabase', GEN,
     "H.append(P('5. Ce que ce banc ne prouve pas', 'h1'))",
     "H.append(P('Le SQL a ete applique dans Supabase.', 'p'))\n"
     "H.append(P('5. Ce que ce banc ne prouve pas', 'h1'))", 'ROUGE'),
    ('@@DOC@@ le document banalise FORCE', GEN,
     "H.append(P('5. Ce que ce banc ne prouve pas', 'h1'))",
     "H.append(P('Force est sans danger.', 'p'))\n"
     "H.append(P('5. Ce que ce banc ne prouve pas', 'h1'))", 'ROUGE'),
    ('@@DOC@@ le document pretend prouver le deploiement', GEN,
     "H.append(P('5. Ce que ce banc ne prouve pas', 'h1'))",
     "H.append(P('Ce banc prouve le deploiement.', 'p'))\n"
     "H.append(P('5. Ce que ce banc ne prouve pas', 'h1'))", 'ROUGE'),
    ('@@DOC@@ la borne du banc local disparait', GEN,
     'banc de semantique SQL, pas une preuve de deploiement',
     'banc complet, et une preuve suffisante', 'ROUGE'),
    ('@@DOC@@ la raison pour laquelle B n est pas prouve disparait', GEN,
     '<b>injoignable depuis le conteneur</b> - le mandataire reseau refuse le domaine. ',
     'indisponible. ', 'ROUGE'),
    ('@@DOC@@ le retour arriere n est plus donne avec l etape d ecriture', GEN,
     "RETOUR_TXT = ('<b>Retour arriere</b>, si quoi que ce soit cloche.",
     "RETOUR_TXT = ('<b>Sans filet</b>, si quoi que ce soit cloche.", 'ROUGE'),
    ('@@DOC@@ le retour arriere devient incomplet', GEN,
     "              'drop table if exists public.ft_jetons;')",
     "              '')", 'ROUGE'),
    ('@@DOC@@ un extrait de SQL cite ne vient plus du fichier', GEN,
     "    'create or replace function public.ft_enregistrer_instantane(p_hachage text, "
     "p_data jsonb)',",
     "    'create or replace function public.ft_enregistrer_instantane(p_mail text, "
     "p_data jsonb)',", 'ROUGE'),

    # ── CONTROLES NEGATIFS : doivent rester VERTS ────────────────────────────────────
    ('[negatif] ft_miroir nomme dans un COMMENTAIRE de migration', MIG1,
     '-- ════════════════════════════════════════════════════════════════════════════════════════\n\ncreate table if not exists public.ft_jetons',
     '-- note : ft_miroir et ft_comptes ne sont pas touchees ici\n'
     '-- ════════════════════════════════════════════════════════════════════════════════════════\n\ncreate table if not exists public.ft_jetons',
     'VERT'),
    ('[negatif] un commentaire de migration parle de drop table', MIG2,
     '-- ─── DROITS ──────────────────────────────────────────────────────────────────────────────',
     '-- rappel : aucun drop table ni truncate dans ce chantier\n'
     '-- ─── DROITS ──────────────────────────────────────────────────────────────────────────────',
     'VERT'),
]


def borne_doc(src, avant, apres):
    d, f = src.find('# @@DEBUT@@'), src.find('# @@FIN@@')
    if d < 0 or f < 0:
        return None
    zone = src[d:f]
    if zone.count(avant) != 1:
        return None
    return src[:d] + zone.replace(avant, apres) + src[f:]


def main():
    conformes = 0
    for nom, quoi, avant, apres, attendu in MUTATIONS:
        tmp = tempfile.mkdtemp(prefix='p1_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(ROOT, arbre, ignore=shutil.ignore_patterns(
            '.git', 'node_modules', '*.pdf'))
        env = dict(os.environ, FT_ROOT=arbre, FT_OUT=os.path.join(tmp, 'x.pdf'),
                   FT_LOG_BANC=LOG_BANC, FT_LOG_MUT=LOG_MUT)

        if quoi in ('@@BANC@@', '@@MUT@@'):
            orig = LOG_BANC if quoi == '@@BANC@@' else LOG_MUT
            txt = open(orig, encoding='utf-8', errors='replace').read()
            if avant not in txt:
                print('  INVALIDE  %-64s (ancre absente du journal)' % nom)
                shutil.rmtree(tmp, ignore_errors=True)
                continue
            copie = os.path.join(tmp, 'journal.log')
            open(copie, 'w', encoding='utf-8').write(txt.replace(avant, apres))
            env['FT_LOG_BANC' if quoi == '@@BANC@@' else 'FT_LOG_MUT'] = copie
        else:
            cible = os.path.join(arbre, quoi)
            src = open(cible, encoding='utf-8').read()
            if nom.startswith('@@DOC@@'):
                neuf = borne_doc(src, avant, apres)
                if neuf is None:
                    print('  INVALIDE  %-64s (ancre absente ou multiple dans la zone)' % nom)
                    shutil.rmtree(tmp, ignore_errors=True)
                    continue
            else:
                if src.count(avant) != 1:
                    print('  INVALIDE  %-64s (ancre %s)'
                          % (nom, 'absente' if avant not in src else 'multiple'))
                    shutil.rmtree(tmp, ignore_errors=True)
                    continue
                neuf = src.replace(avant, apres)
            if neuf == src:
                print('  INVALIDE  %-64s (mutation sans effet)' % nom)
                shutil.rmtree(tmp, ignore_errors=True)
                continue
            open(cible, 'w', encoding='utf-8').write(neuf)

        r = subprocess.run([sys.executable, os.path.join(arbre, GEN)],
                           capture_output=True, text=True, env=env, cwd=arbre)
        obtenu = 'ROUGE' if r.returncode != 0 else 'VERT'
        ok = (obtenu == attendu)
        conformes += ok
        raison = ''
        if obtenu == 'ROUGE':
            raison = (r.stdout + r.stderr).strip().split('\n')[-1][:86]
        print('  %s  %-64s %s  %s' % ('OK ' if ok else '!! ', nom, obtenu, raison))
        shutil.rmtree(tmp, ignore_errors=True)

    print('\n%d/%d conformes' % (conformes, len(MUTATIONS)))
    return 0 if conformes == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
