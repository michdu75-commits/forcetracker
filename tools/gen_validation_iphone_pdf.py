#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/VALIDATION-IPHONE-0A.pdf — la capture iPhone de Michel comme TEMOIN REEL.

   Cinquieme document de la serie : DOUANE -> ARCHI -> PLAN -> PHASE0A-ETAPE1A -> CELUI-CI.
   Michel joint une capture du test reel (lentilles Raynal & Roquelaure, 3021690201123) et demande
   trois choses precises : ce qu'elle valide deja, ce qu'elle ne valide pas encore, et le scenario
   exact a jouer pour confirmer que l'ancien paquet de 410 g ne survit plus.

⭐ LES TROIS FAITS QUE CE DOCUMENT AFFIRME SUR LE CODE SONT VERIFIES A CHAQUE GENERATION :
   (1) taper la pastille du paquet la fait disparaitre ; (2) `openAddFood` remet `_bcPaquetG` a
   zero ; (3) « Mes aliments » est place AVANT le bloc code-barres dans l'ecran. Chacun porte une
   conclusion du document — si l'un devient faux, le generateur refuse de produire.

⚠️ LA CAPTURE N'EST PAS EMBARQUEE, ET C'EST UN CHOIX : le depot est PUBLIC, et une copie d'ecran
   du journal alimentaire de quelqu'un decrit LA PERSONNE, pas le monde (R36). Le document en
   donne une transcription fidele — plus utile a un modele de texte qu'une image, et sans rien
   publier de son repas. *On peut toujours l'ajouter si Michel le demande.*

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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'VALIDATION-IPHONE-0A.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
HTM = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()


def corps(nom):
    m = re.search(r'^function ' + nom + r'\(.*?^\}', APP, re.M | re.S)
    return m.group(0) if m else ''


VERSION = (re.search(r"const CACHE = '(ft-v\d+)'", SW) or [None, '?'])[1]
PASTILLE_DISPARAIT = "display='none'" in corps('_bcReprendrePaquet')
OPEN_REMET_A_ZERO = '_bcPaquetG=0' in corps('openAddFood')
LISTE_AU_DESSUS = HTM.index('af-quick-list') < HTM.index('af-barcode-block')
GARDE = len(re.findall(r'garderPaquet', APP))

# ⛔ CHAQUE GARDE PROTEGE UNE CONCLUSION DU DOCUMENT. Si le fait tombe, la conclusion aussi.
if not PASTILLE_DISPARAIT:
    raise SystemExit('`_bcReprendrePaquet` NE CACHE PLUS LA PASTILLE — or c\'est ce qui permet de '
                     'deduire que Michel a TAPE 410 au clavier au lieu de toucher la pastille. '
                     'La deduction du §2 tombe.')
if not OPEN_REMET_A_ZERO:
    raise SystemExit('`openAddFood` NE REMET PLUS `_bcPaquetG` A ZERO — or c\'est ce qui rend le '
                     'test PLACEBO si on ferme l\'ecran. L\'avertissement du §3 tombe.')
if not LISTE_AU_DESSUS:
    raise SystemExit('« Mes aliments » N\'EST PLUS AU-DESSUS du bloc code-barres — la consigne '
                     '« remonte en haut » du §3 est fausse.')
if GARDE == 0:
    raise SystemExit('LA PHASE 0a EST DEFAITE : `garderPaquet` a disparu — il n\'y a plus rien a valider.')

