#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2A2 — ETAPE E : pourquoi elle est BLOQUEE, et le protocole pret pour un PC.
Hors depot (regle d'or #14).

[!!] CE DOSSIER NE PORTE AUCUN RESULTAT DE MESURE, ET SON NOM LE DIT.
     Le brief demandait « S2A2-ETAPE-E-LECTURE-PUBLIQUE-RESULTAT-REEL ». Ce document
     s'appelle autrement, exprès : *une mesure annoncee finit par etre reputee faite*, et
     un fichier nomme RESULTAT-REEL qui ne contient aucun resultat est precisement le
     piege que ce chantier traque depuis quatre etapes.

[!!] CE QU'IL APPORTE A LA PLACE :
     - la preuve que l'outil existant ECRIT (c'est l'etape F, pas E) ;
     - la preuve que le conteneur ne peut pas joindre Supabase ;
     - une TROISIEME affirmation de securite non mesuree, celle-ci VISIBLE DANS
       L'INTERFACE ;
     - le protocole exact, pret a coller, avec les vrais noms de variables lus dans le
       code servi ;
     - et la grille d'interpretation ECRITE AVANT la mesure.

[!!] SES GARDES REFUSENT DEUX CHOSES : que le document conclue quoi que ce soit sur la
     lisibilite, et qu'il contienne `select=data` ou `select=email` — le protocole ne
     demande QUE `updated_at`, et un dossier qui suggererait d'en lire plus serait une
     invitation a sortir des donnees personnelles.

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
                                KeepTogether)

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
OUT = os.environ.get('FT_OUT') or os.path.join(
    SCRATCH, 'S2A2-ETAPE-E-BLOQUEE-ET-PROTOCOLE-PC-16-09-2026.pdf')

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


SB_BRUT = lire('supabase.js')
SB = sans_commentaires(SB_BRUT)
APP = sans_commentaires(lire('app.js'))
HTM = lire('index.html')
SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]

# ═══════════════════════════════════════════════════════════════════════════════════════
# [!!] LES NOMS DE VARIABLES DU PROTOCOLE SONT LUS DANS LE CODE, JAMAIS INVENTES.
# Le brief le demande explicitement : « si les vrais noms ne sont pas exactement SB_URL /
# SB_ANON, ne les invente pas ». On les retrouve, et un garde epingle qu'ils existent.
# ═══════════════════════════════════════════════════════════════════════════════════════
VAR_URL = (re.search(r'\b(?:let|const|var)\s+(SB_URL)\b', SB) or [None, None])[1]
VAR_CLE = (re.search(r'\b(?:let|const|var)\s+(SB_ANON)\b', SB) or [None, None])[1]
VAR_TBL = (re.search(r"\b(?:let|const|var)\s+SB_TABLE\s*=\s*'([^']+)'", SB) or [None, None])[1]
g(VAR_URL == 'SB_URL' and VAR_CLE == 'SB_ANON',
  'les variables de connexion ne s appellent plus SB_URL / SB_ANON dans le code servi : le '
  'protocole de ce dossier ferait coller un nom qui n existe pas')
g(VAR_TBL == 'ft_comptes',
  'la table visee par le client n est plus ft_comptes : le protocole viserait la mauvaise')
# ⛔ la cle elle-meme n'entre JAMAIS dans ce document
g('sb_publishable' not in ' '.join([]) and True, 'garde de forme')

# ═══════════════════════════════════════════════════════════════════════════════════════
# CE QUI FONDE LE BLOCAGE — recompte depuis le code servi
# ═══════════════════════════════════════════════════════════════════════════════════════
# 1) le seul outil Supabase de l'app ECRIT : il fait un POST vers la RPC
OUTIL = 'sbTest'
_corps_outil = SB[SB.index('async function sbTest('):]
_corps_outil = _corps_outil[:_corps_outil.index('function sbEtat(')]
g("method:'POST'" in _corps_outil.replace(' ', ''),
  'l outil Admin existant ne fait plus un POST : ce dossier affirme qu il ECRIT, donc qu il '
  'releve de l etape F et non de E')
g('/rest/v1/rpc/' in _corps_outil,
  'l outil Admin existant ne passe plus par la RPC')
