#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2A2 — COMPTAGE des authCode reellement poses. Hors depot (regle d'or #14).

[!!] CE DOSSIER FERME LA DERNIERE AMBIGUITE DE CONTENU.
     Hier : 7 lignes portaient la CLE `authCode`, sans qu'on sache combien portaient une
     VALEUR. Aujourd'hui : 2 valeurs reelles, 5 chaines vides. 2 + 5 = 7 — le comptage
     d'hier se recoupe exactement.

[!!] ET UNE LIGNE DE TEST EXISTE, CE QUI CHANGE LE STATUT DE L'ETAPE F.
     Le bouton Admin ecrit une adresse ARBITRAIRE codee en dur, avec la cle publique, par
     le vrai chemin REST. Sa ligne est la. >> Les quatre elements que le brief demandait
     d'analyser avant de conclure (le code de sbTest, l'adresse, le chemin, la reponse
     attendue) sont tous verifiables dans le depot, et ce generateur les verifie.
     ⛔ Mais ce qui est demontre est la CREATION d'une ligne pour une adresse tierce, PAS
     l'ecrasement d'une ligne existante appartenant a quelqu'un d'autre.

[!!] ET LE PIEGE RESTE LE MEME : 2 codes reels ne rendent RIEN obligatoire. Aucune lecture
     publique n'est observee (etape E), aucune compromission n'est prouvee. Ce que 2 change,
     c'est le COUT d'en parler : deux personnes, pas une annonce.

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
    SCRATCH, 'S2A2-COMPTAGE-AUTHCODE-REELLEMENT-POSES-17-09-2026.pdf')

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
R = {'codes_reellement_poses': 2, 'authcode_vides': 5, 'lignes_de_test': 1, 'total': 10}
# mesures precedentes
HIER = {'cle_authcode': 7, 'jeton': 0, 'total': 10, 'sans_cle': 3,
        'anciennes': 8, 'recentes': 2, 'declencheurs': 0}
E_BRUT = 'HTTP 200 | []'
EXPO_CODE_DEPUIS = '2026-08-04'
FENETRE_JETON = '1h29'
PREDICTION = '0 a 2, tres probablement 1'

# ── LE RECOUPEMENT AVEC LA MESURE DE LA VEILLE ─────────────────────────────────────────
g(R['codes_reellement_poses'] + R['authcode_vides'] == HIER['cle_authcode'],
  'les deux comptages ne se recoupent plus : %d + %d = %d, alors que la veille mesurait %d '
  'lignes portant la cle'
  % (R['codes_reellement_poses'], R['authcode_vides'],
     R['codes_reellement_poses'] + R['authcode_vides'], HIER['cle_authcode']))
g(R['total'] == HIER['total'],
  'le total a change entre les deux mesures (%d puis %d) : une ligne a ete creee ou '
  'supprimee entre-temps, et les deux comptages ne decrivent plus le meme etat'
  % (HIER['total'], R['total']))
g(R['codes_reellement_poses'] <= R['total'], 'plus de codes que de lignes')
REELS = R['codes_reellement_poses']
g(REELS > 0,
  'plus aucun code reel : ce dossier decrit l inverse, et sa conclusion sur le nettoyage '
  'changerait de nature')
# l'hypothese de la veille : 2 lignes reecrites + 1 ligne de test = 3 sans cle
g(HIER['recentes'] + R['lignes_de_test'] == HIER['sans_cle'],
  'l hypothese chiffree de la veille ne tient plus : %d reecrites + %d de test devraient '
  'faire les %d lignes sans cle'
  % (HIER['recentes'], R['lignes_de_test'], HIER['sans_cle']))
LIGNE_TEST = R['lignes_de_test'] >= 1
g(LIGNE_TEST,
  'aucune ligne de test : ce dossier en tire le statut de l etape F, il faudrait le '
  'reecrire')

