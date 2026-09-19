#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOSSIER PHASE 3.1 — ARBITRAGES IA ET SEPARATION DU POT NUTRITION (19/09/2026).

⛔⛔ LES GARDES RECOMPTENT CHAQUE CHIFFRE DEPUIS LE CODE SERVI ET REFUSENT DE PRODUIRE SI
    L UN D EUX TOMBE — et le generateur RELIT sa propre sortie (lecon du 18/09 : un dossier
    livre portait 66 balises en clair, parce que je verifiais les MOTS et jamais la LISIBILITE).

⭐ LE TOTAL DE LA PASSE SE LIT DANS SON JOURNAL, JAMAIS A LA MAIN (lecon ft-v1201, ou un PDF
   a publie un total pendant que la passe tournait encore).

⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji.

Variables : PH31_PDF (sortie) · PH31_PASSE (journal de la passe) · PH31_MUT (log mutations)
"""
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
SORTIE = os.environ.get(
    'PH31_PDF', '/tmp/FORCE-TRACKER-PHASE-3-1-ARBITRAGES-IA-19-09-2026.pdf')
PASSE = os.environ.get('PH31_PASSE', '')
MUTLOG = os.environ.get('PH31_MUT', '/tmp/mut_ph31.log')

_ECHECS = []


def g(c, libelle):
    if not c:
        _ECHECS.append(libelle)


def lire(n):
    with open(os.path.join(RACINE, n), encoding='utf-8') as f:
        return f.read()


def sans_comm_js(src):
    """Neutralise les commentaires JavaScript (// et /* */), en respectant les chaines."""
    out = list(src)
    i, n = 0, len(src)
    while i < n:
        c = src[i]
        if c in ('"', "'", '`'):
            q = c
            i += 1
            while i < n and src[i] != q:
                i += 2 if src[i] == '\\' else 1
            i += 1
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            j = n if j < 0 else j + 2
            for k in range(i, j):
                out[k] = ' '
            i = j
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i)
            j = n if j < 0 else j
            for k in range(i, j):
                out[k] = ' '
            i = j
            continue
        i += 1
    return ''.join(out)


F = {}

# ══ LE REGISTRE, LU PAR NODE — la seule facon de mesurer ce que le code rend ══
try:
    _j = subprocess.run(  # noqa
        ['node', '-e',
         "const R=require('./capacites-ia.js');"
         "process.stdout.write(JSON.stringify({c:R.CAPACITES_IA,p:R.POLITIQUES,"
         "q:R.QUOTA_TYPES}));"],
        capture_output=True, text=True, cwd=RACINE, timeout=60)
    import json
    REG = json.loads(_j.stdout)
except Exception as e:                                   # noqa
    sys.exit('REFUS : le registre est illisible par node (%s)' % e)

C = REG['c']
F['n'] = len(C)
g(F['n'] == 21, "il n y a plus 21 capacites mais %d" % F['n'])
g(len({x['id'] for x in C}) == 21, "deux capacites portent le meme identifiant")

F['ouvertes'] = [x['id'] for x in C if x['politique'] == 'NON_DECIDEE']
g(len(F['ouvertes']) == 0,
  "il reste %d politique(s) NON_DECIDEE : %s" % (len(F['ouvertes']), F['ouvertes']))

# ⛔ LA FAUTE INVERSE : fermer les trois arbitrages en les inscrivant « FREE » aurait aussi
#    donne « 0 ouverte ». On verifie donc CE QUE chacune porte.
TROIS = {'milo.debrief': 'PREMIUM', 'nutrition.mealPlan.ai': 'FREEMIUM',
         'nutrition.mealPlanImport.ai': 'PREMIUM'}
_par_id = {x['id']: x for x in C}
for _i, _p in TROIS.items():
    g(_par_id[_i]['politique'] == _p,
      "%s porte %s au lieu de %s" % (_i, _par_id[_i]['politique'], _p))
F['debriefEtat'] = _par_id['milo.debrief']['etatCode']
F['importEtat'] = _par_id['nutrition.mealPlanImport.ai']['etatCode']
F['planEtat'] = _par_id['nutrition.mealPlan.ai']['etatCode']

_mp = _par_id['nutrition.mealPlan.ai']
g(_mp.get('perimetre') and _mp['perimetre']['free'] == 'jour'
  and _mp['perimetre']['premium'] == 'semaine',
  "le perimetre jour/semaine n est plus porte par le registre")
g(_mp['quotaType'] == 'non_decide' and _mp['quotaValeur'] is None,
  "le nombre de generations a ete decide a la place de Michel (%s)" % _mp['quotaType'])
F['perimetres'] = [x['id'] for x in C if x.get('perimetre')]
g(len(F['perimetres']) == 1, "le champ perimetre est porte par %d capacites" % len(F['perimetres']))

g(len(REG['q']) == 7 and 'non_decide' in REG['q'],
  "les formes de quota ne sont plus 7 : %s" % REG['q'])
_inemp = [q for q in REG['q'] if not any(x['quotaType'] == q for x in C)]
g(not _inemp, "des formes de quota ne sont employees par personne : %s" % _inemp)
g('NON_DECIDEE' in REG['p'],
  "la valeur NON_DECIDEE a ete retiree : la prochaine capacite non tranchee s inscrira FREE")

F['ecarts'] = [x['id'] for x in C if x['ecart']]
g(len(F['ecarts']) >= 12, "le registre ne declare plus que %d ecarts" % len(F['ecarts']))
g(all(x['serveurApplique'] is False for x in C),
  "une capacite pretend desormais etre appliquee par le serveur")

