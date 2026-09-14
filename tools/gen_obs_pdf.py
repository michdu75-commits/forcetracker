#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/ETAPE6-OBSERVATION.pdf — l'observation reelle de la douane, et la promesse de
   confidentialite qui la borne. Dix-neuvieme document de la serie.

TOUS LES DECOMPTES SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI.
Les gardes les plus importants ne protegent pas un chiffre : ils protegent une PROMESSE. Une
fuite de donnee personnelle ne change RIEN a l'ecran — c'est precisement pour ca qu'ils lisent le
CODE, champ par champ, au lieu de regarder un comportement.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji, entites nommees comprises.
"""
import collections
import html
import json
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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'ETAPE6-OBSERVATION.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
HTML = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
SETUP = open(os.path.join(ROOT, 'setup.js'), encoding='utf-8').read()
RUN = open(os.path.join(ROOT, 'tests', 'parcours', 'runner.js'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = \'(ft-v\d+)\'", SW) or [None, '?'])[1]
SHA_INSTANTANE = '226a7e9c523cae3f'


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


C_COMPTER = corps('_douaneCompter')
C_DOUANE = corps('_douaneLigne')
C_FORME = corps('_douaneForme')
C_RAPPORT = corps('_douaneRapport')
ECRIVAINS = ['rejouerRepas', 'quickAddFood', 'addFoodEntry', 'saveEditFood']
N_REGLES = len(re.findall(r"dit\('", C_DOUANE))
N_INVALID = len(re.findall(r"'INVALID',", C_DOUANE))
N_TEMOINS = len(re.findall(r"t\('CCCIV ", RUN))
CLE = (re.search(r"DOUANE_OBS_CLE = '([^']+)'", CODE) or [None, '?'])[1]
COMBOS_MAX = (re.search(r'DOUANE_COMBOS_MAX = (\d+)', CODE) or [None, '?'])[1]
# les formes reconnues, RECOMPTEES dans le classeur lui-meme
FORMES = sorted(set(re.findall(r"return '(\w+)';", C_FORME)))

# [!!] LES GARDES DU NEGATIF — ici ils protegent d'abord une PROMESSE DE CONFIDENTIALITE.
#    Une fuite ne change RIEN a l'ecran : c'est pour ca qu'ils lisent le CODE.
if not C_COMPTER:
    raise SystemExit('`_douaneCompter` est introuvable : tout le document parle d elle.')
_INTERDITS = r'\bligne\.(name|kcal|prot|carbs|fat|per100|date|meal|portionLabel|portionWeightG)\b'
if re.search(_INTERDITS, C_COMPTER):
    raise SystemExit('LE COMPTEUR GARDE UN CHAMP DE REPAS : le §2 et le §3 affirment le contraire, '
                     'et c est la promesse que Michel a posee en premier.')
# [/!\] CE GARDE ETAIT AVEUGLE, et c est la mutation qui l a dit : il refusait
#    `ligne.sourceId` suivi d un caractere « parlant », donc il laissait passer
#    `E.src = String(ligne.sourceId);` — la parenthese fermante le desamorcait.
#    Il compte desormais les OCCURRENCES (il n en faut qu une, celle du booleen) et refuse
#    toute forme qui RANGE la valeur quelque part.
if (len(re.findall(r'ligne\.sourceId', C_COMPTER)) != 1
        or re.search(r'String\(\s*ligne\.sourceId', C_COMPTER)
        or re.search(r'=\s*ligne\.sourceId', C_COMPTER)):
    raise SystemExit('LE COMPTEUR TOUCHE A L IDENTIFIANT DE SOURCE AUTREMENT QUE PAR SON '
                     'EXISTENCE : le §2 dit « le BOOLEEN, jamais l id ».')
if re.search(r'\bS\.\w+\s*=', C_COMPTER) or 'S.foodLog' in C_COMPTER or 'persist(' in C_COMPTER:
    raise SystemExit('LE COMPTEUR ECRIT DANS L ETAT PERSISTANT : le §4 affirme qu il vit dans sa '
                     'propre cle, hors de S, donc hors de la sauvegarde et du cloud.')
if re.search(r'\bligne\.\w+\s*=[^=]', C_COMPTER):
    raise SystemExit('LE COMPTEUR MODIFIE LA LIGNE QU IL OBSERVE : toute l etape est censee ne '
                     'rien changer a ce qui est enregistre.')
if len(re.findall(r'localStorage\.setItem\(', C_COMPTER)) != 1 or 'DOUANE_OBS_CLE' not in C_COMPTER:
    raise SystemExit('LE COMPTEUR N ECRIT PLUS EXACTEMENT UNE CLE, LA SIENNE : le §4 en depend.')
if 'DOUANE_COMBOS_MAX' not in C_COMPTER:
    raise SystemExit('LE CARNET N EST PLUS BORNE : le §4 affirme qu il ne peut pas grossir sans fin.')
if not re.search(r'try\{\s*_douaneCompter\(res, l\);\s*\}catch', C_DOUANE):
    raise SystemExit('LE COMPTAGE N EST PLUS ENVELOPPE : il pourrait empecher une ecriture, ce que '
                     'le §1 affirme impossible.')
for n in ECRIVAINS:
    if re.search(r'if\s*\(\s*_douaneLigne|(const|let|var)\s+\w+\s*=\s*_douaneLigne', corps(n)):
        raise SystemExit('`%s` LIT le verdict de la douane : ce serait un blocage deguise, et la '
                         'consigne de Michel est inchangee depuis ft-v1205.' % n)
if (N_REGLES, N_INVALID) != (21, 9):
    raise SystemExit('La douane porte %d regles dont %d INVALID, pas 21/9 : l etape 6 ne devait en '
                     'changer AUCUNE.' % (N_REGLES, N_INVALID))
if 'DOUANE_REGLES.slice()' not in C_COMPTER:
    raise SystemExit('LE CATALOGUE N EST PLUS DERIVE DU CODE : le §2 affirme qu il n est recopie '
                     'nulle part (R2).')
if not re.search(r"DOUANE_REGLES\.indexOf\(nom\) < 0", C_DOUANE):
    raise SystemExit('`dit()` ne renseigne plus le catalogue : la liste des regles qui n ont jamais '
                     'mordu deviendrait fausse en silence.')
if re.search(r'douane', sans_com(SETUP), re.I):
    raise SystemExit('`setup.js` MENTIONNE LA DOUANE : le carnet doit rester hors de la sauvegarde '
                     'cloud — verifier que ce n est pas le payload.')
if 'loadDouaneAdmin()' not in HTML:
    raise SystemExit('Le rapport n est plus accessible depuis Profil > Admin : le §5 explique '
                     'qu une mesure qu on ne peut pas consulter n existe pas.')
for q in ('JAMAIS MORDU', 'PAR ÉCRIVAIN', 'COMBINAISONS'):
    if q not in C_RAPPORT:
        raise SystemExit('Le rapport ne porte plus la section « %s » : le §5 la decrit.' % q)
if sorted(FORMES) != sorted(['sans_quantite', 'grammes', 'portion', 'ml', 'autre']):
    raise SystemExit('Les formes reconnues sont %s : le §2 cite exactement les cinq autres.' % FORMES)
if N_TEMOINS != 21:
    raise SystemExit('Le bloc CCCIV porte %d temoins, pas 21 : le §7 cite ce chiffre.' % N_TEMOINS)

PASSE = os.environ.get('FT_PASSE') or '/tmp/passeobs.log'
try:
    _log = open(PASSE, encoding='utf-8', errors='replace').read()
except Exception:
    raise SystemExit('Journal de passe introuvable (%s) : le §7 cite un total, il doit etre LU.'
                     % PASSE)
_p = re.search(r'TOTAL CROISÉ : (\d+) ✅ · (\d+) ❌', _log)
if not _p:
    raise SystemExit('Le journal de passe ne porte pas encore de TOTAL : la passe tourne toujours. '
                     'Un total espere n est pas un total mesure — on attend.')
PASSE_OK, PASSE_KO = int(_p.group(1)), int(_p.group(2))
if PASSE_KO != 0:
    raise SystemExit('La passe porte %d rouge(s) : le document affirme une passe verte.' % PASSE_KO)


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
H.append(P('L&rsquo;observation reelle de la douane', 'titre'))
H.append(P('Etape 6 du chantier Nutrition &mdash; %s &mdash; 13/09/2026. Dix-neuvieme document de '
           'la serie. Tous les decomptes sont <b>recomptes depuis le code servi</b> a chaque '
           'generation : %d gardes refusent de produire le PDF si un seul fait tombe &mdash; a '
           'commencer par la promesse de confidentialite.' % (VERSION, N_GARDES), 'sous'))

H.append(encadre(
    'LA DEMANDE, ET LA BORNE QUI NE BOUGE PAS',
    '&laquo; <i>Faire tourner ' + (C % '_douaneLigne(...)') + ' sur les vraies lignes reellement '
    'produites par l application et obtenir un rapport agrege des WARN / INVALID rencontres en '
    'usage reel, <b>sans stocker le contenu des repas ni les valeurs nutritionnelles '
    'personnelles</b>.</i> &raquo;<br/><br/>'
    '[!] <b>Toujours aucun blocage, aucune correction, aucune modification de donnee</b>, et '
    '<b>aucune des %d regles de ft-v1205 ne change</b> &mdash; un temoin les epingle, avec leurs '
    '%d structurelles.' % (N_REGLES, N_INVALID)))

# ── 1. LE BRANCHEMENT ────────────────────────────────────────────────────────
H.append(P('1. Comment l&rsquo;observation reelle est branchee', 'h1'))
H.append(P('Les %d ecrivains appellent deja ' % len(ECRIVAINS) + (C % '_douaneLigne') +
           ' depuis ft-v1205. <b>Rien n&rsquo;est rebranche</b> : c&rsquo;est '
           + (C % '_douaneLigne') + ' elle-meme qui, apres avoir rendu son verdict, appelle '
           + (C % '_douaneCompter(res, l)') + '.', 'p'))
H.append(bloc_code(
    "ecrivain -> _douaneLigne -> verdict -> _douaneCompter -> compteurs (cle " + CLE + ")\n"
    "                                    \\-> ecriture INCHANGEE"))
H.append(Spacer(1, 5))
H.append(encadre(
    'ET LE COMPTAGE NE PEUT PAS EMPECHER UNE ECRITURE',
    'L&rsquo;appel est enveloppe dans un ' + (C % 'try') + ' qui avale tout : meme si le comptage '
    'plantait, la ligne serait enregistree exactement pareil. <b>Un temoin le fige</b>, et la '
    'mutation qui retire l&rsquo;enveloppe fait rougir exactement celui-la.<br/><br/>'
    '[*] C&rsquo;est la difference entre <i>observer</i> et <i>surveiller</i> : un observateur qui '
    'peut faire echouer ce qu il observe n en est plus un.'))

# ── 2. CE QUI EST COLLECTE ───────────────────────────────────────────────────
H.append(P('2. Quelles donnees exactes sont collectees &mdash; la liste est fermee', 'h1'))
H.append(tableau(
    ['garde', 'pourquoi celui-la'],
    [['l&rsquo;<b>ecrivain</b> (4 valeurs, vocabulaire fixe)', 'comparer les 4 chemins entre eux'],
     ['le <b>verdict</b> (' + (C % 'OK') + ' / ' + (C % 'WARN') + ' / ' + (C % 'INVALID') + ')',
      'la repartition'],
     ['les <b>noms</b> des regles qui ont mordu', 'savoir lesquelles servent vraiment'],
     ['la <b>forme</b> : ' + ' &middot; '.join(C % f for f in FORMES),
      'deduite de ' + (C % 'u') + ' et ' + (C % 'q') + ' <b>seuls</b>'],
     ['un <b>booleen</b> &laquo; la ligne avait-elle un identifiant de source ? &raquo;',
      'suivre la divergence ' + (C % 'rejouerRepas') + ' mesuree en ft-v1205'],
     ['des <b>compteurs</b> et le <b>catalogue</b> des regles', 'le rapport']],
    [80 * mm, 85 * mm]))
H.append(Spacer(1, 6))
H.append(encadre(
    'CE QUI N EST JAMAIS GARDE',
    'Le nom de l&rsquo;aliment &middot; la quantite reelle &middot; les calories &middot; les '
    'proteines &middot; les glucides &middot; les lipides &middot; un commentaire &middot; une '
    'description de repas &middot; <b>l&rsquo;identifiant source</b> &middot; la date d&rsquo;un '
    'repas.<br/><br/>'
    '-> <b>Rien qui permette de reconstruire ce que la personne a mange.</b> C&rsquo;est <b>R36</b> '
    'applique a notre propre diagnostic : <i>ce qui decrit LE MONDE se compte, ce qui decrit LA '
    'PERSONNE reste chez elle</i> (Constitution <b>P3</b>).'))
H.append(Spacer(1, 5))
H.append(encadre(
    'ET LE CATALOGUE DES %d REGLES N EST RECOPIE NULLE PART' % N_REGLES,
    'Il se remplit <b>tout seul</b> au premier appel : ' + (C % 'dit()') + ' enregistre chaque nom '
    'au passage, et toutes les regles sont evaluees a chaque fois (seul leur booleen differe). '
    'Une regle ajoutee, retiree ou renommee suit donc sans divergence possible (<b>R2</b>).<br/><br/>'
    '[*] <i>Une liste recopiee aurait menti le jour ou quelqu un touche aux regles &mdash; et elle '
    'aurait menti en SILENCE, puisque « cette regle n a jamais mordu » est exactement ce qu on lit '
    'quand elle a simplement disparu du catalogue.</i>', ORANGE))

H.append(PageBreak())

# ── 3. LE CANARI ─────────────────────────────────────────────────────────────
H.append(P('3. La preuve qu&rsquo;aucune donnee de repas n&rsquo;est stockee', 'h1'))
H.append(P('On enregistre, <b>par un vrai ecrivain</b>, un aliment nomme ' +
           (C % 'ZZCANARIMICHELXY') + ' avec des valeurs reconnaissables (' +
           (C % '7777 &middot; 6666 &middot; 5555 &middot; 4444 &middot; 3333 &middot; 9999 '
                '&middot; 8888 &middot; 2222 &middot; 1111') + ') et un identifiant de source ' +
           (C % 'off:ZZCANARISOURCE') + '. Puis on lit <b>ce qui a ete reellement stocke</b> et on '
           'y cherche ces onze chaines.', 'p'))
H.append(encadre(
    'ET LE MEME TEMOIN VERIFIE QUE LE CARNET A BIEN ENREGISTRE',
    'Sans cette moitie-la, <b>un carnet vide passerait le test sans rien prouver</b> : l absence du '
    'canari serait trivialement vraie, et la promesse de confidentialite deviendrait <i>un vert qui '
    'ne peut pas rougir</i> (ft-v994). Le temoin exige donc que ' + (C % 'quickAddFood') +
    ' figure dans ce qui a ete stocke.'))
H.append(Spacer(1, 6))
H.append(encadre(
    'LES TROIS MUTATIONS DE FUITE NE CHANGENT RIEN A L ECRAN',
    '<b>1. garder le nom</b> de l aliment &middot; <b>2. garder les calories</b> &middot; '
    '<b>3. garder l identifiant de source</b> au lieu du booleen.<br/><br/>'
    'Aucune des trois ne modifie ce que l application affiche, ni ce qu elle enregistre. '
    '<b>Sans le canari, elles passeraient toutes les trois.</b><br/><br/>'
    '[**] <i>C est exactement le genre de derive qu aucun parcours ne peut voir &mdash; et c est '
    'pour ca qu une promesse de confidentialite doit avoir un test qui peut la faire rougir.</i>',
    ORANGE))

# ── 4. OU IL VIT ─────────────────────────────────────────────────────────────
H.append(P('4. Ou le carnet vit, et pourquoi il n&rsquo;en sort pas', 'h1'))
H.append(tableau(
    ['propriete', 'mesure'],
    [['sa propre cle', C % CLE],
     ['hors de ' + (C % 'S'),
      'donc hors de la sauvegarde, hors de la synchronisation cloud, hors de tout export &mdash; '
      '<b>3 temoins</b>, dont un qui lit ' + (C % 'setup.js')],
     ['borne', '<b>%s</b> combinaisons maximum, le reste tombe dans ' % COMBOS_MAX + (C % '(autres)')],
     ['remise a zero', 'un bouton &mdash; et un temoin verifie qu elle <b>ne touche pas au journal '
      'alimentaire</b>'],
     ['il survit au rechargement', 'c est tout l interet d observer un usage reel sur plusieurs jours']],
    [42 * mm, 123 * mm]))

# ── 5. LE RAPPORT ────────────────────────────────────────────────────────────
H.append(P('5. Comment lire le rapport', 'h1'))
H.append(P('<b>Profil -&gt; Admin -&gt; &laquo; Douane &mdash; observation du journal &raquo; '
           '-&gt; Voir le rapport.</b> Deux boutons : <i>Copier</i> (pour l envoyer) et '
           '<i>Repartir de zero</i> (les compteurs seulement).', 'p'))
H.append(tableau(
    ['section', 'ce qu elle sert a decider'],
    [['nombre de lignes observees + periode', 'est-ce que la mesure a assez de matiere ?'],
     ['verdicts ' + (C % 'OK') + ' / ' + (C % 'WARN') + ' / ' + (C % 'INVALID'), 'l ordre de grandeur'],
     ['detail <b>par ecrivain</b> (verdicts, formes, avec/sans source)',
      'les 4 chemins ne se comportent pas pareil &mdash; c est la que ca se voit'],
     ['regles qui ont mordu', 'question 2 : lesquelles signalent du reel ?'],
     ['<b>regles qui n ont JAMAIS mordu</b>', 'question 1 : lesquelles sont purement theoriques ?'],
     ['combinaisons frequentes', 'question 3 : une regle qui mord toujours avec une autre'],
     ],
    [72 * mm, 93 * mm]))
H.append(Spacer(1, 6))
H.append(encadre(
    'IL POSE LES TROIS QUESTIONS, IL N Y REPOND PAS',
    'Le rapport se termine en les ecrivant noir sur blanc : une regle frequente sur un usage '
    '<b>legitime</b> doit rester un avertissement ; une regle rare, ou qui ne mord que sur des '
    'lignes vraiment cassees, pourrait devenir bloquante sans gener personne.<br/><br/>'
    '[!] <b>Aucune regle n est bloquante aujourd hui, et aucune ne le deviendra sans un feu vert '
    'explicite.</b> <i>Ce document donne les chiffres ; la decision n appartient pas a l outil.</i>'))

H.append(PageBreak())

# ── 6. COMBIEN OBSERVER ──────────────────────────────────────────────────────
H.append(P('6. Combien de temps observer avant de decider', 'h1'))
H.append(tableau(
    ['repere', 'pourquoi celui-la'],
    [['<b>au moins 100 lignes</b>',
      'en dessous, une regle qui mord 1 fois sur 20 peut ne jamais apparaitre par hasard'],
     ['<b>les 4 ecrivains vus au moins une fois</b>',
      (C % 'rejouerRepas') + ' et ' + (C % 'saveEditFood') + ' sont rares : sans eux, la moitie '
      'des divergences mesurees en ft-v1205 reste invisible'],
     ['<b>au moins 2 semaines</b>',
      'un usage reel contient des semaines chargees et des semaines creuses ; une seule semaine ne '
      'dit rien de la variete des formes']],
    [52 * mm, 113 * mm]))
H.append(Spacer(1, 6))
H.append(encadre(
    'MAIS LE VRAI CRITERE N EST PAS LE TEMPS, C EST LA COUVERTURE',
    'Une regle ne peut etre declaree &laquo; purement theorique &raquo; que si les formes qui la '
    'declencheraient ont <b>reellement ete produites</b>.<br/><br/>'
    '-> <i>Une regle qui n a jamais mordu parce que le cas ne s est jamais presente n est pas une '
    'regle inutile &mdash; c est une regle NON EPROUVEE.</i> Le rapport donne les formes '
    'rencontrees precisement pour qu on puisse faire la difference.<br/><br/>'
    '[/!\\] Rappel mesure en ft-v1205 : sur 8 formes construites, les <b>9 familles INVALID</b> ne '
    'mordaient <b>jamais</b>. Ce n est pas une preuve qu elles sont inutiles &mdash; c est une '
    'preuve que l application ne produit pas de lignes structurellement cassees dans ces cas-la.',
    ORANGE))

# ── 7. LES PREUVES ───────────────────────────────────────────────────────────
H.append(P('7. Les tests et les mutations', 'h1'))
H.append(tableau(
    ['preuve', 'etat mesure'],
    [['Instantane de ce qui est ECRIT',
      '<b>identique octet pour octet</b>, sha256 ' + (C % SHA_INSTANTANE) + ' &mdash; le meme '
      'qu en ft-v1205 : <b>rien de ce qui est enregistre n a bouge</b>'],
     ['Temoins (bloc CCCIV)', '<b>%d</b>, dont <b>5 de source</b> &mdash; chaque compteur a le '
      'sien' % N_TEMOINS],
     ['Mutations negatives', '<b>18</b>, toutes mordent <b>sur leur propre temoin</b> ; controle '
      'sain a <b>0 rouge avant ET apres</b> ; arbre <b>copie</b> (&sect;60 par construction)'],
     ['dont <b>3 fuites de donnees</b>', 'le nom &middot; les calories &middot; l identifiant de '
      'source &mdash; <b>invisibles a l ecran</b>, attrapees par le canari'],
     ['Passe parcours', '<b>%d</b> vert, <b>%d</b> rouge, sur l&rsquo;arbre FINAL' % (PASSE_OK, PASSE_KO)],
     ['Autres suites', 'calculs 339/339 &middot; muscles 241/241 &middot; croises 50/50 &middot; '
      'dates 9/9 &middot; donnees classees, 0 trou nouveau']],
    [46 * mm, 119 * mm]))
H.append(Spacer(1, 6))
H.append(P('Chaque compteur a son temoin negatif', 'h1'))
H.append(tableau(
    ['la mutation', 'ce qu elle fait rougir'],
    [['<b>FUITE</b> : le carnet garde le <b>nom</b> de l aliment', 'le canari + le perimetre de source'],
     ['<b>FUITE</b> : le carnet garde les <b>calories</b>', 'le canari + le perimetre de source'],
     ['<b>FUITE</b> : il garde l <b>identifiant de source</b> au lieu du booleen', 'le canari + le booleen'],
     ['le total n est jamais incremente', 'le compteur de lignes + le rapport'],
     ['le verdict n est pas compte', 'le compteur d etats'],
     ['les ecrivains ne sont pas distingues', '5 temoins'],
     ['les regles ne sont pas comptees', 'le compteur de regles'],
     ['les formes ne sont plus classees', 'le compteur de formes'],
     ['le catalogue est recopie a la main', 'le temoin du catalogue derive'],
     ['les combinaisons ne sont plus bornees', 'le perimetre de source'],
     ['le carnet entre dans l etat persiste (' + (C % 'S') + ')', 'la survie + le perimetre'],
     ['le carnet part dans la <b>sauvegarde cloud</b>', 'le temoin qui lit ' + (C % 'setup.js')],
     ['le carnet ne survit pas au rechargement', '4 temoins'],
     ['la remise a zero efface <b>aussi</b> le journal', 'le temoin de la remise a zero'],
     ['le compteur modifie la ligne observee', 'le perimetre de source'],
     ['le comptage peut <b>bloquer</b> une ecriture', 'le temoin du non-blocage'],
     ['une <b>regle</b> de la douane a change', 'le catalogue + le temoin des %d regles' % N_REGLES],
     ['le rapport ne pose plus la question 1', 'le temoin du rapport']],
    [105 * mm, 60 * mm]))

H.append(P('Ce qui reste ouvert, explicitement hors perimetre', 'h1'))
H.append(P('[!] <b>Rendre une regle bloquante</b> &mdash; feu vert separe obligatoire &middot; '
           'les <b>2 divergences</b> mesurees en ft-v1205 (une ligne editee perd sa tracabilite ; '
           'une ligne a zero refusee d un cote, acceptee des trois autres) &middot; '
           + (C % 'S.savedFoods') + ' multi-onglets &middot; l ecart <b>48,3 / 48</b> &middot; '
           'l historique &middot; les migrations &middot; les harmonisations produit &middot; le '
           'garde ' + (C % '!_bcNutr') + ' non bloquant (ft-v1203).', 'p'))
H.append(Spacer(1, 4))
H.append(P('Conception complete : <font face="Courier">docs/DOUANE-NUTRITION.md</font> (&sect; Etape 6). '
           'Ce PDF est genere par <font face="Courier">tools/gen_obs_pdf.py</font>, dont les %d gardes '
           'recomptent chaque chiffre depuis le code servi et <b>refusent de produire</b> si un seul '
           'fait tombe &mdash; a commencer par la promesse de confidentialite, et y compris le total '
           'de la passe, <b>lu dans son journal</b> et jamais ecrit a la main.' % N_GARDES, 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Force Tracker - l observation reelle de la douane (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)
print('OK %s  (%s, %d regles intactes, %d temoins, cle %s, %d gardes, passe %d/%d)'
      % (OUT, VERSION, N_REGLES, N_TEMOINS, CLE, N_GARDES, PASSE_OK, PASSE_OK + PASSE_KO))
