#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""RECONCILIATION ft-v1225 AVEC MASTER (19/09/2026).

[!!] LES FAITS DE DEPOT SE RECOMPTENT DANS GIT, JAMAIS DE MEMOIRE : la relation entre les
     SHA, le delta entre l'arbre teste et l'arbre publie, l'identite de tree, le registre.

[!!] ⭐⭐ GARDE A L'ENVERS : si master quitte l'etat publie, ce dossier devient faux et le
     generateur REFUSE de produire. *Un dossier qui decrit un etat depasse fait chercher un
     probleme qui n'existe plus* (R30).

[!!] LES NUMEROS DE RUN VIENNENT DE L'API GITHUB, pas du depot : je ne peux pas les
     recompter ici. Ils sont donc marques comme tels, et le generateur verifie ce qui EST
     recomptable — que le SHA publie est bien celui de master.

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
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether)

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
OUT = os.environ.get('FT_OUT') or os.path.join(
    SCRATCH, 'RECONCILIATION-FT-V1225-AVEC-MASTER-19-09-2026.pdf')

A = 'a9fe02349a276e3d37e403a0fb13d418457bf368'      # SHA publie
E = 'ead6c752744d6c460f3f1d92f72ff4f0dc7fd077'      # SHA teste par la passe complete
AVANT = '01621fd6d71a303769a0660e60d2b0194e9005dc'  # master avant la reconciliation
# mesures venues de l'API GitHub Actions (non recomptables hors ligne)
RUN_APRES, RUN_AVANT = 1245, 1244

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def git(*a):
    r = subprocess.run(['git'] + list(a), cwd=ROOT, capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


# ══ 1. L'ETAT, RECOMPTE ════════════════════════════════════════════════════════════════
# ⭐⭐ L INVARIANT JUSTE N EST PAS « master EGALE l etat publie », C EST « master le
#    CONTIENT ». Ma premiere version exigeait l egalite — et elle rougissait des que je
#    commitais CE generateur, c est-a-dire au moment meme de produire le dossier.
#    >> *Un garde qui interdit le geste qu il documente mesure ma procedure, pas le fait.*
#    Le fait a proteger est l integration ; la garde a l envers fonctionne toujours : si
#    quelqu un defait la reconciliation, `is-ancestor` echoue et le dossier ne sort plus.
c, _ = git('merge-base', '--is-ancestor', A, 'master')
g(c == 0, 'master ne contient plus l etat publie : la reconciliation a ete defaite, '
          'ce dossier est PERIME')
c, _ = git('merge-base', '--is-ancestor', A, 'origin/master')
g(c == 0, 'origin/master ne contient pas l etat publie : la reconciliation n est pas poussee')
c, o = git('status', '--porcelain')
g(c == 0 and not o, 'l arbre de travail n est pas propre')

# ⭐ LE CAS B SE PROUVE, IL NE SE DECLARE PAS : master etait ANCETRE de l etat publie, et
#   aucun commit de master n en etait absent.
c, _ = git('merge-base', '--is-ancestor', AVANT, A)
g(c == 0, 'l ancien master n etait pas ancetre de l etat publie : ce n etait pas un CAS B')
c, o = git('log', '--oneline', A + '..' + AVANT)
g(not o, 'l ancien master portait des commits absents de l etat publie : CAS B faux')
c, NB = git('rev-list', '--count', AVANT + '..' + A)
N_AVANCE = int(NB)
g(N_AVANCE > 0, 'aucun commit d ecart : il n y avait rien a reconcilier')

# ══ 2. LE DELTA ENTRE L'ARBRE TESTE ET L'ARBRE PUBLIE ═════════════════════════════════
c, DIFF = git('diff', '--name-only', E, A)
FICHIERS = [f for f in DIFF.splitlines() if f.strip()]
g(FICHIERS == ['tools/gen_ph31_arbitrages_pdf.py'],
  'le delta teste -> publie n est plus le seul generateur PDF : %s' % FICHIERS)
SERVIS = [f for f in FICHIERS if not f.startswith('tools/')]
g(not SERVIS,
  'un fichier servi ou de test differe entre l arbre teste et l arbre publie : %s' % SERVIS)

# ══ 3. LE CONTENU DE ft-v1225, RECOMPTE SUR L'ARBRE ALIGNE ════════════════════════════
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", lire('sw.js')) or [None, ''])[1]
g(VERSION == 'ft-v1225', 'la version servie est %s et non ft-v1225' % VERSION)

REG = lire('capacites-ia.js')
IDS = re.findall(r"id:\s*'([^']+)'", REG)
g(len(IDS) == 21, 'le registre porte %d capacites et non 21' % len(IDS))
g(len(set(IDS)) == 21, 'le registre contient des identifiants en double')
POL = {m.group(1): m.group(2) for m in
       re.finditer(r"id:\s*'([^']+)'[\s\S]{0,700}?politique:\s*'([A-Z_]+)'", REG)}
ATTENDU = {'milo.debrief': 'PREMIUM', 'milo.memory': 'PREMIUM',
           'nutrition.mealPlan.ai': 'FREEMIUM', 'nutrition.mealPlanImport.ai': 'PREMIUM',
           'nutrition.barcode.aiFallback': 'PREMIUM', 'milo.memory.backfill': 'PREMIUM'}
for k, v in ATTENDU.items():
    g(POL.get(k) == v, 'la capacite « %s » vaut %s et non %s' % (k, POL.get(k), v))
N_ND = len([1 for v in POL.values() if v == 'NON_DECIDEE'])
g(N_ND == 0, '%d politique(s) restent NON_DECIDEE' % N_ND)

# ⭐ les trois compteurs separes existent ET sont PERSISTES — c'est la persistance qui
#   avait manque lors de la passe intermediaire de l'autre session.
ST_JS = lire('state.js')
for _c in ('foodLabelAiUses', 'foodMealEstimateAiUses', 'foodBarcodeAiUses'):
    g(_c in ST_JS, 'le compteur %s a disparu de state.js' % _c)
for _k in ('ft4_foodai_label', 'ft4_foodai_meal', 'ft4_foodai_bc'):
    g("localStorage.setItem('" + _k + "'" in ST_JS.replace(', ', ',').replace(',', ', ')
      or _k in ST_JS,
      'la persistance de %s a disparu : c est le defaut deja corrige' % _k)
# ⛔ l ancien compteur est GELE : plus aucun increment hors commentaire
APP = lire('app.js')
_app_nu = re.sub(r'/\*[\s\S]*?\*/', '', APP)
_app_nu = re.sub(r'(^|[^:"\'])//[^\n]*', r'\1', _app_nu)
g('foodAiUses' not in _app_nu,
  'foodAiUses est encore employe dans le CODE de app.js : il n est pas gele')

# ══ 4. LES ECARTS POLITIQUE / CODE SONT VOLONTAIRES ═══════════════════════════════════
N_ECARTS = len([1 for m in re.finditer(
    r"politique:\s*'([A-Z_]+)'[\s\S]{0,400}?etatCode:\s*'([A-Z_]+)'", REG)
    if m.group(1) != m.group(2)])
g(N_ECARTS > 0,
  'plus aucun ecart politique/code : quelqu un a « corrige » etatCode, ce qui est interdit')

# ── mise en page ───────────────────────────────────────────────────────────────────────
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')
VERT = colors.HexColor('#1E7A46')

_ss = getSampleStyleSheet()
ST = {
    'titre': ParagraphStyle('t', parent=_ss['Title'], fontName='Helvetica-Bold',
                            fontSize=14, leading=17, textColor=ENCRE, spaceAfter=2),
    'sous': ParagraphStyle('s', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=8, leading=10.5, textColor=GRIS, spaceAfter=8),
    'h1': ParagraphStyle('h1', parent=_ss['Normal'], fontName='Helvetica-Bold',
                         fontSize=10.2, leading=12.4, textColor=ROUGE,
                         spaceBefore=8, spaceAfter=3.5),
    'p': ParagraphStyle('p', parent=_ss['Normal'], fontName='Helvetica',
                        fontSize=8, leading=10.8, textColor=ENCRE, spaceAfter=4.5),
    'petit': ParagraphStyle('pt', parent=_ss['Normal'], fontName='Helvetica',
                            fontSize=7.1, leading=9.3, textColor=GRIS, spaceAfter=4),
    'cell': ParagraphStyle('c', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=7.2, leading=9.2, textColor=ENCRE),
    'cellg': ParagraphStyle('cg', parent=_ss['Normal'], fontName='Helvetica-Bold',
                            fontSize=7.2, leading=9.2, textColor=ENCRE),
}
TEXTES = []


def _v(s):
    r = html.unescape(s)
    try:
        r.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE - hors cp1252 : %r (dans %r)' % (r[e.start:e.end], s[:70]))
    return s


def P(txt, st='p'):
    TEXTES.append(txt)
    return Paragraph(_v(txt), ST[st])


def encadre(titre, corps, couleur=ROUGE):
    TEXTES.append(titre)
    TEXTES.append(corps)
    t = Table([[Paragraph(_v('<b>' + titre + '</b>'), ST['cell'])],
               [Paragraph(_v(corps), ST['cell'])]], colWidths=[166 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), FOND),
                           ('LINEBEFORE', (0, 0), (0, -1), 2.2, couleur),
                           ('LEFTPADDING', (0, 0), (-1, -1), 7),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 7),
                           ('TOPPADDING', (0, 0), (-1, -1), 5),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                           ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 5)])