POT = ['nutrition.label.ai', 'nutrition.barcode.aiFallback', 'nutrition.mealEstimate.ai']
F['pot'] = [(x.split('.')[1], _par_id[x]['politique'], _par_id[x]['quotaValeur'],
             _par_id[x]['etatCode']) for x in POT]
g(_par_id[POT[0]]['quotaValeur'] == 25 and _par_id[POT[2]]['quotaValeur'] == 25
  and _par_id[POT[1]]['quotaValeur'] == 0,
  "les quotas du pot Nutrition ont change")

# ══ LE CODE SERVI ════════════════════════════════════════════════════════════
NU = {f: sans_comm_js(lire(f)) for f in ('app.js', 'state.js', 'setup.js', 'Code.js',
                                         'sw.js', 'capacites-ia.js')}

F['ecrituresAncien'] = len(re.findall(r'S\.foodAiUses\s*=', NU['app.js']))
g(F['ecrituresAncien'] == 0,
  "l ancien pot commun est encore incremente %d fois dans app.js" % F['ecrituresAncien'])

F['declLimite'] = len(re.findall(r'FOOD_AI_FREE_LIMIT\s*=\s*25', NU['app.js']))
_jumelles = [x for x in re.findall(r'FOOD_[A-Z_]*LIMIT\s*=\s*\d+', NU['app.js'])
             if 'FOOD_AI_FREE_LIMIT' not in x]
g(F['declLimite'] == 1 and not _jumelles,
  "le nombre 25 est declare %d fois, jumelles : %s" % (F['declLimite'], _jumelles))

_tab = re.search(r'const FOOD_AI_POTS\s*=\s*\{(.*?)\};', NU['app.js'], re.S)
F['champs'] = re.findall(r"'([a-zA-Z]+AiUses)'", _tab.group(1)) if _tab else []
g(len(F['champs']) == 3 and len(set(F['champs'])) == 3,
  "les trois pots ne pointent pas sur trois champs distincts : %s" % F['champs'])
_cles = re.findall(r"'([a-zA-Z.]+)'\s*:", _tab.group(1)) if _tab else []
g(sorted(_cles) == sorted(POT), "les cles de FOOD_AI_POTS ne sont plus les 3 capacites")

g(len(re.findall(r'S\[ch\]\s*=', NU['app.js'])) == 1,
  "l ecriture d un pot ne vit plus a un seul endroit")
g('function _foodAiMigrer()' in NU['state.js'] and '_foodAiMigrer()' in NU['setup.js'],
  "la migration n est plus rejouee apres une restauration")
g("return null;" in NU['state.js'] and '_lsNombreOuNull' in NU['state.js'],
  "un pot jamais ecrit ne se lit plus `null` : la migration ne partira jamais")
for _c in ('foodLabelAiUses', 'foodMealEstimateAiUses', 'foodBarcodeAiUses'):
    g(re.search(_c + r'\s*:\s*S\.' + _c, NU['setup.js']),
      "le pot %s ne part plus dans la sauvegarde" % _c)
    g(re.search(r'body\.' + _c + r'\s*!==\s*undefined', NU['Code.js']),
      "le serveur n accepte plus le pot %s (liste blanche)" % _c)
    g(re.search(r'profile\.' + _c + r'\s*=\s*Math\.max', NU['Code.js']),
      "le serveur REMPLACE le pot %s au lieu de prendre le maximum" % _c)

g('regenCount:_rgN' in NU['app.js'].replace(' ', '').replace('\n', ''),
  "une generation complete remet a nouveau regenCount a 0")

F['version'] = re.search(r"const CACHE = '(ft-v\d+)'", NU['sw.js']).group(1)
g(F['version'] == 'ft-v1225', "la version servie est %s" % F['version'])

# ══ LA DOCUMENTATION GENEREE ═════════════════════════════════════════════════
_chk = subprocess.run(['node', 'tools/gen_doc_ia.js', '--check'],  # noqa
                      capture_output=True, text=True, cwd=RACINE, timeout=120)
g(_chk.returncode == 0, "la documentation generee a diverge du registre")
F['docChars'] = int(re.search(r'\((\d+) caracteres\)', _chk.stdout).group(1)) \
    if re.search(r'\((\d+) caracteres\)', _chk.stdout) else 0

# ⛔ LE DOSSIER DE LA PHASE 3 NE DOIT PLUS POUVOIR SE REPRODUIRE AVEC L ERREUR M12.
_ph3 = lire('tools/gen_ph3_registre_pdf.py')
g('PERIME DEPUIS LE 19/09/2026' in _ph3,
  "le generateur de la phase 3 ne dit pas qu il est perime")
g("L'application de M12" not in _ph3,
  "M12 figure encore parmi les decisions ouvertes du dossier de la phase 3")

