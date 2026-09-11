#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/PLAN-NUTRITION.pdf — le PLAN D'EXECUTION pour simplifier le module Nutrition.

   Demande de Michel : *« On a assez audite. Je ne veux pas un nouveau PDF de diagnostic. Je veux
   un PLAN D'EXECUTION concret pour simplifier l'architecture Nutrition sans reecrire le module. »*
   Troisieme et dernier document de la serie : DOUANE (les ecritures) -> ARCHI (le module) -> PLAN.

⭐ LES COMPTES DU CODE SONT RECALCULES a l'execution (portes, constructeurs, traductions,
   derivations, filtres, ecritures). Un plan qui cite « les 4 traductions » doit dire la verite
   le jour ou on l'ouvre, pas le jour ou on l'a ecrit.

⚠️ EN REVANCHE, LES DEUX MESURES DE FUITE NE SONT PAS RECALCULEES ICI, ET C'EST DIT DANS LE
   DOCUMENT. Elles viennent d'une sonde Playwright (`tools/sonde_fuites_nutrition.js`) qui demande
   un navigateur et ~40 s : la faire tourner dans un generateur de PDF serait fragile et lent.
   Le document cite donc la SORTIE datee de la sonde, et nomme le fichier pour qu'on puisse la
   rejouer. *Un chiffre mesure qu'on ne peut pas rejouer est un chiffre qu'il faut croire.*

⚠️ CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji. `_v` est une LISTE BLANCHE.
"""
import html
import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether, Preformatted, PageBreak)
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'PLAN-NUTRITION.pdf')
SONDE = 'tools/sonde_fuites_nutrition.js'

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read().split('\n')
STATE = open(os.path.join(ROOT, 'state.js'), encoding='utf-8').read().split('\n')


def trouver(motif, L=None):
    L = APP if L is None else L
    return [(k + 1, l) for k, l in enumerate(L) if re.search(motif, l)]


PUSHES = trouver(r'S\.foodLog\.push\(')
NUTRS = trouver(r'_bcNutr\s*=\s*\{')
TRAD = trouver(r'per100:\{kcal:_bcNutr\.kcal100')
DERIV = trouver(r'per100\s*=\s*\{kcal:_per100d1\(')
QOK = trouver(r"\+\w+\.q>0\s*&&\s*\(!\w+\.u\|\|\w+\.u==='g'")
QOK_P = [n for n, l in QOK if "'portion'" in l]
QOK_S = [n for n, l in QOK if "'portion'" not in l]
HUB = [(n, l) for n, l in trouver(r'_offRemplirFormulaire\(') if not l.strip().startswith('function')]
FORME = trouver(r'portionWeightG:\s*\+')
BRUT = []
for no, _ in NUTRS:
    bloc = []
    for k in range(no - 1, min(no + 9, len(APP))):
        bloc.append(APP[k])
        if '};' in APP[k]:
            break
    if '_per100d1' not in '\n'.join(bloc):
        BRUT.append(no)

# La sonde existe-t-elle encore ? Un document qui cite un fichier absent ment.
if not os.path.exists(os.path.join(ROOT, SONDE)):
    raise SystemExit('SONDE INTROUVABLE : %s — le document la cite comme rejouable.' % SONDE)

# Les deux fuites sont-elles TOUJOURS ouvertes ? Si elles sont corrigees, le plan est perime.
_ou = trouver(r'^function _afOublierAliment\(\)')
_fin = next(k for k in range(_ou[0][0], len(APP)) if APP[k].startswith('}'))
if '_bcPaquetG' in '\n'.join(APP[_ou[0][0] - 1:_fin + 1]):
    raise SystemExit('_bcPaquetG EST DESORMAIS NETTOYE : la phase 0a de ce plan est faite, '
                     'il faut relire le document avant de le regenerer.')
if any('savedFoods' in l for _, l in trouver(r'_fusionListe\(', STATE)):
    raise SystemExit('savedFoods EST DESORMAIS FUSIONNE : la mesure 2 de ce plan est perimee.')

for quoi, vu, att in [('ecritures foodLog', len(PUSHES), 3), ('constructeurs _bcNutr', len(NUTRS), 8),
                      ('traductions', len(TRAD), 4), ('derivations', len(DERIV), 3),
                      ('filtres quantite', len(QOK), 6), ('appels au hub', len(HUB), 5)]:
    if vu != att:
        raise SystemExit('LA FORME DU DEPOT A CHANGE : %s = %d, attendu %d. Le plan citerait des '
                         'chiffres faux.' % (quoi, vu, att))

# ⚠️ SORTIE DE LA SONDE — mesuree le 11/09/2026, PAS recalculee ici (voir l'en-tete).
SONDE_1 = """ouverture de l'ecran      -> _bcPaquetG = 0     pastille cachee
produit A (boite 410 g)   -> _bcPaquetG = 410   pastille "410 g (le paquet entier)"
produit B (Mes aliments)  -> _bcPaquetG = 410   pastille "410 g (le paquet entier)"
                             nom affiche a l'ecran : "Yaourt nature\""""
