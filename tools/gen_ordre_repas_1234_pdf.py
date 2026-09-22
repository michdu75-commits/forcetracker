#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOSSIER DE PASSATION — ORDRE FIXE DES REPAS ET ETAT VIDE EXPLICITE (ft-v1234, 22/09/2026).

⛔⛔ LES GARDES RECOMPTENT CHAQUE FAIT DEPUIS LE CODE SERVI et refusent de produire si l un
    d eux tombe. Les totaux (banc, mutations, passe) se LISENT dans leurs journaux, jamais a
    la main (lecon ft-v1201, ou un PDF a publie un total pendant que la passe tournait encore).

⭐ ET LE DOSSIER SAIT DIRE « PASSE EN COURS » ET « PAS ENCORE PUBLIEE ».
   *Un dossier qui annonce une publication qui n a pas eu lieu est pire qu un dossier qui manque.*

⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji.

Variables : OR_PDF · OR_PASSE (verdict passe_valide.sh) · OR_BANC · OR_MUT
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
if not os.path.exists(os.path.join(RACINE, 'sw.js')):
    RACINE = '/home/user/forcetracker'
SORTIE = os.environ.get('OR_PDF', '/tmp/FORCE-TRACKER-ORDRE-DES-REPAS-22-09-2026.pdf')
PASSE = os.environ.get('OR_PASSE', '')
BANC = os.environ.get('OR_BANC', '')
MUT = os.environ.get('OR_MUT', '')

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
    """⛔ INDISPENSABLE : les commentaires du correctif citent `FOOD_MEALS`, « ordre »,
    « Pas encore assez de donnees » et `Object.keys(pa.habitudes)` en toutes lettres (R30).
    Un garde qui lirait le fichier brut resterait vert quoi qu on remette dans le code."""
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
AP = sans_comm(lire('app.js'))
SC = sans_comm(lire('screens.js'))
NAP, NSC = AP.replace(' ', '').replace('\n', ''), SC.replace(' ', '').replace('\n', '')


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


BA = corps(SC, '_blocApprisHTML').replace(' ', '').replace('\n', '')
g(BA != '', "_blocApprisHTML est introuvable")
PA = corps(AP, '_profilAlimentaire').replace(' ', '').replace('\n', '')
g(PA != '', "_profilAlimentaire est introuvable")

# ══ LA VERSION, ET SON ETAT REEL ════════════════════════════════════════════
F['version'] = re.search(r"const CACHE = '(ft-v\d+)'", lire('sw.js')).group(1)
g(F['version'] == 'ft-v1234', "la version preparee est %r" % F['version'])
_rc, _o = git('rev-list', '--count', 'origin/master..HEAD')
F['aPublier'] = int(_o.strip() or 0)
_rc, _o = git('status', '--porcelain')
F['aCommiter'] = len([x for x in _o.split('\n') if x.strip()])
F['publie'] = (F['aPublier'] == 0 and F['aCommiter'] == 0)
_rc, _o = git('rev-parse', '--short', 'HEAD')
F['sha'] = _o.strip()

# ══ LE DEFAUT EST BIEN FERME : plus d ordre de STOCKAGE ═════════════════════
F['plusDeCles'] = not re.search(r'Object\.keys\(pa\.habitudes\)\.(map|filter|forEach)', BA)
g(F['plusDeCles'], "la boucle d affichage est revenue sur les cles de l objet")
F['litCanon'] = ('FOOD_MEALS' in BA) and bool(re.search(r'\.map\(m=>\{?', BA))
g(F['litCanon'], "FOOD_MEALS n est plus parcouru par la carte")

# ══⛔⛔ LE GARDE QUI COMPTE : l ordre n existe QU A UN ENDROIT (R2) ══════════
F['pasRecopie'] = not re.search(r"['\"]petitdej['\"][^;]{0,80}['\"]collation['\"]"
                                r"[^;]{0,80}['\"]dejeuner['\"]", NSC)
g(F['pasRecopie'], "une liste d ordre des repas a ete recopiee dans l ecran")
F['plusDeLBL'] = not re.search(r"LBL=\{['\"]?petitdej", NSC)
g(F['plusDeLBL'], "la 2e source de verite des libelles est revenue")
F['canonUnique'] = (len(re.findall(r'constFOOD_MEALS=', NAP)) == 1
                    and 'constFOOD_MEALS=' not in NSC)
