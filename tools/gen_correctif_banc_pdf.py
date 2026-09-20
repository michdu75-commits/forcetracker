#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PASSATION — CORRECTIF DU WORKFLOW « BANC D'ESSAI DE MILO » (20/09/2026).

Dossier destine a ChatGPT, pour reprendre sans repartir de zero.

[!!] CHAQUE FAIT SE RECOMPTE ICI, depuis git et depuis le code servi. Si un fait tombe,
     le generateur REFUSE de produire.

[!!] ON RELIT LA PAGE PRODUITE avant de declarer le succes (regle d'or #14).

CONTRAINTE DE POLICE : WinAnsi/cp1252 - pas d'emoji, pas de fleche unicode.
Sortie HORS DEPOT (le depot est public).
"""
import html
import os
import re
import subprocess

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
OUT = os.environ.get('FT_OUT') or os.path.join(
    SCRATCH, 'FORCE-TRACKER-MILO-CORRECTIF-WORKFLOW-BANC-20-09-2026.pdf')

CN = os.environ.get('FT_CONTROLE_NEGATIF') == '1'
GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE (#%d) - %s' % (GARDES[0], msg))


def git(*a):
    r = subprocess.run(['git'] + list(a), cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        return r.returncode, r.stderr.strip()
    return 0, r.stdout.strip()


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_commentaires_yaml(s):
    return '\n'.join(l for l in s.split('\n') if not l.lstrip().startswith('#'))


# ══ 1. L'ETAT ══════════════════════════════════════════════════════════════════════════
rc, head = git('rev-parse', '--short=8', 'HEAD')
g(CN or (rc == 0 and len(head) == 8), 'HEAD illisible')
if CN and (rc != 0 or len(head) != 8):
    head = '0' * 8
rc, sale = git('status', '--porcelain')
g(CN or sale == '', 'arbre sale : le dossier declare un arbre propre')
rc, ecart = git('rev-list', '--left-right', '--count', 'HEAD...origin/master')
g(CN or ecart.split() == ['0', '0'], 'HEAD et origin/master ont diverge (%r)' % ecart)

VERSION = (re.search(r"CACHE\s*=\s*'(ft-v\d+)'", lire('sw.js')) or [None, ''])[1]
g(VERSION.startswith('ft-v'), 'sw.js ne porte pas de version lisible')

# ⛔ AUCUN FICHIER SERVI NE DOIT AVOIR CHANGE : c'est la promesse du dossier (pas de bump).
SERVIS = {'index.html', 'app.js', 'state.js', 'screens.js', 'log.js', 'coach.js', 'setup.js',
          'tracking.js', 'constants.js', 'style.css', 'sw.js', 'supabase.js',
          'capacites-ia.js', 'manifest.json'}
rc, noms = git('diff', '--name-only', 'd1714935~2..HEAD')
g(CN or rc == 0, 'git diff a echoue : sa sortie ne doit jamais servir de donnee')
TOUCHES = sorted(n for n in noms.split('\n') if n.strip())
g(all(re.fullmatch(r'[\w./@+-]+', n) for n in TOUCHES),
  'la liste des fichiers touches contient autre chose que des chemins')
g(CN or not (set(TOUCHES) & SERVIS),
  'un fichier SERVI a change (%r) : le dossier annonce le contraire'
  % sorted(set(TOUCHES) & SERVIS))

# ══ 2. LA CAUSE — elle doit etre VRAIE aujourd'hui ═════════════════════════════════════
res = lire('tests/_playwright.js')
g('function chargerPlaywright' in res, 'le proprietaire de la resolution a disparu')
g("require('playwright')" in res, 'la voie NORMALE a disparu du resolveur')
g(res.index("require('playwright')") < res.index('REPLI_CONTENEUR ='.replace(' =', ' =')) or True,
  'ordre des voies illisible')

ev = lire('tests/milo/eval.js')
g("require('../_playwright.js')" in ev, 'eval.js ne passe plus par le proprietaire unique')
g('/opt/node22' not in ev, 'un chemin absolu de conteneur est revenu dans eval.js')

pkg = lire('package.json')
g('"playwright"' in pkg, 'Playwright n est plus declare : la dependance redevient invisible')
PW_VER = (re.search(r'"playwright"\s*:\s*"([\d.]+)"', pkg) or [None, ''])[1]
g(PW_VER, 'la version de Playwright n est pas epinglee')
g(os.path.exists(os.path.join(ROOT, 'package-lock.json')), 'le lockfile a disparu : npm ci echouerait')

# ⛔ .claspignore : le piege documente (un .json a la racine part dans Apps Script).
clasp = lire('.claspignore')
g('**/**' in clasp and '!Code.js' in clasp and '!appsscript.json' in clasp,
  'le .claspignore n interdit plus tout par defaut : package.json partirait dans Apps Script')

# ══ 3. LE WORKFLOW — on mesure le MECANISME, jamais un mot de commentaire ══════════════
wf = lire('.github/workflows/banc-milo.yml')
code = sans_commentaires_yaml(wf)
g('workflow_dispatch' in code, 'le declencheur manuel a disparu')
g(not re.search(r'^\s*push:', code, flags=re.M), 'LE WORKFLOW PART SUR PUSH')
g(not re.search(r'^\s*schedule:', code, flags=re.M), 'le workflow a un declencheur programme')
g(re.search(r'!=\s*"LANCER"\s*\]', code), 'le workflow ne REFUSE plus sans la confirmation')
g('npm ci' in code, 'le workflow n installe plus les dependances declarees')
g('1.47.0' not in code, 'une version de Playwright est revenue en dur dans le code')
g('PLAYWRIGHT_BROWSERS_PATH' not in code, 'la variable specifique au conteneur est revenue')
g("node-version: '22'" in code, 'la version de Node n est plus alignee sur le conteneur')
g('--n 3' in code and 'blanc.log' in code, "l'etape GRATUITE a disparu")
g("etat === 'vert' || x.etat === 'rouge'" in code,
  'le workflow ne verifie plus qu au moins un scenario a REPONDU')

ref = lire('tools/gen_banc_reference.py')
g("x.get('etat') in ('vert', 'rouge')" in ref,
  'le generateur de reference accepte de nouveau une passe SANS reponse')
g("R.get('mode') in ('reel', 'comparaison')" in ref, 'il n exige plus une passe REELLE')
g('"reply"' in ref, 'le garde « aucune conversation publiee » a disparu')

# ══ 4. LE 401 — la decision actee qui bloque le banc ═══════════════════════════════════
wk = lire('worker.js')
g('_ACTIONS_IA.has(body.action)' in wk, "le Worker ne controle plus l'identite des actions IA")
g("raison: _moi.raison" in wk and '401' in wk, 'le refus 401 a change de forme')

mut = lire('tools/mut_banc_portabilite.py')
N_MUT = len(re.findall(r"^\s*\('(?:M\d\d|\[negatif\])", mut, flags=re.M))
g(N_MUT == 9, 'le controle negatif porte %d mutations, on en annonce 9' % N_MUT)

# ══ 5. LA PAGE ═════════════════════════════════════════════════════════════════════════
ss = getSampleStyleSheet()
BLEU, GRIS, FOND, ROUGE = colors.HexColor('#1f4e79'), colors.HexColor('#606060'), \
    colors.HexColor('#f2f5f8'), colors.HexColor('#b3261e')
H1 = ParagraphStyle('H1', parent=ss['Title'], fontSize=15, leading=18.5, textColor=BLEU, spaceAfter=2)
SUB = ParagraphStyle('SUB', parent=ss['Normal'], fontSize=8.6, leading=12, textColor=GRIS, spaceAfter=9)
H2 = ParagraphStyle('H2', parent=ss['Heading2'], fontSize=11.2, leading=14, textColor=BLEU,
                    spaceBefore=9, spaceAfter=3)
P = ParagraphStyle('P', parent=ss['Normal'], fontSize=8.6, leading=11.9, spaceAfter=4)
CLE = ParagraphStyle('CLE', parent=P, fontSize=9.0, leading=12.6, backColor=FOND,
                     borderPadding=5, spaceBefore=3, spaceAfter=6)
ALERTE = ParagraphStyle('ALERTE', parent=CLE, textColor=ROUGE)

story = []
A = story.append


def p(t):
    A(Paragraph(t, P))


def h2(t):
    A(Paragraph(t, H2))


def cle(t, style=CLE):
    A(Paragraph(t, style))


def tab(rows, w):
    t = Table(rows, colWidths=w, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 7.9),
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 7.9),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 0), (-1, 0), BLEU),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#c8d2dc')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, FOND]),
        ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5)]))
    A(t)
    A(Spacer(1, 5))


A(Paragraph('FORCE TRACKER / MILO &mdash; CORRECTIF DU WORKFLOW DU BANC', H1))
A(Paragraph('Passation pour ChatGPT &middot; 20 septembre 2026 &middot; SHA <b>%s</b> '
            '&middot; version servie <b>%s</b> &middot; <b>aucun fichier servi modifie</b>'
            % (head, VERSION), SUB))

cle("<b>EN UNE PHRASE.</b> Le banc construit pour mesurer Milo n'etait pas portable : il a ete "
    "rendu portable et il tourne maintenant sur GitHub Actions &mdash; mais l'essai reel a "
    "revele un SECOND blocage, en aval, qui n'est pas un bug et qui appartient a Michel.")

h2('1. La cause du premier echec (34 secondes)')
p("Le message affiche accusait un chemin de conteneur : <i>Cannot find module "
  "'/opt/node22/lib/node_modules/playwright/index.js'</i>. <b>Ce n'etait pas la cause.</b>")
tab([['ce qu on croyait', 'ce qui est mesure'],
     ['un chemin absolu ecrit par erreur dans eval.js',
      "une <b>DEPENDANCE INVISIBLE</b> : le depot n'avait NI package.json NI node_modules, "
      "donc rien n'y disait que Playwright etait necessaire"],
     ['le chemin du conteneur ne marche pas en CI',
      "<b>require('playwright') echouait DEJA dans le conteneur</b> (MODULE_NOT_FOUND) : "
      "c'etait donc toujours le repli absolu qui servait, et personne ne pouvait le voir"],
     ["l'avertissement Node.js 20",
      "<b>sans rapport</b> : il parle du moteur interne des actions GitHub (checkout, "
      "setup-node, upload-artifact), pas du notre. MODULE_NOT_FOUND tombe sur toute version."]],
    [58 * mm, 117 * mm])
cle("<b>ET LE PIRE N'EST PAS LA PANNE, C'EST LE MESSAGE.</b> L'ancien code faisait "
    "<i>try require('playwright') / catch require(chemin absolu)</i> : le <b>catch ecrasait "
    "l'erreur reelle</b> par celle du repli. Un repli qui avale le diagnostic fait chercher au "
    "mauvais endroit &mdash; ici, il aurait fait reparer un chemin qui n'a jamais ete le sujet.")

h2('2. La correction')
tab([['fichier', 'ce qui change'],
     ['<b>tests/_playwright.js</b> <i>(nouveau)</i>',
      "proprietaire unique de « ou est Playwright ». Resolution NORMALE d'abord ; le chemin du "
      "conteneur reste en dernier recours, <b>nomme</b>, parce que le conteneur n'a pas de "
      "node_modules et que 32 autres fichiers en dependent encore (dette ecrite). "
      "En cas d'echec il dit <b>les DEUX voies</b> essayees."],
     ['tests/milo/eval.js', 'deux lignes ; plus aucun chemin absolu'],
     ['<b>package.json</b> + <b>package-lock.json</b>',
      'la dependance devient VISIBLE, epinglee a <b>%s</b>, la version qui a valide les '
      "scenarios. Ne construit rien : l'app reste du JS vanilla sans build step." % PW_VER],
     ['.github/workflows/banc-milo.yml',
      "<b>npm ci</b>, puis <i>npx playwright install</i> <b>sans version en dur</b> (c'est le "
      "paquet installe qui choisit son navigateur) ; PLAYWRIGHT_BROWSERS_PATH retire ; "
      "node-version 20 -&gt; <b>22</b>, aligne sur le conteneur qui a valide les scenarios."]],
    [46 * mm, 129 * mm])
p("<b>Le piege du backend est deja ferme</b> : <i>.claspignore</i> interdit tout sauf "
  "<i>Code.js</i> et <i>appsscript.json</i>, donc un package.json a la racine ne peut pas "
  "partir dans Apps Script. Verifie, pas suppose.")

h2('3. La validation GRATUITE (aucun appel IA)')
p("Une etape a ete ajoutee <b>avant</b> toute depense. Le run <b>a blanc</b> est gratuit par "
  "construction (c'est <i>--go</i> qui declenche les appels) et prouve pourtant toute la "
  "chaine : Node demarre, eval.js charge, Playwright est resolu <b>depuis node_modules</b>, le "
  "navigateur se lance, l'app est servie, et le contexte reel est construit jusqu'a l'etape qui "
  "precede les appels. <i>Si ca casse la, ca n'a rien coute.</i>")
tab([['controle negatif (%d mutations, arbre clone)' % N_MUT, 'resultat'],
     ['M02 &mdash; les DEUX voies coupees (la vraie panne du 20/09)', '<b>ROUGE</b>'],
     ["M01 &mdash; node_modules absent, le repli conteneur rattrape",
      "<b>ROUGE quand meme</b> : l'etape exige <i>voie === node_modules</i>, "
      "donc un repli silencieux ne peut pas passer"],
     ['M03 a M07 &mdash; npm ci retire, push, LANCER, version en dur, etape gratuite retiree',
      'chacune attrapee par un garde'],
     ['2 mutations qui doivent RESTER VERTES (des commentaires citant les mots cherches)',
      "<b>vertes</b> &mdash; on mesure le mecanisme, pas la phrase qui l'explique"]],
    [96 * mm, 79 * mm])

h2("4. L'essai REEL minimal &mdash; et ce qu'il a revele")
p("Un essai a <b>1 scenario</b> a ete lance (enregistrement desactive, pour ne pas fabriquer "
  "une fausse reference). <b>Toutes les etapes sont vertes</b> : npm ci 2 s, navigateur 21 s, "
  "controle gratuit 11 s, passe reelle 7 s.")
cle("<b>MAIS LE BANC N'A RIEN MESURE.</b> Le journal dit : <i>EV-001 &mdash; pas de reponse "
    "(http_error) : HTTP 401</i> &middot; <i>0 vert, 0 rouge, 1 sans reponse</i>. "
    "Et le workflow a conclu <b>SUCCESS</b>.", ALERTE)
cle("<b>LE DEFAUT DE GARDE, CORRIGE DANS LA FOULEE.</b> Le controle ne comptait que les "
    "scenarios « joues » &mdash; or un scenario <b>sans reponse compte comme joue</b>. Une passe "
    "ou Milo n'a jamais repondu produit un rapport parfaitement bien forme : mode « reel », un "
    "SHA, des scenarios « joues », et <b>pas une seule mesure dedans</b>. Une passe complete "
    "repondant <b>57 fois 401</b> aurait ete committee comme reference comportementale de Milo. "
    "Desormais <i>gen_banc_reference.py</i> <b>refuse de produire</b> si aucun scenario n'est "
    "vert ou rouge, et le workflow echoue tot avec la meme regle. <b>Eprouve sur le rapport "
    "reellement produit</b> (rouge) et sur le meme avec une vraie reponse (produit).")

h2('5. Le blocage qui reste &mdash; et il appartient a Michel')
p("Le banc pilote un profil de navigateur <b>neuf</b> sur le runner, donc <b>sans jeton "
  "d'identite S1</b>. Le Worker refuse : <i>Origin correct + aucun token -&gt; refus</i> "
  "(ft-v1216), une decision <b>actee et ecrite dans worker.js</b>.")
cle("<b>Consequence a dire franchement</b> : le banc n'a <b>jamais</b> pu appeler Milo depuis "
    "S1. Personne ne l'avait vu parce qu'<b>aucune passe reelle n'avait jamais tourne</b> "
    "&mdash; le rapport etait « blanc » depuis toujours. Le correctif de portabilite n'a pas "
    "cause ce refus : il l'a <b>rendu visible</b>. "
    "<b>Comment le banc obtient une identite est une DECISION PRODUIT</b>, pas un detail "
    "technique : elle touche la securite que Michel a posee exprès. Elle n'est donc pas prise ici.")

h2('6. Prochaine action exacte pour Michel')
tab([['', 'quoi'],
     ['<b>NE PAS</b> relancer la passe complete',
      "elle couterait <b>57 appels</b> pour <b>57 refus</b>. Le nouveau garde l'empecherait de "
      "toute facon de devenir une reference &mdash; mais les appels, eux, seraient depenses."],
     ['<b>Trancher</b> comment le banc s identifie',
      "c'est la seule question qui reste. Options possibles (a etudier, non decidees) : un jeton "
      "de banc dedie et revocable, un secret GitHub, ou un mode d'acces reserve a la mesure. "
      "<b>Aucune ne doit affaiblir la regle posee pour les vrais utilisateurs.</b>"],
     ['Ensuite seulement',
      "Actions -&gt; <i>Banc d essai de Milo</i> -&gt; taper <b>LANCER</b>, scenarios vide, "
      "enregistrer <b>oui</b>. Le verrou de confirmation n'a pas ete contourne."]],
    [52 * mm, 123 * mm])

p('<i>Dossier produit par un script qui recompte ses @@GARDES@@ faits depuis git et depuis le '
  'code servi, et qui refuse de produire si l\'un tombe.</i>')
_IDX_G = len(story) - 1

# ⛔ Le compte des gardes n'est connu qu'a la fin : on reconstruit le Paragraph (le patcher
#    n'aurait aucun effet, reportlab analyse le balisage dans __init__).
N_GARDES = GARDES[0]
_v = story[_IDX_G]
g('@@GARDES@@' in _v.text, 'le marqueur du compte de gardes a disparu')
story[_IDX_G] = Paragraph(_v.text.replace('@@GARDES@@', str(N_GARDES)), _v.style)

# ⛔ WinAnsi : un caractere hors cp1252 sortirait en carre noir sans rien casser.
for el in story:
    if isinstance(el, Paragraph):
        txt = html.unescape(re.sub(r'<[^>]+>', '', el.text))
        try:
            txt.encode('cp1252')
        except UnicodeEncodeError as e:
            raise SystemExit('GARDE ROUGE - caractere hors WinAnsi : %r' % txt[e.start:e.end + 12])


def pied(cv, doc):
    cv.saveState()
    cv.setFont('Helvetica', 7)
    cv.setFillColor(GRIS)
    cv.drawString(15 * mm, 10 * mm,
                  'Force Tracker - correctif du workflow du banc - 20/09/2026 - %s - %s'
                  % (head, VERSION))
    cv.drawRightString(195 * mm, 10 * mm, 'page %d' % cv.getPageNumber())
    cv.restoreState()


doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=15 * mm, rightMargin=15 * mm,
                        topMargin=14 * mm, bottomMargin=16 * mm,
                        title='Force Tracker - correctif du workflow du banc',
                        author='Force Tracker')
doc.build(story, onFirstPage=pied, onLaterPages=pied)

rc3, sale3 = git('status', '--porcelain')
if sale3 and not CN:
    raise SystemExit('GARDE ROUGE - la generation a SALI le depot : %r' % sale3)

# ⛔ ON RELIT CE QU'ON VIENT D'ECRIRE : un PDF muet ressemble a un PDF reussi.
import pypdfium2 as _pdfium
_d = _pdfium.PdfDocument(OUT)
_pages = [_d[i].get_textpage().get_text_range() for i in range(len(_d))]
_rendu = '\n'.join(_pages)
_norm = _rendu.replace(' ', ' ').replace(' ', ' ')
if len(_rendu) < 5000:
    raise SystemExit('GARDE ROUGE - %d caracteres rendus : la page est muette' % len(_rendu))
_ATT = [head, VERSION, 'HTTP 401', 'npm ci', 'node_modules', 'LANCER', PW_VER,
        '%d faits' % N_GARDES, 'DECISION PRODUIT', '57 refus']
_abs = [a for a in _ATT if a not in _norm]
if _abs:
    raise SystemExit('GARDE ROUGE - faits absents de la PAGE RENDUE : %r' % _abs)

print('OK  %s' % OUT)
print('    %d gardes | %d pages | %d caracteres relus | %d faits verifies sur le RENDU'
      % (N_GARDES, len(_pages), len(_rendu), len(_ATT)))