# ⚠️ Transcription FIDELE de la capture du 11/09/2026, 23:11 (l'image n'est pas embarquee, cf. l'en-tete).
CAPTURE = """Lentilles Cuisinees a l'Auvergnate (Raynal & Roquelaure) - 48.3 kcal/100g

  Quantite  [ 410 ] g

  Combien en as-tu mange ? la fiche produit declare une portion de 205 g
  - touche la pastille si ca correspond, sinon tape ton poids.

     [ 205 g (portion fabricant) ]        <- pastille INTACTE
     [ 410 g (le paquet entier)  ]        <- pastille INTACTE

  -> pour tes 410 g : 198 kcal - 25 g de proteines - 41 g de glucides - 13 g de lipides

  Calories (kcal) [ 198 ]      Proteines (g) [ 25 ]
  Glucides (g)    [ 41  ]      Lipides (g)   [ 13 ]

  [ Saisir les valeurs pour 100 g (etiquette) ]

  /!\\ 198 kcal ne colle pas a ces macros : 25 g de proteines, 41 g de glucides
      et 13 g de lipides donnent 381 kcal.
     [ Mettre 381 kcal ]"""

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
                      'Force Tracker — la capture iPhone comme temoin reel (%s) — 12/09/2026' % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


# ═══════════════════════════ LE DOCUMENT ═══════════════════════════
F = []
F.append(P("La capture iPhone comme temoin reel : ce qu'elle prouve, ce qu'elle ne prouve pas", 'titre'))
F.append(P("Force Tracker &mdash; 12/09/2026. Cinquieme document de la serie. Michel joint une "
           "capture du test reel sur iPhone (lentilles Raynal &amp; Roquelaure, code-barres "
           + C % '3021690201123' + ") et demande trois choses precises : <b>ce qu'elle valide "
           "deja</b>, <b>ce qu'elle ne valide pas encore</b>, et <b>le scenario exact</b> a jouer "
           "pour confirmer que l'ancien paquet de 410 g ne survit plus au passage vers un autre "
           "aliment. <b>Aucun code n'a ete modifie</b> a partir de cette capture &mdash; c'etait sa "
           "consigne, et le probleme 198 vs 381 n'est pas traite ici.", 'sous'))

F.append(bloc_code(CAPTURE,
    "Transcription fidele de la capture (11/09/2026, 23:11). <b>L'image n'est pas embarquee : le "
    "depot est PUBLIC, et une copie d'ecran d'un journal alimentaire decrit LA PERSONNE, pas le "
    "monde (R36).</b> Une transcription est de toute facon plus exploitable par un modele de texte."))

F.append(Spacer(1, 6))
F.append(encadre(
    "CE QUE LA CAPTURE DIT, ET QUE LA FORMULATION NE DIT PAS",
    "Michel ecrit <i>&laquo; apres choix de 410 g &raquo;</i>. <b>La capture tranche autrement, et "
    "c'est mesure dans le code</b> : " + C % '_bcReprendrePaquet' + " finit par "
    + C % "b.style.display='none'" + " &mdash; <b>taper une pastille la fait disparaitre</b>."
    "<br/><br/>Or <b>les DEUX pastilles sont encore la</b>. Donc <b>aucune n'a ete touchee</b> : "
    "le 410 a ete <b>tape au clavier</b>."
    "<br/><br/>Ce n'est pas un defaut &mdash; c'est un <b>chemin que cette capture ne couvre pas</b>, "
    "et il vaut mieux le savoir avant d'en tirer des conclusions.", ORANGE))

# ── 1 ──
F.append(P("1. Ce que la capture valide DEJA", 'h1'))
F.append(P("<b>Sa vraie valeur n'est pas la ou on la cherche.</b> Le proxy du conteneur de "
           "developpement refuse " + C % 'openfoodfacts.org' + " (403 au CONNECT) : <b>toutes les "
           "mesures precedentes tournaient sur des fiches FABRIQUEES</b>. Cette capture est la "
           "<b>premiere confrontation a la vraie fiche Open Food Facts</b>."))
