#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PASSATION — CONSOLIDATION DE L'IDENTITE DE MILO ET INDEPENDANCE MOTEUR (20/09/2026).

Dossier destine a ChatGPT, pour qu'il reprenne la reflexion avec Michel sans repartir
de zero.

[!!] CHAQUE CHIFFRE SE RECOMPTE ICI, depuis git et depuis le code servi. Si un fait
     tombe, le generateur REFUSE de produire.

[!!] ON MESURE LE CODE, PAS LES COMMENTAIRES. `sans_commentaires` retire /* */ et les
     lignes //, avec la nuance payee le 19/09 : une ligne de commentaire est un `//`
     NON precede de ':'. Sans elle, « https:// » est tronque et l'adresse du
     fournisseur se compte ZERO fois au lieu de treize.

[!!] LE PROMPT SE RE-MESURE, IL NE SE RECOPIE PAS : on relance le dump du depot,
     redirige hors depot, et on recompte les trois blocs.

[!!] ON RELIT LA PAGE PRODUITE avant de declarer le succes (regle d'or #14 : *un PDF
     muet ressemble a un PDF reussi*). Trois defauts de generateur du 20/09 etaient de
     la meme famille - un garde qui lisait la SOURCE pendant que le RENDU disait autre
     chose.

CONTRAINTE DE POLICE : WinAnsi/cp1252 - pas d'emoji, pas de fleche unicode.
Sortie par defaut HORS DEPOT (le depot est public).
"""
import html
import os
import re
import subprocess
import tempfile

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
    SCRATCH, 'FORCE-TRACKER-MILO-CONSOLIDATION-IDENTITE-INDEPENDANCE-20-09-2026.pdf')

SHA_AVANT = 'fc6137e0'   # etat au debut de la session
VERSION = 'ft-v1226'
CN = os.environ.get('FT_CONTROLE_NEGATIF') == '1'
GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE (#%d) - %s' % (GARDES[0], msg))


def git(*a):
    r = subprocess.run(['git'] + list(a), cwd=ROOT, capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_commentaires(s):
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    out = []
    for ln in s.split('\n'):
        m = re.search(r'(?<!:)//', ln)
        out.append(ln[:m.start()] if m else ln)
    return '\n'.join(out)


def corps_fonction(src, entete):
    m = re.search(entete, src)
    if not m:
        return None
    i = src.index('{', m.end() - 1) + 1
    d, j = 1, i
    while d > 0 and j < len(src):
        if src[j] == '{':
            d += 1
        elif src[j] == '}':
            d -= 1
        j += 1
    return src[i:j]


# ══ 1. L'ETAT DU DEPOT ═════════════════════════════════════════════════════════════════
rc, head = git('rev-parse', '--short=8', 'HEAD')
g(rc == 0 and len(head) == 8, 'HEAD illisible')
rc, sale = git('status', '--porcelain')
g(CN or sale == '', 'arbre sale : le dossier declare « aucune mutation non commitee »')
rc, branche = git('rev-parse', '--abbrev-ref', 'HEAD')
rc, ecart = git('rev-list', '--left-right', '--count', 'HEAD...origin/master')
g(CN or ecart.split() == ['0', '0'], 'HEAD et origin/master ont diverge (%r)' % ecart)

sw = lire('sw.js')
m = re.search(r"CACHE\s*=\s*'(ft-v\d+)'", sw)
g(m and m.group(1) == VERSION, 'sw.js ne sert pas %s' % VERSION)

# les commits de CETTE session
rc, liste = git('log', '--format=%h|%s', '%s..HEAD' % SHA_AVANT)
COMMITS = [l.split('|', 1) for l in liste.split('\n') if '|' in l]
g(CN or len(COMMITS) >= 3, 'moins de 3 commits depuis %s : la session n a rien produit' % SHA_AVANT)

SERVIS = {'index.html', 'app.js', 'state.js', 'screens.js', 'log.js', 'coach.js',
          'setup.js', 'tracking.js', 'constants.js', 'style.css', 'sw.js',
          'supabase.js', 'capacites-ia.js', 'manifest.json', 'Code.js', 'worker.js'}
rc, noms = git('diff', '--name-only', '%s..HEAD' % SHA_AVANT)
TOUCHES = sorted(n for n in noms.split('\n') if n.strip())
SERVIS_TOUCHES = sorted(set(TOUCHES) & SERVIS)
g(CN or not SERVIS_TOUCHES,
  'des fichiers servis ont change : %s - le dossier annonce 0' % SERVIS_TOUCHES)

# ══ 2. PHASE 1 - LES DECISIONS RETROUVEES ══════════════════════════════════════════════
archi = lire('tools/gen_memoire_archi_pdf.py')
g('DECISIONS DESORMAIS ACTEES' in archi,
  'le tableau des decisions a disparu de gen_memoire_archi_pdf.py - la source de la phase 1')
g('Michel a acte 14 decisions' in archi or '14 decisions de Michel' in archi,
  'le dossier du 18/09 ne dit plus « 14 decisions »')
# les 8 lignes du tableau
_bloc = archi[archi.index('DECISIONS DESORMAIS ACTEES'):]
_bloc = _bloc[:_bloc.index("A(Paragraph('RISQUES'")]
N_DEC = len(re.findall(r"\[\s*'<b>", _bloc))
g(N_DEC == 8, 'le tableau porte %d decisions, le dossier en annonce 8' % N_DEC)
# les renvois positionnels qui corroborent
RENVOIS = sorted(set(int(x) for x in re.findall(r'decision (\d+)', archi)))
g(RENVOIS == [3, 4, 6, 7, 10],
  'les renvois internes valent %r - le dossier annonce [3, 4, 6, 7, 10]' % (RENVOIS,))
etude = lire('tools/gen_memoire_longue_pdf.py')
g('DECISIONS MICHEL REQUISES' in etude, "l'etude du matin a perdu ses questions")
N_Q = len(re.findall(r"^\s*\"<b>", etude[etude.index('DECISIONS MICHEL REQUISES'):
                                          etude.index('FAUT-IL INTEGRER')], flags=re.M))
g(N_Q == 6, "l'etude du matin pose %d questions, le dossier en annonce 6" % N_Q)
# [!!] 1er JET FAUX : je cherchais « Q1. » dans la SOURCE, or les Q sont construites par une
#      BOUCLE (`'<b>Q%d.</b>' % (n+1)`) et n'apparaissent en clair que dans le PDF RENDU.
#      *Un garde qui cherche dans la source ce que le rendu fabrique ne mesure rien* - le
#      meme defaut que les trois generateurs du 20/09. On mesure la boucle et son contenu.
# [!!] 2e JET FAUX AUSSI : compter les lignes `    "<b>` en comptait SIX, parce qu'une
#      question longue est coupee en plusieurs litteraux et que la suite recommence par
#      `"<b>`. *Un compteur qui compte des LIGNES ne compte pas des ELEMENTS.* Un element
#      commence apres une ligne qui finit par `",` (ou apres l'ouverture de la liste).
_qbloc = archi[archi.index('CE QUI NECESSITE ENCORE UNE DECISION'):archi.index('Dossier produit')]
_lg = [l for l in _qbloc.split('\n') if l.strip()]
N_QOUV = 0
for _i, _l in enumerate(_lg):
    if not re.match(r'^\s{4}"', _l):
        continue
    _prec = _lg[_i - 1].rstrip()
    if _prec.endswith('",') or _prec.endswith('enumerate(['):
        N_QOUV += 1
g("'<b>Q%d.</b> %s'" in archi,
  "le gabarit des questions ouvertes a change dans le dossier du 18/09")
g(N_QOUV == 5, 'le dossier du 18/09 laisse %d questions ouvertes, on en annonce 5' % N_QOUV)
g('milo.memory devient-elle Premium' in archi,
  "Q3 (« milo.memory devient-elle Premium ? ») a disparu : c'est elle qui prouve "
  "l'incompatibilite des numerotations")
g('reste ouverte et n\'est pas tranchee par cette passe' in archi,
  "le dossier du 18/09 ne dit plus que Q3 etait ENCORE OUVERTE le soir - toute la "
  "demonstration repose sur ce mot")

# les seules etiquettes M legitimes
cap_src = lire('capacites-ia.js')
MS = sorted(set(int(x) for x in re.findall(r'\bM(\d{1,2})\b', cap_src) if 1 <= int(x) <= 14))
g(MS == [12, 13, 14],
  'capacites-ia.js trace %r comme etiquettes M - le dossier annonce [12, 13, 14]' % (MS,))
g("arbitrage Q3 (M12)" in cap_src,
  "la trace « arbitrage Q3 (M12) » a disparu : c'est elle qui prouve que les deux "
  "numerotations sont incompatibles")

# le cas adversarial 9, source des 4 fausses attributions
g('memoire gelee, faits accumules, delta seul au retour' in archi,
  "le cas adversarial 9 a change de texte - le dossier cite sa cellule mot pour mot")

# le fichier de restitution
resti = lire('docs/DECISIONS-MEMOIRE-LONGUE.md')
g('INTROUVABLE' in resti, 'la restitution ne nomme plus les decisions introuvables')

# ══ 3. PHASE 2 - LES CORRECTIONS ═══════════════════════════════════════════════════════
claude_md = lire('CLAUDE.md')
g('Gardien de la Constitution (sortie) — ⚠️ IL TOURNE EN PRODUCTION' in claude_md,
  'la correction du Gardien a disparu de CLAUDE.md')
# [!!] LE GARDE NAIF ETAIT FAUX, ET SA CORRECTION EST INSTRUCTIVE. Il interdisait le mot
#      « en construction » pres du Gardien. Or la correction DOIT le citer : R30 exige
#      d'ecrire la raison a cote du fait (« elle annoncait "en construction" alors que… »).
#      *Un garde qui interdit un MOT ne sait pas distinguer une AFFIRMATION d'une CITATION.*
#      On mesure donc l'affirmation exacte qui etait fausse, pas le vocabulaire.
g('(sortie, en construction)' not in claude_md,
  'CLAUDE.md porte a nouveau le titre « Gardien de la Constitution (sortie, en construction) » '
  '- c est l affirmation exacte qui etait fausse')
g(claude_md.count('en construction') <= 2,
  'le mot « en construction » revient %d fois : la correction a peut-etre ete defaite'
  % claude_md.count('en construction'))

coach_src = lire('coach.js')
coach = sans_commentaires(coach_src)
c_sortie = corps_fonction(coach, r'function _gardienSortie\s*\(')
CODES = re.findall(r"code:\s*'([a-z_]+)'", c_sortie or '')
g(len(CODES) == 5, '_gardienSortie leve %d drapeaux, le dossier annonce 5' % len(CODES))
c_render = corps_fonction(coach, r'function renderCoachMsg\s*\(')
g(c_render and '_gardienSortie(' in c_render,
  'le Gardien n est plus appele dans renderCoachMsg : toute la correction tombe')
m = re.search(r"_GARDIEN_DERIVES\s*=\s*\[([^\]]*)\]", coach)
N_DERIVES = len(re.findall(r"'", m.group(1))) // 2 if m else 0
g(N_DERIVES == 4, '%d drapeaux comptent comme derive, le dossier annonce 4' % N_DERIVES)
g('coach-sante-rappel' in coach,
  'le rappel medical ajoute sur « diagnostic » a disparu - le dossier le cite comme exception')

dump = lire('tools/dump_prompt.js')
g('EMPREINTES' in dump, "le dump ne pose plus l'empreinte de ses sources")
chk = lire('tools/check_regles.py')
# [!!] DEUX GARDES TROP LACHES, TROUVES PAR LE CONTROLE NEGATIF - piege du sous-chainage
#      (`BUGS.md`, famille n1). L'ancien cherchait « prompt de reference » dans
#      check_regles : la phrase existe AUSSI dans le message d'echec, donc supprimer le
#      controle laissait le garde VERT. Et « SOURCES : » restait vrai apres avoir renomme
#      l'entete en « ANCIENNES SOURCES : ».
#      *Un garde qui cherche une ETIQUETTE mesure le vocabulaire ; un garde qui cherche le
#      MECANISME mesure la garantie.*
# [!!] ON LE FAIT TOURNER, ON NE LE LIT PAS. Chercher « _blob19 » dans le texte
#      retombait dans le meme piege : `_blob19_retire` CONTIENT `_blob19`, donc renommer
#      la fonction laissait le garde vert. *La seule mesure qui ne peut pas etre trompee
#      par un renommage est l'EXECUTION.* On lance le controle et on lit son verdict.
g('_blob19' in chk, 'le controle de peremption du prompt a disparu de check_regles')
_r19 = subprocess.run(['python3', os.path.join(ROOT, 'tools', 'check_regles.py')],
                      cwd=ROOT, capture_output=True, text=True, timeout=180)
_s19 = _r19.stdout + _r19.stderr
g('prompt de référence' in _s19,
  "check_regles ne rend plus aucun verdict sur le prompt de reference - le controle "
  "existe peut-etre dans le fichier, mais il ne TOURNE pas")
g('à jour' in _s19.split('prompt de référence')[1][:40],
  'check_regles ne dit pas que le prompt de reference est a jour : %r'
  % _s19.split('prompt de référence')[1][:90])
fige = lire('docs/PROMPT-MILO-REEL.txt')
_emp = re.search(r'SOURCES\s*:\s*((?:[\w.\-]+ [0-9a-f]{12}(?: \u00b7 )?)+)', fige)
g(_emp, "le prompt fige ne porte plus d'empreinte lisible (fichier + 12 hexa)")
g(len(re.findall(r'[0-9a-f]{12}', _emp.group(1))) == 3,
  'le prompt fige porte %d empreintes, on en annonce 3'
  % len(re.findall(r'[0-9a-f]{12}', _emp.group(1))))
m = re.search(r'TAILLE TOTALE : ([\d   ]+) car', fige)
g(m, 'le prompt fige ne porte plus sa taille')
FIGE = int(re.sub(r'\D', '', m.group(1)))
g(FIGE > 70000, 'le prompt fige annonce %d : il est reste sur la vieille valeur' % FIGE)

# ══ 4. LE COUPLAGE AU FOURNISSEUR ══════════════════════════════════════════════════════
code_js = sans_commentaires(lire('Code.js'))
wrk_js = sans_commentaires(lire('worker.js'))
_naif = re.sub(r'(?m)//[^\n]*', '', re.sub(r'/\*.*?\*/', '', lire('Code.js'), flags=re.S))
g(len(re.findall(r'api\.anthropic\.com', _naif)) == 0,
  "l auto-test du nettoyeur est perime : la version naive ne tronque plus les URL")
URL_CODE = len(re.findall(r'api\.anthropic\.com', code_js))
URL_WRK = len(re.findall(r'api\.anthropic\.com', wrk_js))
g(URL_CODE == 13 and URL_WRK == 1,
  'adresses : %d dans Code.js / %d dans worker.js, le dossier annonce 13 / 1' % (URL_CODE, URL_WRK))
g('const ANTHROPIC_URL' in wrk_js, 'worker.js ne tient plus l adresse dans une constante')

cst = sans_commentaires(lire('constants.js'))
m = re.search(r"AI_PROXY_ACTIONS\s*=\s*\[(.*?)\]", cst, re.S)
g(m, 'AI_PROXY_ACTIONS a disparu - le routage vers le Worker n est plus lisible')
ACTIONS = [a.strip().strip("'") for a in m.group(1).split(',') if a.strip()]
g(len(ACTIONS) == 14,
  '%d actions routees vers le Worker, le dossier annonce 14' % len(ACTIONS))
# tous les handlers IA d Apps Script sont-ils routes ?
_hs = []
for _m in re.finditer(r'function (handle([A-Za-z]+)_)', code_js):
    _i = _m.start()
    _j = code_js.index('{', _m.end() - 1) + 1
    _d, _k = 1, _j
    while _d > 0 and _k < len(code_js):
        if code_js[_k] == '{':
            _d += 1
        elif code_js[_k] == '}':
            _d -= 1
        _k += 1
    if 'api.anthropic.com' in code_js[_j:_k]:
        _n = _m.group(2)
        _hs.append(_n[0].lower() + _n[1:])
g(len(_hs) == 13, '%d handlers IA dans Code.js, le dossier annonce 13' % len(_hs))
NON_ROUTES = sorted(set(_hs) - set(ACTIONS))
g(not NON_ROUTES,
  'des actions IA echappent au Worker : %s - le dossier affirme le contraire' % NON_ROUTES)

# les deux familles
_fns = re.split(r'\n(?=(?:async )?function )', wrk_js)
JSONS, TEXTES = [], []
for f in _fns:
    mm_ = re.match(r'(?:async )?function ([A-Za-z0-9_]+)', f)
    if not mm_ or 'callClaude' not in f or mm_.group(1) in ('callClaude', 'callClaudeDiag'):
        continue
    (JSONS if ('firstJson' in f or 'JSON.parse' in f) else TEXTES).append(mm_.group(1))
g(len(JSONS) == 10 and len(TEXTES) == 2,
  'familles : %d JSON / %d texte, le dossier annonce 10 / 2' % (len(JSONS), len(TEXTES)))
g('coach' in TEXTES and 'summarizeCoach' in TEXTES,
  'la famille conversation a change de membres : %r' % (TEXTES,))

CC = wrk_js.count('cache_control')
g(CC == 3, 'cache_control vaut %d dans worker.js (code seul), le dossier annonce 3' % CC)
g("ttl: '1h'" in wrk_js, 'le cache etendu a 1 h a disparu')

# ══ 5. LE CONTEXTE, RE-MESURE ══════════════════════════════════════════════════════════
src_dump = lire('tools/dump_prompt.js')
_tmp_txt = os.path.join(SCRATCH, '_prompt_passation.txt')
_tmp_js = os.path.join(tempfile.gettempdir(), '_dump_passation.js')
_js = src_dump.replace("'/home/user/forcetracker/docs/PROMPT-MILO-REEL.txt'", repr(_tmp_txt))
_js = _js.replace("const ROOT='/home/user/forcetracker';", "const ROOT=%r;" % ROOT)
g("const ROOT=%r;" % ROOT in _js, 'la racine du dump n a pas ete redirigee')
open(_tmp_js, 'w', encoding='utf-8').write(_js)
r = subprocess.run(['node', _tmp_js], cwd=ROOT, capture_output=True, text=True, timeout=300)
g(r.returncode == 0 and os.path.exists(_tmp_txt),
  'la re-mesure du prompt a echoue :\n' + (r.stdout + r.stderr)[-700:])
rc, sale2 = git('status', '--porcelain')
g(CN or sale2 == '', 'la re-mesure a sali le depot (%r)' % sale2)
mnum = re.search(r'total (\d+) \| commun (\d+) \| perso (\d+) \| instant (\d+)', r.stdout + r.stderr)
g(mnum, 'le dump n a pas rendu ses quatre nombres')
P_TOT, P_COM, P_PER, P_INS = (int(x) for x in mnum.groups())
g(70000 < P_TOT < 82000, 'prompt total %d : hors de la fourchette du 20/09' % P_TOT)
PLAFOND = 46500
g(P_COM < PLAFOND, 'le bloc commun (%d) depasse le plafond de %d' % (P_COM, PLAFOND))
MARGE = PLAFOND - P_COM

txt = open(_tmp_txt, encoding='utf-8').read()
_ip = txt.index('2/3'); _ii = txt.index('3/3')
perso = txt[_ip:_ii]
_c = perso.index('EXERCICES DISPONIBLES')
_f = min([perso.index(x) for x in ('CHECK-IN', 'DERNI') if x in perso[_c:]] or [len(perso)])
CATA = _f - _c
g(9000 < CATA < 14000, 'catalogue %d car. : hors de la mesure du 20/09 (11 508)' % CATA)
_nut = re.search(r'NUTRITION[^\n]*:\n', txt)
g(_nut, 'le bloc NUTRITION a disparu du prompt')

# la note fausse, signalee et non corrigee
g('sont ICI, en bas' in coach_src,
  'la note de 557 caracteres a ete corrigee : le dossier la decrit encore comme ouverte')
_i = coach_src.index('(⚠️ TOUT CE QUI EST AU-DESSUS')
_j = coach_src.index('sans jamais toucher à la partie mise en cache.)') + 46
N_NOTE = _j - _i
g(500 < N_NOTE < 620, 'la note fait %d caracteres, le dossier annonce 557' % N_NOTE)
_pos_cat = txt.index('EXERCICES DISPONIBLES')
_pos_marq = txt.index("═══ SITUATION DE L'INSTANT ═══", txt.index('1/3'))
g(_pos_cat < _pos_marq,
  'le catalogue est passe SOUS le marqueur : la note redeviendrait vraie, et le dossier faux')

# ══ 6. S.COACHMEMORY ═══════════════════════════════════════════════════════════════════
g('coachHistory.length >= 4' in coach, 'le seuil de 4 messages a change')
c_sum = corps_fonction(wrk_js, r'async function summarizeCoach\s*\(')
g(c_sum and 'slice(-16)' in c_sum, 'summarizeCoach ne lit plus 16 messages')
g(c_sum and 'substring(0, 400)' in c_sum, 'la troncature a 400 caracteres a change')
g(c_sum and 'max_tokens: 250' in c_sum, 'max_tokens de summarizeCoach a change')
g(c_sum and 'existingMemory' in c_sum, 'le resume n est plus cumulatif')
g('userData.profile.coachMemory = summary' in lire('Code.js'),
  'le resume IA n est plus persiste au profil')

# ══ 7. BANC, DESTINATIONS, CADENCE, VOIX ═══════════════════════════════════════════════
ev = lire('tests/milo/eval-scenarios.js')
N_SCEN = len(re.findall(r"^\s*\{\s*id:\s*'[^']*'", ev, flags=re.M))
N_VER = ev.count('nom:')
N_T1 = len(re.findall(r"^\s*\{\s*id:\s*'[^']*'", lire('tests/milo/scenarios.js'), flags=re.M))
g((N_SCEN, N_VER, N_T1) == (57, 80, 12),
  'banc : %d / %d / %d, le dossier annonce 57 / 80 / 12' % (N_SCEN, N_VER, N_T1))
g('**Mode :** blanc' in lire('tests/milo/eval-report.md'),
  'le rapport enregistre n est plus « a blanc »')
g('ft4_evalPasses' in coach, 'les vraies passes ne vivent plus en localStorage')

HOTES = set()
for f in ('index.html', 'app.js', 'state.js', 'screens.js', 'log.js', 'coach.js',
          'setup.js', 'tracking.js', 'constants.js', 'supabase.js', 'Code.js', 'worker.js'):
    for mm_ in re.finditer(r"https://([a-z0-9.\-]+)", sans_commentaires(lire(f))):
        HOTES.add(mm_.group(1))
g(len(HOTES) == 12, '%d hotes distincts, le dossier annonce 12' % len(HOTES))
for h in ('api.qrserver.com', 'wger.de', 'cdn.jsdelivr.net'):
    g(h in HOTES, '%s a disparu : le dossier le cite nommement' % h)
g('api.qrserver.com' in lire('index.html'),
  'le QR tiers n est plus dans index.html : la mesure « 2 requetes au chargement » tombe')

for f in ('_dbfPrendre', '_dbfRendre', '_dbfFini', '_dbfRecuperer', '_dbfRattraper',
          '_dbfLireRecu'):
    g('function %s(' % f in coach, 'la file a jetons a perdu %s' % f)
g('_DBF_PEREMPTION = 36*3600*1000' in coach, 'la peremption de 36 h a change')
m = re.search(r'_DBF_MAX\s*=\s*(\d+)', coach)
g(m and m.group(1) == '3', 'la file ne borne plus a 3')

tout = '\n'.join(sans_commentaires(lire(f)) for f in
                 ('index.html', 'app.js', 'state.js', 'screens.js', 'log.js', 'coach.js',
                  'setup.js', 'tracking.js', 'constants.js', 'supabase.js'))
for mot in ('SpeechRecognition', 'speechSynthesis', 'MediaRecorder'):
    g(mot not in tout, 'une couche vocale est apparue (%s)' % mot)
g('showNotification' not in tout, 'les notifications push sont apparues')
g('scheduled' not in wrk_js, 'un cron Cloudflare est apparu')

cap_code = sans_commentaires(cap_src)
N_CAP = len(re.findall(r"\bid:\s*'[a-z]", cap_code))
N_SRV = len(re.findall(r'serveurApplique:\s*false', cap_code))
g(N_CAP == 21 and N_SRV == 21, 'capacites : %d / %d serveurApplique:false' % (N_CAP, N_SRV))

carto = lire('docs/MILO-CARTOGRAPHIE-IDENTITE.md')
# [!!] ANCRE COURTE, EXPRES : la phrase complete traverse un retour a la ligne markdown
#      (« … N'EST PRISE\n> ICI. »). *Une ancre qui suppose une mise en forme mesure la mise
#      en forme.* - 4e fois de la session, meme famille.
g("AUCUNE DÉCISION N'EST PRISE" in carto,
  'la cartographie ne dit plus qu elle ne decide rien')
g('MESURE' in carto or 'mesure' in carto, 'la cartographie ne porte plus ses mesures')


# ══ 8. LE PDF ══════════════════════════════════════════════════════════════════════════
BLEU = colors.HexColor('#1d4ed8')
GRIS = colors.HexColor('#4b5563')
FOND = colors.HexColor('#f3f4f6')
TRAIT = colors.HexColor('#d1d5db')

ss = getSampleStyleSheet()
H1 = ParagraphStyle('H1', parent=ss['Title'], fontSize=16, leading=20, textColor=BLEU, spaceAfter=2)
SUB = ParagraphStyle('SUB', parent=ss['Normal'], fontSize=9, leading=12.5, textColor=GRIS,
                     alignment=1, spaceAfter=9)
H2 = ParagraphStyle('H2', parent=ss['Heading2'], fontSize=11.5, leading=14.5, textColor=BLEU,
                    spaceBefore=10, spaceAfter=4)
H3 = ParagraphStyle('H3', parent=ss['Heading3'], fontSize=9.8, leading=12.5,
                    textColor=colors.HexColor('#111827'), spaceBefore=6, spaceAfter=2)
P = ParagraphStyle('P', parent=ss['Normal'], fontSize=8.6, leading=11.9, spaceAfter=4)
PC = ParagraphStyle('PC', parent=P, fontSize=8.0, leading=10.8)
CLE = ParagraphStyle('CLE', parent=P, fontSize=9.0, leading=12.6, backColor=FOND,
                     borderPadding=6, borderWidth=0.6, borderColor=TRAIT,
                     spaceBefore=5, spaceAfter=6)
NOTE = ParagraphStyle('NOTE', parent=P, fontSize=8.0, leading=11, textColor=GRIS)

story = []


def h1(t, s):
    story.append(Paragraph(t, H1)); story.append(Paragraph(s, SUB))


def h2(t):
    story.append(Paragraph(t, H2))


def h3(t):
    story.append(Paragraph(t, H3))


def p(t, st=None):
    story.append(Paragraph(t, st or P))


def cle(t):
    story.append(Paragraph(t, CLE))


def tab(rows, widths, entete=True):
    data = [[Paragraph(c, PC) for c in r] for r in rows]
    t = Table(data, colWidths=widths, repeatRows=1 if entete else 0)
    st = [('GRID', (0, 0), (-1, -1), 0.4, TRAIT), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
          ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5)]
    if entete:
        st.append(('BACKGROUND', (0, 0), (-1, 0), FOND))
    t.setStyle(TableStyle(st))
    story.append(t); story.append(Spacer(1, 5))


def n(x):
    return format(x, ',').replace(',', ' ')


h1('FORCE TRACKER &mdash; MILO : CONSOLIDATION DE L\'IDENTITE ET INDEPENDANCE MOTEUR',
   'Passation pour ChatGPT &middot; 20 septembre 2026 &middot; avant <b>%s</b> &middot; '
   'apres <b>%s</b> &middot; <b>%s</b> &middot; <b>0 fichier servi</b>'
   % (SHA_AVANT, head, VERSION))

cle("<b>A QUOI SERT CE DOSSIER.</b> Il permet de reprendre la reflexion avec Michel sans "
    "repartir de zero. <b>Tout y est mesure</b> sur le depot servi ; le generateur recompte "
    "chaque chiffre et <b>refuse de produire</b> si un fait tombe. <b>Aucune decision de "
    "direction n'a ete prise</b> : la session a mesure, restitue, corrige des documents faux, "
    "et prepare des arbitrages.")

# ── 1-5 ETAT ──────────────────────────────────────────────────────────────────────────
h2('1. Etat Git final &middot; 2. version servie &middot; 3. differences')
tab([['', 'valeur'],
     ['branche &middot; HEAD', '<b>%s</b> &middot; <b>%s</b>' % (branche, head)],
     ['arbre', 'propre &middot; ecart avec origin/master : <b>0 / 0</b>'],
     ['version servie', '<b>%s</b> (inchangee &mdash; aucun bump)' % VERSION],
     ['commits de la session', '<b>%d</b>' % len(COMMITS)],
     ['fichiers <b>servis</b> modifies', '<b>0</b> (verifie fichier par fichier)']],
    [45 * mm, 120 * mm])
h3('4. Mutations realisees')
tab([['commit', 'objet'],
     ] + [[c[0], html.escape(c[1])] for c in COMMITS], [20 * mm, 145 * mm])
tab([['fichier', 'nature']] +
    [[f, 'documentation' if f.startswith('docs/') or f.endswith('.md') else 'outil']
     for f in TOUCHES], [62 * mm, 103 * mm])
p("<b>5. Ce qui a ete uniquement ETUDIE</b> : la representation interne neutre, l'ordre du "
  "contexte, la selection par le cervelet, l'ADN minimal, le modele a trois niveaux du banc, "
  "la reversibilite, le registre <i>connections</i>, la cadence et la voix. "
  "<b>Aucun n'a produit de code.</b>")

# ── 6 M1-M11 ──────────────────────────────────────────────────────────────────────────
story.append(PageBreak())
h2('6. Recuperation des decisions &laquo; M1-M11 &raquo; &mdash; CORRIGE')
cle("<b>ELLES ETAIENT DANS UN GENERATEUR, PAS DANS UN DOCUMENT.</b> La source est "
    "<i>tools/gen_memoire_archi_pdf.py</i> (18/09, commit d86a7f10) : son tableau "
    "&laquo; DECISIONS DESORMAIS ACTEES &raquo; porte <b>%d decisions</b> citees "
    "textuellement. <b>La numerotation par position est corroboree quatre fois</b> : le corps "
    "du dossier renvoie aux decisions <b>3, 4, 6 et 7</b>, qui tombent exactement sur les rangs "
    "3, 4, 6 et 7." % N_DEC)
tab([['rang', 'la decision (texte du dossier du 18/09)', 'etat du code au 20/09'],
     ['1', 'les <b>faits deterministes</b> sont conserves pour tous',
      '<b>EXISTANT</b> &mdash; computeRegistreFacts(), 7 faits, 0 appel IA'],
     ['2', 'les <b>conversations brutes</b> ne sont pas une memoire',
      '<b>EXISTANT</b> &mdash; le fil est borne et local'],
     ['3', 'un <b>resume IA</b> ne devient jamais la source de verite',
      '<b>NON TENU</b> &mdash; S.coachMemory, voir &sect;11'],
     ['4', '<b>trois niveaux A / B / C</b>',
      '<b>EXISTANT</b> &mdash; source + status (pending / validated / rejected)'],
     ['5', '<b>ancien n\'est pas supprime</b>',
      '<b>PARTIEL</b> &mdash; les statuts existent, le champ type non'],
     ['6', '<b>fait actuel et fait historique</b> coexistent',
      '<b>PARTIEL</b> &mdash; le patron existe 2 fois, remplacePar non'],
     ['7', 'une <b>suppression</b> importante est un evenement explicite',
      '<b>INEXISTANT</b> &mdash; une suppression est un filter'],
     ['8', 'le <b>rattrapage</b> est une capacite distincte',
      '<b>EXISTANT</b> &mdash; milo.memory.backfill, 21e capacite'],
     ['(10)', 'le <b>deterministe</b> ne coute aucun appel IA',
      '<b>EXISTANT</b> &mdash; prouve par deux renvois convergents, hors tableau']],
    [12 * mm, 78 * mm, 75 * mm])
h3('Ce qui reste INTROUVABLE &mdash; ARBITRAGE MICHEL')
p("<b>14 annoncees &middot; 9 retrouvees &middot; 5 manquantes.</b> Elles ne sont ni dans git, "
  "ni dans les journaux, ni dans les generateurs, ni dans aucun document. <b>Elles ne sont "
  "pas reconstituees</b> : reconstituer une decision de memoire fabriquerait une fausse "
  "attribution.")
h3('TROIS NUMEROTATIONS, ET DEUX SONT DEMONTRABLEMENT INCOMPATIBLES')
tab([['numerotation', 'ou', 'ce qu\'elle numerote'],
     ['<b>D1-D6</b>', 'gen_memoire_longue_pdf.py (matin)',
      'les <b>questions</b> rendues a Michel (%d)' % N_Q],
     ['<b>decision 1-10+</b>', 'gen_memoire_archi_pdf.py (apres-midi)',
      'les <b>decisions actees</b>'],
     ['<b>M1-M14</b>', 'messages de commit, journal, capacites-ia.js',
      '<i>pretend</i> numeroter les memes']],
    [30 * mm, 62 * mm, 73 * mm])
cle("<b>LA PREUVE.</b> capacites-ia.js inscrit <i>&laquo; arbitrage Q3 (M12) &raquo;</i> &mdash; "
    "or <b>Q3 a ete posee le SOIR</b>, comme question <b>encore ouverte</b>. <b>M12 ne peut donc "
    "pas etre la 12e des 14 decisions de l'apres-midi</b> : c'est la reponse a une question posee "
    "APRES elles. Les seules etiquettes M legitimes sont <b>M12, M13 et M14</b>, la ou elles sont "
    "deja ecrites.")

h3('UNE PREMISSE FAUSSE, MESUREE &mdash; quatre &laquo; decisions &raquo; n\'en sont pas')
p("Le brief de la session enumerait <b>onze</b> enonces comme des decisions de Michel. "
  "<b>Sept le sont</b> (rangs 1 a 7). <b>Quatre ne le sont pas</b> : ce sont les "
  "<b>&laquo; comportements attendus &raquo; des cas adversariaux</b>, ecrits par Claude dans "
  "l'etude du matin. La cellule du <b>cas 9</b> dit mot pour mot : "
  "<i>&laquo; memoire gelee, faits accumules, delta seul au retour &raquo;</i> &mdash; "
  "<b>un seul attendu de test, decoupe en trois decisions par la passation</b>. La quatrieme "
  "(&laquo; jamais presentees comme reconstruites &raquo;) vient du cas 1 et du risque "
  "&laquo; la fausse promesse &raquo;.")
p("<b>A dire sans exagerer</b> : ces attendus sont <b>probablement conformes</b> a ce que veut "
  "Michel. Mais &laquo; probablement conforme &raquo; n'est pas &laquo; arbitre &raquo; : les "
  "classer <i>decides</i> transformerait une <b>proposition de Claude</b> en contrainte du "
  "projet, sous le nom de Michel. <b>C'est le defaut du registre des decisions a un endroit "
  "ou il ne regardait pas : non pas une decision prise sans etre vue, mais une PROPOSITION "
  "devenue decision en changeant de document.</b>"
  , NOTE)

# ── 7 corrections ─────────────────────────────────────────────────────────────────────
story.append(PageBreak())
h2('7. Corrections de documentation &mdash; CORRIGE')
tab([['document', 'ce qui etait faux', 'ce qui a ete fait'],
     ['<b>CLAUDE.md</b>',
      'annoncait le <b>Gardien de sortie</b> &laquo; en construction &raquo;',
      'il tourne <b>pour tout le monde depuis le 21/08</b>. La case dit desormais ce qu\'il '
      'fait : <b>%d drapeaux</b>, dont <b>%d</b> comptent comme derive ; il ne reecrit jamais ; '
      'sur <i>diagnostic</i> il <b>ajoute</b> un rappel medical chez tout le monde ; le badge '
      'est reserve (clone + admin)' % (len(CODES), N_DERIVES)],
     ['<b>docs/PROMPT-MILO-REEL.txt</b>',
      'genere le <b>08/08</b>, 38 commits plus tot ; annoncait <b>59 279</b> caracteres quand '
      'le prompt reel en fait <b>%s</b>' % n(P_TOT),
      '<b>regenere</b>. Et il ne peut plus se perimer en silence : le dump pose l\'<b>empreinte'
      '</b> de coach.js, constants.js et state.js, et check_regles la compare']],
    [38 * mm, 58 * mm, 69 * mm])
cle("<b>UNE EMPREINTE DE CONTENU, PAS UNE DATE</b> : un commit qui ne touche qu'un commentaire "
    "perimerait une comparaison de dates pour rien. Et le controle <b>PREVIENT, il ne bloque "
    "pas</b> (R19) : regenerer demande un navigateur sans tete, et <i>refuser une livraison "
    "parce qu'un document de reference est en retard serait de la gouvernance qui dessert le "
    "produit</i>. <b>Controle negatif : 5 cas, 5 conformes</b> (sain / une source changee / deux "
    "sources / empreinte retiree / fichier absent), RC=0 partout.")

# ── 8-10 cartographie ─────────────────────────────────────────────────────────────────
h2('8. Cartographie de Milo &middot; 9. deja portable &middot; 10. encore lie au moteur')
tab([['#', 'couche', 'ce qui la porte', 'survit a un changement de moteur ?'],
     ['A', '<b>FAITS</b>', 'computeRegistreFacts &mdash; 7 faits, 0 appel IA', '<b>OUI</b>'],
     ['B', '<b>PARCOURS</b>', '_memoireLongue &mdash; medianes, coupures, volume', '<b>OUI</b>'],
     ['C', '<b>MEMOIRE VALIDEE</b>',
      'registre.observations &mdash; status, source, dates', '<b>OUI</b>'],
     ['D', '<b>MEM. CONVERSATIONNELLE</b>', '<b>S.coachMemory</b> &mdash; resume Haiku persiste',
      '<b>NON</b> &mdash; &sect;11'],
     ['E', '<b>PROTECTIONS</b>', '_gardienZones (entree) &middot; _gardienSortie (sortie)',
      '<b>OUI</b>'],
     ['F', '<b>CAPACITES</b>', 'capacites-ia.js &mdash; %d capacites' % N_CAP, '<b>OUI</b>'],
     ['G', '<b>DROITS</b>', 'Worker : qui / combien / d\'ou',
      'OUI &mdash; mais <b>%d/%d</b> serveurApplique:false' % (N_SRV, N_CAP)],
     ['H', '<b>CONTEXTE</b>', 'buildCoachContext &mdash; %s car.' % n(P_TOT),
      'le <b>contenu</b> oui, l\'<b>ordre</b> non &mdash; &sect;12'],
     ['I', '<b>COMPORTEMENT</b>', '<b>%s car. de prose</b>, 5 controles' % n(P_COM),
      '<b>NON. C\'est le trou.</b>'],
     ['J', '<b>MOTEUR</b>', 'Claude &mdash; modele deja variable cote serveur',
      "&mdash; <i>c'est lui qu'on remplace</i>"],
     ['K', '<b>INTERFACES</b>', 'texte seul &mdash; <b>0</b> occurrence vocale', 'neutre']],
    [8 * mm, 32 * mm, 64 * mm, 61 * mm])
cle("<b>Neuf couches sur onze survivraient telles quelles.</b> Les deux qui ne survivent pas "
    "sont <b>D</b> (la memoire conversationnelle) et <b>I</b> (le comportement) &mdash; et "
    "<b>I est ce qui fait qu'on reconnait Milo</b>.")

# ── 11 coachMemory ────────────────────────────────────────────────────────────────────
story.append(PageBreak())
h2('11. S.coachMemory &mdash; audit')
tab([['question', 'reponse mesuree le 20/09'],
     ['qui la produit ?', 'le <b>modele</b>, pas le code (summarizeCoach)'],
     ['quel modele ?', '<b>claude-haiku-4-5-20251001</b>, max_tokens <b>250</b>'],
     ['sur quoi ?', 'les <b>16 derniers messages</b>, tronques a <b>400</b> caracteres'],
     ['a quelle frequence ?',
      '<b>a CHAQUE message</b> des que le fil atteint <b>4</b> messages, pour tout le monde &mdash; '
      'elle <b>DOUBLE le nombre d\'appels IA</b> d\'une conversation au-dela du 4e echange'],
     ['cumulative ?',
      '<b>oui</b> &mdash; la consigne commence par &laquo; Memoire existante &raquo; : un resume '
      'de resume, indefiniment. <i>Personne ne peut dire ce qu\'il reste, apres cinquante '
      'iterations, d\'un fait dit au premier echange.</i>'],
     ['ou vit-elle ?', 'localStorage <b>+ le profil cloud</b>'],
     ['quand est-elle relue ?', 'a <b>chaque message</b>, dans le bloc <b>mis en cache</b>'],
     ['provenance ?', '<b>aucune</b> &mdash; ni moteur, ni date, ni statut, ni correction']],
    [38 * mm, 127 * mm])
tab([['', 'registre.observations', 'S.coachMemory'],
     ['origine', 'interface ou conversation', '<b>un modele</b>'],
     ['la personne valide ?', 'oui (pending &rarr; validated)'.replace('&rarr;', '-&gt;'),
      '<b>jamais</b>'],
     ['un refus est garde ?', 'oui (rejected)', '<b>rien a refuser</b>'],
     ['date', 'proposedAt / validatedAt', '<b>aucune</b>'],
     ['structure', 'objets', '<b>une chaine plate</b>']],
    [38 * mm, 65 * mm, 62 * mm])
cle("<b>Elle contredit nommement la decision 3 de Michel</b> (<i>&laquo; un resume IA ne devient "
    "jamais la source de verite &raquo;</i>), dont la consequence ecrite etait : <i>&laquo; la "
    "chaine plate coachMemory cesse d'etre le support ; elle devient au mieux une vue &raquo;</i>.")
p("<b>ET IL FAUT DIRE CE QU'ON PERDRAIT.</b> C'est <b>le seul porteur de continuite "
  "conversationnelle longue</b> : le fil est borne, et ni les faits ni les observations ne "
  "gardent <i>&laquo; on a parle de ta reprise apres ta blessure, tu avais peur de forcer &raquo;</i>. "
  "<b>La retirer sans la remplacer ferait reculer Milo</b> &mdash; et le document de cap interdit "
  "explicitement de degrader Milo pour obtenir l'independance."
  )
h3('Trois directions, sans en choisir une')
tab([['option', 'ce que ca donne', 'risque'],
     ['<b>A &mdash; garder en l\'etat</b>',
      'rien a faire ; la continuite reste',
      'la decision 3 reste non tenue ; un changement de moteur produirait une <b>memoire '
      'heterogene</b>, des resumes de deux moteurs <b>indiscernables</b>'],
     ['<b>B &mdash; envelopper d\'une provenance</b>',
      '{texte, moteur, date, version, statut} &mdash; le meme patron que les observations',
      '<b>le moins cher et le plus reversible</b> ; ne resout pas le resume-de-resume'],
     ['<b>C &mdash; reduire au profit du structure</b>',
      'ce qui est factuel migre vers observations ; le reste disparait',
      '<b>le plus couteux</b> ; et ce qui n\'est PAS factuel (le ton d\'une conversation) '
      'n\'a aujourd\'hui <b>aucun</b> support de remplacement']],
    [38 * mm, 60 * mm, 67 * mm])
p("<b>Avis technique, clairement separe de la decision</b> : <b>B</b> parait la plus compatible "
  "avec les principes deja etablis &mdash; elle applique a coachMemory <b>exactement le patron "
  "que registre.observations fait deja tourner</b> (R13 : enrichir l'existant), elle ne retire "
  "rien, et elle rend la decision 3 <b>verifiable</b> au lieu de la laisser ouverte. "
  "<b>Ce n'est pas une decision : c'est un avis, et il appartient a Michel de trancher.</b>"
  , NOTE)

# ── 12-13 appels et representation ────────────────────────────────────────────────────
story.append(PageBreak())
h2('12. Cartographie des appels Anthropic &middot; 13. representation interne neutre')
cle("<b>CORRECTION A L'ETUDE DE LA VEILLE.</b> Les <b>%d adresses en dur de Code.js ne sont PAS "
    "le chemin vivant</b> : AI_PROXY_ACTIONS route <b>%d actions</b> vers le Worker, et les "
    "<b>%d actions IA d'Apps Script y sont TOUTES</b>. Code.js est le <b>repli</b>, atteint "
    "seulement si AI_PROXY_URL est vide. <b>Le chemin servi tient l'adresse dans UNE constante</b> "
    "et respecte R2. La dette existe ; sa gravite n'est pas celle qui avait ete ecrite."
    % (URL_CODE, len(ACTIONS), len(_hs)))
tab([['famille', 'combien', 'ce qu\'elle envoie', 'ce qu\'elle attend'],
     ['<b>A &mdash; extraction structuree</b>', '<b>%d</b>' % len(JSONS),
      'un document / une image / un texte <b>+ une consigne fixe</b>',
      '<b>du JSON</b>, revalide par le code'],
     ['<b>B &mdash; conversation</b>', '<b>%d</b>' % len(TEXTES),
      '<b>systeme + historique + cache + modele variable</b>', 'du <b>texte libre</b>']],
    [42 * mm, 14 * mm, 58 * mm, 51 * mm])
p("<b>Dix sur treize ne sont pas des conversations.</b> Leur contrat reel est "
  "<i>&laquo; voici un document, rends-moi ce JSON &raquo;</i>, et le code <b>revalide la sortie "
  "de toute facon</b> : ils sont <b>deja quasi portables</b>. Le format du fournisseur ne porte "
  "vraiment que dans la famille B &mdash; <b>c'est-a-dire exactement la ou vit Milo</b>."
  )
p("<b>Consequence contre-intuitive</b> : une representation unique couvrant les treize serait "
  "du <b>sur-dimensionnement</b> (R19). La forme minimale honnete n'est pas un "
  "<i>ReasoningRequest</i> generique, c'est <b>deux contrats</b> : un contrat "
  "<b>extraction</b> (entree, consigne, schema attendu, budget) que les 10 partagent deja de "
  "fait, et un contrat <b>conversation</b> ou vivent le systeme, l'historique, la politique de "
  "cache et le choix de modele. <b>IDEE A ETUDIER.</b>")

h2('14-15. L\'ordre du contexte et le cache &mdash; <b>le point central</b>')
cle("<b>L'ORDRE DU CONTEXTE EST DICTE PAR LE PRIX DU CACHE, ET C'EST DATE.</b> Le <b>04/08</b>, "
    "<i>_ctxEntrainement()</i> decidait si le catalogue meritait d'etre envoye. Le <b>10/08</b> "
    "elle a ete <b>RETIREE</b>, et la raison est ecrite dans le code : <i>&laquo; un bloc envoye "
    "PARFOIS ne peut pas etre mis en cache, donc il etait paye plein tarif (0,015 $/message) au "
    "lieu d'etre relu (0,0015 $) &raquo;</i>.")
p("<b>La selectivite du cervelet a ete construite, mesuree, puis desactivee</b> &mdash; non "
  "parce qu'elle etait inutile, mais parce que <b>la grille tarifaire du fournisseur la rendait "
  "perdante</b>. Et la regle inscrite <b>dans le prompt lui-meme</b> generalise ce couplage : "
  "<i>&laquo; ne jamais rendre un bloc plus haut CONDITIONNEL &raquo;</i>. <b>Une contrainte du "
  "fournisseur est devenue une regle de conception interne.</b>")
p("<b>Ce qui changerait ailleurs</b> : chez OpenAI l'ecriture dans le cache est <b>gratuite</b> ; "
  "chez Anthropic elle coute <b>1,25x</b> (5 min) ou <b>2x</b> (1 h). Un moteur <b>sans cache</b> "
  "rendrait l'envoi systematique <b>le plus cher de tous les choix</b> et <b>l'arbitrage du 10/08 "
  "s'inverserait</b>. <b>DIRECTION</b> : l'ordre semantique doit appartenir a Milo, "
  "l'optimisation fournisseur doit etre une adaptation <b>secondaire</b>.")
p("<b>Un defaut trouve, signale, NON corrige</b> : la note de <b>%d caracteres</b> posee sous "
  "le marqueur dit a Milo que le catalogue est <i>&laquo; ICI, en bas &raquo;</i>. Mesure : il est "
  "<b>au-dessus</b> du marqueur depuis le 10/08. <b>Elle est fausse, et elle est apres le "
  "marqueur, donc payee plein tarif a chaque message.</b> Corriger un texte du prompt change ce "
  "que Milo recoit : <b>R34</b> exige un banc avant/apres, et <b>aucune passe reelle n'est "
  "enregistree</b>. <b>ARBITRAGE MICHEL.</b>" % N_NOTE, NOTE)

# ── 16-17 contexte ────────────────────────────────────────────────────────────────────
story.append(PageBreak())
h2('16. Mesure complete du contexte &middot; 17. pistes de selection')
tab([['zone', 'car.', 'part', 'cache'],
     ['<b>COMMUN</b>', '<b>%s</b>' % n(P_COM), '%.0f&nbsp;%%' % (100.0 * P_COM / P_TOT), '1 h'],
     ['<b>&laquo; PERSONNEL &raquo;</b>', '<b>%s</b>' % n(P_PER),
      '%.0f&nbsp;%%' % (100.0 * P_PER / P_TOT), '5 min'],
     ['<b>L\'INSTANT</b>', '<b>%s</b>' % n(P_INS), '%.0f&nbsp;%%' % (100.0 * P_INS / P_TOT),
      '<b>jamais</b> &mdash; plein tarif'],
     ['<b>TOTAL</b>', '<b>%s</b>' % n(P_TOT), '100&nbsp;%', '']],
    [42 * mm, 30 * mm, 26 * mm, 67 * mm])
tab([['bloc', 'car.', '% du prompt', 'remarque'],
     ['<b>LE CATALOGUE D\'EXERCICES</b>', '<b>%s</b>' % n(CATA),
      '<b>%.0f&nbsp;%%</b>' % (100.0 * CATA / P_TOT),
      'envoye <b>a chaque message</b>, meme sur &laquo; j\'ai mal dormi &raquo;. '
      '<b>Le filtre par lieu existe deja</b> (_CAT_LIEUX) et ne sert que si la personne a '
      'declare son lieu'],
     ['<b>NUTRITION</b> (consignes)', '6&nbsp;669', '8,8&nbsp;%',
      'dans le bloc <b>COMMUN</b>, donc envoye meme sur une question d\'entrainement pur'],
     ['TA METHODE DE COACH', '7&nbsp;463', '9,9&nbsp;%', 'consignes'],
     ['PROFIL ATHLETE', '5&nbsp;677', '7,5&nbsp;%', 'vraiment personnel'],
     ['DERNIERES SEANCES', '4&nbsp;547', '6,0&nbsp;%', 'vraiment personnel']],
    [42 * mm, 20 * mm, 22 * mm, 81 * mm])
p("<b>Le bloc dit &laquo; PERSONNEL &raquo; n'est personnel qu'a %d&nbsp;%%</b> : le catalogue "
  "y pese <b>%.0f&nbsp;%%</b>. <i>Le nom du bloc decrit sa coupure tarifaire, pas son contenu.</i> "
  "<b>Le plafond de %s est TENU</b> : bloc commun <b>%s</b>, marge <b>%s</b>."
  
  % (100 - round(100.0 * CATA / P_PER), 100.0 * CATA / P_PER, n(PLAFOND), n(P_COM), n(MARGE)))
p("<b>Pistes de selection deterministe, par ordre de gain evident &mdash; IDEE A ETUDIER</b> : "
  "(1) le <b>lieu d'entrainement</b> est deja collecte et le filtre existe ; l'inciter a etre "
  "renseigne reduit le catalogue <b>sans aucune logique nouvelle</b> ; (2) le bloc "
  "<b>NUTRITION</b> pourrait descendre dans une <b>seconde zone cachee</b> plutot que d'etre "
  "conditionnel &mdash; <b>ca garde le cache</b>, ce qui est precisement l'objection de 10/08 ; "
  "(3) <b>_MOTS_ENTRAINEMENT existe toujours</b> (90 mots, utilise par _estHorsSujet) : la "
  "machinerie de selection n'a jamais ete supprimee, seule la <b>decision</b> de s'en servir a "
  "ete annulee. <b>Rien ne doit bouger sans banc</b> (R34).")

# ── 18-19 banc ────────────────────────────────────────────────────────────────────────
h2('18. Etat du banc &middot; 19. definition &rarr; comportements &rarr; tests'
   .replace('&rarr;', '-&gt;'))
tab([['mesure', 'valeur'],
     ['scenarios Tier 2 (vrai Milo)', '<b>%d</b> &middot; <b>%d verificateurs</b>' % (N_SCEN, N_VER)],
     ['temoins Tier 1 (regle <i>presente</i> dans le prompt)', '<b>%d</b>' % N_T1],
     ['juge IA', '<b>aucun</b> &mdash; decision ecrite'],
     ['dernier rapport enregistre', '<b>02/09/2026</b>, mode <b>&laquo; a blanc &raquo;</b> (0 appel)'],
     ['passe <b>reelle</b> dans le depot', '<b>aucune</b>']],
    [70 * mm, 95 * mm])
p("<b>Nuance obligatoire (regle d'or #16)</b> : les vraies passes existent, mais elles vivent "
  "dans <b>ft4_evalPasses / ft4_evalHist, en localStorage, sur l'appareil qui les a lancees</b>. "
  "<b>Le comportement de reference de Milo n'est nulle part dans la memoire partagee du "
  "projet.</b> Le jour d'une bascule de moteur, <b>il n'y a rien a comparer</b>."
  )
tab([['niveau', 'ce que c\'est', 'ce qui existe deja'],
     ['<b>1 &mdash; definition</b>', 'ce que Milo <b>doit</b> respecter',
      '<b>disperse</b> : Constitution (25 principes), 126 lignes de prompt, '
      'BUGS-DE-PHILOSOPHIE.md &mdash; <b>pas un objet</b>'],
     ['<b>2 &mdash; comportements</b>', 'comment ca se voit dans une situation',
      '<b>implicite</b> dans les %d scenarios' % N_SCEN],
     ['<b>3 &mdash; tests</b>', 'ce qui le verifie',
      '<b>EXISTANT</b> : %d scenarios, %d verificateurs, _gardienSortie, PT-001'
      % (N_SCEN, N_VER)]],
    [34 * mm, 48 * mm, 83 * mm])
p("<b>Le niveau 1 n'existe pas comme objet</b>, et c'est exactement ce qui fait que le banc "
  "<i>ressemble</i> a la definition. <b>Le piege a ne pas refermer trop vite</b> : un juge IA "
  "rendrait mesurable le ton et le naturel, <b>au prix de faire juger l'identite de Milo par le "
  "moteur qu'on cherche justement a rendre remplacable</b>."
  )

# ── ADN ───────────────────────────────────────────────────────────────────────────────
story.append(PageBreak())
h2('L\'ADN minimal &mdash; IDEE A ETUDIER, et la mesure retourne la question')
tab([['etage', 'comment c\'est tenu', 'combien', 'portable ?'],
     ['<b>alpha &mdash; garanti par la DONNEE</b>',
      'une interpretation <b>ne peut pas</b> devenir un fait : pending -&gt; validated, et un '
      'rejected reste ecrit', '<b>4</b>', '<b>OUI, tel quel</b>'],
     ['<b>beta &mdash; mesure a la SORTIE</b>',
      'on n\'empeche pas, on <b>compte</b> &mdash; %d drapeaux, dont %d comptes'
      % (len(CODES), N_DERIVES), '<b>5</b>', '<b>OUI, tel quel</b>'],
     ['<b>gamma &mdash; seulement DEMANDE</b>', 'de la prose, rien derriere',
      '<b>4</b>', '<b>NON</b>, et non mesure']],
    [44 * mm, 76 * mm, 16 * mm, 29 * mm])
cle("<b>LES QUATRE DE L'ETAGE GAMMA SONT</b> : reconnaitre son incertitude &middot; ne pas "
    "presenter une inference comme un fait &middot; ne pas insister &middot; dire qu'une "
    "information manque. <b>Ce sont exactement ceux qui decrivent la PRESENCE de Milo</b> &mdash; "
    "l'humilite, le rythme, le courage de dire &laquo; je ne sais pas &raquo;. Et ce sont les "
    "<b>seuls</b> qu'on ne sait ni garantir ni mesurer.<br/><br/>"
    "<b>Les invariants qu'on sait tenir disent que Milo ne MENT pas.<br/>"
    "Ceux qu'on ne sait pas tenir disent COMMENT IL EST.</b>")
p("<b>La question &laquo; faut-il formaliser l'ADN ? &raquo; change donc de forme</b> : "
  "formaliser aujourd'hui mettrait par ecrit <b>les neuf deja garantis</b> et laisserait dehors "
  "<b>les quatre qui font le caractere</b>. <i>On n'y gagnerait pas de portabilite &mdash; ces "
  "neuf-la sont deja portables &mdash; et on n'y gagnerait aucune des quatre.</i>"
  )
p("<b>La troisieme voie existe peut-etre, et elle est etroite</b> : rendre les quatre de "
  "l'etage gamma <b>OBSERVABLES sans les rendre PRESCRIPTIFS</b>. <i>&laquo; Combien de questions "
  "Milo a-t-il posees ? &raquo;</i> se compte &mdash; le Gardien le fait deja. <i>&laquo; A-t-il "
  "affirme un fait absent du contexte ? &raquo;</i> se verifie contre le contexte, qui est connu. "
  "Mais <i>&laquo; est-il agreable ? &raquo;</i> ne se compte pas, et pretendre le contraire "
  "fabriquerait une fausse mesure (R29).")

# ── 20-23 ─────────────────────────────────────────────────────────────────────────────
h2('20. Reversibilite vs multi-moteurs')
tab([['', '<b>A &mdash; REVERSIBILITE</b>', '<b>B &mdash; MULTI-MOTEURS</b>'],
     ['ce que ca veut dire', 'remplacer le fournisseur <b>sans reconstruire Milo</b>',
      'plusieurs moteurs specialises <b>en meme temps</b>'],
     ['famille extraction (%d)' % len(JSONS), '<b>presque acquis</b>', 'acquis par le meme geste'],
     ['famille conversation (%d)' % len(TEXTES), 'systeme + historique + <b>cache</b> + modele',
      'demande un <b>routage par capacite</b>'],
     ['ce qui manque',
      '(1) l\'<b>ordre</b> separe du tarif &middot; (2) une <b>reference comportementale</b> '
      '&middot; (3) coachMemory sans provenance',
      'tout A, <b>plus</b> un registre de routage et une politique de cout'],
     ['sur-dimensionnement aujourd\'hui ?', 'non', '<b>OUI</b> (R19)']],
    [34 * mm, 66 * mm, 65 * mm])
p("<b>Deja compatible avec B sans rien faire</b> : le modele est <b>deja</b> une variable "
  "serveur, et capacites-ia.js indexe <b>deja par capacite</b>. Les deux pieces d'un routage "
  "existent, separement.", NOTE)

story.append(PageBreak())
h2('21. Connections &mdash; <b>%d destinations, aucun registre</b>' % len(HOTES))
cle("<b>MESURE EN CHARGEANT L'APP</b>, reseau sortant coupe, <b>sans aucune action</b> : "
    "<b>DEUX requetes partent</b>. L'une vers <i>script.google.com</i> (le ping d'autoConnect, "
    "attendu et documente). L'autre vers <b>api.qrserver.com</b> &mdash; <b>un tiers inventorie "
    "nulle part, qui recoit l'IP a chaque ouverture</b>.")
tab([['hote', 'nature'],
     ['script.google.com &middot; workers.dev &middot; supabase.co', 'nos backends'],
     ['api.anthropic.com', 'le fournisseur IA'],
     ['world.openfoodfacts.org &middot; api.github.com &middot; youtube', 'sources connues'],
     ['<b>api.qrserver.com</b>',
      '<b>QR genere par un tiers, part au CHARGEMENT</b> (dans index.html)'],
     ['<b>wger.de</b>',
      '<b>API d\'exercices tierce &mdash; recoit le terme TAPE par la personne</b> (R36)'],
     ['<b>cdn.jsdelivr.net</b>', '<b>pdf.js charge depuis un CDN a l\'execution</b>']],
    [62 * mm, 103 * mm])
p("<b>C'est l'argument mesure en faveur d'un registre connections</b> : trois de ces "
  "destinations ne sont nommees dans <b>aucun</b> document de gouvernance, et l'une recoit du "
  "texte tape par la personne. <b>Il a trouve quelque chose en quatre minutes.</b> "
  "<b>Ce n'est PAS capacites-ia.js en double</b> : une <b>capacite</b> dit ce que Milo peut "
  "faire, une <b>destination</b> dit ou une donnee part &mdash; <b>10 des %d hotes n'ont aucune "
  "capacite IA associee</b>." % len(HOTES))

h2('22. Cadence &mdash; un bus d\'evenements existe deja, a un seul nerf')
tab([['mecanisme', 'ce qui existe dans _dbf*'],
     ['file', 'JSON, <b>max 3</b>, les plus anciennes sortent'],
     ['jeton en cours', '{id, ts} &mdash; survit a un rechargement'],
     ['<b>recu</b>', 'la reponse <b>deja payee</b> est gardee avant d\'etre posee &mdash; '
      '<i>un plantage ne la repaie pas</i>'],
     ['idempotence', 'les <b>40</b> dernieres seances reellement debriefees'],
     ['peremption', '<b>36 h</b>, un seul seuil pour tout (R2)'],
     ['<b>filet sans jeton</b>',
      '_dbfRattraper compare S.sessions a registre.sessionLog &mdash; <i>qu\'est-ce qui aurait '
      'du produire une trace et n\'en a pas produit ?</i>'],
     ['echec propre', 'le jeton repart <b>en tete</b> de file']],
    [34 * mm, 131 * mm])
p("<b>Reponse a la question posee : oui, c'est un socle raisonnable</b> &mdash; il a deja les "
  "quatre proprietes difficiles. <b>Ses limites, mesurees</b> : il vit en <b>localStorage</b> "
  "(donc par appareil, perdu au changement de telephone) ; il se declenche sur <b>window load</b>, "
  "donc <b>Milo n'agit jamais sans que l'app soit ouverte</b> ; <b>un seul type d'evenement</b> ; "
  "et dans tout le depot : <b>0</b> notification push, <b>0</b> cron Cloudflare, les 2 "
  "declencheurs Apps Script ne servant qu'a la <b>sauvegarde</b>.")
p("<b>Compatible</b> : &laquo; une seance vient de finir &raquo;, &laquo; un import a abouti &raquo;, "
  "&laquo; une observation attend depuis N jours &raquo;. <b>Incompatible</b> : &laquo; il est 8 h, "
  "rappelle-lui sa seance &raquo; &mdash; ca exige que <b>quelque chose tourne sans l'app</b>, donc "
  "une vraie infrastructure.", NOTE)

h2('23. Voix &mdash; une interface, pas une identite')
p("<b>Mesure : 0 occurrence</b> de SpeechRecognition, speechSynthesis, MediaRecorder dans tout le "
  "code servi. <b>Rien n'existe.</b> L'architecture coherente : <b>audio -&gt; transcription</b> "
  "(un moteur interchangeable qui <b>ne sait RIEN de la personne</b> &mdash; c'est la definition "
  "exacte du cervelet) <b>-&gt; le MEME buildCoachContext, la MEME memoire, le MEME Gardien -&gt; "
  "reponse -&gt; synthese</b>.")
p("<b>Quatre bornes, chacune tiree d'une regle existante</b> : aucune memoire propre a la voix "
  "(R2, R6) &middot; la transcription ne recoit pas l'identite &middot; <b>_gardienSortie tourne "
  "AVANT la synthese</b> (<i>une phrase dite est plus difficile a rattraper qu'une phrase lue</i>) "
  "&middot; <b>la voix change le RYTHME, pas seulement le canal</b>. <b>Non mesure</b> : les "
  "reponses font aujourd'hui <i>&laquo; maximum 200 mots &raquo;</i>, c'est long a l'oral ; "
  "l'interruption n'existe pas a l'ecrit ; et une <b>erreur de transcription</b> cree une classe "
  "de faux faits que rien ne gere.")

# ── 24-28 ─────────────────────────────────────────────────────────────────────────────
story.append(PageBreak())
h2('24. Risques &middot; 25. dette decouverte &middot; 26. contradictions')
tab([['#', 'ce qui a ete trouve', 'gravite'],
     ['1', '<b>S.coachMemory</b> : resume IA persiste sans provenance, <b>cumulatif</b>, relu a '
      'chaque message, et il <b>double les appels IA</b> au-dela du 4e echange',
      '<b>contredit une decision prouvee</b>'],
     ['2', 'la note de <b>%d caracteres</b> sous le marqueur de cache est <b>fausse depuis le '
      '10/08</b> et <b>payee plein tarif</b> a chaque message' % N_NOTE,
      'faux + cout'],
     ['3', '<b>api.qrserver.com</b> recoit une requete a <b>chaque ouverture</b> de l\'app, '
      'depuis index.html', 'tiers non decide'],
     ['4', '<b>wger.de</b> recoit le terme <b>tape</b> par la personne', '<b>R36</b>'],
     ['5', '<b>Aucune passe reelle du banc</b> n\'existe dans le depot &mdash; la reference '
      'comportementale vit sur un telephone', '<b>bloque toute bascule</b>'],
     ['6', '<b>5 decisions sur 14 introuvables</b>, et trois numerotations incompatibles',
      'gouvernance'],
     ['7', '<b>4 attendus de test</b> avaient ete transformes en <b>decisions de Michel</b> par '
      'une passation', '<b>gouvernance</b>'],
     ['8', '<b>21/%d capacites</b> portent serveurApplique:false : la place du verrou existe, '
      'le verrou non' % N_CAP, 'connu, non regresse'],
     ['9', 'Code.js duplique <b>%d fois</b> le protocole du fournisseur &mdash; mais c\'est le '
      '<b>repli</b>, pas le chemin servi' % URL_CODE, 'dette R2, dormante']],
    [8 * mm, 118 * mm, 39 * mm])

h2('27. Ce qui necessite une decision de Michel')
tab([['', 'question', 'ce qu\'on sait deja'],
     ['<b>Q1</b>', '<b>ADN</b> : formaliser quelques invariants en gardant la prose riche ?',
      'formaliser aujourd\'hui capterait les <b>9 deja garantis</b> et manquerait les <b>4 qui '
      'font le caractere</b>'],
     ['<b>Q2</b>', '<b>Decisions manquantes</b> : que reste-t-il a redecider ?',
      '<b>9 retrouvees et prouvees</b>, <b>5 introuvables</b>. Trois numerotations '
      'incompatibles : ne plus employer M1-M11'],
     ['<b>Q3</b>', '<b>coachMemory</b> : garder / envelopper / reduire ?',
      '<b>avis technique : B</b> (envelopper), parce qu\'elle applique le patron que '
      'registre.observations fait deja tourner'],
     ['<b>Q4</b>', '<b>Independance</b> : reversibilite d\'abord, multi-moteurs ensuite ?',
      '<b>10 appels sur 13 sont deja quasi portables</b> ; le multi-moteurs serait du '
      'sur-dimensionnement aujourd\'hui'],
     ['<b>Q5</b>', '<b>Banc</b> : verifie-t-il une definition situee au-dessus de lui ?',
      'le <b>niveau 1 n\'existe pas comme objet</b> ; un juge IA ferait juger Milo par le moteur '
      'qu\'on veut remplacer'],
     ['<b>Q6</b>', '<b>Connections</b> : le registre entre-t-il dans l\'architecture ?',
      '<b>12 hotes</b>, 3 non inventories, <b>2 requetes a chaque ouverture</b>'],
     ['<b>Q7</b>', '<b>La note fausse de %d caracteres</b> : la corriger ?' % N_NOTE,
      '<b>R34</b> exige un banc avant/apres, et aucune passe reelle n\'est enregistree'],
     ['<b>Q8</b>', '<b>api.qrserver.com</b> a chaque ouverture : voulu ?',
      'mesure, <b>jamais decide</b>']],
    [11 * mm, 63 * mm, 91 * mm])

h2('28. Ordre de travail recommande &mdash; <b>avis technique, pas une decision</b>')
tab([['ordre', 'quoi', 'pourquoi ce rang'],
     ['<b>1</b>', '<b>Trancher Q2</b> (les 5 decisions introuvables)',
      '<b>rien d\'autre ne peut s\'y appuyer</b> : une architecture memoire batie sur des '
      'decisions introuvables serait batie sur du sable'],
     ['<b>2</b>', '<b>Trancher Q3</b> (coachMemory)',
      'c\'est le <b>seul ecart</b> entre une decision prouvee et le code ; et l\'option B est '
      'petite, reversible, sans changement visible'],
     ['<b>3</b>', '<b>Faire tourner le banc pour de vrai et ENREGISTRER la passe</b>',
      '<b>tout le reste en depend</b> : sans reference comportementale, aucun changement de '
      'contexte ni de moteur ne peut se juger (R34)'],
     ['<b>4</b>', 'Q6 &mdash; le registre <b>connections</b> (descriptif, sans verrou)',
      'petit, sans risque, <b>meme patron que capacites-ia.js</b>, et il a deja trouve 3 '
      'destinations non inventoriees'],
     ['<b>5</b>', 'Q7 puis les pistes de selection du contexte',
      '<b>apres</b> le banc, jamais avant &mdash; ce sont des changements de ce que Milo recoit'],
     ['<b>6</b>', 'Q1 (ADN) et Q4 (independance)',
      'les deux <b>dependent</b> d\'une reference comportementale : les trancher avant le banc '
      'reviendrait a decider sans pouvoir verifier'],
     ['&mdash;', '<b>Voix, cadence, multi-moteurs</b>',
      '<b>plus tard</b>, et le cadre externe le dit aussi : <i>on n\'automatise pas un '
      'enchainement qui ne tourne pas encore a la main</i>']],
    [13 * mm, 52 * mm, 100 * mm])

cle("<b>LIGNE DE REPRISE RECOMMANDEE POUR CHATGPT.</b> Reprendre avec Michel sur <b>Q2 puis "
    "Q3</b> : ce sont les deux seules questions dont la reponse <b>ne depend d'aucune mesure "
    "manquante</b>. Tout le reste attend une <b>passe reelle du banc enregistree dans le "
    "depot</b> &mdash; c'est le verrou qui tient l'ADN, l'independance et la selection du "
    "contexte. <b>Et ne pas rouvrir</b> : les 9 decisions retrouvees sont des <b>contraintes</b>, "
    "pas des questions (regle d'or 15).")

p("<b>Dossier produit par un script qui recompte ses @@GARDES@@ faits depuis git et depuis le "
  "code servi, re-genere le prompt plutot que de le recopier, refuse de produire si un fait "
  "tombe, et relit sa propre sortie. Aucune ligne servie modifiee, aucun appel IA depense, "
  "aucune decision prise a la place de Michel.</b>", NOTE)
_IDX_G = len(story) - 1


# ── encodage ──────────────────────────────────────────────────────────────────────────
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
g(not _mauvais,
  'caracteres hors cp1252 APRES desechappement (ils ne seraient pas rendus) : %r'
  % sorted(set(_mauvais)))

N_GARDES = GARDES[0] + 1
_v = story[_IDX_G]
g('@@GARDES@@' in _v.text, 'le marqueur du compte de gardes a disparu')
story[_IDX_G] = Paragraph(_v.text.replace('@@GARDES@@', str(N_GARDES)), _v.style)


def pied(cv, doc):
    cv.saveState()
    cv.setFont('Helvetica', 7)
    cv.setFillColor(GRIS)
    cv.drawString(15 * mm, 10 * mm,
                  'Force Tracker - Milo, consolidation identite et independance - 20/09/2026 '
                  '- %s - %s' % (head, VERSION))
    cv.drawRightString(195 * mm, 10 * mm, 'page %d' % cv.getPageNumber())
    cv.restoreState()


doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=15 * mm, rightMargin=15 * mm,
                        topMargin=14 * mm, bottomMargin=16 * mm,
                        title='Force Tracker - Milo : consolidation identite et independance',
                        author='Force Tracker')
doc.build(story, onFirstPage=pied, onLaterPages=pied)

rc3, sale3 = git('status', '--porcelain')
if sale3 and not CN:
    raise SystemExit('GARDE ROUGE - la generation a SALI le depot : %r' % sale3)

# ── on relit la page produite ─────────────────────────────────────────────────────────
import pypdfium2 as _pdfium
_doc = _pdfium.PdfDocument(OUT)
_pages = [_doc[i].get_textpage().get_text_range() for i in range(len(_doc))]
_rendu = '\n'.join(_pages)
_norm = _rendu.replace(' ', ' ').replace(' ', ' ')
if len(_pages) < 6:
    raise SystemExit('GARDE ROUGE - %d pages seulement' % len(_pages))
if len(_rendu) < 18000:
    raise SystemExit('GARDE ROUGE - %d caracteres rendus : la page est muette' % len(_rendu))
_ATT = [head, VERSION, '%d faits' % N_GARDES, format(P_TOT, ',').replace(',', ' '),
        format(CATA, ',').replace(',', ' '), 'S.coachMemory', 'api.qrserver.com', 'wger.de',
        '_dbfRattraper', 'Q8', 'arbitrage Q3 (M12)', 'gen_memoire_archi_pdf.py']
_abs = [a for a in _ATT if a not in _norm]
if _abs:
    raise SystemExit('GARDE ROUGE - faits absents de la PAGE RENDUE : %r' % _abs)
_hors = sorted({c for c in _rendu if c not in '\n\r\t' and not c.encode('cp1252', 'ignore')})
if _hors:
    raise SystemExit('GARDE ROUGE - caracteres non rendus : %r' % _hors)
if '@@' in _rendu:
    raise SystemExit('GARDE ROUGE - un marqueur de gabarit est visible sur la page')

print('OK  %s' % OUT)
print('    %d gardes | %d pages | %d caracteres relus | %d faits verifies sur le RENDU'
      % (N_GARDES, len(_pages), len(_rendu), len(_ATT)))
print('    prompt : total %d | commun %d | perso %d | instant %d | catalogue %d'
      % (P_TOT, P_COM, P_PER, P_INS, CATA))
