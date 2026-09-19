#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""V2 — COMPTEUR ANONYME D'USAGE DE `ft_miroir` (19/09/2026).

[!!] LES TOTAUX SE LISENT DANS LEURS JOURNAUX, JAMAIS DE MEMOIRE (lecon ft-v1201). Le
     generateur refuse de produire si un journal manque ou porte un rouge.

[!!] ET LES QUATRE PROPRIETES DE LA FONCTION SERVIE VIENNENT DU TABLEAU DE BORD, pas du
     fichier : je ne peux pas les recompter. Elles sont donc marquees comme telles, et le
     generateur verifie que le FICHIER de migration porte bien ce que le tableau de bord
     rapporte — si les deux divergeaient, le dossier ne sortirait pas.

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
    SCRATCH, 'V2-COMPTEUR-ANONYME-FT-MIROIR-19-09-2026.pdf')
L_TESTS = os.path.join(SCRATCH, 'cpt_tests.log')
L_MUT = os.path.join(SCRATCH, 'cpt_mut.log')

DEBUT = '2026-09-19 10:00:43.501065'          # Europe/Paris, rendu par le tableau de bord
SHA = os.environ.get('FT_SHA') or '1d08076a'

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def journal(p, quoi):
    g(os.path.exists(p), 'le journal « %s » est introuvable : le banc n a pas tourne' % quoi)
    return open(p, encoding='utf-8', errors='replace').read()


VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", lire('sw.js')) or [None, ''])[1]
g(re.match(r'^ft-v\d+$', VERSION), 'la version servie n a pas pu etre lue dans sw.js')

# ══ LES TOTAUX, LUS DANS LEURS JOURNAUX ════════════════════════════════════════════════
LT = journal(L_TESTS, 'tests cibles')
m = re.search(r'TOTAL\s*:\s*(\d+)\s*OK,\s*(\d+)\s*rouge', LT)
g(m is not None, 'le TOTAL des tests est absent : le banc n a pas FINI')
T_OK, T_KO = int(m.group(1)), int(m.group(2))
g(T_KO == 0, 'le banc rend %d rouge(s)' % T_KO)
LM = journal(L_MUT, 'controle negatif')
m = re.search(r'(\d+)/(\d+) conformes', LM)
g(m is not None, 'le total des mutations est absent')
M_OK, M_TOT = int(m.group(1)), int(m.group(2))
g(M_OK == M_TOT, 'le controle negatif rend %d/%d' % (M_OK, M_TOT))
g('arbre sain : aucun rouge' in LM, 'le controle sain n etait pas vert')
for _t in ('T6c', 'T9a', 'T10a', 'T4', 'T5'):
    g(_t in LT, 'le temoin %s a disparu du banc' % _t)

# ══ LE FICHIER DE MIGRATION DOIT PORTER CE QUE LE TABLEAU DE BORD RAPPORTE ═════════════
MIG = lire('supabase/migrations/20260919_0004_compteur_ft_miroir.sql')
g('ft_miroir_usage' in MIG, 'la table du compteur a disparu de la migration')
g('exception when others then' in MIG,
  'le gestionnaire d erreur a disparu : le compteur pourrait tuer une sauvegarde legacy')
g('set appels_total = appels_total + 1' in MIG, 'l increment n est plus atomique')
g('id            boolean     primary key default true check (id)' in MIG,
  'la contrainte « une seule ligne » a disparu')
for _r in ('public', 'anon', 'authenticated', 'service_role'):
    g('revoke all on table public.ft_miroir_usage from ' + _r in MIG,
      'le role « %s » n est plus prive d acces au compteur' % _r)
g('alter table public.ft_miroir_usage enable row level security;' in MIG,
  'la securite au niveau ligne a disparu')
# ⭐ l anonymat, mesure sur le BLOC d increment et non sur tout le fichier : la migration
#   parle forcement de p_email ailleurs (c est un parametre de la fonction).
_bloc = MIG[MIG.index('  begin\n    update public.ft_miroir_usage'):MIG.index('  exception when others')]
g('p_email' not in _bloc and 'p_data' not in _bloc,
  'l increment nomme un parametre de la fonction : l anonymat par construction tombe')
# ⛔ la logique metier de ft_miroir n a pas bouge
g('values (lower(trim(p_email)), p_data, now())' in MIG
  and 'on conflict (email) do update' in MIG,
  'le corps metier de ft_miroir a change : ce dossier annonce le contraire')
