# -*- coding: utf-8 -*-
"""
Dossier du bug de reprise nutrition (ft-v1177) — pour Michel ET pour le relecteur externe.

⚠️ CE FICHIER EST UN GÉNÉRATEUR, PAS UN DOCUMENT. Il est versionné pour que le PDF puisse être
   refait après chaque correction (R27) : un dossier recopié à la main est faux dès la version
   suivante, et un relecteur qui travaille sur du périmé conclut sur un fantôme.

⛔ AUCUN EMOJI dans le PDF : les polices intégrées de reportlab n'en ont pas les glyphes et les
   rendraient en carrés noirs. On emploie des marqueurs texte ([!], [X], [OK]).
⛔ AUCUNE FLÈCHE Unicode non plus (« -> » en ASCII) : hors WinAnsi, même problème.

Usage : python3 tools/gen_bug_reprise_pdf.py
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

OUT = '/home/user/forcetracker/docs/BUG-REPRISE-NUTRITION.pdf'

ROUGE = colors.HexColor('#c0392b')
BLEU  = colors.HexColor('#1f4e79')
VERT  = colors.HexColor('#1e7d44')
GRIS  = colors.HexColor('#555555')
FOND  = colors.HexColor('#f2f4f7')
FONDR = colors.HexColor('#fdf0ee')
FONDV = colors.HexColor('#eef7f1')

ss = getSampleStyleSheet()


def S(n, **k):
    base = k.pop('parent', ss['Normal'])
    return ParagraphStyle(n, parent=base, **k)


TITRE  = S('t', parent=ss['Title'], fontSize=19, leading=23, textColor=BLEU, spaceAfter=3)
STITRE = S('st', fontSize=10.5, leading=13.5, textColor=GRIS, alignment=TA_CENTER, spaceAfter=13)
H1  = S('h1', fontSize=14, leading=17, textColor=BLEU, spaceBefore=14, spaceAfter=5, fontName='Helvetica-Bold')
H2  = S('h2', fontSize=11, leading=13.5, spaceBefore=9, spaceAfter=3, fontName='Helvetica-Bold')
P   = S('p', fontSize=9.8, leading=13.6, alignment=TA_JUSTIFY, spaceAfter=6)
PB  = S('pb', parent=P, spaceAfter=3)
PETIT = S('pt', fontSize=8.3, leading=11, textColor=GRIS, spaceAfter=5)
CELL  = S('cl', fontSize=8.4, leading=10.8)
CELLB = S('cb', parent=CELL, fontName='Helvetica-Bold')
CODE  = S('co', fontSize=8.1, leading=10.8, fontName='Courier', leftIndent=6, spaceAfter=4)
ENC   = S('en', fontSize=9.6, leading=13.4, leftIndent=8, rightIndent=8, spaceBefore=3, spaceAfter=3,
          alignment=TA_JUSTIFY)
ENCB  = S('enb', parent=ENC, fontName='Helvetica-Bold')


def tab(rows, widths, entete=True, aligne=None):
    data = [[Paragraph(str(c), CELLB if (entete and i == 0) else CELL) for c in r]
            for i, r in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1 if entete else 0)
    st = [('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#c8ccd2')),
          ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
          ('TOPPADDING', (0, 0), (-1, -1), 3.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5)]
    if entete:
        st.append(('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dde3ea')))
    for r in range(1 if entete else 0, len(data)):
        if r % 2 == (1 if entete else 0):
            st.append(('BACKGROUND', (0, r), (-1, r), colors.HexColor('#fafbfc')))
    if aligne:
        for c in aligne:
            st.append(('ALIGN', (c, 0), (c, -1), 'CENTER'))
    t.setStyle(TableStyle(st))
    return t


def enc(paras, fond=FOND, bord=BLEU, larg=165 * mm):
    t = Table([[p] for p in paras], colWidths=[larg])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), fond),
                           ('BOX', (0, 0), (-1, -1), 0.9, bord),
                           ('LEFTPADDING', (0, 0), (-1, -1), 9), ('RIGHTPADDING', (0, 0), (-1, -1), 9),
                           ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 7)]))
    return t


def pied(cv, doc):
    cv.saveState()
    cv.setFont('Helvetica', 7.5)
    cv.setFillColor(GRIS)
    cv.drawString(20 * mm, 12 * mm, "Force Tracker - Bug de reprise nutrition - ft-v1177 - 8 septembre 2026")
    cv.drawRightString(190 * mm, 12 * mm, "page %d" % doc.page)
    cv.setStrokeColor(colors.HexColor('#c8ccd2'))
    cv.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
    cv.restoreState()


doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title="Force Tracker - Bug de reprise nutrition",
                        author="Michel / Claude Code")
h = []
A = h.append

# ══════════════════════════════════════════════════════════════════════════
# PAGE 1 — POUR MICHEL, EN FRANCAIS NORMAL
# ══════════════════════════════════════════════════════════════════════════
A(Paragraph("Le bug des calories, expliqué simplement", TITRE))
A(Paragraph("Force Tracker &mdash; corrigé en ft-v1177, le 8 septembre 2026", STITRE))

A(Paragraph("1. Ce qui se passait", H1))
A(Paragraph(
    "Quand tu reprenais un aliment depuis <b>&laquo; Mes aliments &raquo;</b> (Nutrition &gt; Journal &gt; "
    "&laquo; À la main &raquo;), l'application <b>gardait les calories</b> de la fois d'avant mais "
    "<b>oubliait la quantité</b> a laquelle elles correspondaient.", P))
A(Paragraph(
    "Ta ratatouille était notée <b>380 g = 274 kcal</b>. Tu la reprends, tu mets <b>110 g</b> : "
    "l'application affichait encore <b>274 kcal</b>. Elle venait de décider, toute seule, que "
    "<i>274 kcal pèsent 110 g</i>.", P))
A(Spacer(1, 3))
A(enc([Paragraph(
    "<b>Et c'est là que ça devient grave :</b> elle a <b>enregistré cette conclusion</b>. Elle en a "
    "déduit que ta ratatouille fait <b>249 kcal pour 100 g</b>, au lieu de 72. À partir de là, tout "
    "ce qu'elle calculait était faux &mdash; mais <i>cohérent</i>, donc invisible.", ENC)],
    fond=FONDR, bord=ROUGE))
A(Spacer(1, 5))
A(Paragraph(
    "C'est pour ça que tu voyais des chiffres délirants sans comprendre d’où ils venaient : "
    "l'erreur ne se voyait pas au moment où elle se produisait, elle se voyait <b>les jours "
    "suivants</b>.", P))

A(Paragraph("2. Pourquoi ça ne le faisait pas à chaque fois", H1))
A(Paragraph(
    "Il y a <b>trois façons</b> de reprendre un aliment dans l'app, et elles ne passaient pas par "
    "le même code. <b>Une seule des trois était cassée</b> &mdash; celle que tu utilises le plus.", P))
A(tab([
    ["Comment tu reprends l'aliment", "État avant ft-v1177"],
    ["Tu tapes son <b>nom</b> dans &laquo; Ce que tu as mangé &raquo;", "<font color='#1e7d44'><b>[OK] correct</b></font> &mdash; 110 g donnait bien 79 kcal"],
    ["Tu tapes son <b>nom dans la liste</b> &laquo; Mes aliments &raquo;", "<font color='#c0392b'><b>[X] cassé</b></font> &mdash; 110 g donnait 274 kcal"],
    ["Tu appuies sur <b>&laquo; + Ajouter &raquo;</b> dans cette liste", "<font color='#c0392b'><b>[X] cassé</b></font> &mdash; enregistrait sans aucune quantité"],
], [78 * mm, 87 * mm]))
A(Spacer(1, 4))
A(Paragraph(
    "<b>Le correctif était déjà écrit dans l'application</b>, sur le premier chemin. Il manquait "
    "simplement sur les deux autres. Deux lignes de code.", P))

A(Paragraph("3. Ce qui est réparé, et ce qui ne l'est pas", H1))
A(tab([
    ["", "État"],
    ["Les 3 chemins de reprise gardent la quantité", "<font color='#1e7d44'><b>[OK] fait</b></font> &mdash; en ligne depuis ft-v1177"],
    ["Reprendre un aliment ouvre le champ sur ta <b>dernière quantité</b>", "<font color='#1e7d44'><b>[OK] fait</b></font>"],
    ["Les <b>lignes déjà fausses</b> de ton journal", "<font color='#c0392b'><b>[X] pas touchées</b></font> &mdash; voir ci-dessous"],
    ["Les <b>deux blocs Quantité</b> affichés en même temps", "<font color='#c0392b'><b>[X] version suivante</b></font>"],
], [95 * mm, 70 * mm]))
A(Spacer(1, 5))
A(enc([Paragraph(
    "<b>Pourquoi on ne répare pas ton historique tout de suite.</b> Certaines lignes ont ete "
    "enregistrées <b>sans aucune quantité</b>. Devant &laquo; 323 kcal &raquo;, rien ne permet de "
    "savoir si c'était 100 g ou 300 g de steak. Deviner produirait des chiffres faux qui auraient "
    "l'air justes &mdash; exactement le problème qu'on vient de corriger.", ENC),
    Paragraph(
    "L'outil de récupération viendra après, avec <b>trois niveaux honnêtes</b> : ce qui est certain "
    "(recalculé tout seul), ce qui est ambigu (on te demande), et ce qui est perdu (on le dit).", ENC)],
    fond=FOND, bord=BLEU))

A(Paragraph("4. Ce que tu peux vérifier toi-même", H1))
A(Paragraph(
    "Ferme et rouvre l'application. Puis : <b>Nutrition &gt; Journal &gt; &laquo; À la main &raquo;</b>, "
    "reprends ta ratatouille dans &laquo; Mes aliments &raquo;, mets <b>110</b>.", PB))
A(Paragraph(
    "Tu dois voir <b>79 kcal</b>. Et le champ doit s'ouvrir sur <b>380</b> (ta dernière quantité) au "
    "lieu d'être vide.", P))

A(PageBreak())

# ══════════════════════════════════════════════════════════════════════════
# PAGE 2+ — POUR LE RELECTEUR EXTERNE
# ══════════════════════════════════════════════════════════════════════════
A(Paragraph("Dossier technique &mdash; pour le relecteur externe", TITRE))
A(Paragraph("Réponse a l'audit du 8 septembre 2026 &mdash; ce qui a ete reproduit, corrigé, et laissé ouvert", STITRE))

A(Paragraph("1. Ce que l'audit avait raison de dire", H1))
A(Paragraph(
    "<b>Sa conclusion principale est adoptée telle quelle.</b> J'avais écrit &laquo; le reste du code "
    "est juste &raquo; ; son &sect;7 refuse la formule, a raison. L'existence de <font face='Courier'>per100</font>, "
    "de <font face='Courier'>q</font>/<font face='Courier'>u</font> et d'un "
    "<font face='Courier'>_qtyRescale</font> déterministe ne prouve rien sur la transmission.", P))
A(enc([Paragraph(
    "<b>La formulation retenue est la sienne :</b> <i>le modèle de données existe et est exploitable, "
    "mais ses invariants n’étaient pas protégés sur tous les chemins de reprise.</i>", ENCB)],
    fond=FONDV, bord=VERT))
A(Spacer(1, 4))
A(Paragraph(
    "Son cas témoin (ratatouille) était le bon, sa cause racine était la bonne, et sa consigne de ne "
    "pas toucher a <font face='Courier'>_qtyRescale</font> était juste : il calcule correctement a "
    "partir d'une référence déjà corrompue en amont.", P))

A(Paragraph("2. Reproduction &mdash; mesurée avant toute correction", H1))
A(Paragraph(
    "Rejoué dans un vrai navigateur (Chromium + Playwright), par les fonctions de production, avec "
    "l'entrée exacte de son export. <b>Les trois états correspondent au chiffre pres.</b>", P))
A(tab([
    ["Etape", "Son export réel", "Ma reproduction"],
    ["31/08 &mdash; entrée de départ", "380 g = 274 kcal / 4 P / 23 G / 15 L", "(fixture identique)"],
    ["01/09 &mdash; reprise, on demande 110 g", "<b>274</b> kcal / 4 / 23 / 15", "<font color='#c0392b'><b>274 / 4 / 23 / 15</b></font>"],
    ["référence dérivée et enregistrée", "~<b>249</b> kcal / 100 g", "<font color='#c0392b'><b>249</b></font>"],
    ["02/09 &mdash; reprise suivante a 180 g", "<b>448</b> / 7 / 38 / 25", "<font color='#c0392b'><b>448 / 7 / 38 / 25</b></font>"],
], [52 * mm, 58 * mm, 55 * mm]))

A(Paragraph("3. La cause racine, et le discriminant", H1))
A(Paragraph(
    "Deux chemins de reprise, <b>la même entrée</b> sans <font face='Courier'>per100</font> "
    "(380 g = 274 kcal) :", PB))
A(tab([
    ["Fonction", "Référence construite", "110 g rendait"],
    ["<font face='Courier'>_afSuggPrendreLocale</font> (recherche par nom)",
     "<font face='Courier'>{base:274, <b>q:380</b>, u:'g'}</font>", "<font color='#1e7d44'><b>79 kcal</b></font>"],
    ["<font face='Courier'>quickFillFood</font> (&laquo; Mes aliments &raquo;)",
     "<font face='Courier'>{base:274, <b>q:1</b>, u:''}</font>", "<font color='#c0392b'><b>274 kcal</b></font>"],
], [64 * mm, 62 * mm, 39 * mm]))
A(Spacer(1, 4))
A(enc([Paragraph(
    "<b>Les deux lignes qui préservent le couple existaient déjà</b>, dans la fonction voisine. Elles "
    "étaient posées sur <b>une seule des deux portes</b>. C'est la sixième occurrence documentée de ce "
    "motif dans ce fichier (règle interne R8, &laquo; la jumelle &raquo;).", ENC)], fond=FOND, bord=BLEU))
A(Spacer(1, 5))
A(Paragraph("La chaîne complète, une fois la quantité perdue :", H2))
A(Paragraph(
    "1. Sans <font face='Courier'>per100</font>, <font face='Courier'>it.q</font> est la <b>seule</b> "
    "chose qui relie 274 kcal au monde réel &mdash; la branche <font face='Courier'>else</font> la jétait.<br/>"
    "2. <font face='Courier'>_afMajAncre</font> traitait alors l'ecran comme &laquo; une portion &raquo; "
    "(<font face='Courier'>q:1</font>). Déclarer 110 g revenait a affirmer que ces 274 kcal pèsent 110 g.<br/>"
    "3. <font face='Courier'>_provFood</font> <b>fabrique</b> ensuite un pour-100 g depuis cet appariement "
    "(274 / 110 x 100 = 249) et l'<b>enregistre avec l'aliment</b>.", P))
A(Paragraph(
    "<b>Le point 3 n'est pas un bug</b> : c'est le calibrage par le poids, correct pour un aliment neuf. "
    "Il ne fait que propager une erreur née en amont. C'est la moitié que l'audit n'avait pas identifiée, "
    "et c'est elle qui rend le dégât permanent.", P))

A(Paragraph("4. Ce qui a ete corrigé (ft-v1177)", H1))
A(tab([
    ["#", "Fonction", "Correction"],
    ["1", "<font face='Courier'>quickFillFood</font>",
     "Ancre la référence sur <font face='Courier'>it.q</font> quand il n'y a pas de "
     "<font face='Courier'>per100</font> &mdash; les deux lignes de la fonction voisine, portées ici. "
     "Uniquement en grammes (une quantité en <font face='Courier'>ml</font> n'ancre rien : pas de densite inventée)."],
    ["2", "<font face='Courier'>quickAddFood</font>",
     "Transmet <font face='Courier'>q</font>, <font face='Courier'>u</font>, "
     "<font face='Courier'>per100</font>, <font face='Courier'>sourceId</font>, "
     "<font face='Courier'>état</font> au lieu des seuls totaux. Plus de ligne non convertible."],
    ["3", "<font face='Courier'>_provFood</font>",
     "<font face='Courier'>q</font>/<font face='Courier'>u</font> traversent enfin la liste blanche. "
     "<b>Troisième fois</b> que ce même oubli se produit dans cette fonction, qui porte déjà deux "
     "avertissements en majuscules le disant."],
], [8 * mm, 42 * mm, 115 * mm]))
A(Spacer(1, 4))
A(Paragraph("Non touchés, a la demande explicite de l'audit :", H2))
A(Paragraph(
    "&bull; <font face='Courier'>_qtyRescale</font> &mdash; il calcule juste depuis une référence "
    "corrompue en amont ; le modifier compenserait au lieu de corriger.<br/>"
    "&bull; <font face='Courier'>_afSuggPrendreLocale</font> &mdash; son &sect;8-3 demandait de la "
    "vérifier : <b>elle était déjà correcte</b>. Mesuré, puis laissé intact.", P))

A(Paragraph("5. Ses dix tests de non-régression", H1))
A(Paragraph(
    "Ecrits tels qu'il les a demandés, avec ses valeurs interdites. <b>16 témoins, tous verts</b>, "
    "intégrés au banc d'essai permanent (bloc CCLXXV).", P))
A(tab([
    ["Test", "Attendu", "Interdit", "Obtenu"],
    ["1 &mdash; ratatouille, 110 g", "~79 kcal", "274", "<font color='#1e7d44'><b>79</b></font>"],
    ["2 &mdash; propagation, 180 g", "~130 kcal", "448", "<font color='#1e7d44'><b>130</b></font>"],
    ["3 &mdash; per100 immuable", "72 / 100 g", "dérive", "<font color='#1e7d44'><b>72</b></font> sur 100/380/110/180 g"],
    ["4 &mdash; sans per100", "274 x 110/380", "274 x 110/110", "<font color='#1e7d44'><b>79</b></font>"],
    ["5 &mdash; quickAddFood", "q, u, per100 gardés", "null", "<font color='#1e7d44'><b>380 g, 72</b></font>"],
    ["6 &mdash; steak U, 250 -&gt; 300 g", "~388 kcal", "~194", "<font color='#1e7d44'><b>388</b></font>"],
    ["7 &mdash; Iso Zero 20/40/50 g", "proportionnel", "35 P partout", "<font color='#1e7d44'><b>78/156/195</b></font>"],
    ["9 &mdash; modif d'une entrée", "per100 et source intacts", "reécriture", "<font color='#1e7d44'><b>intacts</b></font>"],
    ["10 &mdash; 10 cycles", "aucune dérive", "dérive cumulative", "<font color='#1e7d44'><b>144 kcal x 10</b></font>"],
], [40 * mm, 38 * mm, 32 * mm, 55 * mm]))
A(Spacer(1, 3))
A(Paragraph(
    "Le test 8 (exclusivité des deux blocs Quantité) part avec la version suivante : l'audit dit "
    "lui-même que c'est un bug distinct.", PETIT))

A(Paragraph("6. Contrôle négatif &mdash; ce qui a failli passer", H1))
A(Paragraph(
    "Six mutations, chacune cassant un point précis. <b>Toutes font rougir un témoin</b>, ce qui prouve "
    "que les témoins mesurent quelque chose.", P))
A(tab([
    ["Mutation", "Témoins rouges"],
    ["L'arbre d'avant la correction", "13"],
    ["<font face='Courier'>quickFillFood</font> rejette à nouveau <font face='Courier'>it.q</font>", "11 &mdash; le défaut d'origine"],
    ["<font face='Courier'>quickAddFood</font> ne transmet plus rien", "2"],
    ["La liste blanche de <font face='Courier'>_provFood</font>", "2 (les mêmes &mdash; deux faces d'une garantie)"],
    ["<b>Mon premier correctif, remis</b>", "<b>1 &mdash; exactement le témoin de l'aller-retour</b>"],
    ["L'ancrage accepterait les <font face='Courier'>ml</font>", "1"],
], [98 * mm, 67 * mm]))
A(Spacer(1, 5))
A(enc([Paragraph(
    "<b>La mutation la plus utile est la cinquième, parce qu'elle rejoue mon erreur.</b>", ENCB),
    Paragraph(
    "Mon premier correctif marquait le poids repris comme &laquo; déclaré par la personne &raquo;. Le "
    "mini-banc était a 14/14. <b>Mesure sur un aller-retour d'unite : déclarer 110 g redonnait 274 kcal</b> "
    "&mdash; le défaut même que la version corrige.", ENC),
    Paragraph(
    "Le drapeau signifie <i>&laquo; la personne a déclaré un poids pour ce qui est AFFICHÉ &raquo;</i>. "
    "Un poids <b>hérité</b> d'une entrée enregistrée n'est pas cela : des qu'elle change la quantité, la "
    "référence ne correspond plus à ce qu'elle voit. <b>La difference n'est pas le geste, c'est QUI a pose "
    "le poids.</b>", ENC)], fond=FONDR, bord=ROUGE))

A(Paragraph("7. Ce qui reste ouvert &mdash; et ou son avis est utile", H1))
A(Paragraph(
    "L'historique n'est <b>pas</b> réparé, conformément à son &sect;11. Trois questions restent, et ce "
    "sont des <b>décisions produit</b>, pas des questions techniques :", P))
A(tab([
    ["Question", "Ce qui est déjà tranché"],
    ["<b>1.</b> Quelles règles définissent un &laquo; MATCH CERTAIN &raquo; recalculable "
     "automatiquement ? Suffit-il qu'une autre ligne du même aliment porte un "
     "<font face='Courier'>per100</font> crédible ?",
     "Rien. Aucune approximation silencieuse ne sera faite."],
    ["<b>2.</b> Faut-il <b>marquer visiblement</b> dans le journal les lignes non convertibles, ou "
     "les laisser telles quelles ?",
     "Le principe interne dit : informer sans décider, et ne jamais faire passer une supposition "
     "pour un fait."],
    ["<b>3.</b> Comment présenter l'invariant C (&laquo; donnée insuffisante &raquo;) sans transformer "
     "le journal en liste d'erreurs anxiogène ?",
     "Contrainte interne : la nutrition ne doit jamais devenir une source de stress supérieure au "
     "bénéfice qu'elle apporte."],
], [82 * mm, 83 * mm]))

A(Paragraph("8. Vérifiable", H1))
A(Paragraph(
    "Le code réel des fonctions citées est dans le dossier d'audit déjà transmis "
    "(<font face='Courier'>04_CODE_SOURCE.md</font>, extrait verbatim et régénérable par "
    "<font face='Courier'>python3 tools/audit-nutrition.py</font>). Ce PDF est lui aussi généré : "
    "<font face='Courier'>python3 tools/gen_bug_reprise_pdf.py</font>.", P))
A(Paragraph(
    "Suite de tests complète au moment de la livraison : parcours 3339/3339, calculs 339/339, "
    "muscles 241/241, croisés 50/50, dates 9/9, données classées 0 trou. Déploiement vérifié "
    "(run #1027, 7 étapes en success).", PETIT))

doc.build(h, onFirstPage=pied, onLaterPages=pied)
print('PDF écrit : ' + OUT)
