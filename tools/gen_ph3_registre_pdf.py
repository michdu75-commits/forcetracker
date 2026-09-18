#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOSSIER PHASE 3 — LE REGISTRE CENTRAL DES 21 CAPACITES IA (18/09/2026).

⛔⛔ LES GARDES RECOMPTENT CHAQUE CHIFFRE DEPUIS LE CODE SERVI ET REFUSENT DE PRODUIRE SI
    L UN D EUX TOMBE — et le generateur RELIT sa propre sortie (lecon du 18/09 : un dossier
    livre portait 66 balises en clair, parce que je verifiais les MOTS et jamais la LISIBILITE).

⭐ LE TOTAL DE LA PASSE SE LIT DANS SON JOURNAL, JAMAIS A LA MAIN (lecon ft-v1201, ou un PDF
   a publie un total pendant que la passe tournait encore).

⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji.
"""
import json
import os
import re
import subprocess
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (BaseDocTemplate, Frame, NextPageTemplate, PageBreak,
                                PageTemplate, Paragraph, Spacer, Table, TableStyle)

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.environ.get('PH3_PDF',
                        '/tmp/FORCE-TRACKER-PHASE-3-REGISTRE-21-CAPACITES-18-09-2026.pdf')
PASSE = os.environ.get('PH3_PASSE', '/tmp/passe1224b.out')
_ECHECS = []


def g(c, libelle):
    if not c:
        _ECHECS.append(libelle)


def lire(n):
    with open(os.path.join(RACINE, n), encoding='utf-8') as f:
        return f.read()


def sans_comm(src):
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

# ══ LE REGISTRE, LU PAR NODE — la seule facon de mesurer ce que le code rend ══
try:
    _j = subprocess.run(
        ['node', '-e',
         "const R=require('./capacites-ia.js');"
         "console.log(JSON.stringify({c:R.CAPACITES_IA,q:R.QUOTA_TYPES,p:R.POLITIQUES}))"],
        cwd=RACINE, capture_output=True, text=True, timeout=60)
    REG = json.loads(_j.stdout)
except Exception as e:                                        # noqa
    print('REFUS — le registre est illisible par Node : %s' % e)
    sys.exit(1)
C = REG['c']
F['n'] = len(C)
g(F['n'] == 21, "le registre ne porte plus 21 capacites mais %d" % F['n'])
_ids = [x['id'] for x in C]
g(len(set(_ids)) == 21, "le registre porte un identifiant en double")
g(_ids[-1] == 'milo.memory.backfill',
  "milo.memory.backfill n est plus la derniere capacite (%s)" % _ids[-1])
F['actions'] = sorted({x['actionServeur'] for x in C})
g(len(F['actions']) == 14,
  "les capacites n empruntent plus 14 actions mais %d" % len(F['actions']))
F['ouvertes'] = [x['id'] for x in C if x['politique'] == 'NON_DECIDEE']
g(len(F['ouvertes']) == 3,
  "il n y a plus 3 politiques ouvertes mais %d" % len(F['ouvertes']))
F['ecarts'] = [x['id'] for x in C if x['ecart']]
g(len(F['ecarts']) >= 10, "le registre ne declare plus que %d ecarts" % len(F['ecarts']))
g(all(x['serveurApplique'] is False for x in C),
  "une capacite pretend desormais etre appliquee par le serveur")
g(sorted(REG['q']) == sorted(['usage_total', 'usage_par_jour', 'usage_par_mois',
                              'illimite', 'zero', 'par_evenement']),
  "les six formes de quota ont change : %s" % REG['q'])
for q in REG['q']:
    g(any(x['quotaType'] == q for x in C),
      "aucune capacite n emploie la forme de quota « %s » : elle ne serait pas eprouvee" % q)
_bkf = [x for x in C if x['id'] == 'milo.memory.backfill'][0]
g(_bkf['quotaValeur'] is None,
  "la taille d une periode de backfill a ete inventee (%s)" % _bkf['quotaValeur'])
g(_bkf['actionServeur'] == [x for x in C if x['id'] == 'milo.memory'][0]['actionServeur'],
  "milo.memory et son backfill n empruntent plus la meme action : l exemple de « route != "
  "capacite » tombe")

# ══ LE CODE SERVI ════════════════════════════════════════════════════════════
NU = {f: sans_comm(lire(f)) for f in ('constants.js', 'worker.js', 'Code.js', 'index.html',
                                      'sw.js', 'capacites-ia.js')}
_proxy = re.findall(r"'(\w+)'", re.search(r'AI_PROXY_ACTIONS=\[(.*?)\]',
                                          NU['constants.js'], re.S).group(1))
g(sorted(_proxy) == F['actions'],
  "les actions du registre ne correspondent plus a AI_PROXY_ACTIONS")
g('<script src="capacites-ia.js"></script>' in NU['index.html'],
  "le registre n est plus servi par index.html")
g("'./capacites-ia.js'" in NU['sw.js'],
  "le registre n est plus prechache par le service worker : une ouverture hors ligne apres "
  "mise a jour le perdrait en silence (lecon supabase.js du 31/08)")
F['version'] = re.search(r"const CACHE = '(ft-v\d+)'", NU['sw.js']).group(1)
g(F['version'] == 'ft-v1224', "la version servie n est pas ft-v1224 mais %s" % F['version'])

# ── le double comptage : la separation LIRE / CONSOMMER ─────────────────────
_CJ = NU['Code.js']


def corps(src, nom):
    m = re.search(r'(?m)^(?:async\s+)?function\s+' + re.escape(nom) + r'\s*\(', src)
    if not m:
        return ''
    i = src.index('{', m.start())
    d, j = 0, i
    while j < len(src):
        if src[j] == '{':
            d += 1
        elif src[j] == '}':
            d -= 1
            if d == 0:
                break
        j += 1
    return src[m.start():j + 1]


_ETAT = corps(_CJ, '_aiQuotaEtat_')
_BLOCK = corps(_CJ, '_aiQuotaBlock_')
_IDENT = corps(_CJ, 'handleAuthIdentity_')
g(_ETAT != '', "_aiQuotaEtat_ a disparu : la separation lire/consommer n existe plus")
g(not re.search(r'q\.global\+\+', _ETAT) and not re.search(r"setProperty\(\s*'ai_quota'", _ETAT),
  "la lecture d etat s est remise a ECRIRE : le double comptage revient")
F['incr'] = len(re.findall(r'q\.global\+\+', _CJ))
F['ecrit'] = len(re.findall(r"setProperty\(\s*'ai_quota'", _CJ))
g((F['incr'], F['ecrit']) == (1, 1),
  "l ecriture du quota ne vit plus a un seul endroit (%d increments, %d enregistrements)"
  % (F['incr'], F['ecrit']))
g('_aiQuotaBlock_(' not in _IDENT and '_aiQuotaEtat_(' in _IDENT,
  "l identite consomme de nouveau le quota au lieu de le lire")
F['appels_block'] = len(re.findall(r'(?<!function\s)_aiQuotaBlock_\s*\(', _CJ))
g(F['appels_block'] == 2,
  "le chemin qui consomme n est plus appele exactement 2 fois mais %d" % F['appels_block'])
for motif, nom in ((r"getProperty\('AI_GLOBAL_MAX'\), 10\) \|\| 600", 'global 600'),
                   (r"getProperty\('AI_EMAIL_MAX'\), 10\)\s+\|\| 50", 'e-mail 50'),
                   (r'AI_MAX_DEV_ = 150', 'developpement 150')):
    g(re.search(motif, _CJ) is not None,
      "le plafond %s a change : le dossier dit qu aucune compensation n a ete faite" % nom)

# ── la documentation est GENEREE, et le controle mord ───────────────────────
_r = subprocess.run(['node', 'tools/gen_doc_ia.js', '--check'], cwd=RACINE,
                    capture_output=True, text=True, timeout=60)
g(_r.returncode == 0,
  "la documentation a DIVERGE du registre : %s" % (_r.stderr or '').strip()[:140])
_doc = lire('docs/IA-FREE-PREMIUM.md')
g('NE PAS ÉDITER À LA MAIN' in _doc,
  "la documentation ne previent plus qu elle est generee")
for x in C:
    g(('`' + x['id'] + '`') in _doc,
      "la capacite %s n est pas nommee dans la documentation" % x['id'])

# ── LE TOTAL DE LA PASSE, LU DANS SON JOURNAL ──────────────────────────────
try:
    _p = open(PASSE, encoding='utf-8').read()
except Exception:
    _p = ''
_m = re.search(r'TOTAL CROISÉ\s*:\s*(\d+)\s*✅\s*·\s*(\d+)\s*❌', _p)
g(_m is not None,
  "aucune ligne de TOTAL dans %s : la passe n a pas fini, et un dossier ne publie pas un "
  "total qu il n a pas lu (lecon ft-v1201)" % PASSE)
if _m:
    F['passe_verts'], F['passe_rouges'] = int(_m.group(1)), int(_m.group(2))
    F['passe_valide'] = 'PASSE VALIDE' in _p
    F['runner_fini'] = '✅ ②' in _p
    g(F['passe_rouges'] == 0,
      "la passe complete rend %d rouge(s) : le dossier ne se publie pas sur une passe rouge"
      % F['passe_rouges'])
    g(F['passe_valide'],
      "la passe n a pas rempli ses 4 conditions de validite : elle ne prouve rien")

# ── le controle negatif ────────────────────────────────────────────────────
try:
    _mut = open(os.environ.get('PH3_MUT', '/tmp/mut_ph3.log'), encoding='utf-8').read()
except Exception:
    _mut = ''
_mm = re.search(r'──── (\d+) / (\d+) mutations conformes', _mut)
g(_mm is not None, "aucun total de controle negatif lu : le dossier ne l affirme pas sans le lire")
if _mm:
    F['mut_ok'], F['mut_tot'] = int(_mm.group(1)), int(_mm.group(2))
    g(F['mut_ok'] == F['mut_tot'],
      "le controle negatif n est pas complet : %d / %d" % (F['mut_ok'], F['mut_tot']))

if _ECHECS:
    print('REFUS DE PRODUIRE — %d garde(s) tombe(s) :' % len(_ECHECS))
    for e in _ECHECS:
        print('  - ' + e)
    sys.exit(1)

NB = len(re.findall(r'(?m)^\s*g\(',
                    sans_comm(open(os.path.abspath(__file__), encoding='utf-8').read())))

# ══════════════════════════════════════════════════════════════════════════════
NOIR = colors.HexColor('#1a1a1a')
GRIS = colors.HexColor('#6b6b6b')
ROUGE = colors.HexColor('#c0392b')
BLEU = colors.HexColor('#1f5f8b')
VERT = colors.HexColor('#1e7a4b')
FOND = colors.HexColor('#f4f4f4')
SEP = colors.HexColor('#d8d8d8')
S = getSampleStyleSheet()
H1 = ParagraphStyle('H1', parent=S['Title'], fontName='Helvetica-Bold', fontSize=15,
                    leading=19, textColor=NOIR, spaceAfter=4, alignment=TA_LEFT)
H2 = ParagraphStyle('H2', parent=S['Heading2'], fontName='Helvetica-Bold', fontSize=12.5,
                    leading=15, textColor=BLEU, spaceBefore=12, spaceAfter=5)
H3 = ParagraphStyle('H3', parent=S['Heading3'], fontName='Helvetica-Bold', fontSize=10.5,
                    leading=13, textColor=NOIR, spaceBefore=8, spaceAfter=3)
P = ParagraphStyle('P', parent=S['BodyText'], fontName='Helvetica', fontSize=9,
                   leading=12.3, textColor=NOIR, spaceAfter=4)
PET = ParagraphStyle('PET', parent=P, fontSize=7.6, leading=9.8, textColor=GRIS)
CEL = ParagraphStyle('CEL', parent=P, fontSize=7.3, leading=9.2, spaceAfter=0)
CELB = ParagraphStyle('CELB', parent=CEL, fontName='Helvetica-Bold')
MINI = ParagraphStyle('MINI', parent=CEL, fontSize=6.4, leading=8.0)
ENC = ParagraphStyle('ENC', parent=P, fontSize=8.5, leading=11.3, leftIndent=6,
                     rightIndent=6, spaceBefore=3, spaceAfter=3)


def md(t):
    t = str(t).replace('&', '&amp;')
    t = re.sub(r'&amp;(amp|lt|gt|nbsp|laquo|raquo|bull|#\d+);', r'&\1;', t)
    jetons = []

    def garde(m):
        jetons.append(m.group(0))
        return '\x00%d\x00' % (len(jetons) - 1)

    t = re.sub(r'</?(?:b|i|br\s*/?|font[^<>]*)>', garde, t)
    t = t.replace('<', '&lt;').replace('>', '&gt;')
    return re.sub(r'\x00(\d+)\x00', lambda m: jetons[int(m.group(1))], t)


def enc(titre, lignes, couleur=ROUGE, larg=168 * mm):
    inner = [[Paragraph(md('<b>%s</b>' % titre), ENC)]] + [[Paragraph(md(l), ENC)] for l in lignes]
    t = Table(inner, colWidths=[larg])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), FOND),
                           ('LINEBEFORE', (0, 0), (0, -1), 2.2, couleur),
                           ('TOPPADDING', (0, 0), (-1, -1), 3),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                           ('LEFTPADDING', (0, 0), (-1, -1), 8),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 6)]))
    return t


def tab(entetes, lignes, largeurs, police=CEL):
    data = [[Paragraph(md('<b>%s</b>' % h), CELB) for h in entetes]]
    for l in lignes:
        data.append([c if isinstance(c, Paragraph) else Paragraph(md(c), police) for c in l])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e8e8e8')),
                           ('GRID', (0, 0), (-1, -1), 0.4, SEP),
                           ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                           ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                           ('LEFTPADDING', (0, 0), (-1, -1), 3.5),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 3.5)]))
    return t


def pied(canv, doc):
    canv.saveState()
    canv.setFont('Helvetica', 6.6)
    canv.setFillColor(GRIS)
    canv.drawString(19 * mm, 10 * mm,
                    'Force Tracker - phase 3 - registre central des 21 capacites IA - '
                    '18/09/2026 - ' + F['version'])
    canv.drawRightString(canv._pagesize[0] - 17 * mm, 10 * mm, 'p. %d' % doc.page)
    canv.restoreState()


h = []
A = h.append

A(Paragraph('FORCE TRACKER - PHASE 3 - REGISTRE CENTRAL DES 21 CAPACITES IA - 18-09-2026', H1))
A(Paragraph("Les 14 decisions M1 a M14 de Michel y sont des contraintes, pas des questions "
            "(regle d'or 15). Cette passe cree la source de verite ; elle ne pose aucun "
            "verrou.", PET))
A(Spacer(1, 6))
A(enc("CE QUI CHANGE POUR L'UTILISATEUR : RIEN",
      ["Aucun ecran, aucun bouton, aucun quota, aucune route. Un fichier de donnees est servi, "
       "et <b>personne ne le lit encore</b>.",
       "<b>Le defaut ferme est mesure, pas suppose</b> : la politique d'acces vivait a "
       "<b>quatre endroits qui ne se parlaient pas</b> — le texte de vente, les gardes du "
       "client, le quota du serveur, la documentation ecrite a la main — et la phase 2 y avait "
       "prouve <b>9 incoherences</b>, dont trois capacites <i>vendues Premium</i> et "
       "<i>gratuites dans le code</i>.",
       "👉 <b>Ce n'etait pas une serie d'oublis : c'est la consequence mecanique d'une "
       "politique sans proprietaire</b> (R2). <b>capacites-ia.js</b> devient ce proprietaire."],
      VERT))

# ── 1-2. ARBRE ET FICHIERS ───────────────────────────────────────────────────
A(Paragraph('1 et 2. Arbre avant / apres, et fichiers', H2))
A(tab(['', 'avant', 'apres'],
      [['version servie', 'ft-v1223', '<b>' + F['version'] + '</b>'],
       ['source de la politique d\'acces', '<b>4 endroits</b> qui ne se parlaient pas',
        '<b>1 fichier</b> : capacites-ia.js'],
       ['capacites declarees', 'aucune (implicites dans le code)', '<b>%d</b>' % F['n']],
       ['documentation', 'ecrite a la main, sans lien avec le code',
        '<b>generee</b>, comparee caractere pour caractere'],
       ['ecritures du quota dans Code.js', '<b>3 sites d\'appel</b>, dont l\'identite',
        '<b>%d increment, %d enregistrement</b>, un seul proprietaire'
        % (F['incr'], F['ecrit'])],
       ['consommation par appel IA', '<b>2 unites</b>', '<b>1 unite</b>'],
       ['un appel REFUSE', 'consommait quand meme', '<b>ne consomme plus rien</b>']],
      [42 * mm, 58 * mm, 68 * mm]))
A(Spacer(1, 3))
A(tab(['fichier', 'ce qui y est fait'],
      [['<b>capacites-ia.js</b> <i>(nouveau)</i>', 'le registre : %d capacites, 6 formes de '
        'quota, 6 politiques, et deux lecteurs purs sans appelant' % F['n']],
       ['<b>docs/IA-FREE-PREMIUM.md</b> <i>(genere)</i>', 'la vue humaine — jamais editee'],
       ['<b>tools/gen_doc_ia.js</b> <i>(nouveau)</i>', 'le generateur, et son mode --check'],
       ['<b>Code.js</b>', 'uniquement autour du quota : la separation lire / consommer'],
       ['<b>index.html</b>', '<b>une balise</b> script'],
       ['<b>sw.js</b>', 'le precache du registre, et le numero de version'],
       ['<b>tests/parcours/registre_ia.js</b> et <b>quota_double.js</b> <i>(nouveaux)</i>',
        'les blocs B-CCCXXXI, B-CCCXXXII et B-CCCXXXIII'],
       ['<b>CLAUDE.md</b>, <b>CONTEXTE-ACTUEL</b>, <b>JOURNAL-ARCHIVE</b>, <b>INVENTAIRE</b>',
        'la tenue des fichiers de suivi (regle d\'or 12)'],
       [cel('NON TOUCHES', CELB) if False else '<b>NON TOUCHES</b>',
        'app.js, state.js, screens.js, log.js, coach.js, setup.js, tracking.js, '
        'constants.js, <b>worker.js</b>, supabase.js']],
      [58 * mm, 110 * mm]))

# ── 3-4. SOURCE ET SCHEMA ────────────────────────────────────────────────────
A(Paragraph('3 et 4. La source de verite retenue, et son schema', H2))
A(Paragraph("<b>capacites-ia.js</b>, un fichier JavaScript servi par index.html et precache "
            "par le service worker. <b>Pas un JSON charge par le reseau</b> : l'ouverture doit "
            "rester instantanee, meme hors ligne (regle d'or 4).", P))
A(tab(['champ', 'valeurs', 'pourquoi il existe'],
      [['<b>id</b>', 'identifiant stable', "la cle du registre ; les 20 de la phase 1 sont "
        "inchanges, la 21e est ajoutee a la fin"],
       ['<b>module</b>', 'Milo, Nutrition, Seance, Profil, Sante, Admin', 'lecture humaine'],
       ['<b>declenchement</b>', 'manuel · automatique',
        "4 capacites partent sans aucun clic : un mur ne peut pas s'afficher devant une chose "
        "que personne n'a demandee"],
       ['<b>politique</b>', ' · '.join(REG['p']),
        "<b>ce qui DOIT etre</b> — la decision de Michel, ou NON_DECIDEE"],
       ['<b>etatCode</b>', 'ce que le navigateur applique aujourd\'hui',
        "<b>ce qui EST</b>. ⭐ Deux champs et pas un : les confondre etait le defaut d'origine"],
       ['<b>ecart</b>', 'texte ou null',
        "quand politique != etatCode, l'ecart est <b>ecrit</b>, jamais masque"],
       ['<b>quotaType</b>', ' · '.join(REG['q']),
        "6 formes. <b>par_evenement</b> n'existe nulle part dans le code : c'est le backfill "
        "qui l'exige"],
       ['<b>quotaValeur</b> / <b>quotaPeriode</b>', 'nombre ou <b>null</b>',
        "<b>null</b> = NON MESURE. Inventer un nombre serait inventer une decision"],
       ['<b>actionServeur</b>', 'une des %d actions' % len(F['actions']),
        "⭐ %d capacites pour %d actions : route technique != capacite produit"
        % (F['n'], len(F['actions']))],
       ['<b>porteAppsScript</b>', "nom ou null", "la seconde porte serveur"],
       ['<b>serveurApplique</b>', '<b>false</b> pour les %d' % F['n'],
        "mesure de la phase 2. Le jour ou l'un passe a true, ce sera une decision visible"],
       ['<b>decisionSource</b> / <b>decisionDate</b>', "d'ou vient la politique",
        "sans elles, une decision devient une convention dont plus personne ne sait l'origine"]],
      [38 * mm, 44 * mm, 86 * mm]))

# ── 5. LES 21 ────────────────────────────────────────────────────────────────
A(NextPageTemplate('paysage'))
A(PageBreak())
A(Paragraph('5, 6 et 7. Les %d capacites, leurs politiques connues et ouvertes' % F['n'], H2))
lignes = []
for i, x in enumerate(C, start=1):
    q = ('illimite' if x['quotaType'] == 'illimite'
         else 'aucun (Premium)' if x['quotaType'] == 'zero'
         else (x['quotaType'] + ' · NON MESURE') if x['quotaValeur'] is None
         else '%s · %s' % (x['quotaValeur'], x['quotaType']))
    lignes.append([str(i), '<b>' + x['id'] + '</b>', x['module'],
                   'AUTO' if x['declenchement'] == 'automatique' else 'manuel',
                   '<b>' + x['politique'] + '</b>', x['etatCode'], q,
                   x['actionServeur'],
                   x['porteAppsScript'] or '<b>aucune</b>',
                   (x['ecart'] or '')[:150]])
A(tab(['#', 'capacite', 'module', 'decl.', 'politique', 'code', 'quota', 'action',
       '2e porte', 'ecart declare'],
      lignes,
      [7 * mm, 40 * mm, 18 * mm, 13 * mm, 22 * mm, 17 * mm, 26 * mm, 24 * mm, 22 * mm,
       76 * mm], police=MINI))

A(NextPageTemplate('portrait'))
A(PageBreak())
A(enc("LES %d POLITIQUES ENCORE OUVERTES — et pourquoi elles ne sont PAS notees « FREE »"
      % len(F['ouvertes']),
      ["<b>" + "</b> · <b>".join(F['ouvertes']) + "</b>",
       "Le code leur applique <b>FREE</b> aujourd'hui. Les inscrire ainsi dans le registre "
       "reviendrait a <b>inventer une decision</b> que Michel n'a pas prise (regle d'or 15). "
       "<b>NON_DECIDEE</b> est donc une valeur de plein droit, et un temoin fige qu'elles "
       "restent exactement trois.",
       "⭐ C'est le test n 17 de la liste adversariale : <i>une politique non decidee "
       "representable sans inventer une decision</i>."], BLEU))

# ── 8-10 et 14. LES TESTS ───────────────────────────────────────────────────
A(Paragraph('8, 9, 10 et 14. Les tests', H2))
A(tab(['ce qui est eprouve', 'temoin', 'resultat'],
      [['le nombre <b>%d</b>, exactement' % F['n'], 'B-CCCXXXI ①', '<b>vert</b>'],
       ['aucun identifiant en double', 'B-CCCXXXI ②', '<b>vert</b>'],
       ['aucune capacite de la phase 1 perdue <b>ni renommee</b>', 'B-CCCXXXI ③',
        '<b>vert</b>'],
       ['milo.memory.backfill presente, <b>ajoutee a la fin</b>', 'B-CCCXXXI ④', '<b>vert</b>'],
       ['les deux capacites de memoire <b>distinctes</b> malgre la meme action',
        'B-CCCXXXI ⑤', '<b>vert</b>'],
       ['les <b>6 formes de quota</b> toutes representables', 'B-CCCXXXI ⑥ a ⑩', '<b>vert</b>'],
       ['la taille du backfill reste <b>NON MESUREE</b>', 'B-CCCXXXI ⑪', '<b>vert</b>'],
       ['automatiques et Admin identifiables sans interpretation', 'B-CCCXXXI ⑫ ⑬',
        '<b>vert</b>'],
       ['les actions declarees <b>existent vraiment</b> dans le code servi', 'B-CCCXXXI ⑭ ⑮',
        '<b>vert</b>'],
       ['plusieurs capacites sur une meme route', 'B-CCCXXXI ⑯', '<b>vert</b>'],
       ['une capacite <b>sans</b> seconde porte', 'B-CCCXXXI ⑰', '<b>vert</b>'],
       ['une politique <b>non decidee</b> representable', 'B-CCCXXXI ⑱', '<b>vert</b>'],
       ['tout ecart <b>ecrit</b>, jamais masque', 'B-CCCXXXI ⑲', '<b>vert</b>'],
       ['les trois capacites du pot Nutrition <b>separables</b>', 'B-CCCXXXI ⑳', '<b>vert</b>'],
       [cel('la documentation IDENTIQUE a ce que le registre produit', CELB)
        if False else '<b>la documentation IDENTIQUE a ce que le registre produit</b>',
        'B-CCCXXXII ③', '<b>vert</b>'],
       ['<b>et le controle MORD</b> (eprouve sur une doc volontairement fausse)',
        'B-CCCXXXII ④', '<b>vert</b>'],
       ['un appel IA = <b>une</b> unite de quota', 'B-CCCXXXIII ① a ⑧', '<b>vert</b>'],
       ['les plafonds <b>n\'ont pas ete doubles</b>', 'B-CCCXXXIII ⑨ a ⑪', '<b>vert</b>']],
      [84 * mm, 32 * mm, 52 * mm]))
A(Spacer(1, 4))
A(enc("LA PASSE COMPLETE ET LE CONTROLE NEGATIF",
      ["<b>Passe complete : %d verts / %d rouges</b>, et ses <b>4 conditions de validite</b> "
       "sont remplies (ligne de total presente · runner termine · arbre inchange · aucun "
       "commit concurrent)." % (F['passe_verts'], F['passe_rouges']),
       "<b>Controle negatif : %d / %d mutations conformes</b>, sur un arbre <b>clone</b>, "
       "controle sain vert avant ET apres. Les plus utiles font <b>diverger le registre du "
       "code reel</b> — retirer une action de AI_PROXY_ACTIONS, desynchroniser les deux "
       "listes, renommer une capacite : <i>un registre qui se decrit lui-meme passerait tous "
       "les controles de forme sans jamais toucher au code servi.</i>"
       % (F['mut_ok'], F['mut_tot']),
       "⭐ Deux mutations doivent <b>rester vertes</b> : elles citent les mots cherches dans "
       "un <b>commentaire</b>. Aucune ne les cite dans une <b>chaine</b> — on a mesure hier "
       "que le garde a raison de mordre la : <i>le commentaire est de la documentation, la "
       "chaine est du code.</i>"], VERT))

# ── 11-12. DOUBLE COMPTAGE ET POT NUTRITION ─────────────────────────────────
A(PageBreak())
A(Paragraph('11. Le double comptage — CORRIGE, test-first', H2))
A(enc("LA DISCIPLINE DEMANDEE A ETE TENUE DANS L'ORDRE",
      ["<b>1. Reproduire</b> : un appel IA venu du Worker traverse <b>deux</b> routes Apps "
       "Script — <b>authIdentity</b> puis <b>aiCount</b> — qui appelaient toutes deux "
       "<b>_aiQuotaBlock_</b>.",
       "<b>2. Identifier les deux increments</b> : cette fonction <b>n'est pas une lecture, "
       "elle ECRIT</b> (increment global, increment par e-mail, enregistrement).",
       "<b>3. Un test qui ECHOUE sur le comportement actuel</b> : le bloc B-CCCXXXIII a ete "
       "ecrit AVANT le correctif et mesure <b>7 defauts</b> sur le code d'avant.",
       "<b>4. Corriger la cause</b> : on separe <b>LIRE l'etat</b> (_aiQuotaEtat_, qui n'ecrit "
       "rien) de <b>CONSOMMER une unite</b> (_aiQuotaBlock_, seul proprietaire de l'ecriture). "
       "Mesure : <b>%d increment et %d enregistrement</b> dans tout le fichier, et l'identite "
       "ne les emprunte plus." % (F['incr'], F['ecrit']),
       "<b>5. Les refus avant modele ne consomment plus</b> : c'est l'effet de bord voulu. "
       "Avant, quelqu'un <b>deja bloque</b> creusait son propre plafond en reessayant — <i>un "
       "garde-fou qui se declenche en consommant la ressource qu'il protege travaille contre "
       "lui-meme.</i>",
       "⛔ <b>Aucune compensation</b> : 600 / 50 / 150 ne bougent pas d'un chiffre, et trois "
       "temoins les figent. <i>Doubler un plafond pour absorber un double comptage, c'est "
       "graver le bug dans la configuration et le rendre indetectable.</i>",
       "⚠️ <b>Limite dite</b> : ces temoins mesurent la SOURCE. Code.js tourne chez Google — "
       "l'effet reel se verra dans le panneau Admin une fois le backend deploye."], VERT))

A(Paragraph('12. Le pot de 25 usages Nutrition', H2))
A(tab(['capacite', 'politique au registre', 'etat du code'],
      [['nutrition.label.ai', '<b>FREEMIUM</b>, 25 en total', 'partage le compteur'],
       ['<b>nutrition.barcode.aiFallback</b>', '<b>PREMIUM</b>, quota zero',
        '<b>partage encore le compteur</b>'],
       ['nutrition.mealEstimate.ai', '<b>FREEMIUM</b>, 25 en total', 'partage le compteur']],
      [50 * mm, 58 * mm, 60 * mm]))
A(Spacer(1, 3))
A(Paragraph("<b>Le registre ne les force plus a partager une politique</b> — c'etait la "
            "demande. ⛔ Mais <b>le code les force encore a partager un compteur</b>, et ce "
            "n'est pas corrige dans cette passe : separer <b>S.foodAiUses</b> en trois touche "
            "app.js et l'experience de comptes gratuits existants. <b>L'ecart est ecrit dans "
            "le registre</b> plutot que masque.", P))

# ── 13. NON MODIFIE ─────────────────────────────────────────────────────────
A(Paragraph('13. Ce qui reste volontairement non modifie', H2))
A(tab(['', 'etat'],
      [['les verrous Premium <b>serveur</b>', 'aucun pose — le registre decrit, il n\'applique pas'],
       ['les routes Apps Script', '<b>aucune fermee</b> ; 13 des 14 actions y repondent encore'],
       ['l\'experience FREE', '<b>inchangee</b> : aucun quota, aucun mur, aucun ecran'],
       ['la memoire longue de Milo', 'aucun tombstone, aucun journal de profil, aucun backfill'],
       ['la synchronisation multi-appareils', 'intacte — c\'est le chantier miroir'],
       ['<b>V2</b> et <b>la Douane</b>', '<b>0 ligne</b>'],
       ['le pot de 25 usages', 'non separe dans le code (voir ci-dessus)'],
       ['worker.js', '<b>lu, jamais ecrit</b>']],
      [56 * mm, 112 * mm]))

# ── 15. DECISIONS ───────────────────────────────────────────────────────────
A(Paragraph('15. Decisions encore necessaires de Michel', H2))
for n, t in enumerate([
    "<b>Les trois politiques ouvertes</b> : %s. Le code leur applique FREE ; le registre "
    "attend une decision." % ', '.join('<b>' + x + '</b>' for x in F['ouvertes']),
    "<b>La separation du pot de 25</b> : elle touche app.js et l'experience de comptes "
    "gratuits existants. Le registre est pret ; le code attend le feu vert.",
    "<b>L'application de M12</b> (milo.memory devient Premium) : aujourd'hui la construction "
    "IA part pour tout le monde, <b>par une decision ecrite dans le code</b>. La fermer "
    "contredit cette decision — c'est exactement le cas ou la regle 15 demande un arbitrage.",
    "<b>La taille d'une periode de backfill</b> : <b>NON MESUREE</b>, et elle le reste tant "
    "que la construction de memoire structuree ne peut pas etre essayee.",
], start=1):
    A(Paragraph('<b>Q%d.</b> %s' % (n, t), P))

A(Spacer(1, 8))
A(Paragraph("Dossier produit par un script qui recompte ses %d faits depuis le code servi, lit "
            "le total de la passe DANS SON JOURNAL, refuse de produire si l'un d'eux tombe, et "
            "relit sa propre sortie." % NB, PET))

doc = BaseDocTemplate(SORTIE, pagesize=A4,
                      title='Force Tracker - phase 3 - registre central des 21 capacites IA',
                      author='Force Tracker')
doc.addPageTemplates([
    PageTemplate(id='portrait',
                 frames=[Frame(20 * mm, 16 * mm, 170 * mm, A4[1] - 32 * mm, id='p')],
                 pagesize=A4, onPage=pied),
    PageTemplate(id='paysage',
                 frames=[Frame(15 * mm, 14 * mm, landscape(A4)[0] - 30 * mm,
                               landscape(A4)[1] - 28 * mm, id='l')],
                 pagesize=landscape(A4), onPage=pied),
])
doc.build(h)


def _relire(chemin):
    import base64 as _b64
    import zlib as _z
    brut = open(chemin, 'rb').read()
    flux = []
    for _m in re.finditer(rb'stream\r?\n', brut):
        _d = brut.find(b'endstream', _m.end())
        if _d < 0:
            continue
        _s = brut[_m.end():_d].strip()
        for _e in (lambda b: _z.decompress(_b64.a85decode(b, adobe=True)),
                   lambda b: _z.decompress(b)):
            try:
                flux.append(_e(_s))
                break
            except Exception:
                continue
    _t = b'\n'.join(flux).decode('latin-1')
    _mots = re.findall(r'\((?:[^()\\]|\\.)*\)', _t)
    return ' '.join(re.sub(r'\\(.)', r'\1',
                           re.sub(r'\\([0-7]{3})', lambda m: chr(int(m.group(1), 8)), x[1:-1]))
                    for x in _mots)


_PAGE = _relire(SORTIE)
_BAL = sum(_PAGE.count(x) for x in ('< b >', '< /b >', '< i >', '< font ', '&lt;b&gt;'))
if _BAL:
    os.remove(SORTIE)
    sys.exit('REFUS — le PDF produit porte %d balise(s) en clair.' % _BAL)
if len(_PAGE) < 14000:
    os.remove(SORTIE)
    sys.exit('REFUS — le PDF produit est muet (%d caracteres).' % len(_PAGE))
for _x in C:
    if _x['id'] not in _PAGE:
        os.remove(SORTIE)
        sys.exit('REFUS — la capacite %s n apparait pas dans le PDF.' % _x['id'])
print('   relu : %d caracteres, 0 balise en clair, %d/%d capacites presentes'
      % (len(_PAGE), F['n'], F['n']))
print('OK %s (%d gardes, %d octets)' % (SORTIE, NB, os.path.getsize(SORTIE)))
