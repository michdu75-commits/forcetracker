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
                      'Force Tracker — lentilles Raynal : la trace complete, avant tout correctif — 11/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


F = []
F.append(P("Lentilles Raynal : la trace complete, avant tout correctif", 'titre'))
F.append(P("Force Tracker — 11/09/2026. Reponse au cahier de GPT. Le cas "
           "(" + C % '3021690201123' + ", 410 g) est <b>reproduit au chiffre pres</b> et trace "
           "champ par champ. <b>Rien n'a ete corrige, rien n'a ete deploye</b> : la consigne etait "
           "de tracer d'abord. Deux resultats deplacent le probleme.", 'sous'))

F.append(encadre(
    'LES DEUX RESULTATS QUI DEPLACENT LE PROBLEME',
    "<b>(1) Le test de coherence demande n'est pas a ajouter : il EXISTE, il emploie deja la formule "
    "4/4/9, il tolere deja un ecart, et il s'est bien declenche ici.</b> Il dit <i>&laquo; 198 kcal ne "
    "colle pas a ces macros, elles donnent 381 kcal &raquo;</i> avec un bouton de correction — et il ne "
    "repare rien en silence. Son seul defaut est d'etre <b>1 132 px sous l'ecran</b>.<br/><br/>"
    "<b>(2) Le message &laquo; produit SEC &raquo; ne vient d'aucune categorie ni d'aucun champ source : "
    "c'est un MOT du nom.</b> Ici <b>&laquo; Lentille &raquo;</b>. La regle ne contient aucun mot de "
    "cuisson, donc elle ne peut pas voir le <b>&laquo; Cuisinees &raquo;</b> ecrit juste a cote."))
F.append(Spacer(1, 6))

F.append(P("1. La trace de provenance, champ par champ", 'h1'))
F.append(P("<b>Tout vient de la MEME reponse Open Food Facts, en un seul appel.</b> Aucune fusion, "
           "aucune donnee locale, aucun repli."))
F.append(tableau(
    ['valeur affichee', 'champ source exact', 'transformation'],
    [["<b>48,3</b> kcal / 100 g", C % "nutriments['energy-kcal_100g']",
      "recopie, arrondi a 1 decimale (" + C % '_per100d1' + ")"],
     ["<b>6,1</b> P / 100 g", C % "nutriments['proteins_100g']", "recopie, 1 decimale"],
     ["<b>10</b> G / 100 g", C % "nutriments['carbohydrates_100g']", "recopie, 1 decimale"],
     ["<b>3,2</b> L / 100 g", C % "nutriments['fat_100g']", "recopie, 1 decimale"],
     ["<b>205 g</b> (portion)", C % 'serving_quantity', "pastille &laquo; portion fabricant &raquo;"],
     ["<b>410 g</b> (paquet)", C % 'quantity' + " = " + C % '"410 g"', "parse -&gt; pastille &laquo; paquet entier &raquo;"],
     ["<b>198 / 25 / 41 / 13</b>", "<b>aucun</b> — ils sont <b>DERIVES</b>",
      "les quatre per-100 g multiplies par <b>4,1</b>, arrondis a l'entier"]],
    [34 * mm, 66 * mm, 65 * mm]))
F.append(Spacer(1, 4))
F.append(P("La ligne enregistree porte sa provenance en entier : " + C % "saisie:'scan'" + " · " +
           C % "origine:'off'" + " · " + C % "sourceId:'3021690201123'" + " · " +
           C % "etat:'tel-que-vendu'" + " · le " + C % 'per100' + " complet."))
F.append(encadre(
    "LE DESACCORD EST ENTRE DEUX POUR-100 g DE LA MEME FICHE",
    "Cote <b>energie</b> : <b>48,3 kcal/100 g</b>. Cote <b>macros</b> : les memes 6,1 / 10 / 3,2 valent "
    "<b>92,9 kcal/100 g</b>. <b>Un facteur 1,9.</b> <i>L'app recopie les deux fidelement — elle ne "
    "fabrique ni l'un ni l'autre.</i>"))
F.append(Spacer(1, 5))

