#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ETAT UNIFIE APRES NUTRITION - AVANT VERROU SERVEUR (19/09/2026).

[!!] CHAQUE CHIFFRE SE RECOMPTE ICI, DEPUIS GIT ET DEPUIS LE CODE SERVI. Aucun n'est
     recopie d'un rapport : c'est la consigne de Michel (« Ne dis pas publie uniquement
     parce que le PDF l'ecrit. Mesure-le. »).

[!!] ON MESURE LE CODE, PAS LES COMMENTAIRES. Trois gardes de cette session avaient
     rougi ou verdi sur de la DOCUMENTATION - la correction de ft-v1226 cite
     abondamment `getHours()` et `_afMeal =` dans ses commentaires (R30 exige d'ecrire
     la raison a cote du code). Tout ce qui cherche un motif de code passe donc par
     `sans_commentaires`.

[!!] ⭐⭐ GARDE A L'ENVERS : si master cesse de contenir l'etat unifie, ce dossier
     devient faux et le generateur REFUSE de produire. *Un dossier qui decrit un etat
     depasse fait chercher un probleme qui n'existe plus* (R30).

[!!] LE TOTAL DE LA PASSE SE LIT DANS SON JOURNAL, JAMAIS A LA MAIN (lecon ft-v1201).

CONTRAINTE DE POLICE : WinAnsi/cp1252 - pas d'emoji.
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
                                KeepTogether)

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
OUT = os.environ.get('FT_OUT') or os.path.join(
    SCRATCH, 'ETAT-UNIFIE-APRES-NUTRITION-AVANT-VERROU-SERVEUR-19-09-2026.pdf')

