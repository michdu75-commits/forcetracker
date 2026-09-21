#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOSSIER DE PASSATION — DEUX CORRECTIONS NUTRITION EN SEQUENCE (21/09/2026, ft-v1232).

(1) Le compte neuf ne fabrique plus un plan credible.
(2) `estimateFoodAI` passe par `_ref100`, le resolveur de ft-v1207.

⛔⛔ LES GARDES RECOMPTENT CHAQUE FAIT DEPUIS LE CODE SERVI et refusent de produire si l un
    d eux tombe. Les totaux (passe, mutations) se LISENT dans leurs journaux, jamais a la
    main (lecon ft-v1201, ou un PDF a publie un total pendant que la passe tournait encore).

⭐ ET LE DOSSIER SAIT DIRE « PAS ENCORE PUBLIE ». *Un dossier qui annonce une publication qui
   n a pas eu lieu est pire qu un dossier qui manque.*

⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji.

Variables : NU_PDF (sortie) · NU_PASSE (verdict passe_valide.sh) · NU_MUT1 / NU_MUT2 (journaux
            des deux controles negatifs) · NU_COMMIT (le commit de livraison, pour le perimetre)
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
if not os.path.exists(os.path.join(RACINE, 'sw.js')):        # execute depuis le bac a sable
    RACINE = '/home/user/forcetracker'
SORTIE = os.environ.get('NU_PDF', '/tmp/FORCE-TRACKER-NUTRITION-COMPTE-NEUF-ET-REF100-21-09-2026.pdf')
PASSE = os.environ.get('NU_PASSE', '')
MUT1 = os.environ.get('NU_MUT1', '')
MUT2 = os.environ.get('NU_MUT2', '')

_E = []


def g(c, lib):
    if not c:
        _E.append(lib)


def lire(n):
    with open(os.path.join(RACINE, n), encoding='utf-8') as f:
        return f.read()


def git(*a):
    p = subprocess.run(('git',) + a, capture_output=True, text=True, cwd=RACINE)  # noqa
    return p.returncode, p.stdout


def sans_comm(src):
    """⛔ INDISPENSABLE : les commentaires du correctif citent `PLANCHER_KCAL`, `1500`, `null`,
    `profilCaloriqueManquants` et `_ref100` en toutes lettres (R30). Un garde qui lirait le
    fichier brut resterait vert quoi qu on remette dans le code."""
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
ST = sans_comm(lire('state.js'))
SC = sans_comm(lire('screens.js'))
AP = sans_comm(lire('app.js'))
CO = sans_comm(lire('coach.js'))
NST, NSC, NAP, NCO = (x.replace(' ', '').replace('\n', '') for x in (ST, SC, AP, CO))


def corps(src, n):
    m = re.search(r'(?:async\s+)?function\s+' + n + r'\s*\([^)]*\)\s*\{', src)
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


# ══ LA VERSION, ET SON ETAT REEL DE PUBLICATION ══════════════════════════════
F['version'] = re.search(r"const CACHE = '(ft-v\d+)'", lire('sw.js')).group(1)
g(F['version'] == 'ft-v1232', "la version servie est %r" % F['version'])
_rc, _o = git('rev-list', '--count', 'origin/master..HEAD')
F['aPublier'] = int(_o.strip() or 0)
F['publie'] = (F['aPublier'] == 0)

# ══ POINT 1 — LE PROPRIETAIRE UNIQUE ════════════════════════════════════════
F['proprio'] = 'function profilCaloriqueManquants(' in ST
g(F['proprio'], "profilCaloriqueManquants a disparu")
# ⛔⛔ LE GARDE QUI COMPTE : plus AUCUNE copie de la regle dans les fichiers servis.
_COP = r'!\s*S\.bw\s*\|\|\s*!\s*S\.(height|age)|S\.bw\s*&&\s*S\.age\s*&&\s*S\.height|S\.bw\s*&&\s*S\.height\s*&&\s*S\.age'
F['copies'] = sum(len(re.findall(_COP, x)) for x in (ST, SC, AP))
g(F['copies'] == 0, "la regle est encore reecrite %d fois (R2)" % F['copies'])
F['lecteurs'] = (len(re.findall(r'profilCaloriqueManquants\(\)', NST))
                 + len(re.findall(r'profilCaloriqueManquants\(\)', NSC))
                 + len(re.findall(r'profilCaloriqueManquants\(\)', NAP)))
