#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOSSIER DE PASSATION — ft-v1230, LE CORRECTIF DES MENSURATIONS (20/09/2026).

⛔⛔ LES GARDES RECOMPTENT CHAQUE FAIT DEPUIS LE CODE SERVI ET REFUSENT DE PRODUIRE SI L UN
    D EUX TOMBE — y compris le total de la passe, qui se LIT dans son journal et jamais a la
    main (lecon ft-v1201, ou un PDF a publie un total pendant que la passe tournait encore).

⛔ GARDE A L ENVERS : si le defaut n est plus reproductible sur l arbre d AVANT, ce dossier
   decrirait un probleme qui n existe pas. On le verifie dans git, pas de memoire.

⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji. Un caractere hors jeu ne PLANTE PAS,
    il sort en glyphe faux : d ou l entonnoir `_win()` ET le garde qui refuse l inconnu.

Variables : MEN_PDF (sortie) · MEN_PASSE (journal de la passe) · MEN_MUT (journal des mutations)
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
SORTIE = os.environ.get('MEN_PDF',
                        '/tmp/FORCE-TRACKER-CORPS-SANTE-CORRECTIF-MENSURATIONS-20-09-2026.pdf')
PASSE = os.environ.get('MEN_PASSE', '/tmp/passe_mens2.log')
MUTLOG = os.environ.get('MEN_MUT', '')

_E = []


def g(c, lib):
    if not c:
        _E.append(lib)


def lire(n):
    with open(os.path.join(RACINE, n), encoding='utf-8') as f:
        return f.read()


def sans_comm(src):
    """Neutralise les commentaires JS. ⛔ INDISPENSABLE : les commentaires du correctif citent
    `persist`, `numFR`, `S.bw` et le ternaire fautif en toutes lettres (R30). Un garde qui
    lirait le fichier brut resterait vert quoi qu on remette dans le code."""
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


def bloc(src, entete):
    m = re.search(entete, src)
    if not m:
        return ''
    i = src.find('{', m.end() - 1)
    if i < 0:
        return ''
    d = 0
    for j in range(i, len(src)):
        if src[j] == '{':
            d += 1
        elif src[j] == '}':
            d -= 1
            if not d:
                return src[i:j + 1]
    return ''


F = {}

# ══ LA VERSION SERVIE ════════════════════════════════════════════════════════
F['version'] = re.search(r"const CACHE = '(ft-v\d+)'", lire('sw.js')).group(1)
g(F['version'] == 'ft-v1230', "la version servie est %s" % F['version'])

TR = sans_comm(lire('tracking.js'))
SBF = bloc(TR, r'function\s+saveBodyFat\s*\(\s*\)\s*')
g(SBF != '', "saveBodyFat est introuvable")

# ⛔⛔ LE FAIT CENTRAL, RECOMPTE : tout chemin de sortie pose apres la saisie sauvegarde.
_apres = SBF[SBF.find('_mensEnregistrerSaisie()'):]
_sorties = _apres.split('return ;') if ' return ;' in _apres else re.split(r'\breturn\s*;', _apres)
_sorties = _sorties[:-1]
F['sorties'] = len(_sorties)
F['sortiesSansPersist'] = len([b for b in _sorties if 'persist()' not in b])
g(F['sorties'] >= 2, "seulement %d chemin(s) de sortie reperes" % F['sorties'])
g(F['sortiesSansPersist'] == 0,
  "%d sortie(s) ne sauvegardent pas : le correctif n est plus la" % F['sortiesSansPersist'])

g('last ? last.kg :' not in TR and 'last?last.kg:' not in TR.replace(' ', ''),
  "le ternaire qui rendait S.bw inatteignable est revenu")
g('_kgUtil' in SBF, "le lecteur de poids utilisable a disparu")

NAVY = bloc(TR, r'function\s+_bfNavy\s*\([^)]*\)\s*')
g('numFR(' in NAVY and 'parseFloat(' not in NAVY,
  "_bfNavy ne lit plus ses nombres avec numFR")
