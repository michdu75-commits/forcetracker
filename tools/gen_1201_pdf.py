#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/SOUS-ETAPE-3III.pdf — le bloc « poids repris en grammes », la promesse de 3-ii
   tenue, et deux blocs mutuellement exclusifs. Treizieme document de la serie.

TOUS LES DECOMPTES SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI.
La garde la plus importante est celle du PERIMETRE : `_bcNutr` ne doit PAS etre entre dans le
proprietaire — et c'est la seule derive de ce chantier qui soit INVISIBLE a l'execution.

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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'SOUS-ETAPE-3III.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
SONDE = open(os.path.join(ROOT, 'tools', 'instantane_1b23.js'), encoding='utf-8').read()
RUN = open(os.path.join(ROOT, 'tests', 'parcours', 'runner.js'), encoding='utf-8').read()
DEC = open(os.path.join(ROOT, 'docs', 'SOUS-ETAPES-1B-3.md'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = '(ft-v\d+)'", SW) or [None, '?'])[1]
SHA_INSTANTANE = '57b13433fbaa1c60'

# ── LE CODE SANS SES BLOCS DE COMMENTAIRE — la lecon de ft-v1200, appliquee d'avance ici :
#    un compteur ligne-a-ligne trouvait 5 occurrences de `_qGrammes` la ou il y en a 4.
CODE = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), APP)


def corps(nom):
    m = re.search(r'function ' + nom + r'\(\w*\)\{[\s\S]*?\n\}', CODE)
    return m.group(0) if m else ''


# ── LES DECOMPTES, REFAITS ICI ───────────────────────────────────────────────
C_OWNER = corps('_afReprendreGrammes')
N_OWNER = len(re.findall(r'_afReprendreGrammes\(', CODE))
N_QG = len(re.findall(r'_qGrammes\(', CODE))
ECRITURES = len([l for l in CODE.split('\n')
                 if re.search(r"q>0\s*&&\s*\(!\w+\.u\s*\|\|\s*\w+\.u\s*===?\s*'g'\)", l)])
C_QREPRENABLE = corps('_qReprenable')
CLES = sorted(set(re.findall(r"out\['([^']+)'\]", SONDE)))
# 15 appels ECRITS ; 17 temoins a l'EXECUTION (deux vivent dans une boucle de 2 tours).
N_TEMOINS_ECRITS = len(re.findall(r"t\('CCXCVIII ", RUN))

SOUS = re.findall(r'^### (1b-[iv]+|3-[iv]+)\b(.*)$', DEC, re.M)
TOTAL_SE = len(SOUS)
LIVREES = len([t for t in SOUS if 'LIVR' in t[1].upper()])
ECARTEES = len([t for t in SOUS if 'CART' in t[1].upper()])
RESTANTES = TOTAL_SE - LIVREES - ECARTEES

# CHAQUE GARDE PROTEGE UNE AFFIRMATION DU DOCUMENT.
if not C_OWNER:
    raise SystemExit('`_afReprendreGrammes` est introuvable : tout le document parle d elle.')
if '_bcNutr' in C_OWNER:
    raise SystemExit('PERIMETRE ROMPU : `_bcNutr` est ENTRE dans le proprietaire. Le §3 demontre '
                     'que c est une question sur l ETAT DE L ECRAN, pas sur la quantite — et que '
                     'cette derive est INVISIBLE a l execution.')
if '_afPoidsPose' in C_OWNER:
    raise SystemExit('PERIMETRE ROMPU : `_afPoidsPose` est pose dans le proprietaire — la '
                     'regression ft-v1176 rejouee. Le §5 affirme le contraire.')
if '_qGrammes(' not in C_OWNER:
    raise SystemExit('Le proprietaire REECRIT la regle au lieu d appeler `_qGrammes` : le §2 '
                     'affirme que 3-ii tient sa promesse ici.')
if N_OWNER != 3:
    raise SystemExit('`_afReprendreGrammes` a %d occurrences, pas 3 (1 declaration + 2 appels) : '
                     'le §2 cite ce chiffre.' % N_OWNER)
if N_QG != 4:
    raise SystemExit('`_qGrammes` a %d occurrences hors commentaires, pas 4 : le §4 cite ce '
                     'chiffre, et c est celui qu un compteur aveugle avait rate.' % N_QG)
if ECRITURES != 1:
    raise SystemExit('La regle « grammes seuls » est ecrite %d fois, pas 1 : 3-iv a ete faite au '
                     'passage, ce que le §6 declare NON fait.' % ECRITURES)
