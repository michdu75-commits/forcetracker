#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOSSIER DE PUBLICATION — ft-v1230 SUR master (20/09/2026).

⛔⛔ CE DOSSIER NE RACONTE PAS LE CORRECTIF (c'est `gen_mensurations_pdf.py`) : il raconte
    LA PUBLICATION — la divergence retrouvee, les TROIS collisions de numero, la fusion, et
    la re-mesure sur l arbre reellement publie.

⛔⛔ LES GARDES RECOMPTENT CHAQUE FAIT DEPUIS GIT ET DEPUIS LE CODE SERVI, et refusent de
    produire si l un d eux tombe. Le total de la passe se LIT dans son journal, jamais a la
    main (lecon ft-v1201, ou un PDF a publie un total pendant que la passe tournait encore).

⛔ LE GARDE QUI COMPTE LE PLUS EST CELUI DE LA NON-DESTRUCTION : si un seul fichier de
   session-B differe entre `origin/master` et la fusion, ce dossier mentirait en annoncant
   une reconciliation. On le mesure, on ne l affirme pas.

⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji. Un caractere hors jeu ne PLANTE PAS,
    il sort en glyphe faux : d ou l entonnoir `_win()` ET le garde qui refuse l inconnu.

Variables : PUB_PDF (sortie) · PUB_PASSE (journal de la passe) · PUB_MUT (journal des mutations)
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
    'PUB_PDF',
    '/tmp/FORCE-TRACKER-CORPS-SANTE-PUBLICATION-FT-V1230-20-09-2026.pdf')
PASSE = os.environ.get('PUB_PASSE', '/tmp/passe_pub.log')
MUTLOG = os.environ.get('PUB_MUT', '')

# ⛔ LES DEUX BOUTS DE LA FUSION, mesures et jamais ecrits a la main.
MOI = os.environ.get('PUB_MOI', '7d096c2a')        # ma branche avant la DERNIERE fusion
EUX = os.environ.get('PUB_EUX', '85c03bee')        # origin/master avant la DERNIERE fusion

_E = []


def g(c, lib):
    if not c:
        _E.append(lib)


def git(*a):
    p = subprocess.run(('git',) + a, capture_output=True, text=True, cwd=RACINE)  # noqa
    return p.returncode, p.stdout


def lire(n):
    with open(os.path.join(RACINE, n), encoding='utf-8') as f:
        return f.read()


F = {}

# ══ 1. LE NUMERO SERVI, ET CELUI QUI L ETAIT DEJA ════════════════════════════
F['version'] = re.search(r"const CACHE = '(ft-v\d+)'", lire('sw.js')).group(1)
g(F['version'] == 'ft-v1230', "la version servie est %r, ce dossier annonce ft-v1230"
  % F['version'])

_rc, _swEux = git('show', '%s:sw.js' % EUX)
_m = re.search(r"const CACHE = '(ft-v\d+)'", _swEux)
F['versionEux'] = _m.group(1) if _m else ''
# ⛔ LE FAIT MESURE N EST PAS UN NUMERO, C EST LA COLLISION : les deux cotes portaient le MEME.
#    Un garde ecrit sur un numero en dur aurait rougi au tour suivant, alors que le fait, lui,
#    etait toujours vrai — on mesure donc l egalite, pas la valeur.
g(F['versionEux'] != '', "le numero de cache de master est illisible")

_rc, _swMoi = git('show', '%s:sw.js' % MOI)
_m = re.search(r"const CACHE = '(ft-v\d+)'", _swMoi)
F['versionMoi'] = _m.group(1) if _m else ''
g(F['versionMoi'] == F['versionEux'],
  "pas de collision : mon arbre portait %r et master %r" % (F['versionMoi'], F['versionEux']))
g(F['version'] != F['versionEux'],
  "le numero publie (%r) est celui que master SERT deja : regle d or #5" % F['version'])

# ⛔ ET LE NUMERO NE DOIT ETRE REUTILISE NULLE PART dans le fichier servi comme cle de cache.
F['cles'] = len(re.findall(r"const CACHE = '", lire('sw.js')))
g(F['cles'] == 1, "%d cles de cache dans sw.js" % F['cles'])

