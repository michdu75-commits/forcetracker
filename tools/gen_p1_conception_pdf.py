#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère docs/P1-PORTIONS-CONCEPTION.pdf — la réponse de conception a la relecture de P1.

Même squelette que tools/gen_contre_audit_pdf.py et tools/gen_p1_debrief_pdf.py
(R13 : on enrichit l'existant plutôt que de refabriquer une mise en page).

⚠️ CONTRAINTE DE POLICE : les polices intégrées de reportlab sont en WinAnsi/cp1252.
   Les ACCENTS FRANCAIS passent (vérifié le 09/09, pas seulement supposé — R28) ; les EMOJI
   et les flèches unicode sortent en carrés noirs. On écrit donc en français accentué normal,
   avec « -> » pour les flèches.
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
OUT = os.path.join(ROOT, 'docs', 'P1-PORTIONS-CONCEPTION.pdf')

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
                      'Force Tracker — P1, portion nommée : réponse de conception — 09/09/2026')
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


C = "<font face='Courier'>%s</font>"
F = []

# ─────────────────────────────── EN-TETE ───────────────────────────────
F.append(P('P1 — la portion doit dire ce qu\'elle représente', 'titre'))
F.append(P("Force Tracker — 09/09/2026 — <b>réponse de conception</b>, aucune ligne de code écrite. "
           "Fait suite à la relecture de ft-v1183 : trois exigences non satisfaites, cinq questions "
           "à trancher avant modification.", 'sous'))

F.append(encadre(
    'EN UNE PHRASE',
    "Tes points 1 et 2 sont fondés, et <b>mon argument tombe</b> : j'avais refusé "
    + C % 'portionWeightG' + " en écrivant <i>« cet état n'existe pas »</i>. C'était vrai du "
    "<b>comportement actuel</b>, pas du <b>besoin</b> — et ton cas « 2 steaks de 125 g » montre "
    "que basculer en grammes <b>détruit l'information « 2 steaks »</b>. C'est une perte, pas une "
    "simplification. "
    "Ton point 3, en revanche, est tranché par une mesure et pas par une opinion : "
    "<b>dériver la référence est plus sûr que la stocker</b> — stocker un entier arrondi perd "
    "1 kcal dès le premier cycle."))
F.append(Spacer(1, 6))

F.append(encadre(
    "CE QUE CE DOCUMENT EST, ET CE QU'IL N'EST PAS",
    "C'est une <b>proposition de conception</b>, à valider avant toute modification — la consigne "
    "de Michel était explicite : <i>« ne code pas tout de suite »</i>. "
    "Rien n'a été modifié dans l'application. Le seul commit associé ajoute la mesure d'arrondi au "
    "journal de test, pour qu'elle ne disparaisse pas avec la session. "
    "Tout ce qui est chiffré ici a été <b>exécuté dans un vrai navigateur</b> (Chromium + "
    "Playwright), jamais déduit du code.", GRIS))

# ─────────────────── CE QUE JE CONCEDE ───────────────────
F.append(P("0. Ce que je concède, et pourquoi mon argument était faux", 'h1'))

F.append(P(
    "Mon refus reposait sur une mesure exacte : déclarer un poids fait aujourd'hui basculer "
    "l'application en grammes, donc l'état « portion dont on connaît le poids » n'existe pas, donc "
    "le champ ne se remplirait jamais. <b>Chaque maillon est vrai, et la conclusion est fausse</b> "
    "— parce que j'ai mesuré ce que l'application <i>fait</i> et conclu sur ce qu'elle <i>doit</i> "
    "faire."))

F.append(encadre(
    "LA FORME EXACTE DE L'ERREUR, PARCE QU'ELLE SE REPRODUIRA",
    "<b>Une mesure du comportement actuel ne peut jamais justifier un refus de besoin.</b> Elle "
    "décrit ce qui est, pas ce qui manque. Le seul refus qu'elle autorise est <i>« ce champ est "
    "aujourd'hui inutile »</i> — jamais <i>« ce champ ne servira jamais »</i>. "
    "Le projet a déjà une règle pour ça (une limite affirmée sans être vérifiée devient une règle "
    "de conception silencieuse) ; ici la limite <b>était</b> vérifiée, et c'est la question posée "
    "qui était mauvaise.", ORANGE))

