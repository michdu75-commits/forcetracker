#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/SOUS-ETAPE-3V.pdf — la definition de portion reprise : la moitie du travail etait
   deja faite, et la frontiere qui reste est HORS D'ATTEINTE. Quinzieme document de la serie.

TOUS LES DECOMPTES SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI.
La garde qui compte le plus : `_bcNutr` ne doit PAS entrer dans le proprietaire. Cette derive-la
n'est pas seulement invisible a l'execution — elle est INATTEIGNABLE : aucune fixture ne peut la
faire rougir sur un temoin de comportement. C'est tout le sujet du document.

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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'SOUS-ETAPE-3V.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
SONDE = open(os.path.join(ROOT, 'tools', 'instantane_1b23.js'), encoding='utf-8').read()
RUN = open(os.path.join(ROOT, 'tests', 'parcours', 'runner.js'), encoding='utf-8').read()
DEC = open(os.path.join(ROOT, 'docs', 'SOUS-ETAPES-1B-3.md'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = '(ft-v\d+)'", SW) or [None, '?'])[1]
SHA_INSTANTANE = '8d352131a8cde6cf'

# ── LE CODE SANS SES BLOCS DE COMMENTAIRE ENTIERS (lecon ft-v1200/1201).
CODE = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), APP)
CODE = '\n'.join(l for l in CODE.split('\n') if not l.strip().startswith('//'))


def corps(nom, arg=r'\w*'):
    m = re.search(r'function ' + nom + r'\(' + arg + r'\)\{[\s\S]*?\n\}', CODE)
    return m.group(0) if m else ''


# ── LES DECOMPTES, REFAITS ICI ───────────────────────────────────────────────
_M = re.search(r'function _afReprendreDefPortion\(src\)\{[\s\S]*?\n\}', CODE)
C_OWNER = _M.group(0) if _M else ''
HORS = (CODE[:_M.start()] + CODE[_M.end():]) if _M else CODE

N_OWNER = len(re.findall(r'_afReprendreDefPortion\(', CODE))
N_NOMBRE_OWNER = len(re.findall(r'_afReprendrePortions\(', CODE))
N_DUR = len([l for l in HORS.split('\n')
             if re.search(r"_afPortionLabel\s*=\s*String\(\w+\.portionLabel", l)])
N_LIGNE_NOMBRE = len([l for l in CODE.split('\n')
                      if re.search(r"!_bcNutr\s*&&[\s\S]*_afReprendrePortions", l)])
C_SETUNITE = corps('_afSetUnite', r'u')
N_SETUNITE = len(re.findall(r'_afPortion(?:Label|Poids)\s*=', C_SETUNITE))

CLES = sorted(set(re.findall(r"out\['([^']+)'\]", SONDE)))
N_TEMOINS = len(re.findall(r"t\('CCC ", RUN))

SOUS = re.findall(r'^### (1b-[iv]+|3-[iv]+)\b(.*)$', DEC, re.M)
TOTAL_SE = len(SOUS)
LIVREES = len([t for t in SOUS if 'LIVR' in t[1].upper()])
ECARTEES = len([t for t in SOUS if 'CART' in t[1].upper()])
RESTANTES = TOTAL_SE - LIVREES - ECARTEES

# CHAQUE GARDE PROTEGE UNE AFFIRMATION DU DOCUMENT.
if not C_OWNER:
    raise SystemExit('`_afReprendreDefPortion` est introuvable : tout le document parle d elle.')
if '_bcNutr' in C_OWNER:
    raise SystemExit('PERIMETRE ROMPU : `_bcNutr` est ENTRE dans le proprietaire. Le §4 demontre '
                     'que cette derive est INATTEIGNABLE a l execution — aucun temoin de '
                     'comportement ne peut la voir, ce garde est le seul.')
if re.search(r'_afPortions\b', C_OWNER):
    raise SystemExit('PERIMETRE ROMPU : le proprietaire touche `_afPortions`. Le NOMBRE a DEJA le '
                     'sien (`_afReprendrePortions`) — deux proprietaires pour la meme grandeur '
                     'sont la duplication que ce chantier supprime (R2). Le §2 l affirme.')
if '_efPortion' in C_OWNER:
    raise SystemExit('PERIMETRE ROMPU : les jumelles `_ef*` de l ecran d EDITION sont entrees dans '
                     'le proprietaire. Meme grandeur, AUTRE ecran : le §5 affirme le contraire.')
