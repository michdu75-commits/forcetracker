#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere le dossier GPT de la MINI-PHASE 1bis : un rechargement pendant `en_vol` fait-il
   payer DEUX fois le meme debrief ?  (hors depot - regle d or #14, le depot est public)

TOUS LES CHIFFRES SONT RELUS A CHAQUE GENERATION : les mesures viennent du journal du banc
(`banc_1bis.json`), jamais retapees ; les faits serveur sont relus dans `worker.js` ; les cles
de la charge utile sont RECONSTRUITES depuis `log.js` et comparees a celles reellement observees.

[!!] Le garde le plus important de ce fichier protege une ABSENCE : la formule
     « facturation exacte non prouvable » ne doit jamais redevenir « rien n etait paye ».

CONTRAINTE DE POLICE : WinAnsi/cp1252 - pas d emoji, entites nommees comprises.
"""
import html
import json
import os
import re
import subprocess
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether)

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
# [!] HORS DEPOT : le depot est public (regle d or #14).
OUT = os.environ.get('FT_OUT') or os.path.join(
    SCRATCH, 'DOSSIER-GPT-COUT-DOUBLE-DEBRIEF-15-09-2026.pdf')
MES = os.environ.get('FT_MES') or os.path.join(SCRATCH, 'banc_1bis.json')
BANC_A = os.environ.get('FT_BANC_A') or os.path.join(SCRATCH, 'banc_a.js')

GARDES = [0]


def g(cond, msg):
    """Un garde : il RECOMPTE, et refuse de produire si le fait tombe."""
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


WORKER = open(os.path.join(ROOT, 'worker.js'), encoding='utf-8').read()
LOG = open(os.path.join(ROOT, 'log.js'), encoding='utf-8').read()
COACH = open(os.path.join(ROOT, 'coach.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
DOSSIER = open(os.path.join(ROOT, 'docs', 'COUT-DOUBLE-DEBRIEF.md'), encoding='utf-8').read()

VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]
g(VERSION.startswith('ft-v'), 'la version ne se lit plus dans sw.js')


def sans_com(t):
    t = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), t)
    return '\n'.join(l for l in t.split('\n') if not l.strip().startswith('//'))


def corps(src, nom):
    """Le corps REEL d une fonction, delimite par comptage d accolades - jamais une borne en
       nombre de caracteres (`BUGS.md` §63)."""
    m = re.search(r'(?:async )?function %s\s*\(' % re.escape(nom), src)
    if not m:
        return ''
    i = src.index('{', m.end() - 1)
    n, j = 0, i
    while j < len(src):
        if src[j] == '{':
            n += 1
        elif src[j] == '}':
            n -= 1
            if n == 0:
                return src[i:j + 1]
        j += 1
    return src[i:]


W_NU = sans_com(WORKER)
L_NU = sans_com(LOG)

# ── 1. LES MESURES : LUES DANS LE JOURNAL DU BANC, JAMAIS RETAPEES ──────────────────────────
MESURES = json.load(open(MES, encoding='utf-8'))
g(len(MESURES) == 10, 'le banc ne porte plus 10 scenarios (%d)' % len(MESURES))


def cas(prefixe):
    for x in MESURES:
        if x['cas'].startswith(prefixe):
            return x
    raise SystemExit('GARDE ROUGE - scenario %s absent du journal du banc' % prefixe)


C1, C2, C3 = cas('1.'), cas('2.'), cas('3.')
C4, C5, C6 = cas('4.'), cas('5.'), cas('6.')
C7, C8, C9, C10 = cas('7.'), cas('8.'), cas('9.'), cas('10.')

# [!!] LE TEMOIN QUI VALIDE L INSTRUMENT. Sans lui, le banc a deja annonce 2 requetes pour
#      CHAQUE debrief - un defaut entierement fabrique par l absence d en-tetes CORS.
g(C1['recues'] == 1, 'le temoin sain ne coute plus exactement 1 requete (%d) : '
                     'l instrument fabrique le defaut qu il mesure' % C1['recues'])
g(C2['recues'] == 0, 'le rechargement AVANT depart ne coute plus 0 requete (%d)' % C2['recues'])
for n, c in (('3', C3), ('4', C4), ('5', C5), ('6', C6)):
    g(c['recues'] == 2, 'le scenario %s ne mesure plus 2 requetes arrivees (%d)' % (n, c['recues']))
    g(c['abandon'] == 1, 'le scenario %s ne mesure plus 1 abandon (%d)' % (n, c['abandon']))
    g(len(c['designations']) == 1,
      'le scenario %s ne porte plus UN SEUL debrief logique : le doublon n en est plus un' % n)
g(C9['recues'] >= 3, 'le cout redevient borne : 2 rechargements ne donnent plus 3 requetes')
g(len(C7['designations']) == 2, 'le temoin des 2 seances DIFFERENTES ne les distingue plus - '
                                'sans lui, « meme designation » ne prouverait rien')
g(len(C8['designations']) == 1, 'les 2 seances identiques du meme jour ne partagent plus leur '
                                'designation : la limite ecrite au §3 est perimee')

_L = [l for x in MESURES for l in x['lignes'] if l['action'] == 'coach']
g(all(l['corpsComplet'] for l in _L),
  'une requete a ete comptee sans corps complet : tout le raisonnement repose sur le fait que '
  'le serveur avait TOUT le payload avant l abandon')
_AB = [l['msAvantAbandon'] for l in _L if l['aborted']]
g(len(_AB) >= 5, 'plus assez d abandons observes pour donner une fenetre')
AB_MIN, AB_MAX = min(_AB), max(_AB)
g(AB_MIN > 1000, 'l abandon survient desormais en moins d une seconde : le Worker n aurait plus '
                 'le temps d atteindre Anthropic, la conclusion changerait')

# taille des deux appels du scenario 3 - relue, pas ecrite
_L3 = [l for l in C3['lignes'] if l['action'] == 'coach']
O1, O2 = _L3[0]['octets'], _L3[1]['octets']
g(O2 > O1, 'le second appel n est plus plus gros que le premier : le §3 l affirme')
PCT = round((O2 - O1) * 100.0 / O1, 1)

# ── 2. LES CLES DE LA CHARGE UTILE : RECONSTRUITES DEPUIS log.js, PAS RECOPIEES ─────────────
_pay = re.search(r'const payload=\{action:\'coach\'(.*?)\};', L_NU, re.S)
g(bool(_pay), 'la charge utile du debrief ne se lit plus dans log.js')
CLES_SRC = sorted(set(['action'] + re.findall(r'(?:^|,)\s*(\w+)\s*:', _pay.group(1))))
CLES_MES = sorted(set(_L[0]['cles'].split(',')))
g(CLES_SRC == CLES_MES,
  'les cles construites par log.js (%s) ne sont plus celles observees (%s)'
  % (','.join(CLES_SRC), ','.join(CLES_MES)))
# [!!] LE FAIT QUI DECIDE DE TOUT : aucun identifiant de seance ni de requete n est transmis.
for interdit in ('sessionId', 'requestId', 'idempot', 'debriefId', 'reqId'):
    g(interdit not in _pay.group(1),
      'la charge utile porte desormais « %s » : le Worker POURRAIT dedupliquer, tout le §4 tombe'
      % interdit)

# ── 3. LES FAITS SERVEUR : RELUS DANS worker.js ─────────────────────────────────────────────
g("ctx.waitUntil(_compterIA(" in W_NU.replace(' ', '') or
  re.search(r'ctx\.waitUntil\(_compterIA\(', W_NU) is not None,
  'le comptage n est plus sous waitUntil : le quota n est peut-etre plus debite deux fois')
_cd = corps(W_NU, 'callClaudeDiag')
g(_cd, 'callClaudeDiag est introuvable')
g('ANTHROPIC_URL' in _cd, 'callClaudeDiag n appelle plus ANTHROPIC_URL')
g('signal' not in _cd,
  'callClaudeDiag passe desormais un AbortSignal : l appel amont SERAIT annulable, '
  'la conclusion du §6 change')
# _envoyerUsage n est atteint qu APRES la reponse d Anthropic : l ordre est le fait, pas la presence
g(_cd.index('await r.json()') < _cd.index('_envoyerUsage'),
  'le rapport d usage ne vient plus APRES la reponse : le §6 affirme exactement cet ordre')
g("'Access-Control-Allow-Origin'" in W_NU,
  'le vrai Worker n envoie plus de CORS : l explication du §2 devient fausse')

# [!] L IDEMPOTENCE EXISTANTE : RIEN. On le REMESURE plutot que de s en souvenir.
CODEJS = sans_com(open(os.path.join(ROOT, 'Code.js'), encoding='utf-8').read())
for mot in ('idempot', 'Idempotency', 'dedup', 'requestId', 'request_id'):
    g(mot not in W_NU and mot not in CODEJS,
      'un mecanisme « %s » existe desormais : le §5 dit « rien », il faudrait le reecrire' % mot)
g('_plafondAtteint' in W_NU, 'le plafond d abus a disparu : le §5 le decrit')
_caps = re.search(r'(\d+)\s*appels?/jour,\s*(\d+)/personne', WORKER)
g(bool(_caps), 'les plafonds ne se lisent plus dans worker.js')
CAP_J, CAP_P = _caps.group(1), _caps.group(2)

# ── 4. LA BOUCLE DE REPRISE DU PRODUIT (celle que mon banc avait declenchee par erreur) ─────
_run = corps(L_NU, '_runSeDebrief')
_m = re.search(r'if\(a<2\)await new Promise\(r=>setTimeout\(r,(\d+)\)\)', _run)
g(bool(_m), 'la boucle de reprise de _runSeDebrief a change de forme : le §2 la cite')
REPRISE_MS = _m.group(1)

# ── 5. LA CONCLUSION DE ft-v1215 QUE L ON CORRIGE DOIT TOUJOURS EXISTER ─────────────────────
if os.path.exists(BANC_A):
    _a = open(BANC_A, encoding='utf-8').read()
    g("rien n\\'etait paye" in _a or "rien n'etait paye" in _a,
      'la phrase corrigee au §1 n existe plus dans banc_a.js : le document corrigerait un fantome')

# ── 6. [!!] LE GARDE QUI PROTEGE UNE ABSENCE ────────────────────────────────────────────────
g('facturation exacte non prouvable' in DOSSIER,
  'le dossier ne porte plus la formule exigee par Michel')
_bas = DOSSIER.lower()
# [!!] L invariant juste est DOUBLE, et le premier est le plus fort : la phrase interdite ne doit
#      apparaitre qu ENTRE BACKTICKS, c est-a-dire CITEE. Une conclusion s ecrit en prose.
#      Le second (un marqueur de correction a proximite) empeche une citation decorative.
#      [!] Ma premiere version ne cherchait que « faux » la ou le texte dit « fausse » : elle
#          refusait la citation legitime. Un garde plus strict que la contrainte reelle refuse
#          du travail juste.
_SPANS = [(m.start(), m.end()) for m in re.finditer(r'`[^`\n]*`', _bas)]
_MARQ = ('jamais', 'erreur', 'faus', 'ne doit', 'contest', 'etiquet', 'étiquet', 'remplac',
         'corrig')
for m in re.finditer(r"rien n('|’)etait paye|rien n('|’)était payé", _bas):
    g(any(a <= m.start() and m.end() <= b for a, b in _SPANS),
      'le dossier emploie « rien n etait paye » EN PROSE (hors citation) : c est la conclusion '
      'que les faits interdisent')
    seg = _bas[max(0, m.start() - 200):m.start()]
    g(any(x in seg for x in _MARQ),
      'une citation de « rien n etait paye » n est plus rattachee a sa correction : citee sans '
      'etre corrigee, elle se lit comme un constat')
g('AUCUN correctif' in DOSSIER or 'Aucun correctif' in DOSSIER,
  'le dossier ne dit plus qu aucun correctif n a ete applique')

# ── 7. AUCUN FICHIER SERVI MODIFIE : le dossier l affirme, on le VERIFIE ────────────────────
SERVIS = {'app.js', 'log.js', 'coach.js', 'setup.js', 'screens.js', 'state.js', 'tracking.js',
          'constants.js', 'index.html', 'style.css', 'sw.js', 'worker.js', 'Code.js'}
try:
    _mod = subprocess.run(['git', 'diff', '--name-only', 'HEAD'], cwd=ROOT,
                          capture_output=True, text=True).stdout.split()
    _touche = sorted(SERVIS & set(_mod))
    g(not _touche, 'le dossier annonce « aucun fichier servi modifie », or %s a change'
      % ', '.join(_touche))
except FileNotFoundError:
    pass

# ═══════════════════════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')
VERT = colors.HexColor('#1E7A46')
ORANGE = colors.HexColor('#B26A00')

S = getSampleStyleSheet()
st = {
    'titre': ParagraphStyle('titre', parent=S['Title'], fontName='Helvetica-Bold',
                            fontSize=18, leading=22, textColor=ENCRE, alignment=TA_LEFT,
                            spaceAfter=2),
    'sous': ParagraphStyle('sous', parent=S['Normal'], fontName='Helvetica',
                           fontSize=9.5, leading=13, textColor=GRIS, spaceAfter=13),
    'h1': ParagraphStyle('h1', parent=S['Heading1'], fontName='Helvetica-Bold',
                         fontSize=12.5, leading=15.5, textColor=ROUGE, spaceBefore=13,
                         spaceAfter=5),
    'p': ParagraphStyle('p', parent=S['Normal'], fontName='Helvetica',
                        fontSize=9.3, leading=13.2, textColor=ENCRE, spaceAfter=6),
    'petit': ParagraphStyle('petit', parent=S['Normal'], fontName='Helvetica',
                            fontSize=8.2, leading=11.5, textColor=GRIS, spaceAfter=5),
    'cell': ParagraphStyle('cell', parent=S['Normal'], fontName='Helvetica',
                           fontSize=8.1, leading=10.6),
    'cellb': ParagraphStyle('cellb', parent=S['Normal'], fontName='Helvetica-Bold',
                            fontSize=8.1, leading=10.6),
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
                    raise SystemExit('ENTITE NOMMEE NON RENDUE %s dans %s' % (m.group(0), ou))
    return x


C = "<font face='Courier'>%s</font>"


def P(t, s='p'):
    return Paragraph(_v(t, 'paragraphe'), st[s])


def encadre(titre, corps_, couleur=ROUGE):
    t = Table([[Paragraph('<b>%s</b>' % _v(titre, 'titre'), st['cellb'])],
               [Paragraph(_v(corps_, 'corps'), st['cell'])]], colWidths=[166 * mm])
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


def pied(cv, doc):
    cv.saveState()
    cv.setFont('Helvetica', 7.4)
    cv.setFillColor(GRIS)
    cv.drawString(22 * mm, 12 * mm,
                  'Force Tracker - mini-phase 1bis - cout du debrief - %s - 15/09/2026' % VERSION)
    cv.drawRightString(A4[0] - 22 * mm, 12 * mm, 'page %d' % cv.getPageNumber())
    cv.restoreState()


H = []
H.append(P('Un rechargement pendant l appel fait-il payer DEUX fois le meme debrief ?', 'titre'))
H.append(P('Force Tracker &middot; mini-phase 1bis du chantier Debrief Milo &middot; 15/09/2026 '
           '&middot; %s &middot; <b>mesure seule, aucun correctif applique</b>' % VERSION, 'sous'))

H.append(encadre('REPONSE - CAS B',
                 '<b>Oui : deux requetes completes partent et ARRIVENT pour le meme debrief '
                 'logique.</b><br/><br/>'
                 '&bull; depart et arrivee des deux requetes : <b>prouves</b> (10 scenarios, '
                 'serveur HTTP reel) ;<br/>'
                 '&bull; debit du <b>quota</b> deux fois : <b>prouve par lecture du code</b> '
                 '(le comptage est sous ' + (C % 'ctx.waitUntil') + ', donc survit a la '
                 'deconnexion) ;<br/>'
                 '&bull; facturation Anthropic du premier appel : <b>facturation exacte non '
                 'prouvable</b> ;<br/>'
                 '&bull; le cout <b>n est pas borne</b> : %d rechargements ont produit '
                 '<b>%d requetes</b>.' % (2, C9['recues'])))
H.append(Spacer(1, 6))

H.append(P('1. La conclusion de ft-v1215 etait fausse', 'h1'))
H.append(P('Le banc precedent etiquetait le scenario « rechargement pendant l appel » ainsi : '
           '<b>&laquo; 2 appels - attendu (rien n etait paye) &raquo;</b>. Cette phrase affirme un '
           'fait de <b>facturation</b> a partir d une observation de <b>navigateur</b>. Or le '
           'navigateur ne savait qu une chose : la reponse n etait pas revenue.', 'p'))
H.append(P('<b>Mesure d aujourd hui : la premiere requete etait ARRIVEE, corps complet, et '
           'l abandon client n est survenu que %d a %d ms plus tard</b> - c est-a-dire bien apres '
           'le point ou le Worker appelle Anthropic. <i>Ce n est pas un chiffre qui etait faux, '
           'c est une categorie : on ne conclut pas sur ce que fait un serveur en regardant le '
           'client.</i>' % (AB_MIN, AB_MAX), 'p'))

H.append(P('2. Pourquoi le banc a du changer de nature - et comment il a d abord menti', 'h1'))
H.append(tableau(['', 'banc de ft-v1215', 'banc 1bis'],
                 [['mecanisme', 'fetch REMPLACE dans la page', 'vrai serveur HTTP qui recoit'],
                  ['ce qu il compte', 'ce que le navigateur DEMANDE', 'ce qui ARRIVE'],
                  ['abandon client', 'invisible', 'observe (aborted / writableFinished)'],
                  ['latence serveur', 'inexistante', 'controlee (9 s)']],
                 [30 * mm, 62 * mm, 74 * mm]))
H.append(Spacer(1, 5))
H.append(encadre('L INSTRUMENT A D ABORD FABRIQUE LE DEFAUT QU IL MESURAIT',
                 'Premier jet : <b>2 requetes arrivees meme SANS rechargement</b>, a 1 214 ms '
                 'd intervalle, octet pour octet identiques. Cause : mon faux Worker n envoyait '
                 '<b>aucun en-tete CORS</b>, alors que le vrai en envoie. Une requete '
                 'cross-origin en texte brut <b>part et arrive</b>, puis sa reponse est '
                 '<b>bloquee</b> - donc ' + (C % 'fetch') + ' rejette, donc la <b>vraie</b> '
                 'boucle de reprise du produit (%s ms) se declenche.<br/><br/>'
                 'Le banc doublait donc <b>chaque</b> appel, rechargement ou non. Sans le temoin '
                 'sain - un debrief normal qui doit couter exactement 1 requete - j aurais publie '
                 '&laquo; le rechargement fait payer deux fois &raquo; sur un chiffre entierement '
                 'produit par mon instrument.<br/><br/>'
                 '<i>Un instrument qui produit le phenomene qu il observe est pire qu un '
                 'instrument muet : il est credible.</i>' % REPRISE_MS, ORANGE))

H.append(P('3. Les 10 scenarios - ce qui arrive reellement au serveur', 'h1'))
# [!!] LA COLONNE « MEME DEBRIEF LOGIQUE ? » EST UN JUGEMENT, PAS UN CALCUL — et ma premiere
#      version la derivait d une formule (« une seule designation et plus d une requete »). Elle
#      etiquetait donc le scenario 8 « OUI », alors que ce sont DEUX SEANCES DISTINCTES qui
#      partagent seulement leur designation — exactement le contraire de ce que le §3 explique.
#      *Une formule habile a produit une affirmation fausse ; l ecrire explicitement coute une
#      ligne et se relit.* Les CHIFFRES, eux, restent lus dans le journal du banc.
_SCEN = (
    (1, C1, 'TEMOIN - debrief normal, sans rechargement', '-'),
    (2, C2, 'rechargement AVANT le depart (hors ligne)', '- (aucune requete)'),
    (3, C3, 'rechargement PENDANT l appel', '<b>OUI</b>'),
    (4, C4, 'rechargement, serveur qui ne repond jamais', '<b>OUI</b>'),
    (5, C5, 'application fermee puis rouverte pendant l appel', '<b>OUI</b>'),
    (6, C6, 'meme chose par le chemin Coach', '<b>OUI</b>'),
    (7, C7, 'TEMOIN - deux seances reellement differentes', 'non - 2 designations'),
    (8, C8, 'deux seances identiques le meme jour',
     'non - 2 seances, mais <b>meme designation</b>'),
    (9, C9, 'DEUX rechargements pendant l appel', '<b>OUI</b>'),
    (10, C10, 'bouton Reessayer apres un echec', 'oui, mais <b>volontaire</b>'),
)
g(all('OUI' not in lab for n, c, lib, lab in _SCEN if n in (1, 2, 7, 8)),
  'un scenario a DEUX debriefs logiques distincts est etiquete « meme debrief » : le document '
  'dirait que deux seances differentes sont un doublon')
g(all('OUI' in lab for n, c, lib, lab in _SCEN if n in (3, 4, 5, 6, 9)),
  'un scenario de rechargement n est plus etiquete « meme debrief » : c est le constat du dossier')
_ligs = [[str(n), lib, '<b>%d</b>' % c['recues'], str(c['abandon']), lab]
         for n, c, lib, lab in _SCEN]
H.append(tableau(['#', 'scenario', 'requetes ARRIVEES', 'abandonnees', 'meme debrief logique ?'],
                 _ligs, [8 * mm, 78 * mm, 24 * mm, 22 * mm, 34 * mm]))
H.append(Spacer(1, 5))
H.append(P('<b>Faits complementaires mesures.</b> Le corps de la premiere requete est '
           '<b>complet</b> a l arrivee dans tous les cas (le serveur ne compte qu a la fin du '
           'corps) ; l abandon survient %d a %d ms plus tard. Le <b>second appel est plus gros '
           'que le premier</b> : %s puis %s octets (<b>+%s %%</b>) - l historique a grossi '
           'entre-temps. <i>On ne paie pas deux fois la meme chose : on paie deux fois, la '
           'seconde plus cher.</i>'
           % (AB_MIN, AB_MAX, '{:,}'.format(O1).replace(',', ' '),
              '{:,}'.format(O2).replace(',', ' '), PCT), 'p'))
H.append(P('[!] <b>Le scenario 8 est une limite mesuree, hors sujet de cette passe et NON '
           'corrigee</b> : deux seances du meme jour avec le meme nombre d exercices et le meme '
           'volume produisent <b>la meme designation</b>. Ce n est pas un probleme de cout - les '
           'jetons restent distincts depuis ft-v1215 - mais le modele ne peut pas les distinguer '
           'dans la consigne. Ecrit, rendu a Michel, pas repare.', 'p'))
H.append(P('[!] <b>Une honnetete sur le 2e appel (Haiku).</b> ' + (C % 'summarizeCoach') +
           ' part dans les scenarios 3 a 9 et pas dans le temoin 1. La cause n est PAS le '
           'rechargement : c est le seuil d historique, et le temoin part d un historique vide '
           'par le banc. Chez une vraie personne, l historique est deja au-dessus du seuil dans '
           'les deux cas. <b>Le surcout reel d un rechargement est donc UN appel de plus, pas '
           'deux.</b> Le dire autrement gonflerait le chiffre.', 'p'))

H.append(P('4. Ce que la charge utile contient - et ce qu elle ne contient pas', 'h1'))
H.append(P('Cles relevees sur <b>toutes</b> les requetes recues, et <b>reconstruites en parallele '
           'depuis</b> ' + (C % 'log.js') + ' pour verifier qu elles coincident :', 'p'))
H.append(encadre('LES ' + str(len(CLES_MES)) + ' CLES TRANSMISES',
                 (C % ', '.join(CLES_MES)) +
                 '<br/><br/><b>Aucun identifiant de seance. Aucun identifiant de requete.</b>'
                 '<br/><br/>Meme si le Worker <i>voulait</i> reconnaitre deux requetes comme le '
                 'meme debrief logique, <b>il n en a pas le moyen</b>. Le seul repere est la '
                 'designation en clair dans le message, qui sert a Milo et n a jamais ete concue '
                 'comme une cle - et le scenario 8 montre qu elle n est pas unique.'))

H.append(P('5. Objectif 6 - l idempotence existante : RIEN', 'h1'))
H.append(P('Michel : <i>&laquo; Ne cree rien avant d avoir cherche. Si la reponse est `rien`, '
           'ecris-le clairement. &raquo;</i> <b>La reponse est `rien`.</b> Recherche dans '
           + (C % 'worker.js') + ' et ' + (C % 'Code.js') + ' : aucune cle d idempotence, aucun '
           'verrou de session, aucune deduplication, aucun cache de reponse, aucun registre de '
           'requetes. Le seul garde-fou est un <b>plafond d ABUS</b> (%s appels/jour au global, '
           '%s par personne), explicitement approximatif et concu pour <i>borner le cout en cas '
           'd abus</i>, pas pour dedupliquer.' % (CAP_J, CAP_P), 'p'))

H.append(P('6. Ce que le Worker fait d une requete dont le client a disparu', 'h1'))
H.append(tableau(['fait lu dans le code', 'consequence'],
                 [['le comptage est appele <b>avant</b> l aiguillage, sous '
                   + (C % 'ctx.waitUntil'),
                   '<b>le quota est debite pour les DEUX requetes</b>, abandon ou non : '
                   + (C % 'waitUntil') + ' prolonge explicitement la vie du Worker au-dela de '
                   'la reponse'],
                  ['l appel vers Anthropic ne recoit <b>aucun signal d annulation</b>',
                   '<b>rien dans notre code n annule l appel amont</b>'],
                  ['le rapport d usage n est envoye qu <b>apres</b> la reponse d Anthropic',
                   '[!] si l isolat est tue a la deconnexion, <b>notre propre journal d usage ne '
                   'verra jamais l appel abandonne</b>']],
                 [62 * mm, 104 * mm]))
H.append(Spacer(1, 5))
H.append(encadre('DEUX COMPTABILITES, DEUX REPONSES',
                 '<b>Le quota (notre comptabilite) est bel et bien debite deux fois</b> - prouve '
                 'par lecture du code, et <b>observable en production</b> dans Profil &gt; Admin '
                 '&gt; Sante du systeme.<br/><br/>'
                 '<b>La facturation Anthropic du premier appel : facturation exacte non '
                 'prouvable.</b> Elle depend de deux choses qu aucune mesure faite ici ne peut '
                 'atteindre : Cloudflare annule-t-il le contexte d execution a la deconnexion du '
                 'client, et Anthropic facture-t-il une requete dont la connexion est coupee en '
                 'vol.<br/><br/>'
                 '<b>Et cette formule ne doit jamais etre remplacee par &laquo; rien n etait '
                 'paye &raquo;</b> - c est exactement l erreur de ft-v1215, et la seule phrase '
                 'que les faits interdisent.'))

H.append(P('7. Ce qu il manque pour trancher la facturation', 'h1'))
H.append(P('Deux mesures, dont aucune ne demande de modifier le produit.', 'p'))
H.append(P('<b>1.</b> Le rapprochement du <b>compteur d appels</b> et du <b>journal d usage</b> '
           'sur le meme jour, <b>deja disponible</b> dans Profil &gt; Admin &gt; Sante du '
           'systeme. Le compteur est incremente <b>avant</b> l appel (sous ' + (C % 'waitUntil') +
           ') ; le journal d usage n est ecrit qu <b>apres</b> la reponse d Anthropic. <i>Un ecart '
           'entre les deux est la signature exacte des appels partis et non aboutis.</i> Il suffit '
           'que Michel reproduise le geste sur son iPhone - terminer une seance, recharger pendant '
           'que Milo analyse - puis lise les deux nombres.', 'p'))
H.append(P('<b>2.</b> La page d usage de la console Anthropic a la minute pres - la <b>seule</b> '
           'source de verite sur la facturation. <i>Un chiffre de facturation se lit sur une '
           'facture, il ne se deduit pas.</i>', 'p'))

H.append(P('8. Ce que cette passe ne fait pas', 'h1'))
H.append(P('<b>Aucun correctif</b>, conformement a la consigne - le chantier s arrete au constat. '
           '<b>Aucun fichier servi modifie</b> : ' + (C % 'sw.js') + ' n est donc pas incremente '
           '(verifie par un garde de ce generateur). Perimetre nomme par Michel intact : '
           '<b>Nutrition</b>, le contexte dedie du debrief, le modele, la strategie de cache, la '
           'politique memoire, le prevu vs realise, l architecture generale de Milo.', 'p'))
H.append(Spacer(1, 4))
H.append(encadre('LA TENSION A TRANCHER - ET ELLE APPARTIENT A MICHEL',
                 'La remise en file au rechargement est <b>voulue</b> : elle existe pour qu un '
                 'debrief ne soit <b>jamais perdu</b>. Fermer la fenetre de l appel en cours sans '
                 'y penser, c est risquer d echanger un doublon contre une <b>perte '
                 'silencieuse</b> - c est-a-dire refaire a l envers l erreur que ft-v1215 venait '
                 'justement de corriger.<br/><br/>'
                 '<i>Le droit de deviner depend du cout de l erreur : ici les deux erreurs '
                 'possibles n ont pas le meme prix, et ce n est pas a moi de choisir lequel on '
                 'paie.</i>', VERT))

H.append(Spacer(1, 6))
H.append(P('Ce PDF est genere par <font face="Courier">tools/gen_1bis_pdf.py</font>, dont les %d '
           'gardes relisent chaque chiffre depuis le journal du banc et depuis le code servi, et '
           '<b>refusent de produire</b> si un seul fait tombe - y compris le temoin sain a '
           '1 requete, sans lequel tout ce document serait faux, et la formule '
           '&laquo; facturation exacte non prouvable &raquo;, qui ne doit jamais redevenir '
           '&laquo; rien n etait paye &raquo;.' % GARDES[0], 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Force Tracker - cout du double debrief (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)
print('OK %s  (%s, %d gardes, 10 scenarios, temoin sain=%d requete, %d/%d octets +%s%%)'
      % (OUT, VERSION, GARDES[0], C1['recues'], O1, O2, PCT))
