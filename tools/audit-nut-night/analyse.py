#!/usr/bin/env python3
"""AUDIT NUTRITION DE NUIT (12/10/2026) — ANALYSE DES SONDES. Outil d'audit, hors runtime.
Lit les sorties de `sonde_machine.js` et `sonde_journal.js` et produit `symptomes.json` + `metriques.json`.
Les oracles sont écrits ICI, sur le texte des noms, indépendamment du moteur de recherche de l'app.
Usage : python3 tools/audit-nut-night/analyse.py <dossier sonde_machine> <dossier sonde_journal> <dossier de sortie>"""
import json, os, re, sys, unicodedata
M, J, OUT = sys.argv[1:4]
L = lambda f: json.load(open(os.path.join(M, f), encoding='utf-8'))

def norm(s):
    s = unicodedata.normalize('NFD', str(s or '').lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').replace('œ', 'oe').replace('æ', 'ae')
    s = re.sub(r"['’`]", ' ', s); s = re.sub(r'[,;:()\[\]«»"/]+', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()
def mots_nom(n):
    w = re.split(r'[ \-]', norm(n)); return [x for x in w if x]
ELI = re.compile(r'^(d|l|j|qu)(?=[aeiouyh])')
def glue(s):
    """Comme l'app : accents retirés, apostrophes RECOLLÉES (« d'orange » → « dorange »), ponctuation → espace."""
    s = unicodedata.normalize('NFD', str(s or '').lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').replace('œ', 'oe').replace('æ', 'ae')
    s = re.sub(r"['’‘`´ʼ]", '', s); s = re.sub(r'[,;:!?()\[\]{}«»"–—]+', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()
def debut_de_mot(q, n):
    """q (un mot tapé, déjà découpé par l'app) commence-t-il un mot du nom ? (élision d'/l'/j'/qu' et pluriel tolérés)"""
    q = glue(q); ng = glue(n)
    for v in {q, q[:-1] if len(q) > 3 and q[-1] in 'sx' else q}:
        if re.search(r'(^|[ \-])(d|l|j|qu)?' + re.escape(v), ng): return True
    return False

DIMS = {
  'forme':   [('cru', r'\bcru(e|s|es)?\b'), ('cuit', r'\bcuit(e|s|es)?\b'), ('sec', r'\b(sec|secs|seche|seches)\b')],
  'laitage': [('entier', r'\bentier\b'), ('demi', r'\bdemi[- ]?ecreme\b'), ('ecreme', r'(?<!demi-)(?<!demi )\becreme\b')],
  'sucre':   [('sucre', r'(?<!sans )(?<!non )\bsucre(e|s|es)?\b(?! ajout)'), ('sans_sucre', r'\b(sans sucres? ajoutes?|non sucre(e|s)?|sans sucre)\b')],
  'gout':    [('nature', r'\bnature\b'), ('aromatise', r'\b(aromatise(e|s)?|aux fruits|parfum|au chocolat|a la vanille|vanille|fruits rouges)\b')],
  'conserv': [('uht', r'\buht\b'), ('pasteurise', r'\bpasteurise(e)?\b'), ('frais', r'\brayon frais\b')],
  'texture': [('epais', r'\bepaisse?\b'), ('fluide', r'\bfluide\b')],
}
CONTRAIRES = {'cru': ['cuit'], 'cuit': ['cru', 'sec'], 'sec': ['cuit'], 'entier': ['demi', 'ecreme'], 'demi': ['entier', 'ecreme'],
  'ecreme': ['entier', 'demi'], 'sucre': ['sans_sucre'], 'sans_sucre': ['sucre'], 'nature': ['aromatise'], 'aromatise': ['nature'],
  'uht': ['pasteurise', 'frais'], 'pasteurise': ['uht'], 'frais': ['uht'], 'epais': ['fluide'], 'fluide': ['epais']}
def a_val(n, v):
    for d in DIMS.values():
        for k, rx in d:
            if k == v: return bool(re.search(rx, norm(n)))
    return False
def taux(n):
    out = []
    for m in re.finditer(r'(\d+(?:[.,]\d+)?) ?(?:(?:-|a) ?(\d+(?:[.,]\d+)?) ?)?%', norm(n)):
        lo = float(m.group(1).replace(',', '.')); hi = float((m.group(2) or m.group(1)).replace(',', '.')); out.append((lo, hi))
    return out
def compat(n, o):
    if o['dim'] == 'taux': return any(lo <= o['val'] <= hi for lo, hi in taux(n))
    return a_val(n, o['val'])
def contraire(n, o):
    if o['dim'] == 'taux': t = taux(n); return bool(t) and not any(lo <= o['val'] <= hi for lo, hi in t)
    return (not a_val(n, o['val'])) and any(a_val(n, c) for c in CONTRAIRES.get(o['val'], []))

S = []   # symptômes
def sym(**k): S.append(k)

# ── B1 accessibilité ─────────────────────────────────────────────────────────────────────────────────────
b1 = L('b1_accessibilite.json'); R1 = b1['res']
met = {'b1_total_proposables': len(R1), 'b1_masques_kcal_non_determinees': len(b1['exclus'])}
inacc = [x for x in R1 if x['plein'] < 0 and x['pleinEn'] < 0]
seul_en = [x for x in R1 if x['plein'] < 0 <= x['pleinEn']]
seul_hors = [x for x in R1 if x['pleinEn'] < 0 <= x['plein']]
from collections import Counter
dist = Counter(x['kMots'] if x['kMots'] else 'jamais' for x in R1)
met.update({'b1_nom_entier_introuvable': len(inacc), 'b1_nom_entier_en_ligne_seulement': len(seul_en), 'b1_nom_entier_hors_ligne_seulement': len(seul_hors),
            'b1_mots_necessaires': {str(k): v for k, v in sorted(dist.items(), key=lambda z: (isinstance(z[0], str), z[0]))},
            'b1_tete_introuvable_en_et_hors': sum(1 for x in R1 if x['rTete'] < 0 and x['rTeteEn'] < 0)})
for x in inacc: sym(famille='accessibilite', type='INACCESSIBLE', requete=x['n'], mode='en+hors', observe='nom entier tapé : absent du top 6', code=x['c'])
for x in seul_hors: sym(famille='online_offline', type='EN_LIGNE_PERD', requete=x['n'], mode='en', observe='nom entier trouvé hors ligne mais pas en ligne', code=x['c'])
for x in seul_en: sym(famille='online_offline', type='HORS_LIGNE_PERD', requete=x['n'], mode='hors', observe='nom entier trouvé en ligne seulement', code=x['c'])

# ── B2 têtes : pertinence et faux amis ─────────────────────────────────────────────────────────────────
b2 = L('b2_tetes.json'); ff_tetes = 0
for o in b2:
    for mode in ('en', 'hors'):
        res = o[mode]
        if not res: sym(famille='accessibilite', type='TETE_VIDE', requete=o['q'], mode=mode, observe='aucun résultat CIQUAL'); continue
        dern = o['mots'][-1] if o['mots'] else ''
        faux = [r for r in res if dern and not debut_de_mot(dern, r[1])]
        vrais = [i for i, r in enumerate(res) if not (dern and not debut_de_mot(dern, r[1]))]
        if faux:
            ff_tetes += 1
            premier_faux = min(i for i, r in enumerate(res) if r in faux)
            sym(famille='sous_chaine', type='FAUX_AMI', requete=o['q'], mode=mode, observe=[r[1] for r in faux][:3],
                rang_faux=premier_faux, avant_un_vrai=bool(vrais) and premier_faux < max(vrais), top1_faux=(premier_faux == 0))
met['b2_tetes'] = len(b2); met['b2_tetes_avec_faux_ami'] = ff_tetes

# ── B3 variantes ────────────────────────────────────────────────────────────────────────────────────────
b3 = L('b3_variantes.json'); v_viol = Counter()
for o in b3:
    for mode in ('en', 'hors'):
        res = o[mode]; noms = [r[1] for r in res]
        ic = next((i for i, n in enumerate(noms) if compat(n, o)), None)
        icon = [i for i, n in enumerate(noms) if contraire(n, o)]
        if ic is None:
            v_viol['aucune_compatible'] += 1
            sym(famille='variante', type='VARIANTE_ABSENTE_TOP6', requete=o['q'], mode=mode, dim=o['dim'], val=o['val'], observe=noms[:3], codes_existants=o['src'][:5])
        elif icon and min(icon) < ic:
            v_viol['contraire_avant'] += 1
            sym(famille='variante', type='CONTRAIRE_AVANT', requete=o['q'], mode=mode, dim=o['dim'], val=o['val'], observe=noms[:3], rang_compat=ic, rang_contraire=min(icon))
met['b3_requetes'] = len(b3); met['b3_violations'] = dict(v_viol)

# ── B4 adversarial ──────────────────────────────────────────────────────────────────────────────────────
B4 = L('b4_adversarial.json'); idx = {o['q']: o for o in B4['b4']}
for q in B4['MOTS_SEULS']:
    o = idx[q]
    for mode in ('en', 'hors'):
        res = o[mode]
        if not res and not o['ff']: sym(famille='accessibilite', type='MOT_COURANT_VIDE', requete=q, mode=mode, observe='aucun résultat (CIQUAL ni fast-food)'); continue
        if not res: continue
        dern = o['mots'][-1] if o['mots'] else ''
        faux = [i for i, r in enumerate(res) if dern and not debut_de_mot(dern, r[1])]
        if faux: sym(famille='sous_chaine', type='FAUX_AMI_MOT_COURANT', requete=q, mode=mode, observe=[res[i][1] for i in faux][:3], rang_faux=faux[0], top1_faux=faux[0] == 0)
for a, bq in B4['PAIRES']:
    for mode in ('en', 'hors'):
        ra, rb = idx[a][mode], idx[bq][mode]
        if (ra[0][0] if ra else None) != (rb[0][0] if rb else None):
            sym(famille='normalisation', type='PAIRE_DIVERGE', requete=a + ' ⇄ ' + bq, mode=mode,
                observe={a: ra[0][1] if ra else '(rien)', bq: rb[0][1] if rb else '(rien)'})
for q in B4['UNITES']:
    o = idx[q]
    for mode in ('en', 'hors'):
        if not o[mode]: sym(famille='normalisation', type='UNITE_DANS_REQUETE', requete=q, mode=mode, observe='aucun résultat CIQUAL')
for q in B4['FAUTES']:
    o = idx[q]
    if not o['hors'] and not o['en']: sym(famille='normalisation', type='FAUTE_NON_TOLEREE', requete=q, mode='en+hors', observe='aucun résultat')

# ── B5 alias ────────────────────────────────────────────────────────────────────────────────────────────
b5 = L('b5_alias.json'); al = {'total': len(b5), 'cible_absente': 0, 'cible_non_proposable': 0, 'qualificatif_contredit': 0, 'cible_hors_top6_hors_ligne': 0}
for o in b5:
    if not o['existe']: al['cible_absente'] += 1; sym(famille='alias', type='ALIAS_CIBLE_ABSENTE', requete=o['k'], mode='en', observe=o['c']); continue
    if not o['proposable']: al['cible_non_proposable'] += 1; sym(famille='alias', type='ALIAS_CIBLE_NON_PROPOSABLE', requete=o['k'], mode='en', observe=o['cible'])
    kn = norm(o['k'])
    for d in DIMS.values():
        for v, rx in d:
            if re.search(rx, kn) and not a_val(o['cible'], v) and any(a_val(o['cible'], c) for c in CONTRAIRES.get(v, [])):
                al['qualificatif_contredit'] += 1; sym(famille='alias', type='ALIAS_CONTREDIT_QUALIFICATIF', requete=o['k'], mode='en', observe=o['cible'], val=v)
    for lo, hi in taux(kn):
        if not any(a <= lo <= b for a, b in taux(o['cible'])):
            al['qualificatif_contredit'] += 1; sym(famille='alias', type='ALIAS_CONTREDIT_TAUX', requete=o['k'], mode='en', observe=o['cible'], val=lo)
    if o['horsTop'] < 0: al['cible_hors_top6_hors_ligne'] += 1
met['b5_alias'] = al

# ── B6 autres sources ───────────────────────────────────────────────────────────────────────────────────
b6 = L('b6_sources.json')
ff_perdus = [x for x in b6['ff'] if x['rang'] < 0]
for x in ff_perdus: sym(famille='accessibilite', type='FASTFOOD_INTROUVABLE_PAR_SON_NOM', requete=x['nom'], mode='en+hors', observe=x['ens'])
ff_incoh = []
for x in b6['ff']:
    at = 4 * (x['p'] or 0) + 4 * (x['g'] or 0) + 9 * (x['l'] or 0)
    if x['kcal'] and at and abs(x['kcal'] - at) / x['kcal'] > 0.15: ff_incoh.append(x)
for x in ff_incoh: sym(famille='coherence', type='FASTFOOD_KCAL_VS_MACROS', requete=x['nom'], mode='-', observe={'kcal100': x['kcal'], 'atwater': round(4 * (x['p'] or 0) + 4 * (x['g'] or 0) + 9 * (x['l'] or 0), 1), 'doute_affiche': x['doute'], 'kcal_derivee': x['derive']})
cp = [c for c in b6['compl'] if c['affiches'] != c['sansCoupure']]
for c in cp: sym(famille='classement', type='COMPLEMENTS_COUPURE_400', requete=c['q'], mode='en+hors', observe={'total_correspondances': c['total'], 'affiches': c['affiches'][:3], 'meilleurs_sans_coupure': c['sansCoupure'][:3]})
met['b6'] = {'fastfood_produits': len(b6['ff']), 'fastfood_introuvables_par_nom': len(ff_perdus), 'fastfood_kcal_vs_macros_>15%': len(ff_incoh),
             'complements_requetes': len(b6['compl']), 'complements_classement_change_par_coupure': len(cp)}

# ── Journal (parcours réel) ────────────────────────────────────────────────────────────────────────────
jr = json.load(open(os.path.join(J, 'journal.json'), encoding='utf-8'))
for s in jr['scenarios']:
    if not s['ok']: sym(famille='journal', type='PARCOURS_ECART', requete=s['id'] + ' ' + s['titre'], mode='ui', observe=s['observe'], attendu=s['attendu'])
met['journal'] = {'scenarios': len(jr['scenarios']), 'ecarts': sum(1 for s in jr['scenarios'] if not s['ok']), 'erreurs_page': len(jr['erreurs'])}

met['symptomes'] = len(S); met['par_type'] = dict(Counter(s['type'] for s in S))
os.makedirs(OUT, exist_ok=True)
json.dump(S, open(os.path.join(OUT, 'symptomes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(met, open(os.path.join(OUT, 'metriques.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(met, ensure_ascii=False, indent=1))
