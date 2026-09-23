#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/POIDS-RESTAURATION-SANS-BORNE.pdf — analyse ciblee d un seul defaut, 23/09/2026.

[*] AUCUNE DONNEE PERSONNELLE : la sonde tourne sur un profil SYNTHETIQUE etiquete et
n appelle aucun backend. Ce dossier vit donc DANS le depot.

[!!] LE GARDE CENTRAL EST UN CONTRASTE, PAS UN SOUVENIR : on exige que la ligne du POIDS
n appelle PAS _poidsValide et que les lignes de l AGE et de la TAILLE, deux lignes plus bas,
appellent bien leurs validateurs. Si le poids etait valide, le defaut serait corrige et ce
document ne sortirait pas.

USAGE : python3 tools/gen_poids_restauration_pdf.py <bw_restore.json> [sortie.pdf]
CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d emoji.
"""
import html, io, json, os, re, subprocess, sys
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (KeepTogether, Paragraph, Preformatted, SimpleDocTemplate,
                                Spacer, Table, TableStyle)
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if len(sys.argv) < 2:
    sys.exit(__doc__)
SONDE = json.load(io.open(sys.argv[1], encoding='utf-8'))
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'docs', 'POIDS-RESTAURATION-SANS-BORNE.pdf')
NB = 0
def garde(ok, msg):
    global NB
    NB += 1
    if not ok:
        sys.exit('GARDE %d : %s' % (NB, msg))

SERVIS = ['state.js', 'setup.js', 'tracking.js', 'app.js', 'sw.js', 'Code.js']
SRC = {f: io.open(os.path.join(ROOT, f), encoding='utf-8').read() for f in SERVIS}
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SRC['sw.js']) or [None, '?'])[1]
garde(VERSION.startswith('ft-v'), 'la version servie ne se lit plus dans sw.js')
HEAD = subprocess.check_output(['git', '-C', ROOT, 'rev-parse', '--short', 'HEAD']).decode().strip()
garde(subprocess.check_output(['git', '-C', ROOT, 'status', '--porcelain', '--'] + SERVIS).decode().strip() == '',
      'un fichier SERVI est modifie : le dossier affirme qu aucune correction n est appliquee')

def sans_com(t):
    t = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), t)
    return '\n'.join(re.sub(r'//.*$', '', l) for l in t.split('\n'))
def corps(txt, nom):
    i = txt.find('function %s(' % nom)
    if i < 0: return ''
    j, prof, vu = i, 0, False
    while j < len(txt):
        if txt[j] == '{': prof += 1; vu = True
        elif txt[j] == '}':
            prof -= 1
            if vu and prof == 0: return txt[i:j + 1]
        j += 1
    return txt[i:]

# ══ 1. LE CONTRASTE CENTRAL : le poids n est pas valide, l age et la taille le sont ═══
_c = SRC['setup.js'].replace(' ', '')
LIGNE_BW = "try{if(d.bw)S.bw=parseFloat(d.bw)||S.bw;}catch"
garde(LIGNE_BW in _c, 'la ligne de restauration du poids a change de forme')
garde("if(_ageValide(_a))S.age=_a;" in _c, 'la restauration de l age ne valide plus')
garde("if(_tailleValide(_h))S.height=_h;" in _c, 'la restauration de la taille ne valide plus')
# le voisinage immediat de la ligne du poids ne doit PAS porter de validateur
_i = _c.find(LIGNE_BW)
garde('_poidsValide' not in _c[_i:_i + 260],
      'LA RESTAURATION DU POIDS VALIDE DESORMAIS : le defaut decrit par ce dossier est corrige')

# ══ 2. LES BORNES, RELUES AUX DEUX ENDROITS ══════════════════════════════════════════
_pv = re.search(r'function _poidsValide\(kg\)\{[^}]*\}', SRC['state.js'])
garde(_pv is not None, '_poidsValide ne se lit plus dans state.js')
PV = _pv.group(0)
garde('k>=20' in PV.replace(' ', '') and 'k<=300' in PV.replace(' ', ''),
      'les bornes de _poidsValide ont change : %s' % PV)
_ui = re.search(r'if\(bw\)\{if\(bw>(\d+)&&bw<(\d+)\)S\.bw=bw;', _c)
garde(_ui is not None, 'la validation du poids de saveProfile ne se lit plus dans setup.js')
UI_MIN, UI_MAX = int(_ui.group(1)), int(_ui.group(2))
garde((UI_MIN, UI_MAX) == (20, 300), 'les bornes de l interface ont change : %d / %d' % (UI_MIN, UI_MAX))

# ══ 3. L AMONT : l import de balance n a AUCUNE borne ════════════════════════════════
IMP = corps(SRC['tracking.js'], '_importScaleRows')
garde(len(IMP) > 400, '_importScaleRows ne se lit plus dans tracking.js')
IMP_NU = sans_com(IMP)
garde('_poidsValide' not in IMP_NU,
      '_importScaleRows borne desormais le poids : l origine realiste du dossier disparait')
garde('S.bw=' in IMP_NU.replace(' ', ''), '_importScaleRows n ecrit plus S.bw')
garde('_cloudSyncDebounced' in IMP_NU, '_importScaleRows ne synchronise plus vers le cloud')
N_APP_IMP = len(re.findall(r'_importScaleRows\(', sans_com(SRC['tracking.js']))) - 1
garde(N_APP_IMP >= 1, '_importScaleRows n a plus d appelant : la porte serait morte')
# la porte GARDEE, pour le contraste
BS = corps(SRC['tracking.js'], 'saveBodyScan')
garde('_poidsValide' in sans_com(BS) if BS else True,
      'saveBodyScan ne borne plus le poids : le contraste du dossier tombe')
garde(bool(BS), 'saveBodyScan ne se lit plus : le contraste du dossier est invalide')

# ══ 4. LA SONDE — on RECOMPTE ═══════════════════════════════════════════════════════
garde(SONDE.get('__profil') == 'SYNTHETIQUE', 'la sonde ne se declare plus synthetique')
garde(not SONDE.get('__erreurs_page'), 'la page a leve des erreurs : %r' % SONDE.get('__erreurs_page'))
CAS = SONDE['cas']
garde(len(CAS) == 17, 'la sonde porte %d cas, pas 17' % len(CAS))
ACC = [c for c in CAS if c['verdict'].startswith('ACCEPTE')]
INT = [c for c in CAS if not c['verdict'].startswith('ACCEPTE')]
garde(len(ACC) + len(INT) == len(CAS), 'les verdicts ne se recomposent pas')
# [/!\] GARDE MOLLE CORRIGEE : la premiere version s ecrivait
#    `len(ACC)==10 and len(INT)==7 or len(ACC)+len(INT)==17`. La precedence de `and` sur `or`
#    la reduisait a la seule somme, toujours vraie : elle ne verifiait RIEN. Et c est elle qui
#    m a laisse ecrire « 10 acceptees » en clair alors que la mesure en donne 11.
#    Une garde qui ne peut pas rougir ne mesure pas, elle rassure.
garde(len(ACC) == 11, 'la sonde rend %d cas acceptes, pas 11' % len(ACC))
garde(len(INT) == 6, 'la sonde rend %d cas sans ecriture, pas 6' % len(INT))
def cas(lab):
    for c in CAS:
        if c['cas'] == lab: return c
    sys.exit('GARDE : le cas « %s » a disparu de la sonde' % lab)
# [!!] LA SENTINELLE : sans elle, « ecrit a l identique » se confond avec « pas ecrit ».
SENT = 77.77
garde(all(c['bw_final'] != SENT for c in ACC),
      'un cas ACCEPTE rend la sentinelle : le partage serait faux')
garde(all(c['bw_final'] == SENT for c in INT),
      'un cas INTACT ne rend pas la sentinelle')
garde(not any(str(c['cloud']) == str(SENT) for c in CAS),
      'un cas injecte la sentinelle elle-meme : le temoin ne distinguerait plus rien')
# les cas qui portent le propos
for lab in ('-10', '1', '19 (sous la borne)', '20 (seuil bas)', '300 (seuil haut)',
            '301 (au-dessus)', '500', 'Infinity', '"85,9"', '"85.9"'):
    garde(cas(lab)['verdict'].startswith('ACCEPTE'),
          'le cas « %s » n est plus accepte par la restauration' % lab)
for lab in ('0', '"abc"', '""', 'null', 'undefined', 'NaN'):
    garde(not cas(lab)['verdict'].startswith('ACCEPTE'),
          'le cas « %s » est desormais ecrit' % lab)
C_VIRG = cas('"85,9"')
garde(C_VIRG['bw_final'] == 85, 'parseFloat("85,9") ne rend plus 85 mais %r' % C_VIRG['bw_final'])
garde(cas('"85.9"')['bw_final'] == 85.9, 'parseFloat("85.9") ne rend plus 85,9')
C_NEG, C_INF, C_500, C_1 = cas('-10'), cas('Infinity'), cas('500'), cas('1')
garde(C_NEG['moteurs']['tdee'] == 'null' and C_INF['moteurs']['tdee'] == 'null',
      'calcTDEE ne refuse plus les valeurs absurdes : le garde-fou de ft-v1232 aurait saute')
garde(isinstance(C_500['moteurs']['tdee'], (int, float)) and isinstance(C_1['moteurs']['tdee'], (int, float)),
      'les valeurs plausibles-mais-fausses ne rendent plus un nombre : le cas dangereux disparait')
garde(isinstance(C_NEG['moteurs']['seance'], (int, float)) and C_NEG['moteurs']['seance'] < 0,
      'les calories de seance ne rendent plus un nombre negatif sur un poids negatif')
garde(C_INF['moteurs']['seance'] == 'Infinity', 'les calories de seance ne propagent plus Infinity')
REF = SONDE['reference']
garde(REF['tdee'] == 3161, 'la reference du profil synthetique a change (%r)' % REF['tdee'])
N_MOTEURS = 8

# ══ RENDU ════════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B'); ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A'); FOND = colors.HexColor('#F4F4F2')
FONDC = colors.HexColor('#EEEEEC'); TRAIT = colors.HexColor('#D8D8D4')
VERT = colors.HexColor('#1E7A46'); ORANGE = colors.HexColor('#B26A00')
SS = getSampleStyleSheet()
stl = {
 'titre': ParagraphStyle('t', parent=SS['Title'], fontName='Helvetica-Bold', fontSize=18,
                         leading=22, textColor=ENCRE, alignment=TA_LEFT, spaceAfter=2),
 'sous': ParagraphStyle('s', parent=SS['Normal'], fontName='Helvetica', fontSize=9.3,
                        leading=12.8, textColor=GRIS, spaceAfter=13),
 'h1': ParagraphStyle('h1', parent=SS['Heading1'], fontName='Helvetica-Bold', fontSize=12.5,
                      leading=15.5, textColor=ROUGE, spaceBefore=13, spaceAfter=5),
 'p': ParagraphStyle('p', parent=SS['Normal'], fontName='Helvetica', fontSize=9.2,
                     leading=13, textColor=ENCRE, spaceAfter=5),
 'petit': ParagraphStyle('pt', parent=SS['Normal'], fontName='Helvetica', fontSize=8.1,
                         leading=11.2, textColor=GRIS, spaceAfter=4),
 'cell': ParagraphStyle('c', parent=SS['Normal'], fontName='Helvetica', fontSize=7.8, leading=10.1),
 'cellb': ParagraphStyle('cb', parent=SS['Normal'], fontName='Helvetica-Bold', fontSize=7.8, leading=10.1),
 'code': ParagraphStyle('co', parent=SS['Normal'], fontName='Courier', fontSize=7,
                        leading=8.7, textColor=ENCRE),
}
def _v(x, ou='texte'):
    x = str(x)
    for ch in x:
        try: ch.encode('cp1252')
        except UnicodeEncodeError: sys.exit('CARACTERE NON RENDU %r dans %s' % (ch, ou))
    for m in re.finditer(r'&([A-Za-z][A-Za-z0-9]{1,15});', x):
        c = html.unescape(m.group(0))
        if len(c) == 1:
            try: c.encode('cp1252')
            except UnicodeEncodeError: sys.exit('ENTITE NON RENDUE %s dans %s' % (m.group(0), ou))
    return x
def P(t, s='p'): return Paragraph(_v(t), stl[s])
def encadre(titre, corps_, couleur=ROUGE):
    t = Table([[Paragraph('<b>%s</b>' % _v(titre), stl['cellb'])],
               [Paragraph(_v(corps_), stl['cell'])]], colWidths=[168 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), FOND),
        ('LEFTPADDING', (0,0), (-1,-1), 8), ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LINEBEFORE', (0,0), (0,-1), 2.4, couleur), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
    return KeepTogether(t)
def tableau(entetes, ligs, larg):
    data = [[Paragraph('<b>%s</b>' % _v(h), stl['cellb']) for h in entetes]]
    for l in ligs: data.append([Paragraph(_v(c), stl['cell']) for c in l])
    t = Table(data, colWidths=larg, repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDEDEA')),
        ('GRID', (0,0), (-1,-1), 0.4, TRAIT), ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5), ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('TOPPADDING', (0,0), (-1,-1), 3), ('BOTTOMPADDING', (0,0), (-1,-1), 3)]))
    return t
def bloc_code(txt, legende=None):
    _v(txt, 'bloc de code')
    for l in txt.split('\n'):
        if stringWidth(l, 'Courier', 7.0) > 168 * mm - 12:
            sys.exit('LIGNE QUI DEBORDE (%d car) : %s' % (len(l), l[:70]))
    t = Table([[Preformatted(txt, stl['code'])]], colWidths=[168 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), FONDC),
        ('LEFTPADDING', (0,0), (-1,-1), 7), ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LINEBEFORE', (0,0), (0,-1), 2.0, TRAIT), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
    return KeepTogether([Paragraph(_v(legende), stl['petit']), t]) if legende else t
def pied(cv, doc):
    cv.saveState(); cv.setFont('Helvetica', 7.2); cv.setFillColor(GRIS)
    cv.drawString(21 * mm, 12 * mm, 'Le poids restaure sans borne - Force Tracker %s - 23/09/2026 '
                  '- arbre %s - ANALYSE, aucune correction' % (VERSION, HEAD))
    cv.drawRightString(189 * mm, 12 * mm, 'page %d' % doc.page)
    cv.setStrokeColor(TRAIT); cv.setLineWidth(0.4); cv.line(21 * mm, 16 * mm, 189 * mm, 16 * mm)
    cv.restoreState()
def sv(x): return '-' if x is None else str(x)

H = []
H.append(P('Le poids restaure sans borne', 'titre'))
H.append(P('Analyse ciblee d un seul defaut - Force Tracker %s, arbre %s - 23 septembre 2026.<br/>'
  '[/!\\] <b>Analyse seulement.</b> Aucun code modifie, aucune correction, aucun bump.<br/>'
  'Mesure dans un vrai navigateur, <b>profil SYNTHETIQUE etiquete</b>, <b>aucun backend appele</b> - '
  'aucune donnee personnelle.' % (VERSION, HEAD), 'sous'))

H.append(encadre('La reponse, en une phrase',
  'A la restauration cloud, <b>le poids est ecrit sans aucune borne</b> - alors que l age et la '
  'taille, <b>deux lignes plus bas</b>, passent par leurs validateurs. [*] Sur %d valeurs essayees, '
  '<b>%d entrent dans <font face="Courier">S.bw</font></b>, dont <b>%s</b> - toutes refusees par '
  'l interface. [!!] Et l origine est <b>reelle et actuelle</b> : l import de balance '
  '(<font face="Courier">_importScaleRows</font>) ecrit lui aussi <b>sans borne</b>, puis '
  '<b>synchronise vers le cloud</b>. <i>Deux portes non gardees a la suite.</i>'
  % (len(CAS), len(ACC), '1, 19, 20, 300, 301, 500, -10 et Infinity'), ROUGE))

H.append(P('1. Le chemin exact', 'h1'))
H.append(bloc_code(
 "CLOUD              profile.bw, ecrit par _pn_(body.bw, profile.bw)      Code.js:1657\n"
 "  -> loadProfile   profile: data.profile || {}                          Code.js (GET et POST)\n"
 "  -> _applyRestoreData(d)                                               setup.js\n"
 "  -> LA LIGNE      try{ if(d.bw) S.bw = parseFloat(d.bw) || S.bw; }     setup.js:3239\n"
 "  -> S.bw\n"
 "  -> consommateurs directs : bmrDetail . calcTDEE . autoKcal . calcMacros\n"
 "                             calcSessionCalories . dose de creatine"))
H.append(Spacer(1, 3))
H.append(encadre('Le contraste qui prouve tout - et le commentaire qui promet ce qui n est pas fait',
  'Les deux lignes suivantes, <b>immediatement apres</b>, valident :<br/>'
  '<font face="Courier">setup.js:3242 &nbsp; if(_ageValide(_a)) S.age = _a;</font><br/>'
  '<font face="Courier">setup.js:3243 &nbsp; if(_tailleValide(_h)) S.height = _h;</font><br/>'
  '[*] Et le commentaire pose juste au-dessus annonce <i>&laquo; MEMES BORNES QUE LA SAISIE '
  'MANUELLE (R2/R8) &raquo;</i> - <b>il couvre l age et la taille, pas le poids qui le precede</b>. '
  '[!!] Le garde central de ce document exige que <font face="Courier">_poidsValide</font> '
  '<b>n apparaisse pas</b> au voisinage de cette ligne : si le poids etait valide, ce PDF ne '
  'sortirait pas.', ORANGE))

H.append(P('2. Difference UI / cloud - les bornes relues dans le code', 'h1'))
H.append(tableau(['Chemin', 'Borne min', 'Borne max', 'NaN', 'Infinity', 'chaine', '""', '0', 'negatif', '500'],
 [['<b>UI</b> <font face="Courier">saveProfile</font>', '<b>&gt; %d</b> strict' % UI_MIN,
   '<b>&lt; %d</b> strict' % UI_MAX, 'ignore', 'refuse', 'acceptee si num.', 'ignoree', 'ignore',
   '<b>refuse</b>', '<b>refuse</b>'],
  ['<font face="Courier">_poidsValide</font>', '<b>&gt;= 20</b> inclusif', '<b>&lt;= 300</b> inclusif',
   'false', 'false', 'false', 'false', 'false', 'false', 'false'],
  ['import balance', '[X] <b>aucune</b>', '[X] <b>aucune</b>', '-', '-', '-', '-', '-', '-', '-'],
  ['<b>restauration cloud</b>', '[X] <b>aucune</b>', '[X] <b>aucune</b>', 'ignore', '<b>accepte</b>',
   '<b>acceptee</b>', 'ignoree', 'ignore', '<b>accepte</b>', '<b>accepte</b>']],
 [34 * mm, 24 * mm, 24 * mm, 13 * mm, 16 * mm, 21 * mm, 12 * mm, 11 * mm, 14 * mm, 12 * mm]))
H.append(Spacer(1, 3))
H.append(P('[/!\\] <b>Deux bornes differentes pour la meme grandeur</b> : l interface est '
  '<b>stricte</b>, <font face="Courier">_poidsValide</font> est <b>inclusif</b>. Mesure : '
  '<b>exactement %d et exactement %d</b> sont refuses par l interface et valides par le '
  'validateur.' % (UI_MIN, UI_MAX), 'p'))

H.append(P('3. Les %d valeurs essayees - ce qui passe reellement' % len(CAS), 'h1'))
H.append(P('Sonde a <b>sentinelle %s</b> : on ne compare pas avant/apres, on part d une valeur '
  'temoin qu <b>aucun cas ne peut produire</b>. [!!] Ma premiere sonde partait de 85,9 et classait '
  'la chaine <font face="Courier">"85.9"</font> en &laquo; conservee &raquo; alors qu elle est bien '
  '<b>ecrite, a l identique</b>. <i>Un temoin qui compare des valeurs ne distingue pas '
  '&laquo; pas ecrit &raquo; de &laquo; reecrit pareil &raquo;.</i>' % str(SENT).replace('.', ','), 'p'))
H.append(tableau(['Valeur cloud', 'parseFloat', 'S.bw final', 'Restauration', 'Ce que l UI ferait'],
 [[sv(c['cloud']) or "(vide)", sv(c['parse']), sv(c['bw_final']),
   ('<b>[X] ACCEPTE</b>' if c['verdict'].startswith('ACCEPTE') else 'rien ecrit'),
   c['ui']] for c in CAS],
 [34 * mm, 28 * mm, 28 * mm, 38 * mm, 40 * mm]))
H.append(Spacer(1, 3))
H.append(P('[*] <b><font face="Courier">parseFloat("85,9")</font> rend %s</b> - la virgule '
  'francaise tronque. L interface, elle, passe par <font face="Courier">numFR</font> et obtient '
  '85,9.' % C_VIRG['bw_final'], 'p'))

H.append(P('4. Effet numerique sur les moteurs directs', 'h1'))
H.append(P('Reference du profil synthetique a 85,9 kg : BMR <b>%s</b> . TDEE <b>%s</b> . cible '
  '<b>%s</b> . %s P / %s G / %s L . seance <b>%s</b> . creatine <b>%s g</b>.'
  % (REF['bmr'], REF['tdee'], REF['cible'], REF['prot'], REF['gluc'], REF['lip'],
     REF['seance'], REF['creatine']), 'p'))
H.append(tableau(['S.bw', 'BMR', 'TDEE', 'Cible', 'Prot', 'Gluc', 'Seance', 'Creatine'],
 [[('<b>%s</b>' % sv(c['bw_final'])), sv(c['moteurs']['bmr']), ('<b>%s</b>' % sv(c['moteurs']['tdee'])),
   ('<b>%s</b>' % sv(c['moteurs']['cible'])), sv(c['moteurs'].get('prot')), sv(c['moteurs'].get('gluc')),
   sv(c['moteurs']['seance']), sv(c['moteurs'].get('creatine'))]
  for c in ACC],
 [26 * mm, 20 * mm, 22 * mm, 22 * mm, 20 * mm, 20 * mm, 20 * mm, 18 * mm]))
H.append(Spacer(1, 3))
H.append(encadre('Deux regimes, et la difference decide de la severite',
  '<b>-10 et Infinity</b> : <font face="Courier">calcTDEE</font> rend <b>null</b>. Le garde-fou de '
  'ft-v1232 tient, les moteurs <b>refusent</b> au lieu de mentir. [!!] Mais '
  '<font face="Courier">calcSessionCalories</font> et la <b>creatine</b>, eux, ne le voient pas : '
  '<b>%s kcal</b> de seance et <b>%s g</b> de creatine sur un poids negatif. [*] <b>1 . 19 . 20 . '
  '300 . 301 . 500</b> : <b>tout est bien forme</b>, aucun null, aucun NaN. <i>Une cible de %s kcal '
  'avec %s g de proteines est une prescription complete, pas une erreur visible</i> - c est le cas '
  'dangereux. [*] <b>"85,9" -&gt; 85</b> : la cible passe de %s a %s, soit <b>%d kcal</b>, '
  'totalement silencieux.'
  % (C_NEG['moteurs']['seance'], C_NEG['moteurs'].get('creatine'),
     C_500['moteurs']['cible'], C_500['moteurs'].get('prot'),
     REF['cible'], C_VIRG['moteurs']['cible'], C_VIRG['moteurs']['cible'] - REF['cible']), ROUGE))

H.append(P('5. Scenario utilisateur', 'h1'))
H.append(bloc_code(
 "POIDS VALIDE EXISTANT   85,9 kg, saisi a la main, telephone A\n"
 "IMPORT                  fichier de balance importe -> _importScaleRows\n"
 "                        S.bw = 150   (AUCUNE borne dans cette fonction)\n"
 "                        _cloudSyncDebounced() -> le 150 part au cloud\n"
 "RESTAURATION            telephone B, ou navigateur vide\n"
 "                        setup.js:3239 : if(150) -> S.bw = 150            [X]\n"
 "CALCUL                  BMR, TDEE, cible, macros, seance, creatine : tous faux\n"
 "AFFICHAGE               « 150 kg » dans le Profil, et une cible parfaitement\n"
 "                        bien formee au-dessus d un calcul qui n a plus de sens"))
H.append(Spacer(1, 3))
H.append(tableau(['Cas', 'Vrai pour'],
 [['A - seulement un etat interne invalide', '<b>aucune valeur</b>'],
  ['B - absurdite evidente a l ecran', '500 et au-dela'],
  ['<b>C - valeur plausible mais fausse</b>', '<b>1 . 19 . 20 . 300 . 301 . 500 . "85,9"</b>'],
  ['D - moteurs bloques', '-10 et Infinity (TDEE null)'],
  ['<b>E - contamine plusieurs calculs</b>', '<b>toutes les valeurs acceptees</b>']],
 [72 * mm, 96 * mm]))

H.append(P('6. Possible contre plausible - et l origine reelle', 'h1'))
H.append(tableau(['Valeur', 'Techniquement acceptee', 'Plausible en production'],
 [['<b>150 . 500 . 3 000</b>', 'oui', '<b>[X] OUI</b> - voir l origine ci-dessous'],
  ['1 . 19 . 20', 'oui', 'peu - aucun chemin connu ne les produit'],
  ['<font face="Courier">"85,9"</font>', 'oui', '<b>aucune origine realiste trouvee</b> : '
   '<font face="Courier">S.bw</font> est toujours un <b>nombre</b> localement '
   '(<font face="Courier">load</font> fait parseFloat, <font face="Courier">saveProfile</font> et '
   '<font face="Courier">saveWeightEntry</font> font numFR, l import fait Math.round)'],
  ['<b>-10 . Infinity . NaN . "abc"</b>', 'oui (les deux premiers)',
   '<b>[X] NON</b> - <b>aucun chemin du code ne les produit</b>. Injectables artificiellement seulement.']],
 [34 * mm, 34 * mm, 100 * mm]))
H.append(Spacer(1, 3))
H.append(encadre('L origine realiste existe, et elle est ACTUELLE',
  '<b><font face="Courier">_importScaleRows</font> (tracking.js) ecrit '
  '<font face="Courier">S.bw</font> et <font face="Courier">S.weightLog[].kg</font> SANS AUCUNE '
  'BORNE</b> - mesure : <b>zero</b> occurrence de <font face="Courier">_poidsValide</font> dans la '
  'fonction, commentaires retires. Puis elle appelle '
  '<b><font face="Courier">_cloudSyncDebounced()</font></b>. Son appelant est un vrai parcours '
  '(toast &laquo; N pesees importees &raquo;). [*] <b>Deux portes non gardees a la suite : l import '
  'ecrit n importe quoi dans le cloud, la restauration le relit sans rien verifier.</b> [/!\\] Le '
  'contraste : <font face="Courier">saveBodyScan</font>, l <b>autre</b> porte d import, appelle '
  'bien <font face="Courier">_poidsValide</font> depuis ft-v1096 - <i>le meme garde-fou sur un '
  'chemin et pas sur l autre, c est R8</i>. [*] Origine <b>historique</b> aussi : avant ft-v1096, '
  'l import par photo ecrivait <b>3 000 kg</b> dans le profil, et une valeur ecrite a l epoque est '
  'toujours au cloud.', ROUGE))

H.append(P('7. Rayon et severite', 'h1'))
H.append(tableau(['Classement', 'Retenu', 'Justification'],
 [['Rayon', '<b>MULTI-MOTEUR</b>',
   '<b>%d consommateurs directs mesures</b> : BMR, TDEE, cible, proteines, glucides, lipides, '
   'calories de seance, dose de creatine. [X] Pas SYSTEMIQUE : la donnee reste le poids, elle ne '
   'casse ni la navigation, ni le stockage, ni les autres domaines.' % N_MOTEURS],
  ['Severite', '<b>MAJEUR</b>',
   '<b>En faveur</b> : origine reelle et actuelle (import non borne -&gt; cloud), %d moteurs '
   'contamines, la valeur <b>persiste</b> et repart au cloud, et le cas plausible (150 kg lu d un '
   'fichier) est <b>invisible</b>. [X] <b>Pas CRITIQUE</b> : les deux valeurs catastrophiques '
   '(-10, Infinity) n ont <b>aucune origine realiste</b> et <font face="Courier">calcTDEE</font> '
   'les <b>refuse</b> ; le poids est <b>affiche</b> dans le Profil ; la recuperation est immediate '
   '(retaper son poids).' % N_MOTEURS]],
 [22 * mm, 30 * mm, 116 * mm]))

H.append(P('8. Points connexes - notes, PAS suivis', 'h1'))
H.append(tableau(['Point connexe a verifier plus tard', 'Ancre'],
 [['<font face="Courier">_importScaleRows</font> ecrit <font face="Courier">S.bw</font> et '
   '<font face="Courier">S.weightLog[].kg</font> sans borne, puis synchronise. C est l <b>amont</b> '
   'du defaut etudie, une porte distincte.', 'tracking.js (_importScaleRows)'],
  ['L interface borne a <font face="Courier">&gt;20 &amp;&amp; &lt;300</font> (strict) et '
   '<font face="Courier">_poidsValide</font> a <font face="Courier">&gt;=20 &amp;&amp; &lt;=300</font> '
   '(inclusif) - <b>deux bornes pour la meme grandeur</b>, divergentes exactement aux seuils.',
   'setup.js:3155 vs state.js:815'],
  ['<font face="Courier">calcSessionCalories</font> et la dose de creatine <b>ne voient pas</b> le '
   'refus de <font face="Courier">calcTDEE</font> : ils rendent %s kcal et %s g la ou les autres '
   'moteurs disent null.' % (C_NEG['moteurs']['seance'], C_NEG['moteurs'].get('creatine')),
   'app.js (S.bw || 80)']],
 [136 * mm, 32 * mm]))
H.append(Spacer(1, 3))
H.append(P('[X] Non audites, hors perimetre demande : <font face="Courier">activityLevel</font>, '
  'l age, la taille, les autres champs cloud.', 'petit'))

H.append(P('9. Correction envisageable PLUS TARD - rien n est applique', 'h1'))
H.append(bloc_code(
 "// setup.js:3239 — aujourd'hui\n"
 "try{ if(d.bw) S.bw = parseFloat(d.bw) || S.bw; }catch(e){ ... }\n"
 "\n"
 "// le motif que les DEUX lignes suivantes emploient deja\n"
 "try{ const _b = parseFloat(d.bw); if(_poidsValide(_b)) S.bw = _b; }catch(e){ ... }"))
H.append(Spacer(1, 3))
H.append(encadre('Trois bornes a ne pas perdre de vue',
  '<b>1.</b> <font face="Courier">_poidsValide</font> est <b>inclusif</b> et l interface '
  '<b>stricte</b> - les aligner est une <b>decision</b>, pas un detail de mise en forme. '
  '<b>2.</b> Une valeur refusee doit <b>conserver l ancienne</b>, jamais retomber sur 0. '
  '<b>3.</b> Cela ne ferme que l <b>aval</b> : l import non borne reste la porte d entree, et c est '
  'lui qui alimente le cloud.', ORANGE))

H.append(Spacer(1, 6))
H.append(encadre('Etat du depot, verifie par git a la generation',
  '<b>AUCUN FICHIER SERVI N EST MODIFIE</b> (%s). Aucun bump - le cache sert toujours <b>%s</b>. '
  'Aucune publication, <b>aucun backend appele</b>. [*] La sonde tourne sur un profil '
  '<b>SYNTHETIQUE</b> declare : aucune valeur de ce dossier ne peut etre attribuee a une personne '
  'reelle.' % (', '.join(SERVIS), VERSION), VERT))
H.append(Spacer(1, 5))
H.append(P('Genere par <font face="Courier">tools/gen_poids_restauration_pdf.py</font>. Ses '
  '<b>%d gardes</b> relisent chaque ancre dans le code servi et recomptent les %d cas de la sonde. '
  '[!!] Le garde central est un <b>contraste</b> : il exige que la ligne du POIDS n appelle pas '
  '<font face="Courier">_poidsValide</font> et que celles de l AGE et de la TAILLE appellent bien '
  'les leurs - <b>si le poids etait valide, ce document ne sortirait pas</b>.' % (NB, len(CAS)), 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                        topMargin=17 * mm, bottomMargin=20 * mm,
                        title='Le poids restaure sans borne - Force Tracker (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)

def _relire(chemin):
    import base64, zlib
    data = open(chemin, 'rb').read(); textes = []; echecs = 0
    for m in re.finditer(rb'<<(.*?)>>\s*stream\r?\n', data, re.S):
        dico = m.group(1); lg = re.search(rb'/Length\s+(\d+)', dico)
        if not lg: echecs += 1; continue
        b = data[m.end():m.end() + int(lg.group(1))]
        try: brut = base64.a85decode(b.strip(), adobe=True)
        except Exception: brut = b
        lu = None
        for e in (brut, b):
            try: lu = zlib.decompress(e).decode('latin-1'); break
            except Exception: continue
        if lu is None:
            if b'/Font' in dico or b'FontFile' in dico: continue
            echecs += 1
        else: textes.append(lu)
    return '\n'.join(textes), echecs

_t, _ech = _relire(OUT)
_np = open(OUT, 'rb').read().count(b'/Type /Page') - 1
if _ech:
    os.remove(OUT); sys.exit('REFUS : %d flux non relus' % _ech)
_lis = re.sub(r'\s+', ' ', ' '.join(x[1:-1] for x in re.findall(r'\((?:[^()\\]|\\.)*\)', _t)))
if re.search(r'&lt;b&gt;|<b>', _lis):
    os.remove(OUT); sys.exit('REFUS : balise en clair dans le PDF produit')
if len(_lis) < 7000:
    os.remove(OUT); sys.exit('REFUS : le PDF relu ne fait que %d caracteres lisibles' % len(_lis))
for _m in ('sans aucune borne', 'deux lignes plus bas', 'sentinelle', 'aucune origine realiste',
           'AUCUN FICHIER SERVI', 'MULTI-MOTEUR', 'portes non gardees', 'SYNTHETIQUE',
           'bien forme', 'POINT'):
    if _m.lower() not in _lis.lower():
        os.remove(OUT); sys.exit('REFUS : « %s » n est pas imprime dans le PDF' % _m)
print('   relu : %d caracteres lisibles sur %d pages, 0 flux manque' % (len(_lis), _np))
print('OK %s (%d gardes, %d octets)' % (OUT, NB, os.path.getsize(OUT)))
print('   %d cas : %d acceptes, %d rien ecrit | UI %d-%d strict vs _poidsValide 20-300 inclusif'
      % (len(CAS), len(ACC), len(INT), UI_MIN, UI_MAX))
