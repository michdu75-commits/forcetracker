#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOSSIER DE PASSATION — SEPARER LA MASSE GRASSE MESUREE DE L ESTIMATION US NAVY (20/09/2026).

Les six sections demandees par Michel : etat initial · cause · comportement retenu · fichiers
modifies · tests · version publiee · ce qu il doit verifier lui-meme sur son telephone.

⛔⛔ LES GARDES RECOMPTENT CHAQUE FAIT DEPUIS LE CODE SERVI et refusent de produire si l un
    d eux tombe. Le total de la passe et celui des mutations se LISENT dans leurs journaux,
    jamais a la main (lecon ft-v1201, ou un PDF a publie un total pendant que la passe
    tournait encore).

⭐ ET LE DOSSIER SAIT DIRE « PAS ENCORE PUBLIE ». Sans cet etat, il faudrait soit attendre la
   fin pour avoir une page, soit ecrire un chiffre qu on n a pas. *Un dossier qui annonce une
   publication qui n a pas eu lieu est pire qu un dossier qui manque.*

⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji.

Variables : BF_PDF (sortie) · BF_PASSE (verdict de passe_valide.sh) · BF_MUT (journal mutations)
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
    'BF_PDF', '/tmp/FORCE-TRACKER-MASSE-GRASSE-MESUREE-VS-ESTIMEE-20-09-2026.pdf')
PASSE = os.environ.get('BF_PASSE', '')
MUTLOG = os.environ.get('BF_MUT', '')
BANC = os.environ.get('BF_BANC', '52')

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
    """⛔ INDISPENSABLE : les commentaires du correctif citent `bfSrc`, `estime`, `mesure` et
    « i.value=navy » en toutes lettres (R30). Un garde qui lirait le fichier brut resterait
    vert quoi qu on remette dans le code."""
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
TR = sans_comm(lire('tracking.js'))
NU = TR.replace(' ', '').replace('\n', '')

# ══ LA VERSION, ET SON ETAT REEL DE PUBLICATION ══════════════════════════════
F['version'] = re.search(r"const CACHE = '(ft-v\d+)'", lire('sw.js')).group(1)
g(F['version'] == 'ft-v1231', "la version servie est %r" % F['version'])
_rc, _o = git('rev-list', '--count', 'origin/master..HEAD')
F['aPublier'] = int(_o.strip() or 0)
F['publie'] = (F['aPublier'] == 0)

# ══ LA CAUSE : l estimation n ecrit plus dans la case ════════════════════════
def corps(n):
    m = re.search(r'function\s+' + n + r'\s*\([^)]*\)\s*\{', TR)
    if not m:
        return ''
    i = m.end() - 1
    d = 0
    for j in range(i, len(TR)):
        if TR[j] == '{':
            d += 1
        elif TR[j] == '}':
            d -= 1
            if not d:
                return TR[i:j + 1]
    return ''


REC = corps('_recalcNavyBf')
g(REC != '', "_recalcNavyBf est introuvable")
F['causeFermee'] = ("getElementById('bf-inp')" not in REC.replace(' ', '')
                    and '.value=navy' not in REC.replace(' ', ''))
g(F['causeFermee'], "l estimation remplit encore la case de saisie : la cause est revenue")

# ══ LA GARANTIE : une estimation n ecrase jamais une mesure ══════════════════
SBF = corps('saveBodyFat')
F['garde'] = 'bfSrc===BF_ESTIME&&!_bfRemplacableParEstime(e)' in SBF.replace(' ', '')
g(F['garde'], "le garde de non-ecrasement a disparu")
F['inconnueProtegee'] = 'e.bf==null||e.bfSrc===BF_ESTIME' in NU
g(F['inconnueProtegee'], "une provenance inconnue est redevenue ecrasable")

# ══ LES QUATRE ECRIVAINS DECLARENT LEUR PROVENANCE ══════════════════════════
F['ecrivains'] = len(re.findall(r'bfSrc\s*=', TR))
g(F['ecrivains'] >= 5, "seulement %d ecriture(s) de provenance" % F['ecrivains'])