# ─────────────────── 1. PORTIONLABEL ───────────────────
F.append(P("1. Comment stocker " + C % 'portionLabel', 'h1'))

F.append(P(
    "Un champ sur l'entrée du journal : chaîne courte, <b>écrite par la personne, jamais devinée</b>."))

F.append(tableau(
    ['Décision', 'Contenu', 'Pourquoi'],
    [["On stocke le <b>nom nu</b>",
      C % '"steak"' + ", pas " + C % '"1 steak (125 g)"',
      "L'écran compose la phrase. Stocker la phrase figerait une formulation dans la donnée, et "
      "toute évolution d'affichage deviendrait une migration."],
     ["Singulier, décrit <b>UNE</b> portion",
      C % '"steak"' + " -> l'écran rend « 2 portions — 1 steak »",
      "Le pluriel est un problème d'affichage, pas de donnée."],
     ["Absent -> " + C % 'null',
      "L'écran dit <b>« 1 portion (non définie) »</b>",
      "On n'invente pas un nom. Un manque nommé vaut mieux qu'un manque comblé."],
     ["Longueur bornée", "24 caractères",
      "C'est une étiquette, pas une note. Au-delà, l'écran ne peut plus la composer."]],
    [38 * mm, 57 * mm, 70 * mm]))
F.append(Spacer(1, 6))

F.append(P("Où se saisit-il ?", 'h2'))
F.append(P(
    "Un champ court dans le bloc portions, <b>plus une rangée de puces</b> (steak · part · yaourt · "
    "dose · sachet · tranche · bol · assiette). "
    "<b>La rangée de puces n'est pas du confort</b> : taper une étiquette au clavier à chaque repas "
    "sur un téléphone ne tiendrait pas trois jours, et un champ qu'on ne remplit plus est pire "
    "qu'un champ absent — il donne l'illusion que l'information existe."))

F.append(encadre(
    "CE QUI REND LA FONCTION SUPPORTABLE À L'USAGE — ET RIEN N'EST À CONSTRUIRE",
    "« Mes aliments » et les favoris portent <b>déjà</b> " + C % 'q' + ", " + C % 'u' + " et "
    + C % 'per100' + " d'une saisie à l'autre. Le label et le poids empruntent <b>exactement le "
    "même chemin</b> : reprendre « Steak haché » repropose « 1 steak, 125 g » sans rien retaper. "
    "<b>L'étiquette ne se saisit donc qu'une fois par aliment</b>, pas une fois par repas.", VERT))
F.append(Spacer(1, 5))

F.append(encadre(
    "LE PIÈGE À NOMMER : LE FAVORI GARDE UNE COPIE",
    "C'est déjà vrai de " + C % 'per100' + ", et ça a déjà coûté dans ce projet — une copie fausse "
    "survit à la correction de la ligne d'origine, et personne ne voit d'où elle vient. "
    "<b>La vérité doit rester sur l'entrée du journal ; la copie du favori n'est qu'un "
    "pré-remplissage.</b> Corriger une étiquette sur une entrée ne doit pas laisser l'ancienne "
    "vivre indéfiniment dans les favoris — c'est un point à trancher explicitement, pas à "
    "découvrir dans six mois.", ORANGE))

# ─────────────────── 2. PORTIONWEIGHTG ───────────────────
F.append(P("2. Conserver " + C % 'portionWeightG' + " sans casser les grammes", 'h1'))

F.append(P(
    "Le nœud est là : aujourd'hui, déclarer un poids <b>change l'unité</b>. Il faut découpler "
    "<b>ce qu'on compte</b> de <b>la conversion en masse</b>. Deux questions différentes, deux "
    "champs, un propriétaire chacun :"))

