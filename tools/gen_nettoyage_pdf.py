#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2A2 — NETTOYAGE CIBLE des justificatifs dans ft_comptes. Hors depot (regle d'or #14).

[!!] C'EST LA PREMIERE MUTATION DE TOUT LE CHANTIER S2, ET ELLE EST LA DERNIERE ETAPE
     DE CONTENU. Six mesures en lecture seule l'ont precedee ; celle-ci ecrit.

[!!] LA PREUVE QUI COMPTE N'EST PAS « authCode = 0 », C'EST `updated_at_min` INCHANGE.
     La plus ancienne ligne (05/08) etait forcement parmi les 7 visees. Si l'UPDATE avait
     touche les dates, ce minimum aurait saute a aujourd'hui. Il est identique A LA
     MICROSECONDE : l'anciennete mesuree a l'etape B survit intacte.

[!!] ET UNE HONNETETE SUR L'AUTORISATION : Michel n'a pas ecrit le mot « GO ». Il a fait
     mieux - il a execute lui-meme l'instruction. >> Ce generateur refuse de decrire un
     GO litteral qui n'a pas ete donne : l'autorisation est un ACTE, et le document le dit
     ainsi. *Un dossier qui invente une formalite pour avoir l'air en regle est pire qu'un
     dossier qui decrit ce qui s'est reellement passe.*

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
    SCRATCH, 'S2A2-NETTOYAGE-CIBLE-JUSTIFICATIFS-17-09-2026.pdf')

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
SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]

# ═══════════════════════════════════════════════════════════════════════════════════════
# LES DEUX MESURES BRUTES — la SOURCE de tout ce qui suit
# ═══════════════════════════════════════════════════════════════════════════════════════
AVANT = {'total': 10, 'token': 0, 'authcode': 7, 'non_vides': 2, 'vides': 5,
         'visees': 7, 'objets': 10,
         'min': '2026-08-05 20:15:23.435471+00',
         'max': '2026-09-17 06:49:20.372587+00'}
APRES = {'total': 10, 'token': 0, 'authcode': 0, 'non_vides': 0, 'objets': 10,
         'min': '2026-08-05 20:15:23.435471+00',
         'max': '2026-09-17 06:49:20.372587+00'}
SQL = ("update public.ft_comptes\n"
       "   set data = data - 'token' - 'authCode'\n"
       " where jsonb_exists(data, 'token')\n"
       "    or jsonb_exists(data, 'authCode');")
REPONSE_UPDATE = 'Success. No rows returned'
# [!!] L'AUTORISATION EST UN ACTE, PAS UN MOT. Voir la docstring.
GO_LITTERAL = False
EXECUTE_PAR = 'Michel'

# ── coherence du preflight avec les mesures connues ───────────────────────────────────
CONNU = {'total': 10, 'token': 0, 'authcode': 7, 'non_vides': 2, 'vides': 5}
for _k, _v in CONNU.items():
    g(AVANT[_k] == _v,
      'le preflight divergeait sur « %s » (%d au lieu de %d) : la mutation n aurait PAS du '
      'avoir lieu, et ce dossier decrit le contraire' % (_k, AVANT[_k], _v))
g(AVANT['non_vides'] + AVANT['vides'] == AVANT['authcode'],
  'le preflight ne se recoupe pas : %d + %d != %d'
  % (AVANT['non_vides'], AVANT['vides'], AVANT['authcode']))
g(AVANT['visees'] == AVANT['authcode'] + AVANT['token'],
  'le nombre de lignes visees ne correspond pas aux lignes portant une cle')
g(AVANT['objets'] == AVANT['total'],
  'tous les blobs n etaient pas des objets JSON : l operateur « - » aurait echoue')

# ── ce que la mutation a fait, RE-DERIVE des deux mesures ─────────────────────────────
TOUCHEES = AVANT['visees']
g(APRES['authcode'] == 0 and APRES['token'] == 0,
  'une cle subsiste apres la mutation : ce dossier conclut le contraire')
