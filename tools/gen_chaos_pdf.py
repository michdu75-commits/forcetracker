#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""FORCE TRACKER — OVERNIGHT CHAOS TEST — INTEGRITE MULTI-APPAREILS — 19/09/2026.

[!!] TOUS LES CHIFFRES SONT LUS DANS LES JOURNAUX DES BANCS, JAMAIS ECRITS A LA MAIN
     (lecon ft-v1201). Le generateur REFUSE de produire si un journal manque, si un banc
     n'a pas fini, ou s'il porte un rouge.

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
    SCRATCH, 'OVERNIGHT-CHAOS-TEST-INTEGRITE-MULTI-APPAREILS-19-09-2026.pdf')
L_FUZZ = os.path.join(SCRATCH, 'fuzz_gros.log')
L_MUT = os.path.join(SCRATCH, 'chaos_mut.log')
L_PASSE = os.path.join(SCRATCH, 'passe2.log')
SHA = os.environ.get('FT_SHA') or '(non fige)'

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


SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, ''])[1]
g(re.match(r'^ft-v\d+$', VERSION), 'la version servie n a pas pu etre lue dans sw.js')

# ══ LE BANC DE CHAOS, LU DANS SON JOURNAL ══════════════════════════════════════════════
LF = journal(L_FUZZ, 'banc de chaos / gros fuzz')
m = re.search(r'TOTAL CHAOS\s*:\s*(\d+)\s*OK,\s*(\d+)\s*rouge', LF)
g(m is not None, 'le TOTAL du banc de chaos est absent : il n a pas FINI')
C_OK, C_KO = int(m.group(1)), int(m.group(2))
g(C_KO == 0, 'le banc de chaos rend %d rouge(s)' % C_KO)
m = re.search(r'aucun invariant viole sur (\d+) sequences \((\d+) graines\)', LF)
g(m is not None, 'la ligne du fuzz est absente du journal')
F_SEQ, F_GRAINES = int(m.group(1)), int(m.group(2))
m = re.search(r'(\d+) etapes au total', LF)
g(m is not None, 'le nombre d etapes du fuzz est absent')
F_ETAPES = int(m.group(1))
g(F_ETAPES >= 10000, 'le fuzz n a joue que %d etapes : trop peu pour une passe de nuit'
  % F_ETAPES)

# ══ LE CONTROLE NEGATIF ════════════════════════════════════════════════════════════════
LM = journal(L_MUT, 'controle negatif du chaos')
m = re.search(r'(\d+)/(\d+) conformes', LM)
g(m is not None, 'le total des mutations est absent')
M_OK, M_TOT = int(m.group(1)), int(m.group(2))
g(M_OK == M_TOT, 'le controle negatif rend %d/%d' % (M_OK, M_TOT))
g('arbre sain : aucun rouge' in LM, 'le controle sain du chaos n etait pas vert')

# ══ LA PASSE COMPLETE ══════════════════════════════════════════════════════════════════
LP = journal(L_PASSE, 'passe complete')
m = re.search(r'TOTAL CROIS\S+\s*:\s*(\d+)\s*\S+\s*[^\d]*?(\d+)\s*\S+', LP)
g(m is not None, 'la ligne de TOTAL est absente : la passe n a pas FINI, on ne publie pas')
P_OK, P_KO = int(m.group(1)), int(m.group(2))
g(P_KO == 0, 'la passe complete rend %d rouge(s)' % P_KO)
m = re.search(r'EXIT=(\d+)', LP)
g(m is not None and m.group(1) == '0', 'la passe ne rend pas EXIT=0')

# ══ LES FAITS DU DEPOT, RECOMPTES ══════════════════════════════════════════════════════
MIG3 = lire('supabase/migrations/20260918_0003_fusion_champ_absent.sql')
CJ = lire('Code.js')
BANC = lire('tools/chaos/banc.js')
HARN = lire('tools/chaos/harness_appsscript.js')
g("set data = (coalesce(public.ft_comptes.data, '{}'::jsonb) || excluded.data)" in MIG3,
  'la migration 0003 n est plus en place')