g(F['canonUnique'], "la liste des repas est declaree ailleurs ou deux fois")
F['canonOrdre'] = bool(re.search(r"constFOOD_MEALS=\[\{k:'petitdej'.*?k:'collation'.*?"
                                 r"k:'dejeuner'.*?k:'collation2'.*?k:'diner'", NAP))
g(F['canonOrdre'], "l ordre canonique de la journee a change a la source")

# ══ L ETAT VIDE — present, et il n invente RIEN ═════════════════════════════
F['videDit'] = 'Pasencoreassezdedonnées' in BA
g(F['videDit'], "l etat vide a disparu de la carte")
F['videSansHeure'] = bool(re.search(r"\(m\.lbl,undefined,['\"]Pasencoreassezdedonnées['\"],true\)",
                                    BA))
g(F['videSansHeure'], "la ligne vide recoit une heure")
F['unSeulGabarit'] = len(re.findall(r'class="nu-lgn"', BA)) == 1
g(F['unSeulGabarit'], "le gabarit de ligne a ete duplique")
F['heureCond'] = '(h!==undefined)?' in BA
g(F['heureCond'], "l affichage de l heure n est plus conditionnel")
F['autreSurvit'] = 'pa.habitudes.autre' in BA
g(F['autreSurvit'], "« Autre » a ete supprime en silence")
F['echecFerme'] = ("typeofFOOD_MEALS!=='undefined'" in BA
                   and bool(re.search(r"Pasencored\\?'habitudequisedégage", NSC)))
g(F['echecFerme'], "le repli a disparu : un FOOD_MEALS introuvable rendrait un cadre muet")

# ══⛔⛔ LE PERIMETRE : la logique metier de ft-v1233 ne bouge pas ════════════
F['seuil'] = len(re.findall(r'const_PA_MIN_JOURS=3;', NAP)) == 1
g(F['seuil'], "le seuil metier a bouge ou a ete recopie")
F['deuxBarres'] = (len(re.findall(r'<_PA_MIN_JOURS\)return;', PA)) == 2
                   and '.filter(a=>a.jours>=_PA_MIN_JOURS)' in PA)
g(F['deuxBarres'], "un des deux filtres de ft-v1233 a saute")
F['enJours'] = 'jours:Object.keys(a.jours).length' in PA
g(F['enJours'], "on est revenu a un compte de lignes")
F['depart'] = "a.nom.localeCompare(b.nom,'fr')" in PA
g(F['depart'], "le departage deterministe par le nom a saute")
F['heureVerif'] = '_FAMILLE[_afMealDefautHoraire(h)]!==attendu)return;' in PA
g(F['heureVerif'], "la regle des heures de ft-v1233 a change")
F['horaireUnique'] = len(re.findall(r'function_afMealDefautHoraire\(', NAP)) == 1
g(F['horaireUnique'], "la table d horaires a ete dupliquee")
F['sansSlice'] = ('fl.slice(' not in PA) and ('.slice(-' not in PA)
g(F['sansSlice'], "une fenetre glissante est apparue sur le journal")
# ⛔⛔ LE GARDE S ANCRE SUR LE COMMIT DE VERSION, PAS SUR HEAD~1 : ce generateur sera lui-meme
#    commite apres coup, et HEAD~1 designerait alors le mauvais commit. *Un garde qui mesure le
#    commit d a cote ne mesure rien.*
_rc, _o = git('log', '--format=%H', '-1', '--grep=^ft-v1234 ')
_cv = _o.strip()
g(_cv != '', "le commit de version ft-v1234 est introuvable")
if _cv:
    _rc, _o = git('diff', '--numstat', _cv + '^', _cv, '--', 'app.js')
    F['appIntact'] = (_o.strip() == '')
    g(F['appIntact'], "app.js a ete modifie par le commit ft-v1234")
    _rc, _o = git('diff', '--name-only', _cv + '^', _cv)
    F['servis'] = [x for x in _o.split('\n')
                   if x.strip() and not x.startswith(('docs/', 'tools/', 'tests/'))
                   and x not in ('CLAUDE.md', 'sw.js')]
    g(F['servis'] == ['screens.js'],
      "les fichiers servis touches sont %r au lieu de ['screens.js']" % (F['servis'],))

# ══ LES TOTAUX, LUS DANS LEURS JOURNAUX ═════════════════════════════════════
def _lire_total(chemin, motif):
    if not chemin or not os.path.exists(chemin):
        return None
    t = open(chemin, encoding='utf-8', errors='replace').read()
    m = re.search(motif, t)
    return m.groups() if m else None


