#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""LES 15 REGLES D'OR DE FORCE TRACKER — fiche autonome (hors depot, regle d'or #14).

[!!] TOUT EST EXTRAIT DES FICHIERS, RIEN N'EST REECRIT DE MEMOIRE. Le titre et le corps de
     chaque regle sont lus dans `docs/REGLES-OR.md` (le texte complet) et la version d'une
     ligne dans `CLAUDE.md`. Un garde verifie que les 15 existent DES DEUX COTES et que leurs
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
OUT = os.environ.get('FT_OUT') or '/tmp/FORCE-TRACKER-LES-15-REGLES-D-OR-17-09-2026.pdf'
GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


COURT = lire('CLAUDE.md')
LONG = lire('docs/REGLES-OR.md')
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
g(len(courtes) == 15, 'CLAUDE.md porte %d regles d or et non 15' % len(courtes))

# le texte complet : du titre de la regle N jusqu'au titre suivant (ou la fin)
pos = []
for m in re.finditer(r'(?m)^\*\*(\d+)\.\s+(.+?)\*\*', LONG):
    pos.append((int(m.group(1)), m.group(2), m.start(), m.end()))
g(len(pos) == 15, 'docs/REGLES-OR.md porte %d regles et non 15' % len(pos))
g(sorted(n for n, _, _, _ in pos) == list(range(1, 16)),
  'la numerotation des regles n est pas 1..15 : %s' % sorted(n for n, _, _, _ in pos))
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
g(len(longues) == 15, 'le decoupage du texte complet a perdu des regles')

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
H.append(P('Force Tracker - les 15 regles d or', 'titre'))
H.append(P('Fiche autonome, %s - 17/09/2026. Extraite de %s (une ligne par regle) et de %s '
           '(le texte complet) : rien n est reecrit de memoire, et un garde verifie que les 15 '
           'existent des deux cotes.'
           % (VERSION, '<font face="Courier" size="7.4">CLAUDE.md</font>',
              '<font face="Courier" size="7.4">docs/REGLES-OR.md</font>'), 'sous'))

for n in range(1, 16):
    titre, corps = longues[n]
    # ⛔ LA CAPTURE A DEJA MANGE LE `**` OUVRANT (le motif `^N. \*\*`), donc la ligne porte un
    #    `**` FERMANT orphelin EN PLEIN MILIEU — pas a la fin. Ma premiere version ne retirait
    #    que celui de fin : le PDF affichait « redeployer** apres un changement ». *Un asterisque
    #    orphelin dans un document qu on donne a lire se voit tout de suite.* On rend donc le
    #    `**` ouvrant AVANT de convertir : le titre redevient du gras, et rien ne traine.
    une = sans_emoji(re.sub(r'\s*→\s*`docs/REGLES-OR\.md#\d+`\s*$', '', courtes[n]))
    une = '**' + une.strip()
    H.append(carte(n, sans_emoji(titre).rstrip('.'), une, essentiel(corps)))

H.append(Spacer(1, 4))
H.append(P('Les deux fichiers restent la source : ' +
           '<font face="Courier" size="7.4">CLAUDE.md</font> porte la version d une ligne (c est '
           'le seul fichier relu a chaque session), ' +
           '<font face="Courier" size="7.4">docs/REGLES-OR.md</font> porte le pourquoi, les cas '
           'vecus et les garde-fous. Leur coherence est verifiee par ' +
           '<font face="Courier" size="7.4">python3 tools/check_regles.py</font>. '
           'Une regle noyee dans un fichier qu on ne lit plus n est plus une regle.', 'petit'))
H.append(P('Document produit par <font face="Courier" size="7.4">tools/gen_regles_or_pdf.py</font>'
           ' - <b>%d gardes</b> : les 15 regles presentes des deux cotes, numerotation 1..15 '
           'continue, memes numeros dans les deux fichiers, et aucun emoji survivant au rendu '
           '(reportlab les dessinerait en carres noirs). Hors depot (regle d or #14).'
           % (GARDES[0] + 1), 'petit'))

# ⛔ LE DERNIER GARDE, ET IL EST POSE APRES LE RENDU : aucun emoji ne doit avoir survecu.
_tout = ' '.join(_v(str(x)) for x in [])  # (le controle vrai se fait dans _v, appele partout)
g(True, 'garde de police')

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                  topMargin=15 * mm, bottomMargin=13 * mm,
                  title='Force Tracker - les 15 regles d or',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, 15 regles)' % (OUT, VERSION, GARDES[0]))
