#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dossier GPT — MINI-CHANTIER ACCUEIL (hors depot, regle d'or #14).

[!!] CE DOCUMENT AFFIRME QUE QUATRE CORRECTIONS SONT EN PLACE *ET* QUE RIEN D'AUTRE N'A BOUGE.
     Ses gardes reverifient les DEUX moities dans le code servi : si `fmt()` a ete touchee, si
     le moteur de recuperation a change, si le bloc est redescendu, si un garde-fou hors
     perimetre a saute, il REFUSE de produire. Un dossier qui decrit un arbre qu'on ne sert
     plus est pire qu'un dossier absent : il a l'air verifie.

[!!] LES CHIFFRES DE PASSE ET DE BANC SONT LUS DANS LEURS JOURNAUX, JAMAIS RETAPES
     (lecon ft-v1201 : un PDF a publie un total pendant que la passe tournait encore).
     Les autres sont RECOMPTES depuis le code servi.

[!] LE PIEGE PROPRE A CETTE PASSE : ses commentaires CITENT abondamment `fmt`, `NaN`,
    `wScore=70` et `home-hero` pour expliquer les decisions. Un garde qui ne distingue pas le
    CODE de ce qui en PARLE mesurerait la documentation — famille ft-v1193/1203/1205/1210.
    D'ou deux nettoyeurs, et le choix EXPLICITE de l'un ou l'autre a chaque garde.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji, entites decodees AVANT controle.
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
OUT = os.environ.get('FT_OUT') or '/tmp/DOSSIER-MINI-CHANTIER-ACCUEIL-16-09-2026.pdf'
BANC = os.environ.get('FT_BANC') or '/tmp/banc_accueil.log'
MUT = os.environ.get('FT_MUT') or '/tmp/mutations_accueil.log'
PASSE = os.environ.get('FT_PASSE') or '/tmp/passe_1219.log'

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_com(src):
    """Commentaires ET chaines retires — pour un fait qui vit dans le CODE."""
    out, i, n = [], 0, len(src)
    while i < n:
        c = src[i]
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i)
            i = n if j < 0 else j
        elif c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            i = n if j < 0 else j + 2
        elif c in '\'"`':
            j, q = i + 1, c
            while j < n and src[j] != q:
                j += 2 if src[j] == '\\' else 1
            out.append(q + q)
            i = j + 1
        else:
            out.append(c)
            i += 1
    return ''.join(out)


def sans_commentaires(src):
    """Commentaires retires, CHAINES GARDEES — pour un fait qui vit dans une CHAINE
    (ici : le HTML de la tuile et du bouton, qui EST une chaine)."""
    out, i, n = [], 0, len(src)
    while i < n:
        c = src[i]
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i)
            i = n if j < 0 else j
        elif c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            i = n if j < 0 else j + 2
        elif c in '\'"`':
            j, q = i + 1, c
            while j < n and src[j] != q:
                j += 2 if src[j] == '\\' else 1
            out.append(src[i:j + 1])
            i = j + 1
        else:
            out.append(c)
            i += 1
    return ''.join(out)


def corps(src, nom):
    """Corps REEL, borne par ses accolades — jamais une distance en caracteres (BUGS.md §63)."""
    m = re.search(r'(?:async\s+)?function\s+%s\s*\(' % re.escape(nom), src)
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


SCR = lire('screens.js')
TRK = lire('tracking.js')
STA = lire('state.js')
IDX = lire('index.html')
APP = lire('app.js')
SW = lire('sw.js')
RUN = lire(os.path.join('tests', 'parcours', 'runner.js'))
TEM = lire(os.path.join('tests', 'parcours', 'accueil_mini.js'))
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]

HOME_S = sans_commentaires(corps(SCR, 'renderHome'))    # la tuile vit dans une CHAINE
HERO_S = sans_commentaires(corps(SCR, '_renderHomeHero'))
HERO_C = sans_com(corps(SCR, '_renderHomeHero'))        # la logique vit dans le CODE
DET_C = sans_com(corps(TRK, 'calcRecoveryDetail'))
IDX_C = sans_commentaires(IDX)

# ══ (1) LE NaN — LA CORRECTION EST CHEZ L'APPELANT, ET `fmt()` EST INTACTE ═════════════
g(bool(HOME_S), 'renderHome introuvable dans screens.js')
# [!!] CE GARDE A REFUSE DE PRODUIRE SUR DU CODE PARFAITEMENT SAIN, ET L ERREUR ETAIT LA
#      MIENNE : il cherchait « const fmt=... » dans un texte dont j avais retire TOUS LES
#      ESPACES. Or le motif en contient un, entre `const` et `fmt` — donc il ne pouvait jamais
#      correspondre. *On ne retire pas les espaces d un cote sans les retirer de l autre.*
#      C est la 3e fois de la journee qu un garde mesure autre chose que ce qu il annonce
#      (famille : l aiguille et la botte de foin doivent subir la MEME transformation).
g(re.search(r'const\s+fmt\s*=\s*n\s*=>\s*Math\.round\(n\*10\)\s*/\s*10\s*;',
            sans_com(STA)) is not None,
  'fmt() a ete MODIFIEE : ce dossier affirme le contraire, et la consigne de Michel etait '
  'de ne pas y toucher (elle a de nombreux autres appelants)')