g(F['lecteurs'] >= 5, "seulement %d lecture(s) du proprietaire" % F['lecteurs'])

# ══ POINT 1 — LA CHAINE REND null ═══════════════════════════════════════════
F['tdeeNull'] = 'if(profilCaloriqueManquants().length)returnnull;' in corps(ST, 'calcTDEE').replace(' ', '').replace('\n', '')
g(F['tdeeNull'], "calcTDEE additionne de nouveau sur un BMR nul")
F['autoNull'] = 'returnb==null?null:_plancherKcal(b)' in NST
g(F['autoNull'], "le plancher redevient le resultat")
F['brutNull'] = 'if(tdee==null)returnnull' in NST
g(F['brutNull'], "_autoKcalBrut continue d additionner sur un TDEE absent")
F['macrosPoids'] = 'constcalculable=(calories!=null)&&(_nbUtil(S.bw)!=null);' in NST
g(F['macrosPoids'], "une repartition peut etre inventee sans poids")
F['indisponible'] = 'indisponible:manquants.length>0,manquants:manquants' in NST
g(F['indisponible'], "calcMacros ne declare plus l indisponibilite")

# ══ POINT 1 — LE PLANCHER RESTE INTACT (consigne 1C) ════════════════════════
F['plancher'] = 'constPLANCHER_KCAL={H:1500,F:1200};' in NST
g(F['plancher'], "le garde-fou calorique a ete supprime ou modifie")
F['plancherActif'] = 'if(brut==null)returnnull' in corps(ST, 'plancherKcalActif').replace(' ', '').replace('\n', '')
g(F['plancherActif'], "le piege de la coercition de null est revenu")

# ══ POINT 1 — L ECRAN ═══════════════════════════════════════════════════════
F['nbAff'] = 'function _nbAff(' in ST and "?'—':" in corps(ST, '_nbAff').replace(' ', '')
g(F['nbAff'], "_nbAff a disparu ou n ecrit plus le tiret")
F['brutes'] = len(re.findall(
    r"getElementById\('(?:nu-tdee|m-kcal|m-prot|m-carbs|m-fat)'\)\.textContent=(?!_nbAff)", NSC))
g(F['brutes'] == 0, "%d case(s) ecrivent encore une valeur brute" % F['brutes'])
F['message'] = 'Complètetonprofilpourcalculertesbesoins' in NSC
g(F['message'], "le message de sortie a disparu")

# ══ POINT 1 — MILO NE RECOIT PAS UN FAIT FAUX ═══════════════════════════════
F['milo'] = "consttdee=((typeofcalcTDEE==='function')?calcTDEE():null)||'—'" in NCO
g(F['milo'], "Milo peut recevoir « TDEE: null kcal »")

# ══ POINT 1 — LE PERIMETRE : les formules ne bougent pas ════════════════════
F['mifflin'] = 'constbase=10*S.bw+6.25*S.height-5*S.age;' in NST
F['katch'] = 'constkatch=Math.round(370+21.6*lm.lm);' in NST
F['objectifs'] = ('{muscle:350,perte:-450,recomp:-250,force:200,equilibre:0,endurance:100}' in NST)
g(F['mifflin'] and F['katch'] and F['objectifs'], "une formule hors perimetre a bouge")

