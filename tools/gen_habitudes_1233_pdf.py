#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOSSIER DE PASSATION — LA CARTE « CE QUE L APP A APPRIS DE TON ALIMENTATION » (22/09/2026).

⛔⛔ LES GARDES RECOMPTENT CHAQUE FAIT DEPUIS LE CODE SERVI et refusent de produire si l un
    d eux tombe. Les totaux (banc, mutations, passe) se LISENT dans leurs journaux, jamais a
    la main (lecon ft-v1201, ou un PDF a publie un total pendant que la passe tournait encore).

⭐ ET LE DOSSIER SAIT DIRE « PASSE EN COURS » ET « PAS ENCORE PUBLIEE ».
   *Un dossier qui annonce une publication qui n a pas eu lieu est pire qu un dossier qui manque.*

⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji.

Variables : HA_PDF · HA_PASSE (verdict passe_valide.sh) · HA_BANC · HA_MUT
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
SORTIE = os.environ.get('HA_PDF', '/tmp/FORCE-TRACKER-HABITUDES-ALIMENTAIRES-22-09-2026.pdf')
PASSE = os.environ.get('HA_PASSE', '')
BANC = os.environ.get('HA_BANC', '')
MUT = os.environ.get('HA_MUT', '')

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
    """⛔ INDISPENSABLE : les commentaires du correctif citent `_PA_MIN_JOURS`, `joursRepas`,
    `_afMealDefautHoraire` et « heure de saisie » en toutes lettres (R30). Un garde qui lirait
    le fichier brut resterait vert quoi qu on remette dans le code."""
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


PA = corps(AP, '_profilAlimentaire').replace(' ', '').replace('\n', '')
g(PA != '', "_profilAlimentaire est introuvable")

# ══ LA VERSION, ET SON ETAT REEL ════════════════════════════════════════════
F['version'] = re.search(r"const CACHE = '(ft-v\d+)'", lire('sw.js')).group(1)
g(F['version'] == 'ft-v1233', "la version preparee est %r" % F['version'])
_rc, _o = git('rev-list', '--count', 'origin/master..HEAD')
F['aPublier'] = int(_o.strip() or 0)
_rc, _o = git('status', '--porcelain')
F['aCommiter'] = len([x for x in _o.split('\n') if x.strip()])
F['publie'] = (F['aPublier'] == 0 and F['aCommiter'] == 0)

# ══ LE SEUIL N EST PAS INVENTE ══════════════════════════════════════════════
F['seuil'] = 'const_PA_MIN_JOURS=3;' in NAP
g(F['seuil'], "le seuil de la maison a change ou disparu")
F['lectures'] = len(re.findall(r'_PA_MIN_JOURS', PA))
g(F['lectures'] >= 3, "le seuil n est lu que %d fois (3 attendues)" % F['lectures'])

# ══ LES DEUX BARRES ═════════════════════════════════════════════════════════
F['barreRepas'] = 'if(Object.keys(joursRepas[m]||{}).length<_PA_MIN_JOURS)return;constl=' in PA
g(F['barreRepas'], "le filtre sur la population du repas a disparu")
F['barreAliment'] = '.filter(a=>a.jours>=_PA_MIN_JOURS)' in PA
g(F['barreAliment'], "le filtre par aliment a disparu")
F['enJours'] = 'jours:Object.keys(a.jours).length' in PA
g(F['enJours'], "on est revenu a un compte de lignes")
F['topParti'] = 'habitudes[m]=top(' not in PA
g(F['topParti'], "le top-3 sans seuil est revenu")

# ══ LE DEPARTAGE DETERMINISTE ═══════════════════════════════════════════════
F['depart'] = ".sort((a,b)=>(b.jours-a.jours)||(b.n-a.n)||a.nom.localeCompare(b.nom,'fr'))" in PA
g(F['depart'], "l ordre du tableau peut de nouveau decider de l affichage")

# ══ L HEURE ═════════════════════════════════════════════════════════════════
F['heureVerif'] = '_FAMILLE[_afMealDefautHoraire(h)]!==attendu)return;' in PA
g(F['heureVerif'], "une heure de saisie peut repasser pour une heure de repas")
# ⛔⛔ LE GARDE QUI COMPTE : le bareme horaire ne doit exister QU UNE FOIS (R2).
F['bareme'] = len(re.findall(r"h<11\?'petitdej'", NAP))
g(F['bareme'] == 1, "le bareme horaire est ecrit %d fois" % F['bareme'])
F['ferme'] = "if(typeof_afMealDefautHoraire!=='function')return;" in PA
g(F['ferme'], "l echec n est plus ferme")
F['famille'] = ("const_FAMILLE={petitdej:'petitdej',dejeuner:'dejeuner',"
                "collation:'collation',collation2:'collation',diner:'diner'};") in PA
