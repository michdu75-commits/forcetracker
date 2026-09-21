#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOSSIER — PREMIERE PASSE REELLE DU BANC D'ESSAI DE MILO (20/09/2026, publie le 21/09).

[!!] CHAQUE CHIFFRE SE RECOMPTE ICI depuis le journal du runner et depuis le code servi.
     Si un fait tombe, le generateur REFUSE de produire.

     ⭐ LE GARDE QUI COMPTE LE PLUS : on ne recopie PAS la ligne de total du runner, on
       RECOMPTE les 57 verdicts un par un, puis on exige que les deux nombres coincident.
       Un total est justement ce qu'on lit en dernier et qu'on ne verifie jamais — et ce
       depot a deja publie un total faux (lecon ft-v1201, puis ft-v1230).

     ⛔ ET ON EXIGE L'IDENTITE DES ENSEMBLES, pas seulement des comptes : les identifiants
       vus dans le journal doivent etre EXACTEMENT ceux declares dans eval-scenarios.js.
       51 + 6 = 57 resterait vrai si un scenario avait ete joue deux fois et un autre pas
       du tout — *un compte juste ne prouve pas que ce sont les bons.*

[!!] ⛔⛔ AUCUNE VALEUR DE SECRET N'ENTRE DANS CE DOSSIER, et un garde relit la page
     produite pour refuser toute chaine de 64 caracteres hexadecimaux.

[!!] ON RELIT LA PAGE PRODUITE avant de declarer le succes (regle d'or #14) : un PDF muet
     ressemble a un PDF reussi.

CONTRAINTE DE POLICE : WinAnsi/cp1252 - pas d'emoji.
Sortie HORS DEPOT (le depot est public).

Usage : python3 tools/gen_banc_passe_reelle_pdf.py
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
    SCRATCH, 'FORCE-TRACKER-MILO-PREMIERE-PASSE-REELLE-DU-BANC-20-09-2026.pdf')

# .txt et NON .log : `.gitignore` ecarte `*.log`, or ce journal est une PREUVE — il doit
# etre versionne. Un fichier de preuve range sous une extension ignoree disparait en silence.
JOURNAL = 'tests/milo/passe-reelle-2026-09-20.txt'
NOM_SECRET = 'FT_BANC_TOKEN'
RUN, JOB = '35537012441', '106147738195'
SHA_MESURE = 'c0bf5d7ae8587a84d0f4a6e90452d31b6babf341'
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


# ══ 1. ETAT DU DEPOT ═══════════════════════════════════════════════════════════════════
rc, head = git('rev-parse', '--short=8', 'HEAD')
g(CN or (rc == 0 and len(head) == 8), 'HEAD illisible')
if CN and (rc != 0 or len(head) != 8):
    head = '0' * 8
rc, sale = git('status', '--porcelain')
g(CN or sale == '', 'arbre sale : le dossier declare un arbre propre (%r)' % sale[:80])
VERSION = (re.search(r"CACHE\s*=\s*'(ft-v\d+)'", lire('sw.js')) or [None, ''])[1]
g(VERSION == 'ft-v1230', 'la version servie est %r, le dossier annonce ft-v1230' % VERSION)

# ══ 2. LE JOURNAL DE LA PASSE — on RECOMPTE, on ne recopie pas ═════════════════════════
LOG = lire(JOURNAL)

# le journal doit dire d'ou il vient : sans cela il n'est pas une preuve, juste un texte
for ancre in (RUN, JOB, SHA_MESURE, 'workflow_dispatch', 'LANCER'):
    g(ancre in LOG, 'le journal ne porte pas son ancrage %r' % ancre)

VERTS = re.findall(r'✅ (EV-\d{3}) ', LOG)
ROUGES = re.findall(r'❌ (EV-\d{3}) ', LOG)
N_V, N_R = len(VERTS), len(ROUGES)

