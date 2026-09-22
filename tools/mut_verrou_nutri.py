#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF DU VERROU NUTRITION.

⛔⛔ CE QU'IL PROUVE, ET IL FAUT DIRE POURQUOI ÇA COMPTE.
`tools/verrou_nutri.js` annonce « 0 écart entre le miroir et l'app servie » sur 25 104 profils.
Un « 0 » peut vouloir dire deux choses opposées : *les deux chemins disent la même chose*, ou
*la comparaison ne compare rien*. Un contrôle négatif tranche : on ABÎME le miroir, et si la
validation reste à 0, elle est aveugle.

⭐ On mute LE MIROIR, jamais `state.js` : le fichier servi n'est pas touché, y compris dans le
clone. C'est le miroir qui prétend lire le moteur, donc c'est lui qu'on met en doute.

⚠️ Deux mutations doivent RESTER VERTES (0 écart) : elles ne changent que des commentaires qui
citent les mots cherchés. *C'est la seule façon de prouver qu'on mesure le CODE et non la phrase
qui l'explique* — et les commentaires de ce fichier-ci citent `Math.ceil`, `0,8 g/kg` et
`PROT_MIN_GKG` en toutes lettres.

Usage : python3 tools/mut_verrou_nutri.py
"""
import os, re, shutil, subprocess, sys, tempfile

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIBLE = 'tools/verrou_nutri.js'

# (id, description, ancien, nouveau, attendu) — attendu : 'rouge' = des écarts doivent apparaître
MUTATIONS = [
    ('M01', 'Mifflin homme : +5 devient +50',
     "base + 5);", "base + 50);", 'rouge'),
    ('M02', 'Mifflin femme : -161 devient -160',
     "base - 161", "base - 160", 'rouge'),
    ('M03', 'Katch : 21.6 devient 21.5',
     "370 + 21.6 * p.lm", "370 + 21.5 * p.lm", 'rouge'),
    ('M04', 'fumeur : +7 % devient +8 %',
     "Math.round(v * 1.07)", "Math.round(v * 1.08)", 'rouge'),
    ('M05', 'metier physique : 450 devient 460',
     "physique: 450", "physique: 460", 'rouge'),
    ('M06', 'autre sport : seuil 1.725 devient 1.9',
     "(p.activityLevel || 1.55) >= 1.725", "(p.activityLevel || 1.55) >= 1.9", 'rouge'),
    ('M07', 'objectif perte : -450 devient -400',
     "perte: -450", "perte: -400", 'rouge'),
    ('M08', "objectif equilibre : 0 devient 350 (le bug historique ft-v981)",
     "equilibre: 0, endurance: 100", "equilibre: 350, endurance: 100", 'rouge'),
    ('M09', 'phase : charge +100 devient +150',
     "p.phase === 'charge' ? 100 : -100);\n}", "p.phase === 'charge' ? 150 : -100);\n}", 'rouge'),
    ('M10', 'plancher homme : 1500 devient 1400',
     "{ H: 1500, F: 1200 }", "{ H: 1400, F: 1200 }", 'rouge'),
    ('M11', 'proteines recomp : 2.6 devient 2.5',
     "recomp: 2.6, force: 2.0", "recomp: 2.5, force: 2.0", 'rouge'),
    ('M12', 'lipides muscle : 0.9 devient 0.95',
     "FAT_RATIO  = { muscle: 0.9", "FAT_RATIO  = { muscle: 0.95", 'rouge'),
    ('M13', 'glucides : le residu perd son plancher a zero',
     "carbs_g: Math.max(0, Math.round((kcal - prot_g * 4 - fat_g * 9) / 4)) };\n}\nfunction mV0",
     "carbs_g: Math.round((kcal - prot_g * 4 - fat_g * 9) / 4) };\n}\nfunction mV0", 'rouge'),
    ('M14', 'keto : 5 % devient 6 % de glucides',
     "kcal * 0.05 / 4", "kcal * 0.06 / 4", 'rouge'),
    ('M15', 'keto : le plancher proteique 0.8 g/kg disparait',
     "Math.round(kcal * 0.15 / 4), Math.round(p.bw * 0.8))",
     "Math.round(kcal * 0.15 / 4))", 'rouge'),
    ('M16', 'lowcarb : 45 % de lipides devient 44 %',
     "kcal * 0.45 / 9", "kcal * 0.44 / 9", 'rouge'),
    ('M17', 'TDEE : le terme metier disparait',
     "+ (WORK_EXTRA[p.workType] || 0) + mSportExtra(p)", "+ mSportExtra(p)", 'rouge'),
    ('M18', "le plancher calorique s'applique AVANT l'objectif",
     "return Math.max(Math.round(mKcalBrut(p)), PLANCHER[p.gender === 'F' ? 'F' : 'H']);",
     "return Math.round(mKcalBrut(p));", 'rouge'),
    ('M19', "la validation ne compare plus les glucides",
     "    if (a.carbs_g !== v0.carbs_g) diff.push(`gluc ${a.carbs_g}≠${v0.carbs_g}`);\n", "", 'rouge_M13'),
    ('M20', "commentaire seulement : Math.ceil / plancher (doit RESTER VERT)",
     "     l'arrondi au plus proche transforme les deux en suggestions.",
     "     l'arrondi Math.ceil au plus proche PROT_MIN_GKG 0,8 g/kg transforme tout.", 'vert'),
    ('M21', "commentaire seulement : le peripherique du miroir (doit RESTER VERT)",
     "   ⛔ Le miroir ne remplace jamais l'app : il est VALIDÉ par elle, à chaque exécution.",
     "   ⛔ Le miroir base + 5 equilibre: 0 perte: -450 H: 1500 n'est jamais l'app.", 'vert'),
]


def lancer(racine):
    """Rend (nb_ecarts, ok) en lisant la PREMIÈRE ligne de sortie de l'instrument."""
    try:
        r = subprocess.run(['node', CIBLE], cwd=racine, capture_output=True, env={**os.environ, 'VERROU_RAPIDE': '1'},
                           text=True, timeout=900)
    except subprocess.TimeoutExpired:
        return (None, 'TIMEOUT')
    m = re.search(r'MIROIR vs APP SERVIE : (\d+) profils, (\d+) écart', r.stdout)
    if not m:
        return (None, 'SORTIE ILLISIBLE: ' + (r.stderr.strip()[-200:] or r.stdout.strip()[-200:]))
    return (int(m.group(2)), None)