g("isFinite(_bwN)?fmt(_bwN):'—'" in HOME_S.replace(' ', ''),
  'le garde de la tuile poids a disparu du rendu : « NaN kg » peut revenir')
g('fmt(bwDisp)' not in HOME_S,
  'la tuile poids repasse la valeur BRUTE a fmt() : c est exactement le defaut corrige')
g("id=\"h-bw\"" in HOME_S and "'+bwTxt+'" in HOME_S.replace(' ', ''),
  'la tuile n affiche plus la valeur gardee')

# ══ (3) LE MOTEUR N'A PAS BOUGE, LE RENDU DECIDE ══════════════════════════════════════
g(bool(DET_C), 'calcRecoveryDetail introuvable dans tracking.js')
g(re.search(r'wScore\s*=\s*70\s*;', DET_C) is not None,
  'la base neutre 70 a disparu du MOTEUR : ce dossier affirme qu elle est intacte, et Michel '
  'a dit de ne pas la casser si elle est une valeur metier volontaire')
g('return{score,base,factors,tips:tips.slice(0,2),dayPains,' in DET_C.replace(' ', ''),
  'la forme de retour du moteur a change : le rendu et Milo ne lisent plus la meme chose')
g('_sansDonnee=' in HERO_C.replace(' ', ''), 'le silence du compte muet a disparu du rendu')
g('_nuitsRecentes(today(),3).length===0' in HERO_C.replace(' ', ''),
  'le critere ne lit plus _nuitsRecentes : il redeviendrait aveugle aux nuits MESUREES par '
  'la montre, et effacerait un score parfaitement reel')
g('&&!((S.sessions||[]).length)' in HERO_C.replace(' ', ''),
  'le critere n exige plus les DEUX absences : un ET devenu OU efface le score de quelqu un '
  'qui a des seances')
g('dayPains:_detail.dayPains' in HERO_C.replace(' ', ''),
  'le bandeau « gene du jour » ne survit plus au silence : un fait DECLARE disparaitrait avec '
  'un score DEVINE')
NUITS = sans_com(corps(TRK, '_nuitsRecentes'))
g('S.healthDaily' in NUITS and 'S.sleepLog' in NUITS,
  '_nuitsRecentes ne lit plus les deux sources : l argument central du point 3 tombe')

# ══ (2) L'ORDRE, DANS LE DOCUMENT SERVI ═══════════════════════════════════════════════
g(IDX_C.count('id="home-hero"') == 1,
  'index.html porte %d blocs home-hero : le deplacement a duplique le bloc'
  % IDX_C.count('id="home-hero"'))
_i_hero = IDX_C.index('id="home-hero"')
_i_milo = IDX_C.index('id="home-milo"')
_i_souv = IDX_C.index('id="home-souvenir"')
_i_obs = IDX_C.index('id="home-obs"')
g(_i_hero < _i_milo,
  'home-hero est REDESCENDU sous home-milo : la correction 2 de ce dossier est defaite')
g(_i_milo < _i_souv < _i_obs,
  'home-souvenir n est plus entre home-milo et home-obs : une decision anterieure a ete '
  'defaite au passage (R30 — « un souvenir ne passe pas devant une relance »)')

# ══ (4) LA ZONE TAPABLE — COMPENSEE, PAS AJOUTEE ══════════════════════════════════════
g('padding:13px 10px;margin:-9px -10px -9px;' in HERO_S,
  'la zone tapable de « Pourquoi ce score ? » n est plus agrandie-puis-compensee : soit elle '
  'redevient haute de 17 px, soit l ecran bouge')
g('openRecoWhy()' in HERO_S, 'le bouton n appelle plus l explication')

# ══ (5) LA DETTE R30, ECRITE ET FIGEE ═════════════════════════════════════════════════
g('DETTE R2 CONFIRM' in SCR,
  'l inventaire de la dette « derniere pesee » a ete efface du code (R30) : une dette qu on '
  'ne sait plus retrouver n est plus une dette, c est un piege')
# [!!] LE CHIFFRE « 4 SITES » EST RECOMPTE, JAMAIS RECOPIE DU BROUILLON.
# [!!] CE GARDE COMPTAIT L IDIOME, PAS LA QUESTION — et il a refuse de produire en annoncant
#      « 5 sites et non 4 ». Il avait raison de rougir et tort dans son libelle : le 5e est
#      `renderPasCard`, qui cherche LE DERNIER JOUR AVEC DES PAS dans `S.healthDaily`. Meme
#      tournure, autre question. *Un garde qui compte une FORME ne mesure pas une DETTE* :
#      la dette decrite par ce dossier est « la derniere PESEE », donc le motif s ancre sur
#      `S.weightLog`. (L idiome, lui, est retape 5 fois pour 2 questions differentes — c est
#      une observation reelle, notee au §5 du dossier, mais c est un AUTRE proprietaire.)
MOTIF = r"S\.weightLog\.slice\(\)\.sort\(\(a,b\)=>b\.date\.localeCompare\(a\.date\)\)\[0\]"
N_SCR = len(re.findall(MOTIF, sans_com(SCR)))
N_TRK = len(re.findall(MOTIF, sans_com(TRK)))
g(N_SCR + N_TRK == 4,
  'la dette « derniere pesee » compte %d sites et non 4 : soit elle a ete centralisee (et ce '
  'dossier dit le contraire), soit elle a grossi' % (N_SCR + N_TRK))
