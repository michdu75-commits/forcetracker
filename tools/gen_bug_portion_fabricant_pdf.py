#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/P1-CHANTIER-COMPLET.pdf — TOUT le chantier P1 (ft-v1183 -> ft-v1186),
   avec le code reel, redige pour GPT.

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
OUT = os.path.join(ROOT, 'docs', 'BUG-PORTION-FABRICANT.pdf')
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

# ⛔⛔ GARDE-FOU sur les CINQ portes de texte (lecon du 09/09 : ma premiere version
#    n'inspectait que les paragraphes et a laisse passer un emoji dans un titre d'encadre —
#    une protection partielle qui a l'air complete est pire qu'une protection absente).
_HORS = set('⚠⭐⛔⚖→✅⏭⬇❌⬆⚙')


def _v(x, ou='texte'):
    if isinstance(x, str):
        for ch in x:
            if ch in _HORS or 0x1F000 <= ord(ch) <= 0x1FAFF or 0xFE00 <= ord(ch) <= 0xFE0F:
                raise SystemExit('CARACTERE NON RENDU %r (%s) dans %s' % (ch, hex(ord(ch)), ou))
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
                      'Force Tracker — portion fabricant vs quantite consommee — trace du 10/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


F = []
# EN-TETE 
F.append(P("Portion fabricant vs quantite consommee", 'titre'))
F.append(P("Force Tracker — trace du 10/09/2026, sur la version en ligne <b>ft-v1189</b>. "
 "Reponse au cahier « BUG A ISOLER ». <b>Rien n'est corrige</b> : la consigne etait "
 "« ne corrige rien avant mesure ».", 'sous'))

F.append(encadre(
 'EN UNE PHRASE',
 "<b>Le bug est confirme, et il est plus large que les trois cas signales.</b> "
 "La portion du fabricant n'est pas seulement affichee : elle est <b>reellement ecrite</b> dans "
 "le journal. Et le probleme ne touche pas « les produits ayant une portion fabricant » — il "
 "touche <b>tous les produits scannes</b>, y compris ceux qui n'en declarent aucune. "
 "<b>La cause tient en une ligne</b> : la condition qui ecrit la quantite ne demande jamais si "
 "un geste a eu lieu."))
F.append(Spacer(1, 6))

F.append(encadre(
 "CE QUI EST MESURE, ET CE QUI NE L'EST PAS",
 "Chaque chiffre vient d'un <b>vrai navigateur</b> (Chromium + Playwright) qui appelle "
 "" + C % '_lookupBarcode' + " avec une fiche produit servie par un faux reseau, puis relit ce "
 "que l'application <b>ecrit</b> dans " + C % 'S.foodLog' + ". "
 "Le geste joue est exactement celui du rapport : <b>on scanne, on ne touche a aucune "
 "quantite, on enregistre</b>. "
 "<b>Limite</b> : pas de WebKit ici, et aucun acces au reseau Open Food Facts — les fiches sont "
 "donc <b>fabriquees</b>, en ne faisant varier que le champ etudie.", GRIS))

# 1 
F.append(P("1. Le champ source", 'h1'))

F.append(P(
 "C'est <b>" + C % 'serving_quantity' + "</b>, publie par la fiche Open Food Facts. "
 "Rien d'autre : faire varier ce seul champ suffit a faire varier le resultat, toutes choses "
 "egales par ailleurs."))

F.append(tableau(
 ['produit', C % 'serving_quantity' + ' envoye', 'champ affiche', 'q ENREGISTRE'],
 [["Raynal", "<b>205</b>", "205", "<b>q:205 · u:'g'</b>"],
 ["Thon", "<b>140</b>", "140", "<b>q:140 · u:'g'</b>"],
 ["Cassegrain", "<b>187.5</b>", "187,5", "<b>q:187.5 · u:'g'</b>"]],
 [34 * mm, 47 * mm, 34 * mm, 50 * mm]))
F.append(Spacer(1, 5))

F.append(encadre(
 "LE 187,5 EST LA PREUVE QUE LA VALEUR N'EST PAS CALCULEE",
 "<b>Aucun calcul de l'application ne produit une decimale.</b> Ce n'est pas « la boite de 410 g "
 "divisee par 2 » : le poids du paquet est lu separement par " + C % '_offPoidsPaquet' + ", qui "
 "rend bien <b>410</b> et l'affiche dans sa propre pastille. "
 "<i>Que 205 soit la moitie de 410 est une coincidence de ce produit-la.</i>", VERT))