F.append(P("2. Les sept hypotheses du cahier, tranchees une par une", 'h1'))
F.append(bloc_code(code('app.js', 'lignes', "const kcal100=_per100d1(n['energy-kcal_100g']", 0, 0),
                   "app.js — la SEULE ligne qui fabrique le pour-100 g des calories. Il n'y a pas de troisieme chemin."))
F.append(tableau(
    ['hypothese de GPT', 'verdict', 'sur quoi il repose'],
    [["une ancienne <b>donnee locale</b>", "<b>ELIMINEE</b>",
      "journal vide au depart ; " + C % '_bcNutr' + " est construit depuis la reponse reseau, mesure"],
     ["une <b>valeur recalculee</b> par l'app", "<b>ELIMINEE</b>",
      "les calories ne sont jamais recalculees depuis les macros — le code ci-dessus est le seul chemin"],
     ["une <b>fusion de plusieurs sources</b>", "<b>ELIMINEE cote app</b>",
      "les quatre valeurs sortent du <b>meme objet</b> " + C % 'nutriments' + ", dans la <b>meme reponse</b>"],
     ["une <b>mauvaise propriete lue</b> dans le JSON", "<b>ELIMINEE</b>",
      "la propriete lue est bien " + C % 'energy-kcal_100g' + ", le champ per-100 g standard"],
     ["un <b>fallback</b>", "<b>POSSIBLE</b>",
      "il en existe exactement un : si " + C % 'energy-kcal_100g' + " est absent, l'app prend " +
      C % 'energy_100g' + " et divise par 4,184"],
     ["une <b>conversion kJ -&gt; kcal</b>", "<b>POSSIBLE</b>",
      "c'est ce meme repli. " + C % '202 / 4,184 = 48,3' + " — donc un " + C % 'energy_100g' +
      " a 202 produirait exactement le chiffre observe"],
     ["directement <b>Open Food Facts</b>", "<b>POSSIBLE</b>",
      "si " + C % 'energy-kcal_100g' + " vaut 48,3 dans la base, l'app le recopie sans rien faire"]],
    [44 * mm, 28 * mm, 93 * mm]))
F.append(Spacer(1, 5))
F.append(encadre(
    "CE QUI MANQUE POUR TRANCHER LES TROIS DERNIERES — ET COMMENT L'OBTENIR EN 30 SECONDES",
    "<b>Le proxy de ce conteneur refuse " + C % 'openfoodfacts.org' + "</b> : verifie, le gateway "
    "repond <b>403 au CONNECT</b> sur " + C % 'world.' + " et " + C % 'fr.' + ". La fiche employee "
    "dans la mesure est donc <b>FABRIQUEE</b> a partir des chiffres de l'ecran — elle reproduit le cas, "
    "elle ne prouve pas son origine. <i>Je le dis plutot que de presenter une deduction comme un "
    "releve.</i><br/><br/>"
    "<b>Deux champs suffisent a trancher</b>, en ouvrant cette adresse sur un telephone :<br/>"
    "" + C % 'world.openfoodfacts.org/api/v2/product/3021690201123.json?fields=nutriments' + "<br/>"
    "&#8226; si <b>" + C % 'energy-kcal_100g' + " = 48.3</b> -&gt; la donnee source est fausse, l'app est "
    "fidele (hypothese <b>B</b>).<br/>"
    "&#8226; s'il est <b>absent</b> et que <b>" + C % 'energy_100g' + " = 202</b> -&gt; c'est le repli "
    "kJ, et la question devient : 202 est-il vraiment des kJ ? (hypothese <b>D</b>).", ORANGE))
F.append(Spacer(1, 5))