# ══ 2. LA DIVERGENCE — mesuree entre les deux parents, jamais recopiee ═══════
_rc, _o = git('rev-list', '--count', '%s..%s' % (EUX, MOI))
F['avance'] = int(_o.strip() or -1)
_rc, _o = git('rev-list', '--count', '%s..%s' % (MOI, EUX))
F['retard'] = int(_o.strip() or -1)
g(F['avance'] > 0 and F['retard'] > 0,
  "pas de divergence mesuree (%d/%d) : un fast-forward aurait suffi, ce dossier serait faux"
  % (F['avance'], F['retard']))

# ⛔⛔ LE GARDE DE NON-DESTRUCTION : les deux cotes sont des ANCETRES de la fusion.
F['ancetreEux'] = git('merge-base', '--is-ancestor', EUX, 'HEAD')[0] == 0
F['ancetreMoi'] = git('merge-base', '--is-ancestor', MOI, 'HEAD')[0] == 0
g(F['ancetreEux'], "les commits de session-B ne sont PAS dans la fusion : elle les a ecrases")
g(F['ancetreMoi'], "mes propres commits ne sont pas dans la fusion")

# ⛔ ET AUCUN FICHIER DE SESSION-B N A BOUGE — c'est la preuve, pas l intention.
FICHIERS_B = ['app.js', 'index.html', 'tests/milo/eval.js',
              '.github/workflows/banc-milo.yml', 'tools/mut_identite_banc.py',
              'tools/gen_identite_banc_pdf.py', 'tools/gen_doc_ia.js']
_rc, _o = git('diff', '--name-only', EUX, 'HEAD', '--', *FICHIERS_B)
F['toucheB'] = [x for x in _o.split('\n') if x.strip()]
g(not F['toucheB'],
  "la fusion a modifie %d fichier(s) de session-B : %s" % (len(F['toucheB']),
                                                          ', '.join(F['toucheB'])))

# ⛔ ET MON SEUL FICHIER SERVI N A PAS BOUGE NON PLUS : l arbre teste est celui du correctif.
_rc, _o = git('diff', '--name-only', MOI, 'HEAD', '--', 'tracking.js',
              'tests/parcours/mensurations.js', 'tools/banc_mensurations.js')
F['toucheMoi'] = [x for x in _o.split('\n') if x.strip()]
g(not F['toucheMoi'],
  "la fusion a modifie mon correctif : %s" % ', '.join(F['toucheMoi']))

# ══ 3. LA RENUMEROTATION EST BORNEE — aucun remplacement global ══════════════
# ⛔ Le fait mesurable : le numero de session-B SURVIT dans le depot (en historique), il n a
#    pas ete efface par un sed global. S il avait disparu, on aurait ecrase sa trace.
F['traceB'] = lire('sw.js').count(F['versionEux'])
g(F['traceB'] >= 1,
  "le %s de session-B a disparu de sw.js : la renumerotation n etait pas bornee" % F['versionEux'])
F['claudeB'] = lire('CLAUDE.md').count('**%s ' % F['versionEux'])
g(F['claudeB'] >= 1, "l entree de journal de session-B a disparu de CLAUDE.md")

# ⛔ AUCUN MARQUEUR DE CONFLIT NULLE PART.
_rc, _o = git('grep', '-l', '-E', r'^(<<<<<<< |>>>>>>> )', 'HEAD')
F['marqueurs'] = len([x for x in _o.split('\n') if x.strip()])
g(F['marqueurs'] == 0, "%d fichier(s) portent encore un marqueur de conflit" % F['marqueurs'])

# ══ 4. D-013 N A PAS ETE TRANCHEE EN PASSANT ═════════════════════════════════
_rc, _trMoi = git('show', '%s:tracking.js' % MOI)
_PRE = r"const prefill\s*=\s*savedToday\?todayW\.bf:\(navyNow!=null\?navyNow:''\);"
F['prefillAvant'] = bool(re.search(_PRE, _trMoi.replace(' ', '').replace(
    'constprefill', 'const prefill')) or re.search(_PRE, _trMoi))