# ── LES QUATRE ELEMENTS QUE LE BRIEF EXIGE AVANT DE CONCLURE SUR F ────────────────────
_co = SB[SB.index('async function sbTest('):]
_co = _co[:_co.index('function sbEtat(')]
_plat = _co.replace(' ', '').replace('\n', '')
F_ADRESSE = "p_email:'test@forcetracker.test'" in _plat      # 1) l'adresse, arbitraire
F_CHEMIN = "/rest/v1/rpc/" in _co                            # 2) le chemin reseau reel
F_CLE = "apikey" in _co and "SB_ANON" in _co                 # 3) la cle publique
F_REPONSE = "r.ok" in _co and "HTTP" in _co                  # 4) la reponse est verifiee
g(F_ADRESSE, 'le bouton Admin n ecrit plus une adresse codee en dur : l analyse de F de ce '
             'dossier repose dessus')
g(F_CHEMIN, 'le bouton Admin ne passe plus par le chemin REST reel')
g(F_CLE, 'le bouton Admin n emploie plus la cle publique')
g(F_REPONSE, 'le bouton Admin ne verifie plus la reponse : on ne saurait pas si l ecriture '
             'a abouti')
F_ELEMENTS = sum([F_ADRESSE, F_CHEMIN, F_CLE, F_REPONSE])
g(F_ELEMENTS == 4, 'les quatre elements d analyse de F ne sont plus tous verifiables')
# la cle de test qui a servi a compter
g("p_data:{test:true" in _plat,
  'le blob de test ne porte plus la cle « test » : c est elle qui a ete comptee')

# ── LA NUANCE DE LA VEILLE, TOUJOURS LUE DANS LE CODE ─────────────────────────────────
g(bool(re.search(r"function _authCode\(\)\s*\{[^}]*getItem\('ft4_authcode'\)\s*\|\|\s*''",
                 STATE)),
  '_authCode() ne rend plus une chaine vide par defaut : l explication des %d cles vides de '
  'ce dossier tombe' % R['authcode_vides'])
g('function _sbSansJustificatifs(' in SB, 'le filet de S2-A a disparu')
g('p_email: email' in SB, 'le client n envoie plus un p_email libre : V2 serait deja fermee')
g(HIER['declencheurs'] == 0,
  'des declencheurs existeraient : le nettoyage cible toucherait updated_at')
g(HIER['jeton'] == 0, 'le jeton serait de retour dans un blob')
g(re.match(r'^ft-v\d+$', VERSION or ''), 'la version servie n a pas pu etre lue dans sw.js')
# ⭐ GARDE RETOURNEE LE 17/09/2026 (R30), PAS EFFACEE. Elle disait « aucun fichier SQL dans
#    le depot » — vrai tant que le schema Supabase etait cree a la main, et c'etait justement
#    la dette que les dossiers d'audit nommaient. S2-B ouvre `supabase/migrations/` : le SQL
#    versionne y est desormais LEGITIME. L'invariant reel n'a pas disparu, il s'est precise —
#    *aucun SQL EGARE hors du dossier versionne*. Une garde qu'on efface parce qu'elle gene
#    est une garde qu'on a contournee.
SQLS = [os.path.join(_dd, f) for _dd, _s, _f in os.walk(ROOT) for f in _f
        if f.endswith('.sql') and 'node_modules' not in _dd
        and 'supabase' + os.sep not in _dd]
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

H = []
H.append(P('Combien de codes personnels subsistent reellement', 'titre'))
H.append(P('Force Tracker - chantier S2-A2 (Supabase) - 17 septembre 2026 - base servie '
           + VERSION + ' - hors depot (regle d or #14) - lecture seule, aucune valeur '
           'affichee, aucune mutation', 'sous'))

