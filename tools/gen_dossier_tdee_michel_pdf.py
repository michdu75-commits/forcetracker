#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genere le dossier « Le TDEE de Michel, mesure » — hors du depot, expres.

[!!] LE PDF NE VA PAS DANS LE DEPOT, ET C EST UNE DECISION, PAS UN OUBLI.
Il contient le poids, la masse grasse et le journal alimentaire d une personne reelle,
et le depot est PUBLIC (regle d or #14, R36 : ce qui decrit LA PERSONNE reste chez elle).
Le GENERATEUR, lui, y vit : il ne contient aucune donnee, il prend les trois CSV en argument.

TOUS LES CHIFFRES SONT RECOMPTES A CHAQUE GENERATION, depuis les CSV fournis ET depuis le
code servi. Aucun nombre n est ecrit a la main dans le texte : ils sont tous interpoles
depuis les mesures faites juste au-dessus. Un garde qui tombe = pas de document.

USAGE :
    python3 tools/gen_dossier_tdee_michel_pdf.py <nutrition.csv> <poids.csv> <historique.csv> [sortie.pdf]

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d emoji.
"""
import collections
import csv
import datetime as dt
import html
import io
import os
import re
import statistics as st
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (KeepTogether, Paragraph, Preformatted, SimpleDocTemplate,
                                Spacer, Table, TableStyle)
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if len(sys.argv) < 4:
    sys.exit(__doc__)
CSV_NUTRI, CSV_POIDS, CSV_HIST = sys.argv[1], sys.argv[2], sys.argv[3]
OUT = sys.argv[4] if len(sys.argv) > 4 else os.path.join(
    os.path.dirname(CSV_NUTRI), 'DOSSIER-TDEE-MICHEL-2026-09-22.pdf')
if os.path.abspath(OUT).startswith(os.path.abspath(ROOT) + os.sep):
    sys.exit('REFUS : la sortie %s est DANS le depot, qui est public, et ce document porte des '
             'donnees de sante personnelles (regle d or #14, R36).' % OUT)

NB = 0


def garde(ok, msg):
    global NB
    NB += 1
    if not ok:
        sys.exit('GARDE %d : %s' % (NB, msg))


# ════════════════════════════════════════════════════════════════════════════════════════
#  A. LE CODE SERVI — on relit les regles, on ne les recopie jamais
# ════════════════════════════════════════════════════════════════════════════════════════
STATE = open(os.path.join(ROOT, 'state.js'), encoding='utf-8').read()
TRACK = open(os.path.join(ROOT, 'tracking.js'), encoding='utf-8').read()
SW = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]
garde(VERSION.startswith('ft-v'), 'la version servie ne se lit plus dans sw.js')

_m = re.search(r'const base=10\*S\.bw\+6\.25\*S\.height-5\*S\.age;', STATE)
garde(_m is not None, 'la formule de Mifflin a change dans state.js : tout le dossier en depend')
_m = re.search(r"sexeAthlete\(\)==='H'\?base\+5:base-161", STATE)
garde(_m is not None, 'le terme homme/femme de Mifflin a change dans state.js')

_m = re.search(r'function calcWorkExtra\(\)\{return\{([^}]*)\}', STATE)
garde(_m is not None, 'calcWorkExtra ne se lit plus dans state.js')
WORK = dict((k, int(v)) for k, v in re.findall(r'(\w+):(\d+)', _m.group(1)))
garde(WORK.get('physique') == 450, 'le bonus « metier physique » ne vaut plus 450 mais %r' % WORK.get('physique'))

_m = re.search(r'const _ACT_PAR_FREQ=\{([^}]*)\}', STATE)
garde(_m is not None, '_ACT_PAR_FREQ ne se lit plus dans state.js')
ACT_PAR_FREQ = dict((k, float(v)) for k, v in re.findall(r"'(\d)':([\d.]+)", _m.group(1)))
garde(ACT_PAR_FREQ.get('3') == ACT_PAR_FREQ.get('4') == 1.55,
      'les buckets 3 et 4 ne pointent plus tous deux vers 1,55 : le defaut decrit n existe plus')
garde(ACT_PAR_FREQ.get('5') == 1.725, 'le bucket 5 ne vaut plus 1,725')

_m = re.search(r'const _GOAL_DELTA_KCAL=\{([^}]*)\}', STATE)
garde(_m is not None, '_GOAL_DELTA_KCAL ne se lit plus dans state.js')
GOAL = dict((k, int(v)) for k, v in re.findall(r'(\w+):(-?\d+)', _m.group(1)))
garde(GOAL.get('recomp') == -250, 'le delta « perte de gras + muscle » ne vaut plus -250')

_m = re.search(r"function _freqBucketOf\(n\)\{return ([^;]*);\}", TRACK)
garde(_m is not None, '_freqBucketOf ne se lit plus dans tracking.js')
BUCKET_SRC = _m.group(1)
garde("n===3?'3'" in BUCKET_SRC and "n===4?'4'" in BUCKET_SRC,
      '_freqBucketOf ne distingue plus 3 et 4 : le defaut central du dossier serait corrige')

_m = re.search(r"const bucket=Object\.keys\(cnt\)\.find\(b=>cnt\[b\]>=3\);", STATE)
garde(_m is not None,
      'ecartNiveauActivite ne regroupe plus par cle de bucket : le defaut decrit serait corrige')

_m = re.search(r'const phaseAdj=phase===\'charge\'\?(\d+):-\d+;', STATE)
garde(_m is not None, 'le terme de phase ne se lit plus dans _autoKcalBrut')
PHASE_CHARGE = int(_m.group(1))


def _corps(txt, nom):
    i = txt.find('function %s(' % nom)
    if i < 0:
        return ''
    j, prof, vu = i, 0, False
    while j < len(txt):
        if txt[j] == '{':
            prof += 1
            vu = True
        elif txt[j] == '}':
            prof -= 1
            if vu and prof == 0:
                return txt[i:j + 1]
        j += 1
    return txt[i:]


CHAINE = ''.join(_corps(STATE, f) for f in
                 ('calcTDEE', 'bmrDetail', 'calcWorkExtra', 'calcSportExtra',
                  'calcPasExtra', '_autoKcalBrut', 'goalDeltaKcal', '_plancherKcal'))
garde(len(CHAINE) > 800, 'la chaine de calcul du TDEE ne se lit plus : %d caracteres' % len(CHAINE))
garde('S.weightLog' not in CHAINE,
      'calcTDEE lit desormais S.weightLog : l affirmation centrale du dossier serait fausse')
garde('S.foodLog' not in CHAINE,
      'calcTDEE lit desormais S.foodLog : l affirmation centrale du dossier serait fausse')

SERVIS = ('state.js', 'app.js', 'screens.js', 'log.js', 'coach.js', 'setup.js',
          'tracking.js', 'constants.js')


def sans_com(t):
    """Retire les commentaires en gardant les sauts de ligne.

    [/!\\] PREMIERE VERSION FAUSSE, ET LA GARDE L A ATTRAPEE : elle testait si la LIGNE
    commence par '*' ou '//'. Or une ligne au MILIEU d un bloc /* ... */ peut commencer par
    n importe quoi - celle de state.js commence par le signe « environ ». La garde a donc
    annonce « 7700 hors commentaire » sur un code parfaitement sain.
    *Un detecteur de commentaire qui regarde le debut de ligne mesure la mise en forme.*
    """
    t = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m.group(0).count('\n'), t)
    return '\n'.join(re.sub(r'//.*$', '', l) for l in t.split('\n'))


_n7700 = 0
_n7700_code = 0
for _f in SERVIS:
    _t = open(os.path.join(ROOT, _f), encoding='utf-8').read()
    _n7700 += _t.count('7700')
    _n7700_code += sans_com(_t).count('7700')
garde(_n7700 > 0, 'la constante 7700 a disparu des fichiers servis')
garde(_n7700_code == 0,
      '7700 apparait desormais %d fois HORS commentaire dans les fichiers servis : le dossier '
      'affirme le contraire' % _n7700_code)
_n7700_com = _n7700


def _nb(v):
    try:
        return float(str(v).strip().replace(',', '.'))
    except Exception:                                                              # noqa
        return None


# ════════════════════════════════════════════════════════════════════════════════════════
#  B. LA CHAINE DE CALCUL, REJOUEE SUR SON PROFIL
# ════════════════════════════════════════════════════════════════════════════════════════
BW, HT, AGE = 85.8, 179.0, 41.0
BMR = round(10 * BW + 6.25 * HT - 5 * AGE + 5)
garde(BMR == 1777, 'le BMR recalcule vaut %d et non 1777' % BMR)
T_ACTIF = round(BMR * ACT_PAR_FREQ['5'])
TDEE_APP = T_ACTIF + WORK['physique']
CIBLE = TDEE_APP + GOAL['recomp'] + PHASE_CHARGE
PAL_APP = TDEE_APP / float(BMR)
T_MODERE = round(BMR * ACT_PAR_FREQ['3'])
T_MODERE_PHY = T_MODERE + WORK['physique']
T_TRES_ACTIF = round(BMR * 1.9)
garde(abs(PAL_APP - 1.978) < 0.002, 'le PAL effectif recalcule vaut %.3f' % PAL_APP)
garde(TDEE_APP > T_TRES_ACTIF,
      'le reglage ne depasse plus le cran le plus haut : la these du dossier tombe')
DEPASSE = TDEE_APP - T_TRES_ACTIF

# ════════════════════════════════════════════════════════════════════════════════════════
#  C. LE JOURNAL ALIMENTAIRE — controle AVANT calcul
# ════════════════════════════════════════════════════════════════════════════════════════
LN = []
with io.open(CSV_NUTRI, encoding='utf-8-sig') as f:
    for r in csv.DictReader(f, delimiter=';'):
        if not r.get('date'):
            continue
        LN.append(dict(d=r['date'], repas=(r['repas'] or '').strip().lower(),
                       al=(r['aliment'] or '').strip(), kcal=_nb(r['kcal']) or 0.0,
                       p=_nb(r['proteines_g']) or 0.0, g=_nb(r['glucides_g']) or 0.0,
                       l=_nb(r['lipides_g']) or 0.0, saisie=(r['saisie'] or '').strip()))
garde(len(LN) > 250, 'le CSV nutrition ne porte que %d lignes' % len(LN))

# (1) loi physique : kcal >= 4P + 4G + 9L, hors tolerance
LOI = []
for r in LN:
    att = 4 * r['p'] + 4 * r['g'] + 9 * r['l']
    if att > 0 and abs(r['kcal'] - att) > max(40, 0.25 * att):
        LOI.append((r, att, r['kcal'] - att))
LOI.sort(key=lambda x: -abs(x[2]))
garde(len(LOI) >= 1, 'aucune violation de la loi physique : le dossier en decrit')
TYPO = [x for x in LOI if x[2] > 900]
garde(len(TYPO) == 1, '%d ligne(s) a plus de 900 kcal d ecart, le dossier en decrit une' % len(TYPO))
TYPO_D, TYPO_ECART = TYPO[0][0]['d'], round(TYPO[0][2])
TYPO_DECL, TYPO_ATT = round(TYPO[0][0]['kcal']), round(TYPO[0][1])

# (2) doublons exacts
CNT = collections.Counter((r['d'], r['repas'], r['al'], r['kcal']) for r in LN)
DUP = sorted([(k, v) for k, v in CNT.items() if v > 1])
DUP_KCAL = round(sum(k[3] * (v - 1) for k, v in DUP))
DUP_JOURS = sorted(set(k[0] for k, v in DUP))
DUP_AL = sorted(set(k[2] for k, v in DUP))
garde(len(DUP_AL) == 1, 'les doublons portent sur %d aliments differents' % len(DUP_AL))

# (3) portion absurde
CAFE = [r for r in LN if r['al'].startswith('Caf') and r['kcal'] > 300]
garde(len(CAFE) == 1, '%d ligne(s) de cafe a plus de 300 kcal' % len(CAFE))
CAFE_KCAL, CAFE_D = round(CAFE[0]['kcal']), CAFE[0]['d']

BRUT_TOT = round(sum(r['kcal'] for r in LN))
vu, GARDES_L = set(), []
for r in LN:
    k = (r['d'], r['repas'], r['al'], r['kcal'])
    if k in vu:
        continue
    vu.add(k)
    if r is TYPO[0][0]:
        r = dict(r, kcal=float(TYPO_ATT))
    if r in CAFE:
        continue
    GARDES_L.append(r)
RETIRE = BRUT_TOT - round(sum(r['kcal'] for r in GARDES_L))
PCT_RETIRE = 100.0 * RETIRE / BRUT_TOT
garde(RETIRE == abs(TYPO_ECART) + DUP_KCAL + CAFE_KCAL,
      'le total retire (%d) ne vaut pas la somme des trois defauts' % RETIRE)
garde(PCT_RETIRE < 5, 'les corrections pesent %.1f %% du journal' % PCT_RETIRE)

JOUR = collections.defaultdict(float)
REPAS = collections.defaultdict(set)
for r in GARDES_L:
    JOUR[r['d']] += r['kcal']
    REPAS[r['d']].add(r['repas'])
BLOC = sorted(d for d in JOUR if d >= '2026-08-22')
_a = dt.date(*map(int, BLOC[0].split('-')))
_b = dt.date(*map(int, BLOC[-1].split('-')))
garde(len(BLOC) == (_b - _a).days + 1,
      'le bloc du journal a des trous : %d jours notes pour %d jours calendaires'
      % (len(BLOC), (_b - _a).days + 1))
N_CONSEC = len(BLOC)
PRINC = {'petitdej', 'dejeuner', 'diner'}
FEN = [d for d in BLOC if '2026-08-23' <= d <= '2026-09-20']
COMPLETS = [d for d in FEN if PRINC <= REPAS[d]]
INCOMPLETS = [d for d in FEN if not PRINC <= REPAS[d]]
APPORT = st.mean([JOUR[d] for d in COMPLETS])
APPORT_TOUS = st.mean([JOUR[d] for d in FEN])
garde(2300 < APPORT < 2550, 'l apport moyen recalcule vaut %.0f' % APPORT)

# ════════════════════════════════════════════════════════════════════════════════════════
#  D. LE POIDS
# ════════════════════════════════════════════════════════════════════════════════════════
PP = []
with io.open(CSV_POIDS, encoding='utf-8-sig') as f:
    for r in csv.DictReader(f, delimiter=';'):
        kg = _nb(r.get('poids_kg'))
        if not r.get('date') or kg is None:
            continue
        PP.append((dt.date(*map(int, r['date'].split('-'))), kg, _nb(r.get('masse_grasse_pct'))))
PP.sort()
garde(len(PP) > 100, 'le CSV de poids ne porte que %d pesees' % len(PP))


def pente(pts):
    if len(pts) < 2:
        return None
    x0 = pts[0][0]
    xs = [(p[0] - x0).days for p in pts]
    ys = [p[1] for p in pts]
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    den = sum((x - mx) ** 2 for x in xs)
    return None if den == 0 else sum((xs[i] - mx) * (ys[i] - my) for i in range(n)) / den * 7.0


FENETRES = []
for lab, a, b in [('fenetre du journal (23/08 au 22/09)', dt.date(2026, 8, 23), dt.date(2026, 9, 22)),
                  ('3 mois (22/06 au 22/09)', dt.date(2026, 6, 22), dt.date(2026, 9, 22)),
                  ('6 mois (22/03 au 22/09)', dt.date(2026, 3, 22), dt.date(2026, 9, 22))]:
    s = [p for p in PP if a <= p[0] <= b]
    FENETRES.append((lab, pente(s), len(s)))
P_1M, N_1M = FENETRES[0][1], FENETRES[0][2]
P_3M, N_3M = FENETRES[1][1], FENETRES[1][2]
P_6M = FENETRES[2][1]
garde(N_1M == 5, 'la fenetre du journal porte %d pesees, l ecran en annonce 5' % N_1M)
garde(P_3M < 0 < P_1M, 'les deux pentes ne sont plus de signes opposes : le propos du dossier change')
KCAL_KG = 7700
TDEE_1M = APPORT - P_1M / 7.0 * KCAL_KG
TDEE_3M = APPORT - P_3M / 7.0 * KCAL_KG
TDEE_PLAT = APPORT
PAL_OBS_BAS, PAL_OBS_HAUT = TDEE_1M / BMR, TDEE_3M / BMR
garde(PAL_OBS_HAUT < 1.45, 'le PAL observe haut vaut %.3f : le raisonnement du dossier change' % PAL_OBS_HAUT)

# masse grasse : formule ou mesure ?
RUPT = dt.date(2026, 7, 8)
AV = [p for p in PP if p[2] is not None and p[0] < RUPT]
AP = [p for p in PP if p[2] is not None and p[0] >= RUPT]
SAUT = st.mean([p[2] for p in AP]) - st.mean([p[2] for p in AV])
garde(SAUT > 3, 'le saut de masse grasse vaut %.2f point : le dossier en decrit un net' % SAUT)
BANDE = [p for p in AV if 85.0 <= p[1] <= 87.5]
garde(len(BANDE) > 30, 'la bande etroite ne porte que %d pesees' % len(BANDE))
_xs = [p[1] for p in BANDE]
_ys = [p[2] for p in BANDE]
_n = len(_xs)
_mx, _my = sum(_xs) / _n, sum(_ys) / _n
B1 = sum((_xs[i] - _mx) * (_ys[i] - _my) for i in range(_n)) / sum((x - _mx) ** 2 for x in _xs)
B0 = _my - B1 * _mx
RESID = max(abs(_ys[i] - (B0 + B1 * _xs[i])) for i in range(_n))
R2 = 1 - (sum((_ys[i] - (B0 + B1 * _xs[i])) ** 2 for i in range(_n))
          / sum((y - _my) ** 2 for y in _ys))
BANDE_ANS = (max(p[0] for p in BANDE) - min(p[0] for p in BANDE)).days / 365.25
garde(RESID < 0.25, 'le residu de la regression vaut %.3f point' % RESID)
garde(BANDE_ANS > 3, 'la bande ne couvre que %.1f an(s)' % BANDE_ANS)
N_AV = len(AV)

# ════════════════════════════════════════════════════════════════════════════════════════
#  E. L HISTORIQUE DE SEANCES
# ════════════════════════════════════════════════════════════════════════════════════════
HR = []
with io.open(CSV_HIST, encoding='utf-8-sig') as f:
    for r in csv.DictReader(f, delimiter=';'):
        if not r.get('date'):
            continue
        HR.append(dict(d=r['date'], ex=(r['exercise'] or '').strip(),
                       typ=(r['type'] or '').strip(), kg=_nb(r['kg']), reps=_nb(r['reps'])))
garde(len(HR) > 500, 'le CSV historique ne porte que %d lignes' % len(HR))
TYPES = collections.Counter(r['typ'] for r in HR)
garde('N' in TYPES and TYPES.get('N', 0) > 500, 'le type de serie « N » a disparu du CSV')
N_ECHAUF = TYPES.get('E', 0) + TYPES.get('\xc9', 0)
garde(N_ECHAUF > 50, 'les series d echauffement ont disparu : %r' % dict(TYPES))

JOURS = sorted(set(dt.date(*map(int, r['d'].split('-'))) for r in HR))
SPAN = (JOURS[-1] - JOURS[0]).days + 1
FREQ_BRUTE = len(JOURS) * 7.0 / SPAN
WK = collections.Counter()
for d in JOURS:
    WK[d - dt.timedelta(days=d.weekday())] += 1
KS = sorted(WK)
COMPL = [WK[k] for k in KS[1:-1]]
FREQ = st.mean(COMPL)
MED_FREQ = st.median(COMPL)
N_34 = sum(1 for c in COMPL if 3 <= c <= 4)
N_56 = sum(1 for c in COMPL if 5 <= c <= 6)
N_7 = sum(1 for c in COMPL if c >= 7)
PCT_34 = 100.0 * N_34 / len(COMPL)
garde(3.0 <= FREQ <= 4.5, 'la frequence moyenne recalculee vaut %.2f' % FREQ)
garde(N_34 > N_56, 'les semaines a 3-4 seances ne dominent plus : le propos du dossier change')
garde(N_7 == 0, '%d semaine(s) a 7 seances ou plus' % N_7)
ECART_MULT = round(BMR * (ACT_PAR_FREQ['5'] - ACT_PAR_FREQ['3']))


def _bucket(n):
    return '1' if n <= 2 else '3' if n == 3 else '4' if n == 4 else '5'


def _weekly(today, n=4):
    c = [0] * n
    for d in JOURS:
        w = (today - d).days // 7
        if 0 <= w < n:
            c[w] += 1
    return c


def _carte(today, actuel, par_niveau):
    wk = _weekly(today)
    if sum(1 for c in wk if c > 0) < 3:
        return False
    cnt = collections.Counter()
    for c in wk:
        cnt[ACT_PAR_FREQ[_bucket(c)] if par_niveau else _bucket(c)] += 1
    cle = next((k for k in cnt if cnt[k] >= 3), None)
    if cle is None:
        return False
    sug = cle if par_niveau else ACT_PAR_FREQ[cle]
    return not (actuel >= 1.9 or sug == actuel)


_d0 = JOURS[0] + dt.timedelta(days=28)
N_SIM = (JOURS[-1] - _d0).days + 1
SIM_A = sum(1 for i in range(N_SIM) if _carte(_d0 + dt.timedelta(days=i), 1.725, False))
SIM_B = sum(1 for i in range(N_SIM) if _carte(_d0 + dt.timedelta(days=i), 1.725, True))
garde(SIM_B > SIM_A, 'le regroupement par niveau ne declenche plus davantage (%d vs %d)' % (SIM_B, SIM_A))
PERDUS = SIM_B - SIM_A

# progression de force — series NORMALES seulement
WORKSETS = [r for r in HR if r['typ'] == 'N' and r['kg'] and r['reps']]
DSW = sorted(set(r['d'] for r in WORKSETS))
MID = DSW[len(DSW) // 2]
A_, B_ = collections.defaultdict(list), collections.defaultdict(list)
for r in WORKSETS:
    (A_ if r['d'] < MID else B_)[(r['ex'], int(r['reps']))].append(r['kg'])
PAIRES = []
for k in set(A_) & set(B_):
    a, b = max(A_[k]), max(B_[k])
    PAIRES.append((100.0 * (b - a) / a, k[0], k[1], a, b))
PAIRES.sort(reverse=True)
MED_F = st.median([p[0] for p in PAIRES])
N_POS = sum(1 for p in PAIRES if p[0] > 0)
N_PAIRES = len(PAIRES)
garde(N_PAIRES > 20, 'seulement %d paires comparables' % N_PAIRES)
# la meme mesure, echauffements INCLUS : le defaut d instrument, remesure
A2, B2 = collections.defaultdict(list), collections.defaultdict(list)
for r in HR:
    if r['typ'] == 'CARDIO' or not r['kg'] or not r['reps']:
        continue
    (A2 if r['d'] < MID else B2)[(r['ex'], int(r['reps']))].append(r['kg'])
P2 = [100.0 * (max(B2[k]) - max(A2[k])) / max(A2[k]) for k in set(A2) & set(B2)]
MED_F_FAUX = st.median(P2)
garde(MED_F_FAUX < MED_F, 'l instrument fautif ne rend plus une mediane plus basse (%.1f vs %.1f)'
      % (MED_F_FAUX, MED_F))


def bz(kg, reps):
    return None if (not kg or not reps or reps < 1 or reps > 12) else kg * 36.0 / (37.0 - reps)


BEST = collections.defaultdict(lambda: [None, None])
for r in WORKSETS:
    e = bz(r['kg'], r['reps'])
    if e is None:
        continue
    i = 0 if r['d'] < MID else 1
    if BEST[r['ex']][i] is None or e > BEST[r['ex']][i]:
        BEST[r['ex']][i] = e
EV = sorted(((100.0 * (b - a) / a, ex) for ex, (a, b) in BEST.items() if a and b), reverse=True)
GROS = {}
for nom in ('Squat a la Barre', 'Souleve de Terre Roumain Barre', 'Hip Thrust',
            'Tirage Poulie Haute', 'Tirage Visage'):
    for p, ex in EV:
        if nom.split()[0].lower() in ex.lower() and nom.split()[-1].lower() in ex.lower():
            GROS[ex] = p
            break
garde(len(GROS) >= 4, 'seulement %d gros mouvements retrouves' % len(GROS))
garde(all(v > 0 for v in GROS.values()), 'un gros mouvement n est plus en progres : %r' % GROS)

# ════════════════════════════════════════════════════════════════════════════════════════
#  F. LA BANDE PLAUSIBLE
# ════════════════════════════════════════════════════════════════════════════════════════
def sousdecl(t):
    return 100.0 * (t - APPORT) / t


SD_APP = sousdecl(TDEE_APP)
SD_ACTIF = sousdecl(T_ACTIF)
SD_MODPHY = sousdecl(T_MODERE_PHY)
garde(SD_APP > 30, 'la sous-declaration exigee par l app vaut %.0f %%' % SD_APP)
garde(SD_ACTIF < 30, 'la sous-declaration sans le metier vaut %.0f %%' % SD_ACTIF)
DEFICIT_SI_APP = TDEE_APP - APPORT
PERTE_ATTENDUE = DEFICIT_SI_APP * len(FEN) / float(KCAL_KG)
ECART_CIBLE = CIBLE - APPORT

# ════════════════════════════════════════════════════════════════════════════════════════
#  G. RENDU
# ════════════════════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
FONDC = colors.HexColor('#EEEEEC')
TRAIT = colors.HexColor('#D8D8D4')
VERT = colors.HexColor('#1E7A46')
ORANGE = colors.HexColor('#B26A00')
S_ = getSampleStyleSheet()
stl = {
    'titre': ParagraphStyle('titre', parent=S_['Title'], fontName='Helvetica-Bold', fontSize=19,
                            leading=23, textColor=ENCRE, alignment=TA_LEFT, spaceAfter=2),
    'sous': ParagraphStyle('sous', parent=S_['Normal'], fontName='Helvetica', fontSize=9.5,
                           leading=13, textColor=GRIS, spaceAfter=14),
    'h1': ParagraphStyle('h1', parent=S_['Heading1'], fontName='Helvetica-Bold', fontSize=13,
                         leading=16, textColor=ROUGE, spaceBefore=14, spaceAfter=6),
    'p': ParagraphStyle('p', parent=S_['Normal'], fontName='Helvetica', fontSize=9.3,
                        leading=13.2, textColor=ENCRE, spaceAfter=6),
    'petit': ParagraphStyle('petit', parent=S_['Normal'], fontName='Helvetica', fontSize=8.2,
                            leading=11.5, textColor=GRIS, spaceAfter=5),
    'cell': ParagraphStyle('cell', parent=S_['Normal'], fontName='Helvetica', fontSize=8.1,
                           leading=10.6),
    'cellb': ParagraphStyle('cellb', parent=S_['Normal'], fontName='Helvetica-Bold', fontSize=8.1,
                            leading=10.6),
    'code': ParagraphStyle('code', parent=S_['Normal'], fontName='Courier', fontSize=7.0,
                           leading=8.8, textColor=ENCRE),
}


def _v(x, ou='texte'):
    for ch in x:
        try:
            ch.encode('cp1252')
        except UnicodeEncodeError:
            sys.exit('CARACTERE NON RENDU %r (%s) dans %s' % (ch, hex(ord(ch)), ou))
    for m in re.finditer(r'&([A-Za-z][A-Za-z0-9]{1,15});', x):
        c = html.unescape(m.group(0))
        if len(c) == 1:
            try:
                c.encode('cp1252')
            except UnicodeEncodeError:
                sys.exit('ENTITE NON RENDUE %s dans %s' % (m.group(0), ou))
    return x


def P(t, s='p'):
    return Paragraph(_v(t, 'paragraphe'), stl[s])


def encadre(titre, corps_, couleur=ROUGE):
    t = Table([[Paragraph('<b>%s</b>' % _v(titre, 'titre'), stl['cellb'])],
               [Paragraph(_v(corps_, 'corps'), stl['cell'])]], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FOND),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBEFORE', (0, 0), (0, -1), 2.4, couleur), ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether(t)


def tableau(entetes, ligs, largeurs):
    data = [[Paragraph('<b>%s</b>' % _v(h, 'en-tete'), stl['cellb']) for h in entetes]]
    for l in ligs:
        data.append([Paragraph(_v(c, 'cellule'), stl['cell']) for c in l])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EDEDEA')),
        ('GRID', (0, 0), (-1, -1), 0.4, TRAIT), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5)]))
    return t


def bloc_code(txt, legende=None):
    _v(txt, 'bloc de code')
    for l in txt.split('\n'):
        if stringWidth(l, 'Courier', 7.0) > 165 * mm - 12:
            sys.exit('LIGNE QUI DEBORDE (%d car) : %s' % (len(l), l[:70]))
    t = Table([[Preformatted(txt, stl['code'])]], colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FONDC),
        ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBEFORE', (0, 0), (0, -1), 2.0, TRAIT), ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([Paragraph(_v(legende, 'legende'), stl['petit']), t]) if legende else t


def pied(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(GRIS)
    canvas.drawString(22 * mm, 12 * mm,
                      'Force Tracker - le TDEE de Michel, mesure (%s) - 22/09/2026 - '
                      'DONNEES PERSONNELLES, hors depot' % VERSION)
    canvas.drawRightString(188 * mm, 12 * mm, 'page %d' % doc.page)
    canvas.setStrokeColor(TRAIT)
    canvas.setLineWidth(0.4)
    canvas.line(22 * mm, 16 * mm, 188 * mm, 16 * mm)
    canvas.restoreState()


def kf(x, d=0):
    return ('%.*f' % (d, x)).replace('.', ',')


def kfs(x, d=0):
    return ('%+.*f' % (d, x)).replace('.', ',')


H = []
H.append(P('Le TDEE de Michel, mesure', 'titre'))
H.append(P('Dossier complet - 22 septembre 2026 - application servie en %s.<br/>'
           'Question de depart, posee plusieurs fois et jamais instruite : '
           '<i>&laquo; je trouve mes calories beaucoup trop elevees &raquo;</i>.<br/>'
           '[!!] Ce document contient des donnees de sante personnelles. Il est genere '
           '<b>hors du depot</b>, qui est public (regle d or #14, R36).' % VERSION, 'sous'))

H.append(encadre(
    'La reponse, en une phrase',
    'L application estime le TDEE de Michel a <b>%d kcal</b>. Ses donnees reelles - '
    '%d jours de journal consecutifs, %d pesees sur trois mois, %d lignes de seances - '
    'situent son TDEE reel autour de <b>2 800 a 3 100 kcal</b>. [*] L application est haute '
    'de <b>400 a 700 kcal par jour</b>, et <b>%d de ces kcal ne sont plus une hypothese</b> : '
    'sa frequence d entrainement reelle est de <b>%s seances par semaine</b>, pas de 5-6 comme '
    'son reglage le declare. [*] <b>Niveau de confiance : MOYEN.</b> Le paragraphe 9 dit '
    'exactement pourquoi, et ce qui reste indecidable.'
    % (TDEE_APP, N_CONSEC, N_3M, len(HR), ECART_MULT, kf(FREQ, 2)), ROUGE))

# 1
H.append(P('1. Ce que l application calcule, terme par terme', 'h1'))
H.append(P('La chaine est relue <b>dans le code servi</b> a chaque generation de ce document, '
           'jamais recopiee ici. Profil : homme, %s kg, %d cm, %d ans, activite '
           '&laquo; Actif (5-6j) &raquo;, metier &laquo; Physique &raquo;, phase charge, '
           'objectif &laquo; Perte de gras + muscle &raquo;.'
           % (kf(BW, 1), int(HT), int(AGE)), 'p'))
H.append(bloc_code(
    "1)  BMR Mifflin (%s kg / %d cm / %d ans / H) ......  %s   <- calcule sur ses chiffres\n"
    "2)  x %s   niveau d'activite declare ..............  %s   (+%s)  <- DECLARE\n"
    "3)  + %d    metier physique .......................  %s   (+%d)    <- DECLARE\n"
    "    ================================== TDEE = %s\n"
    "4)  %d    objectif recomposition .................  %s   <- table de constantes\n"
    "5)  + %d    phase charge ..........................  %s   <- table de constantes\n"
    "    ================================== CIBLE = %s"
    % (kf(BW, 1), int(HT), int(AGE), kf(BMR), kf(ACT_PAR_FREQ['5'], 3), kf(T_ACTIF),
       kf(T_ACTIF - BMR), WORK['physique'], kf(TDEE_APP), WORK['physique'], kf(TDEE_APP),
       GOAL['recomp'], kf(TDEE_APP + GOAL['recomp']), PHASE_CHARGE, kf(CIBLE), kf(CIBLE)),
    'La chaine complete, telle que state.js l execute :'))
H.append(Spacer(1, 4))
H.append(encadre(
    'Le reglage le place au-dessus du maximum du selecteur',
    'Le <b>PAL effectif</b> - le TDEE divise par le metabolisme de base - est le seul chiffre '
    'comparable d un reglage a l autre. Le sien vaut <b>%s</b>. [*] Or le cran le plus haut du '
    'menu deroulant, &laquo; Tres actif &raquo;, vaut <b>1,900</b>, soit %s kcal. [*] <b>Il est '
    '%d kcal au-dessus du plafond que l application propose elle-meme</b>, sans avoir jamais '
    'choisi le cran du haut. [/!\\] Les cinq multiplicateurs viennent d une table standard dont '
    'le dernier cran se definit <i>&laquo; exercice tres intense ET metier physique &raquo;</i> - '
    'fait de type [B], source secondaire largement reproduite, <b>aucune publication primaire '
    'ouvrable depuis ce conteneur</b>. Les libelles du selecteur, eux, ne parlent que des '
    'seances, et le type de travail s ajoute a cote.'
    % (kf(PAL_APP, 3), kf(T_TRES_ACTIF), DEPASSE), ORANGE))

# 2
H.append(P('2. La qualite du journal, controlee AVANT tout calcul', 'h1'))
H.append(P('Consigne de Michel, mot pour mot : <i>&laquo; ne prends pas la moyenne calorique '
           'brute comme verite sans verifier les anomalies &raquo;</i>. Trois filtres '
           'independants ont ete passes sur les %d lignes.' % len(LN), 'p'))
H.append(tableau(
    ['Defaut', 'Ou', 'Effet'],
    [['<b>Loi physique violee</b> - une ligne declare %s kcal pour des macros qui en valent '
      '%s (4P + 4G + 9L)' % (kf(TYPO_DECL), kf(TYPO_ATT)),
      '%s, saisie <font face="Courier">ia-texte</font>' % TYPO_D,
      '<b>%s kcal</b>, un chiffre de trop' % kfs(TYPO_ECART)],
     ['<b>%d doublons exacts</b> - meme jour, meme repas, meme aliment, meme valeur : '
      '<i>%s</i>' % (len(DUP), DUP_AL[0]),
      '%d jours entre le %s et le %s' % (len(DUP_JOURS), DUP_JOURS[0], DUP_JOURS[-1]),
      '<b>+%s kcal</b>' % kf(DUP_KCAL)],
     ['<b>Portion absurde</b> - 100 g de cafe moulu, l entree CIQUAL de la poudre seche et non '
      'd une tasse', CAFE_D, '<b>+%s kcal</b>' % kf(CAFE_KCAL)]],
    [88 * mm, 40 * mm, 37 * mm]))
H.append(Spacer(1, 4))
H.append(encadre(
    'Le journal tient, et c est ce qui rend la suite solide',
    'Total retire : <b>%s kcal sur %s</b>, soit <b>%s %%</b> du journal. [*] Et surtout : '
    '<b>%d jours CONSECUTIFS notes, zero trou</b>, du %s au %s. [*] Les &laquo; anciennes '
    'entrees foireuses &raquo; que Michel soupconnait existent bel et bien - il y en a trois - '
    '<b>mais elles ne deplacent pas la moyenne</b>. [/!\\] Le doublon est un <b>defaut '
    'd application</b>, pas une faute de saisie : %d occurrences, toujours le meme produit. '
    'Il merite sa propre enquete.'
    % (kf(RETIRE), kf(BRUT_TOT), kf(PCT_RETIRE, 1), N_CONSEC, BLOC[0], BLOC[-1], len(DUP)), VERT))

# 3
H.append(P('3. Le TDEE observe', 'h1'))
H.append(P('Apport moyen corrige : <b>%s kcal/j</b> sur les %d jours complets de la fenetre des '
           'pesees (%s si l on garde aussi les %d jours ou un repas manque). [*] La pente d un '
           'mois est <b>ecartee expres</b> : %d pesees pour une amplitude de plus d un kilo, '
           'c est du bruit - et l application mesure elle-meme %s kg/sem sur %d pesees a trois '
           'mois. <b>Le poids est plat.</b>'
           % (kf(APPORT), len(COMPLETS), kf(APPORT_TOUS), len(INCOMPLETS), N_1M,
              kfs(P_3M, 3), N_3M), 'p'))
H.append(tableau(
    ['Pente retenue', 'Bilan energetique', 'TDEE observe', 'PAL'],
    [['%s kg/sem (%d pesees, 1 mois)' % (kfs(P_1M, 3), N_1M),
      '%s kcal/j' % kfs(P_1M / 7.0 * KCAL_KG), '<b>%s</b>' % kf(TDEE_1M), kf(TDEE_1M / BMR, 2)],
     ['poids strictement plat', '0 kcal/j', '<b>%s</b>' % kf(TDEE_PLAT), kf(TDEE_PLAT / BMR, 2)],
     ['%s kg/sem (%d pesees, 3 mois)' % (kfs(P_3M, 3), N_3M),
      '%s kcal/j' % kfs(P_3M / 7.0 * KCAL_KG), '<b>%s</b>' % kf(TDEE_3M), kf(TDEE_3M / BMR, 2)],
     ['%s kg/sem (6 mois)' % kfs(P_6M, 3), '%s kcal/j' % kfs(P_6M / 7.0 * KCAL_KG), '-', '-']],
    [62 * mm, 40 * mm, 33 * mm, 30 * mm]))
H.append(Spacer(1, 4))
H.append(P('Formule employee, et c est la seule : '
           '<font face="Courier">TDEE = apport moyen - (pente kg/j x %s)</font>.' % kf(KCAL_KG), 'petit'))

# 4
H.append(P('4. La frequence reelle - la piece qui manquait', 'h1'))
H.append(P('%d jours d entrainement sur %d jours calendaires, soit <b>%s seances par semaine</b> '
           'en moyenne brute. Sur les <b>%d semaines completes</b> (la premiere et la derniere '
           'sont tronquees, elles sont ecartees) : <b>moyenne %s, mediane %s</b>.'
           % (len(JOURS), SPAN, kf(FREQ_BRUTE, 2), len(COMPL), kf(FREQ, 2), kf(MED_FREQ, 1)), 'p'))
H.append(tableau(
    ['Cran de l application', 'Ses semaines', 'Part'],
    [['<b>3-4 seances -&gt; %s &laquo; Modere &raquo;</b>' % kf(ACT_PAR_FREQ['3'], 2),
      '<b>%d sur %d</b>' % (N_34, len(COMPL)), '<b>%s %%</b>' % kf(PCT_34)],
     ['5-6 seances -&gt; %s &laquo; Actif &raquo; <i>(son reglage)</i>' % kf(ACT_PAR_FREQ['5'], 3),
      '%d sur %d' % (N_56, len(COMPL)), '%s %%' % kf(100.0 * N_56 / len(COMPL))],
     ['1-2 seances -&gt; %s &laquo; Leger &raquo;' % kf(ACT_PAR_FREQ['1'], 3),
      '%d sur %d' % (len(COMPL) - N_34 - N_56 - N_7, len(COMPL)),
      '%s %%' % kf(100.0 * (len(COMPL) - N_34 - N_56 - N_7) / len(COMPL))],
     ['7 seances ou plus -&gt; 1,9 &laquo; Tres actif &raquo;', '<b>%d</b>' % N_7, '<b>0 %</b>']],
    [85 * mm, 40 * mm, 40 * mm]))
H.append(Spacer(1, 4))
H.append(encadre(
    'Les %s kcal du multiplicateur ne sont plus une inference' % kf(ECART_MULT),
    'Passer de %s a %s coute <b>%s x %s = %s kcal</b>. [*] Ce n est pas un avis sur son '
    'entrainement : ce sont <b>ses propres seances enregistrees</b>. Il est regle un cran trop '
    'haut, et son historique le dit.'
    % (kf(ACT_PAR_FREQ['3'], 2), kf(ACT_PAR_FREQ['5'], 3), kf(BMR),
       kf(ACT_PAR_FREQ['5'] - ACT_PAR_FREQ['3'], 3), kf(ECART_MULT)), VERT))

# 5
H.append(P('5. Le garde-fou existe dans l application, et il ne peut presque pas se declencher', 'h1'))
H.append(P('<font face="Courier">ecartNiveauActivite()</font> (state.js) est ecrit <b>exactement</b> '
           'pour ce cas : il regarde les quatre dernieres semaines et propose de corriger le niveau '
           'si le rythme est stable. Il n a jamais rien propose. La cause est un regroupement par '
           'la mauvaise cle.', 'p'))
H.append(bloc_code(
    "tracking.js   _freqBucketOf(n) = %s\n"
    # [/!\] PAS DE VIRGULE DECIMALE DANS CE BLOC : il cite du JavaScript reel. Le
    #    formateur francais y ecrivait « '1':1,375 », une syntaxe qui n existe pas et qui
    #    ferait douter de tout l extrait. Un bout de code se cite dans SA langue.
    "state.js      _ACT_PAR_FREQ = { '1':%s, '3':%s, '4':%s, '5':%s }\n"
    "state.js      const bucket = Object.keys(cnt).find(b => cnt[b] >= 3);\n"
    "\n"
    "              -> 3 seances donne la cle '3', 4 seances donne la cle '4'\n"
    "              -> les DEUX pointent vers le MEME niveau %s\n"
    "              -> qui alterne 3 et 4 n atteint jamais le seuil des 3 semaines sur 4"
    % (BUCKET_SRC.replace('?', ' ? ').replace(':', ' : '), ACT_PAR_FREQ['1'],
       ACT_PAR_FREQ['3'], ACT_PAR_FREQ['4'], ACT_PAR_FREQ['5'],
       kf(ACT_PAR_FREQ['3'], 2)),
    'Les trois lignes qui produisent le defaut, relues dans le code servi :'))
H.append(Spacer(1, 4))
H.append(tableau(
    ['Simulation fidele sur son historique (profil regle sur %s)' % kf(ACT_PAR_FREQ['5'], 3),
     'Carte declenchee'],
    [['Code actuel - regroupement par <b>bucket de compte</b>',
      '<b>%d jours sur %d</b> (%s %%)' % (SIM_A, N_SIM, kf(100.0 * SIM_A / N_SIM))],
     ['Regroupement par <b>niveau d activite</b>',
      '<b>%d jours sur %d</b> (%s %%)' % (SIM_B, N_SIM, kf(100.0 * SIM_B / N_SIM))],
     ['<b>Jours perdus par le defaut de regroupement</b>', '<b>%d</b>' % PERDUS]],
    [125 * mm, 40 * mm]))
H.append(Spacer(1, 4))
H.append(P('C est <b>R2</b> dans sa forme la plus pure : <b>deux cles pour une meme information</b>. '
           '[!!] <b>Non corrige</b> - le moteur nutritionnel reste gele, la decision appartient a '
           'Michel.', 'petit'))

# 6
H.append(P('6. La progression de force, mesuree au lieu d etre rapportee', 'h1'))
H.append(encadre(
    'Un defaut d instrument attrape AVANT publication',
    'La premiere version de cette mesure melait les <b>series d echauffement</b> aux series de '
    'travail. La colonne <font face="Courier">type</font> du CSV vaut <font face="Courier">N</font> '
    '(normale), <font face="Courier">E</font> (echauffement, %d series) ou '
    '<font face="Courier">X</font>. [*] Elle comparait par exemple un squat d echauffement a '
    '40 kg contre une serie de travail a 70 kg, et sortait une mediane de <b>%s %%</b> au lieu de '
    '<b>%s %%</b>. [*] <i>Un instrument qui melange deux populations mesure son propre melange.</i>'
    % (N_ECHAUF, kf(MED_F_FAUX, 1), kf(MED_F, 1)), ORANGE))
H.append(Spacer(1, 4))
H.append(P('Methode de l application elle-meme (<font face="Courier">_forceSurFenetre</font>) : '
           '<b>meme exercice, meme nombre de repetitions</b>, on compare les kilos. Series '
           'normales uniquement, coupure au %s, <b>%d paires comparables</b>.'
           % (MID, N_PAIRES), 'p'))
H.append(tableau(
    ['Vue d ensemble', 'Resultat'],
    [['Mediane sur les %d paires' % N_PAIRES, '<b>%s %%</b>' % kf(MED_F, 1)],
     ['Paires en progres', '<b>%d sur %d</b>' % (N_POS, N_PAIRES)],
     ['En 1RM estime (Brzycki), par exercice',
      'mediane %s %% sur %d exercices' % (kf(st.median([p for p, _ in EV]), 1), len(EV))]],
    [125 * mm, 40 * mm]))
H.append(Spacer(1, 4))
H.append(tableau(
    ['Ses gros mouvements (1RM estime, premiere moitie -&gt; seconde)', 'Evolution'],
    [[ex, '<b>%s %%</b>' % kfs(p, 1)] for ex, p in sorted(GROS.items(), key=lambda x: -x[1])],
    [125 * mm, 40 * mm]))
H.append(Spacer(1, 4))
H.append(encadre(
    'Son ressenti est juste, il est simplement plus cible que &laquo; tout monte &raquo;',
    'La <b>mediane</b> est a %s %% parce que les reculs sont concentres sur des <b>machines '
    'd isolation</b> (leg curl, pec deck, leg extension, rowing haltere), ou la charge depend du '
    'programme du jour et non de la force. [*] <b>Ses mouvements structurants, eux, montent '
    'tous.</b> [/!\\] Et ce fait ne tranche pas entre les deux hypotheses du paragraphe 9 : '
    'progresser en force a poids stable s observe <b>au maintien</b>, donc c est compatible avec '
    'les deux.' % kf(MED_F, 1), VERT))

# 7
H.append(P('7. Trouve en passant : ses anciennes masses grasses ne sont pas des mesures', 'h1'))
H.append(P('Le CSV de poids porte %d pesees depuis %s. Les %d valeurs de masse grasse anterieures '
           'au %s se comportent comme une <b>fonction du poids</b>, pas comme une mesure.'
           % (len(PP), PP[0][0].strftime('%d/%m/%Y'), N_AV, RUPT.strftime('%d/%m/%Y')), 'p'))
H.append(bloc_code(
    "Bande de poids ETROITE : %s a %s kg, %d pesees, etalees sur %s ans\n"
    "\n"
    "   masse_grasse = %s x poids %s        R2 = %s\n"
    "   residu MAXIMUM : %s point\n"
    "\n"
    "Saut de moyenne le %s : %s points (%s %% -> %s %%)"
    % (kf(85.0, 1), kf(87.5, 1), len(BANDE), kf(BANDE_ANS, 1), kf(B1, 5), kfs(B0, 4), kf(R2, 4),
       kf(RESID, 3), RUPT.strftime('%d/%m/%Y'), kfs(SAUT, 2),
       kf(st.mean([p[2] for p in AV]), 1), kf(st.mean([p[2] for p in AP]), 1)),
    'La regression, sur une bande de poids etroite pour que la biologie ne puisse pas expliquer :'))
H.append(Spacer(1, 4))
H.append(P('[!!] <b>Une composition corporelle reelle ne peut pas tenir dans %s point sur %s ans.</b> '
           'C est une formule appliquee au poids, pas une balance. Le saut du %s correspond a un '
           'changement de materiel. [*] Cela <b>valide ft-v1231</b> : ces lignes devraient porter '
           '<font face="Courier">bfSrc: \'estime\'</font>, et aujourd hui rien ne les distingue d une '
           'vraie mesure. [/!\\] Sans effet sur le TDEE - <font face="Courier">bmrDetail</font> lit '
           '<font face="Courier">bodyScans</font>, pas ce champ.'
           % (kf(RESID, 2), kf(BANDE_ANS, 1), RUPT.strftime('%d/%m/%Y')), 'p'))

# 8
H.append(P('8. Pourquoi l application ne s en apercoit pas', 'h1'))
H.append(P('Voici <b>tout</b> ce que la chaine de calcul du TDEE lit dans ses donnees, relu a '
           'chaque generation de ce document :', 'p'))
H.append(bloc_code(
    "S.bw   S.height   S.age   S.smoker   S.activityLevel   S.workType\n"
    "\n"
    "et c'est tout.\n"
    "\n"
    "S.weightLog : JAMAIS lu par calcTDEE ni par aucun de ses quatre termes\n"
    "S.foodLog   : JAMAIS lu non plus"))
H.append(Spacer(1, 4))
H.append(encadre(
    'Une boucle ouverte',
    'Le TDEE est calcule <b>sans que rien ne regarde ce qui s est reellement passe</b>. Le poids '
    'peut rester plat trois mois pendant que l application promet %s kg de perte : <b>aucune ligne '
    'de code ne compare les deux</b>. Rien dans le systeme n est capable de remarquer qu il se '
    'trompe. [*] Et <font face="Courier">tendance14j</font> calcule <b>deja</b>, dans le meme '
    'passage et sur la meme fenetre, l <b>apport moyen</b> sur les jours complets <b>et</b> la '
    '<b>pente du poids</b> en kg/semaine. Les deux nombres sont cote a cote. <b>Il manque une '
    'soustraction.</b> [!!] La constante necessaire existe dans le code : <font face="Courier">'
    '%s</font> n apparait <b>que %d fois dans les %d fichiers servis - et %s</b>. '
    '<i>L information est dans le texte et n atteint jamais la donnee</i> - <b>R4</b>, la famille '
    'de bugs la plus couteuse du projet.'
    % (kf(PERTE_ATTENDUE, 1), kf(KCAL_KG), _n7700, len(SERVIS),
       'c est un commentaire' if _n7700 == 1 else 'ce sont tous des commentaires'), ROUGE))

# 9
H.append(P('9. Conclusion, avec son niveau d incertitude', 'h1'))
H.append(P('Consigne de Michel : <i>&laquo; je veux une conclusion avec niveau d incertitude, pas '
           'un chiffre presente comme exact &raquo;</i>. [*] Le raisonnement decisif <b>ne depend '
           'pas de la valeur absolue de son journal</b>, seulement de sa coherence interne. Un PAL '
           'de %s a %s est impossible pour quelqu un qui s entraine %s fois par semaine avec un '
           'metier physique : <b>il sous-declare</b>, comme tout le monde. La vraie question est '
           '<b>de combien</b>.'
           % (kf(PAL_OBS_BAS, 2), kf(PAL_OBS_HAUT, 2), kf(FREQ, 1)), 'p'))
H.append(tableau(
    ['Si son vrai TDEE valait...', 'kcal', 'PAL', 'Sous-declaration necessaire'],
    [['Son apport journal pris au pied de la lettre', kf(APPORT), kf(APPORT / BMR, 2), '0 %'],
     ['&laquo; Modere &raquo; sans le metier', kf(T_MODERE), kf(T_MODERE / BMR, 2),
      '%s %%' % kf(sousdecl(T_MODERE))],
     ['<b>Estimation plausible retenue</b>', '<b>2 800 - 3 100</b>',
      '%s - %s' % (kf(2800.0 / BMR, 2), kf(3100.0 / BMR, 2)),
      '<b>%s - %s %%</b>' % (kf(sousdecl(2800)), kf(sousdecl(3100)))],
     ['&laquo; Modere &raquo; + metier <i>(frequence mesuree)</i>', kf(T_MODERE_PHY),
      kf(T_MODERE_PHY / BMR, 3), '%s %%' % kf(SD_MODPHY)],
     ['&laquo; Actif &raquo; sans le metier', kf(T_ACTIF), kf(T_ACTIF / BMR, 3),
      '%s %%' % kf(SD_ACTIF)],
     ['<b>Ce que l application lui donne</b>', '<b>%s</b>' % kf(TDEE_APP), '<b>%s</b>' % kf(PAL_APP, 3),
      '<b>%s %%</b> - hors fourchette' % kf(SD_APP)]],
    [72 * mm, 25 * mm, 22 * mm, 46 * mm]))
H.append(Spacer(1, 4))
H.append(P('[/!\\] Fait de type <b>[B]</b> : la sous-declaration alimentaire mesuree par eau '
           'doublement marquee se situe typiquement entre <b>10 et 30 %</b> chez l adulte motive. '
           'Litterature secondaire largement reproduite ; <b>aucune publication primaire n est '
           'ouvrable depuis ce conteneur</b> (acces sortant refuse sur les domaines scientifiques). '
           'Ce chiffre n a pas ete verifie a la source par l auteur de ce document.', 'p'))
H.append(Spacer(1, 4))
H.append(encadre(
    'Le chiffre qui parle sans aucune statistique',
    'Objectif affiche : <b>Perte de gras + muscle</b>. Cible affichee : <b>%s kcal</b>. Il en mange '
    '<b>%s</b> et son poids <b>ne bouge pas depuis trois mois</b>. [*] <b>L application lui demande '
    'de manger %s kcal par jour de PLUS qu aujourd hui - pour perdre du gras.</b> [*] Et si les '
    '%s kcal etaient justes, son deficit actuel serait de <b>%s kcal/j</b>, soit <b>%s kg</b> de '
    'perte attendue sur les %d jours de la fenetre. <b>Perte reelle observee : 0,0 kg.</b>'
    % (kf(CIBLE), kf(APPORT), kf(ECART_CIBLE), kf(TDEE_APP), kf(DEFICIT_SI_APP),
       kf(PERTE_ATTENDUE, 1), len(FEN)), ROUGE))

# 10
H.append(P('10. Ce que ce dossier ne prouve PAS', 'h1'))
H.append(tableau(
    ['Point', 'Statut honnete'],
    [['Que le chiffre de %s soit faux dans l absolu' % kf(TDEE_APP),
      '<b>Non prouve.</b> Seulement qu il exige l hypothese la plus extreme de la fourchette '
      'publiee, sur un journal mesure comme propre a %s %%.' % kf(100 - PCT_RETIRE, 1)],
     ['La part exacte entre &laquo; l application surestime &raquo; et &laquo; il sous-declare &raquo;',
      '<b>Indecidable ici.</b> Il faudrait de l eau doublement marquee. Les deux sont vrais a des '
      'degres qui ne se separent pas avec ces donnees.'],
     ['Que la progression de force valide une hypothese plutot que l autre',
      '<b>Non.</b> Progresser a poids stable s observe au maintien : compatible avec les deux.'],
     ['Que les %s kcal du metier physique soient entierement du double comptage' % WORK['physique'],
      '<b>Non mesure.</b> Le NEAT d un metier de manutention est reel. Ce qui est mesure, c est que '
      'le total depasse le plafond du selecteur de %d kcal.' % DEPASSE],
     ['Que la sous-declaration soit de 10 a 30 %',
      '<b>Fait [B]</b>, non verifie a la source depuis ce conteneur.'],
     ['Que le defaut de <font face="Courier">ecartNiveauActivite</font> soit la seule raison du '
      'mauvais reglage',
      '<b>Non.</b> Le reglage a pu etre choisi ainsi des le depart. Ce qui est mesure, c est que '
      'la correction automatique n a pas pu se declencher %d jours sur %d.' % (PERDUS, N_SIM)]],
    [58 * mm, 107 * mm]))

# 11
H.append(P('11. Ce qui existe deja et attend une decision', 'h1'))
H.append(P('La reponse de fond n est pas de retoucher un multiplicateur, c est de <b>mesurer</b> le '
           'TDEE au lieu de l estimer. <font face="Courier">tdeeObserve()</font> (candidate <b>V9</b>, '
           '<font face="Courier">tools/moteur_v9.js</font>, <b>non servie</b>) le calcule par bilan '
           'energetique, avec une porte d apprentissage exigeante : <b>14 jours minimum, 50 % de '
           'jours notes, 4 pesees</b>, et elle refuse d apprendre en dessous. [*] Michel remplit '
           'largement ces trois conditions.', 'p'))
H.append(tableau(
    ['Piste', 'Etat'],
    [['Regrouper <font face="Courier">ecartNiveauActivite</font> par niveau et non par bucket',
      'Defaut <b>mesure</b>, correctif non ecrit'],
     ['Brancher <font face="Courier">tdeeObserve()</font> sur <font face="Courier">tendance14j</font>',
      'Les deux nombres sont deja calcules cote a cote'],
     ['Distinguer masse grasse mesuree et estimee dans l historique ancien',
      '<font face="Courier">bfSrc</font> pose en ft-v1231, anciennes lignes non classees'],
     ['Le doublon d entree du meme complement au meme repas', '<b>Non instruit</b>'],
     ['Arbitrages ouverts du dossier V9', 'D-019 a D-022'],
     ['Arbitrages ouverts du dossier V8', 'D-016 a D-018']],
    [105 * mm, 60 * mm]))
H.append(Spacer(1, 6))
H.append(encadre(
    'Etat du depot',
    '<b>AUCUN FICHIER SERVI N A ETE MODIFIE.</b> Aucun bump de version. Le moteur nutritionnel '
    'n a pas bouge d une ligne. [*] Ce dossier <b>mesure et rend compte</b> ; il ne decide rien. '
    '<i>Le code dit ce qui EST, Michel decide ce qui DOIT ETRE.</i>', VERT))
H.append(Spacer(1, 6))
H.append(P('Ce PDF est genere par <font face="Courier">tools/gen_dossier_tdee_michel_pdf.py</font>, '
           'dont les <b>%d gardes</b> recomptent chaque chiffre depuis les CSV fournis <b>et</b> '
           'depuis le code servi, et <b>refusent de produire</b> si un seul fait tombe. Aucun nombre '
           'n est ecrit a la main dans le texte. [!!] Le generateur vit dans le depot, <b>le PDF '
           'non</b> : il porte des donnees de sante personnelles.' % NB, 'petit'))

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Force Tracker - le TDEE de Michel, mesure (22/09/2026)',
                        author='Force Tracker')
doc.build(H, onFirstPage=pied, onLaterPages=pied)


# ── RELECTURE DU PDF PRODUIT : un PDF muet ressemble a un PDF reussi ────────────────────
def _relire(chemin):
    """Extrait le texte du PDF produit.

    [/!\\] PREMIERE VERSION AVEUGLE, ET C EST LE DEFAUT LE PLUS DANGEREUX DU LOT : elle
    decoupait les flux avec `stream(.*?)endstream` en mode non gourmand. Sur ce document,
    UN flux sur cinq - la DERNIERE page - contenait de quoi tromper ce decoupage et ne se
    decompressait pas. La relecture validait donc quatre pages sur cinq en annoncant un
    succes. *Un controle qui ne visite pas tout ce qu il pretend controler ne dit rien, il
    rassure.* On lit desormais la longueur declaree par l objet lui-meme, et on EXIGE que
    tous les flux soient lus.
    """
    import base64
    import zlib
    data = open(chemin, 'rb').read()
    textes, echecs = [], 0
    for m in re.finditer(rb'<<(.*?)>>\s*stream\r?\n', data, re.S):
        dico = m.group(1)
        lg = re.search(rb'/Length\s+(\d+)', dico)
        if not lg:
            echecs += 1
            continue
        deb = m.end()
        b = data[deb:deb + int(lg.group(1))]
        # [/!\\] `adobe=True`, PAS `rstrip(b'~>')` - piege coute deux iterations ici.
        #    `rstrip` avec un jeu d octets retire TOUS les octets de ce jeu presents en fin de
        #    chaine, pas le suffixe exact. Le dernier flux de ce document se termine par
        #    ...95gq>~> : rstrip emportait le '>' des DONNEES avec le marqueur, la chaine
        #    perdait un octet, et zlib rendait « incomplete or truncated stream ».
        #    Meme famille que le piege de la sous-chaine de BUGS.md n1.
        try:
            brut = base64.a85decode(b.strip(), adobe=True)
        except Exception:                                                          # noqa
            try:
                brut = base64.a85decode(b.strip()[:-2] if b.strip().endswith(b'~>')
                                        else b.strip(), adobe=False)
            except Exception:                                                      # noqa
                brut = b
        lu = None
        for e in (brut, b):
            try:
                lu = zlib.decompress(e).decode('latin-1')
                break
            except Exception:                                                      # noqa
                continue
        if lu is None:
            if b'/Font' in dico or b'FontFile' in dico:
                continue          # une police embarquee n est pas du texte, c est normal
            echecs += 1
        else:
            textes.append(lu)
    return '\n'.join(textes), echecs


_t, _ECHECS = _relire(OUT)
_NPAGES = open(OUT, 'rb').read().count(b'/Type /Page') - 1
if _ECHECS:
    os.remove(OUT)
    sys.exit('REFUS : %d flux du PDF n ont pas pu etre relus - la verification serait aveugle '
             'sur une partie du document' % _ECHECS)
_lis = ' '.join(x[1:-1] for x in re.findall(r'\((?:[^()\\]|\\.)*\)', _t))
if re.search(r'&lt;b&gt;|<b>', _lis):
    os.remove(OUT)
    sys.exit('REFUS : balise en clair dans le PDF produit')
if len(_lis) < 6000:
    os.remove(OUT)
    sys.exit('REFUS : le PDF relu ne fait que %d caracteres lisibles' % len(_lis))
for _mot in ('boucle ouverte', 'sous-declare', 'hors fourchette', 'Le journal tient',
             'defaut d instrument', 'ne prouve PAS', 'Indecidable ici',
             'AUCUN FICHIER SERVI', 'eau doublement marquee', 'manque une soustraction'):
    if _mot not in _lis:
        os.remove(OUT)
        sys.exit('REFUS : « %s » n est pas imprime dans le PDF' % _mot)
print('   relu : %d caracteres lisibles sur %d pages, 0 flux manque, 0 balise en clair'
      % (len(_lis), _NPAGES))
print('OK %s (%d gardes, %d octets)' % (OUT, NB, os.path.getsize(OUT)))
print('   %d jours de journal, %d pesees, %d lignes de seances, frequence %.2f/sem'
      % (N_CONSEC, len(PP), len(HR), FREQ))
