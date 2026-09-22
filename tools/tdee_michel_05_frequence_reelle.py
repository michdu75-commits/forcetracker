# -*- coding: utf-8 -*-
import csv, io, collections, datetime as dt, statistics as st
rows=[]
with io.open((__import__('sys').argv[1] if len(__import__('sys').argv)>1 else 'hist.csv'),encoding='utf-8-sig') as f:
    for r in csv.DictReader(f,delimiter=';'):
        if not r.get('date'): continue
        def n(k):
            v=(r.get(k) or '').strip()
            try: return float(v.replace(',','.'))
            except: return None
        rows.append(dict(date=r['date'],seance=(r['seance'] or '').strip(),
            ex=(r['exercise'] or '').strip(),typ=(r['type'] or '').strip(),
            kg=n('kg'),reps=n('reps'),vol=n('volume') or 0.0))
print("lignes:",len(rows))
ds=sorted(set(r['date'] for r in rows))
print("periode:",ds[0],"->",ds[-1],"  jours d'entrainement distincts:",len(ds))
d0=dt.date(*map(int,ds[0].split('-'))); d1=dt.date(*map(int,ds[-1].split('-')))
span=(d1-d0).days+1
print("etendue: %d jours calendaires  ->  %.2f seances/semaine EN MOYENNE"%(span,len(ds)*7.0/span))
print()
print("="*72); print("FREQUENCE PAR SEMAINE CALENDAIRE (lundi->dimanche)"); print("="*72)
wk=collections.Counter()
for d in ds:
    dd=dt.date(*map(int,d.split('-'))); wk[dd-dt.timedelta(days=dd.weekday())]+=1
ks=sorted(wk)
for k in ks:
    print("  semaine du %s : %d seance%s  %s"%(k,wk[k],'s' if wk[k]>1 else '','#'*wk[k]))
vals=[wk[k] for k in ks]
comp=[wk[k] for k in ks[1:-1]]   # on retire la 1re et la derniere, tronquees
print()
print("  moyenne TOUTES semaines ........... %.2f seances/sem (n=%d)"%(st.mean(vals),len(vals)))
print("  moyenne semaines COMPLETES ........ %.2f seances/sem (n=%d)  <- la bonne"%(st.mean(comp),len(comp)))
print("  mediane semaines completes ........ %.1f"%st.median(comp))
print("  min/max ........................... %d / %d"%(min(comp),max(comp)))
print()
print("  distribution :", dict(sorted(collections.Counter(comp).items())))
print()
# le seuil de l'app
ACT={'1-2 seances -> 1.375 Leger':lambda c:c<=2,'3-4 seances -> 1.55 Modere':lambda c:3<=c<=4,
     '5-6 seances -> 1.725 Actif':lambda c:5<=c<=6,'7+ -> 1.9 Tres actif':lambda c:c>=7}
print("="*72); print("A QUEL CRAN DE L'APP CORRESPOND SA FREQUENCE REELLE ?"); print("="*72)
for lab,f in ACT.items():
    n=sum(1 for c in comp if f(c))
    print("  %-30s : %2d semaines sur %d  (%.0f%%)"%(lab,n,len(comp),100.0*n/len(comp)))
