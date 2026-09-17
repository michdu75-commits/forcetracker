#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Dossier GPT — FINALISATION DE L'ACCUEIL (hors depot, regle d'or #14).

[!!] CE DOSSIER AFFIRME DEUX CHOSES OPPOSEES EN MEME TEMPS : que deux morceaux de code mort
     ONT DISPARU, et que TOUT LE RESTE est reste en place. Les gardes reverifient les deux
     moities dans le code servi, et refusent de produire si l'une tombe. Un dossier qui decrit
     un arbre qu'on ne sert plus est pire qu'un dossier absent : il a l'air verifie.

[!!] LE PIEGE PROPRE A CETTE PASSE, ET IL EST INEVITABLE : la RAISON de chaque retrait est
     ecrite a l'endroit du retrait (R30), donc les identifiants retires sont cites en toutes
     lettres dans les commentaires voisins — en JS *et* en HTML. Un garde qui ne distingue pas
     le CODE de ce qui en PARLE mesurerait ma propre documentation et resterait vert pour
     toujours. D'ou deux nettoyeurs, le choix EXPLICITE de l'un ou l'autre a chaque garde, et
     le retrait des commentaires HTML `<!-- -->` au meme titre que les `/* */`.
     (Famille ft-v1193 / 1203 / 1205 / 1210 / 1216.)

[!!] LES CHIFFRES DE PASSE, DE BANC ET DE MUTATIONS SONT LUS DANS LEURS JOURNAUX, JAMAIS
     RETAPES (lecon ft-v1201 : un PDF a publie un total pendant que la passe tournait encore).
     Les autres sont RECOMPTES depuis le code servi.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji, entites decodees AVANT controle.
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
OUT = os.environ.get('FT_OUT') or '/tmp/DOSSIER-FINALISATION-ACCUEIL-16-09-2026.pdf'
BANC = os.environ.get('FT_BANC') or '/tmp/banc_nettoyage.log'
MUT = os.environ.get('FT_MUT') or '/tmp/mut_nettoyage.log'
PASSE = os.environ.get('FT_PASSE') or '/tmp/passe1220.log'

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def _strip(src, garder_chaines):
    """Retire commentaires JS (// et /* */) ET commentaires HTML (<!-- -->).
    `garder_chaines` decide si les chaines survivent — c'est le choix qui compte :
    un fait qui vit DANS une chaine (getElementById('...')) exige True."""
    src = re.sub(r'<!--[\s\S]*?-->', '', src)
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
            out.append(src[i:j + 1] if garder_chaines else q + q)
            i = j + 1
        else:
            out.append(c)
            i += 1
    return ''.join(out)


def code_seul(src):
    return _strip(src, False)


def code_et_chaines(src):
    return _strip(src, True)


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
IDX = lire('index.html')
CSS = lire('style.css')
STA = lire('state.js')
SW = lire('sw.js')
RUN = lire(os.path.join('tests', 'parcours', 'runner.js'))
TEM = lire(os.path.join('tests', 'parcours', 'accueil_mini.js'))
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]

# [!!] `garder_chaines=True` PARTOUT OU ON CHERCHE UN IDENTIFIANT DOM : il vit dans une
#      chaine. Le choix inverse rendrait le garde aveugle a getElementById('home-sync-dot'),
#      c'est-a-dire exactement a la regression qu'il doit attraper.
SCR_S = code_et_chaines(SCR)
IDX_S = code_et_chaines(IDX)
CSS_S = re.sub(r'/\*[\s\S]*?\*/', '', CSS)
TRK_S = code_et_chaines(TRK)
PILL_S = code_et_chaines(corps(SCR, 'updatePill'))

MORTS = ['home-sheets-pill', 'home-sync-dot', 'home-sync-lbl', 'strength-levels', 'pr-list']

# ══ (A) CE QUI A DISPARU — DU CODE, PAS DES COMMENTAIRES ═══════════════════════════════
g(bool(PILL_S), 'updatePill introuvable dans screens.js')
for _id in MORTS:
    g(_id not in SCR_S and _id not in IDX_S and _id not in CSS_S and _id not in TRK_S,
      'l identifiant mort « %s » est REVENU dans le code servi : ce dossier affirme le '
      'contraire' % _id)
g('Inline home pill' not in code_et_chaines(SCR),
  'la branche « Inline home pill » est revenue dans screens.js')