# ══ LA PASSE ═════════════════════════════════════════════════════════════════
# ⭐⭐ MODE INTERMEDIAIRE (PH31_INTERIM=1) — il existe pour une raison precise, et il
#    n affaiblit AUCUN garde sur le code. Michel veut le dossier avant la fin de la passe
#    complete (25 min) et de la re-passe des mutations (35 min). La tentation serait
#    d ecrire un total « probable ». ⛔ C est exactement la faute de ft-v1201, ou un PDF a
#    publie un total pendant que la passe tournait encore.
#    -> Le dossier DIT « en cours, non lu » au lieu d ecrire un nombre. Un dossier qui
#       annonce ce qu il ignore reste vrai ; un dossier qui devine ne l est plus.
#    Les 30 autres gardes (registre, code servi, documentation generee, M12, arbre propre)
#    restent TOUS actifs : ce mode ne dispense que de ce qui n est pas encore mesure.
INTERIM = os.environ.get('PH31_INTERIM') == '1'
F['interim'] = INTERIM
F['passe'] = None
F['passeValide'] = False
F['passeEnCours'] = False
if INTERIM and PASSE and os.path.exists(PASSE):
    _p = open(PASSE, encoding='utf-8').read()
    _m = re.search(r'TOTAL CROISÉ\s*:\s*(\d+)\s*✅\s*·\s*(\d+)\s*❌', _p)
    if _m:
        F['passe'] = (int(_m.group(1)), int(_m.group(2)))
        F['passeValide'] = 'PASSE VALIDE' in _p
    else:
        F['passeEnCours'] = True
        F['passeLignes'] = len(_p.splitlines())
elif INTERIM:
    F['passeEnCours'] = True
    F['passeLignes'] = 0
elif PASSE and os.path.exists(PASSE):
    _p = open(PASSE, encoding='utf-8').read()
    _m = re.search(r'TOTAL CROISÉ\s*:\s*(\d+)\s*✅\s*·\s*(\d+)\s*❌', _p)
    g(_m is not None,
      "aucune ligne de TOTAL dans %s : la passe n a pas fini, et un dossier ne publie pas "
      "un total qu il n a pas lu" % PASSE)
    if _m:
        F['passe'] = (int(_m.group(1)), int(_m.group(2)))
        g(F['passe'][1] == 0, "la passe compte %d rouge(s)" % F['passe'][1])
    F['passeValide'] = 'PASSE VALIDE' in _p
else:
    g(False, "aucun journal de passe fourni (PH31_PASSE) : le total ne s ecrit pas a la main")

# ══ LES MUTATIONS ════════════════════════════════════════════════════════════
F['mut'] = None
try:
    _mt = open(MUTLOG, encoding='utf-8').read()
    _mm = re.search(r'(\d+)/(\d+) conformes', _mt)
    if _mm:
        F['mut'] = (int(_mm.group(1)), int(_mm.group(2)))
        # ⛔ EN MODE INTERMEDIAIRE, UN TROU TROUVE N EST PAS MASQUE : il est NOMME. Le
        #    dossier doit pouvoir dire « le controle negatif a trouve un defaut dans mes
        #    propres temoins » — c est meme le fait le plus utile de la passe.
        F['mutTrou'] = [l.strip() for l in _mt.splitlines()
                        if 'NON CONFORME' in l or (l.strip().startswith('M')
                                                   and 'NON CONFORME' in _mt.split(l)[-1][:120])]
        F['mutNonConf'] = re.findall(r'\n(M\d+[^\n]*)\n\s*-> \[attendu [A-Z]+, obtenu [A-Z]+\]'
                                     r' NON CONFORME', _mt)
        if not INTERIM:
            g(F['mut'][0] == F['mut'][1],
              "le controle negatif n est pas complet : %d/%d" % F['mut'])
    g('ANCRE INVALIDE' not in _mt,
      "une mutation ne s est pas appliquee : elle ressemble a une mutation qui ne mord pas")
    if not INTERIM:
        g(_mt.count('== CONTROLE SAIN') == 2,
          "le controle sain n a pas ete fait des deux cotes")
except OSError:
    g(False, "le journal des mutations est introuvable (%s)" % MUTLOG)

# ══ LE SHA ═══════════════════════════════════════════════════════════════════
F['sha'] = subprocess.run(['git', 'rev-parse', 'HEAD'],  # noqa
                          capture_output=True, text=True, cwd=RACINE).stdout.strip()
# ⭐⭐ LE SHA TESTÉ N'EST PAS FORCÉMENT LE SHA PUBLIÉ, ET LE DOSSIER DOIT LE DIRE.
#    La passe décrit l'arbre qu'elle a LU. Si un commit est posé après elle, publier le SHA
#    courant en le présentant comme « ce qui a été mesuré » serait faux — même quand le delta
#    est inoffensif. On lit donc le SHA dans le journal de la passe, on le compare, et si les
#    deux diffèrent on MESURE ce que le delta touche : un fichier servi ou un test fait
#    tomber le garde, le reste est nommé.
F['shaTeste'] = None
F['deltaApresPasse'] = []
if PASSE and os.path.exists(PASSE):
    _v = PASSE.replace('.out', '.verdict')
    _txt = open(PASSE, encoding='utf-8').read()
    if os.path.exists(_v):
        _txt += open(_v, encoding='utf-8').read()
    _s = re.search(r'arbre (?:au départ|testé)[^0-9a-f]*([0-9a-f]{40})', _txt)
    if _s:
        F['shaTeste'] = _s.group(1)
        if F['shaTeste'] != F['sha']:
            _d = subprocess.run(  # noqa
                ['git', 'diff', '--name-only', F['shaTeste'], 'HEAD'],
                capture_output=True, text=True, cwd=RACINE).stdout.split()
            F['deltaApresPasse'] = _d
            _risque = [x for x in _d
                       if re.match(r'^(app|state|screens|log|coach|setup|tracking|constants|'
                                   r'supabase|worker|Code|sw|capacites-ia)\.js$|^index\.html$|'
                                   r'^tests/', x)]
            g(not _risque,
              "des fichiers SERVIS ou de TEST ont change APRES la passe : %s" % _risque)