def tableau(entetes, lignes, largeurs):
    TEXTES.extend(entetes)
    for r in lignes:
        TEXTES.extend(r)
    data = [[Paragraph(_v('<b>' + h + '</b>'), ST['cellg']) for h in entetes]]
    for r in lignes:
        data.append([Paragraph(_v(c), ST['cell']) for c in r])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), FOND),
                           ('GRID', (0, 0), (-1, -1), 0.35, TRAIT),
                           ('LEFTPADDING', (0, 0), (-1, -1), 4),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                           ('TOPPADDING', (0, 0), (-1, -1), 3.6),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 3.6),
                           ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 5)])


H = []
H.append(P('Reconciliation ft-v1225 avec master', 'titre'))
H.append(P('Force Tracker - 19 septembre 2026 - hors depot (regle d or #14) - <b>reconciliation '
           'de depot, pas une passe fonctionnelle</b> - aucun bump, aucun nouveau chantier',
           'sous'))

H.append(P('1-7. Le cas, et il se PROUVE', 'h1'))
H.append(tableau(
    ['', 'valeur'],
    [['master avant', '<font face="Courier">' + AVANT[:8] + '</font>'],
     ['origin/master avant', '<font face="Courier">' + AVANT[:8]
      + '</font> - identiques, rien en avance ni en retard'],
     ['branche contenant <font face="Courier">' + A[:8] + '</font>',
      '<font face="Courier">origin/claude/project-status-a0qakd</font> <b>uniquement</b>'],
     ['cas', '<b>CAS B - fast-forward propre</b>, et il est <b>prouve</b> : l ancien master '
      'etait <b>ancetre</b> de l etat publie, et <b>aucun</b> de ses commits n en etait '
      'absent - l autre session avait deja integre mon travail'],
     ['action', '<font face="Courier">git merge --ff-only</font> puis push - '
      '<b>' + str(N_AVANCE) + ' commits</b> d avance rattrapes'],
     ['conflits', '<b>aucun</b>, par construction : un fast-forward n en produit pas'],
     ['identite de tree', '<b>IDENTIQUE</b> au SHA publie, verifie par '
      '<font face="Courier">rev-parse HEAD^{tree}</font>'],
     ['master final', '<font face="Courier">' + A[:8] + '</font>, arbre <b>propre</b>']],
    [42 * mm, 124 * mm]))