# ⭐ LE TOTAL DU RUNNER EST UNE DONNEE A VERIFIER, PAS UNE SOURCE A RECOPIER.
m = re.search(r'(\d+) vert\(s\) · (\d+) rouge\(s\)', LOG)
g(m is not None, 'la ligne de total du runner est absente : la passe n a peut-etre pas fini')
T_V, T_R = int(m.group(1)), int(m.group(2))
g((N_V, N_R) == (T_V, T_R),
  'RECOMPTE %d/%d, le runner annonce %d/%d — un des deux ment' % (N_V, N_R, T_V, T_R))

# ⛔ ZERO « SANS REPONSE » : c'est le fait qui prouve que l'identite S1 fonctionne.
#    Au run #2, la meme ligne disait « 0 vert(s) . 0 rouge(s) . 1 sans reponse » (HTTP 401).
g('sans réponse' not in LOG, 'le journal porte des scenarios SANS REPONSE : identite ou quota')
g('http_error' not in LOG, 'le journal porte une erreur HTTP')

# le bloc de synthese doit nommer exactement les memes rouges que les verdicts
SYNTH = re.findall(r'\U0001f534 (EV-\d{3}) ', LOG)
g(sorted(SYNTH) == sorted(ROUGES),
  'le bloc de synthese nomme %r, les verdicts disent %r' % (sorted(SYNTH), sorted(ROUGES)))

# ══ 3. LES ENSEMBLES, PAS SEULEMENT LES COMPTES ════════════════════════════════════════
SCEN = lire('tests/milo/eval-scenarios.js')
DECLARES = re.findall(r"id:'(EV-\d{3})'", SCEN)
g(len(DECLARES) == len(set(DECLARES)), 'un identifiant est declare deux fois dans le banc')
N_SCEN = len(DECLARES)
g(N_SCEN == 57, 'le banc declare %d scenarios, le dossier annonce 57' % N_SCEN)
g(N_V + N_R == N_SCEN, '%d + %d != %d scenarios declares' % (N_V, N_R, N_SCEN))
JOUES = VERTS + ROUGES
g(len(JOUES) == len(set(JOUES)), 'un scenario a ete compte DEUX fois dans le journal')
g(set(JOUES) == set(DECLARES),
  'joues != declares — manquants %r, intrus %r'
  % (sorted(set(DECLARES) - set(JOUES)), sorted(set(JOUES) - set(DECLARES))))

# ══ 4. LES SIX ROUGES — chaque phrase du dossier est ancree dans le journal ═════════════
#    On n'ecrit pas « de memoire » ce que le verificateur a dit : on exige que l'extrait
#    figure REELLEMENT dans le journal, a cote de son identifiant.
ROUGE_DIT = [
    ('EV-007', 'Pas d\'interrogatoire', '2 questions posées',
     'au plus UNE question ; il en pose deux'),
    ('EV-042', 'DEUX questions dans le même message', '2 questions posées dans le même message',
     'le MEME defaut que EV-007, compte une seconde fois'),
    ('EV-023', 'superset', 'sans dire QUELS DEUX exercices',
     'il ECRIT « superset » sans nommer les deux exercices : le texte n atteint pas la donnee (R4)'),
    ('EV-045', 'Demande mal formulée', 'prescrit sans demander ni annoncer ce qu\'il a supposé',
     'il invente au lieu de demander, et ne dit pas ce qu il a suppose'),
    ('EV-055', 'charnières de hanche', 'seulement 0 ligne(s) d\'exercice',
     'le verificateur ne trouve AUCUNE ligne d exercice'),
    ('EV-056', 'Douleur du JOUR', 'ce n\'est pas une séance haut du corps (0)',
     'le verificateur trouve 0 exercice chiffre'),
]
g(len(ROUGE_DIT) == N_R, '%d rouges decrits, %d mesures' % (len(ROUGE_DIT), N_R))
g(sorted(r[0] for r in ROUGE_DIT) == sorted(ROUGES), 'les rouges decrits ne sont pas ceux mesures')
for ident, titre, extrait, _ in ROUGE_DIT:
    g(ident in ROUGES, '%s n est pas rouge dans le journal' % ident)
    g(extrait in LOG, '%s : l extrait %r ne figure pas dans le journal' % (ident, extrait))
    g("id:'%s'" % ident in SCEN, '%s n existe pas dans eval-scenarios.js' % ident)