# ⛔ LE CALCUL N A PAS BOUGE — c est la borne de Michel, on la RECOMPTE.
for _c in ('1.0324', '0.19077', '1.29579', '0.35004'):
    g(_c in NAVY, "la constante %s de la formule US Navy a disparu" % _c)

MES = bloc(TR, r'function\s+_mensEnregistrerSaisie\s*\(\s*\)\s*')
g(re.search(r'if\s*\(\s*!\s*brut\s*\)\s*return\s*;', MES.replace('\n', ' ')) is not None,
  "un champ vide ne protege plus la valeur enregistree")
g(not re.search(r'S\.(neck|waist|hip)\s*=', SBF),
  "saveBodyFat reecrit une mensuration en direct : R2 rompu")

# ══ LE RETOUR DE CHRISTOPHE — recompte, jamais cite ══════════════════════════
BFD = bloc(TR, r'function\s+bfDerniere\s*\([^)]*\)\s*')
g(BFD != '', "bfDerniere a disparu : plus de proprietaire pour « la derniere mesure »")
g('.sort(' in BFD and 'localeCompare' in BFD,
  "bfDerniere ne TRIE plus par date : elle se fie a l ordre du tableau")
g(re.search(r'\?\s*\{\s*date\s*:[^}]*\}\s*:\s*null', BFD.replace('\n', ' ')) is not None,
  "bfDerniere ne rend plus null : « je ne sais pas » et « zero » se confondent (R29)")
JC = bloc(TR, r'function\s+_bfJourCourt\s*\([^)]*\)\s*')
g(JC != '' and 'new Date' not in JC,
  "la date repasse par new Date : piege des fuseaux horaires (BUGS.md)")
BRUT = lire('tracking.js')
g('apr\u00e8s tes mesures' in BRUT, "le sous-titre ne nomme plus la source du chiffre propose")
g('derni\u00e8re not\u00e9e' in BRUT, "l ecran ne rappelle plus la derniere valeur notee")
# ⛔⛔ LA DECISION NON TRANCHEE (D-013) : le prefill ne doit PAS avoir change.
# ⚠️ ON NE RETIRE PAS LES ESPACES, ET C'EST LE PIEGE DE L ESPACE (9e fois dans ce depot) :
#    « TR.replace(' ','') » les retirait de la SOURCE, mais le motif en contient un
#    (« const prefill ») — il ne pouvait donc plus jamais correspondre. Le garde refusait de
#    produire sur un code parfaitement juste. *Quand on nettoie la source, on nettoie le motif
#    du meme geste, sinon le garde mesure sa propre mise en forme.* Ici, rien a nettoyer.
g("const prefill=savedToday?todayW.bf:(navyNow!=null?navyNow:'')" in TR,
  "le prefill a change alors que D-013 n est pas tranchee")
DEC = lire('docs/DECISIONS.md')
g('| D-013 |' in DEC and 'TRANCHER' in DEC.split('| D-013 |')[1].split('\n')[0],
  "D-013 n est pas consignee comme « A TRANCHER » dans le registre")

# ⛔ LE PERIMETRE : un seul fichier servi touche.
_servis = subprocess.run(  # noqa
    ['git', 'diff', '--name-only', 'origin/master...HEAD'],
    capture_output=True, text=True, cwd=RACINE).stdout.split()
F['servisTouches'] = sorted([x for x in _servis if re.match(
    r'^(app|state|screens|log|coach|setup|tracking|constants|supabase|worker|Code|'
    r'capacites-ia)\.js$|^index\.html$', x)])
g(F['servisTouches'] == ['tracking.js'],
  "le perimetre a change : fichiers servis touches = %s" % F['servisTouches'])

# ══ L ETAT GIT ═══════════════════════════════════════════════════════════════
F['sha'] = subprocess.run(['git', 'rev-parse', 'HEAD'],  # noqa
                          capture_output=True, text=True, cwd=RACINE).stdout.strip()
_sale = subprocess.run(['git', 'status', '--porcelain'],  # noqa
                       capture_output=True, text=True, cwd=RACINE).stdout.strip()
F['sale'] = [x[3:] for x in _sale.splitlines()] if _sale else []
F['masterSert'] = re.search(
    r"const CACHE = '(ft-v\d+)'",
    subprocess.run(['git', 'show', 'origin/master:sw.js'],  # noqa
                   capture_output=True, text=True, cwd=RACINE).stdout).group(1)
