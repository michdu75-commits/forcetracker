#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/PROVENANCE-MASSE-GRASSE.pdf — analyse ciblee d un seul defaut, 23/09/2026.

[*] AUCUNE DONNEE PERSONNELLE : la sonde tourne sur un profil SYNTHETIQUE etiquete. Ce
dossier vit donc DANS le depot, contrairement au dossier TDEE et a l audit forensique.

[!!] LE GARDE CENTRAL EST UNE LECTURE DU CODE SERVI, PAS UN SOUVENIR : `leanMassRecente`
est extraite de state.js et on verifie qu elle ne mentionne PAS bfSrc. Si elle se mettait a
le lire, le defaut serait corrige et ce document ne sortirait pas.

USAGE : python3 tools/gen_provenance_bf_pdf.py <bf_prov.json> [sortie.pdf]
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
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'docs', 'PROVENANCE-MASSE-GRASSE.pdf')
NB = 0
def garde(ok, msg):
    global NB
    NB += 1
    if not ok:
        sys.exit('GARDE %d : %s' % (NB, msg))

# ══ A. LE CODE SERVI ══════════════════════════════════════════════════════════════════
SERVIS = ['state.js', 'tracking.js', 'coach.js', 'sw.js']
SRC = {f: io.open(os.path.join(ROOT, f), encoding='utf-8').read() for f in SERVIS}
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SRC['sw.js']) or [None, '?'])[1]
garde(VERSION.startswith('ft-v'), 'la version servie ne se lit plus dans sw.js')
HEAD = subprocess.check_output(['git', '-C', ROOT, 'rev-parse', '--short', 'HEAD']).decode().strip()
garde(subprocess.check_output(['git', '-C', ROOT, 'status', '--porcelain', '--'] + SERVIS).decode().strip() == '',
      'un fichier SERVI est modifie : le dossier affirme qu aucune correction n est appliquee')

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

# ══ B. LE GARDE CENTRAL : leanMassRecente NE LIT PAS bfSrc ════════════════════════════
def sans_com(t):
    """Retire les commentaires. [/!\\] SANS CA, LA GARDE COMPTE LA DOCUMENTATION :
    leanMassRecente porte un commentaire qui CITE nature:'saisie' pour l expliquer, donc le
    motif y apparait deux fois - une en code, une en prose. Une garde qui compte les deux
    refuse un fichier parfaitement sain. Meme famille que le piege de la sous-chaine de
    BUGS.md n1, et que le detecteur de commentaire du dossier TDEE."""
    t = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), t)
    return '\n'.join(re.sub(r'//.*$', '', l) for l in t.split('\n'))

LMR_BRUT = corps(SRC['state.js'], 'leanMassRecente')
LMR = sans_com(LMR_BRUT)
garde(len(LMR_BRUT) > 400, 'leanMassRecente ne se lit plus dans state.js (%d caracteres)' % len(LMR_BRUT))
garde('bfSrc' not in LMR,
      'leanMassRecente lit desormais bfSrc : LE DEFAUT DECRIT PAR CE DOSSIER EST CORRIGE')
garde("nature:'saisie'" in LMR.replace(' ', ''),
      "leanMassRecente n ecrit plus nature:'saisie' en dur")
garde("nature:sc.lmDeduite?'deduite':'lue'" in LMR.replace(' ', ''),
      'la branche bilan corporel ne distingue plus deduite / lue')
N_SAISIE = len(re.findall(r"nature:\s*'saisie'", LMR))
N_SAISIE_COM = len(re.findall(r"nature:\s*'saisie'", LMR_BRUT)) - N_SAISIE
garde(N_SAISIE == 1,
      "nature:'saisie' apparait %d fois HORS commentaire dans leanMassRecente, pas 1" % N_SAISIE)

# ══ C. L ECRITURE EST CORRECTE — c est ce qui prouve le diagnostic B ══════════════════
SBF = corps(SRC['tracking.js'], 'saveBodyFat')
garde(len(SBF) > 800, 'saveBodyFat ne se lit plus dans tracking.js')
_s = SBF.replace(' ', '')
garde("bfSrc=(_brutBf&&bf)?BF_MESURE:null" in _s, "l etiquetage de la saisie manuelle a change")
garde("if(navy!=null){bf=navy;bfSrc=BF_ESTIME;}" in _s,
      "US Navy n est plus etiquete BF_ESTIME a l ecriture : le diagnostic B tomberait")