F.append(tableau(
    ['La question posée', 'Le champ', 'Exemple « 2 steaks »'],
    [["Combien j'en ai mangé ?", C % 'q' + " + " + C % 'u', C % "q:2, u:'portion'"],
     ["Combien pèse <b>UNE</b> portion ?", C % 'portionWeightG', C % '125'],
     ["Combien ça pèse en tout ?", "<b>dérivé</b> : " + C % 'q x portionWeightG',
      "250 g — <b>jamais stocké</b>"],
     ["Combien pour 100 g ?", "<b>dérivable</b> : totaux / (q x poids) x 100",
      "voir l'arbitrage ci-dessous"]],
    [45 * mm, 60 * mm, 60 * mm]))
F.append(Spacer(1, 6))

F.append(P("Ce qui change, et surtout ce qui ne change pas", 'h2'))
F.append(P(
    "<b>L'onglet « en grammes » garde son rôle à l'identique</b> : on compte en grammes, "
    + C % "u:'g'" + ", le poids de portion n'est pas pertinent. C'est <b>ce qui protège les quatre "
    "corrections précédentes</b> — toute la famille de bugs de contamination de quantité vit sur ce "
    "chemin, et il ne doit pas bouger."))
F.append(P(
    "<b>L'onglet « en portions » gagne un champ optionnel</b> « une portion pèse … g ». Le "
    "renseigner <b>ne bascule plus l'unité</b> : " + C % 'u' + " reste " + C % "'portion'" + ", "
    + C % 'q' + " reste 2. C'est littéralement ta demande n°2."))

F.append(encadre(
    "LE PIÈGE STRUCTUREL, ET IL EST SÉRIEUX",
    "La variable qui porte aujourd'hui le poids déclaré signifie <i>« poids de ce qui est "
    "affiché »</i>, donc du <b>total</b>. Dans l'onglet portions, le nouveau champ signifie "
    "<i>« poids d'UNE portion »</i>. "
    "<b>Deux notions, deux nombres, et ils ne doivent jamais partager une variable.</b> "
    "Le catalogue de bugs du projet a une famille entière pour ça (« deux sources qui se "
    "contredisent ») et une autre pour les quantités qui fuient d'un aliment au suivant. "
    "Concrètement : noms distincts, remise à zéro sur les mêmes chemins, et <b>un témoin sur "
    "chacun</b>.", ORANGE))
F.append(Spacer(1, 5))

F.append(P("L'arbitrage que je ne tranche pas seul", 'h2'))
F.append(P(
    "Quand " + C % 'portionWeightG' + " est connu, " + C % 'per100' + " devient calculable. "
    "Faut-il l'<b>écrire</b> dans la donnée ?"))

F.append(tableau(
    ['Option', 'Ce qu\'on y gagne', 'Ce qu\'on y perd'],
    [["<b>(a)</b> L'écrire, recalculé à chaque écriture",
      "Tout le code existant en profite <b>sans modification</b> : les reprises, l'écran "
      "d'édition, le champ grammes, le garde-fou de masse. Aucun chantier ouvert dans les lecteurs.",
      "Une redondance : deux chemins mènent au même nombre, et ils peuvent diverger si on corrige "
      "le poids de portion plus tard sans recalculer."],
     ["<b>(b)</b> Ne pas l'écrire, adapter les lecteurs",
      "Une seule source de vérité, strictement.",
      "Touche <b>beaucoup</b> de lecteurs, donc beaucoup de surface de régression sur ce qui vient "
      "juste d'être stabilisé."]],
    [45 * mm, 60 * mm, 60 * mm]))
F.append(Spacer(1, 5))

F.append(P(
    "<b>Ma recommandation : (a)</b>, avec une règle écrite — <i>" + C % 'per100' + " est recalculé "
    "à chaque écriture, jamais conservé tel quel</i>. C'est le choix qui n'ouvre pas de chantier "
    "dans du code qu'on vient de corriger quatre fois. Mais c'est un arbitrage de conception, pas "
    "une évidence technique : <b>il se tranche, il ne se déduit pas</b>."))