SONDE_2 = """A ecrit "Pain"                      -> disque : ["Pain"]
B (liste perimee) ecrit "Fromage"   -> disque : ["Fromage"]          <- Pain perdu
TEMOIN foodLog, meme scenario       -> ["Fromage","Pain"]            <- garde"""

ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
FONDC = colors.HexColor('#EEEEEC')
TRAIT = colors.HexColor('#D8D8D4')
VERT = colors.HexColor('#1E7A46')
ORANGE = colors.HexColor('#B26A00')

S = getSampleStyleSheet()
st = {
    'titre': ParagraphStyle('titre', parent=S['Title'], fontName='Helvetica-Bold',
                            fontSize=19, leading=23, textColor=ENCRE, alignment=TA_LEFT, spaceAfter=2),
    'sous': ParagraphStyle('sous', parent=S['Normal'], fontName='Helvetica',
                           fontSize=9.5, leading=13, textColor=GRIS, spaceAfter=14),
    'h1': ParagraphStyle('h1', parent=S['Heading1'], fontName='Helvetica-Bold',
                         fontSize=13, leading=16, textColor=ROUGE, spaceBefore=14, spaceAfter=6),
    'h2': ParagraphStyle('h2', parent=S['Heading2'], fontName='Helvetica-Bold',
                         fontSize=10.5, leading=13.5, textColor=ENCRE, spaceBefore=9, spaceAfter=4),
    'p': ParagraphStyle('p', parent=S['Normal'], fontName='Helvetica',
                        fontSize=9.3, leading=13.2, textColor=ENCRE, spaceAfter=6),
    'petit': ParagraphStyle('petit', parent=S['Normal'], fontName='Helvetica',
                            fontSize=8.2, leading=11.5, textColor=GRIS, spaceAfter=5),
    'cell': ParagraphStyle('cell', parent=S['Normal'], fontName='Helvetica',
                           fontSize=8.1, leading=10.6),
    'cellb': ParagraphStyle('cellb', parent=S['Normal'], fontName='Helvetica-Bold',
                            fontSize=8.1, leading=10.6),
    'code': ParagraphStyle('code', parent=S['Normal'], fontName='Courier',
                           fontSize=7.2, leading=9.0, textColor=ENCRE),
}