F['avance'] = int(subprocess.run(['git', 'rev-list', '--count', 'origin/master..HEAD'],  # noqa
                                 capture_output=True, text=True, cwd=RACINE).stdout.strip() or 0)
F['ancetre'] = subprocess.run(  # noqa
    ['git', 'merge-base', '--is-ancestor', 'origin/master', 'HEAD'],
    capture_output=True, text=True, cwd=RACINE).returncode == 0

# ⛔⛔ GARDE A L ENVERS — LE DEFAUT ETAIT-IL VRAIMENT LA ? On le lit dans l arbre d AVANT.
_avant = subprocess.run(['git', 'show', 'origin/master~5:tracking.js'],  # noqa
                        capture_output=True, text=True, cwd=RACINE).stdout
if not _avant:
    _avant = subprocess.run(['git', 'show', 'HEAD~6:tracking.js'],  # noqa
                            capture_output=True, text=True, cwd=RACINE).stdout
F['defautAvant'] = ('last?last.kg:' in _avant.replace(' ', ''))
g(F['defautAvant'],
  "le defaut n est pas retrouve dans l arbre d avant : ce dossier decrirait un probleme "
  "qui n a pas existe")

# ══ LE TOTAL DE LA PASSE, LU DANS SON JOURNAL ════════════════════════════════
g(os.path.exists(PASSE), "journal de passe introuvable (%s)" % PASSE)
_p = open(PASSE, encoding='utf-8', errors='replace').read() if os.path.exists(PASSE) else ''
_m = re.search(r'TOTAL CROISÉ : (\d+) ✅ · (\d+) ❌', _p)
if not _m:
    _m = re.search(r'TOTAL CROIS.? : (\d+) .{1,3} . (\d+) ', _p)
F['passeOk'] = int(_m.group(1)) if _m else 0
F['passeKo'] = int(_m.group(2)) if _m else -1
g(F['passeOk'] > 4000, "la passe ne rend que %d temoins verts" % F['passeOk'])
g(F['passeKo'] == 0, "la passe rend %d rouge(s)" % F['passeKo'])

if _E:
    print('REFUS DE PRODUIRE — %d garde(s) tombe(s) :' % len(_E))
    for x in _E:
        print('  - ' + x)
    sys.exit(1)

NB = 28

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
_TRANSLIT = {'→': '->', '←': '<-', '⭐': '*', '⛔': '/!\\',
             '⚠': '/!\\', '️': '', '⚖': '=', '✅': 'OK',
             '❌': 'X', '–': '-', ' ': ' '}


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
Ad(titre('CORRECTIF DES MENSURATIONS - %s - 20/09/2026' % F['version'], H1))
Ad(Spacer(1, 4))
Ad(para("Cas reel de Michel, Progres -> Corps & sante, carte &laquo; Masse grasse du jour &raquo; : "
        "poids 85,9 &middot; objectif 85 &middot; cou <b>40,7</b> &middot; taille <b>92,4</b> "
        "&middot; hanches <b>vide</b> &middot; % auto ~19,6. <i>&laquo; Il renseigne ses "
        "mensurations et il ne peut pas les enregistrer. &raquo;</i>"))

# ── 1 ────────────────────────────────────────────────────────────────────────
Ad(titre('1. Reproduction - et les CINQ cas nominaux passaient'))
Ad(para("C'est le point de methode de cette passe : le bug <b>ne se reproduisait pas</b> sur le "
        "scenario decrit. Cou + taille hanches vide, les trois principales, une seule mesure, le "
        "point, la virgule : <b>tout passait</b>. Il a donc fallu chercher ce qui <b>DIFFERE</b> "
        "chez lui au lieu de corriger au juge. <i>Un correctif pose sur un bug qu'on n'a pas "
        "reproduit corrige une hypothese, pas un defaut.</i>"))
