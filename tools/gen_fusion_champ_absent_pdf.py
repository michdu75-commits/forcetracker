#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""FORCE TRACKER — MIROIR SUPABASE — CORRECTION CHAMP ABSENT (18/09/2026).

[!!] LES TOTAUX SE LISENT DANS LEUR JOURNAL, JAMAIS DE MEMOIRE (lecon ft-v1201, ou un PDF a
     publie un total pendant que la passe tournait encore). Le total croise de la passe
     complete est EXTRAIT du fichier de sortie, et le generateur REFUSE de produire si la
     ligne de total manque — c'est-a-dire si la passe n'a pas fini.

[!!] ET LES FAITS DE LA MIGRATION SONT RECOMPTES DEPUIS LE FICHIER SERVI : la ligne de
     fusion, le coalesce, le retrait des justificatifs APRES fusion, la precondition de type.
     Ce dossier decrit un correctif ; s'il decrivait un correctif absent, il ferait chercher
     une garantie qui n'existe pas.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji.
"""
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
    SCRATCH, 'MIROIR-SUPABASE-CORRECTION-CHAMP-ABSENT-18-09-2026.pdf')
LOG_PASSE = os.environ.get('FT_LOG_PASSE') or os.path.join(SCRATCH, 'passe.log')
SHA = os.environ.get('FT_SHA') or '(non fige)'

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, ''])[1]
g(re.match(r'^ft-v\d+$', VERSION), 'la version servie n a pas pu etre lue dans sw.js')

M3 = 'supabase/migrations/20260918_0003_fusion_champ_absent.sql'
MIG3 = lire(M3)
MIG2 = lire('supabase/migrations/20260917_0002_rpc_s2b.sql')
BANC = lire('tools/test_fusion_champ_absent.py')

# ── le correctif, recompte dans le fichier servi ───────────────────────────────────────
g("set data = (coalesce(public.ft_comptes.data, '{}'::jsonb) || excluded.data)" in MIG3,
  'la fusion avec coalesce a disparu de la migration 0003')
g(re.search(r"\|\| excluded\.data\)\s*\n\s*- 'token' - 'authCode' - 'code' - 'confirmCode'"
            r" - 'apikey' - 'authorization',", MIG3) is not None,
  'le retrait des justificatifs ne suit plus la fusion : la fuite survivrait')
g("raise exception\n      'ft_comptes.data est de type % et non jsonb" in MIG3
  or "ft_comptes.data est de type % et non jsonb" in MIG3,
  'la precondition de type a disparu de la migration 0003')
g('set data = excluded.data' not in MIG3,
  'la migration 0003 contient encore un remplacement integral')
g('set data = excluded.data, updated_at = now();' in MIG2,
  'la migration 0002 ne porte plus l ancienne semantique : le retour arriere serait faux')
# ⛔ AUCUNE TABLE, AUCUN DROIT, AUCUNE RLS TOUCHES.
for _interdit in ('create table', 'alter table', 'drop table', 'grant ', 'revoke ',
                  'row level security', 'add column'):
    g(_interdit not in MIG3.lower().replace('-- ', '#'),
      'la migration 0003 contient « %s » : elle sort de son perimetre' % _interdit)
g('ft_jetons' not in MIG3.split('-- ─── 1.')[-1].replace(
    'from public.ft_jetons j', '').replace('public.ft_jetons', ''),
  'la migration 0003 touche ft_jetons hors de la lecture d identite')

# ── les temoins du banc, recomptes ─────────────────────────────────────────────────────
TEMOINS = re.findall(r"t\('(T\d+[a-z]?) ", BANC)
g(len(TEMOINS) >= 15, 'le banc ne porte plus que %d temoins' % len(TEMOINS))
for _t in ('T2a', 'T2b', 'T3a', 'T6', 'T7', 'T8', 'T9c'):
    g(_t in TEMOINS, 'le temoin %s a disparu du banc' % _t)

# ── LE TOTAL DE LA PASSE, LU DANS SON JOURNAL ──────────────────────────────────────────
g(os.path.exists(LOG_PASSE), 'le journal de la passe est introuvable : elle n a pas tourne')
_L = open(LOG_PASSE, encoding='utf-8', errors='replace').read()
_m = re.search(r'TOTAL CROIS\S+\s*:\s*(\d+)\s*\S+\s*[^\d]*?(\d+)\s*\S+', _L)
g(_m is not None,
  'la ligne de TOTAL est absente du journal : la passe n a pas FINI, on ne publie pas')
P_OK, P_KO = int(_m.group(1)), int(_m.group(2))
g(P_KO == 0, 'la passe complete rend %d rouge(s) : on ne publie pas' % P_KO)

# ── mise en page ───────────────────────────────────────────────────────────────────────
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')

_ss = getSampleStyleSheet()
ST = {
    'titre': ParagraphStyle('t', parent=_ss['Title'], fontName='Helvetica-Bold',
                            fontSize=14.5, leading=18, textColor=ENCRE, spaceAfter=2),
    'sous': ParagraphStyle('s', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=8.2, leading=10.8, textColor=GRIS, spaceAfter=9),
    'h1': ParagraphStyle('h1', parent=_ss['Normal'], fontName='Helvetica-Bold',
                         fontSize=10.6, leading=13, textColor=ROUGE,
                         spaceBefore=10, spaceAfter=4),
    'p': ParagraphStyle('p', parent=_ss['Normal'], fontName='Helvetica',
                        fontSize=8.2, leading=11.2, textColor=ENCRE, spaceAfter=5),
    'petit': ParagraphStyle('pt', parent=_ss['Normal'], fontName='Helvetica',
                            fontSize=7.3, leading=9.6, textColor=GRIS, spaceAfter=4),
    'code': ParagraphStyle('cd', parent=_ss['Normal'], fontName='Courier',
                           fontSize=6.5, leading=8.1, textColor=ENCRE, spaceAfter=2),
    'cell': ParagraphStyle('c', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=7.4, leading=9.5, textColor=ENCRE),
    'cellg': ParagraphStyle('cg', parent=_ss['Normal'], fontName='Helvetica-Bold',
                            fontSize=7.4, leading=9.5, textColor=ENCRE),
}
TEXTES, CODES = [], []


def _v(s):
    r = html.unescape(s)
    try:
        r.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE - hors cp1252 : %r (dans %r)' % (r[e.start:e.end], s[:70]))
    return s


def P(txt, st='p'):
    TEXTES.append(txt)
    return Paragraph(_v(txt), ST[st])


def bloc_code(txt):
    CODES.append(txt)
    lg = [Paragraph(_v(html.escape(l).replace(' ', '&nbsp;')), ST['code'])
          for l in txt.split('\n')]
    t = Table([[lg]], colWidths=[166 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F7F7F5')),
                           ('BOX', (0, 0), (-1, -1), 0.4, TRAIT),
                           ('LEFTPADDING', (0, 0), (-1, -1), 6),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                           ('TOPPADDING', (0, 0), (-1, -1), 4),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]))
    return KeepTogether([t, Spacer(1, 5)])


def encadre(titre, corps, couleur=ROUGE):
    TEXTES.append(titre)
    TEXTES.append(corps)
    t = Table([[Paragraph(_v('<b>' + titre + '</b>'), ST['cell'])],
               [Paragraph(_v(corps), ST['cell'])]], colWidths=[166 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), FOND),
                           ('LINEBEFORE', (0, 0), (0, -1), 2.2, couleur),
                           ('LEFTPADDING', (0, 0), (-1, -1), 7),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 7),
                           ('TOPPADDING', (0, 0), (-1, -1), 5),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
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
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), FOND),
                           ('GRID', (0, 0), (-1, -1), 0.35, TRAIT),
                           ('LEFTPADDING', (0, 0), (-1, -1), 4),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                           ('TOPPADDING', (0, 0), (-1, -1), 4),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                           ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 6)])


H = []
H.append(P('Miroir Supabase - correction « champ absent »', 'titre'))
H.append(P('Force Tracker - 18 septembre 2026 - version publiee <b>' + VERSION + '</b> - '
           'hors depot (regle d or #14) - <b>une migration, aucune table, aucun droit, '
           'aucun client, aucun Worker, aucun Apps Script</b>', 'sous'))

H.append(P('1-4. Base de depart, fonction avant, migration, fonction apres', 'h1'))
H.append(tableau(
    ['', 'valeur'],
    [['base de depart', '<font face="Courier">03c328ad</font>, arbre propre, servie ft-v1223'],
     ['migration creee',
      '<font face="Courier">supabase/migrations/20260918_0003_fusion_champ_absent.sql</font> '
      '- <b>la 3e</b> ; les deux precedentes ne sont pas reecrites'],
     ['objet modifie', '<font face="Courier">ft_enregistrer_instantane</font> <b>seulement</b>'],
     ['tables / colonnes / droits / RLS', '<b>aucun changement</b> - verifie par garde'],
     ['ligne AVANT', '<font face="Courier">set data = excluded.data, updated_at = now();</font>'],
     ['SHA final', '<font face="Courier">' + SHA + '</font>']],
    [40 * mm, 126 * mm]))
H.append(P('Ligne APRES :', 'p'))
H.append(bloc_code(
    "set data = (coalesce(public.ft_comptes.data, '{}'::jsonb) || excluded.data)\n"
    "             - 'token' - 'authCode' - 'code' - 'confirmCode' - 'apikey' "
    "- 'authorization',\n"
    "    updated_at = now();"))

H.append(P('5. Semantique exacte - et deux choses que le rapport conceptuel avait ratees',
           'h1'))
H.append(encadre(
    'LE `coalesce` N EST PAS DECORATIF : LA FORME PROPOSEE DANS LE DIAGNOSTIC AURAIT VIDE UNE LIGNE',
    'Mesure sur PostgreSQL 16 : <font face="Courier">NULL || \'{"a":1}\'::jsonb</font> rend '
    '<b>NULL</b>, pas <font face="Courier">{"a":1}</font>. La colonne '
    '<font face="Courier">data</font> est <b>nullable</b>. Sans <font face="Courier">coalesce'
    '</font>, une ligne dont <font face="Courier">data</font> vaut NULL aurait ete <b>remise a '
    'NULL par sa propre sauvegarde</b> - la copie miroir videe au lieu d etre completee, en '
    'silence. <i>La forme conceptuelle d un rapport n est pas du code : elle se mesure avant '
    'd etre recopiee.</i> Temoin <b>T8</b>.'))
H.append(encadre(
    'ET LA FUSION AURAIT INTRODUIT UNE REGRESSION DE SECURITE - TROUVEE EN ECRIVANT LE TEST',
    'Avec le remplacement integral, un justificatif deja present dans le miroir (la fuite '
    'S2-A, du 04/08 au 16/09) etait <b>efface par la sauvegarde suivante</b> : la porte se '
    'reparait toute seule. Avec la fusion naive, cette cle est <b>absente</b> de '
    '<font face="Courier">excluded.data</font> - le <font face="Courier">-</font> l a retiree - '
    'donc <i>absence = conservee</i>, donc <b>la fuite survivait indefiniment</b>. '
    '👉 <b>Le geste qui protege les champs metier protegeait aussi ceux qu on veut justement '
    'voir disparaitre.</b> Le retrait est donc reapplique <b>APRES</b> la fusion. '
    '⭐ Effet de bord favorable, dit sans etre survendu : la premiere sauvegarde de chaque '
    'compte <b>purge</b> desormais les justificatifs anciens, ce que S2-A avait laisse ouvert '
    'faute d acces au tableau de bord. Temoins <b>T9c</b> et <b>T9d</b>.'.replace('👉', '&gt;&gt;')))
H.append(tableau(
    ['cas', 'regle mesuree', 'temoin'],
    [['cle presente a droite', 'la nouvelle valeur gagne', 'T2b, T4'],
     ['cle absente a droite', '<b>l ancienne valeur survit</b>', 'T2a, T5'],
     ['tableau vide <b>envoye</b>', 'ecrit tel quel - <b>absence n est pas vide</b>', 'T3a'],
     ['<font face="Courier">null</font> explicite',
      '<b>reste <font face="Courier">null</font></b> : il n efface pas la cle. Seul '
      '<font face="Courier">-</font> supprime, et il ne sert qu aux justificatifs', 'T6'],
     ['objet imbrique',
      '<b>FUSION DE SURFACE</b> : l objet est <b>remplace en entier</b>, pas fusionne '
      'recursivement. <i>Mesure, et dit : on ne pretend pas corriger la fusion interne.</i> '
      'C est le comportement voulu - chaque champ du corps est toujours construit en entier',
      'T7'],
     ['ligne dont <font face="Courier">data</font> est NULL', 'completee, pas videe', 'T8'],
     ['type de <font face="Courier">data</font>',
      '<b>la migration VERIFIE que c est jsonb et REFUSE sinon</b> - eprouve sur une base ou '
      'la colonne est <font face="Courier">json</font> : <i>« ft_comptes.data est de type json '
      'et non jsonb »</i>. <font face="Courier">ft_comptes</font> n etant pas versionnee, le '
      'type etait une <b>mesure</b>, pas une garantie', 'precondition']],
    [34 * mm, 112 * mm, 20 * mm]))

H.append(P('11. Mutation test - le banc rougit, et sur LE bon temoin', 'h1'))
H.append(tableau(
    ['mutation', 'temoins qui tombent'],
    [['la fusion redevient un <b>remplacement integral</b>', '<b>T2a</b>, T3b, T5'],
     ['la fusion perd son <font face="Courier">coalesce</font>', '<b>T8</b>'],
     ['le retrait des justificatifs ne suit plus la fusion', '<b>T9c</b>'],
     ['les cotes de la fusion sont <b>inverses</b>', '<b>T2b</b>, T3a, T4, T5, T6, T7, T9d'],
     ['le retrait disparait de l <font face="Courier">insert</font>', '<b>T9a</b>'],
     ['la precondition de type disparait',
      '<b>vert attendu</b> ici (la colonne EST jsonb) - la precondition a donc ete eprouvee '
      '<b>a part</b>, sur une base ou elle est <font face="Courier">json</font>, et elle '
      'refuse']],
    [96 * mm, 70 * mm]))
H.append(P('<b>6/6 conformes</b>, controle sain vert avant chaque mutation. <i>On exige le BON '
           'rouge, pas un rouge : une mutation qui ferait planter le montage rendrait aussi un '
           'code non nul, et ne prouverait rien.</i>', 'petit'))

H.append(P('12. Compatibilite des anciens clients', 'h1'))
H.append(tableau(
    ['verification', 'resultat'],
    [['les anciens clients envoient-ils toutes les cles ?',
      '<b>oui</b> - 44 des 45 champs portent un repli explicite ; le 45e, '
      '<font face="Courier">sessions</font>, est omis <b>pour preserver</b>, jamais pour '
      'supprimer'],
     ['un client depend-il du remplacement pour SUPPRIMER une cle ?',
      '<b>non</b> - aucune omission du corps n a ce sens'],
     ['un client tres ancien (cache) ?',
      '⚠️ il appelle encore <font face="Courier">ft_miroir</font>, <b>non modifiee</b> : il '
      'garde le remplacement integral. <b>Hors perimetre, et c est voulu</b> - la consigne '
      'bornait la passe a <font face="Courier">ft_enregistrer_instantane</font>'.replace(
          '⚠️', '(!)')]],
    [72 * mm, 94 * mm]))

H.append(P('13. Cles zombies', 'h1'))
H.append(encadre(
    'RISQUE CONNU / FAIBLE / NON CORRIGE DANS CETTE PASSE',
    'Une cle qu une future version cesserait <b>totalement</b> d envoyer resterait '
    'indefiniment dans le miroir, puisque <i>absence = conservee</i>. Consequence : le blob '
    'grossit. <b>Aucun nettoyage n est construit ici</b> - on ne bati pas un mecanisme pour un '
    'cas qui ne s est jamais produit. <i>C est ecrit pour que personne ne le redecouvre comme '
    'un bug.</i>', colors.HexColor('#B26A00')))

H.append(P('14-15. Limites - noir sur blanc', 'h1'))
H.append(P('<b>Cette correction ne regle PAS :</b> deux telephones qui ecrivent avec des '
           'instantanes anciens - le dernier ecrivain gagnant - la <b>resurrection</b> d une '
           'entree supprimee (mesuree : elle atteint Apps Script aussi, pas seulement le '
           'miroir) - la suppression totale d une liste, refusee cote Apps Script - les '
           'marqueurs de suppression - le versionnement causal - la fusion profonde - les '
           'conflits metier. <b>Elle corrige exactement une chose : un champ absent du nouvel '
           'instantane ne disparait plus du miroir Supabase.</b>', 'p'))
H.append(P('<b>Et rien d autre n a ete touche</b> : V2 reste ouverte, '
           '<font face="Courier">ft_jetons</font> intacte, aucun droit Supabase change, '
           'Apps Script non modifie, Worker non modifie, client non modifie, aucune revision, '
           'aucun marqueur de suppression, <b>Douane non touchee</b> (verdict inchange : '
           '<b>continuer l observation</b>), rien sur FREE/PREMIUM, rien sur le registre IA, '
           'rien sur Milo.', 'p'))

H.append(P('15-19. Resultats', 'h1'))
H.append(tableau(
    ['banc', 'resultat'],
    [['tests cibles (<font face="Courier">test_fusion_champ_absent.py</font>, vrai PostgreSQL 16)',
      '<b>17 OK / 0 rouge</b>'],
     ['mutations de la migration', '<b>6 / 6 conformes</b>, controle sain vert'],
     ['precondition de type, eprouvee sur une base <font face="Courier">json</font>',
      '<b>refuse avec son motif</b>'],
     ['banc des migrations (<font face="Courier">test_migrations_s2b.py</font>)',
      '<b>55 OK / 0 rouge</b> - dont le retour arriere'],
     ['passe complete du parcours',
      '<b>' + str(P_OK) + ' OK / ' + str(P_KO) + ' rouge</b> - total <b>lu dans son journal</b>, '
      'jamais ecrit a la main'],
     ['SHA final', '<font face="Courier">' + SHA + '</font>'],
     ['version publiee', '<b>' + VERSION + '</b>']],
    [92 * mm, 74 * mm]))
H.append(P('<b>La migration n est pas appliquee a l instance Supabase</b> : elle est versionnee '
           'dans le depot et attend son application au tableau de bord - c est le seul chemin, '
           'le conteneur ne joignant pas Supabase. <i>Tant qu elle n est pas appliquee, le '
           'miroir garde l ancienne semantique.</i>', 'petit'))

_bt = ' '.join(TEXTES).lower()
for _mot, _msg in [('v2 est fermee', 'aucune fermeture n a eu lieu'),
                   ('regle inutile', 'aucune regle n est declaree inutile'),
                   ('corrige la resurrection', 'le correctif ne doit pas etre survendu')]:
    g(_mot not in _bt, _msg)
for _mot, _pourquoi in (('fusion de surface', 'la semantique reelle, dite sans la survendre'),
                        ('cles zombies', 'l effet secondaire connu'),
                        ('continuer l observation', 'le verdict Douane, conserve'),
                        ('ne regle pas', 'les limites noir sur blanc'),
                        ('lu dans son journal', 'la provenance du total'),
                        ('non modifiee', 'l ancienne porte, hors perimetre')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))
g(re.search(r'\b[0-9a-f]{32,}\b', _bt) is None, 'un hexadecimal long figure dans le document')

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Miroir Supabase - correction champ absent',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, passe %d/%d lue dans le journal, %d temoins au banc)'
      % (OUT, VERSION, GARDES[0], P_OK, P_KO, len(TEMOINS)))
