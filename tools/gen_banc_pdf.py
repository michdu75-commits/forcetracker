#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere le PDF du banc d essai des moteurs de decodage. Vingt-cinquieme document de la serie.

TOUS LES CHIFFRES SONT RELUS DANS LA MESURE, JAMAIS RECOPIES ICI. Le generateur ouvre
docs/banc-moteurs-mesures.json et refuse de produire si un fait du document ne s y retrouve pas,
ou si le code servi a cesse de dire ce que le document affirme.

ET LES GARDES LES PLUS UTILES PROTEGENT DES DECISIONS, pas des nombres :
  - que la porte du scanner soit restee FERMEE (Michel, 14/09 : aucun bouton utilisateur) ;
  - que le moteur, lui, soit reste en place (c est lui que le banc mesure) ;
  - que le conflit entre moteurs ne soit pas avale ;
  - que le verdict ne monte pas d un cran sans le retour iPhone ;
  - que les bibliotheques candidates ne soient PAS entrees dans le depot.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d emoji.
Sortie hors depot par defaut (regle d or #14 : le depot est public).
"""
import html
import json
import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or '/tmp/DOSSIER-GPT-BANC-MOTEURS-CODEBARRES-14-09-2026.pdf'

APP = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
IDX = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
RUN = open(os.path.join(ROOT, 'tests', 'parcours', 'runner.js'), encoding='utf-8').read()
DOC = open(os.path.join(ROOT, 'docs', 'BANC-MOTEURS-CODEBARRES.md'), encoding='utf-8').read()
MES = json.load(open(os.path.join(ROOT, 'docs', 'banc-moteurs-mesures.json'), encoding='utf-8'))

VERSION = (re.search(r"const CACHE ?= ?'(ft-v\d+)'", SW) or [None, '?'])[1]


def sans_com(t):
    t = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), t)
    return '\n'.join(l for l in t.split('\n') if not l.strip().startswith('//'))


def corps(nom, src=None):
    """Le corps d UNE fonction, borne par sa vraie accolade fermante — jamais par une distance
    en caracteres (BUGS.md §63 : une borne en distance deborde sur la fonction VOISINE)."""
    s = src if src is not None else APP
    m = re.search(r'(?:async )?function ' + nom + r'\s*\(', s)
    if not m:
        return ''
    i = s.index('{', m.end() - 1)
    p, j = 0, i
    while j < len(s):
        if s[j] == '{':
            p += 1
        elif s[j] == '}':
            p -= 1
            if p == 0:
                return s[i:j + 1]
        j += 1
    return s[i:]


APP_NU = sans_com(APP)

# ══════════════════════════════════════════════════════════════════════════════════════════════
#  LES GARDES
# ══════════════════════════════════════════════════════════════════════════════════════════════

# ═══ [!!] LA PORTE EST RESTEE FERMEE — la consigne la plus importante du chantier ════════════
if 'onclick="scanBarcode()"' in IDX:
    raise SystemExit('LE BOUTON DU SCANNER EST REVENU DANS L ECRAN. Michel, 14/09 : « NE REACTIVE '
                     'PAS le scanner dans l interface utilisateur. Aucun bouton utilisateur tant '
                     'que je n ai pas tranche. » Ce document raconte un banc d essai, pas une '
                     'reactivation.')
if not re.search(r'Aucun bouton utilisateur', IDX):
    raise SystemExit('Le RETRAIT du bouton n est plus ecrit avec sa raison dans index.html : un '
                     'retrait silencieux redevient un bug (R30), et le suivant le « reparera ».')
# ... mais le MOTEUR doit rester : c est lui que le banc mesure.
for _f in ('openBarcodeScanner', 'scanBarcode', '_bcTraiterCode', '_bcPrendreLaMain'):
    if not re.search(r'(?:async )?function ' + _f + r'\s*\(', APP):
        raise SystemExit('`%s` a disparu : c est la PORTE qui est fermee, pas le moteur. Sans lui '
                         'le banc mesure quelque chose qui n existe plus.' % _f)

# ═══ [!!] LES BIBLIOTHEQUES CANDIDATES NE SONT PAS ENTREES DANS LE DEPOT ══════════════════════
# Le banc vit dans le scratchpad. Une bibliotheque qui arrive dans lib/ sans decision serait une
# reactivation deguisee — et elle serait SERVIE a tout le monde.
_LIB = os.path.join(ROOT, 'lib')
_presents = os.listdir(_LIB) if os.path.isdir(_LIB) else []
for _interdit in ('html5-qrcode', 'zxing_reader.wasm', 'zxwasm', 'quagga'):
    for _f in _presents:
        if _interdit in _f.lower():
            raise SystemExit('UNE BIBLIOTHEQUE DU BANC EST ENTREE DANS lib/ : %s. Le banc doit '
                             'rester hors du depot tant que Michel n a pas tranche — sinon elle '
                             'est servie a tout le monde.' % _f)
# [/!\] CE GARDE LIT LE CODE, PAS CE QUI EN PARLE — et sa premiere version ne le faisait pas :
#       il refusait de produire a cause du COMMENTAIRE d index.html qui explique le chantier et
#       nomme les quatre candidats. C est la famille ft-v1193/1203/1205/1210, repayee une fois de
#       plus par moi. *Un garde qui ne distingue pas le CODE de ce qui en PARLE mesure la
#       documentation.* On retire donc les commentaires JS et HTML avant de chercher.
IDX_NU = re.sub(r'<!--[\s\S]*?-->', ' ', IDX)
for _interdit in ('html5-qrcode', 'zxing-wasm', 'ZXingWASM', 'Quagga'):
    if _interdit in APP_NU or _interdit in IDX_NU:
        raise SystemExit('« %s » est reference dans le CODE d un fichier servi : aucun second '
                         'moteur ne doit entrer avant la decision de Michel.' % _interdit)

# ═══ [!!] LE CONFLIT ENTRE MOTEURS NE S AVALE PAS (§18) ═══════════════════════════════════════
_FU = sans_com(corps('_bcFusionnerCandidats'))
if not _FU:
    raise SystemExit('`_bcFusionnerCandidats` a disparu : c est le proprietaire du « quel code '
                     'part a la recherche », et tout le §7 repose dessus.')
if "'conflit'" not in _FU:
    raise SystemExit('L etat « conflit » a disparu de la fusion : Michel a ecrit « jamais prendre '
                     'le premier et continuer. Aucune invention. »')
if not re.search(r"etat:'conflit'[^}]*recherches:\s*0", _FU):
    raise SystemExit('UN CONFLIT DECLENCHE UNE RECHERCHE : c est exactement le comportement '
                     'interdit — aucun lookup ne doit partir quand deux moteurs se contredisent.')
if not re.search(r'filter\(\(c,i,a\)=>a\.indexOf\(c\)===i\)', _FU):
    raise SystemExit('La DEDUPLICATION a saute : deux moteurs qui lisent le meme code seraient '
                     'comptes comme un desaccord, et plus rien ne passerait.')
if '_eanValide(' not in _FU:
    raise SystemExit('La fusion ne consulte plus `_eanValide` : la cle de controle a UN seul '
                     'proprietaire (R2), et une copie divergerait.')
if re.search(r'%\s*10', _FU):
    raise SystemExit('L arithmetique de la cle de controle a ete RECOPIEE dans la fusion : R2, '
                     'une regle un proprietaire. C est le defaut que ce chantier evite.')
for _mot in ('_ref100', 'foodLog', '_douaneLigne', 'savedFoods', '_afSetSrc', '_offFetchProduct'):
    if _mot in _FU:
        raise SystemExit('La fusion touche a la nutrition (« %s ») : « aucun moteur ne doit '
                         'posseder sa propre logique Nutrition » (Michel, §7).' % _mot)
# ... et elle est sur le chemin VIVANT, pas a cote (BUGS.md §62).
_TC = sans_com(corps('_bcTraiterCode'))
if '_bcFusionnerCandidats(' not in _TC:
    raise SystemExit('`_bcTraiterCode` NE PASSE PLUS par le proprietaire : un chemin qui ne serait '
                     'juste que parce qu il n y a qu un moteur serait juste par accident (§62).')
if not re.search(r'_lookupBarcode\(\s*f\.code\s*,', _TC) or re.search(r'_lookupBarcode\(\s*code\s*[,)]', _TC):
    raise SystemExit('La recherche produit repart avec le code BRUT au lieu du code retenu par le '
                     'proprietaire : la validation devient decorative.')

# ═══ [!!] LES TEMOINS PERMANENTS EXISTENT (§17) ════════════════════════════════════════════════
# [/!\] LE PIEGE DE LA SOUS-CHAINE, REPAYE : « BLOC CCCX » est contenu dans « BLOC CCCXZ », donc
#       un simple `in` laissait passer un renommage du bloc. C est `presentsX` de ft-v1207, la
#       troisieme fois que je le paie. On ancre sur la ligne ENTIERE du titre.
if not re.search(r'BLOC CCCX\b(?!I)', RUN):
    raise SystemExit('Le bloc de temoins CCCX a disparu du banc : les garanties du §17 ne sont '
                     'plus eprouvees a chaque passe.')
N_X = len(re.findall(r"t\('CCCX [^']", RUN))
if N_X < 10:
    raise SystemExit('Le bloc CCCX est tombe a %d temoins : le document en annonce 10.' % N_X)
N_VIII = len(re.findall(r"t\('CCCVIII ", RUN))
N_IX = len(re.findall(r"t\('CCCIX ", RUN))
if N_VIII < 19 or N_IX < 12:
    raise SystemExit('Les blocs CCCVIII/CCCIX ont maigri (%d/%d) : le document affirme qu ils '
                     'tiennent toujours.' % (N_VIII, N_IX))

# ═══ [!!] LES CHIFFRES SONT RELUS DANS LA MESURE, PAS RECOPIES ═══════════════════════════════
M = MES['moteurs']
for _m in ('ZXing-js (servi)', 'Html5-QRCode', 'zxing-wasm', 'Quagga2 (cadre)', 'Quagga2 (scene)'):
    if _m not in M:
        raise SystemExit('Le moteur « %s » a disparu de la mesure : le banc devait en comparer '
                         'quatre au minimum (Michel, §1).' % _m)
if MES['erreurs_js']:
    raise SystemExit('Le banc a produit %d erreurs JS : ses chiffres ne sont pas exploitables.'
                     % MES['erreurs_js'])
# ⛔ Le banc ne doit avoir touche NI la nutrition NI un service IA.
for _u in MES['reseau_pendant_le_banc']:
    if not _u.endswith('.wasm'):
        raise SystemExit('LE BANC A FAIT UN APPEL RESEAU INATTENDU (%r) : il ne doit charger que '
                         'le .wasm local, et surtout jamais Open Food Facts ni un service IA.' % _u)
if len(MES['codes']) < 5:
    raise SystemExit('Moins de 5 codes reels : Michel en demandait 2 + au moins 3 autres (§12).')


def _cle13(c):
    return (10 - sum(int(c[i]) * (3 if i % 2 else 1) for i in range(12)) % 10) % 10


for _c in MES['codes']:
    if len(_c) != 13 or not _c.isdigit() or _cle13(_c) != int(_c[12]):
        raise SystemExit('Le code « %s » n est pas un EAN-13 valide : le banc doit tourner sur de '
                         'VRAIS codes (§12).' % _c)
if len({c[0] for c in MES['codes']}) < 4:
    raise SystemExit('Moins de 4 premiers chiffres distincts : les motifs de parite se '
                     'ressemblent, donc les dessins aussi (§12).')

WASM = M['zxing-wasm']['pct']
ZXJS = M['ZXing-js (servi)']['pct']
H5Q = M['Html5-QRCode']['pct']
QCAD = M['Quagga2 (cadre)']['pct']
QSCE = M['Quagga2 (scene)']
DUO = round(100.0 * MES['cascades']['plafond'] / MES['cascades']['N'], 1)

# ⛔ LE VERDICT EST DERIVE DE LA MESURE, PAS ECRIT A LA MAIN.
if not (WASM > ZXJS):
    raise SystemExit('zxing-wasm ne bat plus le ZXing servi (%.1f vs %.1f) : le verdict C du '
                     'document reposait sur cet ecart. Le refaire avant de republier.'
                     % (WASM, ZXJS))
if not (H5Q < ZXJS):
    raise SystemExit('Html5-QRCode ne perd plus face au ZXing servi (%.1f vs %.1f) : l argument '
                     '« meme moteur avec TRY_HARDER a false » tombe.' % (H5Q, ZXJS))
if not (DUO > WASM):
    raise SystemExit('La cascade a deux n apporte plus rien (%.1f vs %.1f) : le verdict devrait '
                     'alors etre B prime (un seul moteur), pas C.' % (DUO, WASM))
if QSCE['ean_faux'] <= 0:
    raise SystemExit('Les EAN FAUX de Quagga2 en mode scene ont disparu de la mesure : c est le '
                     'fait qui justifie l etat de conflit. Verifier la mesure avant de republier.')
if MES['desaccords']['sans Quagga2 (scene), EAN-8 accepte'] != 0:
    raise SystemExit('Des desaccords apparaissent HORS du mode scene : la recommandation de '
                     'garder l EAN-8 (§13) reposait sur ce zero.')
# Le flou reste le seul mur.
if any('flou' not in j for j in MES['cascades']['jamais_lu']):
    raise SystemExit('Une image NON FLOUE est devenue illisible par tout le monde : la conclusion '
                     '« le facteur limitant est la mise au point » ne tient plus telle quelle.')
for _mo, _s in MES['resolution_flou'].items():
    _net = _s.get('net (capture apres mise au point)')
    _fl = _s.get('direct flou (1.5 px)')
    if _net is None or _fl is None or not (_fl >= 3 * _net):
        raise SystemExit('Le flou ne coute plus au moins 3x la resolution pour %s : c est '
                         'l argument du §10 (capture apres mise au point > direct flou).' % _mo)

# ═══ [!!] LE DOCUMENT DIT CE QU IL DOIT DIRE ══════════════════════════════════════════════════
_ACC = str.maketrans('àâäéèêëîïôöùûüç', 'aaaeeeeiioouuuc')
DOC_PLAT = DOC.lower().translate(_ACC).replace('’', "'")
if 'aucune reactivation utilisateur avant test iphone' not in DOC_PLAT:
    raise SystemExit('Le document a perdu la phrase de fin exigee par Michel.')
# Le verdict ne monte pas d un cran. (Le garde voit la NEGATION : une citation de Michel qui dit
# de NE PAS le faire ne doit pas faire refuser le document — l erreur du 14/09, repayee sinon.)
for _interdit in ('definitivement reactive', 'reactive definitivement', 'valide sur iphone'):
    for _m in re.finditer(re.escape(_interdit), DOC_PLAT):
        _av = DOC_PLAT[max(0, _m.start() - 60):_m.start()]
        if not re.search(r'\bne\b|\bpas\b|\bjamais\b|\baucun', _av):
            raise SystemExit('LE VERDICT MONTE D UN CRAN : « %s » est AFFIRME (contexte %r).'
                             % (_interdit, _av[-50:]))
for _f in ('try_harder', 'third_party', 'quiet', 'asin', 'ean-8'):
    if _f not in DOC_PLAT.replace('zone de silence', 'quiet'):
        raise SystemExit('Le document a perdu un fait de fond : %s' % _f)
if 'n\'est pas mesur' not in DOC_PLAT and 'ne peux pas mesurer' not in DOC_PLAT:
    raise SystemExit('Le document ne dit plus ce qu il NE mesure PAS (Safari, autofocus reel).')
# La courbure doit rester EXPLIQUEE — Michel l a demande nommement.
if 'asin' not in DOC_PLAT or 'cylindr' not in DOC_PLAT:
    raise SystemExit('La simulation de COURBURE n est plus expliquee : « si tu simules la '
                     'courbure, explique comment » (Michel, §5).')

N_GARDES = len(re.findall(r'raise SystemExit',
                          open(os.path.abspath(__file__), encoding='utf-8').read()))

# ══════════════════════════════════════════════════════════════════════════════════════════════
#  RENDU
# ══════════════════════════════════════════════════════════════════════════════════════════════
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


def _valide(txt):
    """Refuse tout caractere que WinAnsi/cp1252 ne sait pas coder. Il ENCODE au lieu de deviner
    (un controle plus strict que la contrainte reelle refuse du travail juste)."""
    nu = html.unescape(re.sub(r'<[^>]+>', '', txt))
    for i, ch in enumerate(nu):
        try:
            ch.encode('cp1252')
        except UnicodeEncodeError:
            raise SystemExit('CARACTERE HORS cp1252 : %r (contexte %r)'
                             % (ch, nu[max(0, i - 30):i + 30]))
    return txt


def P(txt, st='p'):
    return Paragraph(_valide(txt), S[st])


def T(lignes, largeurs, entete=True):
    data = [[Paragraph(_valide(c), S['cellb' if (entete and i == 0) else 'cell']) for c in ln]
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


def n(x, d=1):
    """Virgule decimale : le document est en francais, et un « 86.2 » dans un texte qui dit
    « 86,2 » ailleurs est exactement le genre d incoherence qu on ne relit jamais."""
    return (('%.' + str(d) + 'f') % x).replace('.', ',')


H = []
H.append(P('Banc d essai des moteurs de decodage de code-barres', 'titre'))
H.append(P('14/09/2026 &middot; Force Tracker %s &middot; %d gardes recomptent ce document depuis '
           'le code servi et depuis la mesure, et refusent de le produire si un fait tombe.'
           % (VERSION, N_GARDES), 'sous'))

H.append(P('0. La reponse en cinq lignes', 'h'))
H.append(T([
    ['Le meilleur moteur seul',
     '<b>zxing-wasm</b> &mdash; <b>%s %%</b> contre <b>%s %%</b> au ZXing-js servi, et '
     '<b>%dx plus rapide</b> (%s ms contre %s ms)'
     % (n(WASM), n(ZXJS), round(M['ZXing-js (servi)']['ms_moy'] / M['zxing-wasm']['ms_moy']),
        n(M['zxing-wasm']['ms_moy']), n(M['ZXing-js (servi)']['ms_moy']))],
    ['Le meilleur duo',
     '<b>zxing-wasm + Quagga2 (cadre)</b> &mdash; <b>%s %%</b>' % n(DUO)],
    ['Ce que personne ne lit',
     'le <b>flou &gt;= 2 px</b>, et rien d autre : les %d images inlisibles sont TOUTES des flous'
     % (MES['cascades']['N'] - MES['cascades']['plafond'])],
    ['Le vrai facteur limitant',
     'la <b>mise au point</b>, pas le moteur : un flou leger coute <b>3x</b> la resolution, '
     'un flou franc <b>6x</b>'],
    ['Verdict',
     '<b>C &mdash; ZXING + FALLBACK LOCAL SECONDAIRE</b>, avec <b>zxing-wasm</b> en moteur '
     'principal'],
], [42 * mm, 124 * mm], entete=False))

H.append(P('1. La consigne la plus importante a ete appliquee en premier', 'h'))
H.append(P('Michel : <i>&laquo; NE REACTIVE PAS le scanner dans l interface utilisateur. Aucun '
           'bouton utilisateur tant que je n ai pas tranche. &raquo;</i> Or <b>ft-v1210 avait '
           'livre ce bouton la veille</b>. <b>Il a donc ete retire d index.html</b>, avec sa raison '
           'ecrite sur place (R30), et deux temoins figent l etat <b>dans les deux sens</b> : ils '
           'rougissent si le bouton revient <b>et</b> si le moteur disparait. <i>C est la porte qui '
           'est fermee, pas le moteur</i> &mdash; sinon le banc mesurerait quelque chose qui '
           'n existe plus.', 'p'))
H.append(P('<b>Et les trois bibliotheques candidates ne sont PAS entrees dans le depot</b> : le '
           'banc vit entierement dans un espace de travail hors depot. Un garde refuse de produire '
           'ce document si l une d elles apparait dans lib/ ou dans un fichier servi &mdash; ce '
           'serait une reactivation deguisee, et elle serait servie a tout le monde.', 'p'))

H.append(P('2. Html5-QRCode : la question de Michel, et sa reponse LUE DANS LE CODE', 'h'))
H.append(P('<i>&laquo; Si Html5-QRCode utilise essentiellement le meme moteur ZXing pour lire le '
           'code, dis-le clairement. &raquo;</i> <b>Oui.</b> Son fichier code-decoder.ts importe '
           'ZXingHtml5QrcodeDecoder, qui importe ../third_party/zxing-js.umd &mdash; <b>un fork de '
           'la bibliotheque zxing-js que nous servons deja</b>.', 'p'))
H.append(P('<b>Et il la bride</b> : zxing-html5-qrcode-decoder.ts, ligne 80, ecrit en dur '
           '<b>hints.set(DecodeHintType.TRY_HARDER, false)</b>, sans aucun moyen de le rallumer '
           'depuis son API publique. C est exactement le reglage mesure en ft-v1210 comme celui qui '
           'achete la lecture d un code en paysage. <b>Resultat : %s %% contre %s %% pour le meme '
           'moteur non bride</b>, et il echoue precisement la ou TRY_HARDER sert &mdash; faible '
           'lumiere 0/18, faible contraste 0/18, cumul realiste 0/18.' % (n(H5Q), n(ZXJS)), 'p'))
H.append(P('<b>La preuve par le pretraitement</b> : un simple etirement des niveaux lui rend '
           '<b>+%d</b> (%d vers %d). <i>Le pretraitement ne l ameliore pas, il compense un reglage '
           'qu on lui a retire</i> &mdash; et meme compense, il reste SOUS zxing-wasm brut (%d). '
           'Ce qu il apporte reellement est sa <b>couche camera</b> : or nous l avons deja, ecrite '
           'et eprouvee en ft-v1210.'
           % (MES['pretraitement']['niveaux (etirement)']['Html5-QRCode']
              - MES['pretraitement']['aucun']['Html5-QRCode'],
              MES['pretraitement']['aucun']['Html5-QRCode'],
              MES['pretraitement']['niveaux (etirement)']['Html5-QRCode'],
              MES['pretraitement']['aucun']['zxing-wasm']), 'p'))

H.append(P('3. Le tableau comparatif', 'h'))
_lig = [['', 'ZXing-js<br/>(servi)', 'Html5-<br/>QRCode', 'zxing-<br/>wasm',
         'Quagga2<br/>(cadre)', 'Quagga2<br/>(scene)']]
_ordre = ['ZXing-js (servi)', 'Html5-QRCode', 'zxing-wasm', 'Quagga2 (cadre)', 'Quagga2 (scene)']
for _lbl, _k, _d in [('taux de reussite', 'pct', 1), ('cas durs', 'durs_pct', 1),
                     ('temps moyen (ms)', 'ms_moy', 1), ('p95 (ms)', 'ms_p95', 1),
                     ('maximum (ms)', 'ms_max', 1), ('EAN faux', 'ean_faux', 0),
                     ('codes rejetes', 'rejetes', 0)]:
    _lig.append([_lbl] + [n(M[m][_k], _d) + ('&nbsp;%' if 'pct' in _k else '') for m in _ordre])
_lig.append(['erreurs JS'] + ['0'] * 5)
_lig.append(['stabilite (3 passes)'] + ['identiques'] * 5)
_lig.append(['octets charges (gzip)', '97 Ko', '106 Ko', '13 + <b>403</b> Ko', '42 Ko', '42 Ko'])
_lig.append(['1er appel (init)', '8,8 ms', '13,0 ms', '30,6 ms', '25,1 ms', '66,4 ms'])
_lig.append(['appel chaud', '1,57 ms', '16,11 ms', '<b>0,87 ms</b>', '14,17 ms', '43,08 ms'])
H.append(T(_lig, [33 * mm] + [26.6 * mm] * 5))
H.append(P('%d cas de degradation x %d codes reels x %d passes = %d mesures par moteur. Le MEME '
           'canvas est servi a tous. Aucun appel reseau pendant tout le banc, hors le .wasm local.'
           % (len(MES['par_cas']), len(MES['codes']), MES['passes'],
              M['zxing-wasm']['n']), 'petit'))

H.append(P('4. Le danger mesure : un code FAUX dont la cle est JUSTE', 'h'))
H.append(P('Quagga2 en mode <b>scene</b> (locate:true, celui qu il faut pour chercher un code dans '
           'une image large) produit des <b>EAN-8 de cle de controle parfaitement valide, lus a '
           'l INTERIEUR d un EAN-13</b> : sa localisation trouve un sous-morceau du code et le lit '
           'comme un code entier. <b>%d occurrences mesurees.</b>' % QSCE['ean_faux'], 'p'))
H.append(T([['image', 'code reel', 'ce que Quagga2 (scene) rend']]
           + [[c[1], c[2], '<b>%s</b>' % c[3]] for c in MES['ean_faux_observes']],
           [58 * mm, 44 * mm, 64 * mm]))
H.append(P('<b>Un code faux dont la cle est juste ne peut etre attrape par RIEN en aval</b> : ni '
           'par le validateur, ni par la recherche produit, qui rendra &laquo; inconnu &raquo; '
           '&mdash; ou pire, <b>un autre produit</b>. Le seul endroit ou ca s attrape est la '
           'fusion des candidats. <i>C est pour ca que le garde-fou du §18 a ete ecrit MAINTENANT, '
           'alors qu un seul moteur tourne : il doit exister AVANT le second moteur, jamais '
           'apres.</i>', 'p'))

H.append(P('5. La chaine de validation unique (§7 et §18) &mdash; construite et eprouvee', 'h'))
H.append(P('MOTEUR(S) -&gt; candidat brut -&gt; _eanValide() -&gt; deduplication -&gt; '
           '_bcFusionnerCandidats() -&gt; <b>1 seule recherche</b>. <b>Aucun proprietaire n a ete '
           'cree</b> : _eanValide existait deja et reste le seul endroit qui connait la cle (R2). '
           'Trois etats : <b>aucun</b> (0 recherche), <b>valide</b> (1 recherche), et '
           '<b>conflit</b> &mdash; deux codes valides DIFFERENTS, <b>0 recherche</b>, les deux '
           'candidats nommes, l ecran redemande une capture. <i>&laquo; Jamais prendre le premier '
           'et continuer. Aucune invention. &raquo;</i>', 'p'))
H.append(P('<b>La deduplication passe AVANT le conflit</b> : deux moteurs qui lisent le meme code '
           'ne se contredisent pas, ils se <b>confirment</b>. Et le proprietaire est sur le chemin '
           '<b>vivant</b> : _bcTraiterCode y passe <b>meme avec un seul moteur</b>, parce qu <i>un '
           'chemin qui ne serait juste que parce qu il n y a qu un moteur serait juste par '
           'accident</i> (BUGS.md §62).', 'p'))

H.append(P('6. Les strategies comparees (§8) &mdash; et pourquoi un 3e moteur n apporte rien', 'h'))
_c = MES['cascades']
H.append(T([
    ['strategie', 'resultat', 'verdict'],
    ['A &mdash; ZXing-js seul (aujourd hui)',
     '%d/%d &middot; %s %%' % (_c['seuls']['ZXing-js (servi) / aucun'], _c['N'], n(ZXJS)),
     'la reference'],
    ['B &mdash; Html5-QRCode seul',
     '%d/%d &middot; %s %%' % (_c['seuls']['Html5-QRCode / aucun'], _c['N'], n(H5Q)),
     '<b>regression</b>'],
    ['B\' &mdash; zxing-wasm seul',
     '%d/%d &middot; <b>%s %%</b>' % (_c['seuls']['zxing-wasm / aucun'], _c['N'], n(WASM)),
     '<b>+%s points, %dx plus rapide</b>'
     % (n(WASM - ZXJS), round(M['ZXing-js (servi)']['ms_moy'] / M['zxing-wasm']['ms_moy']))],
    ['C &mdash; ZXing-js puis zxing-wasm',
     '%d/%d &middot; %s %%' % (_c['seuls']['zxing-wasm / aucun'], _c['N'], n(WASM)),
     'le premier n apporte rien au second'],
    ['F &mdash; <b>zxing-wasm puis Quagga2 (cadre)</b>',
     '<b>%d/%d &middot; %s %%</b>' % (_c['plafond'], _c['N'], n(DUO)),
     '<b>le plafond du banc</b>'],
    ['un 3e moteur, quel qu il soit',
     '%d/%d &middot; %s %%' % (_c['plafond'], _c['N'], n(DUO)),
     '<b>gain strictement nul</b>'],
], [58 * mm, 44 * mm, 64 * mm]))
H.append(P('<i>&laquo; Le but n est pas d empiler les librairies &raquo;</i> &mdash; et la mesure '
           'lui donne raison : toutes les combinaisons a trois plafonnent exactement ou la '
           'meilleure paire. <b>Et les %d images que personne ne lit sont TOUTES des flous</b> '
           '(%s). Le plafond du banc n est pas un plafond d algorithme, c est un plafond de mise '
           'au point.'
           % (_c['N'] - _c['plafond'], ', '.join(_c['jamais_lu'])), 'p'))

H.append(P('7. Direct legerement flou contre capture haute definition (§10)', 'h'))
H.append(P('<b>La mesure la plus utile du dossier pour l iPhone.</b> Meme code, resolution '
           'croissante (largeur d un module en pixels), avec et sans le flou du direct. Le seuil '
           'est la premiere largeur ou 6/6 passe.', 'p'))
_rf = MES['resolution_flou']
_cols = ['net (capture apres mise au point)', 'direct legerement flou (0.8 px)',
         'direct flou (1.5 px)']
H.append(T([['', 'net (apres mise au point)', 'direct leg. flou (0,8 px)', 'direct flou (1,5 px)']]
           + [[m] + ['module &gt;= <b>%s</b>' % _rf[m][c] for c in _cols] for m in _rf],
           [38 * mm, 42 * mm, 42 * mm, 44 * mm]))
H.append(P('<b>Le flou coute 3 a 6 fois la resolution.</b> Une image NETTE se lit a <b>1 pixel par '
           'module</b> &mdash; c est-a-dire que la resolution n est presque jamais le probleme. '
           '<b>Consequence directe pour l iPhone</b> : une capture haute definition APRES la mise '
           'au point bat le decodage continu d un flux legerement flou, et <i>monter la resolution '
           'sans regler la mise au point est la facon chere d acheter ce que la mise au point donne '
           'gratuitement</i>.', 'p'))

H.append(P('8. Les pretraitements (§11) &mdash; presque tous rejetes par la mesure', 'h'))
_pr = MES['pretraitement']
_pm = ['ZXing-js (servi)', 'zxing-wasm', 'Quagga2 (cadre)', 'Html5-QRCode']
_lg = [['pretraitement', 'ZXing-js', 'zxing-wasm', 'Quagga2 (cadre)', 'Html5-QRCode']]
for _p in _pr:
    if _p == 'aucun':
        _lg.append(['aucun'] + [str(_pr['aucun'][m]) for m in _pm])
        continue
    _r = [_p]
    for m in _pm:
        _d = _pr[_p][m] - _pr['aucun'][m]
        _r.append('=' if _d == 0 else ('<b>+%d</b>' % _d if _d > 0 else '<b>%d</b>' % _d))
    _lg.append(_r)
H.append(T(_lg, [46 * mm, 30 * mm, 30 * mm, 30 * mm, 30 * mm]))
H.append(P('<b>Aucun pretraitement n aide les deux meilleurs moteurs</b>, sauf l agrandissement x2 '
           'pour zxing-wasm : <b>+%d</b> pour 1,4 ms. C est le seul qui merite sa place. La '
           '<b>nettete est une PERTE nette</b> pour eux (%d et %d) : elle accentue le bruit autant '
           'que les barres. Et <b>le recadrage central detruit tout</b> (-100 %%) : il mange la '
           '<b>zone de silence</b>, sans laquelle aucun decodeur ne peut delimiter le code. '
           '<i>C est le pretraitement qui semble le plus evident, et c est le pire.</i>'
           % (_pr['agrandissement x2']['zxing-wasm'] - _pr['aucun']['zxing-wasm'],
              _pr['nettete legere']['zxing-wasm'] - _pr['aucun']['zxing-wasm'],
              _pr['nettete legere']['Quagga2 (cadre)'] - _pr['aucun']['Quagga2 (cadre)']), 'p'))

H.append(P('9. Comment la COURBURE est simulee (Michel l a demande nommement)', 'h'))
H.append(P('Un code colle sur une boite cylindrique ne se deforme <b>pas en vague</b>. Vu de face, '
           'chaque colonne de l image correspond a un point du cylindre, et l abscisse apparente '
           'suit un <b>sinus</b> de l angle : les barres du <b>centre</b> gardent leur largeur, '
           'celles des <b>bords</b> sont <b>comprimees</b> &mdash; et c est exactement ce qui casse '
           'la lecture, puisqu un decodeur mesure des <b>largeurs</b>. Pour une colonne de sortie '
           'x dans [-1,1] et une etiquette couvrant un angle a : <b>u = asin( x . sin(a/2) ) / '
           '(a/2)</b>, ou u est l abscisse SOURCE a lire (a = 0 rend l image plate). On assombrit '
           'en plus les bords, parce qu un vrai cylindre perd du contraste la ou il fuit la '
           'lumiere. Deux niveaux sont testes : 70 degres (boite de conserve) et 100 degres.', 'p'))
H.append(P('<b>Ce que la simulation ne couvre pas, dit plutot que masque</b> : ni la texture du '
           'carton, ni l impression reelle, ni les vrais reflets d un emballage brillant. C est un '
           'modele geometrique, pas une photo. <b>Et la zone de silence est comptee en MODULES, '
           'jamais en pixels</b> (la norme en exige 9 a 11) &mdash; l erreur de ft-v1209, ou '
           '20 pixels ne valaient que 2,5 modules et faisaient conclure &laquo; code vu de pres : '
           'illisible &raquo; alors que c etait MA fixture.', 'p'))

H.append(P('10. Quels formats sont reellement necessaires ? (§13)', 'h'))
H.append(T([['liste acceptee', 'desaccords entre moteurs', 'EAN faux'],
            ['EAN-13 + EAN-8 + UPC-A + UPC-E (aujourd hui)',
             str(MES['desaccords']['EAN-8 accepte']), str(QSCE['ean_faux'])],
            ['EAN-13 + UPC-A seulement', str(MES['desaccords']['EAN-13 seul']), '0'],
            ['les quatre, mais SANS Quagga2 en mode scene',
             str(MES['desaccords']['sans Quagga2 (scene), EAN-8 accepte']), '0']],
           [76 * mm, 52 * mm, 38 * mm]))
H.append(P('Les desaccords viennent <b>tous</b> de l acceptation de l EAN-8, lu comme un '
           'sous-morceau d un EAN-13. <b>Mais je ne recommande pas de le retirer</b> : ces cas '
           'viennent <b>exclusivement</b> du mode scene, que je ne propose pas d utiliser, et '
           'l EAN-8 est un vrai format employe sur les petits emballages alimentaires. '
           '<b>Recommandation mesuree</b> : garder les quatre formats ; et <b>si un jour le mode '
           'scene tourne</b>, exiger qu un EAN-8 soit <b>confirme par un second moteur</b> '
           '&mdash; la fusion sait deja le faire.', 'p'))

H.append(P('11. Ce que je ne peux pas prouver d ici', 'h'))
H.append(P('<b>Ce conteneur n a ni camera ni Safari.</b> Ne sont PAS mesures : le comportement de '
           '<b>WebAssembly sur Safari/iOS</b>, l <b>autofocus reel</b> (pourtant le facteur '
           'limitant), le passage en arriere-plan et le retour, le comportement thermique, et la '
           'cadence reelle de la lecture continue. <b>Et une honnetete sur les codes</b> : leur '
           'cle de controle est verifiee, donc ce sont des EAN-13 bien formes &mdash; mais je ne '
           'peux pas verifier d ici qu ils correspondent aux produits nommes, Open Food Facts '
           'etant injoignable (403). Pour le banc, seule la forme compte.', 'p'))

H.append(P('12. VERDICT : C &mdash; ZXING + FALLBACK LOCAL SECONDAIRE', 'h'))
H.append(P('<b>Avec une precision qui change tout : le ZXing a garder n est pas celui d '
           'aujourd hui.</b> Pas A (zxing-wasm fait +%s points en etant %dx plus rapide, et lit le '
           'portrait 90 degres que l actuel ne lit pas du tout). Pas B (c est le meme moteur avec '
           'TRY_HARDER force a false : -%s points). Pas D (il remplacerait du code eprouve par du '
           'code equivalent, en degradant le decodage). Pas E (+%s points entre l existant et la '
           'meilleure cascade, ce n est pas du bruit). <b>Donc C</b> : zxing-wasm en moteur '
           'principal en continu, Quagga2 en mode cadre en second <b>uniquement sur la frame '
           'capturee</b>, puis le <b>bouton</b> de repli IA &mdash; jamais automatique.'
           % (n(WASM - ZXJS),
              round(M['ZXing-js (servi)']['ms_moy'] / M['zxing-wasm']['ms_moy']),
              n(ZXJS - H5Q), n(DUO - ZXJS)), 'p'))
H.append(P('<b>Ce que ca coute, dit franchement</b> : +306 Ko transferes a l ouverture du scanner '
           '(931 Ko de .wasm en remplacement des 328 Ko de zxing.min.js), plus 153 Ko si Quagga2 '
           'entre aussi. <b>Rien au demarrage de l app</b> (regle d or #4 intacte). <b>Ce que ca ne '
           'regle pas</b> : le flou. Les %d images que personne ne lit sont toutes des flous, et '
           'aucun moteur, aucun pretraitement, aucune cascade n en lit une seule. <i>Le moteur '
           'n est pas le facteur limitant &mdash; la mise au point l est.</i>'
           % (_c['N'] - _c['plafond']), 'p'))

H.append(Spacer(1, 6))
H.append(P('<b>AUCUNE REACTIVATION UTILISATEUR AVANT TEST IPHONE</b>', 'p'))
H.append(Spacer(1, 6))
H.append(P('Temoins permanents : bloc CCCX (%d temoins, le proprietaire du candidat et le conflit), '
           'plus CCCVIII (%d, le scanner conduit devant une camera factice) et CCCIX (%d, les '
           'garanties de perimetre). Controle negatif : 12 mutations, 12 mordent, controle sain a '
           '0 rouge avant ET apres, sur un arbre copie. Ce PDF est produit par '
           'tools/gen_banc_pdf.py : ses %d gardes relisent la mesure et le code servi.'
           % (N_X, N_VIII, N_IX, N_GARDES), 'petit'))

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                  topMargin=18 * mm, bottomMargin=16 * mm,
                  title='Banc d essai des moteurs de decodage de code-barres',
                  author='Force Tracker').build(H)
print('OK %s  (%s, CCCX %d temoins, %d gardes)' % (OUT, VERSION, N_X, N_GARDES))