def main():
    print('=== CONTRÔLE NÉGATIF — VERROU NUTRITION ===\n')
    print('① point de départ : l\'arbre SAIN doit rendre 0 écart')
    base, err = lancer(RACINE)
    if err or base != 0:
        print('  ⛔ ARRÊT : arbre sain à %r (%s). Un contrôle négatif dont le point de départ '
              'est faux ne prouve rien.' % (base, err))
        return 1
    print('  ✅ arbre sain : 0 écart\n')

    src = os.path.join(RACINE, CIBLE)
    original = open(src, encoding='utf-8').read()
    conformes, ancres_mortes, echecs = 0, [], []

    with tempfile.TemporaryDirectory() as tmp:
        clone = os.path.join(tmp, 'arbre')
        print('② clonage de l\'arbre (⛔ on ne mute JAMAIS l\'arbre de travail)')
        subprocess.run(['git', 'clone', '--quiet', '--depth', '1', 'file://' + RACINE, clone],
                       check=True, capture_output=True)
        print('  ✅ cloné\n③ mutations\n')
        cible_clone = os.path.join(clone, CIBLE)

        for mid, desc, vieux, neuf, attendu in MUTATIONS:
            if vieux not in original:
                ancres_mortes.append((mid, desc))
                print('  ⛔ %s ANCRE MORTE — %s' % (mid, desc))
                continue
            if original.count(vieux) != 1:
                ancres_mortes.append((mid, desc + ' (ancre non unique : %d)' % original.count(vieux)))
                print('  ⛔ %s ANCRE NON UNIQUE (%d) — %s' % (mid, original.count(vieux), desc))
                continue
            open(cible_clone, 'w', encoding='utf-8').write(original.replace(vieux, neuf, 1))
            n, err = lancer(clone)
            if err:
                verdict, ok = 'PLANTAGE (%s)' % err, False
            elif attendu == 'vert':
                ok = (n == 0); verdict = '%d écart(s)' % n
            elif attendu == 'rouge_M13':
                # M19 retire la comparaison des glucides : seule, elle ne peut PAS rougir.
                # On la juge sur sa COMBINAISON avec M13, qui casse précisément les glucides.
                s2 = original.replace(vieux, neuf, 1)
                v13 = [m for m in MUTATIONS if m[0] == 'M13'][0]
                open(cible_clone, 'w', encoding='utf-8').write(s2.replace(v13[2], v13[3], 1))
                n2, err2 = lancer(clone)
                ok = (not err2 and n2 == 0)   # aveugle = confirmé : M13 seule rougit, M19+M13 non
                verdict = 'M19 seule %d · M19+M13 %s (aveuglement %s)' % (
                    n, n2 if not err2 else err2, 'CONFIRMÉ' if ok else 'NON CONFIRMÉ')
            else:
                ok = (n is not None and n > 0); verdict = '%d écart(s)' % n
            print('  %s %s %-62s %s' % ('✅' if ok else '⛔', mid, desc[:62], verdict))
            if ok: conformes += 1
            else: echecs.append((mid, desc, verdict))

        open(cible_clone, 'w', encoding='utf-8').write(original)

    print('\n=== BILAN : %d/%d conformes · %d ancre(s) morte(s) ===' %
          (conformes, len(MUTATIONS), len(ancres_mortes)))
    for mid, d, v in echecs:
        print('  ⛔ %s — %s → %s' % (mid, d, v))
    for mid, d in ancres_mortes:
        print('  ⛔ ancre morte %s — %s' % (mid, d))
    return 0 if (conformes == len(MUTATIONS) and not ancres_mortes) else 1


if __name__ == '__main__':
    sys.exit(main())
