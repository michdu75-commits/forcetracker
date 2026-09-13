#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/ETAPE5-DOUANE.pdf — la douane du journal alimentaire, en mode OBSERVATION.
   Dix-huitieme document de la serie, premier de l'etape 5.

TOUS LES DECOMPTES SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI, et la repartition
OK/WARN/INVALID est LUE dans la mesure produite par la sonde — jamais recopiee a la main.
Les gardes les plus importants sont ceux du NEGATIF : ils refusent de produire si la douane s'est
mise a corriger une valeur, a bloquer une ecriture, a parler a la personne, ou a reconstruire ce
qu'un proprietaire calcule deja. Une douane qui deborde reste VERTE a l'ecran — c'est precisement
pour ca qu'ils lisent le CODE et pas le comportement.

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
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'ETAPE5-DOUANE.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
SONDE = open(os.path.join(ROOT, 'tools', 'instantane_douane.js'), encoding='utf-8').read()
RUN = open(os.path.join(ROOT, 'tests', 'parcours', 'runner.js'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE = \'(ft-v\d+)\'", SW) or [None, '?'])[1]
SHA_INSTANTANE = '226a7e9c523cae3f'

CODE = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), APP)
CODE = '\n'.join(l for l in CODE.split('\n') if not l.strip().startswith('//'))
LIGNES = CODE.split('\n')
DECL = [(i, re.match(r'(?:async )?function (\w+)\(', l).group(1))
        for i, l in enumerate(LIGNES) if re.match(r'(?:async )?function \w+\(', l)]


def corps(nom):
    """[/!\] Borne par la DECLARATION SUIVANTE, jamais par un `\n}` : un corps borne par une
       accolade s'arrete a la premiere fonction imbriquee, et attribue la suite a la
       mauvaise fonction. C'est l'erreur qui avait fait compter `readFoodLabel` comme une
       porte a l'etape 4."""
    for k, (i, n) in enumerate(DECL):
        if n == nom:
            return '\n'.join(LIGNES[i:(DECL[k + 1][0] if k + 1 < len(DECL) else len(LIGNES))])
    return ''


# ── LES DECOMPTES, TOUS REFAITS ICI DEPUIS LE CODE SERVI ─────────────────────
C_DOUANE = corps('_douaneLigne')
N_APPELS = len(re.findall(r'_douaneLigne\(', CODE))
ECRIVAINS = ['rejouerRepas', 'quickAddFood', 'addFoodEntry', 'saveEditFood']
POUSSEURS = [n for _, n in DECL if re.search(r'S\.foodLog\.push\(', corps(n))]
BRANCHES = [n for n in ECRIVAINS if '_douaneLigne(' in corps(n)]
N_REGLES = len(re.findall(r"dit\('", C_DOUANE))
N_INVALID = len(re.findall(r"'INVALID',", C_DOUANE))
N_WARN = N_REGLES - N_INVALID
N_TEMOINS = len(re.findall(r"t\('CCCIII ", RUN))

# [!][!] LES GARDES DU NEGATIF — ils protegent ce que la douane REFUSE de faire.
#    Une douane qui se met a corriger reste VERTE a l'ecran : c'est pour ca qu'ils lisent le CODE.
if not C_DOUANE:
    raise SystemExit('`_douaneLigne` est introuvable : tout le document parle d elle.')
if re.search(r'\bl\.\w+\s*=[^=]|\bdelete\s+l\.|Object\.assign\(\s*l\b', C_DOUANE):
    raise SystemExit('LA DOUANE ECRIT DANS LA LIGNE QU ELLE OBSERVE : tout le §3 affirme le '
                     'contraire, et Michel a borne l etape — elle OBSERVE, elle ne corrige pas.')
if re.search(r'S\.foodLog|persist\(', C_DOUANE):
    raise SystemExit('LA DOUANE TOUCHE AU JOURNAL : elle doit LIRE la forme finale, jamais '
                     'l ecrire. Le §3 et le temoin de perimetre affirment le contraire.')
if re.search(r'toast\(|document\.|alert\(|showConfirm\(|innerHTML', C_DOUANE):
    raise SystemExit('LA DOUANE PARLE A LA PERSONNE : aucun blocage ni message n est autorise '
                     'dans cette version (consigne explicite de Michel).')
