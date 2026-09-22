#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — les temoins du moteur nutritionnel mordent-ils vraiment ?

⛔⛔ SUR UN ARBRE CLONE, JAMAIS SUR CELUI QU ON PUBLIE (`BUGS.md` §60).

⭐⭐ LA MUTATION LA PLUS PRECIEUSE EST M05 : elle SIMULE LA CORRECTION PROPOSEE (les macros
   lisent enfin la masse maigre). Elle doit faire ROUGIR le temoin ⑦ — celui qui fige le defaut.
   *Un temoin qui fige un defaut ne sert a rien s il ne voit pas sa correction arriver.*

⭐ ET M04 EST LA DEMONSTRATION DU DEFAUT N3 : retirer le `Math.max(0, …)` des glucides rend des
   glucides NEGATIFS — ce que l ecretage masquait en laissant le surplus dans la somme.

Usage : python3 tools/mut_nutri_proprietes.py [racine du clone]
"""
import os
import subprocess
import sys

R = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mutnutri'
ST = 'state.js'

MUT = [
    ('M01', ST, "const _GOAL_DELTA_KCAL={muscle:350,",
     "const _GOAL_DELTA_KCAL={muscle:400,",
     'rouge', "l ecart de l objectif muscle a bouge (T01 + table)"),
    ('M02', ST, "const PLANCHER_KCAL={H:1500,F:1200};",
     "const PLANCHER_KCAL={H:1400,F:1200};",
     'rouge', "le plancher calorique a bouge"),
    ('M03', ST, "{muscle:2.2,perte:2.5,recomp:2.6,force:2.0,equilibre:2.0,endurance:1.7}",
     "{muscle:2.2,perte:2.5,recomp:2.6,force:1.8,equilibre:2.0,endurance:1.7}",
     'rouge', "le ratio de proteines de l objectif force a bouge (T01)"),
    ('M04', ST, "const carbs_g=Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4));",
     "const carbs_g=Math.round((kcal-prot_g*4-fat_g*9)/4);",
     'rouge', "l ecretage saute : les glucides deviennent NEGATIFS"),
    # ⭐⭐ LA CORRECTION PROPOSEE, SIMULEE : le temoin du defaut doit la voir arriver.
    ('M05', ST, "  const prot_g=Math.round((S.bw||0)*protRatio);\n"
                "  const fat_g=Math.round((S.bw||0)*fatRatio);",
     "  const _lm=(typeof leanMassRecente==='function')?leanMassRecente():null;\n"
     "  const _ref=(_lm&&_lm.lm)?(_lm.lm/0.85):(S.bw||0);\n"
     "  const prot_g=Math.round(_ref*protRatio);\n"
     "  const fat_g=Math.round((S.bw||0)*fatRatio);",
     'rouge', "CORRECTION SIMULEE : les macros lisent enfin la masse maigre"),
    ('M06', ST, "function _plancherKcal(k){\n"
                "  const p=PLANCHER_KCAL[sexeAthlete()];\n"
                "  return Math.max(Math.round(k), p);",
     "function _plancherKcal(k){\n"
     "  const p=PLANCHER_KCAL[sexeAthlete()];\n"
     "  return Math.round(k);",
     'rouge', "le plancher calorique ne mord plus"),
    ('M07', ST, "const phaseAdj=phase==='charge'?100:-100;",
     "const phaseAdj=phase==='charge'?150:-150;",
     'rouge', "la modulation charge/decharge a bouge (T01)"),
    ('M08', ST, "{muscle:0.9,perte:0.8,recomp:0.85,force:1.0,equilibre:0.85,endurance:0.75}",
     "{muscle:0.9,perte:0.8,recomp:0.85,force:1.2,equilibre:0.85,endurance:0.75}",
     'rouge', "le ratio de lipides de l objectif force a bouge (T01)"),
    # ⭐ CELLE QUI DOIT RESTER VERTE
    ('V01', ST, "function macrosForKcal(kcal){",
     "/* note : _GOAL_DELTA_KCAL, PLANCHER_KCAL, protRatio, fatRatio, leanMassRecente,\n"
     "   Math.max(0, carbs_g, muscle:350, H:1500 sont cites ici */\n"
     "function macrosForKcal(kcal){",
     'vert', "un COMMENTAIRE citant tous les mots cherches ne doit rien changer"),
]


def lancer():
    p = subprocess.run(['node', 'tools/banc_nutri_proprietes.js'],                # noqa
                       capture_output=True, text=True, cwd=R,
                       env=dict(os.environ, TZ='Europe/Paris'))
    return p.returncode, (p.stdout + p.stderr)


def main():
    ok = nc = anc = 0
    for mid, fic, avant, apres, att, quoi in MUT:
        chemin = os.path.join(R, fic)
        src = open(chemin, encoding='utf-8').read()
        if src.count(avant) != 1:
            print('%s ANCRE invalide (%d occurrences) — %s' % (mid, src.count(avant), quoi))
            anc += 1
            continue
        open(chemin, 'w', encoding='utf-8').write(src.replace(avant, apres, 1))
        rc, out = lancer()
        open(chemin, 'w', encoding='utf-8').write(src)
        obt = 'vert' if rc == 0 else ('rouge' if rc == 1 else 'PLANTAGE')
        rouges = [l for l in out.split('\n') if l.startswith('❌')]
        qui = ', '.join(l.split('·')[0].replace('❌ ROUGE ', '').strip()[:22] for l in rouges[:3])
        if obt == att:
            ok += 1
            print('%s %-8s OK   — %-52s >> %s' % (mid, obt, quoi, qui or 'produit'))
        else:
            nc += 1
            print('%s %-8s attendu=%-5s NON CONFORME — %s' % (mid, obt, att, quoi))
    print('=== conformes=%d nonconformes=%d ancres=%d ===' % (ok, nc, anc))
    return 1 if (nc or anc) else 0


if __name__ == '__main__':
    sys.exit(main())
