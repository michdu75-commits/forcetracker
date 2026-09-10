#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/OPTION-A-ETAT.pdf — l'etat de l'option A (quantite jamais decidee a la place
   de la personne) et LA DECISION QUI RESTE, redige pour GPT.

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
OUT = os.path.join(ROOT, 'docs', 'OPTION-A-ETAT.pdf')
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
    """⚠️ LE GARDE-FOU AVAIT UN TROU, ET IL A PRODUIT UN CARRE NOIR DANS CE DOCUMENT MEME.
       Il n'inspectait que les CARACTERES. Or reportlab interprete aussi les entites HTML
       numeriques : `&#9888;` traverse un test caractere par caractere sans encombre, et
       ressort en ■ dans le PDF. On refuse donc aussi toute entite au-dessus de WinAnsi.
       👉 *Une protection qui ne connait qu'une des deux ecritures de la meme chose n'en
       protege qu'une* — la 3e fois que ce garde-fou est elargi apres une fuite reelle."""
    if isinstance(x, str):
        for ch in x:
            if ch in _HORS or 0x1F000 <= ord(ch) <= 0x1FAFF or 0xFE00 <= ord(ch) <= 0xFE0F:
                raise SystemExit('CARACTERE NON RENDU %r (%s) dans %s' % (ch, hex(ord(ch)), ou))
        for m in re.finditer(r'&#(\d+);|&#[xX]([0-9a-fA-F]+);', x):
            n = int(m.group(1)) if m.group(1) else int(m.group(2), 16)
            if n > 0x255:
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
                      'Force Tracker — option A : le correctif, et la decision qui reste — 10/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


F = []
F.append(P("Option A : le correctif, et la decision qui reste", 'titre'))
F.append(P("Force Tracker — 10/09/2026. Michel a valide l'option A. Le correctif est ecrit et "
           "mesure ; il n'est <b>PAS deploye</b>. La passe complete rend <b>19 temoins rouges</b>, "
           "tries un par un. Il reste <b>une decision</b>, et elle ne m'appartient pas.", 'sous'))

F.append(encadre(
    'EN UNE PHRASE',
    "Le correctif marche : apres un scan, le champ est vide, la portion est une pastille, et rien "
    "ne s'enregistre sans geste. <b>Mais mon garde-fou d'enregistrement est plus large que le "
    "scan</b> — il couvre les <b>HUIT</b> portes qui posent une fiche nutritionnelle, dont "
    "<b>CIQUAL, la reprise et l'estimation IA</b>. C'est ce qui fait rougir la passe, et c'est "
    "une question de produit, pas un bug a corriger en silence."))
F.append(Spacer(1, 6))

F.append(encadre(
    "CE QUI EST MESURE, ET CE QUI NE L'EST PAS",
    "Tout ce qui est chiffre ici a ete <b>execute</b> (Chromium + Playwright), en conduisant les "
    "vraies fonctions et en relisant ce que l'application ecrit dans " + C % 'S.foodLog' + ". "
    "<b>Limites</b> : les fiches produit sont fabriquees (aucun acces reseau a Open Food Facts) ; "
    "<b>pas de WebKit</b>, donc le rendu iPhone reste a valider ; et le tri des 19 rouges est une "
    "<b>analyse de code</b>, pas une re-execution temoin par temoin.", GRIS))

F.append(P("1. Ce qui est construit", 'h1'))
F.append(tableau(
    ['geste', 'avant', 'maintenant'],
    [["scan · <b>aucun geste</b>", "" + C % "q:205, u:'g'" + " + 193 kcal", "<b>rien n'est enregistre</b> — l'app demande"],
     ["scan · clic <b>portion</b>", "—", "" + C % "q:205 · u:g" + " · 193 kcal"],
     ["scan · clic <b>paquet</b>", "—", "" + C % "q:410 · u:g" + " · 385 kcal"],
     ["scan · <b>tape</b> 300 g", "—", "" + C % "q:300 · u:g" + " · 282 kcal"],
     ["<b>sans portion declaree</b>", "" + C % 'q:100' + " (le defaut du HTML)", "aucune pastille, <b>plus de repli a 100 g</b>"],
     ["geste sur <b>A</b> puis scan <b>B</b>", "—", "rien ne traverse"]],
    [44 * mm, 55 * mm, 66 * mm]))
F.append(Spacer(1, 5))
F.append(P("L'ecran <b>pose la question</b> au lieu de justifier un nombre inscrit : "
           "<i>« Combien en as-tu mange ? la fiche produit declare une portion de 205 g — touche "
           "la pastille si ca correspond, sinon tape ton poids. »</i>", 'petit'))