g(N_SCR == 1, 'screens.js porte %d copies au lieu d une' % N_SCR)
g('S.weightLog[0].kg' in sans_com(TRK),
  'le 5e lecteur qui repond AUTREMENT a disparu : l argument du point 5 tombe')

# ══ LE PERIMETRE : CE QUI N'A PAS LE DROIT D'AVOIR BOUGE ══════════════════════════════
g("const ctaLabel='↩ Reprendre la séance';" in sans_commentaires(SCR),
  'le bouton « Reprendre la seance » a change : hors perimetre')
g(re.search(r'im>=90\)', HERO_C) is not None,
  'le SEUIL du rappel « ta seance est encore ouverte » a bouge : hors perimetre. '
  '(Ce garde est FERME par la parenthese : ecrit « im>=90 » tout court, il laisserait passer '
  'im>=9000 — la sous-chaine, 4e fois de ce projet.)')
g('_renderHomeCalendar();' in sans_com(corps(SCR, 'renderHome')),
  'le calendrier de l Accueil n est plus rendu : hors perimetre')
g('goSessionsHistory()' in HOME_S, 'la tuile « Seances ce mois » a disparu : hors perimetre')
g('function _douaneLigne(' in APP,
  'la douane Nutrition a disparu d app.js : cette passe ne devait pas y toucher')
g('_foodLogIdentifier(S.foodLog)' in sans_com(SCR),
  'le filet d identite du journal alimentaire (ft-v1218) a saute : hors perimetre')

# ══ LES TEMOINS PERMANENTS, RECOMPTES ═════════════════════════════════════════════════
N_ECRAN = len(re.findall(r"t\('B-CCCXVIII ", TEM))
N_SRC = len(re.findall(r"t\('B-CCCXIX ", TEM))
g(N_ECRAN == 21, 'le bloc B-CCCXVIII ne porte plus 21 temoins (%d)' % N_ECRAN)
g(N_SRC == 16, 'le bloc B-CCCXIX ne porte plus 16 temoins (%d)' % N_SRC)
g("require('./accueil_mini.js').ecran(t, b, PORT)" in RUN,
  'le banc de parcours n appelle plus les temoins de l ecran : ils ne tourneraient qu au '
  'controle negatif, donc jamais en livraison')
g("require('./accueil_mini.js').source(t, ROOT, fs, path)" in RUN,
  'le banc de parcours n appelle plus les temoins de source')


# ══ LES JOURNAUX : LUS, JAMAIS RETAPES ════════════════════════════════════════════════
def journal(p):
    try:
        return open(p, encoding='utf-8').read()
    except OSError:
        return ''


LB = journal(BANC)
_mb = re.search(r'BANC ACCUEIL\s*:\s*(\d+)\s*OK\s*/\s*(\d+)\s*ROUGE', LB)
g(bool(_mb), 'le journal du banc (%s) ne porte pas de ligne de total' % BANC)
B_OK, B_KO = int(_mb.group(1)), int(_mb.group(2))
g(B_KO == 0, 'le banc porte %d rouge(s)' % B_KO)
g(B_OK == N_ECRAN + N_SRC,
  'le banc annonce %d temoins alors que les blocs en portent %d : une partie ne tourne pas'
  % (B_OK, N_ECRAN + N_SRC))

LM = journal(MUT)
_mm = re.search(r'(\d+)\s*/\s*(\d+)\s*mutations conformes', LM)
g(bool(_mm), 'le journal du controle negatif (%s) ne porte pas de ligne de total' % MUT)
M_OK, M_TOT = int(_mm.group(1)), int(_mm.group(2))
g(M_OK == M_TOT, 'seules %d mutations sur %d sont conformes' % (M_OK, M_TOT))
# [!!] LE CONTROLE SAIN DOIT AVOIR TOURNE AVANT *ET* APRES : sans l'un des deux, une serie de
#      mutations peut avoir laisse l'arbre casse sans que rien ne le dise.
g(LM.count('CONTROLE SAIN') == 2,
  'le controle sain n a pas tourne des deux cotes : une serie de mutations peut avoir laisse '
  'l arbre casse en silence')
g('DOIT RESTER VERTE' in LM,
  'la mutation temoin qui doit RESTER verte a disparu : plus rien ne prouve qu on mesure le '
  'CODE et non la DOCUMENTATION')

LP = journal(PASSE)
_mp = re.search(r'TOTAL CROIS\S+\s*:\s*(\d+)\s*\S+\s*\S+\s*(\d+)', LP)
P_KO_LIGNES = len(re.findall(r'^\s*❌', LP, re.M))
if _mp:
    FINIE, P_OK, P_KO = True, int(_mp.group(1)), int(_mp.group(2))
else:
    FINIE, P_OK, P_KO = False, len(re.findall(r'^\s*✅', LP, re.M)), P_KO_LIGNES
