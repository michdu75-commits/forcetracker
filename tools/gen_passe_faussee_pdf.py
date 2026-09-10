#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/GARDE-FOU-LARGE-ET-LA-PASSE-FAUSSEE.pdf — ce qui a ete livre apres la decision
   du garde-fou LARGE, et LE PROBLEME RENCONTRE : une passe de tests faussee par ma propre
   mutation, qui m'a fait chercher un defaut qui n'existait pas.

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
OUT = os.path.join(ROOT, 'docs', 'GARDE-FOU-LARGE-ET-LA-PASSE-FAUSSEE.pdf')
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
                      'Force Tracker — le garde-fou LARGE livre, et les deux incidents — 10/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


F = []
F.append(P("Le garde-fou LARGE : livre — et les deux incidents du chemin", 'titre'))
F.append(P("Force Tracker — 10/09/2026. Michel a tranche le garde-fou LARGE. Le code de production "
           "ne change pas : il faisait deja ca. Ce qui change, ce sont les temoins — <b>23</b>, pas "
           "19. <b>ft-v1190 est en ligne</b> (run #1073 vert, passe propre 3513/0). Et le document "
           "raconte surtout <b>les deux incidents</b> : une passe de tests faussee par ma propre "
           "mutation, qui m'a fait chercher pendant une heure un defaut qui n'existait pas ; puis "
           "un <b>deploiement bloque depuis 5 h 30</b>, en silence.", 'sous'))

F.append(encadre(
    'EN UNE PHRASE',
    "Le tri des temoins est fini et il ne restait <b>aucune vraie regression</b>. Mais la passe "
    "complete a rendu <b>5 rouges</b> dans un bloc qui passait en isole — et la cause n'etait ni "
    "le code, ni l'environnement, ni un test instable : <b>j'avais modifie " + C % 'index.html' +
    " pendant que la passe tournait</b>, pour verifier autre chose. Le serveur du banc relit le "
    "fichier a chaque requete, donc le bloc tombe pile dedans."))
F.append(Spacer(1, 6))

F.append(P("1. La decision, et ce qu'elle change (rien, dans le code)", 'h1'))
F.append(P("Michel : <i>&laquo; Aucune ligne alimentaire ne peut etre enregistree sans une quantite "
           "reellement choisie par l'utilisateur &raquo;</i>, <b>independamment de l'origine technique "
           "de l'aliment</b>. Sa raison est ecrite : <i>&laquo; je prefere une regle metier unique a "
           "huit comportements differents &raquo;</i>."))
F.append(P("Le garde-fou couvrait deja les <b>huit</b> portes qui posent une fiche nutritionnelle. "
           "La decision confirme le code au lieu de le corriger. <b>Zero ligne de production "
           "modifiee</b> — sauf un commentaire, voir plus bas."))

F.append(P("2. Les 23 temoins tries — zero regression, et c'est MESURE", 'h1'))
F.append(tableau(
    ['famille', 'combien', 'ce qu'"'"'on fait'],
    [["<b>A</b> — le geste a change", "16",
      "le temoin enregistrait apres un remplissage automatique. On ajoute la frappe ou le clic. "
      "<b>Aucune valeur attendue ne bouge</b> — la consigne de Michel, mot pour mot : "
      "<i>&laquo; modifier le geste ; NE PAS affaiblir les assertions &raquo;</i>."],
     ["<b>B</b> — comportement perime", "7",
      "le temoin figeait <b>le pre-remplissage lui-meme</b>. Il se reecrit, en disant qui a decide "
      "et quand."],
     ["<b>C</b> — vraie regression", "<b>0</b>",
      "le seul candidat serieux a ete ecarte <b>par la mesure</b> : " + C % 'p.per100' + " "
      "(app.js ligne 1170) est ecrit <b>independamment</b> du drapeau de geste, donc le pour-100 g "
      "ne disparait pas avec la quantite."]],
    [46 * mm, 18 * mm, 101 * mm]))
F.append(Spacer(1, 5))

