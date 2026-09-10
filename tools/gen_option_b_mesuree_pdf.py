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
OUT = os.path.join(ROOT, 'docs', 'OPTION-B-MESUREE.pdf')
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
                      'Force Tracker — l option B mesuree avant d etre choisie — 10/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


F = []
#  EN-TETE 
F.append(P("L'option B, mesuree avant d'etre choisie", 'titre'))
F.append(P("Force Tracker — 10/09/2026, sur la version en ligne <b>ft-v1189</b>. "
           "Reponse a la section 18 de ton etat des lieux : <i>« avant tout nouveau correctif, "
           "mesurer exactement l'option B »</i>. "
           "Rien n'est corrige : le patch de simulation a ete pose, mesure, puis <b>retire</b>.", 'sous'))

F.append(encadre(
    'LA REPONSE EN UNE PHRASE',
    "<b>Ta crainte de la section 8 etait fondee, et elle ne se realise pas.</b> "
    "L'option B produit bien " + C % 'q:null' + " avec des macros deja calculees pour 205 g — mais "
    "la ligne reste <b>entierement reconstructible</b>, parce que " + C % 'per100' + " survit. "
    "<b>Le bug historique n'etait pas " + C % 'q:null' + ", c'etait " + C % 'per100:null' + ".</b>"))
F.append(Spacer(1, 6))

F.append(encadre(
    "COMMENT LA SIMULATION A ETE FAITE",
    "Un drapeau " + C % '_bcQtyPose' + " a ete ajoute <b>temporairement</b>, sur le modele exact de "
    "" + C % '_afPoidsPose' + " : mis a " + C % 'false' + " par " + C % '_offRemplirFormulaire' + " "
    "(remplir un champ depuis une fiche n'est pas un choix), mis a " + C % 'true' + " par la frappe "
    "dans le champ et par le clic sur une pastille. " + C % '_provFood' + " ne lit puis n'ecrit "
    "" + C % 'q' + " que si le drapeau est leve. "
    "<b>Deux fichiers touches, sauvegardes avant, restaures apres, arbre verifie propre.</b> "
    "Aucun commit.", GRIS))

#  LA MESURE 
F.append(P("Ce que l'option B produit reellement", 'h1'))

F.append(P("Fiche de test : " + C % '94 / 5,2 / 12 / 2,4' + " pour 100 g, paquet 410 g. "
           "Le geste joue est celui du rapport — <b>scanner, ne toucher a aucune quantite, "
           "enregistrer</b> — puis deux controles ou un geste a lieu.", 'petit'))

F.append(tableau(
    ['cas', 'q', 'u', 'macros', 'per100', 'reconstructible ?'],
    [["portion <b>205</b>, aucun geste", "<b>null</b>", "<b>null</b>", "193/11/25/5",
      "94 / 5,2 / 12 / 2,4", "<b>OUI — 205 g</b>"],
     ["repli <b>100</b>, aucun geste", "<b>null</b>", "<b>null</b>", "94/5/12/2",
      "94 / 5,2 / 12 / 2,4", "<b>OUI — 100 g</b>"],
     ["<i>controle</i> — on <b>tape 300 g</b>", "<b>300</b>", "g", "282/16/36/7",
      "idem", "OUI — 300 g"],
     ["<i>controle</i> — on <b>clique le paquet</b>", "<b>410</b>", "g", "385/21/49/10",
      "idem", "OUI — 410 g"]],
    [40 * mm, 15 * mm, 14 * mm, 26 * mm, 32 * mm, 38 * mm]))
F.append(Spacer(1, 5))

F.append(encadre(
    "POURQUOI CA MARCHE, ET C'EST STRUCTUREL",
    "Le bug d'origine etait " + C % 'q:null' + " <b>ET</b> " + C % 'per100:null' + " — <i>c'est le "
    "second qui tuait la ligne.</i> "
    "Ici " + C % 'per100' + " arrive par un chemin <b>totalement independant de la quantite</b> : "
    "il vient de la fiche produit, pas du champ. Le calcul "
    "" + C % 'kcal / per100 x 100' + " redonne donc exactement la quantite affichee — 193/94x100 = "
    "<b>205</b>, 94/94x100 = <b>100</b>. "
    "<b>Une ligne sans quantite n'est morte que si elle n'a pas non plus de reference.</b>", VERT))
F.append(Spacer(1, 5))

F.append(P("Et les deux controles montrent que le chemin normal n'est pas casse : taper une "
           "quantite et cliquer une pastille ecrivent toujours " + C % 'q' + " et " + C % 'u' + ". "
           "<b>Le drapeau ne bloque que ce que personne n'a choisi.</b>", 'petit'))

#  CE QUI CHANGE QUAND MEME 
F.append(P("Une consequence reelle, dite avant le choix", 'h1'))

