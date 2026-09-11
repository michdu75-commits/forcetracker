#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/BUG-KCAL-MACROS.pdf — le cas des lentilles Raynal : les calories contredisent
   les macros. Le garde-fou existe, il a raison, et il s'affiche a 1 132 px sous l'ecran.

⭐⭐ LE CODE N'EST PAS RECOPIE DANS CE FICHIER : il est EXTRAIT du depot a chaque execution.
   Recopier du code dans un document, c'est fabriquer une deuxieme source de verite qui se
   perime en silence — le document finirait par montrer autre chose que ce qui tourne (R2).
   C'est le meme principe que l'inventaire du projet : genere depuis le code, jamais ecrit
   a la main.

⭐ Les CHIFFRES viennent des logs de passe (FT_PASSE_LOG), jamais de la memoire de qui ecrit.

⚠️ CONTRAINTE DE POLICE : WinAnsi/cp1252. Les accents passent (verifie) ; les emoji sortent en
   carres noirs — un garde-fou pose sur les CINQ portes de texte refuse de produire le document
   s'il en reste un. Les commentaires du code source sont pleins d'emoji : ils sont retires par
   `sans_commentaires`, le code NU reste exact.
"""
import os
import re
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether, Preformatted)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'BUG-KCAL-MACROS.pdf')
LOG = os.environ.get('FT_PASSE_LOG', '')




def fonction(fichier, nom):
    """Rend `function nom(...)` jusqu'a la premiere accolade fermante EN COLONNE 0.
       Plus simple et plus sur qu'un comptage d'accolades : ce fichier contient des regex
       litterales et des gabarits qui font derailler un compteur naif (mesure : 200 lignes
       rendues pour une fonction de 6)."""
    L = open(os.path.join(ROOT, fichier), encoding='utf-8').read().split('\n')
    deb = None
    for k, l in enumerate(L):
        if re.match(r'^function\s+' + re.escape(nom) + r'\s*\(', l):
            deb = k
            break
    if deb is None:
        return None
    for k in range(deb + 1, len(L)):
        if L[k].startswith('}'):
            return '\n'.join(L[deb:k + 1])
    return None


def lignes(fichier, motif, avant=0, apres=0):
    """Rend les lignes autour du premier motif trouve."""
    L = open(os.path.join(ROOT, fichier), encoding='utf-8').read().split('\n')
    for k, l in enumerate(L):
        if motif in l:
            return '\n'.join(L[max(0, k - avant):k + apres + 1])
    return None


def sans_commentaires(txt):
    """Retire les commentaires (ils sont pleins d'emoji, qui sortent en carres noirs)
       et les lignes devenues vides. Le code NU reste exact."""
    out, dans_bloc = [], False
    for l in txt.split('\n'):
        if dans_bloc:
            if '*/' in l:
                dans_bloc = False
                reste = l.split('*/', 1)[1]
                if reste.strip(): out.append(reste.rstrip())
            continue
        if '/*' in l and '*/' not in l:
            avant = l.split('/*', 1)[0]
            dans_bloc = True
            if avant.strip(): out.append(avant.rstrip())
            continue
        while '/*' in l and '*/' in l:
            l = l.split('/*', 1)[0] + l.split('*/', 1)[1]
        # commentaire de fin de ligne, en evitant les // d'une URL ou d'une chaine
        if '//' in l:
            q = l.find('//')
            av = l[:q]
            if av.count('"') % 2 == 0 and av.count("'") % 2 == 0 and not av.rstrip().endswith(':'):
                l = av.rstrip()
        if l.strip():
            out.append(l.rstrip())
    return '\n'.join(out)




# ─────────────────────── LE CODE, EXTRAIT DU DEPOT ───────────────────────
def code(fichier, quoi, nom_ou_motif, avant=0, apres=0, garder=None):
    """`apres` compte les lignes BRUTES ; `garder` borne le resultat en lignes de CODE.
       La nuance a coute un extrait tronque : les commentaires sont retires APRES l'extraction,
       donc 11 lignes brutes ne donnaient que 5 lignes de code — et le calcul du pour-100 g
       manquait dans le document, sans que rien ne le signale."""
    t = fonction(fichier, nom_ou_motif) if quoi == 'fn' else lignes(fichier, nom_ou_motif, avant, apres)
    if t is None:
        raise SystemExit('EXTRAIT INTROUVABLE : %s dans %s' % (nom_ou_motif, fichier))
    net = sans_commentaires(t)
    if garder:
        L = net.split('\n')
        if len(L) < garder:
            raise SystemExit('EXTRAIT TROP COURT : %s rend %d lignes, %d attendues'
                             % (nom_ou_motif, len(L), garder))
        net = '\n'.join(L[:garder])
    return net


def lire_passe():
    """Rend le total de la passe. Ne devine JAMAIS un chiffre."""
    if not LOG or not os.path.exists(LOG):
        return "<b>non jointe a ce document</b> (le total n'est pas reproduit plutot que suppose)"
    txt = open(LOG, encoding='utf-8', errors='replace').read()
    fin = re.search(r'TOTAL CROISÉ\s*:\s*([\d\s]+)✅\s*·\s*(\d+)\s*❌', txt)
    if not fin:
        return "<b>encore en cours</b> a la redaction de ce document"
    return "<b>%s verts, %s rouge(s)</b>" % (fin.group(1).strip(), fin.group(2))


PASSE = lire_passe()

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
                         fontSize=13, leading=16, textColor=ROUGE, spaceBefore=15, spaceAfter=6),
    'h2': ParagraphStyle('h2', parent=S['Heading2'], fontName='Helvetica-Bold',
                         fontSize=10.5, leading=13.5, textColor=ENCRE, spaceBefore=10, spaceAfter=4),
    'p': ParagraphStyle('p', parent=S['Normal'], fontName='Helvetica',
                        fontSize=9.3, leading=13.2, textColor=ENCRE, spaceAfter=6),
    'petit': ParagraphStyle('petit', parent=S['Normal'], fontName='Helvetica',
                            fontSize=8.2, leading=11.5, textColor=GRIS, spaceAfter=5),
    'cell': ParagraphStyle('cell', parent=S['Normal'], fontName='Helvetica',
                           fontSize=8.3, leading=11),
    'cellb': ParagraphStyle('cellb', parent=S['Normal'], fontName='Helvetica-Bold',
                            fontSize=8.3, leading=11),
    'code': ParagraphStyle('code', parent=S['Normal'], fontName='Courier',
                           fontSize=6.9, leading=8.6, textColor=ENCRE),
}

# ⛔⛔⛔ CE GARDE-FOU EST PASSE D'UNE LISTE NOIRE A UNE LISTE BLANCHE, APRES LA 3e FUITE.
#    Historique, parce qu'il explique le correctif : (1) au debut il n'inspectait que les
#    paragraphes -> un emoji est passe par un TITRE d'encadre. (2) Elargi aux cinq portes, il ne
#    lisait que les CARACTERES -> l'entite HTML `&#9888;` est passee et est sortie en carre noir.
#    (3) Elargi aux entites, il ne connaissait qu'une LISTE de caracteres interdits -> les puces
#    numerotees ① ② (0x2460) sont passees, elles non plus n'etaient pas dans la liste.
#    👉 *Une liste noire a toujours un trou : elle ne protege que de ce qu'on a pense a y mettre.*
#    Le seul test qui ne peut pas en avoir est celui de la POLICE elle-meme : est-ce que ce
#    caractere existe en WinAnsi/cp1252 ? Tout le reste est refuse, sans qu'on ait a l'enumerer.
def _v(x, ou='texte'):
    """Refuse tout ce que la police du PDF ne sait pas rendre — caracteres ET entites HTML."""
    if isinstance(x, str):
        for ch in x:
            try:
                ch.encode('cp1252')
            except UnicodeEncodeError:
                raise SystemExit('CARACTERE NON RENDU %r (%s) dans %s — la police du PDF est '
                                 'WinAnsi/cp1252' % (ch, hex(ord(ch)), ou))
        for m in re.finditer(r'&#(\d+);|&#[xX]([0-9a-fA-F]+);', x):
            n = int(m.group(1)) if m.group(1) else int(m.group(2), 16)
            try:
                chr(n).encode('cp1252')
            except UnicodeEncodeError:
                raise SystemExit('ENTITE HTML NON RENDUE %s (%s) dans %s' % (m.group(0), hex(n), ou))
    return x


C = "<font face='Courier'>%s</font>"


def P(t, s='p'):
    return Paragraph(_v(t, 'paragraphe'), st[s])


def encadre(titre, corps, couleur=ROUGE):
    inner = [[Paragraph('<b>%s</b>' % _v(titre, "titre d'encadre"), st['cellb'])],
             [Paragraph(_v(corps, "corps d'encadre"), st['cell'])]]
    t = Table(inner, colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FOND),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBEFORE', (0, 0), (0, -1), 2.4, couleur),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    return KeepTogether(t)


def tableau(entetes, ligs, largeurs):
    data = [[Paragraph('<b>%s</b>' % _v(h, 'en-tete de tableau'), st['cellb']) for h in entetes]]
    for l in ligs:
        data.append([Paragraph(_v(c, 'cellule'), st['cell']) for c in l])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EDEDEA')),
        ('GRID', (0, 0), (-1, -1), 0.4, TRAIT),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    return t


# ⛔⛔ REPLI DES LIGNES LONGUES — ET UN GARDE-FOU QUI REFUSE DE PRODUIRE SINON.
#    `Preformatted` ne replie pas : une ligne trop longue DEBORDE et sort COUPEE. Mesure avant
#    correction : 7 lignes debordaient, la pire a 1,75x la largeur utile — donc du code tronque
#    dans un document cense montrer le code. *Un extrait coupe est pire qu'un extrait absent :
#    il a l'air complet.*
#    Le repli marque sa continuation par « » » en debut de ligne, qui ne peut pas etre confondu
#    avec du JavaScript.
from reportlab.pdfbase.pdfmetrics import stringWidth

_LARG_CODE = 165 * mm - 12          # largeur du bloc moins son padding
_PT = stringWidth('x', 'Courier', 6.9)
_MAX = int(_LARG_CODE / _PT)


def _replier(txt):
    out = []
    for l in txt.split('\n'):
        if len(l) <= _MAX:
            out.append(l)
            continue
        creux = len(l) - len(l.lstrip())
        marge = ' ' * creux + '\u00bb '
        reste = l
        while len(reste) > _MAX:
            # LA COUPURE DOIT VRAIMENT RACCOURCIR LA LIGNE, sinon la boucle ne finit jamais.
            # Mesure : sans ce plancher, une coupure trouvee au caractere 3 rendait une ligne
            # presque aussi longue a chaque tour — le generateur tournait sans fin.
            plancher = max(creux + 8, _MAX // 2)
            coupe = -1
            for sep in ('; ', ', ', ' && ', ' || ', ' '):
                k = reste.rfind(sep, plancher, _MAX)
                if k > coupe:
                    coupe = k + len(sep)
            if coupe < plancher:
                coupe = _MAX
            out.append(reste[:coupe].rstrip())
            reste = marge + reste[coupe:].lstrip()
        out.append(reste)
    fini = '\n'.join(out)
    for l in fini.split('\n'):
        if stringWidth(l, 'Courier', 6.9) > _LARG_CODE:
            raise SystemExit('LIGNE DE CODE QUI DEBORDE (%d car) : %s' % (len(l), l[:70]))
    return fini


def bloc_code(txt, legende=None):
    """Le code tel qu'il est dans le depot. Preformatted respecte l'indentation."""
    _v(txt, 'bloc de code')
    corps = [[Preformatted(_replier(txt), st['code'])]]
    t = Table(corps, colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FONDC),
        ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBEFORE', (0, 0), (0, -1), 2.0, TRAIT),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    if legende:
        return KeepTogether([Paragraph(_v(legende, 'legende'), st['petit']), t])
    return t


def pied(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(GRIS)
    canvas.drawString(22 * mm, 12 * mm,
                      'Force Tracker — kcal contre macros : le garde-fou parle, hors de l\'ecran — 11/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


F = []
F.append(P("Les calories contredisent les macros : le garde-fou a raison, "
           "et il est hors de l'ecran", 'titre'))
F.append(P("Force Tracker — 11/09/2026. Le cas des <b>Lentilles Raynal &amp; Roquelaure</b> "
           "(" + C % '3021690201123' + ", 410 g) est <b>reproduit au chiffre pres</b>. "
           "<b>Rien n'a ete corrige</b> : la consigne est de reproduire et tracer avant de toucher "
           "au code. Voici ce que la mesure dit — et elle deplace le probleme.", 'sous'))

F.append(encadre(
    'EN UNE PHRASE',
    "<b>Le garde-fou de coherence n'est ni absent ni muet : il se declenche, et il dit exactement "
    "ce qu'il faut</b> — <i>&laquo; 198 kcal ne colle pas a ces macros, elles donnent 381 kcal &raquo;</i>, "
    "avec un bouton de correction. <b>Le defaut est une POSITION, pas un calcul</b> : au moment ou "
    "il apparait, il est <b>1 132 px sous le bas de l'ecran</b>, alors que le geste qui le declenche "
    "est tout en haut de la fiche."))
F.append(Spacer(1, 6))

F.append(P("1. Le cas, reproduit au chiffre pres", 'h1'))
F.append(tableau(
    ['', 'ce que Michel voit', 'ce que ma reproduction donne'],
    [["calories", "<b>198 kcal</b>", "<b>198</b>"],
     ["proteines", "25 g", "<b>25</b>"],
     ["glucides", "41 g", "<b>41</b>"],
     ["lipides", "13 g", "<b>13</b>"],
     ["en-tete de fiche", "<b>48,3 kcal / 100 g</b>", "<b>48.3 kcal/100g</b>"]],
    [30 * mm, 60 * mm, 75 * mm]))
F.append(Spacer(1, 4))
F.append(P("Les quatre valeurs se deduisent toutes d'un seul pour-100 g : <b>48,3 kcal · 6,1 P · "
           "10 G · 3,2 L</b>, multiplie par 4,1. <b>Aucun calcul de l'app n'est faux</b> — "
           "" + C % 'Math.round(48.3 x 4.1) = 198' + ", et ainsi de suite pour les trois autres."))
F.append(encadre(
    "LE VRAI DESACCORD EST ENTRE DEUX POUR-100 g",
    "Cote <b>energie</b>, la fiche annonce <b>48,3 kcal/100 g</b>. Cote <b>macros</b>, les memes "
    "6,1 P / 10 G / 3,2 L valent <b>92,9 kcal/100 g</b> (" + C % '6,1x4 + 10x4 + 3,2x9' + "). "
    "<b>Un facteur 1,9.</b> <i>Deux pour-100 g qui ne parlent pas de la meme chose — et l'app les "
    "recopie tous les deux fidelement.</i>"))
F.append(Spacer(1, 5))

F.append(P("2. Le garde-fou existe, et il a raison", 'h1'))
F.append(P("Premiere surprise de la mesure : <b>il n'est pas muet</b>. Voici ce qu'il affiche, "
           "releve a l'ecran :"))
F.append(bloc_code(
    "  198 kcal ne colle pas a ces macros : 25 g de proteines, 41 g de\n"
    "  glucides et 13 g de lipides donnent 381 kcal.\n"
    "                                              [ Mettre 381 kcal ]",
    "le texte reel de l'avertissement, avec son bouton de correction"))
F.append(P("Ses deux seuils sont <b>tres largement</b> franchis : ecart <b>183 kcal</b> (seuil 60) "
           "et <b>48 %</b> (seuil 25 %). L'exception &laquo; boisson alcoolisee &raquo; ne s'applique "
           "pas — elle ne vaut que quand les calories sont <b>en trop</b>, ici elles manquent."))
F.append(Spacer(1, 3))

F.append(P("3. LE DEFAUT — une position, pas un calcul", 'h1'))
F.append(tableau(
    ['mesure', 'valeur'],
    [["hauteur de la fiche (" + C % '#modal' + ")", "<b>1 907 px</b>"],
     ["hauteur visible", "<b>775 px</b>"],
     ["position de l'alerte quand elle apparait", "<b>top 1 734</b> — soit <b>1 132 px sous la zone visible</b>"],
     ["apres defilement jusqu'en bas", "top 602 — <b>visible</b>"],
     ["distance champ calories -&gt; alerte", "<b>150 px</b>, avec " + C % 'af-carbs' + ", " +
      C % 'af-fat' + " et " + C % 'af-cal-btn' + " entre les deux"]],
    [62 * mm, 103 * mm]))
F.append(Spacer(1, 5))
F.append(encadre(
    "ET LE GESTE AGGRAVE LE PROBLEME",
    "On touche la pastille <b>&laquo; paquet entier &raquo; tout en HAUT</b> de la fiche ; les quatre "
    "valeurs se recalculent ; et l'avertissement apparait <b>tout en BAS</b>. La personne regarde "
    "l'endroit ou elle vient d'agir — l'app repond 1 132 px plus loin.<br/><br/>"
    "<b>L'alerte est atteignable</b> : en defilant jusqu'en bas, elle devient visible (mesure). "
    "<i>Mais un avertissement qu'on ne voit qu'en defilant ne protege que ceux qui defilaient deja.</i>"))
F.append(Spacer(1, 5))
F.append(encadre(
    "C'EST UNE FAMILLE DEJA CONNUE DU DEPOT",
    "ft-v1182 : <i>&laquo; les resultats de recherche etaient calcules, ils tombaient sous l'ecran &raquo;</i>. "
    "Meme forme exactement : <b>le travail est fait, le resultat est juste, et il est hors du champ "
    "de vision</b>. La difference est que la, il s'agissait d'un confort ; ici, c'est un garde-fou.", ORANGE))
F.append(Spacer(1, 5))

F.append(P("4. D'ou vient le 48,3 — ce qui est mesure, et ce qui ne l'est pas", 'h1'))
F.append(bloc_code(code('app.js', 'lignes', "const kcal100=_per100d1(n['energy-kcal_100g']", 0, 0),
                   "app.js — la seule ligne qui fabrique le pour-100 g des calories d'une fiche produit"))
F.append(tableau(
    ['', ''],
    [["<b>MESURE</b>",
      "les quatre valeurs de Michel se reconstituent exactement depuis un pour-100 g de "
      "48,3 / 6,1 / 10 / 3,2 ; le garde-fou se declenche et formule juste ; sa position est de "
      "1 132 px sous la zone visible."],
     ["<b>NON MESURE, et ca ne peut pas l'etre d'ici</b>",
      "<b>que le 48,3 vienne bien de la fiche Open Food Facts.</b> Le proxy de ce conteneur refuse "
      "" + C % 'openfoodfacts.org' + ", donc la fiche employee est <b>fabriquee</b> a partir de ses "
      "chiffres a l'ecran. <i>Je le dis plutot que de le presenter comme etabli.</i>"],
     ["<b>ce qu'on peut quand meme affirmer</b>",
      "<b>le code ne peut pas fabriquer ce nombre.</b> Il recopie " + C % 'energy-kcal_100g' +
      ", ou convertit " + C % 'energy_100g / 4.184' + " a defaut. Il n'y a pas de troisieme chemin."]],
    [46 * mm, 119 * mm]))
F.append(Spacer(1, 6))

F.append(P("5. Ce qu'il faut faire — et ce qui n'est PAS a l'app", 'h1'))
F.append(encadre(
    "CE QUI N'EST PAS A L'APP DE TRANCHER",
    "<b>Lequel des deux pour-100 g est juste.</b> Elle ne peut pas le savoir : les deux viennent de "
    "la meme fiche, et aucun n'est absurde pris isolement. Corriger silencieusement les calories "
    "serait decider a la place de la personne — exactement ce que la regle du jour precedent "
    "interdit. <b>Le bouton &laquo; Mettre 381 kcal &raquo; est deja la bonne reponse</b> : "
    "l'app montre, la personne tranche. <i>Il manque seulement qu'on le VOIE.</i>"))
F.append(Spacer(1, 5))
F.append(encadre(
    "LE CORRECTIF PROPOSE — ET LE MECANISME EXISTE DEJA",
    "Faire <b>remonter l'avertissement a la vue</b> au moment ou il apparait, <b>et seulement s'il "
    "est hors champ</b>. <b>Aucun mecanisme neuf</b> : ft-v1182 a deja pose ce geste dans cette "
    "meme application — un " + C % 'scrollIntoView' + " doux, conditionnel, avec la hauteur lue sur "
    "" + C % 'visualViewport' + " et <b>non</b> sur " + C % 'innerHeight' + ".<br/><br/>"
    "<b>Et ce detail-la n'est pas cosmetique</b> : sur iOS, " + C % 'innerHeight' + " <b>ne "
    "retrecit pas</b> quand le clavier s'ouvre. Un test ecrit dessus croirait l'alerte visible "
    "alors qu'elle serait cachee sous le clavier — c'est-a-dire precisement le cas de quelqu'un qui "
    "vient de taper une quantite.", VERT))
F.append(Spacer(1, 6))
F.append(encadre(
    "ETAT",
    "<b>Rien n'est corrige, rien n'est deploye.</b> La version en ligne reste <b>ft-v1190</b>. "
    "Ce document rapporte une <b>mesure</b>, pas un correctif : la decision d'agir appartient a "
    "Michel. Le cas est consigne dans " + C % 'docs/JOURNAL-DE-TEST.md' + " a l'etat "
    "<b>&laquo; prete &raquo;</b> — l'attendu est verifiable par du code, donc il peut devenir un "
    "temoin permanent.", GRIS))


doc = SimpleDocTemplate(OUT, pagesize=A4,
 leftMargin=22 * mm, rightMargin=22 * mm,
 topMargin=20 * mm, bottomMargin=22 * mm,
 title='Force Tracker — les kcal contredisent les macros : le garde-fou a raison, et il est hors de l ecran',
 author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
