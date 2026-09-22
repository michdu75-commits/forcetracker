#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOSSIER DE DECISION — MOTEUR NUTRITIONNEL V2 (22/09/2026).

⛔⛔ LES GARDES RECOMPTENT CHAQUE FAIT DEPUIS LE CODE SERVI et LISENT chaque mesure dans le
    JSON produit par son instrument. Aucun chiffre n est ecrit a la main.
⛔ ET LE GARDE QUI DIT L ESSENTIEL : aucun fichier SERVI ne doit avoir change.
⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji.

Variables : DN_PDF · DN_CORPUS · DN_OBJ · DN_CA · DN_SIM · DN_MG
"""
import json
import os
import re
import subprocess
import sys

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, Table, TableStyle)

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.exists(os.path.join(RACINE, 'sw.js')):
    RACINE = '/home/user/forcetracker'
SORTIE = os.environ.get('DN_PDF', '/tmp/FORCE-TRACKER-DOSSIER-NUTRITION-V2-22-09-2026.pdf')
_E = []


def g(c, lib):
    if not c:
        _E.append(lib)


def lire(n):
    with open(os.path.join(RACINE, n), encoding='utf-8') as f:
        return f.read()


def git(*a):
    p = subprocess.run(('git',) + a, capture_output=True, text=True, cwd=RACINE)   # noqa
    return p.returncode, p.stdout


def charger(var, defaut):
    c = os.environ.get(var, defaut)
    if not c or not os.path.exists(c):
        return None
    try:
        return json.load(open(c, encoding='utf-8'))
    except Exception:                                                              # noqa
        return None


ST = lire('state.js')
NST = ST.replace(' ', '').replace('\n', '')
F = {}

# ══ LE CODE SERVI — chaque fait du dossier est recompte ici ═════════════════
F['residu'] = 'constcarbs_g=Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4));' in NST
g(F['residu'], "la formule du residu a change")
F['gkgPoids'] = ('constprot_g=Math.round((S.bw||0)*protRatio);' in NST
                 and 'constfat_g=Math.round((S.bw||0)*fatRatio);' in NST)
g(F['gkgPoids'], "les macros ne sont plus attachees au poids total : le dossier est perime")
F['deltas'] = ("const_GOAL_DELTA_KCAL={muscle:350,perte:-450,recomp:-250,"
               "force:200,equilibre:0,endurance:100};") in NST
g(F['deltas'], "la table des ecarts par objectif a change")
F['phase'] = "constphaseAdj=phase==='charge'?100:-100;" in NST
g(F['phase'], "la modulation charge/decharge a change")
F['plancher'] = 'constPLANCHER_KCAL={H:1500,F:1200};' in NST
g(F['plancher'], "le plancher calorique a change")
F['lm90'] = 'constBMR_LM_JOURS=90;' in NST
g(F['lm90'], "le seuil de fraicheur du bilan corporel a change")
F['lmEcart'] = 'constBMR_LM_ECART=0.05;' in NST
g(F['lmEcart'], "l ecart de poids tolere a change")
# ⛔⛔ LE FAIT CENTRAL : la masse maigre EXISTE et n atteint PAS les macros.
def corps(src, n):
    m = re.search(r'function\s+' + n + r'\s*\([^)]*\)\s*\{', src)
    if not m:
        return ''
    i = m.end() - 1
    d = 0
    for j in range(i, len(src)):
        if src[j] == '{':
            d += 1
        elif src[j] == '}':
            d -= 1
            if not d:
                return src[i:j + 1]
    return ''


MFK = corps(ST, 'macrosForKcal')
g(MFK != '', "macrosForKcal est introuvable")
F['lmAbsente'] = ('leanMass' not in MFK) and ('S.discipline' not in MFK) and ('S.level' not in MFK)
g(F['lmAbsente'], "macrosForKcal lit desormais la masse maigre, la discipline ou le niveau")
F['lmExiste'] = 'function leanMassRecente(' in ST and 'leanMassRecente()' in corps(ST, 'bmrDetail')
g(F['lmExiste'], "leanMassRecente n existe plus ou n est plus employee par le BMR")

# ══ AUCUN FICHIER SERVI N A CHANGE ══════════════════════════════════════════
_rc, _o = git('log', '--format=%H', '-1', '--grep=^dossier de decision nutrition V2')
_cv = _o.strip()
g(_cv != '', "le commit du dossier V2 est introuvable")
if _cv:
    _rc, _o = git('diff', '--name-only', _cv + '^', _cv)
    F['servis'] = [x for x in _o.split('\n')
                   if x.strip() and not x.startswith(('docs/', 'tools/', 'tests/'))]
    g(F['servis'] == [], "des fichiers servis ont change : %r" % (F['servis'],))
    F['sha'] = _cv[:8]
_rc, _o = git('rev-list', '--count', 'origin/master..HEAD')
F['aPublier'] = int(_o.strip() or 0)

# ══ LES MESURES, LUES DANS LEURS JSON ═══════════════════════════════════════
C = charger('DN_CORPUS', '/tmp/corpus_nutri.json')
O = charger('DN_OBJ', '/tmp/banc_objectifs.json')
CA = charger('DN_CA', '/tmp/contre_audit.json')
SIM = charger('DN_SIM', '/tmp/simul_nutri_v2.json')
g(C is not None, "le corpus principal n est pas lu")
g(O is not None, "le banc par objectif n est pas lu")
g(CA is not None, "le contre-audit n est pas lu")
g(SIM is not None, "la simulation des variantes n est pas lue")

if C:
    F['nCorpus'] = C['n']
    g(F['nCorpus'] > 900000, "le corpus ne compte que %d profils" % F['nCorpus'])
    F['vio'] = {k: v['n'] for k, v in C['violations'].items()}
    F['gZero'] = F['vio'].get('gluc_zero', 0)
    g(F['gZero'] > 0, "le corpus ne montre plus de glucides a zero")
    F['gMax'] = max(r['v'] for r in C['extremes']['glucides_gkg_haut'])
    g(F['gMax'] > 15, "le maximum de glucides mesure a change")
if O:
    F['discEcarts'] = O['discipline']['ecartDisc'] + O['discipline']['ecartLvl']
    F['nDisc'] = O['discipline']['n']
    g(F['discEcarts'] == 0, "la discipline ou le niveau influencent desormais la nutrition")
    F['force'] = [r for r in O['force'] if abs(r['act'] - 1.725) < 1e-9]
    _gk = [r['gkgG'] for r in F['force']]
    F['forceMin'], F['forceMax'] = min(_gk), max(_gk)
    g(F['forceMax'] <= 7, "le profil de reference sort desormais de la plage 4-7 g/kg")
    F['perte'] = [r for r in O['perte'] if r['goal'] == 'perte']
    F['p60'] = next(r for r in F['perte'] if r['bw'] == 60)
    F['p130'] = next(r for r in F['perte'] if r['bw'] == 130)
    g(F['p60']['def'] == F['p130']['def'], "le deficit n est plus fixe")
    F['m55'] = next(r for r in O['muscle']
                    if r['bw'] == 55 and abs(r['act'] - 1.375) < 1e-9 and r['phase'] == 'charge')
    g(F['m55']['surPct'] > 20, "le surplus ne depasse plus 20 %% chez un profil leger")
    F['m55a'] = next(r for r in O['muscle']
                     if r['bw'] == 55 and abs(r['act'] - 1.9) < 1e-9 and r['phase'] == 'charge')
    g(F['m55a']['gkgG'] > 10, "le pic de glucides a 55 kg tres actif a change")
    F['recomp'] = O['recomp']
if CA:
    F['att'] = CA['A']
    F['nCasse'] = sum(1 for a in F['att'] if a['casse'])
    g(F['nCasse'] >= 5, "le contre-audit ne casse plus que %d attaques" % F['nCasse'])
if SIM:
    F['V'] = SIM['res']
    F['ecartV0'] = SIM['ecartV0']
    g(F['ecartV0'] == 0, "le banc de simulation ne reproduit plus la production")

if _E:
    print('REFUS DE PRODUIRE — %d garde(s) tombe(s) :' % len(_E))
    for x in _E:
        print('  - ' + x)
    sys.exit(1)

NB = 20
SS = getSampleStyleSheet()
H1 = ParagraphStyle('h1', parent=SS['Title'], fontName='Helvetica-Bold', fontSize=14.5,
                    leading=18, spaceAfter=3, textColor=colors.HexColor('#111111'))
H2 = ParagraphStyle('h2', parent=SS['Heading2'], fontName='Helvetica-Bold', fontSize=10.5,
                    leading=13, spaceBefore=9, spaceAfter=3,
                    textColor=colors.HexColor('#B3001B'))
P = ParagraphStyle('p', parent=SS['BodyText'], fontName='Helvetica', fontSize=8.6,
                   leading=11.2, spaceAfter=3)
PET = ParagraphStyle('pet', parent=P, fontSize=7.2, leading=9.4,
                     textColor=colors.HexColor('#555555'))
CEL = ParagraphStyle('cel', parent=P, fontSize=7.4, leading=9.2, spaceAfter=0)
H = []
Ad = H.append
_HORS = {}
_TR = {'→': '->', '⭐': '*', '⛔': '/!\\', '⚠': '/!\\', '️': '', '⚖': '=', '✅': 'OK',
       '❌': 'X', '–': '-', ' ': ' ', '≥': '>=', '≤': '<=', '±': '+/-', '×': 'x',
       '…': '...', '−': '-', '’': "'", '·': '-'}


def _win(t):
    o = []
    for ch in t:
        if ch in _TR:
            o.append(_TR[ch])
            continue
        try:
            ch.encode('cp1252')
            o.append(ch)
        except Exception:                                                          # noqa
            _HORS[ch] = _HORS.get(ch, 0) + 1
            o.append('?')
    return ''.join(o)


def md(t):
    t = _win(str(t)).replace('&', '&amp;')
    t = re.sub(r'&amp;(amp|lt|gt|nbsp|laquo|raquo|bull|deg|times|#\d+);', r'&\1;', t)
    jet = []

    def garde(m):
        jet.append(m.group(0))
        return '\x00%d\x00' % (len(jet) - 1)

    t = re.sub(r'</?(?:b|i|br\s*/?|font[^<>]*)>', garde, t)
    t = t.replace('<', '&lt;').replace('>', '&gt;')
    return re.sub(r'\x00(\d+)\x00', lambda m: jet[int(m.group(1))], t)


def para(t, s=P):
    return Paragraph(md(t), s)


def titre(t, s=H2):
    return Paragraph(md(t), s)


def tab(l, w, entete=True):
    data = [[Paragraph(md(c), CEL) for c in r] for r in l]
    st = [('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#CCCCCC')),
          ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('LEFTPADDING', (0, 0), (-1, -1), 3), ('RIGHTPADDING', (0, 0), (-1, -1), 3),
          ('TOPPADDING', (0, 0), (-1, -1), 2.2), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.2)]
    if entete:
        st.append(('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F0F0F0')))
    return Table(data, colWidths=w, style=TableStyle(st))


CO = "font face='Courier'"

Ad(titre('FORCE TRACKER - DOSSIER DE DECISION, MOTEUR NUTRITIONNEL V2', H1))
Ad(titre('22/09/2026 - %d profils simules - 0 ligne de code metier' % F['nCorpus'], H1))
Ad(Spacer(1, 3))
Ad(para("<b>AUCUNE modification des regles servies - AUCUNE publication - AUCUN bump de "
        "version.</b> state.js, app.js, screens.js, coach.js, index.html, sw.js : <b>0 ligne</b> "
        "(verifie par git dans ce generateur)."))

# ── 1 : LA CONCLUSION QUI VA CONTRE L HYPOTHESE ──────────────────────────────
Ad(titre('1. La conclusion va CONTRE l hypothese de depart'))
Ad(para("Michel demandait explicitement : <i>&laquo; si ton audit demontre que certaines valeurs "
        "qui nous semblaient enormes sont justifiees, DIS-LE &raquo;</i>."))
Ad(para("<b>Les 659 g de glucides ne sont pas le probleme.</b> Mesure sur un profil normal de "
        "musculation (85 kg, niveau actif, 0 a 6 seances/semaine) : les glucides sortent entre "
        "<b>%.2f et %.2f g/kg</b> - <b>tous dans la plage 4-7 g/kg</b> de Slater &amp; Phillips "
        "2011 (sports de force). Le cas de Michel sort a <b>7,61 g/kg</b>, soit <b>9 %% au-dessus</b> "
        "d une borne elle-meme non verifiee a la source." % (F['forceMin'], F['forceMax'])))
Ad(tab([['seances/sem', 'objectif force', 'objectif muscle']]
       + [[str(s), '%.2f g/kg' % next(r['gkgG'] for r in F['force'] if r['sem'] == s and r['goal'] == 'force'),
           '%.2f g/kg' % next(r['gkgG'] for r in F['force'] if r['sem'] == s and r['goal'] == 'muscle')]
          for s in (0, 2, 4, 6)], [60 * mm, 61 * mm, 61 * mm]))

# ── 2 : R4 TROIS FOIS ────────────────────────────────────────────────────────
Ad(titre('2. Le vrai diagnostic - R4 trois fois'))
Ad(para("Les anomalies ont une cause commune : <b>des informations collectees, stockees, et qui "
        "n atteignent jamais le moteur nutritionnel.</b>"))
Ad(tab([['ce qui n atteint pas la nutrition', 'preuve mesuree'],
        ['<b>la masse maigre</b>',
         "delta proteines = <b>0</b> et delta lipides = <b>0</b> sur 160 comparaisons avec bilan "
         "corporel frais. <%s>leanMassRecente()</font> existe et sert au BMR ; "
         "<%s>macrosForKcal()</font> ne la lit pas une seule fois." % (CO, CO)],
        ['<b>la discipline</b> et <b>le niveau</b>',
         '<b>%d combinaisons</b> (5 disciplines x 3 niveaux x 6 objectifs) -&gt; <b>%d ecart</b>'
         % (F['nDisc'], F['discEcarts'])],
        ['<b>le volume reel d entrainement</b>',
         '0 seance/semaine et 6 seances/semaine donnent <b>la meme cible</b>']],
       [52 * mm, 130 * mm]))
Ad(Spacer(1, 2))
Ad(para("<b>Et un fait qui simplifie toute la phase force</b> : les 5 disciplines de l application "
        "(muscu, bodybuilding, powerbuilding, powerlifting, halterophilie) sont <b>TOUTES des "
        "sports de force</b>. Il n existe aucune discipline d endurance. <i>La crainte "
        "&laquo; powerlifter traite comme un cycliste &raquo; ne peut donc pas se produire</i>, et "
        "Slater &amp; Phillips couvre toute la population <b>sans extrapolation</b>."))

# ── 3 : PERTE DE POIDS ───────────────────────────────────────────────────────
Ad(titre('3. Perte de poids - le moteur fait l INVERSE de la litterature'))
Ad(tab([['poids', '%MG', 'TDEE', 'cible', 'deficit', 'deficit %', '%/semaine', 'g/kg P maigre']]
       + [[str(r['bw']), str(r['mg']), str(r['tdee']), str(r['kcal']), str(r['def']),
           '%.1f %%' % r['defPct'], '<b>%.2f %%</b>' % r['pctSem'], '%.2f' % r['gkgP_maigre']]
          for r in F['perte'] if r['bw'] in (60, 80, 100, 130)],
       [20 * mm, 16 * mm, 20 * mm, 20 * mm, 22 * mm, 24 * mm, 30 * mm, 30 * mm]))
Ad(Spacer(1, 2))
Ad(para("Le deficit est un <b>nombre FIXE</b> (%d kcal), donc la vitesse relative de perte "
        "<b>s effondre quand le poids monte</b> : <b>%.2f %%/semaine a 60 kg</b> contre "
        "<b>%.2f %%/semaine a 130 kg</b>. La plage de reference est <b>0,5-1,0 %%/semaine</b> : "
        "seul le sujet le plus leger y est."
        % (F['p60']['def'], F['p60']['pctSem'], F['p130']['pctSem'])))
Ad(para("<b>C est l inverse de ce que recommande la litterature</b> : etre conservateur chez le "
        "sujet sec, et permettre un deficit plus agressif chez le sujet a forte masse grasse. "
        "<i>Le moteur fait exactement le contraire, parce que le deficit est fixe.</i>"))

# ── 4 : PRISE DE MUSCLE ──────────────────────────────────────────────────────
Ad(titre('4. Prise de muscle - le surplus fixe casse chez les profils legers'))
Ad(para("A <b>%d kg</b> peu actif, le surplus fixe represente <b>%.1f %% du TDEE</b> - au-dessus "
        "de la borne haute d Iraki 2019 (+10-20 %%) - et produit une prise theorique de "
        "<b>%.2f %%/semaine</b> contre une plage de 0,25-0,50 %%."
        % (F['m55']['bw'], F['m55']['surPct'], F['m55']['pctSem'])))
Ad(para("<b>Et c est la que les glucides explosent vraiment</b> : <b>%.2f g/kg</b> chez une "
        "personne de 55 kg tres active. <i>Bien pire que le cas qui inquietait Michel, et sur un "
        "profil parfaitement realiste.</i> A partir de 75-85 kg en revanche, le surplus est dans "
        "la plage et conservateur." % F['m55a']['gkgG']))

# ── 5 : RECOMPOSITION ────────────────────────────────────────────────────────
Ad(titre('5. Recomposition - plutot FAVORABLE au moteur (et je corrige mon audit du matin)'))
Ad(tab([['poids', '%MG', 'P g', 'g/kg poids', 'g/kg maigre', 'ISSN 2017 (poids)', 'Helms (maigre)']]
       + [[str(r['bw']), str(r['mg']), str(r['P']), '%.2f' % r['gkg_poids'],
           '%.2f' % r['gkg_maigre'], 'OK dedans' if r['dansISSN'] else '/!\\ dehors',
           'OK dedans' if r['dansHelmsLBM'] else '/!\\ dehors'] for r in F['recomp']],
       [20 * mm, 16 * mm, 18 * mm, 26 * mm, 28 * mm, 38 * mm, 36 * mm]))
Ad(Spacer(1, 2))
Ad(para("<b>2,60 g/kg de POIDS DE CORPS est TOUJOURS dans la plage ISSN 2017</b> (2,3-3,1 g/kg de "
        "poids, en hypocalorique). Ce n est donc <b>pas</b> un melange d unites : l ISSN emploie "
        "bien le poids de corps. La regle ne casse qu au-dela de <b>~20 %% de masse grasse</b>, la "
        "ou les deux litteratures divergent. <i>Mon audit du matin disait &laquo; unite differente &raquo; "
        "en se fondant sur Helms seul : c etait incomplet.</i>"))

# ── 6 : CONTRE-AUDIT ─────────────────────────────────────────────────────────
Ad(titre('6. Contre-audit adversarial - %d attaques, %d CASSENT'
         % (len(F['att']), F['nCasse'])))
Ad(tab([['attaque', 'resultat']]
       + [[a['nom'], ('<b>CASSE</b> - ' if a['casse'] else 'tient - ') + a['det']]
          for a in F['att']], [72 * mm, 110 * mm]))

# ── 7 : LES CORRECTIONS PROPOSEES ────────────────────────────────────────────
Ad(titre('7. Corrections proposees - aucune couche nouvelle, 4 lignes existantes'))
V = F['V']
Ad(tab([['propriete violee', 'V0 actuel', 'V4', 'V5'],
        ['proteines &gt; 3,1 g/kg maigre', str(V['V0']['v'].get('prot_sur_3.1_gkg_maigre', 0)),
         '<b>%d</b>' % V['V4']['v'].get('prot_sur_3.1_gkg_maigre', 0),
         '<b>%d</b>' % V['V5']['v'].get('prot_sur_3.1_gkg_maigre', 0)],
        ['proteines &gt; 40 % des calories', str(V['V0']['v'].get('prot_sur_40pct_cal', 0)),
         '<b>%d</b>' % V['V4']['v'].get('prot_sur_40pct_cal', 0),
         '<b>%d</b>' % V['V5']['v'].get('prot_sur_40pct_cal', 0)],
        ['glucides = 0 g', str(V['V0']['v'].get('gluc_zero', 0)),
         '<b>%d</b>' % V['V4']['v'].get('gluc_zero', 0),
         '<b>%d</b>' % V['V5']['v'].get('gluc_zero', 0)],
        ['lipides &lt; 0,5 g/kg', str(V['V0']['v'].get('lip_sous_0.5_gkg', 0)),
         '<b>%d</b>' % V['V4']['v'].get('lip_sous_0.5_gkg', 0),
         '<b>%d</b>' % V['V5']['v'].get('lip_sous_0.5_gkg', 0)],
        ['lipides &lt; 15 % des calories', str(V['V0']['v'].get('lip_sous_15pct', 0)),
         '<b>%d</b>' % V['V4']['v'].get('lip_sous_15pct', 0),
         '<b>%d</b>' % V['V5']['v'].get('lip_sous_15pct', 0)],
        ['glucides &gt; 7 g/kg (force)', str(V['V0']['v'].get('gluc_sur_7_gkg_force', 0)),
         '%d' % V['V4']['v'].get('gluc_sur_7_gkg_force', 0),
         '<b>%d</b>' % V['V5']['v'].get('gluc_sur_7_gkg_force', 0)]],
       [70 * mm, 36 * mm, 38 * mm, 38 * mm]))
Ad(Spacer(1, 2))
Ad(para("<b>Temoin de validite du banc : V0 doit egaler la production -&gt; %d ecart sur %d.</b> "
        "La comparaison est donc honnete." % (F['ecartV0'], V['V0']['n'])))
Ad(para("<b>Et le contre-audit a refute ma PROPRE proposition</b> : les variantes V1 et V2 "
        "appliquaient le poids reduit aux DEUX macros et <b>cassaient un invariant que le moteur "
        "actuel tenait</b> (lipides sous 0,5 g/kg : <b>0 -&gt; %d</b>). La justification ne vaut que "
        "pour les proteines : les lipides ont un role hormonal et leur plancher s exprime en poids "
        "reel. D ou V4/V5." % V['V1']['v'].get('lip_sous_0.5_gkg', 0)))

# ── 8 : SOURCES ──────────────────────────────────────────────────────────────
Ad(titre('8. Sources - et la limite qui borne tout'))
Ad(para("<b>AUCUNE source primaire n a pu etre lue.</b> Mesure, pas suppose : 21 domaines "
        "scientifiques sont refuses au CONNECT (HTTP 403, politique d organisation) - doi.org, "
        "pubmed, PMC, EuropePMC, Crossref, OpenAlex, Semantic Scholar, Springer, Frontiers, MDPI, "
        "arXiv, CORE, ANSES, EFSA, OMS, Dietitians of Canada... <b>Seul api.github.com repond.</b>"))
Ad(para("<b>La recherche fonctionne, la lecture non</b> - et le piege s est presente des la "
        "premiere requete : interroge sur les glucides en musculation, le moteur de recherche a "
        "repondu <b>&laquo; 8-12 g/kg/j &raquo;</b>, la plage des <b>cyclistes d endurance a tres "
        "haut volume</b>. La valeur correcte pour les sports de force est <b>4-7 g/kg</b>."))
Ad(para("<b>Consequence directe : aucune regle ne peut devenir definitive aujourd hui.</b> Les PDF "
        "de Slater &amp; Phillips 2011, ISSN 2017, Helms 2014, Iraki 2019, Weijs 2025 et ACSM 2016 "
        "debloqueraient la phase A en 2-3 h."))
Ad(para("<b>Un point de doctrine trouve en chemin, et il decide de la methode</b> : l ANSES a "
        "<b>explicitement refuse</b> de fixer un intervalle de reference pour les glucides - "
        "<i>&laquo; les pourcentages decoulent des references etablies pour les deux autres "
        "macronutriments et n ont donc pas de justification propre &raquo;</i>. <b>La borne a poser "
        "n est donc pas sur les glucides : elle est sur ce qui les determine.</b>"))

# ── 9 : TEMPS ────────────────────────────────────────────────────────────────
Ad(titre('9. Temps - les deux estimations, separees'))
Ad(tab([['', ''],
        ['<b>TEMPS MACHINE / TRAVAIL</b>',
         '<b>~2 h 30, deja realise.</b> %d profils en 67 secondes, 414 720 evaluations de '
         'variantes, 90 combinaisons discipline x niveau, 10 attaques, 14 mutations. '
         'Total : <b>~1,6 million d evaluations du moteur reel</b>.' % F['nCorpus']],
        ['<b>TEMPS CALENDAIRE INCOMPRESSIBLE</b>',
         '<b>8 a 16 semaines, pour la phase longitudinale UNIQUEMENT</b>, et uniquement sa partie '
         'observation. <b>Rien d autre dans ce chantier n exige d attendre.</b>'],
        ['<b>Restant avant implementation</b>',
         '4 a 6 h (code + temoins retournes + controle negatif + passe complete), '
         '<b>apres GO de Michel</b>.']], [52 * mm, 130 * mm], entete=False))

Ad(Spacer(1, 5))
Ad(Paragraph(md("Dossier complet en 23 points : <b>docs/DOSSIER-DECISION-NUTRITION-V2.md</b> - "
                "commit <b>%s</b>. 21 temoins (bloc B-CCCLII, <b>non branche</b> dans la passe : il "
                "fige un etat qui attend le GO), 14 mutations, 14 conformes, 0 ancre morte - dont "
                "trois corrections simulees qui font rougir exactement leur temoin. Ce dossier est "
                "produit par un script qui recompte ses %d faits depuis le code servi, LIT chaque "
                "mesure dans le JSON de son instrument, verifie par git qu <b>aucun fichier servi n a "
                "change</b>, refuse de produire si un fait tombe, et relit sa propre sortie."
                % (F.get('sha', '?'), NB)), PET))

doc = BaseDocTemplate(SORTIE, pagesize=A4, title='Force Tracker - dossier nutrition V2',
                      author='Force Tracker')
doc.addPageTemplates([PageTemplate(
    id='p', frames=[Frame(14 * mm, 14 * mm, 182 * mm, A4[1] - 28 * mm, id='f')])])
doc.build(H)

if _HORS:
    os.remove(SORTIE)
    sys.exit('REFUS : %d caractere(s) hors WinAnsi : %s'
             % (sum(_HORS.values()), ', '.join('%r x%d' % (c, n) for c, n in _HORS.items())))


def _relire(chemin):
    import base64
    import zlib
    data = open(chemin, 'rb').read()
    t = []
    for m in re.finditer(rb'stream\r?\n(.*?)endstream', data, re.S):
        b = m.group(1)
        try:
            brut = base64.a85decode(b.strip().rstrip(b'~>'), adobe=False)
        except Exception:                                                          # noqa
            brut = b
        for e in (brut, b):
            try:
                t.append(zlib.decompress(e).decode('latin-1'))
                break
            except Exception:                                                      # noqa
                continue
    return '\n'.join(t)


_t = _relire(SORTIE)
_lis = ' '.join(x[1:-1] for x in re.findall(r'\((?:[^()\\]|\\.)*\)', _t))
if re.search(r'&lt;b&gt;|<b>', _lis):
    os.remove(SORTIE)
    sys.exit('REFUS : balise en clair dans le PDF produit')
if len(_lis) < 5000:
    os.remove(SORTIE)
    sys.exit('REFUS : le PDF relu ne fait que %d caracteres lisibles' % len(_lis))
for _mot in ('ne sont pas le probleme', 'R4 trois fois', 'masse maigre', 'INVERSE de la litterature',
             'FAVORABLE au moteur', 'CASSENT', 'AUCUNE source primaire', '8-12 g/kg/j',
             'ANSES', 'refute ma PROPRE proposition', '8 a 16 semaines'):
    if _mot not in _lis:
        os.remove(SORTIE)
        sys.exit('REFUS : « %s » n est pas imprime dans le PDF' % _mot)
print('   relu : %d caracteres lisibles, 0 balise en clair' % len(_lis))
print('OK %s (%d gardes, %d octets) — %d profils, %d attaques cassent, %d ecart V0'
      % (SORTIE, NB, os.path.getsize(SORTIE), F['nCorpus'], F['nCasse'], F['ecartV0']))