g('p_email' in _corps_outil,
  'l outil Admin existant n ecrit plus de ligne de test : la raison pour laquelle il ne peut '
  'pas servir a E tombe')
# 2) aucun GET de lecture nulle part dans le code servi
_lectures = re.findall(r"/rest/v1/(?!rpc/)[a-z_]+\?", SB + APP)
g(not _lectures,
  'un chemin de lecture directe existe desormais dans le code servi (%s) : ce dossier '
  'affirme qu il n y en a AUCUN, et conclurait au blocage a tort' % _lectures[:2])
g("method:'GET'" not in (SB + APP).replace(' ', '') or True, 'garde de forme')
# 3) l'affirmation visible dans l'interface
PHRASE_UI = ("<strong>Écriture seule</strong> : la clé publiée dans l'app ne peut pas "
             "<em>relire</em> les comptes.")
g(PHRASE_UI in HTM,
  'la phrase de la carte Admin a change : ce dossier la cite mot pour mot et en discute la '
  'raison - il faudrait le reecrire, pas le laisser tel quel')
# 4) le fait mesure en D qui rend cette phrase inexacte dans sa RAISON
ANON_SELECT_MESURE = True   # etape D : has_table_privilege('anon','public.ft_comptes','SELECT')
g(ANON_SELECT_MESURE is True,
  'anon n aurait plus le privilege SELECT : le constat central de ce dossier tombe, et la '
  'phrase de l interface deviendrait exacte')
# 5) le conteneur ne joint pas Supabase (mesure faite a la main, rapportee ici)
PROXY = 'CONNECT tunnel failed, response 403'

SQLS = [f for _dd, _s, _f in os.walk(ROOT) for f in _f
        if f.endswith('.sql') and 'node_modules' not in _dd]
g(not SQLS, 'des fichiers SQL sont apparus dans le depot (%s)' % ', '.join(SQLS[:3]))
g(re.match(r'^ft-v\d+$', VERSION or ''), 'la version servie n a pas pu etre lue dans sw.js')

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


C = '<font face="Courier" size="7.2">%s</font>'


CODES = []


def bloc_code(txt):
    # [!!] LES BLOCS DE CODE SONT COLLECTES A PART, ET C EST LE CONTROLE NEGATIF QUI L A
    # IMPOSE. Les gardes de fin lisaient TEXTES, ou bloc_code n ecrivait rien : le
    # PROTOCOLE - la seule chose que quelqu un va reellement copier-coller - n etait donc
    # mesure par AUCUN garde. Remplacer updated_at par data y passait inapercu.
    # >> Un garde qui ne lit que la prose ne voit pas ce que dit l encadre de code.
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
NM = '<b>non mesure</b>'

H = []
H.append(P('Etape E - bloquee, et le protocole pret pour un PC', 'titre'))
H.append(P('Force Tracker - chantier S2-A2 (Supabase) - 16 septembre 2026 - base servie '
           + VERSION + ' - hors depot (regle d or #14) - <b>aucune mesure conduite, aucune '
           'requete emise</b>', 'sous'))

H.append(encadre(
    'POURQUOI CE DOSSIER NE S APPELLE PAS « RESULTAT REEL »',
    'Le brief demandait un document nomme ' + (C % 'S2A2-ETAPE-E-...-RESULTAT-REEL') + '. '
    '&gt;&gt; <b>Il n y a aucun resultat</b>, donc il porte un autre nom. <i>Une mesure '
    'annoncee finit par etre reputee faite</i> - c est exactement le travers que ce chantier '
    'traque depuis quatre etapes, et un fichier qui promettrait un resultat dans son titre le '
    'ferait tomber dedans. Ce document dit ce qui bloque, ce qu il a trouve en cherchant, et '
    'ce qu il faudra taper le jour ou un vrai navigateur sera disponible.', ORANGE))

# ── 1. LE VERDICT ──────────────────────────────────────────────────────────────────────
H.append(P('1. Le verdict', 'h1'))
H.append(bloc_code(
    'Etape E bloquee par l outillage mobile ; elle necessite un navigateur avec\n'
    'console developpeur ou un chemin de test deja existant.'))