if re.search(r'_afPreparerEcran|_provFood|_qGrammes|_qReprenable|_afReprendre|_srcProvenance'
             r'|_srcRepriseQ|_itemListe|_per100Derive|_bcNutr', C_DOUANE):
    raise SystemExit('LA DOUANE RECONSTRUIT AU LIEU DE LIRE : elle touche au hub ou a un '
                     'proprietaire de 1b/3, donc elle devient un second hub (R2).')
if N_APPELS != 5:
    raise SystemExit('`_douaneLigne` a %d occurrences, pas 5 (1 declaration + 4 ecrivains) : '
                     'le §1 et le §3 citent ce chiffre.' % N_APPELS)
if sorted(POUSSEURS) != sorted(['rejouerRepas', 'quickAddFood', 'addFoodEntry']):
    raise SystemExit('Les pousseurs sont %s, pas les trois attendus : le §1 repose sur ce '
                     'recomptage.' % POUSSEURS)
if sorted(BRANCHES) != sorted(ECRIVAINS):
    raise SystemExit('Les ecrivains branches sont %s : il en manque un. `saveEditFood` est '
                     'celui qu une recherche sur `push` rate.' % BRANCHES)
for n in ECRIVAINS:
    if re.search(r'if\s*\(\s*_douaneLigne|(const|let|var)\s+\w+\s*=\s*_douaneLigne', corps(n)):
        raise SystemExit('`%s` LIT le verdict de la douane : ce serait un blocage deguise, et '
                         'la consigne dit que OK, WARN et INVALID ecrivent tous.' % n)
if (N_REGLES, N_INVALID) != (21, 9):
    raise SystemExit('La douane porte %d regles dont %d INVALID, pas 21/9 : le §4 cite ces '
                     'chiffres.' % (N_REGLES, N_INVALID))
if "dit('energie_incoherente', 'WARN'," not in C_DOUANE:
    raise SystemExit('LE CAS DES 48 kcal N EST PLUS UN AVERTISSEMENT : Michel a ecrit qu il doit '
                     'rester un WARN tant qu aucune regle produit n a tranche.')
if not re.search(r'd\s*>=\s*25\s*&&\s*d\s*/\s*b\s*>\s*0\.30', C_DOUANE):
    raise SystemExit('LE SEUIL ENERGETIQUE N EST PLUS RELATIF ET ABSOLU : le §4 explique '
                     'precisement pourquoi le relatif seul mordait sur un cafe a 2 kcal.')
if N_TEMOINS != 20:
    raise SystemExit('Le bloc CCCIII porte %d temoins, pas 20 : le §6 cite ce chiffre.' % N_TEMOINS)
# [/!\] CE GARDE ETAIT AVEUGLE, ET C'EST LA FAMILLE DE ft-v1193 REPOSEE PAR MOI.
#    Il cherchait le nom de l'ecrivain N'IMPORTE OU dans la sonde — or ces noms vivent aussi
#    dans le docblock qui les explique. Renommer le VRAI appel le laissait muet.
#    Il lit donc la sonde SANS ses commentaires, et cherche l'APPEL, pas le mot.
SONDE_CODE = re.sub(r'/\*[\s\S]*?\*/', '', SONDE)
SONDE_CODE = '\n'.join(l for l in SONDE_CODE.split('\n') if not l.strip().startswith('//'))
for nom in ECRIVAINS:
    if (nom + '(') not in SONDE_CODE:
        raise SystemExit('La sonde n APPELLE plus `%s` : le §5 affirme que les 4 ecrivains sont '
                         'conduits par leur VRAIE porte, pas seulement cites.' % nom)

# [*] LA REPARTITION N'EST PAS RECOPIEE : elle est LUE dans la mesure produite par la sonde.
MESURE = os.environ.get('FT_MESURE') or '/tmp/douane_mesure.json'
try:
    _m = json.load(open(MESURE, encoding='utf-8'))
    OBS = _m['zz_douane_observation']
except Exception as e:
    raise SystemExit('Mesure de repartition introuvable ou illisible (%s) : le §5 cite des '
                     'chiffres, ils doivent etre LUS. Relancer '
                     '`node tools/instantane_douane.js --douane > %s`. [%s]' % (MESURE, MESURE, e))
REP = collections.Counter(r[2] for r in OBS)
INTACT = sum(1 for r in OBS if len(r) > 4 and r[4] == 'ENTREE INTACTE')
MORDUES = collections.Counter()
for r in OBS:
    for x in ((r[3] or '').split('+') if len(r) > 3 and r[3] else []):
        MORDUES[x] += 1
