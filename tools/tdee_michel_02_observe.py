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
            aliment=(r['aliment'] or '').strip(),kcal=n('kcal') or 0.0,
            p=n('proteines_g') or 0.0,g=n('glucides_g') or 0.0,l=n('lipides_g') or 0.0))

# ── CORRECTIONS, une par une, chacune justifiee ───────────────────────────
corr=[]; seen=set(); keep=[]
for r in rows:
    k=(r['date'],r['repas'],r['aliment'],r['kcal'])
    if k in seen:
        corr.append(('DOUBLON',r['date'],r['aliment'],-r['kcal'])); continue
    seen.add(k)
    if r['date']=='2026-08-22' and r['kcal']==1117:
        corr.append(('LOI PHYSIQUE',r['date'],r['aliment'],117-1117)); r=dict(r,kcal=117.0)
    if r['date']=='2026-09-06' and r['aliment'].startswith('Café'):
        corr.append(('PORTION ABSURDE',r['date'],r['aliment'],-r['kcal'])); continue
    keep.append(r)

print("CORRECTIONS APPLIQUEES"); tot=0
for t,d,a,dk in corr:
    print("  %-16s %s  %-46s %+7.0f kcal"%(t,d,a[:46],dk)); tot+=dk
print("  TOTAL retire : %+.0f kcal\n"%tot)

day=collections.defaultdict(float); meals=collections.defaultdict(set); nl=collections.Counter()
for r in keep: day[r['date']]+=r['kcal']; meals[r['date']].add(r['repas']); nl[r['date']]+=1

def fen(a,b): return sorted(d for d in day if a<=d<=b)

PRINC={'petitdej','dejeuner','diner'}
def incomplet(d): return not PRINC.issubset(meals[d])

for lab,a,b in [("FENETRE DES PESEES  23/08 -> 20/09",'2026-08-23','2026-09-20'),
                ("CSV COMPLET         22/08 -> 22/09",'2026-08-22','2026-09-22')]:
    ds=fen(a,b); v=[day[d] for d in ds]
    inc=[d for d in ds if incomplet(d)]
    vc=[day[d] for d in ds if not incomplet(d)]
    print("="*74); print(lab)
    print("  jours consecutifs : %d  (du %s au %s, aucun trou : %s)"%(len(ds),ds[0],ds[-1],
          "oui" if len(ds)==(__import__('datetime').date(*map(int,ds[-1].split('-')))-__import__('datetime').date(*map(int,ds[0].split('-')))).days+1 else "NON"))
    print("  moyenne TOUS jours        : %.0f kcal/j  (med %.0f, min %.0f, max %.0f, ecart-type %.0f)"%(
          st.mean(v),st.median(v),min(v),max(v),st.pstdev(v)))
    print("  jours SANS les 3 repas principaux : %s"%(", ".join("%s(%.0f)"%(d,day[d]) for d in inc) or "aucun"))
    print("  moyenne jours COMPLETS    : %.0f kcal/j  (n=%d)"%(st.mean(vc),len(vc)))
    print()

# ── BILAN ENERGETIQUE ─────────────────────────────────────────────────────
ds=fen('2026-08-23','2026-09-20')
apport_tous=st.mean([day[d] for d in ds])
apport_comp=st.mean([day[d] for d in ds if not incomplet(d)])
KCAL_KG=7700
print("="*74); print("TDEE OBSERVE = apport moyen - (pente kg/j x 7 700)")
print("="*74)
print("%-46s %10s %10s"%("hypothese","apport","TDEE obs."))
for lp,pente in [("pente 1 mois  +0,19 kg/sem  (5 pesees)",0.19/7),
                 ("pente 3 mois  -0,06 kg/sem  (16 pesees)",-0.06/7),
                 ("poids stable   0,00 kg/sem",0.0)]:
    for la,ap in [("apport tous jours",apport_tous),("apport jours complets",apport_comp)]:
        print("%-46s %7.0f    %7.0f"%(lp+" | "+la,ap,ap-pente*KCAL_KG))
print()
print("BMR Mifflin (85,8/179/41 H) = 1777 kcal")
for lab,t in [("TDEE app (Actif 5-6j + metier physique)",3515),
              ("app, cran haut 'Tres actif' seul",3376),
              ("app, Actif 5-6j + bureau",3065),
              ("app, Modere 3-4j + physique",3204)]:
    print("  %-46s %5d  PAL %.3f"%(lab,t,t/1777.0))
for lab,t in [("OBSERVE pente 1 mois / tous jours",apport_tous-(0.19/7)*KCAL_KG),
              ("OBSERVE pente 3 mois / jours complets",apport_comp-(-0.06/7)*KCAL_KG)]:
    print("  %-46s %5.0f  PAL %.3f"%(lab,t,t/1777.0))