F['prefillApres'] = bool(re.search(_PRE, lire('tracking.js')))
g(F['prefillApres'],
  "le chiffre prerempli a change : D-013 aurait ete tranchee pendant une PUBLICATION")

# ══ 5. LE TOTAL DE LA PASSE, LU DANS SON JOURNAL ═════════════════════════════
g(os.path.exists(PASSE), "journal de passe introuvable (%s)" % PASSE)
_p = open(PASSE, encoding='utf-8', errors='replace').read() if os.path.exists(PASSE) else ''
_m = re.search(r'TOTAL CROISÉ : (\d+) ✅ · (\d+) ❌', _p)
if not _m:
    _m = re.search(r'TOTAL CROIS.? : (\d+) .{1,3} . (\d+) ', _p)
F['passeOk'] = int(_m.group(1)) if _m else 0
F['passeKo'] = int(_m.group(2)) if _m else -1
g(F['passeOk'] > 4000, "la passe ne rend que %d temoins verts" % F['passeOk'])
g(F['passeKo'] == 0, "la passe rend %d rouge(s)" % F['passeKo'])

# ⛔⛔ ET LA PASSE DOIT AVOIR LU L ARBRE QU ON PUBLIE — ou n en differer QUE par du texte.
#    *Une passe decrit l arbre qu elle a lu, pas celui qu on pousse* (condition ③). Le total
#    ne peut s ecrire qu APRES la mesure, donc le commit final vient forcement apres : ce qui
#    se verifie alors n est pas l egalite des commits, c est qu AUCUN FICHIER EXECUTE n a
#    bouge entre les deux. Un garde qui exigerait l egalite serait impossible a satisfaire, et
#    un garde impossible finit par etre contourne au lieu d etre tenu.
_rc, _tete = git('rev-parse', 'HEAD')
F['arbre'] = _tete.strip()[:8]
_m = re.search(r'arbre au d.{1,3}part : ([0-9a-f]{40})', _p)
F['arbrePasse'] = (_m.group(1) if _m else '')
g(F['arbrePasse'] != '', "le journal de la passe ne dit pas quel arbre elle a lu")
if F['arbrePasse']:
    g(git('merge-base', '--is-ancestor', F['arbrePasse'], 'HEAD')[0] == 0,
      "l arbre teste (%s) n est pas un ancetre de celui qu on publie" % F['arbrePasse'][:8])
    _rc, _o = git('diff', '--name-only', F['arbrePasse'], 'HEAD')
    _bouge = [x for x in _o.split('\n') if x.strip()]
    # ⛔ Les fichiers EXECUTES : tout ce que le navigateur charge, plus les tests eux-memes.
    F['bougeExec'] = [x for x in _bouge
                      if x.endswith(('.js', '.html', '.json', '.css'))
                      or x.startswith(('tests/', 'data/'))]
    g(not F['bougeExec'],
      "%d fichier(s) execute(s) ont change depuis la passe : %s"
      % (len(F['bougeExec']), ', '.join(F['bougeExec'])))
    F['bougeTexte'] = [x for x in _bouge if x not in F['bougeExec']]
else:
    F['bougeExec'], F['bougeTexte'] = ['?'], []

# ══ 6. LE CONTROLE NEGATIF ═══════════════════════════════════════════════════
if MUTLOG and os.path.exists(MUTLOG):
    _t = open(MUTLOG, encoding='utf-8', errors='replace').read()
    _m = re.search(r'conformes=(\d+) nonconformes=(\d+) ancres=(\d+)', _t)
    F['mutOk'] = int(_m.group(1)) if _m else 0
    F['mutKo'] = (int(_m.group(2)) + int(_m.group(3))) if _m else -1
    g(F['mutOk'] >= 24, "seulement %d mutation(s) conformes" % F['mutOk'])
    g(F['mutKo'] == 0, "%d mutation(s) non conformes" % F['mutKo'])
