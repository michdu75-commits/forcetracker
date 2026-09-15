#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dossier GPT — AUDIT SECURITE / BACKEND / SUPABASE (audit seul).
   Hors depot (regle d'or #14, le depot est public).

CHAQUE CONSTAT DE SECURITE EST REVERIFIE DANS LE CODE A LA GENERATION. Un audit qui affirme une
faille depuis un souvenir n'est pas un audit : si le defaut est corrige entre-temps, le document
doit REFUSER de sortir plutot que d'accuser a tort.

[!!] Et deux gardes protegent des ABSENCES, les plus faciles a perdre de vue :
     - aucun secret reel ne doit apparaitre dans un fichier servi ;
     - le document ne doit JAMAIS contenir de cle en clair (consigne explicite de Michel).

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
    SCRATCH, 'DOSSIER-GPT-AUDIT-SECURITE-15-09-2026.pdf')

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
SETUP = lire('setup.js')
STATE = lire('state.js')
SW = lire('sw.js')
RUN = lire(os.path.join('tests', 'parcours', 'runner.js'))
DOSSIER = lire(os.path.join('docs', 'AUDIT-SECURITE-BACKEND.md'))

VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]
g(VERSION.startswith('ft-v'), 'la version ne se lit plus dans sw.js')


def corps(src, nom):
    """Corps REEL d'une fonction (comptage d'accolades) — jamais une borne en caracteres."""
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


# ── V1 : l'ecriture sans identite. On REVERIFIE la faille, on ne la recite pas ──────────────
C_AUTH = corps(CODEJS, '_authCheck_')
g(C_AUTH, '_authCheck_ est introuvable')
g(re.search(r'stored\.length\s*<\s*20.*?opted:\s*false', C_AUTH, re.S) is not None,
  'V1 semble CORRIGEE : _authCheck_ ne rend plus un acces libre quand aucun code n\'est pose. '
  'Le dossier accuserait a tort - le relire avant de republier')
g('fail-open' in C_AUTH or 'ok:true, opted:false' in C_AUTH.replace(' ', '').replace(
        'ok:true,opted:false', 'ok:true, opted:false'),
  'le repli permissif de _authCheck_ a change de forme')
# saveProfile s'arrete bien a _authCheck_ (et non a une verification plus forte)
g(re.search(r'const _a = _authCheck_\(email, body\.authCode\);', CODEJS) is not None,
  'saveProfile ne s\'appuie plus sur _authCheck_ : V1 a peut-etre ete corrigee')

# ── La lecture, elle, est FERMEE : c'est le point fort, il doit rester vrai ─────────────────
C_LECT = corps(CODEJS, '_lectureAutorisee_')
g('needsCode' in C_LECT,
  'la lecture stricte a disparu : le dossier la presente comme le point fort qui tient')
g(len(re.findall(r'_lectureAutorisee_\(', CODEJS)) >= 3,
  'la lecture stricte n\'est plus appliquee sur ses deux chemins')

# ── V3 : le verrou du Worker est un en-tete Origin, et RIEN d'autre ─────────────────────────
g("const ALLOWED_ORIGIN = 'https://michdu75-commits.github.io'" in WORKER,
  'l\'origine autorisee a change')
g(re.search(r"_origin !== ALLOWED_ORIGIN", WORKER) is not None,
  'le controle d\'origine du Worker a change de forme')
# [!!] Le garde le plus utile : si un VRAI jeton apparait, V3 est corrigee et le dossier est perime.
for jeton in ('Authorization', 'x-ft-token', 'deviceToken', 'verifyToken'):
    g(jeton not in WORKER,
      'le Worker exige desormais « %s » : V3 est corrigee, tout le paragraphe F et la '
      '« premiere correction » du dossier sont perimes' % jeton)

