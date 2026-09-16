#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dossier GPT — S1 IDENTITE SERVEUR MINIMALE, FINAL (implemente).
   Hors depot (regle d'or #14, le depot est public).

[!!] CE DOCUMENT AFFIRME QUE S1 EST FAIT. Ses gardes le REVERIFIENT dans le code servi : si une
     piece manque, il refuse de sortir. Le miroir exact du generateur precedent, qui refusait
     de sortir si S1 se trouvait DEJA fait.

[!!] LES CHIFFRES DU BANC ET DE LA PASSE SONT LUS DANS LEURS JOURNAUX, jamais ecrits a la main
     (lecon ft-v1201). Sans ligne TOTAL, le PDF dit « passe EN COURS » et donne un compte
     explicitement PARTIEL — il ne publie jamais un total qu'il n'a pas.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji.
"""
import html
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
OUT = os.environ.get('FT_OUT') or os.path.join(
    SCRATCH, 'DOSSIER-S1-IDENTITE-SERVEUR-FINAL-16-09-2026.pdf')
PASSE = os.environ.get('FT_PASSE') or '/tmp/passe_s1c.log'
BANC = os.environ.get('FT_BANC') or os.path.join(SCRATCH, 'banc_s1.log')

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


CODEJS = lire('Code.js')
WORKER = lire('worker.js')
SB = lire('supabase.js')
CONST = lire('constants.js')
APP = lire('app.js')
SETUP = lire('setup.js')
SW = lire('sw.js')
RUN = lire(os.path.join('tests', 'parcours', 'runner.js'))
DOSSIER = lire(os.path.join('docs', 'DOSSIER-S1-IDENTITE-SERVEUR-FINAL.md'))

VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]


def sans_com(src):
    """Retire commentaires et chaines d'un fragment JS.

    [!!] POURQUOI CE HELPER EXISTE : le premier jet de ce generateur refusait de produire
    A CAUSE DU COMMENTAIRE QUI DOCUMENTE LE RETRAIT de `Math.random()` — R30 exige
    justement d'ecrire le retrait a sa place, donc le mot reste dans le fichier. Un garde
    qui ne distingue pas le CODE de ce qui en PARLE mesure la documentation, et finit par
    interdire d'ecrire la raison du correctif (famille ft-v1193/1203/1205/1210, repayee ici).
    [!] Limite dite plutot que masquee : un litteral d'expression reguliere contenant `//`
    ou `/*` tromperait ce scanner. Aucun n'existe dans les corps mesures.
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


def corps(src, nom):
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


# ── [!!] S1 EST BIEN LA — chaque piece est reverifiee dans le code servi ────────────────────
for fn in ('_jetonNouveau_', '_jetonPoser_', '_jetonIdentite_', '_jetonRevoquer_',
           '_jetonsDuCompte_', '_identitePourEcriture_', '_migCompter_',
           'handleIssueTokenByCode_', 'handleRevokeToken_', 'handleAuthIdentity_'):
    # [!!] LE « ( » N'EST PAS DECORATIF : sans lui, renommer `_jetonPoser_` en `_jetonPoser_X`
    # laisse le garde VERT, puisque la chaine cherchee est contenue dans la nouvelle.
    # C'est le piege de `presentsX` / `needsCode2`, deja paye trois fois dans ce projet.
    g(('function ' + fn + '(') in CODEJS, 'la piece « %s » de S1 a disparu de Code.js' % fn)

# le jeton : 256 bits, primitives standard, JAMAIS Math.random
C_NEUF = sans_com(corps(CODEJS, '_jetonNouveau_'))
C_CONF = sans_com(corps(CODEJS, 'handleSendConfirmCode_'))
g(C_NEUF.count('Utilities.getUuid()') == 3,
  'le jeton n\'est plus tire de TROIS UUID : son entropie d\'entree change')
g('Math.random' not in C_NEUF, 'Math.random() est revenu dans la fabrique du jeton')
g('Math.random' not in C_CONF,
  'Math.random() est revenu dans le code de confirmation — la chaine d\'identite le proscrit')
g('Utilities.getUuid()' in C_CONF,
  'le code de confirmation n\'est plus tire d\'un UUID')

# [!!] le serveur ne stocke QUE le hache
C_POSER = sans_com(corps(CODEJS, '_jetonPoser_'))
g('_sha256hex_(brut)' in C_POSER,
  'le jeton n\'est plus hache avant stockage : le brut finirait dans le registre')
# [!!] L'INVARIANT EST « brut n'a QUE trois usages legitimes », pas un motif de proximite.
# Premier jet : `setProperty\([^)]*brut\)` — il mordait sur du code SAIN, parce qu'il attrapait
# le `brut` passe A LA FONCTION DE HACHAGE (`setProperty(_JET_PREFIXE_ + _sha256hex_(brut)`).
# Un garde plus strict que la contrainte reelle refuse du travail juste (lecon ft-v1214).
_reste = C_POSER
for legitime in ('_sha256hex_(brut)', 'var brut = _jetonNouveau_();', 'return brut;'):
    g(legitime in _reste, 'l\'usage legitime « %s » a disparu de _jetonPoser_' % legitime)
    _reste = _reste.replace(legitime, '')
g('brut' not in _reste,
  'le jeton BRUT a un usage de plus dans _jetonPoser_ que le hachage et le retour : il '
  'pourrait finir ecrit tel quel dans le stockage serveur')

# [!!] l'identite vient du jeton, pas du payload
C_ID = corps(CODEJS, '_identitePourEcriture_')
# [!!] LA BRANCHE EST EXTRAITE PAR SES ACCOLADES, jamais par une distance en caracteres.
# Premier jet : `if \(j\.ok\)[^;]*email:\s*j\.email` — il rougissait sur du code SAIN, parce
# que `[^;]*` ne peut pas franchir le `;` de `_migCompter_(true);` pose entre les deux.
# Une borne en distance de caracteres n'est pas une borne de bloc (BUGS.md §63).
def bloc_apres(src, tete):
    k = src.find(tete)
    if k < 0:
        return ''
    i = src.index('{', k + len(tete))
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


_BR_OK = bloc_apres(C_ID, 'if (j.ok)')
g('email: j.email' in _BR_OK,
  'l\'identite n\'est plus prise au jeton : « jeton A + e-mail B » pourrait redevenir B')
g('demande' not in _BR_OK,
  'la branche du jeton valide touche a l\'e-mail DECLARE par le client : c\'est exactement '
  'ce que S1 supprime')
for route in ('handleSaveProfile_', 'handlePushHealth_'):
    g('_identitePourEcriture_(body)' in corps(CODEJS, route),
      'la route %s ne passe plus par l\'identite du jeton' % route)

# fail-closed : un jeton present mais invalide ne retombe jamais sur l'e-mail
g("return { ok: false, mode: 'jeton_refuse'" in C_ID,
  'un jeton invalide ne provoque plus un refus : il pourrait retomber sur l\'e-mail declare')
g('_MIG_FERME_' in CODEJS, 'l\'interrupteur de bascule de la transition a disparu')
g('var _MIG_FERME_ = false' in CODEJS,
  'la transition n\'est plus dans l\'etat attendu : le dossier decrit _MIG_FERME_ = false')

# ── LE WORKER ──────────────────────────────────────────────────────────────────────────────
g('_identiteIA(body.token, env)' in WORKER, 'le Worker n\'exige plus de jeton avant de depenser')
g(re.search(r'if \(!_moi\.ok\)\s*\{', WORKER) is not None, 'le refus du Worker a disparu')
g('_compterIA(body.action, _moi.email, env)' in WORKER,
  'le quota n\'est plus decompte sur l\'identite du jeton')
g("email: (_moi && _moi.email) || ''" in WORKER,
  'la meta du Worker reprend l\'e-mail du payload au lieu de celui du jeton')
g('ALLOWED_ORIGIN' in WORKER, 'le controle d\'origine a ete retire : il reste un garde secondaire')
# [!] fail-closed cote reseau : une panne ne doit pas ouvrir la porte
g("return { ok: false, raison: 'reseau' }" in WORKER,
  'le Worker ne se ferme plus sur une panne reseau : il laisserait passer une depense')

# ── CLIENT : un SEUL proprietaire, et Nutrition intacte ─────────────────────────────────────
# [!!] CHAQUE NOM EST FERME PAR SA FORME DECLARATIVE — un nom nu se laisse satisfaire par
# n'importe quel nom qui le CONTIENT (`_ftTokenX`, `issueTokenByCodeX`). Piege deja paye.
g('function _ftPoserInjecteurJeton(' in CONST, 'l\'injecteur de jeton a disparu de constants.js')
g("FT_TOKEN_KEY='ft4_devtoken'" in CONST and 'function _ftToken(' in CONST,
  'les accesseurs du jeton ont disparu')
g('function _ftBootstrapJeton(' in APP, 'le bootstrap client a disparu')
g("action:'issueTokenByCode'" in APP,
  'le bootstrap client n\'emprunte plus la route a preuve')
g('token:_ftToken()' in SETUP, 'l\'ecriture de setup.js ne porte plus le jeton')
# [!!] LE GARDE QUI PROTEGE LA PROMESSE FAITE A MICHEL : Nutrition n'a pas ete touchee.
for mot in ('_douaneLigne', 'foodLabel', 'readBarcode', 'estimateFood'):
    g(mot in APP, 'la piece Nutrition « %s » a disparu d\'app.js' % mot)
g(APP.count('token:_ftToken()') <= 1,
  'le jeton a ete injecte a la main dans plusieurs charges utiles d\'app.js : le chantier a '
  'deborde sur Nutrition, alors qu\'un seul proprietaire devait suffire')

# ── V2 RESTE OUVERTE : on ne pretend pas avoir ferme Supabase ───────────────────────────────
g(re.search(r'p_email:\s*email', SB) is not None,
  'ft_miroir ne recoit plus un p_email libre : la mention « V2 RESTE OUVERTE » serait fausse')
g('V2 RESTE OUVERTE' in DOSSIER, 'le dossier ne dit plus que Supabase reste ouverte jusqu\'a S2')
g('V2 RESTE OUVERTE' in RUN, 'le temoin permanent de V2 a disparu du banc')

# ── LES TEMOINS ONT ETE RETOURNES, PAS SUPPRIMES ───────────────────────────────────────────
N_TEMOINS = len(re.findall(r"t\('B-CCCXIII ", RUN))
g(N_TEMOINS == 10, 'le bloc B-CCCXIII ne porte plus 10 temoins (%d)' % N_TEMOINS)
N_RETOURNES = len(re.findall(r"B-CCCXIII [^']*RETOURN", RUN))
g(N_RETOURNES == 5,
  'le nombre de temoins RETOURNES n\'est plus 5 (%d) : le dossier l\'affirme' % N_RETOURNES)
g('NON RETOURN' in RUN,
  'le temoin volontairement NON retourne (V2) a disparu : il porte une decision')

# ── LE BANC S1 : son total est LU, jamais retape ───────────────────────────────────────────
try:
    LB = open(BANC, encoding='utf-8').read()
except OSError:
    LB = ''
_mb = re.search(r'TOTAL S1\s*:\s*(\d+)\s*\S+\s*\S+\s*(\d+)', LB)
g(bool(_mb), 'le journal du banc S1 (%s) ne porte pas de ligne TOTAL : le relancer avant de '
             'produire ce document' % BANC)
BANC_OK, BANC_KO = int(_mb.group(1)), int(_mb.group(2))
g(BANC_KO == 0, 'le banc S1 porte %d rouge(s) : rien ne se publie' % BANC_KO)

# ── LA PASSE COMPLETE : total lu, ou etat partiel annonce comme tel ─────────────────────────
try:
    LP = open(PASSE, encoding='utf-8').read()
except OSError:
    LP = ''
_mp = re.search(r'TOTAL CROIS\S+\s*:\s*(\d+)\s*\S+\s*\S+\s*(\d+)', LP)
PASSE_KO = len(re.findall(r'^\s*❌', LP, re.M))
if _mp:
    PASSE_FINIE, PASSE_OK, PASSE_KO = True, int(_mp.group(1)), int(_mp.group(2))
else:
    PASSE_FINIE = False
    PASSE_OK = len(re.findall(r'^\s*✅', LP, re.M))
g(PASSE_KO == 0, 'la passe porte %d rouge(s) : rien ne se publie' % PASSE_KO)

# ── LE DOSSIER TIENT-IL SES ENGAGEMENTS ? ──────────────────────────────────────────────────
for q in range(1, 7):
    g(('### %d.' % q) in DOSSIER, 'la question %d a disparu du dossier' % q)
g(re.search(r'###\s*2\..*?\*\*NON\.\*\*', DOSSIER, re.S) is not None,
  'la reponse a la question 2 n\'est plus NON : c\'est le point le plus verifie du chantier')
_q1 = re.search(r'###\s*1\..*?(?=###\s*2\.)', DOSSIER, re.S)
g(bool(_q1) and 'PARTIEL' in _q1.group(0),
  'la reponse a la question 1 n\'est plus PARTIEL : la fenetre de transition la rend partielle')
g('9,9' in DOSSIER and '23,5' in DOSSIER,
  'les mesures de performance ont disparu du dossier : « negligeable » sans chiffre est interdit')

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
    'titre': ParagraphStyle('titre', parent=S['Title'], fontName='Helvetica-Bold', fontSize=18,
                            leading=22, textColor=ENCRE, alignment=TA_LEFT, spaceAfter=2),
    'sous': ParagraphStyle('sous', parent=S['Normal'], fontName='Helvetica', fontSize=9.5,
                           leading=13, textColor=GRIS, spaceAfter=13),
    'h1': ParagraphStyle('h1', parent=S['Heading1'], fontName='Helvetica-Bold', fontSize=12.5,
                         leading=15.5, textColor=ROUGE, spaceBefore=13, spaceAfter=5),
    'p': ParagraphStyle('p', parent=S['Normal'], fontName='Helvetica', fontSize=9.2, leading=13.0,
                        textColor=ENCRE, spaceAfter=6),
    'petit': ParagraphStyle('petit', parent=S['Normal'], fontName='Helvetica', fontSize=8.2,
                            leading=11.5, textColor=GRIS, spaceAfter=5),
    'cell': ParagraphStyle('cell', parent=S['Normal'], fontName='Helvetica', fontSize=8.0,
                           leading=10.4),
    'cellb': ParagraphStyle('cellb', parent=S['Normal'], fontName='Helvetica-Bold', fontSize=8.0,
                            leading=10.4),
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
                  'Force Tracker - S1 identite serveur - FINAL - %s - 16/09/2026' % VERSION)
    cv.drawRightString(A4[0] - 22 * mm, 12 * mm, 'page %d' % cv.getPageNumber())
    cv.restoreState()