# ══ (B) CE QUI DEVAIT RESTER — ET C'EST LA MOITIE QU'ON OUBLIE DE GARDER ═══════════════
# [!!] Une suppression voisine d'un code vivant se prouve sur le VOISIN, pas seulement sur le
#      disparu : un « ils ont disparu » est aussi vrai quand on a tout emporte.
for _id in ('sync-pill', 'sync-dot', 'sync-lbl'):
    g("'%s'" % _id in PILL_S,
      'le VRAI identifiant « %s » a ete emporte avec le nettoyage : la pastille de synchro de '
      'l en-tete cesse de fonctionner' % _id)
g("'Sheets ✓'" in PILL_S or 'Sheets ✓' in PILL_S,
  'updatePill n affiche plus l etat connecte : la pastille ne reagit plus')

# [!!] LE GARDE LE PLUS IMPORTANT DE CE DOSSIER, ET IL EXISTE PARCE QUE MON AUDIT S'EST
#      TROMPE. Il classait #cycle-home-card « orphelin prouve, aucun lecteur, jamais rempli ».
#      C'est FAUX : renderCycleHomeCard() ecrit dans ses deux spans et renderCycleScreen()
#      l'appelle. L'audit ne mesurait QUE le chemin de l'Accueil, donc un ecrivain vivant
#      AILLEURS y restait invisible. La chaine entiere est desormais figee.
g('id="cycle-home-card"' in IDX_S and 'id="cycle-home-title"' in IDX_S
  and 'id="cycle-home-sub"' in IDX_S,
  '#cycle-home-card a ete retire : il a un VRAI ecrivain (renderCycleHomeCard), et le retirer '
  'est une DECISION qui appartient a Michel, pas un nettoyage prouve')
CYC = code_et_chaines(corps(TRK, 'renderCycleHomeCard'))
g(bool(CYC) and 'cycle-home-title' in CYC and 'cycle-home-sub' in CYC,
  'renderCycleHomeCard ne lit plus ses deux spans : l argument central de la correction '
  'd audit de ce dossier tombe')
g('renderCycleHomeCard();' in code_seul(corps(TRK, 'renderCycleScreen')),
  'renderCycleScreen n appelle plus renderCycleHomeCard : le conteneur cycle deviendrait '
  'vraiment orphelin, et ce dossier affirme le contraire')

# hors perimetre, nommement — chacun cite dans le dossier
g('id="recovery-card"' in IDX_S and bool(corps(TRK, 'renderRecoveryCard')),
  'renderRecoveryCard / #recovery-card ont ete touches : ils sont HORS PERIMETRE (orphelin '
  'PROBABLE, pas prouve — la mesure manquante est une vraie sauvegarde de sommeil)')
g('id="home-hdr"' in IDX_S and bool(corps(SCR, '_renderHomeHdr')),
  '_renderHomeHdr / #home-hdr ont ete touches : ils sont HORS PERIMETRE (passe R30 a part)')
g(bool(corps(lire('log.js'), 'openPlateCalc')),
  'openPlateCalc a ete retiree : elle est HORS PERIMETRE (retrait deja acte par Michel en '
  '2026, R30 — voir le journal)')
g(re.search(r'const\s+fmt\s*=\s*n\s*=>\s*Math\.round\(n\*10\)\s*/\s*10\s*;',
            code_seul(STA)) is not None,
  'fmt() a ete modifiee : elle est HORS PERIMETRE')
g(re.search(r'wScore\s*=\s*70\s*;', code_seul(corps(TRK, 'calcRecoveryDetail'))) is not None,
  'la base neutre 70 a disparu du moteur : elle est HORS PERIMETRE')
g(bool(corps(TRK, '_nuitsRecentes')), '_nuitsRecentes a disparu : elle est HORS PERIMETRE')
g('DETTE R2 CONFIRM' in SCR,
  'l inventaire de la dette « derniere pesee » a disparu : il devait rester OUVERT et ECRIT')

# [!!] LA PALETTE : Michel a dit « NE CHANGE PAS --t3 dans cette passe ». Le garde le verifie
#      sur la VALEUR, pas sur la presence du nom — « --t3 est present » resterait vrai apres
#      un changement de couleur. (Famille du temoin aveugle : chercher une PRESENCE ne mesure
#      pas une VALEUR.)
_t3 = re.search(r'--t3\s*:\s*(#[0-9A-Fa-f]{3,8})', CSS_S)
g(bool(_t3) and _t3.group(1).lower() == '#6b7180',
  'la palette a change : --t3 vaut %s au lieu de #6B7180, et la consigne etait de NE PAS y '
  'toucher dans cette passe' % (_t3.group(1) if _t3 else 'introuvable'))