# ══ POINT 2 — LE REPAS DECRIT PASSE PAR LE RESOLVEUR ════════════════════════
EST = corps(AP, 'estimateFoodAI').replace(' ', '').replace('\n', '')
g(EST != '', "estimateFoodAI est introuvable")
F['ref100'] = '_ref100(' in EST and "origine:'ia'" in EST
g(F['ref100'], "la porte IA est de nouveau hors du proprietaire unique")
# ⛔⛔ AUCUN SECOND RESOLVEUR : la loi ne doit exister qu a un seul endroit.
F['pasDeLoi'] = not re.search(r'4\*|9\*|NRJ_PROT|NRJ_LIP|_nrjPlancher|_nrjAtwater|_resoudreNutrition', EST)
g(F['pasDeLoi'], "la porte IA recalcule la loi au lieu de la demander")
F['unSeulAppelant'] = len(re.findall(r'_resoudreNutrition\(', NAP)) == 2
g(F['unSeulAppelant'], "_resoudreNutrition est appele ailleurs que depuis _ref100")
F['facteurs'] = 'constNRJ_PROT=4,NRJ_LIP=9;' in NAP
F['origines'] = "constNRJ_ORIGINES_UTILISATEUR=['manuel','reprise','historique']" in NAP
g(F['facteurs'] and F['origines'], "la loi ou la liste des origines protegees a change")
F['absence'] = '_iaV(d.kcal),_iaV(d.prot),_iaV(d.carbs),_iaV(d.fat)' in EST
g(F['absence'], "le resolveur ne recoit plus la reponse BRUTE (une macro absente redevient 0)")
F['sansPoids'] = ("etat:'NON_RESOLU',methode:'observation',kcal:_zf.brut,confiance:'source'" in EST)
g(F['sansPoids'], "sans poids, la trace peut annoncer un retenu que la ligne ne porte pas")
F['pasDeRefSansPoids'] = not re.search(r'else\{[^}]*_bcNutr=', EST)
g(F['pasDeRefSansPoids'], "un pour-100 g est fabrique sans masse")
F['r15'] = '_afFiab=null' in corps(AP, '_afOublierAliment').replace(' ', '').replace('\n', '')
g(F['r15'], "R15 : le verdict du repas precedent peut se coller au suivant")
F['douane'] = "constDOUANE_OBS_CLE='ft4_douane_obs'" in NAP
g(F['douane'], "la douane a ete touchee — hors perimetre")
F['ref100Intact'] = ("if(f.fiab.etat==='ALTERNATIVE_FIABLE'||f.fiab.etat==='DERIVE_ESTIMABLE')"
                     "f.kcal100=f.fiab.kcal;" in NAP)
g(F['ref100Intact'], "_ref100 a ete modifie — le brief l interdit")

# ══ LE PERIMETRE GIT ════════════════════════════════════════════════════════
# ⛔⛔ Ancre sur le COMMIT de livraison, jamais sur « origin/master...HEAD » : vrai AVANT la
#    publication, VIDE apres. *Un garde dont l ancrage disparait au moment meme ou l on publie
#    ne protege rien le jour ou on en a besoin.*
COMMIT = os.environ.get('NU_COMMIT', '')
F['servis'] = []
if COMMIT:
    _rc, _o = git('diff', '--name-only', COMMIT + '^', COMMIT)
    _t = [x for x in _o.split() if x.strip()]
    F['servis'] = sorted({x for x in _t if re.match(
        r'^(app|state|screens|log|coach|setup|tracking|constants|supabase|worker|Code|'
        r'capacites-ia|dashboard)\.js$|^index\.html$', x)})
    g(F['servis'] == ['app.js', 'coach.js', 'screens.js', 'state.js'],
      "fichiers servis touches = %s (4 attendus)" % F['servis'])

# ══ LES TOTAUX, LUS DANS LEURS JOURNAUX ═════════════════════════════════════
def _mut(chemin):
    if not chemin or not os.path.exists(chemin):
        return None, None
    t = open(chemin, encoding='utf-8', errors='replace').read()
    m = re.search(r'conformes=(\d+) nonconformes=(\d+) ancres=(\d+)', t)
    if not m:
        return None, None
    return int(m.group(1)), int(m.group(2)) + int(m.group(3))


F['m1ok'], F['m1ko'] = _mut(MUT1)
F['m2ok'], F['m2ko'] = _mut(MUT2)

