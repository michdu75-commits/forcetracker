#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Produit `docs/BANC-MILO-REFERENCE.md` — LA REFERENCE COMPORTEMENTALE DE MILO.

POURQUOI CE FICHIER EXISTE (20/09/2026)
    Jusqu'ici, la seule reference reelle du comportement de Milo vivait dans le
    `localStorage` d'un telephone. Le depot ne portait qu'un rapport « a blanc »
    (0 appel). 👉 Le jour d'un changement de contexte, de prompt ou de moteur, il n'y
    avait RIEN a comparer — et R34 exige justement un avant/apres.

CE QU'IL EST, ET CE QU'IL N'EST PAS
    ⭐ C'est un POINT DE COMPARAISON : « voici ce que Milo faisait le jour J, sur cet
      arbre, avec ce modele ».
    ⛔ Ce n'est PAS la definition de Milo. Le banc reste le niveau 3 du modele
      « definition -> comportements observables -> tests ». Un VERT dit seulement
      « aucune violation detectable sur ces pieges-la ».
    ⛔ Aucun juge IA n'intervient, et ce fichier ne note ni la chaleur, ni le naturel,
      ni la sympathie : *une fausse metrique est pire que pas de metrique* (R29).

DONNEES
    ⛔ AUCUNE CONVERSATION N'EST ENREGISTREE. Le rapport source ne porte que des
      identifiants de scenario, des verdicts et des nombres — verifie par un garde
      ci-dessous, qui REFUSE de produire si une cle de contenu apparait.

Lancer :  python3 tools/gen_banc_reference.py
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tests', 'milo', 'eval-report.json')
OUT = os.path.join(ROOT, 'docs', 'BANC-MILO-REFERENCE.md')

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        sys.exit('GARDE ROUGE (#%d) - %s' % (GARDES[0], msg))


g(os.path.exists(SRC), 'tests/milo/eval-report.json est absent : rien a publier')
R = json.load(open(SRC, encoding='utf-8'))

# ── 1. LA PASSE A-T-ELLE VRAIMENT TOURNE ? ─────────────────────────────────────────────
# ⛔⛔ LE GARDE QUI COMPTE LE PLUS. Un rapport « a blanc » est un rapport ou AUCUN appel
#     n'a ete fait : le publier comme reference serait publier une page blanche en
#     pretendant que c'est une mesure. C'est exactement `BUGS.md` §61 — un run qui n'a
#     pas tourne ressemble trait pour trait a un run reussi.
g(R.get('mode') in ('reel', 'comparaison'),
  "le rapport est en mode %r : AUCUN appel n'a ete fait. Une reference doit etre une "
  "passe REELLE (node tests/milo/eval.js --go)." % R.get('mode'))
g(R.get('sha'), "le rapport ne porte pas de SHA : « avant » et « apres » ne designeraient rien")

PASSES = R.get('parPasse') or {}
g(PASSES, 'le rapport ne porte aucune passe')

# ⛔⛔ LE GARDE QUI MANQUAIT, ET IL A ETE PAYE POUR DE VRAI (20/09/2026).
#     Un essai a 1 scenario est revenu « HTTP 401 — pas de reponse », donc ZERO comportement
#     mesure. Le workflow a pourtant conclu SUCCESS, parce qu'il ne comptait que les
#     scenarios « joues », et qu'un scenario SANS REPONSE compte comme joue.
#     👉 ***Une passe ou Milo n'a jamais repondu produit un rapport parfaitement bien forme :
#     mode « reel », un SHA, des scenarios « joues » — et pas une seule mesure dedans.***
#     C'est `BUGS.md` §61 un cran plus loin : non seulement un run casse ressemble a un run
#     vert, mais ici il ressemble a une REFERENCE. Publier ca donnerait un point de
#     comparaison vide auquel on croirait pendant des mois.
# ⭐ La seule question qui vaille n'est donc pas « combien de scenarios ont ete joues »,
#    mais « combien ont recu une REPONSE » — c'est-a-dire vert ou rouge.
_REPONDU = sum(1 for lst in PASSES.values()
               for x in lst if x.get('etat') in ('vert', 'rouge'))
_MUETS = sum(1 for lst in PASSES.values()
             for x in lst if x.get('etat') in ('muet', 'erreur'))