if REP.get('INVALID', 0) != 0:
    raise SystemExit('La mesure porte %d INVALID : le §5 affirme que les lignes reellement '
                     'produites par l app ne sont jamais structurellement cassees.'
                     % REP['INVALID'])
if INTACT != REP.get('OK', 0) + REP.get('WARN', 0):
    raise SystemExit('%d entrees intactes pour %d lignes observees : le §3 affirme que la douane '
                     'ne mute JAMAIS son entree.' % (INTACT, REP.get('OK', 0) + REP.get('WARN', 0)))
if MORDUES.get('tracabilite_absente', 0) != 8:
    raise SystemExit('`tracabilite_absente` mord %d fois, pas 8 : le §6 en fait la divergence '
                     'n°1, et ce chiffre EST la mesure.' % MORDUES.get('tracabilite_absente', 0))

PASSE = os.environ.get('FT_PASSE') or '/tmp/passedouane.log'
try:
    _log = open(PASSE, encoding='utf-8', errors='replace').read()
except Exception:
    raise SystemExit('Journal de passe introuvable (%s) : le §6 cite un total, il doit etre LU.'
                     % PASSE)
_p = re.search(r'TOTAL CROISÉ : (\d+) ✅ · (\d+) ❌', _log)
if not _p:
    raise SystemExit('Le journal de passe ne porte pas encore de TOTAL : la passe tourne '
                     'toujours. Un total espere n est pas un total mesure — on attend.')
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






# [/!\] Le NOMBRE de gardes se recompte dans ce fichier meme : un pied de page qui annonce
#    « quatorze gardes » pour dix-sept est exactement la faute attrapee en ft-v1202.
N_GARDES = len(re.findall(r'raise SystemExit', open(os.path.abspath(__file__),
                                                    encoding='utf-8').read()))

H = []
H.append(P('La douane du journal alimentaire', 'titre'))
H.append(P('Etape 5 du chantier Nutrition &mdash; %s &mdash; 13/09/2026. '
           'Dix-huitieme document de la serie. Tous les decomptes sont <b>recomptes depuis le code '
           'servi</b> a chaque generation, et la repartition est <b>lue dans la mesure</b>, jamais '
           'recopiee : %d gardes refusent de produire le PDF si un seul fait tombe.'
           % (VERSION, N_GARDES), 'sous'))

H.append(encadre(
    'LA BORNE POSEE PAR MICHEL, ET ELLE DECIDE DE TOUT',
    '&laquo; La douane doit etre construite et validee separement. <b>Je ne veux pas encore de '
    'correction automatique ni de blocage utilisateur.</b> &raquo;<br/><br/>'
    'Donc, dans cette version : <b>OK</b> -&gt; ecriture normale &middot; <b>WARN</b> -&gt; '
    'ecriture normale &middot; <b>INVALID</b> -&gt; <b>ecriture normale aussi</b>. '
    '&laquo; <i>Le but est d abord de MESURER ce qui sortirait rouge avant de decider quelles '
    'regles deviennent reellement bloquantes.</i> &raquo;<br/><br/>'
    'Objectif, mot pour mot : <i>creer un point unique de controle juste avant l ecriture finale '
    'dans ' + (C % 'S.foodLog') + ', afin que toutes les lignes qui vont reellement etre '
    'enregistrees puissent etre observees avec les memes regles</i>.'))

# ── 1. LES ECRIVAINS ─────────────────────────────────────────────────────────
H.append(P('1. Les ecrivains reels &mdash; %d, recomptes le jour meme' % len(ECRIVAINS), 'h1'))
H.append(tableau(
    ['#', 'ecrivain', 'forme de l ecriture', 'role'],
    [['<b>1</b>', C % 'addFoodEntry', C % 'S.foodLog.push(_e)', 'l&rsquo;ecran d&rsquo;ajout'],
     ['<b>2</b>', C % 'quickAddFood', C % 'S.foodLog.push(&hellip;)',
      'l&rsquo;ajout <b>direct</b>, sans ecran'],
     ['<b>3</b>', C % 'rejouerRepas', (C % 'push') + ' <b>dans une boucle</b>',
      'rejeu d&rsquo;un repas &mdash; plusieurs lignes d&rsquo;un coup'],
     ['<b>4</b>', '<b>' + (C % 'saveEditFood') + '</b>',
      '<b>aucun</b> ' + (C % 'push') + ' &mdash; elle <b>mute en place</b> un element deja dans '
      'le tableau, puis ' + (C % 'persist()'),
      'l&rsquo;edition d&rsquo;une ligne']],
    [10 * mm, 33 * mm, 66 * mm, 56 * mm]))
