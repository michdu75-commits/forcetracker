#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2-B — COUVERTURE AVANT FERMETURE V2 : LA MESURE REELLE (19/09/2026).

[!!] CES CHIFFRES NE VIENNENT PAS DU CODE, ILS VIENNENT DU TABLEAU DE BORD. Je ne peux donc
     pas les recompter. Ce que le generateur PEUT faire — et fait — c'est verifier leur
     COHERENCE INTERNE : si les huit agregats et la distribution ne s'accordent pas entre eux,
     la mesure est douteuse et on ne publie pas de verdict dessus.
     >> *Un chiffre qu'on ne peut pas recompter se verifie au moins contre ses voisins.*

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
    SCRATCH, 'S2B-COUVERTURE-AVANT-FERMETURE-V2-19-09-2026.pdf')

# ── LA MESURE, telle que le tableau de bord l'a rendue le 19/09/2026 ────────────────────
M = {
    'comptes_total': 10,
    'comptes_avec_jeton_actif': 1,
    'comptes_sans_jeton_actif': 9,
    'jetons_actifs_total': 1,
    'comptes_multi_appareils': 0,
    'jetons_orphelins': 0,
    'comptes_seulement_revoques': 0,
    'comptes_en_double_de_casse': 0,
}
DISTRIB = [(1, 1)]          # (nb_appareils, nb_comptes)

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", lire('sw.js')) or [None, ''])[1]
g(re.match(r'^ft-v\d+$', VERSION), 'la version servie n a pas pu etre lue dans sw.js')

# ══ LA COHERENCE INTERNE DE LA MESURE ══════════════════════════════════════════════════
g(M['comptes_avec_jeton_actif'] + M['comptes_sans_jeton_actif'] == M['comptes_total'],
  'couverts + non couverts != total : la mesure ne tient pas debout')
g(M['comptes_multi_appareils'] <= M['comptes_avec_jeton_actif'],
  'plus de comptes multi-appareils que de comptes couverts : impossible')
g(M['jetons_actifs_total'] >= M['comptes_avec_jeton_actif'],
  'moins de jetons actifs que de comptes couverts : impossible (chacun en a au moins un)')
g(sum(n for _, n in DISTRIB) == M['comptes_avec_jeton_actif'] + 0,
  'la distribution ne totalise pas le nombre de comptes couverts')
g(sum(a * n for a, n in DISTRIB) == M['jetons_actifs_total'],
  'la distribution ne totalise pas le nombre de jetons actifs')
g(len([1 for a, n in DISTRIB if a > 1 and n]) == M['comptes_multi_appareils'],
  'la distribution contredit le compteur multi-appareils')
g(M['comptes_sans_jeton_actif'] > 0,
  'ce dossier decrit le cas B (couverture incomplete) : il ne doit pas etre produit a 0')

# ══ LES FAITS DU DEPOT QUI DONNENT LEUR SENS AUX CHIFFRES ══════════════════════════════
SB = lire('supabase.js')
SETUP = lire('setup.js')
g("const SB_VOIE = 'worker'" in SB, 'la voie servie n est plus le Worker')
g('p_email: email' in SB, 'V2 serait deja fermee : ce dossier decrit un etat ouvert')
# ⭐ LE FAIT QUI DECIDE DE TOUT : aucun repli vers l ancienne porte quand le jeton manque.
_FN = (re.search(r'function sbEnvoyer\(payload\)\s*\{.*?\n\}', SB, re.S) or [''])[0]
g(_FN and 'p_email' not in _FN,
  'sbEnvoyer retombe sur p_email : le raisonnement sur les 9 comptes serait faux')
g('sbEnvoyer(_corpsSync)' in SETUP, 'le client n appelle plus la voie moderne')

BASCULE = '18/09/2026 11:13 UTC'
MIROIR = '04/08/2026'

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
                         fontSize=10.4, leading=12.6, textColor=ROUGE,
                         spaceBefore=9, spaceAfter=4),
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