g(_REPONDU > 0,
  "AUCUN scenario n'a recu de reponse (%d muet(s)/erreur(s)) : la passe est bien formee mais "
  "VIDE. Une reference sans comportement mesure est pire qu'une absence de reference. "
  "Cause la plus frequente : le Worker refuse (HTTP 401) parce que le navigateur du banc "
  "n'a aucun jeton d'identite — « Origin correct + aucun token -> refus » (decision actee)."
  % _MUETS)

# ── 2. AUCUNE CONVERSATION N'EST PUBLIEE ───────────────────────────────────────────────
BRUT = json.dumps(R, ensure_ascii=False)
for cle in ('"reply"', '"reponse"', '"content"', '"message"', '"historique"'):
    g(cle not in BRUT,
      "le rapport contient %s : une reference ne doit PAS archiver de conversation "
      "(le but est de garder un COMPORTEMENT, pas une vie privee)" % cle)

# ── 3. LES CHIFFRES, RECOMPTES DEPUIS LE DEPOT ─────────────────────────────────────────
try:
    SC = subprocess.run(
        ['node', '-e',
         "const s=require('./tests/milo/eval-scenarios.js');"
         "console.log(JSON.stringify({n:s.length,v:s.reduce((a,x)=>a+((x.verifs||[]).length),0)}))"],
        cwd=ROOT, capture_output=True, text=True, timeout=120)
    D = json.loads(SC.stdout.strip().split('\n')[-1])
except Exception as e:                                       # pragma: no cover
    sys.exit('GARDE ROUGE - impossible de recompter les scenarios : %s' % e)

g(D['n'] == R.get('nbScenariosFichier'),
  'le fichier porte %d scenarios, le rapport en annonce %d' % (D['n'], R.get('nbScenariosFichier')))
g(D['v'] == R.get('nbVerifs'),
  '%d verificateurs comptes, le rapport en annonce %s' % (D['v'], R.get('nbVerifs')))

TIER1 = 0
try:
    T = subprocess.run(['node', '-e',
                        "console.log(require('./tests/milo/scenarios.js').length)"],
                       cwd=ROOT, capture_output=True, text=True, timeout=120)
    TIER1 = int(T.stdout.strip().split('\n')[-1])
except Exception:
    TIER1 = 0

VERSION = ''
try:
    VERSION = (re.search(r"CACHE\s*=\s*'(ft-v\d+)'",
                         open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()) or [None, ''])[1]
except Exception:
    pass

# ── 4. LE DEPOUILLEMENT ────────────────────────────────────────────────────────────────
ETATS = ('vert', 'rouge', 'muet', 'erreur', 'blanc')


def compter(lst):
    c = dict((e, 0) for e in ETATS)
    for x in lst:
        c[x.get('etat', 'blanc')] = c.get(x.get('etat', 'blanc'), 0) + 1
    return c


LIG = []
A = LIG.append
A('# 🧪 Référence comportementale de Milo — passe **RÉELLE**')
A('')
A('> ⚙️ **NE PAS ÉDITER À LA MAIN** — régénéré par `python3 tools/gen_banc_reference.py`')
A('> depuis `tests/milo/eval-report.json`. Le générateur **refuse de produire** si la passe')
A("> n'a pas réellement tourné, si elle ne porte pas de SHA, ou si le rapport contient la")
A('> moindre conversation.')
A('>')
A("> ⛔⛔ **CE N'EST PAS LA DÉFINITION DE MILO.** Le banc est le **niveau 3** du modèle")
A('> *définition → comportements observables → tests*. ⭐ **Un ROUGE est une preuve** qu\'une')
A('> règle a été violée ; **un VERT dit seulement** *« aucune violation détectable sur ces')
A("> pièges-là »*. Ce qui fait Milo — le ton, le naturel, le refus d'insister — **n'est dans")
A('> aucun de ces motifs**, et aucun juge IA n\'intervient ici (décision écrite).')
A('')
A('## La passe')
A('')
A('| | |')
A('|---|---|')
A('| date | **%s** |' % R.get('date', '?'))
A('| mode | **%s** |' % R.get('mode'))
A('| SHA de l\'arbre | **`%s`** |' % R.get('sha'))
A('| version servie | **%s** |' % (R.get('version') or VERSION or '?'))
A('| app réellement testée | `%s` |' % R.get('appTestee', '?'))
A('| moteur / modèle | **%s** (`%s`) |' % (', '.join(R.get('modeles') or ['?']),
                                           ', '.join(R.get('modelesId') or ['?'])))
