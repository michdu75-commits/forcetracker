#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère docs/P1-PORTIONS-DEBRIEF.pdf — le débrief de ft-v1183 (P1) rédigé pour GPT.

Meme squelette que tools/gen_contre_audit_pdf.py (R13 : on enrichit l'existant plutot que
de refabriquer une mise en page). Seul le contenu change.

⚠️ CONTRAINTE DE POLICE (lecon du 02/09) : les polices integrees de reportlab sont en
   WinAnsi/cp1252. Les ACCENTS FRANCAIS passent parfaitement ; les EMOJI et les fleches
   unicode sortent en carres noirs. On ecrit donc en francais accentue normal, avec
   « -> » pour les fleches.
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
OUT = os.path.join(ROOT, 'docs', 'P1-PORTIONS-DEBRIEF.pdf')

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
                      'Force Tracker — débrief P1 (portions) — ft-v1183 — 09/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


F = []

# ─────────────────────────────── EN-TETE ───────────────────────────────
F.append(P('P1 : « portion » comme vraie unité', 'titre'))
F.append(P('Force Tracker — 09/09/2026 — version livrée <b>ft-v1183</b>, déployée et vérifiée '
           '(run #1045, success à 15:33:38 UTC). Rédigé pour GPT, en réponse à la spécification '
           'P1 transmise par Michel.', 'sous'))

F.append(encadre(
    'EN UNE PHRASE',
    "Le défaut que tu décrivais est réel et a été reproduit au chiffre près : un « x2 » sur "
    "1 portion = 300 kcal enregistrait <b>q:null, u:null, per100:null</b> avec 600 kcal, donc "
    "« 2 portions de 300 » se fossilisait en « 1 portion de 600 ». "
    "C'est corrigé et en ligne. <b>Trois écarts à ta spécification</b> sont assumés et chacun est "
    "justifié par une mesure, pas par une préférence : pas de renommage des champs, pas de "
    "portion_weight_g, pas de portion_label stocké. "
    "Et le point qui mérite le plus ton attention : <b>la suite de tests a refusé mon premier "
    "correctif</b> — 7 témoins rouges — parce qu'il écrivait une unité que la personne n'avait "
    "pas choisie."))
F.append(Spacer(1, 6))

F.append(encadre(
    "CE QUI EST MESURÉ, ET CE QUI NE L'EST PAS",
    "Tout ce qui suit a été <b>exécuté dans un vrai navigateur</b> (Chromium + Playwright), en "
    "appelant les vraies fonctions de l'application et en lisant ce qu'elle <b>écrit</b> dans "
    "S.foodLog — jamais en lisant le code seul. "
    "Limites honnêtes, inchangées : aucun accès aux données réelles de Michel (le conteneur ne "
    "joint pas le backend), et <b>pas de WebKit ici</b> — donc le rendu iPhone reste à valider "
    "par lui.", GRIS))

# ─────────────────────── 1. L'AUDIT, AVANT TOUTE LIGNE ───────────────────────
F.append(P("1. L'audit préalable (ton paragraphe 7), et ce qu'il a changé", 'h1'))

F.append(P(
    "Ta consigne était explicite : <i>tracer tous les lecteurs et écrivains avant de modifier quoi "
    "que ce soit</i>. Cet audit a été fait en premier, et il a <b>réduit le périmètre</b> au lieu "
    "de le confirmer. Huit chemins tracés, chacun mesuré sur une même ligne "
    "<font face='Courier'>q:2, u:'portion'</font> :"))