# ══ (C) LES 4 CORRECTIONS DE ft-v1219 ONT SURVECU A LA FUSION ET AU NETTOYAGE ══════════
HOME_S = code_et_chaines(corps(SCR, 'renderHome'))
HERO_S = code_et_chaines(corps(SCR, '_renderHomeHero'))
HERO_C = code_seul(corps(SCR, '_renderHomeHero'))
g("isFinite(_bwN)?fmt(_bwN):'—'" in HOME_S.replace(' ', ''),
  'la correction 1 de ft-v1219 (le NaN kg) a disparu : elle n a JAMAIS ete en ligne, donc '
  'elle ne peut pas etre perdue en silence')
g(IDX_S.count('id="home-hero"') == 1 and IDX_S.index('id="home-hero"') < IDX_S.index('id="home-milo"'),
  'la correction 2 de ft-v1219 (la carte de recup devant les sollicitations) est defaite')
g('_sansDonnee=' in HERO_C.replace(' ', ''),
  'la correction 3 de ft-v1219 (le silence sur un compte muet) a disparu')
g('padding:13px 10px;margin:-9px -10px -9px;' in HERO_S,
  'la correction 4 de ft-v1219 (la zone tapable) a disparu')

# ══ (D) LES TEMOINS EXISTENT, ET LE BANC LES APPELLE VRAIMENT ═════════════════════════
N_ECR20 = len(re.findall(r"t\('B-CCCXX T", TEM))
g(N_ECR20 == 17, 'le bloc B-CCCXX ne porte plus 17 temoins (%d)' % N_ECR20)
g("require('./accueil_mini.js').ecran(t, b, PORT)" in RUN,
  'le banc de parcours n appelle plus les temoins d ecran : ils ne tourneraient qu au '
  'controle negatif, donc jamais en livraison')
g("require('./accueil_mini.js').source(t, ROOT, fs, path)" in RUN,
  'le banc de parcours n appelle plus les temoins de source')
# [!!] SANS CETTE LIGNE, LE TEMOIN T12 MESURAIT MA DOCUMENTATION : il lisait le fichier brut,
#      ou la raison du retrait (R30) cite justement les identifiants retires. Il rougissait
#      sur un depot parfaitement propre.
g('<!--[\\s\\S]*?-->' in TEM.replace('\\\\', '\\'),
  'le nettoyeur des temoins ne retire plus les commentaires HTML : le temoin T12 redevient '
  'une mesure de la documentation')

# ══ (E) LA PUBLICATION — CE DOSSIER PARLE D'UN COMMIT QUI EST SUR master ══════════════
def git(*a):
    """⛔ ECHOUE FERMÉ. La premiere version rendait '' sur exception ET sur code de retour
    non nul — donc un `git diff` contre un sha INEXISTANT rendait '' , que l appelant lisait
    « aucun ecart ». Mesure : le garde du sha servi restait VERT sur un sha bidon, c est-a-dire
    exactement dans le cas qu il doit attraper. *Un garde qui interprete l ECHEC de sa mesure
    comme « tout va bien » ne mesure rien* — famille BUGS.md §61 (une passe interrompue
    ressemble trait pour trait a une passe verte), appliquee a git."""
    r = subprocess.run(['git'] + list(a), cwd=ROOT, capture_output=True, text=True, timeout=60)
    if r.returncode != 0:
        raise SystemExit('GARDE ROUGE - la commande « git %s » a echoue (%s) : ce dossier ne '
                         'peut rien affirmer sur une mesure qui n a pas abouti'
                         % (' '.join(a), (r.stderr or '').strip().splitlines()[:1]))
    return r.stdout.strip()


# [!!] MON PREMIER GARDE EXIGEAIT « l arbre de travail est propre », ET IL A REFUSE DE
#      PRODUIRE SUR UN TRAVAIL JUSTE : je venais de corriger ce generateur, qui n est pas un
#      fichier servi. *Un garde plus strict que la contrainte reelle refuse du travail juste*
#      (ft-v1214, ft-v1216 — deja paye deux fois). L invariant qui compte n est pas « HEAD est
#      propre », c est « LES FICHIERS SERVIS sont EXACTEMENT ceux publies sur master » : c est
#      la seule propriete qui rend ce dossier vrai pour quelqu un qui ouvre l application.
SERVIS = ['index.html', 'style.css', 'sw.js', 'manifest.json',
          'constants.js', 'state.js', 'app.js', 'screens.js', 'log.js',
          'coach.js', 'setup.js', 'tracking.js', 'supabase.js',
          os.path.join('tests', 'parcours', 'accueil_mini.js')]
PUBLIE = git('rev-parse', 'origin/master')
g(len(PUBLIE) == 40,
  'impossible de lire le commit publie sur origin/master : ce dossier ne peut pas dire quelle '
  'version est REELLEMENT servie')
