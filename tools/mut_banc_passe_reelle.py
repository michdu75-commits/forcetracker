#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF du dossier « premiere passe reelle du banc » (21/09/2026).

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).

CE QU'IL DOIT PROUVER
    Ce dossier ne raconte rien : il RECOMPTE. Ses gardes doivent donc mordre sur les trois
    facons de mentir avec des chiffres :
      1. le TOTAL ne correspond pas aux verdicts (le cas ft-v1201 : un total publie pendant
         que la passe tournait encore) ;
      2. les COMPTES sont justes mais les ENSEMBLES sont faux (un scenario joue deux fois,
         un autre jamais) — *un compte juste ne prouve pas que ce sont les bons* ;
      3. la passe n'a pas vraiment mesure (des « sans reponse », le HTTP 401 du run #2).

    ⛔ Et un garde a l'ENVERS : si quelqu'un corrige la condition du workflow, le dossier
      decrit un defaut REPARE et doit REFUSER de se produire (R30).

    ⭐ TROIS mutations doivent rester VERTES. Deux touchent des COMMENTAIRES du workflow et
      de l'en-tete du journal, en y citant les mots que les gardes cherchent (« push: »,
      « schedule: », « sans reponse ») ; la troisieme ajoute une ligne d'en-tete qui cite un
      identifiant et un chiffre. C'est la seule facon de prouver qu'on mesure LA MESURE et
      non la phrase qui l'explique — et R30 exige justement qu'elle soit ecrite la.

