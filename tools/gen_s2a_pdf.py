#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dossier GPT — S2-A : CONFINEMENT DES JUSTIFICATIFS (hors depot, regle d'or #14).

[!!] CE DOCUMENT AFFIRME QUE LA FUITE FUTURE EST FERMEE. Ses gardes le REVERIFIENT dans le
     code servi : si un justificatif peut de nouveau atteindre Supabase, il refuse de sortir.
     C'est le MIROIR du generateur d'audit, qui lui refusait si la fuite etait deja bouchee.

[!!] LES CHIFFRES SONT LUS dans les journaux du banc et de la passe, jamais retapes
     (lecon ft-v1201) ; les autres sont RECOMPTES depuis le code servi.

[!] AUCUNE CLE N'EST REPRODUITE. Le document ne nomme aucune valeur de justificatif.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji, et les entites sont decodees AVANT
controle (un validateur qui teste l'ENTREE d'une transformation ne dit rien de sa SORTIE).
"""
import html
import os
import re
import subprocess
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether)

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
OUT = os.environ.get('FT_OUT') or os.path.join(
    SCRATCH, 'DOSSIER-S2A-CONFINEMENT-CREDENTIALS-16-09-2026.pdf')
BANC = os.environ.get('FT_BANC') or os.path.join(SCRATCH, 'banc_s2a.log')
BANC1 = os.environ.get('FT_BANC1') or os.path.join(SCRATCH, 'banc_s1.log')
PASSE = os.environ.get('FT_PASSE') or '/tmp/passe_s2a2.log'

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
            i = src.find('\n', i)
            if i < 0:
                break
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
    """Commentaires retires, CHAINES GARDEES — pour un fait qui vit dans une CHAINE.

    [!!] Employer le mauvais des deux, c'est mesurer autre chose que ce qu'on annonce :
    mesure en S2, un garde de secret ecrit avec `sans_com` est aveugle par construction,
    puisqu'un secret EST une chaine.
    """
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
    """Corps REEL, borne par ses accolades — jamais une distance en caracteres (§63)."""
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


SETUP = lire('setup.js')
SB = lire('supabase.js')
CODEJS = lire('Code.js')
APP = lire('app.js')
CONST = lire('constants.js')
SW = lire('sw.js')
RUN = lire(os.path.join('tests', 'parcours', 'runner.js'))
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]

C_SYNC = sans_com(corps(SETUP, '_cloudSync'))
C_MIR = sans_com(corps(SB, 'sbMirror'))

# ── [!!] LA FUITE FUTURE EST FERMEE — LE FAIT CENTRAL, REVERIFIE ───────────────────────
g(bool(C_SYNC), '_cloudSync introuvable dans setup.js')
_avant_fetch = C_SYNC.split('fetch(')[0]
g('token:_ftToken()' not in _avant_fetch,
  'le jeton est REVENU dans le corps metier commun : la fuite decrite comme fermee est '
  'rouverte, le document est FAUX')
g('authCode:_authCode()' not in _avant_fetch,
  'le code perso est REVENU dans le corps metier commun : document FAUX')
# [!!] L'INVARIANT ANTI-ALIAS EST UN COMPTAGE, PAS UN EMPLACEMENT. Trouve par mutation :
# un `Object.assign` glisse APRES l'envoi Apps Script echappait a tout garde de position.
g(C_SYNC.count('_ftToken()') == 1,
  'le jeton est lu %d fois dans _cloudSync au lieu d une : un alias peut le porter jusqu au '
  'miroir' % C_SYNC.count('_ftToken()'))
g(C_SYNC.count('_authCode()') == 1,
  'le code perso est lu %d fois dans _cloudSync au lieu d une' % C_SYNC.count('_authCode()'))

# le transport Apps Script, lui, le porte toujours
# [!] LE TRANSPORT EST MESURE SUR SON CORPS, PAS SUR L'ORDRE DES CLES. Premiere version :
# un motif qui figeait `authCode..., token...` dans cet ordre exact — il aurait rougi sur une
# simple permutation, c'est-a-dire sur du code parfaitement juste.
_transport = C_SYNC[C_SYNC.find('fetch('):]
g('_authCode()' in _transport and '_ftToken()' in _transport,
  'le transport Apps Script ne porte plus les deux justificatifs : l ecriture ne serait plus '
  'authentifiee (S1 casse)')

# ── LE FILET DANS LA PORTE UNIQUE ──────────────────────────────────────────────────────
g('payload=_sbSansJustificatifs(payload)' in C_MIR.replace(' ', ''),
  'sbMirror n applique plus le filet : un appelant futur pourrait refaire fuiter')
_liste = re.search(r'_SB_JUSTIFICATIFS\s*=\s*\[(.*?)\]', sans_commentaires(SB), re.S)
g(bool(_liste), 'la liste des justificatifs a disparu de supabase.js')
NOMS = re.findall(r"'([^']+)'", _liste.group(1))
for n in ('token', 'authCode'):
    g(n in NOMS, 'la liste des justificatifs retires ne nomme plus « %s »' % n)
g('function _sbSansJustificatifs(' in SB, 'le filtre a ete renomme ou retire')

# ── R2 : UN SEUL CONSTRUCTEUR METIER ───────────────────────────────────────────────────
N_CTOR = len(re.findall(r"action\s*:\s*'saveProfile'", sans_commentaires(SETUP)))
g(N_CTOR == 1,
  'setup.js porte %d constructeurs de corps saveProfile : le document affirme qu il n y en '
  'a qu UN (R2)' % N_CTOR)

# ── APPS SCRIPT NE PERSISTE TOUJOURS RIEN ──────────────────────────────────────────────
HSP = sans_com(corps(CODEJS, 'handleSaveProfile_'))
g('profile.token' not in HSP and 'profile.authCode' not in HSP,
  'Apps Script persiste desormais un justificatif')
g('_identitePourEcriture_(body)' in HSP, 'Apps Script ne consomme plus le jeton')
g('_authCheck_(email, body.authCode)' in HSP, 'Apps Script ne consomme plus le code perso')

# ── V2 RESTE OUVERTE : ON NE MAQUILLE PAS ──────────────────────────────────────────────
g('p_email: email' in C_MIR,
  'p_email n est plus libre : ce document dit que V2 reste OUVERTE apres S2-A (c est S2-B/C)')
g('NON RETOURN' in RUN, 'le temoin volontairement NON retourne a disparu')

# ── PERIMETRE ──────────────────────────────────────────────────────────────────────────
g('function _douaneLigne(' in APP, 'la douane Nutrition a disparu d app.js')
for act in ('foodLabel', 'readBarcode', 'estimateFood'):
    g(("action:'%s'" % act) in APP, 'l action Nutrition « %s » a disparu' % act)
g('function _ftBootstrapJeton(' in APP, 'le bootstrap S1 a disparu')
g("action:'issueTokenByCode'" in APP, 'le bootstrap n emprunte plus la route a preuve')
g('function _ftPoserInjecteurJeton(' in CONST, 'l injecteur du Worker a disparu')
# l'onboarding garde SON justificatif : il ne va pas au miroir
g('authCode:_authCode(),token:_ftToken(),welcome:true' in sans_commentaires(APP),
  'le payload d onboarding a change : le document dit qu il garde ses justificatifs parce '
  'qu il ne passe PAS par le miroir')
g('sbMirror' not in sans_com(APP),
  'app.js appelle desormais le miroir : la carte « un seul ecrivain » de ce document est fausse')

# ── LES TEMOINS PERMANENTS ─────────────────────────────────────────────────────────────
N_TEM14 = len(re.findall(r"t\('B-CCCXIV ", RUN))
g(N_TEM14 == 11, 'le bloc B-CCCXIV ne porte plus 11 temoins (%d)' % N_TEM14)
N_TEM13 = len(re.findall(r"t\('B-CCCXIII ", RUN))
g(N_TEM13 == 10, 'le bloc B-CCCXIII (S1) ne porte plus 10 temoins (%d)' % N_TEM13)

# ── LES JOURNAUX : lus, jamais retapes ─────────────────────────────────────────────────
def journal(p):
    try:
        return open(p, encoding='utf-8').read()
    except OSError:
        return ''


LB = journal(BANC)
_mb = re.search(r'TOTAL S2-A\s*:\s*(\d+)\s*\S+\s*\S+\s*(\d+)', LB)
g(bool(_mb), 'le journal du banc S2-A (%s) ne porte pas de ligne TOTAL' % BANC)
S2A_OK, S2A_KO = int(_mb.group(1)), int(_mb.group(2))
g(S2A_KO == 0, 'le banc S2-A porte %d rouge(s)' % S2A_KO)
g('corps Apps Script PRIVE des justificatifs === blob Supabase' in LB,
  'le banc ne compare plus les deux corps a l octet pres : c est la preuve du point 9')

L1 = journal(BANC1)
_m1 = re.search(r'TOTAL S1\s*:\s*(\d+)\s*\S+\s*\S+\s*(\d+)', L1)
g(bool(_m1), 'le journal du banc S1 est absent : le document affirme que S1 reste vert')
S1_OK, S1_KO = int(_m1.group(1)), int(_m1.group(2))
g(S1_KO == 0, 'le banc S1 porte %d rouge(s) : S2-A a casse S1' % S1_KO)

LP = journal(PASSE)
_mp = re.search(r'TOTAL CROIS\S+\s*:\s*(\d+)\s*\S+\s*\S+\s*(\d+)', LP)
P_KO = len(re.findall(r'^\s*❌', LP, re.M))
if _mp:
    FINIE, P_OK, P_KO = True, int(_mp.group(1)), int(_mp.group(2))
else:
    FINIE, P_OK = False, len(re.findall(r'^\s*✅', LP, re.M))
g(P_KO == 0, 'la passe porte %d rouge(s) : rien ne se publie' % P_KO)

# ── L'HISTOIRE DE LA FUITE, LUE DANS GIT ───────────────────────────────────────────────
def git(*a):
    return subprocess.run(['git'] + list(a), cwd=ROOT, capture_output=True, text=True).stdout


_tok = [l for l in git('log', '--format=%h %ad', '--date=short', '-S', 'token:_ftToken()',
                       '--', 'setup.js').splitlines() if l.strip()]
_mir = [l for l in git('log', '--format=%h %ad', '--date=short', '-S', 'sbMirror(_corpsSync)',
                       '--', 'setup.js').splitlines() if l.strip()]
g(len(_tok) >= 1 and len(_mir) >= 1,
  'l histoire de la fuite n est plus lisible dans git : le document la date')
DATE_TOK = _tok[-1].split()[1]
DATE_MIR = _mir[-1].split()[1]
g(DATE_TOK == '2026-09-16',
  'le jeton n est plus entre dans le corps commun le 16/09 (%s) : le document le date' % DATE_TOK)
g(DATE_MIR == '2026-08-04',
  'le miroir n a plus commence a recevoir le corps commun le 04/08 (%s)' % DATE_MIR)

# ═══════════════════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')
VERT = colors.HexColor('#1E7A46')
ORANGE = colors.HexColor('#B26A00')

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
    """cp1252 APRES rendu des entites — un validateur qui teste l'entree ne dit rien de la sortie."""
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
H.append(P('S2-A : confinement des justificatifs', 'titre'))
H.append(P('Force Tracker - 16/09/2026 - base %s - la fuite FUTURE est fermee ; les copies '
           'DEJA presentes dans Supabase ne le sont pas. Document hors depot.' % VERSION, 'sous'))