F.append(P("3. A / B / C / D / E — l'etat de chaque classe", 'h1'))
F.append(tableau(
    ['classe', 'etat'],
    [["<b>A</b> — energie correcte, macros fausses", "<b>peu probable</b>, et c'est un <b>avis</b>, pas "
      "une mesure : 6,1 P / 10 G / 3,2 L est la composition attendue de lentilles cuisinees en conserve"],
     ["<b>B</b> — macros correctes, energie source fausse", "<b>l'hypothese la plus economique</b> : "
      "93 kcal/100 g est la valeur attendue pour ce produit, 48,3 ne l'est pas. <b>Non prouvee</b> sans "
      "la fiche."],
     ["<b>C</b> — sources differentes", "<b>eliminee chez Force Tracker</b> (un seul appel, un seul "
      "objet). <b>Non eliminee chez Open Food Facts</b> : energie et macros peuvent y avoir ete saisies "
      "par des contributeurs differents. <i>C'est le mecanisme qui expliquerait le mieux un ecart de "
      "facteur 2 sur une seule des cinq valeurs.</i>"],
     ["<b>D</b> — conversion erronee", "<b>possible</b>, et un seul endroit peut la produire (le repli "
      "kJ ci-dessus). Se tranche avec les deux champs."],
     ["<b>E</b> — donnee locale corrompue", "<b>ELIMINEE par la mesure</b>"]],
    [52 * mm, 113 * mm]))
F.append(Spacer(1, 6))

F.append(P("4. Le test de coherence : il existe deja", 'h1'))
F.append(P("Le cahier demande de l'ajouter. <b>Mesure : il est ecrit, il tourne, et il a parle sur ce "
           "cas.</b> Voici son texte reel, releve a l'ecran :"))
F.append(bloc_code(
    "  198 kcal ne colle pas a ces macros : 25 g de proteines, 41 g de\n"
    "  glucides et 13 g de lipides donnent 381 kcal.\n"
    "                                              [ Mettre 381 kcal ]",
    "l'avertissement tel qu'il s'affiche — un bouton, jamais une correction automatique"))
F.append(tableau(
    ['ce que le cahier demande', 'ce qui existe deja'],
    [["kcal theoriques = 4 P + 4 G + 9 L", "<b>exactement cette formule</b>"],
     ["tolerer un ecart raisonnable", "<b>deux seuils cumulatifs</b> : 60 kcal <b>et</b> 25 %. Ici "
      "l'ecart vaut 183 kcal et 48 % — largement au-dessus des deux."],
     ["ne pas reparer en silence", "<b>deja le cas</b> : un bouton propose, la personne tranche. "
      "Aucune reecriture automatique."],
     ["<b>ce qui manque reellement</b>",
      "<b>qu'on le VOIE.</b> La fiche fait 1 907 px pour 775 visibles ; l'alerte apparait a "
      "<b>1 132 px sous la zone visible</b>, alors que le geste qui la declenche (la pastille) est "
      "tout en haut. Elle est atteignable en defilant."]],
    [52 * mm, 113 * mm]))
F.append(Spacer(1, 6))

F.append(P("5. Le message &laquo; produit SEC &raquo; — condition exacte", 'h1'))
F.append(P("Le cahier demande : champ source, regle, mot-cle, categorie, fallback, condition exacte. "
           "<b>La reponse tient en une ligne, et il n'y a ni categorie, ni champ source, ni fallback.</b>"))
F.append(bloc_code(code('app.js', 'lignes', 'const _SECS_QUI_GONFLENT=', 0, 0),
                   "app.js — la regle entiere. Elle est testee sur le NOM, et sur rien d'autre."))
F.append(P("Mot declencheur ici : <b>&laquo; Lentille &raquo;</b>. <b>Mesure : la regle ne contient "
           "aucun mot de cuisson</b> — ni " + C % 'cuisine' + ", ni " + C % 'conserve' + ", ni " +
           C % 'boite' + ", ni " + C % 'pret' + ". <i>Elle ne peut donc pas voir le mot qui, dans ce "
           "nom precis, la contredit.</i>"))
F.append(tableau(
    ['nom teste', 'verdict mesure'],
    [["Riz <b>cuit</b> en sachet", "SEC"],
     ["Poelee de lentilles <b>cuisinees</b>", "SEC"],
     ["Salade de pois chiches", "SEC"],
     ["Soupe de lentilles corail", "SEC"],
     ["Pates <b>fraiches cuites</b>", "SEC"],
     ["Cassoulet aux <b>haricots secs</b>", "<b>muet</b> — alors qu'il en contient"]],
    [95 * mm, 70 * mm]))