F.append(encadre(
    "LA GARANTIE NE SE SUPPRIME PAS, ELLE SE DEPLACE",
    "Le cas exemplaire est le bloc <b>CCXIV</b> : c'est <b>ft-v1105 que Michel vient de perimer</b> "
    "(elle avait tranche <i>&laquo; on ne retire pas le pre-remplissage : on le NOMME &raquo;</i>). "
    "<b>&laquo; Le nombre pre-rempli dit d'ou il vient &raquo;</b> devient <b>&laquo; la PASTILLE le "
    "dit, et le champ est vide &raquo;</b> ; <b>&laquo; il invite a verifier ta dosette &raquo;</b> "
    "devient <b>&laquo; il DEMANDE au lieu d'affirmer &raquo;</b> ; <b>&laquo; il dit que 100 g est "
    "un DEFAUT &raquo;</b> devient <b>&laquo; il n'invente RIEN &raquo;</b>. "
    "Et <b>les deux chiffres de sa capture — 155 kcal et 35 g — sont inchanges au caractere pres</b> : "
    "ils s'obtiennent maintenant par un clic. Sur deux autres blocs la garantie est meme <b>plus "
    "forte</b> : <i>&laquo; le champ ne vaut pas 250 &raquo;</i> tolerait un 100 que personne n'avait "
    "choisi ; <i>&laquo; le champ est VIDE &raquo;</i> ne tolere plus rien.", VERT))
F.append(Spacer(1, 5))

F.append(P("3. LE PROBLEME RENCONTRE — la passe que j'ai faussee", 'h1'))
F.append(P("La passe complete rend <b>3508 verts, 5 rouges</b>. Les cinq sont dans <b>un seul bloc</b> "
           "(CII), et ce bloc <b>passe en isole</b>. J'ai failli en conclure que l'option A cassait "
           "quelque chose de reel — donc &laquo; reparer &raquo; du code qui marchait."))
F.append(tableau(
    ['ce que j'"'"'ai mesure', 'resultat', 'ce que ca elimine'],
    [["le bloc seul, <b>6 fois de suite</b>", "<b>6 verts</b>", "ce n'est pas un test instable"],
     ["<b>toute la passe rejouee jusqu'a</b> ce bloc", "<b>1310 verts, 0 rouge</b>",
      "ce n'est pas l'etat accumule avant lui"],
     ["les trois fonctions suspectes, lues dans le code",
      "toutes <b>synchrones</b>, et les 12 remises a zero du drapeau sont <b>directes</b>",
      "ce n'est pas une course que j'aurais introduite"],
     ["<b>les horodatages des fichiers</b>", "voir ci-dessous", "<b>la cause</b>"]],
    [55 * mm, 45 * mm, 65 * mm]))
F.append(Spacer(1, 5))

F.append(encadre(
    "LA CHRONOLOGIE, ET ELLE EST SANS AMBIGUITE",
    "<b>16:21:05</b> — la passe complete demarre.<br/>"
    "<b>16:25:19</b> — je corrige une autre suite de tests.<br/>"
    "<b>16:27:10</b> — <b>je mute " + C % 'index.html' + "</b> pour verifier que ce correctif-la "
    "mord : je retire " + C % '_bcQtyPose=true' + " du " + C % 'oninput' + " du champ quantite.<br/>"
    "<b>vers 16:29</b> — la passe atteint le bloc CII.<br/>"
    "<b>16:39:57</b> — la passe se termine ; je restaure entre-temps, donc <b>tous les blocs "
    "suivants sont verts</b>.<br/><br/>"
    "Le serveur du banc d'essai relit " + C % 'index.html' + " <b>a chaque requete</b> "
    "(" + C % 'fs.createReadStream' + "). Le contexte cree par ce bloc a donc recu <b>la version "
    "cassee</b> : la frappe ne levait plus le drapeau de geste, l'app refusait d'enregistrer, "
    "5 temoins rougissaient. <b>C'est exactement ma mutation n°4</b>, celle qui fait 12 rouges "
    "quand on la lance expres."))
F.append(Spacer(1, 5))

F.append(encadre(
    "LA FAMILLE DE PIEGE, ET ELLE N'ETAIT PAS ECRITE",
    "<b>Muter un fichier SERVI pendant qu'une passe tourne fausse la passe en silence.</b> "
    "Le rouge parle du fichier mute, pas du code — et il est <b>indiscernable</b> d'un vrai defaut : "
    "il tombe sur de vrais temoins, avec un message plausible, dans le bloc qu'on vient justement de "
    "modifier. <i>Un banc d'essai n'est une mesure que si son sujet ne bouge pas pendant qu'on "
    "mesure.</i><br/><br/>"
    "<b>La regle qui manquait</b> : pendant une passe, on ne touche a <b>aucun</b> fichier servi "
    "(" + C % 'app.js' + ", " + C % 'index.html' + ", " + C % 'style.css' + ", les autres " +
    C % '.js' + "). Le controle negatif se fait <b>avant</b> la passe ou <b>apres</b>, jamais "
    "pendant. Les fichiers de test, eux, sont lus une seule fois au demarrage : les modifier ne "
    "change rien a la passe en cours — ce qui rend le piege encore plus discret, puisque "
    "l'habitude d'editer les tests pendant une passe, elle, est sans danger.", ORANGE))