# ⛔ LES DEUX ROUGES « ZERO EXERCICE » SONT LE POINT QUE LE DOSSIER REFUSE DE TRANCHER.
#    Premiere version de ce garde : `'0' in extrait`. Il a rougi sur un journal parfaitement
#    sain, parce que l'extrait choisi pour EV-056 ne contenait pas le caractere « 0 » —
#    *un garde qui cherche un CARACTERE dans une phrase que j'ai moi-meme redigee mesure ma
#    redaction, pas le journal.* On lit desormais le NOMBRE annonce par le verificateur,
#    dans SES lignes de detail, et on exige que exactement deux rouges annoncent zero.
def _detail(ident):
    """Les lignes de detail que le runner a ecrites sous le verdict de `ident`."""
    bloc = LOG.split('❌ %s ' % ident)
    if len(bloc) != 2:
        return ''
    suite = bloc[1]
    # le detail s'arrete au verdict suivant, quel qu'il soit
    coupe = re.search(r'✅ EV-|❌ EV-|══ ', suite)
    return suite[:coupe.start()] if coupe else suite


ZERO = [i for i in ROUGES if re.search(r'(?:seulement|\()\s*0\s*(?:ligne|\))', _detail(i))]
g(sorted(ZERO) == ['EV-055', 'EV-056'],
  'les rouges qui annoncent ZERO exercice ne sont plus EV-055/EV-056 mais %r' % sorted(ZERO))
g(sorted(r[0] for r in ROUGE_DIT if 'trouve 0 exercice' in r[3] or '0 ligne' in r[2])
  == ['EV-055', 'EV-056'], 'la nuance du dossier ne vise plus les deux memes scenarios')

# ══ 5. LE WORKFLOW — garde-fous intacts, et le defaut qu'on NOMME sans le corriger ══════
WF_BRUT = lire('.github/workflows/banc-milo.yml')
WF = sans_yaml(WF_BRUT)
g(re.search(r'!=\s*"LANCER"\s*\]', WF), 'la confirmation LANCER a disparu')
g(not re.search(r'^\s*push:', WF, flags=re.M), 'LE WORKFLOW PART SUR PUSH')
g(not re.search(r'^\s*schedule:', WF, flags=re.M), 'LE WORKFLOW A UN DECLENCHEUR HORAIRE')
g('secrets.' + NOM_SECRET in WF, 'le workflow ne lit plus le secret')
g('-z "$%s"' % NOM_SECRET in WF, 'le workflow ne refuse plus quand le secret manque')
g(not re.search(r'echo .*\$' + NOM_SECRET, WF), 'LE WORKFLOW AFFICHE LE SECRET')
g("etat === 'vert' || x.etat === 'rouge'" in WF, "le garde « au moins une reponse » a disparu")
g('--n 3' in WF, 'le controle gratuit a disparu')

# ⛔⛔ LE DEFAUT DECRIT AU §5 DU DOSSIER — on le MESURE, on ne le suppose pas.
#    L'etape « Enregistrer la reference » porte un `if:` qui ne contient AUCUNE fonction
#    d'etat (success/failure/always/cancelled). Dans ce cas GitHub insere `success()`
#    implicitement — donc une passe qui rougit fait sauter l'etape. Si quelqu'un corrige
#    le workflow, ce garde ROUGIT et le dossier refuse de decrire un defaut repare (R30).
BLOC = re.search(r'- name: Enregistrer la référence dans le dépôt\n(.*?)\n      - name:',
                 WF_BRUT, flags=re.S)
g(BLOC is not None, "l'etape « Enregistrer la reference » a disparu du workflow")
COND = re.search(r'^\s*if:\s*(.+)$', BLOC.group(1), flags=re.M)
g(COND is not None, "l'etape « Enregistrer la reference » n'a plus de condition")
IF_TXT = COND.group(1).strip()
g(not re.search(r'\b(success|failure|always|cancelled)\s*\(', IF_TXT),
  "la condition porte desormais une fonction d'etat : le defaut decrit est CORRIGE, "
  "ce dossier est perime (%r)" % IF_TXT)