_ecart = [f for f in SERVIS
          if git('diff', '--name-only', PUBLIE, '--', f) or git('diff', '--name-only', '--', f)]
g(not _ecart,
  'ces fichiers SERVIS different de ce qui est publie sur master : %s — le dossier decrirait '
  'un arbre que personne ne sert (BUGS.md §60)' % ', '.join(_ecart))
HEAD = PUBLIE


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

LM = journal(MUT)
_mm = re.search(r'(\d+)\s*/\s*(\d+)\s*mutations conformes', LM)
g(bool(_mm), 'le journal du controle negatif (%s) ne porte pas de ligne de total' % MUT)
M_OK, M_TOT = int(_mm.group(1)), int(_mm.group(2))
g(M_OK == M_TOT, 'seules %d mutations sur %d sont conformes' % (M_OK, M_TOT))
g(LM.count('CONTROLE SAIN') == 2,
  'le controle sain n a pas tourne des deux cotes : une serie de mutations peut avoir laisse '
  'l arbre casse en silence')
g(LM.count('VERT ATTENDU') >= 4,
  'les mutations qui doivent RESTER VERTES ont disparu : plus rien ne prouve qu on mesure le '
  'CODE et non la DOCUMENTATION — et ici c est capital, la raison du retrait NOMME les '
  'identifiants retires')

# ══ LE DEPLOIEMENT : LU DANS SON JOURNAL, ECRIT DEPUIS L API — JAMAIS RETAPE ══════════
# [!!] C'est la lecon ft-v1201 appliquee au deploiement : ce dossier a failli affirmer
#      « en ligne » alors que Pages servait une version de la veille. Un push n'est pas un
#      deploiement, et un deploiement LISTE n'est pas un deploiement REUSSI : il faut lire
#      ses STATUTS. Les sept sains font waiting -> queued -> in_progress -> success ; celui
#      qui bloquait tout etait reste a `waiting` tout seul.
DEP = os.environ.get('FT_DEP') or '/tmp/deploiement.log'
LD = journal(DEP)
g(bool(LD), 'le journal de deploiement (%s) est absent : ce dossier ne peut pas dire si la '
            'version est REELLEMENT en ligne' % DEP)
_ms = re.search(r'DERNIER SUCCESS\s*:\s*([0-9a-f]{40})', LD)
g(bool(_ms), 'le journal de deploiement ne porte pas de ligne DERNIER SUCCESS')
SHA_SERVI = _ms.group(1)
_bloques = re.search(r'BLOQUES\s*:\s*(\d+)', LD)
g(bool(_bloques), 'le journal de deploiement ne porte pas le compte des runs bloques')
N_BLOQ = int(_bloques.group(1))
# ⭐ LE GARDE QUI COMPTE : le sha SERVI doit etre le commit de cette livraison, ou un
#    descendant qui n'a touche AUCUN fichier servi. Sinon ce dossier dit « en ligne » a tort.
g(git('cat-file', '-t', SHA_SERVI) == 'commit',
  'le sha annonce comme SERVI (%s) n existe pas dans ce depot : le journal de deploiement '
  'ne decrit pas cet arbre' % SHA_SERVI[:12])
_ecart_servi = [f for f in SERVIS if git('diff', '--name-only', SHA_SERVI, PUBLIE, '--', f)]
g(not _ecart_servi,
  'le sha SERVI par Pages (%s) differe de master sur des fichiers servis : %s — ce dossier '
  'affirmerait « en ligne » a tort' % (SHA_SERVI[:12], ', '.join(_ecart_servi)))
_sain = len(re.findall(r'waiting -> queued -> in_progress -> success', LD))
g(_sain >= 5, 'le journal ne montre pas assez de deploiements SAINS pour que la comparaison '
              'avec l anomalie ait un sens (%d)' % _sain)

LP = journal(PASSE)
_mp = re.search(r'TOTAL CROIS\S+\s*:\s*(\d+)\s*\S+\s*\S+\s*(\d+)', LP)
P_KO_LIGNES = len(re.findall(r'^\s*❌', LP, re.M))
if _mp:
    FINIE, P_OK, P_KO = True, int(_mp.group(1)), int(_mp.group(2))
else:
    FINIE, P_OK, P_KO = False, len(re.findall(r'^\s*✅', LP, re.M)), P_KO_LIGNES