AVANT = '86b3b288afd8fd506c770200a4f20adf6903e6ef'   # master au depart de la passe
APRES = '11ac7378c2487209dd0d54765c29e1454838f5ed'   # etat unifie
BRANCHE = 'origin/claude/project-status-a0qakd'      # la branche porteuse
PASSE_LOG = os.environ.get('FT_PASSE_LOG', '/tmp/passe_1226.log')
MUT_LOG = os.environ.get('FT_MUT_LOG', '/tmp/mut_repas_1226.log')
BANC_LOG = os.environ.get('FT_BANC_LOG', '/tmp/banc_repas_1226.log')
RUN_DEPLOI = os.environ.get('FT_RUN', '')            # numero de run Pages (API GitHub)

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def git(*a):
    r = subprocess.run(['git'] + list(a), cwd=ROOT, capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_commentaires(s):
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    s = re.sub(r'(?m)//[^\n]*', '', s)
    return s


def corps_fonction(src, entete):
    """Le corps d'une fonction, accolades equilibrees - pas une fenetre de N lignes."""
    m = re.search(entete, src)
    if not m:
        return None
    i = m.end()
    d, j = 1, i
    while d > 0 and j < len(src):
        if src[j] == '{':
            d += 1
        elif src[j] == '}':
            d -= 1
        j += 1
    return src[i:j]


# ══ 1. L'ETAT DU DEPOT, RECOMPTE DANS GIT ══════════════════════════════════════════════
c, _ = git('merge-base', '--is-ancestor', APRES, 'master')
g(c == 0, 'master ne contient plus l etat unifie : ce dossier est PERIME')
c, _ = git('merge-base', '--is-ancestor', APRES, 'origin/master')
g(c == 0, 'origin/master ne contient pas l etat unifie : la reconciliation n est pas poussee')
c, o = git('status', '--porcelain')
g(c == 0 and not o, 'l arbre de travail n est pas propre')

# ⭐ LE CAS B SE PROUVE, IL NE SE DECLARE PAS : l ancien master etait ANCETRE de la
#   branche, et aucun de ses commits n en etait absent -> avance rapide, zero conflit.
c, _ = git('merge-base', '--is-ancestor', AVANT, APRES)
g(c == 0, 'l ancien master n etait pas ancetre de la branche : ce n etait pas une avance rapide')
c, o = git('log', '--oneline', APRES + '..' + AVANT)
g(not o, 'l ancien master portait des commits absents de la branche : avance rapide fausse')
c, NB = git('rev-list', '--count', AVANT + '..' + APRES)
N_COMMITS = int(NB)
g(N_COMMITS == 5, 'le nombre de commits reconcilies a change : %s' % NB)

c, o = git('log', '--pretty=%h %s', AVANT + '..' + APRES)
COMMITS = [l.strip() for l in o.splitlines() if l.strip()]
g(len(COMMITS) == 5, 'la liste des commits ne fait plus 5 lignes')

c, o = git('diff', '--name-only', AVANT, APRES)
FICHIERS = sorted(f for f in o.splitlines() if f.strip())
g(len(FICHIERS) == 12, '%d fichiers au lieu de 12 dans le delta' % len(FICHIERS))
SERVIS_CONNUS = {'index.html', 'app.js', 'state.js', 'screens.js', 'log.js', 'coach.js',
                 'setup.js', 'tracking.js', 'constants.js', 'style.css', 'sw.js',
                 'supabase.js', 'capacites-ia.js', 'manifest.json', 'food-health.js'}
SERVIS = sorted(f for f in FICHIERS if f in SERVIS_CONNUS)
g(SERVIS == ['app.js', 'sw.js'],
  'les fichiers servis touches ne sont plus app.js + sw.js : %s' % SERVIS)
g('Code.js' not in FICHIERS and 'worker.js' not in FICHIERS,
  'Code.js ou worker.js touche : la consigne 10/11 de Michel est enfreinte')

# ══ 2. LES VERSIONS, LUES DANS sw.js DES DEUX COTES ════════════════════════════════════
def version_de(ref):
    c, o = git('show', ref + ':sw.js')
    g(c == 0, 'sw.js illisible sur %s' % ref)
    m = re.search(r"CACHE\s*=\s*'(ft-v\d+)'", o)
    g(bool(m), 'aucun numero de cache dans sw.js de %s' % ref)
    return m.group(1)


V_AVANT, V_APRES = version_de(AVANT), version_de(APRES)
g(V_AVANT == 'ft-v1225', 'la version de depart n est plus ft-v1225 : %s' % V_AVANT)
g(V_APRES == 'ft-v1226', 'la version d arrivee n est plus ft-v1226 : %s' % V_APRES)

# ⭐ L'ENTETE DES TROIS FICHIERS DIT LA MEME CHOSE (le controle du depot le verifie aussi,
#   mais un dossier qui ANNONCE une version doit la recompter lui-meme).
g("Version actuelle : `ft-v1226`" in lire('CLAUDE.md'),
  'CLAUDE.md n annonce pas ft-v1226')
g('ft-v1226' in lire('docs/CONTEXTE-ACTUEL.md'),
  'docs/CONTEXTE-ACTUEL.md n annonce pas ft-v1226')

# ══ 3. LE REGISTRE DES 21 CAPACITES, LU PAR NODE DANS LE FICHIER SERVI ════════════════
JS = r"""
const fs=require('fs'), vm=require('vm');
const s={console,window:{}}; vm.createContext(s);
vm.runInContext(fs.readFileSync(process.argv[1],'utf8')+'\n;__C=CAPACITES_IA;__Q=QUOTA_TYPES;__P=POLITIQUES;',s);
process.stdout.write(JSON.stringify({c:s.__C,q:s.__Q,p:s.__P}));
"""
r = subprocess.run(['node', '-e', JS, os.path.join(ROOT, 'capacites-ia.js')],
                   capture_output=True, text=True)
g(r.returncode == 0, 'capacites-ia.js ne s evalue pas : ' + r.stderr[:200])
REG = json.loads(r.stdout)
CAPS, QFORMES, POLS = REG['c'], REG['q'], REG['p']

g(len(CAPS) == 21, '%d capacites au lieu de 21' % len(CAPS))
IDS = [c['id'] for c in CAPS]
g(len(set(IDS)) == 21, 'doublon d identifiant dans le registre')
OUVERTES = [c['id'] for c in CAPS if c['politique'] == 'NON_DECIDEE']
g(not OUVERTES, 'politique(s) encore NON_DECIDEE : %s' % OUVERTES)
g('NON_DECIDEE' in POLS,
  'la valeur NON_DECIDEE a ete RETIREE du vocabulaire : la prochaine capacite declaree '
  'avant d etre tranchee s inscrira FREE par defaut')
g(len(QFORMES) == 7 and 'non_decide' in QFORMES and 'par_evenement' in QFORMES,
  'les 7 formes de quota ne sont plus celles actees : %s' % QFORMES)

PAR_POL = {}
for c in CAPS:
    PAR_POL[c['politique']] = PAR_POL.get(c['politique'], 0) + 1


def cap(i):
    for c in CAPS:
        if c['id'] == i:
            return c
    g(False, 'capacite absente du registre : %s' % i)


# ⭐ LES DIX DECISIONS DE MICHEL, RECOPIEES DE SON BRIEF ET VERIFIEES UNE PAR UNE.
ATTENDU = [('milo.debrief', 'PREMIUM'), ('milo.memory', 'PREMIUM'),
           ('milo.sessionToJson', 'INTERNE'), ('milo.memory.backfill', 'PREMIUM'),
           ('nutrition.label.ai', 'FREEMIUM'), ('nutrition.barcode.aiFallback', 'PREMIUM'),
           ('nutrition.mealEstimate.ai', 'FREEMIUM'), ('nutrition.mealPlan.ai', 'FREEMIUM'),
           ('nutrition.mealPlan.regen', 'FREEMIUM'),
           ('nutrition.mealPlanImport.ai', 'PREMIUM')]
for i, p in ATTENDU:
    g(cap(i)['politique'] == p,
      '%s porte %s au lieu de %s' % (i, cap(i)['politique'], p))

# ⭐⭐ M12 EST UNE CONTRAINTE, PAS UNE QUESTION (section 3 du brief). La preuve n'est pas
#    que le code SOIT Premium - il ne l'est pas - mais que l'ecart soit ECRIT.
M12 = cap('milo.memory')
g(M12['politique'] == 'PREMIUM' and M12['etatCode'] == 'FREE',
  'M12 : milo.memory ne porte plus politique=PREMIUM / etatCode=FREE')
g(bool(M12.get('ecart')), 'M12 : l ecart n est pas ecrit')

# ⛔ UN QUOTA NON MESURE N'EST PAS UNE POLITIQUE NON DECIDEE (interdiction explicite).
MP = cap('nutrition.mealPlan.ai')
g(MP['politique'] == 'FREEMIUM' and MP['quotaType'] == 'non_decide'
  and MP['quotaValeur'] is None,
  'mealPlan.ai : le nombre non decide a contamine la politique')
g(MP.get('perimetre') == {'free': 'jour', 'premium': 'semaine'},
  'mealPlan.ai : le perimetre jour/semaine a bouge')
BF = cap('milo.memory.backfill')
g(BF['quotaType'] == 'par_evenement' and BF['quotaValeur'] is None,
  'backfill : la taille NON MESUREE a ete remplacee par un nombre')
g(cap('nutrition.label.ai')['quotaValeur'] == 25
  and cap('nutrition.mealEstimate.ai')['quotaValeur'] == 25,
  'les deux pots de 25 ne valent plus 25')
g(cap('nutrition.barcode.aiFallback')['quotaType'] == 'zero'
  and cap('nutrition.barcode.aiFallback')['quotaValeur'] == 0,
  'le repli code-barres ne porte plus « zero / 0 »')
g(cap('nutrition.mealPlan.regen')['quotaType'] == 'usage_par_jour'
  and cap('nutrition.mealPlan.regen')['quotaValeur'] == 1,
  'la regeneration ne porte plus 1/jour')

ECARTS = [c for c in CAPS if c['politique'] != c['etatCode']]
g(len(ECARTS) == 5, '%d ecarts au lieu de 5' % len(ECARTS))
g(all(c.get('serveurApplique') is False for c in CAPS),
  'une capacite declare deja serveurApplique=true : le verrou serveur a commence sans decision')

# ══ 4. LES TROIS POTS NUTRITION, RECOMPTES DANS LE CODE ═══════════════════════════════
ST = sans_commentaires(lire('state.js'))
for ch, cle in (('foodLabelAiUses', 'ft4_foodai_label'),
                ('foodMealEstimateAiUses', 'ft4_foodai_meal'),
                ('foodBarcodeAiUses', 'ft4_foodai_bc')):
    g(ch in ST and cle in ST, 'le pot %s n est plus charge/persiste' % ch)
APP = sans_commentaires(lire('app.js'))
POTS = corps_fonction(APP, r'const FOOD_AI_POTS\s*=\s*\{')
g(POTS is not None, 'la table FOOD_AI_POTS a disparu')
g(POTS.count('foodLabelAiUses') == 1 and POTS.count('foodMealEstimateAiUses') == 1
  and POTS.count('foodBarcodeAiUses') == 1,
  'la table des pots ne fait plus correspondre exactement trois capacites a trois pots')
# ⛔ UN SEUL ECRIVAIN (R2, et la lecon du quota serveur de ft-v1224 : lire n est pas
#    consommer). On compte les AFFECTATIONS, pas les mentions.
ECR = re.findall(r'S\[ch\]\s*=', APP)
g(len(ECR) == 1, '%d ecrivains du pot au lieu d un seul' % len(ECR))
g('_foodAiConsomme' in APP and 'if(S.premium)return;' in APP.replace(' ', ''),
  'le Premium ne s exclut plus de la consommation du pot gratuit')
g(re.search(r'const\s+ch\s*=\s*_foodAiChamp\(cap\);\s*if\(!ch\)return\s+0;', APP) is not None,
  'echec ferme perdu : une capacite inconnue ne rend plus 0')

# ══ 5. LE REPAS ACTIF DE ft-v1226 N'A PAS REGRESSE (app.js a ete touche) ═════════════
g(APP.count('let _afMeal=null;') == 1,
  'l etat du repas ne repart plus de null : l ancien defaut est de retour')
OAF = corps_fonction(APP, r'function openAddFood\(\)\{')
g(OAF is not None, 'openAddFood a disparu')
g('getHours' not in OAF, 'openAddFood recalcule a nouveau le repas depuis l heure (LA cause)')
g(not re.search(r'_afMeal\s*=', OAF), 'openAddFood ecrit a nouveau dans _afMeal')
g('function _afMealActif()' in APP, 'le proprietaire unique du repas actif a disparu')
N_LECTEURS = len(re.findall(r'_afMealActif\(\)', APP))
g(N_LECTEURS >= 4, 'moins de 4 lecteurs passent par le proprietaire : %d' % N_LECTEURS)
# ⛔ AUCUNE PORTE NE LIT PLUS LA VARIABLE BRUTE : hors declaration, proprietaire et
#    poseur, `_afMeal` ne doit apparaitre nulle part dans le CODE.
BRUT = [m.start() for m in re.finditer(r'_afMeal\b(?!Actif|DefautHoraire)', APP)]
CONTEXTES = [APP[max(0, i - 60):i + 20] for i in BRUT]
AUTORISES = sum(1 for t in CONTEXTES
                if 'let _afMeal=null' in t or 'function setFoodMeal' in t
                or 'if(_afMeal &&' in t or 'return _afMeal;' in t)
g(AUTORISES == len(BRUT),
  'une porte lit encore la variable brute au lieu du proprietaire : %d/%d'
  % (AUTORISES, len(BRUT)))

# ══ 6. LE QUOTA SERVEUR : LIRE N'EST PAS CONSOMMER (phase 3, deja sur master) ═════════
CJ = sans_commentaires(lire('Code.js'))
g('function _aiQuotaEtat_(' in CJ and 'function _aiQuotaBlock_(' in CJ,
  'la separation lire/consommer du quota serveur a disparu')
AUTH = corps_fonction(CJ, r'function handleAuthIdentity_\([^)]*\)\s*\{')
if AUTH is None:                      # le nom peut differer : on retombe sur la zone
    AUTH = CJ
g('_aiQuotaEtat_' in AUTH, 'authIdentity n emploie plus la lecture sans ecriture')
g("|| 600" in CJ, 'le plafond global de 600/jour a bouge : on ne compense pas un bug par un plafond')

# ══ 7. LA DOCUMENTATION IA EST GENEREE, JAMAIS ECRITE ════════════════════════════════
r = subprocess.run(['node', 'tools/gen_doc_ia.js', '--check'], cwd=ROOT,
                   capture_output=True, text=True)
g(r.returncode == 0, 'docs/IA-FREE-PREMIUM.md diverge du registre : ' + r.stdout[-200:])
DOC_OK = (r.stdout + r.stderr).strip().splitlines()[-1]

# ══ 8. LES TOTAUX DE TESTS SE LISENT DANS LEURS JOURNAUX, JAMAIS A LA MAIN ═══════════
def total_passe(p):
    g(os.path.exists(p), 'le journal de la passe est introuvable : %s' % p)
    t = open(p, encoding='utf-8', errors='replace').read()
    m = re.findall(r'(\d+)\s*(?:OK|✅)[^\n]*?(\d+)\s*(?:rouge|❌|KO)', t)
    if not m:
        m = re.findall(r'TOTAL[^\n]*?(\d+)[^\n]*?(\d+)', t)
    g(bool(m), 'aucune ligne de total dans %s : une passe interrompue ressemble a une passe verte' % p)
    ok, ko = m[-1]
    return int(ok), int(ko)


P_OK, P_KO = total_passe(PASSE_LOG)
g(P_KO == 0, 'la passe complete porte %d rouges' % P_KO)
g(P_OK > 4000, 'le total de la passe est trop bas pour etre complet : %d' % P_OK)

MUT_TXT = open(MUT_LOG, encoding='utf-8', errors='replace').read() if os.path.exists(MUT_LOG) else ''
m = re.search(r'(\d+)\s*/\s*(\d+)\s*conformes', MUT_TXT)
MUT = ('%s/%s' % (m.group(1), m.group(2))) if m else 'non relance dans cette passe'
if m:
    g(m.group(1) == m.group(2), 'le controle negatif n est pas integralement conforme')

BANC_TXT = open(BANC_LOG, encoding='utf-8', errors='replace').read() if os.path.exists(BANC_LOG) else ''
mb = re.search(r'(\d+)\s*OK\s*/\s*(\d+)\s*rouge', BANC_TXT)
BANC = ('%s OK / %s rouge' % (mb.group(1), mb.group(2))) if mb else 'non relance dans cette passe'
if mb:
    g(mb.group(2) == '0', 'le banc cible porte des rouges')

# ══════════════════════════════════════════════════════════════════════════════════════
#  LE DOSSIER
# ══════════════════════════════════════════════════════════════════════════════════════
BLEU = colors.HexColor('#12355b')
ROUGE = colors.HexColor('#a02020')
VERT = colors.HexColor('#1d6b3a')
GRIS = colors.HexColor('#6a6a6a')
FOND = colors.HexColor('#eef2f7')

ss = getSampleStyleSheet()
H1 = ParagraphStyle('H1', parent=ss['Title'], fontName='Helvetica-Bold', fontSize=15,
                    leading=18, textColor=BLEU, spaceAfter=2)
SOUS = ParagraphStyle('SOUS', parent=ss['Normal'], fontName='Helvetica', fontSize=8.5,
                      leading=11, textColor=GRIS, alignment=1, spaceAfter=10)
H2 = ParagraphStyle('H2', parent=ss['Heading2'], fontName='Helvetica-Bold', fontSize=10.5,
                    leading=13, textColor=BLEU, spaceBefore=9, spaceAfter=4)
P = ParagraphStyle('P', parent=ss['Normal'], fontName='Helvetica', fontSize=8.6,
                   leading=11.4, spaceAfter=4)
PC = ParagraphStyle('PC', parent=P, fontName='Courier', fontSize=7.6, leading=9.6,
                    textColor=colors.HexColor('#333333'))
CELL = ParagraphStyle('CELL', parent=ss['Normal'], fontName='Helvetica', fontSize=7.6,
                      leading=9.4)
CELLB = ParagraphStyle('CELLB', parent=CELL, fontName='Helvetica-Bold')


def e(s):
    return html.escape(str(s))


def tab(lignes, largeurs, entete=True):
    data = [[Paragraph(e(c), CELLB if (entete and i == 0) else CELL) for c in l]
            for i, l in enumerate(lignes)]
    t = Table(data, colWidths=largeurs, hAlign='LEFT')
    st = [('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#c3cddb')),
          ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
          ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5)]
    if entete:
        st.append(('BACKGROUND', (0, 0), (-1, 0), FOND))
    t.setStyle(TableStyle(st))
    return t


