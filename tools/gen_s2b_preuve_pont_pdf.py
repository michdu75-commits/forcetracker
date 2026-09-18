#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2-B — PREUVE DU PONT AVANT FERMETURE V2 (18/09/2026).

CE QUE CE DOSSIER FAIT, ET CE QU'IL NE FAIT PAS. Michel demande de transformer la deduction
« le pont a necessairement ete emprunte » en preuve materielle datee, PAR LECTURE SEULE. La
lecture elle-meme ne peut pas etre executee d'ici, et ce fichier le dit avec sa cause
technique precise plutot qu'avec « je ne peux pas » (regle d'or #16). Il prepare donc la
requete, la valide contre le SCHEMA REEL, et classe chaque element en PROUVE / DEDUIT /
NON PROUVE.

[!!] LA GARDE CENTRALE EST CELLE DU SCHEMA. Ce dossier publie une requete SQL que Michel va
     executer. Si une colonne avait ete renommee, il collerait une requete qui echoue et
     perdrait son temps a chercher pourquoi. Le generateur EXTRAIT les noms de colonnes de la
     migration versionnee et refuse de produire si la requete publiee en nomme une qui
     n'existe pas. >> *Une requete qu'on publie sans la confronter au schema est une
     supposition deguisee en instruction.*

[!!] ET LA SECONDE GARDE EST CELLE DU SECRET : le document ne doit porter ni jeton brut, ni
     hache complet, ni cle. Un controle balaie le rendu a la recherche d'un hexadecimal long.

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
    SCRATCH, 'S2B-PREUVE-DU-PONT-AVANT-FERMETURE-V2-18-09-2026.pdf')

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_commentaires_js(src):
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


def sans_commentaires_sql(src):
    return re.sub(r'(?m)--[^\n]*', '', src)


SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, ''])[1]
g(re.match(r'^ft-v\d+$', VERSION), 'la version servie n a pas pu etre lue dans sw.js')

W = sans_commentaires_js(lire('worker.js'))
SB = sans_commentaires_js(lire('supabase.js'))
MIG1 = lire('supabase/migrations/20260917_0001_ft_jetons.sql')
MIG2 = lire('supabase/migrations/20260917_0002_rpc_s2b.sql')
CTRL = lire('supabase/verifications/20260917_phase1_controle.sql')
MIG1S = sans_commentaires_sql(MIG1)

# ══ 1. LE SCHEMA REEL — la requete publiee doit s y conformer, colonne par colonne ══════
_bloc = re.search(r'create table if not exists public\.ft_jetons\s*\((.*?)\n\);', MIG1S, re.S)
g(_bloc is not None, 'la table ft_jetons est introuvable : le schema ne peut pas etre verifie')
COLONNES = set(re.findall(r'^\s*([a-z_]+)\s+(?:text|timestamptz|boolean)\b',
                          _bloc.group(1), re.M))
for _c in ('hachage', 'compte', 'cree_le', 'revoque', 'appareil'):
    g(_c in COLONNES,
      'la colonne « %s » n existe pas dans ft_jetons : la requete publiee echouerait' % _c)

# ══ 2. POURQUOI LA LECTURE NE PEUT PAS SE FAIRE D ICI — la cause est DANS LE SCHEMA ═════
# ⭐⭐ Ce n'est pas une limite de mon conteneur, c'est une propriete qu'on a construite
#    expres : la table est retiree a TOUS les roles de l'API, service_role compris. Aucun
#    chemin applicatif ne peut la lire — seul le proprietaire, donc l'editeur SQL.
for _role in ('public', 'anon', 'authenticated', 'service_role'):
    g('revoke all on table public.ft_jetons from ' + _role in MIG1S,
      'le role « %s » n est plus prive de lecture sur ft_jetons : l argument central du '
      'dossier (« seul le proprietaire lit ») tombe' % _role)
g('enable row level security' in MIG1S.lower(),
  'la securite au niveau ligne n est plus activee sur ft_jetons')
# ⛔ Et aucune cle ne traine dans le depot : un test du parcours l interdit deja.
g(not re.search(r'(sb_secret_|service_role_key|eyJhbGciOi)', lire('supabase.js') + W),
  'une cle de service semble presente dans le code servi')