g(P_KO == 0, 'la passe porte %d rouge(s) : rien ne se publie' % P_KO)
# [!!] ft-v1201 : ne JAMAIS annoncer un total de passe qui n'existe pas encore.
PASSE_TXT = ('%d / %d' % (P_OK, P_OK + P_KO)) if FINIE else \
            'EN COURS (%d verts a cet instant)' % P_OK

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
H.append(P('Finalisation de l Accueil : publication reelle, et nettoyage prouve', 'titre'))
H.append(P('Force Tracker - 16/09/2026 - base %s - commit %s. Aucun redesign, aucune '
           'fonctionnalite nouvelle. Document hors depot (regle d or #14).'
           % (VERSION, HEAD[:12]), 'sous'))

H.append(encadre(
    'EN UNE PHRASE, ET LE PREMIER POINT EST LE PLUS IMPORTANT',
    '<b>' + (C % 'ft-v1219') + ' n avait jamais atteint ' + (C % 'master') + '.</b> Les quatre '
    'corrections du 16/09 (le ' + (C % 'NaN kg') + ', la carte de recuperation remontee, le '
    'silence sur un compte muet, la zone tapable) vivaient sur une branche, et le deploiement '
    'GitHub Pages ne se declenche que sur ' + (C % 'master') + ' : elles n etaient <b>en ligne '
    'nulle part</b>. <i>Push sur une branche n est pas une version en ligne</i> (R18, deja paye '
    'deux fois dans ce projet).<br/><br/>'
    'Cette passe les publie, et retire <b>le seul code mort prouve</b> : la branche '
    + (C % '« Inline home pill »') + ' d ' + (C % 'updatePill') + ' (10 lignes, 3 conteneurs '
    'absents de tout le depot) et deux conteneurs vides, ' + (C % '#strength-levels')
    + ' et ' + (C % '#pr-list') + '.<br/><br/>'
    '<b>Et elle corrige mon propre audit de la veille</b> : il classait '
    + (C % '#cycle-home-card') + ' « orphelin prouve, aucun lecteur ». <b>C est faux</b> - '
    + (C % 'renderCycleHomeCard()') + ' ecrit dans ses deux spans, et '
    + (C % 'renderCycleScreen()') + ' l appelle. Le conteneur <b>reste</b>.'))

H.append(P('1. Pourquoi cette passe existe : push n est pas publication', 'h1'))
H.append(P('Mesure au depart : ma branche etait en avance de 11 commits sur ' + (C % 'master')
           + ', et ' + (C % 'master') + ' en avance de 6 sur ma branche. Les 6 commits de '
           'l autre session ne touchent que ' + (C % 'tools/') + ' - <b>aucun fichier servi</b>, '
           'donc aucun conflit possible. Fusion faite, puis les quatre corrections de '
           + (C % 'ft-v1219') + ' <b>re-verifiees une par une APRES la fusion</b> : une fusion '
           'qui compile n est pas une fusion qui preserve.', 'p'))

H.append(P('2. Ce qui est retire, et la preuve de chaque retrait', 'h1'))
H.append(tableau(
    ['ce que c etait', 'ou', 'preuve'],
    [['branche ' + (C % '« Inline home pill »') + ' : 10 lignes cherchant 3 conteneurs d une '
      'ancienne pastille de synchro posee <i>dans</i> l Accueil',
      (C % 'screens.js') + ', ' + (C % 'updatePill'),
      'les 3 identifiants <b>absents</b> de tout le depot ; <b>3 requetes DOM sur 21 rendaient '
      + (C % 'null') + ' A CHAQUE RENDU</b>'],
     [(C % '#strength-levels') + ' et ' + (C % '#pr-list') + ' : deux conteneurs <b>vides</b>, '
      + (C % 'display:none'), (C % 'index.html'),
      '<b>aucun lecteur</b> dans l arbre entier (JS, HTML, CSS, tests)'],
     ['<b>' + (C % '#cycle-home-card') + ' (+ 2 spans)</b>', (C % 'index.html'),
      '<b>GARDE</b> - il a un vrai ecrivain (section 3)']],
    [58 * mm, 36 * mm, 72 * mm]))
H.append(P('<b>Les VRAIS identifiants sont intacts</b> - ' + (C % 'sync-pill') + ', '
           + (C % 'sync-dot') + ', ' + (C % 'sync-lbl') + ', la pastille de l en-tete - et deux '
           'temoins le figent : l un verifie qu ils sont toujours nommes, l autre <b>conduit la '
           'pastille dans ses deux etats</b> et lit ce qu elle affiche. <i>Une suppression '
           'voisine d un code vivant se prouve sur le voisin, pas seulement sur le disparu : un '
           '« ils ont disparu » est aussi vrai quand on a tout emporte.</i>', 'p'))

