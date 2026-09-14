#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere docs/SCANNER-CAMERA-LOCAL.pdf — la reactivation controlee du scanner camera local,
   et la CONTRE-ENQUETE sur la chronologie de juillet. Vingt-quatrieme document de la serie.

TOUS LES FAITS SONT RECOMPTES A CHAQUE GENERATION, DEPUIS LE CODE SERVI ET DEPUIS LE BANC.
Et les gardes les plus utiles protegent des DECISIONS : que la course reste fermee, que le repli
IA reste volontaire, que le numero lu reste montre avant la recherche, et que le verdict ne monte
pas d un cran sans le retour iPhone de Michel.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d emoji, entites nommees comprises.
"""
import html
import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or os.path.join(ROOT, 'docs', 'SCANNER-CAMERA-LOCAL.pdf')

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
IDX = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
SCR = open(os.path.join(ROOT, 'screens.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
RUN = open(os.path.join(ROOT, 'tests', 'parcours', 'runner.js'), encoding='utf-8').read()
DOC = open(os.path.join(ROOT, 'docs', 'SCANNER-CAMERA-LOCAL.md'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE ?= ?'(ft-v\d+)'", SW) or [None, '?'])[1]


def sans_com(t):
    t = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), t)
    return '\n'.join(l for l in t.split('\n') if not l.strip().startswith('//'))


CODE = sans_com(APP)


def corps(nom):
    m = re.search(r'(?:async )?function ' + nom + r'\([\s\S]*?\n\}', CODE)
    if not m:
        raise SystemExit('Corps introuvable : %s — le PDF decrit une fonction qui a disparu.' % nom)
    return m.group(0)


C_SCAN = corps('openBarcodeScanner')
C_CAPT = corps('_bcCaptureFrame')
C_TRAI = corps('_bcTraiterCode')
C_PREN = corps('_bcPrendreLaMain')
C_CLOS = corps('closeBarcodeScanner')
C_ZX = corps('_loadZXing')
C_HINT = corps('_bcHints')
C_IA = corps('_bcReplIA')
C_LOOK = corps('_lookupBarcode')
C_OFF = corps('_offFetchProduct')

# ═══ [!!] LE VERROU — la garantie centrale du chantier ════════════════════════════════════════
if "_bcEtat!=='SCANNING'" not in C_PREN:
    raise SystemExit('LE VERROU A CHANGE : `_bcPrendreLaMain` ne refuse plus hors de l etat '
                     'SCANNING. Toute la garantie « un code = au plus un lookup » repose dessus.')
for _e in ('IDLE', 'SCANNING', 'CODE_TROUVE', 'LOOKUP', 'TERMINE'):
    if "'%s'" % _e not in CODE:
        raise SystemExit('L etat %s a disparu de la machine a etats : le document la decrit en '
                         'cinq etats nommes.' % _e)
if re.search(r'\b_bcScanning\b', CODE):
    raise SystemExit('LE BOOLEEN `_bcScanning` EST REVENU : c est lui qui portait la course '
                     '(pose par DEUX lecteurs). Le document raconte qu il a ete remplace par un '
                     'seul proprietaire d etat.')
# [/!\] LES DEUX LECTEURS PASSENT PAR LE VERROU, ET AUCUN N APPELLE LE LOOKUP EN DIRECT.
for _n, _c in (('openBarcodeScanner', C_SCAN), ('_bcCaptureFrame', C_CAPT)):
    if '_lookupBarcode(' in _c:
        raise SystemExit('`%s` appelle le lookup EN DIRECT : il contourne le verrou, et la course '
                         'que ce document declare fermee est rouverte.' % _n)
    if '_bcTraiterCode(' not in _c:
        raise SystemExit('`%s` ne passe plus par `_bcTraiterCode` : le verrou n a plus qu un seul '
                         'lecteur, donc il ne verrouille plus rien.' % _n)
if len(re.findall(r"_lookupBarcode\(code,\s*'camera-code-local'\)", CODE)) != 1:
    raise SystemExit('Le lookup du scanner n est plus appele exactement une fois avec sa '
                     'provenance explicite : le document affirme un seul point de passage.')

# ═══ [!!] ZERO IA DANS LE CHEMIN LOCAL, ET AUCUN DECLENCHEMENT AUTOMATIQUE ════════════════════
for _n, _c in (('openBarcodeScanner', C_SCAN), ('_bcCaptureFrame', C_CAPT),
               ('_bcTraiterCode', C_TRAI), ('_lookupBarcode', C_LOOK)):
    if re.search(r'_aiUrl|workers\.dev|estimateFoodAI|readBarcode', _c):
        raise SystemExit('UN APPEL IA S EST GLISSE DANS `%s` : tout le document affirme que le '
                         'chemin camera est 100 %% local.' % _n)
for _n, _c in (('openBarcodeScanner', C_SCAN), ('_bcCaptureFrame', C_CAPT)):
    if re.search(r'setTimeout[\s\S]{0,80}(scanBarcodeIA|_aiUrl|_bcReplIA)', _c):
        raise SystemExit('UN DECLENCHEMENT AUTOMATIQUE DE L IA est apparu dans `%s` : Michel a '
                         'ecrit qu un appel payant doit necessiter un geste utilisateur.' % _n)
if 'onclick="_bcReplIA()"' not in C_SCAN:
    raise SystemExit('Le repli IA n est plus un bouton de l ecran du scanner : le document le '
                     'presente comme le SEUL chemin vers l IA, et volontaire.')
if 'scanBarcodeIA' not in C_IA or C_IA.index('closeBarcodeScanner()') > C_IA.index('scanBarcodeIA'):
    raise SystemExit('Le repli IA ne coupe plus la camera AVANT de passer la main : un flux video '
                     'tournerait derriere le selecteur de photo.')

# ═══ [!!] §16 — LE NUMERO LU EST MONTRE AVANT LA RECHERCHE ════════════════════════════════════
_iC, _iL = C_TRAI.find('af-bc-manual'), C_TRAI.find('_lookupBarcode(')
if _iC < 0 or _iL < 0 or _iC > _iL or 'Code lu' not in C_TRAI:
    raise SystemExit('LE NUMERO LU N EST PLUS MONTRE AVANT LA RECHERCHE : c est le §16 de Michel, '
                     'et c est ce qui empeche « je n ai pas lu le code » de se confondre avec '
                     '« la base ne connait pas le produit ». L erreur de juillet redevient possible.')

# ═══ [!!] LA PORTE EST ROUVERTE, ET LE SCANNER PASSE EN PREMIER (R24) ═════════════════════════
if 'onclick="scanBarcode()"' not in IDX:
    raise SystemExit('Le bouton du scanner a disparu de l ecran : ce document raconte une '
                     'reactivation controlee.')
if IDX.index('scanBarcode()') > IDX.index('scanBarcodeIA()'):
    raise SystemExit('Le scanner local ne passe plus AVANT la photo IA : la porte d entree par '
                     'defaut redevient celle qui coute (R24).')

# ═══ [!!] AUCUN BOUTON MORT — les trois orphelines sont parties, avec leur raison ═════════════
for _f in ('scanBarcodePhoto', '_bcPhotoFallback', 'onBarcodeFile'):
    if re.search(r'function ' + _f + r'\(', CODE):
        raise SystemExit('`%s` est revenue : elle etait orpheline depuis ft-v388, et Michel a '
                         'ecrit « je ne veux aucun bouton mort ».' % _f)
if "getElementById('af-bc-input')" in CODE or 'id="af-bc-input"' in IDX:
    raise SystemExit('L element `af-bc-input` est revenu : c est le bouton mort de ft-v388.')
if 'RETIRÉS EN ft-v1209' not in APP or 'onBarcodeFile` RETIRÉE en ft-v1209' not in APP:
    raise SystemExit('Le retrait des orphelines n est plus ECRIT avec sa raison (R30) : sans ca, '
                     'le suivant « repare » une decision.')

# ═══ [!!] LE SCANNER N A AUCUNE LOGIQUE NUTRITIONNELLE ════════════════════════════════════════
_TOUT = C_TRAI + C_CAPT + C_SCAN
if re.search(r'_ref100|_resoudreNutrition|_douaneLigne|S\.foodLog|savedFoods|_provFood|kcal100', _TOUT):
    raise SystemExit('LE SCANNER S EST MIS A FAIRE DE LA NUTRITION : Michel a ecrit qu il ne doit '
                     'fournir qu un EAN et appeler le chemin existant.')
if '_offFetchProduct(' not in C_LOOK:
    raise SystemExit('Le lookup produit ne passe plus par son proprietaire.')
if len(re.findall(r'https://world\.openfoodfacts\.org', C_OFF)) != 2:
    raise SystemExit('La recherche produit n interroge plus exactement deux URL Open Food Facts.')

# ═══ [!!] LE DECODAGE RESTE LOCAL, ET SES REGLAGES SONT CEUX QU ON A MESURES ══════════════════
if "'./lib/zxing.min.js'" not in C_ZX or re.search(r'https?:', C_ZX):
    raise SystemExit('ZXing n est plus charge depuis le depot : un decodage « local » qui '
                     'telecharge sa bibliotheque ailleurs n est plus local.')
if not os.path.exists(os.path.join(ROOT, 'lib', 'zxing.min.js')):
    raise SystemExit('lib/zxing.min.js est absent du depot.')
if 'TRY_HARDER' not in C_HINT:
    raise SystemExit('TRY_HARDER a disparu : mesure du 14/09, sans lui un code vu en paysage n est '
                     'plus lu du tout.')
_FMT = ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E']
for _f in _FMT:
    if _f not in C_HINT:
        raise SystemExit('Le format %s a disparu des reglages.' % _f)
if len(re.findall(r'ZXing\.BarcodeFormat\.', C_HINT)) != len(_FMT):
    raise SystemExit('La liste des formats n en compte plus exactement %d : le document justifie '
                     'ce chiffre par une mesure (elle divise par 3 le cout d un echec).' % len(_FMT))
# [/!\] LA CAMERA EST COUPEE PAR DEUX CHEMINS — le lecteur ET la balise video.
if 'stopStreams' not in C_CLOS or '.reset()' not in C_CLOS:
    raise SystemExit('La fermeture ne coupe plus le lecteur ZXing.')
if not re.search(r'srcObject[\s\S]{0,160}getTracks\(\)[\s\S]{0,90}\.stop\(\)', C_CLOS):
    raise SystemExit('La fermeture ne coupe plus les pistes portees par la balise video : si le '
                     'lecteur a ete remplace, la camera reste allumee.')
if not re.search(r"_bcEtat==='SCANNING'\)\s*_bcSetEtat\('IDLE'\)", C_CLOS):
    raise SystemExit('La fermeture ECRASE desormais un traitement en cours : elle rouvrirait la '
                     'porte au second lecteur, c est-a-dire la course qu on vient de fermer.')
if "'ov-bc-scan':'closeBarcodeScanner'" not in SCR:
    raise SystemExit('L ecran du scanner est sorti de la table de fermeture (ft-v1091/1092).')

# ═══ [!!] LE BANC : deux blocs, et il conduit une VRAIE camera ════════════════════════════════
N_VIII = len(re.findall(r"t\('CCCVIII ", RUN))
N_IX = len(re.findall(r"t\('CCCIX ", RUN))
if N_VIII != 19 or N_IX != 12:
    raise SystemExit('Les blocs du banc portent %d et %d temoins, pas 19 et 12 : le document cite '
                     'ces chiffres.' % (N_VIII, N_IX))
for _a in ('--use-fake-device-for-media-stream', '--use-file-for-fake-video-capture', 'YUV4MPEG2'):
    if _a not in RUN:
        raise SystemExit('Le banc ne conduit plus une vraie camera (%s manquant) : sans elle il '
                         'n eprouve que le DECODEUR, et la question porte sur la CHAINE.' % _a)
if '3083681011791' not in RUN:
    raise SystemExit('Le banc n emploie plus un code-barres reel.')
if not re.search(r'm\.length\+24', RUN):
    raise SystemExit('La zone de silence du generateur de code-barres n est plus exprimee en '
                     'MODULES : c est l erreur de fixture du 14/09, elle ferait conclure a tort '
                     '« code vu de pres = illisible ».')
# [/!\] LA COURSE DOIT ETRE PROVOQUEE, PAS ATTENDUE — sinon le temoin mesure la chance.
# [/!\] LE PIEGE DE LA SOUS-CHAINE, REPOSE PAR MOI : « o.marteau » est contenu dans
#       « o.marteauX ». Mesure du 14/09 : renommer le drapeau laissait ce garde parfaitement vert.
#       C'est la famille de `presentsX` (ft-v1207). On epingle donc les DEUX usages reels — la
#       condition de boucle et l'arret avant lecture du statut — avec leur ponctuation.
if ('_bcCaptureFrame()' not in RUN or 'o.marteau=true;' not in RUN
        or 'o.marteau=false;' not in RUN or '&& o.marteau;' not in RUN):
    raise SystemExit('Le banc ne PROVOQUE plus la course (il ne martele plus « Capturer », ou il '
                     'ne s arrete plus avant de lire le statut) : un temoin qui ATTEND la course '
                     'mesure la charge de la machine, pas la course.')

# ═══ [!!] LE DOCUMENT : sa chronologie corrigee, ses limites, et son verdict ═══════════════════
_ACC = str.maketrans('àâäéèêëîïôöùûüç', 'aaaeeeeiioouuuc')


def _plat(t):
    return t.lower().translate(_ACC).replace('’', "'").replace('‘', "'")


DOC_PLAT = _plat(DOC)
if 'pret pour test iphone' not in DOC_PLAT:
    raise SystemExit('Le document a perdu son verdict : Michel a demande PRET POUR TEST IPHONE, '
                     'et rien de plus fort.')
# [/!\] CE GARDE CHERCHE UNE AFFIRMATION, PAS UN MOT — et sa premiere version ne le faisait pas.
#       Mesure du 14/09 : il refusait le document parce que la CITATION DE MICHEL y figure
#       (« ne declare pas le scanner definitivement reactive »). *Un garde qui ne voit pas la
#       negation refuse exactement la phrase qui dit de ne pas le faire.* On exige donc qu un
#       « ne ... pas » precede chaque occurrence, dans les 60 caracteres qui la precedent.
for _interdit in ('definitivement reactive', 'reactive definitivement', 'validee sur iphone'):
    for _m in re.finditer(re.escape(_interdit), DOC_PLAT):
        _avant = DOC_PLAT[max(0, _m.start() - 60):_m.start()]
        if not re.search(r'\bne\b|\bpas\b|\bjamais\b|\baucun', _avant):
            raise SystemExit('LE VERDICT EST MONTE D UN CRAN SANS LE RETOUR IPHONE : « %s » est '
                             'AFFIRME dans le document (contexte : %r). Michel a ecrit de ne pas '
                             'le faire.' % (_interdit, _avant[-50:]))
for _s in ('ft-v377', 'ft-v378', 'ft-v388', 'merge-base', '2 j 19 h', 'zone de silence'):
    if _plat(_s) not in DOC_PLAT:
        raise SystemExit('Le document a perdu un fait de la contre-enquete : %s' % _s)
# [/!\] LA DATE D ENTREE D OPEN FOOD FACTS EST LE FAIT QUI CORRIGE LA PREMISSE — on epingle
#       l AFFIRMATION, pas le nombre : « 08/07 » apparait ailleurs dans le tableau, donc chercher
#       la chaine seule laissait passer la suppression de la phrase qui compte.
if not re.search(r"l ?.?integration date du ?.{0,6}08/07", _plat(DOC).replace('*', '')):
    raise SystemExit('Le document n affirme plus QUAND Open Food Facts est entre dans le projet : '
                     'c est le fait qui corrige la premisse de Michel, et sans lui la contre-'
                     'enquete perd son point de depart.')
# [/!\] LA CORRECTION EXPLICITE : le document doit DIRE que sa conclusion precedente etait trop
#       forte. Un dossier qui se corrige en silence vaut moins qu un dossier qui se corrige.
if "n'explique pas le retrait" not in DOC_PLAT.replace(' ', ' '):
    raise SystemExit('Le document ne CORRIGE plus explicitement sa conclusion precedente sur le '
                     'lookup : Michel a demande que la correction soit explicite.')
if "n'est pas mesuree" not in DOC_PLAT:
    raise SystemExit('Le document ne dit plus que la fiabilite iPhone N EST PAS mesuree d ici.')

N_GARDES = len(re.findall(r'raise SystemExit', open(os.path.abspath(__file__),
                                                    encoding='utf-8').read()))

# ═══ RENDU ════════════════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')

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
    """Refuse tout caractere que WinAnsi/cp1252 ne sait pas coder — la police ne le dessinerait
    pas, et un carre noir dans un document partage passe inapercu a la relecture.
    [/!\\] Il ENCODE au lieu de deviner : une version anterieure testait la plage latin-1 et
    refusait le tiret cadratin, que cp1252 code pourtant en 0x97. *Un controle plus strict que la
    contrainte reelle refuse du travail juste.*"""
    nu = html.unescape(re.sub(r'<[^>]+>', '', txt))
    for i, ch in enumerate(nu):
        try:
            ch.encode('cp1252')
        except UnicodeEncodeError:
            raise SystemExit('CARACTERE HORS cp1252 : %r (contexte : %r)'
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
H.append(P('Le scanner camera local &mdash; reactivation controlee', 'titre'))
H.append(P('14/09/2026 &middot; Force Tracker %s &middot; %d gardes recomptent ce document depuis '
           'le code servi et refusent de le produire si un fait tombe.' % (VERSION, N_GARDES),
           'sous'))

H.append(P('1. La chronologie de juillet &mdash; CORRIGEE', 'h'))
H.append(P('Michel apporte une information qui oblige a rouvrir l enquete : <i>&laquo; au moment '
           'ou l ancien scanner avait ete teste puis retire, la base Open Food Facts telle qu on '
           'l utilise aujourd hui n existait pas encore &raquo;</i>, et <b>&laquo; ne considere '
           'pas comme acquis que le mauvais fonctionnement venait d un lookup casse &raquo;</b>. '
           '<b>Il avait raison de le demander, et la verification change la conclusion.</b>', 'p'))
H.append(T([
    ['moment (2026)', 'fait mesure dans git'],
    ['<b>08/07 20:41</b>', '<b>Open Food Facts entre dans le projet</b> (ft-v331), trois jours '
                           'avant le scanner live'],
    ['11/07 10:20', 'note : <i>&laquo; photo unique trop fragile, verifie en test &raquo;</i>'],
    ['11/07 14:33', 'le scanner camera <b>live</b> est cree (ft-v376)'],
    ['<b>11/07 15:29</b>', '<b>le lookup est REPARE</b> (ft-v377)'],
    ['11/07 15:40', 'correctif <i>&laquo; camera ouverte mais ne lit pas &raquo;</i> (ft-v378) : '
                    '1080p + bouton Capturer'],
    ['11/07 16:47', 'clone <b>deploye pour test iPhone</b>'],
    ['11/07 16:57', 'saisie manuelle : <i>&laquo; repli quand le scan galere &raquo;</i>'],
    ['<b>11/07 17:10</b>', '<b>retrait</b> : <i>&laquo; trop capricieux iPhone &raquo;</i>'],
], [28 * mm, 137 * mm]))
H.append(P('<b>(1) Open Food Facts ETAIT la.</b> La fonction de recherche produit au moment du '
           'retrait est, a quelques champs pres, celle d aujourd hui. <i>Sur la lettre la premisse '
           'est donc inexacte &mdash; mais sur le fond elle vise juste</i> : tout ce qui ENTOURE ce '
           'lookup est posterieur (le normaliseur, le resolveur energie/macros, la douane, CIQUAL, '
           'le hub). En juillet, le lookup ne prenait meme pas d argument de provenance.', 'p'))
H.append(P('<b>(2) Le correctif du lookup est un ANCETRE du retrait</b> &mdash; verifie par '
           '<b>git merge-base</b> &mdash; et le clone reellement teste sur iPhone a 16:47 '
           'contenait <b>les deux correctifs</b>. <b>Donc le jugement &laquo; trop capricieux '
           'iPhone &raquo; a ete porte sur un lookup repare : le bug de lookup n explique PAS le '
           'retrait du scanner live.</b> C est la correction principale apportee a ce dossier.', 'p'))
H.append(P('<b>(3) En revanche il explique l AUTRE jugement, celui qui a tout declenche.</b> La '
           'note <i>&laquo; photo unique trop fragile &raquo;</i> a ete ecrite pendant les '
           '<b>2 jours et 19 heures</b> ou le lookup rejetait TOUS les produits &mdash; et c est '
           'ce jugement-la qui a motive la construction du scanner live. <i>L erreur de confusion '
           'a bien eu lieu ; elle s est produite un cran plus tot que je ne l avais ecrit.</i>', 'p'))
H.append(P('<b>Et la trouvaille de la contre-enquete : la course est nee du correctif.</b> Le '
           'bouton &laquo; Capturer &raquo; est arrive a <b>15:40</b> avec le desarmement pose '
           'APRES son await ; le scanner a ete retire <b>1 h 30 plus tard</b>. Deux lookups pour un '
           'scan, c est deux <i>&laquo; Recherche du produit... &raquo;</i> et un formulaire rempli '
           'deux fois. <b>Mecanisme mesure, cause non prouvee</b> &mdash; mais il n existe plus.', 'p'))

H.append(P('2. Ce qui a ete corrige', 'h'))
H.append(T([
    ['#', 'correction', 'preuve'],
    ['1', '<b>La course</b> : un seul proprietaire d etat (IDLE, SCANNING, CODE_TROUVE, LOOKUP, '
          'TERMINE). Tout code decode passe par un verrou unique.',
          '1 lookup sous course <b>provoquee</b> (le banc martele Capturer)'],
    ['2', '<b>Provenance explicite</b> : camera-code-local passee en dur, jamais heritee.',
          'temoin de comportement + de source'],
    ['3', '<b>Aucun bouton mort</b> : les trois orphelines de ft-v388 sont supprimees, avec leur '
          'raison ecrite (R30).', 'temoin de source'],
    ['4', '<b>Le numero lu est montre AVANT la recherche</b> (le §16 de Michel).',
          'le champ porte l EAN a l ecran'],
    ['5', '<b>Le repli IA est un bouton</b> : ni minuteur, ni compteur d echecs.',
          'temoin de source + 0 IA sur code illisible'],
    ['6', '<b>La camera est coupee par deux chemins</b> : le lecteur ZXing ET les pistes de la '
          'balise video.', 'pistes <i>ended</i> apres succes'],
], [8 * mm, 100 * mm, 57 * mm]))

H.append(P('3. §8 &mdash; le traitement d image n apporte RIEN (mesure)', 'h'))
H.append(P('Michel : <i>&laquo; avant d ajouter sharpen, contraste, binarisation... prouve que '
           'cela ameliore reellement ZXing &raquo;</i>. Mesure sur <b>18 cas durs</b> :', 'p'))
H.append(T([
    ['traitement', 'reussites', 'cout'],
    ['<b>aucun</b>', '<b>3/18</b>', '152 ms'],
    ['contraste x2,2', '3/18', '174 ms'],
    ['nettete + desaturation', '3/18', '163 ms'],
    ['binarisation d Otsu (seuil calcule)', '3/18', '169 ms'],
    ['agrandissement x2', '3/18', '<b>258 ms</b>'],
], [70 * mm, 45 * mm, 50 * mm]))
H.append(P('<b>Aucun traitement ne fait passer un seul cas de plus</b>, et l agrandissement coute '
           '+70 %% de temps pour rien. <b>Il n y aura donc pas d usine a gaz</b> : le facteur '
           'limitant est l autofocus, et aucun post-traitement ne rattrape une image molle.', 'p'))

H.append(P('4. §9 &mdash; les formats : la liste n est pas un caprice', 'h'))
H.append(T([
    ['reglage', 'succes', 'echec', 'lit le paysage'],
    ['<b>4 formats + TRY_HARDER</b> (retenu)', '3 ms', '<b>140 ms</b>', 'oui'],
    ['4 formats seuls', '2 ms', '8 ms', '<b>non</b>'],
    ['TRY_HARDER seul', '5 ms', '<b>436 ms</b>', 'oui'],
    ['aucun reglage', '2 ms', '21 ms', '<b>non</b>'],
], [62 * mm, 28 * mm, 32 * mm, 43 * mm]))
H.append(P('<b>TRY_HARDER apporte le paysage ; la liste de 4 formats divise par 3 le cout d un '
           'echec.</b> C est elle qui rend TRY_HARDER abordable &mdash; ~7 tentatives par seconde '
           'en lecture continue. Formats retenus : <b>EAN-13</b> (Europe), <b>EAN-8</b> (petits '
           'emballages), <b>UPC-A/E</b> (produits americains). Pas un de plus : chaque format '
           'supplementaire rallonge <b>chaque frame ratee</b> sans rien lire de nouveau.', 'p'))

H.append(P('5. Le chemin reseau', 'h'))
H.append(T([
    ['', 'scanner camera', 'code tape', 'photo IA'],
    ['appels IA', '<b>0</b>', '0', '<b>1</b>'],
    ['quota des 25 essais', '<b>inchange</b>', 'inchange', '<b>+1</b>'],
    ['lookups Open Food Facts', '<b>1</b> (course fermee)', '1', '1'],
    ['provenance', 'camera-code-local', 'code-tape', 'photo-code-ia'],
    ['resultat produit', '<b>identique</b>', 'identique', 'identique'],
], [45 * mm, 43 * mm, 33 * mm, 34 * mm]))
H.append(P('<b>Le scanner ne possede aucune logique nutritionnelle</b> &mdash; un garde verifie '
           'qu il ne touche ni le normaliseur, ni le resolveur, ni la douane, ni le journal, ni les '
           'portions. <i>Il fournit un numero et appelle le chemin existant.</i> Sur un code '
           'illisible : <b>0 lookup, 0 appel IA, quota intact</b>, un message qui dit quoi faire, '
           'et la camera reste ouverte pour reessayer.', 'p'))

H.append(P('6. Ce que je ne peux pas prouver d ici', 'h'))
H.append(P('<b>Ce conteneur n a ni camera ni Safari.</b> Ne sont PAS mesures : la fiabilite sur '
           'iPhone, le comportement reel de l autofocus (pourtant le facteur limitant), le passage '
           'en arriere-plan et le retour, et la cadence reelle de la lecture continue (le banc rend '
           'la video en logiciel &mdash; son chiffre est un plafond large, pas une prediction). '
           '<b>Et une honnetete sur l enquete</b> : que la course ait <i>cause</i> le retrait de '
           'juillet est un mecanisme plausible, pas un fait etabli. Le fait etabli est qu elle '
           'existait ce jour-la.', 'p'))

H.append(P('7. Verdict : PRET POUR TEST IPHONE', 'h'))
H.append(P('<b>Et rien de plus fort.</b> Michel : <i>&laquo; ne declare pas le scanner '
           'definitivement reactive avant mon retour iPhone &raquo;</i> &mdash; un garde de ce '
           'generateur refuse de produire si le document monte d un cran. Le protocole iPhone tient '
           'en 6 produits et 5 gestes, et son critere est le sien : <b>est-ce qu un utilisateur '
           'normal arrive a scanner rapidement la majorite de ses produits sans s enerver ?</b>', 'p'))

H.append(Spacer(1, 8))
H.append(P('Mesures figees par les blocs CCCVIII (%d temoins, le scanner conduit devant une camera '
           'factice qui filme un vrai EAN-13) et CCCIX (%d temoins, les garanties de la '
           'reactivation). Ce PDF est produit par tools/gen_scanner_pdf.py : ses %d gardes '
           'recomptent chaque fait depuis le code servi.'
           % (N_VIII, N_IX, N_GARDES), 'petit'))

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=22 * mm, rightMargin=22 * mm,
                  topMargin=18 * mm, bottomMargin=16 * mm,
                  title='Le scanner camera local - reactivation controlee',
                  author='Force Tracker').build(H)
print('OK %s  (%s, CCCVIII %d + CCCIX %d temoins, %d gardes)'
      % (OUT, VERSION, N_VIII, N_IX, N_GARDES))