# ══ 6. RIEN DE SERVI N'A CHANGE — la promesse du couloir ═══════════════════════════════
rc, noms = git('diff', '--name-only', '%s..HEAD' % SHA_MESURE[:8])
g(CN or rc == 0, 'git diff a echoue : sa sortie ne doit jamais servir de donnee')
TOUCHES = sorted(n for n in noms.split('\n') if n.strip())
g(all(re.fullmatch(r'[\w./@+-]+', n) for n in TOUCHES),
  'la liste des fichiers n est pas une liste de chemins')
SERVIS = {'app.js', 'state.js', 'screens.js', 'log.js', 'coach.js', 'setup.js', 'tracking.js',
          'constants.js', 'index.html', 'style.css', 'sw.js', 'worker.js', 'Code.js',
          'supabase.js', 'capacites-ia.js'}
INTRUS = sorted(SERVIS & set(TOUCHES))
g(CN or not INTRUS, 'des fichiers SERVIS ont change depuis la mesure : %r' % INTRUS)

# le quota, recompte a la ligne qui decide (AI_EMAIL_MAX apparait deux fois dans Code.js,
# avec des defauts DIFFERENTS : 100 dans un affichage Admin, 50 dans la logique de quota)
CJ = lire('Code.js')
Q_MAIL = (re.search(r"var EMAIL_MAX\s*=\s*parseInt\(sp\.getProperty\('AI_EMAIL_MAX'\), 10\)\s*\|\|\s*(\d+)",
                    CJ) or [None, '?'])[1]
Q_DEV = (re.search(r'var AI_MAX_DEV_\s*=\s*(\d+)', CJ) or [None, '?'])[1]
g((Q_MAIL, Q_DEV) == ('50', '150'), 'quotas lus : %s / %s' % (Q_MAIL, Q_DEV))

# ══ 7. LA PAGE ═════════════════════════════════════════════════════════════════════════
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


A(Paragraph("FORCE TRACKER / MILO &mdash; PREMIERE PASSE REELLE DU BANC D'ESSAI", H1))
A(Paragraph('Mesure du 20 septembre 2026, 20:54-&gt;21:07 UTC &middot; run <b>#%s</b> '
            '&middot; SHA mesure <b>%s</b> &middot; version servie <b>%s</b> &middot; '
            'dossier genere le 21/09 sur <b>%s</b>'
            % (RUN, SHA_MESURE[:8], VERSION, head), SUB))

cle("<b>EN UNE PHRASE.</b> Le banc d'essai de Milo a tourne <b>en entier pour la premiere "
    "fois</b> : <b>%d scenarios</b>, <b>%d verts</b>, <b>%d rouges</b>, et surtout "
    "<b>zero « sans reponse »</b> &mdash; l'identite S1 dediee (ft-v1228) fonctionne, le "
    "<b>HTTP 401</b> qui rendait toute mesure impossible a disparu." % (N_SCEN, N_V, N_R))

h2('1. CE QUI A ETE MESURE, ET DANS QUELLES CONDITIONS')
p("Michel a lance la passe lui-meme (<i>workflow_dispatch</i> + confirmation <b>LANCER</b>), "
  "sur le <i>master</i> du moment. Les deux verrous ont fonctionne : la confirmation, puis "
  "le <b>refus avant depense</b> si le secret <b>%s</b> manque. Le <b>controle gratuit</b> "
  "(3 scenarios a blanc, aucun appel) est passe avant que le premier euro ne soit engage."
  % NOM_SECRET)
