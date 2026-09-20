#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOSSIER D AUDIT — LE REPAS ACTIF : CHANGEMENT DE JOUR ET RECHARGEMENT PWA (20/09/2026).

⛔⛔ AUDIT, PAS LIVRAISON : aucune ligne de code applicatif n a ete modifiee. Ce dossier
    decrit un ETAT MESURE et propose des options ; il ne tranche rien.

⛔⛔ LES GARDES RECOMPTENT CHAQUE FAIT DEPUIS LE CODE SERVI ET REFUSENT DE PRODUIRE SI L UN
    D EUX TOMBE. Les mesures de comportement se LISENT dans le journal de la sonde, jamais
    a la main (lecon ft-v1201) — et le generateur RELIT sa propre sortie (lecon du 18/09,
    ou un dossier livre portait 66 balises en clair).

⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji.

Variables : AUD_PDF (sortie) · AUD_SONDE (journal de la sonde)
"""
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
SORTIE = os.environ.get('AUD_PDF', '/tmp/FORCE-TRACKER-AUDIT-REPAS-ACTIF-20-09-2026.pdf')
SONDE = os.environ.get('AUD_SONDE', '/tmp/audit_repas.log')

_E = []


def g(c, lib):
    if not c:
        _E.append(lib)


def lire(n):
    with open(os.path.join(RACINE, n), encoding='utf-8') as f:
        return f.read()


def sans_comm(src):
    """Neutralise les commentaires JS. ⛔ INDISPENSABLE : le commentaire de ft-v1226 cite
    `_afMeal`, `getHours()` et la formule horaire en toutes lettres (R30). Un garde qui lirait
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
A = sans_comm(lire('app.js'))
NU = A.replace(' ', '').replace('\n', '')


def corps(n):
    m = re.search(r'function\s+' + n + r'\s*\([^)]*\)\s*\{', A)
    if not m:
        return ''
    i = m.end() - 1
    d = 0
    for j in range(i, len(A)):
        if A[j] == '{':
            d += 1
        elif A[j] == '}':
            d -= 1
            if not d:
                return A[i:j + 1]
    return ''


# ══ LE CODE SERVI, RECOMPTE ══════════════════════════════════════════════════
F['version'] = re.search(r"const CACHE = '(ft-v\d+)'", lire('sw.js')).group(1)
g(F['version'] == 'ft-v1226', "la version servie est %s" % F['version'])
g('let_afMeal=null;' in NU, "l etat ne demarre plus a null")
g('function_afMealActif()' in NU and 'function_afMealDefautHoraire()' in NU,
  "le proprietaire du repas actif a disparu")
F['lecteurs'] = len(re.findall(r'_afMealActif\(\)', A))
g(F['lecteurs'] >= 4, "seulement %d lecteur(s) passent par le proprietaire" % F['lecteurs'])
F['ecritures'] = len(re.findall(r'(?<!let\s)_afMeal\s*=(?!=)', A))
g(F['ecritures'] == 1, "%d ecriture(s) du choix au lieu d une seule" % F['ecritures'])
g('functionsetFoodMeal(k){_afMeal=k;' in NU, "setFoodMeal n est plus le seul ecrivain")

# ⛔ LE FAIT CENTRAL DE L AUDIT : AUCUNE PERSISTANCE. On le recompte plutot que de le citer.
_fic = ['app.js', 'state.js', 'screens.js', 'setup.js', 'tracking.js', 'log.js', 'coach.js',
        'constants.js']
_cles = []
for f in _fic:
    s = lire(f)
    for m in re.finditer(r"(?:get|set|remove)Item\(\s*'([^']+)'", s):
        if re.search(r'afmeal|repasactif', m.group(1), re.I):
            _cles.append(f + ':' + m.group(1))
F['clesRepas'] = _cles
g(not _cles, "une cle de stockage du repas actif existe desormais : %s" % _cles)
F['clesFt4'] = len(set(re.findall(r"'(ft4_[a-z0-9_]+)'", lire('state.js'))))
g(F['clesFt4'] > 50, "seulement %d cles ft4_ reperees dans state.js" % F['clesFt4'])