# ── Les plafonds, lus et non retapes ───────────────────────────────────────────────────────
# [!!] LE PLAFOND SE LIT DANS LA FONCTION QUI L'APPLIQUE, PAS N'IMPORTE OU DANS LE FICHIER.
#      Trouve par ce garde meme : `AI_GLOBAL_MAX` a DEUX valeurs par defaut differentes —
#      600 dans `_aiQuotaBlock_` (qui BLOQUE) et 1500 dans la route qui AFFICHE. Ma premiere
#      version prenait la premiere occurrence du fichier, donc celle de l'affichage.
#      *Lire un plafond quelque part n'est pas lire le plafond qui s'applique.*
C_QUOTA = corps(CODEJS, '_aiQuotaBlock_')
g(C_QUOTA, '_aiQuotaBlock_ est introuvable')
_gm = re.search(r"AI_GLOBAL_MAX'\), 10\)\s*\|\|\s*(\d+)", C_QUOTA)
_em = re.search(r"AI_EMAIL_MAX'\), 10\)\s*\|\|\s*(\d+)", C_QUOTA)
g(bool(_gm) and bool(_em), 'les plafonds IA ne se lisent plus dans _aiQuotaBlock_')
CAP_G, CAP_E = int(_gm.group(1)), int(_em.group(1))
g(CAP_G == 600, 'le plafond global applique n\'est plus 600 (%d) : le chiffrage du §I est faux'
  % CAP_G)
# La divergence elle-meme est un constat du dossier : elle doit rester vraie tant qu'il l'affirme.
_aff = re.findall(r"AI_GLOBAL_MAX'\), 10\)\s*\|\|\s*(\d+)", CODEJS)
CAP_AFFICHE = next((int(x) for x in _aff if int(x) != CAP_G), None)
g(CAP_AFFICHE is not None,
  'les deux valeurs par defaut de AI_GLOBAL_MAX concordent desormais : le constat V14 du dossier '
  'est corrige, le relire avant de republier')
g("l'email est usurpable" in CODEJS,
  'la phrase « l\'email est usurpable » a disparu de Code.js : c\'est la citation qui fonde le §D')

# ── V2 : ft_miroir, p_email libre, aucune lecture ───────────────────────────────────────────
g('p_email' in SB and 'ft_miroir' in SB, 'l\'appel ft_miroir a change de forme')
g('security definer' in SB.lower(), 'le motif security definer n\'est plus documente')

# ── V6 : sauvegardes Drive sans purge, et aucune route deleteAccount ────────────────────────
g('backupAllUserData_' in CODEJS, 'la sauvegarde Drive a disparu')
C_BAK = corps(CODEJS, 'backupAllUserData_')
g('setTrashed' not in C_BAK and 'removeFile' not in C_BAK,
  'une purge des sauvegardes semble avoir ete ajoutee : V6 est corrigee, le dossier est perime')
g(not re.search(r"action\s*===?\s*'deleteAccount'", CODEJS),
  'une route deleteAccount existe desormais : le §H et V6 sont perimes')

# ── V5 : des e-mails reels sont publies dans le depot public ────────────────────────────────
NB_MAILS = len(set(re.findall(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}',
                              lire('constants.js') + CODEJS)))
g(NB_MAILS > 0,
  'plus aucune adresse e-mail dans constants.js/Code.js : V5 est corrigee, le dossier est perime')

# ── POINTS FORTS : ils doivent rester vrais, sinon le dossier ment par omission ─────────────
g('_safeCell_' in CODEJS, 'la protection anti-injection de formule a disparu')
g("_dailyCounterBlock_('authfail_" in CODEJS, 'l\'anti-force-brute du code perso a disparu')
g('_sha256hex_' in CODEJS, 'le hachage des codes persos a disparu')
g('service_role' in RUN and 'sk-ant-' in RUN,
  'le test permanent anti-fuite de secrets ne couvre plus service_role / sk-ant-')
C_USAGE = corps(CODEJS, '_aiUsageAdd_')
g('email' not in C_USAGE,
  'le journal d\'usage IA enregistre desormais un e-mail : le §L le presente comme exempt')

