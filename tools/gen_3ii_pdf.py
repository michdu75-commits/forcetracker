#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/SOUS-ETAPE-3II.pdf — la pastille « ta derniere quantite », un proprietaire qui
   rend un NOMBRE, et un defaut reel trouve par la sonde et volontairement NON corrige.
   Onzieme document de la serie.

TOUS LES DECOMPTES SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI.
Les deux affirmations les plus fragiles ont chacune leur garde : la regle « grammes seuls »
reste ecrite exactement 3 fois (donc 3-iii et 3-iv n'ont PAS ete faites au passage), et
`_qGrammes` ne contient AUCUNE mention de portion (donc elle n'a pas ete fondue avec
`_qReprenable`, ce qui serait un changement de comportement).

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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'SOUS-ETAPE-3II.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
SONDE = open(os.path.join(ROOT, 'tools', 'instantane_1b23.js'), encoding='utf-8').read()
DEC = open(os.path.join(ROOT, 'docs', 'SOUS-ETAPES-1B-3.md'), encoding='utf-8').read()
JDT = open(os.path.join(ROOT, 'docs', 'JOURNAL-DE-TEST.md'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = '(ft-v\d+)'", SW) or [None, '?'])[1]

# Mesure du 12/09 : instantane identique avant/apres l'extraction 3-ii.
SHA_INSTANTANE = 'b8f06e45d8c91fcc'


def _commentaire(l):
    x = l.strip()
    return x.startswith('*') or x.startswith('//') or x.startswith('/*') or x.startswith('`')


LA = [l for l in APP.split('\n') if not _commentaire(l)]


# ── LES DECOMPTES, REFAITS ICI ───────────────────────────────────────────────
APPELS = len([l for l in LA if '_qGrammes(' in l])

_m = re.search(r'function _qGrammes\(src\)\{[\s\S]*?\n\}', APP)
CORPS = _m.group(0) if _m else ''
_r = re.search(r'function _qReprenable\(src\)\{[\s\S]*?\n\}', APP)
CORPS_REPR = _r.group(0) if _r else ''

# La regle « grammes seuls » ECRITE a la main — le compteur du temoin de perimetre CCXCIII.
# 3 aujourd'hui : 2 ouvertures du bloc code-barres (3-iii) + 1 ecriture dans _provFood (3-iv).
GRAMMES_SEULS = len([l for l in LA
                     if re.search(r"q>0\s*&&\s*\(!\w+\.u\s*\|\|\s*\w+\.u\s*===?\s*'g'\)", l)])

CLES = sorted(set(re.findall(r"out\['([^']+)'\]", SONDE)))

SOUS = re.findall(r'^### (1b-[iv]+|3-[iv]+)\b(.*)$', DEC, re.M)
TOTAL_SE = len(SOUS)
LIVREES = len([t for t in SOUS if 'LIVR' in t[1].upper()])
ECARTEES = len([t for t in SOUS if 'CART' in t[1].upper()])
RESTANTES = TOTAL_SE - LIVREES - ECARTEES

# CHAQUE GARDE PROTEGE UNE AFFIRMATION DU DOCUMENT.
if APPELS != 3:
    raise SystemExit('`_qGrammes` a %d occurrences hors commentaires, pas 3 '
                     '(1 declaration + 2 appelants) : le §2 cite ce chiffre.' % APPELS)
if not CORPS or not CORPS_REPR:
    raise SystemExit('`_qGrammes` ou `_qReprenable` a disparu : le §4 affirme qu elles restent DEUX.')
if 'portion' in CORPS:
    raise SystemExit('PERIMETRE ROMPU : `_qGrammes` mentionne les portions. Le §4 affirme qu elle '
                     'les REFUSE, et les fondre avec `_qReprenable` serait un changement de '
                     'comportement, pas une extraction.')
if "'portion'" not in CORPS_REPR:
    raise SystemExit('`_qReprenable` n accepte plus les portions : les deux regles ont ete '
                     'harmonisees, ce que le §4 declare interdit.')
if 'return (+s.q > 0 && (!s.u || s.u === \'g\')) ? +s.q : 0;' not in CORPS:
    raise SystemExit('`_qGrammes` ne rend plus un NOMBRE (la quantite, ou 0) : le §3 demontre que '
                     'c est ce choix qui evite une duplication en 3-iii et 3-iv.')
if GRAMMES_SEULS != 3:
    raise SystemExit('La regle « grammes seuls » est ecrite %d fois, pas 3 : 3-iii ou 3-iv a ete '
                     'faite au passage, ce que le §5 declare NON fait.' % GRAMMES_SEULS)
if len(CLES) != 17:
    raise SystemExit('La sonde porte %d cles, pas 17 : le §6 cite ce chiffre.' % len(CLES))
for k in ('3ii_pastille_quickFillFood', '3ii_pastille_afSuggPrendreLocale'):
    if k not in CLES:
        raise SystemExit('La sonde ne LIT plus la pastille (%s manque) : le §6 raconte precisement '
                         'que les portes etaient conduites sans etre observees.' % k)
if 'SURVIT' not in JDT[:3000].upper() or 'MESUR' not in JDT[:3000].upper():
    raise SystemExit('L entree du defaut de la pastille a disparu du journal de test : le §6 '
                     'affirme qu il est MESURE, ECRIT et non corrige (R30).')
if '_afOublierAliment' not in JDT[:3000]:
    raise SystemExit('La cause nommee du defaut (`_afOublierAliment`) n est plus dans le journal '
                     'de test : le §6 la cite.')
if TOTAL_SE != 10 or ECARTEES != 1 or RESTANTES != 4:
    raise SystemExit('Le decoupage porte %d sous-etapes, %d ecartee(s), %d restante(s) — '
                     'pas 10 / 1 / 4.' % (TOTAL_SE, ECARTEES, RESTANTES))

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
                      'Force Tracker — la pastille « ta derniere quantite » (%s) — 12/09/2026'
                      % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


AVANT = """// AVANT — la meme regle, recopiee par DEUX sites (@2878 et @4033)

// quickFillFood — on reprend un aliment depuis « Mes aliments »
_bcProposerDerniere((+it.q>0 && (!it.u||it.u==='g')) ? +it.q : 0);

// _afSuggPrendreLocale — on reprend un aliment depuis la recherche du journal
_bcProposerDerniere((+e.q>0 && (!e.u||e.u==='g')) ? +e.q : 0);"""

APRES = """// APRES — un seul proprietaire, qui rend un NOMBRE

function _qGrammes(src){
  const s = src || {};
  return (+s.q > 0 && (!s.u || s.u === 'g')) ? +s.q : 0;
}

_bcProposerDerniere(_qGrammes(it));   // quickFillFood
_bcProposerDerniere(_qGrammes(e));    // _afSuggPrendreLocale

// La regle voisine, qui RESTE separee :
function _qReprenable(src){
  const s = src || {};
  return (+s.q > 0 && (!s.u || s.u === 'g' || s.u === 'portion'));
}"""

SITES = """// LES 5 SITES « GRAMMES SEULS », CARTOGRAPHIES AVANT D'EXTRAIRE
// Ils se ressemblent — ils n'ont PAS la meme forme, donc pas la meme sous-etape.

@1232  _provFood   if(cond){ p.q=+_afSrc.q; p.u='g'; }        // ECRIT une donnee   -> 3-iv
@2878  quickFillFood          (cond) ? +it.q : 0              // produit une VALEUR -> 3-ii  *
@4033  _afSuggPrendreLocale   (cond) ? +e.q  : 0              // produit une VALEUR -> 3-ii  *
@2929  quickFillFood          if(!_bcNutr && cond){ ... }     // OUVRE un bloc      -> 3-iii
@4089  _afSuggPrendreLocale   if(!_bcNutr && cond){ ... }     // OUVRE un bloc      -> 3-iii

// * les DEUX seules strictement identiques. Le test d'entree porte sur la FORME,
//   pas sur la ressemblance du predicat."""

SONDE_TXT = """// LA SONDE : LES PORTES ETAIENT CONDUITES, MAIS RIEN NE LES OBSERVAIT

// Depuis 1b-ii, la sonde APPELLE bien quickFillFood et _afSuggPrendreLocale.
// Mais aucune de ses 15 cles ne LISAIT #af-bc-last, l'element de la pastille.
// => l'instantane serait reste identique quoi qu'on fasse a la pastille.
//    CONDUIRE N'EST PAS OBSERVER.

// 1er jet des 2 nouvelles cles : les 6 cas rendaient tous « 150 g ».
// Cause : le site vit DANS un garde —  if(P && it.u!=='portion' && ...)  ou P = it.per100
// Mes fixtures n'avaient pas de per100 -> le bloc etait saute -> je lisais un reliquat.
// => une sonde qui n'atteint pas la ligne visee mesure l'ecran d'AVANT, pas la regle.
//    Et elle est VERTE."""


# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P("La pastille &laquo; ta derniere quantite &raquo;", 'titre'))
F.append(P("Force Tracker &mdash; 12/09/2026, " + C % VERSION + ". Onzieme document de la serie, "
           "sous-etape <b>3-ii</b>. Meme discipline que les precedentes : au moins deux copies "
           "avant d'extraire &middot; la sonde ouverte et verifiee <b>avant</b> le BEFORE &middot; "
           "uniquement ce qui est strictement identique &middot; aucune harmonisation au passage "
           "&middot; instantane identique octet pour octet.", 'sous'))

F.append(encadre(
    "LES DEUX FAITS DE CETTE VERSION",
    "<b>(1) Le proprietaire rend un NOMBRE, pas un booleen</b> &mdash; et ce choix n'est pas "
    "cosmetique : " + C % '_qGrammes(x) &gt; 0' + " <i>est</i> exactement la condition que deux "
    "autres sous-etapes utiliseront, donc <b>3-iii et 3-iv lui ajouteront leurs appelants sans "
    "reecrire la regle</b>. Un booleen aurait oblige a ecrire une seconde fonction pour la valeur."
    "<br/><br/><b>(2) En etendant la sonde, j'ai trouve un vrai defaut &mdash; et je ne l'ai PAS "
    "corrige.</b> La pastille survit a l'aliment suivant. C'est la <b>jumelle exacte</b> du defaut "
    "du paquet ferme en ft-v1193, sur l'autre pastille (R8). Mesure, ecrit avec son correctif d'une "
    "ligne, laisse a Michel : <i>une extraction ne change aucun comportement, c'est son critere.</i>"))

# ── 1 ──
F.append(P("1. Le test d'entree : 5 sites qui se ressemblent, 2 qui sont identiques", 'h1'))
F.append(P("La regle &laquo; cette quantite est-elle en grammes utilisables ? &raquo; est ecrite a "
           "cinq endroits. La tentation est de les prendre tous. <b>Mesure faite avant la premiere "
           "ligne</b> : trois d'entre eux n'ont pas la meme <b>forme</b> &mdash; l'un <i>ecrit</i> "
           "une donnee, deux <i>ouvrent</i> un bloc, deux seulement <i>produisent une valeur</i>.", 'p'))
F.append(bloc_code(SITES))
F.append(P("=&gt; <b>Le test d'entree porte sur la forme, pas sur la ressemblance du predicat.</b> "
           "Prendre les cinq d'un coup aurait fait trois extractions dans une seule sous-etape, "
           "donc un retour arriere qui ne peut plus etre partiel.", 'petit'))

# ── 2 ──
F.append(P("2. Ce qui est extrait", 'h1'))
F.append(bloc_code(AVANT))
F.append(bloc_code(APRES))
F.append(P("Occurrences dans le code servi, hors commentaires : <b>%d</b> "
           "(1 declaration + 2 appelants)." % APPELS, 'petit'))

# ── 3 ──
F.append(P("3. Pourquoi un NOMBRE et pas un booleen", 'h1'))
F.append(tableau(
    ["choix", "ce qu'il coute plus tard"],
    [["booleen " + C % '_qGrammesOk(x)',
      "3-iii et 3-iv ont besoin du <b>test</b>, 3-ii avait besoin de la <b>valeur</b>. Avec un "
      "booleen, il faudrait <b>deux fonctions</b> qui portent la meme regle &mdash; <i>exactement "
      "la duplication que ce chantier supprime</i>."],
     ["nombre " + C % '_qGrammes(x)',
      "la valeur pour 3-ii, et " + C % '_qGrammes(x) &gt; 0' + " comme test pour les deux autres. "
      "<b>Une seule regle, trois usages.</b>"]],
    [42 * mm, 123 * mm]))
F.append(P("<b>La regle generale</b> : quand une meme condition sert tantot a <i>decider</i> tantot "
           "a <i>fournir</i>, le proprietaire rend la <b>donnee</b> &mdash; le test s'en deduit, "
           "l'inverse est faux.", 'p'))

F.append(PageBreak())

# ── 4 ──
F.append(P("4. Ce qui reste volontairement divergent", 'h1'))
F.append(tableau(
    ["ce qui reste dehors", "pourquoi"],
    [[C % '_qReprenable' + " (3-i)",
      "elle <b>accepte les portions</b>, " + C % '_qGrammes' + " les <b>refuse</b> &mdash; ses "
      "appelants alimentent un champ <b>en grammes</b>. Les deux se ressemblent a un " + C % '||'
      + " pres et <b>ne disent pas la meme chose</b> : les fondre serait un <b>changement de "
      "comportement</b>, pas une extraction. <b>Deux temoins de perimetre, dans les deux sens.</b>"],
     ["les 3 autres sites &laquo; grammes seuls &raquo;",
      "formes differentes (une ecriture, deux ouvertures de bloc). Ils partiront en <b>3-iii</b> et "
      "<b>3-iv</b>, chacun a son tour. Recompte a l'instant : la regle est encore ecrite <b>%d fois</b>."
      % GRAMMES_SEULS],
     ["les " + C % 'ml',
      "refuses, et ce n'est pas un oubli : <b>sans densite, un volume ne dit pas ce que PESE "
      "l'aliment</b>, et on n'invente pas une densite (R29)."]],
    [48 * mm, 117 * mm]))

F.append(encadre(
    "LE TEMOIN DE PERIMETRE DE 3-i SE DEPLACE, IL N'EST PAS SUPPRIME",
    "Il exigeait <i>&laquo; la regle grammes seuls est ecrite <b>5</b> fois &raquo;</i> &mdash; "
    "c'etait le garde-fou qui empechait 3-i de deborder. 3-ii ayant ete faite <b>expres</b>, il "
    "exige maintenant <b>3 ecritures + 2 appelants</b>, avec la raison ecrite a l'endroit exact et "
    "ce que deviendra le compte apres 3-iii et 3-iv."
    "<br/><br/>=&gt; <b>Deuxieme fois qu'un temoin se deplace au lieu de disparaitre</b> (le premier "
    "en 3-i). <i>La difference entre un temoin qu'on retire et un temoin qui se deplace se MESURE</i> : "
    "les mutations qui le faisaient rougir avant le font toujours rougir, par l'autre bout.", VERT))

# ── 5 ──
F.append(P("5. La sonde : deux pieges, dont un nouveau", 'h1'))
F.append(bloc_code(SONDE_TXT))
F.append(encadre(
    "CONDUIRE N'EST PAS OBSERVER",
    "Depuis la sous-etape precedente, la sonde <b>appelait</b> deja les deux portes. Il etait donc "
    "tentant de la declarer &laquo; couverte &raquo; &mdash; c'est meme ce que l'etiquette du plan "
    "disait. <b>Mais aucune de ses cles ne lisait l'element de la pastille.</b>"
    "<br/><br/>=&gt; L'instantane, qui est le <b>critere de reussite binaire</b> de chaque sous-etape, "
    "serait reste identique <b>quoi qu'on fasse a la pastille</b>. Etendue de <b>15 a %d cles</b> "
    "<i>avant</i> de capturer le BEFORE &mdash; l'etendre apres aurait donne un avant/apres "
    "incomparable." % len(CLES), ORANGE))
F.append(P("<b>Le second piege est plus discret</b> : mes six premiers cas rendaient tous la meme "
           "valeur. Pas parce que la regle etait fausse &mdash; parce que la ligne visee vit "
           "<b>dans un garde</b> que mes fixtures ne franchissaient pas. =&gt; <b><i>Une sonde qui "
           "n'atteint pas la ligne visee mesure l'ecran d'avant, pas la regle &mdash; et elle est "
           "verte.</i></b>", 'p'))

# ── 6 ──
F.append(P("6. Le defaut reel trouve en chemin, et non corrige", 'h1'))
F.append(tableau(
    ["geste", "pastille affichee"],
    [["reprendre un aliment <b>en grammes</b> (150 g)", C % '&lt;- 150 g' + " &mdash; correct"],
     ["appeler " + C % '_afOublierAliment()' + " seule",
      "<b>" + C % '&lt;- 150 g' + " &mdash; elle reste</b>"],
     ["puis reprendre un aliment <b>en portions</b>",
      "<b>" + C % '&lt;- 150 g' + " &mdash; sur le mauvais aliment</b>"]],
    [78 * mm, 87 * mm]))
F.append(P("<b>Cause nommee</b> : " + C % '_bcProposerDerniere(0)' + " n'est appelee que par "
           + C % 'openAddFood()' + ", donc la pastille se rend <b>a l'ouverture de l'ecran</b>, "
           "jamais <b>entre deux aliments</b> d'une meme ouverture. Et le site qui la repose est "
           "dans un garde : quand il est faux (aliment en portions, ou sans pour-100 g), personne "
           "ne la touche.", 'p'))
F.append(encadre(
    "C'EST LA JUMELLE EXACTE DU DEFAUT FERME EN ft-v1193 (R8)",
    "A cette date, " + C % '_afOublierAliment' + " a ete completee pour rendre le <b>poids du "
    "paquet</b> &mdash; <i>la pastille jumelle</i>. Celle-ci <b>n'a pas recu le meme traitement</b>. "
    "La porte jumelle, a l'interieur meme du correctif qui a ferme sa soeur."
    "<br/><br/><b>Pourquoi ca ne s'est pas vu plus tot</b> : sur le chemin le plus courant (deux "
    "aliments avec un pour-100 g, comptes en grammes), le garde est vrai les deux fois, la pastille "
    "est repeinte et rien ne fuit. <i>Il faut un aliment en portions en deuxieme position.</i>"
    "<br/><br/>=&gt; <b>Non corrige ici, et la raison est la methode</b> : poser l'appel manquant "
    "<b>changerait ce que l'ecran affiche</b>. C'est un correctif, pas un rangement. Mesure, ecrit "
    "dans le journal de test avec son correctif d'une ligne, laisse a Michel."))

# ── 7 ──
F.append(P("7. Les mesures", 'h1'))
F.append(tableau(
    ["preuve", "resultat"],
    [["Instantane, avant / apres",
      "<b>identique octet pour octet</b>, sha256 " + C % SHA_INSTANTANE + ", diff vide"],
     ["Controle negatif", "<b>11 mutations, TOUTES mordent</b> &mdash; controle sain <b>a 0 rouge</b>, "
      "lance <b>en premier</b>. Ancrees sur la <b>signature</b> de " + C % '_qGrammes' + ", parce que "
      + C % '_qReprenable' + " porte un motif tres proche et vit <b>juste apres</b> dans le fichier "
      "(le piege paye a la sous-etape precedente)"],
     ["Passe complete", "<b>3633 / 3633</b> &mdash; <b>total predit = total obtenu</b> (3620 + 13)"],
     ["Autres bancs", "calculs 339/339 &middot; muscles 241/241 &middot; croises 50/50 &middot; "
      "dates 9/9 &middot; donnees : aucun trou nouveau"],
     ["Source : proprietaire unique", "%d occurrences hors commentaires" % APPELS],
     ["Source : perimetre intact",
      "la regle &laquo; grammes seuls &raquo; encore ecrite <b>%d fois</b> &mdash; 3-iii et 3-iv "
      "<b>non faites</b>" % GRAMMES_SEULS],
     ["Ecran", "<b>rien ne change</b> &mdash; regle d'or #11 : aucune annonce"]],
    [42 * mm, 123 * mm]))

# ── 8 ──
F.append(P("8. Etat du decoupage", 'h1'))
F.append(tableau(
    ["", ""],
    [["Sous-etapes reelles restantes avant le hub", "<b>%d</b> &mdash; sur %d au plan, %d livrees, "
      "%d ecartee : " % (RESTANTES, TOTAL_SE, LIVREES, ECARTEES)
      + C % '1b-v' + ", " + C % '3-iii' + ", " + C % '3-iv' + ", " + C % '3-v'],
     ["La pastille qui survit", "<b>mesuree, non corrigee</b> &mdash; dans le journal de test, "
      "avec sa cause et son correctif d'une ligne"],
     ["Les 4 harmonisations", "<b>decisions produit</b>, elles attendent Michel. Critere : est-ce que "
      "ca modifie ce qui est ECRIT dans le journal alimentaire ?"],
     ["Le hub et la douane", "apres, consigne explicite inchangee"],
     ["Favoris perdus entre onglets, ecart 48,3 / 48", "ouverts, non corriges"],
     ["Historique, migrations", "non touches"]],
    [58 * mm, 107 * mm]))

F.append(Spacer(1, 8))
F.append(P(("Document genere depuis le code servi &mdash; tous les decomptes cites sont recomptes a "
            "chaque generation (%d occurrences du proprietaire, %d ecritures restantes de la regle "
            "&laquo; grammes seuls &raquo;, %d cles dans la sonde, %d sous-etapes restantes). "
            % (APPELS, GRAMMES_SEULS, len(CLES), RESTANTES)) +
           "<b>Onze gardes refusent de produire si un fait tombe</b> &mdash; dont un qui verifie que "
           + C % '_qGrammes' + " ne mentionne <b>aucune</b> portion (donc qu'elle n'a pas ete fondue "
           "avec " + C % '_qReprenable' + "), un qui verifie qu'elle rend toujours un <b>nombre</b>, "
           "un qui verifie que la regle est <b>encore ecrite 3 fois</b> (donc que 3-iii et 3-iv n'ont "
           "pas ete faites au passage), et deux qui verifient que la sonde <b>lit</b> vraiment la "
           "pastille. Source : " + C % 'tools/gen_3ii_pdf.py' + ".", 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=23 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker - la pastille ta derniere quantite',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK -> %s (%d Ko)' % (OUT, os.path.getsize(OUT) // 1024))