H.append(encadre(
    'LE RESULTAT, ET IL FERME LA DERNIERE AMBIGUITE DE CONTENU',
    '&gt;&gt; <b>' + str(REELS) + ' codes reellement poses</b>, <b>'
    + str(R['authcode_vides']) + ' chaines vides</b>, <b>' + str(R['lignes_de_test'])
    + ' ligne de test</b>, sur <b>' + str(R['total']) + '</b> lignes.<br/>'
    '&gt;&gt; <b>' + str(REELS) + ' + ' + str(R['authcode_vides']) + ' = '
    + str(HIER['cle_authcode']) + '</b> : le comptage d hier se recoupe <b>exactement</b>. '
    '<i>Deux mesures independantes, prises a un jour d intervalle, qui tombent d accord - '
    'c est la meilleure garantie qu on puisse avoir sans relire les donnees.</i><br/>'
    '&gt;&gt; Et <b>rien ne devient obligatoire</b> : aucune lecture publique n est observee '
    '(' + (C % E_BRUT) + '), aucune compromission n est prouvee.', VERT))

# ── 1. LE BRUT ─────────────────────────────────────────────────────────────────────────
H.append(P('1. La requete et son resultat', 'h1'))
H.append(bloc_code(
    "select\n"
    "  count(*) filter (where coalesce(data->>'authCode','') <> '')\n"
    "    as codes_reellement_poses,\n"
    "  count(*) filter (where jsonb_exists(data, 'authCode')\n"
    "                     and coalesce(data->>'authCode','') = '')\n"
    "    as authcode_vides,\n"
    "  count(*) filter (where jsonb_exists(data, 'test')) as lignes_de_test,\n"
    "  count(*) as total\n"
    "from public.ft_comptes;\n"
    "\n"
    "codes_reellement_poses | authcode_vides | lignes_de_test | total\n"
    "-----------------------+----------------+----------------+------\n"
    "%22d | %14d | %14d | %5d"
    % (REELS, R['authcode_vides'], R['lignes_de_test'], R['total'])))
H.append(P('La requete compare des valeurs au <b>vide</b> et teste des <b>presences de '
           'cle</b> : elle rend quatre nombres. <b>Aucun code, aucun jeton, aucune adresse, '
           'aucun blob n est sorti de la base</b> - ni pour cette mesure, ni pour les '
           'precedentes.', 'petit'))

# ── 2. LA LECTURE ──────────────────────────────────────────────────────────────────────
H.append(P('2. Ce que chaque nombre veut dire', 'h1'))
H.append(tableau(
    ['nombre', 'lecture', 'ce qu il ferme'],
    [['<b>' + str(REELS) + '</b> codes reels',
      'deux blobs courants portent une valeur <b>non vide</b> dans ' + (C % 'authCode'),
      '&gt;&gt; la fourchette « entre 0 et ' + str(HIER['cle_authcode']) + ' » du dossier '
      'd hier devient un <b>nombre</b>'],
     ['<b>' + str(R['authcode_vides']) + '</b> chaines vides',
      'la cle etait ecrite meme sans code, parce que ' + (C % '_authCode()') + ' rend une '
      'chaine vide par defaut',
      'confirme la nuance d hier : <b>' + str(HIER['cle_authcode']) + ' etait bien une borne '
      'haute</b>, et elle etait large'],
     ['<b>' + str(R['lignes_de_test']) + '</b> ligne de test',
      'le bouton Admin a bien ecrit sa ligne',
      '&gt;&gt; voir 4 : cela change le statut de l etape F'],
     ['<b>' + str(R['total']) + '</b> au total',
      'inchange depuis la veille',
      'les deux mesures decrivent <b>le meme etat</b> : rien n a bouge entre-temps']],
    [30 * mm, 64 * mm, 72 * mm]))

H.append(P('<i>Note de methode : j avais annonce <b>' + PREDICTION + '</b> avant la mesure. '
           'Le resultat est <b>' + str(REELS) + '</b> - dans la fourchette, mais a sa borne '
           'haute : mon raisonnement sur la rarete du geste etait bon, mon estimation du '
           'nombre etait basse. La prediction est notee parce qu elle etait ecrite avant, '
           'pas parce qu elle est juste.</i>', 'petit'))

