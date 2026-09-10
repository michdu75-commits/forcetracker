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
OUT = os.path.join(ROOT, 'docs', 'P1-3-VERIFICATIONS.pdf')
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
                      'Force Tracker — les 3 verifications avant validation de P1 — ft-v1188 — 10/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


F = []

# ═══════════════════════════ EN-TETE ═══════════════════════════
F.append(P("P1 — les 3 verifications avant validation", 'titre'))
F.append(P("Force Tracker — 10/09/2026 — version <b>ft-v1188</b>, deployee et verifiee verte "
           "(run #1060). Reponse a ton cahier « 3 verifications avant validation reelle ». "
           "Tout ce qui est chiffre ici a ete <b>execute</b>, pas deduit.", 'sous'))

F.append(encadre(
    'EN UNE PHRASE',
    "<b>Deux trous reels sur trois, et le troisieme est demontre sain.</b> "
    "Le point 1 n'etait pas « non teste », il <b>n'existait pas</b> — et il cachait une "
    "regression pire que ce que tu visais. Le point 2 decrit un cas que l'application ne sait "
    "pas produire, mais la question a fait tomber autre chose. Le point 3 n'a aucune derive "
    "cumulative, et pourtant l'arrondi coutait vraiment."))
F.append(Spacer(1, 6))

F.append(encadre(
    "COMMENT LIRE LES CHIFFRES",
    "Chaque mesure vient d'un <b>vrai navigateur</b> (Chromium + Playwright) qui appelle les "
    "vraies fonctions et relit ce que l'application <b>ecrit</b> dans son journal. "
    "Aucune valeur n'est calculee a la main pour ce document. "
    "<b>Limites</b> : pas d'acces aux donnees reelles de Michel, et <b>pas de WebKit</b> ici — "
    "le rendu iPhone reste a valider par lui.", GRIS))

# ═══════════════════════════ 1 ═══════════════════════════
F.append(P("1. Corriger portionWeightG apres coup", 'h1'))

F.append(P(
    "Ton cahier dit : <i>« le document P1 indique explicitement que ce chemin n'est pas "
    "teste »</i>. <b>Mesure : il n'existait pas.</b> Aucun champ de l'ecran d'edition ne "
    "touchait " + C % 'portionLabel' + " ni " + C % 'portionWeightG' + "."))

F.append(encadre(
    "ET LA MESURE A TROUVE PIRE QUE CE QUE TU CHERCHAIS",
    "Sonde sur une ligne " + C % "q:2, u:'portion', portionWeightG:125" + " avec un pour-100 g : "
    "l'ecran d'edition affichait <b>« Quantite (g) = 250 »</b>, et <b>enregistrer sans rien "
    "toucher</b> reecrivait la ligne en <b>" + C % "q:250, u:'g'" + "</b>. "
    "C'est mot pour mot ce que Michel refuse au point 2 de ses decisions : <i>« on perd alors "
    "l'information 2 steaks »</i>. "
    "Et " + C % 'portionLabel' + " / " + C % 'portionWeightG' + " <b>survivaient a cote d'un "
    "" + C % "u:'g'" + "</b> — deux sources qui se contredisent, la famille de bugs que cette "
    "consigne nommait justement."))
F.append(Spacer(1, 5))

F.append(encadre(
    "LA CAUSE VAUT PLUS QUE LE CORRECTIF — C'EST LA JUMELLE D'UNE VERSION QUE J'AI LIVREE HIER",
    "En <b>ft-v1186</b> j'avais corrige exactement ce defaut — <i>« le pour-100 g ne decide plus "
    "de l'unite »</i> — sur les <b>deux</b> portes de l'ecran d'<b>ajout</b>, avec temoin de "
    "non-regression et 15 mutations toutes mordantes. "
    "<b>L'ecran d'EDITION faisait la meme chose, dans la meme version, a 900 lignes d'ecart.</b> "
    "Ce qui rend cette famille couteuse : elle ne se voit <b>ni a la relecture ni au banc "
    "d'essai</b>. Le code corrige est juste, les temoins verts le meritent, le controle negatif "
    "mord. Tout ce qui mesure dit vrai — et la moitie du bug est encore la. "
    "<b>8e fois recensee</b> entre les fonctions " + C % '_af*' + " et " + C % '_ef*' + " ; "
    "ecrite comme famille " + C % 'BUGS.md 59' + ".", ORANGE))

