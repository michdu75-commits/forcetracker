#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PHASE 3.1 — LA PASSE ETAIT DEJA FAITE, SUR UNE BRANCHE NON FUSIONNEE (19/09/2026).

[!!] TOUS LES FAITS DE CE DOSSIER SONT DES FAITS DE DEPOT, ET ILS SE RECOMPTENT DANS GIT —
     jamais de memoire. Le generateur interroge `master` et la branche de l'autre session,
     relit le registre central depuis CETTE branche, et recompte les 21 capacites et leurs
     politiques une par une.

[!!] ⭐⭐ GARDE A L'ENVERS : si la fusion a lieu entre-temps, ce dossier devient FAUX — il
     decrirait une collision resolue. Le generateur REFUSE alors de produire. *Un dossier qui
     decrit un etat depasse fait chercher un probleme qui n'existe plus* (R30).

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
    SCRATCH, 'PHASE-3-1-ARBITRAGES-IA-DEJA-RENDUS-19-09-2026.pdf')
BR = 'origin/claude/project-status-a0qakd'

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def git(*a):
    r = subprocess.run(['git'] + list(a), cwd=ROOT, capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


# ══ 1. L'ETAT DE `master` ══════════════════════════════════════════════════════════════
c, SW = git('show', 'master:sw.js')
g(c == 0, 'impossible de lire sw.js sur master')
V_MASTER = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, ''])[1]
g(re.match(r'^ft-v\d+$', V_MASTER), 'la version de master est illisible')

c, _ = git('cat-file', '-e', 'master:capacites-ia.js')
g(c != 0,
  'capacites-ia.js EXISTE desormais sur master : la fusion a eu lieu, ce dossier est PERIME')

c, SHA_M = git('rev-parse', '--short', 'master')
g(c == 0, 'sha de master illisible')

# ══ 2. L'ETAT DE LA BRANCHE DE L'AUTRE SESSION ════════════════════════════════════════
c, o = git('rev-parse', '--verify', BR)
g(c == 0, 'la branche de l autre session est introuvable : le dossier ne tient plus')
c, SW_B = git('show', BR + ':sw.js')
V_BR = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW_B) or [None, ''])[1]
g(re.match(r'^ft-v\d+$', V_BR), 'la version de la branche est illisible')
g(V_BR != V_MASTER, 'les deux versions coincident : il n y aurait plus d ecart a decrire')

c, LOG = git('log', '--format=%ci|%h|%s', 'master..' + BR)
g(c == 0 and LOG, 'aucun commit non fusionne : la collision n existe plus')
COMMITS = [l.split('|', 2) for l in LOG.splitlines()]
N_COMMITS = len(COMMITS)
_p31 = [x for x in COMMITS if 'phase 3.1' in x[2].lower()]
g(_p31, 'le commit de phase 3.1 est introuvable sur la branche : le dossier ment')
DATE_31, SHA_31, SUJET_31 = _p31[0]

c, STAT = git('show', '--stat', '--format=', SHA_31)
FICHIERS_31 = [l.split('|')[0].strip() for l in STAT.splitlines() if '|' in l]
for _f in ('app.js', 'state.js', 'capacites-ia.js'):
    g(_f in FICHIERS_31,
      'le commit de phase 3.1 ne touche plus « %s » : la separation du pot n est plus '
      'appliquee' % _f)

# ══ 3. LE REGISTRE, RELU SUR LEUR BRANCHE ET RECOMPTE ═════════════════════════════════
c, REG = git('show', BR + ':capacites-ia.js')
g(c == 0 and REG, 'le registre est illisible sur la branche')
IDS = re.findall(r"id:\s*'([^']+)'", REG)
N_CAP = len(IDS)
g(N_CAP == 21, 'le registre porte %d capacites et non 21' % N_CAP)
g(len(set(IDS)) == N_CAP, 'le registre contient des identifiants en double')