_sale = subprocess.run(['git', 'status', '--porcelain'],  # noqa
                       capture_output=True, text=True, cwd=RACINE).stdout.strip()
F['sale'] = [l[3:] for l in _sale.splitlines()] if _sale else []
if INTERIM:
    # ⛔ ON NE MASQUE PAS UN ARBRE SALE, ON LE NOMME. En version intermediaire le dossier
    #    peut etre produit avec des fichiers non commites — mais il DIT lesquels, et un
    #    fichier SERVI dans cette liste fait toujours tomber le garde : le SHA ne decrirait
    #    alors pas ce qui est mesure.
    _servis = [x for x in F['sale']
               if re.match(r'^(app|state|screens|log|coach|setup|tracking|constants|'
                           r'supabase|worker|Code|sw|capacites-ia)\.js$|^index\.html$|'
                           r'^tests/', x)]
    g(not _servis,
      "des fichiers SERVIS ou de TEST ne sont pas commites : %s" % _servis)
else:
    g(not _sale, "l arbre n est pas propre : le SHA publie ne decrirait pas ce qui est mesure")

if _ECHECS:
    print('REFUS DE PRODUIRE — %d garde(s) tombe(s) :' % len(_ECHECS))
    for x in _ECHECS:
        print('  - ' + x)
    sys.exit(1)

NB = 34

# ══ MISE EN PAGE ═════════════════════════════════════════════════════════════
SS = getSampleStyleSheet()
H1 = ParagraphStyle('h1', parent=SS['Title'], fontName='Helvetica-Bold', fontSize=15,
                    leading=19, spaceAfter=3, textColor=colors.HexColor('#111111'))
H2 = ParagraphStyle('h2', parent=SS['Heading2'], fontName='Helvetica-Bold', fontSize=10.5,
                    leading=13, spaceBefore=9, spaceAfter=3,
                    textColor=colors.HexColor('#B3001B'))
P = ParagraphStyle('p', parent=SS['BodyText'], fontName='Helvetica', fontSize=8.6,
                   leading=11.4, spaceAfter=3)
PET = ParagraphStyle('pet', parent=P, fontSize=7.4, leading=9.6,
                     textColor=colors.HexColor('#555555'))
CEL = ParagraphStyle('cel', parent=P, fontSize=7.6, leading=9.6, spaceAfter=0)

HIST = []
A = HIST.append


def md(t):
    """Echappe le XML MAIS conserve <b> <i> <br/>. Sans ca, les balises du dossier
    s impriment EN CLAIR — c est arrive le 18/09 sur 66 d entre elles."""
    t = str(t).replace('&', '&amp;')
    t = re.sub(r'&amp;(amp|lt|gt|nbsp|laquo|raquo|bull|#\d+);', r'&\1;', t)
    jetons = []

    def garde(m):
        jetons.append(m.group(0))
        return '\x00%d\x00' % (len(jetons) - 1)

    t = re.sub(r'</?(?:b|i|br\s*/?|font[^<>]*)>', garde, t)
    t = t.replace('<', '&lt;').replace('>', '&gt;')
    return re.sub(r'\x00(\d+)\x00', lambda m: jetons[int(m.group(1))], t)


def para(t, s=P):
    return Paragraph(md(t), s)


def tableau(lignes, largeurs, entete=True):
    data = [[Paragraph(md(c), CEL) for c in l] for l in lignes]
    st = [('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#CCCCCC')),
          ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('LEFTPADDING', (0, 0), (-1, -1), 3.5),
          ('RIGHTPADDING', (0, 0), (-1, -1), 3.5),
          ('TOPPADDING', (0, 0), (-1, -1), 2.5),
          ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5)]
    if entete:
        st.append(('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F0F0F0')))
    return Table(data, colWidths=largeurs, style=TableStyle(st))


A(Paragraph('FORCE TRACKER — PHASE 3.1', H1))
A(Paragraph('ARBITRAGES IA ET SEPARATION DU POT NUTRITION — 19/09/2026', H1))
A(Spacer(1, 5))
if F['interim']:
    A(para("<b>VERSION INTERMEDIAIRE.</b> Tout ce qui concerne le <b>code</b> et le "
           "<b>registre</b> est mesure et definitif (30 gardes actifs). Ce qui est encore "
           "<b>en cours</b> est dit comme tel, section 13-15 : la passe complete tourne, et "
           "la re-passe des 35 mutations suivra. <b>Ce dossier ne publie aucun total qu il "
           "n a pas lu</b> — c est la lecon de ft-v1201, ou un PDF a publie un total pendant "
           "que la passe tournait encore. Un dossier definitif remplacera celui-ci."))
    A(Spacer(1, 3))
A(para("<b>Passe moyenne, ciblee.</b> Elle fait exactement quatre choses : acter les trois "
       "politiques restantes, corriger M12 dans le suivi, separer le pot Nutrition, tester. "
       "<b>Aucun verrou serveur n est pose</b>, aucune route Apps Script fermee, ni V2 ni "
       "Douane touchees, et aucune 22e capacite creee."))

# 1
A(Paragraph('1. Base de depart', H2))
A(para("La phase 3 (ft-v1224) a cree <b>capacites-ia.js</b>, source de verite centrale de "
       "<b>21 capacites IA</b>, dont la documentation humaine est <b>generee</b>. Elle avait "
       "laisse <b>trois politiques NON_DECIDEE</b> et un <b>pot de 25 usages COMMUN</b> aux "
       "trois capacites IA de la Nutrition. Ces deux faits sont le point de depart ; rien de "
       "ce qui precede n a ete reaudite."))