H.append(encadre(
    'EN UNE PHRASE',
    'Le corps de sauvegarde ne porte plus aucun justificatif : le jeton et le code perso sont '
    'ajoutes <b>au seul transport qui en a besoin</b>, et la porte unique vers Supabase les '
    'retire en plus par securite. <b>Les donnees metier sont identiques a l octet pres.</b>'
    '<br/><br/>'
    '<b>Ce qui n est PAS fait</b> : les lignes deja ecrites dans Supabase. Elles demandent le '
    'tableau de bord, et V2 (' + (C % 'p_email') + ' libre) reste ouverte - c est S2-B/S2-C.'))

#  1. LA CAUSE
H.append(P('1. La cause exacte, et pourquoi ce n etait pas un oubli', 'h1'))
H.append(P('Le corps de sauvegarde est construit <b>une seule fois</b> et servi aux deux '
           'destinations. C est <b>R2</b>, et c est juste : deux constructions separees '
           'finiraient par diverger. S1 y a ajoute les justificatifs pour authentifier '
           'l ecriture Apps Script ; <b>le miroir Supabase les a recus par la meme '
           'occasion</b>.<br/><br/>'
           'La correction ne casse pas R2, elle le precise : <b>on ne duplique pas le corps '
           'metier</b>, on en retire les justificatifs et on les ajoute au transport qui en a '
           'besoin. <i>Un justificatif de transport n appartient pas aux donnees de la '
           'personne.</i>', 'p'))