POL = {}
for m in re.finditer(r"id:\s*'([^']+)'[\s\S]{0,600}?politique:\s*'([A-Z_]+)'", REG):
    POL[m.group(1)] = m.group(2)
ATTENDU = {
    'milo.debrief': 'PREMIUM', 'milo.memory': 'PREMIUM',
    'nutrition.mealPlan.ai': 'FREEMIUM', 'nutrition.mealPlanImport.ai': 'PREMIUM',
    'nutrition.barcode.aiFallback': 'PREMIUM', 'nutrition.label.ai': 'FREEMIUM',
    'nutrition.mealEstimate.ai': 'FREEMIUM', 'nutrition.mealPlan.regen': 'FREEMIUM',
    'milo.memory.backfill': 'PREMIUM',
}
for k, v in ATTENDU.items():
    g(POL.get(k) == v,
      'la capacite « %s » vaut %s et non %s : le dossier annoncerait un faux accord'
      % (k, POL.get(k), v))
N_ND = len([1 for v in POL.values() if v == 'NON_DECIDEE'])
g(N_ND == 0, '%d politique(s) restent NON_DECIDEE' % N_ND)


def quota(idc):
    i = REG.find("id: '" + idc + "'")
    j = REG.find("id: '", i + 10)
    b = REG[i:(j if j > 0 else len(REG))]
    t = (re.search(r"quotaType:\s*'([^']+)'", b) or [None, '?'])[1]
    v = (re.search(r'quotaValeur:\s*([^,\n]+)', b) or [None, '?'])[1].strip()
    return t, v
Q = {k: quota(k) for k in ('nutrition.label.ai', 'nutrition.mealEstimate.ai',
                           'nutrition.barcode.aiFallback', 'nutrition.mealPlan.ai',
                           'nutrition.mealPlan.regen')}
g(Q['nutrition.label.ai'] == ('usage_total', '25'), 'le quota de label n est plus 25 total')
g(Q['nutrition.mealEstimate.ai'] == ('usage_total', '25'),
  'le quota de mealEstimate n est plus 25 total')
g(Q['nutrition.barcode.aiFallback'][1] == '0', 'le fallback code-barres a retrouve un quota')
g(Q['nutrition.mealPlan.ai'][0] == 'non_decide',
  'un quota a ete invente pour mealPlan.ai, ce que Michel a explicitement refuse')

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
H.append(P('Phase 3.1 - les arbitrages IA etaient deja rendus', 'titre'))
H.append(P('Force Tracker - 19 septembre 2026 - hors depot (regle d or #14) - '
           '<b>lecture seule ; aucune ecriture ; aucun commit ; master intact</b>', 'sous'))

H.append(P('1-2. Base de depart, et l ecart avec l enonce', 'h1'))
H.append(tableau(
    ['ce que l enonce annonce', 'ce que le depot mesure'],
    [['« Phase 3 terminee et <b>publiee : ft-v1224</b> »',
      '<b>master est a ' + V_MASTER + '</b> (sha <font face="Courier">' + SHA_M + '</font>). '
      '<font face="Courier">ft-v1224</font> n apparait que comme <i>« prochaine »</i> dans '
      '<font face="Courier">CLAUDE.md</font>'],
     ['« Source de verite centrale : <font face="Courier">capacites-ia.js</font> »',
      '<b>ABSENT de master.</b> Il vit sur <font face="Courier">' + BR.split('/', 1)[1]
      + '</font>, branche <b>non fusionnee</b>'],
     ['« Claude Nutrition travaille en parallele »',
      '<b>exact</b> - ' + str(N_COMMITS) + ' commits non fusionnes, le dernier du '
      + COMMITS[0][0][:16] + ', et sa branche est deja a <b>' + V_BR + '</b>']],
    [62 * mm, 104 * mm]))