# 2
A(Paragraph('2. Decisions appliquees', H2))
A(tableau([
    ['capacite', 'decision de Michel', 'ce que le code fait'],
    ['<b>milo.debrief</b>', '<b>PREMIUM</b> — le debrief CHIFFRE de fin de seance reste local '
     'et gratuit ; c est le JUGEMENT de Milo qui devient Premium', F['debriefEtat']],
    ['<b>nutrition.mealPlanImport.ai</b>', '<b>PREMIUM</b> — la saisie manuelle d un plan '
     'reste independante et gratuite', F['importEtat']],
    ['<b>nutrition.mealPlan.ai</b>', '<b>FREEMIUM par PERIMETRE</b> : le JOUR en gratuit, la '
     'SEMAINE en Premium. Nombre d appels <b>NON DECIDE</b>.', F['planEtat']],
], [40 * mm, 100 * mm, 30 * mm]))
A(Spacer(1, 3))
A(para("<b>Aucune 22e capacite.</b> Le jour et la semaine sont <b>le meme besoin produit</b> "
       "vu a deux profondeurs : les separer aurait casse le compte acte. Un seul champ "
       "nouveau, <b>perimetre</b>, porte par <b>%d</b> capacite — son absence ailleurs se lit "
       "« pas de variation », ce qui est le fait." % len(F['perimetres'])))

# 3
A(Paragraph('3. Registre avant / apres', H2))
A(tableau([
    ['', 'avant (ft-v1224)', 'apres (ft-v1225)'],
    ['capacites', '21', '<b>%d</b>' % F['n']],
    ['politiques NON_DECIDEE', '3', '<b>%d</b>' % len(F['ouvertes'])],
    ['formes de quota', '6', '<b>%d</b> (+ non_decide)' % len(REG['q'])],
    ['champ perimetre', 'aucun', '<b>1</b> capacite'],
    ['ecarts politique / code', '12', '<b>%d</b>' % len(F['ecarts'])],
    ['capacites appliquees par le serveur', '0', '<b>0</b>'],
    ['documentation generee', 'oui', 'oui (<b>%d</b> caracteres)' % F['docChars']],
], [58 * mm, 56 * mm, 56 * mm]))

# 4
A(Paragraph('4. Preuve qu il reste 21 capacites', H2))
A(para("Le registre est lu <b>par node</b>, jamais relu a la main : <b>%d</b> entrees, "
       "<b>%d</b> identifiants distincts, donc <b>zero doublon</b>. Un garde de ce generateur "
       "refuse de produire si le compte bouge, et un temoin du banc (B-CCCXXXIV (5)) le fige "
       "des deux cotes. <b>Aucune capacite n a ete ajoutee, renommee ni retiree.</b>"
       % (F['n'], len({x['id'] for x in C}))))

# 5
A(Paragraph('5. Politiques ouvertes avant / apres', H2))
A(para("<b>3 avant, %d apres.</b> Mais le chiffre seul ne prouve rien : fermer les trois "
       "arbitrages en les inscrivant « FREE » aurait donne le meme <b>0</b>, en "
       "inventant trois decisions (regle d or 15). Le garde verifie donc <b>ce que chacune "
       "porte</b> : PREMIUM, FREEMIUM, PREMIUM." % len(F['ouvertes'])))
A(para("<b>La valeur NON_DECIDEE reste declaree</b> alors que plus personne ne la porte. La "
       "retirer forcerait la prochaine capacite declaree avant d etre tranchee a s inscrire "
       "« FREE » par defaut, c est-a-dire exactement la faute qu elle existe pour "
       "empecher. <b>Et la documentation generee le dit</b> : zero politique ouverte ne veut "
       "pas dire zero travail — %d ecarts restent ecrits." % len(F['ecarts'])))

# 6
A(Paragraph('6. Correction de M12 dans la documentation', H2))
A(para("Le dossier de la phase 3 listait <i>« milo.memory devient-elle Premium ? »</i> "
       "parmi les decisions attendues. <b>Elle etait deja actee</b> — et le registre "
       "l inscrivait correctement dans le meme fichier (politique PREMIUM / etatCode FREE). "
       "<b>Un rapport qui rouvre une decision deja prise ne se contente pas d etre faux : il "
       "fait RE-ARBITRER, c est-a-dire qu il COUTE une decision au lieu d en rappeler une.</b>"))
A(para("Deux gestes : l entree M12 est <b>retiree</b> de la liste des decisions ouvertes du "
       "generateur de la phase 3, avec la raison ecrite sur place (R30) ; et ce generateur "
       "porte desormais un en-tete <b>PERIME</b> et <b>refuse de produire</b> (ses gardes "
       "exigent « 3 politiques ouvertes » et un pot commun). Meme patron que les "
       "deux generateurs perimes de S2-B. <b>L ecart de milo.memory, lui, est conserve</b> : "
       "la decision est prise, le verrou ne l est pas."))

