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
        rows.append(dict(date=r['date'],repas=(r['repas'] or '').strip(),
                         aliment=(r['aliment'] or '').strip(),
                         q=n('quantite'),unite=(r['unite'] or '').strip(),
                         kcal=n('kcal') or 0.0,p=n('proteines_g') or 0.0,
                         g=n('glucides_g') or 0.0,l=n('lipides_g') or 0.0,
                         saisie=(r['saisie'] or '').strip(),src=(r['source'] or '').strip()))

print("lignes:",len(rows))
ds=sorted(set(r['date'] for r in rows))
print("periode CSV:",ds[0],"->",ds[-1]," jours distincts:",len(ds))
print("dates hors bloc recent:",[d for d in ds if d<'2026-08-22'])
print()

# ── 1. LOI PHYSIQUE : kcal vs 4P+4G+9L  (la "douane" du projet) ────────────
print("="*78)
print("1. INCOHERENCES kcal vs macros  (attendu = 4P + 4G + 9L)")
print("="*78)
bad=[]
for i,r in enumerate(rows):
    att=4*r['p']+4*r['g']+9*r['l']
    if att<=0: continue
    d=r['kcal']-att
    if abs(d)>max(40, 0.25*att): bad.append((abs(d),d,att,r))
bad.sort(reverse=True)
print("%d lignes hors tolerance (>40 kcal ET >25%%)"%len(bad))
for a,d,att,r in bad[:15]:
    print("  %s %-10s %-52s decl=%6.0f attendu=%6.0f ecart=%+7.0f  [%s/%s]"%(
        r['date'],r['repas'],r['aliment'][:52],r['kcal'],att,d,r['saisie'],r['src']))
print()

# ── 2. DOUBLONS EXACTS ─────────────────────────────────────────────────────
print("="*78)
print("2. DOUBLONS EXACTS (meme jour, meme repas, meme aliment, meme kcal)")
print("="*78)
c=collections.Counter((r['date'],r['repas'],r['aliment'],r['kcal']) for r in rows)
dup=[(k,v) for k,v in c.items() if v>1]
dup.sort()
tot_dup=0
for (d,m,a,k),v in dup:
    print("  %s %-11s x%d  %-46s %5.0f kcal  -> +%.0f en trop"%(d,m,v,a[:46],k,k*(v-1)))
    tot_dup+=k*(v-1)
print("  TOTAL calories dupliquees : %.0f kcal"%tot_dup)
print()

# ── 3. TOTAUX JOURNALIERS ──────────────────────────────────────────────────
print("="*78)
print("3. TOTAUX PAR JOUR (bloc du 22/08 au 22/09)")
print("="*78)
day=collections.defaultdict(float); nl=collections.Counter(); meals=collections.defaultdict(set)
for r in rows:
    day[r['date']]+=r['kcal']; nl[r['date']]+=1; meals[r['date']].add(r['repas'].lower())
recent=[d for d in ds if d>='2026-08-22']
for d in sorted(recent):
    print("  %s  %6.0f kcal   %2d lignes   repas: %s"%(d,day[d],nl[d],",".join(sorted(meals[d]))))
