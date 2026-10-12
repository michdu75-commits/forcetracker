#!/usr/bin/env python3
"""AUDIT NUTRITION DE NUIT — FAST-FOOD : produits DIFFÉRENTS portant EXACTEMENT les mêmes valeurs (kcal, P, G, L, portion).
Outil d'audit, hors runtime. Usage : python3 tools/audit-nut-night/marques_doublons.py"""
import json, collections, os
m = json.load(open(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'marques.json'), encoding='utf-8'))['a']
g = collections.defaultdict(list)
for r in m: g[tuple(r[3:8])].append(r)
groupes = [v for v in g.values() if len(v) > 1]
print(len(groupes), 'groupe(s) de valeurs identiques sur', len(m), 'produits')
for v in groupes:
    k = v[0][3:8]; print('  kcal100=%s P=%s G=%s L=%s portion=%s g → %d kcal la portion' % (*k, round(k[0] * k[4] / 100)))
    for r in v: print('     ', r[0], '·', r[1], '| doute affiché :', r[9] or 'aucun')