# ══ 3. CE QUI REND L INSCRIPTION DEJA PROUVEE, SANS LIRE LA TABLE ═══════════════════════
# Une ecriture « voie : directe » ne peut pas aboutir si le hache est inconnu : la fonction
# leve alors « identite ». Donc les trois succes prouvent que la ligne EXISTE. Ce que la
# lecture ajoute, c'est sa DATE.
_FN_ENR = (re.search(
    r'create or replace function public\.ft_enregistrer_instantane\b.*?\n\$\$;', MIG2, re.S)
    or [''])[0]
g(re.search(r"if\s+v_compte\s+is\s+null\s+then\s*\n\s*raise exception 'identite'", _FN_ENR)
  is not None,
  'l ecriture n exige plus un hache CONNU : « inscription prouvee par les ecritures » tombe')

# ══ 4. LA CHAINE DES 4 FAITS (inchangee, recomptee) ═════════════════════════════════════
g(re.search(r"\( ?7, 'lignes dans le registre',[^)]*'0'\)", CTRL) is not None,
  'le controle de phase 1 n attend plus 0 ligne dans le registre : le fait (1) tombe')
g('cree_le     timestamptz not null default now()' in MIG1,
  'la colonne cree_le a disparu : la trace du pont ne serait plus datee')
g('on conflict (hachage) do nothing' in MIG2,
  'l insertion n est plus « do nothing » : cree_le pourrait etre ecrasee, la date mentirait')
g(W.count("_sbAppel(env, 'ft_inscrire_jeton'") == 1,
  'ft_inscrire_jeton est appelee ailleurs qu une seule fois : le fait (3) tombe')
_iPont = W.find('_identiteIA(brut, env)')
_iIns = W.find("_sbAppel(env, 'ft_inscrire_jeton'")
g(0 < _iPont < _iIns, 'l inscription ne suit plus le pont : le fait (4) tombe')

# ══ 5. L ETAT DU CHANTIER — V2 ouverte, aucun repli automatique ═════════════════════════
g('p_email: email' in SB, 'V2 serait fermee : ce dossier decrit un etat intermediaire')
g("const SB_VOIE = 'worker'" in SB, 'la voie servie n est plus le Worker : le dossier ment')
# ⛔ LE POINT QUI PROTEGE LES COMPTES : pas de retour a p_email quand le jeton manque.
_FN_ENV = (re.search(r'function sbEnvoyer\(payload\)\s*\{.*?\n\}', SB, re.S) or [''])[0]
g(_FN_ENV and 'p_email' not in _FN_ENV,
  'sbEnvoyer retombe sur p_email : la porte derobee que S2-B ferme serait rouverte')

# ══ 6. LA REQUETE PUBLIEE — construite ICI, donc verifiable ═════════════════════════════
SQL_LECTURE = """select
  left(j.hachage, 8) || '...'                         as hachage_tronque,
  left(j.compte, 2)  || '***'                         as compte_masque,
  coalesce(nullif(j.appareil, ''), '(sans libelle)')  as appareil,
  j.cree_le at time zone 'Europe/Paris'               as inscrit_le_paris,
  j.revoque,
  case when (j.cree_le at time zone 'Europe/Paris')
            between timestamp '2026-09-18 13:59:51'
                and timestamp '2026-09-18 14:15:43'
       then 'DANS LA FENETRE'
       else 'hors fenetre' end                        as fenetre_s2b
from public.ft_jetons j
order by j.cree_le;"""

SQL_COUVERTURE = """select
  (select count(*) from public.ft_jetons  where not revoque) as appareils_inscrits,
  (select count(*) from public.ft_comptes)                   as comptes_dans_le_miroir;"""

for _col in re.findall(r'\bj\.([a-z_]+)\b', SQL_LECTURE):
    g(_col in COLONNES,
      'la requete publiee nomme « j.%s », qui n existe pas dans ft_jetons' % _col)
g('ft_jetons' in SQL_COUVERTURE and 'ft_comptes' in SQL_COUVERTURE,
  'la requete de couverture ne compare plus les deux tables')
# ⛔ AUCUNE ECRITURE DANS CE QU ON PUBLIE : un seul mot suffirait a rendre l instruction fausse.
for _interdit in ('insert', 'update', 'delete', 'drop', 'alter', 'revoke', 'grant', 'truncate'):
    g(_interdit not in (SQL_LECTURE + SQL_COUVERTURE).lower(),
      'la requete publiee contient « %s » : elle ne serait plus en lecture seule' % _interdit)

DIRECTES = '14:15:43, 14:19:47 et 14:20:20'
DERNIER_ECHEC = '13:59:51'

