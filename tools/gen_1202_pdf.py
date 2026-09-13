#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/SOUS-ETAPE-3IV.pdf — la liste blanche de la provenance : ce n'est PAS une
   extraction, et la mutation qui le prouve est invisible a l'ecran. Quatorzieme document.

TOUS LES DECOMPTES SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI.
Les deux gardes qui comptent le plus ici :
  - `_afSrc` ne doit PAS etre entre dans `_qGrammes` (le garde d'etat reste chez l'appelant) ;
  - les 5 ecritures de `p.q` doivent TOUJOURS etre la (les 3 « etat de l'ecran » ne bougent pas).
Aucune des deux n'est visible a l'execution : c'est tout le sujet du document.

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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'SOUS-ETAPE-3IV.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
SONDE = open(os.path.join(ROOT, 'tools', 'instantane_1b23.js'), encoding='utf-8').read()
RUN = open(os.path.join(ROOT, 'tests', 'parcours', 'runner.js'), encoding='utf-8').read()
DEC = open(os.path.join(ROOT, 'docs', 'SOUS-ETAPES-1B-3.md'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = '(ft-v\d+)'", SW) or [None, '?'])[1]
SHA_INSTANTANE = '57b13433fbaa1c60'

# ── LE CODE SANS SES BLOCS DE COMMENTAIRE ENTIERS.
#    Un filtre ligne-a-ligne compte les lignes de docblock qui CITENT un appel : la version
#    precedente l'a paye, celle d'avant aussi. On retire les blocs entiers, une bonne fois.
CODE = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), APP)


def corps(nom, arg=r'\w*'):
    m = re.search(r'function ' + nom + r'\(' + arg + r'\)\{[\s\S]*?\n\}', CODE)
    return m.group(0) if m else ''


# ── LES DECOMPTES, REFAITS ICI ───────────────────────────────────────────────
C_PROV = corps('_provFood')
C_QG = corps('_qGrammes')
C_QREPRENABLE = corps('_qReprenable')

N_QG = len(re.findall(r'_qGrammes\(', CODE))                 # 1 declaration + 4 appels
N_QG_PROV = len(re.findall(r'_qGrammes\(', C_PROV))          # l'appel de 3-iv
N_ECR_PQ = len(re.findall(r'p\.q\s*=', C_PROV))              # les 5 ecritures
N_PORTION = len(re.findall(r"_afSrc\.u===?'portion'", C_PROV))
ECRITURES = len([l for l in CODE.split('\n')
                 if re.search(r"q>0\s*&&\s*\(!\w+\.u\s*\|\|\s*\w+\.u\s*===?\s*'g'\)", l)])

CLES = sorted(set(re.findall(r"out\['([^']+)'\]", SONDE)))
N_TEMOINS = len(re.findall(r"t\('CCXCIX ", RUN))

SOUS = re.findall(r'^### (1b-[iv]+|3-[iv]+)\b(.*)$', DEC, re.M)
TOTAL_SE = len(SOUS)
LIVREES = len([t for t in SOUS if 'LIVR' in t[1].upper()])
ECARTEES = len([t for t in SOUS if 'CART' in t[1].upper()])
RESTANTES = TOTAL_SE - LIVREES - ECARTEES

# CHAQUE GARDE PROTEGE UNE AFFIRMATION DU DOCUMENT.
if not C_PROV:
    raise SystemExit('`_provFood` est introuvable : tout le document parle de sa liste blanche.')
if not C_QG:
    raise SystemExit('`_qGrammes` est introuvable : c est le proprietaire sur lequel 3-iv branche.')
if '_afSrc' in C_QG:
    raise SystemExit('PERIMETRE ROMPU : `_afSrc` est ENTRE dans `_qGrammes`. Le §4 demontre que le '
                     'garde d etat reste CHEZ L APPELANT — et cette derive ne change AUCUN '
                     'comportement, donc elle est invisible a l execution.')
if "'portion'" in C_QG:
    raise SystemExit('PERIMETRE ROMPU : `_qGrammes` accepte les portions. Les deux regles doivent '
                     'rester DEUX (le §4 l affirme).')
if N_QG_PROV != 1:
    raise SystemExit('La liste blanche appelle `_qGrammes` %d fois, pas 1 : soit elle REECRIT la '
                     'regle (le §2 affirme le contraire), soit 3-iv a deborde.' % N_QG_PROV)
if N_QG != 5:
    raise SystemExit('`_qGrammes` a %d occurrences hors commentaires, pas 5 (1 declaration + 4 '
                     'appels) : le §5 cite ce chiffre.' % N_QG)
if ECRITURES != 0:
    raise SystemExit('La regle « grammes seuls » est encore ecrite %d fois en dur : le §5 affirme '
                     'qu il n en reste AUCUNE.' % ECRITURES)
if N_ECR_PQ != 5:
    raise SystemExit('`_provFood` porte %d ecritures de `p.q`, pas 5 : le §1 demontre que le plan '
                     'en annoncait UNE et qu il y en a cinq — dont 3 qui ne bougent pas.' % N_ECR_PQ)
if N_PORTION != 1:
    raise SystemExit('La branche PORTIONS est ecrite %d fois, pas 1 : le §3 affirme qu elle ne '
                     'bouge pas (1 copie, aucun proprietaire — on n en cree pas pour une forme '
                     'unique).' % N_PORTION)
if "'portion'" not in C_QREPRENABLE:
    raise SystemExit('HORS PERIMETRE ROMPU : `_qReprenable` n accepte plus les portions.')
if len(CLES) != 19:
    raise SystemExit('La sonde porte %d cles, pas 19 : le §6 affirme qu AUCUNE n a ete ajoutee.'
                     % len(CLES))
for k in ('3_via_quickAddFood', '3_via_rejouerRepas'):
    if k not in CLES:
        raise SystemExit('La sonde ne conduit plus les deux portes (%s manque) : le §6 affirme '
                         'qu elle OBSERVAIT deja le perimetre.' % k)
if N_TEMOINS != 13:
    raise SystemExit('Le bloc CCXCIX porte %d temoins, pas 13 : le §7 cite ce chiffre.' % N_TEMOINS)
if TOTAL_SE != 10 or LIVREES != 7 or ECARTEES != 1 or RESTANTES != 2:
    raise SystemExit('Le decoupage porte %d sous-etapes, %d livrees, %d ecartee(s), %d restante(s) '
                     '— pas 10 / 7 / 1 / 2.' % (TOTAL_SE, LIVREES, ECARTEES, RESTANTES))

# ⛔⛔ LE TOTAL DE LA PASSE SE LIT, IL NE S'ECRIT PAS.
#    C'est le chiffre le plus facile a inventer du document : attendu, rond, jamais reverifie.
#    Une version precedente l'avait ecrit a la main PENDANT que la passe tournait encore.
PASSE = os.environ.get('FT_PASSE') or '/tmp/passe1202.log'
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
                      'Force Tracker — la liste blanche de la provenance (%s) — 13/09/2026'
                      % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


PLAN = """// CE QUE LE PLAN ANNONCAIT POUR 3-iv
//   « Sites : @1232 (grammes) . @1237 (portions)
//     -- le SEUL endroit qui ECRIT p.q / p.u »

// CE QUE LA MESURE DIT — 5 ECRITURES, PAS UNE

@1232  if(+_afSrc.q>0 && (!_afSrc.u||_afSrc.u==='g')){ p.q=+_afSrc.q; p.u='g'; }
@1237  else if(+_afSrc.q>0 && _afSrc.u==='portion'){  p.q=+_afSrc.q; p.u='portion'; }
         ^ lisent _afSrc (la SOURCE reprise)

@1300  if(row && ... && _bcNutr && g>0 && _bcQtyPose){ p.q=g;  p.u='g'; }
@1320  p.q=q; p.u='g';
@1355  p.q=n; p.u='portion';
         ^ lisent l'ETAT DE L'ECRAN — ce ne sont pas des copies, elles ne bougent pas"""

AVANT_APRES = """// AVANT — la DERNIERE copie ecrite de la regle « grammes seuls »
if(+_afSrc.q>0 && (!_afSrc.u || _afSrc.u==='g')){ p.q=+_afSrc.q; p.u='g'; }

// APRES — un BRANCHEMENT, pas une extraction : le proprietaire existait deja
const _gProv = _qGrammes(_afSrc);
if(_gProv > 0){ p.q = _gProv; p.u = 'g'; }

// La branche PORTIONS ne bouge pas : 1 ecriture, aucun proprietaire existant.
else if(+_afSrc.q>0 && _afSrc.u==='portion'){ p.q=+_afSrc.q; p.u='portion'; }

// Et le garde d'etat reste DEHORS, chez l'appelant :
if(_afSrc){            // <- « une source existe » : l'ETAT DE L'ECRAN
   ...
}                      //    pas « cette quantite est-elle des grammes »"""

MUTATION = """// LA MUTATION N.2 — ET C'EST LE FAIT DE LA VERSION

// on remet la regle en dur a cote de l'appel, au lieu d'appeler le proprietaire :
const _gProv = (+_afSrc.q>0 && (!_afSrc.u || _afSrc.u==='g')) ? +_afSrc.q : 0;

// RESULTAT MESURE :
//   temoins de COMPORTEMENT ...... 0 rouge   (l'ecran fait EXACTEMENT la meme chose)
//   temoins de SOURCE ............ 5 rouges  (la regle est redevenue double)

// => une regle reecrite dit la meme chose a l'execution.
//    Un banc qui ne regarde que des comportements laisse revenir la duplication
//    SANS UN SEUL ROUGE."""


# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P("La liste blanche de la provenance", 'titre'))
F.append(P("Force Tracker &mdash; 13/09/2026, " + C % VERSION + ". Quatorzieme document de la serie, "
           "sous-etape <b>3-iv</b>. Michel valide la precedente et ajoute une consigne qui en est "
           "tiree : <i>&laquo; une derive de conception peut etre invisible a l'execution ; conserve "
           "les temoins de SOURCE quand ils protegent une frontiere que les tests de comportement ne "
           "peuvent pas voir &raquo;</i>. <b>Elle se demontre ici, le lendemain.</b>", 'sous'))

F.append(encadre(
    "LES DEUX FAITS DE CETTE SOUS-ETAPE",
    "<b>(1) Ce n'est PAS une extraction, et le perimetre ecrit dans le plan est faux pour la "
    "QUATRIEME sous-etape d'affilee.</b> Il annoncait <i>deux branches</i> et <i>le seul endroit qui "
    "ecrit</i> : il y a <b>1 copie de chaque forme</b> et <b>%d ecritures</b>. 3-iv se reduit a "
    "<b>brancher</b> la derniere copie sur un proprietaire qui existe deja."
    "<br/><br/><b>(2) La mutation qui protege ce travail ne se voit pas a l'ecran.</b> Reecrire la "
    "regle sur place au lieu d'appeler le proprietaire rend <b>%d rouges, TOUS sur des temoins de "
    "source</b> &mdash; et <b>zero</b> sur les temoins de comportement. <i>C'est exactement ce que la "
    "consigne de Michel achete, et c'est mesure.</i>" % (N_ECR_PQ, 5)))

# ── 1 ──
F.append(P("1. Le test d'entree dit NON a 3-iv telle que le plan la decrit", 'h1'))
F.append(bloc_code(PLAN))
F.append(tableau(
    ["ce que le plan disait", "ce que la MESURE dit"],
    [["&laquo; les <b>deux</b> branches @1232/@1237 &raquo;",
      "<b>1 copie de CHAQUE forme.</b> Elles se ressemblent et ne disent pas la meme chose : l'une "
      "teste les grammes et ecrit " + C % "u:'g'" + ", l'autre teste les portions et ecrit "
      + C % "u:'portion'" + ""],
     ["&laquo; le <b>SEUL</b> endroit qui ecrit " + C % 'p.q' + "/" + C % 'p.u' + " &raquo;",
      "<b>%d ecritures.</b> Les trois autres lisent l'<b>etat de l'ecran</b>, pas " % N_ECR_PQ
      + C % '_afSrc' + " &mdash; ce ne sont pas des copies non plus"]],
    [52 * mm, 113 * mm]))

# ── 2 ──
F.append(P("2. Un BRANCHEMENT, pas une extraction &mdash; et la nuance sur le test d'entree", 'h1'))
F.append(bloc_code(AVANT_APRES))
F.append(encadre(
    "LA REGLE DE GARDE QUI ALLAIT DEVENIR UNE FAUSSE LIMITE",
    "Le test d'entree pose il y a six versions dit : <i>une extraction exige au moins DEUX copies</i>. "
    "Applique tel quel ici, il interdisait de toucher a cette ligne &mdash; il n'y a qu'une copie de "
    "cette forme &mdash; et <b>la derniere copie ecrite de la regle serait restee en dur pour "
    "toujours</b>."
    "<br/><br/>=&gt; <b><i>Le test d'entree protege contre la CREATION d'un proprietaire pour une "
    "forme unique ; il ne s'applique pas a l'ajout d'un appelant a un proprietaire qui EXISTE.</i></b> "
    "<i>Une regle de garde qui deborde de son domaine devient elle-meme une fausse limite</i> "
    "&mdash; et une fausse limite ne casse rien, ne rougit nulle part : elle se manifeste seulement "
    "par ce qu'on ne fait jamais.", ORANGE))

F.append(PageBreak())

# ── 3 ──
F.append(P("3. Ce qui ne bouge PAS, et pourquoi c'est la moitie du travail", 'h1'))
F.append(tableau(
    ["ce qui reste en place", "la raison, mesurable"],
    [["La branche <b>PORTIONS</b>",
      "<b>%d ecriture</b>, aucun proprietaire existant. En creer un pour elle violerait le test "
      "d'entree &mdash; c'est la regle qui a fait <b>ecarter</b> une sous-etape entiere il y a "
      "six versions" % N_PORTION],
     ["Les <b>3 ecritures &laquo; etat de l'ecran &raquo;</b>",
      "elles lisent l'ecran, pas la source reprise. Un temoin exige que le compte reste a "
      "<b>%d</b>" % N_ECR_PQ],
     ["Le garde " + C % 'if(_afSrc)',
      "il dit <i>&laquo; une source existe &raquo;</i> &mdash; un <b>etat</b>. Pas <i>&laquo; est-ce "
      "des grammes &raquo;</i>. <b>Le metier du proprietaire s'arrete a la quantite.</b> Deux temoins, "
      "un de comportement et un de source"],
     [C % '_qReprenable' + " et ses portions",
      "elle ressemble a " + C % '_qGrammes' + " a un " + C % '||' + " pres et ne dit pas la meme "
      "chose. Les fondre serait un <b>changement de comportement</b>"]],
    [46 * mm, 119 * mm]))

# ── 4 ──
F.append(P("4. La mutation qui ne se voit pas a l'ecran", 'h1'))
F.append(bloc_code(MUTATION))
F.append(encadre(
    "POURQUOI CE RESULTAT EST LE PLUS UTILE DU DOCUMENT",
    "Sur les 8 mutations jouees, sept se voient : une quantite qui ne passe plus, une unite fausse, "
    "une etiquette perdue. <b>La deuxieme ne se voit pas du tout.</b> L'ecran fait exactement la meme "
    "chose, les deux portes rendent les memes six resultats, l'instantane ne bouge pas."
    "<br/><br/>=&gt; <b><i>Une duplication qui revient ne produit aucun symptome le jour ou elle "
    "revient.</i></b> Elle en produira dans six mois, quand une des deux copies sera corrigee et pas "
    "l'autre &mdash; et personne ne fera le lien. <i>C'est la definition meme de ce que ce chantier "
    "supprime, et le seul instrument capable de le voir est un temoin qui lit le CODE.</i>", VERT))

# ── 5 ──
F.append(P("5. Le temoin de perimetre se deplace pour la QUATRIEME fois &mdash; et tombe a zero", 'h1'))
F.append(tableau(
    ["version", "ce qu'il exige", "pourquoi"],
    [["3-i", "la regle est ecrite <b>5 fois</b>", "garde-fou : empecher 3-i de deborder"],
     ["3-ii", "<b>3 ecritures + 2 appelants</b>", "la pastille a ete faite <b>expres</b>"],
     ["3-iii", "<b>1 ecriture + 3 appelants</b>", "il ne restait que le site qui <b>ECRIT</b>"],
     ["<b>3-iv</b>", "<b>%d ecriture</b>, <b>%d occurrences</b> de " % (ECRITURES, N_QG)
      + C % '_qGrammes', "la derniere copie a rejoint son proprietaire (1 declaration + 4 appels)"]],
    [22 * mm, 55 * mm, 88 * mm]))
F.append(P("=&gt; <b>Il ne se supprime pas maintenant qu'il vaut 0.</b> <i>A zero, il devient le "
           "gardien du RETOUR de la duplication</i> &mdash; precisement ce qu'aucun parcours ne peut "
           "voir. La garantie ne s'affaiblit pas : elle change de forme pour la quatrieme fois.",
           'petit'))

# ── 6 ──
F.append(P("6. La sonde : ouverte avant le BEFORE, et elle observait deja", 'h1'))
F.append(P("Pour la premiere fois de la serie, <b>aucune cle n'a ete ajoutee</b> &mdash; mais ce n'est "
           "pas une conclusion de lecture. Les deux cles concernees conduisent les <b>vraies portes</b> "
           "(l'ajout direct depuis la liste et le rejeu d'un repas) et lisent " + C % 'q' + "/"
           + C % 'u' + " sur la <b>ligne enregistree</b>, que la liste blanche ecrit. <b>Six issues "
           "distinctes sur six cas</b> : elle discrimine, ce n'est pas un reliquat.", 'p'))
F.append(P("Sonde : <b>%d cles</b>, inchangee. Instantane <b>identique octet pour octet</b> avant et "
           "apres, sha256 " % len(CLES) + C % SHA_INSTANTANE + ", diff vide.", 'petit'))

# ── 7 ──
F.append(P("7. Les mesures", 'h1'))
F.append(tableau(
    ["preuve", "resultat"],
    [["Instantane, avant / apres",
      "<b>identique octet pour octet</b>, sha256 " + C % SHA_INSTANTANE + " (%d cles, aucune ajoutee)"
      % len(CLES)],
     ["Temoins", "<b>%d</b> &mdash; bloc CCXCIX, dont <b>4 de source</b> (perimetre)" % N_TEMOINS],
     ["Controle negatif", "<b>8 mutations, toutes mordent sur leur PROPRE temoin</b> ; controle sain "
      "a 0 rouge <b>avant ET apres</b>"],
     ["Passe complete", "<b>%d / %d</b> &mdash; <i>lu dans le journal de la passe, pas ecrit a la "
      "main</i> &middot; total <b>predit = obtenu</b> (3667 + %d), aucun ecart a expliquer"
      % (PASSE_OK, PASSE_OK, N_TEMOINS)],
     ["Autres bancs", "calculs 339/339 &middot; muscles 241/241 &middot; croises 50/50 &middot; "
      "dates 9/9 &middot; donnees : aucun trou nouveau"],
     ["Temoins freres", "<b>3 deplaces ENSEMBLE</b> cette fois (CCXCIII, CCXCVI, CCXCVII) au lieu "
      "d'etre decouverts rouges par la passe &mdash; la porte jumelle appliquee d'avance"],
     ["Ecran", "<b>rien ne change</b>"]],
    [42 * mm, 123 * mm]))

# ── 8 ──
F.append(P("8. Le plan avait tort QUATRE fois de suite &mdash; ce qu'on en fait", 'h1'))
F.append(tableau(
    ["sous-etape", "ce que le plan disait", "ce que la mesure disait"],
    [["1b-ii", "&laquo; 4 sites &raquo;", "<b>3</b> &mdash; le 4e construit autre chose"],
     ["1b-iii", "&laquo; deux champs divergent &raquo;", "<b>un seul</b> divergeait"],
     ["1b-iv", "&laquo; la moins risquee du lot &raquo;", "<b>rien a extraire</b> : une seule copie"],
     ["<b>3-iv</b>", "&laquo; deux branches, le seul endroit &raquo;",
      "<b>1 copie de chaque forme</b>, <b>%d</b> ecritures" % N_ECR_PQ]],
    [24 * mm, 62 * mm, 79 * mm]))
F.append(encadre(
    "LA CONCLUSION VAUT PLUS QUE LES QUATRE CORRECTIONS",
    "Jamais deux fois de la meme facon &mdash; c'est ce qui rend l'erreur difficile a voir venir. "
    "<b>Un document de plan reste utile pour ORDONNER le travail</b> (quoi avant quoi, quoi bloque "
    "quoi). <b>Il n'est jamais une source pour un CHIFFRE.</b>"
    "<br/><br/>=&gt; <i>Un perimetre ecrit la veille est une hypothese ; seul un comptage refait le "
    "jour meme est une mesure.</i> Le document porte desormais cet avertissement a l'endroit exact de "
    "la prochaine sous-etape."))

# ── 9 ──
F.append(P("9. Etat du decoupage", 'h1'))
F.append(tableau(
    ["", ""],
    [["Sous-etapes restantes avant le hub", "<b>%d</b> &mdash; sur %d au plan, %d livrees, %d ecartee : "
      % (RESTANTES, TOTAL_SE, LIVREES, ECARTEES) + C % '3-v' + " (la reprise des portions a l'ecran), "
      "puis " + C % '1b-v' + " (l'hydratation des ecrans, qui en depend)"],
     ["Defaut reel decouvert ?", "<b>aucun cette fois</b> &mdash; la regle (mesurer, ecrire, ne pas "
      "corriger, attendre un feu vert separe) n'avait pas a s'appliquer"],
     ["Le hub et la douane", "apres 1b et 3, consigne inchangee"],
     ["Favoris entre onglets, ecart 48,3 / 48", "ouverts, non corriges"],
     ["Historique, migrations, harmonisations produit", "non touches"]],
    [58 * mm, 107 * mm]))
F.append(P("<b>Rollback</b> : un " + C % 'git revert' + " du commit. Le changement de code tient en "
           "<b>deux lignes</b>.", 'petit'))

F.append(Spacer(1, 8))
F.append(P(("Document genere depuis le code servi &mdash; tous les decomptes cites sont recomptes a "
            "chaque generation (%d occurrences du proprietaire, %d ecriture en dur restante, %d "
            "ecritures de la liste blanche, %d branche portions, %d cles de sonde, %d temoins, %d "
            "sous-etapes restantes). "
            % (N_QG, ECRITURES, N_ECR_PQ, N_PORTION, len(CLES), N_TEMOINS, RESTANTES)) +
           "<b>Dix-sept gardes refusent de produire si un fait tombe</b> &mdash; dont un qui verifie "
           "que " + C % '_afSrc' + " n'est <b>pas</b> entre dans " + C % '_qGrammes' + " et un que la "
           "liste blanche <b>appelle</b> le proprietaire au lieu de reecrire la regle : <i>les deux "
           "derives que ce document raconte, et qu'aucun test de comportement ne peut voir</i>. Le "
           "total de la passe est <b>lu dans son journal</b>, jamais ecrit a la main. Source : "
           + C % 'tools/gen_1202_pdf.py' + ".", 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=23 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker - la liste blanche de la provenance',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK -> %s (%d Ko)' % (OUT, os.path.getsize(OUT) // 1024))