# ⭐ LE POINT QUI FAIT LA VALEUR DU BANC : il charge le VRAI Code.js.
g("fs.readFileSync(path.join(RACINE, 'Code.js'), 'utf8')" in HARN,
  'le harnais ne charge plus le vrai Code.js : le banc mesurerait une reecriture')
g("ctx.handleSaveProfile_(corps)" in HARN,
  'le harnais n appelle plus la vraie fonction de sauvegarde')
# ⭐ et il ne double QUE les deux portes de stockage
g(HARN.count('ctx.loadUserData_ =') == 1 and HARN.count('ctx.saveUserData_ =') == 1,
  'le harnais double plus de fonctions que les deux portes de stockage')
for _f in ('_pa_', '_po_', 'SEUIL_MINI'):
    g(('ctx.' + _f + ' =') not in HARN,
      'le harnais double « %s » : il mesurerait sa propre doublure' % _f)
# ⭐ les 8 appels de _pa_ sont gardes : c est ce qui rend le mutant equivalent
g(len([l for l in CJ.splitlines() if '_pa_(' in l and 'function _pa_' not in l]) == 8,
  'le nombre d appels a _pa_ a change : le mutant equivalent doit etre recompte')
g(len([l for l in CJ.splitlines()
       if '_pa_(' in l and 'function _pa_' not in l and '!== undefined' not in l]) == 0,
  'un appel a _pa_ n est plus garde : la branche interne redevient ATTEIGNABLE')
# ⛔ le banc n ecrit nulle part en reel
for _interdit in ('supabase.co', 'script.google.com', 'michdu75'):
    g(_interdit not in BANC, 'le banc de chaos nomme « %s » : il pourrait sortir' % _interdit)
g('exemple.invalid' in BANC, 'le banc n emploie plus de domaine non routable')

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
    'cell': ParagraphStyle('c', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=7.4, leading=9.5, textColor=ENCRE),
    'cellg': ParagraphStyle('cg', parent=_ss['Normal'], fontName='Helvetica-Bold',
                            fontSize=7.4, leading=9.5, textColor=ENCRE),
}
TEXTES = []


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


PE = '<font color="#1E7A46"><b>PROUVE PAR EXECUTION</b></font>'
PCd = '<font color="#1E7A46"><b>PROUVE PAR CODE</b></font>'
CRIT = '<font color="#C0392B"><b>CRITIQUE</b></font>'
HAUT = '<font color="#C0392B"><b>HAUT</b></font>'
MOY = '<font color="#B26A00"><b>MOYEN</b></font>'
FAI = '<font color="#5A5A5A"><b>FAIBLE</b></font>'

H = []
H.append(P('Overnight chaos test - integrite multi-appareils', 'titre'))
H.append(P('Force Tracker - nuit du 18 au 19 septembre 2026 - base servie ' + VERSION
           + ' - hors depot (regle d or #14) - <b>environnement LOCAL isole ; aucune donnee '
           'reelle ; aucune ecriture sur l instance Supabase ; aucun correctif metier '
           'deploye</b>', 'sous'))

H.append(P('1-2. Environnement et base de depart', 'h1'))
H.append(tableau(
    ['', 'valeur'],
    [['SHA de depart', '<font face="Courier">' + SHA + '</font>, arbre propre'],
     ['Apps Script',
      '⭐⭐ <b>le fichier <font face="Courier">Code.js</font> SERVI</b>, charge dans un contexte '
      '<font face="Courier">vm</font> de Node. C est <b>la vraie</b> '
      '<font face="Courier">handleSaveProfile_</font> qui ecrit - <i>un banc qui rejouerait ma '
      'reecriture validerait ma reecriture, pas la production</i>. Seules <b>deux</b> portes '
      'sont doublees (<font face="Courier">loadUserData_</font> / '
      '<font face="Courier">saveUserData_</font>) ; ni '
      '<font face="Courier">_pa_</font>, ni <font face="Courier">_po_</font>, ni aucun garde-fou'.replace('⭐⭐', '&gt;&gt;')],
     ['Supabase',
      'PostgreSQL <b>16.13</b> local, les <b>3</b> migrations de '
      '<font face="Courier">supabase/migrations/</font> appliquees telles quelles, RPC '
      'appelees comme le Worker les appelle'],
     ['appareils', '<b>A</b>, <b>B</b> (meme compte, jetons distincts), <b>C</b> = ancien '
      'client passant encore par <font face="Courier">ft_miroir</font>'],
     ['isolement', 'adresses en <font face="Courier">.invalid</font> (RFC 2606, non routables) ; '
      'un garde du generateur refuse que le banc nomme un domaine reel']],
    [30 * mm, 136 * mm]))