F.append(tableau(
    ["ce qui est valide", "pourquoi ca compte"],
    [[C % "_offPoidsPaquet('410 g')" + " -&gt; <b>410</b>",
      "le parseur marche sur la <b>vraie</b> chaine " + C % 'quantity' + ", pas sur une fixture"],
     [C % 'serving_quantity' + " = <b>205</b> -&gt; pastille fabricant",
      "idem : vraie donnee OFF, pas une valeur choisie par le testeur"],
     ["les <b>deux pastilles coexistent</b>",
      "205 et 410 sont bien deux notions distinctes a l'ecran"],
     ["le champ <b>n'etait pas pre-rempli</b>",
      "<b>ft-v1190</b> (garde-fou large) tient sur iPhone : il a fallu un geste"],
     ["le recalcul suit la quantite saisie",
      C % '-&gt; pour tes 410 g : 198 kcal...' + " se met a jour"],
     ["<b>l'alerte kcal/macros est visible SANS defiler</b>",
      "<b>c'est ft-v1191 validee sur iPhone</b> &mdash; c'etait tout le correctif de cette version"],
     ["<b>aucun message &laquo; produit SEC &raquo;</b>",
      "l'autre moitie de ft-v1191, cette fois avec les <b>vraies</b> " + C % 'categories_tags' +
      ", qui n'avaient <b>jamais pu</b> etre confrontees a la base"]],
    [62 * mm, 103 * mm]))

# ── 2 ──
F.append(PageBreak())
F.append(P("2. Ce qu'elle ne valide PAS", 'h1'))
F.append(P("<b>(a) Rien du correctif</b> " + C % '_bcPaquetG' + ".", 'h2'))
F.append(P("Le correctif ne concerne <b>que</b> le passage a un <b>autre</b> aliment. Un seul "
           "aliment a l'ecran =&gt; <b>zero information</b> sur lui. La capture est parfaitement "
           "compatible avec un code ou la fuite existe toujours."))

F.append(P("<b>(b) Le chemin &laquo; appui sur la pastille &raquo;</b> &mdash; deduit d'une mesure, pas suppose.", 'h2'))
F.append(bloc_code("""function _bcReprendrePaquet(){
  const b=document.getElementById('af-bc-paquet'); if(!b) return;
  const q=parseFloat(b.dataset.q)||0; if(!(q>0)) return;
  const g=document.getElementById('af-bc-grams'); if(g) g.value=q;
  _bcQtyPose=true;                        // un clic EST un geste
  _bcApplyGrams();                        // R2 : le meme calcul que la saisie a la main
  b.style.display='none';                 // proposition consommee - elle ne repropose pas
}""", "Extrait du depot. La derniere ligne est celle qui tranche : les deux pastilles etant "
      "encore visibles, <b>aucune n'a ete touchee</b>."))

F.append(Spacer(1, 5))
F.append(encadre(
    "(c) ET LE POINT LE PLUS IMPORTANT : LA VERSION SERVIE N'APPARAIT NULLE PART",
    "<b>Tout ce que montre cette capture existait deja en ft-v1191 / ft-v1192</b> : les deux "
    "pastilles (ft-v1190), le champ vide (ft-v1190), l'alerte visible sans defiler (ft-v1191), "
    "l'absence de &laquo; produit SEC &raquo; (ft-v1191)."
    "<br/><br/><b>Cette capture serait rigoureusement IDENTIQUE sur l'ancienne version.</b>"
    "<br/><br/>-&gt; <b>Verifier &laquo; A propos &raquo; AVANT tout le reste.</b> Si l'app ne dit "
    "pas <b>%s</b>, le test qui suit ne mesurera rien. <i>Un service worker sert du cache : &laquo; "
    "j'ai pousse &raquo; ne veut pas dire &laquo; c'est chez moi &raquo;</i> (R18, applique au "
    "telephone au lieu du deploiement)." % VERSION, ROUGE))

# ── 3 ──
F.append(P("3. Le scenario exact &mdash; l'intuition de Michel est juste, avec une condition a durcir", 'h1'))
F.append(encadre(
    "« SANS FERMER L'ECRAN » N'EST PAS DU CONFORT : C'EST LA CONDITION DE VALIDITE",
    "" + C % 'openAddFood' + " remet " + C % '_bcPaquetG' + " a zero <b>depuis toujours</b> "
    "(verifie a la generation de ce document)."
    "<br/><br/>Donc si on ferme puis rouvre l'ecran entre les deux aliments, <b>la pastille "
    "disparait AUSSI sur ft-v1192</b> &mdash; et on croirait avoir valide le correctif."
    "<br/><br/><i><b>C'est la seule chose qui separe un temoin d'un placebo.</b></i>", ROUGE))
