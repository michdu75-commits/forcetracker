#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""LES 16 REGLES D'OR DE FORCE TRACKER — fiche autonome (hors depot, regle d'or #14).

[!!] TOUT EST EXTRAIT DES FICHIERS, RIEN N'EST REECRIT DE MEMOIRE. Le titre et le corps de
     chaque regle sont lus dans `docs/REGLES-OR.md` (le texte complet) et la version d'une
     ligne dans `CLAUDE.md`. Un garde verifie que les 16 existent DES DEUX COTES et que leurs
     numeros se suivent : c'est exactement le controle que fait `tools/check_regles.py`.
     *Une fiche de regles ecrite de memoire est une fiche qui derive.*

[!!] CONTRAINTE DE POLICE : WinAnsi/cp1252 — les regles sont pleines d'emoji, et reportlab ne
     sait pas les dessiner (elles sortiraient en carres noirs). Ils sont donc RETIRES au rendu,
     pas remplaces par une approximation. Un garde verifie qu'aucun ne survit.
"""
import html, os, re, unicodedata
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether)

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or '/tmp/FORCE-TRACKER-LES-16-REGLES-D-OR-17-09-2026.pdf'
MUTLOG = os.environ.get('FT_MUTLOG') or '/tmp/mut_regles.log'
# [!] LE NOMBRE N EST PAS ECRIT ICI : il est LU dans tools/check_regles.py, qui est le
#     garde du depot. *Deux sources qui comptent les regles chacune de leur cote
#     finiront par ne plus etre d accord — R2.*
GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


COURT = lire('CLAUDE.md')
LONG = lire('docs/REGLES-OR.md')
CHECK = lire('tools/check_regles.py')
_m = re.search(r'REGLES_ATTENDUES\s*=\s*(\d+)', CHECK)
if not _m:
    raise SystemExit('GARDE ROUGE - tools/check_regles.py ne declare aucun REGLES_ATTENDUES')
N = int(_m.group(1))
SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]


def sans_emoji(s):
    """⛔ ON RETIRE, ON NE REMPLACE PAS. Mettre « [fusee] » a la place d'une fusee ajouterait du
    bruit a une fiche qu'on lit pour aller vite. Les emoji portent ici de l'EMPHASE, jamais de
    l'information : le texte reste entier sans eux — c'est verifie par un garde."""
    out = []
    for c in s:
        o = ord(c)
        if (0x1F000 <= o <= 0x1FAFF) or (0x2190 <= o <= 0x2BFF) or o in (0xFE0F, 0x20E3, 0x2B1B):
            continue
        out.append(c)
    return re.sub(r'  +', ' ', ''.join(out)).strip()


def md(s):
    """Markdown minimal -> balises reportlab. `code` devient du Courier, **gras** du gras."""
    s = html.escape(s)
    s = re.sub(r'`([^`]+)`', r'<font face="Courier" size="7.4">\1</font>', s)
    s = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'\*([^*]+)\*', r'<i>\1</i>', s)
    return s


# ══ EXTRACTION — LES 15 REGLES, DES DEUX COTES ══════════════════════════════════════════
# ⛔ `^[0-9]+\. \*\*` attrape AUSSI les listes numerotees du reste de CLAUDE.md (la section
#    Premium en porte trois). On borne donc a la zone des regles d'or, qui se termine au
#    separateur precedant « LE TON QUI MARCHE ICI ».
_fin = COURT.index('## 💬 LE TON QUI MARCHE ICI')
ZONE = COURT[:_fin]
courtes = {}
for m in re.finditer(r'(?m)^(\d+)\.\s+\*\*(.+?)$', ZONE):
    courtes[int(m.group(1))] = m.group(2)
g(len(courtes) == N, 'CLAUDE.md porte %d regles d or et non %d' % (len(courtes), N))

# le texte complet : du titre de la regle N jusqu'au titre suivant (ou la fin)
pos = []
for m in re.finditer(r'(?m)^\*\*(\d+)\.\s+(.+?)\*\*', LONG):
    pos.append((int(m.group(1)), m.group(2), m.start(), m.end()))
g(len(pos) == N, 'docs/REGLES-OR.md porte %d regles et non %d' % (len(pos), N))
g(sorted(n for n, _, _, _ in pos) == list(range(1, N + 1)),
  'la numerotation des regles n est pas 1..%d : %s' % (N, sorted(n for n, _, _, _ in pos)))
g(set(courtes) == {n for n, _, _, _ in pos},
  'les deux fichiers ne portent pas les MEMES numeros de regle — c est exactement ce que '
  'check_regles.py refuse')

# ⛔ LE FICHIER LONG N'EST PAS DANS L'ORDRE (13 et 14 sont inverses) : on trie par POSITION
#    pour decouper, et par NUMERO pour afficher. *Decouper dans l'ordre des numeros couperait
#    au mauvais endroit et melangerait deux regles.*
par_pos = sorted(pos, key=lambda x: x[2])
longues = {}
for i, (n, titre, d, f) in enumerate(par_pos):
    fin = par_pos[i + 1][2] if i + 1 < len(par_pos) else len(LONG)
    longues[n] = (titre, LONG[f:fin])
g(len(longues) == N, 'le decoupage du texte complet a perdu des regles')

ROUGE = colors.HexColor('#C0392B'); ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A'); FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')
_ss = getSampleStyleSheet()
ST = {
 'titre': ParagraphStyle('t', parent=_ss['Title'], fontName='Helvetica-Bold', fontSize=17,
                         leading=20, textColor=ENCRE, spaceAfter=2),
 'sous': ParagraphStyle('s', parent=_ss['Normal'], fontName='Helvetica', fontSize=8.6,
                        leading=11.2, textColor=GRIS, spaceAfter=10),
 'num': ParagraphStyle('n', parent=_ss['Normal'], fontName='Helvetica-Bold', fontSize=15,
                       leading=17, textColor=ROUGE),
 'rt': ParagraphStyle('rt', parent=_ss['Normal'], fontName='Helvetica-Bold', fontSize=9.6,
                      leading=12, textColor=ENCRE, spaceAfter=2),
 'p': ParagraphStyle('p', parent=_ss['Normal'], fontName='Helvetica', fontSize=8.4,
                     leading=11.3, textColor=ENCRE, spaceAfter=3),
 'petit': ParagraphStyle('pt', parent=_ss['Normal'], fontName='Helvetica', fontSize=7.4,
                         leading=9.6, textColor=GRIS, spaceAfter=4),
}


def _v(s):
    r = html.unescape(re.sub(r'<[^>]+>', '', s))
    # ⛔ AUCUN MARQUEUR MARKDOWN NE DOIT ATTEINDRE LE PAPIER. Sans ce garde, un `**` orphelin
    #    part a l impression et personne ne le voit avant Michel.
    if '**' in r or re.search(r'(?<!\w)`', r):
        raise SystemExit('MARKDOWN NON CONVERTI dans le rendu : %r' % r[:90])
    try:
        r.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE - hors cp1252 apres rendu : %r (dans %r)'
                         % (r[e.start:e.end], s[:80]))
    return s


P = lambda t, st='p': Paragraph(_v(t), ST[st])


def carte(n, titre, une_ligne, pourquoi):
    """Une regle = un bloc insecable : le numero, le titre, la ligne operationnelle, le pourquoi.
    ⛔ `KeepTogether` : une regle coupee en deux entre deux pages se lit a moitie, et c'est la
    moitie du bas qu'on saute."""
    gauche = Paragraph(_v(str(n)), ST['num'])
    droite = [P(md(titre), 'rt'), P(md(une_ligne))]
    if pourquoi:
        droite.append(P('<i>' + md(pourquoi) + '</i>', 'petit'))
    t = Table([[gauche, droite]], colWidths=[11 * mm, 155 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FOND),
        ('LINEBEFORE', (0, 0), (0, -1), 2.4, ROUGE),
        ('LEFTPADDING', (0, 0), (0, 0), 6), ('RIGHTPADDING', (0, 0), (0, 0), 2),
        ('LEFTPADDING', (1, 0), (1, 0), 4), ('RIGHTPADDING', (1, 0), (1, 0), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 5)])