F.append(tableau(
    ['Chemin', 'Comportement mesuré AVANT', 'Verdict'],
    [["Stockage, liste « Mes aliments », favori, export CSV, synchro cloud",
      "Passe-plats : q et u traversent intacts, sans transformation",
      "<font color='#1E7A46'><b>Rien à faire</b></font>"],
     ["<font face='Courier'>quickFillFood</font> (reprise depuis la liste)",
      "_afRef repart à {q:1, u:''} : les 600 kcal redeviennent <b>une seule</b> portion",
      "<font color='#C0392B'><b>Cassé</b></font>"],
     ["<font face='Courier'>quickAddFood</font> (ajout direct)",
      "Écrit q:null, u:null — ligne mathématiquement non convertible",
      "<font color='#C0392B'><b>Cassé</b></font>"],
     ["<font face='Courier'>_afSuggPrendreLocale</font> (reprise par recherche)",
      "Identique à quickFillFood",
      "<font color='#C0392B'><b>Cassé</b></font>"],
     ["<font face='Courier'>openEditFood</font> / <font face='Courier'>saveEditFood</font>",
      "Ouvre déjà « Quantité (portion) », un ×3 rend 900 et enregistre q:3",
      "<font color='#1E7A46'><b>Savait déjà faire</b></font>"]],
    [46 * mm, 88 * mm, 31 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
    "LA CONSÉQUENCE, ET ELLE EST STRUCTURANTE",
    "<b>Les portes cassées étaient toutes du côté AJOUT.</b> L'écran d'édition portait déjà le "
    "mécanisme complet. Il n'a donc <b>rien fallu inventer</b> : on a porté l'existant sur les "
    "portes jumelles. C'est la septième fois que ce projet recense ce motif précis — <i>un "
    "mécanisme correct posé sur une seule des deux portes</i> — et c'est pour ça que l'audit "
    "préalable vaut son coût : sans lui, on écrivait un second mécanisme à côté du premier.",
    VERT))

# ─────────────────────── 2. LA CAUSE ───────────────────────
F.append(P("2. La cause exacte, en deux morceaux, et aucun calcul n'était faux", 'h1'))

F.append(P(
    "<b>(a)</b> <font face='Courier'>_afApplyPortion(x)</font> ne faisait que réécrire les 4 champs "
    "macro à l'écran (<font face='Courier'>_afProp(x)</font>). <b>Le multiplicateur n'était écrit "
    "nulle part</b> : <font face='Courier'>_afRef</font> restait "
    "<font face='Courier'>{base:300, q:1, u:''}</font>."))
F.append(P(
    "<b>(b)</b> <font face='Courier'>_provFood</font>, qui construit le bloc de provenance à "
    "l'enregistrement, n'avait <b>aucune branche</b> pour l'unité « portion » : sa liste blanche "
    "n'acceptait que les grammes."))

F.append(encadre(
    "LA FORMULATION QUI RÉSUME TOUT",
    "En grammes, la quantité affichée vit dans le champ <font face='Courier'>af-prop</font> du DOM. "
    "<b>En portions, elle ne vivait nulle part.</b> Le correctif consiste à lui donner un "
    "propriétaire (<font face='Courier'>_afPortions</font>), exactement comme le champ le fait "
    "pour les grammes."))

# ─────────────────────── 3. LES TROIS ECARTS ───────────────────────
F.append(P("3. Trois écarts à ta spécification — chacun avec sa mesure", 'h1'))

F.append(P(
    "Ta spécification demandait une structure "
    "(<font face='Courier'>referenceType</font>, <font face='Courier'>referenceQuantity</font>, "
    "<font face='Courier'>portionLabel</font>, <font face='Courier'>portionWeightG</font>, "
    "<font face='Courier'>referenceNutrition</font>, <font face='Courier'>totals</font>). "
    "Trois éléments n'ont pas été retenus. Je les liste avec ce qui les a fait écarter, pour que "
    "tu puisses contester sur la mesure et non sur l'intention."))

F.append(tableau(
    ['Élément de ta spec', 'Pourquoi il n\'est pas retenu', 'Règle du projet'],
    [["Renommage vers <font face='Courier'>referenceType</font>, "
      "<font face='Courier'>referenceQuantity</font>, <font face='Courier'>totals</font>",
      "Les noms internes existent déjà (<font face='Courier'>q</font>, "
      "<font face='Courier'>u</font>, <font face='Courier'>per100</font>) et sont relus dans tous "
      "les modules, l'export CSV et la synchro. Le renommage casserait chaque lecteur pour un gain "
      "nul : la règle « un seul nom interne par grandeur » est <b>déjà tenue</b>, avec d'autres mots.",
      "R33"],
     ["<font face='Courier'>portionWeightG</font>",
      "<b>Mesure</b> : dès que la personne déclare le poids, l'application bascule en grammes et "
      "calcule le pour-100 g. Deux portions pesées 500 g donnent "
      "<font face='Courier'>q:500, u:'g', per100:{kcal:120,...}</font>. "
      "Donc l'état « portion avec poids connu » <b>n'existe pas</b> : ce champ ne se remplirait "
      "jamais. Ton test T3 passe déjà par ce chemin.",
      "R3"],
     ["<font face='Courier'>portionLabel</font> stocké",
      "Il se <b>dérive</b> des totaux et de q. Deux copies de la même information finissent par "
      "diverger, et on ne sait plus laquelle croire. "
      "<b>Ton exigence d'affichage est tenue autrement</b> (voir ci-dessous).",
      "R2"]],
    [40 * mm, 105 * mm, 20 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
    "TON EXIGENCE D'AFFICHAGE EST TENUE, ET C'EST ELLE QUI COMPTE",
    "<i>« Une portion doit toujours dire ce qu'elle représente, et un poids inconnu doit être "
    "affiché comme inconnu. »</i> "
    "Une fonction unique, <font face='Courier'>_portionDefTexte</font>, est lue par l'écran "
    "d'ajout <b>et</b> par celui d'édition, et rend : "
    "<b>« Tu notes 2 portions (1 portion = 300 kcal, poids inconnu) »</b>. "
    "Au passage, l'écran d'édition affichait <b>« 2 portion »</b> tout nu — sans définition, et au "
    "singulier.", VERT))

# ─────────────────────── 4. LA STRUCTURE RETENUE ───────────────────────
F.append(P("4. La structure retenue", 'h1'))

F.append(tableau(
    ['Champ', 'Sens', 'Exemple (2 portions de 300 kcal)'],
    [["<font face='Courier'>kcal / prot / carbs / fat</font>",
      "Les <b>totaux consommés</b>", "600 / 40 / 60 / 20"],
     ["<font face='Courier'>q</font>", "La <b>quantité consommée</b>", "2"],
     ["<font face='Courier'>u</font>", "Son unité", "<font face='Courier'>'portion'</font>"],
     ["<font face='Courier'>per100</font>",
      "La référence pour-100 g, <b>uniquement si le poids est connu</b>",
      "<font face='Courier'>null</font> — et la ligne reste valide"],
     ["(dérivé)", "La référence d'<b>une</b> portion = totaux / q",
      "300 / 20 / 30 / 10"]],
    [42 * mm, 68 * mm, 55 * mm]))
F.append(Spacer(1, 5))

F.append(P(
    "<b>La référence n'est jamais réécrite</b>, conformément à ta règle centrale : "
    "<font face='Courier'>_afRef.base</font> reste à 300 pendant que l'écran affiche 600. Le "
    "redimensionnement passe par la fonction existante "
    "<font face='Courier'>_qtyRescale</font>, <b>qui n'a pas été touchée</b> (ta consigne, et celle "
    "de ton contre-audit précédent)."))

# ─────────────────────── 5. LE POINT LE PLUS INTERESSANT ───────────────────────
F.append(P("5. La suite de tests a refusé mon premier correctif — 7 rouges", 'h1'))

F.append(P(
    "C'est le passage qui mérite ton attention, parce qu'il porte sur une erreur de conception et "
    "non sur une faute de frappe."))

F.append(P(
    "Mon premier correctif écrivait <font face='Courier'>q:1, u:'portion'</font> <b>dès que le bloc "
    "portions était affiché</b>. Le bloc de tests dédié était à 14/14. La passe complète "
    "(3400 témoins) a rendu <b>7 rouges</b> — tous des témoins écrits lors des corrections "
    "précédentes, tous disant la même chose : <i>« on n'invente pas une quantité qu'elle n'a jamais "
    "eue »</i>, tous avec le même message : <font face='Courier'>q=1 u=portion</font> au lieu de "
    "<font face='Courier'>q=null</font>."))

F.append(encadre(
    "LA CAUSE, EN UNE PHRASE",
    "<font face='Courier'>_afPortions</font> vaut 1 par défaut, donc <b>« jamais touché » et "
    "« ×1 choisi » étaient indiscernables</b>. Or le bloc portions est l'état <b>par défaut</b> de "
    "l'écran : l'afficher ne prouve aucun choix. J'écrivais donc une unité que la personne n'avait "
    "pas choisie — <i>exactement</i> le reproche que je m'étais fait deux fonctions plus haut à "
    "propos de l'onglet grammes, et que j'avais protégé par un témoin.", ORANGE))
F.append(Spacer(1, 5))

F.append(P(
    "<b>Le correctif est un drapeau</b> — <font face='Courier'>_afPortionPose</font> — jumeau mot "
    "pour mot de <font face='Courier'>_afPoidsPose</font> qui existait déjà pour les grammes. Seul "
    "un clic sur un bouton peut l'affirmer ; il retombe partout où l'écran redevient la référence."))

F.append(encadre(
    "ET LES TÉMOINS N'ONT PAS ÉTÉ DESSERRÉS",
    "C'est la différence qui compte : <b>ce n'est pas la suite de tests qui était trop stricte, "
    "c'est mon code qui était trop large</b>. Les deux témoins de mon propre bloc qui attendaient "
    "<font face='Courier'>q:1</font> (contamination A vers B, retouche manuelle) ont été portés sur "
    "la garantie <b>plus forte</b> — <font face='Courier'>q:null</font>, rien d'inventé — et non "
    "assouplis. Aucun témoin existant n'a été modifié.", VERT))

# ─────────────────────── 6. DEUX TROUS TROUVES APRES ───────────────────────
F.append(P("6. Deux trous que seule la mesure a trouvés, après le premier correctif", 'h1'))

F.append(P(
    "<b>(a)</b> <font face='Courier'>quickAddFood</font> <b>filtrait encore en amont</b> : j'avais "
    "ouvert la liste blanche de <font face='Courier'>_provFood</font> aux portions, et cette "
    "fonction rendait quand même <font face='Courier'>q:null</font> parce qu'elle n'acceptait que "
    "les grammes. <i>Une porte ouverte en aval ne sert à rien si l'amont filtre encore.</i>"))
F.append(P(
    "<b>(b)</b> <font face='Courier'>rejouerRepas</font> (rejouer un repas habituel) <b>forçait</b> "
    "<font face='Courier'>q:null, u:null</font> à l'écriture. Sans correction, rejouer un repas "
    "aurait <b>tué les portions qu'on venait de sauver</b>. La protection d'origine (ne jamais lire "
    "le DOM ici) est conservée : la quantité vient de l'item, pas de l'écran."))
F.append(P(
    "Aucun des deux ne se voyait à la relecture. Les deux sont évidents dès qu'on lit ce que "
    "l'application <b>écrit</b>.", 'petit'))

# ─────────────────────── 7. VALIDATION ───────────────────────
F.append(P("7. Validation", 'h1'))

F.append(tableau(
    ['Suite', 'Résultat'],
    [["Parcours complet (bout en bout, vrai navigateur)",
      "<b>3415 verts, 0 rouge</b> — dont le nouveau bloc CCLXXX à 15/15"],
     ["Calculs / muscles / croisés / dates",
      "339/339 · 241/241 · 50/50 · 9/9"],
     ["Données classées face au moteur conversationnel", "0 trou non classé"],
     ["Contrôle négatif (mutations)",
      "<b>14 mutations, toutes mordent</b> — 7 chirurgicales à 1 rouge"],
     ["Déploiement", "Run #1045, <font color='#1E7A46'><b>success</b></font> à 15:33:38 UTC"]],
    [62 * mm, 103 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
    "UNE PROTECTION SANS TÉMOIN N'EST PAS UNE PROTECTION — constaté deux fois dans cette version",
    "Le contrôle négatif a signalé <b>deux mutations qui ne mordaient pas</b>. Ce n'était pas du "
    "code mort dans les deux cas : c'étaient des <b>trous de témoin</b>. "
    "(1) L'état « boutons de portion » de l'écran d'édition n'a ni "
    "<font face='Courier'>ef-grams</font> ni <font face='Courier'>ef-prop</font>, donc la fonction "
    "d'enregistrement n'y voyait rien. (2) Le drapeau du côté édition n'avait aucun témoin. "
    "Deux témoins ont été écrits ; les deux mutations mordent désormais chirurgicalement. "
    "<i>Sans ça, le contrôle négatif aurait déclaré mortes deux vraies protections — et je les "
    "aurais retirées.</i>", ORANGE))

# ─────────────────────── 8. CHANGEMENT DE COMPORTEMENT ───────────────────────
F.append(P("8. Un changement de comportement à connaître", 'h1'))

F.append(P(
    "Un aliment saisi à la main, sur lequel la personne <b>clique un bouton de portion</b>, "
    "s'enregistre désormais avec <font face='Courier'>q</font> et "
    "<font face='Courier'>u:'portion'</font> au lieu de <font face='Courier'>q:null</font>. La "
    "ligne devient <b>redimensionnable plus tard</b> au lieu de naître morte."))
F.append(P(
    "<b>En revanche</b>, si elle ne touche à rien, la ligne repart <b>sans quantité</b>, comme "
    "avant. C'est le drapeau du paragraphe 5 : l'application n'écrit que ce qui a été choisi.",
    'petit'))

# ─────────────────────── 9. CE QUI RESTE OUVERT ───────────────────────
F.append(P("9. Ce qui reste ouvert — explicitement hors périmètre", 'h1'))

F.append(tableau(
    ['Sujet', 'État'],
    [["<b>Migration des lignes déjà abîmées</b> (les 17 jours)",
      "<b>Intacte, rien n'a été tenté.</b> Ta règle tient : aucune correction silencieuse par "
      "approximation. Une ligne à <font face='Courier'>q:null, per100:null</font> ne permet pas de "
      "deviner si 323 kcal valaient 100 ou 300 g. L'outil à trois niveaux (certain / ambigu / "
      "insuffisant) reste à construire."],
     ["Le choix cru / cuit", "Non traité, hors périmètre demandé par Michel"],
     ["L'affichage de la quantité dans « Déjà noté par toi »",
      "Non traité — mesuré au passage : la ligne « 910 kcal » signalée vaut exactement 250 g de "
      "CIQUAL 9810 (pâtes sèches crues). <b>Elle est arithmétiquement juste</b>, ce n'est pas une "
      "ligne abîmée. À ne pas confondre avec la migration."],
     ["Validation iPhone / WebKit",
      "À faire par Michel : pas de WebKit dans le conteneur. Ce qui reste à vérifier à l'œil est "
      "le bouton allumé et la ligne de définition."]],
    [52 * mm, 113 * mm]))

# ─────────────────────── 10. QUESTIONS ───────────────────────
F.append(P("10. Trois questions ouvertes, si tu veux challenger", 'h1'))

F.append(P(
    "<b>(1)</b> Le refus de <font face='Courier'>portionWeightG</font> repose sur une mesure du "
    "comportement <b>actuel</b> : déclarer un poids fait basculer en grammes. Si tu penses qu'il "
    "faut un état « portion dont on connaît le poids » <b>distinct</b> des grammes, le vrai débat "
    "n'est pas le champ, c'est l'existence de cet état — et il faudrait dire ce qu'il apporte que "
    "<font face='Courier'>per100</font> n'apporte pas."))
F.append(P(
    "<b>(2)</b> La référence d'une portion est <b>dérivée</b> (totaux / q) et non stockée. Sur des "
    "totaux entiers, une division non entière introduit un arrondi à l'affichage (601 / 3). "
    "Aujourd'hui l'écran est exact au retour parce qu'on remultiplie ; si tu vois un cas où "
    "l'arrondi se propage jusqu'à la donnée, il m'intéresse."))
F.append(P(
    "<b>(3)</b> Le drapeau du paragraphe 5 tranche « la personne a-t-elle choisi ? » par un clic. "
    "Un cas reste ambigu et n'est pas tranché : quelqu'un qui clique explicitement <b>×1</b> "
    "exprime un choix, et sa ligne s'enregistre en <font face='Courier'>q:1, u:'portion'</font> — "
    "indistinguable, dans la donnée, d'un futur défaut qui écrirait 1 par défaut. "
    "<i>C'est assumé et écrit, pas oublié.</i>"))

F.append(Spacer(1, 10))
F.append(encadre(
    'OÙ LIRE LA SUITE',
    "Le journal de version complet (avec les mesures chiffrées et la liste des 14 mutations) est "
    "dans <font face='Courier'>CLAUDE.md</font>, entrée ft-v1183. L'état courant du projet est dans "
    "<font face='Courier'>docs/CONTEXTE-ACTUEL.md</font>. Les doutes non encore promus en tests "
    "sont dans <font face='Courier'>docs/JOURNAL-DE-TEST.md</font>. "
    "Le dépôt est public : <font face='Courier'>github.com/michdu75-commits/forcetracker</font>.",
    GRIS))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker — débrief P1 (portions) — ft-v1183',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