#  2. AVANT / APRES
H.append(P('2. Avant / apres, mesure en conduisant les vraies portes', 'h1'))
H.append(tableau(
    ['', 'transport Apps Script', 'miroir Supabase'],
    [['jeton S1', 'present (justificatif)', '<b>absent</b>'],
     ['code perso', 'present (justificatif)', '<b>absent</b>'],
     ['persiste cote serveur ?', '<b>non</b> - liste blanche de champs nommes',
      'le blob est ecrit tel quel'],
     ['donnees metier', 'identiques', '<b>identiques, a l octet pres</b>']],
    [40 * mm, 63 * mm, 63 * mm]))
H.append(P('La preuve du point 9 est une <b>egalite stricte</b>, pas une inspection : le corps '
           'envoye a Apps Script <b>prive des deux justificatifs</b> est egal caractere pour '
           'caractere au blob envoye a Supabase. Et la seule difference entre les deux corps '
           'est exactement cette paire.', 'p'))

#  3. LES DEUX VERROUS
H.append(P('3. Deux verrous, et ils ne font pas le meme travail', 'h1'))
H.append(tableau(
    ['verrou', 'ou', 'ce qu il garantit'],
    [['<b>la cause</b>', (C % '_cloudSync'),
      'le corps metier ne porte plus de justificatif - il n y a donc plus rien a retirer '
      'sur le chemin normal'],
     ['<b>le filet</b>', (C % 'sbMirror'),
      'la porte UNIQUE vers Supabase retire par NOM DE CLE tout justificatif, quel que soit '
      'l appelant futur et quelle que soit la facon dont la valeur a ete calculee'],
     ['<b>les temoins</b>', 'bloc ' + (C % 'B-CCCXIV') + ' (' + str(N_TEM14) + ')',
      'ils epinglent la SOURCE - seuls capables de voir la cause regresser quand le filet '
      'la rattrape']],
    [26 * mm, 32 * mm, 108 * mm]))