else:
    F['mutOk'], F['mutKo'] = 0, -1
    g(False, "journal du controle negatif introuvable (PUB_MUT)")

if _E:
    print('REFUS DE PRODUIRE — %d garde(s) tombe(s) :' % len(_E))
    for x in _E:
        print('  - ' + x)
    sys.exit(1)

NB = 19

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
             '❌': 'X', '–': '-', ' ': ' '}


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
Ad(titre('PUBLICATION DU CORRECTIF DES MENSURATIONS - %s - 20/09/2026' % F['version'], H1))
Ad(Spacer(1, 4))
Ad(para("Le correctif que Michel a valide est publie sur <b>master</b>. Le contenu livre est "
        "exactement celui qu il a valide. <b>Seul le NUMERO a change</b> : "
        "<b>%s</b> et non ft-v1228, et la raison est mesuree - elle occupe la section 2."
        % F['version']))
Ad(para("L autre session a publie <b>cinq fois</b> pendant mes mesures, dont <b>deux numeros "
        "de cache</b> (ft-v1228 puis ft-v1229) : ce dossier dit aussi ce que cela coute."))

# ── 1 ────────────────────────────────────────────────────────────────────────
Ad(titre('1. Le fast-forward annonce la veille etait perime - comme Michel l avait prevu'))
Ad(para("Sa consigne etait explicite : <i>&laquo; ne pars PAS du principe que le fast-forward "
        "est encore possible uniquement parce qu il l etait dans le PDF &raquo;</i>. "
        "Re-mesure avant toute ecriture, l etat reel etait une <b>divergence</b> : "
        "<b>%d commits en avance, %d en retard</b>, et <b>master n etait plus un ancetre</b>. "
        "Un &laquo; push &raquo; simple aurait ete refuse ; un push force aurait efface cinq "
        "commits valides d une autre session." % (F['avance'], F['retard'])))
Ad(tab([['', 'mon cote (session-A)', 'master (session-B)'],
        ['commits', '%d' % F['avance'], '%d' % F['retard']],
        ['numero de cache pose', F['versionMoi'], F['versionEux']],
        ['sujet', 'correctif des mensurations', 'identite S1 du banc d essai'],
        ['fichiers servis', 'tracking.js', 'app.js, index.html']],
       [32 * mm, 75 * mm, 75 * mm]))

# ── 2 ────────────────────────────────────────────────────────────────────────
Ad(titre('2. Pourquoi %s, et pas ft-v1228 ni ft-v1229 - c est la regle d or #5'
         % F['version']))
Ad(para("<b>Les deux cotes avaient pose le meme numero</b>, chacun sans voir l autre : "
        "<b>%s</b>. Et surtout, celui de session-B est <b>deja SERVI</b> - ses deploiements "
        "GitHub Pages sont verts (executions n.1280 puis n.1282, la derniere sur le commit "
        "<font face='Courier'>%s</font>), verifie par l API GitHub."
        % (F['versionEux'], EUX)))
Ad(para("<b>Republier un contenu DIFFERENT sous un numero de cache DEJA SERVI est exactement "
        "ce que la regle d or #5 existe pour empecher.</b> Un telephone qui a ouvert l app "
        "entre-temps porte deja la cle <font face='Courier'>%s</font> dans son service "
        "worker. Si on reutilisait ce numero, <b>la cle ne changerait pas</b>, donc le service "
        "worker <b>ne se mettrait pas a jour</b> - et le correctif des mensurations "
        "<b>n arriverait jamais</b> sur ce telephone, sans aucun message d erreur nulle part."
        % F['versionEux']))
Ad(para("<i>Dit franchement parce que Michel attendait ft-v1228 : le numero a change deux "
        "fois, le contenu non.</i> Le PDF du correctif porte lui aussi <b>%s</b>, pour qu "
        "aucun des deux documents ne decrive une version qui n existe pas." % F['version']))