F.append(encadre(
    "LES 11 PORTES TIENNENT EN UNE LIGNE",
    "Le drapeau " + C % '_bcQtyPose' + " retombe dans " + C % '_afOublierAliment' + ", le "
    "proprietaire unique de « on change d'aliment » que <b>13 portes</b> appellent deja depuis "
    "ft-v1180. <b>Aucun mecanisme nouveau</b> : le drapeau est la copie de "
    "" + C % '_afPoidsPose' + ", et la pastille celle de " + C % '_bcProposerPaquet' + ".", VERT))

F.append(P("2. Le trou que j'ai fabrique moi-meme", 'h1'))
F.append(encadre(
    "VIDER LE CHAMP NE SUFFISAIT PAS",
    "Sans " + C % 'q' + ", l'ecran retombait sur les valeurs POUR 100 g, et enregistrer sans rien "
    "toucher partait avec <b>" + C % 'kcal:94' + " sans quantite</b>. "
    "<b>Je remplacais une quantite inventee par des MACROS inventees</b> — la derive exacte de ta "
    "section 8. D'ou un refus d'enregistrement, ecrit sur le mecanisme qui existait deja deux "
    "lignes plus haut (un aliment sans nom, un aliment sans valeur).", ORANGE))

F.append(P("3. La passe complete : 19 rouges, tries", 'h1'))
F.append(P("Le tri a ete conduit par <b>45 agents</b> : un classeur par temoin, puis <b>deux "
           "sceptiques</b> charges de le refuter, biaises vers <i>« c'est une vraie casse »</i>. "
           "15 temoins passes a ce tri ; les 4 autres classes a la lecture, et je le dis."))

F.append(tableau(
    ['famille', 'combien', 'ce que ca veut dire'],
    [["<b>le geste a change</b>", "<b>9</b>",
      "le temoin enregistre apres un scan sans toucher a la quantite. La garantie qu'il fige est "
      "<b>intacte</b> — il lui manque un clic ou une frappe. On met a jour le GESTE, jamais les assertions."],
     ["<b>comportement decide</b>", "<b>5</b> (+4 lus)",
      "le temoin figeait le <b>pre-remplissage lui-meme</b> (« le nombre pre-rempli dit d'ou il "
      "vient », « 100 g est un DEFAUT »). Michel vient de le perimer : le temoin se reecrit, en "
      "disant qui a decide et quand."],
     ["<b>bloquant</b>", "<b>1</b>",
      "et ce n'est pas un temoin a reparer — voir ci-dessous."]],
    [40 * mm, 22 * mm, 103 * mm]))
F.append(Spacer(1, 5))

F.append(encadre(
    "LE REFUTEUR A TROUVE MIEUX QUE CE QUE JE CHERCHAIS",
    "Le classeur voulait ajouter un geste au temoin. Le sceptique a refuse, et il a raison : "
    "<i>« le garde-fou de " + C % 'addFoodEntry' + " ne touche PAS que le scan — il teste "
    "" + C % '_bcRow visible && _bcNutr && !_bcQtyPose' + ", or " + C % '_bcNutr' + " est pose par "
    "QUATRE portes »</i>. "
    "<b>Ajouter un geste au temoin aurait fabrique un faux vert</b> et masque la vraie question. "
    "*Un temoin qu'on met a jour alors qu'il signalait une casse est la pire issue possible.*<br/><br/>"
    "<b>ET SON CHIFFRE ETAIT TROP BAS : j'ai compte les portes moi-meme, il y en a "
    "HUIT.</b> Les " + C % '_bcNutr=' + " du depot, relus un par un : " + C % '_lookupBarcode' + " · "
    "" + C % '_calAppliquer' + " · " + C % 'onFoodLabelFile' + " · " + C % 'quickFillFood' + " · "
    "" + C % '_afSuggPrendreMarque' + " · " + C % '_afSuggPrendreCiqual' + " · "
    "" + C % '_afSuggPrendreLocale' + " · " + C % '_afSuggPrendreOff' + ". Les huit rendent le bloc "
    "visible (cinq via " + C % '_offRemplirFormulaire' + ", trois en direct), donc les huit passent "
    "par le refus. <b>Un sceptique qui trouve le bon defaut peut se tromper sur son ampleur</b> — "
    "sa conclusion tenait, son chiffre non."))

F.append(P("4. La decision qui reste — et elle est de produit", 'h1'))
F.append(P("Voici le garde-fou, <b>extrait du depot a la generation de ce document</b> (jamais "
           "recopie a la main) :"))
F.append(bloc_code(code('app.js', 'lignes', "const _bcRow=document.getElementById('af-bc-row')",
                        avant=0, apres=3),
                   "app.js — la condition entiere, celle sur laquelle porte la decision"))
F.append(P("Il refuse d'enregistrer quand une fiche nutritionnelle est posee et qu'aucune "
           "quantite n'a ete choisie. <b>Cela ne couvre pas que le code-barres :</b>"))
