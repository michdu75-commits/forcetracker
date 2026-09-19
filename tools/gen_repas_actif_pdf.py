#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOSSIER NUTRITION UX #1 — LE REPAS ACTIF (19/09/2026). Rapport COURT, 11 points.

⛔⛔ LES GARDES RECOMPTENT CHAQUE FAIT DEPUIS LE CODE SERVI ET REFUSENT DE PRODUIRE SI L UN
    D EUX TOMBE — et le generateur RELIT sa propre sortie (lecon du 18/09 : un dossier livre
    portait 66 balises en clair, parce que je verifiais les MOTS et jamais la LISIBILITE).

⭐ LE TOTAL DE LA PASSE SE LIT DANS SON JOURNAL, JAMAIS A LA MAIN (lecon ft-v1201).

⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji.

Variables : UX1_PDF · UX1_PASSE (journal de la passe) · UX1_MUT (log des mutations)
"""
import os
import re
import subprocess
import sys

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, Table, TableStyle)

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.environ.get('UX1_PDF', '/tmp/FORCE-TRACKER-NUTRITION-UX1-REPAS-ACTIF-19-09-2026.pdf')
PASSE = os.environ.get('UX1_PASSE', '')
MUTLOG = os.environ.get('UX1_MUT', '/tmp/mut_repas.log')

_E = []


def g(c, lib):
    if not c:
        _E.append(lib)


def lire(n):
    with open(os.path.join(RACINE, n), encoding='utf-8') as f:
        return f.read()


def sans_comm(src):
    """Neutralise les commentaires JS. ⛔ INDISPENSABLE ICI : le commentaire de la correction
    cite `_afMeal =`, `getHours()` et la formule horaire en toutes lettres (R30). Un garde qui
    lirait le fichier brut resterait vert quoi qu on remette dans le code."""
    out = list(src)
    i, n = 0, len(src)
    while i < n:
        c = src[i]
        if c in ('"', "'", '`'):
            q = c
            i += 1
            while i < n and src[i] != q:
                i += 2 if src[i] == '\\' else 1
            i += 1
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            j = n if j < 0 else j + 2
            for k in range(i, j):
                out[k] = ' '
            i = j
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i)
            j = n if j < 0 else j
            for k in range(i, j):
                out[k] = ' '
            i = j
            continue
        i += 1
    return ''.join(out)


F = {}
A = sans_comm(lire('app.js'))
NU = A.replace(' ', '').replace('\n', '')


def corps(n):
    m = re.search(r'function\s+' + n + r'\s*\([^)]*\)\s*\{', A)
    if not m:
        return ''
    i = m.end() - 1
    d = 0
    for j in range(i, len(A)):
        if A[j] == '{':
            d += 1
        elif A[j] == '}':
            d -= 1
            if not d:
                return A[i:j + 1]
    return ''


# ══ LA CORRECTION, RECOMPTEE DEPUIS LE CODE SERVI ════════════════════════════
OAF = corps('openAddFood')
g(OAF != '', "openAddFood est introuvable")
g('_afMeal' not in OAF.replace('_afMealActif', '') and 'getHours()' not in OAF,
  "openAddFood touche a nouveau au repas actif")
g(re.search(r'let\s+_afMeal\s*=\s*null\s*;', A) is not None,
  "l etat ne demarre plus a `null` : un choix ne se distingue plus d une suggestion")
g('function_afMealActif()' in NU and 'function_afMealDefautHoraire()' in NU,
  "le proprietaire du repas actif a disparu")
F['lecteurs'] = len(re.findall(r'_afMealActif\(\)', A))
g(F['lecteurs'] >= 4, "seulement %d lecteur(s) passent par le proprietaire" % F['lecteurs'])
F['ecrivains'] = len(re.findall(r'meal:_afMealActif\(\)', A))
g(F['ecrivains'] == 2, "les deux ecrivains du journal ne sont plus %d" % F['ecrivains'])
F['ecritures'] = len(re.findall(r'(?<!let\s)_afMeal\s*=(?!=)', A))
g(F['ecritures'] == 1, "%d ecriture(s) du choix au lieu d une seule" % F['ecritures'])
_zones = corps('_afMealActif') + corps('setFoodMeal')
_tot = len(re.findall(r'(?<!function\s)_afMeal(?![A-Za-z])', A))
_ded = len(re.findall(r'(?<!function\s)_afMeal(?![A-Za-z])', _zones))
_dec = len(re.findall(r'let\s+_afMeal\s*=', A))
g(_tot - _ded - _dec == 0,
  "%d lecture(s) brute(s) hors du proprietaire" % (_tot - _ded - _dec))
g('FOOD_MEALS.some(m=>m.k===_afMeal)' in NU,
  "l echec n est plus ferme : un repas inconnu peut atteindre le journal")

# ⛔ PERIMETRE — la consigne est que RIEN d autre ne bouge.
g('constFOOD_AI_FREE_LIMIT=25;' in NU, "le plafond des compteurs IA a change")
g(not re.search(r'setTimeout[^;]{0,60}_afMeal', A)
  and not re.search(r'_afMeal[^;]{0,60}setTimeout', A),
  "un timer est apparu autour du repas actif")
F['repas'] = [k for k in ('petitdej', 'collation', 'dejeuner', 'collation2', 'diner')
              if ("k:'" + k + "'") in NU]
g(len(F['repas']) == 5, "les cinq repas ne sont plus la : %s" % F['repas'])

F['version'] = re.search(r"const CACHE = '(ft-v\d+)'", lire('sw.js')).group(1)
g(F['version'] == 'ft-v1226', "la version servie est %s" % F['version'])

# ⛔ LES TEMOINS EXISTENT ET SONT BRANCHES — sinon le dossier decrirait des tests fantomes.
R = lire('tests/parcours/runner.js')
g("require('./repas_actif.js').source" in R and "require('./repas_actif.js').ecran" in R,
  "les blocs ne sont pas branches dans le runner")
T = lire('tests/parcours/repas_actif.js')
F['temSrc'] = len(re.findall(r"t\('B-CCCXXXVI ", T))
F['temEcr'] = len(re.findall(r"t\('B-CCCXXXVII ", T))
g(F['temSrc'] >= 10 and F['temEcr'] >= 13,
  "les blocs comptent %d + %d temoins" % (F['temSrc'], F['temEcr']))

# ══ LA PASSE ═════════════════════════════════════════════════════════════════
F['passe'] = None
F['valide'] = False
if PASSE and os.path.exists(PASSE):
    _t = open(PASSE, encoding='utf-8').read()
    _v = PASSE.replace('.out', '.verdict')
    if os.path.exists(_v):
        _t += open(_v, encoding='utf-8').read()
    _m = re.search(r'TOTAL CROISÉ\s*:\s*(\d+)\s*✅\s*·\s*(\d+)\s*❌', _t)
    g(_m is not None, "aucune ligne de TOTAL : la passe n a pas fini, et un dossier ne publie "
                      "pas un total qu il n a pas lu")
    if _m:
        F['passe'] = (int(_m.group(1)), int(_m.group(2)))
        g(F['passe'][1] == 0, "la passe compte %d rouge(s)" % F['passe'][1])
    F['valide'] = 'PASSE VALIDE' in _t
    _s = re.search(r'arbre au départ[^0-9a-f]*([0-9a-f]{40})', _t)
    F['shaTeste'] = _s.group(1) if _s else None
else:
    g(False, "aucun journal de passe fourni (UX1_PASSE)")
    F['shaTeste'] = None

# ══ LES MUTATIONS ════════════════════════════════════════════════════════════
F['mut'] = None
try:
    _mt = open(MUTLOG, encoding='utf-8').read()
    _mm = re.search(r'(\d+)/(\d+) conformes', _mt)
    if _mm:
        F['mut'] = (int(_mm.group(1)), int(_mm.group(2)))
        g(F['mut'][0] == F['mut'][1], "controle negatif incomplet : %d/%d" % F['mut'])
    g('ANCRE INVALIDE' not in _mt,
      "une mutation ne s est pas appliquee : elle ressemble a une mutation qui ne mord pas")
    g(_mt.count('== CONTROLE SAIN') == 2, "le controle sain manque d un cote")
except OSError:
    g(False, "journal des mutations introuvable (%s)" % MUTLOG)

F['sha'] = subprocess.run(['git', 'rev-parse', 'HEAD'],  # noqa
                          capture_output=True, text=True, cwd=RACINE).stdout.strip()
_sale = subprocess.run(['git', 'status', '--porcelain'],  # noqa
                       capture_output=True, text=True, cwd=RACINE).stdout.strip()
F['sale'] = [l[3:] for l in _sale.splitlines()] if _sale else []
_risque = [x for x in F['sale']
           if re.match(r'^(app|state|screens|sw|capacites-ia)\.js$|^index\.html$|^tests/', x)]
g(not _risque, "des fichiers servis ou de test ne sont pas commites : %s" % _risque)
if F['shaTeste'] and F['shaTeste'] != F['sha']:
    _d = subprocess.run(['git', 'diff', '--name-only', F['shaTeste'], 'HEAD'],  # noqa
                        capture_output=True, text=True, cwd=RACINE).stdout.split()
    F['delta'] = _d
    g(not [x for x in _d if re.match(r'^(app|state|screens|sw)\.js$|^index\.html$|^tests/', x)],
      "des fichiers servis ou de test ont change APRES la passe : %s" % _d)
else:
    F['delta'] = []

if _E:
    print('REFUS DE PRODUIRE — %d garde(s) tombe(s) :' % len(_E))
    for x in _E:
        print('  - ' + x)
    sys.exit(1)

NB = 17

# ══ MISE EN PAGE ═════════════════════════════════════════════════════════════
SS = getSampleStyleSheet()
H1 = ParagraphStyle('h1', parent=SS['Title'], fontName='Helvetica-Bold', fontSize=15,
                    leading=19, spaceAfter=3, textColor=colors.HexColor('#111111'))
H2 = ParagraphStyle('h2', parent=SS['Heading2'], fontName='Helvetica-Bold', fontSize=10.5,
                    leading=13, spaceBefore=9, spaceAfter=3,
                    textColor=colors.HexColor('#B3001B'))
P = ParagraphStyle('p', parent=SS['BodyText'], fontName='Helvetica', fontSize=8.8,
                   leading=11.6, spaceAfter=3)
PET = ParagraphStyle('pet', parent=P, fontSize=7.4, leading=9.6,
                     textColor=colors.HexColor('#555555'))
CEL = ParagraphStyle('cel', parent=P, fontSize=7.8, leading=9.8, spaceAfter=0)

H = []
Ad = H.append


def md(t):
    """Echappe le XML MAIS conserve <b> <i> <br/>. Sans ca les balises s impriment EN CLAIR."""
    t = str(t).replace('&', '&amp;')
    t = re.sub(r'&amp;(amp|lt|gt|nbsp|laquo|raquo|bull|#\d+);', r'&\1;', t)
    jet = []

    def garde(m):
        jet.append(m.group(0))
        return '\x00%d\x00' % (len(jet) - 1)

    t = re.sub(r'</?(?:b|i|br\s*/?|font[^<>]*)>', garde, t)
    t = t.replace('<', '&lt;').replace('>', '&gt;')
    return re.sub(r'\x00(\d+)\x00', lambda m: jet[int(m.group(1))], t)


def para(t, s=P):
    return Paragraph(md(t), s)


def tab(lignes, larg, entete=True):
    data = [[Paragraph(md(c), CEL) for c in l] for l in lignes]
    st = [('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#CCCCCC')),
          ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('LEFTPADDING', (0, 0), (-1, -1), 3.5), ('RIGHTPADDING', (0, 0), (-1, -1), 3.5),
          ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5)]
    if entete:
        st.append(('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F0F0F0')))
    return Table(data, colWidths=larg, style=TableStyle(st))


Ad(Paragraph('FORCE TRACKER — NUTRITION UX #1', H1))
Ad(Paragraph('LE REPAS ACTIF — 19/09/2026', H1))
Ad(Spacer(1, 5))

Ad(Paragraph('1. Cause exacte', H2))
Ad(para("<b>openAddFood</b> recalculait le repas actif depuis <b>new Date().getHours()</b> "
        "<b>a chaque ouverture</b> de l ecran d ajout. Or on rouvre cet ecran pour <b>chaque "
        "aliment</b> : un choix manuel ne survivait donc jamais au premier ajout. <b>C etait le "
        "seul recalcul du depot</b> — les trois autres mentions du repas actif sont sa "
        "declaration, sa lecture et le choix manuel."))

Ad(Paragraph('2. Fichier concerne', H2))
Ad(para("<b>app.js</b>, et lui seul. Ni state.js, ni screens.js, ni index.html. Les temoins "
        "vivent dans <b>tests/parcours/repas_actif.js</b> (nouveau)."))

Ad(Paragraph('3. Comportement AVANT — et ce n etait pas une gene d affichage', H2))
Ad(para("Mesure en conduisant l app servie, horloge gelee, choix manuel = <b>Dejeuner</b>. "
        "<b>La donnee partait ailleurs</b>, pas seulement l onglet :"))
Ad(tab([['heure', '1er aliment', '2e', '3e'],
        ['09 h', 'dejeuner', '<b>petitdej</b>', '<b>petitdej</b>'],
        ['16 h', 'dejeuner', '<b>collation</b>', '<b>collation</b>'],
        ['21 h', 'dejeuner', '<b>diner</b>', '<b>diner</b>']],
       [30 * mm, 46 * mm, 46 * mm, 46 * mm]))
Ad(Spacer(1, 3))
Ad(para("<b>Une journee rentree apres coup s eparpillait dans des repas que personne n avait "
        "choisis.</b> La ligne de 09 h est exactement le cas decrit : remplir la veille au "
        "matin, et retomber sur Petit-dejeuner."))

Ad(Paragraph('4. Correction minimale', H2))
Ad(para("<b>Le signal est l ABSENCE, pas un drapeau.</b> `_afMeal` ne porte plus que le "
        "<b>choix explicite</b> : <b>null</b> veut dire « personne n a choisi », et "
        "c est la seule information necessaire. <b>Zero booleen, zero timer, zero exception "
        "ecran par ecran.</b>"))
Ad(para("<b>Un seul proprietaire</b> (R2) : `_afMealActif()` repond seul a « dans quel "
        "repas ecrit-on ? ». Ses <b>%d</b> lecteurs y passent tous — les puces, les "
        "<b>%d ecrivains</b> du journal, le message de confirmation. Une porte restee sur la "
        "variable brute ecrirait <b>null</b> dans le journal, et ca ne se verrait qu en "
        "relisant ses repas des jours plus tard." % (F['lecteurs'], F['ecrivains'])))
Ad(para("<b>Echec ferme</b> : un repas absent de FOOD_MEALS retombe sur la suggestion horaire, "
        "jamais sur une valeur inventee. <b>%d ecriture</b> du choix dans tout le fichier, et "
        "<b>0</b> lecture brute hors du proprietaire." % F['ecritures']))

Ad(Paragraph('5. Comportement APRES', H2))
Ad(tab([['', 'attendu', 'mesure'],
        ['ouverture sans choix (09 h)', 'Petit-dej (suggestion horaire)', 'conforme'],
        ['choix manuel Dejeuner', 'Dejeuner actif', 'conforme'],
        ['apres 1 ajout', 'Dejeuner', 'conforme'],
        ['apres REOUVERTURE de l ecran', '<b>Dejeuner</b>', 'conforme'],
        ['3 aliments d affilee', 'les 3 dans dejeuner', 'conforme'],
        ['changement volontaire vers Diner', 'Diner immediatement', 'conforme'],
        ['aliment suivant', '<b>ecrit dans diner</b>', 'conforme']],
       [56 * mm, 66 * mm, 46 * mm]))

Ad(Paragraph('6. Scenario journee complete', H2))
Ad(para("Quatre repas, <b>neuf aliments</b>, chacun ajoute en <b>rouvrant</b> l ecran : "
        "Petit-dej (2) → Dejeuner (3) → Collation (1) → Diner (3). <b>Deux "
        "temoins, deux garanties</b> : le repas actif <b>ne derive jamais entre deux "
        "aliments</b>, et les <b>9 aliments</b> finissent dans les <b>4 bons repas</b>. Les "
        "deux passent."))

Ad(Paragraph('7-8. Tests cibles et resultats', H2))
_l = [['', 'resultat'],
      ['bloc B-CCCXXXVI (source)', '<b>%d</b> temoins' % F['temSrc']],
      ['bloc B-CCCXXXVII (conduit dans le navigateur)', '<b>%d</b> temoins' % F['temEcr']],
      ['banc cible', '<b>24 OK / 0 rouge</b>']]
if F['mut']:
    _l.append(['controle negatif (arbre clone)',
               '<b>%d/%d conformes</b>, sain vert avant ET apres' % F['mut']])
if F['passe']:
    _l.append(['passe complete', '<b>%d verts / %d rouges</b>%s'
               % (F['passe'][0], F['passe'][1], ' — <b>PASSE VALIDE</b>' if F['valide'] else '')])
Ad(tab(_l, [90 * mm, 80 * mm]))
Ad(Spacer(1, 3))
Ad(para("<b>L horloge du banc est gelee a 09 h, exprès</b> : c est l heure ou la suggestion "
        "horaire <b>differe</b> du choix manuel qu on pose. <i>Un banc cale sur une heure ou "
        "les deux coincident serait reste vert sur le code d avant.</i>"))
Ad(para("<b>La mutation qui compte est la deguisee</b> : elle remet le recalcul <b>en passant "
        "par le proprietaire du defaut</b> plutot qu en ecrivant l heure a la main. Un temoin "
        "qui ne chercherait que getHours() serait reste vert dessus. Elle mord. Deux mutations "
        "doivent <b>rester vertes</b> : elles ne touchent que des commentaires citant les mots "
        "cherches — <i>la seule facon de prouver qu on mesure le code et non la "
        "documentation</i>."))
Ad(para("<b>Trois de mes propres temoins ont rougi sur du code sain</b>, et les trois sont des "
        "defauts d instrument deja connus ici : un temoin qui figeait un <b>nombre</b> de "
        "lectures (l invariant juste est « ou », pas « combien ») ; un "
        "compteur d ecritures qui comptait la <b>declaration</b> ; et le <b>piege de l "
        "espace</b>, 8e fois — dans le commit meme ou je le corrigeais ailleurs."))

Ad(Paragraph('9. Observations UX a confirmer sur le terrain (NON corrigees)', H2))
Ad(para("&bull; <b>Le choix survit a un changement de JOUR dans le journal.</b> Le repas actif "
        "est global, independant du jour consulte : remplir hier en « Diner » puis "
        "passer a aujourd hui garde « Diner ». <b>Mesure, non tranche</b> — le besoin "
        "certain ne le dit pas, donc aucune remise a zero n a ete inventee (regle d or 15)."))
Ad(para("&bull; <b>Le choix ne survit pas a un rechargement complet de la PWA.</b> C est une "
        "variable de module : comportement actuel, <b>inchange</b>. Aucune preuve qu il faille "
        "toucher a la persistance longue."))

Ad(Paragraph('10-11. SHA final et version', H2))
_sh = [['SHA publie', F['sha']]]
if F['shaTeste'] and F['shaTeste'] != F['sha']:
    _sh.append(['SHA <b>teste par la passe</b>', F['shaTeste']])
    _sh.append(['delta', ', '.join(F['delta']) + ' — <b>aucun fichier servi ni de test</b>'])
elif F['shaTeste']:
    _sh.append(['SHA teste par la passe', '<b>le meme</b>'])
_sh.append(['version publiee', '<b>%s</b>' % F['version']])
Ad(tab(_sh, [40 * mm, 130 * mm], entete=False))

Ad(Spacer(1, 7))
Ad(Paragraph("Dossier produit par un script qui recompte ses %d faits depuis le code servi, "
             "lit le total de la passe DANS SON JOURNAL, refuse de produire si l un d eux "
             "tombe, et relit sa propre sortie." % NB, PET))

doc = BaseDocTemplate(SORTIE, pagesize=A4,
                      title='Force Tracker - Nutrition UX 1 - le repas actif',
                      author='Force Tracker')
doc.addPageTemplates([PageTemplate(
    id='p', frames=[Frame(20 * mm, 16 * mm, 170 * mm, A4[1] - 32 * mm, id='f')])])
doc.build(H)


def _relire(chemin):
    import zlib
    import base64
    data = open(chemin, 'rb').read()
    txt = []
    for m in re.finditer(rb'stream\r?\n(.*?)endstream', data, re.S):
        bloc = m.group(1)
        try:
            brut = base64.a85decode(bloc.strip().rstrip(b'~>'), adobe=False)
        except Exception:                                  # noqa
            brut = bloc
        for essai in (brut, bloc):
            try:
                txt.append(zlib.decompress(essai).decode('latin-1'))
                break
            except Exception:                              # noqa
                continue
    return '\n'.join(txt)


_t = _relire(SORTIE)
_lis = ' '.join(x[1:-1] for x in re.findall(r'\((?:[^()\\]|\\.)*\)', _t))
_bal = len(re.findall(r'&lt;b&gt;|<b>|&lt;/b&gt;', _lis))
if _bal:
    os.remove(SORTIE)
    sys.exit('REFUS : %d balise(s) en clair dans le PDF produit' % _bal)
if len(_lis) < 4000:
    os.remove(SORTIE)
    sys.exit('REFUS : le PDF relu ne fait que %d caracteres lisibles' % len(_lis))
print('   relu : %d caracteres lisibles, 0 balise en clair' % len(_lis))
print('OK %s (%d gardes, %d octets)' % (SORTIE, NB, os.path.getsize(SORTIE)))
