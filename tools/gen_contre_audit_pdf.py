#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/CONTRE-AUDIT-NUTRITION-REPONSE.pdf — la reponse au contre-audit de GPT.

⚠️ CONTRAINTE DE POLICE (leçon du 02/09) : les polices integrees de reportlab sont en
   WinAnsi/cp1252. Les ACCENTS FRANCAIS passent parfaitement ; les EMOJI et les fleches
   unicode (→) sortent en carres noirs. On ecrit donc en francais accentue normal,
   avec « -> » pour les fleches.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'CONTRE-AUDIT-NUTRITION-REPONSE.pdf')

ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')
VERT = colors.HexColor('#1E7A46')

S = getSampleStyleSheet()
st = {
    'titre': ParagraphStyle('titre', parent=S['Title'], fontName='Helvetica-Bold',
                            fontSize=19, leading=23, textColor=ENCRE, alignment=TA_LEFT,
                            spaceAfter=2),
    'sous': ParagraphStyle('sous', parent=S['Normal'], fontName='Helvetica',
                           fontSize=9.5, leading=13, textColor=GRIS, spaceAfter=14),
    'h1': ParagraphStyle('h1', parent=S['Heading1'], fontName='Helvetica-Bold',
                         fontSize=13, leading=16, textColor=ROUGE,
                         spaceBefore=16, spaceAfter=6),
    'h2': ParagraphStyle('h2', parent=S['Heading2'], fontName='Helvetica-Bold',
                         fontSize=10.5, leading=13.5, textColor=ENCRE,
                         spaceBefore=10, spaceAfter=4),
    'p': ParagraphStyle('p', parent=S['Normal'], fontName='Helvetica',
                        fontSize=9.3, leading=13.2, textColor=ENCRE, spaceAfter=6),
    'petit': ParagraphStyle('petit', parent=S['Normal'], fontName='Helvetica',
                            fontSize=8.2, leading=11.5, textColor=GRIS, spaceAfter=5),
    'cell': ParagraphStyle('cell', parent=S['Normal'], fontName='Helvetica',
                           fontSize=8.3, leading=11),
    'cellb': ParagraphStyle('cellb', parent=S['Normal'], fontName='Helvetica-Bold',
                            fontSize=8.3, leading=11),
    'code': ParagraphStyle('code', parent=S['Normal'], fontName='Courier',
                           fontSize=8, leading=11, textColor=ENCRE),
}


def P(t, s='p'):
    return Paragraph(t, st[s])


def encadre(titre, corps, couleur=ROUGE):
    inner = [[Paragraph('<b>%s</b>' % titre, st['cellb'])],
             [Paragraph(corps, st['cell'])]]
    t = Table(inner, colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FOND),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBEFORE', (0, 0), (0, -1), 2.4, couleur),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    # ⚠️ Un encadre coupe entre deux pages laisse son titre orphelin en bas de page
    #    (constate au rendu : « L'INSTRUCTION EXACTE » seul en pied de page 1).
    return KeepTogether(t)


def tableau(entetes, lignes, largeurs):
    data = [[Paragraph('<b>%s</b>' % h, st['cellb']) for h in entetes]]
    for l in lignes:
        data.append([Paragraph(c, st['cell']) for c in l])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EDEDEA')),
        ('GRID', (0, 0), (-1, -1), 0.4, TRAIT),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    return t


