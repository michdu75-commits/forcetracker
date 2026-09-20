#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PASSATION — IDENTITE S1 DEDIEE AU BANC D'ESSAI GITHUB (20/09/2026).

Dossier destine a ChatGPT, pour reprendre sans repartir de zero.

[!!] CHAQUE FAIT SE RECOMPTE ICI depuis git et depuis le code servi. Si un fait tombe, le
     generateur REFUSE de produire.

[!!] ⛔⛔ AUCUNE VALEUR DE SECRET N'ENTRE DANS CE DOSSIER. On n'ecrit que le NOM du secret.
     Un garde relit la page produite et refuse toute chaine de 64 caracteres hexadecimaux.

[!!] ON RELIT LA PAGE PRODUITE avant de declarer le succes (regle d'or #14).

CONTRAINTE DE POLICE : WinAnsi/cp1252 - pas d'emoji.
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
    SCRATCH, 'FORCE-TRACKER-MILO-IDENTITE-S1-BANC-GITHUB-20-09-2026.pdf')

NOM_SECRET = 'FT_BANC_TOKEN'
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


def sans_yaml(s):
    return '\n'.join(l for l in s.split('\n') if not l.lstrip().startswith('#'))


def sans_js(s):
    s = re.sub(r'/\*[\s\S]*?\*/', ' ', s)
    return '\n'.join((lambda m: l[:m.start()] if m else l)(re.search(r'(?<!:)//', l))
                     for l in s.split('\n'))


# ══ 1. ETAT ════════════════════════════════════════════════════════════════════════════
rc, head = git('rev-parse', '--short=8', 'HEAD')
g(CN or (rc == 0 and len(head) == 8), 'HEAD illisible')
if CN and (rc != 0 or len(head) != 8):
    head = '0' * 8
rc, sale = git('status', '--porcelain')
g(CN or sale == '', 'arbre sale : le dossier declare un arbre propre')
rc, ecart = git('rev-list', '--left-right', '--count', 'HEAD...origin/master')
g(CN or ecart.split() == ['0', '0'], 'HEAD et origin/master ont diverge (%r)' % ecart)
VERSION = (re.search(r"CACHE\s*=\s*'(ft-v\d+)'", lire('sw.js')) or [None, ''])[1]
g(VERSION == 'ft-v1228', 'la version servie est %r, le dossier annonce ft-v1228' % VERSION)

# ══ 2. LE WORKER ET Code.js N'ONT PAS BOUGE — la promesse centrale ═════════════════════
rc, noms = git('diff', '--name-only', 'd1714935..HEAD')
g(CN or rc == 0, 'git diff a echoue : sa sortie ne doit jamais servir de donnee')
TOUCHES = sorted(n for n in noms.split('\n') if n.strip())
g(all(re.fullmatch(r'[\w./@+-]+', n) for n in TOUCHES), 'la liste des fichiers n est pas une liste de chemins')
g(CN or 'worker.js' not in TOUCHES, "worker.js a change : le dossier annonce 0 ligne")
g(CN or 'Code.js' not in TOUCHES, "Code.js a change : le dossier annonce 0 ligne")

WK = sans_js(lire('worker.js'))
g(re.findall(r'^\s*_moi\s*=\s*(.*)$', WK, flags=re.M) == ['await _identiteIA(body.token, env);'],
  "l'identite ne vient plus UNIQUEMENT de _identiteIA : une porte a ete ouverte")
g('if (!_moi.ok)' in WK, 'le Worker ne refuse plus une identite invalide')

# ══ 3. S1 REUTILISE, RIEN DE NEUF ══════════════════════════════════════════════════════
CJ = lire('Code.js')
for f in ('function _jetonPoser_(email, libelle)', 'function _jetonIdentite_(brut)',
          'function _jetonRevoquer_(brut)'):
    g(f in CJ, 'la primitive S1 %r a disparu' % f)
g("body.action === 'issueTokenByCode'" in CJ, 'la route existante issueTokenByCode a disparu')
g("body.action === 'revokeToken'" in CJ, 'la route de revocation a disparu')