g(F['famille'], "la correspondance des familles a change")

# ══ LE REPAS ACTIF N EST PAS TOUCHE ═════════════════════════════════════════
F['additif'] = ("consth=(heure===undefined||heure===null||!isFinite(+heure))"
                "?newDate().getHours():+heure;") in NAP
g(F['additif'], "le repli sur l heure courante a change : le repas actif est touche")
F['actifIntact'] = 'return_afMealDefautHoraire();' in NAP
g(F['actifIntact'], "le repas actif passe desormais une heure")

# ══ LA POPULATION N A PAS BOUGE (la suspicion infirmee) ═════════════════════
F['sansSlice'] = ('fl.slice(' not in PA)
g(F['sansSlice'], "une fenetre glissante est apparue")
F['joursTries'] = 'constjours=Object.keys(parJour).sort();' in PA
g(F['joursTries'], "le tri des jours a disparu")

# ══ L ECRAN ═════════════════════════════════════════════════════════════════
F['videDit'] = bool(re.search(r"Pasencored\\?'habitudequisedégage", NSC))
g(F['videDit'], "le cas « aucune habitude » n est plus dit a l ecran")

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
g(F['mutOk'] is not None and F['mutKo'] == 0, "le controle negatif n est pas lu ou n est pas conforme")
if F['publie']:
    g(F['passeValide'], "publie mais la passe n est pas declaree VALIDE")
    g(F['passeOk'] and F['passeOk'] > 4000, "publie sans total de passe credible")

if _E:
    print('REFUS DE PRODUIRE — %d garde(s) tombe(s) :' % len(_E))
    for x in _E:
        print('  - ' + x)
    sys.exit(1)

NB = 17

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
             '≥': '>=', '≠': '!=', '×': 'x', '…': '...'}


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
Ad(titre('CE QUE L APP A APPRIS DE TON ALIMENTATION - %s - 22/09/2026' % F['version'], H1))
Ad(Spacer(1, 4))
Ad(para("Cas reel de Michel, sur son telephone : <b>&laquo; Petit-dej ~12h &raquo;</b>, "
        "<b>Pom'Potes</b> prise 1 ou 2 fois et <b>prune</b> prise 2 fois presentees comme des "
        "habitudes, sur 33 jours notes etales sur 76."))

# ── 1 ────────────────────────────────────────────────────────────────────────
Ad(titre('1. Les causes - trois, et elles sont distinctes'))
Ad(tab([['ce qui s affichait', 'pourquoi'],
        ['<b>Petit-dej ~12h</b>',
         "l heure etait la mediane de <font face='Courier'>new Date(e.ts).getHours()</font> - or "
         "<font face='Courier'>ts</font> vaut <font face='Courier'>Date.now()</font> <b>A "
         "L ENREGISTREMENT</b>, et <font face='Courier'>FOOD_MEALS</font> ne porte AUCUNE heure. "
         "<b>L app ne sait pas quand on a mange, elle sait quand on a tape</b> - et aucune "
         "mediane ne rattrape 33 saisies faites a midi."],
        ["<b>prune</b> (2 jours)",
         "<font face='Courier'>top(o,3)</font> prenait les 3 premiers par frequence <b>sans "
         "aucun seuil</b>. <i>Un &laquo; top 3 &raquo; ne demande jamais si le 2e est une "
         "habitude : il demande seulement s il existe un 2e.</i>"],
        ["<b>Pom'Potes</b> (1-2 jours)",
         "meme cause, dans les deux collations : elle tenait une place a remplir."],
        ['<b>la population</b>',
         "<b>RIEN a corriger</b> : ni <font face='Courier'>slice()</font>, ni fenetre glissante, "
         "ni tri suppose, ni <font face='Courier'>[0]</font>. La population EST le journal "
         "entier, et le &laquo; 33 sur 76 &raquo; affiche est honnete."]],
       [38 * mm, 144 * mm]))

# ── 2 ────────────────────────────────────────────────────────────────────────
Ad(titre('2. La regle avant / la regle apres, en francais simple'))
Ad(tab([['', 'AVANT', 'APRES'],
        ['les aliments',
         "les <b>3 plus frequents</b> du repas, quoi qu il arrive",
         "les 3 plus frequents, <b>mais seulement ceux revenus sur au moins 3 jours</b> - et "
         "seulement si le repas lui-meme a ete note au moins 3 jours"],
        ['ce qu on compte', "les <b>lignes</b> (2 Pom'Potes le meme apres-midi = 2)",
         "les <b>jours</b> (le meme apres-midi = 1)"],
        ['a egalite', "l <b>ordre du tableau</b> decidait - inverser le journal changeait "
         "l affichage", "le <b>nom</b> tranche, donc le meme journal donne toujours le meme "
         "resultat"],
        ['l heure', "la mediane des heures de <b>saisie</b>, presentee comme l heure du repas",
         "la meme mediane, mais <b>confrontee</b> a la regle horaire de l app : si elle dit un "
         "autre repas, <b>on n affiche rien</b>"]],
       [26 * mm, 62 * mm, 94 * mm]))