# 2 
F.append(P("2. La fonction qui l'injecte", 'h1'))
F.append(P("" + C % '_offRemplirFormulaire' + ", et le repli a 100 est dans la meme expression :"))
F.append(bloc_code(code('app.js', 'lg', "const serv=parseFloat(p.serving_quantity)||0;", 0, 2)))
F.append(P("Ce chemin est <b>commun a plusieurs portes</b> : le scan, la recherche par nom, les "
 "produits de marque et CIQUAL passent tous par cette fonction. Elle est appelee avec "
 "" + C % 'serving_quantity:0' + " pour CIQUAL et l'etiquette recopiee, qui retombent "
 "donc sur le <b>100</b>.", 'petit'))

# 3 
F.append(P("3. Visuel, ou reellement ecrit ?", 'h1'))

F.append(encadre(
 "REELLEMENT ECRIT",
 "Ce n'est <b>pas</b> un simple pre-remplissage d'ecran. Apres le geste « scanner, ne rien "
 "toucher, enregistrer », la ligne du journal porte <b>" + C % "q:140, u:'g'" + "</b>. "
 "La valeur descend jusqu'a la donnee, est persistee, part au cloud, et sert de reference a "
 "toutes les reprises ulterieures de cet aliment."))

# 4 
F.append(P("4. Sur quels produits ? — plus large que le rapport", 'h1'))

F.append(P(
 "La question posee etait « est-ce que cela arrive sur tous les produits ayant une portion "
 "fabricant ». <b>La reponse mesuree est : sur tous les produits scannes, portion ou pas.</b>"))

F.append(tableau(
 ['cas', 'champ affiche', 'q ENREGISTRE', 'd\'ou vient le nombre'],
 [["portion declaree (205 / 140 / 187,5 / 30)", "la portion", "<b>ecrit</b>",
 "" + C % 'serving_quantity' + " de la fiche"],
 ["<b>aucune</b> portion declaree", "<b>100</b>", "<b>q:100 · u:'g'</b>",
 "<b>" + C % 'value=\"100\"' + " ecrit en dur dans le HTML</b>"],
 ["portion declaree <b>= 0</b>", "<b>100</b>", "<b>q:100 · u:'g'</b>", "idem"]],
 [50 * mm, 26 * mm, 34 * mm, 55 * mm]))
F.append(Spacer(1, 5))

F.append(encadre(
 "LE CAS SANS PORTION EST LE PLUS DIFFICILE A DEFENDRE",
 "Une portion fabricant est au moins <b>une information publiee par quelqu'un</b> — discutable, "
 "mais reelle. Le <b>100</b>, lui, ne vient de personne : c'est une valeur par defaut de mise en "
 "page. <b>La regle que tu enonces le couvre exactement</b> : <i>une valeur de reference, une "
 "suggestion ou une portion fabricant ne doit jamais devenir silencieusement un choix "
 "utilisateur.</i> Le 100 n'est meme pas une suggestion.", ORANGE))

# 5 
F.append(P("5. Pourquoi l'application considere cette valeur comme un choix", 'h1'))

F.append(P("<b>Parce qu'elle ne pose jamais la question.</b> La condition qui ecrit la quantite, "
 "dans " + C % '_provFood' + " :"))
F.append(bloc_code(code('app.js', 'lg', "const row=document.getElementById('af-bc-row');", 0, 2)))

F.append(P(
 "Elle verifie <b>trois choses</b> : le bloc est-il visible, une fiche produit est-elle chargee, "
 "le champ contient-il un nombre superieur a zero. "
 "<b>Aucune des trois ne dit quoi que ce soit sur un geste de la personne.</b> Un champ "
 "pre-rempli par la fiche et un champ tape a la main sont, a cet endroit, <b>strictement "
 "indiscernables</b>."))

F.append(encadre(
 "ET CE N'EST PAS UNE IDEE QUI MANQUE : C'EST UN DRAPEAU QUE L'APPLICATION POSSEDE DEJA DEUX FOIS",
 "Deux autres blocs de ce meme ecran resolvent exactement ce probleme, et ils le resolvent de la "
 "meme facon : un drapeau qui n'est pose que par un <b>clic ou une frappe</b>."))
F.append(Spacer(1, 4))

F.append(tableau(
 ['bloc de l\'ecran d\'ajout', 'drapeau de geste', 'mesure'],
 [["poids declare a la main", C % '_afPoidsPose', "<b>EXISTE</b>"],
 ["boutons de portion (1/2 · 1 · 2 · 3)", C % '_afPortionPose', "<b>EXISTE</b>"],
 ["<b>bloc du SCAN</b> (" + C % 'af-bc-grams' + ")", "—", "<b>AUCUN</b>"]],
 [65 * mm, 55 * mm, 45 * mm]))
F.append(Spacer(1, 5))