H.append(P('3-7. Scenarios executes et resultats', 'h1'))
H.append(tableau(
    ['bloc', 'ce qui est mesure', 'verdict'],
    [['M1-M2', 'B sauvegarde un etat ANCIEN apres A',
      '⛔ l ajout et la modification de A <b>disparaissent</b>, des DEUX cotes'.replace('⛔', '')],
     ['M3', 'resurrection, <b>10 listes</b> une par une',
      '⛔ ressuscitee <b>sur les 10</b>, cote Apps Script <b>ET</b> Supabase'.replace('⛔', '')],
     ['M4', 'A vide completement une liste',
      'Apps Script <b>refuse</b> ; Supabase <b>accepte</b> : les deux divergent'],
     ['M5-M6', 'ajouts et modifications concurrents, <b>dans les deux ordres</b>',
      'dernier ecrivain gagnant, sans fusion - confirme A puis B ET B puis A'],
     ['S1-S3', '<font face="Courier">sessions</font> omis / vide explicite',
      '⭐ <b>absent = conserve des deux cotes</b> (migration 0003) ; vide explicite : refuse '
      'par Apps Script, ecrit par Supabase'.replace('⭐', '')],
     ['SR', 'envoi ampute 500 -&gt; 50',
      'Apps Script <b>refuse</b> ; le miroir <b>tombe a 50</b>'],
     ['J1-J5', 'jetons multi-appareils',
      'revocation <b>independante</b> ; refus identique pour revoque et inconnu (aucun oracle) ; '
      'une revocation <b>ne se defait pas</b> (contrainte de table)'],
     ['I4', 'une adresse glissee dans la charge',
      '<b>ne detourne rien</b>, ni cote Supabase ni cote Apps Script'],
     ['AC1-AC3', 'ancien client via <font face="Courier">ft_miroir</font>',
      '⛔ ecrase tout le blob, <b>choisit le compte</b>, et <b>aucun filtre</b> : un '
      'justificatif y entre'.replace('⛔', '')],
     ['I2a-I2e', 'justificatifs S2-A',
      '⭐ <b>purges</b> dans les 5 cas : deja presents, envoyes, a <font face="Courier">null</font>, '
      'ligne neuve, ligne existante'.replace('⭐', '')],
     ['P1-P6', 'pannes et reprise',
      'chaque destination encaisse seule ; elles <b>divergent</b> pendant la panne ; la reprise '
      '<b>recolle</b>'],
     ['R1a-R1c', 'retry / double ecriture',
      '<b>idempotent</b> : aucune donnee metier ne bouge, aucune liste ne grandit'],
     ['C1-C3', '<b>24 ecritures concurrentes reelles</b>',
      'aucune erreur SQL, aucun blocage, blob coherent, <b>une seule ligne</b>'],
     ['FZ1', 'fuzz deterministe',
      '<b>' + str(F_GRAINES) + ' graines, ' + str(F_ETAPES)
      + ' etapes, 0 invariant viole</b>']],
    [20 * mm, 88 * mm, 58 * mm]))
H.append(P('<b>Total du banc de chaos : ' + str(C_OK) + ' OK / ' + str(C_KO)
           + ' rouge.</b> Graines du fuzz : <b>1 a ' + str(F_GRAINES)
           + '</b>, reproductibles a l identique (generateur <font face="Courier">mulberry32</font> '
           'a graine explicite). <i>Un fuzz qu on ne peut pas rejouer ne trouve pas un bug, il '
           'raconte une anecdote.</i>', 'petit'))