if "'portion'" not in C_OWNER:
    raise SystemExit('Le garde d unite a disparu du proprietaire : une definition serait reprise '
                     'depuis un aliment PESE. Le §3 cite ce comportement.')
if N_OWNER != 3:
    raise SystemExit('`_afReprendreDefPortion` a %d occurrences, pas 3 (1 declaration + 2 appels) : '
                     'le §2 cite ce chiffre.' % N_OWNER)
if N_DUR != 0:
    raise SystemExit('La definition est encore ecrite en dur %d fois hors du proprietaire : le §5 '
                     'affirme qu il n en reste AUCUNE.' % N_DUR)
if N_NOMBRE_OWNER != 3:
    raise SystemExit('`_afReprendrePortions` a %d occurrences, pas 3 : le §2 affirme que le NOMBRE '
                     'avait DEJA son proprietaire et ses 2 appelants.' % N_NOMBRE_OWNER)
if N_LIGNE_NOMBRE != 2:
    raise SystemExit('La ligne du NOMBRE est ecrite %d fois chez les appelants, pas 2 : le §5 '
                     'affirme qu elle n a PAS ete absorbee au passage.' % N_LIGNE_NOMBRE)
if not C_SETUNITE:
    raise SystemExit('`_afSetUnite` est introuvable : le §6 cite sa mesure.')
if N_SETUNITE != 0:
    raise SystemExit('`_afSetUnite` ecrit %d fois `_afPortionLabel`/`_afPortionPoids` : le §6 '
                     'affirme qu elle n en ecrit AUCUNE — c est le 5e ecart de perimetre du plan.'
                     % N_SETUNITE)
if len(CLES) != 21:
    raise SystemExit('La sonde porte %d cles, pas 21 : le §4 cite ce chiffre (19 avant, etendue '
                     'AVANT le BEFORE).' % len(CLES))
for k in ('3v_defportion_quickFillFood', '3v_defportion_afSuggPrendreLocale'):
    if k not in CLES:
        raise SystemExit('La sonde n OBSERVE plus la definition (%s manque) : le §4 raconte '
                         'precisement qu elle POSAIT sans jamais relire.' % k)
# ⚠️⚠️ CE GARDE ETAIT AVEUGLE A SA PREMIERE ECRITURE, ET LA MUTATION G8 L'A DIT.
#    Il cherchait `bcNutr` N'IMPORTE OU dans le fichier — or le mot vit aussi dans le COMMENTAIRE
#    qui explique pourquoi on le lit. Retirer la vraie lecture le laissait muet : 12 mutations sur
#    13 mordaient, celle-la passait au vert.
#    C'est la famille de ft-v1193 (un temoin qui ne distingue pas le code de ce qui en PARLE),
#    reposee par moi dans le garde cense proteger cette mesure precise.
#    => on lit le fichier SANS ses blocs de commentaire, et on cherche l'AFFECTATION de la cle.
_SONDE_CODE = re.sub(r'/\*[\s\S]*?\*/', '', SONDE)
_SONDE_CODE = '\n'.join(l for l in _SONDE_CODE.split('\n') if not l.strip().startswith('//'))
if not re.search(r'bcNutr\s*:', _SONDE_CODE):
    raise SystemExit('La sonde ne LIT plus `_bcNutr` : c est elle qui a fait tomber la decouverte '
                     'du §4, et sans elle le document affirme une mesure qu il ne fait pas.')
if N_TEMOINS != 19:
    raise SystemExit('Le bloc CCC porte %d temoins, pas 19 : le §7 cite ce chiffre.' % N_TEMOINS)
if TOTAL_SE != 10 or LIVREES != 8 or ECARTEES != 1 or RESTANTES != 1:
    raise SystemExit('Le decoupage porte %d sous-etapes, %d livrees, %d ecartee(s), %d restante(s) '
                     '— pas 10 / 8 / 1 / 1.' % (TOTAL_SE, LIVREES, ECARTEES, RESTANTES))

# ⛔⛔ LE TOTAL DE LA PASSE SE LIT, IL NE S'ECRIT PAS (lecon ft-v1201).
PASSE = os.environ.get('FT_PASSE') or '/tmp/passe1203.log'
try:
    _log = open(PASSE, encoding='utf-8', errors='replace').read()
except Exception:
    raise SystemExit('Journal de passe introuvable (%s) : le §7 cite un total, il doit etre LU.'
                     % PASSE)