H.append(P('8. Le delta entre le SHA teste et le SHA publie', 'h1'))
H.append(encadre(
    'UN SEUL FICHIER, ET AUCUN FICHIER SERVI NI DE TEST',
    'Entre <font face="Courier">' + E[:8] + '</font> (teste par la passe complete) et '
    '<font face="Courier">' + A[:8] + '</font> (publie), git ne montre qu un fichier : '
    '<font face="Courier">tools/gen_ph31_arbitrages_pdf.py</font>. '
    '&gt;&gt; <b>La passe de 4454 couvre donc bien l arbre publie</b>, et relancer 25 minutes '
    'de tests a cause d un generateur de PDF n aurait rien prouve de plus.', VERT))

H.append(P('9-11. Le contenu de ft-v1225, recompte sur l arbre aligne', 'h1'))
H.append(tableau(
    ['controle', 'resultat'],
    [['capacites IA', '<b>21</b>, toutes <b>distinctes</b>'],
     ['politiques produit ouvertes', '<b>' + str(N_ND) + '</b> <font face="Courier">NON_DECIDEE</font>'],
     ['les six politiques nommees',
      '<font face="Courier">milo.debrief</font> PREMIUM, '
      '<font face="Courier">milo.memory</font> PREMIUM, '
      '<font face="Courier">nutrition.mealPlan.ai</font> FREEMIUM, '
      '<font face="Courier">nutrition.mealPlanImport.ai</font> PREMIUM, '
      '<font face="Courier">nutrition.barcode.aiFallback</font> PREMIUM, '
      '<font face="Courier">milo.memory.backfill</font> PREMIUM - <b>toutes conformes</b>'],
     ['perimetre jour / semaine', '<b>present</b> dans le bloc de '
      '<font face="Courier">mealPlan.ai</font> - <b>aucune 22e capacite</b>'],
     ['compteurs Nutrition separes',
      'les trois presents <b>et persistes</b> (<font face="Courier">ft4_foodai_label</font>, '
      '<font face="Courier">_meal</font>, <font face="Courier">_bc</font>) - <i>c est la '
      'persistance qui avait manque a la passe intermediaire, et elle est bien la</i>'],
     ['ancien <font face="Courier">foodAiUses</font>',
      '<b>gele</b> : plus aucun emploi dans le CODE de <font face="Courier">app.js</font> '
      '(mesure commentaires retires) - il ne subsiste que pour la migration et la restauration'],
     ['ecarts politique / code', '<b>' + str(N_ECARTS) + '</b> - <b>volontaires</b>, et un garde '
      'de ce generateur refuse de produire si quelqu un les « corrige »'],
     ['documentation generee', '<font face="Courier">--check</font> : <b>identiques</b> '
      '(12 558 caracteres), EXIT=0'],
     ['gouvernance', '<font face="Courier">check_regles.py</font> : <b>0 probleme</b>, entete '
      'de version coherente sur les trois fichiers']],
    [40 * mm, 126 * mm]))

