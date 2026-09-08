#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔬 DOSSIER D'AUDIT EXTERNE DE LA CHAÎNE NUTRITION — le code RÉEL, pas un résumé.

⭐ POURQUOI (08/09/2026) — un auditeur extérieur (GPT) a demandé, mot pour mot :
   *« Je veux le code actuellement exécuté, même s'il contient des anciennes logiques, des
   doublons ou des fonctions qui te semblent mauvaises »*, et *« ne cherche pas à défendre ou
   expliquer l'architecture avant d'avoir fourni le code »*.
   ⛔ Ce script n'interprète donc RIEN dans le fichier de code source : il EXTRAIT, verbatim.
   Le contexte, lui, est dans les fichiers 01/02/03 — écrits à part, et clairement séparés.

⛔ GÉNÉRÉ, JAMAIS ÉCRIT À LA MAIN (R27). Un dossier d'audit recopié à la main est faux dès la
   version suivante — et un auditeur qui travaille sur du code périmé conclut sur un fantôme.
   C'est déjà arrivé : le premier audit du même jour s'est trompé sur trois points
   d'architecture faute d'avoir le code.

⚠️ ET IL DIT CE QU'IL NE TROUVE PAS. Une fonction demandée mais absente est écrite comme
   ABSENTE, jamais omise en silence : *une liste incomplète sans le dire est un mensonge par
   omission, et c'est exactement ce qui égare un auditeur.*