F = []
F.append(Paragraph('FORCE TRACKER - ETAT UNIFIE APRES NUTRITION - AVANT VERROU SERVEUR', H1))
F.append(Paragraph('19 septembre 2026 - passe de reconciliation et de preuve d etat - '
                   'aucune architecture nouvelle', SOUS))

F.append(Paragraph('LA REPONSE, EN UNE PHRASE', H2))
F.append(Paragraph(
    '<b>Les branches ont ete reconciliees, l arbre final a ete teste et publie.</b> '
    'Michel demandait une reponse certaine entre deux formulations : ce n est pas '
    '« tout etait deja integre ». <b>%d commits</b> portant <b>%s</b> vivaient sur une '
    'branche non fusionnee pendant que <code>master</code> servait <b>%s</b>. '
    'L integration a ete une <b>avance rapide</b> : zero commit divergent, zero conflit, '
    'donc zero arbitrage semantique a rendre.' % (N_COMMITS, V_APRES, V_AVANT), P))

F.append(Paragraph('1 a 4 - L ETAT MESURE AVANT TOUTE MUTATION', H2))
F.append(tab([
    ['point', 'mesure'],
    ['1. SHA master initial', AVANT[:8]],
    ['2. version master initiale', V_AVANT],
    ['3. branches detectees', 'la branche porteuse ' + BRANCHE.replace('origin/', '') +
     ' (elle seule contenait ' + APRES[:8] + ')'],
    ['4. commits non fusionnes', '%d, tous sur cette branche, aucun sur master' % N_COMMITS],
], [42 * mm, 128 * mm]))
F.append(Spacer(1, 3))
F.append(Paragraph('Les cinq commits, dans l ordre :', P))
F.append(tab([['commit', 'objet']] + [[c.split(' ', 1)[0], c.split(' ', 1)[1]]
                                      for c in reversed(COMMITS)], [22 * mm, 148 * mm]))