H = []
H.append(P('S1 - Identite serveur minimale (final)', 'titre'))
H.append(P('Force Tracker &middot; 16/09/2026 &middot; %s &middot; <b>implemente</b> &middot; '
           'banc S1 : <b>%d OK / %d rouges</b> sur le vrai code' % (VERSION, BANC_OK, BANC_KO),
           'sous'))

H.append(encadre('LE RENVERSEMENT, EN UNE PHRASE',
                 '<b>Le client ne choisit plus son identite.</b> Quand un jeton est present, c est '
                 '<b>son</b> compte qui est ecrit et <b>son</b> quota qui est decompte : '
                 '<b>jeton A + e-mail B agit sur A, jamais sur B</b>. L e-mail du payload devient '
                 'une donnee, plus une autorite.<br/><br/>'
                 'Le projet l avait ecrit lui-meme avant nous, dans ' + (C % 'Code.js') + ' : '
                 '<i>&laquo; l email est usurpable &raquo;</i>. S1 remplace cette supposition par '
                 'une preuve.'))
H.append(Spacer(1, 6))

H.append(P('Le bootstrap : deux preuves, aucune porte ouverte', 'h1'))
H.append(tableau(['situation', 'preuve exigee', 'resultat'],
                 [['compte <b>avec</b> code perso', 'le code', 'jeton emis'],
                  ['compte <b>sans</b> code', '<b>verification e-mail</b>', 'jeton emis'],
                  ['<b>e-mail seul</b>', '<b>aucune</b>', '<b>AUCUN jeton</b> (option C interdite)'],
                  ['code faux, expire, deja consomme', '-', 'aucun jeton']],
                 [50 * mm, 48 * mm, 68 * mm]))
