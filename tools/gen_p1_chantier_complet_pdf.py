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
OUT = os.path.join(ROOT, 'docs', 'P1-CHANTIER-COMPLET.pdf')
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
                      'Force Tracker — le chantier P1 en entier — ft-v1183 a ft-v1186 — 09/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


F = []

# ═══════════════════════════ EN-TETE ═══════════════════════════
F.append(P("Le chantier P1 en entier", 'titre'))
F.append(P("Force Tracker — 09/09/2026 — de <b>ft-v1183</b> a <b>ft-v1186</b>, avec le code. "
           "Redige pour GPT, qui a ecrit la specification P1 et l'a relue deux fois.", 'sous'))

F.append(encadre(
    'CE QUE COUVRE CE DOCUMENT',
    "Quatre versions, deux relectures, et un modele de donnees qui a change trois fois. "
    "Le probleme de depart tenait en une ligne : un <b>x2</b> sur une portion de 300 kcal "
    "enregistrait <b>q:null, u:null, per100:null</b> avec 600 kcal — « 2 portions de 300 » se "
    "fossilisait en « 1 portion de 600 », et plus rien ne pouvait redimensionner cette ligne. "
    "A l'arrivee, une portion a un <b>nom</b>, un <b>poids</b>, et l'unite choisie survit a la "
    "reprise."))
F.append(Spacer(1, 6))

F.append(encadre(
    "COMMENT CE DOCUMENT EST FABRIQUE — et pourquoi ca compte",
    "<b>Le code ci-dessous n'est pas recopie : il est EXTRAIT du depot a chaque generation.</b> "
    "Recopier du code dans un document fabrique une deuxieme source de verite qui se perime en "
    "silence — le document finirait par montrer autre chose que ce qui tourne. "
    "Les commentaires sont retires (ils contiennent des emoji, qui ne se rendent pas dans ce "
    "format) ; <b>le code nu est exact, caractere pour caractere</b>. "
    "Les chiffres viennent des journaux de passe, jamais de la memoire de qui ecrit.", GRIS))

# ═══════════════════════════ 1. CHRONOLOGIE ═══════════════════════════
F.append(P("1. La chronologie, et ce que chaque etape a change", 'h1'))

F.append(tableau(
    ['Etape', 'Ce qui a ete fait', 'Ce que ca a coute'],
    [["<b>ft-v1183</b><br/>« portion » devient une unite",
      "Le multiplicateur de portions n'avait <b>aucun proprietaire</b> : "
      + C % '_afApplyPortion' + " ne faisait que reecrire les 4 champs a l'ecran. "
      + C % '_provFood' + " n'avait aucune branche pour l'unite « portion ».",
      "La passe complete a <b>refuse mon premier correctif</b> : 7 temoins rouges, tous disant "
      "« on n'invente pas une quantite qu'elle n'a jamais eue »."],
     ["<b>Relecture 1</b> (Michel)",
      "« 1 portion = 300 kcal, poids inconnu <b>ne suffit pas</b> — je veux savoir si c'est "
      "1 steak, 1 yaourt, 1 dose. »",
      "Mon refus de " + C % 'portionWeightG' + " tombe : je l'avais justifie par une mesure du "
      "comportement <b>actuel</b>."],
     ["<b>Reponse de conception</b>",
      "Cinq questions repondues sans ecrire une ligne de code, dont l'arrondi de la reference "
      "<b>mesure</b> et non suppose.",
      "Ma premiere mesure d'arrondi etait fausse : elle ne testait pas la fraction."],
     ["<b>ft-v1186</b><br/>la portion nommee",
      "Etiquette et poids d'une portion stockes ; masse totale et reference restent <b>derivees</b>.",
      "Un rouge trouve <b>avant</b> livraison : la donnee etait juste et <b>l'ecran mentait</b>."]],
    [38 * mm, 68 * mm, 59 * mm]))

# ═══════════════════════════ 2. LE MODELE ═══════════════════════════
F.append(P("2. Le modele de donnees, avant et apres", 'h1'))