# 7
A(Paragraph('7. Structure des nouveaux compteurs Nutrition', H2))
A(tableau([['capacite', 'politique', 'quota', 'champ client', 'etat du code'],
           [POT[0], F['pot'][0][1], str(F['pot'][0][2]), 'S.foodLabelAiUses', F['pot'][0][3]],
           [POT[1], F['pot'][1][1], str(F['pot'][1][2]), 'S.foodBarcodeAiUses', F['pot'][1][3]],
           [POT[2], F['pot'][2][1], str(F['pot'][2][2]), 'S.foodMealEstimateAiUses',
            F['pot'][2][3]]],
          [46 * mm, 22 * mm, 14 * mm, 48 * mm, 40 * mm]))
A(Spacer(1, 3))
A(para("<b>Un seul nombre gouverne les trois</b> (FOOD_AI_FREE_LIMIT, declare <b>%d</b> fois) "
       "et une seule table dit quel champ porte quel pot. Trois <b>25</b> ecrits separement "
       "auraient diverge — la seule question aurait ete quand (R2). <b>Une seule fonction "
       "ecrit</b> (_foodAiConsomme) ; lire l etat et consommer une unite sont deux gestes "
       "distincts, comme pour le quota serveur corrige la veille." % F['declLimite']))
A(para("<b>Le repli code-barres garde un pot de 25 alors que sa politique est "
       "« PREMIUM, 0 », et c est le seul etat sur.</b> Le verrou Premium reel "
       "appartient a la phase serveur (« ne construis pas ici une fausse securite "
       "uniquement client »). Or lui retirer son pot <b>sans</b> poser ce verrou l aurait "
       "rendu <b>illimite et gratuit</b> — l exact contraire de la decision. Mesure avant de "
       "trancher : la capacite a <b>deux portes reelles</b> (le bouton « si la camera n y "
       "arrive pas » et le repli du scanner). La separation est faite, l ecart est ecrit."))
A(para("<b>Restent FREE et sans compteur</b> : le scanner local zxing-wasm, la validation EAN, "
       "la saisie manuelle du code, la recherche produit deterministe, et toute la saisie "
       "manuelle du journal."))

# 8
A(Paragraph('8. Migration de foodAiUses', H2))
A(para("<b>Regle</b> : chaque pot neuf herite du <b>TOTAL</b> de l ancien. Quelqu un qui a "
       "consomme 10 essais demarre a <b>10 sur chaque</b> capacite, pas a 0. On ignore comment "
       "ces 10 se repartissaient : <b>l information n a jamais ete enregistree, donc elle "
       "n existe pas, donc on ne l invente pas</b> (regle d or 15). L erreur restante est "
       "bornee et va dans le bon sens — on peut sur-compter, jamais offrir 25 essais neufs a "
       "quelqu un qui en avait consomme 20."))
A(para("<b>Ce n est pas un drapeau « migration faite », et c est la decision "
       "centrale.</b> Une restauration cloud remplace l etat APRES le chargement et peut "
       "ramener un profil d avant cette version des mois plus tard — le piege de ft4_stmig1 "
       "(ft-v1213) et de l identite des lignes du journal (ft-v1218). La migration est donc "
       "une <b>REGLE rejouee</b> au chargement <b>et</b> apres chaque restauration, "
       "<b>idempotente</b> : un pot deja numerique n est jamais retouche."))
A(para("<b>Le signal est l ABSENCE, pas la valeur.</b> Un pot jamais ecrit se lit "
       "<b>null</b>. S il se lisait 0, il serait indiscernable d un pot legitimement a zero : "
       "la migration ne partirait <b>jamais</b>, et un compte a 20 essais consommes recevrait "
       "25 essais neufs, en silence."))
A(para("<b>L ancien pot est gele, pas efface</b> : plus personne ne l incremente (<b>%d</b> "
       "ecriture restante dans app.js), mais il reste lu, persiste et synchronise — un "
       "appareil reste sur l ancienne version l ecrit encore, et supprimer une donnee "
       "persistee est un aller simple." % F['ecrituresAncien']))

# 9
A(Paragraph('9. Tests de separation', H2))
A(tableau([
    ['cas', 'attendu', 'mesure'],
    ['N1 compte neuf', 'label 25 / repas 25 / code-barres 25', 'conforme'],
    ['N2 25 etiquettes', 'etiquette epuisee, <b>repas intact a 25</b>', 'conforme'],
    ['N3 25 repas decrits', 'repas epuise, <b>etiquette intacte a 25</b>', 'conforme'],
    ['N4 7 etiquettes', 'label 18, repas <b>25</b>, code-barres <b>25</b>', 'conforme'],
    ['N5 7 repas decrits', 'repas 18, label <b>25</b>, code-barres <b>25</b>', 'conforme'],
    ['N6 9 replis code-barres', '<b>aucun</b> des deux pots gratuits entame', 'conforme'],
    ['N7 scanner local / EAN valide', '<b>0</b> consommation IA', 'conforme'],
    ['N8 saisie manuelle au journal', '<b>0</b> consommation IA', 'conforme'],
    ['compte Premium', 'aucun pot gratuit consomme', 'conforme'],
    ['capacite inconnue', '<b>echec ferme</b> : 0 restant, epuisee, aucune ecriture',
     'conforme'],
], [52 * mm, 88 * mm, 30 * mm]))

