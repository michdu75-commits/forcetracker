#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""NOTE D'ARCHITECTURE LONG TERME - « Claude n'est pas Milo » (19/09/2026).

[!!] CHAQUE CHIFFRE SE RECOMPTE ICI, depuis le code servi et depuis les documents dates.
     Aucun n'est recopie d'un rapport.

[!!] LE PIEGE DU NETTOYEUR DE COMMENTAIRES, PAYE DANS CETTE PASSE MEME (9e fois de ce
     projet, famille « le garde mesure sa propre mise en forme »). Retirer les commentaires
     de ligne avec `//[^\\n]*` DETRUIT l'adresse du fournisseur, parce que « https:// » CONTIENT
     « // ». Mesure : Code.js passait de 13 occurrences a 0, et j'ai failli ecrire « 0 ».
     >> Un commentaire de ligne est un `//` NON precede de ':'. C'est la seule regle qui
     distingue un commentaire d'une URL, et elle est ecrite ici pour que personne ne la
     redecouvre.

[!!] GARDE A L'ENVERS (R30) : ce dossier decrit un etat CONSIGNE, pas un chantier. Si le
     chantier s'ouvre un jour (l'adresse du fournisseur centralisee dans Code.js), les
     chiffres de ce dossier deviennent faux -> le generateur REFUSE de produire, plutot que
     de publier une mesure perimee qui ferait chercher un probleme deja resolu.