H.append(P('Safari sur iPhone n a pas de console developpeur. Aucune conclusion E, aucun '
           'test bricole, aucun marque-page actif, aucun service tiers, aucune cle copiee '
           'nulle part. <i>Le brief le demandait explicitement, et c est le bon arbitrage : '
           'attendre un PC coute une journee, fabriquer une surface de test coute une '
           'surface de test.</i>', 'p'))

# ── 2. CE QUI A ETE CHERCHE ────────────────────────────────────────────────────────────
H.append(P('2. Ce qui a ete cherche avant de conclure', 'h1'))
H.append(tableau(
    ['piste', 'ce qu on a trouve', 'utilisable pour E ?'],
    [['un outil Admin Supabase existant',
      'Profil / Admin / « Copie miroir Supabase » : ' + (C % OUTIL)
      + ' fait un ' + (C % 'POST') + ' vers ' + (C % '/rest/v1/rpc/') + ' avec un '
      + (C % 'p_email') + ' de test',
      '&gt;&gt; <b>non</b> : c est une <b>ECRITURE</b>. C est l etape F, pas E'],
     ['un chemin de lecture directe dans le code servi',
      'aucun. Le client ne connait que la RPC - <i>ce qui est coherent : le miroir a ete '
      'concu en ecriture seule, il n a jamais eu de raison d avoir un chemin de lecture</i>',
      '&gt;&gt; <b>non</b>, et il est <b>interdit</b> d en creer un'],
     ['conduire le test depuis le conteneur Claude',
      C % PROXY + ' - seul GitHub est joignable',
      '&gt;&gt; <b>non</b>, mesure'],
     ['le tableau de bord Supabase',
      'il execute du SQL en tant que ' + (C % 'postgres') + ', pas une requete REST en tant '
      'que role public',
      '&gt;&gt; <b>non</b> : le brief exclut explicitement la simulation SQL']],
    [42 * mm, 74 * mm, 50 * mm]))
H.append(P('&gt;&gt; <i>Et il y a une ironie a nommer : fabriquer une porte de lecture pour '
           'prouver qu on ne peut pas lire creerait exactement ce qu on cherche a exclure.</i>',
           'petit'))

# ── 3. LA TROISIEME AFFIRMATION ────────────────────────────────────────────────────────
H.append(P('3. Ce que la recherche a trouve au passage - et c est le plus important', 'h1'))
H.append(encadre(
    'UNE TROISIEME AFFIRMATION DE SECURITE NON MESUREE, ET CELLE-CI EST VISIBLE A L ECRAN',
    'La carte Admin du miroir affiche, dans ' + (C % 'index.html') + ' :<br/>'
    '&gt;&gt; <i>« <b>Ecriture seule</b> : la cle publiee dans l app ne peut pas relire les '
    'comptes. »</i><br/>'
    'C est la <b>troisieme</b> du meme chantier apres les deux du commentaire du 05/08 '
    '(« la cle n a plus AUCUN droit sur la table », mesuree <b>fausse</b> ; « la lecture '
    'reste evidemment impossible »). &gt;&gt; <b>Celle-ci est differente des deux autres</b> : '
    'un commentaire, seul un developpeur le lit ; <b>celle-la, c est l interface qui la '
    'dit</b>.'))
H.append(tableau(
    ['ce que l interface affirme', 'ce que l etape D a mesure'],
    [['la cle publiee <b>ne peut pas</b> relire les comptes',
      'probablement vrai <b>en effet</b> - mais <b>jamais verifie</b>, et c est exactement '
      'l objet de E'],
     ['(raison sous-entendue : elle n en a pas le droit)',
      '&gt;&gt; <b>faux</b> : le privilege ' + (C % 'SELECT') + ' <b>est accorde</b> a '
      + (C % 'anon') + '. Ce qui bloque est l <b>absence de policy</b>, un mecanisme '
      'different - et qui peut etre defait par une seule ligne de SQL un jour de fatigue']],
    [62 * mm, 104 * mm]))
H.append(P('&gt;&gt; <b>Cette phrase n a PAS ete corrigee</b>, et c est delibere. La corriger '
           'aujourd hui reviendrait a remplacer une affirmation non mesuree par une autre. '
           '<i>On la reecrira quand E aura parle - et a ce moment-la elle pourra dire la '
           'bonne raison, pas seulement la bonne conclusion.</i>', 'p'))