F.append(Spacer(1, 5))
F.append(tableau(
    ["etape", "quoi", "attendu"],
    [["<b>0</b>", "&laquo; A propos &raquo;", "doit dire <b>%s</b>" % VERSION],
     ["<b>1</b>", "Nutrition -&gt; ajouter un aliment -&gt; code-barres " + C % '3021690201123', "la fiche se charge"],
     ["<b>2</b>", "constater la pastille du paquet", "<b>410 g (le paquet entier)</b> visible"],
     ["<b>3</b>", "<b>SANS fermer l'ecran</b>, remonter en haut et taper un aliment de la liste "
      "<b>&laquo; Mes aliments &raquo;</b> (elle est placee <b>au-dessus</b> du bloc code-barres)",
      "le nouvel aliment se charge"],
     ["<b>4</b>", "<b>regarder la pastille</b>",
      "<b>&laquo; 410 g (le paquet entier) &raquo; a DISPARU</b>, et le nom affiche est celui du "
      "nouvel aliment"]],
    [12 * mm, 98 * mm, 55 * mm]))
F.append(Spacer(1, 4))
F.append(P("<b>Porte de rechange</b> si la liste &laquo; Mes aliments &raquo; est vide : taper un "
           "nom dans le champ description et choisir un aliment <b>de son journal</b> dans les "
           "suggestions. C'est " + C % '_afSuggPrendreLocale' + ", egalement <b>hors hub</b> &mdash; "
           "les trois portes hors hub sont " + C % 'onFoodLabelFile' + ", " + C % 'quickFillFood' +
           " et " + C % '_afSuggPrendreLocale' + ".", 'petit'))

F.append(Spacer(1, 6))
F.append(encadre(
    "ET LA CONTRE-EPREUVE, QUI VAUT AUTANT (5 SECONDES)",
    "<b>Refaire le trajet dans l'AUTRE SENS</b> : reprendre d'abord un aliment via &laquo; Mes "
    "aliments &raquo;, <b>puis</b> scanner les lentilles -&gt; la pastille <b>410 g doit "
    "APPARAITRE</b>."
    "<br/><br/><i>Un correctif qui effacerait tout le temps passerait le premier test et "
    "echouerait celui-ci.</i> C'est exactement le temoin (1) du banc d'essai (<i>&laquo; "
    "non-regression : apres un scan, le hub affiche BIEN la pastille &raquo;</i>) ; le rejouer sur "
    "le telephone ferme la boucle entre le banc et le reel.", VERT))

F.append(Spacer(1, 6))
F.append(encadre(
    "CE QUE CE DOCUMENT N'EST PAS",
    "<b>Aucune ligne de code n'a ete modifiee</b> a partir de cette capture &mdash; consigne "
    "explicite de Michel. <b>Le probleme 198 kcal vs 381 kcal n'est pas traite ici</b> : il est "
    "visible sur la capture, le garde-fou fait son travail, et il reste hors perimetre de cette "
    "etape."
    "<br/><br/>Les <b>trois faits de code</b> sur lesquels ce document s'appuie sont <b>verifies a "
    "chaque generation</b> : la pastille disparait quand on la tape &middot; " + C % 'openAddFood' +
    " remet le poids a zero &middot; &laquo; Mes aliments &raquo; est au-dessus du bloc "
    "code-barres. <b>Si l'un devient faux, le generateur refuse de produire</b> plutot que de "
    "publier une conclusion perimee.", GRIS))

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker — la capture iPhone comme temoin reel',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
print('   faits verifies : pastille cachee au tap=%s · openAddFood remet a zero=%s · '
      'liste au-dessus=%s · garderPaquet=%d · %s'
      % (PASTILLE_DISPARAIT, OPEN_REMET_A_ZERO, LISTE_AU_DESSUS, GARDE, VERSION))