def _v(x, ou='texte'):
    if isinstance(x, str):
        for ch in x:
            try:
                ch.encode('cp1252')
            except UnicodeEncodeError:
                raise SystemExit('CARACTERE NON RENDU %r (%s) dans %s' % (ch, hex(ord(ch)), ou))
        for m in re.finditer(r'&#(\d+);|&#[xX]([0-9a-fA-F]+);', x):
            n = int(m.group(1)) if m.group(1) else int(m.group(2), 16)
            try:
                chr(n).encode('cp1252')
            except UnicodeEncodeError:
                raise SystemExit('ENTITE HTML NON RENDUE %s dans %s' % (m.group(0), ou))
        # ⛔⛔ QUATRIEME TROU DE CE GARDE-FOU, ET LA MEME LECON A CHAQUE FOIS.
        #    (1) il n'inspectait que les paragraphes -> un emoji est passe par un titre.
        #    (2) il ne lisait que les CARACTERES -> l'entite `&#9888;` est passee.
        #    (3) il ne connaissait qu'une LISTE noire -> les puces ① sont passees.
        #    (4) ICI : il lisait les entites NUMERIQUES et pas les NOMMEES -> `-&gt;` (U+2192)
        #        est passe, et cette fleche n'existe pas en WinAnsi : carre noir a l'ecran.
        #    👉 *Une liste blanche ne protege que ce qu'elle REGARDE.* Le test est bon depuis (3) ;
        #    c'est sa COUVERTURE qui etait incomplete — un angle mort, pas une erreur de critere.
        for m in re.finditer(r'&([A-Za-z][A-Za-z0-9]{1,15});', x):
            ch = html.unescape(m.group(0))
            if len(ch) == 1:
                try:
                    ch.encode('cp1252')
                except UnicodeEncodeError:
                    raise SystemExit('ENTITE NOMMEE NON RENDUE %s (%s) dans %s — police '
                                     'WinAnsi/cp1252' % (m.group(0), hex(ord(ch)), ou))
    return x


C = "<font face='Courier'>%s</font>"


def P(t, s='p'):
    return Paragraph(_v(t, 'paragraphe'), st[s])


def encadre(titre, corps, couleur=ROUGE):
    t = Table([[Paragraph('<b>%s</b>' % _v(titre, 'titre'), st['cellb'])],
               [Paragraph(_v(corps, 'corps'), st['cell'])]], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FOND),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBEFORE', (0, 0), (0, -1), 2.4, couleur), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    return KeepTogether(t)


def tableau(entetes, ligs, largeurs, garder=False):
    data = [[Paragraph('<b>%s</b>' % _v(h, 'en-tete'), st['cellb']) for h in entetes]]
    for l in ligs:
        data.append([Paragraph(_v(c, 'cellule'), st['cell']) for c in l])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EDEDEA')),
        ('GRID', (0, 0), (-1, -1), 0.4, TRAIT), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    return KeepTogether(t) if garder else t


def etape(num, titre, lignes, largeurs=(34 * mm, 131 * mm)):
    """Une etape du plan : titre + tableau a 2 colonnes (rubrique / contenu)."""
    return [P('%s &mdash; %s' % (num, titre), 'h2'),
            tableau(['rubrique', 'contenu'], lignes, list(largeurs))]


_LARG = 165 * mm - 12
_MAX = int(_LARG / stringWidth('x', 'Courier', 7.2))


def bloc_code(txt, legende=None):
    _v(txt, 'bloc de code')
    for l in txt.split('\n'):
        if stringWidth(l, 'Courier', 7.2) > _LARG:
            raise SystemExit('LIGNE QUI DEBORDE (%d car) : %s' % (len(l), l[:70]))
    t = Table([[Preformatted(txt, st['code'])]], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FONDC),
        ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBEFORE', (0, 0), (0, -1), 2.0, TRAIT), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    if legende:
        return KeepTogether([Paragraph(_v(legende, 'legende'), st['petit']), t])
    return t