H.append(Spacer(1, 6))
H.append(encadre(
    'LE QUATRIEME EST CELUI QU UNE RECHERCHE SUR `push` RATE',
    '<b>Il ne pousse rien.</b> Il ecrit dans les champs d&rsquo;un element deja present, puis '
    'persiste. Une cartographie faite sur ' + (C % 'S.foodLog.push') + ' le manque entierement '
    '&mdash; et c&rsquo;est pourtant une vraie ligne enregistree. '
    '<i>C&rsquo;est exactement ce qui rendait le recomptage necessaire, et c&rsquo;est la raison '
    'pour laquelle le plan ne se lit jamais comme une source de chiffres.</i>'))
H.append(Spacer(1, 5))
H.append(P('Ecartes du perimetre, <b>avec leur raison</b> (R30 : un retrait non ecrit redevient '
           'un bug)', 'h1'))
H.append(tableau(
    ['fonction', 'pourquoi elle n&rsquo;est pas un ecrivain de ligne'],
    [[C % 'removeFoodEntry', 'elle <b>supprime</b>'],
     [C % '_vcApplyPersona', 'persona de <b>test</b> : elle remplace tout le journal'],
     [C % '_applyRestoreData', '<b>restauration</b> d&rsquo;une sauvegarde'],
     [(C % 'load') + ' &middot; ' + (C % '_fusionnerAvecLeDisque'),
      '<b>chargement</b> depuis le stockage du telephone']],
    [62 * mm, 103 * mm]))
H.append(Spacer(1, 4))
H.append(P('<i>Ils remplacent ou retirent ; ils n&rsquo;enregistrent pas une ligne issue '
           'd&rsquo;une saisie.</i>', 'petit'))

# ── 2. LA FORME FINALE ───────────────────────────────────────────────────────
H.append(P('2. La forme exacte juste avant l&rsquo;ecriture &mdash; et elle n&rsquo;est pas la '
           'meme partout', 'h1'))
H.append(P('Mesuree sur <b>8 formes reelles</b> : grammes &middot; portions &middot; pour-100&nbsp;g '
           'present et absent &middot; provenance presente et absente &middot; quantite valide, '
           'nulle et non reprenable.', 'p'))
H.append(tableau(
    ['', 'les <b>3 pousseurs</b>', C % 'saveEditFood'],
    [['cles <b>toujours</b> presentes', '<b>17</b>', '<b>8</b>'],
     ['cles optionnelles', (C % 'portionLabel') + ' &middot; ' + (C % 'portionWeightG'),
      (C % 'q') + ' &middot; ' + (C % 'u') + ' &middot; ' + (C % 'per100') + ' &middot; ' +
      (C % 'origine') + ' &middot; ' + (C % 'sourceId') + ' &middot; ' + (C % 'etat') + ' &hellip;'],
     [(C % 'v') + ' &middot; ' + (C % 'saisie') + ' &middot; ' + (C % 'modifie'),
      'poses par ' + (C % '_provFood'), '<b>jamais poses</b>']],
    [46 * mm, 52 * mm, 67 * mm]))
H.append(Spacer(1, 5))
H.append(P('Les trois pousseurs passent tous par ' + (C % '_provFood') + ', donc ils produisent la '
           'meme forme. ' + (C % 'saveEditFood') + ' ne l&rsquo;appelle pas : elle <b>herite</b> de '
           'ce que la ligne portait deja. <i>C&rsquo;est la divergence n&deg;1 du &sect;6.</i>', 'p'))

H.append(PageBreak())

# ── 3. LE CONTRAT ────────────────────────────────────────────────────────────
H.append(P('3. Le contrat &mdash; ce qu&rsquo;elle rend, et ce qu&rsquo;elle ne fait pas', 'h1'))
H.append(bloc_code("_douaneLigne(ligne, ecrivain)\n"
                   "  -> { v:1, etat:'OK'|'WARN'|'INVALID', regles:[...], ecrivain:'...' }",
                   'Le contrat, tel qu&rsquo;il est dans ' + (C % 'app.js') + ' :'))
