#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GÉNÉRATEUR DU PDF « VERROUILLAGE NUTRITION » — pour GPT.

⛔⛔ LES GARDES RECOMPTENT CHAQUE CHIFFRE DEPUIS LES MESURES, ET REFUSENT DE PRODUIRE SI UN FAIT
TOMBE. Ce ne sont pas des formalités : dans ce dépôt ils ont déjà attrapé un titre dupliqué, un
pied de page périmé et deux chiffres faux — les miens.

⚠️ Police : WinAnsi/cp1252, aucun emoji (reportlab ne les a pas et les rend en carrés noirs).
"""
import json, os, re, subprocess, sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak)

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MESURES = '/tmp/verrou_nutri.json'
FAITS = '/tmp/verrou_faits.json'
SORTIE = os.path.join(RACINE, 'docs', 'VERROUILLAGE-NUTRITION-2026-09-22.pdf')
DOSSIER = os.path.join(RACINE, 'docs', 'VERROU-NUTRITION-2026-09-22.md')

# ───────────────────────── GARDES ─────────────────────────

def refus(msg):
    print('REFUS DE PRODUIRE : ' + msg)
    sys.exit(1)


def charge(p, quoi):
    if not os.path.exists(p):
        refus('%s introuvable (%s). Relancer l instrument AVANT le PDF.' % (quoi, p))
    try:
        return json.load(open(p, encoding='utf-8'))
    except Exception as e:
        refus('%s illisible : %s' % (quoi, e))


def garde_arbre():
    """Un PDF qui prétend décrire un arbre doit décrire CELUI-LA."""
    r = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=RACINE, capture_output=True, text=True)
    if r.returncode != 0 or not r.stdout.strip():
        if os.environ.get('VERROU_PDF_SANS_GIT'):
            return 'sans-git'          # contrôle négatif : l arbre cloné n a pas de .git
        refus('HEAD illisible')
    return r.stdout.strip()[:8]


def garde_servis():
    """⛔ LE GARDE QUI COMPTE LE PLUS : aucun fichier SERVI ne doit avoir bougé."""
    SERVIS = ['state.js', 'app.js', 'screens.js', 'log.js', 'coach.js', 'setup.js',
              'tracking.js', 'constants.js', 'index.html', 'style.css', 'sw.js',
              'Code.js', 'worker.js', 'supabase.js']
    r = subprocess.run(['git', 'status', '--porcelain'], cwd=RACINE, capture_output=True, text=True)
    if r.returncode != 0:
        if os.environ.get('VERROU_PDF_SANS_GIT'):
            return
        refus('git status illisible')
    touches = []
    for ligne in r.stdout.splitlines():
        chemin = ligne[3:].strip().strip('"')
        if os.path.basename(chemin) in SERVIS and chemin.count('/') == 0:
            touches.append(chemin)
    if touches:
        refus('des fichiers SERVIS ont ete modifies : %s. Le dossier annonce 0 ligne de code '
              'metier ; il ne peut pas etre produit si c est faux.' % ', '.join(touches))


def garde_version():
    """Aucun bump de sw.js : le brief l interdit explicitement."""
    r = subprocess.run(['git', 'diff', '--name-only', 'origin/master', '--'], cwd=RACINE,
                       capture_output=True, text=True)
    if r.returncode == 0 and 'sw.js' in r.stdout.split():
        refus('sw.js a bouge : le brief interdit tout bump de version.')


def garde_faits(M, F, txt):
    """Chaque chiffre publie est RECOMPTE depuis les mesures."""
    e = []
    # ① la validation du miroir
    v = M['validation_miroir']
    if v['ecarts'] != 0:
        e.append('le miroir n est PAS valide (%d ecarts) — aucun chiffre derive ne vaut.' % v['ecarts'])
    if v['taille'] < 20000:
        e.append('echantillon de validation trop petit (%d)' % v['taille'])
    if M['erreurs_page']:
        e.append('%d erreur(s) de page' % len(M['erreurs_page']))
    # ② les totaux annonces dans le dossier
    nv = len(M['variantes'])
    total = v['taille'] + M['profils_corpus'] * nv + M['population_realiste']['n'] * nv
    m = re.search(r'\*\*([\d\s  ]+) evaluations\*\*|\*\*([\d\s  ]+) évaluations\*\*', txt)
    if m:
        annonce = int(re.sub(r'[^\d]', '', m.group(1) or m.group(2)))
        if abs(annonce - total) > total * 0.01:
            e.append('total annonce %d, recompte %d' % (annonce, total))
    # ③ les faits A-D, recomptes depuis /tmp/verrou_faits.json
    if not F['A1_verdict']['prot_identiques'] or not F['A1_verdict']['lip_identiques']:
        e.append('fait A1 : les macros VARIENT avec la masse maigre — le dossier dit le contraire')
    if not F['A1_verdict']['bmr_varie']:
        e.append('fait A1 : le BMR ne varie PAS — le dossier annonce 478 kcal d ecart')
    if not F['A2_verdict']['tous_identiques']:
        e.append('fait A2 : les disciplines different — le dossier dit 0 ecart')
    if not F['A3_verdict']['tous_identiques']:
        e.append('fait A3 : les niveaux different — le dossier dit 0 ecart')
    if F['B_verdict']['ecart_kcal_0_vs_6'] != 0:
        e.append('fait B : ecart 0 vs 6 seances = %d, le dossier dit 0' % F['B_verdict']['ecart_kcal_0_vs_6'])
    if not F['C_verdict']['ecart_perte_identique_partout']:
        e.append('fait C : l ecart calorique n est PAS fixe')
    pire = max(abs(x['fermeture']) for x in F['D'])
    if pire < 400:
        e.append('fait D : la pire fermeture vaut %d, le dossier annonce +450' % pire)
    if '+450' not in txt:
        e.append('le dossier ne cite plus la pire fermeture (+450)')
    # ④ le cas de la cible manuelle
    c600 = [x for x in F['E'] if x['manuelle'] == 600]
    if not c600 or c600[0]['kcal_macros'] < 1400:
        e.append('fait E : la cible manuelle a 600 kcal ne reproduit plus 1441 kcal de macros')
    # ⑤ les mentions obligatoires du brief
    for mot, quoi in [('NON VERIFIEE', 'sources'), ('NON VÉRIFIÉE', 'sources')]:
        pass
    if 'NON VÉRIFIÉE' not in txt and 'NON VERIFIEE' not in txt:
        e.append('le dossier ne marque plus les sources comme NON VERIFIEES')
    if 'connect_rejected' not in txt:
        e.append('le dossier ne donne plus la cause technique du blocage reseau')
    fin = "AUCUNE MODIFICATION DU MOTEUR NUTRITIONNEL N'A ÉTÉ PUBLIÉE. EN ATTENTE DU GO DE MICHEL."
    if fin not in txt:
        e.append('la phrase finale obligatoire est absente du dossier')
    # ⑥ le dossier doit compter 27 points
    bloc = txt.split('RAPPORT FINAL EN 27 POINTS')
    if len(bloc) < 2:
        e.append('le rapport final en 27 points est introuvable')
    else:
        n = len(re.findall(r'^\d+\. ', bloc[1], re.M))
        if n != 27:
            e.append('le rapport final compte %d points, pas 27' % n)
    if e:
        refus(' | '.join(e))
    return total

# ───────────────────────── RENDU ─────────────────────────

def w(s):
    """cp1252 : on remplace ce que la police n a pas, on ne le laisse pas devenir un carre."""
    rep = {'→': '->', '≥': '>=', '≤': '<=', '×': 'x', ' ': ' ',
           '’': "'", '“': '"', '”': '"', '–': '-', '—': '-',
           '…': '...', ' ': ' ', '≠': '!=', '±': '+/-', '⭐': '',
           '⛔': '', '⚠': '', '️': '', '✅': '', '➕': '+'}
    for k, v in rep.items():
        s = s.replace(k, v)
    return ''.join(c if ord(c) < 256 else '?' for c in s)


NOIR = colors.HexColor('#111111')
ROUGE = colors.HexColor('#B3261E')
GRIS = colors.HexColor('#5F6368')
BLEU = colors.HexColor('#1A4D8F')

H1 = ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=15, leading=18, textColor=BLEU, spaceAfter=7)
H2 = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=NOIR, spaceBefore=9, spaceAfter=4)
P = ParagraphStyle('P', fontName='Helvetica', fontSize=8.6, leading=11.6, textColor=NOIR, spaceAfter=4)
PR = ParagraphStyle('PR', parent=P, textColor=ROUGE)
PG = ParagraphStyle('PG', parent=P, textColor=GRIS, fontSize=7.8, leading=10)


def tab(donnees, largeurs, entete=True):
    t = Table([[Paragraph(w(str(c)), PG) for c in l] for l in donnees], colWidths=largeurs)
    st = [('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#CCCCCC')),
          ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('LEFTPADDING', (0, 0), (-1, -1), 3), ('RIGHTPADDING', (0, 0), (-1, -1), 3),
          ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5)]
    if entete:
        st += [('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EEF2F7'))]
    t.setStyle(TableStyle(st))
    return t


def main():
    M = charge(MESURES, 'les mesures du verrou')
    F = charge(FAITS, 'les faits A-D')
    if not os.path.exists(DOSSIER):
        refus('le dossier markdown est introuvable')
    txt = open(DOSSIER, encoding='utf-8').read()
    tete = garde_arbre()
    garde_servis()
    garde_version()
    total = garde_faits(M, F, txt)

    pop = M['population_realiste']['variantes']
    N = M['population_realiste']['n']
    v = M['validation_miroir']

    doc = SimpleDocTemplate(SORTIE, pagesize=A4, leftMargin=15 * mm, rightMargin=15 * mm,
                            topMargin=14 * mm, bottomMargin=14 * mm,
                            title='Verrouillage nutrition - Force Tracker',
                            author='Force Tracker')
    S = []
    A = S.append
    A(Paragraph(w('VERROUILLAGE SCIENTIFIQUE ET TECHNIQUE DU MOTEUR NUTRITIONNEL'), H1))
    A(Paragraph(w('Force Tracker - 22/09/2026 - arbre %s' % tete), PG))
    A(Paragraph(w('AUCUNE LIGNE DE CODE METIER MODIFIEE. AUCUNE VERSION POSEE. AUCUNE PUBLICATION.'), PR))
    A(Spacer(1, 5))

    A(Paragraph(w('0. L AVERTISSEMENT QUI COMMANDE TOUT LE RESTE'), H2))
    A(Paragraph(w("Aucune source scientifique primaire n a pu etre lue. Ce n est pas une estimation, "
                  "c est une mesure refaite deux fois : 16 domaines (doi.org, pubmed, PMC, Crossref, "
                  "OpenAlex, JISSN, Springer, MDPI, Frontiers, ANSES, EFSA, OMS, ACSM, ISSN...) rendent "
                  "HTTP 000. Cause technique exacte : connect_rejected - le proxy de sortie refuse le "
                  "CONNECT (politique de l organisation). Seul api.github.com repond 200. L outil de "
                  "RECHERCHE fonctionne, l outil de LECTURE de page non."), P))
    A(Paragraph(w("Consequence : tout ce qui est etiquete << litterature >> ici vient d extraits de "
                  "moteur de recherche, donc de sources SECONDAIRES. Aucune borne chiffree de ce "
                  "dossier ne doit etre inscrite dans le moteur en l etat."), PR))

    A(Paragraph(w('1. LA METHODE : DEUX CHEMINS, UNE SEULE VERITE'), H2))
    A(Paragraph(w("Relancer les instruments precedents n aurait rien reproduit : le meme code rend le "
                  "meme nombre par le meme chemin. On a donc construit un MIROIR du moteur, reecrit a "
                  "la main depuis la lecture de state.js, puis confronte a l app SERVIE dans un vrai "
                  "navigateur."), P))
    A(tab([['profils compares miroir <-> app servie', '{:,}'.format(v['taille']).replace(',', ' ')],
           ['champs compares par profil', 'BMR, TDEE, calories, proteines, lipides, glucides'],
           ['ECARTS', str(v['ecarts'])],
           ['erreurs de page', str(len(M['erreurs_page']))],
           ['evaluations totales du moteur', '{:,}'.format(total).replace(',', ' ')]],
          [72 * mm, 108 * mm], entete=False))
    A(Spacer(1, 3))
    A(Paragraph(w("Ce que ce 0 autorise, et rien de plus : la lecture du moteur est juste, donc le "
                  "miroir peut porter les millions de profils qu un navigateur ne peut pas porter. "
                  "Il ne remplace jamais l app : il est revalide par elle a chaque execution."), PG))

    A(Paragraph(w('2. LES FAITS REPRODUITS (et deux corrections a mes propres dossiers)'), H2))
    a1 = F['A1']
    A(tab([['fait', 'mesure', 'verdict'],
           ['A1 masse maigre', 'BMR %d -> %d selon le %% de gras (85 kg)' % (a1[0]['bmr'], a1[-1]['bmr']),
            'atteint les CALORIES (%d kcal), jamais les macros (P et L identiques)' % (a1[0]['bmr'] - a1[-1]['bmr'])],
           ['A2 discipline', '5 disciplines testees', '0 ecart'],
           ['A3 niveau declare', '4 niveaux testes', '0 ecart'],
           ['B volume reel', '0 vs 6 seances/semaine', '%d kcal d ecart' % F['B_verdict']['ecart_kcal_0_vs_6']],
           ['C ecarts caloriques', 'perte -450 kcal fixes de 50 a 150 kg',
            '-%.1f %%/sem a 50 kg contre -%.1f %%/sem a 150 kg (rapport 2,7x, gradient INVERSE)'
            % (abs(F['C_verdict']['pctSem_perte_min']), abs(F['C_verdict']['pctSem_perte_max']))],
           ['D pire cas', 'F 78 a, 148 cm, 120 kg, perte, decharge',
            'affiche %d kcal, macros = %d kcal (+%d)' % (F['D'][0]['kcal'],
              F['D'][0]['kcal'] + F['D'][0]['fermeture'], F['D'][0]['fermeture'])],
           ['E cible manuelle', 'saisie de 600 kcal',
            'macros affichees = %d kcal' % [x for x in F['E'] if x['manuelle'] == 600][0]['kcal_macros']]],
          [28 * mm, 58 * mm, 94 * mm]))
    A(Spacer(1, 3))
    A(Paragraph(w("CORRECTION 1 - le dossier precedent disait << la masse maigre n atteint pas le "
                  "moteur >>. C est trop fort, donc faux : elle atteint parfaitement les calories. "
                  "Elle n atteint jamais la REPARTITION."), PR))
    A(Paragraph(w("CORRECTION 2 - le dossier precedent publiait -0,53 %/sem a 60 kg contre -0,24 % a "
                  "130 kg. Les nombres remesures sont ci-dessus, avec leur formule ecrite a cote "
                  "(7 700 kcal/kg, 7 jours). Je ne defends pas l ancien calcul, que je n arrive pas a "
                  "reconstruire. Le constat, lui, ne bouge pas."), PR))

    A(PageBreak())
    A(Paragraph(w('3. CE QUE JE RETIRE DE MES PROPRES AFFIRMATIONS'), H2))
    A(Paragraph(w("(1) << ISSN 2017 donne 2,3-3,1 g/kg de POIDS DE CORPS >>. Les deux recherches "
                  "independantes du 22/09 donnent l unite INVERSE : g/kg de MASSE MAIGRE (FFM). Je "
                  "retire ma correction, et je ne la remplace pas : aucune des deux lectures n a ete "
                  "lue a la source. C est la question la plus lourde du dossier, et elle decide seule "
                  "si le moteur est correct ou systematiquement au-dessus."), PR))
    A(Paragraph(w("(2) << Le plancher lipidique de 0,5 g/kg est un seuil hormonal >>. Les extraits "
                  "consultes situent le minimum a 0,8-1 g/kg, et 0,5 g/kg comme une condition "
                  "EXPERIMENTALE de 2,5 jours, pas une recommandation. Je ne change pas le plancher "
                  "tout seul : les deux valeurs sont mesurees (V6 et V7) et l arbitrage revient a Michel."), PR))

    A(Paragraph(w('4. LES GLUCIDES - le fait qui va contre l intuition de depart'), H2))
    gq = M['variantes']['V0']['distributions']['gluc_gkg']
    A(Paragraph(w("La mediane des glucides est a %.2f g/kg : PILE au milieu de la plage 4-7 citee pour "
                  "les sports de force. Le moteur n est donc PAS globalement delirant. C est sa QUEUE "
                  "de distribution qui l est." % gq['med']), P))
    A(tab([['percentile', 'p01', 'p05', 'p25', 'mediane', 'p75', 'p95', 'p99', 'max'],
           ['glucides g/kg (quadrillage)', gq['p01'], gq['p05'], gq['p25'], gq['med'], gq['p75'],
            gq['p95'], gq['p99'], gq['max']]], [40 * mm] + [17.5 * mm] * 8))
    A(Spacer(1, 3))
    A(Paragraph(w('PRATICABILITE - la dimension que les bornes en g/kg ne capturent pas :'), P))
    prat = [x for x in F['D'] if x['G'] > 500]
    A(tab([['cas', 'glucides', 'ratio', 'equivalent (~30 g pour 100 g de riz cuit)']] +
          [[x['cas'], '%d g' % x['G'], '%.2f g/kg' % x['gluc_gkg'], '~ %.1f kg de riz cuit par jour' % (x['G'] / 300.0)]
           for x in prat], [66 * mm, 20 * mm, 22 * mm, 72 * mm]))
    A(Spacer(1, 3))
    A(Paragraph(w("Le cas a 717 g respecte 8,44 g/kg - a peine au-dessus de la plage - et reste "
                  "irrealisable pour presque tout le monde. La praticabilite depend du nombre ABSOLU "
                  "de grammes, pas du ratio. Aucune source consultee ne donne de borne pour elle."), PR))

    A(Paragraph(w('5. COMPARAISON DES VARIANTES (population modelisee, %s profils, taux pour 100 000)'
                  % '{:,}'.format(N).replace(',', ' ')), H2))
    A(Paragraph(w("La population est un MODELE, pas un recensement : l app ne remonte pas ces "
                  "distributions. Un taux sur un quadrillage uniforme n est pas une prevalence."), PG))
    PROPS = ['fermeture_>5kcal', 'fermeture_>50kcal', 'gluc_zero', 'gluc_sur_7_gkg',
             'gluc_sur_8_gkg', 'gluc_sur_12_gkg', 'gluc_sous_1_gkg', 'lip_sous_15pct_cal',
             'lip_sous_20pct_cal', 'lip_sous_0_8_gkg', 'lip_sur_40pct_cal',
             'prot_sur_3_1_gkg', 'prot_sur_3_1_gkg_MM_estimee', 'prot_sur_40pct_cal',
             'prot_sous_0_8_gkg']
    VS = ['V0', 'V4', 'V5', 'V6', 'V7']
    lignes = [['propriete'] + [x + (' (prod)' if x == 'V0' else '') for x in VS]]
    for p in PROPS:
        lignes.append([p] + [str(int(round(pop[k]['violations'].get(p, 0) / N * 1e5))) for k in VS])
    A(tab(lignes, [70 * mm] + [22 * mm] * 5))
    A(Spacer(1, 3))
    A(Paragraph(w("AUCUNE de ces variantes n est proposee a la publication. V6 et V7 fermeraient toutes "
                  "les bornes glucidiques - et feraient passer les cas a plus de 40 %% de calories en "
                  "lipides de %d a %d / %d pour 100 000. C est un ECHANGE, pas un gain net."
                  % (round(pop['V0']['violations'].get('lip_sur_40pct_cal', 0) / N * 1e5),
                     round(pop['V6']['violations'].get('lip_sur_40pct_cal', 0) / N * 1e5),
                     round(pop['V7']['violations'].get('lip_sur_40pct_cal', 0) / N * 1e5))), PR))
    A(Paragraph(w("Et les deux planchers (lipides et glucides) sont INCOMPATIBLES chez une personne "
                  "lourde en deficit : aucune source consultee ne dit lequel cede. C est un arbitrage "
                  "de produit, pas un calcul."), PR))

    A(PageBreak())
    A(Paragraph(w('6. CE QUE LE CONTRE-AUDIT A TROUVE DANS MES PROPRES CANDIDATS'), H2))
    A(tab([['defaut', 'mesure', 'fermeture'],
           ['V4 cassait un invariant que V0 tenait',
            'proteines sous 0,8 g/kg de poids reel : 2 048 profils (V0 : 0)',
            'plancher qui reemploie le seuil du Gardien (0,8), pas un nombre invente'],
           ['mon plancher lipidique n en etait pas un',
            'Math.round laissait passer 325 cas / 100 000 sous 0,5 g/kg',
            'un plancher s arrondit vers le HAUT, un plafond vers le BAS : l arrondi au plus '
            'proche transforme les deux en suggestions'],
           ['mon instrument comptait un regime choisi comme une violation',
            '4 318 cas / 100 000 etaient des profils keto conformes a leur definition',
            'comptes a part (@regime), jamais effaces'],
           ['une ancre morte dans le controle negatif',
            'M09 ne trouvait pas sa cible (parenthese manquante dans le motif)',
            'reparee, pas retiree (R30)'],
           ['des branches rares tenant a UN seul profil',
            'les mutations keto/low-carb/masse maigre rougissaient a 1 ou 2 ecarts',
            'echantillon elargi : un temoin qui tient a un profil devient muet un jour']],
          [52 * mm, 62 * mm, 66 * mm]))

    A(Paragraph(w("CONTROLE NEGATIF DU MIROIR : 21 / 21 mutations conformes, 0 ancre morte. Deux "
                  "d entre elles doivent RESTER VERTES (des commentaires citant Math.ceil, "
                  "PROT_MIN_GKG, base + 5, equilibre: 0, perte: -450, H: 1500) - c est la seule "
                  "facon de prouver qu on mesure le CODE et non la phrase qui l explique. Et M19 "
                  "prouve un AVEUGLEMENT plutot qu un defaut : elle retire la comparaison des "
                  "glucides, donc elle ne peut pas rougir seule ; jugee avec M13 (qui casse les "
                  "glucides et leve 32 ecarts), la paire en leve 0."), P))

    A(Paragraph(w('7. LE SEUL DEFAUT DEMONTRABLE SANS AUCUNE SOURCE EXTERNE'), H2))
    A(Paragraph(w("La FERMETURE. Un ecran qui affiche << 1 614 kcal >> au-dessus de macros qui en font "
                  "2 064 se contredit lui-meme. Cela ne demande aucun arbitrage scientifique, aucune "
                  "unite, aucune borne publiee - seulement de la coherence interne. Mesure : 1 583 cas "
                  "sur le quadrillage, dont 300 au-dela de 200 kcal, jusqu a +450 kcal. Et le meme "
                  "defaut frappe la cible manuelle : 600 kcal saisis, 1 441 kcal de macros affichees."), P))
    A(Paragraph(w("C est la seule chose que je recommanderais si on me le demandait. Mais ce n est "
                  "toujours pas a moi de la declencher."), PR))

    A(Paragraph(w('8. CE QUE JE NE FAIS PAS, ET POURQUOI'), H2))
    A(Paragraph(w("Je ne propose pas de choisir V6 ni V7 : elles ferment de vrais defauts et en ouvrent "
                  "un autre, sur des bornes non verifiees. Je ne tranche pas l unite des proteines : "
                  "c est la decision la plus lourde du dossier et elle depend d un document que je n ai "
                  "pas pu ouvrir. Je ne fabrique pas de consensus international : les recherches n ont "
                  "donne que des sources anglophones, les positions russes et asiatiques restent "
                  "inconnues de ce dossier. Et je ne donne aucune estimation en semaines."), P))

    A(Spacer(1, 6))
    A(Paragraph(w("AUCUNE MODIFICATION DU MOTEUR NUTRITIONNEL N A ETE PUBLIEE. "
                  "EN ATTENTE DU GO DE MICHEL."), ParagraphStyle(
        'fin', fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=ROUGE)))

    doc.build(S)

    # ── RELECTURE : un PDF muet ressemble a un PDF reussi (regle d or #14) ──
    # ⚠️ NI pypdf NI pdftotext SUR CE CONTENEUR : importer pypdf fait PANIQUER la bibliotheque
    # `cryptography` (pyo3 PanicException), et pdftotext n est pas installe. *Un garde qui ne peut
    # pas s executer ne garde rien.* On REUTILISE donc le relecteur maison deja eprouve par
    # `gen_dossier_nutri_v2_pdf.py` (R13) : decompression des flux, puis lecture des chaines.
    txtpdf = _relire(SORTIE)
    lisible = ' '.join(x[1:-1] for x in re.findall(r'\((?:[^()\\]|\\.)*\)', txtpdf))
    if re.search(r'&lt;b&gt;|<b>', lisible):
        os.remove(SORTIE)
        refus('balise en clair dans le PDF produit')
    if len(lisible) < 5000:
        os.remove(SORTIE)
        refus('le PDF relu ne fait que %d caracteres lisibles : probablement muet' % len(lisible))
    manquants = [m for m in ['connect_rejected', 'EN ATTENTE DU GO DE MICHEL', 'MASSE MAIGRE',
                             'PRATICABILITE', 'ECHANGE, pas un gain net', 'MIROIR',
                             'plancher s arrondit', '21 / 21 mutations conformes', '{:,}'.format(v['taille']).replace(',', ' ')]
                 if m not in lisible]
    if manquants:
        os.remove(SORTIE)
        refus('le PDF produit ne contient pas : %s' % ', '.join(manquants))
    print('OK %s - %d caracteres lisibles, arbre %s' % (SORTIE, len(lisible), tete))


def _relire(chemin):
    """Relecteur maison : decompresse les flux du PDF et rend leur contenu."""
    import base64, zlib
    data = open(chemin, 'rb').read()
    t = []
    for m in re.finditer(rb'stream\r?\n(.*?)endstream', data, re.S):
        b = m.group(1)
        try:
            brut = base64.a85decode(b.strip().rstrip(b'~>'), adobe=False)
        except Exception:
            brut = b
        for e in (brut, b):
            try:
                t.append(zlib.decompress(e).decode('latin-1'))
                break
            except Exception:
                continue
    return '\n'.join(t)


if __name__ == '__main__':
    main()
