#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Controle negatif des gardes du dossier « mesure en reseau reel ».

[!!] Arbre CLONE a chaque fois (BUGS.md §60), et JOURNAL clone aussi : le releve est une
     entree de la garde au meme titre que le code.

[!!] Deux mutations doivent rester VERTES — un simple COMMENTAIRE qui cite les mots que les
     gardes cherchent. C est la seule facon de prouver qu on mesure le CODE et non la
     documentation, et ce fichier-la est tres commente.
"""
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEN = 'tools/gen_s2b_mesure_reelle_pdf.py'
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
LOG = os.path.join(SCRATCH, 'mesure_s2b_reelle.log')

W, C, CJ, CO, SB, SW = 'worker.js', 'Code.js', 'Code.js', 'constants.js', 'supabase.js', 'sw.js'
LG = '@@LOG@@'

MUTATIONS = [
    # ── la position de la route ─────────────────────────────────────────────────────────
    ('la route passe APRES le relais attrape-tout', W,
     "    if (body.action === 'cloudSave') {\n      const r = await cloudSave(body, env);\n"
     "      return json(r.corps, r.statut);\n    }\n", '', 'ROUGE'),

    # ── ce qui rend la lecture du 401 possible ──────────────────────────────────────────
    ('« inconnu » devient une chaine du Worker (la raison ne designe plus le pont)', W,
     'const _FORME_JETON = /^[0-9a-f]{64}$/;',
     "const _RAISON_PAR_DEFAUT = 'inconnu';\nconst _FORME_JETON = /^[0-9a-f]{64}$/;", 'ROUGE'),
    ('le 401 ne relaie plus la raison du pont', W,
     "return { statut: 401, corps: { status: 'error', error: 'auth', raison: moi.raison } };",
     "return { statut: 401, corps: { status: 'error', error: 'auth' } };", 'ROUGE'),
    ('la branche « forme » disparait', W,
     "return { statut: 401, corps: { status: 'error', error: 'auth', raison: 'forme' } };",
     "return { statut: 401, corps: { status: 'error', error: 'auth' } };", 'ROUGE'),

    # ── ce qui prouve que les secrets sont vus ──────────────────────────────────────────
    ('la branche « config » disparait (un refus ne prouve plus rien sur les secrets)', W,
     "if (!base || !cle) return { ok: false, statut: 0, raison: 'config' };",
     "if (!base || !cle) return { ok: false, statut: 0, raison: 'refus' };", 'ROUGE'),
    ('un 5xx redevient un refus d identite', W,
     "raison: r.ok ? '' : (r.status >= 500 ? 'panne' : 'refus') };",
     "raison: r.ok ? '' : 'refus' };", 'ROUGE'),
    ('la branche « reseau » disparait', W,
     "  } catch (e) {\n    return { ok: false, statut: 0, raison: 'reseau' };\n  }\n}",
     "  } catch (e) {\n    return { ok: false, statut: 0, raison: 'refus' };\n  }\n}", 'ROUGE'),

    # ── le pont, cote Apps Script ───────────────────────────────────────────────────────
    ('le pont n ecrit plus « inconnu » quand le jeton est absent du registre', CJ,
     "if (!raw) return { ok: false, raison: 'inconnu' };",
     "if (!raw) return { ok: false, raison: 'absent' };", 'ROUGE'),
    ('le pont ne controle plus la longueur du jeton', CJ,
     "if (b.length !== 64) return { ok: false, raison: 'absent' };", '', 'ROUGE'),

    # ── ce qui rendait l essai sur ──────────────────────────────────────────────────────
    ('l injecteur ecrase desormais un jeton fourni', CO,
     "&& !o.token){", '){', 'ROUGE'),

    # ── l etat que le document decrit ───────────────────────────────────────────────────
    ('V2 serait fermee : le client n envoie plus d adresse', SB,
     'p_email: email', 'p_email: "x"', 'ROUGE'),
    ('la version servie devient illisible', SW,
     "const CACHE = 'ft-v", "const CACHE = 'vNN-", 'ROUGE'),

    # ── LE RELEVE : il est une entree de la garde, pas un souvenir ──────────────────────
    ('le releve annonce un succes au lieu du refus', LG,
     'STATUT 401 |', 'STATUT 200 |', 'ROUGE'),
    ('la raison relevee change', LG,
     '"raison":"inconnu"', '"raison":"refus"', 'ROUGE'),
    ('un VRAI jeton se glisse dans le journal', LG,
     "Jeton         : factice",
     "Jeton         : 9f3ac1d0e5b7248fa6c13e0d9b82577c4e61a0fd3b95c27ea814d60f7b23ce85 factice",
     'ROUGE'),
    ('le journal ne dit plus qu aucune ecriture n a eu lieu', LG,
     "Ecriture      : aucune (le refus tombe avant toute ecriture)",
     "Ecriture      : sans objet", 'ROUGE'),

    # ── CONTROLES NEGATIFS : doivent rester VERTS ───────────────────────────────────────
    ('[negatif] un COMMENTAIRE du Worker cite « inconnu »', W,
     'const _FORME_JETON = /^[0-9a-f]{64}$/;',
     "// rappel : ce fichier n ecrit jamais 'inconnu' lui-meme, c est le pont qui le dit\n"
     'const _FORME_JETON = /^[0-9a-f]{64}$/;', 'VERT'),
    ('[negatif] un COMMENTAIRE du client cite p_email et config', SB,
     'function sbMirror(payload){',
     "// note : p_email et raison 'config' sont cites ici, dans un commentaire\n"
     'function sbMirror(payload){', 'VERT'),
]


def main():
    conformes = 0
    for nom, fich, avant, apres, attendu in MUTATIONS:
        tmp = tempfile.mkdtemp(prefix='m2b_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(ROOT, arbre, ignore=shutil.ignore_patterns(
            '.git', 'node_modules', '*.pdf'))
        journal = os.path.join(tmp, 'mesure.log')
        shutil.copyfile(LOG, journal)

        cible = journal if fich == LG else os.path.join(arbre, fich)
        src = open(cible, encoding='utf-8').read()
        if src.count(avant) != 1:
            print('  INVALIDE  %-66s (ancre %s)'
                  % (nom, 'absente' if avant not in src else 'multiple'))
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        neuf = src.replace(avant, apres)
        if neuf == src:
            print('  INVALIDE  %-66s (mutation sans effet)' % nom)
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        open(cible, 'w', encoding='utf-8').write(neuf)

        env = dict(os.environ, FT_ROOT=arbre, FT_LOG=journal,
                   FT_OUT=os.path.join(tmp, 'essai.pdf'))
        r = subprocess.run([sys.executable, os.path.join(arbre, GEN)],
                           capture_output=True, text=True, env=env, cwd=arbre)
        sortie = (r.stdout + r.stderr).strip().split('\n')[-1][:60]
        # [!!] UN PLANTAGE PYTHON N'EST PAS UNE GARDE ROUGE : il ne nomme pas le defaut.
        #      On exige donc une sortie qui commence par « GARDE ROUGE » ou « POLICE ».
        rouge = r.returncode != 0 and (sortie.startswith('GARDE ROUGE')
                                       or sortie.startswith('POLICE'))
        plante = r.returncode != 0 and not rouge
        obtenu = 'PLANTAGE' if plante else ('ROUGE' if rouge else 'VERT')
        ok = (obtenu == attendu)
        conformes += ok
        print('  %s  %-66s %-8s %s'
              % ('OK ' if ok else '!! ', nom, obtenu, sortie if obtenu != 'VERT' else ''))
        shutil.rmtree(tmp, ignore_errors=True)

    print('\n%d/%d conformes' % (conformes, len(MUTATIONS)))
    return 0 if conformes == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