g(APRES['non_vides'] == 0, 'un authCode non vide subsiste')
g(APRES['total'] == AVANT['total'],
  'le nombre de lignes a change (%d -> %d) : une sauvegarde aurait ete supprimee, ce qui '
  'est exactement ce que ce chantier refusait' % (AVANT['total'], APRES['total']))
g(APRES['objets'] == AVANT['objets'],
  'un blob n est plus un objet JSON apres la mutation')
# ⭐ LA PREUVE TRANCHANTE
g(APRES['min'] == AVANT['min'],
  'updated_at_min a bouge (%s -> %s) : l anciennete mesuree a l etape B serait detruite, et '
  'c est LA preuve que ce dossier avance' % (AVANT['min'], APRES['min']))
DATES_IDENTIQUES = (APRES['min'] == AVANT['min']) and (APRES['max'] == AVANT['max'])
g(DATES_IDENTIQUES,
  'les bornes de date ne sont pas strictement identiques : le document doit alors expliquer '
  'laquelle a bouge et pourquoi, au lieu d annoncer « inchangees »')
# la plus ancienne ligne est bien anterieure au correctif : elle etait forcement visee
g(AVANT['min'] < '2026-09-16', 'la plus ancienne ligne ne precede plus le correctif')
g(REPONSE_UPDATE.lower().startswith('success'),
  'l instruction n a pas reussi : ce dossier decrit une mutation aboutie')
# le SQL cite est bien celui qui a ete presente
for _f in ("data - 'token' - 'authCode'", "jsonb_exists(data, 'token')",
           "jsonb_exists(data, 'authCode')"):
    g(_f in SQL, 'le SQL cite ne porte plus « %s »' % _f)
for _interdit in ('delete', 'truncate', 'insert', 'drop', 'grant', 'revoke', 'policy'):
    g(re.search(r'\b' + _interdit + r'\b', SQL, re.I) is None,
      'le SQL cite contient « %s » : ce dossier affirme qu une SEULE instruction de mise a '
      'jour a ete executee' % _interdit)
g(SQL.lower().count('update') == 1, 'le SQL cite porte plus d une instruction de mise a jour')
g('updated_at' not in SQL,
  'le SQL cite mentionne updated_at : il ne doit pas y toucher, c est tout l enjeu')

# ── l'etat du depot ───────────────────────────────────────────────────────────────────
g('p_email: email' in SB,
  'le client n envoie plus un p_email libre : V2 serait deja fermee, et ce dossier dit le '
  'contraire')
g('function _sbSansJustificatifs(' in SB,
  'le filet de S2-A a disparu : sans lui, les cles reviendraient a la prochaine sauvegarde '
  'et ce nettoyage serait sans effet durable')
_m = re.search(r'_SB_JUSTIFICATIFS\s*=\s*\[([^\]]+)\]', SB)
g(_m and 'token' in _m.group(1) and 'authCode' in _m.group(1),
  'la liste des justificatifs ne porte plus les deux cles nettoyees ici')
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


OUI, NON = '<b>OUI</b>', '<b>NON</b>'

H = []
H.append(P('Nettoyage cible des justificatifs dans ' + (C % 'ft_comptes'), 'titre'))
H.append(P('Force Tracker - chantier S2-A2 (Supabase) - 17 septembre 2026 - base servie '
           + VERSION + ' - hors depot (regle d or #14) - <b>une seule instruction de mise a '
           'jour, executee par ' + EXECUTE_PAR + '</b>', 'sous'))