Usage : python3 tools/mut_banc_passe_reelle.py
"""
import os
import shutil
import subprocess
import sys
import tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEN = 'tools/gen_banc_passe_reelle_pdf.py'
JOURNAL = 'tests/milo/passe-reelle-2026-09-20.txt'
WF = '.github/workflows/banc-milo.yml'
SCEN = 'tests/milo/eval-scenarios.js'

MUT = [
    # ══ 1. LE TOTAL MENT ═══════════════════════════════════════════════════════════════
    ('M01  le total du runner ne colle plus aux verdicts', JOURNAL,
     '51 vert(s) · 6 rouge(s)', '50 vert(s) · 6 rouge(s)', 'GARDE'),

    ('M02  la ligne de total disparait (passe non terminee)', JOURNAL,
     '══ Sonnet 4.6 (production) : 51 vert(s) · 6 rouge(s)',
     '   (passe interrompue)', 'GARDE'),

    # ══ 2. LES COMPTES SONT JUSTES, LES ENSEMBLES SONT FAUX ════════════════════════════
    ("M03  un scenario joue DEUX fois, un autre jamais (51+6=57 reste vrai)", JOURNAL,
     '✅ EV-024 — Un exercice DEMANDÉ nommément se retrouve dans la séance',
     '✅ EV-022 — Un exercice DEMANDÉ nommément se retrouve dans la séance',
     'GARDE'),

    ('M04  un identifiant du journal n existe pas dans le banc', JOURNAL,
     '✅ EV-030 —', '✅ EV-099 —', 'GARDE'),

    ('M05  le bloc de synthese nomme un autre rouge que les verdicts', JOURNAL,
     '\U0001f534 EV-045 (23/08/2026)', '\U0001f534 EV-044 (23/08/2026)', 'GARDE'),

    # ══ 3. LA PASSE N A PAS VRAIMENT MESURE ════════════════════════════════════════════
    ('M06  des scenarios restent SANS REPONSE (le 401 du run #2)', JOURNAL,
     '51 vert(s) · 6 rouge(s)', '50 vert(s) · 6 rouge(s) · 1 sans réponse', 'GARDE'),

    ('M07  un verdict est remplace par une erreur HTTP', JOURNAL,
     '✅ EV-001 — Il ne prescrit pas une charge',
     '⛔ EV-001 — pas de réponse (http_error) : HTTP 401 — Il ne prescrit pas une charge',
     'GARDE'),

    # ⚠️ PREMIERE VERSION DE CETTE MUTATION : elle remplacait « run 35537012441 ». Elle est
    #    restee VERTE, et le garde avait RAISON — l'identifiant du run figure DEUX fois dans
    #    l'en-tete (en clair et dans l'URL), donc l'ancrage tenait encore. *Ma mutation ne
    #    retirait pas ce qu'elle pretendait retirer.* On vise donc l'identifiant du JOB, qui
    #    n'apparait qu'une fois. Le fait que le run soit ecrit deux fois est une propriete
    #    utile, pas un defaut : il faut deux gestes pour effacer la provenance.
    ('M08  le journal perd son ancrage (plus de job, donc plus de preuve)', JOURNAL,
     'job 106147738195', 'job inconnu', 'GARDE'),

    # ══ 4. UN ROUGE CHANGE DE NATURE ═══════════════════════════════════════════════════
    ("M09  EV-056 n annonce plus « zero exercice » : la nuance du dossier devient fausse",
     JOURNAL, "ce n'est pas une séance haut du corps (0)",
     "ce n'est pas une séance haut du corps (2)", 'GARDE'),

    # ══ 5. UN GARDE-FOU DU WORKFLOW DISPARAIT ══════════════════════════════════════════
    ('M10  le workflow repart sur push', WF,
     'on:\n  workflow_dispatch:', 'on:\n  push:\n    branches: [master]\n  workflow_dispatch:',
     'GARDE'),

    ('M11  la confirmation LANCER disparait', WF,
     '!= "LANCER" ]; then', '!= "OKOK" ]; then', 'GARDE'),

    ('M12  le workflow ne refuse plus quand le secret manque', WF,
     'if [ -z "$FT_BANC_TOKEN" ]; then', 'if false; then', 'GARDE'),

    # ══ 6. LE GARDE A L ENVERS — le defaut decrit a ete CORRIGE ════════════════════════
    ("M13  la condition de l etape « reference » est corrigee : le dossier est PERIME", WF,
     "        if: ${{ github.event.inputs.enregistrer != 'non' }}",
     "        if: ${{ always() && github.event.inputs.enregistrer != 'non' }}", 'GARDE'),

    ('M14  l etape « Enregistrer la reference » perd sa condition', WF,
     "        if: ${{ github.event.inputs.enregistrer != 'non' }}",
     '        # plus de condition du tout', 'GARDE'),

    # ══ 7. LE BANC LUI-MEME CHANGE ═════════════════════════════════════════════════════
    ('M15  un scenario disparait du banc (56 declares, 57 joues)', SCEN,
     "id:'EV-030'", "id:'EV-930'", 'GARDE'),

    # ══ CONTROLES NEGATIFS — DOIVENT RESTER VERTS ══════════════════════════════════════
    ('[negatif] un COMMENTAIRE du workflow cite « push: » et « schedule: »', WF,
     'on:\n  workflow_dispatch:',
     '# volontairement AUCUN declencheur push: ni schedule: - une passe coute 57 appels\n'
     'on:\n  workflow_dispatch:', 'OK'),

    ("[negatif] l EN-TETE du journal cite « sans reponse » en expliquant le run precedent",
     JOURNAL, '# AUCUNE CONVERSATION',
     '# Rappel : au run precedent le total disait « 0 vert(s) - 0 rouge(s) - 1 sans '
     'réponse »\n# (HTTP 401). Ici il n y en a aucun, et c est tout l interet.\n'
     '# AUCUNE CONVERSATION', 'OK'),

    ("[negatif] l EN-TETE cite un identifiant et un total", JOURNAL,
     '# AUCUNE CONVERSATION',
     '# Pour memoire : EV-007 et EV-042 sont le meme defaut ; total 51 vert(s) - 6 rouge(s).\n'
     '# AUCUNE CONVERSATION', 'OK'),
]


def main():
    env = dict(os.environ, FT_CONTROLE_NEGATIF='1')
    tmp0 = tempfile.mkdtemp(prefix='bpr_sain_')
    sain = os.path.join(tmp0, 'a')
    shutil.copytree(SRC, sain, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf'))
    r0 = subprocess.run([sys.executable, GEN], cwd=sain, capture_output=True, text=True,
                        env=dict(env, FT_ROOT=sain, FT_OUT=os.path.join(tmp0, 'x.pdf')))
    if r0.returncode != 0:
        print('  !! ARBRE SAIN DEJA ROUGE : %s' % (r0.stdout + r0.stderr).strip()[:150])
        print('     -> un controle negatif dont le point de depart est faux ne prouve rien.')
        shutil.rmtree(tmp0, ignore_errors=True)
        return 1
    print('  arbre sain : le generateur produit (point de depart valide)\n')
    shutil.rmtree(tmp0, ignore_errors=True)

    conformes = 0
    for nom, fich, avant, apres, attendu in MUT:
        tmp = tempfile.mkdtemp(prefix='bpr_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(SRC, arbre, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf'))
        cible = os.path.join(arbre, fich)
        src = open(cible, encoding='utf-8').read()
        n = src.count(avant)
        if n != 1:
            print('  INVALIDE  %-70s (ancre %s)'
                  % (nom, 'absente' if n == 0 else '%d fois' % n))
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        open(cible, 'w', encoding='utf-8').write(src.replace(avant, apres, 1))

        r = subprocess.run([sys.executable, GEN], cwd=arbre, capture_output=True, text=True,
                           env=dict(env, FT_ROOT=arbre, FT_OUT=os.path.join(tmp, 'x.pdf')))
        sortie = (r.stdout + r.stderr).strip().split('\n')[0]
        obtenu = 'GARDE' if r.returncode else 'OK'
        ok = (obtenu == attendu)
        conformes += ok
        print('  %s  %-70s %-6s %s' % ('OK ' if ok else '!! ', nom, obtenu,
                                       sortie[:48] if r.returncode else ''))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    sys.exit(main())