# ── [!!] AUCUN SECRET REEL DANS LES FICHIERS SERVIS ────────────────────────────────────────
for f in ('app.js', 'constants.js', 'coach.js', 'setup.js', 'log.js', 'screens.js', 'state.js',
          'tracking.js', 'supabase.js', 'index.html'):
    txt = lire(f)
    g(re.search(r'sk-ant-[A-Za-z0-9]{8}|sb_secret_[A-Za-z0-9]{8}|service_role[\'"]?\s*:\s*[\'"]ey',
                txt) is None,
      'un secret reel semble present dans %s' % f)

# ── [!!] LE DOSSIER LUI-MEME NE DOIT CONTENIR AUCUNE CLE EN CLAIR (consigne de Michel) ──────
g(re.search(r'sk-ant-[A-Za-z0-9]{8}|sb_publishable_[A-Za-z0-9]{8}|sb_secret_', DOSSIER) is None,
  'le dossier contient une cle en clair : Michel a ecrit « ne m\'affiche JAMAIS une cle complete »')

# ── Le dossier tient-il ses engagements ? ──────────────────────────────────────────────────
g('AUDIT SEUL' in DOSSIER, 'le dossier n\'annonce plus qu\'il est un audit seul')
for niveau in ('CRITIQUE', 'ELEVE', 'MOYEN', 'FAIBLE'):
    g(niveau in DOSSIER.replace('É', 'E'), 'le niveau « %s » a disparu de la classification' % niveau)
_s = re.search(r'^##\s*S\.\s.*?(?=^##\s|\Z)', DOSSIER, re.S | re.M)
g(bool(_s) and 'VERIFIER' in _s.group(0).replace('É', 'E'),
  'la section des verifications en console ne renvoie plus a une verification manuelle')
g('identit' in DOSSIER.lower() and 'jeton d\'appareil' in DOSSIER,
  'la « premiere correction » (identite serveur) a disparu de la conclusion')

# ── AUCUN FICHIER SERVI MODIFIE : l'audit l'affirme, on le VERIFIE ──────────────────────────
SERVIS = {'app.js', 'log.js', 'coach.js', 'setup.js', 'screens.js', 'state.js', 'tracking.js',
          'constants.js', 'index.html', 'style.css', 'sw.js', 'worker.js', 'Code.js',
          'supabase.js', 'wrangler.toml'}
try:
    _mod = subprocess.run(['git', 'diff', '--name-only', 'HEAD'], cwd=ROOT,
                          capture_output=True, text=True).stdout.split()
    _t = sorted(SERVIS & set(_mod))
    g(not _t, 'l\'audit annonce « aucun code servi modifie », or %s a change' % ', '.join(_t))
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
                  'Force Tracker - audit securite / backend / Supabase - %s - 15/09/2026' % VERSION)
    cv.drawRightString(A4[0] - 22 * mm, 12 * mm, 'page %d' % cv.getPageNumber())
    cv.restoreState()


H = []
H.append(P('Audit securite / backend / Supabase', 'titre'))
H.append(P('Force Tracker &middot; 15/09/2026 &middot; %s &middot; <b>audit seul : aucune table, '
           'aucune RPC, aucune policy, aucune cle, aucun code servi</b>' % VERSION, 'sous'))

H.append(encadre('RESUME EXECUTIF',
                 'Force Tracker a <b>deja fait un vrai travail de securite</b>, et il faut le dire '
                 'avant les defauts : lecture des comptes fermee, codes persos <b>haches et sales</b>, '
                 'anti-force-brute, injection de formule Sheets neutralisee, webhook Ko-fi '
                 '<b>fail-closed</b>, journal d usage IA <b>sans e-mail</b>, et un <b>test '
                 'permanent</b> qui refuse tout secret dans les fichiers servis. <b>Aucun secret reel '
                 'n est present, ni dans l historique Git.</b><br/><br/>'
                 '<b>Le defaut structurant est unique : il n y a pas d identite.</b> Partout, un '
                 '<b>e-mail fourni par le client</b> est traite comme une <b>identite '
                 'authentifiee</b>. Consequences mesurees : on peut <b>ecraser</b> le compte d autrui, '
                 '<b>ecraser sa ligne miroir</b>, et le seul verrou du Worker est un en-tete '
                 '<b>Origin</b> - forgeable en une ligne de curl.<br/><br/>'
                 '<i>Rien de tout cela n empeche l app de fonctionner. C est precisement le piege.</i>'))