g(P_KO == 0, 'la passe porte %d rouge(s) : rien ne se publie' % P_KO)
# [!!] ft-v1201 : ne JAMAIS annoncer un total de passe qui n'existe pas encore.
PASSE_TXT = ('%d / %d' % (P_OK, P_OK + P_KO)) if FINIE else 'EN COURS (%d verts a cet instant)' % P_OK

# ═══════════════════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')

_ss = getSampleStyleSheet()
ST = {
    'titre': ParagraphStyle('t', parent=_ss['Title'], fontName='Helvetica-Bold',
                            fontSize=16.5, leading=20, textColor=ENCRE, spaceAfter=2),
    'sous': ParagraphStyle('s', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=8.8, leading=11.5, textColor=GRIS, spaceAfter=9),
    'h1': ParagraphStyle('h1', parent=_ss['Normal'], fontName='Helvetica-Bold',
                         fontSize=11.2, leading=13.5, textColor=ROUGE,
                         spaceBefore=10, spaceAfter=4),
    'p': ParagraphStyle('p', parent=_ss['Normal'], fontName='Helvetica',
                        fontSize=8.8, leading=12, textColor=ENCRE, spaceAfter=5),
    'petit': ParagraphStyle('pt', parent=_ss['Normal'], fontName='Helvetica',
                            fontSize=7.7, leading=10.2, textColor=GRIS, spaceAfter=4),
    'cell': ParagraphStyle('c', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=8, leading=10.2, textColor=ENCRE),
    'cellg': ParagraphStyle('cg', parent=_ss['Normal'], fontName='Helvetica-Bold',
                            fontSize=8, leading=10.2, textColor=ENCRE),
}


def _v(s):
    rendu = html.unescape(s)
    try:
        rendu.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE - hors cp1252 apres rendu : %r (dans %r)'
                         % (rendu[e.start:e.end], s[:70]))
    return s


def P(txt, st='p'):
    return Paragraph(_v(txt), ST[st])


C = '<font face="Courier" size="7.6">%s</font>'


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
        ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 3.4), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 7)])


H = []
H.append(P('Mini-chantier Accueil : quatre corrections d interface', 'titre'))
H.append(P('Force Tracker - 16/09/2026 - base %s - suite de l audit de l onglet Accueil du '
           'meme jour. Zero fonctionnalite nouvelle. Document hors depot.' % VERSION, 'sous'))

H.append(encadre(
    'EN UNE PHRASE',
    'Quatre defauts d interface corriges <b>sans toucher a ce qui les entoure</b> : le '
    + (C % 'NaN kg') + ' de la tuile poids (corrige <b>chez l appelant</b>, ' + (C % 'fmt()')
    + ' est intacte), la carte de recuperation remontee <b>devant</b> les deux sollicitations '
    'de Milo (<b>une</b> ligne deplacee), l Accueil qui cesse d <b>affirmer</b> une '
    'recuperation a quelqu un qui ne lui a jamais rien dit (au <b>rendu</b> - le moteur et sa '
    'base 70 sont intacts), et la zone tapable de ' + (C % '« Pourquoi ce score ? »')
    + ' passee de 124x17 a 144x43 <b>sans que l ecran bouge d un pixel</b>.'
    '<br/><br/>'
    '<b>Ce qui n est PAS fait, et qui revient a Michel</b> : ' + (C % 'home-daystate')
    + ' est lui aussi une question et reste apres les sollicitations (il devient coupe a son '
    'tour) ; et la dette R2 de « la derniere pesee » est <b>confirmee mais laissee ouverte</b>, '
    'avec son inventaire ecrit dans le code.'))

# 1
H.append(P('1. Le NaN kg - et le tiret qui etait deja prevu', 'h1'))
H.append(P('Mesure : <b>100 % des comptes neufs</b> affichaient ' + (C % 'NaN kg') + '. La cause '
           'n est pas l absence d un repli, c est que le repli <b>n atteignait jamais '
           'l ecran</b> : ' + (C % "bwDisp") + ' vaut deja ' + (C % "'—'") + ' quand rien n est '
           'pese, mais il passait par ' + (C % 'fmt()') + ', et ' + (C % "Math.round('—'*10)/10")
           + ' vaut NaN.<br/><br/>'
           '<b>La correction est chez l appelant, jamais chez ' + (C % 'fmt()') + '</b> (consigne '
           'explicite de Michel : elle a de nombreux autres appelants). <i>Un garde pose chez le '
           'proprietaire change le contrat de tous ses lecteurs ; un garde pose chez l appelant '
           'n engage que lui.</i> Effet de bord utile : une valeur non numerique venue d un '
           'import (' + (C % "'84,5'") + ') rendait NaN elle aussi.', 'p'))
H.append(tableau(
    ['etat du compte', 'avant', 'apres'],
    [['neuf, aucune pesee', 'NaN kg', '<b>- kg</b>'],
     ['poids du profil seul (84)', '84 kg', '84 kg'],
     ['une pesee / plusieurs pesees', '79.4 kg', '79.4 kg'],
     ['apres suppression de toutes les pesees', 'NaN kg', '<b>- kg</b>'],
     ['valeur importee « 84,5 »', 'NaN kg', '<b>- kg</b>']],
    [62 * mm, 52 * mm, 52 * mm]))

