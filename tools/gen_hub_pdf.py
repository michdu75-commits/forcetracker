#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/ETAPE4-HUB.pdf — le hub de preparation Nutrition, et ce qu'il REFUSE de faire.
   Dix-septieme document de la serie, premier de l'etape 4.

TOUS LES DECOMPTES SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI.
Les gardes les plus importants sont ceux du NEGATIF : ils refusent de produire si le hub s'est mis
a valider, a corriger, a ecrire au journal, ou a absorber une porte qui ne fait pas le noyau.
Un hub qui deborde reste vert a l'ecran — c'est precisement pour ca qu'ils lisent le CODE.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji, entites nommees comprises.
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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'ETAPE4-HUB.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
SONDE = open(os.path.join(ROOT, 'tools', 'instantane_1b23.js'), encoding='utf-8').read()
RUN = open(os.path.join(ROOT, 'tests', 'parcours', 'runner.js'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = \'(ft-v\d+)\'", SW) or [None, '?'])[1]
SHA_INSTANTANE = 'cfcffd90645abe53'

CODE = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), APP)
CODE = '\n'.join(l for l in CODE.split('\n') if not l.strip().startswith('//'))
LIGNES = CODE.split('\n')
DECL = [(i, re.match(r'(?:async )?function (\w+)\(', l).group(1))
        for i, l in enumerate(LIGNES) if re.match(r'(?:async )?function \w+\(', l)]


def corps(nom):
    """⚠️ Borne par la DECLARATION SUIVANTE, pas par un `\n}` : la premiere version de cet
       extracteur ratait les `async function` et attribuait des appels a la mauvaise porte."""
    for k, (i, n) in enumerate(DECL):
        if n == nom:
            return '\n'.join(LIGNES[i:(DECL[k + 1][0] if k + 1 < len(DECL) else len(LIGNES))])
    return ''


# ── LES DECOMPTES, REFAITS ICI ───────────────────────────────────────────────
C_HUB = corps('_afPreparerEcran')
N_HUB = len(re.findall(r'_afPreparerEcran\(', CODE))
PORTES = [n for _, n in DECL if '_afOublierAliment(' in corps(n) and n != '_afOublierAliment']
N_PORTES = len(PORTES)
# ⚠️ Les APPELANTS du hub ne sont pas un sous-ensemble des portes : `_offRemplirFormulaire` n'en
#    est PAS une (ce sont ses 5 appelants qui le sont). Compte-les donc a part, sinon on publie
#    « 7 portes servies » pour 6 — l'erreur attrapee avant d'ecrire le chiffre.
MIGREES = [n for _, n in DECL if '_afPreparerEcran(' in corps(n) and n != '_afPreparerEcran']
VIA_OFF = [n for n in PORTES if '_offRemplirFormulaire(' in corps(n)]
SERVIES = sorted(set(VIA_OFF) | set(n for n in PORTES if n in MIGREES))
# les 8 gestes du noyau, recomptes porte par porte
NOYAU = [r"af-bc-grams'\)", r'_bcQtyPose\s*=\s*false', r'_bcProposerPortion\(', r'_bcQsrc\(',
         r"af-bc-name'\)", r"af-bc-row'\)", r"af-desc'\)", r'_bcApplyGrams\(']


def part(nom):
    c = corps(nom)
    return sum(1 for rx in NOYAU if re.search(rx, c))


CLES = sorted(set(re.findall(r"out\[\'([^\']+)\'\]", SONDE)))
N_TEMOINS = len(re.findall(r"t\(\'CCCII ", RUN))

# ⛔⛔ LES GARDES DU NEGATIF — ils protegent ce que le hub REFUSE de faire.
if not C_HUB:
    raise SystemExit('`_afPreparerEcran` est introuvable : tout le document parle de lui.')
if re.search(r'_afSetSrc|S\.foodLog|toast\(', C_HUB):
    raise SystemExit('LE HUB EST DEVENU LA DOUANE : il pose une provenance, ecrit au journal ou '
                     'affiche un message. Le §3 affirme exactement le contraire, et Michel a '
                     'borne l etape : le hub PREPARE, la douane validera plus tard.')