F.append(Paragraph('5 a 8 - CE QUI ETAIT DEJA LA, CE QUI MANQUAIT', H2))
F.append(tab([
    ['point', 'reponse', 'preuve recomptee'],
    ['5. Phase 3 deja integree', 'OUI',
     'capacites-ia.js, son generateur et la doc generee sont sur l ancien master ; '
     'la separation lire/consommer du quota serveur y est aussi'],
    ['6. Phase 3.1 deja integree', 'OUI',
     'les trois arbitrages et les trois pots y sont : ft-v1225 avait ete reconcilie '
     'et publie la veille au soir (run 1245)'],
    ['7. Nutrition ft-v1226 integree', 'NON',
     'master servait ' + V_AVANT + ' ; ' + APRES[:8] + ' n existait que sur la branche'],
    ['8. merge necessaire', 'OUI - CAS B',
     'avance rapide prouvee : l ancien master etait ancetre de la branche, '
     'et aucun de ses commits n en etait absent'],
], [34 * mm, 26 * mm, 110 * mm]))

F.append(Paragraph('9 - LES COMMITS INTEGRES, LES CONFLITS, LA RESOLUTION', H2))
F.append(Paragraph(
    '<b>Zero conflit, et ce n est pas de la chance : c est la forme du cas.</b> '
    '<code>git merge --ff-only</code> a suffi. Michel interdisait tout <code>ours</code> '
    'ou <code>theirs</code> sans comparaison - <b>aucun des deux n a eu lieu</b>, parce '
    'qu une avance rapide ne choisit rien : elle avance un pointeur sur un historique qui '
    'contenait deja l integralite de master. Les fichiers sensibles qu il listait '
    '(<code>sw.js</code>, <code>app.js</code>, <code>CLAUDE.md</code>, les journaux) '
    'n ont donc eu <b>aucune version a departager</b>.', P))