# ── mise en page ───────────────────────────────────────────────────────────────────────
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')

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
                           fontSize=6.8, leading=8.5, textColor=ENCRE, spaceAfter=2),
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


PR = '<font color="#1E7A46"><b>PROUVE</b></font>'
DE = '<font color="#B26A00"><b>DEDUIT</b></font>'
NP = '<font color="#C0392B"><b>NON PROUVE</b></font>'

H = []
H.append(P('S2-B - preuve du pont avant fermeture V2', 'titre'))
H.append(P('Force Tracker - 18 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>lecture seule ; V2 non fermee ; Douane non touchee</b>',
           'sous'))

# ── 1 ──────────────────────────────────────────────────────────────────────────────────
H.append(P('1. La requete - prete, valide contre le schema reel, NON EXECUTEE', 'h1'))
H.append(encadre(
    'ELLE NE PEUT PAS ETRE EXECUTEE D ICI, ET LA CAUSE N EST PAS MON CONTENEUR',
    'La migration 0001 retire la lecture de <font face="Courier">ft_jetons</font> a '
    '<b>tous</b> les roles de l API - <font face="Courier">public</font>, '
    '<font face="Courier">anon</font>, <font face="Courier">authenticated</font> et meme '
    '<font face="Courier">service_role</font> - puis active la securite au niveau ligne. '
    '<b>Aucun chemin applicatif ne peut lire cette table</b>, ni le Worker, ni l application, '
    'ni un outil muni de la cle de service. Seul le <b>proprietaire</b> y accede, c est-a-dire '
    'l editeur SQL du tableau de bord. Ce n est pas une gene : c est exactement la propriete '
    'qu on a construite - et <b>toute voie que je fabriquerais pour lire d ici serait un trou '
    'dans ce que S2-B vient de fermer</b>.'))
H.append(P('Deux autres blocages, mesures et non supposes : le reseau du conteneur refuse '
           'Supabase comme Apps Script (<font face="Courier">CONNECT tunnel failed, response '
           '403</font>, seul GitHub est autorise), et <b>aucune cle de service n existe dans '
           'le depot</b> - elle vit dans l environnement du Worker, et un temoin du parcours '
           'interdit deja qu elle y entre.', 'p'))
H.append(P('La requete de Michel est <b>reprise telle quelle</b> : ses cinq colonnes existent '
           'dans la table versionnee. Une seule chose est ajoutee, et elle n expose rien de '
           'neuf - une colonne qui <b>rend le verdict elle-meme</b>, pour que la lecture ne '
           'depende pas d une comparaison d horaires faite a l oeil.', 'p'))
H.append(bloc_code(SQL_LECTURE))
H.append(P('Les heures de la fenetre sont celles <b>lues a l ecran du telephone</b>, donc en '
           'heure de Paris - d ou la conversion <font face="Courier">at time zone</font> des '
           'deux cotes de la comparaison. <i>Melanger un horodatage universel et une heure '
           'd ecran est exactement le defaut corrige la veille dans le libelle des '
           'sauvegardes.</i>', 'petit'))

# ── 2 ──────────────────────────────────────────────────────────────────────────────────
H.append(P('2. Resultat masque', 'h1'))
H.append(encadre(
    'EN ATTENTE DE LA LECTURE - AUCUN RESULTAT INVENTE',
    'Cette section reste <b>vide par construction</b>. Le dossier ne porte aucune ligne de '
    'registre, aucune date d inscription, aucun hache : ils n ont pas ete lus. '
    '<i>Un dossier qui remplirait cette case par deduction serait exactement ce que Michel a '
    'interdit.</i> Il suffit de coller le resultat ici apres execution.'))
H.append(P('Ce qu il faudra en retenir, et rien d autre : le <b>nombre de lignes</b>, la '
           'valeur de <font face="Courier">fenetre_s2b</font>, et le drapeau '
           '<font face="Courier">revoque</font>. Le hache tronque et le compte masque servent '
           'uniquement a distinguer deux lignes entre elles.', 'p'))