# ⚠️ ON MESURE LE CODE, PAS LA NOTE QUI EN PARLE. La migration CITE `ft_jetons` dans ses
#    commentaires (« meme pattern que ft_jetons ») — R30 exige d ecrire la raison a cote du
#    code. Un garde qui lirait le fichier brut rougirait donc sur une migration parfaitement
#    juste. C'est la meme famille que les gardes « revision » et « set data = excluded.data ».
MIG_NU = re.sub(r'(?m)--[^\n]*', '', MIG)
g('ft_jetons' not in MIG_NU, 'la migration touche ft_jetons, hors perimetre')

# ── mise en page ───────────────────────────────────────────────────────────────────────
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')

_ss = getSampleStyleSheet()
ST = {
    'titre': ParagraphStyle('t', parent=_ss['Title'], fontName='Helvetica-Bold',
                            fontSize=14, leading=17, textColor=ENCRE, spaceAfter=2),
    'sous': ParagraphStyle('s', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=8, leading=10.5, textColor=GRIS, spaceAfter=8),
    'h1': ParagraphStyle('h1', parent=_ss['Normal'], fontName='Helvetica-Bold',
                         fontSize=10.2, leading=12.4, textColor=ROUGE,
                         spaceBefore=8, spaceAfter=3.5),
    'p': ParagraphStyle('p', parent=_ss['Normal'], fontName='Helvetica',
                        fontSize=8, leading=10.8, textColor=ENCRE, spaceAfter=4.5),
    'petit': ParagraphStyle('pt', parent=_ss['Normal'], fontName='Helvetica',
                            fontSize=7.1, leading=9.3, textColor=GRIS, spaceAfter=4),
    'code': ParagraphStyle('cd', parent=_ss['Normal'], fontName='Courier',
                           fontSize=6.4, leading=8, textColor=ENCRE, spaceAfter=2),
    'cell': ParagraphStyle('c', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=7.2, leading=9.2, textColor=ENCRE),
    'cellg': ParagraphStyle('cg', parent=_ss['Normal'], fontName='Helvetica-Bold',
                            fontSize=7.2, leading=9.2, textColor=ENCRE),
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
    return KeepTogether([t, Spacer(1, 5)])


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
                           ('TOPPADDING', (0, 0), (-1, -1), 3.6),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 3.6),
                           ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 5)])


H = []
H.append(P('V2 - compteur anonyme d usage de `ft_miroir`', 'titre'))
H.append(P('Force Tracker - 19 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>installe et actif ; V2 non fermee ; logique metier '
           'inchangee</b> - SHA <font face="Courier">' + SHA + '</font>', 'sous'))

H.append(P('1-4. Mecanisme, donnees, anonymat, moment de l increment', 'h1'))
H.append(tableau(
    ['', ''],
    [['<b>pourquoi</b>',
      'la mesure du 19/09 annoncait « 0 ancien client » - mais sur ~22 h pendant lesquelles '
      '<b>un seul compte sur 10 avait sauvegarde</b>. <i>Une absence de preuve, pas une preuve '
      'd absence.</i> Le compteur remplace l attente passive par une mesure.'],
     ['<b>ce qui est stocke</b>',
      'trois colonnes : <font face="Courier">appels_total</font>, '
      '<font face="Courier">dernier_appel</font>, <font face="Courier">debut_mesure</font>. '
      '<b>Aucune ligne par appel</b>, aucun historique, aucune granularite journaliere.'],
     ['<b>une seule ligne</b>',
      '<font face="Courier">id boolean primary key check (id)</font> : la seule valeur acceptee '
      'est <font face="Courier">true</font>, et elle est cle primaire. <b>Ce n est pas une '
      'convention qu on se promet de respecter, c est une contrainte que la base fait '
      'respecter.</b>'],
     ['<b>anonymat</b>',
      '<b>par construction</b> : la ligne d increment ne nomme <b>ni</b> '
      '<font face="Courier">p_email</font> <b>ni</b> <font face="Courier">p_data</font> - '
      'verifie sur le bloc lui-meme, pas sur le fichier (temoin <b>T6c</b>). Aucune adresse, '
      'aucun jeton, aucune charge, aucune IP, aucun identifiant.'],
     ['<b>portee</b>',
      'table retiree a <b>tous</b> les roles de l API (<font face="Courier">public</font>, '
      '<font face="Courier">anon</font>, <font face="Courier">authenticated</font>, '
      '<font face="Courier">service_role</font>) + securite au niveau ligne. <b>Aucune RPC '
      'publique de lecture</b> - <i>ouvrir une porte de lecture pour surveiller une porte qu on '
      'veut fermer serait un mauvais echange.</i>'],
     ['<b>moment</b>',
      '<b>APRES</b> une ecriture acceptee (option B). Increment <b>atomique</b> : '
      '<font face="Courier">appels_total + 1</font> lit et ecrit sous le verrou de ligne.']],
    [26 * mm, 140 * mm]))