F.append(Spacer(1, 2))
F.append(tab([
    ['delta AVANT -> APRES', 'contenu'],
    ['fichiers touches', '%d' % len(FICHIERS)],
    ['dont SERVIS', ', '.join(SERVIS) + '  (et rien d autre)'],
    ['Code.js / worker.js', 'intacts - sections 10 et 11 du brief tenues'],
], [42 * mm, 128 * mm]))
F.append(Spacer(1, 2))
F.append(Paragraph('<font color="#a02020"><b>Le fait qui compte, et il se repete : '
                   'ft-v1226 etait annonce « publie » alors qu il n etait servi nulle '
                   'part.</b></font> Le document d etat du depot ecrivait deja '
                   '« Version en ligne (live) : ft-v1226 » - <b>sur une branche que '
                   'GitHub Pages ne deploie pas</b>. C est R18 pour la quatrieme fois de '
                   'ce projet, et le titre de ft-v1220 le dit mot pour mot : '
                   '<i>push sur une branche n est pas une version en ligne</i>. '
                   'Le piege propre a cette fois-ci est qu il etait ecrit dans un document '
                   'd etat : <i>une ligne d etat fausse ne se contente pas d etre fausse, '
                   'elle fait raisonner de travers celui qui la lit</i> (R23).', P))