H.append(encadre(
    'LE RESULTAT, ET LA PREUVE QUI COMPTE VRAIMENT',
    '&gt;&gt; <b>' + str(TOUCHEES) + ' lignes nettoyees</b> sur ' + str(AVANT['total'])
    + '. Les cles ' + (C % 'token') + ' et ' + (C % 'authCode') + ' ont disparu du contenu '
    'courant : <b>' + str(AVANT['authcode']) + ' -&gt; 0</b>, dont <b>'
    + str(AVANT['non_vides']) + ' codes reels -&gt; 0</b>.<br/>'
    '&gt;&gt; <b>Aucune ligne supprimee</b> : ' + str(APRES['total']) + ' avant, '
    + str(APRES['total']) + ' apres, et les ' + str(APRES['objets']) + ' blobs sont '
    'toujours des objets JSON.<br/>'
    '&gt;&gt; <b>Et la preuve qui compte n est pas le zero, c est la DATE.</b> La plus '
    'ancienne ligne (' + AVANT['min'][:10] + ') etait forcement parmi les '
    + str(TOUCHEES) + ' visees. Si la mise a jour avait touche ' + (C % 'updated_at')
    + ', ce minimum aurait saute a aujourd hui. <b>Il est identique a la microseconde.</b> '
    '<i>L anciennete mesuree a l etape B survit intacte.</i>', VERT))

# ── 1. AVANT / APRES ───────────────────────────────────────────────────────────────────
H.append(P('1. Avant / apres', 'h1'))
H.append(tableau(
    ['mesure', 'avant', 'apres', 'lecture'],
    [['total de lignes', str(AVANT['total']), '<b>' + str(APRES['total']) + '</b>',
      '&gt;&gt; <b>aucune sauvegarde supprimee</b>'],
     ['lignes avec ' + (C % 'token'), str(AVANT['token']),
      '<b>' + str(APRES['token']) + '</b>',
      'deja a zero - le retrait est garde pour rendre l operation <b>idempotente</b>'],
     ['lignes avec ' + (C % 'authCode'), str(AVANT['authcode']),
      '<b>' + str(APRES['authcode']) + '</b>', 'les ' + str(TOUCHEES) + ' lignes visees'],
     ['dont codes <b>reellement</b> poses', str(AVANT['non_vides']),
      '<b>' + str(APRES['non_vides']) + '</b>',
      '&gt;&gt; <b>les deux seuls secrets reels sont partis</b>'],
     ['blobs qui sont des objets JSON', str(AVANT['objets']),
      '<b>' + str(APRES['objets']) + '</b>', 'aucun blob abime'],
     ['<b>' + (C % 'updated_at_min') + '</b>', C % AVANT['min'][:26],
      '<b>' + (C % APRES['min'][:26]) + '</b>',
      '&gt;&gt; <b>identique</b> - la preuve tranchante'],
     [C % 'updated_at_max', C % AVANT['max'][:26], C % APRES['max'][:26],
      'identique aussi']],
    [44 * mm, 36 * mm, 36 * mm, 50 * mm]))

# ── 2. LE DEROULE ──────────────────────────────────────────────────────────────────────
H.append(P('2. Le deroule, dans l ordre', 'h1'))
H.append(tableau(
    ['etape', 'ce qui a ete fait', 'resultat'],
    [['<b>1. preflight</b>', 'sept compteurs relus en lecture seule juste avant',
      '&gt;&gt; <b>les sept correspondaient</b> aux mesures des deux jours precedents. '
      '<i>Une seule divergence aurait arrete la passe</i>'],
     ['<b>2. bornes de date</b>', 'relevees avant, pour pouvoir comparer apres',
      C % (AVANT['min'][:19] + ' / ' + AVANT['max'][:19])],
     ['<b>3. presentation</b>', 'lignes touchees, ce qui part, ce qui reste, le SQL au '
      'caractere pres', 'soumis a Michel <b>avant</b> toute execution'],
     ['<b>4. execution</b>', '&gt;&gt; <b>par Michel lui-meme</b>, dans son tableau de bord',
      C % REPONSE_UPDATE],
     ['<b>5. controle</b>', 'les memes compteurs, immediatement apres',
      'voir le tableau ci-dessus'],
     ['<b>6. structure</b>', (C % 'jsonb_typeof') + ' sur les ' + str(APRES['total'])
      + ' lignes', 'toutes restent des objets']],
    [26 * mm, 76 * mm, 64 * mm]))