H.append(encadre(
    'LE POINT LE PLUS IMPORTANT : L INCREMENT A SON PROPRE GESTIONNAIRE D ERREUR',
    'Sans lui, une erreur du compteur (table absente, droit retire, verrou) ferait echouer toute '
    'la fonction - donc <b>annulerait une sauvegarde legacy encore autorisee aujourd hui</b>. '
    '&gt;&gt; <i>Un instrument d observation qui peut detruire ce qu il observe n est pas un '
    'instrument, c est un risque.</i> Le compteur est du confort ; la sauvegarde est la donnee '
    'de quelqu un. En cas de doute, c est le compteur qui perd. Temoins <b>T9a</b> et '
    '<b>T9b</b> : la sauvegarde passe <b>meme avec la table du compteur supprimee</b>.'))

H.append(encadre(
    'ET LA DEFINITION REELLE DE `ft_miroir` A ETE DEMANDEE AVANT D ECRIRE UNE LIGNE',
    'Cette fonction n est <b>pas versionnee</b> (creee a la main avant le versionnement) : la '
    'reecrire de memoire aurait pu changer sa logique metier en silence. Elle a donc ete relue '
    'au tableau de bord, puis comparee <b>caractere par caractere</b> (espaces et casse '
    'normalises) a la reconstitution du banc : <b>identiques</b>. '
    '&gt;&gt; <i>On ne reecrit pas de memoire une fonction dont on n a pas la source.</i>',
    colors.HexColor('#1E7A46')))

H.append(P('5-6. Tests et mutations', 'h1'))
H.append(tableau(
    ['banc', 'resultat'],
    [['tests cibles, sur un <b>vrai PostgreSQL 16</b>',
      '<b>' + str(T_OK) + ' OK / ' + str(T_KO) + ' rouge</b> - T1 zero, T2 un, T3 onze, '
      '<b>T4 40 appels concurrents sans un increment perdu</b>, T5 la voie moderne ne bouge '
      'pas, T6 aucune donnee personnelle, T7 hors de portee de l API, T8 une seule ligne, '
      'T9 la sauvegarde survit a un compteur casse, <b>T10 un appel qui echoue ne compte '
      'pas</b>'],
     ['controle negatif',
      '<b>' + str(M_OK) + '/' + str(M_TOT) + ' conformes</b>, controle sain vert, sur copie des '
      'migrations']],
    [44 * mm, 122 * mm]))
H.append(P('<i>Le banc appelle la <b>VRAIE</b> RPC, jamais un <font face="Courier">update</font> '
           'a la main : un banc qui incrementerait lui-meme le compteur mesurerait sa propre '
           'requete, pas la production.</i>', 'petit'))

H.append(encadre(
    'DEUX TROUS DE BANC TROUVES PAR LE CONTROLE NEGATIF - ET UNE DECOUVERTE SUR POSTGRESQL',
    '<b>(1)</b> Mes <font face="Courier">revoke</font> n etaient <b>pas eprouves</b> : une table '
    'fraichement creee en local n est lisible par personne, donc les retirer ne changeait rien '
    'et la mutation restait verte. Supabase, lui, <b>accorde par defaut</b> aux roles de l API. '
    'Le banc reproduit desormais ces droits par defaut. <i>Un garde qu on eprouve dans un monde '
    'ou il est inutile n est pas eprouve.</i> '
    '<b>(2)</b> Rien ne prouvait le choix « compter APRES l ecriture » - temoin <b>T10</b> '
    'ajoute. '
    '<b>(3)</b> <b>Et une decouverte sur PostgreSQL, pas sur mon code</b> : un compteur place '
    '<b>avant</b> l insert ne gonfle pas non plus sur un appel qui echoue - l increment est '
    '<b>annule avec la transaction</b>. <i>La transaction donne deja gratuitement la moitie de '
    'l option B.</i> Le choix reste le bon (intention explicite, survit a un futur ajout apres '
    'l insert) mais <b>il ne porte pas le poids que je lui pretais</b>.'))