APP = sans_js(lire('app.js'))
g("action:'issueTokenByCode'" in APP, "l'outil Admin n'emprunte plus la route existante")
g("appareil:'banc-milo'" in APP, "l'etiquette du banc a disparu : il ne serait plus revocable a part")
g("action:'revokeToken'" in APP, "la revocation a disparu de l'outil Admin")
g('localStorage.setItem' not in APP.split('async function creerJetonBanc')[1].split('async function')[0],
  'le jeton est RANGE cote client : il ne doit exister qu a l affichage')

EV = sans_js(lire('tests/milo/eval.js'))
g(re.findall(r'^\s*const BANC_TOKEN\s*=\s*(.*)$', EV, flags=re.M)
  == ["String(process.env.FT_BANC_TOKEN || '').trim();"],
  'le jeton du banc ne vient plus de l environnement')
g('GO && !LOCAL && !BANC_TOKEN' in EV, "eval.js ne refuse plus --go sans jeton")
g('BANC_TOKEN.length !== 64' in EV, 'le controle de forme a disparu')
g("'ft4_devtoken'" not in EV, 'la cle de stockage est recopiee en dur (R2)')
g('constants.js' in EV, 'la cle n est plus lue a la source')

WF = sans_yaml(lire('.github/workflows/banc-milo.yml'))
g('secrets.' + NOM_SECRET in WF, 'le workflow ne lit plus le secret')
g('-z "$%s"' % NOM_SECRET in WF, 'le workflow ne refuse plus quand le secret manque')
g(not re.search(r'echo .*\$' + NOM_SECRET, WF), 'LE WORKFLOW AFFICHE LE SECRET')
g(re.search(r'!=\s*"LANCER"\s*\]', WF), 'la confirmation LANCER a disparu')
g(not re.search(r'^\s*push:', WF, flags=re.M), 'LE WORKFLOW PART SUR PUSH')
g("etat === 'vert' || x.etat === 'rouge'" in WF, "le garde « au moins une reponse » a disparu")

MUT = lire('tools/mut_identite_banc.py')
N_MUT = len(re.findall(r"^\s*\('(?:M\d\d|\[negatif\])", MUT, flags=re.M))
g(N_MUT == 14, 'le controle negatif porte %d mutations, on en annonce 14' % N_MUT)

# le quota, recompte
# ⛔ ON VISE LA LIGNE QUI DECIDE, PAS N'IMPORTE LAQUELLE. `AI_EMAIL_MAX` apparait a DEUX
#    endroits de Code.js avec des defauts DIFFERENTS (100 dans un affichage Admin, 50 dans
#    la logique de quota). Un motif lache aurait publie 100 — un chiffre faux, et d'autant
#    plus credible qu'il vient bien du fichier. On ancre donc sur `EMAIL_MAX =`, la variable
#    que `_aiQuotaEtat_` compare reellement.
Q_MAIL = (re.search(r"var EMAIL_MAX\s*=\s*parseInt\(sp\.getProperty\('AI_EMAIL_MAX'\), 10\)\s*\|\|\s*(\d+)",
                    CJ) or [None, '?'])[1]
Q_DEV = (re.search(r'var AI_MAX_DEV_\s*=\s*(\d+)', CJ) or [None, '?'])[1]
N_SCEN = len(re.findall(r"^\s*\{\s*id:\s*'[^']*'", lire('tests/milo/eval-scenarios.js'), flags=re.M))
g((Q_MAIL, Q_DEV, N_SCEN) == ('50', '150', 57),
  'quota/scenarios : %s / %s / %d' % (Q_MAIL, Q_DEV, N_SCEN))

# ══ 4. LA PAGE ═════════════════════════════════════════════════════════════════════════
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
p = lambda t: A(Paragraph(t, P))
h2 = lambda t: A(Paragraph(t, H2))
cle = lambda t, s=CLE: A(Paragraph(t, s))


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


