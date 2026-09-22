# -*- coding: utf-8 -*-
BMR=1777.0; APPORT=2423.0   # jours complets, 27 j, corrige
print("Si son VRAI TDEE valait X, alors son apport REEL vaut X (poids ~stable),")
print("donc il sous-declarerait de (X - 2423) kcal/j, soit (X-2423)/X en %.\n")
print("%-34s %6s %8s %12s"%("hypothese de TDEE reel","kcal","PAL","sous-decl."))
for lab,t in [("journal pris au pied de la lettre",2423),
              ("PAL 1,40  (plancher physiologique)",BMR*1.40),
              ("PAL 1,55  ('Modere 3-4j')",BMR*1.55),
              ("PAL 1,65  (milieu plausible)",BMR*1.65),
              ("PAL 1,725 ('Actif 5-6j')",BMR*1.725),
              ("PAL 1,803 (app: Modere + physique)",BMR*1.803),
              ("PAL 1,900 (app: cran le plus haut)",BMR*1.90),
              ("PAL 1,978 (CE QUE L'APP LUI DONNE)",3515)]:
    sd=t-APPORT
    print("%-34s %6.0f %8.3f  %5.0f kcal (%2.0f%%)"%(lab,t,t/BMR,sd,100*sd/t))
print()
print("Reference [B] : la sous-declaration alimentaire mesuree par eau doublement")
print("marquee se situe typiquement entre 10 et 30 %% chez l'adulte motive.")
print()
for lab,pct in [("sous-decl. 10 %",0.10),("sous-decl. 20 %",0.20),("sous-decl. 30 %",0.30)]:
    t=APPORT/(1-pct)
    print("  %-18s -> apport reel %5.0f = TDEE reel %5.0f  (PAL %.3f)"%(lab,t,t,t/BMR))
print()
print("ECART app - bande plausible :")
for lab,t in [("PAL 1,55",BMR*1.55),("PAL 1,65",BMR*1.65),("PAL 1,725",BMR*1.725)]:
    print("  vs %-10s : app 3515 depasse de %+5.0f kcal/j"%(lab,3515-t))
print()
print("CIBLE affichee pour 'Perte de gras + muscle' = 3372 kcal (mesure, audit 22/09)")
print("  il mange ~2423 et son poids est stable -> ecart cible/realite = %+5.0f kcal/j"%(3372-2423))