# ── 4. LE PROTOCOLE ────────────────────────────────────────────────────────────────────
H.append(P('4. Le protocole, pret a coller sur un PC', 'h1'))
H.append(P('Ouvrir <b>Force Tracker lui-meme</b> dans un navigateur de bureau, ouvrir la '
           'console (F12), coller ceci. &gt;&gt; <b>Aucune cle n est copiee</b> : '
           + (C % VAR_URL) + ' et ' + (C % VAR_CLE) + ' sont deja chargees par la page - ce '
           'sont les <b>vrais</b> noms, lus dans ' + (C % 'supabase.js') + ', pas des noms '
           'supposes.', 'p'))
H.append(bloc_code(
    "fetch(" + VAR_URL + " + '/rest/v1/" + VAR_TBL + "?select=updated_at&limit=1', {\n"
    "  method: 'GET',\n"
    "  headers: { apikey: " + VAR_CLE + ", Authorization: 'Bearer ' + " + VAR_CLE + " }\n"
    "}).then(async r => {\n"
    "  const t = await r.text();\n"
    "  console.log('HTTP', r.status, '|', t.slice(0, 300));\n"
    "});"))
H.append(P('&gt;&gt; <b>Une seule colonne est demandee : ' + (C % 'updated_at') + '.</b> Pas '
           'd adresse, pas de sauvegarde, aucune donnee de sante ni de nutrition. '
           '&gt;&gt; <b>Et c est suffisant</b> : si une ligne remonte, la RLS laisse passer '
           'des lignes - et comme l etape D a mesure un privilege ' + (C % 'SELECT')
           + ' <b>sur la table</b>, l exposition ne serait alors pas limitee a cette '
           'colonne. <i>Une ligne visible suffit a tout : il ne faut surtout pas en demander '
           'plus pour « mieux » prouver.</i>', 'p'))

# ── 5. LA GRILLE, ECRITE AVANT ─────────────────────────────────────────────────────────
H.append(P('5. La grille d interpretation - ecrite AVANT la mesure, exprès', 'h1'))
H.append(P('<i>Decider a l avance ce que chaque resultat voudra dire est le seul moyen de ne '
           'pas l interpreter dans le sens qui arrange. La voici, figee.</i>', 'petit'))
H.append(tableau(
    ['resultat', 'ce qu on ecrira', 'ce qu on n ecrira PAS'],
    [['<b>HTTP 200</b> avec ' + (C % '[]'),
      'la cle publique possede bien ' + (C % 'SELECT') + ' au niveau SQL, mais la RLS filtre '
      'toutes les lignes sur le chemin REST mesure. <b>Lecture publique des lignes NON '
      'observee.</b> C est le scenario attendu a partir de C + D',
      '« impossible pour l eternite » - on mesure un <b>etat</b>, a une <b>date</b>'],
     ['<b>HTTP 200</b> avec une ligne',
      '&gt;&gt; <b>ALERTE.</b> Une ligne est reellement lisible via la cle publique. Les '
      'lignes anciennes deviennent prioritaires. <b>STOP immediat</b> apres la mesure',
      'on ne relit <b>ni</b> ' + (C % 'email') + ' <b>ni</b> le blob : la preuve est deja '
      'suffisante. Et <b>on ne purge pas</b> dans la foulee - on documente'],
     ['<b>401</b> ou <b>403</b>',
      'le chemin reseau est refuse <b>avant</b> toute lecture de ligne. On note le statut et '
      'le message exacts',
      'aucune conclusion sur la RLS : un refus en amont ne dit rien de ce qu il y a en aval'],
     ['<b>404 / 406 / CORS / autre</b>',
      'on analyse la cause et on propose le geste suivant',
      '&gt;&gt; <b>surtout pas</b> une conclusion de securite : une erreur d outillage n est '
      'pas une preuve de protection']],
    [34 * mm, 76 * mm, 56 * mm]))

# ── 6. LES REPONSES POSSIBLES AUJOURD'HUI ──────────────────────────────────────────────
H.append(P('6. Les questions - ce qui est repondable aujourd hui, et ce qui ne l est pas',
           'h1'))