F.append(tableau(
    ['Champ', 'Avant le chantier', 'Apres'],
    [[C % 'kcal / prot / carbs / fat', "les totaux consommes", "inchange"],
     [C % 'q', "<b>null</b> des qu'on comptait en portions", "le nombre de portions (2)"],
     [C % 'u', "<b>null</b>", C % "'portion'"],
     [C % 'portionLabel', "<i>n'existait pas</i>", "le nom d'UNE portion (" + C % "'steak'" + ")"],
     [C % 'portionWeightG', "<i>n'existait pas</i>", "le poids d'UNE portion (125)"],
     [C % 'per100', "null, et non calculable", "derive de " + C % 'q x portionWeightG'],
     ["<i>masse totale</i>", "—", "<b>jamais stockee</b> — calculee a l'affichage"],
     ["<i>reference d'une portion</i>", "—", "<b>jamais stockee</b> — " + C % 'totaux / q']],
    [40 * mm, 62 * mm, 63 * mm]))
F.append(Spacer(1, 5))

F.append(encadre(
    "DEUX CHOSES NE SONT PAS STOCKEES, ET C'EST DELIBERE",
    "La <b>masse totale</b> et la <b>reference d'une portion</b> sont des <b>vues</b> de "
    + C % 'totaux' + ", " + C % 'q' + " et " + C % 'portionWeightG' + ". "
    "Stocker une vue cree une seconde source qu'il faut arrondir pour l'ecrire — et c'est "
    "l'arrondi qui perd de l'information, pas le calcul. "
    "<b>Mesure</b> sur 601 kcal / 3 portions, dix cycles de reprise : reference derivee = "
    "200,3333 stable, totaux <b>601 inchanges</b> ; reference stockee arrondie = <b>600 des le "
    "premier cycle</b>, puis fige.", VERT))

# ═══════════════════════════ 3. LE CODE ═══════════════════════════
F.append(P("3. Le code, piece par piece", 'h1'))

F.append(P("3.1 — Les proprietaires : une variable par notion", 'h2'))
F.append(P(
    "Quatre variables, et la separation entre les deux dernieres est la contrainte structurelle de "
    "tout le chantier."))
F.append(bloc_code(code('app.js', 'lg', "let _afPortions=1;", 0, 0) + "\n"
                   + code('app.js', 'lg', "let _afPortionPose=false;", 0, 0) + "\n"
                   + code('app.js', 'lg', "let _afPortionLabel='', _afPortionPoids=0;", 0, 0),
                   "app.js — les proprietaires"))

F.append(tableau(
    ['Variable', 'Signifie', 'Pourquoi elle existe'],
    [[C % '_afPortions', "le multiplicateur choisi (x2)",
      "En grammes, la quantite affichee vit dans le champ " + C % 'af-prop' + " du DOM. "
      "<b>En portions, elle ne vivait nulle part.</b>"],
     [C % '_afPortionPose', "la personne a <b>choisi</b>",
      "Le multiplicateur vaut 1 par defaut : sans ce drapeau, <b>« jamais touche » et « x1 "
      "choisi » sont indiscernables</b>."],
     [C % '_afPortionLabel', "le nom d'UNE portion", "« 2 portions » ne dit pas de quoi."],
     [C % '_afPortionPoids', "le poids d'UNE portion",
      "<b>N'est PAS</b> " + C % '_afPoidsDeclare' + ", qui est le poids de <b>ce qui est "
      "affiche</b> (le total). Deux notions, deux variables, jamais la meme."]],
    [35 * mm, 42 * mm, 88 * mm]))
F.append(Spacer(1, 4))
F.append(P("Toutes retombent ensemble, sur le meme chemin de remise a zero :", 'petit'))
F.append(bloc_code(code('app.js', 'lg', 'function _afResetUnite()', 0, 0)))

F.append(P("3.2 — Le geste : cliquer un multiplicateur", 'h2'))
F.append(bloc_code(code('app.js', 'fn', '_afApplyPortion')))
F.append(P(
    "Trois lignes, et chacune repare un defaut distinct : la premiere <b>retient</b> le choix "
    "(il n'etait ecrit nulle part), la deuxieme <b>l'affirme</b> (jumeau de " + C % '_afPoidsPose'
    + "), et " + C % '_afMajAncre()' + " est appele <b>sans</b> " + C % 'srcChange' + " — il "
    "redessine, il ne relit pas l'ecran, sinon la reference deviendrait les valeurs deja "
    "multipliees et l'erreur se figerait."))