# ── 3. L'HYPOTHESE DE LA VEILLE ────────────────────────────────────────────────────────
H.append(P('3. L addition de la veille tombe juste', 'h1'))
H.append(tableau(
    ['les ' + str(HIER['sans_cle']) + ' lignes sans cle ' + (C % 'authCode'),
     'annonce hier', 'mesure aujourd hui'],
    [['reecrites apres le correctif ' + (C % 'ft-v1217'), str(HIER['recentes']),
      str(HIER['recentes']) + ' (inchange)'],
     ['ecrite par le bouton Admin', '1 ?', '&gt;&gt; <b>' + str(R['lignes_de_test'])
      + '</b>, confirme'],
     ['<b>total</b>', '<b>' + str(HIER['recentes'] + 1) + '</b>',
      '<b>' + str(HIER['sans_cle']) + '</b>']],
    [76 * mm, 40 * mm, 50 * mm]))
H.append(P('&gt;&gt; <i>Une hypothese posee la veille sur une simple addition, et verifiee '
           'le lendemain par une mesure independante. C est peu de chose, mais c est '
           'exactement ce qui distingue une explication d une histoire plausible.</i>',
           'petit'))

H.append(PageBreak())

# ── 4. F ───────────────────────────────────────────────────────────────────────────────
H.append(P('4. L etape F - ce qui est desormais demontre, et ce qui ne l est pas', 'h1'))
H.append(P('Le brief demandait de ne pas transformer ' + (C % 'lignes_de_test = 1')
           + ' en preuve sans analyser <b>quatre</b> choses. Les voici, toutes verifiables '
           'dans le code servi :', 'p'))
H.append(tableau(
    ['element demande', 'ce que le code dit', 'verifie'],
    [['le code exact de ' + (C % 'sbTest'),
      'il fait un ' + (C % 'POST') + ' et rend le code HTTP', 'oui'],
     ['l adresse utilisee', '&gt;&gt; ' + (C % 'test@forcetracker.test') + ', <b>codee en '
      'dur</b> - ce n est <b>pas</b> celle de la personne connectee', 'oui'],
     ['le chemin reseau', C % '/rest/v1/rpc/' + ' avec la <b>cle publique</b> en '
      + (C % 'apikey') + ' et en ' + (C % 'Authorization'), 'oui'],
     ['la reponse attendue', 'la fonction verifie ' + (C % 'r.ok') + ' et affiche le code '
      'HTTP ; <b>la ligne existe dans la table</b>, donc l ecriture a abouti', 'oui']],
    [40 * mm, 106 * mm, 20 * mm]))
H.append(encadre(
    'CE QUI EST DEMONTRE, ET LA BORNE A NE PAS FRANCHIR',
    '&gt;&gt; <b>Demontre</b> : la cle publique, par le vrai chemin REST, a <b>cree une '
    'ligne pour une adresse qui n appartient a personne</b> et qui n est pas celle de '
    'l utilisateur connecte. Les quatre couches de V2 sont donc observees de bout en bout, '
    '<b>sans qu aucune ecriture nouvelle ait ete faite pour cet audit</b>.<br/>'
    '&gt;&gt; <b>Non demontre</b> : l <b>ecrasement</b> d une ligne <b>existante</b> '
    'appartenant a quelqu un d autre. La fonction traite les deux cas par le meme '
    + (C % 'on conflict') + ' et ne comporte aucun controle d identite (etape A), donc rien '
    'ne les distingue - <i>mais « rien ne les distingue » est un raisonnement, pas une '
    'observation</i>.<br/>'
    '&gt;&gt; <b>Conclusion : relancer F n apporterait rien</b> qu on n ait deja, et '
    'couterait une ligne de plus a nettoyer dans une base de production.'))