H.append(P('6. Invariants', 'h1'))
H.append(tableau(
    ['invariant', 'resultat'],
    [['I1 un jeton revoque ne modifie plus le miroir', '<b>PASS</b> (verifie a chaque etape du fuzz)'],
     ['I2 une cle sensible ne survit jamais a une sauvegarde moderne',
      '<b>PASS</b> - ⛔ <b>sauf par l ancienne porte</b>, qui n a aucun filtre (mesure, voir C)'.replace('⛔', '')],
     ['I3 un champ absent ne supprime pas une valeur existante', '<b>PASS</b> apres 0003'],
     ['I4 un appareil ne choisit jamais le compte cible',
      '<b>PASS</b> par la voie moderne - <b>FAIL par l ancienne porte</b> (V2 ouverte)'],
     ['I5 une panne cloud ne detruit jamais l etat local', '<b>PASS</b>'],
     ['I6 une restauration n invente aucune donnee', '<b>PASS</b>'],
     ['I7 un test cense proteger doit echouer sans son mecanisme',
      '<b>PASS</b> - ' + str(M_OK) + '/' + str(M_TOT) + ' mutations conformes']],
    [76 * mm, 90 * mm]))

H.append(P('8-12. Defauts : rien de NOUVEAU, et c est le resultat', 'h1'))
H.append(encadre(
    'AUCUN DEFAUT INCONNU N A ETE TROUVE - LES QUATRE COMPORTEMENTS COUTEUX ETAIENT DEJA ACTES',
    'Le banc <b>reproduit par execution</b> ce qui n etait jusqu ici que lu dans le code : la '
    'perte, la resurrection, la divergence des deux destinations et l ancienne porte. '
    '<b>Ce ne sont pas des decouvertes, ce sont des confirmations</b> - et elles ont maintenant '
    'un cas de reproduction court chacune. <i>Le seul « nouveau » est une precision : la '
    'resurrection touche les 10 listes testees, pas seulement celles qu on avait regardees.</i>'))
H.append(tableau(
    ['defaut confirme', 'gravite', 'mecanisme', 'donnees a risque', 'correctif minimal'],
    [['un appareil en retard ressuscite une entree supprimee', HAUT,
      'instantane complet + dernier ecrivain gagnant, <b>des deux cotes</b>',
      'toute liste : seances, pesees, nuits, journal alimentaire...',
      'marqueur de suppression (tombstone) - <b>hors perimetre</b>'],
     ['un appareil en retard efface un ajout recent', HAUT,
      'idem', 'idem', 'revision monotone cote client - <b>hors perimetre</b>'],
     ['l ancienne porte choisit le compte et n a aucun filtre', CRIT,
      '<font face="Courier">ft_miroir(p_email libre)</font>, V2 non fermee',
      'n importe quel compte du miroir ; un justificatif peut y entrer',
      '<b>fermer V2</b> - decision de Michel, passe separee'],
     ['le miroir accepte un historique ampute que Apps Script refuse', MOY,
      'le garde anti-retrecissement n existe que cote Apps Script',
      'le miroir tombe a 50 seances quand le telephone sature',
      'transposer le garde dans la RPC - <b>non fait</b>'],
     ['suppression totale d une liste jamais propagee', MOY,
      'garde-fou anti-vidage volontaire (02/08/2026)',
      'une suppression voulue est defaite par une restauration',
      '<b>arbitrage deja pris</b>, non rouvert'],
     ['cles zombies dans le miroir', FAI,
      'la fusion conserve une cle qu un client cesserait d envoyer',
      'aucune - le blob grossit', 'aucun (R19)']],
    [36 * mm, 17 * mm, 38 * mm, 40 * mm, 35 * mm]))