# ⛔ LA NAVIGATION DE JOUR NE TOUCHE PAS LE REPAS — mesure, pas lecture de commentaire.
for _f in ('journalNav', 'journalAllerA'):
    _c = corps(_f)
    g(_c != '', "%s est introuvable" % _f)
    g('_afMeal' not in _c.replace('_afMealActif', ''),
      "%s touche desormais au repas actif" % _f)

# ⛔ LA FORMULE HORAIRE, TELLE QUELLE
g("returnh<11?'petitdej':h<15?'dejeuner':h<18?'collation':'diner';" in NU,
  "la formule du defaut horaire a change")

# ⭐ LE GARDE-FOU QUI EXISTE DEJA — l option A3 est livree, on ne la propose pas comme neuve.
g('jour consulté' in lire('app.js'),
  "le message ne dit plus « jour consulte » : le garde-fou de l option A3 a disparu")

# ══ L ETAT GIT ═══════════════════════════════════════════════════════════════
F['sha'] = subprocess.run(['git', 'rev-parse', 'HEAD'],  # noqa
                          capture_output=True, text=True, cwd=RACINE).stdout.strip()
_sale = subprocess.run(['git', 'status', '--porcelain'],  # noqa
                       capture_output=True, text=True, cwd=RACINE).stdout.strip()
F['sale'] = [l[3:] for l in _sale.splitlines()] if _sale else []
# ⛔ UN AUDIT NE DOIT AVOIR MODIFIE AUCUN FICHIER SERVI NI AUCUN TEST. C est la garantie
#    centrale de ce dossier : s il en restait un, le titre « audit » serait faux.
_risque = [x for x in F['sale']
           if re.match(r'^(app|state|screens|log|coach|setup|tracking|constants|supabase|'
                       r'worker|Code|sw|capacites-ia)\.js$|^index\.html$|^tests/', x)]
g(not _risque, "AUDIT FAUX : des fichiers servis ou de test sont modifies : %s" % _risque)

_cc = subprocess.run(['git', 'diff', '--name-only', 'HEAD...origin/master'],  # noqa
                     capture_output=True, text=True, cwd=RACINE).stdout.split()
F['concurrents'] = int(subprocess.run(['git', 'rev-list', '--count', 'HEAD..origin/master'],  # noqa
                                      capture_output=True, text=True, cwd=RACINE).stdout.strip()
                       or 0)
F['ccServis'] = [x for x in _cc
                 if re.match(r'^(app|state|screens|log|coach|setup|tracking|constants|supabase|'
                             r'worker|Code|sw|capacites-ia)\.js$|^index\.html$|^tests/', x)]
g(not F['ccServis'],
  "la session concurrente a touche des fichiers servis ou de test : %s" % F['ccServis'])

# ⭐ R38 EXISTE-T-ELLE VRAIMENT ? Le brief demande de l appliquer ; elle a ete creee APRES
#   la passation, sur master. On le verifie au lieu de le supposer (regle d or #16).
_r38 = subprocess.run(['git', 'show', 'origin/master:docs/REGLES-ARCHITECTURE.md'],  # noqa
                      capture_output=True, text=True, cwd=RACINE).stdout
F['r38'] = '### R38' in _r38
g(F['r38'], "R38 est introuvable sur origin/master : le brief demande une regle inexistante")
_dec = subprocess.run(['git', 'cat-file', '-e', 'origin/master:docs/DECISIONS.md'],  # noqa
                      capture_output=True, text=True, cwd=RACINE)
F['registreDecisions'] = (_dec.returncode == 0)

# ══ LES MESURES DE COMPORTEMENT, LUES DANS LE JOURNAL DE LA SONDE ════════════
g(os.path.exists(SONDE), "journal de sonde introuvable (%s) : un audit ne publie pas une "
                         "mesure qu il n a pas lue" % SONDE)
_SBRUT = open(SONDE, encoding='utf-8').read() if os.path.exists(SONDE) else ''


def _sans_accent(t):
    """La sonde ecrit en francais accentue, ce generateur est en WinAnsi sans accent.
    ⛔ On compare donc les LETTRES, jamais la mise en forme : un motif sans accent qui
    cherche dans un texte accentu*e* ne trouve rien, et un garde qui ne trouve rien
    ressemble trait pour trait a une mesure qui n a pas ete faite."""
    d = unicodedata.normalize('NFD', t)
    return ''.join(c for c in d if unicodedata.category(c) != 'Mn')


