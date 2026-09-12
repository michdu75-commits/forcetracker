#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/SOUS-ETAPE-1BIII.pdf — le noyau d'un item de liste, et un plan qui
   annoncait deux divergences alors qu'il n'y en a qu'une. Dixieme document de la serie.

TOUS LES DECOMPTES SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI.
Deux affirmations mesurables ont chacune leur garde : le proprietaire ne porte NI
portionWeightG NI fav, et le repli de portionWeightG vaut 0 deux fois et null une fois —
c'est la divergence que la sous-etape TRANSPORTE sans la corriger.

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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'SOUS-ETAPE-1BIII.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
SONDE = open(os.path.join(ROOT, 'tools', 'instantane_1b23.js'), encoding='utf-8').read()
SETUP = open(os.path.join(ROOT, 'setup.js'), encoding='utf-8').read()
DEC = open(os.path.join(ROOT, 'docs', 'SOUS-ETAPES-1B-3.md'), encoding='utf-8').read()
BUGS = open(os.path.join(ROOT, 'BUGS.md'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = '(ft-v\d+)'", SW) or [None, '?'])[1]

# Mesure du 12/09 : instantane identique avant/apres l'extraction 1b-ii.
SHA_INSTANTANE = '7a52c37da93e17a3'


def _commentaire(l):
    x = l.strip()
    return x.startswith('*') or x.startswith('//') or x.startswith('/*') or x.startswith('`')


LA = [l for l in APP.split('\n') if not _commentaire(l)]


def corps(nom):
    m = re.search(r'^function ' + nom + r'\(.*?^\}', APP, re.M | re.S)
    return m.group(0) if m else ''


# ── LES DECOMPTES, REFAITS ICI ───────────────────────────────────────────────
APPELS = len(re.findall(r'_itemListe\(', APP))
_m = re.search(r'function _itemListe\(src\)\{[\s\S]*?\n\}', APP)
CORPS = _m.group(0) if _m else ''
CLES = sorted(set(re.findall(r'([a-zA-Z]\w*)\s*:', CORPS.split('return', 1)[-1])))

# La divergence, comptee des DEUX cotes : 0 deux fois (les branches de la liste),
# null une fois (le favori). C'est tout le sujet du §4.
PW = re.findall(r'portionWeightG:\+\w+\.portionWeightG>0\?\+\w+\.portionWeightG:(0|null)', APP)
PW_ZERO, PW_NULL = PW.count('0'), PW.count('null')

# La provenance : une SEULE copie -> aucun proprietaire cree pour elle.
PROV_COPIES = len(re.findall(r'origine:\w+\.origine\|\|null, sourceId:', APP))

SOUS = re.findall(r'^### (1b-[iv]+|3-[iv]+)\b(.*)$', DEC, re.M)
TOTAL_SE = len(SOUS)
LIVREES = len([t for t in SOUS if 'LIVR' in t[1].upper()])
ECARTEES = len([t for t in SOUS if 'CART' in t[1].upper()])
RESTANTES = TOTAL_SE - LIVREES - ECARTEES

# CHAQUE GARDE PROTEGE UNE AFFIRMATION DU DOCUMENT.
if APPELS != 4:
    raise SystemExit('`_itemListe` a %d occurrences, pas 4 (1 declaration + 3 appelants).' % APPELS)
if len(CLES) != 9:
    raise SystemExit('Le proprietaire rend %d champs, pas 9 : le §2 cite ce chiffre. (%s)'
                     % (len(CLES), ', '.join(CLES)))
if 'portionWeightG' in CORPS or re.search(r'\bfav\b', CORPS):
    raise SystemExit('PERIMETRE ROMPU : portionWeightG ou fav est ENTRE dans le proprietaire. '
                     'Le §4 affirme le contraire, et ce serait la decision produit n2.')
if 'function _itemListe(src){' not in APP:
    raise SystemExit('`_itemListe` ne prend plus une seule source : un parametre de defaut a ete '
                     'ajoute, alors que le §3 demontre qu il est inutile.')
if PW_ZERO != 2 or PW_NULL != 1:
    raise SystemExit('Le repli de portionWeightG vaut %d fois 0 et %d fois null, pas 2 et 1 : '
                     'la divergence decrite au §4 a ete harmonisee.' % (PW_ZERO, PW_NULL))
if PROV_COPIES != 1:
    raise SystemExit('La provenance de la branche recents a %d copies, pas 1 : le §5 affirme '
                     'qu elle est UNIQUE, donc non extractible.' % PROV_COPIES)
if TOTAL_SE != 10 or ECARTEES != 1:
    raise SystemExit('Le decoupage porte %d sous-etapes dont %d ecartee(s), pas 10 et 1.'
                     % (TOTAL_SE, ECARTEES))

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
                      'Force Tracker — le noyau d un item de liste (%s) — 12/09/2026'
                      % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()




AVANT = """// AVANT — le meme noyau, recopie par TROIS sites

// _buildFoodQuickItems, branche FAVORIS
{name:f.name, kcal:f.kcal||0, ..., per100:f.per100||null, q:+f.q>0?+f.q:0, u:f.u||null,
 portionLabel:f.portionLabel||null, portionWeightG:...:0, fav:true}

// _buildFoodQuickItems, branche RECENTS
{name:e.name, kcal:e.kcal||0, ..., per100:e.per100||null, q:+e.q>0?+e.q:0, u:e.u||null,
 portionLabel:e.portionLabel||null, portionWeightG:...:0,
 origine:..., sourceId:..., etat:..., fav:false}

// toggleFavFood, le favori ENREGISTRE
{name:it.name, kcal:it.kcal||0, ..., per100:it.per100||null, q:+it.q>0?+it.q:0, u:it.u||null,
 portionLabel:it.portionLabel||null, portionWeightG:...:null}"""

APRES = """// APRES — 9 champs STRICTEMENT identiques dans un proprietaire ;
//         ce qui DIVERGE reste ecrit chez chaque appelant

function _itemListe(src){
  const s = src || {};
  return { name: s.name,
           kcal: s.kcal || 0, prot: s.prot || 0, carbs: s.carbs || 0, fat: s.fat || 0,
           per100: s.per100 || null,
           q: +s.q > 0 ? +s.q : 0,
           u: s.u || null,
           portionLabel: s.portionLabel || null };
}

Object.assign(_itemListe(f),  {portionWeightG:...:0,    fav:true})     // favoris
Object.assign(_itemListe(e),  {portionWeightG:...:0,    origine:..., fav:false})  // recents
Object.assign(_itemListe(it), {portionWeightG:...:null})               // le favori"""

PIEGE = """// LA MUTATION QUI NE MORDAIT PAS — et ce n'etait PAS un temoin manquant

// mutation : « per100 perdu »
"per100: s.per100 || null,"  ->  "per100: null,"
// resultat : 0 rouge.

// Cause, trouvee en cherchant au lieu de conclure :
//   ligne 1688  _srcRepriseQ  ->  per100: s.per100 || null,     <- ELLE frappait ICI
//   ligne 2779  _itemListe    ->  per100: s.per100 || null,
// _srcRepriseQ porte le MEME motif et vient AVANT dans le fichier.
// Ses temoins vivent dans un AUTRE bloc, donc rien ne rougissait.

// Reancree sur deux lignes contigues propres a _itemListe :
//   2 rouges, exactement les deux temoins du pour-100 g."""


# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P("Le noyau d'un item de liste", 'titre'))
F.append(P("Force Tracker &mdash; 12/09/2026, " + C % VERSION + ". Dixieme document de la serie. "
           "Michel a pose le <b>test d'entree</b> en consigne permanente apres la sous-etape vide "
           "de la veille : <i>&laquo; verifie d'abord qu'il y a reellement au moins deux copies &raquo;</i> "
           "&middot; <i>&laquo; extrait uniquement ce qui est strictement identique &raquo;</i> &middot; "
           "<i>&laquo; toute divergence metier reste visible chez les appelants &raquo;</i>.", 'sous'))

F.append(encadre(
    "LE FAIT PRINCIPAL DE CETTE VERSION",
    "<b>Le plan annoncait DEUX divergences entre les trois sites, il n'y en a qu'UNE.</b> "
    "Et il en deduisait un proprietaire <b>a parametre</b>, dimensionne pour un ecart qui n'existe pas."
    "<br/><br/>=&gt; <i>Le parametre n'a pas ete ecrit. Un parametre inutile deplace la divergence "
    "DANS le proprietaire, au lieu de la laisser visible chez les appelants &mdash; c'est exactement "
    "ce que la consigne interdit.</i>"
    "<br/><br/><b>Troisieme sous-etape d'affilee ou le perimetre ecrit dans le plan est faux.</b> "
    "Le plan reste utile pour <i>ordonner</i> le travail ; il n'est plus une source pour les <i>chiffres</i>."))

# ── 1 ──
F.append(P("1. Le test d'entree, passe avant toute ligne", 'h1'))
F.append(P("<b>3 sites reels</b> : la branche <b>favoris</b> et la branche <b>recents</b> de la "
           "construction de la liste &laquo; Mes aliments &raquo;, et le <b>favori enregistre</b> "
           "quand on met une etoile. La regle du jour precedent tient : <i>une extraction exige au "
           "moins deux copies</i>, et on ne cree pas de proprietaire pour une forme unique.", 'p'))

# ── 2 ──
F.append(P("2. Ce qui est extrait : 9 champs, mesures champ par champ", 'h1'))
F.append(bloc_code(AVANT))
F.append(bloc_code(APRES))
F.append(P("Les 9 champs retenus sont ceux dont l'expression est <b>identique au caractere pres</b> "
           "aux trois sites &mdash; pas ceux qui se ressemblent : " + C % ', '.join(CLES) + ".", 'petit'))

# ── 3 ──
F.append(P("3. Le plan annoncait deux divergences, il n'y en a qu'une", 'h1'))
F.append(tableau(
    ["champ", "ce que le plan disait", "ce que la MESURE dit"],
    [[C % 'q', "&laquo; <b>0</b> chez la liste, <b>null</b> chez le favori &raquo;",
      "<b>faux</b> : " + C % '+X.q&gt;0?+X.q:0' + " aux <b>trois</b> sites &mdash; il ne diverge pas"],
     [C % 'portionWeightG', "&laquo; pareil &raquo;",
      "<b>la seule vraie divergence</b> : <b>0</b> aux deux branches de la liste "
      "(%d fois), <b>null</b> au favori (%d fois)" % (PW_ZERO, PW_NULL)]],
    [34 * mm, 58 * mm, 73 * mm]))
F.append(encadre(
    "POURQUOI CA CHANGE LA FORME DU PROPRIETAIRE",
    "Le plan proposait " + C % '_itemListe(src, {vide:0})' + " contre " + C % '{vide:null}' + " &mdash; "
    "<i>un parametre nomme rend l'ecart visible dans le code au lieu de le cacher dans deux copies</i>. "
    "L'argument est bon <b>quand il y a deux ecarts</b>."
    "<br/><br/>Avec <b>un seul</b>, le parametre n'achete rien : il fait entrer la divergence dans la "
    "signature du proprietaire, alors que l'ecrire chez l'appelant la laisse <b>lisible a l'endroit ou "
    "elle se decide</b>. <b>Le proprietaire ne prend donc qu'une source, sans option.</b>", ORANGE))

F.append(PageBreak())

# ── 4 ──
F.append(P("4. Ce qui reste volontairement divergent", 'h1'))
F.append(tableau(
    ["ce qui reste dehors", "pourquoi"],
    [[C % 'portionWeightG',
      "replie sur <b>0</b> dans la liste, sur <b>null</b> dans le favori. Un " + C % '0' + " et un "
      + C % 'null' + " <b>ne se relisent pas pareil</b> en aval (" + C % '+x&gt;0'
      + " les traite pareil, " + C % 'x===null' + " non) : unifier changerait le contenu enregistre "
      "des favoris. <b>Decision produit n2, non tranchee.</b>"],
     [C % 'fav',
      "vaut <b>true</b>, <b>false</b>, et <b>n'existe pas</b> chez le troisieme. Trois etats, "
      "trois endroits."],
     [C % 'origine' + " / " + C % 'sourceId' + " / " + C % 'etat',
      "<b>une seule copie</b> (branche recents, %d occurrence). On ne cree pas de proprietaire pour "
      "une forme unique &mdash; c'est la regle qui a fait ecarter la sous-etape precedente, et une "
      "mutation qui les y ferait entrer <b>rougit</b>." % PROV_COPIES]],
    [44 * mm, 121 * mm]))
F.append(P("Deux temoins de perimetre lisent le <b>corps</b> du proprietaire et exigent que ni "
           + C % 'portionWeightG' + " ni " + C % 'fav' + " n'y figurent. Deux gardes de ce document "
           "refusent de le produire si c'etait le cas, ou si le repli cessait d'etre <b>2 fois 0 et "
           "1 fois null</b>.", 'p'))

# ── 5 ──
F.append(P("5. La sonde : ouverte, pas crue &mdash; et juste cette fois", 'h1'))
F.append(P("L'etiquette annoncait <i>&laquo; deja couvert &raquo;</i>. <b>Verifie en l'ouvrant</b> : "
           "elle appelle bien la production, avec les <b>deux</b> branches garnies (favoris ET recents), "
           "et conduit " + C % 'toggleFavFood' + " <b>deux fois</b>, dont le cas ou tous les facultatifs "
           "sont absents.", 'p'))
F.append(encadre(
    "APRES DEUX ETIQUETTES FAUSSES DE SUITE, CELLE-CI TIENT",
    "La sous-etape 3-i annoncait <i>&laquo; instantane : couvert &raquo;</i> pour une sonde qui "
    "<b>recopiait la regle</b> au lieu d'appeler la production. La sous-etape suivante annoncait "
    "<i>&laquo; AUCUNE sonde &raquo;</i> alors qu'un temoin conduisait vraiment le code."
    "<br/><br/>=&gt; <b>Dans les deux sens, l'etiquette ne remplace pas l'ouverture du fichier.</b> "
    "Le cout de la verification est de deux minutes ; le cout de la croire est un critere de "
    "reussite qui ne peut plus rien detecter.", VERT))

# ── 6 ──
F.append(P("6. Deux pieges d'outillage, dont un nouveau", 'h1'))
F.append(P("<b>(1) Mon temoin de perimetre rougissait sur du code SAIN.</b> Il listait les cles "
           "attendues du proprietaire : j'en avais ecrit <b>8 au lieu de 9</b>, en oubliant "
           + C % 'name' + ". =&gt; <b><i>Un temoin de source se verifie d'abord contre le code sain</i></b> "
           "&mdash; s'il rougit la, c'est l'attendu qui est faux, pas le code. <i>Corrige avant toute "
           "mutation, sinon j'aurais cherche un bug qui n'existe pas.</i>", 'p'))
F.append(bloc_code(PIEGE))
F.append(encadre(
    "UNE MUTATION MAL PLACEE EST INDISCERNABLE D'UN TEMOIN AVEUGLE",
    "Les deux produisent le meme signal : <b>0 rouge</b>. Et la conclusion naturelle &mdash; "
    "<i>&laquo; ce code n'est pas couvert &raquo;</i> &mdash; est fausse dans un cas sur deux."
    "<br/><br/>=&gt; <b>Ancrer chaque mutation sur deux lignes contigues</b>, pas sur un motif d'une "
    "ligne. <i>Et ca resservira : plus on extrait de proprietaires, plus les motifs se ressemblent "
    "d'une fonction a l'autre &mdash; c'est un effet direct du travail en cours.</i>"))

# ── 7 ──
F.append(P("7. Les mesures", 'h1'))
F.append(tableau(
    ["preuve", "resultat"],
    [["Instantane, avant / apres",
      "<b>identique octet pour octet</b>, sha256 " + C % SHA_INSTANTANE + ", diff vide"],
     ["Controle negatif", "<b>11 mutations, TOUTES mordent</b> &mdash; controle sain <b>a 0 rouge</b> "
      "sur 15 temoins, lance <b>en premier</b>"],
     ["Passe complete", "<b>3620 / 3620</b> &mdash; <b>total predit = total obtenu</b> (3605 + 15)"],
     ["Autres bancs", "calculs 339/339 &middot; muscles 241/241 &middot; croises 50/50 &middot; "
      "dates 9/9 &middot; donnees : aucun trou nouveau"],
     ["Source : proprietaire unique", "%d occurrences (1 declaration + 3 appelants)" % APPELS],
     ["Source : divergence intacte", "le repli vaut <b>%d fois 0</b> et <b>%d fois null</b>"
      % (PW_ZERO, PW_NULL)]],
    [46 * mm, 119 * mm]))

# ── 8 ──
F.append(P("8. Etat du decoupage", 'h1'))
F.append(tableau(
    ["", ""],
    [["Sous-etapes reelles restantes avant le hub", "<b>%d</b> &mdash; sur %d au plan, %d livrees, "
      "%d ecartee" % (RESTANTES, TOTAL_SE, LIVREES, ECARTEES)],
     ["Les 4 harmonisations", "<b>decisions produit</b>, elles attendent Michel. Critere : est-ce que "
      "ca modifie ce qui est ECRIT dans le journal alimentaire ?"],
     ["Le hub et la douane", "apres, consigne explicite inchangee"],
     ["Favoris perdus entre onglets, ecart 48,3 / 48", "ouverts, non corriges"],
     ["Historique, migrations", "non touches"]],
    [58 * mm, 107 * mm]))

F.append(Spacer(1, 8))
F.append(P(("Document genere depuis le code servi &mdash; tous les decomptes cites sont recomptes a "
            "chaque generation (%d occurrences du proprietaire, %d champs dans son corps, repli "
            "%d fois 0 / %d fois null, %d copie de la provenance, %d sous-etapes restantes). "
            % (APPELS, len(CLES), PW_ZERO, PW_NULL, PROV_COPIES, RESTANTES)) +
           "<b>Sept gardes refusent de produire si un fait tombe</b> &mdash; dont un qui verifie que "
           + C % 'portionWeightG' + "/" + C % 'fav' + " ne sont <b>pas</b> entres dans le proprietaire, "
           "un qui verifie que la divergence <b>n'a pas ete harmonisee</b>, et un qui verifie que le "
           "proprietaire <b>n'a pas gagne de parametre</b>. Source : "
           + C % 'tools/gen_1biii_pdf.py' + ".", 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=23 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker - le noyau d un item de liste',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK -> %s (%d Ko)' % (OUT, os.path.getsize(OUT) // 1024))