H.append(Spacer(1, 6))

H.append(P('B. Architecture actuelle', 'h1'))
H.append(tableau(['flux', 'identite reellement verifiee'],
                 [['navigateur &gt; <b>Apps Script</b> (URL publique)',
                   'e-mail + code perso <b>OPTIONNEL</b>'],
                  ['navigateur &gt; <b>Supabase</b> ' + (C % 'rpc/ft_miroir'),
                   'cle publiable + ' + (C % 'p_email') + ' <b>libre</b>'],
                  ['navigateur &gt; <b>Worker</b> &gt; Anthropic',
                   '<b>en-tete Origin UNIQUEMENT</b>'],
                  ['Apps Script &gt; Sheet / Script Properties / <b>Drive</b>', 'interne']],
                 [86 * mm, 80 * mm]))
H.append(Spacer(1, 4))
H.append(P('Le Worker <b>ne connait pas Supabase</b> (0 occurrence) et l app <b>ne relit rien</b> de '
           'Supabase.', 'p'))

H.append(P('C. Ce qui quitte reellement le telephone', 'h1'))
H.append(P('La regle <i>&laquo; le fil Milo reste sur le telephone &raquo;</i> est <b>vraie</b> - '
           'elle couvre le fil brut. Mais <b>' + (C % 'coachMemory') + ', ' + (C % 'registre') +
           ' (faits ET observations) et ' + (C % 'adn') + ' partent deja</b> vers Apps Script, '
           'Supabase <b>et</b> Drive. Les donnees de <b>sante</b> (bilans sanguins et corporels, '
           'cycle, TRT) vivent dans ' + (C % 'h_{email}') + ' et sont <b>dans les sauvegardes '
           'Drive</b>. <i>La frontiere n est pas ou on la croit.</i>', 'p'))

H.append(P('D. Authentification - le coeur du sujet', 'h1'))
H.append(tableau(['action', 'identite verifiee ?', 'risque'],
                 [['lecture du compte', '<b>OUI</b> - code obligatoire', 'faible'],
                  ['<b>ecriture du compte</b>', '<b>NON si le compte n a pas de code</b>',
                   '<b>ecrasement entre comptes</b>'],
                  ['<b>sante (pushHealth)</b>', '<b>NON</b> - idem', '<b>idem</b>'],
                  ['<b>ft_miroir (Supabase)</b>', '<b>NON</b> - p_email libre', 'ecrasement du miroir'],
                  ['<b>tout appel IA (Worker)</b>', '<b>NON</b> - Origin seul', 'depense aux frais de Michel'],
                  ['Premium', 'partiel - client falsifiable', 'pas de verification serveur pour l IA'],
                  ['routes admin', '<b>OUI</b> - jeton, fail-closed', 'faible']],
                 [44 * mm, 62 * mm, 60 * mm]))
H.append(Spacer(1, 4))
H.append(P('<b>Le projet a lui-meme ecrit le diagnostic</b>, dans ' + (C % 'Code.js') + ' : '
           '<i>&laquo; l email est usurpable &raquo;</i> et <i>&laquo; un secret distribue avec le '
           'client n est pas un secret &raquo;</i>. <b>Ces deux phrases resument l audit.</b>', 'p'))