garde("if(!_garderSrc)e.bfSrc=bfSrc||BF_MESURE;" in _s, "l ecriture de bfSrc sur la ligne a change")
garde("constBF_MESURE='mesure',BF_ESTIME='estime';" in SRC['tracking.js'].replace(' ', ''),
      'les constantes BF_MESURE / BF_ESTIME ont change de valeur')

# ══ D. LE VOISIN QUI, LUI, LIT bfSrc — le contraste qui prouve l aveuglement ══════════
BFD = corps(SRC['tracking.js'], 'bfDerniere')
garde('bfSrc' in BFD, 'bfDerniere ne lit plus bfSrc : le contraste du dossier tomberait')

# ══ E. LA PHRASE ENVOYEE A MILO ═══════════════════════════════════════════════════════
garde("a SAISI lui/elle-m" in SRC['coach.js'],
      'la phrase « a SAISI lui/elle-meme » a disparu de coach.js')
garde("_bd.lm.nature==='saisie'" in SRC['coach.js'].replace(' ', ''),
      'le ternaire de coach.js ne teste plus nature===saisie')
N_NATURES = len(re.findall(r"_bd\.lm\.nature===", SRC['coach.js'].replace(' ', '')))
garde(N_NATURES == 2, 'le ternaire de coach.js porte %d tests de nature, pas 2' % N_NATURES)

# ══ F. LES ORIGINES DE BF REELLEMENT SUPPORTEES ══════════════════════════════════════
ORIG = []
for lab, motif, anc in [
    ('saisie manuelle', r"bfSrc=\(_brutBf&&bf\)\?BF_MESURE:null", 'tracking.js:994'),
    ('US Navy (repli)', r"bf=navy;bfSrc=BF_ESTIME", 'tracking.js:1004'),
    ('bilan corporel / balance', r"wentry\.bfSrc=BF_MESURE", 'tracking.js:1990'),
    ('import de bilans', r"\.bfSrc=BF_MESURE;\}", 'tracking.js:1388-1389'),
    ('edition d une pesee', r"entry\.bfSrc=\(_anc&&_anc\.bf===bfv&&_anc\.bfSrc\)\?_anc\.bfSrc:BF_MESURE", 'tracking.js:1134'),
]:
    ok = re.search(motif, SRC['tracking.js'].replace(' ', '')) is not None
    garde(ok, "l origine « %s » ne se lit plus a %s" % (lab, anc))
    ORIG.append((lab, anc))
garde(len(ORIG) == 5, 'seules %d origines relues' % len(ORIG))

# ══ G. LA SONDE — on RECOMPTE ses chiffres ═══════════════════════════════════════════
garde(SONDE.get('__profil') == 'SYNTHETIQUE', 'la sonde ne se declare plus synthetique')
garde(not SONDE.get('__erreurs_page'), 'la page a leve des erreurs : %r' % SONDE.get('__erreurs_page'))
garde(SONDE['G_source_leanMassRecente'] is False,
      'la sonde dit que leanMassRecente lit bfSrc : contradiction avec la lecture du code')
A, B, C, D, E = (SONDE['A_sans_bf'], SONDE['B_estimation'], SONDE['C_mesure'],
                 SONDE['D_sans_bfSrc'], SONDE['E_bilan'])
NAVY = SONDE['B_navy_calcule']
garde(SONDE['B_bfSrc_stocke'] == 'estime', "la ligne enregistree ne porte plus bfSrc='estime'")
garde(SONDE['D_bfSrc'] == 'absent', 'le cas « ancienne ligne » porte un bfSrc')
# LE CŒUR : B, C et D sont INDISCERNABLES
for cle in ('bmr', 'methode', 'tdee', 'cible'):
    garde(B[cle] == C[cle] == D[cle],
          'B/C/D divergent sur %s (%r / %r / %r) : le dossier affirme qu ils sont identiques'
          % (cle, B[cle], C[cle], D[cle]))
garde(B['lm']['nature'] == C['lm']['nature'] == D['lm']['nature'] == 'saisie',
      'les trois cas ne rendent plus tous nature=saisie')