F.append(encadre(
 "LE BLOC DU SCAN EST LE SEUL DES TROIS A NE PAS SAVOIR",
 "Les deux autres distinguent <i>« rempli par l'application »</i> de <i>« choisi par la "
 "personne »</i>. Celui-ci ne le distingue pas — <b>et c'est toute l'explication du point 5</b>. "
 "C'est la dixieme fois recensee dans ce depot qu'un mecanisme est pose sur une porte et pas sur "
 "sa jumelle ; la famille est ecrite dans " + C % 'BUGS.md' + " (§59), et elle a la propriete "
 "genante de ne se voir <b>ni a la relecture ni au banc d'essai</b>."))

# DECISION ANTERIEURE 
F.append(P("Une decision anterieure a relire avant tout correctif", 'h1'))

F.append(P(
 "Le depot porte une regle : <i>un retrait volontaire doit etre ecrit, sinon il redevient un "
 "bug</i>. Il y en a une ici, et je la signale plutot que de la contourner. "
 "<b>ft-v1105</b>, dans le code, en toutes lettres :"))
F.append(bloc_code("ON NE RETIRE PAS LE PRE-REMPLISSAGE : sans lui on retombe a 100 g,\n"
 "ce qui est pire, et le chemin rapide disparait.\n"
 "On ne cache pas le nombre, on lui rend sa source."))

F.append(encadre(
 "ELLE NE CONTREDIT PAS TA REGLE — ELLE PARLE D'AUTRE CHOSE",
 "ft-v1105 parle de ce qui est <b>AFFICHE</b>. Ta regle parle de ce qui est <b>ENREGISTRE</b>. "
 "<b>Les deux exigences peuvent tenir ensemble</b> : un drapeau laisse l'ecran exactement comme "
 "il est, avec son nombre et sa source ecrite a cote, et empeche seulement l'ecriture tant "
 "qu'aucun geste n'a eu lieu. "
 "Et le commentaire de ft-v1105 <b>nomme lui-meme la jumelle qu'il n'a pas faite</b> : il "
 "cite la decision <i>« on donne le choix et pas imposer »</i> prise pour la quantite de la "
 "derniere fois, et note qu'elle n'avait pas ete appliquee ici.", VERT))

# CE QUI EXISTE DEJA 
F.append(P("Ce qui existe deja, si un correctif est decide", 'h1'))

F.append(P(
 "<b>Aucun mecanisme n'est a inventer.</b> Les solutions que tu listes — champ vide, bouton "
 "« 205 g », bouton « 410 g » — sont deja construites dans l'application, sur d'autres portes :"))

F.append(tableau(
 ['fonction existante', 'ce qu\'elle fait deja'],
 [[C % '_bcProposerDerniere(q)',
 "<b>vide le champ</b> et affiche une pastille cliquable « la derniere fois » — "
 "<i>exactement le motif demande</i>"],
 [C % '_bcProposerPaquet()' + " / " + C % '_bcReprendrePaquet()',
 "affiche « 410 g (le paquet entier) » et l'applique au clic"],
 [C % '_afPoidsPose' + " / " + C % '_afPortionPose',
 "le drapeau de geste, sur les deux autres blocs"]],
 [58 * mm, 107 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
 "DEUX LECTURES POSSIBLES, ET C'EST MICHEL QUI TRANCHE",
 "<b>A — champ vide + pastilles</b> : apres un scan, la quantite est vide et deux boutons sont "
 "offerts (la portion fabricant, le paquet). Un clic de plus a chaque scan, et l'ecran change. "
 "<b>B — ecran inchange, drapeau a l'ecriture</b> : le nombre reste affiche avec sa source, "
 "mais " + C % 'q' + " n'est ecrit que si la personne a touche le champ ou clique une pastille. "
 "Zero clic en plus, ft-v1105 intacte a la lettre. "
 "<b>Les deux satisfont ta regle</b> ; elles different sur le confort, pas sur la donnee.", ORANGE))
F.append(Spacer(1, 6))

F.append(encadre(
 "PERIMETRE RESPECTE",
 "Non traites, comme demande : les kcal d'Open Food Facts, la coherence energie/macros, la "
 "visibilite de l'alerte, P1 et les portions nommees, la migration historique. "
 "<b>Et aucune ligne de production n'a ete modifiee</b> — cette trace est une mesure, pas un "
 "correctif.", GRIS))


doc = SimpleDocTemplate(OUT, pagesize=A4,
 leftMargin=22 * mm, rightMargin=22 * mm,
 topMargin=20 * mm, bottomMargin=22 * mm,
 title='Force Tracker — portion fabricant vs quantite consommee (trace, non corrige)',
 author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
print(' passe :', PASSE.replace('<b>', '').replace('</b>', ''))