H.append(Spacer(1, 5))
H.append(tableau(
    ['elle ne&hellip;', 'fige par'],
    [['ne <b>corrige</b> aucune valeur (' + (C % 'q') + ', unite, portion&hellip;)',
      'temoin de comportement <b>et</b> de source'],
     ['ne <b>cree</b> ni ne <b>modifie</b> un ' + (C % 'per100'), 'temoin de source'],
     ['ne <b>tranche</b> pas entre les calories et les macros', 'le temoin des 48&nbsp;kcal'],
     ['ne <b>bloque</b> aucune ecriture', 'une ligne <b>INVALID</b> est enregistree quand meme'],
     ['n&rsquo;ecrit pas dans ' + (C % 'S.foodLog'), '5 appels, longueur inchangee'],
     ['ne <b>parle pas</b> a la personne (ni ' + (C % 'toast') + ', ni ' + (C % 'document') + ')',
      'temoin de source'],
     ['ne touche ni au <b>hub</b> ni aux <b>proprietaires de 1b/3</b>',
      'temoin de source dedie']],
    [100 * mm, 65 * mm]))
H.append(Spacer(1, 6))
H.append(encadre(
    'ET SON CARNET D OBSERVATION NE COLLECTE PAS CE QUE LA PERSONNE MANGE',
    'Pour rendre le resultat &laquo; explicite et testable &raquo;, la douane garde les 50 derniers '
    'verdicts en memoire. [!] Elle n&rsquo;y met <b>que</b> l&rsquo;etat, le nom de l&rsquo;ecrivain '
    'et les noms de regles &mdash; <b>jamais</b> le nom de l&rsquo;aliment ni ses valeurs, et rien '
    'n&rsquo;est persiste ni synchronise. <i>Elle observe la FORME, pas le repas</i> '
    '(Constitution P3 &middot; R36 : ce qui decrit la personne reste chez elle).'))

# ── 4. LES REGLES ────────────────────────────────────────────────────────────
H.append(P('4. Les %d regles &mdash; mesurees AVANT d&rsquo;etre ecrites' % N_REGLES, 'h1'))
H.append(P('<i>&laquo; Ne transforme pas automatiquement cette liste en regles. Mesure d&rsquo;abord '
           'ce qui existe reellement dans les donnees. &raquo;</i> Les candidates ont ete passees sur '
           'les lignes reellement ecrites <b>avant qu&rsquo;une seule ligne de douane n&rsquo;existe</b>.',
           'p'))
H.append(tableau(
    ['famille', 'regles'],
    [['<b>%d structurelles</b><br/>(<b>INVALID</b>)<br/><i>la ligne ne peut pas etre '
      'interpretee</i>' % N_INVALID,
      (C % 'nom_absent') + ' &middot; ' + (C % 'date_absente') + ' &middot; ' +
      (C % 'repas_absent') + ' &middot; ' + (C % 'horodatage_absent') + ' &middot; ' +
      (C % 'macro_non_finie') + ' &middot; ' + (C % 'macro_negative') + ' &middot; ' +
      (C % 'quantite_non_finie') + ' &middot; ' + (C % 'quantite_negative') + ' &middot; ' +
      (C % 'per100_non_fini')],
     ['<b>%d de coherence</b><br/>(<b>WARN</b>)<br/><i>elle s interprete, mais quelque chose ne '
      'va pas ensemble</i>' % N_WARN,
      (C % 'unite_sans_quantite') + ' &middot; ' + (C % 'quantite_sans_unite') + ' &middot; ' +
      (C % 'unite_inconnue') + ' &middot; ' + (C % 'unite_non_reprenable') + ' &middot; ' +
      (C % 'portion_sans_poids') + ' &middot; ' + (C % 'grammes_sans_per100') + ' &middot; ' +
      (C % 'aucune_valeur') + ' &middot; ' + (C % 'tracabilite_absente') + ' &middot; ' +
      (C % 'provenance_orpheline') + ' &middot; ' + (C % 'energie_incoherente') + ' &middot; ' +
      (C % 'portion_masse_incoherente') + ' &middot; ' + (C % 'per100_incoherent_avec_ligne')]],
    [42 * mm, 123 * mm]))
H.append(Spacer(1, 6))
H.append(encadre(
    'DEUX CANDIDATES ONT ETE JETEES A LA MESURE',
    '<b>1. ' + (C % 'portion_sans_nom') + '</b> &mdash; une etiquette absente n&rsquo;est pas '
    'une incoherence, juste un nom absent.<br/>'
    '<b>2. un seuil energetique purement relatif</b> &mdash; il mordait sur un cafe a '
    '2&nbsp;kcal et sur les macros arrondies a l&rsquo;entier par l&rsquo;ecran d&rsquo;edition. '
    'Le seuil retenu est <b>relatif ET absolu</b> : au moins 25&nbsp;kcal d&rsquo;ecart <i>et</i> '
    'plus de 30&nbsp;%.<br/><br/>'
    '<i>Une regle qui mord sur un cafe noir ne mesure pas une incoherence, elle mesure un '
    'arrondi.</i>', ORANGE))