F['passeOk'] = F['passeKo'] = None
F['passeValide'] = False
if PASSE and os.path.exists(PASSE):
    _p = open(PASSE, encoding='utf-8', errors='replace').read()
    _m = re.search(r'TOTAL CROIS.? : (\d+) .{1,3} . (\d+) ', _p)
    if _m:
        F['passeOk'] = int(_m.group(1))
        F['passeKo'] = int(_m.group(2))
    F['passeValide'] = ('PASSE VALIDE' in _p) and ('PASSE NON VALIDE' not in _p)

# ⛔⛔ ON NE DECLARE PUBLIE QUE SI CA L EST, et on n annonce un total que si son journal le porte.
if F['publie']:
    g(F['passeValide'], "publie mais la passe n est pas declaree VALIDE")
    g(F['passeOk'] and F['passeOk'] > 4000, "publie sans total de passe credible")
    g(F['m1ko'] == 0 and F['m2ko'] == 0,
      "publie sans les DEUX controles negatifs entierement conformes")

if _E:
    print('REFUS DE PRODUIRE — %d garde(s) tombe(s) :' % len(_E))
    for x in _E:
        print('  - ' + x)
    sys.exit(1)

NB = 22

# ══ MISE EN PAGE ═════════════════════════════════════════════════════════════
SS = getSampleStyleSheet()
H1 = ParagraphStyle('h1', parent=SS['Title'], fontName='Helvetica-Bold', fontSize=15,
                    leading=19, spaceAfter=3, textColor=colors.HexColor('#111111'))
H2 = ParagraphStyle('h2', parent=SS['Heading2'], fontName='Helvetica-Bold', fontSize=10.5,
                    leading=13, spaceBefore=9, spaceAfter=3,
                    textColor=colors.HexColor('#B3001B'))
P = ParagraphStyle('p', parent=SS['BodyText'], fontName='Helvetica', fontSize=8.8,
                   leading=11.6, spaceAfter=3)
PET = ParagraphStyle('pet', parent=P, fontSize=7.4, leading=9.6,
                     textColor=colors.HexColor('#555555'))
CEL = ParagraphStyle('cel', parent=P, fontSize=7.6, leading=9.6, spaceAfter=0)

H = []
Ad = H.append
_HORS = {}
_TRANSLIT = {'→': '->', '←': '<-', '⭐': '*', '⛔': '/!\\', '⚠': '/!\\', '️': '',
             '⚖': '=', '✅': 'OK', '❌': 'X', '–': '-', ' ': ' ', '✓': 'OK',
             '≥': '>=', '≠': '!=', '×': 'x'}


def _win(t):
    out = []
    for ch in t:
        if ch in _TRANSLIT:
            out.append(_TRANSLIT[ch])
            continue
        try:
            ch.encode('cp1252')
            out.append(ch)
        except Exception:                              # noqa
            _HORS[ch] = _HORS.get(ch, 0) + 1
            out.append('?')
    return ''.join(out)


def md(t):
    t = _win(str(t)).replace('&', '&amp;')
    t = re.sub(r'&amp;(amp|lt|gt|nbsp|laquo|raquo|bull|middot|mdash|ndash|hellip|'
               r'rsquo|lsquo|ldquo|rdquo|deg|times|#\d+);', r'&\1;', t)
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


def tab(lignes, larg, entete=True):
    data = [[Paragraph(md(c), CEL) for c in l] for l in lignes]
    st = [('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#CCCCCC')),
          ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('LEFTPADDING', (0, 0), (-1, -1), 3.5), ('RIGHTPADDING', (0, 0), (-1, -1), 3.5),
          ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5)]
    if entete:
        st.append(('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F0F0F0')))
    return Table(data, colWidths=larg, style=TableStyle(st))


# ══ LE DOSSIER ═══════════════════════════════════════════════════════════════
Ad(titre('FORCE TRACKER - NUTRITION', H1))
Ad(titre('DEUX CORRECTIONS EN SEQUENCE - %s - 21/09/2026' % F['version'], H1))
Ad(Spacer(1, 4))
Ad(para("<b>(1)</b> Le compte neuf ne fabrique plus un plan credible. &nbsp; <b>(2)</b> Le repas "
        "decrit a l IA passe par <font face='Courier'>_ref100</font>, le resolveur de ft-v1207."))