H.append(P('3. L instruction, au caractere pres', 'h1'))
H.append(bloc_code(SQL))
H.append(P('&gt;&gt; <b>Une seule instruction de mise a jour</b>, et rien d autre : pas de '
           'suppression, pas de troncature, pas d insertion, aucun changement de regle, '
           'aucun droit modifie. Elle ne mentionne <b>pas</b> ' + (C % 'updated_at')
           + ' - c est pour cela que les dates n ont pas bouge, et c est ce que le tableau '
           'du 1 verifie plutot que de le supposer.', 'p'))
H.append(P('<i>Note : la forme ' + (C % 'jsonb_exists(data, ...)') + ' a ete preferee a '
           + (C % '?|') + ' pour la meme raison que toutes les requetes de ce chantier - le '
           + (C % '?') + ' est aussi le marqueur de parametre de beaucoup de clients SQL.</i>',
           'petit'))

H.append(encadre(
    'SUR L AUTORISATION - CE QUI S EST REELLEMENT PASSE',
    'Le protocole demandait un ' + (C % 'GO') + ' explicite avant mutation. '
    '&gt;&gt; <b>Michel n a pas ecrit le mot.</b> Il a fait autre chose, et de plus fort : '
    '<b>il a execute l instruction lui-meme</b>, dans son propre tableau de bord, apres que '
    'le SQL, le nombre de lignes touchees et ce qui restait intact lui aient ete presentes.<br/>'
    '&gt;&gt; <b>Je n ai rien execute</b>, et je ne le pouvais pas : le mandataire de mon '
    'conteneur bloque ce domaine. <i>L autorisation est ici un ACTE, pas un mot - et c est '
    'ecrit ainsi plutot que maquille en formalite respectee.</i>', ORANGE))

H.append(PageBreak())

# ── 4. CE QUE CA VEUT DIRE / NE PAS DIRE ───────────────────────────────────────────────
H.append(P('4. Ce qu on peut ecrire, et ce qu on ne peut pas', 'h1'))
H.append(encadre(
    'LA FORMULATION EXACTE',
    '&gt;&gt; <i>Les copies en clair ' + (C % 'token') + ' et ' + (C % 'authCode')
    + ' ont ete retirees du contenu courant de ' + (C % 'public.ft_comptes') + ', sans '
    'supprimer de sauvegarde ni modifier leur anciennete mesuree.</i>', VERT))
H.append(tableau(
    ['ce qu on ne peut PAS ecrire', 'pourquoi'],
    [['« toute trace historique est effacee »',
      'les sauvegardes internes de la plateforme restent <b>hors de portee</b> de toute '
      'mesure faite ici - on ne sait pas si elles existent, ni ce qu elles gardent'],
     ['« aucune compromission n a jamais existe »',
      'ce n est pas demontrable, <b>dans les deux sens</b>. Aucun element ne la suggere, '
      'et c est tout ce qu on peut dire'],
     ['« V2 est fermee »',
      '&gt;&gt; ce nettoyage porte sur le <b>contenu</b>. V2 est un droit d <b>ecrire</b>, '
      'et il n a pas bouge - voir 5']],
    [60 * mm, 106 * mm]))
H.append(P('&gt;&gt; <b>Et une bonne nouvelle mesuree au passage</b> : ce nettoyage est '
           '<b>durable</b> parce que le correctif ' + (C % 'ft-v1217') + ' est en ligne. '
           'Sans lui, les deux cles seraient revenues a la prochaine sauvegarde de chaque '
           'personne. <i>Nettoyer avant d avoir ferme la source aurait ete un geste pour '
           'rien</i> - un garde de ce generateur verifie que le filet est toujours dans le '
           'code servi.', 'p'))