garde(E['lm']['nature'] == 'lue', 'le bilan corporel ne rend plus nature=lue : le contraste tombe')
garde(A['methode'] == 'mifflin' and B['methode'] == 'katch',
      'la bascule Mifflin -> Katch ne se produit plus')
D_BMR = B['bmr'] - A['bmr']
D_TDEE = B['tdee'] - A['tdee']
D_CIBLE = B['cible'] - A['cible']
garde(D_BMR > 0 and D_TDEE > 0, 'la presence de l estimation ne releve plus BMR et TDEE')
# les phrases envoyees a Milo
def raison(txt):
    t = re.sub(r'\s+', ' ', txt)
    m = re.search(r'pas une mesure : (.{0,150}?)\. Appuie', t)
    return m.group(1) if m else '(introuvable)'
R_EST, R_MES, R_BIL = (raison(SONDE['F_milo_estimation']), raison(SONDE['F_milo_mesure']),
                       raison(SONDE['F_milo_bilan']))
garde(R_EST == R_MES,
      'les phrases envoyees a Milo different desormais entre estimation et mesure : le defaut serait corrige')
garde(R_BIL != R_EST, 'le bilan corporel ne se distingue plus : le contraste du dossier tombe')
garde('SAISI' in R_EST, 'la phrase de l estimation ne contient plus « SAISI »')
garde('ESTIMATION, pas une mesure' in re.sub(r'\s+', ' ', SONDE['F_milo_estimation']),
      'le bloc n annonce plus « ESTIMATION, pas une mesure » : la nuance du dossier tomberait')

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
 'cell': ParagraphStyle('c', parent=SS['Normal'], fontName='Helvetica', fontSize=8, leading=10.4),
 'cellb': ParagraphStyle('cb', parent=SS['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=10.4),
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
        ('LEFTPADDING', (0,0), (-1,-1), 4), ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 3.2), ('BOTTOMPADDING', (0,0), (-1,-1), 3.2)]))
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
    cv.drawString(21 * mm, 12 * mm, 'La provenance de la masse grasse - Force Tracker %s - '
                  '23/09/2026 - arbre %s - ANALYSE, aucune correction' % (VERSION, HEAD))
    cv.drawRightString(189 * mm, 12 * mm, 'page %d' % doc.page)
    cv.setStrokeColor(TRAIT); cv.setLineWidth(0.4); cv.line(21 * mm, 16 * mm, 189 * mm, 16 * mm)
    cv.restoreState()
def kfs(x): return ('%+d' % x)

H = []
H.append(P('La provenance de la masse grasse', 'titre'))
H.append(P('Analyse ciblee d un seul defaut - Force Tracker %s, arbre %s - 23 septembre 2026.<br/>'
  '[/!\\] <b>Analyse seulement.</b> Aucun code modifie, aucune correction, aucun bump.<br/>'
  'Mesure dans un vrai navigateur sur l application servie, <b>profil SYNTHETIQUE etiquete</b> - '
  'aucune donnee personnelle. Ce dossier vit donc dans le depot.' % (VERSION, HEAD), 'sous'))

H.append(encadre('La reponse, en une phrase',
  'US Navy est <b>correctement etiquete</b> comme une estimation au moment ou il est enregistre. '
  'La provenance se perd <b>a la relecture</b> : <font face="Courier">leanMassRecente()</font> ne '
  'lit jamais <font face="Courier">bfSrc</font> et ecrit <font face="Courier">nature:\'saisie\'</font> '
  'en dur. [*] Milo recoit alors, mot pour mot, <i>&laquo; elle est calculee a partir d un %% de '
  'masse grasse qu il/elle a SAISI lui/elle-meme &raquo;</i> - <b>faux</b>, la personne n a rien '
  'tape. [!!] <b>Mais l erreur est PUREMENT SEMANTIQUE</b> : mesure, l etiquette ne change '
  '<b>aucun</b> chiffre.', ROUGE))

H.append(P('1. Mecanisme - l ecriture est correcte, et c est ce qui prouve le diagnostic', 'h1'))
H.append(P('<font face="Courier">_bfNavy()</font> prend <b>cou, tour de taille, hanches (femme), '
  'taille corporelle, sexe</b>. Dans <font face="Courier">saveBodyFat</font> il n est appele '
  'qu <b>en repli</b>, si la case du %% est vide :', 'p'))