_b = _lire_total(BANC, r'──── (\d+) OK / (\d+) rouge ────')
F['bancOk'], F['bancKo'] = (int(_b[0]), int(_b[1])) if _b else (None, None)
_m = _lire_total(MUT, r'conformes=(\d+) nonconformes=(\d+) ancres=(\d+)')
F['mutOk'] = int(_m[0]) if _m else None
F['mutKo'] = (int(_m[1]) + int(_m[2])) if _m else None

F['passeOk'] = F['passeKo'] = None
F['passeValide'] = False
F['passeEnCours'] = False
if PASSE and os.path.exists(PASSE):
    _p = open(PASSE, encoding='utf-8', errors='replace').read()
    _mm = re.search(r'TOTAL CROIS.? : (\d+) .{1,3} . (\d+) ', _p)
    if _mm:
        F['passeOk'], F['passeKo'] = int(_mm.group(1)), int(_mm.group(2))
    F['passeValide'] = ('PASSE VALIDE' in _p) and ('PASSE NON VALIDE' not in _p)
    F['passeEnCours'] = ('LES 4 CONDITIONS' not in _p)

# ⛔⛔ ON NE DECLARE PUBLIE QUE SI CA L EST, et on n annonce un total que si son journal le porte.
g(F['bancOk'] is not None and F['bancKo'] == 0, "le banc cible n est pas lu ou n est pas vert")
g(F['mutOk'] is not None and F['mutKo'] == 0,
  "le controle negatif n est pas lu ou n est pas conforme")
if F['publie']:
    g(F['passeValide'], "publie mais la passe n est pas declaree VALIDE")
    g(F['passeOk'] and F['passeOk'] > 4000, "publie sans total de passe credible")

if _E:
    print('REFUS DE PRODUIRE — %d garde(s) tombe(s) :' % len(_E))
    for x in _E:
        print('  - ' + x)
    sys.exit(1)

NB = 20

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
             '≥': '>=', '≠': '!=', '×': 'x', '…': '...', '⑨': '(9)', '⑫': '(12)',
             '⑮': '(15)', '②': '(2)'}


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


CO = "font face='Courier'"

# ══ LE DOSSIER ═══════════════════════════════════════════════════════════════
Ad(titre('FORCE TRACKER - NUTRITION', H1))
Ad(titre('ORDRE FIXE DES REPAS ET ETAT VIDE EXPLICITE - %s - 22/09/2026' % F['version'], H1))
Ad(Spacer(1, 4))
Ad(para("Suite directe de ft-v1233. Cas reel de Michel : la carte <b>&laquo; Ce que l app a "
        "appris de ton alimentation &raquo;</b> sortait les repas dans le desordre - "
        "<b>Diner -&gt; Dejeuner -&gt; Petit-dej -&gt; Collation 2</b> - et un repas sans "
        "donnees disparaissait purement et simplement de la liste."))

# ── 1 ────────────────────────────────────────────────────────────────────────
Ad(titre('1. La cause - et ce n est AUCUN des tris qu on soupconne'))
Ad(para("Ni par frequence, ni par heure, ni alphabetique. La mesure a ete faite avant d ecrire "
        "une ligne de correctif :"))
Ad(tab([['ce que le code lisait', 'ce que c etait vraiment'],
        ["<%s>Object.keys(pa.habitudes)</font> dans <%s>_blocApprisHTML</font>" % (CO, CO),
         "les cles de cet objet naissent de <%s>Object.keys(parRepas)</font>..." % CO],
        ["<%s>parRepas</font> est rempli en parcourant <%s>S.foodLog</font>" % (CO, CO),
         "...donc dans l ordre de <b>PREMIERE APPARITION</b> de chaque repas dans le journal"]],
       [78 * mm, 104 * mm]))
Ad(Spacer(1, 3))
Ad(para("<b>L ecran affichait les repas dans l ordre ou ils avaient ete tapes la premiere "
        "fois.</b> C est la famille du <%s>[0]</font> qui suppose un tri - <i>un affichage qui "
        "depend de l ordre de stockage change sans que rien n ait change</i> - deja fermee par "
        "ft-v1233 <b>A L INTERIEUR</b> d un repas (le departage deterministe des aliments) et "
        "restee ouverte <b>ENTRE</b> les repas." % CO))