H.append(P('3. La correction a mon propre audit - le point le plus utile de la passe', 'h1'))
H.append(P('L audit du 16/09 annoncait ' + (C % '#cycle-home-card') + ' comme <b>ORPHELIN '
           'PROUVE</b>, colonne « aucun lecteur JS ni CSS », « jamais rempli ». <b>C est '
           'faux.</b> ' + (C % 'renderCycleHomeCard()') + ' (' + (C % 'tracking.js') + ') ecrit '
           'dans ses deux ' + (C % '&lt;span&gt;') + ', et ' + (C % 'renderCycleScreen()')
           + ' l appelle - chemin <b>atteignable</b> par Menu &gt; Outils &gt; Cycle de force.'
           '<br/><br/>'
           '<b>Pourquoi l audit ne l a pas vu</b> : il ne mesurait que le chemin de l <b>Accueil</b>. '
           '<i>Un element vivant AILLEURS reste vert sur un banc borne a l Accueil.</i> Cet '
           'avertissement etait ecrit mot pour mot dans mon propre outil de mutations, et je l ai '
           'enfreint dans mon tableau de verdicts. <b>Un vert est toujours borne a la portee de '
           'son banc, et ne conclut jamais seul.</b><br/><br/>'
           'Le conteneur reste. Le retirer serait une <b>DECISION</b> - rendre son ecrivain sans '
           'effet - pas un nettoyage prouve, et elle appartient a Michel.', 'p'))

H.append(P('4. Mesure avant / apres', 'h1'))
H.append(tableau(
    ['', 'avant', 'apres'],
    [['requetes ' + (C % 'getElementById') + ' pendant ' + (C % 'renderHome'), '21', '<b>18</b>'],
     ['dont <b>vaines</b> (element inexistant)', '<b>3</b>', '<b>0</b>'],
     ['temps de rendu a froid', '4,9 ms', '4 ms'],
     ['temps de rendu a chaud (mediane de 20)', '3 ms', '2 ms'],
     ['ce que voit l utilisateur', '-', '<b>strictement identique</b>']],
    [76 * mm, 45 * mm, 45 * mm]))
H.append(P('<b>Aucun gain de temps n est revendique</b> : les deux mesures sont dans la '
           'dispersion. Le fait solide est le nombre de requetes, pas les millisecondes.', 'p'))

H.append(P('5. Les temoins, et pourquoi chaque absence est doublee d une presence', 'h1'))
H.append(P('Bloc <b>B-CCCXX</b>, %d temoins (11 au rendu reel, 6 de source), dans '
           % N_ECR20 + (C % 'tests/parcours/accueil_mini.js') + '. Le comptage des requetes DOM '
           'est pris <b>a l execution</b>, en instrumentant ' + (C % 'getElementById') + ' '
           'pendant ' + (C % 'renderHome') + ' : <i>la seule preuve qu une requete ne PART plus '
           'se prend a l execution, pas dans un fichier.</i><br/><br/>'
           '<b>Chaque temoin d absence est apparie a un temoin de presence</b>, et ce n est pas '
           'decoratif : un temoin qui verifie qu une chose n est plus la reste <b>parfaitement '
           'vert si le rendu ne s execute pas du tout</b>. <i>Un Accueil mort ressemble trait '
           'pour trait a un Accueil propre.</i> D ou : la carte de recup rendue, la pastille qui '
           'reagit dans ses deux etats, l ecrivain du conteneur cycle qui ecrit encore vraiment.', 'p'))

H.append(P('6. Le controle negatif, et l etiquette fausse qu il a trouvee', 'h1'))
# [!!] LE `%` NE S APPLIQUE QU A LA DERNIERE CHAINE D UNE CONCATENATION : le poser a la fin
#      d un bloc concatene a plante ce generateur. Meme famille que la borne en caracteres de
#      BUGS.md §63 — on formate AVANT, on concatene ENSUITE.
_chiffres = ('<b>%d mutations sur un arbre CLONE, %d conformes</b>, controle sain <b>%d OK / 0 '
             'rouge avant ET apres</b>.' % (M_TOT, M_OK, B_OK))
H.append(P(_chiffres + '<br/><br/>'
           '<b>Quatre doivent RESTER VERTES</b> : les identifiants retires cites dans un '
           'commentaire JS, un commentaire HTML, un commentaire CSS, ou un fichier de '
           'documentation. <b>Elles sont indispensables ici</b> - la raison du retrait (R30) '
           '<i>nomme</i> justement ces identifiants, donc un temoin qui lirait le fichier brut '
           'resterait vert <b>pour toujours</b>, quoi qu on remette dans le code.<br/><br/>'
           '<b>Et une cinquieme etait etiquetee verte a tort - par moi.</b> Elle remet un nom '
           'mort dans une ' + (C % 'const') + ' de premier niveau, et elle est sortie <b>rouge</b>. '
           'Le temoin avait raison : <i>une ' + (C % 'const') + ' qui s execute est du CODE, pas '
           'de la documentation.</i> Rendre le temoin aveugle aux chaines pour la faire passer '
           'l aurait rendu aveugle a ' + (C % "getElementById('home-sync-dot')") + ', qui vit '
           'exactement de la meme facon - dans une chaine.', 'p'))