H.append(Spacer(1, 4))
H.append(P('<b>La preuve e-mail est CONSOMMEE a l instant meme de l emission</b> : le code est '
           'supprime de la table juste avant que le jeton soit pose, donc il ne peut pas etre '
           'rejoue pour en obtenir un second. <i>Mesure, pas suppose.</i>', 'p'))
H.append(P('Cote client, le bootstrap est <b>silencieux mais AVEC preuve</b> : il ne demande un '
           'jeton que si l appareil detient deja le code perso. <b>Sans code, il ne demande '
           'rien</b> - ce serait l option C. Et il est lance sans attente : il ne retient jamais '
           'le demarrage.', 'p'))

H.append(P('Le jeton, et ou il vit', 'h1'))
H.append(tableau(['', ''],
                 [['forme', '<b>opaque</b>, 256 bits - SHA-256 de <b>trois</b> UUID v4 (~366 bits d entree)'],
                  ['client', (C % 'localStorage') + ' (' + (C % 'ft4_devtoken') + ')'],
                  ['serveur', '<b>uniquement le hache SHA-256</b> - mesure : le brut n apparait '
                   '<b>nulle part</b> dans le stockage'],
                  ['forme stockee', (C % 'tok_{hache}') + ' vers {compte, date, revoque, libelle}']],
                 [30 * mm, 136 * mm]))