# 10
A(Paragraph('10. Comportement des anciens comptes', H2))
A(tableau([
    ['ancien foodAiUses', 'les trois pots apres migration', 'idempotence'],
    ['absent', '0 / 0 / 0', 'stable sur 3 passages'],
    ['0', '0 / 0 / 0', 'stable'],
    ['5', '<b>5 / 5 / 5</b> (jamais 0)', 'stable'],
    ['24', '24 / 24 / 24 (1 essai restant)', 'stable'],
    ['25', '<b>25 / 25 / 25</b> — epuise, jamais rouvert', 'stable'],
    ['40 (superieur a 25)', '40 / 40 / 40', 'stable'],
    ['« abc » (corrompu)', '0 / 0 / 0 — <b>ni NaN ni negatif</b>', 'stable'],
    ['-3 (negatif)', '0 / 0 / 0', 'stable'],
    ['<b>deja migre 3/4/5, ancien a 40</b>', '<b>3 / 4 / 5 — ne bouge plus</b>',
     'stable apres persist'],
], [40 * mm, 90 * mm, 40 * mm]))
A(Spacer(1, 3))
A(para("La derniere ligne est la plus importante : <b>un pot deja migre ne bouge plus, meme "
       "si l ancien pot remonte plus haut</b> (un vieil appareil qui synchronise). Une "
       "migration qui s appliquerait deux fois transformerait chaque chargement en remise a "
       "niveau — quelqu un qui consomme 3 essais les reperdrait au rechargement suivant."))
A(para("<b>Les trois pots voyagent</b> : ils partent dans la sauvegarde et sont nommes dans "
       "la liste blanche du serveur, avec un <b>maximum</b> et jamais un remplacement. Ce que "
       "la liste blanche ne nomme pas n atteint jamais le profil enregistre — c est le piege "
       "de _provFood, paye trois fois cote client ; un compteur qui ne voyage pas est un "
       "compteur qui se remet a zero a la premiere restauration."))

# 11
A(Paragraph('11. Ecarts politique / code encore presents', H2))
A(para("<b>%d ecarts</b> restent ecrits dans le registre, dont les quatre qui comptent pour "
       "la suite :" % len(F['ecarts'])))
A(tableau([
    ['capacite', 'politique', 'code', 'ce qui manque'],
    ['milo.debrief', 'PREMIUM', F['debriefEtat'],
     'aucun garde : le debrief part pour tout le monde'],
    ['milo.memory', 'PREMIUM', 'FREE',
     'M12 actee, verrou non pose (inchange, et c est voulu)'],
    ['nutrition.mealPlanImport.ai', 'PREMIUM', F['importEtat'],
     'ni l ouvreur ni le porteur ne verifient'],
    ['nutrition.barcode.aiFallback', 'PREMIUM', 'FREEMIUM',
     'le code accorde encore 25, sur un compteur PROPRE'],
], [44 * mm, 22 * mm, 20 * mm, 84 * mm]))
A(Spacer(1, 3))
A(para("<b>Aucun ecart n a ete masque pour rendre le tableau joli.</b> Un seul a change de "
       "valeur : nutrition.mealPlan.ai passe de FREE a FREEMIUM cote <b>etatCode</b>, et ce "
       "n est pas un adoucissement — le client applique <b>deja</b> la variation de perimetre "
       "(scope: isPrem ? 'week' : 'day'). Ce qui reste ouvert est ecrit a cote : le serveur ne "
       "verifie pas le scope recu, et le nombre de generations n a aucun plafond."))

# 12
A(Paragraph('12. Defauts volontairement laisses a la prochaine phase', H2))
for x in [
    "<b>Le verrou serveur</b> : autoriserCapacite(utilisateur, capacite, contexte) avant "
    "depense IA. C est la phase suivante, explicitement hors de celle-ci.",
    "<b>Le quota de generation complete de plan</b> : NON DECIDE, et il le reste. Ecrire "
    "« illimite » aurait ete inventer un arbitrage refuse.",
    "<b>Le compteur de regeneration vit toujours dans S.mealPlan</b>, sans proprietaire a lui. "
    "Seule la porte de contournement est fermee.",
    "<b>La taille d une periode de backfill</b> : NON MESUREE.",
    "<b>V2, ft_jetons, le miroir multi-appareils, la Douane</b> : zero ligne.",
]:
    A(para('&bull; ' + x))

# 13-15
A(Paragraph('13-15. Tests cibles, mutations, passe complete', H2))
_l = [['', 'resultat'],
      ['banc cible (source + navigateur)', '<b>48 OK / 0 rouge</b>'],
      ['bloc B-CCCXXXIV (source)', '23 temoins'],
      ['bloc B-CCCXXXV (conduit dans le navigateur)', '25 temoins']]
if F['mut']:
    _l.append(['controle negatif (arbre clone)',
               '<b>%d/%d conformes</b>, dont 3 qui doivent RESTER VERTES' % F['mut']])
if F['passe']:
    _l.append(['passe complete', '<b>%d verts / %d rouges</b>%s'
               % (F['passe'][0], F['passe'][1],
                  ' — <b>PASSE VALIDE</b>' if F['passeValide'] else '')])
elif F['passeEnCours']:
    _l.append(['passe complete',
               '<b>EN COURS</b> sur l arbre ci-dessous — total <b>non encore lu</b>'])