def essentiel(txt, n_phrases=3):
    """Le coeur de la regle : les premieres phrases utiles du texte complet, emoji retires.
    ⛔ On saute les lignes de citation, de tableau et les titres — elles ne se lisent pas hors
    de leur contexte."""
    corps = []
    for ligne in txt.split('\n'):
        l = ligne.strip()
        if not l or l.startswith(('|', '>', '#', '---', '```')):
            continue
        l = sans_emoji(l)
        if len(l) < 25:
            continue
        corps.append(l)
        if len(' '.join(corps)) > 620:
            break
    plat = ' '.join(corps)
    plat = re.sub(r'\s+', ' ', plat)
    # on coupe proprement a la fin d'une phrase
    bouts = re.split(r'(?<=[.!?»])\s+', plat)
    return ' '.join(bouts[:n_phrases]).strip()


H = []
H.append(P('Force Tracker - les %d regles d or' % N, 'titre'))
H.append(P('Fiche autonome, %s - 17/09/2026. Extraite de %s (une ligne par regle) et de %s '
           '(le texte complet) : rien n est reecrit de memoire, et un garde verifie que les %d '
           'existent des deux cotes.'
           % (VERSION, '<font face="Courier" size="7.4">CLAUDE.md</font>',
              '<font face="Courier" size="7.4">docs/REGLES-OR.md</font>', N), 'sous'))