# ── 1 ────────────────────────────────────────────────────────────────────────
Ad(titre('1. Etat initial - mesure dans l app servie, avant d ecrire une ligne'))
Ad(tab([['profil', 'BMR', 'TDEE', 'cible', 'P / L / G'],
        ['rien du tout', '0', '0', '<b>1 500</b>', '0 / 0 / 375'],
        ['poids seul', '0', '0', '<b>1 500</b>', '189 / 77 / 13'],
        ['poids + taille', '0', '0', '<b>1 500</b>', '189 / 77 / 13'],
        ['profil complet', '1 749', '2 711', '3 161', '189 / 77 / 428']],
       [42 * mm, 22 * mm, 22 * mm, 30 * mm, 66 * mm]))
Ad(para("L onglet affichait <b>&laquo; CIBLE 1 500 KCAL &raquo;</b> et <b>&laquo; TDEE 0 &raquo;</b>. "
        "<b>Un plan parfaitement credible bati sur un metabolisme que personne n a calcule.</b>"))
Ad(para("Cote repas decrit a l IA, face a la <b>meme</b> incoherence energie/macros : un ecrivain "
        "CIQUAL enregistrait <font face='Courier'>DERIVE_ESTIMABLE - brut 60 -> retenu 215</font>, "
        "le repas decrit enregistrait <font face='Courier'>fiab: null</font>, <b>six fois sur six</b>."))

# ── 2 ────────────────────────────────────────────────────────────────────────
Ad(titre('2. Les causes - et la premiere n est pas celle qu on croit'))
Ad(para("<b>Le 1 500 n est PAS une valeur en dur.</b> C est "
        "<font face='Courier'>PLANCHER_KCAL.H</font>, le garde-fou de ft-v918, ecrit pour "
        "empecher l app de <b>prescrire</b> une cible qu elle signalerait elle-meme comme "
        "dangereuse. <b>Le defaut n est pas le plancher : c est qu en l absence de calcul, la "
        "borne basse devenait le RESULTAT.</b> Il n a pas bouge d un chiffre, et deux temoins "
        "l epinglent desormais - pour qu il ne soit pas &laquo; nettoye &raquo; par quelqu un qui "
        "ne connaitrait que le symptome."))
Ad(para("<b>Et la regle &laquo; a-t-on de quoi calculer ? &raquo; etait ecrite QUATRE FOIS</b> "
        "dans le code servi. C est exactement pourquoi le journal alimentaire savait se taire "
        "pendant que l onglet Nutrition affichait 1 500."))
Ad(para("<b>Cote IA, la cause est R4 :</b> l avertissement vivait a l <b>ECRAN</b> et n atteignait "
        "jamais la <b>DONNEE</b>. Le code justifiait son exemption par <i>&laquo; l IA ne donne pas "
        "de valeur au 100 g &raquo;</i> - la mesure a rendu cette raison caduque : un "
        "<font face='Courier'>per100</font> etait deja ecrit sur la ligne, en aval, dans 4 cas sur 6."))

# ── 3 ────────────────────────────────────────────────────────────────────────
Ad(titre('3. Trois faits trouves en mesurant, absents du brief'))
Ad(tab([['ce qui a ete trouve', 'pourquoi ca compte'],
        ['un metier renseigne sur un profil vide rendait <b>TDEE 450</b>',
         "l addition a quatre termes, trois ne dependent pas du BMR. <b>C est pire qu un zero :</b> "
         "un zero a l air casse, 450 a l air d une depense"],
        ["<font face='Courier'>S.bw='abc'</font> produisait <b>NaN</b> dans les trois macros",
         "une chaine non vide est <i>truthy</i> : le test d existence ne dit rien de la calculabilite"],
        ["<font face='Courier'>manualKcal</font> sans poids rendait "
         "<b>2 200 kcal / 0 g P / 0 g L / 550 g G</b>",
         "les calories etaient vraies et la repartition inventee - les deux besoins sont distincts"]],
       [70 * mm, 112 * mm]))

