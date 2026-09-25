#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — les témoins du contrat FT → Milo (CTX-01…08) peuvent-ils RÉELLEMENT rougir ?

⛔ SUR UN ARBRE CLONÉ, JAMAIS SUR CELUI QU'ON PUBLIE (`BUGS.md` §60).
⭐ Chaque mutation réintroduit un défaut du contrat (fragment de cible exposé, décomposition
   incomplète, historique présenté comme actuel, nom de programme pris pour un programme,
   travail connu perdu, ancien objectif qui prime). Les témoins doivent rougir.
⛔ Deux mutations de COMMENTAIRE doivent rester vertes. M00 : le clone non muté doit être vert.

Usage : python3 tools/mut_contrat_milo.py [racine du clone]
"""
import os
import subprocess
import sys

R = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mutctr'
ST, CO = 'state.js', 'coach.js'

MUT = [
    ('M-CTX-1', CO, " | Phase: ${S.nutritionPhase === 'charge' ? 'Charge' : 'Décharge'}",
     " | Phase: ${S.nutritionPhase === 'charge' ? 'Charge (+100 kcal)' : 'Décharge (−100 kcal)'}", 'rouge',
     'LE CODE D AVANT : l ajustement de phase réapparaît sans cible'),
    ('M-CTX-2', CO, "  if(!d) return '';\n  const n=v=>",
     "  if(!d) return '- objectif +'+goalDeltaKcal(S.goal)+' kcal\\n';\n  const n=v=>", 'rouge',
     'le delta d objectif est exposé alors que la cible est indisponible'),
    ('M-CTX-3', CO, "+' ; puis objectif « '+lbl+' » '+n(d.goalDelta)+' ; phase '",
     "+' ; puis phase '", 'rouge',
     'R8 : la décomposition perd le delta d objectif (2663 + 100 = 2963)'),
    ('M-CTX-4', CO, "  return `- ⚠️ SON OBJECTIF A CHANGÉ — ce n'est pas une valeur figée, c'est une DÉCISION qu'il/elle a prise :",
     "  return `- Objectif actuel (historique) :", 'rouge',
     'un historique est étiqueté comme l objectif actuel'),
    ('M-CTX-5', CO, "' — ⚠️ NOM SEUL : aucun programme enregistré ne porte ce nom, sa STRUCTURE est INCONNUE de l\\'app. Ne prétends pas l\\'analyser : dis ce qui manque.'",
     "' — programme complet disponible.'", 'rouge',
     'un nom de programme seul devient « programme complet »'),
    ('M-CTX-6', CO, "${_TRAVAIL_LBL[S.workType]?_TRAVAIL_LBL[S.workType]+' (enregistré dans son profil — ne le redemande pas)':'NON RENSEIGNÉ'}",
     "${'NON RENSEIGNÉ'}", 'rouge',
     'un type de travail connu disparaît du contexte'),
    ('M-CTX-7', CO, "c\\'est un ANCIEN objectif : celui-ci prime.)'",
     "c\\'est la valeur à retenir.)'", 'rouge',
     'un ancien objectif (mémoire) remplace silencieusement l objectif actuel'),
    ('M-CTX-8', ST, "    {const _w=localStorage.getItem('ft4_work'); S.workType=(_w&&_TRAVAIL_VALIDES.indexOf(_w)>=0)?_w:null;}",
     "    S.workType=localStorage.getItem('ft4_work')||'bureau';", 'rouge',
     'LE CODE D AVANT : « bureau » par défaut, présenté comme un fait'),
    ('M-CTX-9', CO, "  const jourNom=(j,i)=>(j&&(j.label||j.name))||('Jour '+(i+1));",
     "  const jourNom=(j,i)=>(j&&j.name)||('Jour '+(i+1));", 'rouge',
     'LE CODE D AVANT : les jours redeviennent « Jour 1, Jour 2 »'),
    ('M-CTX-10', ST, "    const cible=_plancherKcal(brut);\n    if(cible!==m.calories) return null;",
     "    const cible=_plancherKcal(brut)+50;", 'rouge',
     'DÉGUISÉE : une décomposition fausse n est plus refusée (la garde de cohérence saute)'),
    ('M-CTX-C1', CO, "function _cibleDetailTxt(){",
     "/* Phase: Charge (+100 kcal) · objectif +200 · kcal NEAT · NOM SEUL · Jour 1 */\nfunction _cibleDetailTxt(){", 'vert',
     'un commentaire qui cite les fragments ne change rien'),
    ('M-CTX-C2', ST, "function cibleDecomposition(phase){",
     "/* S.workType='bureau' ; phaseAdj +100 ; goalDelta +200 */\nfunction cibleDecomposition(phase){", 'vert',
     'idem côté state.js'),
]


def lancer():
    p = subprocess.run(['node', 'tools/banc_contrat_milo.js'],
                       capture_output=True, text=True, cwd=R,
                       env=dict(os.environ, TZ='Europe/Paris'))
    return p.returncode, (p.stdout + p.stderr)


def main():
    rc, out = lancer()
    if rc != 0:
        der = [l for l in out.strip().split('\n') if l.strip()][-1:] or ['']
        print('M00 le clone NON muté n est pas vert (%d) — contrôle refusé >> %s' % (rc, der[0][:120]))
        return 1
    print('M00 vert     attendu=vert  OK   — le clone non muté est vert (point de départ sain)')
    ok = nc = anc = 0
    for mid, fic, avant, apres, att, quoi in MUT:
        chemin = os.path.join(R, fic)
        src = open(chemin, encoding='utf-8').read()
        if src.count(avant) != 1:
            print('%s ANCRE invalide (%d occurrences) dans %s — %s' % (mid, src.count(avant), fic, quoi))
            anc += 1
            continue
        open(chemin, 'w', encoding='utf-8').write(src.replace(avant, apres, 1))
        rc, out = lancer()
        open(chemin, 'w', encoding='utf-8').write(src)
        obt = 'vert' if rc == 0 else ('rouge' if rc == 1 else 'PLANTAGE')
        if obt == att:
            ok += 1
            print('%s %-8s attendu=%-5s OK   — %s' % (mid, obt, att, quoi))
        else:
            nc += 1
            der = [l for l in out.strip().split('\n') if l.strip()][-1:] or ['']
            print('%s %-8s attendu=%-5s NON CONFORME — %s >> %s' % (mid, obt, att, quoi, der[0][:90]))
    rc, out = lancer()
    print('M99 %s après restauration de toutes les mutations' % ('vert' if rc == 0 else 'NON VERT'))
    print('=== conformes=%d nonconformes=%d ancres=%d ===' % (ok, nc, anc))
    return 1 if (nc or anc or rc) else 0


if __name__ == '__main__':
    sys.exit(main())