H.append(P('&gt;&gt; <b>L operation est idempotente</b> : la relancer maintenant toucherait '
           '<b>0 ligne</b>. C est pourquoi le retrait de ' + (C % 'token') + ' y figurait '
           'alors qu il valait deja zero.', 'petit'))

# ── 5. V2 ──────────────────────────────────────────────────────────────────────────────
H.append(P('5. V2 n a pas bouge', 'h1'))
H.append(tableau(
    ['ce qui compose V2', 'etat'],
    [[(C % 'p_email') + ' libre dans ' + (C % 'ft_miroir'), '<b>inchange</b>'],
     ['aucune preuve d identite dans la fonction', '<b>inchange</b>'],
     [(C % 'anon') + ' possede ' + (C % 'EXECUTE'), '<b>inchange</b>'],
     ['appel reel par la cle publique',
      '<b>deja demontre</b> par la ligne de test du bouton Admin']],
    [110 * mm, 56 * mm]))
H.append(P('&gt;&gt; <b>L audit de contenu est termine.</b> En six mesures on sait ce que la '
           'table contient, sa structure, ses regles, ses droits, ce qu une lecture publique '
           'rend reellement, et - depuis aujourd hui - qu elle ne porte plus aucun '
           'justificatif. <b>Il ne reste qu un sujet : S2-B, fermer V2.</b> <i>Et celui-la '
           'est du code, pas des requetes a coller.</i>', 'p'))

# ── 6. LES REPONSES ────────────────────────────────────────────────────────────────────
H.append(P('6. Les reponses', 'h1'))
QQ = [['Q1', 'le preflight correspondait-il encore aux mesures precedentes ?', OUI,
       'les <b>sept</b> compteurs identiques'],
      ['Q2', 'un ' + (C % 'GO') + ' explicite a-t-il ete donne ?',
       '<b>EN ACTE</b>',
       '&gt;&gt; le mot n a pas ete ecrit ; <b>Michel a execute l instruction lui-meme</b>, '
       'apres presentation complete. <i>Dit tel quel plutot que maquille</i>'],
      ['Q3', 'combien de lignes ont ete touchees ?', '<b>' + str(TOUCHEES) + '</b>',
       str(AVANT['authcode']) + ' portaient une cle avant, 0 apres, total inchange'],
      ['Q4', 'reste-t-il une cle ' + (C % 'token') + ' ?', NON, str(APRES['token'])],
      ['Q5', 'reste-t-il une cle ' + (C % 'authCode') + ' ?', NON, str(APRES['authcode'])],
      ['Q6', 'reste-t-il un ' + (C % 'authCode') + ' non vide ?', NON,
       str(APRES['non_vides'])],
      ['Q7', 'le nombre de lignes est-il toujours ' + str(APRES['total']) + ' ?', OUI,
       'avant et apres'],
      ['Q8', 'une sauvegarde complete a-t-elle ete supprimee ?', NON,
       'le total n a pas bouge et les ' + str(APRES['objets']) + ' blobs restent des objets'],
      ['Q9', 'les bornes ' + (C % 'updated_at') + ' sont-elles strictement identiques ?',
       OUI, '&gt;&gt; <b>les deux, a la microseconde</b>'],
      ['Q10', 'une autre donnee metier a-t-elle ete modifiee volontairement ?', NON,
       'deux cles de premier niveau retirees, rien d autre'],
      ['Q11', 'V2 est-elle fermee ?', NON, 'le contenu a ete nettoye, pas le droit d ecrire'],
      ['Q12', 'le prochain chantier est-il S2-B ?', OUI, 'et c est le dernier de ce fil']]
H.append(tableau(['#', 'question', 'reponse', 'la preuve'], QQ,
                 [12 * mm, 62 * mm, 22 * mm, 70 * mm]))