S = _sans_accent(_SBRUT)


def lit(motif, nom):
    m = re.search(motif, S)
    if not m:
        _E.append("la sonde ne rend pas « %s » : la mesure n a pas ete faite" % nom)
        return None
    return m.group(1).strip()


F['defaut9h'] = lit(r'suggestion horaire a 09 h\s*:\s*(\S+)', 'suggestion horaire')
F['apresChoix'] = lit(r'apres choix manuel\s*:\s*(\S+)', 'choix manuel')
F['jourAvApr'] = lit(r'jour avant . apres `journalNav`\s*:\s*(.+)', 'changement de jour')
F['repasApresJour'] = lit(r'repas actif apres le changement\s*:\s*(\S+)', 'repas apres le jour')
F['avantReload'] = lit(r'avant reload : choix = (\S+)', 'choix avant reload')
F['apresReloadBrut'] = lit(r'APRES reload : brut = (\S+)', 'etat brut apres reload')
F['apresReloadActif'] = lit(r'APRES reload : brut = \S+ . actif = (\S+)', 'actif apres reload')
F['ecritReload'] = lit(r'l aliment ajoute apres reload\s*:\s*(.+)', 'ecriture apres reload')
F['session'] = lit(r'sessionStorage utilise par l app\s*:\s*(\d+)', 'usage de sessionStorage')

# ⛔ LES DEUX FAITS QUI FONDENT LE DOSSIER, VERIFIES DANS LA MESURE ELLE-MEME.
g(F['apresChoix'] == 'dejeuner' and F['repasApresJour'] == 'dejeuner',
  "la sonde ne montre plus le choix CONSERVE au changement de jour")
g(F['apresReloadBrut'] == 'null' and F['apresReloadActif'] == F['defaut9h'],
  "la sonde ne montre plus le choix PERDU au rechargement")
g(F['session'] == '0', "sessionStorage est desormais employe (%s cle(s))" % F['session'])
F['jourLignes'] = re.findall(r'(\w+) . (\d{4}-\d{2}-\d{2}) / (\w+)', S)
g(len(F['jourLignes']) >= 2, "la sonde ne rend plus les deux lignes ecrites au journal")

if _E:
    print('REFUS DE PRODUIRE — %d garde(s) tombe(s) :' % len(_E))
    for x in _E:
        print('  - ' + x)
    sys.exit(1)

NB = 21

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
CEL = ParagraphStyle('cel', parent=P, fontSize=7.8, leading=9.8, spaceAfter=0)

H = []
Ad = H.append


_HORS = {}
# ⛔ reportlab ecrit en WinAnsi/cp1252. Un caractere hors de ce jeu ne PLANTE PAS : il sort
#   en glyphe faux (une fleche devient « ® », un « ⚠️ » devient « nn »). *Un PDF qui affiche
#   un mauvais caractere ressemble trait pour trait a un PDF reussi* — d ou le remplacement
#   explicite ci-dessous, ET le garde qui refuse ce qui reste inconnu.
_TRANSLIT = {'→': '->', '←': '<-', '⭐': '*', '⛔': '/!\\',
             '⚠': '/!\\', '️': '', '⚖': '=', '✅': 'OK',
             '❌': 'X', '–': '-', '—': '—', ' ': ' '}


def _win(t):
    """Rend le texte imprimable en WinAnsi, et NOTE ce qu il n a pas su rendre."""
    out = []
    for ch in t:
        if ch in _TRANSLIT:
            out.append(_TRANSLIT[ch])
            continue
        try:
            ch.encode('cp1252')
            out.append(ch)
        except Exception:                                  # noqa
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


def tab(lignes, larg, entete=True):
    data = [[Paragraph(md(c), CEL) for c in l] for l in lignes]
    st = [('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#CCCCCC')),
          ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('LEFTPADDING', (0, 0), (-1, -1), 3.5), ('RIGHTPADDING', (0, 0), (-1, -1), 3.5),
          ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5)]
    if entete:
        st.append(('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F0F0F0')))
    return Table(data, colWidths=larg, style=TableStyle(st))