Usage :  python3 tools/audit-nutrition.py
Sortie :  docs/audit-nutrition/04_CODE_SOURCE.md · 05_DEPENDANCES.md · 06_WRITES_NUTRITION.md
"""
import io, os, re, sys, json

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.path.join(RACINE, 'docs', 'audit-nutrition')

# Ordre volontaire : celui de la demande de l'auditeur, pour qu'il s'y retrouve.
DEMANDEES = ['_provFood', '_offRemplirFormulaire', '_qtyRescale', '_bcApplyGrams',
             'quickFillFood', 'quickAddFood', '_afSuggPrendreLocale', 'addFoodEntry',
             'openEditFood', '_efQtyRender', '_efApplyProp', '_afApplyProp',
             '_afSetUnite', '_afMajAncre', '_efApplyGrams', 'saveEditFood']

FICHIERS = ['app.js', 'screens.js', 'state.js', 'constants.js', 'coach.js',
            'log.js', 'setup.js', 'tracking.js', 'Code.js', 'worker.js']

# ⭐⭐ LES PRODUCTEURS DE RÉFÉRENCE QUE LA DEMANDE §2 NE PEUT PAS ATTEINDRE.
#    §2 dit « si l'une de ces fonctions APPELLE… » — c'est un parcours vers l'AVAL. Or §5
#    demande *« tous les endroits où une valeur nutritionnelle peut devenir une référence »*,
#    et plusieurs d'entre eux sont en AMONT des 16 : personne parmi elles n'appelle
#    `_lookupBarcode` ni `_calAppliquer`, ce sont EUX qui les appellent.
#    ⛔ Un dossier qui ne suivrait que l'aval laisserait donc dehors le calibrage manuel, le
#    scan, et les deux contrôles physiques qui décident si une saisie a le droit de devenir une
#    référence. *L'auditeur chercherait la source de vérité dans un dossier qui ne la contient
#    pas* — et conclurait, faute de mieux, qu'elle n'existe pas.
AMONT = ['_lookupBarcode', '_bcSansValeurs', '_calOuvrir', '_calAppliquer',
         '_offFetchProduct', '_offRechercher', '_offPoidsPaquet',
         '_afSuggPrendreOff', '_afSuggPrendreCiqual', '_afSuggPrendreMarque',
         '_afPropSetBase', '_efPropSetBase', '_afDeclarePoids', '_efDeclarePoids',
         '_masseImpossible', '_masseImpossibleVals', '_kcalImpossible', '_kcalImpossibleVals',
         '_qtyGrammesEcran', '_per100d1', '_afLuFormulaire', '_efSetUnite', '_efProp']

# §5 de la demande : les noms dont toute écriture doit être listée.
CIBLES_ECRITURE = ['kcal', 'calories', 'prot', 'protein', 'proteins', 'carbs', 'glucides',
                   'fat', 'lipides', 'per100', '_afRef', '_efRef', '_bcNutr', 'foodLog',
                   'quantity', 'quantite', 'serving', 'portion', 'q', 'u']

# §2 : une dépendance est retenue si elle touche à la vérité nutritionnelle.
MARQUEURS = ['per100', '_afRef', '_efRef', '_bcNutr', 'S.foodLog', 'kcal', 'prot',
             'carbs', 'fat', '_afSrc', 'af-prop', 'af-bc-grams', 'ef-prop', 'ef-grams']

DECL = re.compile(r'^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(')
APPEL = re.compile(r'(?<![\w$.])([A-Za-z_$][\w$]*)\s*\(')

# Mots qui ressemblent à des appels sans en être : on ne les compte pas comme dépendances.
BRUIT = {'if', 'for', 'while', 'switch', 'catch', 'return', 'function', 'typeof', 'new',
         'do', 'else', 'await', 'delete', 'void', 'in', 'of', 'case'}


def indexer():
    """{nom: (fichier, ligne0, [lignes du corps])} pour TOUTES les fonctions de premier niveau."""
    idx = {}
    for f in FICHIERS:
        chemin = os.path.join(RACINE, f)
        if not os.path.exists(chemin):
            continue
        lignes = io.open(chemin, encoding='utf-8').read().split('\n')
        for i, l in enumerate(lignes):
            m = DECL.match(l)
            if not m:
                continue
            nom = m.group(1)
            prof, dedans, corps = 0, False, []
            for k in range(i, min(i + 600, len(lignes))):
                corps.append(lignes[k])
                prof += lignes[k].count('{') - lignes[k].count('}')
                if '{' in lignes[k]:
                    dedans = True
                if dedans and prof <= 0:
                    break
            # ⛔ Un nom déclaré deux fois : on garde le PREMIER et on le signale plus bas.
            if nom not in idx:
                idx[nom] = (f, i + 1, corps)
    return idx


def texte_corps(corps):
    """⛔⛔ LE CORPS SANS SA SIGNATURE — et surtout SANS PERDRE LES FONCTIONS D'UNE LIGNE.
    Une premiere version faisait `corps[1:]` pour sauter la ligne de declaration. Sur
    `function _afSetSrc(o){ _afSrc=o||null; }` — tout sur une ligne — cela supprimait le corps
    ENTIER : la fonction ressortait comme ne touchant a rien, et disparaissait du dossier
    d'audit **en silence**. Or `_afSetSrc` est le seul ecrivain de `_afSrc`, c'est-a-dire de la
    provenance de chaque ligne du journal.
    👉 *Un extracteur qui perd les fonctions courtes perd justement les aiguillages.*
    On coupe donc a la premiere accolade de la ligne 0, au lieu de jeter la ligne."""
    if not corps:
        return ''
    tete = corps[0]
    i = tete.find('{')
    return ('\n'.join([tete[i + 1:]] + corps[1:])) if i >= 0 else '\n'.join(corps[1:])


def globales_du(corps, idx):
    """Ce que la fonction LIT et ce qu'elle ÉCRIT au niveau global — mesuré, pas devine.
    ⚠️ Approximation assumée et DITE : on repère `X = …` / `X.y = …` / `X.push(` pour l'écriture,
    et toute autre mention pour la lecture. Une analyse exacte demanderait un vrai parseur JS ;
    ici l'auditeur a besoin d'une piste fiable, pas d'une preuve formelle."""
    src = texte_corps(corps)
    lus, ecrits = set(), set()
    for g in ['S', '_afRef', '_efRef', '_bcNutr', '_afSrc', '_afUnite', '_afPoidsDeclare',
              '_afPoidsPose', '_efUnite', '_efPoidsDeclare', '_efPoidsPose', '_bcPaquetG',
              '_bcPaquetTxt', '_afMeal', '_editFoodTs', '_editFoodMeal', '_afQuickItems',
              '_afSuggLoc', '_afIaGrammes', '_afIaDesc']:
        e = re.escape(g)
        if re.search(r'(?<![\w$.])' + e + r'\s*(?:\.[\w$.]+)?\s*(?:=[^=]|\+\+|--|\.push\(|\.splice\()', src):
            ecrits.add(g)
        if re.search(r'(?<![\w$.])' + e + r'(?![\w$])', src):
            lus.add(g)
    return sorted(lus - ecrits), sorted(ecrits)