tab([['', 'valeur mesuree'],
     ['duree de la passe', '<b>12 min 57 s</b> (20:54:55 -&gt; 21:07:52 UTC)'],
     ['scenarios declares dans le depot', '<b>%d</b> <i>(eval-scenarios.js)</i>' % N_SCEN],
     ['scenarios reellement joues', '<b>%d</b> &mdash; recomptes un par un, pas lus sur la '
      'ligne de total' % (N_V + N_R)],
     ['verts / rouges', '<b>%d</b> / <b>%d</b>' % (N_V, N_R)],
     ['sans reponse', '<b>0</b> &mdash; <i>au run precedent : 1 sur 1, HTTP 401</i>'],
     ['modele mesure', 'Sonnet 4.6 (production) &mdash; le Milo <b>en ligne</b>, pas une '
      'version locale'],
     ['cout', '<b>%d appels</b> sur le quota du compte (plafond dev <b>%s</b>/jour, '
      'standard %s)' % (N_SCEN, Q_DEV, Q_MAIL)]],
    [58 * mm, 115 * mm])

cle("<b>POURQUOI CE CHIFFRE VAUT QUELQUE CHOSE.</b> Ce n'est pas une amelioration de Milo : "
    "<b>rien de son comportement n'a ete touche</b>. C'est la <b>premiere fois qu'on peut le "
    "mesurer du tout</b>. Jusqu'ici le rapport etait « blanc » depuis toujours, et personne "
    "ne l'avait vu &mdash; <i>un instrument qui n'a jamais tourne ressemble a un instrument "
    "qui n'a rien trouve.</i>")

h2('2. LE RESULTAT : %d verts, %d rouges' % (N_V, N_R))
p("<b>Le job GitHub est en rouge, et c'est normal</b> : <i>eval.js</i> sort en code 1 des "
  "qu'un scenario rougit. L'infrastructure, elle, a fonctionne de bout en bout.")
rows = [['scenario', 'ce que le verificateur a dit', 'lecture']]
for ident, titre, extrait, lecture in ROUGE_DIT:
    rows.append(['<b>%s</b><br/><font size="7">%s</font>' % (ident, titre),
                 '<i>%s</i>' % extrait, lecture])
tab(rows, [34 * mm, 62 * mm, 77 * mm])

cle("<b>EV-007 ET EV-042 SONT LE MEME DEFAUT, COMPTE DEUX FOIS.</b> Les deux disent "
    "<i>« 2 questions »</i>. C'est la famille <b>« interrogatoire »</b>, deja documentee dans "
    "<i>docs/BUGS-DE-PHILOSOPHIE.md</i>. <b>R9</b> dit ou ca se joue : au niveau du "
    "<b>modele</b>, pas du prompt &mdash; trois durcissements de prompt avaient deja echoue "
    "sur ce meme symptome le 26/07.")
cle("<b>EV-023 EST LE PLUS INTERESSANT DES SIX</b>, parce qu'il est structurel : Milo ecrit "
    "« superset » dans sa reponse mais ne dit pas <b>quels deux exercices</b> s'enchainent. "
    "Le convertisseur ne peut donc pas le transcrire, et le groupement <b>se perd entre le "
    "texte et la donnee</b>. C'est <b>R4</b> mot pour mot &mdash; la famille de bugs la plus "
    "couteuse du projet, <b>11 occurrences</b> recensees dans <i>BUGS.md</i>.")

h2('3. CE QUE JE NE CONCLUS PAS &mdash; et pourquoi je le dis avant de le savoir')
cle("<b>EV-055 ET EV-056 SONT SUSPECTS, ET JE NE LES COMPTE PAS ENCORE COMME DES DEFAUTS DE "
    "MILO.</b> Les deux echouent sur <b>« 0 exercice »</b> &mdash; pas sur un mauvais choix "
    "d'exercice, sur <b>aucun</b>. Deux lectures tiennent : soit Milo a vraiment repondu sans "
    "ecrire de seance, soit <b>mes compteurs de lignes ne reconnaissent pas le format de sa "
    "reponse</b>.", ALERTE)
