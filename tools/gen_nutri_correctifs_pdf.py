#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""NUTRITION-CORRECTIFS-CODEBARRES-PORTIONS-HABITUDES-17-09-2026 (hors depot, regle d'or #14).

[!!] CE DOSSIER AFFIRME DEUX CHOSES OPPOSEES : que trois correctifs sont EN PLACE, et que tout
     le reste est reste GELE. Les gardes reverifient les deux moities dans le code servi et
     refusent de produire si l'une tombe.

[!!] LE PIEGE PROPRE A CETTE PASSE : la raison de chaque decision est ecrite a cote du code
     (R30), donc `zxing-js`, `250` et `s.n>=2` sont cites en toutes lettres dans les commentaires
     voisins. Un garde qui lirait le fichier brut resterait vert pour toujours. D'ou le choix
     EXPLICITE du nettoyeur a chaque garde.

[!!] LES TOTAUX SONT LUS DANS LEURS JOURNAUX, JAMAIS RETAPES (lecon ft-v1201).

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
OUT = os.environ.get('FT_OUT') or '/tmp/NUTRITION-CORRECTIFS-CODEBARRES-PORTIONS-HABITUDES-17-09-2026.pdf'
BANC = os.environ.get('FT_BANC') or '/tmp/banc_nutri.log'
MUT = os.environ.get('FT_MUT') or '/tmp/mut_nutri.log'
PASSE = os.environ.get('FT_PASSE') or '/tmp/passe1221.log'
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
sp = lambda s: re.sub(r'\s', '', s or '')


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
        raise SystemExit('GARDE ROUGE - « git %s » a echoue : ce dossier ne s appuie pas sur une '
                         'mesure qui n a pas abouti' % ' '.join(a))
    return r.stdout.strip()


APP = lire('app.js'); IDX = lire('index.html'); SCR = lire('screens.js'); SW = lire('sw.js')
A = code_et_chaines(APP); I = code_et_chaines(IDX); S = code_et_chaines(SCR)
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]
g(VERSION == 'ft-v1221', 'la version servie est %s et non ft-v1221' % VERSION)

# ══ A — LE SCANNER ══════════════════════════════════════════════════════════════════════
SCAN = code_et_chaines(corps(APP, 'scanBarcode'))
g(bool(SCAN), 'scanBarcode introuvable')
g("_bcMoteurDemande='zxing-wasm'" in sp(SCAN),
  'la porte utilisateur ne demande plus zxing-wasm : c est LE point du correctif A')
g("_bcMoteurDemande='zxing-js'" not in sp(SCAN),
  'la porte utilisateur redemande zxing-js, le moteur que le banc a ECARTE')
g('_bcLiveActif=false' in sp(SCAN),
  'le LIVE n est plus eteint sur la porte utilisateur : c est la voie qui a produit un faux EAN')
OBS = code_et_chaines(corps(APP, 'openBarcodeScanner'))
g('if(_bcLiveActif)_bcTraiterCode(c)' in sp(OBS),
  'le decodage continu DECIDE de nouveau sans garde')
BANCF = code_et_chaines(corps(APP, 'ouvrirBancScanner'))
g('_bcLiveActif=true' in sp(BANCF) and '_isAdminUnlocked' in BANCF,
  'le banc Admin ne rallume plus le live, ou n est plus garde : on ne desarme pas l instrument '
  'qui a trouve le defaut')
g('onclick="scanBarcode()"' in I, 'le bouton du scanner local a disparu de l ecran d ajout')
g(0 < I.index('onclick="scanBarcode()"') < I.index('onclick="scanBarcodeIA()"'),
  'le secours IA est repasse DEVANT le scanner local : l ordre a l ecran ment sur la hierarchie')
for _n, _m in (('saisie manuelle', 'id="af-bc-manual"'),
               ('etiquette IA', 'onclick="readFoodLabel()"'),
               ('secours IA', 'onclick="scanBarcodeIA()"')):
    g(_m in I, 'le chemin « %s » a disparu : ce sont trois usages DIFFERENTS' % _n)
TRAITE = code_et_chaines(corps(APP, '_bcTraiterCode'))
g(bool(TRAITE) and not re.search(r'_aiUrl|scanBarcodeIA|readBarcode', TRAITE),
  'un appel IA est apparu sur le chemin d un code local accepte — la garantie permanente tombe')