_m = re.search(r'TOTAL CROISÉ : (\d+) ✅ · (\d+) ❌', _log)
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
                      'Force Tracker — la definition de portion reprise (%s) — 13/09/2026' % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


AVANT_APRES = """// AVANT — deux portes, la meme ligne, caractere pour caractere

// quickFillFood (« Mes aliments ») :
if(it.u==='portion'){ _afPortionLabel=String(it.portionLabel||'').slice(0,24);
                      _afPortionPoids=+it.portionWeightG>0?+it.portionWeightG:0; }

// _afSuggPrendreLocale (recherche du journal) :
if(e.u==='portion'){  _afPortionLabel=String(e.portionLabel||'').slice(0,24);
                      _afPortionPoids=+e.portionWeightG>0?+e.portionWeightG:0; }

// APRES — un proprietaire, deux appels
function _afReprendreDefPortion(src){
  const s = src || {};
  if(s.u !== 'portion') return false;
  _afPortionLabel = String(s.portionLabel || '').slice(0, 24);
  _afPortionPoids = +s.portionWeightG > 0 ? +s.portionWeightG : 0;
  return true;
}
_afReprendreDefPortion(it);   // quickFillFood
_afReprendreDefPortion(e);    // _afSuggPrendreLocale"""

ASYMETRIE = """// LES DEUX LIGNES, CHEZ LES APPELANTS — adjacentes, et PAS la meme condition

_afReprendreDefPortion(it);                      // la DEFINITION -- aucun garde
if(!_bcNutr && +it.q>0 && it.u==='portion' && ...) _afReprendrePortions(+it.q);
   ^^^^^^^^ le NOMBRE -- garde par !_bcNutr

// LA CHAINE MESUREE, LIGNE A LIGNE :
//  1. quickFillFood entre par _afOublierAliment()  ->  _bcNutr = null
//  2. le seul site qui POSE _bcNutr est garde par  ->  it.u !== 'portion'
//  3. la branche else                              ->  _bcNutr = null
//
//  => si it.u === 'portion', _bcNutr vaut TOUJOURS null a la ligne 2.
//     Le !_bcNutr ne peut JAMAIS bloquer. Verifie a la sonde sur 6 cas :
//     bcNutr: false partout -- Y COMPRIS sur la fixture portant un per100,
//     celle qui etait precisement concue pour le poser."""

SONDE_TXT = """// LA SONDE POSAIT, ELLE NE RELISAIT PAS — un 3e visage du meme piege

// Depuis des versions, la sonde ECRIT ces deux variables en fixture :
_afPortionPoids = 125; _afPortionLabel = 'steak';      // lignes 95 / 116 / 123

// ... mais AUCUNE des 19 cles ne les relisait apres avoir conduit une porte.
// => l'instantane serait reste identique quoi qu'on fasse a la ligne visee,
//    donc il aurait valide n'importe quelle extraction.

// ft-v1199 : conduire n'est pas observer.
// ft-v1203 : POSER encore moins.   -> 19 cles, puis 21, AVANT le BEFORE."""


# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P("La definition de portion reprise", 'titre'))
F.append(P("Force Tracker &mdash; 13/09/2026, " + C % VERSION + ". Quinzieme document de la serie, "
           "sous-etape <b>3-v</b>. Michel valide la precedente et retrograde explicitement le plan : "
           "<i>&laquo; considere le plan comme un ordre de travail, pas comme une source de chiffres ; "
           "recompte le perimetre reel le jour meme &raquo;</i> &middot; <i>&laquo; si un proprietaire "
           "existe deja, branche l'appelant dessus au lieu de recreer une abstraction &raquo;</i>.",
           'sous'))

F.append(encadre(
    "LES DEUX FAITS DE CETTE SOUS-ETAPE",
    "<b>(1) La moitie du travail etait deja faite, et le plan ne le savait pas.</b> Ce qu'il appelle "
    "&laquo; 3-v &raquo; est en realite deux choses : la <b>definition</b> de portion (2 copies "
    "strictement identiques &mdash; extraite ici) et le <b>nombre</b> de portions, qui a <b>deja son "
    "proprietaire</b> et ses deux appelants depuis trois semaines. <i>La consigne de Michel etait "
    "honoree avant meme que la sous-etape commence.</i>"
    "<br/><br/><b>(2) La frontiere qui reste n'est pas seulement invisible : elle est HORS "
    "D'ATTEINTE.</b> La consigne disait <i>&laquo; conserve les temoins de source lorsque la derive "
    "serait invisible a l'execution &raquo;</i>. Mesure ici : <b>aucune fixture ne peut faire rougir "
    "un temoin de comportement</b> sur cette frontiere. Ce n'est plus &laquo; difficile a voir &raquo;, "
    "c'est <b>impossible</b> &mdash; et le seul instrument qui reste est un temoin qui lit le code."))