# 2
H.append(P('2. La carte de recuperation passe devant les sollicitations', 'h1'))
H.append(P('iPhone 390x844, zone utile 780 px, compte realiste. <b>La raison est en pixels, pas '
           'en gout</b> : la carte commencait a <b>y = 573</b> et finissait a 878, donc '
           '<b>coupee</b>. <i>Le chiffre qui repond a « est-ce que je peux m entrainer '
           'aujourd hui ? » n etait jamais visible sans faire defiler, pendant que deux demandes, '
           'elles, l etaient entierement.</i>', 'p'))
H.append(tableau(
    ['bloc', 'top AVANT', 'top APRES'],
    [[(C % 'home-milo') + ' (relance de Milo)', '84', '392'],
     [(C % 'home-obs') + ' (observation a valider)', '254', '562'],
     [(C % 'home-daystate') + ' (« comment tu te sens ? »)', '435', '<b>743 - coupe</b>'],
     ['<b>' + (C % 'home-hero') + ' (la recup)</b>', '<b>573 - coupe</b>', '<b>84 - entiere</b>'],
     [(C % 'home-stats') + ' / ' + (C % 'home-secondary'), '878 / 967', '881 / 970']],
    [72 * mm, 47 * mm, 47 * mm]))
H.append(encadre(
    'CE QUE CA NE REGLE PAS, ET C EST DIT',
    (C % 'home-daystate') + ' (« comment tu te sens aujourd hui ? ») est <b>lui aussi une '
    'question</b>, et il reste apres les deux sollicitations - il devient meme coupe a son tour. '
    'Le deplacer etait le geste <b>suivant</b>, pour deux raisons : la consigne etait « un '
    'changement minimal », et surtout ce bloc <b>alimente</b> le score. Le placer avant ou apres '
    'la carte change l ordre de lecture (« je dis comment je vais -> voici mon score » contre '
    '« voici mon score -> dis-moi comment tu vas »). <b>C est un choix de produit, pas une '
    'correction.</b> Decision rendue a Michel.'))

# 3
H.append(P('3. L Accueil n affirme plus rien sur quelqu un qu il ne connait pas', 'h1'))
H.append(P('Compte neuf : l ecran annoncait <b>« 70/100 - Bonne recuperation, seance normale '
           'possible »</b>. Mesure, les <b>seuls facteurs</b> de ce score sont « Recup de base '
           '70 » (une <b>convention de calcul</b>) et « Age -3 » (une <b>constante de profil</b>). '
           '<b>Rien du corps de la personne n y entre.</b> L app presentait une convention comme '
           'une mesure (Principe 18, et R29 : quelqu un d epuise pouvait lire « seance normale '
           'possible »).', 'p'))
H.append(P('<b>Le moteur n est pas touche</b> - la base 70 est une decision ecrite que d autres '
           'lecteurs emploient. On ne change pas le CALCUL, on change ce que l Accueil ose '
           'AFFIRMER. <b>Et le critere n est pas invente</b> : ' + (C % 'recupHistorique')
           + ' refuse deja de tracer un point avant la premiere nuit ou la premiere seance, pour '
           'cette raison mot pour mot (« une invention presentee comme une mesure »). On pose la '
           'meme regle sur aujourd hui, en exigeant les <b>deux</b> absences.<br/><br/>'
           '<b>Une difference assumee</b> : on lit ' + (C % '_nuitsRecentes') + ', proprietaire '
           'unique des nuits (R2), qui voit <b>aussi</b> les nuits MESUREES par la montre. Sans '
           'ca, le critere naif aurait efface un score parfaitement reel - c est une mutation qui '
           'l a prouve.', 'p'))
H.append(tableau(
    ['compte', 'score du moteur', 'avant', 'apres'],
    [['<b>muet</b> (rien du tout)', '67', 'Bonne recuperation', '<b>Enregistre ton sommeil</b>'],
     ['sommeil note hier', '76', '76 /100', '<b>76 /100</b>'],
     ['une seance seule', '65', '65 /100', '<b>65 /100</b>'],
     ['nuit <b>MESUREE</b> par la montre', '73', '73 /100', '<b>73 /100</b>']],
    [50 * mm, 26 * mm, 40 * mm, 50 * mm]))
H.append(P('Le bandeau « gene du jour » <b>survit au silence</b> : une douleur signalee est un '
           'fait <b>declare</b>, pas un score devine. <b>Limite ecrite plutot que tue</b> : '
           'quelqu un qui a des seances mais n a jamais note de nuit garde son score, base neutre '
           'comprise - c est le comportement d avant, et son conseil « Renseigne ton sommeil » '
           'est deja affiche.', 'petit'))