if "'portion'" not in C_QREPRENABLE:
    raise SystemExit('HORS PERIMETRE ROMPU : `_qReprenable` n accepte plus les portions.')
if len(CLES) != 19:
    raise SystemExit('La sonde porte %d cles, pas 19 : le §4 cite ce chiffre.' % len(CLES))
for k in ('3iii_poids_quickFillFood', '3iii_poids_afSuggPrendreLocale'):
    if k not in CLES:
        raise SystemExit('La sonde n OBSERVE plus le trio (%s manque) : le §4 raconte precisement '
                         'qu elle conduisait sans observer.' % k)
if N_TEMOINS_ECRITS != 15:
    raise SystemExit('Le bloc CCXCVIII porte %d appels ecrits, pas 15 : le §5 cite ce chiffre '
                     '(17 a l execution, deux vivent dans une boucle).' % N_TEMOINS_ECRITS)
if TOTAL_SE != 10 or LIVREES != 6 or ECARTEES != 1 or RESTANTES != 3:
    raise SystemExit('Le decoupage porte %d sous-etapes, %d livrees, %d ecartee(s), %d restante(s) '
                     '— pas 10 / 6 / 1 / 3.' % (TOTAL_SE, LIVREES, ECARTEES, RESTANTES))

# ⛔⛔ LE TOTAL DE LA PASSE NE S'ECRIT PAS A LA MAIN, IL SE LIT DANS LE JOURNAL DE LA PASSE.
#    C'est le chiffre le plus facile a inventer de tout le document : il est attendu, il est rond,
#    et personne ne le reverifie. Ma 1re version l'avait ecrit en dur PENDANT que la passe tournait
#    encore — donc une valeur esperee presentee comme mesuree.
#    => Le document refuse de se produire tant que le journal ne porte pas un total REEL, et il
#       recopie CE total, pas celui que j'avais en tete.
PASSE = os.environ.get('FT_PASSE') or '/tmp/passe1201.log'
try:
    _log = open(PASSE, encoding='utf-8', errors='replace').read()
except Exception:
    raise SystemExit('Journal de passe introuvable (%s) : le §5 cite un total, il doit etre LU.' % PASSE)
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
                      'Force Tracker — le bloc « poids repris en grammes » (%s) — 13/09/2026'
                      % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()



AVANT = """// AVANT — la meme condition ET le meme corps, ecrits DEUX fois

// quickFillFood — reprise depuis « Mes aliments »
if(!_bcNutr && +it.q>0 && (!it.u||it.u==='g')){
  _afUnite='g'; _afPoidsDeclare=+it.q;
  _afQtyNom=_afNomCourant();
}

// _afSuggPrendreLocale — reprise depuis la recherche du journal
if(!_bcNutr && +e.q>0 && (!e.u||e.u==='g')){
  _afUnite='g'; _afPoidsDeclare=+e.q;
  _afQtyNom=_afNomCourant();
}"""

APRES = """// APRES — un proprietaire, et le garde reste CHEZ LES APPELANTS

function _afReprendreGrammes(src){
  const g = _qGrammes(src);            // <- 3-ii tient sa promesse : la regle n'est pas reecrite
  if(!(g > 0)) return false;
  _afUnite = 'g'; _afPoidsDeclare = g;
  _afQtyNom = _afNomCourant();
  return true;
}

if(!_bcNutr) _afReprendreGrammes(it);   // quickFillFood
if(!_bcNutr) _afReprendreGrammes(e);    // _afSuggPrendreLocale
   ^^^^^^^^ le garde n'entre PAS dans le proprietaire"""

EXCLUSIFS = """// LA MESURE QUI A DECIDE DES FIXTURES — et qui n'etait pas dans le plan

// Dans quickFillFood, DANS CET ORDRE :
const P = it.per100;
if(P && it.u!=='portion' && (+P.kcal>0 || ...)){
   _bcNutr = _ref100(...);                 // <- 3-ii POSE _bcNutr
   ...
   _bcProposerDerniere(_qGrammes(it));     // <- le site de 3-ii
}
if(!_bcNutr) _afReprendreGrammes(it);      // <- le site de 3-iii, garde par la MEME variable

// => LES DEUX BLOCS SONT MUTUELLEMENT EXCLUSIFS SUR LA MEME ENTREE.
//    Pour atteindre 3-iii il faut un aliment SANS pour-100 g.
//    Des fixtures recopiees de 3-ii n'auraient jamais franchi le garde,
//    et les six cas auraient rendu la meme valeur — vertes et vides."""

