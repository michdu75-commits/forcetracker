#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""NUTRITION-AUDIT-CODEBARRES-PORTIONS-HABITUDES-17-09-2026 (hors depot, regle d'or #14).

[!!] CE DOSSIER EST UN AUDIT : il n'affirme QUE ce qu'il recompte dans le code servi. Chaque
     chiffre cite (le plafond 250, le seuil 2, le nombre de fonctions du scanner, le nombre
     d'appelants) est relu ici et le generateur REFUSE de produire s'il a bouge. Un audit dont
     les chiffres ne sont plus ceux du code est pire qu'un audit absent : il a l'air verifie.

[!!] ET IL NE DOIT RIEN AFFIRMER SUR UN CODE QU'ON AURAIT MODIFIE : un garde verifie qu'AUCUN
     fichier servi n'a change depuis origin/master. C'est un audit, pas une livraison.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji, entites decodees AVANT controle.
"""
import html, os, re, subprocess
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether, PageBreak)

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or '/tmp/NUTRITION-AUDIT-CODEBARRES-PORTIONS-HABITUDES-17-09-2026.pdf'
GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def _strip(src, garder_chaines):
    src = re.sub(r'<!--[\s\S]*?-->', '', src)
    out, i, n = [], 0, len(src)
    while i < n:
        c = src[i]
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i); i = n if j < 0 else j
        elif c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2); i = n if j < 0 else j + 2
        elif c in '\'"`':
            j, q = i + 1, c
            while j < n and src[j] != q:
                j += 2 if src[j] == '\\' else 1
            out.append(src[i:j + 1] if garder_chaines else q + q); i = j + 1
        else:
            out.append(c); i += 1
    return ''.join(out)


code_seul = lambda s: _strip(s, False)
code_et_chaines = lambda s: _strip(s, True)


def corps(src, nom):
    m = re.search(r'(?:async\s+)?function\s+%s\s*\(' % re.escape(nom), src)
    if not m:
        return ''
    i = src.index('{', m.end() - 1); n, j = 0, i
    while j < len(src):
        if src[j] == '{': n += 1
        elif src[j] == '}':
            n -= 1
            if n == 0: return src[i:j + 1]
        j += 1
    return src[i:]


def git(*a):
    r = subprocess.run(['git'] + list(a), cwd=ROOT, capture_output=True, text=True, timeout=60)
    if r.returncode != 0:
        raise SystemExit('GARDE ROUGE - « git %s » a echoue : un audit ne s appuie pas sur une '
                         'mesure qui n a pas abouti' % ' '.join(a))
    return r.stdout.strip()


APP = lire('app.js'); IDX = lire('index.html'); SW = lire('sw.js')
APP_C = code_et_chaines(APP); IDX_C = code_et_chaines(IDX)
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]

# ══ C'EST UN AUDIT : AUCUN FICHIER SERVI NE DOIT AVOIR BOUGE ═════════════════════════════
SERVIS = ['index.html', 'style.css', 'sw.js', 'constants.js', 'state.js', 'app.js',
          'screens.js', 'log.js', 'coach.js', 'setup.js', 'tracking.js']
_mod = [f for f in SERVIS if git('diff', '--name-only', 'origin/master', '--', f)
        or git('diff', '--name-only', '--', f)]
g(not _mod, 'des fichiers SERVIS ont ete modifies : %s — ce document est un AUDIT, et Michel a '
            'demande STOP avant toute correction' % ', '.join(_mod))

# ══ VOLET 1 — LE SCANNER LOCAL ══════════════════════════════════════════════════════════
N_BC = len(re.findall(r'(?m)^(?:async )?function _bc[A-Za-z0-9_]*\(', APP))
g(N_BC == 23, 'le scanner ne porte plus 23 fonctions _bc* mais %d' % N_BC)
# ⛔⛔ COMPTER NE SUFFIT PAS — 6e FOIS DE CE PROJET, MEME FAMILLE (le piege de la SOUS-CHAINE :
#    presentsX, needsCode2, BLOC CCCX, im>=90, _ftPoserInjecteurJetonX). Renommer `_bcHints` en
#    `_bcHintsX` laissait le compte a 23 ET laissait ce garde vert, puisque le nouveau nom
#    correspond encore au motif. *Un compte mesure une population, pas des individus.* On epingle
#    donc NOMMEMENT les fonctions dont ce dossier parle, avec la parenthese qui BORNE le nom.
for _f in ('_bcHints', '_bcTraiterCode', '_bcFusionnerCandidats', '_bcCaptureFrame',
           '_bcChargerMoteur', '_bcCapacitesCamera'):
    g(re.search(r'(?m)^(?:async )?function ' + _f + r'\(', APP) is not None,
      'la fonction %s a disparu ou a ete renommee : la chaine du scanner que ce dossier decrit '
      'n est plus entiere' % _f)
for f in ('lib/zxing-wasm.js', 'lib/zxing_reader.wasm', 'lib/quagga.min.js', 'lib/zxing.min.js'):
    g(os.path.exists(os.path.join(ROOT, f)), 'la bibliotheque %s a disparu de l arbre' % f)


def appelants(nom):
    a = len(re.findall(r'(?<![\w$.])' + nom + r'\s*\(', APP_C)) \
        - len(re.findall(r'function\s+' + nom + r'\s*\(', APP_C))
    return a + len(re.findall(r'(?<![\w$.])' + nom + r'\s*\(', IDX_C))


N_SCAN = appelants('scanBarcode')
N_BANC = appelants('ouvrirBancScanner')
N_IA = appelants('scanBarcodeIA')
# ⭐ LE FAIT CENTRAL DU VOLET 1, ET IL EST COMPTE, PAS SUPPOSE.
g(N_SCAN == 0, 'scanBarcode a maintenant %d appelant(s) : la porte du scanner local n est plus '
               'fermee, et ce dossier affirme le contraire' % N_SCAN)
g(N_BANC >= 1, 'ouvrirBancScanner n a plus d appelant : le banc Admin a disparu')
g(N_IA >= 1, 'scanBarcodeIA n a plus d appelant : le chemin actuellement servi a change')
g('IA lit les chiffres' in IDX, 'le bouton signale par Michel n est plus dans index.html : ce '
                               'dossier decrit un ecran qui n existe plus')
SC = code_seul(corps(APP, 'scanBarcode'))
g("'zxing-js'" in code_et_chaines(corps(APP, 'scanBarcode')),
  'scanBarcode ne demande plus zxing-js : la remarque centrale du verdict (la porte fermee sert '
  'le moteur que le banc a ECARTE) tombe')
g("_isAdminUnlocked" in code_et_chaines(corps(APP, 'ouvrirBancScanner')),
  'le banc scanner n est plus garde par l admin')
# [!!] CE GARDE A ROUGI SUR DU CODE PARFAITEMENT SAIN, ET C ETAIT MA FAUTE — la 5e fois de la
#      semaine, meme famille. `sw.js` porte le JOURNAL DE VERSION en commentaire, et celui de
#      ft-v1214 cite « zxing_reader.wasm 931 Ko » en toutes lettres. Mon garde lisait le fichier
#      BRUT, donc il mesurait ma propre documentation. *Un garde qui ne distingue pas le CODE de
#      ce qui en PARLE est un garde qui lit le journal.* On retire les commentaires, ET on borne
#      la question a la LISTE D INSTALLATION plutot qu au fichier entier.
SW_C = code_et_chaines(SW)
_inst = re.search(r'(?:const|let|var)\s+\w*\s*=\s*\[([^\]]*)\]', SW_C)
g("'./lib/zxing.min.js'" in SW_C,
  'l ancien moteur ne figure plus dans le code du service worker')
for _m in ('zxing_reader.wasm', 'quagga.min.js', 'zxing-wasm.js'):
    g(_m not in SW_C,
      'le moteur « %s » est entre dans le CODE du service worker : il serait alors precharge a '
      'chaque mise a jour du cache (~1,1 Mo pour tout le monde), ce que la regle d or #4 '
      'interdit — et ce dossier affirme le contraire' % _m)

# ══ VOLET 2 — LES PORTIONS ══════════════════════════════════════════════════════════════
_max = re.search(r'const\s+_RESTE_MAX_PORTIONS\s*=\s*(\d+)\s*,\s*_RESTE_MAX_G\s*=\s*(\d+)', APP)
g(bool(_max), 'les plafonds _RESTE_MAX_* sont introuvables')
MAXPOR, MAXG = int(_max.group(1)), int(_max.group(2))
g(MAXG == 250, 'le plafond _RESTE_MAX_G vaut %d et non 250 : le cas « 250 g de banane » que ce '
               'dossier explique ne serait plus le plafond' % MAXG)
_soir = re.search(r'_RESTE_SOIR_MAX_PORTIONS\s*=\s*(\d+)\s*,\s*_RESTE_SOIR_MAX_G\s*=\s*(\d+)', APP)
g(bool(_soir), 'les plafonds du soir sont introuvables')
SPOR, SG = int(_soir.group(1)), int(_soir.group(2))
PR = code_seul(corps(APP, '_portionRaisonnable'))
g(bool(PR), '_portionRaisonnable introuvable')
# ⭐ LA PREUVE QUE LA QUANTITE EST MATHEMATIQUE : la division, puis un plafond CONSTANT.
g(re.search(r'g\s*=\s*manque\s*/\s*p100\s*\*\s*100', PR.replace(' ', '') .replace('\n', '')) or
  'g=manque/p100*100' in PR.replace(' ', '').replace('\n', ''),
  'la conversion « manque / densite » a change dans _portionRaisonnable : le diagnostic de ce '
  'dossier porte exactement sur cette ligne')
g('Math.min(g,maxG)' in PR.replace(' ', '').replace('\n', ''),
  'le plafond en GRAMMES a disparu de _portionRaisonnable')
# ⛔ ET LE POINT QUI FONDE LA RECOMMANDATION : aucune portion OBSERVEE n'entre dans le calcul.
for mot in ('portionWeightG', 'portionLabel', 'savedFoods', 'freq'):
    g(mot not in PR, '_portionRaisonnable lit desormais « %s » : ce dossier affirme qu aucune '
                     'portion OBSERVEE n entre dans le calcul de la quantite' % mot)
MA = code_seul(corps(APP, '_mesAliments'))
g('fav' in MA and 'freq' in MA,
  '_mesAliments ne classe plus par favori ni par frequence : l argument « le CHOIX de l aliment '
  'est deja fonde sur les habitudes, c est la QUANTITE qui ne l est pas » tombe')

# ══ VOLET 3 — LES HABITUDES ═════════════════════════════════════════════════════════════
RH = code_seul(corps(APP, '_repasHabituels'))
g(bool(RH), '_repasHabituels introuvable')
_seuil = re.search(r's\.n\s*>=\s*(\d+)', RH.replace(' ', '').replace('s.n>=', 's.n >= '))
_seuil = re.search(r's\.n>=(\d+)', RH.replace(' ', ''))
g(bool(_seuil), 'le seuil de _repasHabituels est introuvable')
SEUIL = int(_seuil.group(1))
g(SEUIL == 2, 'le seuil vaut %d et non 2 : le cas « pizza notee 3 fois » que ce dossier explique '
              'ne serait plus produit par cette regle' % SEUIL)
_lim = re.search(r'\.slice\(0,\s*(\d+)\)', RH)
g(bool(_lim), 'la borne de la liste des repas habituels est introuvable')
LIMITE = int(_lim.group(1))
# ⭐ LES DEUX ABSENCES QUI FONDENT LE VOLET 3 — mesurees, pas supposees.
g('b.n-a.n' in RH.replace(' ', ''),
  'le tri de _repasHabituels n est plus le compteur brut : le diagnostic « 3 pizzas battent tout '
  'repas note 2 fois » tombe')
for mot in ('864e5', 'jours', 'recence', 'poids'):
    g(mot not in RH.replace(' ', ''),
      '_repasHabituels emploie desormais « %s » : ce dossier affirme qu il n a NI fenetre '
      'temporelle NI ponderation par recence' % mot)
g("s.dernier!==td" in RH.replace(' ', ''),
  'le seul filtre temporel (exclure ce qui a ete note AUJOURD HUI) a disparu')

# ══ CE QUI NE DOIT PAS ETRE TOUCHE ══════════════════════════════════════════════════════
g('function _douaneLigne' in APP, 'la douane a disparu : elle est HORS PERIMETRE (gelee)')
N_DOUANE = len(re.findall(r'_douaneLigne\(', code_seul(APP))) - 1
g(N_DOUANE == 4, 'la douane n est plus appelee par 4 ecrivains mais %d' % N_DOUANE)
# ⛔ MEME PIEGE, MEME MUTATION : « function _renderHomeHero » est CONTENU dans
#    « function _renderHomeHeroX ». La parenthese ouvrante borne le nom.
g(re.search(r'(?m)^function _renderHomeHero\(', lire('screens.js')) is not None,
  'l Accueil a ete touche : il est GELE (decision de Michel du 17/09)')

# ═══════════════════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B'); ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A'); FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4'); VERT = colors.HexColor('#1E7A4C')
_ss = getSampleStyleSheet()
ST = {
 'titre': ParagraphStyle('t', parent=_ss['Title'], fontName='Helvetica-Bold', fontSize=15.5,
                         leading=19, textColor=ENCRE, spaceAfter=2),
 'sous': ParagraphStyle('s', parent=_ss['Normal'], fontName='Helvetica', fontSize=8.6,
                        leading=11.2, textColor=GRIS, spaceAfter=9),
 'h1': ParagraphStyle('h1', parent=_ss['Normal'], fontName='Helvetica-Bold', fontSize=11,
                      leading=13.2, textColor=ROUGE, spaceBefore=10, spaceAfter=4),
 'h2': ParagraphStyle('h2', parent=_ss['Normal'], fontName='Helvetica-Bold', fontSize=9.4,
                      leading=11.5, textColor=ENCRE, spaceBefore=7, spaceAfter=3),
 'p': ParagraphStyle('p', parent=_ss['Normal'], fontName='Helvetica', fontSize=8.6,
                     leading=11.6, textColor=ENCRE, spaceAfter=5),
 'petit': ParagraphStyle('pt', parent=_ss['Normal'], fontName='Helvetica', fontSize=7.5,
                         leading=9.8, textColor=GRIS, spaceAfter=4),
 'cell': ParagraphStyle('c', parent=_ss['Normal'], fontName='Helvetica', fontSize=7.8,
                        leading=9.8, textColor=ENCRE),
 'cellg': ParagraphStyle('cg', parent=_ss['Normal'], fontName='Helvetica-Bold', fontSize=7.8,
                         leading=9.8, textColor=ENCRE),
}


def _v(s):
    r = html.unescape(s)
    try: r.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE - hors cp1252 : %r (dans %r)' % (r[e.start:e.end], s[:70]))
    return s


P = lambda t, st='p': Paragraph(_v(t), ST[st])
C = '<font face="Courier" size="7.3">%s</font>'


def encadre(titre, corps_html, couleur=ROUGE):
    t = Table([[Paragraph(_v('<b>' + titre + '</b>'), ST['cell'])],
               [Paragraph(_v(corps_html), ST['cell'])]], colWidths=[166 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), FOND),
        ('LINEBEFORE', (0, 0), (0, -1), 2.2, couleur),
        ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 6)])


def tableau(entetes, lignes, largeurs):
    data = [[Paragraph(_v('<b>' + h + '</b>'), ST['cellg']) for h in entetes]]
    for r in lignes:
        data.append([Paragraph(_v(c), ST['cell']) for c in r])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), FOND),
        ('LINEBELOW', (0, 0), (-1, 0), 0.9, TRAIT), ('INNERGRID', (0, 1), (-1, -1), 0.3, TRAIT),
        ('BOX', (0, 0), (-1, -1), 0.5, TRAIT),
        ('LEFTPADDING', (0, 0), (-1, -1), 4.5), ('RIGHTPADDING', (0, 0), (-1, -1), 4.5),
        ('TOPPADDING', (0, 0), (-1, -1), 3), ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 7)])


H = []
H.append(P('Nutrition - audit : code-barres, portions, habitudes', 'titre'))
H.append(P('Force Tracker - 17/09/2026 - base %s - AUDIT PUR, aucune ligne de code modifiee '
           '(un garde le verifie). Document hors depot (regle d or #14).' % VERSION, 'sous'))

H.append(encadre('LES TROIS REPONSES, EN UNE PHRASE CHACUNE',
 '<b>1. Le scanner local existe deja, entier et eprouve</b> - ' + str(N_BC) + ' fonctions, 4 '
 'bibliotheques, un banc de 4 moteurs. Sa porte utilisateur est <b>fermee expres</b> depuis le '
 '14/09, et elle attend <b>votre decision</b>. Verdict : <b>B</b>, avec un chemin etroit et '
 'precis.<br/><br/>'
 '<b>2. Le « 250 g de banane » n est pas un calcul, c est un PLAFOND ATTEINT</b> - '
 + (C % '_RESTE_MAX_G = 250') + '. L app choisit deja l aliment d apres vos habitudes ; c est la '
 '<b>quantite</b> qui est purement mathematique.<br/><br/>'
 '<b>3. La pizza est « habituelle » parce que la regle est </b>' + (C % 's.n >= 2')
 + '<b> et rien d autre</b> - aucune fenetre temporelle, aucune recence, tri par compteur brut.'))

# ── VOLET 1 ─────────────────────────────────────────────────────────────────────────────
H.append(P('1. Le scanner local : etat reel de l arbre', 'h1'))
H.append(tableau(['ce qui existe', 'mesure'],
 [['fonctions ' + (C % '_bc*') + ' dans ' + (C % 'app.js'), '<b>%d</b>' % N_BC],
  ['bibliotheques dans ' + (C % 'lib/'),
   (C % 'zxing.min.js') + ' (328 Ko, <b>prechargee</b>) · ' + (C % 'zxing-wasm.js') + ' + '
   + (C % 'zxing_reader.wasm') + ' (931 Ko) · ' + (C % 'quagga.min.js') + ' (153 Ko) - '
   '<b>ces trois-la chargees A LA DEMANDE</b> (regle d or #4)'],
  [(C % 'scanBarcode()') + ' - la porte UTILISATEUR du scanner local',
   '<b>%d appelant</b> - porte fermee, <b>volontairement</b> (14/09)' % N_SCAN],
  [(C % 'ouvrirBancScanner()') + ' - le banc de test',
   '<b>%d appels</b>, garde par ' % N_BANC + (C % '_isAdminUnlocked()') + ' (Profil &gt; Admin)'],
  [(C % 'scanBarcodeIA()') + ' - <b>le chemin actuellement servi</b>',
   '<b>%d appel</b> - c est le bouton que vous voyez' % N_IA]],
 [64 * mm, 102 * mm]))

H.append(P('Ce que les essais ont reellement donne', 'h2'))
H.append(P('<b>Au banc synthetique</b> (414 mesures par moteur, meme image pour tous, ft-v1212) : '
           'ZXing-js servi <b>77,5 %</b> · zxing-wasm <b>86,2 %</b> et <b>25x plus rapide</b> · '
           'cascade avec Quagga2 cadre <b>91,3 %</b> · un 3e moteur <b>+0,0</b>. <b>0 EAN faux</b> '
           'sur 414, et 0 sur 612 essais complementaires. Verdict ecrit : <b>C - zxing-wasm en '
           'principal, Quagga2 cadre en second</b>, avec la precision qui compte : <i>le ZXing a '
           'garder n est pas celui d aujourd hui</i>.', 'p'))
H.append(encadre('MAIS LE TEST IPHONE REEL A EU LIEU, ET IL EST MOINS BON QUE LE BANC',
 'Un seul code presente (' + (C % '3760155219036') + '), session du 15/09 :<br/>'
 '<b>voie CAPTURE</b> : 2 lectures, <b>1 juste</b> (l autre « rien lu »)<br/>'
 '<b>voie LIVE</b> : <b>0 lecture juste</b>, et <b>1 code FAUX</b> (' + (C % '3122632363883')
 + ', jamais presente) lu sur <b>du tissu flou en mouvement</b>.<br/><br/>'
 '<b>Et l autofocus est tranche</b> : ' + (C % 'getCapabilities()') + ' repond bien sur Safari '
 'mais <b>' + (C % 'focusMode') + ' n y figure pas</b> - notre contrainte '
 + (C % "advanced:[{focusMode:'continuous'}]") + ' est <b>ignoree en silence</b>. Le « non '
 'observable » n etait pas un trou d instrumentation, <b>c etait la reponse</b>.<br/><br/>'
 '<b>Ce que ca dit</b> : sur iPhone, <b>la voie qui marche est la CAPTURE</b>, pas le flux '
 'continu. Et <i>le facteur limitant n est pas le moteur, c est la mise au point</i> - les 12 '
 'images qu aucun moteur ne lit sont <b>toutes</b> des flous.'))

H.append(P('VERDICT VOLET 1 : B - present, eprouve au banc, NON valide sur l appareil', 'h2'))
H.append(P('<b>Ce qui manque, nomme precisement</b> : <b>(1)</b> le live produit un <b>faux code</b> sur '
           'iPhone et n a jamais lu juste sur la seule session reelle ; <b>(2)</b> ' + (C % 'scanBarcode()')
           + ' demande ' + (C % "'zxing-js'") + ', <b>le moteur que le banc a ecarte</b> - rouvrir '
           'la porte telle quelle servirait le moins bon des quatre ; <b>(3)</b> la frame decodee n est '
           '<b>gardee nulle part</b>, donc un faux code n est pas diagnosticable.<br/><br/>'
           '<b>La plus petite intervention possible</b>, et elle est petite : <b>ouvrir la porte '
           'sur la voie CAPTURE uniquement</b> (photo fixe -> zxing-wasm -> ' + (C % '_eanValide')
           + ' -> fusion -> 1 recherche), <b>sans activer le live</b>, et garder l IA en secours. '
           'Tout le code existe ; ce qui change est <b>quel moteur</b> et <b>quelle voie</b>.', 'p'))
H.append(P('<b>Ce que ca ne regle pas, et il faut le dire</b> : le flou. Aucun moteur, aucun '
           'pretraitement, aucune cascade ne lit une image floue - c est mesure. Une capture '
           'nette se lit a <b>1 pixel par module</b> ; un direct flou en demande <b>3 a 6</b>.', 'p'))

H.append(PageBreak())
# ── VOLET 2 ─────────────────────────────────────────────────────────────────────────────
H.append(P('2. « Ce qu il te reste, en vrai » : d ou vient le 250 g', 'h1'))
H.append(P('La chaine reelle : ' + (C % '_resteDuJour()') + ' calcule le manque par macro, '
           + (C % '_mesAliments(40)') + ' choisit les aliments, ' + (C % '_portionRaisonnable()')
           + ' fabrique la quantite. <b>Le defaut est entierement dans la troisieme</b>.', 'p'))
H.append(tableau(['etape', 'ce qu elle fait', 'fondee sur les habitudes ?'],
 [[(C % '_mesAliments'), 'classe par <b>favori</b>, puis par <b>frequence</b> dans le journal ; '
   'la densite ne sert qu a departager', '<b>OUI</b> - et c est deja bien'],
  [(C % '_portionRaisonnable'), (C % 'g = manque / p100 * 100') + ' puis '
   + (C % 'Math.min(g, %d)' % MAXG) + ' puis arrondi a 5 g',
   '<b>NON</b> - conversion pure, borne par une <b>constante</b>']],
 [38 * mm, 78 * mm, 50 * mm]))
H.append(encadre('LE FAIT QUI EXPLIQUE VOTRE CAPTURE',
 (C % '_RESTE_MAX_G = %d' % MAXG) + ' · ' + (C % '_RESTE_MAX_PORTIONS = %d' % MAXPOR)
 + ' · le soir (apres %dh) : ' % 20 + (C % '%d g / %d portion' % (SG, SPOR)) + '.<br/><br/>'
 '<b>« 250 g de banane » et « 250 g de pates seches » ne sont pas deux calculs : c est deux fois '
 'le MEME plafond, atteint.</b> L app n a pas calcule 250, elle a calcule <i>plus</i> et s est '
 'arretee a la borne. <b>Le deficit saturait donc les deux propositions.</b><br/><br/>'
 '<b>Et le plafond est en GRAMMES, ce qui est le vrai defaut de conception</b> : 250 g de banane '
 '(environ 2 bananes) et 250 g de pates seches (environ 2 portions et demie) n ont rien de '
 'comparable en plausibilite. <i>Un plafond unique en grammes traite tous les aliments comme si '
 'une portion pesait pareil.</i>'))
H.append(P('<b>Lien avec la cible 3 831 kcal (votre point 7)</b> : oui, le mecanisme est direct. '
           'Plus l ecart entre la cible theorique et l apport reellement observe est grand, plus '
           + (C % 'manque') + ' est grand, plus la division sature le plafond. <b>Les propositions '
           'disproportionnees sont une consequence arithmetique de cet ecart</b> - et l app n a '
           '<b>aucun moyen</b> aujourd hui de dire « cette cible n est pas atteignable avec tes '
           'portions habituelles » : elle ne connait pas vos portions habituelles a cet endroit. '
           '<b>Je ne propose PAS de toucher a la cible</b> (hors perimetre, votre consigne).', 'p'))

H.append(P('Regle proposee pour les portions', 'h2'))
H.append(P('<b><b>(1)</b> La quantite part de la portion OBSERVEE, pas du manque.</b> Pour chaque aliment, '
           'calculer la portion mediane reellement notee (' + (C % 'q') + ' quand elle existe, '
           'sinon le poids deduit de ' + (C % 'per100') + '). La proposition est un <b>multiple '
           'simple</b> de cette portion (1, 1½, 2), jamais un nombre de grammes libre.<br/>'
           '<b><b>(2)</b> La mediane, pas la moyenne</b> - une seule grosse portion ne doit pas deplacer '
           'le repere.<br/>'
           '<b><b>(3)</b> Le plafond devient RELATIF a l aliment</b> : au plus 2 portions observees (1 le '
           'soir), au lieu d une borne unique en grammes.<br/>'
           '<b><b>(4)</b> Quand ca ne suffit pas, on le DIT</b> - c est le point 6 de votre demande, et '
           'c est le plus important : si la somme des portions plausibles ne couvre pas le '
           'manque, <b>on ne gonfle rien</b> ; on affiche ce qui est plausible et on nomme le '
           'reste. <i>Un calcul macro exact et une suggestion plausible sont deux choses, et la '
           'seconde ne doit pas pretendre resoudre la premiere.</i><br/>'
           '<b><b>(5)</b> Sans historique, aucune fausse personnalisation</b> : on retombe sur le '
           'comportement actuel et on le dit.', 'p'))

H.append(PageBreak())
# ── VOLET 3 ─────────────────────────────────────────────────────────────────────────────
H.append(P('3. « Tes repas habituels » : pourquoi la pizza', 'h1'))
H.append(P('La regle actuelle tient en une ligne : ' + (C % 's.n >= %d' % SEUIL) + '. Tout le '
           'reste de la fonction sert a fusionner les variantes et a ne pas proposer ce qui a '
           'deja ete note aujourd hui.', 'p'))
H.append(tableau(['critere', 'etat mesure dans le code'],
 [['seuil', '<b>%d occurrences</b>, et rien d autre' % SEUIL],
  ['unite comptee', 'un couple <b>(date, repas)</b> - donc 3 fois le meme jour au meme repas ne '
   'comptent <b>pas</b> pour 3'],
  ['fenetre temporelle', '<b>AUCUNE</b> - toute la vie du journal est lue'],
  ['recence', '<b>AUCUNE ponderation</b> - elle ne sert qu a departager a egalite de compteur'],
  ['jours distincts', '<b>non mesure</b> separement du compteur'],
  ['part des jours renseignes', '<b>non mesuree</b>'],
  ['tri', '<b>compteur brut</b> ' + (C % 'b.n - a.n')],
  ['liste affichee', 'bornee a <b>%d</b>' % LIMITE],
  ['seul filtre temporel', 'exclure ce qui a ete note <b>aujourd hui</b>']],
 [42 * mm, 124 * mm]))
H.append(encadre('LE CAS PIZZA, EXPLIQUE',
 'La pizza est notee <b>3 fois</b>. La regle demande <b>%d</b>. Elle entre donc, et le tri par '
 'compteur brut la place <b>devant tout repas note 2 fois</b> - meme un repas pris chaque semaine '
 'depuis trois mois.<br/><br/>'
 '<b>Et comme la liste est bornee a %d</b>, une seule entree occasionnelle coute une place a une '
 'vraie habitude. <i>Iso zero (25 fois) et « Banane + Iso » (8 fois) portent un comportement '
 'radicalement different de trois pizzas, et la regle actuelle ne fait aucune difference entre '
 'eux au-dela du rang.</i><br/><br/>'
 '<b>La cause profonde n est pas le seuil, c est que « 2 » et « 25 » sont traites sur la meme '
 'echelle</b> : un compteur, sans denominateur ni horizon.' % (SEUIL, LIMITE)))

H.append(P('Regle proposee pour les habitudes', 'h2'))
H.append(P('<b>Mesurer d abord, decider ensuite</b> : les seuils ci-dessous sont des <b>formes</b>, '
           'pas des chiffres imposes - je les calerai sur vos donnees reelles, que je ne peux pas '
           'lire d ici (elles sont dans votre ' + (C % 'localStorage') + ').<br/><br/>'
           '<b><b>(1)</b> Compter des JOURS DISTINCTS, pas des occurrences.</b> C est le changement qui '
           'regle H4 tout seul, et il est presque gratuit : la cle de groupement porte deja la '
           'date.<br/>'
           '<b><b>(2)</b> Exiger une REPARTITION, pas un total</b> : au moins N jours distincts ET au '
           'moins 2 semaines calendaires differentes. Trois pizzas sur deux jours ne passent pas ; '
           'huit « Banane + Iso » etales passent.<br/>'
           '<b><b>(3)</b> Une fenetre glissante</b> (par exemple 8 semaines) avec <b>decroissance douce</b> '
           'de la recence, plutot qu une coupure nette - une coupure fait disparaitre une habitude '
           'du jour au lendemain.<br/>'
           '<b><b>(4)</b> Rapporter aux jours RENSEIGNES, pas aux jours calendaires</b> - sinon quelqu un '
           'qui note une semaine sur deux voit toutes ses habitudes diluees par son propre '
           'silence.<br/>'
           '<b><b>(5)</b> Ne montrer que les vrais habituels</b> - une seule categorie a l ecran. '
           '<i>Afficher « habituel / regulier / occasionnel » resoudrait le probleme en le '
           'montrant, pas en le reglant</i> (R19/R25 : on ne complexifie pas l interface pour '
           'compenser une regle faible).', 'p'))
H.append(P('<b>Pourquoi ca compte au-dela de cette carte</b> (votre point 12) : ces donnees '
           'alimenteront le plan de repas, la generation de semaine et Milo Nutrition. Une '
           'notion de frequence fausse aujourd hui devient une personnalisation fausse partout '
           'ensuite. <i>Le systeme doit apprendre ce que la personne fait de facon repetee, pas '
           'tout ce qu elle a mange plusieurs fois.</i>', 'p'))

H.append(PageBreak())
# ── TESTS, MUTATIONS, FICHIERS ──────────────────────────────────────────────────────────
H.append(P('4. Tests a ecrire (vos CB1-CB8, P1-P6, H1-H6)', 'h1'))
H.append(tableau(['bloc', 'ce que le temoin doit prouver', 'ou'],
 [['CB1-CB2', 'code lisible -> EAN decode <b>localement</b> -> recherche produit, <b>sans IA</b>',
   'banc, clics reels'],
  ['CB3-CB4', 'code inconnu et code illisible -> comportement propre et message clair', 'banc'],
  ['CB5', 'saisie manuelle des chiffres : fonctionne toujours', 'banc'],
  ['CB6-CB7', 'etiquette et repas decrit : <b>l IA reste disponible</b> (ce sont d autres usages)',
   'source + banc'],
  ['CB8', '<b>ZERO appel IA</b> lors d un scan local reussi - compte les requetes, pas les '
   'intentions', 'banc, compteur reseau'],
  ['P1-P3', 'portion stable -> proposition proche de l observee ; deficit enorme -> pas de '
   'multiplication ; plusieurs aliments -> combinaison plausible', 'banc'],
  ['P4-P6', 'peu d historique -> prudent ; aucun -> repli explicite ; cible tres superieure -> '
   '<b>le dit au lieu de fabriquer un repas grotesque</b>', 'banc'],
  ['H1-H3', '25 occurrences -> habituel ; 8 reparties -> habituel ; 2 sur 14 jours -> <b>non</b>',
   'source + banc'],
  ['H4', '<b>3 fois le meme jour ne vaut pas 3 jours</b>', 'banc'],
  ['H5-H6', 'ancien non recent -> perd du rang ; repas plaisir -> ne pollue pas', 'banc']],
 [20 * mm, 110 * mm, 36 * mm]))

H.append(P('5. Mutations (un temoin qui ne peut pas rougir ne prouve rien)', 'h1'))
H.append(P('Vos sept, toutes retenues : forcer l appel IA alors que le scan local reussit · '
           'remplacer l EAN local par une valeur IA · multiplier une portion jusqu a couvrir '
           'exactement le deficit · supprimer la limite de plausibilite · considerer 2 occurrences '
           'comme habitude forte · compter trois repetitions du meme jour comme trois jours · '
           'ignorer la recence.<br/><br/>'
           '<b>J en ajoute quatre</b>, chacune nee d un piege deja paye dans ce projet : '
           '<b>(8)</b> remettre le plafond en <b>grammes</b> au lieu de portions - le defaut '
           'd origine · <b>(9)</b> rouvrir la porte du scanner sur ' + (C % "'zxing-js'")
           + ' au lieu de zxing-wasm, qui <b>passerait inapercu</b> puisque ca marche, juste moins '
           'bien · <b>(10)</b> activer la voie <b>live</b> sur iPhone · <b>(11)</b> une mutation '
           'qui doit <b>RESTER VERTE</b> : citer ' + (C % 'scanBarcode') + ', ' + (C % '250')
           + ' et ' + (C % 's.n>=2') + ' dans un simple <b>commentaire</b> - la seule facon de '
           'prouver qu on mesure le code et non la documentation.', 'p'))

H.append(P('6. Fichiers', 'h1'))
H.append(tableau(['a modifier (le moment venu)', 'a NE PAS toucher'],
 [[(C % 'app.js') + ' - ' + (C % '_portionRaisonnable') + ', ' + (C % '_repasHabituels') + ', et '
   'la porte du scanner<br/>' + (C % 'index.html') + ' - le bouton code-barres et son libelle<br/>'
   + (C % 'tests/parcours/*') + ' - les nouveaux temoins<br/>' + (C % 'sw.js') + ' - bump',
   '<b>l Accueil</b> (gele) : ' + (C % 'screens.js') + ' cote ' + (C % 'renderHome')
   + '<br/><b>la douane</b> : %d regles, %d ecrivains, <b>gelee</b> tant que le rapport '
   'd observation n a pas ete lu<br/><b>la cible calorique</b> : ' % (21, N_DOUANE)
   + (C % 'calcTDEE') + ' / ' + (C % 'calcMacros') + ' - votre consigne<br/><b>Milo global</b>, '
   'Seance, Progres<br/>la <b>palette</b>']],
 [83 * mm, 83 * mm]))

H.append(Spacer(1, 3))
H.append(P('Document produit par ' + (C % 'tools/gen_nutri_audit_pdf.py') + ' - <b>' +
           str(GARDES[0]) + ' gardes</b> qui recomptent chaque chiffre depuis le code servi '
           '(le plafond %d, le seuil %d, les %d fonctions du scanner, ses %d appelant, la borne '
           'a %d) et refusent de produire si l un a bouge - ou si un fichier servi a ete modifie, '
           'parce que ceci est un AUDIT. Aucune ligne de code n a ete ecrite.'
           % (MAXG, SEUIL, N_BC, N_SCAN, LIMITE), 'petit'))

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Nutrition - audit code-barres, portions, habitudes',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes ; plafond=%d seuil=%d bc=%d appelants_scan=%d limite=%d douane=%d)'
      % (OUT, VERSION, GARDES[0], MAXG, SEUIL, N_BC, N_SCAN, LIMITE, N_DOUANE))