A('| scénarios joués | **%d** sur **%d** du fichier |' % (R.get('nb', 0),
                                                          R.get('nbScenariosFichier', 0)))
A('| vérificateurs | **%d** |' % R.get('nbVerifs', 0))
A('| témoins Tier 1 (règle *présente* dans le prompt) | **%d** |' % TIER1)
A('| répétitions par scénario | %d |' % R.get('repeat', 1))
A('| juge IA | **aucun** — décision écrite |')
A('')

for nom, lst in PASSES.items():
    c = compter(lst)
    joues = sum(v for k, v in c.items() if k != 'blanc')
    A('## Résultat — passe `%s`' % nom)
    A('')
    A('| verdict | nombre |')
    A('|---|---|')
    A('| ✅ vert (aucune violation détectable) | **%d** |' % c['vert'])
    A('| ❌ **rouge (une règle a été violée)** | **%d** |' % c['rouge'])
    A('| ⛔ muet / erreur | %d |' % (c['muet'] + c['erreur']))
    A('| total joué | **%d** |' % joues)
    A('')
    rouges = [x for x in lst if x.get('etat') == 'rouge']
    if rouges:
        A('### Les rouges — **ce sont des preuves, pas des impressions**')
        A('')
        A('| scénario | origine | ce qui a été violé |')
        A('|---|---|---|')
        for x in rouges:
            d = x.get('detail') or ''
            if isinstance(d, list):
                d = ' · '.join(str(y) for y in d)
            A('| **%s** — %s | %s | %s |' % (x.get('id'), x.get('titre', ''),
                                             x.get('origin', ''), str(d)[:180]))
        A('')
    else:
        A('⭐ **Aucun rouge sur cette passe.** ⚠️ Et cela ne veut pas dire « Milo respecte ses')
        A('règles » : cela veut dire *« ces %d pièges-là n\'ont pas pris »*.' % joues)
        A('')

A('## À quoi elle sert')
A('')
A("Elle est le **point de comparaison** exigé par **R34** avant de toucher à ce que Milo")
A('reçoit ou à ce qui le fait tourner : le contexte, l\'ordre des blocs, le cache, la')
A("sélection par le cervelet, le prompt comportemental, l'abstraction du fournisseur, le")
A('moteur lui-même. 👉 ***Voici ce que Milo faisait avant.***')
A('')
A('## Ce qu\'elle ne dit pas')
A('')
A('- ⛔ **rien sur le ton, le naturel ou la personnalité** — ces motifs ne les mesurent pas ;')
A('- ⛔ **rien sur la mémoire longue** — c\'est `PT-001` qui l\'éprouve, séparément ;')
A('- ⛔ **rien sur ce que le Gardien de sortie a compté** chez les vrais utilisateurs ;')
A("- ⚠️ et un vert est **borné à la portée du banc** : il ne conclut jamais seul.")
A('')
A('*Généré depuis `tests/milo/eval-report.json` · %d gardes franchis · aucune conversation '
  'enregistrée.*' % (GARDES[0] + 1))
A('')

open(OUT, 'w', encoding='utf-8').write('\n'.join(LIG))

# ── 5. ON RELIT CE QU'ON VIENT D'ECRIRE ────────────────────────────────────────────────
RELU = open(OUT, encoding='utf-8').read()
g(len(RELU) > 900, 'la reference produite est trop courte pour dire quoi que ce soit')
g(R.get('sha') in RELU, 'le SHA n apparait pas dans la page produite')
g('juge IA | **aucun**' in RELU, 'la page ne dit plus qu il n y a aucun juge IA')

print('OK  %s' % OUT)
print('    %d gardes | mode %s | sha %s | %d scenarios | %d verificateurs'
      % (GARDES[0], R.get('mode'), R.get('sha'), R.get('nb', 0), R.get('nbVerifs', 0)))