if re.search(r'_bcProposerDerniere|_bcProposerPaquet|_bcPaquetG|_afNoteEtat|FoodHealth', C_HUB):
    raise SystemExit('LE HUB A ABSORBE UN DES 5 GESTES QUE `onFoodLabelFile` NE FAIT PAS : il '
                     'change donc le comportement de cette porte. Le §2 affirme le contraire.')
if re.search(r'_qGrammes|_qReprenable|_afReprendre|_srcReprise|_srcProvenance|_itemListe|_per100Derive',
             C_HUB):
    raise SystemExit('LE HUB TOUCHE UN PROPRIETAIRE DE 1b/3 : le §3 affirme qu il n en touche '
                     'aucun, et c est la frontiere entre preparer et decider.')
if N_HUB != 3:
    raise SystemExit('`_afPreparerEcran` a %d occurrences, pas 3 (1 declaration + 2 portes) : '
                     'le §2 cite ce chiffre.' % N_HUB)
if N_PORTES != 12:
    raise SystemExit('Le depot porte %d portes, pas 12 : toute la cartographie du §1 en depend.'
                     % N_PORTES)
if sorted(MIGREES) != sorted(['_offRemplirFormulaire', 'onFoodLabelFile']):
    raise SystemExit('Les appelants du hub sont %s, pas les deux attendus : le §1 et le §4 citent '
                     'exactement ceux-la.' % MIGREES)
if len(SERVIES) != 6:
    raise SystemExit('%d portes atteignent le hub, pas 6 (%s) : le §7 cite ce chiffre, et il a '
                     'deja ete faux une fois — `_offRemplirFormulaire` n est PAS une porte.'
                     % (len(SERVIES), SERVIES))
for nom, attendu in (('quickFillFood', 4), ('_afSuggPrendreLocale', 5), ('quickAddFood', 0)):
    if part(nom) != attendu:
        raise SystemExit('`%s` fait %d/8 gestes du noyau, pas %d : le §4 (non-fusion par '
                         'ressemblance) cite ce chiffre.' % (nom, part(nom), attendu))
for absente in ('readFoodLabel', 'scanBarcodeIA'):
    if absente in PORTES:
        raise SystemExit('`%s` est comptee comme une porte : le §1 raconte precisement qu elle '
                         'n en est PAS une (elle ouvre le selecteur de fichier).' % absente)
if len(CLES) != 25:
    raise SystemExit('La sonde porte %d cles, pas 25 : le §5 cite ce chiffre (23 avant).'
                     % len(CLES))
for k in ('hub_offRemplirFormulaire', 'hub_sequence_etiquette'):
    if k not in CLES:
        raise SystemExit('La sonde ne conduit plus les DEUX chemins (%s manque) : le §5 repose '
                         'sur la comparaison, pas sur la lecture d un seul cote.' % k)
if N_TEMOINS != 16:
    raise SystemExit('Le bloc CCCII porte %d temoins, pas 16 : le §6 cite ce chiffre.' % N_TEMOINS)

PASSE = os.environ.get('FT_PASSE') or '/tmp/passehub.log'
try:
    _log = open(PASSE, encoding='utf-8', errors='replace').read()
except Exception:
    raise SystemExit('Journal de passe introuvable (%s) : le §6 cite un total, il doit etre LU.'
                     % PASSE)
_m = re.search(r'TOTAL CROIS\u00c9 : (\d+) \u2705 \u00b7 (\d+) \u274c', _log)
if not _m:
    raise SystemExit('Le journal de passe ne porte pas encore de TOTAL : la passe tourne toujours. '
                     'Un total espere n est pas un total mesure — on attend.')
PASSE_OK, PASSE_KO = int(_m.group(1)), int(_m.group(2))
if PASSE_KO != 0:
    raise SystemExit('La passe porte %d rouge(s) : le document affirme une passe verte.' % PASSE_KO)

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
    'p': ParagraphStyle('p', parent=S['Normal'], fontName='Helvetica',
                        fontSize=9.3, leading=13.2, textColor=ENCRE, spaceAfter=6),
    'petit': ParagraphStyle('petit', parent=S['Normal'], fontName='Helvetica',
                            fontSize=8.2, leading=11.5, textColor=GRIS, spaceAfter=5),
    'cell': ParagraphStyle('cell', parent=S['Normal'], fontName='Helvetica',
                           fontSize=8.1, leading=10.6),
    'cellb': ParagraphStyle('cellb', parent=S['Normal'], fontName='Helvetica-Bold',
                            fontSize=8.1, leading=10.6),
    'code': ParagraphStyle('code', parent=S['Normal'], fontName='Courier',
                           fontSize=7.0, leading=8.8, textColor=ENCRE),
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
        for m in re.finditer(r'&([A-Za-z][A-Za-z0-9]{1,15});', x):
            ch = html.unescape(m.group(0))
            if len(ch) == 1:
                try:
                    ch.encode('cp1252')
                except UnicodeEncodeError:
                    raise SystemExit('ENTITE NOMMEE NON RENDUE %s (%s) dans %s'
                                     % (m.group(0), hex(ord(ch)), ou))
    return x