F.append(encadre(
    "LA PASTILLE « LA DERNIERE FOIS » DISPARAIT SUR CES LIGNES",
    "" + C % '_bcProposerDerniere' + " est alimentee par le " + C % 'q' + " enregistre "
    "(" + C % 'app.js:2579' + " et " + C % 'app.js:3719' + "). Avec " + C % 'q:null' + ", la "
    "pastille <b>« 205 g (la derniere fois) »</b> n'apparaitra pas a la reprise suivante de cet "
    "aliment. "
    "<i>C'est coherent — on ne propose pas comme « derniere fois » une quantite que personne n'a "
    "choisie</i> — mais c'est un changement <b>visible</b>, et il disparait des le premier vrai "
    "choix.", ORANGE))

#  A OU B 
F.append(P("Ce que la mesure change entre A et B", 'h1'))

F.append(P(
    "<b>Sur la donnee : rien.</b> Les deux options produisent la meme ligne saine — pas de "
    "quantite inventee, une reference intacte, une ligne redimensionnable. "
    "Elles ne different que sur <b>ce que la personne voit</b>."))

F.append(tableau(
    ['', 'A — champ vide + pastilles', 'B — ecran inchange, drapeau a l\'ecriture'],
    [["ce qui s'affiche apres un scan",
      "quantite <b>vide</b>, deux boutons : « 205 g — portion fabricant », « 410 g — paquet »",
      "<b>205</b> affiche, avec sa source ecrite a cote"],
     ["gestes en plus", "<b>un clic</b> a chaque scan", "<b>aucun</b>"],
     ["la personne sait-elle que rien n'est encore choisi ?",
      "<b>OUI</b> — le champ vide le dit",
      "<b>NON</b> — rien a l'ecran ne distingue « affiche » de « compte »"],
     ["ft-v1105 (« on ne retire pas le pre-remplissage »)",
      "l'ecran change", "<b>intacte a la lettre</b>"]],
    [42 * mm, 62 * mm, 61 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
    "APRES MESURE, JE PENCHE POUR A — ET LA RAISON N'EST PAS ESTHETIQUE",
    "L'option B est <b>invisible</b>. La personne enregistre, la ligne part sans quantite, et "
    "<b>rien ne le lui a signale</b>. On remplace une quantite inventee par une absence "
    "silencieuse — c'est mieux pour la donnee, mais ca reste une decision prise sans elle. "
    "L'option A, elle, rend le manque <b>lisible</b> : un champ vide est une question posee. "
    "<i>C'est aussi le comportement que tu decris toi-meme comme correct dans le cas des pizzas "
    "(section 10) : la reference est proposee, le choix appartient a la personne.</i>"))
F.append(Spacer(1, 5))

F.append(P(
    "<b>Et A ne coute presque rien a construire</b> : " + C % '_bcProposerDerniere' + " vide deja "
    "le champ et pose une pastille cliquable ; " + C % '_bcProposerPaquet' + " / "
    "" + C % '_bcReprendrePaquet' + " font deja le paquet. Il manque la <b>troisieme</b> pastille — "
    "celle de la portion fabricant — et le champ a vider. Aucun mecanisme nouveau."))

#  RESERVE 
F.append(P("Ce que cette mesure ne dit pas", 'h1'))

F.append(tableau(
    ['limite', 'pourquoi'],
    [["la fiche produit est <b>fabriquee</b>",
      "aucun acces au reseau Open Food Facts depuis ce conteneur ; seul le champ etudie varie d'un "
      "cas a l'autre, tout le reste est constant"],
     ["<b>pas de WebKit</b>",
      "le rendu iPhone des pastilles et du champ vide reste a valider par Michel"],
     ["la simulation n'est <b>pas</b> le correctif",
      "elle prouve que l'option B ne fabrique pas le bug historique ; elle ne prouve pas qu'une "
      "implementation reelle couvrirait les onze portes qui remplissent ce bloc"],
     ["l'historique n'est pas touche",
      "les anciennes lignes de la section 11 restent un chantier separe, comme demande"]],
    [46 * mm, 119 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
    "ETAT DU DEPOT",
    "<b>Aucune ligne de production n'a ete modifiee.</b> Le patch de simulation a touche "
    "" + C % 'app.js' + " et " + C % 'index.html' + ", les deux ont ete sauvegardes avant, "
    "restaures apres, et l'arbre a ete verifie propre. "
    "La trace complete est dans " + C % 'docs/JOURNAL-DE-TEST.md' + ". "
    "<b>Le choix A ou B revient a Michel.</b>", GRIS))


doc = SimpleDocTemplate(OUT, pagesize=A4,
 leftMargin=22 * mm, rightMargin=22 * mm,
 topMargin=20 * mm, bottomMargin=22 * mm,
 title='Force Tracker — l option B mesuree avant d etre choisie (section 18)',
 author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
print(' passe :', PASSE.replace('<b>', '').replace('</b>', ''))