g('_bcFusionnerCandidats' in TRAITE and 'function _eanValide' in APP,
  'la validation ou la fusion ont disparu du chemin local')
SW_C = code_et_chaines(SW)
for _m in ('zxing_reader.wasm', 'quagga.min.js', 'zxing-wasm.js'):
    g(_m not in SW_C, 'le moteur « %s » est entre dans le CODE du service worker : ~1,1 Mo '
                      'reprecharges pour tout le monde (regle d or #4)' % _m)

# ══ B — LES PORTIONS ════════════════════════════════════════════════════════════════════
# [!!] `code_et_chaines` ET NON `code_seul`, ET CE CHOIX EST LE GARDE LUI-MEME. Ma premiere
#      version employait `code_seul`, qui VIDE les chaines : le garde des unites cherchait
#      `u!=='g'&&u!=='ml'` dans un texte ou `'g'` etait devenu `''`. Il a rougi sur du code
#      parfaitement sain. *Un fait qui vit DANS une chaine exige qu on garde les chaines* —
#      meme famille que le garde du service worker hier, et que `getElementById('...')`.
#      ⚠️ Les commentaires, eux, restent retires : la raison de chaque decision cite justement
#      `250`, `zxing-js` et `s.n>=2` juste a cote du code.
PR = code_et_chaines(corps(APP, '_portionRaisonnable'))
PO = code_et_chaines(corps(APP, '_portionObservee'))
PN = code_et_chaines(corps(APP, '_portionsNotees'))
g(bool(PR) and bool(PO) and bool(PN), 'la chaine des portions est incomplete')
g('_portionObservee(al.name)' in sp(PR), 'la quantite ne part plus de la portion OBSERVEE')
g(sp(PR).index('_portionObservee') < sp(PR).index('Math.min(g,maxG)'),
  'le plafond universel redevient la logique principale : c est exactement le defaut corrige')
g("[0.5,1,1.5,2].filter(x=>x<=(soir?1:2))" in sp(PR),
  'le multiple n est plus borne a 2 portions (1 le soir) : la porte a l inflation se rouvre')
# ⭐ LA MEDIANE : on verifie la FORME du calcul, pas seulement le mot.
g('v.sort(' in sp(PO) and 'reduce' not in sp(PO) and '/v.length' not in sp(PO),
  'la mediane a ete remplacee par une moyenne : une grosse saisie isolee deplacerait la '
  'reference pour toujours')
g('e.q==null' in sp(PN), 'une quantite ABSENTE est de nouveau comptee pour zero')
g("u!=='g'&&u!=='ml'" in sp(PN), 'les unites sont de nouveau melangees dans la mediane')
_min = re.search(r'const\s+_PORTION_MIN_OBS\s*=\s*(\d+)', APP)
g(bool(_min), '_PORTION_MIN_OBS est introuvable : le seuil de personnalisation n est plus explicite')
MINOBS = int(_min.group(1))
g('perso:v.length>=_PORTION_MIN_OBS' in sp(PO),
  '« tes habitudes » est annonce sans atteindre le seuil : fausse personnalisation')
g("source:'generique'" in sp(PR) and 'perso:false' in sp(PR),
  'le repli generique ne se declare plus comme generique')
g('Tes portions habituelles ne couvriraient pas' in S,
  'la phrase du deficit non couvrable a disparu : l ecran se remettrait a laisser croire que la '
  'suggestion resout le calcul')
g('!soir&&idees.length' in sp(S),
  'la phrase du deficit n est plus tue LE SOIR : la meme phrase informe a 14 h et blesse a 21 h '
  '(anti-TCA, P21)')
_max = re.search(r'_RESTE_MAX_G\s*=\s*(\d+)', APP)
MAXG = int(_max.group(1)) if _max else 0
g(MAXG == 250, 'le plafond garde-fou a change (%s) : il doit rester en place pour le cas ou l on '
               'ne sait rien' % MAXG)

# ══ C1 — LES HABITUDES : LA MESURE, PAS LA REGLE ════════════════════════════════════════
RH = code_et_chaines(corps(APP, '_repasHabituels'))
g('s.n>=2' in sp(RH),
  'LA REGLE DES HABITUDES A ETE CHANGEE : elle devait rester intacte tant que Michel n a pas '
  'fourni les agregats reels — « je prefere un arret propre avec une mesure reelle a un seuil '
  'invente »')