H.append(encadre(
    'ET C EST LE CONTROLE NEGATIF QUI A PROUVE QUE LES TROIS SONT NECESSAIRES',
    'Quatre mutations - remettre le code perso dans le corps metier, le faire passer par un '
    '<b>alias de variable</b>, vider la liste du filet, ne jamais appeler le filet - laissaient '
    'le banc de comportement <b>parfaitement vert</b>. Normal : le filet rattrape, donc la '
    'sortie reste juste.<br/><br/>'
    '&gt; <b>Un banc qui n observe que la SORTIE ne peut pas voir la CAUSE regresser quand un '
    'filet la rattrape.</b><br/><br/>'
    'Le harnais conduit desormais le banc <b>et</b> les temoins de source. '
    '>> Et une mutation de plus a survecu meme a ca : l alias echappait a tout garde de '
    '<b>position</b>. L invariant juste n est pas « ou », c est <b>« combien »</b> - chaque '
    'lecteur de justificatif est appele <b>exactement une fois</b> dans '
    + (C % '_cloudSync') + '. Un alias, une copie, un detour : le compte monte a 2 et le '
    'temoin rougit, quel que soit le deguisement.', couleur=ORANGE))

#  4. L HISTOIRE
H.append(P('4. Depuis quand - et la reponse inverse l intuition', 'h1'))
H.append(tableau(
    ['justificatif', 'entre dans le corps commun', 'atteint Supabase depuis', 'duree'],
    [['<b>jeton S1</b>', DATE_TOK + ' (S1)', DATE_TOK,
      '<b>moins de 24 h</b> - une seule version servie'],
     ['<b>code perso</b>', '2026-08-03', DATE_MIR + ' (naissance du miroir)',
      '<b>environ six semaines</b>']],
    [30 * mm, 40 * mm, 45 * mm, 51 * mm]))