F.append(P("3.3 — L'invariant : quand l'ecran redevient la reference", 'h2'))
F.append(bloc_code(code('app.js', 'lg', 'const relit=(srcChange||!_afRef||!_afRef.base);', 0, 1)
                   + "\n" + code('app.js', 'lg', 'if(relit){ _afPortions=1; _afPortionPose=false; }', 0, 0),
                   "app.js — dans _afMajAncre"))
F.append(P(
    "<b>Mesure</b> : on tape x2 (ecran 600), puis on corrige une macro a la main. La source a "
    "change, donc " + C % 'base' + " <b>devient 600</b>. Garder " + C % '_afPortions=2' + " "
    "enregistrerait « 2 portions » pour des totaux qui sont deja ceux de deux portions. "
    "<i>Ce qui est affiche est, par definition, UNE portion de lui-meme.</i>"))

F.append(P("3.4 — La definition, et ce qu'elle refuse d'inventer", 'h2'))
F.append(bloc_code(code('app.js', 'fn', '_portionDefTexte')))
F.append(P(
    "Un <b>seul proprietaire</b> du texte, lu par l'ecran d'ajout <b>et</b> par celui d'edition : "
    "deux copies finiraient par ne plus dire la meme chose. "
    "Sans nom -> « portion non definie ». Sans poids -> « poids inconnu ». "
    "<b>La masse totale est calculee ici et nulle part ailleurs</b>, et seulement si elle est "
    "connue."))

F.append(P("3.5 — La saisie : pourquoi la frappe ne redessine jamais", 'h2'))
F.append(bloc_code(code('app.js', 'fn', '_afPortionNom') + "\n"
                   + code('app.js', 'fn', '_afMajDefPortion') + "\n"
                   + code('app.js', 'fn', '_afPortionNomSaisi') + "\n"
                   + code('app.js', 'fn', '_afPortionPoidsSaisi')))
F.append(P(
    "Une <b>puce</b> est un geste unique : on peut redessiner (il faut l'allumer). "
    "Une <b>frappe</b>, non — reconstruire le bloc pendant qu'on tape dedans <b>detruit le champ "
    "au premier caractere</b>. Les deux fonctions de saisie ecrivent la variable et ne "
    "rafraichissent que la ligne de definition."))

F.append(encadre(
    "ET LE POIDS D'UNE PORTION NE RESCALE RIEN — c'est toute la difference avec l'autre champ",
    "Savoir qu'un steak pese 125 g <b>ne change pas ce qu'on a mange</b> : deux steaks restent "
    "deux steaks. Le champ de poids de l'onglet grammes, lui, <b>cale</b> les valeurs. "
    "Ce champ-ci n'est qu'un <b>pont vers la masse</b> : il permet d'afficher « 250 g en tout » "
    "et de calculer un pour-100 g. <b>Et il ne bascule pas l'unite</b> — c'etait la demande n°2 "
    "de Michel, mot pour mot. Deux temoins figent la distinction (mesure : 240 / 16 avant et "
    "apres).", VERT))

F.append(P("3.6 — La descente jusqu'a la donnee", 'h2'))
F.append(bloc_code(code('app.js', 'lg', "if(!p.q && _afPortionPose && _afUnite==='portion'",
                        0, 30, garder=12),
                   "app.js — dans _provFood, la branche portion"))
F.append(P(
    "Le garde sur " + C % '_afUnite' + " <b>n'est pas decoratif, et la mesure l'a exige</b> : "
    "l'onglet grammes, <i>avant</i> qu'un poids soit declare, pose lui aussi "
    + C % "_afRef={q:1,u:''}" + ". Sans ce test, quelqu'un qui hesite sur cet onglet verrait sa "
    "ligne enregistree <b>en portions</b> — une unite qu'il n'a pas choisie."))