H.append(P('7. En ligne, prouve - et treize heures de blocage dont la cause n etait pas celle '
           'annoncee', 'h1'))
H.append(P('<b>Ce qui a ete verifie</b> : le deploiement Pages actif porte le sha '
           + (C % SHA_SERVI[:12]) + ' avec l etat <b>success</b>, ce sha est ' + (C % 'origin/master')
           + ', et les %d fichiers servis y sont identiques au local <b>octet pour octet</b> '
           '(lus via ' % len(SERVIS) + (C % 'raw.githubusercontent.com') + '). <i>Pas '
           '« normalement » : le sha, son etat, et le contenu.</i>', 'p'))
H.append(P('<b>Mais il a fallu treize heures.</b> Huit runs Pages consecutifs sont restes '
           + (C % 'pending') + ' avec <b>zero job cree</b> : ni cette version, ni la precedente, '
           'ni les livraisons de l autre session n etaient servies.', 'p'))
H.append(tableau(
    ['', 'ce qui a ete dit', 'ce qui etait vrai'],
    [['la cause', 'quota Actions epuise (<b>mon hypothese</b>)',
      '<b>NON</b> - dementi en une phrase par Michel'],
     ['la vraie cause', '-',
      '<b>UN SEUL run</b>, #1184, coince en ' + (C % 'waiting') + ' : il attendait une '
      'approbation de l environnement ' + (C % 'github-pages')],
     ['pourquoi ca bloquait TOUT', '-',
      (C % 'concurrency: group: pages') + ' + ' + (C % 'cancel-in-progress: false') + ' - '
      'une decision <b>volontaire et juste</b>, mais un run coince tient la file <b>pour '
      'toujours</b>'],
     ['dernier deploiement reussi', '17:33 (<b>mon chiffre, faux</b>)',
      '<b>15:58</b> - celui de 17:33 n a jamais reussi non plus'],
     ['le geste qui a debloque', '-', 'annuler le run #1184 : la file est repartie aussitot']],
    [30 * mm, 60 * mm, 76 * mm]))
H.append(P('<b>Ce qui a permis de le voir</b> : lire l etat des <b>DEPLOIEMENTS</b>, pas celui '
           'des runs. Les sept precedents font ' + (C % 'waiting -&gt; queued -&gt; in_progress -&gt; success')
           + ' ; celui de 17:33 etait reste a ' + (C % 'waiting') + ' <b>tout seul</b>. <i>Le run, '
           'lui, disait « pending » comme les autres - c est la comparaison avec ses voisins SAINS '
           'qui a isole l anomalie.</i><br/><br/>'
           '<b>Les deux lecons, et elles se rappliquent</b> : <b>(1)</b> <i>un deploiement LISTE n est pas '
           'un deploiement REUSSI</i> - il faut lire ses statuts, sinon on annonce un chiffre faux, '
           'ce que j ai fait ; <b>(2)</b> <i>huit pannes identiques ne sont pas huit pannes</i> - c etait '
           '<b>une</b> panne vue huit fois, et compter les symptomes eloignait de la cause.<br/><br/>'
           '<b>Ce qu on ne sait toujours pas</b> : pourquoi #1184 a demande une approbation alors '
           'que les sept precedents passaient seuls. <b>Verifie depuis</b> : les deux deploiements '
           'suivants sont passes <b>sans rien demander</b>, donc il n y a pas de regle de protection '
           'persistante - c etait un incident isole. <i>Dit plutot que suppose : c est une '
           'observation sur deux cas, pas une preuve.</i>', 'p'))