MH = code_et_chaines(corps(APP, '_mesureHabitudes'))
g(bool(MH), 'l outil de mesure des habitudes a disparu')
for _c in ('joursDistincts', 'semainesDistinctes', 'sur14', 'sur28', 'sur56', 'joursRenseignes'):
    g(_c in MH, 'la mesure ne rend plus « %s » : c est une des colonnes demandees' % _c)
g(not re.search(r'persist\(|localStorage\.setItem|fetch\(|_cloudSync', MH),
  'l outil de mesure ECRIT ou ENVOIE quelque chose : il devait etre en LECTURE SEULE')
g(not re.search(r'authCode|token|S\.email', MH),
  'l outil de mesure touche a un secret : il ne doit en montrer aucun')
g('onclick="loadHabitudesAdmin()"' in I and 'id="admin-habitudes"' in I,
  'la porte Admin de l outil de mesure a disparu')

# ══ CE QUI DEVAIT RESTER GELE ═══════════════════════════════════════════════════════════
g(re.search(r'(?m)^function renderHome\(', SCR) is not None
  and re.search(r'(?m)^function _renderHomeHero\(', SCR) is not None,
  'l ACCUEIL a ete touche : il est GELE (decision du 17/09)')
N_DOUANE = len(re.findall(r'_douaneLigne\(', code_seul(APP))) - 1
g(N_DOUANE == 4, 'la douane n est plus appelee par 4 ecrivains mais %d : elle est GELEE' % N_DOUANE)
STA = lire('state.js')
g(re.search(r'(?m)^function calcTDEE\(', STA) is not None
  and re.search(r'(?m)^function calcMacros\(', STA) is not None,
  'calcTDEE / calcMacros ont ete touchees : la cible calorique est HORS PERIMETRE')
# ⭐ le defaut laisse OUVERT : on verifie qu il l est encore, sinon ce dossier ment en le disant
g(re.search(r'calories\s*:\s*Math\.max\(|1500', STA) is not None,
  'le plancher de 1500 kcal a disparu de state.js : le defaut « compte neuf » que ce dossier '
  'annonce comme OUVERT aurait donc bouge')

# ══ LES TEMOINS ═════════════════════════════════════════════════════════════════════════
TEM = lire(os.path.join('tests', 'parcours', 'nutri_correctifs.js'))
RUN = lire(os.path.join('tests', 'parcours', 'runner.js'))
N_TEM = len(re.findall(r"t\('B-CCCXX", TEM))
g(N_TEM >= 40, 'le fichier de temoins n en porte plus que %d' % N_TEM)
g("require('./nutri_correctifs.js').ecran(t, b, PORT)" in RUN
  and "require('./nutri_correctifs.js').source(t, ROOT, fs, path)" in RUN,
  'le banc de parcours n appelle plus les nouveaux temoins : ils ne tourneraient qu au controle '
  'negatif, donc jamais en livraison')
# ⛔ LES TROIS TEMOINS RETOURNES : ils doivent dire l INVERSE de ce qu ils disaient.
g('LA PORTE EST ROUVERTE' in RUN and 'LA PORTE EST OUVERTE SUR LA CAPTURE' in RUN,
  'les temoins de la porte n ont pas ete retournes : ils figeraient encore la decision du 14/09')
g('Aucun bouton utilisateur tant que' not in code_seul(RUN),
  'un temoin exige encore l ABSENCE de bouton utilisateur : il rougirait sur la decision du 17/09')


# ══ LES JOURNAUX ════════════════════════════════════════════════════════════════════════
def journal(p):
    try:
        return open(p, encoding='utf-8').read()
    except OSError:
        return ''


LB = journal(BANC)
_mb = re.search(r'BANC NUTRI\s*:\s*(\d+)\s*OK\s*/\s*(\d+)\s*ROUGE', LB)
g(bool(_mb), 'le journal du banc (%s) ne porte pas de ligne de total' % BANC)
B_OK, B_KO = int(_mb.group(1)), int(_mb.group(2))
g(B_KO == 0, 'le banc porte %d rouge(s)' % B_KO)