# ── 1 ──
F.append(P("1. Le test d'entree &mdash; et pour la premiere fois, le plan dit vrai", 'h1'))
F.append(P("Apres <b>quatre</b> sous-etapes dont le perimetre ecrit ne resistait pas a la mesure, "
           "celui-ci tient sur la moitie qu'il decrit : les deux portes de reprise portaient la meme "
           "ligne, <b>caractere pour caractere</b> au nom de variable pres. <b>Exactement 2 copies.</b>",
           'p'))
F.append(bloc_code(AVANT_APRES))
F.append(P("Occurrences dans le code servi, hors commentaires : " + C % '_afReprendreDefPortion'
           + " <b>%d</b> (1 declaration + 2 appels) &middot; definition ecrite en dur hors du "
           "proprietaire : <b>%d</b>." % (N_OWNER, N_DUR), 'petit'))

# ── 2 ──
F.append(P("2. L'autre moitie etait deja faite", 'h1'))
F.append(tableau(
    ["ce que le plan appelle &laquo; 3-v &raquo;", "etat reel, mesure le jour meme"],
    [["la <b>definition</b> : quelle portion, combien elle pese",
      "<b>2 copies strictement identiques</b> &mdash; c'est ce qui est extrait ici"],
     ["le <b>nombre</b> de portions",
      "X <b>deja fait</b> : " + C % '_afReprendrePortions(n)' + " existe, et les <b>deux portes y "
      "sont branchees</b> depuis trois semaines. <b>%d occurrences</b> (1 declaration + 2 appels)"
      % N_NOMBRE_OWNER]],
    [55 * mm, 110 * mm]))
F.append(encadre(
    "CE QUE CA DIT DU RAPPORT ENTRE UN PLAN ET UN DEPOT",
    "Le plan a ete ecrit le 12/09. Entre-temps, <b>d'autres versions ont travaille sur les memes "
    "lignes</b> &mdash; et le proprietaire du nombre de portions a ete pose par l'une d'elles, pour "
    "une raison qui n'avait rien a voir avec ce chantier."
    "<br/><br/>=&gt; <b><i>Un plan ne sait pas ce qui a ete fait entre-temps.</i></b> Il decrit un "
    "depot a une date, et le depot bouge. C'est la cinquieme fois de suite qu'un perimetre ecrit "
    "diverge du code &mdash; mais pour la premiere fois l'ecart est dans le <b>bon</b> sens : "
    "<i>il restait moins a faire que prevu, pas plus.</i>", VERT))

F.append(PageBreak())

# ── 3 ──
F.append(P("3. Ce que le proprietaire fait, et ce qu'il refuse", 'h1'))
F.append(tableau(
    ["cas", "resultat, aux DEUX portes"],
    [["portion complete (part / 120 g)", "<b>repris tel quel</b>"],
     ["portion sans poids", "etiquette reprise, poids a <b>0</b> &mdash; <i>on ne devine pas un "
      "poids</i> (R29)"],
     ["portion sans nom", "poids repris, etiquette <b>vide</b>"],
     ["<b>en grammes</b>", "X <b>rien n'est repris</b> &mdash; une definition de portion "
      "n'appartient pas a un aliment pese"],
     ["poids nul ou negatif", "<b>0</b>, jamais une valeur de remplacement"],
     ["<b>portion AVEC un pour-100 g</b>", "* <b>repris quand meme</b> &mdash; c'est le cas qui "
      "porte tout le §4"]],
    [45 * mm, 120 * mm]))
F.append(P("=&gt; <b>Les deux portes donnent exactement la meme table sur les 6 cas</b> &mdash; "
           "c'est ce qui rend l'extraction legitime, et un temoin le fige.", 'petit'))