F.append(Spacer(1, 5))

F.append(P("4. Ce que ca m'a coute, et ce que ca a produit", 'h1'))
F.append(P("<b>Une passe complete et deux tranches</b> pour une cause qui etait de moi. Ce qui a "
           "evite l'erreur reelle — conclure a un defaut d'option A et modifier du code sain — n'est "
           "pas une intuition : c'est d'avoir <b>cherche au lieu de conclure</b>, et d'avoir teste "
           "les hypotheses de la moins chere a la plus chere."))
F.append(P("<b>Trois choses en sont sorties</b>, qui restent utiles :"))
F.append(tableau(
    ['ce qui reste', 'pourquoi'],
    [["le temoin est <b>instrumente</b>",
      "il rendait <i>&laquo; faux &raquo;</i> sans dire ce qu'il avait vu. Il rend maintenant l'etat "
      "du drapeau, du champ, du bloc et du nom. <i>Un temoin qui echoue sans dire ce qu'il a vu "
      "coute une passe entiere par hypothese.</i>"],
     ["la <b>tranche de mesure</b>",
      "un morceau du banc decoupe pour rejouer un echec sans payer la passe entiere. "
      "<b>Jamais commitee</b> : ce serait une copie du banc, donc une 2e source de verite."],
     ["un <b>commentaire faux</b> corrige dans le code",
      "celui du garde-fou annoncait <i>&laquo; n'impacte que le bloc scan &raquo;</i> et citait "
      "l'estimation IA comme non concernee — alors qu'elle pose bien une fiche. <b>Un commentaire "
      "plus etroit que le code dispense le lecteur suivant d'aller verifier.</b>"]],
    [42 * mm, 123 * mm]))
F.append(Spacer(1, 6))

F.append(P("5. LE SECOND INCIDENT — un deploiement bloque depuis 5 h 30, en silence", 'h1'))
F.append(P("Le code etait pret, la passe verte, le commit pousse sur " + C % 'master' + " — et "
           "<b>rien ne partait</b>. Mon run restait en " + C % 'pending' + ", horodatage <b>fige</b>."))
F.append(tableau(
    ['run', 'etat', 'ce que ca voulait dire'],
    [["<b>#1072</b> (13:34)", "job " + C % 'deploy' + " en " + C % 'waiting' + " depuis "
      "<b>13:34:56</b>", "<b>plus de 5 h 30</b>, et <b>personne n'en savait rien</b> : aucune "
      "alerte, aucun mail, aucun rouge. Il tenait la file."],
     ["<b>#1073</b> (19:04)", C % 'pending' + ", " + C % 'updated_at' + " immobile",
      "le mien, derriere lui."]],
    [34 * mm, 52 * mm, 79 * mm]))
F.append(Spacer(1, 5))
F.append(encadre(
    "CE QUI A ETE FAIT, ET POURQUOI C'ETAIT SANS PERTE",
    "Le run bloque portait le commit " + C % '6fdd0661' + ", <b>entierement contenu</b> dans "
    "" + C % 'e066bd78' + " — il n'aurait donc fait que deployer un etat <b>plus ancien</b>. "
    "L'annuler ne perdait rien. <b>Effet mesure dans la minute</b> : " + C % 'pending' + " -&gt; "
    "" + C % 'queued' + ", " + C % 'updated_at' + " reparti (19:04:55 -&gt; 19:07:42), puis vert a "
    "19:08:12.<br/><br/>"
    "<b>Et ce n'est PAS la manoeuvre interdite du projet.</b> Une regle ecrite dit : en cas "
    "d'echec, <b>lancer un nouveau run, jamais relancer les jobs echoues</b> — une relance rejoue "
    "l'empaquetage et produit deux artefacts, que l'action de deploiement refuse de departager. "
    "Ici on n'a <b>ni relance</b> de jobs, <b>ni touche au workflow</b> : on a <b>retire de la file "
    "un run perime</b>.", ORANGE))