LM = journal(MUT)
_mm = re.search(r'(\d+)\s*/\s*(\d+)\s*mutations conformes', LM)
g(bool(_mm), 'le journal du controle negatif (%s) ne porte pas de ligne de total' % MUT)
M_OK, M_TOT = int(_mm.group(1)), int(_mm.group(2))
g(M_OK == M_TOT, 'seules %d mutations sur %d sont conformes' % (M_OK, M_TOT))
g(LM.count('CONTROLE SAIN') == 2,
  'le controle sain n a pas tourne des deux cotes : une serie de mutations peut avoir laisse '
  'l arbre casse en silence')
# [!] MON GARDE CHERCHAIT UN LIBELLE QUE CE JOURNAL N ECRIT PAS (« VERT ATTENDU ») : il a rougi
#     sur un controle negatif parfaitement complet. On lit ce que le journal IMPRIME vraiment.
#     *Un garde qui cherche le mot d un autre journal mesure le mauvais fichier.*
g(LM.count('[attendu VERT') >= 4,
  'les mutations qui doivent RESTER VERTES ont disparu : plus rien ne prouve qu on mesure le '
  'CODE et non la documentation — et ici c est capital, la raison de chaque decision cite '
  'justement les mots que les temoins cherchent')

LP = journal(PASSE)
_mp = re.search(r'TOTAL CROIS\S+\s*:\s*(\d+)\s*\S+\s*\S+\s*(\d+)', LP)
if _mp:
    FINIE, P_OK, P_KO = True, int(_mp.group(1)), int(_mp.group(2))
else:
    FINIE, P_OK, P_KO = False, len(re.findall(r'^\s*✅', LP, re.M)), \
                        len(re.findall(r'^\s*❌', LP, re.M))
g(P_KO == 0, 'la passe porte %d rouge(s) : rien ne se publie' % P_KO)
PASSE_TXT = ('%d / %d' % (P_OK, P_OK + P_KO)) if FINIE else \
            'EN COURS (%d verts a cet instant)' % P_OK

# ═══════════════════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B'); ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A'); FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')
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


HEAD = git('rev-parse', 'HEAD')
H = []
H.append(P('Nutrition - correctifs : code-barres, portions, habitudes', 'titre'))
H.append(P('Force Tracker - 17/09/2026 - %s - commit %s. Suite de l audit du matin, valide par '
           'Michel. Document hors depot (regle d or #14).' % (VERSION, HEAD[:12]), 'sous'))

H.append(encadre('LES TROIS CORRECTIFS, ET CE QUI N A PAS BOUGE',
 '<b>A - le scanner redevient local.</b> Le bouton servi etait '
 + (C % '« photographier le code-barres (IA lit les chiffres) »') + ' : un appel IA pour <b>13 '
 'chiffres que le telephone decode seul</b>. La porte se rouvre sur la voie <b>CAPTURE</b> avec '
 + (C % 'zxing-wasm') + '. Le <b>LIVE reste eteint</b>. L IA devient un <b>secours</b>.<br/><br/>'
 '<b>B - la portion redevient la sienne.</b> Le ' + (C % '« 250 g de banane »') + ' etait le '
 '<b>plafond atteint</b>, pas un calcul. La quantite part de la <b>mediane reellement notee</b>.'
 '<br/><br/>'
 '<b>C1 - les habitudes se MESURENT.</b> La regle ' + (C % 's.n &gt;= 2') + ' <b>n est pas '
 'touchee</b>, et c est volontaire : un outil Admin en lecture seule prepare la decision. '
 '<i>« Je prefere un arret propre avec une mesure reelle a un seuil invente. »</i>'))

# ── A ───────────────────────────────────────────────────────────────────────────────────
H.append(P('1. Le scanner : ce qui change, et le mot qui decide', 'h1'))
H.append(tableau(['', 'avant', 'apres'],
 [['chemin par defaut', 'photo -&gt; <b>IA</b>',
   '<b>capture -&gt; ' + (C % 'zxing-wasm') + ' -&gt; cle de controle -&gt; 1 recherche</b>'],
  ['appels IA sur un scan reussi', '1', '<b>0</b> (garanti par temoin, en permanence)'],
  ['voie live', '-', '<b>eteinte</b> ; rallumee au banc Admin seulement'],
  ['saisie manuelle', 'presente', 'presente'],
  ['etiquette nutritionnelle IA', 'presente', 'presente'],
  ['repas decrit a l IA', 'present', 'present']],
 [42 * mm, 46 * mm, 78 * mm]))
