#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/SOUS-ETAPE-3I.pdf — la sous-etape 3-i, et la sonde qui ne couvrait rien.

   Huitieme document de la serie : DOUANE -> ARCHI -> PLAN -> PHASE0A-ETAPE1A -> VALIDATION-IPHONE
   -> ETAPE2-ET-PERIMETRE -> DECOUPAGE-1B-3 -> CELUI-CI.

⭐⭐ TOUS LES DECOMPTES SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE ET LA SONDE SERVIS.
   Et on compte les CLES DISTINCTES de l'instantane, pas les affectations : il y a 13 lignes
   `out['...']=` pour 12 cles (une cle est assignee deux fois, dans un try et dans son catch).
   *Compter les lignes au lieu des cles serait exactement l'erreur que ce document denonce.*

⚠️ CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji, entites nommees comprises.
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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'SOUS-ETAPE-3I.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
SONDE = open(os.path.join(ROOT, 'tools', 'instantane_1b23.js'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = '(ft-v\d+)'", SW) or [None, '?'])[1]

# Mesure du 12/09 : la sonde rejouee sur l'app.js d'AVANT 3-i rend la MEME sha.
SHA_INSTANTANE = 'd5b0572cafcc4477'


def _commentaire(l):
    x = l.strip()
    return x.startswith('*') or x.startswith('//') or x.startswith('/*') or x.startswith('`')


LA = [l for l in APP.split('\n') if not _commentaire(l)]


def corps(nom):
    m = re.search(r'^function ' + nom + r'\(.*?^\}', APP, re.M | re.S)
    return m.group(0) if m else ''


# ── LES DECOMPTES, REFAITS ICI ───────────────────────────────────────────────
APPELS = len(re.findall(r'_qReprenable\(', APP))
REGLE_P = len([l for l in LA
               if re.search(r"\(!\w+\.u \|\| \w+\.u === 'g' \|\| \w+\.u === 'portion'\)", l)])
GRAMMES = len([l for l in LA
               if re.search(r"q>0\s*&&\s*\(!\w+\.u\s*\|\|\s*\w+\.u\s*===?\s*'g'\)", l)])
PORTES = len([n for n in ('rejouerRepas', 'quickAddFood') if '_qReprenable(' in corps(n)])
# ⭐ LES CLES DISTINCTES, pas les lignes `out['...']=` — voir l'en-tete.
SONDES = len(set(re.findall(r"out\['([^']+)'\]\s*=", SONDE)))
# (!) On cherche la CLE REELLEMENT ECRITE, pas le nom quelque part dans le fichier :
#     il apparait AUSSI dans un commentaire, et un garde qui ne distingue pas le code
#     de ce qui en PARLE reste vert sur une sonde dont la cle a disparu. Mesure du 12/09 :
#     renommer la cle laissait ce garde muet tant qu'il lisait tout le fichier.
REJEU_SONDE = "3_via_rejouerRepas" in set(re.findall(r"out\['([^']+)'\]\s*=", SONDE))
RECOPIE = "const regleP = c =>" in SONDE
PARAM = "function _srcRepriseQ(src, qOk)" in APP

# ⛔ CHAQUE GARDE PROTEGE UNE AFFIRMATION DU DOCUMENT.
if APPELS != 3:
    raise SystemExit('`_qReprenable` a %d occurrences, pas 3 (1 declaration + 2 appelants). '
                     'Le §2 repose dessus.' % APPELS)
if REGLE_P != 1:
    raise SystemExit('La regle « avec portions » est ecrite %d fois dans le CODE, pas 1 — le '
                     'document affirme un proprietaire UNIQUE.' % REGLE_P)
if PORTES != 2:
    raise SystemExit('%d fonctions sur 2 appellent `_qReprenable` — le §2 est faux.' % PORTES)
if GRAMMES != 5:
    raise SystemExit('La regle « grammes seuls » est ecrite %d fois, pas 5 : 3-ii/iii/iv ont ete '
                     'faites au passage, ce que le §4 affirme ne PAS avoir fait.' % GRAMMES)
if SONDES != 12:
    raise SystemExit('L\'instantane porte %d cles distinctes, pas 12 — le §3 cite ce chiffre.'
                     % SONDES)
if not REJEU_SONDE:
    raise SystemExit('La sonde `3_via_rejouerRepas` a disparu : la moitie manquante dont parle '
                     'tout le §3 n\'est plus comblee.')
if not RECOPIE:
    raise SystemExit('`3_regle_avec_portions` ne recopie PLUS la regle dans la sonde — le constat '
                     'du §3 (« c\'est une table de verite, pas une couverture ») est perime. '
                     'Relire le document avant de le publier.')
if not PARAM:
    raise SystemExit('`_srcRepriseQ` ne recoit plus `qOk` en parametre : la separation 1b / 3 que '
                     'le §5 explique n\'existe plus.')

AVANT = """// AVANT — le meme test, ecrit deux fois

// rejouerRepas
const qOk=(+e.q>0 && (!e.u||e.u==='g'||e.u==='portion'));

// quickAddFood
const _qOk=(+it.q>0 && (!it.u||it.u==='g'||it.u==='portion'));"""

APRES = """// APRES — un proprietaire, et il rend un BOOLEEN sans rien toucher

function _qReprenable(src){
  const s = src || {};
  return (+s.q > 0 && (!s.u || s.u === 'g' || s.u === 'portion'));
}

const qOk  = _qReprenable(e);    // rejouerRepas
const _qOk = _qReprenable(it);   // quickAddFood"""

SONDE_FAUSSE = """// LA SONDE QUI NE COUVRAIT RIEN — mesuree AVANT de coder

const regleP = c => (+c.q>0 && (!c.u||c.u==='g'||c.u==='portion'));   // <- DANS la sonde
out['3_regle_avec_portions'] = J(CAS.map(c => [c.q, c.u, regleP(c)]));

// Elle n'appelle AUCUN code de production : elle ne peut rien detecter d'une extraction.
// C'est une table de verite, pas une couverture.

// Et la seule sonde qui conduisait une vraie porte n'en conduisait qu'UNE sur deux :
out['3_via_quickAddFood'] = ...      // quickAddFood
//   rejouerRepas : rien."""

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
                      'Force Tracker — sous-etape 3-i, et la sonde qui ne couvrait rien (%s) — 12/09/2026'
                      % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P("Sous-etape 3-i, et la sonde qui ne couvrait rien", 'titre'))
F.append(P("Force Tracker &mdash; 12/09/2026, " + C % VERSION + ". Huitieme document de la serie. "
           "Michel : <i>&laquo; continue selon le decoupage, une sous-etape a la fois, en gardant "
           "exactement les memes regles &raquo;</i>. <b>La sous-etape est petite ; ce qui s'est "
           "passe AVANT de la coder l'est moins.</b>", 'sous'))

F.append(encadre(
    "LE FAIT PRINCIPAL DE CETTE VERSION",
    "<b>Mon propre document annoncait <i>&laquo; instantane : couvert &raquo;</i> pour 3-i. "
    "Mesure en ouvrant la sonde : <b>a moitie faux</b>.</b>"
    "<br/><br/>Un seul des deux sites etait reellement couvert, et la sonde qui portait le nom de "
    "la regle <b>recopiait cette regle chez elle</b> au lieu d'appeler la production."
    "<br/><br/><b>Corrige AVANT toute ligne de code</b>, comme la regle de decoupage l'exige : "
    "<i>&laquo; l'instantane couvre deja ses sites, OU on ecrit la sonde AVANT &raquo;</i>.", ORANGE))

# ── 1 ──
F.append(P("1. Ce que 3-i devait faire", 'h1'))
F.append(P("La suite naturelle de 1b-i : <b>le meme couple de fonctions</b> ("
           + C % 'rejouerRepas' + " &middot; " + C % 'quickAddFood' + "), <b>l'autre moitie de la "
           "ligne</b>. Le bloc " + C % '{q, u, per100, ...}' + " a son proprietaire depuis ft-v1195 ; "
           "le <b>TEST</b> qui decide si la quantite passe restait ecrit deux fois."))
F.append(bloc_code(AVANT))
F.append(Spacer(1, 4))
F.append(bloc_code(APRES))

# ── 2 ──
F.append(P("2. Ce que la regle dit, et ce qu'elle refuse", 'h1'))
F.append(tableau(
    ["cas", "verdict", "pourquoi"],
    [[C % "{q:120, u:'g'}", "<b>oui</b>", "des grammes, on sait redimensionner"],
     [C % "{q:2, u:'portion'}", "<b>oui</b>", "c'est la moitie &laquo; avec portions &raquo; "
      "(ft-v1183/1186)"],
     [C % "{q:80, u:null}", "<b>oui</b>", C % '_srcRepriseQ' + " retombe alors sur " + C % "'g'"],
     [C % "{q:0, u:'g'}", "<b>non</b>", "une quantite nulle n'est pas une quantite"],
     [C % "{q:-5, u:'g'}", "<b>non</b>", "idem, dans l'autre sens"],
     [C % "{q:150, u:'ml'}", "<b>non</b>", "<b>sans densite, un volume ne dit pas ce que PESE "
      "l'aliment</b> &mdash; et on n'invente pas une densite (<b>R29</b>)"]],
    [40 * mm, 20 * mm, 105 * mm]))
F.append(P("<b>Elle rend un booleen et ne touche a rien</b> : c'est " + C % '_srcRepriseQ' +
           " qui decide quoi en faire. <i>Une sous-etape reversible est une sous-etape qui ne fait "
           "qu'une chose.</i>", 'petit'))

# ── 3 ──
F.append(PageBreak())
F.append(P("3. La sonde qui ne couvrait rien", 'h1'))
F.append(bloc_code(SONDE_FAUSSE))
F.append(Spacer(1, 4))
F.append(encadre(
    "POURQUOI CE N'EST PAS UN DETAIL",
    "Le critere de reussite de chaque sous-etape est <b>binaire</b> : <i>l'instantane doit etre "
    "identique octet pour octet avant et apres</i>. <b>Un instantane qui ne conduit pas la "
    "production ne peut pas remplir ce role</b> &mdash; il resterait identique quoi qu'on fasse au "
    "code."
    "<br/><br/><b><i>Une sonde qui recopie la regle mesure ce qu'on CROYAIT ecrire, pas ce qui est "
    "execute.</i></b>"
    "<br/><br/><b>Corrige</b> : la sonde " + C % '3_via_rejouerRepas' + " comble la moitie "
    "manquante, et l'instantane passe de <b>11</b> a <b>%d cles</b>. Le BEFORE a ete capture <b>avec "
    "la sonde etendue</b> &mdash; l'etendre apres l'extraction aurait donne un avant / apres "
    "<b>incomparable</b>." % SONDES))
F.append(Spacer(1, 6))
F.append(encadre(
    "ET LE SIGNE ETAIT DANS LE COMMENTAIRE LUI-MEME",
    "Il annoncait <i>&laquo; les six sites conduits par leur VRAIE porte &raquo;</i> pour une boucle "
    "qui n'en conduit <b>qu'une</b>."
    "<br/><br/>=&gt; <b>C'est le miroir du commentaire de ft-v1190</b>, qui annoncait une portee "
    "plus <b>ETROITE</b> que le code. <i>Dans les deux sens, un commentaire qui decrit mal sa portee "
    "dispense le lecteur suivant d'aller verifier.</i>"
    "<br/><br/><b>Ecrit dans " + C % 'BUGS.md' + " &sect;58</b> (<i>verifier la fonction n'est pas "
    "verifier l'appel</i>), dont c'est la version <b>cote SONDE</b> : le reflexe est d'<b>ouvrir la "
    "sonde</b> et d'y chercher le nom de la fonction de production. S'il n'y est pas, elle ne couvre "
    "rien.", ORANGE))

# ── 4 ──
F.append(P("4. Ce que 3-i n'a PAS fait, et c'est la moitie qui compte", 'h1'))
F.append(encadre(
    "LES %d SITES &laquo; GRAMMES SEULS &raquo; SONT INTACTS" % GRAMMES,
    "Ils refusent les portions <b>expres</b> : ils alimentent un champ <b>en grammes</b>."
    "<br/><br/><b><i>Les deux regles se ressemblent a un " + C % '||' + " pres et ne disent pas la "
    "meme chose.</i></b> Les fondre serait un <b>changement de comportement</b>, pas une extraction "
    "&mdash; c'est la sous-etape <b>3-ii / 3-iii / 3-iv</b>, et l'une des <b>4 decisions produit</b> "
    "qui attendent Michel."
    "<br/><br/><b>Un temoin de perimetre exige que ce compte reste a %d.</b> Le jour ou il tombe a 1, "
    "c'est que les sous-etapes suivantes ont ete faites &mdash; et ce temoin devra alors se "
    "DEPLACER, pas disparaitre." % GRAMMES, VERT))

F.append(Spacer(1, 6))
F.append(P("5. Le temoin de perimetre de 1b-i s'est DEPLACE, pas supprime", 'h1'))
F.append(tableau(
    ["en 1b-i (ft-v1195)", "en 3-i (ft-v1196)"],
    [["<b>les deux portes calculent ENCORE " + C % 'qOk' + " chacune dans son corps</b><br/>"
      "<i>(le garde-fou qui empechait 1b-i de deborder sur l'etape 3)</i>",
      "<b>la regle existe a UN SEUL endroit, et les deux portes l'APPELLENT</b><br/>"
      "<i>(3-i est precisement la sous-etape qui retire le premier)</i>"]],
    [82 * mm, 83 * mm]))
F.append(P("=&gt; <b><i>La difference entre un temoin qu'on retire et un temoin qui se deplace "
           "se mesure</i></b> : les deux mutations qui le faisaient rougir en 1b-i (une porte qui "
           "delegue &middot; la regle retiree d'une porte) le font <b>toujours</b> rougir, par "
           "l'autre bout."))

# ── 6 ──
F.append(PageBreak())
F.append(P("6. Les mesures", 'h1'))
F.append(tableau(
    ["preuve", "resultat"],
    [["<b>Instantane</b> (%d cles), avant / apres" % SONDES,
      "<b>identique octet pour octet</b>, sha256 " + C % SHA_INSTANTANE + "<br/><i>(la sha annoncee dans le message de commit, 64099b39025027ec, etait fausse : elle venait d'une version intermediaire de la sonde &mdash; verifie en rejouant la sonde actuelle sur l'app.js d'AVANT 3-i, meme sha des deux cotes, diff vide)</i>"],
     ["<b>Controle negatif</b>", "<b>10 mutations, TOUTES mordent</b>"],
     ["Source : " + C % '_qReprenable' + " appele",
      "<b>%d occurrences</b> (1 declaration + 2 appelants), regle ecrite <b>%d fois</b>"
      % (APPELS, REGLE_P)],
     ["Source : perimetre", "regle &laquo; grammes seuls &raquo; toujours ecrite <b>%d fois</b>" % GRAMMES]],
    [62 * mm, 103 * mm]))

F.append(Spacer(1, 6))
F.append(encadre(
    "DEUX PIEGES D'OUTILLAGE, REPAYES",
    "<b>(1) La passe de REFERENCE a attrape une regex trop stricte &mdash; avant la moindre "
    "mutation.</b> Mon temoin de perimetre comptait les 5 sites avec " + C % '\\|\\|' + " sans "
    "espaces ; or " + C % '_provFood' + " @1232 ecrit " + C % "(!_afSrc.u || _afSrc.u==='g')" +
    " <b>avec</b> des espaces, les quatre autres sans. Il comptait <b>4 au lieu de 5</b> et serait "
    "parti rouge en passe complete."
    "<br/>=&gt; <b><i>Un temoin de source se verifie d'abord contre le code SAIN : s'il rougit "
    "la, il ne mesure pas ce qu'il croit.</i></b>"
    "<br/><br/><b>(2) Une mutation a encore TUE la sonde au lieu de la faire rougir</b> "
    "(&sect;61, 3<super>e</super> fois recensee) : retirer le garde " + C % 'src || {}' + " fait "
    "<b>lever</b> " + C % '_qReprenable(null)' + ", l'" + C % 'evaluate' + " entier est rejete et "
    "<b>le bloc disparait sans rougir</b>. Temoin mis sous " + C % 'try/catch' + " avec un message "
    "nomme &mdash; la mutation fait desormais <b>1 rouge, exactement lui</b>.", ORANGE))

# ── 7 ──
F.append(P("7. Ce qui reste", 'h1'))
F.append(tableau(
    ["sujet", "etat"],
    [["Les <b>8 sous-etapes restantes</b>",
      "ecrites, ordonnees et dependancees dans " + C % 'docs/SOUS-ETAPES-1B-3.md' +
      ". /!\ <b>1b-ii et 1b-iv portent un PREREQUIS de sonde</b> &mdash; et le cas de 3-i "
      "montre qu'il faut <b>ouvrir la sonde</b> pour en juger, pas lire l'etiquette"],
     ["Les <b>4 harmonisations</b>",
      "<b>decisions produit</b>, elles attendent Michel. Critere : <i>est-ce que ca modifie ce qui "
      "est ECRIT dans " + C % 'S.foodLog' + " / " + C % 'S.savedFoods' + " ?</i>"],
     ["Le <b>hub</b> (etape 4) et la <b>douane</b> (etape 5)", "<b>apres</b> 1b et 3"],
     [C % 'S.savedFoods' + " &middot; l'ecart <b>48,3 / 48</b>", "<b>ouverts</b>, non corriges"],
     ["L'historique, les migrations", "<b>non touches</b>"]],
    [50 * mm, 115 * mm]))

F.append(Spacer(1, 10))
F.append(P("Document genere depuis le code et la sonde servis &mdash; <b>tous les decomptes cites "
           "sont recomptes a chaque generation</b> (%d appels, %d ecriture de la regle, %d sites "
           "grammes, %d portes, %d cles de sonde). <b>Huit gardes</b> refusent de produire si un "
           "fait tombe &mdash; dont un qui verifie que le constat du &sect;3 est <b>encore vrai</b>, "
           "et un qui verifie que le perimetre n'a <b>pas</b> deborde. "
           % (APPELS, REGLE_P, GRAMMES, PORTES, SONDES) +
           "/!\ <b>Et on compte les CLES DISTINCTES de l'instantane, pas les lignes</b> "
           "(13 affectations pour %d cles : une cle est assignee dans un " % SONDES + C % 'try' +
           " et dans son " + C % 'catch' + ") &mdash; <i>compter les lignes aurait ete exactement "
           "l'erreur que ce document denonce</i>. Source : " + C % 'tools/gen_3i_pdf.py' + ".",
           'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=23 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker - sous-etape 3-i, et la sonde qui ne couvrait rien',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK -> %s (%d Ko)' % (OUT, os.path.getsize(OUT) // 1024))