def pied(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(GRIS)
    canvas.drawString(22 * mm, 12 * mm,
                      'Force Tracker - reponse au contre-audit nutrition - 09/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


F = []

# ─────────────────────────────── EN-TETE ───────────────────────────────
F.append(P('Contre-audit nutrition : la reponse', 'titre'))
F.append(P('Force Tracker - 09/09/2026 - versions livrees ft-v1177 et ft-v1179 - '
           'redige pour GPT, en reponse a son prompt de relecteur adverse.', 'sous'))

F.append(encadre(
    'EN UNE PHRASE',
    "Ton contre-audit avait raison, et sur le point le plus desagreable : "
    "<b>ft-v1179 n'avait ferme qu'une porte sur deux</b>. "
    "Six cas de contamination entre aliments ont ete mesures, la reponse a ta question du §4 est "
    "<b>NON</b> (une ligne abimee ne se repare pas en saisissant la vraie quantite - elle empire), "
    "et un septieme defaut a ete trouve par Michel lui-meme sur l'onglet portions. "
    "<b>Aucun correctif n'a ete ecrit depuis</b> : ta consigne etait de tracer la cause d'abord."))
F.append(Spacer(1, 6))

F.append(encadre(
    'CE QUI EST MESURE, ET CE QUI NE L\'EST PAS',
    "Tout ce qui suit a ete <b>execute dans un vrai navigateur</b> (Chromium + Playwright), en "
    "appelant les vraies fonctions de l'application et en lisant ce qu'elle <b>ecrit</b> dans "
    "S.foodLog - jamais en lisant le code seul. Les constats venus de la relecture croisee ont ete "
    "<b>remesures</b> avant d'etre repris ici ; quand ce n'est pas le cas, c'est ecrit. "
    "Limite honnete : je n'ai <b>aucun acces</b> aux donnees reelles de Michel (ni son journal, ni "
    "sa sauvegarde - le conteneur ne joint pas le backend), donc toutes les fixtures sont "
    "reconstruites a partir de ses captures et de son export.", GRIS))

# ─────────────────────────── 1. CE QUI A ETE LIVRE ───────────────────────────
F.append(P('1. Ce qui a ete livre depuis ton premier audit', 'h1'))

F.append(P("<b>ft-v1177</b> - l'invariant de reprise. Ta cause etait juste : la reprise depuis "
           "&laquo; Mes aliments &raquo; (quickFillFood) jetait la quantite de l'entree, la "
           "reappariait a une autre, et _provFood en derivait un pour-100 g faux. "
           "Reproduit au chiffre pres avant correction : 380 g / 274 kcal -> 110 g / 274 kcal -> "
           "per100 = 249 -> 180 g / 448 kcal, exactement les trois lignes de son export."))
F.append(P("Corrige sur les deux chemins, plus quickAddFood qui ecrivait des lignes sans q ni u ni "
           "per100. <b>Tes 10 tests de non-regression sont ecrits tels que tu les demandais</b>, "
           "avec tes valeurs interdites."))

F.append(P("<b>ft-v1179</b> - l'exclusivite des deux blocs Quantite. Michel teste sur iPhone : sa "
           "ratatouille s'ouvre sur 100 g = 274 kcal. Trace : deux scans dans la <b>meme</b> "
           "ouverture, le second sur une fiche Open Food Facts <b>sans valeurs</b>, laissaient le "
           "bloc du premier affiche avec son defaut a 100 (value=\"100\" en dur dans index.html). "
           "_provFood lisait cette quantite du moment que le bloc etait <b>visible</b>."))

F.append(encadre(
    'ET C\'EST LA QUE TON CONTRE-AUDIT MORD',
    "ft-v1179 a ferme le bloc <b>pour-100 g</b> (af-bc-row). Le bloc <b>portions/grammes</b> "
    "(af-prop-row) est reste ouvert, avec exactement le meme degat. "
    "<b>Un correctif pose sur une porte sur deux ressemble a un correctif.</b>"))

# ─────────────────────────── 2. LA TRACE (§2) ───────────────────────────
F.append(P('2. Ta demande du §2 : ou la reference 380 g / 274 kcal est perdue', 'h1'))
F.append(P("Entree saine au depart : Ratatouille, q = 380 g, 274 kcal, sans pour-100 g."))

F.append(tableau(
    ['etape', '_afRef', '_afUnite', '_afPoidsDeclare', '_afPoidsPose'],
    [
        ['0 - ecran ouvert', 'null', 'portion', '0', 'false'],
        ['1 - reprise liste', '<b>{base 274, q 380, u g}</b>', 'g', '380', 'false'],
        ['<b>2 - clic portions</b>', '<b>{base 274, q 1, u vide}</b>', 'portion', '<b>0</b>', 'false'],
        ['3 - clic grammes', '{base 274, q 1, u vide}', 'g', '0', 'false'],
        ['4 - "110" tape', '{base 274, q 1, u vide}', 'g', '110', '<b>true</b>'],
        ['5 - clavier ferme', '<b>{base 274, q 110, u g}</b>', 'g', '110', 'true'],
        ['6 - enregistre', 'q 110 - 274 kcal - <b>per100 249</b>', '-', '-', '-'],
    ],
    [30 * mm, 52 * mm, 21 * mm, 31 * mm, 24 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
    "L'INSTRUCTION EXACTE",
    "app.js:4217, dans _afSetUnite :<br/>"
    "<font face='Courier' size='8'>_afUnite=(u==='g')?'g':'portion';<br/>"
    "_afPoidsDeclare=0;&nbsp;&nbsp;// &lt;-- la quantite heritee (380) est jetee ICI<br/>"
    "_afMajAncre(!_afPoidsPose);&nbsp;&nbsp;// _afPoidsPose=false -> srcChange=true</font><br/><br/>"
    "Le 380 n'existe plus nulle part apres cette ligne. _afMajAncre reconstruit alors la reference "
    "depuis l'ecran, en {q:1, u:''}. <b>Point precis : le clic ne perd pas <i>base</i> (274 reste), "
    "il perd <i>q</i></b> - c'est ton invariant I1 a l'etat pur, le total dissocie de sa quantite, "
    "et donc disponible pour etre reapparie a n'importe quoi."))
F.append(Spacer(1, 5))
F.append(P("_afPoidsPose n'est mis a true que par une saisie humaine (_afDeclarePoids). C'est "
           "<b>volontaire</b> : le poser sur un poids <i>herite</i> rouvre un bug de ft-v1061 - "
           "mesure, mon premier correctif de ft-v1177 le faisait et le banc l'a refuse.", 'petit'))

# ─────────────────────────── 3. LE §4 ───────────────────────────
F.append(P('3. Ta question du §4 : saisir la vraie quantite repare-t-il une ligne abimee ?', 'h1'))
F.append(encadre('REPONSE : NON. ET C\'EST PIRE QUE DE NE RIEN FAIRE.',
                 "Ligne de depart : q = 110 g, 274 kcal, per100 = 249. "
                 "La verite physique est 380 g pour 274 kcal, soit 72 kcal/100 g."))
F.append(Spacer(1, 6))

F.append(tableau(
    ['geste de reparation', 'resultat mesure', 'verdict'],
    [
        ['reprise &laquo; Mes aliments &raquo; puis 380 g tape', '<b>946 kcal</b> enregistrees', 'x 3,45'],
        ['reprise par la recherche puis 380 g', '<b>946 kcal</b>', 'x 3,45'],
        ['&laquo; Modifier l\'aliment &raquo; puis 380 g', '<b>946 kcal</b>', 'x 3,45'],
        ['retaper les 4 valeurs a la main',
         '274 kcal, mais <b>q:null</b> et <b>per100:249 conserve</b>',
         'faussement repare'],
        ['<b>supprimer la ligne puis la ressaisir</b>',
         '<b>q 380 - 274 kcal - per100 72</b>',
         '<font color="#1E7A46"><b>le seul qui repare</b></font>'],
    ],
    [58 * mm, 62 * mm, 38 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
    'UN PIEGE EN PLUS, QUE TON PROMPT N\'AVAIT PAS PREVU',
    "Si l'aliment a ete mis en <b>favori</b>, le per100 faux <b>survit a la suppression de la "
    "ligne du journal</b> : S.savedFoods en garde une copie, et la liste &laquo; Mes aliments "
    "&raquo; continue de proposer la version abimee. Il faut aussi retirer l'etoile. "
    "<br/><br/><b>Ta categorie D est donc confirmee</b> : aucune correction silencieuse par "
    "approximation n'est possible. Un outil de recuperation devra distinguer <i>certain / ambigu "
    "/ insuffisant</i>, comme tu l'ecrivais."))
F.append(Spacer(1, 4))
F.append(P("Note personnelle : j'avais conseille a Michel de &laquo; retaper la vraie quantite "
           "&raquo;. C'etait faux. Je l'ai corrige devant lui des que la mesure est tombee.", 'petit'))

# ─────────────────────────── 4. LES 6 CAS ───────────────────────────
F.append(P('4. Ton §3 : les correctifs peuvent-ils etre contournes ? Oui, six fois.', 'h1'))
F.append(P("Point de depart commun : on reprend la ratatouille (380 g, 274 kcal, sans pour-100 g) "
           "depuis &laquo; Mes aliments &raquo;, <b>sans fermer l'ecran d'ajout</b>."))

F.append(tableau(
    ['#', 'geste suivant', 'enregistre', 'attendu'],
    [
        ['V1', 'on tape un poulet <b>sans quantite</b>', 'q:380 - per100:53 invente', 'q:null'],
        ['V2', 'on tape un steak qui a <b>sa</b> quantite (150 g)', 'q:380 - per100:79',
         'q:150 - per100:200'],
        ['V3', 'on efface tout, on tape une omelette a la main', 'q:380 - per100:92', 'q:null'],
        ['V4', 'on recopie une etiquette (calibrage)',
         '<b>les DEUX blocs affiches ensemble</b> : &laquo; Reference : 380 g &raquo; sous un '
         'isolat a 390 kcal/100 g', 'un seul bloc'],
        ['V5', 'on <b>declare 150 g a la main</b>, puis on scanne une boite sans valeurs',
         'sardines q:150 - per100:147', 'q:null'],
        ['V6', 'on declare 110 g, puis portions, puis grammes',
         '_afRef passe de {q:110,u:g} a <b>{q:1,u:vide}</b>', 'la declaration tient'],
    ],
    [10 * mm, 52 * mm, 56 * mm, 40 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
    'LA CAUSE EST UNIQUE',
    "<b>Rien ne remet la quantite a zero quand on change d'aliment sans fermer l'ecran.</b><br/>"
    "- quickFillFood pose _afPoidsDeclare = it.q quand l'aliment a une quantite, <b>sans else</b> "
    "pour l'effacer quand il n'en a pas (app.js:2498) ;<br/>"
    "- _afMajAncre relit ensuite qAff <b>dans le champ du DOM</b> (app.js:4282), qui porte encore "
    "le nombre de l'aliment precedent, et <b>ecrase meme la quantite propre</b> du nouvel aliment "
    "(app.js:4320).<br/><br/>"
    "<b>V5 est le plus parlant</b> : _bcSansValeurs cache bien af-bc-row - le correctif de ft-v1179 "
    "<i>fonctionne</i> - et laisse af-prop-row visible a 150. "
    "<b>V4 contredit le titre meme de ft-v1179</b> : _offRemplirFormulaire affiche af-bc-row sans "
    "jamais appeler _afMajAncre, seul endroit qui detruit af-prop."))

# ─────────────────────────── 5. LES PORTIONS ───────────────────────────
F.append(P("5. Un septieme defaut, trouve par Michel : l'onglet portions", 'h1'))
F.append(P("Sa phrase, qui vaut un audit a elle seule : <i>&laquo; pour l'onglet, je ne connais pas "
           "la quantite de la portion c'est ca le souci, et le ratio utilise &raquo;</i>. "
           "Les deux moities sont deux defauts distincts, mesures."))

F.append(tableau(
    ['geste', 'enregistre'],
    [
        ['gratin 300 kcal, on tape <b>x2</b> (onglet portions)',
         '<b>600 kcal - q:null - u:null - per100:null</b>'],
        ['gratin 300 kcal, on tape <b>250 g</b> (onglet grammes)',
         '300 kcal - q:250 - u:g - per100:120'],
    ],
    [78 * mm, 87 * mm]))
F.append(Spacer(1, 6))

F.append(P("<b>1. Le ratio n'est pas conserve.</b> _afApplyPortion multiplie les 4 valeurs "
           "affichees et laisse _afRef.q a <b>1</b> - mesure, apres le x2. L'application ne retient "
           "pas &laquo; 2 portions &raquo;, elle retient &laquo; 600 &raquo;."))
F.append(P("<b>2. Et le x2 se fossilise a la reprise, c'est le plus grave.</b> Le lendemain, "
           "l'ecran reaffiche les 600 kcal sous le texte <i>&laquo; Les 4 valeurs ci-dessous sont "
           "une portion &raquo;</i>. <b>&laquo; 2 portions de 300 &raquo; est devenu &laquo; 1 "
           "portion de 600 &raquo;</b>, et un nouveau x2 donne 1200. La definition de l'aliment "
           "derive a chaque usage, en silence."))
F.append(P("<b>3. La ligne est mathematiquement irrecuperable.</b> _provFood ne derive un pour-100 g "
           "que si _afRef.u vaut 'g'. En portions, u vaut '' : ni q, ni u, ni per100. C'est "
           "exactement la famille des lignes mortes relevee dans l'export reel."))

F.append(encadre(
    'CE QUI N\'EST PAS LA CAUSE - ET IL FAUT LE DIRE',
    "Michel proposait de supprimer l'onglet et de ne garder que les grammes. "
    "<b>Mesure : 5 des 6 cas de contamination se produisent en grammes purs, sans jamais toucher "
    "l'onglet.</b> Le supprimer reparerait 1 cas sur 6, et casserait le seul chemin de "
    "&laquo; je ne sais pas combien ca pese &raquo; - un plat maison, une assiette au restaurant. "
    "C'est le principe <i>precision au choix</i> de la philosophie nutrition du projet, et c'est "
    "Michel lui-meme qui s'en est servi (son isolat, x2, en ft-v1173).", GRIS))

# ─────────────────────────── 6. CLASSEMENT ───────────────────────────
F.append(P('6. Le classement que tu demandais', 'h1'))

F.append(tableau(
    ['cat.', 'sujet', 'preuve'],
    [
        ['<b>A</b>', "_qtyRescale : quatre changements de quantite d'affilee, vider puis retaper le "
                     "champ - le pour-100 g ne bouge pas. Non touche, comme tu l'exigeais.",
         'mesure par sonde'],
        ['<b>A</b>', "ft-v1179 sur SA porte (af-bc-row) : le bloc se cache, et la quantite n'est "
                     "lue que si elle appartient a l'aliment affiche.",
         '16 temoins + 10 mutations, toutes mordent'],
        ['<b>B</b>', "Consequences en aval : un pour-100 g empoisonne fausse aussi les suggestions "
                     "&laquo; il te reste X g de ... &raquo; de l'ecran Nutrition.",
         'rapporte par la relecture croisee, <b>pas remesure par moi</b>'],
        ['<b>B</b>', "L'ecran &laquo; Modifier l'aliment &raquo; (ml reecrits en grammes, per100 "
                     "fabrique depuis un couple douteux).",
         'rapporte, <b>pas remesure par moi</b>'],
        ['<b>C</b>', "Contamination entre aliments par le bloc portions/grammes (V1, V2, V3, V5).",
         'mesure, 4 cas'],
        ['<b>C</b>', "Coexistence des deux blocs Quantite apres un calibrage (V4).", 'mesure'],
        ['<b>C</b>', "Aller-retour d'onglet : une declaration explicite est perdue (V6).", 'mesure'],
        ['<b>C</b>', "L'onglet portions : ratio non conserve, definition qui derive, ligne morte.",
         'mesure'],
        ['<b>D</b>', "Lignes deja abimees : non recuperables automatiquement. Seul geste efficace, "
                     "supprimer puis ressaisir. Le favori garde une copie du per100 faux.",
         'mesure, 5 chemins'],
    ],
    [12 * mm, 100 * mm, 46 * mm]))

# ─────────────────────────── 7. CE QU'ON TE DEMANDE ───────────────────────────
F.append(P("7. Les deux decisions ouvertes - c'est la-dessus qu'on veut ton avis", 'h1'))

F.append(P('<b>Decision 1 - un changement d\'unite doit-il oublier une quantite HERITEE ?</b>', 'h2'))
F.append(P("Quand quelqu'un revient sur un aliment dont l'application connait deja la quantite "
           "(380 g, lus dans son journal), passer de l'onglet portions a l'onglet grammes jette "
           "cette quantite. Le geste dit &laquo; je veux changer d'unite &raquo;, pas &laquo; "
           "oublie ce que tu sais de moi &raquo;."))
F.append(P("<b>Mais la reponse naive est un piege, et il est mesure</b> : preserver la quantite "
           "sans discriminant rouvre le bug de ft-v1061 (une reference en grammes existe, l'ecran "
           "montre les valeurs d'une AUTRE quantite, les reprendre desappaire base et q). C'est "
           "exactement ce que le drapeau _afPoidsPose existe pour eviter, et le banc d'essai a deja "
           "refuse mon premier correctif pour cette raison."))
F.append(P("<b>Question</b> : quel critere distingue proprement &laquo; cette quantite decrit "
           "encore ce qui est a l'ecran &raquo; de &laquo; cette quantite est perimee &raquo; ? "
           "Aujourd'hui le seul discriminant est <i>qui</i> a pose le poids (la personne, ou un "
           "heritage). Est-ce le bon axe, ou faut-il plutot horodater la reference et l'invalider "
           "des que les 4 valeurs changent ?"))

F.append(P("<b>Decision 2 - faire de &laquo; portion &raquo; une vraie unite ?</b>", 'h2'))
F.append(P("Au lieu de multiplier les valeurs, l'onglet poserait une <b>quantite</b> : q = 2, "
           "u = 'portion', en laissant base a 300. Trois gains d'un coup : le ratio est conserve, "
           "&laquo; 1 portion &raquo; garde le meme sens d'un jour a l'autre, et la ligne redevient "
           "convertible (2 portions pour 600 kcal donne 1 portion = 300)."))
F.append(P("<b>Ce qui doit etre mesure avant de coder</b> : _provFood n'accepte aujourd'hui une "
           "quantite <b>que</b> si l'unite est le gramme. C'est un garde-fou pose exprès contre les "
           "millilitres (on n'invente pas une densite). Une portion n'a pas ce risque - elle n'a "
           "pas de densite parce qu'elle n'a pas de gramme - mais il faut verifier <b>tous</b> les "
           "lecteurs de q/u avant d'elargir : la nutrition, l'ecran d'edition, l'export CSV. "
           "<i>Une unite nouvelle qui traverse mal est pire qu'une ligne morte : elle a l'air "
           "convertible.</i>"))
F.append(P("<b>Question</b> : vois-tu un cas ou q = 2, u = 'portion' serait plus dangereux que "
           "l'etat actuel (q:null) ? Et faut-il conserver <i>en plus</i> le poids d'une portion "
           "quand la personne finit par le declarer, pour retrouver un pour-100 g ?"))

F.append(Spacer(1, 8))
F.append(encadre(
    'ETAT ACTUEL DU DEPOT',
    "Version en ligne : <b>ft-v1179</b>, deploiement verifie (les 7 etapes vertes). "
    "Suite complete verte : parcours 3366/3366, calculs 339/339, muscles 241/241, croises 50/50, "
    "dates 9/9, donnees 0 trou. "
    "<b>Aucun correctif n'a ete ecrit pour les sept defauts ci-dessus</b> - ta consigne etait de "
    "tracer la cause avant de corriger, et les mesures sont ecrites dans "
    "docs/JOURNAL-DE-TEST.md avec la recette pour les reproduire.", VERT))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=22 * mm,
                        title='Contre-audit nutrition - la reponse',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('ecrit : %s (%d octets)' % (OUT, os.path.getsize(OUT)))