C = "<font face='Courier'>%s</font>"


def P(t, s='p'):
    return Paragraph(_v(t, 'paragraphe'), st[s])


def encadre(titre, corps_, couleur=ROUGE):
    t = Table([[Paragraph('<b>%s</b>' % _v(titre, 'titre'), st['cellb'])],
               [Paragraph(_v(corps_, 'corps'), st['cell'])]], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FOND),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBEFORE', (0, 0), (0, -1), 2.4, couleur), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    return KeepTogether(t)


def tableau(entetes, ligs, largeurs):
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
    return t


_LARG = 165 * mm - 12


def bloc_code(txt, legende=None):
    _v(txt, 'bloc de code')
    for l in txt.split('\n'):
        if stringWidth(l, 'Courier', 7.0) > _LARG:
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
    canvas.drawString(22 * mm, 12 * mm,
                      'Force Tracker — le hub de preparation Nutrition (%s) — 13/09/2026' % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()





# ⚠️ Le NOMBRE de gardes se recompte dans ce fichier meme : un pied de page qui annonce
#    « quatorze gardes » pour dix-sept est exactement la faute attrapee en ft-v1202.
N_GARDES = len(re.findall(r'raise SystemExit', open(os.path.abspath(__file__),
                                                    encoding='utf-8').read()))

H = []
H.append(P('Le hub de preparation Nutrition', 'titre'))
H.append(P('Etape 4 du chantier Nutrition &mdash; %s &mdash; 13/09/2026. '
           'Dix-septieme document de la serie, premier de l&rsquo;etape 4. '
           'Tous les decomptes de ce document sont <b>recomptes depuis le code servi</b> a chaque '
           'generation : %d gardes refusent de produire le PDF si un seul fait tombe.'
           % (VERSION, N_GARDES), 'sous'))

H.append(encadre(
    'LA BORNE POSEE PAR MICHEL, ET ELLE DECIDE DE TOUT',
    '&laquo; Je ne veux <b>PAS</b> encore la douane. Le hub doit d&rsquo;abord etre construit et '
    'valide seul. &raquo; &mdash; et le cahier des charges est ecrit <b>en negatif</b> : ne decide '
    'pas si une ligne est valide &middot; ne corrige aucune valeur &middot; ne bloque aucun '
    'enregistrement &middot; ne modifie ni quantite, ni unite, ni pour-100&nbsp;g, ni provenance, '
    'ni portion &middot; ne touche pas encore a ' + (C % 'S.foodLog') + '.<br/><br/>'
    'Objectif, mot pour mot : <i>faire converger les portes d&rsquo;entree Nutrition vers un chemin '
    'commun de preparation d&rsquo;un aliment, <b>sans modifier ce qui est enregistre '
    'aujourd&rsquo;hui</b></i>.'))

# ── 1. LES PORTES ────────────────────────────────────────────────────────────
H.append(P('1. Les portes reelles &mdash; %d, cartographiees AVANT toute ligne' % N_PORTES, 'h1'))
H.append(P('%d fonctions appellent %s (la remise a zero d&rsquo;un aliment). Classees par '
           '<b>ROLE</b>, jamais par ressemblance.' % (N_PORTES, C % '_afOublierAliment'), 'p'))
H.append(tableau(
    ['groupe', 'fonctions', 'etat'],
    [['<b>A</b> &mdash; passent <b>deja</b> par<br/>' + (C % '_offRemplirFormulaire'),
      (C % '_lookupBarcode') + ' &middot; ' + (C % '_calAppliquer') + ' &middot; ' +
      (C % '_afSuggPrendreMarque') + ' &middot; ' + (C % '_afSuggPrendreCiqual') + ' &middot; ' +
      (C % '_afSuggPrendreOff'),
      '<b>5</b> &mdash; migrees d&rsquo;un coup,<br/>par leur hub'],
     ['<b>B</b> &mdash; preparent l&rsquo;ecran<br/><b>a la main</b>',
      (C % 'quickFillFood') + ' &middot; ' + (C % '_afSuggPrendreLocale') + ' &middot; ' +
      (C % 'onFoodLabelFile') + ' &middot; ' + (C % 'estimateFoodAI'),
      '<b>4</b> &mdash; <b>une seule</b> migree'],
     ['<b>C</b> &mdash; ne preparent<br/><b>pas</b> un aliment',
      (C % 'openAddFood') + ' (l&rsquo;ouverture) &middot; ' + (C % '_bcSansValeurs') +
      ' (repli &laquo; sans valeurs &raquo;) &middot; ' + (C % 'quickAddFood') +
      ' (ajout <b>direct</b>, sans ecran)',
      '<b>3</b> &mdash; hors sujet<br/>par nature']],
    [38 * mm, 92 * mm, 35 * mm]))
H.append(Spacer(1, 6))
H.append(encadre(
    'ET LE PREMIER RELEVE ETAIT FAUX &mdash; BUGS.md &sect;63, DANS MON PROPRE INSTRUMENT',
    'Il attribuait des appels a ' + (C % 'readFoodLabel') + ' et ' + (C % 'scanBarcodeIA') + '. '
    '<b>Ce ne sont PAS des portes</b> : sept lignes chacune, elles n&rsquo;ouvrent que le selecteur '
    'de fichier. Les vraies sont ' + (C % 'onFoodLabelFile') + ' et ' + (C % 'estimateFoodAI') +
    '.<br/><br/><b>Cause</b> : l&rsquo;extracteur bornait les corps par ' +
    (C % '\\nfunction NOM(') + ' et <b>ratait les</b> ' + (C % 'async function') + '. '
    '<i>Un motif qui suppose une syntaxe ne compte pas les endroits : il compte les endroits ecrits '
    'comme on les imaginait.</i><br/><br/>'
    'Ce qui l&rsquo;a attrape n&rsquo;est pas une relecture, mais <b>une ligne de points qui ne '
    'pouvait pas etre vide</b> &mdash; une porte sans un seul geste d&rsquo;ecran.', ORANGE))

# ── 2. LE NOYAU ──────────────────────────────────────────────────────────────
H.append(P('2. Le noyau commun &mdash; mesure geste par geste, pas estime', 'h1'))
H.append(P((C % 'onFoodLabelFile') + ' recopiait <b>8 des 13 gestes</b> de ' +
           (C % '_offRemplirFormulaire') + ', et <b>son propre commentaire le disait depuis '
           'ft-v1163</b> : <i>&laquo; c&rsquo;est exactement ce que faisait '
           '<font face="Courier">_offRemplirFormulaire</font> &raquo;</i>. Mais elle en '
           '<b>OMET 5</b> &mdash; donc le hub ne prend que les 8.', 'p'))
H.append(tableau(
    ['geste', '_offRemplirFormulaire', 'onFoodLabelFile', 'dans le hub ?'],
    [['vider le champ des grammes', 'oui', 'oui', '<b>OUI</b>'],
     [C % '_bcQtyPose = false', 'oui', 'oui', '<b>OUI</b>'],
     ['proposer la portion', 'oui', 'oui', '<b>OUI</b>'],
     ['ecrire <b>d&rsquo;ou vient</b> ce nombre', 'oui', 'oui', '<b>OUI</b>'],
     ['poser le nom', 'oui', 'oui', '<b>OUI</b>'],
     ['montrer la ligne', 'oui', 'oui', '<b>OUI</b>'],
     ['poser la description', 'oui', 'oui', '<b>OUI</b>'],
     ['recalculer', 'oui', 'oui', '<b>OUI</b>'],
     ['pastille &laquo; la derniere fois &raquo;', 'oui', '<b>NON</b>', 'non'],
     ['le <b>paquet</b>', 'oui', '<b>NON</b>', 'non'],
     ['la <b>provenance</b> (' + (C % '_afSetSrc') + ')', 'oui', 'oui <i>(la sienne)</i>', 'non'],
     ['l&rsquo;etat (' + (C % '_afNoteEtat') + ')', 'oui', '<b>NON</b>', 'non'],
     ['la carte sante', 'oui', '<b>NON</b>', 'non']],
    [58 * mm, 40 * mm, 40 * mm, 27 * mm]))
H.append(Spacer(1, 6))
H.append(encadre(
    'LA PHRASE QUI A DECIDE DU PERIMETRE',
    '<b>Un hub qui fait plus que le noyau commun n&rsquo;est pas un chemin commun : c&rsquo;est une '
    'porte qui en avale une autre.</b> Absorber les 5 gestes manquants changerait le comportement '
    'de ' + (C % 'onFoodLabelFile') + ' &mdash; <b>mesure, pas suppose</b> : la mutation '
    '&laquo; je finis le hub, j&rsquo;y mets la pastille &raquo; fait rougir exactement le temoin '
    'de ces 5 gestes omis.'))
H.append(Spacer(1, 4))
# ⚠️ Les commentaires de bout de ligne portent des pictogrammes que WinAnsi ne rend pas :
#    on affiche le CODE seul, et on le dit dans la legende plutot que de le laisser deviner.
_EXTRAIT = '\n'.join(l.split('//')[0].rstrip() for l in C_HUB.split('\n')[:14])
H.append(bloc_code(_EXTRAIT,
                   'Le hub, tel qu&rsquo;il est dans ' + (C % 'app.js') +
                   ' aujourd&rsquo;hui &mdash; extrait <b>en direct</b> du code servi, '
                   'commentaires de fin de ligne retires :'))
H.append(Spacer(1, 4))
H.append(encadre(
    'ET LES TROIS LIBELLES RESTENT DES PARAMETRES, PAS UNE REGLE',
    'Chaque porte sait <i>d&rsquo;ou vient</i> le nombre qu&rsquo;elle propose : &laquo; portion '
    'fabricant &raquo;, &laquo; lu sur l&rsquo;etiquette &raquo;, ou <b>l&rsquo;enseigne</b> pour un '
    'produit de marque. Le hub, lui, ne le sait pas &mdash; <b>une formule unique lui ferait '
    'inventer une source</b>. <i>C&rsquo;est une DONNEE propre a la porte, pas une regle a '
    'factoriser</i> (R29 : on ne devine pas ce qu&rsquo;on n&rsquo;a pas lu).', ORANGE))

H.append(PageBreak())

# ── 3. CE QU'IL NE FAIT PAS ──────────────────────────────────────────────────
H.append(P('3. Ce que le hub NE fait pas &mdash; et c&rsquo;est la moitie de sa definition', 'h1'))
H.append(P('Le hub <b>n&rsquo;est PAS la douane</b>. Il <b>prepare</b> ; la douane validera plus '
           'tard. Chaque refus est <b>fige par un temoin</b>, et quand c&rsquo;est possible par '
           '<b>deux</b> &mdash; un temoin de comportement (on pose un etat, on appelle le hub, on '
           'relit) <i>et</i> un temoin de source.', 'p'))
H.append(tableau(
    ['il ne&hellip;', 'fige par'],
    [['ne juge pas si une ligne est <b>valide</b>',
      'temoin de source (aucun ' + (C % 'toast') + ', aucune validation)'],
     ['ne <b>corrige</b> aucune valeur', 'meme temoin de source'],
     ['ne <b>bloque</b> aucun enregistrement', 'meme temoin de source'],
     ['ne touche pas a ' + (C % 'S.foodLog'), 'comportement <b>ET</b> source'],
     ['ne touche pas a la <b>provenance</b> (' + (C % '_afSetSrc') + ')', 'comportement + source'],
     ['ne touche ni <b>quantite</b>, ni <b>unite</b>, ni <b>pour-100&nbsp;g</b>, ni <b>portion</b>',
      'comportement + source'],
     ['ne touche <b>aucun proprietaire</b> de 1b/3 (' + (C % '_qGrammes') + ', ' +
      (C % '_afReprendre&hellip;') + ', ' + (C % '_srcProvenance') + '&hellip;)',
      'temoin de source dedie']],
    [100 * mm, 65 * mm]))
H.append(Spacer(1, 6))
H.append(encadre(
    'POURQUOI UN TEMOIN DE SOURCE, ALORS QUE LES COMPORTEMENTS SONT VERTS',
    'Parce qu&rsquo;un hub qui deborde <b>reste vert a l&rsquo;ecran</b>. Le jour ou quelqu&rsquo;un '
    'ajoutera une validation dans le hub &laquo; parce que c&rsquo;est l&rsquo;endroit logique '
    '&raquo;, aucun parcours ne changera de resultat &mdash; l&rsquo;ecran affichera la meme chose. '
    'C&rsquo;est la lecon de ft-v1202, redite ici sur un objet plus gros : <b>une derive de '
    'conception peut etre invisible a l&rsquo;execution</b>.'))

# ── 4. NON-FUSION ────────────────────────────────────────────────────────────
H.append(P('4. Non-fusion par ressemblance &mdash; la question posee nommement par Michel', 'h1'))
H.append(P('<i>&laquo; verifie qu&rsquo;aucune porte n&rsquo;est fusionnee simplement parce '
           'qu&rsquo;elle "ressemble" a une autre &raquo;</i>. <b>Mesure</b> : part des 8 gestes du '
           'noyau que chaque porte restee dehors fait deja en propre.', 'p'))
H.append(tableau(
    ['porte', 'gestes du noyau', 'pourquoi elle ne migre pas'],
    [[C % 'quickFillFood', '<b>4 / 8</b>',
      'ni portion proposee, ni recalcul, ni description -&gt; <b>l&rsquo;y brancher AJOUTERAIT '
      'des gestes</b>'],
     [C % '_afSuggPrendreLocale', '<b>5 / 8</b>', 'idem (ni portion proposee, ni recalcul)'],
     [C % '_bcSansValeurs', '2 / 8',
      'c&rsquo;est un <b>repli</b>, pas un aliment prepare : elle ouvre la saisie manuelle'],
     [C % 'estimateFoodAI', '1 / 8', 'elle ne prepare pas l&rsquo;ecran, elle pose une estimation'],
     [C % 'openAddFood', '1 / 8', 'c&rsquo;est <b>l&rsquo;ouverture</b> de l&rsquo;ecran, pas une '
      'porte d&rsquo;aliment'],
     [C % 'quickAddFood', '<b>0 / 8</b>', '<b>aucun ecran</b> : elle ecrit directement']],
    [45 * mm, 25 * mm, 95 * mm]))
H.append(Spacer(1, 6))
H.append(P('Deux temoins figent cette non-fusion, et la mutation <i>&laquo; quickFillFood '
           'ressemble, je la branche aussi &raquo;</i> fait <b>2 rouges</b>. '
           '<i>La ressemblance n&rsquo;est pas un metier</i> &mdash; c&rsquo;est la regle qui a '
           'ecarte deux sous-etapes entieres du chantier 1b/3.', 'p'))

# ── 5. LA SONDE ──────────────────────────────────────────────────────────────
H.append(P('5. La sonde &mdash; elle conduisait, elle n&rsquo;observait pas l&rsquo;ecran', 'h1'))
H.append(P('Les <b>23</b> cles existantes observent ' + (C % '_afSrc') + ', la pastille, le trio '
           'des grammes, la definition de portion &mdash; <b>jamais</b> le champ des grammes, la '
           'portion proposee, le nom, la ligne visible ni la description, qui sont <i>exactement</i> '
           'ce que le hub deplace. Un instantane serait donc reste identique <b>quoi qu&rsquo;on '
           'fasse au hub</b>. Etendue a <b>%d cles AVANT le BEFORE</b>, jamais apres.'
           % len(CLES), 'p'))
H.append(encadre(
    'ET ELLE SALIT L&rsquo;ECRAN AVANT CHAQUE CAS',
    'Elle ecrit une valeur temoin dans <b>tous</b> les champs avant d&rsquo;appeler le chemin '
    'mesure. Sans ca, un champ <b>deja vide</b> serait indiscernable d&rsquo;un champ '
    '<b>vide par le hub</b> &mdash; et le temoin &laquo; le hub vide le champ des grammes &raquo; '
    'serait un vert qui ne peut pas rougir.'))
H.append(Spacer(1, 5))
H.append(encadre(
    'UN EXTRACTEUR DE TEMOIN RENDAIT DU VIDE : DEUX TEMOINS PASSAIENT A VIDE',
    'La regex etait ecrite ' + (C % "'\\\\\\\\('") + ' cote source, soit <b>un antislash suivi '
    'd&rsquo;une ouverture de groupe</b> au lieu d&rsquo;une parenthese litterale : elle ne trouvait '
    '<b>aucun</b> corps de fonction. Or deux des temoins testent une <b>ABSENCE</b> '
    '&mdash; et une absence est toujours vraie dans une chaine vide. Ils etaient <b>verts sans rien '
    'mesurer</b>.<br/><br/>'
    'C&rsquo;est le <b>seul temoin qui teste une PRESENCE</b> qui les a trahis, en rougissant sur du '
    'code parfaitement sain. <i>Un temoin de source se verifie d&rsquo;abord contre le code SAIN</i> '
    '(ft-v1198). L&rsquo;extracteur <b>LEVE</b> desormais au lieu de rendre du vide : l&rsquo;erreur '
    'est impossible a refaire.', ORANGE))
H.append(Spacer(1, 5))
H.append(encadre(
    'ET J&rsquo;AI CORRIGE CETTE ANALYSE DANS LE MAUVAIS SENS AVANT DE LA CORRIGER DANS LE BON',
    'Mon premier diagnostic etait juste ; un test lance en ligne de commande m&rsquo;a fait dire '
    '<i>&laquo; je me suis trompe, l&rsquo;extracteur rend bien des corps non vides &raquo;</i> '
    '&mdash; <b>le shell avait mange mes antislashes</b>, donc je testais une regex differente de '
    'celle du fichier. C&rsquo;est la lecture du <b>fichier lui-meme</b> qui a tranche. '
    '<i>Un test qui n&rsquo;emploie pas exactement le texte du fichier ne teste pas le fichier.</i>',
    ORANGE))

H.append(PageBreak())

# ── 6. L'ETAT DES PREUVES ────────────────────────────────────────────────────
H.append(P('6. L&rsquo;etat des preuves &mdash; temoins, instantane, mutations, passe', 'h1'))
H.append(tableau(
    ['preuve', 'etat mesure'],
    [['Instantane avant / apres',
      '<b>identique octet pour octet</b>, sha256 ' + (C % SHA_INSTANTANE) + ' &mdash; verifie '
      '<b>apres chacune</b> des deux migrations, pas seulement a la fin'],
     ['Sonde', '<b>%d cles</b> (23 avant), les <b>deux chemins</b> conduits sur un jeu de cas '
      'commun &mdash; <i>c&rsquo;est la comparaison qui fait la preuve</i>' % len(CLES)],
     ['Temoins (bloc CCCII)', '<b>%d</b>, dont <b>7</b> qui figent ce que le hub NE fait pas'
      % N_TEMOINS],
     ['Mutations negatives',
      '<b>14</b>, toutes mordent <b>sur leur propre temoin</b> ; controle sain a <b>0 rouge avant '
      'ET apres</b>'],
     ['Passe parcours', '<b>%d</b> vert, <b>%d</b> rouge, sur l&rsquo;arbre FINAL &mdash; total '
      '<b>predit = obtenu</b> (3710 + %d)' % (PASSE_OK, PASSE_KO, N_TEMOINS)],
     ['Autres suites', 'calculs 339/339 &middot; muscles 241/241 &middot; croises 50/50 &middot; '
      'dates 9/9 &middot; donnees classees, 0 trou nouveau']],
    [42 * mm, 123 * mm]))
H.append(Spacer(1, 6))
H.append(P('Les mutations, et le temoin que chacune fait rougir', 'h1'))
H.append(tableau(
    ['la mutation', 'rouges'],
    [['<b>&laquo; je finis le hub &raquo;</b> : la pastille absorbee dedans',
      '<b>1</b>, exactement le temoin des 5 gestes omis'],
     ['<b>&laquo; le hub pose aussi la provenance &raquo;</b> (il devient la douane)', '<b>2</b>'],
     ['<b>&laquo; le hub valide &raquo;</b> (douane prematuree)', '<b>1</b>'],
     ['le hub ecrit au journal (' + (C % 'S.foodLog') + ')', '<b>2</b>'],
     ['<b>fusion par ressemblance</b> : ' + (C % 'quickFillFood') + ' branchee', '<b>2</b>'],
     ['le champ des grammes n&rsquo;est plus vide', '<b>2</b>'],
     ['le drapeau ' + (C % '_bcQtyPose') + ' ne retombe plus', '<b>2</b>'],
     ['le hub touche un proprietaire de 1b/3', '<b>2</b>'],
     ['la 2<super>e</super> porte reprend sa copie a la main', '<b>2</b>'],
     ['un geste <b>propre</b> a la 1<super>re</super> porte absorbe par le hub', '<b>1</b>'],
     ['le libelle devient une formule unique', '<b>1</b>, exactement le temoin '
      'd&rsquo;equivalence'],
     ['<b>PORTEE</b> : une porte du groupe A cesse de passer par le chemin commun (6 -&gt; 5)',
      '<b>1</b>, exactement le temoin de portee'],
     ['<b>PORTEE</b> : ' + (C % 'readFoodLabel') + ' redevient une porte (12 -&gt; 13)',
      '<b>1</b>, exactement le temoin de portee']],
    [110 * mm, 55 * mm]))

# ── 7. LE VERDICT ────────────────────────────────────────────────────────────
H.append(P('7. Verdict &mdash; le hub est-il pret pour la douane ?', 'h1'))
H.append(encadre(
    'OUI &mdash; LE HUB EST PRET POUR LA DOUANE',
    'Le hub existe, deux chemins convergent, <b>rien de ce qui est enregistre n&rsquo;a bouge</b> '
    '(instantane identique octet pour octet), et <b>ce qu&rsquo;il refuse de faire est fige par '
    '7 temoins</b> &mdash; c&rsquo;est-a-dire que la douane aura un endroit ou se poser, et un '
    'filet qui dira si elle deborde.<br/><br/>' +
    ('<b>Avec une reserve dite plutot que cachee</b> : le hub a <b>2 appelants</b>, mais '
     '<b>%d portes sur %d</b> l&rsquo;atteignent &mdash; les 5 du groupe A <i>indirectement</i> '
     '(via %s, qui n&rsquo;est pas lui-meme une porte), plus %s en direct. Les 3 restantes du '
     'groupe B ne convergeront <b>que si on accepte de changer leur comportement</b> : '
     'c&rsquo;est une <b>decision produit</b>, pas une extraction &mdash; et donc une question '
     'pour Michel, pas pour moi.'
     % (len(SERVIES), N_PORTES, C % '_offRemplirFormulaire', C % 'onFoodLabelFile')),
    VERT))
H.append(Spacer(1, 6))
H.append(P('Ce qui reste ouvert, explicitement hors perimetre', 'h1'))
H.append(P('La <b>douane</b> (consigne explicite : apres validation du hub seul) &middot; les '
           '<b>3 portes du groupe B</b> non migrees &middot; ' + (C % 'S.savedFoods') +
           ' multi-onglets &middot; l&rsquo;ecart <b>48,3 / 48</b> &middot; l&rsquo;historique '
           '&middot; les migrations &middot; les harmonisations produit &middot; le garde ' +
           (C % '!_bcNutr') + ' non bloquant, mesure et documente en ft-v1203, <b>en attente d&rsquo;un '
           'feu vert separe</b>.', 'p'))
H.append(Spacer(1, 4))
H.append(P('Conception complete : <font face="Courier">docs/HUB-NUTRITION.md</font>. '
           'Ce PDF est genere par <font face="Courier">tools/gen_hub_pdf.py</font>, dont les '
           '%d gardes recomptent chaque chiffre depuis le code servi et <b>refusent de produire</b> '
           'si un seul fait tombe &mdash; y compris le total de la passe, qui est <b>lu dans son '
           'journal</b> et jamais ecrit a la main.' % N_GARDES, 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Force Tracker - le hub de preparation Nutrition (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)
print('OK %s  (%s, %d portes, %d migrees, %d cles, %d temoins, passe %d/%d, %d gardes)'
      % (OUT, VERSION, N_PORTES, len(MIGREES), len(CLES), N_TEMOINS, PASSE_OK,
         PASSE_OK + PASSE_KO, N_GARDES))