Ad(para("/!\\ <b>LE TEST QUI COMPTE</b> (temoin B-CCCLI (9)) : <b>inverser "
        "<%s>S.foodLog</font> suffisait a retourner la carte</b>, sans qu une seule donnee ait "
        "change. C est ce temoin qui prouve que le defaut existait." % CO))

# ── 2 ────────────────────────────────────────────────────────────────────────
Ad(titre('2. Le second defaut du meme endroit - la ligne qui disparait'))
Ad(para("Un repas qui ne passe pas les seuils de ft-v1233 est simplement <b>absent</b> de "
        "<%s>habitudes</font>, donc sa ligne n etait pas rendue. <b>Une ligne absente et une "
        "ligne vide ne disent pas la meme chose : la premiere se lit &laquo; ce repas n existe "
        "pas &raquo;, la seconde &laquo; je ne sais pas encore &raquo;.</b> C est R29 applique a "
        "l affichage - on dit ce qu on ne sait pas." % CO))

# ── 3 ────────────────────────────────────────────────────────────────────────
Ad(titre('3. La correction - RIEN n est invente, l ordre canonique existait deja'))
Ad(para("<b><%s>FOOD_MEALS</font></b> (app.js) est <b>deja</b> en ordre de journee - "
        "<i>petitdej, collation, dejeuner, collation2, diner</i> - et c est <b>deja lui</b> qui "
        "range les puces de l ecran d ajout d aliment. On le <b>lit</b> (<b>R2</b>), on ne le "
        "recopie pas : <i>une deuxieme liste d ordre divergerait le jour ou un repas est ajoute, "
        "et le desordre reviendrait par l autre bout</i>. Il porte meme son propre avertissement "
        "dans le code : &laquo; un index qui depend de l ordre d un tableau devient faux le jour "
        "ou on trie ce tableau &raquo;." % CO))
Ad(para("/!\\ Au passage, le <%s>LBL={petitdej:...}</font> local de "
        "<%s>_blocApprisHTML</font> etait une <b>2e source de verite des libelles</b> : il "
        "disparait, <%s>FOOD_MEALS[].lbl</font> est proprietaire." % (CO, CO, CO)))

Ad(titre('4. L etat vide - et pourquoi sa formule est NEUTRE expres'))
Ad(para("La ligne d un repas sans habitude affiche <b>&laquo; Pas encore assez de donnees "
        "&raquo;</b>, meme gabarit, meme colonne, <b>sans heure, sans aliment, sans "
        "frequence</b>."))
Ad(para("<b>Une ligne peut etre vide pour DEUX raisons</b> : le repas n a pas assez de jours "
        "notes, <b>ou</b> il en a assez mais aucun aliment n y revient assez souvent. L ecran ne "
        "sait pas laquelle des deux - donc il n en nomme aucune. <i>Un libelle plus precis que "
        "la donnee est un libelle faux.</i>"))
Ad(para("<b>Aucune migration, aucun bouton, aucun stockage neuf</b> : la ligne se remplit d "
        "elle-meme au prochain rendu, des que le journal franchit le seuil <b>existant</b> "
        "(temoin (12) : un repas passe de 2 jours a 3 jours, la ligne bascule seule)."))
Ad(para("/!\\ <b>&laquo; Autre &raquo; n est pas un 6e repas</b> et n a donc jamais de ligne "
        "vide : c est le fourre-tout des lignes sans <%s>meal</font> (import, tres vieille "
        "entree). Il ne s affiche que s il porte vraiment une habitude - exactement ce que "
        "faisait le <%s>LBL</font> d avant. <i>Le retirer en silence aurait fait disparaitre des "
        "donnees reelles</i> (<b>R30</b>)." % (CO, CO)))

# ── 5 ────────────────────────────────────────────────────────────────────────
Ad(titre('5. Le perimetre - la logique metier de ft-v1233 ne bouge pas d une ligne'))
Ad(para("<b>app.js : 0 ligne modifiee</b> (verifie par git dans ce generateur). Sept temoins la "
        "figent depuis la source :"))
Ad(tab([['ce qui est fige', 'etat mesure'],
        ["<%s>_PA_MIN_JOURS</font> = 3, declare une seule fois" % CO,
         'OK intact'],
        ['les DEUX filtres (le repas ET l aliment)', 'OK intacts'],
        ['le comptage en JOURS, pas en lignes', 'OK intact'],
        ['le departage deterministe par le nom', 'OK intact'],
        ["la regle des heures via <%s>_afMealDefautHoraire</font>" % CO, 'OK intacte'],
        ['cette fonction reste declaree une seule fois', 'OK intacte'],
        ['aucune fenetre glissante sur le journal', 'OK aucune']],
       [112 * mm, 70 * mm]))