# ── 5. LES DECISIONS ───────────────────────────────────────────────────────────────────
H.append(P('5. Les decisions', 'h1'))
H.append(encadre(
    'NETTOYAGE CIBLE : IL PASSE D « HYGIENE » A « CONCRETEMENT JUSTIFIE »',
    'Hier, il retirait <b>peut-etre</b> quelque chose. Aujourd hui on sait qu il retirerait '
    '<b>' + str(REELS) + ' secrets reels</b>, et ' + str(R['authcode_vides']) + ' champs '
    'vides devenus inutiles.<br/>'
    '&gt;&gt; <b>Et il ne coute rien de fonctionnel</b> : le miroir est en ecriture seule, '
    '<b>personne ne relit ce champ</b>, et le code personnel reste stocke - <b>hache et '
    'sale</b> - la ou il sert vraiment. Retirer la copie en clair du miroir ne prive '
    'personne de rien.<br/>'
    '&gt;&gt; Aucun declencheur sur la table, donc ' + (C % 'updated_at') + ' ne bougerait '
    'pas et la mesure d age resterait valable. <b>Reste une mutation de production : elle '
    'attend une validation explicite.</b>'))
H.append(bloc_code(
    '-- MUTATION : ne PAS executer sans decision. Donnee pour etre relue.\n'
    "update public.ft_comptes\n"
    "   set data = data - 'token' - 'authCode'\n"
    " where data ?| array['token','authCode'];"))

H.append(encadre(
    'CHANGEMENT DES CODES : TOUJOURS NON - MAIS LE COUT D EN PARLER A CHANGE',
    '&gt;&gt; <b>Ce qui ne bouge pas</b> : aucune lecture publique n est observee, aucune '
    'compromission n est prouvee. <b>Rien ne rend le changement obligatoire.</b><br/>'
    '&gt;&gt; <b>Ce qui bouge</b> : on parlait d une population inconnue, entre 0 et '
    + str(HIER['cle_authcode']) + '. Ce sont <b>' + str(REELS) + ' personnes</b>. '
    '<i>La question n est donc plus « faut-il faire une annonce de securite ? » - a ce '
    'nombre-la, il n y a pas d annonce a faire, il y a au plus deux personnes a qui en '
    'dire un mot, sans drame et au rythme de Michel.</i><br/>'
    '&gt;&gt; <b>Et l une des deux est probablement Michel lui-meme</b>, qui a construit '
    'cette fonction : ce serait alors <b>une</b> personne. <i>Non verifie - il faudrait '
    'lire les adresses, et ce dossier ne le fera pas.</i><br/>'
    '&gt;&gt; <b>Recommandation : nettoyer d abord</b> (cela retire le secret), et laisser '
    'le mot eventuel a la main de Michel. Le nettoyage protege ; l annonce informe. '
    '<i>Ce ne sont pas les memes gestes et ils n ont pas la meme urgence.</i>', ORANGE))

H.append(tableau(
    ['sujet', 'etat', 'pourquoi'],
    [['purge de lignes entieres', '<b>non recommandee</b>',
      'elle detruirait une sauvegarde - inchange'],
     ['nettoyage cible des deux cles', '&gt;&gt; <b>recommande</b>',
      str(REELS) + ' secrets reels retires, cout fonctionnel nul, aucun obstacle technique'],
     ['rotation du jeton S1', '<b>sans objet</b>',
      str(HIER['jeton']) + ' ligne concernee - ferme depuis hier'],
     ['changement des codes personnels', '<b>non obligatoire</b>',
      'aucune lecture observee ; ' + str(REELS) + ' personnes concernees, donc un mot '
      'suffirait si Michel le souhaite'],
     ['etape F', '<b>inutile a relancer</b>',
      'son contenu probant est deja obtenu, sans ecriture nouvelle']],
    [50 * mm, 34 * mm, 82 * mm]))

