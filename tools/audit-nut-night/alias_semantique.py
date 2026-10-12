#!/usr/bin/env python3
"""AUDIT NUTRITION DE NUIT — ALIAS SÉMANTIQUES. Outil d'audit, hors runtime.
Pour chaque clé d'alias (la requête ENTIÈRE qui, en ligne, met sa cible en 1ʳᵉ ligne — `_aliasCible`), on regarde si la
cible porte les MOTS de la clé ; si non, et si un AUTRE aliment CIQUAL proposable porte tous ces mots, l'alias contourne
l'aliment nommé. Oracle écrit ici (mots entiers, singulier toléré), indépendant du moteur.
Usage : python3 tools/audit-nut-night/alias_semantique.py <sortie.json>"""
import json, re, sys, unicodedata
R = __import__('os').path.dirname(__file__) + '/../../data/'
d = json.load(open(R + 'ciqual.json', encoding='utf-8'))['a']; A = json.load(open(R + 'alias.json', encoding='utf-8'))['a']
by = {r[0]: r for r in d}
def n(s):
    s = unicodedata.normalize('NFD', str(s).lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').replace('œ', 'oe')
    s = re.sub(r"['’]", ' ', s); s = re.sub(r'[^a-z0-9% ]+', ' ', s); return re.sub(r'\s+', ' ', s).strip()
OUTILS = {'de', 'du', 'des', 'la', 'le', 'les', 'un', 'une', 'au', 'aux', 'en', 'et', 'a', 'd', 'l', 'avec'}
sg = lambda w: w[:-1] if len(w) > 3 and w[-1] in 'sx' else w
def mots(s): return [sg(w) for w in n(s).split() if w not in OUTILS]
def porte(nom, ws): nw = {sg(w) for w in n(nom).split()}; return all(w in nw for w in ws)
prop = [r for r in d if r[3] is not None]
out = []
for k, c in A.items():
    ws = mots(k); cible = by[c]
    if not ws or porte(cible[1], ws): continue
    autres = [r for r in prop if porte(r[1], ws)]
    manque = [w for w in ws if w not in {sg(x) for x in n(cible[1]).split()}]
    out.append({'cle': k, 'cible': [c, cible[1], cible[3]], 'mots_absents_de_la_cible': manque,
                'aliments_qui_portent_tous_les_mots': [[r[0], r[1], r[3]] for r in autres[:5]], 'n_autres': len(autres)})
susp = [o for o in out if o['n_autres']]
json.dump({'total_alias': len(A), 'cible_ne_porte_pas_tous_les_mots': len(out), 'dont_un_autre_aliment_les_porte_tous': len(susp), 'cas': out},
          open(sys.argv[1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(A), 'alias ;', len(out), 'cibles sans tous les mots ;', len(susp), 'avec un autre aliment qui les porte tous')
for o in sorted(susp, key=lambda o: o['cle']): print(' ', o['cle'], '->', o['cible'][1][:45], o['cible'][2], '| absents', o['mots_absents_de_la_cible'], '| ex.', o['aliments_qui_portent_tous_les_mots'][0][1][:45], o['aliments_qui_portent_tous_les_mots'][0][2])
