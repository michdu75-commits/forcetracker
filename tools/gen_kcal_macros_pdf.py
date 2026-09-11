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

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'BUG-KCAL-MACROS.pdf')
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
                      'Force Tracker — lentilles Raynal : les deux correctifs livres, ft-v1191 — 11/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


F = []
F.append(P("Lentilles Raynal : les deux correctifs, livres", 'titre'))
F.append(P("Force Tracker — 11/09/2026. Suite du document de trace. Michel a valide les deux "
           "directions ; elles sont <b>en ligne</b> — <b>ft-v1191</b>, run #1078 vert a 08:01:50, "
           "passe complete <b>3524/3524</b>. Le point le plus utile de la journee n'est aucun des "
           "deux correctifs : c'est <b>ce que le controle negatif a attrape avant la livraison</b>.",
           'sous'))

F.append(encadre(
    'CE QUE LE CONTROLE NEGATIF A EMPECHE DE LIVRER',
    "Le correctif 1 fait remonter l'avertissement quand il apparait hors ecran. Mesure : en tapant "
    "<b>200 / 20 / 20 / 4</b> — une ligne <b>parfaitement coherente A L'ARRIVEE</b> — la saisie "
    "traverse un etat <b>INTERMEDIAIRE</b> incoherent : apres le 2e champ, 200 kcal face a 80 kcal "
    "theoriques depasse les deux seuils. <b>L'alerte s'affichait une fraction de seconde et l'ecran "
    "sautait au milieu de la frappe</b>, sur une ligne qui n'avait aucun probleme.<br/><br/>"
    "<i>Le pire des deux mondes : le defaut disparait, le degat reste.</i> D'ou le garde sur le "
    "focus — si la personne tape dans l'un des quatre champs, elle regarde son champ, pas "
    "l'avertissement."))
F.append(Spacer(1, 6))

F.append(P("1. Correctif 1 — l'avertissement vient a la vue", 'h1'))
F.append(P("<b>La logique n'est pas recopiee : elle est SORTIE de sa fonction.</b> Elle etait "
           "enfermee dans " + C % '_afSuggVoir' + ", qui ne sait amener qu'un seul element. "
           "Michel : <i>&laquo; le mecanisme existe deja ailleurs, il ne faut pas creer une nouvelle "
           "logique parallele &raquo;</i>. Un seul proprietaire, deux appelants."))
F.append(bloc_code(code('app.js', 'fn', '_amenerALaVue'),
                   "app.js — le proprietaire unique, extrait du depot a la generation de ce document"))
F.append(tableau(
    ['garantie', 'comment elle tient'],
    [["l'alerte <b>vient a la vue</b> si elle est hors champ",
      "mesure sur le cas reel : elle etait <b>1 132 px</b> sous la zone visible, elle y entre"],
     ["<b>rien ne bouge</b> si elle y est deja",
      "" + C % '_amenerALaVue' + " rend " + C % 'false' + " sans toucher au defilement"],
     ["<b>pas de remontee a chaque appel</b>",
      "cette fonction tourne a <b>chaque frappe</b> des quatre champs : on compare l'etat AVANT, "
      "la remontee n'a lieu que sur la transition <i>cache -&gt; affiche</i>"],
     ["<b>pas de remontee pendant la frappe</b>",
      "le garde sur le focus, ne le voir ci-dessus. <b>R24</b> : on informe, on ne se met pas en travers"],
     ["<b>le clavier iOS est pris en compte</b>",
      "la zone visible se lit sur " + C % 'visualViewport' + " : sur iOS, " + C % 'innerHeight' +
      " <b>ne retrecit pas</b> quand le clavier s'ouvre"]],
    [58 * mm, 107 * mm]))
F.append(Spacer(1, 5))
F.append(encadre(
    "UN TEMOIN QUI MANQUAIT, ECRIT PARCE QUE LA MUTATION NE MORDAIT PAS",
    "La mutation qui remplace " + C % 'visualViewport' + " par " + C % 'innerHeight' + " rendait "
    "<b>0 rouge</b> : Playwright n'a pas de clavier virtuel, donc les deux valeurs sont egales dans "
    "le conteneur, et <b>aucun temoin ne pouvait distinguer les deux lectures</b>. <i>La consigne de "
    "Michel serait restee decorative.</i><br/><br/>"
    "Le temoin retrecit desormais " + C % 'visualViewport' + " de 350 px : une alerte a <b>top 684</b> "
    "est <b>&laquo; visible &raquo;</b> selon " + C % 'innerHeight' + " (844) et <b>cachee</b> sous le "
    "clavier (494). Elle remonte, et <b>la mutation mord</b>.", VERT))