# ── 4 ──
F.append(P("4. L'asymetrie de condition &mdash; et pourquoi elle est hors d'atteinte", 'h1'))
F.append(bloc_code(ASYMETRIE))
F.append(encadre(
    "LA CONSIGNE DE MICHEL, POUSSEE D'UN CRAN PAR LA MESURE",
    "Il a ecrit : <i>&laquo; une derive de conception peut etre invisible a l'execution &raquo;</i>. "
    "Ici c'est plus fort. La ligne du <b>nombre</b> porte un garde qui <b>ne peut pas etre faux</b> : "
    "le bloc qui poserait " + C % '_bcNutr' + " se refuse lui-meme les aliments en portions."
    "<br/><br/>=&gt; <b><i>Aucune fixture ne peut atteindre l'etat qu'un temoin de comportement "
    "devrait mesurer.</i></b> Les deux temoins de source de ce bloc ne sont donc pas un supplement "
    "de prudence : ils sont <b>les seuls possibles</b>. La mutation qui absorbe le garde dans le "
    "proprietaire rend <b>1 rouge, uniquement lui</b> &mdash; tout le reste passe au vert."
    "<br/><br/>X <b>Et ce garde redondant n'est PAS retire.</b> Il est inutile aujourd'hui ; il "
    "serait <b>le seul</b> le jour ou quelqu'un retirerait le " + C % "u!=='portion'" + " d'a cote. "
    "<i>Un garde inutile aujourd'hui peut etre le seul garde demain.</i> Mesure, ecrit dans le "
    "journal de test, <b>non corrige</b> &mdash; une extraction ne change aucun comportement.",
    ORANGE))

# ── 5 ──
F.append(P("5. La sonde : elle POSAIT, elle ne relisait pas", 'h1'))
F.append(bloc_code(SONDE_TXT))
F.append(encadre(
    "ET MA PREMIERE FIXTURE DE PERIMETRE SUPPOSAIT CE QU'ELLE VOULAIT MESURER",
    "J'avais recopie le cas &laquo; avec pour-100 g &raquo; de la sous-etape precedente en croyant "
    "qu'il poserait " + C % '_bcNutr' + ". <b>Vrai pour un aliment en grammes, faux pour un aliment "
    "en portions.</b>"
    "<br/><br/>=&gt; La sonde <b>LIT</b> desormais " + C % '_bcNutr' + " au lieu de le supposer "
    "&mdash; et c'est exactement ce qui a fait tomber la decouverte du §4. <i>Une fixture qui "
    "suppose l'etat qu'elle veut mesurer ne le mesure pas : elle le decrete.</i>", VERT))

F.append(PageBreak())

# ── 6 ──
F.append(P("6. Ce qui reste volontairement dehors", 'h1'))
F.append(tableau(
    ["ce qui ne bouge pas", "la raison, mesurable"],
    [["la <b>ligne du NOMBRE</b> chez les appelants",
      "<b>%d copies</b>, gardees par " % N_LIGNE_NOMBRE + C % '!_bcNutr' + ". L'absorber "
      "changerait la condition d'appel &mdash; un temoin l'interdit"],
     [C % '_afReprendrePortions',
      "intacte, <b>%d occurrences</b>. C'est le proprietaire du nombre : on ne lui en oppose pas "
      "un second" % N_NOMBRE_OWNER],
     ["les <b>jumelles</b> " + C % '_efPortionLabel' + " / " + C % '_efPortionPoids',
      "meme grandeur, <b>AUTRE ecran</b> (l'edition). Separation documentee dans le code depuis le "
      "10/09. Les fondre serait une <b>refonte de deux ecrans</b>, pas une extraction"],
     ["le garde d'unite " + C % "u==='portion'",
      "il est <b>dans</b> le proprietaire, parce qu'il fait partie de son metier : <i>reprendre une "
      "definition de portion</i>. Le retirer ferait passer celle d'un aliment pese"]],
    [50 * mm, 115 * mm]))
F.append(P("/!\ <b>5e ecart de perimetre du plan, decouvert au passage &mdash; il porte sur la "
           "sous-etape SUIVANTE.</b> Le plan annonce 4 sites pour " + C % '1b-v' + ". Mesure : "
           + C % '_afSetUnite' + " <b>n'ecrit NI</b> " + C % '_afPortionLabel' + " <b>NI</b> "
           + C % '_afPortionPoids' + " (<b>%d fois</b>) ; les deux portes de reprise sont faites "
           "par 3-v ; et " % N_SETUNITE + C % 'openEditFood' + " ecrit les jumelles " + C % '_ef*'
           + ". <b>Il ne reste qu'UN site, qui ecrit d'autres variables</b> &mdash; le test d'entree "
           "s'appliquera.", 'petit'))

