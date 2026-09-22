# -*- coding: utf-8 -*-
# Reproduction FIDELE de _weeklyCounts + _freqBucketOf + ecartNiveauActivite (tracking.js/state.js)
import csv, io, datetime as dt, collections
ds=set()
with io.open((__import__('sys').argv[1] if len(__import__('sys').argv)>1 else 'hist.csv'),encoding='utf-8-sig') as f:
    for r in csv.DictReader(f,delimiter=';'):
        if r.get('date'): ds.add(r['date'])
jours=sorted(dt.date(*map(int,d.split('-'))) for d in ds)

def weekly_counts(today, n=4):                       # rolling 7-day buckets, comme le code
    c=[0]*n
    for d in jours:
        wk=(today-d).days//7
        if 0<=wk<n: c[wk]+=1
    return c
def bucket_of(n): return '1' if n<=2 else '3' if n==3 else '4' if n==4 else '5'
ACT_PAR_BUCKET={'1':1.375,'3':1.55,'4':1.55,'5':1.725}

def ecart(today, actuel=1.725, par_niveau=False):
    wk=weekly_counts(today)
    if sum(1 for c in wk if c>0)<3: return None
    cnt=collections.Counter()
    for c in wk:
        cnt[ACT_PAR_BUCKET[bucket_of(c)] if par_niveau else bucket_of(c)]+=1
    cle=next((k for k in cnt if cnt[k]>=3), None)
    if cle is None: return None
    sug = cle if par_niveau else ACT_PAR_BUCKET[cle]
    if actuel>=1.9 or sug==actuel: return None
    return sug

d0,d1=jours[0]+dt.timedelta(days=28), jours[-1]
n=(d1-d0).days+1
a=b=0; ja=[]; jb=[]
for i in range(n):
    t=d0+dt.timedelta(days=i)
    if ecart(t,par_niveau=False) is not None: a+=1; ja.append(t)
    if ecart(t,par_niveau=True)  is not None: b+=1; jb.append(t)
print("Simulation sur %d jours (du %s au %s), profil regle sur 1,725\n"%(n,d0,d1))
print("  CODE ACTUEL  (regroupement par BUCKET DE COMPTE) : la carte se declenche %3d jours sur %d  (%.0f%%)"%(a,n,100.0*a/n))
print("  CORRIGE      (regroupement par NIVEAU D'ACTIVITE): la carte se declenche %3d jours sur %d  (%.0f%%)"%(b,n,100.0*b/n))
print()
print("  jours perdus par le defaut de regroupement : %d"%(b-a))
print()
print("Detail des 4 dernieres semaines glissantes au 2026-09-22 :")
wk=weekly_counts(jours[-1])
print("   comptes        :",wk)
print("   buckets        :",[bucket_of(c) for c in wk])
print("   niveaux        :",[ACT_PAR_BUCKET[bucket_of(c)] for c in wk])
print("   -> un bucket >=3 fois ?", dict(collections.Counter(bucket_of(c) for c in wk)))
print("   -> un NIVEAU  >=3 fois ?", dict(collections.Counter(ACT_PAR_BUCKET[bucket_of(c)] for c in wk)))