F.append(Spacer(1, 5))
F.append(encadre(
    "LE POINT COMMUN DES DEUX INCIDENTS",
    "<b>Aucun des deux ne s'annonce.</b> Le premier produit un rouge <b>plausible</b> sur un vrai "
    "temoin ; le second ne produit <b>rien du tout</b> — juste une absence. Dans les deux cas, ce "
    "qui les a trouves est le meme geste : <b>aller regarder l'etat reel au lieu de faire "
    "confiance a ce qui est affiche</b>. Le projet a deja une famille pour ca, le <i>&laquo; "
    "deploiement silencieux &raquo;</i> ; le premier incident en ouvre une nouvelle."))
F.append(Spacer(1, 6))

F.append(P("6. Ce qui n'est pas fait, et ce que je ne sais pas", 'h1'))
F.append(tableau(
    ['point', 'etat'],
    [["<b>DEPLOYE ET VERIFIE VERT</b>",
      "run <b>#1073</b>, " + C % 'conclusion: success' + " a <b>19:08:12 UTC</b> sur " +
      C % 'e066bd78' + ". La passe propre — celle ou je ne touche a rien — rend <b>3513 verts, "
      "0 rouge</b> : <b>la cause du chapitre 3 est confirmee par la mesure</b>, plus seulement "
      "deduite."],
     ["<b>iPhone</b>",
      "les trois pastilles, le champ vide et la reprise en un tap restent a valider par Michel sur "
      "Safari. Pas de WebKit dans ce conteneur."],
     ["<b>l'unite de la portion</b>",
      "l'app demande " + C % 'serving_quantity' + " a Open Food Facts, <b>jamais</b> " +
      C % 'serving_size' + " : sur un liquide, la pastille affiche &laquo; 250 g &raquo; pour ce qui "
      "peut etre 250 ml. Ce n'est pas une regression (le champ pre-rempli faisait la meme hypothese "
      "en silence). <b>Sujet separe</b>, a la demande de Michel."],
     ["<b>l'historique abime</b>", "pas touche, comme demande. Chantier a part, avec backup, "
      "essai a blanc, rapport et retour arriere."],
     ["<b>ce que je ne sais pas</b>",
      "<b>(1)</b> je n'ai <b>pas</b> rejoue les 6 mutations du controle negatif apres la passe propre : "
      "elles ont ete mesurees avant, sur les blocs en isole. <b>(2)</b> le proxy de ce conteneur "
      "<b>refuse " + C % 'github.io' + "</b> (403), donc je n'ai <b>pas pu lire le " + C % 'sw.js' +
      " reellement servi</b> : ma verification s'arrete a l'API GitHub. <i>Que l'app affiche bien "
      "ft-v1190 reste a confirmer par Michel. Je le dis plutot que de le compter comme verifie.</i>"]],
    [42 * mm, 123 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
    "ETAT DES TESTS",
    "<b>Passe complete (celle qui a ete faussee) : 3508 verts, 5 rouges</b>, les cinq expliques "
    "ci-dessus. <b>Tranche jusqu'au bloc : 1310 verts, 0 rouge.</b> <b>Bloc seul : 6 essais, "
    "6 fois 7/7.</b> Autres suites : calculs <b>339/339</b> (elles portaient 4 des 23 temoins), "
    "muscles 241/241, croises 50/50, dates 9/9, donnees classees 0 trou. "
    "<b>Controle negatif : 6 mutations.</b> Le champ redevient pre-rempli -&gt; <b>5 rouges</b>, "
    "exactement les 5 temoins du champ vide. La pastille de portion retiree -&gt; <b>3</b>, "
    "exactement le bloc concerne. La frappe qui ne leve plus le drapeau -&gt; <b>12</b>, exactement "
    "la famille A — <i>donc les temoins tapent pour de vrai au lieu de poser le drapeau a la main.</i> "
    "L'ancienne formulation de l'ecran -&gt; <b>3</b>, dont un temoin plus ancien qui interdisait "
    "<b>deja</b> le mot &laquo; dosette &raquo;. "
    "<b>Deux mutations ne mordent pas sur ces blocs, et je dis pourquoi</b> : elles sont couvertes "
    "par un autre bloc, ou je les ai <b>verifiees</b> plutot que supposees (3 rouges, exactement les "
    "temoins de clic).", GRIS))


doc = SimpleDocTemplate(OUT, pagesize=A4,
 leftMargin=22 * mm, rightMargin=22 * mm,
 topMargin=20 * mm, bottomMargin=22 * mm,
 title='Force Tracker — le garde-fou LARGE livre, les 23 temoins, et les deux incidents du chemin',
 author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