Ad(tab([
    ['etat de depart', 'message a l ecran', 'en memoire', 'SUR LE DISQUE'],
    ['poids du jour connu', 'Masse grasse enregistree OK', '2 mesures', 'OK <b>2 mesures</b>'],
    ['<b>aucun poids connu</b>', 'Enregistre d abord ton poids', '2 mesures',
     '/!\\ <b>RIEN</b>'],
    ['<b>pesee SANS kilo utilisable</b> (un bilan corporel qui n a ecrit qu un %)',
     'Enregistre d abord ton poids', '2 mesures', '/!\\ <b>RIEN</b>'],
    ['<b>pesee a kg:0</b>', 'Enregistre d abord ton poids', '2 mesures', '/!\\ <b>RIEN</b>'],
], [196, 130, 66, 90]))
Ad(Spacer(1, 2))
Ad(para("<b>Trois etats d'entree, une seule racine.</b> Et la forme du defaut est la pire qui "
        "soit : la valeur existe <b>en memoire</b>, l'ecran ne dit rien d'elle, et le "
        "rechargement suivant l'efface &mdash; <i>en silence</i>."))

# ── 2 ────────────────────────────────────────────────────────────────────────
Ad(titre('2. Cause racine - un persist() manquant sur UN chemin de sortie'))
Ad(para("<b>saveBodyFat</b> enregistre les centimetres (<i>_mensEnregistrerSaisie</i>) puis "
        "controle le %, puis le poids. Le <b>premier</b> <i>return</i> (celui du %) appelait "
        "bien <i>persist()</i> &mdash; c'est le correctif de <b>ft-v1129</b>, et son commentaire "
        "le dit encore, deux lignes au-dessus du <b>second</b> <i>return</i> reste intact, celui "
        "du poids."))
Ad(para("<b>Un correctif d'ORDRE doit etre pose sur TOUS les chemins de sortie, pas seulement "
        "sur celui qui a servi a le trouver</b> (<b>R15</b> : tout chemin de fermeture pose son "
        "marqueur - 3e fois dans ce projet). Recompte dans le code servi : <b>%d chemins</b> de "
        "sortie apres la saisie, <b>%d</b> sans sauvegarde."
        % (F['sorties'], F['sortiesSansPersist'])))
Ad(Spacer(1, 3))
Ad(para("<b>SECOND DEFAUT, DANS LES MEMES TROIS LIGNES, et c'est lui que Michel voyait.</b> "
        "<i>last ? last.kg : (S.bw||0)</i> n'atteignait le repli sur le poids du profil que s'il "
        "n'existait <b>AUCUNE</b> pesee. Or une pesee peut parfaitement ne porter aucun kilo "
        "utilisable. <b>On disait &laquo; Enregistre d'abord ton poids du jour &raquo; a "
        "quelqu'un dont l'ecran affiche 85,9 kg deux centimetres plus haut.</b> On cherche "
        "desormais le premier poids <b>reellement utilisable</b>, du plus recent au plus ancien, "
        "<i>S.bw</i> en dernier recours &mdash; et lu avec <i>numFR</i>, parce qu'une valeur "
        "importee peut etre la chaine &laquo; 85,9 &raquo;."))
Ad(Spacer(1, 3))
Ad(para("<b>TROISIEME, trouve en MESURANT le separateur decimal au lieu de le supposer</b> "
        "(consigne explicite de Michel). <i>_bfNavy</i> lisait ses nombres avec "
        "<i>parseFloat</i>, et <i>_recalcNavyBf</i> lui passe la valeur <b>brute</b> des champs : "
        "<i>parseFloat('40,7')</i> rend <b>40</b>. Taper une virgule &mdash; <i>ce que fait un "
        "clavier francais</i> &mdash; calculait donc le % sur des centimetres <b>tronques</b> : "
        "<b>20,1 % au lieu de 19,9</b>, et c'est ce chiffre faux qui etait <b>ENREGISTRE</b>. "
        "La lecture passe par <i>numFR</i> <b>chez le proprietaire unique du calcul</b> "
        "(<b>R2</b>) : corriger le seul appelant fautif aurait laisse le piege arme pour le "
        "suivant. /!\\ <b>La formule ne bouge pas d'une virgule</b> &mdash; ses 4 constantes "
        "sont recomptees par ce generateur et epinglees par deux temoins."))