H.append(bloc_code(
 "tracking.js:994   let bfSrc = (_brutBf && bf) ? BF_MESURE : null;      // tape -> 'mesure'\n"
 "tracking.js:1004  if(!bf){ const navy = _bfNavy(...);\n"
 "                           if(navy != null){ bf = navy; bfSrc = BF_ESTIME; } }\n"
 "tracking.js:1067  if(!_garderSrc) e.bfSrc = bfSrc || BF_MESURE;        // ecrit sur la ligne\n"
 "\n"
 "  MESURE PAR LA SONDE : la ligne enregistree porte bien  bfSrc = %r"
 % SONDE['B_bfSrc_stocke'],
 "L etiquetage a l ecriture, relu dans le code servi et verifie par la sonde :"))
H.append(Spacer(1, 3))
H.append(P('[ok] <b>L etiquetage a l ecriture est CORRECT.</b> Le toast le dit aussi : '
  '<i>&laquo; Estimation enregistree &raquo;</i> contre <i>&laquo; Mesure enregistree &raquo;</i>.', 'p'))

H.append(P('2. Point EXACT de perte de provenance', 'h1'))
H.append(bloc_code(
 "state.js  function leanMassRecente(){\n"
 "            ...\n"
 "            const bf = Number(w.bf), bw = Number(w.kg != null ? w.kg : w.bw);\n"
 "            if(!(isFinite(bf) && bf>0 && bf<70 && isFinite(bw) && bw>0)) return;\n"
 "            cand.push({ date:w.date, lm:..., poids:bw, src:'pesee', nature:'saisie' });\n"
 "                                                                    ^^^^^^^^^^^^^^^^\n"
 "  bfSrc apparait 0 fois dans toute la fonction  |  nature:'saisie' est ecrit EN DUR (%d fois)"
 % N_SAISIE,
 "La seule ligne qui compte, relue dans le code servi a chaque generation :"))
H.append(Spacer(1, 3))
H.append(encadre('Diagnostic : reponse B - et le voisin le prouve',
  '<b>B : US Navy est correctement etiquete, mais <font face="Courier">leanMassRecente()</font> '
  'ignore <font face="Courier">bfSrc</font>.</b> Ni A, ni C. [*] Le garde central de ce document '
  'n est pas un souvenir : la fonction est <b>extraite de <font face="Courier">state.js</font></b> '
  'et on verifie qu elle ne mentionne pas <font face="Courier">bfSrc</font>. Si elle se mettait a '
  'le lire, ce PDF ne sortirait pas. [*] <b>Le contraste qui tranche</b> : '
  '<font face="Courier">bfDerniere()</font>, juste a cote dans '
  '<font face="Courier">tracking.js</font>, <b>filtre bien</b> sur '
  '<font face="Courier">bfSrc !== BF_ESTIME</font>. <i>Le stockage sait, l affichage sait - seul '
  '<font face="Courier">leanMassRecente</font> est aveugle.</i>', ORANGE))

H.append(P('3. Les origines de masse grasse reellement supportees par le code', 'h1'))
H.append(tableau(['Origine', 'bfSrc ecrit', 'Ancre relue'],
 [['saisie manuelle', "<font face=\"Courier\">'mesure'</font>", ORIG[0][1]],
  ['<b>US Navy (repli)</b>', "<b><font face=\"Courier\">'estime'</font></b>", ORIG[1][1]],
  ['bilan corporel / balance', "<font face=\"Courier\">'mesure'</font>", ORIG[2][1]],
  ['import de bilans', "<font face=\"Courier\">'mesure'</font>", ORIG[3][1]],
  ['edition d une pesee', 'conserve, sinon <font face="Courier">mesure</font>', ORIG[4][1]],
  ['ancienne ligne', '<b>absent</b>', '-']],
 [58 * mm, 60 * mm, 50 * mm]))
H.append(Spacer(1, 3))
H.append(P('[/!\\] Le <b>bilan corporel</b> n emprunte pas ce chemin : il alimente '
  '<font face="Courier">S.bodyScans</font>, qui a sa propre branche dans '
  '<font face="Courier">leanMassRecente</font> avec '
  '<font face="Courier">nature:\'lue\'</font> / <font face="Courier">\'deduite\'</font> - '
  '<b>correctement distinguee</b>, et la sonde le confirme (%s).' % E['lm']['nature'], 'petit'))

