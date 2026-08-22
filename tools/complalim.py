#!/usr/bin/env python3
"""
🔍 CONVERTIT COMPL'ALIM (registre officiel des compléments alimentaires, data.gouv.fr) EN
FICHE D'IDENTIFICATION POUR L'APP.

Michel, après avoir livré CIQUAL : « si tu veux, j'ai aussi les compléments alimentaires ».
Le fichier contient les déclarations officielles (nom, marque, dose, mises en garde,
populations à risque, composition complète) — 5 parties, 142 928 lignes.

⛔ APPROCHE SIMPLIFIÉE, DÉCIDÉE AVEC MICHEL (22/08/2026) : *« je ne demande pas à ce que tout
soit détaillé, mais peut-être simplifier l'approche »*. On ne garde QUE l'identification —
nom, marque, catégorie déclarée (« Articulations », « Immunité »…). ⛔⛔ ON NE GARDE PAS les
mises en garde, doses, populations à risque, composition détaillée : les afficher rapprocherait
l'app du conseil sur des substances, ce que la Constitution encadre serré (aujourd'hui, seule la
créatine a ce traitement, avec des précautions rédigées à la main). C'est une fiche
D'IDENTIFICATION, pas un moteur de conseil.

⚠️ ET CE N'EST PAS UNE BASE NUTRITIONNELLE : Compl'Alim ne donne AUCUNE valeur kcal/protéines/
glucides/lipides (vérifié : aucune colonne de ce type dans le fichier). Pour les valeurs
nutritives d'un complément (whey, barre…), c'est Open Food Facts qu'il faut chercher — c'est
déjà branché (ft-v956). Les deux bases répondent à des questions différentes.

⚠️ LICENCE : Compl'Alim est publié sur data.gouv.fr. Je n'ai pas pu vérifier la page de licence
exacte depuis cette session (réseau bloqué) — la mention affichée le dit explicitement, et le
lien à confirmer un jour est noté dans le commentaire de app.js.

⛔ ON NE GARDE QUE LES PRODUITS « Autorisée » : un produit retiré du marché ne devrait pas être
proposé comme référence.

Usage : python3 tools/complalim.py <fichier1.csv> [fichier2.csv ...]   → data/complalim.json
"""
import sys, json, os, csv

csv.field_size_limit(10**7)

def main(sources):
    vus = set()
    out = []
    for src in sources:
        with open(src, encoding='utf-8', errors='replace') as f:
            r = csv.DictReader(f, delimiter=';')
            for row in r:
                if row.get('decision') != 'Autorisée':
                    continue
                i = row.get('id')
                if not i or i in vus:
                    continue
                vus.add(i)
                nom = ' '.join((row.get('nom_commercial') or '').split()).strip()
                if not nom:
                    continue
                marque = ' '.join((row.get('marque') or '').split()).strip()
                try:
                    obj = json.loads(row.get('objectif_effet') or '[]')
                    if not isinstance(obj, list):
                        obj = []
                except Exception:
                    obj = []
                obj = [str(x).strip() for x in obj if str(x).strip()][:4]
                out.append([nom[:100], marque[:60], obj])

    os.makedirs('data', exist_ok=True)
    dst = 'data/complalim.json'
    with open(dst, 'w', encoding='utf-8') as f:
        json.dump({
            'source': "Compl'Alim (déclarations officielles) — data.gouv.fr",
            'n': len(out),
            # [nom, marque, objectifs déclarés]
            'a': out,
        }, f, ensure_ascii=False, separators=(',', ':'))

    ko = os.path.getsize(dst) / 1024
    import gzip
    kz = len(gzip.compress(open(dst, 'rb').read())) / 1024
    print(f'{len(out)} produits (autorisés, dédoublonnés) → {dst} ({ko:.0f} Ko · {kz:.0f} Ko gzippé)')


if __name__ == '__main__':
    srcs = sys.argv[1:] or ['ComplAlim_complements_partie_01.csv']
    main(srcs)