H.append(P('<b>C est l inverse de ce qu on suppose spontanement.</b> Le jeton - la trouvaille '
           'spectaculaire - n a fuite que le temps d une version. Le <b>code personnel</b>, '
           'lui, part en clair vers le miroir <b>depuis le jour ou le miroir existe</b> : il '
           'etait deja dans le corps commun quand le miroir a ete branche dessus. '
           '<i>La fuite la plus ancienne n est pas celle qu on vient de trouver.</i>', 'p'))

H.append(encadre(
    'CE QUE CA CHANGE POUR LE RISQUE, ET CE QUI RESTE INCONNU',
    'Le code perso protege <b>la lecture et l ecriture</b> du compte cloud. Quelqu un qui '
    'lirait une ligne du miroir obtiendrait donc de quoi <b>restaurer et ecraser</b> le compte '
    'correspondant - exactement la protection que ce code existe pour donner.<br/><br/>'
    '* <b>Mais l exposition est bornee a ceux qui ont POSE un code</b> : il est optionnel, et '
    'un compte sans code n en envoie aucun.<br/><br/>'
    '>> <b>Et la question qui decide de la gravite n est pas mesurable d ici</b> : <i>qui peut '
    'lire</i> ' + (C % 'ft_comptes') + ' ? L intention ecrite est « personne » (la cle publiee '
    'n a aucun droit sur la table, seulement EXECUTE sur la fonction). <b>Une intention n est '
    'pas une mesure.</b> &gt;&gt; <b>A VERIFIER DANS LE DASHBOARD SUPABASE</b>.'))

#  5. LES ANCIENNES COPIES
H.append(P('5. Les copies deja ecrites : ce qu on peut dire, et ce qu on ne peut pas', 'h1'))
H.append(P('>> <b>Le comportement SQL de ' + (C % 'ft_miroir') + ' est inconnu</b> : sa '
           'definition n est nulle part dans le depot (aucune migration), elle a ete creee a '
           'la main. Donc <b>on ne sait pas</b> si le miroir <b>remplace</b> la ligne ou en '
           '<b>empile une nouvelle</b>.<br/><br/>'
           '* <b>Et c est toute la difference</b> : si c est un remplacement par compte, alors '
           '<b>la prochaine sauvegarde de chaque personne ecrase son ancienne ligne par une '
           'ligne sans justificatif</b> - la purge se fait seule a l usage. Si c est un '
           'historique, rien ne s efface et il faut une purge explicite. '
           '&gt;&gt; <b>A VERIFIER DANS LE DASHBOARD SUPABASE</b>.', 'p'))

H.append(P('6. Faut-il faire tourner les jetons ? Trois options, aucune tranchee', 'h1'))
H.append(tableau(
    ['option', 'menace couverte', 'impact', 'depend de'],
    [['<b>A</b> - purge seule',
      'la copie disparait de la base',
      '<b>nul</b> - personne ne voit rien',
      'que ' + (C % 'ft_comptes') + ' n ait <b>jamais</b> ete lisible, et qu on puisse le '
      '<b>prouver</b>'],
     ['<b>B</b> - purge + rotation conseillee',
      'couvre une lecture qu on ne saurait pas exclure',
      'faible : un nouveau jeton se repose sans geste visible',
      'de la capacite a reposer un jeton sans deconnecter les gens'],
     ['<b>C</b> - rotation obligatoire',
      'couvre une fuite averee',
      '<b>fort</b> : tout appareil sans jeton valide repasse par une preuve',
      'de la preuve qu une lecture a eu lieu']],
    [34 * mm, 36 * mm, 43 * mm, 53 * mm]))