H.append(P('8. Ce que cette passe ne fait pas', 'h1'))
H.append(tableau(
    ['laisse en place', 'pourquoi'],
    [[(C % '_renderHomeHdr') + ' / ' + (C % '#home-hdr'),
      'orphelin <b>PROBABLE</b>, pas prouve - et un temoin en depend : passe R30 a part'],
     [(C % 'renderRecoveryCard') + ' / ' + (C % '#recovery-card'),
      'la mesure manquante est une <b>vraie sauvegarde de sommeil par l interface</b>'],
     [(C % '#cycle-home-card') + ' (+2 spans)', 'il a un vrai ecrivain (section 3)'],
     [(C % 'openPlateCalc') + ', les 47 fonctions de categorie C',
      'hors perimetre - retrait deja acte par Michel (R30)'],
     [(C % 'fmt()') + ', la base neutre 70, ' + (C % '_nuitsRecentes'),
      'valeurs metier volontaires, avec d autres lecteurs'],
     ['la dette R2 « derniere pesee »', 'confirmee, <b>laissee ouverte expres</b>, inventaire '
      'ecrit dans le code'],
     ['les 55 classes CSS candidates', '<b>candidates</b>, pas prouvees'],
     ['<b>la palette, ' + (C % '--t3') + ' compris</b>',
      'contraste <b>3,70 &lt; 4,5</b> sur les petits textes gris : <b>recommandation separee</b>, '
      'jamais un correctif glisse ici'],
     ['Nutrition, douane, journal alimentaire', '<b>0 ligne</b>']],
    [58 * mm, 108 * mm]))

H.append(P('9. Reponses, avec leur preuve', 'h1'))
H.append(tableau(
    ['#', 'question', 'reponse et preuve'],
    [['1', 'la branche est-elle reconciliee avec ' + (C % 'master') + ' ?',
      '<b>OUI</b> - 6 commits fusionnes, aucun fichier servi touche'],
     ['2', 'les 4 corrections de ' + (C % 'ft-v1219') + ' ont-elles survecu ?',
      '<b>OUI</b> - re-verifiees une par une apres la fusion, 4 gardes ici'],
     ['3', 'seul le code mort <b>prouve</b> est-il supprime ?',
      '<b>OUI</b> - et un candidat a ete <b>retire de la liste</b> apres verification'],
     ['4', 'un candidat seulement probable a-t-il ete touche ?',
      '<b>NON</b> - ' + (C % '#home-hdr') + ' et ' + (C % '#recovery-card') + ' intacts, 2 '
      'mutations mordent'],
     ['5', 'la palette a-t-elle change ?',
      '<b>NON</b> - ' + (C % '--t3') + ' verifie sur sa <b>valeur</b>, pas sur sa presence'],
     ['6', 'une fonctionnalite a-t-elle ete ajoutee ?', '<b>NON</b> - aucun ecran, aucun bouton'],
     ['7', 'l utilisateur voit-il une difference ?',
      '<b>NON</b> - 3 requetes qui rendaient ' + (C % 'null') + ' cessent de partir, 2 '
      'conteneurs vides et invisibles disparaissent'],
     ['8', 'un gain de vitesse est-il revendique ?',
      '<b>NON</b> - dans la dispersion des mesures'],
     ['9', 'l audit de la veille etait-il juste ?',
      '<b>PARTIEL</b> - juste sur 2 candidats sur 3 ; <b>faux</b> sur '
      + (C % '#cycle-home-card') + ', corrige ici avec sa cause'],
     ['10', '<b>est-ce REELLEMENT en ligne ?</b>',
      '<b>OUI</b> - deploiement ' + (C % SHA_SERVI[:12]) + ' en etat <b>success</b>, fichiers '
      'servis identiques octet pour octet'],
     ['11', 'le dossier decrit-il l arbre reellement servi ?',
      '<b>OUI</b> - arbre propre verifie, commit ' + (C % HEAD[:12]) + ' lu par un garde']],
    [8 * mm, 66 * mm, 92 * mm]))

H.append(Spacer(1, 3))
H.append(P('Document produit par ' + (C % 'tools/gen_finalisation_pdf.py') + ' - <b>'
           + str(GARDES[0]) + ' gardes</b> qui recomptent chaque fait depuis le code servi ou le '
           'lisent dans les journaux, et refusent de produire si un fait tombe - y compris si un '
           'identifiant retire revient, si un element hors perimetre a saute, si la palette a '
           'change, si le sha SERVI par Pages s ecarte de master sur un fichier servi, ou si le '
           'journal de deploiement manque. Banc : %d/%d. Controle negatif : %d/%d. Passe '
           'complete : %s. Commit : %s. Servi par Pages : %s (%d runs bloques avant deblocage).'
           % (B_OK, B_OK + B_KO, M_OK, M_TOT, PASSE_TXT, HEAD[:12], SHA_SERVI[:12], N_BLOQ), 'petit'))

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Finalisation de l Accueil - publication reelle et nettoyage prouve',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, banc %d/%d, mutations %d/%d, passe %s)'
      % (OUT, VERSION, GARDES[0], B_OK, B_OK + B_KO, M_OK, M_TOT, PASSE_TXT))