H.append(P('4. Scenario utilisateur', 'h1'))
H.append(bloc_code(
 "MESURES        cou 38,9 . taille 91,3 . case %% laissee VIDE\n"
 "CALCUL         _bfNavy -> %s %%\n"
 "ENREGISTREMENT weightLog[0] = {kg:85.9, bf:%s, bfSrc:'estime'}          [ok]\n"
 "               toast : « Estimation enregistree : %s %% »               [ok]\n"
 "\n"
 "RELECTURE      leanMassRecente() -> {lm:%s, src:'pesee', nature:'SAISIE'}   <<< ICI\n"
 "MASSE MAIGRE   %s kg\n"
 "BMR            Katch-McArdle -> %s   (Mifflin aurait donne %s)\n"
 "CONTEXTE MILO  « cette masse maigre est une ESTIMATION, pas une mesure :\n"
 "                 elle est calculee a partir d un %% de masse grasse\n"
 "                 qu il/elle a SAISI lui/elle-meme »                     <<< FAUX"
 % (NAVY, NAVY, NAVY, B['lm']['lm'], B['lm']['lm'], B['bmr'], A['bmr'])))
H.append(Spacer(1, 3))
H.append(P('[!!] <b>La provenance devient fausse a <font face="Courier">state.js</font>, entre l '
  'enregistrement et la relecture.</b>', 'p'))

H.append(P('5. Erreur SEMANTIQUE - reelle et prouvee', 'h1'))
H.append(P('Ce que Milo recoit, <b>mot pour mot</b>, mesure dans '
  '<font face="Courier">buildCoachContext</font> :', 'p'))
H.append(tableau(['Ce qui est stocke sur la ligne', 'La raison que Milo lit'],
 [["<font face=\"Courier\">bfSrc: 'estime'</font>", '<b>[X]</b> ' + R_EST],
  ["<font face=\"Courier\">bfSrc: 'mesure'</font>", '<b>[ok]</b> ' + R_MES],
  ['<font face="Courier">bfSrc</font> <b>absent</b>', '<b>[X]</b> ' + R_EST],
  ['bilan corporel (autre branche)', '<b>[ok]</b> ' + R_BIL]],
 [54 * mm, 114 * mm]))
H.append(Spacer(1, 3))
H.append(encadre('La nuance a ne pas ecraser',
  'Le bloc annonce <b>deja correctement</b> <i>&laquo; cette masse maigre est une ESTIMATION, pas '
  'une mesure &raquo;</i>. [*] Milo n est donc <b>pas</b> amene a croire a une mesure : il est '
  'amene a croire a la <b>mauvaise raison</b>. <i>C est un fait faux sur la personne - elle n a '
  'rien tape, l application a calcule a partir de ses centimetres - mais ce n est pas une mesure '
  'presentee comme telle.</i>', VERT))

H.append(P('6. Effet NUMERIQUE reel - zero', 'h1'))
H.append(P('Meme chiffre (%s %%), meme profil synthetique, <b>seul <font face="Courier">bfSrc</font> '
  'change</b> :' % NAVY, 'p'))
H.append(tableau(['Cas', 'bfSrc', 'BMR', 'Methode', 'TDEE', 'Cible', 'nature annoncee'],
 [['<b>B</b> estimation US Navy', "<font face=\"Courier\">estime</font>", '<b>%s</b>' % B['bmr'],
   B['methode'], '<b>%s</b>' % B['tdee'], '<b>%s</b>' % B['cible'], B['lm']['nature']],
  ['<b>C</b> meme %% tape a la main', "<font face=\"Courier\">mesure</font>", '<b>%s</b>' % C['bmr'],
   C['methode'], '<b>%s</b>' % C['tdee'], '<b>%s</b>' % C['cible'], C['lm']['nature']],
  ['<b>D</b> ancienne ligne', '<b>absent</b>', '<b>%s</b>' % D['bmr'], D['methode'],
   '<b>%s</b>' % D['tdee'], '<b>%s</b>' % D['cible'], D['lm']['nature']]],
 [44 * mm, 22 * mm, 18 * mm, 20 * mm, 18 * mm, 18 * mm, 28 * mm]))
H.append(Spacer(1, 3))
H.append(P('[!!] <b>B, C et D sont strictement indiscernables - en chiffres ET en texte.</b> '
  'L etiquette ne change aucun calcul : <b>l erreur est purement semantique</b>.', 'p'))