# ─────────────────── 3. LA REFERENCE ───────────────────
F.append(P("3. La référence d'une portion : dérivée ou stockée ? (mesuré)", 'h1'))

F.append(P(
    "Ton exemple exact — <b>601 kcal pour 3 portions</b> — joué dans un vrai navigateur, "
    "<b>dix cycles</b> de reprise puis réenregistrement, sans jamais rien retoucher :"))

F.append(tableau(
    ['Stratégie', 'Référence d\'une portion', 'Totaux après 10 cycles'],
    [["<b>Dérivée</b> (totaux / q) — le code actuel",
      "200,3333 — <b>stable</b>",
      "<font color='#1E7A46'><b>601 — inchangés</b></font>"],
     ["<b>Stockée arrondie</b>",
      "200",
      "<font color='#C0392B'><b>600 dès le 1er cycle</b></font>, puis figé"]],
    [70 * mm, 45 * mm, 50 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
    "LA RAISON DE FOND, ET ELLE N'EST PAS L'ÉLÉGANCE",
    "Les <b>totaux</b> sont la donnée que la personne a validée à l'écran ; " + C % 'q' + " est son "
    "choix. <b>La référence n'est qu'une VUE de ces deux-là.</b> Stocker une vue crée une seconde "
    "source, qu'il faut arrondir pour l'écrire — et c'est l'arrondi qui perd la kcal, pas la "
    "division.", VERT))
F.append(Spacer(1, 5))

F.append(encadre(
    "LA LIMITE DE CETTE CONCLUSION, ÉCRITE POUR QU'ON NE LA SUR-GÉNÉRALISE PAS",
    "Elle ne tient <b>que</b> parce que les totaux sont la vérité stockée. Si on décidait que la "
    "<b>référence</b> est la vérité et les totaux la vue — ce qui est parfaitement défendable, et "
    "c'est d'ailleurs la forme de ta spécification d'origine — <b>la conclusion s'inverserait</b>. "
    "Ce n'est pas le modèle actuel, et en changer toucherait tous les lecteurs. "
    "<i>Si tu veux ce basculement, c'est un chantier à part entière, pas un champ de plus.</i>",
    GRIS))
F.append(Spacer(1, 5))

F.append(encadre(
    "ET MA PREMIÈRE MESURE ÉTAIT FAUSSE — je le dis parce que c'est le genre d'erreur qui rassure",
    "J'avais saisi 601 kcal <b>par portion</b> (donc 1803 au total). La division tombait juste, "
    "et le tableau montrait « aucune dérive » — <b>alors qu'il ne testait pas la fraction du "
    "tout</b>. Corrigé en posant une ligne qui porte 601 <b>au total</b> pour " + C % 'q:3' + ". "
    "<i>Une mesure qui n'exerce pas le cas qu'on croit mesurer ne prouve rien, elle rassure.</i>",
    ORANGE))

# ─────────────────── 4. LECTEURS / ECRIVAINS ───────────────────
F.append(P("4. Les lecteurs et écrivains à adapter", 'h1'))

F.append(P("Issu de l'audit des huit chemins fait pour ft-v1183, mis à jour pour les deux "
           "nouveaux champs.", 'petit'))

F.append(tableau(
    ['Rôle', 'Fonctions', 'Note'],
    [["<b>Écrivains</b>",
      C % '_provFood' + " · " + C % '_afSetSrc' + " · " + C % 'quickAddFood' + " · "
      + C % 'saveEditFood' + " · " + C % 'rejouerRepas' + " · " + C % 'toggleFavFood',
      "<b>La liste blanche de " + C % '_provFood' + " est le point noir</b> : c'est la QUATRIÈME "
      "fois qu'un champ posé en amont n'y est pas recopié et n'atteint jamais la donnée, sans "
      "erreur ni test rouge. Elle mérite un témoin dédié, pas seulement de l'attention."],
     ["<b>Lecteurs</b>",
      C % 'quickFillFood' + " et " + C % '_afSuggPrendreLocale' + " · " + C % '_afMajAncre'
      + " · " + C % '_efQtyRender' + " · " + C % '_renderFoodQuickList',
      "Les <b>deux portes de reprise se corrigent toujours ensemble</b> : un mécanisme posé sur "
      "une seule des deux est le motif recensé sept fois dans ce fichier."],
     ["<b>Export CSV</b>", C % 'exportNutritionCsv' + " (setup.js)",
      "<b>Deux colonnes à ajouter</b> (" + C % 'portion_label' + ", " + C % 'portion_poids_g'
      + "). Sans elles, l'export perd précisément l'information qu'on vient de sauver."],
     ["<b>Rien à faire</b>", "Synchro cloud · " + C % 'Code.js',
      "Passe-plats, <b>mesuré</b> : les objets du journal traversent sans filtre ni "
      "transformation."],
     ["<b>Non touchés</b>",
      C % '_qtyRescale' + " · recherche / CIQUAL · scan code-barres · migration",
      "Explicitement hors périmètre, comme pour ft-v1183."]],
    [30 * mm, 62 * mm, 73 * mm]))
F.append(Spacer(1, 6))

F.append(encadre(
    "DEUX OPPORTUNITÉS QUE JE SIGNALE SANS LES PRENDRE",
    "<b>(1)</b> Le garde-fou de masse (« ces calories ne peuvent pas tenir dans ce poids ») <b>se "
    "tait aujourd'hui en portions</b>, faute de masse connue. Avec " + C % 'portionWeightG' + ", "
    "il pourrait enfin parler. "
    "<b>(2)</b> Le journal du jour <b>n'affiche aucune quantité</b> — ni grammes ni portions. "
    "C'est pourtant l'écran où « 2 steaks » se lirait vraiment. "
    "<i>Les deux sont hors de ce qui a été demandé. Je les nomme pour qu'elles soient des "
    "décisions et non des oublis.</i>", GRIS))

# ─────────────────── 5. TESTS ───────────────────
F.append(P("5. Les tests qui empêcheront une régression", 'h1'))

F.append(P("Ce qui doit rester vert (5 blocs de témoins existants)", 'h2'))
F.append(tableau(
    ['Bloc', 'Ce qu\'il fige', 'Valeurs interdites'],
    [["CCLXXVII (ft-v1179)", "Un bloc pour-100 g visible sans source ne donne pas sa quantité",
      "100 · 160"],
     ["CCLXXVIII (ft-v1180)", "Les cinq contaminations d'un aliment au suivant", "380 · 150 · 200"],
     ["CLXVIII (ft-v1181)", "Le couple référence / quantité survit à l'aller-retour d'onglet",
      "117/26 · 156/35 · q=30"],
     ["CCLXXIX (ft-v1182)", "Les résultats de recherche restent visibles à l'écran", "—"],
     ["CCLXXX (ft-v1183)", "Les 15 témoins de la portion, dont « rien n'est écrit sans choix »",
      "q non nul sans geste"]],
    [38 * mm, 90 * mm, 37 * mm]))
F.append(Spacer(1, 6))

F.append(P("Ce qu'il faut ajouter (10 témoins)", 'h2'))
F.append(P(
    "<b>(1)</b> « 2 steaks de 125 g » -> " + C % "q:2, u:'portion'" + ", étiquette et poids "
    "persistés, masse totale 250 g. &nbsp; "
    "<b>(2)</b> L'écran rend « 1 portion = 1 steak (125 g) », et <b>jamais</b> un poids quand il "
    "est inconnu. &nbsp; "
    "<b>(3)</b> <b>Déclarer le poids d'une portion ne bascule pas l'unité</b> — c'est le témoin "
    "qui garde ta demande n°2, et le plus important des dix. &nbsp; "
    "<b>(4)</b> L'onglet grammes est <b>inchangé</b> : 500 g reste " + C % "q:500, u:'g'" + ". "
    "&nbsp; "
    "<b>(5)</b> Reprendre une ligne « 2 steaks » repropose tout, sans rien retaper. &nbsp; "
    "<b>(6)</b> D'un aliment à l'autre, <b>ni l'étiquette ni le poids de portion ne traversent</b>. "
    "&nbsp; "
    "<b>(7)</b> Étiquette absente -> « portion (non définie) », aucune invention. &nbsp; "
    "<b>(8)</b> 601 kcal / 3 portions -> référence stable et totaux à 601 sur dix cycles. &nbsp; "
    "<b>(9)</b> L'export CSV porte les deux nouvelles colonnes. &nbsp; "
    "<b>(10)</b> Le pour-100 g dérivé est cohérent avec les totaux."))

F.append(P("Les contrôles négatifs prévus", 'h2'))
F.append(P(
    "Chaque protection doit pouvoir <b>rougir</b> : retirer l'étiquette de la liste blanche · "
    "retirer le poids de portion · faire rebasculer l'unité quand on déclare le poids · stocker une "
    "référence arrondie · faire traverser l'étiquette d'un aliment au suivant."))

F.append(encadre(
    "ET LA RÈGLE QUE CE CHANTIER DOIT S'APPLIQUER À LUI-MÊME",
    "Sur la version précédente, <b>deux mutations n'ont fait rougir personne</b> — et ce n'était "
    "pas du code mort, c'étaient des <b>trous de témoin</b>. Sans les combler, le contrôle négatif "
    "aurait déclaré mortes deux vraies protections, et je les aurais retirées. "
    "<b>Toute protection ajoutée ici devra être éprouvée par sa propre mutation avant d'être "
    "considérée comme acquise.</b>", ORANGE))

# ─────────────────── CE QUI RESTE A TRANCHER ───────────────────
F.append(P("6. Ce qui reste à trancher avant que je code", 'h1'))

F.append(tableau(
    ['Décision', 'Options', 'Ma recommandation'],
    [["Écrire " + C % 'per100' + " quand il devient calculable ?",
      "(a) l'écrire, recalculé à chaque écriture &nbsp;·&nbsp; (b) ne pas l'écrire et adapter les "
      "lecteurs",
      "<b>(a)</b> — n'ouvre pas de chantier dans du code corrigé quatre fois"],
     ["L'étiquette du favori quand on corrige celle de l'entrée",
      "la mettre à jour &nbsp;·&nbsp; la laisser vivre comme simple pré-remplissage",
      "<b>Pré-remplissage</b>, et l'écrire — sinon on redécouvre le problème dans six mois"],
     ["Le journal du jour doit-il afficher « 2 steaks » ?",
      "oui &nbsp;·&nbsp; non, chantier séparé",
      "<b>Chantier séparé</b> : c'est un écran, pas une donnée"],
     ["Le garde-fou de masse doit-il parler en portions ?",
      "oui, dès que le poids est connu &nbsp;·&nbsp; non",
      "<b>Oui</b>, mais après — il ne conditionne pas la structure"]],
    [45 * mm, 65 * mm, 55 * mm]))

F.append(Spacer(1, 8))
F.append(encadre(
    'OÙ LIRE LA SUITE',
    "Le débrief de la version livrée est dans " + C % 'docs/P1-PORTIONS-DEBRIEF.pdf' + ". "
    "La mesure d'arrondi complète, avec l'erreur de fixture, est consignée dans "
    + C % 'docs/JOURNAL-DE-TEST.md' + ". "
    "Le journal de version est dans " + C % 'CLAUDE.md' + " (entrée ft-v1183) et l'état courant "
    "dans " + C % 'docs/CONTEXTE-ACTUEL.md' + ". "
    "Le dépôt est public : " + C % 'github.com/michdu75-commits/forcetracker' + ".", GRIS))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title='Force Tracker — P1, portion nommée : réponse de conception',
                        author='Force Tracker')
doc.build(F, onFirstPage=pied, onLaterPages=pied)
print('OK ->', OUT)