# ── 7 ──
F.append(P("7. Les mesures", 'h1'))
F.append(tableau(
    ["preuve", "resultat"],
    [["Instantane, avant / apres",
      "<b>identique octet pour octet</b>, sha256 " + C % SHA_INSTANTANE + " &mdash; sonde etendue de "
      "<b>19 a %d cles AVANT le BEFORE</b>" % len(CLES)],
     ["Temoins", "<b>%d</b> &mdash; bloc CCC, dont <b>7 de source</b>" % N_TEMOINS],
     ["Controle negatif", "<b>11 mutations, toutes mordent sur leur PROPRE temoin</b> ; controle "
      "sain a 0 rouge <b>avant ET apres</b>"],
     ["Passe complete", "<b>%d / %d</b> &mdash; <i>lu dans le journal de la passe, pas ecrit a la "
      "main</i> &middot; total <b>predit = obtenu</b> (3680 + %d)" % (PASSE_OK, PASSE_OK, N_TEMOINS)],
     ["Autres bancs", "calculs 339/339 &middot; muscles 241/241 &middot; croises 50/50 &middot; "
      "dates 9/9 &middot; donnees : aucun trou nouveau"],
     ["Ecran", "<b>rien ne change</b>"]],
    [42 * mm, 123 * mm]))
F.append(P("/!\ <b>Et une mutation avait d'abord un ancrage INVALIDE</b> : " + C % 'const s = src || {};'
           + " existe <b>6 fois</b> dans le fichier &mdash; elle frappait un autre proprietaire. "
           "<i>Plus on extrait de proprietaires, plus les motifs se ressemblent d'une fonction a "
           "l'autre</i>, et une mutation mal placee est indiscernable d'un temoin aveugle. Reancree "
           "sur deux lignes contigues propres a celui-ci.", 'petit'))

# ── 8 ──
F.append(P("8. Etat du decoupage", 'h1'))
F.append(tableau(
    ["", ""],
    [["Sous-etapes restantes avant le hub", "<b>%d</b> &mdash; sur %d au plan, %d livrees, %d "
      "ecartee : " % (RESTANTES, TOTAL_SE, LIVREES, ECARTEES) + C % '1b-v' + " seule"],
     ["Dependance de " + C % '1b-v', "OUI <b>levee</b> &mdash; elle attendait 3-v, qui est livree. "
      "Mais son perimetre ecrit est faux (voir §6) : <b>a recompter le jour meme</b>"],
     ["Defaut reel decouvert ?", "* <b>oui</b> &mdash; le garde qui ne peut jamais bloquer. "
      "<b>Mesure, cause documentee, NON corrige</b>, en attente d'un feu vert separe"],
     ["Le hub et la douane", "apres 1b et 3, consigne inchangee"],
     ["Favoris entre onglets, ecart 48,3 / 48", "ouverts, non corriges"],
     ["Historique, migrations, harmonisations produit", "non touches"]],
    [52 * mm, 113 * mm]))
F.append(P("<b>Rollback</b> : un " + C % 'git revert' + " du commit.", 'petit'))

F.append(Spacer(1, 8))
F.append(P(("Document genere depuis le code servi &mdash; tous les decomptes cites sont recomptes a "
            "chaque generation (%d occurrences du proprietaire, %d ecriture en dur restante, %d du "
            "proprietaire du nombre, %d lignes du nombre chez les appelants, %d ecriture dans "
            "`_afSetUnite`, %d cles de sonde, %d temoins, %d sous-etape restante). "
            % (N_OWNER, N_DUR, N_NOMBRE_OWNER, N_LIGNE_NOMBRE, N_SETUNITE, len(CLES), N_TEMOINS,
               RESTANTES)) +
           "<b>Dix-neuf gardes refusent de produire si un fait tombe</b> &mdash; dont un qui verifie "
           "que " + C % '_bcNutr' + " n'est <b>pas</b> entre dans le proprietaire (la derive hors "
           "d'atteinte), un que le proprietaire ne touche <b>pas</b> " + C % '_afPortions' + " (le "
           "nombre a deja le sien), un que les jumelles " + C % '_ef*' + " ne sont pas absorbees, et "
           "un que la sonde <b>LIT</b> " + C % '_bcNutr' + " au lieu de le supposer. Le total de la "
           "passe est <b>lu dans son journal</b>, jamais ecrit a la main. Source : "
           + C % 'tools/gen_1203_pdf.py' + ".", 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=23 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker - la definition de portion reprise',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK -> %s (%d Ko)' % (OUT, os.path.getsize(OUT) // 1024))