H.append(Spacer(1, 3))
H.append(encadre('Un fait numerique VOISIN, a ne pas confondre avec celui-ci',
  'La <b>presence</b> de l estimation fait basculer Mifflin -&gt; Katch-McArdle : '
  '<b>%s -&gt; %s kcal de BMR (%s), %s -&gt; %s de TDEE (%s), %s -&gt; %s de cible (%s)</b>. '
  '[*] [X] Mais cela <b>ne vient pas de la perte de provenance</b> : '
  '<font face="Courier">bmrDetail</font> n a jamais exige une mesure, et ft-v1231 a explicitement '
  'decide qu une estimation pouvait etre enregistree. <i>C est une consequence de conception, pas '
  'le defaut etudie.</i>'
  % (A['bmr'], B['bmr'], kfs(D_BMR), A['tdee'], B['tdee'], kfs(D_TDEE),
     A['cible'], B['cible'], kfs(D_CIBLE)), ORANGE))

H.append(P('7. Moteurs touches - seulement ce qui est prouve', 'h1'))
H.append(tableau(['Moteur', 'Touche par la PERTE DE PROVENANCE ?', 'Preuve'],
 [['<b>Texte envoye a Milo</b>', '<b>[ok] OUI - une phrase fausse</b>', 'sonde F, trois cas compares'],
  ['Choix Mifflin / Katch', '[X] non', "bfSrc n entre pas dans bmrDetail"],
  ['Valeur du BMR', '[X] non', 'B = C = D = %s' % B['bmr']],
  ['TDEE', '[X] non', 'B = C = D = %s' % B['tdee']],
  ['Cible calorique', '[X] non', 'B = C = D = %s' % B['cible']],
  ['Macros', '[X] non', 'elles derivent de la cible, identique'],
  ['Graphiques', '[X] non', 'la courbe lit <font face="Courier">w.bf</font>, pas <font face="Courier">nature</font>'],
  ['Affichage utilisateur', '[X] non', 'le toast et la carte <b>distinguent correctement</b>']],
 [40 * mm, 62 * mm, 66 * mm]))

H.append(P('8. Rayon et severite - reclassement', 'h1'))
H.append(tableau(['Classement', 'Annonce', 'Apres mesure', 'Justification'],
 [['Rayon', 'MULTI-MOTEUR', '<b>LOCAL</b>',
   'Une seule phrase, dans un seul bloc du contexte de Milo. <b>Aucun calcul, aucun ecran, aucun '
   'export n en depend</b> - refute par B = C = D.'],
  ['Severite', 'MAJEUR', '<b>MOYEN</b>',
   'Ce qui l empeche de descendre a MINEUR : c est un <b>fait faux sur la personne</b> envoye a '
   'Milo, qui peut le lui repeter. Ce qui l empeche de rester MAJEUR : <b>aucune decision, aucun '
   'chiffre, aucun conseil n en depend</b>, et le bloc annonce deja correctement « estimation ».']],
 [22 * mm, 26 * mm, 24 * mm, 96 * mm]))

H.append(P('9. Le cas bfSrc absent - intervient-il ici ?', 'h1'))
H.append(P('<b>Non, pas differemment.</b> <font face="Courier">leanMassRecente</font> ne lit '
  '<b>jamais</b> <font face="Courier">bfSrc</font> : son absence est donc <b>sans effet sur ce '
  'chemin</b>, et le cas D rend exactement B et C. [*] Le soupcon du rapport precedent - '
  '<i>&laquo; l absence est interpretee differemment selon les endroits &raquo;</i> - reste ouvert '
  '<b>ailleurs</b> : <font face="Courier">bfDerniere</font> et '
  '<font face="Courier">_bfRemplacableParEstime</font>, eux, le lisent. '
  '<b>POINT CONNEXE A VERIFIER PLUS TARD.</b>', 'p'))