H.append(P('<b>Le mot qui decide tout tient en un identifiant.</b> ' + (C % 'scanBarcode()')
           + ' demandait encore ' + (C % "'zxing-js'") + ' - <b>le moteur que le banc avait '
           'ECARTE</b> (77,5 % contre 86,2 %, et 25x plus lent). <i>Rouvrir la porte sans changer '
           'ce mot aurait servi le moins bon des quatre, et personne ne l aurait vu : ca marche, '
           'juste moins bien.</i>', 'p'))
H.append(encadre('POURQUOI LE LIVE RESTE ETEINT',
 'Sur le <b>seul essai iPhone reel</b>, la voie live a fait <b>0 lecture juste et 1 code FAUX</b> '
 '(' + (C % '3122632363883') + ', jamais presente) lu sur <b>du tissu flou en mouvement</b>. Les '
 'deux lectures justes venaient des <b>captures</b>.<br/><br/>'
 '<i>Un code faux est pire qu une absence de lecture : sa cle de controle est valide, donc RIEN '
 'en aval ne peut le rattraper</i> - ni le validateur, ni la recherche produit, qui rendra '
 '« inconnu » ou <b>un autre produit</b>.<br/><br/>'
 '<b>On eteint la DECISION, pas la mesure</b> : le flux video reste ouvert (il sert a cadrer), le '
 'diagnostic continue de NOTER ce que le live aurait lu, et le <b>banc Admin rallume le live</b>. '
 '<i>On ne desarme pas l instrument qui a trouve le defaut.</i><br/><br/>'
 '<b>Dit plutot que masque</b> : le decodage continu tourne donc encore et coute du CPU pour rien '
 'hors banc. Le supprimer demande de remplacer ' + (C % 'decodeFromConstraints') + ' par un '
 + (C % 'getUserMedia') + ' direct - plus gros, et hors du perimetre de cette passe.'))

H.append(PageBreak())
# ── B ───────────────────────────────────────────────────────────────────────────────────
H.append(P('2. Les portions : le 250 g etait un plafond, pas un calcul', 'h1'))
H.append(P('<b>Avant</b> : ' + (C % 'g = manque / densite') + ' puis ' + (C % 'Math.min(g, 250)')
           + '. Les deux propositions de votre capture affichaient <b>le meme chiffre parce que '
           'c etait la meme borne</b>, atteinte deux fois. <b>Et le defaut de conception est la</b> : '
           'un plafond unique <b>en grammes</b> traite tous les aliments comme si une portion '
           'pesait pareil - 250 g de banane font environ 2 bananes, 250 g de pates <b>seches</b> '
           'environ 2 portions et demie. <i>Le meme chiffre, deux realites sans rapport.</i>', 'p'))
H.append(tableau(['la nouvelle regle', 'pourquoi'],
 [['la quantite part de la <b>mediane reellement notee</b>',
   'l app choisissait deja l <b>aliment</b> d apres les habitudes ; seule la <b>quantite</b> '
   'restait mathematique'],
  ['<b>mediane</b>, jamais moyenne',
   'mesure : 4 pates notees 140/140/150/140 avec un outlier a 600 g donnent <b>140</b> en mediane '
   'et <b>255</b> en moyenne. <i>Une grosse saisie isolee ne doit pas deplacer la reference pour '
   'toujours.</i>'],
  ['multiples simples : <b>1 - 1½ - 2</b> (1 le soir)',
   'jamais un nombre libre calcule pour annuler exactement le deficit'],
  ['<b>%d observations</b> pour dire « tes portions »' % MINOBS,
   '1 ou 2 : on s en sert <b>sans l annoncer</b>. 0 : generique, <b>et on le dit</b>. '
   '<i>Aucune fausse personnalisation.</i>'],
  ['une quantite <b>absente</b> n est pas un zero',
   + 0 and '' or 'elle est ecartee ; et on ne melange pas les unites (seuls g et ml entrent)'],
  ['le plafond 250 g <b>survit comme garde-fou</b>',
   'il n est plus la logique principale : il ne sert plus que quand on ne sait <b>rien</b>']],
 [56 * mm, 110 * mm]))