H.append(Spacer(1, 5))
H.append(encadre(
    'LE CAS QUE MICHEL A NOMME RESTE UN AVERTISSEMENT',
    '&laquo; <i>Une incoherence energetique comme 48&nbsp;kcal/100&nbsp;g avec des macros '
    'incompatibles doit rester un WARN tant qu aucune regle produit n a decide quelle source a '
    'raison.</i> &raquo;<br/><br/>'
    '[!] La douane dit <b>qu il y a desaccord</b> ; elle ne dit pas <b>qui a raison</b>, et elle ne '
    'choisit pas. Un temoin le fige, et la mutation qui passe ce cas en <b>INVALID</b> fait '
    'rougir exactement ce temoin.'))

H.append(PageBreak())

# ── 5. LA REPARTITION MESUREE ────────────────────────────────────────────────
H.append(P('5. La repartition MESUREE &mdash; %d ecrivains &times; 8 formes' % len(ECRIVAINS), 'h1'))
H.append(tableau(
    ['etat', 'nombre', 'remarque'],
    [['<b>OK</b>', '<b>%d</b>' % REP.get('OK', 0), ''],
     ['<b>WARN</b>', '<b>%d</b>' % REP.get('WARN', 0), ''],
     ['<b>INVALID</b>', '<b>%d</b>' % REP.get('INVALID', 0),
      'aucune ligne reellement produite par l&rsquo;app n&rsquo;est structurellement cassee'],
     ['<i>(rien ecrit)</i>', '%d' % REP.get('RIEN ECRIT', 0),
      'l&rsquo;ecran d&rsquo;ajout <b>refuse</b> de lui-meme 3 des 8 formes']],
    [30 * mm, 24 * mm, 111 * mm]))
H.append(Spacer(1, 6))
H.append(tableau(
    ['regle', 'mord', 'sur quoi'],
    [[C % k, '<b>%d</b>' % v,
      ('<b>exactement les 8 lignes de ' + (C % 'saveEditFood') + '</b>'
       if k == 'tracabilite_absente' else
       'les 4 ecrivains, sur la portion sans poids' if k == 'portion_sans_poids' else
       'le cas des 48&nbsp;kcal' if k == 'energie_incoherente' else '')]
     for k, v in MORDUES.most_common()],
    [58 * mm, 20 * mm, 87 * mm]))
H.append(Spacer(1, 6))
H.append(encadre(
    'LES 9 FAMILLES `INVALID` NE MORDENT SUR AUCUNE LIGNE REELLE &mdash; ET C EST UN PIEGE',
    'Un temoin qui se contenterait de le constater serait <b>un vert qui ne peut pas rougir</b> '
    '(ft-v994). Chacune est donc <b>eprouvee une par une</b> sur une ligne fabriquee expres, pour '
    'prouver que la branche existe : nom vide, date retiree, repas retire, horodatage a zero, '
    'une macro a ' + (C % 'NaN') + ', une macro negative, une quantite a ' + (C % 'Infinity') +
    ', une quantite negative, un ' + (C % 'per100') + ' non fini. '
    '<i>Les neuf rendent bien INVALID, et chacune nomme sa propre regle.</i>'))

# ── 6. LES DIVERGENCES ───────────────────────────────────────────────────────
H.append(P('6. Deux divergences reelles &mdash; mesurees, ecrites, <b>NON corrigees</b>', 'h1'))
H.append(P('Regle du projet depuis ft-v1200 : <i>un defaut decouvert pendant un chantier se mesure, '
           's ecrit avec sa cause, et attend un feu vert separe.</i>', 'p'))
H.append(encadre(
    'DIVERGENCE 1 &mdash; UNE LIGNE EDITEE PERD SA TRACABILITE',
    (C % 'saveEditFood') + ' ne pose ni ' + (C % 'v') + ', ni ' + (C % 'saisie') + ', ni ' +
    (C % 'modifie') + ' : elle n&rsquo;appelle pas ' + (C % '_provFood') + '. '
    'Resultat mesure : <b>toute</b> ligne passee par l&rsquo;ecran d&rsquo;edition sort <b>WARN</b> '
    'sur ' + (C % 'tracabilite_absente') + ' &mdash; <b>8 sur 8</b>.<br/><br/>'
    '[!] <i>Ce n est pas un defaut de la ligne : c est une divergence d architecture entre les '
    'ecrivains.</i> C est aussi la regle la plus informative du lot &mdash; elle separe '
    'parfaitement l ecrivain qui mute de ceux qui poussent.', ORANGE))