H.append(encadre(
    'C EST R18, MOT POUR MOT - ET CE PROJET L A DEJA PAYEE',
    'Le titre de <b>ft-v1220</b> est litteralement <i>« PUSH SUR UNE BRANCHE N EST PAS UNE '
    'VERSION EN LIGNE »</i>. Le travail <b>existe</b> et il est <b>bon</b> : il n est '
    'simplement <b>pas fusionne</b>. &gt;&gt; <i>Un travail fini qui n est pas servi n est pas '
    'un travail fini.</i>'))

H.append(P('3. La passe demandee a ete livree il y a environ une heure', 'h1'))
H.append(P('Commit <font face="Courier">' + SHA_31 + '</font>, <b>' + DATE_31[:16] + '</b> : '
           '<i>« ' + SUJET_31 + ' »</i>. C est <b>exactement</b> cette passe. Et la separation '
           'du pot n y est pas seulement declaree, elle est <b>appliquee</b> : le commit touche '
           '<font face="Courier">' + '</font>, <font face="Courier">'.join(
               [f for f in FICHIERS_31 if f.endswith('.js')][:6]) + '</font>.', 'p'))

H.append(P('4-7. Le registre de leur branche, recompte ligne a ligne', 'h1'))
H.append(tableau(
    ['capacite', 'leur registre', 'la decision de Michel'],
    [['<font face="Courier">milo.debrief</font>', '<b>PREMIUM</b>', 'PREMIUM'],
     ['<font face="Courier">milo.memory</font>', '<b>PREMIUM</b>', 'PREMIUM (M12, deja actee)'],
     ['<font face="Courier">nutrition.mealPlan.ai</font>', '<b>FREEMIUM</b>', 'FREEMIUM'],
     ['<font face="Courier">nutrition.mealPlanImport.ai</font>', '<b>PREMIUM</b>', 'PREMIUM'],
     ['<font face="Courier">nutrition.barcode.aiFallback</font>',
      '<b>PREMIUM</b>, quota <font face="Courier">'
      + Q['nutrition.barcode.aiFallback'][0] + '</font> / <b>0</b>', 'PREMIUM, 0'],
     ['<font face="Courier">nutrition.label.ai</font>',
      'FREEMIUM, <font face="Courier">usage_total</font> / <b>25</b>', '25 TOTAL'],
     ['<font face="Courier">nutrition.mealEstimate.ai</font>',
      'FREEMIUM, <font face="Courier">usage_total</font> / <b>25</b>', '25 TOTAL'],
     ['<font face="Courier">nutrition.mealPlan.regen</font>',
      'FREEMIUM, <b>1 / jour</b>', 'inchange'],
     ['<font face="Courier">milo.memory.backfill</font>', '<b>PREMIUM</b>', 'PREMIUM']],
    [52 * mm, 62 * mm, 52 * mm]))
H.append(encadre(
    'L ETAT ATTENDU DU PARAGRAPHE 12 EST ATTEINT : ' + str(N_CAP)
    + ' CAPACITES, 0 POLITIQUE NON DECIDEE',
    'Les ' + str(N_CAP) + ' identifiants sont <b>distincts</b>, aucun n a ete perdu, aucun n a '
    'ete ajoute. Et <b>' + str(N_ND) + '</b> politique produit reste '
    '<font face="Courier">NON_DECIDEE</font>. <i>Tout ce que cette passe devait produire '
    'existe deja.</i>', VERT))
H.append(P('<b>Le seul point qui pourrait ressembler a un ecart n en est pas un</b> : '
           '<font face="Courier">nutrition.mealPlan.ai</font> porte '
           '<font face="Courier">quotaType: \'' + Q['nutrition.mealPlan.ai'][0]
           + '\'</font>. C est <b>conforme</b> - Michel a explicitement refuse de fixer un '
           'nombre de generations gratuites, et son paragraphe 12 pose justement la '
           'distinction : <b>un quota non mesure n est pas une politique non decidee</b>.',
           'p'))
