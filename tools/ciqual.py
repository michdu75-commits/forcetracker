#!/usr/bin/env python3
"""
🥗 CONVERTIT LA TABLE CIQUAL (ANSES) EN BASE D'ALIMENTS POUR L'APP.

Michel a fourni `Table_Ciqual_2025_complete.xlsx` (22/08/2026) après avoir constaté, sur son
premier vrai repas noté, qu'il n'y avait « pas de choix de propositions » : Open Food Facts ne
donne que des PRODUITS DE MARQUE, jamais l'aliment générique (« banane », « riz », « poulet »).

⚠️ SOURCE ET LICENCE : table Ciqual 2025, ANSES — Licence Ouverte / Etalab.
   La réutilisation est libre À CONDITION de citer la source. La mention est affichée dans
   l'app ; ce n'est pas optionnel.

⛔ LES QUATRE FORMES DE VALEUR, ET POURQUOI ELLES NE SE TRAITENT PAS PAREIL (mesuré sur les
   3 484 aliments : 16 796 nombres · 291 « - » · 174 « < seuil » · 159 « traces ») :
     · un NOMBRE            → tel quel (virgule décimale française)
     · « traces »           → 0   (convention CIQUAL : quantité négligeable)
     · « < 0,55 »           → 0   (sous la limite de quantification ; l'écart avec la borne
                                   haute vaut moins de 5 kcal, prendre 0 est cohérent avec
                                   « traces » qui dit la même chose)
     · « - »                → None ⚠️ **NON DÉTERMINÉ, PAS ZÉRO**
   ⭐⭐ Le dernier point est le seul qui compte vraiment. Transformer « on ne sait pas » en 0
   fabriquerait un fait — c'est exactement ce que R29 interdit (« si elle ne sait pas, elle se
   tait », et un `null` ne doit JAMAIS être remplacé par une valeur par défaut). 143 aliments
   n'ont pas de calories déterminées : ils gardent `null` et l'app le DIT au lieu d'afficher 0.

⭐ COLONNE PROTÉINES : on prend « N × 6.25 » (col 15) et non « facteur de Jones » (col 14).
   Elles diffèrent sur 711 aliments. Raison : la colonne d'ÉNERGIE retenue est celle du
   « Règlement UE N°1169/2011 », qui est aussi la base de l'étiquetage — donc celle que la
   personne lit sur ses emballages. Mélanger deux conventions dans la même ligne donnerait des
   macros qui ne retombent pas sur leurs propres calories.

Usage : python3 tools/ciqual.py <fichier.xlsx>   → écrit data/ciqual.json
"""
import sys, json, re, os

COL = {'grp':3, 'code':6, 'nom':7, 'kcal':10, 'prot':15, 'gluc':16, 'lip':17}

def valeur(v):
    """Rend un nombre, 0 pour traces/<seuil, ou None pour « non déterminé »."""
    if v is None: return None
    s = str(v).strip()
    if s == '' or s == '-': return None                 # ⛔ non déterminé ≠ zéro
    if s.lower().startswith('trace'): return 0.0
    if s.startswith('<'): return 0.0                    # sous la limite de quantification
    s = s.replace(' ', '').replace(' ', '').replace(',', '.')
    try: return float(s)
    except ValueError: return None

def arrondi(x, n=1):
    return None if x is None else (round(x, n) if n else round(x))

def main(src):
    import openpyxl
    ws = openpyxl.load_workbook(src, read_only=True, data_only=True)['composition nutritionnelle']
    it = ws.iter_rows(values_only=True); next(it)
    out, sansKcal = [], 0
    for r in it:
        # ⚠️ Certains noms CIQUAL contiennent un RETOUR À LA LIGNE (« …vapeur,\nprélevée à la
        #    Martinique ») : dans une liste de suggestions ça casse la mise en page, et dans le
        #    champ du journal ça enregistre un nom sur deux lignes.
        nom = re.sub(r'\s+', ' ', str(r[COL['nom']] or '')).strip()
        if not nom: continue
        kcal = valeur(r[COL['kcal']])
        if kcal is None: sansKcal += 1
        out.append({
            'c': int(r[COL['code']]),                       # code CIQUAL — la provenance vérifiable
            'n': nom,
            'g': (r[COL['grp']] or '').strip(),              # groupe (pour trier/filtrer plus tard)
            'k': arrondi(kcal, 0),
            'p': arrondi(valeur(r[COL['prot']])),
            'gl': arrondi(valeur(r[COL['gluc']])),
            'l': arrondi(valeur(r[COL['lip']])),
        })
    # ⚖️ FORMAT TABLEAUX, PAS OBJETS — mesuré, pas supposé : les noms de clés répétés 3 484 fois
    #    et les 12 groupes réécrits en toutes lettres pesaient à eux seuls 89 Ko. En tableaux
    #    avec un index de groupes : 448 Ko → 251 Ko, et surtout 69 Ko UNE FOIS GZIPPÉ — la
    #    seule taille qui compte, c'est ce qui passe sur la 4G de quelqu'un à la salle.
    groupes = sorted({a['g'] for a in out})
    gi = {g: i for i, g in enumerate(groupes)}
    os.makedirs('data', exist_ok=True)
    dst = 'data/ciqual.json'
    with open(dst, 'w', encoding='utf-8') as f:
        json.dump({'source':'Table Ciqual 2025 — ANSES (Licence Ouverte / Etalab)',
                   'version':'2025', 'n':len(out), 'groupes':groupes,
                   # [code, nom, groupe, kcal, prot, glucides, lipides] pour 100 g
                   'a':[[a['c'], a['n'], gi[a['g']], a['k'], a['p'], a['gl'], a['l']] for a in out]},
                  f, ensure_ascii=False, separators=(',',':'))
    ko = os.path.getsize(dst)/1024
    import gzip as _gz
    kz = len(_gz.compress(open(dst,'rb').read()))/1024
    print(f'{len(out)} aliments → {dst} ({ko:.0f} Ko · {kz:.0f} Ko gzippé)')
    print(f'⚠️ {sansKcal} sans calories déterminées : ils gardent null, l\'app le DIT (R29).')

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'Table_Ciqual_2025_complete.xlsx')