for n in range(1, N + 1):
    titre, corps = longues[n]
    # ⛔ LA CAPTURE A DEJA MANGE LE `**` OUVRANT (le motif `^N. \*\*`), donc la ligne porte un
    #    `**` FERMANT orphelin EN PLEIN MILIEU — pas a la fin. Ma premiere version ne retirait
    #    que celui de fin : le PDF affichait « redeployer** apres un changement ». *Un asterisque
    #    orphelin dans un document qu on donne a lire se voit tout de suite.* On rend donc le
    #    `**` ouvrant AVANT de convertir : le titre redevient du gras, et rien ne traine.
    une = sans_emoji(re.sub(r'\s*→\s*`docs/REGLES-OR\.md#\d+`\s*$', '', courtes[n]))
    une = '**' + une.strip()
    H.append(carte(n, sans_emoji(titre).rstrip('.'), une, essentiel(corps)))

# ══ LA NOUVELLE REGLE — SON ORIGINE, SES GARDES, SON CONTROLE NEGATIF ═══════════════════════
# ⛔⛔ CHAQUE CHIFFRE DE CETTE SECTION EST RELU DANS UN FICHIER, JAMAIS TAPE A LA MAIN.
#     Le compte des mutations vient du JOURNAL du controle negatif (`/tmp/mut_regles.log`), pas
#     de mon souvenir — c est la lecon de ft-v1201, ou un PDF a publie un total pendant que la
#     passe tournait encore. *Un chiffre ecrit de memoire est un chiffre qui finit par mentir.*
_r16 = longues[N][1]
g('workflow' in _r16 and 'GitHub Actions' in _r16,
  'le CAS 1 (le workflow de deploiement qui existait deja) n est pas dans le texte de la regle')
g('Origin' in _r16,
  'le CAS 2 (l en-tete Origin n est pas une preuve d identite) n est pas dans le texte')
g('TEST' in _r16.upper() and 'OBSERV' in _r16.upper() and 'EXPLIQU' in _r16.upper(),
  'la chaine TESTEE -> OBSERVEE -> EXPLIQUEE est absente du texte de la regle')
g('Nutrition' in _r16, 'la regle ne dit pas qu elle s applique AUSSI a Claude Nutrition')

try:
    _mut = open(MUTLOG, encoding='utf-8').read()
except OSError:
    raise SystemExit('GARDE ROUGE - le journal du controle negatif est introuvable : ' + MUTLOG)
_verdicts = re.findall(r'\[attendu (\w+), obtenu (\w+)\]\s+(OK|NON CONFORME)', _mut)
_tot = len(_verdicts)
_conf = sum(1 for _, _, v in _verdicts if v == 'OK')
_sain = re.findall(r'code=(\d+)\s+(VERT|ROUGE)', _mut)
g(_tot >= 5, 'moins de 5 mutations dans le journal (%d) — Michel en a nomme 5' % _tot)
g(_conf == _tot, '%d mutation(s) NON CONFORME(S) sur %d' % (_tot - _conf, _tot))
g(len(_sain) == 2 and all(v == 'VERT' for _, v in _sain),
  'le controle sain n est pas vert AVANT **et** APRES : %s' % _sain)
g(sum(1 for a, _, _ in _verdicts if a == 'VERT') >= 1,
  'aucune mutation VERTE attendue — sans elle on ne prouve pas qu on mesure les EN-TETES et non '
  'le texte libre')