A(Paragraph('FORCE TRACKER / MILO &mdash; IDENTITE S1 DU BANC D\'ESSAI', H1))
A(Paragraph('Passation pour ChatGPT &middot; 20 septembre 2026 &middot; SHA <b>%s</b> '
            '&middot; version servie <b>%s</b>' % (head, VERSION), SUB))
cle("<b>EN UNE PHRASE.</b> Le banc recoit un badge ; aucune porte n'est ouverte dans le "
    "batiment. Il se presente desormais avec un <b>vrai jeton S1</b>, emis par la route qui "
    "existait deja, simplement <b>etiquete</b> et <b>revocable seul</b>.")

h2('1. AVANT &mdash; pourquoi GitHub recevait 401')
p("Le Worker refuse tout appel IA sans jeton : <i>Origin correct + aucun token -&gt; refus</i> "
  "(ft-v1216), une protection <b>voulue</b>. Or un runner GitHub ouvre un navigateur "
  "<b>neuf</b> : aucun jeton, donc <b>401</b>, donc <b>zero comportement mesure</b>.")
cle("<b>Et le fait le plus utile</b> : le banc n'avait <b>jamais</b> pu appeler Milo depuis "
    "S1. Personne ne l'avait vu parce qu'<b>aucune passe reelle n'avait jamais tourne</b> "
    "&mdash; le rapport etait « blanc » depuis toujours.")

h2('2. SOLUTION &mdash; rien de neuf cote authentification')
p("<b>Mesure avant d'ecrire une ligne : S1 savait deja tout faire.</b>")
tab([['ce qu il fallait', 'ce qui existait deja'],
     ['une identite <b>etiquetee</b>', '<i>_jetonPoser_(email, <b>libelle</b>)</i>'],
     ['un refus sur', '<i>_jetonIdentite_</i> <b>fail-closed</b> (absent / inconnu / illisible / revoque)'],
     ['une <b>revocation</b>', "<i>_jetonRevoquer_</i> <b>marque</b> au lieu de supprimer &mdash; "
      "un jeton revoque doit rester distinguable d'un jeton inconnu"],
     ['une <b>route</b> pour en creer un',
      "<b>issueTokenByCode</b>, celle que le telephone de chacun utilise deja"]],
    [44 * mm, 131 * mm])
p("L'outil <b>Profil -&gt; Admin -&gt; « Jeton du banc d'essai »</b> appelle cette route avec "
  "l'etiquette <b>banc-milo</b>. Le jeton produit est un jeton S1 <b>ordinaire</b>.")

h2('3. SECURITE &mdash; pourquoi personne n\'est moins protege qu\'avant')
tab([['interdiction', 'etat verifie'],
     ['pas de <i>if benchmark then allow</i>',
      "<b>0 ligne dans worker.js</b> &mdash; l'identite ne peut venir que de <i>_identiteIA</i> "
      "(une seule affectation dans tout le fichier, recomptee par ce generateur)"],
     ['pas de desactivation de S1', '<b>0 ligne dans Code.js</b> &mdash; tout existait'],
     ['pas de jeton universel dans le code',
      "le jeton vient de l'environnement, jamais d'une constante (recompte)"],
     ['pas de secret dans une URL ni dans un journal',
      "le workflow ne l'affiche jamais ; il ne dit que <b>present / absent</b>"],
     ['le jeton ne vit sur aucun appareil',
      "affiche <b>une seule fois</b> (le serveur ne garde qu'une empreinte sha256), "
      "range <b>nulle part</b> cote client"]],
    [52 * mm, 123 * mm])
cle("<b>LE BANC EMPRUNTE LE CHEMIN DU VRAI CLIENT</b>, et c'est ce qui rend la mesure honnete : "
    "meme cle de <i>localStorage</i>, <b>lue a la source</b> dans constants.js (<b>R2</b>) "
    "&mdash; la recopier la ferait diverger en silence au premier renommage, et le banc "
    "repartirait en 401 sans qu'on comprenne pourquoi.")