F.append(Spacer(1, 4))
F.append(encadre(
    "DEUX CHOSES QUE CETTE MESURE APPREND",
    "<b>(1) C'est la famille n&#176;1 du depot</b> — <i>&laquo; le premier match gagnant &raquo;</i>, "
    "recensee plus de douze fois : un mot suffit, et le contexte qui l'annule n'est jamais lu.<br/><br/>"
    "<b>(2) La donnee qui trancherait n'est meme pas demandee.</b> Les champs reclames a Open Food "
    "Facts sont mesures : " + C % 'product_name' + ", " + C % 'brands' + ", " + C % 'quantity' + ", " +
    C % 'nutriments' + ", " + C % 'serving_quantity' + ", " + C % 'nutriscore_grade' + ", " +
    C % 'nova_group' + ", " + C % 'additives_n' + ", " + C % 'labels_tags' + ", l'image. "
    "<b>" + C % 'categories_tags' + " n'y est pas.</b> <i>On ne peut pas reprocher a la regle d'ignorer "
    "la categorie : personne ne la lui donne.</i>"))
F.append(Spacer(1, 5))
F.append(encadre(
    "ET UNE ATTENTE A MOI QUI ETAIT FAUSSE, DITE PLUTOT QUE TUE",
    "Mon temoin exigeait " + C % 'etat === null' + " (<i>&laquo; l'app ne devine pas le cru/cuit &raquo;</i>). "
    "<b>Mesure : elle pose " + C % "etat:'tel-que-vendu'" + "</b> sur un scan — et c'est <b>correct</b>, "
    "Open Food Facts donne bien les valeurs telles que vendues. <b>Mais ca nomme le vrai trou</b> : "
    "<i>&laquo; tel que vendu &raquo; ne distingue pas un paquet SEC d'une conserve CUISINEE</i> — et "
    "c'est exactement la distinction dont ce message a besoin."))
F.append(Spacer(1, 6))

F.append(P("6. Etat, et ce qui reste a decider", 'h1'))
F.append(tableau(
    ['point', 'etat'],
    [["<b>rien n'est corrige, rien n'est deploye</b>",
      "la version en ligne reste <b>ft-v1190</b>. Ce document est une <b>mesure</b>, pas un correctif."],
     ["<b>correctif 1 — rendre l'alerte visible</b>",
      "<b>aucun mecanisme neuf</b> : ft-v1182 a deja pose ce geste dans cette application — un " +
      C % 'scrollIntoView' + " doux, <b>conditionnel</b>, avec la hauteur lue sur " +
      C % 'visualViewport' + " et <b>non</b> " + C % 'innerHeight' + " (sur iOS, " + C % 'innerHeight' +
      " ne retrecit pas quand le clavier s'ouvre — un test ecrit dessus croirait l'alerte visible "
      "alors qu'elle serait sous le clavier)."],
     ["<b>correctif 2 — la regle SEC</b>",
      "la faire taire quand le nom dit lui-meme qu'il est cuisine. <b>A decider</b> : se contenter du "
      "nom, ou demander " + C % 'categories_tags' + " a Open Food Facts — la seconde option est plus "
      "sure et coute un champ de plus dans une requete deja faite."],
     ["<b>ce qui n'est PAS a l'app</b>",
      "choisir entre 48,3 et 381. Les deux viennent de la meme fiche et aucun n'est absurde isolement. "
      "<b>Le bouton est deja la bonne reponse</b> : l'app montre, la personne tranche."],
     ["<b>hors perimetre, comme demande</b>",
      "l'historique corrompu n'est pas touche ; le bug quantite est clos et n'est pas rouvert."]],
    [50 * mm, 115 * mm]))


doc = SimpleDocTemplate(OUT, pagesize=A4,
 leftMargin=22 * mm, rightMargin=22 * mm,
 topMargin=20 * mm, bottomMargin=22 * mm,
 title='Force Tracker — lentilles Raynal : trace complete de provenance, coherence kcal/macros, et la regle SEC',
 author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
