#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
📤 EXPORTER LA CHAÎNE NUTRITION EN CSV — pour qu'un auditeur extérieur arrête de deviner.

⭐ POURQUOI CE FICHIER EXISTE (08/09/2026, demande de Michel : « donne moi le code de la
   nutrition en csv »). Un audit extérieur du même jour — bon sur le fond, il a trouvé un vrai
   bug — s'est trompé sur trois points d'architecture **parce qu'il n'avait pas le code** :
   il proposait de séparer « référence / portion / log » (déjà fait depuis ft-v907/1056), de
   sortir le calcul de l'IA (déjà local et déterministe), et d'ajouter un contrôle énergétique
   (livré le matin même, ft-v1162).
   👉 *Un auditeur sans le code audite ce qu'il imagine.* Ce CSV lui donne la carte réelle.

⛔ GÉNÉRÉ DEPUIS LE CODE, JAMAIS ÉCRIT À LA MAIN (R27) : une carte tenue à la main redevient
   fausse en trois semaines, et c'est exactement ce qu'on reproche à l'audit.

Usage :  python3 tools/nutrition-csv.py
Sortie :  docs/export/nutrition-chaine.csv
"""
import io, os, re, csv, sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ['app.js', 'screens.js', 'state.js', 'constants.js', 'coach.js', 'Code.js', 'worker.js']

# ⛔ Le périmètre est explicite, pas devinable : ces préfixes et ces noms sont la chaîne
#    nutrition telle qu'elle existe. Un nom qui n'y est pas n'est pas dans l'export — et c'est
#    mieux qu'un filtre flou qui ramasserait la moitié de l'app.
PREFIXES = ('_af', '_bc', '_ef', '_qty', '_prov', '_food', '_off', '_journalJour',
            '_masse', '_kcal', '_per100', '_portion', '_aidePoids', '_nutri', '_repas')

# ⛔⛔ LE PREFIXE `_cal` EST UN PIEGE, ET IL A ETE MESURE : il porte DEUX familles sans rapport
#    — le CALIBRAGE d'un aliment (`_calOuvrir`, `_calAppliquer`) et le CALENDRIER des seances
#    (`_calNav`, `_calZoom`, `_calSessLabel`, `_calVolByDay`... 21 fonctions).
#    Une premiere version prenait tout le prefixe : la carte rangeait le calendrier dans la
#    chaine nutrition. *Une carte fausse est pire qu'une carte absente : on la croit.*
#    On nomme donc les deux seules fonctions du calibrage, au lieu de deviner par le prefixe.
CALIBRAGE = {'_calOuvrir', '_calAppliquer'}
NOMS = {'addFoodEntry', 'openAddFood', 'openEditFood', 'saveEditFood', 'quickFillFood',
        'quickAddFood', 'renderNutrition', 'calcTDEE', 'calcMacros', 'showFoodWall',
        'closeFoodWall', 'confirmRemoveFood', 'removeFood', 'numFR'}

# Les champs qui portent la vérité nutritionnelle : c'est ce qu'un auditeur doit pouvoir suivre.
CHAMPS = ['per100', 'q', 'u', 'kcal', 'prot', 'carbs', 'fat', 'etat', 'origine', 'saisie',
          'sourceId', 'S.foodLog', 'S.savedFoods', '_afRef', '_efRef', '_bcNutr', '_afSrc',
          '_bcPaquetG', '_afPoidsPose', '_efPoidsPose']

DECL = re.compile(r'^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(')


def interesse(nom):
    return nom in NOMS or nom in CALIBRAGE or nom.startswith(PREFIXES)


def role(lignes, i):
    """La 1re phrase utile du commentaire qui precede — le POURQUOI est ecrit a cote du code
    (R27), donc on le recolte au lieu de le reinventer.

    ATTENTION : les blocs de ce depot se terminent par « ... texte. */ » sur la MEME ligne, pas
    par un « */ » seul. Une premiere version testait `startswith('*/')` et ne trouvait donc
    JAMAIS rien : la colonne sortait vide sur 111 fonctions, sans erreur. Un extracteur qui rend
    du vide sans se plaindre ressemble a un code sans commentaires."""
    bloc = []
    k = i - 1
    # ① un bloc /* ... */ qui se termine juste au-dessus : on remonte jusqu'a son ouverture
    if k >= 0 and '*/' in lignes[k]:
        while k >= 0:
            bloc.insert(0, lignes[k])
            if '/*' in lignes[k]:
                break
            k -= 1
    else:
        # ② sinon, une suite de lignes // juste au-dessus
        while k >= 0 and lignes[k].strip().startswith('//'):
            bloc.insert(0, lignes[k])
            k -= 1
    txt = ' '.join(x.strip() for x in bloc)
    txt = re.sub(r'/\*+|\*+/', ' ', txt)
    txt = re.sub(r'(?m)^\s*\*', ' ', txt)
    txt = txt.replace('//', ' ')
    txt = re.sub(r'[\u2b50\u26d4\u26a0\ufe0f\U0001F449\U0001F3AF\U0001F4E6\u2696\U0001F4E3'
                 r'\u23ed\u2705\U0001F534\U0001F680\U0001F48E\U0001F6E1\u26a1\U0001F3F7'
                 r'\U0001F512\U0001F3A8\U0001F4BE\U0001F5E3\U0001F4D3\U0001F91D\u2328'
                 r'\U0001F4F7\U0001F4C8\U0001F4C9\U0001F4CC\U0001F374\U0001F354\U0001F957]+', ' ', txt)
    txt = re.sub(r'\s+', ' ', txt).strip()
    m = re.search(r'(?<!\d)[.!?](?!\d)\s', txt)
    if m:
        txt = txt[:m.start() + 1]
    return txt[:400]


def role_interne(c):
    """Le 1er commentaire TROUVE DANS le corps — le repli quand rien ne precede."""
    bloc, ouvert = [], False
    for l in c[1:]:
        t = l.strip()
        if not ouvert and t.startswith('/*'):
            ouvert = True
        if ouvert:
            bloc.append(t)
            if '*/' in t:
                break
            continue
        if t.startswith('//'):
            bloc.append(t)
            break
        if t and not t.startswith('*'):
            if bloc:
                break
    if not bloc:
        return ''
    txt = ' '.join(bloc)
    txt = re.sub(r'/\*+|\*+/', ' ', txt).replace('//', ' ')
    txt = re.sub(r'(?m)^\s*\*', ' ', txt)
    txt = re.sub(r'[^\w\s\'"«»,;:.!?()\[\]/%°+=<>-]', ' ', txt)
    txt = re.sub(r'\s+', ' ', txt).strip()
    m = re.search(r'(?<!\d)[.!?](?!\d)\s', txt)
    if m:
        txt = txt[:m.start() + 1]
    return txt[:400]


def corps(lignes, i):
    """Le corps de la fonction, par comptage d'accolades. Approximatif mais mesuré : suffisant
    pour dire ce qu'elle touche et combien elle pèse."""
    prof, dedans, out = 0, False, []
    for k in range(i, min(i + 400, len(lignes))):
        l = lignes[k]
        out.append(l)
        prof += l.count('{') - l.count('}')
        if '{' in l:
            dedans = True
        if dedans and prof <= 0:
            break
    return out