F.append(P("Le correctif : deux moitiés", 'h2'))
F.append(P(
    "<b>a)</b> le pour-100 g ne decide plus de l'unite, ici non plus. Le test porte sur "
    "" + C % 'e.u' + ", donc un produit scanne (" + C % "u:'g'" + ") garde <b>exactement</b> son "
    "champ grammes — rien ne change pour lui, et deux temoins le figent."))
F.append(bloc_code(code('app.js', 'lg', "const ancre = (e.per100 && e.u!=='portion') ? null", 0, 3)))
F.append(P(
    "<b>b)</b> deux champs pour corriger la definition, et le pour-100 g qui <b>suit</b> la "
    "nouvelle definition."))

F.append(P("Le point delicat, et c'est lui qui valait la mesure", 'h2'))
F.append(P(
    "Ta regle est : <i>« une definition de portion qui change doit invalider ou recalculer toute "
    "donnee derivee de l'ancienne definition »</i>. Appliquee telle quelle, elle casse autre "
    "chose :"))
F.append(tableau(
    ['strategie', 'ce qu\'elle produit'],
    [["rederiver <b>toujours</b>",
      "ecrase le pour-100 g <b>publie</b> d'un produit scanne des qu'on touche au poids — une "
      "valeur mesuree remplacee par une declaration"],
     ["ne <b>jamais</b> rederiver",
      "un pour-100 g calcule pour 125 g survit a un passage a 150 g — <b>ce que tu interdis</b>"]],
    [42 * mm, 123 * mm]))
F.append(Spacer(1, 5))
F.append(encadre(
    "ON NE DEVINE PAS, ON VERIFIE",
    "Un pour-100 g <b>derive</b> vaut, par construction, " + C % 'totaux x 100 / (q x poids)' + ". "
    "On refait donc le calcul avec l'<b>ancien</b> etat : s'il retombe dessus, il en venait, donc "
    "il doit suivre ; sinon il vient d'ailleurs et on n'y touche pas. "
    "<b>C'est la redondance interne du document</b>, pas une supposition sur la provenance.", VERT))
F.append(bloc_code(code('app.js', 'fn', '_per100SuitLaPortion')))

F.append(P("Ce que la sonde rend, apres correctif", 'h2'))
F.append(tableau(
    ['geste', 'resultat mesure'],
    [["ouvrir « 2 steaks de 125 g »",
      "<b>reste en portions</b> : " + C % 'ef-prop=2' + ", " + C % 'ef-pnom=steak' + ", "
      "" + C % 'ef-ppoids=125' + " ; l'ecran dit <i>« 1 steak (125 g) · 250 kcal. Soit 250 g en "
      "tout. »</i>"],
     ["taper 150 dans le poids",
      "la definition se met a jour <b>pendant la frappe</b> : <i>« 1 steak (150 g) ... Soit "
      "300 g en tout »</i> — sans detruire le champ"],
     ["enregistrer",
      "" + C % 'portionWeightG=150' + " et " + C % 'per100 = 166,7 / 13,3 / 0 / 12' + " — "
      "<b>la valeur exacte</b> (500/3 = 166,667). " + C % 'q=2' + ", " + C % "u='portion'" + ", "
      "label intacts, macros inchangees"],
     ["ouvrir + enregistrer <b>sans rien toucher</b>",
      "<b>rien ne change</b> — c'etait le defaut d'origine"],
     ["un produit scanne (" + C % "u:'g'" + ")",
      "garde son champ grammes (200 g) et son pour-100 g publie (130/26/0/3)"],
     ["un scan en portions dont le pour-100 g <b>contredit</b> la definition",
      "on ajoute un poids de 125 g -> le pour-100 g publie <b>reste 97/4/11,3/3,2</b>, intact"],
     ["vider le champ poids",
      "" + C % 'portionWeightG' + " retire, <b>et le pour-100 g qui en dependait aussi</b> — "
      "aucune verite orpheline"]],
    [50 * mm, 115 * mm]))