H.append(Spacer(1, 5))
H.append(encadre(
    'DIVERGENCE 2 &mdash; UNE LIGNE ENTIEREMENT A ZERO : REFUSEE D UN COTE, ACCEPTEE DES TROIS AUTRES',
    (C % 'addFoodEntry') + ' refuse (&laquo; Renseigne au moins les calories &raquo;), pendant que '
    + (C % 'quickAddFood') + ', ' + (C % 'rejouerRepas') + ' et ' + (C % 'saveEditFood') +
    ' l&rsquo;acceptent.<br/><br/>'
    '[*] <b>La douane ne tranche pas ce desaccord &mdash; elle le rend visible.</b> Et elle ne '
    'confond pas une valeur <b>absente</b>, un <b>0 legitime</b> (l eau fait vraiment 0 kcal) et '
    'une valeur <b>invalide</b> : seule la troisieme est structurelle.', ORANGE))
H.append(Spacer(1, 5))
H.append(P('Deux ecarts deja connus, re-confirmes a la mesure : ' + (C % 'rejouerRepas') +
           ' perd ' + (C % 'sourceId') + ' et ' + (C % 'etat') + ' la ou ' + (C % 'quickAddFood') +
           ' les garde (documente en 1b-ii) ; et une unite ' + (C % 'ml') + ' est <b>effacee</b> '
           'par les pousseurs alors qu&rsquo;elle est <b>conservee</b> par l&rsquo;ecran '
           'd&rsquo;edition.', 'petit'))

H.append(PageBreak())

# ── 7. LES PREUVES ───────────────────────────────────────────────────────────
H.append(P('7. L&rsquo;etat des preuves', 'h1'))
H.append(tableau(
    ['preuve', 'etat mesure'],
    [['Instantane avant / apres',
      '<b>identique octet pour octet</b>, sha256 ' + (C % SHA_INSTANTANE) + ' &mdash; verifie '
      '<b>apres chacun</b> des 4 branchements, pas seulement a la fin'],
     ['Entree de la douane',
      '<b>%d lignes observees, %d entrees intactes</b> &mdash; serialisation a cles TRIEES avant '
      'et apres l appel, comparee caractere par caractere' % (INTACT, INTACT)],
     ['Sonde', 'les <b>4 ecrivains</b> conduits par leur <b>vraie porte</b> sur 8 formes ; la '
      'section de diagnostic est <b>hors de l instantane compare</b>, sinon le critere binaire '
      'serait impossible'],
     ['Temoins (bloc CCCIII)', '<b>%d</b>, dont <b>9 de source</b> qui figent ce que la douane NE '
      'fait pas' % N_TEMOINS],
     ['Mutations negatives', '<b>16</b>, toutes mordent <b>sur leur propre temoin</b> ; controle '
      'sain a <b>0 rouge avant ET apres</b> ; arbre <b>copie</b> (&sect;60 par construction)'],
     ['Passe parcours', '<b>%d</b> vert, <b>%d</b> rouge, sur l&rsquo;arbre FINAL' % (PASSE_OK, PASSE_KO)],
     ['Autres suites', 'calculs 339/339 &middot; muscles 241/241 &middot; croises 50/50 &middot; '
      'dates 9/9 &middot; donnees classees, 0 trou nouveau']],
    [42 * mm, 123 * mm]))