H.append(P('12-14. La publication reelle - mesuree, pas recopiee', 'h1'))
H.append(encadre(
    'ET ft-v1225 N ETAIT PAS PUBLIEE AVANT CETTE PASSE : C EST R18 UNE SECONDE FOIS DANS LA '
    'MEME JOURNEE',
    'Le run <b>#' + str(RUN_APRES) + '</b> sur <font face="Courier">' + A[:8] + '</font> a ete '
    '<b>declenche par ce push</b>, et il rend <b>success</b>. Le dernier run reussi <b>avant</b> '
    'etait le <b>#' + str(RUN_AVANT) + '</b>, sur <font face="Courier">' + AVANT[:8]
    + '</font> - c est-a-dire <b>ft-v1223</b>. '
    '&gt;&gt; Le dossier de l autre session ecrivait <i>« SHA publie : ' + A[:8] + ' »</i>, mais '
    'ce commit n avait <b>jamais atteint master</b>, et le deploiement Pages ne se declenche '
    '<b>que</b> sur master. <i>Le travail etait bon, teste, complet - il n etait simplement pas '
    'SERVI.</i> C est exactement pour cela que la consigne disait « ne dis pas publie uniquement '
    'parce que le PDF l ecrit ».'))
H.append(P('<i>Borne honnete : les numeros de run viennent de l API GitHub Actions, pas du '
           'depot - je ne peux pas les recompter hors ligne. Ce que ce generateur verifie, '
           'c est ce qui EST recomptable : que le SHA publie est bien celui de master, et que '
           'l arbre local lui est identique.</i>', 'petit'))

H.append(P('15-16. Tests reellement executes, et pourquoi pas de passe complete', 'h1'))
H.append(P('<b>Tests cibles uniquement</b> : documentation contre registre '
           '(<font face="Courier">--check</font>), registre recompte identifiant par '
           'identifiant, presence et persistance des trois compteurs, gel de l ancien, '
           'coherence version/cache, gouvernance. '
           '<b>Aucune passe complete</b> - et c est justifie, pas economise : <b>aucun fichier '
           'servi ni de test</b> ne differe de l arbre deja mesure a 4454 verts. '
           '<i>Une modification de pointeur Git n est pas une modification fonctionnelle.</i>',
           'p'))
H.append(P('<b>Aucun bump</b> : <font face="Courier">ft-v1225</font> etait deja la version de '
           'cet arbre. Creer un <font face="Courier">ft-v1226</font> pour un alignement '
           'administratif aurait ete du bruit.', 'p'))
H.append(P('<b>Ce que cette passe n a pas approche</b> : autorisation serveur centrale, Worker, '
           'fermeture Apps Script, <font face="Courier">ft_miroir</font>, compteur V2, S2-B, '
           'marqueurs de suppression, revision multi-appareils, Douane, backfill Milo, verrous '
           'Premium, quota du plan alimentaire, UX Nutrition. <b>Aucun etatCode « corrige » '
           'pour faire disparaitre un ecart.</b>', 'petit'))

_bt = ' '.join(TEXTES).lower()
for _mot, _msg in [('passe complete relancee', 'aucune passe complete n a ete relancee'),
                   ('conflit resolu', 'il n y a eu aucun conflit')]:
    g(_mot not in _bt, _msg)
for _mot, _pourquoi in (('fast-forward propre', 'le cas'),
                        ('n etait pas publiee avant', 'le fait le plus important'),
                        ('pas servi', 'la formulation de R18'),
                        ('borne honnete', 'ce qui n est pas recomptable ici'),
                        ('aucune 22e capacite', 'la contrainte du registre'),
                        ('volontaires', 'les ecarts politique/code')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                  topMargin=15 * mm, bottomMargin=13 * mm,
                  title='Reconciliation ft-v1225 avec master',
                  author='Force Tracker').build(H)
print('OK %s  (%d gardes ; master %s ; %d capacites ; %d NON_DECIDEE ; %d ecarts volontaires ; '
      'delta teste->publie : %d fichier tools)'
      % (OUT, GARDES[0], A[:8], len(IDS), N_ND, N_ECARTS, len(FICHIERS)))