# ═══════════════════════════ 2 ═══════════════════════════
F.append(P("2. Deux favoris portant le meme nom", 'h1'))

F.append(P(
    "Tu soupconnes une contamination via " + C % '_majDefFavori()' + ", qui retrouve le favori par "
    "" + C % 'name' + ". <b>La reponse tient en deux temps, et le premier n'etait pas evident.</b>"))

F.append(encadre(
    "LE DOUBLON EST IMPOSSIBLE A CREER — MESURE PAR LA VRAIE PORTE",
    "" + C % 'toggleFavFood' + " cherche " + C % 'name.toLowerCase()' + " et <b>retire</b> au lieu "
    "d'ajouter quand il trouve. Trois clics d'etoile d'affilee donnent <b>1 favori, puis 0, puis "
    "1</b> — casse comprise (« Steak hache » et « STEAK HACHE » sont la meme cle). "
    "Et une restauration cloud <b>remplace</b> la liste en bloc au lieu de concatener. "
    "<b>Le nom EST l'identite d'un favori dans cette application, par construction, pas par "
    "hasard.</b>", VERT))
F.append(Spacer(1, 5))

F.append(P(
    "Ta consigne dit : <i>« ne pas inventer un nouvel identifiant si un identifiant fiable existe "
    "deja »</i>. <b>Mesure : il n'en existe aucun.</b> Un favori stocke "
    "" + C % 'name / kcal / prot / carbs / fat / per100 / q / u / portionLabel / portionWeightG' + " "
    "— <b>pas de " + C % 'sourceId' + "</b>, pas de code-barres. En ajouter un serait un champ "
    "sans producteur, pour un etat que l'application ne sait pas fabriquer."))

F.append(encadre(
    "MAIS .find() REND LE PREMIER — ET LA, TU AS RAISON",
    "Force a la main l'etat impossible (deux favoris de meme nom, B en premier), puis modifie A : "
    "<b>les 150 g atterrissaient sur B</b>. Mesure. "
    "Le correctif n'invente pas d'identifiant : <b>on refuse d'agir sur une identite ambigue</b>. "
    "Une ligne, un temoin. <i>Ne rien faire vaut mieux qu'agir sur la mauvaise ligne.</i>"))
F.append(bloc_code(code('app.js', 'lg',
                        "if(S.savedFoods.filter(x=>String(x.name||'').toLowerCase()===k).length>1) return;",
                        1, 1)))
F.append(P("Verifie apres correctif : le meme geste laisse <b>B a 100 g et A a 125 g</b>, "
           "les deux intacts.", 'petit'))

F.append(P("Et la question a fait tomber autre chose", 'h2'))
F.append(encadre(
    "LE FAVORI NE SUIVAIT PAS UNE DEFINITION CORRIGEE DEPUIS L'EDITION",
    "Mesure : corriger « 1 steak = 150 g » dans l'ecran d'edition laissait le favori a <b>125 g</b>. "
    "C'est exactement la vieille copie silencieuse que la decision 5 de Michel voulait empecher — "
    "" + C % '_majDefFavori' + " n'etait appelee qu'a l'<b>ajout</b>. "
    "<b>La porte jumelle, encore</b> : aucun mecanisme neuf, un appel. "
    "Verifie : le favori passe a 150 g / « pave », et <b>ses macros ne bougent pas</b> "
    "(favori 250/20, repas 500/40).", ORANGE))

# ═══════════════════════════ 3 ═══════════════════════════
F.append(P("3. La precision du per100 derive", 'h1'))