# ── 3 ────────────────────────────────────────────────────────────────────────
Ad(titre('3. Aucun seuil invente, et aucune table d horaires fabriquee'))
Ad(para("<b>Le nombre employe est <font face='Courier'>_PA_MIN_JOURS</font></b> : il etait "
        "<b>deja</b> declare dans le fichier et <b>deja</b> applique deux fois - c est le seuil "
        "sous lequel la carte dit elle-meme &laquo; pas encore de quoi degager une habitude "
        "&raquo;, et c est deja le minimum des horaires. <i>On etend une regle qui existe, on "
        "n en cree pas une neuve.</i> Il est lu <b>%d fois</b> dans la fonction." % F['lectures']))
Ad(para("<b>Et pour l heure, <font face='Courier'>_afMealDefautHoraire()</font> etait deja une "
        "table decidee et servie</b> (&lt;11h petit-dej, &lt;15h dejeuner, &lt;18h collation, "
        "sinon diner). On lui demande simplement : <i>&laquo; a cette heure-la, de quel repas "
        "s agirait-il ? &raquo;</i> Le bareme n est ecrit qu <b>une seule fois</b> dans tout "
        "<font face='Courier'>app.js</font> (verifie a la generation)."))
Ad(para("<b>L etude des seuils, faite AVANT de choisir</b> (10 aliments de frequences variees) : "
        "ce couple sort Kebab (1 j), Prune (2 j) et Pom'Potes, <b>sans perdre une seule habitude "
        "reelle</b> - y compris la pizza tous les 11 jours, qu un seuil en <b>pourcentage</b> "
        "aurait eliminee."))

# ── 4 ────────────────────────────────────────────────────────────────────────
Ad(titre('4. Ta carte reelle, avant et apres'))
Ad(para("<i>Journal reconstruit d apres ta capture du 22/09 (33 jours notes), passe dans le "
        "code corrige.</i>"))
Ad(tab([['repas', 'ta capture', 'apres'],
        ['Petit-dej', "<b>~12h</b> - Iso zero - Banane - 30g proteine",
         "<b>pas d heure</b> - Iso zero - Banane - 30g proteine"],
        ['Collation', "~16h - Iso zero - <b>Prune (2 j)</b> - <b>Pom'Potes (2 j)</b>",
         "~16h - Iso zero"],
        ['Dejeuner', "~14h - Ratatouille - Steak hache - Huile d olive", "<b>inchange</b>"],
        ['Collation 2', "~17h - Iso zero - Banane - <b>Pom'Potes (1 j)</b>",
         "~17h - Iso zero - Banane"],
        ['Diner', "~19h - Huile d olive - Oeuf cru - Pates seches", "<b>inchange</b>"]],
       [24 * mm, 82 * mm, 76 * mm]))
Ad(para("<b>Les 9 attendus sont tenus</b> : le &laquo; ~12h &raquo; disparait, les quatre autres "
        "heures <b>restent</b> (elles sont plausibles pour leur repas), et aucun de tes vrais "
        "aliments n est perdu."))

# ── 5 ────────────────────────────────────────────────────────────────────────
Ad(titre('5. Une correction a ce que j avais annonce'))
Ad(para("Ma premiere reproduction etait <b>synthetique</b> et donnait 2 jours notes a "
        "&laquo; Collation 2 &raquo; ; j en avais conclu que le filtre decisif etait celui de la "
        "<b>population du repas</b>. <b>Ta capture dit le contraire</b> : tes cinq repas "
        "affichent une heure, donc Collation 2 a bien au moins 3 lignes. <b>Chez toi, c est le "
        "filtre par ALIMENT qui sort Pom'Potes et la prune.</b> Les deux filtres restent "
        "justifies - mais j avais attribue la victoire au mauvais. <i>Une capture reelle vaut "
        "mieux qu une reconstitution.</i>"))
Ad(para("<b>Deux details factuels de ta capture</b>, sans consequence : la prune est en "
        "<b>Collation</b>, pas en Diner comme disait le brief ; et Pom'Potes apparait dans "
        "<b>les deux</b> collations.", PET))

# ── 6 ────────────────────────────────────────────────────────────────────────
Ad(titre('6. Tests'))
_p = ('%d OK / %d rouge' % (F['passeOk'], F['passeKo'])) if F['passeOk'] is not None \
     else ('EN COURS' if F['passeEnCours'] else 'non lancee')