H.append(Spacer(1, 4))
H.append(P('<b>Pas de bcrypt/PBKDF2, et c est raisonne</b> : ces fonctions ralentissent une attaque '
           'sur un secret <b>choisi par un humain</b>. Un tirage de 256 bits n est pas devinable - '
           'SHA-256 suffit, et il a l avantage d etre une <b>cle de recherche directe</b>.', 'p'))
H.append(P('[!] <b>Limites du stockage client, dites franchement</b> : une <b>XSS</b> le lit, un '
           '<b>vidage du navigateur</b> l efface, un <b>changement de navigateur</b> ne le '
           'transporte pas, un <b>telephone perdu</b> le laisse dans la nature <b>jusqu a '
           'revocation</b>.', 'p'))

H.append(P('Ce qui a ete mesure - banc S1 : %d OK / %d rouges' % (BANC_OK, BANC_KO), 'h1'))
H.append(P('<b>Le banc n exerce pas des regex</b> : il charge ' + (C % 'Code.js') + ' et '
           + (C % 'worker.js') + ' et appelle leurs <b>vraies fonctions</b>, avec des doublures '
           'minimales pour ce qu Apps Script fournit. <i>Un test de source prouve qu une ligne '
           'existe ; seul un test de comportement prouve qu elle fait ce qu elle dit.</i>', 'p'))