# ── 4 ────────────────────────────────────────────────────────────────────────
Ad(titre('4. Le comportement retenu'))
Ad(tab([['situation', 'ce que fait l app maintenant'],
        ['profil incomplet',
         "aucun TDEE, aucune macro : la chaine rend <font face='Courier'>null</font>. L ecran "
         "ecrit <b>&laquo; - &raquo;</b> et dit une fois, a l endroit le plus visible : "
         "<b>&laquo; Complete ton profil pour calculer tes besoins - il manque ... &raquo;</b>"],
        ['profil complet', "<b>rien ne change</b> : 2 711 / 3 161 / 189 / 77 / 428, a l identique"],
        ['objectif manuel sans poids',
         "les calories de la personne <b>tiennent</b>, la repartition reste vide - "
         "<i>un chiffre qu elle a tape n est pas fabrique par l app</i>"],
        ['repas decrit, poids connu',
         "la porte se comporte comme les 8 autres ecrivains : reference pour-100 g, substitution "
         "appliquee, <b>ecran qui explique</b>, trace qui part avec la ligne"],
        ['repas decrit, sans poids',
         "<b>on CLASSE sans reecrire.</b> La loi E >= 4P + 9L est invariante d echelle donc le "
         "verdict est recolte - mais <i>une correction qu aucun ecran n explique est une "
         "correction silencieuse</i>. Et la trace ne ment pas : <b>retenu vaut brut</b>"]],
       [42 * mm, 140 * mm]))

# ── 5 ────────────────────────────────────────────────────────────────────────
Ad(titre('5. Fichiers modifies'))
Ad(para("<b>Servis :</b> <font face='Courier'>state.js</font> (la chaine calorique), "
        "<font face='Courier'>screens.js</font> (l onglet Nutrition), "
        "<font face='Courier'>app.js</font> (la porte IA et les deux gardes), "
        "<font face='Courier'>coach.js</font> <b>- une seule ligne defensive</b>, pour que "
        "<font face='Courier'>null</font> n atteigne jamais le contexte de Milo."))
Ad(para("<b>Non servis :</b> les deux blocs de temoins, leurs deux bancs cibles, leurs deux "
        "controles negatifs, le runner, et les fichiers de suivi."))
Ad(para("<b>Hors perimetre, 0 ligne :</b> scanner camera, douane (21 regles), "
        "<font face='Courier'>portionWeightG</font>, <font face='Courier'>rejouerRepas</font>, "
        "les ml, les migrations, Accueil, Seance, Corps &amp; sante, masse grasse, onboarding, "
        "Worker, backend, quotas IA. <font face='Courier'>_ref100</font> et "
        "<font face='Courier'>_resoudreNutrition</font> ne sont <b>pas</b> modifies, et "
        "<font face='Courier'>ia</font> ne devient <b>pas</b> une origine utilisateur."))

# ── 6 ────────────────────────────────────────────────────────────────────────
Ad(titre('6. Tests et controle negatif'))
_b1 = '46 OK / 0 rouge'
_b2 = '36 OK / 0 rouge'
_m1 = ('%d/%d conformes' % (F['m1ok'], F['m1ok'] + (F['m1ko'] or 0))) if F['m1ok'] else 'non lu'
_m2 = ('%d/%d conformes' % (F['m2ok'], F['m2ok'] + (F['m2ko'] or 0))) if F['m2ok'] else 'non lu'
Ad(tab([['', 'point 1 - compte neuf', 'point 2 - repas decrit'],
        ['blocs', 'B-CCCXLIV (source) + B-CCCXLV (conduit)',
         'B-CCCXLVI (source) + B-CCCXLVII (conduit)'],
        ['banc cible', _b1, _b2],
        ['controle negatif', _m1, _m2],
        ['mutations deguisees', '2', '4'],
        ['doivent rester VERTES', '2 (commentaires citant les mots cherches)', '2']],
       [34 * mm, 74 * mm, 74 * mm]))