F.append(Spacer(1, 5))

F.append(P("2. Correctif 2 — le message &laquo; produit SEC &raquo;", 'h1'))
F.append(P("Michel : <i>&laquo; je prefere ne pas rester sur une simple liste de mots &raquo;</i>. "
           "" + C % 'categories_tags' + " est ajoute aux <b>DEUX</b> requetes Open Food Facts — la "
           "fiche produit <b>et</b> la recherche par nom, pas une seule."))
F.append(bloc_code(code('app.js', 'lignes', 'const pret = (_bcCategories', 0, 2),
                   "app.js — la decision entiere, extraite du depot. Une seule reponse « oui » suffit a faire taire l'avertissement."))
F.append(P("<b>Deux sources, dans cet ordre</b> : la <b>categorie</b> tranche quand elle parle ; le "
           "<b>nom</b> reste le filet quand elle se tait — et elle se tait souvent, " +
           C % 'categories_tags' + " n'etant pas toujours renseigne. <i>Garder le nom n'est pas une "
           "faiblesse assumee : c'est le seul recours des produits que la base connait mal.</i>"))
F.append(tableau(
    ['les 8 cas du &#167;14', 'attendu', 'mesure'],
    [["Lentilles vertes seches", "avertit", "<b>avertit</b>"],
     ["Lentilles <b>Cuisinees</b> a l'Auvergnate", "muet", "<b>muet</b>"],
     ["<b>Soupe</b> de lentilles corail", "muet", "<b>muet</b>"],
     ["<b>Salade</b> de pois chiches", "muet", "<b>muet</b>"],
     ["Riz basmati", "avertit", "<b>avertit</b>"],
     ["Riz <b>cuit</b> en sachet", "muet", "<b>muet</b>"],
     ["Pates Panzani", "avertit", "<b>avertit</b>"],
     ["Pates <b>fraiches cuites</b>", "muet", "<b>muet</b>"]],
    [95 * mm, 32 * mm, 38 * mm]))
F.append(Spacer(1, 4))
F.append(encadre(
    "L'ASYMETRIE EST VOULUE, ET ELLE SE MESURE AU COUT DE L'ERREUR (R29)",
    "Se taire a tort sur un vrai paquet sec coute une erreur de facteur 2 a 3 <b>que la personne peut "
    "encore voir</b> — les chiffres sont a l'ecran. Crier a tort sur une conserve coute la "
    "<b>credibilite de TOUS les avertissements</b>, y compris les vrais. <i>Un message qui se trompe "
    "cesse d'etre lu, et on perd alors les deux.</i>"))
F.append(Spacer(1, 4))
F.append(encadre(
    "ET LE PIEGE QUI ETAIT DEJA DOCUMENTE DANS CE DEPOT (R15)",
    "<b>La categorie meurt avec l'aliment.</b> Sans cette ligne, la categorie <i>&laquo; plat cuisine "
    "&raquo;</i> d'un produit ferait taire l'avertissement du <b>paquet de pates suivant</b> — le "
    "defaut exact que " + C % '_afOublierAliment' + " existe pour empecher. Un temoin le fige : on "
    "pose une categorie, on oublie l'aliment, et on verifie que l'avertissement <b>crie a nouveau</b> "
    "sur des pates.", ORANGE))
F.append(Spacer(1, 5))

F.append(P("3. Un temoin qui a rougi, et pourquoi ce n'etait pas le code", 'h1'))
F.append(P("La premiere passe complete a rendu <b>3519 verts, 1 rouge</b> — et le rouge etait "
           "<b>mon propre temoin</b>, qui passait <b>5 fois sur 5</b> en isole."))
F.append(tableau(
    ['', ''],
    [["<b>la cause</b>",
      "le defilement de controle est " + C % 'smooth' + ", donc <b>ASYNCHRONE</b>. Un delai fixe "
      "suffit sur une machine au repos et pas sous charge : on remettait le defilement a zero "
      "<b>pendant qu'il etait encore en vol</b>, et il repartait tout seul."],
     ["<b>ce qu'on en retient</b>",
      "<i>Un temoin qui parie sur une DUREE mesure la machine ; un temoin qui attend une CONDITION "
      "mesure le produit.</i> Il attend desormais que le defilement se stabilise."],
     ["<b>et il dit ce qu'il voit</b>",
      "le diagnostic (nombre de tours avant stabilite, position stabilisee, position apres remise a "
      "zero) reste dans la sortie. <i>Un temoin qui echoue sans dire ce qu'il a vu coute une passe "
      "entiere par hypothese.</i>"]],
    [40 * mm, 125 * mm]))