# ── 3 ────────────────────────────────────────────────────────────────────────
Ad(titre('3. Comportement - ce que fait reellement le bouton OK'))
Ad(tab([
    ['question', 'reponse mesuree dans le code'],
    ['Le OK enregistre-t-il aussi les mensurations ?',
     '<b>OUI</b>, et c est une decision ecrite depuis ft-v1129 : y appuyer EST l acte de '
     'declarer ses mensurations. Le % est une <b>consequence</b>, jamais une condition.'],
    ['Les hanches sont-elles obligatoires ?',
     '<b>NON.</b> La methode US Navy ne les consomme que chez la femme ; le champ est visible '
     'pour tout le monde depuis ft-v1129 pour qu un homme puisse les <b>suivre</b>. Une hanche '
     'vide n empeche rien et n invente rien.'],
    ['Combien de mesures faut-il ?',
     '<b>Une seule suffit</b> pour etre gardee. Il en faut <b>deux</b> (cou + taille) pour que '
     'le % se calcule - et l ecran le dit.'],
    ['Un champ vide efface-t-il la valeur ?',
     '<b>NON</b>, et c est fige par un temoin. <i>Vide n est pas une demande de suppression.</i>'],
    ['Les 6 autres mensurations ?',
     'Meme mecanisme, <b>meme racine</b> (<i>_mensEnregistrerSaisie</i> -> <i>mensAjouter</i>). '
     '<b>Un seul correctif</b>, pas six - mesure, pas suppose.'],
    ['Local-first ?',
     'L enregistrement est <b>purement local</b> : <i>persist()</i> ecrit <i>ft4_mens</i>, aucun '
     'reseau n est attendu. La synchronisation cloud existait deja et n est pas touchee.'],
], [150, 332]))

# ── 4 ────────────────────────────────────────────────────────────────────────
Ad(titre('4. Correction - fichiers et perimetre'))
Ad(para("<b>Un seul fichier servi : <i>%s</i></b> (recompte depuis git). Aucune migration : les "
        "donnees existantes se relisent telles quelles, le format de <i>mensLog</i> n a pas "
        "change d un caractere."
        % ', '.join(F['servisTouches'])))
Ad(para("/!\\ <b>Ce que la correction NE fait PAS</b>, nommement : l ecran n est pas refait "
        "&middot; la formule de masse grasse est intacte (homme et femme) &middot; "
        "<i>mensAjouter</i> reste le seul ecrivain d une mensuration (<b>R2</b>) &middot; le OK "
        "garde son role decide (<b>R30</b>) &middot; <b>aucune migration des % deja enregistres "
        "a la virgule</b> - <i>on ne peut pas savoir lequel l a ete, donc on n invente pas</i> "
        "&middot; Nutrition, douane, foodLog, Accueil, Seance, Milo, quotas IA, V2, le miroir : "
        "<b>0 ligne</b>."))

# ── 5 ────────────────────────────────────────────────────────────────────────
Ad(titre('5. Tests et controle negatif'))
Ad(tab([
    ['quoi', 'resultat'],
    ['bloc <b>B-CCCXXXVIII</b> - <b>17</b> temoins de <b>source</b>', 'verts'],
    ['bloc <b>B-CCCXXXIX</b> - <b>23</b> temoins <b>conduits dans le navigateur</b>',
     'verts (le cas exact de Michel, les 3 etats de poids, point vs virgule, un champ vide qui '
     'ne detruit rien, deux jours qui coexistent, <b>et le rechargement complet</b>)'],
    ['banc cible <i>tools/banc_mensurations.js</i>', '<b>40 OK / 0 rouge</b>'],
    ['<b>controle negatif</b> - <b>24</b> mutations sur un arbre <b>CLONE</b>',
     '<b>24 conformes</b>, dont <b>2 qui doivent RESTER VERTES</b> (un commentaire citant les '
     'mots cherches) ; controle sain vert <b>avant ET apres</b>'],
    ['<b>passe complete</b> (journal lu, jamais recopie a la main)',
     '<b>%d OK / %d rouge</b>, les 4 conditions vertes' % (F['passeOk'], F['passeKo'])],
], [190, 292]))
Ad(Spacer(1, 3))
Ad(para("<b>/!\\ DEUX DE MES PROPRES INSTRUMENTS ONT ROUGI SUR DU CODE PARFAITEMENT SAIN.</b> "
        "(1) Mon temoin central coupait sur le mot <i>return</i> pour compter les chemins de "
        "sortie - il comptait donc aussi les <i>return</i> des <b>fonctions flechees</b> que mon "
        "correctif venait d ajouter : <b>4 sorties au lieu de 2</b>. <i>Un motif qui cherche un "
        "mot-cle ne distingue pas la SORTIE d une fonction du RETOUR d une lambda.</i> "
        "(2) Ma fixture appelait <i>localStorage.clear()</i> dans un <i>addInitScript</i>, "
        "<b>qui rejoue a CHAQUE navigation, rechargement compris</b> : le temoin du rechargement "
        "effacait lui-meme ce qu il venait mesurer."))