def pied(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(GRIS)
    canvas.drawString(22 * mm, 12 * mm, 'Force Tracker — plan d execution Nutrition — 11/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P("Plan d'execution &mdash; simplifier Nutrition sans le reecrire", 'titre'))
F.append(P("Force Tracker &mdash; 11/09/2026. Troisieme et dernier document de la serie : "
           + C % 'DOUANE-NUTRITION.pdf' + " (les ecritures) -&gt; " + C % 'ARCHI-NUTRITION.pdf' +
           " (le module) -&gt; <b>celui-ci, le plan</b>. Michel : <i>&laquo; on a assez audite. "
           "Je veux un chantier progressif, pas une refonte massive. &raquo;</i> "
           "<b>Aucun code n'est ecrit</b> : ce document propose l'ordre le moins risque et les "
           "criteres de passage d'une phase a la suivante.", 'sous'))

F.append(encadre(
    "CE QUE LE PLAN GARDE, ET CE QU'IL CHANGE",
    "<b>Il garde :</b> les <b>13 portes d'entree</b> &middot; tous les comportements valides "
    "&middot; la provenance &middot; l'historique intact."
    "<br/><b>Il change :</b> les portes cessent de <b>reconstruire chacune leur propre forme "
    "d'aliment</b>, les regles communes gagnent un proprietaire unique, et une <b>douane</b> "
    "apparait avant les %d ecritures."
    "<br/><br/><b>Il ne fait PAS :</b> l'historique &middot; les migrations &middot; la reecriture "
    "des portes &middot; un gros etat global &middot; aucun changement de comportement aux "
    "etapes 1, 2 et 3." % len(PUSHES), VERT))

# ── Les deux mesures ──
F.append(P("Les deux mesures demandees avant de commencer", 'h1'))
F.append(P("Michel : <i>&laquo; ces deux points doivent etre mesures, pas corriges silencieusement &raquo;</i>. "
           "Les deux sont <b>confirmes</b>. La sonde est rangee dans " + C % SONDE + " et se rejoue "
           "&mdash; <b>elle n'est pas recalculee a la generation de ce PDF</b> (elle demande un "
           "navigateur), donc ce qui suit est la sortie <b>datee du 11/09/2026</b>.", 'petit'))

F.append(P("Mesure 1 &mdash; " + C % '_bcPaquetG' + " survit bien d'un aliment au suivant", 'h2'))
F.append(bloc_code(SONDE_1))
F.append(Spacer(1, 4))
F.append(P("<b>Confirme.</b> Un yaourt a qui l'app propose <i>&laquo; le paquet entier : 410 g &raquo;</i>. "
           "C'est le bug " + C % '_bcCategories' + " de ft-v1191 <b>sur une autre variable</b> : "
           + C % '_afOublierAliment' + " nettoie 4 choses et pas celle-la, et la pastille n'est "
           "repeinte que par le hub &mdash; donc les 3 portes hors hub la laissent a l'ecran."))

F.append(P("Mesure 2 &mdash; " + C % 'S.savedFoods' + " se perd bien entre deux onglets", 'h2'))
F.append(bloc_code(SONDE_2))
F.append(Spacer(1, 4))
F.append(P("<b>Confirme, et le temoin de controle valide la mesure</b> : la meme manoeuvre sur une "
           "liste <b>fusionnee</b> garde les deux entrees. Ce n'est donc pas le banc qui deraille."))
F.append(Spacer(1, 4))
F.append(encadre(
    "ET LE CORRECTIF EVIDENT EST FAUX — c'est le point le plus important des deux mesures",
    "Ajouter " + C % 'savedFoods' + " a " + C % '_fusionListe' + " ferait une <b>union par nom</b> "
    "&mdash; donc <b>retirer une etoile dans l'onglet A serait annule par la liste perimee de B</b>. "
    "<br/><br/>Les 5 listes deja fusionnees sont des <b>journaux qui ne font qu'AJOUTER</b> ; les "
    "favoris, eux, <b>se suppriment couramment</b>. <i>Une fusion par union sur une liste ou l'on "
    "retire est une resurrection, pas une protection.</i> Il faut un horodatage ou une pierre "
    "tombale &mdash; <b>c'est une decision produit, pas une rustine</b>, et elle n'est pas prise ici.",
    ROUGE))

# ── Phase 0 ──
F.append(PageBreak())
F.append(P("Phase 0 &mdash; ce qui est mesure aujourd'hui, avant toute extraction", 'h1'))
F.append(tableau(
    ["", "quoi", "pourquoi maintenant"],
    [["0a", "" + C % '_bcPaquetG' + " remis a zero dans " + C % '_afOublierAliment',
      "<b>1 ligne + 1 temoin.</b> Doit passer AVANT : la phase 2 change les portes, et la "
      "comparaison avant/apres deviendrait impossible a lire"],
     ["0b", "" + C % 'savedFoods' + " multi-onglets",
      "<b>mesure, PAS corrige</b> &mdash; ecrit dans " + C % 'docs/JOURNAL-DE-TEST.md' +
      " avec la raison ci-dessus. Attend une decision"]],
    [8 * mm, 52 * mm, 105 * mm]))
F.append(Spacer(1, 4))
F.append(P("<b>Critere de passage vers la phase 1</b> : 0a livre &middot; la mutation qui retire la "
           "ligne fait rougir <b>exactement 1</b> temoin &middot; passe complete au total attendu.", 'petit'))

# ── Etape 1 ──
F.append(P("Etape 1 &mdash; le constructeur canonique", 'h1'))
F.append(P("<b>Deux objets, pas un</b> &mdash; c'est la seule subtilite de l'etape, et l'ignorer "
           "melangerait la reference pour-100&nbsp;g avec la ligne consommee."))
F.append(tableau(
    ["", "fonction", "remplace"],
    [["1a", C % '_ref100(name, kcal, prot, carbs, fat)',
      "les <b>%d</b> " % len(NUTRS) + C % '_bcNutr={...}' + " <b>+ les %d traductions</b>" % len(TRAD)],
     ["1b", C % '_alimentCanonique(src)',
      "les <b>%d</b> constructions de " % len(FORME) + C % '{name, kcal, ..., portionWeightG}']],
    [8 * mm, 62 * mm, 95 * mm]))
F.append(Spacer(1, 4))
F.extend(etape("Detail", "etape 1", [
    ["fichiers", C % 'app.js' + " seul"],
    ["ancien flux", "chaque porte ecrit " + C % '{name, kcal100: ...}' + " a la main, puis %d "
     "d'entre elles reecrivent " % len(TRAD) + C % 'per100:{kcal:_bcNutr.kcal100, ...}'],
    ["nouveau flux", C % '_ref100()' + " rend <b>un objet qui porte les deux faces</b> : "
     + C % 'kcal100...' + " (tous les lecteurs actuels marchent sans changement) <b>et</b> "
     + C % 'per100' + " (les %d traductions disparaissent)" % len(TRAD)],
    ["<b>risque</b>", "<b>les 2 portes de reprise ne normalisent pas</b> (lignes %s, "
     % ', '.join(str(n) for n in BRUT) + C % '+P.kcal||0' + "). Si " + C % '_ref100' + " applique "
     + C % '_per100d1' + " partout, <b>une valeur peut changer</b> sur la reprise d'une ancienne ligne"],
    ["reponse au risque", C % "_ref100(..., {normaliser:false})" + " pour ces 2 portes. <b>On "
     "extrait, on n'uniformise pas</b> &mdash; uniformiser est une decision a part"],
    ["temoins AVANT", "un <b>instantane</b> : pour les %d portes, serialiser " % len(NUTRS)
     + C % '_bcNutr' + " <b>et</b> " + C % '_afSrc.per100' + " en JSON, dans un fichier de reference"],
    ["<b>reussite</b>", "<b>l'instantane est identique octet pour octet</b> + passe complete au "
     "total attendu, <b>aucune valeur attendue modifiee</b>"],
    ["mutations", "(1) " + C % '_ref100' + " rend " + C % 'null' + " -&gt; toutes les portes "
     "rougissent &middot; (2) " + C % '_per100d1' + " retire -&gt; les %d portes normalisees "
     "rougissent, <b>les %d brutes non</b> (preuve que l'exception est reelle) &middot; (3) "
     % (len(NUTRS) - len(BRUT), len(BRUT)) + C % 'per100' + " non emis -&gt; les %d "
     "ex-traductions rougissent" % len(TRAD)],
    ["rollback", "1 commit, " + C % 'git revert' + ". Aucune donnee touchee"],
]))

# ── Etape 2 ──
F.append(PageBreak())
F.extend(etape("Etape 2", "la derivation " + C % 'per100', [
    ["fichiers", C % 'app.js' + " &mdash; les %d blocs (deux dans " % len(DERIV) + C % '_provFood'
     + ", un dans l'ecran modifier)"],
    ["ancien flux", C % 'const f=100/masse; p.per100={kcal:_per100d1(vals.kcal*f), ...}' + " x %d" % len(DERIV)],
    ["nouveau flux", C % '_per100Derive(totaux, masse)' + " -&gt; " + C % 'null' + " si "
     + C % 'masse &lt;= 0'],
    ["<b>risque</b>", "<b>quasi nul, mais pas nul</b> : le bloc de l'ecran modifier fait "
     + C % 'delete e.per100' + " quand la masse tombe a 0. Ce " + C % 'delete' + " <b>reste chez "
     "l'appelant</b> &mdash; la fonction rend " + C % 'null' + ", elle ne supprime rien"],
    ["temoins AVANT", "les 3 chemins existent deja au banc (ft-v1188) ; on ajoute un instantane des 3 sorties"],
    ["reussite", "memes chiffres, <b>y compris les decimales</b>"],
    ["mutations", "(1) " + C % 'Math.round' + " au lieu de " + C % '_per100d1' + " -&gt; rougit aux "
     "%d &middot; (2) " % len(DERIV) + C % 'null' + " remplace par " + C % '{0,0,0,0}' +
     " -&gt; rougit sur le poids retire"],
    ["rollback", C % 'git revert'],
]))

# ── Etape 3 ──
F.append(P("Etape 3 &mdash; &laquo; quantite utilisable &raquo; : deux regles, nommees", 'h1'))
F.append(encadre(
    "ON NE FUSIONNE PAS — ET C'EST MESURE",
    "Sur les <b>%d</b> ecritures du filtre, <b>%d acceptent</b> " % (len(QOK), len(QOK_P))
    + C % "'portion'" + " et <b>%d non</b>. Et les %d qui refusent alimentent un <b>champ en "
    "grammes</b> : on ne peut pas y proposer &laquo; 2 portions &raquo;. <b>La difference est "
    "reelle, pas un oubli.</b> Les fusionner casserait une des deux." % (len(QOK_S), len(QOK_S)),
    ORANGE))
F.append(Spacer(1, 4))
F.extend(etape("Detail", "etape 3", [
    ["nouveau flux", C % '_quantiteUtilisable(q, u, {portions: true|false})' + " &mdash; <b>un "
     "proprietaire, deux modes explicites</b>, jamais un booleen devine"],
    ["<b>risque</b>", "<b>le vrai risque est de se tromper de mode sur un site.</b> D'ou : "
     "<b>un site a la fois, un commit par site</b>"],
    ["temoins AVANT", "une table des %d sites x 4 entrees (" % len(QOK) + C % '120/g' + " &middot; "
     + C % '2/portion' + " &middot; " + C % '0/g' + " &middot; " + C % '150/ml' + ") figee en instantane"],
    ["reussite", "les %d cases identiques" % (len(QOK) * 4)],
    ["mutations", "(1) " + C % 'portions:true' + " partout -&gt; rougit sur les %d &middot; (2) "
     % len(QOK_S) + C % 'portions:false' + " partout -&gt; rougit sur les %d &middot; (3) la "
     "fonction rend toujours " % len(QOK_P) + C % 'true' + " -&gt; rougit partout"],
    ["rollback", C % 'git revert' + ", %d commits separes" % len(QOK)],
]))

# ── Etape 4 ──
F.append(PageBreak())
F.extend(etape("Etape 4", "le hub commun, <b>une porte a la fois</b>", [
    ["ordre", "(1) " + C % 'onFoodLabelFile' + " (la copie la plus proche du hub) -&gt; (2) "
     + C % 'quickFillFood' + " -&gt; (3) " + C % '_afSuggPrendreLocale'],
    ["ancien flux", "chaque porte refait les lignes du hub <b>en omettant</b> " + C % 'etat'
     + " &middot; " + C % 'sourceId' + " &middot; " + C % '_bcPaquetG' + " &middot; "
     + C % '_afNoteEtat' + " &middot; " + C % '_bcProposerDerniere(0)' + " &middot; la carte sante"],
    ["nouveau flux", "la porte appelle " + C % '_offRemplirFormulaire' + ", puis <b>surcharge "
     "ce qui lui est propre</b>"],
    ["<b>risque</b>", "<b>c'est la SEULE etape qui change un comportement</b> : ces portes vont "
     "gagner ce qu'elles omettaient. " + C % "etat:'tel-que-vendu'" + " sur une <b>reprise</b> "
     "serait <b>faux</b> &mdash; une ligne reprise n'est pas une fiche fabricant"],
    ["reponse au risque", "le hub prend un parametre " + C % 'etat' + " explicite ; <b>et au "
     "passage, les 2 clients qui l'ecrasent aujourd'hui (marque, CIQUAL) cessent de travailler "
     "pour rien</b>"],
    ["temoins AVANT", "pour chacune des 3 portes, un instantane <b>complet</b> de " + C % '_afSrc'
     + " + du DOM du bloc quantite"],
    ["<b>reussite</b>", "<b>le diff est LU ligne par ligne et chaque ecart est nomme</b> &mdash; "
     "soit voulu, soit refuse. <i>Un diff qu'on ne lit pas est un diff qu'on accepte a l'aveugle.</i>"],
    ["mutations", "(1) porte remise sur sa copie locale -&gt; rougit &middot; (2) " + C % 'etat'
     + " pose en dur -&gt; rougit sur la reprise"],
    ["rollback", "<b>1 commit par porte</b> &mdash; on annule une porte sans toucher aux deux autres"],
]))

# ── Etape 5 ──
F.extend(etape("Etape 5", "la douane", [
    ["ou", "entre les %d " % len(PUSHES) + C % 'push' + " et " + C % 'S.foodLog' + " &mdash; "
     "<b>une piece neuve</b>, pas un deplacement de code"],
    ["entree", "un objet <b>deja canonique</b> (etape 1)"],
    ["elle controle", "quantite / unite &middot; " + C % 'per100' + " &middot; les 4 macros "
     "&middot; regles physiques &middot; coherence kcal/macros &middot; provenance &middot; doute "
     "&middot; champs obligatoires &middot; <b>perte silencieuse de champs</b>"],
    ["<b>le point decisif</b>", "la liste des champs devient <b>FERMEE</b> : un champ inconnu "
     "<b>leve</b>, il ne disparait plus. <i>C'est ca qui tue la famille des 4 oublis de "
     + C % '_provFood' + ".</i>"],
    ["<b>risque</b>", "<b>une douane qui REFUSE peut faire perdre un repas</b> &mdash; or la regle "
     "d'or n&deg;3 dit <i>zero perte</i>"],
    ["reponse au risque", "<b>la douane MESURE avant de MORDRE</b> : livree d'abord en <b>mode "
     "observateur</b> (elle ecrit son verdict sur la ligne, elle ne bloque rien). On lit ce qu'elle "
     "aurait refuse <b>sur les vraies donnees</b> ; <b>ensuite seulement</b> on decide ce qui "
     "devient bloquant"],
    ["reussite (observateur)", "100 % des lignes passent, et les verdicts sont lisibles"],
    ["mutations", "(1) douane court-circuitee &middot; (2) champ inconnu accepte en silence "
     "&middot; (3) chaque controle neutralise un par un"],
    ["rollback", "en mode observateur, <b>retirer l'appel suffit</b> &mdash; aucun comportement "
     "n'en depend"],
]))

# ── Les phases ──
F.append(PageBreak())
F.append(P("Les phases et leurs criteres de passage", 'h1'))
F.append(tableau(
    ["phase", "contenu", "critere pour passer a la suivante"],
    [["<b>0</b>", C % '_bcPaquetG' + " corrige &middot; " + C % 'savedFoods' + " mesure et ecrit",
      "mutation qui mord &middot; passe au total attendu"],
     ["<b>1</b>", "etapes 1, 2, 3 &mdash; <b>extractions pures</b>",
      "<b>les 3 instantanes identiques octet pour octet</b> &middot; <b>aucune valeur attendue "
      "modifiee</b> &middot; toutes les mutations mordent"],
     ["<b>2</b>", "etape 4 &mdash; le hub, 3 portes",
      "<b>chaque ecart du diff nomme et justifie</b> &middot; <b>validation iPhone apres CHAQUE "
      "porte</b>, pas a la fin"],
     ["<b>3</b>", "etape 5 &mdash; la douane <b>en observateur</b>",
      "ses verdicts lus sur les vraies donnees &middot; <b>zero ligne refusee</b>"],
     ["<b>4</b>", "duplications devenues mortes",
      "<b>rien ne se supprime sans une mutation qui prouve que plus personne ne l'appelle</b> "
      "(R30 : un retrait s'ecrit avec sa raison)"],
     ["<b>5</b>", "validation iPhone complete", "les 13 portes parcourues a la main"]],
    [14 * mm, 56 * mm, 95 * mm]))

F.append(Spacer(1, 6))
F.append(encadre(
    "LA REGLE QUI GOUVERNE TOUT LE PLAN",
    "<b>On ne passe pas a la phase suivante tant qu'une seule mutation de la phase en cours ne "
    "mord pas.</b>"
    "<br/><br/>Une mutation qui ne mord pas est <b>soit du code inutile, soit un trou de "
    "temoin</b> &mdash; et c'est exactement cette question qui a trouve de vrais defauts en "
    "<b>ft-v1186, ft-v1187, ft-v1189 et ft-v1191</b>. Quatre fois de suite, le controle negatif a "
    "corrige le temoin avant que le temoin ne certifie du vide.", ROUGE))

F.append(Spacer(1, 6))
F.append(P("Recommandation", 'h2'))
F.append(P("<b>Phase 0 tout de suite</b> &mdash; le paquet de 410 g est un vrai bug, visible a "
           "l'ecran, et il tient en une ligne. Puis <b>l'etape 1a seule</b> : c'est celle qui "
           "rapporte le plus (les %d traductions et les %d constructeurs) pour le risque le plus "
           "faible, et elle se juge sur un critere binaire &mdash; <b>l'instantane bouge, ou il ne "
           "bouge pas</b>." % (len(TRAD), len(NUTRS))))

F.append(Spacer(1, 6))
F.append(encadre(
    "CE QUE CE DOCUMENT N'EST PAS",
    "<b>Aucun code n'a ete ecrit, aucune ligne de production n'a change</b> &mdash; sauf l'ajout "
    "de la sonde de mesure dans " + C % 'tools/' + ", qui ne tourne jamais dans l'application."
    "<br/><br/>Honnetete sur la methode : les chiffres du code sont recalcules a chaque generation "
    "et le generateur <b>refuse de produire</b> si la forme du depot change ou si l'une des deux "
    "fuites est refermee. <b>Les deux mesures de fuite, elles, ne sont pas recalculees ici</b> "
    "(elles demandent un navigateur) : le document cite la sortie datee et nomme le fichier pour "
    "qu'on puisse la rejouer. <i>Un chiffre mesure qu'on ne peut pas rejouer est un chiffre qu'il "
    "faut croire.</i>", GRIS))

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker — plan d execution Nutrition',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
print('   mesure : %d ecritures, %d constructeurs (%d bruts), %d traductions, %d derivations, '
      '%d filtres (%d avec portion), %d appels au hub, %d formes a la main'
      % (len(PUSHES), len(NUTRS), len(BRUT), len(TRAD), len(DERIV), len(QOK), len(QOK_P),
         len(HUB), len(FORME)))