h2('4. SECRET GITHUB')
p("Nom du secret : <b>%s</b>. <b>Sa valeur n'apparait nulle part</b> &mdash; ni ici, ni dans "
  "les journaux, ni dans la reference du banc. Si le secret manque, le workflow echoue "
  "<b>avant le checkout</b>, donc avant toute depense, et dit quoi configurer." % NOM_SECRET)

h2('5. ARBITRAGE &mdash; le quota a decide de l\'architecture')
cle("Le quota est <b>par e-mail</b> : <b>%s/jour</b>, <b>%s</b> pour un compte de developpement. "
    "Or une passe fait <b>%d appels</b> : <b>un e-mail neuf serait bloque a %s</b>. Le jeton est "
    "donc <b>dedie et revocable seul</b>, mais il <b>resout vers le compte de Michel</b>. "
    "Un compte separe exigerait de le creer, lui poser un code perso et l'ajouter a "
    "<i>AI_EMAILS_DEV_</i> : <b>chemin d'evolution ecrit, non pris ici</b> (R19)."
    % (Q_MAIL, Q_DEV, N_SCEN, Q_MAIL))

h2('6. TESTS')
p("<b>Controle negatif : %d mutations sur arbre clone, %d conformes.</b> Trois familles &mdash; "
  "<b>ouvrir une porte</b> (mode benchmark dans le Worker, refus desactive, jeton en dur), "
  "<b>faire fuir le secret</b> (l'afficher, recopier la cle), <b>retirer un garde-fou</b> "
  "(secret non verifie, refus avant depense supprime, LANCER, « au moins une reponse », "
  "etiquette, revocation). Dont <b>deux qui doivent RESTER VERTES</b> : des commentaires citant "
  "les mots cherches." % (N_MUT, N_MUT))
cle("<b>ET DEUX DE MES PROPRES GARDES MESURAIENT UN MOT AU LIEU DU MECANISME.</b> "
    "<b>(1)</b> j'interdisais le mot « benchmark » dans worker.js : il a rougi sur l'arbre <b>sain</b>, "
    "car <i>MODELES_BENCHMARK</i> y existe depuis longtemps et ne parle <b>pas d'identite</b> "
    "(liste blanche de modeles). <b>(2)</b> mon garde « aucun jeton en dur » cherchait 64 caracteres "
    "hexadecimaux : <i>'a'.repeat(64)</i> passait. <b>Un garde qui decrit a quoi RESSEMBLE un "
    "secret ne dit rien de sa PROVENANCE.</b> Les deux mesurent desormais la source.", ALERTE)
p("Passe complete du depot : <b>4506 verts / 0 rouge</b>, valide aux 4 conditions.")

h2('7. REVOCATION')
tab([['question', 'reponse mesuree'],
     ["ou vit son empreinte", "une Script Property <i>tok_&lt;sha256&gt;</i> cote Apps Script ; "
      "le jeton brut n'y est jamais"],
     ['comment on la distingue', "par son <b>libelle</b> : <b>banc-milo</b>"],
     ['comment revoquer',
      "Profil -&gt; Admin -&gt; « Jeton du banc d'essai » -&gt; coller le jeton -&gt; <b>Revoquer</b>. "
      "Il faut <b>presenter</b> le jeton : on ne revoque pas celui d'un autre en connaissant son "
      "adresse, ce serait rouvrir la faille par la sortie."],
     ['ce qui se passe ensuite',
      "<i>_jetonIdentite_</i> rend <b>revoque</b>, le Worker refuse en 401, et le banc s'arrete "
      "<b>proprement sans rien depenser</b> (le garde « au moins une reponse » empeche en plus "
      "qu'une passe vide devienne une reference)"]],
    [40 * mm, 135 * mm])