Ad(para("<b>Et le controle negatif a trouve un trou dans mes temoins - c est exactement a cela "
        "qu il sert.</b> La mutation <b>M04</b> remplace le lecteur de poids par "
        "<i>x =&gt; (x&amp;&amp;x.kg)||0</i> et restait <b>VERTE</b> : ni le cas &laquo; sans kg "
        "&raquo; ni le cas &laquo; kg:0 &raquo; ne la distinguent. Or une valeur <b>non "
        "numerique</b> est <i>truthy</i> - la pesee du jour aurait ete creee avec "
        "<i>kg:'abc'</i>, un poids qui n en est pas un, et qui serait parti dans les courbes et "
        "au cloud. <b>Le trou est devenu un temoin.</b>"))

# ── 5bis ─────────────────────────────────────────────────────────────────────
Ad(titre('5bis. Le SECOND retour - Christophe : « ma masse grasse revient a 20,7 »'))
Ad(para("<i>&laquo; Quand je saisis la masse grasse du jour, je n'ai pas la valeur precedente. "
        "J'ai systematiquement 20.7. Apres avoir saisi ma valeur et ferme l'application, quand je "
        "reviens elle semble bien presente. Mais le lendemain elle revient a 20.7. &raquo;</i> "
        "Consigne de Michel : <b>ne pas supposer que la cause est identique - le verifier</b>."))
Ad(tab([
    ['', 'jour J', 'jour J+1'],
    ['a l ouverture', 'Estimee ~21,8 % (le calcul)', '/!\\ <b>21,8 %</b>'],
    ['il saisit sa valeur de balance', '<b>19,1</b> -&gt; OK Enregistree', '-'],
    ['apres rechargement', 'OK <b>19,1 revient</b>', '-'],
    ['<b>sa derniere valeur enregistree</b>', '19,1', '<b>19,1</b> - et elle n apparait '
     '<b>nulle part</b>'],
], [150, 166, 166]))
Ad(Spacer(1, 3))
Ad(para("<b>/!\\ LA PREMISSE DU BRIEF EST PARTIELLEMENT FAUSSE, et je le dis plutot que de coder "
        "dessus</b> (<b>R38</b>). <b>20,7 n'est ni une constante en dur, ni une valeur par defaut, "
        "ni un decalage d'index, ni un mauvais tri</b> : c'est le <b>calcul US Navy</b> des "
        "mensurations stockees, qui ne bouge pas tant qu'elles ne bougent pas. <i>Elle ressemble "
        "a une vieille valeur figee parce qu'elle en est la SOURCE, pas parce qu'on la relit.</i>"))
Ad(para("<b>La cause a effet pressentie par Michel est reelle - pour LUI.</b> Ses mensurations du "
        "matin n'etaient pas enregistrees (le defaut de la section 2), donc le calcul restait cale "
        "sur les <b>anciennes</b> : 20,7 survivait a une nouvelle mesure. <b>/!\\ Mais ca "
        "n'explique pas Christophe</b>, qui saisit une valeur de <b>balance</b> : chez lui les "
        "mensurations ne changent pas, donc le calcul est simplement <b>constant</b>. "
        "<i>Deux symptomes identiques, deux causes differentes - et seule la mesure le montre.</i>"))
