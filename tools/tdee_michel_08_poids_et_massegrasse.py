# -*- coding: utf-8 -*-
import csv, io, datetime as dt, statistics as st
P=[]
with io.open((__import__('sys').argv[1] if len(__import__('sys').argv)>1 else 'poids.csv'),encoding='utf-8-sig') as f:
    for r in csv.DictReader(f,delimiter=';'):
        if not r.get('date'): continue
        try: kg=float((r['poids_kg'] or '').replace(',','.'))
        except: continue
        bf=None
        try: bf=float((r['masse_grasse_pct'] or '').replace(',','.'))
        except: pass
        P.append((dt.date(*map(int,r['date'].split('-'))),kg,bf))
P.sort()
print("%d pesees, du %s au %s"%(len(P),P[0][0],P[-1][0]))
def pente(pts):
    if len(pts)<2: return None
    x0=pts[0][0]; xs=[(p[0]-x0).days for p in pts]; ys=[p[1] for p in pts]
    n=len(xs); mx=sum(xs)/n; my=sum(ys)/n
    den=sum((x-mx)**2 for x in xs)
    if den==0: return None
    return sum((xs[i]-mx)*(ys[i]-my) for i in range(n))/den*7.0   # kg/semaine
print()
print("="*70); print("PENTE DU POIDS PAR FENETRE (moindres carres)"); print("="*70)
for lab,a,b in [("fenetre du journal   23/08 -> 22/09",dt.date(2026,8,23),dt.date(2026,9,22)),
                ("3 mois               22/06 -> 22/09",dt.date(2026,6,22),dt.date(2026,9,22)),
                ("depuis le 08/07 (apres le changement de balance)",dt.date(2026,7,8),dt.date(2026,9,22)),
                ("6 mois               22/03 -> 22/09",dt.date(2026,3,22),dt.date(2026,9,22))]:
    s=[p for p in P if a<=p[0]<=b]
    pt=pente(s)
    if pt is None: print("  %-50s : pas assez de points"%lab); continue
    print("  %-50s : %+0.3f kg/sem  (n=%d)  -> bilan %+5.0f kcal/j"%(lab,pt,len(s),pt/7.0*7700))
print()
print("="*70); print("LA MASSE GRASSE : UNE RUPTURE NETTE LE 08/07/2026"); print("="*70)
av=[p for p in P if p[2] is not None and p[0]<dt.date(2026,7,8)]
ap=[p for p in P if p[2] is not None and p[0]>=dt.date(2026,7,8)]
print("  avant le 08/07 : n=%3d  masse grasse %.1f -> %.1f %%  (moyenne %.2f)"%(len(av),min(p[2] for p in av),max(p[2] for p in av),st.mean([p[2] for p in av])))
print("  depuis le 08/07: n=%3d  masse grasse %.1f -> %.1f %%  (moyenne %.2f)"%(len(ap),min(p[2] for p in ap),max(p[2] for p in ap),st.mean([p[2] for p in ap])))
print("  SAUT de moyenne : %+.2f points"%(st.mean([p[2] for p in ap])-st.mean([p[2] for p in av])))
print()
# la masse grasse ANCIENNE est-elle une simple fonction du poids ?
xs=[p[1] for p in av]; ys=[p[2] for p in av]; n=len(xs)
mx=sum(xs)/n; my=sum(ys)/n
b1=sum((xs[i]-mx)*(ys[i]-my) for i in range(n))/sum((x-mx)**2 for x in xs); b0=my-b1*mx
res=[ys[i]-(b0+b1*xs[i]) for i in range(n)]
sst=sum((y-my)**2 for y in ys); sse=sum(r*r for r in res)
print("  Regression masse_grasse = a x poids + b  SUR LES ANCIENNES VALEURS :")
print("     a = %.5f   b = %.4f   R2 = %.6f   residu max = %.4f point"%(b1,b0,1-sse/sst,max(abs(r) for r in res)))
xs=[p[1] for p in ap]; ys=[p[2] for p in ap]; n=len(xs)
mx=sum(xs)/n; my=sum(ys)/n
b1b=sum((xs[i]-mx)*(ys[i]-my) for i in range(n))/sum((x-mx)**2 for x in xs); b0b=my-b1b*mx
res=[ys[i]-(b0b+b1b*xs[i]) for i in range(n)]
sst=sum((y-my)**2 for y in ys); sse=sum(r*r for r in res)
print("  Meme regression SUR LES VALEURS DEPUIS LE 08/07 :")
print("     a = %.5f   b = %.4f   R2 = %.6f   residu max = %.4f point"%(b1b,b0b,1-sse/sst,max(abs(r) for r in res)))