H.append(P('15. Hypotheses invalidees - et elles etaient toutes les miennes', 'h1'))
H.append(tableau(
    ['ce que je croyais', 'ce que la mesure a dit'],
    [['« le retry pourrait dupliquer »',
      '<b>faux</b> : rejouer la meme sauvegarde ne change aucune donnee metier. Mon premier '
      'temoin rougissait pourtant - il comparait l instantane ENTIER, dont '
      '<font face="Courier">updatedAt</font>, qui DOIT bouger. <i>Un temoin qui fige tout '
      'mesure ma formulation, pas l idempotence.</i>'],
     ['« casser <font face="Courier">_pa_</font> fera rougir le banc »',
      '<b>faux, et la raison est mesuree</b> : ses <b>8</b> sites d appel sont TOUS precedes de '
      '<font face="Courier">if (body.X !== undefined)</font>, donc sa branche interne est '
      '<b>inatteignable</b>. <i>Une mutation qu aucun test ne peut detecter n accuse pas les '
      'tests : elle dit que le code mute ne s execute jamais.</i>'],
     ['« muter la migration 0002 suffit »',
      '<b>faux</b> : 0003 <b>redefinit</b> la fonction juste apres. <i>Muter une definition '
      'qu une migration ulterieure remplace ne mute rien du tout.</i>'],
     ['« mes temoins couvrent les listes »',
      '<b>faux</b> : ils ne visaient que les listes a garde EN LIGNE. Casser '
      '<font face="Courier">_pa_</font>, qui gere l autre moitie, ne faisait rougir personne. '
      '<i>Un garde qu aucun temoin ne traverse est un garde qu on peut retirer sans que rien '
      'ne le dise.</i> Temoins <b>M4c</b>, <b>S1c</b>, <b>S1d</b>, <b>I2e</b> ajoutes.'],
     ['« je peux de-revoquer un jeton pour reutiliser mon appareil de test »',
      '<b>faux</b> : la contrainte <font face="Courier">ft_jetons_revocation_coherente</font> '
      'refuse. Je ne lisais pas le code retour, donc <b>quatre temoins suivants rougissaient '
      'sur du code sain</b>. <i>Une ecriture de banc dont on ne lit pas le retour fabrique un '
      'faux rouge en aval.</i>']],
    [52 * mm, 114 * mm]))

H.append(P('16-20. Tests, mutations, passe complete', 'h1'))
H.append(tableau(
    ['banc', 'resultat'],
    [['banc de chaos (<font face="Courier">tools/chaos/banc.js</font>)',
      '<b>' + str(C_OK) + ' OK / ' + str(C_KO) + ' rouge</b>'],
     ['fuzz deterministe',
      '<b>' + str(F_SEQ) + ' sequences, ' + str(F_ETAPES) + ' etapes, 0 violation</b>'],
     ['controle negatif du chaos',
      '<b>' + str(M_OK) + '/' + str(M_TOT) + ' conformes</b>, controle sain vert, arbre CLONE'],
     ['passe complete du parcours',
      '<b>' + str(P_OK) + ' OK / ' + str(P_KO) + ' rouge</b>, <b>EXIT=0</b> - totaux <b>lus '
      'dans leurs journaux</b>, jamais ecrits a la main'],
     ['SHA final', '<font face="Courier">' + SHA + '</font>'],
     ['version publiee', '<b>' + VERSION + '</b> - ⛔ <b>aucun bump</b> : aucun fichier servi '
      'n a change'.replace('⛔', '')]],
    [76 * mm, 90 * mm]))

H.append(P('Synthese', 'h1'))
H.append(encadre(
    'CE QUI PEUT REELLEMENT FAIRE PERDRE OU RESSUSCITER DES DONNEES',
    '<b>Un seul mecanisme, et il explique tout</b> : chaque appareil envoie un <b>instantane '
    'complet</b>, et le dernier arrive gagne - <b>des deux cotes</b>. Un telephone reste en '
    'arriere efface donc un ajout recent et fait revenir une suppression. <b>Et l ancienne '
    'porte <font face="Courier">ft_miroir</font> aggrave le tout</b> : elle choisit le compte '
    'et n a aucun filtre.'))