F.append(P(
    "Et le pour-100 g est <b>recalcule a chaque ecriture</b> depuis " + C % 'q x portionWeightG'
    + ", jamais traite comme une verite independante — c'est l'option (a) tranchee par Michel. "
    "On n'ecrase jamais un pour-100 g deja connu : une declaration ne passe pas devant une valeur "
    "publiee.", 'petit'))

F.append(P("3.7 — La liste blanche, oubliee pour la quatrieme fois", 'h2'))
F.append(bloc_code(code('app.js', 'lg', "else if(+_afSrc.q>0 && _afSrc.u==='portion')", 0, 0) + "\n"
                   + code('app.js', 'lg', "if(_afSrc.portionLabel) p.portionLabel", 0, 1),
                   "app.js — dans _provFood, la partie qui recopie la source"))
F.append(encadre(
    "LE MEME OUBLI, QUATRE FOIS, AU MEME ENDROIT",
    "Cette fonction construit une <b>liste blanche</b> : un champ pose en amont et non recopie ici "
    "<b>n'atteint jamais l'entree enregistree — sans erreur, sans test rouge</b>. "
    "L'avertissement est ecrit <b>trois fois en majuscules</b> dans cette meme fonction, et c'est "
    "arrive une quatrieme fois. "
    "<i>Un avertissement en commentaire ne protege de rien. Cette fois un temoin dedie fige la "
    "traversee.</i>", ORANGE))

F.append(P("3.8 — La reprise : l'unite appartient a la personne", 'h2'))
F.append(bloc_code(code('app.js', 'fn', '_afReprendrePortions')))
F.append(P(
    "L'entree porte les <b>totaux</b> et " + C % 'q' + " ; la reference d'une portion est donc "
    + C % 'totaux / q' + " — on ne l'invente pas, on la retrouve. Aucun etat d'ecran nouveau : on "
    "repose le bloc existant avec le bon multiplicateur allume."))
F.append(bloc_code(code('app.js', 'lg', "if(it.u==='portion'){ _afPortionLabel=", 0, 1) + "\n"
                   + code('app.js', 'lg', "if(P && it.u!=='portion' && (+P.kcal>0", 0, 0),
                   "app.js — dans quickFillFood (la porte jumelle _afSuggPrendreLocale a les memes)"))

F.append(P("3.9 — Le favori : rafraichir la definition, jamais les macros", 'h2'))
F.append(bloc_code(code('app.js', 'fn', '_majDefFavori')))
F.append(P(
    "<i>« Un steak pese 125 g »</i> est un fait sur l'<b>aliment</b> ; <i>« j'en ai mange 2 »</i> "
    "est un fait sur <b>ce repas-la</b>. Ecraser les macros ferait qu'un gros repas redefinirait le "
    "favori pour toujours. Et une definition vide n'efface jamais l'ancienne."))

F.append(P("3.10 — L'export", 'h2'))
F.append(bloc_code(code('setup.js', 'lg', 'const NUTRI_COLONNES', 0, 0) + "\n"
                   + code('setup.js', 'lg', 'portion_label: e && e.portionLabel', 0, 1),
                   "setup.js — deux colonnes de plus"))
F.append(P(
    "Sans elles, l'export perdrait exactement l'information qu'on vient de sauver.", 'petit'))

# ═══════════════════════════ 4. LES TROIS ROUGES ═══════════════════════════
F.append(P("4. Les trois fois ou la mesure a arrete un correctif", 'h1'))

F.append(P(
    "C'est la partie la plus utile de ce document, parce qu'aucune de ces trois erreurs n'etait "
    "visible a la relecture."))