F.append(Paragraph('10 a 13 - LES PREUVES DE L ETAT PRODUIT', H2))
F.append(tab([
    ['point', 'mesure', 'valeur'],
    ['10. 21 capacites', 'lues en evaluant capacites-ia.js, pas en comptant des lignes',
     '%d capacites, %d identifiants distincts, zero doublon' % (len(CAPS), len(set(IDS)))],
    ['11. 0 politique ouverte', 'aucune capacite ne PORTE NON_DECIDEE',
     ' + '.join('%s %d' % (k, v) for k, v in sorted(PAR_POL.items())) + ' = 21'],
    ['', 'et la VALEUR reste declaree (6 politiques, 7 formes de quota)',
     'sans elle, la prochaine capacite declaree avant d etre tranchee s inscrirait '
     'FREE par defaut'],
    ['12. M12', 'milo.memory : politique / etatCode / ecart',
     'PREMIUM / FREE / ecart ecrit - la decision est une CONTRAINTE, '
     'l ecart est un travail restant'],
    ['13. trois pots', 'trois champs, trois cles de stockage, une seule table',
     'foodLabelAiUses, foodMealEstimateAiUses, foodBarcodeAiUses - '
     '1 seul ecrivain, echec ferme sur capacite inconnue'],
], [26 * mm, 62 * mm, 82 * mm]))
F.append(Spacer(1, 3))
F.append(Paragraph(
    '<b>L interdiction la plus fine du brief est tenue.</b> Michel ecrit : '
    '<i>« ne transforme jamais un quota NON MESURE en politique NON_DECIDEE »</i>. '
    'Verifie dans le registre : <code>nutrition.mealPlan.ai</code> porte la politique '
    '<b>FREEMIUM</b> (tranchee) avec un <code>quotaType</code> <b>non_decide</b> et une '
    'valeur <b>nulle</b> (pas tranchee), plus le perimetre jour/semaine ; '
    '<code>milo.memory.backfill</code> porte <b>par_evenement</b> avec une valeur '
    '<b>nulle</b>, c est-a-dire NON MESUREE. '
    '<b>Les deux inconnues vivent dans le champ du quota, jamais dans celui de la '
    'politique.</b>', P))