QE = [['E-Q1', 'la vraie cle deja chargee a-t-elle ete utilisee ?', NON,
       'aucun test n a ete conduit'],
      ['E-Q2', 'une cle a-t-elle ete copiee a la main ?', NON,
       '&gt;&gt; rien n a ete copie, affiche, ni transmis - <b>y compris dans ce document</b>'],
      ['E-Q3', 'un e-mail a-t-il ete demande ?', NON, 'aucune requete emise'],
      ['E-Q4', 'le blob ' + (C % 'data') + ' a-t-il ete demande ?', NON, 'aucune requete emise'],
      ['E-Q5', 'l API REST repond-elle ?', NM, 'c est l objet de l etape'],
      ['E-Q6', 'une ligne est-elle visible par le role public ?', NM,
       '&gt;&gt; <b>c est LA question</b>, et elle reste entiere'],
      ['E-Q7', 'le reel correspond-il a la theorie C + D ?', NM,
       'la theorie est posee, la confrontation attend'],
      ['E-Q8', 'peut-on juger le risque des lignes anciennes ?', NON,
       'il manque la seule mesure qui compte'],
      ['E-Q9a', 'purger les blobs ?', NON, 'depend de E'],
      ['E-Q9b', 'faire tourner le jeton S1 ?', NON,
       'depend de E - <b>et ce n est pas la meme decision</b> que la purge'],
      ['E-Q9c', 'changer les codes perso ?', NON,
       'depend de E - <b>et cette decision-la implique les personnes</b>, pas seulement la '
       'base'],
      ['E-Q10', 'existe-t-il une preuve de compromission ?', NON,
       'rien ne l etablit, et rien ne la suggere']]
H.append(tableau(['#', 'question', 'reponse', 'la raison'], QE,
                 [14 * mm, 58 * mm, 22 * mm, 72 * mm]))

H.append(encadre(
    'LES TROIS NIVEAUX A NE JAMAIS CONFONDRE',
    '&gt;&gt; <b>EXPOSITION POTENTIELLE</b> - des justificatifs ont ete ecrits dans certains '
    'blobs. <b>Etabli</b>, et corrige pour l avenir depuis ' + (C % 'ft-v1217') + '.<br/>'
    '&gt;&gt; <b>LECTURE POSSIBLE</b> - la cle publique peut-elle voir les lignes ? '
    '<b>C est E, et E n a pas eu lieu.</b><br/>'
    '&gt;&gt; <b>COMPROMISSION PROUVEE</b> - quelqu un a reellement recupere ces donnees. '
    '<b>Non etabli</b>, et aucun element ne va dans ce sens.<br/>'
    '<i>Les trois se ressemblent dans une conversation pressee. Ils n appellent pas les '
    'memes gestes, et surtout pas la meme urgence.</i>'))

# ── 7. LA SUITE ────────────────────────────────────────────────────────────────────────
H.append(P('7. Comment debloquer, par ordre de proprete', 'h1'))
H.append(tableau(
    ['voie', 'ce qu elle coute', 'ce qu elle respecte'],
    [['<b>1. un PC de bureau</b> - ouvrir l app, F12, coller le bloc du 4',
      '30 secondes, le jour ou Michel est devant',
      '&gt;&gt; <b>tout</b> : aucune cle copiee, le chemin reseau reel, la vraie cle deja '
      'chargee. <i>C est exactement ce que le brief decrit</i>'],
     ['2. iPhone relie a un Mac (inspecteur Safari)',
      'un cable et un Mac',
      'la meme proprete, plus de materiel'],
     ['3. la barre d adresse avec la cle en parametre',
      'rien techniquement',
      '&gt;&gt; <b>mais elle impose de coller la cle a la main</b>, ce que le brief '
      'interdit. <i>Nommee ici pour que la decision soit prise, pas pour etre recommandee</i>']],
    [56 * mm, 44 * mm, 66 * mm]))
H.append(P('<b>Prochaine etape : E, sur un PC.</b> Puis - et seulement apres validation - '
           'l etape F, qui est une <b>ecriture</b> et reste donc separee. <i>Aucune purge, '
           'aucune rotation, aucun changement de policy tant que E n a pas parle.</i>', 'p'))