H.append(P('E-F. Supabase et Worker', 'h1'))
H.append(P('<b>Supabase</b> : la cle servie est <b>publiable</b> et n a <b>aucun droit sur la '
           'table</b> - elle ne peut qu executer ' + (C % 'ft_miroir') + ', en <i>security '
           'definer</i>. <b>Aucune lecture n est possible</b> : c est ce qui rend la faiblesse du '
           + (C % 'p_email') + ' libre tolerable <b>aujourd hui</b>. [!] RLS, GRANT, vues et le '
           '<b>search_path du proprietaire</b> de la fonction ne sont <b>pas lisibles depuis le '
           'depot</b> - a verifier en console.', 'p'))
H.append(encadre('LE VERROU DU WORKER N EN EST PAS UN',
                 'Seul controle : ' + (C % "Origin === 'https://michdu75-commits.github.io'") +
                 '. <b>Un en-tete n est pas une preuve</b> : ' + (C % 'curl -H "Origin: ..."') +
                 ' passe. Le commentaire du code dit <i>&laquo; curl/scripts : refus &raquo;</i> - '
                 'vrai pour un script naif, <b>faux pour un attaquant</b>.<br/><br/>'
                 'La vraie borne est ailleurs : le <b>plafond global de %d appels/jour</b> '
                 '(%d par e-mail). C est aujourd hui <b>la seule chose</b> qui separe Michel d une '
                 'facture ouverte - estimation du pire cas : <b>6 a 40 EUR par jour</b>.'
                 % (CAP_G, CAP_E), ORANGE))

H.append(P('H. Sauvegardes - et la suppression', 'h1'))
H.append(P('Quatre copies : telephone, Apps Script (source de verite), Supabase (miroir), et '
           '<b>Drive</b> - un fichier <b>par jour</b>, contenant <b>tous les comptes</b>. '
           '<b>Aucune purge n existe</b> (verifie dans le code de la sauvegarde).', 'p'))
H.append(encadre('REPONSE A LA QUESTION DE MICHEL : NON',
                 'Nous ne savons <b>pas</b> supprimer toutes les copies. Une suppression devrait '
                 'couvrir le telephone, ' + (C % 'u_{email}') + ', <b>' + (C % 'h_{email}') +
                 '</b>, les 5 onglets du Sheet, <b>chaque fichier Drive quotidien</b>, la ligne '
                 'Supabase et les journaux.<br/><br/>'
                 '<b>Tant que les sauvegardes ne sont pas purgees, toute donnee supprimee '
                 'RESSUSCITE</b> a la premiere restauration. Et <b>aucune route deleteAccount n '
                 'existe</b> - verifie.'))

H.append(P('N. Vulnerabilites classees', 'h1'))
H.append(tableau(['', 'constat', 'impact'],
                 [['<b>CRITIQUE</b>', '<b>V1</b> - ecrasement de compte entre utilisateurs '
                   '(Apps Script), si la victime n a pas pose de code',
                   'perte des donnees d autrui, sante comprise'],
                  ['<b>CRITIQUE</b>', '<b>V2</b> - ecrasement de la ligne miroir Supabase '
                   '(p_email libre)', 'limite aujourd hui (aucune lecture) - <b>interdit d etendre</b>'],
                  ['<b>ELEVE</b>', '<b>V3</b> - le verrou du Worker est un en-tete Origin',
                   '6 a 40 EUR/jour ; <b>CRITIQUE si le plafond monte</b>'],
                  ['<b>ELEVE</b>', '<b>V4</b> - aucune verification Premium cote serveur', 'modele payant'],
                  ['<b>ELEVE</b>', '<b>V5</b> - adresses e-mail reelles dans un depot public',
                   'matiere premiere de l usurpation'],
                  ['<b>ELEVE</b>', '<b>V6</b> - suppression de compte impossible a honorer', 'resurrection'],
                  ['<b>MOYEN</b>', 'V7 fail-open sur exception &middot; V8 rejeu Ko-fi &middot; '
                   'V9 quotas locaux &middot; V10 Script Properties 512 Ko &middot; V11 search_path inconnu',
                   'durcissement'],
                  ['<b>FAIBLE</b>', 'V12 relais generique &middot; V13 journaux non audites', 'defensif']],
                 [24 * mm, 84 * mm, 58 * mm]))