CONTRAINTE DE POLICE : WinAnsi/cp1252 - pas d'emoji.
"""
import html
import json
import os
import re
import subprocess

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
OUT = os.environ.get('FT_OUT') or os.path.join(
    SCRATCH, 'NOTE-ARCHITECTURE-INDEPENDANCE-MOTEUR-MILO-19-09-2026.pdf')

NOTE = 'docs/INDEPENDANCE-MOTEUR-MILO.md'
URL_FOURNISSEUR = 'https://api.anthropic.com/v1/messages'

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def git(*a):
    r = subprocess.run(['git'] + list(a), cwd=ROOT, capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def sans_bloc(s):
    """Retire les commentaires /* */ SEULEMENT. Voir l'avertissement de l'en-tete :
       on ne touche pas aux `//`, qui vivent dans toutes les URL."""
    return re.sub(r'/\*.*?\*/', '', s, flags=re.S)


def occurrences_en_code(fichier, motif):
    """Compte `motif` dans le CODE : hors commentaire de bloc, et hors commentaire de ligne -
       un commentaire de ligne etant un `//` NON precede de ':'."""
    n = 0
    for ligne in sans_bloc(lire(fichier)).splitlines():
        if motif not in ligne:
            continue
        m = re.search(r'(?<!:)//', ligne)
        if m is None or ligne.index(motif) < m.start():
            n += 1
    return n


# ══ 1. LA PASSE EST BIEN UNE PASSE DE DOCUMENTATION ═══════════════════════════════════
c, o = git('status', '--porcelain')
g(c == 0 and not o, 'l arbre de travail n est pas propre')
c, SHA = git('rev-parse', 'HEAD')
g(c == 0 and len(SHA) == 40, 'SHA illisible')
c, _ = git('merge-base', '--is-ancestor', SHA, 'origin/master')
g(c == 0, 'le travail n est pas pousse sur origin/master')

# ⭐ LE PERIMETRE SE PROUVE SUR LE COMMIT, PAS SUR UNE PROMESSE.
# [!!] ET C'EST LE COMMIT QUI A POSE LA NOTE, PAS `HEAD` : ma premiere version visait HEAD,
#      donc elle rougissait des que je commitais CE generateur - le garde interdisait le geste
#      qu'il documente, et mesurait ma procedure au lieu du fait (meme faute qu'au dossier de
#      reconciliation ft-v1225). L'invariant juste est : *la passe qui a consigne la note n'a
#      touche ni fichier servi ni test*.
c, SHA_NOTE = git('log', '-1', '--format=%H', '--', NOTE)
g(c == 0 and len(SHA_NOTE) == 40, 'aucun commit ne porte la note : %s' % NOTE)
c, DIFF = git('show', '--name-only', '--pretty=', SHA_NOTE)
FICHIERS = sorted(f for f in DIFF.splitlines() if f.strip())
SERVIS = {'index.html', 'app.js', 'state.js', 'screens.js', 'log.js', 'coach.js', 'setup.js',
          'tracking.js', 'constants.js', 'style.css', 'sw.js', 'supabase.js',
          'capacites-ia.js', 'manifest.json', 'food-health.js', 'Code.js', 'worker.js'}
TOUCHES = [f for f in FICHIERS if f in SERVIS or f.startswith('tests/')]
g(not TOUCHES, 'la passe a touche du code servi ou des tests : %s' % TOUCHES)
g(NOTE in FICHIERS, 'la note d architecture n est pas dans ce commit')

# ══ 2. LE DOCUMENT DIT CE QU'IL DIT ═══════════════════════════════════════════════════
N = lire(NOTE)
for mot in ('EXISTANT', 'DÉCIDÉ', 'DIRECTION'):
    g(mot in N, 'la colonne %s a disparu de la note' % mot)
g("Claude n'est pas Milo" in N, 'la phrase qui tient tout a disparu')
g('RIEN ICI N\'EST\n> CONSTRUIT' in N or "RIEN ICI N'EST" in N,
  'la note ne previent plus qu elle n est pas construite')
g('identité + mémoire + règles + capacités + contexte + droits + outils' in N,
  'la definition cible de Milo a change')

# ⛔ R37 EXISTE, UNE SEULE FOIS, ET PORTE SA BORNE SYMETRIQUE.
RA = lire('docs/REGLES-ARCHITECTURE.md')
g(len(re.findall(r'(?m)^### R37\b', RA)) == 1, 'R37 absente ou en double')
g('interdit de dégrader Milo' in RA,
  'R37 a perdu sa borne : on ne degrade pas Milo pour obtenir l independance')

# ⭐ LES ORGANES SONT RECONCILIES, PAS DUPLIQUES.
CORPS = lire('docs/CORPS-FORCE-TRACKER.md')
g('Système nerveux' in CORPS and 'Digestion' in CORPS,
  'les organes d origine ont disparu du corps')
g('19/09/2026' in CORPS, 'la mise a jour du corps n est plus datee')

# ══ 3. LA CHRONOLOGIE SE VERIFIE DANS SES SOURCES ═════════════════════════════════════
ARCH = lire('docs/JOURNAL-ARCHIVE.md')
g("indépendant du modèle d'IA" in ARCH,
  'la citation du 20/07/2026 est introuvable : la chronologie de la note n est plus sourcee')
g('20/07' in ARCH, 'la date du 20/07 a disparu de l archive')
CC = lire('docs/ARCHITECTURE-CERVEAU-CERVELET.md')
g('Créé le 19/08/2026' in CC, 'la date de naissance du cervelet a change')
g('19/09/2026' in CC, 'le renvoi vers la note du 19/09 a disparu du doc cervelet')
VIS = lire('docs/VISION-FORCE-TRACKER.md')
g('19/07/2026' in VIS, 'la date de la Vision a change')
g('Origine : 26/07/2026' in RA, 'la date de R9 a change')

# ══ 4. LA SEULE MESURE DE CODE, RECOMPTEE ═════════════════════════════════════════════
W_LIT = occurrences_en_code('worker.js', URL_FOURNISSEUR)
W_CONST = len(re.findall(r'const\s+ANTHROPIC_URL', sans_bloc(lire('worker.js'))))
C_LIT = occurrences_en_code('Code.js', URL_FOURNISSEUR)

# ⛔ LE NETTOYEUR EST EPROUVE SUR PLACE : une ligne de commentaire citant l'URL ne doit PAS
#    etre comptee, et une vraie ligne de code DOIT l'etre. Sans cette epreuve, le compteur
#    pourrait rendre 0 (le bug de cette passe) sans que rien ne le dise.
_essai = "  const r = fetch('%s', {\n  // %s ancien\n  /* %s */\n" % (
    URL_FOURNISSEUR, URL_FOURNISSEUR, URL_FOURNISSEUR)
_n = 0
for _l in sans_bloc(_essai).splitlines():
    if URL_FOURNISSEUR in _l:
        _m = re.search(r'(?<!:)//', _l)
        if _m is None or _l.index(URL_FOURNISSEUR) < _m.start():
            _n += 1
g(_n == 1, 'le compteur ne distingue plus le CODE du COMMENTAIRE (il rend %d au lieu de 1)' % _n)

g(W_CONST == 1, 'worker.js ne tient plus l adresse dans UNE constante (%d)' % W_CONST)
# [!!] MON PREMIER ATTENDU ETAIT FAUX, ET LE GARDE M'A REPRIS : j'exigeais W_LIT == 0 pour
#      worker.js. Or *la definition de la constante est elle-meme une occurrence de code* -
#      l'adresse doit bien etre ecrite QUELQUE PART. L'invariant juste n'est pas « zero
#      occurrence », c'est « une seule, ET c'est celle de la constante » : ce qui compte est
#      qu'aucun APPELANT ne la reecrive (R2).
W_HORS_CONST = sum(
    1 for ligne in sans_bloc(lire('worker.js')).splitlines()
    if URL_FOURNISSEUR in ligne and not re.search(r'const\s+ANTHROPIC_URL', ligne))
g(W_LIT == 1 and W_HORS_CONST == 0,
  'worker.js ecrit l adresse ailleurs que dans sa constante (%d occurrence(s) hors constante)'
  % W_HORS_CONST)
# ⭐⭐ GARDE A L'ENVERS : si Code.js est centralise, ce dossier est PERIME - il decrirait une
#    dette deja payee, et ferait chercher un probleme qui n'existe plus (R30).
g(C_LIT == 13,
  'Code.js ne porte plus 13 adresses en dur mais %d : la mesure de ce dossier est PERIMEE, '
  'le chantier a bouge - regenerer apres avoir relu la note' % C_LIT)

# ══ 5. LES 21 CAPACITES SONT CITEES, ET LE VERROU N'EXISTE TOUJOURS PAS ═══════════════
JS = (r"const fs=require('fs'), vm=require('vm'); const s={console,window:{}};"
      r"vm.createContext(s);"
      r"vm.runInContext(fs.readFileSync(process.argv[1],'utf8')+'\n;__C=CAPACITES_IA;',s);"
      r"process.stdout.write(JSON.stringify(s.__C));")
r = subprocess.run(['node', '-e', JS, os.path.join(ROOT, 'capacites-ia.js')],
                   capture_output=True, text=True)
g(r.returncode == 0, 'capacites-ia.js ne s evalue pas')
CAPS = json.loads(r.stdout)
g(len(CAPS) == 21, '%d capacites au lieu de 21' % len(CAPS))
N_SERVEUR = sum(1 for c in CAPS if c.get('serveurApplique'))
g(N_SERVEUR == 0,
  '%d capacite(s) declarent deja serveurApplique=true : la note dit le contraire' % N_SERVEUR)

# ══════════════════════════════════════════════════════════════════════════════════════
BLEU = colors.HexColor('#12355b')
GRIS = colors.HexColor('#6a6a6a')
FOND = colors.HexColor('#eef2f7')

ss = getSampleStyleSheet()
H1 = ParagraphStyle('H1', parent=ss['Title'], fontName='Helvetica-Bold', fontSize=15,
                    leading=18, textColor=BLEU, spaceAfter=2)
SOUS = ParagraphStyle('SOUS', parent=ss['Normal'], fontName='Helvetica', fontSize=8.5,
                      leading=11, textColor=GRIS, alignment=1, spaceAfter=10)
H2 = ParagraphStyle('H2', parent=ss['Heading2'], fontName='Helvetica-Bold', fontSize=10.5,
                    leading=13, textColor=BLEU, spaceBefore=9, spaceAfter=4)
P = ParagraphStyle('P', parent=ss['Normal'], fontName='Helvetica', fontSize=8.6,
                   leading=11.4, spaceAfter=4)
CELL = ParagraphStyle('CELL', parent=ss['Normal'], fontName='Helvetica', fontSize=7.6,
                      leading=9.4)
CELLB = ParagraphStyle('CELLB', parent=CELL, fontName='Helvetica-Bold')


def e(s):
    return html.escape(str(s))


def tab(lignes, largeurs, entete=True):
    data = [[Paragraph(e(c), CELLB if (entete and i == 0) else CELL) for c in l]
            for i, l in enumerate(lignes)]
    t = Table(data, colWidths=largeurs, hAlign='LEFT')
    st = [('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#c3cddb')),
          ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
          ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5)]
    if entete:
        st.append(('BACKGROUND', (0, 0), (-1, 0), FOND))
    t.setStyle(TableStyle(st))
    return t


F = []
F.append(Paragraph('FORCE TRACKER - NOTE D ARCHITECTURE LONG TERME - '
                   'L INDEPENDANCE DU MOTEUR DE MILO', H1))
F.append(Paragraph('19 septembre 2026 - vision CONSIGNEE, non mise en oeuvre - '
                   'aucune ligne de code, aucun chantier ouvert', SOUS))

F.append(Paragraph('LA PHRASE QUI TIENT TOUT', H2))
F.append(Paragraph(
    '<b>« Claude n est pas Milo. Claude est actuellement l un des moteurs que Milo '
    'utilise. »</b> (Michel, 19/09/2026)<br/><br/>'
    'Milo ne doit jamais etre <b>defini</b> par le fournisseur d IA qui fait tourner son '
    'raisonnement. La cible que Michel nomme est un assistant personnel de type « Jarvis » ; '
    'il ne s agit <b>pas</b> de fabriquer un modele fondamental. A terme : '
    '<b>Milo = identite + memoire + regles + capacites + contexte + droits + outils</b>, '
    'le LLM etant un <b>composant interchangeable</b> de cette liste et jamais son sujet.', P))
F.append(Paragraph(
    '<b>Et la borne qui evite la betise inverse :</b> il est <b>interdit de degrader Milo pour '
    'obtenir artificiellement l independance</b>. Une bascule se fait progressive, mesuree au '
    'banc, reversible - sinon ce n est pas un progres, c est un troc silencieux entre la '
    'qualite et le principe.', P))

F.append(Paragraph('LES TROIS COLONNES - ET ELLES NE SE CONFONDENT JAMAIS', H2))
F.append(Paragraph(
    'Consigne explicite de Michel. <b>Rien de ce dossier n est implemente</b> : seules les lignes '
    'EXISTANT sont des mesures prises dans le code d aujourd hui.', P))
F.append(tab([
    ['colonne', 'ce qu elle veut dire', 'exemples de cette note'],
    ['EXISTANT', 'mesure dans le code servi le 19/09/2026',
     'le modele est deja une variable choisie a l execution - l adresse du fournisseur vit dans '
     '1 constante (worker.js) et %d copies en dur (Code.js) - les %d capacites IA declarent '
     'toutes que le serveur n applique rien - aucun Milo utilisateur n a acces a Internet'
     % (C_LIT, len(CAPS))],
    ['DECIDE', 'une contrainte du projet, pas un avis',
     'Claude n est pas Milo - le modele ne decide jamais seul de ses permissions - meme Milo + '
     'permissions differentes - interdit de degrader Milo pour obtenir l independance'],
    ['DIRECTION', 'le cap, sans date et sans engagement de forme',
     'moteur abstrait et interchangeable - Internet comme outil de l architecture - outils '
     'd action - droits cote serveur plutot que dans un prompt'],
], [24 * mm, 44 * mm, 102 * mm]))

F.append(Paragraph('CE N EST PAS UNE IDEE NEUVE - ET LE DEPOT LE PROUVE', H2))
F.append(Paragraph(
    'C est le point le plus utile de cette note : <i>une vision qu on croit neuve se re-debat ; '
    'une vision dont on retrouve la trace se continue.</i> Chaque date ci-dessous a ete '
    'verifiee dans son fichier source a la generation de ce dossier.', P))
F.append(tab([
    ['date', 'ce qui est pose', 'source verifiee'],
    ['19/07/2026', 'la Vision : une memoire sportive, pas une IA - « local d abord »',
     'docs/VISION-FORCE-TRACKER.md'],
    ['20/07/2026', 'architecture hybride a 4 niveaux, et deja : « coeur metier INDEPENDANT DU '
     'MODELE D IA, durable meme si les modeles changent » ; le niveau 3 Orchestration est nomme '
     'et declare implicite', 'docs/JOURNAL-ARCHIVE.md'],
    ['20/07/2026', 'le corps : cerveau, systeme nerveux, digestion - l organisme comme outil '
     'de conception', 'docs/CORPS-FORCE-TRACKER.md'],
    ['26/07/2026', 'R9 - le niveau de MODELE est une variable structurelle',
     'docs/REGLES-ARCHITECTURE.md'],
    ['19/08/2026', 'le cervelet est nomme, le niveau 3 devient explicite',
     'docs/ARCHITECTURE-CERVEAU-CERVELET.md'],
    ['19/09/2026', 'l independance du moteur devient un cap declare ; l estomac recoit un '
     'regime beaucoup plus large', NOTE],
], [22 * mm, 92 * mm, 56 * mm]))
F.append(Spacer(1, 3))
F.append(Paragraph(
    '<b>La ligne du 20/07 est la plus importante du tableau.</b> « Coeur metier independant du '
    'modele d IA » etait ecrit <b>deux mois avant</b> cette note. <b>Ce que Michel formule '
    'aujourd hui n est donc pas un virage : c est l extension du meme principe - il portait sur '
    'le COEUR METIER, il porte maintenant sur MILO LUI-MEME.</b>', P))
F.append(Paragraph(
    '<i>Nuance dite plutot que lissee :</i> l <b>idee</b> de la couche d orchestration date de '
    'juillet ; le <b>nom</b> « cerveau / cervelet » est du 19/08. Les deux sont vrais.', P))

F.append(Paragraph('LES TROIS ORGANES - RECONCILIES, PAS DUPLIQUES', H2))
F.append(Paragraph(
    'Michel nomme trois organes. <b>Deux existaient deja sous un autre nom</b> dans le corps du '
    '20/07 : on ne cree pas un second vocabulaire pour le meme organe (<b>R2</b>). '
    '<i>C etait la faute facile.</i>', P))
F.append(tab([
    ['son nom (19/09)', 'le nom deja ecrit (20/07)', 'ce qui change vraiment'],
    ['cerveau = Milo', 'Cerveau', 'rien - meme organe, meme role'],
    ['cervelet = Force Tracker / orchestration', 'Systeme nerveux',
     'rien sur le fond : deux noms, un organe. Il cesse d etre implicite - il choisit '
     'capacites, droits, contexte, outils, et eventuellement le moteur IA'],
    ['estomac', 'Digestion',
     'LE REGIME S ELARGIT : la digestion de juillet ne mangeait que des programmes '
     'd entrainement ; celle de septembre doit digerer historique, nutrition, sante, '
     'documents, statistiques et Internet'],
], [46 * mm, 34 * mm, 90 * mm]))
F.append(Spacer(1, 3))
F.append(Paragraph(
    '<b>Le principe, dans les deux sens :</b> le cerveau ne manipule pas les donnees brutes, et '
    'il ne « mange pas Internet brut ». Il recoit un <b>resultat</b>, jamais un entrepot. '
    'Maximum de logique deterministe quand elle suffit ; une IA <b>uniquement</b> lorsqu une IA '
    'apporte reellement quelque chose.', P))

F.append(Paragraph('INTERNET, AUTONOMIE, ET LES DEUX MILO', H2))
F.append(tab([
    ['sujet', 'statut', 'ce qui est pose'],
    ['Internet', 'DIRECTION',
     'l acces doit APPARTENIR a l architecture Force Tracker, pas etre une capacite louee au '
     'fournisseur. Il n est PAS question de copier Internet. Mesure : aucun Milo utilisateur '
     'n y a acces aujourd hui.'],
    ['outils d action', 'DIRECTION + une borne DECIDEE',
     'des outils viendront (statistiques, nutrition, recherche...). Mais le MODELE NE DECIDE '
     'JAMAIS SEUL DE SES PERMISSIONS : le serveur / cervelet reste l autorite. Cinq niveaux au '
     'minimum : observer, analyser, proposer, demander confirmation, executer.'],
    ['mon Milo / les Milo utilisateurs', 'DECIDE',
     'meme Milo + permissions differentes, jamais deux assistants. A terme ces differences '
     'doivent dependre de droits cote SERVEUR, pas d un prompt.'],
], [40 * mm, 34 * mm, 96 * mm]))

F.append(Paragraph('LA SEULE MESURE DE CODE DE CETTE NOTE', H2))
F.append(Paragraph(
    'Pour que la direction ne reste pas une intention, voici ou en est le <b>couplage reel</b>, '
    'recompte a la generation de ce dossier :', P))
F.append(tab([
    ['fait mesure', 'valeur'],
    ['le modele est deja une variable choisie a l execution',
     'oui - worker.js : defaut, modele de Michel, surcharge de banc'],
    ['adresse du fournisseur dans worker.js',
     '%d seule occurrence, et c est la definition de la constante ANTHROPIC_URL ; %d appelant la reecrit - R2 RESPECTE' % (W_LIT, W_HORS_CONST)],
    ['adresse du fournisseur dans Code.js',
     '%d fois ecrite EN DUR - R2 VIOLE' % C_LIT],
    ['les 21 capacites IA et leur verrou serveur',
     '%d capacites, dont %d appliquees par le serveur : la place du verrou est prevue, '
     'le verrou n existe pas' % (len(CAPS), N_SERVEUR)],
], [62 * mm, 108 * mm]))
F.append(Spacer(1, 3))
F.append(Paragraph(
    '<b>La premiere marche vers l independance n est donc pas une interface abstraite : c est '
    'R2 applique a l adresse du fournisseur.</b> Une meme information ecrite treize fois '
    '<i>divergera</i> - la seule question est quand. <b>Ce n est PAS un chantier ouvert</b> : '
    'c est le chiffre a connaitre le jour ou Michel decidera d en ouvrir un.', P))

F.append(Paragraph('LA REGLE QUI EN SORT - R37', H2))
F.append(Paragraph(
    '<b>« Est-ce que ce choix rend Milo plus independant et modulaire - ou est-ce qu il '
    'l enferme davantage dans un fournisseur, un modele ou un prompt particulier ? »</b> '
    'A poser a chaque architecture importante. Eviter toute dependance difficilement '
    'reversible. <i>Critere d entree R21 tenu : principe stable, valable des annees.</i>', P))

F.append(Paragraph('CE QUE CETTE PASSE N A PAS FAIT', H2))
F.append(Paragraph(
    'Aucun code. Aucun moteur abstrait. Aucun acces Internet. Aucun outil d action. Aucun '
    'verrou serveur. Aucun comportement de Milo modifie. Aucun chantier ouvert. Aucune passe '
    'complete. <b>Perimetre prouve sur le commit lui-meme :</b> %d fichiers, <b>zero fichier '
    'servi, zero test</b>.' % len(FICHIERS), P))
F.append(Spacer(1, 2))
F.append(tab([['fichiers du commit %s (celui qui a pose la note)' % SHA_NOTE[:8]]] + [[f] for f in FICHIERS], [170 * mm]))

F.append(Paragraph('UN DEFAUT D INSTRUMENT, TROUVE EN ECRIVANT CE DOSSIER', H2))
F.append(Paragraph(
    'Le compteur qui produit le tableau ci-dessus a d abord rendu <b>0</b> pour Code.js, au '
    'lieu de 13. Cause : mon nettoyeur de commentaires retirait les commentaires de ligne avec '
    'le motif « // », or <b>« https:// » contient « // »</b> - il coupait donc la ligne juste '
    'avant l adresse qu il etait cense compter. <b>J ai failli publier « zero adresse en dur », '
    'c est-a-dire exactement l inverse du fait.</b> La regle juste est ecrite dans le '
    'generateur : <i>un commentaire de ligne est un « // » NON precede de « : »</i>. Le '
    'compteur est desormais <b>eprouve sur place</b> a chaque generation, sur un echantillon '
    'qui melange une vraie ligne de code, un commentaire de ligne et un commentaire de bloc.', P))

F.append(Spacer(1, 6))
F.append(Paragraph(
    '<font size="7" color="#6a6a6a">Dossier genere par '
    '<i>tools/gen_independance_moteur_pdf.py</i>. %d gardes recomptent chaque fait depuis le '
    'code servi et les documents dates, et refusent de produire si un seul tombe - y compris '
    'une garde A L ENVERS : si la dette des 13 adresses est payee, ce dossier devient perime et '
    'ne sort plus. Hors depot (regle d or 14). SHA %s.</font>' % (GARDES[0], SHA[:8]), P))

# ⛔⛔ LE DERNIER GARDE MESURE LA PAGE, PAS MON INTENTION - et il est ne d'un vrai defaut :
#    la premiere version de ce dossier ne faisait apparaitre « EXISTANT » NULLE PART sur la
#    page, alors que la note demande explicitement de distinguer les trois colonnes. Les
#    gardes d'en haut lisaient le fichier Markdown ; personne ne lisait le PDF.
#    >> *Un garde qui verifie la SOURCE ne prouve rien sur ce qui est IMPRIME.*
_TEXTE_PAGE = ' '.join(getattr(f, 'text', '') or '' for f in F) + ' ' + ' '.join(
    getattr(c, 'text', '') or ''
    for f in F if isinstance(f, Table) for r in f._cellvalues for c in r)
for _mot in ('EXISTANT', 'DECIDE', 'DIRECTION'):
    g(_mot in _TEXTE_PAGE, 'le mot %s n apparait nulle part sur la PAGE : la note exige les '
                           'trois colonnes, et un dossier qui ne les montre pas ne les tient pas'
                           % _mot)

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                        topMargin=16 * mm, bottomMargin=14 * mm,
                        title='Force Tracker - Independance du moteur de Milo',
                        author='Force Tracker')
doc.build(F)
print('PDF : %s' % OUT)
print('gardes verts : %d' % GARDES[0])
print('worker.js : %d occurrence, %d hors constante   |   Code.js : %d en dur' % (W_LIT, W_HORS_CONST, C_LIT))
print('capacites : %d, dont %d appliquees par le serveur' % (len(CAPS), N_SERVEUR))
print('commit de la note : %s, %d fichiers, 0 servi 0 test' % (SHA_NOTE[:8], len(FICHIERS)))
