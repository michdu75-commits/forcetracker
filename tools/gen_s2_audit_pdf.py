#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dossier GPT — S2 SUPABASE SECURISE, ETAPES 0-1-2 (audit, arret avant mutation).
   Hors depot (regle d'or #14, le depot est public).

[!!] CE DOCUMENT AFFIRME QU'UNE FUITE EST OUVERTE (le jeton S1 brut et le code perso
     partent en clair vers Supabase). Ses gardes la REVERIFIENT dans le code servi : si
     elle est corrigee, le document est PERIME et le generateur refuse de sortir. Un
     dossier qui decrit un trou deja bouche est aussi faux qu'un dossier qui en cache un.

[!!] LES CHIFFRES SONT RECOMPTES DEPUIS LE CODE SERVI ou LUS dans le journal du banc,
     jamais retapes a la main (lecon ft-v1201).

[!] AUCUNE CLE N'EST ECRITE EN ENTIER dans le document (consigne de Michel : masquer).

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji.
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
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
OUT = os.environ.get('FT_OUT') or os.path.join(
    SCRATCH, 'DOSSIER-S2-SUPABASE-AUDIT-16-09-2026.pdf')
BANC = os.environ.get('FT_BANC') or os.path.join(SCRATCH, 'banc_s2.log')

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_com(src):
    """Retire commentaires et chaines d'un fragment JS.

    [!!] CE HELPER EXISTE PARCE QUE LE PIEGE A DEJA ETE PAYE CINQ FOIS (ft-v1193/1203/
    1205/1210, puis S1 hier) : un garde qui ne distingue pas le CODE de ce qui en PARLE
    mesure la documentation, et finit par interdire d'ecrire la raison d'un correctif.
    [!] Limite dite plutot que masquee : un litteral d'expression reguliere contenant
    `//` ou `/*` tromperait ce scanner. Aucun n'existe dans les corps mesures.
    """
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
    """Retire les commentaires MAIS GARDE les chaines.

    [!!] POURQUOI LES DEUX OUTILS EXISTENT, ET POURQUOI C EST LE COEUR DU PIEGE :
    `sans_com` retire aussi les chaines, ce qui rend INVISIBLE tout fait qui vit DANS une
    chaine — mon premier garde cherchait `rpc/` dans un corps dont j avais justement retire
    `'/rest/v1/rpc/'`, et il rougissait sur du code parfaitement sain.
    Regle : un fait qui vit dans une CHAINE se mesure ici ; un fait qui vit dans le CODE
    (un appel, une affectation) se mesure avec `sans_com`. Employer le mauvais des deux,
    c est mesurer autre chose que ce qu on annonce.
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
    """Corps REEL d'une fonction, borne par ses accolades.

    [!] Jamais une borne en distance de caracteres : une borne en caracteres n'est pas
    une borne de fonction et deborde sur la voisine (BUGS.md §63, paye en A1 puis en S1).
    """
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
WORKER = lire('worker.js')
CODEJS = lire('Code.js')
APP = lire('app.js')
CONST = lire('constants.js')
SW = lire('sw.js')
RUN = lire(os.path.join('tests', 'parcours', 'runner.js'))

VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]

# ── [!!] LE FAIT CENTRAL : LA FUITE EST BIEN OUVERTE ────────────────────────────────────
# Le document la DECRIT comme ouverte. Si elle est fermee, il est perime : on refuse.
C_SYNC = sans_com(corps(SETUP, '_cloudSync'))
g(bool(C_SYNC), 'la fonction _cloudSync est introuvable dans setup.js')
g('token:_ftToken()' in C_SYNC,
  'le jeton ne part plus dans le corps de sauvegarde : la fuite decrite par ce document '
  'semble CORRIGEE, donc le document est PERIME — le relire avant de le republier')
g('authCode:_authCode()' in C_SYNC,
  'le code perso ne part plus dans le corps de sauvegarde : document PERIME')
g('sbMirror(_corpsSync)' in C_SYNC,
  'le miroir ne recoit plus le MEME objet que Apps Script : c est precisement ce qui '
  'fait la fuite — le document est PERIME')

# le miroir transmet le payload TEL QUEL, sans filtrer
C_MIR = sans_com(corps(SB, 'sbMirror'))
g('p_data: payload' in C_MIR,
  'sbMirror ne transmet plus le payload tel quel : il filtre peut-etre desormais, '
  'donc le document est PERIME')

# ── V2 : le client choisit encore son e-mail ────────────────────────────────────────────
g('p_email: email' in C_MIR,
  'ft_miroir ne recoit plus un p_email libre : V2 semble fermee, document PERIME')
# [!] le CHEMIN de la RPC vit dans une CHAINE : il se mesure avec l outil qui garde les
#     chaines, jamais avec celui qui les retire (voir `sans_commentaires`).
C_MIR_S = sans_commentaires(corps(SB, 'sbMirror'))
g("'/rest/v1/rpc/'" in C_MIR_S and 'SB_FN' in C_MIR_S,
  'le miroir n appelle plus la RPC : la carte des chemins de ce document est fausse')
g(re.search(r"SB_FN\s*=\s*'ft_miroir'", sans_commentaires(SB)) is not None,
  'la RPC appelee n est plus ft_miroir : le document la nomme partout')

# ── LA CARTE DES TROIS CHEMINS, RECOMPTEE ──────────────────────────────────────────────
# [!!] ON LIT LE CODE, PAS CE QUI EN PARLE. Mesure : `Code.js` MENTIONNE Supabase deux fois,
# dans des COMMENTAIRES poses par S1 - un garde naif les comptait et rougissait sur une carte
# parfaitement exacte. Les chaines sont gardees (une URL Supabase en dur DOIT etre vue).
# [!] Au passage, ma verification a la main etait fausse en sens inverse : un `grep` sensible
#     a la casse rendait 0 en ratant « Supabase ». Le garde a corrige le controleur.
N_SB_WORKER = len(re.findall(r'supabase|ft_miroir', sans_commentaires(WORKER), re.I))
N_SB_CODEJS = len(re.findall(r'supabase|ft_miroir', sans_commentaires(CODEJS), re.I))
g(N_SB_WORKER == 0,
  'le Worker parle desormais a Supabase (%d occurrences) : la carte de ce document est '
  'fausse, il decrit un Worker qui n y touche pas' % N_SB_WORKER)
g(N_SB_CODEJS == 0,
  'Apps Script parle desormais a Supabase (%d occurrences) : carte fausse' % N_SB_CODEJS)

# un seul ecrivain de production vers le miroir
N_MIRROR = len(re.findall(r'sbMirror\(', sans_com(SETUP)))
g(N_MIRROR == 1,
  'le miroir a %d appelants dans setup.js au lieu d un seul : la surface decrite par ce '
  'document a change' % N_MIRROR)

# ── LE SCHEMA N EST PAS DANS LE DEPOT ──────────────────────────────────────────────────
SQL = [f for _d, _s, _f in os.walk(ROOT) for f in _f
       if f.endswith('.sql') and 'node_modules' not in _d]
g(not SQL,
  'des fichiers SQL sont apparus dans le depot (%s) : le document affirme que la '
  'definition de ft_miroir n y est nulle part' % ', '.join(SQL[:3]))

# ── APPS SCRIPT, LUI, NE PERSISTE PAS LES JUSTIFICATIFS ────────────────────────────────
C_SAVE = sans_com(corps(CODEJS, 'handleSaveProfile_'))
g(bool(C_SAVE), 'handleSaveProfile_ est introuvable dans Code.js')
g('profile.token' not in C_SAVE and 'profile.authCode' not in C_SAVE,
  'Apps Script persiste desormais le jeton ou le code perso : le contraste decrit par ce '
  'document (liste blanche cote Google, blob entier cote Supabase) tombe')
N_CHAMPS = len(re.findall(r'profile\.[A-Za-z0-9_]+\s*=', C_SAVE))
g(N_CHAMPS >= 40,
  'handleSaveProfile_ ne recopie plus que %d champs nommes : le document parle d une '
  'liste blanche' % N_CHAMPS)

# ── PERIMETRE : RIEN N A ETE TOUCHE ────────────────────────────────────────────────────
g(VERSION == 'ft-v1216',
  'sw.js est en %s : ce document decrit un audit SANS bump, sur la base ft-v1216' % VERSION)
# [!] chaque marqueur est ferme par sa FORME REELLE : un nom nu se laisse satisfaire par
#     n importe quel nom qui le CONTIENT (`_douaneLigneX`). Piege `presentsX`, 4e fois.
g('function _douaneLigne(' in APP, 'la piece Nutrition « _douaneLigne » a disparu d app.js')
for act in ('foodLabel', 'readBarcode', 'estimateFood'):
    g(("action:'%s'" % act) in APP,
      'la piece Nutrition « %s » a disparu d app.js' % act)
# les temoins S1 tiennent toujours
N_TEM = len(re.findall(r"t\('B-CCCXIII ", RUN))
g(N_TEM == 10, 'le bloc B-CCCXIII ne porte plus 10 temoins (%d)' % N_TEM)
g('NON RETOURN' in RUN,
  'le temoin V2 volontairement NON retourne a disparu : il porte une decision')

# ── [!!] ETAPE 30 — AUCUN SECRET PRIVILEGIE DANS LES FICHIERS SERVIS ───────────────────
# Le garde doit distinguer une VRAIE cle privilegiee de son NOM / de sa documentation.
# `sb_publishable_` est publique par construction : elle est AUTORISEE.
# `service_role` / `sb_secret_` / un JWT de role service ne doivent JAMAIS apparaitre.
SERVIS = {'supabase.js': SB, 'app.js': APP, 'constants.js': CONST, 'setup.js': SETUP,
          'sw.js': SW, 'index.html': lire('index.html')}
for nom, src in SERVIS.items():
    # [!!][!!] ICI SE JOUE TOUT L ETAGE 30, ET MA PREMIERE VERSION ETAIT AVEUGLE PAR
    # CONSTRUCTION : j employais `sans_com`, qui retire AUSSI les chaines. Or un secret
    # EST une chaine. Mesure du controle negatif : glisser `'service_role_key_xyz'` dans
    # un fichier servi laissait les trois gardes PARFAITEMENT VERTS.
    # 👉 Le garde cense empecher une fuite de secret ne pouvait pas voir un secret.
    # On lit donc le code SANS ses commentaires mais AVEC ses chaines : la documentation
    # qui NOMME `service_role` reste ignoree, la VALEUR est vue.
    nu = sans_commentaires(src)
    g('sb_secret_' not in nu,
      'une cle SECRETE Supabase (sb_secret_) apparait dans le fichier servi %s' % nom)
    g(not re.search(r'["\'][^"\']*service_role[^"\']*["\']', nu),
      'une valeur contenant service_role apparait dans le fichier servi %s' % nom)
    g(not re.search(r'["\']eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}', nu),
      'un JWT complet est ecrit en dur dans le fichier servi %s' % nom)
# et la cle publiable, elle, doit rester la : c est ce que le document decrit
g(re.search(r"SB_ANON\s*=\s*'sb_publishable_", SB) is not None,
  'la cle publiable a change de nature dans supabase.js : le document la decrit comme '
  'publiable-par-construction')

# ── LE BANC : ses chiffres sont LUS, jamais retapes ────────────────────────────────────
try:
    LB = open(BANC, encoding='utf-8').read()
except OSError:
    LB = ''
g('CE QUI PART, MESURE' in LB,
  'le journal du banc S2 (%s) est absent ou incomplet : le relancer avant de produire '
  'ce document' % BANC)
g(re.search(r'requetes Supabase\s*:\s*1', LB) is not None,
  'le banc ne mesure plus exactement 1 requete Supabase')
g(re.search(r'OUI\s+token S1 BRUT', LB) is not None,
  'le banc ne constate plus le jeton brut dans le blob : document PERIME')
g(re.search(r'OUI\s+code perso EN CLAIR', LB) is not None,
  'le banc ne constate plus le code perso en clair dans le blob : document PERIME')
_mt = re.search(r'taille du blob\s*:\s*(\d+)\s*octets', LB)
g(bool(_mt), 'le banc ne rend plus la taille du blob')
BLOB = int(_mt.group(1))
g('identique au corps Apps Script : OUI' in LB,
  'le banc ne constate plus que le blob miroir est le MEME objet que le corps Apps Script')
SENS = re.findall(r'^  \[x\] (\w+)', LB, re.M)
g(len(SENS) >= 10,
  'le banc ne rend plus la liste des categories sensibles presentes dans le blob (%d)'
  % len(SENS))

# ── LE WORKER DEPEND ENCORE D APPS SCRIPT (objectif 4 de S2, pas encore atteint) ───────
g('_identiteIA(body.token, env)' in WORKER,
  'le Worker n appelle plus _identiteIA : le point de depart decrit par ce document a change')
g('fetch(APPS_SCRIPT_URL' in sans_com(corps(WORKER, '_identiteIA')),
  'le Worker ne passe plus par Apps Script pour authentifier : c est l objectif 4 de S2, '
  'et ce document le decrit comme NON ENCORE ATTEINT')
_ma = re.search(r'_ACTIONS_IA\s*=\s*new Set\(\[(.*?)\]\)', WORKER, re.S)
g(bool(_ma), 'la liste des actions IA du Worker est introuvable')
N_ACTIONS = len(re.findall(r"'", _ma.group(1))) // 2

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
                            fontSize=17, leading=21, textColor=ENCRE, spaceAfter=2),
    'sous': ParagraphStyle('s', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=9, leading=12, textColor=GRIS, spaceAfter=10),
    'h1': ParagraphStyle('h1', parent=_ss['Normal'], fontName='Helvetica-Bold',
                         fontSize=11.5, leading=14, textColor=ROUGE,
                         spaceBefore=11, spaceAfter=4),
    'p': ParagraphStyle('p', parent=_ss['Normal'], fontName='Helvetica',
                        fontSize=8.9, leading=12.2, textColor=ENCRE, spaceAfter=5),
    'petit': ParagraphStyle('pt', parent=_ss['Normal'], fontName='Helvetica',
                            fontSize=7.8, leading=10.4, textColor=GRIS, spaceAfter=4),
    'cell': ParagraphStyle('c', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=8.1, leading=10.4, textColor=ENCRE),
    'cellg': ParagraphStyle('cg', parent=_ss['Normal'], fontName='Helvetica-Bold',
                            fontSize=8.1, leading=10.4, textColor=ENCRE),
}


def _v(s):
    """Refuse tout caractere hors cp1252 : les polices de base ne les dessinent pas.

    [!!] IL FAUT DECODER LES ENTITES AVANT DE TESTER, ET JE L AI APPRIS EN LE RATANT ICI.
    Ma premiere version testait la chaine BRUTE : `&rarr;` est parfaitement cp1252, donc
    elle passait - mais reportlab la rend en `->` APRES ce controle, et ce caractere-la
    n existe pas dans la police. Resultat : un validateur vert et un caractere non dessine
    dans le PDF. Le piege etait deja ecrit dans les notes de ft-v1214, et je l ai repose.
    Un validateur qui controle l ENTREE d une transformation ne dit rien de sa SORTIE.
    """
    rendu = html.unescape(s)
    try:
        rendu.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE - apres rendu des entites, caractere hors cp1252 : %r '
                         '(dans %r)' % (rendu[e.start:e.end], s[:70]))
    return s


def P(txt, st='p'):
    return Paragraph(_v(txt), ST[st])


C = '<font face="Courier" size="8">%s</font>'


def encadre(titre, corps_html, couleur=ROUGE):
    t = Table([[Paragraph(_v('<b>' + titre + '</b>'), ST['cell'])],
               [Paragraph(_v(corps_html), ST['cell'])]], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FOND),
        ('LINEBEFORE', (0, 0), (0, -1), 2.2, couleur),
        ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
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
        ('TOPPADDING', (0, 0), (-1, -1), 3.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    return KeepTogether([t, Spacer(1, 7)])


H = []
H.append(P('S2 - Supabase securise : audit avant mutation', 'titre'))
H.append(P('Force Tracker - 16/09/2026 - base servie %s - etapes 0, 1 et 2 - '
           'ARRET AVANT TOUTE MUTATION. Document hors depot.' % VERSION, 'sous'))

H.append(encadre(
    'CE QUE CE DOCUMENT ETABLIT, EN UNE PHRASE',
    'S2 ne peut pas commencer par ou le plan le prevoyait, pour deux raisons mesurees : '
    '<b>une fuite de justificatifs est ouverte en production depuis S1</b>, et '
    '<b>Supabase est injoignable depuis le conteneur</b>, donc tout ce qui touche au '
    'schema, aux droits et aux cles demande Michel au tableau de bord.<br/><br/>'
    'Aucun fichier servi n a ete modifie. ' + (C % 'sw.js') + ' n est pas bumpe.'))

# ── 1. LA FUITE
H.append(P('1. La fuite : le jeton S1 brut et le code perso partent en clair vers Supabase',
           'h1'))
H.append(P('Mesure en conduisant la vraie sauvegarde (' + (C % '_cloudSync') + '), pas en '
           'lisant le code : le ' + (C % 'fetch') + ' est intercepte et classe par domaine. '
           'Le corps reellement envoye a ' + (C % 'rpc/ft_miroir') + ' porte '
           '<b>' + str(BLOB) + ' octets</b>, dont :', 'p'))
H.append(tableau(
    ['champ du blob miroir', 'contenu', 'ce que S1 promettait'],
    [[C % 'p_data.token', '<b>le jeton S1 BRUT</b> (64 caracteres)',
      'le serveur ne stocke que le <b>SHA-256</b> - meme l administrateur ne peut pas '
      'relire un jeton'],
     [C % 'p_data.authCode', '<b>le code perso EN CLAIR</b>',
      'stocke <b>hache et sale</b> cote Apps Script, jamais en clair'],
     [C % 'p_email', 'choisi par le <b>client</b>', 'c est V2, connue et assumee jusqu a S2']],
    [38 * mm, 52 * mm, 75 * mm]))

H.append(encadre(
    'LA CAUSE N EST PAS UN OUBLI, C EST UNE DECISION JUSTE APPLIQUEE A UN ENDROIT DE TROP',
    'Le corps de sauvegarde est <b>construit une seule fois et servi aux DEUX destinations</b> '
    '- c est ecrit en toutes lettres dans ' + (C % 'setup.js') + ', et c est <b>R2</b> : deux '
    'constructions separees finiraient par diverger et on enverrait deux versions du meme '
    'compte.<br/><br/>'
    'S1 a ajoute ' + (C % 'token:_ftToken()') + ' a ce corps commun pour authentifier '
    'l ecriture Apps Script. <b>Le miroir Supabase l a recu par la meme occasion.</b><br/><br/>'
    'Le garde de S1 verifiait que ' + (C % 'token:_ftToken()') + ' n apparait qu une fois dans '
    + (C % 'app.js') + ' - il prouvait que le chantier n avait pas deborde sur Nutrition. '
    '<b>Personne n a verifie ou allait le corps qui le porte.</b>'))

H.append(P('Et le contraste avec Google est exactement le point : ' + (C % 'handleSaveProfile_')
           + ' recopie <b>' + str(N_CHAMPS) + ' champs nommes</b> dans le profil - une liste '
           'blanche - et consomme le jeton comme un justificatif sans jamais l ecrire. '
           'Supabase, lui, recoit <b>le blob entier</b>, verifie identique octet pour octet au '
           'corps Apps Script.', 'p'))

H.append(P('Le meme blob porte aussi, mesure : ' + ', '.join(C % s for s in SENS[:14])
           + '. Donc qui lirait cette table obtiendrait les donnees de sante <b>et</b> de quoi '
           'se faire passer pour la personne.', 'p'))

# ── 2. LA CARTE
H.append(P('2. La carte reelle des chemins vers Supabase', 'h1'))
H.append(tableau(
    ['chemin', 'vers Supabase', 'identite employee', 'droits'],
    [['<b>Client</b> (' + (C % 'setup.js') + '  &gt;  ' + (C % 'sbMirror') + ')',
      '<b>1 seul appel</b> : ' + (C % 'rpc/ft_miroir'),
      '<b>' + (C % 'p_email') + ' choisi par le client</b>',
      'cle publiable ; aucun droit sur la table, EXECUTE sur la RPC'],
     ['<b>Worker</b>', '<b>0 occurrence</b>', '-', '-'],
     ['<b>Apps Script</b>', '<b>0 occurrence</b>', '-', '-']],
    [42 * mm, 36 * mm, 42 * mm, 45 * mm]))

H.append(encadre(
    'BONNE NOUVELLE ET MAUVAISE NOUVELLE, ET IL FAUT LES DIRE ENSEMBLE',
    '<b>Bonne</b> : il n existe qu <b>UNE SEULE</b> porte vers Supabase aujourd hui, et '
    'c est precisement V2. La surface a securiser est minuscule.<br/><br/>'
    '<b>Mauvaise</b> : tout le chemin serveur que S2 veut construire - '
    + (C % 'Worker  &gt;  Supabase') + ' - <b>n existe pas du tout</b>. Ce n est pas un '
    'chemin a securiser, c est un chemin a ecrire.', couleur=ORANGE))

H.append(encadre(
    'ET LA DEFINITION DE ft_miroir N EST NULLE PART DANS LE DEPOT',
    'Aucun fichier ' + (C % '.sql') + ', aucune migration : la fonction a ete creee <b>a la '
    'main dans le tableau de bord</b>. Donc son corps, son proprietaire, son '
    + (C % 'search_path') + ' et les GRANT reels sont <b>invérifiables d ici</b>.<br/><br/>'
    'C est un constat de gouvernance autant que de securite : <i>un schema qui ne vit que '
    'dans une console ne peut etre ni relu, ni compare, ni restaure.</i>'))

# ── 3. LE WORKER
H.append(P('3. Le point de depart cote Worker (objectif 4 de S2, non atteint)', 'h1'))
H.append(P('Le Worker authentifie <b>chaque</b> appel IA par un aller-retour vers Apps '
           'Script (' + (C % '_identiteIA') + '), sur <b>' + str(N_ACTIONS) + ' actions</b>. '
           'C est exactement la dependance que S2 veut supprimer - elle est donc decrite ici '
           'comme le point de depart, pas comme un defaut a corriger dans cette passe.', 'p'))

# ── 4. STOP
H.append(P('4. STOP : ce qui demande le tableau de bord', 'h1'))
H.append(P('Supabase est <b>injoignable depuis ce conteneur</b> (verifie : echec de connexion '
           'sur le projet et sur le site). Je ne peux donc ni creer de table, ni de RPC, ni de '
           'regle RLS, ni executer du SQL, ni faire les tests HTTP directs prevus. '
           'Conformement a la consigne, je m arrete plutot que de contourner par une solution '
           'moins sure.', 'p'))
H.append(tableau(
    ['a verifier', 'ou', 'ce que ca decide'],
    [['corps de ' + (C % 'ft_miroir') + ', proprietaire, ' + (C % 'search_path')
      + ', SECURITY DEFINER', 'Database &gt; Functions',
      'si la RPC actuelle peut etre bornee ou doit etre remplacee'],
     ['RLS de ' + (C % 'ft_comptes') + ' : activee ? policies exactes ?',
      'Authentication &gt; Policies', 'si un public peut lire une table sensible'],
     ['GRANT de ' + (C % 'anon') + ' et ' + (C % 'authenticated') + ' sur la table et '
      'EXECUTE sur la RPC', 'SQL editor', 'le rayon d explosion de la cle publiee'],
     ['existe-t-il une cle <b>secret</b> / ' + (C % 'service_role') + ' ? (oui/non seulement)',
      'Project Settings &gt; API',
      'si le Worker peut parler a Supabase, et avec quel privilege'],
     ['plan, region, taille DB, quotas', 'Settings &gt; General / Usage',
      'si le registre de jetons tient, et ou'],
     ['extensions, cron, restrictions reseau', 'Database &gt; Extensions',
      'la revocation et le nettoyage plus tard']],
    [58 * mm, 38 * mm, 69 * mm]))
H.append(P('<b>A VERIFIER DANS LE DASHBOARD SUPABASE</b> - ces six points ne sont pas '
           'deduits ni supposes ici. <b>Ne coller aucune cle secrete dans une conversation</b> : '
           'pour la cle secrete, un oui ou un non suffit.', 'petit'))

# ── 5. CE QUE CA NE FAIT PAS
H.append(P('5. Ce que cette passe ne fait pas', 'h1'))
H.append(P('Aucune table, aucune RPC, aucune RLS, aucune cle, aucun SQL, aucun deploiement. '
           '<b>Aucun fichier servi n est modifie</b> et ' + (C % 'sw.js') + ' reste en '
           + VERSION + '. La fuite du point 1 est <b>mesuree et rapportee, pas corrigee</b> : '
           'le correctif touche un fichier servi, donc il demande un bump et une passe complete '
           '- decision de Michel.<br/><br/>'
           'Nutrition : <b>0 ligne</b> (une autre session y travaille). Les temoins S1 tiennent '
           'a <b>' + str(N_TEM) + '/10</b>, et le temoin V2 reste <b>volontairement NON '
           'retourne</b> : V2 est encore ouverte, et on ne maquille pas une porte ouverte.', 'p'))

H.append(encadre(
    'REPONSES MESUREES AUX QUESTIONS QUI PEUVENT DEJA ETRE TRANCHEES',
    '<b>Q1</b> - le navigateur peut-il encore ecrire les donnees d un autre compte en '
    'choisissant son e-mail ? <b>OUI</b> - ' + (C % 'p_email') + ' est libre, mesure.<br/>'
    '<b>Q2</b> - le Worker depend-il encore d Apps Script pour authentifier chaque appel IA ? '
    '<b>OUI</b> - ' + (C % '_identiteIA') + ' sur ' + str(N_ACTIONS) + ' actions.<br/>'
    '<b>Q3</b> - le token brut existe-t-il quelque part dans Supabase ? <b>OUI</b> - c est la '
    'trouvaille de cette passe, et elle date de S1.<br/>'
    '<b>Q6</b> - un public avec la seule cle frontend peut-il lire une table sensible ? '
    '<b>A VERIFIER DANS LE DASHBOARD SUPABASE</b> - l intention ecrite est non (aucun droit de '
    'lecture), mais les GRANT reels ne sont pas lisibles d ici, et <i>une intention n est pas '
    'une mesure</i>.<br/>'
    '<b>Q8</b> - Google / Drive restent-ils disponibles comme secours ? <b>OUI</b> - rien n a '
    'ete touche.<br/><br/>'
    'Les autres questions portent sur une architecture qui <b>n existe pas encore</b> : y '
    'repondre maintenant serait inventer.', couleur=VERT))

H.append(Spacer(1, 4))
H.append(P('Document produit par ' + (C % 'tools/gen_s2_audit_pdf.py') + ' - <b>'
           + str(GARDES[0]) + ' gardes</b> qui recomptent chaque fait depuis le code servi ou '
           'le journal du banc, et refusent de produire si un fait tombe. Plusieurs d entre eux '
           'refusent aussi si la <b>fuite est corrigee</b> : un dossier qui decrit un trou deja '
           'bouche est aussi faux qu un dossier qui en cache un. Aucune cle n est reproduite en '
           'entier ici.', 'petit'))

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=22 * mm, rightMargin=22 * mm,
                  topMargin=17 * mm, bottomMargin=15 * mm,
                  title='S2 Supabase - audit avant mutation',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, blob %d o, %d categories sensibles, %d actions IA)'
      % (OUT, VERSION, GARDES[0], BLOB, len(SENS), N_ACTIONS))
