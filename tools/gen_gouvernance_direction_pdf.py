#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GOUVERNANCE DE DIRECTION - le registre des decisions (19/09/2026).

[!!] CHAQUE CHIFFRE SE RECOMPTE ICI, depuis le registre servi et depuis git.

[!!] UN CHIFFRE N'EST PAS FIGE, ET C'EST DIT DANS LE DOSSIER : la mesure d'origine
     (« 5 decisions rendues a Michel, 0 prise seul » dans CLAUDE.md) a BOUGE des que j'ai
     ecrit dans ce meme fichier. Un garde qui la figerait mesurerait mes propres ajouts.
     >> *Une mesure datee se cite avec sa date ; elle ne se transforme pas en invariant.*
     Ce qui EST garde, c'est le fait structurel qui subsiste : le registre existe et porte
     des decisions prises seul, qui etaient invisibles avant.

[!!] GARDE A L'ENVERS (R30) : si le registre perd son vocabulaire ou ses garanties, ce
     dossier devient faux et le generateur REFUSE de produire.

[!!] LES TOTAUX DES MUTATIONS SE LISENT DANS LEUR JOURNAL, jamais a la main.

CONTRAINTE DE POLICE : WinAnsi/cp1252 - pas d'emoji.
"""
import html
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
    SCRATCH, 'GOUVERNANCE-DE-DIRECTION-REGISTRE-DES-DECISIONS-19-09-2026.pdf')
MUT_LOG = os.environ.get('FT_MUT_LOG', '/tmp/mut_gouv.log')

REGISTRE = 'docs/DECISIONS.md'
CAP = 'tools/point_de_cap.py'
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


# ══ 1. L'ETAT, ET LE PERIMETRE PROUVE SUR LES COMMITS ════════════════════════════════
c, o = git('status', '--porcelain')
g(c == 0 and not o, 'l arbre de travail n est pas propre')
c, SHA = git('rev-parse', 'HEAD')
c, _ = git('merge-base', '--is-ancestor', SHA, 'origin/master')
g(c == 0, 'le travail n est pas pousse sur origin/master')

# ⭐ LES DEUX COMMITS DE LA PASSE : celui qui pose le registre, celui qui applique le brief.
c, SHA_REG = git('log', '-1', '--format=%H', '--', REGISTRE)
g(len(SHA_REG) == 40, 'aucun commit ne porte le registre')
c, LISTE = git('log', '--format=%H', '-2', '--', REGISTRE)
COMMITS = [x for x in LISTE.splitlines() if x.strip()]
g(len(COMMITS) == 2, '%d commits touchent le registre au lieu de 2' % len(COMMITS))

SERVIS = {'index.html', 'app.js', 'state.js', 'screens.js', 'log.js', 'coach.js', 'setup.js',
          'tracking.js', 'constants.js', 'style.css', 'sw.js', 'supabase.js',
          'capacites-ia.js', 'manifest.json', 'food-health.js', 'Code.js', 'worker.js'}
TOUS = []
for sha in COMMITS:
    c, d = git('show', '--name-only', '--pretty=', sha)
    TOUS += [f for f in d.splitlines() if f.strip()]
DEBORDE = sorted({f for f in TOUS if f in SERVIS or f.startswith('tests/')})
g(not DEBORDE, 'la passe a touche du code servi ou des tests : %s' % DEBORDE)
FICHIERS = sorted(set(TOUS))

# ⛔ AUCUN BUMP : le numero de cache n'a pas bouge sur ces deux commits.
c, AV = git('show', COMMITS[-1] + '~1:sw.js')
c2, AP = git('show', 'HEAD:sw.js')
g(c == 0 and c2 == 0, 'sw.js illisible')
mv = re.search(r"CACHE\s*=\s*'(ft-v\d+)'", AV)
mv2 = re.search(r"CACHE\s*=\s*'(ft-v\d+)'", AP)
g(mv and mv2 and mv.group(1) == mv2.group(1),
  'le numero de version a bouge alors qu aucun fichier servi ne change')
VERSION = mv2.group(1)

# ══ 2. LE REGISTRE, RECOMPTE PAR SON PROPRE LECTEUR ══════════════════════════════════
r = subprocess.run(['python3', os.path.join(ROOT, 'tools', 'point_de_cap.py'), '--check'],
                   cwd=ROOT, capture_output=True, text=True)
g(r.returncode == 0, 'le registre est malforme : ' + (r.stdout + r.stderr)[-200:])
m = re.search(r'(\d+) entrees, (\d+) prises par Claude seul, (\d+) ecart', r.stdout)
g(bool(m), 'le controle ne rend plus son compte')
N_DEC, N_SEUL, N_ECART = (int(x) for x in m.groups())
g(N_DEC >= 10, 'le registre a maigri : %d entrees' % N_DEC)
g(N_SEUL >= 4, 'moins de 4 decisions prises seul : le point le plus utile disparait')

REG = lire(REGISTRE)
N_GPT = len(re.findall(r'\|\s*\*\*GPT\*\*\s*\|', REG))
g(N_GPT >= 2, 'aucune decision ne porte l origine GPT : la tracabilite de la source est perdue')

# ⭐ LE VOCABULAIRE, LU DANS LE LECTEUR (pas dans la doc qui le decrit).
CAPS = lire(CAP)
for nom, attendu in (('ORIGINE_OK', 4), ('VISION_OK', 4), ('STATUT_OK', 5)):
    mm_ = re.search(nom + r"\s*=\s*\{([^}]*)\}", CAPS)
    g(bool(mm_), '%s a disparu du lecteur' % nom)
    g(len(re.findall(r"'[^']+'", mm_.group(1))) == attendu,
      '%s ne porte plus %d valeurs' % (nom, attendu))

# ⛔ LES GARANTIES QUI COMPTENT, cherchees dans le CODE du lecteur.
g("REMPLACÉE sans lien" in CAPS, 'le garde « REMPLACEE sans lien » a disparu')
g('aucune alternative ecartee' in CAPS, 'le garde « decision sans alternative » a disparu')
g('RAPPEL_DECISIONS' in CAPS and 'Il ne refuse rien' in CAPS,
  'le point de cap est devenu une barriere au lieu d un rappel (R19)')

# ⭐ LES TROIS APPORTS DE GPT, VERIFIES DANS LE REGISTRE LUI-MEME.
g('Source de vérité : `capacites-ia.js`' in REG,
  'D-006 ne reference plus sa source de verite : il recopie a nouveau (R2)')
g('D-008' in REG and 'treize colonnes' in REG,
  'le refus d un apport du brief (D-008) a disparu du registre')
g("l'impact sur la DIRECTION" in REG or "l'IMPACT SUR LA DIRECTION" in REG,
  'la frontiere a disparu du registre')
g('Claude décide COMMENT' in REG and 'ne décide pas seul QUELLE direction' in REG,
  'la separation d autorite a disparu')

# ⭐ LA CLOTURE porte bien les deux cases neuves.
PROC = lire('docs/PROCESSUS-DEVELOPPEMENT.md')
g('docs/DECISIONS.md' in PROC, 'la case « journal des decisions » ne pointe plus vers le registre')
g('choix pris SEUL' in PROC, 'la case « nommer les choix pris seul » a disparu de la cloture')
g('renforce l' in PROC and 'tension' in PROC, 'la question de la Vision a disparu de la cloture')

# ⭐ LE CONTROLE EST BRANCHE dans le controle de gouvernance.
CR = lire('tools/check_regles.py')
g('point_de_cap.py' in CR, 'le registre n est plus verifie a chaque livraison')

# ══ 3. LE CONTROLE NEGATIF, LU DANS SON JOURNAL ══════════════════════════════════════
g(os.path.exists(MUT_LOG), 'journal du controle negatif introuvable : %s' % MUT_LOG)
TXT = open(MUT_LOG, encoding='utf-8', errors='replace').read()
mm2 = re.search(r'(\d+)/(\d+) conformes', TXT)
g(bool(mm2), 'aucun total dans le journal du controle negatif')
MUT_OK, MUT_TOT = int(mm2.group(1)), int(mm2.group(2))
g(MUT_OK == MUT_TOT, 'controle negatif non integralement conforme : %d/%d' % (MUT_OK, MUT_TOT))
g('controle sain apres : VERT' in TXT, 'le controle sain n est pas vert apres les mutations')
N_VERTES = len(re.findall(r'doit RESTER VERT', TXT))
g(N_VERTES >= 2, 'moins de 2 mutations « vertes attendues » : on ne prouve pas '
                 'que le garde mesure le CODE et non la documentation')

# ══════════════════════════════════════════════════════════════════════════════════════
BLEU = colors.HexColor('#12355b'); GRIS = colors.HexColor('#6a6a6a')
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
CELL = ParagraphStyle('CELL', parent=ss['Normal'], fontName='Helvetica', fontSize=7.6, leading=9.4)
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
F.append(Paragraph('FORCE TRACKER - GOUVERNANCE DE DIRECTION - LE REGISTRE DES DECISIONS', H1))
F.append(Paragraph('19 septembre 2026 - un seul mecanisme, quatre usages - '
                   'aucun fichier servi, aucun test, aucun bump', SOUS))

F.append(Paragraph('LA DEMANDE, ET LE DEFAUT QU ELLE VISE', H2))
F.append(Paragraph(
    'Michel : <i>« il faut trouver une solution pour eviter que la direction de Force Tracker et '
    'Milo ne me convienne pas »</i>.<br/><br/>'
    '<b>Le defaut a ete mesure avant d etre corrige</b>, dans <code>CLAUDE.md</code> le 19/09 : le '
    'journal des versions nommait <b>5 fois</b> une decision <b>rendue a Michel</b> (« non '
    'tranche », « appartient a Michel ») et <b>zero fois</b> une decision <b>prise par Claude '
    'seul</b> - les trois « de moi-meme » du fichier etaient tous des <b>refus</b> de decider.', P))
F.append(Paragraph(
    '<b>Ce qui etait visible, c est ce qu on rendait a Michel. Ce qui restait invisible, c est ce '
    'qu on tranchait parce que ca paraissait evident.</b> Et c est exactement ainsi qu une '
    'direction derive : <i>pas par grandes decisions, mais par petites decisions que personne n a '
    'vues passer.</i>', P))
F.append(Paragraph(
    '<font color="#6a6a6a"><i>Note d honnetete : ce comptage a depuis bouge, parce que les '
    'entrees de cette passe ont ete ecrites dans le fichier mesure. Il est donc cite avec sa '
    'date, et aucun garde de ce dossier ne le fige - un garde qui le ferait mesurerait mes '
    'propres ajouts.</i></font>', P))

F.append(Paragraph('UN SEUL MECANISME, QUATRE USAGES', H2))
F.append(Paragraph(
    'Michel a retenu <b>les quatre</b> protections proposees, et a valide le principe : '
    '<b>un seul mecanisme, pas quatre systemes</b>. Le modele vient de ce qui marche deja dans le '
    'depot - <code>capacites-ia.js</code> et sa politique face a son etat reel.', P))
F.append(tab([
    ['protection demandee', 'comment elle vit dans le MEME tableau'],
    ['1. rendre visibles les choix de Claude',
     'la colonne ORIGINE (Michel / Claude / GPT / contrainte technique), avec '
     'l ALTERNATIVE ECARTEE a cote - %d decisions y sont prises par Claude seul' % N_SEUL],
    ['2. registre des decisions actees',
     'le tableau lui-meme, %d entrees : ce qui a ete decide, par qui, quand, pourquoi, si c est '
     'toujours actif, et par quoi ca a ete remplace' % N_DEC],
    ['3. Vision verifiee en cloture',
     'la colonne VISION, obligatoire a chaque ligne (coherent / neutre / cap valide / ecart a '
     'soumettre), plus deux cases ajoutees a la cloture obligatoire'],
    ['4. point de cap',
     'python3 tools/point_de_cap.py - une LECTURE GENEREE du tableau, jamais un exercice refait '
     'a la main'],
], [46 * mm, 124 * mm]))
F.append(Spacer(1, 3))
F.append(Paragraph(
    '<b>Pourquoi ca reste leger :</b> un tableau, un script, une case de cloture. Aucune nouvelle '
    'couche, aucun moteur de workflow, aucune base de donnees. <i>Quatre mecanismes separes '
    'auraient quadruple la charge au lieu de la reduire</i> (<b>R19</b>), et le point de cap est '
    '<b>genere</b> parce qu un point de cap redige a la main est un exercice qu on saute des '
    'qu on est presse - <i>c est-a-dire exactement quand la direction derive.</i>', P))

F.append(Paragraph('DEUX TROUVAILLES EN MESURANT AVANT DE CONSTRUIRE', H2))
F.append(Paragraph(
    '<b>1. La checklist de cloture cochait deja « Journal des decisions mis a jour » - et ce '
    'fichier n existait pas.</b> La case pointait dans le vide depuis le debut. Le registre ne '
    'cree donc pas une obligation neuve : il donne enfin un destinataire a une case qui en '
    'attendait un.<br/>'
    '<b>2. La question de la Vision vivait dans trois documents, mais dans aucune checklist</b> - '
    'elle dependait de qui pensait a ouvrir le fichier.', P))

F.append(Paragraph('LE BRIEF GPT, TRIE PAR R38 - QUATRE APPORTS REELS, UN REFUS', H2))
F.append(Paragraph(
    'Le brief demandait <b>ce qui venait d etre livre trois minutes plus tot</b>. R38 appliquee : '
    'trie, ni execute aveuglement ni jete. <b>Quatre apports sont reels</b>, et l un d eux corrige '
    'une faute commise le jour meme.', P))
F.append(tab([
    ['apport', 'pourquoi c est un vrai manque'],
    ['origine a 4 valeurs',
     'deux valeurs rendaient une decision d origine GPT indistinguable d une decision de Michel. '
     '%d lignes portent desormais l origine GPT.' % N_GPT],
    ['statut de la DECISION, distinct de l etat du CODE',
     'la premiere version confondait « decide » et « applique » - exactement la faute que '
     'capacites-ia.js a payee avec politique / etatCode.'],
    ['REMPLACEE porte obligatoirement son lien',
     'sans lui, impossible de savoir ce qui est encore actif : la regle d or 15 devient '
     'inverifiable. Le controle refuse une REMPLACEE orpheline.'],
    ['referencer au lieu de recopier',
     'GPT a raison CONTRE moi : D-006 recopiait ce que capacites-ia.js possede. Un registre de '
     'direction qui recopie un registre specialise cree une deuxieme source de verite (R2).'],
    ['REFUSE - impact et reversibilite en colonnes separees',
     'treize colonnes = tableau illisible = registre qu on n ouvre plus (R19, que le brief '
     's interdit lui-meme). Ils se disent dans la cellule « decision ». '
     'Le refus est enregistre comme D-008 : il est dans le registre, pas dans ma tete.'],
], [46 * mm, 124 * mm]))

F.append(Paragraph('LA FRONTIERE - ET C EST ELLE QUI EVITE LA BUREAUCRATIE', H2))
F.append(Paragraph(
    '<b>Le critere est l IMPACT SUR LA DIRECTION, jamais la taille du diff.</b> Une modification '
    'de 3 lignes peut etre structurante ; une de 500 lignes peut n etre que l execution d une '
    'decision deja prise.', P))
F.append(tab([
    ['', 'exemple concret'],
    ['N ENTRE PAS',
     'un nom de variable, un test ajoute, 20 lignes deplacees, une correction technique evidente. '
     'Local, reversible, sans consequence produit ni architecturale.'],
    ['DOIT ENTRER',
     'D-004 : consigner le cap « Claude n est pas Milo » dans un fichier NEUF plutot que dans le '
     'document cervelet. Trois lignes de diff - mais ca decide OU VIT LE CAP LONG TERME DE MILO.'],
], [30 * mm, 140 * mm]))
F.append(Spacer(1, 3))
F.append(Paragraph(
    '<b>Et la separation d autorite est ecrite noir sur blanc :</b> <i>Claude decide COMMENT '
    'realiser une direction validee ; il ne decide pas seul QUELLE direction prennent Force '
    'Tracker et Milo.</i> Cela ne veut pas dire demander une autorisation a chaque ligne - '
    'l autonomie reste entiere sur l implementation locale, les noms, les tests. <b>Mais aucun '
    'choix significatif ne doit pouvoir devenir invisible</b>, et <b>Claude ne presente jamais '
    'comme « decision du projet » un choix qu il a pris seul.</b>', P))

F.append(Paragraph('CE QUI EST EPROUVE', H2))
F.append(tab([
    ['garantie', 'mesure'],
    ['le controle peut ROUGIR', '%d/%d mutations conformes, dont %d qui doivent RESTER VERTES '
     '(une REMPLACEE bien formee, un ecart de cap qui n est pas une faute, un COMMENTAIRE citant '
     'le vocabulaire) - controle sain vert avant ET apres'
     % (MUT_OK, MUT_TOT, N_VERTES)],
    ['il refuse la livraison', 'branche dans check_regles.py : code de sortie 1 sur registre '
     'malforme, mesure au VRAI code de sortie et non derriere un « tail »'],
    ['il ne juge PAS le contenu', 'il exige que chaque decision dise QUI a tranche, ce qu elle a '
     'ECARTE et sa reponse a la Vision. Un controle qui jugerait si une decision est BONNE '
     'deciderait a la place de Michel - ce que le mecanisme existe pour empecher.'],
    ['il ne bloque pas sur le nombre', 'au-dela du seuil il SIGNALE qu un point de cap serait '
     'utile, sans rien refuser (R19)'],
], [40 * mm, 130 * mm]))

F.append(Paragraph('PERIMETRE ET ETAT FINAL', H2))
F.append(tab([
    ['', ''],
    ['fichiers de la passe', ', '.join(FICHIERS)],
    ['fichiers servis touches', 'AUCUN - et aucun test'],
    ['version', '%s, inchangee (aucun fichier servi ne change)' % VERSION],
    ['SHA final', SHA[:8]],
    ['arbre', 'propre'],
], [36 * mm, 134 * mm]))
F.append(Spacer(1, 3))
F.append(Paragraph(
    '<b>La limite, dite plutot que masquee :</b> ce mecanisme ne decide rien et n empeche rien. '
    '<b>Il rend visible ce qui etait enterre, pour que Michel puisse objecter.</b> La protection, '
    'c est lui ; le registre ne fait que lui donner de quoi mordre. <b>Et il commence le 19/09</b> : '
    'rapatrier les decisions anciennes de memoire fabriquerait de fausses attributions.', P))

F.append(Spacer(1, 6))
F.append(Paragraph(
    '<font size="7" color="#6a6a6a">Dossier genere par '
    '<i>tools/gen_gouvernance_direction_pdf.py</i>. %d gardes recomptent chaque fait depuis le '
    'registre servi et depuis git, et refusent de produire si un seul tombe. Les totaux du '
    'controle negatif sont LUS dans son journal. Hors depot (regle d or 14). SHA %s.</font>'
    % (GARDES[0], SHA[:8]), P))

# ⛔ LE DERNIER GARDE MESURE LA PAGE, PAS MON INTENTION (lecon du dossier precedent, ou le mot
#    « EXISTANT » n'apparaissait nulle part sur le papier alors que la note l'exigeait).
_PAGE = ' '.join(getattr(f, 'text', '') or '' for f in F) + ' ' + ' '.join(
    getattr(c, 'text', '') or ''
    for f in F if isinstance(f, Table) for r_ in f._cellvalues for c in r_)
for _m in ('ORIGINE', 'VISION', 'REMPLACEE', 'N ENTRE PAS', 'DOIT ENTRER', 'D-008', 'R38', 'R19'):
    g(_m in _PAGE, 'le marqueur « %s » n apparait nulle part sur la PAGE' % _m)

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                        topMargin=16 * mm, bottomMargin=14 * mm,
                        title='Force Tracker - Gouvernance de direction',
                        author='Force Tracker')
doc.build(F)
print('PDF : %s' % OUT)
print('gardes verts : %d' % GARDES[0])
print('registre : %d decisions, %d prises seul, %d d origine GPT, %d ecart(s) a soumettre'
      % (N_DEC, N_SEUL, N_GPT, N_ECART))
print('controle negatif : %d/%d, dont %d vertes attendues' % (MUT_OK, MUT_TOT, N_VERTES))
print('perimetre : %d fichiers, 0 servi 0 test, %s inchangee' % (len(FICHIERS), VERSION))
