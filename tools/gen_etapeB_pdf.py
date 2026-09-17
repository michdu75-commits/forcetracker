#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2A2 — ETAPE B, RESULTAT REEL de la table `public.ft_comptes`. Hors depot (regle d'or #14).

[!!] CE DOCUMENT CITE UNE MESURE EXTERIEURE AU DEPOT (le tableau de bord Supabase, lu par
     Michel depuis son telephone). Ses gardes ne peuvent pas la recompter depuis le code
     servi. Ils font autre chose, et c'est le coeur du fichier : **chaque conclusion et
     chaque nombre du document sont RE-CALCULES depuis le resultat brut imprime plus bas.**
     Aucun chiffre n'est tape a la main dans le texte.

[!!] LES GARDES QUI COMPTENT LE PLUS SONT DES REFUS DE CONCLURE TROP LOIN :
     - « 8 lignes potentiellement anciennes » ne doit JAMAIS devenir « 8 blobs contiennent
       encore un jeton ou un code perso » ;
     - « RLS activee » ne doit JAMAIS devenir « personne ne peut lire » (les GRANT sont
       l'etape D) ;
     - les questions B-Q8, B-Q9 et B-Q10 doivent rester NON.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji ; entites decodees AVANT controle.
"""
import datetime as dt
import html
import os
import re
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
    SCRATCH, 'S2A2-ETAPE-B-FT-COMPTES-RESULTAT-REEL-16-09-2026.pdf')

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_commentaires(src):
    """Retire les commentaires, GARDE les chaines : un fait qui vit dans une chaine se
    mesure avec cet outil-la. (Lecon S2 : trois gardes de secrets lisaient un code prive
    de ses chaines, et un secret EST une chaine.)"""
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
SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]

# ═══════════════════════════════════════════════════════════════════════════════════════
# LE RESULTAT BRUT, TEL QUE MICHEL L'A RAPPORTE — la SOURCE de tout ce qui suit.
# ═══════════════════════════════════════════════════════════════════════════════════════
B = {
    'table': 'public.ft_comptes',
    'taille': '728 kB',
    'rls_activee': True,
    'lignes_exactes': 10,
    'emails_normalises_distincts': 10,
    'emails_non_normalises': 0,
    'updated_at_null': 0,
    'plus_ancienne': '2026-08-05T20:15:23.435471+00:00',
    'plus_recente': '2026-09-16T15:51:54.149659+00:00',
}
COLONNES = [
    ('email', 'text', 'NOT NULL', '-'),
    ('data', 'jsonb', 'NULL', '-'),
    ('updated_at', 'timestamptz', 'NOT NULL', 'now()'),
]
CONTRAINTES = [('ft_comptes_pkey', 'PRIMARY KEY', 'email')]
INDEX = [('ft_comptes_pkey', 'index UNIQUE porte par la cle primaire, sur email')]

# Comptage fait par Michel avec la date de deploiement mesuree dans Git
COMPTAGE = {'potentiellement_anciennes': 8, 'reecrites_apres': 2}

# ── DATES PROUVEES DANS GIT / GITHUB ACTIONS (pas dans un souvenir) ────────────────────
DEPLOIEMENTS = {
    # version servie : (commit, fin du deploiement Pages, numero du run)
    'ft-v1216': ('a0081b1e', '2026-09-16T08:38:19+00:00', 1175),   # S1 : le jeton apparait
    'ft-v1217': ('f3fb0e9d', '2026-09-16T10:07:19+00:00', 1178),   # S2-A : il disparait
}
NAISSANCE_MIROIR = '2026-08-04'   # ft-v762, jour ou sbMirror a ete branche


def _d(s):
    return dt.datetime.fromisoformat(s)


# ═══════════════════════════════════════════════════════════════════════════════════════
# [!!] CHAQUE NOMBRE DU DOCUMENT EST RECALCULE ICI, JAMAIS TAPE DANS LE TEXTE
# ═══════════════════════════════════════════════════════════════════════════════════════
N = B['lignes_exactes']
ANC = COMPTAGE['potentiellement_anciennes']
REC = COMPTAGE['reecrites_apres']
g(ANC + REC == N,
  'le comptage ne retombe pas sur le total : %d + %d != %d' % (ANC, REC, N))
g(B['emails_normalises_distincts'] == N,
  'le nombre d e-mails normalises distincts (%d) differe du nombre de lignes (%d) : la '
  'conclusion « aucune variante de casse » de ce document tombe'
  % (B['emails_normalises_distincts'], N))
g(B['emails_non_normalises'] == 0,
  'des e-mails ne sont pas normalises : ce document conclut le contraire')
g(B['updated_at_null'] == 0,
  'des updated_at sont NULL : le comptage par date de ce document aurait un angle mort')
g(B['rls_activee'] is True, 'la RLS mesuree n est plus activee : tout le paragraphe RLS tombe')

# la cle primaire, lue dans la mesure et non supposee
PK = [c for c in CONTRAINTES if c[1] == 'PRIMARY KEY']
g(len(PK) == 1 and PK[0][2] == 'email',
  'la cle primaire mesuree ne porte plus sur email : la preuve DIRECTE de l unicite '
  'annoncee par ce document tombe (et on retomberait sur la deduction de l etape A)')
g(any(n == PK[0][0] for n, _dfn in INDEX),
  'l index qui materialise la cle primaire (%s) n apparait plus dans la mesure' % PK[0][0])
COLS = {c[0]: c for c in COLONNES}
g(set(COLS) == {'email', 'data', 'updated_at'},
  'la liste des colonnes mesurees a change : ce document en decrit exactement trois')
g(COLS['updated_at'][1] == 'timestamptz',
  'updated_at n est plus un timestamptz : ce document affirme qu il porte son fuseau, '
  'donc que la comparaison avec l heure UTC de Git est licite')
g(COLS['email'][2] == 'NOT NULL', 'email n est plus NOT NULL')

# dates : coherence interne
g(_d(B['plus_ancienne']) < _d(B['plus_recente']),
  'la plus ancienne mise a jour n est pas anterieure a la plus recente')
g(_d(B['plus_ancienne']).date() >= dt.date.fromisoformat(NAISSANCE_MIROIR),
  'une ligne est ANTERIEURE a la naissance du miroir : le document devrait s en etonner '
  'au lieu de l ignorer')

# ── LA FENETRE DU JETON, CALCULEE ET NON RECOPIEE ──────────────────────────────────────
T_S1 = _d(DEPLOIEMENTS['ft-v1216'][1])
T_S2A = _d(DEPLOIEMENTS['ft-v1217'][1])
g(T_S1 < T_S2A,
  'le correctif S2-A serait anterieur a l apparition du jeton : la fenetre calculee par ce '
  'document n aurait aucun sens')
_delta = T_S2A - T_S1
FENETRE = '%dh%02d' % (_delta.seconds // 3600, (_delta.seconds % 3600) // 60)
g(_delta.days == 0 and _delta.seconds > 0, 'la fenetre du jeton n est plus mesurable en heures')
# [!!] et elle doit VENIR des deux dates, pas etre ecrite a la main : recalculee par un
# autre chemin (total_seconds) et comparee. Trouve par le controle negatif - sans ce garde,
# remplacer le calcul par une constante laissait tout le document parfaitement vert.
_min = int((T_S2A - T_S1).total_seconds() // 60)
g(FENETRE == '%dh%02d' % (_min // 60, _min % 60),
  'la fenetre du jeton annoncee (%s) n est pas celle que donnent les deux dates de '
  'deploiement (%dh%02d) : elle a ete ecrite a la main'
  % (FENETRE, _min // 60, _min % 60))
# combien de lignes tombent surement AVANT l'apparition du jeton ? -> non mesure, et c'est dit
g(_d(B['plus_ancienne']) < T_S1,
  'toutes les lignes seraient posterieures a S1 : le document affirme le contraire pour la '
  'plus ancienne')

# ── L'ETAT DU DEPOT QUE CE DOCUMENT SUPPOSE ────────────────────────────────────────────
g(re.match(r'^ft-v\d+$', VERSION or ''), 'la version servie n a pas pu etre lue dans sw.js')
g('p_email: email' in SB,
  'le client n envoie plus un p_email libre : ce document decrit V2 comme encore ouverte')
g('function _sbSansJustificatifs(' in SB,
  'le filet de S2-A a disparu : ce document decrit un etat ou la fuite FUTURE est fermee')
# ⭐ GARDE RETOURNEE LE 17/09/2026 (R30), PAS EFFACEE. Elle disait « aucun fichier SQL dans
#    le depot ». S2-B ouvre `supabase/migrations/` : le SQL versionne y est desormais LEGITIME.
#    L'invariant reel s'est precise — *aucun SQL EGARE hors du dossier versionne*. ⚠️ Et la dette
#    que ces dossiers decrivent reste VRAIE : `ft_comptes` et `ft_miroir`, creees a la main, ne
#    sont toujours pas versionnees (voir supabase/README.md).
SQLS = [f for _dd, _s, _f in os.walk(ROOT) for f in _f
        if f.endswith('.sql') and 'node_modules' not in _dd
        and os.path.join('supabase', 'migrations') not in _dd]
g(not SQLS,
  'des fichiers SQL sont apparus dans le depot (%s) : la dette « schema non versionne » '
  'decrite ici ne serait plus exacte' % ', '.join(SQLS[:3]))

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
                            fontSize=16, leading=19.5, textColor=ENCRE, spaceAfter=2),
    'sous': ParagraphStyle('s', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=8.6, leading=11.2, textColor=GRIS, spaceAfter=9),
    'h1': ParagraphStyle('h1', parent=_ss['Normal'], fontName='Helvetica-Bold',
                         fontSize=11, leading=13.2, textColor=ROUGE,
                         spaceBefore=10, spaceAfter=4),
    'p': ParagraphStyle('p', parent=_ss['Normal'], fontName='Helvetica',
                        fontSize=8.6, leading=11.8, textColor=ENCRE, spaceAfter=5),
    'petit': ParagraphStyle('pt', parent=_ss['Normal'], fontName='Helvetica',
                            fontSize=7.6, leading=10, textColor=GRIS, spaceAfter=4),
    'code': ParagraphStyle('cd', parent=_ss['Normal'], fontName='Courier',
                           fontSize=7, leading=9, textColor=ENCRE, spaceAfter=2),
    'cell': ParagraphStyle('c', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=7.8, leading=10, textColor=ENCRE),
    'cellg': ParagraphStyle('cg', parent=_ss['Normal'], fontName='Helvetica-Bold',
                            fontSize=7.8, leading=10, textColor=ENCRE),
}

TEXTES = []


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


C = '<font face="Courier" size="7.4">%s</font>'


def bloc_code(txt):
    lignes = [Paragraph(_v(html.escape(l).replace(' ', '&nbsp;')), ST['code'])
              for l in txt.split('\n')]
    t = Table([[lignes]], colWidths=[166 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F7F7F5')),
        ('BOX', (0, 0), (-1, -1), 0.4, TRAIT),
        ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]))
    return KeepTogether([t, Spacer(1, 5)])


def encadre(titre, corps_html, couleur=ROUGE):
    TEXTES.append(titre)
    TEXTES.append(corps_html)
    t = Table([[Paragraph(_v('<b>' + titre + '</b>'), ST['cell'])],
               [Paragraph(_v(corps_html), ST['cell'])]], colWidths=[166 * mm])
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
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 6)])


H = []
H.append(P('Etape B - la table ' + B['table'] + ', resultat reel', 'titre'))
H.append(P('Force Tracker - chantier S2-A2 (Supabase) - 16 septembre 2026 - base servie '
           + VERSION + ' - hors depot (regle d or #14) - ' + str(N) + ' lignes mesurees, '
           'aucune mutation', 'sous'))

H.append(encadre(
    'CE QUE CETTE ETAPE ETABLIT, ET CE QU ELLE NE PEUT PAS ETABLIR',
    'Elle mesure la <b>structure</b> de la table et l <b>age</b> de ses lignes. '
    '&gt;&gt; Elle ne dit <b>rien</b> du contenu des sauvegardes, et <b>rien</b> de qui a le '
    'droit de les lire. Ces deux questions restent entieres : la seconde est l etape D '
    '(les GRANT reels), et la premiere ne se repondra peut-etre jamais autrement qu en '
    'ouvrant les lignes une par une.', ORANGE))

# ── 1. LE RESULTAT BRUT ────────────────────────────────────────────────────────────────
H.append(P('1. Le resultat brut, tel que Michel l a rapporte', 'h1'))
H.append(bloc_code(
    'table                        : %s\n'
    'RLS activee                  : %s\n'
    'taille totale                : %s\n'
    'lignes exactes  count(*)     : %d\n'
    'e-mails normalises distincts : %d\n'
    'e-mails NON normalises       : %d\n'
    'plus ancienne updated_at     : %s\n'
    'plus recente   updated_at    : %s\n'
    'updated_at NULL              : %d'
    % (B['table'], 'true' if B['rls_activee'] else 'false', B['taille'], N,
       B['emails_normalises_distincts'], B['emails_non_normalises'],
       B['plus_ancienne'], B['plus_recente'], B['updated_at_null'])))

# ── 2. STRUCTURE ───────────────────────────────────────────────────────────────────────
H.append(P('2. Structure reelle - trois colonnes, pas une de plus', 'h1'))
H.append(tableau(
    ['colonne', 'type', 'nullable', 'defaut', 'ce que ca implique'],
    [['<b>email</b>', C % 'text', 'NOT NULL', '-',
      'c est la <b>cle</b> : voir 3'],
     ['<b>data</b>', C % 'jsonb', 'NULL', '-',
      'le blob entier de la sauvegarde, dans <b>une seule colonne</b> - donc rien ici ne '
      'permet de voir de l exterieur ce qu il porte'],
     ['<b>updated_at</b>', C % 'timestamptz', 'NOT NULL', C % 'now()',
      '&gt;&gt; le type porte le <b>fuseau</b>, et la mesure le confirme (les dates '
      'sortent en ' + (C % '+00:00') + ') : comparer ces dates a l heure UTC de Git est '
      'donc licite, sans conversion']],
    [24 * mm, 20 * mm, 18 * mm, 16 * mm, 88 * mm]))
H.append(P('&gt;&gt; <b>Aucune colonne d historique, aucune colonne d auteur, aucune '
           'colonne de version.</b> La table ne garde que <b>l etat courant</b> de chaque '
           'compte. C est coherent avec l etape A (la fonction fait un UPSERT et rien '
           'd autre), et ca ferme une inquietude : <b>il n existe pas de table d anciennes '
           'versions</b> ou les blobs d avant le correctif se seraient accumules.', 'p'))

# ── 3. CLE PRIMAIRE ET UNICITE ─────────────────────────────────────────────────────────
H.append(P('3. La cle primaire - et l unicite passe de DEDUITE a PROUVEE', 'h1'))
H.append(bloc_code('contrainte : %s\ntype       : %s\ncolonne    : %s\nindex      : %s'
                   % (PK[0][0], PK[0][1], PK[0][2], INDEX[0][0])))
H.append(P('A l etape A, l unicite de ' + (C % 'email') + ' etait <b>deduite</b> : '
           + (C % 'on conflict (email)') + ' exige une contrainte unique, sinon PostgreSQL '
           'refuserait l instruction. C etait solide, mais indirect. &gt;&gt; <b>L etape B '
           'la montre</b> : ' + (C % PK[0][0]) + ' est une <b>PRIMARY KEY sur '
           + PK[0][2] + '</b>, donc un index unique et ' + (C % 'NOT NULL') + '. '
           '<i>La deduction et la mesure disent la meme chose - c est le meilleur resultat '
           'possible pour un audit, et ce n etait pas garanti.</i>', 'p'))

# ── 4. VARIANTES D'E-MAIL ──────────────────────────────────────────────────────────────
H.append(P('4. Variantes d e-mail - la crainte tombe, mesuree', 'h1'))
H.append(encadre(
    'AUCUNE LIGNE HISTORIQUE A LA CASSE NON NORMALISEE',
    ('%d lignes, %d e-mails normalises distincts, %d e-mail non normalise. '
     % (N, B['emails_normalises_distincts'], B['emails_non_normalises']))
    + '&gt;&gt; Les trois nombres sont d accord : <b>il n existe pas deux lignes qui '
    'representeraient le meme compte sous deux orthographes</b> (' + (C % 'Michel@x.fr')
    + ' et ' + (C % 'michel@x.fr') + '), ni d espace parasite. <i>C etait le risque nomme '
    'avant la mesure : des lignes creees avant que ' + (C % 'lower(trim())') + ' existe, '
    'et qu aucun futur UPSERT normalise ne toucherait jamais. Elles n existent pas.</i>',
    VERT))

# ── 5. AGE DES LIGNES ──────────────────────────────────────────────────────────────────
H.append(P('5. L age des lignes - et la seule chose qu il prouve', 'h1'))
H.append(tableau(
    ['mesure', 'valeur', 'lecture'],
    [['plus ancienne ' + (C % 'updated_at'), C % B['plus_ancienne'],
      'la table vit depuis le lendemain de la naissance du miroir (' + NAISSANCE_MIROIR
      + ') - <b>coherent</b>, rien d anterieur, rien d inexplique'],
     ['plus recente ' + (C % 'updated_at'), C % B['plus_recente'],
      'posterieure au correctif : la table est <b>vivante</b>, des gens sauvegardent'],
     [(C % 'updated_at') + ' NULL', str(B['updated_at_null']),
      '&gt;&gt; aucun angle mort : <b>toute</b> ligne est datable, donc le comptage par '
      'date porte sur la totalite'],
     ['<b>lignes non reecrites depuis ' + DEPLOIEMENTS['ft-v1217'][1][:16] + '</b>',
      '<b>' + str(ANC) + ' / ' + str(N) + '</b>',
      'leur blob courant est celui d <b>avant</b> le correctif'],
     ['lignes reecrites apres', str(REC) + ' / ' + str(N),
      'blob <b>probablement</b> propre - voir l encadre ci-dessous']],
    [42 * mm, 40 * mm, 84 * mm]))

H.append(encadre(
    'LES DEUX PHRASES A NE PAS DIRE, ET POURQUOI',
    '&gt;&gt; <b>' + str(ANC) + ' lignes potentiellement anciennes</b> ne veut PAS dire '
    '<b>' + str(ANC) + ' blobs contiennent encore un jeton ou un code perso</b>. Cela veut '
    'dire exactement ceci : <b>' + str(ANC) + ' lignes n ont pas ete reecrites depuis le '
    'deploiement du correctif</b>. Le code perso n a jamais concerne que les comptes qui en '
    'ont <b>pose un</b>, et il est optionnel ; le jeton, lui, n a existe que pendant une '
    'fenetre etroite (voir 6).<br/>'
    '&gt;&gt; Et les <b>' + str(REC) + ' lignes reecrites</b> sont <b>probablement</b> '
    'propres, pas prouvees propres : l application est <i>cache-first</i>, donc un telephone '
    'a pu continuer a tourner sur l ancienne version un moment apres la mise en ligne. '
    '<i>Une date de deploiement borne le code servi, pas le code execute.</i>'))

# ── 6. LA FENETRE DU JETON ─────────────────────────────────────────────────────────────
H.append(P('6. Ce que B apporte de neuf : la fenetre du jeton se referme', 'h1'))
H.append(tableau(
    ['moment (UTC, prouve dans Git / Actions)', 'evenement', 'ce que le miroir recevait'],
    [[C % NAISSANCE_MIROIR, 'naissance du miroir (ft-v762)',
      'le <b>code perso</b> en clair, s il etait pose'],
     [C % DEPLOIEMENTS['ft-v1216'][1][:19], 'ft-v1216 (S1) en ligne, run #'
      + str(DEPLOIEMENTS['ft-v1216'][2]),
      '+ le <b>jeton brut</b>'],
     [C % DEPLOIEMENTS['ft-v1217'][1][:19], 'ft-v1217 (S2-A) en ligne, run #'
      + str(DEPLOIEMENTS['ft-v1217'][2]),
      '&gt;&gt; <b>plus rien</b> : ni jeton, ni code perso']],
    [46 * mm, 50 * mm, 70 * mm]))
H.append(P('&gt;&gt; <b>Le jeton n a donc pu entrer dans le miroir que pendant '
           + FENETRE + '</b> (' + DEPLOIEMENTS['ft-v1216'][1][11:19] + ' - '
           + DEPLOIEMENTS['ft-v1217'][1][11:19] + ' UTC le 16/09). Une ligne dont le '
           + (C % 'updated_at') + ' est <b>anterieur</b> a '
           + (C % DEPLOIEMENTS['ft-v1216'][1][:19]) + ' <b>ne peut pas</b> porter de jeton : '
           'il n existait dans aucune version servie. <i>C est une borne dure, et elle va '
           'dans le bon sens.</i> La borne haute, elle, reste floue (cache-first).', 'p'))
H.append(P('&gt;&gt; <b>Combien des ' + str(ANC) + ' tombent dans cette fenetre ?</b> '
           'Non mesure - il faut une requete de plus, d une ligne. Elle n a pas ete demandee '
           'ici pour ne pas melanger deux etapes. <i>Mais la reponse est bornee : au pire '
           + str(ANC) + ', et vraisemblablement beaucoup moins, ' + FENETRE + ' etant court.</i>',
           'p'))

# ── 7. TAILLE ET RLS ───────────────────────────────────────────────────────────────────
H.append(P('7. Taille et RLS - deux lectures a ne pas dramatiser', 'h1'))
H.append(P('<b>Taille : ' + B['taille'] + ' pour ' + str(N) + ' lignes.</b> Ce nombre '
           'compte la table, son index, le stockage deporte des gros ' + (C % 'jsonb') + ' et '
           'les versions mortes que PostgreSQL n a pas encore nettoyees. &gt;&gt; <b>Il ne '
           'faut pas le diviser par ' + str(N) + ' pour en tirer une taille de sauvegarde</b> : '
           'une table reecrite souvent est grosse sans que ses lignes le soient. '
           '<i>Rien d anormal, rien a en conclure.</i>', 'p'))
H.append(P('<b>RLS : activee.</b> C est tout ce que la mesure dit. &gt;&gt; <b>Elle ne dit '
           'PAS que personne ne peut lire la table</b> : la RLS ne s applique pas de la meme '
           'facon a tous les roles, et surtout elle ne remplace pas les GRANT. Ce qui '
           'autorise ou refuse vraiment une lecture se mesure aux etapes <b>C</b> (les '
           'policies) et <b>D</b> (les GRANT). <i>Conclure ici serait exactement l erreur que '
           'ce chantier essaie d eviter.</i>', 'p'))

# ── 8. LES 10 QUESTIONS ────────────────────────────────────────────────────────────────
H.append(P('8. Les reponses, avec leur preuve', 'h1'))
QB = [['B-Q1', 'email a-t-il reellement une contrainte / un index UNIQUE ?', '<b>OUI</b>',
       C % (PK[0][0] + ' - PRIMARY KEY sur ' + PK[0][2]) + ' : preuve <b>directe</b>, plus '
       'une deduction'],
      ['B-Q2', 'deux lignes au meme e-mail peuvent-elles coexister ?', '<b>NON</b>',
       'une cle primaire l interdit par construction'],
      ['B-Q3', 'des e-mails non deja ' + (C % 'lower(trim())') + ' ?', '<b>NON</b>',
       str(B['emails_non_normalises']) + ' ligne concernee, et '
       + str(B['emails_normalises_distincts']) + ' e-mails distincts pour ' + str(N)
       + ' lignes'],
      ['B-Q4', 'un blob courant unique par e-mail normalise ?', '<b>OUI</b>',
       'cle primaire + UPSERT de l etape A + aucune colonne d historique'],
      ['B-Q5', 'RLS activee ?', '<b>OUI</b>', C % 'relrowsecurity = true'],
      ['B-Q6', 'combien de lignes exactes ?', '<b>' + str(N) + '</b>',
       C % 'count(*)' + ', pas ' + (C % 'reltuples')],
      ['B-Q7', 'plus ancienne ' + (C % 'updated_at') + ' ?',
       '<b>' + B['plus_ancienne'][:10] + '</b>', C % B['plus_ancienne']],
      ['B-Q8', 'sait-on combien de blobs portent encore un jeton ou un code perso ?',
       '<b>NON</b>',
       '&gt;&gt; on sait seulement que <b>' + str(ANC) + '</b> lignes n ont pas ete '
       'reecrites. Le savoir imposerait d <b>ouvrir les blobs</b> - ce qui n a pas ete '
       'demande, et ne sera pas fait sans ton accord'],
      ['B-Q9', 'sait-on qui peut lire ' + (C % 'ft_comptes') + ' ?', '<b>NON</b>',
       'il reste C (policies), D (GRANT) et E'],
      ['B-Q10', 'peut-on decider purge / rotation ?', '<b>NON</b>',
       'l incertitude a <b>baisse</b> (pas de variante d e-mail, pas d historique cache, '
       'fenetre du jeton bornee a ' + FENETRE + ') mais le facteur decisif - <b>qui peut '
       'lire</b> - n est pas mesure']]
H.append(tableau(['#', 'question', 'reponse', 'la preuve'], QB,
                 [12 * mm, 50 * mm, 18 * mm, 86 * mm]))

# ── 9. CE QU'ON SAIT / CE QU'ON IGNORE ─────────────────────────────────────────────────
H.append(P('9. Ce qu on sait maintenant, et ce qu on ignore encore', 'h1'))
H.append(tableau(
    ['on le sait, et c est mesure', 'on l ignore encore'],
    [['une seule ligne par compte, prouvee par la cle primaire',
      '<b>qui peut lire la table</b> - le facteur decisif (C, D, E)'],
     ['aucune variante de casse a rattraper',
      'ce que les ' + str(ANC) + ' blobs contiennent <b>reellement</b>'],
     ['aucune table d historique : le passe ne s accumule pas',
      'combien des ' + str(ANC) + ' tombent dans la fenetre de ' + FENETRE
      + ' du jeton (une requete)'],
     ['toute ligne est datable (' + str(B['updated_at_null']) + ' date manquante)',
      'si ' + (C % 'ft_comptes') + ' est exposee par l API REST de Supabase'],
     ['la fenetre du jeton est bornee a ' + FENETRE + ', avec une borne basse <b>dure</b>',
      'les sauvegardes internes de Supabase - <b>non mesurables depuis le depot</b>']],
    [80 * mm, 86 * mm]))

H.append(P('<b>Prochaine etape proposee : C uniquement</b> - les policies RLS reelles de '
           + (C % 'ft_comptes') + '. Rien d autre, et surtout pas de conclusion sur les '
           'droits avant D.', 'p'))
H.append(P('Mesures faites par Michel dans le tableau de bord Supabase, depuis son telephone. '
           'Dates de deploiement lues dans GitHub Actions (runs #'
           + str(DEPLOIEMENTS['ft-v1216'][2]) + ' et #' + str(DEPLOIEMENTS['ft-v1217'][2])
           + '), pas dans un souvenir.', 'petit'))

# ── [!!] GARDES DE FIN : LE DOCUMENT NE DOIT PAS CONCLURE TROP LOIN ────────────────────
TOUT = ' '.join(TEXTES)
_bt = TOUT.lower()

# [!!] La fenetre est la PHRASE, et une question n est pas une affirmation.
# (Deux faux rouges deja payes : une fenetre en caracteres qui debordait sur le titre
# precedent, et un garde qui rougissait sur la question elle-meme.)
INTERDITS = [
    (r'contiennent encore|portent encore un jeton|contiennent un jeton',
     'le document AFFIRME que des blobs contiennent encore un jeton : la mesure ne dit que '
     '« pas reecrites »'),
    (r'personne ne peut lire|nul ne peut lire',
     'le document AFFIRME que personne ne peut lire la table : c est l etape D qui le dira'),
    (r'aucune purge n est necessaire|purge terminee',
     'le document AFFIRME qu aucune purge n est necessaire : rien ici ne permet de le dire'),
]
for _bloc in TEXTES:
    _b = _bloc.lower()
    for _mot, _msg in INTERDITS:
        for m in re.finditer(_mot, _b):
            deb = max(_b.rfind(c, 0, m.start()) for c in '.?!:') + 1
            fin = min([i for i in (_b.find(c, m.end()) for c in '.?!') if i != -1]
                      or [len(_b)])
            phrase = _b[deb:fin + 1]
            interrogative = phrase.rstrip().endswith('?')
            niee = re.search(r"\bne\b|\bn\b|\bpas\b|\bjamais\b|\bni\b|\bnon\b",
                             _b[deb:m.start()])
            g(interrogative or niee is not None, _msg)

# [!!] les trois refus de conclure se verifient dans LEUR ligne, pas « quelque part »
for _q in ('B-Q8', 'B-Q9', 'B-Q10'):
    _l = [r for r in QB if r[0] == _q]
    g(len(_l) == 1 and _l[0][2] == '<b>NON</b>',
      'la question %s ne repond plus NON : ce document conclurait plus loin que ce qu il a '
      'mesure' % _q)
_l5 = [r for r in QB if r[0] == 'B-Q5']
g(len(_l5) == 1 and _l5[0][2] == '<b>OUI</b>', 'la reponse RLS mesuree a change de camp')

# [!!] les nombres du texte doivent etre CEUX qui ont ete calcules
g(str(ANC) in _bt and str(N) in _bt,
  'le document ne porte plus les nombres mesures (%d anciennes sur %d)' % (ANC, N))
g(FENETRE.lower() in _bt,
  'la fenetre du jeton (%s) n apparait plus dans le document : elle est pourtant le seul '
  'apport neuf de cette etape' % FENETRE)
g('cache-first' in _bt,
  'le document ne dit plus que l app est cache-first : c est la raison pour laquelle les '
  'lignes reecrites ne sont que PROBABLEMENT propres')
g('reltuples' in _bt,
  'le document ne rappelle plus que le compte vient de count(*) et non de reltuples')

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Etape B - ft_comptes, resultat reel',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, %d lignes dont %d non reecrites, fenetre jeton %s)'
      % (OUT, VERSION, GARDES[0], N, ANC, FENETRE))