SUITE = """select
  count(*) filter (where c.updated_at >= timestamptz '2026-09-18 11:13:07+00')
       as ecrit_APRES_la_bascule_sans_jeton,   -- ancien client : le risque reel
  count(*) filter (where c.updated_at <  timestamptz '2026-09-18 11:13:07+00'
                     and c.updated_at >= now() - interval '30 days')
       as pas_revenu_depuis_la_bascule,
  count(*) filter (where c.updated_at <  now() - interval '30 days')
       as dormant_plus_de_30_jours,
  min(c.updated_at)::date as plus_ancienne, max(c.updated_at)::date as plus_recente
from public.ft_comptes c
where not exists (select 1 from public.ft_jetons j
                   where j.compte = c.email and not j.revoque);"""

H = []
H.append(P('S2-B - couverture avant fermeture V2 : la mesure reelle', 'titre'))
H.append(P('Force Tracker - 19 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>mesure seule ; V2 non fermee ; rien modifie</b>', 'sous'))

H.append(P('1-3. La mesure', 'h1'))
H.append(tableau(
    ['agregat', 'valeur', 'lecture'],
    [['<font face="Courier">comptes_total</font>', '<b>10</b>',
      'lignes du <b>miroir</b> - ce n est PAS le nombre d utilisateurs du produit'],
     ['<font face="Courier">comptes_avec_jeton_actif</font>', '<b>1</b>',
      'le telephone de Michel, celui dont la voie directe a ete prouvee le 18/09'],
     ['<font face="Courier">comptes_sans_jeton_actif</font>',
      '<font color="#C0392B"><b>9</b></font>', '<b>LE CHIFFRE QUI DECIDE</b>'],
     ['<font face="Courier">jetons_actifs_total</font>', '<b>1</b>',
      'un seul appareil inscrit dans tout le registre'],
     ['<font face="Courier">comptes_multi_appareils</font>', '0', 'coherent : 1 jeton'],
     ['<font face="Courier">jetons_orphelins</font>', '0', 'aucune ligne orpheline'],
     ['<font face="Courier">comptes_seulement_revoques</font>', '0', 'aucune revocation'],
     ['<font face="Courier">comptes_en_double_de_casse</font>', '0',
      '⭐ la normalisation des adresses tient des deux cotes'.replace('⭐', '')]],
    [56 * mm, 18 * mm, 92 * mm]))
H.append(P('<b>Distribution :</b> 1 appareil actif -&gt; 1 compte. Rien d autre. '
           '<i>Les cinq controles de coherence interne passent : couverts + non couverts = '
           'total, la distribution totalise bien 1 compte et 1 jeton, et aucun compteur n en '
           'contredit un autre.</i>', 'petit'))

H.append(P('4. Anomalies', 'h1'))
H.append(P('<b>Aucune.</b> Les quatre compteurs d anomalie sont a <b>0</b> : pas d orphelin, '
           'pas de double de casse, pas de compte a jetons uniquement revoques, pas '
           'd incoherence multi-appareils. <b>La faible couverture n est pas une anomalie, '
           'c est un etat de remplissage</b> - le registre se remplit appareil par appareil, '
           'a la premiere sauvegarde qui passe par le pont.', 'p'))

H.append(P('5. Verdict', 'h1'))
H.append(encadre(
    'COUVERTURE COMPTES : INCOMPLETE (1 sur 10) - FERMETURE V2 : NON PREPARABLE',
    'La regle etait posee d avance : <font face="Courier">comptes_sans_jeton_actif = 9</font>, '
    'donc <b>cas B</b>. <b>On ne ferme rien, et on ne prepare rien non plus.</b> '
    '<i>La regle n a pas ete interpretee pour arriver a cette conclusion : elle a ete '
    'appliquee.</i>'))
