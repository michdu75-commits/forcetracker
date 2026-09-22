# -*- coding: utf-8 -*-
import csv, io, collections, statistics as st
rows=[]
with io.open((__import__('sys').argv[1] if len(__import__('sys').argv)>1 else 'nutri.csv'),encoding='utf-8-sig') as f:
    for r in csv.DictReader(f,delimiter=';'):
        if not r.get('date'): continue
        def n(k):
            v=(r.get(k) or '').strip()
            try: return float(v.replace(',','.'))
            except: return None
        rows.append(dict(date=r['date'],repas=(r['repas'] or '').strip().lower(),
            aliment=(r['aliment'] or '').strip(),kcal=n('kcal') or 0.0))
brut=collections.defaultdict(float)
for r in rows: brut[r['date']]+=r['kcal']
seen=set(); keep=[]; note=collections.defaultdict(list)
for r in rows:
    k=(r['date'],r['repas'],r['aliment'],r['kcal'])
    if k in seen: note[r['date']].append("-156 doublon"); continue
    seen.add(k)
    if r['date']=='2026-08-22' and r['kcal']==1117:
        note[r['date']].append("-1000 loi physique"); r=dict(r,kcal=117.0)
    if r['date']=='2026-09-06' and r['aliment'].startswith('Caf'):
        note[r['date']].append("-341 cafe moulu 100g"); continue
    keep.append(r)
day=collections.defaultdict(float); meals=collections.defaultdict(set)
for r in keep: day[r['date']]+=r['kcal']; meals[r['date']].add(r['repas'])
P={'petitdej','dejeuner','diner'}
ds=[d for d in sorted(day) if '2026-08-23'<=d<='2026-09-20']
print("JOUR PAR JOUR  (fenetre des pesees : 23/08 -> 20/09, 29 jours)")
print("%-12s %8s %8s   %s"%("date","brut","corrige","remarque"))
tb=tc=0
for d in ds:
    inc = "" if P.issubset(meals[d]) else "<<< JOUR INCOMPLET (repas manquant)"
    print("%-12s %8.0f %8.0f   %s %s"%(d,brut[d],day[d],"; ".join(note[d]),inc))
    tb+=brut[d]; tc+=day[d]
print("-"*70)
print("%-12s %8.0f %8.0f   sur %d jours"%("TOTAL",tb,tc,len(ds)))
print("%-12s %8.1f %8.1f   kcal/jour"%("MOYENNE",tb/len(ds),tc/len(ds)))
comp=[day[d] for d in ds if P.issubset(meals[d])]
print("%-12s %8s %8.1f   kcal/jour sur les %d jours COMPLETS"%("MOY. compl.","",st.mean(comp),len(comp)))
print()
print("="*70); print("LE CALCUL, ETAPE PAR ETAPE"); print("="*70)
A=st.mean(comp); print("  A) apport moyen mesure ............................ %7.1f kcal/j"%A)
for lab,p in [("+0,19 kg/sem (5 pesees, 1 mois)",0.19),("0,00 kg/sem (poids plat)",0.0),("-0,06 kg/sem (16 pesees, 3 mois)",-0.06)]:
    j=p/7.0; e=j*7700
    print("  B) %-46s pente %+0.4f kg/j"%(lab,j))
    print("     energie stockee/deblocage = %+0.4f x 7700 = %+7.1f kcal/j"%(j,e))
    print("     TDEE = %7.1f - (%+7.1f) = %7.0f kcal/j   PAL = %.3f"%(A,e,A-e,(A-e)/1777.0))