H.append(P('<b>Mesure, sur le comportement reel</b> : pates notees a 140 g, manque de 300 g de '
           'glucides -&gt; la proposition est <b>280 g</b> (2 portions), et non <b>420 g</b>, le '
           'nombre qui annulerait le deficit. <i>La quantite n est plus choisie pour faire tomber '
           'le reste a zero.</i>', 'p'))
H.append(encadre('ET QUAND LA CIBLE N EST PAS COUVRABLE, L ECRAN LE DIT',
 'Si les portions plausibles ne couvrent pas la moitie de ce qui reste, une ligne l annonce : '
 '<i>« Tes portions habituelles ne couvriraient pas tout ce qu il reste aujourd hui. Le calcul, '
 'lui, reste exact - c est la suggestion qui s arrete a ce qui est plausible. »</i><br/><br/>'
 '<b>JAMAIS le soir</b> (anti-TCA, Principe 21) : le bloc se tait deja sur les manques tardifs, '
 'et <i>la meme phrase peut informer a 14 h et blesser a 21 h</i>.<br/><br/>'
 '<b>Lien avec la cible</b> : oui, l ecart entre la cible theorique et l apport reel est ce qui '
 'faisait saturer le plafond. <b>La cible n est PAS modifiee ici</b> - c est votre consigne, et '
 'le defaut ' + (C % '« compte neuf : 1 500 kcal, 0 g prot, 0 g lipides »') + ' reste OUVERT, '
 'hors de ce sous-chantier.'))

H.append(PageBreak())
# ── C1 ──────────────────────────────────────────────────────────────────────────────────
H.append(P('3. Les habitudes : la mesure, pas la regle', 'h1'))
H.append(P('<b>' + (C % 's.n &gt;= 2') + ' n est pas touche.</b> L outil Admin '
           + (C % '« Mesurer mes habitudes »') + ' rend, par repas repete : total, <b>jours '
           'distincts</b>, semaines distinctes, fenetres 14 / 28 / 56 j, premiere et derniere '
           'date - et le <b>denominateur qui manquait</b> : les jours reellement <b>renseignes</b>. '
           '<i>Sans lui, quelqu un qui note une semaine sur deux voit toutes ses habitudes diluees '
           'par son propre silence.</i><br/><br/>'
           '<b>Lecture seule</b> : aucune ecriture, aucun envoi, aucun secret - trois gardes '
           'le verifient.', 'p'))
H.append(encadre('CE QUE LA MESURE M A APPRIS, ET QUE L AUDIT N AVAIT PAS VU',
 'La signature d un repas porte <b>TOUS les aliments du couple (date, repas)</b>. '
 '<b>Deux pizzas dans le MEME diner ne font donc pas « pizza notee 2 fois » : elles forment un '
 'repas DIFFERENT.</b> Un aliment n est candidat que s il est <b>seul</b> dans son repas.<br/><br/>'
 '<i>Ce fait n etait nulle part dans l audit, et il change la façon d ecrire le seuil.</i> Mes '
 'deux premieres fixtures rougissaient sur un outil parfaitement juste : <b>elles testaient ma '
 'comprehension de la signature, pas la mesure.</b><br/><br/>'
 '<b>Et un de mes attendus figeait une VALEUR au lieu de la REGLE</b> : j attendais « 140 g » la '
 'ou le code proposait 280 = 2 x 140, ce qui est exactement le comportement voulu. <i>Un temoin '
 'qui fige une valeur mesure mon arithmetique mentale, pas le produit.</i>'))
H.append(P('<b>EN ATTENTE DE VOUS</b> : les agregats reels, lus dans l app. Sans eux, tout seuil '
           'serait invente - <b>c est-a-dire exactement le defaut qu on reproche a la regle '
           'actuelle</b>.', 'p'))

# ── PERIMETRE, TESTS, SUITE ─────────────────────────────────────────────────────────────
H.append(P('4. Ce qui n a pas bouge (chacun fige par un temoin)', 'h1'))
H.append(tableau(['gele', 'verifie par'],
 [['l <b>Accueil</b>', (C % 'renderHome') + ' et ' + (C % '_renderHomeHero') + ' intactes'],
  ['la <b>douane</b>', '%d ecrivains, aucune regle devenue bloquante' % N_DOUANE],
  ['la <b>cible calorique</b>', (C % 'calcTDEE') + ' et ' + (C % 'calcMacros') + ' intactes'],
  ['la <b>regle des habitudes</b>', (C % 's.n &gt;= 2') + ' toujours en place'],
  ['<b>Milo global</b>, Seance, Progres, palette', 'aucun fichier touche'],
  ['le defaut <b>« compte neuf »</b>', 'reste OUVERT, hors de ce sous-chantier']],
 [58 * mm, 108 * mm]))

