#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère docs/P1-PORTION-NOMMEE.pdf — le débrief de ft-v1186, rédigé pour GPT.

Même squelette que gen_contre_audit_pdf.py / gen_p1_debrief_pdf.py / gen_p1_conception_pdf.py
(R13 : on enrichit l'existant plutôt que de refabriquer une mise en page).

⭐⭐ LE CHIFFRE DE LA PASSE EST **LU DANS LE LOG**, jamais écrit à la main : un document qui
   affirme « 3481 verts » sans que personne ne l'ait vérifié est exactement le genre de phrase
   qui fait dire une bêtise six mois plus tard (R23). Si le log manque ou si la passe n'est pas
   finie, le document le DIT au lieu d'inventer un total.

⚠️ CONTRAINTE DE POLICE : polices intégrées en WinAnsi/cp1252. Les accents français passent
   (vérifié, pas supposé) ; les emoji et les flèches unicode sortent en carrés noirs -> « -> ».
"""
import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'P1-PORTION-NOMMEE.pdf')
LOG = os.environ.get('FT_PASSE_LOG', '')


def lire_passe():
    """Rend (texte, ok) depuis le log de la passe. Ne devine JAMAIS un total."""
    if not LOG or not os.path.exists(LOG):
        return ("<b>passe complète non jointe à ce document</b> — le total n'est pas reproduit "
                "ici plutôt que d'être supposé", False)
    txt = open(LOG, encoding='utf-8', errors='replace').read()
    v = len(re.findall(r'^  ✅', txt, re.M))
    r = len(re.findall(r'^  ❌', txt, re.M))
    fin = re.search(r'TOTAL CROISÉ\s*:\s*([\d\s]+)✅\s*·\s*(\d+)\s*❌', txt)
    if not fin:
        return ("<b>passe complète encore en cours</b> à la rédaction de ce document "
                "(%d témoins verts, %d rouge(s) à cet instant) — le total final n'est pas "
                "reproduit ici" % (v, r), False)
    return ("<b>%s verts, %s rouge(s)</b>" % (fin.group(1).strip(), fin.group(2)), fin.group(2) == '0')


PASSE, PASSE_OK = lire_passe()

ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')
VERT = colors.HexColor('#1E7A46')
ORANGE = colors.HexColor('#B26A00')

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
                      'Force Tracker — P1, la portion nommée — ft-v1186 — 09/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


C = "<font face='Courier'>%s</font>"
F = []

# ─────────────────────────────── EN-TETE ───────────────────────────────
F.append(P("P1 — la portion nommée", 'titre'))
F.append(P("Force Tracker — 09/09/2026 — version <b>ft-v1186</b>. Suite de ft-v1183, après la "
           "relecture de Michel et la réponse de conception. Rédigé pour GPT, qui a écrit la "
           "spécification P1 d'origine.", 'sous'))

F.append(encadre(
    'EN UNE PHRASE',
    "Les six décisions de Michel sont livrées : l'étiquette et le poids d'une portion sont "
    "stockés, la masse totale reste dérivée, la référence reste dérivée, le pour-100 g est "
    "recalculé, et le favori rafraîchit sa définition sans toucher ses macros. "
    "<b>Ce qui mérite ton attention n'est pas le correctif</b> : c'est la forme de l'erreur qui "
    "m'avait fait refuser " + C % 'portionWeightG' + " — et un rouge trouvé par la mesure "
    "<b>avant</b> livraison, où la donnée était juste et <b>l'écran mentait</b>."))
F.append(Spacer(1, 6))

F.append(encadre(
    "CE QUI EST MESURÉ, ET CE QUI NE L'EST PAS",
    "Tout ce qui est chiffré ici a été <b>exécuté dans un vrai navigateur</b> (Chromium + "
    "Playwright), en appelant les vraies fonctions et en lisant ce que l'application <b>écrit</b> "
    "dans son journal. "
    "Limites inchangées : aucun accès aux données réelles de Michel, et <b>pas de WebKit</b> ici — "
    "le rendu iPhone reste à valider par lui.", GRIS))

# ─────────────────── 1. L'ERREUR ───────────────────
F.append(P("1. La forme de l'erreur, parce qu'elle se reproduira", 'h1'))

F.append(P(
    "J'avais refusé " + C % 'portionWeightG' + " en écrivant <i>« cet état n'existe pas »</i>, "
    "mesure à l'appui : déclarer un poids fait basculer l'application en grammes, donc l'état "
    "« portion dont on connaît le poids » n'existe pas, donc le champ ne se remplirait jamais. "
    "<b>Chaque maillon est vrai. La conclusion est fausse.</b>"))

F.append(encadre(
    "LA RÈGLE QUI EN SORT",
    "<b>Une mesure du comportement actuel ne peut jamais justifier un refus de BESOIN.</b> Elle "
    "décrit ce qui est, pas ce qui manque. Le seul refus qu'elle autorise est <i>« ce champ est "
    "aujourd'hui inutile »</i> — jamais <i>« il ne servira jamais »</i>. "
    "⚠️ Ce n'est <b>pas</b> le cas classique d'une limite affirmée sans être vérifiée : ici la "
    "limite <b>était</b> vérifiée. C'est la <b>question posée</b> qui était mauvaise, et c'est "
    "beaucoup plus difficile à voir.", ORANGE))
F.append(Spacer(1, 5))

F.append(P(
    "Le cas de Michel tranche en une ligne : <i>« 1 steak = 125 g, 2 steaks = 250 g — je ne veux "
    "pas que ça devienne " + C % "q:250, u:'g'" + ", car on perd l'information 2 steaks »</i>. "
    "<b>Basculer en grammes est une perte, pas une simplification.</b>"))

# ─────────────────── 2. CE QUI EST LIVRE ───────────────────
F.append(P("2. Les six décisions, et ce qui est livré", 'h1'))

F.append(tableau(
    ['Décision de Michel', 'Livré'],
    [["① " + C % 'portionLabel' + " stocké",
      "Nom court au singulier, <b>jamais deviné</b>. Huit puces (steak · part · tranche · yaourt · "
      "dose · sachet · bol · assiette) <b>plus</b> un champ libre. Absent -> l'écran dit "
      "« portion non définie »."],
     ["② " + C % 'portionWeightG' + " à part",
      "Poids d'<b>UNE</b> portion. La <b>masse totale reste dérivée</b> (" + C % 'q x poids'
      + ") et n'est jamais stockée. Mesuré : 2 steaks de 125 g -> l'écran affiche « Soit 250 g en "
      "tout », la donnée porte " + C % 'q:2, u:portion, portionWeightG:125' + "."],
     ["③ Référence dérivée",
      "Inchangée : " + C % 'totaux / q' + ". Ta question d'arrondi est figée par un témoin — "
      "601 kcal / 3 portions, dix cycles, totaux à 601."],
     ["④ " + C % 'per100' + " recalculé",
      "Écrit quand calculable, <b>recalculé à chaque écriture</b> depuis " + C % 'q x portionWeightG'
      + ", jamais traité comme vérité indépendante. Mesuré : 600 kcal / 250 g -> 240 pour 100 g."],
     ["⑤ Favori rafraîchi",
      "Sa <b>définition</b> suit (100 g -> 125 g) ; ses <b>macros ne sont jamais écrasées</b>. "
      "<i>« Un steak pèse 125 g » est un fait sur l'aliment ; « j'en ai mangé 2 » est un fait sur "
      "ce repas-là.</i>"],
     ["⑥ « 2 steaks » dans le journal", "Chantier séparé, comme décidé — <b>non fait ici</b>."]],
    [40 * mm, 125 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
    "POURQUOI LES PUCES NE SONT PAS DU CONFORT",
    "Taper une étiquette au clavier à chaque repas sur un téléphone ne tiendrait pas trois jours, "
    "et <b>un champ qu'on ne remplit plus est pire qu'un champ absent</b> : il donne l'illusion "
    "que l'information existe. "
    "⭐ Et l'étiquette ne se saisit qu'<b>une fois par aliment</b> : la liste « Mes aliments » et "
    "les favoris la reproposent, exactement comme ils portent déjà le pour-100 g.", VERT))

# ─────────────────── 3. LE PIEGE ───────────────────
F.append(P("3. Le piège structurel, nommé avant d'être commis", 'h1'))

F.append(tableau(
    ['Variable', 'Signifie', 'Vit dans'],
    [[C % '_afPoidsDeclare', "le poids de <b>ce qui est affiché</b> (le total)", "onglet grammes"],
     [C % '_afPortionPoids', "le poids d'<b>UNE</b> portion", "onglet portions"]],
    [45 * mm, 78 * mm, 42 * mm]))
F.append(Spacer(1, 5))

F.append(P(
    "<b>Deux notions, deux variables, jamais la même</b> — consigne écrite de Michel. Les "
    "confondre aurait produit la famille de bugs que ce projet catalogue sous « deux sources qui "
    "se contredisent »."))

F.append(encadre(
    "ET LE POIDS D'UNE PORTION NE RESCALE RIEN",
    "Savoir qu'un steak pèse 125 g <b>ne change pas ce qu'on a mangé</b> : deux steaks restent "
    "deux steaks, et les 4 valeurs à l'écran ne bougent pas (mesuré : 240 / 16 avant <b>et</b> "
    "après). C'est toute la différence avec le champ de poids de l'onglet grammes, qui lui "
    "<i>cale</i> les valeurs. Deux témoins figent cette distinction.", VERT))

# ─────────────────── 4. LE ROUGE ───────────────────
F.append(P("4. Le seul rouge de la version — trouvé avant livraison", 'h1'))

F.append(P(
    "En jouant les dix témoins <b>avant de les écrire</b>, un cas est sorti faux : reprendre une "
    "ligne « 2 steaks de 125 g » qui porte un pour-100 g <b>rouvrait le champ grammes</b>, et "
    "l'écran perdait le « 2 »."))

F.append(encadre(
    "LA DONNÉE ÉTAIT INTACTE — C'EST L'ÉCRAN QUI MENTAIT",
    "L'entrée gardait bien " + C % 'q:2, u:portion' + ". Mais à la reprise, la présence d'un "
    "pour-100 g faisait basculer l'affichage en grammes : la personne voyait 600 kcal pour "
    "« 250 g » au lieu de « 2 steaks ». <b>C'est mot pour mot ce que Michel refuse dans son point "
    "2</b>, et je l'aurais livré sans la mesure."))
F.append(Spacer(1, 5))

F.append(P(
    "<b>Le correctif tient en une règle</b> : le pour-100 g <b>ne décide plus de l'unité</b>. "
    "<i>L'unité appartient à la personne, pas à la richesse de la fiche.</i> "
    "Posé sur les <b>deux</b> portes de reprise, jamais une seule."))
F.append(P(
    "⛔ Non-régression vérifiée : un aliment scanné (compté en grammes) ouvre toujours son champ "
    "grammes — un témoin dédié le fige, parce que c'était le comportement voulu depuis longtemps.",
    'petit'))

F.append(encadre(
    "ET LA LISTE BLANCHE A OUBLIÉ UN CHAMP POUR LA QUATRIÈME FOIS",
    "La fonction qui construit la provenance à l'enregistrement est une <b>liste blanche</b> : un "
    "champ posé en amont et non recopié là n'atteint jamais la donnée — <b>sans erreur, sans test "
    "rouge</b>. C'est écrit trois fois en majuscules dans cette même fonction, et c'est arrivé une "
    "quatrième fois. "
    "<i>Cette fois un témoin dédié fige la traversée, au lieu de compter sur l'attention.</i>",
    ORANGE))

# ─────────────────── 5. VALIDATION ───────────────────
F.append(P("5. Validation", 'h1'))

F.append(tableau(
    ['Suite', 'Résultat'],
    [["Bloc dédié à cette version (CCLXXXI)", "<b>14 témoins, 14 verts</b>"],
     ["Parcours complet (bout en bout, vrai navigateur)", PASSE],
     ["Calculs / muscles / croisés / dates", "339/339 · 241/241 · 50/50 · 9/9"],
     ["Données classées face au moteur conversationnel", "0 trou non classé"],
     ["Contrôle négatif", "<b>12 mutations, toutes mordent</b>"]],
    [70 * mm, 95 * mm]))
F.append(Spacer(1, 6))

F.append(P("Les mutations qui comptent le plus", 'h2'))
F.append(P(
    "<b>·</b> le poids d'une portion qui <b>ferait basculer l'unité</b> -> 3 rouges, exactement ce "
    "que Michel refuse ; &nbsp; "
    "<b>·</b> le pour-100 g qui <b>reprend la main sur l'unité</b> -> rejoue le rouge d'origine ; "
    "&nbsp; "
    "<b>·</b> la définition qui <b>traverse d'un aliment au suivant</b> -> 3 rouges ; &nbsp; "
    "<b>·</b> le favori dont on <b>écrase les macros</b> -> voir ci-dessous."))

F.append(encadre(
    "UNE PROTECTION SANS TÉMOIN N'EST PAS UNE PROTECTION — troisième fois de suite",
    "La mutation « le favori se fait écraser ses macros » rendait <b>zéro rouge</b>. Ce n'était "
    "pas du code inutile : <b>ma fixture mettait 600 des deux côtés</b> (favori 600, repas "
    "300 x 2 = 600), donc l'écrasement était <b>arithmétiquement invisible</b>. "
    "Fixture rendue discriminante (favori 600, repas 500), quatorzième témoin écrit, la mutation "
    "mord. "
    "<i>Après l'état « boutons de portion » et le drapeau côté édition en ft-v1183, c'est la "
    "troisième protection de ce chantier qui se révèle sans témoin. Le contrôle négatif ne le dit "
    "que si la fixture peut faire la différence.</i>", ORANGE))

# ─────────────────── 6. RESTE OUVERT ───────────────────
F.append(P("6. Ce qui reste ouvert", 'h1'))

F.append(tableau(
    ['Sujet', 'État'],
    [["<b>Migration des lignes déjà abîmées</b>",
      "<b>Intacte.</b> Ta règle tient : aucune correction silencieuse par approximation."],
     ["Afficher « 2 steaks » dans le journal du jour",
      "Décidé <b>chantier séparé</b> par Michel, juste après celui-ci. Le journal n'affiche "
      "aujourd'hui aucune quantité — ni grammes ni portions."],
     ["Le garde-fou de masse en portions",
      "Toujours muet. Avec " + C % 'portionWeightG' + " il pourrait désormais parler — signalé, "
      "non fait."],
     ["Cru / cuit · recherche CIQUAL · scan", "Hors périmètre, non touchés."],
     ["Validation iPhone", "À faire par Michel : pas de WebKit dans le conteneur."]],
    [55 * mm, 110 * mm]))

# ─────────────────── 7. QUESTIONS ───────────────────
F.append(P("7. Deux questions ouvertes, si tu veux challenger", 'h1'))

F.append(P(
    "<b>(1)</b> Le rafraîchissement du favori ne touche que la <b>définition</b>, et seulement si "
    "la nouvelle est renseignée — une définition vide n'efface jamais l'ancienne. Le cas non "
    "tranché : quelqu'un qui veut délibérément <b>retirer</b> une étiquette fausse ne peut pas le "
    "faire depuis l'écran d'ajout, seulement en éditant. <i>C'est assumé et écrit, pas oublié.</i>"))
F.append(P(
    "<b>(2)</b> " + C % 'per100' + " est désormais écrit depuis deux chemins : le poids total "
    "(onglet grammes) et " + C % 'q x portionWeightG' + " (onglet portions). Les deux recalculent "
    "à chaque écriture, donc ils ne peuvent pas diverger <b>au moment de l'écriture</b>. Ce que je "
    "n'ai pas testé : une ligne dont on corrigerait " + C % 'portionWeightG' + " <b>plus tard</b>, "
    "depuis l'écran d'édition, sans repasser par l'ajout. Si tu vois là un chemin où le pour-100 g "
    "survit à une définition qui a changé, il m'intéresse."))

F.append(Spacer(1, 8))
F.append(encadre(
    'OÙ LIRE LA SUITE',
    "Les deux documents précédents de ce fil : " + C % 'docs/P1-PORTIONS-DEBRIEF.pdf' + " (la "
    "version ft-v1183) et " + C % 'docs/P1-PORTIONS-CONCEPTION.pdf' + " (la réponse de conception "
    "qui a précédé celle-ci). "
    "Le journal de version est dans " + C % 'CLAUDE.md' + " (entrée ft-v1186), l'état courant dans "
    + C % 'docs/CONTEXTE-ACTUEL.md' + ", et les doutes non encore promus en témoins dans "
    + C % 'docs/JOURNAL-DE-TEST.md' + ". "
    "Le dépôt est public : " + C % 'github.com/michdu75-commits/forcetracker' + ".", GRIS))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker — P1, la portion nommée — ft-v1186',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
print('   passe complète :', PASSE.replace('<b>', '').replace('</b>', ''))
