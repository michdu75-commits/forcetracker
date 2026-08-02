# -*- coding: utf-8 -*-
"""DOSSIER COMPLET pour relecture externe — Force Tracker, 2 août 2026."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
import json, os

SC = '/tmp/claude-0/-home-user-forcetracker/12f61d67-fd14-50ef-8709-99418240fb44/scratchpad'
MOD = json.load(open(SC + '/modele.json'))
OUT = '/home/user/forcetracker/docs/DOSSIER-COMPLET-RELECTURE-2026-08-02.pdf'

BLEU = colors.HexColor('#1f4e79'); ROUGE = colors.HexColor('#c0392b')
GRIS = colors.HexColor('#555555'); FOND = colors.HexColor('#f2f4f7')
VERT = colors.HexColor('#1e7d44')

ss = getSampleStyleSheet()
def S(n, **k):
    base = k.pop('parent', ss['Normal']); return ParagraphStyle(n, parent=base, **k)
TITRE = S('t', parent=ss['Title'], fontSize=22, leading=26, textColor=BLEU, spaceAfter=4)
STITRE= S('st', fontSize=11.5, leading=15, textColor=GRIS, alignment=TA_CENTER, spaceAfter=14)
H0 = S('h0', fontSize=17, leading=20, textColor=colors.white, spaceBefore=4, spaceAfter=10,
       fontName='Helvetica-Bold', backColor=BLEU, borderPadding=(7,8,7,8), leading2=0)
H1 = S('h1', fontSize=14, leading=17, textColor=BLEU, spaceBefore=14, spaceAfter=6, fontName='Helvetica-Bold')
H2 = S('h2', fontSize=11.3, leading=14, spaceBefore=10, spaceAfter=4, fontName='Helvetica-Bold')
P  = S('p', fontSize=9.6, leading=13.4, alignment=TA_JUSTIFY, spaceAfter=6)
PC = S('pc', parent=P, spaceAfter=3)
PETIT = S('pt', fontSize=8.2, leading=10.8, textColor=GRIS, spaceAfter=5)
CELL = S('cl', fontSize=8.2, leading=10.3)
CELLB= S('cb', parent=CELL, fontName='Helvetica-Bold')
CODE = S('co', fontSize=8.1, leading=11, fontName='Courier', leftIndent=6, spaceAfter=5)
ENC  = S('en', fontSize=9.5, leading=13, leftIndent=8, rightIndent=8, spaceBefore=3, spaceAfter=3, alignment=TA_JUSTIFY)
CITE = S('ci', fontSize=9.8, leading=13.4, leftIndent=12, rightIndent=12, textColor=BLEU,
         fontName='Helvetica-Oblique', spaceBefore=4, spaceAfter=7)
QUEST= S('q', fontSize=10.4, leading=14, fontName='Helvetica-Bold', textColor=ROUGE, spaceBefore=10, spaceAfter=3)

def tab(rows, widths, entete=True):
    data = [[Paragraph(str(c), CELLB if (entete and i == 0) else CELL) for c in r] for i, r in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1 if entete else 0)
    st = [('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#c8ccd2')),
          ('LEFTPADDING',(0,0),(-1,-1),4),('RIGHTPADDING',(0,0),(-1,-1),4),
          ('TOPPADDING',(0,0),(-1,-1),3.2),('BOTTOMPADDING',(0,0),(-1,-1),3.2)]
    if entete: st.append(('BACKGROUND',(0,0),(-1,0),colors.HexColor('#dde3ea')))
    for r in range(1 if entete else 0, len(data)):
        if r % 2 == (1 if entete else 0): st.append(('BACKGROUND',(0,r),(-1,r),colors.HexColor('#fafbfc')))
    t.setStyle(TableStyle(st)); return t

def enc(paras, fond=FOND, bord=BLEU):
    t = Table([[p] for p in paras], colWidths=[165*mm])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),fond),('BOX',(0,0),(-1,-1),0.9,bord),
        ('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),
        ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)])); return t

def partie(num, titre):
    t = Table([[Paragraph("PARTIE %s &mdash; %s" % (num, titre), S('hp', fontSize=13.5, leading=16,
        textColor=colors.white, fontName='Helvetica-Bold'))]], colWidths=[165*mm])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),BLEU),('LEFTPADDING',(0,0),(-1,-1),10),
        ('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
    return t

def pied(cv, doc):
    cv.saveState(); cv.setFont('Helvetica', 7.5); cv.setFillColor(GRIS)
    cv.drawString(20*mm, 12*mm, "Force Tracker — Dossier complet pour relecture externe — 2 août 2026")
    cv.drawRightString(190*mm, 12*mm, "page %d" % doc.page)
    cv.setStrokeColor(colors.HexColor('#c8ccd2')); cv.line(20*mm, 15*mm, 190*mm, 15*mm); cv.restoreState()

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20*mm, rightMargin=20*mm, topMargin=17*mm,
    bottomMargin=20*mm, title="Force Tracker — Dossier complet pour relecture externe",
    author="Michel / Claude Code", subject="Tous les éléments nécessaires à une analyse externe")
h=[]; A=h.append

# ═══════════════ COUVERTURE ═══════════════
A(Spacer(1, 18))
A(Paragraph("Force Tracker", TITRE))
A(Paragraph("Dossier complet pour relecture externe<br/>2 août 2026", STITRE))
A(Spacer(1, 6))
A(enc([
 Paragraph("<b>À quoi sert ce dossier</b>", ENC),
 Paragraph("Michel, fondateur de Force Tracker, souhaite un <b>avis extérieur objectif</b> sur la "
  "fiabilité de son application. Deux documents partiels lui ont déjà été remis ; ils ont produit "
  "une analyse faussée, faute de contexte. Sa consigne : <i>&laquo; s'il n'a pas tous les éléments "
  "à sa disposition, il ne pourra pas analyser correctement le problème, il ne pourra pas faire un "
  "retour objectif &raquo;</i>.", ENC),
 Paragraph("Ce dossier <b>remplace</b> les deux précédents. Il est autonome : aucune connaissance "
  "préalable du projet n'est nécessaire.", ENC),
]))
A(Spacer(1, 10))
A(enc([
 Paragraph("<b>Statut des informations</b>", ENC),
 Paragraph("Tout chiffre de ce dossier est une <b>sortie de programme</b> : le code est exécuté "
  "dans un navigateur réel et interrogé. Rien n'est estimé ni recopié de mémoire. Quand une "
  "information n'a <b>pas</b> été vérifiée, c'est écrit explicitement.", ENC),
 Paragraph("<b>Attention aux dates</b> : plusieurs correctifs importants ont été livrés <b>dans la "
  "journée du 2 août</b>. Une observation faite le matin peut être exacte et périmée l'après-midi. "
  "Les numéros de version (ft-vNNN) permettent de dater chaque affirmation.", ENC),
], fond=colors.HexColor('#fdf6e8'), bord=colors.HexColor('#b8860b')))

A(Spacer(1, 12))
A(Paragraph("Sommaire", H1))
A(tab([
 ["Partie", "Contenu", "Pourquoi c'est nécessaire"],
 ["I", "Le produit et sa philosophie", "Sans l'intention, on juge mal les compromis"],
 ["II", "L'architecture technique", "Contraintes réelles (pas de framework, pas de base de données)"],
 ["III", "Le modèle des exercices", "Le cœur du problème soumis"],
 ["IV", "Milo, l'assistant conversationnel", "Ce qu'il reçoit vraiment, mesuré"],
 ["V", "Les données de l'utilisateur", "Stockage, synchronisation, restauration"],
 ["VI", "Le dispositif de vérification", "12 familles de tests — ce qu'elles couvrent et ne couvrent pas"],
 ["VII", "La méthode de travail du projet", "Règles, journal, catalogue de bugs"],
 ["VIII", "L'audit du 2 août : méthode et résultats", "3 méthodes, dont une échouée"],
 ["VIII bis", "Analyse causale des 19 défauts", "Données ? règles ? modèle ? cas isolé ?"],
 ["VIII ter", "Confiance, audit des règles, empreinte", "82 % sans ambiguïté · 18 % dépendants de l'ordre"],
 ["VIII quater", "L'identifiant stable, étape 1/3", "La dette principale, entamée le soir même"],
 ["IX", "Les limites connues, mesurées", "La partie la plus importante"],
 ["X", "Les questions posées au relecteur", "9 questions"],
], [14*mm, 68*mm, 78*mm]))

A(PageBreak())

# ═══════════════ I ═══════════════
A(partie("I", "Le produit et sa philosophie"))
A(Spacer(1, 6))
A(Paragraph("Force Tracker est une application web de suivi de musculation, utilisée sur téléphone. "
  "Elle est née le 17 juin 2026 et compte aujourd'hui environ <b>730 versions livrées</b>. Elle est "
  "utilisée par son auteur et une poignée de testeurs réels (Christophe, Tatiana, Emma, Eline) ; "
  "elle n'est pas encore ouverte au public.", P))
A(Paragraph("Michel <b>n'est ni développeur ni programmeur</b>. Il conçoit le produit, teste, arbitre. "
  "Le code est écrit par un assistant IA sous sa direction. Cela explique deux choses : la "
  "gouvernance écrite très dense (partie VII), et le fait que les décisions produit soient toujours "
  "les siennes.", P))

A(Paragraph("La phrase qui tient lieu de cap", H2))
A(Paragraph("&laquo; Force Tracker n'est pas une intelligence artificielle. C'est une mémoire "
  "sportive intelligente. &raquo;<br/>&laquo; Il ne te dit pas qui tu dois devenir, il se souvient "
  "de qui tu es devenu. &raquo;", CITE))
A(Paragraph("Ce cap a des conséquences techniques directes, qu'il faut avoir en tête pour juger les "
  "compromis : la <b>mémoire longue</b> est une fonctionnalité centrale et non un bonus ; la "
  "<b>perte de données</b> est traitée comme la faute la plus grave possible ; et l'assistant doit "
  "<b>observer avant de conseiller</b>.", P))

A(Paragraph("Les 12 règles d'or du projet", H2))
A(Paragraph("Elles sont relues à chaque session de travail. Trois concernent directement le sujet "
  "soumis (n° 3, 10, 12).", PETIT))
A(tab([
 ["#", "Règle"],
 ["1", "Apps Script : toujours redéployer après un changement de code"],
 ["2", "Premium : ne jamais écraser la liste des accès"],
 ["3", "<b>Zéro perte de séance — priorité n° 1 absolue</b>"],
 ["4", "Ouverture instantanée à la salle, même hors ligne"],
 ["5", "Incrémenter le numéro de version à chaque déploiement"],
 ["6", "Avant toute opération risquée : sauvegarde et branche"],
 ["7", "Garder l'identité visuelle ; une chose à la fois, testée"],
 ["8", "Commit étiqueté avant, tag stable après, retour arrière en une ligne"],
 ["9", "Le bouton central de l'écran Séance est sensible : vérifier son positionnement"],
 ["10", "<b>Michel n'est ni développeur ni programmeur : expliquer simplement, prévenir avant tout risque</b>"],
 ["11", "À chaque fonctionnalité livrée : informer l'utilisateur (point rouge, aide, guide)"],
 ["12", "<b>Tenir tous les fichiers de suivi à jour en temps réel</b>"],
], [8*mm, 149*mm]))

# ═══════════════ II ═══════════════
A(Spacer(1, 10))
A(partie("II", "L'architecture technique"))
A(Spacer(1, 6))
A(Paragraph("<b>Contrainte fondamentale : il n'y a ni framework, ni étape de compilation, ni base "
  "de données relationnelle.</b> C'est du HTML, du CSS et du JavaScript servis tels quels. Cette "
  "contrainte est assumée (démarrage instantané, fonctionnement hors ligne) mais elle explique "
  "beaucoup de choix qui paraîtraient étranges dans un projet classique.", P))
A(tab([
 ["Fichier", "Rôle", "Lignes"],
 ["index.html", "Structure de toutes les pages (application mono-page)", "2 690"],
 ["style.css", "Totalité du style, thèmes clair et sombre", "1 360"],
 ["constants.js", "<b>Le catalogue des exercices</b>, les groupes, les nouveautés", "480"],
 ["state.js", "L'objet d'état global, chargement et sauvegarde locale, calculs nutritionnels", "824"],
 ["app.js", "Démarrage, nutrition, cardio, calories, panneau d'administration", "3 333"],
 ["screens.js", "Navigation, écran d'accueil, aides contextuelles", "1 917"],
 ["log.js", "<b>Écran séance, classification des exercices, moteur des muscles</b>", "5 471"],
 ["coach.js", "<b>Milo : construction du contexte, envoi, garde-fous</b>", "3 561"],
 ["setup.js", "Profil, progrès, graphiques, <b>synchronisation et restauration</b>", "2 461"],
 ["tracking.js", "Cycle de force, badges, récupération, notifications", "2 420"],
 ["sw.js", "Cache hors ligne (Service Worker), versionné à chaque livraison", "267"],
 ["Code.js", "<b>Serveur</b> (Google Apps Script) : sauvegarde, IA, premium", "2 298"],
], [26*mm, 105*mm, 18*mm]))
A(Paragraph("<b>Le serveur est un script Google Apps Script</b> adossé à une feuille de calcul et à "
  "des « propriétés de script » (un magasin clé-valeur de <b>512 Ko au total, partagé par tous les "
  "comptes</b>). Ce plafond a déjà provoqué une panne réelle (partie IX). Les comptes y sont stockés "
  "compressés. L'hébergement de l'application est GitHub Pages ; le déploiement est automatique à "
  "chaque envoi de code.", P))

A(PageBreak())

# ═══════════════ III ═══════════════
A(partie("III", "Le modèle des exercices — le cœur du sujet"))
A(Spacer(1, 6))
A(Paragraph("<b>Une fiche d'exercice contient exactement deux champs.</b> Mesuré sur les 375 entrées "
  "du catalogue (337 noms uniques ; certains apparaissent dans deux groupes) :", P))
A(Paragraph("n : le nom de l'exercice&nbsp;&nbsp;&nbsp;&nbsp;g : le groupe musculaire", CODE))
A(Paragraph("<b>Il n'existe aucun identifiant.</b> Tout le reste est <b>recalculé à la volée à "
  "partir du nom</b>, à chaque affichage :", P))
A(tab([
 ["Information déduite", "Mécanisme", "Résultat possible"],
 ["Muscles travaillés", "<b>69 règles</b> (expressions régulières) parcourues <b>dans l'ordre</b> ; "
  "la première qui correspond gagne et donne des muscles <i>principaux</i> et <i>secondaires</i>.",
  "17 muscles : " + ", ".join(MOD['muscles'])],
 ["Schéma de mouvement", "Liste de mots-clés, même principe.", "20 schémas (squat, charnière de "
  "hanche, poussée / tirage horizontal et vertical, gainage, porté, cardio…)"],
 ["Matériel", "Mots-clés dans le nom.", "8 catégories (barre, poids libre, guidé, poids du corps, "
  "élastique, sangles, cardio, polyvalent)"],
 ["Dépense calorique", "Déduite du <b>nombre</b> et de la <b>région</b> des muscles trouvés.",
  "MET 4 (isolation) · 5,5 (haut du corps) · 6,5 (bas du corps) · 8 (cardio, haltérophilie)"],
 ["Rôle dans un programme", "Déduit du schéma de mouvement.", "« ancre » (mouvement principal) ou "
  "« accessoire »"],
], [30*mm, 68*mm, 57*mm]))

A(enc([
 Paragraph("<b>Conséquence à garder en tête pour toute la suite</b>", ENC),
 Paragraph("Le nom d'un exercice n'est pas une étiquette d'affichage : c'est à la fois "
  "<b>l'entrée de cinq calculs</b> et <b>la clé primaire de l'historique</b>. Ajouter un mot dans un "
  "nom modifie donc silencieusement des statistiques, et renommer un exercice casse le lien avec le "
  "passé si aucune migration n'est écrite.", ENC),
], fond=colors.HexColor('#fdf0ee'), bord=ROUGE))

A(Paragraph("Répartition du catalogue", H2))
grp = sorted(MOD['groupes'].items(), key=lambda x: -x[1])
lignes = [["Groupe (choisi à la main)", "Exercices"]] + [[k, str(v)] for k, v in grp]
A(tab(lignes, [60*mm, 22*mm]))
A(Paragraph("Qualité du classement : <b>317 exercices sur 337 (94 %)</b> sont classés par une règle "
  "<b>précise</b> ; seulement <b>20 (6 %)</b> par une règle de rattrapage large. Moyenne de "
  "<b>1,66 muscle principal</b> et <b>1,96 muscle secondaire</b> par exercice.", P))

A(PageBreak())

# ═══════════════ IV ═══════════════
A(partie("IV", "Milo — l'assistant conversationnel"))
A(Spacer(1, 6))
A(Paragraph("Milo est un modèle de langage (Claude) appelé via le serveur. Il n'a <b>aucune mémoire "
  "propre</b> : tout ce qu'il sait lui est envoyé à chaque message, dans un contexte reconstruit à "
  "la volée. <b>C'est donc la composition de ce contexte qui détermine son intelligence apparente.</b>", P))

A(Paragraph("Composition mesurée du contexte", H2))
A(Paragraph("Mesure sur un profil réaliste : <b>57 954 caractères</b> répartis en 18 blocs.", PETIT))
A(tab([
 ["Bloc", "Taille", "Part", "Nature"],
 ["TA PERSONNALITÉ", "19 716", "34 %", "Instructions de comportement"],
 ["PROFIL ATHLÈTE", "11 292", "19 %", "Instructions + données"],
 ["SE SOUVENIR DE LA PROCHAINE SÉANCE", "9 031", "15 %", "Instructions (format de sortie)"],
 ["NUTRITION", "6 808", "11 %", "Instructions"],
 ["COHÉRENCE AVANT RÉACTIVITÉ", "1 808", "3 %", "Instructions"],
 ["PERTINENCE AVANT DISPONIBILITÉ", "1 796", "3 %", "Instructions"],
 ["MÉMOIRE DURABLE", "1 563", "2 %", "Instructions"],
 ["MÉTHODE DE COACHING", "1 333", "2 %", "Instructions"],
 ["<i>(10 autres blocs)</i>", "&mdash;", "&mdash;", "Mixte"],
], [60*mm, 22*mm, 16*mm, 52*mm]))
A(Paragraph("<b>Sur ces 57 954 caractères, environ 2 400 (4 %) sont des données sur la personne.</b> "
  "Le reste est constitué d'instructions. Ce déséquilibre a été mesuré fin juillet ; une réduction "
  "des instructions a été envisagée puis <b>abandonnée sur décision de Michel</b> : <i>&laquo; tu me "
  "fais flipper là, parce que franchement Milo il est au top &raquo;</i>. Rien n'était cassé, le "
  "budget n'était pas saturé : retirer des règles qui fonctionnent aurait été un risque pur.", P))

A(Paragraph("La mémoire de l'historique — point souvent mal compris", H2))
A(Paragraph("<b>Milo n'est pas limité aux cinq dernières séances.</b> Il reçoit deux blocs de "
  "nature différente :", P))
A(tab([
 ["Bloc", "Contenu", "Portée"],
 ["Séances détaillées", "Chaque série, chaque charge, chaque répétition", "<b>5 dernières</b>"],
 ["Parcours depuis l'inscription", "Ancienneté, nombre total de séances, régularité hebdomadaire, "
  "<b>plus longue coupure</b>, volume cumulé, progression estimée par exercice", "<b>Tout l'historique</b>"],
], [36*mm, 89*mm, 32*mm]))
A(Paragraph("Sortie réelle, mesurée sur un profil de 91 séances comportant un arrêt de trois mois :", PETIT))
A(Paragraph("PARCOURS DEPUIS L'INSCRIPTION :<br/>"
  "- Première séance enregistrée : 19 août 2025 (il y a 348 jours) &middot; 91 séances au total<br/>"
  "- Régularité : 1,8 séance par semaine en moyenne &middot; <b>plus longue coupure : 91 jours "
  "(reprise le 13 juillet 2026)</b><br/>"
  "- Volume cumulé : 188 tonnes soulevées depuis le début<br/>"
  "- Progression : Squat à la Barre : 90 &ndash;&gt; 113 kg estimés (+25 %, 91 séances)", CODE))
A(Paragraph("Coût : environ <b>650 caractères</b> (1 % du contexte), construit en 14 ms sur "
  "366 séances. Ce bloc a été livré le <b>2 août à la mi-journée</b> (version ft-v727). "
  "<b>Avant cette date, la limitation aux cinq séances était réelle.</b>", P))

A(PageBreak())

# ═══════════════ V ═══════════════
A(partie("V", "Les données de l'utilisateur"))
A(Spacer(1, 6))
A(Paragraph("Structure d'une séance enregistrée", H2))
A(Paragraph("séance : { date, exs[], vol }<br/>"
  "exercice : { name, sets[], note }<br/>"
  "série&nbsp;&nbsp;&nbsp;: { kg, reps, done, type, rm1 }", CODE))
A(Paragraph("<b>Point capital : les muscles ne sont pas enregistrés.</b> Une séance ne stocke que le "
  "<b>nom</b> de l'exercice ; les muscles sont recalculés à chaque affichage. Corriger une règle "
  "aujourd'hui change donc rétroactivement ce que les séances d'il y a un an « ont travaillé ». "
  "Utile pour propager un correctif, gênant pour la reproductibilité des statistiques.", P))

A(Paragraph("Stockage et synchronisation", H2))
A(tab([
 ["Niveau", "Support", "Capacité / limite"],
 ["Local (prioritaire)", "Stockage du navigateur, 126 clés préfixées <font face='Courier'>ft4_</font>",
  "Jusqu'à 1 500 séances ; quota du navigateur"],
 ["Cloud", "Propriétés du script Google, compte compressé", "512 Ko <b>partagés par tous les comptes</b>"],
 ["Sauvegarde", "Fichiers JSON sur Google Drive, tâche nocturne quotidienne", "Sans limite pratique"],
], [30*mm, 75*mm, 52*mm]))
A(Paragraph("Le principe est <b>local d'abord</b> : on enregistre sur le téléphone avant toute "
  "synchronisation, et le réseau ne doit jamais bloquer ni faire perdre une donnée. À la "
  "restauration, l'application prend <b>la version la plus complète</b> entre le local et le cloud.", P))

A(Paragraph("Le défaut de perte de données corrigé le 2 août", H2))
A(Paragraph("Trouvé en vérifiant une inquiétude de Michel sur la mémoire. Il est instructif parce "
  "qu'<b>aucune de ses quatre étapes n'est absurde</b> :", P))
A(tab([
 ["Étape", "Comportement", "Jugement isolé"],
 ["1", "Le stockage du téléphone sature : l'application réduit l'historique <b>local</b> à 50 séances "
  "et affiche <i>&laquo; tes séances restent sauvegardées dans le cloud &raquo;</i>", "Raisonnable "
  "(évite un plantage)"],
 ["2", "Au redémarrage, l'application ne relit que ces 50 séances", "Cohérent"],
 ["3", "À la sauvegarde suivante, elle envoie ces 50 séances au serveur", "Comportement normal"],
 ["4", "Le garde-fou serveur ne refusait que les envois <b>vides</b> : 50 séances remplaçaient 500, "
  "<b>en silence</b>", "<b>Destruction de données</b>"],
], [12*mm, 100*mm, 45*mm]))
A(Paragraph("Le message de l'étape 1 devenait <b>faux</b> à l'étape 4, et <b>rien ne traçait "
  "l'événement</b> — il était donc impossible de savoir s'il s'était produit. Corrigé (ft-v732) par "
  "trois barrières : un drapeau qui suspend l'envoi tant que la copie locale est incomplète · un "
  "garde-fou serveur qui refuse tout rétrécissement brutal · une trace remontée dans le tableau de "
  "santé, <i>parce qu'une alerte qui ne remonte nulle part ne sert à personne</i>.", P))

A(PageBreak())

# ═══════════════ VI ═══════════════
A(partie("VI", "Le dispositif de vérification"))
A(Spacer(1, 6))
A(Paragraph("Douze familles de tests automatisés tournent avant chaque livraison, dans un navigateur "
  "réel (Chromium sans interface). Une famille rouge <b>bloque la livraison</b>. Le principe "
  "directeur : <b>chaque bug découvert devient un scénario de test permanent</b>.", P))
A(tab([
 ["Famille", "Ce qu'elle protège", "Volume"],
 ["milo", "Noyau dur : scénarios conversationnels critiques", "10 scénarios"],
 ["anneau", "Affichage de la récupération, régions musculaires", "110 tests"],
 ["calendrier", "Couleurs et agrégats du calendrier", "10 tests"],
 ["calendrier-milo", "Ce que Milo sait du calendrier (jours, dates)", "24 tests"],
 ["questionnaire", "Parcours d'inscription", "18 tests"],
 ["discussions", "Contexte conversationnel, mémoire, coût du contexte", "36 tests"],
 ["dates", "<b>Interdit d'utiliser l'heure de Greenwich pour la date du jour</b>", "7 tests"],
 ["donnees", "<b>Chaque donnée doit être classée face à Milo</b> (transmise / exclue avec raison / trou connu)", "garde-fou"],
 ["calculs", "Calculs isolés : calories, macros, récupération, 1RM", "124 tests"],
 ["parcours", "Parcours utilisateur complets de bout en bout", "128 tests"],
 ["muscles", "Classification musculaire sur <b>tout</b> le catalogue", "117 tests"],
 ["croises", "<b>Contradictions entre sources</b> (créée le 2 août)", "31 tests"],
], [26*mm, 105*mm, 26*mm]))
A(Paragraph("<b>Deux garde-fous méritent d'être signalés</b> car ils sont inhabituels :", P))
A(Paragraph("&mdash;&nbsp;<b>La famille « donnees »</b> lit toutes les données chargées par l'application "
  "et exige que chacune soit <b>classée</b> : transmise à Milo, exclue avec la raison écrite, ou "
  "trou connu. Une donnée non classée fait échouer la livraison. Elle a bloqué une livraison le "
  "2 août encore. Motif de sa création : la même erreur (une donnée collectée mais jamais transmise) "
  "s'était produite <b>cinq fois</b>, et l'oubli est <b>silencieux</b> — il ne casse rien, il rend "
  "seulement les réponses un peu moins bonnes.", PC))
A(Paragraph("&mdash;&nbsp;<b>Le contrôle négatif systématique</b> : avant chaque livraison, les fichiers "
  "modifiés sont mis de côté et les tests relancés — ils <b>doivent</b> échouer. Un test qui reste "
  "vert sans le correctif ne prouve rien.", PC))

A(PageBreak())

# ═══════════════ VII ═══════════════
A(partie("VII", "La méthode de travail du projet"))
A(Spacer(1, 6))
A(Paragraph("Ce point est inclus parce qu'il fait partie de ce qui est soumis au jugement : la "
  "fiabilité vient autant de la méthode que du code.", P))
A(tab([
 ["Document", "Rôle", "Taille"],
 ["CLAUDE.md", "Page d'accueil du projet : règles d'or, architecture, journal récent", "14 600 mots"],
 ["docs/JOURNAL-ARCHIVE.md", "Journal complet des ~730 versions, avec le <i>pourquoi</i> de chacune", "108 500 mots"],
 ["docs/REGLES-ARCHITECTURE.md", "<b>30 règles de conception</b>, chacune née d'un incident réel", "3 900 mots"],
 ["CONSTITUTION-MILO.md", "Principes de comportement envers la personne (éthique, sécurité)", "5 900 mots"],
 ["BUGS.md", "<b>Catalogue des bugs par FAMILLE</b> (créé le 2 août)", "3 400 mots"],
 ["docs/REGLES-OR.md", "Les 12 règles d'or en version longue", "1 400 mots"],
], [46*mm, 90*mm, 21*mm]))

A(Paragraph("Les règles de conception les plus pertinentes ici", H2))
A(tab([
 ["Règle", "Énoncé", "Née de"],
 ["R4", "L'information doit descendre jusqu'à la <b>donnée</b>, jamais rester dans le texte",
  "5 bugs où Milo raisonnait juste sans que ça atteigne l'application"],
 ["R8", "Un prompt ne compense <b>jamais</b> une donnée absente", "Le prompt citait une source qu'on "
  "ne lui envoyait pas"],
 ["R14", "Un comportement copié d'un contexte à un autre peut devenir faux", "Pré-remplissage de charges"],
 ["R17", "Chaque bug découvert devient un scénario de test permanent", "Framework de tests"],
 ["R23", "Une fonctionnalité livrée sans entrée de journal devient <b>invisible</b>", "Une fonctionnalité "
  "déclarée manquante alors qu'elle existait depuis 3 semaines"],
 ["R28", "Une limite <b>non vérifiée</b> devient une règle de conception silencieuse", "Michel s'est "
  "bridé graphiquement pendant des semaines sur une limite inexistante"],
 ["R29", "Le droit de <b>deviner</b> dépend du coût de l'erreur", "Erreur gratuite : devine. Erreur "
  "qui touche la personne : demande"],
 ["R30", "Un <b>retrait volontaire</b> doit être écrit, sinon il redevient un bug", "Une suppression "
  "délibérée a été « réparée » trois mois plus tard"],
], [12*mm, 78*mm, 67*mm]))

A(Paragraph("Le catalogue des bugs, rangé par famille", H2))
A(Paragraph("Le constat qui a motivé sa création : sur ~730 versions, <b>les mêmes cinq ou six bugs "
  "reviennent sous des déguisements différents</b>. Un bug isolé est une anecdote ; un bug qui "
  "revient douze fois est une propriété du système.", P))
A(tab([
 ["Famille de bug", "Occurrences"],
 ["Le « premier match gagnant » (règle générale masquant une règle précise)", "au moins 12"],
 ["L'information n'atteint jamais la donnée", "11"],
 ["Le temps et les fuseaux horaires", "au moins 6"],
 ["Deux sources qui se contredisent", "14 (toutes trouvées le 2 août)"],
 ["Le déploiement silencieux", "3"],
 ["Les seuils en marche d'escalier", "3"],
 ["La promesse écrite à l'utilisateur, et fausse", "2"],
 ["<b>Les erreurs de méthode</b> (mesure fausse, contrôle inopérant)", "au moins 5"],
], [110*mm, 45*mm]))

A(PageBreak())

# ═══════════════ VIII ═══════════════
A(partie("VIII", "L'audit du 2 août : méthode et résultats"))
A(Spacer(1, 6))
A(Paragraph("Point de départ", H2))
A(Paragraph("Une testeuse tape <b>&laquo; Tirage horizontal &raquo;</b> dans la liste des exercices "
  "et obtient <b>&laquo; Aucun résultat &raquo;</b> — alors que ce terme est le nom exact d'une des "
  "familles de mouvement de l'application, qui y classe 33 exercices. Puis Michel formule la question "
  "de fond : <i>&laquo; il y a sûrement certains exercices qui ne sont pas dans la bonne catégorie &raquo;</i>.", P))

A(Paragraph("Méthode A — comparaison à une base externe : ÉCHEC", H2))
A(Paragraph("Une base publique de 873 exercices avec leurs muscles a été téléchargée et confrontée "
  "au catalogue. <b>Résultat inutilisable</b> : elle classe le <b>développé couché</b> en "
  "&laquo; triceps &raquo; comme muscle principal ; son vocabulaire est plus grossier que le nôtre "
  "(&laquo; shoulders &raquo; au lieu de trois portions du deltoïde) ; et l'appariement automatique "
  "produisait des faux amis (&laquo; Curl Poignet Barre &raquo; apparié à &laquo; Barbell Curl &raquo;). "
  "Bilan : 28 &laquo; désaccords &raquo; dont environ 3 réels après lecture humaine.", P))

A(Paragraph("Méthode B — audit linéaire des 69 règles", H2))
A(Paragraph("Vérifier les <b>règles</b> plutôt que les exercices divise le travail par cinq. Les 69 "
  "règles ont été lues une par une avec la liste des exercices que chacune attrape. "
  "<b>Résultat : 4 erreurs</b>, ensuite confirmées sur sources documentaires (NASM, BarBend, études "
  "EMG) : glute ham raise classé lombaires au lieu d'ischios · leg curl sur-attribué aux fessiers · "
  "planche latérale classée abdominaux au lieu d'obliques · adduction de cuisses classée fessiers au "
  "lieu d'adducteurs.", P))

A(Paragraph("Méthode C — les croisements", H2))
A(Paragraph("Suggérée par Michel sur intuition : <i>&laquo; il faudrait croiser les données comme on "
  "a fait une fois en linéaire et en diagonale… je le sens, y'a un truc qui nous a échappé &raquo;</i>.", P))
A(enc([
 Paragraph("<b>Le principe</b> : l'application connaît <b>plusieurs choses indépendantes</b> sur un "
  "même exercice (groupe choisi à la main, muscles calculés, schéma de mouvement, terme de recherche "
  "anglais, fichier d'animation, catégorie de matériel). Chacune est plausible isolément et aucune "
  "ne provoque d'erreur. <b>On ne tient un bug que lorsque deux se contredisent.</b>", ENC),
]))
A(Paragraph("<b>Résultat : 14 défauts supplémentaires</b>, soit 3,5 fois plus que la lecture "
  "linéaire. Parmi eux : 4 doublons (deux fiches pointant la même animation ou le même terme "
  "anglais) · un exercice de <b>poussée</b> classé en <b>tirage</b> (l'application croyait qu'on "
  "avait tiré alors qu'on avait poussé) · une règle <b>morte</b> qui faisait recevoir aux oiseaux et "
  "face pull le deltoïde <i>moyen</i> en muscle principal au lieu du <i>postérieur</i> (10 exercices) "
  "· deux exercices dont le nom dit &laquo; haltère &raquo; rangés en machine et en poids du corps.", P))
A(Paragraph("Ces six croisements ont été transformés en <b>famille de tests permanente</b>. Elle a "
  "attrapé un 14ᵉ défaut <b>dès son premier lancement</b> : le <i>Jefferson Curl</i>, une flexion "
  "vertébrale chargée, était classé comme un curl de biceps.", P))

A(Paragraph("Second audit (soir) — la trouvabilité, déclenchée par le même retour", H2))
A(Paragraph("Michel revient sur le déclencheur : <i>&laquo; une adhérente n'a pas trouvé un "
  "exercice. Je ne veux pas corriger uniquement ce cas. Je veux comprendre si ce bug révèle une "
  "faiblesse de l'architecture. &raquo;</i> Une seconde mesure a donc été faite, sur la "
  "<b>trouvabilité</b> plutôt que sur la classification.", P))
A(Paragraph("<b>Protocole</b> : pour chacun des 337 exercices, simuler une recherche par le "
  "<b>premier mot de son nom</b>, puis relever le nombre de résultats et la <b>position</b> de "
  "l'exercice cherché dans la liste.", PETIT))
A(tab([
 ["Mesure", "Avant correctif", "Après correctif"],
 ["Exercices apparaissant au-delà du 20<super>e</super> résultat", "<b>73</b>", "22"],
 ["Exercices au-delà du 30<super>e</super> résultat", "32", "&mdash;"],
 ["Recherche &laquo; pec deck &raquo; (un nom d'exercice unique)", "<b>45 résultats</b>, "
  "l'exercice en <b>dernière</b> position", "<b>1</b>"],
 ["Recherche &laquo; svend &raquo;", "45 résultats, en dernière position", "1"],
 ["Recherches &laquo; yates &raquo; et &laquo; meadows &raquo;", "31 résultats chacune", "1"],
 ["Recherche &laquo; développé couché &raquo;", "45 résultats dont <b>8 seulement</b> contenaient "
  "ces mots", "8, tous pertinents"],
], [66*mm, 50*mm, 41*mm]))
A(enc([
 Paragraph("<b>La cause, et elle est structurelle</b>", ENC),
 Paragraph("La recherche est un <b>FILTRE</b> (oui / non) dont le résultat est affiché dans "
  "l'ordre <b>ALPHABÉTIQUE</b>. Elle n'a <b>aucune notion de « à quel point ça correspond »</b>.", ENC),
 Paragraph("Tant que le filtre restait étroit, le défaut était invisible. En l'élargissant aux "
  "familles de mouvement pour réparer le cas de la testeuse, le bruit est devenu ingérable : "
  "<b>chaque élargissement du filtre aggrave le problème, faute d'un tri pour le compenser</b>. "
  "Le correctif d'un symptôme avait donc créé un défaut plus large que celui qu'il réparait.", ENC),
], fond=colors.HexColor('#fdf0ee'), bord=ROUGE))
A(Paragraph("Corrigé (ft-v733) par deux mesures : un <b>rang de pertinence</b> explicite (nom exact "
  "&gt; commence par &gt; contient &gt; terme anglais &gt; groupe &gt; famille de mouvement), et un "
  "élargissement par famille qui ne se déclenche plus que sur le <b>libellé</b> d'une famille — "
  "jamais sur un mot-clé isolé, car ces mots-clés contiennent des noms d'exercices précis "
  "(&laquo; svend &raquo;, &laquo; pec deck &raquo;, &laquo; yates &raquo;).", P))
A(Paragraph("<b>Un piège dans le piège, qui mérite d'être signalé</b> : une fois le tri écrit, il "
  "ne se voyait toujours pas — l'affichage <b>regroupe les résultats par matériel</b>, et ce "
  "regroupement imposait son propre ordre. L'exercice avait beau être classé premier, il repartait "
  "dans sa catégorie, affichée plus bas. <i>Un tri ne sert à rien s'il ne traverse pas la mise en "
  "forme.</i>", P))

A(Paragraph("Trouvabilité : les portes d'entrée de chaque exercice", H2))
A(Paragraph("Mesure complémentaire : par combien de chemins <b>différents</b> un exercice "
  "peut-il être atteint (son nom, son groupe musculaire, son terme anglais, sa famille de "
  "mouvement, sa catégorie de matériel) ?", PETIT))
A(tab([
 ["Portes d'entrée", "Exercices"],
 ["5 portes", "225"],
 ["4 portes", "108"],
 ["3 portes", "4"],
 ["2 portes ou moins", "<b>0</b>"],
], [60*mm, 30*mm]))
A(Paragraph("<b>Aucun exercice n'est orphelin.</b> Les manques restants sont des trous de "
  "<b>donnée</b> et non de conception : 82 exercices n'ont pas de terme anglais, 34 ont un matériel "
  "indéterminé.", P))

A(Paragraph("Couverture réelle de chaque croisement", H2))
A(tab([
 ["Croisement", "Couverture", "Limite"],
 ["Aucune règle morte", "<b>337/337</b>", "&mdash;"],
 ["Groupe / muscles", "<b>337/337</b>", "&mdash;"],
 ["Schéma / muscles", "<b>337/337</b>", "&mdash;"],
 ["Animation en double", "282/337 (83 %)", "55 exercices n'ont pas d'animation"],
 ["Terme anglais en double", "255/337 (75 %)", "82 exercices n'ont pas de terme anglais"],
 ["Matériel / nom", "143/337 (42 %)", "On ne juge que si <b>un seul</b> matériel figure dans le nom"],
], [42*mm, 30*mm, 85*mm]))

A(PageBreak())

# ═══════════════ VIII bis ═══════════════
A(partie("VIII bis", "Analyse causale des 19 défauts"))
A(Spacer(1, 6))
A(Paragraph("Michel demande explicitement de ne pas s'arrêter à la liste des défauts : "
  "<i>&laquo; je veux identifier les causes. Est-ce un problème de données ? une limite des "
  "règles ? une limite du modèle ? un cas isolé ? une famille complète d'erreurs "
  "potentielles ? &raquo;</i> Voici la répartition, défaut par défaut.", P))
A(tab([
 ["Cause", "Défauts", "Exemples", "Portée"],
 ["<b>Limite des règles</b><br/>(ordre de parcours)", "9",
  "Le &laquo; premier match gagnant &raquo; : une règle générale placée avant une règle précise la "
  "rend inatteignable. Oiseaux classés deltoïde moyen, Jefferson Curl classé curl de biceps.",
  "<b>Famille entière</b> — au moins 12 occurrences historiques"],
 ["<b>Limite du modèle</b><br/>(tout se déduit du nom)", "6",
  "Ajouter une traduction dans un nom change sa catégorie de matériel. Deux fiches ne peuvent pas "
  "porter le même nom. Renommer casse le lien avec l'historique.",
  "<b>Structurelle</b> — ne se résout pas par des correctifs"],
 ["<b>Limite du modèle</b><br/>(recherche sans pertinence)", "1",
  "Un filtre oui/non affiché par ordre alphabétique : chaque élargissement aggrave le bruit.",
  "<b>Famille entière</b> — toute requête précise dont le mot figure dans une liste de mots-clés"],
 ["<b>Problème de données</b>", "3",
  "Doublons (deux fiches pour le même exercice), animation associée au mauvais exercice.",
  "Ponctuel, mais <b>invisible</b> sans croisement"],
 ["<b>Cas isolé</b>", "0", "&mdash;", "Aucun des défauts trouvés n'était réellement isolé."],
], [34*mm, 14*mm, 62*mm, 47*mm]))
A(enc([
 Paragraph("<b>Le résultat le plus important de cette analyse</b>", ENC),
 Paragraph("<b>Aucun des 19 défauts n'était un cas isolé.</b> Chacun appartenait à une famille "
  "&mdash; c'est-à-dire que d'autres exercices étaient touchés par le même mécanisme, sans qu'on le "
  "sache. C'est ce qui justifie de corriger les causes plutôt que les cas.", ENC),
 Paragraph("Et deux défauts sur trois relèvent de la <b>même racine</b> : le nom de l'exercice est "
  "à la fois l'étiquette affichée, l'entrée de cinq calculs, et la clé primaire de l'historique. "
  "<b>Une seule chaîne de caractères porte trois responsabilités incompatibles.</b>", ENC),
]))

A(Paragraph("Chronologie de la journée du 2 août", H2))
A(Paragraph("Sept versions livrées en une journée. Elle est donnée parce qu'elle explique la plupart "
  "des malentendus possibles : une observation du matin peut être exacte et périmée le soir.", PETIT))
A(tab([
 ["Version", "Ce qui a changé"],
 ["ft-v727", "<b>Mémoire longue</b> : Milo reçoit tout le parcours depuis l'inscription, et plus "
  "seulement 5 séances"],
 ["ft-v728", "Recherche par <b>famille de mouvement</b> (correctif du cas de la testeuse) &mdash; "
  "<i>qui a introduit le défaut de pertinence</i>"],
 ["ft-v729", "<b>Les deux noms</b> (français et anglais) sur les exercices les plus répandus"],
 ["ft-v730", "<b>Les croisements</b> : 14 défauts invisibles trouvés, 12<super>e</super> famille de "
  "tests créée, fichier des bugs créé"],
 ["ft-v731", "<b>Couverture des croisements mesurée</b> : deux trous comblés, limites restantes écrites"],
 ["ft-v732", "<b>Zéro perte</b> : le chemin par lequel l'historique cloud pouvait être écrasé"],
 ["ft-v733", "<b>Rang de pertinence</b> de la recherche (le défaut décrit en partie VIII)"],
 ["ft-v734", "<b>Indicateur de confiance</b> et empreinte du catalogue (partie VIII ter)"],
 ["ft-v735", "<b>Identifiant stable</b> des exercices, étape 1/3 (partie VIII quater)"],
], [20*mm, 137*mm]))

A(PageBreak())

# ═══════════════ VIII ter ═══════════════
A(partie("VIII ter", "Indicateur de confiance et audit des règles"))
A(Spacer(1, 6))
A(Paragraph("Cette partie répond à une demande du relecteur : <i>&laquo; peut-on mesurer la "
  "fiabilité du catalogue ? auditer les règles elles-mêmes ? détecter automatiquement une "
  "régression après une modification ? &raquo;</i> Les trois ont été mis en place et mesurés.", P))

A(Paragraph("L'indicateur de confiance", H2))
A(Paragraph("<b>Définition retenue</b>, volontairement stricte : un exercice est classé "
  "<b>sans ambiguïté</b> si <b>toutes</b> les règles qui lui correspondent donnent le même "
  "résultat ; il est <b>fragile</b> si plusieurs règles lui correspondent en donnant des muscles "
  "<b>différents</b> &mdash; auquel cas sa justesse ne tient qu'à l'<b>ordre</b> des règles.", P))
A(tab([
 ["Mesure", "Exercices", "Part"],
 ["Classés <b>sans ambiguïté</b> (indépendants de l'ordre)", "277", "<b>82 %</b>"],
 ["Classés de façon <b>fragile</b> (le résultat dépend de l'ordre)", "60", "18 %"],
 ["Sans aucun classement", "0", "0 %"],
], [90*mm, 30*mm, 25*mm]))
A(enc([
 Paragraph("<b>Lecture indispensable de ce 18 %</b>", ENC),
 Paragraph("Ce n'est <b>pas un taux d'erreur</b>. Les 60 exercices fragiles sont <b>corrects "
  "aujourd'hui</b> &mdash; le développé couché sort bien en pectoraux et non en épaules. C'est une "
  "<b>surface de risque</b> : ces 60 basculent silencieusement si une règle est insérée au mauvais "
  "endroit. C'est précisément ce qui est arrivé aux oiseaux (10 exercices) et aux élévations "
  "latérales.", ENC),
]))

A(Paragraph("L'audit des règles : le masquage partiel", H2))
A(Paragraph("Le dispositif détectait les règles <b>totalement</b> mortes. Il ne voyait pas les "
  "règles <b>partiellement</b> masquées : celles qui capturent une partie de ce qui leur revient, "
  "le reste étant pris par une règle placée avant, avec un classement <b>différent</b>.", P))
A(tab([
 ["Constat", "Valeur"],
 ["Règles totalement mortes", "0"],
 ["Règles <b>partiellement</b> masquées", "<b>19 sur 69</b>"],
 ["La plus touchée : <font face='Courier'>tirage | pulldown | row</font>",
  "capture 9 exercices, <b>19 lui échappent</b> avec un autre classement"],
 ["Deuxième : <font face='Courier'>developpe | shoulder press</font>",
  "capture 4 exercices, <b>16 lui échappent</b>"],
], [95*mm, 62*mm]))
A(Paragraph("Dans la plupart des cas le masquage est <b>voulu</b> (une règle précise doit passer "
  "avant une règle large). Ce qui manquait, c'est de le <b>voir</b>.", PETIT))

A(Paragraph("La détection automatique de régression", H2))
A(Paragraph("Une <b>empreinte</b> du catalogue a été créée : pour chacun des 337 exercices, ses "
  "muscles principaux et secondaires, son schéma de mouvement, sa catégorie de matériel et sa "
  "dépense calorique. Le test la compare à chaque version et <b>nomme</b> tout exercice qui bouge. "
  "Quand le changement est voulu, on régénère l'empreinte et l'historique du code montre exactement "
  "quels exercices ont été affectés.", P))
A(Paragraph("<b>Vérifié en cassant volontairement</b> : en retirant la règle du deltoïde "
  "postérieur, le test échoue et affiche <font face='Courier'>Machine Oiseau &ndash;&gt; muscles "
  "vides</font>. Jusqu'ici, modifier une règle ne montrait <b>jamais</b> qui d'autre était touché.", P))

A(PageBreak())

# ═══════════════ VIII quater ═══════════════
A(partie("VIII quater", "L'identifiant stable — la dette principale, entamée"))
A(Spacer(1, 6))
A(Paragraph("Le dossier précédent identifiait l'absence d'identifiant d'exercice comme la dette "
  "structurelle principale, et posait la question de son urgence. <b>Le chantier a été lancé le "
  "soir même</b> (version ft-v735). Cette partie décrit ce qui a été fait, et surtout <b>ce qui ne "
  "l'a pas été</b>.", P))

A(Paragraph("Le problème, rappelé en une ligne", H2))
A(Paragraph("Le <b>nom</b> d'un exercice était sa clé primaire : l'historique, les records, les "
  "programmes et les temps de repos étaient tous rangés par nom. Trois conséquences, toutes "
  "constatées dans la même journée : renommer cassait le lien avec le passé (trois tables de "
  "migration ont dû être écrites) · deux exercices ne pouvaient pas porter le même nom · "
  "<b>ajouter un mot dans un nom modifiait ses calculs en silence</b>.", P))

A(Paragraph("La décision de conception, et pourquoi elle n'est pas anodine", H2))
A(enc([
 Paragraph("<b>Le sens de la table est toute la décision.</b>", ENC),
 Paragraph("La table va de l'<b>identifiant</b> vers les <b>noms</b>, jamais l'inverse :", ENC),
 Paragraph("'rowing-barre-tirage-horizontal' :<br/>"
  "&nbsp;&nbsp;&nbsp;&nbsp;[ 'Rowing Barre (Tirage Horizontal)',&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
  "&lt;- ce qui s'affiche<br/>"
  "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'Rowing Barre' ]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
  "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;- l'ancien nom", CODE),
 Paragraph("Une table rangée <b>par nom</b> aurait cassé au premier renommage &mdash; exactement le "
  "défaut qu'on cherchait à supprimer. Ici l'identifiant est la clé ; le nom n'est qu'une valeur, "
  "qu'on a le droit de changer. Et la liste porte <b>l'histoire des noms</b> : c'est elle qui fait "
  "qu'une séance enregistrée il y a un an retrouve sa fiche.", ENC),
]))

A(Paragraph("Le gain immédiat, qui n'était pas l'objectif visé", H2))
A(Paragraph("La table de migration qui vivait dans le code de chargement <b>disparaît</b>. Elle "
  "faisait doublon avec la nouvelle, elle était rangée par nom, et il fallait penser à la tenir à "
  "jour <b>à deux endroits</b>. Renommer un exercice, désormais, c'est <b>une ligne à modifier</b> "
  "au lieu de deux.", P))

A(Paragraph("Ce qui a été livré, et ce qui ne l'a pas été", H2))
A(tab([
 ["Étape", "État", "Contenu"],
 ["1 &mdash; L'identité existe", "<b>Fait</b> (ft-v735)",
  "337 identifiants figés, uniques · 351 noms couverts (actuels et anciens) · trois fonctions de "
  "résolution · un exercice créé par l'utilisateur rend <b>null</b>, jamais un identifiant inventé"],
 ["2 &mdash; L'écriture", "<b>Non fait</b>",
  "Écrire l'identifiant dans les nouvelles séances, à côté du nom. Additif, sans risque."],
 ["3 &mdash; La lecture", "<b>Non fait</b>",
  "Faire lire l'historique, les records et les programmes par identifiant plutôt que par nom. "
  "C'est l'étape qui touche réellement aux données des utilisateurs."],
], [40*mm, 30*mm, 87*mm]))
A(Paragraph("<b>Autrement dit : l'identifiant existe, mais rien ne l'utilise encore.</b> "
  "Vérification faite exercice par exercice : <b>337/337 sans le moindre changement</b> de "
  "classement, de calories ou de schéma. C'était le but &mdash; une étape structurelle qui ne se "
  "voit pas est une étape réussie.", P))

A(Paragraph("Une erreur de méthode, commise en écrivant ces tests", H2))
A(enc([
 Paragraph("Le premier contrôle négatif de cette version affichait <b>zéro échec</b>. Il aurait pu "
  "se lire comme un succès. En réalité, le programme de test <b>plantait</b> au lieu d'échouer "
  "&mdash; et un plantage ressemble à un test qui passe.", ENC),
 Paragraph("C'est très exactement la famille d'erreur n° 12 du catalogue de bugs du projet… écrite "
  "la veille. Elle a donc été reproduite par celui qui venait de la documenter. Corrigé : le test "
  "échoue maintenant lisiblement, avec <b>6 échecs nommés</b>.", ENC),
 Paragraph("<b>Ce cas est laissé dans le dossier volontairement</b> : il illustre mieux que tout "
  "argument pourquoi la question 6 (« quel biais de méthode est encore à l'œuvre ? ») reste "
  "ouverte.", ENC),
], fond=colors.HexColor('#fdf6e8'), bord=colors.HexColor('#b8860b')))

# ═══════════════ IX ═══════════════
A(partie("IX", "Les limites connues — la partie la plus importante"))
A(Spacer(1, 6))
A(enc([
 Paragraph("<b>Limite de fond : un croisement ne détecte qu'une CONTRADICTION.</b>", ENC),
 Paragraph("Si deux sources sont fausses <b>de la même façon</b>, le contrôle se tait. Un exercice "
  "dont le groupe, les muscles et le schéma seraient tous les trois cohérents <b>et tous les trois "
  "faux</b> reste totalement invisible.", ENC),
 Paragraph("Seule une vérification <b>externe</b> couvre cette zone — et elle n'a porté que sur "
  "<b>5 exercices sur 337</b>.", ENC),
], fond=colors.HexColor('#fdf0ee'), bord=ROUGE))
A(Spacer(1, 6))

A(Paragraph("Limites du modèle des exercices", H2))
A(Paragraph("&mdash;&nbsp;<b>Aucun identifiant.</b> Le nom est la clé primaire de l'historique : renommer "
  "impose une table de migration (utilisée trois fois le 2 août).", PC))
A(Paragraph("&mdash;&nbsp;<b>Ce qu'on ne peut pas modéliser</b>, faute d'endroit où le mettre : unilatéral "
  "ou bilatéral, côté travaillé, amplitude, tempo, variantes d'un même mouvement, pondération "
  "continue des muscles (la hiérarchie est binaire).", PC))
A(Paragraph("&mdash;&nbsp;<b>Les statistiques passées ne sont pas figées</b> : elles se recalculent, donc "
  "elles changent quand une règle est corrigée.", PC))
A(Paragraph("&mdash;&nbsp;<b>Les tables d'attente des croisements sont écrites à la main</b> et n'ont été "
  "validées par personne. Une table trop permissive rend le contrôle décoratif : il passe au vert "
  "sans rien garantir.", PC))

A(Paragraph("Limites du raisonnement de Milo sur l'historique", H2))
A(Paragraph("Il reçoit la coupure, mais <b>mal cadrée</b>. Trois défauts mesurés :", P))
A(tab([
 ["#", "Défaut mesuré", "Conséquence"],
 ["1", "Aucune distinction entre une coupure <b>passée</b> et une coupure qui <b>vient de se "
  "terminer</b> : la donnée est présentée comme une statistique historique.",
  "Le modèle doit <i>inférer</i> qu'il s'agit d'une reprise. Rien ne le lui dit."],
 ["2", "Le signal explicite (&laquo; revient après une pause &raquo;) ne se déclenche que si la "
  "<b>dernière</b> séance date de plus de 14 jours.", "Actif <b>pendant</b> l'absence, muet <b>au "
  "retour</b> — le seul moment qui compte."],
 ["3", "La régularité est une moyenne sur toute la période, coupure comprise.", "Mesuré : quelqu'un "
  "qui s'entraîne 3 fois par semaine depuis sa reprise est décrit comme <b>&laquo; 0,6 séance par "
  "semaine &raquo;</b>. Exact, et faux comme information."],
], [7*mm, 76*mm, 74*mm]))
A(Paragraph("<b>Formulé autrement :</b> l'application transmet des <b>chiffres</b> ; il lui manque "
  "de transmettre un <b>état</b> (&laquo; en reprise depuis 3 semaines après 3 mois d'arrêt, rythme "
  "actuel 3 fois par semaine, en hausse &raquo;). C'est calculable sur les données existantes.", P))

A(Paragraph("Autres angles morts", H2))
A(tab([
 ["Angle mort", "Nature"],
 ["Les exercices créés par l'utilisateur n'ont aucun schéma de mouvement", "trou connu"],
 ["Les programmes enregistrés et les temps de repos par exercice ne sont pas transmis à Milo", "trous connus"],
 ["Un exercice unilatéral compte comme un bilatéral dans le volume", "fausse les statistiques"],
 ["Le stockage cloud (512 Ko partagés) a déjà provoqué une panne de 2 jours ; contourné par "
  "compression, <b>pas résolu</b>", "risque structurel"],
 ["Milo est évalué par Michel sur un modèle haut de gamme ; les utilisateurs ont un modèle plus léger", "biais d'évaluation"],
], [110*mm, 45*mm]))

A(PageBreak())

# ═══════════════ X ═══════════════
A(partie("X", "Les questions posées au relecteur"))
A(Spacer(1, 6))
A(Paragraph("Michel formule ainsi son objectif : <i>&laquo; je ne cherche pas la perfection absolue. "
  "Je souhaite que 95 à 99 % du catalogue soit fiable. Je préfère consacrer du temps maintenant "
  "plutôt que de construire des analyses ou de l'intelligence artificielle sur des données "
  "imparfaites. &raquo;</i>", P))

A(Paragraph("Q1. Quels croisements manquent ?", QUEST))
A(Paragraph("Six ont été retenus. Pistes non explorées : le <b>nom du fichier d'animation</b> comparé "
  "au nom de l'exercice (c'est ce qui a révélé un doublon par hasard) ; le <b>groupe</b> comparé au "
  "<b>schéma de mouvement</b> ; la <b>cohérence interne des règles</b> entre elles.", P))

A(Paragraph("Q2. L'architecture « tout se déduit du nom » est-elle le vrai problème ?", QUEST))
A(Paragraph("Six des dix-huit défauts en découlent directement. Faut-il la conserver en la contrôlant "
  "mieux, ou basculer vers des <b>attributs explicites</b> par exercice ? Contrainte : 337 fiches à "
  "renseigner et un historique indexé par nom.", P))

A(Paragraph("Q3. Comment vérifier l'anatomie des 337 sans 337 recherches ?", QUEST))
A(Paragraph("Vérifier les 69 règles divise le travail par cinq, mais suppose que chaque exercice "
  "tombe sur la bonne règle — ce qui est justement le bug le plus fréquent. Existe-t-il une source "
  "de référence réellement fiable sur la hiérarchie principal / secondaire ?", P))

A(Paragraph("Q4. Les tables d'attente sont-elles trop permissives ?", QUEST))
A(Paragraph("Elles définissent ce qu'un groupe ou un schéma « a le droit » d'avoir comme muscles, et "
  "n'ont été validées par personne. Comment calibrer cela honnêtement, sans rendre le contrôle "
  "décoratif ?", P))

A(Paragraph("Q5. Que faire quand les sources se contredisent ?", QUEST))
A(Paragraph("Le <b>développé couché</b> est donné « pectoraux » par la quasi-totalité des sources et "
  "« triceps » par la base consultée. Le <b>pull-over</b> est donné tantôt dorsaux, tantôt pectoraux. "
  "Quelle règle d'arbitrage, sachant que l'application <b>doit</b> trancher pour colorier une "
  "silhouette anatomique ?", P))

A(Paragraph("Q6. Y a-t-il un angle mort de méthode ?", QUEST))
A(Paragraph("Le projet tient la liste de ses propres erreurs de méthode : un contrôle négatif à zéro "
  "échec parce que le test <i>plantait</i> au lieu d'échouer ; une vérification sur 9 archétypes "
  "présentée comme une vérification du catalogue ; l'affirmation qu'une fonctionnalité manquait alors "
  "qu'elle existait depuis trois semaines. <b>Quel biais de ce type est encore à l'œuvre ici ?</b>", P))

A(Paragraph("Q7. Faut-il transmettre un état narratif plutôt que des statistiques ?", QUEST))
A(Paragraph("Reprise, stagnation, montée en charge, changement de fréquence, retour de blessure. "
  "Quels états seraient réellement utiles à un coach, et sur quels seuils les déclencher <b>sans "
  "produire de faux signaux</b> ? (Le projet a déjà une règle : ne jamais sur-réagir au bruit — "
  "84,8 kg puis 84,5 kg n'est pas une tendance.)", P))

A(Paragraph("Q8. L'identifiant stable : la suite est-elle bien découpée ?", QUEST))
A(Paragraph("La question du dossier précédent (« faut-il rembourser cette dette maintenant ? ») a été tranchée : oui, et l'étape 1 est faite. La question devient donc opérationnelle. Le découpage retenu est : ① créer l'identité sans que rien ne l'utilise · ② écrire l'identifiant à côté du nom dans les nouvelles données · ③ basculer les lectures. <b>Ce découpage est-il le bon ?</b> Y a-t-il un ordre plus sûr, ou une étape intermédiaire manquante ? Contrainte : les données des utilisateurs existent déjà et sont indexées par nom, et elles vivent à la fois sur le téléphone et sur un serveur.", P))

A(Paragraph("Q9. Les statistiques recalculées : défaut ou propriété ?", QUEST))
A(Paragraph("Les muscles ne sont pas figés dans l'historique. Corriger une règle change donc le passé. "
  "Faut-il figer les muscles au moment de l'enregistrement (statistiques reproductibles mais erreurs "
  "gravées), ou conserver le recalcul (correctifs propagés mais passé mouvant) ?", P))

A(Paragraph("Q10. Un correctif qui aggrave le défaut qu'il répare : comment l'éviter ?", QUEST))
A(Paragraph("Le cas est documenté dans ce dossier : élargir la recherche pour aider une testeuse a "
  "rendu les recherches précises inutilisables, et personne ne l'a vu pendant deux versions parce "
  "que les tests vérifiaient le <b>nombre</b> de résultats et jamais leur <b>ordre</b>. Quelle "
  "classe de test aurait attrapé cela ? Plus généralement : <b>comment teste-t-on la pertinence "
  "d'un classement</b>, par opposition à son exactitude ?", P))

A(Spacer(1, 10))
A(enc([
 Paragraph("<b>Ce qui serait le plus utile en retour</b>", ENC),
 Paragraph("Une critique de la <b>démarche</b> plutôt qu'une liste de corrections anatomiques. "
  "Concrètement : quels croisements ajouter, quelles hypothèses de la méthode sont fragiles, et "
  "surtout — <b>quelle catégorie d'erreur ce dispositif est-il structurellement incapable de voir ?</b>", ENC),
 Paragraph("<b>Comment réfuter ce dossier :</b> les mesures sont des sorties de programme, pas des "
  "opinions. Elles se contestent en pointant une erreur de <b>protocole de mesure</b>. À titre "
  "d'exemple, une mesure de ce dossier a déjà été invalidée puis refaite : un test cherchait le mot "
  "&laquo; reprise &raquo; dans le contexte et le trouvait toujours — parce que ce mot figure dans "
  "les <i>instructions</i> du modèle et non dans les <i>données</i>. Faux positif. C'est exactement "
  "le type d'erreur qu'un regard extérieur peut attraper.", ENC),
]))

A(Spacer(1, 10))
A(Paragraph("Dossier généré automatiquement depuis le code source de l'application le 2 août 2026. "
  "Les chiffres (337 exercices, 69 règles, 17 muscles, 20 schémas, 12 familles de tests, tailles de "
  "fichiers, composition du contexte) sont lus dans l'application, pas saisis à la main : ce dossier "
  "est régénérable et ne peut pas se périmer en silence.", PETIT))

doc.build(h, onFirstPage=pied, onLaterPages=pied)
print("PDF ecrit :", OUT, os.path.getsize(OUT), "octets")
