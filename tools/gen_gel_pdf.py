#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/PHASE-OBSERVATION.pdf — le chantier Nutrition est GELE, et ce document ne dit
   que ca. Vingtieme de la serie, et le seul qui n'annonce aucun changement.

Ses gardes verifient exactement une chose : que RIEN n'a bouge. Ils relisent les 21 regles, leur
gravite, les seuils, le format du carnet, la promesse de confidentialite — et surtout ils refusent
de produire si le GEL LUI-MEME a disparu des trois fichiers ou on le relira. Une decision qu'on ne
relit pas disparait avec la session (R27), et le suivant « repare » ce qui etait un choix (R30).

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji, entites nommees comprises.
"""
import html
import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether, Preformatted, PageBreak)
from reportlab.pdfbase.pdfmetrics import stringWidth




ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'PHASE-OBSERVATION.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
SETUP = open(os.path.join(ROOT, 'setup.js'), encoding='utf-8').read()
HTML = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
CLAUDEMD = open(os.path.join(ROOT, 'CLAUDE.md'), encoding='utf-8').read()
CONTEXTE = open(os.path.join(ROOT, 'docs', 'CONTEXTE-ACTUEL.md'), encoding='utf-8').read()
CONCEPT = open(os.path.join(ROOT, 'docs', 'DOUANE-NUTRITION.md'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = \'(ft-v\d+)\'", SW) or [None, '?'])[1]


def sans_com(t):
    t = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), t)
    return '\n'.join(l for l in t.split('\n') if not l.strip().startswith('//'))


CODE = sans_com(APP)
LIGNES = CODE.split('\n')
DECL = [(i, re.match(r'(?:async )?function (\w+)\(', l).group(1))
        for i, l in enumerate(LIGNES) if re.match(r'(?:async )?function \w+\(', l)]


def corps(nom):
    for k, (i, n) in enumerate(DECL):
        if n == nom:
            return '\n'.join(LIGNES[i:(DECL[k + 1][0] if k + 1 < len(DECL) else len(LIGNES))])
    return ''


C_DOUANE = corps('_douaneLigne')
C_COMPTER = corps('_douaneCompter')
ECRIVAINS = ['rejouerRepas', 'quickAddFood', 'addFoodEntry', 'saveEditFood']
N_REGLES = len(re.findall(r"dit\('", C_DOUANE))
N_INVALID = len(re.findall(r"'INVALID',", C_DOUANE))
N_APPELS = len(re.findall(r'_douaneLigne\(', CODE))
CLE = (re.search(r"DOUANE_OBS_CLE = '([^']+)'", CODE) or [None, '?'])[1]
COMBOS_MAX = (re.search(r'DOUANE_COMBOS_MAX = (\d+)', CODE) or [None, '?'])[1]

# [!!] LES GARDES DU GEL — ce document n'affirme qu'une chose : que RIEN n'a bouge.
#    Chacun verifie cette affirmation dans le code servi, pas dans un souvenir.
if VERSION != 'ft-v1206':
    raise SystemExit('sw.js dit %s, pas ft-v1206 : une version a ete livree depuis le gel. Ce '
                     'document affirme que rien n a bouge — le verifier avant de le republier.'
                     % VERSION)
if (N_REGLES, N_INVALID) != (21, 9):
    raise SystemExit('La douane porte %d regles dont %d INVALID, pas 21/9 : LE GEL EST ROMPU.'
                     % (N_REGLES, N_INVALID))
if "dit('energie_incoherente', 'WARN'," not in C_DOUANE:
    raise SystemExit('LE CAS DES 48 kcal N EST PLUS UN AVERTISSEMENT : le gel interdit de changer '
                     'la gravite d une regle.')
if not re.search(r'd\s*>=\s*25\s*&&\s*d\s*/\s*b\s*>\s*0\.30', C_DOUANE):
    raise SystemExit('LE SEUIL ENERGETIQUE A CHANGE : « ne modifie aucun seuil ».')
if N_APPELS != 5:
    raise SystemExit('`_douaneLigne` a %d occurrences, pas 5 : un ecrivain a ete ajoute ou retire.'
                     % N_APPELS)
for n in ECRIVAINS:
    if '_douaneLigne(' not in corps(n):
        raise SystemExit('`%s` ne passe plus par la douane : le gel est rompu.' % n)
    if re.search(r'if\s*\(\s*_douaneLigne|(const|let|var)\s+\w+\s*=\s*_douaneLigne', corps(n)):
        raise SystemExit('`%s` LIT le verdict : une regle est devenue bloquante, ce que le gel '
                         'interdit explicitement.' % n)
if CLE != 'ft4_douane_obs' or COMBOS_MAX != '40':
    raise SystemExit('LE FORMAT DU CARNET A CHANGE (cle %s, borne %s) : « ne modifie pas le format '
                     'du carnet d observation ».' % (CLE, COMBOS_MAX))
if re.search(r'\bligne\.(name|kcal|prot|carbs|fat|per100|date|meal|portionLabel)\b', C_COMPTER):
    raise SystemExit('LE CARNET GARDE UN CHAMP DE REPAS : la promesse de confidentialite est rompue.')
if (len(re.findall(r'ligne\.sourceId', C_COMPTER)) != 1
        or re.search(r'String\(\s*ligne\.sourceId', C_COMPTER)):
    raise SystemExit('LE CARNET TOUCHE A L IDENTIFIANT DE SOURCE AUTREMENT QUE PAR SON EXISTENCE.')
if re.search(r'douane', sans_com(SETUP), re.I):
    raise SystemExit('`setup.js` mentionne la douane : le carnet doit rester hors du cloud.')
if 'loadDouaneAdmin()' not in HTML:
    raise SystemExit('Le rapport n est plus lisible depuis Profil > Admin : Michel ne pourrait plus '
                     'l envoyer, et toute la phase d observation perdrait son sens.')
# [*] ET LE GEL DOIT ETRE ECRIT LA OU ON LE LIRA : sinon il ne survit pas a la session suivante.
for chemin, texte, nom in ((CLAUDEMD, 'PHASE D\'OBSERVATION RÉELLE', 'CLAUDE.md'),
                           (CONTEXTE, 'PHASE D\'OBSERVATION RÉELLE', 'docs/CONTEXTE-ACTUEL.md'),
                           (CONCEPT, 'GELÉ', 'docs/DOUANE-NUTRITION.md')):
    if texte not in chemin:
        raise SystemExit('LE GEL N EST PAS ECRIT DANS %s : une decision qu on ne relit pas '
                         'disparait avec la session (R27), et le suivant « repare ».' % nom)


ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
FONDC = colors.HexColor('#EEEEEC')
TRAIT = colors.HexColor('#D8D8D4')
VERT = colors.HexColor('#1E7A46')
ORANGE = colors.HexColor('#B26A00')

S = getSampleStyleSheet()
st = {
    'titre': ParagraphStyle('titre', parent=S['Title'], fontName='Helvetica-Bold',
                            fontSize=19, leading=23, textColor=ENCRE, alignment=TA_LEFT, spaceAfter=2),
    'sous': ParagraphStyle('sous', parent=S['Normal'], fontName='Helvetica',
                           fontSize=9.5, leading=13, textColor=GRIS, spaceAfter=14),
    'h1': ParagraphStyle('h1', parent=S['Heading1'], fontName='Helvetica-Bold',
                         fontSize=13, leading=16, textColor=ROUGE, spaceBefore=14, spaceAfter=6),
    'p': ParagraphStyle('p', parent=S['Normal'], fontName='Helvetica',
                        fontSize=9.3, leading=13.2, textColor=ENCRE, spaceAfter=6),
    'petit': ParagraphStyle('petit', parent=S['Normal'], fontName='Helvetica',
                            fontSize=8.2, leading=11.5, textColor=GRIS, spaceAfter=5),
    'cell': ParagraphStyle('cell', parent=S['Normal'], fontName='Helvetica',
                           fontSize=8.1, leading=10.6),
    'cellb': ParagraphStyle('cellb', parent=S['Normal'], fontName='Helvetica-Bold',
                            fontSize=8.1, leading=10.6),
    'code': ParagraphStyle('code', parent=S['Normal'], fontName='Courier',
                           fontSize=7.0, leading=8.8, textColor=ENCRE),
}


def _v(x, ou='texte'):
    if isinstance(x, str):
        for ch in x:
            try:
                ch.encode('cp1252')
            except UnicodeEncodeError:
                raise SystemExit('CARACTERE NON RENDU %r (%s) dans %s' % (ch, hex(ord(ch)), ou))
        for m in re.finditer(r'&#(\d+);|&#[xX]([0-9a-fA-F]+);', x):
            n = int(m.group(1)) if m.group(1) else int(m.group(2), 16)
            try:
                chr(n).encode('cp1252')
            except UnicodeEncodeError:
                raise SystemExit('ENTITE HTML NON RENDUE %s dans %s' % (m.group(0), ou))
        for m in re.finditer(r'&([A-Za-z][A-Za-z0-9]{1,15});', x):
            ch = html.unescape(m.group(0))
            if len(ch) == 1:
                try:
                    ch.encode('cp1252')
                except UnicodeEncodeError:
                    raise SystemExit('ENTITE NOMMEE NON RENDUE %s (%s) dans %s'
                                     % (m.group(0), hex(ord(ch)), ou))
    return x


C = "<font face='Courier'>%s</font>"


def P(t, s='p'):
    return Paragraph(_v(t, 'paragraphe'), st[s])


def encadre(titre, corps_, couleur=ROUGE):
    t = Table([[Paragraph('<b>%s</b>' % _v(titre, 'titre'), st['cellb'])],
               [Paragraph(_v(corps_, 'corps'), st['cell'])]], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FOND),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBEFORE', (0, 0), (0, -1), 2.4, couleur), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    return KeepTogether(t)


def tableau(entetes, ligs, largeurs):
    data = [[Paragraph('<b>%s</b>' % _v(h, 'en-tete'), st['cellb']) for h in entetes]]
    for l in ligs:
        data.append([Paragraph(_v(c, 'cellule'), st['cell']) for c in l])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EDEDEA')),
        ('GRID', (0, 0), (-1, -1), 0.4, TRAIT), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    return t


_LARG = 165 * mm - 12


def bloc_code(txt, legende=None):
    _v(txt, 'bloc de code')
    for l in txt.split('\n'):
        if stringWidth(l, 'Courier', 7.0) > _LARG:
            raise SystemExit('LIGNE QUI DEBORDE (%d car) : %s' % (len(l), l[:70]))
    t = Table([[Preformatted(txt, st['code'])]], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FONDC),
        ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBEFORE', (0, 0), (0, -1), 2.0, TRAIT), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    if legende:
        return KeepTogether([Paragraph(_v(legende, 'legende'), st['petit']), t])
    return t


def pied(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(GRIS)
    canvas.drawString(22 * mm, 12 * mm,
                      'Force Tracker — le hub de preparation Nutrition (%s) — 13/09/2026' % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()







# [/!\] Le NOMBRE de gardes se recompte dans ce fichier meme (lecon ft-v1202 : un pied de page
#       qui annonce « quatorze gardes » pour dix-sept).
N_GARDES = len(re.findall(r'raise SystemExit', open(os.path.abspath(__file__),
                                                    encoding='utf-8').read()))

H = []
H.append(P('Phase d&rsquo;observation reelle', 'titre'))
H.append(P('Le chantier Nutrition est <b>gele</b> &mdash; %s &mdash; 13/09/2026. Vingtieme document '
           'de la serie, et le seul qui n&rsquo;annonce <b>aucun changement</b>. Ses %d gardes '
           'verifient exactement une chose : que <b>rien n&rsquo;a bouge</b>.' % (VERSION, N_GARDES),
           'sous'))

H.append(encadre(
    'LA DECISION',
    '&laquo; <i>L etape 6 est validee. La douane d observation fonctionne maintenant sur les vraies '
    'ecritures Nutrition, sans blocage, sans correction automatique et sans modification des '
    'donnees enregistrees. <b>Je ne veux pas lancer un nouveau chantier Nutrition pour l '
    'instant.</b> [&hellip;] <b>Ne modifie plus son comportement sans nouveau feu vert '
    'explicite.</b></i> &raquo;<br/><br/>'
    'Michel va utiliser Nutrition normalement pendant plusieurs jours. <b>Il n y a rien a faire '
    'd autre qu attendre des chiffres reels.</b>'))

H.append(P('1. Ce qui est gele, nommement', 'h1'))
H.append(tableau(
    ['gele', 'etat verifie dans le code servi'],
    [['les <b>%d regles</b> de la douane' % N_REGLES,
      '<b>%d</b> presentes, dont <b>%d</b> structurelles' % (N_REGLES, N_INVALID)],
     ['aucune ne devient <b>bloquante</b>',
      'les %d ecrivains appellent la douane et <b>aucun ne lit son verdict</b>' % len(ECRIVAINS)],
     ['aucun <b>seuil</b>', 'le seuil energetique est toujours <b>relatif ET absolu</b> '
      '(25 kcal et 30 %)'],
     ['les <b>divergences connues</b>',
      'non corrigees : une ligne editee perd sa tracabilite &middot; une ligne a zero refusee d un '
      'cote et acceptee des trois autres &middot; ' + (C % 'rejouerRepas') + ' perd son identifiant '
      'de source &middot; ' + (C % 'ml') + ' conserve en edition'],
     [C % 'S.savedFoods', 'intact'],
     ['l ecart <b>48,3 / 48</b>', 'intact'],
     ['l <b>historique</b> et les <b>migrations</b>', 'intacts'],
     ['le <b>format du carnet</b>',
      'cle ' + (C % CLE) + ', borne a <b>%s</b> combinaisons' % COMBOS_MAX]],
    [52 * mm, 113 * mm]))
H.append(Spacer(1, 5))
H.append(P('[*] Et la promesse de confidentialite est reverifiee a chaque generation de ce '
           'document : le carnet ne garde <b>aucun champ de repas</b>, ne touche a l identifiant de '
           'source que <b>par son existence</b>, et n apparait <b>nulle part</b> dans la sauvegarde '
           'cloud.', 'p'))

H.append(P('2. Ce qu&rsquo;on attend avant toute decision', 'h1'))
H.append(tableau(
    ['critere', 'pourquoi celui-la'],
    [['au moins <b>100 lignes</b> observees',
      'en dessous, une regle qui mord 1 fois sur 20 peut ne jamais apparaitre par hasard'],
     ['les <b>4 ecrivains</b> vus au moins une fois',
      (C % 'rejouerRepas') + ' et ' + (C % 'saveEditFood') + ' sont rares : sans eux, la moitie des '
      'divergences mesurees reste invisible'],
     ['idealement <b>2 semaines</b>',
      'un usage reel contient des semaines chargees et des semaines creuses'],
     ['[**] surtout une <b>COUVERTURE</b> suffisante des formes',
      'c est le seul critere qui permette de distinguer une regle <b>inutile</b> d une regle '
      '<b>non eprouvee</b>']],
    [58 * mm, 107 * mm]))

H.append(PageBreak())

H.append(P('3. Le piege a eviter le jour de l&rsquo;analyse', 'h1'))
H.append(encadre(
    'UNE REGLE QUI N A JAMAIS MORDU N EST PAS AUTOMATIQUEMENT INUTILE',
    'Consigne de Michel, mot pour mot : <i>&laquo; il faut verifier que les formes capables de la '
    'declencher ont reellement ete rencontrees &raquo;</i>.<br/><br/>'
    '-> <b>Sans cette verification, &laquo; jamais mordu &raquo; se lit &laquo; a supprimer &raquo;, '
    'et on retire un garde-fou parce que le cas ne s est pas encore presente.</b><br/><br/>'
    '[/!\\] Rappel mesure en ft-v1205 : sur 8 formes construites, les <b>9 familles INVALID</b> ne '
    'mordaient <b>jamais</b>. Ce n etait pas une preuve qu elles sont inutiles &mdash; c etait une '
    'preuve que l application ne produit pas de lignes structurellement cassees dans ces cas-la. '
    '<i>Le rapport donne les formes rencontrees precisement pour qu on puisse faire la '
    'difference.</i>'))
H.append(Spacer(1, 6))
H.append(P('4. Les cinq questions, quand le rapport arrivera', 'h1'))
H.append(tableau(
    ['question', 'ce qu il faudra verifier avant de repondre'],
    [['1. quelles regles <b>mordent reellement</b> ?', 'leur frequence, et sur quel ecrivain'],
     ['2. lesquelles restent des <b>WARN</b> ?',
      'une regle frequente sur un usage <b>legitime</b> reste un avertissement'],
     ['3. lesquelles sont des <b>divergences d architecture</b> a corriger ?',
      'une regle qui mord sur <b>un seul ecrivain</b> et sur <b>toutes</b> ses lignes decrit le '
      'chemin, pas la ligne'],
     ['4. lesquelles pourraient devenir <b>bloquantes</b> ?',
      'seulement si elles ne mordent que sur des lignes vraiment cassees'],
     ['5. lesquelles ne sont <b>pas encore eprouvees</b> ?',
      'les formes capables de les declencher ont-elles ete rencontrees ?']],
    [62 * mm, 103 * mm]))
H.append(Spacer(1, 6))
H.append(encadre(
    'OU LIRE LE RAPPORT',
    '<b>Profil -&gt; Admin -&gt; &laquo; Douane &mdash; observation du journal &raquo; -&gt; Voir '
    'le rapport</b>, puis <i>Copier</i>.<br/><br/>'
    'Il ne contient <b>aucun nom d aliment, aucune quantite, aucune calorie, aucune macro, aucun '
    'identifiant de source, aucune date de repas</b> &mdash; que des compteurs et du vocabulaire '
    'fixe. <i>Il peut donc etre transmis tel quel.</i>'))
H.append(Spacer(1, 6))
H.append(P('5. Et si une autre session publie entre-temps', 'h1'))
H.append(P('Protocole deux sessions, avant <b>toute</b> modification Nutrition : '
           + (C % 'git fetch --all') + ' &middot; lire ' + (C % 'docs/JOURNAL-DE-PARTAGE.md') +
           ' &middot; y poser sa ligne <b>AVANT de coder</b>. Le gel y est inscrit, ainsi que dans '
           + (C % 'CLAUDE.md') + ' et ' + (C % 'docs/CONTEXTE-ACTUEL.md') + ' &mdash; les deux '
           'fichiers relus au demarrage d une session.', 'p'))
H.append(Spacer(1, 4))
H.append(encadre(
    'POURQUOI L ECRIRE A TROIS ENDROITS',
    'Une decision qu on ne relit pas <b>disparait avec la session</b> (<b>R27</b>), et le suivant '
    '&laquo; repare &raquo; ce qui etait un choix (<b>R30</b> &mdash; le cas vecu du calculateur de '
    'plaques). <b>Trois des %d gardes de ce document refusent de le produire si le gel a disparu de '
    'l un des trois fichiers.</b>' % N_GARDES, ORANGE))
H.append(Spacer(1, 5))
H.append(P('[!] <b>Aucun fichier servi n a ete modifie</b> pour poser ce gel : ' + (C % 'app.js') +
           ', ' + (C % 'index.html') + ' et ' + (C % 'sw.js') + ' sont intacts. ' + (C % 'sw.js') +
           ' <b>n est donc pas bumpe</b> &mdash; un bump gratuit ferait re-telecharger l app a tout '
           'le monde pour rien &mdash; et aucune passe n a ete relancee, faute de code a tester. '
           'La derniere mesure reste celle de ft-v1206 : <b>3767 / 3767</b>.', 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Force Tracker - phase d observation reelle (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)
print('OK %s  (%s, %d regles intactes dont %d INVALID, cle %s, borne %s, %d gardes)'
      % (OUT, VERSION, N_REGLES, N_INVALID, CLE, COMBOS_MAX, N_GARDES))