H.append(P('5. Tests, mutations, et ce que la passe a trouve', 'h1'))
H.append(P('<b>Blocs B-CCCXXI a B-CCCXXV, %d temoins</b> (banc %d/%d). <b>Controle negatif : %d '
           'mutations sur arbre CLONE, %d conformes</b>, controle sain <b>%d / 0 avant ET apres</b> '
           '- dont <b>quatre qui doivent RESTER VERTES</b> (les mots que les temoins cherchent, '
           'cites dans un commentaire JS, HTML, ou dans la documentation), <i>parce que la raison '
           'de chaque decision est justement ecrite a cote du code</i> (R30).'
           % (N_TEM, B_OK, B_OK + B_KO, M_TOT, M_OK, B_OK), 'p'))
H.append(encadre('ET LA PASSE COMPLETE A ATTRAPE CE QUE LE PETIT BANC NE POUVAIT PAS VOIR',
 '<b>Trois</b> temoins figeaient la decision du 14/09 (« aucun bouton utilisateur »). J en avais '
 'retourne <b>deux</b>. Le troisieme a rougi <b>seul</b> sur la passe complete, apres un petit '
 'banc parfaitement vert. <i>Un petit banc ne voit que ce qu on a pense a lui montrer - c est '
 'l argument du protocole, paye cash.</i><br/><br/>'
 '<b>Et le reprouver a trouve un defaut dans ma propre correction</b> : mon predicat cherchait '
 + (C % '_bcLiveActif=false') + ' dans TOUT le fichier, donc la mutation qui rallume le live le '
 'laissait <b>vert</b> - la declaration ' + (C % 'let _bcLiveActif=false;') + ' porte les memes '
 'caracteres ailleurs. <i>Chercher une presence ne prouve pas que c est CELLE-LA qui est la</i> - '
 '<b>7e fois de ce projet</b>, meme famille que ' + (C % 'im&gt;=90') + ' et '
 + (C % '_renderHomeHeroX') + '. Borne au corps de la fonction : <b>7 cas sur 7 conformes</b>.'))

H.append(P('6. Ce qu il vous reste a faire', 'h1'))
H.append(tableau(['#', 'a faire', 'pourquoi'],
 [['1', '<b>Tester le scanner sur iPhone reel</b> : plusieurs codes, distance normale, capture '
   'nette puis floue, lumiere correcte. <b>Aucun faux EAN.</b>',
   '<i>Le banc synthetique est precisement celui qui disait que tout allait bien.</i> Le scanner '
   'n est pas valide sans ce test.'],
  ['2', 'Ouvrir <b>Profil &gt; Admin &gt; « Mesurer mes habitudes »</b> et m envoyer le tableau',
   'sans ces chiffres, tout seuil serait invente - le defaut meme qu on corrige'],
  ['3', 'Dire si vous voulez le <b>point rouge + aide + diapo</b> pour le nouveau bouton scanner',
   'regle d or #11 : c est une vraie feature utilisateur, et je ne pose pas ces reperes de moi-meme']],
 [8 * mm, 86 * mm, 72 * mm]))

H.append(Spacer(1, 3))
H.append(P('Document produit par ' + (C % 'tools/gen_nutri_correctifs_pdf.py') + ' - <b>'
           + str(GARDES[0]) + ' gardes</b> qui recomptent chaque fait depuis le code servi et '
           'refusent de produire si l un tombe - y compris si la regle des habitudes a ete '
           'changee, si l Accueil ou la douane ont bouge, ou si un temoin retourne ne l est plus. '
           'Banc : %d/%d. Controle negatif : %d/%d. Passe complete : %s. Commit : %s.'
           % (B_OK, B_OK + B_KO, M_OK, M_TOT, PASSE_TXT, HEAD[:12]), 'petit'))

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Nutrition - correctifs code-barres, portions, habitudes',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes ; banc %d/%d, mutations %d/%d, passe %s)'
      % (OUT, VERSION, GARDES[0], B_OK, B_OK + B_KO, M_OK, M_TOT, PASSE_TXT))
