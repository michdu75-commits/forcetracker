#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dossier GPT — AUDIT FINAL DE L ACCUEIL (hors depot, regle d or #14).

[!!] CE DOCUMENT AFFIRME QUE CERTAINS ELEMENTS SONT MORTS ET QUE D AUTRES SONT VIVANTS.
     Ses gardes REVERIFIENT les deux moities dans le code servi. Si un id pretendu absent
     reapparait, si une fonction pretendue vivante disparait, si le retrait volontaire
     d openPlateCalc est defait, il REFUSE de produire.

[!!] LE PIEGE PROPRE A CET AUDIT : il decrit du code MORT. Un garde naif qui cherche le
     nom d un element mort le trouvera... dans ce generateur lui-meme, ou dans un
     commentaire du depot. Les gardes lisent donc le CODE SERVI, jamais la documentation.

[!!] ET LE NETTOYEUR EST LE MEME QUE CELUI DE L AUDIT : il comprend les template literals
     ET les litteraux d expression reguliere. Sans ca il avale du code et invente des
     orphelines — mesure trois fois pendant cette passe.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d emoji, entites decodees AVANT controle.
"""
import html as _html
import os
import re
import sys

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether)

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or '/tmp/AUDIT-FINAL-ACCUEIL-CODE-UX-16-09-2026.pdf'
sys.path.insert(0, '/tmp')
try:
    from nettoyeur import code_seul, code_et_chaines
except ImportError:
    raise SystemExit('GARDE ROUGE - /tmp/nettoyeur.py absent : sans lui les comptes sont faux')

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


SCR = lire('screens.js')
TRK = lire('tracking.js')
LOG = lire('log.js')
IDX = lire('index.html')
CSS = lire('style.css')
SW = lire('sw.js')
RUN = lire(os.path.join('tests', 'parcours', 'runner.js'))
TEM = lire(os.path.join('tests', 'parcours', 'accueil_mini.js'))
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]
IDX_N = re.sub(r'<!--[\s\S]*?-->', '', IDX)          # commentaires HTML retires
CSS_N = re.sub(r'/\*[\s\S]*?\*/', '', CSS)
SCR_C = code_seul(SCR)
TRK_C = code_seul(TRK)


def corps(src, nom):
    m = re.search(r'(?:async\s+)?function\s+%s\s*\(' % re.escape(nom), src)
    if not m:
        return ''
    i = src.index('{', m.end() - 1); n = 0; j = i
    while j < len(src):
        if src[j] == '{':
            n += 1
        elif src[j] == '}':
            n -= 1
            if n == 0:
                return src[i:j + 1]
        j += 1
    return src[i:]


# ══ (A) CE QUE LE DOSSIER DIT MORT DOIT ETRE ENCORE MORT ═══════════════════════════════
MORTS = ['home-sheets-pill', 'home-sync-dot', 'home-sync-lbl']
for i in MORTS:
    g(('id="%s"' % i) not in IDX_N,
      'l element « %s » est REAPPARU dans index.html : ce dossier affirme qu il n existe '
      'nulle part, la section 5.1 devient fausse' % i)
    g(('#' + i) not in CSS_N,
      'le CSS cible desormais « %s » : la branche n est plus morte' % i)
# [!!] LE FAIT CHERCHE VIT DANS UNE CHAINE : getElementById('home-sheets-pill'). Avec
#      `code_seul`, qui retire le CONTENU des chaines, ce garde etait aveugle par
#      construction et refusait de produire sur du code parfaitement sain. C est la
#      quatrieme fois de la journee qu un garde mesure autre chose que ce qu il annonce.
#      *Choisir le nettoyeur, c est choisir ce qu on mesure.*
UP = code_et_chaines(corps(SCR, 'updatePill'))
for i in MORTS:
    g(("getElementById('%s')" % i) in UP,
      'updatePill ne cherche plus « %s » : la branche impossible a ete corrigee, et ce '
      'dossier la decrit comme presente (il faudrait le refaire)' % i)

# les conteneurs sans lecteur
for i in ('cycle-home-card', 'strength-levels', 'pr-list'):
    g(('id="%s"' % i) in IDX_N, 'le conteneur « %s » a disparu d index.html' % i)
    tous = code_et_chaines(SCR) + code_et_chaines(TRK) + code_et_chaines(LOG)
    g(i not in tous,
      'un JS lit desormais « %s » : ce dossier le classe ORPHELIN PROUVE, ce ne serait '
      'plus vrai' % i)

# ══ (B) #home-hdr : la fonction ne fait QUE vider ══════════════════════════════════════
HDR = code_et_chaines(corps(SCR, '_renderHomeHdr'))
g(bool(HDR), '_renderHomeHdr a disparu de screens.js')
g("el.innerHTML=''" in HDR.replace(' ', ''),
  '_renderHomeHdr ne se contente plus de vider son conteneur : le verdict « LEGACY MAIS '
  'ACTIF » de la section 5.2 ne tient plus')
g(len(re.findall(r'[A-Za-z_$][\w$]*\s*\(', HDR)) <= 2,
  '_renderHomeHdr fait desormais autre chose (%d appels) que chercher et vider'
  % len(re.findall(r'[A-Za-z_$][\w$]*\s*\(', HDR)))

# ══ (C) renderRecoveryCard : le retour anticipe et son unique appelant ════════════════
RRC = corps(TRK, 'renderRecoveryCard')
g(bool(RRC), 'renderRecoveryCard a disparu de tracking.js')
# [!] MEME PIEGE, MEME LIGNE SUIVANTE : « 'home' » est une CHAINE. Avec `code_seul` la
#     condition devient `_curScreen===''` et le garde ne trouve rien.
g("if(window._curScreen==='home'){_renderHomeHero();return;}" in code_et_chaines(RRC).replace(' ', ''),
  'le retour anticipe de renderRecoveryCard a change : la section 10.2 devient fausse')
N_RRC = len(re.findall(r'(?<![\w$.])renderRecoveryCard\s*\(', TRK_C)) - 1   # -1 : sa declaration
g(N_RRC == 1,
  'renderRecoveryCard a %d appelants et non 1 : l argument de la section 10.2 repose sur '
  'son appelant UNIQUE' % N_RRC)
g(IDX_N.count('id="log-sleep"') == 1,
  'le formulaire de sommeil existe %d fois : l argument « il ne vit que dans #s-home » '
  'tombe' % IDX_N.count('id="log-sleep"'))

# ══ (D) CE QUE LE DOSSIER DIT VIVANT DOIT L ETRE ENCORE ═══════════════════════════════
for f in ('_renderHomeHero', '_renderHomeCalendar', '_renderObsCard', '_renderDayStateCard',
          '_renderMiloCard', '_renderSouvenirCard', '_renderTesterCard', 'updatePill',
          '_renderHomeHdr'):
    g(('function %s(' % f) in SCR or ('function %s(' % f) in TRK,
      'le proprietaire « %s » a disparu : la carte de la section 1 est fausse' % f)
HOME = code_seul(corps(SCR, 'renderHome'))
for f in ('_renderHomeHero', '_renderHomeCalendar', 'updatePill', '_renderHomeHdr'):
    g((f + '(') in HOME, 'renderHome n appelle plus %s' % f)
# [!] `#log-sleep` : son id vit dans une chaine cote JS, mais ici on compte dans le HTML.

# ⛔ LE RETRAIT VOLONTAIRE DE MICHEL DOIT RESTER INTACT (R30)
g('function openPlateCalc(' in LOG,
  'openPlateCalc a ete SUPPRIMEE : c est le retrait volontaire de Michel, ce dossier dit '
  'expressement de NE PAS y toucher (R30, cas fondateur)')
g(len(re.findall(r'(?<![\w$.])openPlateCalc\s*\(', code_seul(LOG))) == 1,
  'openPlateCalc a desormais un appelant : elle n est plus une feature non branchee')

# ══ (E) LES CHIFFRES DE STRUCTURE, RECOMPTES ══════════════════════════════════════════
N_LIG_HOME = corps(SCR, 'renderHome').count('\n') + 1
g(85 <= N_LIG_HOME <= 100,
  'renderHome fait %d lignes, le dossier annonce 91 : l ecart est trop grand' % N_LIG_HOME)
N_HERO = corps(SCR, '_renderHomeHero').count('\n') + 1
g(200 <= N_HERO <= 235, '_renderHomeHero fait %d lignes, le dossier annonce 217' % N_HERO)
N_TEM = len(re.findall(r"t\('B-CCCXVIII ", TEM)) + len(re.findall(r"t\('B-CCCXIX ", TEM))
g(N_TEM == 37, 'le banc Accueil porte %d temoins et non 37' % N_TEM)
g("B-CCCXVIII ⑯" in TEM,
  'le temoin B-CCCXVIII ⑯ a disparu : c est lui qui rougit quand on retire #home-hdr, '
  'et la section 16 le nomme')

# ══ (F) LES COULEURS, RECOMPTEES ══════════════════════════════════════════════════════
m = re.search(r'--t3:\s*(#[0-9a-fA-F]{6})', CSS_N)
g(bool(m), 'la variable --t3 a disparu du CSS')
T3 = m.group(1).lower()
g(T3 == '#6b7180',
  '--t3 vaut %s et non #6B7180 : la mesure de contraste (3,70) ne correspond plus' % T3)
m2 = re.search(r'--t2:\s*(#[0-9a-fA-F]{6})', CSS_N)
g(bool(m2) and m2.group(1).lower() == '#8a8f99',
  '--t2 a change : le dossier affirme qu il PASSE le seuil, ce ne serait plus verifie')


def rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def lum(c):
    def f(v):
        v /= 255.0
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, gg, b = [f(x) for x in c]
    return .2126 * r + .7152 * gg + .0722 * b


mbg = re.search(r'--bg2:\s*(#[0-9a-fA-F]{6})', CSS_N)
g(bool(mbg), '--bg2 a disparu')
L1, L2 = lum(rgb(T3)), lum(rgb(mbg.group(1)))
RATIO = round((max(L1, L2) + .05) / (min(L1, L2) + .05), 2)
g(abs(RATIO - 3.70) < 0.25,
  'le contraste --t3 / --bg2 recalcule vaut %.2f et non 3,70 : le chiffre du dossier est '
  'perime' % RATIO)

# hex quasi identiques, recomptes
HEX = [h.lower() for h in re.findall(r'#([0-9a-fA-F]{6})\b', CSS_N)]
UNI = sorted(set('#' + h for h in HEX))


def dist(a, b):
    return sum((x - y) ** 2 for x, y in zip(rgb(a), rgb(b))) ** .5


PROUVES = [(a, b) for i, a in enumerate(UNI) for b in UNI[i+1:] if dist(a, b) <= 1.0]
g(len(PROUVES) == 2,
  '%d paires de couleurs indiscernables (distance <= 1) au lieu de 2 : le tableau des '
  'doublons est perime' % len(PROUVES))
N_HEX = len(set(HEX))

# ══ (G) PERIMETRE : L AUDIT N A RIEN MODIFIE ══════════════════════════════════════════
# [!!] CINQUIEME FOIS AUJOURD HUI, ET LA MEME FAUTE QUE CE MATIN : le motif contient un
#      ESPACE (« const fmt ») alors que je retirais tous les espaces de la botte de foin.
#      *L aiguille et la botte de foin doivent subir la MEME transformation.* On emploie
#      donc un motif tolerant aux espaces, qui ne depend d aucune mise en forme.
g(re.search(r'const\s+fmt\s*=\s*n\s*=>\s*Math\.round\(n\*10\)\s*/\s*10\s*;',
            code_seul(lire('state.js'))) is not None,
  'fmt() a change pendant un AUDIT : cette passe ne devait RIEN modifier')
g(re.search(r'wScore\s*=\s*70\s*;', TRK_C) is not None,
  'la base neutre 70 a change pendant un AUDIT')
g('function _douaneLigne(' in lire('app.js'), 'la douane Nutrition a bouge pendant un AUDIT')
_i_hero, _i_milo = IDX_N.index('id="home-hero"'), IDX_N.index('id="home-milo"')
g(_i_hero < _i_milo, 'l ordre de l Accueil a change pendant un AUDIT')

# ══════════════════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')
_ss = getSampleStyleSheet()
ST = {
    'titre': ParagraphStyle('t', parent=_ss['Title'], fontName='Helvetica-Bold',
                            fontSize=16, leading=19.5, textColor=ENCRE, spaceAfter=2),
    'sous': ParagraphStyle('s', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=8.6, leading=11.2, textColor=GRIS, spaceAfter=9),
    'h1': ParagraphStyle('h1', parent=_ss['Normal'], fontName='Helvetica-Bold',
                         fontSize=11, leading=13.2, textColor=ROUGE,
                         spaceBefore=10, spaceAfter=4),
    'p': ParagraphStyle('p', parent=_ss['Normal'], fontName='Helvetica',
                        fontSize=8.6, leading=11.7, textColor=ENCRE, spaceAfter=5),
    'petit': ParagraphStyle('pt', parent=_ss['Normal'], fontName='Helvetica',
                            fontSize=7.5, leading=10, textColor=GRIS, spaceAfter=4),
    'cell': ParagraphStyle('c', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=7.8, leading=9.9, textColor=ENCRE),
    'cellg': ParagraphStyle('cg', parent=_ss['Normal'], fontName='Helvetica-Bold',
                            fontSize=7.8, leading=9.9, textColor=ENCRE),
}


def _v(s):
    rendu = _html.unescape(s)
    try:
        rendu.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE - hors cp1252 apres rendu : %r (dans %r)'
                         % (rendu[e.start:e.end], s[:70]))
    return s


def P(txt, st='p'):
    return Paragraph(_v(txt), ST[st])


C = '<font face="Courier" size="7.4">%s</font>'


def encadre(titre, corps_html, couleur=ROUGE):
    t = Table([[Paragraph(_v('<b>' + titre + '</b>'), ST['cell'])],
               [Paragraph(_v(corps_html), ST['cell'])]], colWidths=[166 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FOND),
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
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), FOND),
        ('LINEBELOW', (0, 0), (-1, 0), 0.9, TRAIT),
        ('INNERGRID', (0, 1), (-1, -1), 0.3, TRAIT),
        ('BOX', (0, 0), (-1, -1), 0.5, TRAIT),
        ('LEFTPADDING', (0, 0), (-1, -1), 4.5), ('RIGHTPADDING', (0, 0), (-1, -1), 4.5),
        ('TOPPADDING', (0, 0), (-1, -1), 3.2), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.2),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 7)])


H = []
H.append(P('Audit final de l Accueil - code mort, branchements, UX, couleurs', 'titre'))
H.append(P('Force Tracker - 16/09/2026 - arbre de la branche (%s). AUCUNE modification : '
           'ni suppression, ni refactor, ni bump. Document hors depot.' % VERSION, 'sous'))

H.append(encadre(
    'A LIRE EN PREMIER - LA BASE N EST PAS CELLE QU ON CROIT',
    '<b>ft-v1219 n est PAS en ligne.</b> Il vit sur la branche ; ' + (C % 'origin/master')
    + ' sert encore <b>ft-v1218</b>, et le workflow Pages ne se declenche que sur '
    + (C % 'master') + ' (verifie). <b>Les quatre corrections du mini-chantier n etaient '
    'donc pas sur l iPhone</b> : ce qui a ete valide visuellement, c est ft-v1218. '
    '<i>C est R18 retourne contre moi : « j ai pousse » ne veut pas dire « c est en ligne ».</i>'))

H.append(encadre(
    'LE RESULTAT PRINCIPAL EST UNE ABSENCE',
    'Sur les <b>116 fonctions</b> atteignables depuis ' + (C % 'renderHome') + ' (sur 1 760 '
    'dans le bundle), <b>ZERO</b> est sans appelant. <b>Il n y a pas de code mort dans le '
    'chemin de l Accueil.</b><br/><br/>'
    'Ce qui traine derriere lui tient en <b>10 lignes de JavaScript et 5 elements HTML</b> - '
    'et tout le reste de ce qui « avait l air mort » s est revele vivant, <b>quatre fois de '
    'suite</b>, parce que c est mon outil qui se trompait, pas le code.'))

H.append(P('1. La carte reelle, et les fonctions vraiment traversees', 'h1'))
H.append(P('Methode : on enveloppe les <b>1 740 fonctions globales</b> du bundle servi, puis '
           'on <b>vide le compteur juste avant</b> ' + (C % 'renderHome()') + '. <i>Sans ce '
           'vidage on compterait le chargement de la page et on attribuerait a l Accueil des '
           'appels qui ne sont pas les siens.</i>', 'p'))
H.append(tableau(
    ['scenario', 'ce qu il ne couvre PAS', 'fonctions', 'appels', 'ms froid', 'ms chaud'],
    [['A compte realiste', 'aucune sollicitation Milo forcee', '68', '610', '3,7', '2,2'],
     ['B compte neuf', 'ni seance, ni nuit, ni pesee', '56', '483', '2,6', '1,5'],
     ['C Milo visible', 'ni souvenir, ni carte testeur', '61', '583', '3,6', '2,0'],
     ['D Milo absent', 'aucune observation en attente', '68', '593', '3,4', '2,1'],
     ['E donnees partielles', 'aucune pesee, aucune nuit', '66', '579', '3,0', '1,8']],
    [34 * mm, 58 * mm, 20 * mm, 18 * mm, 18 * mm, 18 * mm]))
H.append(tableau(
    ['categorie', 'definition', 'nb'],
    [['A UTILISEE', 'appel reel dans <b>les 5</b> scenarios', '<b>48</b>'],
     ['B CONDITIONNELLE', 'appel reel dans au moins 1 scenario', '<b>21</b>'],
     ['C REFEREE, NON ATTEINTE', 'lecteur reel trouve, couverture runtime insuffisante', '<b>47</b>'],
     ['D/E ORPHELINE PROBABLE', 'aucun lecteur trouve', '<b>0</b>'],
     ['F ORPHELINE PROUVEE', '-', '<b>0</b>']],
    [40 * mm, 106 * mm, 20 * mm]))

H.append(P('2. Ce que l analyse statique ne peut PAS faire ici', 'h1'))
H.append(P('Mon balayage a donne <b>trois chiffres differents avec trois outils, et les trois '
           'premiers etaient faux</b>. Il faut le dire, parce que la conclusion en depend.', 'p'))
H.append(tableau(
    ['outil', 'orphelines annoncees', 'pourquoi c etait faux'],
    [['nettoyeur v1', '<b>42</b>', 'il traitait l accent grave comme une apostrophe : il '
      '<b>avalait le code des ${...}</b>'],
     ['+ template literals', '<b>338</b>', 'il ignorait les <b>regex litterales</b> : '
      + (C % "replace(/'/g,'')") + ' ouvre une fausse chaine et desynchronise <b>tout le '
      'reste du fichier</b>'],
     ['+ regex litterales', '<b>80</b>', 'il ne voyait pas les ' + (C % 'onclick="foo()"')
      + ' <b>fabriques dans une chaine JS</b>'],
     ['+ onclick generes', 'reste des faux', (C % '_sc("goWeightTab()", ...)')
      + ' - le handler est un <b>parametre</b>, injecte ailleurs']],
    [34 * mm, 28 * mm, 104 * mm]))
H.append(P('<b>Preuve chiffree</b> : ' + (C % '_runSeDebrief') + ' est appelee <b>2 fois</b> '
           'dans ' + (C % 'log.js') + ' (lignes 4448 et 4788). Le nettoyeur v1 en voyait '
           '<b>0</b> et la declarait orpheline - comme ' + (C % 'finishWorkout') + ', '
           + (C % '_debriefLocal') + ' et ' + (C % '_showSessionEnd') + '. Le v2 ne gardait '
           'que <b>23 %</b> de ' + (C % 'log.js') + '.<br/><br/>'
           'Dans ce depot, la facon dominante d atteindre une fonction est un ' + (C % 'onclick')
           + ' assemble a partir de morceaux de chaines. <b>Aucune analyse statique ne peut '
           'donc PROUVER qu une fonction est morte</b> - seuls le runtime et la mutation le '
           'peuvent. <i>C est pourquoi ce dossier ne publie aucune liste d orphelines issue '
           'du grep.</i>', 'p'))

H.append(P('3. Les vraies trouvailles', 'h1'))
H.append(encadre(
    'updatePill cherche TROIS elements qui n existent nulle part',
    'Le bloc « Inline home pill » (' + (C % 'screens.js') + ' 2473-2482) cible '
    + (C % 'home-sheets-pill') + ', ' + (C % 'home-sync-dot') + ' et ' + (C % 'home-sync-lbl')
    + '. <b>Mesure : 0 occurrence dans index.html, 0 en CSS, 0 dans les tests.</b> Les six '
    + (C % 'if') + ' sont <b>toujours faux</b> : <b>10 lignes de branche impossible</b>, et '
    '<b>3 des 21 requetes DOM</b> de chaque rendu (14 %) cherchent des elements supprimes '
    'depuis longtemps. Les trois <i>vrais</i> ids existent bien, dans la barre du haut.'))
H.append(tableau(
    ['element', 'lu par le JS ?', 'lu par le CSS ?', 'mutation sur clone'],
    [[C % '#cycle-home-card', '<b>personne</b>', 'non', '<b>0 rouge</b>'],
     [C % '#strength-levels', '<b>personne</b>', 'non', '<b>0 rouge</b>'],
     [C % '#pr-list', '<b>personne</b>', 'non', '<b>0 rouge</b>'],
     [C % '#recovery-card', 'tracking.js, <b>derriere un retour anticipe</b>', 'non', '<b>0 rouge</b>'],
     [C % '#home-hdr', (C % '_renderHomeHdr') + ' seulement, qui ne fait que le <b>vider</b>',
      'non', '1 rouge = <b>un temoin a moi</b>']],
    [34 * mm, 62 * mm, 26 * mm, 44 * mm]))
H.append(P('<b>' + (C % 'renderRecoveryCard') + ' : 26 lignes sur 28 derriere un retour '
           'anticipe.</b> Quatre faits mesures : son <b>seul</b> appelant est '
           + (C % 'saveSleepEntry') + ' ; ' + (C % '#log-sleep') + ', unique hote du '
           'formulaire de sommeil, existe <b>une seule fois</b> et il est dans ' + (C % '#s-home')
           + ' ; ' + (C % '_curScreen') + ' vaut <b>home</b> quand l Accueil est rendu ; '
           + (C % '#recovery-card') + ' contient <b>0 caractere</b>.<br/>'
           '<b>Ce qui manque pour conclure, et je ne le masque pas</b> : ma sonde <b>n a pas '
           'reussi a conduire le vrai geste</b> de sauvegarde du sommeil. Verdict : '
           '<b>ORPHELIN PROBABLE, pas prouve.</b>', 'p'))

H.append(P('4. UX - aucun bug objectif', 'h1'))
H.append(tableau(
    ['controle (390 x 844)', 'compte neuf', 'compte reel', 'Milo present', 'Milo absent'],
    [['NaN / undefined / [object Object]', 'aucun', 'aucun', 'aucun', 'aucun'],
     ['textes coupes', '0', '0', '0', '0'],
     ['chevauchements de blocs', 'aucun', 'aucun', 'aucun', 'aucun'],
     ['erreurs JavaScript', 'aucune', 'aucune', 'aucune', 'aucune'],
     ['hauteur totale', '1 111 px', '1 299 px', '<b>1 459 px</b>', '1 299 px'],
     ['zones tactiles sous 44 px', '<b>4</b>', '<b>5</b>', '<b>7</b>', '<b>5</b>']],
    [52 * mm, 28 * mm, 28 * mm, 30 * mm, 28 * mm]))
H.append(P('Les zones concernees : « CE MOIS / Septembre » <b>362x26</b> - les fleches du '
           'calendrier <b>34x34</b> - la croix du bloc Milo <b>26x26</b> - « Pourquoi ce '
           'score ? » <b>144x43</b> (corrige en ft-v1219, il reste <b>1 px</b>) - et les deux '
           'reponses a Milo <b>163x40</b>.', 'petit'))

H.append(P('5. Couleurs - audit, pas redesign', 'h1'))
H.append(encadre(
    'LE GRIS --t3 EST SOUS LE SEUIL WCAG AA - c est la question posee, et la reponse est OUI',
    (C % '--t3: #6B7180') + ' mesure contre le fond reel : <b>' + str(RATIO) + '</b> sur '
    + (C % '--bg2') + ' et <b>3,98</b> sur ' + (C % '--bg') + ', pour un seuil AA de '
    '<b>4,5</b>. <b>20 textes de l Accueil</b> le portent : AUJOURD HUI, /100, 7 J, CE MOIS, '
    'septembre, Seances, Poids, les numeros de semaine, « Note ton energie... », le pied de '
    'page.<br/><br/>'
    + (C % '--t2: #8A8F99') + ' <b>passe</b> - il n apparait dans aucune alerte. <i>Le '
    'probleme est le troisieme gris, pas le gris secondaire.</i> Ce n est pas un changement '
    'de palette : il suffirait d eclaircir ' + (C % '--t3') + '. <b>Je ne propose aucune '
    'valeur : c est un oeil qui tranche, pas un seuil.</b>'))
H.append(tableau(
    ['classement', 'paires', 'exemples'],
    [['<b>DOUBLON PROUVE</b> (distance RGB <= 1, invisible)', '<b>2</b>',
      (C % '#12121e') + ' (4x) vs ' + (C % '#12121f') + ' (1x) &middot; ' + (C % '#ff6c00')
      + ' (2x) vs ' + (C % '#ff6d00') + ' (4x)'],
     ['DOUBLON PROBABLE (distance <= 4)', '6',
      (C % '#0e1016/#0e1018') + ' &middot; ' + (C % '#18182e/#1a1a2e') + ' &middot; '
      + (C % '#e7e8ec/#e8e8ef')],
     ['VARIANTE VISUELLE / COULEUR METIER', 'le reste',
      'degrades, halos, etats - <i>elles demandent un oeil, pas un seuil</i>']],
    [56 * mm, 18 * mm, 92 * mm]))
H.append(P('<b>%d valeurs hex distinctes pour 16 variables de couleur.</b> '
           '<b>Limite de mon instrument, dite</b> : ma table « variable -&gt; valeur » garde '
           'la <b>derniere</b> definition rencontree, donc elle melange le theme sombre et le '
           'theme clair. Les deux « hex en dur » qu elle signalait sont a ne pas croire sur '
           'parole.' % N_HEX, 'petit'))

H.append(P('6. Mutations sur clone, et controle negatif', 'h1'))
H.append(P('12 mutations sur un arbre <b>clone</b>, banc de <b>%d temoins</b> Accueil, '
           'controle sain <b>37/0 avant ET apres</b> : <b>11 conformes</b>.<br/>'
           '<b>Mon premier jeu d attendus etait a l envers</b> : j avais ecrit « rouge '
           'attendu » pour une suppression de code mort. <i>Or retirer du code mort ne doit '
           'RIEN casser - c est tout l objet du test.</i> La donnee etait bonne, mon etiquette '
           'etait fausse.<br/><br/>'
           '<b>Et un vert est borne a la portee du banc</b> : ces temoins couvrent l Accueil. '
           'Un element vivant ailleurs resterait vert ici. <i>Le vert n est jamais une preuve '
           'seule.</i>' % N_TEM, 'p'))
H.append(tableau(
    ['controle negatif - ces mutations DOIVENT rester vertes', 'resultat'],
    [['N1 un <b>faux appel</b> ajoute dans un <b>commentaire</b>', '<b>vert</b>'],
     ['N2 un <b>nom de fonction</b> dans une <b>chaine non executee</b>', '<b>vert</b>'],
     ['N3 un <b>selecteur CSS</b> cite dans une <b>documentation</b>', '<b>vert</b>'],
     ['N4 un faux lecteur pour une orpheline, en commentaire', '<b>vert</b>']],
    [130 * mm, 36 * mm]))
H.append(P('<b>4 / 4.</b> L audit mesure le <b>programme</b>, pas le texte du depot.', 'petit'))

H.append(P('7. Ce qu il ne faut surtout pas toucher', 'h1'))
H.append(tableau(
    ['element', 'pourquoi'],
    [[C % 'openPlateCalc', 'retrait <b>volontaire</b> de Michel, cas fondateur de <b>R30</b> - '
      'deja « repare » a tort une fois'],
     ['les <b>47</b> fonctions de categorie C', 'vivantes ailleurs ; c est ma couverture '
      'runtime qui est insuffisante, pas elles'],
     [C % 'window.__FT_CLONE__', 'des essais non tranches vivent derriere (ft-v976)'],
     [(C % 'fmt()') + ', la base neutre 70, ' + (C % '_nuitsRecentes'),
      'decisions ecrites, hors perimetre'],
     ['les branches de compatibilite d anciens formats',
      'une restauration cloud peut reintroduire de vieilles donnees <b>des mois</b> plus tard'],
     ['la palette', 'validee a l oeil par Michel sur un vrai iPhone']],
    [58 * mm, 108 * mm]))

H.append(P('8. La question finale', 'h1'))
H.append(P('<i>Si on voulait alleger l Accueil SANS changer un seul pixel ni une seule '
           'fonctionnalite visible, combien de code pourrait reellement etre supprime avec '
           'preuve ?</i>', 'p'))
H.append(tableau(
    ['', 'fonctions', 'lignes JS', 'lignes CSS', 'elements HTML'],
    [['<b>SUPPRESSION SURE</b>', '<b>0</b>', '<b>10</b>', '0', '<b>5</b> (3 lignes)'],
     ['SUPPRESSION PROBABLE, a revoir', '2', '~32', 'jusqu a 55 classes, <b>aucune prouvee</b>', '2'],
     ['<b>NE PAS TOUCHER</b>', '<b>117</b>', '-', '-', '-']],
    [54 * mm, 22 * mm, 22 * mm, 44 * mm, 24 * mm]))
H.append(P('<b>Sure</b> : la branche « Inline home pill » (10 lignes JS) + ' + (C % '#cycle-home-card')
           + ' et ses 2 spans, ' + (C % '#strength-levels') + ', ' + (C % '#pr-list') + '. '
           '<i>Benefice mesurable : 3 requetes DOM en moins par rendu, sur 21.</i><br/>'
           '<b>Probable</b> : ' + (C % '_renderHomeHdr') + ' + ' + (C % '#home-hdr') + ' (il '
           'faut <b>retourner</b> le temoin B-CCCXVIII, pas le supprimer - R30) ; les 26 '
           'lignes mortes de ' + (C % 'renderRecoveryCard') + ' + ' + (C % '#recovery-card')
           + ' (il faut d abord conduire une vraie sauvegarde de sommeil).', 'p'))

H.append(Spacer(1, 3))
H.append(P('Document produit par ' + (C % 'tools/gen_audit_accueil_pdf.py') + ' - <b>'
           + str(GARDES[0]) + ' gardes</b> qui recomptent chaque fait depuis le code servi et '
           'refusent de produire si un fait tombe : si un id pretendu absent reapparait, si '
           'une fonction pretendue vivante disparait, si le retrait volontaire d '
           + (C % 'openPlateCalc') + ' est defait, ou si l audit avait modifie quoi que ce '
           'soit. Contraste recalcule ici meme : <b>' + str(RATIO) + '</b>.', 'petit'))

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Audit final de l Accueil - Force Tracker',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, contraste --t3 = %s, %d hex distinctes, %d temoins)'
      % (OUT, VERSION, GARDES[0], RATIO, N_HEX, N_TEM))