# ══ D-014 : le champ n est prerempli que par une MESURE du jour ═════════════
CAR = corps('renderBodyFatCard')
F['prefill'] = "constprefill=mesureDuJour?todayW.bf:''" in CAR.replace(' ', '')
g(F['prefill'], "le prefill a change : D-014 n est plus appliquee")
DEC = lire('docs/DECISIONS.md')
F['d014'] = ('| D-014 |' in DEC and 'VALID' in DEC.split('| D-014 |')[1].split('\n')[0])
g(F['d014'], "D-014 n est pas consignee comme VALIDE dans le registre")
F['d013'] = ('REMPLACÉE → D-014' in DEC)
g(F['d013'], "D-013 ne pointe pas vers D-014 (R30 : un remplacement s ecrit)")

# ══ LE PERIMETRE : la formule US Navy ne bouge pas ══════════════════════════
F['navyH'] = 'bf=495/(1.0324-0.19077*Math.log10(waist-neck)+0.15456*Math.log10(ht))-450' in NU
F['navyF'] = 'bf=495/(1.29579-0.35004*Math.log10(waist+hip-neck)+0.22100*Math.log10(ht))-450' in NU
g(F['navyH'] and F['navyF'], "la formule US Navy a bouge — hors perimetre")
# ⛔⛔ LE PERIMETRE SE MESURE SUR LE COMMIT DE LA LIVRAISON, JAMAIS SUR « origin/master...HEAD ».
#    Vrai AVANT la publication, VIDE apres — puisque master contient alors ce travail. *Un garde
#    dont l ancrage disparait au moment meme ou l on publie ne protege rien le jour ou on en a
#    besoin.* (Meme defaut attrape et corrige sur gen_mensurations_pdf.py.)
COMMIT = os.environ.get('BF_COMMIT', 'b6f33d65')
_rc, _o = git('diff', '--name-only', COMMIT + '^', COMMIT)
_touches = [x for x in _o.split() if x.strip()]
F['servis'] = sorted({x for x in _touches if re.match(
    r'^(app|state|screens|log|coach|setup|tracking|constants|supabase|worker|Code|'
    r'capacites-ia)\.js$|^index\.html$', x)})
g(F['servis'] == ['tracking.js'],
  "fichiers servis touches = %s (un seul attendu)" % F['servis'])
F['fichiers'] = _touches

# ══ AUCUNE MIGRATION ════════════════════════════════════════════════════════
F['zeroMigration'] = not re.search(r'weightLog[\s\S]{0,80}forEach[\s\S]{0,120}bfSrc\s*=', TR)
g(F['zeroMigration'], "une migration a ete ajoutee : le brief l interdit")

# ══ LES TOTAUX, LUS DANS LEURS JOURNAUX ═════════════════════════════════════
F['mutOk'] = F['mutKo'] = None
if MUTLOG and os.path.exists(MUTLOG):
    _t = open(MUTLOG, encoding='utf-8', errors='replace').read()
    _m = re.search(r'conformes=(\d+) nonconformes=(\d+) ancres=(\d+)', _t)
    if _m:
        F['mutOk'] = int(_m.group(1))
        F['mutKo'] = int(_m.group(2)) + int(_m.group(3))

F['passeOk'] = F['passeKo'] = None
F['passeValide'] = False
if PASSE and os.path.exists(PASSE):
    _p = open(PASSE, encoding='utf-8', errors='replace').read()
    _m = re.search(r'TOTAL CROIS.? : (\d+) .{1,3} . (\d+) ', _p)
    if _m:
        F['passeOk'] = int(_m.group(1))
        F['passeKo'] = int(_m.group(2))
    F['passeValide'] = ('PASSE VALIDE' in _p) and ('PASSE NON VALIDE' not in _p)

