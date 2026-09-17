#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2A2 — COMPTAGE des justificatifs restants dans ft_comptes. Hors depot (regle d'or #14).

[!!] LE RESULTAT BRUT EST BON, ET C'EST SA LECTURE QUI EST PIEGEUSE.
     7 lignes portent la CLE `authCode`. Cela ne veut PAS dire que 7 comptes ont pose un
     code personnel : `_authCode()` rend une chaine VIDE quand aucun code n'existe, donc
     la cle est ecrite dans TOUS les blobs de cette epoque, vide ou pleine.
     >> Ce generateur lit cette ligne dans state.js et refuse de produire si elle change.

[!!] LE JETON EST A ZERO, ET CE N'EST PAS UNE SURPRISE MAIS UNE COHERENCE : la fenetre
     d'exposition faisait 1h29, et aucune des lignes non reecrites ne tombe dedans.
     >> Consequence : la rotation du jeton S1 passe de « non obligatoire » a SANS OBJET
     pour le contenu courant de cette table.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji ; entites decodees AVANT controle.
"""
import html
import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether, PageBreak)

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
OUT = os.environ.get('FT_OUT') or os.path.join(
    SCRATCH, 'S2A2-COMPTAGE-JUSTIFICATIFS-RESTANTS-16-09-2026.pdf')

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_commentaires(src):
    out, i, n = [], 0, len(src)
    while i < n:
        c = src[i]
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i)
            i = n if j < 0 else j
        elif c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            i = n if j < 0 else j + 2
        elif c in '\'"`':
            j, q = i + 1, c
            while j < n and src[j] != q:
                j += 2 if src[j] == '\\' else 1
            out.append(src[i:j + 1])
            i = j + 1
        else:
            out.append(c)
            i += 1
    return ''.join(out)


SB = sans_commentaires(lire('supabase.js'))
STATE = sans_commentaires(lire('state.js'))
SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]

# ═══════════════════════════════════════════════════════════════════════════════════════
# LE RESULTAT BRUT — la SOURCE de tout ce qui suit
# ═══════════════════════════════════════════════════════════════════════════════════════
CPT = {'total': 10, 'lignes_avec_jeton': 0, 'lignes_avec_code': 7,
       'lignes_avec_les_deux': 0, 'lignes_avec_au_moins_un': 7, 'lignes_sans_blob': 0}
DECLENCHEURS = []          # le resultat rendait [] : aucun trigger non interne
# rappels mesures
ANCIENNES, RECENTES = 8, 2
FENETRE_JETON = '1h29'
T_S1 = '2026-09-16T08:38:19+00:00'
T_S2A = '2026-09-16T10:07:19+00:00'
NAISSANCE_MIROIR = '2026-08-04'

# ── coherence interne du comptage ──────────────────────────────────────────────────────
g(CPT['lignes_avec_au_moins_un']
  == CPT['lignes_avec_jeton'] + CPT['lignes_avec_code'] - CPT['lignes_avec_les_deux'],
  'le comptage ne se recoupe pas : %d au moins un, alors que %d + %d - %d = %d'
  % (CPT['lignes_avec_au_moins_un'], CPT['lignes_avec_jeton'], CPT['lignes_avec_code'],
     CPT['lignes_avec_les_deux'],
     CPT['lignes_avec_jeton'] + CPT['lignes_avec_code'] - CPT['lignes_avec_les_deux']))
g(CPT['lignes_avec_au_moins_un'] <= CPT['total'], 'plus de lignes concernees que de lignes')
g(CPT['lignes_sans_blob'] == 0,
  'des blobs sont NULL : ils ne seraient comptes NULLE PART, et les totaux de ce document '
  'ne seraient plus interpretables')
SANS_CLE = CPT['total'] - CPT['lignes_avec_au_moins_un']
g(SANS_CLE == 3, 'le nombre de lignes sans aucune cle a change (%d) : la section 4 de ce '
                 'document en tire une hypothese chiffree' % SANS_CLE)
JETON_ZERO = CPT['lignes_avec_jeton'] == 0
g(JETON_ZERO,
  'des lignes portent encore le jeton : ce document conclut que la rotation est SANS OBJET, '
  'ce qui serait alors FAUX')
CODE_RESTE = CPT['lignes_avec_code'] > 0
g(CODE_RESTE, 'plus aucune ligne ne porte la cle authCode : ce document decrit l inverse')
AUCUN_TRIGGER = len(DECLENCHEURS) == 0
g(AUCUN_TRIGGER,
  'des declencheurs existent : le nettoyage cible toucherait updated_at et brouillerait la '
  'mesure d age - ce document affirme le contraire')

# ── [!!] LA NUANCE CENTRALE EST LUE DANS LE CODE, PAS SUPPOSEE ────────────────────────
# Si _authCode() rendait null au lieu d'une chaine vide, la cle ne serait PAS ecrite pour
# les comptes sans code, et « 7 lignes » voudrait alors dire « 7 codes ». Toute la lecture
# de ce dossier bascule sur cette seule ligne.
VIDE_PAR_DEFAUT = bool(re.search(r"function _authCode\(\)\s*\{[^}]*getItem\('ft4_authcode'\)\s*\|\|\s*''",
                                 STATE))
g(VIDE_PAR_DEFAUT,
  '_authCode() ne rend plus une chaine VIDE par defaut : la nuance centrale de ce dossier '
  '(« cle presente n est pas code pose ») tombe, et 7 voudrait alors dire 7')
# et la cle etait bien ecrite sans condition avant le correctif
g('function _sbSansJustificatifs(' in SB,
  'le filet de S2-A a disparu : ce dossier decrit un etat ou plus aucune cle ne part')
_m = re.search(r'_SB_JUSTIFICATIFS\s*=\s*\[([^\]]+)\]', SB)
g(_m and 'authCode' in _m.group(1) and 'token' in _m.group(1),
  'la liste des justificatifs ne porte plus les deux cles comptees ici')
# la ligne de test ecrite par le bouton Admin : elle fonde l'hypothese du §4
_co = SB[SB.index('async function sbTest('):]
_co = _co[:_co.index('function sbEtat(')]
g("p_data:{test:true" in _co.replace(' ', ''),
  'le bouton Admin n ecrit plus un blob reduit : l hypothese chiffree de la section 4 '
  'repose dessus')
g(re.match(r'^ft-v\d+$', VERSION or ''), 'la version servie n a pas pu etre lue dans sw.js')
# ⭐ GARDE RETOURNEE LE 17/09/2026 (R30), PAS EFFACEE. Elle disait « aucun fichier SQL dans
#    le depot » — vrai tant que le schema Supabase etait cree a la main, et c'etait justement
#    la dette que les dossiers d'audit nommaient. S2-B ouvre `supabase/migrations/` : le SQL
#    versionne y est desormais LEGITIME. L'invariant reel n'a pas disparu, il s'est precise —
#    *aucun SQL EGARE hors du dossier versionne*. Une garde qu'on efface parce qu'elle gene
#    est une garde qu'on a contournee.
SQLS = [os.path.join(_dd, f) for _dd, _s, _f in os.walk(ROOT) for f in _f
        if f.endswith('.sql') and 'node_modules' not in _dd
        and os.path.join('supabase', 'migrations') not in _dd]
g(not SQLS, 'des fichiers SQL egares sont apparus hors de supabase/migrations (%s)'
  % ', '.join(SQLS[:3]))

# ═══════════════════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')
VERT = colors.HexColor('#1E7A46')
ORANGE = colors.HexColor('#B26A00')

_ss = getSampleStyleSheet()
ST = {
    'titre': ParagraphStyle('t', parent=_ss['Title'], fontName='Helvetica-Bold',
                            fontSize=15.5, leading=19, textColor=ENCRE, spaceAfter=2),
    'sous': ParagraphStyle('s', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=8.4, leading=11, textColor=GRIS, spaceAfter=9),
    'h1': ParagraphStyle('h1', parent=_ss['Normal'], fontName='Helvetica-Bold',
                         fontSize=10.6, leading=13, textColor=ROUGE,
                         spaceBefore=10, spaceAfter=4),
    'p': ParagraphStyle('p', parent=_ss['Normal'], fontName='Helvetica',
                        fontSize=8.4, leading=11.5, textColor=ENCRE, spaceAfter=5),
    'petit': ParagraphStyle('pt', parent=_ss['Normal'], fontName='Helvetica',
                            fontSize=7.4, leading=9.8, textColor=GRIS, spaceAfter=4),
    'code': ParagraphStyle('cd', parent=_ss['Normal'], fontName='Courier',
                           fontSize=7.1, leading=9, textColor=ENCRE, spaceAfter=2),
    'cell': ParagraphStyle('c', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=7.6, leading=9.8, textColor=ENCRE),
    'cellg': ParagraphStyle('cg', parent=_ss['Normal'], fontName='Helvetica-Bold',
                            fontSize=7.6, leading=9.8, textColor=ENCRE),
}

TEXTES, CODES = [], []


def _v(s):
    rendu = html.unescape(s)
    try:
        rendu.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE - hors cp1252 apres rendu : %r (dans %r)'
                         % (rendu[e.start:e.end], s[:70]))
    return s


def P(txt, st='p'):
    TEXTES.append(txt)
    return Paragraph(_v(txt), ST[st])


C = '<font face="Courier" size="7.2">%s</font>'


def bloc_code(txt):
    CODES.append(txt)
    lignes = [Paragraph(_v(html.escape(l).replace(' ', '&nbsp;')), ST['code'])
              for l in txt.split('\n')]
    t = Table([[lignes]], colWidths=[166 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F7F7F5')),
        ('BOX', (0, 0), (-1, -1), 0.4, TRAIT),
        ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]))
    return KeepTogether([t, Spacer(1, 5)])


def encadre(titre, corps, couleur=ROUGE):
    TEXTES.append(titre)
    TEXTES.append(corps)
    t = Table([[Paragraph(_v('<b>' + titre + '</b>'), ST['cell'])],
               [Paragraph(_v(corps), ST['cell'])]], colWidths=[166 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FOND),
        ('LINEBEFORE', (0, 0), (0, -1), 2.2, couleur),
        ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 6)])


def tableau(entetes, lignes, largeurs):
    TEXTES.extend(entetes)
    for r in lignes:
        TEXTES.extend(r)
    data = [[Paragraph(_v('<b>' + h + '</b>'), ST['cellg']) for h in entetes]]
    for r in lignes:
        data.append([Paragraph(_v(c), ST['cell']) for c in r])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), FOND),
        ('GRID', (0, 0), (-1, -1), 0.35, TRAIT),
        ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 4.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 6)])


OUI, NON, PART = '<b>OUI</b>', '<b>NON</b>', '<b>PARTIEL</b>'
SO = '<b>SANS OBJET</b>'

H = []
H.append(P('Comptage des justificatifs restants dans ' + (C % 'ft_comptes'), 'titre'))
H.append(P('Force Tracker - chantier S2-A2 (Supabase) - 16 septembre 2026 - base servie '
           + VERSION + ' - hors depot (regle d or #14) - lecture seule, aucune valeur '
           'affichee, aucune mutation', 'sous'))

H.append(encadre(
    'LES DEUX RESULTATS, ET CELUI QUI SE LIT DE TRAVERS',
    '&gt;&gt; <b>Jeton : ' + str(CPT['lignes_avec_jeton']) + ' ligne sur '
    + str(CPT['total']) + '.</b> Le jeton S1 n est <b>nulle part</b> dans le contenu courant '
    'de la table.<br/>'
    '&gt;&gt; <b>Cle ' + (C % 'authCode') + ' : ' + str(CPT['lignes_avec_code']) + ' lignes '
    'sur ' + str(CPT['total']) + '.</b> <b>Et ce nombre ne veut PAS dire « '
    + str(CPT['lignes_avec_code']) + ' comptes ont un code personnel »</b> - voir la '
    'section 3, c est le point le plus important de ce dossier.<br/>'
    '&gt;&gt; <b>Aucun declencheur</b> sur la table : un nettoyage cible ne toucherait pas '
    'aux dates.'))

# ── 1. LE BRUT ─────────────────────────────────────────────────────────────────────────
H.append(P('1. Le resultat brut', 'h1'))
H.append(bloc_code(
    'comptage :\n'
    '  total                    : %d\n'
    '  lignes_avec_jeton        : %d\n'
    '  lignes_avec_code         : %d\n'
    '  lignes_avec_les_deux     : %d\n'
    '  lignes_avec_au_moins_un  : %d\n'
    '  lignes_sans_blob         : %d\n'
    '\n'
    'declencheurs : []'
    % (CPT['total'], CPT['lignes_avec_jeton'], CPT['lignes_avec_code'],
       CPT['lignes_avec_les_deux'], CPT['lignes_avec_au_moins_un'],
       CPT['lignes_sans_blob'])))
H.append(P('La requete testait la <b>presence de noms de cles</b> ('
           + (C % 'jsonb_exists') + '), jamais un contenu. <b>Aucune valeur n est sortie de '
           'la base</b> : ni jeton, ni code, ni adresse, ni sauvegarde. Les nombres se '
           'recoupent : ' + str(CPT['lignes_avec_jeton']) + ' + '
           + str(CPT['lignes_avec_code']) + ' - ' + str(CPT['lignes_avec_les_deux']) + ' = '
           + str(CPT['lignes_avec_au_moins_un']) + ', et aucun blob n est vide.', 'petit'))

# ── 2. LE JETON ────────────────────────────────────────────────────────────────────────
H.append(P('2. Le jeton a zero - et ce n est pas de la chance, c est coherent', 'h1'))
H.append(P('Le jeton S1 n a existe dans une version servie qu entre ' + (C % T_S1[:19])
           + ' et ' + (C % T_S2A[:19]) + ', soit <b>' + FENETRE_JETON + '</b>. Pour qu une '
           'ligne le porte encore, il aurait fallu que sa <b>derniere</b> sauvegarde tombe '
           'dans cette fenetre. &gt;&gt; <b>Aucune des ' + str(ANCIENNES) + ' lignes non '
           'reecrites n y tombe</b> : elles sont toutes plus anciennes que '
           + (C % T_S1[11:19]) + '. <i>Et les ' + str(RECENTES) + ' lignes reecrites apres '
           'le correctif ne peuvent pas le porter par construction.</i>', 'p'))
H.append(encadre(
    'CONSEQUENCE : LA ROTATION DU JETON S1 PASSE DE « NON OBLIGATOIRE » A SANS OBJET',
    'Au dossier precedent, elle etait <b>non obligatoire</b> - un jugement, fonde sur une '
    'fenetre courte et l absence de lecture observee. &gt;&gt; Elle est maintenant '
    '<b>sans objet</b> : <b>il n y a rien a faire tourner</b>, le jeton n est present dans '
    'aucun blob courant. <i>C est le seul des trois sujets qui se ferme completement '
    'aujourd hui.</i><br/>'
    'Borne honnete : cela vaut pour le <b>contenu courant</b> de cette table. Les '
    'sauvegardes internes de la plateforme ne sont pas mesurables d ici, et une ligne a pu '
    'porter le jeton puis etre reecrite - <i>ce qui est justement ce qui a du se passer</i>.',
    VERT))

# ── 3. LA NUANCE ───────────────────────────────────────────────────────────────────────
H.append(P('3. Le 7 se lit de travers, et le code le prouve', 'h1'))
H.append(encadre(
    'UNE CLE PRESENTE N EST PAS UN CODE POSE',
    'La fonction qui fournit le code personnel rend une <b>chaine vide</b> quand aucun code '
    'n existe :', ORANGE))
H.append(bloc_code(
    "function _authCode(){ try{ return localStorage.getItem('ft4_authcode')||''; }\n"
    "                      catch(e){ return ''; } }"))
H.append(P('&gt;&gt; Donc la cle ' + (C % 'authCode') + ' etait ecrite dans <b>tous</b> les '
           'blobs de cette epoque - <b>pleine pour les comptes qui avaient pose un code, '
           'VIDE pour les autres</b>. <b>« ' + str(CPT['lignes_avec_code']) + ' lignes '
           'portent la cle » ne dit donc rien du nombre de codes reellement exposes</b> : '
           'c est une borne <b>haute</b>, et le vrai nombre peut etre n importe quoi entre '
           '0 et ' + str(CPT['lignes_avec_code']) + '.', 'p'))
H.append(P('<i>Sans cette ligne de code sous les yeux, on aurait annonce a Michel : '
           '</i>\u00ab <b>' + str(CPT['lignes_avec_code']) + ' personnes ont leur code '
           'personnel en clair dans la base</b> \u00bb<i> - une phrase fausse, alarmante, '
           'et qui aurait pu '
           'declencher une annonce de securite inutile. C est exactement le motif des trois '
           'affirmations non mesurees deja trouvees dans ce chantier, a ceci pres que '
           'celle-la aurait ete la mienne.</i>', 'p'))

H.append(encadre(
    'LA MESURE QUI LEVERAIT CE DOUTE - ET ELLE NE SORT TOUJOURS AUCUNE VALEUR',
    'Tester si la chaine est <b>vide</b> rend <b>un nombre</b>, pas un contenu. C est la '
    'meme categorie que le test de presence : un bit d information par ligne, agrege.',
    ORANGE))
H.append(bloc_code(
    "select count(*) filter (where coalesce(data->>'authCode','') <> '')\n"
    "         as codes_reellement_poses,\n"
    "       count(*) filter (where jsonb_exists(data, 'test'))\n"
    "         as lignes_de_test\n"
    "  from public.ft_comptes;"))
H.append(P('&gt;&gt; <b>Facultative.</b> Elle ne ferait passer aucune decision de NON a OUI '
           '- elle remplacerait une borne haute par un nombre. <i>A la main de Michel, et '
           'sans urgence.</i>', 'petit'))

H.append(PageBreak())

# ── 4. LES 3 LIGNES SANS CLE ───────────────────────────────────────────────────────────
H.append(P('4. Les ' + str(SANS_CLE) + ' lignes sans aucune cle - une hypothese que les '
           'chiffres soutiennent', 'h1'))
H.append(tableau(
    ['ligne', 'pourquoi elle n aurait aucune cle', 'combien'],
    [['reecrite apres le correctif', (C % 'ft-v1217') + ' a retire les deux cles du corps '
      'metier : ces blobs sont propres par construction', '<b>' + str(RECENTES) + '</b>'],
     ['ecrite par le bouton Admin', 'le bouton de test ecrit un blob reduit ('
      + (C % '{test, quand}') + ') qui n a jamais porte ni jeton ni code',
      '<b>1 ?</b>'],
     ['<b>total attendu</b>', 'si l hypothese tient', '<b>' + str(RECENTES + 1) + '</b>']],
    [46 * mm, 98 * mm, 22 * mm]))
H.append(P('&gt;&gt; <b>Mesure : ' + str(SANS_CLE) + '.</b> L addition tombe juste. '
           '<i>Ce n est pas une preuve</i> - les ' + str(SANS_CLE) + ' pourraient se '
           'repartir autrement - <b>mais si elle tient, elle repond a une question laissee '
           'ouverte au dossier E</b> : le bouton Admin a bien ete utilise, donc <b>l etape F '
           'a deja ete conduite</b>, et la cle publique a deja ecrit une ligne pour une '
           'adresse qui n est celle de personne. La requete facultative du 3 la trancherait '
           'aussi, par la meme occasion.', 'p'))

# ── 5. LES DECLENCHEURS ────────────────────────────────────────────────────────────────
H.append(P('5. Aucun declencheur - et c est ce qui rend le nettoyage propre', 'h1'))
H.append(P('La liste est <b>vide</b>. &gt;&gt; Donc ' + (C % 'updated_at') + ' n est ecrit '
           'que par les instructions qui le posent explicitement - et c est le cas de la '
           'fonction ' + (C % 'ft_miroir') + ', qui fait ' + (C % 'updated_at = now()')
           + '. <b>Un nettoyage cible qui ne toucherait que ' + (C % 'data') + ' laisserait '
           'donc les dates intactes</b>, et la mesure d age construite a l etape B resterait '
           'valable. <i>C etait l obstacle signale au dossier precedent : il n existe pas.</i>',
           'p'))

# ── 6. LES DECISIONS ───────────────────────────────────────────────────────────────────
H.append(P('6. Les decisions, reevaluees', 'h1'))
H.append(tableau(
    ['sujet', 'avant ce comptage', 'apres', 'pourquoi'],
    [['<b>purge</b> de lignes entieres', 'non recommandee', '<b>non recommandee</b>',
      'inchange : elle <b>detruirait une sauvegarde</b>. Le miroir est un filet, pas un '
      'journal'],
     ['<b>nettoyage cible</b> des deux cles', 'recommande par hygiene',
      '<b>recommande</b>, et plus facile',
      '&gt;&gt; ' + str(CPT['lignes_avec_code']) + ' lignes sont concernees, et <b>aucun '
      'declencheur</b> ne viendrait brouiller les dates. Il ne reste aucun obstacle '
      'technique'],
     ['<b>rotation du jeton S1</b>', 'non obligatoire', '&gt;&gt; ' + SO,
      '<b>' + str(CPT['lignes_avec_jeton']) + ' ligne concernee</b> : il n y a rien a faire '
      'tourner'],
     ['<b>changement des codes perso</b>', 'non', '<b>non</b>',
      'aucune lecture publique observee, et le nombre de codes <b>reellement</b> exposes '
      'n est pas connu - au plus ' + str(CPT['lignes_avec_code']) + ', possiblement bien '
      'moins. <i>Demander a des gens de changer quelque chose sur une borne haute serait '
      'inquieter sans proteger</i>']],
    [40 * mm, 32 * mm, 30 * mm, 64 * mm]))

# ── 7. CE QUE CA NE PROUVE PAS ─────────────────────────────────────────────────────────
H.append(P('7. Ce que ce comptage ne prouve pas', 'h1'))
H.append(encadre(
    'LES BORNES, ECRITES PLUTOT QUE SOUS-ENTENDUES',
    '&gt;&gt; « les ' + str(CPT['lignes_avec_code']) + ' lignes portent un code '
    'reel » - non : la cle peut etre vide (section 3).<br/>'
    '&gt;&gt; « aucune version ancienne n existe ailleurs » - les sauvegardes '
    'internes de la plateforme ne sont pas mesurables depuis le depot.<br/>'
    '&gt;&gt; « ces donnees n ont jamais ete lues » - non prouvable, dans les deux '
    'sens.<br/>'
    '&gt;&gt; « V2 est fermee » - <b>non</b> : ce comptage porte sur le CONTENU, '
    'V2 porte sur le droit d ECRIRE. Rien n a change de ce cote.', ORANGE))

# ── 8. LES REPONSES ────────────────────────────────────────────────────────────────────
H.append(P('8. Les reponses', 'h1'))
QQ = [['Q1', 'au moins un blob contient-il encore ' + (C % 'token') + ' ?', NON,
       '<b>' + str(CPT['lignes_avec_jeton']) + '</b> ligne'],
      ['Q2', 'au moins un blob contient-il encore la cle ' + (C % 'authCode') + ' ?', OUI,
       '<b>' + str(CPT['lignes_avec_code']) + '</b> lignes - <i>la CLE, pas forcement un '
       'code</i>'],
      ['Q3', 'combien contiennent les deux ?', '<b>' + str(CPT['lignes_avec_les_deux'])
       + '</b>', 'consequence directe de Q1'],
      ['Q4', 'combien en contiennent au moins un ?',
       '<b>' + str(CPT['lignes_avec_au_moins_un']) + '</b>',
       'sur ' + str(CPT['total']) + ' lignes'],
      ['Q5', 'une valeur sensible a-t-elle ete affichee ?', NON,
       'la requete ne teste que des <b>noms de cles</b>'],
      ['Q6', 'une mutation a-t-elle ete faite ?', NON, 'que des ' + (C % 'select')],
      ['Q7', 'une purge complete est-elle necessaire ?', NON,
       '&gt;&gt; et elle reste <b>deconseillee</b> : elle detruirait une sauvegarde'],
      ['Q8', 'un nettoyage cible est-il utile ?', OUI,
       'par hygiene, sans urgence - et <b>sans obstacle</b>, faute de declencheur'],
      ['Q9', 'la rotation du jeton S1 devient-elle necessaire ?', NON,
       '&gt;&gt; <b>' + SO + '</b> : ' + str(CPT['lignes_avec_jeton']) + ' ligne concernee'],
      ['Q10', 'le changement des codes perso devient-il necessaire ?', NON,
       'aucune lecture observee, et le nombre reel est <b>inconnu</b> - au plus '
       + str(CPT['lignes_avec_code'])],
      ['Q11', 'V2 est-elle fermee ?', NON,
       'ce comptage porte sur le contenu ; V2 est un droit d ecriture']]
H.append(tableau(['#', 'question', 'reponse', 'la preuve'], QQ,
                 [12 * mm, 58 * mm, 22 * mm, 74 * mm]))

# ── 9. LA SUITE ────────────────────────────────────────────────────────────────────────
H.append(P('9. La suite', 'h1'))
H.append(tableau(
    ['sujet', 'etat', 'cout'],
    [['<b>S2-B : fermer V2</b>', '&gt;&gt; <b>le seul vrai trou restant</b>',
      'un choix d architecture'],
     ['nettoyage cible des ' + str(CPT['lignes_avec_code']) + ' lignes', 'recommande, non '
      'urgent', 'une instruction, a decider'],
     ['retirer ' + (C % 'SELECT') + ' / ' + (C % 'DELETE') + ' / ' + (C % 'TRUNCATE')
      + ' a la cle publique', 'recommande', 'des ' + (C % 'REVOKE') + ', a decider'],
     ['compter les codes <b>reellement</b> poses', 'facultatif',
      'une requete, 20 secondes'],
     ['etape F', 'facultative, probablement deja conduite', 'une ecriture en production']],
    [76 * mm, 52 * mm, 38 * mm]))
H.append(P('Mesure conduite par Michel le 16/09/2026 dans le tableau de bord Supabase, en '
           'lecture seule. <b>Aucune valeur n a ete lue, aucune mutation n a ete faite</b> - '
           'ni par lui, ni par moi.', 'petit'))

# ── [!!] GARDES DE FIN ─────────────────────────────────────────────────────────────────
TOUT = ' '.join(TEXTES)
_bt = TOUT.lower()
_rendu = (TOUT + ' ' + ' '.join(CODES)).lower()

g('sb_publishable' not in _rendu and 'supabase.co' not in _rendu,
  'une cle ou l URL du projet apparait dans le document')
for _i in ('select data', 'select email', 'select=data', 'select=email'):
    g(_i not in _rendu, 'le document propose de lire « %s »' % _i)
# [!!] toute expression qui TOUCHE une valeur doit la comparer au VIDE, jamais la rendre
for m in re.finditer(r"data->>'[a-z]+'", _rendu, re.I):
    _fin = _rendu[m.end():m.end() + 30]
    g("<> ''" in _fin or "= ''" in _fin,
      'une expression extrait une valeur sans la comparer au vide : toute requete proposee '
      'ici doit rendre un NOMBRE, jamais un contenu')

INTERDITS = [
    (r'\d+ comptes ont un code|\d+ personnes ont leur code|\d+ codes personnels exposes',
     'le document annonce un nombre de CODES a partir d un nombre de CLES : c est '
     'precisement l erreur que la section 3 existe pour empecher'),
    (r'v2 est fermee|v2 est corrigee', 'le document AFFIRME que V2 est fermee'),
    (r'les blobs sont propres|aucune version ancienne',
     'le document AFFIRME que les blobs anciens sont propres'),
    (r'il faut purger|la purge est necessaire',
     'le document RECOMMANDE une purge : elle detruirait une sauvegarde'),
    (r'la rotation est necessaire|il faut faire tourner le jeton',
     'le document rend la rotation necessaire : il n y a rien a faire tourner'),
]


def _mentionnee(txt, i):
    o = txt.rfind('«', 0, i)
    return o >= 0 and txt.find('»', o) > i


for _bloc in TEXTES:
    _b = _bloc.lower()
    for _mot, _msg in INTERDITS:
        for m in re.finditer(_mot, _b):
            deb = max([_b.rfind(c, 0, m.start()) for c in '.?!']
                      + [_b.rfind('<br/>', 0, m.start()) + 4]) + 1
            fin = min([i for i in (_b.find(c, m.end()) for c in '.?!') if i != -1]
                      or [len(_b)])
            interro = _b[deb:fin + 1].rstrip().endswith('?')
            citee = _mentionnee(_b, m.start())
            niee = re.search(r"\bne\b|\bn\b|\bpas\b|\bjamais\b|\bni\b|\bnon\b|\bsi\b",
                             _b[deb:m.start()])
            g(interro or citee or niee is not None, _msg)

for _q, _att in (('Q1', NON), ('Q2', OUI), ('Q5', NON), ('Q6', NON), ('Q7', NON),
                 ('Q8', OUI), ('Q9', NON), ('Q10', NON), ('Q11', NON)):
    _l = [r for r in QQ if r[0] == _q]
    g(len(_l) == 1 and _l[0][2] == _att,
      'la question %s ne repond plus %s' % (_q, re.sub('<[^>]+>', '', _att)))
g(len([r for r in QQ if r[0] in ('Q7', 'Q8', 'Q9', 'Q10')]) == 4,
  'les quatre decisions ont ete fondues : purge, nettoyage, rotation et codes restent '
  'separes')

for _mot, _pourquoi in (
        ('chaine vide', 'c est ce qui rend « cle presente » different de « code pose »'),
        ('borne', 'c est le statut exact du nombre 7'),
        ('sans objet', 'c est le nouvel etat de la rotation'),
        ('declencheur', 'c est ce qui rend le nettoyage propre'),
        ('detruirait une sauvegarde', 'c est pourquoi la purge reste ecartee'),
        ('_authcode', 'la nuance centrale se lit dans cette fonction')):
    # [!!] sur TOUT ce qui est rendu, prose ET blocs de code : _authCode() vit
    # legitimement dans l'encadre de code, et un garde qui ne lit que la prose
    # rougissait donc sur un document parfaitement complet.
    g(_mot in _rendu, 'le dossier ne parle plus de « %s » : %s' % (_mot, _pourquoi))

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Comptage des justificatifs restants',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, jeton %d, cle authCode %d/%d, sans cle %d, declencheurs %d, '
      'rotation SANS OBJET)'
      % (OUT, VERSION, GARDES[0], CPT['lignes_avec_jeton'], CPT['lignes_avec_code'],
         CPT['total'], SANS_CLE, len(DECLENCHEURS)))
