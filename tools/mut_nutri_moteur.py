#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — les témoins NUT-01 → NUT-09 du moteur Nutrition peuvent-ils RÉELLEMENT rougir ?

⛔⛔ SUR UN ARBRE CLONÉ, JAMAIS SUR CELUI QU'ON PUBLIE (`BUGS.md` §60).
⭐ Chaque mutation touche UNE entrée de la chaîne (activité, poids, âge, taille, objectif,
   protéines, lipides, résidu des glucides, repli du poids, TDEE). Les témoins doivent rougir.
⛔ Deux mutations de COMMENTAIRE doivent rester vertes.
⛔ M00 : le clone non muté doit être vert, sinon le contrôle ne prouve rien.

Usage : python3 tools/mut_nutri_moteur.py [racine du clone]
"""
import os
import subprocess
import sys

R = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mutnut'
ST, AP = 'state.js', 'app.js'

MUT = [
    ('M01', ST, "return Math.round(calcBMR()*S.activityLevel+calcWorkExtra()",
     "return Math.round(calcBMR()*1.55+calcWorkExtra()", 'rouge', 'ACTIVITÉ ignorée'),
    ('M02', ST, "  const base=10*S.bw+6.25*S.height-5*S.age;",
     "  const base=10*80+6.25*S.height-5*S.age;", 'rouge', 'POIDS remplacé par 80 dans le BMR'),
    ('M03', ST, "  const base=10*S.bw+6.25*S.height-5*S.age;",
     "  const base=10*S.bw+6.25*S.height-5*30;", 'rouge', 'ÂGE ignoré'),
    ('M04', ST, "  const base=10*S.bw+6.25*S.height-5*S.age;",
     "  const base=10*S.bw+6.25*175-5*S.age;", 'rouge', 'TAILLE ignorée'),
    ('M05', ST, "_GOAL_DELTA_KCAL={muscle:350,perte:-450,recomp:-250,force:200,equilibre:0,endurance:100}",
     "_GOAL_DELTA_KCAL={muscle:350,perte:-450,recomp:-250,force:350,equilibre:0,endurance:100}",
     'rouge', 'OBJECTIF force traité comme muscle'),
    ('M06', ST, "{muscle:2.2,perte:2.5,recomp:2.6,force:2.0,equilibre:2.0,endurance:1.7}[goal]||2.2)",
     "{muscle:2.2,perte:2.5,recomp:2.6,force:2.2,equilibre:2.0,endurance:1.7}[goal]||2.2)",
     'rouge', 'PROTÉINES : ratio force modifié'),
    ('M07', ST, "fatRatio={muscle:0.9,perte:0.8,recomp:0.85,force:1.0,",
     "fatRatio={muscle:0.9,perte:0.8,recomp:0.85,force:0.9,", 'rouge', 'LIPIDES : ratio force modifié'),
    ('M08', ST, "  const carbs_g=Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4));\n  return{prot_g,fat_g,carbs_g};\n}",
     "  const carbs_g=Math.min(Math.round((S.bw||0)*6),Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4)));\n  return{prot_g,fat_g,carbs_g};\n}",
     'rouge', 'DÉGUISÉE : un PLAFOND de glucides posé sans décision (6 g/kg)'),
    ('M09', ST, "  const carbs_g=Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4));\n  return{prot_g,fat_g,carbs_g};\n}",
     "  const carbs_g=Math.round((kcal-prot_g*4-fat_g*9)/4);\n  return{prot_g,fat_g,carbs_g};\n}",
     'rouge', 'RÉSIDU sans borne : glucides négatifs possibles'),
    ('M10', ST, "  const calculable=(calories!=null)&&(_nbUtil(S.bw)!=null);",
     "  const calculable=(calories!=null);", 'rouge', 'REPLI : macros calculées sans poids'),
    ('M11', AP, "  const dose = Math.round((S.bw || 80) * 0.4);",
     "  const dose = Math.round((S.bw || 75) * 0.4);", 'rouge', 'ORIGINE DU POIDS : repli whey changé'),
    ('M12', ST, "function calcWorkExtra(){return{bureau:0,debout:200,actif:325,physique:450}[S.workType]||0;}",
     "function calcWorkExtra(){return{bureau:0,debout:200,actif:325,physique:350}[S.workType]||0;}",
     'rouge', 'TDEE : métier physique modifié'),
    ('M13', ST, "const PLANCHER_KCAL={H:1500,F:1200};", "const PLANCHER_KCAL={H:1600,F:1200};",
     'rouge', 'plancher modifié'),
    ('M14', ST, "function calcWorkExtra(){",
     "/* carbs_g protRatio fatRatio PLANCHER_KCAL tdeeObserve */\nfunction calcWorkExtra(){", 'vert', 'un commentaire ne change rien'),
    ('M15', AP, "function renderWhey() {",
     "// S.bw || 80 tdeeObserve\nfunction renderWhey() {", 'vert', 'idem côté app.js'),
]


def lancer():
    p = subprocess.run(['node', 'tools/banc_nutri_moteur.js'],
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