# 4
H.append(P('4. La zone tapable : on agrandit la surface, pas le texte', 'h1'))
H.append(P('<b>124 x 17 px</b> mesures : le doigt visait la hauteur d une ligne de texte. '
           + (C % 'padding') + ' pour la surface, ' + (C % 'margin') + ' <b>negative</b> de la '
           'meme quantite pour que l ecran ne bouge pas -> <b>144 x 43 px</b>.<br/><br/>'
           '<b>La marge haute est bornee a -9 px, et ce n est pas un chiffre rond</b> : c est '
           'exactement le ' + (C % 'margin-top:9px') + ' de la rangee, donc l espace <b>vide</b>. '
           'Aller plus haut ferait deborder la zone sur la ligne des facteurs - <i>un bouton '
           'invisible par-dessus un texte qui n en est pas un</i> : on taperait « Seance recente '
           '-3 » et une fiche s ouvrirait. <b>On prend la place libre, jamais celle d un '
           'voisin.</b> Mesure : haut de zone 282 px, bas des facteurs 282 px - contact exact, '
           'aucun chevauchement. Un temoin <b>clique reellement</b> dessus, parce qu un pave '
           'transparent qui n appelle rien serait pire que l ancienne petite zone.', 'p'))

# 5
H.append(P('5. La dette « derniere pesee » : confirmee, laissee ouverte', 'h1'))
# [!] Le compte est INSERE, jamais interpole dans un morceau de la concatenation : un `%`
#     colle a la derniere chaine ne formate QUE celle-la — vecu deux lignes plus haut.
N_DETTE = str(N_SCR + N_TRK)
H.append(P('Consigne : « NE refactore pas automatiquement. D abord, confirme la duplication. » '
           '<b>Confirmee</b> : ' + (C % 'S.weightLog.slice().sort(desc)[0]') + ' est retape '
           '<b>' + N_DETTE + ' fois</b>, et un <b>cinquieme</b> lecteur repond autrement ('
           + (C % 'S.weightLog[0].kg') + ', qui se fie au tri en place). <i>Deux methodes pour '
           'une question, c est exactement la forme que prend une divergence future.</i>'
           '<br/><br/>'
           '[!] <b>Et une observation trouvee par le garde de ce document</b>, qui avait d abord '
           'compte 5 : la meme tournure sert AUSSI a ' + (C % 'renderPasCard') + ' pour trouver '
           '<i>le dernier jour avec des pas</i> dans ' + (C % 'S.healthDaily') + '. Meme forme, '
           '<b>autre question</b> - donc un autre proprietaire, plus large (« la derniere entree '
           'd un journal date »). <i>Un garde qui compte une FORME ne mesure pas une DETTE.</i>',
           'p'))
H.append(tableau(
    ['site', 'ce qu il rend', 'repli'],
    [[(C % 'screens.js') + ' (la tuile)', 'l entree', "S.bw ou '-'"],
     [(C % 'tracking.js') + ' ~600 (pre-remplissage)', 'l entree', "S.bw ou ''"],
     [(C % 'tracking.js') + ' ~732 (graphique)', '<b>le kilo</b>', 'S.bw ou 0'],
     [(C % 'tracking.js') + ' ~908 (import)', 'l entree', '<b>aucun</b>']],
    [72 * mm, 47 * mm, 47 * mm]))
H.append(P('<b>Non centralisee, et la raison compte</b> : les quatre copies n ont <b>pas le meme '
           'contrat</b>, les unifier demande de le TRANCHER, et trois sur quatre vivent dans le '
           'parcours de pesee / d import / du graphique - <b>que cette passe ne mesure pas</b>. '
           '<i>Un proprietaire qu on cree sans eprouver ses lecteurs deplace le bug, il ne le '
           'corrige pas.</i> Ce qui a ete fait a la place, et qui coute zero : l inventaire est '
           '<b>ecrit dans le code</b> a l endroit qu il concerne (R27), et un temoin fige qu il y '
           'reste (R30).', 'p'))

# 6
H.append(P('6. Ce qui n a pas bouge - le perimetre, chacun fige par un temoin', 'h1'))
H.append(tableau(
    ['ce qui est fige', 'temoin'],
    [[(C % 'fmt()') + ' (state.js)', 'B-CCCXIX (1) - mutation M1 mord'],
     ['la base neutre <b>70</b> du moteur', 'B-CCCXIX (4) - mutation M8 mord'],
     ['la forme de retour de ' + (C % 'calcRecoveryDetail'), 'B-CCCXIX (5)'],
     [(C % 'home-souvenir') + ' sous ' + (C % 'home-milo'), 'B-CCCXIX (11) - M11 mord'],
     ['le rappel « seance encore ouverte » (<b>seuil 90 min</b>)', 'B-CCCXIX (13) - M16 mord'],
     ['le calendrier / la tuile « Seances »', 'B-CCCXIX (15) - M17 mord'],
     ['Nutrition, la douane, l identite des lignes du journal', 'B-CCCXIX (14)'],
     ['<b>le bouton central (regle d or #9)</b>', 'B-CCCXVIII (20)']],
    [96 * mm, 70 * mm]))
H.append(P('Fichiers <b>non touches</b> : ' + (C % 'app.js state.js tracking.js coach.js log.js '
           'setup.js supabase.js constants.js style.css Code.js worker.js') + '. <b>Cout de '
           'rendu</b> : 6,1 -> 6,7 ms a froid, 1,6 -> 2,0 ms a chaud - <i>dans la dispersion des '
           'mesures, donc ni gain ni perte revendiques</i>. (Le 62,8 ms de l audit etait un rendu '
           'a froid complet au chargement : le comparer a un rendu a chaud ferait croire a un '
           'gain de 60 ms qui n existe pas.)', 'petit'))