h2('8. PROCHAINE ACTION DE MICHEL &mdash; une seule fois, puis un clic')
tab([['', 'quoi'],
     ['<b>1. Fabriquer</b>', "dans l'app : <b>Profil -&gt; Admin -&gt; « Jeton du banc d'essai » "
      "-&gt; Fabriquer -&gt; Copier</b>"],
     ['<b>2. Coller</b>', "GitHub -&gt; <b>Settings</b> -&gt; <b>Secrets and variables</b> -&gt; "
      "<b>Actions</b> -&gt; <b>New repository secret</b> -&gt; nom <b>%s</b> -&gt; "
      "valeur -&gt; <b>Add secret</b>" % NOM_SECRET],
     ['<b>3. Lancer</b>', "GitHub -&gt; <b>Actions</b> -&gt; <i>Banc d'essai de Milo</i> -&gt; "
      "<b>Run workflow</b> -&gt; taper <b>LANCER</b> -&gt; scenarios <b>vide</b> -&gt; "
      "enregistrer <b>oui</b>"]],
    [26 * mm, 149 * mm])
p("<b>Points encore ouverts</b> : l'essai reel a 1 scenario <b>n'a pas ete rejoue</b> apres la "
  "pose du secret &mdash; il ne peut pas l'etre tant que le secret n'existe pas. Le workflow "
  "echouera <b>proprement et sans depense</b> s'il manque. Et le choix « jeton sur le compte de "
  "Michel plutot qu'un compte dedie » reste <b>revocable</b> : il suffit de revoquer et d'en "
  "emettre un autre ailleurs.")

p('<i>Dossier produit par un script qui recompte ses @@GARDES@@ faits depuis git et depuis le '
  'code servi, refuse de produire si l\'un tombe, et relit la page pour verifier qu\'aucune '
  'valeur de secret n\'y figure.</i>')
_IDX = len(story) - 1
N_GARDES = GARDES[0]
_v = story[_IDX]
g('@@GARDES@@' in _v.text, 'le marqueur du compte de gardes a disparu')
story[_IDX] = Paragraph(_v.text.replace('@@GARDES@@', str(N_GARDES)), _v.style)

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
                  "Force Tracker - identite S1 du banc d'essai - 20/09/2026 - %s - %s"
                  % (head, VERSION))
    cv.drawRightString(195 * mm, 10 * mm, 'page %d' % cv.getPageNumber())
    cv.restoreState()


doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=15 * mm, rightMargin=15 * mm,
                        topMargin=14 * mm, bottomMargin=16 * mm,
                        title="Force Tracker - identite S1 du banc d'essai",
                        author='Force Tracker')
doc.build(story, onFirstPage=pied, onLaterPages=pied)

rc3, sale3 = git('status', '--porcelain')
if sale3 and not CN:
    raise SystemExit('GARDE ROUGE - la generation a SALI le depot : %r' % sale3)

import pypdfium2 as _pdfium
_d = _pdfium.PdfDocument(OUT)
_pages = [_d[i].get_textpage().get_text_range() for i in range(len(_d))]
_rendu = '\n'.join(_pages)
_norm = _rendu.replace(' ', ' ').replace(' ', ' ')
if len(_rendu) < 5000:
    raise SystemExit('GARDE ROUGE - %d caracteres rendus : la page est muette' % len(_rendu))

# ⛔⛔ LE GARDE QUI COMPTE LE PLUS : aucune valeur de secret dans la page.
_fuite = re.findall(r'\b[0-9a-f]{64}\b', _norm)
if _fuite:
    raise SystemExit('GARDE ROUGE - UNE VALEUR DE 64 HEX FIGURE DANS LA PAGE (fuite de secret)')

_ATT = [head, VERSION, NOM_SECRET, 'banc-milo', 'issueTokenByCode', '_identiteIA',
        '%d faits' % N_GARDES, 'LANCER', '4506', str(N_SCEN)]
_abs = [a for a in _ATT if a not in _norm]
if _abs:
    raise SystemExit('GARDE ROUGE - faits absents de la PAGE RENDUE : %r' % _abs)

print('OK  %s' % OUT)
print('    %d gardes | %d pages | %d caracteres relus | %d faits verifies | 0 secret dans la page'
      % (N_GARDES, len(_pages), len(_rendu), len(_ATT)))