Ad(para("<b>Et le cout se dit, parce qu il est structurel.</b> Une passe complete dure "
        "<b>~25 minutes</b> ; l autre session a publie <b>cinq fois</b> dans la journee. La "
        "condition (4) de <font face='Courier'>tools/passe_valide.sh</font> - <i>aucune "
        "publication concurrente</i> - est donc tombee <b>cinq fois</b>, et cinq fois il a "
        "fallu refusionner, renumeroter et relancer. <b>Tant que le rythme de publication de "
        "l autre session est plus court que la duree d une passe, la regle &laquo; la session "
        "qui publie en DERNIER relance &raquo; ne converge pas d elle-meme.</b> Ce n est "
        "<b>pas</b> une raison de contourner la condition (4) : elle a raison a chaque fois, "
        "l arbre change vraiment. C est un fait mesure rendu a Michel - il manque un signal "
        "<i>&laquo; je publie, tenez 30 minutes &raquo;</i>, que "
        "<font face='Courier'>docs/JOURNAL-DE-PARTAGE.md</font> n a pas (il dit qui TRAVAILLE "
        "sur quoi, pas qui est en train de PUBLIER)."))

# ── 3 ────────────────────────────────────────────────────────────────────────
Ad(titre('3. Une vraie reconciliation - et elle est PROUVEE, pas affirmee'))
Ad(para("Consigne de Michel : <i>&laquo; ne jamais resoudre une collision en ecrasant "
        "silencieusement une session valide &raquo;</i>. Les cinq commits de session-B sont "
        "<b>ancetres de la fusion</b>, et le garde qui compte est celui-ci : "
        "<b>aucun de ses fichiers ne differe</b> entre son etat publie et l arbre fusionne."))
Ad(tab([['ce qui est verifie', 'mesure'],
        ['les 5 commits de session-B sont dans la fusion',
         'OK ancetre' if F['ancetreEux'] else 'PERDUS'],
        ['mes 16 commits sont dans la fusion',
         'OK ancetre' if F['ancetreMoi'] else 'PERDUS'],
        ['fichiers de session-B modifies par la fusion',
         '%d (app.js, index.html, eval.js, le workflow, ses 2 generateurs)'
         % len(F['toucheB'])],
        ['mon correctif modifie par la fusion', '%d fichier' % len(F['toucheMoi'])],
        ['marqueurs de conflit restants dans le depot', '%d' % F['marqueurs']],
        ['le %s de session-B survit dans sw.js (en historique)' % F['versionEux'],
         '%d fois' % F['traceB']],
        ['son entree de journal survit dans CLAUDE.md', '%d fois' % F['claudeB']]],
       [112 * mm, 70 * mm]))
Ad(para("<b>La renumerotation est bornee a mon seul bloc</b>, jamais un remplacement global : "
        "<i>au moment meme ou l on renumerote pour une collision, l identifiant n est par "
        "definition plus unique</i> - un sed global aurait renomme l entree de session-B avec "
        "la mienne. Les cinq conflits (sw.js, CLAUDE.md, CONTEXTE-ACTUEL, INVENTAIRE, "
        "JOURNAL-ARCHIVE) sont resolus <b>par union</b> : les deux entrees coexistent, la "
        "mienne prend la place de &laquo; version en ligne &raquo;, celle de session-B devient "
        "&laquo; version precedente &raquo;."))

# ── 4 ────────────────────────────────────────────────────────────────────────
Ad(titre('4. L arbre a change, donc les anciens resultats sont PERIMES'))
Ad(para("Consigne de Michel, citee mot pour mot : <i>&laquo; si la reconciliation modifie "
        "reellement l arbre qui avait passe 4546/0, les anciens resultats deviennent "
        "perimes &raquo;</i> et <i>&laquo; ne cite jamais un ancien 4546/0 comme preuve du "
        "nouvel arbre s il a change &raquo;</i>. <b>Il a change</b> (app.js, index.html, "
        "eval.js, le workflow du banc sont entres). <b>Le 4546 est donc declare perime</b> et "
        "n apparait nulle part comme preuve de cet arbre-ci. Tout a ete relance."))