# ── 3 ──────────────────────────────────────────────────────────────────────────────────
H.append(P('3. Chronologie reelle deja mesuree', 'h1'))
H.append(tableau(
    ['heure (Paris)', 'evenement', 'source'],
    [['13:40:24', 'echec de sauvegarde miroir', 'carte Admin, capture'],
     ['13:58:54', 'echec de sauvegarde miroir', 'carte Admin, capture'],
     [DERNIER_ECHEC, '<b>dernier echec</b>', 'carte Admin, capture'],
     ['14:08', 'debut de la sauvegarde nocturne Apps Script',
      'nom du fichier produit - <i>8 min APRES le dernier echec</i>'],
     ['14:15:43', '<b>premiere ecriture <font face="Courier">voie : directe</font></b>',
      'carte Admin, capture'],
     ['14:19:47', 'ecriture <font face="Courier">voie : directe</font>', 'carte Admin'],
     ['14:20:20', 'ecriture <font face="Courier">voie : directe</font>', 'carte Admin']],
    [24 * mm, 82 * mm, 60 * mm]))
H.append(P('La fenetre utile est donc <b>' + DERNIER_ECHEC + ' - 14:15:43</b>. Si '
           '<font face="Courier">cree_le</font> y tombe, le passage par le pont cesse d etre '
           'une deduction pour devenir un fait date.', 'p'))

# ── 4 ──────────────────────────────────────────────────────────────────────────────────
H.append(P('4. Ce qui est PROUVE - y compris une chose qui ne demandait pas la lecture', 'h1'))
H.append(encadre(
    'L INSCRIPTION DU HACHE EST DEJA PROUVEE PAR LES ECRITURES ELLES-MEMES',
    'C est le point que la lecture n avait pas besoin d etablir. La fonction d ecriture '
    '<b>leve « identite » quand le hache est inconnu ou revoque</b> : une ecriture '
    '<font face="Courier">voie : directe</font> ne peut donc pas aboutir si la ligne n existe '
    'pas. <b>Les trois succes de 14:15 a 14:20 prouvent que la ligne EXISTE</b>, qu elle n est '
    'pas revoquee, et que le serveur a su designer un compte a partir d elle. '
    '<i>Ce que la lecture ajoute n est pas l existence : c est la DATE.</i>',
    colors.HexColor('#1E7A46')))
H.append(P('Et par le meme raisonnement, le <b>vrai jeton est present sur l iPhone</b> : sans '
           'jeton, <font face="Courier">sbEnvoyer</font> n envoie rien du tout - il n existe '
           '<b>aucun repli</b> vers l ancienne porte, ce qui est verifie dans le code servi.',
           'p'))

# ── 5 ──────────────────────────────────────────────────────────────────────────────────
H.append(P('5. Ce qui reste DEDUIT', 'h1'))
H.append(tableau(
    ['fait mesure', 'ou'],
    [['le registre etait <b>vide</b> avant la bascule',
      'controle de phase 1, ligne 7, attendu <font face="Courier">0</font>'],
     ['l ecriture exige un hache <b>connu</b>',
      'la branche <font face="Courier">v_compte is null</font> de la fonction'],
     ['<font face="Courier">ft_inscrire_jeton</font> est appelee <b>une seule fois</b> dans '
      'tout le depot', 'comptage dans <font face="Courier">worker.js</font>'],
     ['cet appel vit <b>uniquement apres</b> un passage reussi par le pont',
      'position mesuree dans le code servi']],
    [104 * mm, 62 * mm]))
H.append(P('Un passage par le pont <b>a donc necessairement eu lieu</b>. C est une '
           '<b>deduction par chainage</b>, pas une observation - et la distinction est '
           'conservee telle que Michel l a demandee.', 'p'))

# ── 6 ──────────────────────────────────────────────────────────────────────────────────
H.append(P('6. Ce qui reste NON PROUVE', 'h1'))
H.append(tableau(
    ['element', 'etat', 'pourquoi'],
    [['<font face="Courier">voie : pont</font> a l ecran', NP,
      '<b>jamais affiche</b> - et on ne provoquera pas un pont artificiel pour l obtenir'],
     ['date d inscription du hache', NP,
      'la lecture de <font face="Courier">cree_le</font> n a pas ete executee'],
     ['ecritures sur le <b>bon</b> compte', DE,
      'le compte est resolu par le serveur depuis le registre, donc il est juste par '
      'construction - mais <b>personne n a regarde</b> '
      '<font face="Courier">ft_comptes</font>'],
     ['couverture des <b>autres</b> appareils', NP,
      'on ignore combien de comptes ont deja une ligne au registre']],
    [46 * mm, 22 * mm, 98 * mm]))