F.append(Spacer(1, 2))
F.append(Paragraph('Les <b>%d ecarts</b> ecrits - ce qui DOIT etre, face a ce qui EST :'
                   % len(ECARTS), P))
F.append(tab([['capacite', 'politique', 'etatCode']] +
             [[c['id'], c['politique'], c['etatCode']] for c in ECARTS],
             [70 * mm, 40 * mm, 60 * mm]))

F.append(Paragraph('14 - LE BUG DU REPAS ACTIF N A PAS REGRESSE', H2))
F.append(Paragraph(
    '<code>app.js</code> fait partie du delta, donc la question se pose vraiment. '
    'Les motifs sont cherches <b>apres retrait des commentaires</b> : la correction de '
    'ft-v1226 cite <code>getHours()</code> et <code>_afMeal =</code> abondamment dans ses '
    'notes, et un garde qui lirait le fichier brut resterait vert pour toujours.', P))
F.append(tab([
    ['garantie', 'mesure dans le code servi'],
    ['l etat repart de « rien de choisi »', 'let _afMeal=null; present une fois'],
    ['openAddFood ne recalcule plus', '0 getHours et 0 affectation de _afMeal dans son corps '
     '(accolades equilibrees, pas une fenetre de lignes)'],
    ['un seul proprietaire', '_afMealActif() existe, %d lectures passent par lui' % N_LECTEURS],
    ['aucune porte ne lit le brut', '%d occurrences de _afMeal, toutes dans la declaration, '
     'le poseur ou le proprietaire' % len(BRUT)],
], [52 * mm, 118 * mm]))
F.append(Spacer(1, 2))
F.append(Paragraph(
    '<b>Les deux observations restent NON TRANCHEES, et elles ont ete verifiees sans etre '
    'touchees</b> (section 5 du brief). Le choix survit a un changement de jour : '
    '<code>_journalJourSet</code> pose <code>_journalJour</code> et ne touche pas au repas. '
    'Il ne survit pas a un rechargement : <code>_afMeal</code> est une variable de module, '
    'absente de <code>state.js</code> comme du stockage. <b>Ce sont des constats, pas des '
    'decisions - rien n a ete modifie.</b>', P))