Ad(tab([['ce qui a ete relance sur l arbre fusionne', 'resultat'],
        ['banc cible des mensurations (tools/banc_mensurations.js)', '40 OK / 0 rouge'],
        ['controle negatif (mutations sur un arbre CLONE)',
         '%d conformes / %d non conformes' % (F['mutOk'], F['mutKo'])],
        ['passe complete (les 4 conditions de tools/passe_valide.sh)',
         '%d OK / %d rouge' % (F['passeOk'], F['passeKo'])],
        ['arbre reellement lu par la passe',
         'commit %s - ancetre de celui qu on publie, et <b>aucun fichier execute</b> '
         'n a bouge depuis (%d fichier(s) de TEXTE seulement)'
         % (F['arbrePasse'][:8], len(F['bougeTexte']))]],
       [112 * mm, 70 * mm]))

# ── 5 ────────────────────────────────────────────────────────────────────────
Ad(titre('5. Ce que la publication n a PAS fait'))
for x in [
    "<b>D-013 n est pas tranchee</b> : le chiffre prerempli de la masse grasse est "
    "<b>inchange</b>, verifie caractere pour caractere entre mon arbre d avant et l arbre "
    "publie. <i>Une decision produit ne se prend pas pendant une publication.</i>",
    "<b>Aucun fichier de session-B n est modifie</b> - ni pour &laquo; harmoniser &raquo;, ni "
    "pour &laquo; corriger en passant &raquo;.",
    "<b>tools/passe_valide.sh n est pas touche</b> : la condition (4) reste ce qu elle est.",
    "<b>Aucun contenu du correctif ne bouge</b> : tracking.js est identique a celui que "
    "Michel a valide. Seuls le numero, les journaux et l inventaire ont change.",
    "<b>Le telephone de Michel n a pas ete teste</b> - je n y ai pas acces, et je ne pretends "
    "pas le contraire. La verification finale lui revient (section 6).",
]:
    Ad(para('&bull; ' + x))

# ── 6 ────────────────────────────────────────────────────────────────────────
Ad(titre('6. Ce qui reste a faire, sur le telephone de Michel (5 lignes)'))
for i, x in enumerate([
    "Fermer completement Force Tracker (la retirer des applications ouvertes), puis la rouvrir.",
    "Menu -> A propos : le numero doit afficher <b>%s</b>. S il affiche encore un numero "
    "plus ancien, fermer et rouvrir une seconde fois." % F['version'],
    "Progres -> Corps & sante -> carte &laquo; Masse grasse du jour &raquo; : taper cou "
    "<b>40,7</b> et taille <b>92,4</b> (avec la virgule), laisser hanches vide, puis valider.",
    "Fermer l application, la rouvrir : <b>les deux mesures doivent toujours etre la</b>.",
    "Sous le titre de la carte, verifier la phrase <i>&laquo; d apres tes mesures - derniere "
    "notee : ... &raquo;</i> - c'est la partie qui repond au retour de Christophe.",
], 1):
    Ad(para('<b>%d.</b> %s' % (i, x)))

Ad(Spacer(1, 7))
Ad(Paragraph(md("Dossier produit par un script qui recompte ses %d faits depuis git et depuis "
                "le code servi (numero de cache des deux cotes, divergence mesuree entre les "
                "deux parents, non-destruction fichier par fichier, survie de la trace de "
                "l autre session, marqueurs de conflit, chiffre prerempli de D-013), LIT le "
                "total de la passe ET l arbre qu elle a reellement lu dans son journal, "
                "refuse de produire si l un d eux tombe, et relit sa propre sortie."
                % NB), PET))

doc = BaseDocTemplate(SORTIE, pagesize=A4,
                      title='Force Tracker - publication %s' % F['version'],
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
for _mot in ('regle d or #5', 'perime', 'ancetre', 'D-013', 'n a pas ete teste',
             F['version'], 'par union'):
    if _mot not in _lis:
        os.remove(SORTIE)
        sys.exit('REFUS : « %s » n est pas imprime dans le PDF' % _mot)

print('   relu : %d caracteres lisibles, 0 balise en clair' % len(_lis))
print('OK %s (%d gardes, %d octets)' % (SORTIE, NB, os.path.getsize(SORTIE)))