F.append(P(
    "Tu demandes : <i>« si l'arrondi n'a aucun effet persistant sur la donnee, le demontrer »</i>. "
    "<b>Il n'en a aucun, et voici la demonstration.</b>"))

F.append(encadre(
    "AUCUNE DERIVE CUMULATIVE — 10 CYCLES REELS",
    "Une ligne saisie (1 part de 140 g, 355/30/44/6), puis <b>reprise et re-enregistree neuf "
    "fois</b> par la vraie porte « Mes aliments ». Empreinte des cycles 1, 2, 5 et 10 : "
    "<b>identique au caractere pres</b>. "
    "La raison est structurelle : le pour-100 g se redérive toujours des <b>TOTAUX</b>, jamais du "
    "pour-100 g precedent. <b>C'est un point fixe, pas une cascade.</b>", VERT))
F.append(Spacer(1, 5))

F.append(P(
    "<b>Mais l'arrondi entier coutait vraiment, en aval.</b> Meme cas, une fois enregistre :"))
F.append(tableau(
    ['', 'kcal', 'prot', 'carbs', 'fat'],
    [["pour-100 g <b>exact</b>", "253,57", "21,43", "31,43", "<b>4,29</b>"],
     ["arrondi <b>entier</b> (avant)", "254", "21", "31", "<b>4</b>"],
     ["puis redemander 280 g", "711", "59", "87", "<b>11</b>"],
     ["le double exact", "710", "60", "88", "<b>12</b>"]],
    [55 * mm, 27 * mm, 27 * mm, 28 * mm, 28 * mm]))
F.append(P("Soit <b>-8,3 % sur les lipides</b>. Plus la macro est petite, plus l'erreur relative "
           "est grosse.", 'petit'))

F.append(encadre(
    "ET LA CORRECTION EXISTAIT DEJA — ELLE N'ETAIT PAS POSEE ICI",
    "Ta consigne dit : <i>« corriger avec le niveau de precision deja utilise ailleurs »</i>. "
    "Il y en a un : " + C % '_per100d1' + " (une decimale), qui sert <b>7 portes</b> depuis "
    "ft-v1170 — Open Food Facts, CIQUAL, les marques, l'etiquette photo, le scan. "
    "Les <b>deux</b> pour-100 g <b>derives</b> de " + C % '_provFood' + " etaient restes en "
    "" + C % 'Math.round' + ". <b>La 8e porte — meme famille que le point 1.</b> "
    "Et ca ne change rien a l'ecran : " + C % '_qtyRescale' + " arrondit deja les 4 champs a "
    "l'entier. La decimale ne sert qu'a ce qui est <b>conserve et re-multiplie</b>."))
F.append(bloc_code(code('app.js', 'lg', "p.per100={kcal:_per100d1((+vals.kcal||0)*f)", 0, 1)))
F.append(P("Apres : " + C % '253,6 / 21,4 / 31,4 / 4,3' + ", et 280 g rendent <b>710 / 60 / 88 / "
           "12</b> — exact.", 'petit'))

# ═══════════════════════════ CE QUE LA MESURE A TROUVE EN PLUS ═══════════════════════════
F.append(P("Ce que la mesure a trouve et que tu ne visais pas", 'h1'))

F.append(P(
    "<b>La passe complete a rougi sur trois temoins plus anciens</b> — un de ft-v1051, deux de "
    "ft-v1162. Tous les trois figeaient " + C % 'Math.round' + ", pas leur garantie. Le cas de "
    "ft-v1162 merite d'etre lu en entier, parce que <b>la decimale y a l'air moins precise</b> : "
    "la reprise a 180 g affiche <b>129</b> au lieu de <b>130</b>."))