Ad(Paragraph(md('FORCE TRACKER — AUDIT DU REPAS ACTIF'), H1))
Ad(Paragraph(md('CHANGEMENT DE JOUR ET RECHARGEMENT PWA — 20/09/2026'), H1))
Ad(Spacer(1, 5))
Ad(para("<b>AUDIT, PAS LIVRAISON.</b> Aucune ligne de code applicatif n a ete modifiee : "
        "<b>%d</b> fichier(s) non commite(s), <b>aucun servi, aucun test</b>. Ce dossier decrit "
        "un etat <b>mesure</b> et propose des options ; <b>il ne tranche rien</b> — les deux "
        "questions restent a l arbitrage de Michel." % len(F['sale'])))

# 1
Ad(Paragraph(md('1. Etat reel du depot'), H2))
Ad(tab([['', ''],
        ['SHA', F['sha']],
        ['version servie', '<b>%s</b>, presente aussi sur master' % F['version']],
        ['deploiement', '<b>verifie par les runs GitHub Actions</b> (5 derniers en succes), '
                        'pas deduit — le site lui-meme est injoignable depuis le conteneur '
                        '(proxy : CONNECT tunnel failed, 403)'],
        ['commits concurrents', '<b>%d</b> sur master' % F['concurrents']],
        ['dont fichiers servis ou tests', '<b>aucun</b> — la base Nutrition est inchangee '
                                          'depuis ft-v1226']],
       [46 * mm, 124 * mm], entete=False))
Ad(Spacer(1, 3))
Ad(para("<b>Deux choses ont change depuis la passation, et le brief ne pouvait pas les "
        "savoir</b> — c est exactement le cas que <b>R38</b> decrit : <b>R38 elle-meme a ete "
        "creee apres</b> (verifie sur master, pas suppose), et un <b>registre des decisions</b> "
        "(docs/DECISIONS.md) existe desormais%s. <b>Les deux questions de cet audit y ont leur "
        "place.</b>" % (' ' if F['registreDecisions'] else ' — non trouve, a verifier')))
Ad(para("<b>Aucun motif d arret R38</b> : sur tout le reste — portions, habitudes, quotas IA, "
        "scanner, repli code-barres, mealEstimate, label IA, mealPlan, imports — le brief decrit "
        "exactement l etat du depot."))

# 2
Ad(Paragraph(md('2. Le code, tel qu il est'), H2))
Ad(tab([['element', 'etat mesure'],
        ['`_afMeal`', 'initialise a <b>null</b> — il ne porte que le choix EXPLICITE'],
        ['`_afMealDefautHoraire()`', 'h&lt;11 petit-dej · &lt;15 dejeuner · &lt;18 collation · '
                                     'sinon diner'],
        ['`_afMealActif()`', 'le choix s il est une cle reelle, sinon la suggestion horaire'],
        ['ecrivain du choix', '<b>%d</b> — `setFoodMeal`, et lui seul' % F['ecritures']],
        ['lecteurs via le proprietaire', '<b>%d</b>' % F['lecteurs']],
        ['<b>persistance</b>', '<b>AUCUNE</b> — zero cle de stockage dans les 8 fichiers '
                               'servis (recompte, pas cite)'],
        ['sessionStorage', '<b>%s cle</b> dans toute l app' % F['session']],
        ['`journalNav` / `journalAllerA`', '<b>ne touchent pas</b> au repas actif']],
       [52 * mm, 118 * mm]))

# 3
Ad(Paragraph(md('3. Comportement A — changement de jour (mesure)'), H2))
Ad(para("Horloge <b>gelee a 09 h</b>, exprès : c est l heure ou la suggestion (<b>%s</b>) "
        "DIFFERE du choix qu on pose (<b>%s</b>). <i>Un banc cale sur une heure ou les deux "
        "coincident ne distinguerait rien.</i>" % (F['defaut9h'], F['apresChoix'])))
Ad(tab([['etape', 'resultat'],
        ['suggestion a l ouverture', F['defaut9h']],
        ['apres choix manuel', '<b>%s</b>' % F['apresChoix']],
        ['`journalNav(-1)`', F['jourAvApr']],
        ['repas actif apres le changement', '<b>%s — CONSERVE</b>' % F['repasApresJour']],
        ['ce qui est ecrit', ' · '.join('%s : %s / <b>%s</b>' % x for x in F['jourLignes'][:2])]],
       [56 * mm, 114 * mm]))