F.append(tableau(
    ['Ce que j\'allais livrer', 'Ce que la mesure a dit', 'La regle qui en sort'],
    [["Ecrire " + C % "q:1, u:'portion'" + " des que le bloc portions est affiche",
      "<b>7 temoins rouges</b>, tous « on n'invente pas une quantite qu'elle n'a jamais eue ». Le "
      "bloc portions est l'etat <b>par defaut</b> : l'afficher ne prouve aucun choix.",
      "Il fallait un drapeau. <b>Les temoins n'ont pas ete desserres</b> : les deux du nouveau bloc "
      "qui attendaient " + C % 'q:1' + " sont passes a la garantie plus forte, " + C % 'q:null' + "."],
     ["Refuser " + C % 'portionWeightG' + " parce que « cet etat n'existe pas »",
      "L'etat n'existe pas <b>dans le comportement actuel</b>. Le besoin, lui, existe : "
      "« 2 steaks de 125 g » perd son sens en grammes.",
      "<b>Une mesure du comportement actuel ne justifie jamais un refus de BESOIN.</b> Elle decrit "
      "ce qui est, pas ce qui manque."],
     ["Livrer la reprise telle quelle",
      "Reprendre « 2 steaks » <b>rouvrait le champ grammes</b> (un pour-100 g existait) et l'ecran "
      "perdait le « 2 ». <b>La donnee etait intacte, l'ecran mentait.</b>",
      "<b>Le pour-100 g ne decide plus de l'unite.</b> L'unite appartient a la personne, pas a la "
      "richesse de la fiche."]],
    [42 * mm, 62 * mm, 61 * mm]))

# ═══════════════════════════ 5. VALIDATION ═══════════════════════════
F.append(P("5. Validation", 'h1'))

F.append(tableau(
    ['Suite', 'Resultat'],
    [["Bloc de temoins de ft-v1183 (CCLXXX)", "15 temoins"],
     ["Bloc de temoins de ft-v1186 (CCLXXXI)", "14 temoins"],
     ["Parcours complet (bout en bout, vrai navigateur)", PASSE],
     ["Calculs / muscles / croises / dates", "339/339 · 241/241 · 50/50 · 9/9"],
     ["Donnees classees face au moteur conversationnel", "0 trou non classe"],
     ["Controle negatif (ft-v1186)", "<b>15 mutations, toutes mordent</b>"],
     ["Deploiement", "run #1054, <font color='#1E7A46'><b>success</b></font> a 19:54:25 UTC"]],
    [72 * mm, 93 * mm]))
F.append(Spacer(1, 5))

F.append(encadre(
    "UNE PROTECTION SANS TEMOIN N'EST PAS UNE PROTECTION — quatre fois dans ce seul chantier",
    "Quatre protections se sont revelees <b>sans temoin</b>, et le controle negatif ne l'a dit "
    "que parce qu'on lui a demande : "
    "<b>(1)</b> l'etat « boutons de portion » de l'ecran d'edition ; "
    "<b>(2)</b> le drapeau cote edition ; "
    "<b>(3)</b> le rafraichissement du favori — <b>et la, ce n'etait pas le temoin qui manquait, "
    "c'etait ma FIXTURE</b> : elle mettait 600 des deux cotes, donc l'ecrasement etait "
    "arithmetiquement invisible ; "
    "<b>(4)</b> le garde-fou de ce document lui-meme (voir plus bas). "
    "<i>Une mutation qui ne mord pas ne prouve pas que le code est inutile : elle pose une "
    "question, et il faut y repondre.</i>", ORANGE))

# ═══════════════════════════ 6. TEMOINS TOUCHES ═══════════════════════════
F.append(P("6. Deux temoins d'une version precedente ont ete touches", 'h1'))

F.append(P(
    "La passe complete de ft-v1186 a fait rougir <b>deux temoins de ft-v1183</b>. Ils exigeaient le "
    "motif exact <i>« 1 portion = 300 kcal »</i> ; en ajoutant le nom, la phrase devient "
    "<i>« 1 portion = portion non definie, poids inconnu · 300 kcal »</i>."))
F.append(P(
    "<b>La garantie qu'ils figeaient est intacte, et meme plus forte</b> : l'ecran annonce "
    "desormais aussi que le nom manque. Ce n'est pas un temoin qu'on desserre pour faire passer du "
    "code — c'est le motif qui figeait plus que sa garantie. "
    "Motifs resserres sur les trois exigences reelles, modification <b>datee et signee dans le "
    "fichier de tests</b>, et surtout <b>eprouvee</b> : retirer la definition, taire le poids "
    "inconnu ou supprimer le nombre de portions les fait toujours rougir. "
    "<i>La difference entre une mise au point et un assouplissement se mesure.</i>"))

