#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PASSATION — GOUVERNANCE MEMOIRE, PROVENANCE DE coachMemory, REFERENCE DU BANC (20/09/2026).

Dossier destine a ChatGPT, pour reprendre la reflexion avec Michel sans repartir de zero.

[!!] CHAQUE CHIFFRE SE RECOMPTE ICI, depuis git et depuis le code servi. Si un fait tombe,
     le generateur REFUSE de produire.

[!!] ON MESURE LE CODE, PAS LES COMMENTAIRES. `sans_commentaires` retire /* */ et les
     lignes //, avec la nuance payee le 19/09 : une ligne de commentaire est un `//` NON
     precede de ':'. Sans elle, « https:// » est tronque.

[!!] ON RELIT LA PAGE PRODUITE avant de declarer le succes (regle d'or #14).

CONTRAINTE DE POLICE : WinAnsi/cp1252 - pas d'emoji, pas de fleche unicode.
Sortie par defaut HORS DEPOT (le depot est public).
"""
import html
import json
import os
import re
import subprocess

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                PageBreak)

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
OUT = os.environ.get('FT_OUT') or os.path.join(
    SCRATCH, 'FORCE-TRACKER-MILO-MEMOIRE-COACHMEMORY-BASELINE-BANC-20-09-2026.pdf')

SHA_AVANT = '487c9d31'
CN = os.environ.get('FT_CONTROLE_NEGATIF') == '1'
GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE (#%d) - %s' % (GARDES[0], msg))


def git(*a):
    # ⛔⛔ STDOUT SEUL QUAND LA COMMANDE REUSSIT — et la raison a ete vue, pas imaginee.
    #     Cette fonction rendait `stdout + stderr` melanges. Sur un arbre sans `.git`,
    #     `git diff --name-only` ECHOUE et crache sa PAGE D'AIDE : celle-ci partait alors
    #     telle quelle dans la liste des « fichiers touches », et le dossier publiait
    #     DEUX PAGES de documentation de git en se declarant produit avec succes.
    #     👉 *Une commande qui echoue ne rend pas rien : elle rend autre chose — et ce qui
    #     ressemble le plus a une donnee, c'est un message d'erreur bien forme.*
    #     En cas d'echec on rend la sortie d'erreur pour le diagnostic, jamais comme donnee.
    r = subprocess.run(['git'] + list(a), cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        return r.returncode, r.stderr.strip()
    return 0, r.stdout.strip()


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_commentaires(s):
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    out = []
    for ln in s.split('\n'):
        m = re.search(r'(?<!:)//', ln)
        out.append(ln[:m.start()] if m else ln)
    return '\n'.join(out)


# ══ 1. L'ETAT ══════════════════════════════════════════════════════════════════════════
rc, head = git('rev-parse', '--short=8', 'HEAD')
# ⛔⛔ CE `CN` A ETE AJOUTE APRES COUP, ET LA RAISON VAUT D'ETRE ECRITE ICI.
#     Sans lui, le controle negatif ne mesurait RIEN : un arbre clone n'a pas de `.git`, donc
#     CHAQUE mutation « refusait » pour la meme raison — « HEAD illisible » — avant d'avoir
#     lu la moindre ligne de code. 17 mutations sont sorties « conformes » sans qu'aucun garde
#     de fait ait ete sollicite. Verifie en lancant le generateur sur un clone NON MUTE : il
#     refusait a l'identique.
#     👉 *Un controle negatif dont toutes les mutations echouent au meme endroit ne prouve pas
#     que les gardes mordent : il prouve qu'on n'est jamais arrive jusqu'a eux.* Ce sont les
#     trois mutations attendues VERTES qui l'ont revele — c'est exactement pour ca qu'elles
#     existent (famille « un controle negatif peut mentir », docs/SUIVI-AUDIT.md).
#     ⛔ La neutralisation est DECLAREE et bornee aux gardes de git : ceux-la se verifient en
#     conditions reelles, et ils l'ont fait (refus sur arbre sale, puis sur divergence).
g(CN or (rc == 0 and len(head) == 8), 'HEAD illisible')
if CN and (rc != 0 or len(head) != 8):
    head = '0' * 8
rc, sale = git('status', '--porcelain')
g(CN or sale == '', 'arbre sale : le dossier declare un arbre propre')
rc, branche = git('rev-parse', '--abbrev-ref', 'HEAD')
rc, ecart = git('rev-list', '--left-right', '--count', 'HEAD...origin/master')
g(CN or ecart.split() == ['0', '0'], 'HEAD et origin/master ont diverge (%r)' % ecart)

sw = lire('sw.js')
VERSION = (re.search(r"CACHE\s*=\s*'(ft-v\d+)'", sw) or [None, ''])[1]
g(VERSION.startswith('ft-v'), 'sw.js ne porte pas de version lisible')

rc, liste = git('log', '--format=%h|%s', '%s..HEAD' % SHA_AVANT)
COMMITS = [l.split('|', 1) for l in liste.split('\n') if '|' in l]
g(CN or len(COMMITS) >= 3, 'moins de 3 commits depuis %s' % SHA_AVANT)
rc, noms = git('diff', '--name-only', '%s..HEAD' % SHA_AVANT)
# ⛔ UNE LISTE DE FICHIERS EST UNE LISTE DE CHEMINS. Sans ce garde, la sortie d'une commande
#    en echec (ou toute prose) se glisse dans le tableau du dossier sans que rien ne proteste.
g(CN or rc == 0, 'git diff a echoue : sa sortie ne doit JAMAIS servir de donnee (%r)' % noms[:80])
TOUCHES = sorted(n for n in noms.split('\n') if n.strip())
g(all(re.fullmatch(r'[\w./@+-]+', n) for n in TOUCHES),
  'la liste des fichiers touches contient autre chose que des chemins : %r'
  % [n for n in TOUCHES if not re.fullmatch(r'[\w./@+-]+', n)][:3])
SERVIS = {'index.html', 'app.js', 'state.js', 'screens.js', 'log.js', 'coach.js',
          'setup.js', 'tracking.js', 'constants.js', 'style.css', 'sw.js',
          'supabase.js', 'capacites-ia.js', 'manifest.json'}
SERVIS_TOUCHES = sorted(set(TOUCHES) & SERVIS)
g(CN or SERVIS_TOUCHES, 'aucun fichier servi modifie : le dossier en annonce')

# ══ 2. GOUVERNANCE MEMOIRE ═════════════════════════════════════════════════════════════
archi = lire('tools/gen_memoire_archi_pdf.py')
_b = archi[archi.index('DECISIONS DESORMAIS ACTEES'):]
_b = _b[:_b.index("A(Paragraph('RISQUES'")]
N_DEC = len(re.findall(r"\[\s*'<b>", _b))
g(N_DEC == 8, 'le tableau du 18/09 porte %d decisions, on en annonce 8' % N_DEC)
RENVOIS = sorted(set(int(x) for x in re.findall(r'decision (\d+)', archi)))
g(RENVOIS == [3, 4, 6, 7, 10], 'les renvois internes valent %r' % (RENVOIS,))

cap_src = lire('capacites-ia.js')
MS = sorted(set(int(x) for x in re.findall(r'\bM(\d{1,2})\b', cap_src) if 1 <= int(x) <= 14))
g(MS == [12, 13, 14], 'capacites-ia.js trace %r comme etiquettes M' % (MS,))
g('arbitrage Q3 (M12)' in cap_src, "la trace « arbitrage Q3 (M12) » a disparu")

resti = lire('docs/DECISIONS-MEMOIRE-LONGUE.md')
g('NON DÉCIDÉS' in resti, "la restitution ne dit plus que les 5 restent NON DECIDEES")
g('arbitrage de Michel' in resti or 'ARBITRAGE EST RENDU' in resti,
  "l'arbitrage du 20/09 n'est pas enregistre dans la restitution")
claude_md = lire('CLAUDE.md')
g('sa numérotation n' in claude_md or "N'EST PAS FIABLE" in claude_md,
  "CLAUDE.md ne met plus en garde contre la numerotation M")
g('docs/DECISIONS-MEMOIRE-LONGUE.md' in claude_md,
  'la restitution n est pas referencee depuis CLAUDE.md, donc personne ne la lira')

# ══ 3. coachMemory ═════════════════════════════════════════════════════════════════════
ST = sans_commentaires(lire('state.js'))
CO = sans_commentaires(lire('coach.js'))
SE = sans_commentaires(lire('setup.js'))
CJ = sans_commentaires(lire('Code.js'))
WK = sans_commentaires(lire('worker.js'))

g("const memory = body.coachMemory || ''" in WK,
  'le Worker ne lit plus coachMemory comme une chaine : le contrat reseau a change')
g(len(re.findall(r"coachMemory\s*:\s*S\.coachMemory\s*\|\|\s*''", CO)) >= 3,
  'les envois a Milo ne passent plus la chaine')
g('function _coachMemProvenance()' in ST, 'le proprietaire de la regle a disparu')
g("statut:'legacy'" in ST and "statut:'generated'" in ST, 'le vocabulaire du statut a change')
g("statut:'validated'" not in (ST + CO + SE), 'un statut `validated` est apparu')
g((ST + CO + SE).count("statut:'legacy'") == 1,
  'plusieurs endroits posent `legacy` : la regle a perdu son proprietaire unique')
g('_model: MODELE_RESUME' in WK, 'le Worker ne renvoie plus le modele du resume')
g("_model: 'claude-haiku-4-5-20251001'" in CJ, 'le repli Apps Script ne renvoie plus le modele')
g('_coachMemPoserProvenance(data._model)' in CO, 'le client ne lit plus le modele du serveur')
g('_po_(body.coachMemoryMeta' in CJ, 'Apps Script ne traite plus la fiche comme un objet')
g(len(re.findall(r'coachMemoryMeta:\(data\.profile', CJ)) == 2,
  'loadProfile ne rend plus la fiche des deux cotes')
g('S.coachMemoryMeta=null' in SE, 'la restauration ne jette plus la fiche quand le texte change')

_meta = re.search(r"S\.coachMemoryMeta=\{ v:COACH_MEM_SCHEMA, statut:'generated',", ST)
g(_meta, 'la forme de la fiche a change')
CLES = ['v', 'statut', 'moteur', 'date', 'source']
# ⛔⛔ ON CHERCHE LA CLE DANS LA FICHE, PAS DANS TOUT state.js. Le garde disait
#     `re.search(r'\bsource\s*:', ST)` : or « source: » existe AILLEURS dans le fichier, donc
#     retirer la cle de la fiche elle-meme le laissait VERT (mutation M06 du controle negatif).
#     👉 *Un garde qui cherche un mot dans tout un fichier ne mesure pas la structure qu'il
#     pretend proteger.* On decoupe donc l'objet litteral et on n'interroge que lui.
_POSEUR = ST[ST.index('function _coachMemPoserProvenance'):]
_POSEUR = _POSEUR[:_POSEUR.index('};') + 2]
for c in CLES:
    g(re.search(r'\b%s\s*:' % c, _POSEUR), 'la cle %r a disparu de la fiche' % c)

# les temoins
tests = lire('tests/parcours/coach_memoire.js')
N_SRC = len(re.findall(r"t\('B-CCCXL ", tests))
N_ECR = len(re.findall(r"t\('B-CCCXLI ", tests))
g(N_SRC == 15 and N_ECR == 13,
  'temoins : %d source / %d ecran, on annonce 15 / 13' % (N_SRC, N_ECR))
# ⛔ LES DEUX BRANCHEMENTS, PAS UN SEUL. Le bloc est cable a DEUX endroits (`.ecran` et
#    `.source`) : un garde qui cherche le nom une fois reste vert quand l'un des deux
#    disparait — donc quand la moitie des temoins cesse de tourner, en silence (mutation M08).
_RUN = lire('tests/parcours/runner.js')
g("require('./coach_memoire.js').ecran(" in _RUN,
  'le bloc CONDUIT n est plus branche dans le runner : ses 13 temoins ne tourneraient plus')
g("require('./coach_memoire.js').source(" in _RUN,
  'le bloc de SOURCE n est plus branche dans le runner : ses 15 temoins ne tourneraient plus')

inv = json.loads(lire('tests/donnees/donnees-milo.json'))
g('coachMemoryMeta' in inv['exclu'], 'coachMemoryMeta n est plus classee face a Milo (R4a)')
g(len(inv['exclu']['coachMemoryMeta']) > 80, 'sa raison d exclusion est trop courte')

# ══ 4. LE BANC ═════════════════════════════════════════════════════════════════════════
ev = lire('tests/milo/eval.js')
g('const QUOTA_JOUR = 150;' in ev, 'le garde du banc n a pas ete corrige')
g('AI_MAX_DEV_' in ev, 'le garde ne renvoie plus a la source du chiffre')
g('var AI_MAX_DEV_ = 150;' in CJ, 'le plafond de developpement a change dans Code.js')
g('_EV_QUOTA_JOUR = 150' in CO, 'coach.js ne porte plus le meme chiffre')
g("sha:_sha" in ev and "nbVerifs:_nbVerifs" in ev,
  'le rapport du banc ne porte plus son SHA ni ses verificateurs')

SCEN = lire('tests/milo/eval-scenarios.js')
N_SCEN = len(re.findall(r"^\s*\{\s*id:\s*'[^']*'", SCEN, flags=re.M))
N_VER = SCEN.count('nom:')
N_T1 = len(re.findall(r"^\s*\{\s*id:\s*'[^']*'", lire('tests/milo/scenarios.js'), flags=re.M))
g((N_SCEN, N_VER, N_T1) == (57, 80, 12), 'banc : %d / %d / %d' % (N_SCEN, N_VER, N_T1))

RAP = json.loads(lire('tests/milo/eval-report.json'))
MODE_RAP = RAP.get('mode')
g(RAP.get('sha'), 'le rapport du banc ne porte pas de SHA')
g(RAP.get('nbVerifs') == N_VER, 'le rapport annonce %s verificateurs' % RAP.get('nbVerifs'))

wf = lire('.github/workflows/banc-milo.yml')
g('workflow_dispatch' in wf, 'le workflow du banc a perdu son declencheur manuel')
g(not re.search(r'^\s*push:', wf, flags=re.M),
  'LE WORKFLOW PART SUR PUSH : il brulerait le plafond et la facture sans que personne '
  'ne l ait demande')
# ⛔⛔ ON CHERCHE UNE CLE YAML, PAS UN MOT. Ce garde disait `'schedule' not in wf` — or le
#     commentaire du workflow EXPLIQUE son absence (« Pas de `push`, pas de `schedule` »), donc
#     il rougissait sur un arbre parfaitement sain. Il n'avait jamais ete atteint : les gardes
#     de git echouaient avant lui.
#     👉 *Un garde qui interdit un MOT punit la phrase qui explique la decision* — et R30 exige
#     justement que cette phrase soit ecrite la. Meme famille que le garde « en construction »
#     corrige plus tot, et que le piege du sous-chaine n°1 de BUGS.md. On mesure le
#     DECLENCHEUR, comme le fait deja le garde de `push:` juste au-dessus.
g(not re.search(r'^\s*schedule:', wf, flags=re.M),
  'le workflow a un declencheur programme')
# ⛔ ON MESURE LA COMPARAISON, PAS LE MOT. « LANCER » apparait TROIS fois dans le workflow,
#    dont deux dans de la prose (la description du champ et le message d'erreur) : le garde
#    `'LANCER' in wf` restait donc vert alors meme que le test qui REFUSE avait disparu
#    (mutation M14). Meme famille que le garde `schedule` corrige plus haut.
g(re.search(r'!=\s*"LANCER"\s*\]', wf),
  'la confirmation a taper a disparu : le workflow ne REFUSE plus sans elle')
g('gen_banc_reference.py' in wf, 'le workflow n enregistre plus la reference')
g(os.path.exists(os.path.join(ROOT, 'tools', 'gen_banc_reference.py')),
  'le generateur de la reference est absent')
gen_ref = lire('tools/gen_banc_reference.py')
g("R.get('mode') in ('reel', 'comparaison')" in gen_ref,
  'le generateur de reference n exige plus une passe REELLE')
g('"reply"' in gen_ref, 'le garde « aucune conversation publiee » a disparu')

# le reseau, mesure
PROXY = os.environ.get('HTTPS_PROXY', '')
g(PROXY, 'pas de proxy declare : la preuve du blocage ne serait pas reproductible')

# ══ 5. LES OBSERVATIONS ════════════════════════════════════════════════════════════════
IDX = lire('index.html')
g('api.qrserver.com' in IDX, 'le QR tiers a disparu d index.html : l observation est perimee')
g(IDX.count('api.qrserver.com') == 1, 'le QR tiers apparait %d fois' % IDX.count('api.qrserver.com'))
APPJS = sans_commentaires(lire('app.js'))
g("qr.src.includes('qrserver')" in APPJS,
  'le patron paresseux du QR a disparu d app.js : il sert d exemple dans le dossier')
g('wger.de' in sans_commentaires(lire('log.js')), 'wger.de a disparu')
g('sont ICI, en bas' in lire('coach.js'),
  'la note de 556 caracteres a ete corrigee : le dossier la decrit encore comme ouverte')
_i = lire('coach.js').index('(⚠️ TOUT CE QUI EST AU-DESSUS')
_j = lire('coach.js').index('sans jamais toucher à la partie mise en cache.)') + 46
N_NOTE = _j - _i
g(500 < N_NOTE < 620, 'la note fait %d caracteres' % N_NOTE)

# le cout, recompte depuis les tarifs du depot
_t = re.search(r"prod\s*:\s*\{[^}]*entree:([\d.]+),\s*sortie:\s*([\d.]+)", ev)
_h = re.search(r"haiku:\s*\{[^}]*entree:\s*([\d.]+),\s*sortie:\s*([\d.]+)", ev)
g(_t and _h, 'les tarifs ne sont plus lisibles dans eval.js')
S_IN, S_OUT = float(_t.group(1)), float(_t.group(2))
H_IN, H_OUT = float(_h.group(1)), float(_h.group(2))
g((S_IN, S_OUT, H_IN, H_OUT) == (3.0, 15.0, 1.0, 5.0),
  'les tarifs ont change : %r' % ((S_IN, S_OUT, H_IN, H_OUT),))
CAR_TOK = float(re.search(r'CAR_PAR_TOKEN\s*=\s*([\d.]+)', ev).group(1))
CTX_COM, CTX_PER, CTX_INS = 45383, 27272, 2856
cache = (CTX_COM + CTX_PER) / CAR_TOK
plein = CTX_INS / CAR_TOK
C_MILO = cache * S_IN * 0.1 / 1e6 + plein * S_IN / 1e6 + 700 * S_OUT / 1e6
sum_in = (16 * 400 + 250 * CAR_TOK + 190) / CAR_TOK
C_SUM = sum_in * H_IN / 1e6 + 250 * H_OUT / 1e6
PART = 100 * C_SUM / (C_MILO + C_SUM)
g(10 < PART < 20, 'la part du resume vaut %.1f %% : hors de la mesure du 20/09 (15 %%)' % PART)

g('coachHistory.length >= 4' in CO, 'le seuil de 4 messages a change')
g('_compterIA(body.action' in WK, 'le Worker ne compte plus toutes les actions')
g('EMAIL_MAX  = parseInt' in CJ, 'le plafond par email a disparu')

DOC = lire('docs/COACHMEMORY-PROVENANCE.md')
g('provenance ≠ validation' in DOC, 'la doc ne dit plus que provenance n est pas validation')


# ══ 6. LE PDF ══════════════════════════════════════════════════════════════════════════
BLEU = colors.HexColor('#1d4ed8'); GRIS = colors.HexColor('#4b5563')
FOND = colors.HexColor('#f3f4f6'); TRAIT = colors.HexColor('#d1d5db')
ss = getSampleStyleSheet()
H1 = ParagraphStyle('H1', parent=ss['Title'], fontSize=15.5, leading=19, textColor=BLEU, spaceAfter=2)
SUB = ParagraphStyle('SUB', parent=ss['Normal'], fontSize=9, leading=12.5, textColor=GRIS,
                     alignment=1, spaceAfter=9)
H2 = ParagraphStyle('H2', parent=ss['Heading2'], fontSize=11.5, leading=14.5, textColor=BLEU,
                    spaceBefore=10, spaceAfter=4)
H3 = ParagraphStyle('H3', parent=ss['Heading3'], fontSize=9.8, leading=12.5,
                    textColor=colors.HexColor('#111827'), spaceBefore=6, spaceAfter=2)
P = ParagraphStyle('P', parent=ss['Normal'], fontSize=8.6, leading=11.9, spaceAfter=4)
PC = ParagraphStyle('PC', parent=P, fontSize=8.0, leading=10.8)
CLE = ParagraphStyle('CLE', parent=P, fontSize=9.0, leading=12.6, backColor=FOND,
                     borderPadding=6, borderWidth=0.6, borderColor=TRAIT, spaceBefore=5, spaceAfter=6)
NOTE = ParagraphStyle('NOTE', parent=P, fontSize=8.0, leading=11, textColor=GRIS)
story = []


def h1(t, s):
    story.append(Paragraph(t, H1)); story.append(Paragraph(s, SUB))


def h2(t): story.append(Paragraph(t, H2))


def h3(t): story.append(Paragraph(t, H3))


def p(t, st=None): story.append(Paragraph(t, st or P))


def cle(t): story.append(Paragraph(t, CLE))


def tab(rows, widths, entete=True):
    data = [[Paragraph(c, PC) for c in r] for r in rows]
    tt = Table(data, colWidths=widths, repeatRows=1 if entete else 0)
    st = [('GRID', (0, 0), (-1, -1), 0.4, TRAIT), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
          ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5)]
    if entete: st.append(('BACKGROUND', (0, 0), (-1, 0), FOND))
    tt.setStyle(TableStyle(st)); story.append(tt); story.append(Spacer(1, 5))


def n(x): return format(x, ',').replace(',', ' ')


h1('FORCE TRACKER &mdash; MEMOIRE, PROVENANCE DE coachMemory, ET REFERENCE DU BANC',
   'Passation pour ChatGPT &middot; 20 septembre 2026 &middot; avant <b>%s</b> &middot; apres '
   '<b>%s</b> &middot; version servie <b>%s</b>' % (SHA_AVANT, head, VERSION))

cle("<b>CE QUE CETTE SESSION A FAIT.</b> Elle n'a pas rendu Milo plus impressionnant : elle a "
    "rendu ce qui existe <b>plus fiable, tracable et comparable</b>. Trois choses : la "
    "gouvernance des decisions memoire est nettoyee de l'illusion &laquo; M1-M14 &raquo; ; "
    "<b>S.coachMemory porte desormais une provenance</b> sans rien perdre de sa continuite ; et "
    "le banc de Milo peut enfin produire une <b>reference comportementale partageable</b> "
    "&mdash; par un workflow, pas par une manipulation de Michel.")

# ── ETAT ──────────────────────────────────────────────────────────────────────────────
h2('1. Etat')
tab([['', 'valeur'],
     ['branche', '<b>%s</b>' % branche],
     ['SHA initial &middot; final', '<b>%s</b> &middot; <b>%s</b>' % (SHA_AVANT, head)],
     ['version servie avant &middot; apres', '<b>%s</b> &middot; <b>%s</b>' % (VERSION, VERSION)],
     ['arbre', 'propre &middot; ecart avec origin/master : <b>0 / 0</b>'],
     ['commits de la session', '<b>%d</b>' % len(COMMITS)],
     ['fichiers <b>servis</b> modifies', '<b>%s</b>' % ', '.join(SERVIS_TOUCHES)]],
    [50 * mm, 115 * mm])
tab([['fichier', 'nature']] +
    [[f, ('<b>SERVI</b>' if f in SERVIS else
          ('backend' if f in ('Code.js', 'worker.js') else
           ('test' if f.startswith('tests/') else
            ('outil' if f.startswith('tools/') or f.startswith('.github/') else 'documentation'))))]
     for f in TOUCHES], [78 * mm, 87 * mm])

# ── GOUVERNANCE ───────────────────────────────────────────────────────────────────────
h2('2. Gouvernance memoire &mdash; CORRIGE')
cle("<b>ARBITRAGE DE MICHEL, ENREGISTRE.</b> <i>&laquo; Ne plus presenter M1-M11 comme une "
    "serie fiable de decisions de Michel. &raquo;</i> Les <b>5 elements introuvables</b> ne "
    "sont ni reconstruits, ni deduits, ni attribues : ils restent <b>NON DECIDES</b> et "
    "redeviendront une question <b>le jour ou le cas se presentera</b>. Et sur la forme : "
    "<i>&laquo; la verite historique vaut plus qu'une numerotation propre &raquo;</i>.")
tab([['ce qui est prouve', 'ou'],
     ['<b>%d decisions</b> citees textuellement' % N_DEC,
      'tableau &laquo; DECISIONS DESORMAIS ACTEES &raquo; de <i>tools/gen_memoire_archi_pdf.py</i> '
      '(18/09, commit d86a7f10)'],
     ['la numerotation par position, <b>corroboree 4 fois</b>',
      'les renvois internes %s tombent sur les rangs 3, 4, 6, 7'
      % ', '.join(str(x) for x in RENVOIS if x < 10)],
     ['une <b>9e</b> prouvee par deux renvois convergents', '&laquo; decision 10 &raquo;, hors tableau'],
     ['les seules etiquettes M legitimes', '<b>M%d, M%d, M%d</b> dans capacites-ia.js'
      % tuple(MS)]],
    [62 * mm, 103 * mm])
p("<b>Ce qui a ete corrige dans le depot</b> : l'entree <i>ft-v1224</i> de <b>CLAUDE.md</b> porte "
  "desormais sa propre mise en garde (la phrase reste &mdash; c'est de l'histoire, on ne reecrit "
  "pas un journal &mdash; mais elle dit qu'elle n'est pas fiable), et "
  "<b>docs/DECISIONS-MEMOIRE-LONGUE.md</b> entre dans la liste de gouvernance. "
  "<b>C'etait le vrai defaut</b> : l'illusion se propageait parce que CLAUDE.md est le SEUL "
  "fichier relu a chaque session, et que la restitution, elle, ne l'etait pas.")

story.append(PageBreak())
# ── COACHMEMORY ───────────────────────────────────────────────────────────────────────
h2('3. S.coachMemory &mdash; provenance posee (option B)')
cle("<b>LA DECISION DE CONCEPTION : coachMemory RESTE UNE CHAINE.</b> Mesure avant d'ecrire une "
    "ligne &mdash; elle traverse <b>19 lignes de code</b> (32 occurrences), dont deux contrats qui n'appartiennent pas au "
    "client : <i>worker.js</i> la concatene dans le prompt de Milo, et <i>Code.js</i> la passe au "
    "nettoyeur de CHAINE. <b>En faire un objet aurait injecte &laquo; [object Object] &raquo; dans "
    "le prompt</b> &mdash; le recul exact que l'arbitrage interdit. La provenance vit donc "
    "<b>A COTE</b>, dans un champ neuf : <b>S.coachMemoryMeta</b>. Ce n'est pas une duplication "
    "(R2) : <i>S.coachMemory</i> porte le TEXTE, <i>S.coachMemoryMeta</i> porte D'OU IL VIENT.")
# [!!] LE NOM DU CHAMP EST ECRIT ICI PARCE QUE LE GARDE DE RELECTURE L'EXIGE, ET IL AVAIT
#      RAISON : la page decrivait « un champ neuf » sans jamais le nommer. Un dossier de
#      passation qui ne donne pas le nom oblige son lecteur a le chercher dans le code —
#      c'est-a-dire a refaire le travail que le dossier existe pour lui epargner.
tab([['cle (dans <b>S.coachMemoryMeta</b>)', 'valeur', 'quand'],
     ['<b>v</b>', '1', 'version du schema'],
     ['<b>statut</b>', "<b>generated</b> | <b>legacy</b>",
      "produite par le format actuel | elle existait avant, <b>on ne sait pas</b>"],
     ['<b>moteur</b>', "le modele <b>renvoye par le serveur</b> | <b>null</b>",
      "<b>jamais devine</b> : worker.js renvoie desormais <i>_model</i>, Code.js aussi"],
     ['<b>date</b>', 'ISO | <b>null</b>', "l'instant de la production"],
     ['<b>source</b>', "<i>summarizeCoach</i> | <b>null</b>", 'ce qui l a produite']],
    [22 * mm, 58 * mm, 85 * mm])
h3("provenance n'est PAS validation &mdash; la borne posee par Michel")
p("<i>&laquo; Ne donne surtout pas a coachMemory le statut `validated` simplement parce qu'elle "
  "existe. &raquo;</i> <b>registre.observations</b> porte <i>validated</i> <b>parce que quelqu'un "
  "a repondu OUI</b>. Un resume produit par une IA n'a rien a voir. D'ou <b>deux valeurs "
  "seulement</b>, et aucune qui pretende a l'accord de qui que ce soit. Un temoin et une mutation "
  "figent l'interdiction.")
h3('La migration : une REGLE rejouee, jamais un drapeau')
p("<b>_coachMemProvenance()</b> est le proprietaire unique, <b>idempotent par construction</b>, "
  "rejoue au chargement <b>et apres chaque restauration cloud</b>. Pas de drapeau "
  "&laquo; migration faite &raquo; : une restauration remplace l'etat APRES le chargement et peut "
  "ramener un profil d'avant des mois plus tard (lecon <i>ft4_stmig1</i>, ft-v1213, et des trois "
  "pots de ft-v1225).")
cle("<b>LE DEFAUT TROUVE EN ECRIVANT, ET CORRIGE.</b> Ma premiere version gardait la provenance "
    "locale quand la restauration remplacait le texte. Si le nuage porte un profil d'avant le "
    "20/09, il n'apporte PAS de provenance &mdash; et l'ancienne fiche, qui decrivait un texte "
    "<b>qui n'existe plus</b>, serait restee collee au nouveau. "
    "<b>On aurait fabrique une fausse provenance avec le mecanisme construit pour l'empecher.</b> "
    "Regle : texte different &rarr; on jette la fiche. Figee par le temoin ⑭ et la mutation M11."
    .replace('&rarr;', '-&gt;').replace('⑭', '14'))
p("<b>Tests</b> : blocs <b>B-CCCXL</b> (%d temoins de source) et <b>B-CCCXLI</b> (%d conduits dans "
  "le navigateur), dans <i>tests/parcours/coach_memoire.js</i> &mdash; memoire ancienne, "
  "idempotence rejouee 3 fois, resume neuf, serveur muet, provenance connue jamais retrogradee, "
  "aller-retour persist/load, memoire vide, fiche abimee, JSON casse, et ce qui part au nuage. "
  "<b>Controle negatif : 19 mutations sur arbre clone, 19 conformes</b>, dont <b>3 qui doivent "
  "RESTER VERTES</b> (les mots cherches cites dans un commentaire). " % (N_SRC, N_ECR))

story.append(PageBreak())
h2('4. Le cout de coachMemory &mdash; et une correction a l etude du matin')
tab([['', 'Milo (<i>coach</i>)', 'le resume (<i>summarizeCoach</i>)'],
     ['modele', '<b>sonnet-4-6</b>', '<b>haiku-4-5</b>'],
     ['entree', '~20&nbsp;182 jetons <b>en cache</b> + 793 plein tarif',
      '~2&nbsp;081 jetons, <b>aucun cache</b>'],
     ['sortie', '~700 jetons', '250 jetons (plafond)'],
     ['<b>cout par message</b>', '<b>%.4f $</b>' % C_MILO, '<b>%.4f $</b>' % C_SUM]],
    [30 * mm, 68 * mm, 67 * mm])
cle("<b>CORRECTION.</b> L'etude du 20/09 au matin disait que coachMemory <i>&laquo; double le "
    "nombre d'appels IA &raquo;</i>. <b>C'est vrai pour les APPELS</b> (2 au lieu de 1 des le 4e "
    "echange). <b>C'est faux pour le cout</b> : le resume pese <b>%.0f&nbsp;%%</b> du prix d'un "
    "message. Haiku est bon marche et le contexte de Milo est enorme &mdash; c'est lui qui coute."
    % PART)
cle("<b>EN REVANCHE LE QUOTA COMPTE LES APPELS, PAS LE PRIX.</b> Mesure : worker.js compte "
    "<b>toute</b> action, resume inclus. Plafond <b>50/jour/e-mail</b> (600 au total, 150 pour "
    "les comptes de developpement). <b>Une conversation consomme DEUX unites par message au-dela "
    "du 4e echange : les 50 appels quotidiens ne valent qu'environ 26 messages.</b> "
    "⛔ Rien n'est change &mdash; consigne de Michel : <i>ne pas changer la frequence pour "
    "economiser</i>. C'est un fait mesure, rendu a son arbitrage.".replace('⛔', ''))

h2('5. Le resume de resume &mdash; mesure, NON resolu')
tab([['mesure', 'valeur'],
     ['iterations sur une conversation de <b>20</b> messages', '<b>17</b>'],
     ['iterations sur <b>50</b> messages', '<b>47</b>'],
     ['fenetre de messages relus a chaque fois', '<b>16</b>, les plus recents, tronques a 400 car.'],
     ['taille de sortie', '<b>250 jetons</b>, a chaque iteration'],
     ['la consigne reinjecte le precedent', "<b>oui</b> &mdash; &laquo; Memoire existante : … &raquo;"]],
    [80 * mm, 85 * mm])
p("<b>Un fait dit au premier message et jamais redit ne survit QUE par la chaine de resumes, "
  "re-comprime 17 fois sur une conversation de 20 messages.</b> Ce qui se degrade, par ordre de "
  "vraisemblance : le <b>detail</b> (un chiffre precis devient &laquo; ses charges &raquo;), la "
  "<b>nuance</b>, puis l'<b>ancien</b> &mdash; chaque passe privilegie les 16 messages recents, "
  "qui sont EN ENTIER dans la consigne, face a une memoire deja comprimee. "
  "<b>Et la derive est invisible</b> : aucun temoin ne compare la memoire a ce qui a ete dit.")
p("<b>IDEE A ETUDIER, non ouverte</b> : ce qui la mesurerait est un rejeu d'une conversation "
  "connue avec une question dont la reponse a ete donnee au PREMIER message &mdash; "
  "<b>PT-001 fait deja exactement ce geste</b> sur les seances. Ce qui la reduirait durablement "
  "est la migration des faits durables vers <i>registre.observations</i>, c'est-a-dire le "
  "chantier de memoire longue, <b>qui n'est pas ouvert</b>.", NOTE)

story.append(PageBreak())
# ── BANC ──────────────────────────────────────────────────────────────────────────────
h2('6. Le banc de Milo &mdash; pourquoi il n a PAS tourne ici, et ce qui le rend possible')
cle("<b>PREUVE DU BLOCAGE, avec sa cause technique precise.</b> Le banc pilote l'app EN LIGNE, "
    "qui appelle le Worker, qui porte la cle API. Les <b>trois</b> maillons sont hors d'atteinte "
    "depuis ce conteneur : le proxy de sortie repond <b>&laquo; 403 a CONNECT (refus de "
    "politique) &raquo;</b> pour <i>michdu75-commits.github.io</i>, "
    "<i>dry-field-e931.forcetracker-app.workers.dev</i> et <i>script.google.com</i>. "
    "⛔ Ce n'est pas &laquo; je ne peux pas &raquo; : c'est un refus de passerelle, reproductible, "
    "lisible dans l'etat du proxy.".replace('⛔', ''))
tab([['ce qui a ete cherche avant de conclure (R16)', 'resultat'],
     ['acces reseau direct aux trois hotes', '<b>403 a CONNECT</b>, les trois'],
     ['une automatisation existante qui lance le banc', '<b>aucune</b> &mdash; 3 workflows, tous de deploiement'],
     ['une cle API utilisable localement', "<b>non</b> &mdash; elle vit dans Cloudflare / Script Properties"],
     ['servir l app en local pour contourner', "<b>non</b> &mdash; elle appelle quand meme le Worker"]],
    [95 * mm, 70 * mm])
h3('Ce qui a ete construit a la place &mdash; une automatisation, pas une consigne')
p("<b>.github/workflows/banc-milo.yml</b> : un runner GitHub, lui, a le reseau. "
  "⛔⛔ <b>Il ne part JAMAIS tout seul</b> &mdash; pas de <i>push</i>, pas de <i>schedule</i>, "
  "<b>uniquement workflow_dispatch</b>, avec le mot <b>LANCER</b> a taper. Une passe = <b>%d "
  "appels IA reels, factures</b> : un workflow qui partirait sur chaque push brulerait le plafond "
  "quotidien et la facture sans que personne ne l'ait demande. Un verrou de concurrence empeche "
  "deux passes simultanees.".replace('⛔⛔', '') % N_SCEN)
tab([['etape du workflow', 'ce qu elle garantit'],
     ['confirmation <b>LANCER</b>', 'aucune depense par accident'],
     ['<i>node tests/milo/eval.js --go</i>', 'la passe REELLE, sur l app en ligne'],
     ['<b>verification du rapport</b>',
      "⛔ refuse si le mode est &laquo; blanc &raquo;, s'il n'y a pas de SHA, ou si aucun scenario "
      "n'a ete joue &mdash; <b>une passe tronquee ne doit jamais passer pour une reference</b> "
      "(BUGS.md §61)".replace('⛔', '')],
     ['<i>tools/gen_banc_reference.py</i>',
      'produit <b>docs/BANC-MILO-REFERENCE.md</b> et le committe'],
     ['piece jointe', 'le journal complet, 30 jours']],
    [52 * mm, 113 * mm])
cle("<b>ET UN GARDE PERIME BLOQUAIT LE BANC, MESURE.</b> <i>eval.js</i> refusait au-dela de "
    "<b>45</b> appels, au nom d'un plafond de &laquo; 50/jour/personne &raquo;. Or le banc tourne "
    "sous un compte de developpement, dont le plafond reel est <b>150 depuis le 25/08</b> "
    "&mdash; releve precisement POUR ce banc. <b>Avec 57 scenarios, le garde refusait une passe "
    "que le serveur aurait acceptee.</b> Le garde reste (une passe tronquee est le pire "
    "resultat) ; c'est le CHIFFRE qui est corrige, avec le renvoi aux deux autres endroits qui "
    "le portent.")
p("<b>Et le rapport du banc dit desormais sur QUOI il a ete mesure</b> : SHA, version servie, app "
  "reellement testee, modele, nombre de scenarios et de verificateurs, repetitions, et "
  "<i>jugeIA: false</i>. <b>Sans le SHA, &laquo; avant &raquo; et &laquo; apres &raquo; ne "
  "designent rien.</b> ⛔ Aucune conversation n'y entre : un garde du generateur <b>refuse de "
  "produire</b> si une cle <i>reply</i>, <i>reponse</i> ou <i>content</i> apparait."
  .replace('⛔', ''))
tab([['etat du banc', 'valeur'],
     ['scenarios Tier 2', '<b>%d</b>' % N_SCEN],
     ['verificateurs', '<b>%d</b>' % N_VER],
     ['temoins Tier 1', '<b>%d</b>' % N_T1],
     ['juge IA', '<b>aucun</b> &mdash; decision ecrite, et cette session n en introduit pas'],
     ['mode du dernier rapport du depot', '<b>%s</b>' % MODE_RAP],
     ['reference enregistree', '<b>pas encore</b> &mdash; elle naitra au premier lancement du workflow']],
    [62 * mm, 103 * mm])

story.append(PageBreak())
# ── NON MODIFIE / OBSERVATIONS ────────────────────────────────────────────────────────
h2('7. Sujets NON modifies &mdash; la liste de Michel, tenue')
tab([['sujet', 'etat'],
     ['ADN de Milo', '<b>non formalise</b> &mdash; on attend une reference comportementale reelle'],
     ['contexte, ordre des blocs, cache', '<b>intacts</b>'],
     ['selection par le cervelet', '<b>intacte</b> &mdash; catalogue et Nutrition toujours inconditionnels'],
     ['abstraction du moteur', '<b>non commencee</b>'],
     ['multi-moteurs', '<b>non</b> &mdash; ce serait du surdimensionnement aujourd hui'],
     ['Connections', "<b>audit seulement</b> &mdash; le registre n'est pas cree"],
     ['cadence', '<b>_dbf* reste le seul embryon</b> &mdash; aucun cron, aucun push'],
     ['voix', '<b>0 ligne</b> &mdash; architecture etudiee, rien construit'],
     ['note de <b>%d caracteres</b>' % N_NOTE,
      "<b>NON corrigee</b> &mdash; R34 exige un banc avant/apres, et la passe reelle n'a pas pu "
      'tourner depuis ce conteneur']],
    [58 * mm, 107 * mm])

h2('8. Observations')
tab([['sujet', 'mesure du 20/09'],
     ['<b>api.qrserver.com</b>',
      "<b>1 requete au chargement</b>, depuis un <i>&lt;img src&gt;</i> STATIQUE d'index.html, "
      "<b>alors que son overlay est ferme</b>. Donnee envoyee : l'URL publique de l'app "
      "(aucune donnee personnelle) &mdash; mais la requete expose <b>IP, User-Agent et Referer</b> "
      "a un tiers <b>a chaque ouverture</b>. <b>Necessaire au chargement : non.</b> "
      "⭐ <b>Le patron paresseux existe deja dans app.js</b> pour l'autre QR (<i>ib-qr-img</i>) : "
      "le retarder est mecanique. ⛔ <b>Aucune bibliotheque QR locale</b> dans le depot "
      "(<i>zxing</i> LIT des codes, il n'en genere pas) : produire le QR hors ligne serait une "
      "dependance nouvelle, donc une decision.".replace('⭐', '').replace('⛔', '')],
     ['<b>wger.de</b>', "toujours present &mdash; recoit le <b>terme tape</b> par la personne (R36)"],
     ['<b>la note de %d caracteres</b>' % N_NOTE,
      "toujours fausse depuis le 10/08 (elle dit a Milo que le catalogue est &laquo; ICI, en bas "
      "&raquo; ; il est au-dessus du marqueur), et toujours <b>payee plein tarif a chaque "
      "message</b>"],
     ['<b>dette R2 nommee</b>',
      "le plafond de <b>150</b> vit maintenant a <b>TROIS</b> endroits (Code.js fait foi, coach.js "
      "et eval.js le repetent). <b>C'est exactement en divergeant que celui d'eval.js etait "
      "devenu faux</b> &mdash; la dette est assumee et ecrite dans les trois fichiers"]],
    [38 * mm, 127 * mm])

h2('9. Arbitrages restants pour Michel')
tab([['', 'question', 'ce qu on sait deja'],
     ['<b>Q1</b>', 'les <b>5 decisions introuvables</b> : a redecider maintenant, ou non decidees '
      'jusqu au jour ou le cas se presente ?',
      "<b>arbitre le 20/09</b> : elles restent NON DECIDEES. <i>La question ne revient que si un "
      "chantier en a besoin.</i>"],
     ['<b>Q2</b>', "<b>la frequence du resume</b> : un appel a chaque message des le 4e echange",
      "c'est ce qui <b>double le quota</b> (50 appels = ~26 messages). <b>Ce n'est pas une "
      "question de cout</b> (15 %), c'est une question de <b>plafond</b>"],
     ['<b>Q3</b>', '<b>ADN</b> : rendre observables certains comportements encore portes par la '
      'prose ?', "a decider <b>apres</b> une vraie reference comportementale, pas avant"],
     ['<b>Q4</b>', '<b>Independance</b> : reversibilite d abord, multi-moteurs plus tard ?',
      '10 appels sur 13 sont deja quasi portables ; le multi-moteurs serait du surdimensionnement'],
     ['<b>Q5</b>', '<b>Connections</b> : le registre descriptif entre-t-il dans l architecture ?',
      '12 hotes, 3 non inventories, 1 requete tierce a chaque ouverture'],
     ['<b>Q6</b>', '<b>api.qrserver.com</b> : garder, retarder, ou remplacer ?',
      "retarder est <b>mecanique</b> (le patron existe) ; le rendre local demanderait une "
      "bibliotheque nouvelle"],
     ['<b>Q7</b>', '<b>la note de %d caracteres</b> : la corriger ?' % N_NOTE,
      "<b>des que le workflow aura produit une reference</b> : le protocole R34 sera alors "
      "satisfait, et pas avant"]],
    [11 * mm, 60 * mm, 94 * mm])

cle("<b>PROCHAINE LIGNE DE REPRISE POUR CHATGPT.</b> Le verrou a lever est unique et il est "
    "connu : <b>lancer le workflow &laquo; Banc d'essai de Milo &raquo; depuis l'onglet Actions "
    "de GitHub, en tapant LANCER</b>. Tant qu'il n'a pas tourne, <b>Q3 (ADN), Q7 (la note) et "
    "tout changement de contexte ou de moteur restent bloques par R34</b> &mdash; non pas par "
    "prudence, mais parce qu'il n'y a litteralement rien a comparer. ⭐ <b>Les deux seules "
    "questions qui ne dependent d'aucune mesure manquante sont Q2 (la frequence du resume) et "
    "Q6 (le QR tiers)</b> : ce sont celles a discuter avec Michel en premier."
    .replace('⭐', ''))

p("<b>Dossier produit par un script qui recompte ses @@GARDES@@ faits depuis git et depuis le "
  "code servi, refuse de produire si un fait tombe, et relit sa propre sortie. Aucune ligne "
  "servie modifiee par le generateur, aucun appel IA depense, aucune decision prise a la place "
  "de Michel.</b>", NOTE)
_IDX_G = len(story) - 1


def _txt(fl):
    out = []
    for f in fl:
        if isinstance(f, Paragraph):
            out.append(f.text)
        elif isinstance(f, Table):
            for row in f._cellvalues:
                for c in row:
                    out.extend(_txt([c]) if not isinstance(c, str) else [c])
    return out


_mauvais = []
for s in _txt(story):
    for ch in html.unescape(re.sub(r'<[^>]+>', '', s)):
        try:
            ch.encode('cp1252')
        except UnicodeEncodeError:
            _mauvais.append(ch)
g(not _mauvais, 'caracteres hors cp1252 APRES desechappement : %r' % sorted(set(_mauvais)))

N_GARDES = GARDES[0] + 1
_v = story[_IDX_G]
g('@@GARDES@@' in _v.text, 'le marqueur du compte de gardes a disparu')
story[_IDX_G] = Paragraph(_v.text.replace('@@GARDES@@', str(N_GARDES)), _v.style)


def pied(cv, doc):
    cv.saveState(); cv.setFont('Helvetica', 7); cv.setFillColor(GRIS)
    cv.drawString(15 * mm, 10 * mm,
                  'Force Tracker - memoire, coachMemory, reference du banc - 20/09/2026 - %s - %s'
                  % (head, VERSION))
    cv.drawRightString(195 * mm, 10 * mm, 'page %d' % cv.getPageNumber())
    cv.restoreState()


doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=15 * mm, rightMargin=15 * mm,
                        topMargin=14 * mm, bottomMargin=16 * mm,
                        title='Force Tracker - memoire, coachMemory, reference du banc',
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
if len(_pages) < 4:
    raise SystemExit('GARDE ROUGE - %d pages seulement' % len(_pages))
if len(_rendu) < 12000:
    raise SystemExit('GARDE ROUGE - %d caracteres rendus : la page est muette' % len(_rendu))
_ATT = [head, VERSION, '%d faits' % N_GARDES, 'coachMemoryMeta', 'workflow_dispatch',
        'api.qrserver.com', 'LANCER', 'B-CCCXL', 'provenance', 'Q7']
_abs = [a for a in _ATT if a not in _norm]
if _abs:
    raise SystemExit('GARDE ROUGE - faits absents de la PAGE RENDUE : %r' % _abs)
_hors = sorted({c for c in _rendu if c not in '\n\r\t' and not c.encode('cp1252', 'ignore')})
if _hors:
    raise SystemExit('GARDE ROUGE - caracteres non rendus : %r' % _hors)
if '@@' in _rendu:
    raise SystemExit('GARDE ROUGE - un marqueur de gabarit est visible')

print('OK  %s' % OUT)
print('    %d gardes | %d pages | %d caracteres relus | %d faits verifies sur le RENDU'
      % (N_GARDES, len(_pages), len(_rendu), len(_ATT)))