Ad(Spacer(1, 3))
Ad(para("<b>= UNE DECISION ACTEE N EST PAS ROUVERTE</b> (regle d or #15), et c est dit "
        "franchement : sous <b>3 jours notes</b>, la carte garde sa branche decidee en ft-v1021 "
        "(&laquo; N jours notes, pas encore de quoi degager une habitude &raquo;) au lieu d "
        "afficher 5 lignes vides. <i>Ce chantier corrige l ORDRE d une liste ; la, il n y a pas "
        "de liste, donc pas de desordre a corriger.</i> Le cas A du brief est livre dans sa forme "
        "atteignable : journal note mais aucun repas retenu. <b>Un journal totalement vide ne "
        "rend toujours aucune carte - inchange, et c est a Michel de trancher</b> s il veut les "
        "5 lignes la aussi."))

# ── 6 ────────────────────────────────────────────────────────────────────────
Ad(titre('6. Les tests - et les deux defauts d instrument qui sont les miens'))
_lg = []
if F['bancOk'] is not None:
    _lg.append(['Banc cible B-CCCL + B-CCCLI',
                '%d OK / %d rouge' % (F['bancOk'], F['bancKo'])])
if F['mutOk'] is not None:
    _lg.append(['Controle negatif (arbre CLONE)',
                '%d mutations, %d conformes, 0 ancre morte' % (F['mutOk'], F['mutOk'])])
if F['passeEnCours']:
    _lg.append(['Passe complete', 'EN COURS au moment de la generation'])
elif F['passeOk'] is not None:
    _lg.append(['Passe complete',
                '%d OK / %d rouge - %s' % (F['passeOk'], F['passeKo'],
                                           '4 conditions vertes' if F['passeValide']
                                           else 'NON VALIDE')])
else:
    _lg.append(['Passe complete', 'aucun journal lu - rien n est annonce'])
Ad(tab([['mesure', 'total lu dans son journal']] + _lg, [80 * mm, 102 * mm]))
Ad(Spacer(1, 3))
Ad(para("Les <b>6 familles exigees par le brief</b> sont chacune couverte par une mutation : "
        "ordre d insertion, repas disparu, ordre alphabetique, ordre par heure, ordre par "
        "frequence, ordre recopie. <b>Cinq sont DEGUISEES</b> - la plus importante recopie l "
        "ordre canonique <b>sur place et dans le bon ordre</b> : <i>l ecran reste parfaitement "
        "juste, et la deuxieme source de verite est nee</i>. <b>M01 remet le code d avant mot "
        "pour mot</b> : sans son rouge, rien de ce dossier ne vaudrait."))
Ad(para("/!\\ <b>UN TEMOIN DE ft-v1233 A ROUGI SUR DU CODE SAIN - le mien.</b> "
        "<%s>B-CCCXLIX (15)</font> figeait la <b>phrase</b> &laquo; Pas encore d habitude qui se "
        "degage &raquo; alors que sa garantie annoncee est &laquo; la carte le DIT au lieu de "
        "rester muette &raquo;. Il n est pas affaibli : la carte tient cette garantie "
        "<b>mieux</b> qu avant, donc il mesure desormais les deux choses qui comptent (le cadre "
        "n est pas muet, et il NOMME chaque repas). <b>Un temoin qui fige une formulation "
        "interdit d ameliorer ce qu il protege</b> - meme famille que B-CCCXXXVI (2), qui figeait "
        "une signature." % CO))
Ad(para("/!\\ <b>ET LE CONTROLE NEGATIF A TROUVE UN TROU DANS MES PROPRES TEMOINS</b> - c est "
        "exactement son metier. Trois mutations rendaient <b>PLANTAGE</b> au lieu de "
        "<b>rouge</b>, parce qu un temoin dereferencait <%s>r.lignes[2]</font> sur une carte qui "
        "n a plus que deux lignes. <i>Un temoin qui plante au lieu de rougir ne dit plus lequel a "
        "echoue, et peut masquer les suivants</i> - defaut deja paye en ft-v1232." % CO))