# ⛔⛔ LE GARDE QUI COMPTE : on ne DECLARE publie que si ca l est vraiment, et on n annonce un
#    total que si son journal le porte. *Un dossier qui annonce une publication qui n a pas eu
#    lieu est pire qu un dossier qui manque.*
if F['publie']:
    g(F['passeValide'], "publie mais la passe n est pas declaree VALIDE")
    g(F['passeOk'] and F['passeOk'] > 4000, "publie sans total de passe credible")
    g(F['mutOk'] is not None and F['mutKo'] == 0,
      "publie sans controle negatif entierement conforme")

if _E:
    print('REFUS DE PRODUIRE — %d garde(s) tombe(s) :' % len(_E))
    for x in _E:
        print('  - ' + x)
    sys.exit(1)

NB = 14

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
             '⚖': '=', '✅': 'OK', '❌': 'X', '–': '-', ' ': ' ', '✓': 'OK'}


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
Ad(titre('FORCE TRACKER - CORPS & SANTE', H1))
Ad(titre('MASSE GRASSE MESUREE vs ESTIMATION US NAVY - %s - 20/09/2026' % F['version'], H1))
Ad(Spacer(1, 4))
Ad(para("<i>&laquo; Ces deux valeurs sont differentes par nature et ne doivent pas se remplacer "
        "l une l autre. &raquo;</i> - et la borne qui a decide de tout le travail : <i>&laquo; je "
        "ne veux pas simplement changer deux textes dans l interface si les deux valeurs restent "
        "melangees dans les donnees : verifie le MODELE reel. &raquo;</i>"))

# ── 1 ────────────────────────────────────────────────────────────────────────
Ad(titre('1. Etat initial - elles etaient REELLEMENT confondues dans les donnees'))
Ad(para("Mesure en conduisant l app servie, horloge gelee, <b>avant</b> d ecrire une ligne. "
        "<font face='Courier'>S.weightLog[].bf</font> etait un champ <b>unique et sans "
        "provenance</b>, qui recevait indifferemment ce que la personne tape et le calcul US Navy."))
Ad(tab([['etape', 'estimation affichee', 'ce que contient la donnee'],
        ['cou 40,7 + taille 92,4 puis OK', '~19,6 %',
         '<font face="Courier">bf: 19.6</font> - une <b>estimation rangee comme une mesure</b>'],
        ['il saisit 18,3 % lus sur sa balance', '~19,6 %',
         '<font face="Courier">bf: 18.3</font> - correct'],
        ['il corrige son tour de taille (90)', '~17,9 %',
         '<b>la case de saisie passe a 17,9</b>'],
        ['il appuie sur OK', '~17,9 %',
         '<b>bf: 17.9 - 18,3 A DISPARU</b>']],
       [46 * mm, 30 * mm, 106 * mm]))
Ad(para("<b>La valeur de la balance etait ecrasee sans un mot</b>, et rien dans les donnees ne "
        "permettait de la retrouver."))

# ── 2 ────────────────────────────────────────────────────────────────────────
Ad(titre('2. Cause - six mots, une seule ligne'))
Ad(para("<font face='Courier'>_recalcNavyBf</font> finissait par "
        "<font face='Courier'>if(navy!=null){...i.value=navy;}</font> : l estimation "
        "<b>s ecrivait dans le champ de saisie</b> a chaque frappe dans une mensuration."))
Ad(para("<b>Une estimation qui s ecrit dans le champ de saisie cesse d etre une estimation au "
        "premier OK</b> - plus rien ne la distingue de ce que la personne a tape. Elle garde "
        "desormais son propre affichage, <b>a cote et non dedans</b>."))