# ── 7 ──────────────────────────────────────────────────────────────────────────────────
H.append(P('7. Verdict - peut-on preparer la fermeture de V2 ?', 'h1'))
H.append(tableau(
    ['element', 'etat'],
    [['route <font face="Courier">cloudSave</font> reelle', PR],
     ['vrai jeton present sur l iPhone', PR],
     ['premiere inscription du hache (<b>existence</b>)', PR],
     ['premiere inscription du hache (<b>date</b>)', NP],
     ['passage par le pont', DE],
     ['voie directe reelle', PR],
     ['ecritures sur le bon compte', DE],
     ['V2 encore ouverte', '<b>OUI</b>']],
    [124 * mm, 42 * mm]))
H.append(encadre(
    'PREPARER : OUI. FERMER : NON - ET LE MOTIF N EST PAS LA DATE DU PONT',
    'La date manquante est un <b>confort de preuve</b>, pas un risque : l existence de la '
    'ligne est deja prouvee par les trois ecritures. <b>Le vrai motif d attente est '
    'ailleurs</b>, et il n avait pas encore ete nomme : on ignore <b>combien d appareils ont '
    'deja une ligne au registre</b>. Un appareil reste en fenetre de transition - donc sans '
    'jeton - continue aujourd hui d ecrire par l ancienne porte ; le jour ou V2 se ferme, il '
    '<b>cesse silencieusement d alimenter le miroir</b>. '
    '<i>Aucune donnee ne serait perdue - Apps Script reste la source de verite et le miroir '
    'n est qu un filet - mais on perdrait le filet sans que personne le sache, ce qui est '
    'exactement la facon dont la sauvegarde nocturne est restee morte 36 jours.</i>'))
H.append(P('La mesure qui manque tient en une requete, elle aussi en lecture seule :', 'p'))
H.append(bloc_code(SQL_COUVERTURE))
H.append(P('Tant que ces deux nombres sont loin l un de l autre, fermer V2 revient a eteindre '
           'le filet de ceux qui n ont pas encore bascule. <b>C est une decision de Michel, '
           'pas une consequence technique</b> - et elle appartient a une passe separee.',
           'petit'))

# ── 8 ──────────────────────────────────────────────────────────────────────────────────
H.append(P('8. Ce que ce dossier ne fait pas', 'h1'))
H.append(P('<b>V2 non fermee.</b> Aucune revocation, aucune fermeture de RPC, aucun changement '
           'de droits, aucune suppression de l ancien chemin - '
           '<font face="Courier">sbMirror</font> et <font face="Courier">sbTest</font> restent '
           'en place, non references, et le retour arriere tient en une ligne '
           '(<font face="Courier">SB_VOIE</font>). Aucun jeton recree, aucun appareil '
           'reinitialise, aucun pont provoque artificiellement. <b>Aucune regle Douane '
           'touchee</b> : son verdict reste <b>continuer l observation</b>. Et la panne de '
           '14 h reste classee <b>sans cause prouvee et sans correlation temporelle</b> - elle '
           'ne se rouvre pas sans preuve nouvelle.', 'p'))

# ── controles de sortie ────────────────────────────────────────────────────────────────
_bt = ' '.join(TEXTES).lower()
_rendu = _bt + ' ' + ' '.join(CODES).lower()

for _mot, _msg in [
        ('v2 est fermee', 'le document annonce une fermeture qui n a pas eu lieu'),
        ('voie : pont observee', 'la mention n a jamais ete vue a l ecran'),
        ('regle inutile', 'une regle jamais declenchee n est pas declaree inutile'),
        ('la sauvegarde est responsable', 'aucune cause n est prouvee')]:
    g(_mot not in _bt, _msg)

for _mot, _pourquoi in (
        ('deduction par chainage', 'ce qui separe le deduit du prouve'),
        ('jamais affiche', 'la distinction demandee par Michel sur le pont'),
        ('continuer l observation', 'le verdict Douane, a conserver tel quel'),
        ('lecture seule', 'la nature de la passe'),
        ('preparer : oui', 'le verdict du dossier'),
        ('connect tunnel failed', 'la cause technique precise, jamais « je ne peux pas »')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))

# ⛔ AUCUN SECRET DANS LE RENDU : ni hache complet, ni jeton, ni cle.
g(re.search(r'\b[0-9a-f]{32,}\b', _rendu) is None,
  'un hexadecimal long figure dans le document : hache complet, jeton ou cle')

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-B - preuve du pont avant fermeture V2',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, %d colonnes lues dans la migration, V2 ouverte, '
      'requete NON executee)' % (OUT, VERSION, GARDES[0], len(COLONNES)))