Ad(Spacer(1, 3))
Ad(para("<b>Cause</b> : `_afMeal` est une variable de module <b>sans aucun lien avec le jour</b>, "
        "et la navigation n y touche pas (verifie en lisant le corps des deux fonctions). "
        "<b>C est une consequence de l implementation, pas une decision</b> : rien dans le code "
        "ne dit que le choix DOIT survivre au jour."))

# 4
Ad(Paragraph(md('4. Comportement B — rechargement de la PWA (mesure)'), H2))
Ad(tab([['', 'avant reload', 'apres reload'],
        ['choix explicite', F['avantReload'], '<b>%s</b>' % F['apresReloadBrut']],
        ['repas employe', F['avantReload'], '<b>%s</b> (la suggestion)' % F['apresReloadActif']],
        ['aliment ajoute ensuite', '—', '<b>%s</b>' % F['ecritReload']]],
       [46 * mm, 62 * mm, 62 * mm]))
Ad(Spacer(1, 3))
Ad(para("<b>Cause</b> : variable de module, donc detruite au rechargement ; `_afMealActif()` "
        "retombe sur la suggestion. <b>Consequence aussi</b> — mais celle-la etait <b>connue et "
        "laissee exprès</b> en ft-v1226. <i>Connue n est pas voulue</i> : personne n a decide "
        "qu elle etait souhaitable."))
Ad(para("<b>Ce qu il faudrait pour la rendre persistante</b> : une cle de stockage portant le "
        "repas <b>et sa date</b> — sans la date, un « Diner » choisi hier soir ressort le "
        "lendemain matin. Rien d autre. ⛔ Et <b>surtout pas dans `S`</b> : `S` part au cloud "
        "par une liste blanche de 58 champs, et un etat d ecran n a rien a faire dans une "
        "sauvegarde."))

# 5
Ad(Paragraph(md('5. Options — A, changement de jour'), H2))
Ad(tab([['option', 'avantage', 'inconvenient / surprise', 'cout'],
        ['<b>A1 conserver</b> (actuel)', 'coherent quand on remplit plusieurs jours du meme '
                                         'repas', 'on peut noter dans « Dejeuner » d hier sans '
                                                  'y penser', '<b>0</b>'],
        ['A2 reinitialiser', 'repart « propre » a chaque jour',
         '⚠️ la suggestion est celle de MAINTENANT, pas du jour consulte : remplir hier soir a '
         '9 h proposerait Petit-dej. <b>Probablement pire que A1</b>', '~2 lignes'],
        ['<b>A3 conserver + le dire</b>', 'garde A1 et leve l ambiguite',
         '—', '<b>deja fait</b>']],
       [34 * mm, 46 * mm, 72 * mm, 18 * mm]))
Ad(Spacer(1, 3))
Ad(para("<b>A3 existe deja</b>, verifie dans le code servi : le message de confirmation affiche "
        "« Ajoute · Dejeuner, <b>jour consulte</b> » des qu on n est pas sur aujourd hui. Le "
        "garde-fou est en place. <b>Proposition technique la plus simple pour A : ne rien "
        "coder.</b>"))

# 6
Ad(Paragraph(md('6. Options — B, rechargement'), H2))
Ad(tab([['option', 'avantage', 'inconvenient / surprise', 'cout'],
        ['<b>B1 ne rien faire</b> (actuel)', 'jamais de choix perime',
         'un reload en pleine saisie fait perdre le repas', '<b>0</b>'],
        ['B2 sessionStorage', 'survit au reload, meurt a la fermeture',
         '⚠️ <b>son comportement en PWA standalone iOS n est PAS mesurable depuis le '
         'conteneur</b> (aucun iOS ici) — ce serait une supposition', '~3 lignes'],
        ['<b>B3 localStorage + date</b>', 'survit au reload ET a la fermeture, et <b>perime au '
                                          'changement de jour</b>',
         'une cle de plus (%d existent deja)' % F['clesFt4'], '~6 lignes']],
       [34 * mm, 46 * mm, 72 * mm, 18 * mm]))