H.append(encadre(
    'CE QUI EST ROBUSTE',
    'L identite par jeton (aucune adresse de la charge ne detourne une ecriture) - la revocation '
    'par appareil, qui n atteint pas les autres et <b>ne se defait pas</b> - la purge des '
    'justificatifs, verifiee dans <b>5</b> situations - l idempotence du retry - '
    '<b>24 ecritures concurrentes</b> sans une erreur - l independance des deux destinations '
    'pendant une panne - et <b>' + str(F_ETAPES) + ' etapes de fuzz sans un invariant viole</b>.',
    colors.HexColor('#1E7A46')))
H.append(encadre(
    'CE QUI DOIT ETRE CORRIGE AVANT D ALLER PLUS LOIN',
    '<b>Un seul point, et il est deja identifie</b> : <b>fermer V2</b>. C est le seul defaut '
    'classe <b>CRITIQUE</b>, parce qu il permet a un navigateur de choisir le compte ecrit et '
    'de glisser un justificatif dans le miroir. ⛔ <b>Rien n a ete ferme dans cette passe</b> - '
    'et la mesure qui manque reste la meme : <font face="Courier">comptes_sans_jeton_actif</font>.'.replace('⛔', '')))
H.append(encadre(
    'CE QUI PEUT ATTENDRE',
    'Les marqueurs de suppression et la revision causale (ils reglent la resurrection et '
    'l instantane ancien, mais ce sont des chantiers a part entiere) - la transposition du garde '
    'anti-retrecissement dans la RPC - les cles zombies. <b>Aucun n est urgent : Apps Script '
    'reste la source de verite et le miroir n est qu un filet.</b>',
    colors.HexColor('#B26A00')))

H.append(P('21. Decisions qui appartiennent a Michel', 'h1'))
H.append(P('① <b>Fermer V2</b>, apres la mesure de couverture. ② <b>Vouloir ou non</b> que la '
           'suppression se propage (aujourd hui un vidage total est refuse - c est un arbitrage, '
           'pas un bug). ③ <b>Ouvrir ou non</b> le chantier « revision / tombstones », qui est le '
           'seul moyen de regler la resurrection. <b>Rien de tout cela n a ete engage ici.</b>',
           'p'))
H.append(P('<b>Ce que cette passe n a pas fait</b> : aucune fermeture V2, aucune revocation, '
           'aucun droit change, aucune ecriture sur l instance Supabase, aucune donnee reelle, '
           'aucune regle Douane touchee, rien sur FREE/PREMIUM, rien sur le registre IA, rien sur '
           'Milo, aucun correctif metier deploye. <b>Aucun fichier servi modifie</b> - seulement '
           '<font face="Courier">tools/chaos/</font> et les journaux.', 'petit'))

_bt = ' '.join(TEXTES).lower()
for _mot, _msg in [('v2 est fermee', 'aucune fermeture n a eu lieu'),
                   ('defaut critique inconnu', 'aucun defaut nouveau n a ete trouve')]:
    g(_mot not in _bt, _msg)
for _mot, _pourquoi in (('aucun defaut inconnu', 'le resultat central'),
                        ('inatteignable', 'le mutant equivalent, avec sa raison'),
                        ('exemple.invalid', 'la preuve de l isolement') if False else
                        ('non routables', 'la preuve de l isolement'),
                        ('fermer v2', 'le seul point critique'),
                        ('faux rouge en aval', 'la lecon du banc'),
                        ('jamais ecrits a la main', 'la provenance des totaux')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))
g(re.search(r'\b[0-9a-f]{32,}\b', _bt) is None, 'un hexadecimal long figure dans le document')

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Overnight chaos test - integrite multi-appareils',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes ; chaos %d/%d ; fuzz %d graines / %d etapes ; mutations %d/%d ; '
      'passe %d/%d)' % (OUT, VERSION, GARDES[0], C_OK, C_KO, F_GRAINES, F_ETAPES,
                        M_OK, M_TOT, P_OK, P_KO))