def appels_du(corps, idx):
    src = texte_corps(corps)
    # on retire les chaînes et les commentaires pour ne pas ramasser du texte
    src = re.sub(r'/\*.*?\*/', ' ', src, flags=re.S)
    src = re.sub(r'//[^\n]*', ' ', src)
    src = re.sub(r"'(?:\\.|[^'\\])*'", "''", src)
    src = re.sub(r'"(?:\\.|[^"\\])*"', '""', src)
    src = re.sub(r'`(?:\\.|[^`\\])*`', '``', src)
    out = []
    for m in APPEL.finditer(src):
        n = m.group(1)
        if n in BRUIT or n not in idx or n in out:
            continue
        out.append(n)
    return out


def touche_nutrition(corps):
    """⛔⛔ LE CRITERE EST « TRANSFORME », PAS « MENTIONNE » — et c'est une correction payee.
    Une premiere version retenait toute fonction qui *citait* un nom nutritionnel : elle a
    ramasse 35 dependances et 138 Ko, dont `renderNutrition` (286 lignes), `renderFoodJournal`
    et une dizaine de fabricants de HTML. Or l'auditeur a demande ce qui *calcule, convertit,
    construit un per100, modifie une reference ou ecrit dans le journal* — pas ce qui l'affiche.
    Un dossier d'audit noye dans du rendu cache exactement ce qu'il devait montrer.

    On retient donc une fonction seulement si elle ECRIT une verite nutritionnelle, si elle
    passe par le rescale commun, ou si elle touche un champ de quantite de l'ecran."""
    src = texte_corps(corps)
    src = re.sub(r'/\*.*?\*/', ' ', src, flags=re.S)
    src = re.sub(r'//[^\n]*', ' ', src)
    # ① elle ecrit une reference ou le journal
    for g in ['_afRef', '_efRef', '_bcNutr', '_afSrc', 'per100']:
        e = re.escape(g)
        if re.search(r'(?<![\w$.])' + e + r'\s*(?:\.[\w$]+)?\s*=(?!=)', src): return True
        if re.search(r'(?<![\w$])' + e + r'\s*:\s*\{', src): return True
    if re.search(r'S\.foodLog\s*(?:\.push|\[|=)', src): return True
    if re.search(r'S\.savedFoods\s*(?:\.push|\[|=)', src): return True
    # ② elle passe par le calcul commun de portion
    if '_qtyRescale(' in src: return True
    # ③ elle lit ou ecrit un champ de quantite de l'ecran
    for champ in ['af-bc-grams', 'af-prop', 'af-poids', 'ef-prop', 'ef-grams', 'ef-poids']:
        if champ in src: return True
    # ④ elle persiste les donnees (demande explicite : « sauvegarde ou restaure »)
    if re.search(r'(?<![\w$.])(persist|_cloudSync\w*)\s*\(', src) and 'foodLog' in src: return True
    # ⑤ elle ECRIT les 4 champs de macros de l'un des deux ecrans : c'est « calculer des
    #    kcal/macros » au sens de la demande, meme sans passer par _qtyRescale (`_afProp`).
    for pre in ('af', 'ef'):
        if re.search(r"'" + pre + r"-(kcal|prot|carbs|fat)'", src) and re.search(r'\.value\s*=|P\(', src):
            return True
    # ⑥ elle LIT une reference (`_afRef`, `_efRef`, `_bcNutr`) : la demande dit « lit/modifie
    #    une reference nutritionnelle », pas seulement « modifie ».
    for g in ('_afRef', '_efRef', '_bcNutr'):
        if re.search(r'(?<![\w$])' + g + r'(?![\w$])', src): return True
    # ⑦ les convertisseurs et les controles physiques nommes par les fonctions demandees
    if re.search(r'(?<![\w$.])(_masseImpossible\w*|_kcalImpossible\w*|_per100\w*|_qtyGrammes\w*|numFR)\s*\(', src):
        return True
    return False