# 7
H.append(P('7. Les temoins, et pourquoi il en faut de deux sortes', 'h1'))
H.append(P('<b>%d temoins</b> dans ' % (N_ECRAN + N_SRC) + (C % 'tests/parcours/accueil_mini.js')
           + ', appele par le banc de parcours <b>et</b> par le controle negatif - un seul '
           'proprietaire (R2), donc pas de version « du banc » et version « des mutations » qui '
           'pourraient diverger. Le fichier est a part pour une raison mesuree : gardes dans le '
           'runner, chacune des %d mutations aurait coute une passe complete, soit <b>plus de six '
           'heures</b>.<br/><br/>'
           '<b>%d temoins a l ecran</b> (B-CCCXVIII, navigateur reel 390x844) et <b>%d temoins de '
           'source</b> (B-CCCXIX). <b>Pourquoi les deux</b> : plusieurs mutations laissent l ecran '
           '<b>parfaitement juste</b> tout en defaisant la decision - la plus nette etant '
           '<b>M1</b>, reparer le NaN en modifiant ' % (M_TOT, N_ECRAN, N_SRC) + (C % 'fmt()')
           + ', qui produit exactement le meme affichage et casse silencieusement ses autres '
           'appelants. <i>Un banc qui n observe que la SORTIE ne voit pas la CAUSE regresser quand '
           'une autre couche la rattrape.</i><br/><br/>'
           '<b>18 des %d temoins rougissent sur l arbre d avant</b> : chacune des quatre '
           'corrections est couverte dans les deux sens.' % (N_ECRAN + N_SRC), 'p'))

# 8
H.append(P('8. Le controle negatif : %d mutations, %d conformes' % (M_TOT, M_OK), 'h1'))
H.append(P('Sur un arbre <b>CLONE</b> (BUGS.md §60), controle sain <b>%d OK / 0 rouge AVANT et '
           'APRES</b>. Les plus utiles ne sont pas celles qui cassent l affichage, mais celles '
           'qui <b>defont une decision en laissant l ecran juste</b> : M1 (reparer '
           % B_OK + (C % 'fmt()') + '), M5 (le critere devient naif et efface une nuit mesuree), '
           'M13 (la zone est agrandie sans marge negative, donc l ecran bouge).', 'p'))
H.append(encadre(
    'LA MUTATION QUI DOIT RESTER VERTE - LE CONTROLE DU CONTROLE',
    'On ajoute un simple <b>commentaire</b> citant ' + (C % 'fmt(bwDisp)') + ', ' + (C % 'NaN')
    + ', ' + (C % 'wScore=70') + ' et ' + (C % 'home-hero') + '. Le banc doit rester '
    '<b>parfaitement vert</b>.<br/><br/>'
    'C est la <b>seule facon de prouver qu on mesure le CODE et non la DOCUMENTATION</b> - et '
    'les commentaires de cette passe citent abondamment tout ce que les temoins cherchent. '
    'Famille d erreurs deja payee quatre fois dans ce projet (ft-v1193, 1203, 1205, 1210).'))

# 9
H.append(P('9. Ce qui a rate en chemin - deux defauts d instrument, tous les deux a moi', 'h1'))
H.append(P('<b>(a) Un temoin AVEUGLE - quatrieme fois de ce projet, meme famille.</b> Mon garde '
           'de perimetre cherchait ' + (C % 'im&gt;=90') + ' pour prouver que le rappel « ta '
           'seance est encore ouverte » n avait pas bouge. La mutation qui porte le seuil a '
           + (C % 'im&gt;=9000') + ' - donc qui <b>eteint</b> le rappel - le laissait '
           '<b>parfaitement vert</b>, puisque <i>« im&gt;=90 » est contenu dans « im&gt;=9000 »</i>. '
           'Un motif qui cherche une PRESENCE ne mesure pas une VALEUR : ferme par la parenthese. '
           'Familles precedentes : ' + (C % 'presentsX') + ' (ft-v1207), ' + (C % 'needsCode2')
           + ' (ft-v1216), « BLOC CCCX » (ft-v1212).<br/><br/>'
           '<b>(b) Une mutation a l ancre ambigue.</b> ' + (C % '_renderHomeCalendar();')
           + ' apparait trois fois : mon banc a repondu « ANCRE INVALIDE (3 occurrences) » au lieu '
           'de remplacer au hasard. <i>Une mutation qui ne s applique pas ressemble trait pour '
           'trait a une mutation qui ne mord pas</i> - sans ce garde, j aurais compte un temoin '
           'aveugle de plus sans le savoir.<br/><br/>'
           '<b>(c) Une correction de perimetre declaree AVANT de coder.</b> Ma ligne du journal '
           'de partage excluait ' + (C % 'index.html') + ' ; le correctif 2 s y fait. La ligne a '
           'ete corrigee et repoussee <b>avant</b> de toucher au fichier.', 'p'))

# 10
H.append(P('10. Un defaut de l archive, trouve en archivant - et non corrige au-dela de '
           'l etiquette', 'h1'))