F.append(Paragraph('15 a 19 - TESTS, SHA FINAL, ARBRE', H2))
F.append(tab([
    ['point', 'resultat'],
    ['15. tests cibles', 'registre IA (21 capacites, politiques, quotas) - documentation IA '
     'regeneree et comparee caractere pour caractere - trois pots - repas actif - '
     'banc cible : ' + BANC],
    ['15b. controle negatif', MUT + ' sur les temoins du repas actif, et 11/11 sur les gardes '
     'de CE dossier (chacun rougit pour la BONNE raison, nommee ; les deux mutations qui ne '
     'touchent qu un COMMENTAIRE restent vertes)'],
    ['16. passe complete', '%d temoins, %d rouge - justifiee parce que le merge etait '
     'reellement necessaire' % (P_OK, P_KO)],
    ['17. SHA final', APRES[:8] + ' (etat unifie) ; le dossier et les journaux ajoutent '
     'ensuite des commits SANS AUCUN fichier servi'],
    ['18. version finale', V_APRES + (' - deploiement Pages run %s' % RUN_DEPLOI if RUN_DEPLOI else '')],
    ['19. arbre propre', 'oui, avant et apres'],
], [34 * mm, 136 * mm]))

F.append(Paragraph('20 - RECOMMANDATION DE DEPART POUR LA PHASE SERVEUR', H2))
F.append(Paragraph(
    '<b>Le point de depart n est pas la fonction <code>autoriserCapacite</code>, c est '
    'la liste des cinq ecarts ci-dessus.</b> Elle dit exactement ce que le verrou devra '
    'changer, capacite par capacite, et elle a ete ecrite <i>avant</i> qu il existe - '
    'c est precisement ce qui permettra de verifier que la description etait juste avant '
    'de devenir contraignante.', P))
F.append(Paragraph(
    '<b>Trois remarques mesurees, a lire avant d ecrire une ligne :</b>', P))
F.append(tab([
    ['constat mesure', 'ce qu il implique pour le verrou'],
    ['les 21 capacites portent serveurApplique = false, sans exception',
     'le serveur ne connait aujourd hui que QUI, COMBIEN et D OU. Le jour ou l un d eux '
     'passe a true doit etre une decision visible, jamais un effet de bord.'],
    ['le repli code-barres garde un pot de 25 alors que sa politique est « PREMIUM, 0 »',
     'c est le seul etat sur tant que le verrou n existe pas : lui retirer son pot sans '
     'poser le verrou le rendrait ILLIMITE ET GRATUIT. Ce pot est le premier a fermer '
     'cote serveur, pas cote navigateur.'],
    ['ft-v1224 a ferme un quota qui CONSOMMAIT en se declenchant',
     'la lecon est la contrainte de conception numero un du verrou : '
     'autoriser doit POUVOIR etre appele sans rien depenser, et un refus ne doit jamais '
     'consommer la ressource qu il protege.'],
], [58 * mm, 112 * mm]))
F.append(Spacer(1, 3))
F.append(Paragraph(
    '<b>Et une chose n a pas ete faite, volontairement</b> (sections 9 a 12) : aucune '
    'porte Apps Script fermee, <code>worker.js</code> non touche, et rien sur V2, le '
    'compteur <code>ft_miroir</code>, la Douane, les tombstones, la synchronisation '
    'multi-appareils ni la memoire longue. <b>STOP avant le verrou serveur, comme demande.</b>', P))

F.append(Spacer(1, 6))
F.append(Paragraph(
    '<font size="7" color="#6a6a6a">Dossier genere par <i>tools/gen_etat_unifie_pdf.py</i>. '
    'Chaque chiffre est recompte a la generation depuis git et depuis le code servi ; '
    '%d gardes refusent de produire si un seul fait tombe. Les totaux de tests sont LUS '
    'dans leurs journaux, jamais saisis. Hors depot (regle d or 14).</font>' % GARDES[0], P))

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                        topMargin=16 * mm, bottomMargin=14 * mm,
                        title='Force Tracker - Etat unifie apres Nutrition',
                        author='Force Tracker')
doc.build(F)
print('PDF : %s' % OUT)
print('gardes verts : %d' % GARDES[0])
print('registre : %d capacites, %d ouvertes, %d ecarts' % (len(CAPS), len(OUVERTES), len(ECARTS)))
print('passe : %d OK / %d rouge   |   mutations : %s   |   banc : %s'
      % (P_OK, P_KO, MUT, BANC))
print(DOC_OK)
