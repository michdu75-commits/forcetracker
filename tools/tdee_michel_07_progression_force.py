# -*- coding: utf-8 -*-
# Methode de l'app (_forceSurFenetre) : MEME exercice, MEME nombre de reps -> on compare les KG.
import csv, io, collections, statistics as st
rows=[]
with io.open((__import__('sys').argv[1] if len(__import__('sys').argv)>1 else 'hist.csv'),encoding='utf-8-sig') as f:
    for r in csv.DictReader(f,delimiter=';'):
        if not r.get('date'): continue
        def n(k):
            v=(r.get(k) or '').strip()
            try: return float(v.replace(',','.'))
            except: return None
        rows.append(dict(d=r['date'],ex=(r['exercise'] or '').strip(),typ=(r['type'] or '').strip(),
                         kg=n('kg'),reps=n('reps')))
work=[r for r in rows if r['typ']=='N' and r['kg'] and r['reps']]
ds=sorted(set(r['d'] for r in work)); mid=ds[len(ds)//2]
A=collections.defaultdict(list); B=collections.defaultdict(list)
for r in work:
    (A if r['d']<mid else B)[(r['ex'],int(r['reps']))].append(r['kg'])
paires=[]
for k in set(A)&set(B):
    a,b=max(A[k]),max(B[k])
    paires.append((100.0*(b-a)/a,k[0],k[1],a,b))
paires.sort(reverse=True)
print("METHODE DE L'APP : meme exercice, MEME nombre de repetitions, on compare les kg")
print("coupure %s  |  %d paires comparables\n"%(mid,len(paires)))
print("%-38s %5s %8s %8s %9s"%("exercice","reps","avant","apres","evolution"))
for p,ex,rp,a,b in paires:
    if abs(p)>=2: print("%-38s %5d %8.1f %8.1f   %+7.1f %%"%(ex[:38],rp,a,b,p))
v=[x[0] for x in paires]
print("-"*74)
print("  MEDIANE ....................... %+.1f %%"%st.median(v))
print("  moyenne ....................... %+.1f %%"%st.mean(v))
print("  paires en progres ............. %d / %d  (%.0f%%)"%(sum(1 for x in v if x>0),len(v),100.0*sum(1 for x in v if x>0)/len(v)))
print("  paires stables (|x|<2%%) ....... %d"%sum(1 for x in v if abs(x)<2))
print("  paires en recul ............... %d"%sum(1 for x in v if x<0))
print()
# focus gros mouvements
GROS=['Squat','Développé Couché','Soulevé de Terre','Rowing Barre','Développé Épaules','Tirage Poulie Haute','Hip Thrust','Press Jambes']
sel=[x for x in paires if any(g.lower() in x[1].lower() for g in GROS)]
print("  SUR LES GROS MOUVEMENTS SEULEMENT (%d paires) : mediane %+.1f %% | %d/%d en progres"%(
      len(sel),st.median([x[0] for x in sel]),sum(1 for x in sel if x[0]>0),len(sel)))