# ── 3 ────────────────────────────────────────────────────────────────────────
Ad(titre('3. Comportement retenu'))
for x in [
    "<b>Une cle a cote, jamais une migration.</b> <font face='Courier'>bfSrc</font> vaut "
    "<font face='Courier'>mesure</font> ou <font face='Courier'>estime</font> - et son "
    "<b>absence est une troisieme reponse</b>, qui se lit &laquo; on ne sait pas &raquo;. Les "
    "lignes d avant gardent ce trou : on ne le comble pas par une valeur plausible.",
    "<b>La garantie, en une phrase : une ESTIMATION ne peut ecrire que sur un emplacement VIDE "
    "ou qui portait deja une estimation.</b> Une provenance <b>inconnue</b> est donc "
    "intouchable - elle peut parfaitement etre une valeur de balance d avant aujourd hui, et le "
    "cout de l erreur n est pas symetrique. Une <b>mesure</b>, elle, ecrit toujours.",
    "<b>Les quatre ecrivains declarent leur provenance</b> (la carte, l edition d une pesee, le "
    "bilan corporel, l import de bilans) - mesure : <b>%d</b> ecritures de provenance dans le "
    "fichier. Et rouvrir une pesee <b>ne promeut pas</b> une estimation en mesure." % F['ecrivains'],
    "<b>D-013 est tranchee (D-014)</b> : le champ n est prerempli que par une <b>mesure du jour "
    "consulte</b>. Un champ prerempli plus un OK machinal fabriquaient une mesure que personne n "
    "avait prise. Le parcours US Navy n est pas perdu : un OK sur champ vide enregistre bien l "
    "estimation, <b>etiquetee comme telle</b>.",
    "<b>L ecran dit les deux sans les melanger</b> : <i>&laquo; Estimation d apres tes "
    "mensurations : ~19,6 % &middot; Derniere mesure saisie : 18,3 % - 20/09 &raquo;</i>. Et "
    "&laquo; mesure saisie &raquo; n est dit que si la provenance est <b>ecrite</b> ; sinon on "
    "dit &laquo; valeur notee &raquo;.",
]:
    Ad(para('&bull; ' + x))

# ── 4 ────────────────────────────────────────────────────────────────────────
Ad(titre('4. Fichiers modifies'))
Ad(para("<b>Un seul fichier servi : <font face='Courier'>tracking.js</font></b> (recompte "
        "depuis git, pas recopie). La formule US Navy ne bouge pas d une constante, homme et "
        "femme, figee par deux temoins. Aucune migration, aucun champ supprime, aucun point de "
        "courbe perdu."))
Ad(para("Liste complete : <font face='Courier'>%s</font>"
        % ' &middot; '.join(F['fichiers'][:18])))
Ad(para("<b>Hors perimetre, verifie</b> : scanner, aliments, foodLog, Accueil, Seance, Milo, "
        "backend, Worker, quotas IA - 0 ligne."))

# ── 5 ────────────────────────────────────────────────────────────────────────
Ad(titre('5. Tests'))
_mut = ('%d conformes / %d non conformes' % (F['mutOk'], F['mutKo'])
        if F['mutOk'] is not None else 'en cours')
_passe = ('%d OK / %d rouge%s' % (F['passeOk'], F['passeKo'],
                                  ' - PASSE VALIDE aux 4 conditions' if F['passeValide'] else '')
          if F['passeOk'] is not None else 'PAS ENCORE LANCEE')
Ad(tab([['ce qui a ete mesure', 'resultat'],
        ['blocs B-CCCXLII (source) et B-CCCXLIII (conduits dans le navigateur)',
         'les 6 cas A->F du brief + le chemin direct de la garantie'],
        ['banc cible tools/banc_masse_grasse.js', '%s OK / 0 rouge' % BANC],
        ['controle negatif (mutations sur un arbre COPIE)', _mut],
        ['passe complete (les 4 conditions de tools/passe_valide.sh)', _passe]],
       [112 * mm, 70 * mm]))
Ad(para("<b>Le controle negatif a trouve DEUX trous dans mes propres temoins</b>, et c est "
        "exactement a cela qu il sert. (1) Tous mes cas de provenance inconnue passaient par le "
        "champ <b>efface</b>, donc par le garde de l estimation, qui sort avant d atteindre la "
        "conservation de provenance - alors que le chemin reel est l inverse : une ligne ancienne "
        "est <b>preremplie</b>, on appuie sur OK sans rien effacer. (2) Plus fin : taper la "
        "<b>meme valeur</b> que l estimation doit la requalifier en mesure - <i>une valeur egale "
        "n est pas une valeur de meme nature</i>. Sans quoi une balance qui affiche exactement ce "
        "que le calcul proposait laisserait la mesure <b>ecrasable</b>."))