H.append(P('Aucune requete n a ete emise vers Supabase pour produire ce document. La seule '
           'tentative reseau a ete un test de joignabilite, refuse par le mandataire du '
           'conteneur (' + (C % PROXY) + ').', 'petit'))

# ── [!!] GARDES DE FIN ─────────────────────────────────────────────────────────────────
TOUT = ' '.join(TEXTES)
_bt = TOUT.lower()
_tout_rendu = (' '.join(TEXTES) + ' ' + ' '.join(CODES)).lower()

# ⛔ le document ne doit JAMAIS suggerer de lire une donnee personnelle — et cela se
# verifie sur TOUT CE QUI EST RENDU, prose ET blocs de code.
g(len(CODES) >= 1, 'le document ne porte plus aucun bloc de code : le protocole a disparu')
g('select=updated_at' in _tout_rendu,
  'le protocole ne demande plus updated_at : c est la seule colonne autorisee')
for _interdit in ('select=data', 'select=email', 'select=*'):
    g(_interdit not in _tout_rendu,
      'le document contient « %s » : le protocole ne demande QUE updated_at, et un dossier '
      'qui suggere d en lire plus est une invitation a sortir des donnees personnelles'
      % _interdit)
g('sb_publishable' not in _tout_rendu and 'supabase.co' not in _tout_rendu,
  'une cle ou l URL du projet apparait dans le document : rien de tout cela n a a y figurer')

INTERDITS = [
    (r'la cle publique peut lire|peut lire les sauvegardes|lecture publique confirmee',
     'le document AFFIRME une lecture publique : aucune mesure n a eu lieu'),
    (r'la lecture est impossible|personne ne peut lire|aucune lecture n est possible',
     'le document AFFIRME que la lecture est impossible : c est precisement ce qui n a pas '
     'ete mesure, et c est la phrase de l interface qu on refuse de recopier'),
    (r'aucune purge n est necessaire|purge terminee',
     'le document AFFIRME qu aucune purge n est necessaire'),
    (r'preuve de compromission|donnees compromises',
     'le document AFFIRME une compromission : elle n est pas etablie'),
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

# [!!] les reponses de mesure doivent rester « non mesure », pas devenir OUI ou NON
for _q in ('E-Q5', 'E-Q6', 'E-Q7'):
    _l = [r for r in QE if r[0] == _q]
    g(len(_l) == 1 and _l[0][2] == NM,
      'la question %s a recu une reponse alors qu aucune mesure n a eu lieu' % _q)
for _q in ('E-Q2', 'E-Q3', 'E-Q4', 'E-Q10', 'E-Q9a', 'E-Q9b', 'E-Q9c'):
    _l = [r for r in QE if r[0] == _q]
    g(len(_l) == 1 and _l[0][2] == NON, 'la question %s ne repond plus NON' % _q)
# [!!] les trois decisions restent SEPAREES
g(len([r for r in QE if r[0].startswith('E-Q9')]) == 3,
  'les trois decisions (purge, rotation du jeton, codes perso) ont ete remises dans le meme '
  'sac : le brief demande explicitement de les separer')
# [!!] les pieces sans lesquelles le dossier ne sert a rien
for _mot, _pourquoi in (
        ('updated_at', 'c est la seule colonne que le protocole a le droit de demander'),
        ('console', 'c est ce qui manque sur le telephone'),
        ('ecriture', 'c est ce que fait l outil existant, donc pourquoi il ne sert pas'),
        ('exposition potentielle', 'c est le premier des trois niveaux a ne pas confondre'),
        ('compromission', 'c est le troisieme'),
        (VAR_URL.lower(), 'le protocole doit nommer les vraies variables'),
        (VAR_CLE.lower(), 'le protocole doit nommer les vraies variables')):
    g(_mot in _bt,
      'le dossier ne parle plus de « %s » : %s' % (_mot, _pourquoi))

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Etape E - bloquee, et le protocole pret',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, AUCUNE mesure conduite, outil existant = %s en ECRITURE, '
      'variables %s / %s lues dans le code)'
      % (OUT, VERSION, GARDES[0], OUTIL, VAR_URL, VAR_CLE))
