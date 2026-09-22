#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF DE V8 — on abîme le moteur candidat, les témoins DOIVENT rougir.

⛔⛔ CE QU'IL PROUVE. `tools/temoins_v8.js` annonce « 40 OK / 0 ROUGE ». Un vert peut vouloir
dire *les invariants tiennent* ou *les témoins ne mesurent rien*. On casse donc chaque invariant
à la main et on vérifie que SON témoin s'allume.

⭐ On mute `tools/moteur_v8.js`, jamais `state.js` : le moteur SERVI n'est pas touché, y compris
dans le clone.

⚠️ Trois mutations doivent RESTER VERTES : elles ne changent que des commentaires citant les
mots cherchés. *C'est la seule façon de prouver qu'on mesure le CODE et non la phrase qui
l'explique* — et les commentaires de V8 citent `Math.ceil`, `0,5 g/kg`, `500 kcal` et
`2,2 g/kg` en toutes lettres.

Usage : python3 tools/mut_v8.py
"""
import os, re, subprocess, sys, tempfile

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIBLE = 'tools/moteur_v8.js'

# (id, description, ancien, nouveau, attendu)
MUTATIONS = [
    ('M01', 'P01 : la cible cesse d etre la somme des macros',
     "  return { kcal: kcalMacros,", "  return { kcal: kcal,", 'rouge'),
    ('M02', 'P01 : le low-carb reprend ses trois pourcentages independants',
     "  const fat_g = Math.max(0, Math.round((kcal - prot_g * 4 - carbs_g * 4) / 9));\n  return { prot_g, fat_g, carbs_g };\n}\nfunction mV0",
     "  const fat_g = Math.max(0, Math.round(kcal * 0.45 / 9));\n  return { prot_g, fat_g, carbs_g };\n}\nfunction mV0", 'rouge'),
    ('M03', 'P09 : le plafond de deficit de Murphy & Koehler passe a 1500 kcal',
     "const DEFICIT_MAX_KCAL = 500;", "const DEFICIT_MAX_KCAL = 1500;", 'rouge'),
    ('M04', 'P10 : le plafond de surplus de Helms 2023 passe a 60 %',
     "const SURPLUS_MAX_PCT = 0.15;", "const SURPLUS_MAX_PCT = 0.60;", 'rouge'),
    ('M05', 'P11 : le plafond proteique ANSES disparait',
     "const PROT_BW_MIN = 1.4, PROT_BW_MAX = 2.2;", "const PROT_BW_MIN = 1.4, PROT_BW_MAX = 99;", 'rouge'),
    ('M06', 'P11 : le plancher proteique disparait',
     "const PROT_BW_MIN = 1.4, PROT_BW_MAX = 2.2;", "const PROT_BW_MIN = 0, PROT_BW_MAX = 2.2;", 'rouge'),
    ('M07', 'P11 : le plafond de Helms (3,1 g/kg de masse maigre) saute',
     "gFFM = Math.min(gFFM, 3.1);", "gFFM = Math.min(gFFM, 9);", 'rouge'),
    ('M08', 'P11 : la modulation par la secheresse disparait (Helms)',
     "    if (bf <= BF_SEC[sexe]) gFFM += 0.5;\n    else if (bf <= BF_MOYEN[sexe]) gFFM += 0.2;", "", 'rouge'),
    ('M09', 'P11 : le deficit ne monte plus les proteines',
     "    gFFM += 0.3 * sev;", "", 'rouge'),
    ('M10', 'P12 : le plancher lipidique dIraki (0,5 g/kg) disparait',
     "const LIP_GKG_MIN = 0.5,", "const LIP_GKG_MIN = 0,", 'rouge'),
    ('M11', 'P12 : le plafond lipidique dIraki (1,5 g/kg) disparait',
     "LIP_GKG_MAX = 1.5,", "LIP_GKG_MAX = 99,", 'rouge'),
    ('M12', 'P12 : le plancher de 15 % des calories (Helms) disparait',
     "LIP_PCT_MIN = 0.15,", "LIP_PCT_MIN = 0,", 'rouge'),
    ('M13', 'P12 : le plafond de 35 % des calories disparait',
     "LIP_PCT_MAX = 0.35;", "LIP_PCT_MAX = 0.99;", 'rouge'),
    ('M14', 'P13 : les glucides sont TRONQUES a la bande au lieu detre signales',
     "      if (carbs_g / p.bw > bande) sig.push('gluc_au_dela_de_la_charge');",
     "      if (carbs_g / p.bw > bande) carbs_g = cible;", 'rouge'),
    ('M15', 'P14 : un profil incomplet rend un resultat au lieu de se taire',
     "  if (!(p.bw > 0) || !(p.height > 0) || !(p.age > 0)) return null;",
     "  if (!(p.bw > 0)) return null;", 'rouge'),
    ('M16', 'P14 : la provenance de la masse maigre est annoncee doffice comme mesuree',
     "  return { ffm: p.bw * (1 - bf / 100), bf, src: 'estimee' };",
     "  return { ffm: p.bw * (1 - bf / 100), bf, src: 'mesure' };", 'rouge'),
    ('M17', 'P15 : la cible manuelle repasse sous le plafond de deficit',
     "  if (p.manualKcal != null) {\n    kcal = Math.round(p.manualKcal);",
     "  if (false) {\n    kcal = Math.round(p.manualKcal);", 'rouge'),
    ('M18', 'P15 : une cible irrealisable nest plus declaree',
     "      faisable = false;\n      sig.push('cible_infaisable');", "      faisable = true;", 'rouge'),
    ('M19', 'P16 : le keto passe de 5 % a 20 % de glucides',
     "    const carbs_g = Math.max(0, Math.round(kcal * 0.05 / 4));", "    const carbs_g = Math.max(0, Math.round(kcal * 0.20 / 4));", 'rouge'),
    ('M20', 'P19 : le garde-fou de disponibilite energetique (RED-S) disparait',
     "const EA_MIN = 30;", "const EA_MIN = 0;", 'rouge'),
    ('M21', 'P19 : le garde-fou EA ABAISSE la cible au lieu de la relever',
     "    if (kcal < eaMini) { kcal = eaMini; sig.push('disponibilite_energetique'); }",
     "    kcal = eaMini;", 'rouge'),
    ('M22', 'P20 : le signal de plausibilite du TDEE disparait',
     "const KCAL_KG_SIGNAL = 55;", "const KCAL_KG_SIGNAL = 9999;", 'rouge'),
    ('M23', 'P08 : la phase charge/decharge est supprimee',
     "    let delta = deltaBrut + (p.phase === 'charge' ? 100 : -100);", "    let delta = deltaBrut;", 'rouge'),
    ('M24', 'P05/P06 : la vitesse de perte redevient une marche descalier',
     "      const t = (bf - sec) / (haut - sec);\n      return -(0.5 + 0.5 * t);",
     "      return -0.7;", 'rouge'),
    ('M25', 'P07 : lordre des objectifs est casse (perte au-dessus de muscle)',
     "    case 'muscle':    return avance ? -0 + 0.125 : 0.25;", "    case 'muscle':    return -2;", 'rouge'),
    ('M26', 'CTRL : V0 est « corrige » — les temoins de controle doivent rougir',
     "  return { kcal, prot_g, fat_g, carbs_g: Math.max(0, Math.round((kcal - prot_g * 4 - fat_g * 9) / 4)) };\n}\n\n/* ─────────────────── LES VARIANTES INTERMÉDIAIRES",
     "  const c = Math.max(0, Math.round((kcal - prot_g * 4 - fat_g * 9) / 4));\n  return { kcal: prot_g * 4 + fat_g * 9 + c * 4, prot_g, fat_g, carbs_g: c };\n}\n\n/* ─────────────────── LES VARIANTES INTERMÉDIAIRES", 'rouge'),
    ('M27', 'commentaire seulement : les bornes citees (doit RESTER VERT)',
     "   ⛔ Aucun nombre [E] ne décide seul : il existe une variante qui mesure son absence.",
     "   ⛔ Aucun nombre 500 kcal 2,2 g/kg 0,5 g/kg 1,5 g/kg 3,1 g/kg 0.15 0.35 ne decide seul.", 'vert'),
    ('M28', 'commentaire seulement : Math.ceil et Math.floor (doit RESTER VERT)',
     "     deux en suggestions.* */\n  const pMin = Math.ceil",
     "     deux en suggestions. Math.ceil Math.floor Math.round EA_MIN DEFICIT_MAX_KCAL.* */\n  const pMin = Math.ceil", 'vert'),
    ('M29', 'commentaire seulement : la source Henselmans (doit RESTER VERT)',
     "   le niveau au-delà duquel une prescription glucidique élevée cesse d'être justifiée par\n   l'entraînement — donc un SIGNAL, jamais une troncature (consigne explicite de Michel).",
     "   le niveau au-dela duquel 10 series par groupe musculaire SERIES_SEUIL bandeGlucides\n   cesse d'etre justifie — donc un SIGNAL, jamais une troncature.", 'vert'),
]


def lancer(racine):
    try:
        r = subprocess.run(['node', 'tools/temoins_v8.js'], cwd=racine,
                           capture_output=True, text=True, timeout=300)
    except subprocess.TimeoutExpired:
        return (None, 'TIMEOUT')
    m = re.search(r'(\d+) OK · (\d+) ROUGE', r.stdout)
    if not m:
        return (None, 'SORTIE ILLISIBLE: ' + (r.stderr.strip()[-200:] or r.stdout.strip()[-200:]))
    return (int(m.group(2)), None)


def main():
    print('=== CONTRÔLE NÉGATIF — MOTEUR V8 ===\n')
    print('① point de départ : l\'arbre SAIN doit rendre 0 témoin rouge')
    base, err = lancer(RACINE)
    if err or base != 0:
        print('  ⛔ ARRÊT : arbre sain à %r (%s). Un contrôle négatif dont le point de départ '
              'est faux ne prouve rien.' % (base, err))
        return 1
    print('  ✅ arbre sain : 0 rouge\n')

    original = open(os.path.join(RACINE, CIBLE), encoding='utf-8').read()
    conformes, ancres, echecs = 0, [], []

    with tempfile.TemporaryDirectory() as tmp:
        clone = os.path.join(tmp, 'arbre')
        print('② clonage de l\'arbre (⛔ on ne mute JAMAIS l\'arbre de travail)')
        subprocess.run(['git', 'clone', '--quiet', '--depth', '1', 'file://' + RACINE, clone],
                       check=True, capture_output=True)
        # ⛔⛔ UN CLONE GIT NE CONTIENT QUE CE QUI EST COMMITÉ — et le premier passage a fait
        # PLANTER les 29 mutations sur `MODULE_NOT_FOUND`, pas rougir. *Une mutation qui plante
        # au lieu de rougir ne dit plus laquelle a échoué* : c'est la famille de défaut payée en
        # ft-v1232. On recopie donc explicitement les fichiers de travail, commités ou non.
        for f in (CIBLE, 'tools/temoins_v8.js'):
            dst = os.path.join(clone, f)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            with open(os.path.join(RACINE, f), encoding='utf-8') as src, \
                 open(dst, 'w', encoding='utf-8') as out:
                out.write(src.read())
        print('  ✅ cloné\n③ mutations\n')
        cible = os.path.join(clone, CIBLE)

        for mid, desc, vieux, neuf, attendu in MUTATIONS:
            n_occ = original.count(vieux)
            if n_occ != 1:
                ancres.append((mid, desc, n_occ))
                print('  ⛔ %s ANCRE %s (%d) — %s' % (mid, 'MORTE' if n_occ == 0 else 'NON UNIQUE', n_occ, desc))
                continue
            open(cible, 'w', encoding='utf-8').write(original.replace(vieux, neuf, 1))
            n, err = lancer(clone)
            if err:
                ok, verdict = False, 'PLANTAGE (%s)' % err
            elif attendu == 'vert':
                ok, verdict = (n == 0), '%d rouge(s)' % n
            else:
                ok, verdict = (n is not None and n > 0), '%d rouge(s)' % n
            print('  %s %s %-62s %s' % ('✅' if ok else '⛔', mid, desc[:62], verdict))
            if ok: conformes += 1
            else: echecs.append((mid, desc, verdict))
        open(cible, 'w', encoding='utf-8').write(original)

    print('\n=== BILAN : %d/%d conformes · %d ancre(s) morte(s) ===' % (conformes, len(MUTATIONS), len(ancres)))
    for mid, d, v in echecs: print('  ⛔ %s — %s → %s' % (mid, d, v))
    for mid, d, n in ancres: print('  ⛔ ancre %s — %s (%d occurrences)' % (mid, d, n))
    return 0 if (conformes == len(MUTATIONS) and not ancres) else 1


if __name__ == '__main__':
    sys.exit(main())