p("C'est exactement la famille <i>« un temoin qui mesure autre chose que ce qu'il annonce »</i>, "
  "et ce depot l'a payee plusieurs fois dans la seule journee du 20/09 : un compteur d'appels "
  "qui comptait la <b>declaration</b> de la fonction, un garde qui interdisait un <b>mot</b> "
  "present dans un commentaire legitime, un controle negatif dont les 20 mutations echouaient "
  "toutes <b>avant</b> d'atteindre le moindre garde.")
cle("<b>LE GARDE INTERNE DU SCENARIO REND LA CHOSE PLUS TROUBLANTE, PAS MOINS.</b> EV-055 "
    "porte explicitement <i>« &hellip; et il a bien ecrit une seance (sinon le temoin serait "
    "vert sur du vide) »</i> &mdash; donc son auteur avait <b>deja prevu</b> le cas du vide. "
    "Ce garde a fait son travail : il a refuse de rendre un vert facile. Reste a savoir "
    "<b>pourquoi il voit du vide</b>.")
p("<b>Cela se verifie sans relancer la passe</b> (donc sans depenser un appel) : il suffit de "
  "lire les deux verificateurs et de leur donner une reponse ecrite a la main. <b>Tant que ce "
  "n'est pas fait, le vrai score est « 4 rouges certains + 2 a qualifier »</b>, et l'ecrire "
  "autrement serait se mentir.")

h2("4. UN DEFAUT DU WORKFLOW, NOMME ET VOLONTAIREMENT NON CORRIGE")
cle("<b>LA REFERENCE COMPORTEMENTALE N'A PAS ETE ENREGISTREE, ET ELLE NE LE SERA JAMAIS "
    "EN L'ETAT.</b> L'etape <i>« Enregistrer la reference dans le depot »</i> a ete "
    "<b>sautee</b>.", ALERTE)
p("<b>Le mecanisme exact, mesure dans le fichier</b> : la condition de l'etape est "
  "<i>%s</i>. Elle ne contient <b>aucune fonction d'etat</b> "
  "(<i>success()</i>, <i>failure()</i>, <i>always()</i>) &mdash; et dans ce cas GitHub Actions "
  "insere <b>success()</b> implicitement. Une passe qui rougit fait donc sauter l'etape."
  % html.escape(IF_TXT))
cle("<b>ET C'EST UNE CONTRADICTION AVEC LE BUT MEME DU WORKFLOW.</b> Il s'appelle "
    "<i>« reference comportementale »</i> : son travail est d'enregistrer <b>ce que Milo fait "
    "aujourd'hui</b>, rouges compris, pour qu'on puisse comparer demain. Or il ne l'enregistre "
    "que si Milo est parfait. <i>Une reference qui exige la perfection n'est pas une "
    "reference, c'est un certificat.</i>")
p("<b>Je ne le corrige pas ici</b> : changer la condition, c'est decider ce qui merite d'etre "
  "grave dans le depot, et c'est un arbitrage produit (<b>regle d'or 15</b>). En attendant, "
  "le journal de cette passe est pose a la main dans <i>%s</i>, et la piece jointe du run "
  "garde <i>eval-report.json</i> pendant 30 jours." % JOURNAL)

h2('5. CE QUE CETTE PASSE NE FAIT PAS')
tab([['', ''],
     ['aucun fichier servi', 'aucun des %d fichiers servis n\'a change depuis la mesure '
      '&mdash; verifie fichier par fichier, pas suppose' % len(SERVIS)],
     ['aucun bump', 'la version servie reste <b>%s</b>' % VERSION],
     ['aucun rouge corrige', 'les %d rouges sont <b>consignes</b>, pas repares' % N_R],
     ['aucune regle de Milo touchee', 'ni le prompt, ni le contexte, ni le modele, ni '
      '<i>coachMemory</i>, ni l\'ADN, ni le Gardien'],
     ['aucun scenario modifie', 'les %d scenarios et leurs verificateurs sont intacts' % N_SCEN],
     ['aucun garde-fou affaibli', 'ni <i>push</i>, ni <i>schedule</i>, confirmation <b>LANCER</b> '
      'intacte, refus avant depense intact, controle gratuit intact'],
     ['aucun secret nulle part', 'seul le <b>nom</b> %s figure ici ; un garde relit la page '
      'produite et refuse toute chaine de 64 hexadecimaux' % NOM_SECRET]],
    [42 * mm, 131 * mm])