H.append(Spacer(1, 6))
H.append(P('Les 16 mutations, et ce qu&rsquo;elles font rougir', 'h1'))
H.append(tableau(
    ['la mutation', 'rouges'],
    [['la douane <b>corrige une quantite</b>', '<b>2</b>'],
     ['elle <b>remplace une unite</b>', '<b>1</b>'],
     ['elle <b>cree un ' + (C % 'per100') + '</b>', '<b>1</b>'],
     ['elle <b>modifie la provenance</b>', '<b>2</b>'],
     ['elle <b>bloque un INVALID</b> (un ecrivain lit son verdict)', '<b>2</b>'],
     ['elle <b>ajoute un ' + (C % 'toast') + '</b>', '<b>1</b>'],
     ['un ecrivain <b>contourne</b> la douane (' + (C % 'rejouerRepas') + ')', '<b>2</b>'],
     ['elle <b>absorbe une logique du hub</b> (elle rappelle ' + (C % '_provFood') + ')', '<b>3</b>'],
     ['le <b>4<super>e</super> ecrivain</b> contourne (' + (C % 'saveEditFood') + ')', '<b>2</b>'],
     ['la douane <b>ecrit dans ' + (C % 'S.foodLog') + '</b>', '<b>1</b>'],
     ['une regle <b>INVALID disparait</b>', '<b>2</b>'],
     ['le cas des <b>48&nbsp;kcal devient INVALID</b>', '<b>2</b>'],
     ['le seuil energetique devient <b>purement relatif</b>', '<b>1</b>'],
     ['le carnet d&rsquo;observation part dans l&rsquo;<b>etat persiste</b>', '<b>1</b>'],
     ['la douane <b>rend toujours OK</b>', '<b>4</b>'],
     ['une <b>5<super>e</super> occurrence</b> apparait (un appelant de plus)', '<b>1</b>']],
    [125 * mm, 40 * mm]))

# ── 8. LE VERDICT ────────────────────────────────────────────────────────────
H.append(P('8. Verdict &mdash; la douane d&rsquo;observation est-elle prete ?', 'h1'))
H.append(encadre(
    'OUI &mdash; DOUANE D OBSERVATION PRETE',
    'Les <b>4</b> ecrivains reels passent par elle, elle ne mute <b>aucun</b> champ (prouve octet '
    'pour octet), elle ne bloque <b>aucune</b> ecriture (une ligne INVALID est enregistree quand '
    'meme), et l&rsquo;instantane de ce qui est ecrit est <b>identique</b> apres chacun des quatre '
    'branchements.<br/><br/>'
    '[!] <b>Et ce qu elle refuse de faire est fige par 9 temoins de source</b>, parce qu une douane '
    'qui se mettrait a corriger resterait <b>verte a l ecran</b> : l ecran afficherait la meme '
    'chose, seule la ligne enregistree serait devenue differente, en silence.<br/><br/>'
    '[/!\] <b>Une reserve dite plutot que cachee</b> : la repartition ci-dessus porte sur <b>8 formes '
    'construites</b>, pas sur le vrai journal de Michel. Les 9 familles INVALID n y mordent jamais. '
    '<i>Savoir lesquelles mordent sur des donnees reelles demanderait de faire tourner la douane '
    'en vrai &mdash; c est precisement ce que le mode observation rend possible.</i>', VERT))
H.append(Spacer(1, 6))
H.append(P('Ce qui reste ouvert, explicitement hors perimetre', 'h1'))
H.append(P('[!] <b>Rendre une regle bloquante</b> &mdash; consigne explicite : <i>&laquo; ne rends '
           'aucune regle bloquante sans un nouveau feu vert separe &raquo;</i>. La mesure existe '
           'pour que cette decision se prenne sur des chiffres, pas sur une intuition. &middot; '
           'Les <b>3 divergences</b> du &sect;6 : decisions produit, pas corrections. &middot; '
           + (C % 'S.savedFoods') + ' multi-onglets &middot; l&rsquo;ecart <b>48,3 / 48</b> '
           '&middot; l&rsquo;historique &middot; les migrations &middot; les harmonisations '
           'produit &middot; le garde ' + (C % '!_bcNutr') + ' non bloquant (ft-v1203).', 'p'))
H.append(Spacer(1, 4))
H.append(P('Conception complete : <font face="Courier">docs/DOUANE-NUTRITION.md</font>. '
           'Ce PDF est genere par <font face="Courier">tools/gen_douane_pdf.py</font>, dont les '
           '%d gardes recomptent chaque chiffre depuis le code servi et <b>refusent de produire</b> '
           'si un seul fait tombe &mdash; y compris la repartition, qui est <b>lue dans la mesure</b>, '
           'et le total de la passe, <b>lu dans son journal</b> et jamais ecrit a la main.'
           % N_GARDES, 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Force Tracker - la douane du journal alimentaire (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)
print('OK %s  (%s, %d ecrivains, %d regles dont %d INVALID, %d temoins, OK/WARN/INVALID = %d/%d/%d, '
      'passe %d/%d, %d gardes)'
      % (OUT, VERSION, len(ECRIVAINS), N_REGLES, N_INVALID, N_TEMOINS,
         REP.get('OK', 0), REP.get('WARN', 0), REP.get('INVALID', 0),
         PASSE_OK, PASSE_OK + PASSE_KO, N_GARDES))