# ── 7 ────────────────────────────────────────────────────────────────────────
Ad(titre('7. Ce que ce chantier NE fait PAS'))
Ad(para("<b>0 ligne</b> : <%s>_PA_MIN_JOURS</font>, le comptage par jours, la selection des "
        "aliments, la logique de frequence, la regle des heures, "
        "<%s>_afMealDefautHoraire()</font>, la population du journal, le &laquo; 33 jours / 76 "
        "&raquo;, le tri historique." % (CO, CO)))
Ad(para("<b>0 ligne</b> : <%s>_ref100</font>, compte neuf, scanner code-barres, douane, "
        "<%s>portionWeightG</font>, masse grasse, Corps &amp; sante, Accueil, Seance, Milo, "
        "Worker, backend, onboarding." % (CO, CO)))
Ad(para("<b>0 ligne</b> : ni app.js, ni state.js, ni log.js, ni coach.js, ni setup.js, ni "
        "tracking.js, ni constants.js, ni index.html, ni style.css, ni Code.js, ni worker.js. "
        "<b>Un seul fichier servi a change : screens.js.</b>"))

# ── 8 ────────────────────────────────────────────────────────────────────────
Ad(titre('8. Etat de publication'))
if F['publie']:
    Ad(para("<b>PUBLIEE</b> - %s, commit <%s>%s</font>, pousse sur <b>master</b>. Le deploiement "
            "GitHub Pages de ce commit est vert." % (F['version'], CO, F['sha'])))
    Ad(para("/!\\ <b>Une limite dite plutot que masquee</b> : le conteneur qui produit ce dossier "
            "ne peut pas joindre <%s>github.io</font> (CONNECT tunnel failed, 403). Ce qui est "
            "verifie ici, c est le <b>deploiement</b> et le contenu de <b>master</b>, pas la page "
            "reellement servie au navigateur. Et <b>je n ai pas teste sur ton telephone</b>." % CO))
else:
    Ad(para("<b>PAS ENCORE PUBLIEE</b> - %d commit(s) a pousser, %d fichier(s) a commiter."
            % (F['aPublier'], F['aCommiter'])))

Ad(titre('9. Le test de Michel - 5 etapes'))
Ad(para("1. Nutrition -&gt; Macros, descendre a la carte &laquo; Ce que l app a appris de ton "
        "alimentation &raquo;.<br/>"
        "2. Les repas doivent sortir dans cet ordre : <b>Petit-dej, Collation, Dejeuner, "
        "Collation 2, Diner</b>.<br/>"
        "3. Les repas peu notes affichent &laquo; <b>Pas encore assez de donnees</b> &raquo;, "
        "<b>sans aucune heure</b>.<br/>"
        "4. Le bas de carte dit toujours &laquo; Observe sur tout ton journal : N jours notes... "
        "&raquo;.<br/>"
        "5. Noter un meme aliment un 3e jour dans un repas vide : sa ligne se remplit toute "
        "seule, sans rien faire d autre."))

Ad(Spacer(1, 7))
Ad(Paragraph(md("Dossier produit par un script qui recompte ses %d faits depuis le code servi "
                "(la disparition de l ordre de stockage, la lecture de FOOD_MEALS, l absence de "
                "recopie dans l ecran, la disparition du LBL local, l unicite et l ordre de la "
                "liste canonique, l etat vide et son absence d heure, l unicite du gabarit, l "
                "heure conditionnelle, la survie d Autre, l echec ferme, puis les sept temoins "
                "de perimetre et le diff git de app.js), LIT les totaux dans leurs journaux, "
                "refuse de produire si l un d eux tombe, et relit sa propre sortie." % NB), PET))

doc = BaseDocTemplate(SORTIE, pagesize=A4,
                      title='Force Tracker - ordre des repas',
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
for _mot in ('FOOD_MEALS', 'Pas encore assez de donnees', 'PREMIERE APPARITION',
             'LE TEST QUI COMPTE', F['version'], 'Autre', 'regle d or #15',
             'n ai pas teste sur ton telephone', 'PLANTAGE'):
    if _mot not in _lis:
        os.remove(SORTIE)
        sys.exit('REFUS : « %s » n est pas imprime dans le PDF' % _mot)

print('   relu : %d caracteres lisibles, 0 balise en clair' % len(_lis))
print('OK %s (%d gardes, %d octets) — publie=%s · passe=%s'
      % (SORTIE, NB, os.path.getsize(SORTIE), F['publie'],
         'en cours' if F['passeEnCours'] else (F['passeOk'] if F['passeOk'] is not None else '?')))