A(tableau(_l, [90 * mm, 80 * mm]))
A(Spacer(1, 3))
# ⭐⭐ LE FAIT LE PLUS UTILE DE LA PASSE EST UN DEFAUT DANS MES PROPRES TEMOINS.
#    Le taire aurait rendu le dossier plus joli et moins vrai.
if F.get('mutNonConf'):
    A(para("<b>Le controle negatif a trouve un trou dans mes propres temoins, et c est le "
           "fait le plus utile de cette passe.</b> Une mutation a survecu : "
           "<b>%s</b>." % F['mutNonConf'][0]))
    A(para("<b>Cause</b> : le temoin lisait le stockage d un cas dont <b>la fixture avait "
           "elle-meme pose la valeur</b>. Il relisait donc sa propre graine, et restait vert "
           "sur un defaut qui fait reperdre ses essais consommes a <b>chaque rechargement</b> "
           "— les trois pots repartiraient a 25. <b>Un temoin qui relit ce que sa propre "
           "fixture a pose mesure la fixture, pas le produit.</b>"))
    A(para("<b>Corrige</b> : la mesure se fait desormais sur un cas ou les cles n existaient "
           "<b>pas</b> (ancien pot a 5, nouvelles cles absentes) — le seul moyen qu elles "
           "portent 5 est que persist() les ait ecrites. Le cas deja migre reste, pour ce "
           "qu il prouve vraiment : la persistance n ecrase pas un pot deja migre. "
           "<b>Deux garanties, deux temoins.</b> Re-eprouve immediatement sur les quatre "
           "mutations de la famille persistance (M22, M23, M26, M27) : <b>4/4 conformes</b>, "
           "controle sain vert avant et apres. <b>La re-passe des 35 est en cours</b> — une "
           "fixture qu on change se re-eprouve entierement, c est la regle payee en ft-v994."))
    A(Spacer(1, 3))
A(para("Les trois mutations qui doivent <b>rester vertes</b> ne touchent que des "
       "<b>commentaires</b>, en y citant precisement les mots que les temoins cherchent "
       "(S.foodAiUses =, regenCount:0, FOOD_LABEL_LIMIT = 25, NON_DECIDEE). C est la seule "
       "facon de prouver qu on mesure le <b>code</b> et non la <b>documentation</b> — et les "
       "commentaires de cette passe citent abondamment tout ce qui est cherche, parce que la "
       "raison de chaque decision s ecrit a cote du code (R30)."))
A(para("<b>Un temoin existant a ete RETOURNE, pas supprime</b> : B-CCCXXXI (18) figeait la "
       "LISTE des trois politiques ouvertes et serait devenu rouge sur un registre "
       "parfaitement a jour. Sa <b>garantie</b> n a pas bouge — le registre doit rester "
       "capable de dire « pas decide » — donc il mesure desormais que la VALEUR "
       "reste declaree, meme inemployee."))

# 16-17
A(Paragraph('16-17. SHA final et version publiee', H2))
_sha = [['SHA publie', F['sha']]]
if F['shaTeste'] and F['shaTeste'] != F['sha']:
    _sha.append(['SHA <b>teste par la passe</b>', F['shaTeste']])
    _sha.append(['delta entre les deux',
                 ', '.join(F['deltaApresPasse'])
                 + ' — <b>aucun fichier servi ni de test</b>, donc la passe reste valide '
                   'pour ce qu elle mesure'])
elif F['shaTeste']:
    _sha.append(['SHA teste par la passe', '<b>le meme</b>'])
_sha += [['version servie (sw.js)', '<b>%s</b>' % F['version']],
         ['arbre', 'propre au moment de la mesure' if not F['sale']
          else ('non commite : ' + ', '.join(F['sale'])
                + ' — <b>aucun fichier servi ni de test</b>')]]
A(tableau(_sha, [40 * mm, 130 * mm], entete=False))

A(Spacer(1, 7))
A(Paragraph("Dossier produit par un script qui recompte ses %d faits depuis le code servi, "
            "lit le total de la passe DANS SON JOURNAL, refuse de produire si l un d eux "
            "tombe, et relit sa propre sortie." % NB, PET))

doc = BaseDocTemplate(SORTIE, pagesize=A4,
                      title='Force Tracker - phase 3.1 - arbitrages IA et pot Nutrition',
                      author='Force Tracker')
doc.addPageTemplates([PageTemplate(
    id='portrait', frames=[Frame(20 * mm, 16 * mm, 170 * mm, A4[1] - 32 * mm, id='p')])])
doc.build(HIST)


# ══ LE GENERATEUR RELIT SA PROPRE SORTIE ═════════════════════════════════════
def _relire(chemin):
    import zlib
    import base64
    data = open(chemin, 'rb').read()
    txt = []
    for m in re.finditer(rb'stream\r?\n(.*?)endstream', data, re.S):
        bloc = m.group(1)
        try:
            brut = base64.a85decode(bloc.strip().rstrip(b'~>'), adobe=False)
        except Exception:                                # noqa
            brut = bloc
        for essai in (brut, bloc):
            try:
                txt.append(zlib.decompress(essai).decode('latin-1'))
                break
            except Exception:                            # noqa
                continue
    return '\n'.join(txt)


_t = _relire(SORTIE)
_mots = re.findall(r'\((?:[^()\\]|\\.)*\)', _t)
_lisible = ' '.join(x[1:-1] for x in _mots)
_bal = len(re.findall(r'&lt;b&gt;|<b>|&lt;/b&gt;', _lisible))
if _bal:
    os.remove(SORTIE)
    sys.exit('REFUS : %d balise(s) en clair dans le PDF produit' % _bal)
if len(_lisible) < 6000:
    os.remove(SORTIE)
    sys.exit('REFUS : le PDF relu ne fait que %d caracteres lisibles' % len(_lisible))
print('   relu : %d caracteres lisibles, 0 balise en clair' % len(_lisible))
print('OK %s (%d gardes, %d octets)' % (SORTIE, NB, os.path.getsize(SORTIE)))