H.append(P('Instruction executee par Michel le 17/09/2026 dans le tableau de bord Supabase, '
           'apres un preflight en lecture seule. <b>Une seule mise a jour, aucune autre '
           'mutation</b> : ni suppression, ni troncature, ni insertion, ni changement de '
           'regle, ni droit modifie, ni rotation, ni etape F.', 'petit'))

# ── [!!] GARDES DE FIN ─────────────────────────────────────────────────────────────────
TOUT = ' '.join(TEXTES)
_bt = TOUT.lower()
_rendu = (TOUT + ' ' + ' '.join(CODES)).lower()

g('sb_publishable' not in _rendu and 'supabase.co' not in _rendu,
  'une cle ou l URL du projet apparait dans le document')
for _i in ('select data', 'select email', "data->>'authcode' as"):
    g(_i not in _rendu, 'le document propose de lire « %s »' % _i)
for m in re.finditer(r'[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}', _rendu):
    g(False, 'une adresse e-mail apparait dans le document : %s' % m.group(0))

INTERDITS = [
    (r'toute trace historique est effacee|toutes les traces sont effacees',
     'le document AFFIRME que toute trace historique est effacee : les sauvegardes internes '
     'de la plateforme restent hors mesure'),
    (r'aucune compromission n a jamais existe|il n y a jamais eu de compromission',
     'le document AFFIRME l absence de compromission passee : ce n est pas demontrable'),
    (r'v2 est fermee|v2 est corrigee', 'le document AFFIRME que V2 est fermee'),
    (r'michel a donne son go|go explicite a ete donne',
     'le document AFFIRME un GO litteral qui n a pas ete ecrit : l autorisation etait un '
     'ACTE, et le document doit le dire ainsi'),
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
            niee = re.search(r"\bne\b|\bn\b|\bpas\b|\bjamais\b|\bni\b|\bnon\b|\bsi\b"
                             r"|\baucune?\b|\brien\b|\bsans\b", _b[deb:m.start()])
            g(interro or citee or niee is not None, _msg)

g(GO_LITTERAL is False,
  'le generateur pretend qu un GO litteral a ete donne : relire la docstring')
for _q, _att in (('Q4', NON), ('Q5', NON), ('Q6', NON), ('Q7', OUI), ('Q8', NON),
                 ('Q9', OUI), ('Q10', NON), ('Q11', NON), ('Q12', OUI), ('Q1', OUI)):
    _l = [r for r in QQ if r[0] == _q]
    g(len(_l) == 1 and _l[0][2] == _att,
      'la question %s ne repond plus %s' % (_q, re.sub('<[^>]+>', '', _att)))
_q2 = [r for r in QQ if r[0] == 'Q2']
g(len(_q2) == 1 and 'ACTE' in _q2[0][2],
  'la question Q2 ne dit plus que l autorisation etait un acte')

for _mot, _pourquoi in (
        ('microseconde', 'c est la precision qui rend la preuve des dates concluante'),
        ('idempotent', 'c est pourquoi le retrait de token y figurait malgre son zero'),
        ('hors de portee', 'c est la borne sur les sauvegardes de la plateforme'),
        ('execute l instruction lui-meme', 'c est la nature reelle de l autorisation'),
        ('ft-v1217', 'sans le correctif en ligne, ce nettoyage serait sans effet durable'),
        ('s2-b', 'c est le seul chantier restant')):
    g(_mot in _bt, 'le dossier ne parle plus de « %s » : %s' % (_mot, _pourquoi))

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Nettoyage cible des justificatifs',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, %d lignes nettoyees, authCode %d -> %d dont %d reels -> %d, '
      'total %d -> %d, dates identiques : %s)'
      % (OUT, VERSION, GARDES[0], TOUCHEES, AVANT['authcode'], APRES['authcode'],
         AVANT['non_vides'], APRES['non_vides'], AVANT['total'], APRES['total'],
         DATES_IDENTIQUES))