F.append(tableau(
    ['', 'valeur'],
    [["verite d'origine (274 kcal / 380 g, x180)", "<b>129,79</b>"],
     ["ce que l'application <b>stocke</b>", "<b>79 kcal pour 110 g</b> — les totaux sont des "
      "<b>entiers</b>"],
     ["depuis cette donnee : 79/110 x 180", "<b>129,27</b>"],
     ["chemin <b>entier</b> (per100 = 72)", "129,60 -> <b>130</b> — plus proche de 129,79 "
      "<b>par chance</b>"],
     ["chemin <b>decimal</b> (per100 = 71,8)", "129,24 -> <b>129</b> — fidele a ce qui est "
      "reellement stocke"]],
    [72 * mm, 93 * mm]))
F.append(Spacer(1, 5))

F.append(encadre(
    "LE VRAI PLANCHER DE PRECISION N'EST PAS LE per100, CE SONT LES TOTAUX ENTIERS",
    "<b>Le 130 venait d'une erreur d'arrondi qui pointait dans le bon sens.</b> L'application ne "
    "<b>peut plus</b> connaitre 129,79 : le 79 a ete arrondi <b>avant</b> d'etre ecrit "
    "(" + C % 'parseInt' + " sur les 4 champs). <b>129 est la seule reponse juste au regard de la "
    "donnee.</b> "
    "Affiner le pour-100 g ne peut donc pas aller plus loin. Le seul gain restant serait de "
    "stocker les <b>totaux</b> avec une decimale — ce qui touche la saisie, le rescale, "
    "l'affichage, l'export CSV et le cloud. <b>Chantier a part, non decide.</b> "
    "Les interdits que ces temoins figent (<b>249</b>, <b>448</b>, <b>780</b>) n'ont pas bouge, et "
    "les trois ont ete <b>eprouves</b> : la mutation qui retablit le defaut d'origine les fait "
    "rougir.", ORANGE))

F.append(P("Un piege d'outillage, dit parce qu'il resservira", 'h2'))
F.append(P(
    "Ma premiere mesure du point 2 concluait <i>« impossible de creer deux favoris »</i> — "
    "<b>vrai, mais pour la mauvaise raison</b>. " + C % 'toggleFavFood' + " finit par "
    "" + C % '_renderFoodQuickList()' + ", qui <b>reconstruit</b> la liste : ma fixture posee a la "
    "main etait ecrasee, et mon deuxieme clic tapait dans le vide. "
    "<b>Un test qui n'emploie pas le schema de la production ne teste rien, il rassure.</b> "
    "Refait en reposant la fixture avant chaque clic — la conclusion tient, la mesure aussi."))

# ═══════════════════════════ CONTROLE NEGATIF ═══════════════════════════
F.append(P("Controle negatif — une mutation par protection", 'h1'))

F.append(P("Ton point 4 : <i>« chaque mutation doit faire mordre un temoin precis ; une mutation "
           "qui ne mord pas doit etre expliquee »</i>. <b>15 mutations, toutes mordent</b>, et "
           "aucune n'a eu besoin d'explication."))

F.append(tableau(
    ['mutation', 'rouges'],
    [["l'unite volee par le pour-100 g", "<b>8</b>"],
     ["la branche grammes qui reprend la main", "<b>10</b>"],
     ["les deux champs de definition retires", "<b>6</b>"],
     ["le pour-100 g qui ne suit plus la nouvelle definition", "<b>2</b>"],
     ["rederiver <b>a l'aveugle</b> (le scan se fait ecraser)", "<b>1</b> — exactement le scan protege"],
     ["le refus d'agir sur une identite ambigue retire", "<b>1</b>"],
     ["le favori qui ne suit plus une correction d'edition", "<b>1</b>"],
     ["arrondi entier cote portion", "<b>1</b>"],
     ["arrondi entier cote grammes", "<b>1</b>"],
     ["la frappe qui ne met plus a jour la definition", "<b>1</b>"],
     ["les macros du favori ecrasees", "<b>1</b>"],
     ["le poids retire qui laisse un pour-100 g orphelin", "<b>1</b>"],
     ["la definition non hydratee a l'ouverture", "<b>4</b>"],
     ["<i>(temoin resserre)</i> division par la reference au lieu de l'affichee", "<b>2</b>"],
     ["<i>(temoin resserre)</i> le defaut d'origine de ft-v1162", "<b>3</b>"]],
    [120 * mm, 45 * mm]))