COMPTEUR = """// UN COMPTEUR AVEUGLE, ATTRAPE AVANT DE PUBLIER LE CHIFFRE

// filtre ligne-a-ligne (celui du bloc voisin) :
//   on retire les lignes qui COMMENCENT par  *  //  /*  ou un accent grave
// -> il trouve 5 occurrences de `_qGrammes`

// Or le docblock du nouveau proprietaire ecrit, sur une ligne de continuation :
//     s'ecrit `_qGrammes(src) > 0` sans reecrire la regle une 3e fois.
//     ^ commence par un MOT : elle survit au filtre, et porte le motif cherche.

// -> hors blocs de commentaire ENTIERS : 4. C'est le chiffre juste.
//    (1 declaration + 2 pastilles de 3-ii + le proprietaire de 3-iii)"""


# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P("Le bloc &laquo; poids repris en grammes &raquo;", 'titre'))
F.append(P("Force Tracker &mdash; 13/09/2026, " + C % VERSION + ". Treizieme document de la serie, "
           "sous-etape <b>3-iii</b>. Michel relance le chantier apres le correctif separe, avec une "
           "regle nouvelle qui en est tiree : <i>&laquo; si un defaut reel est decouvert pendant une "
           "extraction : le mesurer &middot; l'ecrire au journal avec sa cause &middot; ne pas le "
           "corriger dans la sous-etape &middot; attendre un feu vert separe &raquo;</i>.", 'sous'))

F.append(encadre(
    "LES DEUX FAITS DE CETTE SOUS-ETAPE",
    "<b>(1) C'est elle qui tient la promesse de la precedente.</b> " + C % '_qGrammes' + " rend un "
    "<b>NOMBRE</b> et non un booleen &mdash; un choix qui paraissait gratuit il y a deux versions. "
    "Il se paie ici : la condition s'ecrit " + C % '_qGrammes(src) &gt; 0' + " <b>sans reecrire la "
    "regle une troisieme fois</b>."
    "<br/><br/><b>(2) La derive de perimetre de cette version est INVISIBLE a l'execution.</b> "
    "Absorber le garde voisin dans le proprietaire ne change <b>aucun</b> comportement : la mutation "
    "qui le fait passe tous les temoins de comportement, et ne rougit que sur le <b>temoin de "
    "source</b>. <i>C'est la premiere fois de ce chantier &mdash; et c'est exactement pourquoi les "
    "temoins de source existent a cote des autres.</i>"))

# ── 1 ──
F.append(P("1. Le test d'entree, passe sur les DEUX moities", 'h1'))
F.append(P("Le plan ne parlait que de la <b>condition</b>. Mesure faite avant la premiere ligne : le "
           "<b>corps</b> de trois lignes est lui aussi ecrit <b>deux fois, a l'identique</b> &mdash; "
           "au nom de variable pres. <b>2 copies de chacun.</b>", 'p'))
F.append(bloc_code(AVANT))
F.append(bloc_code(APRES))
F.append(P("Occurrences dans le code servi, hors commentaires : " + C % '_afReprendreGrammes'
           + " <b>%d</b> (1 declaration + 2 appels)." % N_OWNER, 'petit'))

# ── 2 ──
F.append(P("2. Pourquoi 3-ii avait refuse de rendre un booleen", 'h1'))
F.append(tableau(
    ["si " + C % '_qGrammes' + " rendait&hellip;", "ce que 3-iii aurait coute"],
    [["un <b>booleen</b>",
      "la condition serait couverte, mais le proprietaire de 3-iii aurait besoin de la <b>valeur</b> "
      "&mdash; donc d'une <b>seconde fonction</b> portant la meme regle. <i>La duplication reapparait "
      "par l'autre bout.</i>"],
     ["un <b>nombre</b> (le choix fait)",
      C % '_qGrammes(src) &gt; 0' + " <b>est</b> la condition, et " + C % 'g' + " <b>est</b> la "
      "valeur. <b>Une seule regle, deux usages, zero reecriture.</b>"]],
    [44 * mm, 121 * mm]))
F.append(P("=&gt; <b><i>Quand une meme condition sert tantot a decider tantot a fournir, le "
           "proprietaire rend la DONNEE</i></b> &mdash; le test s'en deduit, l'inverse est faux. "
           "La regle avait ete ecrite il y a deux versions ; c'est ici qu'elle se verifie.", 'petit'))

F.append(PageBreak())