H.append(encadre(
    'CE QUE CES 9 COMPTES SONT VRAIMENT - ET POURQUOI ON NE PEUT PAS ENCORE LE DIRE',
    'Ils se repartissent en <b>trois familles que ces chiffres ne distinguent pas</b> : '
    '<b>(a)</b> un appareil qui a un jeton mais n a pas encore sauvegarde depuis la bascule du '
    + BASCULE + ' - <b>il s inscrira tout seul a sa prochaine sauvegarde, fermer V2 ne lui '
    'ferait rien</b> ; <b>(b)</b> un appareil dont l application en cache est <b>anterieure</b> '
    'a la bascule et passe donc encore par l ancienne porte - <b>c est la seule famille a '
    'risque</b> ; <b>(c)</b> un compte dormant qui ne reviendra pas. '
    '⭐ <b>Le raisonnement tient a un fait verifie dans le code servi</b> : depuis la bascule, '
    'un appareil <b>sans</b> jeton n ecrit <b>rien</b> dans le miroir - il n existe <b>aucun '
    'repli</b> vers <font face="Courier">p_email</font>. Donc une ligne ecrite <b>apres</b> la '
    'bascule <b>sans</b> jeton ne peut venir que d un ancien client.'.replace('⭐', '&gt;&gt;')))

H.append(P('6. Ce qui reste a faire - une seule requete, en lecture seule', 'h1'))
H.append(P('Elle separe les trois familles <b>sans exposer une seule adresse</b>, en se servant '
           'de la date de derniere ecriture et de l heure exacte de la bascule :', 'p'))
H.append(bloc_code(SUITE))
H.append(P('<b>La colonne qui compte est la premiere.</b> A <b>0</b>, aucun ancien client '
           'n ecrit plus : les 9 sont des dormants ou des appareils qui n ont pas encore '
           'resauvegarde, et <b>fermer V2 ne casse rien pour personne</b> - la couverture '
           'restera « incomplete » sur le papier, mais le risque sera nul. <b>Au-dessus de '
           '0</b>, chaque unite est un appareil qui perdrait son miroir en silence le jour de '
           'la fermeture.', 'p'))
H.append(P('<i>Borne honnete : le denominateur est le MIROIR, pas le produit. '
           '<font face="Courier">ft_comptes</font> ne porte que les comptes ayant sauvegarde '
           'depuis le ' + MIROIR + ', jour ou le miroir a ete branche. Le nombre reel '
           'd utilisateurs vit dans Apps Script, et il n est pas mesure ici.</i>', 'petit'))

H.append(P('Ce que cette passe n a pas fait', 'h1'))
H.append(P('<b>Aucune modification.</b> V2 non fermee, <font face="Courier">ft_miroir</font> '
           'intacte, aucun droit change, <font face="Courier">ft_jetons</font> non touchee, '
           'aucun appareil revoque, <b>Douane non touchee</b>, rien sur Nutrition, rien sur le '
           'registre IA, aucun chaos test, aucune passe complete. <b>Aucun fichier servi '
           'modifie, aucun bump.</b>', 'petit'))

_bt = ' '.join(TEXTES).lower()
for _mot, _msg in [('v2 est fermee', 'aucune fermeture n a eu lieu'),
                   ('couverture complete', 'la couverture est incomplete')]:
    g(_mot not in _bt, _msg)
for _mot, _pourquoi in (('incomplete', 'le verdict'),
                        ('non preparable', 'la consequence du cas B'),
                        ('aucun repli', 'le fait qui soutient le raisonnement'),
                        ('le denominateur est le miroir', 'la borne honnete'),
                        ('trois familles', 'ce qui reste a distinguer')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))
g('@' not in (_bt + ' '.join(CODES)), 'une adresse figure dans le document')

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-B - couverture avant fermeture V2',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, cas B : %d/%d comptes couverts)'
      % (OUT, VERSION, GARDES[0], M['comptes_avec_jeton_actif'], M['comptes_total']))