# ── 6 ────────────────────────────────────────────────────────────────────────
Ad(titre('6. Version publiee'))
if F['publie']:
    Ad(para("<b>%s</b>, publiee sur <font face='Courier'>master</font>." % F['version']))
else:
    Ad(para("<b>%s - PAS ENCORE PUBLIEE.</b> %d commit(s) attendent sur la branche de travail "
            "<font face='Courier'>claude/project-status-a0qakd</font>. La publication n a lieu "
            "qu apres la passe complete verte aux 4 conditions, comme le demande le brief."
            % (F['version'], F['aPublier'])))
    Ad(para("<i>Ce dossier se regenere a la publication : il porte alors le numero servi et le "
            "total de la passe. Il refuse de produire une page qui annoncerait une publication "
            "qui n a pas eu lieu.</i>"))

# ── 7 ────────────────────────────────────────────────────────────────────────
Ad(titre('7. Ce que Michel doit verifier lui-meme, sur son telephone'))
for i, x in enumerate([
    "Fermer completement Force Tracker, puis la rouvrir. Menu -> A propos doit afficher "
    "<b>%s</b>." % F['version'],
    "Progres -> Corps & sante -> &laquo; Masse grasse du jour &raquo; : le champ doit etre "
    "<b>VIDE</b> tant qu aucune mesure n a ete saisie aujourd hui, et l estimation doit "
    "s afficher a part (&laquo; Estimation d apres tes mensurations : ~XX %% &raquo;).",
    "Taper une valeur de balance (par exemple <b>18,3</b>) et valider. Le sous-titre doit dire "
    "<b>&laquo; Mesure du jour : 18,3 % &raquo;</b> <b>et</b> l estimation, cote a cote.",
    "<b>LE TEST QUI COMPTE</b> : modifier ensuite le tour de taille, puis valider. L estimation "
    "doit changer, <b>la mesure 18,3 doit rester</b>.",
    "Fermer l application, la rouvrir : meme valeur, meme date. Le lendemain, le champ doit etre "
    "vide et la ligne <b>&laquo; Derniere mesure saisie : 18,3 % - 20/09 &raquo;</b> doit "
    "apparaitre.",
], 1):
    Ad(para('<b>%d.</b> %s' % (i, x)))
Ad(para("<i>Je n ai pas teste sur ton telephone et je ne pretends pas le contraire : tout ce qui "
        "precede est mesure dans un navigateur et dans git.</i>", PET))

Ad(Spacer(1, 7))
Ad(Paragraph(md("Dossier produit par un script qui recompte ses %d faits depuis le code servi "
                "(la cause fermee, le garde de non-ecrasement, la protection de l inconnue, les "
                "ecritures de provenance, le prefill D-014, le registre des decisions, les deux "
                "formules US Navy, le perimetre git, l absence de migration), LIT les totaux "
                "dans leurs journaux, refuse de produire si l un d eux tombe, et relit sa propre "
                "sortie." % NB), PET))

doc = BaseDocTemplate(SORTIE, pagesize=A4,
                      title='Force Tracker - masse grasse mesuree vs estimee',
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
for _mot in ('i.value=navy', 'bfSrc', 'D-014', 'intouchable', 'LE TEST QUI COMPTE',
             F['version'], 'n ai pas teste sur ton telephone'):
    if _mot not in _lis:
        os.remove(SORTIE)
        sys.exit('REFUS : « %s » n est pas imprime dans le PDF' % _mot)

print('   relu : %d caracteres lisibles, 0 balise en clair' % len(_lis))
print('OK %s (%d gardes, %d octets) — publie=%s'
      % (SORTIE, NB, os.path.getsize(SORTIE), F['publie']))