H.append(P('10. Points connexes - notes, PAS suivis', 'h1'))
H.append(tableau(['Point connexe a verifier plus tard', 'Ancre'],
 [['<font face="Courier">tracking.js</font> ecrit <font face="Courier">bfSrc = BF_MESURE</font> pour '
   'un <b>bilan corporel</b>, alors qu une balance a impedance <b>estime</b> le %% (R32, ecrite dans '
   'ce depot). Meme famille, autre porte.', 'tracking.js:1990'],
  ['<font face="Courier">src:\'pesee\'</font> est annonce a Milo pour une valeur qui vient d un '
   '<b>ruban a mesurer</b>, pas d une balance.', 'state.js (leanMassRecente)'],
  ['L absence de <font face="Courier">bfSrc</font> est lue differemment par '
   '<font face="Courier">bfDerniere</font> et <font face="Courier">_bfRemplacableParEstime</font>.',
   'tracking.js:840 et :845']],
 [136 * mm, 32 * mm]))

H.append(P('11. Correction envisageable PLUS TARD - rien n est applique', 'h1'))
H.append(bloc_code(
 "// state.js — aujourd'hui\n"
 "cand.push({ ..., src:'pesee', nature:'saisie' });\n"
 "\n"
 "// ce qu'elle POURRAIT devenir\n"
 "cand.push({ ..., src:'pesee', nature: w.bfSrc === 'estime' ? 'estimee_navy'\n"
 "                                    : w.bfSrc === 'mesure' ? 'saisie'\n"
 "                                    : 'inconnue' });"))
H.append(Spacer(1, 3))
H.append(P('Avec la branche correspondante dans <font face="Courier">coach.js</font> : le ternaire y '
  'porte <b>%d</b> tests de <font face="Courier">nature</font>, il en faudrait deux de plus.' % N_NATURES, 'p'))
H.append(Spacer(1, 3))
H.append(encadre('La borne a ne pas franchir',
  '[X] <b>Ne pas inventer la provenance d une ligne ancienne.</b> '
  '<font face="Courier">\'inconnue\'</font> doit rester un <b>troisieme etat</b>, pas retomber sur '
  '<font face="Courier">\'saisie\'</font>. [*] C est mot pour mot la <b>regle d or #16</b>, et c est '
  'le piege que ft-v1231 et ft-v1227 ont deja paye : <i>on fabriquerait la provenance avec le '
  'mecanisme construit pour ne pas l inventer.</i>', ROUGE))

H.append(Spacer(1, 6))
H.append(encadre('Etat du depot, verifie par git a la generation',
  '<b>AUCUN FICHIER SERVI N EST MODIFIE</b> (%s). Aucun bump - le cache sert toujours <b>%s</b>. '
  'Aucune publication. [*] La sonde tourne sur un profil <b>SYNTHETIQUE</b> declare : aucune valeur '
  'de ce dossier ne peut etre attribuee a une personne reelle.'
  % (', '.join(SERVIS), VERSION), VERT))
H.append(Spacer(1, 5))
H.append(P('Genere par <font face="Courier">tools/gen_provenance_bf_pdf.py</font>. Ses <b>%d gardes</b> '
  'relisent chaque ancre dans le code servi et recomptent chaque chiffre depuis la sonde. '
  '[!!] Le garde central extrait <font face="Courier">leanMassRecente</font> de '
  '<font face="Courier">state.js</font> et <b>refuse de produire si elle lit '
  '<font face="Courier">bfSrc</font></b> - c est-a-dire si le defaut decrit etait corrige.' % NB, 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                        topMargin=17 * mm, bottomMargin=20 * mm,
                        title='La provenance de la masse grasse - Force Tracker (%s)' % VERSION,
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
if len(_lis) < 6000:
    os.remove(OUT); sys.exit('REFUS : le PDF relu ne fait que %d caracteres lisibles' % len(_lis))
for _m in ('reponse B', 'purement semantique', 'indiscernables', 'seul', 'SYNTHETIQUE',
           'AUCUN FICHIER SERVI', 'POINT CONNEXE', 'troisieme etat', 'aveugle'):
    if _m not in _lis:
        os.remove(OUT); sys.exit('REFUS : « %s » n est pas imprime dans le PDF' % _m)
print('   relu : %d caracteres lisibles sur %d pages, 0 flux manque' % (len(_lis), _np))
print('OK %s (%d gardes, %d octets)' % (OUT, NB, os.path.getsize(OUT)))
print('   diagnostic B : leanMassRecente ne lit pas bfSrc | B=C=D : %s / %s / %s kcal'
      % (B['bmr'], C['bmr'], D['bmr']))