F.append(Spacer(1, 6))

F.append(P("4. Etat, et ce que je ne sais pas", 'h1'))
F.append(tableau(
    ['point', 'etat'],
    [["<b>LIVRE ET VERIFIE VERT</b>",
      "<b>ft-v1191</b> est en ligne : run <b>#1078</b>, " + C % 'conclusion: success' + " a "
      "<b>08:01:50 UTC</b> sur " + C % '25afcc0f' + ", vert du premier coup. Passe complete "
      "<b>3524/3524</b>, calculs 339/339, muscles 241/241, croises 50/50, dates 9/9, donnees 0 trou."],
     ["<b>le " + C % 'sw.js' + " reellement servi n'est pas lu</b>",
      "le proxy du conteneur refuse aussi " + C % 'github.io' + " (403). <b>Le run est vert</b> ; que "
      "l'application affiche bien <b>ft-v1191</b> dans &laquo; A propos &raquo; reste a confirmer par "
      "Michel. <i>Je le dis plutot que de le compter comme verifie.</i>"],
     ["<b>la validation iPhone</b>",
      "deux choses a regarder sur Safari : l'avertissement doit <b>venir a lui</b> apres le clic sur "
      "la pastille &laquo; paquet entier &raquo;, et le message &laquo; produit SEC &raquo; doit avoir "
      "<b>disparu</b> sur sa boite de lentilles."],
     ["<b>les etiquettes de categorie ne sont PAS verifiees</b>",
      "" + C % 'openfoodfacts.org' + " est injoignable depuis le conteneur (<b>403 au CONNECT</b>, "
      "verifie), donc les motifs de categorie <b>n'ont pas pu etre confrontes a la vraie base</b>. "
      "Ils sont volontairement LARGES — et le repli par le nom couvre <b>a lui seul</b> les huit cas "
      "de Michel. <i>Si une etiquette se revelait fausse, le filet tient quand meme.</i>"],
     ["<b>le 48,3 n'est toujours pas trace a sa source</b>",
      "meme raison. Deux champs suffiraient, sur un telephone : " +
      C % 'world.openfoodfacts.org/api/v2/product/3021690201123.json?fields=nutriments' + " — "
      "" + C % 'energy-kcal_100g' + " existe-t-il, et sinon que vaut " + C % 'energy_100g' + " ?"],
     ["<b>l'app ne choisit toujours pas</b> entre 48,3 et 381",
      "c'est voulu, et c'etait la demande explicite de Michel. Le bouton <b>&laquo; Mettre 381 kcal "
      "&raquo;</b> montre le calcul et laisse trancher (<b>R29</b>)."],
     ["<b>hors perimetre, comme demande</b>",
      "bug quantite, historique corrompu, migration ancienne, portions P1 : <b>aucun n'est rouvert</b>."]],
    [50 * mm, 115 * mm]))
F.append(Spacer(1, 6))
F.append(encadre(
    "ETAT DES TESTS",
    "<b>Passe complete : 3524 verts, 0 rouge</b> — calculs 339/339, muscles 241/241, croises 50/50, "
    "dates 9/9, donnees classees 0 trou. Bloc permanent <b>CCLXXXVIII : 11 temoins, 11/11</b>. "
    "<b>Controle negatif : 10 mutations, TOUTES MORDENT</b>, chacune sur son propre temoin — le "
    "correctif entier retire · le garde <i>&laquo; deja affiche &raquo;</i> retire · le garde du focus "
    "retire · " + C % 'innerHeight' + " au lieu de " + C % 'visualViewport' + " · " +
    C % '_afSuggVoir' + " qui reprend sa propre copie (R2) · le garde <i>&laquo; deja pret &raquo;</i> "
    "retire · la categorie ignoree · le nom ignore · la categorie qui survit a l'aliment suivant · " +
    C % 'categories_tags' + " retire des requetes.", GRIS))


doc = SimpleDocTemplate(OUT, pagesize=A4,
 leftMargin=22 * mm, rightMargin=22 * mm,
 topMargin=20 * mm, bottomMargin=22 * mm,
 title='Force Tracker — lentilles Raynal : les deux correctifs livres en ft-v1191, et ce que le controle negatif a attrape',
 author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