H.append(tableau(['famille eprouvee', 'resultat'],
                 [['le jeton : 256 bits, 500 tirages distincts', 'vert'],
                  ['<b>le brut absent du stockage serveur</b>', 'vert'],
                  ['<b>jeton A + e-mail B = A, jamais B</b>', 'vert'],
                  ['jeton invalide / inconnu / tronque = refus', 'vert'],
                  ['<b>multi-appareils + revocation selective</b>', 'vert'],
                  ['rejeu : 50 usages, identite stable', 'vert'],
                  ['bootstrap : code / e-mail / preuve consommee', 'vert'],
                  ['transition comptee, <b>sans aucune adresse</b>', 'vert'],
                  ['<b>Worker : bon Origin + aucun jeton = 401</b>', 'vert'],
                  ['<b>quota decompte sur A, jamais sur B</b>', 'vert']],
                 [130 * mm, 36 * mm]))
H.append(Spacer(1, 4))
H.append(P('[!] <b>Ce que le banc NE couvre pas, et c est dit</b> : Apps Script <b>deploye</b> et '
           'Supabase sont <b>injoignables depuis ce conteneur</b>. Il eprouve la <b>logique '
           'servie</b>, pas le deploiement - un essai iPhone reel reste necessaire.', 'p'))

H.append(P('Performance - mesuree, pas estimee', 'h1'))
H.append(tableau(['', 'mesure'],
                 [['validation d un jeton (registre de 200)', '<b>9,9 microsecondes</b> (5 000 appels)'],
                  ['poids d une entree', '<b>120 octets</b>'],
                  ['200 jetons', '24 090 o = <b>4,7 %</b> du reservoir 512 Ko'],
                  ['<b>projection 1 000 jetons</b>', '120 450 o = <b>23,5 %</b>'],
                  ['taille du jeton transporte', '64 caracteres (32 octets)'],
                  ['appels reseau client supplementaires', '<b>0</b>'],
                  ['Worker', '[!] <b>+1 aller-retour Apps Script BLOQUANT</b> par appel IA']],
                 [70 * mm, 96 * mm]))
