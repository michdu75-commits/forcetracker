#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CARTOGRAPHIE NUTRITION + ARBITRAGES DU REPAS ACTIF (20/09/2026).

⛔⛔ CARTOGRAPHIE, PAS LIVRAISON : aucune ligne de code applicatif n a ete modifiee.
    Les deux seules ecritures de la passe sont `docs/DECISIONS.md` (D-011, D-012) et les
    fichiers de suivi.

⛔⛔ LES GARDES RECOMPTENT CHAQUE FAIT DEPUIS LE CODE SERVI ET REFUSENT DE PRODUIRE SI L UN
    D EUX TOMBE. Les mesures de comportement se LISENT dans le journal de la sonde, jamais
    a la main (lecon ft-v1201) — et le generateur RELIT sa propre sortie (lecon du 18/09,
    ou un dossier livre portait 66 balises en clair).

⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji. Un caractere hors de ce jeu ne PLANTE
    PAS, il sort en glyphe faux : d ou l entonnoir `_win()` ET le garde qui refuse ce qui
    reste inconnu (defaut REEL trouve le 20/09 dans le generateur voisin).

Variables : CAR_PDF (sortie) · CAR_SONDE (journal JSON de la sonde compte-neuf)
"""
import json
import os
import re
import subprocess
import sys
import unicodedata

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, Table, TableStyle)

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.environ.get('CAR_PDF', '/tmp/FORCE-TRACKER-CARTO-NUTRITION-20-09-2026.pdf')
SONDE = os.environ.get('CAR_SONDE', '/tmp/sonde_nutri_carto.log')

_E = []


def g(c, lib):
    if not c:
        _E.append(lib)


def lire(n):
    with open(os.path.join(RACINE, n), encoding='utf-8') as f:
        return f.read()


def sans_comm(src):
    """Neutralise les commentaires JS. ⛔ INDISPENSABLE : les commentaires de ce depot citent
    abondamment les noms que les gardes cherchent (R30 exige que la raison soit ecrite a cote
    du code). Un garde qui lirait le fichier brut resterait vert quoi qu on mette dedans."""
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
    """Rend le corps { … } qui suit `entete` (une regexp), accolades equilibrees."""
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
g(F['version'] == 'ft-v1226', "la version servie est %s, la carto en decrit une autre" % F['version'])

# ══ LES DEUX ARBITRAGES, RECOMPTES DANS LE REGISTRE ══════════════════════════
DEC = lire('docs/DECISIONS.md')
_lignes = {}
for _l in DEC.split('\n'):
    _m = re.match(r'\|\s*(D-\d+)\s*\|', _l)
    if _m:
        _lignes[_m.group(1)] = _l
F['nbDecisions'] = len(_lignes)
g(F['nbDecisions'] >= 12, "seulement %d decisions au registre" % F['nbDecisions'])
for _id, _mot in (('D-011', 'VALID'), ('D-012', 'VALID')):
    g(_id in _lignes, "%s est absente du registre" % _id)
    g(_mot in _lignes.get(_id, ''), "%s n est pas marquee %s" % (_id, _mot))
# ⛔ D-007 DOIT PORTER LE LIEN VERS D-011. Sans lui, on ne peut plus savoir ce qui est encore
#    actif, et la regle d or #15 devient invérifiable — le registre le dit lui-meme.
g('REMPLAC' in _lignes.get('D-007', '') and 'D-011' in _lignes.get('D-007', ''),
  "D-007 ne renvoie plus vers D-011 : le lien de remplacement est obligatoire")
# ⭐ ET LE CONTENU DE L ARBITRAGE, PAS SEULEMENT SON EXISTENCE.
g('CONSERVER' in _lignes.get('D-011', ''), "D-011 ne dit plus CONSERVER")
g('observer' in _lignes.get('D-012', '').lower(), "D-012 ne dit plus d observer")

# ══ LE CODE SERVI, RECOMPTE ══════════════════════════════════════════════════
A = sans_comm(lire('app.js'))
NU = A.replace(' ', '').replace('\n', '')
ST = sans_comm(lire('state.js'))
CO = sans_comm(lire('coach.js'))

# ⭐ Le repas actif : le comportement que D-011 CONSERVE doit encore etre celui qui est servi.
g('let_afMeal=null;' in NU, "l etat du repas actif ne demarre plus a null")
g('function_afMealActif()' in NU, "le proprietaire du repas actif a disparu")
F['lecteurs'] = len(re.findall(r'_afMealActif\(\)', A))
g(F['lecteurs'] >= 4, "seulement %d lecteur(s) passent par le proprietaire" % F['lecteurs'])
# ⛔⛔ LE GARDE-FOU UX DE L OPTION A3 : D-011 s appuie dessus, donc on verifie qu il EXISTE.
#    ⚠️ ON LIT LA SOURCE SANS COMMENTAIRES, ET C EST UN DEFAUT TROUVE PAR MUTATION : le
#    fichier brut porte « jour consulté » DEUX fois — une dans le message affiche, une dans
#    le commentaire qui explique pourquoi il existe (R30). Un garde qui lit le brut serait
#    donc reste VERT alors que le message avait disparu de l ecran.
g('jour consulté' in A,
  "le message ne dit plus « jour consulte » : le garde-fou sur lequel D-011 s appuie a disparu")

# ⭐ LA DOUANE — 21 regles, comptees dans la fonction, jamais citees.
_d = bloc(A, r'function\s+_douaneLigne\s*\([^)]*\)\s*')
_noms = re.findall(r"dit\(\s*'([a-z0-9_]+)'\s*,\s*'(INVALID|WARN)'", _d)
F['douaneN'] = len(_noms)
F['douaneInvalid'] = sum(1 for _, gr in _noms if gr == 'INVALID')
F['douaneWarn'] = F['douaneN'] - F['douaneInvalid']
g(F['douaneN'] == 21, "la douane compte %d regles au lieu de 21" % F['douaneN'])
g(F['douaneInvalid'] == 9, "la douane compte %d INVALID au lieu de 9" % F['douaneInvalid'])
# ⛔ AUCUNE REGLE BLOQUANTE : c est la borne du gel. On la RECOMPTE au lieu de la croire.
g('S.foodLog' not in _d and 'return false' not in _d,
  "la douane touche desormais au journal ou refuse une ligne : le gel est rompu")

# ⭐ LES MECANISMES GELES (portions / habitudes) — ils doivent etre INTACTS.
g('_RESTE_MAX_G = 250' in lire('app.js') or '_RESTE_MAX_G=250' in NU,
  "le repli generique de 250 g a change : un mecanisme gele a bouge")
g('s.n>=2' in NU, "la regle des habitudes `n >= 2` a change : un mecanisme gele a bouge")

# ⭐ CIQUAL — le chiffre se LIT dans le fichier de donnees, jamais dans la doc.
_ciq = json.load(open(os.path.join(RACINE, 'data', 'ciqual.json'), encoding='utf-8'))
F['ciqual'] = len(_ciq.get('a', []))
g(F['ciqual'] == 3484, "CIQUAL porte %d aliments au lieu de 3484" % F['ciqual'])

# ⭐ LE SCANNER : local par capture, live eteint. Deux faits, deux gardes.
g("_bcMoteurDemande='zxing-wasm'" in NU, "le scanner ne demande plus le moteur retenu au banc")
_sb = bloc(A, r'function\s+scanBarcode\s*\(\s*\)\s*')
g('_bcLiveActif=false' in _sb.replace(' ', ''), "le live n est plus eteint dans scanBarcode")

# ⭐ LE PLAN DE REPAS EST UNE TABLE FIGEE — c est le sujet OUVERT n°2.
F['tablesFigees'] = len(re.findall(r'const\s+(?:KETO|LOWCARB|PALEO|MEDIT)_MEALS\s*=', ST))
g(F['tablesFigees'] >= 2, "les tables de repas figees ont disparu : le sujet 2 n existe plus")

# ⭐ LE SUIVI DU PLAN SUR LA DUREE N EXISTE PAS — c est le sujet OUVERT n°4, et une ABSENCE
#   se prouve en comptant, jamais en affirmant.
F['adherence'] = sum(len(re.findall(r'adherence|suiviDuPlan|respectPlan', sans_comm(lire(f))))
                     for f in ('app.js', 'screens.js', 'state.js'))
g(F['adherence'] == 0,
  "un suivi du plan existe desormais (%d occurrence(s)) : le sujet 4 est perime" % F['adherence'])

# ⭐ `estimateFoodAI` NE PASSE PAS PAR `_ref100` — sujet OUVERT n°6, recompte.
_ef = bloc(A, r'async\s+function\s+estimateFoodAI\s*\([^)]*\)\s*')
g(_ef != '', "estimateFoodAI est introuvable")
F['efRef100'] = len(re.findall(r'_ref100', _ef))
g(F['efRef100'] == 0,
  "estimateFoodAI passe desormais par _ref100 : le sujet 6 est regle, pas ouvert")

# ══ LES 21 CAPACITES IA ══════════════════════════════════════════════════════
CAP = lire('capacites-ia.js')
_blocs = re.split(r"\n\s*\{\s*\n\s*id:", CAP)[1:]
F['capN'] = 0
F['capNutri'] = 0
_pol = {}
for b in _blocs:
    m = re.match(r"\s*'([^']+)'", b)
    if not m:
        continue
    F['capN'] += 1
    i = m.group(1)
    if i.startswith('nutrition'):
        F['capNutri'] += 1
    mp = re.search(r"politique:\s*'([A-Z_]+)'", b)
    me = re.search(r"etatCode:\s*'([A-Z_]+)'", b)
    _pol[i] = (mp.group(1) if mp else '?', me.group(1) if me else '?')
g(F['capN'] == 21, "%d capacites au lieu de 21" % F['capN'])
g(F['capNutri'] == 6, "%d capacites Nutrition au lieu de 6" % F['capNutri'])
F['serveurTrue'] = len(re.findall(r'serveurApplique:\s*true', CAP))
g(F['serveurTrue'] == 0,
  "%d capacite(s) portent deja le verrou serveur : la dependance est perimee" % F['serveurTrue'])
# ⛔ LES DEUX ECARTS NUTRITION QUI ATTENDENT LE VERROU, NOMMES ET VERIFIES.
g(_pol.get('nutrition.barcode.aiFallback') == ('PREMIUM', 'FREEMIUM'),
  "le repli code-barres n est plus PREMIUM/FREEMIUM : %s" % str(_pol.get('nutrition.barcode.aiFallback')))
g(_pol.get('nutrition.mealPlanImport.ai') == ('PREMIUM', 'FREE'),
  "l import de plan n est plus PREMIUM/FREE : %s" % str(_pol.get('nutrition.mealPlanImport.ai')))
_doc = lire('docs/IA-FREE-PREMIUM.md')
_me = re.search(r'Les écarts entre la politique et le code \((\d+)\)', _doc)
F['ecarts'] = int(_me.group(1)) if _me else 0
g(F['ecarts'] == 12, "%d ecarts au lieu de 12" % F['ecarts'])

# ══ `foodLog` ATTEINT-IL MILO ? — LE POINT QUI CORRIGE UNE LIGNE D ETAT FAUSSE ═
_cls = json.load(open(os.path.join(RACINE, 'tests', 'donnees', 'donnees-milo.json'),
                      encoding='utf-8'))
F['transmis'] = len(_cls['transmis'])
F['manquant'] = sorted(_cls['manquant'].keys())
g('foodLog' in _cls['transmis'],
  "foodLog n est plus classe `transmis` : la correction R23 de la carto serait fausse")
g(F['manquant'] == ['badges', 'dayStateLog'],
  "les trous connus ne sont plus badges + dayStateLog : %s" % F['manquant'])
F['foodLogCoach'] = len(re.findall(r'S\.foodLog', CO))
g(F['foodLogCoach'] >= 1, "coach.js ne lit plus S.foodLog : foodLog n atteint plus Milo")
g('slice(-7)' in CO.replace(' ', ''), "le resume du journal ne porte plus sur 7 jours")

# ══ L ETAT GIT ═══════════════════════════════════════════════════════════════
F['sha'] = subprocess.run(['git', 'rev-parse', 'HEAD'],  # noqa
                          capture_output=True, text=True, cwd=RACINE).stdout.strip()
_sale = subprocess.run(['git', 'status', '--porcelain'],  # noqa
                       capture_output=True, text=True, cwd=RACINE).stdout.strip()
F['sale'] = [x[3:] for x in _sale.splitlines()] if _sale else []
_SERVI = (r'^(app|state|screens|log|coach|setup|tracking|constants|supabase|worker|Code|sw|'
          r'capacites-ia)\.js$|^index\.html$|^tests/')
_risque = [x for x in F['sale'] if re.match(_SERVI, x)]
# ⛔ UNE CARTO N A MODIFIE AUCUN FICHIER SERVI NI AUCUN TEST. C est la garantie centrale :
#    s il en restait un, le titre « cartographie » serait faux.
g(not _risque, "FAUX : des fichiers servis ou de test sont modifies : %s" % _risque)
_cc = subprocess.run(['git', 'diff', '--name-only', 'HEAD...origin/master'],  # noqa
                     capture_output=True, text=True, cwd=RACINE).stdout.split()
F['ccServis'] = [x for x in _cc if re.match(_SERVI, x)]
g(not F['ccServis'],
  "la session concurrente a touche des fichiers servis : %s" % F['ccServis'])
# ⛔ ET LE FICHIER NUTRITION LE PLUS SENSIBLE N A PAS BOUGE DEPUIS ft-v1226.
_depuis = subprocess.run(  # noqa
    ['git', 'log', '--oneline', 'eddc7551..HEAD', '--', 'app.js', 'state.js', 'screens.js'],
    capture_output=True, text=True, cwd=RACINE).stdout.strip()
g(_depuis == '',
  "des fichiers Nutrition ont change depuis ft-v1226 : les mesures de l audit sont perimees")

# ══ LES MESURES DU COMPTE NEUF, LUES DANS LE JOURNAL DE LA SONDE ═════════════
g(os.path.exists(SONDE), "journal de sonde introuvable (%s) : une carto ne publie pas une "
                         "mesure qu elle n a pas lue" % SONDE)
try:
    SN = json.load(open(SONDE, encoding='utf-8'))
except Exception:                                      # noqa
    SN = {}
    _E.append("le journal de la sonde est illisible : la mesure n a pas ete faite")


def sm(cas, champ):
    try:
        n = SN[cas]['macros'] if champ != 'tdee' else SN[cas]
        v = n['tdee'] if champ == 'tdee' else n[champ]
        return v
    except Exception:                                  # noqa
        _E.append("la sonde ne rend pas %s/%s : la mesure n a pas ete faite" % (cas, champ))
        return None


F['A'] = {k: sm('A', k) for k in ('tdee', 'calories', 'prot_g', 'fat_g', 'carbs_g')}
F['B'] = {k: sm('B', k) for k in ('tdee', 'calories', 'prot_g', 'fat_g', 'carbs_g')}
F['C'] = {k: sm('C', k) for k in ('tdee', 'calories')}
F['cite1500'] = (SN.get('D') or {}).get('cite1500')
# ⛔⛔ LES DEUX FAITS QUI FONDENT LE SUJET OUVERT N°1, VERIFIES DANS LA MESURE ELLE-MEME.
#    Si le defaut etait corrige, ce dossier ferait chercher quelque chose qui n existe plus.
g(F['A']['tdee'] == 0 and F['A']['calories'] == 1500 and F['A']['prot_g'] == 0,
  "le compte neuf ne rend plus 0 / 1500 / 0 : le sujet 1 est corrige, ce dossier est perime")
g(F['B']['tdee'] == 0 and F['B']['calories'] == 1500 and F['B']['prot_g'] > 0,
  "le cas « poids seul » ne rend plus un plan credible sur un TDEE nul : sujet 1 perime")
g(isinstance(F['C']['tdee'], int) and F['C']['tdee'] > 1000,
  "le temoin « profil complet » ne rend plus un TDEE reel : la sonde mesure autre chose")
g(isinstance(F['cite1500'], int) and F['cite1500'] >= 1,
  "l ecran Nutrition ne cite plus le chiffre invente : sujet 1 perime")

if _E:
    print('REFUS DE PRODUIRE — %d garde(s) tombe(s) :' % len(_E))
    for x in _E:
        print('  - ' + x)
    sys.exit(1)

NB = 30

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
             '❌': 'X', '–': '-', ' ': ' ', '⬆': '^'}


def _win(t):
    """Rend le texte imprimable en WinAnsi, et NOTE ce qu il n a pas su rendre.
    ⛔ Un caractere hors jeu ne plante pas, il s affiche en glyphe faux — donc rien ne le
    signale sauf un garde. Defaut REEL trouve le 20/09 dans le generateur de l audit."""
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
    t = re.sub(r'&amp;(amp|lt|gt|nbsp|laquo|raquo|bull|#\d+);', r'&\1;', t)
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
Ad(titre('FORCE TRACKER — CARTOGRAPHIE NUTRITION', H1))
Ad(titre('ARBITRAGE DU REPAS ACTIF + CE QUI RESTE OUVERT — 20/09/2026', H1))
Ad(Spacer(1, 4))
Ad(para("<b>CARTOGRAPHIE, PAS LIVRAISON.</b> Aucune ligne de code applicatif n a ete "
        "modifiee : <b>%d fichier(s) non commite(s)</b>, aucun servi, aucun test. Michel : "
        "<i>« ne lance aucun nouveau developpement Nutrition avant mon arbitrage »</i> et "
        "<i>« STOP apres la cartographie »</i>. <b>Le chantier Nutrition n est PAS ferme</b> "
        "— seule une question UX l est." % len(F['sale'])))

# ── 1 ────────────────────────────────────────────────────────────────────────
Ad(titre('1. Les deux arbitrages, consignes au registre'))
Ad(tab([
    ['id', 'sujet', 'decision de Michel', 'code'],
    ['<b>D-011</b>', 'le choix manuel du repas au <b>changement de jour</b>',
     '<b>CONSERVER</b> le comportement actuel. Remplace <b>D-007</b> (« ne rien decider »).',
     '<b>0 ligne</b> — le comportement voulu est celui deja servi'],
    ['<b>D-012</b>', 'le choix survit-il a un <b>rechargement de la PWA</b> ?',
     '<b>NE PAS CORRIGER</b> — observer l usage reel', '<b>0 ligne</b>'],
], [42, 150, 200, 90]))
Ad(Spacer(1, 3))
Ad(para("<b>Ce qui a ete ECARTE, et pourquoi c est une mesure et pas un gout.</b> Pour A, "
        "<i>reinitialiser au changement de jour</i> : la suggestion horaire est celle de "
        "<b>maintenant</b>, pas du jour consulte — remplir hier soir a 9 h proposerait "
        "« Petit-dej ». Elle rendrait la suggestion <b>moins</b> pertinente. Pour B, "
        "<i>corriger tout de suite parce que c etait simple</i> : c est le motif que <b>R19</b> "
        "refuse — une correction dimensionnee pour une gene qu on n a pas est une dette."))
Ad(para("<b>Et le garde-fou de A existe deja</b>, verifie dans le code servi : la confirmation "
        "affiche « Ajoute · Dejeuner, <b>jour consulte</b> » des qu on n est pas sur "
        "aujourd hui. Le proprietaire unique du repas actif a <b>%d lecteurs</b>, tous passes "
        "par lui." % F['lecteurs']))

# ── 2 ────────────────────────────────────────────────────────────────────────
Ad(titre('2. TERMINE / STABLE — ne demande rien'))
Ad(tab([
    ['quoi', 'preuve mesuree'],
    ['Provenance de chaque ligne du journal (<i>saisie</i> + <i>origine</i> + <i>q</i> + '
     '<i>per100</i>)', 'ft-v907, « brique 0 » — le brief dit de ne pas la refaire'],
    ['Base CIQUAL cote Journal, chargee a la demande',
     '<b>%d aliments</b> comptes dans data/ciqual.json' % F['ciqual']],
    ['Recherche Open Food Facts + « ce que tu as deja note »', 'ft-v956'],
    ['Scanner code-barres <b>LOCAL</b> par capture, 0 appel IA',
     'moteur <i>zxing-wasm</i> demande, live eteint — les deux recomptes ; valide iPhone 17/09'],
    ['Les lois physiques d entree (masse · kcal · E &gt;= 4P + 9L)',
     'ft-v1103 / v1162 / v1207 — 0 faux positif sur 3 607 aliments'],
    ['Plancher de cible calorique (1 500 H / 1 200 F) + explication a l ecran', 'ft-v906'],
    ['Journal &lt;-&gt; Plan : « ce qu il te reste, en vrai »', 'ft-v1019'],
    ['Glucides plus hauts les jours de seance, pre/post ces jours-la seulement',
     'ft-v951 / v950 — <i>_heureSeance()</i> et <i>jourSeance()</i> lus dans state.js'],
    ['Le repas choisi a la main reste actif · les 3 pots IA separes',
     'ft-v1226 / v1225 — arbitre ce matin'],
    ['<b>foodLog atteint bien Milo</b>', 'classe <i>transmis</i> ; coach.js en envoie les '
     'totaux par jour sur <b>7 jours</b>, jamais la liste plate'],
], [175, 307]))

# ── 3 ────────────────────────────────────────────────────────────────────────
Ad(titre('3. EN OBSERVATION — il faut des donnees, pas du code'))
Ad(tab([
    ['sujet', 'etat mesure', 'ce qu on attend'],
    ['<b>La douane</b>', '<b>%d regles</b> (%d INVALID, %d WARN), <b>aucune bloquante</b>, '
     'aucune ligne corrigee' % (F['douaneN'], F['douaneInvalid'], F['douaneWarn']),
     '&gt;= 100 lignes · les <b>4 ecrivains</b> vus · ~2 semaines · <b>et une couverture reelle '
     'des formes</b>. Le rapport est sur le telephone de Michel.'],
    ['<b>Portions / habitudes</b>', 'repli generique 250 g et regle <i>n &gt;= 2</i> '
     '<b>intacts</b>, recomptes', 'usage reel — gele a la demande de Michel'],
    ['<b>Repas actif au rechargement</b>', 'D-012', 'une gene <b>reellement rencontree</b>'],
    ['<b>Scanner live</b>', 'eteint dans <i>scanBarcode</i>, capture seule',
     'il avait produit <b>1 code FAUX de cle valide</b> — le pire cas'],
], [105, 185, 192]))
Ad(Spacer(1, 3))
Ad(para("/!\\ <b>La consigne a ne pas oublier le jour du rapport</b> : <i>une regle qui n a "
        "jamais mordu n est PAS automatiquement inutile</i> — il faut d abord verifier que les "
        "formes capables de la declencher ont reellement ete rencontrees. Sans cette "
        "verification, « jamais mordu » se lit « a supprimer », et on retire un garde-fou parce "
        "que le cas ne s est pas encore presente."))

# ── 4 ────────────────────────────────────────────────────────────────────────
Ad(titre('4. OUVERT — les vrais sujets, chacun avec sa preuve'))
Ad(para("<b>1. Le compte neuf invente un besoin calorique.</b> Re-mesure le 20/09 sur l arbre "
        "servi, en conduisant l app :"))
Ad(tab([
    ['profil', 'calcTDEE()', 'cible', 'prot', 'lip', 'gluc'],
    ['<b>compte vierge</b>', '<b>%s</b>' % F['A']['tdee'], '<b>%s kcal</b>' % F['A']['calories'],
     '<b>%s g</b>' % F['A']['prot_g'], '<b>%s g</b>' % F['A']['fat_g'],
     '%s g' % F['A']['carbs_g']],
    ['<b>poids seul</b> (ni taille ni age)', '<b>%s</b>' % F['B']['tdee'],
     '<b>%s kcal</b>' % F['B']['calories'], '%s g' % F['B']['prot_g'],
     '%s g' % F['B']['fat_g'], '%s g' % F['B']['carbs_g']],
    ['profil complet (temoin)', '%s' % F['C']['tdee'], '%s kcal' % F['C']['calories'],
     '-', '-', '-'],
], [150, 62, 70, 62, 62, 66]))
Ad(Spacer(1, 2))
Ad(para("/!\\ <b>Le cas INVISIBLE est le dangereux, pas le laid.</b> Le second est un plan "
        "<i>parfaitement credible</i> bati sur un TDEE inconnu. L ecran Nutrition cite "
        "<b>%d fois</b> ce chiffre, affiche « TDEE 0 », et un garde-fou explique qu il a "
        "remonte une cible... qu il venait d inventer. <b>C est le seul defaut de correction "
        "du lot.</b>" % F['cite1500']))
Ad(Spacer(1, 3))
Ad(tab([
    ['#', 'sujet ouvert', 'preuve dans le depot'],
    ['2', '<b>Le plan de repas est une table figee</b> — zero question alimentaire posee, plan '
     'identique pour tout le monde', '<b>%d tables</b> ecrites en dur dans state.js'
     % F['tablesFigees']],
    ['3', '<b>La 2e base</b>, celle du generateur (~300 aliments composables, regimes et '
     'allergenes en liste blanche)', 'NUTRITION-MOTEUR §4.0 ; mode d echec grave (allergenes)'],
    ['4', '<b>Le suivi du plan sur la duree</b> — « tu as suivi ton plan a 80 % cette semaine »',
     '<b>%d occurrence</b> dans app.js, screens.js et state.js' % F['adherence']],
    ['5', 'La journee <b>n est pas reordonnee</b> selon l heure de seance',
     'dette <i>_heureSeance</i> ecrite dans le code, non payee'],
    ['6', '<b>estimateFoodAI ne passe pas par _ref100</b> — seule porte hors du resolveur',
     '<b>%d appel</b> a _ref100 dans son corps' % F['efRef100']],
    ['7', 'L ecart <b>48,3 / 48</b> — non tranche',
     'le proxy refuse Open Food Facts (403) ; devenu <b>mesurable</b> depuis ft-v1207'],
    ['8', 'Contradiction proteines : fiche whey <b>1,6-2 g/kg</b> vs moteur <b>2,0-2,6</b>',
     'bloquee <i>expres</i> — harmoniser au juge inventerait une 3e valeur'],
], [18, 226, 238]))

# ── 5 ────────────────────────────────────────────────────────────────────────
Ad(titre('5. DEPENDANCE PRINCIPAL — a ne pas absorber dans Nutrition'))
Ad(para("<b>Le verrou serveur des capacites IA.</b> Recompte : <b>%d capacites</b>, dont "
        "<b>%d Nutrition</b> ; <b>serveurApplique = false sur les %d</b> ; <b>%d ecarts</b> "
        "ecrits entre la politique et le code."
        % (F['capN'], F['capNutri'], F['capN'], F['ecarts'])))
Ad(tab([
    ['capacite Nutrition', 'politique voulue', 'etat du code', 'consequence'],
    ['nutrition.barcode.aiFallback', '<b>PREMIUM</b>', '<b>FREEMIUM</b>',
     'garde son pot de 25 (<b>D-006</b>) : lui retirer sans le verrou le rendrait '
     '<b>illimite et gratuit</b>'],
    ['nutrition.mealPlanImport.ai', '<b>PREMIUM</b>', '<b>FREE</b>',
     'la lecture IA d un plan reste gratuite dans le code ; la saisie manuelle reste libre '
     'par decision'],
], [128, 74, 66, 214]))
Ad(Spacer(1, 3))
Ad(para("<b>Les autres dependances</b> : <i>badges</i> et <i>dayStateLog</i> n atteignent pas "
        "Milo (trous de contexte general, pas Nutrition — ce sont les <b>%d seuls</b> trous "
        "declares, sur <b>%d donnees transmises</b>) · et les <b>barreaux sautes</b> (R33) : "
        "<i>_pdfToText</i>, 100 %% local, n a qu un appelant — le banc d essai — pendant que les "
        "4 imports envoient des images au modele."
        % (len(F['manquant']), F['transmis'])))

# ── 6 ────────────────────────────────────────────────────────────────────────
Ad(titre('6. IDEES / FUTUR — evoque, ni decide ni necessaire'))
Ad(para("&bull; Recolter les calibrages pour une base maison (la matiere premiere est deja "
        "produite depuis ft-v1110/v1165) &bull; questions alimentaires — <b>pas 15</b>, le "
        "questionnaire d entrainement en pose 6 &bull; micronutriments — entre dans le domaine "
        "medical &bull; variantes des modes keto / low-carb / paleo &bull; cout, temps de "
        "preparation, saison &bull; recettes."))

# ── 7 ────────────────────────────────────────────────────────────────────────
Ad(titre('7. Prochains sujets possibles — Michel choisit, je ne choisis pas'))
Ad(tab([
    ['#', 'sujet', 'valeur utilisateur', 'dependances', 'risque', 'taille'],
    ['1', '<b>Le compte neuf n invente plus de cible</b>',
     'quelqu un qui installe l app ne recoit plus un plan faux et credible', 'aucune',
     '<b>faible</b> — mais touche calcMacros, lu partout : le geste sur est de dire « je ne '
     'sais pas », pas de changer la formule', 'petite a moyenne'],
    ['2', '<b>Lire le rapport de la douane et trancher les 21 regles</b>',
     'indirecte — c est la fiabilite du journal', '<b>le rapport de Michel</b>',
     'faible (analyse seule)', 'moyenne'],
    ['3', '<b>Le plan de repas cesse d etre identique pour tout le monde</b>',
     '<b>la plus forte du lot</b>', 'la 2e base OU l observation du journal',
     '<b>eleve</b> — allergenes, et P21 anti-TCA', 'grande'],
    ['4', '<b>estimateFoodAI passe par le resolveur</b>', 'faible et invisible', 'aucune',
     'faible', 'petite'],
    ['5', '<b>Le suivi du plan sur la duree</b>', 'moyenne', 'aucune',
     '<b>moyen</b> — un « 62 % » se lit comme une note (P21)', 'moyenne'],
    ['6', '<b>Recolter les calibrages</b>', 'differee',
     '<b>backend</b> ; pas dans les Script Properties', 'moyen (consentement, calibrage faux)',
     'moyenne'],
], [14, 118, 108, 88, 110, 44]))
Ad(Spacer(1, 3))
Ad(para("<b>Pourquoi chacun existe</b> : 1 et 6 sortent d une mesure faite ici ; 2 est la suite "
        "d un gel decide par Michel ; 3 est sa propre phrase du 26/08 (<i>« on connait l athlete "
        "sportivement, pas du tout alimentairement »</i>) ; 4 et 5 sont des trous nommes dans "
        "NUTRITION-MOTEUR. <b>Aucun n est lance</b>, et je ne choisis pas a sa place."))

# ── 8 ────────────────────────────────────────────────────────────────────────
Ad(titre('8. Une ligne d etat fausse, corrigee au passage (R23)'))
Ad(para("<i>docs/JOURNAL-DE-TEST.md</i> (26/08) dit que <b>foodLog est EXCLU</b> du contexte de "
        "Milo, avec la mention « DECISION A CONFIRMER », jamais confirmee. <b>C est perime.</b> "
        "Il est classe <b>transmis</b> dans le fichier de classement, et coach.js en envoie les "
        "<b>totaux par jour sur 7 jours</b> — jamais la liste plate, qui pesait 13 126 "
        "caracteres. <b>Les deux vrais trous restants sont %s.</b>"
        % ' et '.join(F['manquant'])))
Ad(para("/!\\ <i>Un document d etat faux fait raisonner de travers celui qui le lit</i> — et "
        "celui-la aurait fait proposer de brancher une chose deja branchee."))

Ad(Spacer(1, 7))
Ad(Paragraph(md("Dossier produit par un script qui recompte ses %d faits depuis le code servi "
                "(version, registre des decisions, 21 regles de la douane, %d capacites IA, "
                "classement des donnees, absence du suivi de plan), lit les mesures du compte "
                "neuf DANS LE JOURNAL DE LA SONDE, refuse de produire si l un d eux tombe, et "
                "relit sa propre sortie. SHA %s."
                % (NB, F['capN'], F['sha'][:8])), PET))

doc = BaseDocTemplate(SORTIE, pagesize=A4,
                      title='Force Tracker - cartographie Nutrition',
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
# ⛔ LES MOTS QUI DECIDENT DU DOSSIER DOIVENT ETRE IMPRIMES. Un garde qui verifie la SOURCE
#    ne prouve rien sur ce qui est IMPRIME (lecon du 18/09).
for _mot in ('CARTOGRAPHIE, PAS LIVRAISON', 'CONSERVER', 'Michel choisit',
             'n est PAS ferme', 'jamais mordu'):
    if _mot not in _lis:
        os.remove(SORTIE)
        sys.exit('REFUS : « %s » n est pas imprime dans le PDF' % _mot)

print('   relu : %d caracteres lisibles, 0 balise en clair' % len(_lis))
print('OK %s (%d gardes, %d octets)' % (SORTIE, NB, os.path.getsize(SORTIE)))