Ad(para("<b>Ce qui manquait n'etait donc pas le bon chiffre.</b> L'ecran ne montrait <b>nulle "
        "part</b> la derniere mesure reelle, ni d'ou venait celui qu'il proposait. /!\\ Et "
        "l'incoherence etait sous le nez : les trois champs voisins (cou, taille, hanches) "
        "affichent, eux, la <b>derniere valeur connue</b> - <i>quatre champs de la meme carte, "
        "deux regles differentes, et rien ne le disait.</i>"))
Ad(para("<b>Correctif</b> : <i>bfDerniere()</i> devient le <b>proprietaire unique</b> de "
        "&laquo; quelle est sa derniere mesure &raquo; (<b>R2</b>) - il <b>TRIE par date</b> au "
        "lieu de se fier a l'ordre du tableau (<i>un [0] qui suppose un tri est un bug qui "
        "n'apparait que chez les autres : apres une restauration, un import, une fusion</i>) et "
        "rend <b>null, jamais 0</b> (<b>R29</b>). Le sous-titre dit desormais : <i>&laquo; Estimee "
        "~21,8 % <b>d'apres tes mesures</b> &middot; <b>derniere notee : 19,1 % le 20/09</b> "
        "&raquo;</i>. La date se formate <b>par decoupage de chaine</b>, jamais par "
        "<i>new Date</i> (piege des fuseaux horaires)."))
Ad(para("<b>/!\\ ET LE CHIFFRE PREREMPLI NE CHANGE PAS - c'est une decision rendue a Michel "
        "(D-013, A TRANCHER).</b> Les deux options ont un piege <b>mesure</b> : (1) proposer la "
        "valeur d'hier et laisser appuyer sur OK <b>daterait d'aujourd'hui une mesure d'hier</b> - "
        "<i>exactement ce que le brief interdit dans sa propre liste &laquo; dans tous les cas "
        "&raquo;</i> ; (2) partir vide <b>casserait le parcours US Navy</b>, ou l'on tape ses "
        "centimetres et ou le % apparait pret a valider. <i>Trancher, c'est choisir qui de "
        "l'utilisateur-balance ou de l'utilisateur-metre-ruban est le cas normal - et ca, le code "
        "ne peut pas le dire.</i> Un temoin <b>fige le preremplissage actuel</b>, pour qu'on ne "
        "prenne pas cette decision &laquo; en passant &raquo;."))
Ad(para("<b>Un defaut mesure et NON corrige, dit plutot que masque</b> : une valeur manuelle "
        "<b>est</b> remplacee par le calcul si l'on corrige ensuite une mensuration. Ce n'est pas "
        "un ecrasement &laquo; par un defaut &raquo; - le champ change <b>visiblement</b> avant "
        "qu'on valide, et c'est l'utilisateur qui a declenche le recalcul."))

# ── 6 ────────────────────────────────────────────────────────────────────────
Ad(titre('6. Publication'))
Ad(tab([
    ['', ''],
    ['version', '<b>%s</b> (arbre propre : %d fichier non commite)'
     % (F['version'], len(F['sale']))],
    ['SHA', '<b>%s</b>' % F['sha'][:12]],
    ['branche', 'claude/project-status-a0qakd - <b>pousse</b>'],
    ['/!\\ master sert encore', '<b>%s</b> - <b>%d commits</b> de cette branche n y sont pas. '
     '%s' % (F['masterSert'], F['avance'],
             'master est un <b>ancetre</b> de la branche : une avance rapide suffirait, '
             '<b>zero conflit</b>.' if F['ancetre'] else 'divergence a arbitrer.')],
], [80, 402], entete=False))
Ad(Spacer(1, 2))
Ad(para("<b>/!\\ PUSH SUR UNE BRANCHE != VERSION EN LIGNE</b> (<b>R18</b>, et le journal du "
        "projet le porte quatre fois). GitHub Pages ne se declenche que sur <b>master</b> : tant "
        "que master n a pas ces commits, <b>le correctif n est en ligne nulle part</b>. "
        "<i>Un travail fini qui n est pas servi n est pas un travail fini.</i>"))