H.append(Spacer(1, 4))
H.append(encadre('LES DEUX COUTS REELS, NOMMES',
                 '<b>1.</b> Le Worker attend desormais Apps Script avant chaque appel IA - c est le '
                 'prix assume du jeton <b>opaque</b> (la revocation immediate prime). Sa latence '
                 '<b>n est pas mesurable d ici</b>, Apps Script etant injoignable.<br/><br/>'
                 '<b>2.</b> <b>23,5 % du reservoir a 1 000 jetons</b> - et ce reservoir est '
                 '<b>deja monte a 102 % le 29/07/2026</b>. <i>C est le point de bascule vers S2, '
                 'et il est chiffre plutot que pressenti.</i>', ORANGE))

H.append(P('Nutrition : zero ligne, et c est structurel', 'h1'))
H.append(P('Les appels IA partent de <b>16 endroits</b> dans quatre fichiers, et <b>5 d entre eux '
           'sont des appels Nutrition</b>. Les retoucher un par un aurait fait deborder le '
           'chantier. Le jeton est donc injecte par <b>un seul proprietaire</b>, dans '
           + (C % 'constants.js') + ' : <b>aucun fichier Nutrition n est touche</b>, et la regle '
           'est tenue <b>a la lettre</b> plutot qu a l esprit. Un garde de ce generateur refuse de '
           'produire si le jeton apparait a la main dans plusieurs charges utiles d '
           + (C % 'app.js') + '.', 'p'))

H.append(P('Les temoins ont ete RETOURNES, jamais supprimes', 'h1'))
H.append(P('Le bloc de tests est <b>B-CCCXIII</b> (prefixe de session, jamais renomme ensuite) '
           'dans %s : <b>%d temoins</b>, dont <b>%d RETOURNES</b> et un marque '
           '<b>NON RETOURNE</b>.'
           % (C % 'tests/parcours/runner.js', N_TEMOINS, N_RETOURNES), 'p'))