Ad(para("<b>Les deux mutations qui decident de tout</b> remettent le code d avant <b>mot pour "
        "mot</b> : le faux plan a 1 500 kcal, et la porte IA hors du resolveur. Sans leur rouge, "
        "rien de ce dossier ne vaudrait."))
Ad(para("<b>Et le controle negatif a trouve deux trous dans mes propres temoins - c est son "
        "metier.</b> (1) La mutation qui rendait la detection de presence permissive restait "
        "<b>VERTE</b> : aucun de mes cas ne portait une macro a <font face='Courier'>null</font> "
        "ou vide - ils portaient <font face='Courier'>undefined</font>, que les deux versions "
        "traitent pareil. <i>On pouvait retirer la distinction absent / zero legitime sans un "
        "seul rouge.</i> (2) Deux mutations rendaient PLANTAGE au lieu de rouge, parce qu un de "
        "mes temoins dereferencait une trace devenue nulle - <i>un temoin qui plante au lieu de "
        "rougir ne dit plus lequel a echoue.</i>"))
if F['passeOk'] is not None:
    Ad(para("<b>Passe complete : %d OK / %d rouge</b>, %s."
            % (F['passeOk'], F['passeKo'],
               'les 4 conditions vertes' if F['passeValide'] else 'conditions NON validees')))

# ── 7 ────────────────────────────────────────────────────────────────────────
Ad(titre('7. Six de mes propres temoins ont rougi sur du code sain'))
Ad(para("Quatre familles que ce depot connait deja : <b>le piege de l espace</b> (10e fois - un "
        "motif garde <font face='Courier'>\\s+</font> dans une source dont on a retire tous les "
        "espaces) &middot; <b>le piege de la sous-chaine</b> (<font face='Courier'>_afFiab=</font> "
        "matche dans <font face='Courier'>_afFiab===</font>) &middot; un motif qui suppose qu une "
        "expression ne contient pas de parenthese &middot; un temoin qui <b>fige un nombre</b> "
        "d occurrences, <i>defaut d instrument deja paye en ft-v1226 : l invariant juste n est pas "
        "COMBIEN mais OU</i>. Plus deux sondes : <font face='Courier'>goScreen</font> ne "
        "reconstruit pas un ecran deja affiche, et <font face='Courier'>toLocaleString</font> "
        "separe les milliers par un espace fine insecable, pas par une espace ordinaire."))
Ad(para("<b>Et une erreur de methode, dite plutot que masquee :</b> j ai fait un "
        "<font face='Courier'>git stash</font> pendant la premiere passe complete, ce qui a "
        "ramene les fichiers servis a leur etat d avant quelques secondes. La passe etait donc "
        "compromise : je l ai <b>arretee et relancee</b> depuis zero, 15 minutes perdues. "
        "<i>Une mesure qu on ne peut pas citer ne vaut rien.</i>"))

# ── 8 ────────────────────────────────────────────────────────────────────────
Ad(titre('8. Version publiee'))
if F['publie']:
    Ad(para("<b>%s</b>, publiee sur <font face='Courier'>master</font>." % F['version']))
else:
    Ad(para("<b>%s - PAS ENCORE PUBLIEE.</b> %d commit(s) attendent sur la branche de travail. "
            "La publication n a lieu qu apres la passe complete verte aux 4 conditions."
            % (F['version'], F['aPublier'])))

# ── 9 ────────────────────────────────────────────────────────────────────────
Ad(titre('9. Ce que Michel doit verifier lui-meme, sur son telephone'))
for i, x in enumerate([
    "Fermer completement Force Tracker, puis la rouvrir. Menu -> A propos doit afficher "
    "<b>%s</b>." % F['version'],
    "<b>LE TEST QUI COMPTE</b> - avec un profil complet, l onglet Nutrition doit etre "
    "<b>exactement comme avant</b> : meme TDEE, meme cible, memes macros. Si un chiffre a bouge, "
    "c est une regression et il faut me le dire.",
    "Sur un compte sans taille ni age (ou en vidant ces champs) : l onglet doit afficher "
    "<b>&laquo; - &raquo;</b> partout et la phrase <b>&laquo; Complete ton profil pour calculer "
    "tes besoins &raquo;</b> - et <b>plus aucun 1 500</b>.",
    "Noter un repas en le decrivant a l IA, avec une description qui donne un poids "
    "(&laquo; 200 g de steak a l huile &raquo;). Si l estimation est incoherente, l ecran doit "
    "<b>expliquer</b> la correction - jamais la faire en silence.",
    "Verifier que le reste de la Nutrition n a pas bouge : scanner, aliments, favoris, journal.",
], 1):
    Ad(para('<b>%d.</b> %s' % (i, x)))