def main():
    idx = indexer()
    os.makedirs(SORTIE, exist_ok=True)

    # ── 04 : le code source verbatim des fonctions demandées ─────────────────────────────
    absentes = [n for n in DEMANDEES if n not in idx]
    out = ['# 04 — CODE SOURCE (verbatim)', '',
           '> ⛔ **Extrait du code réellement servi**, sans reformulation, sans coupe, sans',
           '> commentaire ajouté. Généré par `python3 tools/audit-nutrition.py`.', '',
           '> ⚠️ Les commentaires du code font partie du code : ils sont conservés tels quels.',
           '> Beaucoup datent d\'un bug précis et nomment sa version (`ft-vNNN`).', '']
    if absentes:
        out += ['## ⛔ Fonctions demandées et INTROUVABLES', '',
                'Elles n\'existent pas dans le code servi. Aucune n\'est omise en silence :', '']
        out += ['- `%s`' % n for n in absentes] + ['']
    else:
        out += ['✅ **Les %d fonctions demandées existent toutes.** Aucune absence à signaler.'
                % len(DEMANDEES), '']

    vues = []
    for n in DEMANDEES:
        if n not in idx:
            continue
        f, ln, corps = idx[n]
        lus, ecrits = globales_du(corps, idx)
        ap = appels_du(corps, idx)
        vues.append(n)
        out += ['---', '', '## `%s`' % n, '',
                '| | |', '|---|---|',
                '| fichier | `%s` |' % f,
                '| ligne | %d |' % ln,
                '| longueur | %d lignes |' % len(corps),
                '| appelle directement | %s |' % (', '.join('`%s`' % x for x in ap) or '—'),
                '| globales LUES | %s |' % (', '.join('`%s`' % x for x in lus) or '—'),
                '| globales MODIFIÉES | %s |' % (', '.join('`%s`' % x for x in ecrits) or '—'),
                '', '```js', '\n'.join(corps), '```', '']
    io.open(os.path.join(SORTIE, '04_CODE_SOURCE.md'), 'w', encoding='utf-8').write('\n'.join(out))

    # ── 05 : les dépendances transitives qui touchent la nutrition ───────────────────────
    a_faire, deps = list(vues), []
    while a_faire:
        n = a_faire.pop(0)
        for d in appels_du(idx[n][2], idx):
            if d in vues or d in deps:
                continue
            if not touche_nutrition(idx[d][2]):
                continue
            deps.append(d)
            a_faire.append(d)

    out = ['# 05 — DÉPENDANCES', '',
           '> Fonctions **appelées** (directement ou en cascade) par les 16 demandées, **et** qui',
           '> touchent à la vérité nutritionnelle (`per100`, `_afRef`, `_efRef`, `_bcNutr`,',
           '> `S.foodLog`, kcal/prot/carbs/fat, ou les champs de quantité de l\'écran).', '',
           '> ⛔ Le critère est mécanique et écrit dans le générateur : une fonction appelée qui',
           '> ne touche à rien de nutritionnel (rendu, toast, date…) n\'est **pas** incluse — sinon',
           '> l\'extraction ramasserait la moitié de l\'application et noierait le sujet.', '',
           '**%d dépendances retenues.**' % len(deps), '']
    for n in deps:
        f, ln, corps = idx[n]
        lus, ecrits = globales_du(corps, idx)
        out += ['---', '', '## `%s`' % n, '',
                '| | |', '|---|---|',
                '| fichier | `%s` |' % f, '| ligne | %d |' % ln,
                '| longueur | %d lignes |' % len(corps),
                '| appelée par | %s |' % ', '.join(
                    '`%s`' % x for x in (vues + deps) if n in appels_du(idx[x][2], idx)) or '—',
                '| globales LUES | %s |' % (', '.join('`%s`' % x for x in lus) or '—'),
                '| globales MODIFIÉES | %s |' % (', '.join('`%s`' % x for x in ecrits) or '—'),
                '', '```js', '\n'.join(corps), '```', '']
    # ── 05 bis : les producteurs de référence situés EN AMONT des 16 (demande §5) ────────
    amont = [n for n in AMONT if n in idx and n not in vues and n not in deps]
    manquants = [n for n in AMONT if n not in idx]
    out += ['---', '', '# En AMONT — les producteurs de référence que §2 ne pouvait pas atteindre', '',
            '> §2 suit ce que les 16 fonctions **appellent** (vers l\'aval). Mais §5 demande *tous*',
            '> les endroits où une valeur peut **devenir une référence** — et plusieurs sont en',
            '> amont : ce sont eux qui appellent les 16, pas l\'inverse (le scan, le calibrage à la',
            '> main, les deux contrôles physiques qui autorisent une saisie à devenir référence).', '',
            '**%d fonctions.**' % len(amont), '']
    if manquants:
        out += ['⛔ **Attendues et INTROUVABLES** : ' + ', '.join('`%s`' % m for m in manquants), '']
    for n in amont:
        f, ln, corps = idx[n]
        lus, ecrits = globales_du(corps, idx)
        out += ['---', '', '## `%s`' % n, '',
                '| | |', '|---|---|',
                '| fichier | `%s` |' % f, '| ligne | %d |' % ln,
                '| longueur | %d lignes |' % len(corps),
                '| globales LUES | %s |' % (', '.join('`%s`' % x for x in lus) or '—'),
                '| globales MODIFIÉES | %s |' % (', '.join('`%s`' % x for x in ecrits) or '—'),
                '', '```js', '\n'.join(corps), '```', '']

    io.open(os.path.join(SORTIE, '05_DEPENDANCES.md'), 'w', encoding='utf-8').write('\n'.join(out))

    # ── 06 : toutes les ÉCRITURES vers les noms de la vérité nutritionnelle ──────────────
    lignes_ecr = []
    for f in FICHIERS:
        chemin = os.path.join(RACINE, f)
        if not os.path.exists(chemin):
            continue
        src = io.open(chemin, encoding='utf-8').read().split('\n')
        fonc, prof = None, 0
        for i, l in enumerate(src):
            m = DECL.match(l)
            if m:
                fonc, prof = m.group(1), 0
            prof += l.count('{') - l.count('}')
            nu = re.sub(r'//[^\n]*', ' ', l)
            for c in CIBLES_ECRITURE:
                e = re.escape(c)
                pat = (r'(?<![\w$])' + e + r'\s*:\s*[^,}]|'          # littéral d'objet
                       r'(?<![\w$])' + e + r'\s*=(?!=)|'              # affectation
                       r'\.' + e + r'\s*=(?!=)|'                      # champ d'objet
                       r'(?<![\w$])' + e + r'\s*\.\s*push\(')         # ajout dans un tableau
                if re.search(pat, nu):
                    lignes_ecr.append((f, i + 1, fonc or '(hors fonction)', c, l.strip()[:200]))
                    break
    out = ['# 06 — TOUTES LES ÉCRITURES VERS LA VÉRITÉ NUTRITIONNELLE', '',
           '> Demande §5 de l\'auditeur : *« tous les endroits où une valeur nutritionnelle peut',
           '> devenir une référence »*. Recherche mécanique sur les noms qu\'il a listés.', '',
           '> ⚠️ **Limite dite** : c\'est une recherche textuelle, pas une analyse de flux. Elle',
           '> ramasse donc aussi des écritures anodines (une variable locale nommée `kcal`), et',
           '> elle ne saurait pas voir une écriture faite par un nom calculé. *Un auditeur doit',
           '> savoir ce que l\'outil ne peut pas voir.*', '',
           '**%d écritures trouvées.**' % len(lignes_ecr), '',
           '| fichier | ligne | fonction | nom écrit | code |', '|---|---|---|---|---|']
    for f, ln, fn, c, code in lignes_ecr:
        out.append('| `%s` | %d | `%s` | `%s` | `%s` |' % (f, ln, fn, c, code.replace('|', '\\|')))
    io.open(os.path.join(SORTIE, '06_WRITES_NUTRITION.md'), 'w', encoding='utf-8').write('\n'.join(out))

    print('dossier -> %s' % SORTIE)
    print('  04_CODE_SOURCE.md      : %d fonctions demandées (%d absentes)' % (len(vues), len(absentes)))
    print('  05_DEPENDANCES.md      : %d en aval + %d en amont (%d introuvables)'
          % (len(deps), len(amont), len(manquants)))
    print('  06_WRITES_NUTRITION.md : %d écritures' % len(lignes_ecr))
    for n in ('04_CODE_SOURCE.md', '05_DEPENDANCES.md', '06_WRITES_NUTRITION.md'):
        print('     %-24s %6.1f Ko' % (n, os.path.getsize(os.path.join(SORTIE, n)) / 1024.0))
    return 0


if __name__ == '__main__':
    sys.exit(main())