H.append(P('Cinq temoins epinglaient les defauts de depart. S1 les a fermes, donc ils devaient '
           'rougir - c etait leur role. Ils gardent leur numero et leur histoire, avec leur '
           'assertion inversee. <b>Un seul n est PAS retourne, et c est voulu</b> : celui de '
           'Supabase.', 'p'))
H.append(encadre('V2 RESTE OUVERTE JUSQU A S2',
                 (C % 'ft_miroir') + ' recoit toujours un ' + (C % 'p_email') + ' <b>libre</b>, '
                 'depuis le <b>navigateur</b>. Le fermer impose de faire entrer le Worker dans ce '
                 'chemin : c est <b>S2</b>.<br/><br/>'
                 '<i>Pretendre l avoir ferme sans cette mesure serait exactement ce que Michel '
                 'interdit.</i> Un temoin permanent le fige.', ORANGE))

H.append(P('Les six questions - reponses mesurees', 'h1'))
H.append(tableau(['question', 'reponse', 'preuve'],
                 [['1. un client connaissant seulement l e-mail peut-il agir comme un autre ?',
                   '<b>PARTIEL</b>',
                   '<b>avec jeton : NON</b> (A+B donne A). <b>Sans jeton : OUI</b>, pendant la '
                   'fenetre de transition - c est l option B choisie, et '
                   + (C % '_MIG_FERME_') + ' la ferme'],
                  ['2. peut-on consommer l IA sans credential ?', '<b>NON</b>',
                   'bon Origin + aucun jeton = <b>401</b> ; jeton invalide = 401 ; mauvais Origin '
                   'meme avec bon jeton = 403'],
                  ['3. jeton A + e-mail B peut-il agir comme B ?', '<b>NON</b>',
                   'ecriture et quota decomptes sur A'],
                  ['4. un jeton revoque fonctionne-t-il ?', '<b>NON</b>',
                   'refus immediat, avec une raison distincte d un jeton inconnu'],
                  ['5. deux appareils, deux jetons independants ?', '<b>OUI</b>',
                   'T1 et T2 valides ensemble ; revoquer T1 laisse <b>T2 intact</b>'],
                  ['6. S2 puis S3 sans reecrire S1 ?', '<b>OUI</b>',
                   'ligne plate transposable en table Supabase, et <b>un</b> point de resolution '
                   'dans le Worker. Ce qui bougera est le <b>support</b>, pas le modele']],
                 [56 * mm, 20 * mm, 90 * mm]))

H.append(Spacer(1, 6))
H.append(P('Ce PDF est genere par <font face="Courier">tools/gen_s1_final_pdf.py</font>, dont les '
           '%d gardes reverifient chaque piece de S1 dans le code servi et <b>refusent de '
           'produire</b> si une seule manque - le miroir exact du generateur precedent, qui '
           'refusait de sortir si S1 se trouvait deja fait. Le total du banc (<b>%d/%d</b>) est '
           '<b>lu dans son journal</b>. %s'
           % (GARDES[0], BANC_OK, BANC_OK + BANC_KO,
              ('Passe complete : <b>%d OK / %d rouges</b>, lue dans son journal.'
               % (PASSE_OK, PASSE_KO)) if PASSE_FINIE else
              ('[!] <b>La passe complete TOURNAIT ENCORE</b> a la generation : <b>%d verts et '
               '0 rouge a cet instant</b>, mais ce n est <b>PAS un total</b> - une passe tronquee '
               'ressemble trait pour trait a une passe verte, et rien ne sera publie avant sa '
               'ligne TOTAL.' % PASSE_OK)), 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Force Tracker - S1 identite serveur, final (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)
print('OK %s  (%s, %d gardes, banc %d/%d, passe %s)'
      % (OUT, VERSION, GARDES[0], BANC_OK, BANC_OK + BANC_KO,
         ('%d/%d' % (PASSE_OK, PASSE_OK + PASSE_KO)) if PASSE_FINIE else 'EN COURS (%d)' % PASSE_OK))