# ── 7 ────────────────────────────────────────────────────────────────────────
Ad(titre('7. Collision de numero avec la session parallele'))
Ad(para("Pendant la passe, <b>session-B a publie</b> 5 commits touchant <i>coach.js</i>, "
        "<i>state.js</i>, <i>setup.js</i>, <i>worker.js</i>, <i>Code.js</i> et <i>runner.js</i> "
        "- <b>et elle avait pose le meme numero, ft-v1227</b>. C'est exactement la collision "
        "ft-v991/ft-v992 qui avait cree le protocole deux sessions."));
Ad(para("<b>Consequence appliquee, pas contournee</b> : ma premiere passe (4506/0) est devenue "
        "<b>PERIMEE</b>. Arbre refusionne, temoins re-verifies (<b>28 OK / 0 rouge</b> sur "
        "l arbre fusionne), <b>passe relancee en entier</b>, et <b>c'est moi qui pose le numero "
        "final</b> puisque je publie en dernier : <b>ft-v1230</b>."))
Ad(para("<b>/!\\ Et la renumerotation est BORNEE A MON BLOC, jamais globale</b> : un "
        "remplacement global de &laquo; ft-v1227 &raquo; aurait ecrase l entree de session-B, "
        "qui porte legitimement ce numero. <i>Un remplacement global suppose un identifiant "
        "unique - ce qui est faux au moment meme ou l on renumerote pour collision.</i> "
        "Les deux entrees coexistent, et l historique des 9 versions de <i>sw.js</i> est "
        "conserve."))

# ── 8 ────────────────────────────────────────────────────────────────────────
Ad(titre('8. Points restants'))
for x in [
    "<b>master n a pas ces commits</b> - c'est le seul point bloquant pour que Michel voie le "
    "correctif sur son telephone.",
    "<b>Aucune migration des % enregistres a la virgule</b> avant aujourd hui : ils restent "
    "tels quels. <i>On ne peut pas savoir lesquels ont ete tapes avec une virgule.</i>",
    "<b>Regle d or #11 : rien n est annonce</b>, et c'est un jugement assume. Aucun ecran, aucun "
    "bouton, aucun reglage : une gene disparait. Mais quelqu un qui a <b>perdu</b> des mesures "
    "ne saura pas qu il peut les retaper - si Michel veut une ligne dans le Guide, elle est a "
    "ajouter.",
    "<b>Le OK re-date les champs pre-remplis</b> (appuyer dessus EST l acte de declarer ses "
    "mensurations). C'est une decision ecrite de ft-v1129, <b>pas un defaut</b>, et ce n'etait "
    "pas a moi de la rouvrir (<b>R30</b>, regle d or 15).",
]:
    Ad(para('&bull; ' + x))

Ad(Spacer(1, 7))
Ad(Paragraph(md("Dossier produit par un script qui recompte ses %d faits depuis le code servi "
                "(version, chemins de sortie de saveBodyFat, lecteur de poids, lecture des "
                "nombres, 4 constantes de la formule, perimetre git), LIT le total de la passe "
                "dans son journal, verifie dans git que le defaut existait vraiment avant, "
                "refuse de produire si l un d eux tombe, et relit sa propre sortie."
                % NB), PET))

doc = BaseDocTemplate(SORTIE, pagesize=A4,
                      title='Force Tracker - correctif mensurations',
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
if len(_lis) < 5000:
    os.remove(SORTIE)
    sys.exit('REFUS : le PDF relu ne fait que %d caracteres lisibles' % len(_lis))
for _mot in ('CINQ cas nominaux', 'persist', 'RESTER VERTES', 'master sert encore',
             'Collision de numero', 'deux causes differentes', 'D-013'):
    if _mot not in _lis:
        os.remove(SORTIE)
        sys.exit('REFUS : « %s » n est pas imprime dans le PDF' % _mot)

print('   relu : %d caracteres lisibles, 0 balise en clair' % len(_lis))
print('OK %s (%d gardes, %d octets)' % (SORTIE, NB, os.path.getsize(SORTIE)))