# ═══════════════════════════ 7. RESTE OUVERT ═══════════════════════════
F.append(P("7. Ce qui reste ouvert", 'h1'))

F.append(tableau(
    ['Sujet', 'Etat'],
    [["<b>Migration des lignes deja abimees</b>",
      "<b>Intacte, rien n'a ete tente.</b> Une ligne a " + C % 'q:null, per100:null' + " ne permet "
      "pas de deviner si 323 kcal valaient 100 ou 300 g. L'outil a trois niveaux (certain / ambigu "
      "/ insuffisant) reste a construire."],
     ["Afficher « 2 steaks » dans le journal du jour",
      "<b>Prochain chantier</b>, decide separe par Michel. Le journal n'affiche aujourd'hui "
      "<b>aucune</b> quantite — ni grammes ni portions."],
     ["Le garde-fou de masse en portions",
      "Toujours muet. Avec " + C % 'portionWeightG' + " il pourrait desormais parler."],
     ["Retirer une etiquette fausse",
      "Possible seulement en editant l'entree, pas depuis l'ecran d'ajout. <i>Assume et ecrit, pas "
      "oublie.</i>"],
     ["Corriger " + C % 'portionWeightG' + " apres coup",
      "Non teste : une ligne dont on changerait le poids de portion depuis l'edition, sans "
      "repasser par l'ajout. <b>Si tu vois la un chemin ou le pour-100 g survit a une definition "
      "qui a change, il m'interesse.</b>"],
     ["Cru / cuit · recherche CIQUAL · scan", "Hors perimetre, non touches."],
     ["Validation iPhone", "A faire par Michel : pas de WebKit dans le conteneur."]],
    [52 * mm, 113 * mm]))

# ═══════════════════════════ 8. CE DOCUMENT ═══════════════════════════
F.append(P("8. Et ce document a repete la meme faute", 'h1'))

F.append(encadre(
    "TROIS EMOJI, DES CARRES NOIRS, ET UN GARDE-FOU FAUX",
    "Dans la version precedente de ce fil, trois emoji ont fui dans le texte du PDF et sortaient en "
    "<b>carres noirs</b> — alors que l'en-tete du generateur l'annonce noir sur blanc. "
    "<i>Un avertissement en commentaire ne protege de rien ; seul un controle qui echoue protege.</i> "
    "<b>Et ma premiere version du garde-fou etait fausse</b> : elle n'inspectait que les "
    "paragraphes, donc ni les encadres ni les tableaux — eprouvee, elle a <b>laisse passer</b> un "
    "emoji dans un titre. "
    "<b>Une protection partielle qui a l'air complete est pire qu'une protection absente.</b> "
    "Elle est posee sur les cinq portes par lesquelles le texte entre, et les cinq sont eprouvees. "
    "<i>C'est exactement la lecon du paragraphe 5, commise sur l'outil qui sert a la raconter.</i>",
    ORANGE))

F.append(Spacer(1, 8))
F.append(encadre(
    'OU LIRE LA SUITE',
    "Les trois documents precedents de ce fil : " + C % 'docs/P1-PORTIONS-DEBRIEF.pdf' + " "
    "(ft-v1183), " + C % 'docs/P1-PORTIONS-CONCEPTION.pdf' + " (la reponse de conception) et "
    + C % 'docs/P1-PORTION-NOMMEE.pdf' + " (ft-v1186). "
    "Le journal de version est dans " + C % 'CLAUDE.md' + ", l'etat courant dans "
    + C % 'docs/CONTEXTE-ACTUEL.md' + ", les doutes non promus dans "
    + C % 'docs/JOURNAL-DE-TEST.md' + ", et le catalogue des familles de bugs dans "
    + C % 'BUGS.md' + ". "
    "Le depot est public : " + C % 'github.com/michdu75-commits/forcetracker' + ".", GRIS))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker — le chantier P1 en entier (ft-v1183 a ft-v1186)',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
print('   passe :', PASSE.replace('<b>', '').replace('</b>', ''))