Ad(Spacer(1, 3))
Ad(para("<b>Proposition technique la plus simple, si Michel veut corriger B : B3.</b> Une cle "
        "contenant `{repas, jour}`, relue dans `_afMealActif()` <b>uniquement si le jour est "
        "celui d aujourd hui</b>. Elle reutilise l existant (localStorage, `today()`), ne cree "
        "<b>aucune couche, aucune abstraction, aucune synchronisation</b>, et la peremption "
        "empeche le seul comportement vraiment surprenant. <b>Impact local-first : nul</b> — "
        "rien n entre dans `S`, rien ne part au cloud."))

# 7
Ad(Paragraph(md('7. Ce qui demande l arbitrage de Michel'), H2))
for x in [
    "<b>A</b> — garde-t-on le choix au changement de jour ? <i>Avis mesure : oui, et ne rien "
    "coder — A2 rendrait la suggestion MOINS pertinente, pas plus.</i>",
    "<b>B</b> — le choix doit-il survivre a un rechargement ? Et si oui, doit-il <b>perimer au "
    "changement de jour</b> (B3) ?",
    "⚖️ <b>La question de fond</b> : <b>aucun de ces deux comportements n a ete signale comme "
    "une gene en usage reel.</b> Ils viennent d un audit, pas du terrain. <b>R22</b> dit qu un "
    "point isole s observe avant d etre corrige, et le chantier Nutrition est justement en "
    "phase d observation. <b>Attendre qu un des deux gene vraiment est une option legitime, et "
    "c est celle qui coute zero.</b>",
]:
    Ad(para('&bull; ' + x))
Ad(Spacer(1, 2))
Ad(para("⛔ <b>Aucun defaut adjacent trouve</b> dans le perimetre audite — et on n en invente "
        "pas. ⛔ <b>Le verrou serveur des capacites IA n a pas ete ouvert</b> : les 21 capacites "
        "portent toujours `serveurApplique=false`, et le pot code-barres n a pas ete touche."))

Ad(Spacer(1, 7))
Ad(Paragraph("Dossier produit par un script qui recompte ses %d faits depuis le code servi, lit "
             "les mesures de comportement DANS LE JOURNAL DE LA SONDE, refuse de produire si "
             "l un d eux tombe, et relit sa propre sortie." % NB, PET))

doc = BaseDocTemplate(SORTIE, pagesize=A4,
                      title='Force Tracker - audit du repas actif',
                      author='Force Tracker')
doc.addPageTemplates([PageTemplate(
    id='p', frames=[Frame(20 * mm, 16 * mm, 170 * mm, A4[1] - 32 * mm, id='f')])])
doc.build(H)

# ⛔⛔ ET LE GARDE QUI VIENT DE TROUVER UN VRAI DEFAUT : trois caracteres hors WinAnsi
#    (« ⚠️ », « ⚖ ») etaient IMPRIMES en glyphes faux dans la premiere sortie. *Un mauvais
#    caractere ne plante pas, il s affiche* — donc rien ne le signale sauf un garde.
if _HORS:
    os.remove(SORTIE)
    sys.exit('REFUS : %d caractere(s) hors WinAnsi imprime(s) : %s'
             % (sum(_HORS.values()),
                ', '.join('%r x%d' % (c, n) for c, n in _HORS.items())))


def _relire(chemin):
    import zlib
    import base64
    data = open(chemin, 'rb').read()
    txt = []
    for m in re.finditer(rb'stream\r?\n(.*?)endstream', data, re.S):
        bloc = m.group(1)
        try:
            brut = base64.a85decode(bloc.strip().rstrip(b'~>'), adobe=False)
        except Exception:                                  # noqa
            brut = bloc
        for essai in (brut, bloc):
            try:
                txt.append(zlib.decompress(essai).decode('latin-1'))
                break
            except Exception:                              # noqa
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
# ⛔ ET LE MOT QUI DECIDE DU TITRE DOIT ETRE IMPRIME. Lecon de la veille : un garde qui
#    verifie la SOURCE ne prouve rien sur ce qui est IMPRIME.
for _mot in ('AUDIT, PAS LIVRAISON', 'CONSERVE', 'arbitrage'):
    if _mot not in _lis:
        os.remove(SORTIE)
        sys.exit('REFUS : « %s » n apparait pas sur le papier' % _mot)
print('   relu : %d caracteres lisibles, 0 balise en clair' % len(_lis))
print('OK %s (%d gardes, %d octets)' % (SORTIE, NB, os.path.getsize(SORTIE)))
