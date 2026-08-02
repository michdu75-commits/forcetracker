# -*- coding: utf-8 -*-
"""Rapport PDF pour relecture externe (GPT) — audit du catalogue d'exercices de Force Tracker."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                PageBreak, KeepTogether)
import json, os

SC = '/tmp/claude-0/-home-user-forcetracker/12f61d67-fd14-50ef-8709-99418240fb44/scratchpad'
MOD = json.load(open(SC + '/modele.json'))
OUT = '/home/user/forcetracker/docs/AUDIT-CATALOGUE-2026-08-02.pdf'

ROUGE = colors.HexColor('#c0392b')
BLEU  = colors.HexColor('#1f4e79')
GRIS  = colors.HexColor('#555555')
FOND  = colors.HexColor('#f2f4f7')

ss = getSampleStyleSheet()
def S(name, **kw):
    base = kw.pop('parent', ss['Normal'])
    return ParagraphStyle(name, parent=base, **kw)

TITRE   = S('t',  parent=ss['Title'], fontSize=21, leading=25, textColor=BLEU, spaceAfter=4)
STITRE  = S('st', fontSize=11.5, leading=15, textColor=GRIS, alignment=1, spaceAfter=16)
H1      = S('h1', fontSize=15, leading=18, textColor=BLEU, spaceBefore=16, spaceAfter=7,
            fontName='Helvetica-Bold')
H2      = S('h2', fontSize=12, leading=15, textColor=colors.black, spaceBefore=11, spaceAfter=5,
            fontName='Helvetica-Bold')
P       = S('p',  fontSize=9.7, leading=13.6, alignment=TA_JUSTIFY, spaceAfter=6)
PC      = S('pc', parent=P, spaceAfter=3)
PETIT   = S('pt', fontSize=8.3, leading=11, textColor=GRIS, spaceAfter=5)
CELL    = S('cl', fontSize=8.2, leading=10.4)
CELLB   = S('cb', parent=CELL, fontName='Helvetica-Bold')
CITE    = S('ci', fontSize=10, leading=14, leftIndent=10, rightIndent=10, textColor=BLEU,
            fontName='Helvetica-Oblique', spaceBefore=5, spaceAfter=8)
ENCADRE = S('en', fontSize=9.5, leading=13.2, leftIndent=8, rightIndent=8, spaceBefore=4,
            spaceAfter=4, alignment=TA_JUSTIFY)
QUEST   = S('q',  fontSize=10.2, leading=14, fontName='Helvetica-Bold', textColor=ROUGE,
            spaceBefore=9, spaceAfter=3)

def tableau(donnees, largeurs, entete=True, aligns=None):
    data = []
    for i, ligne in enumerate(donnees):
        st = CELLB if (entete and i == 0) else CELL
        data.append([Paragraph(str(c), st) for c in ligne])
    t = Table(data, colWidths=largeurs, repeatRows=1 if entete else 0)
    style = [('VALIGN', (0,0), (-1,-1), 'TOP'),
             ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor('#c8ccd2')),
             ('LEFTPADDING', (0,0), (-1,-1), 4), ('RIGHTPADDING', (0,0), (-1,-1), 4),
             ('TOPPADDING', (0,0), (-1,-1), 3.5), ('BOTTOMPADDING', (0,0), (-1,-1), 3.5)]
    if entete:
        style += [('BACKGROUND', (0,0), (-1,0), colors.HexColor('#dde3ea'))]
    for r in range(1 if entete else 0, len(data)):
        if r % 2 == (1 if entete else 0):
            style.append(('BACKGROUND', (0,r), (-1,r), colors.HexColor('#fafbfc')))
    t.setStyle(TableStyle(style))
    return t

def encadre(paras, couleur=FOND, bordure=BLEU):
    inner = [[p] for p in paras]
    t = Table(inner, colWidths=[165*mm])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),couleur),
                           ('BOX',(0,0),(-1,-1),0.8,bordure),
                           ('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),
                           ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    return t

def pied(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(GRIS)
    canvas.drawString(20*mm, 12*mm, "Force Tracker - Audit du catalogue d'exercices - 2 août 2026")
    canvas.drawRightString(190*mm, 12*mm, "page %d" % doc.page)
    canvas.setStrokeColor(colors.HexColor('#c8ccd2'))
    canvas.line(20*mm, 15*mm, 190*mm, 15*mm)
    canvas.restoreState()

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20*mm, rightMargin=20*mm,
                        topMargin=18*mm, bottomMargin=20*mm,
                        title="Force Tracker - Audit du catalogue d'exercices",
                        author="Michel / Claude Code", subject="Demande de relecture externe")
h = []
A = h.append

# ─────────────────────────── PAGE 1 ───────────────────────────
A(Paragraph("Audit du catalogue d'exercices", TITRE))
A(Paragraph("Force Tracker &mdash; 2 août 2026 &mdash; document destiné à une relecture externe", STITRE))

A(encadre([
 Paragraph("<b>Pourquoi ce document existe</b>", ENCADRE),
 Paragraph("Michel (le fondateur de Force Tracker) a fait corriger 18 défauts de classification "
   "dans le catalogue d'exercices de son application. Malgré cela, il conserve l'intuition qu'un "
   "problème subsiste : <i>&laquo; je le sens, y'a un truc qui nous a échappé &raquo;</i>. Cette intuition "
   "s'est déjà vérifiée deux fois de suite dans la même journée.", ENCADRE),
 Paragraph("La dernière analyse a conclu que les vérifications internes ont atteint leur limite "
   "structurelle, et que seule une <b>vérification externe</b> peut aller plus loin. Ce document "
   "existe pour permettre cette vérification : il expose la <b>méthode</b> employée, les "
   "<b>résultats</b>, et surtout les <b>limites connues</b> &mdash; afin qu'un autre point de vue "
   "puisse dire ce qui manque.", ENCADRE),
 Paragraph("<b>Ce qu'on attend du relecteur :</b> une critique de la MÉTHODE avant tout, pas une "
   "validation des résultats. Les six questions précises sont en fin de document (section 9).", ENCADRE),
]))
A(Spacer(1, 8))

A(Paragraph("1. Le contexte technique, en une page", H1))
A(Paragraph("Force Tracker est une application web de suivi de musculation (HTML/CSS/JavaScript pur, "
  "sans framework). Elle contient un catalogue de <b>337 exercices</b>. Chaque exercice n'est qu'un "
  "<b>nom</b> et un <b>groupe musculaire</b> ; tout le reste est <b>déduit du nom par des règles</b>.", P))

A(Paragraph("Ce que l'application déduit du nom", H2))
A(tableau([
 ["Information déduite", "Comment", "Valeurs possibles"],
 ["Muscles travaillés", "69 règles (expressions régulières) parcourues <b>dans l'ordre</b> ; "
  "la première qui correspond gagne. Chaque règle donne des muscles <i>principaux</i> et "
  "<i>secondaires</i>.", "17 muscles : " + ", ".join(MOD['muscles'])],
 ["Schéma de mouvement", "Liste de mots-clés, même principe du premier match gagnant.",
  "20 schémas (squat, charnière de hanche, poussée/tirage horizontal et vertical, etc.)"],
 ["Matériel", "Mots-clés dans le nom.", "8 bacs : barre, poids libre, guidé, poids du corps, "
  "élastique, TRX, cardio, polyvalent"],
 ["Dépense calorique", "Déduite du <b>nombre</b> et de la <b>région</b> des muscles trouvés.",
  "MET 4 (isolation) / 5,5 (haut du corps) / 6,5 (bas du corps) / 8 (cardio, haltérophilie)"],
], [40*mm, 70*mm, 55*mm]))

A(Paragraph("<b>Conséquence majeure de cette architecture :</b> le nom d'un exercice n'est pas une "
  "étiquette, c'est une <b>entrée de calcul</b>. Ajouter un mot dans un nom modifie silencieusement "
  "le classement, les calories et l'équilibre de séance. Ce point revient plusieurs fois dans ce "
  "document.", P))

A(Paragraph("Répartition du catalogue", H2))
grp = sorted(MOD['groupes'].items(), key=lambda x: -x[1])
A(tableau([["Groupe (choisi à la main)", "Exercices"]] + [[k, str(v)] for k, v in grp],
          [70*mm, 25*mm]))



# ─────────────────────────── DECLENCHEUR ───────────────────────────
A(Paragraph("2. Le déclencheur", H1))
A(Paragraph("Une testeuse tape <b>&laquo; Tirage horizontal &raquo;</b> dans la liste des exercices. "
  "Réponse de l'application : <b>&laquo; Aucun résultat &raquo;</b>. Or ce terme est le nom exact "
  "d'une des familles de mouvement de l'application, qui classe 33 rowings dedans. Le mot existait, "
  "il n'atteignait simplement pas la recherche.", P))
A(Paragraph("En corrigeant, une question de fond est apparue, posée par Michel : <i>&laquo; c'est le "
  "problème d'avoir des noms en anglais et des noms en français &raquo;</i>. Mesure : sur 337 "
  "exercices, <b>106 noms sont 100 % français, 118 100 % anglais, 141 mélangés</b>. Et surtout, la "
  "trouvabilité penchait au hasard :", P))
A(tableau([
 ["Terme français", "Résultats", "Terme anglais équivalent", "Résultats"],
 ["pompes", "5", "push up", "<b>47</b>"],
 ["tractions", "2", "pull up", "<b>19</b>"],
 ["pont", "1", "glute bridge", "<b>36</b>"],
 ["élévations latérales", "<b>38</b>", "lateral raise", "4"],
], [40*mm, 22*mm, 45*mm, 22*mm]))
A(Paragraph("Puis Michel a formulé la vraie question, celle qui a lancé l'audit : <i>&laquo; il y a "
  "sûrement certains exercices qui ne sont pas dans la bonne catégorie. Est-ce que tu pourrais "
  "chercher sur Internet tout ce que peut faire chaque mouvement et les comparer avec ce qu'on a mis "
  "dans l'application ? &raquo;</i>", P))

# ─────────────────────────── METHODES ───────────────────────────
A(Paragraph("3. Trois méthodes essayées, dont une échouée", H1))

A(Paragraph("Méthode A &mdash; comparaison à une base de données externe : ÉCHEC", H2))
A(Paragraph("Une base publique de 873 exercices avec leurs muscles a été téléchargée et confrontée au "
  "catalogue. <b>Résultat inutilisable</b>, pour trois raisons cumulées :", P))
A(Paragraph("<b>(1) Qualité de la source.</b> Cette base classe le <b>développé couché</b> en "
  "&laquo; triceps &raquo; comme muscle principal, et le <b>farmer's walk</b> correctement mais le "
  "<b>squat au Smith</b> apparié à autre chose. Une source externe non vérifiée est un juge peu fiable.", PC))
A(Paragraph("<b>(2) Vocabulaire plus grossier.</b> Elle dit &laquo; shoulders &raquo; là où "
  "l'application distingue deltoïde antérieur / moyen / postérieur, et &laquo; middle back &raquo; "
  "sans équivalent chez nous. Beaucoup de faux désaccords.", PC))
A(Paragraph("<b>(3) Appariement fragile.</b> Sans contrainte sur le geste, &laquo; Curl Poignet "
  "Barre &raquo; s'appariait à &laquo; Barbell Curl &raquo;. Avec contrainte, la couverture tombait "
  "à 132 exercices sur 337.", PC))
A(Paragraph("<b>Bilan :</b> 28 &laquo; désaccords &raquo; dont, après lecture humaine, environ 3 "
  "réels. Le rapport signal/bruit rendait la méthode inexploitable telle quelle.", P))

A(Paragraph("Méthode B &mdash; audit linéaire des règles", H2))
A(Paragraph("Constat : <b>69 règles couvrent les 337 exercices</b>. Vérifier les règles est donc "
  "5 fois moins de travail que vérifier les exercices, et plus systématique. Les 69 règles ont été "
  "lues une par une, avec la liste des exercices que chacune attrape.", P))
A(Paragraph("<b>Résultat : 4 erreurs</b>, ensuite confirmées par recherche documentaire (voir "
  "section 6).", P))

A(Paragraph("Méthode C &mdash; les croisements (&laquo; en diagonale &raquo;)", H2))
A(Paragraph("Suggérée par Michel sur intuition : <i>&laquo; il faudrait croiser les données comme on "
  "a fait une fois en lineaire et en diagonale &raquo;</i>.", P))
A(encadre([
 Paragraph("<b>Le principe.</b> L'application connaît <b>plusieurs choses indépendantes</b> sur un "
  "même exercice : son groupe (choisi à la main), ses muscles (calculés), son schéma de mouvement, "
  "son terme de recherche anglais, le fichier de son animation, son bac de matériel.", ENCADRE),
 Paragraph("<b>Chacune est plausible isolément. Aucune ne provoque d'erreur.</b> On ne tient un bug "
  "que lorsque <b>deux se contredisent</b>. C'est pourquoi ces défauts étaient totalement invisibles "
  "à la lecture du code comme aux tests existants.", ENCADRE),
]))
A(Paragraph("<b>Résultat : 14 défauts supplémentaires</b> &mdash; soit 3,5 fois plus que la lecture "
  "linéaire.", P))



# ─────────────────────────── LES 6 CROISEMENTS ───────────────────────────
A(Paragraph("4. Les six croisements retenus", H1))
A(tableau([
 ["#", "Ce qu'on confronte", "Ce que revele une contradiction", "Couverture"],
 ["1", "Chaque règle de classement / les exercices qu'elle attrape",
  "Une règle <b>morte</b> : placée après une règle plus large, elle ne se déclenche jamais. Le "
  "classement qu'elle portait n'existe pas.", "<b>337/337</b>"],
 ["2", "Animation / animation",
  "Deux fiches pointant le même fichier vidéo : soit un doublon, soit une animation trompeuse.",
  "282/337 (83 %)"],
 ["3", "Terme anglais / terme anglais",
  "Deux fiches partageant le même terme de recherche : c'est le même exercice sous deux noms.",
  "255/337 (75 %)"],
 ["4", "Groupe choisi à la main / muscles calculés",
  "Un exercice rangé dans un groupe que ses muscles contredisent.", "<b>337/337</b>"],
 ["5", "Schéma de mouvement / muscles calculés",
  "Un mouvement classé &laquo; tirage &raquo; dont les muscles disent &laquo; poussée &raquo;. "
  "Fausse l'équilibre de séance.", "<b>337/337</b>"],
 ["6", "Matériel déduit / mot écrit dans le nom",
  "Un exercice dont le nom dit &laquo; haltère &raquo; mais qui est rangé en machine.",
  "143/337 (42 %)"],
], [7*mm, 42*mm, 76*mm, 27*mm]))
A(Paragraph("Les couvertures de 83 % et 75 % ne sont pas des trous du contrôle mais des <b>trous de "
  "donnée</b> : 55 exercices n'ont pas d'animation, 82 n'ont pas de terme anglais. Le 42 % du "
  "croisement 6 est voulu : on ne juge que si <b>un seul</b> mot de matériel figure dans le nom, "
  "sinon l'attente est ambiguë.", PETIT))

# ─────────────────────────── LES DEFAUTS ───────────────────────────
A(Paragraph("5. Les 18 défauts trouvés et corrigés", H1))
A(Paragraph("Trouvés par la lecture linéaire (4)", H2))
A(tableau([
 ["Exercice", "Ce que disait l'application", "Ce que disent les sources"],
 ["Glute Ham Raise", "lombaires + fessiers principaux, ischios secondaires",
  "<b>ischios</b> (et fessiers) principaux &mdash; c'est l'exercice d'ischios de référence"],
 ["Leg curl (7 fiches)", "ischios <b>et fessiers</b> principaux",
  "ischios principaux ; les fessiers <b>stabilisent</b> seulement"],
 ["Planche latérale", "abdominaux + lombaires principaux, obliques secondaires",
  "<b>obliques</b> principaux (EMG jusqu'à 107 % d'activation)"],
 ["Adduction de cuisses", "fessiers",
  "<b>adducteurs</b> ; une source précise que cela &laquo; ne travaille pas significativement les "
  "fessiers &raquo;"],
], [33*mm, 58*mm, 61*mm]))

A(Paragraph("Trouvés par les croisements (14)", H2))
A(tableau([
 ["Croisement", "Défaut"],
 ["3 (terme anglais)", "<b>4 doublons</b> : Leg Curl Couché = Curl Ischio-jambiers &middot; "
  "Farmer's Walk x2 &middot; Haussements d'Épaules x2 &middot; Tirage Menton = &laquo; Tirage "
  "Vertical (Upright Row) &raquo;"],
 ["2 (animation)", "&laquo; Écarté Haltères &raquo; affichait l'animation d'un écarté <b>décliné</b>"],
 ["5 (schéma)", "<b>Chariot de puissance &mdash; Poussée</b> classé en <i>tirage horizontal</i> : "
  "l'application croyait qu'on avait tiré alors qu'on avait poussé"],
 ["5 (schéma)", "<b>Chariot &mdash; Tirage Épaules</b> classé en tirage horizontal (muscles = deltoïdes)"],
 ["5 (schéma)", "<b>Sled Pull</b> classé en <i>squat</i> (muscles = dorsaux)"],
 ["5 (schéma)", "<b>Jefferson Curl</b> (flexion vertébrale chargée) classé en <i>curl de biceps</i>"],
 ["1 (règle morte)", "La règle du <b>deltoïde postérieur</b> était cachée derrière une plus large : "
  "oiseaux, écartés inversés et face pull recevaient le <b>deltoïde moyen</b> en muscle principal "
  "(10 exercices)"],
 ["1 (règle morte)", "2 autres règles mortes, redondantes (élévation frontale, hip thrust) &mdash; "
  "supprimées"],
 ["4 (groupe)", "&laquo; Good Morning &raquo; rangé dans <i>Dos</i> (muscles = ischios + fessiers)"],
 ["4 (groupe)", "&laquo; Farmer's Walk &raquo; rangé dans <i>Jambes</i> alors que c'est la prise qui limite"],
 ["6 (matériel)", "&laquo; Leg Curl <b>Haltère</b> &raquo; rangé en machine ; &laquo; Montée sur Box "
  "<b>Haltères</b> &raquo; rangée en poids du corps"],
], [28*mm, 124*mm]))
A(Paragraph("Trois de ces défauts (le chariot de puissance) avaient été <b>introduits deux jours plus "
  "tôt</b> par l'ajout de ces exercices : leurs muscles avaient été vérifiés, pas leur schéma de "
  "mouvement.", PETIT))



# ─────────────────────────── VERIF EXTERNE ───────────────────────────
A(Paragraph("6. La vérification externe réellement effectuée", H1))
A(Paragraph("<b>Point important pour le relecteur :</b> la vérification documentaire n'a porté que "
  "sur <b>5 exercices</b>, ceux qui étaient déjà suspects. Elle n'a <b>pas</b> été faite sur les 337.", P))
A(tableau([
 ["Exercice vérifié", "Source consultée", "Verdict"],
 ["Lying leg curl", "NASM, BarBend, PureGym", "Ischios principaux ; fessiers en soutien"],
 ["Glute ham raise", "BarBend, PowerliftingTechnique", "Ischios + fessiers ; combine flexion de genou "
  "et extension de hanche"],
 ["Side plank", "NASM, etudes EMG", "Obliques principaux ; carré des lombes ensuite"],
 ["Hip adduction machine", "PureGym, Physiopedia, Kenhub", "Adducteurs ; pas les fessiers"],
 ["Reverse fly / face pull", "FitnessVolt, Muscle&amp;Strength", "Deltoïde postérieur ; rhomboïdes et "
  "trapèzes ensuite"],
], [38*mm, 45*mm, 69*mm]))

A(Paragraph("7. Ce qui a été mis en place pour que ça ne recommence pas", H1))
A(Paragraph("Une douzième famille de tests automatisés (<font face='Courier'>tests/croises/</font>) "
  "rejoue les six croisements à chaque version et bloque la livraison en cas de contradiction. "
  "<b>Elle a attrapé un 14e défaut dès son premier lancement</b> (le Jefferson Curl). Les 11 autres "
  "familles couvrent les calculs, les dates, les parcours utilisateur, le comportement de l'assistant "
  "conversationnel, etc.", P))
A(Paragraph("Un fichier <font face='Courier'>BUGS.md</font> a également été créé : il catalogue les "
  "bugs du projet <b>par famille et non par date</b>, le constat étant que sur environ 730 versions, "
  "les mêmes 5 ou 6 bugs reviennent sous des déguisements différents (le &laquo; premier match "
  "gagnant &raquo; à lui seul : au moins 12 occurrences).", P))

# ─────────────────────────── LIMITES ───────────────────────────
A(Paragraph("8. Les limites connues &mdash; la partie la plus importante", H1))
A(encadre([
 Paragraph("<b>Limite de fond : un croisement ne détecte qu'une CONTRADICTION.</b>", ENCADRE),
 Paragraph("Si deux sources sont fausses <b>de la même façon</b>, le contrôle se tait. Un exercice "
  "dont le groupe, les muscles et le schéma seraient tous les trois cohérents <b>et tous les trois "
  "faux</b> reste totalement invisible.", ENCADRE),
 Paragraph("C'est précisément la zone que la vérification externe devrait couvrir &mdash; et elle n'a "
  "porté que sur 5 exercices sur 337.", ENCADRE),
], couleur=colors.HexColor('#fdf0ee'), bordure=ROUGE))
A(Spacer(1, 6))
A(Paragraph("Autres limites identifiées", H2))
A(Paragraph("&mdash;&nbsp;<b>Les tables d'attente sont écrites à la main.</b> Le croisement 4 dit par exemple "
  "que le groupe &laquo; Jambes &raquo; accepte quadriceps, fessiers, ischios ou mollets. Si cette "
  "table est trop permissive, de vraies erreurs passent. <b>Personne n'a validé ces tables.</b>", PC))
A(Paragraph("&mdash;&nbsp;<b>55 exercices n'ont pas d'animation</b> et <b>82 n'ont pas de terme anglais</b> : "
  "ils échappent mécaniquement aux croisements 2 et 3.", PC))
A(Paragraph("&mdash;&nbsp;<b>Le classement fin n'est pas vérifié.</b> L'application distingue trois portions "
  "du deltoïde ; aucune source consultée n'a été utilisée pour arbitrer systématiquement laquelle "
  "domine, exercice par exercice.", PC))
A(Paragraph("&mdash;&nbsp;<b>La hiérarchie principal/secondaire est binaire.</b> Un muscle est &laquo; 2 &raquo; "
  "ou &laquo; 1 &raquo;. La réalité est continue, et les sources se contredisent souvent sur ce point.", PC))
A(Paragraph("&mdash;&nbsp;<b>Les calories dépendent des muscles.</b> Corriger une attribution musculaire "
  "déplace donc la dépense estimée. Un cas a été traité explicitement (farmer's walk, qui serait passé "
  "de 6,5 à 5,5 MET) &mdash; mais rien ne garantit qu'il n'y en ait pas d'autres.", PC))
A(Paragraph("&mdash;&nbsp;<b>Un doute assumé :</b> l'adduction de cuisses reste classée &laquo; fessiers &raquo; "
  "alors que les sources disent &laquo; adducteurs &raquo;. Corriger demande d'ajouter un muscle à la "
  "silhouette anatomique affichée : décision produit non tranchée.", PC))



# ─────────────────────────── QUESTIONS ───────────────────────────
A(Paragraph("9. Les six questions posées au relecteur", H1))
A(Paragraph("L'intuition de Michel &mdash; <i>&laquo; je le sens, y'a un truc qui nous a échappé &raquo;</i> "
  "&mdash; s'est déjà vérifiée deux fois dans la même journée. Ces questions cherchent à savoir ce "
  "qu'elle vise encore.", P))

A(Paragraph("Q1. Quels croisements MANQUENT ?", QUEST))
A(Paragraph("Six diagonales ont été retenues (section 4). Y en a-t-il d'évidentes qui ont été "
  "oubliées ? Exemples de pistes non explorées : le <b>nom du fichier d'animation</b> comparé au "
  "<b>nom de l'exercice</b> (c'est ce qui a révélé un doublon par hasard) ; le <b>groupe</b> comparé "
  "au <b>schéma de mouvement</b> ; la <b>cohérence interne des règles</b> (deux règles qui donneraient "
  "des muscles différents au même mot-clé).", P))

A(Paragraph("Q2. L'architecture &laquo; tout se déduit du nom &raquo; est-elle le vrai problème ?", QUEST))
A(Paragraph("Six des dix-huit défauts viennent directement du fait qu'un mot dans un nom pilote "
  "silencieusement un calcul. Faut-il conserver cette architecture en la contrôlant mieux, ou basculer "
  "vers des <b>attributs explicites</b> par exercice (muscles, schéma, matériel saisis et non déduits) ? "
  "Contrainte à prendre en compte : ce sont 337 fiches à renseigner à la main, et l'historique des "
  "utilisateurs est indexé <b>par nom d'exercice</b>.", P))

A(Paragraph("Q3. Comment vérifier l'anatomie des 337 sans 337 recherches ?", QUEST))
A(Paragraph("Vérifier les <b>69 règles</b> plutôt que les 337 exercices divise le travail par cinq &mdash; "
  "mais suppose que chaque exercice tombe sur la bonne règle, ce qui est justement le bug le plus "
  "fréquent. Y a-t-il une stratégie plus solide ? Une source de référence qui soit réellement fiable "
  "sur la hiérarchie principal/secondaire ?", P))

A(Paragraph("Q4. Les tables d'attente sont-elles trop permissives ?", QUEST))
A(Paragraph("Elles définissent ce qu'un groupe ou un schéma &laquo; a le droit &raquo; d'avoir comme "
  "muscles. Elles n'ont été validées par personne. Une table trop large rend le contrôle décoratif : "
  "il passe au vert sans rien garantir. Comment calibrer cela honnêtement ?", P))

A(Paragraph("Q5. Que faire des cas où les sources se contredisent ?", QUEST))
A(Paragraph("Exemple rencontré : le <b>développé couché</b> est donné &laquo; pectoraux &raquo; par la "
  "quasi-totalité des sources, et &laquo; triceps &raquo; par la base de données consultée. Le "
  "<b>pull-over</b> est donné tantôt dorsaux, tantôt pectoraux. Quelle règle d'arbitrage adopter, "
  "sachant que l'application doit trancher pour colorier une silhouette ?", P))

A(Paragraph("Q6. Y a-t-il un angle mort de MÉTHODE ?", QUEST))
A(Paragraph("Le projet tient une liste de ses propres erreurs de méthode : un contrôle négatif à zéro "
  "échec parce que le test <i>plantait</i> au lieu d'échouer ; une vérification sur 9 archétypes "
  "présentée comme une vérification du catalogue ; l'affirmation qu'une fonctionnalité manquait alors "
  "qu'elle existait depuis trois semaines. <b>Quel biais de ce type est encore à l'&oelig;uvre dans "
  "l'audit décrit ici ?</b>", P))

A(Spacer(1, 10))
A(encadre([
 Paragraph("<b>Ce qui serait le plus utile en retour</b>", ENCADRE),
 Paragraph("Une critique de la <b>démarche</b> plutôt qu'une liste de corrections anatomiques. "
  "Concrètement : quels croisements ajouter, quelles hypothèses de la méthode sont fragiles, et "
  "surtout &mdash; <b>quelle catégorie d'erreur ce dispositif est-il structurellement incapable de "
  "voir ?</b>", ENCADRE),
]))



# ─────────────────────────── ANNEXES ───────────────────────────
A(PageBreak())
A(Paragraph("Annexe A &mdash; Les 20 schémas de mouvement", H1))
A(Paragraph("Nombre d'exercices classés dans chacun. Un schéma est déduit du nom, par mots-clés, "
  "premier match gagnant.", PETIT))
pats = [p for p in MOD['patterns']]
lignes = [["Identifiant", "Libellé", "Exercices"]] + [[p['id'], p['label'], str(p['n'])] for p in pats]
A(tableau(lignes, [42*mm, 78*mm, 22*mm]))

A(Paragraph("Annexe B &mdash; Répartition par matériel", H1))
eq = sorted(MOD['equip'].items(), key=lambda x: -x[1])
NOMS_EQ = {'guide':'Guide (machines, poulies)', 'barre':'Barre', 'libre':'Poids libre (haltères, kettlebell)',
           'corps':'Poids du corps', 'autre':'Polyvalent / non déterminé', 'elast':'Élastique',
           'cardio':'Cardio / conditionnement', 'trx':'TRX, sangles'}
A(tableau([["Bac", "Exercices"]] + [[NOMS_EQ.get(k, k), str(v)] for k, v in eq], [80*mm, 25*mm]))

A(Paragraph("Annexe C &mdash; Extrait des règles de classification musculaire", H1))
A(Paragraph("Les 69 règles sont parcourues dans l'ordre ; la première qui correspond gagne. Voici les "
  "15 premières et les 8 dernières, pour donner à voir la structure. La toute dernière est un "
  "rattrapage générique : toute règle placée après elle serait morte.", PETIT))
def courte(re_str, n=58):
    s = re_str.strip('/i').strip('/')
    return (s[:n] + '...') if len(s) > n else s
sel = MOD['regles'][:15]
lignes = [["#", "Motif (extrait)", "Muscles principaux", "Secondaires"]]
lignes += [[str(r['i']), courte(r['re']), r['p'] or '-', r['s'] or '-'] for r in sel]
A(tableau(lignes, [8*mm, 72*mm, 40*mm, 42*mm]))
A(Spacer(1, 5))
A(Paragraph("... (règles 15 à 60 omises) ...", PETIT))
lignes = [["#", "Motif (extrait)", "Muscles principaux", "Secondaires"]]
lignes += [[str(r['i']), courte(r['re']), r['p'] or '-', r['s'] or '-'] for r in MOD['regles'][-8:]]
A(tableau(lignes, [8*mm, 72*mm, 40*mm, 42*mm]))

A(Spacer(1, 12))
A(Paragraph("Document généré automatiquement depuis le code source de l'application le 2 août 2026. "
  "Les chiffres (337 exercices, 69 règles, 17 muscles, 20 schémas) sont lus dans l'application, pas "
  "saisis à la main.", PETIT))

doc.build(h, onFirstPage=pied, onLaterPages=pied)
print("PDF ecrit :", OUT, os.path.getsize(OUT), "octets")