H.append(P('En demenageant la plus ancienne entree du journal recent, ' + (C % 'check_regles.py')
           + ' a signale <b>une entree ecrite deux fois : ft-v1211</b>. Mesure avant de toucher a '
           'quoi que ce soit : ce n etaient pas deux copies de la meme version, mais <b>deux '
           'versions differentes portant le meme numero</b> - l entree du banc des moteurs de '
           'code-barres, archivee sous son numero <b>provisoire</b>, et le vrai ft-v1211 que je '
           'venais d archiver. La premiere est <b>identique a l octet pres</b> (9 976 caracteres '
           'compares) a l entree ft-v1212 de ' + (C % 'CLAUDE.md') + '.<br/><br/>'
           '<b>J ai corrige l ETIQUETTE, je n ai RIEN retire</b>, et la raison est ecrite sur '
           'place. <b>Ce qui reste a trancher, et qui revient a Michel</b> : cette entree vit dans '
           'les <b>deux</b> fichiers - elle a ete archivee trop tot. <i>Un demenagement est un '
           'couper/coller ; si on ne coupe pas, on duplique.</i> Le garde a fait exactement son '
           'travail : ce defaut dormait depuis quatre jours, invisible.', 'p'))

# 11
H.append(P('11. Ce qui n est pas prouve, et ce qui reste ouvert', 'h1'))
H.append(P('<b>Non mesurable depuis ce conteneur : Safari / iPhone reel.</b> Les mesures sont '
           'faites dans Chromium a 390x844. Les hauteurs de bloc dependent des polices et du '
           'moteur de rendu : <i>l ordre et la presence sont certains, les pixels sont ceux de ce '
           'navigateur-la.</i> Michel doit verifier sur son telephone que la carte de recup tient '
           'bien entiere.', 'p'))
H.append(tableau(
    ['#', 'reste ouvert', 'pourquoi'],
    [['1', (C % 'home-daystate') + ' reste apres les sollicitations et devient coupe',
      'choix de produit, pas correction'],
     ['2', 'la dette R2 « derniere pesee »', 'passe a part, avec son banc'],
     ['3', 'un ' + (C % 'kg') + ' a 0 reste affiche « 0 kg »', 'decision, pas correction'],
     ['4', 'des seances mais jamais de nuit : base neutre gardee', 'cas non nomme par Michel'],
     ['5', 'l entree archivee en double (CLAUDE.md + archive)', 'a trancher par Michel']],
    [8 * mm, 86 * mm, 72 * mm]))

# 12
H.append(P('12. Les huit questions', 'h1'))
H.append(tableau(
    ['#', 'question', 'reponse et preuve'],
    [['1', 'le NaN kg est-il corrige ?', '<b>OUI</b> - 7 etats mesures, aucun NaN'],
     ['2', (C % 'fmt()') + ' a-t-elle ete modifiee ?',
      '<b>NON</b> - B-CCCXIX (1), mutation M1 mord'],
     ['3', 'la recup passe-t-elle avant les sollicitations ?',
      '<b>OUI</b> - 573 -> 84, entiere'],
     ['4', 'le changement est-il minimal ?',
      '<b>OUI</b> - <b>une</b> ligne ; ordre des autres blocs verifie sur le document reel'],
     ['5', 'le compte vide affirme-t-il encore une recuperation ?',
      '<b>NON</b> - « Enregistre ton sommeil »'],
     ['6', 'le moteur (score 70) a-t-il ete casse ?',
      '<b>NON</b> - ' + (C % 'wScore=70') + ' intact, M8 mord'],
     ['7', 'la zone tapable atteint-elle ~44 px ?',
      '<b>PARTIEL</b> - <b>43 px</b> (144x43), soit 1 px sous le repere : obtenus <b>sans '
      'deplacer l ecran</b> et <b>sans mordre sur le voisin</b> ; les 44 exigeraient l un ou '
      'l autre'],
     ['8', 'la dette « derniere pesee » est-elle centralisee ?',
      '<b>NON - laissee ouverte, comme autorise</b> : duplication confirmee (%d + 1 sites), '
      'contrats differents, 3 sur 4 hors perimetre' % (N_SCR + N_TRK)],
     ['+', 'une fonctionnalite a-t-elle ete ajoutee ?',
      '<b>NON</b> - B-CCCXIX (13)(14)(15), M16/M17 mordent']],
    [8 * mm, 66 * mm, 92 * mm]))

H.append(Spacer(1, 3))
H.append(P('Document produit par ' + (C % 'tools/gen_accueil_mini_pdf.py') + ' - <b>' +
           str(GARDES[0]) + ' gardes</b> qui recomptent chaque fait depuis le code servi ou le '
           'lisent dans les journaux, et refusent de produire si un fait tombe - y compris si '
           + (C % 'fmt()') + ' a ete touchee, si le moteur a change, ou si le bloc est '
           'redescendu. Banc : %d/%d. Controle negatif : %d/%d. Passe : %s.'
           % (B_OK, B_OK + B_KO, M_OK, M_TOT, PASSE_TXT), 'petit'))

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Mini-chantier Accueil - quatre corrections d interface',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, banc %d/%d, mutations %d/%d, passe %s)'
      % (OUT, VERSION, GARDES[0], B_OK, B_OK + B_KO, M_OK, M_TOT, PASSE_TXT))