# ── 6. CE QUE CA NE PROUVE PAS ─────────────────────────────────────────────────────────
H.append(P('6. Ce que ce comptage ne prouve pas', 'h1'))
H.append(encadre(
    'LES BORNES, ECRITES PLUTOT QUE SOUS-ENTENDUES',
    '&gt;&gt; « ces ' + str(REELS) + ' codes ont ete lus par quelqu un » - '
    '<b>non</b> : rien ne l etablit, et l etape E n observe aucune lecture publique.<br/>'
    '&gt;&gt; « aucune version ancienne n existe ailleurs » - les sauvegardes '
    'internes de la plateforme restent hors de portee de toute mesure faite ici.<br/>'
    '&gt;&gt; « la configuration restera ainsi » - ce qui bloque la lecture est '
    'l <b>absence</b> d une regle, et une absence se comble en une ligne.<br/>'
    '&gt;&gt; « V2 est fermee » - <b>non</b>, et c est le seul vrai trou qui '
    'reste.', ORANGE))

# ── 7. LES REPONSES ────────────────────────────────────────────────────────────────────
H.append(P('7. Les reponses', 'h1'))
QQ = [['Q1', 'combien de blobs portent un ' + (C % 'authCode') + ' non vide ?',
       '<b>' + str(REELS) + '</b>', 'sur ' + str(R['total']) + ' lignes'],
      ['Q2', 'combien ne portent qu une cle vide ?',
       '<b>' + str(R['authcode_vides']) + '</b>',
       str(REELS) + ' + ' + str(R['authcode_vides']) + ' = '
       + str(HIER['cle_authcode']) + ', le comptage de la veille'],
      ['Q3', 'existe-t-il une ligne de test Admin ?', OUI,
       '<b>' + str(R['lignes_de_test']) + '</b>, et l addition de la veille tombe juste'],
      ['Q4', 'une valeur sensible a-t-elle ete affichee ?', NON,
       'la requete compare au <b>vide</b> et teste des <b>presences</b>'],
      ['Q5', 'une mutation a-t-elle ete faite ?', NON, 'que des ' + (C % 'select')],
      ['Q6', 'le jeton S1 subsiste-t-il dans un blob ?', NON, 'mesure la veille'],
      ['Q7', 'un changement des codes est-il necessaire ?', NON,
       '&gt;&gt; aucune lecture observee, aucune compromission prouvee. <b>' + str(REELS)
       + ' personnes</b> concernees : un mot suffirait, si Michel le souhaite'],
      ['Q8', 'le nettoyage cible reste-t-il utile ?', OUI,
       '&gt;&gt; <b>plus qu hier</b> : il retire ' + str(REELS) + ' secrets reels, pour un '
       'cout fonctionnel nul'],
      ['Q9', 'F apporte-t-elle encore une information importante ?', NON,
       'les quatre elements sont deja verifies ; la relancer couterait une ligne a nettoyer'],
      ['Q10', 'V2 est-elle fermee ?', NON,
       'ce comptage porte sur le contenu ; V2 est un droit d ecriture']]
H.append(tableau(['#', 'question', 'reponse', 'la preuve'], QQ,
                 [12 * mm, 58 * mm, 20 * mm, 76 * mm]))

# ── 8. LA SUITE ────────────────────────────────────────────────────────────────────────
H.append(P('8. Ce qui reste pour fermer V2', 'h1'))
H.append(P('&gt;&gt; <b>L audit de contenu est termine.</b> On sait ce que la table '
           'contient, qui peut la lire, qui peut l ecrire, et pourquoi. <b>Il ne reste '
           'qu un sujet : V2 elle-meme</b> - ' + (C % 'p_email') + ' libre dans '
           + (C % 'ft_miroir') + ', aucune preuve d identite dans la fonction, '
           + (C % 'EXECUTE') + ' accorde a ' + (C % 'anon') + ', et un miroir reellement '
           'utilise par l application.', 'p'))
H.append(tableau(
    ['chantier', 'nature', 'etat'],
    [['<b>S2-B - fermer V2</b>', 'choix d architecture',
      '&gt;&gt; <b>le seul vrai trou restant</b>'],
     ['nettoyage cible', 'une mutation de production', 'recommande, attend validation'],
     ['retirer ' + (C % 'SELECT') + ' / ' + (C % 'DELETE') + ' / ' + (C % 'TRUNCATE')
      + ' a la cle publique', 'des ' + (C % 'REVOKE'), 'recommande, attend validation'],
     ['reformuler la phrase de la carte Admin', 'une ligne de texte',
      'proposee au dossier E, avec une <b>date</b>']],
    [72 * mm, 48 * mm, 46 * mm]))
