# -*- coding: utf-8 -*-
"""Mise au point factuelle a destination du relecteur externe (GPT)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
import os

OUT = '/home/user/forcetracker/docs/MISE-AU-POINT-GPT-2026-08-02.pdf'
ROUGE = colors.HexColor('#c0392b'); BLEU = colors.HexColor('#1f4e79')
VERT  = colors.HexColor('#1e7d४4'.replace('४','4')); GRIS = colors.HexColor('#555555')
FOND  = colors.HexColor('#f2f4f7')

ss = getSampleStyleSheet()
def S(n, **k):
    base = k.pop('parent', ss['Normal']); return ParagraphStyle(n, parent=base, **k)
TITRE  = S('t', parent=ss['Title'], fontSize=20, leading=24, textColor=BLEU, spaceAfter=4)
STITRE = S('st', fontSize=11, leading=14, textColor=GRIS, alignment=1, spaceAfter=14)
H1 = S('h1', fontSize=14.5, leading=17, textColor=BLEU, spaceBefore=15, spaceAfter=6, fontName='Helvetica-Bold')
H2 = S('h2', fontSize=11.5, leading=14, spaceBefore=10, spaceAfter=4, fontName='Helvetica-Bold')
P  = S('p', fontSize=9.8, leading=13.6, alignment=TA_JUSTIFY, spaceAfter=6)
PC = S('pc', parent=P, spaceAfter=3)
PETIT = S('pt', fontSize=8.3, leading=11, textColor=GRIS, spaceAfter=5)
CELL = S('cl', fontSize=8.4, leading=10.6)
CELLB = S('cb', parent=CELL, fontName='Helvetica-Bold')
CODE = S('co', fontSize=8.2, leading=11, fontName='Courier', leftIndent=6, spaceAfter=5)
ENC = S('en', fontSize=9.6, leading=13.2, leftIndent=8, rightIndent=8, spaceBefore=4, spaceAfter=4, alignment=TA_JUSTIFY)

def tab(rows, widths, entete=True):
    data = [[Paragraph(str(c), CELLB if (entete and i == 0) else CELL) for c in r] for i, r in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1 if entete else 0)
    st = [('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#c8ccd2')),
          ('LEFTPADDING',(0,0),(-1,-1),4),('RIGHTPADDING',(0,0),(-1,-1),4),
          ('TOPPADDING',(0,0),(-1,-1),3.5),('BOTTOMPADDING',(0,0),(-1,-1),3.5)]
    if entete: st.append(('BACKGROUND',(0,0),(-1,0),colors.HexColor('#dde3ea')))
    for r in range(1 if entete else 0, len(data)):
        if r % 2 == (1 if entete else 0): st.append(('BACKGROUND',(0,r),(-1,r),colors.HexColor('#fafbfc')))
    t.setStyle(TableStyle(st)); return t

def enc(paras, fond=FOND, bord=BLEU):
    t = Table([[p] for p in paras], colWidths=[165*mm])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),fond),('BOX',(0,0),(-1,-1),0.8,bord),
        ('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),
        ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)])); return t

def pied(cv, doc):
    cv.saveState(); cv.setFont('Helvetica', 7.5); cv.setFillColor(GRIS)
    cv.drawString(20*mm, 12*mm, "Force Tracker - Mise au point pour le relecteur - 2 août 2026")
    cv.drawRightString(190*mm, 12*mm, "page %d" % doc.page)
    cv.setStrokeColor(colors.HexColor('#c8ccd2')); cv.line(20*mm, 15*mm, 190*mm, 15*mm); cv.restoreState()

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20*mm, rightMargin=20*mm, topMargin=18*mm,
    bottomMargin=20*mm, title="Force Tracker - Mise au point factuelle", author="Michel / Claude Code")
h = []; A = h.append

A(Paragraph("Mise au point factuelle", TITRE))
A(Paragraph("Force Tracker &mdash; complément au rapport d'audit du 2 août 2026", STITRE))

A(enc([
 Paragraph("<b>Pourquoi ce second document</b>", ENC),
 Paragraph("Le premier rapport portait <b>uniquement sur le catalogue d'exercices</b>. Il ne disait "
  "rien du reste de l'application. Plusieurs affirmations formulées ensuite reposent sur des "
  "hypothèses que le code <b>contredit</b> &mdash; notamment sur la mémoire de l'assistant "
  "conversationnel (Milo).", ENC),
 Paragraph("Ce document corrige ces points. <b>Tout ce qui suit est mesuré sur le code déployé</b> "
  "(exécution réelle, pas lecture de source) : les chiffres et les extraits sont des sorties de "
  "programme. Les dates comptent : plusieurs correctifs sont partis <b>dans la journée du 2 août</b>, "
  "donc une observation faite le matin peut être exacte et périmée l'après-midi.", ENC),
]))
A(Spacer(1, 8))

# ── 1
A(Paragraph("1. Correction principale : Milo n'est PAS limité à cinq séances", H1))
A(Paragraph("<b>Affirmation à corriger :</b> <i>&laquo; J'ai l'impression que Milo ne prend "
  "actuellement en compte que les cinq dernières séances. &raquo;</i>", P))
A(Paragraph("<b>C'était exact jusqu'au 2 août à la mi-journée.</b> Ça ne l'est plus. Le contexte "
  "envoyé au modèle contient désormais <b>deux blocs de nature différente</b> :", P))
A(tab([
 ["Bloc", "Contenu", "Portée"],
 ["Séances détaillées", "Chaque série, chaque charge, chaque répétition", "<b>5 dernières</b> séances"],
 ["Parcours depuis l'inscription", "Ancienneté, nombre total, régularité hebdomadaire, plus longue "
  "coupure, volume cumulé, progression estimée par exercice", "<b>Tout l'historique</b>"],
], [38*mm, 87*mm, 40*mm]))
A(Paragraph("La limite de 5 séances porte donc sur le <b>détail série par série</b>, pas sur la "
  "connaissance de l'historique. C'est un choix de budget : 200 séances brutes noieraient le reste "
  "du contexte.", P))

A(Paragraph("Ce que le modèle reçoit réellement (sortie mesurée)", H2))
A(Paragraph("Profil de test : inscription il y a 348 jours, 91 séances, <b>arrêt de 3 mois</b>, "
  "reprise depuis 3 semaines.", PETIT))
A(Paragraph("PARCOURS DEPUIS L'INSCRIPTION :<br/>"
  "- Première séance enregistrée : 19 août 2025 (il y a 348 jours) &middot; 91 séances au total<br/>"
  "- Régularité : 1,8 séance par semaine en moyenne &middot; <b>plus longue coupure : 91 jours "
  "(reprise le 13 juillet 2026)</b><br/>"
  "- Volume cumulé : 188 tonnes soulevées depuis le début<br/>"
  "- Progression sur ses exercices principaux :<br/>"
  "&nbsp;&nbsp;&middot; Squat à la Barre : 90 &ndash;&gt; 113 kg estimés (+25 %, 91 séances)", CODE))
A(Paragraph("Coût mesuré : environ <b>650 caractères</b>, soit ~1 % d'un contexte de 57 700 "
  "caractères. Construction en 14 ms sur 366 séances.", PETIT))

# ── 2
A(Paragraph("2. En revanche, la critique de fond est JUSTE &mdash; et plus précise qu'énoncée", H1))
A(Paragraph("<i>&laquo; Un bon coach comprend qu'il s'agit d'une reprise. &raquo;</i> Sur ce point, "
  "l'objection tient, mais pas pour la raison avancée. Le problème n'est pas que le modèle "
  "<b>ignore</b> la coupure : il la reçoit. Le problème est qu'il la reçoit <b>mal cadrée</b>. "
  "Trois défauts mesurés :", P))
A(tab([
 ["#", "Défaut mesuré", "Conséquence"],
 ["1", "Aucune distinction entre une coupure <b>passée</b> et une coupure <b>qui vient de se "
  "terminer</b>. La donnée est présentée comme une statistique historique, au même rang que le "
  "volume cumulé.", "Le modèle doit <i>inférer</i> qu'il s'agit d'une reprise. Rien ne le lui dit."],
 ["2", "Le signal explicite (&laquo; revient après une pause &raquo;) ne se déclenche que si la "
  "<b>dernière</b> séance date de plus de 14 jours.", "Il est actif <b>pendant</b> l'absence, et "
  "muet <b>au retour</b> &mdash; c'est-à-dire au seul moment qui compte."],
 ["3", "La régularité est une moyenne sur <b>toute</b> la période, coupure comprise.",
  "Mesuré : quelqu'un qui s'entraîne 3 fois par semaine depuis sa reprise se voit décrit comme "
  "<b>&laquo; 0,6 séance par semaine &raquo;</b>. Exact mathématiquement, faux comme information."],
], [7*mm, 78*mm, 80*mm]))
A(Paragraph("<b>Conclusion sur ce point :</b> l'application transmet des <b>chiffres</b> ; il lui "
  "manque de transmettre un <b>état</b> (&laquo; en reprise depuis 3 semaines après 3 mois d'arrêt, "
  "rythme actuel 3 fois par semaine, en hausse &raquo;). C'est calculable sur les données "
  "existantes, sans modification d'architecture.", P))

# ── 3
A(Paragraph("3. Ce que la vérification a trouvé par ricochet : une perte de données", H1))
A(Paragraph("En vérifiant l'inquiétude sur l'historique, un défaut sans rapport avec le catalogue a "
  "été mis au jour, <b>corrigé et déployé le 2 août</b>. Il est instructif parce qu'<b>aucune de ses "
  "quatre étapes n'est absurde</b> :", P))
A(tab([
 ["Étape", "Comportement", "Jugement isolé"],
 ["1", "Le stockage local du téléphone sature : l'application réduit l'historique local à 50 séances "
  "et affiche <i>&laquo; tes séances restent sauvegardées dans le cloud &raquo;</i>.",
  "Raisonnable (évite un plantage)"],
 ["2", "Au redémarrage, l'application ne relit que ces 50 séances.", "Cohérent"],
 ["3", "À la sauvegarde suivante, elle envoie ces 50 séances au serveur.", "Comportement normal"],
 ["4", "Le garde-fou serveur ne refusait que les envois <b>vides</b> : 50 séances remplaçaient "
  "500 <b>en silence</b>.", "<b>Destruction de données</b>"],
], [12*mm, 105*mm, 48*mm]))
A(Paragraph("Le message de l'étape 1 devenait donc <b>faux</b> à l'étape 4. Et surtout : "
  "<b>rien ne traçait l'événement</b>, il était donc impossible de savoir s'il s'était produit.", P))
A(Paragraph("Corrigé par trois barrières indépendantes : un drapeau qui suspend l'envoi des séances "
  "tant que la copie locale est incomplète &middot; un garde-fou serveur qui refuse tout "
  "rétrécissement brutal (et non plus seulement le vide) &middot; une trace remontée dans le "
  "tableau de santé, <i>parce qu'une alerte qui ne remonte nulle part ne sert à personne</i>.", P))

# ── 4
A(Paragraph("4. Le vrai point d'architecture, chiffré", H1))
A(Paragraph("Si un seul élément de ce document mérite un avis extérieur, c'est celui-ci. "
  "<b>Une fiche d'exercice contient exactement deux champs</b> (mesuré sur les 375 entrées) :", P))
A(Paragraph("n : le nom&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;g : le groupe musculaire", CODE))
A(Paragraph("<b>Il n'existe aucun identifiant.</b> Muscles, schéma de mouvement, matériel et "
  "calories sont <b>recalculés à la volée à partir du nom</b>, à chaque affichage. Trois "
  "conséquences directes, toutes observées le 2 août :", P))
A(Paragraph("&mdash;&nbsp;<b>Le nom est la clé primaire de l'historique.</b> Renommer un exercice impose "
  "une table de migration (records, séances passées, programmes). Utilisée trois fois dans la journée.", PC))
A(Paragraph("&mdash;&nbsp;<b>Ajouter un mot à un nom modifie un calcul.</b> Ajouter la traduction "
  "&laquo; (Tirage Horizontal) &raquo; à &laquo; Rowing Barre &raquo; l'a fait basculer de la "
  "catégorie <i>barre</i> à la catégorie <i>machine</i>, silencieusement.", PC))
A(Paragraph("&mdash;&nbsp;<b>Les statistiques passées ne sont pas figées.</b> Les muscles ne sont pas "
  "stockés dans les séances : ils sont recalculés. Corriger une règle aujourd'hui change donc ce que "
  "les séances d'il y a un an &laquo; ont travaillé &raquo;. Utile pour propager un correctif, "
  "gênant pour la reproductibilité.", PC))
A(Paragraph("&mdash;&nbsp;<b>Ce qu'on ne peut pas modéliser aujourd'hui</b>, faute d'endroit où le mettre : "
  "unilatéral / bilatéral, côté travaillé, amplitude, tempo, variantes d'un même mouvement, "
  "pondération continue des muscles (la hiérarchie est binaire : principal ou secondaire).", PC))

A(Paragraph("Contexte utile pour juger", H2))
A(tab([
 ["Mesure", "Valeur"],
 ["Exercices au catalogue", "337 (uniques)"],
 ["Règles de classification musculaire", "69, parcourues dans l'ordre, première correspondance gagnante"],
 ["Exercices classés par une règle <b>précise</b>", "317 (94 %)"],
 ["Exercices classés par une règle de <b>rattrapage large</b>", "20 (6 %)"],
 ["Moyenne de muscles par exercice", "1,66 principaux &middot; 1,96 secondaires"],
 ["Familles de tests automatisés", "12, dont une dédiée aux croisements (créée le 2 août)"],
], [95*mm, 62*mm]))

# ── 5
A(Paragraph("5. Les questions, reformulées après ces corrections", H1))
A(Paragraph("Les questions du premier rapport restent valables. Trois s'ajoutent, plus précises :", P))
A(Paragraph("<b>Q7.</b> Faut-il transmettre au modèle un <b>état narratif</b> calculé (reprise, "
  "stagnation, montée en charge, changement de fréquence) plutôt que des statistiques brutes ? "
  "Quels états seraient utiles, et sur quels seuils les déclencher sans produire de faux signaux ?", PC))
A(Paragraph("<b>Q8.</b> L'absence d'identifiant d'exercice est-elle une dette à rembourser "
  "<b>maintenant</b>, ou peut-elle attendre ? Argument pour attendre : 337 fiches à renseigner et un "
  "historique utilisateur indexé par nom. Argument pour agir : chaque mois ajoute des données "
  "indexées par une clé instable.", PC))
A(Paragraph("<b>Q9.</b> Le fait que les statistiques passées se recalculent (et donc changent quand "
  "une règle est corrigée) est-il un défaut à corriger &mdash; en figeant les muscles au moment de "
  "l'enregistrement &mdash; ou une propriété souhaitable ?", PC))

A(Spacer(1, 8))
A(enc([
 Paragraph("<b>Ce qu'il serait le plus utile de contredire</b>", ENC),
 Paragraph("Les mesures de ce document sont des sorties de programme, pas des opinions : elles se "
  "réfutent en pointant une erreur de <b>protocole de mesure</b>, pas en pointant un désaccord.", ENC),
 Paragraph("À titre d'exemple, une mesure de ce document a déjà été <b>invalidée puis refaite</b> : "
  "un premier test cherchait le mot &laquo; reprise &raquo; dans le contexte et le trouvait "
  "systématiquement &mdash; parce que ce mot apparaît dans les <i>instructions</i> du modèle, pas "
  "dans les <i>données</i>. Faux positif. C'est exactement le type d'erreur qu'un regard extérieur "
  "peut attraper.", ENC),
]))

doc.build(h, onFirstPage=pied, onLaterPages=pied)
print("PDF ecrit :", OUT, os.path.getsize(OUT), "octets")