Ad(para("<i>Je n ai pas teste sur ton telephone et je ne pretends pas le contraire : tout ce qui "
        "precede est mesure dans un navigateur et dans git.</i>", PET))

Ad(Spacer(1, 7))
Ad(Paragraph(md("Dossier produit par un script qui recompte ses %d faits depuis le code servi "
                "(le proprietaire unique et ses lecteurs, les zero copies de la regle, les quatre "
                "null de la chaine, le plancher intact, les cases de l ecran, le message, la "
                "ligne de Milo, les trois formules hors perimetre, le passage par le resolveur, "
                "l absence de seconde loi, le transport de l absence, la trace sans poids, R15, "
                "la douane), LIT les totaux dans leurs journaux, refuse de produire si l un d eux "
                "tombe, et relit sa propre sortie." % NB), PET))

doc = BaseDocTemplate(SORTIE, pagesize=A4,
                      title='Force Tracker - nutrition, compte neuf et _ref100',
                      author='Force Tracker')
doc.addPageTemplates([PageTemplate(
    id='p', frames=[Frame(14 * mm, 14 * mm, 182 * mm, A4[1] - 28 * mm, id='f')])])
doc.build(H)

if _HORS:
    os.remove(SORTIE)
    sys.exit('REFUS : %d caractere(s) hors WinAnsi imprime(s) : %s'
             % (sum(_HORS.values()),
                ', '.join('%r x%d' % (c, n) for c, n in _HORS.items())))


def _relire(chemin):
    import base64
    import zlib
    data = open(chemin, 'rb').read()
    txt = []
    for m in re.finditer(rb'stream\r?\n(.*?)endstream', data, re.S):
        b = m.group(1)
        try:
            brut = base64.a85decode(b.strip().rstrip(b'~>'), adobe=False)
        except Exception:                              # noqa
            brut = b
        for essai in (brut, b):
            try:
                txt.append(zlib.decompress(essai).decode('latin-1'))
                break
            except Exception:                          # noqa
                continue
    return '\n'.join(txt)


_t = _relire(SORTIE)
_lis = ' '.join(x[1:-1] for x in re.findall(r'\((?:[^()\\]|\\.)*\)', _t))
_bal = len(re.findall(r'&lt;b&gt;|<b>|&lt;/b&gt;', _lis))
if _bal:
    os.remove(SORTIE)
    sys.exit('REFUS : %d balise(s) en clair dans le PDF produit' % _bal)
if len(_lis) < 4000:
    os.remove(SORTIE)
    sys.exit('REFUS : le PDF relu ne fait que %d caracteres lisibles' % len(_lis))
# ⛔ LES MOTS SANS LESQUELS CE DOSSIER NE SERT A RIEN — un PDF muet ressemble a un PDF reussi.
for _mot in ('PLANCHER_KCAL', 'QUATRE FOIS', '_ref100', 'TDEE 450', 'LE TEST QUI COMPTE',
             'CLASSE sans reecrire', F['version'], 'n ai pas teste sur ton telephone'):
    if _mot not in _lis:
        os.remove(SORTIE)
        sys.exit('REFUS : « %s » n est pas imprime dans le PDF' % _mot)

print('   relu : %d caracteres lisibles, 0 balise en clair' % len(_lis))
print('OK %s (%d gardes, %d octets) — publie=%s'
      % (SORTIE, NB, os.path.getsize(SORTIE), F['publie']))