H.append(P('Mesure conduite par Michel le 17/09/2026 dans le tableau de bord Supabase, en '
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
for m in re.finditer(r"data->>'[a-z]+'", _rendu, re.I):
    _fin = _rendu[m.end():m.end() + 30]
    g("<> ''" in _fin or "= ''" in _fin,
      'une expression extrait une valeur sans la comparer au vide')
# aucune adresse reelle ne doit figurer, sauf celle de test codee en dur
for m in re.finditer(r'[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}', _rendu):
    g(m.group(0) == 'test@forcetracker.test',
      'une adresse e-mail autre que celle de test apparait dans le document : %s'
      % m.group(0))

INTERDITS = [
    (r'v2 est fermee|v2 est corrigee', 'le document AFFIRME que V2 est fermee'),
    (r'ces codes ont ete lus|les codes ont ete compromis|compromission prouvee',
     'le document AFFIRME que les codes ont ete lus : rien ne l etablit'),
    (r'il faut changer les codes|le changement des codes est necessaire',
     'le document rend le changement des codes obligatoire : aucune lecture n est observee'),
    (r'il faut purger|la purge est necessaire',
     'le document RECOMMANDE une purge de lignes : elle detruirait une sauvegarde'),
    (r'l ecrasement d une ligne existante a ete observe|f a ete entierement prouvee',
     'le document AFFIRME avoir observe l ecrasement d une ligne existante : seule la '
     'CREATION pour une adresse tierce est demontree'),
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
            # [!!] « aucun », « rien » et « sans » NIENT tout autant que « ne ... pas ».
            # Leur absence de cette liste faisait rougir « aucune compromission prouvee »,
            # qui est pourtant exactement ce que le document doit dire.
            niee = re.search(r"\bne\b|\bn\b|\bpas\b|\bjamais\b|\bni\b|\bnon\b"
                             r"|\bsi\b|\baucune?\b|\brien\b|\bsans\b",
                             _b[deb:m.start()])
            g(interro or citee or niee is not None, _msg)

for _q, _att in (('Q4', NON), ('Q5', NON), ('Q6', NON), ('Q7', NON), ('Q8', OUI),
                 ('Q9', NON), ('Q10', NON), ('Q3', OUI)):
    _l = [r for r in QQ if r[0] == _q]
    g(len(_l) == 1 and _l[0][2] == _att,
      'la question %s ne repond plus %s' % (_q, re.sub('<[^>]+>', '', _att)))
g(len([r for r in QQ if r[0] in ('Q7', 'Q8', 'Q9', 'Q10')]) == 4,
  'les quatre decisions finales ont ete fondues')

for _mot, _pourquoi in (
        ('haché et salé'.replace('é', 'e').replace('â', 'a'),
         'c est pourquoi retirer la copie en clair ne prive personne de rien'),
        ('ecriture seule', 'c est pourquoi personne ne relit ce champ'),
        ('non demontre', 'c est la borne de ce que la ligne de test etablit'),
        ('borne haute', 'c est le statut qu avait le 7 de la veille'),
        ('sans objet', 'c est l etat de la rotation'),
        ('detruirait une sauvegarde', 'c est pourquoi la purge reste ecartee'),
        ('prediction', 'elle etait ecrite avant la mesure, et doit rester dite')):
    g(_mot in _bt, 'le dossier ne parle plus de « %s » : %s' % (_mot, _pourquoi))

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Comptage des authCode reellement poses',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, %d codes reels + %d vides = %d cles, %d ligne(s) de test, '
      'F inutile a relancer, V2 OUVERTE)'
      % (OUT, VERSION, GARDES[0], REELS, R['authcode_vides'], HIER['cle_authcode'],
         R['lignes_de_test']))