# ── 3 ──
F.append(P("3. Le perimetre : un garde qui ne part pas, et une derive invisible", 'h1'))
F.append(P("Le garde " + C % '!_bcNutr' + " dit <i>&laquo; aucun pour-100 g n'est pose &raquo;</i> "
           "&mdash; une question sur l'<b>etat de l'ecran</b>, pas sur la quantite de la ligne. "
           "L'absorber ferait <b>deux extractions en une</b>, et rendrait le proprietaire dependant "
           "d'une variable globale que ses appelants controlent.", 'p'))
F.append(encadre(
    "ET C'EST LA SEULE DERIVE DE CE CHANTIER QU'AUCUN TEMOIN DE COMPORTEMENT NE PEUT VOIR",
    "La mutation &laquo; le garde absorbe dans le proprietaire &raquo; a ete jouee. Resultat : "
    "<b>tous les temoins de comportement restent verts</b> &mdash; parce que le comportement est "
    "<b>rigoureusement identique</b>. Seul le <b>temoin de source</b> rougit."
    "<br/><br/>=&gt; <b><i>Une derive de conception peut etre invisible a l'execution.</i></b> Un "
    "banc d'essai qui ne regarderait que des comportements laisserait donc passer, sans un seul "
    "rouge, exactement ce qu'on cherche a empecher. <i>C'est ce que les temoins de source achetent, "
    "et on ne s'en apercoit que le jour ou ils sont seuls a parler.</i>", ORANGE))

# ── 4 ──
F.append(P("4. La sonde : elle conduisait, elle n'observait pas", 'h1'))
F.append(P("Les cles existantes lisent " + C % '_afSrc' + " et la pastille. <b>Aucune</b> ne lisait "
           + C % '_afUnite' + " / " + C % '_afPoidsDeclare' + " / " + C % '_afQtyNom' + " &mdash; "
           "exactement ce que 3-iii deplace. L'instantane serait donc reste identique <b>quoi qu'on "
           "fasse a ce bloc</b>. Etendue de <b>17 a %d cles AVANT le BEFORE</b>." % len(CLES), 'p'))
F.append(bloc_code(EXCLUSIFS))
F.append(encadre(
    "LA MESURE QUI A SAUVE LES FIXTURES",
    "Recopier les cas de 3-ii aurait ete le geste naturel &mdash; meme ecran, memes portes. <b>Ils "
    "n'auraient jamais franchi le garde</b>, et les six cas auraient rendu la meme valeur."
    "<br/><br/>=&gt; C'est le piege exact de la sous-etape 3-ii (<i>une sonde qui n'atteint pas la "
    "ligne visee mesure l'ecran d'avant, et elle est VERTE</i>) &mdash; <b>cherche d'avance cette "
    "fois, au lieu d'etre decouvert</b>. <i>Le seul progres qui compte est la lecon appliquee avant "
    "d'etre repayee.</i>", VERT))

# ── 5 ──
F.append(P("5. Les mesures", 'h1'))
F.append(tableau(
    ["preuve", "resultat"],
    [["Instantane, avant / apres",
      "<b>identique octet pour octet</b>, sha256 " + C % SHA_INSTANTANE + ", diff vide (%d cles)"
      % len(CLES)],
     ["Temoins", "<b>%d appels ecrits</b>, <b>17 a l'execution</b> (deux vivent dans une boucle de "
      "2 tours) &mdash; bloc CCXCVIII" % N_TEMOINS_ECRITS],
     ["Controle negatif", "<b>9 mutations, toutes mordent sur leur PROPRE temoin</b> ; controle sain "
      "a 0 rouge <b>avant ET apres</b>"],
     ["Passe complete", "<b>%d / %d</b> &mdash; <i>lu dans le journal de la passe, pas ecrit a la "
      "main</i> &middot; total predit = total obtenu (3649 + 17)" % (PASSE_OK, PASSE_OK)],
     ["Autres bancs", "calculs 339/339 &middot; muscles 241/241 &middot; croises 50/50 &middot; "
      "dates 9/9 &middot; donnees : aucun trou nouveau"],
     ["Non-regression figee", C % '_afPoidsPose' + " n'est <b>pas</b> pose par ce chemin &mdash; "
      "essaye il y a 25 versions, refuse par la mesure. <b>2 temoins</b>"],
     ["Hors perimetre", C % '_qReprenable' + " intacte, portions comprises"],
     ["Ecran", "<b>rien ne change</b>"]],
    [42 * mm, 123 * mm]))

F.append(PageBreak())

