#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/SCANNER-CAMERA-LOCAL.pdf — l audit du scanner camera local avant reactivation.
   Vingt-troisieme document de la serie.

TOUS LES FAITS SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI ET DEPUIS LE BANC.
Un document qui affirme « le scanner n a pas de porte d entree » sans le remesurer affirme un
souvenir — et cette affirmation-la est exactement celle qui decide du chantier.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d emoji, entites nommees comprises.
"""
import html
import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether)


ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'SCANNER-CAMERA-LOCAL.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
IDX = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
SCR = open(os.path.join(ROOT, 'screens.js'), encoding='utf-8').read()
CST = open(os.path.join(ROOT, 'constants.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
RUN = open(os.path.join(ROOT, 'tests', 'parcours', 'runner.js'), encoding='utf-8').read()
DOC = open(os.path.join(ROOT, 'docs', 'SCANNER-CAMERA-LOCAL.md'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE ?= ?'(ft-v\d+)'", SW) or [None, '?'])[1]


def sans_com(t):
    t = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), t)
    return '\n'.join(l for l in t.split('\n') if not l.strip().startswith('//'))


CODE = sans_com(APP)


def corps(nom, src=None):
    s = src if src is not None else CODE
    m = re.search(r'(?:async )?function ' + nom + r'\([\s\S]*?\n\}', s)
    if not m:
        raise SystemExit('Corps introuvable : %s — le PDF decrit une fonction qui a disparu.' % nom)
    return m.group(0)


C_SCANNER = corps('openBarcodeScanner')
C_CAPTURE = corps('_bcCaptureFrame')
C_CLOSE = corps('closeBarcodeScanner')
C_ZXING = corps('_loadZXing')
C_HINTS = corps('_bcHints')
C_PHOTO = corps('scanBarcodePhoto')
C_FICHIER = corps('onBarcodeFile')
C_LOOKUP = corps('_lookupBarcode')
C_OFF = corps('_offFetchProduct')

# ── [!!] LE FAIT QUI DECIDE DU CHANTIER : la porte est-elle toujours muree ? ──────────────────
if re.search(r'scanBarcode\s*\(\s*\)', IDX) or 'openBarcodeScanner' in IDX:
    raise SystemExit('LE SCANNER A RETROUVE UNE PORTE D ENTREE : ce document raconte qu il n en a '
                     'pas, et son verdict dit « ne pas reactiver tout de suite ». Relire ft-v388, '
                     'ft-v871 et docs/SCANNER-CAMERA-LOCAL.md avant de republier.')
if 'scanBarcodeIA()' not in IDX:
    raise SystemExit('Le bouton de la photo lue par l IA a disparu de l ecran : le document le cite '
                     'comme le seul « scan » atteignable aujourd hui.')

# ── [!!] ZERO IA DANS LE CHEMIN LOCAL — l affirmation centrale ────────────────────────────────
for _n, _c in (('openBarcodeScanner', C_SCANNER), ('_bcCaptureFrame', C_CAPTURE),
               ('onBarcodeFile', C_FICHIER), ('_lookupBarcode', C_LOOKUP)):
    if re.search(r'_aiUrl|workers\.dev|estimateFoodAI|readBarcode', _c):
        raise SystemExit('UN APPEL IA S EST GLISSE DANS `%s` : tout le document affirme que le '
                         'chemin camera est 100 %% local.' % _n)

# ── [!!] LE DECODAGE EST LOCAL, ET LA BIBLIOTHEQUE VIENT DU DEPOT ─────────────────────────────
if "'./lib/zxing.min.js'" not in C_ZXING or re.search(r'https?:', C_ZXING):
    raise SystemExit('ZXing n est plus charge depuis le depot : un decodage « local » qui '
                     'telecharge sa bibliotheque ailleurs n est plus local.')
if not os.path.exists(os.path.join(ROOT, 'lib', 'zxing.min.js')):
    raise SystemExit('lib/zxing.min.js est absent du depot : le chemin local n existe plus.')
if re.search(r'fetch\(', C_SCANNER) or re.search(r'fetch\(', C_CAPTURE):
    raise SystemExit('Le scanner fait desormais un appel reseau de lui-meme : le document affirme '
                     'que seul le lookup produit parle au reseau.')

# ── [!!] LE POINT DE CONVERGENCE : les deux lecteurs passent par le lookup commun ─────────────
N_SCAN_LOOKUP = len(re.findall(r'_lookupBarcode\(', C_SCANNER))
N_CAP_LOOKUP = len(re.findall(r'_lookupBarcode\(', C_CAPTURE))
if N_SCAN_LOOKUP != 1 or N_CAP_LOOKUP != 1:
    raise SystemExit('Les deux lecteurs du scanner n appellent plus exactement une fois le lookup '
                     'commun (%d / %d) : c est ce qui rend la course possible, et le document la '
                     'decrit ainsi.' % (N_SCAN_LOOKUP, N_CAP_LOOKUP))
if '_offFetchProduct(' not in C_LOOKUP:
    raise SystemExit('Le lookup produit ne passe plus par son proprietaire : le document decrit un '
                     'point de convergence unique avec le code tape.')
if len(re.findall(r'https://world\.openfoodfacts\.org', C_OFF)) != 2:
    raise SystemExit('La recherche produit n interroge plus exactement deux URL Open Food Facts.')

# ── [!!] LA COURSE : mesuree, NON corrigee — c est une decision rendue a Michel ───────────────
_i = C_CAPTURE.find('await reader.decodeFromImageUrl')
if _i <= 0:
    raise SystemExit('La capture manuelle ne decode plus par `decodeFromImageUrl` : la course '
                     'decrite au paragraphe 2 a change de forme, remesurer.')
if re.search(r'_bcScanning\s*=\s*false', C_CAPTURE[:_i]):
    raise SystemExit('LA COURSE A ETE CORRIGEE : le document la presente comme un defaut CONNU et '
                     'NON corrige, et son paragraphe 7 la met dans ce qui reste a faire. Mettre le '
                     'document a jour avant de republier.')
if not re.search(r'_bcScanning\s*=\s*false', C_CAPTURE[_i:]):
    raise SystemExit('Le desarmement du decodage continu a disparu de la capture : remesurer.')

# ── [!!] LES TROIS DEFAUTS DECRITS EXISTENT ENCORE (sinon le paragraphe 2 ment) ───────────────
if 'af-bc-input' not in C_PHOTO:
    raise SystemExit('`scanBarcodePhoto` ne cherche plus `af-bc-input` : le defaut n2 du document '
                     'a ete repare, mettre le document a jour.')
if 'id="af-bc-input"' in IDX:
    raise SystemExit('L element `af-bc-input` est revenu dans l ecran : le bouton de repli n est '
                     'plus mort, le document le dit pourtant.')
if "'photo-code'" not in C_FICHIER:
    raise SystemExit('`onBarcodeFile` ne pose plus la provenance `photo-code` : le document la cite '
                     'comme le seul chemin photo sans IA.')
if len(re.findall(r'onBarcodeFile\(', APP)) != 1 or 'onBarcodeFile' in IDX:
    raise SystemExit('`onBarcodeFile` n est plus orphelin : le document affirme que rien ne '
                     'l appelle.')
if re.search(r"_lookupBarcode\(code\s*,", C_SCANNER) or re.search(r"_lookupBarcode\(code\s*,", C_CAPTURE):
    raise SystemExit('Le scanner dit desormais sa provenance explicitement : le defaut n4 du '
                     'document a ete corrige, mettre le document a jour.')

# ── [!!] LA PROVENANCE : quatre chemins distincts, et la valeur par defaut ────────────────────
for _p in ("'scan'", "'photo-code'", "'photo-code-ia'", "'code-tape'"):
    if _p not in APP:
        raise SystemExit('La provenance %s a disparu : le paragraphe 5 decrit quatre chemins '
                         'distincts.' % _p)
if "saisie||'scan'" not in CODE:
    raise SystemExit('La provenance par defaut du lookup n est plus `scan` : le paragraphe 5 '
                     'explique que le scanner compte dessus.')

# ── [!!] LE CYCLE DE VIE DE LA CAMERA (les correctifs ft-v1091/1092 tiennent) ─────────────────
if 'stopStreams' not in C_CLOSE or '.reset()' not in C_CLOSE:
    raise SystemExit('La fermeture du scanner ne coupe plus le flux : *une fuite qui ne se voit '
                     'que sur le telephone de quelqu un*.')
if "'ov-bc-scan':'closeBarcodeScanner'" not in SCR:
    raise SystemExit('L ecran du scanner est sorti de la table de fermeture : glisser ou le bouton '
                     'retour laisserait la camera allumee (ft-v1091/1092).')

# ── [!!] LES REGLAGES DU DECODEUR, mesures utiles le 14/09 ────────────────────────────────────
if 'TRY_HARDER' not in C_HINTS:
    raise SystemExit('TRY_HARDER a disparu : mesure du 14/09, sans lui un code vu en paysage n est '
                     'plus lu du tout (0/3).')
_FORMATS = ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E']
for _f in _FORMATS:
    if _f not in C_HINTS:
        raise SystemExit('Le format %s a disparu des reglages du decodeur.' % _f)

# ── [!!] LES CONTRAINTES CAMERA (le correctif ft-v378) ────────────────────────────────────────
if 'environment' not in C_SCANNER or '1920' not in C_SCANNER:
    raise SystemExit('Les contraintes camera ont change : sans objectif arriere ni haute '
                     'resolution, c est « camera ouverte mais ne lit pas » (ft-v378).')
if 'focusMode' not in C_SCANNER:
    raise SystemExit('La demande de mise au point continue a disparu : c est le reglage qui vise '
                     'le defaut le plus probable du retrait (cause E).')

# ── [!!] LE BANC : le bloc CCCVIII existe, il conduit une VRAIE camera ────────────────────────
N_CCCVIII = len(re.findall(r"t\('CCCVIII ", RUN))
if N_CCCVIII != 19:
    raise SystemExit('Le bloc CCCVIII porte %d temoins, pas 19 : le document cite ce chiffre.'
                     % N_CCCVIII)
for _a in ('--use-fake-device-for-media-stream', '--use-file-for-fake-video-capture',
           'YUV4MPEG2'):
    if _a not in RUN:
        raise SystemExit('Le banc ne conduit plus une vraie camera (%s manquant) : sans elle il '
                         'n eprouve que le DECODEUR, et la question porte sur la CHAINE.' % _a)
if '3083681011791' not in RUN:
    raise SystemExit('Le banc n emploie plus un code-barres reel : une fixture inventee ne prouve '
                     'rien sur un vrai produit.')
# [/!\] La zone de silence se compte en MODULES — l erreur de fixture du 14/09, figee ici pour
#       qu elle ne revienne pas : une marge en pixels fait echouer les codes vus de pres.
if not re.search(r'm\.length\+24', RUN):
    raise SystemExit('La zone de silence du generateur de code-barres n est plus exprimee en '
                     'MODULES : c est l erreur de fixture du 14/09, elle ferait conclure a tort '
                     '« code vu de pres = illisible ».')

# ── [!!] LE DOCUMENT LUI-MEME porte son verdict et ses limites ────────────────────────────────
# [/!\] Les gardes du document comparent SANS accent ni apostrophe : le document est ecrit en
#       francais accentue, le generateur en ASCII. Un garde qui ne normalise pas se tait pour la
#       mauvaise raison — mesure le 14/09, il a d abord refuse un verdict pourtant present.
_ACC = str.maketrans('àâäéèêëîïôöùûüç', 'aaaeeeeiioouuuc')


def _plat(t):
    return t.lower().translate(_ACC).replace('’', "'").replace('‘', "'")


DOC_PLAT = _plat(DOC)
if 'reactiver avec fallback ia' not in DOC_PLAT:
    raise SystemExit('Le document a perdu son verdict : c est ce que Michel a demande en sortie.')
for _s in ('2 h 37', 'ft-v377', 'ft-v378', 'ft-v388', 'zone de silence'):
    if _plat(_s) not in DOC_PLAT:
        raise SystemExit('Le document a perdu un fait de son enquete : %s' % _s)
if "n'est pas mesuree" not in DOC_PLAT and "n'est pas mesure" not in DOC_PLAT:
    raise SystemExit('Le document ne dit plus que la fiabilite iPhone N EST PAS mesuree d ici : '
                     'c est la limite la plus importante a ne pas taire.')
for _s in ('protocole iphone', 'ne pas reactiver', 'course'):
    if _s not in DOC_PLAT:
        raise SystemExit('Le document a perdu une section attendue : %s' % _s)

N_GARDES = len(re.findall(r'raise SystemExit', open(os.path.abspath(__file__),
                                                    encoding='utf-8').read()))

# ═══ RENDU ════════════════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
VERT = colors.HexColor('#1E7A4B')

ss = getSampleStyleSheet()
S = {
    'titre': ParagraphStyle('t', parent=ss['Title'], fontName='Helvetica-Bold', fontSize=19,
                            leading=23, textColor=ENCRE, alignment=0, spaceAfter=2),
    'sous': ParagraphStyle('s', parent=ss['Normal'], fontName='Helvetica', fontSize=9.5,
                           leading=13, textColor=GRIS, spaceAfter=10),
    'h': ParagraphStyle('h', parent=ss['Normal'], fontName='Helvetica-Bold', fontSize=12,
                        leading=15, textColor=ROUGE, spaceBefore=12, spaceAfter=5),
    'p': ParagraphStyle('p', parent=ss['Normal'], fontName='Helvetica', fontSize=9.5,
                        leading=13.5, textColor=ENCRE, spaceAfter=6),
    'petit': ParagraphStyle('pt', parent=ss['Normal'], fontName='Helvetica-Oblique', fontSize=8,
                            leading=11, textColor=GRIS, spaceAfter=4),
    'cell': ParagraphStyle('c', parent=ss['Normal'], fontName='Helvetica', fontSize=8.3,
                           leading=11, textColor=ENCRE),
    'cellb': ParagraphStyle('cb', parent=ss['Normal'], fontName='Helvetica-Bold', fontSize=8.3,
                            leading=11, textColor=ENCRE),
}

def _v(txt):
    """Refuse tout caractere que WinAnsi/cp1252 ne sait pas coder — la police du PDF ne le
    dessinerait pas, et un carre noir dans un document destine a etre partage passe inapercu a
    la relecture.
    [/!\\] MESURE DU 14/09 : ma premiere version testait la plage latin-1 (`[^\\x00-\\xff]`) et
    refusait donc le tiret cadratin, que cp1252 code pourtant en 0x97. *Un controle plus strict
    que la contrainte reelle refuse du travail juste* — il encode vraiment, au lieu de deviner."""
    nu = html.unescape(re.sub(r'<[^>]+>', '', txt))
    for i, ch in enumerate(nu):
        try:
            ch.encode('cp1252')
        except UnicodeEncodeError:
            raise SystemExit('CARACTERE HORS cp1252 dans le PDF : %r (contexte : %r)'
                             % (ch, nu[max(0, i - 30):i + 30]))
    return txt


def P(txt, st='p'):
    return Paragraph(_v(txt), S[st])


def T(lignes, largeurs, entete=True):
    data = [[Paragraph(_v(c), S['cellb' if (entete and i == 0) else 'cell']) for c in ln]
            for i, ln in enumerate(lignes)]
    t = Table(data, colWidths=largeurs)
    st = [('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#D8D8D4')),
          ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
          ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]
    if entete:
        st.append(('BACKGROUND', (0, 0), (-1, 0), FOND))
    t.setStyle(TableStyle(st))
    return t


H = []
H.append(P('Le scanner camera local', 'titre'))
H.append(P('Audit avant reactivation &mdash; 14/09/2026 &middot; Force Tracker %s &middot; '
           '%d gardes recomptent ce document depuis le code servi et refusent de le produire si '
           'un fait tombe.' % (VERSION, N_GARDES), 'sous'))

H.append(P('Ce que Michel a demande', 'h'))
H.append(P('<i>&laquo; Lire un code-barres sans appel IA, puis utiliser exactement le meme lookup '
           'Open Food Facts que le code tape. &raquo;</i> Et la borne qui decide de tout : '
           '<b>&laquo; je ne veux PAS reactiver aveuglement un ancien bouton juge peu fiable. Je '
           'veux comprendre exactement pourquoi il avait ete retire et mesurer si ce probleme '
           'existe encore &raquo;</b>.', 'p'))
H.append(P('<b>Rien n a ete reactive.</b> Aucun fichier servi n est modifie ; le bouton reste '
           'mure tant que Michel n a pas tranche.', 'p'))

H.append(P('1. Pourquoi il avait ete retire &mdash; la chronologie, lue dans git', 'h'))
H.append(T([
    ['heure (11/07/2026)', 'version', 'ce qui s est passe'],
    ['14:33', 'ft-v376', '<b>le scanner camera live est cree</b> (ZXing continu, objectif arriere, '
                         'EAN/UPC, TRY_HARDER)'],
    ['15:29', 'ft-v377', '<b>la recherche produit etait CASSEE</b> : <i>&laquo; v2 renvoie '
                         "<i>success</i> pas 1 &mdash; tout etait rejete introuvable &raquo;</i>"],
    ['15:40', 'ft-v378', 'correctif <i>&laquo; camera ouverte mais ne lit pas &raquo;</i> : 1080p, '
                         'bouton Capturer, mise au point continue'],
    ['16:57', 'ft-v384', 'saisie manuelle ajoutee &mdash; <i>&laquo; repli quand le scan galere &raquo;</i>'],
    ['<b>17:10</b>', '&mdash;', '<b>retrait</b> : <i>&laquo; trop capricieux iPhone &raquo;</i>'],
], [26 * mm, 20 * mm, 119 * mm]))
H.append(P('<b>Trois faits que cette chronologie donne.</b> <b>(1)</b> Le scanner live a vecu '
           '<b>2 h 37</b>. <b>(2)</b> Pendant environ une heure de ces 2 h 37, la recherche produit '
           'rejetait <b>TOUS</b> les produits &mdash; un code parfaitement decode affichait donc '
           '<i>&laquo; produit introuvable &raquo;</i>, ce qui ressemble trait pour trait a un '
           'scanner qui ne marche pas. <b>(3)</b> Le retrait n a tente <b>aucune</b> correction : '
           'le commit touche <b>index.html seulement, 6 lignes</b>.', 'p'))
H.append(P('<b>Ce que la chronologie ne permet PAS de conclure.</b> Elle ne blanchit pas le '
           'scanner : le correctif ft-v378 nomme un vrai symptome iPhone, et 1 h 17 plus tard le '
           'message de ft-v384 parle encore d un <i>scan qui galere</i>. Un probleme iPhone reel '
           'persistait apres le correctif.', 'p'))

H.append(P('2. La fiabilite du decodeur, mesuree', 'h'))
H.append(P('Trois vrais codes-barres encodes en EAN-13 selon la norme, degrades, decodes par le '
           'ZXing <b>reellement servi</b>. <b>17 cas sur 20 passent a 3/3.</b>', 'p'))
H.append(T([
    ['ce qui passe', 'ce qui ne passe pas'],
    ['net &middot; code petit ou eloigne &middot; code vu de pres &middot; incline 5 a 20 degres '
     '&middot; incline 90 degres &middot; flou 1 px &middot; faible lumiere (25 %) &middot; '
     'contraste ecrase &middot; reflet metal (voile 75 %) &middot; cumul realiste',
     '<b>incline 45 degres</b><br/><b>flou des 2 px</b><br/>reflet quasi opaque (90 %)'],
], [105 * mm, 60 * mm]))
H.append(P('<b>Le flou est le seul vrai ennemi, et brutalement : 1 px passe, 2 px ne passe plus.</b> '
           'La lumiere ne gene pas, le contraste non plus, l inclinaison jusqu a 20 degres non plus. '
           '<b>Sur un telephone, &laquo; flou &raquo; s appelle &laquo; mise au point &raquo;</b> '
           '&mdash; c est exactement le symptome de ft-v378, et cela designe la cause la plus '
           'probable du retrait.', 'p'))
H.append(P('<b>Une erreur de mesure, dite plutot que cachee.</b> Ma premiere passe concluait '
           '<i>&laquo; code vu de pres : 0/3 &raquo;</i>. C etait ma fixture : je laissais une marge '
           'blanche de <b>20 pixels</b> alors que la norme EAN-13 exige une zone de silence de '
           '<b>9 a 11 MODULES</b>. A 8 px par module, 20 px ne valent que 2,5 modules. Corrige : '
           '<b>3/3</b>. <i>Un parametre exprime dans la mauvaise unite ne mesure pas le code, il '
           'mesure le test.</i>', 'p'))

H.append(P('3. Le chemin reseau, mesure devant une camera', 'h'))
H.append(P('Le banc lance un second navigateur avec une <b>camera factice</b> qui filme un vrai '
           'EAN-13, et <b>fetch</b> est intercepte et classe par domaine. Sans elle, on n eprouve '
           'que le DECODEUR ; or la question porte sur la CHAINE.', 'p'))
H.append(T([
    ['', 'scanner camera', 'code tape', 'photo IA'],
    ['appels IA', '<b>0</b>', '0', '1'],
    ['quota des 25 essais', '<b>inchange</b>', 'inchange', '<b>+1</b>'],
    ['lookups Open Food Facts', '1 ou 2 (la course)', '1', '1'],
    ['provenance', 'scan', 'code-tape', 'photo-code-ia'],
    ['resultat produit', '<b>identique</b>', 'identique', 'identique'],
], [45 * mm, 42 * mm, 34 * mm, 34 * mm]))
H.append(P('<b>Le point le plus important est acquis : le scanner ne cree aucun chemin nutrition '
           'nouveau.</b> Il appelle le meme lookup que la saisie manuelle ; le resolveur, la douane '
           'et le journal ne voient aucune difference. Sur un code illisible : <b>0 lookup, 0 appel '
           'IA</b>, un message qui dit quoi faire, et la camera reste ouverte pour reessayer.', 'p'))

H.append(P('4. Les quatre defauts trouves dans le code orphelin', 'h'))
H.append(T([
    ['#', 'defaut', 'etat'],
    ['1', '<b>La course</b> : le decodage continu et le bouton Capturer peuvent lire le meme code a '
          '28 ms d intervalle et tirer chacun son lookup. Cause structurelle : la capture ne desarme '
          'le continu qu APRES son await de decodage.', 'mesure, <b>non corrige</b>'],
    ['2', 'Le bouton de repli photo cherche un element retire avec ft-v388 : il ne fait rien.',
          'mesure, <b>non corrige</b>'],
    ['3', 'Le decodage LOCAL d une photo (le seul chemin photo sans IA) est orphelin lui aussi.',
          'mesure, <b>non corrige</b>'],
    ['4', 'Le scanner ne dit pas sa provenance explicitement ; la valeur par defaut rattrape.',
          'mesure, <b>non corrige</b>'],
], [8 * mm, 112 * mm, 45 * mm]))
H.append(P('<b>La course est INTERMITTENTE, et cela a d abord produit un mauvais temoin &mdash; le '
           'mien.</b> Selon qui gagne, on observe 1 ou 2 lookups ; ma premiere version comptait '
           '&laquo; exactement 2 &raquo; et passait au rouge des que la machine etait moins chargee. '
           '<b>Un temoin qui depend du vainqueur d une course ne mesure pas la course, il mesure la '
           'charge de la machine.</b> C est un temoin de SOURCE qui la fige.', 'p'))

H.append(P('5. L UX proposee &mdash; local d abord, IA en secours', 'h'))
H.append(P('L ecran d ajout gagne <b>un seul</b> bouton (&laquo; scanner avec la camera &raquo;), et '
           'le repli IA apparait <b>dans l ecran du scanner, apres un echec</b> &mdash; la ou la '
           'personne est bloquee, pas dans une liste de boutons qu elle doit trier a l avance. '
           '<i>Le seul moment ou l on sait qu il faut l IA, c est apres un echec.</i>', 'p'))
H.append(P('<b>Ce qu il ne faut pas faire : le basculement automatique.</b> Enchainer sur l IA apres '
           'N echecs serait un appel payant declenche sans geste &mdash; le quota se viderait sans '
           'que la personne l ait demande, et <b>un code flou restera flou</b> : on paierait un appel '
           'pour echouer deux fois. <b>Le repli doit rester un bouton.</b>', 'p'))

H.append(P('6. Le verdict : REACTIVER AVEC FALLBACK IA', 'h'))
H.append(T([
    ['ce qui plaide pour', 'ce qui empeche de le faire tout de suite'],
    ['le decodeur passe <b>17 cas sur 20</b><br/>'
     '<b>zero appel IA</b>, aucun quota touche<br/>'
     'le <b>meme lookup</b> que le code tape<br/>'
     'une des deux causes du retrait est <b>deja reparee</b><br/>'
     'deux correctifs de cycle de vie depuis (ft-v1091/1092)<br/>'
     'le bouton <b>Capturer marche du premier coup</b>',
     'la <b>course</b> doit etre corrigee<br/>'
     'le <b>bouton de repli mort</b> doit etre repare ou retire<br/>'
     'le <b>repli IA contextuel</b> doit etre ecrit<br/>'
     '<b>la cause Safari/iPhone n est pas mesurable d ici</b>'],
], [82 * mm, 83 * mm]))
H.append(P('<b>Pourquoi pas &laquo; ne pas reactiver &raquo; :</b> la mesure ne soutient pas le '
           'jugement de juillet. Le decodeur n est pas mauvais, et la fenetre sur laquelle il a ete '
           'juge durait 2 h 37 et contenait une panne de lookup qui faisait echouer tous les '
           'produits. <b>Pourquoi pas &laquo; reactiver &raquo; tout court :</b> le flou casse tout '
           'des 2 px, et le flou sur un telephone s appelle la mise au point.', 'p'))

H.append(P('7. Ce que je ne peux pas prouver d ici', 'h'))
H.append(P('<b>Ce conteneur n a ni camera ni Safari.</b> La fiabilite mobile <b>n est pas mesuree</b>, '
           'et je ne la presente pas comme telle. Le document porte un protocole iPhone en cinq '
           'produits et cinq gestes, a executer par Michel une fois le bouton rebranche. '
           '<i>Le vrai critere final reste l iPhone, et il n est pas encore passe.</i>', 'p'))

H.append(Spacer(1, 8))
H.append(P('Mesures figees par le bloc CCCVIII de tests/parcours/runner.js (%d temoins), conduit '
           'devant une camera factice qui filme un vrai EAN-13. Ce PDF est produit par '
           'tools/gen_scanner_pdf.py : ses %d gardes recomptent chaque fait depuis le code servi et '
           'refusent de produire si l un d eux tombe &mdash; y compris si le scanner retrouve une '
           'porte d entree, si la course est corrigee, ou si le banc cesse de conduire une vraie '
           'camera.' % (N_CCCVIII, N_GARDES), 'petit'))

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=22 * mm, rightMargin=22 * mm,
                  topMargin=18 * mm, bottomMargin=16 * mm,
                  title='Le scanner camera local - audit avant reactivation',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d temoins CCCVIII, %d gardes)' % (OUT, VERSION, N_CCCVIII, N_GARDES))