H.append(P('O-P. Architecture cible et trajectoire', 'h1'))
H.append(P('<b>Cible</b> : client considere comme <b>entierement public</b> (PWA comme natif) '
           '&gt; <b>Worker</b> seul detenteur des secrets, qui valide un jeton et applique quotas '
           'et Premium &gt; <b>Supabase</b> via RPC bornees, jamais de droits de table, '
           '<b>pas de service_role si une RPC suffit</b>.', 'p'))
H.append(tableau(['phase', 'contenu'],
                 [['<b>S0</b>', '<i>decider</i> : l ecriture doit-elle rester ouverte ? (regle d or '
                   'n°3 <b>contre</b> V1)'],
                  ['<b>S1</b>', '<b>identite serveur minimale</b> (jeton d appareil) - ferme '
                   '<b>V1, V2, V3 et V4</b> d un seul geste'],
                  ['<b>S2</b>', 'Supabase : RLS verifiee, RPC dediees, moindre privilege'],
                  ['<b>S3</b>', '<b>idempotence du debrief</b> (le chantier en attente)'],
                  ['<b>S4</b>', 'deleteAccount + purge des sauvegardes + cycle de vie des donnees'],
                  ['<b>S5</b>', 'durcissement avant Android/iOS, retrait des e-mails du depot']],
                 [18 * mm, 148 * mm]))

H.append(P('Les cinq choses que je refuserais de publier en l etat', 'h1'))
H.append(P('<b>1.</b> L <b>ecriture de compte sans identite</b> - n importe qui ecrase les donnees '
           'de n importe qui. <b>2.</b> Le <b>verrou Origin</b> du Worker - un controle qu une ligne '
           'de curl traverse, devant une depense reelle. <b>3.</b> L <b>impossibilite de supprimer '
           'un compte</b> - des sauvegardes sans purge font ressusciter ce qu on efface. '
           '<b>4.</b> Les <b>adresses e-mail reelles</b> dans un depot public. <b>5.</b> '
           + (C % 'ft_miroir') + ' avec un ' + (C % 'p_email') + ' <b>libre</b> - inoffensif tant '
           'qu on ne lit rien, <b>inacceptable des qu on relit</b>.', 'p'))

H.append(encadre('LA PREMIERE CORRECTION, AVANT DE REPRENDRE L IDEMPOTENCE',
                 '<b>Une identite serveur minimale - un jeton d appareil que le Worker exige.</b>'
                 '<br/><br/>Ce n est pas un detour : <b>l idempotence du debrief se construit '
                 'exactement dessus</b>. Une cle d idempotence derivee d un e-mail que le client '
                 'fournit librement serait posee sur du sable - on batirait la deduplication sur la '
                 'faiblesse meme que cet audit vient de mesurer. <i>Et c est le projet qui l a ecrit '
                 'le premier : &laquo; l email est usurpable &raquo;.</i><br/><br/>'
                 'Bonus mesure : ce meme jeton ferme <b>V1, V2, V3 et V4</b> - le geste au meilleur '
                 'rendement de tout le plan.', VERT))

H.append(Spacer(1, 6))
H.append(P('Ce PDF est genere par <font face="Courier">tools/gen_audit_secu_pdf.py</font>, dont les '
           '%d gardes <b>reverifient chaque faille dans le code</b> a la generation : si un defaut '
           'est corrige entre-temps, le document <b>refuse de sortir</b> plutot que d accuser a '
           'tort. Deux gardes protegent des absences : aucun secret reel dans les fichiers servis, '
           'et <b>aucune cle en clair dans ce document</b>.' % GARDES[0], 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Force Tracker - audit securite backend (%s)' % VERSION,
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)
print('OK %s  (%s, %d gardes, plafonds %d/%d, %d e-mails publies)'
      % (OUT, VERSION, GARDES[0], CAP_G, CAP_E, NB_MAILS))