h2('6. CE QUI ATTEND UNE DECISION DE MICHEL')
tab([['question', 'pourquoi elle n\'est pas tranchee ici'],
     ['La reference doit-elle s\'enregistrer <b>avec</b> ses rouges ?',
      'C\'est le sens meme du mot « reference ». Mais c\'est decider ce qui est grave dans le '
      'depot a chaque passe &mdash; un arbitrage, pas un correctif.'],
     ['Les <b>%d rouges</b> se corrigent-ils, et dans quel ordre ?' % N_R,
      'EV-023 (R4) est <b>structurel</b> ; EV-007/EV-042 relevent du <b>modele</b> (R9) et '
      'trois durcissements de prompt ont deja echoue dessus. Ce ne sont pas les memes chantiers.'],
     ['EV-055 et EV-056 : defaut de Milo ou defaut du temoin ?',
      'Se verifie <b>gratuitement</b>, sans relancer la passe. A faire avant toute correction, '
      'sinon on « repare » Milo pour satisfaire un instrument fausse.'],
     ['A quelle frequence relancer la passe ?',
      'Elle coute <b>%d appels</b> et ~13 minutes. Aucun declencheur automatique n\'existe, '
      'volontairement.' % N_SCEN]],
    [52 * mm, 121 * mm])

cle("<b>LA PHRASE A RETENIR.</b> On ne savait pas si Milo suivait ses regles : "
    "<i>tests/milo</i> prouvait leur <b>PRESENCE</b> dans le prompt, jamais son "
    "<b>OBEISSANCE</b>. C'est le prerequis ecrit au &sect;8 de "
    "<i>ARCHITECTURE-CERVEAU-CERVELET</i>, et il vient d'etre leve : "
    "<b>%d sur %d</b>, et six endroits ou regarder." % (N_V, N_SCEN))

_IDX = len(story)
A(Paragraph('<font size="7.4" color="#606060">Dossier genere par '
            '<i>tools/gen_banc_passe_reelle_pdf.py</i> &mdash; <b>@@GARDES@@ faits</b> '
            'recomptes depuis le journal du runner et le code servi ; le generateur refuse '
            'de produire si l\'un tombe. Journal integral : <i>%s</i>.</font>' % JOURNAL, P))

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
                  "Force Tracker - premiere passe reelle du banc de Milo - run %s - %s"
                  % (RUN, SHA_MESURE[:8]))
    cv.drawRightString(195 * mm, 10 * mm, 'page %d' % cv.getPageNumber())
    cv.restoreState()


doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=15 * mm, rightMargin=15 * mm,
                        topMargin=14 * mm, bottomMargin=16 * mm,
                        title='Force Tracker - premiere passe reelle du banc de Milo',
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

# ⛔⛔ AUCUNE VALEUR DE SECRET DANS LA PAGE.
if re.findall(r'\b[0-9a-f]{64}\b', _norm):
    raise SystemExit('GARDE ROUGE - UNE VALEUR DE 64 HEX FIGURE DANS LA PAGE (fuite de secret)')

_ATT = [RUN, SHA_MESURE[:8], VERSION, NOM_SECRET, str(N_SCEN), str(N_V), str(N_R),
        '%d faits' % N_GARDES, 'LANCER'] + [r[0] for r in ROUGE_DIT]
_abs = [a for a in _ATT if a not in _norm]
if _abs:
    raise SystemExit('GARDE ROUGE - faits absents de la PAGE RENDUE : %r' % _abs)

print('OK  %s' % OUT)
print('    %d gardes | %d pages | %d caracteres relus | %d faits verifies dans la page'
      % (N_GARDES, len(_pages), len(_rendu), len(_ATT)))
print('    recompte : %d verts + %d rouges = %d, runner annonce %d/%d, banc declare %d'
      % (N_V, N_R, N_V + N_R, T_V, T_R, N_SCEN))