def main():
    rows = []
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
            if not interesse(nom):
                continue
            c = corps(lignes, i)
            src = '\n'.join(c)
            touche = [ch for ch in CHAMPS if re.search(r'(?<![\w$])' + re.escape(ch) + r'(?![\w$])', src)]
            rows.append({
                'fichier': f,
                'ligne': i + 1,
                'fonction': nom,
                'lignes_de_code': len(c),
                # ⛔ Le POURQUOI n'est pas toujours AU-DESSUS : dans ce dépôt il est très souvent
                #    DANS le corps, juste après l'accolade (mesuré : 61 fonctions sur 111 n'ont
                #    aucun commentaire précédent, et la moitié en portent un à l'intérieur).
                #    Une carte qui n'irait pas le chercher décrirait le code comme non commenté.
                'role': role(lignes, i) or role_interne(c),
                'champs_touches': ' · '.join(touche),
                'appelle_qtyRescale': 'oui' if '_qtyRescale(' in src else '',
                'ecrit_dans_foodLog': 'oui' if re.search(r'S\.foodLog\s*(\.push|\[|=)', src) else '',
                'fabrique_un_per100': 'oui' if re.search(r'per100\s*=|per100:\s*\{', src) else '',
            })

    rows.sort(key=lambda r: (r['fichier'], r['ligne']))
    dossier = os.path.join(RACINE, 'docs', 'export')
    os.makedirs(dossier, exist_ok=True)
    sortie = os.path.join(dossier, 'nutrition-chaine.csv')
    champs = ['fichier', 'ligne', 'fonction', 'lignes_de_code', 'role', 'champs_touches',
              'appelle_qtyRescale', 'ecrit_dans_foodLog', 'fabrique_un_per100']
    # ⛔ BOM UTF-8 + « ; » : c'est ce qu'Excel français attend, comme l'export du journal (ft-v1059).
    with io.open(sortie, 'w', encoding='utf-8-sig', newline='') as fh:
        w = csv.DictWriter(fh, fieldnames=champs, delimiter=';')
        w.writeheader()
        for r in rows:
            w.writerow(r)

    print('%d fonctions de la chaîne nutrition -> %s' % (len(rows), sortie))
    for cle, lib in [('fabrique_un_per100', 'fabriquent un pour-100 g'),
                     ('ecrit_dans_foodLog', 'écrivent dans le journal'),
                     ('appelle_qtyRescale', 'appellent le rescale commun')]:
        n = [r['fonction'] for r in rows if r[cle]]
        print('  %-28s : %d  (%s)' % (lib, len(n), ', '.join(n[:8]) or '—'))
    return 0


if __name__ == '__main__':
    sys.exit(main())