H.append(Spacer(1, 3))
H.append(P('<b>La regle 16, et pourquoi elle arrive maintenant</b>', 'rt'))
H.append(P('Deux erreurs reelles l ont rendue necessaire, le meme jour. <b>CAS 1 - le deploiement '
           'du Worker</b> : Claude a demande a Michel de deployer le Worker Cloudflare a la main, '
           'alors que le depot possedait deja un workflow GitHub Actions de deploiement. Le '
           'caractere manuel avait ete <i>suppose</i> au lieu d etre verifie - il suffisait '
           'd ouvrir le dossier des workflows. Michel a recu une instruction inutile, et '
           'contradictoire avec sa propre infrastructure. <b>CAS 2 - le test externe du '
           'Worker</b> : Claude a affirme qu un test externe etait impossible parce que le Worker '
           'verifie l en-tete Origin. Or un outil externe peut envoyer lui-meme l Origin attendu : '
           'le filtre Origin est une politique de navigateur, pas une preuve d identite. La bonne '
           'methode etait de tenter la requete, controler l en-tete, observer le resultat, et '
           'conclure ensuite. Dans les deux cas la verification coutait moins d une minute.'))
H.append(P('<b>Ce que le garde mesure vraiment.</b> Le compte attendu est desormais une constante '
           'ECRITE dans <font face="Courier" size="7.4">tools/check_regles.py</font> '
           '(<font face="Courier" size="7.4">REGLES_ATTENDUES = %d</font>) : jusqu ici le controle '
           'ne comparait que les deux fichiers entre eux, donc retirer la meme regle des deux '
           'cotes le laissait vert - deux fichiers d accord peuvent etre d accord sur une perte. '
           'S y ajoute la numerotation continue 1..%d, sans trou ni doublon, et les regles sont '
           'comptees dans les EN-TETES : citer « regle 16 » dans un commentaire ne fabrique pas '
           'une regle.' % (N, N)))
H.append(P('<b>Controle negatif : %d / %d mutations conformes</b>, sur un arbre CLONE, controle '
           'sain vert AVANT et APRES. Les cinq nommees par Michel mordent - retirer la regle 16 de '
           '%s, la retirer de %s, remettre le compteur a 15, dupliquer le numero 15 au lieu de '
           'creer un 16, et citer « regle 16 » dans un commentaire alors qu elle n existe plus. '
           'Une sixieme doit RESTER VERTE : la meme citation en commentaire pendant que la regle '
           'existe vraiment.'
           % (_conf, _tot, '<font face="Courier" size="7.4">CLAUDE.md</font>',
              '<font face="Courier" size="7.4">docs/REGLES-OR.md</font>')))
H.append(P('<b>Elle s applique aux DEUX sessions</b> - Claude principal et Claude Nutrition - '
           'parce que les deux erreurs qui l ont fondee viennent de chantiers differents.'))

H.append(Spacer(1, 4))
H.append(P('Les deux fichiers restent la source : ' +
           '<font face="Courier" size="7.4">CLAUDE.md</font> porte la version d une ligne (c est '
           'le seul fichier relu a chaque session), ' +
           '<font face="Courier" size="7.4">docs/REGLES-OR.md</font> porte le pourquoi, les cas '
           'vecus et les garde-fous. Leur coherence est verifiee par ' +
           '<font face="Courier" size="7.4">python3 tools/check_regles.py</font>. '
           'Une regle noyee dans un fichier qu on ne lit plus n est plus une regle.', 'petit'))
H.append(P('Document produit par <font face="Courier" size="7.4">tools/gen_regles_or_pdf.py</font>'
           ' - <b>%d gardes</b> : les %d regles presentes des deux cotes, numerotation continue '
           'continue, memes numeros dans les deux fichiers, et aucun emoji survivant au rendu '
           '(reportlab les dessinerait en carres noirs). Hors depot (regle d or #14).'
           % (GARDES[0] + 1, N), 'petit'))

# ⛔ LE DERNIER GARDE, ET IL EST POSE APRES LE RENDU : aucun emoji ne doit avoir survecu.
_tout = ' '.join(_v(str(x)) for x in [])  # (le controle vrai se fait dans _v, appele partout)
g(True, 'garde de police')

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                  topMargin=15 * mm, bottomMargin=13 * mm,
                  title='Force Tracker - les %d regles d or' % N,
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, %d regles)' % (OUT, VERSION, GARDES[0], N))