H.append(P('7. Limites - a ne jamais oublier', 'h1'))
H.append(P('<b>Ce compteur prouve que la RPC a ete <b>INVOQUEE</b>, jamais qu un <b>vrai '
           'utilisateur legacy</b> l a appelee. Un test manuel, une sonde, un appel exterieur '
           'comptent pareil.</b> <b>A partir du ' + DEBUT[:16] + ', aucun appel volontaire a '
           '<font face="Courier">ft_miroir</font> ne doit avoir lieu sans etre note</b> - '
           'consigne ecrite dans <font face="Courier">docs/CONTEXTE-ACTUEL.md</font> et dans le '
           'journal de partage, pour que l autre session la voie aussi.', 'p'))

H.append(P('8-10. Etat final', 'h1'))
H.append(tableau(
    ['', 'valeur'],
    [['debut d observation',
      '<b>' + DEBUT + '</b> (Europe/Paris)'],
     ['compteur initial', '<b>0</b>, <font face="Courier">dernier_appel</font> a '
      '<font face="Courier">null</font>'],
     ['installe / actif', '<b>oui / oui</b>'],
     ['verifie dans la fonction SERVIE',
      '<i>(lu au tableau de bord, non recomptable d ici)</i> '
      '<font face="Courier">compteur_cable = true</font> - donc le <b>0</b> est une '
      '<b>mesure</b>, pas un silence · <font face="Courier">filet_present = true</font> - le '
      'seul vrai danger est ecarte · <font face="Courier">security_definer = true</font> et '
      '<font face="Courier">search_path = public</font> : les proprietes d origine sont '
      '<b>preservees</b>'],
     ['bump', '<b>aucun</b> - aucun fichier servi ne change']],
    [40 * mm, 126 * mm]))

H.append(P('Relecture, plus tard', 'h1'))
H.append(bloc_code(
    "select appels_total,\n"
    "       dernier_appel at time zone 'Europe/Paris' as dernier_appel_paris,\n"
    "       debut_mesure  at time zone 'Europe/Paris' as debut_mesure_paris,\n"
    "       now() - debut_mesure                      as duree_observation\n"
    "  from public.ft_miroir_usage;"))
H.append(P('<b>Quand ?</b> Le repere est les <b>7 comptes actifs sur 30 jours</b> : tant qu une '
           'bonne part n est pas revenue sauvegarder, le compteur ne peut pas trancher. '
           '<b>Une a deux semaines.</b> <b>&gt; 0</b> : V2 est encore appelee, on ne ferme pas '
           'sans comprendre qui. <b>= 0</b> apres une fenetre representative : preuve bien plus '
           'forte que la deduction actuelle, a croiser avec la couverture des jetons. '
           '<b>La decision reste celle de Michel.</b>', 'p'))
H.append(P('<b>Ce que cette passe n a pas fait</b> : V2 non fermee, aucun appel filtre, aucune '
           'logique metier changee, <font face="Courier">ft_jetons</font> et le nouveau chemin '
           'intacts, aucun droit metier modifie, aucun changement client, <b>Douane non '
           'touchee</b>, rien sur Nutrition ni sur le registre IA, aucun chaos test, aucune '
           'passe complete (aucun fichier servi modifie).', 'petit'))

_bt = ' '.join(TEXTES).lower()
for _mot, _msg in [('v2 est fermee', 'aucune fermeture n a eu lieu'),
                   ('prouve qu un utilisateur legacy', 'le compteur ne prouve pas cela')]:
    g(_mot not in _bt, _msg)
for _mot, _pourquoi in (('invoquee', 'la limite centrale'),
                        ('absence de preuve', 'la raison d etre du compteur'),
                        ('par construction', 'la nature de l anonymat'),
                        ('gestionnaire d erreur', 'le point le plus important'),
                        ('n est pas eprouve', 'le trou de banc comble'),
                        ('annule avec la transaction', 'la decouverte sur PostgreSQL')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))
g('@' not in (_bt + ' '.join(CODES)), 'une adresse figure dans le document')

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                  topMargin=15 * mm, bottomMargin=13 * mm,
                  title='V2 - compteur anonyme ft_miroir',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes ; tests %d/%d ; mutations %d/%d ; fenetre ouverte %s)'
      % (OUT, VERSION, GARDES[0], T_OK, T_KO, M_OK, M_TOT, DEBUT[:16]))