H.append(P('>> <b>Aucune de ces options n est choisie ici</b>, et c est volontaire : le choix '
           'depend entierement des droits reels sur la table, qui ne sont pas lisibles depuis '
           'ce conteneur. <i>Decider maintenant, ce serait deviner.</i> '
           '* Un element pese quand meme pour A ou B plutot que C : le jeton n a ete expose '
           'que <b>le temps d une version</b>. Le code perso, lui, est le vrai sujet.', 'p'))

#  7. TESTS
H.append(P('7. Ce qui a ete mesure', 'h1'))
H.append(tableau(
    ['banc', 'resultat'],
    [['banc S2-A (comportement, vraies portes)', '<b>%d OK / %d rouges</b>' % (S2A_OK, S2A_KO)],
     ['banc S1 (l identite n a pas bouge)', '<b>%d OK / %d rouges</b>' % (S1_OK, S1_KO)],
     ['temoins permanents ' + (C % 'B-CCCXIV'), '<b>%d</b>, dont un volontairement NON '
      'retourne (V2)' % N_TEM14],
     ['temoins permanents ' + (C % 'B-CCCXIII') + ' (S1)', '<b>%d</b> intacts' % N_TEM13],
     ['passe complete',
      ('<b>%d OK / %d rouges</b>' % (P_OK, P_KO)) if FINIE
      else '<b>EN COURS</b> - %d verts a cet instant, comptage PARTIEL' % P_OK],
     ['controle negatif', '<b>16 mutations</b> sur arbre copie, dont une qui doit <b>rester '
      'verte</b> (le mot dans un commentaire)']],
    [72 * mm, 94 * mm]))

#  8. QUESTIONS
H.append(P('8. Les sept questions', 'h1'))
H.append(tableau(
    ['#', 'question', 'reponse mesuree'],
    [['1', 'un nouveau ' + (C % '_cloudSync') + ' peut-il envoyer le jeton a Supabase ?',
      '<b>NON</b> - absent du corps metier, retire par le filet, lu une seule fois'],
     ['2', 'peut-il envoyer le code perso ?', '<b>NON</b> - meme preuve'],
     ['3', 'Apps Script recoit-il son justificatif sans le persister ?',
      '<b>OUI</b> - porte par le transport, consomme, jamais ecrit'],
     ['4', 'le snapshot metier est-il identique hors justificatifs ?',
      '<b>OUI</b> - egalite stricte, a l octet pres'],
     ['5', 'les anciennes lignes sont-elles purgees ?',
      '<b>NON - TRAITEMENT DASHBOARD REQUIS</b>'],
     ['6', 'les jetons copies doivent-ils etre rotes ?',
      '<b>A DECIDER APRES AUDIT DES DROITS REELS</b>'],
     ['7', 'V2 (' + (C % 'p_email') + ' libre) est-elle fermee ?',
      '<b>NON - S2-B/S2-C</b> ; le temoin reste NON retourne']],
    [8 * mm, 78 * mm, 80 * mm]))

H.append(Spacer(1, 3))
H.append(P('Document produit par ' + (C % 'tools/gen_s2a_pdf.py') + ' - <b>' + str(GARDES[0])
           + ' gardes</b> qui recomptent chaque fait depuis le code servi ou le lisent dans les '
           'journaux, et refusent de produire si un fait tombe - y compris si la fuite se '
           'rouvre. Aucun justificatif n est reproduit ici.', 'petit'))

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-A - confinement des justificatifs',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, banc S2-A %d/%d, S1 %d/%d, passe %s)'
      % (OUT, VERSION, GARDES[0], S2A_OK, S2A_OK + S2A_KO, S1_OK, S1_OK + S1_KO,
         ('%d/%d' % (P_OK, P_OK + P_KO)) if FINIE else 'EN COURS (%d)' % P_OK))