F.append(tableau(
    ['porte', 'y a-t-il une pastille a cliquer ?', 'consequence du refus'],
    [["<b>scan</b> code-barres", "oui — portion et/ou paquet", "un clic. <b>C'est ce que Michel a demande.</b>"],
     ["<b>CIQUAL</b> (recherche d'aliment)", "<b>NON</b> — " + C % 'serving_quantity:0' + ", aucun paquet",
      "il faut <b>taper</b> une quantite. Chemin quotidien."],
     ["<b>marque</b> / <b>Open Food Facts</b> / <b>etiquette photo</b>", "oui si une portion est publiee", "un clic"],
     ["<b>reprise</b> (Mes aliments, deja note par toi)", "oui — « la derniere fois »",
      "un tap de plus pour re-noter un aliment"],
     ["<b>estimation IA</b> (" + C % '_calAppliquer' + ")",
      "<b>NON</b> — elle pose " + C % 'serving_quantity:0',
      "<b>elle dit deja</b> <i>« tape ta quantite »</i> : le refus rend vraie une phrase "
      "qu'elle affichait deja."]],
    [42 * mm, 60 * mm, 63 * mm]))
F.append(Spacer(1, 5))

F.append(encadre(
    "LES DEUX LECTURES, ET C'EST MICHEL QUI TRANCHE",
    "<b>Large</b> — la regle vaut partout : <i>aucune ligne ne se cree sans quantite choisie</i>. "
    "Coherent, et ca supprime d'un coup toutes les lignes a moitie mortes. Cout : un geste de plus "
    "sur CIQUAL et sur la reprise, tous les jours. "
    "<b>Etroit</b> — la regle ne vaut que pour le scan, la porte ou le nombre vient d'un TIERS. "
    "Sur CIQUAL et la reprise, les macros affichees viennent de la base ou de son propre repas "
    "precedent, pas d'un fabricant. Cout : deux regles au lieu d'une, a expliquer — <b>et huit "
    "portes a trier une par une</b>, ce qui est exactement le genre de frontiere que ce projet "
    "paie cher (R19 : une section coute zero, une frontiere coute cher). "
    "<b>Les deux respectent son principe</b> — dans les deux cas, aucune QUANTITE inventee n'est "
    "enregistree.", ORANGE))

F.append(P("5. Ce que je n'ai pas fait, et ce que je ne sais pas", 'h1'))
F.append(tableau(
    ['point', 'etat'],
    [["<b>rien n'est deploye</b>", "le correctif vit sur une branche ; " + C % 'master' + " est intact"],
     ["les 19 rouges ne sont <b>pas corriges</b>", "le tri dit quoi faire ; l'edit attend la decision ci-dessus"],
     ["4 rouges sur 19 <b>n'ont pas eu le tri adversarial</b>",
      "classes a la lecture (ils figent le champ a 100). Je le dis plutot que de les compter comme verifies."],
     ["<b>l'unite d'une portion est inconnue</b>",
      "l'app demande " + C % 'serving_quantity' + " a Open Food Facts, <b>jamais " + C % 'serving_size' + "</b> — "
      "elle ne sait donc pas si 250 est en g ou en ml. Sur un liquide, la pastille affiche « 250 g » "
      "pour ce qui peut etre 250 ml. <b>Ce n'est pas une regression</b> (le champ pre-rempli faisait "
      "la meme hypothese en silence), mais mon etiquette la rend explicite."],
     ["<b>l'historique n'est pas touche</b>", "comme demande"],
     ["<b>iPhone</b>", "les trois pastilles et le champ vide restent a valider par Michel"]],
    [50 * mm, 115 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
    "ETAT DES TESTS",
    "Bloc <b>CCLXXXVII</b> : <b>18 temoins, 18/18</b> en isole. "
    "Controle negatif : <b>10 mutations</b>, 7 mordent d'emblee. Sur les 3 restantes, <b>deux "
    "etaient des trous de temoin</b> (le drapeau entre deux aliments — mon temoin enchainait deux "
    "SCANS, or la porte du scan repose le drapeau elle-meme ; et la photo d'etiquette, qui n'avait "
    "aucun temoin). Les deux mordent maintenant. "
    "La troisieme reste a 0 rouge et <b>c'est ecrit dans le code</b> : ses trois appelants sont "
    "couverts ailleurs, elle ne reste que parce qu'elle redeviendrait la seule protection si le "
    "garde-fou etait restreint au scan. "
    "<b>Passe complete : 3494 verts, 19 rouges</b> — tous expliques ci-dessus.", GRIS))


doc = SimpleDocTemplate(OUT, pagesize=A4,
 leftMargin=22 * mm, rightMargin=22 * mm,
 topMargin=20 * mm, bottomMargin=22 * mm,
 title='Force Tracker — option A : le correctif ecrit, les 19 rouges tries, la decision qui reste',
 author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
print(' passe :', PASSE.replace('<b>', '').replace('</b>', ''))