H.append(P('<i>Borne honnete : je n ai PAS verifie que le perimetre jour/semaine est porte '
           'quelque part - mes motifs ne l ont pas trouve, mais leur modele peut l exprimer '
           'autrement. Je ne conclus pas sans avoir lu leur fichier en entier, ce que je n ai '
           'pas fait pour ne pas transformer cette passe en audit.</i>', 'petit'))

H.append(P('8-12. Ce que cette passe a fait, et ce qu elle n a PAS fait', 'h1'))
H.append(encadre(
    'QUATRE LECTURES, ZERO ECRITURE - ET C EST LE RESULTAT, PAS UN RENONCEMENT',
    'La regle de cohabitation etait le bon premier geste, et elle a tout tranche. <b>Aucun '
    'fichier modifie, aucun commit, master intact a ' + V_MASTER + '.</b> '
    '&gt;&gt; <i>Ne jamais invalider 25 minutes de tests de l autre session pour gagner 5 '
    'minutes</i> - ici c aurait ete pire : j aurais reecrit a l identique un travail deja '
    'livre, sur les memes fichiers, pendant qu ils tournent. <b>La separation du pot Nutrition '
    'est donc « deja appliquee ailleurs », pas « differee ».</b>'))

H.append(P('Ce qui reste a faire, et ce n est pas un arbitrage', 'h1'))
H.append(P('<b>Fusionner leur branche dans <font face="Courier">master</font>.</b> C est le '
           'seul geste manquant - et c est celui que ce projet oublie regulierement. '
           '<b>(1)</b> Ils fusionnent et publient eux-memes : ils ont le contexte, leurs tests '
           'et leur numero pret. <b>(2)</b> Je le fais d ici : fusion, resolution des conflits '
           '<b>probables</b> sur <font face="Courier">sw.js</font>, '
           '<font face="Courier">CLAUDE.md</font> et '
           '<font face="Courier">docs/CONTEXTE-ACTUEL.md</font> - les fichiers que nos deux '
           'sessions touchent - puis <b>UNE</b> passe complete sur l arbre fusionne, puis '
           'publication.', 'p'))
H.append(P('⚠️ <b>L option 2 n est raisonnable que si leur session est terminee.</b> Son '
           'dernier commit date d environ une heure : <b>je ne peux pas savoir d ici si elle '
           'travaille encore</b>. Fusionner sous elle rouvrirait exactement la collision qu on '
           'vient d eviter. <b>La decision appartient a Michel.</b>'.replace('⚠️ ', ''), 'p'))
H.append(P('<b>Aucun des interdits du paragraphe 20 n a ete approche</b> : pas d autorisation '
           'serveur centrale, pas de fermeture des portes Apps Script, aucun changement Worker, '
           'pas de backfill Milo, aucun verrou Premium, rien sur V2, rien sur la Douane, rien '
           'sur le miroir multi-appareils.', 'petit'))

_bt = ' '.join(TEXTES).lower()
for _mot, _msg in [('la fusion a eu lieu', 'elle n a pas eu lieu'),
                   ('j ai fusionne', 'aucune fusion n a ete faite')]:
    g(_mot not in _bt, _msg)
for _mot, _pourquoi in (('pas fusionne', 'le fait central'),
                        ('quatre lectures, zero ecriture', 'ce que la passe a fait'),
                        ('n est pas une version en ligne', 'la regle deja payee'),
                        ('deja livre', 'la collision evitee'),
                        ('borne honnete', 'ce que je n ai pas verifie')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                  topMargin=15 * mm, bottomMargin=13 * mm,
                  title='Phase 3.1 - arbitrages IA deja rendus',
                  author='Force Tracker').build(H)
print('OK %s  (%d gardes ; master %s vs branche %s ; %d capacites ; %d NON_DECIDEE ; '
      '%d commits non fusionnes)'
      % (OUT, GARDES[0], V_MASTER, V_BR, N_CAP, N_ND, N_COMMITS))