# ── 6 ──
F.append(P("6. Le temoin de perimetre se deplace pour la TROISIEME fois", 'h1'))
F.append(tableau(
    ["version", "ce qu'il exige", "pourquoi"],
    [["3-i", "la regle est ecrite <b>5 fois</b>", "garde-fou : empecher 3-i de deborder sur 3-ii/iii/iv"],
     ["3-ii", "<b>3 ecritures + 2 appelants</b>", "3-ii a ete faite <b>expres</b> : la pastille"],
     ["<b>3-iii</b>", "<b>%d ecriture + 3 appelants</b>" % ECRITURES,
      "il ne reste que le site qui <b>ECRIT</b> " + C % 'p.q' + "/" + C % 'p.u' + ", reserve a <b>3-iv</b>"]],
    [24 * mm, 52 * mm, 89 * mm]))
F.append(P("=&gt; <b><i>La garantie ne s'affaiblit pas, elle change de forme</i></b> &mdash; et c'est "
           "verifiable : les mutations qui la faisaient rougir hier la font rougir aujourd'hui, par "
           "l'autre bout. <b>Le jour ou elle tombera a 0, ce sera que 3-iv a ete faite.</b>", 'petit'))

# ── 7 ──
F.append(P("7. Un compteur aveugle, attrape AVANT de publier le chiffre", 'h1'))
F.append(bloc_code(COMPTEUR))
F.append(encadre(
    "LA MEME FAMILLE QUE LA VERSION PRECEDENTE, MAIS PRISE A TEMPS",
    "La version d'avant avait livre un temoin qui comptait la ligne de <b>commentaire</b> citant "
    "l'appel &mdash; et il avait fallu un <b>ecart d'un seul rouge</b> pour s'en apercevoir, apres "
    "coup."
    "<br/><br/>=&gt; Ici le compteur a ete <b>mesure des deux facons avant d'ecrire quoi que ce "
    "soit</b> : <b>5</b> via le filtre ligne-a-ligne, <b>%d</b> hors blocs de commentaire entiers. "
    "<i>Le chiffre juste est celui qui ne compte pas ce qui PARLE du code</i> &mdash; et le document "
    "que vous lisez a un garde qui recompte cette valeur a chaque generation." % N_QG, VERT))

# ── 8 ──
F.append(P("8. Etat du decoupage", 'h1'))
F.append(tableau(
    ["", ""],
    [["Sous-etapes restantes avant le hub", "<b>%d</b> &mdash; sur %d au plan, %d livrees, %d ecartee : "
      % (RESTANTES, TOTAL_SE, LIVREES, ECARTEES) + C % '3-iv' + " (la derniere des formes, <b>le seul "
      "site qui ECRIT</b>), " + C % '3-v' + ", puis " + C % '1b-v'],
     ["Defaut reel decouvert ?", "<b>aucun cette fois</b> &mdash; la regle nouvelle (mesurer, ecrire, "
      "ne pas corriger, attendre un feu vert) n'avait pas a s'appliquer"],
     ["Le hub et la douane", "apres 1b et 3, consigne inchangee"],
     ["Favoris entre onglets, ecart 48,3 / 48", "ouverts, non corriges"],
     ["Historique, migrations, harmonisations produit", "non touches"]],
    [58 * mm, 107 * mm]))
F.append(P("<b>Rollback</b> : un " + C % 'git revert' + " du commit.", 'petit'))

F.append(Spacer(1, 8))
F.append(P(("Document genere depuis le code servi &mdash; tous les decomptes cites sont recomptes a "
            "chaque generation (%d occurrences du proprietaire, %d de la regle voisine, %d ecriture "
            "restante, %d cles de sonde, %d temoins ecrits, %d sous-etapes restantes). "
            % (N_OWNER, N_QG, ECRITURES, len(CLES), N_TEMOINS_ECRITS, RESTANTES)) +
           "<b>Onze gardes refusent de produire si un fait tombe</b> &mdash; dont un qui verifie que "
           + C % '_bcNutr' + " n'est <b>pas</b> entre dans le proprietaire (la derive invisible a "
           "l'execution), un que le proprietaire <b>appelle</b> " + C % '_qGrammes' + " au lieu de "
           "reecrire la regle, et deux que la sonde <b>observe</b> vraiment le trio. Source : "
           + C % 'tools/gen_1201_pdf.py' + ".", 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=23 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker - le bloc poids repris en grammes',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK -> %s (%d Ko)' % (OUT, os.path.getsize(OUT) // 1024))