F.append(P("Non-regression", 'h2'))
F.append(P(
    "Suite complete : <b>parcours " + PASSE + "</b>, calculs 339/339, muscles 241/241, croises "
    "50/50, dates 9/9, donnees classees 0 trou. "
    "Les blocs que tu listes (CCLXXVII, CCLXXVIII, CLXVIII, CCLXXIX, CCLXXX, plus celui de "
    "ft-v1186) sont <b>tous verts</b>. Nouveau bloc <b>CCLXXXV</b>, 18 temoins."))

# ═══════════════════════════ CE QUI RESTE ═══════════════════════════
F.append(P("Ce qui reste ouvert — dit, pas taise", 'h1'))

F.append(tableau(
    ['trou', 'pourquoi il reste'],
    [["une ligne <b>sans aucune quantite</b> ne peut pas recevoir de definition",
      "l'ecran d'edition a <b>trois</b> etats ; je n'ai ouvert les champs que dans celui ou "
      "" + C % 'q>0' + " avec " + C % "u:'portion'" + ". L'etat « boutons » ecrit pourtant "
      "" + C % "q:n, u:'portion'" + " a l'enregistrement. <b>Non elargi expres</b> : ton "
      "perimetre dit « ne touche a rien d'autre »"],
     ["une etiquette fausse ne se retire que par l'edition",
      "les puces basculent et le champ libre se vide, mais c'est moins evident qu'a l'edition — "
      "<b>juge humain</b>, a regarder par Michel"],
     ["la <b>tolerance de 0,6</b> de " + C % '_per100SuitLaPortion' + " est un choix",
      "un pour-100 g <b>publie</b> qui tomberait par hasard a 0,6 pres de ce que la definition "
      "produirait serait traite comme derive. Probabilite faible, consequence reelle. "
      "<b>Le remede propre serait une provenance ecrite sur le " + C % 'per100' + "</b> — "
      "" + C % 'S.foodLog' + " ne stocke aujourd'hui ni source ni version pour ce champ"],
     ["le <b>plancher des totaux entiers</b>",
      "detaille plus haut ; chantier a part, non decide"],
     ["le journal du jour n'affiche <b>aucune quantite</b>",
      "ni « 2 steaks » ni « 250 g » — c'est le chantier 6 de Michel, separe expres"]],
    [62 * mm, 103 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
    "PERIMETRE INTERDIT — RESPECTE",
    "Rien touche a : migration des 17 jours, cru/cuit, recherche CIQUAL, " + C % 'alias.json' + ", "
    "scan code-barres, I4, " + C % 'visualViewport' + ", Milo, programmes, debriefs de seance.", GRIS))
F.append(Spacer(1, 6))

F.append(encadre(
    "VERSION ET COMMIT",
    "<b>ft-v1188</b> — commit " + C % 'fb392db4' + " sur " + C % 'master' + ". "
    "Deploiement <b>verifie vert</b> : run <b>#1060</b>, " + C % 'conclusion: success' + " a "
    "<b>08:52:22 UTC</b>. Ni backend ni worker attendus (" + C % 'Code.js' + " / "
    "" + C % 'worker.js' + " non touches). "
    "<b>Aucun point n'est reste ambigu</b> — c'etait ta condition de deploiement.", VERT))
F.append(Spacer(1, 6))

F.append(encadre(
    "UNE CHOSE A SAVOIR SI MICHEL COMPARE DEUX COPIES D'ECRAN",
    "Une meme ligne reprise peut afficher <b>1 kcal de moins</b> qu'avant ft-v1188. "
    "Ce n'est pas une perte : c'est l'arrondi de chance qui disparait.", ORANGE))


doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker — P1, les 3 verifications avant validation (ft-v1188)',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
print('   passe :', PASSE.replace('<b>', '').replace('</b>', ''))