Ad(tab([['banc cible', 'controle negatif', 'passe complete'],
        ['%d OK / %d rouge' % (F['bancOk'], F['bancKo']),
         '%d/%d conformes, 0 ancre morte' % (F['mutOk'], F['mutOk'] + F['mutKo']),
         _p]],
       [60 * mm, 62 * mm, 60 * mm]))
Ad(para("<b>Les 5 familles exigees par le brief sont chacune couverte par une mutation qui "
        "rougit</b> : un algorithme qui prend le dernier aliment, un "
        "<font face='Courier'>slice()</font> sur les dernieres lignes, un ordre de tableau "
        "suppose, une heure de saisie employee a la place de l heure pertinente, et une "
        "frequence qui compte mal. <b>Quatre sont deguisees</b> - dont celle qui <b>recopie le "
        "bareme horaire sur place</b> : l affichage reste juste et la deuxieme source de verite "
        "est nee."))
Ad(para("<b>Deux temoins figent le repas actif</b> : le parametre ajoute a "
        "<font face='Courier'>_afMealDefautHoraire</font> est <b>strictement additif</b> - "
        "appelee sans argument, elle rend exactement ce qu elle rendait."))

# ── 7 ────────────────────────────────────────────────────────────────────────
Ad(titre('7. Etat de publication'))
if F['publie']:
    Ad(para("<b>%s</b>, publiee sur <font face='Courier'>master</font>." % F['version']))
else:
    Ad(para("<b>%s - PAS ENCORE PUBLIEE.</b> %d fichier(s) attendent un commit, %d commit(s) "
            "attendent un push. %s"
            % (F['version'], F['aCommiter'], F['aPublier'],
               "La passe complete <b>tourne encore</b> : rien n est commite tant qu elle n a pas "
               "rendu son verdict, parce que sa condition 3 compare le HEAD avant et apres."
               if F['passeEnCours'] else
               "La publication n a lieu qu apres la passe complete verte aux 4 conditions.")))

# ── 8 ────────────────────────────────────────────────────────────────────────
Ad(titre('8. Ce que Michel doit verifier lui-meme, sur son telephone'))
for i, x in enumerate([
    "Fermer completement Force Tracker, puis la rouvrir. Menu -&gt; A propos doit afficher "
    "<b>%s</b>." % F['version'],
    "Nutrition -&gt; carte <b>&laquo; Ce que l app a appris &raquo;</b> : la ligne "
    "<b>Petit-dej</b> ne doit plus porter d heure du tout.",
    "<b>LE TEST QUI COMPTE</b> : <b>Pom'Potes</b> et <b>prune</b> ne doivent plus y apparaitre, "
    "dans aucun repas.",
    "Les quatre autres heures (~14h, ~16h, ~17h, ~19h) doivent <b>rester</b>, et tes aliments "
    "habituels aussi - si l un d eux a disparu, dis-le moi, c est que la barre est trop haute.",
    "Le bas de la carte doit toujours dire <b>&laquo; 33 jours notes, etales sur 76 &raquo;</b> : "
    "la periode n a pas bouge.",
], 1):
    Ad(para('<b>%d.</b> %s' % (i, x)))
Ad(para("<i>Je n ai pas teste sur ton telephone et je ne pretends pas le contraire : tout ce qui "
        "precede est mesure dans un navigateur, sur un journal reconstruit d apres ta capture.</i>",
        PET))

Ad(Spacer(1, 7))
Ad(Paragraph(md("Dossier produit par un script qui recompte ses %d faits depuis le code servi "
                "(le seuil et ses lectures, les deux barres, le compte en jours, la disparition "
                "du top-3, le departage deterministe, la verification de l heure, l unicite du "
                "bareme, l echec ferme, les familles, le parametre additif, le repas actif "
                "intact, l absence de slice, le tri des jours, le cas vide a l ecran), LIT les "
                "totaux dans leurs journaux, refuse de produire si l un d eux tombe, et relit sa "
                "propre sortie." % NB), PET))

doc = BaseDocTemplate(SORTIE, pagesize=A4,
                      title='Force Tracker - habitudes alimentaires',
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
for _mot in ('_PA_MIN_JOURS', '_afMealDefautHoraire', 'Petit-dej', "Pom'Potes",
             'LE TEST QUI COMPTE', F['version'], 'n ai pas teste sur ton telephone',
             'j avais attribue la victoire au mauvais'):
    if _mot not in _lis:
        os.remove(SORTIE)
        sys.exit('REFUS : « %s » n est pas imprime dans le PDF' % _mot)

print('   relu : %d caracteres lisibles, 0 balise en clair' % len(_lis))
print('OK %s (%d gardes, %d octets) — publie=%s · passe=%s'
      % (SORTIE, NB, os.path.getsize(SORTIE), F['publie'],
         'en cours' if F['passeEnCours'] else (F['passeOk'] if F['passeOk'] is not None else '?')))
